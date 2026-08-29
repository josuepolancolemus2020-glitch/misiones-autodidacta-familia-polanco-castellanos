/* ─────────────────────────────────────────────
   SONDA DE FUENTES · La Criba 🪶  (Fase 1, paso 1)

   Uso:  node _dev/sonda-fuentes.js
         node _dev/sonda-fuentes.js --fase 1
         node _dev/sonda-fuentes.js --id bch,cnbs,ine-hn

   Qué hace: pregunta a cada fuente de _dev/fuentes-criba.json y APUNTA lo que
   devolvió de verdad. No adivina. Escribe SONDA-FUENTES.md (para leer desde la
   tableta) y _dev/sonda-fuentes-resultado.json (para que lo lea el recolector
   de la Fase 2).

   ⚠️ POR QUÉ EXISTE ESTE ARCHIVO Y NO UNA TABLA ESCRITA A MANO:
   la lista de fuentes de la propuesta se armó de memoria, y de memoria nadie
   sabe si el Banco Central de Honduras tiene canal RSS. Escribir esa tabla
   sin preguntar sería mandar a alguien a construir un recolector contra
   direcciones inventadas. Es la misma razón por la que en esta casa el SQL se
   prueba contra un PostgreSQL de verdad antes de mandarlo.

   ⚠️ Y POR QUÉ CADA FUENTE LLEVA VARIOS CANDIDATOS:
   una institución pequeña puede tener el canal en /feed, en /rss, en /feed/ o
   en ningún sitio. La sonda los prueba en orden y se queda con el primero que
   sirva. Así la duda la resuelve la máquina una vez, en vez de quedar escrita
   a mano en un documento que envejece.

   No lleva dependencias a propósito: este repositorio no tiene compilación, y
   una sonda que hay que instalar es una sonda que no se corre.
───────────────────────────────────────────── */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
/* Configurables para que _dev/prueba-sonda-fuentes.js pueda correr la sonda
   entera contra un servidor de mentira sin pisar el informe de verdad. */
const opt = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const FUENTES  = path.resolve(opt('--fuentes', path.join(__dirname, 'fuentes-criba.json')));
const SALIDA_J = path.resolve(opt('--json',    path.join(__dirname, 'sonda-fuentes-resultado.json')));
const SALIDA_M = path.resolve(opt('--md',      path.join(RAIZ, 'SONDA-FUENTES.md')));

const TIEMPO_MAX = 25000;  // por candidato
const PAUSA      = 700;    // entre fuentes: se pregunta con educación, no en tromba
const MAX_CUERPO = 400000; // no descargar un repositorio entero por medir

/* El «polite pool» de Crossref y OpenAlex pide un correo y a cambio da una
   cola mejor. NO va escrito aquí: el correo del autor no se manda a servicios
   ajenos sin que él lo ponga. Si no está la variable, se pregunta igual y se
   apunta que no se usó la cola educada. */
const MAILTO = process.env.CRIBA_MAILTO || '';
const UA = 'FARO-LaCriba-sonda/1.0 (+https://github.com/josuepolancolemus2020-glitch/misiones-autodidacta-familia-polanco-castellanos)';

const dormir = ms => new Promise(r => setTimeout(r, ms));

/* ── Qué clase de cosa devolvió ── */
function formatoDe(cuerpo, tipoHttp) {
  const c = cuerpo.slice(0, 4000);
  if (/<feed[\s>]/i.test(c) && /w3\.org\/2005\/Atom/i.test(cuerpo.slice(0, 20000))) return 'atom';
  if (/<feed[\s>]/i.test(c)) return 'atom';
  if (/<rss[\s>]/i.test(c)) return 'rss';
  if (/<rdf:RDF/i.test(c) && /purl\.org\/rss/i.test(c)) return 'rss1';
  if (/<OAI-PMH[\s>]/i.test(c)) return 'oai-pmh';
  if (/^\s*[[{]/.test(c)) { try { JSON.parse(cuerpo); return 'json'; } catch (_) {} }
  if (/<html[\s>]/i.test(c) || /<!doctype html/i.test(c)) return 'html';
  return (tipoHttp || '?').split(';')[0] || '?';
}

/* ── Cuántas piezas trae ── */
function contarItems(cuerpo, formato) {
  if (formato === 'atom') return (cuerpo.match(/<entry[\s>]/gi) || []).length;
  if (formato === 'rss' || formato === 'rss1') return (cuerpo.match(/<item[\s>]/gi) || []).length;
  if (formato === 'oai-pmh') return (cuerpo.match(/<record[\s>]/gi) || []).length;
  if (formato === 'json') {
    try {
      const j = JSON.parse(cuerpo);
      for (const k of ['results', 'items', 'data', 'resultList', 'message']) {
        const v = j[k];
        if (Array.isArray(v)) return v.length;
        if (v && Array.isArray(v.items)) return v.items.length;
        if (v && Array.isArray(v.result)) return v.result.length;
      }
      if (Array.isArray(j)) return j.length;
    } catch (_) {}
  }
  return 0;
}

/* ── El primer ítem, aislado ──
   ⚠️ Hace falta porque en un RSS el primer <description> del documento es el
   del CANAL («Blog de economía»), no el del ítem. Medir ese decía «no trae
   resumen» de canales que sí lo traen: la sonda del 29 de agosto de 2026
   suspendió a Nada es Gratis, NBER, Retraction Watch y Data Colada por esto.
   Lo mismo vale para el idioma: la portada del canal está llena de texto de
   plantilla que no es lo que se va a leer. */
function primerItem(cuerpo, formato) {
  const et = formato === 'atom' ? 'entry' : (formato === 'oai-pmh' ? 'record' : 'item');
  const m = cuerpo.match(new RegExp('<' + et + '[\\s>][\\s\\S]*?</' + et + '>', 'i'));
  return m ? m[0] : '';
}

/* ── ¿Trae resumen, o solo titular? ──
   Importa mucho: sin resumen no se puede cribar sin abrir cada cosa, y la
   Fase 2 tendría que traducir a ciegas. */
function traeResumen(cuerpo, formato) {
  const dentro = primerItem(cuerpo, formato) || cuerpo;
  const largo = t => {
    const m = dentro.match(new RegExp('<' + t + '[^>]*>([\\s\\S]{0,4000}?)</' + t + '>', 'i'));
    if (!m) return 0;
    return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').trim().length;
  };
  if (formato === 'atom') return Math.max(largo('summary'), largo('content')) > 120;
  if (formato === 'rss' || formato === 'rss1') return Math.max(largo('description'), largo('content:encoded')) > 120;
  if (formato === 'oai-pmh') return largo('dc:description') > 120;
  if (formato === 'json') return /"(abstract|abstractText|summary|description|tldr)"\s*:\s*"[^"]{120,}/i.test(cuerpo)
                              || /"abstract_inverted_index"\s*:\s*\{/.test(cuerpo);
  return false;
}

/* ── ¿Trae DOI? ──
   Sin DOI no se puede aplicar la regla 2 (la nota de prensa no es el
   artículo) ni cruzar con la base de retractaciones. */
const traeDoi = cuerpo => /10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/.test(cuerpo);

/* ── ¿En qué idioma? ──
   ⚠️ Se comparan las DOS cosas —lo que el canal declara y lo que se ve— y si
   no coinciden se dice. Un canal puede declararse en un idioma y publicar en
   otro: `theconversation.com/es/articles.atom` se declaró `en` en la sonda del
   29 de agosto de 2026, y fiarse de lo declarado habría descartado la fuente
   más importante de la Fase 1 —o peor, habría metido inglés en una edición
   que se pidió en español—. Lo que decide es lo que se lee, no la etiqueta. */
function idiomaDe(cuerpo, formato) {
  const dec = cuerpo.match(/<language>\s*([a-z]{2})/i)
           || cuerpo.match(/xml:lang=["']([a-z]{2})/i)
           || cuerpo.match(/"lang(uage)?"\s*:\s*"([a-z]{2})/i);
  const declarado = dec ? (dec[2] || dec[1]).toLowerCase() : null;

  /* Se mira DENTRO del ítem: la portada del canal trae menús y pies de página
     que no son el texto que se va a leer. */
  const base = primerItem(cuerpo, formato) || cuerpo;
  const txt = ' ' + base.replace(/<[^>]+>/g, ' ').toLowerCase().slice(0, 60000) + ' ';
  const cuenta = ws => ws.reduce((a, w) => a + (txt.split(' ' + w + ' ').length - 1), 0);
  const es = cuenta(['de', 'la', 'que', 'los', 'para', 'con', 'una', 'del', 'por', 'se']);
  const en = cuenta(['the', 'of', 'and', 'for', 'with', 'that', 'from', 'this', 'are']);
  const visto = (es === 0 && en === 0) ? null : (es > en * 1.2 ? 'es' : (en > es * 1.2 ? 'en' : null));

  if (declarado && visto && declarado !== visto) return declarado + '\u26a0' + visto; // dice una, parece otra
  if (declarado) return declarado;
  return visto ? visto + '~' : '?';
}

/* ── ¿De cuándo es lo más nuevo, y a qué ritmo publica? ── */
function fechas(cuerpo) {
  const crudas = cuerpo.match(/<(updated|published|pubDate|dc:date|prism:publicationDate)>([^<]{6,40})</gi) || [];
  const ds = crudas.map(s => new Date(s.replace(/<[^>]*>/g, '').replace(/</g, '')))
                   .filter(d => !isNaN(d) && d.getFullYear() > 1990 && d.getFullYear() < 2100)
                   .sort((a, b) => b - a);
  if (!ds.length) return { reciente: null, ritmo: null };
  const reciente = ds[0];
  const dias = (reciente - ds[ds.length - 1]) / 86400000;
  return { reciente, ritmo: (ds.length > 2 && dias > 0.5) ? +(ds.length / dias).toFixed(1) : null };
}

/* ── Preguntarle a un candidato ── */
async function pedir(url) {
  let u = url;
  if (MAILTO && /api\.(openalex|crossref)\.org/.test(u)) {
    u += (u.includes('?') ? '&' : '?') + 'mailto=' + encodeURIComponent(MAILTO);
  }
  const t0 = Date.now();
  const res = await fetch(u, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIEMPO_MAX),
    headers: { 'User-Agent': UA, 'Accept': 'application/atom+xml, application/rss+xml, application/json, text/xml;q=0.9, */*;q=0.5' },
  });
  const buf = await res.arrayBuffer();
  const cuerpo = Buffer.from(buf.slice(0, MAX_CUERPO)).toString('utf8');
  return { res, cuerpo, ms: Date.now() - t0, urlFinal: res.url || u };
}

/* ── Una fuente: se prueban sus candidatos hasta que uno sirva ──

   Seis veredictos, y cada uno salió de un caso real de la sonda del 29 de
   agosto de 2026. Meterlos todos en «no sirve» habría borrado la diferencia
   entre trabajo pendiente y fuente muerta, que es justo lo que hay que saber:

     sirve        · hay canal y trae artículos
     dudoso       · responde con ítems, pero sin fecha, sin DOI y sin resumen.
                    Casi seguro NO son artículos. Lo destapó SciELO, cuya
                    dirección devolvía las 36 COLECCIONES de SciELO y la sonda
                    la daba por buena. Y sin fecha no hay edición diaria posible
     sin canal    · la institución está en pie y no publica canal legible
     rechaza      · 403: rechaza recolectores a propósito. NO se reintenta
                    disfrazándose de navegador: es una decisión del sitio, y lo
                    que hace falta saber es que hay que entrar por otra puerta
     limitada     · 429: hay cola. Se puede, yendo más despacio o con clave
     no responde  · muda
*/
async function sondar(f) {
  const intentos = [];
  let reserva = null;             // un «dudoso» guardado por si no aparece nada mejor
  let rechazo = false, limite = false;

  for (const url of f.candidatos) {
    try {
      const { res, cuerpo, ms, urlFinal } = await pedir(url);
      const formato = formatoDe(cuerpo, res.headers.get('content-type'));
      const items   = contarItems(cuerpo, formato);
      const util    = res.ok && items > 0 && formato !== 'html';
      const { reciente, ritmo } = fechas(cuerpo);
      if (res.status === 403) rechazo = true;
      if (res.status === 429) limite  = true;

      const intento = {
        url, urlFinal: urlFinal !== url ? urlFinal : null,
        estado: res.status, ms, formato, items,
        resumen: util ? traeResumen(cuerpo, formato) : false,
        doi:     util ? traeDoi(cuerpo) : false,
        idioma:  util ? idiomaDe(cuerpo, formato) : null,
        reciente: reciente ? reciente.toISOString().slice(0, 10) : null,
        ritmo, util,
        clave: res.status === 401 || res.status === 403,
      };
      intentos.push(intento);

      if (util) {
        /* Fecha, DOI o resumen: con ninguna de las tres, lo que devolvió no
           parece un artículo —y sin fecha no cabe en una edición diaria—. */
        const señales = (intento.resumen ? 1 : 0) + (intento.doi ? 1 : 0) + (intento.reciente ? 1 : 0);
        if (señales > 0) return { ...f, veredicto: 'sirve', elegido: intento, intentos };
        if (!reserva) reserva = intento;   // se guarda, pero se sigue buscando
      }
    } catch (e) {
      intentos.push({ url, error: String(e.message || e).slice(0, 160) });
    }
    await dormir(250);
  }

  if (reserva) return { ...f, veredicto: 'dudoso', elegido: reserva, intentos };
  if (limite)  return { ...f, veredicto: 'limitada', elegido: null, intentos };
  if (rechazo) return { ...f, veredicto: 'rechaza', elegido: null, intentos };
  const respondio = intentos.some(i => i.estado && i.estado < 400);
  return { ...f, veredicto: respondio ? 'sin canal' : 'no responde', elegido: null, intentos };
}

/* ── El informe que se lee desde la tableta ── */
function informe(rs, meta) {
  const sí = c => c ? '✅' : '·';
  const filas = rs.map(r => {
    const e = r.elegido;
    const ETIQ = { 'sin canal': '⚠️ sin canal', 'rechaza': '🚫 rechaza recolectores',
                   'limitada': '⏳ limitada (429)', 'no responde': '❌ no responde' };
    if (!e) return `| ${r.nombre} | ${r.racimo} | **${ETIQ[r.veredicto]}** | · | · | · | · | · |`;
    const marca = r.veredicto === 'dudoso' ? ' ⁉️' : '';
    return `| ${r.nombre}${marca} | ${r.racimo} | \`${e.formato}\`${marca} | ${e.items} | ${sí(e.resumen)} | ${sí(e.doi)} | ${e.idioma || '?'} | ${e.ritmo != null ? e.ritmo + '/día' : (e.reciente || '?')} |`;
  });
  const bloque = fase => {
    const sub = rs.filter(r => r.fase === fase);
    if (!sub.length) return '';
    const idx = r => rs.indexOf(r);
    return `\n### Fase ${fase}\n\n| Fuente | Racimo | Formato | Ítems | Resumen | DOI | Idioma | Ritmo |\n|---|---|---|---|---|---|---|---|\n`
      + sub.map(r => filas[idx(r)]).join('\n') + '\n';
  };
  const cuenta = v => rs.filter(r => r.veredicto === v);
  const sirven = cuenta('sirve'), sinc = cuenta('sin canal');

  const detalle = rs.filter(r => r.veredicto !== 'sirve').map(r =>
    `- **${r.nombre}** — ${r.veredicto}\n` + r.intentos.map(i =>
      `  - \`${i.url}\` → ${i.error ? '⚠️ ' + i.error : `${i.estado} · ${i.formato || '?'} · ${i.items || 0} ítems`}`).join('\n')
  ).join('\n');

  return `# Sonda de fuentes · La Criba 🪶

**${meta.fecha}** · ${rs.length} fuentes, ${meta.candidatos} direcciones candidatas probadas.
${MAILTO ? '' : '\n> ℹ️ Sin `CRIBA_MAILTO`: no se usó la cola educada de Crossref y OpenAlex. Funciona igual, con menos prioridad.\n'}
**Este archivo lo escribe \`_dev/sonda-fuentes.js\`. No se edita a mano** — se
vuelve a correr. Lo que dice es lo que las fuentes devolvieron de verdad, no
lo que se esperaba de ellas.

## Veredicto

| | | Qué significa |
|---|---|---|
| ✅ Sirven | **${sirven.length}** | Hay canal y trae artículos |
| ⁉️ Dudosas | **${cuenta('dudoso').length}** | Responden con ítems, pero sin fecha, sin DOI y sin resumen: casi seguro **no son artículos** |
| ⚠️ Sin canal | **${sinc.length}** | La institución está en pie y no publica canal legible |
| 🚫 Rechazan | **${cuenta('rechaza').length}** | 403: rechazan recolectores a propósito |
| ⏳ Limitadas | **${cuenta('limitada').length}** | 429: hay cola. Se puede, más despacio o con clave |
| ❌ Mudas | **${cuenta('no responde').length}** | No contestan |

Ninguna de las cinco últimas es «no existe», y la diferencia es lo que importa:
**«sin canal» y «rechaza» son trabajo pendiente; «muda» es una fuente muerta.**

## Lo que devolvió cada una
${bloque(1)}${bloque(2)}
**Ritmo** es ítems por día, calculado del propio canal. Es lo que dice si una
fuente cabe en una edición diaria o la ahoga.
**Idioma** con \`~\` es a ojo (el canal no lo declara): es una pista, no un dato.

## Las que no sirvieron, con lo que se probó

${detalle || '_Ninguna: todas sirvieron._'}

---
Generado por \`node _dev/sonda-fuentes.js\` · ${meta.fecha}
`;
}

async function principal() {
  const arg = opt;
  const cfg = JSON.parse(fs.readFileSync(FUENTES, 'utf8'));
  let fuentes = cfg.fuentes;
  const fFase = arg('--fase'); if (fFase) fuentes = fuentes.filter(f => String(f.fase) === fFase);
  const fIds  = arg('--id');   if (fIds)  { const s = new Set(fIds.split(',')); fuentes = fuentes.filter(f => s.has(f.id)); }

  console.log(`Sondando ${fuentes.length} fuentes…\n`);
  const rs = [];
  for (const f of fuentes) {
    process.stdout.write(`  ${f.nombre.padEnd(42)} `);
    const r = await sondar(f);
    rs.push(r);
    console.log(r.veredicto === 'sirve'
      ? `✅ ${r.elegido.formato} · ${r.elegido.items} ítems · ${r.elegido.idioma}`
      : (r.veredicto === 'sin canal' ? '⚠️  sin canal' : '❌ no responde'));
    await dormir(PAUSA);
  }

  const meta = { fecha: new Date().toISOString().slice(0, 10), candidatos: fuentes.reduce((a, f) => a + f.candidatos.length, 0) };
  fs.writeFileSync(SALIDA_J, JSON.stringify({ meta, resultados: rs }, null, 2));
  fs.writeFileSync(SALIDA_M, informe(rs, meta));

  const sirven = rs.filter(r => r.veredicto === 'sirve').length;
  console.log(`\n${'─'.repeat(56)}`);
  console.log(`  ✅ sirven ${sirven}   ⚠️ sin canal ${rs.filter(r => r.veredicto === 'sin canal').length}   ❌ mudas ${rs.filter(r => r.veredicto === 'no responde').length}`);
  console.log(`  escrito: SONDA-FUENTES.md y _dev/sonda-fuentes-resultado.json`);
  /* Sin fuentes vivas no hay Fase 1: se sale con error para que el flujo de
     trabajo de GitHub lo pinte en rojo y no pase inadvertido. */
  console.log(sirven === 0 ? '  SUSPENDE — ninguna fuente respondió' : '  APRUEBA');
  process.exit(sirven === 0 ? 1 : 0);
}

/* Corre si se invoca directo; si se requiere, entrega las piezas para que la
   prueba las mida por separado. Cada una de estas funciones decide algo que
   luego se escribe en el informe: si se equivocan, el informe miente. */
if (require.main === module) {
  principal();
} else {
  module.exports = { formatoDe, contarItems, traeResumen, traeDoi, idiomaDe, fechas, sondar };
}
