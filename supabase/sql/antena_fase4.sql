-- Ejecutar en Supabase -> SQL Editor.
-- ANTENA 📡 — Fase 4: recolección periódica de métricas.
--
-- ⚠️ ANTES DE EJECUTAR: reemplaza PEGA_AQUI_TU_ANTENA_CRON_SECRET por el
-- mismo valor del secret ANTENA_CRON_SECRET de las Edge Functions
-- (Dashboard -> Edge Functions -> Secrets). Es la contraseña del reloj
-- que ya usa antena-publicar.

-- Cada 4 horas: despertar al recolector (Edge Function antena-metricas).
-- cron.schedule con el mismo nombre reemplaza el job si ya existía.
select cron.schedule(
  'antena-metricas',
  '5 */4 * * *',
  $$
  select net.http_post(
    url     := 'https://bzrnjvalpwlcnpszvwim.supabase.co/functions/v1/antena-metricas',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-antena-cron', 'PEGA_AQUI_TU_ANTENA_CRON_SECRET'
    ),
    body    := '{}'::jsonb
  );
  $$
);
