// Fusiona las reglas ampliadas (JSON verificado) dentro de corrector.js.
//
//   node _dev/fusiona-reglas.js
//
// Lee _dev/reglas-ampliadas.json (el catálogo verificado regla a regla
// contra pruebas y contra el corpus de la casa), genera el código de
// cada regla y lo injerta bajo el marcador AQUÍ-REGLAS-AMPLIADAS de
// js/tools/corrector.js, reemplazando lo que hubiera de una fusión
// anterior. Así el catálogo vive en UN archivo editable a mano (el
// JSON) y el corrector se regenera sin cirugía manual.
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const JSON_REGLAS = path.join(__dirname, 'reglas-ampliadas.json');
const CORRECTOR = path.join(RAIZ, 'js', 'tools', 'corrector.js');
const MARCA_INI = '/* ═══ AQUÍ-REGLAS-AMPLIADAS ═══';
const MARCA_FIN = '/* ═══ FIN-REGLAS-AMPLIADAS ═══ */';
/* Ojo: el cierre NO puede ser «];» a secas: una regla puede llevar
   «];» dentro de su propio código (un ({…})[m…]; en una sugerencia)
   y la siguiente fusión cortaría a mitad de regla. */

const { reglas } = JSON.parse(fs.readFileSync(JSON_REGLAS, 'utf8'));

/* Un literal de cadena JS seguro (comillas simples, como el resto) */
const cad = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
/* La fuente del regex, con [L] → clase de letra, dentro de un template
   literal: se escapan backticks, ${ y las barras invertidas. */
function fuenteRe(re) {
  const conL = re.replace(/\[\^L\]/g, '[^${COR_L}]').replace(/\[L\]/g, '[${COR_L}]');
  const esc = conL.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{(?!COR_L\})/g, '\\${');
  return '`' + esc + '`';
}
function fuenteSug(sug) {
  if (!sug || sug.tipo === 'ninguna') return null;
  if (sug.tipo === 'fijo') return { campo: 'sug', js: `() => ${cad(sug.valor)}` };
  if (sug.tipo === 'mapa') {
    const pares = Object.entries(sug.mapa).map(([k, v]) => `${cad(k)}: ${cad(v)}`).join(', ');
    return { campo: 'sug', js: `m => ({ ${pares} })[m.toLowerCase()]` };
  }
  if (sug.tipo === 'funcion') return { campo: 'sugm', js: sug.js };
  throw new Error('sug.tipo desconocido: ' + sug.tipo);
}

const ids = new Set();
const bloques = reglas.map(r => {
  if (ids.has(r.id)) throw new Error('id repetido: ' + r.id);
  ids.add(r.id);
  const sug = fuenteSug(r.sug);
  const lineas = [
    `  {`,
    `    id: ${cad(r.id)}, cat: ${cad(r.cat)}, nivel: ${cad(r.nivel)},${r.zona ? ' zona: true,' : ''}`,
    `    re: new RegExp(${fuenteRe(r.re)}, ${cad(r.flags || 'giu')}),`,
  ];
  if (sug) lineas.push(`    ${sug.campo}: ${sug.js},`);
  lineas.push(
    `    titulo: ${cad(r.titulo)},`,
    `    porque: ${cad(r.porque)},`,
    `    norma: ${cad(r.norma)},`,
    r.ejemplo
      ? `    ejemplo: { mal: ${cad(r.ejemplo.mal)}, bien: ${cad(r.ejemplo.bien)} },`
      : `    ejemplo: null,`,
    `  },`);
  return lineas.join('\n');
});

let src = fs.readFileSync(CORRECTOR, 'utf8');
const ini = src.indexOf(MARCA_INI);
if (ini < 0) throw new Error('no está el marcador en corrector.js');
const cierreMarca = src.indexOf('*/', ini);
if (cierreMarca < 0) throw new Error('marcador roto en corrector.js');
/* El fin: el marcador propio si ya hubo una fusión; si no (o si una
   fusión vieja lo dejó sin poner), el cierre del array es el último
   «];» antes de la sección que sigue a COR_REGLAS. */
let fin = src.indexOf(MARCA_FIN, cierreMarca);
let colaDesde;
if (fin >= 0) {
  colaDesde = src.indexOf('];', fin);
  if (colaDesde < 0) throw new Error('falta el cierre del array tras el marcador de fin');
} else {
  const ancla = src.indexOf('/* Sugerencias que necesitan armarse', cierreMarca);
  if (ancla < 0) throw new Error('no encuentro el ancla de la sección siguiente');
  colaDesde = src.lastIndexOf('];', ancla);
  if (colaDesde < cierreMarca) throw new Error('no encuentro el cierre del array de reglas');
}
src = src.slice(0, cierreMarca + 2) + '\n' + bloques.join('\n') + '\n  ' + MARCA_FIN + '\n' + src.slice(colaDesde);
fs.writeFileSync(CORRECTOR, src);
console.log(`injertadas ${reglas.length} reglas ampliadas en js/tools/corrector.js`);

/* Y de paso: que el corrector recién injertado COMPILE */
new Function(fs.readFileSync(CORRECTOR, 'utf8').replace(/^'use strict';/, ''));
console.log('corrector.js compila ✔');
