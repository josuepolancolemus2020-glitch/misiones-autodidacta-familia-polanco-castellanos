-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE EL RODAJE
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra proyectos de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que las sondas del navegador no pueden ver, porque pasa
-- dentro del servidor:
--
--   · que el `check` de la IA MUERDA de verdad. Es la línea que hace que
--     «generado con IA» signifique algo: sin ella la casilla se marca por
--     encima y la descripción del video no distingue una canción hecha
--     por una máquina de una tocada por alguien;
--   · que el GUARDIA DE LAS CITAS no deje publicar con material ajeno sin
--     fuente, ni con una fuente anunciada en pantalla y sin rótulo. Es la
--     petición central del autor —«quiero citar todo absolutamente»— y es
--     lo único de toda la herramienta que no se puede saltar;
--   · que el guardia NO estorbe al corregir algo YA publicado. Castigar
--     la corrección es la forma más rápida de que nadie corrija;
--   · que borrar un proyecto se lleve sus bloques, sus fuentes y sus
--     reels, y no deje huérfanos invisibles;
--   · que `anon` no pueda leer ni escribir NADA. Con la clave publicable
--     en el navegador, esto es lo único que separa el cuaderno de
--     dirección de cualquiera;
--   · que el archivo sea IDEMPOTENTE: se corre dos veces seguidas.
--
-- Cómo correrla:
--
--   createdb rodajetest
--   psql -v ON_ERROR_STOP=1 -d rodajetest -f _dev/prueba-rodaje-sql.sql
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

\echo '── Corriendo supabase/sql/rodaje.sql ──'
\i supabase/sql/rodaje.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/rodaje.sql

truncate public.rodaje_proyectos cascade;

-- ════════════════════════════════════════════════════════════════════
-- 0. LA RE-CORRIDA NO DUPLICA NADA
-- ════════════════════════════════════════════════════════════════════
-- Correr el archivo dos veces tiene que dejar UNA política por tabla,
-- UN disparador por tabla y UNA llave ajena por tabla hija. Si los
-- `drop ... if exists` se olvidaran, aquí saldrían dos de cada, y en la
-- base de verdad se habría duplicado sin decir nada.
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename like 'rodaje\_%';
  if n <> 4 then raise exception '0a. políticas duplicadas o faltantes: % (esperaba 4)', n; end if;

  select count(*) into n from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
   where c.relname like 'rodaje\_%' and not t.tgisinternal;
  -- cuatro de actualizado_at + el guardia de citas
  if n <> 5 then raise exception '0b. disparadores duplicados o faltantes: % (esperaba 5)', n; end if;

  select count(*) into n from pg_constraint
   where contype = 'f' and conname like 'rodaje\_%\_pid\_fk';
  if n <> 3 then raise exception '0c. llaves ajenas duplicadas o faltantes: % (esperaba 3)', n; end if;
end $$;
\echo '  ✔ 0. correrlo dos veces no duplica políticas, disparadores ni llaves'

-- ════════════════════════════════════════════════════════════════════
-- 1. EL CHECK DE LA IA MUERDE
-- ════════════════════════════════════════════════════════════════════
insert into public.rodaje_proyectos (pid, titulo, tesis)
values ('p-prueba', 'Intuición: memoria del futuro', 'La intuición es un recuerdo del futuro');

-- Una canción generada SIN decir con qué se hizo: tiene que rebotar.
do $$
begin
  begin
    insert into public.rodaje_fuentes (pid, fid, clase, titulo, licencia)
    values ('p-prueba', 'f-mala', 'ia_musica', 'The Calendar of Rain', 'generado_ia');
    raise exception '1a. ENTRÓ una fuente de IA sin herramienta declarada';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1a. una fuente generada con IA no entra sin decir CON QUÉ se hizo'

-- Y con la herramienta, pero con una licencia que no es la de lo generado.
do $$
begin
  begin
    insert into public.rodaje_fuentes (pid, fid, clase, titulo, herramienta, licencia)
    values ('p-prueba', 'f-mala2', 'ia_musica', 'X', 'Google MusicFX', 'uso_justo');
    raise exception '1b. ENTRÓ una fuente de IA con licencia que no es generado_ia';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1b. y tampoco entra si su licencia dice otra cosa que «generado con IA»'

-- El espejo: marcar «generado_ia» en algo que NO lo es sería la puerta de
-- atrás para saltarse lo anterior, y dejaría la bibliografía diciendo que
-- a Villeneuve lo hizo una máquina.
do $$
begin
  begin
    insert into public.rodaje_fuentes (pid, fid, clase, titulo, licencia)
    values ('p-prueba', 'f-mala3', 'pelicula', 'Arrival', 'generado_ia');
    raise exception '1c. ENTRÓ un clip de película con licencia «generado con IA»';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 1c. y «generado con IA» no se le puede poner a lo que no lo es'

-- Bien puesta, entra.
insert into public.rodaje_fuentes (pid, fid, clase, titulo, herramienta, prompt, licencia, rotulo)
values ('p-prueba', 'f-mus', 'ia_musica', 'The Calendar of Rain',
        'Google MusicFX', 'melancholic piano, analog sub-bass, rain', 'generado_ia',
        'Música: «The Calendar of Rain» · generada con Google MusicFX');
\echo '  ✔ 1d. y bien declarada, entra'

-- ════════════════════════════════════════════════════════════════════
-- 2. LA DIRECCIÓN NO PUEDE SER CUALQUIER COSA
-- ════════════════════════════════════════════════════════════════════
-- Esta dirección acaba dentro de un `href` de la pantalla. La pantalla la
-- comprueba con URL(); esto es la segunda cerradura, porque la pantalla
-- no puede fiarse de la base y la base no puede fiarse de la pantalla.
do $$
begin
  begin
    insert into public.rodaje_fuentes (pid, fid, clase, titulo, url)
    values ('p-prueba', 'f-js', 'web', 'trampa', 'javascript:alert(1)');
    raise exception '2. ENTRÓ una dirección javascript:';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 2. una dirección que no es http(s) no entra'

-- ════════════════════════════════════════════════════════════════════
-- 3. EL GUARDIA DE LAS CITAS
-- ════════════════════════════════════════════════════════════════════
-- Un bloque de película SIN fuente apuntada.
insert into public.rodaje_bloques (pid, bid, orden, clase, titulo, dur)
values ('p-prueba', 'b-1', 1, 'pelicula', 'El gancho: Arrival y Dune', 15);

do $$
begin
  begin
    update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';
    raise exception '3a. DEJÓ publicar con un bloque de película sin fuente';
  exception when raise_exception then
    if position('sin fuente declarada' in sqlerrm) = 0 then raise; end if;
  end;
end $$;
\echo '  ✔ 3a. no deja publicar con material ajeno sin fuente declarada'

-- Y el mensaje NOMBRA el bloque: un «no se puede» sin decir cuál obliga a
-- abrir cuarenta bloques uno por uno desde una tableta.
do $$
declare msg text;
begin
  begin
    update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';
  exception when raise_exception then msg := sqlerrm;
  end;
  if position('El gancho' in msg) = 0 then
    raise exception '3b. el error no nombra el bloque que falta: %', msg;
  end if;
end $$;
\echo '  ✔ 3b. y el error NOMBRA el bloque, que es lo que evita abrirlos todos'

-- Se le pone su fuente y ya deja.
insert into public.rodaje_fuentes (pid, fid, clase, titulo, autoria, anio, editor, licencia, rotulo)
values ('p-prueba', 'f-arr', 'pelicula', 'Arrival', 'Denis Villeneuve', '2016',
        'Paramount Pictures', 'uso_justo',
        'Clip: «Arrival» (Denis Villeneuve, 2016) · Paramount Pictures · uso justo con fines educativos');

update public.rodaje_bloques set fids = '["f-arr"]'::jsonb where pid = 'p-prueba' and bid = 'b-1';
update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';
\echo '  ✔ 3c. con su fuente puesta, publica'

-- Corregir algo YA publicado no puede quedar bloqueado: castigar la
-- corrección es la forma más rápida de que nadie corrija.
insert into public.rodaje_bloques (pid, bid, orden, clase, titulo, dur)
values ('p-prueba', 'b-2', 2, 'archivo', 'Material sin citar', 20);
update public.rodaje_proyectos set titulo = 'Título corregido' where pid = 'p-prueba';
update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';
\echo '  ✔ 3d. y corregir algo ya publicado sigue siendo posible'

-- El otro lado del guardia: una fuente que se anuncia EN PANTALLA y no
-- tiene rótulo escrito sale como un recuadro vacío encima del video.
update public.rodaje_proyectos set estado = 'montaje' where pid = 'p-prueba';
update public.rodaje_bloques set fids = '["f-arr"]'::jsonb where pid = 'p-prueba' and bid = 'b-2';
insert into public.rodaje_fuentes (pid, fid, clase, titulo, pantalla, rotulo)
values ('p-prueba', 'f-vacia', 'libro', 'Dune', true, '');

do $$
begin
  begin
    update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';
    raise exception '3e. DEJÓ publicar con una fuente de pantalla sin rótulo';
  exception when raise_exception then
    if position('sin rótulo' in sqlerrm) = 0 then raise; end if;
  end;
end $$;
\echo '  ✔ 3e. ni con una fuente anunciada en pantalla y sin rótulo escrito'

update public.rodaje_fuentes set rotulo = '«Dune» (Frank Herbert, 1965)'
 where pid = 'p-prueba' and fid = 'f-vacia';
update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';
\echo '  ✔ 3f. y con el rótulo escrito, publica'

-- ⚠️ Y EL HUECO QUE SE ABRE SOLO: un `fid` que apunta a una fuente
-- borrada. `fids` es texto dentro de un jsonb y ninguna llave ajena lo
-- sostiene, así que un guardia que contara elementos de la lista en vez de
-- fuentes que EXISTEN dejaría publicar un bloque «con cita» cuya cita no
-- lleva a ninguna parte. La pantalla limpia los bloques al borrar una
-- fuente, pero son dos escrituras sobre la red de una tableta: si la
-- segunda no entra, queda el hueco y nadie vuelve a mirar.
update public.rodaje_proyectos set estado = 'montaje' where pid = 'p-prueba';
update public.rodaje_bloques set fids = '["f-fantasma"]'::jsonb
 where pid = 'p-prueba' and bid = 'b-1';
do $$
begin
  begin
    update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';
    raise exception '3g. DEJÓ publicar con un fid que apunta a una fuente que no existe';
  exception when raise_exception then
    if position('sin fuente declarada' in sqlerrm) = 0 then raise; end if;
  end;
end $$;
\echo '  ✔ 3g. y un fid que apunta a una fuente borrada NO cuenta como cita'

update public.rodaje_bloques set fids = '["f-arr"]'::jsonb
 where pid = 'p-prueba' and bid = 'b-1';
update public.rodaje_proyectos set estado = 'publicado' where pid = 'p-prueba';

-- ════════════════════════════════════════════════════════════════════
-- 4. LOS TIEMPOS NO SE GUARDAN
-- ════════════════════════════════════════════════════════════════════
-- La decisión número 1 del archivo. Si alguna vez alguien añadiera una
-- columna `ini` a los bloques, esta prueba lo caza: un tiempo de entrada
-- guardado se queda viejo en cuanto se mueve un bloque, y eso no se ve
-- hasta que se está grabando con el guion en la mano.
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'rodaje_bloques'
                and column_name in ('ini','inicio','t_ini','empieza')) then
    raise exception '4. hay una columna de tiempo de entrada en rodaje_bloques: se queda vieja al reordenar';
  end if;
end $$;
\echo '  ✔ 4. no se guarda el minuto de entrada de ningún bloque: se suma'

-- ════════════════════════════════════════════════════════════════════
-- 5. LAS FORMAS DE LOS jsonb
-- ════════════════════════════════════════════════════════════════════
do $$
begin
  begin
    insert into public.rodaje_bloques (pid, bid, clase, fids)
    values ('p-prueba', 'b-mal', 'camara', '"no soy una lista"'::jsonb);
    raise exception '5a. ENTRÓ un fids que no es una lista';
  exception when check_violation then null;
  end;
  begin
    insert into public.rodaje_bloques (pid, bid, clase, musica)
    values ('p-prueba', 'b-mal2', 'camara', '[]'::jsonb);
    raise exception '5b. ENTRÓ una música que no es un objeto';
  exception when check_violation then null;
  end;
end $$;
\echo '  ✔ 5. fids es siempre una lista y musica siempre un objeto (la pantalla las recorre)'

-- ════════════════════════════════════════════════════════════════════
-- 6. BORRAR EL PROYECTO SE LLEVA TODO
-- ════════════════════════════════════════════════════════════════════
insert into public.rodaje_reels (pid, rid, titulo, bid)
values ('p-prueba', 'r-1', 'Tu intuición es un recuerdo del futuro', 'b-1');

do $$
declare b int; f int; r int;
begin
  delete from public.rodaje_proyectos where pid = 'p-prueba';
  select count(*) into b from public.rodaje_bloques where pid = 'p-prueba';
  select count(*) into f from public.rodaje_fuentes where pid = 'p-prueba';
  select count(*) into r from public.rodaje_reels   where pid = 'p-prueba';
  if b + f + r <> 0 then
    raise exception '6. quedaron huérfanos: % bloques, % fuentes, % reels', b, f, r;
  end if;
end $$;
\echo '  ✔ 6. borrar el proyecto se lleva sus bloques, sus fuentes y sus reels'

-- ════════════════════════════════════════════════════════════════════
-- 7. LA PUERTA: `anon` NO PUEDE NADA
-- ════════════════════════════════════════════════════════════════════
-- Con la clave publicable escrita en el navegador, esto es lo único que
-- separa el cuaderno de dirección de cualquiera que sepa pedir una
-- cuenta. Y aquí, a diferencia de los videos de M.E.T.A.S, NO hay una
-- puerta pública que abrir: no existe.
--
-- ⚠️ SE REPARTEN LOS PERMISOS DE TABLA COMO LOS REPARTE SUPABASE, que da
-- `grant all` a anon y authenticated sobre todo lo de `public`. Sin esta
-- línea la prueba aprobaría por el motivo equivocado —rebotaría por falta
-- de permiso de tabla— y no habría probado la seguridad por fila, que es
-- lo único que de verdad guarda esto en la base de verdad.
grant all on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

insert into public.rodaje_proyectos (pid, titulo) values ('p-secreto', 'Secreto');

set role anon;
do $$
declare n int;
begin
  select count(*) into n from public.rodaje_proyectos;
  if n <> 0 then raise exception '7a. anon VE % proyectos', n; end if;
exception when insufficient_privilege then null;   -- también vale: es más cerrado
end $$;
do $$
begin
  begin
    insert into public.rodaje_proyectos (pid, titulo) values ('p-colado', 'x');
    raise exception '7b. anon ESCRIBIÓ un proyecto';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
\echo '  ✔ 7a. anon no ve ni una fila y no puede escribir'

set role authenticated;
do $$
declare n int;
begin
  -- Con sesión pero SIN ser de la familia: la seguridad por fila deja la
  -- casa muda, sin error. Es lo correcto y es lo que hay que comprobar.
  select count(*) into n from public.rodaje_proyectos;
  if n <> 0 then raise exception '7c. alguien con sesión y sin ser de la casa ve % proyectos', n; end if;
  begin
    insert into public.rodaje_proyectos (pid, titulo) values ('p-intruso', 'x');
    raise exception '7d. alguien con sesión y sin ser de la casa PUDO escribir';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
\echo '  ✔ 7b. y con sesión, pero sin ser de la casa, no ve ni una fila ni puede escribir'

-- Y el otro lado de la puerta: siendo de la casa, sí. Si esto fallara, la
-- casa se habría quedado sin luz, que es el fallo simétrico y el más caro:
-- una tabla cerrada a todo el mundo parece que perdió los datos.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select true $$;
set role authenticated;
do $$
declare n int;
begin
  select count(*) into n from public.rodaje_proyectos;
  if n <> 1 then raise exception '7e. siendo de la casa se ven % proyectos (esperaba 1)', n; end if;
  insert into public.rodaje_proyectos (pid, titulo) values ('p-casa', 'De la casa');
end $$;
reset role;
\echo '  ✔ 7c. y siendo de la casa, se ve y se escribe'

-- ════════════════════════════════════════════════════════════════════
-- 8. NO HAY NINGUNA FUNCIÓN `security definer` QUE ABRA UN HUECO
-- ════════════════════════════════════════════════════════════════════
-- En metas_videos hay una a propósito —la puerta pública que lee lo
-- publicado—. Aquí NO tiene que haber ninguna: si alguien añade una,
-- estaría abriendo una lectura sin seguridad por fila sin darse cuenta.
do $$
declare n int;
begin
  select count(*) into n from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.proname like 'rodaje\_%' and p.prosecdef;
  if n <> 0 then raise exception '8. hay % función(es) security definer en rodaje_*', n; end if;
end $$;
\echo '  ✔ 8. no hay ninguna función security definer: no existe puerta pública que cerrar'

\echo ''
\echo 'RESULTADO: APRUEBA'
