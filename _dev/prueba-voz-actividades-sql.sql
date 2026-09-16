-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DEL TALLER DE COMPRENSIÓN
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra talleres de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que las sondas del navegador no pueden ver, porque pasa
-- dentro del servidor:
--
--   · que EL TALLER SEA DE LA CASA PARA LEER y de cada quien para
--     escribir: los cuatro tienen que poder hacer las actividades que
--     puso otro, y solo quien las puso puede cambiarlas. Es la mitad
--     que la pantalla no puede sostener, porque una comprobación en el
--     navegador se salta con la consola en diez segundos;
--   · que UN TALLER NO CAMBIE DE DUEÑO, que es el lado que la política
--     de update no ve;
--   · que `items` TENGA QUE SER UNA LISTA y no crezca sin freno: si
--     entrara un objeto, la pantalla reventaría al recorrerlo en el
--     aparato de otra persona, que es donde no se puede depurar;
--   · que NADIE PUEDA BORRAR DE VERDAD: se vacía con lápida, y si se
--     pudiera borrar la fila, la tableta que aún tuviera su copia
--     resucitaría el taller en la siguiente sincronización;
--   · que `anon` no pueda leer ni escribir NADA;
--   · que la higiene (security definer) no quede al alcance de nadie;
--   · que el archivo sea IDEMPOTENTE: se corre dos veces seguidas.
--
-- Cómo correrla:
--
--   createdb acttest
--   psql -v ON_ERROR_STOP=1 -d acttest -f _dev/prueba-voz-actividades-sql.sql
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
-- ⚠️ Y SE REPARTE `auth` COMO LO REPARTE SUPABASE: allá `authenticated`
-- puede llamar a auth.uid(), que es lo que usan todas las políticas. Sin
-- esta línea la prueba revienta con «permission denied for schema auth»
-- en la primera escritura hecha como usuario de la casa, que es un fallo
-- DE LA PRUEBA disfrazado de fallo de la tabla.
grant usage on schema auth to anon, authenticated;
create table if not exists auth.users (id uuid primary key);
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- Quién entró. Se cambia a mano durante la prueba.
create or replace function auth.uid() returns uuid
  language sql stable as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;

-- La de verdad mira si quien entró está en familia_miembros. Aquí se
-- enciende y se apaga a mano para probar los dos lados de la puerta.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select false $$;

\echo '── Corriendo supabase/sql/voz_actividades.sql ──'
\i supabase/sql/voz_actividades.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/voz_actividades.sql

truncate public.voz_actividades;

-- Unas actividades válidas, para no repetirlas en cada prueba.
create or replace function pg_temp.items() returns jsonb language sql immutable as $$
  select '[{"id":"a1","k":"flash","f":"1910","r":"el año del pozo seco"},
           {"id":"a2","k":"opcion","q":"¿Quién se quedó?","o":["El maestro","Remedios"],"ok":1}]'::jsonb
$$;

-- ════════════════════════════════════════════════════════════════════
-- 0. LA RE-CORRIDA NO DUPLICA NADA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'voz_actividades';
  if n <> 3 then raise exception '0a. políticas duplicadas o faltantes: % (esperaba 3)', n; end if;

  select count(*) into n from pg_trigger t join pg_class c on c.oid = t.tgrelid
   where c.relname = 'voz_actividades' and not t.tgisinternal;
  if n <> 1 then raise exception '0b. disparadores duplicados o faltantes: % (esperaba 1)', n; end if;

  select count(*) into n from pg_constraint
   where conname in ('voz_actividades_items_lista', 'voz_actividades_items_cabe');
  if n <> 2 then raise exception '0c. checks duplicados o faltantes: % (esperaba 2)', n; end if;

  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'voz_actividades';
  if n <> 7 then raise exception '0d. la tabla tiene % columnas (esperaba 7)', n; end if;
end $$;
\echo '  ✔ 0. correrlo dos veces no duplica políticas, disparadores ni checks'

-- ════════════════════════════════════════════════════════════════════
-- 1. `items` TIENE QUE SER UNA LISTA, Y CABER
-- ════════════════════════════════════════════════════════════════════
-- Sin esto, un cliente con un error dejaría aquí un objeto o un número y
-- la pantalla reventaría al recorrerlo — en el aparato de otra persona.
do $$
begin
  begin
    insert into public.voz_actividades (cid, items, puesto_por)
    values ('t-malo', '{"no":"soy una lista"}'::jsonb, '11111111-1111-1111-1111-111111111111');
    raise exception '1a. ENTRÓ un taller cuyos items no son una lista';
  exception when check_violation then null;
  end;
  begin
    insert into public.voz_actividades (cid, items, puesto_por)
    values ('t-gordo', ('["' || repeat('x', 100001) || '"]')::jsonb, '11111111-1111-1111-1111-111111111111');
    raise exception '1b. ENTRÓ un taller de más de cien mil caracteres';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1. items tiene que ser una lista y no puede crecer sin freno'

-- ════════════════════════════════════════════════════════════════════
-- 2. LA FIRMA NO PUEDE FALTAR
-- ════════════════════════════════════════════════════════════════════
-- Es la lección cara del 10 de septiembre de 2026 en voz_prestada: el
-- aparato no mandaba la firma, la base rechazaba en silencio y desde
-- fuera parecía un problema de señal. Aquí la columna es `not null` y
-- tiene `default auth.uid()` como respaldo.
do $$
declare quien uuid;
begin
  insert into public.voz_actividades (cid, items) values ('t-sinfirma', pg_temp.items());
  select puesto_por into quien from public.voz_actividades where cid = 't-sinfirma';
  if quien is null then raise exception '2a. entró un taller SIN firmar'; end if;
  if quien <> '11111111-1111-1111-1111-111111111111' then
    raise exception '2b. el respaldo firmó con otro: %', quien;
  end if;
end $$;
\echo '  ✔ 2. un taller sin firmar lo firma la base con quien entró'

-- ════════════════════════════════════════════════════════════════════
-- 3. LA PUERTA: anon NO ENTRA, Y SE COMPRUEBA DOS VECES
-- ════════════════════════════════════════════════════════════════════
-- Con la clave publicable, que va en el código y la lee cualquiera, no
-- se puede ni mirar. Esto no es una tabla con puerta pública como el
-- Buzón: aquí solo entra quien entró por la puerta de la casa.
--
-- 3a: el `revoke all ... from anon` del archivo hizo su trabajo. Se mira
-- ANTES de tocar nada, que es el único momento en que se puede.
do $$
begin
  if has_table_privilege('anon', 'public.voz_actividades', 'select')
     or has_table_privilege('anon', 'public.voz_actividades', 'insert')
     or has_table_privilege('anon', 'public.voz_actividades', 'update') then
    raise exception '3a. el revoke no funcionó: anon tiene permiso de tabla';
  end if;
  -- Y al de la casa se le dio select, insert y update, pero NO delete:
  -- aquí se vacía con lápida. Se mira ahora, antes de que el `grant all`
  -- de abajo —que imita a Supabase— lo tape.
  if has_table_privilege('authenticated', 'public.voz_actividades', 'delete') then
    raise exception '3a-bis. el grant del archivo le dio delete a authenticated';
  end if;
end $$;
\echo '  ✔ 3a. el revoke le quita a anon el permiso de tabla, y el grant no da delete a nadie'

-- ⚠️ Y AHORA SE LE DEVUELVE TODO, COMO LO REPARTE SUPABASE (`grant all`
-- sobre `public` a los dos roles), para probar la otra mitad: que aunque
-- el permiso de tabla estuviera abierto, LA SEGURIDAD POR FILA sigue
-- dejando fuera a anon. Sin esta línea la prueba aprobaría por el motivo
-- equivocado —rebotaría por falta de permiso de tabla— y no habría
-- probado nunca lo único que de verdad guarda esto en la base de verdad.
grant all on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

set role anon;
do $$
declare n int;
begin
  select count(*) into n from public.voz_actividades;
  if n <> 0 then raise exception '3b. anon VE % taller(es)', n; end if;
exception when insufficient_privilege then null;   -- también vale: es más cerrado
end $$;
do $$
begin
  begin
    insert into public.voz_actividades (cid, items, puesto_por)
    values ('t-colado', pg_temp.items(), '11111111-1111-1111-1111-111111111111');
    raise exception '3c. anon ESCRIBIÓ un taller';
  exception when insufficient_privilege then null;
           when others then
             if sqlerrm like '%3c.%' then raise; end if;
  end;
end $$;
reset role;
\echo '  ✔ 3b. y con el permiso de tabla abierto, la seguridad por fila lo sigue dejando fuera'

-- ════════════════════════════════════════════════════════════════════
-- 4. CON SESIÓN PERO SIN SER DE LA CASA, TAMPOCO
-- ════════════════════════════════════════════════════════════════════
truncate public.voz_actividades;
insert into public.voz_actividades (cid, items, puesto_por)
values ('t-uno', pg_temp.items(), '11111111-1111-1111-1111-111111111111');

set role authenticated;
do $$
declare n int;
begin
  select count(*) into n from public.voz_actividades;
  if n <> 0 then raise exception '4a. un autenticado que NO es de la casa ve % taller(es)', n; end if;
  begin
    insert into public.voz_actividades (cid, items, puesto_por)
    values ('t-colado', pg_temp.items(), '11111111-1111-1111-1111-111111111111');
    raise exception '4b. un autenticado que NO es de la casa pudo escribir';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
\echo '  ✔ 4. con sesión pero sin ser de la casa, no se ve ni se escribe nada'

-- ════════════════════════════════════════════════════════════════════
-- 5. DE LA CASA: SE LEE TODO, SE ESCRIBE SOLO LO PROPIO
-- ════════════════════════════════════════════════════════════════════
-- Es el reparto que hace que «hazle las preguntas a tu hermana» no sea
-- «pásame tu sesión».
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select true $$;
insert into public.voz_actividades (cid, items, puesto_por)
values ('t-dos', pg_temp.items(), '22222222-2222-2222-2222-222222222222');

set role authenticated;
do $$
declare n int;
begin
  select count(*) into n from public.voz_actividades;
  if n <> 2 then raise exception '5a. de la casa se ven % talleres (esperaba 2: el propio y el ajeno)', n; end if;

  -- El ajeno se LEE pero no se CORRIGE.
  update public.voz_actividades set items = '[]'::jsonb where cid = 't-dos';
  if found then raise exception '5b. se pudo corregir el taller de otra persona'; end if;

  -- Y el propio sí.
  update public.voz_actividades set actualizado = 99 where cid = 't-uno';
  if not found then raise exception '5c. no se pudo corregir el taller propio'; end if;

  -- ⚠️ Y NO SE LE PUEDE CAMBIAR EL DUEÑO A UNO PROPIO, que es el lado
  -- que la política de update no ve si solo mira el `using`: sin el
  -- `with check`, cualquiera podría regalarle su taller a otro —o
  -- quedárselo— y la firma dejaría de significar nada.
  begin
    update public.voz_actividades
       set puesto_por = '22222222-2222-2222-2222-222222222222' where cid = 't-uno';
    if found then raise exception '5d. un taller propio pudo cambiar de dueño'; end if;
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
\echo '  ✔ 5. de la casa se lee todo, se corrige solo lo propio, y un taller no cambia de dueño'

-- ════════════════════════════════════════════════════════════════════
-- 6. NADIE BORRA DE VERDAD: SE VACÍA CON LÁPIDA
-- ════════════════════════════════════════════════════════════════════
-- Si se pudiera borrar la fila, la tableta que todavía tiene su copia la
-- subiría otra vez en la siguiente sincronización y el taller
-- resucitaría solo.
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'voz_actividades' and cmd = 'DELETE';
  if n <> 0 then raise exception '6a. hay % política(s) de delete', n; end if;
end $$;
-- ⚠️ El permiso de TABLA para borrar ya se miró en 3a-bis, antes del
-- `grant all` que imita a Supabase. Aquí se prueba lo que de verdad
-- sostiene la lápida aunque ese permiso estuviera abierto: sin política
-- de delete, la seguridad por fila no deja irse ni una fila.
set role authenticated;
do $$
declare n int;
begin
  begin
    delete from public.voz_actividades where cid = 't-uno';
    select count(*) into n from public.voz_actividades where cid = 't-uno';
    if n = 0 then raise exception '6c. SE BORRÓ una fila de verdad'; end if;
  exception when insufficient_privilege then null;
  end;
  -- Y vaciar con lápida sí se puede.
  update public.voz_actividades set borrada = true where cid = 't-uno';
  if not found then raise exception '6d. no se pudo poner la lápida'; end if;
end $$;
reset role;
\echo '  ✔ 6. no se puede borrar de verdad; vaciar deja lápida'

-- ════════════════════════════════════════════════════════════════════
-- 7. LA HIGIENE NO QUEDA AL ALCANCE DE NADIE
-- ════════════════════════════════════════════════════════════════════
-- Corre con los permisos de quien la creó (security definer): si quedara
-- ejecutable, con la clave publicable se podría llamar a mano y barrer
-- filas.
do $$
declare n int;
begin
  if has_function_privilege('anon', 'public.voz_actividades_higiene()', 'execute')
     or has_function_privilege('authenticated', 'public.voz_actividades_higiene()', 'execute') then
    raise exception '7a. la higiene está al alcance de anon o authenticated';
  end if;

  -- Y no hay ninguna OTRA función security definer en voz_actividades_*:
  -- aquí no existe puerta pública que abrir, a diferencia de
  -- metas_videos. Si algún día apareciera una, esto suspende.
  select count(*) into n from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.proname like 'voz\_actividades\_%' and p.prosecdef;
  if n <> 1 then raise exception '7b. hay % función(es) security definer en voz_actividades_* (esperaba 1: la higiene)', n; end if;
end $$;
\echo '  ✔ 7. la higiene no la puede llamar nadie desde el navegador, y no hay puerta pública'

-- ════════════════════════════════════════════════════════════════════
-- 8. Y LA COMPROBACIÓN APARTE CORRE Y DEVUELVE SUS FILAS
-- ════════════════════════════════════════════════════════════════════
-- El archivo que el autor pega después tiene que funcionar de verdad, no
-- solo existir: si reventara, lo descubriría en la tableta.
\pset tuples_only off
\pset format aligned
\echo '── supabase/sql/voz_actividades_comprueba.sql ──'
\i supabase/sql/voz_actividades_comprueba.sql
\pset tuples_only on
\pset format unaligned

\echo ''
\echo 'RESULTADO: APRUEBA'
