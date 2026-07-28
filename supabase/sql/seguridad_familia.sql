-- ════════════════════════════════════════════════════════════════════
-- F.A.R.O · Cerrar los datos de la casa (seguridad por fila)
-- ════════════════════════════════════════════════════════════════════
-- Qué arregla: seis tablas de la familia estaban con la seguridad por
-- fila APAGADA, y la clave publicable va en el codigo del navegador
-- porque asi se diseña. Con las dos cosas juntas, cualquiera con esa
-- clave podia leer y escribir esas tablas sin abrir la aplicacion.
--
--   destellos             ideas y apuntes
--   inventario            el inventario de la casa
--   redaccion_ediciones   la revista
--   redaccion_notas       las notas
--   redaccion_config      su configuracion
--   push_subscriptions    a que telefonos llegan las notificaciones
--
-- ⚠️ ORDEN OBLIGATORIO. Esto se aplica DESPUES de que la autenticacion
-- real (js/auth.js con Supabase Auth) este funcionando y probada con los
-- cuatro. Aplicarlo antes deja la aplicacion muerta: sin sesion iniciada
-- todas las consultas se rechazan y no hay con que autorizarlas.
--
-- El criterio: para una familia de cuatro, la politica correcta es la
-- mas simple que sirve. Quien tiene sesion iniciada puede todo; quien no,
-- nada. Hilar mas fino aqui es inventar complejidad donde no hay
-- conflicto, y la complejidad es donde se cuelan los agujeros. Si algun
-- dia hace falta separar (que las finanzas solo las vean los padres, por
-- ejemplo), se afina entonces y se prueba entonces.
--
-- La excepcion es push_subscriptions, que si merece politica estrecha:
-- cada quien solo ve y borra SU suscripcion. Una suscripcion ajena en
-- malas manos es poder mandar notificaciones al telefono de otro.
--
-- Uso: pegar en Supabase → SQL Editor y ejecutar. Es idempotente: se
-- puede correr dos veces sin romper nada.
-- ════════════════════════════════════════════════════════════════════

begin;

-- ── 1. Las cinco tablas de acceso comun ────────────────────────────
-- Cualquiera de los cuatro, con sesion iniciada, puede todo.

do $$
declare t text;
begin
  foreach t in array array[
    'destellos',
    'inventario',
    'redaccion_ediciones',
    'redaccion_notas',
    'redaccion_config'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_familia', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      t || '_familia', t);
    -- Por si alguna quedo con una politica abierta a anon de antes.
    execute format('drop policy if exists %I on public.%I', t || '_anon', t);
  end loop;
end $$;

-- ── 2. push_subscriptions: cada quien, la suya ─────────────────────
-- Requiere una columna que diga de quien es la suscripcion. Si la tabla
-- no la tiene, se agrega y se deja nula en las filas viejas: esas dejan
-- de ser accesibles, que es lo correcto, porque no se sabe de quien son.

alter table public.push_subscriptions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_familia on public.push_subscriptions;
drop policy if exists push_propia_select on public.push_subscriptions;
drop policy if exists push_propia_insert on public.push_subscriptions;
drop policy if exists push_propia_update on public.push_subscriptions;
drop policy if exists push_propia_delete on public.push_subscriptions;

create policy push_propia_select on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());

create policy push_propia_insert on public.push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());

create policy push_propia_update on public.push_subscriptions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy push_propia_delete on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

commit;

-- ════════════════════════════════════════════════════════════════════
-- COMPROBACION. Correr esto DESPUES y leer el resultado con calma.
-- Toda tabla de la familia debe salir con seguridad = true y con al
-- menos una politica. Una fila con seguridad = true y CERO politicas
-- esta cerrada a cal y canto: nadie entra, ni la aplicacion.
-- ════════════════════════════════════════════════════════════════════

select
  c.relname                                as tabla,
  c.relrowsecurity                         as seguridad_por_fila,
  count(p.polname)                         as politicas,
  coalesce(string_agg(p.polname, ', '), '(ninguna)') as cuales
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity, c.relname;

-- ════════════════════════════════════════════════════════════════════
-- LO QUE ESTE ARCHIVO NO CUBRE, Y HAY QUE MIRAR A MANO
-- ════════════════════════════════════════════════════════════════════
-- 1. LA TABLA DEL CHAT. js/chat.js lee de una tabla cuyo nombre esta en
--    la constante CHAT_TABLE, y su seguridad no se declara en ningun
--    .sql de este repositorio: se creo desde el panel. Hay que buscarla
--    en el resultado de la comprobacion de arriba y, si sale en false,
--    darle el mismo trato que a las cinco del bloque 1.
--
-- 2. LAS TABLAS DE FINANZAS. Igual: no hay .sql que las declare. Si el
--    modulo de finanzas guarda en la nube, sus tablas salen en la lista
--    y hay que cerrarlas tambien.
--
-- 3. LO DECLARADO NO ES LO APLICADO. Este repositorio dice lo que se
--    penso; la consulta de comprobacion dice lo que hay. Manda la
--    segunda.
--
-- 4. STORAGE. Si mas adelante entra la boveda de documentos, sus
--    depositos van PRIVADOS y con sus propias politicas sobre
--    storage.objects. Un deposito publico es una carpeta abierta en
--    internet, y ahi es donde irian las partidas de nacimiento.
