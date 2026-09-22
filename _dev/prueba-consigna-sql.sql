-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE 📜 LA CONSIGNA
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra piezas de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que la sonda del navegador no puede ver, porque pasa
-- dentro del servidor:
--
--   · que la guardia de dependencias PARE con una frase clara si falta
--     es_familia(), en vez de dejar media tabla;
--   · que el archivo sea IDEMPOTENTE: se corre dos veces seguidas y no
--     duplica políticas ni disparadores;
--   · que los checks MUERDAN: sin título no entra; una clase de 21 no
--     entra; unos bloques que no sean una lista no entran; una bitácora
--     de 60.001, unas versiones de 200.001 o un material de 20.001 no
--     entran; un identificador de dos letras no entra; la versión 0 no
--     entra. Son los números de CSG_TOPES: si el aparato poda mal, es
--     aquí donde se ve que la base rebota;
--   · que el disparador ponga la hora del servidor;
--   · que la pieza sea DE LA CASA: cualquiera de los cuatro la ve y la
--     corrige; quien no es de la casa, nada; `anon`, nada;
--   · que NADIE PUEDA BORRAR DE VERDAD: se retira con lápida;
--   · que no haya ninguna `security definer` (aquí no hay puerta pública);
--   · y que la comprobación aparte corra y devuelva sus filas.
--
-- Cómo correrla (con el servidor de la sesión levantado como dice
-- CLAUDE.md en el apartado de La Voz Prestada):
--
--   createdb -h /tmp/pg -p 55432 -U postgres consignatest
--   psql -h /tmp/pg -p 55432 -U postgres -v ON_ERROR_STOP=1 -d consignatest -f _dev/prueba-consigna-sql.sql
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
-- ⚠️ Supabase le da a anon y a authenticated permiso sobre TODA tabla
-- nueva de `public` por privilegios por defecto; es lo que el `revoke`
-- del archivo existe para deshacer. Sin esta línea, en un PostgreSQL
-- pelado la tabla nace sin ningún permiso para anon, el revoke no quita
-- nada, y la comprobación 4a aprobaría con el revoke BORRADO del
-- archivo: se comprobó quitándolo, y sin esto seguía diciendo APRUEBA.
alter default privileges in schema public grant all on tables to anon, authenticated;

create schema if not exists auth;
-- ⚠️ Sin este grant, la primera escritura hecha como usuario de la casa
-- revienta con «permission denied for schema auth»: un fallo de la
-- prueba disfrazado de fallo de la tabla, que manda a buscar el error en
-- el archivo bueno. En Supabase ese permiso ya está dado.
grant usage on schema auth to anon, authenticated;
create table if not exists auth.users (id uuid primary key);
insert into auth.users (id) values ('11111111-1111-1111-1111-111111111111') on conflict do nothing;
create or replace function auth.uid() returns uuid
  language sql stable as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;

-- La tabla de la puerta, como la deja seguridad_familia_1_puerta.sql:
-- quien entró es de la casa si su usuario tiene fila aquí. Se siembra y
-- se vacía a mano para probar los dos lados de la puerta con la MISMA
-- es_familia() que la de verdad, en vez de con un doble que devuelve
-- true o false: un doble complaciente esconde la costura.
create table if not exists public.familia_miembros (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  miembro  text not null unique,
  creado   timestamptz not null default now()
);
alter table public.familia_miembros enable row level security;

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

-- La de verdad, letra por letra como en seguridad_familia_1_puerta.sql:
-- mira si quien entró está en familia_miembros.
create or replace function public.es_familia()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.familia_miembros where user_id = auth.uid()
  );
$$;
revoke all on function public.es_familia() from public, anon;
grant execute on function public.es_familia() to authenticated;

\echo '── Corriendo supabase/sql/consigna.sql ──'
\i supabase/sql/consigna.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/consigna.sql

truncate public.consigna_piezas;

-- ════════════════════════════════════════════════════════════════════
-- 1. LA RE-CORRIDA NO DUPLICA NADA
-- ════════════════════════════════════════════════════════════════════
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'consigna_piezas';
  if n <> 3 then raise exception '1a. políticas duplicadas o faltantes: % (esperaba 3)', n; end if;

  select count(*) into n from pg_trigger t join pg_class c on c.oid = t.tgrelid
   where c.relname = 'consigna_piezas' and not t.tgisinternal;
  if n <> 1 then raise exception '1b. disparadores duplicados o faltantes: % (esperaba 1)', n; end if;

  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'consigna_piezas';
  if n <> 21 then raise exception '1c. la tabla tiene % columnas (esperaba 21)', n; end if;
end $$;
\echo '  ✔ 1. correrlo dos veces no duplica políticas ni disparadores, y hay 21 columnas'

-- ════════════════════════════════════════════════════════════════════
-- 2. LOS CHECKS MUERDEN
-- ════════════════════════════════════════════════════════════════════
-- Los números son los de CSG_TOPES: 60.000 bloques, 20.000 material,
-- 1.000 estantes, 4.000 notas, 60.000 bitácora, 200.000 versiones. Se
-- prueba UN carácter por encima de cada tope, que es donde un «<» en vez
-- de un «<=» se delataría.
do $$
begin
  -- Sin título no entra; y un título de solo espacios tampoco (btrim)
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo) values ('csg-sin', 'prompt', 'rapido', '');
    raise exception '2a. ENTRÓ una pieza sin título';
  exception when check_violation then null;
  end;
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo) values ('csg-esp', 'prompt', 'rapido', '   ');
    raise exception '2b. ENTRÓ una pieza con el título hecho de espacios';
  exception when check_violation then null;
  end;
  -- Una clase de 21 no entra (el tope es 20)
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo) values ('csg-cl', repeat('c', 21), 'rapido', 'x');
    raise exception '2c. ENTRÓ una clase de 21 caracteres';
  exception when check_violation then null;
  end;
  -- Los bloques son una lista
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, bloques) values ('csg-bl', 'prompt', 'rapido', 'x', '{"no":"lista"}'::jsonb);
    raise exception '2d. ENTRARON unos bloques que no son una lista';
  exception when check_violation then null;
  end;
  -- Una bitácora de 60.001 no entra
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, bitacora)
      values ('csg-bit', 'prompt', 'rapido', 'x', ('["' || repeat('x', 59997) || '"]')::jsonb);
    raise exception '2e. ENTRÓ una bitácora de 60.001 caracteres';
  exception when check_violation then null;
  end;
  -- Unas versiones de 200.001 no entran
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, versiones)
      values ('csg-ver', 'prompt', 'rapido', 'x', ('["' || repeat('x', 199997) || '"]')::jsonb);
    raise exception '2f. ENTRARON unas versiones de 200.001 caracteres';
  exception when check_violation then null;
  end;
  -- Un material de 20.001 no entra
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, material)
      values ('csg-mat', 'prompt', 'rapido', 'x', repeat('m', 20001));
    raise exception '2g. ENTRÓ un material de 20.001 caracteres';
  exception when check_violation then null;
  end;
  -- Unos bloques de 60.001 no entran
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, bloques)
      values ('csg-blg', 'prompt', 'rapido', 'x', ('["' || repeat('x', 59997) || '"]')::jsonb);
    raise exception '2h. ENTRARON unos bloques de 60.001 caracteres';
  exception when check_violation then null;
  end;
  -- Unos estantes de 1.001 y unas notas de 4.001 tampoco
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, estantes)
      values ('csg-est', 'prompt', 'rapido', 'x', ('["' || repeat('e', 997) || '"]')::jsonb);
    raise exception '2i. ENTRARON unos estantes de 1.001 caracteres';
  exception when check_violation then null;
  end;
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, notas)
      values ('csg-not', 'prompt', 'rapido', 'x', repeat('n', 4001));
    raise exception '2j. ENTRARON unas notas de 4.001 caracteres';
  exception when check_violation then null;
  end;
  -- El identificador no es de dos letras
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo) values ('ab', 'prompt', 'rapido', 'x');
    raise exception '2k. ENTRÓ un identificador de dos letras';
  exception when check_violation then null;
  end;
  -- La versión 0 no existe, y los usos no son negativos
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, version) values ('csg-v0', 'prompt', 'rapido', 'x', 0);
    raise exception '2l. ENTRÓ una pieza en la versión 0';
  exception when check_violation then null;
  end;
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, usos) values ('csg-neg', 'prompt', 'rapido', 'x', -1);
    raise exception '2m. ENTRÓ una pieza con usos negativos';
  exception when check_violation then null;
  end;
  -- Un molde de 31 y una máquina de 41 tampoco
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo) values ('csg-mo', 'prompt', repeat('m', 31), 'x');
    raise exception '2n. ENTRÓ un molde de 31 caracteres';
  exception when check_violation then null;
  end;
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo, maquina) values ('csg-mq', 'prompt', 'rapido', 'x', repeat('q', 41));
    raise exception '2o. ENTRÓ una máquina de 41 caracteres';
  exception when check_violation then null;
  end;

  -- Y justo EN el tope sí entra, que es la otra mitad de la prueba
  insert into public.consigna_piezas (id, clase, molde, titulo, material, bitacora, versiones, estantes, notas)
    values ('csg-tope', 'prompt', 'rapido', 'x', repeat('m', 20000),
            ('["' || repeat('x', 59996) || '"]')::jsonb,
            ('["' || repeat('x', 199996) || '"]')::jsonb,
            ('["' || repeat('e', 996) || '"]')::jsonb,
            repeat('n', 4000));
  delete from public.consigna_piezas where id = 'csg-tope';

  -- Con todo bien, una pieza de verdad
  insert into public.consigna_piezas (id, clase, molde, titulo, maquina, bloques, material, estantes, bitacora, version, usos, ultima, autor, actualizado)
    values ('csg-m1abc-x1y2z3', 'prompt', 'encargo', 'Resumen de informe', 'claude',
            '[{"id":"rol","rotulo":"Rol","t":"Eres un editor de una revista de divulgación."},'
            '{"id":"tarea","rotulo":"Tarea","t":"Resume {{texto}} en diez puntos."},'
            '{"id":"formato","rotulo":"Formato de salida","t":"Lista numerada, sin introducción ni cierre."}]'::jsonb,
            'El informe pegado.',
            '["Revista","Maestría"]'::jsonb,
            '[{"uid":"u1","t":1758500000000,"maquina":"claude","v":1,"ok":null,"nota":""}]'::jsonb,
            1, 1, 1758500000000, 'josue', 1758500000000);
end $$;
\echo '  ✔ 2. los checks muerden: título, clase, molde, máquina, listas, tamaños, identificador, versión, usos'

-- ════════════════════════════════════════════════════════════════════
-- 3. EL DISPARADOR PONE LA HORA DEL SERVIDOR
-- ════════════════════════════════════════════════════════════════════
do $$
declare antes timestamptz;
begin
  update public.consigna_piezas set actualizado_at = '2020-01-01' where id = 'csg-m1abc-x1y2z3';
  select actualizado_at into antes from public.consigna_piezas where id = 'csg-m1abc-x1y2z3';
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
-- fuera a anon. Al revés, las dos comprobaciones se tapan: la del revoke
-- falla siempre y la de la seguridad por fila aprueba por el motivo
-- equivocado.
do $$
begin
  set role anon;
  begin
    perform count(*) from public.consigna_piezas;
    reset role;
    raise exception '4a. anon pudo leer la tabla (el revoke no está)';
  exception when insufficient_privilege then reset role;
  end;
  set role authenticated;
  begin
    delete from public.consigna_piezas where id = 'csg-m1abc-x1y2z3';
    reset role;
    raise exception '4b. authenticated tiene permiso de delete (aquí se retira con lápida)';
  exception when insufficient_privilege then reset role;
  end;
end $$;
\echo '  ✔ 4. anon no tiene permiso de tabla, y a la casa no se le dio delete'

-- Como lo reparte Supabase
grant all on all tables in schema public to anon, authenticated;

-- Quien entró (auth.uid()) todavía NO está en familia_miembros: es un
-- usuario con sesión que no es de la casa.
do $$
declare n int;
begin
  set role anon;
  select count(*) into n from public.consigna_piezas;
  if n <> 0 then reset role; raise exception '4c. anon ve % piezas', n; end if;
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo) values ('csg-anon', 'prompt', 'rapido', 'x');
    reset role;
    raise exception '4d. anon pudo escribir';
  exception when insufficient_privilege then reset role;
  end;

  set role authenticated;
  select count(*) into n from public.consigna_piezas;
  if n <> 0 then reset role; raise exception '4e. un usuario ajeno ve % piezas', n; end if;
  begin
    insert into public.consigna_piezas (id, clase, molde, titulo) values ('csg-ajeno', 'prompt', 'rapido', 'x');
    reset role;
    raise exception '4f. un usuario ajeno pudo escribir';
  exception when insufficient_privilege then reset role;
  end;
  -- ⚠️ Se vuelve a tomar el rol: el «reset role» del manejador de arriba
  -- lo soltó, y sin esta línea el update corría como superusuario y la
  -- prueba SUSPENDÍA diciendo que el ajeno corrigió la pieza —un fallo de
  -- la prueba con la misma pinta que el fallo de verdad—.
  set role authenticated;
  begin
    update public.consigna_piezas set titulo = 'pisado' where id = 'csg-m1abc-x1y2z3';
    -- Sin fila visible el update no toca nada y no revienta: se mira
    -- DESPUÉS, como superusuario, que la pieza siga como estaba.
    reset role;
  exception when insufficient_privilege then reset role;
  end;
  if (select titulo from public.consigna_piezas where id = 'csg-m1abc-x1y2z3') <> 'Resumen de informe' then
    raise exception '4g. un usuario ajeno pudo corregir una pieza';
  end if;
  reset role;
end $$;
\echo '  ✔ 4. con la seguridad por fila, ni anon ni un ajeno ven ni escriben nada'

-- Ahora quien entró SÍ es de la casa: se le siembra su fila.
insert into public.familia_miembros (user_id, miembro)
  values ('11111111-1111-1111-1111-111111111111', 'josue') on conflict do nothing;

do $$
declare n int; t text;
begin
  set role authenticated;
  select count(*) into n from public.consigna_piezas;
  if n < 1 then reset role; raise exception '4h. uno de la casa ve % piezas (esperaba la sembrada)', n; end if;
  insert into public.consigna_piezas (id, clase, molde, titulo, maquina, bloques, autor, actualizado)
    values ('csg-m2def-a4b5c6', 'bucle', 'hasta', 'Pulir el párrafo', 'chatgpt',
            '[{"id":"paso","rotulo":"Paso que se repite","t":"Escribe el primer párrafo."},'
            '{"id":"parada","rotulo":"Criterio de parada","t":"Para cuando tenga menos de 80 palabras."},'
            '{"id":"tope","rotulo":"Tope","t":"Máximo 5 vueltas."}]'::jsonb,
            'evelyn', 2);
  -- Corrige una que puso OTRO de la casa: es de la casa. Y la corrección
  -- de una pieza usada sube la versión y deja la anterior en versiones.
  update public.consigna_piezas
     set version = 2,
         versiones = '[{"vid":"v1","v":1,"t":1758500000000,"bloques":[]}]'::jsonb,
         notas = 'corregido por otro'
   where id = 'csg-m1abc-x1y2z3';
  select notas into t from public.consigna_piezas where id = 'csg-m1abc-x1y2z3';
  if t <> 'corregido por otro' then reset role; raise exception '4i. la corrección no entró'; end if;
  -- Retira con lápida
  update public.consigna_piezas set eliminado = true, eliminado_at = now() where id = 'csg-m2def-a4b5c6';
  -- Y no puede borrar de verdad aunque Supabase haya dado el permiso de tabla
  delete from public.consigna_piezas where id = 'csg-m2def-a4b5c6';
  if not exists (select 1 from public.consigna_piezas where id = 'csg-m2def-a4b5c6') then
    reset role; raise exception '4j. uno de la casa BORRÓ de verdad una pieza';
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
   where ns.nspname = 'public' and p.proname like 'consigna\_%' and p.prosecdef;
  if n <> 0 then raise exception '5a. hay % función(es) security definer en consigna_* (esperaba 0)', n; end if;
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'consigna_piezas' and 'anon' = any(roles);
  if n <> 0 then raise exception '5b. hay % política(s) para anon', n; end if;
end $$;
\echo '  ✔ 5. no hay ninguna security definer ni política para anon'

-- ════════════════════════════════════════════════════════════════════
-- 6. Y LA COMPROBACIÓN APARTE CORRE Y DEVUELVE SUS FILAS
-- ════════════════════════════════════════════════════════════════════
\pset tuples_only off
\pset format aligned
\echo '── supabase/sql/consigna_comprueba.sql ──'
\i supabase/sql/consigna_comprueba.sql
\pset tuples_only on
\pset format unaligned

-- Y que dice lo que tiene que decir: la fila 2 con 21 columnas y la 4
-- con la seguridad por fila puesta. Que corra sin reventar no basta:
-- una comprobación que sale «NO ESTÁ» también corre sin reventar.
do $$
declare cols int; rls boolean;
begin
  select count(*) into cols from information_schema.columns
   where table_schema = 'public' and table_name = 'consigna_piezas';
  select relrowsecurity into rls from pg_class where oid = to_regclass('public.consigna_piezas');
  if cols <> 21 or not rls then
    raise exception '6a. la comprobación aparte no diría lo esperado: % columnas, rls %', cols, rls;
  end if;
end $$;
\echo '  ✔ 6. la comprobación aparte corre y dice 21 columnas y seguridad por fila puesta'

\echo ''
\echo 'RESULTADO: APRUEBA'
