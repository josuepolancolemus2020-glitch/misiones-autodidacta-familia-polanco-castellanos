-- Ejecutar en Supabase -> SQL Editor.
-- Tabla de la herramienta "Destellos": captura rápida de ideas y
-- pendientes que se cruzan por la mente antes de que se olviden.

create table if not exists public.destellos (
  id         bigint generated always as identity primary key,
  creado_at  timestamptz not null default now(),
  miembro    text not null,           -- id del miembro (josue, evelyn, jael, angelly)
  texto      text not null,           -- la idea / pendiente capturado
  proyecto   text,                    -- etiqueta opcional de proyecto
  hecho      boolean not null default false,
  hecho_at   timestamptz
);

-- Índice para la consulta principal (destellos de un miembro, recientes primero)
create index if not exists destellos_miembro_idx on public.destellos (miembro, creado_at desc);

-- Mismo criterio que el resto del proyecto: sin RLS, para simplificar
-- el desarrollo de esta app familiar.
alter table public.destellos disable row level security;
