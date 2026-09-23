-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae `consigna.sql` sale una
-- sola vez, al pegarlo. Si se cierra el editor sin leerla no hay forma
-- de saber si quedó, y volver a pegar doscientas líneas desde una
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
      where table_schema = 'public' and table_name = 'consigna_piezas')      as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'consigna_piezas')         as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'consigna_piezas'
        and 'anon' = any(roles))                                             as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'consigna_piezas'
        and cmd = 'DELETE')                                                  as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.consigna_piezas'))                     as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'consigna_piezas' and not t.tgisinternal)            as disparadores,
    -- Cuántas piezas vivas hay, de qué clases, cuántos usos apuntados y
    -- cuántos sin contestar: es lo que dice de un vistazo si lo escrito
    -- desde el aparato llegó de verdad, y si la bitácora se está
    -- preguntando.
    case when to_regclass('public.consigna_piezas') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.consigna_piezas where eliminado = false',
        false, true, '')))[1]::text::bigint end                              as piezas,
    case when to_regclass('public.consigna_piezas') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select coalesce(string_agg(clase || '' '' || n, '' · '' order by clase), '''') as c '
        'from (select clase, count(*) as n from public.consigna_piezas '
        'where eliminado = false group by clase) s',
        false, true, '')))[1]::text end                                      as clases,
    case when to_regclass('public.consigna_piezas') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select coalesce(sum(usos), 0) as c from public.consigna_piezas where eliminado = false',
        false, true, '')))[1]::text::bigint end                              as usos,
    case when to_regclass('public.consigna_piezas') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.consigna_piezas, '
        'jsonb_array_elements(bitacora) as u where eliminado = false '
        'and (u->>''ok'') is null',
        false, true, '')))[1]::text::bigint end                              as sin_contestar,
    case when to_regclass('public.consigna_piezas') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.consigna_piezas where eliminado = true',
        false, true, '')))[1]::text::bigint end                              as lapidas
)
select * from (
            select 1 as orden, 'tabla consigna_piezas' as que, 'existe' as esperado,
                   case when to_regclass('public.consigna_piezas') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '21', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'disparador (hora del servidor)', '1', disparadores::text from n
  union all select 6, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
  union all select 8, 'piezas vivas', '(informativo)', coalesce(piezas::text, '—') from n
  union all select 9, 'por clase', '(informativo)', coalesce(nullif(clases, ''), '—') from n
  union all select 10, 'usos apuntados', '(informativo)', coalesce(usos::text, '—') from n
  union all select 11, 'usos sin contestar «¿sirvió?»', '(informativo)', coalesce(sin_contestar::text, '—') from n
  union all select 12, 'retiradas con lápida', '(informativo)', coalesce(lapidas::text, '—') from n
) c
order by orden;
