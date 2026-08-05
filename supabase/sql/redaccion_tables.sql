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
  en_portada      boolean not null default false, -- ⭐ su título va en la portada
  limite_amarillo int,                    -- 🟡 mínimo de palabras (recuadro de Canva)
  limite_rojo     int,                    -- 🔴 máximo de palabras (recuadro de Canva)
  eliminada       boolean not null default false, -- 🗑️ está en la papelera
  eliminada_at    timestamptz             -- cuándo se tiró (para ordenarla)
);

-- Migración para bases ya creadas (no hace nada si las columnas ya existen)
alter table public.redaccion_notas add column if not exists limite_amarillo int;
alter table public.redaccion_notas add column if not exists limite_rojo int;
-- La papelera. Va suelta en redaccion_papelera.sql, que es el archivo
-- que hay que correr en una base que ya existía.
alter table public.redaccion_notas add column if not exists eliminada boolean not null default false;
alter table public.redaccion_notas add column if not exists eliminada_at timestamptz;

-- Configuración compartida de Redacción (secciones y tipos personalizados)
create table if not exists public.redaccion_config (
  clave  text primary key,                -- 'secciones' | 'tipos'
  valor  jsonb not null default '[]'::jsonb
);

create index if not exists redaccion_notas_edicion_idx
  on public.redaccion_notas (edicion_id, seccion);

create index if not exists redaccion_notas_papelera_idx
  on public.redaccion_notas (eliminada, eliminada_at desc);

-- ⚠️ LO DE ABAJO YA NO VALE. NO EJECUTAR ESTE ARCHIVO ENTERO.
-- Se escribió cuando la app era abierta. La seguridad por fila ya está
-- ENCENDIDA en estas tres tablas desde seguridad_familia_2_datos.sql, y
-- volver a correr estas tres líneas la apagaría: dejaría las notas de la
-- revista a la vista de cualquiera con la clave publicable, que va en el
-- código del navegador porque así se diseña.
-- Quedan aquí, comentadas, como recordatorio de por dónde se entraba.
--
-- alter table public.redaccion_ediciones disable row level security;
-- alter table public.redaccion_notas disable row level security;
-- alter table public.redaccion_config disable row level security;
