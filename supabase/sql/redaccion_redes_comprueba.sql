-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae `redaccion_redes.sql` sale
-- una sola vez, al pegarlo. Si se cierra el editor sin leerla no hay
-- forma de saber si quedó, y volver a pegar doscientas líneas desde una
-- tableta para leer una fila es una factura absurda.
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
      where table_schema = 'public' and table_name = 'redaccion_redes')      as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_redes')         as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_redes'
        and 'anon' = any(roles))                                             as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_redes'
        and cmd = 'DELETE')                                                  as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.redaccion_redes'))                     as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'redaccion_redes' and not t.tgisinternal)            as disparadores,
    -- Cuántas piezas hay, por red, y cuántas esperan salir: es lo que dice
    -- de un vistazo si lo escrito desde el aparato llegó de verdad.
    case when to_regclass('public.redaccion_redes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.redaccion_redes where eliminada = false',
        false, true, '')))[1]::text::bigint end                              as piezas,
    case when to_regclass('public.redaccion_redes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select string_agg(red || '' '' || n, '', '') as c from ('
        'select red, count(*) as n from public.redaccion_redes '
        'where eliminada = false group by red order by red) s',
        false, true, '')))[1]::text end                                      as por_red,
    case when to_regclass('public.redaccion_redes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.redaccion_redes '
        'where eliminada = false and estado <> ''publicada'' and fecha is not null and fecha <= current_date',
        false, true, '')))[1]::text::bigint end                              as por_salir,
    case when to_regclass('public.redaccion_redes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.redaccion_redes where eliminada = true',
        false, true, '')))[1]::text::bigint end                              as lapidas
)
select * from (
            select 1 as orden, 'tabla redaccion_redes' as que, 'existe' as esperado,
                   case when to_regclass('public.redaccion_redes') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '18', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'disparador (hora del servidor)', '1', disparadores::text from n
  union all select 6, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
  union all select 8, 'piezas vivas', '(informativo)', coalesce(piezas::text, '—') from n
  union all select 9, 'por red', '(informativo)', coalesce(por_red, '—') from n
  union all select 10, 'atrasadas o para hoy, sin publicar', '(informativo)', coalesce(por_salir::text, '—') from n
  union all select 11, 'retiradas con lápida', '(informativo)', coalesce(lapidas::text, '—') from n
) c
order by orden;
