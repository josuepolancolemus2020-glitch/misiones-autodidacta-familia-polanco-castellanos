-- ════════════════════════════════════════════════════════════════════
-- F.A.R.O · PASO 1 de 2 · LA PUERTA (quien es de la casa)
-- ════════════════════════════════════════════════════════════════════
-- ESTE ARCHIVO ES SEGURO. No cambia ni un permiso de lo que ya funciona:
-- solo crea una tabla nueva y una funcion. La aplicacion sigue igual
-- mientras tanto, asi que se puede ejecutar sin miedo y a cualquier hora.
--
-- Que hace:
--   · crea familia_miembros, la tabla que dice quien es cada usuario;
--   · siembra las cuatro filas (HAY QUE EDITAR LOS CORREOS, abajo);
--   · crea es_familia(), que el paso 2 usara en todas sus politicas.
--
-- ORDEN, y por eso son dos archivos y no uno:
--   1. Se ejecuta ESTE, y tiene que decir «Los cuatro sembrados
--      correctamente».
--   2. Se publica la pantalla de entrada nueva y se comprueba que los
--      cuatro entran de verdad, cada uno en su aparato.
--   3. SOLO ENTONCES se ejecuta seguridad_familia_2_datos.sql, que es el
--      que de verdad cierra las tablas.
--
-- Al reves, la casa se queda sin luz: si se cierran las tablas antes de
-- que la puerta funcione, nadie de la familia puede leer ni escribir.
-- ════════════════════════════════════════════════════════════════════

begin;

-- ── 0. Quien es «de la casa» ───────────────────────────────────────
-- ⚠️ ESTA FUNCION ES EL CORAZON DEL ARCHIVO, y su ausencia era un agujero.
--
-- «to authenticated using (true)» NO significa «uno de los cuatro». Significa
-- «cualquiera con una sesion iniciada EN ESTE PROYECTO». Y como la clave
-- publicable va en el codigo del navegador (correctamente), cualquiera puede
-- llamar a /auth/v1/signup con su propio correo, recibir un JWT con rol
-- authenticated, y con el leer y escribir todo. No haria falta ni abrir la
-- aplicacion. La politica que parecia cerrar la casa la dejaba abierta a
-- cualquiera que supiera pedir una cuenta.
--
-- Por eso las politicas preguntan por el CORREO concreto, y no solo por tener
-- sesion. Y por eso hay que apagar el alta publica (ver la nota del final).

-- Quien es de la casa se guarda en una TABLA, no en una lista de correos
-- escrita en el codigo. Tres razones, y las tres pesan:
--   1. Los correos reales de la familia no tienen que vivir en el repositorio.
--   2. Sumar o quitar a alguien es una fila, no un cambio de codigo en dos
--      archivos que hay que acordarse de mantener iguales.
--   3. NO se usa user_metadata para esto: en Supabase el propio usuario puede
--      cambiarse sus metadatos con updateUser(), asi que decidir permisos con
--      eso es dejar que cada quien se ponga el sello que quiera.
create table if not exists public.familia_miembros (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  miembro  text not null unique
           check (miembro in ('josue', 'evelyn', 'jael', 'angelly')),
  creado   timestamptz not null default now()
);

alter table public.familia_miembros enable row level security;

-- Cada quien puede leer SU fila, que es como la aplicacion sabe quien entro.
-- Nadie puede escribir: las filas se siembran desde el panel, con el rol de
-- servicio. Si el propio usuario pudiera escribir aqui, se nombraria a si mismo.
drop policy if exists familia_miembros_propia on public.familia_miembros;
create policy familia_miembros_propia on public.familia_miembros
  for select to authenticated using (user_id = auth.uid());

create or replace function public.es_familia()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.familia_miembros where user_id = auth.uid()
  );
$$;

revoke all on function public.es_familia() from public, anon;
grant execute on function public.es_familia() to authenticated;

comment on function public.es_familia() is
  'Verdadero si quien pregunta tiene fila en familia_miembros. Sumar o quitar gente es insertar o borrar una fila, no tocar codigo.';

-- ── 0-bis. SEMBRAR LOS CUATRO ──────────────────────────────────────
-- ⚠️ ESTO HAY QUE EDITARLO ANTES DE EJECUTAR, y es lo unico del archivo que
-- pide escribir algo a mano. Pon el correo REAL con el que creaste cada
-- usuario en Authentication → Users. Los correos se escriben AQUI, en el
-- editor de Supabase, que es privado, y NO en el repositorio.
--
-- Si un correo no coincide con ningun usuario, esa persona no queda sembrada y
-- no podra entrar: el aviso del final lo dice por su nombre.

do $$
declare
  pares text[][] := array[
    -- ['correo real de la persona',        'id del miembro'],
    ['CAMBIAME-josue@ejemplo.com',          'josue'],
    ['CAMBIAME-evelyn@ejemplo.com',         'evelyn'],
    ['CAMBIAME-jael@ejemplo.com',           'jael'],
    ['CAMBIAME-angelly@ejemplo.com',        'angelly']
  ];
  i int;
  uid uuid;
  sin_usuario text[] := '{}';
begin
  for i in 1 .. array_length(pares, 1) loop
    select id into uid from auth.users where lower(email) = lower(pares[i][1]);
    if uid is null then
      sin_usuario := sin_usuario || pares[i][2];
      continue;
    end if;
    insert into public.familia_miembros (user_id, miembro)
    values (uid, pares[i][2])
    on conflict (miembro) do update set user_id = excluded.user_id;
  end loop;

  if array_length(sin_usuario, 1) is not null then
    raise warning 'NO SE SEMBRARON (no hay usuario con ese correo): %. Revisa Authentication -> Users y vuelve a correr este bloque, o esas personas NO podran entrar.', sin_usuario;
  else
    raise notice 'Los cuatro sembrados correctamente.';
  end if;
end $$;

commit;
