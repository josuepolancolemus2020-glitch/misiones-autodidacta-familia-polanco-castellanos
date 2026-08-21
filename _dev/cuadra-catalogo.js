/* Cuadra el catálogo con lo que hay en el disco.
   ─────────────────────────────────────────────────────────────────
   Existe porque el 20 de agosto de 2026 se publicó una misión que pedía
   js/html2canvas.min.js sin llevarlo, y el barrido que lo encontró destapó
   además siete infografías que la misión del Sistema Nervioso pedía y que
   nunca llegaron al repositorio. Diecinueve sondas en verde y tres cosas
   rotas: ninguna miraba si los archivos existen ni si el catálogo cuadra.

   Va en node y no en una sonda de navegador porque la mitad de esto necesita
   LEER EL DISCO (carpetas huérfanas, fichas que nadie enlaza), y eso un
   navegador no puede hacerlo: el servidor de _dev no lista directorios. Los
   enlaces internos, que sí se pueden pedir por HTTP, los comprueba además
   _dev/probe-enlaces-y-catalogo.html.

   Se corre igual que el reparto de respuestas, sin servidor:
       node _dev/cuadra-catalogo.js
   Sale con código 1 si algo no cuadra, para que se note en una tanda. */
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const R = f => path.join(RAIZ, f);

/* Fichas que a propósito no cuelgan de ninguna misión, con el motivo escrito.
   Una excepción declarada se puede discutir; una excepción silenciosa se
   convierte en la próxima avería. */
const FICHAS_SIN_MISION = {
  'fichas/ficha-ingenieria-asignaciones.html':
    'la generan las asignaciones metalingüísticas (js/data/asignaciones.js), que NO son misiones. '
    + 'Se llega a ella desde la vista de Asignaciones (enlazada el 20 de agosto de 2026).',
};


const datos = fs.readFileSync(R('js/data/misiones.js'), 'utf8');
const g = {};
new Function('g', 'with(g){' + datos + '; g.M = MISSIONS; g.R = RUTAS; '
  + 'g.P = typeof ETAPAS_PREVISTAS !== "undefined" ? ETAPAS_PREVISTAS : {};}')(g);
const { M, R: RUTAS, P } = g;

const pegas = [];
const nota = t => pegas.push(t);

/* La excepción de la ficha de asignaciones dejó de avisar «nadie puede llegar
   a ella» el día que la vista la enlazó, y este guardián es quien lo sostiene:
   si alguien quita el enlace, esto vuelve a avisar. */
if (!fs.readFileSync(R('index.html'), 'utf8').includes('href="fichas/ficha-ingenieria-asignaciones.html"')) {
  nota('la ficha de asignaciones perdió su enlace en la vista de Asignaciones (index.html)');
}
const agrupa = (arr, f) => arr.reduce((c, x) => { const k = f(x); (c[k] = c[k] || []).push(x); return c; }, {});
const repetidos = (arr, f) => Object.entries(agrupa(arr, f)).filter(([, v]) => v.length > 1);

/* ── 1. El catálogo consigo mismo ── */
repetidos(M, m => m.id).forEach(([k, v]) => nota(`id repetido ${k}: ${v.map(m => m.title).join(' | ')}`));
repetidos(M, m => m.url).forEach(([k]) => nota(`url declarada dos veces: ${k}`));
M.forEach(m => { if (!fs.existsSync(R(m.url))) nota(`la misión ${m.id} («${m.title}») apunta a ${m.url}, que no existe`); });

/* ── 2. El catálogo con las rutas ── */
M.filter(m => m.ruta).forEach(m => {
  if (!RUTAS[m.ruta]) nota(`la misión ${m.id} cuelga de la ruta «${m.ruta}», que no está en RUTAS`);
  else if (m.etapa > RUTAS[m.ruta].etapas)
    nota(`la misión ${m.id} es la etapa ${m.etapa} y la ruta «${m.ruta}» solo declara ${RUTAS[m.ruta].etapas}`);
});
repetidos(M.filter(m => m.ruta), m => m.ruta + ' etapa ' + m.etapa)
  .forEach(([k, v]) => nota(`dos misiones en ${k}: ${v.map(m => m.title).join(' | ')}`));

/* Una etapa construida no puede seguir anunciada como «por construir»: el mapa
   se queda con la misión y el anuncio se vuelve dato muerto que engaña al
   siguiente que lo lea. Pasó al estrenar San Petersburgo. */
Object.entries(P).forEach(([ruta, etapas]) => {
  if (!RUTAS[ruta]) nota(`ETAPAS_PREVISTAS declara la ruta «${ruta}», que no está en RUTAS`);
  Object.keys(etapas).forEach(n => {
    const hecha = M.find(m => m.ruta === ruta && String(m.etapa) === String(n));
    if (hecha) nota(`la etapa ${n} de «${ruta}» está construida («${hecha.title}») y sigue anunciada como por construir`);
  });
});

/* ── 3. El disco: carpetas que nadie enlaza ── */
const carpetasUsadas = new Set(M.map(m => m.url.split('/').slice(0, 2).join('/')));
fs.readdirSync(R('misiones'))
  .filter(d => fs.statSync(R('misiones/' + d)).isDirectory())
  .map(d => 'misiones/' + d)
  .forEach(d => { if (!carpetasUsadas.has(d)) nota(`la carpeta ${d} no la enlaza ninguna misión del catálogo`); });

/* ── 4. Las fichas ── */
const fichasEnlazadas = new Set();
M.filter(m => fs.existsSync(R(m.url))).forEach(m => {
  const html = fs.readFileSync(R(m.url), 'utf8');
  [...html.matchAll(/(?:href|src)="[^"]*?(fichas\/[^"?#]+\.html)/g)].forEach(x => fichasEnlazadas.add(x[1]));
});
fichasEnlazadas.forEach(f => { if (!fs.existsSync(R(f))) nota(`una misión enlaza ${f}, que no existe`); });
fs.readdirSync(R('fichas')).filter(f => f.endsWith('.html')).map(f => 'fichas/' + f)
  .forEach(f => {
    if (fichasEnlazadas.has(f) || FICHAS_SIN_MISION[f]) return;
    nota(`la ficha ${f} no la enlaza ninguna misión (si es a propósito, decláralo en FICHAS_SIN_MISION)`);
  });

/* ── 5. Las claves de progreso: ninguna misión comparte cajón ── */
const claves = {};
M.forEach(m => {
  const js = R(m.url.replace(/([^/]+)\.html$/, 'js/$1.js'));
  if (!fs.existsSync(js)) return;
  const c = /const SAVE_KEY *= *'([^']+)'/.exec(fs.readFileSync(js, 'utf8'));
  if (c) (claves[c[1]] = claves[c[1]] || []).push(m.title);
});
Object.entries(claves).filter(([, v]) => v.length > 1)
  .forEach(([k, v]) => nota(`la clave de progreso ${k} la comparten ${v.length} misiones: ${v.join(' | ')}`));

/* ── 6. La pieza con la que abre el laboratorio ──
   La norma 1 avisa de esto desde julio y aun así volvió a pasar el 20 de
   agosto de 2026 con San Petersburgo: la misión abría en su pieza («esperado»)
   pero seguía resaltando la de la misión molde («postulado»). No revienta,
   porque el resalte va con `?.`, así que el laboratorio arranca con todas las
   pestañas apagadas y nadie ve por qué. Se compara lo que declara `labParte`
   con lo que resalta el arranque: si no coinciden, algo se quedó del molde. */
M.forEach(m => {
  const js = R(m.url.replace(/([^/]+)\.html$/, 'js/$1.js'));
  if (!fs.existsSync(js)) return;
  const t = fs.readFileSync(js, 'utf8');
  const abre = /let labParte='([^']+)'/.exec(t);
  const resalta = /querySelector\('\[data-parte="([^"]+)"\]'\)\?\.classList\.add\('active-pri'\)/.exec(t);
  if (abre && resalta && abre[1] !== resalta[1])
    nota(`${m.url} abre el laboratorio en «${abre[1]}» y resalta «${resalta[1]}»: resto de la misión molde`);
});

/* ── 7. Los archivos que pide cada página ── */
M.filter(m => fs.existsSync(R(m.url))).forEach(m => {
  const base = path.dirname(R(m.url));
  const html = fs.readFileSync(R(m.url), 'utf8');
  [...html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)].map(x => x[1])
    .filter(u => !/^(https?:|data:|mailto:|tel:|javascript:)/.test(u))
    .forEach(u => {
      const destino = path.normalize(path.join(base, u.split(/[?#]/)[0]));
      if (!fs.existsSync(destino)) nota(`${m.url} pide ${u}, que no existe`);
    });
});

console.log(`Catálogo: ${M.length} misiones, ${Object.keys(RUTAS).length} rutas, ${Object.keys(claves).length} claves de progreso.`);
Object.entries(FICHAS_SIN_MISION).forEach(([f, por]) => console.log(`Excepción declarada · ${f}: ${por}`));
if (pegas.length) {
  console.log(`\n✖ ${pegas.length} cosa(s) que no cuadran:`);
  pegas.forEach(p => console.log('   ✘ ' + p));
  process.exit(1);
}
console.log('\n✔ el catálogo cuadra con el disco');
