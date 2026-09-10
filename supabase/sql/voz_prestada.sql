-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces seguidas sin dañar nada.
--
-- VA UN SOLO ARCHIVO, este. Depende de `seguridad_familia_1_puerta.sql`,
-- que es quien crea es_familia() y ya está corrido desde la mudanza a
-- privado.
-- ════════════════════════════════════════════════════════════════════
-- LA VOZ PRESTADA · los cuentos que escribe una máquina imitando a otro
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ: el autor le pide a una máquina un cuento «al modo de» un
--   escritor. Eso vivía dentro de una ventana de chat, o sea que a los
--   tres días no existía. Aquí se guarda y se lee como un libro.
--
-- ⚠️ LA COLUMNA MÁS IMPORTANTE DE ESTA TABLA NO ES EL CUENTO: SON `voz`
--   Y `maquina`, Y POR ESO SON `not null` CON `check`.
--   Un cuento escrito por una máquina imitando a Rulfo NO ES DE RULFO.
--   Leído seis meses después en una tableta, sin la ventana del chat
--   alrededor, no hay NADA que lo distinga de uno que sí lo fuera: así
--   nace una atribución falsa, sin mala fe y por olvido. La pantalla ya
--   para el guardado si faltan; esto es la otra mitad de la misma regla,
--   la que no se puede saltar con la consola abierta.
--   Es el equivalente exacto de `rodaje_fuentes_ia_declarada` («generado
--   con IA» no entra sin decir con qué se hizo) y de la regla de oro del
--   Estudio Mayor: ninguna fuente entra sin su etiqueta.
--
-- DE QUIÉN SON: DE LA CASA, como El Rodaje y la repisa de enlaces.
--     · VER: cualquiera de los cuatro (es_familia).
--     · PONER: cualquiera, y la fila queda con su nombre.
--     · CORREGIR: solo quien lo puso.
--     · BORRAR DE VERDAD: nadie. Ver la nota de la lápida, abajo.
--   Un cuento no es una nota privada: se pide para leerlo y para
--   pasárselo a alguien de la casa.
--
-- POR QUÉ NO HAY PUERTA PÚBLICA, y es a propósito: a diferencia de
--   `metas_videos`, aquí no existe ninguna función `security definer`
--   para `anon` ni política que le deje mirar. No hay nada que nadie de
--   fuera tenga que leer, y con la clave publicable no se puede ni
--   listar los títulos. La comprobación del final lo vigila.
--
-- POR QUÉ SE BORRA CON LÁPIDA (columna `borrado`) Y NO HAY POLÍTICA DE
--   DELETE: si el teléfono borrara la fila, la tableta que todavía tiene
--   su copia la subiría otra vez en la siguiente sincronización y el
--   cuento resucitaría solo, sin que nadie entendiera por qué. Con la
--   lápida, el retiro también viaja. Lo enterrado hace más de 180 días
--   lo barre `voz_prestada_higiene()`, abajo.
--
-- POR QUÉ EL RELOJ DEL APARATO (columna `actualizado`): para fusionar
--   dos versiones del mismo cuento hace falta saber cuál es más nueva, y
--   la comparación la hace el aparato, que puede estar sin señal cuando
--   escribe. Gana la más reciente. Misma razón que en la repisa.
--
-- POR QUÉ EL CUERPO ES `jsonb` Y NO UNA TABLA DE PÁRRAFOS: un cuento se
--   lee entero o no se lee. Nunca hace falta «el párrafo 12 de todos los
--   cuentos», así que una tabla hija solo añadiría una unión a cada
--   lectura y un huérfano posible a cada borrado. Lo que sí lleva es
--   tope de tamaño: ver el check.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- LO PRIMERO: COMPROBAR LA DEPENDENCIA, Y DECIRLO EN CRISTIANO
-- ════════════════════════════════════════════════════════════════════
-- El editor de Supabase corre TODO el pegado dentro de UNA transacción.
-- Si falla una sola línea se deshace el pegado entero: la tabla NO se
-- crea, y lo único que se ve es el error de la línea que falló, que
-- puede hablar de otra cosa. Ocho líneas que ahorran una tarde.
do $guardia$
begin
  if to_regproc('public.es_familia') is null then
    raise exception E'FALTA public.es_familia(), y sin ella las politicas de esta tabla no se pueden crear.\n'
      'Como el editor corre todo el pegado en una sola transaccion, eso deshace TAMBIEN el create table, y despues parece que el archivo no hizo nada.\n'
      'Que hacer: correr antes supabase/sql/seguridad_familia_1_puerta.sql, y volver a pegar este.';
  end if;
end
$guardia$;

-- ── El cuento ───────────────────────────────────────────────────────
create table if not exists public.voz_prestada (
  -- El identificador NACE EN EL APARATO, no aquí. La subida se
  -- reintenta: si la señal se corta a mitad, la tableta no sabe si
  -- entró y lo vuelve a mandar. Con esto el segundo intento CORRIGE el
  -- primero en vez de dejar un cuento gemelo en el anaquel.
  cid           text primary key,

  titulo        text not null check (length(btrim(titulo)) between 1 and 200),

  -- ⚠️ LA ETIQUETA. Las dos mitades, y las dos obligatorias. Ver arriba.
  --   `voz` es a quién se imita («un narrador de pueblo, de frase
  --   corta», «Rulfo», «la voz de un informe policial»); no tiene por
  --   qué ser una persona, pero tiene que estar escrito.
  --   `maquina` es qué la escribió («Claude», «ChatGPT», «Gemini»).
  --   El tope de 2 letras es para que un espacio o una coma no cuenten
  --   como haber puesto la etiqueta.
  voz           text not null,
  maquina       text not null,

  -- El género: cuento, ensayo, poema, carta… La LISTA vive en el
  -- aparato (VOZ_GENEROS, en js/tools/voz-prestada.js), no aquí: este
  -- `check` solo mira el largo, para que añadir un género sea una línea
  -- en un archivo y no una migración que alguien pega desde una tableta.
  -- Es la regla 8 de la repisa de enlaces.
  genero        text not null default 'cuento',

  -- El encargo con el que salió. Se guarda porque es lo ÚNICO que hace
  -- repetible una pieza generada: es lo que separa «cuento hecho con
  -- IA» —que no dice nada— de una ficha. Misma razón que el prompt de
  -- las fuentes de El Rodaje.
  encargo       text check (encargo is null or length(encargo) <= 4000),

  nota          text check (nota is null or length(nota) <= 2000),

  -- El cuerpo: una lista de capítulos, cada uno {t: título, p: [bloques]}.
  capitulos     jsonb not null default '[]'::jsonb,

  -- Para la ficha del anaquel, sin abrir el cuento entero.
  palabras      integer not null default 0 check (palabras >= 0 and palabras <= 2000000),

  borrado       boolean not null default false,

  -- Quién lo puso. Es la llave de la puerta de escritura, y NO se puede
  -- cambiar después: ver el disparador.
  puesto_por    uuid not null references auth.users(id) on delete cascade,

  -- Reloj del aparato en milisegundos, para fusionar. Ver la nota de
  -- arriba sobre por qué no se usa el del servidor.
  actualizado   bigint not null default 0,

  creado_at     timestamptz not null default now(),
  guardado_at   timestamptz not null default now()
);

-- ── La columna que llegó después ────────────────────────────────────
-- ⚠️ `genero` ENTRÓ EL 10 DE SEPTIEMBRE DE 2026, DESPUÉS DE LA TABLA.
-- El `create table if not exists` de arriba NO añade columnas a una
-- tabla que ya existe: si este archivo se corrió el día del estreno, la
-- tabla está y le falta esta columna. Por eso va aparte y con
-- `if not exists`: en una base recién creada no hace nada, y en la del
-- estreno añade la columna sin tocar ni un cuento. Mientras no se
-- vuelva a correr, la herramienta lo dice en su barra («la base va
-- vieja») y guarda el género solo en el aparato.
alter table public.voz_prestada add column if not exists genero text not null default 'cuento';

-- ── Los `check` que se tiran y se vuelven a poner ───────────────────
-- ⚠️ SE TIRAN Y SE VUELVEN A PONER, NO SE AÑADEN «SI NO EXISTEN».
--   Con `if not exists`, re-correr el archivo después de cambiar un
--   tope diría «Success» y dejaría el valor viejo puesto, sin que nada
--   avisara. Es la lección del tope de preguntas de metas_videos.sql.
alter table public.voz_prestada drop constraint if exists voz_prestada_etiqueta;
alter table public.voz_prestada add constraint voz_prestada_etiqueta check (
  length(btrim(voz)) between 2 and 120 and length(btrim(maquina)) between 2 and 120
);

-- El género es una palabra corta. No se cierra a una lista: ver la
-- nota de la columna.
alter table public.voz_prestada drop constraint if exists voz_prestada_genero;
alter table public.voz_prestada add constraint voz_prestada_genero check (
  length(btrim(genero)) between 1 and 30
);

-- El cuerpo tiene que ser una LISTA, tener al menos un capítulo y no
-- crecer sin freno. 600 KB dan de sobra para una novela corta; un
-- cuento normal ocupa treinta veces menos. Sin tope, un pegado
-- accidental de un archivo entero se lleva la cuota de la base.
alter table public.voz_prestada drop constraint if exists voz_prestada_cuerpo;
alter table public.voz_prestada add constraint voz_prestada_cuerpo check (
  jsonb_typeof(capitulos) = 'array'
  and jsonb_array_length(capitulos) between 1 and 300
  and pg_column_size(capitulos) <= 600000
);

-- ⚠️ Y LA FIRMA TIENE RESPALDO EN LA BASE.
-- `puesto_por` es `not null` y la política de escritura exige que sea
-- quien entró, así que una fila sin firmar NO ENTRA. El 10 de septiembre
-- de 2026 el aparato se olvidó de mandarla y el fallo se vio así: el
-- cuento se guardaba, se veía donde se pegó, y no aparecía nunca en el
-- otro aparato. Desde fuera parece la señal, y no lo era: la escritura
-- llegaba y la base la rechazaba, que es de los síntomas que más
-- despistan porque la mitad visible funciona.
--
-- El aparato ya la manda (ver vozSubir), pero esto es la otra mitad de
-- la misma regla: si algún día otro cliente se olvida, la firma la pone
-- la base con quien de verdad entró. No abre ninguna puerta —auth.uid()
-- es el token de verdad, no algo que el navegador pueda escribir— y la
-- política sigue comparándolo igual.
alter table public.voz_prestada alter column puesto_por set default auth.uid();

create index if not exists voz_prestada_idx on public.voz_prestada (actualizado desc);
create index if not exists voz_prestada_voz_idx on public.voz_prestada (voz);

-- ── El disparador ───────────────────────────────────────────────────
-- Hace dos cosas, y la segunda es la que importa:
--
--   1. pone la hora del servidor, para la higiene y para poder mirar
--      desde el editor qué está pasando (la fusión NO la usa);
--
--   2. ⚠️ impide que una fila CAMBIE DE DUEÑO. La política de update ya
--      impide quedarse con la fila de otro (`with check ... = auth.uid()`),
--      pero no impide REGALAR la propia: sin esto, quien pusiera un
--      cuento podría dejarlo a nombre de otra persona y perder él mismo
--      la única puerta para corregirlo, sin ningún error y sin poder
--      deshacerlo. Es media línea y cierra el lado que la política no ve.
--
-- `set search_path` fijo: sin él, un search_path manipulado podría
-- cambiar a qué apunta lo de dentro de la función.
create or replace function public.voz_prestada_guarda()
returns trigger language plpgsql set search_path = public as $$
begin
  new.guardado_at := now();
  if tg_op = 'UPDATE' and new.puesto_por is distinct from old.puesto_por then
    raise exception 'Un cuento no cambia de dueño: puesto_por no se puede modificar.';
  end if;
  return new;
end $$;

drop trigger if exists voz_prestada_guarda on public.voz_prestada;
create trigger voz_prestada_guarda
  before insert or update on public.voz_prestada
  for each row execute function public.voz_prestada_guarda();

-- ── La puerta ───────────────────────────────────────────────────────
-- VER es de la casa entera; PONER y CORREGIR son de quien lo puso.
--
-- es_familia() no sobra en ninguna: «to authenticated» NO significa «uno
-- de los cuatro», significa «cualquiera con sesión en este proyecto», y
-- la clave publicable va en el código del navegador, que lee cualquiera.
-- Sin es_familia(), quien pidiera una cuenta podría leerse el anaquel
-- entero de esta casa.
--
-- Y NO HAY POLÍTICA DE DELETE, a propósito: se retira con lápida. Ver
-- la nota de arriba.
alter table public.voz_prestada enable row level security;

drop policy if exists voz_prestada_select on public.voz_prestada;
create policy voz_prestada_select on public.voz_prestada
  for select to authenticated
  using (public.es_familia());

drop policy if exists voz_prestada_insert on public.voz_prestada;
create policy voz_prestada_insert on public.voz_prestada
  for insert to authenticated
  with check (public.es_familia() and puesto_por = auth.uid());

-- El `using` dice qué filas puedo tocar y el `with check` cómo pueden
-- quedar. Hacen falta los dos: solo con `using`, se podría coger un
-- cuento propio y dejarlo a nombre de otro.
drop policy if exists voz_prestada_update on public.voz_prestada;
create policy voz_prestada_update on public.voz_prestada
  for update to authenticated
  using (public.es_familia() and puesto_por = auth.uid())
  with check (public.es_familia() and puesto_por = auth.uid());

-- Con la clave publicable, sin sesión, no se puede ni mirar.
revoke all on public.voz_prestada from anon;
grant select, insert, update on public.voz_prestada to authenticated;

-- ── Higiene ─────────────────────────────────────────────────────────
-- Las lápidas no se guardan para siempre: pasados 180 días, cualquier
-- aparato que siguiera vivo con ese cuento ya sincronizó cien veces.
create or replace function public.voz_prestada_higiene()
returns integer language sql security definer set search_path = public as $$
  with borrados as (
    delete from public.voz_prestada
     where borrado = true
       and guardado_at < now() - interval '180 days'
    returning 1
  )
  select count(*)::integer from borrados;
$$;

-- Corre con los permisos de quien la creó (security definer), así que NO
-- puede quedar al alcance de cualquiera: con la clave publicable, que va
-- en el código y la lee todo el mundo, se podría llamar a mano.
revoke execute on function public.voz_prestada_higiene() from public, anon, authenticated;

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
-- solo se veían cuatro: las demás caían fuera de pantalla, y entre ellas
-- la que dice si la seguridad por fila quedó puesta. Una tabla se
-- desliza hacia abajo sola; hacia los lados, no.
--
-- Y si se cierra el editor sin leerla, no hay que volver a pegar esto:
-- está `supabase/sql/voz_prestada_comprueba.sql`, que solo mira.
-- ════════════════════════════════════════════════════════════════════
with c(orden, que, esperado, hay) as (
            select 1, 'tabla voz_prestada', 'existe',
                   case when to_regclass('public.voz_prestada') is null then 'NO ESTÁ' else 'existe' end
  union all select 2, 'columnas (han de ser 14)', '14',
                   (select count(*)::text from information_schema.columns
                     where table_schema = 'public' and table_name = 'voz_prestada')
  union all select 3, 'políticas (select, insert, update)', '3',
                   (select count(*)::text from pg_policies
                     where schemaname = 'public' and tablename = 'voz_prestada')
  union all select 4, 'seguridad por fila', 'true',
                   coalesce((select relrowsecurity::text from pg_class
                              where oid = to_regclass('public.voz_prestada')), 'NO')
  union all select 5, 'check de la etiqueta (voz y máquina)', 'existe',
                   case when exists (select 1 from pg_constraint
                                      where conname = 'voz_prestada_etiqueta')
                        then 'existe' else 'NO ESTÁ' end
  union all select 6, 'check del cuerpo (lista y tope)', 'existe',
                   case when exists (select 1 from pg_constraint
                                      where conname = 'voz_prestada_cuerpo')
                        then 'existe' else 'NO ESTÁ' end
  union all select 11, 'columna genero (del 10/9/2026)', 'existe',
                   case when exists (select 1 from information_schema.columns
                                      where table_schema = 'public' and table_name = 'voz_prestada'
                                        and column_name = 'genero')
                        then 'existe' else 'NO ESTÁ' end
  union all select 7, 'disparador (hora y dueño)', 'existe',
                   case when to_regproc('public.voz_prestada_guarda') is null
                        then 'NO ESTÁ' else 'existe' end
  union all select 8, 'higiene de lápidas', 'existe',
                   case when to_regproc('public.voz_prestada_higiene') is null
                        then 'NO ESTÁ' else 'existe' end
  union all select 9, 'borrado de verdad (NO debe poder)', 'ninguna',
                   case when exists (select 1 from pg_policies
                                      where schemaname = 'public' and tablename = 'voz_prestada'
                                        and cmd = 'DELETE')
                        then '⚠️ HAY UNA' else 'ninguna' end
  union all select 10, 'puerta pública (NO debe haberla)', 'ninguna',
                   case when exists (select 1 from pg_policies
                                      where schemaname = 'public' and tablename = 'voz_prestada'
                                        and 'anon' = any(roles))
                        then '⚠️ HAY UNA' else 'ninguna' end
)
select case when hay = esperado then '✅' else '❌' end as ok, que, esperado, hay
  from c order by orden;
