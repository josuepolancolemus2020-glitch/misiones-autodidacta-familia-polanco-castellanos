-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada. Va ENTERO, de una vez.
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
-- No toca ninguna otra tabla ni la seguridad por fila: mandar a la
-- papelera es un `update` y vaciarla es un `delete`, y los dos ya los
-- deja hacer a la casa la política de siempre de redaccion_notas (la de
-- seguridad_familia_2_datos.sql). Por eso la comprobación del final la
-- enseña, sin tocarla: con la seguridad por fila puesta y sin esa
-- política, un `update` no da ningún error, cambia cero filas, y la
-- nota se quedaría donde estaba mientras la pantalla dice «en la
-- papelera».
--
-- Las notas que ya existen entran como NO eliminadas (el `default
-- false` las rellena al añadir la columna): nada desaparece de las
-- listas al correr esto.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- LO PRIMERO: COMPROBAR LA DEPENDENCIA, Y DECIRLO EN CRISTIANO
-- ════════════════════════════════════════════════════════════════════
-- El editor corre TODO el pegado dentro de UNA transacción: si falla
-- una línea, se deshace el pegado entero y lo único que se ve es el
-- error de la línea que falló, que puede hablar de otra cosa.
do $guardia$
begin
  if to_regclass('public.redaccion_notas') is null then
    raise exception E'FALTA la tabla public.redaccion_notas (las notas de la revista), que es a la que la papelera le pone sus dos columnas.\n'
      'Que hacer: correr antes supabase/sql/redaccion_tables.sql, y volver a pegar este.';
  end if;
end
$guardia$;

alter table public.redaccion_notas
  add column if not exists eliminada boolean not null default false;

alter table public.redaccion_notas
  add column if not exists eliminada_at timestamptz;

-- La papelera se consulta entera y por fecha de borrado (lo último que
-- se tiró aparece primero), que es justo lo que busca quien se acaba de
-- dar cuenta del error.
create index if not exists redaccion_notas_papelera_idx
  on public.redaccion_notas (eliminada, eliminada_at desc);

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN. Va la última porque el editor enseña el resultado de
-- la última sentencia: en vez de un «Success. No rows returned» que no
-- distingue «quedó» de «se pegó a medias», sale escrito qué hay.
-- EN VERTICAL, una fila por cosa: en la tableta una fila ancha se ve a
-- medias y lo que cae fuera es siempre el final.
-- Para volver a mirarlo otro día sin pegar todo esto, está
-- supabase/sql/redaccion_papelera_comprueba.sql.
-- ════════════════════════════════════════════════════════════════════
with n as (
  select
    (select data_type || ' · '
            || case is_nullable when 'NO' then 'no nula' else 'PUEDE SER NULA' end
            || ' · ' || coalesce(column_default, 'sin valor por defecto')
       from information_schema.columns
      where table_schema = 'public' and table_name = 'redaccion_notas'
        and column_name = 'eliminada')                                       as col_eliminada,
    (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'redaccion_notas'
        and column_name = 'eliminada_at')                                    as col_eliminada_at,
    to_regclass('public.redaccion_notas_papelera_idx')                       as indice,
    (select relrowsecurity from pg_class
      where oid = to_regclass('public.redaccion_notas'))                     as rls,
    -- Las políticas que dejan hacer un update (mandar a la papelera y
    -- restaurar) y un delete (vaciarla): «para todo» o para cada cosa.
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_notas'
        and cmd in ('ALL', 'UPDATE'))                                        as pols_update,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'redaccion_notas'
        and 'anon' = any(roles))                                             as pols_anon
)
select * from (
            select 1 as orden, 'tabla redaccion_notas' as que, 'existe' as esperado,
                   case when to_regclass('public.redaccion_notas') is null
                        then 'NO ESTÁ' else 'existe' end as hay
              from n
  union all select 2, 'columna eliminada', 'boolean · no nula · false',
                   coalesce(col_eliminada, 'NO ESTÁ') from n
  union all select 3, 'columna eliminada_at', 'timestamp with time zone',
                   coalesce(col_eliminada_at, 'NO ESTÁ') from n
  union all select 4, 'índice de la papelera', 'existe',
                   case when indice is null then 'NO ESTÁ' else 'existe' end from n
  union all select 5, 'seguridad por fila (la de siempre)', 'true', coalesce(rls::text, 'NO') from n
  union all select 6, 'política que deja mandar a la papelera', '1 o más', pols_update::text from n
  union all select 7, 'puerta pública (NO debe haberla)', '0', pols_anon::text from n
) c
order by orden;
