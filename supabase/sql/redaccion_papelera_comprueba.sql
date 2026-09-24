-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae `redaccion_papelera.sql`
-- sale una sola vez, al pegarlo. Si se cierra el editor sin leerla no
-- hay forma de saber si quedó. Y volver a pegar aquel archivo para
-- leerla no es inocente: lleva dos `alter table` sobre las notas de la
-- revista. Esto solo mira.
--
-- ⚠️ VA EN VERTICAL, UNA FILA POR COSA COMPROBADA. En la tableta del
-- autor una fila ancha se ve a medias y lo que cae fuera es siempre el
-- final, que es donde está lo que de verdad importa.
--
-- ⚠️ Y cuenta las filas con query_to_xml, NO con un `select count(*)`
-- directo: PostgreSQL planifica la consulta ENTERA antes de ejecutarla,
-- así que nombrar una columna que todavía no existe (la papelera sin
-- correr) revienta con «column does not exist» aunque esté dentro de una
-- rama que nunca se ejecutaría. query_to_xml recibe la consulta como
-- TEXTO y solo la mira si se llega a ella.

with n as (
  select
    (select data_type || ' · '
            || case is_nullable when 'NO' then 'no nula' else 'PUEDE SER NULA' end
            || ' · ' || coalesce(column_default, 'sin valor por defecto')
       from information_schema.columns
      where table_schema = 'public' and table_name = 'redaccion_notas'
        and column_name = 'eliminada')                                       as col_eliminada,
    (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'redaccion_notas'
        and column_name = 'eliminada_at')                                    as col_eliminada_at,
    to_regclass('public.redaccion_notas_papelera_idx')                       as indice,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.redaccion_notas'))                     as rls,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_notas'
        and cmd in ('ALL', 'UPDATE'))                                        as pols_update,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_notas'
        and 'anon' = any(roles))                                             as pols_anon,
    -- Cuántas notas hay a la vista y cuántas esperan en la papelera: es lo
    -- que dice de un vistazo si «Eliminar» ya aparta en vez de borrar.
    case when to_regclass('public.redaccion_notas') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.redaccion_notas',
        false, true, '')))[1]::text::bigint end                              as notas,
    case when not exists (select 1 from information_schema.columns
                           where table_schema = 'public' and table_name = 'redaccion_notas'
                             and column_name = 'eliminada') then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.redaccion_notas where eliminada = true',
        false, true, '')))[1]::text::bigint end                              as en_papelera
)
select * from (
            select 1 as orden, 'tabla redaccion_notas' as que, 'existe' as esperado,
                   case when to_regclass('public.redaccion_notas') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columna eliminada', 'boolean · no nula · false',
                   coalesce(col_eliminada, 'NO ESTÁ') from n
  union all select 3, 'columna eliminada_at', 'timestamp with time zone',
                   coalesce(col_eliminada_at, 'NO ESTÁ') from n
  union all select 4, 'índice de la papelera', 'existe',
                   case when indice is null then 'NO ESTÁ' else 'existe' end from n
  union all select 5, 'seguridad por fila (la de siempre)', 'true', coalesce(rls::text, 'NO') from n
  union all select 6, 'política que deja mandar a la papelera', '1 o más', pols_update::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
  union all select 8, 'notas en total', '(informativo)', coalesce(notas::text, '—') from n
  union all select 9, 'de ellas, en la papelera', '(informativo)', coalesce(en_papelera::text, '— (sin correr)') from n
) c
order by orden;
