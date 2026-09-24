-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE LA PAPELERA DE REDACCIÓN
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra notas de mentira,
--    borra tablas y toca los permisos. Es para una base de usar y tirar.
--
-- La papelera son dos columnas y un índice, y aun así se prueba, porque
-- lo que puede salir mal no está en esas tres líneas sino alrededor:
--
--   · que la guardia PARE nombrando el archivo que falta, y que la pare
--     el texto DE VERDAD del archivo (se saca de él con sed, no se copia
--     aquí: una copia aprobaría el día que alguien rompiera el original);
--   · que las notas que YA EXISTEN no desaparezcan de las listas al
--     correrlo: el `not null default false` tiene que rellenarlas;
--   · que no toque la seguridad por fila ni la política de siempre, y
--     que con esa política la casa pueda mandar a la papelera, restaurar
--     y vaciar, y nadie de fuera pueda nada;
--   · que sea IDEMPOTENTE, en la base vieja (sin las columnas) y en una
--     base nueva hecha con redaccion_tables.sql, que ya las trae;
--   · y que la comprobación aparte no reviente en ninguno de los tres
--     estados: sin tabla, con la tabla pero SIN las columnas (la
--     papelera sin correr, que es el caso para el que existe) y con todo.
--
-- Cómo correrla (con el servidor de la sesión levantado como dice
-- CLAUDE.md en el apartado de La Voz Prestada), DESDE LA RAÍZ del
-- repositorio, porque saca la guardia del archivo con una ruta relativa:
--
--   createdb -h /tmp/pg -p 55432 -U postgres papeleratest
--   psql -h /tmp/pg -p 55432 -U postgres -v ON_ERROR_STOP=1 -d papeleratest -f _dev/prueba-redaccion-papelera-sql.sql
--
-- Termina con «RESULTADO: APRUEBA» o revienta en el primer fallo.
-- ════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

-- ── El Supabase mínimo que este archivo da por hecho ────────────────
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
end $$;
grant usage on schema public to anon, authenticated;

create schema if not exists auth;
grant usage on schema auth to anon, authenticated;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid
  language sql stable as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;

-- Quién es de la casa se decide con un ajuste de la sesión, para poder
-- pasar de «uno de los cuatro» a «alguien con cuenta que no lo es» sin
-- redefinir nada a mitad de prueba.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select coalesce(current_setting('prueba.familia', true), '') = 'si' $$;

drop table if exists public.redaccion_notas;
drop table if exists public.redaccion_ediciones;
drop table if exists public.redaccion_config;

-- ════════════════════════════════════════════════════════════════════
-- 0. SIN LA TABLA, LA GUARDIA DEL ARCHIVO PARA Y DICE QUÉ CORRER
-- ════════════════════════════════════════════════════════════════════
-- Se saca del archivo de verdad, del «do $guardia$» a su cierre.
\set guardia `sed -n '/^do \$guardia\$/,/^\$guardia\$;/p' supabase/sql/redaccion_papelera.sql`
select set_config('prueba.guardia', :'guardia', false) is not null;

do $$
declare msg text; g text := current_setting('prueba.guardia');
begin
  if position('redaccion_notas' in g) = 0 then
    raise exception '0a. no se encontró la guardia dentro de supabase/sql/redaccion_papelera.sql (¿se corre desde la raíz del repositorio?)';
  end if;
  begin
    execute g;
    raise exception '0b. la guardia NO paró sin la tabla redaccion_notas';
  exception when others then
    get stacked diagnostics msg = message_text;
    if msg like '0b.%' then raise exception '%', msg; end if;
    if msg not like '%redaccion_tables.sql%' then
      raise exception '0c. la guardia paró pero sin nombrar el archivo que falta: %', msg;
    end if;
  end;
end $$;
\echo '  ✔ 0. sin redaccion_notas, la guardia del archivo para y nombra redaccion_tables.sql'

-- ── La comprobación aparte, SIN la tabla: no revienta ───────────────
\pset tuples_only off
\pset format aligned
\echo '── redaccion_papelera_comprueba.sql, sin la tabla ──'
\i supabase/sql/redaccion_papelera_comprueba.sql
\pset tuples_only on
\pset format unaligned

-- ════════════════════════════════════════════════════════════════════
-- LA BASE VIEJA: redaccion_notas como estaba ANTES de la papelera, con
-- la seguridad por fila y la política que le dejó
-- seguridad_familia_2_datos.sql, y tres notas escritas.
-- ════════════════════════════════════════════════════════════════════
create table public.redaccion_ediciones (
  id            bigint generated always as identity primary key,
  creado_at     timestamptz not null default now(),
  numero        int not null,
  titulo        text not null,
  fecha_cierre  date,
  archivada     boolean not null default false
);
create table public.redaccion_notas (
  id              bigint generated always as identity primary key,
  creado_at       timestamptz not null default now(),
  actualizado_at  timestamptz not null default now(),
  edicion_id      bigint references public.redaccion_ediciones(id) on delete set null,
  autor           text not null,
  titulo          text not null default '',
  seccion         text not null default 'ACTUALIDAD',
  tipo            text not null default 'Artículo',
  estado          text not null default 'idea',
  entradilla      text not null default '',
  cuerpo          text not null default '',
  en_portada      boolean not null default false,
  limite_amarillo int,
  limite_rojo     int
);
alter table public.redaccion_notas enable row level security;
create policy redaccion_notas_familia on public.redaccion_notas for all to authenticated
  using (public.es_familia()) with check (public.es_familia());
-- Como los reparte Supabase: el permiso de tabla abierto a los dos. Lo
-- que guarda las notas es la seguridad por fila, y eso es lo que se prueba.
grant all on all tables in schema public to anon, authenticated;

insert into public.redaccion_notas (autor, titulo) values
  ('josue', 'La nota de la tarde'), ('evelyn', 'Una idea'), ('josue', 'El borrador');

-- ── La comprobación aparte, con la tabla y SIN las columnas ─────────
-- Es el caso para el que existe (la papelera sin correr), y el que
-- revienta si alguien cuenta con un `select count(*) … where eliminada`
-- directo: PostgreSQL planifica la consulta entera antes de ejecutarla.
\pset tuples_only off
\pset format aligned
\echo '── redaccion_papelera_comprueba.sql, con la tabla y sin las columnas ──'
\i supabase/sql/redaccion_papelera_comprueba.sql
\pset tuples_only on
\pset format unaligned

-- ════════════════════════════════════════════════════════════════════
-- 1. EL ARCHIVO, DOS VECES Y COMO LO CORRE EL EDITOR (una transacción)
-- ════════════════════════════════════════════════════════════════════
\echo '── Corriendo supabase/sql/redaccion_papelera.sql ──'
begin;
\i supabase/sql/redaccion_papelera.sql
commit;
\echo '── Y otra vez, que tiene que ser idempotente ──'
begin;
\i supabase/sql/redaccion_papelera.sql
commit;

do $$
declare n int; t text; nulo text; def text;
begin
  select data_type, is_nullable, column_default into t, nulo, def
    from information_schema.columns
   where table_schema = 'public' and table_name = 'redaccion_notas' and column_name = 'eliminada';
  if t is distinct from 'boolean' or nulo <> 'NO' or def is distinct from 'false' then
    raise exception '1a. la columna eliminada quedó como %, nula=%, por defecto=%', t, nulo, def;
  end if;
  select data_type, is_nullable into t, nulo
    from information_schema.columns
   where table_schema = 'public' and table_name = 'redaccion_notas' and column_name = 'eliminada_at';
  if t is distinct from 'timestamp with time zone' or nulo <> 'YES' then
    raise exception '1b. la columna eliminada_at quedó como %, nula=%', t, nulo;
  end if;
  select count(*) into n from pg_indexes
   where schemaname = 'public' and tablename = 'redaccion_notas' and indexname = 'redaccion_notas_papelera_idx';
  if n <> 1 then raise exception '1c. hay % índices de la papelera (esperaba 1)', n; end if;
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'redaccion_notas';
  if n <> 16 then raise exception '1d. la tabla tiene % columnas (esperaba las 14 de antes y las 2 nuevas)', n; end if;
end $$;
\echo '  ✔ 1. dos veces seguidas: dos columnas con su forma y un solo índice'

-- ════════════════════════════════════════════════════════════════════
-- 2. LO QUE YA ESTABA NO DESAPARECE
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  select count(*) into n from public.redaccion_notas where eliminada = false and eliminada_at is null;
  if n <> 3 then raise exception '2a. de las 3 notas de antes, solo % siguen a la vista', n; end if;
end $$;
\echo '  ✔ 2. las tres notas de antes entran como no eliminadas: nada se va de las listas'

-- ════════════════════════════════════════════════════════════════════
-- 3. NO TOCÓ LA PUERTA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int; rls boolean;
begin
  select relrowsecurity into rls from pg_class where oid = 'public.redaccion_notas'::regclass;
  if not rls then raise exception '3a. la seguridad por fila se APAGÓ'; end if;
  select count(*) into n from pg_policies where schemaname = 'public' and tablename = 'redaccion_notas';
  if n <> 1 then raise exception '3b. hay % políticas (esperaba la de siempre, sola)', n; end if;
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'redaccion_notas' and policyname = 'redaccion_notas_familia';
  if n <> 1 then raise exception '3c. la política de siempre ya no está'; end if;
end $$;
\echo '  ✔ 3. la seguridad por fila y la política de siempre siguen como estaban'

-- ════════════════════════════════════════════════════════════════════
-- 4. CON ESA POLÍTICA, LA CASA MANDA A LA PAPELERA, RESTAURA Y VACÍA;
--    Y DE FUERA NADIE PUEDE NADA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  -- Uno de la casa: lo que hace «Eliminar» ahora es un update
  perform set_config('prueba.familia', 'si', false);
  set role authenticated;
  update public.redaccion_notas set eliminada = true, eliminada_at = now()
   where titulo = 'La nota de la tarde';
  get diagnostics n = row_count;
  if n <> 1 then reset role; raise exception '4a. mandar a la papelera cambió % filas (esperaba 1)', n; end if;
  -- La pantalla la busca así (el chip 🗑️ Papelera)
  select count(*) into n from public.redaccion_notas where eliminada = true;
  if n <> 1 then reset role; raise exception '4b. en la papelera hay % (esperaba 1)', n; end if;
  -- Y vuelve entera
  update public.redaccion_notas set eliminada = false, eliminada_at = null
   where titulo = 'La nota de la tarde';
  get diagnostics n = row_count;
  if n <> 1 then reset role; raise exception '4c. restaurar cambió % filas', n; end if;
  -- Vaciar la papelera sí borra, a conciencia
  update public.redaccion_notas set eliminada = true, eliminada_at = now() where titulo = 'Una idea';
  delete from public.redaccion_notas where eliminada = true;
  get diagnostics n = row_count;
  if n <> 1 then reset role; raise exception '4d. vaciar la papelera borró % (esperaba 1)', n; end if;
  reset role;

  -- Alguien con cuenta que NO es de la casa: con la seguridad por fila
  -- puesta, su update no da error… y no cambia nada. Es la razón por la
  -- que la comprobación enseña la política.
  perform set_config('prueba.familia', 'no', false);
  set role authenticated;
  select count(*) into n from public.redaccion_notas;
  if n <> 0 then reset role; raise exception '4e. un ajeno ve % notas', n; end if;
  update public.redaccion_notas set eliminada = true where true;
  get diagnostics n = row_count;
  if n <> 0 then reset role; raise exception '4f. un ajeno mandó % notas a la papelera', n; end if;
  reset role;

  -- anon, con el permiso de tabla que da Supabase
  set role anon;
  select count(*) into n from public.redaccion_notas;
  if n <> 0 then reset role; raise exception '4g. anon ve % notas', n; end if;
  update public.redaccion_notas set eliminada = true where true;
  get diagnostics n = row_count;
  if n <> 0 then reset role; raise exception '4h. anon mandó % notas a la papelera', n; end if;
  reset role;

  select count(*) into n from public.redaccion_notas where eliminada = false;
  if n <> 2 then raise exception '4i. quedaron % notas a la vista (esperaba 2)', n; end if;
end $$;
\echo '  ✔ 4. la casa manda a la papelera, restaura y vacía; un ajeno y anon no cambian nada'

-- ── La comprobación aparte, con todo puesto ─────────────────────────
\pset tuples_only off
\pset format aligned
\echo '── redaccion_papelera_comprueba.sql, con todo puesto ──'
\i supabase/sql/redaccion_papelera_comprueba.sql
\pset tuples_only on
\pset format unaligned

do $$
declare n int;
begin
  -- Lo que la comprobación dice tiene que ser lo que hay: la fila 9 cuenta
  -- la papelera con query_to_xml, y aquí se compara con la cuenta directa.
  update public.redaccion_notas set eliminada = true, eliminada_at = now() where titulo = 'El borrador';
  select (xpath('/row/c/text()', query_to_xml(
           'select count(*) as c from public.redaccion_notas where eliminada = true',
           false, true, '')))[1]::text::int into n;
  if n <> 1 then raise exception '5a. la cuenta de la comprobación da % (esperaba 1)', n; end if;
end $$;
\echo '  ✔ 5. la comprobación aparte corre en los tres estados y cuenta lo que hay'

-- ════════════════════════════════════════════════════════════════════
-- 6. UNA BASE NUEVA, HECHA CON redaccion_tables.sql, YA TRAE LA
--    PAPELERA: correr este archivo encima no rompe nada ni duplica.
-- ════════════════════════════════════════════════════════════════════
drop table public.redaccion_notas;
drop table public.redaccion_ediciones;
\i supabase/sql/redaccion_tables.sql
begin;
\i supabase/sql/redaccion_papelera.sql
commit;

do $$
declare n int;
begin
  select count(*) into n from pg_indexes
   where schemaname = 'public' and tablename = 'redaccion_notas' and indexname = 'redaccion_notas_papelera_idx';
  if n <> 1 then raise exception '6a. hay % índices de la papelera en la base nueva', n; end if;
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'redaccion_notas'
     and column_name in ('eliminada', 'eliminada_at');
  if n <> 2 then raise exception '6b. la base nueva tiene % de las 2 columnas', n; end if;
end $$;
\echo '  ✔ 6. sobre una base hecha con redaccion_tables.sql, no rompe ni duplica'

\echo ''
\echo 'RESULTADO: APRUEBA'
