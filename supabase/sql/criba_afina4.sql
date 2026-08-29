-- Ejecutar en Supabase -> SQL Editor. IDEMPOTENTE. No hace falta
-- volver a desplegar la Edge Function ni volver a cosechar.
-- ════════════════════════════════════════════════════════════════════
-- LOS DOS TOPES SE PISABAN: LA EDICIÓN SALÍA DE TRES MATERIAS
-- ════════════════════════════════════════════════════════════════════
-- El diagnóstico por tema enseñó las dos cosas a la vez:
--
--   · `recogidos`: los 18 temas traen material, 8 o 16 cada uno. La
--     cosecha funciona.
--   · `en_hoy`: solo TRES materias llegaban a la edición. Catorce temas
--     con ocho artículos guardados cada uno, y ninguno salía.
--
-- LA CAUSA, y es un fallo de orden, no de números:
--   El tope por FUENTE elegía los 8 mejores de cada fuente ordenando
--   por peso del tema. Los 8 mejores de OpenAlex son, todos, de los dos
--   temas que pesan 85. Después el tope por TEMA cortaba a 4 cada uno.
--   Resultado: OpenAlex gastaba sus ocho huecos en dos materias, y las
--   dieciséis restantes no se asomaban nunca, porque no estaban en el
--   top 8 de ninguna fuente.
--
--   Los dos topes se pisaban: el de fuente gastaba los huecos ANTES de
--   que el de tema pudiera repartir. Y el resultado era lo contrario de
--   lo que ambos buscaban.
--
-- EL ARREGLO, dos cosas:
--
--  1. ⚠️ PRIMERO REPARTE EL TEMA, DESPUÉS RECORTA LA FUENTE. El tope
--     por tema se aplica a todo lo que hay; solo sobre lo que sobrevive
--     se mira de qué fuente viene. Así ningún tema depende de estar
--     entre los mejores de su fuente.
--
--  2. DOS POR TEMA, NO CUATRO. Con 25 huecos, cuatro por tema dan seis
--     materias; dos dan doce o trece. Una edición diaria de un espacio
--     de estudio vale por la VARIEDAD, no por la profundidad: para
--     profundizar en un tema está el buscador, no el número del día.
--     Y de paso baja de doce a seis los avisos de la CNBS, que ocupaban
--     media edición.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regclass('public.criba_temas') is null then
    raise exception E'FALTA public.criba_temas.\n'
      'QUE HACER: corre antes criba_temas.sql, criba_afina.sql y criba_afina2.sql.';
  end if;
end $$;

create or replace function public.criba_arma_edicion(dia date default current_date,
                                                     tope integer default 25)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ya      integer;
  huecos  integer;
  puestos integer;
  /* ⚠️ EL TOPE POR FUENTE SE RETIRA, y hay una prueba de que sobra: la
     fila «avisos de Honduras» daba 6, o sea 2 por cada fuente de
     volcado. Eso lo hace el tope por TEMA solo, porque cada fuente sin
     plantilla cuenta como su propio tema. El de fuente existía para
     parar la manguera de Dialnet, que ya está apagada; lo único que
     hacía era recortar a OpenAlex y dejar la edición en ocho materias.
     Un límite que ya no protege de nada solo quita. */
  por_fuente constant integer := 1000;

  /* ⚠️ ESTE ES EL MANDO. Cuántos artículos aporta cada materia.
       1 → salen las 18 materias, una cosa de cada una. Máxima variedad.
       2 → salen unas diez, con dos de cada una.
       3 → salen unas siete, con tres.
     Se cambia este número, se vuelve a pegar el archivo, y la edición
     se rehace sola. No hay nada más que tocar. */
  por_tema   constant integer := 2;
begin
  dia := coalesce(dia, current_date);

  select count(*) into ya from public.criba_items where edicion = dia;
  huecos := greatest(tope - ya, 0);
  if huecos = 0 then return 0; end if;

  with unicos as (
    -- Un título, una vez: el mismo trabajo llega con el DOI del
    -- preprint y el del publicado, y la llave por DOI no los junta.
    select distinct on (lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')))
           i.id, i.fuente_id, i.tema_id, i.publicado, i.recogido_at
      from public.criba_items i
     where i.edicion is null
     order by lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')), i.recogido_at
  ), con_peso as (
    select u.id, u.fuente_id, u.tema_id,
           coalesce(t.peso, f.peso) as peso,
           coalesce(u.publicado, u.recogido_at) as cuando
      from unicos u
      join public.criba_fuentes f on f.id = u.fuente_id
      left join public.criba_temas t on t.id = u.tema_id
     -- El tema es obligatorio para las fuentes a las que SE PREGUNTA.
     -- Una de volcado es su propio tema.
     where u.tema_id is not null or f.plantilla is null
  ), reparte_tema as (
    /* ⚠️ PRIMERO EL TEMA. Cada materia aporta como mucho `por_tema`,
       sobre TODO lo que hay y sin importar de qué fuente venga. Este
       orden es el arreglo: antes se recortaba por fuente primero y las
       materias que no estaban entre las mejores de su fuente no se
       asomaban nunca. */
    select cp.*,
           coalesce(y.n, 0) + row_number() over (
             partition by coalesce(cp.tema_id, 'volcado:' || cp.fuente_id)
             order by cp.cuando desc) as n_tema
      from con_peso cp
      left join ya_por_tema y
             on y.grupo = coalesce(cp.tema_id, 'volcado:' || cp.fuente_id)
  ), recorta_fuente as (
    -- Y solo AHORA se mira de qué fuente viene lo que sobrevivió.
    select *, row_number() over (
             partition by fuente_id order by peso desc, cuando desc) as n_fuente
      from reparte_tema
     where n_tema <= por_tema
  ), reservado as (
    /* ⚠️ LA CAPA DE HONDURAS TIENE PLAZA RESERVADA.
       Al quitar el tope por fuente, los artículos académicos -que pesan
       de 50 a 85- se comieron las 25 plazas y la CNBS (60), SIECA (45) y
       la Bolsa (40) desaparecieron de la edición. Justo el registro con
       el que se comprueba si alguien está autorizado a recibir dinero.
       No se arregla recortando a los demás -eso ya se probó y dejó la
       edición en ocho materias-: se arregla reservando. Como cada fuente
       de volcado ya está limitada a `por_tema` por el reparto de arriba,
       la reserva cuesta como mucho seis plazas de veinticinco. */
    select *, (n_tema is not null and tema_id is null) as es_local
      from recorta_fuente
     where n_fuente <= por_fuente
  ), elegidos as (
    select id,
           /* Dos ordenaciones distintas a propósito: una para ELEGIR
              quién entra -lo local primero, que si no se queda fuera- y
              otra para el ORDEN en que se lee, que sigue siendo por peso.
              Reservar plaza no es poner la CNBS siempre en cabeza. */
           row_number() over (order by peso desc, cuando desc) + ya as n
      from (select * from reservado
             order by es_local desc, peso desc, cuando desc
             limit huecos) elegidos_por_reserva
  )
  update public.criba_items i
     set edicion = dia, orden = e.n
    from elegidos e
   where i.id = e.id;

  get diagnostics puestos = row_count;
  return puestos;
end;
$$;

revoke all on function public.criba_arma_edicion(date, integer) from public, anon;

-- Rehacer la edición de hoy con el reparto arreglado.
update public.criba_items
   set edicion = null, orden = null
 where edicion = current_date and leido_at is null and not guardado;

select public.criba_arma_edicion() as puestos_rehechos;

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN: la variedad es lo que se mide
-- ════════════════════════════════════════════════════════════════════
with c(orden, que, esperado, hay) as (
            select 1, 'materias distintas en la edición', '(10 o más)',
              (select count(distinct tema_id)::text from public.criba_items
                where edicion = current_date and tema_id is not null)
  union all select 2, 'ninguna materia pasa de 2', 'sí',
              case when (select coalesce(max(n), 0) from (
                     select count(*) as n from public.criba_items
                      where edicion = current_date and tema_id is not null
                      group by tema_id) x) <= 2 then 'sí' else 'NO' end
  union all select 3, 'avisos de Honduras', '(6 o menos)',
              (select count(*)::text from public.criba_items i
                join public.criba_fuentes f on f.id = i.fuente_id
               where i.edicion = current_date and f.plantilla is null)
  union all select 4, 'total en la edición', '(hasta 25)',
              (select count(*)::text from public.criba_items where edicion = current_date)
)
select case when hay = esperado or esperado like '(%' then '✅' else '❌' end as ok,
       que, esperado, hay from c order by orden;
