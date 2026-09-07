-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada y sin borrar ni un bloque.
--
-- VA UN SOLO ARCHIVO, este. Depende de `seguridad_familia_1_puerta.sql`,
-- que es quien crea es_familia() y ya está corrido desde la mudanza a
-- privado. Si no lo estuviera, la primera instrucción de aquí lo dice
-- con todas las letras y para.
--
-- Y DESPUÉS, cuando ya no se vea la fila del final, se pega
-- `supabase/sql/rodaje_comprueba.sql`, que solo mira y va en vertical.
-- ════════════════════════════════════════════════════════════════════
-- EL RODAJE 🎬 · el cuaderno de dirección de un video-ensayo
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   El autor hace video-ensayos de diez minutos para arriba. En un video
--   así, lo que se dice a cámara son cuatro o cinco minutos como mucho;
--   el resto es material de apoyo, música y rótulos. Eso, escrito en la
--   cabeza o en un cuaderno, sale mal de tres maneras concretas:
--
--     · se sale demasiado en cámara, porque nadie está midiendo;
--     · se mueve un bloque de sitio y todos los minutos escritos a mano
--       después de él pasan a ser mentira, sin que nada avise;
--     · se publica con una canción, un clip y tres imágenes sin decir de
--       dónde salieron —y ahora, además, sin decir cuáles las hizo una
--       máquina—.
--
--   Estas cuatro tablas son ese cuaderno, y las tres cosas de arriba las
--   impide la forma de los datos, no la buena memoria de nadie.
--
-- LAS TRES DECISIONES QUE EXPLICAN TODO LO DEMÁS:
--
--   1. NO SE GUARDA NUNCA EL MINUTO EN QUE EMPIEZA UN BLOQUE. Se guarda
--      cuánto DURA. El minuto de entrada se suma en la pantalla cada vez
--      que se pinta. Si el minuto estuviera guardado, meter veinte
--      segundos en el medio dejaría todos los de abajo equivocados y
--      «Success»: el peor fallo posible, porque no se ve hasta que se
--      está grabando con el guion en la mano.
--
--   2. LOS EFECTOS DE SONIDO Y LA MÚSICA CUELGAN DEL BLOQUE, NO DEL
--      RELOJ. Un golpe de sonido se guarda como «a los 4 segundos DE
--      ESTE BLOQUE», no «en el minuto 3:12». Por lo mismo: arrastrar el
--      bloque a otro sitio se lleva sus señales con él y nada más hay
--      que tocar.
--
--   3. LA CITA ES UNA FILA, NO UN TEXTO SUELTO. Una película que sale en
--      seis bloques se escribe UNA vez y los seis apuntan a ella. Así el
--      rótulo que aparece en pantalla es el mismo las seis veces, y la
--      bibliografía del final no puede llevar dos versiones del mismo
--      dato.
--
-- QUÉ CREA:
--   1) rodaje_proyectos — un video. Su tema, su duración objetivo y el
--      tope de cámara que se ha puesto el autor.
--   2) rodaje_bloques   — la secuencia. Cada trozo, con lo que se dice,
--      lo que se ve, sus efectos de sonido y su música.
--   3) rodaje_fuentes   — el registro de citas. Lo generado con IA lleva
--      OBLIGATORIAMENTE la herramienta que lo hizo, y eso lo muerde un
--      `check`, no una pantalla.
--   4) rodaje_reels     — las piezas cortas que llevan gente al video.
--
--   Y un disparador que NO DEJA marcar un proyecto como publicado
--   mientras quede un bloque de material ajeno sin fuente declarada.
--
-- LO QUE NO CREA, Y ES A PROPÓSITO:
--   Ninguna puerta pública. A diferencia de `metas_videos`, aquí no hay
--   nada que un alumno tenga que leer: esto es el cuaderno privado de
--   quien dirige. Sin función `security definer` y sin política para
--   `anon`, con la clave publicable no se puede ni mirar.
-- ════════════════════════════════════════════════════════════════════

-- ── Antes de nada: ¿está lo de lo que esto depende? ─────────────────
-- Ocho líneas que ahorran una tarde, y la fecha está apuntada: el 27 de
-- agosto de 2026 se perdió una entera porque el SQL Editor corre TODO el
-- pegado dentro de UNA SOLA TRANSACCIÓN. Si falla una línea se deshace
-- el pegado entero —los `create table` incluidos—, y lo único que se ve
-- es el error de la línea que falló, que puede hablar de otra cosa.
do $$
begin
  if to_regprocedure('public.es_familia()') is null then
    raise exception
      'FALTA es_familia(). Corre antes supabase/sql/seguridad_familia_1_puerta.sql y vuelve a pegar este archivo.';
  end if;
end
$$;

-- ════════════════════════════════════════════════════════════════════
-- 1) EL PROYECTO
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.rodaje_proyectos (
  id            bigint generated always as identity primary key,

  -- El identificador NACE EN EL APARATO ('p-lz3k9x2'), no en la base.
  -- Dos razones, y las dos costaron algo en otra herramienta: el guardado
  -- se reintenta cuando la señal es mala y sin un identificador propio el
  -- segundo intento dejaría un gemelo; y es la llave con la que los
  -- bloques, las fuentes y los reels encuentran a su proyecto sin tener
  -- que esperar a que la base conteste con un número.
  pid           text not null unique check (pid ~ '^[a-z0-9-]{3,40}$'),

  titulo        text not null default '',
  -- La tesis en una línea. No es el título: es lo que el video sostiene.
  -- Va aquí y no en las notas porque es lo que se relee para decidir si
  -- un bloque sobra, y algo que hay que buscar no se relee.
  tesis         text not null default '',

  estado        text not null default 'guion'
                check (estado in ('guion','rodaje','montaje','publicado','archivado')),

  -- La duración a la que se apunta, en SEGUNDOS. El autor pidió «de diez
  -- minutos en adelante», así que el tope de abajo son seis horas: no es
  -- una previsión, es el freno para que un dedo torpe no escriba 60000 y
  -- convierta el presupuesto de cámara en un número sin sentido.
  dur_obj       int not null default 600 check (dur_obj between 60 and 21600),

  -- ⚠️ EL PRESUPUESTO DE CÁMARA, que es la petición central del autor:
  -- «Mi aparición en la cámara que solo se limite a expresar lo más
  -- importante». Son dos números y hacen falta los dos:
  --   · cam_pct    — cuánto del video entero puede ser cara hablando;
  --   · cam_bloque — cuánto puede durar UNA toma seguida.
  -- El segundo es el que de verdad muerde. Un video puede tener un 25 %
  -- de cámara y ser insoportable si ese 25 % es una sola parrafada de
  -- tres minutos y medio en el arranque.
  cam_pct       int not null default 30 check (cam_pct between 0 and 100),
  cam_bloque    int not null default 45 check (cam_bloque between 5 and 900),

  -- Dónde quedó publicado. Se comprueba en la pantalla con URL(); aquí
  -- se exige lo mínimo que se puede exigir con un `check`, que es que no
  -- empiece por otra cosa que http. Nunca se interpola en un atributo.
  url           text not null default ''
                check (url = '' or url ~* '^https?://'),

  notas         text not null default '',

  -- Quién lo abrió. No decide permisos —eso lo hace es_familia()—: sirve
  -- para saber a quién preguntarle, que en una casa de cuatro es la
  -- diferencia entre corregir algo y borrarlo por si acaso.
  autor         uuid default auth.uid(),

  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
-- 2) LA SECUENCIA
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.rodaje_bloques (
  id            bigint generated always as identity primary key,
  pid           text not null,
  -- Nace en el aparato, por lo mismo que el del proyecto. Y es la llave
  -- del arrastre: durante el arrastre el orden cambia bajo los pies, así
  -- que lo que la pantalla guarda en el nodo es esto y no la posición.
  bid           text not null check (bid ~ '^[a-z0-9-]{3,40}$'),

  -- El sitio en la secuencia. Se reescribe entero al soltar el dedo,
  -- pero SOLO las filas cuyo número cambió: cada escritura es un viaje a
  -- la nube y la señal es la de una tableta.
  orden         int not null default 0,

  -- Las ocho clases de bloque. Sale de mirar un video-ensayo de verdad y
  -- preguntarse de dónde viene cada plano; no es una lista abierta a
  -- propósito, porque de la clase depende si el bloque EXIGE fuente
  -- (ver el disparador del final) y una clase inventada sobre la marcha
  -- se escaparía de esa exigencia sin que nadie lo notara.
  clase         text not null default 'camara'
                check (clase in ('camara','pelicula','ia','grafico',
                                 'archivo','pantalla','musica','titulo')),

  titulo        text not null default '',

  -- ⚠️ SEGUNDOS QUE DURA, y NO el minuto en que empieza. Es la decisión
  -- número 1 de la cabecera y la que más barato sale respetar: el minuto
  -- de entrada lo suma la pantalla, así que mover un bloque no puede
  -- dejar ni un tiempo equivocado.
  dur           int not null default 30 check (dur between 0 and 3600),

  -- Lo que SE DICE. En un bloque de cámara es literalmente lo que el
  -- teleprompter va a pasar por delante, así que se guarda tal cual, con
  -- sus pausas escritas.
  guion         text not null default '',
  -- Lo que SE VE. Es lo que se lee al montar, meses después, cuando ya no
  -- se acuerda uno de qué plano tenía en la cabeza al escribirlo.
  visual        text not null default '',
  notas         text not null default '',

  -- ── Las fuentes que se acreditan en ESTE bloque ──
  -- Una lista de `fid` de rodaje_fuentes. Es jsonb y no una tabla puente
  -- porque no se consulta nunca por separado, no pasa de un puñado, y una
  -- tabla más es una política de seguridad más que puede quedar mal en un
  -- pegado hecho desde una tableta.
  fids          jsonb not null default '[]'::jsonb,

  -- ── Los efectos de sonido ──
  -- [{ "t": 4, "que": "golpe grave", "fid": "f-2", "niv": "primer plano" }]
  -- `t` son segundos DESDE EL PRINCIPIO DE ESTE BLOQUE. Decisión número 2
  -- de la cabecera: así arrastrar el bloque se lleva sus golpes con él.
  sfx           jsonb not null default '[]'::jsonb,

  -- ── La música ──
  -- { "fid": "f-1", "ini": 0, "fin": 25, "niv": "fondo", "acc": "entra" }
  -- `acc` dice qué HACE la música al empezar el bloque: entra, sigue,
  -- baja (para dejar oír la voz), sube o sale. El silencio es una
  -- decisión y por eso tiene nombre: sin «sale» escrito, un montaje deja
  -- la pista sonando debajo de la frase que tenía que doler.
  musica        jsonb not null default '{}'::jsonb,

  -- El rótulo tal como va a salir en la pantalla del espectador. Si se
  -- deja vacío, la pantalla lo ARMA con los datos de las fuentes: un
  -- rótulo escrito a mano en cada bloque acaba diciendo la misma película
  -- de cuatro maneras distintas a lo largo del video.
  rotulo        text not null default '',

  -- El bloque está terminado. No lo decide la pantalla sola: se marca a
  -- mano, y es lo que separa «lo pensé» de «está escrito».
  listo         boolean not null default false,

  autor          uuid default auth.uid(),
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),

  -- Un bloque no puede estar dos veces, y borrar el proyecto se lleva su
  -- secuencia. Sin la cascada, borrar un proyecto dejaría cuarenta
  -- bloques huérfanos que no se ven desde ninguna pantalla y que siguen
  -- ocupando sitio y saliendo en las cuentas.
  unique (pid, bid)
);

-- ════════════════════════════════════════════════════════════════════
-- 3) EL REGISTRO DE CITAS
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ ESTA ES LA TABLA POR LA QUE EXISTE LA HERRAMIENTA.
--
-- «Quiero citar todo absolutamente: lo que es generado con IA, lo que es
-- una canción real, lo que es un clip de alguna escena de película. Las
-- referencias deben ser estrictas y nombrar las fuentes que aparecen en
-- la pantalla.» Eso es lo que hay que hacer cumplir, y una nota al pie
-- de una libreta no lo hace cumplir.
create table if not exists public.rodaje_fuentes (
  id            bigint generated always as identity primary key,
  pid           text not null,
  fid           text not null check (fid ~ '^[a-z0-9-]{3,40}$'),

  -- Trece clases, y la frontera que de verdad importa es la de las
  -- cuatro que empiezan por `ia_`. Hoy una canción hecha con una máquina
  -- y una canción tocada por alguien suenan igual de bien y se citan
  -- distinto; separarlas en la clase —y no en una casilla que se puede
  -- olvidar— es lo que permite que la descripción del video las liste
  -- aparte sin que nadie tenga que acordarse.
  clase         text not null default 'web'
                check (clase in ('ia_musica','ia_video','ia_imagen','ia_voz','ia_texto',
                                 'cancion','pelicula','serie','libro','articulo',
                                 'web','archivo','propio')),

  titulo        text not null default '',   -- «The Calendar of Rain», «Arrival»
  autoria       text not null default '',   -- quién la hizo: Denis Villeneuve, Frank Herbert
  obra          text not null default '',   -- el álbum, la revista, la serie que la contiene
  anio          text not null default '',   -- texto y no número: «1965», «s. f.», «2011-2013»
  editor        text not null default '',   -- Paramount Pictures, Chilton Books, el canal

  url           text not null default ''
                check (url = '' or url ~* '^https?://'),

  licencia      text not null default 'desconocida'
                check (licencia in ('generado_ia','propio','dominio_publico','cc0',
                                    'cc_by','cc_by_sa','cc_by_nc','con_permiso',
                                    'licencia_comprada','uso_justo','desconocida')),

  -- ── Lo que hizo la máquina ──
  -- La herramienta con su nombre entero («Google MusicFX», «Google Veo»)
  -- y EL PROMPT con el que salió. El prompt no es un capricho de
  -- archivista: es lo único que hace reproducible una pieza generada, y
  -- es lo que separa «música: IA» —que no dice nada— de una cita.
  herramienta   text not null default '',
  prompt        text not null default '',

  -- El rótulo tal como sale en la pantalla del espectador. Lo ARMA la
  -- herramienta con los campos de arriba; se puede corregir a mano, pero
  -- nace escrito para que no se quede sin escribir.
  rotulo        text not null default '',

  -- ¿Este crédito sale EN PANTALLA, o solo en la descripción? El autor
  -- pidió «nombrar las fuentes que aparecen en la pantalla», así que lo
  -- normal es que sí; se puede apagar para lo que solo sostiene un dato
  -- y no se ve.
  pantalla      boolean not null default true,

  -- ¿Se comprobó el dato en la fuente, o se escribió de memoria? Es la
  -- misma regla que la Ruta de la Ley: de memoria no se cita. Mientras
  -- esto sea falso, la herramienta lo enseña en ámbar.
  verificada    boolean not null default false,

  notas         text not null default '',

  autor          uuid default auth.uid(),
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),

  unique (pid, fid)
);

-- ⚠️ EL CHECK QUE HACE QUE «GENERADO CON IA» SIGNIFIQUE ALGO.
--
-- Se TIRA Y SE VUELVE A PONER, no se añade «si no existe»: si mañana se
-- añade una clase `ia_` más y el archivo la añadiera solo cuando falta,
-- re-correrlo diría «Success» y dejaría la regla vieja, que es
-- exactamente el fallo del tope de preguntas de los videos de M.E.T.A.S
-- —un «Success» que miente y se descubre semanas después—.
--
-- Lo que exige: que nada de las cinco clases `ia_` pueda guardarse sin
-- decir CON QUÉ se hizo, y que su licencia sea la de lo generado. Sin
-- este check, «generado con IA» acaba siendo una casilla que se marca
-- por encima y una descripción de YouTube que no distingue una canción
-- de Google de una de un músico.
alter table public.rodaje_fuentes
  drop constraint if exists rodaje_fuentes_ia_declarada;
alter table public.rodaje_fuentes
  add constraint rodaje_fuentes_ia_declarada
  check (
    left(clase, 3) <> 'ia_'
    or (btrim(herramienta) <> '' and licencia = 'generado_ia')
  );

-- Y el espejo del anterior: la licencia `generado_ia` es SOLO para lo
-- generado. Sin esto, marcar «generado_ia» en un clip de película sería
-- una manera de saltarse el check de arriba por la puerta de atrás y
-- dejaría la bibliografía diciendo que Villeneuve lo hizo una máquina.
alter table public.rodaje_fuentes
  drop constraint if exists rodaje_fuentes_licencia_ia;
alter table public.rodaje_fuentes
  add constraint rodaje_fuentes_licencia_ia
  check (licencia <> 'generado_ia' or left(clase, 3) = 'ia_');

-- ════════════════════════════════════════════════════════════════════
-- 4) LOS REELS
-- ════════════════════════════════════════════════════════════════════
-- «Después quiero un espacio para los reels que inviten a los demás a ver
-- el video.» Van en su propia tabla y no en una nota del proyecto por una
-- razón concreta: un reel tiene su propio guion, su propia duración y su
-- propio estado de grabación, y sobre todo HEREDA LAS FUENTES DE SU
-- BLOQUE. Un corto que enseña tres segundos de una película necesita el
-- mismo crédito que el video largo —y el corto lo ve mucha más gente—.
create table if not exists public.rodaje_reels (
  id            bigint generated always as identity primary key,
  pid           text not null,
  rid           text not null check (rid ~ '^[a-z0-9-]{3,40}$'),
  orden         int not null default 0,

  -- El cartel: el texto grande que se queda quieto en pantalla. Es lo que
  -- se lee sin sonido, que es como se ven casi todos.
  titulo        text not null default '',
  -- Los tres primeros segundos hablados, aparte del resto del guion. Se
  -- separan porque son lo único que decide si alguien se queda, y algo
  -- que decide eso no puede estar enterrado en el párrafo.
  gancho        text not null default '',
  guion         text not null default '',
  -- La invitación al video largo, que es para lo que existe el reel.
  cta           text not null default '',

  dur           int not null default 45 check (dur between 0 and 600),

  -- De qué bloque del video sale. Es lo que permite heredar las fuentes
  -- y volver a mirar el original sin buscarlo.
  bid           text not null default '',
  fids          jsonb not null default '[]'::jsonb,

  red           text not null default 'todas'
                check (red in ('todas','reel','short','tiktok')),
  estado        text not null default 'idea'
                check (estado in ('idea','escrito','grabado','publicado')),
  hashtags      text not null default '',

  autor          uuid default auth.uid(),
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),

  unique (pid, rid)
);

-- ════════════════════════════════════════════════════════════════════
-- LOS CHECKS DE FORMA DE LOS jsonb
-- ════════════════════════════════════════════════════════════════════
-- Son de andar por casa a propósito —que sea una lista, que sea un
-- objeto, que no se desmande—: la forma de dentro la hace cumplir la
-- pantalla, que es donde se le puede explicar el error a quien lo está
-- escribiendo. Lo que NO puede pasar es que aquí entre algo que no sea
-- una lista, porque la pantalla la recorre con un bucle y un `null` la
-- deja en blanco sin decir por qué.
--
-- Se tiran y se vuelven a poner por lo mismo que los de arriba: para que
-- el archivo acabe SIEMPRE en los números que están escritos aquí, se
-- corra las veces que se corra.
alter table public.rodaje_bloques drop constraint if exists rodaje_bloques_formas;
alter table public.rodaje_bloques add constraint rodaje_bloques_formas check (
  jsonb_typeof(fids)   = 'array'  and jsonb_array_length(fids) <= 20 and
  jsonb_typeof(sfx)    = 'array'  and jsonb_array_length(sfx)  <= 24 and
  jsonb_typeof(musica) = 'object'
);

alter table public.rodaje_reels drop constraint if exists rodaje_reels_formas;
alter table public.rodaje_reels add constraint rodaje_reels_formas check (
  jsonb_typeof(fids) = 'array' and jsonb_array_length(fids) <= 20
);

-- ════════════════════════════════════════════════════════════════════
-- LAS LLAVES AJENAS
-- ════════════════════════════════════════════════════════════════════
-- Borrar un proyecto se lleva sus bloques, sus fuentes y sus reels. Sin
-- la cascada quedarían huérfanos: invisibles desde toda pantalla, y aun
-- así contando en los totales y ocupando el `unique (pid, bid)` el día
-- que se cree otro proyecto con el mismo pid.
--
-- No se pueden añadir con `if not exists` —PostgreSQL no lo admite en
-- llaves ajenas—, así que se tiran y se vuelven a poner. Es idempotente
-- igual y además arregla una llave que hubiera quedado mal puesta.
do $$
declare t text;
begin
  foreach t in array array['rodaje_bloques','rodaje_fuentes','rodaje_reels'] loop
    execute format('alter table public.%I drop constraint if exists %I', t, t || '_pid_fk');
    execute format(
      'alter table public.%I add constraint %I foreign key (pid)
         references public.rodaje_proyectos (pid) on update cascade on delete cascade',
      t, t || '_pid_fk');
  end loop;
end
$$;

-- ════════════════════════════════════════════════════════════════════
-- LOS ÍNDICES
-- ════════════════════════════════════════════════════════════════════
-- Lo que la pantalla pregunta en cada apertura: los bloques de UN
-- proyecto, en su orden. Y las fuentes de UN proyecto, para el registro
-- de citas y para la exportación.
create index if not exists rodaje_bloques_pid_idx  on public.rodaje_bloques  (pid, orden, id);
create index if not exists rodaje_fuentes_pid_idx  on public.rodaje_fuentes  (pid, clase);
create index if not exists rodaje_reels_pid_idx    on public.rodaje_reels    (pid, orden, id);
create index if not exists rodaje_proyectos_est_idx on public.rodaje_proyectos (estado, actualizado_at desc);

-- ════════════════════════════════════════════════════════════════════
-- actualizado_at, que no se escribe a mano
-- ════════════════════════════════════════════════════════════════════
-- Si dependiera de que la pantalla lo mande, el día que se corrija una
-- fila desde el SQL Editor la fecha se quedaría vieja y nadie lo notaría.
-- Una sola función para las cuatro tablas: cuatro copias de tres líneas
-- se arreglan en una y se quedan rotas en tres.
create or replace function public.rodaje_touch()
returns trigger language plpgsql as $$
begin
  new.actualizado_at := now();
  return new;
end
$$;

do $$
declare t text;
begin
  foreach t in array array['rodaje_proyectos','rodaje_bloques','rodaje_fuentes','rodaje_reels'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch_tr', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.rodaje_touch()',
      t || '_touch_tr', t);
  end loop;
end
$$;

-- ════════════════════════════════════════════════════════════════════
-- ⚠️ EL GUARDIA DE LAS CITAS
-- ════════════════════════════════════════════════════════════════════
-- «Quiero citar todo absolutamente.» Esto es lo que convierte esa frase
-- en algo que se puede cumplir sin acordarse.
--
-- Marcar un proyecto como `publicado` es lo último que se hace, y aquí es
-- donde se para si queda material ajeno sin declarar. Va en la BASE y no
-- en la pantalla porque la pantalla se salta con la consola en diez
-- segundos —y, más probable, porque a las once de la noche uno se salta
-- su propio aviso—.
--
-- Qué exige, y por qué esas cuatro clases:
--   · pelicula, ia, archivo y musica son SIEMPRE de alguien. Un bloque de
--     esas clases sin ninguna fuente apuntada es material ajeno sin
--     crédito, y no hay caso en que no lo sea.
--   · camara, grafico, pantalla y titulo pueden ser enteramente propios,
--     así que no se les exige nada: exigir donde no toca enseña a la
--     gente a rellenar por rellenar, y una casilla rellenada por rellenar
--     es peor que una vacía.
--
-- Y exige lo otro que el autor pidió con todas las letras: que las
-- fuentes que se anuncian EN PANTALLA tengan escrito su rótulo. Un
-- crédito que se decidió mostrar y está en blanco sale como un recuadro
-- vacío encima del video.
create or replace function public.rodaje_guarda_citas()
returns trigger language plpgsql as $$
declare
  v_sin_fuente text;
  v_sin_rotulo text;
begin
  -- Solo al ENTRAR en publicado. Corregir una errata de un proyecto ya
  -- publicado no puede quedar bloqueado por esto: sería castigar la
  -- corrección, que es justo lo que se quiere que sea fácil.
  if new.estado <> 'publicado' then return new; end if;
  if tg_op = 'UPDATE' and old.estado = 'publicado' then return new; end if;

  select string_agg(x.t, ', ' order by x.o)
    into v_sin_fuente
    from (
      select b.orden as o,
             coalesce(nullif(btrim(b.titulo), ''), '«sin título»') || ' (' || b.clase || ')' as t
        from public.rodaje_bloques b
       where b.pid = new.pid
         and b.clase in ('pelicula','ia','archivo','musica')
         and jsonb_array_length(b.fids) = 0
       limit 12
    ) x;

  if v_sin_fuente is not null then
    raise exception
      'No se puede publicar: hay material ajeno sin fuente declarada. Bloques: %. Ábrelos en F.A.R.O › El Rodaje › Secuencia y ponles su cita.',
      v_sin_fuente;
  end if;

  select string_agg(f.fid || ' (' || f.clase || ')', ', ' order by f.fid)
    into v_sin_rotulo
    from public.rodaje_fuentes f
   where f.pid = new.pid
     and f.pantalla
     and btrim(f.rotulo) = '';

  if v_sin_rotulo is not null then
    raise exception
      'No se puede publicar: hay fuentes marcadas para salir en pantalla y sin rótulo escrito: %. En F.A.R.O › El Rodaje › Citas.',
      v_sin_rotulo;
  end if;

  return new;
end
$$;

drop trigger if exists rodaje_proyectos_citas_tr on public.rodaje_proyectos;
create trigger rodaje_proyectos_citas_tr
  before insert or update of estado on public.rodaje_proyectos
  for each row execute function public.rodaje_guarda_citas();

-- ════════════════════════════════════════════════════════════════════
-- QUIÉN PUEDE TOCAR ESTO
-- ════════════════════════════════════════════════════════════════════
-- La familia y nadie más, con su sesión iniciada. es_familia() vive en
-- seguridad_familia_1_puerta.sql y es la misma que guarda la Bóveda.
--
-- Es DE LA CASA y no de cada quien, a diferencia de la repisa de enlaces:
-- un video se hace entre varios —uno escribe, otro busca los clips, otro
-- corrige las citas— y una secuencia que solo puede tocar quien la abrió
-- convierte «arréglame esa frase» en «pásame tu sesión».
--
-- Y NO HAY POLÍTICA PARA `anon`. No es un olvido: es que aquí no hay nada
-- que nadie de fuera tenga que leer. Con la clave publicable no se puede
-- ni mirar la lista de proyectos.
do $$
declare t text;
begin
  foreach t in array array['rodaje_proyectos','rodaje_bloques','rodaje_fuentes','rodaje_reels'] loop
    execute format('alter table public.%I enable row level security', t);
    if not exists (select 1 from pg_policies
                    where schemaname = 'public' and tablename = t
                      and policyname = t || '_familia') then
      execute format(
        'create policy %I on public.%I for all to authenticated
           using (public.es_familia()) with check (public.es_familia())',
        t || '_familia', t);
    end if;
  end loop;
end
$$;

-- ════════════════════════════════════════════════════════════════════
-- ¿QUEDÓ PUESTO?
--
-- Esta consulta va LA ÚLTIMA a propósito: el SQL Editor enseña el
-- resultado de la última sentencia, así que en vez de un «Success. No
-- rows returned» —que no distingue entre «quedó» y «se pegó a medias»—
-- sale escrito qué hay.
--
-- ⚠️ VA EN VERTICAL, una fila por cosa comprobada. El 29 de agosto de
-- 2026 la de criba.sql devolvía ocho columnas y en la tableta del autor
-- solo se veían cuatro: las demás caían fuera de pantalla. Una tabla se
-- desliza hacia abajo sola; hacia los lados, no.
--
-- Y si se cierra el editor sin leerla, no hay que volver a pegar esto:
-- está `supabase/sql/rodaje_comprueba.sql`, que solo mira.
-- ════════════════════════════════════════════════════════════════════
with c(orden, que, esperado, hay) as (
            select 1, 'tabla rodaje_proyectos', 'existe',
                   case when to_regclass('public.rodaje_proyectos') is null then 'NO ESTÁ' else 'existe' end
  union all select 2, 'tabla rodaje_bloques',   'existe',
                   case when to_regclass('public.rodaje_bloques')   is null then 'NO ESTÁ' else 'existe' end
  union all select 3, 'tabla rodaje_fuentes',   'existe',
                   case when to_regclass('public.rodaje_fuentes')   is null then 'NO ESTÁ' else 'existe' end
  union all select 4, 'tabla rodaje_reels',     'existe',
                   case when to_regclass('public.rodaje_reels')     is null then 'NO ESTÁ' else 'existe' end
  union all select 5, 'políticas (4, una por tabla)', '4',
                   (select count(*)::text from pg_policies
                     where schemaname = 'public' and tablename like 'rodaje\_%')
  union all select 6, 'seguridad por fila en las 4', 'true',
                   coalesce((select bool_and(relrowsecurity)::text from pg_class
                              where relname like 'rodaje\_%' and relkind = 'r'
                                and relnamespace = 'public'::regnamespace), 'NO')
  union all select 7, 'guardia de citas', 'existe',
                   case when to_regproc('public.rodaje_guarda_citas') is null then 'NO ESTÁ' else 'existe' end
  union all select 8, 'check: la IA declara su herramienta', 'existe',
                   case when exists (select 1 from pg_constraint
                                      where conname = 'rodaje_fuentes_ia_declarada')
                        then 'existe' else 'NO ESTÁ' end
  union all select 9, 'puerta pública (NO debe haberla)', 'ninguna',
                   case when exists (select 1 from pg_policies
                                      where schemaname = 'public' and tablename like 'rodaje\_%'
                                        and 'anon' = any(roles))
                        then '⚠️ HAY UNA' else 'ninguna' end
)
select case when hay = esperado then '✅' else '❌' end as ok, que, esperado, hay
  from c order by orden;
