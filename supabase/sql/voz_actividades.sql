-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada.
--
-- VA UN SOLO ARCHIVO, este, y DESPUÉS su comprobación
-- (voz_actividades_comprueba.sql), que son veinte líneas y solo miran.
-- Depende de `seguridad_familia_1_puerta.sql`, que es quien crea
-- es_familia() y ya está corrido desde la mudanza a privado.
-- ════════════════════════════════════════════════════════════════════
-- EL TALLER DE COMPRENSIÓN DE LA VOZ PRESTADA
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   Un ensayo leído de corrido en una tableta se siente entendido
--   mientras se lee y se ha ido a los tres días. Esta tabla guarda las
--   actividades con que se comprueba que lo leído se quedó: tarjetas de
--   memoria, parejas para emparejar, preguntas de selección, de
--   completar y abiertas.
--
-- DE QUIÉN SON: DE LA CASA, como el texto y por lo mismo. Los cuatro
--   las ven y los cuatro las hacen; cambiarlas o quitarlas es solo de
--   quien las puso, y eso lo hace cumplir la seguridad por fila. Un
--   cuestionario que solo pudiera ver quien lo pegó convierte «hazle
--   las preguntas a tu hermana» en «pásame tu sesión».
--
-- LO QUE NO ESTÁ AQUÍ, Y ES A PROPÓSITO: el AVANCE —qué acertó cada
--   quien, qué le toca repasar hoy— NO viaja. Vive en el aparato, como
--   la posición de lectura y por la misma razón: en esta casa el mismo
--   texto lo leen cuatro personas, y un avance común significa que la
--   hija abre el taller y se encuentra contestado lo del padre.
--
-- POR QUÉ UNA TABLA APARTE Y NO UNA COLUMNA DE `voz_prestada`: el
--   anaquel se baja ENTERO al abrir la herramienta, con los capítulos
--   de todos los textos dentro. Colgarle las actividades haría más
--   lenta la pantalla que tiene que abrir al instante, para traer algo
--   que solo se mira al abrir un taller. Aquí se bajan cuando hacen
--   falta.
--
-- POR QUÉ SE BORRA CON UNA LÁPIDA (columna `borrada`): si un aparato
--   borrara la fila, la tableta que todavía tiene su copia la volvería
--   a subir en la siguiente sincronización y el taller resucitaría
--   solo. Es la misma razón que en `voz_prestada` y en la repisa.
-- ════════════════════════════════════════════════════════════════════

-- ── Las dependencias, antes de nada ─────────────────────────────────
-- El editor corre TODO el pegado dentro de una sola transacción: si
-- algo falla al final, se deshace el pegado entero y el error que se ve
-- puede hablar de otra cosa. Ocho líneas que ahorran la tarde.
do $$
begin
  if to_regprocedure('public.es_familia()') is null then
    raise exception 'Falta la función es_familia(). Corre antes supabase/sql/seguridad_familia_1_puerta.sql y vuelve a pegar este archivo.';
  end if;
end $$;

-- ── El taller de un texto ───────────────────────────────────────────
create table if not exists public.voz_actividades (
  -- La llave es el `cid` del texto: un taller por texto, y el mismo
  -- identificador que ya usa `voz_prestada`. Sin una llave propia, dos
  -- aparatos que pegaran actividades a la vez dejarían dos talleres
  -- para el mismo cuento y ninguno sabría cuál mirar.
  cid           text primary key,

  -- Las actividades, tal como las guarda el aparato. Es un objeto libre
  -- a propósito (la misma regla 8 de la repisa de enlaces): los cinco
  -- tipos y sus campos viven en VOZ_ACT_TIPOS, dentro de
  -- js/tools/voz-prestada.js. Añadir un tipo tiene que ser una línea en
  -- un archivo, no una migración que alguien pega desde una tableta.
  items         jsonb not null default '[]'::jsonb,

  -- ⚠️ QUIÉN LO PUSO, Y NO PUEDE QUEDAR VACÍO. Es la lección cara del
  -- 10 de septiembre de 2026 en voz_prestada: el aparato no mandaba la
  -- firma, la base rechazaba la fila en silencio, y desde fuera parecía
  -- un problema de señal. El aparato la manda y aquí está el respaldo.
  puesto_por    uuid not null default auth.uid() references auth.users(id) on delete cascade,

  borrada       boolean not null default false,

  -- Reloj del APARATO en milisegundos, para fusionar dos copias. La
  -- comparación la hace el aparato, que puede estar sin señal cuando
  -- escribe; por eso no se usa el del servidor.
  actualizado   bigint not null default 0,

  creado_at     timestamptz not null default now(),
  guardado_at   timestamptz not null default now(),

  -- ⚠️ QUE SEA UNA LISTA, Y NO CUALQUIER COSA. Sin esto, un cliente con
  -- un error podría dejar aquí un objeto o un número y la pantalla
  -- reventaría al recorrerlo — en el aparato de otra persona, que es
  -- donde no se puede depurar.
  constraint voz_actividades_items_lista check (jsonb_typeof(items) = 'array'),

  -- Y un tope de tamaño: un taller son decenas de actividades, no un
  -- libro. Cien mil caracteres es diez veces lo que cabe pegar a mano y
  -- sigue siendo una fila que viaja rápido por la señal de una tableta.
  constraint voz_actividades_items_cabe check (length(items::text) <= 100000)
);

-- Por si la tabla ya existía de una versión anterior sin alguna
-- columna: `create table if not exists` no toca una tabla que ya está,
-- así que las que se añadan después van aquí, una por una.
alter table public.voz_actividades add column if not exists borrada boolean not null default false;
alter table public.voz_actividades add column if not exists actualizado bigint not null default 0;

-- La consulta que hace la herramienta es siempre la misma: todo lo que
-- se puede ver, para saber qué textos tienen taller.
create index if not exists voz_actividades_idx on public.voz_actividades (actualizado desc);

-- Cuándo tocó el servidor la fila por última vez. Sirve para la higiene
-- y para mirar desde el editor qué está pasando; la fusión NO lo usa.
-- `set search_path` fijo: sin él, un search_path manipulado podría
-- cambiar a qué apunta lo de dentro de la función.
create or replace function public.voz_actividades_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.guardado_at := now();
  return new;
end $$;

drop trigger if exists voz_actividades_touch on public.voz_actividades;
create trigger voz_actividades_touch
  before update on public.voz_actividades
  for each row execute function public.voz_actividades_touch();

-- ── La puerta ───────────────────────────────────────────────────────
-- LEER: cualquiera de la casa, porque el taller es de la casa.
-- ESCRIBIR: solo quien lo puso, y sin poder cambiarle el dueño a una
-- fila ajena. Son dos condiciones a la vez y las dos hacen falta:
-- es_familia() deja fuera a cualquier autenticado que no sea de aquí, y
-- la comparación con auth.uid() deja fuera a los de la casa que no
-- pusieron esa fila.
alter table public.voz_actividades enable row level security;

drop policy if exists voz_actividades_select on public.voz_actividades;
create policy voz_actividades_select on public.voz_actividades
  for select to authenticated
  using (public.es_familia());

drop policy if exists voz_actividades_insert on public.voz_actividades;
create policy voz_actividades_insert on public.voz_actividades
  for insert to authenticated
  with check (public.es_familia() and puesto_por = auth.uid());

drop policy if exists voz_actividades_update on public.voz_actividades;
create policy voz_actividades_update on public.voz_actividades
  for update to authenticated
  using (public.es_familia() and puesto_por = auth.uid())
  with check (public.es_familia() and puesto_por = auth.uid());

-- ⚠️ NO HAY POLÍTICA DE `delete`, Y ES A PROPÓSITO. Se retira con
-- lápida (`borrada`), por lo mismo que en voz_prestada: si un aparato
-- borrara la fila, la tableta que todavía tiene su copia la subiría
-- otra vez y el taller resucitaría solo.

-- Con la clave publicable, sin sesión, no se puede ni mirar: esto no es
-- una tabla con puerta pública como el Buzón. Aquí solo entra quien
-- entró por la puerta de la casa.
revoke all on public.voz_actividades from anon;
grant select, insert, update on public.voz_actividades to authenticated;

-- ── Higiene ─────────────────────────────────────────────────────────
-- Las lápidas no se guardan para siempre: pasados 180 días, cualquier
-- aparato que siguiera vivo con ese taller ya sincronizó cien veces.
create or replace function public.voz_actividades_higiene()
returns integer language sql security definer set search_path = public as $$
  with borradas as (
    delete from public.voz_actividades
     where borrada = true
       and guardado_at < now() - interval '180 days'
    returning 1
  )
  select count(*)::integer from borradas;
$$;

-- Corre con los permisos de quien la creó (security definer), así que
-- NO puede quedar al alcance de cualquiera: con la clave publicable, que
-- va en el código y la lee todo el mundo, se podría llamar a mano.
revoke execute on function public.voz_actividades_higiene() from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- Y AHORA CORRE supabase/sql/voz_actividades_comprueba.sql
-- ════════════════════════════════════════════════════════════════════
-- Son veinte líneas que solo MIRAN y dicen, en vertical y una fila por
-- cosa, si esto quedó puesto. No te fíes del «Success» del editor: un
-- «Success. No rows returned» no distingue entre «quedó» y «se pegó a
-- medias».
-- ════════════════════════════════════════════════════════════════════
