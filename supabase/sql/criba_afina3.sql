-- Ejecutar en Supabase -> SQL Editor. IDEMPOTENTE. No hace falta
-- volver a desplegar la Edge Function.
-- ════════════════════════════════════════════════════════════════════
-- QUITAR LA VENTANA DE 21 DÍAS: ESTRANGULABA LOS TEMAS
-- ════════════════════════════════════════════════════════════════════
-- La edición con tope por tema salió bien repartida, pero con solo TRES
-- materias distintas de 18, y ocho de sus veinte huecos llenos de avisos
-- de la CNBS.
--
-- La causa: la plantilla de OpenAlex pedía `from_publication_date` a 21
-- días. Con los términos ya entrecomillados y precisos, la mayoría de
-- las materias NO publican nada en tres semanas: «financialization» o
-- «marxist theory» no sacan un artículo nuevo cada mes. La ventana
-- estrangulaba justo a los temas más específicos, que son los buenos.
--
-- ⚠️ Y LA VENTANA NO HACÍA FALTA PARA NADA. La plantilla ya pide
-- `sort=publication_date:desc`, o sea que lo primero que devuelve es lo
-- más nuevo que exista. La fecha solo servía para EXCLUIR. Quitarla no
-- mete cosas viejas arriba: mete lo más nuevo de los temas que publican
-- despacio, que es exactamente lo que faltaba.
--
-- Es la tercera vez que un límite mío deja fuera lo que había que dejar
-- dentro -antes el tope por fuente, antes la regla del tema-, y las
-- tres veces el aviso fue el mismo: la edición salía corta y monótona.
-- ════════════════════════════════════════════════════════════════════

do $$ begin
  if to_regclass('public.criba_temas') is null then
    raise exception E'FALTA public.criba_temas.\n'
      'QUE HACER: corre antes criba_temas.sql, criba_afina.sql y criba_afina2.sql.';
  end if;
end $$;

update public.criba_fuentes set plantilla =
  'https://api.openalex.org/works?per-page=8&sort=publication_date:desc&filter=type:article,title_and_abstract.search:{q}'
 where id = 'openalex';

-- ════════════════════════════════════════════════════════════════════
-- Y EL DIAGNÓSTICO: qué temas traen material y cuáles no
-- ════════════════════════════════════════════════════════════════════
-- Va después de la próxima cosecha. Los que salgan en 0 son los que hay
-- que reescribir o apagar; los que traigan de sobra, los que funcionan.
select t.racimo,
       t.materia,
       t.termino,
       count(i.id) as trae
  from public.criba_temas t
  left join public.criba_items i on i.tema_id = t.id
 where t.activo
 group by t.racimo, t.materia, t.termino, t.id
 order by count(i.id) desc, t.racimo, t.materia;
