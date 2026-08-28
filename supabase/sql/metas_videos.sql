-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada.
--
-- ⚠️ SI YA SE CORRIÓ ANTES DEL 28 DE AGOSTO DE 2026 POR LA TARDE, HAY
--    QUE VOLVER A CORRERLO. El archivo creció con la columna
--    `preguntas` (el quiz del propio video) y con la puerta pública
--    devolviéndola. La columna se añade con `add column if not exists`,
--    así que correrlo otra vez NO BORRA NI UN VIDEO.
--
--    Y hay una línea que no se puede saltar: el `drop function` de más
--    abajo. PostgreSQL NO deja cambiarle a una función el tipo que
--    devuelve con `create or replace` —contesta «cannot change return
--    type of existing function»—, y la puerta pública ahora devuelve
--    una columna más. Sin ese drop, el pegado entero se deshace y
--    parece que el archivo no hizo nada.
--
-- VA UN SOLO ARCHIVO, este. Depende de `seguridad_familia_1_puerta.sql`,
-- que es quien crea es_familia() y ya está corrido desde la mudanza a
-- privado. Si no lo estuviera, la primera instrucción de aquí lo dice
-- con todas las letras y para; ver la nota del final sobre por qué eso
-- son ocho líneas que ahorran una tarde.
-- ════════════════════════════════════════════════════════════════════
-- LOS VIDEOS DE LAS MISIONES DE M.E.T.A.S
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   El alumno que no entendió el texto de una misión quiere que se lo
--   expliquen. En un aula sin proyector y con tres teléfonos, decirle
--   «búscalo en YouTube» es mandarlo a una pantalla donde lo que sale
--   después no lo eligió nadie.
--
--   Con esta tabla, los videos de cada misión los pone el
--   ADMINISTRADOR desde F.A.R.O, y el alumno los ve DENTRO de la misión.
--
-- EL SENTIDO DEL CABLE, QUE ES LO QUE LO HACE SEGURO:
--   Es el ESPEJO de `metas_sugerencias.sql`. Allí M.E.T.A.S escribe y
--   F.A.R.O lee; aquí F.A.R.O escribe y M.E.T.A.S lee.
--
--     · escribir → solo con sesión de la familia, por seguridad por
--       fila. Es la misma puerta que guarda la Bóveda.
--     · leer     → una sola función, `metas_videos_publicos(mision)`,
--       que devuelve los videos YA PUBLICADOS de UNA misión y nada más.
--
--   Por eso el alumno no puede meter videos en su misión: no hay una
--   puerta de escritura abierta que cerrar, porque no existe. Con la
--   clave publicable que va en el código de M.E.T.A.S no se puede
--   añadir un video, ni corregirlo, ni borrarlo, ni ver los que están
--   sin publicar. Una comprobación en el navegador se saltaría con la
--   consola en diez segundos; esto no.
--
-- QUÉ CREA:
--   1) Tabla metas_videos — el video, de qué misión es, en qué orden va
--      y en qué estado está.
--   2) RPC metas_videos_publicos(text) — la ÚNICA puerta abierta, y
--      solo lee lo publicado.
--   3) Un disparador que mantiene `actualizado_at`.
-- ════════════════════════════════════════════════════════════════════

-- ── Antes de nada: ¿está lo de lo que esto depende? ─────────────────
-- Ocho líneas que ahorran una tarde, y la fecha está apuntada: el 27 de
-- agosto de 2026 se perdió una entera porque el SQL Editor corre TODO
-- el pegado dentro de UNA SOLA TRANSACCIÓN. Si falla una línea, se
-- deshace el pegado entero —el create table incluido—, y lo único que
-- se ve es el error de la línea que falló, que puede hablar de otra
-- cosa. El rastro que quedaba era «relation ... does not exist» al ir a
-- comprobar: el síntoma más lejano posible de la causa.
do $$
begin
  if to_regprocedure('public.es_familia()') is null then
    raise exception
      'FALTA es_familia(). Corre antes supabase/sql/seguridad_familia_1_puerta.sql y vuelve a pegar este archivo.';
  end if;
end
$$;

-- ── El video ────────────────────────────────────────────────────────
create table if not exists public.metas_videos (
  id            bigint generated always as identity primary key,

  -- La carpeta de la misión: '2y3ciclo-fracciones'. Es la misma clave
  -- que usan las Sugerencias y la misma que se escribe en el catálogo
  -- del repositorio de M.E.T.A.S. Si aquí se escribe otra, el video no
  -- aparece en ningún sitio y no hay error que lo diga.
  mision        text not null,

  -- NUESTRO identificador del video, estable y único dentro de la
  -- misión ('v-frac-01'). Es la LLAVE con la que esta fila pisa a la
  -- del catálogo del repositorio: mismo `vid` = mismo video, y manda
  -- la nube. Sin esto no habría forma de corregir desde la tableta el
  -- título de un video ya escrito en el repositorio.
  vid           text not null,

  -- ⚠️ ONCE CARACTERES. NUNCA UNA DIRECCIÓN. Esta es la línea más
  -- importante del archivo.
  --
  -- Este dato acaba dentro del `src` de un `<iframe>` en la pantalla
  -- del alumno. La normativa de la casa dice que ningún dato de estas
  -- tablas se interpola dentro de un atributo del HTML, porque una
  -- comilla cierra el atributo y lo que siga se convierte en un
  -- atributo de verdad —un `onload`, por ejemplo—.
  --
  -- Aquí no se puede evitar que el dato vaya a un atributo. Lo que se
  -- hace es quitarle al dato la capacidad de hacer daño: en el alfabeto
  -- [A-Za-z0-9_-] no hay comillas, ni espacios, ni dos puntos, ni
  -- barras. `javascript:` NO SE PUEDE ESCRIBIR. La inyección deja de
  -- ser algo contra lo que uno se defiende y pasa a ser algo que no se
  -- puede expresar.
  --
  -- Se comprueba aquí y otra vez en `vmId()` de la pantalla. Las dos
  -- hacen falta: la pantalla no puede fiarse de la base y la base no
  -- puede fiarse de la pantalla.
  yt_id         text not null check (yt_id ~ '^[A-Za-z0-9_-]{11}$'),

  titulo        text not null default '',
  -- Lo que le dice el maestro: «mira del minuto 2 al 5». Es lo único
  -- de la tarjeta escrito por alguien que conoce al alumno.
  nota          text not null default '',
  dura          text not null default '',
  canal         text not null default '',

  -- El trozo que sirve. Recortar es la defensa más barata contra los
  -- anuncios y contra los cuatro minutos de presentación del canal.
  -- 86400 es un día: por encima de eso es un dedo resbalado, y un
  -- `start` absurdo deja el video en negro sin decir por qué.
  ini           int  not null default 0 check (ini >= 0 and ini <= 86400),
  fin           int  not null default 0 check (fin >= 0 and fin <= 86400),

  orden         int  not null default 0,

  -- borrador  → escrito pero SIN publicar: no sale por la puerta
  --             pública. Es el estado en el que se queda mientras el
  --             administrador todavía no lo ha visto entero.
  -- publicado → lo ve el alumno.
  -- oculto    → LÁPIDA, y hace falta de verdad: si el video está
  --             también escrito en el catálogo del repositorio de
  --             M.E.T.A.S, borrar la fila aquí lo dejaría vivo allá y
  --             seguiría en pantalla. Con 'oculto', la puerta pública
  --             devuelve una marca de «este se fue» y la misión lo
  --             quita. Es la misma razón por la que la repisa de
  --             enlaces borra con lápida.
  estado        text not null default 'borrador'
                check (estado in ('borrador', 'publicado', 'oculto')),

  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),

  -- Quién lo puso. Rótulo para la bandeja, nunca permiso: quién puede
  -- tocar qué lo dice la seguridad por fila, no esta columna.
  puesto_por    uuid default auth.uid(),

  -- Un video por identificador y misión. Es lo que hace que volver a
  -- guardar CORRIJA en vez de dejar un gemelo: el aparato reintenta el
  -- guardado y no sabe si el primero entró.
  unique (mision, vid)
);
-- ── El quiz del propio video ────────────────────────────────────────
-- Va con `add column if not exists` y NO dentro del create table de
-- arriba: quien ya corrió este archivo tiene la tabla creada, y un
-- create table nuevo no le añadiría nada.
--
-- POR QUÉ EXISTE: al terminar un video, la primera versión mandaba al
-- alumno al Quiz de la misión. Eso es un salto raro —el Quiz pregunta
-- por el tema entero, no por lo que acaba de ver— y además se lleva al
-- niño de la sección sin comprobar nada. Con esto, al acabar salen dos
-- o tres preguntas SOBRE ESE VIDEO, escritas por quien lo eligió.
--
-- POR QUÉ jsonb Y NO UNA TABLA APARTE: las preguntas no existen sin su
-- video, no se consultan por separado y no pasan de tres. Una tabla
-- hija obligaría a un segundo viaje a la base desde el teléfono del
-- alumno, y esa es la conexión de un pueblo. La forma:
--
--   [ { "p": "¿Qué es el denominador?",
--       "ops": ["El de abajo", "El de arriba", "La raya"],
--       "ok": 0 } ]
--
-- `ok` es el ÍNDICE de la correcta, no su texto: si fuera el texto,
-- corregirle una tilde a la opción dejaría la pregunta sin respuesta
-- buena y nadie se enteraría hasta que un niño la fallara.
--
-- El check es a propósito de andar por casa —que sea una lista y no
-- pase de cinco—: la forma de dentro la hace cumplir la pantalla, que
-- es donde se puede explicar el error a quien lo está escribiendo. Lo
-- que NO puede pasar es que aquí entre algo que no sea una lista,
-- porque la pantalla del alumno recorre esto con un bucle.
alter table public.metas_videos
  add column if not exists preguntas jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint
                  where conname = 'metas_videos_preguntas_lista') then
    alter table public.metas_videos
      add constraint metas_videos_preguntas_lista
      check (jsonb_typeof(preguntas) = 'array' and jsonb_array_length(preguntas) <= 5);
  end if;
end
$$;

alter table public.metas_videos enable row level security;

-- Lo que la puerta pública pregunta en cada visita de un alumno: los de
-- una misión, en su orden. Este índice es el que lo sostiene.
create index if not exists metas_videos_mision_idx
  on public.metas_videos (mision, estado, orden);

-- ── actualizado_at, que no se escribe a mano ────────────────────────
-- Si dependiera de que la pantalla lo mande, el día que se corrija una
-- fila desde el SQL Editor la fecha se quedaría vieja y nadie lo notaría.
create or replace function public.metas_videos_touch()
returns trigger language plpgsql as $$
begin
  new.actualizado_at := now();
  return new;
end
$$;

drop trigger if exists metas_videos_touch_tr on public.metas_videos;
create trigger metas_videos_touch_tr
  before update on public.metas_videos
  for each row execute function public.metas_videos_touch();

-- ── Quién puede tocar esto ──────────────────────────────────────────
-- La familia y nadie más, con su sesión iniciada. es_familia() vive en
-- seguridad_familia_1_puerta.sql y es la misma que guarda el resto de
-- la aplicación.
--
-- Nótese que NO hay política para `anon`. Es a propósito y es el punto
-- entero: un alumno con la clave publicable no puede ni leer esta tabla
-- directamente. Lo único que puede llamar es la función de abajo.
do $$
begin
  if not exists (select 1 from pg_policies
                  where schemaname = 'public' and tablename = 'metas_videos'
                    and policyname = 'metas_videos_familia') then
    create policy metas_videos_familia on public.metas_videos
      for all to authenticated
      using (public.es_familia()) with check (public.es_familia());
  end if;
end
$$;

-- ── LA ÚNICA PUERTA ABIERTA ─────────────────────────────────────────
-- Devuelve los videos de UNA misión, y solo los que están publicados.
--
-- `security definer` es lo que le deja saltarse la seguridad por fila
-- de arriba —que es justo lo que se quiere: leer, y solo esto—.
-- `set search_path = public` va con ello y no es opcional: sin fijarlo,
-- quien llame a la función podría poner delante un esquema suyo con una
-- tabla llamada `metas_videos` y la función leería la de él.
--
-- Lo oculto sale como una MARCA y sin datos: le dice a la misión «este
-- video se fue, quítalo de tu lista» sin contarle nada más. Ver la nota
-- de la columna `estado`.
--
-- Lo que está en 'borrador' NO SALE. Es lo que permite pegar un video,
-- mirarlo con calma y publicarlo mañana, sin que un alumno se lo
-- encuentre a medio revisar.
-- ⚠️ EL DROP NO ES OPCIONAL, y es la línea que más caro cuesta olvidar.
-- PostgreSQL no deja cambiarle a una función el tipo que devuelve con
-- `create or replace`: contesta «cannot change return type of existing
-- function». Y como el editor corre TODO el pegado en una sola
-- transacción, ese error deshace el archivo entero —la columna nueva
-- incluida— y lo único que se ve es un mensaje que habla de otra cosa.
-- Quien ya corrió la versión anterior necesita este drop.
drop function if exists public.metas_videos_publicos(text);

create or replace function public.metas_videos_publicos(p_mision text)
returns table (
  id        text,
  yt        text,
  titulo    text,
  nota      text,
  dura      text,
  canal     text,
  ini       int,
  fin       int,
  del       boolean,
  preguntas jsonb
)
language sql
security definer
stable
set search_path = public
as $$
  select
    v.vid,
    case when v.estado = 'publicado' then v.yt_id  else ''  end,
    case when v.estado = 'publicado' then v.titulo else ''  end,
    case when v.estado = 'publicado' then v.nota   else ''  end,
    case when v.estado = 'publicado' then v.dura   else ''  end,
    case when v.estado = 'publicado' then v.canal  else ''  end,
    case when v.estado = 'publicado' then v.ini    else 0   end,
    case when v.estado = 'publicado' then v.fin    else 0   end,
    (v.estado = 'oculto'),
    -- Las preguntas solo viajan con el video publicado. Una lápida no
    -- se lleva nada, ni siquiera esto.
    case when v.estado = 'publicado' then v.preguntas else '[]'::jsonb end
  from public.metas_videos v
  where v.mision = left(btrim(coalesce(p_mision, '')), 120)
    and v.estado in ('publicado', 'oculto')
  order by v.orden, v.id
$$;

revoke all on function public.metas_videos_publicos(text) from public;
grant execute on function public.metas_videos_publicos(text) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- ¿QUEDÓ PUESTO?
--
-- Esta consulta va LA ÚLTIMA a propósito: el SQL Editor enseña el
-- resultado de la última sentencia, así que en vez de un «Success. No
-- rows returned» —que no distingue entre «quedó» y «se pegó a medias»—
-- sale escrito qué hay.
-- ════════════════════════════════════════════════════════════════════
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'metas_videos')            as columnas,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'metas_videos')               as politicas,
  (select relrowsecurity from pg_class where oid = 'public.metas_videos'::regclass)
                                                                             as seguridad_por_fila,
  (to_regprocedure('public.metas_videos_publicos(text)') is not null)         as puerta_publica,
  (select count(*) from public.metas_videos)                                 as videos_guardados,
  'Si columnas=16, politicas=1, seguridad_por_fila=t y puerta_publica=t, quedó puesto.' as lectura;
