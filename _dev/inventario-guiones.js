/* ============================================================
   M.E.T.A.S · Inventario de guiones largos por contexto
   ------------------------------------------------------------
   SOLO MIDE. Agrupa cada «—» por su contexto normalizado para que
   una tanda del barrido de la norma 1-bis se pueda decidir de una
   vez: los casos repetidos (que son casi todos) se resuelven con
   la tabla de equivalencias ya fijada en la tanda 1, y solo los
   sueltos piden lectura.

   Uso:  node _dev/inventario-guiones.js misiones/2y3ciclo-la-celula
         node _dev/inventario-guiones.js --ruta codigo
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const objetivos = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!objetivos.length) { console.error('Indica al menos una carpeta o archivo.'); process.exit(2); }

const EXT = /\.(js|html|css|md)$/;
function archivos(p) {
  const abs = path.isAbsolute(p) ? p : path.join(RAIZ, p);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return EXT.test(abs) ? [abs] : [];
  return fs.readdirSync(abs).flatMap(f => archivos(path.join(abs, f)));
}

const grupos = new Map();
let total = 0;
const porArchivo = {};

for (const p of objetivos) {
  for (const abs of archivos(p)) {
    if (abs.includes('html2canvas')) continue;
    const txt = fs.readFileSync(abs, 'utf8');
    const rel = path.relative(RAIZ, abs).replace(/\\/g, '/');
    let n = 0;
    txt.split('\n').forEach((linea, i) => {
      let idx = -1;
      while ((idx = linea.indexOf('—', idx + 1)) >= 0) {
        total++; n++;
        const izq = linea.slice(Math.max(0, idx - 45), idx);
        const der = linea.slice(idx + 1, idx + 46);
        /* La firma ignora el contenido variable (nombres de misión, números)
           para que el mismo rótulo de 14 misiones caiga en un solo grupo. */
        const firma = (izq + '—' + der)
          .replace(/\$\{[^}]*\}/g, '§')
          .replace(/\d+/g, '#')
          .replace(/\s+/g, ' ')
          .trim();
        if (!grupos.has(firma)) grupos.set(firma, { n: 0, ejemplo: `${rel}:${i + 1}`, muestra: (izq + '—' + der).trim() });
        grupos.get(firma).n++;
      }
    });
    if (n) porArchivo[rel] = n;
  }
}

const orden = [...grupos.entries()].sort((a, b) => b[1].n - a[1].n);
console.log(`${total} guiones largos · ${orden.length} contextos distintos · ${Object.keys(porArchivo).length} archivos\n`);
orden.forEach(([, g]) => {
  console.log(`${String(g.n).padStart(4)} ×  ${g.muestra.slice(0, 110)}`);
  console.log(`        ${g.ejemplo}`);
});
