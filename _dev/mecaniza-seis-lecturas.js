/* ══════════════════════════════════════════════════════════════════
   Pasa una misión del Estudio Mayor a las SEIS lecturas (norma 5-nonies)
   ──────────────────────────────────────────────────────────────────
   Hace la parte MECÁNICA, que es idéntica en las trece misiones porque
   todas salieron del mismo molde: engancha el aparato compartido, mete
   la tarjeta del careo, quita las tres baterías del final (que ahora
   viven dentro de cada lectura), arregla las hojas impresas y añade al
   banco las nueve preguntas del careo.

   Lo que NO hace, porque necesita criterio y se hace a mano en cada
   misión:
     · repartir `lectCompletarBank` y `lectAnalisisBank` en DOS por voz
       (venían con etiquetas sueltas como «las cinco» o sin etiqueta);
     · la prosa de la tarjeta de entrada y la de «Por qué seis voces»;
     · la sonda de la misión.

   Uso:  node _dev/mecaniza-seis-lecturas.js <carpeta>/<base> <careo.json>
   Ej.:  node _dev/mecaniza-seis-lecturas.js ruta-dorado-gran-fuga/gran-fuga /tmp/careo.json

   Es idempotente: correrlo dos veces no duplica nada.
══════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..');

const [destino, jsonCareo] = process.argv.slice(2);
if (!destino || !jsonCareo) { console.error('Uso: node _dev/mecaniza-seis-lecturas.js <carpeta>/<base> <careo.json>'); process.exit(2); }
const carpeta = destino.split('/')[0], base = destino.split('/')[1];
const F_HTML = path.join(RAIZ, 'misiones', carpeta, base + '.html');
const F_JS = path.join(RAIZ, 'misiones', carpeta, 'js', base + '.js');
for (const f of [F_HTML, F_JS, jsonCareo]) if (!fs.existsSync(f)) { console.error('No existe: ' + f); process.exit(2); }
const careo = JSON.parse(fs.readFileSync(jsonCareo, 'utf8'));

const hechos = [], avisos = [];
function ok(q) { hechos.push(q); }
function ojo(q) { avisos.push(q); }
/* La norma 1-bis no admite un solo guion largo en texto publicable, y esto
   escribe texto publicable: se comprueba antes de tocar nada. */
const crudo = JSON.stringify(careo);
if (crudo.indexOf('—') >= 0) { console.error('✘ El careo trae guiones largos (norma 1-bis). No se toca nada.'); process.exit(1); }

/* ══════════ HTML ══════════ */
let h = fs.readFileSync(F_HTML, 'utf8');

if (h.indexOf('css/lecturas.css') < 0) {
  h = h.replace('<link rel="stylesheet" href="../../css/lecturas-marcador.css">',
    '<link rel="stylesheet" href="../../css/lecturas.css">\n<link rel="stylesheet" href="../../css/lecturas-marcador.css">');
  ok('hoja del aparato de lecturas');
}
if (h.indexOf('js/lecturas.js') < 0) {
  h = h.replace('<script src="../../js/lecturas-marcador.js"></script>',
    '<!-- El aparato de lecturas va ANTES del marcador: pliega los seis textos y les\n'
    + '       mete sus preguntas dentro, y el marcador necesita el documento ya montado\n'
    + '       para saber cuáles son sus zonas subrayables. -->\n'
    + '  <script src="../../js/lecturas.js"></script>\n'
    + '  <script src="../../js/lecturas-marcador.js"></script>');
  ok('aparato de lecturas enganchado');
}

/* La tarjeta del careo, justo detrás de la conversación de Quintero y Gala. */
if (h.indexOf('id="lect-debate"') < 0) {
  const tarjeta = '\n  <div class="card ac-amber" id="lect-debate">\n'
    + '    <h2>🥊 Lectura 6 · «' + careo.titulo + '» (careo, con las dos posturas y sus réplicas)</h2>\n'
    + '    <p class="lect-nota" style="font-size:0.85rem;color:var(--gray);margin-bottom:0.7rem;">\n'
    + '      ' + careo.nota + '</p>\n'
    + '    <div style="margin-bottom:0.7rem;"><button class="btn btn-amber" onclick="imprimirLectura(\'debate\')">🖨️ Imprimir este careo</button></div>\n'
    + careo.parrafos.map(p => '    <p class="lect-p">' + p + '</p>').join('\n') + '\n'
    + '  </div>\n';
  const ancla = h.indexOf('<h2>🧐 Preguntas de las cinco lecturas</h2>');
  if (ancla < 0) { console.error('✘ No encuentro la tarjeta de «Preguntas de las cinco lecturas»'); process.exit(1); }
  const abre = h.lastIndexOf('<div class="card', ancla);
  h = h.slice(0, abre) + tarjeta.trimStart() + '\n  ' + h.slice(abre);
  ok('tarjeta del careo insertada');
}

/* Fuera las tres baterías del final: ahora cada lectura lleva las suyas. */
if (h.indexOf('id="lcProg"') >= 0) {
  const ini = h.lastIndexOf('<div class="card', h.indexOf('<h2>🧐 Preguntas de las cinco lecturas</h2>'));
  const fin = h.lastIndexOf('<div class="card', h.indexOf('<h2>📐 Por qué cinco voces'));
  const bloque = h.slice(ini, fin);
  if (!/lcProg/.test(bloque) || !/lfProg/.test(bloque) || !/laProg/.test(bloque)) {
    console.error('✘ El bloque de baterías no es el esperado; no se toca'); process.exit(1);
  }
  const NUEVA = '<div class="card ac-gold">\n'
    + '    <h2>🖨️ Todo esto se imprime</h2>\n'
    + '    <p>Cada lectura sale con <strong>su texto y sus preguntas</strong>, y la pauta de esas preguntas va en su propia hoja al final, porque en esta casa las respuestas no se imprimen en la misma página que el ejercicio. Y las seis se pueden sacar juntas en un pliego, cada una arrancando en su hoja.</p>\n'
    + '    <div class="tip">\n'
    + '      <span class="ti">📖</span>\n'
    + '      <div><strong>Las preguntas se contestan con el texto delante.</strong> No es un examen de memoria: es un examen de lectura, y por eso viven pegadas a su lectura y no en una batería al final, donde había que ir a buscar cuáles eran las de uno. Las de <strong>análisis complejo van sin XP a propósito</strong>: una respuesta abierta que se premia sola se contesta a la carrera.</div>\n'
    + '    </div>\n'
    + '    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">\n'
    + '      <button class="btn btn-pri" onclick="imprimirPreguntasLecturas()">🖨️ Imprimir el pliego con las 54 preguntas</button>\n'
    + '      <button class="btn btn-amber" onclick="imprimirTodasLasLecturas()">🖨️ Imprimir las seis lecturas</button>\n'
    + '    </div>\n'
    + '  </div>\n\n  ';
  h = h.slice(0, ini) + NUEVA + h.slice(fin);
  ok('baterías del final retiradas');
}

/* Los botones de imprimir de la tarjeta de entrada. El guardián mira el
   rótulo VIEJO y no el nuevo: la tarjeta que sustituye a las baterías ya
   trae un «Imprimir las seis lecturas», así que buscar el nuevo daba
   siempre por hecho que esto ya estaba hecho y se saltaba el cambio. */
if (h.indexOf('>🖨️ Imprimir las cinco</button>') >= 0) {
  h = h.replace(/<button class="btn btn-pri" onclick="imprimirTodasLasLecturas\(\)">🖨️ Imprimir las cinco<\/button>/,
    '<button class="btn btn-amber" onclick="imprimirLectura(\'debate\')">🖨️ Imprimir el careo</button>\n'
    + '      <button class="btn btn-pri" onclick="imprimirTodasLasLecturas()">🖨️ Imprimir las seis</button>');
  ok('botones de impresión al día');
}
fs.writeFileSync(F_HTML, h, 'utf8');

/* ══════════ JS ══════════ */
let s = fs.readFileSync(F_JS, 'utf8');

/* El motor de pantalla se mudó al aparato compartido. */
if (/const xpLect=\{c:new Set\(\),f:new Set\(\)\};/.test(s)) {
  s = s.replace(/const xpLect=\{c:new Set\(\),f:new Set\(\)\};[\s\S]*?\n\/\* ---------- impresión: cada lectura por separado ---------- \*\//,
    '/* Las tres baterías de pantalla las monta ahora js/lecturas.js dentro de\n'
    + '   cada lectura, leyendo estos mismos bancos por su etiqueta de voz. */\n\n'
    + '/* ---------- impresión: cada lectura por separado ---------- */');
  s = s.replace(/\n *showLectC\(\);\n *showLectF\(\);\n *showLectA\(\);/,
    '\n  /* Las baterías de cada lectura las monta js/lecturas.js al cargar. */');
  ok('motor de pantalla viejo retirado');
}

/* La sexta entra en la tabla de las hojas impresas. */
if (s.indexOf('debate:{titulo:') < 0) {
  s = s.replace(/(\n\s*gala:\{[^\n]*\},\n)\};/,
    '$1  debate:{titulo:' + JSON.stringify(careo.titulo).replace(/"/g, "'") + ",tipo:'Careo: las dos posturas de una disputa abierta, con sus réplicas',careo:true},\n};");
  ok('careo en LECTURAS_IMPR');
}

/* Su etiqueta, que NO es la del pastiche: el careo no imita a nadie.
   Hay tres formas distintas de hacer etiquetas en las trece misiones, y
   las tres salieron del mismo molde en momentos distintos. */
const ETIQ_CAREO = "'<div class=\"etiqueta\"><strong>⚖️ Careo escrito por la casa sobre una disputa real.</strong> Los turnos los firman los <strong>papeles</strong> (moderación, defensa, objeción) y no personas: aquí no se le pone a nadie una palabra en la boca. Los investigadores se citan en tercera persona como fuentes, <strong>toda obra, revista, fecha y cifra es real y comprobable</strong>, y cada postura va escrita en su mejor versión, no en la que sería fácil de tumbar.</div>'";
if (s.indexOf('Careo escrito por la casa') < 0) {
  let puesta = false;
  for (const fn of ['_etiquetaImpresa', '_etiquetaLectura']) {
    const marca = 'function ' + fn + '(meta){';
    if (s.indexOf(marca) >= 0) {
      s = s.replace(marca, marca + '\n  if(meta&&meta.careo){ return ' + ETIQ_CAREO + '; }');
      ok('etiqueta del careo (' + fn + ')'); puesta = true; break;
    }
  }
  if (!puesta && s.indexOf('const LECTURAS_ETIQ={') >= 0) {
    s = s.replace('const LECTURAS_ETIQ={', 'const LECTURAS_ETIQ={\n  debate:' + ETIQ_CAREO.replace(/^'/, '`').replace(/'$/, '`') + ',');
    ok('etiqueta del careo (LECTURAS_ETIQ)'); puesta = true;
  }
  if (!puesta) ojo('NO se pudo poner la etiqueta del careo: hazlo a mano');
}

/* Cada lectura se imprime con SUS preguntas y su pauta en hoja aparte. */
if (s.indexOf('FaroLecturas.preguntasImpresas') < 0) {
  const antes = "_abreImpresion(_hojaImpresa(meta.titulo,cuerpo+FaroMarcador.impresionExtra([clave]),' · '+meta.titulo));";
  if (s.indexOf(antes) < 0) ojo('NO se pudo enganchar preguntasImpresas: hazlo a mano');
  else {
    s = s.replace(antes,
      "const preg=(window.FaroLecturas&&FaroLecturas.preguntasImpresas)?FaroLecturas.preguntasImpresas(clave):'';\n"
      + "  _abreImpresion(_hojaImpresa(meta.titulo,cuerpo+preg+FaroMarcador.impresionExtra([clave]),' · '+meta.titulo));");
    ok('cada lectura se imprime con sus preguntas');
  }
}

/* Las hojas pasan de cinco a seis y el pliego de 45 a 54. */
const cambios = [
  ["['borges','cervantes','harari','entrevista','gala']", "['borges','cervantes','harari','entrevista','gala','debate']"],
  ['Las cinco lecturas', 'Las seis lecturas'],
  ['las cinco lecturas', 'las seis lecturas'],
  ['I. Comprensión lectora (25 preguntas)', 'I. Comprensión lectora (30 preguntas)'],
  ['II. Completa la oración (10 preguntas)', 'II. Completa la oración (12 preguntas)'],
  ['III. Análisis complejo (10 preguntas)', 'III. Análisis complejo (12 preguntas)'],
  ['25 de comprensión lectora, 10 de completar y 10 de análisis', '30 de comprensión lectora, 12 de completar y 12 de análisis'],
];
for (const [de, a] of cambios) {
  if (s.indexOf(de) >= 0) { s = s.split(de).join(a); ok('texto impreso: ' + de.slice(0, 40)); }
  else if (s.indexOf(a) < 0) ojo('no estaba para cambiar → ' + de.slice(0, 50));
}

/* Las nueve preguntas del careo entran a los tres bancos. */
function mete(nombre, filas) {
  const re = new RegExp('(const ' + nombre + '=\\[)([\\s\\S]*?)(\\];)');
  const m = s.match(re);
  if (!m) { ojo('no encuentro ' + nombre); return; }
  if (m[2].indexOf('"t":"Debate"') >= 0 || m[2].indexOf("'t':'Debate'") >= 0) return;
  s = s.replace(re, m[1] + m[2].replace(/,\s*$/, '') + ',' + filas.map(f => JSON.stringify(f)).join(',') + m[3]);
  ok(nombre + ': +' + filas.length + ' del careo');
}
mete('lectComprensionBank', careo.comprension.map(q => ({ t: 'Debate', q: q.q, o: q.o, c: q.c })));
mete('lectCompletarBank', careo.completar.map(q => ({ t: 'Debate', q: q.q, a: q.a })));
mete('lectAnalisisBank', careo.analisis.map(q => ({ t: 'Debate', q: q.q, guia: q.guia })));

fs.writeFileSync(F_JS, s, 'utf8');

console.log('── ' + base + ' ──');
hechos.forEach(q => console.log('  ✔ ' + q));
avisos.forEach(q => console.log('  ⚠ ' + q));
console.log('  FALTA A MANO: repartir completar y análisis en 2 por voz (12 y 12),\n'
  + '                la prosa de la tarjeta de entrada y la de «Por qué seis voces»,\n'
  + '                y la sonda de la misión.');
