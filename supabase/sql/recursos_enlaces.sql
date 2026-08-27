-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada.
--
-- VA UN SOLO ARCHIVO, este. Depende de `seguridad_familia_1_puerta.sql`,
-- que es quien crea es_familia() y ya está corrido desde la mudanza a
-- privado. Si esa función no existiera, este archivo falla al crear las
-- políticas y no deja la tabla a medias.
-- ════════════════════════════════════════════════════════════════════
-- LA REPISA DE ENLACES DE LAS MISIONES
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   Dentro de cada misión, en la sección de Recursos, hay una repisa con
--   las herramientas de estudio que salen de darle la misión entera a
--   una máquina: el resumen en audio, el video, el mapa mental, la guía.
--   Hasta hoy eso vivía SOLO en el aparato donde se pegó el enlace, que
--   es exactamente el problema que la repisa venía a resolver: el
--   material existía en un teléfono y no existía para nadie más.
--
--   Esta tabla es la copia que viaja. El aparato sigue siendo el que
--   manda para escribir y para pintar al instante (la repisa funciona
--   sin señal); esto es lo que hace que al abrir la misma misión en otro
--   aparato, o desde la tableta de otra persona de la casa, estén todos
--   los enlaces.
--
-- DE QUIÉN ES LA REPISA: DE LA CASA, y esto es distinto de las marcas de
--   lectura a propósito. Lo que subraya una hija no tiene por qué verlo
--   el padre; en cambio, el resumen en audio de «La cadena y el hueco»
--   le sirve a cualquiera que estudie esa etapa. Así que:
--     · VER: cualquiera de los cuatro ve todos los enlaces (es_familia).
--     · PONER: cualquiera de los cuatro, y la fila queda con su nombre.
--     · QUITAR Y CORREGIR: solo quien lo puso. Nadie puede borrarle un
--       enlace a otro, ni cambiárselo por otro sitio.
--   Decidido con el autor el 27 de agosto de 2026, sobre tres opciones.
--
-- POR QUÉ `tipo` NO LLEVA CHECK:
--   Podría llevarlo (hoy son nueve: audio, video, mapa, guia, informe,
--   preguntas, linea, tarjetas, web). No lo lleva porque una lista de
--   valores escrita DENTRO del SQL obliga a volver a pegar el archivo
--   cada vez que se añade uno, y esa factura ya se pagó: sumar la sexta
--   clase al Buzón del lector obligó a re-correr los dos archivos porque
--   la lista vivía dentro de las funciones. Un tipo que la pantalla no
--   conozca se pinta como «enlace» y no se rompe nada; una migración
--   desde la tableta por añadir «podcast» cuesta una semana.
--
-- POR QUÉ `url` SÍ LLEVA CHECK, Y DURO:
--   Porque esa dirección acaba dentro de un href de la misión, y la
--   misión vive en el mismo dominio que la Bóveda, las finanzas y el
--   chat. La pantalla ya la comprueba antes de guardarla; esto es la
--   otra mitad de la misma regla que rige en las Sugerencias de
--   M.E.T.A.S: la pantalla no puede fiarse de la base y la base no puede
--   fiarse de la pantalla. Aquí, además, un enlace lo pone una persona y
--   lo abren las otras tres.
--   Es un check de FORMA (empieza por http, no lleva comillas ni
--   espacios), no una lista de sitios permitidos: la forma no envejece.
--
-- POR QUÉ EL RELOJ DEL APARATO (columna `actualizado`): para fusionar
--   dos versiones del mismo enlace hace falta saber cuál es más nueva, y
--   la comparación la hace el aparato, que puede estar sin señal cuando
--   escribe. Gana la más reciente, sin más: aquí no hay nada que unir
--   como las notas del marcador, porque un enlace no se edita, se pone o
--   se quita.
--
-- POR QUÉ SE BORRA CON UNA LÁPIDA Y NO DE VERDAD (columna `borrado`):
--   si el teléfono borrara la fila, la tableta que todavía tiene su
--   copia la volvería a subir en la siguiente sincronización y el enlace
--   resucitaría solo. Con la lápida, el borrado también viaja. Lo
--   enterrado hace más de 180 días se barre solo, abajo.
-- ════════════════════════════════════════════════════════════════════

-- ── El enlace ───────────────────────────────────────────────────────
create table if not exists public.recursos_enlaces (
  -- El identificador NACE EN EL APARATO, no aquí. Hace falta porque la
  -- subida se reintenta: si la señal se corta a mitad, el teléfono no
  -- sabe si entró y lo vuelve a mandar. Con esto el segundo intento
  -- CORRIGE el primero en vez de dejar dos enlaces gemelos.
  id            text primary key,

  -- La clave de la misión (la misma de window.RECURSOS_ENLACES.mision,
  -- que es la de progreso y ya es única en todo el proyecto). Se guarda
  -- tal cual para no inventar un catálogo de misiones dentro de la base
  -- de datos: el catálogo vive en js/data/misiones.js y no debe haber
  -- dos.
  mision        text not null,

  -- Sin check, a propósito: ver la nota de arriba.
  tipo          text not null default 'web',

  titulo        text not null check (length(titulo) between 1 and 200),

  -- La comprobación de forma. chr(92) es la barra invertida: se escribe
  -- así y no como carácter dentro de comillas porque un copiado y pegado
  -- entre el repositorio, el chat y el editor de Supabase es justo donde
  -- una barra invertida se pierde sin que nadie lo note.
  url           text not null check (
                  url ~ '^https?://'
                  and length(url) <= 2000
                  and url !~ '[[:space:]]'
                  and strpos(url, '"') = 0
                  and strpos(url, '''') = 0
                  and strpos(url, '<') = 0
                  and strpos(url, '>') = 0
                  and strpos(url, chr(92)) = 0
                ),

  -- Qué trae y qué NO. El tope es el mismo que exige la pantalla: una
  -- descripción de repisa son dos líneas, no un párrafo.
  descripcion   text not null default '' check (length(descripcion) <= 400),

  fuente        text not null default '' check (length(fuente) <= 80),

  -- La etiqueta de estatus: lo hizo una máquina, o lo escribió la casa.
  -- Este SÍ lleva check porque son dos y no van a ser más: si dejaran de
  -- ser dos, la regla de la casa habría cambiado y eso merece pensarse,
  -- no colarse en una fila.
  origen        text not null default 'maquina' check (origen in ('maquina', 'casa')),

  dura          text not null default '' check (length(dura) <= 40),

  -- Quién lo puso. Es la llave de la puerta de escritura.
  anadido_por   uuid not null references auth.users(id) on delete cascade,

  -- Y su nombre corto, para poder enseñarlo en la tarjeta sin una
  -- segunda consulta. No se usa para permisos NUNCA (lo escribe el
  -- aparato, así que cualquiera podría poner el que quisiera): para eso
  -- está anadido_por, que lo comprueba la seguridad por fila contra
  -- auth.uid(). Es solo el rótulo.
  miembro       text not null default '' check (length(miembro) <= 40),

  borrado       boolean not null default false,

  -- Reloj del aparato en milisegundos, para fusionar. Ver la nota de
  -- arriba sobre por qué no se usa el del servidor.
  actualizado   bigint not null default 0,

  creado_at     timestamptz not null default now(),
  guardado_at   timestamptz not null default now()
);

-- La consulta que hace la repisa es siempre la misma: los enlaces de
-- ESTA misión, de toda la casa.
create index if not exists recursos_enlaces_idx
  on public.recursos_enlaces (mision);

-- Cuándo tocó el servidor la fila por última vez. Sirve para la higiene
-- y para mirar desde el editor qué está pasando; la fusión NO lo usa.
-- `set search_path` fijo: sin él, un search_path manipulado podría
-- cambiar a qué apunta lo de dentro de la función. Es la misma
-- precaución que llevan las demás funciones de la casa.
create or replace function public.recursos_enlaces_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.guardado_at := now();
  return new;
end $$;

drop trigger if exists recursos_enlaces_touch on public.recursos_enlaces;
create trigger recursos_enlaces_touch
  before update on public.recursos_enlaces
  for each row execute function public.recursos_enlaces_touch();

-- ── La puerta ───────────────────────────────────────────────────────
-- VER es de la casa entera; PONER, QUITAR y CORREGIR son de quien lo
-- puso. Por eso el select lleva solo es_familia() y los otros tres
-- llevan además la comparación con auth.uid().
--
-- es_familia() no sobra en ninguno de los cuatro: «to authenticated»
-- NO significa «uno de los cuatro», significa «cualquiera con sesión en
-- este proyecto», y la clave publicable va en el código del navegador,
-- que lee cualquiera. Sin es_familia(), quien pidiera una cuenta podría
-- colgar enlaces dentro de las misiones de esta casa.
alter table public.recursos_enlaces enable row level security;

drop policy if exists recursos_enlaces_select on public.recursos_enlaces;
create policy recursos_enlaces_select on public.recursos_enlaces
  for select to authenticated
  using (public.es_familia());

drop policy if exists recursos_enlaces_insert on public.recursos_enlaces;
create policy recursos_enlaces_insert on public.recursos_enlaces
  for insert to authenticated
  with check (public.es_familia() and anadido_por = auth.uid());

-- El `using` dice qué filas puedo tocar y el `with check` cómo pueden
-- quedar. Hacen falta los dos: solo con `using`, se podría coger un
-- enlace propio y dejarlo a nombre de otro.
drop policy if exists recursos_enlaces_update on public.recursos_enlaces;
create policy recursos_enlaces_update on public.recursos_enlaces
  for update to authenticated
  using (public.es_familia() and anadido_por = auth.uid())
  with check (public.es_familia() and anadido_por = auth.uid());

drop policy if exists recursos_enlaces_delete on public.recursos_enlaces;
create policy recursos_enlaces_delete on public.recursos_enlaces
  for delete to authenticated
  using (public.es_familia() and anadido_por = auth.uid());

-- Con la clave publicable, sin sesión, no se puede ni mirar. Esta no es
-- una tabla de las que tienen puerta pública como el Buzón: aquí solo
-- entra quien entró.
revoke all on public.recursos_enlaces from anon;
grant select, insert, update, delete on public.recursos_enlaces to authenticated;

-- ── Higiene ─────────────────────────────────────────────────────────
-- Las lápidas no se guardan para siempre: pasados 180 días, cualquier
-- aparato que siguiera vivo con ese enlace ya sincronizó cien veces.
create or replace function public.recursos_enlaces_higiene()
returns integer language sql security definer set search_path = public as $$
  with borrados as (
    delete from public.recursos_enlaces
     where borrado = true
       and guardado_at < now() - interval '180 days'
    returning 1
  )
  select count(*)::integer from borrados;
$$;

-- La higiene corre con los permisos de quien la creó (security definer),
-- así que NO puede quedar al alcance de cualquiera: con la clave
-- publicable, que va en el código y la lee todo el mundo, se podría
-- llamar a mano. Se le cierra la puerta a todos y se deja solo para el
-- administrador o para una tarea programada.
revoke execute on function public.recursos_enlaces_higiene() from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA QUE QUEDÓ PUESTO (no basta con el «Success»)
-- ════════════════════════════════════════════════════════════════════
-- 1) La tabla existe y tiene sus quince columnas:
--      select column_name, data_type
--        from information_schema.columns
--       where table_name = 'recursos_enlaces'
--       order by ordinal_position;
--
-- 2) La seguridad por fila está ENCENDIDA (tiene que decir true):
--      select relrowsecurity from pg_class
--       where oid = 'public.recursos_enlaces'::regclass;
--
-- 3) Las cuatro políticas están puestas (tienen que salir cuatro, y el
--    select tiene que ser el ÚNICO sin auth.uid() en su expresión):
--      select policyname, cmd, qual, with_check from pg_policies
--       where tablename = 'recursos_enlaces' order by policyname;
--
-- 4) El check de la dirección muerde de verdad. Esto TIENE QUE FALLAR
--    con «violates check constraint», y si pasa, la tabla está mal:
--      insert into public.recursos_enlaces (id, mision, titulo, url, anadido_por)
--      values ('prueba-mala', 'x', 'x', 'javascript:alert(1)', auth.uid());
--    Y esto también, por el espacio y la comilla:
--      insert into public.recursos_enlaces (id, mision, titulo, url, anadido_por)
--      values ('prueba-mala-2', 'x', 'x', 'https://a.hn/" onmouseover="x', auth.uid());
--
-- 5) La prueba de verdad, y es la única que cuenta: entrar en F.A.R.O
--    por la puerta, abrir «La cadena y el hueco», ir a Recursos, pegar
--    un enlace y ver que la repisa dice «☁️ Guardado también en la
--    nube». Después:
--      select mision, tipo, miembro, left(titulo, 40) as titulo, borrado
--        from public.recursos_enlaces order by creado_at desc limit 5;
--    Tiene que salir el enlace recién puesto. Y la comprobación que de
--    verdad prueba lo que se pidió: abrir la MISMA misión en otro
--    aparato (o en otro navegador, con la sesión de la casa puesta) y
--    ver el enlace ahí sin haber hecho nada.
--
--    Si sale vacío pero la repisa decía que sí, es que la sesión no
--    llegó a la misión: se entra primero en F.A.R.O por la puerta y se
--    vuelve a abrir la misión. Las misiones NO cargan la puerta de
--    antemano a propósito (la misma razón que el marcador, norma
--    5-septies): la repisa se trae Supabase solo cuando ya hay sesión
--    guardada en ese navegador, para que abrir una misión no pida red.
-- ════════════════════════════════════════════════════════════════════
