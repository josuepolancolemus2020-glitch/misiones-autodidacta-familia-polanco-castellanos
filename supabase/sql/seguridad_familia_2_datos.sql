-- ════════════════════════════════════════════════════════════════════
-- F.A.R.O · PASO 2 de 2 · CERRAR LOS DATOS (seguridad por fila)
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ ESTE ARCHIVO SI CAMBIA LAS COSAS, y si se ejecuta antes de tiempo
-- deja a la familia sin poder leer ni escribir nada.
--
-- NO SE EJECUTA hasta que las tres condiciones se cumplan:
--   1. seguridad_familia_1_puerta.sql ya corrio y dijo «Los cuatro
--      sembrados correctamente»;
--   2. la pantalla de entrada nueva esta publicada;
--   3. LOS CUATRO entraron de verdad, cada uno en su aparato. No tres.
--
-- Que arregla: seis tablas de la familia estaban con la seguridad por
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
-- Y se suman las que faltaban y quedaban abiertas: mensajes (el chat
-- familiar entero), cuentas, transacciones y deudas.
--
-- El criterio: para una familia de cuatro, la politica correcta es la
-- mas simple que sirve. Quien es de la casa puede todo; quien no, nada.
-- Hilar mas fino aqui es inventar complejidad donde no hay conflicto, y
-- la complejidad es donde se cuelan los agujeros.
--
-- Es idempotente: se puede correr dos veces sin romper nada.
-- ════════════════════════════════════════════════════════════════════

begin;

-- ── 1. Las tablas de acceso comun ──────────────────────────────────
-- Cualquiera de los cuatro, con sesion iniciada, puede todo. Quien no, nada.
--
-- La lista incluye las del chat y las de finanzas. En la primera version de
-- este archivo se dejaron «para mirar a mano» y eso las habria dejado abiertas
-- de par en par justo despues de creer que la casa quedaba cerrada: mensajes
-- (el chat familiar entero), cuentas, transacciones y deudas (cada saldo y cada
-- gasto). Si alguna no existe en el proyecto, el bloque la salta y lo dice, en
-- vez de tumbar la transaccion entera y no aplicar nada.

do $$
declare
  t text;
  faltan text[] := '{}';
begin
  foreach t in array array[
    'destellos',
    'inventario',
    'redaccion_ediciones',
    'redaccion_notas',
    'redaccion_config',
    'mensajes',
    'cuentas',
    'transacciones',
    'deudas'
  ]
  loop
    if to_regclass('public.' || quote_ident(t)) is null then
      faltan := faltan || t;
      continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_familia', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      || 'using (public.es_familia()) with check (public.es_familia())',
      t || '_familia', t);
    -- Por si alguna quedo con una politica abierta a anon de antes.
    execute format('drop policy if exists %I on public.%I', t || '_anon', t);
  end loop;

  if array_length(faltan, 1) is not null then
    raise notice 'TABLAS QUE NO EXISTEN Y SE SALTARON: %. Si alguna deberia existir, buscala en el panel: puede tener otro nombre y estar abierta.', faltan;
  end if;
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
  for select to authenticated using (public.es_familia() and user_id = auth.uid());

create policy push_propia_insert on public.push_subscriptions
  for insert to authenticated with check (public.es_familia() and user_id = auth.uid());

create policy push_propia_update on public.push_subscriptions
  for update to authenticated using (public.es_familia() and user_id = auth.uid())
                              with check (public.es_familia() and user_id = auth.uid());

create policy push_propia_delete on public.push_subscriptions
  for delete to authenticated using (public.es_familia() and user_id = auth.uid());

-- Las filas viejas no tienen dueño, asi que nadie las ve ni las puede borrar,
-- pero siguen ocupando su endpoint y chocarian con el UNIQUE cuando el mismo
-- telefono vuelva a registrarse. Se limpian: cada quien se vuelve a suscribir
-- al abrir la aplicacion, y asi la fila nace ya con dueño.
delete from public.push_subscriptions where user_id is null;

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
-- ⚠️ DOS COSAS EN EL PANEL, SIN LAS CUALES ESTE ARCHIVO NO SIRVE
-- ════════════════════════════════════════════════════════════════════
--
-- 1. APAGAR EL ALTA PUBLICA. Authentication → Providers → Email →
--    «Allow new users to sign up»: APAGADO.
--    Sin esto, cualquiera con la clave publicable (que esta en el codigo
--    del navegador, correctamente) se crea una cuenta y obtiene un JWT
--    con rol authenticated. La funcion es_familia() lo detiene igual,
--    porque pregunta por el correo concreto, pero dejar el alta abierta
--    es dejar que desconocidos se registren en la casa. Se apaga.
--    Los cuatro usuarios se crean a mano en Authentication → Users.
--
-- 2. LA FUNCION DE NOTIFICACIONES USA LA CLAVE ANON.
--    supabase/functions/send-chat-push/index.ts lee push_subscriptions
--    con SUPABASE_ANON_KEY. En cuanto se encienda la seguridad por fila,
--    esa lectura devuelve CERO filas y no da error: las notificaciones
--    del chat dejan de llegar y nadie se entera de por que.
--    Hay que cambiarla a SUPABASE_SERVICE_ROLE_KEY, que salta la
--    seguridad por fila y es correcta ahi porque corre en el servidor y
--    nunca llega al navegador.
--
-- ════════════════════════════════════════════════════════════════════
-- LO QUE ESTE ARCHIVO SIGUE SIN CUBRIR
-- ════════════════════════════════════════════════════════════════════
-- a. LO DECLARADO NO ES LO APLICADO. Este repositorio dice lo que se
--    penso; la consulta de comprobacion de arriba dice lo que hay.
--    Manda la segunda: leela entera y busca filas con seguridad = false.
--    Si aparece una tabla que no esta en la lista del bloque 1, es una
--    tabla abierta que nadie recordaba.
--
-- b. LAS TABLAS antena_*. Ya tenian su seguridad encendida y sus ocho
--    politicas, atadas a la identidad propia de la Antena, que entra con
--    enlace magico y no es la de la familia. No se tocan aqui.
--
-- c. STORAGE. Cuando entre la boveda de documentos, sus depositos van
--    PRIVADOS y con sus propias politicas sobre storage.objects. Un
--    deposito publico es una carpeta abierta en internet, y ahi es donde
--    irian las partidas de nacimiento de las niñas.
