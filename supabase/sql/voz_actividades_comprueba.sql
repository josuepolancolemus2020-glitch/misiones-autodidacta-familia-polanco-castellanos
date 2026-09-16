-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae `voz_actividades.sql` sale
-- una sola vez, al pegarlo. Si se cierra el editor sin leerla no hay
-- forma de saber si quedó, y volver a pegar ciento ochenta líneas desde
-- una tableta para leer una fila es una factura absurda.
--
-- ⚠️ VA EN VERTICAL, UNA FILA POR COSA COMPROBADA. En la tableta del
-- autor una fila ancha se ve a medias y lo que cae fuera es siempre el
-- final, que es donde está lo que de verdad importa. Una tabla se
-- desliza hacia abajo sola; hacia los lados, no.
--
-- ⚠️ Y cuenta las filas con query_to_xml, NO con un `select count(*)`
-- directo: PostgreSQL planifica la consulta ENTERA antes de ejecutarla,
-- así que nombrar una tabla que no existe revienta con «relation does
-- not exist» aunque esté dentro de una rama que nunca se ejecutaría. O
-- sea que la comprobación fallaría justo en el único caso para el que
-- existe si se escribiera de la forma obvia.

with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'voz_actividades')      as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'voz_actividades')         as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'voz_actividades'
        and 'anon' = any(roles))                                             as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'voz_actividades'
        and cmd = 'DELETE')                                                  as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.voz_actividades'))                     as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'voz_actividades' and not t.tgisinternal)            as disparadores,
    (select count(*) from pg_constraint
      where conname in ('voz_actividades_items_lista',
                        'voz_actividades_items_cabe'))                       as checks,
    -- Cuántos talleres hay y cuántas actividades entre todos: es lo que
    -- dice de un vistazo si lo pegado desde el aparato llegó de verdad.
    case when to_regclass('public.voz_actividades') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.voz_actividades where borrada = false',
        false, true, '')))[1]::text::bigint end                              as talleres,
    case when to_regclass('public.voz_actividades') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select coalesce(sum(jsonb_array_length(items)), 0) as c '
        'from public.voz_actividades where borrada = false',
        false, true, '')))[1]::text::bigint end                              as actividades,
    case when to_regclass('public.voz_actividades') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.voz_actividades where borrada = true',
        false, true, '')))[1]::text::bigint end                              as lapidas,
    -- ⚠️ Y LA QUE DE VERDAD IMPORTA: ¿hay alguna pregunta de selección
    -- guardada SIN decir cuál es la correcta? Tiene que dar cero
    -- siempre: la pantalla para el guardado antes de dejarla pasar. Si
    -- alguna vez diera otra cosa, alguien escribió en la tabla por otro
    -- camino y hay un examen que no se puede aprobar.
    case when to_regclass('public.voz_actividades') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.voz_actividades t, '
        'jsonb_array_elements(t.items) e '
        'where e->>''k'' = ''opcion'' and coalesce((e->>''ok'')::int, -1) < 0',
        false, true, '')))[1]::text::bigint end                              as sin_correcta
)
select * from (
            select 1 as orden, 'tabla voz_actividades' as que, 'existe' as esperado,
                   case when to_regclass('public.voz_actividades') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '7', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'checks con nombre (lista y tamaño)', '2', checks::text from n
  union all select 6, 'disparador (hora del servidor)', '1', disparadores::text from n
  union all select 7, 'higiene de lápidas', 'existe',
                   case when to_regproc('public.voz_actividades_higiene') is null
                        then 'NO ESTÁ' else 'existe' end from n
  union all select 8, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 9, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
  union all select 10, '⚠️ preguntas SIN correcta (ha de ser 0)', '0',
                   coalesce(sin_correcta::text, '—') from n
  union all select 11, 'talleres guardados', '(informativo)',
                   coalesce(talleres::text, '—') from n
  union all select 12, 'actividades entre todos', '(informativo)',
                   coalesce(actividades::text, '—') from n
  union all select 13, 'talleres vaciados con lápida', '(informativo)',
                   coalesce(lapidas::text, '—') from n
) c
order by orden;
