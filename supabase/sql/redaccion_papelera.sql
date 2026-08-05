-- Ejecutar en Supabase -> SQL Editor.
-- ════════════════════════════════════════════════════════════════════
-- REDACCIÓN · LA PAPELERA
-- ════════════════════════════════════════════════════════════════════
-- Hasta ahora, tocar «Eliminar» en una nota la borraba de la base de
-- datos en el acto. Un dedo torcido en el teléfono y el trabajo de la
-- tarde no volvía: no hay copia, no hay deshacer, no hay a quién
-- pedírsela.
--
-- Con estas dos columnas, «Eliminar» deja de borrar: marca la nota
-- como eliminada y la aparta de las listas. Sigue en la base de datos,
-- entera, esperando en la papelera de Redacción hasta que se restaure
-- o hasta que alguien decida, a conciencia, vaciarla.
--
-- Es idempotente: se puede correr dos veces sin romper nada, y no
-- toca ninguna otra tabla ni la seguridad por fila.
-- ════════════════════════════════════════════════════════════════════

alter table public.redaccion_notas
  add column if not exists eliminada boolean not null default false;

alter table public.redaccion_notas
  add column if not exists eliminada_at timestamptz;

-- La papelera se consulta entera y por fecha de borrado (lo último que
-- se tiró aparece primero), que es justo lo que busca quien se acaba de
-- dar cuenta del error.
create index if not exists redaccion_notas_papelera_idx
  on public.redaccion_notas (eliminada, eliminada_at desc);
