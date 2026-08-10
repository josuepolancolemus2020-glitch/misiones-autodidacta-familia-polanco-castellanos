-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada.
--
-- VA UN SOLO ARCHIVO, este. No depende de ningún otro salvo de
-- `seguridad_familia_1_puerta.sql`, que es quien crea es_familia() y ya
-- está corrido desde la mudanza a privado.
-- ════════════════════════════════════════════════════════════════════
-- LAS SUGERENCIAS DE LAS MISIONES DE M.E.T.A.S
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   Dentro de cada misión de M.E.T.A.S hay un botón «💬 Sugerencias».
--   Lo toca el alumno o el maestro cuando encuentra un error en el
--   contenido, algo que no funciona, o se le ocurre una idea.
--
--   Hasta hoy ese mensaje NO LLEGABA A NADIE. Se guardaba en el
--   almacén del propio teléfono y se quedaba ahí: para leerlo había
--   que abrir la Evidencia de misiones EN ESE MISMO APARATO. O sea,
--   el aparato del niño que escribió. Un botón que promete «tu mensaje
--   ayuda a mejorar M.E.T.A.S» y tira lo escrito a un cajón cerrado es
--   peor que no tener botón, porque quien lo usó cree que avisó.
--
--   Esta tabla es el otro extremo del cable. Los mensajes caen aquí y
--   se leen desde F.A.R.O, en su herramienta de acceso rápido.
--
-- POR QUÉ AQUÍ Y NO EN EL PROYECTO DE M.E.T.A.S: porque quien tiene
--   que leerlos es el administrador del proyecto, y el administrador
--   trabaja en F.A.R.O. Es el mismo camino que ya hace el Buzón del
--   lector (`buzon_lector.sql`): la pantalla pública vive en M.E.T.A.S,
--   que es lo que la gente puede abrir, y lo recogido cae en la
--   aplicación privada, que es donde se atiende. La clave publicable de
--   este proyecto ya viaja en M.E.T.A.S por esa misma razón.
--
-- QUÉ CREA:
--   1) Tabla metas_sugerencias — el mensaje, de qué misión salió, quién
--      lo escribió (si se identificó) y en qué estado va.
--   2) RPC faro_metas_sugerencia_enviar(...) — la ÚNICA puerta abierta,
--      y solo escribe.
--   3) Higiene: lo descartado hace más de 180 días se borra solo.
--
-- LO QUE NO SALE NUNCA POR LA PUERTA PÚBLICA: nada de lo que hay
--   dentro. La función devuelve «entró» o «no entró» y ni una palabra
--   más. Con la clave publicable no se puede leer una sugerencia, ni
--   contarlas, ni saber si existen. La familia las lee con su sesión,
--   por RLS, como el resto de la aplicación.
-- ════════════════════════════════════════════════════════════════════

-- ── El mensaje ──────────────────────────────────────────────────────
create table if not exists public.metas_sugerencias (
  id            bigint generated always as identity primary key,

  -- La llave contra el duplicado, y es la del propio aparato: cada
  -- registro de M.E.T.A.S nace con su id («E-4f9a2b1c») y el puente lo
  -- manda tal cual. Hace falta porque el envío se reintenta: si el
  -- internet se corta a mitad, el teléfono no sabe si entró o no y lo
  -- vuelve a mandar. Con esto, el segundo intento CORRIGE el primero
  -- en vez de dejar dos mensajes gemelos en la bandeja.
  evento_id     text not null unique,

  creado_at     timestamptz not null default now(),

  -- Cuándo lo escribió el alumno, según SU aparato. No es lo mismo que
  -- creado_at: un mensaje escrito sin señal el lunes puede llegar el
  -- jueves. Se guarda porque el que atiende necesita saberlo, pero la
  -- bandeja NO se ordena por aquí: el reloj de un teléfono prestado
  -- puede estar en 2035, y esa sugerencia se quedaría clavada arriba
  -- de la lista para siempre. Se ordena por creado_at, que es el reloj
  -- del servidor.
  escrito_at    timestamptz,

  -- error_contenido | error_tecnico | idea | felicitacion
  -- Son las cuatro del selector de la misión. Si se añade una quinta
  -- allá, hay que añadirla AQUÍ TAMBIÉN y volver a correr este archivo:
  -- la lista vive dentro de la función y lo que no está en ella se
  -- guarda como «idea». Es la misma trampa que ya costó una tarde con
  -- la sexta clase del Buzón del lector.
  categoria     text not null default 'idea',
  texto         text not null default '',

  -- De dónde salió. `url` es el camino de la página («/misiones/…»), y
  -- es lo que de verdad sirve: las misiones no se llaman index.html,
  -- cada una tiene su propio nombre de archivo, así que con la carpeta
  -- sola no se puede armar el enlace para ir a mirar el error.
  mision        text not null default '',
  mision_titulo text not null default '',
  seccion       text not null default '',
  url           text not null default '',

  -- Quién, si se identificó. TODO ESTO PUEDE VENIR VACÍO y está bien:
  -- la pantalla de la misión no le pide credenciales a un niño para
  -- avisar de una errata. Un mensaje anónimo que dice «la pregunta 3
  -- tiene la respuesta mala» vale exactamente igual.
  alumno        text not null default '',
  grado         text not null default '',
  escuela       text not null default '',
  docente       text not null default '',
  codigo_aula   text not null default '',
  dispositivo   text not null default '',

  -- La vida del mensaje dentro de F.A.R.O
  estado        text not null default 'nuevo',   -- nuevo | leido | atendido | descartado
  respuesta     text not null default '',        -- qué se hizo con él
  visto_por     text not null default '',
  visto_at      timestamptz,

  freno_dia     text not null default ''         -- ver el freno, más abajo
);
alter table public.metas_sugerencias enable row level security;

-- La bandeja se abre para atender: lo sin resolver primero y lo más
-- reciente arriba. Este índice es el que sostiene ese orden.
create index if not exists metas_sugerencias_estado_idx
  on public.metas_sugerencias (estado, creado_at desc);

-- El freno cuenta por aparato y día, y se pregunta en cada envío.
create index if not exists metas_sugerencias_freno_idx
  on public.metas_sugerencias (freno_dia);

-- ── Quién lee esto ──────────────────────────────────────────────────
-- La familia y nadie más, con su sesión iniciada. es_familia() vive en
-- seguridad_familia_1_puerta.sql y es la misma que guarda el resto.
do $$
begin
  if not exists (select 1 from pg_policies
                  where schemaname = 'public' and tablename = 'metas_sugerencias'
                    and policyname = 'metas_sugerencias_familia') then
    create policy metas_sugerencias_familia on public.metas_sugerencias
      for all to authenticated
      using (public.es_familia()) with check (public.es_familia());
  end if;
end
$$;

-- ── Llega una sugerencia ────────────────────────────────────────────
-- Devuelve un objeto, no un booleano, y es a propósito: el teléfono
-- guarda lo que no pudo mandar y lo reintenta al abrir la siguiente
-- misión. Para eso necesita distinguir dos «no» que no se parecen en
-- nada:
--
--   · «no, y nunca va a entrar» (texto vacío o de tres letras) → el
--     teléfono lo tira de la cola, porque reintentarlo es dar vueltas
--     para siempre;
--   · «no, hoy no» (el freno del día) → el teléfono lo guarda y lo
--     vuelve a intentar mañana.
--
-- Un booleano los junta, y con un booleano la cola o se atasca o pierde
-- mensajes buenos.
--
-- Nunca revienta: una excepción aquí deja al teléfono sin saber qué
-- hacer con lo que tiene guardado.
create or replace function public.faro_metas_sugerencia_enviar(
  p_evento_id text, p_categoria text, p_texto text,
  p_mision text, p_mision_titulo text, p_seccion text, p_url text,
  p_alumno text, p_grado text, p_escuela text, p_docente text,
  p_codigo_aula text, p_dispositivo text, p_escrito_at timestamptz
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  ev   text := left(trim(coalesce(p_evento_id, '')), 40);
  cat  text := lower(trim(coalesce(p_categoria, 'idea')));
  txt  text := left(trim(coalesce(p_texto, '')), 500);
  disp text := left(trim(coalesce(p_dispositivo, '')), 40);
  dia  text;
  estado_actual text;
begin
  -- 1. Lo mínimo para que esto sea un mensaje y no un dedo resbalado.
  --    El tope de 500 es el mismo que tiene el cuadro de escribir de la
  --    misión; aquí se recorta otra vez porque esa pantalla la escribe
  --    cualquiera y el servidor no.
  if ev = '' then
    return jsonb_build_object('ok', false, 'motivo', 'sin_id');
  end if;
  if length(txt) < 5 then
    return jsonb_build_object('ok', false, 'motivo', 'corto');
  end if;
  if cat not in ('error_contenido', 'error_tecnico', 'idea', 'felicitacion') then
    cat := 'idea';
  end if;

  -- 2. El freno. El botón está dentro de una misión abierta a cualquier
  --    aula del país: tarde o temprano un chico se aburre y descubre
  --    que puede mandar cien. Doce por aparato y día es de sobra para
  --    quien está avisando de erratas de verdad —tres o cuatro en una
  --    tarde es mucho— y corta en seco al que no.
  --
  --    Se cuenta por aparato, no por nombre: el nombre lo escribe él
  --    mismo y se cambia en dos segundos. El identificador del aparato
  --    también se puede borrar, y entonces el freno se salta; es un
  --    tope de velocidad, no una cerradura. La cerradura de verdad es
  --    que aquí NO SE PUBLICA NADA: lo que entre lo lee un administrador
  --    y se descarta de un toque.
  dia := coalesce(nullif(disp, ''), 'sin-aparato') || '|' ||
         to_char(now() at time zone 'UTC', 'YYYY-MM-DD');
  if (select count(*) from public.metas_sugerencias
       where freno_dia = dia and evento_id <> ev) >= 12 then
    return jsonb_build_object('ok', false, 'motivo', 'freno');
  end if;

  -- 3. Higiene: lo descartado hace medio año ya no le sirve a nadie.
  delete from public.metas_sugerencias
   where estado = 'descartado' and creado_at < now() - interval '180 days';

  -- 4. El mensaje. Si ya estaba (mismo evento_id), es un reintento y
  --    CORRIGE. Pero solo mientras nadie lo haya tocado: en cuanto un
  --    administrador lo marca atendido, ya lo leyó y ya arregló lo que
  --    decía. Si el texto pudiera cambiar por debajo después de eso, la
  --    respuesta apuntada dejaría de corresponder al mensaje. Es la
  --    misma regla del Buzón del lector, y de paso le quita la gracia a
  --    quien quisiera pisar sugerencias ajenas adivinando identificadores.
  select estado into estado_actual
    from public.metas_sugerencias where evento_id = ev;
  if estado_actual in ('atendido', 'descartado') then
    return jsonb_build_object('ok', true, 'nuevo', false, 'cerrado', true);
  end if;

  insert into public.metas_sugerencias (
    evento_id, escrito_at, categoria, texto,
    mision, mision_titulo, seccion, url,
    alumno, grado, escuela, docente, codigo_aula, dispositivo, freno_dia
  ) values (
    ev, p_escrito_at, cat, txt,
    left(trim(coalesce(p_mision, '')), 120),
    left(trim(coalesce(p_mision_titulo, '')), 140),
    left(trim(coalesce(p_seccion, '')), 40),
    left(trim(coalesce(p_url, '')), 300),
    left(trim(coalesce(p_alumno, '')), 60),
    left(trim(coalesce(p_grado, '')), 30),
    left(trim(coalesce(p_escuela, '')), 80),
    left(trim(coalesce(p_docente, '')), 60),
    left(trim(coalesce(p_codigo_aula, '')), 8),
    disp, dia
  )
  on conflict (evento_id) do update set
    categoria = excluded.categoria,
    texto = excluded.texto,
    mision = excluded.mision,
    mision_titulo = excluded.mision_titulo,
    seccion = excluded.seccion,
    url = excluded.url,
    alumno = excluded.alumno,
    grado = excluded.grado,
    escuela = excluded.escuela,
    docente = excluded.docente,
    codigo_aula = excluded.codigo_aula;

  return jsonb_build_object('ok', true, 'nuevo', estado_actual is null);
exception when others then
  -- Un dato raro no puede dejar al teléfono sin respuesta: se le dice
  -- que no entró y él lo guarda para reintentarlo.
  return jsonb_build_object('ok', false, 'motivo', 'error');
end
$$;

revoke all on function public.faro_metas_sugerencia_enviar(
  text, text, text, text, text, text, text,
  text, text, text, text, text, text, timestamptz) from public;
grant execute on function public.faro_metas_sugerencia_enviar(
  text, text, text, text, text, text, text,
  text, text, text, text, text, text, timestamptz) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA QUE QUEDÓ PUESTO
--
-- Sin fiarse del «Success» del editor. Pegar esto DESPUÉS, en el mismo
-- SQL Editor, y mirar lo que contesta cada línea:
--
--   -- 1. Entra una sugerencia normal → {"ok": true, "nuevo": true}
--   select public.faro_metas_sugerencia_enviar(
--     'E-prueba01','error_contenido',
--     'En la pregunta 3 de la evaluacion la respuesta buena esta marcada mal.',
--     '2y3ciclo-adjetivos','Los Adjetivos','eval',
--     '/misiones/2y3ciclo-adjetivos/adjetivos-II-IIICiclo.html',
--     'Ana Lopez','6º-1','Escuela Lempira','Prof. Josue','K2M9P','D-AB12CD', now());
--
--   -- 2. El mismo otra vez (un reintento) → {"ok": true, "nuevo": false}
--   select public.faro_metas_sugerencia_enviar(
--     'E-prueba01','error_contenido',
--     'En la pregunta 3 de la evaluacion la respuesta buena esta marcada mal.',
--     '2y3ciclo-adjetivos','Los Adjetivos','eval',
--     '/misiones/2y3ciclo-adjetivos/adjetivos-II-IIICiclo.html',
--     'Ana Lopez','6º-1','Escuela Lempira','Prof. Josue','K2M9P','D-AB12CD', now());
--
--   -- 3. Y sigue habiendo UNA sola fila, no dos → 1
--   select count(*) from public.metas_sugerencias where evento_id = 'E-prueba01';
--
--   -- 4. Un texto de tres letras no entra → {"ok": false, "motivo": "corto"}
--   select public.faro_metas_sugerencia_enviar(
--     'E-prueba02','idea','aaa','','','','','','','','','','D-AB12CD', now());
--
--   -- 5. Y desde la calle no se lee NADA. Tiene que devolver CERO
--   --    filas, aunque el paso 1 acaba de meter una:
--   set role anon;
--   select count(*) from public.metas_sugerencias;   -- 0
--   reset role;
--
--   -- 6. Limpiar la prueba
--   delete from public.metas_sugerencias where evento_id like 'E-prueba%';
--
-- El paso 5 es el que de verdad importa, y hay que leerlo bien: no da
-- «permission denied» sino cero filas, porque Supabase le concede a
-- anon el permiso de tabla y quien lo para es la seguridad por fila, que
-- no tiene ninguna regla para él. Cero filas con una fila recién metida
-- ES la prueba. Si ese número sale 1, la tabla está abierta a cualquiera
-- que tenga la clave publicable —o sea, a cualquiera que abra el buzón
-- de M.E.T.A.S y mire el código— y eso ya no se arregla después.
-- ════════════════════════════════════════════════════════════════════
