-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de criba_prensa.sql.
-- IDEMPOTENTE. ⚠️ SÍ hace falta redesplegar la Edge Function después.
-- ════════════════════════════════════════════════════════════════════
-- LAS PALABRAS DE LA PRENSA, ESCRITAS COMO ESCRIBE UN PERIODISTA
-- ════════════════════════════════════════════════════════════════════
-- El 30 de agosto de 2026 la primera edición con prensa dio CERO. La
-- causa inmediata fue otra -la cosecha no llegó a correr-, pero al
-- mirar estas listas quedó claro que aunque hubiera corrido habrían
-- dado casi cero igual.
--
-- QUÉ ESTABA MAL:
--   Las palabras eran las de la búsqueda académica: `crisis de
--   replicación`, `economía política`, `sesgo cognitivo`. Eso es lo que
--   se le pregunta a OpenAlex, que indexa por conceptos. Un titular de
--   Letras Libres o de Ethic NO dice eso nunca. Dice «desigualdad»,
--   «pobreza», «cerebro», «democracia». Se estaba filtrando prensa con
--   vocabulario de fichero.
--
-- EL CAMBIO DE CRITERIO, que es lo que hay que entender antes de tocar
-- estas listas:
--   La calidad NO la ponen las palabras: la ponen las doce fuentes.
--   Aeon, Quanta, JSTOR Daily, Letras Libres y Nada es Gratis no
--   publican basura. Las palabras solo tienen que hacer dos cosas:
--   decidir a qué materia va cada artículo y tirar lo que claramente no
--   viene a cuento -fútbol, famosos, sucesos-.
--   Por eso ahora son ANCHAS. Estrechas dejaban la sección vacía, que
--   es peor: una sección vacía no se distingue de una avería.
--
--   Y el desbordamiento no lo frenan las palabras, lo frenan los topes,
--   que ya están puestos: `por_tema = 1` dentro de cada clase y
--   `cupo_prensa = 9`. Aunque casaran doscientos artículos, entran 9.
--
-- ⚠️ ESTO VA DE LA MANO CON UN CAMBIO EN EL CÓDIGO. `temaDePrensa`
--   ahora casa AL PRINCIPIO DE UNA PALABRA, no en cualquier sitio. Sin
--   eso, media lista de aquí sería veneno: «arte» casaría dentro de
--   «parte» y de «martes», «ciencia» dentro de «conciencia», «paz»
--   dentro de «incapaz». Con eso, además, salen gratis los plurales:
--   «desigualdad» casa con «desigualdades». Si corres este archivo sin
--   redesplegar la función, la prensa entrará mal etiquetada.
--
-- ⚠️ Y GANA LA COINCIDENCIA MÁS LARGA, no la primera. Por eso se puede
--   poner «memoria» en neuroplasticidad y «memoria histórica» en
--   psicología de masas: un artículo sobre la Guerra Civil se va a
--   masas porque su coincidencia mide 17 letras y la otra 7. Es el
--   mecanismo con el que una palabra ancha convive con una precisa.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regclass('public.criba_temas') is null then
    raise exception E'FALTA public.criba_temas.\n'
      'QUE HACER: corre antes criba_temas.sql y criba_prensa.sql.';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'criba_temas'
                    and column_name = 'palabras') then
    raise exception E'FALTA la columna criba_temas.palabras.\n'
      'QUE HACER: corre antes criba_prensa.sql, que es donde nace.';
  end if;
end $$;

-- ── Las dieciocho listas ────────────────────────────────────────────
-- Se escriben CON tildes y con eñes: el código las quita en los dos
-- lados antes de comparar, así que aquí se escribe en español normal.
update public.criba_temas set palabras = v.p from (values

  -- ── Racimo A · cómo funciona la cabeza ────────────────────────────
  ('metacognicion',
   'metacognición|metacognition|aprender a aprender|hábitos de estudio|'
   'neuroeducación|cómo aprendemos|aprendizaje|estudiantes|pedagogía|'
   'enseñanza|educación|escuela|universidad'),

  ('sesgo',
   'sesgo cognitivo|sesgos cognitivos|cognitive bias|heurística|heuristic|'
   'sesgo|irracional|psicología cognitiva|falacia|pensamiento crítico|'
   'razonamiento|creencias'),

  ('decisiones',
   'toma de decisiones|decision making|teoría de la decisión|incertidumbre|'
   'riesgo|probabilidad|azar|estadística|elegir|juicio'),

  ('neuroplast',
   'neuroplasticidad|plasticidad cerebral|neuroplasticity|neurociencia|'
   'neuroscience|cerebro|brain|neurona|sinapsis|memoria|sueño|conciencia|'
   'mente'),

  ('procrastina',
   'procrastinación|procrastination|dilación|fuerza de voluntad|autocontrol|'
   'disciplina|hábitos|motivación|productividad personal|atención'),

  ('masas',
   'psicología de masas|psicología de las multitudes|crowd psychology|'
   'comportamiento colectivo|memoria histórica|identidad colectiva|'
   'multitud|masas|tribalismo|redes sociales|polarización'),

  ('persuasion',
   'persuasión|persuasion|propaganda|influencia social|desinformación|'
   'bulo|fake news|manipulación|retórica|publicidad|marketing|narrativa|'
   'censura'),

  -- ── Racimo C · cómo funciona el dinero y el poder ─────────────────
  ('capitalismo',
   'capitalismo|capitalism|neoliberalismo|financiarización|precariedad|'
   'explotación laboral|consumismo|mercantilización|monopolio|'
   'multinacional|sindicato|trabajo|empleo'),

  ('marxismo',
   'marxismo|marxism|marx|lucha de clases|socialismo|comunismo|'
   'clase obrera|plusvalía|revolución'),

  ('ecopolitica',
   'economía política|political economy|economía|inflación|banco central|'
   'política monetaria|impuestos|deuda pública|crecimiento económico|'
   'mercado laboral|salarios|instituciones|regulación'),

  ('finanzas',
   'educación financiera|financial literacy|finanzas personales|ahorro|'
   'invertir|inversión|interés compuesto|jubilación|presupuesto|crédito|'
   'bolsa de valores|criptomoneda|bitcoin|hipoteca|emprender'),

  ('geopolitica',
   'geopolítica|geopolitics|relaciones internacionales|hegemonía|guerra|'
   'conflicto armado|frontera|migración|sanciones|potencia|diplomacia|'
   'China|Rusia|OTAN|Unión Europea|América Latina|petróleo'),

  ('ideologias',
   'ideología|ideology|populismo|nacionalismo|autoritarismo|democracia|'
   'totalitarismo|extrema derecha|libertad de expresión|elecciones|'
   'partidos políticos|constitución'),

  ('desigualdad',
   'desigualdad|inequality|distribución de la riqueza|pobreza|clase social|'
   'movilidad social|brecha|salario mínimo|exclusión|redistribución|'
   'vivienda'),

  ('desarrollo',
   'desarrollo económico|development economics|economía del desarrollo|'
   'países en desarrollo|industrialización|infraestructura|corrupción|'
   'ayuda al desarrollo|América Central|Centroamérica|Honduras|remesas|'
   'informalidad'),

  -- ── Racimo G · cómo se sabe lo que se sabe ────────────────────────
  ('metaciencia',
   'metaciencia|metascience|integridad científica|research integrity|'
   'revisión por pares|peer review|revista científica|'
   'publicación científica|investigación|científicos|academia|'
   'método científico|ciencia|evidencia'),

  ('replicacion',
   'crisis de replicación|replication crisis|reproducibilidad|'
   'reproducibility|replicabilidad|p-hacking|significancia estadística|'
   'replicar|muestra pequeña|preregistro'),

  ('retracciones',
   'fraude científico|scientific misconduct|retractación|retraction|'
   'artículo retirado|plagio|datos falsos|mala conducta científica|'
   'revista depredadora|paper falso|falsificación')

) as v(id, p) where public.criba_temas.id = v.id;

-- ════════════════════════════════════════════════════════════════════
-- CÓMO SE COMPRUEBA QUE QUEDÓ PUESTO
-- ════════════════════════════════════════════════════════════════════
-- ⚠️ EN VERTICAL, una fila por cosa. En la tableta del autor una fila
--    ancha se corta y las últimas columnas caen fuera de pantalla.
select * from (
  select 1 as n, 'materias con palabras' as que,
         (select count(palabras)::text || ' de ' || count(*)::text
            from public.criba_temas) as valor

  union all select 2, 'palabras en total',
         (select count(*)::text
            from public.criba_temas t,
                 unnest(string_to_array(t.palabras, '|')) w)

  -- ⚠️ El código SALTA en silencio las de menos de 3 letras. Una lista
  --    con una palabra corta no da error: simplemente esa palabra no
  --    existe, y el tema casa menos de lo que su lista promete.
  union all select 3, 'la más corta (mínimo 3)',
         (select case when min(length(trim(w))) >= 3
                      then '✅ ' || min(length(trim(w)))::text || ' letras'
                      else '❌ ' || min(length(trim(w)))::text || ' letras: «' ||
                           (select trim(w2) from public.criba_temas t2,
                                  unnest(string_to_array(t2.palabras,'|')) w2
                             order by length(trim(w2)) limit 1) || '»' end
            from public.criba_temas t, unnest(string_to_array(t.palabras,'|')) w)

  union all select 4, 'la materia con menos palabras',
         (select t.id || ' (' || count(*)::text || ')'
            from public.criba_temas t,
                 unnest(string_to_array(t.palabras, '|')) w
           group by t.id order by count(*) limit 1)

  union all select 5, 'canales de prensa encendidos',
         (select count(*) filter (where activa)::text || ' de ' || count(*)::text
            from public.criba_fuentes where clase = 'prensa')

  /* Se lee del propio cuerpo de la función, con los espacios
     normalizados: escribir aquí «tiene que poner 1» y que la función
     dijera otra cosa sería una comprobación que miente. */
  union all select 6, 'el mando (por materia)',
         (select coalesce(substring(regexp_replace(prosrc, '\s+', ' ', 'g')
                                    from 'por_tema constant integer := (\d+)'),
                          '⚠️ no se pudo leer')
            from pg_proc where proname = 'criba_arma_edicion' limit 1)

  union all select 7, 'cupos ciencia/prensa/Honduras',
         (select coalesce(
                   substring(regexp_replace(prosrc,'\s+',' ','g')
                             from 'cupo_ciencia constant integer := (\d+)') || ' / ' ||
                   substring(regexp_replace(prosrc,'\s+',' ','g')
                             from 'cupo_prensa constant integer := (\d+)')  || ' / ' ||
                   substring(regexp_replace(prosrc,'\s+',' ','g')
                             from 'cupo_local constant integer := (\d+)'),
                   '⚠️ no se pudieron leer')
            from pg_proc where proname = 'criba_arma_edicion' limit 1)
) t order by n;
