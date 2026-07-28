/* ══════════════════════════════════════════════════════════════
   F.A.R.O · Revisar lo que arrastra el molde de las misiones
   ──────────────────────────────────────────────────────────────
   Cada misión nueva se hace copiando la anterior y pasándole un
   inyector. El inyector reemplaza los bancos, pero fuera de los
   bancos quedan cabos sueltos que NO dan error: el archivo se
   genera, la misión abre y todo se ve bien. Se descubren semanas
   después, o no se descubren.

   Esta herramienta busca esos cabos en TODAS las misiones a la vez.
   No abre el navegador: lee los archivos, que para esto basta y
   tarda un segundo.

   Uso:  node _dev/revisa-molde.js

   Sale con código 1 si encuentra algo, para poder encadenarla.
   ══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const MIS = path.join(RAIZ, 'misiones');

/* Cada misión es una carpeta con un .html al lado de su js/<algo>.js */
const misiones = [];
for (const carpeta of fs.readdirSync(MIS)) {
  const dir = path.join(MIS, carpeta);
  if (!fs.statSync(dir).isDirectory()) continue;
  const jsDir = path.join(dir, 'js');
  if (!fs.existsSync(jsDir)) continue;
  for (const js of fs.readdirSync(jsDir)) {
    if (!js.endsWith('.js') || js === 'html2canvas.min.js') continue;
    const base = js.replace(/\.js$/, '');
    const html = path.join(dir, base + '.html');
    if (fs.existsSync(html)) misiones.push({ nombre: carpeta + '/' + base, html, js: path.join(jsDir, js) });
  }
}

/* Cuatro misiones son anteriores al molde de quince secciones y se quedaron
   con las suyas: las dos de Autocapacitación (vinieron de M.E.T.A.S), Karl
   Popper y la misión base del sistema nervioso. No es un cabo suelto, es su
   forma; se avisa pero no cuenta como fallo. */
const ANTES_DEL_MOLDE = new Set([
  'autocapacitacion-metas/modulo-1-panorama',
  'autocapacitacion-metas/modulo-2-frontend',
  'epistemología/karl-popper',
  'misión-base-sistema-nervioso/sistema-nervioso',
]);

const fallos = [];
const avisos = [];
const claves = new Map();

for (const m of misiones) {
  const js = fs.readFileSync(m.js, 'utf8');
  const html = fs.readFileSync(m.html, 'utf8');
  const falla = t => fallos.push(m.nombre + ': ' + t);

  /* 1. El laboratorio arranca en una pieza y resalta el botón de OTRA.
        Lleva ?. delante, así que no da error: simplemente no resalta nada. */
  const arranca = js.match(/let labParte=.([a-zA-Z0-9_]+)./);
  const resalta = js.match(/document\.querySelector\(.\[data-parte="([a-zA-Z0-9_]+)"\]/);
  if (arranca && resalta && arranca[1] !== resalta[1]) {
    falla(`el laboratorio arranca en «${arranca[1]}» y resalta el botón «${resalta[1]}»`);
  }

  /* 2. Las piezas del laboratorio del JS tienen que existir como botones. */
  const partes = [...html.matchAll(/data-parte="([a-zA-Z0-9_]+)"/g)].map(x => x[1]);
  if (arranca && partes.length && !partes.includes(arranca[1])) {
    falla(`el laboratorio arranca en «${arranca[1]}», que no es ninguno de sus botones`);
  }

  /* 3. Norma 1: clave de progreso propia. Dos misiones con la misma clave se
        pisan el avance entre ellas y nadie lo nota hasta que se pierde. */
  const clave = (js.match(/const SAVE_KEY=['"]([^'"]+)['"]/) || [])[1];
  if (!clave) falla('no se le encuentra la SAVE_KEY');
  else if (claves.has(clave)) falla(`comparte la clave «${clave}» con ${claves.get(clave)}`);
  else claves.set(clave, m.nombre);

  /* 4. La tarjeta que se manda por WhatsApp se copia entera del molde y casi
        nadie la lee después: en «El relato» decía «Etapa 2» y describía la
        oferta. Se compara con la etapa que la propia misión anuncia. */
  const etapaHtml = (html.match(/Etapa (\d+) de \d+/) || [])[1];
  const tarjeta = (js.match(/function compartirMision\(\)\{[^\n]*/) || [''])[0];
  const etapaTarjeta = (tarjeta.match(/Etapa (\d+)\*/) || [])[1];
  if (etapaHtml && etapaTarjeta && etapaHtml !== etapaTarjeta) {
    falla(`se presenta como etapa ${etapaHtml} y la tarjeta de WhatsApp dice etapa ${etapaTarjeta}`);
  }

  /* 5. Norma 1-bis: ningún guion largo en lo que se publica. */
  const largos = (html.match(/—/g) || []).length + (js.match(/—/g) || []).length;
  if (largos) falla(`quedan ${largos} guiones largos (norma 1-bis)`);

  /* 6. Las quince secciones, en la misión y en la barra de navegación. */
  const secs = (html.match(/class="sec\b/g) || []).length;
  if (secs !== 15) {
    if (ANTES_DEL_MOLDE.has(m.nombre)) avisos.push(`${m.nombre}: ${secs} secciones (anterior al molde de 15)`);
    else falla(`tiene ${secs} secciones y el molde son 15`);
  }
}

console.log(`revisadas ${misiones.length} misiones`);
avisos.forEach(a => console.log('  · ' + a));
if (!fallos.length) { console.log('✔ ninguna arrastra cabos del molde'); process.exit(0); }
fallos.forEach(f => console.log('  ✘ ' + f));
console.log(`\n✖ ${fallos.length} cosa(s) que arreglar`);
process.exit(1);
