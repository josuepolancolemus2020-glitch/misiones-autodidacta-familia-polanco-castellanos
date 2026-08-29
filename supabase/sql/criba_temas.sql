-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de supabase/sql/criba.sql.
-- Es IDEMPOTENTE: se puede correr varias veces sin dañar nada.
-- ════════════════════════════════════════════════════════════════════
-- LA MALLA DE LA CRIBA — LOS TEMAS, Y LAS FUENTES QUE SE PREGUNTAN
-- ════════════════════════════════════════════════════════════════════
-- POR QUÉ EXISTE ESTE ARCHIVO:
--   La primera edición de La Criba salió llena de veterinaria y
--   agronomía. El fallo fue de diseño y encadenado:
--
--     1. Se etiquetó la FUENTE con un racimo («Dialnet = A·C·G») en vez
--        de los artículos. Pero Dialnet publica TODO lo que se escribe
--        en español: derecho, agronomía, veterinaria. El racimo es una
--        propiedad del artículo, no del sitio de donde viene.
--     2. A Dialnet se le pidió su manguera entera (`ListRecords` sin
--        consulta), que devuelve lo que tenga en orden interno.
--     3. Y la edición se ordenó por peso de fuente. Dialnet pesa 70, o
--        sea que su manguera se comió la edición.
--
--   El error de fondo es uno solo: el perfil de intereses se dejó para
--   más adelante. En una criba, LA MALLA ES EL PRODUCTO. Lo de antes
--   era el marco sin la malla, con el nombre de la malla.
--
-- LO QUE CAMBIA:
--   · `criba_temas`: los términos por los que se pregunta, sacados de
--     las materias del Estudio Mayor. No es una lista inventada: son
--     las 14 materias de los tres racimos elegidos, comprobadas contra
--     js/data/misiones.js.
--   · `criba_fuentes.plantilla`: las fuentes de CONSULTA llevan una
--     dirección con un hueco `{q}`. Se les pregunta por cada tema, una
--     por una. Las de volcado (un canal pequeño y ya temático, como la
--     CNBS) siguen con su `url` fija y sin plantilla.
--   · `criba_items.tema_id`: qué tema encontró cada artículo. Sin eso no
--     se puede ordenar por lo que interesa ni saber por qué entró algo.
--   · La edición ahora SOLO reparte lo que casó con un tema, y con TOPE
--     POR FUENTE, para que ninguna se vuelva a comer el número.
--
-- ⚠️ DIALNET SE APAGA, y conviene saber por qué: su OAI no admite
--   búsqueda por texto, solo volcado. Una fuente a la que no se le puede
--   preguntar no sirve para un espacio de intereses; volverá si se le
--   encuentra una puerta con consulta.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regclass('public.criba_items') is null then
    raise exception E'FALTA public.criba_items.\n'
      'QUE HACER: corre antes supabase/sql/criba.sql entero, y vuelve a pegar este archivo.';
  end if;
end $$;

-- ── 1. Los temas ────────────────────────────────────────────────────
create table if not exists public.criba_temas (
  id        text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  racimo    text not null check (racimo in ('A', 'C', 'G')),
  -- La materia tal como se llama en js/data/misiones.js, para poder
  -- rastrear de qué ruta salió este tema sin adivinar.
  materia   text not null,
  -- Con qué se le pregunta a cada API. En inglés porque OpenAlex,
  -- Semantic Scholar y Europe PMC indexan en inglés: preguntar en
  -- español ahí devuelve casi nada, y lo poco que devuelve es ruido.
  termino   text not null check (length(termino) between 3 and 120),
  peso      smallint not null default 50 check (peso between 0 and 100),
  activo    boolean not null default true,
  creado_at timestamptz not null default now()
);

alter table public.criba_temas enable row level security;
revoke all on table public.criba_temas from anon;
revoke insert, update, delete on table public.criba_temas from authenticated;
drop policy if exists criba_temas_select on public.criba_temas;
create policy criba_temas_select on public.criba_temas
  for select to authenticated using (public.es_familia());
grant select on public.criba_temas to authenticated;

-- ── 2. Las fuentes aprenden a que se les pregunte ────────────────────
alter table public.criba_fuentes add column if not exists plantilla text;
comment on column public.criba_fuentes.plantilla is
  'Direccion con el hueco {q} para preguntar por un tema. Nula = fuente de volcado, se usa url tal cual.';

-- ── 3. Cada artículo sabe qué tema lo trajo ──────────────────────────
alter table public.criba_items add column if not exists tema_id text
  references public.criba_temas(id) on delete set null;
create index if not exists criba_items_tema_idx on public.criba_items (tema_id);

-- ── 4. Los temas: las 14 materias de los racimos A, C y G ───────────
-- ⚠️ `do nothing`: si se ajusta un término a mano, re-correr esto no
-- puede deshacerlo. Para cambiar un tema se hace un `update`.
insert into public.criba_temas (id, racimo, materia, termino, peso) values
  -- A · Mente y decisión
  ('metacognicion',  'A', 'Metacognición',                'metacognition', 70),
  ('sesgo',          'A', 'Sesgo cognitivo',              'cognitive bias', 80),
  ('decisiones',     'A', 'Toma de decisiones',           'judgment and decision making', 85),
  ('neuroplast',     'A', 'Neuroplasticidad',             'neuroplasticity', 60),
  ('procrastina',    'A', 'Ciencia de la Procrastinación','procrastination self-regulation', 55),
  ('masas',          'A', 'Psicología de masas',          'collective behavior crowd psychology', 55),
  ('persuasion',     'A', 'Psicología y Persuasión',      'persuasion social influence', 65),
  -- C · Economía, poder y el nicho
  ('capitalismo',    'C', 'Crítica al Capitalismo',       'critique of capitalism political economy', 75),
  ('marxismo',       'C', 'Crítica al Marxismo',          'marxism critique', 50),
  ('ecopolitica',    'C', 'Economía política',            'political economy institutions', 80),
  ('finanzas',       'C', 'Educación Financiera',         'household financial literacy', 70),
  ('geopolitica',    'C', 'Geopolítica',                  'geopolitics international relations', 65),
  ('ideologias',     'C', 'Estudio de las Ideologías',    'political ideology beliefs', 60),
  ('desigualdad',    'C', 'Crítica al Capitalismo',       'income inequality wealth distribution', 75),
  ('desarrollo',     'C', 'Economía política',            'development economics Latin America', 70),
  -- G · Método y metaciencia
  ('metaciencia',    'G', 'La tesis y sus negocios',      'metascience research integrity', 80),
  ('replicacion',    'G', 'La tesis y sus negocios',      'replication crisis reproducibility', 85),
  ('retracciones',   'G', 'Materialismo Filosófico',      'retraction scientific misconduct', 75)
on conflict (id) do nothing;

-- ── 5. Las fuentes de consulta ──────────────────────────────────────
-- El hueco {q} lo rellena el recolector con el término de cada tema.
insert into public.criba_fuentes (id, nombre, racimo, url, plantilla, formato, idioma, peso, evidencia) values
  ('openalex', 'OpenAlex', 'todos',
   'https://api.openalex.org/works',
   'https://api.openalex.org/works?per-page=8&sort=publication_date:desc&filter=from_publication_date:{desde},title_and_abstract.search:{q}',
   'json', 'en', 70, 'revisado'),

  ('semanticscholar', 'Semantic Scholar', 'todos',
   'https://api.semanticscholar.org/graph/v1/paper/search',
   'https://api.semanticscholar.org/graph/v1/paper/search?query={q}&limit=8&fields=title,abstract,externalIds,year,publicationDate,url',
   'json', 'en', 65, 'revisado'),

  ('europepmc', 'Europe PMC', 'A',
   'https://www.ebi.ac.uk/europepmc/webservices/rest/search',
   'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}&format=json&pageSize=8&resultType=core&sort=P_PDATE_D%20desc',
   'json', 'en', 70, 'revisado')
on conflict (id) do nothing;

-- Por si ya existían de una corrida anterior sin plantilla.
update public.criba_fuentes set plantilla =
  'https://api.openalex.org/works?per-page=8&sort=publication_date:desc&filter=from_publication_date:{desde},title_and_abstract.search:{q}'
 where id = 'openalex' and plantilla is null;
update public.criba_fuentes set plantilla =
  'https://api.semanticscholar.org/graph/v1/paper/search?query={q}&limit=8&fields=title,abstract,externalIds,year,publicationDate,url'
 where id = 'semanticscholar' and plantilla is null;
update public.criba_fuentes set plantilla =
  'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}&format=json&pageSize=8&resultType=core&sort=P_PDATE_D%20desc'
 where id = 'europepmc' and plantilla is null;

-- ⚠️ Dialnet se apaga: su OAI no admite búsqueda por texto, solo
-- volcado, y una fuente a la que no se le puede preguntar no sirve para
-- un espacio de intereses. Volverá si se le encuentra puerta con
-- consulta. NO se borra la fila: apagarla deja el rastro de por qué.
update public.criba_fuentes set activa = false where id = 'dialnet';

-- ── 6. Fuera lo que entró sin tema ──────────────────────────────────
-- Las 90 filas de la primera cosecha no casaron con ningún interés
-- porque nadie preguntó por ninguno. No es limpieza cosmética: mientras
-- estén, la edición las sigue repartiendo.
delete from public.criba_items where tema_id is null;

-- ── 7. La edición, ahora con malla y con tope por fuente ────────────
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
  -- ⚠️ Cuántos puede aportar UNA fuente a un mismo número. Sin esto,
  -- la fuente que más devuelve se come la edición entera: es
  -- exactamente lo que pasó el 29 de agosto de 2026 con Dialnet, que
  -- puso 60 de 90 y dejó el número en veterinaria.
  por_fuente constant integer := 8;
begin
  -- Un null explícito no usa el valor por omisión. Ver criba.sql.
  dia := coalesce(dia, current_date);

  select count(*) into ya from public.criba_items where edicion = dia;
  huecos := greatest(tope - ya, 0);
  if huecos = 0 then return 0; end if;

  with candidatos as (
    select i.id,
           row_number() over (
             partition by i.fuente_id
             order by t.peso desc, coalesce(i.publicado, i.recogido_at) desc
           ) as n_fuente,
           t.peso as peso_tema,
           coalesce(i.publicado, i.recogido_at) as cuando
      from public.criba_items i
      join public.criba_temas t on t.id = i.tema_id      -- ⚠️ SIN TEMA NO ENTRA
     where i.edicion is null
  ), elegidos as (
    select id, row_number() over (order by peso_tema desc, cuando desc) + ya as n
      from candidatos
     where n_fuente <= por_fuente
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
  'Reparte en la edicion del dia SOLO lo que caso con un tema, ordenado por peso del tema, y con tope por fuente para que ninguna se coma el numero.';

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN, EN VERTICAL (una fila por cosa)
-- ════════════════════════════════════════════════════════════════════
with n as (
  select
    (select count(*) from public.criba_temas)                                as temas,
    (select count(*) from public.criba_fuentes where plantilla is not null)  as consulta,
    (select count(*) from public.criba_fuentes where activa)                 as activas,
    (select count(*) from public.criba_items)                                as items,
    (select count(*) from public.criba_items where tema_id is null)          as sin_tema
), c(orden, que, esperado, hay) as (
            select 1, 'tabla criba_temas', 'existe',
              case when to_regclass('public.criba_temas') is null then 'NO ESTÁ' else 'existe' end from n
  union all select 2, 'temas sembrados',   '18',      temas::text     from n
  union all select 3, 'fuentes de consulta','3',      consulta::text  from n
  union all select 4, 'fuentes activas',   '6',       activas::text   from n
  union all select 5, 'columna plantilla', 'existe',
              case when exists (select 1 from information_schema.columns
                where table_schema='public' and table_name='criba_fuentes' and column_name='plantilla')
              then 'existe' else 'NO ESTÁ' end from n
  union all select 6, 'columna tema_id',   'existe',
              case when exists (select 1 from information_schema.columns
                where table_schema='public' and table_name='criba_items' and column_name='tema_id')
              then 'existe' else 'NO ESTÁ' end from n
  union all select 7, 'items sin tema',    '0',       sin_tema::text  from n
  union all select 8, 'items que quedan',  '(los que casen)', items::text from n
)
select case when hay = esperado or esperado like '(%' then '✅' else '❌' end as ok,
       que, esperado, hay
  from c order by orden;
