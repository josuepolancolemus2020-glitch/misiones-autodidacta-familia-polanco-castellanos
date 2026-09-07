-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: la fila de comprobación que trae `rodaje.sql` sale una sola
-- vez, al pegarlo. Si se cierra el editor sin leerla —pasó el 29 de
-- agosto de 2026 con La Criba— no hay forma de saber si quedó, y volver
-- a pegar quinientas líneas desde una tableta para leer una fila es una
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
-- llega a ella.

with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'rodaje_proyectos')      as cols_pro,
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'rodaje_bloques')        as cols_blo,
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'rodaje_fuentes')        as cols_fue,
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'rodaje_reels')          as cols_ree,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename like 'rodaje\_%')             as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename like 'rodaje\_%'
        and 'anon' = any(roles))                                             as pols_anon,
    (select bool_and(relrowsecurity) from pg_class
      where relname like 'rodaje\_%' and relkind = 'r'
        and relnamespace = 'public'::regnamespace)                            as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname like 'rodaje\_%' and not t.tgisinternal)                as disparadores,
    (select count(*) from pg_constraint
      where contype = 'f' and conname like 'rodaje\_%\_pid\_fk')              as llaves,
    -- Las filas que hay. Con query_to_xml, que recibe la consulta como
    -- TEXTO y solo la mira si se llega a ella: si la tabla no existe,
    -- esta rama ni se ejecuta en vez de reventar la consulta entera.
    case when to_regclass('public.rodaje_proyectos') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.rodaje_proyectos', false, true, '')))[1]::text::int
    end                                                                       as proyectos,
    case when to_regclass('public.rodaje_bloques') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.rodaje_bloques', false, true, '')))[1]::text::int
    end                                                                       as bloques,
    case when to_regclass('public.rodaje_fuentes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.rodaje_fuentes', false, true, '')))[1]::text::int
    end                                                                       as fuentes,
    -- Y la que más importa mirar de un vistazo: cuántas fuentes se
    -- escribieron sin comprobar en el original. De memoria no se cita.
    case when to_regclass('public.rodaje_fuentes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.rodaje_fuentes where not verificada',
        false, true, '')))[1]::text::int
    end                                                                       as sin_verificar
), c(orden, que, esperado, hay) as (
            select 1, 'tabla rodaje_proyectos', 'existe',
                   case when to_regclass('public.rodaje_proyectos') is null then 'NO ESTÁ' else 'existe' end from n
  union all select 2, 'tabla rodaje_bloques',   'existe',
                   case when to_regclass('public.rodaje_bloques')   is null then 'NO ESTÁ' else 'existe' end from n
  union all select 3, 'tabla rodaje_fuentes',   'existe',
                   case when to_regclass('public.rodaje_fuentes')   is null then 'NO ESTÁ' else 'existe' end from n
  union all select 4, 'tabla rodaje_reels',     'existe',
                   case when to_regclass('public.rodaje_reels')     is null then 'NO ESTÁ' else 'existe' end from n
  union all select 5, 'columnas de proyectos',  '13',  coalesce(cols_pro::text, '0') from n
  union all select 6, 'columnas de bloques',    '18',  coalesce(cols_blo::text, '0') from n
  union all select 7, 'columnas de fuentes',    '20',  coalesce(cols_fue::text, '0') from n
  union all select 8, 'columnas de reels',      '17',  coalesce(cols_ree::text, '0') from n
  union all select 9, 'políticas (1 por tabla)', '4',  coalesce(pols::text, '0') from n
  union all select 10, 'seguridad por fila',    'true', coalesce(rls::text, 'NO')  from n
  union all select 11, 'disparadores (4 fechas + 1 guardia)', '5',
                   coalesce(disparadores::text, '0') from n
  union all select 12, 'llaves ajenas con cascada', '3', coalesce(llaves::text, '0') from n
  -- El guardia de las citas es lo único de la herramienta que no se
  -- puede saltar. Si falta, se puede publicar con material ajeno sin
  -- crédito y nada avisa.
  union all select 13, 'guardia de citas', 'existe',
                   case when to_regproc('public.rodaje_guarda_citas') is null then 'NO ESTÁ' else 'existe' end from n
  union all select 14, 'check: la IA declara su herramienta', 'existe',
                   case when exists (select 1 from pg_constraint where conname = 'rodaje_fuentes_ia_declarada')
                        then 'existe' else 'NO ESTÁ' end from n
  union all select 15, 'check: «generado_ia» solo para lo generado', 'existe',
                   case when exists (select 1 from pg_constraint where conname = 'rodaje_fuentes_licencia_ia')
                        then 'existe' else 'NO ESTÁ' end from n
  -- Esta línea se lee al revés que las demás: aquí lo bueno es que NO
  -- haya nada. No existe puerta pública que abrir, y si alguien creara
  -- una estaría dejando leer el cuaderno de dirección con la clave que
  -- va escrita en el navegador.
  union all select 16, 'política para anon (NO debe haber)', '0',
                   coalesce(pols_anon::text, '0') from n
  union all select 17, 'proyectos guardados', '(informativo)', coalesce(proyectos::text, '—') from n
  union all select 18, 'bloques guardados',   '(informativo)', coalesce(bloques::text, '—')   from n
  union all select 19, 'fuentes guardadas',   '(informativo)', coalesce(fuentes::text, '—')   from n
  union all select 20, 'fuentes SIN verificar', '(mírala)',    coalesce(sin_verificar::text, '—') from n
)
select case when esperado like '(%' then '·'
            when hay = esperado then '✅' else '❌' end as ok,
       que, esperado, hay
  from c order by orden;
