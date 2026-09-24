-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- PARA QUÉ: las tablas de comprobación que traen `buzon_lector.sql` y
-- `buzon_editar.sql` salen una sola vez, al pegarlos. Si se cierra el
-- editor sin leerlas no hay forma de saber si quedaron, y volver a pegar
-- seiscientas líneas desde una tableta para leer unas filas es una
-- factura absurda. Esto junta las dos y dice, además, cuánto ha llegado.
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
      where table_schema = 'public' and table_name = 'buzon_mensajes'
        and column_name = any (array[
          'id','folio','creado_at','clase','titulo','texto','nombre','tel',
          'correo','lugar','escuela','cargo','evento_fecha','evento_hora',
          'evento_lugar','etica_ok','etica_version','permiso_fotos','fotos',
          'estado','nota_id','motivo','visto_por','visto_at','huella',
          'freno_dia']))                                                     as cols,
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'buzon_mensajes'
        and column_name in ('editado_at', 'ediciones'))                      as cols_ed,
    -- La que decide si en Redacción aparece el chip 📬 Buzón: la bandeja
    -- pide estas columnas por nombre, y con UNA que falte no sale.
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'buzon_mensajes'
        and column_name = any (string_to_array(
          'id,folio,creado_at,clase,titulo,texto,nombre,tel,correo,lugar,escuela,cargo,'
          'evento_fecha,evento_hora,evento_lugar,etica_version,permiso_fotos,fotos,'
          'editado_at,ediciones,'
          'estado,nota_id,motivo,visto_por,visto_at', ',')))                 as bandeja,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.buzon_mensajes'))                      as rls_m,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.buzon_fotos'))                         as rls_f,
    (select count(*) from pg_policies
      where schemaname = 'public'
        and policyname in ('buzon_mensajes_familia', 'buzon_fotos_familia')) as pols,
    (select count(*) from unnest(array[
        'public.faro_buzon_estado()',
        'public.faro_buzon_enviar(text,text,text,text,text,text,text,text,text,text,date,text,text,boolean,text,boolean,jsonb)',
        'public.faro_buzon_retirar(text,text)',
        'public.faro_buzon_mio(text,text)',
        'public.faro_buzon_editar(text,text,text,text,text,text,text,text,text,text,text,date,text,text,text,boolean,boolean,jsonb)']) f
      where coalesce(has_function_privilege('anon', to_regprocedure(f), 'execute'), false)) as puertas,
    coalesce(has_function_privilege('anon',
      to_regprocedure('public.faro_buzon_folio()'), 'execute'), false)
      or coalesce(has_function_privilege('authenticated',
      to_regprocedure('public.faro_buzon_folio()'), 'execute'), false)     as folio_abierta,
    (select count(*) from unnest(array['public.buzon_mensajes', 'public.buzon_fotos']) t
      where coalesce(has_table_privilege('anon', to_regclass(t),
              'select,insert,update,delete'), false))                        as anon_tablas,
    case when to_regprocedure('public.faro_buzon_estado()') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select coalesce(''Nº '' || numero || '' · cierra '' '
        '|| coalesce(to_char(cierre, ''DD/MM/YYYY''), ''sin fecha''), '
        '''ninguna edición abierta'') as c '
        'from (select 1) x left join public.faro_buzon_estado() on true',
        false, true, '')))[1]::text end                                      as proxima,
    -- Lo que ha llegado: es lo que dice de un vistazo si la puerta de la
    -- calle está funcionando de verdad.
    case when to_regclass('public.buzon_mensajes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.buzon_mensajes '
        'where estado in (''nuevo'', ''leido'')',
        false, true, '')))[1]::text::bigint end                              as por_atender,
    case when to_regclass('public.buzon_mensajes') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.buzon_mensajes',
        false, true, '')))[1]::text::bigint end                              as envios,
    case when to_regclass('public.buzon_fotos') is null then null else
      (xpath('/row/c/text()', query_to_xml(
        'select count(*) as c from public.buzon_fotos',
        false, true, '')))[1]::text::bigint end                              as fotos
)
select * from (
            select 1 as orden, 'tabla buzon_mensajes' as que, 'existe' as esperado,
                   case when to_regclass('public.buzon_mensajes') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'tabla buzon_fotos', 'existe',
                   case when to_regclass('public.buzon_fotos') is null
                        then 'NO ESTÁ' else 'existe' end from n
  union all select 3, 'columnas del envío', '26 de 26', cols || ' de 26' from n
  union all select 4, 'columnas de la corrección', '2 de 2', cols_ed || ' de 2' from n
  union all select 5, 'columnas que pide la bandeja de Redacción', '25 de 25', bandeja || ' de 25' from n
  union all select 6, 'seguridad por fila (mensajes · fotos)', 'true · true',
                   coalesce(rls_m::text, 'NO') || ' · ' || coalesce(rls_f::text, 'NO') from n
  union all select 7, 'políticas de la casa (una por tabla)', '2', pols::text from n
  union all select 8, 'las cinco puertas de la calle', '5 de 5', puertas || ' de 5' from n
  union all select 9, 'la calle NO puede fabricar folios', 'no',
                   case when folio_abierta then 'SÍ PUEDE' else 'no' end from n
  union all select 10, 'permisos de tabla de la calle (NO debe tener)', '0', anon_tablas::text from n
  union all select 11, 'lo que la calle ve de la próxima revista', '(informativo)', coalesce(proxima, '—') from n
  union all select 12, 'envíos por atender (nuevos y leídos)', '(informativo)', coalesce(por_atender::text, '—') from n
  union all select 13, 'envíos en total', '(informativo)', coalesce(envios::text, '—') from n
  union all select 14, 'fotos guardadas', '(informativo)', coalesce(fotos::text, '—') from n
) c
order by orden;
