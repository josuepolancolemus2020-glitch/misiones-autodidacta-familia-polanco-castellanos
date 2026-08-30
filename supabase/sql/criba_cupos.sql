-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de criba_prensa.sql.
-- IDEMPOTENTE. NO hace falta redesplegar nada: solo cambia la función.
-- ════════════════════════════════════════════════════════════════════
-- QUE LOS CUPOS SE CUMPLAN, Y QUE NO SOBRE SITIO VACÍO
-- ════════════════════════════════════════════════════════════════════
-- La edición del 30 de agosto de 2026 salió con «📰 Prensa 10 (cupo 9)».
-- Diez donde el tope eran nueve, y nadie lo había pedido.
--
-- POR QUÉ PASABA:
--   `criba_arma_edicion` se puede llamar varias veces el mismo día -y se
--   llama: el reloj de madrugada y luego una cosecha a mano-. Suma sobre
--   lo que ya hay. El tope POR MATERIA ya contaba lo puesto, con
--   `ya_por_grupo`. El de la SECCIÓN no: `n_clase` volvía a empezar en 1
--   en cada pasada, así que cada llamada regalaba nueve huecos más de
--   prensa. En una prueba con dos pasadas llegó a doce.
--
-- Y AL ARREGLARLO SALTÓ EL OTRO LADO:
--   si los cupos se cumplen a rajatabla y una sección viene seca -ese
--   día la ciencia solo tenía 17 materias con material, de 18 de cupo-,
--   la edición se queda en 29 y ese hueco no se llena con nada. Un hueco
--   vacío es una lectura desperdiciada.
--
--   Así que lo que se pasa del cupo YA NO SE DESCARTA: se manda al final
--   de la cola. Los cupos mandan mientras haya con qué llenarlos, y el
--   sobrante solo entra si de verdad sobra sitio. Es exactamente lo que
--   aquella edición hizo por accidente; ahora se hace a propósito, una
--   sola vez y sin pasarse de treinta.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regprocedure('public.criba_arma_edicion(date, integer)') is null then
    raise exception E'FALTA public.criba_arma_edicion.\n'
      'QUE HACER: corre antes criba_prensa.sql.';
  end if;
end $$;

create or replace function public.criba_arma_edicion(dia date default current_date,
                                                     tope integer default 30)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ya      integer;
  huecos  integer;
  puestos integer;

  /* ⚠️ EL MANDO, ahora en 1: cuántos artículos aporta cada materia
     DENTRO DE SU CLASE. Con 1, salen las 18 materias de ciencia y hasta
     18 de prensa. Subirlo a 2 da menos materias y más de cada una. */
  por_tema constant integer := 1;

  -- Cuánto ocupa cada sección del número. Suman 30.
  cupo_ciencia constant integer := 18;
  cupo_prensa  constant integer := 9;
  cupo_local   constant integer := 3;
begin
  dia := coalesce(dia, current_date);

  select count(*) into ya from public.criba_items where edicion = dia;
  huecos := greatest(tope - ya, 0);
  if huecos = 0 then return 0; end if;

  with unicos as (
    select distinct on (lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')))
           i.id, i.fuente_id, i.tema_id, i.publicado, i.recogido_at
      from public.criba_items i
     where i.edicion is null
     order by lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')), i.recogido_at
  ), con_clase as (
    select u.id, u.fuente_id, u.tema_id,
           coalesce(f.clase, 'local') as clase,
           coalesce(t.peso, f.peso) as peso,
           coalesce(u.publicado, u.recogido_at) as cuando
      from unicos u
      join public.criba_fuentes f on f.id = u.fuente_id
      left join public.criba_temas t on t.id = u.tema_id
     -- Ciencia y prensa exigen tema; lo local es su propio tema.
     where u.tema_id is not null or coalesce(f.clase, 'local') = 'local'
  ), ya_por_clase as (
    /* ⚠️ EL CUPO DE CADA SECCIÓN TAMBIÉN CUENTA LO QUE YA ESTÁ.
       Sin esto, armar la edición dos veces el mismo día deja que una
       sección se pase de su cupo: `n_clase` volvía a empezar en 1 en
       cada pasada. Pasó el 30 de agosto de 2026 -📰 Prensa 10 con cupo
       9- y en una prueba con dos pasadas llegó a 12. El tope por
       materia sí lo contaba, con `ya_por_grupo`; el de la sección se
       quedó sin su mitad. */
    select coalesce(f2.clase, 'local') as clase, count(*) as n
      from public.criba_items i2
      join public.criba_fuentes f2 on f2.id = i2.fuente_id
     where i2.edicion = dia
     group by 1
  ), ya_por_grupo as (
    -- Lo que ya está en la edición cuenta para el tope de su grupo.
    select coalesce(f2.clase, 'local') || ':' ||
           coalesce(i2.tema_id, 'fuente:' || i2.fuente_id) as grupo,
           count(*) as n
      from public.criba_items i2
      join public.criba_fuentes f2 on f2.id = i2.fuente_id
     where i2.edicion = dia
     group by 1
  ), reparte as (
    /* El tope por tema se cuenta DENTRO DE CADA CLASE: así el mismo
       tema puede dar un artículo académico y uno de prensa. */
    select c.*,
           coalesce(y.n, 0) + row_number() over (
             partition by c.clase || ':' || coalesce(c.tema_id, 'fuente:' || c.fuente_id)
             order by c.cuando desc) as n_tema
      from con_clase c
      left join ya_por_grupo y
             on y.grupo = c.clase || ':' || coalesce(c.tema_id, 'fuente:' || c.fuente_id)
  ), por_clase as (
    select r.*,
           coalesce(yc.n, 0) + row_number() over (
             partition by r.clase order by r.peso desc, r.cuando desc) as n_clase
      from reparte r
      left join ya_por_clase yc on yc.clase = r.clase
     where r.n_tema <= por_tema
  ), elegidos as (
    /* ⚠️ LO QUE SE PASA DEL CUPO NO SE TIRA: SE PONE AL FINAL DE LA COLA.
       Antes se descartaba, y entonces una sección seca dejaba huecos
       vacíos: con 17 materias de ciencia con material y 18 de cupo, la
       edición salía de 29 en vez de 30. Un hueco vacío es una lectura
       desperdiciada, y la regla 8 dice que el número se acaba, no que
       venga corto.
       Ordenando en vez de filtrar, los cupos mandan mientras haya con
       qué llenarlos y el sobrante solo entra si de verdad sobra sitio.
       Es lo que la edición del 30 de agosto de 2026 hizo por accidente
       -📰 10 con cupo 9- al armarse dos veces; ahora se hace a
       propósito, una sola vez y sin pasarse. */
    select id,
           row_number() over (
             order by case when (clase = 'consulta' and n_clase <= cupo_ciencia)
                             or (clase = 'prensa'   and n_clase <= cupo_prensa)
                             or (clase = 'local'    and n_clase <= cupo_local)
                           then 0 else 1 end,
                      peso desc, cuando desc) + ya as n
      from por_clase
     limit huecos
  )
  update public.criba_items i
     set edicion = dia, orden = e.n
    from elegidos e
   where i.id = e.id;

  get diagnostics puestos = row_count;
  return puestos;
end;
$$;

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA QUE QUEDÓ PUESTO
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ EN VERTICAL, una fila por cosa: en la tableta del autor una fila
--    ancha se corta por la derecha.
--
-- La fila 1 es la que dice si el arreglo entró: se lee del propio cuerpo
-- de la función, no de un texto escrito aquí que podría mentir.
select * from (
  select 1 as n, 'el cupo cuenta lo ya puesto' as que,
         (select case when prosrc like '%ya_por_clase%'
                      then '✅ sí' else '❌ NO — se pegó la versión vieja' end
            from pg_proc where proname = 'criba_arma_edicion' limit 1) as valor

  union all select 2, 'el sobrante se encola en vez de tirarse',
         (select case when prosrc like '%then 0 else 1 end%'
                      then '✅ sí' else '❌ no' end
            from pg_proc where proname = 'criba_arma_edicion' limit 1)

  union all select 3, 'el mando (por materia)',
         (select coalesce(substring(regexp_replace(prosrc, '\s+', ' ', 'g')
                                    from 'por_tema constant integer := (\d+)'), '⚠️')
            from pg_proc where proname = 'criba_arma_edicion' limit 1)

  union all select 4, 'cupos ciencia/prensa/Honduras',
         (select substring(regexp_replace(prosrc,'\s+',' ','g')
                           from 'cupo_ciencia constant integer := (\d+)') || ' / ' ||
                 substring(regexp_replace(prosrc,'\s+',' ','g')
                           from 'cupo_prensa constant integer := (\d+)')  || ' / ' ||
                 substring(regexp_replace(prosrc,'\s+',' ','g')
                           from 'cupo_local constant integer := (\d+)')
            from pg_proc where proname = 'criba_arma_edicion' limit 1)

  -- Lo de hoy NO se rehace: la edición ya repartida se queda como está.
  -- El arreglo se nota mañana. Esta fila lo dice para que nadie espere
  -- que el número cambie solo al pegar esto.
  union all select 5, 'la edición de hoy',
         (select coalesce(to_char(max(edicion), 'DD/MM') || ' · se queda como está',
                          '— no hay —') from public.criba_items)
) t order by n;
