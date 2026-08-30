-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea ni cambia nada,
-- así que se puede correr las veces que haga falta y a cualquier hora.
-- ════════════════════════════════════════════════════════════════════
-- CÓMO QUEDÓ LA EDICIÓN DE HOY
-- ════════════════════════════════════════════════════════════════════
-- POR QUÉ ESTE ARCHIVO EXISTE APARTE:
--   `criba_comprueba.sql` mira si la ESTRUCTURA quedó puesta (tablas,
--   columnas, políticas). Eso se comprueba una vez. Lo de aquí es otra
--   cosa y se mira cada día: qué trajo la cosecha y cómo se repartió el
--   número entre las tres secciones. Meterlo en el otro archivo
--   obligaría a releer cuatrocientas líneas de comprobación de tuberías
--   para leer seis cifras.
--
-- ⚠️ EN VERTICAL, una fila por cosa, por la razón de siempre: en la
--   tableta del autor una fila ancha se corta y las últimas columnas
--   —que son justo las que importan— caen fuera de pantalla.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Qué contestó el recolector ───────────────────────────────────
-- ⚠️ `net._http_response` es el buzón COMPARTIDO de todo pg_net, y
--    antena-publicar escribe ahí cada minuto. Por eso no vale mirar la
--    última fila: se filtra por una palabra que solo dice la Criba.
with cruda as (
  select content, created
    from net._http_response
   where content like '%edicion_de_hoy%'
   order by created desc
   limit 1
), r as (
  -- El cast va DESPUÉS del filtro y del limit a propósito: en el buzón
  -- hay respuestas que no son JSON y `content::jsonb` reventaría con
  -- ellas si el cast se hiciera antes de filtrar.
  select content::jsonb as j, created from cruda
)
select * from (
  select 1 as n, 'contestó a las' as que,
         coalesce(to_char((select created from r), 'HH24:MI'), '— TODAVÍA NO —') as valor
  union all select 2, 'fuentes que hablaron',
         coalesce((select jsonb_array_length(j->'fuentes') from r)::text, '—')
  union all select 3, 'fuentes con avería',
         coalesce((select j->>'con_fallo' from r), '—')
  union all select 4, 'artículos nuevos',
         coalesce((select sum(coalesce((e->>'nuevos')::int,0))::text
                     from r, jsonb_array_elements(j->'fuentes') e), '—')
  union all select 5, 'prensa descartada (no casó)',
         coalesce((select sum(coalesce((e->>'descartados')::int,0))::text
                     from r, jsonb_array_elements(j->'fuentes') e), '—')
  union all select 6, 'puestos en la edición',
         coalesce((select j->>'edicion_de_hoy' from r), '—')
) t order by n;

-- ── 2. Cómo se repartió el número ───────────────────────────────────
-- Va el ÚLTIMO porque el editor solo enseña el resultado de la última
-- sentencia, y esta es la que de verdad se quiere leer.
--
-- ⚠️ Se pregunta por la edición MÁS RECIENTE, no por `current_date`:
--    el servidor va en UTC y el autor en Honduras (UTC−6), así que a
--    partir de las 18:00 de allá «hoy» son dos días distintos.
with e as (
  select max(edicion) as dia from public.criba_items where edicion is not null
), x as (
  select i.tema_id, f.clase
    from public.criba_items i
    join public.criba_fuentes f on f.id = i.fuente_id
   where i.edicion = (select dia from e)
)
select * from (
  select 1 as n, 'edición del' as que,
         coalesce(to_char((select dia from e), 'DD/MM/YYYY'), '— NO HAY —') as valor
  union all select 2, 'en la edición',
         (select count(*) from x)::text || ' de 30'
  union all select 3, '🔬 Ciencia',
         (select count(*) from x where clase = 'consulta')::text || ' (cupo 18)'
  union all select 4, '📰 Prensa',
         (select count(*) from x where clase = 'prensa')::text || ' (cupo 9)'
  union all select 5, '🇭🇳 Honduras',
         (select count(*) from x where clase = 'local')::text || ' (cupo 3)'
  union all select 6, 'materias distintas',
         (select count(distinct tema_id) from x where tema_id is not null)::text || ' de 18'
  union all select 7, 'en la despensa (sin usar)',
         (select count(*) from public.criba_items where edicion is null)::text
) t order by n;
