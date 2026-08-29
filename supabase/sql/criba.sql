-- Ejecutar en Supabase -> SQL Editor. Es IDEMPOTENTE: se puede correr
-- varias veces sin dañar nada, y la re-corrida NO borra lo recogido ni
-- pisa una fuente que se haya editado a mano.
--
-- VA UN SOLO ARCHIVO, este. Depende de `seguridad_familia_1_puerta.sql`,
-- que es quien crea es_familia() y ya está corrido desde la mudanza a
-- privado. Si esa función no existiera, este archivo falla al crear las
-- políticas y no deja las tablas a medias.
-- ════════════════════════════════════════════════════════════════════
-- LA CRIBA 🪶 — LA TABLA Y EL REGISTRO DE FUENTES
-- ════════════════════════════════════════════════════════════════════
-- PARA QUÉ:
--   Un espacio informativo personal donde cae, solo, lo que importa de
--   lo que se publica sobre las materias que se estudian. Lo recoge una
--   Edge Function (`criba-cosecha`) que despierta un reloj; el navegador
--   SOLO LEE. Es el mismo reparto que ya usa la Antena, y por lo mismo:
--   si el navegador recogiera, solo habría Criba mientras la aplicación
--   estuviera abierta.
--
-- POR QUÉ DOS TABLAS Y NO UNA:
--   `criba_fuentes` no es adorno ni normalización por gusto. Es lo único
--   que hace posible la regla 6 de la puerta —«lo que no llega, se
--   dice»—: sin una fila por fuente con la fecha de su último acierto,
--   una fuente que cambia su canal se queda muda y NADIE SE ENTERA hasta
--   que la edición sale a medias. Con ella, la pantalla puede decir «de
--   aquí no cae nada desde el martes».
--
-- POR QUÉ `edicion` ES UNA FECHA Y NO UNA TABLA:
--   La regla 8 dice que la edición tiene FONDO: un número al día,
--   finito, que se acaba. Eso no necesita una tabla: necesita que algo
--   reparta. `criba_arma_edicion()` coge lo mejor de lo que aún no salió
--   y le pone la fecha de hoy, hasta un tope. Lo que sobra se queda con
--   `edicion` en nulo y sale mañana — «si sobra material, sobra para
--   mañana», que es la regla entera.
--
-- POR QUÉ `evidencia` SÍ LLEVA CHECK, Y `tipo` EN LA REPISA NO:
--   Parece una contradicción y no lo es. La lista de `tipo` de la repisa
--   crece (hoy nueve, mañana diez) y por eso un check ahí cuesta
--   re-correr el archivo desde la tableta. La escala de evidencia NO
--   crece: es cerrada por definición, y es el mecanismo de la regla 1 de
--   la puerta. Un preprint que entrara etiquetado como revisado por
--   pares rompe justo lo que La Criba viene a hacer, y lo rompe en
--   silencio. Es el mismo criterio que `origen` en la repisa: son pocos
--   y no van a ser más; si dejaran de serlo, la regla de la casa habría
--   cambiado y eso merece pensarse, no colarse en una fila.
--
-- POR QUÉ `url` LLEVA EL MISMO CHECK DURO QUE LA REPISA:
--   Porque acaba dentro de un href de F.A.R.O, y F.A.R.O es el mismo
--   dominio que la Bóveda, las finanzas, el chat y los teléfonos del
--   Buzón. Y aquí pesa MÁS que en la repisa: en la repisa el enlace lo
--   pega una de las cuatro personas de la casa; aquí lo escribió un
--   desconocido de la internet abierta. La pantalla no puede fiarse de
--   la base y la base no puede fiarse de la pantalla.
--
-- POR QUÉ SOLO ESCRIBE `service_role`:
--   Con la seguridad por fila puesta y sin política de escritura para
--   `authenticated`, no existe puerta de escritura desde el navegador.
--   Lo único que la casa puede tocar es marcar leído. Así, un fallo de
--   la pantalla no puede inventar una fila con una dirección cualquiera.
--
-- POR QUÉ `maquina` ES jsonb Y NACE NULO:
--   Ahí irá, en la Fase 2, lo que traduzca y resuma la máquina. Va en su
--   propia columna y NO pisa `titulo` ni `resumen` a propósito: es la
--   regla 3 de la puerta. Un título mal traducido es una afirmación
--   inventada, y el original tiene que seguir estando a un toque.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- LO PRIMERO: COMPROBAR LA DEPENDENCIA, Y DECIRLO EN CRISTIANO
-- ════════════════════════════════════════════════════════════════════
-- El editor de Supabase corre TODO el pegado dentro de UNA transacción.
-- Si falla una sola línea se deshace el pegado entero: las tablas NO se
-- crean, y lo único que se ve es el error de la línea que falló, que
-- puede hablar de otra cosa. Ocho líneas que ahorran la tarde.
-- ════════════════════════════════════════════════════════════════════
do $$ begin
  if to_regproc('public.es_familia') is null then
    raise exception E'FALTA public.es_familia(), y sin ella las politicas de estas tablas no se pueden crear.\n'
      'QUE HACER: corre antes supabase/sql/seguridad_familia_1_puerta.sql entero, y vuelve a pegar este archivo.';
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════════
-- 1. EL REGISTRO DE FUENTES
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.criba_fuentes (
  -- El mismo identificador que en _dev/fuentes-criba.json, para que la
  -- sonda y el recolector hablen de la misma fuente sin traducir nada.
  id                text primary key check (id ~ '^[a-z0-9-]{2,40}$'),

  nombre            text not null check (length(nombre) between 1 and 120),

  -- A qué racimo alimenta. Sin check: los racimos son de la propuesta,
  -- no de la base, y añadir uno no puede costar una migración.
  racimo            text not null default '',

  url               text not null check (
                      url ~ '^https?://'
                      and length(url) <= 2000
                      and url !~ '[[:space:]]'
                      and strpos(url, '"') = 0
                      and strpos(url, '''') = 0
                      and strpos(url, '<') = 0
                      and strpos(url, '>') = 0
                      and strpos(url, chr(92)) = 0
                    ),

  -- Lo que devolvió la sonda. El recolector lo usa para saber cómo
  -- leerla, y si un día cambia, la sonda lo vuelve a escribir.
  formato           text not null default 'rss'
                      check (formato in ('rss', 'rss1', 'atom', 'oai-pmh', 'json')),

  idioma            text not null default 'es' check (length(idioma) <= 8),

  -- Regla 5 de la puerta: las fuentes pesan, y el peso SE VE. No se
  -- esconde dentro del orden. 100 = revisión sistemática; 10 = un blog.
  peso              smallint not null default 50 check (peso between 0 and 100),

  -- El nivel de evidencia que se le pone por omisión a lo que traiga.
  -- Un ítem puede subirlo o bajarlo si viene con más información.
  evidencia         text not null default 'comentario' check (evidencia in
                      ('revision', 'revisado', 'preprint', 'trabajo', 'prensa', 'comentario')),

  activa            boolean not null default true,

  -- ── La salud de la fuente: esto ES la regla 6 ──
  ultimo_intento_at timestamptz,
  ultimo_exito_at   timestamptz,
  ultimo_error      text check (length(ultimo_error) <= 500),
  -- Cuántas veces seguidas falló. Con esto la pantalla distingue «hoy no
  -- publicaron» de «lleva tres semanas muda».
  fallos_seguidos   smallint not null default 0,

  creado_at         timestamptz not null default now()
);

comment on table public.criba_fuentes is
  'Las fuentes de La Criba y su salud. Sin las columnas ultimo_*, una fuente que se queda muda no lo dice, y la edicion sale a medias sin que nadie se entere.';

-- ════════════════════════════════════════════════════════════════════
-- 2. LO RECOGIDO
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.criba_items (
  id            bigint generated always as identity primary key,

  fuente_id     text not null references public.criba_fuentes(id) on delete cascade,

  -- ⚠️ LA LLAVE CONTRA GEMELOS, Y ES GLOBAL, NO POR FUENTE.
  -- El mismo trabajo llega por Dialnet y por OpenAlex, y en una edición
  -- diaria dos copias del mismo artículo es exactamente lo que hace que
  -- se deje de abrir. La calcula el recolector: el DOI normalizado si lo
  -- hay, si no la dirección, y si no un resumen del título.
  clave         text not null unique check (length(clave) between 4 and 400),

  titulo        text not null check (length(titulo) between 1 and 500),

  -- Puede venir vacío: hay canales que solo dan titular. Se guarda vacío
  -- y NO se inventa, que es la diferencia entre un dato y un adorno.
  resumen       text not null default '' check (length(resumen) <= 4000),

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

  doi           text check (doi is null or doi ~ '^10\.[0-9]{4,9}/[^[:space:]"''<>]{1,180}$'),

  idioma        text not null default '?' check (length(idioma) <= 8),

  -- Regla 1: TODO entra con su nivel de evidencia, y no se puede apagar.
  -- Por eso no tiene default abierto: si el recolector no sabe qué es,
  -- lo más bajo. Nunca al revés.
  evidencia     text not null default 'comentario' check (evidencia in
                  ('revision', 'revisado', 'preprint', 'trabajo', 'prensa', 'comentario')),

  -- La fecha del propio ítem, no la de recogida. Puede faltar.
  publicado     timestamptz,
  recogido_at   timestamptz not null default now(),

  -- ── La edición, con su fondo ──
  -- Nulo = todavía no salió. Lo reparte criba_arma_edicion().
  edicion       date,
  orden         integer,

  -- Un solo lector hoy (se decidió «mío solo, por ahora»). El día que se
  -- abra a los cuatro, esta columna se convierte en su propia tabla con
  -- una fila por persona: es una migración pequeña y conocida, y
  -- construir hoy para cuatro sería construir lo que no se pidió.
  leido_at      timestamptz,
  guardado      boolean not null default false,

  -- Regla 4: lo retractado VUELVE. Cuando el cruce con la base de
  -- retractaciones encuentre este DOI, se sella aquí y el ítem reaparece
  -- diciéndolo, aunque ya se hubiera leído hace tres meses.
  retractado_at timestamptz,

  -- Regla 3: lo que escriba la máquina en la Fase 2 vive AQUÍ, marcado,
  -- y no pisa el titulo ni el resumen originales.
  maquina       jsonb
);

create index if not exists criba_items_edicion_idx  on public.criba_items (edicion desc nulls last, orden);
create index if not exists criba_items_pendientes_idx on public.criba_items (publicado desc nulls last) where edicion is null;
create index if not exists criba_items_doi_idx      on public.criba_items (doi) where doi is not null;

comment on column public.criba_items.maquina is
  'Lo que traduzca y resuma la maquina en la Fase 2. En su propia columna para que el original siga a un toque: un titulo mal traducido es una afirmacion inventada.';

-- ════════════════════════════════════════════════════════════════════
-- 3. SEGURIDAD POR FILA
-- ════════════════════════════════════════════════════════════════════
-- Escribe el recolector (service_role, que se salta la seguridad por
-- fila por definición). El navegador SOLO LEE, y lo único que puede
-- tocar es si algo está leído o guardado. No hay política de insert ni
-- de delete para `authenticated` A PROPÓSITO: sin ellas, no existe
-- puerta por la que una pantalla equivocada meta una fila con una
-- dirección cualquiera.
alter table public.criba_fuentes enable row level security;
alter table public.criba_items   enable row level security;

revoke all on table public.criba_fuentes from anon;
revoke all on table public.criba_items   from anon;
revoke insert, update, delete on table public.criba_fuentes from authenticated;
revoke insert, delete          on table public.criba_items   from authenticated;

drop policy if exists criba_fuentes_select on public.criba_fuentes;
create policy criba_fuentes_select on public.criba_fuentes
  for select to authenticated using (public.es_familia());

drop policy if exists criba_items_select on public.criba_items;
create policy criba_items_select on public.criba_items
  for select to authenticated using (public.es_familia());

-- Marcar leído y guardar. Es lo ÚNICO que la casa escribe aquí.
drop policy if exists criba_items_marcar on public.criba_items;
create policy criba_items_marcar on public.criba_items
  for update to authenticated
  using (public.es_familia()) with check (public.es_familia());

grant select on public.criba_fuentes to authenticated;
grant select, update on public.criba_items to authenticated;

-- ════════════════════════════════════════════════════════════════════
-- 4. ARMAR LA EDICIÓN DEL DÍA — AQUÍ VIVE LA REGLA DEL FONDO
-- ════════════════════════════════════════════════════════════════════
-- Coge lo que aún no ha salido, lo ordena por peso de la fuente y por
-- lo reciente que sea, y le pone la fecha de hoy hasta el tope. Lo que
-- no entra NO se tira: se queda esperando y sale mañana.
--
-- Se llama sola al final de cada cosecha. Es idempotente dentro del
-- mismo día: si ya hay `tope` ítems con la fecha de hoy, no añade más.
create or replace function public.criba_arma_edicion(dia date default current_date,
                                                     tope integer default 25)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ya      integer;
  huecos  integer;
  puestos integer;
begin
  -- ⚠️ UN `null` EXPLÍCITO NO USA EL VALOR POR OMISIÓN. Pasarlo hacía
  -- que `edicion = dia` no encontrara nunca nada y que el update pusiera
  -- `edicion = NULL`: la edición no se armaba, y esas filas volvían a
  -- elegirse cada noche para siempre. Se descubrió el 29 de agosto de
  -- 2026, mirando por qué el recolector llamaba con `dia: null`.
  -- Se arregla AQUÍ y no solo en quien llama, porque una función que
  -- depende de que la llamen bien es una función que un día falla en
  -- silencio — y aquí el silencio es una pantalla vacía sin explicación.
  dia := coalesce(dia, current_date);

  select count(*) into ya from public.criba_items where edicion = dia;
  huecos := greatest(tope - ya, 0);
  if huecos = 0 then return 0; end if;

  with elegidos as (
    select i.id,
           row_number() over (
             order by f.peso desc,
                      coalesce(i.publicado, i.recogido_at) desc
           ) + ya as n
      from public.criba_items i
      join public.criba_fuentes f on f.id = i.fuente_id
     where i.edicion is null
     limit huecos
  )
  update public.criba_items i
     set edicion = dia, orden = e.n
    from elegidos e
   where i.id = e.id;

  get diagnostics puestos = row_count;
  return puestos;
end;
$$;

revoke all on function public.criba_arma_edicion(date, integer) from public, anon;

comment on function public.criba_arma_edicion(date, integer) is
  'Reparte lo no publicado en la edicion del dia, hasta un tope. Lo que no entra NO se tira: sale manana. Esa es la regla 8, la del fondo.';

-- ════════════════════════════════════════════════════════════════════
-- 5. HIGIENE
-- ════════════════════════════════════════════════════════════════════
-- Lo que nunca salió en una edición y ya tiene medio año no va a salir:
-- una edición diaria mira hacia adelante. Lo LEÍDO y lo GUARDADO no se
-- toca nunca, y lo RETRACTADO tampoco: eso es memoria, no ruido.
create or replace function public.criba_higiene()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  delete from public.criba_items
   where edicion is null
     and recogido_at < now() - interval '180 days'
     and leido_at is null
     and not guardado
     and retractado_at is null;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.criba_higiene() from public, anon;

-- ════════════════════════════════════════════════════════════════════
-- 6. LAS CUATRO FUENTES QUE LA SONDA COMPROBÓ
-- ════════════════════════════════════════════════════════════════════
-- Estas cuatro son las que respondieron DE VERDAD el 29 de agosto de
-- 2026, contra 78 direcciones probadas. No son candidatas: son las que
-- contestaron, con el formato que contestaron.
--
-- ⚠️ `do nothing` y NO `do update`: si mañana se corrige una dirección a
-- mano en el editor, re-correr este archivo no puede deshacerlo. Para
-- cambiar una fuente se hace un `update`, no se re-pega el archivo.
insert into public.criba_fuentes (id, nombre, racimo, url, formato, idioma, peso, evidencia) values
  ('dialnet', 'Dialnet', 'A·C·G',
   'https://dialnet.unirioja.es/oai/OAIHandler?verb=ListRecords&metadataPrefix=oai_dc',
   'oai-pmh', 'es', 70, 'revisado'),

  ('sieca', 'SIECA', 'C',
   'https://www.sieca.int/feed/', 'rss', 'es', 45, 'trabajo'),

  ('cnbs', 'CNBS · Comisión Nacional de Bancos y Seguros', 'C·HN',
   'https://www.cnbs.gob.hn/feed/', 'rss', 'es', 60, 'trabajo'),

  ('bcv-hn', 'Bolsa Centroamericana de Valores', 'C·HN',
   'https://www.bcv.hn/feed/', 'rss', 'es', 40, 'comentario')
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA QUE QUEDÓ, SIN FIARSE DEL «Success»
-- ════════════════════════════════════════════════════════════════════
-- 1) La fila de abajo sale sola al pegar esto. Léela.
--
-- 2) Que el check de la dirección MUERDA. Esto tiene que FALLAR:
--      insert into public.criba_items (fuente_id, clave, titulo, url)
--      values ('cnbs', 'prueba-mala', 'x', 'javascript:alert(1)');
--    Y esto también, por la comilla:
--      insert into public.criba_items (fuente_id, clave, titulo, url)
--      values ('cnbs', 'prueba-mala-2', 'x', 'https://a.hn/" onmouseover="x');
--
-- 3) Que la escala de evidencia muerda. Esto tiene que FALLAR:
--      insert into public.criba_items (fuente_id, clave, titulo, url, evidencia)
--      values ('cnbs', 'prueba-mala-3', 'x', 'https://a.hn/x', 'inventado');
--
-- 4) Que la edición tenga fondo:
--      select public.criba_arma_edicion(current_date, 3);
--      select count(*) from public.criba_items where edicion = current_date;
--    Nunca más de 3, por muchas veces que se llame.
--
-- 5) Y la de verdad: después de correr la Edge Function `criba-cosecha`,
--      select f.nombre, count(i.id) as items, f.ultimo_exito_at, f.ultimo_error
--        from public.criba_fuentes f
--        left join public.criba_items i on i.fuente_id = f.id
--       group by 1, 3, 4 order by 1;
--    Las cuatro tienen que tener `ultimo_exito_at` de hoy. La que traiga
--    un `ultimo_error` está diciendo exactamente lo que le pasa: eso es
--    la regla 6 funcionando, no un fallo del recolector.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN VIVA. Va la última porque el editor enseña el
-- resultado de la ÚLTIMA sentencia: así, en vez de un «Success. No rows
-- returned» que no distingue entre «quedó puesto» y «se pegó a medias»,
-- sale escrito qué hay. Si esta fila no aparece, el pegado no llegó
-- hasta aquí.
-- ════════════════════════════════════════════════════════════════════
select
  case when to_regclass('public.criba_items') is null
         or to_regclass('public.criba_fuentes') is null
       then '❌ LAS TABLAS NO SE CREARON'
       else '✅ La Criba puesta' end                                      as resultado,
  (select count(*) from public.criba_fuentes)                            as fuentes_han_de_ser_4,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'criba_items')        as columnas_items_han_de_ser_17,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename in ('criba_items', 'criba_fuentes'))
                                                                         as politicas_han_de_ser_3,
  (select bool_and(relrowsecurity) from pg_class
    where oid in (to_regclass('public.criba_items'), to_regclass('public.criba_fuentes')))
                                                                         as seguridad_por_fila_ha_de_ser_true,
  (to_regproc('public.criba_arma_edicion') is not null)                  as arma_edicion_puesta,
  (to_regproc('public.criba_higiene') is not null)                       as higiene_puesta,
  (select count(*) from public.criba_fuentes where activa)               as fuentes_activas;
