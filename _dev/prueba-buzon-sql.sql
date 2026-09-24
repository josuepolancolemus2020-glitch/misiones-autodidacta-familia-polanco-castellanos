-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DEL BUZÓN DEL LECTOR
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra envíos de mentira,
--    llena la tabla y toca los permisos. Es para una base de usar y
--    tirar.
--
-- Comprueba lo que las sondas del navegador no pueden ver, porque pasa
-- dentro del servidor: que la puerta pública deje pasar lo que debe,
-- pare lo que debe, y sobre todo que **no deje LEER nada**. La clave
-- publicable va escrita en el navegador de cualquiera; lo único que
-- separa una denuncia con nombres y teléfonos de todo el mundo es la
-- seguridad por fila.
--
-- Y desde el 24 de septiembre de 2026, antes de lo de siempre:
--
--   · que las GUARDIAS de los dos archivos paren nombrando lo que falta
--     (se sacan de los archivos de verdad con sed: una copia escrita
--     aquí aprobaría el día que alguien rompiera el original);
--   · que las TABLAS DEL FINAL de los dos archivos, y la comprobación
--     aparte, digan la verdad: todo cuadrado cuando lo está, y la
--     bandeja en «23 de 25» cuando solo se corrió el primero, que es
--     justo el caso en que el chip 📬 Buzón no sale;
--   · que la calle NO pueda llamar a la función que fabrica folios,
--     con los permisos repartidos como los reparte Supabase al crear
--     cada función (quitárselo a `public` no se lo quita a anon);
--   · y la costura con Redacción: que las columnas que pide la bandeja
--     en js/tools/redaccion.js existan, y que la lista escrita en las
--     comprobaciones sea la misma.
--
-- Cómo correrla, DESDE LA RAÍZ del repositorio (saca trozos de los
-- archivos con rutas relativas), con el servidor de la sesión levantado
-- como dice CLAUDE.md en el apartado de La Voz Prestada:
--
--   createdb -h /tmp/pg -p 55432 -U postgres buzontest
--   psql -h /tmp/pg -p 55432 -U postgres -v ON_ERROR_STOP=1 -d buzontest -f _dev/prueba-buzon-sql.sql
--
-- Termina con «RESULTADO: APRUEBA» o revienta en el primer fallo.
-- ════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

-- ── Los roles, y los permisos que Supabase reparte al CREAR cosas ───
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
end $$;
grant usage on schema public to anon, authenticated;

-- ⚠️ En Supabase, cada tabla y cada FUNCIÓN nueva del esquema public
-- nace con todos los permisos para anon y authenticated: lo deja así
-- el proyecto al crearse. Se reproduce ANTES de correr los archivos,
-- que es cuando pasa de verdad. Sin esto la prueba no vería que la
-- función que fabrica los folios quedaba abierta a la calle, y pasó: el
-- `revoke … from public` del archivo no le quita a anon el permiso que
-- tiene por su nombre.
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;

-- Base limpia, por si la prueba se corre dos veces en la misma.
drop table if exists public.buzon_fotos, public.buzon_mensajes, public.redaccion_ediciones cascade;
do $$
declare f regprocedure;
begin
  for f in select p.oid::regprocedure from pg_proc p join pg_namespace s on s.oid = p.pronamespace
            where s.nspname = 'public' and (p.proname like 'faro\_buzon\_%' or p.proname = 'es_familia')
  loop
    execute 'drop function ' || f::text;
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════
-- 0. LAS GUARDIAS PARAN, Y DICEN QUÉ CORRER
-- ════════════════════════════════════════════════════════════════════
\set g_lector `sed -n '/^do \$guardia\$/,/^\$guardia\$;/p' supabase/sql/buzon_lector.sql`
\set g_editar `sed -n '/^do \$guardia\$/,/^\$guardia\$;/p' supabase/sql/buzon_editar.sql`
select set_config('prueba.g_lector', :'g_lector', false) is not null;
select set_config('prueba.g_editar', :'g_editar', false) is not null;

create or replace function pg_temp.para(guardia text, debe_nombrar text) returns void
language plpgsql as $$
declare msg text;
begin
  if coalesce(guardia, '') = '' then
    raise exception 'FALLO: no se encontró la guardia en el archivo (¿se corre desde la raíz del repositorio?)';
  end if;
  begin
    execute guardia;
  exception when others then
    get stacked diagnostics msg = message_text;
    if msg not like '%' || debe_nombrar || '%' then
      raise exception 'FALLO: la guardia paró sin nombrar %: %', debe_nombrar, msg;
    end if;
    return;
  end;
  raise exception 'FALLO: la guardia NO paró (tenía que nombrar %)', debe_nombrar;
end $$;

select pg_temp.para(current_setting('prueba.g_lector'), 'seguridad_familia_1_puerta.sql');
\echo '  ✔ 0a. sin es_familia(), buzon_lector.sql para y nombra seguridad_familia_1_puerta.sql'

-- La de verdad mira si quien entró está en familia_miembros. Aquí se
-- enciende y se apaga a mano para probar los dos lados de la puerta.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select false $$;

select pg_temp.para(current_setting('prueba.g_lector'), 'redaccion_tables.sql');
\echo '  ✔ 0b. sin las ediciones de la revista, para y nombra redaccion_tables.sql'
select pg_temp.para(current_setting('prueba.g_editar'), 'buzon_lector.sql');
\echo '  ✔ 0c. buzon_editar.sql pegado antes de tiempo para y nombra buzon_lector.sql'

-- ── Las comprobaciones, como vistas: así se les puede preguntar ─────
-- Se sacan de los archivos de verdad: la tabla del final de cada uno (de
-- «with n as (» al final) y la comprobación aparte entera.
\set chk_lector `sed -n '/^with n as (/,$p' supabase/sql/buzon_lector.sql`
\set chk_editar `sed -n '/^with n as (/,$p' supabase/sql/buzon_editar.sql`
\set chk_aparte `cat supabase/sql/buzon_comprueba.sql`
select set_config('prueba.chk_lector', :'chk_lector', false) is not null;
select set_config('prueba.chk_editar', :'chk_editar', false) is not null;
select set_config('prueba.chk_aparte', :'chk_aparte', false) is not null;
do $$
declare v text;
begin
  foreach v in array array['chk_lector', 'chk_editar', 'chk_aparte'] loop
    if position('with n as (' in current_setting('prueba.' || v)) = 0 then
      raise exception 'FALLO: no se encontró la comprobación de % en su archivo', v;
    end if;
    execute format('create temp view %I as %s', v,
      regexp_replace(current_setting('prueba.' || v), ';\s*$', ''));
  end loop;
end $$;

-- ¿Cuadra? Todas las filas que no son informativas, con lo esperado.
create or replace function pg_temp.cuadra(vista text) returns text
language plpgsql as $$
declare r record; malas text := '';
begin
  for r in execute format('select que, esperado, hay from %I where esperado <> ''(informativo)'' order by orden', vista) loop
    if r.hay is distinct from r.esperado then
      malas := malas || format(' [%s: esperaba «%s», dice «%s»]', r.que, r.esperado, r.hay);
    end if;
  end loop;
  return malas;
end $$;
create or replace function pg_temp.fila(vista text, n int) returns text
language plpgsql as $$
declare h text;
begin
  execute format('select hay from %I where orden = $1', vista) into h using n;
  return h;
end $$;

-- Sin las tablas del buzón, la comprobación aparte no revienta: lo dice.
do $$ begin
  if pg_temp.fila('chk_aparte', 1) <> 'NO ESTÁ' then
    raise exception 'FALLO: sin las tablas, la comprobación aparte dice «%»', pg_temp.fila('chk_aparte', 1);
  end if;
end $$;
\echo '  ✔ 0d. sin las tablas, la comprobación aparte corre y dice NO ESTÁ (no revienta)'

-- ── Lo que el buzón da por hecho que ya existe en la base de la revista ──
create table if not exists public.redaccion_ediciones (
  id bigint generated always as identity primary key,
  creado_at timestamptz not null default now(),
  numero int not null, titulo text not null,
  fecha_cierre date, archivada boolean not null default false
);
alter table public.redaccion_ediciones enable row level security;

truncate public.redaccion_ediciones;
insert into public.redaccion_ediciones (numero, titulo, fecha_cierre, archivada)
values (3, 'Nº 03', '2026-08-15', false), (2, 'Nº 02', '2026-07-31', true);

-- Como los corre el editor: cada archivo en UNA transacción.
\echo '── Corriendo supabase/sql/buzon_lector.sql ──'
begin;
\i supabase/sql/buzon_lector.sql
commit;
\echo '── Y otra vez, que tiene que ser idempotente ──'
begin;
\i supabase/sql/buzon_lector.sql
commit;

do $$
declare m text;
begin
  m := pg_temp.cuadra('chk_lector');
  if m <> '' then raise exception 'FALLO: la tabla del final de buzon_lector.sql no cuadra:%', m; end if;
  if pg_temp.fila('chk_lector', 9) <> 'Nº 3 · cierra 15/08/2026' then
    raise exception 'FALLO: lo que la calle ve de la próxima revista sale «%»', pg_temp.fila('chk_lector', 9);
  end if;
  -- Con solo el primero, la comprobación aparte tiene que DECIR que falta
  -- el segundo: la bandeja sin sus dos columnas, que es el caso en que
  -- el chip 📬 Buzón no sale.
  if pg_temp.fila('chk_aparte', 5) <> '23 de 25' or pg_temp.fila('chk_aparte', 4) <> '0 de 2'
     or pg_temp.fila('chk_aparte', 8) <> '3 de 5' then
    raise exception 'FALLO: con solo buzon_lector.sql, la comprobación aparte no avisa: bandeja «%», corrección «%», puertas «%»',
      pg_temp.fila('chk_aparte', 5), pg_temp.fila('chk_aparte', 4), pg_temp.fila('chk_aparte', 8);
  end if;
end $$;
\echo '  ✔ 0e. la tabla del final de buzon_lector.sql cuadra, y la aparte avisa de que falta el segundo (bandeja 23 de 25)'

\echo '── Y la corrección del lector ──'
begin;
\i supabase/sql/buzon_editar.sql
commit;
begin;
\i supabase/sql/buzon_editar.sql
commit;

do $$
declare m text;
begin
  m := pg_temp.cuadra('chk_editar');
  if m <> '' then raise exception 'FALLO: la tabla del final de buzon_editar.sql no cuadra:%', m; end if;
  m := pg_temp.cuadra('chk_aparte');
  if m <> '' then raise exception 'FALLO: la comprobación aparte no cuadra:%', m; end if;
  if pg_temp.fila('chk_aparte', 11) <> 'Nº 3 · cierra 15/08/2026' then
    raise exception 'FALLO: la comprobación aparte dice de la próxima revista «%»', pg_temp.fila('chk_aparte', 11);
  end if;
end $$;
\echo '  ✔ 0f. con los dos archivos, la tabla del final del segundo y la comprobación aparte cuadran enteras'

-- ════════════════════════════════════════════════════════════════════
-- LA PUERTA, PRIMERA CERRADURA: los permisos, antes que la seguridad
-- por fila. Primero se mira lo que dejaron los archivos; solo DESPUÉS
-- se reparten los permisos de tabla como los reparte Supabase, para
-- probar la seguridad por fila. Al revés, las dos comprobaciones se
-- tapan.
-- ════════════════════════════════════════════════════════════════════
do $$
declare f text;
begin
  if has_table_privilege('anon', 'public.buzon_mensajes', 'select,insert,update,delete')
     or has_table_privilege('anon', 'public.buzon_fotos', 'select,insert,update,delete') then
    raise exception 'FALLO: la calle conserva permisos de tabla sobre el buzón';
  end if;
  if has_function_privilege('anon', 'public.faro_buzon_folio()', 'execute')
     or has_function_privilege('authenticated', 'public.faro_buzon_folio()', 'execute') then
    raise exception 'FALLO: la función que fabrica folios se puede llamar desde fuera';
  end if;
  foreach f in array array[
    'public.faro_buzon_estado()',
    'public.faro_buzon_enviar(text,text,text,text,text,text,text,text,text,text,date,text,text,boolean,text,boolean,jsonb)',
    'public.faro_buzon_retirar(text,text)',
    'public.faro_buzon_mio(text,text)',
    'public.faro_buzon_editar(text,text,text,text,text,text,text,text,text,text,text,date,text,text,text,boolean,boolean,jsonb)']
  loop
    if not has_function_privilege('anon', f::regprocedure, 'execute') then
      raise exception 'FALLO: la calle no puede llamar a %, que es una de sus puertas', f;
    end if;
  end loop;
end $$;
\echo '  ✔ 0g. la calle no tiene permisos de tabla ni puede fabricar folios; sus cinco puertas, sí'

-- Y cerrar no puede romper lo que la puerta existe para hacer: con las
-- dos cerraduras puestas, la pantalla del lector (que llama con la clave
-- publicable, o sea como anon) tiene que seguir pudiendo todo lo suyo.
-- faro_buzon_enviar sigue fabricando su folio porque corre como dueña.
do $$
declare fol text; n int;
begin
  set local role anon;
  fol := public.faro_buzon_enviar('cerr|55556666|la puerta sigue abierta para mandar', 'nota', '',
    'La puerta de la calle sigue sirviendo para mandar lo suyo.', 'Lectora Uno', '5555-6666',
    '', '', '', '', null, '', '', true, '2026-09', false, '[]'::jsonb);
  if coalesce(fol, '') = '' then
    reset role; raise exception 'FALLO: con las cerraduras puestas, la calle ya no puede MANDAR';
  end if;
  select count(*) into n from public.faro_buzon_mio(fol, '5555-6666');
  if n <> 1 then reset role; raise exception 'FALLO: la calle no recupera lo suyo con folio y teléfono'; end if;
  if public.faro_buzon_editar(fol, '5555-6666', 'cerr2|55556666|corregido', 'nota', '',
       'La puerta de la calle sigue sirviendo para corregir lo suyo.', 'Lectora Uno',
       '', '', '', '', null, '', '', '2026-09', false, false, '[]'::jsonb) <> 'ok' then
    reset role; raise exception 'FALLO: la calle no puede corregir lo suyo';
  end if;
  if not public.faro_buzon_retirar(fol, '5555-6666') then
    reset role; raise exception 'FALLO: la calle no puede retirar lo suyo';
  end if;
  select count(*) into n from public.faro_buzon_estado();
  if n <> 1 then reset role; raise exception 'FALLO: la calle no puede preguntar cuándo cierra la revista'; end if;
  reset role;
end $$;
\echo '  ✔ 0g-bis. con las dos cerraduras puestas, la calle sigue pudiendo mandar, recuperar, corregir, retirar y preguntar el cierre'

-- Y la costura con Redacción: la bandeja pide sus columnas POR NOMBRE,
-- y con UNA que falte PostgREST rebota la consulta entera y el chip no
-- sale. La lista se saca de js/tools/redaccion.js, no se copia aquí.
\set cols_js `sed -n '/from(RED_T_BUZON).select(/,/^ *)/p' js/tools/redaccion.js | grep -v '^ *)' | grep -oE "'[a-z_,]+'" | tr -d "'\n"`
\set cols_editar `sed -n "/string_to_array(/,/', ',')))/p" supabase/sql/buzon_editar.sql | grep -oE "'[a-z_,]+'" | tr -d "'\n"`
\set cols_aparte `sed -n "/string_to_array(/,/', ',')))/p" supabase/sql/buzon_comprueba.sql | grep -oE "'[a-z_,]+'" | tr -d "'\n"`
select set_config('prueba.cols_js', :'cols_js', false) is not null;
select set_config('prueba.cols_editar', :'cols_editar', false) is not null;
select set_config('prueba.cols_aparte', :'cols_aparte', false) is not null;
do $$
declare js text[]; ed text[]; ap text[]; faltan text[];
begin
  js := array(select distinct x from unnest(string_to_array(current_setting('prueba.cols_js'), ',')) x where x <> '' order by 1);
  ed := array(select distinct x from unnest(string_to_array(current_setting('prueba.cols_editar'), ',')) x where x <> '' order by 1);
  ap := array(select distinct x from unnest(string_to_array(current_setting('prueba.cols_aparte'), ',')) x where x <> '' order by 1);
  if coalesce(array_length(js, 1), 0) < 20 then
    raise exception 'FALLO: no se pudo sacar la lista de columnas de js/tools/redaccion.js (salieron %)', coalesce(array_length(js, 1), 0);
  end if;
  if js <> ed then raise exception 'FALLO: la lista de buzon_editar.sql (%) no es la de redaccion.js (%)', ed, js; end if;
  if js <> ap then raise exception 'FALLO: la lista de buzon_comprueba.sql (%) no es la de redaccion.js (%)', ap, js; end if;
  faltan := array(select x from unnest(js) x where not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'buzon_mensajes' and column_name = x));
  if array_length(faltan, 1) is not null then
    raise exception 'FALLO: la bandeja pide columnas que no existen: %', faltan;
  end if;
  if array_length(js, 1) <> 25 then
    raise exception 'FALLO: la bandeja pide % columnas y las comprobaciones dicen «de 25»', array_length(js, 1);
  end if;
end $$;
\echo '  ✔ 0h. las 25 columnas que pide la bandeja de Redacción existen, y las comprobaciones llevan la misma lista'

truncate public.buzon_mensajes cascade;

-- En Supabase el rol anon SÍ tiene permisos de tabla sobre el esquema
-- public: se los da el proyecto al crearse, y el archivo se los quita.
-- Aquí se le vuelven a dar a mano para probar la SEGUNDA cerradura: si
-- algún día alguien los devuelve sin querer, la seguridad por fila
-- tiene que seguir dejando fuera a la calle. Sin esta línea la prueba de
-- abajo pasaría por el motivo equivocado (por falta de permisos de
-- tabla) y no probaría lo que dice probar.
grant all on public.buzon_mensajes, public.buzon_fotos to anon, authenticated;

create or replace function pg_temp.di(etiqueta text, cond boolean) returns void
language plpgsql as $$ begin
  raise notice '%  %', case when cond then '  ✔' else '  ✘ FALLA:' end, etiqueta;
  if not cond then raise exception 'FALLO: %', etiqueta; end if;
end $$;

do $$
declare
  f1 text; f2 text; f3 text; n int; c int; msg text;
  foto_ok text := 'data:image/jpeg;base64,' || repeat('A', 400);
  foto_gigante text := 'data:image/jpeg;base64,' || repeat('A', 1500000);
begin
  raise notice '';
  raise notice '── 1. Un envío normal entra y devuelve folio ──';
  f1 := public.faro_buzon_enviar('ana|99887766|se cayo el muro', 'denuncia', 'El muro',
    'Se cayó el muro del patio y los niños pasan por ahí todos los días.',
    'Ana López', '9988-7766', '', 'Comayagua', 'Escuela Lempira', 'madre',
    null, '', '', true, '2026-08', false, '[]'::jsonb);
  perform pg_temp.di('devuelve un folio con forma B-XXXX (' || f1 || ')',
    f1 ~ '^B-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$');
  perform pg_temp.di('sin 0/O/1/I/L, que se confunden al dictarlo por teléfono', f1 !~ '[01OIL]');

  raise notice '── 2. Mandarlo dos veces CORRIGE, no duplica ──';
  f2 := public.faro_buzon_enviar('ana|99887766|se cayo el muro', 'denuncia', 'El muro, corregido',
    'Se cayó el muro del patio. Corrijo: fue el martes.', 'Ana López', '9988-7766', '', 'Comayagua',
    'Escuela Lempira', 'madre', null, '', '', true, '2026-08', false, '[]'::jsonb);
  select count(*) into n from public.buzon_mensajes;
  perform pg_temp.di('sigue habiendo UNA fila, no dos', n = 1);
  perform pg_temp.di('y con el MISMO folio: el lector no se queda con dos', f1 = f2);
  select count(*) into n from public.buzon_mensajes where titulo = 'El muro, corregido';
  perform pg_temp.di('la corrección pisa a la primera', n = 1);

  raise notice '── 3. Lo que NO tiene que entrar ──';
  perform pg_temp.di('un texto de cinco letras, fuera',
    '' = public.faro_buzon_enviar('x|99887766|hola', 'nota', '', 'corto', 'Ana', '9988-7766',
      '', '', '', '', null, '', '', true, '2026-08', false, '[]'::jsonb));
  perform pg_temp.di('sin aceptar los requisitos de ética, fuera',
    '' = public.faro_buzon_enviar('y|99887766|un texto suficientemente largo', 'nota', '',
      'un texto suficientemente largo para pasar', 'Ana', '9988-7766', '', '', '', '',
      null, '', '', false, '2026-08', false, '[]'::jsonb));
  perform pg_temp.di('sin nombre, fuera (no se publica nada anónimo)',
    '' = public.faro_buzon_enviar('z|99887766|un texto suficientemente largo', 'nota', '',
      'un texto suficientemente largo para pasar', '', '9988-7766', '', '', '', '',
      null, '', '', true, '2026-08', false, '[]'::jsonb));
  perform pg_temp.di('con un teléfono de tres dígitos, fuera',
    '' = public.faro_buzon_enviar('w|123|un texto suficientemente largo', 'nota', '',
      'un texto suficientemente largo para pasar', 'Ana López', '123', '', '', '', '',
      null, '', '', true, '2026-08', false, '[]'::jsonb));
  select count(*) into n from public.buzon_mensajes;
  perform pg_temp.di('nada de eso dejó rastro en la tabla', n = 1);

  raise notice '── 4. Las fotos: dos como mucho, y con tope de tamaño ──';
  f3 := public.faro_buzon_enviar('luis|22334455|vengan a ver esto de la escuela', 'aulas', 'Siembra',
    'El viernes sembramos ciento veinte árboles con los alumnos de sexto grado.',
    'Luis Pérez', '2233-4455', '', 'El Progreso', 'Escuela Lempira', 'maestro',
    '2026-08-21', '9:00 a. m.', 'El predio', true, '2026-08', true,
    jsonb_build_array(foto_ok, foto_ok, foto_ok));
  select count(*) into c from public.buzon_fotos bf
    join public.buzon_mensajes bm on bm.id = bf.mensaje_id where bm.folio = f3;
  perform pg_temp.di('manda tres y solo se guardan DOS', c = 2);
  select fotos into n from public.buzon_mensajes where folio = f3;
  perform pg_temp.di('la cuenta de la fila dice 2, para que la bandeja no vaya a buscarlas', n = 2);

  perform public.faro_buzon_enviar('luis|22334455|vengan a ver esto de la escuela', 'aulas', 'Siembra',
    'El viernes sembramos ciento veinte árboles con los alumnos de sexto grado.',
    'Luis Pérez', '2233-4455', '', 'El Progreso', 'Escuela Lempira', 'maestro',
    '2026-08-21', '9:00 a. m.', 'El predio', true, '2026-08', true, jsonb_build_array(foto_ok));
  select count(*) into c from public.buzon_fotos bf
    join public.buzon_mensajes bm on bm.id = bf.mensaje_id where bm.folio = f3;
  select fotos into n from public.buzon_mensajes where folio = f3;
  perform pg_temp.di('si corrige y manda UNA, la otra no se queda colgada', c = 1 and n = 1);

  perform public.faro_buzon_enviar('luis|22334455|vengan a ver esto de la escuela', 'aulas', 'Siembra',
    'El viernes sembramos ciento veinte árboles con los alumnos de sexto grado.',
    'Luis Pérez', '2233-4455', '', 'El Progreso', 'Escuela Lempira', 'maestro',
    '2026-08-21', '9:00 a. m.', 'El predio', true, '2026-08', true,
    jsonb_build_array(foto_gigante, 'https://un-enlace-cualquiera.com/foto.jpg'));
  select count(*) into c from public.buzon_fotos bf
    join public.buzon_mensajes bm on bm.id = bf.mensaje_id where bm.folio = f3;
  perform pg_temp.di('una foto de 1,5 MB y un enlace pelado: ninguna entra', c = 0);

  raise notice '── 5. El freno: cinco por teléfono y día ──';
  for i in 1..8 loop
    perform public.faro_buzon_enviar('spam' || i || '|55556666|texto numero ' || i, 'nota', '',
      'un texto suficientemente largo para pasar, el número ' || i, 'Pedro Ruiz', '5555-6666',
      '', '', '', '', null, '', '', true, '2026-08', false, '[]'::jsonb);
  end loop;
  select count(*) into n from public.buzon_mensajes where tel = '5555-6666';
  perform pg_temp.di('de ocho intentos seguidos entran 5, no 8 (entraron ' || n || ')', n = 5);
  select count(*) into n from public.buzon_mensajes where tel = '9988-7766';
  perform pg_temp.di('y el freno de uno no toca a los demás', n = 1);

  raise notice '── 6. El lector retira lo suyo ──';
  perform pg_temp.di('con el folio de otro, no borra nada',
    public.faro_buzon_retirar(f3, '9999-0000') = false);
  perform pg_temp.di('con su folio y su teléfono, sí',
    public.faro_buzon_retirar(f3, '22334455') = true);
  select count(*) into n from public.buzon_mensajes where folio = f3;
  perform pg_temp.di('la fila desaparece de verdad (no hay papelera, a propósito)', n = 0);
  select count(*) into c from public.buzon_fotos;
  perform pg_temp.di('y se lleva sus fotos por delante', c = 0);

  raise notice '── 7. Lo único que puede preguntar la calle ──';
  select numero into n from public.faro_buzon_estado();
  perform pg_temp.di('devuelve la edición ABIERTA (la 3), no la archivada', n = 3);

  -- ════════════════════════════════════════════════════════════════
  -- 8. EL LECTOR CORRIGE LO QUE MANDÓ
  -- ════════════════════════════════════════════════════════════════
  raise notice '── 7-bis. La puerta de M.E.T.A.S ──';
  perform pg_temp.di('una petición de ayuda entra',
    '' <> public.faro_buzon_enviar('maestro|33334444|quiero usar metas con mis alumnos', 'metas', '',
      'Soy maestro de sexto y quiero usar la plataforma con mis alumnos. ¿Por dónde empiezo?',
      'Carlos Mejía', '3333-4444', '', 'La Ceiba', 'Escuela Morazán', 'maestro',
      null, '', '', true, '2026-08', false, '[]'::jsonb));
  select clase into msg from public.buzon_mensajes where tel = '3333-4444';
  perform pg_temp.di('y llega marcada como «metas», no revuelta con lo de la revista',
    msg = 'metas');
  delete from public.buzon_mensajes where tel = '3333-4444';

  raise notice '── 8. El lector corrige lo suyo ──';
  f1 := public.faro_buzon_enviar('carmen|66667777|el techo del aula gotea desde marzo', 'denuncia',
    'El techo', 'El techo del aula gotea desde marzo y los cuadernos se mojan.',
    'Carmen Díaz', '6666-7777', '', 'Siguatepeque', 'Escuela Morazán', 'madre',
    null, '', '', true, '2026-08', false, jsonb_build_array(foto_ok));
  select count(*) into n from public.buzon_mensajes where folio = f1;
  perform pg_temp.di('hay un envío para corregir', n = 1);

  perform pg_temp.di('con el teléfono de otro, no lo deja ni verlo',
    not exists (select 1 from public.faro_buzon_mio(f1, '9999-0000')));
  select texto into msg from public.faro_buzon_mio(f1, '66667777');
  perform pg_temp.di('con su folio y su teléfono, recupera lo que escribió',
    msg like 'El techo del aula gotea%');
  perform pg_temp.di('y le dice que todavía lo puede cambiar',
    (select se_puede from public.faro_buzon_mio(f1, '66667777')) = true);

  -- Lo lee alguien de la redacción
  update public.buzon_mensajes set estado = 'leido', visto_at = now(), visto_por = 'josue'
   where folio = f1;

  perform pg_temp.di('corrige, y el servidor dice que ok',
    'ok' = public.faro_buzon_editar(f1, '6666-7777', 'carmen|66667777|el techo del aula lleva goteando',
      'denuncia', 'El techo del aula',
      'El techo del aula lleva goteando desde marzo. Corrijo: son dos aulas, no una.',
      'Carmen Díaz', '', 'Siguatepeque', 'Escuela Morazán', 'madre',
      null, '', '', '2026-08', false, false, '[]'::jsonb));

  select count(*) into n from public.buzon_mensajes where tel = '6666-7777';
  perform pg_temp.di('sigue habiendo UN envío suyo, no dos', n = 1);
  select texto into msg from public.buzon_mensajes where folio = f1;
  perform pg_temp.di('y dice lo nuevo', msg like '%son dos aulas%');
  select estado into msg from public.buzon_mensajes where folio = f1;
  perform pg_temp.di('vuelve a la cola como SIN LEER, para que se relea', msg = 'nuevo');
  select ediciones into n from public.buzon_mensajes where folio = f1;
  perform pg_temp.di('queda anotado que lo corrigió una vez', n = 1);
  perform pg_temp.di('y cuándo, para que la bandeja lo avise',
    (select editado_at is not null from public.buzon_mensajes where folio = f1));

  select count(*) into c from public.buzon_fotos bf
    join public.buzon_mensajes bm on bm.id = bf.mensaje_id where bm.folio = f1;
  perform pg_temp.di('sin pedirlo, las fotos se quedan donde estaban', c = 1);

  perform pg_temp.di('si pide cambiarlas, se cambian',
    'ok' = public.faro_buzon_editar(f1, '6666-7777', 'carmen|66667777|el techo del aula lleva goteando',
      'denuncia', 'El techo del aula',
      'El techo del aula lleva goteando desde marzo. Corrijo: son dos aulas, no una.',
      'Carmen Díaz', '', 'Siguatepeque', 'Escuela Morazán', 'madre',
      null, '', '', '2026-08', true, true, jsonb_build_array(foto_ok, foto_ok)));
  select count(*) into c from public.buzon_fotos bf
    join public.buzon_mensajes bm on bm.id = bf.mensaje_id where bm.folio = f1;
  select fotos into n from public.buzon_mensajes where folio = f1;
  perform pg_temp.di('y la cuenta se pone al día (2)', c = 2 and n = 2);

  perform pg_temp.di('con un teléfono que no es el suyo, no corrige nada',
    'no-existe' = public.faro_buzon_editar(f1, '9999-0000', 'x', 'nota', 'Secuestro',
      'Un texto suficientemente largo escrito por un intruso cualquiera.',
      'Intruso', '', '', '', '', null, '', '', '2026-08', false, false, '[]'::jsonb));
  select texto into msg from public.buzon_mensajes where folio = f1;
  perform pg_temp.di('y el texto sigue siendo el de su dueño', msg like '%son dos aulas%');

  perform pg_temp.di('un texto de cinco letras tampoco pasa por aquí',
    'corto' = public.faro_buzon_editar(f1, '6666-7777', 'x', 'nota', '', 'corto',
      'Carmen Díaz', '', '', '', '', null, '', '', '2026-08', false, false, '[]'::jsonb));

  -- ── La puerta que de verdad importa ──
  raise notice '── 9. Lo ya atendido NO se puede cambiar ──';
  update public.buzon_mensajes set estado = 'atendido', nota_id = 1 where folio = f1;
  perform pg_temp.di('el servidor lo para y dice por qué',
    'atendido' = public.faro_buzon_editar(f1, '6666-7777', 'x', 'nota', 'Otra cosa',
      'Un texto completamente distinto metido después de que lo aprobaran.',
      'Carmen Díaz', '', '', '', '', null, '', '', '2026-08', false, false, '[]'::jsonb));
  select texto into msg from public.buzon_mensajes where folio = f1;
  perform pg_temp.di('lo verificado y lo que se va a imprimir siguen siendo LO MISMO',
    msg like '%son dos aulas%');
  perform pg_temp.di('y a él se lo dice antes de dejarle escribir',
    (select se_puede from public.faro_buzon_mio(f1, '66667777')) = false);

  update public.buzon_mensajes set estado = 'descartado' where folio = f1;
  perform pg_temp.di('lo descartado tampoco se toca',
    'descartado' = public.faro_buzon_editar(f1, '6666-7777', 'x', 'nota', '',
      'Un texto suficientemente largo para pasar el mínimo de letras.',
      'Carmen Díaz', '', '', '', '', null, '', '', '2026-08', false, false, '[]'::jsonb));

  update public.buzon_mensajes set estado = 'nuevo', ediciones = 10 where folio = f1;
  perform pg_temp.di('y a la corrección número once se le pone tope',
    'tope' = public.faro_buzon_editar(f1, '6666-7777', 'x', 'nota', '',
      'Un texto suficientemente largo para pasar el mínimo de letras.',
      'Carmen Díaz', '', '', '', '', null, '', '', '2026-08', false, false, '[]'::jsonb));

  perform public.faro_buzon_retirar(f1, '66667777');

  -- ════════════════════════════════════════════════════════════════
  -- 10. LA PARTE QUE IMPORTA: desde la calle no se lee NADA
  -- ════════════════════════════════════════════════════════════════
  raise notice '── 10. Desde la calle, con la clave publicable (rol anon) ──';
  perform public.faro_buzon_enviar('rls|77778888|una denuncia con nombres dentro', 'denuncia',
    'Secreto', 'Una denuncia con el nombre de una persona dentro.',
    'Testigo', '7777-8888', 'testigo@correo.com', 'Comayagua', 'Escuela X', 'vecino',
    null, '', '', true, '2026-08', false, jsonb_build_array(foto_ok));

  set local role anon;

  select count(*) into n from public.buzon_mensajes;
  perform pg_temp.di('leer los mensajes devuelve 0 filas', n = 0);
  select count(*) into n from public.buzon_fotos;
  perform pg_temp.di('leer las fotos devuelve 0 filas', n = 0);

  begin
    insert into public.buzon_mensajes (folio, huella, texto, nombre, tel)
    values ('B-XXXX', 'a mano', 'texto', 'Intruso', '99999999');
    raise exception 'FUGA: anon escribe saltándose la función';
  exception
    when insufficient_privilege then
      raise notice '  ✔  no puede escribir a mano saltándose la función';
    when others then
      get stacked diagnostics msg = message_text;
      if msg like 'FUGA%' then raise; end if;
      raise notice '  ✔  no puede escribir a mano saltándose la función';
  end;

  delete from public.buzon_mensajes;
  update public.buzon_mensajes set texto = 'pisado';
  raise notice '  ✔  su DELETE y su UPDATE no alcanzan ninguna fila';

  perform pg_temp.di('pero sí puede MANDAR lo suyo, que es para lo que está la puerta',
    '' <> public.faro_buzon_enviar('otro|11112222|un texto suficientemente largo aqui', 'nota', '',
      'un texto suficientemente largo para pasar el mínimo', 'Otro Lector', '1111-2222',
      '', '', '', '', null, '', '', true, '2026-08', false, '[]'::jsonb));
  perform * from public.faro_buzon_estado();
  raise notice '  ✔  y preguntar cuándo cierra la próxima revista';

  reset role;
  select count(*) into n from public.buzon_mensajes where texto = 'pisado';
  perform pg_temp.di('desde dentro, ninguna fila quedó pisada por el intruso', n = 0);
  select count(*) into n from public.buzon_mensajes;
  perform pg_temp.di('y siguen ahí las ' || n || ' filas, intactas', n > 0);

  raise notice '── 11. Y la familia, con su sesión, sí entra ──';
end $$;

-- La puerta de la familia, encendida
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select true $$;

do $$
declare n int;
begin
  set local role authenticated;
  select count(*) into n from public.buzon_mensajes;
  perform pg_temp.di('la familia lee su bandeja (' || n || ' envíos)', n > 0);
  select count(*) into n from public.buzon_fotos;
  perform pg_temp.di('y las fotos (' || n || ')', n > 0);
  update public.buzon_mensajes set estado = 'leido' where estado = 'nuevo';
  get diagnostics n = row_count;
  perform pg_temp.di('y puede marcarlos leídos (' || n || ')', n > 0);
end $$;

\echo ''
\echo 'RESULTADO: APRUEBA'
