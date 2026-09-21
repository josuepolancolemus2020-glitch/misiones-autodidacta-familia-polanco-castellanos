-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE 📣 REDES (Redacción)
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra piezas de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que la sonda del navegador no puede ver, porque pasa
-- dentro del servidor:
--
--   · que la guardia de dependencias PARE con una frase clara si falta
--     es_familia() o la tabla de notas, en vez de dejar media tabla;
--   · que los checks MUERDAN: un enlace con javascript:, con comillas o
--     con espacios no entra; un texto de más de 70.000 no entra; unas
--     fuentes que no sean una lista no entran;
--   · que la pieza sea DE LA CASA: cualquiera de los cuatro la ve y la
--     corrige; quien no es de la casa, nada; `anon`, nada;
--   · que NADIE PUEDA BORRAR DE VERDAD: se retira con lápida;
--   · que una nota borrada de verdad deje la pieza (nota_id a null);
--   · que no haya ninguna `security definer` (aquí no hay puerta pública);
--   · que el archivo sea IDEMPOTENTE: se corre dos veces seguidas;
--   · y que la comprobación aparte corra y devuelva sus filas.
--
-- Cómo correrla:
--
--   createdb redestest
--   psql -v ON_ERROR_STOP=1 -d redestest -f _dev/prueba-redaccion-redes-sql.sql
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

-- La tabla de notas de la revista, lo justo para la llave ajena.
create table if not exists public.redaccion_notas (
  id bigint generated always as identity primary key,
  titulo text not null default ''
);

-- ════════════════════════════════════════════════════════════════════
-- 0. LA GUARDIA PARA, Y DICE QUÉ CORRER
-- ════════════════════════════════════════════════════════════════════
-- Sin es_familia() el archivo tiene que reventar en su primera línea
-- con una frase que nombre el archivo que falta, y NO dejar la tabla.
drop function if exists public.es_familia();
do $$
declare msg text;
begin
  begin
    -- Se corre solo la guardia, que es lo que pararía el pegado entero
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

-- La de verdad mira si quien entró está en familia_miembros. Aquí se
-- enciende y se apaga a mano para probar los dos lados de la puerta.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select false $$;

\echo '── Corriendo supabase/sql/redaccion_redes.sql ──'
\i supabase/sql/redaccion_redes.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/redaccion_redes.sql

truncate public.redaccion_redes;

-- ════════════════════════════════════════════════════════════════════
-- 1. LA RE-CORRIDA NO DUPLICA NADA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'redaccion_redes';
  if n <> 3 then raise exception '1a. políticas duplicadas o faltantes: % (esperaba 3)', n; end if;

  select count(*) into n from pg_trigger t join pg_class c on c.oid = t.tgrelid
   where c.relname = 'redaccion_redes' and not t.tgisinternal;
  if n <> 1 then raise exception '1b. disparadores duplicados o faltantes: % (esperaba 1)', n; end if;

  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'redaccion_redes';
  if n <> 18 then raise exception '1c. la tabla tiene % columnas (esperaba 18)', n; end if;
end $$;
\echo '  ✔ 1. correrlo dos veces no duplica políticas ni disparadores'

-- ════════════════════════════════════════════════════════════════════
-- 2. LOS CHECKS MUERDEN
-- ════════════════════════════════════════════════════════════════════
do $$
begin
  -- El enlace: esa dirección acaba en un href y en lo que se pega
  begin
    insert into public.redaccion_redes (id, red, enlace) values ('rr-js', 'x', 'javascript:alert(1)');
    raise exception '2a. ENTRÓ un enlace javascript:';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_redes (id, red, enlace) values ('rr-com', 'x', 'https://a.com/x"onmouseover="1');
    raise exception '2b. ENTRÓ un enlace con comillas';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_redes (id, red, enlace) values ('rr-esp', 'x', 'https://a.com/x y');
    raise exception '2c. ENTRÓ un enlace con espacios';
  exception when check_violation then null;
  end;
  -- Vacío sí, y con https sí
  insert into public.redaccion_redes (id, red, enlace) values ('rr-vacio', 'x', '');
  insert into public.redaccion_redes (id, red, enlace) values ('rr-bien', 'x', 'https://metas.policastsapien.com/');

  -- El texto no crece sin freno
  begin
    insert into public.redaccion_redes (id, red, texto) values ('rr-gordo', 'facebook', repeat('x', 70001));
    raise exception '2d. ENTRÓ un texto de más de 70.000';
  exception when check_violation then null;
  end;

  -- Las fuentes son una lista; las opciones, un objeto
  begin
    insert into public.redaccion_redes (id, red, fuentes) values ('rr-f', 'x', '{"no":"lista"}'::jsonb);
    raise exception '2e. ENTRARON unas fuentes que no son una lista';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_redes (id, red, opciones) values ('rr-o', 'x', '[1,2]'::jsonb);
    raise exception '2f. ENTRARON unas opciones que no son un objeto';
  exception when check_violation then null;
  end;

  -- La red no puede ir vacía, y el identificador tampoco
  begin
    insert into public.redaccion_redes (id, red) values ('rr-r', '');
    raise exception '2g. ENTRÓ una pieza sin red';
  exception when check_violation then null;
  end;
  begin
    insert into public.redaccion_redes (id, red) values ('ab', 'x');
    raise exception '2h. ENTRÓ un identificador de dos letras';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 2. los checks muerden: enlace, tamaño, fuentes, opciones, red'

-- ════════════════════════════════════════════════════════════════════
-- 3. LA NOTA DE LA REVISTA: LA LLAVE AJENA Y EL «SET NULL»
-- ════════════════════════════════════════════════════════════════════
do $$
declare nid bigint; quedo bigint;
begin
  begin
    insert into public.redaccion_redes (id, red, nota_id) values ('rr-huerfana', 'x', 999999);
    raise exception '3a. ENTRÓ una pieza colgada de una nota que no existe';
  exception when foreign_key_violation then null;
  end;
  insert into public.redaccion_notas (titulo) values ('La bandera') returning id into nid;
  insert into public.redaccion_redes (id, red, nota_id, texto) values ('rr-denota', 'facebook', nid, 'hola');
  delete from public.redaccion_notas where id = nid;
  select nota_id into quedo from public.redaccion_redes where id = 'rr-denota';
  if quedo is not null then raise exception '3b. borrada la nota, la pieza sigue apuntando a %', quedo; end if;
  if not exists (select 1 from public.redaccion_redes where id = 'rr-denota') then
    raise exception '3c. borrar la nota se llevó la pieza';
  end if;
end $$;
\echo '  ✔ 3. la pieza cuelga de una nota real, y si la nota se borra la pieza se queda'

-- ════════════════════════════════════════════════════════════════════
-- 4. EL DISPARADOR PONE LA HORA DEL SERVIDOR
-- ════════════════════════════════════════════════════════════════════
do $$
declare antes timestamptz; despues timestamptz;
begin
  update public.redaccion_redes set actualizado_at = '2020-01-01' where id = 'rr-bien';
  select actualizado_at into antes from public.redaccion_redes where id = 'rr-bien';
  -- El update de arriba ya pasó por el disparador: tiene que ser de hoy
  if antes < now() - interval '1 minute' then
    raise exception '4a. el disparador no pisó la fecha: %', antes;
  end if;
end $$;
\echo '  ✔ 4. el disparador pone actualizado_at con la hora del servidor'

-- ════════════════════════════════════════════════════════════════════
-- 5. LA PUERTA, DOS VECES Y EN ESTE ORDEN
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
    perform count(*) from public.redaccion_redes;
    reset role;
    raise exception '5a. anon pudo leer la tabla (el revoke no está)';
  exception when insufficient_privilege then reset role;
  end;
  set role authenticated;
  begin
    delete from public.redaccion_redes where id = 'rr-bien';
    reset role;
    raise exception '5b. authenticated tiene permiso de delete (aquí se retira con lápida)';
  exception when insufficient_privilege then reset role;
  end;
end $$;
\echo '  ✔ 5. anon no tiene permiso de tabla, y a la casa no se le dio delete'

-- Como lo reparte Supabase
grant all on all tables in schema public to anon, authenticated;

do $$
declare n int;
begin
  -- anon, con el permiso de tabla abierto: la seguridad por fila lo para
  set role anon;
  select count(*) into n from public.redaccion_redes;
  if n <> 0 then reset role; raise exception '5c. anon ve % piezas', n; end if;
  begin
    insert into public.redaccion_redes (id, red) values ('rr-anon', 'x');
    reset role;
    raise exception '5d. anon pudo escribir';
  exception when insufficient_privilege then reset role;
  end;

  -- Con sesión pero SIN ser de la casa: nada
  set role authenticated;
  select count(*) into n from public.redaccion_redes;
  if n <> 0 then reset role; raise exception '5e. un usuario ajeno ve % piezas', n; end if;
  begin
    insert into public.redaccion_redes (id, red) values ('rr-ajeno', 'x');
    reset role;
    raise exception '5f. un usuario ajeno pudo escribir';
  exception when insufficient_privilege then reset role;
  end;
  reset role;
end $$;
\echo '  ✔ 5. con la seguridad por fila, ni anon ni un ajeno ven ni escriben nada'

-- Uno de la casa: ve, escribe, corrige lo de cualquiera; no borra
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select true $$;

do $$
declare n int; t text;
begin
  set role authenticated;
  select count(*) into n from public.redaccion_redes;
  if n < 3 then reset role; raise exception '5g. uno de la casa ve % piezas (esperaba las sembradas)', n; end if;
  insert into public.redaccion_redes (id, red, clase, texto, autor, actualizado)
    values ('rr-casa', 'linkedin', 'post', 'Un post', 'josue', 1);
  -- Corrige una que empezó OTRO de la casa (autor distinto): es de la casa
  update public.redaccion_redes set texto = 'corregido por otro' where id = 'rr-casa';
  select texto into t from public.redaccion_redes where id = 'rr-casa';
  if t <> 'corregido por otro' then reset role; raise exception '5h. la corrección no entró'; end if;
  -- Retira con lápida
  update public.redaccion_redes set eliminada = true, eliminada_at = now() where id = 'rr-casa';
  -- Y no puede borrar de verdad aunque Supabase haya dado el permiso de tabla:
  -- sin política de delete, la seguridad por fila no deja tocar ninguna fila
  delete from public.redaccion_redes where id = 'rr-casa';
  if not exists (select 1 from public.redaccion_redes where id = 'rr-casa') then
    reset role; raise exception '5i. uno de la casa BORRÓ de verdad una pieza';
  end if;
  reset role;
end $$;
\echo '  ✔ 5. uno de la casa ve, escribe y corrige lo de cualquiera, y no borra: retira con lápida'

-- ════════════════════════════════════════════════════════════════════
-- 6. SIN PUERTA PÚBLICA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  select count(*) into n from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.proname like 'redaccion\_redes\_%' and p.prosecdef;
  if n <> 0 then raise exception '6a. hay % función(es) security definer en redaccion_redes_* (esperaba 0)', n; end if;
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'redaccion_redes' and 'anon' = any(roles);
  if n <> 0 then raise exception '6b. hay % política(s) para anon', n; end if;
end $$;
\echo '  ✔ 6. no hay ninguna security definer ni política para anon'

-- ════════════════════════════════════════════════════════════════════
-- 7. Y LA COMPROBACIÓN APARTE CORRE Y DEVUELVE SUS FILAS
-- ════════════════════════════════════════════════════════════════════
\pset tuples_only off
\pset format aligned
\echo '── supabase/sql/redaccion_redes_comprueba.sql ──'
\i supabase/sql/redaccion_redes_comprueba.sql
\pset tuples_only on
\pset format unaligned

\echo ''
\echo 'RESULTADO: APRUEBA'
