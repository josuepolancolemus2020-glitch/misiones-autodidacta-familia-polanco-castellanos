-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE LA VOZ PRESTADA
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra cuentos de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que las sondas del navegador no pueden ver, porque pasa
-- dentro del servidor:
--
--   · que EL CHECK DE LA ETIQUETA MUERDA. Es la línea que hace que «al
--     modo de» signifique algo: sin ella, un cuento se guarda sin decir
--     a quién imita ni qué máquina lo escribió, y a los seis meses no
--     hay forma de distinguirlo de uno de verdad. La pantalla ya lo
--     para; esto es lo que no se salta con la consola abierta;
--   · que EL CUERPO SEA UNA LISTA y no crezca sin freno;
--   · que UN CUENTO NO CAMBIE DE DUEÑO, que es el lado que la política
--     de update no ve;
--   · que NADIE PUEDA BORRAR DE VERDAD: se retira con lápida, y si se
--     pudiera borrar la fila, la tableta que aún tuviera su copia
--     resucitaría el cuento en la siguiente sincronización;
--   · que `anon` no pueda leer ni escribir NADA, y que con sesión pero
--     sin ser de la casa tampoco;
--   · que un cuento de otro se pueda LEER pero no CORREGIR;
--   · que la higiene (security definer) no quede al alcance de nadie;
--   · que el archivo sea IDEMPOTENTE: se corre dos veces seguidas.
--
-- Cómo correrla:
--
--   createdb voztest
--   psql -v ON_ERROR_STOP=1 -d voztest -f _dev/prueba-voz-prestada-sql.sql
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
-- ⚠️ Y SE REPARTE `auth` COMO LO REPARTE SUPABASE. Allá, `authenticated`
-- puede llamar a auth.uid() —es lo que usan todas las políticas—. Sin
-- esta línea la prueba revienta con «permission denied for schema auth»
-- en la primera escritura hecha como usuario de la casa, que es un fallo
-- DE LA PRUEBA disfrazado de fallo de la tabla: manda a buscar el error
-- en el archivo bueno. Misma familia que el `grant all on all tables`
-- de más abajo, y por la misma razón.
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

\echo '── Corriendo supabase/sql/voz_prestada.sql ──'
\i supabase/sql/voz_prestada.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/voz_prestada.sql

truncate public.voz_prestada;

-- Un cuerpo de cuento válido, para no repetirlo en cada prueba.
create or replace function pg_temp.cuerpo() returns jsonb language sql immutable as $$
  select '[{"t":"Capítulo 1","p":[{"k":"p","t":"La casa contaba."}]}]'::jsonb
$$;

-- ════════════════════════════════════════════════════════════════════
-- 0. LA RE-CORRIDA NO DUPLICA NADA
-- ════════════════════════════════════════════════════════════════════
-- Correr el archivo dos veces tiene que dejar TRES políticas, UN
-- disparador y DOS checks con nombre. Si los `drop ... if exists` se
-- olvidaran, aquí saldrían dos de cada y en la base de verdad se habría
-- duplicado sin decir nada.
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'voz_prestada';
  if n <> 3 then raise exception '0a. políticas duplicadas o faltantes: % (esperaba 3)', n; end if;

  select count(*) into n from pg_trigger t join pg_class c on c.oid = t.tgrelid
   where c.relname = 'voz_prestada' and not t.tgisinternal;
  if n <> 1 then raise exception '0b. disparadores duplicados o faltantes: % (esperaba 1)', n; end if;

  select count(*) into n from pg_constraint
   where conname in ('voz_prestada_etiqueta', 'voz_prestada_cuerpo');
  if n <> 2 then raise exception '0c. checks duplicados o faltantes: % (esperaba 2)', n; end if;
end $$;
\echo '  ✔ 0. correrlo dos veces no duplica políticas, disparadores ni checks'

-- ════════════════════════════════════════════════════════════════════
-- 1. EL CHECK DE LA ETIQUETA MUERDE
-- ════════════════════════════════════════════════════════════════════
-- Es LA regla de esta herramienta. Un cuento sin la voz imitada y sin la
-- máquina que lo escribió es exactamente el objeto que no debe existir.
do $$
begin
  begin
    insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
    values ('c-mala1', 'La casa que contaba', '', 'Claude', pg_temp.cuerpo(), auth.uid());
    raise exception '1a. ENTRÓ un cuento sin decir a quién imita';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1a. un cuento no entra sin decir A QUIÉN imita'

do $$
begin
  begin
    insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
    values ('c-mala2', 'La casa que contaba', 'un narrador de pueblo', '   ', pg_temp.cuerpo(), auth.uid());
    raise exception '1b. ENTRÓ un cuento sin decir QUÉ MÁQUINA lo escribió';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1b. ni sin decir QUÉ MÁQUINA lo escribió'

-- Y un espacio o una coma no cuentan como haber puesto la etiqueta: es
-- la forma más fácil de saltarse un `not null` sin darse cuenta.
do $$
begin
  begin
    insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
    values ('c-mala3', 'x', '.', 'Claude', pg_temp.cuerpo(), auth.uid());
    raise exception '1c. ENTRÓ un cuento con la voz puesta a un solo signo';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1c. y un signo suelto no cuenta como haber puesto la etiqueta'

-- Bien puesta, entra.
insert into public.voz_prestada (cid, titulo, voz, maquina, encargo, capitulos, palabras, puesto_por)
values ('c-1', 'La casa que contaba', 'un narrador de pueblo, de frase corta', 'Claude',
        'un cuento breve sobre una casa que lleva la cuenta de quien entra',
        pg_temp.cuerpo(), 120, auth.uid());
\echo '  ✔ 1d. y bien etiquetada, entra'

-- ⚠️ Y LA ETIQUETA TAMPOCO SE PUEDE BORRAR DESPUÉS. Un check vale para
-- el insert Y para el update: sin esto, la regla se salta guardando
-- primero bien y vaciando el campo después, que es el camino que de
-- verdad tomaría alguien con prisa.
do $$
begin
  begin
    update public.voz_prestada set voz = '' where cid = 'c-1';
    raise exception '1e. SE PUDO borrar la etiqueta de un cuento ya guardado';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1e. y una vez guardada, la etiqueta ya no se puede vaciar'

-- ════════════════════════════════════════════════════════════════════
-- 2. EL CUERPO ES UNA LISTA, Y NO CRECE SIN FRENO
-- ════════════════════════════════════════════════════════════════════
do $$
begin
  begin
    insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
    values ('c-mala4', 'x', 'una voz', 'Claude', '{"t":"no soy una lista"}'::jsonb, auth.uid());
    raise exception '2a. ENTRÓ un cuerpo que no es una lista';
  exception when check_violation then null;
  end;
  begin
    insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
    values ('c-mala5', 'x', 'una voz', 'Claude', '[]'::jsonb, auth.uid());
    raise exception '2b. ENTRÓ un cuento sin ni un capítulo';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 2. el cuerpo tiene que ser una lista y traer al menos un capítulo'

-- ════════════════════════════════════════════════════════════════════
-- 3. UN CUENTO NO CAMBIA DE DUEÑO
-- ════════════════════════════════════════════════════════════════════
-- La política de update impide QUEDARSE con la fila de otro, pero no
-- impide REGALAR la propia: sin el disparador, quien puso un cuento
-- podría dejarlo a nombre de otra persona y perder él mismo la única
-- puerta para corregirlo, sin error y sin poder deshacerlo.
do $$
begin
  begin
    update public.voz_prestada
       set puesto_por = '22222222-2222-2222-2222-222222222222'
     where cid = 'c-1';
    raise exception '3. SE PUDO cambiar el dueño de un cuento';
  exception when raise_exception then
    if position('no cambia de dueño' in sqlerrm) = 0 then raise; end if;
  end;
end $$;
\echo '  ✔ 3. un cuento no puede cambiar de dueño'

-- ════════════════════════════════════════════════════════════════════
-- 4. LA PUERTA
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ SE REPARTEN LOS PERMISOS DE TABLA COMO LOS REPARTE SUPABASE, que da
-- `grant all` a anon y authenticated sobre todo lo de `public`. Sin esta
-- línea la prueba aprobaría por el motivo equivocado —rebotaría por falta
-- de permiso de tabla— y no habría probado la seguridad por fila, que es
-- lo único que de verdad guarda esto en la base de verdad.
grant all on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

set role anon;
do $$
declare n int;
begin
  select count(*) into n from public.voz_prestada;
  if n <> 0 then raise exception '4a. anon VE % cuentos', n; end if;
exception when insufficient_privilege then null;   -- también vale: es más cerrado
end $$;
do $$
begin
  begin
    insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
    values ('c-colado', 'x', 'una voz', 'Claude', pg_temp.cuerpo(),
            '11111111-1111-1111-1111-111111111111');
    raise exception '4b. anon ESCRIBIÓ un cuento';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
\echo '  ✔ 4a. anon no ve ni una fila y no puede escribir'

set role authenticated;
do $$
declare n int;
begin
  -- Con sesión pero SIN ser de la familia: la seguridad por fila deja la
  -- casa muda, sin error. Es lo correcto y es lo que hay que comprobar.
  select count(*) into n from public.voz_prestada;
  if n <> 0 then raise exception '4c. alguien con sesión y sin ser de la casa ve % cuentos', n; end if;
  begin
    insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
    values ('c-intruso', 'x', 'una voz', 'Claude', pg_temp.cuerpo(),
            '11111111-1111-1111-1111-111111111111');
    raise exception '4d. alguien con sesión y sin ser de la casa PUDO escribir';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
\echo '  ✔ 4b. y con sesión, pero sin ser de la casa, no ve ni una fila ni puede escribir'

-- Y el otro lado de la puerta: siendo de la casa, sí. Si esto fallara, la
-- casa se habría quedado sin luz, que es el fallo simétrico y el más caro:
-- una tabla cerrada a todo el mundo parece que perdió los datos.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select true $$;
set role authenticated;
do $$
declare n int;
begin
  select count(*) into n from public.voz_prestada;
  if n <> 1 then raise exception '4e. siendo de la casa se ven % cuentos (esperaba 1)', n; end if;
  insert into public.voz_prestada (cid, titulo, voz, maquina, capitulos, puesto_por)
  values ('c-2', 'El faro que no era', 'una voz de informe', 'Claude',
          pg_temp.cuerpo(), auth.uid());
end $$;
reset role;
\echo '  ✔ 4c. y siendo de la casa, se ve y se escribe'

-- ════════════════════════════════════════════════════════════════════
-- 5. EL CUENTO DE OTRO SE LEE, PERO NO SE CORRIGE
-- ════════════════════════════════════════════════════════════════════
-- Es el reparto que se decidió: el anaquel es de la casa, la corrección
-- es de quien lo puso. Nadie le cambia a otro las palabras de su cuento.
create or replace function auth.uid() returns uuid
  language sql stable as $$ select '22222222-2222-2222-2222-222222222222'::uuid $$;
set role authenticated;
do $$
declare n int;
begin
  select count(*) into n from public.voz_prestada;
  if n <> 2 then raise exception '5a. otro de la casa ve % cuentos (esperaba 2)', n; end if;

  update public.voz_prestada set titulo = 'Pisado' where cid = 'c-1';
  if found then raise exception '5b. otro de la casa PUDO corregir un cuento ajeno'; end if;
end $$;
reset role;
\echo '  ✔ 5. otro de la casa lee todos los cuentos, pero no puede corregir el ajeno'

-- ════════════════════════════════════════════════════════════════════
-- 6. NADIE BORRA DE VERDAD: SE RETIRA CON LÁPIDA
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ Y esto NO revienta con un error: sin política de delete, la
-- seguridad por fila simplemente no encuentra ninguna fila que borrar y
-- el `delete` dice que borró cero. Por eso se comprueba CONTANDO
-- después, no esperando una excepción: una prueba que esperara el error
-- aprobaría también con la tabla vacía.
create or replace function auth.uid() returns uuid
  language sql stable as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;
set role authenticated;
do $$
declare n int;
begin
  delete from public.voz_prestada where cid = 'c-1';
  select count(*) into n from public.voz_prestada where cid = 'c-1';
  if n <> 1 then raise exception '6a. SE BORRÓ de verdad un cuento propio'; end if;

  -- Y la lápida, que es como se retira, sí entra.
  update public.voz_prestada set borrado = true, actualizado = 99 where cid = 'c-1';
  if not found then raise exception '6b. no se pudo poner la lápida a un cuento propio'; end if;
end $$;
reset role;
\echo '  ✔ 6. no se puede borrar la fila; se retira marcándola, y la marca viaja'

-- ════════════════════════════════════════════════════════════════════
-- 7. LA HIGIENE NO ESTÁ AL ALCANCE DE NADIE
-- ════════════════════════════════════════════════════════════════════
-- Corre con los permisos de quien la creó (security definer): si quedara
-- ejecutable, con la clave publicable —que va en el código y la lee
-- cualquiera— se podría llamar a mano y barrer filas.
do $$
begin
  if has_function_privilege('anon', 'public.voz_prestada_higiene()', 'execute')
     or has_function_privilege('authenticated', 'public.voz_prestada_higiene()', 'execute') then
    raise exception '7a. la higiene está al alcance de anon o authenticated';
  end if;
end $$;
\echo '  ✔ 7a. la higiene (security definer) no la puede llamar nadie desde el navegador'

-- Y no hay ninguna OTRA función security definer en voz_prestada_*: la
-- higiene es la única que puede serlo, y aquí no hay puerta pública que
-- abrir (a diferencia de metas_videos).
do $$
declare n int;
begin
  select count(*) into n from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.proname like 'voz\_prestada\_%' and p.prosecdef;
  if n <> 1 then raise exception '7b. hay % función(es) security definer en voz_prestada_* (esperaba 1: la higiene)', n; end if;
end $$;
\echo '  ✔ 7b. y no hay ninguna otra: aquí no existe puerta pública'

\echo ''
\echo 'RESULTADO: APRUEBA'
