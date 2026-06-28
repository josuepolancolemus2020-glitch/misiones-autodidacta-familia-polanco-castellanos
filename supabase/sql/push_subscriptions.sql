-- Ejecutar en Supabase -> SQL Editor.
-- Guarda una fila por cada dispositivo que active las notificaciones
-- del Chat Familiar (un mismo miembro puede tener varias: celular,
-- computadora, etc.).

create table if not exists public.push_subscriptions (
  id          bigint generated always as identity primary key,
  creado_at   timestamptz not null default now(),
  member_id   text not null,
  nombre      text not null,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null
);

-- Mismo criterio que el resto del proyecto: sin RLS, para simplificar
-- el desarrollo de esta app familiar.
alter table public.push_subscriptions disable row level security;
