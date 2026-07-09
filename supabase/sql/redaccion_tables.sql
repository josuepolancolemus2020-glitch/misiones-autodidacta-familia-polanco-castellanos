-- Ejecutar en Supabase -> SQL Editor.
-- Tablas de la herramienta "Redacción": sala de redacción de la revista
-- PolicastSapien (quincenal). Ediciones + notas con sección, tipo y estado.

create table if not exists public.redaccion_ediciones (
  id            bigint generated always as identity primary key,
  creado_at     timestamptz not null default now(),
  numero        int not null,             -- Nº de la edición (1, 2, 3…)
  titulo        text not null,            -- ej: "Nº 02 · 16–31 julio 2026"
  fecha_cierre  date,                     -- para la cuenta regresiva
  archivada     boolean not null default false
);

create table if not exists public.redaccion_notas (
  id              bigint generated always as identity primary key,
  creado_at       timestamptz not null default now(),
  actualizado_at  timestamptz not null default now(),
  edicion_id      bigint references public.redaccion_ediciones(id) on delete set null,
  autor           text not null,          -- id del miembro (josue, evelyn…)
  titulo          text not null default '',
  seccion         text not null default 'ACTUALIDAD',
  tipo            text not null default 'Artículo',
  estado          text not null default 'idea',  -- idea | borrador | revision | listo
  entradilla      text not null default '',      -- párrafo introductorio opcional
  cuerpo          text not null default '',
  en_portada      boolean not null default false -- ⭐ su título va en la portada
);

-- Configuración compartida de Redacción (secciones y tipos personalizados)
create table if not exists public.redaccion_config (
  clave  text primary key,                -- 'secciones' | 'tipos'
  valor  jsonb not null default '[]'::jsonb
);

create index if not exists redaccion_notas_edicion_idx
  on public.redaccion_notas (edicion_id, seccion);

-- Mismo criterio que el resto del proyecto: sin RLS, para simplificar
-- el desarrollo de esta app familiar.
alter table public.redaccion_ediciones disable row level security;
alter table public.redaccion_notas disable row level security;
alter table public.redaccion_config disable row level security;
