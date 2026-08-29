-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea, no borra, no
-- cambia nada. Se puede pegar las veces que haga falta.
--
-- Para qué: la fila de comprobación que trae criba.sql sale una sola vez,
-- al pegarlo. Si se cierra el editor sin leerla -pasó el 29 de agosto de
-- 2026- no hay forma de saber si quedó, y volver a pegar 400 lineas desde
-- una tableta para leer una fila es una factura absurda. Esto son veinte
-- lineas y dice lo mismo.

-- ¿QUEDÓ PUESTA LA CRIBA? Solo mira; no cambia nada.
--
-- ⚠️ Cuenta las filas con query_to_xml y NO con un `select count(*)`
-- directo. Motivo: PostgreSQL planifica la consulta ENTERA antes de
-- ejecutarla, así que nombrar una tabla que no existe revienta con
-- «relation does not exist» aunque esté dentro de una rama del `case`
-- que nunca se ejecutaría — y ese error parece otro problema. Es la
-- misma trampa del 27 de agosto de 2026. query_to_xml recibe la
-- consulta como TEXTO, así que solo se mira si se llega a ella.
select
  case
    when to_regclass('public.criba_items') is null
     and to_regclass('public.criba_fuentes') is null
      then '❌ NO SE CREO NADA — vuelve a pegar criba.sql entero'
    when to_regclass('public.criba_items') is null
      or to_regclass('public.criba_fuentes') is null
      then '⚠️ SE PEGO A MEDIAS — vuelve a pegar criba.sql entero'
    else '✅ La Criba puesta'
  end                                                                     as resultado,
  case when to_regclass('public.criba_fuentes') is null then null else
    (xpath('/row/c/text()', query_to_xml(
      'select count(*) as c from public.criba_fuentes', false, true, '')))[1]::text::int
  end                                                                     as fuentes_han_de_ser_4,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'criba_items')         as columnas_items_han_de_ser_17,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename in ('criba_items','criba_fuentes'))
                                                                          as politicas_han_de_ser_3,
  (select bool_and(relrowsecurity) from pg_class
    where oid in (to_regclass('public.criba_items'), to_regclass('public.criba_fuentes')))
                                                                          as seguridad_ha_de_ser_true,
  (to_regproc('public.criba_arma_edicion') is not null)                   as arma_edicion_puesta,
  (to_regproc('public.criba_higiene') is not null)                        as higiene_puesta,
  case when to_regclass('public.criba_fuentes') is null then null else
    (xpath('/row/c/text()', query_to_xml(
      'select string_agg(id, '', '' order by id) as c from public.criba_fuentes', false, true, '')))[1]::text
  end                                                                     as cuales;
