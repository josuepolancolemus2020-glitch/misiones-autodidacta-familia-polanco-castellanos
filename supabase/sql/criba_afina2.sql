-- Ejecutar en Supabase -> SQL Editor. IDEMPOTENTE. No hace falta
-- volver a desplegar la Edge Function.
-- ════════════════════════════════════════════════════════════════════
-- UN TEMA NO PUEDE COMERSE LA EDICIÓN
-- ════════════════════════════════════════════════════════════════════
-- La edición afinada trajo cosas buenas de verdad -la crisis de
-- replicación, el yo futuro, las circulares de la CNBS- y un fallo
-- estructural:
--
--   «Psicología de masas» puso 8 de 25, y casi ninguno era psicología:
--   «Deep learning for pedestrian collective behavior», «Threshold
--   Models of Collective Behavior», «network backbone extraction»...
--
-- Dos cosas, y la segunda es la que importa:
--
--  1. `"collective behavior"` es un término de FÍSICA DE SISTEMAS
--     COMPLEJOS -bandadas, multitudes, peatones-, no de psicología. Es
--     el mismo error que `replication` con los fagos: una palabra que
--     significa otra cosa en otro campo.
--
--  2. ⚠️ EL TOPE ERA POR FUENTE, NO POR TEMA. Los ocho salieron de la
--     misma fuente Y del mismo término, así que el tope por fuente no
--     los paró. Un solo término no puede quedarse con un tercio del
--     número: eso no es una edición, es un monográfico por accidente.
--     Con 18 temas y 25 huecos, cuatro por tema deja sitio para que
--     entren al menos seis materias distintas.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regclass('public.criba_temas') is null then
    raise exception E'FALTA public.criba_temas.\n'
      'QUE HACER: corre antes supabase/sql/criba_temas.sql y criba_afina.sql.';
  end if;
end $$;

-- ── 1. El término que traía peatones ────────────────────────────────
update public.criba_temas set termino = '"crowd psychology"' where id = 'masas';

-- ── 2. Tope por TEMA, además del tope por fuente ────────────────────
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
  por_fuente constant integer := 8;
  -- ⚠️ Con 18 temas y 25 huecos, cuatro por tema deja sitio para al
  -- menos seis materias distintas. Sin esto, un término desafortunado
  -- convierte la edición en un monográfico por accidente.
  por_tema   constant integer := 4;
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
  ), candidatos as (
    select u.id,
           coalesce(t.peso, f.peso) as peso,
           coalesce(u.publicado, u.recogido_at) as cuando,
           row_number() over (
             partition by u.fuente_id
             order by coalesce(t.peso, f.peso) desc,
                      coalesce(u.publicado, u.recogido_at) desc
           ) as n_fuente,
           -- Las de volcado no tienen tema; se agrupan por su fuente
           -- para que el tope por tema no las deje todas fuera.
           row_number() over (
             partition by coalesce(u.tema_id, 'volcado:' || u.fuente_id)
             order by coalesce(u.publicado, u.recogido_at) desc
           ) as n_tema
      from unicos u
      join public.criba_fuentes f on f.id = u.fuente_id
      left join public.criba_temas t on t.id = u.tema_id
     where u.tema_id is not null or f.plantilla is null
  ), elegidos as (
    select id, row_number() over (order by peso desc, cuando desc) + ya as n
      from candidatos
     where n_fuente <= por_fuente and n_tema <= por_tema
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

revoke all on function public.criba_arma_edicion(date, integer) from public, anon;

-- ── 3. Fuera lo que trajo el término malo, y rehacer la edición ─────
delete from public.criba_items
 where tema_id = 'masas' and leido_at is null and not guardado;

update public.criba_items
   set edicion = null, orden = null
 where edicion = current_date and leido_at is null and not guardado;

select public.criba_arma_edicion() as puestos_rehechos;

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN: cuántas materias distintas trae la edición
-- ════════════════════════════════════════════════════════════════════
with c(orden, que, esperado, hay) as (
            select 1, 'término de masas', '"crowd psychology"',
              (select termino from public.criba_temas where id='masas')
  union all select 2, 'ninguna materia pasa de 4', 'sí',
              case when (select coalesce(max(n), 0) from (
                     select count(*) as n from public.criba_items
                      where edicion = current_date and tema_id is not null
                      group by tema_id) x) <= 4 then 'sí' else 'NO' end
  union all select 3, 'materias distintas en la edición', '(6 o más)',
              (select count(distinct tema_id)::text from public.criba_items
                where edicion = current_date and tema_id is not null)
  /* ⚠️ NO se promete 25. Con tope por tema, la edición solo llega al
     tope si hay bastantes materias con material; si solo tres temas
     trajeron algo, salen doce. Y está BIEN: doce cosas que interesan
     valen más que veinticinco con ocho sobre peatones. Prometer 25 aquí
     sería una comprobación que miente el día que la criba haga bien su
     trabajo. */
  union all select 4, 'total en la edición', '(hasta 25)',
              (select count(*)::text from public.criba_items where edicion = current_date)
)
select case when hay = esperado or esperado like '(%' then '✅' else '❌' end as ok,
       que, esperado, hay from c order by orden;
