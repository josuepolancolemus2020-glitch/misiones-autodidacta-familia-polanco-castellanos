/* ============================================================
   F.A.R.O · Reparte las respuestas correctas entre a, b, c y d
   ------------------------------------------------------------
   Problema que arregla: en los bancos de opción múltiple que se
   pintan en ORDEN FIJO (quiz, evaluación final y completa la
   oración) la respuesta correcta quedaba casi siempre en la misma
   letra, así que se podía aprobar sin leer. Los widgets no tienen
   el problema porque el motor los baraja al pintarlos.

   Qué hace: para cada banco arma una lista balanceada de posiciones
   destino (a, b, c, d por partes iguales), la baraja con una semilla
   FIJA derivada del nombre del archivo y del banco (así el resultado
   es reproducible: correr el script dos veces da lo mismo), y mueve
   cada respuesta correcta a su posición, renumerando los prefijos
   «a) b) c) d)» cuando el banco los trae.

   Uso:  node _dev/reparte-respuestas.js            (aplica)
         node _dev/reparte-respuestas.js --revisar   (solo informa)
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const SOLO_REVISAR = process.argv.includes('--revisar');

/* Bancos que se pintan en orden fijo: nombre y clave del índice correcto */
const BANCOS = [
  { nombre: 'qzData', clave: 'c' },
  { nombre: 'evalMCBank', clave: 'a' },
  { nombre: 'cmpData', clave: 'c' },
  /* Añadido con las preguntas de comprensión lectora de la sección de
     Lecturas: también se pintan en orden fijo y también se imprimen, así
     que les toca la misma norma 4. Las misiones que no tienen el banco se
     saltan sin ruido. */
  { nombre: 'lectComprensionBank', clave: 'c' },
];

/* Generador con semilla (mulberry32), el mismo criterio de determinismo
   que usan las evaluaciones del proyecto. */
function semillaDe(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Lista balanceada de posiciones destino para n preguntas de k opciones */
function destinos(n, k, rnd) {
  const base = [];
  for (let i = 0; i < n; i++) base.push(i % k);
  for (let i = base.length - 1; i > 0; i--) {   /* Fisher-Yates con semilla */
    const j = Math.floor(rnd() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}

/* Localiza `const NOMBRE=` y devuelve el literal completo con su rango */
function ubicaLiteral(txt, nombre) {
  const m = new RegExp('const\\s+' + nombre + '\\s*=\\s*\\[').exec(txt);
  if (!m) return null;
  const inicio = m.index + m[0].length - 1;
  let prof = 0, dentroTxt = false, comilla = '', escape = false;
  for (let i = inicio; i < txt.length; i++) {
    const ch = txt[i];
    if (escape) { escape = false; continue; }
    if (dentroTxt) {
      if (ch === '\\') escape = true;
      else if (ch === comilla) dentroTxt = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { dentroTxt = true; comilla = ch; continue; }
    if (ch === '[' || ch === '{') prof++;
    else if (ch === ']' || ch === '}') {
      prof--;
      if (prof === 0) return { inicio, fin: i + 1, src: txt.slice(inicio, i + 1) };
    }
  }
  return null;
}

/* Serializa en el estilo del archivo: una línea (JSON) o una por pregunta */
function comillaSimple(s) {
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
}
function serializa(arr, multilinea) {
  if (!multilinea) return JSON.stringify(arr);
  const lineas = arr.map(o => {
    const partes = Object.keys(o).map(k => {
      const v = o[k];
      if (Array.isArray(v)) return k + ':[' + v.map(comillaSimple).join(',') + ']';
      if (typeof v === 'string') return k + ':' + comillaSimple(v);
      return k + ':' + JSON.stringify(v);
    });
    return '  {' + partes.join(',') + '},';
  });
  return '[\n' + lineas.join('\n') + '\n]';
}

const PREFIJO = /^\s*[a-dA-D]\)\s*/;
const LETRAS = ['a', 'b', 'c', 'd', 'e', 'f'];

/* Unos bancos llaman a las opciones «o» y otros «opts» */
const claveOpciones = q => Array.isArray(q.o) ? 'o' : (Array.isArray(q.opts) ? 'opts' : null);

function reparte(banco, clave, rnd) {
  const conOpciones = banco.filter(q => claveOpciones(q) && typeof q[clave] === 'number');
  if (!conOpciones.length) return { movidas: 0 };
  const k = Math.max(...conOpciones.map(q => q[claveOpciones(q)].length));
  const dest = destinos(conOpciones.length, k, rnd);
  let movidas = 0, i = 0;
  conOpciones.forEach(q => {
    const co = claveOpciones(q);
    const traePrefijo = PREFIJO.test(q[co][0]);
    const limpias = q[co].map(t => String(t).replace(PREFIJO, ''));
    const correcta = limpias[q[clave]];
    const resto = limpias.filter((_, idx) => idx !== q[clave]);
    let objetivo = dest[i++];
    if (objetivo >= q[co].length) objetivo = q[co].length - 1;
    const nuevas = [...resto.slice(0, objetivo), correcta, ...resto.slice(objetivo)];
    if (objetivo !== q[clave]) movidas++;
    q[co] = nuevas.map((t, idx) => traePrefijo ? LETRAS[idx] + ') ' + t : t);
    q[clave] = objetivo;
  });
  return { movidas };
}

function reparto(banco, clave) {
  const cuenta = [0, 0, 0, 0, 0, 0];
  banco.forEach(q => { if (typeof q[clave] === 'number') cuenta[q[clave]]++; });
  return cuenta;
}

/* ── Recorre las misiones ── */
const MIS = path.join(RAIZ, 'misiones');
const archivos = [];
for (const dir of fs.readdirSync(MIS)) {
  const js = path.join(MIS, dir, 'js');
  if (!fs.existsSync(js)) continue;
  for (const f of fs.readdirSync(js)) {
    if (f.endsWith('.js') && !f.includes('html2canvas') && !f.endsWith('-en.js')) archivos.push(path.join(js, f));
  }
}

let sesgados = 0;
for (const archivo of archivos) {
  let txt = fs.readFileSync(archivo, 'utf8');
  const nombreArchivo = path.basename(archivo);
  const informe = [];
  let cambiado = false;

  for (const { nombre, clave } of BANCOS) {
    const lit = ubicaLiteral(txt, nombre);
    if (!lit) continue;
    let banco;
    try { banco = eval(lit.src); } catch (e) { informe.push(`  ${nombre}: no se pudo leer (${e.message})`); continue; }
    if (!Array.isArray(banco) || !banco.length) continue;

    const antes = reparto(banco, clave);
    const total = banco.filter(q => typeof q[clave] === 'number').length;
    const peorAntes = Math.max(...antes);

    if (SOLO_REVISAR) {
      const pct = Math.round(peorAntes / total * 100);
      const mal = pct > 40;
      if (mal) sesgados++;
      informe.push(`  ${nombre} (${total}): ` + antes.slice(0, 4).map((n, i) => LETRAS[i] + '=' + n).join(' ') +
        (mal ? `  ✘ ${pct}% en la misma letra` : '  ✔ repartido'));
      continue;
    }

    const rnd = mulberry32(semillaDe(nombreArchivo + '|' + nombre));
    const { movidas } = reparte(banco, clave, rnd);
    const despues = reparto(banco, clave);
    const multilinea = lit.src.includes('\n');
    txt = txt.slice(0, lit.inicio) + serializa(banco, multilinea) + txt.slice(lit.fin);
    cambiado = true;
    informe.push(`  ${nombre} (${total}): ` + antes.slice(0, 4).map((n, i) => LETRAS[i] + '=' + n).join(' ') +
      ' → ' + despues.slice(0, 4).map((n, i) => LETRAS[i] + '=' + n).join(' ') + `  (${movidas} movidas)`);
  }

  if (informe.length) {
    console.log('\n== ' + nombreArchivo + ' ==');
    informe.forEach(l => console.log(l));
  }
  if (cambiado && !SOLO_REVISAR) fs.writeFileSync(archivo, txt);
}

if (SOLO_REVISAR) {
  console.log(sesgados ? `\n✖ ${sesgados} bancos con más del 40% de las respuestas en la misma letra`
                       : '\n✔ ningún banco concentra las respuestas en una letra');
  process.exit(sesgados ? 1 : 0);
}
console.log('\n✔ respuestas repartidas. Ahora: node _dev/reparte-respuestas.js --revisar');
