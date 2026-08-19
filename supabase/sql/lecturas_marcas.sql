-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada.
--
-- VA UN SOLO ARCHIVO, este. Depende de `seguridad_familia_1_puerta.sql`,
-- que es quien crea es_familia() y ya está corrido desde la mudanza a
-- privado. Si esa función no existiera, este archivo falla al crear las
-- políticas y no deja la tabla a medias.
-- ════════════════════════════════════════════════════════════════════
-- LO QUE CADA QUIEN SUBRAYA Y ANOTA EN LAS MISIONES
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   Dentro de cada misión se puede subrayar el texto con cinco colores
--   (dato, voz, idea, contracita, duda) y escribir notas. Hasta hoy eso
--   vivía SOLO en el aparato donde se leyó: quien estudiaba en la
--   tableta y seguía en el teléfono empezaba de cero, y quien cambiaba
--   de aparato perdía meses de trabajo sin ningún aviso.
--
--   Esta tabla es la copia que viaja. El aparato sigue siendo el que
--   manda para escribir y para leer al instante (funciona sin señal);
--   esto es lo que hace que al abrir la misma misión en otro aparato
--   esté todo ahí.
--
-- DE QUIÉN ES CADA MARCA: del USUARIO que entró, no del aparato. Los
--   cuatro de la casa comparten tabletas, y las notas de lectura de una
--   hija no tienen por qué aparecerle al padre. La llave es auth.uid()
--   y la seguridad por fila hace el resto: cada quien ve las suyas y
--   solo las suyas. Ni siquiera se puede contar las de otro.
--
-- POR QUÉ EL RELOJ DEL APARATO (columna `actualizado`): para poder
--   fusionar dos versiones de la misma marca hace falta saber cuál es
--   más nueva, y la comparación la hace el aparato, que puede estar sin
--   señal cuando escribe. Se sabe que el reloj de un teléfono puede
--   estar mal (la misma advertencia está en metas_sugerencias.sql). Por
--   eso el aparato NO descarta notas cuando fusiona: si dos versiones
--   traen texto escrito distinto, las conserva las dos, una debajo de
--   la otra. Un subrayado se vuelve a hacer en dos segundos; lo que
--   alguien escribió con sus palabras, no.
--
-- POR QUÉ SE BORRA CON UNA LÁPIDA Y NO DE VERDAD (columna `borrada`):
--   si el teléfono borrara la fila, la tableta que todavía tiene su
--   copia la volvería a subir en la siguiente sincronización, y la
--   marca resucitaría sola. Con la lápida, el borrado también viaja.
--   Lo enterrado hace más de 180 días se barre solo, abajo.
-- ════════════════════════════════════════════════════════════════════

-- ── La marca ────────────────────────────────────────────────────────
create table if not exists public.lecturas_marcas (
  -- El identificador NACE EN EL APARATO, no aquí. Hace falta porque la
  -- subida se reintenta: si la señal se corta a mitad, el teléfono no
  -- sabe si entró y lo vuelve a mandar. Con esto el segundo intento
  -- CORRIGE el primero en vez de dejar dos marcas gemelas.
  id            text primary key,

  user_id       uuid not null references auth.users(id) on delete cascade,

  -- La clave de progreso de la misión (SAVE_KEY), que ya es única por
  -- misión en todo el proyecto. Se guarda tal cual para no inventar un
  -- catálogo de misiones dentro de la base de datos: el catálogo vive
  -- en js/data/misiones.js y no debe haber dos.
  mision        text not null,

  -- Dónde está el subrayado: la zona (una lectura, «borges», o una
  -- sección de prosa, «s-aprende») y el número de párrafo dentro de
  -- ella, más el trozo exacto de caracteres.
  zona          text not null,
  parrafo       integer not null,
  ini           integer not null,
  fin           integer not null,

  -- El texto marcado. Se guarda aunque se pueda deducir de lo anterior,
  -- y es a propósito: es lo que permite volver a encontrar la marca si
  -- la misión se corrige y el texto se mueve, y es lo que se imprime en
  -- la hoja de repaso sin tener que abrir la misión.
  texto         text not null,

  color         text not null check (color in ('dato','voz','idea','contra','duda')),
  nota          text not null default '',

  borrada       boolean not null default false,

  -- Reloj del aparato en milisegundos, para fusionar. Ver la nota de
  -- arriba sobre por qué no se usa el del servidor.
  actualizado   bigint not null default 0,

  -- La fecha que ve la persona, tal como la puso su aparato.
  fecha         text,

  creado_at     timestamptz not null default now(),
  guardado_at   timestamptz not null default now()
);

-- La consulta que hace el marcador es siempre la misma: las marcas de
-- ESTA misión y de ESTE usuario.
create index if not exists lecturas_marcas_idx
  on public.lecturas_marcas (user_id, mision);

-- Cuándo tocó el servidor la fila por última vez. Sirve para la higiene
-- y para mirar desde el editor qué está pasando; la fusión NO lo usa.
-- `set search_path` fijo: sin él, un search_path manipulado podría
-- cambiar a qué apunta lo de dentro de la función. Es la misma
-- precaución que llevan las demás funciones de la casa.
create or replace function public.lecturas_marcas_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.guardado_at := now();
  return new;
end $$;

drop trigger if exists lecturas_marcas_touch on public.lecturas_marcas;
create trigger lecturas_marcas_touch
  before update on public.lecturas_marcas
  for each row execute function public.lecturas_marcas_touch();

-- ── La puerta ───────────────────────────────────────────────────────
-- Dos condiciones a la vez, y las dos hacen falta: es_familia() deja
-- fuera a cualquier autenticado que no sea de la casa, y la
-- comparación con auth.uid() deja fuera a los de la casa que no sean el
-- dueño de la marca. Es el mismo par que usa push_subscriptions.
alter table public.lecturas_marcas enable row level security;

drop policy if exists lecturas_marcas_select on public.lecturas_marcas;
create policy lecturas_marcas_select on public.lecturas_marcas
  for select to authenticated
  using (public.es_familia() and user_id = auth.uid());

drop policy if exists lecturas_marcas_insert on public.lecturas_marcas;
create policy lecturas_marcas_insert on public.lecturas_marcas
  for insert to authenticated
  with check (public.es_familia() and user_id = auth.uid());

drop policy if exists lecturas_marcas_update on public.lecturas_marcas;
create policy lecturas_marcas_update on public.lecturas_marcas
  for update to authenticated
  using (public.es_familia() and user_id = auth.uid())
  with check (public.es_familia() and user_id = auth.uid());

drop policy if exists lecturas_marcas_delete on public.lecturas_marcas;
create policy lecturas_marcas_delete on public.lecturas_marcas
  for delete to authenticated
  using (public.es_familia() and user_id = auth.uid());

-- Con la clave publicable, sin sesión, no se puede ni mirar. Esto no es
-- una tabla de las que tienen puerta pública como el Buzón: aquí solo
-- entra quien entró.
revoke all on public.lecturas_marcas from anon;
grant select, insert, update, delete on public.lecturas_marcas to authenticated;

-- ── Higiene ─────────────────────────────────────────────────────────
-- Las lápidas no se guardan para siempre: pasados 180 días, cualquier
-- aparato que siguiera vivo con esa marca ya sincronizó cien veces.
create or replace function public.lecturas_marcas_higiene()
returns integer language sql security definer set search_path = public as $$
  with borradas as (
    delete from public.lecturas_marcas
     where borrada = true
       and guardado_at < now() - interval '180 days'
    returning 1
  )
  select count(*)::integer from borradas;
$$;

-- La higiene corre con los permisos de quien la creó (security definer),
-- así que NO puede quedar al alcance de cualquiera: con la clave
-- publicable, que va en el código y la lee todo el mundo, se podría
-- llamar a mano. Se le cierra la puerta a todos y se deja solo para el
-- administrador o para una tarea programada.
revoke execute on function public.lecturas_marcas_higiene() from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA QUE QUEDÓ PUESTO (no basta con el «Success»)
-- ════════════════════════════════════════════════════════════════════
-- 1) La tabla existe y tiene sus trece columnas:
--      select column_name, data_type
--        from information_schema.columns
--       where table_name = 'lecturas_marcas'
--       order by ordinal_position;
--
-- 2) La seguridad por fila está ENCENDIDA (tiene que decir true):
--      select relrowsecurity from pg_class
--       where oid = 'public.lecturas_marcas'::regclass;
--
-- 3) Las cuatro políticas están puestas (tienen que salir cuatro):
--      select policyname, cmd from pg_policies
--       where tablename = 'lecturas_marcas' order by policyname;
--
-- 4) La prueba de verdad, y es la única que cuenta: entrar en una
--    misión, subrayar algo, y ver que el panel «Mis marcas y mis notas»
--    dice «☁️ Guardado también en la nube». Después:
--      select mision, zona, color, left(texto, 40) as trozo, nota
--        from public.lecturas_marcas order by creado_at desc limit 5;
--    Tiene que salir la marca recién hecha. Si sale vacío pero el panel
--    decía que sí, es que la sesión no llegó a la misión: se entra
--    primero en F.A.R.O por la puerta y se vuelve a abrir la misión. Las
--    misiones NO cargan la puerta de antemano a propósito (norma
--    5-septies): el marcador se trae Supabase solo cuando ya hay sesión
--    guardada en ese navegador, para que abrir una misión no pida red.
-- ════════════════════════════════════════════════════════════════════
