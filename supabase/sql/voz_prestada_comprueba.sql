-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae `voz_prestada.sql` sale una
-- sola vez, al pegarlo. Si se cierra el editor sin leerla —pasó el 29 de
-- agosto de 2026 con La Criba— no hay forma de saber si quedó, y volver
-- a pegar trescientas líneas desde una tableta para leer una fila es una
-- factura absurda. Veinte que solo miran dicen lo mismo.
--
-- ⚠️ VA EN VERTICAL, UNA FILA POR COSA COMPROBADA, Y NO EN UNA FILA
-- ANCHA. En la tableta del autor una fila de ocho columnas se ve a
-- medias: las últimas caen fuera de pantalla, y son justo las que dicen
-- si la seguridad por fila quedó puesta. Una tabla se desliza hacia
-- abajo sola; hacia los lados, no.
--
-- ⚠️ Y cuenta las filas con query_to_xml, NO con un `select count(*)`
-- directo: PostgreSQL planifica la consulta ENTERA antes de ejecutarla,
-- así que nombrar una tabla que no existe revienta con «relation does
-- not exist» aunque esté dentro de una rama que nunca se ejecutaría —y
-- ese error parece otro problema, que es la trampa del 27 de agosto de
-- 2026—. query_to_xml recibe la consulta como TEXTO: solo se mira si se
-- llega a ella. O sea que esta comprobación falla justo en el único caso
-- para el que existe si se escribe de la forma obvia.

with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'voz_prestada')        as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'voz_prestada')           as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'voz_prestada'
        and 'anon' = any(roles))                                            as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'voz_prestada'
        and cmd = 'DELETE')                                                 as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.voz_prestada'))                       as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'voz_prestada' and not t.tgisinternal)              as disparadores,
    (select count(*) from pg_constraint
      where conname in ('voz_prestada_etiqueta', 'voz_prestada_cuerpo'))    as checks,
    -- Los cuentos que hay, y los retirados con lápida. Con query_to_xml,
    -- que recibe la consulta como TEXTO y solo la mira si se llega a
    -- ella: si la tabla no existe, esta rama ni se ejecuta en vez de
    -- reventar la consulta entera.
    case when to_regclass('public.voz_prestada') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.voz_prestada where borrado = false',
        false, true, '')))[1]::text::bigint end                             as cuentos,
    case when to_regclass('public.voz_prestada') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.voz_prestada where borrado = true',
        false, true, '')))[1]::text::bigint end                             as lapidas,
    -- ⚠️ Y LA COMPROBACIÓN QUE DE VERDAD IMPORTA: ¿hay algún cuento
    -- guardado SIN su etiqueta? Con el check puesto tiene que dar cero
    -- siempre. Si alguna vez diera otra cosa, el check se cayó o alguien
    -- lo quitó, y el anaquel lleva cuentos que no dicen a quién imitan.
    case when to_regclass('public.voz_prestada') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.voz_prestada '
        'where length(btrim(voz)) < 2 or length(btrim(maquina)) < 2',
        false, true, '')))[1]::text::bigint end                             as sin_etiqueta
)
select * from (
            select 1 as orden, 'tabla voz_prestada' as que, 'existe' as esperado,
                   case when to_regclass('public.voz_prestada') is null then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '13', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'checks con nombre (etiqueta y cuerpo)', '2', checks::text from n
  union all select 6, 'disparador (hora y dueño)', '1', disparadores::text from n
  union all select 7, 'higiene de lápidas', 'existe',
                   case when to_regproc('public.voz_prestada_higiene') is null
                        then 'NO ESTÁ' else 'existe' end from n
  union all select 8, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 9, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
  union all select 10, '⚠️ cuentos SIN etiqueta (ha de ser 0)', '0',
                   coalesce(sin_etiqueta::text, '—') from n
  union all select 11, 'cuentos en el anaquel', '(informativo)',
                   coalesce(cuentos::text, '—') from n
  union all select 12, 'retirados con lápida', '(informativo)',
                   coalesce(lapidas::text, '—') from n
) c
order by orden;
