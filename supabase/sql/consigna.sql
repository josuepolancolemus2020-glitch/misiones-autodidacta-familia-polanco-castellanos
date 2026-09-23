-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada. Va ENTERO, de una vez.
--
-- Depende SOLO de `seguridad_familia_1_puerta.sql` (es_familia(), ya
-- corrido desde la mudanza a privado). Si faltara, este archivo para en
-- la primera línea y dice qué correr antes.
-- ════════════════════════════════════════════════════════════════════
-- 📜 LA CONSIGNA · LAS PIEZAS: LO QUE SE LE PIDE A LA MÁQUINA, CON FORMA
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   La Consigna es el espejo de La Voz Prestada: allá se guarda lo que
--   la máquina ESCRIBIÓ; aquí se escriben, con forma, las consignas que
--   se le dan —un prompt, una habilidad (SKILL.md), un grafo de agentes
--   o un bucle—, se inventarían por estantes y se vuelven a usar en dos
--   toques. Cada fila es una PIEZA: su clase y su molde, su título, sus
--   bloques (rol, tarea, reglas, formato…), el material que va debajo,
--   la máquina a la que va, sus estantes, su bitácora de usos y sus
--   versiones.
--
--   Hasta que se corra este archivo, la herramienta funciona ENTERA con
--   la copia del aparato y lo dice a la vista («📴 Solo en este aparato:
--   falta correr consigna.sql»). Esta tabla es la copia que viaja: al
--   abrir F.A.R.O en la tableta está lo que se escribió en la
--   computadora, con sus usos y sus versiones.
--
-- POR QUÉ LA PIEZA SON BLOQUES Y NO UN TEXTO ARMADO: la forma es de la
--   máquina (etiquetas para Claude, encabezados para ChatGPT, párrafos
--   seguidos para NotebookLM) y la arma el aparato cada vez. Guardar el
--   texto armado sería guardar una de las formas y perder las otras.
--   `bloques` es una lista de {id, rotulo, t} en el orden del molde; el
--   vocabulario de ids, los moldes y las máquinas viven en el aparato
--   (js/tools/consigna.js), NUNCA aquí.
--
-- POR QUÉ `clase`, `molde` Y `maquina` NO LLEVAN LISTA EN EL CHECK: son
--   listas cerradas del aparato (CSG_CLASES, CSG_MOLDES, CSG_MAQUINAS).
--   Una lista escrita DENTRO del SQL obligaría a volver a pegar este
--   archivo desde una tableta por añadir un molde; llevan solo un tope
--   de largo.
--
-- POR QUÉ LOS TOPES SON ESTOS NÚMEROS Y NO OTROS: son los MISMOS que
--   CSG_TOPES en el aparato (bloques 60.000, material 20.000, estantes
--   1.000, notas 4.000, bitácora 60.000, versiones 200.000). El aparato
--   PODA por bytes antes de subir —quita usos viejos sin contestar,
--   pliega las versiones viejas a {vid, v, t}— para que este check no
--   rebote nunca con un mensaje de PostgreSQL que habla de otra cosa. Y
--   la sonda lee estos números del propio archivo y suspende si alguno
--   difiere de CSG_TOPES: dos copias que tienen que decir lo mismo se
--   vigilan, no se confían.
--
-- POR QUÉ `material` ES COLUMNA PROPIA Y NO UN BLOQUE MÁS: el material
--   (el informe a resumir, el texto a corregir) se pega DEBAJO de la
--   consigna, sale entre marcas y no se repasa. La pieza es la consigna,
--   no el informe: por eso su tope es más corto, y lo que pasa de 20.000
--   caracteres no se guarda con la pieza (queda en el aparato y se pega
--   al usar).
--
-- POR QUÉ `bitacora` Y `versiones` SON LISTAS Y SE FUSIONAN POR UNIÓN:
--   un uso {uid, t, maquina, v, ok, nota} y una versión {vid, v, t,
--   bloques?} nacen en un aparato y pueden subir después de que otro
--   aparato subió los suyos. Si la fila entera la ganara el reloj más
--   nuevo, el uso apuntado en la tableta pisaría el que se apuntó en la
--   computadora. Por eso el aparato las fusiona por su identificador,
--   y por eso llevan tope generoso: es lo que crece.
--
-- DE QUIÉN ES: DE LA CASA: UNA política por operación con es_familia()
--   y nada más. Un prompt se afina entre varios, y una pieza que solo
--   pudiera tocar quien la escribió convierte «arréglame esa regla» en
--   «pásame tu sesión». `autor` es solo el rótulo de quién la puso.
--
-- POR QUÉ EL RELOJ DEL APARATO (`actualizado`): la fusión entre aparatos
--   la decide quien escribió, que puede estar sin señal y subir después.
--   `ultima` es cuándo se usó por última vez, también con el reloj del
--   aparato: es el orden por defecto del anaquel.
--
-- POR QUÉ SE RETIRA CON LÁPIDA (`eliminado`) Y NO HAY BORRADO: si el
--   teléfono borrara la fila, la tableta que todavía tiene su copia la
--   subiría otra vez y la pieza resucitaría sola.
--
-- AQUÍ NO HAY PUERTA PÚBLICA, Y ES A PROPÓSITO: ninguna función
--   `security definer` ni política para `anon`. Con la clave publicable
--   no se puede ni mirar la lista de piezas. Nadie de fuera tiene nada
--   que leer aquí.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- LO PRIMERO: COMPROBAR LA DEPENDENCIA, Y DECIRLO EN CRISTIANO
-- ════════════════════════════════════════════════════════════════════
-- El editor corre TODO el pegado dentro de UNA transacción: si falla
-- una línea, se deshace el pegado entero y lo único que se ve es el
-- error de la línea que falló, que puede hablar de otra cosa.
do $guardia$
begin
  if to_regproc('public.es_familia') is null then
    raise exception E'FALTA public.es_familia(), y sin ella las politicas de esta tabla no se pueden crear.\n'
      'Como el editor corre todo el pegado en una sola transaccion, eso deshace TAMBIEN el create table, y despues parece que el archivo no hizo nada.\n'
      'Que hacer: correr antes supabase/sql/seguridad_familia_1_puerta.sql, y volver a pegar este.';
  end if;
end
$guardia$;

-- ── La pieza ────────────────────────────────────────────────────────
create table if not exists public.consigna_piezas (
  -- El identificador NACE EN EL APARATO (`csg-<reloj en base 36>-<6 al
  -- azar>`). La subida se reintenta, y sin un identificador propio el
  -- segundo intento dejaría una pieza gemela. Es la llave del upsert.
  id            text primary key check (length(id) between 4 and 60),

  -- Qué es para la máquina (prompt, habilidad, grafo, bucle) y con qué
  -- formato se escribió. Sin lista, a propósito: ver arriba.
  clase         text not null check (length(clase) between 1 and 20),
  molde         text not null check (length(molde) between 1 and 30),

  -- Con btrim: un título hecho solo de espacios es un título vacío, y
  -- la ficha del anaquel saldría sin nombre sin que ningún check lo
  -- hubiera parado.
  titulo        text not null check (length(btrim(titulo)) between 1 and 200),

  -- A quién va (claude, chatgpt, gemini…). Sin lista: CSG_MAQUINAS.
  maquina       text not null default '' check (length(maquina) <= 40),

  -- Los bloques: una lista de {id, rotulo, t} en el orden del molde.
  -- Sin variables ni material dentro: las variables se detectan al
  -- leer y el material tiene su columna. NUNCA se recortan en el
  -- aparato (es el texto de la persona): lo que no cabe se queda allí
  -- y la pantalla dice cuánto sobra.
  bloques       jsonb not null default '[]'::jsonb
                check (jsonb_typeof(bloques) = 'array' and length(bloques::text) <= 60000),

  -- Lo que se pega DEBAJO de la consigna. Columna propia: ver arriba.
  material      text not null default '' check (length(material) <= 20000),

  -- Los estantes: una lista de textos. Una lista y con tope, porque
  -- esto lo escribe un aparato y un aparato puede equivocarse en bucle.
  estantes      jsonb not null default '[]'::jsonb
                check (jsonb_typeof(estantes) = 'array' and length(estantes::text) <= 1000),

  -- El cuaderno de NotebookLM ligado a la pieza: el `id` de su ficha en
  -- 📓 Cuadernos (redaccion_cuadernos). Con él, abrir NotebookLM abre
  -- ESE cuaderno. Vacío si no hay ninguno.
  cuaderno      text not null default '' check (length(cuaderno) <= 80),

  notas         text not null default '' check (length(notas) <= 4000),

  -- La bitácora de usos: una lista de {uid, t, maquina, v, ok, nota}.
  -- `ok` es null mientras nadie conteste «¿sirvió?»: se PREGUNTA, no se
  -- rellena, y nunca se inventa un resultado.
  bitacora      jsonb not null default '[]'::jsonb
                check (jsonb_typeof(bitacora) = 'array' and length(bitacora::text) <= 60000),

  -- Las versiones anteriores: una lista de {vid, v, t, bloques?}. Solo
  -- las diez más recientes conservan sus bloques; las demás quedan
  -- plegadas a {vid, v, t}. Diez versiones con bloques de 60.000 no
  -- caben en 200.000, y por eso el aparato poda por bytes y no por
  -- cuenta.
  versiones     jsonb not null default '[]'::jsonb
                check (jsonb_typeof(versiones) = 'array' and length(versiones::text) <= 200000),

  -- El número que sube al corregir una pieza que ya se usó. Empieza en
  -- 1: una pieza en la versión 0 no existe.
  version       integer not null default 1 check (version between 1 and 100000),

  -- Cuántas veces se usó (copiar, compartir o abrir la máquina). Nunca
  -- menor que el largo de la bitácora; eso lo cuida la fusión.
  usos          integer not null default 0 check (usos >= 0),

  -- Cuándo se usó por última vez (reloj del aparato, ms): el orden por
  -- defecto del anaquel.
  ultima        bigint not null default 0,

  -- El identificador del miembro (josue, evelyn…), como en Redes y
  -- Cuadernos. Una pieza sin firma no sube: espera en el aparato a
  -- tener sesión.
  autor         text not null default '' check (length(autor) <= 40),

  eliminado     boolean not null default false,
  eliminado_at  timestamptz,

  -- Reloj del aparato en milisegundos, para fusionar los escalares.
  actualizado   bigint not null default 0,

  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- La consulta de la pantalla: todo lo vivo, lo más reciente primero.
create index if not exists consigna_piezas_actualizado_idx
  on public.consigna_piezas (eliminado, actualizado desc);

-- Cuándo tocó el servidor la fila por última vez. `set search_path` fijo,
-- como llevan las demás funciones de la casa.
create or replace function public.consigna_piezas_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.actualizado_at := now();
  return new;
end $$;

drop trigger if exists consigna_piezas_touch on public.consigna_piezas;
create trigger consigna_piezas_touch
  before update on public.consigna_piezas
  for each row execute function public.consigna_piezas_touch();

-- ── La puerta ───────────────────────────────────────────────────────
-- De la casa entera: ver, poner y corregir, con es_familia() en las
-- tres. «to authenticated» NO significa «uno de los cuatro»: significa
-- «cualquiera con sesión en este proyecto», y la clave publicable va en
-- el código del navegador. Sin es_familia(), quien pidiera una cuenta
-- podría leer y escribir las consignas de esta casa.
-- NO hay política de delete: se retira con lápida.
alter table public.consigna_piezas enable row level security;

drop policy if exists consigna_piezas_select on public.consigna_piezas;
create policy consigna_piezas_select on public.consigna_piezas
  for select to authenticated
  using (public.es_familia());

drop policy if exists consigna_piezas_insert on public.consigna_piezas;
create policy consigna_piezas_insert on public.consigna_piezas
  for insert to authenticated
  with check (public.es_familia());

drop policy if exists consigna_piezas_update on public.consigna_piezas;
create policy consigna_piezas_update on public.consigna_piezas
  for update to authenticated
  using (public.es_familia())
  with check (public.es_familia());

-- Con la clave publicable, sin sesión, no se puede ni mirar. Y a la casa
-- no se le da delete: aquí se retira con lápida.
revoke all on public.consigna_piezas from anon;
revoke all on public.consigna_piezas from authenticated;
grant select, insert, update on public.consigna_piezas to authenticated;

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN. Va la última porque el editor enseña el resultado de
-- la última sentencia: en vez de un «Success. No rows returned» que no
-- distingue «quedó» de «se pegó a medias», sale escrito qué hay.
-- EN VERTICAL, una fila por cosa: en la tableta una fila ancha se ve a
-- medias y lo que cae fuera es siempre el final.
-- Para volver a mirarlo otro día sin pegar todo esto, está
-- supabase/sql/consigna_comprueba.sql.
-- ════════════════════════════════════════════════════════════════════
with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'consigna_piezas')      as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'consigna_piezas')         as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'consigna_piezas'
        and 'anon' = any(roles))                                             as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'consigna_piezas'
        and cmd = 'DELETE')                                                  as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.consigna_piezas'))                     as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'consigna_piezas' and not t.tgisinternal)            as disparadores
)
select * from (
            select 1 as orden, 'tabla consigna_piezas' as que, 'existe' as esperado,
                   case when to_regclass('public.consigna_piezas') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '21', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'disparador (hora del servidor)', '1', disparadores::text from n
  union all select 6, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
) c
order by orden;
