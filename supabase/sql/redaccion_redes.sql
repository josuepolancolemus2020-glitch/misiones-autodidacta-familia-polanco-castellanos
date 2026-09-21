-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada. Va ENTERO, de una vez.
--
-- Depende de `seguridad_familia_1_puerta.sql` (es_familia(), ya corrido
-- desde la mudanza a privado) y de `redaccion_tables.sql` (la tabla de
-- notas de la revista, a la que se cuelga cada pieza). Si faltara una,
-- este archivo para en la primera línea y dice qué correr antes.
-- ════════════════════════════════════════════════════════════════════
-- REDACCIÓN · 📣 REDES · LAS PIEZAS PARA FACEBOOK, X, LINKEDIN,
-- TIKTOK Y YOUTUBE
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   Dentro de Redacción hay un chip 📣 Redes donde se escribe lo que
--   sale en cada red: un post, un hilo en partes de 280, el guion de un
--   video, la descripción, un comentario, la biografía del perfil. Cada
--   pieza sabe el tope de su red y se lleva sus fuentes, que salen donde
--   esa red las admite. Y muchas nacen de una nota de la revista, con el
--   título, el texto y las citas ya puestos.
--
--   Hasta que se corra este archivo, la herramienta funciona ENTERA con
--   la copia del aparato y lo dice a la vista («📴 Solo en este aparato:
--   falta correr redaccion_redes.sql»). Esta tabla es la copia que
--   viaja: al abrir Redacción en la tableta están las piezas que se
--   escribieron en el teléfono.
--
-- DE QUIÉN ES: DE LA CASA, como el resto de Redacción. Las notas de la
--   revista las escriben y corrigen los cuatro sin dueño, y una pieza
--   para redes es la misma clase de cosa: «arréglame esa frase del
--   post» no puede convertirse en «pásame tu sesión». Por eso hay UNA
--   política por operación con es_familia() y nada más, igual que en
--   redaccion_notas. `autor` es solo el rótulo de quién la empezó.
--
-- POR QUÉ `red`, `clase` Y `estado` NO LLEVAN LISTA EN EL CHECK:
--   Las redes y las clases viven en el aparato (RRD_REDES y RRD_REGLAS
--   en js/tools/redaccion-redes.js). Una lista escrita DENTRO del SQL
--   obligaría a volver a pegar este archivo desde una tableta el día
--   que entre Instagram o Threads, y esa factura ya se pagó con la
--   sexta clase del Buzón. Llevan solo un tope de largo.
--
-- POR QUÉ `enlace` SÍ LLEVA CHECK, Y DURO:
--   Esa dirección acaba en un href de la pantalla y en lo que se pega
--   en la red, y la pantalla vive en el mismo dominio que la Bóveda. La
--   pantalla ya la comprueba con URL(); esto es la otra mitad de la
--   misma regla: la base no puede fiarse de la pantalla. Es un check de
--   FORMA (empieza por http, sin comillas ni espacios), no una lista de
--   sitios: la forma no envejece.
--
-- POR QUÉ EL TEXTO ES TEXTO PLANO (sin HTML): ninguna red acepta
--   negritas pegadas. Lo que se guarda es exactamente lo que se pega.
--   Un tope de 70.000 cubre el post más largo que admite Facebook.
--
-- POR QUÉ EL RELOJ DEL APARATO (columna `actualizado`): la fusión entre
--   aparatos la decide quien escribió, que puede estar sin señal y
--   subir después; la hora del servidor diría entonces que lo viejo es
--   lo nuevo. Misma razón que la repisa y La Voz Prestada.
--
-- POR QUÉ SE RETIRA CON LÁPIDA (`eliminada`) Y NO HAY BORRADO: si el
--   teléfono borrara la fila, la tableta que todavía tiene su copia la
--   subiría otra vez y la pieza resucitaría sola. No hay política de
--   delete a propósito.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- LO PRIMERO: COMPROBAR LAS DEPENDENCIAS, Y DECIRLO EN CRISTIANO
-- ════════════════════════════════════════════════════════════════════
-- El editor corre TODO el pegado dentro de UNA transacción: si falla
-- una línea, se deshace el pegado entero y lo único que se ve es el
-- error de la línea que falló, que puede hablar de otra cosa. Ocho
-- líneas que ahorran una tarde (la del 27 de agosto de 2026).
do $guardia$
begin
  if to_regproc('public.es_familia') is null then
    raise exception E'FALTA public.es_familia(), y sin ella las politicas de esta tabla no se pueden crear.\n'
      'Como el editor corre todo el pegado en una sola transaccion, eso deshace TAMBIEN el create table, y despues parece que el archivo no hizo nada.\n'
      'Que hacer: correr antes supabase/sql/seguridad_familia_1_puerta.sql, y volver a pegar este.';
  end if;
  if to_regclass('public.redaccion_notas') is null then
    raise exception E'FALTA la tabla public.redaccion_notas (las notas de la revista), a la que se cuelga cada pieza.\n'
      'Que hacer: correr antes supabase/sql/redaccion_tables.sql, y volver a pegar este.';
  end if;
end
$guardia$;

-- ── La pieza ────────────────────────────────────────────────────────
create table if not exists public.redaccion_redes (
  -- El identificador NACE EN EL APARATO. La subida se reintenta, y sin
  -- un identificador propio el segundo intento dejaría una pieza gemela.
  id            text primary key check (length(id) between 4 and 60),

  -- La nota de la revista de la que salió, si salió de una. Si la nota
  -- se borra de verdad, la pieza se queda y pierde el enlace.
  nota_id       bigint references public.redaccion_notas(id) on delete set null,

  -- Sin lista, a propósito: ver arriba.
  red           text not null check (length(red) between 1 and 20),
  clase         text not null default 'post' check (length(clase) between 1 and 20),

  -- El rótulo para la lista; si va vacío la pantalla usa la primera línea.
  titulo        text not null default '' check (length(titulo) <= 200),

  -- Texto plano, tal como se pega. En un hilo, las partes van separadas
  -- por una línea que dice solo «---».
  texto         text not null default '' check (length(texto) <= 70000),

  -- La comprobación de forma. chr(92) es la barra invertida: se escribe
  -- así y no como carácter dentro de comillas porque un copiado entre el
  -- repositorio, el chat y el editor es justo donde se pierde.
  enlace        text not null default '' check (
                  enlace = '' or (
                    enlace ~ '^https?://'
                    and length(enlace) <= 2000
                    and enlace !~ '[[:space:]]'
                    and strpos(enlace, '"') = 0
                    and strpos(enlace, '''') = 0
                    and strpos(enlace, '<') = 0
                    and strpos(enlace, '>') = 0
                    and strpos(enlace, chr(92)) = 0
                  )
                ),

  -- Las fuentes: una lista de objetos {ref}. Una lista y con tope, porque
  -- esto lo escribe un aparato y un aparato puede equivocarse en bucle.
  fuentes       jsonb not null default '[]'::jsonb
                check (jsonb_typeof(fuentes) = 'array' and length(fuentes::text) <= 20000),

  -- Los ajustes de la pieza (Premium en X, numerar el hilo, Short…): un
  -- objeto libre, para que un ajuste nuevo sea una línea en el aparato y
  -- no una migración desde una tableta.
  opciones      jsonb not null default '{}'::jsonb
                check (jsonb_typeof(opciones) = 'object' and length(opciones::text) <= 2000),

  estado        text not null default 'borrador' check (length(estado) between 1 and 20),
  fecha         date,                       -- cuándo sale (opcional)
  publicada_at  timestamptz,                -- cuándo salió, si salió

  autor         text not null default '' check (length(autor) <= 40),

  eliminada     boolean not null default false,
  eliminada_at  timestamptz,

  -- Reloj del aparato en milisegundos, para fusionar.
  actualizado   bigint not null default 0,

  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- La consulta de la pantalla: todo lo vivo, lo más reciente primero; y
-- lo que salió de una nota, para enseñarlo desde la nota.
create index if not exists redaccion_redes_actualizado_idx
  on public.redaccion_redes (eliminada, actualizado desc);
create index if not exists redaccion_redes_nota_idx
  on public.redaccion_redes (nota_id);

-- Cuándo tocó el servidor la fila por última vez. `set search_path` fijo,
-- como llevan las demás funciones de la casa.
create or replace function public.redaccion_redes_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.actualizado_at := now();
  return new;
end $$;

drop trigger if exists redaccion_redes_touch on public.redaccion_redes;
create trigger redaccion_redes_touch
  before update on public.redaccion_redes
  for each row execute function public.redaccion_redes_touch();

-- ── La puerta ───────────────────────────────────────────────────────
-- De la casa entera: ver, poner y corregir, con es_familia() en las
-- tres. «to authenticated» NO significa «uno de los cuatro»: significa
-- «cualquiera con sesión en este proyecto», y la clave publicable va en
-- el código del navegador. Sin es_familia(), quien pidiera una cuenta
-- podría leer y escribir las piezas de esta casa.
-- NO hay política de delete: se retira con lápida.
alter table public.redaccion_redes enable row level security;

drop policy if exists redaccion_redes_select on public.redaccion_redes;
create policy redaccion_redes_select on public.redaccion_redes
  for select to authenticated
  using (public.es_familia());

drop policy if exists redaccion_redes_insert on public.redaccion_redes;
create policy redaccion_redes_insert on public.redaccion_redes
  for insert to authenticated
  with check (public.es_familia());

drop policy if exists redaccion_redes_update on public.redaccion_redes;
create policy redaccion_redes_update on public.redaccion_redes
  for update to authenticated
  using (public.es_familia())
  with check (public.es_familia());

-- Con la clave publicable, sin sesión, no se puede ni mirar. Y a la casa
-- no se le da delete: aquí se retira con lápida.
revoke all on public.redaccion_redes from anon;
revoke all on public.redaccion_redes from authenticated;
grant select, insert, update on public.redaccion_redes to authenticated;

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN. Va la última porque el editor enseña el resultado de
-- la última sentencia: en vez de un «Success. No rows returned» que no
-- distingue «quedó» de «se pegó a medias», sale escrito qué hay.
-- EN VERTICAL, una fila por cosa: en la tableta una fila ancha se ve a
-- medias y lo que cae fuera es siempre el final.
-- Para volver a mirarlo otro día sin pegar todo esto, está
-- supabase/sql/redaccion_redes_comprueba.sql.
-- ════════════════════════════════════════════════════════════════════
with n as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'redaccion_redes')      as cols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_redes')         as pols,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_redes'
        and 'anon' = any(roles))                                             as pols_anon,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_redes'
        and cmd = 'DELETE')                                                  as pols_delete,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.redaccion_redes'))                     as rls,
    (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
      where c.relname = 'redaccion_redes' and not t.tgisinternal)            as disparadores
)
select * from (
            select 1 as orden, 'tabla redaccion_redes' as que, 'existe' as esperado,
                   case when to_regclass('public.redaccion_redes') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columnas', '18', cols::text from n
  union all select 3, 'políticas (select, insert, update)', '3', pols::text from n
  union all select 4, 'seguridad por fila', 'true', coalesce(rls::text, 'NO') from n
  union all select 5, 'disparador (hora del servidor)', '1', disparadores::text from n
  union all select 6, 'borrado de verdad (NO debe poder)', '0', pols_delete::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
) c
order by orden;
