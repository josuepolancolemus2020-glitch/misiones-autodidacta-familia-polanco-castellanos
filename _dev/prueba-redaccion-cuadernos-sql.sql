-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE 📓 CUADERNOS (Redacción)
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra fichas de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que la sonda del navegador no puede ver, porque pasa
-- dentro del servidor:
--
--   · que la guardia de dependencias PARE con una frase clara si falta
--     es_familia(), en vez de dejar media tabla;
--   · que los checks MUERDAN: una dirección con javascript:, con
--     comillas o con espacios no entra; sin dirección no entra; sin
--     nombre no entra; unos estantes o unas referencias que no sean
--     una lista no entran; notas de más de 8.000 no entran;
--   · que la ficha sea DE LA CASA: cualquiera de los cuatro la ve y la
--     corrige; quien no es de la casa, nada; `anon`, nada;
--   · que NADIE PUEDA BORRAR DE VERDAD: se retira con lápida;
--   · que no haya ninguna `security definer` (aquí no hay puerta pública);
--   · que el archivo sea IDEMPOTENTE: se corre dos veces seguidas;
--   · y que la comprobación aparte corra y devuelva sus filas.
--
-- Cómo correrla (con el servidor de la sesión levantado como dice
-- CLAUDE.md en el apartado de La Voz Prestada):
--
--   createdb -h /tmp/pg -p 55432 -U postgres cuadernostest
--   psql -h /tmp/pg -p 55432 -U postgres -v ON_ERROR_STOP=1 -d cuadernostest -f _dev/prueba-redaccion-cuadernos-sql.sql
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
insert into auth.users (id) values ('11111111-1111-1111-1111-111111111111') on conflict do nothing;
create or replace function auth.uid() returns uuid
  language sql stable as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;

-- ════════════════════════════════════════════════════════════════════
-- 0. LA GUARDIA PARA, Y DICE QUÉ CORRER
-- ════════════════════════════════════════════════════════════════════
drop function if exists public.es_familia();
do $$
declare msg text;
begin
  begin
    perform 1;
    if to_regproc('public.es_familia') is null then
      raise exception E'FALTA public.es_familia(), y sin ella las politicas de esta tabla no se pueden crear.\n'
        'Que hacer: correr antes supabase/sql/seguridad_familia_1_puerta.sql, y volver a pegar este.';
    end if;
    raise exception '0a. la guardia NO paró sin es_familia()';
  exception when others then
    get stacked diagnostics msg = message_text;
    if msg not like '%seguridad_familia_1_puerta.sql%' then
      raise exception '0b. la guardia paró pero sin nombrar el archivo: %', msg;
    end if;
  end;
end $$;
\echo '  ✔ 0. sin es_familia() la guardia para y nombra el archivo que falta'

create or replace function public.es_familia() returns boolean
  language sql stable as $$ select false $$;

\echo '── Corriendo supabase/sql/redaccion_cuadernos.sql ──'
\i supabase/sql/redaccion_cuadernos.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/redaccion_cuadernos.sql

truncate public.redaccion_cuadernos;

-- ════════════════════════════════════════════════════════════════════
-- 1. LA RE-CORRIDA NO DUPLICA NADA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'redaccion_cuadernos';
  if n <> 3 then raise exception '1a. políticas duplicadas o faltantes: % (esperaba 3)', n; end if;

  select count(*) into n from pg_trigger t join pg_class c on c.oid = t.tgrelid
   where c.relname = 'redaccion_cuadernos' and not t.tgisinternal;
  if n <> 1 then raise exception '1b. disparadores duplicados o faltantes: % (esperaba 1)', n; end if;

  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'redaccion_cuadernos';
  if n <> 19 then raise exception '1c. la tabla tiene % columnas (esperaba 19)', n; end if;
end $$;
\echo '  ✔ 1. correrlo dos veces no duplica políticas ni disparadores'

-- ════════════════════════════════════════════════════════════════════
-- 2. LOS CHECKS MUERDEN
-- ════════════════════════════════════════════════════════════════════
do $$
begin
  -- La dirección: acaba en un href
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('rc-js', 'x', 'javascript:alert(1)');
    raise exception '2a. ENTRÓ una dirección javascript:';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('rc-com', 'x', 'https://a.com/x"onmouseover="1');
    raise exception '2b. ENTRÓ una dirección con comillas';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('rc-esp', 'x', 'https://a.com/x y');
    raise exception '2c. ENTRÓ una dirección con espacios';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('rc-vacia', 'x', '');
    raise exception '2d. ENTRÓ una ficha sin dirección';
  exception when check_violation then null;
  end;
  -- Sin nombre no entra
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('rc-sin', '', 'https://notebooklm.google.com/notebook/abc');
    raise exception '2e. ENTRÓ una ficha sin nombre';
  exception when check_violation then null;
  end;
  -- Con todo bien sí
  insert into public.redaccion_cuadernos (id, titulo, url, cuaderno, emoji, estantes, serie, serie_n, fuentes, referencias)
    values ('rc-bien', 'La IA como Espejo', 'https://notebooklm.google.com/notebook/abc-123', 'abc-123', '🧠',
            '["Filosofía","IA"]'::jsonb, 'Control coercitivo', 1.2, 35,
            '[{"id":"r1","t":"la fe como interfaz","en":"Nº 3","f":"2026-09-21"}]'::jsonb);

  -- Las notas no crecen sin freno
  begin
    insert into public.redaccion_cuadernos (id, titulo, url, notas) values ('rc-gordo', 'x', 'https://a.com/', repeat('x', 8001));
    raise exception '2f. ENTRARON notas de más de 8.000';
  exception when check_violation then null;
  end;
  -- Los estantes y las referencias son listas
  begin
    insert into public.redaccion_cuadernos (id, titulo, url, estantes) values ('rc-e', 'x', 'https://a.com/', '{"no":"lista"}'::jsonb);
    raise exception '2g. ENTRARON unos estantes que no son una lista';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url, referencias) values ('rc-r', 'x', 'https://a.com/', '"texto"'::jsonb);
    raise exception '2h. ENTRARON unas referencias que no son una lista';
  exception when check_violation then null;
  end;
  -- El número de serie no es negativo, las fuentes tienen tope
  begin
    insert into public.redaccion_cuadernos (id, titulo, url, serie_n) values ('rc-n', 'x', 'https://a.com/', -1);
    raise exception '2i. ENTRÓ un número de serie negativo';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url, fuentes) values ('rc-f', 'x', 'https://a.com/', 5001);
    raise exception '2j. ENTRARON 5001 fuentes';
  exception when check_violation then null;
  end;
  -- El estado no va vacío; el identificador no es de dos letras
  begin
    insert into public.redaccion_cuadernos (id, titulo, url, estado) values ('rc-est', 'x', 'https://a.com/', '');
    raise exception '2k. ENTRÓ una ficha sin estado';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('ab', 'x', 'https://a.com/');
    raise exception '2l. ENTRÓ un identificador de dos letras';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 2. los checks muerden: dirección, nombre, tamaños, listas, número, fuentes, estado'

-- ════════════════════════════════════════════════════════════════════
-- 3. EL DISPARADOR PONE LA HORA DEL SERVIDOR
-- ════════════════════════════════════════════════════════════════════
do $$
declare antes timestamptz;
begin
  update public.redaccion_cuadernos set actualizado_at = '2020-01-01' where id = 'rc-bien';
  select actualizado_at into antes from public.redaccion_cuadernos where id = 'rc-bien';
  if antes < now() - interval '1 minute' then
    raise exception '3a. el disparador no pisó la fecha: %', antes;
  end if;
end $$;
\echo '  ✔ 3. el disparador pone actualizado_at con la hora del servidor'

-- ════════════════════════════════════════════════════════════════════
-- 4. LA PUERTA, DOS VECES Y EN ESTE ORDEN
-- ════════════════════════════════════════════════════════════════════
-- Primero: el revoke del archivo le quitó a anon el permiso de tabla, y
-- a authenticated no se le dio delete. Solo DESPUÉS se reparten los
-- permisos como los reparte Supabase (grant all) para probar que, aun
-- con el permiso de tabla abierto, la seguridad por fila sigue dejando
-- fuera a anon. Al revés, las dos comprobaciones se tapan.
do $$
begin
  set role anon;
  begin
    perform count(*) from public.redaccion_cuadernos;
    reset role;
    raise exception '4a. anon pudo leer la tabla (el revoke no está)';
  exception when insufficient_privilege then reset role;
  end;
  set role authenticated;
  begin
    delete from public.redaccion_cuadernos where id = 'rc-bien';
    reset role;
    raise exception '4b. authenticated tiene permiso de delete (aquí se retira con lápida)';
  exception when insufficient_privilege then reset role;
  end;
end $$;
\echo '  ✔ 4. anon no tiene permiso de tabla, y a la casa no se le dio delete'

-- Como lo reparte Supabase
grant all on all tables in schema public to anon, authenticated;

do $$
declare n int;
begin
  set role anon;
  select count(*) into n from public.redaccion_cuadernos;
  if n <> 0 then reset role; raise exception '4c. anon ve % fichas', n; end if;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('rc-anon', 'x', 'https://a.com/');
    reset role;
    raise exception '4d. anon pudo escribir';
  exception when insufficient_privilege then reset role;
  end;

  set role authenticated;
  select count(*) into n from public.redaccion_cuadernos;
  if n <> 0 then reset role; raise exception '4e. un usuario ajeno ve % fichas', n; end if;
  begin
    insert into public.redaccion_cuadernos (id, titulo, url) values ('rc-ajeno', 'x', 'https://a.com/');
    reset role;
    raise exception '4f. un usuario ajeno pudo escribir';
  exception when insufficient_privilege then reset role;
  end;
  reset role;
end $$;
\echo '  ✔ 4. con la seguridad por fila, ni anon ni un ajeno ven ni escriben nada'

create or replace function public.es_familia() returns boolean
  language sql stable as $$ select true $$;

do $$
declare n int; t text;
begin
  set role authenticated;
  select count(*) into n from public.redaccion_cuadernos;
  if n < 1 then reset role; raise exception '4g. uno de la casa ve % fichas (esperaba la sembrada)', n; end if;
  insert into public.redaccion_cuadernos (id, titulo, url, autor, actualizado)
    values ('rc-casa', 'Monroe y Valle', 'https://notebook.google.com/notebook/def-456', 'josue', 1);
  -- Corrige una que fichó OTRO de la casa: es de la casa
  update public.redaccion_cuadernos set notas = 'corregido por otro' where id = 'rc-casa';
  select notas into t from public.redaccion_cuadernos where id = 'rc-casa';
  if t <> 'corregido por otro' then reset role; raise exception '4h. la corrección no entró'; end if;
  -- Retira con lápida
  update public.redaccion_cuadernos set eliminado = true, eliminado_at = now() where id = 'rc-casa';
  -- Y no puede borrar de verdad aunque Supabase haya dado el permiso de tabla
  delete from public.redaccion_cuadernos where id = 'rc-casa';
  if not exists (select 1 from public.redaccion_cuadernos where id = 'rc-casa') then
    reset role; raise exception '4i. uno de la casa BORRÓ de verdad una ficha';
  end if;
  reset role;
end $$;
\echo '  ✔ 4. uno de la casa ve, escribe y corrige lo de cualquiera, y no borra: retira con lápida'

-- ════════════════════════════════════════════════════════════════════
-- 5. SIN PUERTA PÚBLICA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  select count(*) into n from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.proname like 'redaccion\_cuadernos\_%' and p.prosecdef;
  if n <> 0 then raise exception '5a. hay % función(es) security definer en redaccion_cuadernos_* (esperaba 0)', n; end if;
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'redaccion_cuadernos' and 'anon' = any(roles);
  if n <> 0 then raise exception '5b. hay % política(s) para anon', n; end if;
end $$;
\echo '  ✔ 5. no hay ninguna security definer ni política para anon'

-- ════════════════════════════════════════════════════════════════════
-- 6. Y LA COMPROBACIÓN APARTE CORRE Y DEVUELVE SUS FILAS
-- ════════════════════════════════════════════════════════════════════
\pset tuples_only off
\pset format aligned
\echo '── supabase/sql/redaccion_cuadernos_comprueba.sql ──'
\i supabase/sql/redaccion_cuadernos_comprueba.sql
\pset tuples_only on
\pset format unaligned

\echo ''
\echo 'RESULTADO: APRUEBA'
