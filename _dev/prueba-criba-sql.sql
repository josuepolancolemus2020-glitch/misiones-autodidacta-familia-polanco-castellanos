-- ════════════════════════════════════════════════════════════════════
-- PRUEBA DEL SQL DE LA CRIBA
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ NO CORRER ESTO EN LA BASE DE VERDAD. Siembra ítems de mentira y
--    toca los permisos. Es para una base de usar y tirar.
--
-- Comprueba lo que ninguna sonda del navegador puede ver, porque pasa
-- dentro del servidor:
--
--   · que el `check` de la dirección MUERDA —es lo único que impide que
--     un `javascript:` escrito por un desconocido acabe dentro de un
--     href de F.A.R.O, con la sesión de la casa puesta—;
--   · que la escala de evidencia muerda: la regla 1 de la puerta no
--     vale nada si un preprint puede entrar diciendo que fue revisado;
--   · que la EDICIÓN TENGA FONDO de verdad, y que lo que no entra hoy
--     siga ahí mañana en vez de perderse;
--   · que `anon` no pueda leer ni escribir NADA;
--   · que la casa pueda marcar leído y NO pueda insertar ni borrar;
--   · que la higiene no se lleve por delante lo leído, lo guardado ni
--     lo retractado;
--   · que el archivo sea IDEMPOTENTE y que la re-corrida NO pise una
--     fuente editada a mano.
--
-- Cómo correrla:
--
--   createdb cribatest
--   psql -v ON_ERROR_STOP=1 -d cribatest -f _dev/prueba-criba-sql.sql
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
create table if not exists auth.users (id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;

-- La de verdad mira si quien entró está en familia_miembros. Aquí se
-- enciende y se apaga a mano para probar los dos lados de la puerta.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select false $$;

\echo '── Corriendo supabase/sql/criba.sql ──'
\i supabase/sql/criba.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/criba.sql

-- ════════════════════════════════════════════════════════════════════
-- 0. LA RE-CORRIDA NO PISA UNA FUENTE EDITADA A MANO
-- ════════════════════════════════════════════════════════════════════
-- Es `do nothing` y no `do update` a propósito: si alguien corrige una
-- dirección desde el editor, volver a pegar el archivo no puede
-- deshacerlo. Esta es la comprobación de esa decisión.
update public.criba_fuentes set url = 'https://cambiada.example/feed/', activa = false where id = 'sieca';
\i supabase/sql/criba.sql
do $$
declare u text; a boolean;
begin
  select url, activa into u, a from public.criba_fuentes where id = 'sieca';
  if u <> 'https://cambiada.example/feed/' or a then
    raise exception 'FALLA: la re-corrida PISÓ una fuente editada a mano (url=%, activa=%)', u, a;
  end if;
end $$;
update public.criba_fuentes set url = 'https://www.sieca.int/feed/', activa = true where id = 'sieca';
\echo 'ok 0 · la re-corrida respeta lo editado a mano'

-- ════════════════════════════════════════════════════════════════════
-- 1. EL CHECK DE LA DIRECCIÓN MUERDE
-- ════════════════════════════════════════════════════════════════════
-- Lo que entra aquí lo escribió un desconocido de la internet abierta, y
-- acaba dentro de un href en el mismo dominio que la Bóveda.
do $$
declare
  malas text[] := array[
    'javascript:alert(1)',                    -- el clásico
    'JavaScript:alert(1)',                    -- con mayúsculas
    'https://a.hn/x" onmouseover="robar()',   -- la comilla que cierra el atributo
    'https://a.hn/x'' onload=''x',            -- la comilla simple
    'https://a.hn/<script>',                  -- el menor que
    'https://a.hn/ con espacio',              -- el espacio
    'data:text/html,<script>x</script>',      -- data:
    'ftp://a.hn/x'                            -- ni http ni https
  ];
  mala text;
  colada text := '';
begin
  foreach mala in array malas loop
    begin
      insert into public.criba_items (fuente_id, clave, titulo, url)
        values ('cnbs', 'mala-' || md5(mala), 'x', mala);
      colada := colada || mala || ' | ';
    exception when check_violation then null;
    end;
  end loop;
  if colada <> '' then
    raise exception 'FALLA: el check de url dejó pasar: %', colada;
  end if;
end $$;
\echo 'ok 1 · ocho direcciones peligrosas rebotan, incluida la comilla que cierra el atributo'

-- Y que las buenas sí entren, que un check que lo rechaza todo también aprueba.
insert into public.criba_items (fuente_id, clave, titulo, url, doi, evidencia, publicado, idioma)
values ('cnbs', 'buena-1', 'Resolución sobre entidades no reguladas',
        'https://www.cnbs.gob.hn/aviso-1', null, 'trabajo', now() - interval '1 day', 'es');
\echo 'ok 1b · una dirección normal entra'

-- ════════════════════════════════════════════════════════════════════
-- 2. LA ESCALA DE EVIDENCIA MUERDE — LA REGLA 1 DEPENDE DE ESTO
-- ════════════════════════════════════════════════════════════════════
do $$ begin
  begin
    insert into public.criba_items (fuente_id, clave, titulo, url, evidencia)
      values ('cnbs', 'mala-ev', 'x', 'https://a.hn/x', 'revisado-por-pares-inventado');
    raise exception 'FALLA: entró un nivel de evidencia que no existe';
  exception when check_violation then null;
  end;
end $$;
\echo 'ok 2 · un nivel de evidencia inventado rebota'

-- Y el DOI mal formado también, que es con lo que se cruza lo retractado.
do $$ begin
  begin
    insert into public.criba_items (fuente_id, clave, titulo, url, doi)
      values ('cnbs', 'mala-doi', 'x', 'https://a.hn/x', 'no-es-un-doi');
    raise exception 'FALLA: entró un DOI mal formado';
  exception when check_violation then null;
  end;
end $$;
\echo 'ok 2b · un DOI mal formado rebota'

-- ════════════════════════════════════════════════════════════════════
-- 3. NO HAY GEMELOS: LA CLAVE ES GLOBAL, NO POR FUENTE
-- ════════════════════════════════════════════════════════════════════
-- El mismo trabajo llega por Dialnet y por SIECA. En una edición diaria,
-- dos copias del mismo artículo es lo que hace que se deje de abrir.
do $$ begin
  begin
    insert into public.criba_items (fuente_id, clave, titulo, url)
      values ('dialnet', 'buena-1', 'El mismo, por otra fuente', 'https://dialnet.unirioja.es/x');
    raise exception 'FALLA: entró un gemelo con la misma clave desde otra fuente';
  exception when unique_violation then null;
  end;
end $$;
\echo 'ok 3 · el mismo trabajo por dos fuentes distintas no se duplica'

-- ════════════════════════════════════════════════════════════════════
-- 4. LA EDICIÓN TIENE FONDO — LA REGLA 8
-- ════════════════════════════════════════════════════════════════════
insert into public.criba_items (fuente_id, clave, titulo, url, publicado)
select 'dialnet', 'lote-' || g, 'Trabajo número ' || g,
       'https://dialnet.unirioja.es/servlet/articulo?codigo=' || g,
       now() - (g || ' hours')::interval
  from generate_series(1, 40) g;

do $$
declare puestos integer; hay integer; sobran integer;
begin
  puestos := public.criba_arma_edicion(current_date, 10);
  select count(*) into hay from public.criba_items where edicion = current_date;
  if hay <> 10 then raise exception 'FALLA: la edición no tiene fondo: salieron % (tope 10)', hay; end if;

  -- Llamarla otra vez el mismo día NO puede añadir más.
  puestos := public.criba_arma_edicion(current_date, 10);
  select count(*) into hay from public.criba_items where edicion = current_date;
  if hay <> 10 then raise exception 'FALLA: una segunda llamada rompió el fondo: %', hay; end if;

  -- Y lo que no entró tiene que SEGUIR AHÍ. «Si sobra material, sobra
  -- para mañana» es la regla entera, no una frase bonita.
  select count(*) into sobran from public.criba_items where edicion is null;
  if sobran < 30 then raise exception 'FALLA: lo que no entró en la edición se perdió (quedan %)', sobran; end if;
end $$;
\echo 'ok 4 · la edición se llena hasta el tope, no más, y lo que sobra espera a mañana'

-- Mañana sale lo siguiente, y sin repetir lo de hoy.
do $$
declare repes integer;
begin
  perform public.criba_arma_edicion(current_date + 1, 10);
  select count(*) into repes from public.criba_items
   where edicion = current_date + 1 and orden is null;
  if repes > 0 then raise exception 'FALLA: la edición de mañana trae ítems sin orden'; end if;
  if (select count(*) from public.criba_items where edicion = current_date + 1) <> 10 then
    raise exception 'FALLA: la edición de mañana no se llenó';
  end if;
end $$;
\echo 'ok 4b · mañana sale lo siguiente, con su orden, sin repetir lo de hoy'

-- El peso manda en el orden: la regla 5 no se esconde, se aplica.
do $$
declare primera text;
begin
  -- ⚠️ Se VACÍA la tabla, no se despublica. La primera versión de esta
  -- prueba solo borraba lo que ya había salido y ponía el resto a nulo:
  -- los 40 del lote anterior seguían compitiendo y ganaba uno de ellos,
  -- así que la prueba suspendía sin que el código tuviera nada malo.
  delete from public.criba_items;
  insert into public.criba_items (fuente_id, clave, titulo, url, publicado)
    values ('bcv-hn', 'peso-flojo', 'De la fuente que pesa 40', 'https://www.bcv.hn/x', now());
  insert into public.criba_items (fuente_id, clave, titulo, url, publicado)
    values ('dialnet', 'peso-fuerte', 'De la fuente que pesa 70', 'https://dialnet.unirioja.es/y', now() - interval '2 days');
  perform public.criba_arma_edicion(current_date, 2);
  select titulo into primera from public.criba_items where edicion = current_date order by orden limit 1;
  if primera <> 'De la fuente que pesa 70' then
    raise exception 'FALLA: el peso de la fuente no manda en el orden (salió primero: %)', primera;
  end if;
end $$;
\echo 'ok 4c · pesa más una fuente buena de hace dos días que una floja de hoy'

-- ⚠️ Llamarla con `null` tiene que armar la edición de HOY igual.
-- En PostgreSQL un null explícito NO usa el valor por omisión, y el
-- recolector la llamaba así: ponía `edicion = NULL` en 25 filas, o sea
-- que la edición no se armaba y esas filas volvían a elegirse cada
-- noche. Una pantalla vacía sin ninguna explicación.
do $$
declare hoy integer; nulas integer;
begin
  delete from public.criba_items;
  insert into public.criba_items (fuente_id, clave, titulo, url, publicado)
  select 'cnbs', 'nul-' || g, 'T' || g, 'https://a.hn/n' || g, now() - (g || ' hours')::interval
    from generate_series(1, 8) g;

  perform public.criba_arma_edicion(null, 5);

  select count(*) into hoy   from public.criba_items where edicion = current_date;
  select count(*) into nulas from public.criba_items where edicion is null and orden is not null;
  if hoy <> 5 then
    raise exception 'FALLA: con dia=null la edición de hoy tiene % filas, tenía que tener 5', hoy;
  end if;
  if nulas > 0 then
    raise exception 'FALLA: % filas quedaron con orden pero sin edición (el fallo del null)', nulas;
  end if;
end $$;
\echo 'ok 4d · ⚠️ llamarla con null arma la edición de HOY, no una edición nula'

-- ════════════════════════════════════════════════════════════════════
-- 5. LA HIGIENE NO SE LLEVA LO QUE IMPORTA
-- ════════════════════════════════════════════════════════════════════
do $$
declare barridos integer; quedan integer;
begin
  delete from public.criba_items;
  insert into public.criba_items (fuente_id, clave, titulo, url, recogido_at, edicion, leido_at, guardado, retractado_at) values
    ('cnbs', 'viejo-nada',      'Viejo y sin tocar',  'https://a.hn/1', now() - interval '200 days', null, null,  false, null),
    ('cnbs', 'viejo-leido',     'Viejo pero leído',   'https://a.hn/2', now() - interval '200 days', null, now(), false, null),
    ('cnbs', 'viejo-guardado',  'Viejo pero guardado','https://a.hn/3', now() - interval '200 days', null, null,  true,  null),
    ('cnbs', 'viejo-retractado','Viejo y retractado', 'https://a.hn/4', now() - interval '200 days', null, null,  false, now()),
    ('cnbs', 'viejo-publicado', 'Viejo pero salió',   'https://a.hn/5', now() - interval '200 days', current_date - 100, null, false, null),
    ('cnbs', 'nuevo',           'De ayer',            'https://a.hn/6', now() - interval '1 day',   null, null,  false, null);

  barridos := public.criba_higiene();
  if barridos <> 1 then raise exception 'FALLA: la higiene barrió % filas, tenía que barrer 1', barridos; end if;

  select count(*) into quedan from public.criba_items;
  if quedan <> 5 then raise exception 'FALLA: quedan % filas, tenían que quedar 5', quedan; end if;

  if exists (select 1 from public.criba_items where clave = 'viejo-nada') then
    raise exception 'FALLA: no barrió lo que sí sobraba';
  end if;
end $$;
\echo 'ok 5 · barre lo viejo que nunca salió, y NO toca lo leído, lo guardado, lo retractado ni lo publicado'

-- ════════════════════════════════════════════════════════════════════
-- 6. LA PUERTA: anon fuera, la casa solo mira y marca
-- ════════════════════════════════════════════════════════════════════
do $$
declare g text;
begin
  -- anon no puede NADA en ninguna de las dos tablas.
  for g in select unnest(array['select','insert','update','delete']) loop
    if has_table_privilege('anon', 'public.criba_items', g)
    or has_table_privilege('anon', 'public.criba_fuentes', g) then
      raise exception 'FALLA: anon tiene permiso de % ', g;
    end if;
  end loop;

  -- La casa mira y marca; no inserta ni borra.
  if not has_table_privilege('authenticated', 'public.criba_items', 'select') then
    raise exception 'FALLA: la casa no puede leer';
  end if;
  if not has_table_privilege('authenticated', 'public.criba_items', 'update') then
    raise exception 'FALLA: la casa no puede marcar leído';
  end if;
  if has_table_privilege('authenticated', 'public.criba_items', 'insert')
  or has_table_privilege('authenticated', 'public.criba_items', 'delete') then
    raise exception 'FALLA: la casa puede insertar o borrar, y no debe: escribe solo el recolector';
  end if;
  if has_table_privilege('authenticated', 'public.criba_fuentes', 'update') then
    raise exception 'FALLA: la casa puede tocar el registro de fuentes';
  end if;
end $$;
\echo 'ok 6 · anon no puede nada; la casa lee y marca, pero no inserta ni borra'

-- Y la seguridad por fila encendida en las dos.
do $$ begin
  if not (select bool_and(relrowsecurity) from pg_class
           where oid in (to_regclass('public.criba_items'), to_regclass('public.criba_fuentes'))) then
    raise exception 'FALLA: falta la seguridad por fila';
  end if;
end $$;
\echo 'ok 6b · seguridad por fila encendida en las dos tablas'

-- ════════════════════════════════════════════════════════════════════
-- 7. LA COMPROBACIÓN DEL FINAL DEL ARCHIVO DICE LA VERDAD
-- ════════════════════════════════════════════════════════════════════
do $$
declare r record;
begin
  select
    (select count(*) from public.criba_fuentes) as fuentes,
    (select count(*) from information_schema.columns
      where table_schema='public' and table_name='criba_items') as cols,
    (select count(*) from pg_policies
      where schemaname='public' and tablename in ('criba_items','criba_fuentes')) as pols
  into r;
  if r.fuentes <> 4 then raise exception 'FALLA: hay % fuentes, la comprobación dice 4', r.fuentes; end if;
  if r.cols <> 17 then raise exception 'FALLA: criba_items tiene % columnas, la comprobación dice 17', r.cols; end if;
  if r.pols <> 3 then raise exception 'FALLA: hay % políticas, la comprobación dice 3', r.pols; end if;
end $$;
\echo 'ok 7 · los números que promete la fila final del archivo son los de verdad'


-- ════════════════════════════════════════════════════════════════════
-- 8. LA MALLA · supabase/sql/criba_temas.sql
-- ════════════════════════════════════════════════════════════════════
\echo '── Corriendo supabase/sql/criba_temas.sql ──'
\i supabase/sql/criba_temas.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/criba_temas.sql

-- ⚠️ SIN TEMA NO ENTRA. Es la regla que faltaba y por la que la primera
-- edición salió llena de veterinaria: nadie preguntó por ningún interés
-- y todo lo que llegaba se repartía igual.
do $$
declare hoy integer;
begin
  delete from public.criba_items;
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado)
  select 'cnbs', 'huerfano-' || g, 'Sin tema ' || g, 'https://a.hn/h' || g, null,
         now() - (g || ' hours')::interval
    from generate_series(1, 30) g;

  perform public.criba_arma_edicion(current_date, 25);
  select count(*) into hoy from public.criba_items where edicion = current_date;
  if hoy <> 0 then
    raise exception 'FALLA: entraron % items SIN TEMA en la edición', hoy;
  end if;
end $$;
\echo 'ok 8 · ⚠️ lo que no casó con ningún tema NO entra en la edición'

-- ⚠️ Y NINGUNA FUENTE SE COME EL NÚMERO. Dialnet puso 60 de 90 y dejó
-- la edición en veterinaria: el tope por fuente es lo que lo impide.
do $$
declare de_una integer; total integer;
begin
  delete from public.criba_items;
  -- Una fuente glotona con cuarenta artículos, todos con tema.
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado)
  select 'cnbs', 'glotona-' || g, 'De la glotona ' || g, 'https://a.hn/g' || g, 'sesgo',
         now() - (g || ' minutes')::interval
    from generate_series(1, 40) g;
  -- Y otra con pocos.
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado)
  select 'sieca', 'modesta-' || g, 'De la modesta ' || g, 'https://a.hn/m' || g, 'sesgo',
         now() - (g || ' minutes')::interval
    from generate_series(1, 5) g;

  perform public.criba_arma_edicion(current_date, 25);
  select count(*) into de_una from public.criba_items
   where edicion = current_date and fuente_id = 'cnbs';
  select count(*) into total from public.criba_items where edicion = current_date;

  if de_una > 8 then
    raise exception 'FALLA: una sola fuente puso % de la edición (tope 8)', de_una;
  end if;
  if total < 13 then
    raise exception 'FALLA: con el tope, la edición se quedó en % (había de sobra)', total;
  end if;
end $$;
\echo 'ok 9 · ⚠️ ninguna fuente aporta más de 8: no se puede comer el número'

-- Y el peso del TEMA manda, no el de la fuente.
do $$
declare primera text;
begin
  delete from public.criba_items;
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado) values
    ('cnbs',  'tema-flojo',  'De un tema que pesa 50', 'https://a.hn/f', 'marxismo',     now()),
    ('cnbs',  'tema-fuerte', 'De un tema que pesa 85', 'https://a.hn/u', 'replicacion',  now() - interval '2 days');
  perform public.criba_arma_edicion(current_date, 2);
  select titulo into primera from public.criba_items where edicion = current_date order by orden limit 1;
  if primera <> 'De un tema que pesa 85' then
    raise exception 'FALLA: manda el peso de la fuente y no el del TEMA (salió: %)', primera;
  end if;
end $$;
\echo 'ok 10 · manda el peso del TEMA, no el de la fuente'

-- Dialnet apagada, y la fila conservada para saber por qué.
do $$
declare a boolean;
begin
  select activa into a from public.criba_fuentes where id = 'dialnet';
  if a is null then raise exception 'FALLA: se BORRÓ la fila de Dialnet en vez de apagarla'; end if;
  if a then raise exception 'FALLA: Dialnet sigue activa, y su OAI no admite consulta'; end if;
end $$;
\echo 'ok 11 · Dialnet queda apagada, no borrada: el rastro de por qué se queda'


-- ════════════════════════════════════════════════════════════════════
-- 9. LO AFINADO · supabase/sql/criba_afina.sql
-- ════════════════════════════════════════════════════════════════════
\echo '── Corriendo supabase/sql/criba_afina.sql ──'
\i supabase/sql/criba_afina.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/criba_afina.sql

-- ⚠️ UN TÍTULO, UNA VEZ. El mismo trabajo llega con el DOI del preprint
-- y con el del publicado, y la llave por DOI no los junta: en la primera
-- edición con malla salieron dos títulos repetidos.
do $$
declare cuantos integer;
begin
  delete from public.criba_items;
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, doi, publicado) values
    ('openalex', 'doi:10.1000/pre', 'Human vs machine judgment in logistics',
     'https://a.test/1', 'decisiones', '10.1000/pre', now()),
    ('openalex', 'doi:10.2000/pub', 'Human vs Machine Judgment in Logistics!',
     'https://a.test/2', 'decisiones', '10.2000/pub', now()),
    ('openalex', 'doi:10.3000/otro', 'Otro trabajo distinto',
     'https://a.test/3', 'decisiones', '10.3000/otro', now());

  perform public.criba_arma_edicion(current_date, 25);
  select count(*) into cuantos from public.criba_items where edicion = current_date;
  if cuantos <> 2 then
    raise exception 'FALLA: entraron % (el mismo título con dos DOI cuenta como uno: han de ser 2)', cuantos;
  end if;
end $$;
\echo 'ok 12 · ⚠️ el mismo título con dos DOI distintos entra UNA vez'

-- ⚠️ LAS FUENTES DE VOLCADO ENTRAN AUNQUE NO TENGAN TEMA. A la CNBS no
-- se le pregunta nada -es un canal pequeño y ya temático-, así que sus
-- filas llegan sin tema. Con «sin tema no entra» a secas, el registro de
-- la CNBS no podía aparecer nunca.
do $$
declare de_volcado integer;
begin
  delete from public.criba_items;
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado)
  values ('cnbs', 'aviso-cnbs-1', 'Advertencia sobre entidades no autorizadas',
          'https://www.cnbs.gob.hn/aviso', null, now());
  -- Y una de fuente de CONSULTA sin tema, que esa SÍ tiene que quedarse fuera.
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado)
  values ('openalex', 'huerfano-consulta', 'Sin tema y de fuente que se pregunta',
          'https://a.test/x', null, now());

  perform public.criba_arma_edicion(current_date, 25);
  select count(*) into de_volcado from public.criba_items
   where edicion = current_date and fuente_id = 'cnbs';
  if de_volcado <> 1 then
    raise exception 'FALLA: la CNBS no entró en la edición (es de volcado, es su propio tema)';
  end if;
  if exists (select 1 from public.criba_items
              where edicion = current_date and fuente_id = 'openalex') then
    raise exception 'FALLA: entró una fila SIN TEMA de una fuente a la que sí se le pregunta';
  end if;
end $$;
\echo 'ok 13 · ⚠️ la CNBS entra sin tema (es de volcado); OpenAlex sin tema NO'


-- ════════════════════════════════════════════════════════════════════
-- 10. UN TEMA NO SE COME LA EDICIÓN · criba_afina2.sql
-- ════════════════════════════════════════════════════════════════════
\echo '── Corriendo supabase/sql/criba_afina2.sql ──'
\i supabase/sql/criba_afina2.sql

-- ⚠️ «Psicología de masas» puso 8 de 25 con el tope solo por fuente:
-- salieron todos de la misma fuente Y del mismo término, así que aquel
-- tope no los paró. Un término desafortunado convertía la edición en un
-- monográfico sobre peatones.
do $$
declare mayor integer; materias integer;
begin
  delete from public.criba_items;
  -- Un tema glotón con veinte, repartidos entre las tres fuentes de
  -- consulta para que el tope por FUENTE no sea el que lo pare.
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado)
  select (array['openalex','semanticscholar','europepmc'])[1 + (g % 3)],
         'gloton-' || g, 'Del tema gloton ' || g, 'https://a.test/g' || g, 'masas',
         now() - (g || ' minutes')::interval
    from generate_series(1, 20) g;
  -- Y otros tres temas con material de sobra.
  insert into public.criba_items (fuente_id, clave, titulo, url, tema_id, publicado)
  select 'openalex', t || '-' || g, 'De ' || t || ' ' || g, 'https://a.test/' || t || g, t,
         now() - (g || ' minutes')::interval
    from generate_series(1, 6) g, unnest(array['sesgo','decisiones','ecopolitica']) t;

  perform public.criba_arma_edicion(current_date, 25);

  select coalesce(max(n), 0) into mayor from (
    select count(*) as n from public.criba_items
     where edicion = current_date and tema_id is not null group by tema_id) x;
  select count(distinct tema_id) into materias from public.criba_items
   where edicion = current_date and tema_id is not null;

  if mayor > 4 then
    raise exception 'FALLA: un tema puso % en la edición (tope 4)', mayor;
  end if;
  if materias < 4 then
    raise exception 'FALLA: la edición solo trae % materias distintas', materias;
  end if;
end $$;
\echo 'ok 14 · ⚠️ ningún TEMA pasa de 4: un término desafortunado ya no se come el número'

\echo ''
\echo '════════════════════════════════════════════════'
\echo 'RESULTADO: APRUEBA'
\echo '════════════════════════════════════════════════'
