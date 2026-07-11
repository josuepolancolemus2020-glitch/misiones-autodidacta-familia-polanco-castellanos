-- Ejecutar en Supabase -> SQL Editor.
-- ANTENA 📡 — Fase 2: conexión OAuth de X y programador (pg_cron).
--
-- ⚠️ ANTES DE EJECUTAR: reemplaza PEGA_AQUI_TU_ANTENA_CRON_SECRET (aparece
-- 1 vez abajo) por el valor del secret ANTENA_CRON_SECRET de las Edge
-- Functions (Dashboard -> Edge Functions -> Secrets). Es la "contraseña
-- del reloj" que la función antena-publicar exige en el header
-- x-antena-cron. NO uses la service_role key aquí: en proyectos con las
-- llaves nuevas (sb_*) el Bearer clásico ya no coincide y la función
-- responde 403 "No autorizado" (los mensajes se quedan en Programada).
-- NUNCA publiques el secret ni lo subas a GitHub: solo pégalo en el SQL Editor.

-- ─────────────────────────────────────────────
-- 1. Estados temporales del flujo OAuth (PKCE)
-- ─────────────────────────────────────────────
create table if not exists public.antena_oauth_states (
  state          uuid primary key default gen_random_uuid(),
  usuario_id     uuid not null,
  plataforma     text not null,
  code_verifier  text not null,
  creado_at      timestamptz not null default now()
);

alter table public.antena_oauth_states enable row level security;
revoke all on table public.antena_oauth_states from anon, authenticated;
-- (sin policies = solo las Edge Functions con service_role la usan)

-- ─────────────────────────────────────────────
-- 2. El reloj: pg_cron + pg_net
-- ─────────────────────────────────────────────
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Cada minuto: despertar al publicador (Edge Function antena-publicar)
select cron.schedule(
  'antena-publicar',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://bzrnjvalpwlcnpszvwim.supabase.co/functions/v1/antena-publicar',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-antena-cron', 'PEGA_AQUI_TU_ANTENA_CRON_SECRET'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Cada hora: limpiar estados OAuth abandonados
select cron.schedule(
  'antena-limpiar-states',
  '15 * * * *',
  $$ delete from public.antena_oauth_states where creado_at < now() - interval '1 hour'; $$
);
