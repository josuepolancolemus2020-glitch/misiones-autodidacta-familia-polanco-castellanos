-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae criba.sql sale una sola vez,
-- al pegarlo. Si se cierra el editor sin leerla —pasó el 29 de agosto de
-- 2026— no hay forma de saber si quedó, y volver a pegar 400 líneas
-- desde una tableta para leer una fila es una factura absurda.
--
-- ⚠️ VA EN VERTICAL, UNA FILA POR COSA COMPROBADA, Y NO EN UNA FILA
-- ANCHA. La primera versión devolvía ocho columnas y en la tableta del
-- autor solo se veían cuatro: las otras cuatro quedaban fuera de
-- pantalla, y entre ellas estaban las tres que dicen si la seguridad por
-- fila y las funciones quedaron puestas. Una tabla se desliza hacia
-- abajo sola; hacia los lados, no. Una comprobación que no se ve entera
-- es media comprobación.
--
-- ⚠️ Y cuenta las filas con query_to_xml, NO con un `select count(*)`
-- directo: PostgreSQL planifica la consulta ENTERA antes de ejecutarla,
-- así que nombrar una tabla que no existe revienta con «relation does
-- not exist» aunque esté dentro de una rama que nunca se ejecutaría —y
-- ese error parece otro problema, que es la trampa del 27 de agosto de
-- 2026—. query_to_xml recibe la consulta como TEXTO: solo se mira si se
-- llega a ella.

with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'criba_items')          as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename in ('criba_items','criba_fuentes')) as pols,
    (select bool_and(relrowsecurity) from pg_class
      where oid in (to_regclass('public.criba_items'), to_regclass('public.criba_fuentes'))) as rls,
    case when to_regclass('public.criba_fuentes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.criba_fuentes', false, true, '')))[1]::text::int
    end                                                                      as fuentes,
    case when to_regclass('public.criba_fuentes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select coalesce(string_agg(id, '', '' order by id), ''—'') as c from public.criba_fuentes',
        false, true, '')))[1]::text
    end                                                                      as cuales
), c(orden, que, esperado, hay) as (
  select 1, 'tabla criba_items',      'existe',
         case when to_regclass('public.criba_items')   is null then 'NO ESTÁ' else 'existe' end from n
  union all select 2, 'tabla criba_fuentes','existe',
         case when to_regclass('public.criba_fuentes') is null then 'NO ESTÁ' else 'existe' end from n
  union all select 3, 'columnas de items',  '17',       coalesce(cols::text, '0')  from n
  union all select 4, 'políticas',          '3',        coalesce(pols::text, '0')  from n
  union all select 5, 'seguridad por fila', 'true',     coalesce(rls::text, 'NO')  from n
  union all select 6, 'criba_arma_edicion', 'existe',
         case when to_regproc('public.criba_arma_edicion') is null then 'NO ESTÁ' else 'existe' end from n
  union all select 7, 'criba_higiene',      'existe',
         case when to_regproc('public.criba_higiene')      is null then 'NO ESTÁ' else 'existe' end from n
  union all select 8, 'fuentes sembradas',  '4',        coalesce(fuentes::text, '0') from n
  union all select 9, 'cuáles',             'bcv-hn, cnbs, dialnet, sieca',
         coalesce(cuales, '—') from n
)
select case when hay = esperado then '✅' else '❌' end as ok, que, esperado, hay
  from c order by orden;
