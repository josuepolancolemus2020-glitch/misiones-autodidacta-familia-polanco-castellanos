/* ─────────────────────────────────────────────
   PRUEBA DEL INTÉRPRETE DE LA CRIBA

   Uso:  node --experimental-strip-types _dev/prueba-criba-normaliza.mjs

   Por qué existe: la Edge Function corre en Deno, y aquí no hay Deno.
   Pero lo que puede fallar de un recolector NO es el enchufe con
   Supabase: es cómo interpreta lo que le devuelven. Por eso esa parte
   vive en normaliza.ts, sin red y sin base, y se prueba desde Node.

   Los casos no son inventados: son las formas que devolvieron de verdad
   las fuentes que la sonda comprobó el 29 de agosto de 2026.
───────────────────────────────────────────── */
import * as N from '../supabase/functions/criba-cosecha/normaliza.ts';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const AQUI = dirname(fileURLToPath(import.meta.url));

let pasan = 0, fallos = 0;
const ok = (c, q) => { c ? (pasan++, console.log('  ✅ ' + q)) : (fallos++, console.log('  ❌ ' + q)); };

const F = (id, formato, evidencia = 'comentario', idioma = 'es') => ({ id, formato, idioma, evidencia });

/* ── Lo que devuelve la CNBS y la Bolsa: WordPress ── */
const RSS = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>CNBS</title>
  <description>Comisión Nacional de Bancos y Seguros</description>
  <language>es</language>
  <item>
    <title>Advertencia sobre entidades no autorizadas</title>
    <link>https://www.cnbs.gob.hn/2026/08/advertencia</link>
    <description><![CDATA[<p>La Comisi&oacute;n advierte que las siguientes entidades <b>no est&aacute;n autorizadas</b> para captar recursos del p&uacute;blico, y que operar con ellas no est&aacute; cubierto por ninguna garant&iacute;a.</p>]]></description>
    <pubDate>Thu, 28 Aug 2026 14:00:00 +0000</pubDate>
  </item>
  <item>
    <title>Solo un titular</title>
    <link>https://www.cnbs.gob.hn/2026/08/otro</link>
    <pubDate>Wed, 27 Aug 2026 09:00:00 +0000</pubDate>
  </item>
</channel></rss>`;

console.log('\n── RSS ──');
const rss = N.normaliza(RSS, F('cnbs', 'rss', 'trabajo'));
ok(rss.length === 2, 'saca los dos ítems');
ok(rss[0].titulo === 'Advertencia sobre entidades no autorizadas', 'el título, limpio');
ok(!rss[0].resumen.includes('<') && rss[0].resumen.includes('no están autorizadas'),
   '⚠️ el resumen sale del ÍTEM, sin etiquetas y con las entidades deshechas');
ok(!rss[0].resumen.includes('Comisión Nacional de Bancos y Seguros'),
   '⚠️ y NO se cuela la descripción del canal (el fallo que tuvo la sonda)');
ok(rss[0].publicado?.startsWith('2026-08-28'), 'la fecha del ítem');
ok(rss[1].resumen === '', 'un ítem sin resumen se queda vacío, no se inventa');

/* ── Lo que devuelve Dialnet: OAI-PMH ── */
const OAI = `<?xml version="1.0"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"><ListRecords>
 <record><metadata><oai_dc:dc xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Sesgos cognitivos en la toma de decisiones financieras</dc:title>
  <dc:description>Se revisan los principales sesgos que afectan a las decisiones de inversión de los hogares y se discuten las intervenciones que han mostrado algún efecto en estudios controlados.</dc:description>
  <dc:identifier>ISSN 1234-5678</dc:identifier>
  <dc:identifier>https://dialnet.unirioja.es/servlet/articulo?codigo=9012345</dc:identifier>
  <dc:date>2026-08-20</dc:date>
 </oai_dc:dc></metadata></record>
 <record><metadata><oai_dc:dc xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Sin dirección utilizable</dc:title>
  <dc:identifier>ISSN 0000-0000</dc:identifier>
 </oai_dc:dc></metadata></record>
</ListRecords></OAI-PMH>`;

console.log('\n── OAI-PMH (Dialnet) ──');
const oai = N.normaliza(OAI, F('dialnet', 'oai-pmh', 'revisado'));
ok(oai.length === 1, '⚠️ el registro SIN dirección utilizable se descarta, no se cuela');
ok(oai[0].url === 'https://dialnet.unirioja.es/servlet/articulo?codigo=9012345',
   'de varios dc:identifier elige el que es una dirección, no el ISSN');
ok(oai[0].resumen.startsWith('Se revisan'), 'la dc:description entra como resumen');
ok(oai[0].evidencia === 'revisado', 'hereda el nivel de evidencia de la fuente');

/* ── Atom ── */
const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom">
 <entry><title>Un artículo</title>
  <link rel="alternate" href="https://ejemplo.test/a"/>
  <summary>Un resumen suficientemente largo como para que valga la pena leerlo antes de abrir nada.</summary>
  <updated>2026-08-25T10:00:00Z</updated></entry>
</feed>`;
console.log('\n── Atom ──');
const at = N.normaliza(ATOM, F('x', 'atom'));
ok(at.length === 1 && at[0].url === 'https://ejemplo.test/a', 'la dirección sale del href del link');

/* ── JSON: las formas de OpenAlex, Crossref y Europe PMC ── */
console.log('\n── JSON ──');
const OPENALEX = JSON.stringify({ results: [{
  id: 'https://openalex.org/W4390123456',
  display_name: 'Cognitive load and financial decisions',
  doi: 'https://doi.org/10.1038/s41562-024-01234-5',
  publication_date: '2026-08-01', language: 'en' }] });
const oa = N.normaliza(OPENALEX, F('openalex', 'json', 'revisado', 'en'));
ok(oa.length === 1 && oa[0].doi === '10.1038/s41562-024-01234-5', 'OpenAlex: saca el DOI normalizado');

const CROSSREF = '{"message":{"items":[{"title":["Un trabajo"],"DOI":"10.5860\\/choice.195204","URL":"https:\\/\\/doi.org\\/10.5860\\/choice.195204"}]}}';
const cr = N.normaliza(CROSSREF.replace(/\\\//g, '/'), F('crossref', 'json', 'revisado', 'en'));
ok(cr.length === 1 && cr[0].doi === '10.5860/choice.195204', 'Crossref: título en array y DOI con barra escapada');

console.log('\n── El DOI, que es la llave contra gemelos ──');
ok(N.sacaDoi('{"DOI":"10.5860\\/choice.195204"}') === '10.5860/choice.195204',
   '⚠️ lo encuentra aunque venga con la barra escapada en JSON');
ok(N.sacaDoi('doi:10.1038/S41562-024-01234-5.') === '10.1038/s41562-024-01234-5',
   'lo pone en minúsculas y le quita el punto final');
ok(N.sacaDoi('no hay ninguno aquí') === null, 'no inventa uno donde no lo hay');
ok(N.claveDe('10.1/a', 'https://uno.test/x', 'T', 'dialnet')
   === N.claveDe('10.1/a', 'https://otro.test/y', 'T', 'openalex'),
   '⚠️ el mismo DOI por dos fuentes distintas da la MISMA clave: eso es lo que impide el gemelo');
ok(N.claveDe(null, 'https://uno.test/x', 'T', 'f').startsWith('url:'), 'sin DOI, la clave es la dirección');
ok(N.claveDe(null, 'javascript:x', 'Un título', 'f').startsWith('t:'), 'sin dirección buena, el título');

console.log('\n── La dirección: el mismo check que la columna ──');
for (const mala of ['javascript:alert(1)', 'JavaScript:alert(1)', 'https://a.hn/x" onmouseover="y',
                    "https://a.hn/x' onload='y", 'https://a.hn/<script>', 'https://a.hn/ con espacio',
                    'data:text/html,<script>', 'ftp://a.hn/x', 'https://a.hn/x\\y']) {
  ok(N.urlBuena(mala) === false, `rechaza ${mala.slice(0, 34)}`);
}
ok(N.urlBuena('https://www.cnbs.gob.hn/aviso?id=3&x=1') === true, 'y deja pasar una normal con parámetros');

const RSS_MALO = `<rss><channel><item><title>Trampa</title>
  <link>javascript:alert(document.cookie)</link>
  <description>Con una dirección que no debe existir.</description></item></channel></rss>`;
ok(N.normaliza(RSS_MALO, F('x', 'rss')).length === 0,
   '⚠️ un ítem con dirección peligrosa se cae AQUÍ, sin llegar a la base');

console.log('\n── El nivel de evidencia: la regla 1 ──');
ok(N.evidenciaDe('This is a preprint posted on bioRxiv', 'revisado') === 'preprint',
   '⚠️ un preprint BAJA aunque la fuente diga «revisado»');
ok(N.evidenciaDe('Documento de trabajo sobre remesas', 'revisado') === 'trabajo',
   'un documento de trabajo baja');
ok(N.evidenciaDe('Cochrane systematic review of exercise', 'comentario') === 'revision',
   'una revisión sistemática sube, que es la única señal que lo permite');
ok(N.evidenciaDe('Un título cualquiera sin señales', 'revisado') === 'revisado',
   'sin señales se queda con el de la fuente');
ok(N.evidenciaDe('Nota de prensa de la universidad', 'revisado') === 'prensa',
   'una nota de prensa baja: es la regla 2');
ok(N.evidenciaDe('x', 'nivel-inventado') === 'comentario',
   '⚠️ un nivel que no existe cae al más bajo, nunca al más alto');

console.log('\n── Sin gemelos dentro del mismo lote ──');
const REPE = `<rss><channel>
 <item><title>El mismo</title><link>https://a.test/1</link></item>
 <item><title>El mismo otra vez</title><link>https://a.test/1</link></item>
</channel></rss>`;
ok(N.normaliza(REPE, F('x', 'rss')).length === 1, 'dos ítems con la misma dirección salen como uno');

console.log('\n── Fechas ──');
ok(N.normaliza('<rss><channel><item><title>T</title><link>https://a.test/1</link><pubDate>no es fecha</pubDate></item></channel></rss>',
   F('x', 'rss'))[0].publicado === null, 'una fecha ilegible da nulo, no una inventada');

console.log('\n── Las entidades del español, que están en TODAS partes ──');
ok(N.limpia('no est&aacute;n autorizadas') === 'no están autorizadas',
   '⚠️ deshace &aacute; — sin esto, un canal en español sale ilegible');
ok(N.limpia('&iquest;Qui&eacute;n decide? &laquo;el mercado&raquo;') === '¿Quién decide? «el mercado»',
   'y &iquest; &eacute; y las comillas latinas');
ok(N.limpia('la Comisi&#243;n y el a&#xF1;o') === 'la Comisión y el año',
   'también en número, decimal y hexadecimal');
ok(N.limpia('&Aacute;lvarez y &aacute;lvarez') === 'Álvarez y álvarez',
   'respetando mayúsculas: &Aacute; no es &aacute;');
ok(N.limpia('&noexiste; queda igual') === '&noexiste; queda igual',
   'una entidad desconocida se deja como estaba, no se borra el texto');

console.log('\n── La prensa: qué entra y qué no ──');
{
  const TEMAS = [
    { id: 'sesgo',  termino_es: 'sesgo cognitivo|heuristica|sesgos' },
    { id: 'masas',  termino_es: 'psicologia de masas|comportamiento colectivo|multitud' },
    { id: 'capital',termino_es: 'capitalismo|financiarizacion|neoliberalismo' },
  ];
  const t = (ti, re = '') => N.temaDePrensa(ti, re, TEMAS);

  ok(t('Los sesgos cognitivos que arruinan tus decisiones') === 'sesgo',
     'un titular con «sesgo cognitivo» entra en su materia');
  ok(t('La metacognición del pulpo') === null,
     '⚠️ lo que no casa con NINGÚN tema NO entra: un canal de prensa sin filtro es la manguera otra vez');
  ok(t('El Real Madrid ficha a un delantero') === null,
     'el fútbol de Jot Down se queda fuera');
  ok(t('Un ensayo sobre la financiarización de la vivienda') === 'capital',
     'y lo que sí interesa del mismo canal, entra');

  // ⚠️ La coincidencia MÁS LARGA, no la primera de la lista.
  ok(t('Psicología de masas y comportamiento en la multitud') === 'masas',
     '⚠️ gana el término más largo, no el primero: si no, el orden de la tabla decide el tema');
  ok(N.temaDePrensa('Sobre el capitalismo tardío', '', [
       { id: 'corto', termino_es: 'ismo' },
       { id: 'largo', termino_es: 'capitalismo' }]) === 'largo',
     'y eso vale aunque el corto esté antes en la lista');

  ok(t('LOS SESGOS COGNITIVOS EN MAYÚSCULAS') === 'sesgo', 'no importan las mayúsculas');
  ok(t('La heurística de disponibilidad') === 'sesgo', '⚠️ ni las tildes: «heurística» casa con «heuristica»');
  ok(t('Nada', 'el resumen habla de capitalismo') === 'capital',
     'también mira el resumen, no solo el titular');
  ok(N.temaDePrensa('Cualquier cosa', '', [{ id: 'x', termino_es: 'ia' }]) === null,
     '⚠️ un término de dos letras se ignora: «ia» casa dentro de cualquier palabra');
  ok(N.temaDePrensa('Titulo', '', []) === null, 'sin temas configurados no entra nada');
}

console.log('\n── El recorte por fuente no puede matar temas ──');
/* ⚠️ La primera versión juntaba lo de todos los temas y cortaba a 60.
   Con 18 temas a 8 cada uno, el corte caía tras el séptimo: los temas de
   menos peso NO llegaban nunca a la base y en el diagnóstico salían como
   «trae 0», o sea, parecía que no existían artículos de «political
   ideology» cuando lo que pasaba es que se tiraban tras traerlos. */
{
  const N_TEMAS = 18, POR = 8;
  ok(N.topeDeFuente(true, N_TEMAS, POR) === N_TEMAS * POR,
     '⚠️ una fuente de consulta cabe entera: 18 temas × 8 = 144, no 60');
  ok(N.topeDeFuente(false, N_TEMAS, POR) === 60,
     'una de volcado sí lleva tope fijo: ahí no hay temas que repartir');
  ok(N.topeDeFuente(true, 0, POR) === POR, 'sin temas no devuelve cero (no se anularía la fuente)');

  // El caso de verdad: 18 temas con 8 cada uno, ninguno puede desaparecer.
  const lote = [];
  for (let t = 0; t < N_TEMAS; t++)
    for (let i = 0; i < POR; i++) lote.push({ tema_id: 't' + t, clave: 'c' + t + '-' + i });
  const recortado = lote.slice(0, N.topeDeFuente(true, N_TEMAS, POR));
  const vivos = new Set(recortado.map(x => x.tema_id));
  ok(vivos.size === N_TEMAS,
     `⚠️ los ${N_TEMAS} temas sobreviven al recorte (con el 60 de antes sobrevivían ${
       new Set(lote.slice(0, 60).map(x => x.tema_id)).size})`);
}

console.log('\n── El cosido de un archivo dice lo mismo que lo probado ──');
/* ⚠️ Esto es lo que impide desplegar un cosido viejo. La función se
   despliega desde el panel pegando PEGAR-EN-EL-PANEL.ts, que lo genera
   _dev/arma-criba-cosecha.js. Si alguien arregla normaliza.ts y no
   vuelve a coserlo, el fallo sigue vivo en lo que corre de verdad — y
   las pruebas de arriba seguirían en verde, que es lo peor. */
{
  const dir = join(AQUI, '..', 'supabase', 'functions', 'criba-cosecha');
  const cosido = join(dir, 'PEGAR-EN-EL-PANEL.ts');
  if (!existsSync(cosido)) {
    ok(false, 'falta PEGAR-EN-EL-PANEL.ts · corre: node _dev/arma-criba-cosecha.js');
  } else {
    const hecho = readFileSync(cosido, 'utf8');
    const mod = readFileSync(join(dir, 'normaliza.ts'), 'utf8')
      .replace(/^export (function|interface|type|const) /gm, '$1 ').trim();
    ok(hecho.includes(mod),
       '⚠️ el cosido lleva EXACTAMENTE el intérprete probado (si falla: node _dev/arma-criba-cosecha.js)');
    const idx = readFileSync(join(dir, 'index.ts'), 'utf8')
      .replace(/^import \{[^}]*\} from "\.\/normaliza\.ts";\s*$/m, '').trim();
    ok(hecho.includes(idx), 'y el recolector, igual de exacto');
    ok(!/^export /m.test(hecho), 'sin un `export` suelto, que en Deno sería un error de sintaxis');
  }
}

console.log('\n' + '─'.repeat(56));
console.log(`  ${pasan} pasan, ${fallos} fallan`);
console.log(fallos ? '  SUSPENDE' : '  APRUEBA');
process.exit(fallos ? 1 : 0);
