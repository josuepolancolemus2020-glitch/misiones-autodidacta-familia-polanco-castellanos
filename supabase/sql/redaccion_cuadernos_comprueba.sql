-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae `redaccion_cuadernos.sql`
-- sale una sola vez, al pegarlo. Si se cierra el editor sin leerla no
-- hay forma de saber si quedó, y volver a pegar doscientas líneas desde
-- una tableta para leer una fila es una factura absurda.
--
-- ⚠️ VA EN VERTICAL, UNA FILA POR COSA COMPROBADA. En la tableta del
-- autor una fila ancha se ve a medias y lo que cae fuera es siempre el
-- final, que es donde está lo que de verdad importa.
--
-- ⚠️ Y cuenta las filas con query_to_xml, NO con un `select count(*)`
-- directo: PostgreSQL planifica la consulta ENTERA antes de ejecutarla,
-- así que nombrar una tabla que no existe revienta con «relation does
-- not exist» aunque esté dentro de una rama que nunca se ejecutaría.

with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'redaccion_cuadernos')  as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_cuadernos')     as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_cuadernos'
        and 'anon' = any(roles))                                             as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_cuadernos'
        and cmd = 'DELETE')                                                  as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.redaccion_cuadernos'))                 as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'redaccion_cuadernos' and not t.tgisinternal)        as disparadores,
    -- Cuántos cuadernos hay, cuántos estantes distintos y cuántas
    -- referencias: es lo que dice de un vistazo si lo escrito desde el
    -- aparato llegó de verdad.
    case when to_regclass('public.redaccion_cuadernos') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.redaccion_cuadernos where eliminado = false',
        false, true, '')))[1]::text::bigint end                              as cuadernos,
    case when to_regclass('public.redaccion_cuadernos') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(distinct lower(e)) as c from public.redaccion_cuadernos, '
        'jsonb_array_elements_text(estantes) as e where eliminado = false',
        false, true, '')))[1]::text::bigint end                              as estantes,
    case when to_regclass('public.redaccion_cuadernos') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select coalesce(sum(jsonb_array_length(referencias)), 0) as c '
        'from public.redaccion_cuadernos where eliminado = false',
        false, true, '')))[1]::text::bigint end                              as referencias,
    case when to_regclass('public.redaccion_cuadernos') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.redaccion_cuadernos where eliminado = true',
        false, true, '')))[1]::text::bigint end                              as lapidas
)
select * from (
            select 1 as orden, 'tabla redaccion_cuadernos' as que, 'existe' as esperado,
                   case when to_regclass('public.redaccion_cuadernos') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '19', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'disparador (hora del servidor)', '1', disparadores::text from n
  union all select 6, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
  union all select 8, 'cuadernos vivos', '(informativo)', coalesce(cuadernos::text, '—') from n
  union all select 9, 'estantes distintos', '(informativo)', coalesce(estantes::text, '—') from n
  union all select 10, 'referencias apuntadas', '(informativo)', coalesce(referencias::text, '—') from n
  union all select 11, 'retirados con lápida', '(informativo)', coalesce(lapidas::text, '—') from n
) c
order by orden;
