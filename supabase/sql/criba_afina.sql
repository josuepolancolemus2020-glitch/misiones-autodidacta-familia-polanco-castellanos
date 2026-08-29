-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de criba_temas.sql.
-- IDEMPOTENTE. NO hace falta volver a desplegar la Edge Function.
-- ════════════════════════════════════════════════════════════════════
-- AFINAR LA CRIBA — lo que enseñó la primera edición con malla
-- ════════════════════════════════════════════════════════════════════
-- La malla ya filtraba, pero la primera edición con temas trajo esto:
--
--   «Replication package for…», «MadBezoui/Robust-SIP-Portfolio: v1.0.6»
--   «The Immortalization Phenomenon», «Therapeutic Potential of Phages»
--   y dos títulos repetidos.
--
-- Tres causas, tres arreglos, y ninguno toca el recolector:
--
--  1. OPENALEX INDEXA MÁS QUE ARTÍCULOS. También datasets, software y
--     depósitos de Zenodo. Un release de GitHub no es un artículo. Se
--     añade `type:article` a la plantilla.
--
--  2. SE PEDÍAN PALABRAS, NO CONCEPTOS. El término era
--     `replication crisis reproducibility`, palabras sueltas, y
--     «replication» en biología es REPLICACIÓN CELULAR: de ahí los
--     fagos y la inmortalización celular bajo «La tesis y sus
--     negocios». Ahora los términos van ENTRECOMILLADOS, que es como se
--     le pide a un buscador un concepto y no un puñado de palabras.
--
--  3. GEMELOS CON DOI DISTINTO. La llave era DOI → dirección → título,
--     y el mismo trabajo con dos DOI (preprint y publicado) entraba dos
--     veces. Ahora la edición además descarta títulos repetidos.
--
-- Y de paso, el hueco que abrió la malla:
--
--  4. LAS FUENTES DE HONDURAS NO PODÍAN ENTRAR. CNBS, SIECA y la Bolsa
--     son de volcado: no se les pregunta nada, así que llegan sin tema,
--     y «sin tema no entra» las dejaba fuera para siempre. Justo la
--     CNBS, que es la pieza más útil de esa capa. La regla se afina: el
--     tema es obligatorio para las fuentes a las que SE PREGUNTA; una
--     fuente de volcado pequeña y ya temática es su propio tema.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regclass('public.criba_temas') is null then
    raise exception E'FALTA public.criba_temas.\n'
      'QUE HACER: corre antes supabase/sql/criba_temas.sql, y vuelve a pegar este archivo.';
  end if;
end $$;

-- ── 1. OpenAlex, solo artículos ─────────────────────────────────────
update public.criba_fuentes set plantilla =
  'https://api.openalex.org/works?per-page=8&sort=publication_date:desc&filter=type:article,from_publication_date:{desde},title_and_abstract.search:{q}'
 where id = 'openalex';

-- ── 2. Conceptos entrecomillados, no palabras sueltas ───────────────
-- Aquí sí es `update` y no `do nothing`: el objetivo del archivo es
-- justamente cambiar estos términos.
update public.criba_temas set termino = v.t from (values
  ('metacognicion', '"metacognition"'),
  ('sesgo',         '"cognitive bias"'),
  ('decisiones',    '"judgment and decision making"'),
  ('neuroplast',    '"neuroplasticity"'),
  ('procrastina',   '"procrastination"'),
  ('masas',         '"collective behavior"'),
  ('persuasion',    '"social influence"'),
  -- «financialization» es el término técnico de la crítica al
  -- capitalismo contemporánea. «critique of capitalism» en un buscador
  -- académico devuelve sobre todo reseñas de libros.
  ('capitalismo',   '"financialization"'),
  ('marxismo',      '"marxist theory"'),
  ('ecopolitica',   '"political economy"'),
  ('finanzas',      '"financial literacy"'),
  ('geopolitica',   '"geopolitics"'),
  ('ideologias',    '"political ideology"'),
  ('desigualdad',   '"income inequality"'),
  ('desarrollo',    '"development economics"'),
  ('metaciencia',   '"metascience"'),
  -- El que traía fagos y células inmortalizadas.
  ('replicacion',   '"replication crisis"'),
  ('retracciones',  '"scientific misconduct"')
) as v(id, t) where public.criba_temas.id = v.id;

-- ── 3 y 4. La edición: sin títulos repetidos, y con las de volcado ──
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
  por_fuente constant integer := 8;
begin
  dia := coalesce(dia, current_date);

  select count(*) into ya from public.criba_items where edicion = dia;
  huecos := greatest(tope - ya, 0);
  if huecos = 0 then return 0; end if;

  with unicos as (
    /* ⚠️ UN TÍTULO, UNA VEZ. El mismo trabajo llega con dos DOI —el del
       preprint y el del publicado— y la llave por DOI no los junta. Se
       comparan los títulos sin espacios ni signos, y se queda el que se
       recogió primero. */
    select distinct on (lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')))
           i.id, i.fuente_id, i.tema_id, i.publicado, i.recogido_at
      from public.criba_items i
     where i.edicion is null
     order by lower(regexp_replace(i.titulo, '[^a-zA-Z0-9]', '', 'g')), i.recogido_at
  ), candidatos as (
    select u.id,
           coalesce(t.peso, f.peso) as peso,
           coalesce(u.publicado, u.recogido_at) as cuando,
           row_number() over (
             partition by u.fuente_id
             order by coalesce(t.peso, f.peso) desc,
                      coalesce(u.publicado, u.recogido_at) desc
           ) as n_fuente
      from unicos u
      join public.criba_fuentes f on f.id = u.fuente_id
      left join public.criba_temas t on t.id = u.tema_id
     /* El tema es obligatorio para las fuentes a las que SE PREGUNTA.
        Una de volcado (sin plantilla) es su propio tema: es un canal
        pequeño y ya temático, como el de la CNBS. */
     where u.tema_id is not null or f.plantilla is null
  ), elegidos as (
    select id, row_number() over (order by peso desc, cuando desc) + ya as n
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

-- ── 5. Vaciar la edición de hoy para rehacerla con lo afinado ───────
-- Lo leído y lo guardado NO se toca: solo se despublica lo que no se
-- llegó a tocar, para que la edición se vuelva a armar limpia.
update public.criba_items
   set edicion = null, orden = null
 where edicion = current_date and leido_at is null and not guardado;

-- ════════════════════════════════════════════════════════════════════
-- LA COMPROBACIÓN, EN VERTICAL
-- ════════════════════════════════════════════════════════════════════
with c(orden, que, esperado, hay) as (
            select 1, 'OpenAlex pide solo artículos', 'sí',
              case when exists (select 1 from public.criba_fuentes
                where id='openalex' and plantilla like '%type:article%') then 'sí' else 'NO' end
  union all select 2, 'términos entrecomillados', '18',
              (select count(*)::text from public.criba_temas where termino like '"%"')
  union all select 3, 'el de la crisis de replicación', '"replication crisis"',
              (select termino from public.criba_temas where id='replicacion')
  union all select 4, 'edición de hoy vaciada', '0',
              (select count(*)::text from public.criba_items where edicion = current_date)
  union all select 5, 'esperando reparto', '(los que haya)',
              (select count(*)::text from public.criba_items where edicion is null)
)
select case when hay = esperado or esperado like '(%' then '✅' else '❌' end as ok,
       que, esperado, hay from c order by orden;
