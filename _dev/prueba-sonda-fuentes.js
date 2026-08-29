/* ─────────────────────────────────────────────
   PRUEBA DE LA SONDA DE FUENTES

   Uso:  node _dev/prueba-sonda-fuentes.js

   Por qué existe: la sonda no se puede probar contra las fuentes de verdad
   desde una sesión de Claude Code (el proxy bloquea todo lo que no sea
   GitHub y los repositorios de paquetes). Pero lo que puede fallar de la
   sonda NO es la red: es que clasifique mal lo que le devuelvan —que llame
   «rss» a una página de error, que cuente ítems donde no los hay, o que dé
   por bueno un canal vacío—. Eso sí se puede probar, y aquí se prueba contra
   un servidor de mentira que devuelve las seis formas que se va a encontrar.

   Es la misma idea que _dev/postgrest-falso.js con la repisa de enlaces:
   un doble que se comporta como el de verdad en lo que importa.
───────────────────────────────────────────── */
'use strict';

const http = require('http');
const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { execFile } = require('child_process');
/* ⚠️ execFile ASÍNCRONO, nunca execFileSync: el servidor de mentira vive en
   ESTE proceso, y execFileSync bloquea el bucle de eventos —o sea, deja de
   atender—. La sonda hija veía «no responde» de un servidor que estaba
   levantado. Costó una corrida entera descubrirlo. */
const correr = (args) => new Promise((res, rej) =>
  execFile(process.execPath, args, (e, out, err) => e ? rej(new Error(err || out)) : res(out)));
const S = require('./sonda-fuentes.js');

let fallos = 0, pasan = 0;
const ok = (cond, qué) => { if (cond) { pasan++; console.log('  ✅ ' + qué); }
                            else { fallos++; console.log('  ❌ ' + qué); } };

/* ── Los dobles: lo que devuelven las fuentes de verdad ── */
const hoy = new Date();
const iso = d => new Date(hoy - d * 86400000).toISOString();

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="es">
  <title>Diario de mentira</title>
  <entry><title>La desigualdad en Honduras</title>
    <summary>Un análisis de los datos de la encuesta de hogares que muestra que la brecha entre los ingresos de la ciudad y del campo se ha ampliado durante los últimos cinco años en el país.</summary>
    <updated>${iso(0)}</updated><link href="https://ejemplo.test/1"/></entry>
  <entry><title>El nicho de la energía solar</title>
    <summary>Los estudios sectoriales de la región señalan que la demanda de instalaciones pequeñas para el hogar crece por encima de lo que la oferta local puede atender hoy.</summary>
    <updated>${iso(1)}</updated><link href="https://ejemplo.test/2"/></entry>
  <entry><title>Tres cosas que la nota de prensa no dijo</title>
    <summary>Cuando se compara el resumen que publicó la universidad con lo que dice el trabajo original, aparecen diferencias que cambian la conclusión por completo.</summary>
    <updated>${iso(3)}</updated><link href="https://ejemplo.test/3"/></entry>
</feed>`;

const RSS = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Boletín</title><language>es</language>
  <item><title>Programa monetario</title>
    <description>El banco central publicó las cifras del trimestre, con la balanza de pagos, las remesas recibidas y la inflación acumulada del período que termina.</description>
    <pubDate>${hoy.toUTCString()}</pubDate><guid>https://ejemplo.test/a</guid></item>
  <item><title>Revisión sistemática sobre memoria</title>
    <description>Se revisaron cuarenta ensayos y el efecto medio resultó bastante menor de lo que la literatura previa había venido informando durante la última década. doi:10.1002/14651858.CD000123</description>
    <pubDate>${new Date(hoy - 2 * 86400000).toUTCString()}</pubDate></item>
</channel></rss>`;

const JSON_API = JSON.stringify({ results: [
  { title: 'Cognitive load and decision quality',
    abstract: 'We report three preregistered experiments testing whether increased cognitive load reduces the quality of financial decisions among adults, and we find a consistent moderate effect across all three of the studies conducted.',
    doi: 'https://doi.org/10.1038/s41562-024-01234-5', publication_date: iso(1).slice(0, 10), language: 'en' },
  { title: 'Replication of the anchoring effect',
    abstract: 'A large multi-site replication of the classic anchoring paradigm, with more than four thousand participants recruited across eleven different laboratories in seven countries around the world.',
    doi: 'https://doi.org/10.1098/rsos.987654', publication_date: iso(4).slice(0, 10), language: 'en' } ] });

const OAI = `<?xml version="1.0"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"><ListRecords>
  <record><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Economía política del desarrollo</dc:title>
  <dc:description xmlns:dc="http://purl.org/dc/elements/1.1/">Este trabajo examina las condiciones bajo las cuales las políticas de desarrollo producen resultados distintos en países con instituciones parecidas pero historias diferentes.</dc:description>
  <dc:date xmlns:dc="http://purl.org/dc/elements/1.1/">${iso(5).slice(0, 10)}</dc:date></metadata></record>
  <record><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Segundo registro</dc:title></metadata></record>
</ListRecords></OAI-PMH>`;

const HTML_PORTADA = `<!doctype html><html lang="es"><head><title>Banco Central</title></head>
<body><h1>Bienvenido</h1><p>Aquí no hay ningún canal, solo la página de siempre con sus noticias en una tabla.</p></body></html>`;

/* Los cuatro de abajo salieron de la primera corrida de verdad. Cada uno
   reproduce un caso en que la sonda mintió, y por eso llevan comentario. */

// El canal se describe corto y el ÍTEM trae el resumen largo. La sonda medía
// el del canal y decía «no trae resumen» de Nada es Gratis, NBER, Retraction
// Watch y Data Colada, que sí lo traen.
const RSS_RESUMEN_EN_EL_ITEM = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Blog</title><description>Economía</description><language>es</language>
  <item><title>El presupuesto real</title>
    <description>Cuando se compara lo que el presupuesto aprobado dice que se va a gastar con lo que al final del año se ejecutó de verdad, aparecen diferencias que nadie discutió en su momento y que explican bastante de lo que pasó después.</description>
    <pubDate>${hoy.toUTCString()}</pubDate></item>
</channel></rss>`;

// Al revés: el canal se describe largo y los ítems van pelados. No debe
// contar como «trae resumen».
const RSS_RESUMEN_SOLO_EN_EL_CANAL = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Boletín</title>
  <description>Este boletín recoge cada semana las publicaciones más relevantes del sector y las comenta con detalle para quien no pueda seguirlas todas por su cuenta.</description>
  <item><title>Un titular pelado</title><pubDate>${hoy.toUTCString()}</pubDate></item>
</channel></rss>`;

// Se declara en inglés y publica en español: es lo que hizo
// theconversation.com/es/articles.atom, la fuente más importante de la Fase 1.
const DICE_EN_PARECE_ES = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en"><title>Diario</title>
  <entry><title>La deuda que no se ve</title>
    <summary>Los datos de la encuesta muestran que la mayor parte de los hogares que se endeudan para cubrir el gasto corriente no lo declaran como deuda cuando se les pregunta por ella de forma directa.</summary>
    <updated>${iso(0)}</updated></entry>
</feed>`;

// Ítems sin fecha, sin DOI y sin resumen: es lo que devolvió la dirección de
// SciELO que ganó —las 36 COLECCIONES, no artículos— y la sonda la aprobó.
const JSON_SIN_SENALES = JSON.stringify([
  { acron: 'scl', code: 'chl', name: 'Chile', status: 'certified' },
  { acron: 'mex', code: 'mex', name: 'México', status: 'certified' } ]);

const RUTAS = {
  '/rss-item': [200, 'application/rss+xml', RSS_RESUMEN_EN_EL_ITEM],
  '/rss-canal': [200, 'application/rss+xml', RSS_RESUMEN_SOLO_EN_EL_CANAL],
  '/sin-senales': [200, 'application/json', JSON_SIN_SENALES],
  '/429': [429, 'application/json', '{"error":"too many requests"}'],
  '/atom': [200, 'application/atom+xml', ATOM],
  '/rss': [200, 'application/rss+xml', RSS],
  '/json': [200, 'application/json', JSON_API],
  '/oai': [200, 'text/xml', OAI],
  '/portada': [200, 'text/html', HTML_PORTADA],   // responde, pero no es canal
  '/vacio': [200, 'application/rss+xml', '<?xml version="1.0"?><rss version="2.0"><channel><title>Nada</title></channel></rss>'],
  '/404': [404, 'text/plain', 'no está'],
  '/403': [403, 'text/plain', 'necesita clave'],
};

(async () => {
  const srv = http.createServer((req, res) => {
    const r = RUTAS[req.url.split('?')[0]];
    if (!r) { res.writeHead(404); return res.end('nada'); }
    res.writeHead(r[0], { 'Content-Type': r[1] });
    res.end(r[2]);
  });
  await new Promise(r => srv.listen(8127, r));
  const B = 'http://127.0.0.1:8127';

  console.log('\n── Clasificar la forma ──');
  ok(S.formatoDe(ATOM, 'application/atom+xml') === 'atom', 'un Atom se ve como atom');
  ok(S.formatoDe(RSS, 'application/rss+xml') === 'rss', 'un RSS se ve como rss');
  ok(S.formatoDe(JSON_API, 'application/json') === 'json', 'un JSON se ve como json');
  ok(S.formatoDe(OAI, 'text/xml') === 'oai-pmh', 'un OAI-PMH se ve como oai-pmh');
  ok(S.formatoDe(HTML_PORTADA, 'text/html') === 'html', 'una portada se ve como html, NO como canal');

  console.log('\n── Contar lo que trae ──');
  ok(S.contarItems(ATOM, 'atom') === 3, 'cuenta las 3 entradas del Atom');
  ok(S.contarItems(RSS, 'rss') === 2, 'cuenta los 2 ítems del RSS');
  ok(S.contarItems(JSON_API, 'json') === 2, 'cuenta los 2 resultados del JSON');
  ok(S.contarItems(OAI, 'oai-pmh') === 2, 'cuenta los 2 registros del OAI');
  ok(S.contarItems(HTML_PORTADA, 'html') === 0, 'una portada no tiene ítems');

  console.log('\n── ¿Trae resumen de verdad? ──');
  ok(S.traeResumen(ATOM, 'atom') === true, 've el <summary> largo del Atom');
  ok(S.traeResumen(RSS, 'rss') === true, 've la <description> larga del RSS');
  ok(S.traeResumen(JSON_API, 'json') === true, 've el abstract del JSON');
  ok(S.traeResumen(OAI, 'oai-pmh') === true, 've la dc:description del OAI');
  const SOLO_TITULO = '<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Solo el titular</title><summary>corto</summary></entry></feed>';
  ok(S.traeResumen(SOLO_TITULO, 'atom') === false, 'un resumen de tres palabras NO cuenta como resumen');
  ok(S.traeResumen(RSS_RESUMEN_EN_EL_ITEM, 'rss') === true,
     '⚠️ mide la <description> del ÍTEM, no la corta del canal');
  ok(S.traeResumen(RSS_RESUMEN_SOLO_EN_EL_CANAL, 'rss') === false,
     '⚠️ y no se deja engañar por un canal que se describe largo con ítems pelados');

  console.log('\n── DOI: sin él no se puede aplicar la regla 2 ──');
  ok(S.traeDoi(RSS) === true, 'encuentra el DOI de Cochrane en el RSS');
  ok(S.traeDoi(JSON_API) === true, 'encuentra los DOI del JSON');
  ok(S.traeDoi(ATOM) === false, 'no inventa un DOI donde no lo hay');
  // Crossref manda los DOI con la barra escapada. Sin deshacerla, la mayor
  // base de DOI del mundo salía marcada como «no trae DOI».
  ok(S.traeDoi('{"DOI":"10.5860\\/choice.195204"}') === true,
     '⚠️ encuentra el DOI aunque venga con la barra escapada en JSON');

  console.log('\n── Idioma ──');
  ok(S.idiomaDe(ATOM, 'atom') === 'es', 'lee el xml:lang="es" declarado');
  ok(S.idiomaDe(RSS, 'rss') === 'es', 'lee el <language>es</language>');
  const EN_SIN_DECLARAR = '<feed xmlns="http://www.w3.org/2005/Atom"><entry><summary>' +
    'The results of the study show that the effect of the intervention on the outcome ' +
    'was smaller than the authors of the original paper had expected from the pilot data.' +
    '</summary></entry></feed>';
  ok(S.idiomaDe(EN_SIN_DECLARAR, 'atom') === 'en~', 'adivina el inglés cuando el canal no lo declara, y lo marca con ~');
  ok(S.idiomaDe(DICE_EN_PARECE_ES, 'atom') === 'en\u26a0es',
     '⚠️ avisa cuando el canal se declara en un idioma y publica en otro');

  console.log('\n── Fechas y ritmo ──');
  const f = S.fechas(ATOM);
  ok(f.reciente && Math.abs(f.reciente - hoy) < 3 * 86400000, 'saca la fecha más reciente');
  ok(f.ritmo !== null && f.ritmo > 0, 'calcula un ritmo por día');
  ok(S.fechas('<feed><entry><title>sin fecha</title></entry></feed>').reciente === null, 'sin fechas no se inventa ninguna');

  console.log('\n── La sonda entera, contra el servidor de mentira ──');
  const r1 = await S.sondar({ id: 't1', nombre: 'Buena al primer intento', racimo: 'X', fase: 1, candidatos: [B + '/atom'] });
  ok(r1.veredicto === 'sirve' && r1.elegido.formato === 'atom', 'un canal bueno da «sirve»');

  const r2 = await S.sondar({ id: 't2', nombre: 'Buena al tercer intento', racimo: 'X', fase: 1,
                              candidatos: [B + '/404', B + '/portada', B + '/rss'] });
  ok(r2.veredicto === 'sirve' && r2.elegido.url.endsWith('/rss'), 'sigue probando candidatos hasta dar con el bueno');
  ok(r2.intentos.length === 3, 'y deja apuntado lo que probó por el camino');

  const r3 = await S.sondar({ id: 't3', nombre: 'Solo portada', racimo: 'C·HN', fase: 1, candidatos: [B + '/portada'] });
  ok(r3.veredicto === 'sin canal', '⚠️ una institución viva SIN canal da «sin canal», no «sirve»');

  const r4 = await S.sondar({ id: 't4', nombre: 'Muda', racimo: 'X', fase: 1, candidatos: ['http://127.0.0.1:8129/nada'] });
  ok(r4.veredicto === 'no responde', 'una fuente inalcanzable da «no responde», y no tumba la corrida');

  const r5 = await S.sondar({ id: 't5', nombre: 'Canal vacío', racimo: 'X', fase: 1, candidatos: [B + '/vacio'] });
  ok(r5.veredicto === 'sin canal', '⚠️ un RSS bien formado pero SIN ítems no se da por bueno');

  const r6 = await S.sondar({ id: 't6', nombre: 'Rechaza', racimo: 'X', fase: 1, candidatos: [B + '/403'] });
  ok(r6.veredicto === 'rechaza', 'un 403 da «rechaza recolectores», no «no responde»');
  ok(r6.intentos[0].clave === true, 'y queda marcado como que pide clave');

  const r7 = await S.sondar({ id: 't7', nombre: 'Con cola', racimo: 'X', fase: 1, candidatos: [B + '/429'] });
  ok(r7.veredicto === 'limitada', 'un 429 da «limitada»: hay cola, no es una fuente muerta');

  const r8 = await S.sondar({ id: 't8', nombre: 'No son artículos', racimo: 'X', fase: 1, candidatos: [B + '/sin-senales'] });
  ok(r8.veredicto === 'dudoso',
     '⚠️ ítems sin fecha, sin DOI y sin resumen dan «dudoso», NO «sirve» (el caso SciELO)');

  const r9 = await S.sondar({ id: 't9', nombre: 'Dudoso primero, bueno después', racimo: 'X', fase: 1,
                              candidatos: [B + '/sin-senales', B + '/rss-item'] });
  ok(r9.veredicto === 'sirve' && r9.elegido.url.endsWith('/rss-item'),
     'un «dudoso» no detiene la búsqueda: sigue hasta encontrar uno de verdad');

  console.log('\n── De punta a punta: que escriba el informe ──');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'criba-'));
  fs.writeFileSync(path.join(tmp, 'f.json'), JSON.stringify({ fuentes: [
    { id: 'a', nombre: 'Con canal', racimo: 'A', fase: 1, candidatos: [B + '/atom'] },
    { id: 'b', nombre: 'Sin canal', racimo: 'C·HN', fase: 1, candidatos: [B + '/portada'] },
    { id: 'c', nombre: 'Del núcleo', racimo: 'G', fase: 2, candidatos: [B + '/json'] } ] }));
  const md = path.join(tmp, 'SONDA.md');
  await correr([path.join(__dirname, 'sonda-fuentes.js'),
    '--fuentes', path.join(tmp, 'f.json'), '--json', path.join(tmp, 'r.json'), '--md', md]);
  const texto = fs.readFileSync(md, 'utf8');
  ok(/✅ Sirven \| \*\*2\*\*/.test(texto), 'el informe cuenta 2 que sirven');
  ok(/⚠️ Sin canal \| \*\*1\*\*/.test(texto), 'y 1 sin canal');
  ok(/### Fase 1/.test(texto) && /### Fase 2/.test(texto), 'separa Fase 1 de Fase 2');
  ok(/Sin canal.*sin canal/s.test(texto), 'nombra a la que se quedó sin canal, para que no se pierda');
  ok(JSON.parse(fs.readFileSync(path.join(tmp, 'r.json'), 'utf8')).resultados.length === 3, 'y deja el JSON para el recolector');
  fs.rmSync(tmp, { recursive: true, force: true });

  srv.close();
  console.log('\n' + '─'.repeat(56));
  console.log(`  ${pasan} pasan, ${fallos} fallan`);
  console.log(fallos ? '  SUSPENDE' : '  APRUEBA');
  process.exit(fallos ? 1 : 0);
})();
