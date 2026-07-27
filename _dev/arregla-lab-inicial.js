/* ============================================================
   F.A.R.O · La pieza con la que abre el laboratorio
   ------------------------------------------------------------
   Dos restos del molde que se arrastraban al copiar una misión, y
   que la norma 1 ya avisaba («al copiar el molde de otra misión hay
   que revisar la pieza inicial del laboratorio»):

   1. `let labParte='centro'` apuntaba a una pieza que la misión
      nueva no tiene, porque «centro» era del mapa de actores de
      Poder Político. Entonces updateLabDisplay() hace
      parteData['centro'][labAspecto] y lanza excepción al arrancar.
      Y como salta DENTRO del DOMContentLoaded, se lleva consigo
      todo lo que venía después, que es renderAchPanel(). Lo que se
      ve: el laboratorio en blanco hasta tocar una pieza, y el panel
      de logros vacío para siempre.

   2. querySelector('[data-parte="web"]') resaltaba el botón de una
      pieza que solo existe en el Módulo 1 del panorama, así que la
      primera pieza del laboratorio arrancaba sin resaltar.

   En los dos casos la pieza correcta es la PRIMERA clave de
   parteData, que es además la que el HTML ya anuncia en
   #lab-sentence y la que la sonda de cada misión espera.

   Uso:  node _dev/arregla-lab-inicial.js            (aplica)
         node _dev/arregla-lab-inicial.js --revisar   (solo informa,
                                falla si queda alguna por arreglar)
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const MIS = path.join(RAIZ, 'misiones');
const SOLO_REVISAR = process.argv.includes('--revisar');

let tocados = 0, revisados = 0;
for (const dir of fs.readdirSync(MIS)) {
  const js = path.join(MIS, dir, 'js');
  if (!fs.existsSync(js)) continue;
  for (const f of fs.readdirSync(js)) {
    if (!f.endsWith('.js') || f.includes('html2canvas')) continue;
    const abs = path.join(js, f);
    let src = fs.readFileSync(abs, 'utf8');
    const m = /^const parteData=([\s\S]*?);$/m.exec(src);
    if (!m) continue;              /* misión sin laboratorio de piezas */
    revisados++;
    let claves;
    try { claves = Object.keys(eval('(' + m[1] + ')')); }
    catch (e) { console.log('  ! no se pudo leer parteData de ' + f + ': ' + e.message); continue; }
    const primera = claves[0];
    const antes = src;
    const notas = [];

    src = src.replace(/let labParte='([^']*)'/, function (todo, k) {
      if (claves.includes(k)) return todo;
      notas.push("abría en la pieza '" + k + "', que no existe: pasa a '" + primera + "'");
      return "let labParte='" + primera + "'";
    });

    src = src.replace(/querySelector\('\[data-parte="([^"]*)"\]'\)/g, function (todo, k) {
      if (claves.includes(k)) return todo;
      notas.push('resaltaba el botón "' + k + '", que no existe: pasa a "' + primera + '"');
      return 'querySelector(\'[data-parte="' + primera + '"]\')';
    });

    if (src !== antes) {
      tocados++;
      console.log('· ' + f);
      notas.forEach(n => console.log('    ' + n));
      if (!SOLO_REVISAR) fs.writeFileSync(abs, src);
    }
  }
}

console.log('\n' + revisados + ' misiones con laboratorio revisadas, ' + tocados +
            (SOLO_REVISAR ? ' por arreglar' : ' arregladas'));
if (SOLO_REVISAR && tocados) process.exit(1);
