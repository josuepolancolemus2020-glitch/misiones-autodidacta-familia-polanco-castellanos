-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de supabase/sql/criba.sql
-- y de haber desplegado la Edge Function `criba-cosecha`.
--
-- ⚠️ ANTES DE EJECUTAR: reemplaza UNA sola cosa, y está marcada:
--   · PEGA_AQUI_TU_CRIBA_CRON_SECRET  → el mismo valor del secreto
--     CRIBA_CRON_SECRET de las Edge Functions
--     (Dashboard → Edge Functions → Secrets).
--
-- La dirección del proyecto ya va puesta: es la misma que lleva
-- supabase/sql/antena_fase4.sql desde hace meses. Cada cosa que hay que
-- escribir a mano es una que se puede escribir mal desde una tableta.
--
-- VA EN ARCHIVO APARTE de criba.sql a propósito: este es el único que
-- pide escribir algo a mano antes de pegarlo, y mezclarlo con el otro
-- obligaría a editar 400 líneas cada vez que se re-corre la tabla.
-- ════════════════════════════════════════════════════════════════════
-- EL RELOJ DE LA CRIBA
-- ════════════════════════════════════════════════════════════════════
-- Una vez al día, a las 5:10 UTC (11:10 de la noche del día anterior en
-- Honduras, UTC-6). Se eligió esa hora porque la edición tiene que estar
-- puesta ANTES de que alguien la abra por la mañana: una edición diaria
-- que se arma a mediodía es una edición que el primer día llega vacía.
--
-- Es UNA vez al día y no cada cuatro horas como la Antena, y tiene
-- motivo: la Antena vigila métricas que cambian solas; aquí lo que se
-- recoge son publicaciones, y la edición tiene fondo. Cosechar seis
-- veces al día no daría más ítems, solo seis veces el mismo trabajo.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$ begin
  if to_regclass('public.criba_fuentes') is null then
    raise exception E'FALTA la tabla public.criba_fuentes.\n'
      'QUE HACER: corre antes supabase/sql/criba.sql entero, y vuelve a pegar este archivo.';
  end if;
end $$;

-- cron.schedule con el mismo nombre REEMPLAZA el trabajo si ya existía,
-- así que re-correr esto no deja dos relojes sonando.
select cron.schedule(
  'criba-cosecha',
  '10 5 * * *',
  $$
  select net.http_post(
    url     := 'https://bzrnjvalpwlcnpszvwim.supabase.co/functions/v1/criba-cosecha',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-criba-cron', 'PEGA_AQUI_TU_CRIBA_CRON_SECRET'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA QUE EL RELOJ QUEDÓ PUESTO
-- ════════════════════════════════════════════════════════════════════
-- Mañana por la mañana:
--   select f.nombre, f.ultimo_exito_at, f.fallos_seguidos, f.ultimo_error
--     from public.criba_fuentes f order by f.nombre;
-- Las cuatro tienen que traer `ultimo_exito_at` de esta madrugada. La
-- que traiga `ultimo_error` está diciendo lo que le pasa: eso es la
-- regla 6 funcionando, no el recolector roto.
--
--   select edicion, count(*) from public.criba_items
--    where edicion is not null group by 1 order by 1 desc limit 5;
-- Nunca más de 25 por día. Si sale más, el tope no se está aplicando.
-- ════════════════════════════════════════════════════════════════════

select
  case when exists (select 1 from cron.job where jobname = 'criba-cosecha')
       then '✅ reloj de La Criba puesto' else '❌ EL RELOJ NO SE CREO' end as resultado,
  (select schedule from cron.job where jobname = 'criba-cosecha')          as cuando,
  (select active   from cron.job where jobname = 'criba-cosecha')          as activo,
  (select count(*) from public.criba_fuentes where activa)                 as fuentes_activas;
