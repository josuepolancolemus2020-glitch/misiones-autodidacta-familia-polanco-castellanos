-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada.
--
-- ⚠️ VAN DOS ARCHIVOS, Y ESTE ES EL PRIMERO. Después de este hay que
--    correr `buzon_editar.sql`, que es el que deja al lector corregir
--    lo que mandó. Sin él el buzón funciona, pero quien se equivoca en
--    un dato solo puede retirar lo suyo y escribirlo todo otra vez.
-- ════════════════════════════════════════════════════════════════════
-- EL BUZÓN DEL LECTOR
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   La revista sale cada quince días y hasta ahora todo lo que entra en
--   ella lo escriben cuatro personas. El buzón abre la otra puerta: un
--   lector manda una nota, una opinión, una denuncia o una sugerencia, y
--   una escuela puede PEDIR que le cubran un evento en «Aulas en acción».
--   Lo que llega cae en la herramienta de Redacción, en su propia
--   bandeja, y desde ahí se convierte en nota de la edición que toca.
--
--   El enlace se imprime en la revista como código QR y se pega en los
--   grupos de WhatsApp. Quien lo abre NO tiene cuenta, NO tiene clave y
--   no va a pedir ninguna: escribe su nombre, su teléfono y lo que
--   quiere contar. Por eso esta es la única puerta abierta al público
--   de todo el proyecto, y por eso está tan estrecha.
--
-- QUÉ CREA:
--   1) Tabla buzon_mensajes — el envío del lector: qué manda, quién es,
--      cómo localizarlo y qué aceptó al mandarlo.
--   2) Tabla buzon_fotos — una fila por foto (máximo dos), aparte del
--      mensaje a propósito: la bandeja se abre docenas de veces al día y
--      no puede arrastrar megabytes de imágenes para pintar una lista.
--      Las fotos se piden solo al abrir un envío.
--   3) RPCs (única puerta de entrada, RLS cerrada):
--      - faro_buzon_estado()            → cuándo cierra la edición abierta
--      - faro_buzon_enviar(...)         → el lector manda lo suyo
--      - faro_buzon_retirar(folio, tel) → y puede arrepentirse
--   4) Higiene: lo descartado hace más de 180 días se borra solo.
--
-- LO QUE NO SALE NUNCA POR LA PUERTA PÚBLICA: absolutamente nada de lo
--   que hay dentro. faro_buzon_estado devuelve una fecha y un número de
--   edición, y ni una palabra más. Un lector no puede leer lo que mandó
--   otro, ni contarlos, ni saber si existen. La familia lee la bandeja
--   con su sesión, por RLS, como el resto de la aplicación.
--
-- POR QUÉ NO HAY CÓDIGO EN EL ENLACE (y la convocatoria de M.E.T.A.S sí
--   lo tiene): aquella pregunta por UN evento y muere con él. Este buzón
--   va IMPRESO EN PAPEL, y el papel se guarda. Un enlace con código
--   caduca; el número de la revista del año pasado seguiría en una
--   gaveta con un QR que ya no lleva a ninguna parte. La dirección es
--   una sola y para siempre.
-- ════════════════════════════════════════════════════════════════════

-- ── El envío ────────────────────────────────────────────────────────
create table if not exists public.buzon_mensajes (
  id            bigint generated always as identity primary key,
  folio         text not null unique,     -- B-7K3M: lo que el lector se queda
  creado_at     timestamptz not null default now(),

  -- qué manda: nota | opinion | denuncia | sugerencia | aulas | metas
  --
  -- «metas» es la rara y por eso está anotada: NO es material de la
  -- revista. Es alguien que leyó el número, vio que ahí se promociona
  -- la plataforma M.E.T.A.S y quiere usarla o necesita ayuda. Cae por
  -- la misma puerta porque es la única abierta al público, pero en la
  -- bandeja no se convierte en nota: se llama y se ayuda.
  clase         text not null default 'nota',
  titulo        text not null default '',
  texto         text not null default '',

  -- quién lo manda. El teléfono NO se publica nunca: es para verificar.
  nombre        text not null default '',
  tel           text not null default '',
  correo        text not null default '',
  lugar         text not null default '',   -- municipio o comunidad
  escuela       text not null default '',   -- si escribe desde un centro
  cargo         text not null default '',   -- maestro, madre, alumno, vecino…

  -- solo cuando pide cobertura para «Aulas en acción»
  evento_fecha  date,
  evento_hora   text not null default '',
  evento_lugar  text not null default '',

  -- lo que aceptó al mandarlo. Se guarda con su versión: si mañana
  -- cambian los requisitos, esta fila sigue diciendo cuáles firmó ESTE
  -- lector. Sin eso, un reclamo dentro de un año no se puede resolver.
  etica_ok      boolean not null default false,
  etica_version text not null default '',
  permiso_fotos boolean not null default false,  -- declara tener permiso de quien sale

  -- Cuántas fotos trae. Se guarda aquí, repetido, para que la bandeja
  -- pueda decir «📷 2 fotos» sin ir a buscarlas: las fotos son data URL
  -- de casi un mega y la lista se pinta cada vez que se abre la
  -- herramienta. Es un dato duplicado a sabiendas, y lo mantiene la
  -- misma función que las escribe.
  fotos         smallint not null default 0,

  -- la vida del envío dentro de la redacción
  estado        text not null default 'nuevo',   -- nuevo | leido | atendido | descartado
  nota_id       bigint,                          -- la nota que salió de aquí
  motivo        text not null default '',        -- por qué se descartó
  visto_por     text not null default '',
  visto_at      timestamptz,

  -- La llave contra el doble toque. Es el nombre + el teléfono + el
  -- principio del texto, normalizados. Un dedo nervioso en un teléfono
  -- lento manda lo mismo tres veces; con esto la tercera CORRIGE la
  -- primera en vez de llenar la bandeja de gemelas.
  huella        text not null,
  freno_dia     text not null default '',        -- ver el freno de más abajo
  unique (huella)
);
alter table public.buzon_mensajes enable row level security;

create index if not exists buzon_mensajes_estado_idx
  on public.buzon_mensajes (estado, creado_at desc);

-- ── Las fotos, aparte ───────────────────────────────────────────────
-- Van como data URL (texto), no en Storage. Storage haría falta abrirlo
-- a anónimos para que el lector pueda subir, y un depósito con la
-- puerta abierta se llena de basura en una tarde. Aquí la única puerta
-- sigue siendo la RPC, que cuenta, mide y recorta antes de escribir.
create table if not exists public.buzon_fotos (
  id         bigint generated always as identity primary key,
  mensaje_id bigint not null references public.buzon_mensajes(id) on delete cascade,
  orden      smallint not null default 1,
  datos      text not null,               -- data:image/jpeg;base64,…
  bytes      integer not null default 0
);
alter table public.buzon_fotos enable row level security;

create index if not exists buzon_fotos_mensaje_idx
  on public.buzon_fotos (mensaje_id, orden);

-- ── Quién lee esto ──────────────────────────────────────────────────
-- La familia y nadie más, con su sesión iniciada. es_familia() vive en
-- seguridad_familia_1_puerta.sql y es la misma que guarda el resto.
do $$
begin
  if not exists (select 1 from pg_policies
                  where schemaname = 'public' and tablename = 'buzon_mensajes'
                    and policyname = 'buzon_mensajes_familia') then
    create policy buzon_mensajes_familia on public.buzon_mensajes
      for all to authenticated
      using (public.es_familia()) with check (public.es_familia());
  end if;
  if not exists (select 1 from pg_policies
                  where schemaname = 'public' and tablename = 'buzon_fotos'
                    and policyname = 'buzon_fotos_familia') then
    create policy buzon_fotos_familia on public.buzon_fotos
      for all to authenticated
      using (public.es_familia()) with check (public.es_familia());
  end if;
end
$$;

-- ── Un folio corto que se pueda dictar por teléfono ─────────────────
-- Sin 0/O, sin 1/I/L: el lector lo va a leer de una pantalla pequeña y
-- lo va a repetir en voz alta. «B-7K3M» se dicta; «B-1IO0» no.
create or replace function public.faro_buzon_folio()
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare
  abc text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  f text;
  i int;
begin
  for intento in 1..20 loop
    f := 'B-';
    for i in 1..4 loop
      f := f || substr(abc, 1 + floor(random() * length(abc))::int, 1);
    end loop;
    if not exists (select 1 from public.buzon_mensajes where folio = f) then
      return f;
    end if;
  end loop;
  -- 923.521 combinaciones: veinte choques seguidos no pasan, pero si
  -- pasaran vale más un folio feo que un envío perdido.
  return 'B-' || to_char(now(), 'DDHH24MISS');
end
$$;
revoke all on function public.faro_buzon_folio() from public;

-- ── Cuándo cierra la edición que viene ──────────────────────────────
-- Lo ÚNICO que el público puede preguntar. Devuelve el número y la
-- fecha de cierre de la edición abierta, para que la pantalla pueda
-- decirle al lector «lo que mande antes del jueves entra en la
-- próxima». No devuelve el título (que lleva el nombre de la revista),
-- ni cuántas notas hay, ni quién escribe.
create or replace function public.faro_buzon_estado()
returns table (numero int, cierre date)
language sql security definer stable set search_path = public
as $$
  select e.numero, e.fecha_cierre
  from public.redaccion_ediciones e
  where not e.archivada
  order by e.numero desc
  limit 1
$$;
revoke all on function public.faro_buzon_estado() from public;
grant execute on function public.faro_buzon_estado() to anon, authenticated;

-- ── El lector manda lo suyo ─────────────────────────────────────────
-- Devuelve el folio si entró, cadena vacía si no. Nunca revienta: la
-- pantalla del lector tiene su propia salida por WhatsApp y para
-- tomarla necesita un «no» claro, no una excepción.
create or replace function public.faro_buzon_enviar(
  p_huella text, p_clase text, p_titulo text, p_texto text,
  p_nombre text, p_tel text, p_correo text, p_lugar text,
  p_escuela text, p_cargo text,
  p_evento_fecha date, p_evento_hora text, p_evento_lugar text,
  p_etica_ok boolean, p_etica_version text, p_permiso_fotos boolean,
  p_fotos jsonb
)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  hue   text := left(trim(coalesce(p_huella, '')), 160);
  cls   text := lower(trim(coalesce(p_clase, 'nota')));
  txt   text := left(trim(coalesce(p_texto, '')), 4000);
  nom   text := left(trim(coalesce(p_nombre, '')), 80);
  tl    text := left(trim(coalesce(p_tel, '')), 30);
  tel_n text := regexp_replace(coalesce(p_tel, ''), '[^0-9]', '', 'g');
  dia   text;
  msg_id bigint;
  fol   text;
  nueva boolean;
  foto  jsonb;
  ord   smallint := 0;
  d     text;
begin
  -- 1. Lo mínimo para que esto sea un envío y no un dedo resbalado.
  --    Sin nombre y sin teléfono no se publica nada (es el primero de
  --    los requisitos de ética, y aquí se hace cumplir, no se pide por
  --    favor). Sin aceptar los requisitos, tampoco entra.
  if hue = '' or length(nom) < 3 or length(tel_n) < 8 then return ''; end if;
  if length(txt) < 20 then return ''; end if;
  if coalesce(p_etica_ok, false) is not true then return ''; end if;
  if cls not in ('nota', 'opinion', 'denuncia', 'sugerencia', 'aulas', 'metas') then
    cls := 'nota';
  end if;

  -- 2. El freno. El enlace anda suelto en grupos de cientos de
  --    personas y va impreso en papel: tarde o temprano alguien se
  --    aburre y se pone a mandar. Cinco envíos por teléfono y día es
  --    de sobra para quien tiene algo que contar, y corta en seco al
  --    que no. Se cuenta por teléfono normalizado, no por navegador:
  --    borrar cookies no lo salta.
  dia := tel_n || '|' || to_char(now() at time zone 'UTC', 'YYYY-MM-DD');
  if (select count(*) from public.buzon_mensajes
       where freno_dia = dia and huella <> hue) >= 5 then
    return '';
  end if;

  -- 3. Higiene: lo descartado hace medio año ya no le sirve a nadie.
  delete from public.buzon_mensajes
   where estado = 'descartado' and creado_at < now() - interval '180 days';

  -- 4. El envío. Si es el mismo (misma huella), CORRIGE.
  select id, folio into msg_id, fol
    from public.buzon_mensajes where huella = hue;
  nueva := msg_id is null;
  if nueva then fol := public.faro_buzon_folio(); end if;

  insert into public.buzon_mensajes (
    folio, clase, titulo, texto, nombre, tel, correo, lugar, escuela, cargo,
    evento_fecha, evento_hora, evento_lugar,
    etica_ok, etica_version, permiso_fotos, huella, freno_dia
  ) values (
    fol, cls, left(trim(coalesce(p_titulo, '')), 140), txt,
    nom, tl, left(trim(coalesce(p_correo, '')), 120),
    left(trim(coalesce(p_lugar, '')), 80),
    left(trim(coalesce(p_escuela, '')), 120),
    left(trim(coalesce(p_cargo, '')), 60),
    p_evento_fecha, left(trim(coalesce(p_evento_hora, '')), 30),
    left(trim(coalesce(p_evento_lugar, '')), 120),
    true, left(trim(coalesce(p_etica_version, '')), 20),
    coalesce(p_permiso_fotos, false), hue, dia
  )
  on conflict (huella) do update set
    clase = excluded.clase, titulo = excluded.titulo, texto = excluded.texto,
    nombre = excluded.nombre, tel = excluded.tel, correo = excluded.correo,
    lugar = excluded.lugar, escuela = excluded.escuela, cargo = excluded.cargo,
    evento_fecha = excluded.evento_fecha, evento_hora = excluded.evento_hora,
    evento_lugar = excluded.evento_lugar,
    permiso_fotos = excluded.permiso_fotos
  returning id, folio into msg_id, fol;

  -- 5. Las fotos. Se rehacen enteras en cada envío: si el lector
  --    corrige y esta vez manda una sola, no puede quedarse colgada la
  --    de antes. Máximo dos, y con tope de tamaño: la pantalla ya las
  --    achica antes de mandarlas, pero el tope vive aquí porque la
  --    pantalla la escribe cualquiera y el servidor no.
  delete from public.buzon_fotos where mensaje_id = msg_id;
  if jsonb_typeof(p_fotos) = 'array' then
    for foto in select * from jsonb_array_elements(p_fotos) loop
      exit when ord >= 2;
      d := foto #>> '{}';
      if d is not null
         and d like 'data:image/%'
         and length(d) between 100 and 1400000 then
        ord := ord + 1;
        insert into public.buzon_fotos (mensaje_id, orden, datos, bytes)
        values (msg_id, ord, d, length(d));
      end if;
    end loop;
  end if;
  -- La cuenta se escribe SIEMPRE, también cuando quedan cero: si el
  -- lector corrige y esta vez no manda ninguna, la bandeja no puede
  -- seguir prometiendo dos fotos que ya no existen.
  update public.buzon_mensajes set fotos = ord where id = msg_id;

  return fol;
exception when others then
  return '';   -- un dato raro no le rompe la pantalla al lector
end
$$;
revoke all on function public.faro_buzon_enviar(
  text, text, text, text, text, text, text, text, text, text,
  date, text, text, boolean, text, boolean, jsonb) from public;
grant execute on function public.faro_buzon_enviar(
  text, text, text, text, text, text, text, text, text, text,
  date, text, text, boolean, text, boolean, jsonb) to anon, authenticated;

-- ── Y puede arrepentirse ────────────────────────────────────────────
-- No es un adorno: es el requisito de ética que más se promete y menos
-- se cumple. Quien mandó una denuncia el lunes y el martes tiene miedo
-- necesita poder retirarla ÉL, sin escribirle a nadie y sin esperar a
-- que alguien de la redacción se acuerde. Hacen falta las dos cosas
-- que solo él tiene: su folio y su teléfono.
--
-- Se borra de verdad, con sus fotos. Aquí no hay papelera a propósito:
-- una papelera es justo lo que él está pidiendo que no exista.
create or replace function public.faro_buzon_retirar(p_folio text, p_tel text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  fol   text := upper(trim(coalesce(p_folio, '')));
  tel_n text := regexp_replace(coalesce(p_tel, ''), '[^0-9]', '', 'g');
begin
  if length(fol) < 4 or length(tel_n) < 8 then return false; end if;
  delete from public.buzon_mensajes
   where folio = fol
     and regexp_replace(tel, '[^0-9]', '', 'g') = tel_n;
  return found;
exception when others then
  return false;
end
$$;
revoke all on function public.faro_buzon_retirar(text, text) from public;
grant execute on function public.faro_buzon_retirar(text, text) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA ESTO
--
-- Entero y en una base de usar y tirar, con `_dev/prueba-buzon-sql.sql`:
--
--     createdb buzontest
--     psql -d buzontest -f _dev/prueba-buzon-sql.sql
--
-- Corre las dos puertas de cabo a rabo: lo que entra, lo que se para,
-- el freno, el retiro, y —lo que de verdad importa— que **desde la
-- calle, con la clave publicable, no se lea ni una fila**. Esa prueba
-- reproduce a mano los permisos de tabla que Supabase le da al rol
-- anon; sin eso pasaría por el motivo equivocado.
--
-- Suelto, si solo se quiere ver que quedó instalado (pegar tras el Run):
--   select public.faro_buzon_enviar('ana|99887766|se cayo el muro','denuncia',
--     'El muro de la escuela','Se cayó el muro del patio y los niños pasan por ahí todos los días.',
--     'Ana López','9988-7766','','Comayagua','Escuela Lempira','madre',
--     null,'','',true,'2026-08',false,'[]'::jsonb);        -- devuelve B-XXXX
--   select public.faro_buzon_enviar('ana|99887766|se cayo el muro','denuncia',
--     'El muro','Se cayó el muro del patio, corregido.','Ana López','9988-7766','','Comayagua',
--     'Escuela Lempira','madre',null,'','',true,'2026-08',false,'[]'::jsonb);  -- MISMO folio
--   select count(*) from public.buzon_mensajes;            -- 1, no 2
--   select public.faro_buzon_enviar('x|99887766|hola','nota','','corto','Ana','9988-7766',
--     '','','','',null,'','',true,'2026-08',false,'[]'::jsonb);  -- '' (texto de 5 letras)
--   select public.faro_buzon_enviar('y|99887766|texto largo de prueba aqui','nota','',
--     'texto largo de prueba aqui que si pasa','Ana','9988-7766','','','','',
--     null,'','',false,'2026-08',false,'[]'::jsonb);       -- '' (no aceptó la ética)
--   select public.faro_buzon_retirar('B-XXXX','9988-7766'); -- true, y se lleva las fotos
--   select * from public.faro_buzon_estado();
-- ════════════════════════════════════════════════════════════════════
