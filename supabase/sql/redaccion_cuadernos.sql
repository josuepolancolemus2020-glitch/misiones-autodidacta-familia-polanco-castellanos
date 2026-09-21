-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada. Va ENTERO, de una vez.
--
-- Depende SOLO de `seguridad_familia_1_puerta.sql` (es_familia(), ya
-- corrido desde la mudanza a privado). Si faltara, este archivo para en
-- la primera línea y dice qué correr antes.
-- ════════════════════════════════════════════════════════════════════
-- REDACCIÓN · 📓 CUADERNOS · EL INVENTARIO DE LOS CUADERNOS DE
-- NOTEBOOKLM
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   Dentro de Redacción hay un chip 📓 Cuadernos con una ficha por cada
--   cuaderno de NotebookLM que trabaja el autor: su dirección, su
--   nombre y su emoji, en qué estantes está (la materia, el curso, el
--   proyecto; puede estar en varios), de qué serie es y con qué número,
--   en qué va, cuántas fuentes tiene, unas notas y la lista de lo que se
--   sacó de él —las referencias, con dónde se usaron—. NotebookLM no
--   tiene carpetas ni etiquetas ni deja exportar la lista; esto es el
--   catálogo que le falta. El contenido sigue viviendo allá.
--
--   Hasta que se corra este archivo, la herramienta funciona ENTERA con
--   la copia del aparato y lo dice a la vista («📴 Solo en este aparato:
--   falta correr redaccion_cuadernos.sql»). Esta tabla es la copia que
--   viaja: al abrir Redacción en la tableta está lo que se fichó en la
--   computadora.
--
-- POR QUÉ UNA TABLA PROPIA Y NO `recursos_enlaces`: la repisa de las
--   misiones y de La Voz Prestada también guarda enlaces con nombre, y
--   la casa tiene por regla no inventar una segunda tabla para el mismo
--   gesto. Pero una ficha de cuaderno no es un enlace de repisa: lleva
--   estantes, serie, estado, notas y una lista de referencias que crece
--   con los meses, y `recursos_enlaces.opciones` tiene un tope de 2.000
--   caracteres que esa lista reventaría en silencio (un check de
--   PostgreSQL rebotando el guardado con un mensaje que habla de otra
--   cosa). Las cosas de Redacción viven en tablas `redaccion_*`.
--
-- DE QUIÉN ES: DE LA CASA, como el resto de Redacción: UNA política por
--   operación con es_familia() y nada más. `autor` es solo el rótulo de
--   quién lo fichó.
--
-- POR QUÉ `estado` NO LLEVA LISTA EN EL CHECK: los estados viven en el
--   aparato (RCU_ESTADOS en js/tools/redaccion-cuadernos.js). Una lista
--   escrita DENTRO del SQL obligaría a volver a pegar este archivo desde
--   una tableta por añadir uno; lleva solo un tope de largo.
--
-- POR QUÉ `url` SÍ LLEVA CHECK, Y DURO: esa dirección acaba en un href
--   de la pantalla, que vive en el mismo dominio que la Bóveda. La
--   pantalla ya la comprueba con URL(); la base no puede fiarse de la
--   pantalla. Es un check de FORMA (empieza por http, sin comillas ni
--   espacios), no una lista de sitios: la forma no envejece.
--
-- `cuaderno` es el identificador que va dentro de la dirección de
--   NotebookLM. Es lo que evita fichar dos veces el mismo cuaderno: la
--   misma dirección se pega un día con «?authuser=1» y otro sin él.
--
-- POR QUÉ EL RELOJ DEL APARATO (`actualizado`): la fusión entre aparatos
--   la decide quien escribió, que puede estar sin señal y subir después.
--   `ultima` es cuándo se abrió el cuaderno desde aquí por última vez,
--   también con el reloj del aparato: es el orden por defecto de la
--   lista.
--
-- POR QUÉ SE RETIRA CON LÁPIDA (`eliminado`) Y NO HAY BORRADO: si el
--   teléfono borrara la fila, la tableta que todavía tiene su copia la
--   subiría otra vez y el cuaderno resucitaría solo.
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

-- ── La ficha ────────────────────────────────────────────────────────
create table if not exists public.redaccion_cuadernos (
  -- El identificador NACE EN EL APARATO. La subida se reintenta, y sin
  -- un identificador propio el segundo intento dejaría una ficha gemela.
  id            text primary key check (length(id) between 4 and 60),

  titulo        text not null check (length(titulo) between 1 and 200),

  -- La comprobación de forma. chr(92) es la barra invertida: se escribe
  -- así y no como carácter dentro de comillas porque un copiado entre el
  -- repositorio, el chat y el editor es justo donde se pierde.
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

  -- El identificador del cuaderno dentro de la dirección (vacío si el
  -- enlace no es de NotebookLM).
  cuaderno      text not null default '' check (length(cuaderno) <= 80),

  -- El emoji con que NotebookLM pinta el cuaderno: un grafema.
  emoji         text not null default '' check (length(emoji) <= 16),

  -- Los estantes: una lista de textos. Una lista y con tope, porque
  -- esto lo escribe un aparato y un aparato puede equivocarse en bucle.
  estantes      jsonb not null default '[]'::jsonb
                check (jsonb_typeof(estantes) = 'array' and length(estantes::text) <= 1000),

  serie         text not null default '' check (length(serie) <= 80),
  serie_n       numeric not null default 0 check (serie_n >= 0 and serie_n < 100000),

  -- Sin lista, a propósito: ver arriba.
  estado        text not null default 'activo' check (length(estado) between 1 and 20),

  fuentes       integer not null default 0 check (fuentes between 0 and 5000),

  notas         text not null default '' check (length(notas) <= 8000),

  -- Las referencias: una lista de objetos {id, t (qué se sacó), en
  -- (dónde se usó), f (fecha)}. Con tope generoso: es lo que crece.
  referencias   jsonb not null default '[]'::jsonb
                check (jsonb_typeof(referencias) = 'array' and length(referencias::text) <= 60000),

  -- Cuándo se abrió desde aquí por última vez (reloj del aparato, ms).
  ultima        bigint not null default 0,

  autor         text not null default '' check (length(autor) <= 40),

  eliminado     boolean not null default false,
  eliminado_at  timestamptz,

  -- Reloj del aparato en milisegundos, para fusionar.
  actualizado   bigint not null default 0,

  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- La consulta de la pantalla: todo lo vivo, lo más reciente primero.
create index if not exists redaccion_cuadernos_actualizado_idx
  on public.redaccion_cuadernos (eliminado, actualizado desc);
-- Y el cuaderno por su identificador, para no fichar dos veces el mismo.
create index if not exists redaccion_cuadernos_cuaderno_idx
  on public.redaccion_cuadernos (cuaderno);

-- Cuándo tocó el servidor la fila por última vez. `set search_path` fijo,
-- como llevan las demás funciones de la casa.
create or replace function public.redaccion_cuadernos_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.actualizado_at := now();
  return new;
end $$;

drop trigger if exists redaccion_cuadernos_touch on public.redaccion_cuadernos;
create trigger redaccion_cuadernos_touch
  before update on public.redaccion_cuadernos
  for each row execute function public.redaccion_cuadernos_touch();

-- ── La puerta ───────────────────────────────────────────────────────
-- De la casa entera: ver, poner y corregir, con es_familia() en las
-- tres. «to authenticated» NO significa «uno de los cuatro»: significa
-- «cualquiera con sesión en este proyecto», y la clave publicable va en
-- el código del navegador. Sin es_familia(), quien pidiera una cuenta
-- podría leer y escribir el inventario de esta casa.
-- NO hay política de delete: se retira con lápida.
alter table public.redaccion_cuadernos enable row level security;

drop policy if exists redaccion_cuadernos_select on public.redaccion_cuadernos;
create policy redaccion_cuadernos_select on public.redaccion_cuadernos
  for select to authenticated
  using (public.es_familia());

drop policy if exists redaccion_cuadernos_insert on public.redaccion_cuadernos;
create policy redaccion_cuadernos_insert on public.redaccion_cuadernos
  for insert to authenticated
  with check (public.es_familia());

drop policy if exists redaccion_cuadernos_update on public.redaccion_cuadernos;
create policy redaccion_cuadernos_update on public.redaccion_cuadernos
  for update to authenticated
  using (public.es_familia())
  with check (public.es_familia());

-- Con la clave publicable, sin sesión, no se puede ni mirar. Y a la casa
-- no se le da delete: aquí se retira con lápida.
revoke all on public.redaccion_cuadernos from anon;
revoke all on public.redaccion_cuadernos from authenticated;
grant select, insert, update on public.redaccion_cuadernos to authenticated;

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN. Va la última porque el editor enseña el resultado de
-- la última sentencia: en vez de un «Success. No rows returned» que no
-- distingue «quedó» de «se pegó a medias», sale escrito qué hay.
-- EN VERTICAL, una fila por cosa: en la tableta una fila ancha se ve a
-- medias y lo que cae fuera es siempre el final.
-- Para volver a mirarlo otro día sin pegar todo esto, está
-- supabase/sql/redaccion_cuadernos_comprueba.sql.
-- ════════════════════════════════════════════════════════════════════
with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'redaccion_cuadernos')  as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_cuadernos')     as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_cuadernos'
        and 'anon' = any(roles))                                             as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_cuadernos'
        and cmd = 'DELETE')                                                  as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.redaccion_cuadernos'))                 as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'redaccion_cuadernos' and not t.tgisinternal)        as disparadores
)
select * from (
            select 1 as orden, 'tabla redaccion_cuadernos' as que, 'existe' as esperado,
                   case when to_regclass('public.redaccion_cuadernos') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '19', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'disparador (hora del servidor)', '1', disparadores::text from n
  union all select 6, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
) c
order by orden;
