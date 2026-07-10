-- Ejecutar en Supabase -> SQL Editor.
-- ANTENA 📡 — Fase 1: tablas, seguridad y almacenamiento.
--
-- IMPORTANTE: a diferencia del resto de F.A.R.O., este módulo maneja
-- tokens de acceso a redes sociales. Por eso TODAS sus tablas llevan
-- RLS activado, solo usuarios autorizados (allowlist de correos) las
-- tocan, y las columnas de tokens son invisibles para el navegador
-- (solo las Edge Functions con service_role las leen).

-- ─────────────────────────────────────────────
-- 1. Allowlist: solo estos correos usan Antena
-- ─────────────────────────────────────────────
create table if not exists public.antena_usuarios_permitidos (
  email      text primary key,
  agregado_at timestamptz not null default now()
);

insert into public.antena_usuarios_permitidos (email)
values ('jepl@ejos.page')          -- Josué
-- , ('correo-de-evelyn@ejemplo.com')  -- descomentar y ajustar para Evelyn
on conflict do nothing;

alter table public.antena_usuarios_permitidos enable row level security;
revoke all on table public.antena_usuarios_permitidos from anon, authenticated;
-- (sin policies = solo service_role puede leerla)

-- ¿El usuario con sesión está en la allowlist?
create or replace function public.antena_autorizado()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.antena_usuarios_permitidos
    where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$$;

-- ─────────────────────────────────────────────
-- 2. Cuentas conectadas (tokens OAuth cifrados)
-- ─────────────────────────────────────────────
create table if not exists public.antena_cuentas (
  id                bigint generated always as identity primary key,
  usuario_id        uuid not null references auth.users(id) on delete cascade,
  plataforma        text not null check (plataforma in ('x','facebook','youtube','tiktok')),
  cuenta_externa_id text not null,        -- id en la plataforma (user_id, page_id, channel_id)
  nombre_visible    text,                 -- "@PolicastSapien", "Canal PolicastSapien"
  access_token      text not null,        -- SOLO service_role (ver grants abajo)
  refresh_token     text,                 -- SOLO service_role
  token_expira_at   timestamptz,
  scopes            text[],
  estado            text not null default 'activa'
    check (estado in ('activa','requiere_reconexion')),
  conectada_at      timestamptz not null default now(),
  actualizado_at    timestamptz not null default now(),
  unique (plataforma, cuenta_externa_id)
);

alter table public.antena_cuentas enable row level security;
revoke all on table public.antena_cuentas from anon, authenticated;

-- El navegador puede ver SUS cuentas pero NUNCA las columnas de tokens
grant select (id, usuario_id, plataforma, cuenta_externa_id, nombre_visible,
              token_expira_at, scopes, estado, conectada_at)
  on public.antena_cuentas to authenticated;
grant delete on public.antena_cuentas to authenticated;  -- desconectar cuenta

create policy antena_cuentas_select on public.antena_cuentas
  for select to authenticated
  using (public.antena_autorizado() and usuario_id = auth.uid());
create policy antena_cuentas_delete on public.antena_cuentas
  for delete to authenticated
  using (public.antena_autorizado() and usuario_id = auth.uid());

-- ─────────────────────────────────────────────
-- 3. Publicaciones (el contenido)
-- ─────────────────────────────────────────────
create table if not exists public.antena_publicaciones (
  id             bigint generated always as identity primary key,
  usuario_id     uuid not null references auth.users(id) on delete cascade,
  creado_at      timestamptz not null default now(),
  titulo         text,                    -- para YouTube
  cuerpo         text not null default '',
  media_path     text,                    -- ruta en el bucket antena-media
  media_tipo     text check (media_tipo in ('imagen','video')),
  programada_at  timestamptz,
  estado         text not null default 'borrador'
    check (estado in ('borrador','programada','publicando','publicada','error','cancelada'))
);

create index if not exists antena_pub_estado_idx
  on public.antena_publicaciones (estado, programada_at);

alter table public.antena_publicaciones enable row level security;
revoke all on table public.antena_publicaciones from anon;

create policy antena_pub_all on public.antena_publicaciones
  for all to authenticated
  using (public.antena_autorizado() and usuario_id = auth.uid())
  with check (public.antena_autorizado() and usuario_id = auth.uid());

-- ─────────────────────────────────────────────
-- 4. Destinos (una publicación → N redes)
-- ─────────────────────────────────────────────
create table if not exists public.antena_destinos (
  id               bigint generated always as identity primary key,
  publicacion_id   bigint not null references public.antena_publicaciones(id) on delete cascade,
  cuenta_id        bigint not null references public.antena_cuentas(id) on delete cascade,
  estado           text not null default 'pendiente'
    check (estado in ('pendiente','publicando','publicada','error','cancelada')),
  intentos         int not null default 0,
  ultimo_error     text,
  post_externo_id  text,                  -- id del tweet/post/video creado
  publicado_at     timestamptz,
  clave_idem       uuid not null default gen_random_uuid(),
  unique (publicacion_id, cuenta_id)
);

create index if not exists antena_dest_estado_idx
  on public.antena_destinos (estado);

alter table public.antena_destinos enable row level security;
revoke all on table public.antena_destinos from anon;
revoke update on table public.antena_destinos from authenticated;  -- estados los maneja el worker

create policy antena_dest_select on public.antena_destinos
  for select to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_publicaciones p
    where p.id = publicacion_id and p.usuario_id = auth.uid()));
create policy antena_dest_insert on public.antena_destinos
  for insert to authenticated
  with check (public.antena_autorizado() and exists (
    select 1 from public.antena_publicaciones p
    where p.id = publicacion_id and p.usuario_id = auth.uid()));
create policy antena_dest_delete on public.antena_destinos
  for delete to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_publicaciones p
    where p.id = publicacion_id and p.usuario_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 5. Métricas (las escribe solo el worker)
-- ─────────────────────────────────────────────
create table if not exists public.antena_metricas (
  id           bigint generated always as identity primary key,
  destino_id   bigint not null references public.antena_destinos(id) on delete cascade,
  capturado_at timestamptz not null default now(),
  vistas       bigint not null default 0,
  likes        int not null default 0,
  comentarios  int not null default 0,
  compartidos  int not null default 0
);

alter table public.antena_metricas enable row level security;
revoke all on table public.antena_metricas from anon;
revoke insert, update, delete on table public.antena_metricas from authenticated;

create policy antena_met_select on public.antena_metricas
  for select to authenticated
  using (public.antena_autorizado() and exists (
    select 1 from public.antena_destinos d
    join public.antena_publicaciones p on p.id = d.publicacion_id
    where d.id = destino_id and p.usuario_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 6. Almacenamiento: bucket privado para media
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('antena-media', 'antena-media', false, 524288000)  -- 500 MB por archivo
on conflict (id) do nothing;

-- Si esta política da error de permisos, créala desde el Dashboard:
-- Storage -> antena-media -> Policies (misma condición).
create policy antena_media_rw on storage.objects
  for all to authenticated
  using (bucket_id = 'antena-media' and public.antena_autorizado())
  with check (bucket_id = 'antena-media' and public.antena_autorizado());
