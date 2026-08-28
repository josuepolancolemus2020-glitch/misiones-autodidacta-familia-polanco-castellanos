-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE LOS VIDEOS DE LAS MISIONES
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra videos de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que las sondas del navegador no pueden ver, porque pasa
-- dentro del servidor:
--
--   · que el `check` del identificador de once MUERDA de verdad —es lo
--     único que impide que una dirección entera acabe dentro del `src`
--     de un iframe en la pantalla del alumno—;
--   · que la puerta pública devuelva lo publicado y NADA MÁS: ni los
--     borradores, ni los videos de otra misión;
--   · que un video oculto salga como LÁPIDA y sin datos, que es lo que
--     permite retirar de la pantalla algo que también está escrito en
--     el catálogo del repositorio;
--   · que `anon` no pueda LEER la tabla ni escribir en ella. Con la
--     clave publicable escrita en el código de M.E.T.A.S, esto es lo
--     único que separa la tabla de cualquiera;
--   · que el archivo sea IDEMPOTENTE: se corre dos veces seguidas.
--
-- Cómo correrla:
--
--   createdb videostest
--   psql -v ON_ERROR_STOP=1 -d videostest -f _dev/prueba-videos-sql.sql
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
create or replace function auth.uid() returns uuid
  language sql stable as $$ select null::uuid $$;

-- La de verdad mira si quien entró está en familia_miembros. Aquí se
-- enciende y se apaga a mano para probar los dos lados de la puerta.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select false $$;

\echo '── Corriendo supabase/sql/metas_videos.sql ──'
\i supabase/sql/metas_videos.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/metas_videos.sql

truncate public.metas_videos;

-- ════════════════════════════════════════════════════════════════════
-- 0. LA RE-CORRIDA SOBRE UNA BASE QUE YA TENÍA LA VERSIÓN VIEJA
-- ════════════════════════════════════════════════════════════════════
-- Es el caso REAL: la primera versión ya está corrida en la base del
-- autor. Lo que se prueba aquí es que volver a pegar el archivo (a) no
-- borre los videos que ya hay y (b) no reviente al cambiarle el tipo
-- que devuelve a la puerta pública — que es justo lo que PostgreSQL NO
-- deja hacer con `create or replace` y por lo que el archivo lleva un
-- `drop function` delante.
\echo ''
\echo '── 0. Re-correr encima de la versión vieja ──'
insert into public.metas_videos (mision, vid, yt_id, titulo, estado)
  values ('re-corrida', 'v-viejo', 'aaaaaaaaaaa', 'Estaba antes', 'publicado');

-- Se simula la puerta VIEJA, la de nueve columnas, para que el archivo
-- se encuentre exactamente lo que se va a encontrar en la base real.
drop function if exists public.metas_videos_publicos(text);
create function public.metas_videos_publicos(p_mision text)
returns table (id text, yt text, titulo text, nota text, dura text,
               canal text, ini int, fin int, del boolean)
language sql stable as $$ select null::text, null::text, null::text, null::text,
  null::text, null::text, null::int, null::int, null::boolean where false $$;

-- Y se le pone el TOPE VIEJO de cinco preguntas, que es lo que hay hoy
-- en la base del autor. Es el caso que se escapa sin ruido: un archivo
-- que añadiera el tope solo «si no existe» dejaría este puesto, diría
-- «Success», y el fallo saldría en F.A.R.O al guardar la sexta.
alter table public.metas_videos drop constraint if exists metas_videos_preguntas_lista;
alter table public.metas_videos add constraint metas_videos_preguntas_lista
  check (jsonb_typeof(preguntas) = 'array' and jsonb_array_length(preguntas) <= 5);

\i supabase/sql/metas_videos.sql

do $$
declare n int; c int;
begin
  select count(*) into n from public.metas_videos where vid = 'v-viejo';
  if n <> 1 then raise exception 'la re-corrida BORRÓ un video que ya estaba'; end if;
  select count(*) into c from information_schema.columns
    where table_schema='public' and table_name='metas_videos' and column_name='preguntas';
  if c <> 1 then raise exception 'la columna preguntas no se añadió'; end if;
  -- Y la puerta nueva devuelve diez columnas, no nueve
  select count(*) into c from public.metas_videos_publicos('re-corrida');
  if c <> 1 then raise exception 'la puerta nueva no devolvió el video'; end if;
  -- Y el tope viejo de cinco quedó SUSTITUIDO, no conservado.
  select substring(pg_get_constraintdef(oid) from '<= ([0-9]+)')::int into c
    from pg_constraint where conname = 'metas_videos_preguntas_lista';
  if c <> 10 then raise exception 'la re-corrida dejó el tope viejo de preguntas: %', c; end if;
  raise notice 're-correr no borra nada, añade la columna, cambia la puerta y sube el tope a diez';
end $$;

truncate public.metas_videos;

-- ════════════════════════════════════════════════════════════════════
-- 1. EL CHECK DEL IDENTIFICADOR DE ONCE
-- ════════════════════════════════════════════════════════════════════
\echo ''
\echo '── 1. El identificador de once caracteres ──'
do $$
declare
  malos text[] := array[
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  -- la dirección entera
    'dQw4w9WgXc',                                    -- diez: uno de menos
    'dQw4w9WgXcQQ',                                  -- doce: uno de más
    'dQw4w9WgX"Q',                                   -- una comilla doble
    'dQw4w9WgX''Q',                                  -- una comilla simple
    'dQw4w9WgX Q',                                   -- un espacio
    'dQw4w9WgX<Q',                                   -- un ángulo
    'javascript:',                                   -- lo que esto existe para parar
    ''                                               -- vacío
  ];
  m text;
  entro boolean;
begin
  foreach m in array malos loop
    entro := true;
    begin
      insert into public.metas_videos (mision, vid, yt_id, estado)
      values ('t', 'x-' || md5(m), m, 'publicado');
    exception when check_violation then
      entro := false;
    end;
    if entro then
      raise exception 'ENTRÓ un identificador que NO debía: %', m;
    end if;
  end loop;
  raise notice 'los nueve identificadores malos rebotaron';
end $$;

-- El bueno sí entra
insert into public.metas_videos (mision, vid, yt_id, titulo, estado)
values ('t-ok', 'v-1', 'dQw4w9WgXcQ', 'bueno', 'publicado');
\echo 'el identificador bueno entró: OK'

-- ════════════════════════════════════════════════════════════════════
-- 2. LOS TOPES DE ini/fin
-- ════════════════════════════════════════════════════════════════════
\echo ''
\echo '── 2. Los topes de los segundos ──'
do $$
declare entro boolean := true;
begin
  begin
    insert into public.metas_videos (mision, vid, yt_id, ini) values ('t','v-neg','dQw4w9WgXcQ',-5);
  exception when check_violation then entro := false; end;
  if entro then raise exception 'entró un ini negativo'; end if;

  entro := true;
  begin
    insert into public.metas_videos (mision, vid, yt_id, ini) values ('t','v-big','dQw4w9WgXcQ',999999);
  exception when check_violation then entro := false; end;
  if entro then raise exception 'entró un ini absurdo'; end if;
  raise notice 'los segundos fuera de rango rebotaron';
end $$;

-- ════════════════════════════════════════════════════════════════════
-- 3. LA PUERTA PÚBLICA: qué sale y qué NO
-- ════════════════════════════════════════════════════════════════════
\echo ''
\echo '── 3. Qué devuelve la puerta pública ──'
truncate public.metas_videos;
insert into public.metas_videos (mision, vid, yt_id, titulo, nota, ini, fin, orden, estado) values
  ('2y3ciclo-fracciones', 'v-01', 'aaaaaaaaaaa', 'Qué es una fracción', 'Del 0 al 4', 0, 245, 1, 'publicado'),
  ('2y3ciclo-fracciones', 'v-02', 'bbbbbbbbbbb', 'Equivalentes',        '',           30, 0,   2, 'publicado'),
  ('2y3ciclo-fracciones', 'v-03', 'ccccccccccc', 'SIN REVISAR',         'secreto',    0,  0,   3, 'borrador'),
  ('2y3ciclo-fracciones', 'v-04', 'ddddddddddd', 'RETIRADO',            'secreto',    0,  0,   4, 'oculto'),
  ('2ciclo-otra-mision',  'v-99', 'eeeeeeeeeee', 'DE OTRA MISIÓN',      '',           0,  0,   1, 'publicado');

do $$
declare n int; t text; d boolean;
begin
  -- Tres filas: los dos publicados y la lápida. El borrador NO, y el de
  -- la otra misión TAMPOCO.
  select count(*) into n from public.metas_videos_publicos('2y3ciclo-fracciones');
  if n <> 3 then raise exception 'la puerta devolvió % filas, se esperaban 3', n; end if;

  -- El borrador no puede salir por ningún lado
  if exists (select 1 from public.metas_videos_publicos('2y3ciclo-fracciones') where id = 'v-03') then
    raise exception 'SALIÓ UN BORRADOR por la puerta pública';
  end if;

  -- El de la otra misión tampoco
  if exists (select 1 from public.metas_videos_publicos('2y3ciclo-fracciones') where id = 'v-99') then
    raise exception 'salió un video de OTRA misión';
  end if;

  -- El oculto sale como lápida y SIN datos
  select titulo, del into t, d from public.metas_videos_publicos('2y3ciclo-fracciones') where id = 'v-04';
  if not d then raise exception 'el oculto no salió marcado como lápida'; end if;
  if t <> '' then raise exception 'la lápida se llevó datos: %', t; end if;

  -- El publicado sí trae lo suyo, y en orden
  select id into t from public.metas_videos_publicos('2y3ciclo-fracciones') limit 1;
  if t <> 'v-01' then raise exception 'el orden no se respetó: primero salió %', t; end if;

  raise notice 'publicados sí, borrador no, otra misión no, lápida sin datos, y en orden';
end $$;

-- Una misión que no existe devuelve cero filas y no revienta
do $$
declare n int;
begin
  select count(*) into n from public.metas_videos_publicos('no-existe-esta-mision');
  if n <> 0 then raise exception 'una misión inexistente devolvió % filas', n; end if;
  select count(*) into n from public.metas_videos_publicos(null);
  if n <> 0 then raise exception 'un nulo devolvió % filas', n; end if;
  raise notice 'misión inexistente y nulo: cero filas, sin reventar';
end $$;

-- ════════════════════════════════════════════════════════════════════
-- 4. LO QUE MÁS IMPORTA: anon NO PUEDE LEER LA TABLA
-- ════════════════════════════════════════════════════════════════════
-- La clave publicable va escrita en el código de M.E.T.A.S, que lee
-- cualquiera. Lo único que separa esta tabla de todo el mundo es esto.
\echo ''
\echo '── 4. anon no puede tocar la tabla ──'
set role anon;
do $$
declare pudo boolean := true;
begin
  begin
    perform 1 from public.metas_videos limit 1;
    -- Sin política para anon, la seguridad por fila no devuelve filas;
    -- pero si además falta el grant, ni siquiera deja mirar. Las dos
    -- respuestas son buenas: lo malo sería ver una fila.
    if exists (select 1 from public.metas_videos) then
      raise exception 'anon LEYÓ una fila de metas_videos';
    end if;
    pudo := false;
  exception when insufficient_privilege then
    pudo := false;
  end;
  if pudo then raise exception 'anon pudo leer'; end if;

  pudo := true;
  begin
    insert into public.metas_videos (mision, vid, yt_id, estado)
    values ('colado', 'v-malo', 'fffffffffff', 'publicado');
    pudo := true;
  exception when insufficient_privilege or check_violation then
    pudo := false;
  end;
  if pudo then raise exception 'anon ESCRIBIÓ en metas_videos'; end if;

  raise notice 'anon no lee y no escribe';
end $$;

-- Pero SÍ puede llamar a la puerta pública: es el alumno abriendo su
-- misión, y si esto fallara la sección se quedaría siempre vacía.
do $$
declare n int;
begin
  select count(*) into n from public.metas_videos_publicos('2y3ciclo-fracciones');
  if n <> 3 then raise exception 'anon no pudo usar la puerta pública (% filas)', n; end if;
  raise notice 'anon sí puede llamar a la puerta pública';
end $$;
reset role;

-- ════════════════════════════════════════════════════════════════════
-- 5. GUARDAR DOS VECES CORRIGE, NO DUPLICA
-- ════════════════════════════════════════════════════════════════════
\echo ''
\echo '── 5. El reintento corrige ──'
insert into public.metas_videos (mision, vid, yt_id, titulo, estado)
values ('2y3ciclo-fracciones', 'v-01', 'aaaaaaaaaaa', 'Título corregido', 'publicado')
on conflict (mision, vid) do update set titulo = excluded.titulo;

do $$
declare n int; t text;
begin
  select count(*) into n from public.metas_videos where mision='2y3ciclo-fracciones' and vid='v-01';
  if n <> 1 then raise exception 'el reintento dejó % filas gemelas', n; end if;
  select titulo into t from public.metas_videos where mision='2y3ciclo-fracciones' and vid='v-01';
  if t <> 'Título corregido' then raise exception 'el reintento no corrigió: %', t; end if;
  raise notice 'un reintento corrige y no duplica';
end $$;

-- ════════════════════════════════════════════════════════════════════
-- 6. EL QUIZ DEL PROPIO VIDEO
-- ════════════════════════════════════════════════════════════════════
\echo ''
\echo '── 6. Las preguntas del video ──'
do $$
declare entro boolean;
begin
  -- Lo que no es una lista NO entra: la pantalla del alumno recorre
  -- esto con un bucle.
  foreach entro in array array[true] loop end loop;
  entro := true;
  begin
    insert into public.metas_videos (mision, vid, yt_id, preguntas)
      values ('q','v-obj','aaaaaaaaaaa','{"p":"no soy lista"}'::jsonb);
  exception when check_violation then entro := false; end;
  if entro then raise exception 'entró un objeto donde tiene que haber una lista'; end if;

  -- Diez SÍ entran. Es lo que se comprueba al subir el tope: un archivo
  -- re-corrido que dejara el `check` viejo en cinco no daría ningún
  -- error aquí arriba, y el fallo aparecería en F.A.R.O al guardar el
  -- sexto video con preguntas.
  insert into public.metas_videos (mision, vid, yt_id, preguntas)
    values ('q','v-diez','aaaaaaaaaaa',
      (select jsonb_agg(jsonb_build_object('p', n::text)) from generate_series(1,10) n));
  raise notice 'diez preguntas entran, que es el tope de hoy';

  entro := true;
  begin
    insert into public.metas_videos (mision, vid, yt_id, preguntas)
      values ('q','v-once','aaaaaaaaaaa',
        (select jsonb_agg(jsonb_build_object('p', n::text)) from generate_series(1,11) n));
  exception when check_violation then entro := false; end;
  if entro then raise exception 'entraron once preguntas donde el tope son diez'; end if;
  raise notice 'lo que no es una lista rebota, y once preguntas también';
end $$;

-- Un video sin preguntas nace con lista vacía, no con nulo: la pantalla
-- del alumno hace `.length` sobre esto sin preguntar.
insert into public.metas_videos (mision, vid, yt_id, titulo, estado)
  values ('q', 'v-sin', 'bbbbbbbbbbb', 'sin preguntas', 'publicado');
insert into public.metas_videos (mision, vid, yt_id, titulo, estado, preguntas)
  values ('q', 'v-con', 'ccccccccccc', 'con preguntas', 'publicado',
    '[{"p":"¿Cuál es el denominador?","ops":["El de abajo","El de arriba","La raya"],"ok":0}]'::jsonb);

do $$
declare j jsonb;
begin
  select preguntas into j from public.metas_videos_publicos('q') where id = 'v-sin';
  if j <> '[]'::jsonb then raise exception 'el video sin preguntas no devolvió lista vacía: %', j; end if;

  select preguntas into j from public.metas_videos_publicos('q') where id = 'v-con';
  if jsonb_array_length(j) <> 1 then raise exception 'las preguntas no viajaron'; end if;
  if (j->0->>'p') is null then raise exception 'la pregunta llegó sin texto'; end if;
  raise notice 'las preguntas viajan por la puerta, y sin ellas viaja una lista vacía';
end $$;

-- Y una lápida no se lleva las preguntas
update public.metas_videos set estado = 'oculto' where vid = 'v-con';
do $$
declare j jsonb;
begin
  select preguntas into j from public.metas_videos_publicos('q') where id = 'v-con';
  if j <> '[]'::jsonb then raise exception 'la lápida se llevó las preguntas: %', j; end if;
  raise notice 'y una lápida no se lleva nada, tampoco las preguntas';
end $$;

-- ════════════════════════════════════════════════════════════════════
\echo ''
select 'RESULTADO: APRUEBA';
