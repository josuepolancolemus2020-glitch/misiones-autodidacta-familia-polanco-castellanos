/* ============================================================
   F.A.R.O · ¿Las 30 formas de «Las seis palancas» son reales?
   ------------------------------------------------------------
   Una forma es una promesa: la Forma 7 tiene que sacar hoy, mañana y
   en otro aparato exactamente las mismas preguntas, en el mismo
   orden y con la misma pauta. Si no, imprimir una prueba y guardar
   su pauta no sirve de nada, porque al reimprimirla ya no coinciden.

   Comprueba, para la evaluación conceptual y para el Simulacro de
   Presión:
   · determinismo: la misma forma repetida da lo mismo, byte a byte;
   · variedad: formas distintas dan pruebas distintas;
   · cobertura: entre las 30 formas se usan todas las preguntas del
     banco (si alguna no sale nunca, sobra o el reparto está mal);
   · pareados: ninguna definición cae frente a su propio término,
     que delataría la clave sin leer.

   Uso:  node _dev/test-determinismo-palancas.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const JS = path.join(RAIZ, 'misiones/ruta-persuasion-palancas/js/palancas-influencia.js');
const src = fs.readFileSync(JS, 'utf8');

let fallos = 0;
const ok = (cond, bien, mal) => { if (cond) console.log('  ✔ ' + bien); else { fallos++; console.log('  ✘ ' + mal); } };

/* ── Se extraen del archivo real, no se copian aquí ── */
function cierra(txt, desde) {
  let prof = 0, dentro = false, comilla = '', esc = false;
  for (let i = desde; i < txt.length; i++) {
    const c = txt[i];
    if (esc) { esc = false; continue; }
    if (dentro) { if (c === '\\') esc = true; else if (c === comilla) dentro = false; continue; }
    if (c === "'" || c === '"' || c === '`') { dentro = true; comilla = c; continue; }
    if (c === '[' || c === '{') prof++;
    else if (c === ']' || c === '}') { prof--; if (prof === 0) return i + 1; }
  }
  return -1;
}
function banco(nombre) {
  const m = new RegExp('(?:const|let|var)\\s+' + nombre + '\\s*=\\s*\\[').exec(src);
  if (!m) return null;
  const ini = m.index + m[0].length - 1;
  const fin = cierra(src, ini);
  if (fin < 0) return null;
  try { return eval(src.slice(ini, fin)); } catch (e) { return null; }
}

const EVAL_FORMAS = parseInt((/const EVAL_FORMAS\s*=\s*(\d+)/.exec(src) || [])[1], 10);

/* El mismo generador que usa la misión */
function _evalRng(forma) {
  let s = (forma * 2654435761 + 909090909) >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const _shuffleF = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const _pickF = (arr, n, rng) => _shuffleF(arr, rng).slice(0, n);
const _rotaF = (arr, forma) => arr[(forma - 1) % arr.length];

console.log('F.A.R.O · determinismo de «Las seis palancas»\n');

/* ── 0. El mecanismo está puesto ── */
console.log('⚙️  Mecanismo');
ok(EVAL_FORMAS === 30, 'EVAL_FORMAS = 30', 'EVAL_FORMAS no es 30, es ' + EVAL_FORMAS);
ok(/const rng\s*=\s*_evalRng\(cf\)/.test(src), 'la evaluación conceptual siembra con su forma',
  'genEval no deriva su generador de la forma');
ok(/_evalRng\(200000\s*\+\s*cf\)/.test(src), 'el Simulacro de Presión siembra con su propia forma',
  'genEvalCrit no tiene semilla propia');
ok(!/_pick\((?:eval|crit)[A-Za-z]*Bank/.test(src), 'ninguna sección quedó eligiendo al azar',
  'queda algún _pick( sin semilla en una prueba');
ok(/_injectFormaSel\('genEval'/.test(src) || /_evalFormaSelector\(\)/.test(src),
  'la conceptual deja elegir la forma exacta', 'falta el selector de forma en la conceptual');
ok(/_injectFormaSel\('genEvalCrit'/.test(src), 'el Simulacro deja elegir la forma exacta',
  'falta el selector de forma en el Simulacro');

/* ── 1. Evaluación conceptual ── */
console.log('\n🎓 Evaluación conceptual (4 secciones × 5 preguntas)');
const CP = banco('evalCPBank'), TF = banco('evalTFBank'), MC = banco('evalMCBank'), PR = banco('evalPRBank');
ok(CP && TF && MC && PR, 'los cuatro bancos se leen', 'no se pudo leer algún banco');
[['evalCPBank', CP], ['evalTFBank', TF], ['evalMCBank', MC], ['evalPRBank', PR]].forEach(([n, b]) => {
  ok(b && b.length >= 15, `${n}: ${b ? b.length : 0} preguntas (mínimo 15)`,
     `${n} tiene ${b ? b.length : 0}, y el estándar pide 15`);
});

function formaConceptual(cf) {
  const rng = _evalRng(cf);
  const cp = _pickF(CP, 5, rng), tf = _pickF(TF, 5, rng), mc = _pickF(MC, 5, rng);
  const pr = _pickF(PR, 5, rng);
  let defs = _shuffleF(pr, rng), t = 0;
  while (defs.some((d, i) => d.def === pr[i].def) && t < 20) { defs = _shuffleF(defs, rng); t++; }
  return { cp, tf, mc, pr, defs };
}

const huellas = new Set();
let usadasCP = new Set(), usadasTF = new Set(), usadasMC = new Set(), usadasPR = new Set();
let pareadosDelatan = 0;
for (let cf = 1; cf <= EVAL_FORMAS; cf++) {
  const a = JSON.stringify(formaConceptual(cf));
  const b = JSON.stringify(formaConceptual(cf));
  if (a !== b) { fallos++; console.log(`  ✘ la Forma ${cf} no se repite igual`); }
  huellas.add(a);
  const f = formaConceptual(cf);
  f.cp.forEach(x => usadasCP.add(x.q)); f.tf.forEach(x => usadasTF.add(x.q));
  f.mc.forEach(x => usadasMC.add(x.q)); f.pr.forEach(x => usadasPR.add(x.term));
  if (f.defs.some((d, i) => d.def === f.pr[i].def)) pareadosDelatan++;
}
ok(huellas.size === EVAL_FORMAS, `las ${EVAL_FORMAS} formas se repiten idénticas y son distintas entre sí`,
  `solo ${huellas.size} formas distintas de ${EVAL_FORMAS}`);
ok(usadasCP.size === CP.length && usadasTF.size === TF.length && usadasMC.size === MC.length && usadasPR.size === PR.length,
  'entre las 30 formas se usan todas las preguntas del banco',
  `sin usar nunca: CP ${CP.length - usadasCP.size} · TF ${TF.length - usadasTF.size} · MC ${MC.length - usadasMC.size} · PR ${PR.length - usadasPR.size}`);
ok(pareadosDelatan === 0, 'ningún pareado deja la definición frente a su término',
  `${pareadosDelatan} formas dejan la columna B delatando la clave`);

/* ── 2. Simulacro de Presión ── */
console.log('\n🧠 Simulacro de Presión (5 secciones × 20 pts)');
const CASE = banco('critCaseBank'), ERR = banco('critErrorBank'), DEC = banco('critDecisionBank'),
      CMP = banco('critCompareBank'), CAU = banco('critCauseBank'), EFE = banco('critEffectBank');
[['critCaseBank', CASE, 5], ['critErrorBank', ERR, 5], ['critDecisionBank', DEC, 5],
 ['critCompareBank', CMP, 5], ['critCauseBank', CAU, 5], ['critEffectBank', EFE, 5]].forEach(([n, b, min]) => {
  ok(b && b.length >= min, `${n}: ${b ? b.length : 0} casos`, `${n} tiene ${b ? b.length : 0}, hacen falta ${min}`);
});

function formaCrit(cf) {
  const r = _evalRng(200000 + cf);
  return {
    kase: _rotaF(CASE, cf), err: _rotaF(ERR, cf), dec: _rotaF(DEC, cf),
    cmp: _rotaF(CMP, cf), causes: _pickF(CAU, 2, r), effects: _pickF(EFE, 3, r),
  };
}
const huellasC = new Set();
const usadasCase = new Set(), usadasDec = new Set();
for (let cf = 1; cf <= EVAL_FORMAS; cf++) {
  const a = JSON.stringify(formaCrit(cf)), b = JSON.stringify(formaCrit(cf));
  if (a !== b) { fallos++; console.log(`  ✘ la Forma ${cf} del Simulacro no se repite igual`); }
  huellasC.add(a);
  const f = formaCrit(cf);
  usadasCase.add(f.kase.txt); usadasDec.add(f.dec);
  if (new Set(f.causes.map(c => c.cause)).size !== 2) { fallos++; console.log(`  ✘ la Forma ${cf} repite una causa`); }
  if (new Set(f.effects.map(e => e.effect)).size !== 3) { fallos++; console.log(`  ✘ la Forma ${cf} repite un efecto`); }
}
ok(huellasC.size >= EVAL_FORMAS * 0.8, `${huellasC.size} combinaciones distintas en ${EVAL_FORMAS} formas`,
  `solo ${huellasC.size} combinaciones distintas: los bancos son demasiado pequeños`);
ok(usadasCase.size === CASE.length, 'entre las 30 formas salen todos los casos',
  `${CASE.length - usadasCase.size} casos no salen nunca`);
ok(usadasDec.size === DEC.length, 'entre las 30 formas salen todas las decisiones',
  `${DEC.length - usadasDec.size} decisiones no salen nunca`);

/* ── 3. La prueba habla de esta misión, no del molde ── */
console.log('\n📝 Adecuación al contenido');
const heredado = ['arquitectura de M.E.T.A.S', 'panorama técnico', 'interpelación del ingeniero',
                  'offline-first', 'ciclo percibir → decidir'];
const colados = heredado.filter(t => src.includes(t));
ok(colados.length === 0, 'no quedan textos del molde de otra misión',
  'textos heredados que hay que adecuar: ' + colados.join(', '));
ok(/Simulacro de Presión/.test(src), 'la prueba competencial se llama Simulacro de Presión',
  'no aparece el nombre de la prueba');

console.log('\n' + (fallos ? `✖ ${fallos} fallo(s)` : '✅ TODO EN ORDEN: las 30 formas son deterministas y la prueba habla de las palancas.'));
process.exit(fallos ? 1 : 0);
