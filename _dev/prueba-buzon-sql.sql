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
-- Cómo correrla, con un PostgreSQL cualquiera a mano:
--
--   createdb buzontest
--   psql -d buzontest -f _dev/prueba-buzon-sql.sql
--
-- Termina con «RESULTADO: APRUEBA» o revienta en el primer fallo.
-- ════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

-- ── Lo que el buzón da por hecho que ya existe en la base de la revista ──
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
end $$;
grant usage on schema public to anon, authenticated;

create table if not exists public.redaccion_ediciones (
  id bigint generated always as identity primary key,
  creado_at timestamptz not null default now(),
  numero int not null, titulo text not null,
  fecha_cierre date, archivada boolean not null default false
);
alter table public.redaccion_ediciones enable row level security;

-- La de verdad mira si quien entró está en familia_miembros. Aquí se
-- enciende y se apaga a mano para probar los dos lados de la puerta.
create or replace function public.es_familia() returns boolean
  language sql stable as $$ select false $$;

truncate public.redaccion_ediciones;
insert into public.redaccion_ediciones (numero, titulo, fecha_cierre, archivada)
values (3, 'Nº 03', '2026-08-15', false), (2, 'Nº 02', '2026-07-31', true);

\echo '── Corriendo supabase/sql/buzon_lector.sql ──'
\i supabase/sql/buzon_lector.sql
\echo '── Y otra vez, que tiene que ser idempotente ──'
\i supabase/sql/buzon_lector.sql
\echo '── Y la corrección del lector ──'
\i supabase/sql/buzon_editar.sql
\i supabase/sql/buzon_editar.sql

truncate public.buzon_mensajes cascade;

-- En Supabase el rol anon SÍ tiene permisos de tabla sobre el esquema
-- public: se los da el proyecto al crearse. Hay que reproducirlo o la
-- prueba de abajo pasa por el motivo equivocado (por falta de permisos
-- de tabla) y no prueba lo que dice probar.
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
