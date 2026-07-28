-- ════════════════════════════════════════════════════════════════════
-- F.A.R.O · LA BOVEDA · tabla, deposito privado y sus politicas
-- ════════════════════════════════════════════════════════════════════
-- Aqui van a vivir las partidas de nacimiento y las identidades de Jael
-- y de Angelly. Por eso en este archivo la seguridad manda sobre la
-- comodidad, y todo lo dudoso se resuelve del lado cerrado.
--
-- ORDEN. Este archivo va DESPUES de los otros dos y no funciona sin
-- ellos, porque todas sus politicas llaman a public.es_familia():
--   1. seguridad_familia_1_puerta.sql   (crea es_familia y la tabla de miembros)
--   2. seguridad_familia_2_datos.sql    (cierra las diez tablas de la casa)
--   3. ESTE
-- Si es_familia() no existe todavia, el bloque 0 se cae a proposito.
--
-- Que crea:
--   · public.documentos, la ficha de cada papel (que es, de quien, cuando
--     vence, quien lo subio y donde quedo el archivo);
--   · el deposito de Storage «documentos», PRIVADO;
--   · las cuatro politicas sobre storage.objects para ese deposito.
--
-- ⚠️ EL DEPOSITO VA PRIVADO, y no es un detalle de configuracion. Un
-- deposito publico en Supabase sirve cualquier objeto a quien tenga la
-- direccion, sin sesion, sin clave y sin dejar rastro. Seria una carpeta
-- abierta en internet con los documentos de dos niñas. Se sube y se baja
-- solo con enlaces firmados que caducan (createSignedUrl), nunca con
-- getPublicUrl.
--
-- ⚠️ NI UN «using (true)». «to authenticated» NO quiere decir «uno de los
-- cuatro»: quiere decir «cualquiera con sesion en este proyecto», y la
-- clave publicable va en el codigo del navegador porque asi se diseña.
-- Ese error ya costo una ronda entera en la tanda 2. Aqui todas las
-- politicas, las de la tabla y las de storage.objects, preguntan por
-- public.es_familia().
--
-- Es idempotente: se puede correr dos veces sin romper nada.
--
-- ⚠️ Y FALLA FUERTE. Todas las comprobaciones son «raise exception»
-- dentro de la transaccion, nunca «raise notice». En este proyecto ya
-- pasaron dos veces: el editor decia «Success» en verde, el aviso se
-- perdia entre la salida y la tabla se habia quedado vacia. Un notice
-- deja creer que algo se hizo. Si aqui algo no queda como debe, sale un
-- error rojo y NO se aplica nada.
-- ════════════════════════════════════════════════════════════════════

begin;

-- ── 0. Sin la puerta no hay boveda ─────────────────────────────────
-- Si alguien ejecuta este archivo antes que el paso 1, sin este bloque
-- las politicas se crearian igual (Postgres no valida la funcion hasta
-- usarla) y la boveda quedaria rota de una forma dificil de ver: las
-- consultas fallarian una por una en tiempo de ejecucion.

do $$
begin
  if to_regprocedure('public.es_familia()') is null then
    raise exception 'NO EXISTE public.es_familia(). Ejecuta primero seguridad_familia_1_puerta.sql y despues seguridad_familia_2_datos.sql. No se aplico nada.';
  end if;
end $$;

-- ── 1. La ficha de cada documento ──────────────────────────────────
-- El archivo vive en Storage; aqui vive lo que hay que poder buscar,
-- filtrar y avisar sin descargar nada.

create table if not exists public.documentos (
  -- uuid y no un contador: el id acaba en direcciones, en registros y en
  -- capturas de pantalla, y un contador le dice a cualquiera cuantos
  -- documentos tiene guardados la familia.
  id              uuid primary key default gen_random_uuid(),
  creado_at       timestamptz not null default now(),

  -- Quien lo subio. ON DELETE SET NULL y no CASCADE: si algun dia se
  -- borra una cuenta de Supabase, se pierde el dato de quien subio el
  -- papel, no el papel. Con CASCADE se borraria la partida de nacimiento
  -- de una niña por haber borrado una cuenta de correo.
  subido_por      uuid default auth.uid() references auth.users(id) on delete set null,

  -- De quien es el documento. Lista cerrada, los mismos identificadores
  -- que usa familia_miembros, mas «familia» para lo que es de la casa
  -- (escrituras, recibos del hogar).
  de_quien        text not null
                  check (de_quien in ('josue', 'evelyn', 'jael', 'angelly', 'familia')),

  titulo          text not null check (length(btrim(titulo)) > 0),

  -- Texto libre a proposito. Se penso ponerle lista cerrada como a
  -- de_quien, pero la interfaz y el SQL se escriben por separado: una
  -- lista que no coincida rompe las subidas con un error de restriccion
  -- que la familia no sabe leer. Los valores acordados con js/tools/boveda.js
  -- son: partida, identidad, titulo, licencia, escritura, recibo,
  -- medico, otro.
  tipo            text not null default 'otro' check (length(btrim(tipo)) > 0),

  emitido         date,
  vence           date,
  notas           text,

  -- ── el archivo ──
  -- Ruta dentro del deposito. UNIQUE para que dos fichas no apunten al
  -- mismo objeto: si apuntaran, borrar una dejaria a la otra colgando de
  -- un archivo que ya no esta.
  -- La convencion es «<uuid del usuario>/<marca de tiempo>-<nombre saneado>»,
  -- para que la ruta no se pueda adivinar. Las restricciones de abajo no
  -- imponen esa forma (seria atarse a la interfaz), solo cierran lo que
  -- nunca debe pasar: rutas absolutas y saltos de directorio.
  archivo_ruta    text not null unique
                  check (length(btrim(archivo_ruta)) > 0
                         and archivo_ruta not like '/%'
                         and archivo_ruta not like '%..%'),
  archivo_nombre  text not null check (length(btrim(archivo_nombre)) > 0),
  archivo_tipo    text,
  -- 10 MB, el mismo numero que el limite del deposito y el de la
  -- interfaz. La familia sube desde el telefono con datos escasos.
  archivo_bytes   bigint check (archivo_bytes is null
                                or (archivo_bytes > 0 and archivo_bytes <= 10485760)),

  -- Un documento no puede vencer antes de haberse emitido. Casi siempre
  -- es un dedazo al escribir el año.
  constraint documentos_fechas_coherentes
    check (vence is null or emitido is null or vence >= emitido)
);

-- Si la tabla ya existia de una version anterior y le falta algo, mejor
-- pararlo aqui que descubrirlo cuando la familia intente subir un papel.
--
-- Este bloque va ANTES de los «comment on» de abajo a proposito, y se
-- probo: con una tabla documentos vieja de dos columnas, los comment on
-- reventaban primero con «column archivo_ruta does not exist», que es un
-- error correcto (no se aplica nada) pero no dice que hacer. Puesto aqui,
-- el mensaje sale con la lista de lo que falta.
do $$
declare
  c text;
  faltan text[] := '{}';
begin
  foreach c in array array[
    'id', 'creado_at', 'subido_por', 'de_quien', 'titulo', 'tipo',
    'emitido', 'vence', 'notas',
    'archivo_ruta', 'archivo_nombre', 'archivo_tipo', 'archivo_bytes'
  ]
  loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'documentos' and column_name = c
    ) then
      faltan := faltan || c;
    end if;
  end loop;

  if array_length(faltan, 1) is not null then
    raise exception 'La tabla public.documentos ya existia y le faltan columnas: %. Revisala a mano antes de seguir: no se toca una tabla con datos a ciegas. No se aplico nada.', faltan;
  end if;
end $$;

comment on table public.documentos is
  'Fichas de los documentos personales de la familia. El archivo vive en el deposito privado «documentos» de Storage; aqui solo la ruta y los metadatos.';
comment on column public.documentos.archivo_ruta is
  'Ruta dentro del deposito privado «documentos». Convencion: <uuid del usuario>/<marca de tiempo>-<nombre saneado>, para que no se pueda adivinar.';
comment on column public.documentos.vence is
  'Nulo si el documento no caduca. La mitad de la utilidad de la boveda es avisar de lo que esta por vencer.';

-- Los dos ordenes que de verdad se piden: lo que vence primero, y lo
-- ultimo que se subio.
create index if not exists documentos_vence_idx
  on public.documentos (vence) where vence is not null;
create index if not exists documentos_creado_idx
  on public.documentos (creado_at desc);
create index if not exists documentos_de_quien_idx
  on public.documentos (de_quien);

-- ── 2. Seguridad por fila de la tabla ──────────────────────────────
-- Mismo criterio que la tanda 2: quien es de la casa puede todo, quien
-- no, nada. Para cuatro personas la politica correcta es la mas simple
-- que sirve; hilar fino aqui es inventar complejidad donde no hay
-- conflicto, y la complejidad es donde se cuelan los agujeros.

alter table public.documentos enable row level security;

drop policy if exists documentos_familia on public.documentos;
create policy documentos_familia on public.documentos
  for all
  to authenticated
  using (public.es_familia())
  with check (public.es_familia());

-- Cinturon y tirantes. Con la seguridad por fila encendida y sin
-- politica para anon, anon ya no ve nada; quitarle ademas el permiso de
-- tabla es la segunda cerradura, por si un dia alguien apaga la primera.
grant select, insert, update, delete on public.documentos to authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.documentos from anon';
  end if;
end $$;

-- ── 3. El deposito, PRIVADO ────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit)
values ('documentos', 'documentos', false, 10485760)
on conflict (id) do nothing;

-- «on conflict do nothing» solo por si mismo NO basta, y esta es la
-- trampa concreta: si el deposito ya existia y estaba PUBLICO (creado a
-- mano desde el panel, que es donde el interruptor viene marcado), el
-- insert no hace nada, el archivo termina sin errores y el deposito se
-- queda abierto. Por eso se corrige aparte.
update storage.buckets
   set public = false
 where id = 'documentos'
   and public is distinct from false;

-- El limite se aprieta, nunca se afloja: si alguien lo subio a mano en el
-- panel por una razon, este archivo no se la deshace; si esta suelto o
-- por encima de 10 MB, lo baja.
update storage.buckets
   set file_size_limit = 10485760
 where id = 'documentos'
   and (file_size_limit is null or file_size_limit > 10485760);

-- allowed_mime_types se deja NULO a proposito. Una lista blanca de tipos
-- parece mas segura y aqui no lo es: los telefonos suben HEIC, HEIF y
-- PDF escaneados con tipos raros, y el rechazo llega como un error del
-- servidor que la familia no sabe leer. La cerradura de este deposito no
-- es el tipo de archivo, es que nadie de fuera entra.

-- ── 4. Las politicas sobre storage.objects ─────────────────────────
-- Este es el punto donde mas facil es equivocarse, y hay dos razones:
--
-- 1. storage.objects es UNA SOLA tabla para TODOS los depositos del
--    proyecto. Una politica sin «bucket_id = 'documentos'» no protege la
--    boveda: abre o cierra todo lo demas de paso. Por eso las cuatro lo
--    llevan.
-- 2. No hay «create policy if not exists» en Postgres. Se borra y se
--    vuelve a crear, que ademas es lo que hace este archivo idempotente.
--
-- Las cuatro operaciones por separado, y no un «for all», porque en
-- storage.objects el reparto de using y with check no es simetrico:
-- select y delete solo miran filas que ya existen (using), insert solo
-- mira la fila nueva (with check), y update mira las dos. Escribirlas
-- juntas invita a olvidar el with check del insert, y sin with check el
-- insert queda abierto.
--
-- Si esto falla por permisos, storage.objects pertenece a
-- supabase_storage_admin: se ejecuta desde el SQL Editor del panel (que
-- corre como postgres y es miembro de ese rol) y no desde una conexion
-- cualquiera.

do $$
begin
  if to_regclass('storage.objects') is null then
    raise exception 'No existe storage.objects. ¿Esta habilitado Storage en este proyecto? No se aplico nada.';
  end if;

  -- Sin esto las cuatro politicas de abajo son decoracion: una tabla con
  -- la seguridad por fila apagada las ignora. Solo se toca si esta
  -- apagada, porque el «alter» pide ser dueño de la tabla y en un
  -- proyecto sano ya viene encendida.
  if not (select c.relrowsecurity from pg_class c where c.oid = 'storage.objects'::regclass) then
    execute 'alter table storage.objects enable row level security';
  end if;

  execute 'drop policy if exists documentos_storage_select on storage.objects';
  execute 'drop policy if exists documentos_storage_insert on storage.objects';
  execute 'drop policy if exists documentos_storage_update on storage.objects';
  execute 'drop policy if exists documentos_storage_delete on storage.objects';

  -- Ver y descargar. La descarga real va por enlace firmado desde la
  -- aplicacion, pero el enlace lo firma el servidor solo si esta politica
  -- deja ver el objeto.
  execute $pol$
    create policy documentos_storage_select on storage.objects
      for select
      to authenticated
      using (bucket_id = 'documentos' and public.es_familia())
  $pol$;

  -- Subir.
  execute $pol$
    create policy documentos_storage_insert on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'documentos' and public.es_familia())
  $pol$;

  -- Reemplazar (el «upsert» de Storage). El using dice que objeto se
  -- puede tocar; el with check impide que en el mismo movimiento se
  -- cambie el bucket_id y el archivo salga de la boveda a otro deposito.
  execute $pol$
    create policy documentos_storage_update on storage.objects
      for update
      to authenticated
      using (bucket_id = 'documentos' and public.es_familia())
      with check (bucket_id = 'documentos' and public.es_familia())
  $pol$;

  -- Borrar.
  execute $pol$
    create policy documentos_storage_delete on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'documentos' and public.es_familia())
  $pol$;

exception
  when insufficient_privilege then
    raise exception 'SIN PERMISO PARA TOCAR storage.objects (%). Ejecuta este archivo desde el SQL Editor del panel de Supabase, que corre como postgres. No se aplico nada.', sqlerrm;
end $$;

-- ── 5. Comprobar de verdad, y caerse si no ─────────────────────────
-- Todo lo de arriba pudo «ejecutarse bien» y dejar la boveda abierta: un
-- deposito que ya estaba publico, una politica que quedo sin es_familia,
-- la seguridad por fila apagada. Esto lo mira una por una y, si algo no
-- cuadra, tumba la transaccion entera. No se aplica media boveda.

do $$
declare
  deposito_publico boolean;
  cuantas int;
begin
  -- 5.1 el deposito existe y es privado
  select b.public into deposito_publico from storage.buckets b where b.id = 'documentos';
  if deposito_publico is null then
    raise exception 'No quedo creado el deposito «documentos». No se aplico nada.';
  end if;
  if deposito_publico then
    raise exception 'EL DEPOSITO «documentos» ESTA PUBLICO. Eso es una carpeta abierta en internet con los documentos de la familia. No se aplico nada.';
  end if;

  -- 5.2 la tabla, con seguridad por fila encendida
  if to_regclass('public.documentos') is null then
    raise exception 'No quedo creada la tabla public.documentos. No se aplico nada.';
  end if;
  if not (select c.relrowsecurity from pg_class c where c.oid = 'public.documentos'::regclass) then
    raise exception 'public.documentos quedo SIN seguridad por fila. Cualquiera con la clave publicable leeria las fichas. No se aplico nada.';
  end if;

  -- 5.3 storage.objects, con seguridad por fila encendida
  if not (select c.relrowsecurity from pg_class c where c.oid = 'storage.objects'::regclass) then
    raise exception 'storage.objects quedo SIN seguridad por fila: las cuatro politicas del deposito no sirven de nada. No se aplico nada.';
  end if;

  -- 5.4 la politica de la tabla: solo authenticated, y con es_familia en
  --     las dos mitades (using y with check).
  select count(*) into cuantas
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'documentos'
    and p.polname = 'documentos_familia'
    and not (0::oid = any (p.polroles))                       -- 0 es PUBLIC: seria para todo el mundo
    and exists (select 1 from pg_roles r
                where r.oid = any (p.polroles) and r.rolname = 'authenticated')
    and pg_get_expr(p.polqual, p.polrelid) like '%es_familia%'
    and pg_get_expr(p.polwithcheck, p.polrelid) like '%es_familia%';
  if cuantas <> 1 then
    raise exception 'La politica documentos_familia no quedo como debe (encontradas: % validas de 1). Tiene que ser «to authenticated using (public.es_familia()) with check (public.es_familia())». No se aplico nada.', cuantas;
  end if;

  -- 5.5 las cuatro de storage.objects: cada una con su bucket_id y su
  --     es_familia, y ninguna abierta a PUBLIC.
  select count(*) into cuantas
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'storage'
    and c.relname = 'objects'
    and p.polname in ('documentos_storage_select', 'documentos_storage_insert',
                      'documentos_storage_update', 'documentos_storage_delete')
    and not (0::oid = any (p.polroles))
    and exists (select 1 from pg_roles r
                where r.oid = any (p.polroles) and r.rolname = 'authenticated')
    and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' '
      || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) like '%es_familia%'
    and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' '
      || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) like '%bucket_id%';
  if cuantas <> 4 then
    raise exception 'Las politicas del deposito no quedaron como deben (validas: % de 4). Cada una necesita «bucket_id = ''documentos'' and public.es_familia()». No se aplico nada.', cuantas;
  end if;

  -- 5.6 ni un «using (true)», que es el error que ya costo una ronda.
  select count(*) into cuantas
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where ((n.nspname = 'public'  and c.relname = 'documentos')
      or (n.nspname = 'storage' and c.relname = 'objects'
          and p.polname like 'documentos_storage_%'))
    and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') = 'true'
      or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') = 'true');
  if cuantas > 0 then
    raise exception 'Hay % politica(s) de la boveda con la expresion «true». Eso no es «uno de los cuatro», es «cualquiera con sesion». No se aplico nada.', cuantas;
  end if;
end $$;

commit;

-- ════════════════════════════════════════════════════════════════════
-- COMPROBACION. Si el archivo llego hasta aqui sin error rojo, ya paso
-- las cinco pruebas de arriba. Esto es para leerlo con los ojos: cinco
-- lineas, todas tienen que decir BIEN.
-- ════════════════════════════════════════════════════════════════════

select * from (
  select 1 as n,
         'El deposito «documentos» existe y es PRIVADO' as que_se_comprueba,
         coalesce((select case when b.public then 'PUBLICO' else 'privado' end
                     from storage.buckets b where b.id = 'documentos'),
                  'NO EXISTE') as como_quedo,
         case when exists (select 1 from storage.buckets b
                            where b.id = 'documentos' and b.public = false)
              then 'BIEN' else 'MAL' end as veredicto

  union all
  select 2,
         'public.documentos tiene seguridad por fila',
         coalesce((select case when c.relrowsecurity then 'encendida' else 'APAGADA' end
                     from pg_class c
                     join pg_namespace nn on nn.oid = c.relnamespace
                    where nn.nspname = 'public' and c.relname = 'documentos'),
                  'NO EXISTE LA TABLA'),
         case when exists (select 1 from pg_class c
                             join pg_namespace nn on nn.oid = c.relnamespace
                            where nn.nspname = 'public' and c.relname = 'documentos'
                              and c.relrowsecurity)
              then 'BIEN' else 'MAL' end

  union all
  select 3,
         'storage.objects tiene seguridad por fila',
         (select case when c.relrowsecurity then 'encendida' else 'APAGADA' end
            from pg_class c where c.oid = 'storage.objects'::regclass),
         case when (select c.relrowsecurity from pg_class c
                     where c.oid = 'storage.objects'::regclass)
              then 'BIEN' else 'MAL' end

  union all
  select 4,
         'Las 4 politicas del deposito piden es_familia() y su bucket_id',
         (select count(*)::text || ' de 4'
            from pg_policy p
            join pg_class c on c.oid = p.polrelid
            join pg_namespace nn on nn.oid = c.relnamespace
           where nn.nspname = 'storage' and c.relname = 'objects'
             and p.polname like 'documentos_storage_%'
             and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' '
               || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) like '%es_familia%'
             and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' '
               || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) like '%bucket_id%'),
         case when (select count(*)
                      from pg_policy p
                      join pg_class c on c.oid = p.polrelid
                      join pg_namespace nn on nn.oid = c.relnamespace
                     where nn.nspname = 'storage' and c.relname = 'objects'
                       and p.polname like 'documentos_storage_%'
                       and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' '
                         || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) like '%es_familia%'
                       and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' '
                         || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) like '%bucket_id%') = 4
              then 'BIEN' else 'MAL' end

  union all
  select 5,
         'Ninguna politica de la boveda dice «true»',
         (select count(*)::text || ' con true'
            from pg_policy p
            join pg_class c on c.oid = p.polrelid
            join pg_namespace nn on nn.oid = c.relnamespace
           where ((nn.nspname = 'public'  and c.relname = 'documentos')
               or (nn.nspname = 'storage' and c.relname = 'objects'
                   and p.polname like 'documentos_storage_%'))
             and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') = 'true'
               or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') = 'true')),
         case when (select count(*)
                      from pg_policy p
                      join pg_class c on c.oid = p.polrelid
                      join pg_namespace nn on nn.oid = c.relnamespace
                     where ((nn.nspname = 'public'  and c.relname = 'documentos')
                         or (nn.nspname = 'storage' and c.relname = 'objects'
                             and p.polname like 'documentos_storage_%'))
                       and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') = 'true'
                         or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') = 'true')) = 0
              then 'BIEN' else 'MAL' end
) t
order by n;

-- Y esta, para leer las politicas con las propias palabras con que
-- quedaron guardadas. Lo declarado en este repositorio es lo que se
-- penso; esto es lo que hay. Manda lo segundo.

select
  n.nspname                                        as esquema,
  c.relname                                        as tabla,
  p.polname                                        as politica,
  case p.polcmd when 'r' then 'select'
                when 'a' then 'insert'
                when 'w' then 'update'
                when 'd' then 'delete'
                when '*' then 'all' end            as operacion,
  coalesce((select string_agg(r.rolname, ', ')
              from pg_roles r where r.oid = any (p.polroles)), 'PUBLIC (todos)') as para_quien,
  coalesce(pg_get_expr(p.polqual, p.polrelid), '(sin using)')          as using_,
  coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '(sin with check)') as with_check
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where (n.nspname = 'public'  and c.relname = 'documentos')
   or (n.nspname = 'storage' and c.relname = 'objects' and p.polname like 'documentos_storage_%')
order by c.relname, p.polname;

-- ════════════════════════════════════════════════════════════════════
-- LO QUE ESTE ARCHIVO NO PUEDE CUBRIR
-- ════════════════════════════════════════════════════════════════════
-- a. EL ALTA PUBLICA DE CUENTAS sigue pendiente en el panel
--    (Authentication → Providers → Email → «Allow new users to sign up»).
--    es_familia() detiene igual a quien se registre, porque pide fila en
--    familia_miembros, pero mientras siga abierta cualquiera puede
--    hacerse una cuenta en la casa. Se apaga.
--
-- b. OTROS DEPOSITOS. Estas politicas hablan solo del deposito
--    «documentos». Si el proyecto tiene otros, mirar uno por uno cual es
--    publico: se comprueba con
--        select id, public from storage.buckets order by id;
--
-- c. LA INTERFAZ TIENE QUE PONER SU PARTE. Del lado del navegador,
--    js/tools/boveda.js baja los archivos con createSignedUrl de 60
--    segundos y NUNCA con getPublicUrl. Con el deposito privado
--    getPublicUrl no falla: devuelve una direccion que da 400. Es decir,
--    el error se veria como «el archivo no abre», no como un aviso de
--    seguridad. Y si algun dia alguien pusiera el deposito en publico
--    para «arreglar» eso, esas direcciones quedarian abiertas para
--    siempre.
--
-- d. LOS ARCHIVOS HUERFANOS no los evita la base de datos. Si la subida
--    a Storage funciona y el insert de la fila falla, el objeto se queda
--    ahi sin ficha, invisible y ocupando espacio. Lo tiene que limpiar
--    la interfaz borrando el objeto cuando el insert falle. Para
--    buscarlos despues:
--        select o.name from storage.objects o
--        where o.bucket_id = 'documentos'
--          and not exists (select 1 from public.documentos d
--                          where d.archivo_ruta = o.name);
--
-- e. LAS COPIAS DE SEGURIDAD. Guardar las partidas de nacimiento solo
--    aqui es cambiar un riesgo por otro: si se pierde el proyecto de
--    Supabase, se perdieron. El original en papel sigue siendo el
--    original.
-- ════════════════════════════════════════════════════════════════════
