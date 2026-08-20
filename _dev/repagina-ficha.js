/* ══════════════════════════════════════════════════════════════
   F.A.R.O · Repaginar una ficha (norma 6: diez páginas, y llenas)
   ──────────────────────────────────────────────────────────────
   Mover a mano los <section class="pagina"> y renumerar los pies es
   lento y se presta a dejar un </div> suelto. Esta herramienta hace
   eso: toma el contenido de la ficha CORRIDO (da igual cómo esté
   partido ahora) y lo vuelve a cortar en los puntos que se le digan.

   Los puntos de corte son fragmentos de texto que deben QUEDAR AL
   INICIO de una página, uno por línea, en un archivo aparte:

     _dev/cortes/<nombre-de-la-ficha>.txt

   Cada línea es un trozo literal del HTML (por ejemplo un
   «<h2>🧩 Las tácticas compuestas»). La página 1 empieza sola, así
   que para diez páginas hacen falta nueve cortes.

   Uso:  node _dev/repagina-ficha.js fichas/ficha-persuasion-palancas.html
         node _dev/repagina-ficha.js fichas/... --revisar   (no escribe)

   Después SIEMPRE medir: _dev/mide-ficha-paginas.html?f=<ficha>
   ══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ARGS = process.argv.slice(2);
const SOLO_REVISAR = ARGS.includes('--revisar');
const destino = ARGS.find(a => !a.startsWith('--'));
if (!destino) { console.error('Indica la ficha: node _dev/repagina-ficha.js fichas/<ficha>.html'); process.exit(2); }

const abs = path.isAbsolute(destino) ? destino : path.join(RAIZ, destino);
const nombre = path.basename(abs, '.html');
const fCortes = path.join(__dirname, 'cortes', nombre + '.txt');
if (!fs.existsSync(abs)) { console.error('No existe la ficha: ' + destino); process.exit(2); }
if (!fs.existsSync(fCortes)) { console.error('Falta la lista de cortes: _dev/cortes/' + nombre + '.txt'); process.exit(2); }

const html = fs.readFileSync(abs, 'utf8');
const cortes = fs.readFileSync(fCortes, 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

/* ── 1. El pie es igual en todas las páginas menos por el número, así que se
      toma el primero como molde y se le deja el «Página N de M» en blanco ── */
const mPie = html.match(/<div class="pie">[\s\S]*?<\/div>/);
if (!mPie) { console.error('La ficha no tiene <div class="pie">.'); process.exit(2); }
const moldePie = mPie[0].replace(/Página[^<]*/, 'Página {N} de {M}');

/* ── 2. Contenido corrido: se quitan pies, aperturas y cierres de sección y
      los comentarios de página. Lo que queda es la ficha sin paginar ── */
/* El cierre del <div class="doc"> ya no pega con </body>: desde la norma
   5-octies toda ficha carga después el marcador (js/lecturas-marcador.js),
   así que entre los dos hay etiquetas <script>. Con el patrón viejo esta
   herramienta dejó de encontrar el cuerpo de CUALQUIER ficha y fallaba con
   un «No encuentro el <div class="doc">» que no decía por qué. */
const mDoc = html.match(/(<div class="doc">\s*)([\s\S]*?)(\s*<\/div>\s*(?:<script\b[^>]*>\s*<\/script>\s*)*<\/body>)/);
if (!mDoc) { console.error('No encuentro el <div class="doc"> de la ficha.'); process.exit(2); }
const cuerpo = mDoc[2]
  .replace(/<div class="pie">[\s\S]*?<\/div>\s*/g, '')
  .replace(/<!--\s*═+\s*PÁGINA[^>]*-->\s*/g, '')
  .replace(/<section class="pagina">\s*/g, '')
  .replace(/\s*<\/section>\s*/g, '\n\n')
  .trim();

/* ── 3. Cortar por los anclajes, en orden. Un anclaje que no aparece, o que
      aparece antes que el anterior, es un error del que hay que enterarse ── */
const trozos = [];
let resto = cuerpo;
cortes.forEach((corte, i) => {
  const pos = resto.indexOf(corte);
  if (pos < 0) { console.error(`✘ corte ${i + 1} no encontrado (o fuera de orden): ${corte.slice(0, 70)}`); process.exit(1); }
  trozos.push(resto.slice(0, retrocede(resto, pos)));
  resto = resto.slice(retrocede(resto, pos));
});
trozos.push(resto);

/* Un corte puede caer DENTRO de un bloque (el <h3> de un caso va dentro de su
   <div class="caso">). Cortar ahí dejaría la apertura en una página y el
   cierre en la otra, o sea HTML roto. Así que el punto de corte retrocede
   hasta la última apertura que quede sin cerrar antes de él. */
function retrocede(txt, pos) {
  const antes = txt.slice(0, pos);
  const aperturas = [...antes.matchAll(/<div\b[^>]*>/g)];
  const cierres = (antes.match(/<\/div>/g) || []).length;
  const pendientes = aperturas.length - cierres;
  if (pendientes <= 0) return pos;
  return aperturas[aperturas.length - pendientes].index;
}

const M = trozos.length;
const paginas = trozos.map((t, i) => {
  const pie = moldePie.replace('{N}', i + 1).replace('{M}', M);
  const abre = (t.match(/<div\b[^>]*>/g) || []).length, cierra = (t.match(/<\/div>/g) || []).length;
  if (abre !== cierra) { console.error(`✘ la página ${i + 1} queda con ${abre} <div> y ${cierra} </div>: el corte parte un bloque`); process.exit(1); }
  return `<!-- ═══════════ PÁGINA ${i + 1} ═══════════ -->\n<section class="pagina">\n  ${t.trim()}\n\n  ${pie}\n</section>`;
});

const salida = html.slice(0, html.indexOf(mDoc[0])) + mDoc[1] + '\n' + paginas.join('\n\n') + '\n' + mDoc[3]
  + html.slice(html.indexOf(mDoc[0]) + mDoc[0].length);

console.log(`${nombre}: ${M} páginas` + (SOLO_REVISAR ? '  (revisión, no se escribió nada)' : '  reescrita'));
trozos.forEach((t, i) => {
  const titulo = (t.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/) || [, '(sin encabezado)'])[1].replace(/<[^>]+>/g, '').trim();
  console.log(`  pág ${String(i + 1).padStart(2)}: ${titulo.slice(0, 62)}`);
});
if (M !== 10) console.log(`\n⚠ la norma 6 pide 10 páginas y esta lista da ${M}: sobran o faltan cortes`);
if (!SOLO_REVISAR) fs.writeFileSync(abs, salida);
