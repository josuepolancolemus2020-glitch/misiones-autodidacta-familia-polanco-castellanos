-- Ejecutar en Supabase -> SQL Editor.
-- Tabla del nuevo módulo "Inventario Familiar".

create table if not exists public.inventario (
  id              bigint generated always as identity primary key,
  creado_at       timestamptz not null default now(),
  nombre          text not null,
  categoria       text,
  ubicacion       text,
  estado          text not null default 'Bueno',
  valor_estimado  numeric not null default 0,
  notas           text
);

-- Mismo criterio que el resto del proyecto: sin RLS, para simplificar
-- el desarrollo de esta app familiar.
alter table public.inventario disable row level security;
