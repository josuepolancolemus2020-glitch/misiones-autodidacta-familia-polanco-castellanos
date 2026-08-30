-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de criba_afina4.sql.
-- IDEMPOTENTE. ⚠️ SÍ hace falta redesplegar la Edge Function después.
-- ════════════════════════════════════════════════════════════════════
-- LA SECCIÓN DE PRENSA — periodismo cultural y científico
-- ════════════════════════════════════════════════════════════════════
-- Pedido por el autor el 30 de agosto de 2026, junto con poner el mando
-- en 1 para ver las 18 materias.
--
-- POR QUÉ LA PRENSA ES UNA TERCERA CLASE Y NO MÁS DE LO MISMO:
--   Hasta ahora había dos formas de traer cosas y cada una tenía su
--   regla. La prensa no encaja en ninguna:
--
--     · CONSULTA (OpenAlex, Semantic Scholar, Europe PMC): se les
--       pregunta por cada tema, así que lo que llega ya viene filtrado.
--     · LOCAL (CNBS, SIECA, Bolsa): no se les pregunta, pero son
--       canales pequeños y ya temáticos: son su propio tema.
--     · PRENSA: no se les puede preguntar Y no son temáticos. Jot Down
--       publica sobre fútbol y sobre Bourdieu el mismo día.
--
--   Por eso la prensa se filtra DESPUÉS de traerla, con palabras. Y se
--   filtra en serio: lo que no case con ningún tema NO ENTRA. Un canal
--   de prensa sin filtro es la manguera de Dialnet otra vez, y esa
--   lección ya costó una edición entera de veterinaria.
--
-- POR QUÉ `palabras` NO ES LO MISMO QUE `termino`:
--   A OpenAlex se le pregunta `"cognitive bias"` porque indexa en inglés
--   y entiende comillas. A un periódico no se le pregunta nada: se le
--   lee el titular, y ahí lo que aparece es «sesgo cognitivo» o
--   «heurística». Son dos oficios distintos y por eso son dos columnas.
--
-- LAS DOCE QUE RESPONDIERON, de quince probadas por la sonda:
--   siete en español con resumen y cuatro en inglés. Nueva Sociedad no
--   responde, CTXT rechaza recolectores y SINC devuelve un canal vacío.
--   ⚠️ Y The Conversation «en español» sale en INGLÉS y sin resumen por
--   tercera vez: entra APAGADA, para que quede el rastro de que se
--   probó y por qué no sirve.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regclass('public.criba_temas') is null then
    raise exception E'FALTA public.criba_temas.\n'
      'QUE HACER: corre antes criba_temas.sql y los criba_afina*.sql.';
  end if;
end $$;

-- ── 1. Cada fuente sabe de qué clase es ─────────────────────────────
alter table public.criba_fuentes add column if not exists clase text;
update public.criba_fuentes
   set clase = case when plantilla is not null then 'consulta' else 'local' end
 where clase is null;
alter table public.criba_fuentes alter column clase set default 'local';
alter table public.criba_fuentes drop constraint if exists criba_fuentes_clase_check;
alter table public.criba_fuentes add constraint criba_fuentes_clase_check
  check (clase in ('consulta', 'local', 'prensa'));

-- ── 2. Las palabras con que se reconoce un tema en un titular ───────
alter table public.criba_temas add column if not exists palabras text;
comment on column public.criba_temas.palabras is
  'Palabras separadas por | con las que se reconoce este tema en un titular de prensa. Distinto de `termino`, que es lo que se le pregunta a una API academica.';

update public.criba_temas set palabras = v.p from (values
  ('metacognicion','metacognición|metacognition|aprender a aprender|autorregulación'),
  ('sesgo',        'sesgo cognitivo|sesgos cognitivos|cognitive bias|heurística|heuristic'),
  ('decisiones',   'toma de decisiones|decision making|bajo incertidumbre|teoría de la decisión'),
  ('neuroplast',   'neuroplasticidad|plasticidad cerebral|neuroplasticity'),
  ('procrastina',  'procrastinación|procrastination|dilación'),
  ('masas',        'psicología de masas|psicología de las multitudes|crowd psychology|comportamiento colectivo'),
  ('persuasion',   'persuasión|persuasion|propaganda|influencia social|social influence'),
  ('capitalismo',  'capitalismo|capitalism|financiarización|financialization|neoliberalismo'),
  ('marxismo',     'marxismo|marxism|lucha de clases'),
  ('ecopolitica',  'economía política|political economy|instituciones económicas'),
  ('finanzas',     'educación financiera|financial literacy|finanzas personales'),
  ('geopolitica',  'geopolítica|geopolitics|relaciones internacionales|hegemonía'),
  ('ideologias',   'ideología|ideology|polarización|populismo'),
  ('desigualdad',  'desigualdad|inequality|distribución de la riqueza'),
  ('desarrollo',   'desarrollo económico|development economics|economía del desarrollo'),
  ('metaciencia',  'metaciencia|metascience|integridad científica|research integrity'),
  ('replicacion',  'crisis de replicación|replication crisis|reproducibilidad|reproducibility'),
  ('retracciones', 'fraude científico|scientific misconduct|retractación|retraction')
) as v(id, p) where public.criba_temas.id = v.id;

-- ── 3. Las doce que respondieron ────────────────────────────────────
-- `peso` aquí es la confianza en la publicación, no el nivel de
-- evidencia: eso va aparte y para toda la prensa es «comentario»,
-- porque un ensayo excelente sigue sin ser un artículo revisado.
insert into public.criba_fuentes (id, nombre, racimo, url, clase, formato, idioma, peso, evidencia, activa) values
  ('prensa-letraslibres','Letras Libres','F·C','https://letraslibres.com/feed/','prensa','rss','es',55,'comentario',true),
  ('prensa-jotdown','Jot Down','F','https://www.jotdown.es/feed/','prensa','rss','es',45,'comentario',true),
  ('prensa-ethic','Ethic','A·C','https://ethic.es/feed/','prensa','rss','es',45,'comentario',true),
  ('prensa-filco','Filosofía&co','B·F','https://www.filco.es/feed/','prensa','rss','es',50,'comentario',true),
  ('prensa-nadaesgratis','Nada es Gratis','C','https://nadaesgratis.es/feed','prensa','rss','es',65,'comentario',true),
  ('prensa-elpais-ciencia','El País · Ciencia','A·G',
   'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/ciencia/portada','prensa','rss','es',55,'prensa',true),
  ('prensa-bbc-mundo','BBC News Mundo','C·G','https://feeds.bbci.co.uk/mundo/rss.xml','prensa','rss','es',50,'prensa',true),
  ('prensa-aeon','Aeon','A·B·F','https://aeon.co/feed.rss','prensa','rss','en',65,'comentario',true),
  ('prensa-jstordaily','JSTOR Daily','F·G','https://daily.jstor.org/feed/','prensa','rss','en',60,'comentario',true),
  ('prensa-quanta','Quanta Magazine','G','https://www.quantamagazine.org/feed/','prensa','rss','en',65,'comentario',true),
  ('prensa-nautilus','Nautilus','A·G','https://nautil.us/feed/','prensa','rss','en',55,'comentario',true),
  -- ⚠️ Apagada: responde bien pero publica en INGLÉS y sin resumen, por
  -- tercera vez comprobada. Se deja la fila para no volver a probarla.
  ('prensa-conversation-es','The Conversation (dice «es», publica en inglés)','A·C·G',
   'https://theconversation.com/es/articles.atom','prensa','atom','en',40,'comentario',false)
on conflict (id) do nothing;

-- ── 4. La edición, con cupo por clase ───────────────────────────────
-- ⚠️ POR QUÉ CUPO POR CLASE Y NO SOLO POR TEMA: un artículo de prensa y
-- uno académico pueden ser del MISMO tema. Con el tope por tema a secas
-- competirían entre ellos y la sección de prensa no existiría: la
-- academia pesa más y ganaría siempre. El cupo por clase es lo que hace
-- que «una sección» sea una sección y no un accidente estadístico.
create or replace function public.criba_arma_edicion(dia date default current_date,
                                                     tope integer default 30)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ya      integer;
  huecos  integer;
  puestos integer;

  /* ⚠️ EL MANDO, ahora en 1: cuántos artículos aporta cada materia
     DENTRO DE SU CLASE. Con 1, salen las 18 materias de ciencia y hasta
     18 de prensa. Subirlo a 2 da menos materias y más de cada una. */
  por_tema constant integer := 1;

  -- Cuánto ocupa cada sección del número. Suman 30.
  cupo_ciencia constant integer := 18;
  cupo_prensa  constant integer := 9;
  cupo_local   constant integer := 3;
begin
  dia := coalesce(dia, current_date);

  select count(*) into ya from public.criba_items where edicion = dia;
  huecos := greatest(tope - ya, 0);
  if huecos = 0 then return 0; end if;

  with unicos as (
    select distinct on (lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')))
           i.id, i.fuente_id, i.tema_id, i.publicado, i.recogido_at
      from public.criba_items i
     where i.edicion is null
     order by lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')), i.recogido_at
  ), con_clase as (
    select u.id, u.fuente_id, u.tema_id,
           coalesce(f.clase, 'local') as clase,
           coalesce(t.peso, f.peso) as peso,
           coalesce(u.publicado, u.recogido_at) as cuando
      from unicos u
      join public.criba_fuentes f on f.id = u.fuente_id
      left join public.criba_temas t on t.id = u.tema_id
     -- Ciencia y prensa exigen tema; lo local es su propio tema.
     where u.tema_id is not null or coalesce(f.clase, 'local') = 'local'
  ), ya_por_grupo as (
    -- Lo que ya está en la edición cuenta para el tope de su grupo.
    select coalesce(f2.clase, 'local') || ':' ||
           coalesce(i2.tema_id, 'fuente:' || i2.fuente_id) as grupo,
           count(*) as n
      from public.criba_items i2
      join public.criba_fuentes f2 on f2.id = i2.fuente_id
     where i2.edicion = dia
     group by 1
  ), reparte as (
    /* El tope por tema se cuenta DENTRO DE CADA CLASE: así el mismo
       tema puede dar un artículo académico y uno de prensa. */
    select c.*,
           coalesce(y.n, 0) + row_number() over (
             partition by c.clase || ':' || coalesce(c.tema_id, 'fuente:' || c.fuente_id)
             order by c.cuando desc) as n_tema
      from con_clase c
      left join ya_por_grupo y
             on y.grupo = c.clase || ':' || coalesce(c.tema_id, 'fuente:' || c.fuente_id)
  ), por_clase as (
    select *, row_number() over (partition by clase order by peso desc, cuando desc) as n_clase
      from reparte
     where n_tema <= por_tema
  ), elegidos as (
    select id, row_number() over (order by peso desc, cuando desc) + ya as n
      from por_clase
     where (clase = 'consulta' and n_clase <= cupo_ciencia)
        or (clase = 'prensa'   and n_clase <= cupo_prensa)
        or (clase = 'local'    and n_clase <= cupo_local)
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

-- ── 5. Rehacer la edición de hoy ────────────────────────────────────
update public.criba_items
   set edicion = null, orden = null
 where edicion = current_date and leido_at is null and not guardado;

select public.criba_arma_edicion() as puestos_rehechos;

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN, EN VERTICAL
-- ════════════════════════════════════════════════════════════════════
with c(orden, que, esperado, hay) as (
            select 1, 'columna clase', 'existe',
              case when exists (select 1 from information_schema.columns
                where table_schema='public' and table_name='criba_fuentes' and column_name='clase')
              then 'existe' else 'NO ESTÁ' end
  union all select 2, 'fuentes de prensa activas', '11',
              (select count(*)::text from public.criba_fuentes where clase='prensa' and activa)
  union all select 3, 'temas con palabras', '18',
              (select count(*)::text from public.criba_temas where palabras is not null)
  union all select 4, 'de ciencia en la edición', '(hasta 18)',
              (select count(*)::text from public.criba_items i join public.criba_fuentes f on f.id=i.fuente_id
                where i.edicion=current_date and f.clase='consulta')
  union all select 5, 'de prensa en la edición', '(0 hasta cosechar)',
              (select count(*)::text from public.criba_items i join public.criba_fuentes f on f.id=i.fuente_id
                where i.edicion=current_date and f.clase='prensa')
  union all select 6, 'de Honduras en la edición', '(hasta 3)',
              (select count(*)::text from public.criba_items i join public.criba_fuentes f on f.id=i.fuente_id
                where i.edicion=current_date and f.clase='local')
  union all select 7, 'materias distintas', '(15 o más)',
              (select count(distinct tema_id)::text from public.criba_items
                where edicion=current_date and tema_id is not null)
)
select case when hay = esperado or esperado like '(%' then '✅' else '❌' end as ok,
       que, esperado, hay from c order by orden;
