-- Ejecutar en Supabase -> SQL Editor.
-- ANTENA 📡 — Fase 5a: publicaciones privadas (solo Facebook).
--
-- Una publicación "privada" llega a la Página de Facebook con
-- published=false: solo los administradores la ven. Desde Antena,
-- el botón "Hacer pública" (Edge Function antena-visibilidad) la
-- voltea a visible cuando el autor la aprueba.
-- X no soporta posts privados: el compositor bloquea esos destinos.

alter table public.antena_publicaciones
  add column if not exists privada boolean not null default false;
