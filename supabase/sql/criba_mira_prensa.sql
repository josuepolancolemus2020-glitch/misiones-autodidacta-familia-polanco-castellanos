-- Ejecutar en Supabase -> SQL Editor. SOLO MIRA: no crea ni cambia nada.
-- ════════════════════════════════════════════════════════════════════
-- POR QUÉ LA PRENSA SALIÓ EN CERO
-- ════════════════════════════════════════════════════════════════════
-- Escrito el 30 de agosto de 2026, cuando la primera edición con prensa
-- dio `📰 Prensa 0 (cupo 9)`. Un cero ahí puede venir de tres sitios muy
-- distintos y confundirlos cuesta una tarde:
--
--   1. LOS CANALES NO CONTESTARON  → `fallo` con un 403, un timeout…
--   2. CONTESTARON Y NADA CASÓ     → `descartados` alto y `leidos` 0.
--      La criba funcionando de más: las palabras son muy estrechas.
--   3. EL CÓDIGO DESPLEGADO ES EL VIEJO → el parte no trae `clase` ni
--      `descartados` siquiera, porque esas dos claves nacieron con la
--      prensa. Se guardó todo SIN tema y la edición no puede usarlo:
--      exige tema a todo lo que no sea Honduras.
--
-- El tercero es el más traicionero, porque por fuera se ve igual que el
-- segundo: cero artículos y ninguna avería. Por eso la primera columna
-- del parte grita ⚠️ CÓDIGO VIEJO cuando falta la clave.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Qué hay guardado, por clase ──────────────────────────────────
-- `con_tema` es la columna que importa: un artículo de prensa sin tema
-- está en la tabla y NO puede entrar en ninguna edición.
select coalesce(f.clase, '?')                     as clase,
       count(*)                                   as en_la_tabla,
       count(i.tema_id)                           as con_tema,
       count(*) filter (where i.edicion is null)  as sin_usar
  from public.criba_items i
  join public.criba_fuentes f on f.id = i.fuente_id
 group by 1
 order by 1;

-- ── 2. Qué dijo cada canal de prensa ────────────────────────────────
-- Va el ÚLTIMO porque el editor solo enseña el resultado de la última
-- sentencia, y este es el parte que nombra la causa.
--
-- ⚠️ SE PREGUNTA A `criba_fuentes`, NO al buzón de pg_net. El
--    recolector apunta el resultado de cada fuente en su propia fila
--    (`ultimo_error`, `ultimo_intento_at`), y eso se queda escrito. El
--    buzón `net._http_response` lo comparte todo pg_net y antena-publicar
--    escribe ahí cada minuto: mirar allí es fiar el diagnóstico a que
--    nadie haya pasado por delante. Aquí no hace falta.
--
-- CÓMO SE LEE:
--   «trajo N y ninguno casó…»  → contestaron y las palabras son
--                                 demasiado estrechas. No es avería.
--   403 / 429 / timeout         → el canal no dejó entrar.
--   `intento` en blanco         → el recolector ni lo intentó: o está
--                                 apagada, o corre código anterior.
select id,
       to_char(ultimo_intento_at, 'HH24:MI') as intento,
       coalesce(ultimo_error,
                case when not activa then '⏸ apagada a propósito'
                     else '✅ sin error' end) as que_dijo
  from public.criba_fuentes
 where clase = 'prensa'
 -- Los que fallaron primero: son los que hay que leer.
 order by (ultimo_error is null), id;
