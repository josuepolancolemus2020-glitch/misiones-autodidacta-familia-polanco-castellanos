-- Ejecutar en Supabase -> SQL Editor.
-- ANTENA 📡 — Fase 5b: EL OBSERVATORIO.
--
-- Giro de rumbo: publicar se hace desde la app de cada red (Facebook
-- lo hace mejor). Antena ahora OBSERVA: recorre el feed de la Página
-- (se publique desde donde se publique), guarda la evolución de las
-- métricas de cada post, los comentarios pendientes de responder y
-- la historia de seguidores. El compositor de Fase 2-5a queda dormido.
--
-- El recolector (Edge Function antena-metricas, cron cada 4 h) es el
-- único que escribe aquí; el navegador solo lee (y marca comentarios
-- como atendidos).

-- ─────────────────────────────────────────────
-- 1. Posts descubiertos en el feed de la Página
-- ─────────────────────────────────────────────
create table if not exists public.antena_posts (
  id               bigint generated always as identity primary key,
  cuenta_id        bigint not null references public.antena_cuentas(id) on delete cascade,
  post_externo_id  text not null,
  mensaje          text,
  permalink        text,
  creado_en_red    timestamptz,
  actualizado_at   timestamptz not null default now(),
  unique (cuenta_id, post_externo_id)
);

alter table public.antena_posts enable row level security;
revoke all on table public.antena_posts from anon;
revoke insert, update, delete on table public.antena_posts from authenticated;

create policy antena_posts_select on public.antena_posts
  for select to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_cuentas c
    where c.id = cuenta_id and c.usuario_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 2. Snapshots de métricas por post
-- ─────────────────────────────────────────────
create table if not exists public.antena_post_metricas (
  id           bigint generated always as identity primary key,
  post_id      bigint not null references public.antena_posts(id) on delete cascade,
  capturado_at timestamptz not null default now(),
  vistas       bigint not null default 0,
  likes        int not null default 0,
  comentarios  int not null default 0,
  compartidos  int not null default 0
);

create index if not exists antena_post_met_idx
  on public.antena_post_metricas (post_id, capturado_at desc);

alter table public.antena_post_metricas enable row level security;
revoke all on table public.antena_post_metricas from anon;
revoke insert, update, delete on table public.antena_post_metricas from authenticated;

create policy antena_post_met_select on public.antena_post_metricas
  for select to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_posts p
    join public.antena_cuentas c on c.id = p.cuenta_id
    where p.id = post_id and c.usuario_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 3. Comentarios (para responder a la audiencia)
-- ─────────────────────────────────────────────
create table if not exists public.antena_comentarios (
  id                     bigint generated always as identity primary key,
  post_id                bigint not null references public.antena_posts(id) on delete cascade,
  comentario_externo_id  text not null unique,
  autor                  text,
  mensaje                text,
  permalink              text,
  creado_en_red          timestamptz,
  respondido_pagina      boolean not null default false, -- la Página ya le respondió
  atendida               boolean not null default false  -- marcado a mano en la app
);

create index if not exists antena_com_pend_idx
  on public.antena_comentarios (respondido_pagina, atendida, creado_en_red desc);

alter table public.antena_comentarios enable row level security;
revoke all on table public.antena_comentarios from anon;
revoke insert, update, delete on table public.antena_comentarios from authenticated;
grant update (atendida) on public.antena_comentarios to authenticated;

create policy antena_com_select on public.antena_comentarios
  for select to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_posts p
    join public.antena_cuentas c on c.id = p.cuenta_id
    where p.id = post_id and c.usuario_id = auth.uid()));
create policy antena_com_update on public.antena_comentarios
  for update to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_posts p
    join public.antena_cuentas c on c.id = p.cuenta_id
    where p.id = post_id and c.usuario_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 4. Historia de seguidores de la Página
-- ─────────────────────────────────────────────
create table if not exists public.antena_pagina_metricas (
  id           bigint generated always as identity primary key,
  cuenta_id    bigint not null references public.antena_cuentas(id) on delete cascade,
  capturado_at timestamptz not null default now(),
  seguidores   int not null default 0
);

alter table public.antena_pagina_metricas enable row level security;
revoke all on table public.antena_pagina_metricas from anon;
revoke insert, update, delete on table public.antena_pagina_metricas from authenticated;

create policy antena_pag_met_select on public.antena_pagina_metricas
  for select to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_cuentas c
    where c.id = cuenta_id and c.usuario_id = auth.uid()));
