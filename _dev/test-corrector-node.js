// Prueba de Node del corrector que enseña (reglas + diccionario).
//
//   node _dev/test-corrector-node.js
//
// Carga js/tools/corrector.js en un salón vacío (stubs de document y
// localStorage), le enchufa el diccionario de verdad y comprueba que
// el análisis caza lo que debe cazar y calla ante texto limpio. La
// estrella es el texto REAL que destapó el hueco: «conveza» (por
// convenza) pasaba de largo porque no había diccionario.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

/* ── El salón vacío donde corre corrector.js ── */
const dicc = require(path.join(RAIZ, 'js/tools/diccionario.js'));
const contexto = {
  console,
  document: { addEventListener: () => {}, getElementById: () => null, querySelector: () => null, createRange: () => null },
  window: {},
  Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  diccListo: dicc.diccListo,
  diccEstado: dicc.diccEstado,
  diccConoce: dicc.diccConoce,
  diccSugerencias: dicc.diccSugerencias,
  diccAprender: dicc.diccAprender,
  redEsc: s => String(s),
};
contexto.globalThis = contexto;
vm.createContext(contexto);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'js/tools/corrector.js'), 'utf8'), contexto, { filename: 'corrector.js' });
const analizar = texto => vm.runInContext('corAnalizarTexto', contexto)(texto, 'cuerpo');

/* ── Cargar el diccionario de verdad ── */
const t0 = Date.now();
dicc.diccCargarDesdeTexto(
  fs.readFileSync(path.join(RAIZ, 'js/data/dicc/es_HN.aff'), 'utf8'),
  fs.readFileSync(path.join(RAIZ, 'js/data/dicc/es_HN.dic'), 'utf8'),
  fs.readFileSync(path.join(RAIZ, 'js/data/dicc/es_extra.dic'), 'utf8'));
console.log(`diccionario cargado en ${Date.now() - t0} ms`);

let fallos = 0;
function ok(c, bien, mal) {
  if (c) console.log('  ✔ ' + bien);
  else { fallos++; console.log('  ✘ ' + mal); }
}
/* ¿Hay un hallazgo de esta regla cuyo original (o extracto) case? */
function caza(hs, reglaId, original, sugerencia) {
  return hs.some(h => h.regla.id === reglaId &&
    (original === undefined || h.original === original) &&
    (sugerencia === undefined || h.sugerencia === sugerencia));
}

console.log('\n── 1. El texto real de la casa (el que destapó el hueco) ──');
const TEXTO_CASA =
  'Haber encontrado al filósofo español Gustavo Bueno fue en mi autodidactismo como un punto de no retorno. ' +
  'Las filosofías y creencias que uno va cargando en la vida, nos curtieron con la filosofía occidental. ' +
  'En realidad aprendimos con  notas al pie de página de Platón y Aristóteles sobre todo en los bachilleratos y universidades.\n' +
  'Comprender un poco el materialismo filosófico de Gustavo Bueno permite haber encontrado el fundamento para analizar los acontecimientos. ' +
  'Temas como la democracia o asuntos tan dispares, los analizo con la filosfía de Bueno.\n' +
  'El rechazo a los idealismos, la realidad material con su sistema filósofico fue como encontrar una verdad de la que dudo haya más búsquedas. ' +
  'Paradójicamente temo caer en idealismos, sin embargo mientras no encuentre otro pensador, que me conveza en su lucidez para explicar la realidad, será muy difícil cambiar de opinión. ' +
  'Daba la casualidad que cuando estudiaba al filósofo español también leía sobre el estudio de los mitos de Joseph Campbell.';
const hsCasa = analizar(TEXTO_CASA);
ok(caza(hsCasa, 'tecleo', 'conveza', 'convenza'),
  '«conveza» cazada, con «convenza» de sugerencia',
  'NO cazó «conveza»: el hueco sigue abierto');
ok(caza(hsCasa, 'tecleo', 'filosfía', 'filosofía'),
  '«filosfía» cazada → «filosofía»', 'NO cazó «filosfía»');
ok(caza(hsCasa, 'tecleo', 'filósofico', 'filosófico'),
  '«filósofico» (tilde en la sílaba equivocada) → «filosófico»', 'NO cazó «filósofico»');
ok(!hsCasa.some(h => h.regla.id === 'tecleo' && ['curtieron', 'autodidactismo', 'idealismos', 'búsquedas', 'bachilleratos'].includes(h.original)),
  'y no acusa a «curtieron», «autodidactismo», «idealismos», «búsquedas»…',
  'FALSO POSITIVO del diccionario: ' + hsCasa.filter(h => h.regla.id === 'tecleo').map(h => h.original).join(', '));
ok(!hsCasa.some(h => ['Gustavo', 'Bueno', 'Platón', 'Aristóteles', 'Campbell', 'Joseph'].includes(h.original) && h.regla.id === 'tecleo'),
  'los nombres propios conocidos no se marcan como tecleo',
  'acusó de tecleo a un nombre propio conocido');
ok(caza(hsCasa, 'doble-espacio'), 'los dobles espacios siguen cayendo', 'perdió los dobles espacios');

console.log('\n── 2. Niveles y sugerencias del diccionario ──');
const hsProp = analizar('Estuve leyendo a Vorlandia toda la tarde.');
ok(hsProp.some(h => h.regla.id === 'nombre-propio' && h.original === 'Vorlandia' && h.regla.nivel === 'revisa'),
  'mayúscula desconocida en medio de oración → «¿nombre propio o tecleo?» (revisa)',
  'no trató la mayúscula desconocida como posible nombre propio');
const hsIni = analizar('Conveza fue lo que escribió.');
ok(hsIni.some(h => h.regla.id === 'tecleo' && h.original === 'Conveza' && h.sugerencia === 'Convenza'),
  'desconocida al inicio de oración → tecleo, sugerencia con su Mayúscula',
  'no cazó la desconocida a inicio de oración o perdió la mayúscula');
const hsSiglas = analizar('El ADN de FARO es aprender. Visita ejemplo.com o escribe a jepl@ejos.page ya.');
ok(!hsSiglas.some(h => h.regla.id === 'tecleo' || h.regla.id === 'nombre-propio'),
  'siglas, dominios y correos quedan en paz',
  'acusó siglas/URL/correo: ' + hsSiglas.filter(h => h.regla.manual).map(h => h.original).join(', '));

console.log('\n── 3. El diccionario aprende y respeta lo aprendido ──');
dicc.diccAprender('Polanco');
const hsAprendida = analizar('La familia Polanco escribe.');
ok(!hsAprendida.some(h => h.original === 'Polanco'),
  '«Polanco» aprendida ya no se marca', 'sigue marcando la palabra aprendida');
dicc.diccOlvidar('Polanco');

console.log('\n── 4. Las reglas de siempre no se rompieron ──');
const hsViejas = analizar('Fué un exito. Pienso de que habían muchos alumnos enmedio del aula aula. Como lo haremos?');
['monosilabos', 'dequeismo', 'haber-plural', 'pegadas', 'duplicada', 'abrir-pregunta'].forEach(id =>
  ok(hsViejas.some(h => h.regla.id === id), `caza «${id}»`, `perdió la regla «${id}»`));
ok(caza(hsViejas, 'tecleo', 'exito', 'éxito'),
  'y «exito» sin tilde cae por el diccionario → «éxito»', 'no cazó «exito»');

console.log('\n── 5. Texto limpio: ni un hallazgo de nivel error ──');
const hsLimpio = analizar('La educación mejora cuando el maestro pregunta: ¿qué aprendimos hoy? Nada más.');
ok(hsLimpio.filter(h => h.regla.nivel === 'error').length === 0,
  'cero errores inventados en texto correcto',
  'inventó: ' + hsLimpio.filter(h => h.regla.nivel === 'error').map(h => h.regla.id + ':' + h.original).join(', '));

console.log('\n── 6. Las reglas ampliadas cumplen sus propias pruebas ──');
/* El catálogo _dev/reglas-ampliadas.json guarda, junto a cada regla,
   sus pruebas (frases con el error y frases correctas parecidas).
   Aquí se corren contra el corrector COMPILADO: si la fusión de
   _dev/fusiona-reglas.js torciera un regex o una sugerencia al
   generar el código, esto lo delata. */
const RUTA_AMPLIADAS = path.join(__dirname, 'reglas-ampliadas.json');
if (!fs.existsSync(RUTA_AMPLIADAS)) {
  console.log('  (aún no hay reglas-ampliadas.json: nada que probar)');
} else {
  const { reglas } = JSON.parse(fs.readFileSync(RUTA_AMPLIADAS, 'utf8'));
  const COR_REGLAS = vm.runInContext('COR_REGLAS', contexto);
  const corSugerencia = vm.runInContext('corSugerencia', contexto);
  const corMayus = vm.runInContext('corMayus', contexto);
  let pruebas = 0, malas = 0;
  for (const spec of reglas) {
    const regla = COR_REGLAS.find(r => r.id === spec.id);
    if (!regla) { malas++; console.log(`  ✘ la regla «${spec.id}» no está en el corrector`); continue; }
    for (const p of (spec.pruebas?.positivas || [])) {
      pruebas++;
      regla.re.lastIndex = 0;
      const m = regla.re.exec(p.texto);
      if (!m) { malas++; console.log(`  ✘ ${spec.id}: no casa «${p.texto}»`); continue; }
      if (m[0] !== p.original) { malas++; console.log(`  ✘ ${spec.id}: casó «${m[0]}» ≠ «${p.original}»`); continue; }
      const sug = corSugerencia(regla, m);
      const esperada = p.sugerencia === undefined ? null : p.sugerencia;
      if (sug !== esperada && sug !== corMayus(p.original, esperada || '')) {
        malas++; console.log(`  ✘ ${spec.id}: sugerencia «${sug}» ≠ «${esperada}» en «${p.texto}»`);
      }
    }
    for (const n of (spec.pruebas?.negativas || [])) {
      pruebas++;
      regla.re.lastIndex = 0;
      const m = regla.re.exec(n);
      if (m) { malas++; console.log(`  ✘ ${spec.id}: FALSO POSITIVO «${m[0]}» en «${n}»`); }
    }
  }
  ok(malas === 0, `${reglas.length} reglas ampliadas · ${pruebas} pruebas, todas en orden`,
    `${malas} prueba(s) de reglas ampliadas fallaron`);
}

console.log('\n── 7. Regresiones de la verificación adversarial ──');
/* Cada caso de aquí fue un hallazgo REAL de los revisores (red-team
   de regexes, filología, motor), con su repro. Si algo de esto
   vuelve a fallar, se rompió un arreglo con nombre y apellido. */

/* 7a. El voseo hondureño es español legítimo */
const hsVos = analizar('No vayás tan rápido y no hagás ruido. Andá a traer agua y jugá con tu primo. Vos sabés que podés.');
ok(!hsVos.some(h => h.regla.manual),
  'el voseo no se acusa (vayás, hagás, andá, jugá, sabés, podés)',
  'acusó voseo: ' + hsVos.filter(h => h.regla.manual).map(h => h.original).join(', '));

/* 7b. Los diminutivos tampoco */
const hsDim = analizar('La abuelita trajo un cafecito y un pancito calientito al mercadito.');
ok(!hsDim.some(h => h.regla.manual),
  'los diminutivos no se acusan (abuelita, cafecito, pancito…)',
  'acusó diminutivos: ' + hsDim.filter(h => h.regla.manual).map(h => h.original).join(', '));

/* 7c. Banderas de continuación del .aff: el plural de segundo nivel */
const hsCont = analizar('Compramos rosquillas y pastelillos en el mercado.');
ok(!hsCont.some(h => h.regla.manual),
  'rosquillas y pastelillos existen (continuación hunspell)',
  'acusó formas de continuación: ' + hsCont.filter(h => h.regla.manual).map(h => h.original).join(', '));

/* 7d. La oración kilométrica ya no se traga los errores de dentro */
const relleno = 'porque la vida sigue y sigue con calma y paciencia mientras todos miran el cielo azul de la tarde serena '.repeat(3);
const hsLarga = analizar('Pienso que me conveza enmedio del debate ' + relleno.trim() + '.');
ok(hsLarga.some(h => h.regla.id === 'oracion-larga'),
  'la oración de 50+ palabras se señala como kilométrica', 'no vio la oración larga');
ok(hsLarga.some(h => h.original === 'conveza') && hsLarga.some(h => h.regla.id === 'pegadas'),
  'y los errores DE DENTRO (conveza, enmedio) siguen visibles',
  'la zona se tragó los errores internos: ' + hsLarga.map(h => h.regla.id).join(', '));

/* 7e. Español correcto que las reglas de error ya no tocan */
const correctas = [
  ['Prefiero este porque es más barato.', 'porque-sust'],
  ['Para diciembre, los dos van a haber cumplido dieciocho años.', 'van-a-haber'],
  ['¿Que no te lo dije yo?', 'interrogativos'],
  ['Su fama resulta de que nunca miente.', 'dequeismo'],
  ['Con tal que estudien, los dejo jugar.', 'queismo'],
  ['Pasó sus vacaciones en Bora Bora con la familia.', 'duplicada'],
  ['Se oyó un ja ja ja al fondo del aula.', 'duplicada'],
  ['La comisión ultima los detalles del festival.', 'tilde-comun'],
  ['El haz dado por el láser es muy fino.', 'haz-auxiliar'],
  ['¿Cuando termine la lluvia, salimos al patio?', 'interrogativos'],
];
for (const [frase, reglaId] of correctas) {
  const hs7 = analizar(frase);
  ok(!hs7.some(h => h.regla.id === reglaId),
    `«${frase.slice(0, 44)}…» queda en paz (${reglaId})`,
    `FALSO POSITIVO de ${reglaId} en: ${frase}`);
}

/* 7f. Y los errores hermanos que sí lo son se siguen cazando */
const hsY = analizar('¿Y como te fue en el examen?');
ok(hsY.some(h => h.regla.id === 'interrogativos' && h.sugerencia === '¿Y cómo'),
  '«¿Y como te fue?» → «¿Y cómo» (el arranque átono ya no lo esconde)',
  'se escapó «¿Y como te fue?»');
const hsUlt = analizar('Fue el ultimo día de clases.');
ok(hsUlt.some(h => h.regla.id === 'ultimo-con-articulo' && h.sugerencia === 'el último'),
  '«el ultimo día» → «el último» (con artículo es adjetivo seguro)',
  'se escapó «el ultimo día»');

/* 7g. El «?» de una cita entrecomillada o de una URL no es pregunta */
const hsCita = analizar('El cartel decía "Why not?" en letras grandes. Más datos en ejemplo.com/busca?q=perros para todos.');
ok(!hsCita.some(h => h.regla.id === 'abrir-pregunta'),
  'el «?» entre comillas o en URL no pide «¿» de apertura',
  'pidió abrir pregunta por un «?» ajeno al texto');

/* 7h. corAplicar no toca texto que ya cambió (offsets rancios) */
const elFalso = { value: 'Sí, la educacion importa.' };
contexto.document.getElementById = id => (id === 'red-e-titulo' ? elFalso : null);
const corAplicar = vm.runInContext('corAplicar', contexto);
const rancio = { campo: 'titulo', ini: 3, fin: 12, original: 'educacion', sugerencia: 'educación' };
ok(corAplicar(rancio) === false && elFalso.value === 'Sí, la educacion importa.',
  'una corrección con índices viejos se niega a aplicar (no corrompe)',
  'corAplicar aplicó a ciegas sobre texto cambiado: ' + elFalso.value);
const fresco = { campo: 'titulo', ini: 7, fin: 16, original: 'educacion', sugerencia: 'educación' };
ok(corAplicar(fresco) === true && elFalso.value === 'Sí, la educación importa.',
  'y con índices que cuadran, aplica normal',
  'el cinturón bloquea también lo correcto: ' + elFalso.value);
contexto.document.getElementById = () => null;

console.log('\n' + (fallos === 0 ? 'RESULTADO: APRUEBA ✔' : `RESULTADO: SUSPENDE · ${fallos} fallo(s) ✘`));
process.exit(fallos === 0 ? 0 : 1);
