// Prueba de Node del NÚCLEO de 📜 La Consigna (js/tools/consigna.js).
//
//   node _dev/test-consigna-node.js
//
// Carga el js/tools/consigna.js DE VERDAD —el archivo entero, tal como lo
// cargará index.html— en salones vacíos de vm, con dobles de document,
// window, localStorage y de la nube, y prueba todo lo que no es pantalla.
// Termina con «RESULTADO: APRUEBA» o «RESULTADO: SUSPENDE (n fallos)», y
// sale con 1 si suspende. Tarda unos segundos: la parte 5 cronometra
// textos de sesenta mil caracteres a propósito.
//
// Qué vigila, de lo más grave a lo menos:
//
//  1. QUE CARGAR EL ARCHIVO NO TIRE F.A.R.O ENTERO. Los <script> de
//     index.html comparten un solo ámbito: una función con el nombre de
//     otro archivo lo pisa sin avisar (pasó con corAbrir), un `const`
//     repetido tumba el archivo entero al cargar, y uno que toque el DOM
//     al cargarse revienta en cuanto el DOM no es el que esperaba. Se mira
//     el archivo ENTERO: un choque entre dos trozos solo existe con todos
//     los trozos juntos.
//  2. QUE LO QUE SE COPIA SEA LO QUE DICE LA ESPECIFICACIÓN, CARÁCTER POR
//     CARÁCTER (regla 1). Los ejemplos del §7 se SACAN de
//     PLAN-LA-CONSIGNA.md, no se copian aquí: una copia escrita en la
//     prueba se quedaría vieja el día que alguien corrigiera el plan, y
//     aprobaría contra un texto que ya no es la especificación. Y csgArmar
//     tiene que ser PURA (regla 2): se apunta cada vez que alguien toca el
//     DOM, el almacén o la red.
//  3. QUE NO SE PIERDA NADA EN LA NUBE: ninguna fila viaja sin firma; la
//     poda mide como mide PostgreSQL, así que el `check` no rebota; la
//     lápida gana; usos y versiones se juntan por unión; un corte de red
//     no vacía la lista; y 42P01, 42703 y el reloj se nombran por su
//     causa. La base de mentira EXIGE lo que exige la de verdad (23502 sin
//     autor, 42703 nombrando la columna, 23514 midiendo como jsonb::text):
//     un doble complaciente esconde la costura (La Voz Prestada, regla 13).
//  4. QUE PEGAR NO PARTA EL TEXTO DE NADIE NI DESCARTE UNA PALABRA (la
//     asimetría, regla 8). En TODOS los casos se cuadran las palabras de
//     entrada y de salida dos veces: contando y comparando la bolsa de
//     palabras, que es más dura —una cuenta puede cuadrar por casualidad;
//     una bolsa, no—. Y lo que sale de aquí vuelve a entrar entero: los 17
//     moldes, armados y pegados otra vez.
//  5. QUE EL REPASO NO DEJE USAR LO QUE NO SE PUEDE USAR —un bucle sin
//     tope, una arista a ninguna parte, un SKILL.md que no cargaría nunca—
//     ni avise en falso; y que no congele la pantalla, porque corre en
//     cada tecla: se cronometra con textos hechos para que una expresión
//     regular vuelva atrás desde cada carácter.
//  6. QUE LOS DATOS SIGAN A LA ESPECIFICACIÓN: los 18 moldes con sus
//     marcas, los sinónimos del §5 enteros, las máquinas, los topes contra
//     los `check` de consigna.sql, y cada texto literal del JS (frases,
//     ejemplos, rótulos, textos de los bucles) escrito tal cual en el plan.
//
// Con CONSIGNA_RUTA=<copia> se corre contra una copia averiada a
// propósito: es como se comprueba que la prueba MUERDE. Una prueba que no
// ha visto nunca un fallo puede estar aprobando por el motivo equivocado.
// Se comprobó así el 23 de septiembre de 2026, al juntar los cuatro
// trozos del núcleo: con 89 averías —las 40 del armado y las 28 del lector
// que traían sus autores, 13 de la nube y 8 de la costura entre trozos—
// suspende con todas. Una de ellas (quitar el reloj de la nube) destapó
// que una promesa que no vuelve dejaba salir a Node callado y con un 0:
// de ahí el reloj de cada sección y la guardia del final.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');

const RAIZ = path.join(__dirname, '..');
const RUTA = process.env.CONSIGNA_RUTA || path.join(RAIZ, 'js/tools/consigna.js');
const FUENTE = fs.readFileSync(RUTA, 'utf8');
const PLAN = fs.readFileSync(path.join(RAIZ, 'PLAN-LA-CONSIGNA.md'), 'utf8');
const SQL = (() => { try { return fs.readFileSync(path.join(RAIZ, 'supabase/sql/consigna.sql'), 'utf8'); } catch (e) { return null; } })();

let fallos = 0, total = 0;
function ok(c, msg, detalle) {
  total++;
  if (c) { console.log('  ✔ ' + msg); return true; }
  fallos++;
  const d = detalle === undefined || detalle === null ? '' : String(detalle);
  console.log('  ✘ ' + msg + (d ? '\n      ' + d.split('\n').join('\n      ') : ''));
  return false;
}
/* La diferencia exacta, para que un fallo de una línea en blanco no haya
   que buscarlo a ojo en cuarenta renglones. */
function diff(a, b) {
  if (a === b) return '';
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const linea = a.slice(0, i).split('\n').length;
  return 'primera diferencia en el carácter ' + i + ' (renglón ' + linea + ')\n' +
    'salió:    ' + JSON.stringify(a.slice(Math.max(0, i - 40), i + 60)) + '\n' +
    'esperado: ' + JSON.stringify(b.slice(Math.max(0, i - 40), i + 60));
}
function igual(a, b, msg) { return ok(a === b, msg, diff(String(a), String(b))); }
function parte(n, titulo) { console.log('\n══════ ' + n + '. ' + titulo + ' ══════'); }
/* Cada sección se encierra: una prueba que revienta a medias sin decir
   SUSPENDE se lee, en tanda, igual que una que nadie corrió. */
function seccion(titulo, fn) {
  console.log('\n── ' + titulo + ' ──');
  try { fn(); } catch (e) { ok(false, 'la sección revienta en vez de decir qué falla', String(e && e.stack || e).split('\n').slice(0, 4).join('\n')); }
}
/* ⚠️ Las secciones de la nube esperan promesas, y una promesa que NO
   VUELVE —no que falla: que no vuelve— se queda esperando para siempre.
   Por eso cada una lleva su reloj: si no termina en diez segundos, se
   dice y se sigue con la siguiente. Es la misma lección que csgConReloj. */
const ESPERA_SECCION = 10000;
async function seccionA(titulo, fn) {
  console.log('\n── ' + titulo + ' ──');
  let reloj = null;
  const limite = new Promise(res => { reloj = setTimeout(() => res('limite'), ESPERA_SECCION); });
  try {
    const r = await Promise.race([Promise.resolve().then(fn).then(() => 'bien'), limite]);
    if (r === 'limite') ok(false, 'la sección no terminó en ' + ESPERA_SECCION / 1000 + ' s: alguna promesa no vuelve nunca');
  } catch (e) { ok(false, 'la sección revienta en vez de decir qué falla', String(e && e.stack || e).split('\n').slice(0, 4).join('\n')); }
  finally { clearTimeout(reloj); }
}
let terminada = false;
function veredicto() {
  terminada = true;
  console.log('\n' + total + ' comprobaciones');
  console.log(fallos ? 'RESULTADO: SUSPENDE (' + fallos + (fallos === 1 ? ' fallo)' : ' fallos)') : 'RESULTADO: APRUEBA');
  process.exit(fallos ? 1 : 0);
}
/* Y por si algo revienta fuera de una sección, el veredicto sale igual. */
process.on('uncaughtException', e => { console.log('  ✘ la prueba revienta: ' + (e && e.stack || e)); fallos++; veredicto(); });
process.on('unhandledRejection', e => { console.log('  ✘ la prueba revienta: ' + (e && e.stack || e)); fallos++; veredicto(); });
/* ⚠️ Y SI SE ACABA SIN VEREDICTO, SUSPENDE. Cuando lo único que queda es
   una promesa que no vuelve, Node se queda sin nada que esperar y sale
   callado y con un 0: una prueba que no llegó al final se leería, en
   tanda, igual que una que aprobó. Se comprobó con una avería que quitaba
   el reloj de la nube. */
process.on('exit', () => {
  if (terminada) return;
  console.log('  ✘ la prueba se acabó sin llegar al final: alguna promesa se quedó sin volver');
  console.log('RESULTADO: SUSPENDE (la prueba no llegó al veredicto)');
  process.exitCode = 1;
});

/* Los ejemplos del §7: el texto entre las vallas del primer bloque de
   código que viene detrás de `marca`. Las vallas de ~~~ se respetan:
   dentro llevan ```. Devuelve null si el plan ya no trae esa marca. */
function ejemplo(marca) {
  const i = PLAN.indexOf(marca);
  if (i < 0) return null;
  const m = /\n(```|~~~)\n/.exec(PLAN.slice(i));
  if (!m) return null;
  const ini = i + m.index + m[0].length;
  const fin = PLAN.indexOf('\n' + m[1] + '\n', ini);
  return fin < 0 ? null : PLAN.slice(ini, fin);
}
const sinTildesP = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* ══════════════════════════════════════════════════════════════════
   LOS SALONES. Cada parte corre en el suyo, con los dobles que necesita,
   y en todos se carga el MISMO archivo entero.
   ══════════════════════════════════════════════════════════════════ */
function cargaEn(ctx) {
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(FUENTE, ctx, { filename: 'js/tools/consigna.js' });
  return n => vm.runInContext(n, ctx);
}

/* El salón que APUNTA: cada vez que alguien toca el DOM, el almacén o la
   red se apunta. Es la única manera de saber si el archivo toca algo al
   cargarse y si csgArmar es pura: mirar si alguien llamó a la puerta. */
function salonQueApunta() {
  const toques = [];
  const ctx = { console, Intl };
  const falsos = {
    document: { addEventListener() {}, getElementById: () => null, querySelector: () => null, createElement: () => ({}) },
    window: {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: {},
    fetch: () => Promise.reject(new Error('sin red')),
  };
  for (const k of Object.keys(falsos)) {
    Object.defineProperty(ctx, k, { get() { toques.push(k); return falsos[k]; }, configurable: true, enumerable: true });
  }
  const L = cargaEn(ctx);
  return { ctx, toques, L };
}

/* El salón del lector: document, window, localStorage y navigator son
   espías que apuntan cualquier toque, y MIEMBROS es uno de mentira con los
   nombres de la casa, para que el aviso de «nombre de la casa» tenga qué
   buscar (el de verdad vive en js/auth.js). */
function salonEspia() {
  const toques = [];
  const espia = nombre => new Proxy(function () {}, {
    get(t, k) { if (k === Symbol.toPrimitive || k === 'then') return undefined; toques.push(nombre + '.' + String(k)); return espia(nombre + '.' + String(k)); },
    apply() { toques.push(nombre + '()'); return undefined; },
  });
  const ctx = { console, document: espia('document'), window: espia('window'), localStorage: espia('localStorage'), navigator: espia('navigator') };
  ctx.MIEMBROS = { josue: { nombre: 'Josué Edmundo' }, evelyn: { nombre: 'Evelyn Sarahí' }, jael: { nombre: 'Jael' }, angelly: { nombre: 'Angelly' } };
  const L = cargaEn(ctx);
  return { ctx, toques, L };
}

/* ══════════════════════════════════════════════════════════════════
   1. LA CARGA
   ══════════════════════════════════════════════════════════════════ */
let SA = null;   // el salón que apunta: lo usa también la parte 2
/* Las piezas del §7 que arma la parte 2: la parte 5 las repasa (un aviso
   que salta en las piezas modelo del propio plan avisa de más). Se quedan
   en null si la parte 2 no llegó a escribirlas, y entonces la 5.6 lo dice. */
let PIEZAS7 = null;

const CONTRATO = {
  datos: ['CSG_EMOJI', 'CSG_LEMA', 'CSG_CLASES', 'CSG_BLOQUES', 'CSG_BLOQUES_PROMPT', 'CSG_MOLDES', 'CSG_MOLDES_ORDEN', 'CSG_EQUIVALE',
    'CSG_SINONIMOS', 'CSG_PATRONES_BUCLE', 'CSG_MAQUINAS', 'CSG_TOPES', 'CSG_PREFILL_MAX', 'CSG_TEXTOS', 'CSG_COLUMNAS', 'CSG_CLAVES', 'CSG_RESERVADAS',
    'CSG_SIN_TITULO'],
  armado: ['csgClave', 'csgSlug', 'csgSlugId', 'csgHoy', 'csgVariables', 'csgMaquina', 'csgBloqueDef', 'csgTextoDe', 'csgRellena', 'csgCuerpo',
    'csgArmar', 'csgMmdId', 'csgMmdTexto', 'csgNodos', 'csgAristas', 'csgExportarTexto'],
  lector: ['csgClaveEtiqueta', 'csgEsArista', 'csgLeer', 'csgProponerMolde', 'csgPalabras', 'csgDatosDeCasa', 'csgRevisar'],
  nube: ['csgNuevoId', 'csgSb', 'csgAutor', 'csgConReloj', 'csgLeeLocal', 'csgGuardaLocal', 'csgDesdeFila', 'csgAFila', 'csgPodar', 'csgFusiona',
    'csgMotivoDe', 'csgBajar', 'csgSubir', 'csgSubirVarios', 'csgSubirPendientes', 'csgPersistir', 'csgSubirLuego', 'csgRotuloNube', 'csgVivas',
    'csgRetiradas', 'csgDe', 'csgApuntarUso', 'csgContestarUso', 'csgNuevaVersion', 'csgVolverAVersion', 'csgPersistirVarios'],
  estado: ['_csgLista', '_csgCargada', '_csgNube', '_csgHayTabla', '_csgColsFuera', '_csgInitEnCurso', '_csgSinEspacio'],
  /* Lo que se añadió al juntar los trozos, y que la pantalla va a usar:
     una sola manera de quitar tildes y de escribir miles, el texto crudo
     que decide si nace una versión, la medida de lo que no cabe que
     comparten el repaso y la franja, y el arranque de los datos. */
  costura: ['csgSinTildes', 'csgMiles', 'csgMdCrudo', 'csgSobraBloques', 'csgTextoRecorta', 'csgLargoBase', 'csgCargar'],
};

/* Los nombres de arriba del todo de un archivo, con su clase. */
function nombresArriba(src) {
  return [...src.matchAll(/^(?:async\s+)?(function\s*\*?\s*|const\s+|let\s+|var\s+|class\s+)([A-Za-z_$][\w$]*)/gm)]
    .map(m => ({ n: m[2], fn: /^function/.test(m[1]) }));
}

function parte1() {
  parte(1, 'La carga: el archivo entero, sin tirar F.A.R.O');

  seccion('1.1 Sintaxis y carga en un salón vacío', () => {
    let bien = true, err = '';
    try { cp.execFileSync(process.execPath, ['--check', RUTA], { stdio: 'pipe' }); } catch (e) { bien = false; err = String(e.stderr); }
    ok(bien, 'node --check js/tools/consigna.js', err);
    let cargado = true;
    try { SA = salonQueApunta(); } catch (e) { cargado = false; err = String(e && e.stack || e); }
    ok(cargado, 'el archivo entero carga en un vm (vocabulario, datos, armado, lector y nube juntos)', err);
    if (!cargado) { console.log('\nSin carga no hay nada más que probar.'); veredicto(); }
    ok(!SA.toques.length, 'al cargar no se toca ni el DOM, ni el almacén, ni la red', 'tocados: ' + SA.toques.join(', '));
    /* El salón de la nube REVIENTA si se toca document: aquí se carga para
       ver que ni siquiera se mira. */
    let limpio = true;
    try { cargaEn({ console, document: new Proxy({}, { get(_, k) { throw new Error('se tocó document.' + String(k) + ' al cargar'); } }), window: {} }); }
    catch (e) { limpio = false; err = e.message; }
    ok(limpio, 'y carga igual con un document que revienta si se le toca', err);
  });

  seccion('1.2 El contrato entre los trozos está entero', () => {
    const L = SA.L;
    for (const [trozo, nombres] of Object.entries(CONTRATO)) {
      const faltan = nombres.filter(n => {
        const t = L('typeof ' + n);
        if (trozo === 'datos' || trozo === 'estado') return t === 'undefined';
        return t !== 'function';
      });
      ok(!faltan.length, 'están las ' + nombres.length + ' piezas del contrato de ' + trozo, 'faltan: ' + faltan.join(', '));
    }
  });

  seccion('1.3 Los nombres: prefijo, sin repetir, y ninguno de otro archivo de la casa', () => {
    const mios = nombresArriba(FUENTE);
    /* initConsigna es la ÚNICA sin prefijo, y a propósito: es el nombre
       por el que la llama switchView (js/app.js), igual que initRodaje o
       initVozPrestada en las vecinas. Se admite por su nombre exacto y ningún
       otro: una lista de excepciones que crece es un prefijo que ya no
       protege nada. */
    const sinPrefijoPermitida = n => n === 'initConsigna';
    const fns = mios.filter(x => x.fn).map(x => x.n), vars = mios.filter(x => !x.fn).map(x => x.n);
    ok(mios.length > 150 && fns.every(n => /^csg/.test(n) || sinPrefijoPermitida(n)) && vars.every(n => /^(CSG_|_csg)/.test(n)),
      'las ' + mios.length + ' declaraciones de arriba llevan prefijo: funciones csg…, constantes CSG_… y _csg… (y la puerta initConsigna)',
      'sin prefijo: ' + mios.filter(x => x.fn ? !(/^csg/.test(x.n) || sinPrefijoPermitida(x.n)) : !/^(CSG_|_csg)/.test(x.n)).map(x => x.n).join(', '));
    const cuenta = new Map();
    mios.forEach(x => cuenta.set(x.n, (cuenta.get(x.n) || 0) + 1));
    const dobles = [...cuenta].filter(([, k]) => k > 1).map(([n, k]) => n + ' ×' + k);
    ok(!dobles.length, 'ningún nombre se declara dos veces dentro del archivo (una función repetida pisa a la otra sin avisar)', dobles.join(', '));
    /* Ningún otro archivo de js/ usa ya uno de estos nombres: los <script>
       de index.html comparten ámbito. Se mira js/ entero y no solo lo que
       carga index.html: lo que hoy carga una misión puede cargarlo mañana
       la aplicación. */
    let casa = [];
    try {
      casa = cp.execSync(`grep -rhoE "^(async )?(function|const|let|var|class) [A-Za-z_$][A-Za-z0-9_$]*" "${path.join(RAIZ, 'js')}" --include=*.js --exclude=consigna.js | sed -E 's/^(async )?(function|const|let|var|class) //'`).toString().split('\n').filter(Boolean);
    } catch (e) { casa = []; }
    const casaSet = new Set(casa);
    ok(casa.length > 1000 && mios.every(x => !casaSet.has(x.n)), 'ningún nombre del archivo existe ya en otro archivo de js/ (' + casa.length + ' nombres de la casa mirados)',
      mios.filter(x => casaSet.has(x.n)).map(x => x.n).join(', ') || (casa.length ? '' : 'no se pudo leer js/'));
    /* Y el bucle de CLAUDE.md, escrito aquí: las funciones de cada <script>
       de index.html más las de consigna.js, y ninguna en dos archivos. */
    const scripts = (fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').match(/src="js\/[^"]+"/g) || []).map(s => s.slice(5, -1));
    /* consigna.js ya está en index.html desde que se cableó la pantalla:
       se quita de la lista de los <script> y se añade UNA vez desde RUTA
       (que puede ser la copia averiada de CONSIGNA_RUTA). Contado dos
       veces, el bucle veía cada función suya «repetida» consigo misma. */
    const archivos = scripts.filter(s => s !== 'js/tools/consigna.js').map(s => [s, path.join(RAIZ, s)]).concat([['js/tools/consigna.js', RUTA]]);
    const quien = new Map();
    archivos.forEach(([n, r]) => {
      if (!fs.existsSync(r)) return;
      const fs2 = new Set([...fs.readFileSync(r, 'utf8').matchAll(/^(?:async )?function ([A-Za-z_$][A-Za-z0-9_$]*)/gm)].map(m => m[1]));
      fs2.forEach(f => quien.set(f, (quien.get(f) || []).concat([n])));
    });
    const choques = [...quien].filter(([, l]) => l.length > 1).map(([f, l]) => f + ': ' + l.join(' '));
    ok(scripts.length > 20 && !choques.length, 'el bucle de CLAUDE.md (los ' + scripts.length + ' <script> de index.html más consigna.js) no encuentra ninguna función repetida', choques.join('\n'));
  });

  seccion('1.4 Nada escrito que se pierda al copiar el archivo', () => {
    /* Las marcas combinantes (el rango de las tildes sueltas) se escriben
       con escapes: en claro son caracteres invisibles que cualquier editor
       se come al copiar el archivo, y la comparación dejaría de quitar
       tildes sin ningún error (la regla está en rodClaveEtiqueta). */
    const lineas = FUENTE.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /[\u0300-\u036f]/.test(l));
    ok(!lineas.length, 'ninguna marca combinante escrita en claro (van como \\u0300-\\u036f)', lineas.map(([n, l]) => 'renglón ' + n + ': ' + l.trim().slice(0, 90)).join('\n'));
    /* Y lo mismo con los invisibles con que se escriben los emojis
       compuestos: la unión (U+200D), el enmarcado de tecla (U+20E3) y las
       demás marcas combinantes para símbolos, los espacios de ancho cero y
       la BOM. La expresión que quita los pictogramas de un rótulo los
       nombra: escritos en claro, un editor que se los coma deja una clase
       de caracteres distinta sin ningún error. El selector de variante
       U+FE0F no entra en la cuenta porque va pegado a cada ⚠️ de los
       comentarios, que se ve. */
    const invisibles = FUENTE.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /[\u200B-\u200D\u2060\uFEFF\u20D0-\u20FF]/.test(l));
    ok(!invisibles.length, 'ningún invisible de los emojis compuestos escrito en claro (van como \\u200D, \\u20E3…)', invisibles.map(([n, l]) => 'renglón ' + n + ': ' + l.trim().slice(0, 90)).join('\n'));
  });
}

/* ══════════════════════════════════════════════════════════════════
   2. EL ARMADO
   ══════════════════════════════════════════════════════════════════ */
function parte2() {
  parte(2, 'Lo que se copia es lo que se ve: el armado contra el §7, carácter por carácter');
  const L = SA.L;
  const toques = SA.toques;

  const EJ = {
    xml: ejemplo('**Encargo completo en `xml` (Claude):**'),
    md: ejemplo('**El mismo Encargo en `md` (ChatGPT, Gemini, Otra):**'),
    seguida: ejemplo('**El mismo Encargo en `seguida` (NotebookLM):**'),
    skill: ejemplo('**SKILL.md de ejemplo**'),
    mmdCadena: ejemplo('**Mermaid de ejemplo (Cadena):**'),
    mmdEstrella: ejemplo('**Mermaid en estrella (Coordinador):**'),
    chatCadena: ejemplo('Ejemplo completo, Cadena en `md`:'),
    planHasta: ejemplo('**Repite hasta, `plan` de ejemplo:**'),
    autoHasta: ejemplo('**Repite hasta, auto-bucle en `md`:**'),
    autoCritica: ejemplo('**Borrador y crítica, auto-bucle en `md`:**'),
    autoCareo: ejemplo('**Careo, auto-bucle en `md`**'),
    export: ejemplo('**Export del inventario**'),
    cuento: ejemplo('**Cuento que enseña en `seguida` (Storybook)**'),
  };
  let seguir = true;
  seccion('2.1 Los ejemplos se sacaron del plan', () => {
    seguir = ok(Object.values(EJ).every(t => t && t.length > 40), 'los ' + Object.keys(EJ).length + ' ejemplos del §7 están en PLAN-LA-CONSIGNA.md',
      Object.keys(EJ).filter(k => !EJ[k]).join(', '));
  });
  if (!seguir) return;

  /* Las piezas de los ejemplos. Cada texto se busca en el plan: si al
     escribirlo aquí se colara una errata, la prueba compararía contra otra
     cosa y no se enteraría nadie. */
  const P = (clase, molde, bloques, extra) => Object.assign({ id: 'csg-prueba-' + molde, clase, molde, titulo: '', maquina: '',
    bloques: Object.entries(bloques).map(([id, t]) => ({ id, rotulo: '', t })), material: '' }, extra || {});
  const enPlan = t => t.split('\n').every(l => PLAN.includes(l));
  const ENCARGO = P('prompt', 'encargo', {
    rol: 'Eres un editor de una revista de divulgación en español, riguroso con las fuentes y alérgico a las frases hechas.',
    contexto: 'Esto va en la revista de la casa, que leen cuatro personas de entre 12 y 50 años.',
    tarea: 'Reescribe los tres primeros párrafos para que el dato más fuerte salga en la primera frase.',
    reglas: 'No inventes datos; si no lo sabes, dilo.\nCita cada fuente con su dirección; sin dirección no vale.',
    formato: 'Primero el resultado; debajo, la lista de cambios.',
    ejemplos: '',
    comprobacion: 'Al final, di en una línea qué no pudiste cumplir y por qué.',
    tono: 'Directo y sin adornos.',
  }, { material: '(el texto pegado)' });
  const CADENA = P('grafo', 'cadena', {
    meta: 'Un video-ensayo de doce minutos con guion en bloques, fuentes verificadas y rótulos.',
    nodos: 'Investigador: recibe el tema, entrega diez fuentes con dirección.\nGuionista: recibe las fuentes, entrega el guion en bloques.\nVerificador: recibe el guion, entrega la lista de citas que no cuadran.\nEditor: recibe el guion aprobado, entrega la versión final.',
    aristas: 'Investigador → Guionista.\nGuionista → Verificador.\nVerificador → Guionista si hay citas malas (máximo 2 vueltas); si no → Editor.\nEditor → FIN.',
    estado: 'Viaja: el tema, la lista de fuentes y el guion actual. No viaja: el razonamiento interno de cada uno.',
    fin: 'Termina cuando el Verificador no encuentra citas malas, o a la segunda vuelta. El Editor entrega el guion en bloques [CÁMARA 0:30] para El Rodaje.',
  });
  const COORD = P('grafo', 'coordinador', {
    coordinador: 'Coordinador: recibe el encargo, lo parte en tareas, se las da a los especialistas y junta lo que devuelven.',
    nodos: 'Historiador: fechas y contexto, con fuente.\nEconomista: cifras con fuente y año.\nEditor: la forma final.',
    reparto: 'Por tema: lo que tenga cifras al Economista, lo que tenga fechas al Historiador; lo que no encaje, el Coordinador pregunta antes de repartir.',
    juntar: 'El Coordinador pega las partes en el orden de la meta, quita lo repetido y marca lo que se contradice.',
    fin: 'Termina cuando todos entregaron y el Coordinador no encuentra contradicciones. Entrega un informe con un apartado por especialista y una bibliografía única.',
  });
  const SKILL = P('habilidad', 'skill', {
    nombre: 'corrector-revista-casa',
    disparador: 'Corrige ortografía y estilo de notas en español de Honduras y devuelve el texto corregido más la lista de cambios con su norma. Úsala cuando pidan «corrige», «revisa el estilo» o peguen una nota para la revista. No la uses para traducir.',
    pasos: '1. Lee el texto entero antes de tocar nada.\n2. Marca las erratas.\n3. Marca el estilo, con la norma al lado.\n4. Devuelve el texto corregido y la lista de cambios.',
    recursos: 'Usa la lista de reglas de estilo que va debajo. No busques en internet.',
    comprobacion: 'Ningún nombre propio cambiado.\nNinguna cifra tocada.\nCada cambio con su norma.',
    ejemplos: 'Pedido: «Arréglame esta nota» + texto pegado → corrige y devuelve las dos partes.\nNo se activa: «Hazme un post de esta nota».',
  }, { titulo: 'Corrector de la revista' });
  const HASTA = P('bucle', 'hasta', {
    paso: 'Escribe el primer párrafo del ensayo.',
    parada: 'Para cuando el párrafo tenga menos de 80 palabras, empiece con un dato y no lleve ningún adverbio en -mente.',
    tope: 'Máximo 5 vueltas. Si llegas al tope, entrega lo mejor que tengas y di por qué no paró.',
    memoria: 'Se guarda: la última versión y la lista de lo que ya se corrigió. Se descarta: las versiones anteriores.',
    verificacion: '',
    salida: 'La versión final y, debajo, en un renglón por vuelta, qué cambió.',
  });
  const CRITICA = P('bucle', 'critica', {
    borrador: 'Escribe un resumen de 150 palabras de lo que va abajo.',
    critico: 'Como editor exigente, señala tres fallos concretos con su renglón: uno de datos, uno de forma, uno de claridad. Nada de elogios. Si no hay fallos graves, di solo «APROBADO».',
    revision: 'Corrige solo lo que señaló el crítico; no toques lo demás. Cada corrección con su porqué en un renglón.',
    parada: 'Para cuando el crítico diga APROBADO.',
    tope: 'Máximo 4 vueltas. Al tope, entrega la última y la lista de lo que quedó.',
    salida: 'La versión aprobada y, debajo, las críticas de cada vuelta.',
  }, { material: '(el texto pegado)' });
  const CAREO = P('bucle', 'careo', {
    postura_a: 'Defiende que la jornada extendida reduce la deserción, con datos de 2015-2024.',
    postura_b: 'Defiende que la deserción bajó por otras causas y que la jornada extendida se lleva el mérito sin evidencia.',
    juez: 'Puntúa cada ronda por evidencia y no por retórica; nombra cada falacia que veas.',
    tope: 'Tres rondas: apertura, réplica y cierre. Cada turno, 150 palabras.',
    etiqueta: L('csgBloqueDef')('careo', 'etiqueta').inicial,
  }, { titulo: 'Careo jornada extendida' });
  const CUENTO = P('prompt', 'cuento', {
    tema: 'Un cuento que explique por qué llueve, contado por una gota de agua que tiene miedo de caer.',
    audiencia: 'Niños de 6 a 8 años que empiezan a leer solos; muchas veces se lo leerá un adulto en voz alta.',
    personaje: 'Gotita, una gota de agua redonda y transparente, con las mejillas rosadas. Quiere quedarse para siempre en su nube, porque le da miedo caer; pero cada vez pesa más.',
    escenario: 'Una aldea de Copán en temporada de lluvias: techos de lámina, olor a tierra mojada y el río crecido.',
    concepto: 'El ciclo del agua: el sol calienta el agua y la vuelve vapor; el vapor sube, se enfría y se vuelve gotitas que forman las nubes; las gotitas se juntan, pesan y caen como lluvia. Como el vapor de la olla de los frijoles, que se vuelve gotas en la tapa.',
    leccion: 'Que el agua que cae es la misma que subió: nada se pierde, todo da vueltas.',
    emociones: 'Curiosidad al principio, un miedo que se pueda aguantar a mitad del cuento, y al final alivio y asombro.',
    tono: 'Cálido y sin prisa, como un cuento antes de dormir.',
    desenlace: 'Que la última página repita la imagen de la primera, pero cambiada.',
    extension: 'Diez páginas, con dos o tres frases cortas en cada una.',
    ilustracion: 'En acuarela, con colores suaves.',
    reglas: 'Nada de sustos que no se resuelvan en la misma página.\nNo inventes datos, fechas ni cifras: si simplificas, que siga siendo verdad.\nSin moraleja al final; que se entienda por lo que pasa.',
  }, { titulo: 'La gota que tenía miedo de caer', maquina: 'storybook' });
  PIEZAS7 = { ENCARGO, CADENA, COORD, SKILL, HASTA, CRITICA, CAREO, CUENTO };
  seccion('2.2 Las piezas de prueba están escritas en el plan', () => {
    const conTexto = [ENCARGO, CADENA, COORD, SKILL, HASTA, CRITICA, CAREO, CUENTO].map(p => p.bloques.filter(b => b.t && b.id !== 'etiqueta').map(b => b.t)).flat();
    ok(conTexto.every(enPlan), 'cada texto de las piezas de prueba está escrito tal cual en el plan', conTexto.filter(t => !enPlan(t)).join('\n'));
  });

  const armar = (p, m, v, o) => L('csgArmar')(p, m, v || {}, o || {});

  seccion('2.3 Encargo completo (§7), carácter por carácter', () => {
    const eXml = armar(ENCARGO, 'claude');
    igual(eXml.principal, EJ.xml, 'xml (Claude) = el ejemplo del plan');
    igual(eXml.forma, 'xml', 'la forma dicha es xml');
    igual(armar(ENCARGO, 'chatgpt').principal, EJ.md, 'md (ChatGPT) = el ejemplo del plan');
    igual(armar(ENCARGO, 'gemini').principal, EJ.md, 'md (Gemini) = el mismo ejemplo');
    igual(armar(ENCARGO, 'otra').principal, EJ.md, 'md (Otra) = el mismo ejemplo');
    igual(armar(ENCARGO, 'notebooklm').principal, EJ.seguida, 'seguida (NotebookLM) = el ejemplo del plan');
    /* «📋 Copiar sistema» copia <rol>, <reglas> y <tono> con sus líneas en
       blanco; «📋 Copiar encargo», el resto; juntos son exactamente principal. */
    const trozosXml = t => t.split(/\n\n(?=<[a-z_]+>\n)/);
    const tp = trozosXml(eXml.principal), ts = trozosXml(eXml.sistema), te = trozosXml(eXml.encargo);
    igual(eXml.sistema, tp.filter(t => /^<(rol|reglas|tono)>/.test(t)).join('\n\n'), 'sistema = <rol>, <reglas> y <tono>, con sus líneas en blanco');
    ok(ts.every(t => /^<(rol|reglas|tono)>/.test(t)) && te.every(t => !/^<(rol|reglas|tono)>/.test(t)), 'encargo = el resto, material incluido, sin ningún bloque de sistema');
    ok(ts.concat(te).sort().join('|') === tp.slice().sort().join('|') && ts.length + te.length === tp.length,
      'sistema + encargo contienen EXACTAMENTE los bloques de principal (' + ts.length + ' + ' + te.length + ' = ' + tp.length + ')');
    ok(!/SISTEMA:/.test(eXml.principal) && !eXml.principal.includes('dilo.; '), 'en xml no hay «SISTEMA:» ni reglas juntadas con «; »');
    ok(armar(ENCARGO, 'chatgpt').sistema === '' && armar(ENCARGO, 'notebooklm').encargo === '', 'sistema y encargo solo existen en xml');
  });

  seccion('2.4 SKILL.md (§7)', () => {
    for (const m of ['claude', 'chatgpt', 'notebooklm']) {
      const a = armar(SKILL, m);
      igual(a.skill, EJ.skill, 'SKILL.md con ' + m + ' = el ejemplo del plan (la forma la pone el molde)');
      ok(a.principal === a.skill && a.forma === 'skill', 'con ' + m + ': principal ES el archivo y la forma es skill');
    }
    const aSk = armar(SKILL, 'claude');
    ok((aSk.skill.match(/^#{1,2} /gm) || []).length === 6, 'seis encabezados (# y cinco ##)');
    ok(aSk.sistema.startsWith('Nombre (name): corrector-revista-casa\n\n') && aSk.sistema.includes('\n\nPasos: 1. Lee el texto entero antes de tocar nada. 2. Marca las erratas.'),
      '«📋 Copiar como instrucción de sistema» = los mismos bloques en forma seguida', aSk.sistema.slice(0, 200));
    igual(L('csgSlug')('Corrector Revista'), 'corrector-revista', "csgSlug('Corrector Revista') = 'corrector-revista'");
    igual(L('csgSlug')('  ¡Corrección de ÑANDÚES en la Revista!  '), 'correccion-de-nandues-en-la-revista', 'csgSlug quita tildes, eñes y signos');
    /* Diez letras y un guion: el corte de los 64 cae a mitad de la sexta
       palabra, que es justo el caso que hay que ver. */
    igual(L('csgSlug')('abcdefghij '.repeat(12)), 'abcdefghij-abcdefghij-abcdefghij-abcdefghij-abcdefghij', 'csgSlug corta a 64 en un guion, sin partir palabra');
    igual(L('csgSlug')('x'.repeat(70)), 'x'.repeat(64), 'csgSlug: una sola palabra de 70 se corta a 64');
    const raro = P('habilidad', 'skill', {
      nombre: 'mi-habilidad', disparador: 'Úsala cuando digan "corrige" o C:\\notas.\nY también con «arregla».',
      pasos: 'Lee todo.\n- Marca las erratas.\n3) Devuelve el texto.',
    }, { titulo: 'Rara' });
    const aR = armar(raro, 'claude').skill;
    ok(aR.includes('description: "Úsala cuando digan \\"corrige\\" o C:\\\\notas. Y también con «arregla»."'),
      'description entre comillas, con " y \\ escapadas y el salto de renglón como un espacio', aR.split('\n')[2]);
    ok(aR.includes('## Pasos\n1. Lee todo.\n2. Marca las erratas.\n3) Devuelve el texto.'), 'los pasos sin número se numeran; los numerados se respetan', aR);
    ok(aR.includes('## Cuándo usarla\nÚsala cuando digan "corrige" o C:\\notas.\nY también con «arregla».'), '«Cuándo usarla» lleva el disparador tal cual, sin escapar');
    ok(!/## Recursos|## Comprobaciones|## Ejemplos/.test(aR), 'Recursos, Comprobaciones y Ejemplos solo salen con texto');
    const vacia = armar(P('habilidad', 'skill', {}, { titulo: 'Sin nada' }), 'claude').skill;
    ok(vacia.includes('## Cuándo usarla') && vacia.includes('## Pasos') && vacia.includes('description: ""') && vacia.includes('# Sin nada'),
      'vacía: Cuándo usarla y Pasos salen igual, description "" y el título de la pieza como #', vacia);
  });

  seccion('2.5 Grafo: Mermaid, plan y prompt para un chat (§7)', () => {
    const aC = armar(CADENA, 'chatgpt');
    igual(aC.mermaid, EJ.mmdCadena, 'Mermaid de la Cadena = el ejemplo del plan');
    igual(aC.principal, EJ.chatCadena, 'prompt para un solo chat, Cadena en md = el ejemplo del plan');
    igual(armar(CADENA, 'claude').mermaid, EJ.mmdCadena, 'el Mermaid no depende de la máquina');
    const aK = armar(COORD, 'chatgpt');
    igual(aK.mermaid, EJ.mmdEstrella, 'Mermaid en estrella del Coordinador = el ejemplo del plan');
    ok(aK.principal.endsWith('## Cómo hacerlo en este chat\n' + L('CSG_TEXTOS').orquestarCoordinador('Coordinador')),
      'Coordinador: el «cómo» del coordinador, empezando por él');
    const planC = aC.plan.split('\n\n');
    igual(planC[0], 'Meta: Un video-ensayo de doce minutos con guion en bloques, fuentes verificadas y rótulos.', 'plan de la Cadena: Meta');
    igual(planC[1], 'Nodos:\n1. Investigador: recibe el tema, entrega diez fuentes con dirección.\n2. Guionista: recibe las fuentes, entrega el guion en bloques.\n3. Verificador: recibe el guion, entrega la lista de citas que no cuadran.\n4. Editor: recibe el guion aprobado, entrega la versión final.', 'plan: Nodos numerados «n. renglón»');
    igual(planC[2], 'Pasos:\n- Investigador → Guionista\n- Guionista → Verificador\n- Verificador → Guionista si hay citas malas (máximo 2 vueltas)\n- Verificador → Editor si no\n- Editor → FIN', 'plan: Pasos «- A → B» y «- A → B si condición»');
    ok(planC[3].startsWith('Lo que viaja: Viaja:') && planC[4].startsWith('Termina cuando: Termina cuando') && planC.length === 5, 'plan: Lo que viaja y Termina cuando, cada uno en su párrafo');
    const planK = aK.plan.split('\n\n');
    ok(planK[0].startsWith('Nodos:\n1. Coordinador: recibe el encargo') && planK[0].includes('\n4. Editor: la forma final.'), 'plan del Coordinador: el coordinador es el 1', planK[0]);
    ok(planK[1].startsWith('Pasos:\n- Coordinador → Historiador (reparte)\n- Historiador → Coordinador (entrega)') && planK[1].endsWith('- Coordinador → FIN'), 'plan del Coordinador: reparte, entrega y a FIN', planK[1]);
    ok(planK[2].startsWith('Cómo se reparte: ') && planK[3].startsWith('Cómo se junta: ') && planK[4].startsWith('Termina cuando: '), 'plan del Coordinador: reparto, junta y fin');

    const COORD2 = P('grafo', 'coordinador', { coordinador: 'No hace ninguna tarea: solo reparte y junta.\nRecibe el encargo.', nodos: 'Historiador: fechas.' });
    const aK2 = armar(COORD2, 'chatgpt');
    ok(aK2.mermaid.startsWith('flowchart TD\n  Coordinador["No hace ninguna tarea: solo reparte y junta. Recibe el encargo"]') && aK2.principal.includes('Empieza por Coordinador, que reparte'),
      'una frase hecha con dos puntos no se toma por el nombre del coordinador', aK2.mermaid.split('\n')[1]);
    ok(armar(P('grafo', 'coordinador', { coordinador: 'Jefa de redacción: reparte y junta.', nodos: 'Uno: algo.' }), 'chatgpt').principal.includes('Empieza por Jefa de redacción, que reparte'),
      'un nombre de verdad (hasta tres palabras) sí es el coordinador');
    const nodos = L('csgNodos')('- 1. Uno: a\n2) Dos\n• Tres.\n\n: sin nombre');
    igual(JSON.stringify(nodos), JSON.stringify([{ nombre: '1. Uno', linea: '1. Uno: a' }, { nombre: 'Dos', linea: 'Dos' }, { nombre: 'Tres', linea: 'Tres.' }]),
      'csgNodos: nombre antes de los dos puntos; sin dos puntos, el renglón entero sin su punto; se quita UNA viñeta o número; sin nombre no es nodo');
    const ar = L('csgAristas')('Verificador → Guionista si hay citas malas (máximo 2 vueltas); si no → Editor.\nEditor -> Nadie.\nGuionista --> fin\nRevisor → Guionista, si no → FIN', ['Investigador', 'Guionista', 'Verificador', 'Editor']);
    ok(ar.length === 6, 'csgAristas: seis aristas en cuatro renglones', JSON.stringify(ar));
    ok(ar[1].origen === 'Verificador' && ar[1].destino === 'Editor' && ar[1].cond === 'si no' && ar[1].conocido, '«si no → C» hereda el origen y lleva la condición «si no»');
    ok(ar[2].destino === 'Nadie' && !ar[2].conocido && ar[2].destinoConocido === false, 'una arista a un nodo que no existe queda DESCONOCIDA');
    ok(ar[3].destino === 'FIN' && ar[3].conocido, 'FIN es siempre conocido, y con -->: «fin» casa con FIN');
    ok(ar[4].origen === 'Revisor' && ar[4].conocido === true && ar[4].origenConocido === false && ar[5].origen === 'Revisor' && ar[5].destino === 'FIN' && ar[5].cond === 'si no',
      'un origen que no existe va en origenConocido (conocido es el DESTINO, §7), y «, si no →» parte la cláusula', JSON.stringify(ar.slice(4)));
    ok(ar.every(a => a.conocido === a.destinoConocido), 'destinoConocido repite conocido');
    const arEd = L('csgAristas')('Verificador → Editora final', ['Verificador', 'Editor']);
    ok(arEd[0].destino === 'Editora final' && !arEd[0].conocido, '«Editora» no casa con el nodo «Editor» (tiene que acabar ahí)');
    const arTil = L('csgAristas')('verificador → REVISIÓN  final como máximo 2 veces.', ['Verificador', 'Revision final']);
    ok(arTil[0].origen === 'Verificador' && arTil[0].destino === 'Revision final' && arTil[0].cond === 'como máximo 2 veces',
      'sin tildes ni mayúsculas ni espacios dobles, y la condición cortada en su sitio', JSON.stringify(arTil));
    const roto = P('grafo', 'cadena', { nodos: 'Jefe "duro" | uno: revisa <todo>.\nend: el último\n2do: el segundo', aristas: 'Jefe "duro" | uno → Fantasma si "sí" | no.\nend → 2do' });
    const mR = armar(roto, 'claude').mermaid;
    ok(mR.includes('  Jefe_duro_uno["Jefe #quot;duro#quot; / uno: revisa #lt;todo#gt;"]'), 'un nombre de nodo con " y | sale escapado en el Mermaid', mR);
    ok(mR.includes('  Jefe_duro_uno -.->|si #quot;sí#quot; / no| Fantasma'), 'la arista a un nodo que no existe va PUNTEADA y con su condición escapada', mR);
    ok(mR.includes('  end_["end: el último"]') && mR.includes('  n2do["2do: el segundo"]') && mR.includes('  end_ --> n2do'), 'palabra reservada con «_» detrás y cifra delante con «n»', mR);
    const origenMal = armar(P('grafo', 'cadena', { nodos: 'Uno: a.\nDos: b.', aristas: 'Unoo → Dos.\nUno → Dos.' }), 'claude').mermaid;
    ok(origenMal.includes('  Unoo -.-> Dos') && origenMal.includes('  Uno --> Dos'), 'en el Mermaid, una arista que sale de un nodo que no existe también va punteada', origenMal);
    const usados = new Set(['Revision']);
    igual(L('csgMmdId')('Revisión', usados), 'Revision_2', 'csgMmdId es único en el diagrama (y no toca la colección que le prestan)');
    ok(usados.size === 1, '… csgMmdId no escribe en `usados`');
    igual(L('csgMmdTexto')('a\n"b" <c> | d.'), 'a #quot;b#quot; #lt;c#gt; / d', 'csgMmdTexto: comillas, <, >, |, saltos y el punto final');
  });

  seccion('2.6 Bucle: plan y auto-bucle (§7)', () => {
    const aH = armar(HASTA, 'chatgpt');
    igual(aH.plan, EJ.planHasta, 'plan de Repite hasta = el ejemplo del plan');
    igual(aH.principal, EJ.autoHasta, 'auto-bucle de Repite hasta en md = el ejemplo del plan');
    igual(armar(CRITICA, 'chatgpt').principal, EJ.autoCritica, 'auto-bucle de Borrador y crítica en md, con material = el ejemplo del plan');
    igual(armar(CAREO, 'chatgpt').principal, EJ.autoCareo, 'auto-bucle del Careo con ChatGPT y «Careo jornada extendida» = el ejemplo del plan');
    const hX = armar(HASTA, 'claude').principal;
    ok(hX.endsWith('<como>\n' + L('CSG_MOLDES').hasta.auto + '\n</como>') && !hX.includes('```') && /<paso>[\s\S]*<parada>[\s\S]*<tope>[\s\S]*<memoria>[\s\S]*<salida>[\s\S]*<como>/.test(hX),
      'en xml: <paso> … <salida> y <como> con el auto, SIN el bloque de código');
    const hS = armar(HASTA, 'notebooklm').principal;
    ok(hS.endsWith('Cómo hacerlo en este chat: ' + L('CSG_MOLDES').hasta.auto) && !hS.includes('```'), 'en seguida: el auto sin el bloque de código');
    const DOBLE = P('bucle', 'hasta', { paso: 'Escribe.', parada: 'Para cuando esté.', tope: 'Máximo 3 vueltas.', salida: 'La final.' });
    DOBLE.bloques.push({ id: 'como_hacerlo_en_este_chat', rotulo: 'Cómo hacerlo en este chat', t: 'A mi manera.' });
    const dMd = armar(DOBLE, 'chatgpt').principal, dX = armar(DOBLE, 'claude').principal;
    ok((dMd.match(/## Cómo hacerlo en este chat/g) || []).length === 1 && dMd.endsWith('## Cómo hacerlo en este chat\nA mi manera.') && !dX.includes('<como>'),
      'un «Cómo hacerlo en este chat» que volvió por «Pegar» no se dobla: manda el de la persona', dMd.slice(-200));
    const pN = (tope, molde) => armar(P('bucle', molde || 'hasta', { paso: 'x', parada: 'y', tope, salida: 'z' }), 'chatgpt').principal.match(/(?:VUELTA|RONDA) 1\.\.(\S+):/)[1];
    igual(pN('Máximo {{n}} vueltas.'), 'N', 'un tope sin número deja «N»');
    igual(pN('Un máximo de 7 vueltas.'), '7', '«Un máximo de 7 vueltas» es 7, no 1');
    igual(pN('Cada turno de 150 palabras, y 3 rondas.', 'careo'), '3', 'el número pegado a «rondas» manda sobre el primero');
    igual(pN('Como mucho diez veces.'), '10', 'los números en palabras cuentan');
    igual(armar(P('bucle', 'hasta', { tope: 'Máximo {{n}} vueltas.' }), 'chatgpt', { n: '6' }).principal.match(/VUELTA 1\.\.(\S+):/)[1], '6', 'el tope se lee ya relleno: {{n}} = 6 da VUELTA 1..6');
    const lotes = armar(P('bucle', 'lotes', { lista: 'Fracciones\n- Decimales\nPorcentajes', paso: 'Para cada tema: tres preguntas.', tope: L('csgBloqueDef')('lotes', 'tope').inicial, salida: 'Todo junto.' }), 'chatgpt');
    igual(lotes.plan, '1. Lista: Fracciones / Decimales / Porcentajes\n2. Paso por elemento: Para cada tema: tres preguntas.\n3. Tope: Un elemento por vuelta; termina al acabar la lista y nunca pasa de {{n}} elementos.\n4. Salida: Todo junto.\n' + L('CSG_MOLDES').lotes.cierre,
      'plan de Por lotes: la lista unida por « / », los rótulos del molde y su cierre');
    ok(lotes.principal.includes('```\nPARA CADA renglón de la lista, en orden:'), 'el pseudo de Por lotes va en md');
  });

  seccion('2.7 Reglas de forma', () => {
    const RAPIDO = P('prompt', 'rapido', { tarea: 'Resume el informe en diez puntos.', formato: 'En una lista de puntos, sin introducción ni despedida.' }, { material: '\n\n(el texto pegado)\n\n' });
    igual(armar(RAPIDO, 'chatgpt').principal, 'Resume el informe en diez puntos.\n\nFormato de salida: En una lista de puntos, sin introducción ni despedida.\n\n=== Material ===\n(el texto pegado)\n=== Fin del material ===',
      'Rápido sin encabezados en md: el primero pelado, los demás «Rótulo: …», y el material entre marcas');
    igual(armar(RAPIDO, 'claude').principal, '<tarea>\nResume el informe en diez puntos.\n</tarea>\n\n<formato>\nEn una lista de puntos, sin introducción ni despedida.\n</formato>\n\n<material>\n(el texto pegado)\n</material>',
      'Rápido en xml sigue con sus etiquetas: sinEncabezados es de md');
    igual(armar(RAPIDO, 'chatgpt', {}, { material: '' }).principal, 'Resume el informe en diez puntos.\n\nFormato de salida: En una lista de puntos, sin introducción ni despedida.', 'opciones.material vacío pisa el material: sin marcas');
    ok(armar(RAPIDO, 'chatgpt', {}, { material: 'otro texto' }).principal.endsWith('=== Material ===\notro texto\n=== Fin del material ==='), 'opciones.material pisa el material de la pieza');

    const FUENTES = P('prompt', 'fuentes', { pregunta: '¿Qué se sabe?', fuentes: 'Solo organismos.', citas: 'Con dirección.', formato: 'Un ensayo.', limites: 'Hasta 2024.' });
    const heads = t => (t.match(/^## .+$/gm) || []).map(h => h.slice(3));
    igual(heads(armar(FUENTES, 'perplexity').principal).join(' | '), 'Fuentes permitidas | Reglas de cita | Pregunta | Formato de salida | Límites', 'Perplexity: Fuentes y Citas delante en Investigación');
    igual(heads(armar(FUENTES, 'chatgpt').principal).join(' | '), 'Pregunta | Fuentes permitidas | Reglas de cita | Formato de salida | Límites', 'en ChatGPT, el orden del molde');
    const sinF = armar(P('prompt', 'fuentes', { pregunta: '¿Qué se sabe?', fuentes: '  ', citas: 'Con dirección.', formato: 'Un ensayo.' }), 'notebooklm').principal;
    ok(sinF.startsWith('Pregunta: ¿Qué se sabe?\n\nFuentes permitidas: Usa solo las fuentes del cuaderno.\n\nReglas de cita: '), 'NotebookLM + Investigación con Fuentes vacío inyecta «Usa solo las fuentes del cuaderno.»', sinF);
    ok(!armar(P('prompt', 'fuentes', { pregunta: '¿Qué?' }), 'chatgpt').principal.includes('Usa solo las fuentes del cuaderno'), '… y solo en NotebookLM');

    const EJEMPLOS = P('prompt', 'ejemplos', { tarea: 'Convierte cada cita.', ejemplos: 'Harari 2014 página 45 → (Harari, 2014, p. 45)\n- Informe del BID de 2023, p. 12 -> (BID, 2023, p. 12)\nAsí NO: (Harari 2014)', caso: 'Ahora haz lo mismo con cada renglón de lo que va abajo.', formato: 'Un renglón por caso.' }, { material: 'x' });
    const ejMd = armar(EJEMPLOS, 'chatgpt').principal;
    igual(heads(ejMd).join(' | '), 'Tarea | Ejemplos | Formato de salida | Ahora tú', '«Ahora tú» el último en Con ejemplos (md)');
    ok(ejMd.includes('## Ejemplos\n**Entrada:** Harari 2014 página 45\n**Salida:** (Harari, 2014, p. 45)\n\n**Entrada:** Informe del BID de 2023, p. 12\n**Salida:** (BID, 2023, p. 12)\n\n- Así NO: (Harari 2014)\n\n## Formato'),
      'md: pares **Entrada:**/**Salida:** separados por línea en blanco; lo demás, renglón de lista', ejMd);
    const ejX = armar(EJEMPLOS, 'claude').principal;
    ok(/<caso>\n[^<]*\n<\/caso>\n\n<material>/.test(ejX) && ejX.includes('<ejemplos>\n<ejemplo>\n<entrada>Harari 2014 página 45</entrada>\n<salida>(Harari, 2014, p. 45)</salida>\n</ejemplo>\n<ejemplo>\n<entrada>Informe del BID de 2023, p. 12</entrada>\n<salida>(BID, 2023, p. 12)</salida>\n</ejemplo>\n- Así NO: (Harari 2014)\n</ejemplos>'),
      'xml: <caso> el último antes del material, y los pares en <ejemplo>', ejX);
    const ejS = armar(EJEMPLOS, 'notebooklm').principal;
    ok(ejS.includes('Ejemplos: Harari 2014 página 45 → (Harari, 2014, p. 45). Informe del BID de 2023, p. 12 → (BID, 2023, p. 12). Así NO: (Harari 2014).') && /Ahora tú: [^\n]*\n\n=== Material ===/.test(ejS),
      'seguida: pares «a → b.» en un párrafo, y Ahora tú el último', ejS);

    const lst = L('csgCuerpo')({ id: 'reglas', lista: true }, '  No inventes.\n\n- Cita.\n• Pregunta.\n* Otra.\n2) Numerada.\n3. Otra numerada', 'md');
    igual(lst, '- No inventes.\n- Cita.\n• Pregunta.\n* Otra.\n2) Numerada.\n3. Otra numerada', 'lista: «- » delante salvo que ya lleve viñeta o número');
    igual(L('csgCuerpo')({ id: 'reglas', lista: true }, 'No inventes\n- Cita.\n3. Tres\n¿Y esto?', 'seguida'), 'No inventes. Cita. 3. Tres. ¿Y esto?', 'seguida: sin viñeta, los números se quedan, punto si hace falta');
    igual(L('csgCuerpo')({ id: 'ejemplos', lista: true }, 'Usuario: «hazme un poema» → Tú: «Eso no es lo mío.»\nVer (p. 45)\nDijo: «ya»', 'seguida'),
      'Usuario: «hazme un poema» → Tú: «Eso no es lo mío.» Ver (p. 45). Dijo: «ya».', 'seguida: un punto antes de la comilla que cierra ya cuenta; «(p. 45)» y ««ya»» sí lo llevan');
    igual(L('csgCuerpo')({ id: 'tarea' }, '  Hazlo así:\n\n  con sangría.  ', 'md'), 'Hazlo así:\n\n  con sangría.', 'el texto normal va tal cual (solo se recortan los bordes)');

    const SIS = P('habilidad', 'sistema', { identidad: 'Eres el corrector.', mision: 'Corregir.', siempre: 'Siempre responde en español\nSiempre di qué no pudiste', nunca: '- Nunca inventes datos.' });
    igual(armar(SIS, 'claude').principal, 'IDENTIDAD: Eres el corrector.\n\nMISIÓN: Corregir.\n\nSIEMPRE: Siempre responde en español. Siempre di qué no pudiste.\n\nNUNCA: Nunca inventes datos.',
      'Instrucción de sistema: seguida SIEMPRE, rótulos en mayúsculas, aunque la máquina sea Claude');
    ok(armar(SIS, 'claude').sistema === '' && armar(SIS, 'claude').forma === 'seguida', '… y un solo Copiar: la pieza entera ES el sistema');
    const REC = P('habilidad', 'receta', { disparador: 'Cada vez que te pegue un texto entre marcas ===.', pasos: '1. Corriges ortografía.\n2. Señalas estilo con su norma.\n3. Devuelves el texto y la lista.', comprobacion: 'Que no cambiaste ningún nombre ni cifra.' });
    igual(armar(REC, 'chatgpt').principal, 'Regla para esta conversación:\n\nCuándo: Cada vez que te pegue un texto entre marcas ===.\n\nQué haces: 1. Corriges ortografía. 2. Señalas estilo con su norma. 3. Devuelves el texto y la lista.\n\nQué revisas: Que no cambiaste ningún nombre ni cifra.',
      'Receta corta: la cabecera, línea en blanco y los tres párrafos');

    /* Bloques libres y moldes que el JS ya no conoce. */
    const LIBRE = P('prompt', 'rapido', { tarea: 'Hazlo.' });
    LIBRE.bloques.push({ id: 'notas_del_autor', rotulo: 'Notas del autor', t: 'Una nota.' }, { id: 'rol', rotulo: 'Rol', t: 'Eres alguien.' }, { id: 'vacio', rotulo: 'Vacío', t: '   ' });
    igual(armar(LIBRE, 'chatgpt').principal, 'Hazlo.\n\nNotas del autor: Una nota.\n\nRol: Eres alguien.', 'los libres van detrás, con su rótulo guardado; los vacíos se saltan');
    const libX = armar(LIBRE, 'claude');
    ok(libX.principal.endsWith('<notas_del_autor>\nUna nota.\n</notas_del_autor>\n\n<rol>\nEres alguien.\n</rol>') && libX.sistema === '',
      'en xml, <id> del libre, y un libre nunca va a la mitad de sistema (aunque sea «rol»)', libX.principal);
    const FANT = { clase: 'prompt', molde: 'toString', titulo: 't', bloques: [{ id: 'reglas', rotulo: 'Mis reglas', t: 'Una\nDos' }, { id: 'raro id', rotulo: 'Raro', t: 'algo' }] };
    igual(armar(FANT, 'chatgpt').principal, '## Mis reglas\nUna\nDos\n\n## Raro\nalgo', 'un molde que el JS no conoce: todos los bloques, en su orden y con su rótulo guardado');
    ok(armar(FANT, 'claude').principal.includes('<raro_id>\nalgo\n</raro_id>'), 'un id con espacios se rehace como etiqueta XML válida');
    ok(armar({ molde: 'rapido', bloques: '[{"id":"tarea","t":"En texto."}]' }, 'chatgpt').principal === 'En texto.', 'bloques que llegan como texto JSON se leen igual');
    ok(armar(null, 'claude').principal === '' && armar({}, '').forma === 'md', 'una pieza vacía o nula no revienta');
  });

  seccion('2.8 Los 18 moldes con todos sus bloques llenos, en las tres formas', () => {
    const M = L('CSG_MOLDES');
    const perdidos = [], raros = [];
    let cuenta = 0;
    for (const id of Object.keys(M)) {
      const m = M[id];
      const bl = {};
      for (const b of m.bloques) {
        const def = L('csgBloqueDef')(id, b.id);
        bl[b.id] = b.id === 'nombre' ? 'marca-nombre-' + id
          : b.id === 'ejemplos' ? 'ENTRADA_' + id + ' → SALIDA_' + id + '\nMARCA_ejemplos_' + id + ' suelto'
          : def.lista ? 'MARCA_' + b.id + '_' + id + ' uno.\nMARCA2_' + b.id + '_' + id + ' dos'
          : 'MARCA_' + b.id + '_' + id + ' con 3 vueltas.';
      }
      const pieza = P(m.clase, id, bl, { titulo: 'Título ' + id, material: 'MATERIAL_' + id });
      const pruebas = [['claude'], ['chatgpt'], ['notebooklm'], ['storybook'], ['otra', 'xml'], ['otra', 'md'], ['otra', 'seguida']];
      for (const [maq, forma] of pruebas) {
        cuenta++;
        const a = armar(pieza, maq, {}, forma ? { forma } : {});
        const txt = a.principal;
        for (const [, t] of Object.entries(bl)) {
          const marcas = t.match(/(?:MARCA2?|ENTRADA|SALIDA)_[a-z_]+|marca-nombre-[a-z]+/g);
          for (const mk of marcas) if (!txt.includes(mk)) perdidos.push(id + '/' + maq + (forma ? '/' + forma : '') + ': ' + mk);
        }
        if (!txt.includes('MATERIAL_' + id)) perdidos.push(id + '/' + maq + ': el material');
        if (/undefined|\[object |NaN|null/.test(Object.values(a).join('\n'))) raros.push(id + '/' + maq);
        if ((m.clase === 'grafo' || m.clase === 'bucle') && !txt.includes(forma === 'xml' || (!forma && maq === 'claude') ? '<como>' : 'Cómo hacerlo en este chat')) perdidos.push(id + '/' + maq + ': el bloque «como»');
        if (m.clase === 'grafo' && !a.mermaid.startsWith('flowchart TD\n')) perdidos.push(id + ': el Mermaid');
        if ((m.clase === 'grafo' || m.clase === 'bucle') && !a.plan) perdidos.push(id + ': el plan');
      }
    }
    ok(Object.keys(M).length === 18 && !perdidos.length, 'los 18 moldes × 7 armados (' + cuenta + '): ningún bloque, par, material ni «como» perdido', perdidos.slice(0, 12).join('\n'));
    ok(!raros.length, 'ningún armado escribe undefined, null, NaN ni [object …]', raros.join(', '));
  });

  seccion('2.9 Variables y reservadas', () => {
    const hoy = L('csgHoy')();
    const d = new Date();
    igual(hoy, d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), 'csgHoy() = hoy en AAAA-MM-DD local');
    igual(L('csgHoy')(new Date(2026, 8, 22, 23, 30).getTime()), '2026-09-22', 'csgHoy(instante) = la fecha local de ese instante (las once de la noche siguen siendo hoy)');
    const VAR = P('prompt', 'rapido', { tarea: 'Para {{maquina}}, «{{titulo}}» del {{hoy}}: {{ tema }}, {{x}}, {{Hoy}} y {{vacia}}.' }, { titulo: '  Mi   pieza ' });
    igual(armar(VAR, 'gemini', { tema: 'las fracciones', vacia: '   ', maquina: 'NO', hoy: 'NO' }).principal,
      'Para Gemini, «Mi pieza» del ' + hoy + ': las fracciones, {{x}}, {{Hoy}} y {{vacia}}.', '{{maquina}}, {{titulo}} y {{hoy}} rellenos; {{x}} sin valor y un valor vacío dejan el hueco intacto');
    igual(armar(P('prompt', 'rapido', { tarea: '{{titulo}}' }), 'claude').principal, '<tarea>\n(sin título)\n</tarea>', '{{titulo}} sin título es «(sin título)»');
    igual(armar(P('prompt', 'rapido', { tarea: 'Para {{maquina}}' }), '').principal, 'Para Otra', '{{maquina}} sin máquina es «Otra»');
    igual(JSON.stringify(L('csgVariables')('{{tema}} y {{ n }} y {{Tema}} y {{tema}} y {{}} y {{año_2}} {{maquina}}')), JSON.stringify(['tema', 'n', 'Tema', 'año_2', 'maquina']), 'csgVariables: únicas, en orden, distinguiendo mayúsculas');
    igual(JSON.stringify(L('csgVariables')(['{{a}}', '{{b}} {{a}}'])), JSON.stringify(['a', 'b']), 'csgVariables acepta una lista de textos');
    const conVal = P('prompt', 'rapido', { tarea: 'Hola {{a}}' }, { material: 'Dato {{a}} del informe' });
    ok(armar(conVal, 'chatgpt', { a: 'X' }).principal.endsWith('Dato {{a}} del informe\n=== Fin del material ==='), 'el material NO se rellena: es un dato de la persona');
  });

  seccion('2.10 csgBloqueDef, csgTextoDe, csgClave y csgSlugId', () => {
    const M = L('CSG_MOLDES');
    const dC = L('csgBloqueDef')('costar', 'formato');
    ok(dC.rotulo === 'Respuesta' && dC.ob === true && dC.libre === false && dC.frases.length >= 4 && dC.id === 'formato', 'CO-STAR: formato se llama «Respuesta», obligatorio');
    const dE = L('csgBloqueDef')('encargo', 'reglas');
    ok(dE.rotulo === 'Reglas' && dE.lista && dE.sistema && dE.ob === false, 'Encargo: reglas del vocabulario, lista y sistema, opcional');
    const dR = L('csgBloqueDef')('rapido', 'rol');
    ok(dR.rotulo === 'Rol' && dR.libre === true && dR.ob === false, 'un id del vocabulario que el molde no tiene es libre');
    ok(JSON.stringify(L('csgBloqueDef')('rapido', 'cosa_rara')) === JSON.stringify({ rotulo: 'cosa_rara', id: 'cosa_rara', ob: false, libre: true }), 'un id desconocido es { rotulo: id }');
    ok(L('csgBloqueDef')('rapido', 'constructor').rotulo === 'constructor' && L('csgBloqueDef')('toString', 'tarea').rotulo === 'Tarea', 'ni «constructor» ni «toString» se toman del prototipo');
    L('csgBloqueDef')('encargo', 'tarea').frases.push('INTRUSA');
    ok(!L('csgBloqueDef')('encargo', 'tarea').frases.includes('INTRUSA'), 'las frases salen copiadas: tocarlas no cambia el molde');
    ok(L('csgBloqueDef')(M.careo, 'tope').rotulo === 'Rondas', 'csgBloqueDef acepta también el molde ya resuelto');
    igual(L('csgTextoDe')(ENCARGO, 'tono'), 'Directo y sin adornos.', 'csgTextoDe da el texto del bloque');
    igual(L('csgTextoDe')(ENCARGO, 'nada'), '', '… o vacío');
    igual(L('csgClave')('  MAESTRÍA   de  Ñandú '), 'maestria de nandu', 'csgClave: sin tildes, minúsculas, bordes y espacios dobles fuera');
    igual(L('csgSlugId')('Notas del autor', ['notas_del_autor', 'notas_del_autor_2']), 'notas_del_autor_3', 'csgSlugId: único en la pieza');
    igual(L('csgSlugId')('¿Qué más?'), 'que_mas', 'csgSlugId: sin rayas bajas en los bordes');
    igual(L('csgSlugId')('¡¡!!'), 'bloque', 'csgSlugId: nunca vacío');
    igual(L('csgSlugId')('Tono', { tono: 1 }), 'tono_2', 'csgSlugId acepta un objeto como `usados`');
    igual(L('csgMaquina')('nadie').id, 'otra', 'una máquina desconocida es «Otra»');
  });

  seccion('2.11 Export del inventario (§7)', () => {
    const T = (m, dd, h) => new Date(2026, m, dd, h || 10).getTime();
    const uso = (uid, t, maquina, okk, nota) => ({ uid, t, maquina, v: 3, ok: okk, nota: nota || '' });
    const INF = {
      id: 'csg-inf', clase: 'prompt', molde: 'encargo', titulo: 'Resumen de informe', maquina: 'claude', version: 3, usos: 7,
      ultima: T(8, 20, 9), estantes: ['Revista'], material: 'NO DEBE SALIR', eliminado: false,
      bloques: [{ id: 'rol', rotulo: 'Rol', t: 'Eres editor.' }, { id: 'tarea', rotulo: 'Tarea', t: 'Resume {{tema}} en diez puntos.' }],
      bitacora: [uso('u1', T(8, 20), 'claude', 'si', 'salió con páginas'), uso('u2', T(8, 14), 'gemini', 'no', 'inventó una fuente'),
        uso('u3', T(8, 4), 'claude', 'si'), uso('u4', T(8, 3), 'claude', 'si'), uso('u5', T(8, 2), 'claude', 'si'),
        uso('u6', T(8, 1), 'claude', 'si'), uso('u7', T(7, 30), 'claude', null)],
    };
    const piezas = [INF];
    for (let i = 1; i <= 10; i++) piezas.push({ id: 'csg-z' + i, clase: 'bucle', molde: 'careo', titulo: 'Zeta ' + String(i).padStart(2, '0'), maquina: 'chatgpt', version: 1, usos: 0, ultima: 0,
      estantes: i === 1 ? ['zeta', 'Revista', 'ZETA', 'Maestría'] : ['Zeta'], bitacora: [], bloques: [{ id: 'etiqueta', rotulo: '', t: 'Máquina: {{maquina}} · {{titulo}}' }] });
    piezas.push({ id: 'csg-sin', clase: 'grafo', molde: 'cadena', titulo: 'Suelta', maquina: '', version: 2, usos: 1, estantes: [], bitacora: [], bloques: [{ id: 'meta', t: 'Algo.' }] });
    piezas.push({ id: 'csg-muerta', clase: 'prompt', molde: 'rapido', titulo: 'LÁPIDA QUE NO SALE', eliminado: true, estantes: ['Revista'], bloques: [{ id: 'tarea', t: 'x' }] });
    const ex = L('csgExportarTexto')(piezas, '2026-09-22');
    const lineasPlan = EJ.export.split('\n').filter(l => !l.includes('…'));
    ok(lineasPlan.every(l => ex.split('\n').includes(l)), 'cada renglón escrito del ejemplo del plan sale tal cual (' + lineasPlan.length + ' renglones)',
      lineasPlan.filter(l => !ex.split('\n').includes(l)).join('\n') + '\n---\n' + ex.slice(0, 700));
    ok(ex.startsWith('F.A.R.O · La Consigna · 2026-09-22 · 12 piezas\n── Estante: Revista ──\n📜 Resumen de informe · 💬 Prompt · Encargo completo · Claude · v3 · usada 7 veces · 👍 5 · 👎 1 · última 2026-09-20\nVariables: {{tema}}\n## Rol\n'),
      'la cabecera, el primer estante y la línea corrida en el orden del ejemplo', ex.slice(0, 400));
    ok(ex.includes('— Bitácora —\n2026-09-20 · Claude · v3 · ✅ · «salió con páginas»\n2026-09-14 · Gemini · v3 · ❌ · «inventó una fuente»\n') && ex.includes('2026-08-30 · Claude · v3 · ⏳ sin contestar'),
      'la bitácora, del uso más nuevo al más viejo, y el no contestado dicho');
    ok(!ex.includes('LÁPIDA') && !ex.includes('NO DEBE SALIR'), 'ninguna lápida y ningún material');
    ok((ex.match(/Zeta 01/g) || []).length === 1 && ex.includes('Zeta 01 · 🔁 Bucle · Careo · ChatGPT · v1 · sin usar · también en: Revista, Maestría'),
      'una pieza en varios estantes sale UNA vez, bajo el primero, con «también en: …» (y «zeta»/«ZETA» son el mismo)', ex);
    ok(ex.includes('Máquina: {{maquina}} · {{titulo}}'), 'el export no rellena ni las reservadas: es un respaldo');
    ok(/── Estante: Revista ──[\s\S]*── Estante: zeta ──[\s\S]*── Sin estante ──\n📜 Suelta · 🕸 Grafo · Cadena · v2 · usada 1 vez\n## Meta\nAlgo\.\n$/.test(ex),
      'los estantes en orden y «Sin estante» al final; la última línea es la de la pieza', ex.slice(-300));
    ok(!ex.includes('Cómo hacerlo en este chat'), 'el bloque sintético «como» no es contenido y no sale');
    const soloReg = L('csgExportarTexto')([{ id: 'r', clase: 'prompt', molde: 'rapido', titulo: 'R', usos: 1, estantes: [], bloques: [], bitacora: [{ uid: 'q', t: T(8, 5), maquina: 'claude', v: 1, ok: 'regular', nota: '' }] }], '2026-09-22');
    ok(soloReg.includes('📜 R · 💬 Prompt · Rápido · v1 · usada 1 vez\n— Bitácora —\n2026-09-05 · Claude · v1 · 〰'), 'con solo 〰 contestados no sale «👍 0 · 👎 0»', soloReg);
    igual(L('csgExportarTexto')([], '2026-09-22'), 'F.A.R.O · La Consigna · 2026-09-22 · 0 piezas\n', 'sin piezas, solo la cabecera');
    const exR = L('csgExportarTexto')([
      { id: 'a', clase: 'prompt', molde: 'rapido', titulo: 'A', estantes: ['Otro', 'zeta'], bloques: [] },
      { id: 'b', clase: 'prompt', molde: 'rapido', titulo: 'B', estantes: [' Zeta '], bloques: [] },
    ], '2026-09-22');
    igual(exR, 'F.A.R.O · La Consigna · 2026-09-22 · 2 piezas\n── Estante: Otro ──\n📜 A · 💬 Prompt · Rápido · v1 · sin usar · también en: zeta\n\n── Estante: zeta ──\n📜 B · 💬 Prompt · Rápido · v1 · sin usar\n',
      'el estante se nombra como se escribió la primera vez, en cualquier puesto (como rcuEstantesTodos), y una pieza sin bloques sale solo con su línea');
  });

  seccion('2.12 csgMdCrudo: el texto que decide si nace una versión', () => {
    /* §5, paso 5: «si usos > 0 y el texto armado en md cambió, nace la
       versión n+1». Una versión guarda solo los BLOQUES, así que lo que se
       compara tiene que depender solo de ellos: ni de {{hoy}}, que cambia
       cada día, ni de la máquina, ni del título, ni del material. */
    const crudo = L('csgMdCrudo');
    const base = P('prompt', 'encargo', { tarea: 'Resume {{tema}} para {{maquina}}, «{{titulo}}», hoy {{hoy}}.', formato: 'Lista.' }, { titulo: 'Uno', maquina: 'claude', material: 'EL INFORME' });
    const c0 = crudo(base);
    igual(c0, '## Tarea\nResume {{tema}} para {{maquina}}, «{{titulo}}», hoy {{hoy}}.\n\n## Formato de salida\nLista.', 'la consigna en md, sin rellenar nada y sin material');
    ok(crudo(Object.assign({}, base, { titulo: 'Otro título', maquina: 'gemini', material: 'OTRO INFORME' })) === c0,
      'cambiar el título, la máquina o el material no cambia el texto crudo: no nace una versión');
    ok(crudo(Object.assign({}, base, { bloques: base.bloques.map(b => b.id === 'formato' ? Object.assign({}, b, { t: 'Tabla.' }) : b) })) !== c0,
      'cambiar un bloque, sí');
    const hoy = L('csgHoy')();
    ok(armar(base, '', {}, { forma: 'md' }).principal.includes(hoy) && !c0.includes(hoy),
      'csgArmar en md SÍ rellena {{hoy}}: por eso no sirve para decidir una versión (nacería una cada día)');
    ok(crudo(SKILL).startsWith('## Nombre (name)\ncorrector-revista-casa\n\n## Descripción y disparador (description)\n'),
      'en un SKILL.md también sale en md: se compara, no se copia', crudo(SKILL).slice(0, 120));
    ok(crudo(null) === '' && crudo({ molde: 'no-existe', bloques: [{ id: 'x', rotulo: 'X', t: 'y' }] }) === '## X\ny', 'una pieza nula o de un molde que ya no existe no revienta');
  });

  seccion('2.13 El armado no toca el DOM ni el almacén, y el repaso cose con él', () => {
    ok(!toques.length, 'ninguna de las llamadas de arriba tocó document, window, localStorage, navigator ni fetch', 'tocados: ' + [...new Set(toques)].join(', '));
    ok(armar(ENCARGO, 'claude').principal === EJ.xml, 'con el lector y la nube cargados detrás, csgArmar sigue armando igual (nadie la pisó)');
    const r = L('csgRevisar')(ENCARGO, 'claude');
    ok(r && Array.isArray(r.para) && Array.isArray(r.avisa) && typeof r.palabras === 'number' && r.palabras > 0,
      'csgRevisar (el repaso) corre sobre csgArmar sin reventar: ' + (r && r.palabras) + ' palabras', JSON.stringify(r).slice(0, 300));
    ok(!toques.length, 'y el repaso tampoco toca nada', 'tocados: ' + [...new Set(toques)].join(', '));
  });

  /* Lo que encontró la revisión de los formatos del 23 de septiembre de
     2026. Cada comprobación se probó quitando su arreglo: sin él, suspende. */
  seccion('2.14 Lo que cazó la revisión de los formatos', () => {
    const leer = L('csgLeer');

    /* En texto seguido, UN párrafo por bloque (§7). Un bloque de dos
       párrafos salía como dos, y el segundo se leía como otro bloque. */
    const SIS2 = P('habilidad', 'sistema', { identidad: 'Eres el corrector.\n\nTono: seco y breve.', mision: 'Corregir.', siempre: 'Siempre responde.', nunca: 'Nunca inventes.' });
    const s2 = armar(SIS2, 'claude').principal;
    igual(s2, 'IDENTIDAD: Eres el corrector. Tono: seco y breve.\n\nMISIÓN: Corregir.\n\nSIEMPRE: Siempre responde.\n\nNUNCA: Nunca inventes.',
      'seguida: una Identidad de dos párrafos sale en UN párrafo, y «Tono:» no queda suelto al nivel de «MISIÓN:»');
    const r2 = leer(s2);
    ok(r2.molde === 'sistema' && bl(r2, 'identidad') && bl(r2, 'identidad').t === 'Eres el corrector. Tono: seco y breve.' && !bl(r2, 'tono'),
      '… y al volver a pegarlo el «Tono:» sigue dentro de la Identidad: la ida y vuelta no muda el texto a otro bloque', JSON.stringify(r2.bloques));
    const nb = armar(P('prompt', 'encargo', { tarea: 'Uno.\n\nDos.', formato: 'Lista.' }), 'notebooklm').principal;
    igual(nb, 'Tarea: Uno. Dos.\n\nFormato de salida: Lista.', 'NotebookLM: una Tarea de dos párrafos, en un párrafo');
    const rn = leer(nb);
    ok(bl(rn, 'tarea') && bl(rn, 'tarea').t === 'Uno. Dos.' && bl(rn, 'formato') && bl(rn, 'formato').t === 'Lista.', '… y vuelve con cada texto en su bloque', JSON.stringify(rn.bloques));
    const skS = armar(P('habilidad', 'skill', { nombre: 'x', disparador: 'Usa C:\\ruta\n\ny: dos cosas', pasos: '1. a', comprobacion: 'c' }), 'claude').sistema;
    ok(skS.includes('\n\nDescripción y disparador (description): Usa C:\\ruta y: dos cosas\n\nPasos: '), '«📋 Copiar como instrucción de sistema» de un SKILL.md: una description de dos párrafos va en uno', skS);

    /* Un libre rotulado «Material» no puede ser un segundo <material>. */
    const TM = '## Tarea\nResume.\n## Formato\nLista.\n## Material\nnotas mías sobre el material\n===\nEL INFORME';
    const rm = leer(TM);
    const lib = rm.bloques.find(b => b.rotulo === 'Material');
    ok(!!lib && lib.id !== 'material' && lib.t === 'notas mías sobre el material' && rm.material === 'EL INFORME', 'un bloque libre rotulado «Material» no se queda con el id `material`', JSON.stringify(rm.bloques));
    const xm = armar({ clase: rm.clase, molde: rm.molde, titulo: '', bloques: rm.bloques, material: rm.material }, 'claude').principal;
    ok((xm.match(/<material>/g) || []).length === 1 && xm.endsWith('\n\n<material>\nEL INFORME\n</material>'), '… y en Claude sale UN solo <material>: el del material', xm);
    const rm2 = leer(xm);
    ok(rm2.material === 'EL INFORME' && !!lib && rm2.bloques.some(b => b.id === lib.id && b.t === 'notas mías sobre el material'),
      '… y al volver a pegarlo el libre sigue siendo un bloque con su id, sin fundirse con el material', JSON.stringify({ bloques: rm2.bloques, material: rm2.material }));
    const viejo = { clase: 'prompt', molde: 'rapido', bloques: [{ id: 'tarea', t: 'T.' }, { id: 'material', rotulo: 'Material', t: 'nota' }, { id: 'ejemplo', rotulo: 'Ejemplo', t: 'uno' }], material: 'M' };
    const xv = armar(viejo, 'claude').principal;
    ok((xv.match(/<material>/g) || []).length === 1 && xv.includes('<material_2>\nnota\n</material_2>') && xv.includes('<ejemplo_2>\nuno\n</ejemplo_2>') && !/<ejemplo>/.test(xv),
      'una pieza ya guardada con un libre `material` o `ejemplo` sale rebautizada (<material_2>, <ejemplo_2>)', xv);
    const rv = leer(xv);
    ok(rv.material === 'M' && !bl(rv, 'ejemplos') && rv.bloques.some(b => b.id === 'material_2' && b.t === 'nota') && rv.bloques.some(b => b.id === 'ejemplo_2' && b.t === 'uno'),
      '… y vuelve igual: ni el libre se funde con el material ni el <ejemplo_2> se toma por un par', JSON.stringify(rv.bloques));

    /* El material que trae dentro su propia marca de cierre. */
    const PM = P('prompt', 'encargo', { tarea: 'Revisa este prompt.', formato: 'Lista.' }, { material: '<tarea>\nhaz algo\n</tarea>\n<material>\nX\n</material>\nfinal' });
    const xp = armar(PM, 'claude').principal;
    ok((xp.match(/<\/material>/g) || []).length === 1 && xp.endsWith('\nfinal\n</material>') && xp.includes('\nX\n&lt;/material>\nfinal'),
      'xml: el </material> que traía el material se escapa, y el cierre de verdad es el único', xp);
    const rp = leer(xp);
    ok(rp.material === PM.material && bl(rp, 'tarea') && bl(rp, 'tarea').t === 'Revisa este prompt.' && bl(rp, 'formato') && bl(rp, 'formato').t === 'Lista.',
      '… y al volver a pegarlo el material es el mismo, carácter por carácter, y la Tarea no se queda con su final', JSON.stringify({ bloques: rp.bloques, material: rp.material }));
    const PM2 = P('prompt', 'encargo', { tarea: 'T.', formato: 'F.' }, { material: 'a\n=== Fin del material ===\nb' });
    const mp = armar(PM2, 'chatgpt').principal;
    ok(mp.endsWith('=== Material ===\na\n\\=== Fin del material ===\nb\n=== Fin del material ==='), 'md: el renglón «=== Fin del material ===» de dentro sale escapado con una barra', mp);
    const rp2 = leer(mp);
    ok(rp2.material === PM2.material && bl(rp2, 'formato') && bl(rp2, 'formato').t === 'F.', '… y vuelve entero, sin que el Formato se quede con el final del material', JSON.stringify({ bloques: rp2.bloques, material: rp2.material }));
    const avM = L('csgRevisar')(PM, 'claude').avisa.find(x => /marca de cierre/.test(x.msg));
    ok(!!avM && /«<\/material>»/.test(avM.msg) && !L('csgRevisar')(PM2, 'claude').avisa.some(x => /marca de cierre/.test(x.msg)),
      'y el repaso avisa de la marca que se escapó (en Claude, «</material>»; unas «===» no le molestan a Claude)', JSON.stringify(L('csgRevisar')(PM, 'claude').avisa));

    /* El plan de un bucle con un bloque libre. */
    const HB = P('bucle', 'hasta', { paso: 'P.', tope: 'Máximo 3 vueltas.' });
    HB.bloques.push({ id: 'restriccion_de_estilo', rotulo: 'Restricción de estilo', t: 'Sin adverbios.' });
    igual(armar(HB, 'chatgpt').plan, '1. Paso que se repite: P.\n2. Tope: Máximo 3 vueltas.\n3. Restricción de estilo: Sin adverbios.\n' + L('CSG_MOLDES').hasta.cierre,
      'el plan de un bucle lleva también sus bloques libres, en su orden y antes del cierre');
    igual(armar({ clase: 'bucle', molde: 'ya-no-existe', bloques: [{ id: 'paso', rotulo: 'Paso', t: 'P' }, { id: 'extra', rotulo: 'Extra', t: 'E' }] }, 'chatgpt').plan,
      '1. Paso: P\n2. Extra: E', '… y con un molde que el JS ya no conoce, cada bloque sale una vez');

    /* Los pasos del SKILL.md se numeran con un contador. */
    const sk5 = armar(P('habilidad', 'skill', { nombre: 'x', disparador: 'd', pasos: 'Antes de nada, lee todo.\n1. Marca erratas.\n2. Devuelve.' }), 'claude').skill;
    ok(sk5.includes('## Pasos\n1. Antes de nada, lee todo.\n2. Marca erratas.\n3. Devuelve.'), 'SKILL.md: un paso sin número delante de «1.» no deja dos «1.»: se numera con un contador', sk5);
    ok(armar(P('habilidad', 'skill', { nombre: 'x', disparador: 'd', pasos: 'a\n5) b\nc' }), 'claude').skill.includes('## Pasos\n1. a\n5) b\n6. c'),
      '… y un número que sigue subiendo se respeta, con su paréntesis');
    ok(!toques.length, 'y nada de esto tocó el DOM, el almacén ni la red', 'tocados: ' + [...new Set(toques)].join(', '));
  });

  /* El Cuento que enseña (pedido el 26 de septiembre de 2026): en
     Storybook sale en texto seguido con la cabecera delante, y con otra
     máquina en la forma de esa máquina, sin la cabecera, que es de la
     forma seguida. */
  seccion('2.15 Cuento que enseña (§7): Storybook en seguida, con su cabecera', () => {
    const a = armar(CUENTO, 'storybook');
    igual(a.principal, EJ.cuento, 'seguida (Storybook) = el ejemplo del plan, carácter por carácter');
    igual(a.forma, 'seguida', 'la forma dicha es seguida: la de la máquina, porque el molde no fuerza ninguna');
    ok(a.principal.startsWith('Crea un cuento ilustrado con estas indicaciones.\n\nTema de la historia: '), 'la cabecera va delante, separada por una línea en blanco');
    const x = armar(CUENTO, 'claude'), m = armar(CUENTO, 'chatgpt'), g = armar(CUENTO, 'gemini');
    /* ⚠️ La cabecera va en las TRES formas: el cuento no tiene Tarea, y sin
       ella Claude y ChatGPT recibían datos rotulados sin ninguna petición. */
    const CAB = 'Crea un cuento ilustrado con estas indicaciones.\n\n';
    ok(x.forma === 'xml' && x.principal.startsWith(CAB + '<tema>\n') && x.principal.includes('\n<desenlace>\n') && x.principal.split('Crea un cuento ilustrado').length === 2,
      'con Claude, el mismo cuento en xml: la cabecera pelada delante (una vez) y cada bloque en su etiqueta', x.principal.slice(0, 120));
    ok(m.principal.startsWith(CAB + '## Tema de la historia\n') && m.principal.includes('\n## Lo que debe sentir el lector\n') && g.principal === m.principal,
      'con ChatGPT y con Gemini, en md: la cabecera delante y sus rótulos del molde', m.principal.slice(0, 120));
    /* Tono y Reglas son de sistema: con Claude salen en «📋 Copiar sistema». */
    ok(/^<tono>\n/.test(x.sistema) && x.sistema.includes('\n<reglas>\n') && !x.sistema.includes('Crea un cuento') && !x.encargo.includes('<tono>') && x.encargo.startsWith(CAB + '<tema>\n'),
      'en xml, «Cómo se cuenta» y «Reglas» van en la mitad de sistema; la cabecera y el resto, en el encargo (es lo que se pide en el chat)');
    const crudo = L('csgMdCrudo')(CUENTO);
    ok(crudo === L('csgMdCrudo')(Object.assign({}, CUENTO, { maquina: 'claude', titulo: 'Otro' })) && crudo.startsWith(CAB),
      'y el md crudo (el que decide si nace una versión) la lleva siempre igual: no hace nacer versiones');
    const ns = L('csgPalabras')(a.principal);
    ok(ns > 150 && ns < 400, 'el cuento de ejemplo son ' + ns + ' palabras: un prompt de Storybook de verdad, no un telegrama ni un ensayo');
    ok(!toques.length, 'y el armado del cuento no tocó el DOM, el almacén ni la red', 'tocados: ' + [...new Set(toques)].join(', '));
  });
}

/* ══════════════════════════════════════════════════════════════════
   3. LA NUBE
   ══════════════════════════════════════════════════════════════════ */
async function parte3() {
  parte(3, 'La nube: la firma, la poda por bytes, la lápida, la fusión y las causas');

  /* ── El salón de la nube: un almacén de verdad, un document que
     REVIENTA si se le toca, relojes acortados (la prueba no espera ocho
     segundos para ver que una petición colgada acaba en «sin señal»), una
     sesión de mentira y un cliente de Supabase de mentira. ── */
  const almacen = {};
  /* Cuántas veces se escribió la copia de las piezas en el aparato: la
     3.19 exige que guardar veinte piezas de golpe no sean veinte
     escrituras. */
  let escriturasPiezas = 0;
  const localStorage = {
    getItem: k => (k in almacen ? almacen[k] : null),
    setItem: (k, v) => { if (k === 'faro_consigna_v1') escriturasPiezas++; almacen[k] = String(v); },
    removeItem: k => { delete almacen[k]; },
  };
  const documentoTrampa = new Proxy({}, { get(_, k) { throw new Error('se tocó document.' + String(k)); } });
  let sesion = { user: 'josue', nombre: 'Josué' };
  const ctx = {
    console, localStorage, document: documentoTrampa, window: {},
    setTimeout: (f, ms) => setTimeout(f, ms >= 8000 ? 40 : (ms >= 2000 ? 30 : ms)),
    clearTimeout,
    verificarSesion: () => sesion,
    MIEMBROS: { josue: { nombre: 'Josué' }, evelyn: { nombre: 'Evelyn' } },
  };
  let G;
  try { G = cargaEn(ctx); ok(true, 'el archivo carga en el salón de la nube sin tocar el DOM'); }
  catch (e) { ok(false, 'el archivo carga en el salón de la nube sin tocar el DOM', e.message); return; }
  const S = (n, v) => { ctx.__v = v; vm.runInContext(n + ' = __v', ctx); };

  /* ── La medida de PostgreSQL, escrita aparte: independiente de
     csgLargoBase, produce el TEXTO que escribe jsonb y lo cuenta en puntos
     de código. ── */
  function pgTexto(v) {
    if (v === null || v === undefined) return 'null';
    if (Array.isArray(v)) return '[' + v.map(x => pgTexto(x === undefined ? null : x)).join(', ') + ']';
    if (typeof v === 'object') return '{' + Object.keys(v).filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ': ' + pgTexto(v[k])).join(', ') + '}';
    return JSON.stringify(v);
  }
  const pgLargo = v => Array.from(pgTexto(v)).length;
  const cpL = s => Array.from(String(s)).length;

  /* ── La base de mentira, que exige lo que exige la de verdad: los topes
     y las columnas se leen del propio consigna.sql. ── */
  const TOPES_SQL = {};
  /* Y los que el SQL escribe como un intervalo («length(clase) between 1
     and 20», «version between 1 and 100000»): se guarda [mínimo, máximo],
     y TOPES_SQL lleva el máximo, que es lo que CSG_TOPES tiene que decir. */
  const ENTRE_SQL = {};
  if (SQL) {
    const re = /length\((\w+)(?:::text)?\)\s*<=\s*(\d+)/g; let m;
    while ((m = re.exec(SQL))) TOPES_SQL[m[1]] = Number(m[2]);
    const t = /length\(btrim\(titulo\)\)\s*between\s*1\s*and\s*(\d+)/.exec(SQL);
    if (t) TOPES_SQL.titulo = Number(t[1]);
    const re2 = /check \((?:length\()?(\w+)\)?\s+between\s+(\d+)\s+and\s+(\d+)\)/g;
    while ((m = re2.exec(SQL))) { ENTRE_SQL[m[1]] = [Number(m[2]), Number(m[3])]; if (m[1] !== 'id') TOPES_SQL[m[1]] = Number(m[3]); }
  }
  const COLS_SQL = (() => {
    if (!SQL) return [];
    const cuerpo = /create table if not exists public\.consigna_piezas \(([\s\S]*?)\n\);/.exec(SQL);
    if (!cuerpo) return [];
    return cuerpo[1].split('\n').map(l => l.replace(/--.*$/, '').trim()).filter(Boolean)
      .map(l => /^([a-z_]+)\s+(text|jsonb|integer|bigint|boolean|timestamptz)/.exec(l)).filter(Boolean).map(m => m[1]);
  })();
  const base = { modo: 'puesta', faltan: [], filas: new Map(), selects: [], upserts: [], error: null, demora: 0 };
  const rebota = (code, message) => Promise.resolve({ data: null, error: { code, message } });
  function compruebaFila(f) {
    if (!f.autor) return ['23502', 'null value in column "autor" violates not-null constraint'];
    /* Los intervalos del SQL (id de 4 a 60, clase, molde, versión) y el
       tipo de `eliminado_at`, que es un timestamptz: un número de
       milisegundos ahí es un 22007 en la base de verdad. */
    for (const c of ['id', 'clase', 'molde']) {
      if (ENTRE_SQL[c] && c in f && (cpL(f[c]) < ENTRE_SQL[c][0] || cpL(f[c]) > ENTRE_SQL[c][1])) return ['23514', 'violates check constraint (' + c + ')'];
    }
    if (ENTRE_SQL.version && 'version' in f && (f.version < ENTRE_SQL.version[0] || f.version > ENTRE_SQL.version[1])) return ['23514', 'violates check constraint (version)'];
    if ('eliminado_at' in f && f.eliminado_at !== null && (typeof f.eliminado_at !== 'string' || isNaN(Date.parse(f.eliminado_at)))) {
      return ['22007', 'invalid input syntax for type timestamp with time zone: "' + f.eliminado_at + '"'];
    }
    if (!f.titulo || cpL(f.titulo.trim()) < 1 || cpL(f.titulo.trim()) > TOPES_SQL.titulo) return ['23514', 'violates check constraint (titulo)'];
    for (const c of ['bloques', 'estantes', 'bitacora', 'versiones']) {
      if (c in f && (!Array.isArray(f[c]) || pgLargo(f[c]) > TOPES_SQL[c])) return ['23514', 'violates check constraint (' + c + ')'];
    }
    for (const c of ['material', 'notas', 'maquina', 'cuaderno', 'autor']) {
      if (c in f && cpL(f[c]) > TOPES_SQL[c]) return ['23514', 'violates check constraint (' + c + ')'];
    }
    return null;
  }
  const cliente = {
    from(tabla) {
      return {
        select(cols) {
          const pedidas = String(cols).split(',');
          const q = {
            order() { return q; },
            limit() { return q; },
            then(res, rej) {
              base.selects.push(pedidas);
              let p;
              if (tabla !== 'consigna_piezas') p = rebota('42P01', 'relation "public.' + tabla + '" does not exist');
              else if (base.modo === 'sin-tabla') p = rebota('42P01', 'relation "public.consigna_piezas" does not exist');
              else if (base.modo === 'colgada') p = new Promise(() => {});
              else {
                const falta = pedidas.find(c => base.faltan.includes(c) || !COLS_SQL.includes(c));
                if (falta) p = rebota('42703', 'column consigna_piezas.' + falta + ' does not exist');
                else p = Promise.resolve({ data: [...base.filas.values()].map(f => { const o = {}; pedidas.forEach(c => { if (c in f) o[c] = f[c]; }); return JSON.parse(JSON.stringify(o)); }), error: null });
              }
              return p.then(res, rej);
            },
          };
          return q;
        },
        upsert(filas, opciones) {
          const lista = Array.isArray(filas) ? filas : [filas];
          base.upserts.push({ filas: JSON.parse(JSON.stringify(lista)), opciones });
          let p;
          if (base.modo === 'sin-tabla') p = rebota('42P01', 'relation "public.consigna_piezas" does not exist');
          else if (base.modo === 'colgada') p = new Promise(() => {});
          else if (base.error) p = rebota(base.error.code, base.error.message);
          else {
            const falta = lista.map(f => Object.keys(f).find(c => base.faltan.includes(c) || !COLS_SQL.includes(c))).find(Boolean);
            if (falta) p = rebota('PGRST204', "Could not find the '" + falta + "' column of 'consigna_piezas' in the schema cache");
            else {
              const mal = lista.map(compruebaFila).find(Boolean);
              if (mal) p = rebota(mal[0], mal[1]);
              else {
                lista.forEach(f => base.filas.set(f.id, Object.assign({}, base.filas.get(f.id) || {}, JSON.parse(JSON.stringify(f)))));
                /* `demora`: la respuesta tarda en volver (la fila ya se escribió),
                   para ver qué pasa con lo que se toca mientras la subida viaja. */
                p = base.demora ? new Promise(r => setTimeout(() => r({ data: null, error: null }), base.demora)) : Promise.resolve({ data: null, error: null });
              }
            }
          }
          return { then: (res, rej) => p.then(res, rej) };
        },
      };
    },
  };
  ctx.window.faroSb = cliente;

  function reinicia(modo) {
    base.modo = modo || 'puesta'; base.faltan = []; base.filas = new Map(); base.selects = []; base.upserts = []; base.error = null; base.demora = 0;
    for (const k of Object.keys(almacen)) delete almacen[k];
    /* Las subidas con respiro que dejó pendientes la sección de antes (un
       uso apuntado se sube solo) se cancelan: si no, dispararían en mitad
       de la siguiente y le sumarían un upsert que no hizo. */
    vm.runInContext("Object.keys(_csgLuego).forEach(k => clearTimeout(_csgLuego[k].t)); _csgLuego = {}; _csgSinEspacio = false;", ctx);
    vm.runInContext("_csgLista = []; _csgCargada = false; _csgNube = 'mirando'; _csgHayTabla = false; _csgColsFuera = []; _csgInitEnCurso = null;", ctx);
    sesion = { user: 'josue', nombre: 'Josué' };
  }
  /* Cerrar la aplicación y volver a abrirla: lo de la memoria se va y lo
     del aparato (el almacén) se queda. */
  function reabre() {
    vm.runInContext("Object.keys(_csgLuego).forEach(k => clearTimeout(_csgLuego[k].t)); _csgLuego = {};", ctx);
    vm.runInContext("_csgLista = []; _csgCargada = false; _csgNube = 'mirando'; _csgHayTabla = false; _csgColsFuera = []; _csgInitEnCurso = null;", ctx);
  }
  const espera = ms => new Promise(r => setTimeout(r, ms));
  function pieza(extra) {
    const csgNuevoId = G('csgNuevoId');
    return Object.assign({
      id: csgNuevoId(), clase: 'prompt', molde: 'encargo', titulo: 'Resumen de informe', maquina: 'claude',
      bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'Resume el informe.' }, { id: 'formato', rotulo: 'Formato de salida', t: 'Lista.' }],
      material: '', estantes: ['Maestría'], cuaderno: '', notas: '', bitacora: [], versiones: [], version: 1,
      usos: 0, ultima: 0, autor: '', eliminado: false, eliminado_at: null, actualizado: Date.now(),
    }, extra || {});
  }
  const lista = () => G('_csgLista');
  const nube = () => G('_csgNube');
  const ahora = Date.now();
  const bl = n => [{ id: 'tarea', rotulo: 'Tarea', t: 'v'.repeat(n) }];

  await seccionA('3.1 CSG_TOPES y CSG_COLUMNAS contra los check de consigna.sql', async () => {
    /* Si no se puede leer el SQL, SUSPENDE: sin él la comprobación no vale,
       y aprobar con la lista vacía sería el doble complaciente de siempre. */
    if (!SQL) { ok(false, 'se puede leer supabase/sql/consigna.sql', 'no se pudo leer: sin él la comprobación no vale'); return; }
    const T = G('CSG_TOPES');
    /* Todos los que tiene la fila, también los cortos: si uno viviera
       escrito a mano en csgAFila, esta lista no lo vería nunca. */
    for (const k of ['bloques', 'material', 'estantes', 'notas', 'bitacora', 'versiones', 'titulo', 'clase', 'molde', 'maquina', 'cuaderno', 'autor', 'version']) ok(TOPES_SQL[k] === T[k], `CSG_TOPES.${k} = ${T[k]} y el check dice ${TOPES_SQL[k]}`);
    /* Y csgAFila corta con CSG_TOPES y no con un número suyo: se achican los
       topes en el salón y la fila tiene que salir cortada a lo nuevo. */
    const antesT = JSON.stringify(T);
    vm.runInContext('CSG_TOPES.clase = 3; CSG_TOPES.molde = 4; CSG_TOPES.maquina = 5; CSG_TOPES.cuaderno = 6; CSG_TOPES.autor = 7; CSG_TOPES.version = 8;', ctx);
    const fc = G('csgAFila')({ id: 'csg-topes-0001', clase: 'habilidad', molde: 'coordinador', titulo: 't', maquina: 'perplexity', cuaderno: 'cuaderno-largo', autor: 'alguien-largo', version: 50 });
    vm.runInContext('Object.assign(CSG_TOPES, ' + antesT + ')', ctx);
    ok(fc.clase === 'hab' && fc.molde === 'coor' && fc.maquina === 'perpl' && fc.cuaderno === 'cuader' && fc.autor === 'alguien' && fc.version === 8,
      'csgAFila corta clase, molde, máquina, cuaderno, autor y versión con CSG_TOPES, no con números escritos a mano', JSON.stringify(fc));
    ok(COLS_SQL.length === 21, 'la tabla tiene 21 columnas en el SQL', COLS_SQL.length);
    const pedidas = G('CSG_COLUMNAS').split(',');
    ok(pedidas.every(c => COLS_SQL.includes(c)), 'CSG_COLUMNAS son columnas de la tabla', pedidas.filter(c => !COLS_SQL.includes(c)).join(','));
  });

  await seccionA('3.2 csgLargoBase mide como jsonb::text', async () => {
    const csgLargoBase = G('csgLargoBase');
    const muestras = [
      [{ a: 'x, y', b: [1, 2], c: null, d: '😀\n' }],
      [{ uid: 'u-1', t: 1758585600000, maquina: 'claude', v: 3, ok: null, nota: 'con "comillas" y \\ barra' }],
      [], {}, [[], {}], 'ñandú', true, false, 12.5,
    ];
    for (const m of muestras) ok(csgLargoBase(m) === pgLargo(m), 'mide ' + JSON.stringify(m).slice(0, 50), csgLargoBase(m) + ' contra ' + pgLargo(m));
    try {
      const q = "select length('" + JSON.stringify(muestras[0]).replace(/'/g, "''") + "'::jsonb::text)";
      const r = cp.execFileSync('psql', ['-h', '/tmp/pg', '-p', '55432', '-U', 'postgres', '-Atc', q], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
      ok(Number(r) === csgLargoBase(muestras[0]), 'y coincide con el PostgreSQL de verdad (' + r + ')', r);
    } catch (e) { console.log('  · sin PostgreSQL a mano en /tmp/pg:55432: la medida se comprobó solo contra la copia de la prueba'); }
  });

  await seccionA('3.3 Sin tabla (42P01)', async () => {
    reinicia('sin-tabla');
    S('_csgLista', [G('csgDesdeFila')(pieza({ titulo: 'Ya estaba', subida: false }))]);
    S('_csgCargada', true);
    const l = await G('csgCargar')();
    ok(nube() === 'sin-tabla', "_csgNube = 'sin-tabla'", nube());
    ok(l.length === 1 && lista().length === 1, 'la lista en memoria NO se vacía');
    ok(/falta correr consigna\.sql/.test(G('csgRotuloNube')().t), 'la franja dice «falta correr consigna.sql»', G('csgRotuloNube')().t);
    ok(base.upserts.length === 0, 'no intenta subir sin tabla');
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.length === 1, 'queda guardada en el aparato');
  });

  await seccionA('3.4 La base va vieja (42703): la columna que el error NOMBRA', async () => {
    reinicia('puesta');
    base.faltan = ['notas'];
    const vieja = pieza({ titulo: 'Con notas', notas: 'esto no viaja' });
    S('_csgLista', [vieja]); S('_csgCargada', true);
    await G('csgCargar')();
    ok(nube() === 'vieja', "_csgNube = 'vieja'", nube());
    ok(JSON.stringify(G('_csgColsFuera')) === '["notas"]', 'se apunta SOLO la columna nombrada', JSON.stringify(G('_csgColsFuera')));
    ok(base.selects.length === 2 && !base.selects[1].includes('notas') && base.selects[1].length === base.selects[0].length - 1, 'repite la consulta sin esa columna y con todas las demás');
    ok(base.upserts.length === 1 && base.upserts[0].filas.every(f => !('notas' in f)), 'y al subir no la manda');
    ok(base.filas.has(vieja.id), 'la pieza subió igual');
    ok(lista().find(p => p.id === vieja.id).notas === 'esto no viaja', 'la columna que la base no devolvió no se pisa con vacío');
    const rv = G('csgRotuloNube')().t;
    ok(/vuelve a correr consigna\.sql/.test(rv) && /notas/.test(rv), 'la franja dice «vuelve a correr» y nombra la columna', rv);
    /* Y al escribir: la base rebota con PGRST204 nombrando otra columna. */
    base.faltan = ['notas', 'cuaderno'];
    const otra = pieza({ titulo: 'Con cuaderno', cuaderno: 'rc-1' });
    G('csgMeteEnLista')(otra);
    const rs = await G('csgSubir')(otra);
    ok(rs.ok && G('_csgColsFuera').includes('cuaderno'), 'al subir, un PGRST204 quita la columna nombrada y repite', JSON.stringify(rs));
  });

  await seccionA('3.5 Petición colgada (FARO_RELOJ)', async () => {
    reinicia('colgada');
    S('_csgLista', [pieza({ titulo: 'Uno' }), pieza({ titulo: 'Dos' })]); S('_csgCargada', true);
    const t0 = Date.now();
    await G('csgCargar')();
    ok(nube() === 'sin-senal', "_csgNube = 'sin-senal'", nube());
    ok(lista().length === 2, 'la lista en memoria NO se vacía');
    ok(Date.now() - t0 < 2000, 'vuelve por el reloj, no se queda colgada');
    ok(/sin señal · reintentar/.test(G('csgRotuloNube')().t), 'la franja dice «sin señal · reintentar»', G('csgRotuloNube')().t);
    const rc = await G('csgConReloj')(new Promise(() => {}), 10);
    ok(rc.error && rc.error.code === 'FARO_RELOJ' && rc.data === null, 'csgConReloj devuelve {data:null, error:{code:"FARO_RELOJ"}}');
    const rl = await G('csgConReloj')(Promise.reject(new Error('Failed to fetch')), 1000);
    ok(rl.error && G('csgMotivoDe')(rl.error) === 'sin-senal', 'una petición que LANZA también es la señal');
  });

  await seccionA('3.6 Subida: UN viaje, onConflict id, con autor', async () => {
    reinicia('puesta');
    S('_csgLista', [pieza({ titulo: 'A' }), pieza({ titulo: 'B' }), pieza({ titulo: 'C' })]); S('_csgCargada', true);
    await G('csgCargar')();
    ok(nube() === 'puesta', "_csgNube = 'puesta'", nube());
    ok(base.upserts.length === 1, 'las tres pendientes suben en UN solo upsert', base.upserts.length);
    ok(base.upserts[0] && base.upserts[0].opciones && base.upserts[0].opciones.onConflict === 'id', "con onConflict 'id'");
    ok(base.upserts[0] && base.upserts[0].filas.length === 3 && base.upserts[0].filas.every(f => f.autor === 'josue' && f.actualizado > 0), "cada fila con autor 'josue' y su actualizado");
    ok(lista().every(p => p.subida === true), 'las tres quedan subidas');
    base.upserts = [];
    await G('csgCargar')();
    ok(base.upserts.length === 0, 'volver a abrir no vuelve a subir lo que ya está');
  });

  await seccionA('3.7 Sin sesión: se guarda aquí y espera la firma', async () => {
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    sesion = null;
    const sin = pieza({ titulo: 'Sin firma' });
    const rp = await G('csgPersistir')(sin);
    ok(!rp.ok && rp.motivo === 'sin-sesion', 'csgPersistir no sube, motivo «sin-sesion»', JSON.stringify(rp));
    ok(base.upserts.length === 0, 'ni un solo upsert');
    ok(sin.subida === false && sin.motivo === 'sin-sesion' && sin.autor === '', 'queda pendiente, sin firma y con su motivo');
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.some(p => p.id === sin.id), 'guardada en el aparato');
    ok(/sin sesión: se firmará al entrar/.test(G('csgRotuloNube')().t), 'la franja dice «sin sesión: se firmará al entrar»', G('csgRotuloNube')().t);
    /* La segunda fuente: lo que auth.js recuerda en el aparato. */
    almacen['faro.miembro'] = JSON.stringify({ user: 'evelyn' });
    ok(G('csgAutor')() === 'evelyn', 'csgAutor lee faro.miembro cuando no hay sesión comprobada');
    almacen['faro.miembro'] = JSON.stringify({ user: 'intruso' });
    ok(G('csgAutor')() === '', 'un identificador que no es de la casa no firma');
    delete almacen['faro.miembro'];
    ok(G('csgAutor')() === '', 'sin ninguna de las dos, la firma es vacía');
    /* Vuelve la sesión: csgSubirPendientes la firma y la sube. */
    sesion = { user: 'josue', nombre: 'Josué' };
    const n7 = await G('csgSubirPendientes')();
    ok(n7 === 1 && base.upserts.length === 1 && base.upserts[0].filas[0].autor === 'josue', 'al volver la sesión, csgSubirPendientes la sube FIRMADA', n7);
    ok(sin.subida === true && !sin.motivo && sin.autor === 'josue', 'y queda subida, firmada y sin motivo');
    /* Y por el camino de verdad: al volver a abrir, csgCargar baja y sube lo pendiente. */
    reinicia('puesta');
    sesion = null;
    const sin2 = pieza({ titulo: 'Sin firma al abrir' });
    S('_csgLista', [sin2]); S('_csgCargada', true);
    await G('csgCargar')();
    ok(base.upserts.length === 0 && sin2.motivo === 'sin-sesion', 'abrir sin sesión no sube la pieza sin firma');
    sesion = { user: 'evelyn', nombre: 'Evelyn' };
    await G('csgCargar')();
    ok(base.upserts.length === 1 && base.upserts[0].filas[0].autor === 'evelyn' && sin2.subida === true, 'abrir con sesión la firma y la sube');
  });

  await seccionA('3.8 Poda de la bitácora', async () => {
    const csgPodar = G('csgPodar');
    const p8 = pieza({ usos: 250, bitacora: Array.from({ length: 250 }, (_, i) => ({ uid: 'u' + i, t: ahora - i * 60000, maquina: 'claude', v: 1, ok: i % 3 ? null : 'si', nota: 'x'.repeat(i === 0 ? 900 : 10) })) });
    csgPodar(p8);
    ok(p8.bitacora.length === 200, '250 usos → 200', p8.bitacora.length);
    ok(p8.bitacora[0].uid === 'u0' && p8.bitacora[199].uid === 'u199', 'se quedan los 200 más recientes');
    ok(cpL(p8.bitacora[0].nota) === 300, 'la nota de un uso se corta a 300', cpL(p8.bitacora[0].nota));
    ok(p8.usos === 250, 'el contador de usos no se toca');
    const p8b = pieza({ bitacora: Array.from({ length: 200 }, (_, i) => ({ uid: 'w' + i, t: ahora - i * 1000, maquina: 'chatgpt', v: 2, ok: i < 100 ? 'no' : null, nota: 'ñ'.repeat(300) })) });
    csgPodar(p8b);
    ok(pgLargo(p8b.bitacora) <= 58000, 'una bitácora de notas llenas queda ≤ 58.000 medida como la base', pgLargo(p8b.bitacora));
    ok(p8b.bitacora.every(u => u.ok === 'no') && p8b.bitacora.length === 100 || p8b.bitacora.filter(u => u.ok === 'no').length === 100, 'se fueron primero los usos sin contestar, más viejos', p8b.bitacora.filter(u => u.ok === 'no').length);
    const p8c = pieza({ bitacora: Array.from({ length: 200 }, (_, i) => ({ uid: 'z' + i, t: ahora - i, maquina: 'claude', v: 1, ok: 'regular', nota: 'a'.repeat(280) })) });
    csgPodar(p8c);
    ok(pgLargo(p8c.bitacora) <= 58000 && p8c.bitacora[0].uid === 'z0', 'sin usos sin contestar, se va el más viejo', pgLargo(p8c.bitacora));
    /* Doscientos usos de notas de 197 ya pasan de 58.000 si se mide con
       JSON.stringify más los espacios de jsonb: */
    const p8d = pieza({ bitacora: Array.from({ length: 200 }, (_, i) => ({ uid: 'q' + i, t: ahora - i, maquina: 'claude', v: 1, ok: 'si', nota: 'b'.repeat(197) })) });
    csgPodar(p8d);
    ok(pgLargo(p8d.bitacora) <= 58000, 'la poda mide con los espacios de jsonb, no con JSON.stringify', JSON.stringify(p8d.bitacora).length + ' / ' + pgLargo(p8d.bitacora));
  });

  await seccionA('3.9 Poda de las versiones', async () => {
    const csgPodar = G('csgPodar');
    const p9 = pieza({ version: 12, versiones: Array.from({ length: 11 }, (_, i) => ({ vid: 'vid' + (i + 1), v: i + 1, t: ahora - (11 - i) * 3600000, bloques: bl(30000) })) });
    const r9 = csgPodar(p9);
    ok(pgLargo(p9.versiones) < 200000, '11 versiones de 30.000 quedan por debajo de 200.000', pgLargo(p9.versiones));
    ok(p9.versiones.length === 11, 'no se pierde ninguna versión: se pliegan', p9.versiones.length);
    const conBl = p9.versiones.filter(x => x.bloques).map(x => x.v).sort((a, b) => a - b);
    ok(conBl.length > 0 && conBl.length <= 10 && conBl[0] > 1 && conBl[conBl.length - 1] === 11, 'las viejas plegadas a {vid, v, t}, las nuevas con bloques', JSON.stringify(conBl));
    ok(p9.versiones.filter(x => !x.bloques).every(x => Object.keys(x).sort().join() === 't,v,vid'), 'una plegada es exactamente {vid, v, t}');
    ok(r9.plegadas === 11 - conBl.length, 'la poda dice cuántas plegó', r9.plegadas);
    const p9b = pieza({ versiones: Array.from({ length: 12 }, (_, i) => ({ vid: 'k' + i, v: i + 1, t: ahora - (12 - i) * 1000, bloques: bl(10) })) });
    csgPodar(p9b);
    ok(p9b.versiones.filter(x => x.bloques).length === 10, 'con poco texto, 10 conservan bloques y el resto se pliega', p9b.versiones.filter(x => x.bloques).length);
  });

  await seccionA('3.10 Bloques que no caben (60.001)', async () => {
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const grande = pieza({ titulo: 'Enorme' });
    grande.bloques = [{ id: 'tarea', rotulo: 'Tarea', t: '' }];
    grande.bloques[0].t = 'g'.repeat(60001 - pgLargo(grande.bloques));
    ok(pgLargo(grande.bloques) === 60001, 'la pieza de prueba mide 60.001 como la base', pgLargo(grande.bloques));
    const r10 = await G('csgPersistir')(grande);
    ok(!r10.ok && r10.motivo === 'no-cabe' && grande.noCabe === true, 'se marca noCabe y no sube', JSON.stringify({ ok: r10.ok, motivo: r10.motivo }));
    ok(r10.poda && r10.poda.sobra === 1, 'la poda dice cuánto sobra (1)', r10.poda && r10.poda.sobra);
    ok(base.upserts.length === 0, 'ni un upsert');
    ok(grande.bloques[0].t.length === 60001 - 43 || cpL(grande.bloques[0].t) > 59000, 'los bloques NO se recortan');
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.some(p => p.id === grande.id && p.noCabe), 'se guarda en el aparato con noCabe');
    const r10t = G('csgRotuloNube')().t;
    ok(/«Enorme» no cabe en la nube: recorta 1 carácter/.test(r10t), 'la franja nombra la pieza y lo que sobra', r10t);
    const chica = pieza({ titulo: 'Chica' });
    G('csgMeteEnLista')(chica);
    await G('csgSubirVarios')([grande, chica]);
    ok(base.upserts.length === 1 && base.upserts[0].filas.length === 1 && base.upserts[0].filas[0].id === chica.id, 'en un viaje de varias, la que no cabe se queda y las demás suben');
    grande.bloques[0].t = grande.bloques[0].t.slice(0, 1000); grande.actualizado = Date.now();
    const r10b = await G('csgPersistir')(grande);
    ok(r10b.ok && !grande.noCabe, 'recortada a mano, vuelve a caber y sube');

    /* ⚠️ EL REPASO Y LA FRANJA DICEN EL MISMO NÚMERO, medido como la base.
       El repaso medía con JSON.stringify, y jsonb::text escribe «": "» y
       «", "» con su espacio: una pieza de 60.000 para JSON.stringify es de
       60.005 para la base, y ahí la franja decía «no cabe» mientras el
       repaso no paraba nada. */
    const mide = async (titulo, largo) => {
      reinicia('puesta');
      S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
      const p = pieza({ titulo });
      p.bloques = [{ id: 'tarea', rotulo: 'Tarea', t: '' }];
      p.bloques[0].t = 'k'.repeat(largo - pgLargo(p.bloques));
      const js = JSON.stringify(p.bloques).length;
      const rev = G('csgRevisar')(p, 'claude').para.find(x => /No cabe en la nube/.test(x.msg));
      const r = await G('csgPersistir')(p);
      return { js, base: pgLargo(p.bloques), repaso: rev ? rev.msg : '(el repaso no para)', franja: G('csgRotuloNube')().t, sobra: r.poda && r.poda.sobra };
    };
    const j = await mide('Justa', 60005);
    ok(j.js === 60000 && j.base === 60005, 'la pieza de prueba mide 60.000 para JSON.stringify y 60.005 para la base', j.js + ' / ' + j.base);
    ok(/^No cabe en la nube: recorta 5 caracteres\.$/.test(j.repaso) && /«Justa» no cabe en la nube: recorta 5 caracteres$/.test(j.franja) && j.sobra === 5,
      'el repaso la PARA, y repaso, franja y poda dicen el mismo número (5)', j.repaso + ' | ' + j.franja + ' | ' + j.sobra);
    const k = await mide('Larga', 61204);
    ok(/recorta 1\.204 caracteres/.test(k.repaso) && /recorta 1\.204 caracteres/.test(k.franja) && k.sobra === 1204,
      'y con el punto de los miles en los dos sitios («recorta 1.204 caracteres»)', k.repaso + ' | ' + k.franja);
  });

  await seccionA('3.11 Material: 20.001 no viaja, 19.000 sí', async () => {
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const m1 = pieza({ titulo: 'Material grande', material: 'm'.repeat(20001) });
    const r11 = await G('csgPersistir')(m1);
    const f11 = base.upserts[0] && base.upserts[0].filas[0];
    ok(r11.ok && f11 && f11.material === '', 'un material de 20.001 NO viaja en el upsert', f11 && f11.material.length);
    ok(r11.poda.material === 1, 'la poda dice cuánto sobraba', r11.poda.material);
    ok(!JSON.parse(almacen.faro_consigna_v1).piezas.find(p => p.id === m1.id).material, 'ni se guarda en el aparato');
    const m2 = pieza({ titulo: 'Material bueno', material: 'n'.repeat(19000) });
    await G('csgPersistir')(m2);
    const f11b = base.upserts[1] && base.upserts[1].filas[0];
    ok(f11b && f11b.material.length === 19000, 'uno de 19.000 sí viaja en `material`', f11b && f11b.material.length);
    const m3 = pieza({ titulo: 'Emojis', material: '😀'.repeat(15000) });
    await G('csgPersistir')(m3);
    ok(base.upserts[2] && base.upserts[2].filas[0].material.length === 30000, '15.000 emojis son 15.000 caracteres para la base, y viajan');
  });

  await seccionA('3.12 Fusión por unión', async () => {
    const csgFusiona = G('csgFusiona');
    const csgAFila = G('csgAFila');
    const id = 'csg-fusion-000001';
    const loc = G('csgDesdeFila')(Object.assign(pieza({ id, titulo: 'Título local', usos: 2, actualizado: 2000, subida: true }), {
      bitacora: [{ uid: 'u1', t: 10, maquina: 'claude', v: 1, ok: 'si', nota: 'bien' }, { uid: 'u2', t: 20, maquina: 'claude', v: 1, ok: null, nota: '' }],
      versiones: [{ vid: 'v1', v: 1, t: 5, bloques: bl(3) }],
    }));
    const fila = csgAFila(Object.assign(pieza({ id, titulo: 'Título nube', usos: 2, actualizado: 3000, autor: 'evelyn' }), {
      bitacora: [{ uid: 'u1', t: 10, maquina: 'claude', v: 1, ok: null, nota: '' }, { uid: 'u3', t: 30, maquina: 'gemini', v: 2, ok: 'no', nota: 'inventó' }],
      versiones: [{ vid: 'v2', v: 2, t: 6, bloques: bl(4) }],
    }));
    const [fu] = csgFusiona([loc], [fila]);
    ok(fu.titulo === 'Título nube', 'los escalares los gana el actualizado más nuevo');
    ok(fu.bitacora.map(u => u.uid).sort().join() === 'u1,u2,u3', 'la bitácora es la UNIÓN por uid', fu.bitacora.map(u => u.uid).join());
    ok(fu.bitacora.find(u => u.uid === 'u1').ok === 'si', 'un ok puesto gana a un null del mismo uid, aunque venga del lado más viejo');
    ok(fu.versiones.map(x => x.vid).sort().join() === 'v1,v2', 'las versiones son la UNIÓN por vid');
    ok(fu.usos === 3, 'usos nunca menos que el largo de la bitácora', fu.usos);
    ok(fu.subida === false, 'lo que trae más que la nube queda para subir');
    /* Y en el otro sentido: el lado más nuevo es el que contestó. */
    const locN = Object.assign({}, loc, { actualizado: 1000, bitacora: [{ uid: 'u9', t: 90, maquina: 'claude', v: 1, ok: null, nota: '' }] });
    const filaN = Object.assign({}, fila, { bitacora: [{ uid: 'u9', t: 90, maquina: 'claude', v: 1, ok: 'regular', nota: 'a medias' }] });
    const [fuN] = csgFusiona([locN], [filaN]);
    ok(fuN.bitacora.length === 1 && fuN.bitacora[0].ok === 'regular' && fuN.bitacora[0].nota === 'a medias', 'y un null del lado viejo no borra el ok del lado nuevo');
    const locS = Object.assign({}, loc, { actualizado: 9999, bitacora: [{ uid: 'u9', t: 90, maquina: 'claude', v: 1, ok: null, nota: '' }] });
    const [fuS] = csgFusiona([locS], [filaN]);
    ok(fuS.bitacora[0].ok === 'regular', 'ni un null del lado nuevo borra el ok que contestó el otro aparato');
    const [fu2] = csgFusiona([G('csgDesdeFila')(fila)], [fila]);
    ok(fu2.subida === true, 'lo idéntico a la nube no se vuelve a subir');
    const loc3 = Object.assign({}, loc, { actualizado: 9000, titulo: 'Local más nuevo' });
    const [fu3] = csgFusiona([loc3], [fila]);
    ok(fu3.titulo === 'Local más nuevo' && fu3.subida === false, 'con el aparato más nuevo, gana el aparato y queda para subir');
    ok(csgFusiona([loc], []).length === 1 && csgFusiona([], [fila]).length === 1, 'lo que está en un solo lado se queda');
  });

  await seccionA('3.13 La lápida gana al fusionar', async () => {
    reinicia('puesta');
    const csgAFila = G('csgAFila');
    const lid = 'csg-lapida-000001';
    base.filas.set(lid, csgAFila(pieza({ id: lid, titulo: 'Viva y vieja', autor: 'josue', actualizado: 1000 })));
    S('_csgLista', [G('csgDesdeFila')(pieza({ id: lid, titulo: 'Viva y vieja', autor: 'josue', eliminado: true, eliminado_at: new Date().toISOString(), actualizado: 5000, subida: false }))]);
    S('_csgCargada', true);
    await G('csgCargar')();
    ok(G('csgDe')(lid).eliminado === true, 'la lápida más nueva gana a la pieza viva de la nube');
    ok(base.upserts.length === 1 && base.upserts[0].filas[0].eliminado === true && base.upserts[0].filas[0].eliminado_at, 'y se vuelve a subir, con eliminado: true');
    ok(G('csgVivas')().length === 0 && G('csgRetiradas')().length === 1, 'csgVivas no la cuenta; csgRetiradas sí');
  });

  await seccionA('3.14 Las lápidas se quedan seis meses en el aparato', async () => {
    reinicia('puesta');
    const reciente = pieza({ titulo: 'Retirada ayer', eliminado: true, actualizado: Date.now() - 86400000 });
    const antigua = pieza({ titulo: 'Retirada hace un año', eliminado: true, actualizado: Date.now() - 365 * 86400000 });
    almacen.faro_consigna_v1 = JSON.stringify({ piezas: [reciente, antigua] });
    S('_csgLista', []); S('_csgCargada', true);
    G('csgGuardaLocal')();
    const guardadas = JSON.parse(almacen.faro_consigna_v1).piezas.map(p => p.titulo);
    ok(guardadas.includes('Retirada ayer'), 'una lápida que ya no está en memoria se conserva al volver a guardar');
    ok(!guardadas.includes('Retirada hace un año'), 'la de más de seis meses se barre');
    /* Guardar sin haber leído no pisa el aparato. */
    S('_csgLista', []); S('_csgCargada', false);
    almacen.faro_consigna_v1 = JSON.stringify({ piezas: [pieza({ titulo: 'Guardada antes' })] });
    G('csgGuardaLocal')();
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.some(p => p.titulo === 'Guardada antes'), 'guardar antes de leer NO pisa lo que ya había en el aparato');
  });

  await seccionA('3.15 Apuntar un uso y las versiones (§6.8)', async () => {
    reinicia('puesta');
    S('_csgCargada', true);
    const pu = pieza({ titulo: 'Para usar', version: 3, usos: 0, subida: true, actualizado: 1234 });
    G('csgMeteEnLista')(pu);
    const uso = G('csgApuntarUso')(pu, 'gemini');
    /* ⚠️ El reloj NO se toca: un uso no es una edición. Con el reloj
       puesto, copiar sin señal una pieza vieja la hacía ganar la fusión
       entera y resucitaba lo que otro aparato había retirado (3.18). */
    ok(pu.usos === 1 && pu.ultima === uso.t && pu.actualizado === 1234 && pu.subida === false, 'usos++, ultima y subida:false, y actualizado SIN tocar (un uso no es una edición)', JSON.stringify({ usos: pu.usos, actualizado: pu.actualizado }));
    ok(uso.ok === null && uso.v === 3 && uso.maquina === 'gemini' && uso.nota === '' && uso.uid, 'el uso nace {uid, t, maquina, v, ok: null, nota: ""}');
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.find(p => p.id === pu.id).bitacora.length === 1, 'y queda guardado en el aparato en el acto');
    const pv = pieza({ version: 1, bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'uno' }] });
    const antes1 = JSON.parse(JSON.stringify(pv.bloques));
    pv.bloques = [{ id: 'tarea', rotulo: 'Tarea', t: 'dos' }];
    ok(G('csgNuevaVersion')(pv, antes1) === 2 && pv.version === 2, 'corregir crea la v2');
    const vid1 = pv.versiones[0].vid;
    const antes2 = JSON.parse(JSON.stringify(pv.bloques)); pv.bloques = [{ id: 'tarea', rotulo: 'Tarea', t: 'tres' }];
    G('csgNuevaVersion')(pv, antes2);
    const antes3 = JSON.parse(JSON.stringify(pv.bloques)); pv.bloques = [{ id: 'tarea', rotulo: 'Tarea', t: 'cuatro' }];
    G('csgNuevaVersion')(pv, antes3);
    ok(pv.version === 4 && pv.versiones.length === 3, 'van tres versiones guardadas y la pieza en la v4');
    const nv = G('csgVolverAVersion')(pv, vid1);
    ok(nv === 5 && pv.version === 5 && pv.bloques[0].t === 'uno', '«volver a la v1» crea la v5 con los bloques de la v1', nv + ' / ' + pv.bloques[0].t);
    ok(pv.versiones.length === 4 && pv.versiones.some(x => x.v === 4 && x.bloques[0].t === 'cuatro'), 'y la v4 queda guardada: nada reescribe el historial');
    pv.versiones.forEach(x => { if (x.vid === vid1) delete x.bloques; });
    ok(G('csgVolverAVersion')(pv, vid1) === 0 && pv.version === 5, 'a una versión plegada no se vuelve (y se dice con un 0)');
  });

  await seccionA('3.16 Subir con respiro', async () => {
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const pl = pieza({ titulo: 'Tecla a tecla' });
    const a1 = G('csgSubirLuego')(pl);
    pl.titulo = 'Tecla a tecla, corregido'; pl.actualizado = Date.now() + 1;
    const a2 = G('csgSubirLuego')(pl);
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.some(p => p.id === pl.id), 'se guarda en el aparato al instante');
    const [ra1, ra2] = await Promise.all([a1, a2]);
    ok(base.upserts.length === 1 && base.upserts[0].filas[0].titulo === 'Tecla a tecla, corregido', 'dos guardados seguidos son UN viaje, con lo último');
    ok(ra1.ok && ra2.ok && pl.subida === true, 'y los dos esperan el mismo resultado');
  });

  await seccionA('3.17 La fila', async () => {
    const csgAFila = G('csgAFila');
    const fv = csgAFila(pieza({ titulo: '   ', estantes: Array.from({ length: 20 }, (_, i) => '"'.repeat(60) + i), notas: 'n'.repeat(5000), version: 0 }));
    ok(fv.titulo === '(sin título)', 'un título vacío no rebota el check: sale «(sin título)»');
    ok(fv.estantes.length <= 12 && fv.estantes.every(e => cpL(e) <= 40), 'estantes: 12 de 40 como mucho');
    ok(cpL(fv.notas) === 4000 && fv.version === 1, 'notas a 4.000 y version ≥ 1');
    const pe = pieza({ estantes: Array.from({ length: 12 }, () => '"'.repeat(40)).map((s, i) => s.slice(0, 39) + i) });
    G('csgPodar')(pe);
    ok(pgLargo(pe.estantes) <= 1000, 'estantes llenos de comillas caben en el check de 1.000', pgLargo(pe.estantes));
    const pm = pieza({ estantes: ['Maestría', 'maestria', ' MAESTRÍA '] });
    G('csgPodar')(pm);
    ok(pm.estantes.length === 1, '«Maestría», «maestria» y « MAESTRÍA » son un solo estante', JSON.stringify(pm.estantes));
    ok(COLS_SQL.length && Object.keys(fv).every(c => COLS_SQL.includes(c)), 'la fila solo lleva columnas de la tabla');
    const idNuevo = G('csgNuevoId')();
    ok(/^csg-[a-z0-9]+-[a-z0-9]{6}$/.test(idNuevo) && idNuevo.length <= 60, 'el id es csg-<reloj base 36>-<6 al azar>', idNuevo);
  });

  /* Lo que encontró la revisión de los datos del 23 de septiembre de 2026.
     Cada comprobación se probó quitando su arreglo: sin él, suspende. Los
     escenarios son los de la revisión, contados como pasan: dos aparatos,
     una sola nube, y la señal que va y viene. */
  await seccionA('3.18 Lo que cazó la revisión de la nube', async () => {
    const A = G('csgAFila'), D = G('csgDesdeFila');
    const fila = id => base.filas.get(id) || { bitacora: [] };
    const iso = t => new Date(t).toISOString();

    /* ⚠️ UN USO NO ES UNA EDICIÓN. El teléfono tiene la pieza viva desde la
       mañana; la tableta la corrige y la retira; el teléfono, sin señal, la
       copia. Al volver la señal, nada resucita y la corrección sigue. */
    reinicia('puesta');
    const id1 = 'csg-resucita-0001';
    const vieja1 = pieza({ id: id1, titulo: 'Viejo', autor: 'josue', actualizado: 1000 });
    base.filas.set(id1, A(vieja1));
    S('_csgLista', [D(A(vieja1))]); S('_csgCargada', true);
    await G('csgCargar')();
    const pz = G('csgDe')(id1);
    ok(nube() === 'puesta' && !!pz && pz.subida === true && base.upserts.length === 0, 'el teléfono tiene la pieza al día, viva y con el reloj de la mañana');
    base.filas.set(id1, A(pieza({ id: id1, titulo: 'Corregido', autor: 'evelyn', eliminado: true, eliminado_at: iso(5000), actualizado: 5000 })));
    base.modo = 'colgada';
    const uso1 = G('csgApuntarUso')(pz, 'claude');
    const r1 = await G('csgSubirLuego')(pz, { uso: true });
    ok(pz.actualizado === 1000 && pz.subida === false && !r1.ok && r1.motivo === 'sin-senal',
      'sin señal, copiar apunta el uso SIN tocar el reloj de la pieza, y la subida dice «sin señal»', JSON.stringify({ actualizado: pz.actualizado, r1 }));
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.find(p => p.id === id1).bitacora.some(u => u.uid === uso1.uid), '… y el uso queda guardado en el aparato');
    base.modo = 'puesta';
    const n1 = await G('csgSubirPendientes')();   // el evento `online`
    const f1 = fila(id1);
    ok(f1.eliminado === true && f1.titulo === 'Corregido' && f1.actualizado === 5000,
      'al volver la señal, la nube sigue retirada y con la corrección de la tableta: la pieza NO resucita', JSON.stringify({ eliminado: f1.eliminado, titulo: f1.titulo, actualizado: f1.actualizado }));
    ok(n1 === 1 && f1.bitacora.some(u => u.uid === uso1.uid), '… y el uso del teléfono llegó igual, por la unión de la bitácora', n1 + ' ' + JSON.stringify(f1.bitacora));
    ok(G('csgDe')(id1) === pz && pz.eliminado === true && pz.titulo === 'Corregido' && pz.subida === true, '… y el teléfono se entera en la MISMA pieza: retirada y corregida');

    /* Y con señal, pero con la pieza abierta desde antes de la corrección:
       el uso sube con la nube delante, no a ciegas. */
    reinicia('puesta');
    const id2 = 'csg-resucita-0002';
    const vieja2 = pieza({ id: id2, titulo: 'Viejo', autor: 'josue', actualizado: 1000 });
    base.filas.set(id2, A(vieja2));
    S('_csgLista', [D(A(vieja2))]); S('_csgCargada', true);
    await G('csgCargar')();
    const pz2 = G('csgDe')(id2);
    base.filas.set(id2, A(pieza({ id: id2, titulo: 'Corregido', autor: 'evelyn', eliminado: true, eliminado_at: iso(5000), actualizado: 5000, usos: 1,
      bitacora: [{ uid: 'u-tab', t: 4000, maquina: 'gemini', v: 1, ok: 'si', nota: 'bien' }] })));
    const uso2 = G('csgApuntarUso')(pz2, 'claude');
    const r2 = await G('csgSubirLuego')(pz2, { uso: true });
    const f2 = fila(id2);
    ok(r2.ok && f2.eliminado === true && f2.titulo === 'Corregido' && f2.bitacora.some(u => u.uid === 'u-tab') && f2.bitacora.some(u => u.uid === uso2.uid),
      'con señal y la pieza vieja en pantalla, copiar no le pisa a la tableta la corrección ni su uso: se sube lo FUNDIDO', JSON.stringify({ r2, titulo: f2.titulo, eliminado: f2.eliminado, usos: f2.bitacora.map(u => u.uid) }));
    const c2 = G('csgContestarUso')(pz2, uso2.uid, 'si', '  salió   bien ');
    const rc2 = await G('csgSubirLuego')(pz2, { uso: true });
    ok(!!c2 && c2.ok === 'si' && c2.nota === 'salió bien' && rc2.ok && pz2.actualizado === 5000 && (fila(id2).bitacora.find(u => u.uid === uso2.uid) || {}).ok === 'si' && fila(id2).eliminado === true,
      'contestar «¿sirvió?» (csgContestarUso) tampoco toca el reloj, no pisa la lápida, y la respuesta llega', JSON.stringify({ c2, actualizado: pz2.actualizado }));
    const suelta = pieza({ bitacora: [{ uid: 'u-1', t: 1, maquina: 'claude', v: 1, ok: null, nota: '' }] });
    const cq = G('csgContestarUso')(suelta, 'u-1', 'quizá', 'x'.repeat(400));
    ok(!!cq && cq.ok === null && cpL(cq.nota) === 300 && G('csgContestarUso')(suelta, 'no-existe', 'si') === null && G('csgContestarUso')(null, 'u-1', 'si') === null,
      'csgContestarUso: un ok que no es si/regular/no queda en null, la nota va a 300, y un uso que no existe devuelve null', JSON.stringify(cq));
    /* Con una edición en el mismo respiro, la subida es la de siempre: ahí
       la pieza sí es la más nueva, y bajar la lista en cada pausa al
       escribir sería un viaje de más por tecla. */
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const pe = pieza({ titulo: 'Edición y uso' });
    G('csgMeteEnLista')(pe);
    const ae = G('csgSubirLuego')(pe);
    G('csgApuntarUso')(pe, 'claude');
    const re = await ae;
    ok(re.ok && base.selects.length === 0 && base.upserts.length === 1 && fila(pe.id).bitacora.length === 1,
      'una edición y un uso en el mismo respiro son UN viaje de subida, sin bajar la lista, con el uso dentro', JSON.stringify({ re, selects: base.selects.length, upserts: base.upserts.length }));
    /* Y un uso apuntado MIENTRAS la subida de su pieza va de camino no se
       da por subido: el uso no toca el reloj, así que la guarda del reloj
       sola lo dejaba fuera de la fila que llegó y marcado como subido. */
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const pv = pieza({ titulo: 'En vuelo', autor: 'josue' });
    G('csgMeteEnLista')(pv);
    base.demora = 15;
    const vuelo = G('csgSubir')(pv);
    const usoV = G('csgApuntarUso')(pv, 'claude');
    await vuelo;
    base.demora = 0;
    ok(pv.subida === false && !fila(pv.id).bitacora.some(u => u.uid === usoV.uid), 'copiar mientras la pieza viaja: lo que llegó es lo de antes, y la pieza sigue pendiente', JSON.stringify({ subida: pv.subida }));
    const rv = await G('csgSubirLuego')(pv, { uso: true });
    ok(rv.ok && pv.subida === true && fila(pv.id).bitacora.some(u => u.uid === usoV.uid), '… y el uso sube en el viaje siguiente', JSON.stringify(rv));

    /* ⚠️ LA FUSIÓN NO CAMBIA EL OBJETO. La referencia que la pantalla tomó
       antes de que llegara la nube tiene que ver lo fundido. */
    reinicia('puesta');
    const id3 = 'csg-identidad-001';
    const ref = D(A(pieza({ id: id3, titulo: 'Viejo', autor: 'josue', actualizado: 1000 })));
    S('_csgLista', [ref]); S('_csgCargada', true);
    base.filas.set(id3, A(pieza({ id: id3, titulo: 'Corregido en la tableta', autor: 'josue', actualizado: 3000, usos: 1,
      bitacora: [{ uid: 'u-tab', t: 2500, maquina: 'gemini', v: 1, ok: 'si', nota: 'bien' }] })));
    await G('csgCargar')();
    ok(G('csgDe')(id3) === ref && ref.titulo === 'Corregido en la tableta' && ref.bitacora.some(u => u.uid === 'u-tab'),
      'la fusión escribe DENTRO del objeto que ya había: la referencia de antes ve el título y el uso de la tableta', JSON.stringify({ mismo: G('csgDe')(id3) === ref, titulo: ref.titulo }));
    ref.notas = 'nota nueva';
    const r3 = await G('csgSubirLuego')(ref);
    const f3 = fila(id3);
    ok(r3.ok && f3.titulo === 'Corregido en la tableta' && f3.notas === 'nota nueva' && f3.bitacora.some(u => u.uid === 'u-tab'),
      'guardar con esa referencia sube lo fundido más lo nuevo, no la fila de antes de la fusión', JSON.stringify({ titulo: f3.titulo, notas: f3.notas, usos: f3.bitacora.map(u => u.uid) }));
    const u3 = G('csgApuntarUso')(ref, 'claude');
    ok(JSON.parse(almacen.faro_consigna_v1).piezas.find(p => p.id === id3).bitacora.some(u => u.uid === u3.uid), '… y un uso apuntado con ella se guarda en el aparato');
    reinicia('puesta');
    const id4 = 'csg-identidad-002';
    const mem = D(A(pieza({ id: id4, titulo: 'En memoria', autor: 'josue', actualizado: 1000 })));
    almacen.faro_consigna_v1 = JSON.stringify({ piezas: [pieza({ id: id4, titulo: 'Guardada después', autor: 'josue', actualizado: 2000 })] });
    S('_csgLista', [mem]); S('_csgCargada', false);
    G('csgGuardaLocal')();
    ok(G('csgDe')(id4) === mem && mem.titulo === 'Guardada después', 'al juntar con lo guardado en el aparato, lo más nuevo también se copia dentro del objeto en memoria');
    const csgPisa = G('csgPisa');
    const dst = { a: 1, b: 2 };
    ok(csgPisa(dst, { a: 3, c: 4 }) === dst && JSON.stringify(dst) === '{"a":3,"c":4}', 'csgPisa devuelve el mismo objeto, con lo de la fuente y sin lo que la fuente no trae', JSON.stringify(dst));

    /* ⚠️ EL NÚMERO DE VERSIÓN NO RETROCEDE, Y EL TEXTO QUE PIERDE SE GUARDA. */
    const idv = 'csg-version-0001';
    const telefono = () => pieza({ id: idv, titulo: 'Con versiones', autor: 'josue', version: 2, actualizado: 2000, subida: false,
      bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'A2' }],
      versiones: [{ vid: 'v-tel-1', v: 1, t: 1500, bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'A1' }] }],
      usos: 1, bitacora: [{ uid: 'u-tel', t: 1900, maquina: 'claude', v: 2, ok: 'si', nota: '' }] });
    const tableta = () => pieza({ id: idv, titulo: 'Con versiones', autor: 'josue', version: 1, actualizado: 3000, bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'B' }] });
    const vid2 = 'v-' + idv + '-2-2000';
    const [fv] = G('csgFusiona')([D(telefono())], [A(tableta())]);
    const guardada = fv.versiones.find(x => x.vid === vid2);
    ok(fv.version === 3 && fv.bloques[0].t === 'B', 'la versión no retrocede: gana el texto más nuevo (el de la tableta) y pasa a ser la v3', JSON.stringify({ version: fv.version, bloques: fv.bloques }));
    ok(!!guardada && guardada.v === 2 && guardada.bloques[0].t === 'A2' && (fv.bitacora.find(u => u.uid === 'u-tel') || {}).v === 2 && fv.subida === false,
      '… y el texto de la v2, la del 👍, queda guardado como versión con un vid determinista: el 👍 sigue diciendo de qué texto hablaba', JSON.stringify(fv.versiones));
    const [fw] = G('csgFusiona')([D(tableta())], [A(telefono())]);
    ok(fw.version === 3 && fw.bloques[0].t === 'B' && fw.versiones.filter(x => x.vid === vid2).length === 1,
      '… y el otro aparato, fundiendo por su lado, fabrica LA MISMA versión', JSON.stringify(fw.versiones));
    const [fz] = G('csgFusiona')([fv], [A(fw)]);
    const vs = fz.versiones.map(x => x.v);
    ok(fz.versiones.filter(x => x.vid === vid2).length === 1 && new Set(vs).size === vs.length && fz.version === 3,
      '… así que al juntarlas no se duplica, y no hay dos versiones con el mismo número', JSON.stringify(vs));
    G('csgNuevaVersion')(fz, JSON.parse(JSON.stringify(fz.bloques)));
    const vs2 = fz.versiones.map(x => x.v);
    ok(fz.version === 4 && new Set(vs2).size === vs2.length, 'corregir después crea la v4, sin otra «v2» que herede el 👍 de la de antes', JSON.stringify(vs2));
    const [fu] = G('csgFusiona')([D(pieza({ id: idv, version: 1, actualizado: 2000, bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'A' }], usos: 1, bitacora: [{ uid: 'u-a', t: 1900, maquina: 'claude', v: 1, ok: 'si', nota: '' }] }))],
      [A(pieza({ id: idv, autor: 'josue', version: 1, actualizado: 3000, bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'B' }] }))]);
    const [fn] = G('csgFusiona')([D(pieza({ id: idv, version: 1, actualizado: 2000, bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'A' }] }))],
      [A(pieza({ id: idv, autor: 'josue', version: 1, actualizado: 3000, bloques: [{ id: 'tarea', rotulo: 'Tarea', t: 'B' }] }))]);
    ok(fu.version === 2 && fu.versiones.some(x => x.v === 1 && x.bloques && x.bloques[0].t === 'A') && fn.version === 1 && !fn.versiones.length,
      'con la misma versión, el texto que pierde se guarda solo si allí se usó (tiene un 👍 que respaldar); sin uso es una edición que perdió', JSON.stringify([fu.version, fu.versiones, fn.version, fn.versiones]));

    /* ⚠️ ARRANCAR SIN SEÑAL NO DEJA EL REINTENTO VACÍO. */
    reinicia('colgada');
    const p4 = pieza({ titulo: 'Pendiente al arrancar', subida: false });
    S('_csgLista', [p4]); S('_csgCargada', true);
    await G('csgCargar')();
    ok(nube() === 'sin-senal' && G('_csgHayTabla') === false, 'arranca sin señal: la tabla no se ha visto nunca');
    base.modo = 'puesta';
    const n4 = await G('csgSubirPendientes')();
    ok(n4 === 1 && base.filas.has(p4.id) && p4.subida === true && nube() === 'puesta', 'al volver la señal, el reintento del evento `online` baja, funde y la sube', JSON.stringify({ n4, nube: nube() }));
    base.selects = []; base.upserts = [];
    ok(await G('csgSubirPendientes')() === 0 && !base.selects.length && !base.upserts.length, '… y sin nada pendiente no gasta ni un viaje');

    /* ⚠️ LA SESIÓN CADUCADA SE NOMBRA, aunque la pieza ya esté firmada. */
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    base.error = { code: 'PGRST301', message: 'JWT expired' };
    const p5 = pieza({ titulo: 'Firmada', autor: 'josue' });
    const r5 = await G('csgPersistir')(p5);
    const fr5 = G('csgRotuloNube')();
    ok(!r5.ok && r5.motivo === 'sin-sesion' && p5.autor === 'josue', 'una pieza firmada que rebota por «JWT expired» queda pendiente con motivo «sin-sesion»', JSON.stringify(r5));
    ok(fr5.ic === '🔑' && fr5.ok === false && /vuelve a entrar en F\.A\.R\.O/.test(fr5.t), '… y la franja no dice «☁️ viajan»: dice que hay que volver a entrar', JSON.stringify(fr5));
    G('csgMeteEnLista')(pieza({ titulo: 'Sin firmar', subida: false, motivo: 'sin-sesion' }));
    ok(/se firmará al entrar/.test(G('csgRotuloNube')().t), '… y con una sin firmar entre ellas, «se firmará al entrar»', G('csgRotuloNube')().t);

    /* ⚠️ UNA SUBIDA QUE LLEGA QUITA EL «SIN SEÑAL». */
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'sin-senal'); S('_csgCargada', true);
    const r6 = await G('csgPersistir')(pieza({ titulo: 'Llega' }));
    ok(r6.ok && nube() === 'puesta' && G('csgRotuloNube')().ok === true, 'después de una bajada sin señal, una subida que llega deja la franja en «☁️ viajan»', JSON.stringify({ r6, nube: nube(), franja: G('csgRotuloNube')() }));

    /* ⚠️ «(SIN TÍTULO)» ES LO QUE PIDE EL CHECK, NO UN TÍTULO. */
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const p7 = pieza({ titulo: '   ' });
    await G('csgPersistir')(p7);
    ok(fila(p7.id).titulo === G('CSG_SIN_TITULO') && G('CSG_SIN_TITULO') === '(sin título)', 'en la nube va «(sin título)», que es lo que deja pasar el check');
    reabre();
    for (const k of Object.keys(almacen)) delete almacen[k];
    await G('csgCargar')();
    const v7 = G('csgDe')(p7.id);
    ok(!!v7 && v7.titulo === '', 'y en otro aparato vuelve como un hueco, no como un título escrito', JSON.stringify(v7 && v7.titulo));
    ok(!G('csgRevisar')(Object.assign({}, v7, { id: 'csg-otra-sin-titulo' }), 'claude').avisa.some(x => /Ya hay otra consigna/.test(x.msg)), '… así que dos borradores sin título no se avisan como «mismo título»');

    /* ⚠️ GUARDAR ES EDITAR: el reloj se pone aunque quien llama no lo haga. */
    for (const [nombre, guarda] of [['csgPersistir', p => G('csgPersistir')(p)], ['csgSubirLuego', p => G('csgSubirLuego')(p)]]) {
      reinicia('puesta');
      const id8 = 'csg-reloj-' + nombre.toLowerCase().slice(3);
      base.filas.set(id8, A(pieza({ id: id8, titulo: 'Viejo', autor: 'josue', actualizado: 5000 })));
      S('_csgLista', [D(base.filas.get(id8))]); S('_csgCargada', true);
      await G('csgCargar')();
      const p8 = G('csgDe')(id8);
      p8.titulo = 'Nuevo';
      base.modo = 'colgada';
      const r8 = await guarda(p8);
      ok(!r8.ok && p8.actualizado > 5000, nombre + ' pone el reloj aunque la pantalla no lo haya tocado', p8.actualizado);
      reabre();
      base.modo = 'puesta';
      await G('csgCargar')();
      ok(G('csgDe')(id8).titulo === 'Nuevo' && fila(id8).titulo === 'Nuevo', '… y la corrección hecha sin señal gana a la nube al volver a abrir: no se pierde en el empate', JSON.stringify({ aqui: G('csgDe')(id8).titulo, nube: fila(id8).titulo }));
    }

    /* ⚠️ UNA LÁPIDA QUE NO SUBIÓ NO SE BARRE. */
    reinicia('puesta');
    const hace200 = Date.now() - 200 * 86400000;
    almacen.faro_consigna_v1 = JSON.stringify({ piezas: [
      pieza({ titulo: 'Retirada sin subir', eliminado: true, eliminado_at: iso(hace200), actualizado: hace200, subida: false, motivo: 'sin-tabla' }),
      pieza({ titulo: 'Retirada y subida', eliminado: true, eliminado_at: iso(hace200), actualizado: hace200, subida: true }),
    ] });
    S('_csgLista', []); S('_csgCargada', true);
    G('csgGuardaLocal')();
    const quedan9 = JSON.parse(almacen.faro_consigna_v1).piezas.map(p => p.titulo);
    ok(quedan9.includes('Retirada sin subir') && !quedan9.includes('Retirada y subida'), 'pasados seis meses se barre la lápida que ya subió, y NO la que nunca llegó a la nube', JSON.stringify(quedan9));

    /* ⚠️ EL APARATO SIN SITIO SE DICE. */
    reinicia('colgada');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const setItemBueno = localStorage.setItem;
    const lleno = () => { const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; throw e; };
    const p10 = pieza({ titulo: 'Sin sitio' });
    let r10, r10b;
    localStorage.setItem = lleno;
    try { r10 = await G('csgPersistir')(p10); r10b = await G('csgSubirLuego')(p10); } finally { localStorage.setItem = setItemBueno; }
    const fr10 = G('csgRotuloNube')();
    ok(r10.local === false && r10b.local === false && G('_csgSinEspacio') === true, 'con el almacén lleno, csgPersistir y csgSubirLuego devuelven local: false', JSON.stringify({ r10, r10b }));
    ok(fr10.ic === '💾' && fr10.ok === false && /No cabe en este aparato/.test(fr10.t), '… y la franja lo dice antes que nada (sin señal también, que es cuando se perdería)', JSON.stringify(fr10));
    base.modo = 'puesta';
    const r10c = await G('csgPersistir')(p10);
    ok(r10c.local === true && G('_csgSinEspacio') === false && G('csgRotuloNube')().ic !== '💾', 'con sitio otra vez, se guarda y la franja deja de decirlo', JSON.stringify(r10c));
    const EC = G('csgEsCuota');
    ok(EC({ name: 'NS_ERROR_DOM_QUOTA_REACHED' }) && EC({ code: 22 }) && EC({ code: 1014 }) && EC(new Error('quota exceeded')) && !EC(new Error('otra cosa')) && !EC(null),
      'csgEsCuota reconoce la cuota como la dice cada navegador, y nada más');

    /* ⚠️ EL eliminado_at VA COMO FECHA, Y UN LOTE RECHAZADO NOMBRA A SU CULPABLE. */
    const t11 = 1758585600000;
    ok(A(pieza({ eliminado: true, eliminado_at: t11 })).eliminado_at === iso(t11), 'un eliminado_at en milisegundos sale como fecha ISO (la columna es timestamptz)');
    const basura = A(pieza({ eliminado: true, eliminado_at: 'ayer' })).eliminado_at;
    ok(A(pieza({ eliminado: true, eliminado_at: '2026-09-22T10:00:00.000Z' })).eliminado_at === '2026-09-22T10:00:00.000Z' && typeof basura === 'string' && !isNaN(Date.parse(basura)) &&
      A(pieza({ eliminado: false, eliminado_at: t11 })).eliminado_at === null, '… una fecha buena se queda, una que no lo es se cambia por ahora, y sin lápida va null', basura);
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const lap11 = pieza({ titulo: 'Retirada con reloj', autor: 'josue', eliminado: true, eliminado_at: Date.now() });
    const r11 = await G('csgPersistir')(lap11);
    ok(r11.ok && typeof fila(lap11.id).eliminado_at === 'string', '… y la base de mentira, que exige un timestamptz como la de verdad, la acepta', JSON.stringify(r11));
    const ino = pieza({ titulo: 'Inocente', autor: 'josue' });
    const cul = pieza({ id: 'xy', titulo: 'Culpable', autor: 'josue' });
    G('csgMeteEnLista')(ino); G('csgMeteEnLista')(cul);
    const rl = await G('csgSubirVarios')([ino, cul]);
    ok(base.filas.has(ino.id) && ino.subida === true && cul.subida === false && cul.motivo === 'rechazada' && rl.subidas === 1 && !rl.ok,
      'un lote que la base rechaza se reintenta de una en una: sube la inocente y solo la culpable se queda', JSON.stringify(rl));
    ok(/la base rechazó «Culpable»/.test(G('csgRotuloNube')().t), '… y la franja nombra a la culpable, no a la primera de la lista', G('csgRotuloNube')().t);
  });

  /* ⚠️ VARIAS EDICIONES DE GOLPE, EN UN SOLO VIAJE (csgPersistirVarios).
     Es la puerta de «☑ Elegir» del anaquel: mover veinte consignas a un
     estante, cambiarles la máquina o retirarlas. Con una escritura por
     pieza, con la señal de una tableta, mover veinte tarda; y veinte
     upserts en vuelo llegan en cualquier orden. Se comprobó rompiendo el
     ayudante (una subida por pieza, el reloj sin poner, una escritura del
     aparato por pieza): la sección suspende con cada una. */
  await seccionA('3.19 csgPersistirVarios: varias ediciones, UN upsert, el reloj puesto y el aparato una vez', async () => {
    reinicia('puesta');
    S('_csgHayTabla', true); S('_csgNube', 'puesta'); S('_csgCargada', true);
    const viejas = [1, 2, 3, 4, 5].map(i => pieza({ titulo: 'Varias ' + i, autor: 'josue', actualizado: 1000 + i, subida: true }));
    viejas.forEach(p => G('csgMeteEnLista')(p));
    viejas.forEach(p => base.filas.set(p.id, G('csgAFila')(p)));
    const [a, b, c, dd, e] = viejas;
    a.estantes = ['Maestría', 'Lote']; b.estantes = ['Lote']; c.maquina = 'gemini';
    const antes = Date.now();
    escriturasPiezas = 0;
    const r = await G('csgPersistirVarios')([a, b, c, a, null, { titulo: 'sin id' }]);
    ok(r && r.ok === true && r.subidas === 3 && r.local === true, 'devuelve {ok, subidas: 3, local}: la repetida y las que no son piezas no cuentan', JSON.stringify(r));
    ok(base.upserts.length === 1 && base.upserts[0].filas.length === 3 && base.upserts[0].opciones.onConflict === 'id', 'las tres suben en UN solo upsert por id (' + base.upserts.length + ' upserts)', JSON.stringify(base.upserts.map(u => u.filas.length)));
    ok([a, b, c].every(p => p.actualizado >= antes && p.subida === true) && base.upserts[0].filas.every(f => f.actualizado >= antes && f.autor === 'josue'),
      'cada una lleva el reloj de AHORA (es una edición) y viaja firmada; y queda subida', JSON.stringify([a, b, c].map(p => [p.actualizado, p.subida])));
    ok(dd.actualizado === 1004 && e.actualizado === 1005 && !base.upserts[0].filas.some(f => f.id === dd.id || f.id === e.id), 'las que no se pasaron no se tocan: ni reloj ni viaje');
    ok(escriturasPiezas === 2, 'el aparato se escribe DOS veces —antes del viaje y al volver—, no una por pieza (' + escriturasPiezas + ')');
    ok(base.filas.get(a.id).estantes.join('|') === 'Maestría|Lote' && base.filas.get(c.id).maquina === 'gemini', 'y la nube tiene lo nuevo');
    escriturasPiezas = 0; base.upserts = [];
    const r0 = await G('csgPersistirVarios')([]);
    ok(r0.ok === true && r0.subidas === 0 && base.upserts.length === 0 && escriturasPiezas === 0, 'una lista vacía no viaja ni escribe nada', JSON.stringify(r0));
    /* Sin señal: nada se pierde, todo queda aquí y pendiente. */
    base.modo = 'colgada'; base.upserts = [];
    dd.estantes = ['Sin señal']; e.estantes = ['Sin señal'];
    const rs = await G('csgPersistirVarios')([dd, e]);
    ok(rs.ok === false && rs.motivo === 'sin-senal' && rs.subidas === 0 && dd.subida === false && e.subida === false, 'sin señal dice «sin-senal» y las deja pendientes', JSON.stringify(rs));
    const guardadas = JSON.parse(almacen.faro_consigna_v1).piezas.filter(p => p.id === dd.id || p.id === e.id);
    ok(guardadas.length === 2 && guardadas.every(p => (p.estantes || []).join() === 'Sin señal'), '… y el aparato ya las tiene con el cambio: al volver la señal suben solas');
    base.modo = 'puesta'; base.upserts = [];
    const n1 = await G('csgSubirPendientes')();
    ok(n1 === 2 && base.upserts.length === 1 && base.filas.get(dd.id).estantes.join() === 'Sin señal', 'al volver la señal, las dos suben en UN viaje', n1 + ' · ' + base.upserts.length);
    /* Retirar varias: la lápida con su fecha, que la base acepta. */
    base.upserts = [];
    const cuando = new Date().toISOString();
    [a, b].forEach(p => { p.eliminado = true; p.eliminado_at = cuando; });
    const rr = await G('csgPersistirVarios')([a, b]);
    ok(rr.ok && base.upserts.length === 1 && [a.id, b.id].every(id => base.filas.get(id).eliminado === true && base.filas.get(id).eliminado_at === cuando), 'retirar dos es UN viaje con las dos lápidas', JSON.stringify(rr));
    /* Un respiro pendiente de una de ellas se suelta: no viaja dos veces. */
    base.upserts = [];
    const pr = G('csgSubirLuego')(c);
    c.maquina = 'claude';
    await G('csgPersistirVarios')([c]);
    const rl = await pr;
    await espera(80);
    ok(base.upserts.length === 1 && rl.ok === true && !G('_csgLuego')[c.id], 'si una esperaba su respiro, sube con el lote y el respiro se suelta: UN viaje, no dos', base.upserts.length + ' · ' + JSON.stringify(rl));
    /* Sin sesión ni firma: espera, sin perder nada. */
    base.upserts = [];
    sesion = null;
    const sf = pieza({ titulo: 'Sin firma varias', autor: '' });
    const rf = await G('csgPersistirVarios')([sf]);
    ok(rf.ok === false && rf.motivo === 'sin-sesion' && base.upserts.length === 0 && G('csgDe')(sf.id) === sf, 'sin firma no viaja: se queda en la lista esperando la sesión', JSON.stringify(rf));
    sesion = { user: 'josue', nombre: 'Josué' };
  });
}

/* ══════════════════════════════════════════════════════════════════
   4 y 5. EL LECTOR Y EL REPASO, en el mismo salón de espías.
   ══════════════════════════════════════════════════════════════════ */
let SL = null;

/* Un contador escrito aquí aparte, con la misma regla que csgPalabras: si
   csgPalabras se estropeara, la cuenta no aprobaría por usar la misma
   función rota en los dos lados. */
const ETQ = /<\/?[A-Za-z_][\w.:-]*(?:\s[^<>]*)?\/?>/g;
const cuentaP = t => String(t || '').replace(ETQ, ' ').split(/\s+/).filter(x => /[\p{L}\p{N}]/u.test(x)).length;
const bolsa = t => (String(t || '').replace(ETQ, ' ').match(/[\p{L}\p{N}]+/gu) || []).map(w => sinTildesP(w).toLowerCase());
const resta = (a, b) => { const m = new Map(); a.forEach(w => m.set(w, (m.get(w) || 0) + 1)); b.forEach(w => m.set(w, (m.get(w) || 0) - 1)); return m; };
/* La cuenta de «nada se descarta» (§5, paso 9): las palabras de lo pegado
   tienen que ser las de lo que sale (título + bloques + material), más las
   que se leyeron como forma (estructura), menos las que el lector puso
   (anadido). Devuelve '' si cuadra o el porqué. */
function descuadre(texto, r) {
  const csgPalabras = SL.L('csgPalabras');
  const salida = [r.titulo].concat(r.bloques.map(b => b.t), [r.material]);
  const entrada = csgPalabras(texto);
  const sale = salida.reduce((s, t) => s + csgPalabras(t), 0) + (r.estructura || []).reduce((s, t) => s + csgPalabras(t), 0) - (r.anadido || []).reduce((s, t) => s + csgPalabras(t), 0);
  const dif = resta(bolsa(texto).concat([].concat(...(r.anadido || []).map(bolsa))), [].concat(...salida.map(bolsa), ...(r.estructura || []).map(bolsa)));
  const sobran = [...dif.entries()].filter(([, n]) => n !== 0).map(([w, n]) => w + (n > 0 ? ' −' + n : ' +' + (-n)));
  return entrada === sale && !sobran.length ? '' : 'palabras ' + entrada + ' → ' + sale + (sobran.length ? ' (' + sobran.slice(0, 8).join(', ') + ')' : '');
}
function cuadra(nombre, texto, r) {
  const csgPalabras = SL.L('csgPalabras');
  const salida = [r.titulo].concat(r.bloques.map(b => b.t), [r.material]);
  const entrada = cuentaP(texto);
  const sale = salida.reduce((s, t) => s + cuentaP(t), 0) + (r.estructura || []).reduce((s, t) => s + cuentaP(t), 0) - (r.anadido || []).reduce((s, t) => s + cuentaP(t), 0);
  const entradaCsg = csgPalabras(texto);
  const saleCsg = salida.reduce((s, t) => s + csgPalabras(t), 0) + (r.estructura || []).reduce((s, t) => s + csgPalabras(t), 0) - (r.anadido || []).reduce((s, t) => s + csgPalabras(t), 0);
  const bIn = bolsa(texto);
  const bOut = [].concat(...salida.map(bolsa), ...(r.estructura || []).map(bolsa));
  const dif = resta(bIn.concat([].concat(...(r.anadido || []).map(bolsa))), bOut);
  const sobran = [...dif.entries()].filter(([, n]) => n !== 0).map(([w, n]) => w + (n > 0 ? ' (se perdió ×' + n + ')' : ' (apareció ×' + (-n) + ')'));
  ok(entrada === sale && entradaCsg === saleCsg && entradaCsg === entrada && !sobran.length,
    nombre + ': nada se descarta (' + entrada + ' palabras de entrada = ' + sale + ' de salida)',
    'contador de la prueba ' + entrada + ' → ' + sale + '; csgPalabras ' + entradaCsg + ' → ' + saleCsg + '; bolsa: ' + sobran.slice(0, 12).join(', '));
}
const bl = (r, id) => r.bloques.find(b => b.id === id);
const ids = r => r.bloques.map(b => b.id).join(',');
const muestra = r => JSON.stringify({ clase: r.clase, molde: r.molde, titulo: r.titulo, bloques: r.bloques, material: r.material, avisos: r.avisos }, null, 1).slice(0, 1500);

function parte4() {
  parte(4, 'Pegar y repartir: la asimetría, y nada se descarta');
  SL = salonEspia();
  const L = SL.L;
  const csgLeer = L('csgLeer');
  const csgRevisar = L('csgRevisar');
  const csgPalabras = L('csgPalabras');
  ok(SL.toques.length === 0, 'cargar el archivo en el salón de espías no toca document, window, localStorage ni navigator', SL.toques.slice(0, 5).join(', '));

  seccion('4.1 csgClaveEtiqueta, csgEsArista, csgPalabras', () => {
    const CE = L('csgClaveEtiqueta');
    ok(CE('Formato de Salida') === 'formato de salida' && CE('  CÓMO   SE comprueba ') === 'como se comprueba' && CE('**Tarea:**') === 'tarea',
      'la clave: sin tildes, minúsculas, espacios de uno, sin adornos de negrita ni dos puntos');
    ok(['Paso 1', 'Ejemplo (2)', 'Rol [x]', '{{tarea}}', '## Tarea', 'a → b'].every(s => CE(s) === ''),
      'la clave es vacía en cuanto ve un dígito, [] {} () # o → («Paso 1» no es el bloque «paso»)');
    const EA = L('csgEsArista');
    ok(EA('Investigador → Guionista') && EA('- Verificador → Guionista si hay citas malas (máximo 2 vueltas); si no → Editor.') && EA('Editor -> FIN'),
      'csgEsArista: «A → B», con viñeta, con condición, con «->» y hacia FIN');
    ok(!EA('{{entrada}} → {{salida}}') && !EA('Harari 2014 página 45 → (Harari, 2014, p. 45)') && !EA('El PIB creció 3 %. → El PIB creció 3 % (BCH, 2025, p. 4).') && !EA('Nodo: recibe → entrega') && !EA('Un origen de cuatro palabras → B'),
      'y NO: un par con {{huecos}}, una salida entre paréntesis, una frase con punto, algo con dos puntos, un origen de 4 palabras');
    ok(csgPalabras('<tarea>\nResume esto.\n</tarea>') === 2 && csgPalabras('- a → b\n## Tono\n===') === 3 && csgPalabras('') === 0,
      'csgPalabras: las etiquetas, las flechas, las viñetas y las marcas no son palabras');
  });

  seccion('4.2 CO-STAR en XML → seis bloques', () => {
    const T = '<contexto>\nEs la columna de apertura del número de octubre; el tema es la memoria.\n</contexto>\n\n' +
      '<objetivo>\nQue un lector que no conoce el tema entienda por qué importa.\n</objetivo>\n' +
      '<estilo>Periodístico: frases cortas, el dato primero.</estilo>\n<tono>\nCercano, con algo de humor.\n</tono>\n' +
      '<audiencia>\nUn estudiante de sexto grado que lee bien.\n</audiencia>\n<respuesta>\n600 palabras en cuatro párrafos, sin subtítulos.\n</respuesta>\n';
    const r = csgLeer(T);
    ok(r.clase === 'prompt' && r.molde === 'costar', 'Prompt · CO-STAR (' + r.clase + ' · ' + r.molde + ')', muestra(r));
    ok(ids(r) === 'contexto,objetivo,estilo,tono,audiencia,formato', 'seis bloques en el orden de la sigla, <respuesta> en `formato`', ids(r));
    ok(bl(r, 'formato').rotulo === 'Respuesta' && bl(r, 'estilo').t === 'Periodístico: frases cortas, el dato primero.' && bl(r, 'contexto').t === 'Es la columna de apertura del número de octubre; el tema es la memoria.',
      'cada bloque con su texto limpio y su rótulo del molde («Respuesta»)');
    ok(r.propuesta.reconocidos === 6 && r.propuesta.total === 6 && !r.avisos.length, 'propuesta «6 de 6 bloques», sin avisos', JSON.stringify(r.propuesta) + ' ' + JSON.stringify(r.avisos));
    cuadra('CO-STAR XML', T, r);
    const I = '<instructions>\nResume el informe en diez puntos.\n</instructions>\n<formato>Lista numerada.</formato>\n';
    const ri = csgLeer(I);
    ok(ri.molde === 'rapido' && ids(ri) === 'tarea,formato' && bl(ri, 'tarea').t === 'Resume el informe en diez puntos.',
      '<instructions>, la etiqueta más común de un prompt de Claude, es la Tarea (y el prompt, un Rápido)', muestra(ri));
    cuadra('<instructions>', I, ri);
  });

  seccion('4.3 Encabezados en inglés y en español', () => {
    const T = '## Role\nYou are an editor who checks every source.\n\n## Context\nThis goes in the family magazine.\n\n## Task\nRewrite the first three paragraphs.\n\n## Output format\nThe paragraphs, then a list of changes.\n\n## Tone\nDirect.\n';
    const r = csgLeer(T);
    ok(r.molde === 'encargo' && ids(r) === 'rol,contexto,tarea,formato,tono', 'en inglés: Role, Context, Task, Output format, Tone → Encargo completo', ids(r) + ' ' + r.molde);
    cuadra('encabezados en inglés', T, r);
    const E = 'Contexto: Es para la revista de la casa.\nTarea: Resume el informe en diez puntos.\n\nFormato de salida: Lista numerada.\nCÓMO SE COMPRUEBA\n- Cuenta los puntos: deben ser diez.\n**Tono:** Directo y sin adornos.\n**Reglas**\n- No inventes datos.\n';
    const e = csgLeer(E);
    ok(e.molde === 'encargo' && ids(e) === 'contexto,tarea,reglas,formato,comprobacion,tono', 'en español, con dos puntos, en MAYÚSCULAS, en negrita con dos puntos y en negrita sola → Encargo', ids(e) + ' ' + e.molde + '\n' + muestra(e));
    ok(bl(e, 'tarea').t === 'Resume el informe en diez puntos.' && bl(e, 'tono').t === 'Directo y sin adornos.' && bl(e, 'comprobacion').t === '- Cuenta los puntos: deben ser diez.',
      'lo que va detrás de los dos puntos es el primer renglón de su bloque');
    ok(!e.avisos.length, 'sin avisos', JSON.stringify(e.avisos));
    cuadra('rótulos en español', E, e);
  });

  seccion('4.4 Frontmatter → Habilidad · SKILL.md', () => {
    const T = ejemplo('**SKILL.md de ejemplo**');
    ok(!!T, 'el SKILL.md de ejemplo sale del plan');
    const r = csgLeer(T || '');
    ok(r.clase === 'habilidad' && r.molde === 'skill', 'Habilidad · SKILL.md', r.clase + ' · ' + r.molde);
    ok(ids(r) === 'nombre,disparador,pasos,recursos,comprobacion,ejemplos', 'name, description y las cuatro secciones en su sitio', ids(r));
    ok(bl(r, 'nombre').t === 'corrector-revista-casa' && r.titulo === 'corrector-revista-casa', 'name → Nombre, «# …» → título');
    ok(bl(r, 'disparador').t.indexOf('Corrige ortografía y estilo de notas') === 0 && !/\n/.test(bl(r, 'disparador').t) && bl(r, 'disparador').t.split('No la uses para traducir.').length === 2,
      'description → Disparador, desescapada y UNA vez: «Cuándo usarla» repetía lo mismo y no se duplica', JSON.stringify(bl(r, 'disparador').t));
    ok(bl(r, 'pasos').t.split('\n').length === 4 && bl(r, 'ejemplos').t.indexOf('- Pedido: «Arréglame esta nota»') === 0, 'los pasos, los cuatro, y los ejemplos con su flecha dentro');
    ok(!r.avisos.length, 'sin avisos', JSON.stringify(r.avisos));
    cuadra('SKILL.md del plan', T || '', r);
    const F = '---\nname: resumir-actas\ndescription: >\n  Resume actas de reunión en cinco puntos.\n  Úsala cuando peguen un acta.\nlicense: MIT\n---\n\n## Pasos\nLee el acta.\n2. Escribe los cinco puntos.\n\n## When to use\nTambién cuando digan «acta» sin pegarla.\n';
    const f = csgLeer(F);
    ok(f.molde === 'skill' && bl(f, 'disparador').t === 'Resume actas de reunión en cinco puntos. Úsala cuando peguen un acta.\n\nTambién cuando digan «acta» sin pegarla.',
      'description en varios renglones (`>`) juntada, y «When to use» pegado detrás de una línea en blanco', JSON.stringify(bl(f, 'disparador') && bl(f, 'disparador').t));
    const fm = f.bloques.find(b => b.rotulo === 'Frontmatter');
    ok(!!fm && fm.t === 'license: MIT' && f.avisos.some(a => a.renglon === 6 && /license/.test(a.texto)), 'lo demás del frontmatter no se tira: bloque libre «Frontmatter» y nombrado con su renglón', JSON.stringify(f.avisos));
    cuadra('SKILL.md con license y `>`', F, f);
  });

  seccion('4.5 Tres pares «a → b» en Con ejemplos: nunca un Grafo', () => {
    const T = '## Tarea\nTraduce cada palabra al inglés.\n\n## Ejemplos\ngato → cat\nperro → dog\ncasa → house\n\n## Ahora tú\nmesa\n';
    const r = csgLeer(T);
    ok(r.clase === 'prompt' && r.molde === 'ejemplos', 'Prompt · Con ejemplos', r.clase + ' · ' + r.molde);
    ok(!bl(r, 'aristas') && !bl(r, 'nodos') && bl(r, 'ejemplos').t === 'gato → cat\nperro → dog\ncasa → house', 'los tres pares en `ejemplos`, y ni aristas ni nodos', ids(r));
    cuadra('Con ejemplos, encabezados', T, r);
    const C = 'Tarea: Convierte cada cita suelta a la forma (Autor, año, p.).\nEjemplos:\nHarari → Yuval\nYuval → Noah\nNoah → Harari\nAhora tú: Informe del BID de 2023\n';
    const c = csgLeer(C);
    ok(c.molde === 'ejemplos' && !bl(c, 'aristas') && bl(c, 'ejemplos').t.split('\n').length === 3,
      'aunque los pares formen un ciclo de nombres (Harari → Yuval → Noah → Harari), dentro de «Ejemplos» son pares', ids(c));
    cuadra('Con ejemplos, dos puntos', C, c);
    const X = '<tarea>Convierte cada cita.</tarea>\n<ejemplos>\n<ejemplo>\n<entrada>Harari 2014 página 45</entrada>\n<salida>(Harari, 2014, p. 45)</salida>\n</ejemplo>\n<ejemplo><entrada>BID 2023, p. 12</entrada><salida>(BID, 2023, p. 12)</salida></ejemplo>\n</ejemplos>\n<caso>Ahora haz lo mismo con cada renglón de lo que va abajo.</caso>';
    const x = csgLeer(X);
    ok(x.molde === 'ejemplos' && bl(x, 'ejemplos').t === 'Harari 2014 página 45 → (Harari, 2014, p. 45)\nBID 2023, p. 12 → (BID, 2023, p. 12)',
      '<ejemplo><entrada/><salida/></ejemplo> → pares «a → b»', JSON.stringify(bl(x, 'ejemplos')));
    cuadra('Con ejemplos, XML', X, x);
    const FS = 'Tarea: Traduce cada palabra al inglés.\nEjemplos:\nEntrada: gato\nSalida: cat\nInput: perro\nOutput: dog\n**Pregunta:** ¿casa?\n**Respuesta:** house\nAhora tú: mesa\n';
    const fs2 = csgLeer(FS);
    ok(fs2.molde === 'ejemplos' && ids(fs2) === 'tarea,ejemplos,caso' && bl(fs2, 'ejemplos').t === 'gato → cat\nperro → dog\n¿casa? → house' && bl(fs2, 'caso').t === 'mesa',
      'pares escritos con rótulos (Entrada/Salida, Input/Output, Pregunta/Respuesta): «Salida», «Output» y «Respuesta» NO abren bloques dentro de Ejemplos; se juntan en «a → b»', muestra(fs2));
    cuadra('pares con rótulos', FS, fs2);
    const Y = '## Tarea\nConvierte cada nombre siguiendo la cadena:\nHarari → Yuval\nYuval → Noah\n\n## Ejemplos\ngato → cat\nperro → dog\n\n## Ahora tú\nmesa\n';
    const y = csgLeer(Y);
    ok(y.clase === 'prompt' && y.molde === 'ejemplos' && !bl(y, 'aristas') && bl(y, 'tarea').t.indexOf('Harari → Yuval\nYuval → Noah') > 0,
      'con un bloque de Ejemplos, ni las flechas encadenadas de la TAREA son aristas: se quedan en su bloque', ids(y) + ' ' + y.clase);
    cuadra('flechas en la Tarea de un Con ejemplos', Y, y);
    const Pp = 'Traduce así:\ngato → cat\nperro → dog\ncasa → house\n';
    const p = csgLeer(Pp);
    ok(p.clase === 'prompt' && !bl(p, 'aristas'), 'pares sueltos SIN rótulo de ejemplos, sin ningún nombre compartido: tampoco es un grafo (se quedan como prosa)', ids(p) + ' ' + p.clase);
    cuadra('pares sueltos', Pp, p);
  });

  /* La Cadena del plan, ya leída: la sección 4.12 la vuelve a armar. */
  let c7 = { clase: 'grafo', molde: 'cadena', bloques: [] };

  seccion('4.6 «Investigador → Guionista» y otra arista, sin ejemplos → Grafo · Cadena', () => {
    const T = 'Investigador → Guionista\nGuionista → Editor.\n';
    const r = csgLeer(T);
    ok(r.clase === 'grafo' && r.molde === 'cadena', 'Grafo · Cadena', r.clase + ' · ' + r.molde + '\n' + muestra(r));
    ok(bl(r, 'aristas') && bl(r, 'aristas').t === 'Investigador → Guionista\nGuionista → Editor.', 'las dos flechas en `aristas`');
    ok(bl(r, 'nodos') && bl(r, 'nodos').t === 'Investigador\nGuionista\nEditor' && r.anadido.join() === 'Investigador,Guionista,Editor', 'sus nombres a `nodos`, «Nombre» solo, y dichos en `anadido`', JSON.stringify(bl(r, 'nodos')));
    cuadra('dos aristas', T, r);
    const C = ejemplo('Ejemplo completo, Cadena en `md`:');
    ok(!!C, 'la Cadena en md sale del plan');
    const c = csgLeer(C || '');
    c7 = c;
    ok(c.clase === 'grafo' && c.molde === 'cadena' && ids(c).indexOf('meta,nodos,aristas,estado,fin') === 0, 'la Cadena armada en md vuelve a entrar entera', ids(c));
    ok(!c.anadido.length, 'sin añadir nodos: ya estaban todos (con su viñeta y su «: recibe…»)', c.anadido.join());
    ok(c.avisos.some(a => /Cómo hacerlo en este chat/.test(a.texto)), 'y el «Cómo hacerlo en este chat» que escribe el armado se dice, no se tira', JSON.stringify(c.avisos));
    cuadra('Cadena md del plan', C || '', c);
    const pc = { id: 'x', clase: c.clase, molde: c.molde, titulo: 'Video', bloques: c.bloques, material: '' };
    const rv = csgRevisar(pc, 'claude');
    ok(!rv.para.some(x => x.bloque === 'aristas'), 'y el repaso no le pone pegas a sus aristas (la de vuelta lleva su «máximo 2 vueltas»)', JSON.stringify(rv.para));
    /* Los nodos se leen como los lee el armado: «Editor.» sin dos puntos
       es el nodo «Editor», y sus aristas no lo añaden otra vez. Con una
       lectura propia, el lector lo daba por nuevo y lo duplicaba. */
    const PN = 'Nodos:\nInvestigador.\nGuionista.\nEditor.\nAristas:\nInvestigador → Guionista.\nGuionista → Editor.\nEditor → FIN.\n';
    const pn = csgLeer(PN);
    ok(pn.clase === 'grafo' && !pn.anadido.length && bl(pn, 'nodos') && bl(pn, 'nodos').t === 'Investigador.\nGuionista.\nEditor.',
      'nodos escritos con su punto final ya están: las aristas no los añaden otra vez', muestra(pn) + '\nañadidos: ' + pn.anadido.join(', '));
    ok(!csgRevisar({ id: 'x', clase: 'grafo', molde: pn.molde, titulo: 'x', bloques: pn.bloques, material: '' }, 'claude').para.some(x => x.bloque === 'aristas'),
      '  y el repaso encuentra cada nodo de cada arista');
    cuadra('nodos con punto final', PN, pn);
  });

  seccion('4.7 «Para cuando… / Máximo 4 vueltas / Repite…» → Bucle · Repite hasta', () => {
    const T = 'Escribe el primer párrafo del ensayo sobre la memoria.\nPara cuando tenga menos de 80 palabras y empiece con un dato.\nMáximo 4 vueltas.\nRepite con lo que falló en cuenta.\n';
    const r = csgLeer(T);
    ok(r.clase === 'bucle' && r.molde === 'hasta', 'Bucle · Repite hasta', r.clase + ' · ' + r.molde + '\n' + muestra(r));
    ok(bl(r, 'parada') && bl(r, 'parada').t === 'Para cuando tenga menos de 80 palabras y empiece con un dato.' && bl(r, 'tope') && bl(r, 'tope').t === 'Máximo 4 vueltas.',
      'la parada y el tope, cada uno en su bloque');
    ok(bl(r, 'paso') && bl(r, 'paso').t === 'Escribe el primer párrafo del ensayo sobre la memoria.\nRepite con lo que falló en cuenta.', 'el «Repite…» y lo demás, en `paso`', JSON.stringify(bl(r, 'paso')));
    ok(!bl(r, 'tarea') && !bl(r, 'texto'), 'y no queda nada suelto en Tarea ni en Texto');
    cuadra('Repite hasta', T, r);
    const S = 'Para que salga bien, piensa antes de escribir.\nEscribe un poema corto.\n';
    const s = csgLeer(S);
    ok(s.clase === 'prompt', 'un «Para que…» suelto (una sola clase) NO es un bucle', s.clase + ' · ' + s.molde);
    cuadra('un «para que» suelto', S, s);
    const O = 'Para cada tema, haz tres preguntas de selección con la correcta marcada.\nFracciones\nDecimales\nPorcentajes\nProporciones\n';
    const o = csgLeer(O);
    ok(o.clase === 'bucle' && o.molde === 'lotes' && bl(o, 'lista') && bl(o, 'lista').t === 'Fracciones\nDecimales\nPorcentajes\nProporciones' && /^Para cada tema/.test(bl(o, 'paso').t),
      '«Para cada tema» y una tanda de renglones cortos → Bucle · Por lotes (la tanda a `lista`, el renglón a `paso`)', muestra(o));
    cuadra('Por lotes', O, o);
  });

  seccion('4.8 «## Tarea … Repite esto para cada tema» → Prompt · Encargo, y el aviso', () => {
    const T = '## Rol\nEres un maestro de sexto grado.\n\n## Tarea\nHaz tres preguntas de repaso sobre el tema.\nRepite esto para cada tema.\n';
    const r = csgLeer(T);
    ok(r.clase === 'prompt' && r.molde === 'encargo', 'Prompt · Encargo completo (hay bloques de prompt: no se propone un bucle)', r.clase + ' · ' + r.molde);
    ok(bl(r, 'tarea').t === 'Haz tres preguntas de repaso sobre el tema.\nRepite esto para cada tema.' && !bl(r, 'paso') && !bl(r, 'lista'), 'la frase se queda en su bloque', ids(r));
    const av = r.avisos.find(a => /parece que se repite/.test(a.texto));
    ok(!!av && av.renglon === 6 && /Por lotes/.test(av.texto), 'el lector avisa «parece que se repite» con su renglón (6) y propone Por lotes', JSON.stringify(r.avisos));
    const rv = csgRevisar({ id: 'x', clase: 'prompt', molde: r.molde, titulo: 't', bloques: r.bloques, material: '' }, 'claude');
    const a2 = rv.avisa.find(a => /parece que se repite/i.test(a.msg));
    ok(!!a2 && a2.arreglo && a2.arreglo.tipo === 'molde' && a2.arreglo.molde === 'lotes', 'y el repaso también, con «Duplicar en ese molde» (Por lotes)', JSON.stringify(rv.avisa));
    cuadra('Encargo con «repite»', T, r);
    const U = 'Escribe el primer párrafo del ensayo.\nPara cuando tenga menos de 80 palabras.\nMáximo 4 vueltas.\n\n## Tono\nDirecto y sin adornos.\n';
    const u = csgLeer(U);
    ok(u.clase === 'prompt' && !bl(u, 'tope') && !bl(u, 'parada') && bl(u, 'tarea') && /Máximo 4 vueltas\./.test(bl(u, 'tarea').t),
      'renglones de bucle SIN rótulo pero con un rótulo de prompt (Tono) en el texto: no se reparte como bucle, se queda en Tarea', ids(u) + ' ' + u.clase);
    cuadra('bucle suelto con un rótulo de prompt', U, u);
  });

  seccion('4.9 Siete renglones de prosa con siete palabras de bloque, sin dos puntos → UN bloque', () => {
    const SIETE = 'Contexto de la época en que se escribió la novela.\nFormato libre para quien la lea en voz alta.\nTono de voz de los personajes del pueblo.\nReglas del juego que nadie se atreve a romper.\nEjemplos de lo que pasó entonces en la plaza.\nAudiencia que la leyó al principio, sin prisa.\nEstilo del autor, sin copiarlo nunca.';
    const T = '## Tarea\n' + SIETE + '\n';
    const r = csgLeer(T);
    ok(r.bloques.length === 1 && r.bloques[0].id === 'tarea' && r.bloques[0].t === SIETE, 'con «## Tarea» delante: UN bloque Tarea con sus siete renglones', ids(r) + '\n' + muestra(r));
    ok(!r.avisos.length, 'y ninguno se nombra: son prosa', JSON.stringify(r.avisos));
    cuadra('siete renglones con Tarea', T, r);
    const s = csgLeer(SIETE);
    ok(s.bloques.length === 1 && (s.bloques[0].id === 'texto' || s.bloques[0].id === 'tarea') && s.bloques[0].t === SIETE && s.molde === 'libre',
      'sin rótulo ninguno: UN bloque (Texto, en Libre) con los siete', ids(s) + ' ' + s.molde);
    cuadra('siete renglones sueltos', SIETE, s);
  });

  seccion('4.10 Lo no entendido se NOMBRA con su renglón', () => {
    const T = 'Contexto: Es para la revista de la casa.\nNotas: que sea breve.\nTarea: Resume el informe en diez puntos.\nEjemplo: el PIB creció 3 % → (BCH, 2025).\nIMPORTANTE\nFormato: Lista numerada.\n';
    const r = csgLeer(T);
    const n2 = r.avisos.find(a => a.renglon === 2);
    ok(!!n2 && /«Notas:» no es un bloque; se quedó en Contexto\./.test(n2.texto) && n2.sugerencia === '', '«Notas:» entre rótulos reconocidos: renglón 2, «se quedó en Contexto», sin sugerencia que no venga a cuento', JSON.stringify(r.avisos));
    ok(bl(r, 'contexto').t === 'Es para la revista de la casa.\nNotas: que sea breve.', 'y el renglón sigue en su bloque, entero');
    const n4 = r.avisos.find(a => a.renglon === 4);
    ok(!!n4 && n4.sugerencia === 'ejemplos' && /¿Querías Ejemplos\?/.test(n4.texto), '«Ejemplo:» a una letra de «Ejemplos»: se sugiere (Levenshtein ≤ 2)', JSON.stringify(n4));
    ok(r.avisos.some(a => a.renglon === 5 && /«IMPORTANTE» no es un bloque/.test(a.texto)), 'un rótulo en MAYÚSCULAS que no se conoce también se nombra');
    cuadra('lo no entendido', T, r);
    const NP = csgLeer('Contexto: Es para la revista.\nNodo: el primero de la lista.\nTarea: Resume el informe.\n');
    const NG = csgLeer('Meta: Un video.\nNodo: Investigador\nAristas: Investigador → FIN\n');
    const ap = NP.avisos.find(a => a.renglon === 2), ag = NG.avisos.find(a => a.renglon === 2);
    ok(NP.clase === 'prompt' && !!ap && ap.sugerencia === '' && NG.clase === 'grafo' && !!ag && ag.sugerencia === 'nodos' && /¿Querías Nodos, uno por renglón\?/.test(ag.texto),
      'la sugerencia es de la clase propuesta: «Nodo:» en un prompt no sugiere «Nodos»; en un grafo, sí', JSON.stringify([ap, ag]));
    const M = '## Lo que viaja entre nodos\nViaja: el tema y las fuentes. No viaja: el razonamiento.\n## Nodos\nInvestigador: recibe el tema, entrega fuentes.\n';
    const m = csgLeer(M);
    ok(!m.avisos.length, '«Viaja: …» o «Investigador: …» son contenido, no rótulos fallidos: no se nombran', JSON.stringify(m.avisos));
    cuadra('contenido con dos puntos', M, m);
    /* La errata de un rótulo conocido se nombra aunque no haya otros
       rótulos al lado (revisión del 23 de septiembre de 2026): debajo de
       una sola frase, «Contexo:» se quedaba en el Texto sin decir nada. */
    const E = 'Resume el informe en cinco puntos.\nContexo: es para la revista de octubre.';
    const e = csgLeer(E);
    const ae = e.avisos.find(a => a.renglon === 2);
    ok(!!ae && !!ae.sugerencia && /«Contexo:» no es un bloque; .*¿Querías Contexto\?/.test(ae.texto) && /Contexo: es para la revista de octubre\./.test(e.bloques.map(x => x.t).join('\n')),
      '«Contexo:» sin otros rótulos: se NOMBRA con su renglón y su sugerencia, y el renglón sigue en su bloque', JSON.stringify(e.avisos));
    cuadra('errata sin otros rótulos', E, e);
  });

  seccion('4.11 Material, subtítulos, bloques libres y código', () => {
    const T = 'Tarea: Corrige lo que va abajo.\n=== Material ===\nTarea: esto es del informe, no de la consigna.\n## Tampoco esto\n=== Fin del material ===\nFormato: Lista.\n';
    const r = csgLeer(T);
    ok(r.material === 'Tarea: esto es del informe, no de la consigna.\n## Tampoco esto' && ids(r) === 'tarea,formato' && bl(r, 'tarea').t === 'Corrige lo que va abajo.',
      'lo de entre «=== Material ===» y su fin va a `material`, y un «Tarea:» dentro no parte nada', muestra(r));
    cuadra('material con marcas', T, r);
    const X = '<tarea>Resume.</tarea>\n<material>\nEl informe.\nEntero.\n</material>';
    const x = csgLeer(X);
    ok(x.material === 'El informe.\nEntero.' && bl(x, 'tarea').t === 'Resume.', '<material>…</material> también', muestra(x));
    cuadra('material en XML', X, x);
    const Q = 'Resume en tres puntos.\n===\nPrimer párrafo del informe.\nSegundo párrafo.\n';
    const q = csgLeer(Q);
    ok(q.material === 'Primer párrafo del informe.\nSegundo párrafo.' && q.bloques.length === 1 && q.bloques[0].t === 'Resume en tres puntos.', 'un renglón «===» solo: de ahí al final es material', muestra(q));
    cuadra('material tras ===', Q, q);
    const S = '## Pasos\n### Primero\nLee todo.\n### Después\nMarca las erratas.\n## Criterios de éxito\nNinguna cifra tocada.\n## Tarea\nCorrige esto:\n```\nsi cumple: parar\nFormato: no es un rótulo\n```\n';
    const s = csgLeer(S);
    ok(bl(s, 'pasos') && bl(s, 'pasos').t === '### Primero\nLee todo.\n### Después\nMarca las erratas.', '«### Primero» dentro de «## Pasos» es un subtítulo: se queda dentro, no abre un bloque', JSON.stringify(bl(s, 'pasos')));
    const lib = s.bloques.find(b => b.rotulo === 'Criterios de éxito');
    ok(!!lib && lib.id === 'criterios_de_exito' && lib.t === 'Ninguna cifra tocada.', '«## Criterios de éxito» (desconocido, al nivel de los rótulos) → bloque LIBRE con su rótulo', JSON.stringify(s.bloques));
    ok(bl(s, 'tarea').t === 'Corrige esto:\n```\nsi cumple: parar\nFormato: no es un rótulo\n```' && !bl(s, 'formato') && !s.avisos.length, 'dentro de un bloque de código no hay rótulos ni avisos', JSON.stringify(s.avisos) + ' ' + ids(s));
    cuadra('subtítulos, libres y código', S, s);
    const N = '## Tarea\nResume el informe.\n**Importante**\nNo inventes nada.\n## Formato\nLista.\n';
    const n = csgLeer(N);
    ok(ids(n) === 'tarea,formato' && bl(n, 'tarea').t === 'Resume el informe.\n**Importante**\nNo inventes nada.', 'una negrita sola desconocida en un texto que rotula con «##» es un subtítulo: se queda en su bloque', muestra(n));
    cuadra('negrita dentro de ##', N, n);
    const Gg = '**Tarea**\nResume el informe.\n**Importante**\nNo inventes nada.\n';
    const g = csgLeer(Gg);
    const gl = g.bloques.find(b => b.rotulo === 'Importante');
    ok(!!gl && gl.t === 'No inventes nada.' && bl(g, 'tarea').t === 'Resume el informe.', 'y en un texto que rotula con negritas, la desconocida es un bloque LIBRE (la negrita sola es inequívoca)', muestra(g));
    cuadra('negritas', Gg, g);
  });

  seccion('4.12 Lo que sale de aquí vuelve a entrar', () => {
    const esperado = {
      rol: 'Eres un editor de una revista de divulgación en español, riguroso con las fuentes y alérgico a las frases hechas.',
      contexto: 'Esto va en la revista de la casa, que leen cuatro personas de entre 12 y 50 años.',
      tarea: 'Reescribe los tres primeros párrafos para que el dato más fuerte salga en la primera frase.',
      formato: 'Primero el resultado; debajo, la lista de cambios.',
      tono: 'Directo y sin adornos.',
    };
    [['xml', '**Encargo completo en `xml` (Claude):**'], ['md', '**El mismo Encargo en `md` (ChatGPT, Gemini, Otra):**'], ['seguida', '**El mismo Encargo en `seguida` (NotebookLM):**']].forEach(([forma, marca]) => {
      const T = ejemplo(marca);
      if (!T) { ok(false, 'el Encargo en ' + forma + ' sale del plan'); return; }
      const r = csgLeer(T);
      const bien = Object.keys(esperado).every(k => bl(r, k) && bl(r, k).t === esperado[k]);
      ok(r.molde === 'encargo' && ids(r) === 'rol,contexto,tarea,reglas,formato,comprobacion,tono' && bien && r.material === '(el texto pegado)' && !r.avisos.length,
        'el Encargo del §7 en ' + forma + ' vuelve a entrar como Encargo, con sus siete bloques y su material', muestra(r));
      ok(/No inventes datos; si no lo sabes, dilo\.\s*(?:\n- )?Cita cada fuente/.test(bl(r, 'reglas') ? bl(r, 'reglas').t : ''), '  y sus dos reglas');
      cuadra('Encargo ' + forma + ' del plan', T, r);
    });
    const B = ejemplo('**Repite hasta, auto-bucle en `md`:**');
    ok(!!B, 'el auto-bucle de Repite hasta sale del plan');
    const b = csgLeer(B || '');
    ok(b.clase === 'bucle' && b.molde === 'hasta' && ids(b).indexOf('paso,parada,tope,memoria,salida') === 0, 'el auto-bucle en md vuelve a entrar como Repite hasta', ids(b));
    const como = b.bloques.find(x => x.rotulo === 'Cómo hacerlo en este chat');
    ok(!!como && /VUELTA 1\.\.5:/.test(como.t) && b.avisos.length === 1, 'y su seudocódigo se queda entero dentro del bloque libre, sin rótulos ni avisos por «si cumple: …»', JSON.stringify(b.avisos));
    cuadra('auto-bucle md del plan', B || '', b);
    const SG = 'Criterio de parada: Para cuando rime.\n\nTope: Máximo 3 vueltas.\n\nCómo hacerlo en este chat: Hazlo tú solo, por vueltas y numerando cada una como VUELTA n.\n';
    const sg = csgLeer(SG);
    const comoSg = sg.bloques.find(x => x.rotulo === 'Cómo hacerlo en este chat');
    ok(bl(sg, 'tope') && bl(sg, 'tope').t === 'Máximo 3 vueltas.' && !!comoSg && /^Hazlo tú solo/.test(comoSg.t) && sg.avisos.some(a => a.renglon === 5 && /lo escribe La Consigna/.test(a.texto)),
      'en texto seguido, «Cómo hacerlo en este chat: …» (cinco palabras) no se pega al Tope: va a su bloque libre y se nombra', muestra(sg));
    cuadra('«Cómo hacerlo…» seguido', SG, sg);
    const limpia = r => ({ id: 'x', clase: r.clase, molde: r.molde, titulo: 'Prueba', bloques: r.bloques.filter(x => x.rotulo !== 'Cómo hacerlo en este chat' && x.rotulo !== 'como'), material: '' });
    const pb = limpia(b);
    const tx = L('csgArmar')(pb, 'claude', {}, {}).principal;
    const rx = csgLeer(tx);
    const iguales = pb.bloques.every(x => bl(rx, x.id) && bl(rx, x.id).t === x.t);
    const comoPegado = rx.bloques.find(x => x.rotulo === 'como');
    ok(rx.molde === 'hasta' && iguales && !!comoPegado && rx.avisos.some(a => /«<como>» lo escribe La Consigna/.test(a.texto)),
      'el mismo bucle armado en XML por csgArmar vuelve a entrar: cada bloque con su texto exacto, y <como> apartado y nombrado', muestra(rx));
    ok(!!comoPegado && comoPegado.id !== 'como', '  y el <como> pegado no se queda con el id del bloque sintético del armado (sale «' + (comoPegado && comoPegado.id) + '»)');
    cuadra('bucle armado en XML', tx, rx);
    const pg = limpia(c7);
    const tg = L('csgArmar')(pg, 'claude', {}, {}).principal;
    const rg = csgLeer(tg);
    ok(rg.molde === 'cadena' && pg.bloques.every(x => bl(rg, x.id) && bl(rg, x.id).t === x.t) && !rg.anadido.length,
      'y la Cadena armada en XML también, sin añadir ni un nodo', muestra(rg));
    cuadra('Cadena armada en XML', tg, rg);
    /* Con ejemplos es el que más cambia de forma al armarse: <ejemplo> con
       <entrada> y <salida> en XML, **Entrada:** y **Salida:** con un
       renglón en blanco entre pares en Markdown, y «Ahora tú» al final. El
       texto seguido junta la lista en un párrafo a propósito, así que no
       vuelve igual y no se le pide. «- Así NO: …» va ya con su viñeta: el
       armado le pone «- » a un renglón de lista que no la lleva, así que la
       primera vuelta la añade y desde ahí la pieza es un punto fijo. Aquí
       se prueba el punto fijo. */
    const pe = { id: 'x', clase: 'prompt', molde: 'ejemplos', titulo: 'Citas', material: '', bloques: [
      { id: 'tarea', rotulo: 'Tarea', t: 'Convierte cada cita suelta a la forma (Autor, año, p.).' },
      { id: 'ejemplos', rotulo: 'Ejemplos', t: 'Harari 2014 página 45 → (Harari, 2014, p. 45)\nInforme del BID de 2023, p. 12 → (BID, 2023, p. 12)\n- Así NO: (Harari 2014 45)' },
      { id: 'caso', rotulo: 'Ahora tú', t: 'Ahora haz lo mismo con cada renglón de lo que va abajo.' },
      { id: 'formato', rotulo: 'Formato de salida', t: 'Un renglón por caso, con la misma flecha que los ejemplos.' },
    ] };
    [['claude', 'XML'], ['chatgpt', 'Markdown']].forEach(([maq, nombre]) => {
      const te = L('csgArmar')(pe, maq, {}, {}).principal;
      const re = csgLeer(te);
      ok(re.molde === 'ejemplos' && pe.bloques.every(x => bl(re, x.id) && bl(re, x.id).t === x.t),
        'Con ejemplos armado en ' + nombre + ' vuelve a entrar con sus pares y su «Ahora tú» exactos', muestra(re) + '\n--- armado:\n' + te);
      cuadra('Con ejemplos en ' + nombre, te, re);
    });
    const K = ejemplo('**Careo, auto-bucle en `md`**');
    const k = csgLeer(K || '');
    ok(k.clase === 'bucle' && k.molde === 'careo' && bl(k, 'tope') && bl(k, 'tope').rotulo === 'Rondas' && bl(k, 'etiqueta') && bl(k, 'etiqueta').rotulo === 'Veredicto y etiqueta',
      'el Careo en md vuelve a entrar como Careo («Rondas» y «Veredicto y etiqueta» son sus rótulos)', ids(k) + ' ' + k.molde);
    cuadra('Careo md del plan', K || '', k);
  });

  seccion('4.13 Casos límite', () => {
    const vacios = ['', '   \n\n  ', null, undefined];
    ok(vacios.every(v => { const r = csgLeer(v); return r.clase === 'prompt' && r.molde === 'libre' && Array.isArray(r.bloques) && !r.bloques.length && r.titulo === '' && r.material === ''; }), 'vacío, en blanco, null o undefined: Libre y sin bloques, sin reventar');
    const W = '\uFEFF# Resumen de informe\r\nTarea:\u00A0Resume\tel informe.\r\n';
    const w = csgLeer(W);
    ok(w.titulo === 'Resumen de informe' && bl(w, 'tarea') && bl(w, 'tarea').t === 'Resume el informe.', 'BOM, \\r\\n, tabulador y espacio duro: normalizados (y el «# …» es el título)', muestra(w));
    cuadra('normalizar', W, w);
    const V = 'Tarea: Resume {{texto}} para {{ Quien }} y {{texto}}.\n';
    ok(JSON.stringify(csgLeer(V).variables) === '["texto","Quien"]', 'variables detectadas, cada una una vez y en orden');
    const H = csgLeer('## Rol\nEres X.\n');
    ok(H.bloques.length === 1 && H.propuesta.total === L('CSG_MOLDES')[H.molde].bloques.length, 'propuesta con «n de m» del molde propuesto');
    const PM = L('csgProponerMolde');
    ok(PM('prompt', ['tarea', 'formato']) === 'rapido' && PM('prompt', ['tarea', 'rol']) === 'encargo' && PM('prompt', []) === 'libre' && PM('prompt', ['objetivo', 'audiencia', 'tarea']) === 'costar' &&
       PM('prompt', ['pasos', 'responde', 'tarea']) === 'razonado' && PM('prompt', ['pregunta']) === 'fuentes' && PM('prompt', ['voz', 'tema']) === 'voz' &&
       PM('prompt', ['tarea', 'ejemplos'], [{ id: 'ejemplos', t: 'a → b' }]) === 'encargo' && PM('prompt', ['tarea', 'ejemplos'], [{ id: 'ejemplos', t: 'a → b\nc → d' }]) === 'ejemplos' &&
       PM('habilidad', ['nombre', 'disparador']) === 'skill' && PM('habilidad', ['identidad']) === 'sistema' && PM('habilidad', ['disparador', 'pasos']) === 'receta' &&
       PM('grafo', ['reparto']) === 'coordinador' && PM('grafo', ['meta']) === 'cadena' &&
       PM('bucle', ['critico']) === 'critica' && PM('bucle', ['lista']) === 'lotes' && PM('bucle', ['postura_a']) === 'careo' && PM('bucle', ['paso']) === 'hasta',
      'csgProponerMolde sigue el paso 8 del §5 (un par no hace Con ejemplos; dos sí)');
    let revienta = '';
    ['<<<>>>', '## \n#\n**\n**:**', '---\nname:\n---', '<tarea><tarea>x</tarea>', '→ → →\n-> ->', '{{', '}}{{', '===\n===', '```\n## Tarea'].forEach(t => {
      try { const r = csgLeer(t); cuadra('raro «' + t.replace(/\n/g, '⏎') + '»', t, r); } catch (e) { revienta += t + ': ' + e.message + '; '; }
    });
    ok(!revienta, 'textos rotos no revientan el lector', revienta);
  });

  seccion('4.14 Los 18 moldes, llenos con sus ejemplos y armados por csgArmar, vuelven a entrar enteros', () => {
    /* La prueba más dura de la costura entre el armado y el lector: cada
       molde con todos sus bloques llenos (su ejemplo, o su texto inicial),
       armado en XML (Claude) y en Markdown (ChatGPT) —o en la forma que el
       molde fuerza: SKILL.md, o texto seguido en Instrucción de sistema y
       Receta corta—, tiene que volver por el lector como EL MISMO molde, con
       el mismo texto en cada bloque, sin añadir nodos, sin avisos (salvo el
       del «Cómo hacerlo en este chat» que escribe el armado) y cuadrando las
       palabras. Tres cosas se comparan con manga, y no por descuido: las
       reservadas salen rellenas (el armado las rellena: se compara con
       csgRellena); un renglón de lista vuelve con la viñeta «- » que le
       puso el armado (es un punto fijo); y en texto seguido una lista se
       junta en un párrafo a propósito, así que ahí solo se pide que el
       bloque esté. */
    const M = L('CSG_MOLDES');
    const armar = L('csgArmar'), rellena = L('csgRellena'), def = L('csgBloqueDef');
    const limpia = t => String(t).split('\n').map(l => l.trim().replace(/^[-•*] /, '')).filter(Boolean).join('\n');
    const malos = [];
    let vueltas = 0;
    Object.keys(M).forEach(mid => {
      const molde = M[mid];
      const p = { id: 'csg-p', clase: molde.clase, molde: mid, titulo: 'Prueba ' + molde.nombre, material: '',
        bloques: molde.bloques.map(b => { const d = def(mid, b.id); return { id: b.id, rotulo: d.rotulo, t: d.inicial || d.ejemplo || '' }; }) };
      /* Y el molde que trae su máquina (el Cuento que enseña, Storybook),
         también en la forma de ella: es la que de verdad se va a pegar. */
      const formas = molde.forma ? [['claude', molde.forma]] : [['claude', 'xml'], ['chatgpt', 'md']]
        .concat(molde.maquina ? [[molde.maquina, L('csgMaquina')(molde.maquina).forma]] : []);
      formas.forEach(([maq, forma]) => {
        vueltas++;
        const txt = armar(p, maq, {}, {}).principal;
        const r = csgLeer(txt);
        const fallo = [];
        if (r.clase !== molde.clase || r.molde !== mid) fallo.push('volvió como ' + r.clase + ' · ' + r.molde);
        p.bloques.forEach(b => {
          const got = bl(r, b.id);
          if (!got) { fallo.push('falta «' + b.id + '»'); return; }
          const lista = !!def(mid, b.id).lista;
          if (forma === 'seguida' && lista) return;
          const esperado = rellena(b.t, p, maq, {});
          const a = lista ? limpia(got.t) : got.t, e = lista ? limpia(esperado) : esperado;
          if (a !== e) fallo.push(b.id + ': ' + JSON.stringify(a).slice(0, 90) + ' ≠ ' + JSON.stringify(e).slice(0, 90));
        });
        if (r.anadido.length) fallo.push('añadió ' + r.anadido.join(', '));
        const otros = r.avisos.filter(a => !/lo escribe La Consigna/.test(a.texto));
        if (otros.length) fallo.push('avisos: ' + otros.map(a => a.texto).join(' | '));
        const d = descuadre(txt, r);
        if (d) fallo.push(d);
        if (fallo.length) malos.push(mid + ' en ' + forma + ': ' + fallo.join('; '));
      });
    });
    ok(!malos.length, vueltas + ' vueltas (los 18 moldes en sus formas): mismo molde, mismo texto, ningún nodo inventado, ningún aviso de más, palabras cuadradas', malos.join('\n'));
  });

  /* Lo que encontró la revisión del lector del 23 de septiembre de 2026,
     con las entradas de la revisión tal como una máquina las escribe. Cada
     comprobación se probó quitando su arreglo: sin él, suspende. */
  seccion('4.15 Lo que cazó la revisión del lector', () => {
    /* El texto de un bloque, o undefined si no está: así un bloque que falta
       suspende diciendo cuál, en vez de reventar la sección entera. */
    const tx = (r, id) => (bl(r, id) || {}).t;
    const rev = r => csgRevisar({ id: 'csg-x', clase: r.clase, molde: r.molde, titulo: 't', bloques: r.bloques, material: r.material }, 'claude');

    /* Una etiqueta vacía o metida en una frase es una PALABRA de la frase. */
    const E1 = 'You are an expert editor.\n\nPut your final answer in <answer></answer> tags. Think step by step in <scratchpad></scratchpad> first.\n\n<document>\nEl informe dice que...\n</document>';
    const e1 = csgLeer(E1);
    ok(bl(e1, 'texto') && tx(e1, 'texto') === 'You are an expert editor.\n\nPut your final answer in <answer></answer> tags. Think step by step in <scratchpad></scratchpad> first.' && !bl(e1, 'responde'),
      '«Put your final answer in <answer></answer> tags»: la frase sale entera, con sus etiquetas, y no abre un bloque vacío', muestra(e1));
    ok(e1.bloques.some(b => b.rotulo === 'document' && b.t === 'El informe dice que...'), '… y <document> en su renglón, con algo dentro, sí es un bloque', muestra(e1));
    cuadra('etiquetas dentro de una frase', E1, e1);
    const E2 = 'Resume lo que te pego dentro de <material></material> en tres viñetas.';
    const e2 = csgLeer(E2);
    ok(e2.material === '' && bl(e2, 'texto') && tx(e2, 'texto') === E2, '«dentro de <material></material> en tres viñetas»: no es material, y la frase no se parte', muestra(e2));
    const E3 = 'Tarea: Resume el informe y escríbelo entre <respuesta>aquí</respuesta> y nada más.\nFormato: lista.';
    const e3 = csgLeer(E3);
    ok(bl(e3, 'tarea') && tx(e3, 'tarea') === 'Resume el informe y escríbelo entre <respuesta>aquí</respuesta> y nada más.' && tx(e3, 'formato') === 'lista.',
      'una etiqueta con algo dentro pero en mitad de la frase tampoco se lleva la frase', muestra(e3));
    const e4 = csgLeer('<rol>Eres X.</rol><tarea>Haz Y.</tarea>');
    ok(ids(e4) === 'rol,tarea' && tx(e4, 'rol') === 'Eres X.' && tx(e4, 'tarea') === 'Haz Y.', '… y dos bloques cerrados en el mismo renglón siguen siendo dos bloques', muestra(e4));

    /* Un few-shot de clasificación no es un grafo. */
    const C1 = 'Tarea: Di si la reseña es positiva o negativa.\nMe encantó → positiva\nFue horrible → negativa\nMuy recomendable → positiva\nAhora tú: No me gustó nada';
    const c1 = csgLeer(C1);
    ok(c1.clase === 'prompt' && c1.molde === 'ejemplos' && !bl(c1, 'aristas') && !bl(c1, 'nodos') &&
      tx(c1, 'ejemplos') === 'Me encantó → positiva\nFue horrible → negativa\nMuy recomendable → positiva' && tx(c1, 'caso') === 'No me gustó nada',
      'clasificación con «Tarea:» y «Ahora tú:»: Prompt · Con ejemplos, nunca Grafo (la etiqueta repetida solo RECIBE)', muestra(c1));
    ok(!rev(c1).para.length, '… y el repaso no para', JSON.stringify(rev(c1).para));
    cuadra('clasificación con Ahora tú', C1, c1);
    const C2 = 'Clasifica cada palabra…\nperro → animal\ngato → animal\nrosa → planta';
    const c2 = csgLeer(C2);
    ok(c2.clase === 'prompt' && !bl(c2, 'aristas') && !rev(c2).para.length, 'sin rótulos, tampoco: ni Grafo, ni «Falta Meta», ni un «gato → animal» que «vuelve atrás»', muestra(c2) + JSON.stringify(rev(c2).para));
    const c3 = csgLeer('Coordinador → Investigador\nCoordinador → Guionista\nCoordinador → Editor');
    ok(c3.clase === 'grafo' && bl(c3, 'aristas'), '… y una estrella de verdad (el mismo origen reparte a varios) sigue siendo un Grafo', muestra(c3));

    /* Los pares «Pregunta:/Respuesta:» sin rótulo de Ejemplos. */
    const P1 = 'Responde como en estos ejemplos.\nPregunta: ¿Capital de Francia?\nRespuesta: París\nPregunta: ¿Capital de Italia?\nRespuesta: Roma\nPregunta: ¿Capital de España?';
    const p1 = csgLeer(P1);
    ok(p1.molde === 'ejemplos' && tx(p1, 'ejemplos') === '¿Capital de Francia? → París\n¿Capital de Italia? → Roma' && tx(p1, 'caso') === '¿Capital de España?' && !bl(p1, 'formato') && !bl(p1, 'pregunta'),
      'pares «Pregunta:/Respuesta:» sueltos: van juntos a Ejemplos y la última pregunta a «Ahora tú»; ninguna respuesta cae en Formato', muestra(p1));
    ok(!rev(p1).para.length, '… y el repaso no para', JSON.stringify(rev(p1).para));
    cuadra('pares sin rótulo de Ejemplos', P1, p1);
    const P2 = '## Tarea\nResume.\n## Formato\nPregunta: ¿A?\nRespuesta: B\nPregunta: ¿C?\nRespuesta: D';
    const p2 = csgLeer(P2);
    ok(bl(p2, 'formato') && tx(p2, 'formato') === 'Pregunta: ¿A?\nRespuesta: B\nPregunta: ¿C?\nRespuesta: D' && !bl(p2, 'ejemplos'), '… y dentro de un Formato que enseña la forma, se quedan en él, enteros', muestra(p2));

    /* Los rótulos como los escribe un chat: viñeta, emoji, número. */
    const R = [
      ['- **Rol:** Eres un tutor de matemáticas.\n- **Tarea:** Explica las fracciones.\n- **Formato:** tres párrafos', 'rol,tarea,formato', 'encargo'],
      ['🎯 Objetivo: que entiendan.\n👥 Audiencia: niños de sexto.\n📝 Tarea: explica las fracciones.', 'objetivo,audiencia,tarea', 'costar'],
      ['**1. Contexto:** Es para la revista.\n**2. Tarea:** Resume.', 'contexto,tarea', 'encargo'],
      ['### 1. Rol\nEres X.\n### 2. Tarea\nHaz Y.', 'rol,tarea', 'encargo'],
      ['## 🎭 Rol\nEres X.\n## 📋 Tarea\nHaz Y.\n## 📐 Formato\nLista.', 'rol,tarea,formato', 'encargo'],
    ];
    R.forEach(([t, esperado, molde]) => {
      const r = csgLeer(t);
      ok(ids(r) === esperado && r.molde === molde && !r.bloques.some(b => /[\d🎭📋📐🎯👥📝*]/u.test(b.t.slice(0, 3))),
        'rótulos con viñeta, emoji o número delante ascienden: «' + t.split('\n')[0] + '» → ' + esperado, muestra(r));
      cuadra('rótulo adornado «' + t.split('\n')[0] + '»', t, r);
    });
    const R6 = '## Reglas\n- Tono: siempre formal.\n- No inventes.\n## Tarea\nResume.\n2. Formato: tabla';
    const r6 = csgLeer(R6);
    ok(tx(r6, 'reglas') === '- Tono: siempre formal.\n- No inventes.' && tx(r6, 'tarea') === 'Resume.\n2. Formato: tabla' && !bl(r6, 'tono') && !bl(r6, 'formato'),
      '… pero dentro de un bloque, «- Tono: …» es una regla de la lista y «2. Formato: …» un paso de la tarea: no parten a nadie', muestra(r6));
    const R7 = '- **Rol:** Eres un tutor.\n- **Tarea:** Explica.\n- **Notas:** algo mío';
    const r7 = csgLeer(R7);
    ok(r7.avisos.some(a => a.renglon === 3 && /«Notas:» no es un bloque/.test(a.texto)) && /- \*\*Notas:\*\* algo mío/.test(tx(r7, 'tarea')),
      'y la que no se entiende se NOMBRA con su renglón, y se queda donde estaba', JSON.stringify(r7.avisos));

    /* Un rótulo de OTRA clase se muda al que el molde sí tiene. */
    const M1 = 'Tarea: Resume el informe.\nSalida: una tabla de dos columnas.';
    const m1 = csgLeer(M1);
    ok(m1.molde === 'rapido' && ids(m1) === 'tarea,formato' && tx(m1, 'formato') === 'una tabla de dos columnas.' && !rev(m1).para.length,
      '«Salida:» en un prompt se lee como Formato (y el repaso no para por un Formato que sí está)', muestra(m1) + JSON.stringify(rev(m1).para));
    ok(m1.avisos.some(a => a.renglon === 2 && /«Salida» se leyó como «Formato de salida»/.test(a.texto)), '… y se DICE, con su renglón', JSON.stringify(m1.avisos));
    cuadra('Salida en un prompt', M1, m1);
    const M2 = '---\nname: extraer-pdf\ndescription: Extrae tablas de un PDF.\n---\n## Instructions\n1. Abre el PDF.\n2. Extrae.';
    const m2 = csgLeer(M2);
    ok(m2.molde === 'skill' && bl(m2, 'pasos') && tx(m2, 'pasos') === '1. Abre el PDF.\n2. Extrae.' && !bl(m2, 'tarea') && !rev(m2).para.some(x => /Falta «Pasos»/.test(x.msg)),
      '«## Instructions» de un SKILL.md de Anthropic va a Pasos, y el repaso no pide unos Pasos que están escritos', muestra(m2));
    ok(m2.avisos.some(a => /«Instructions» se leyó como «Pasos»/.test(a.texto)), '… y se dice', JSON.stringify(m2.avisos));
    cuadra('SKILL.md con Instructions', M2, m2);

    /* «Vuelve a…» con un «hasta que» suelto en la prosa no es un bucle. */
    const V1 = 'Te pego el capítulo dos de mi tesis.\nVuelve a leerlo con calma y dime qué le falta.\nMi asesor dice que no avanzo hasta que aclare la metodología.\nSé directo.';
    const v1 = csgLeer(V1);
    ok(v1.clase === 'prompt' && v1.bloques.length === 1 && v1.bloques[0].t === V1 && !rev(v1).avisa.some(x => /se repite/.test(x.msg)),
      'una consulta sobre una tesis con «Vuelve a leerlo» y un «hasta que» no se parte como un Bucle, ni se avisa de que se repite', muestra(v1));
    const v2 = csgLeer('Escribe un poema.\nVuelve a escribirlo si no rima.\nPara cuando rime.\nMáximo 3 vueltas.');
    ok(v2.clase === 'bucle' && bl(v2, 'paso') && /Vuelve a escribirlo/.test(tx(v2, 'paso')), '… y dentro de un bucle de verdad (parada y tope), «Vuelve a…» sigue siendo el paso', muestra(v2));

    /* Lo que la herramienta arma para NotebookLM vuelve a entrar entero:
       los rótulos largos del vocabulario («Lo que se guarda entre
       vueltas», «Nodos, uno por renglón») ascienden en texto seguido. */
    const Mo = L('CSG_MOLDES'), armar = L('csgArmar'), def = L('csgBloqueDef'), rellena = L('csgRellena');
    const malos = [];
    Object.keys(Mo).forEach(mid => {
      const molde = Mo[mid];
      const p = { id: 'csg-p', clase: molde.clase, molde: mid, titulo: 'Prueba', material: '',
        bloques: molde.bloques.map(b => { const d = def(mid, b.id); return { id: b.id, rotulo: d.rotulo, t: d.inicial || d.ejemplo || '' }; }) };
      const txt = armar(p, 'notebooklm', {}, {}).principal;
      const r = csgLeer(txt);
      const fallo = [];
      if (r.molde !== mid) fallo.push('volvió como ' + r.molde);
      p.bloques.forEach(b => {
        const got = bl(r, b.id);
        if (!got) { fallo.push('falta «' + b.id + '»'); return; }
        if (def(mid, b.id).lista) return;
        const e = rellena(b.t, p, 'notebooklm', {}).replace(/\s+/g, ' ').trim();
        if (got.t !== e) fallo.push(b.id + ': ' + JSON.stringify(got.t).slice(0, 80) + ' ≠ ' + JSON.stringify(e).slice(0, 80));
      });
      const otros = r.avisos.filter(a => !/lo escribe La Consigna/.test(a.texto));
      if (otros.length) fallo.push('avisos: ' + otros.map(a => a.texto).join(' | '));
      const d = descuadre(txt, r);
      if (d) fallo.push(d);
      if (fallo.length) malos.push(mid + ': ' + fallo.join('; '));
    });
    ok(!malos.length, 'los 18 moldes armados para NotebookLM (texto seguido) vuelven como el mismo molde, cada texto en su bloque, sin avisos', malos.join('\n'));
    const l1 = csgLeer('Contexto: el colegio abre en enero.\nLo que me dijo mi asesor ayer: que avance.');
    ok(bl(l1, 'contexto') && tx(l1, 'contexto') === 'el colegio abre en enero.\nLo que me dijo mi asesor ayer: que avance.', '… y una frase larga con dos puntos que no es un rótulo del vocabulario sigue siendo prosa', muestra(l1));
    ok(SL.toques.length === 0, 'y nada de esto tocó el navegador', SL.toques.slice(0, 5).join(', '));
  });

  /* El Cuento que enseña por la puerta de Pegar. La asimetría manda
     también aquí: se propone con DOS rótulos de cuento y uno de ellos de
     los que solo escribe un cuento, porque «Tema» y «Aprendizaje» sueltos
     son un plan de clase y «Extensión: 800 palabras» es un ensayo. */
  seccion('4.16 El cuento se reconoce, vuelve a entrar entero y no se inventa', () => {
    const tx = (r, id) => (bl(r, id) || {}).t;
    const EJC = ejemplo('**Cuento que enseña en `seguida` (Storybook)**');
    const r1 = csgLeer(EJC || '');
    ok(!!EJC && r1.clase === 'prompt' && r1.molde === 'cuento', 'lo armado para Storybook, pegado otra vez, vuelve como Prompt · Cuento que enseña', muestra(r1));
    ok(tx(r1, 'tema') === 'Un cuento que explique por qué llueve, contado por una gota de agua que tiene miedo de caer.' &&
       tx(r1, 'emociones') === 'Curiosidad al principio, un miedo que se pueda aguantar a mitad del cuento, y al final alivio y asombro.' &&
       tx(r1, 'concepto') === 'El ciclo del agua: el sol calienta el agua y la vuelve vapor; el vapor sube, se enfría y se vuelve gotitas que forman las nubes; las gotitas se juntan, pesan y caen como lluvia. Como el vapor de la olla de los frijoles, que se vuelve gotas en la tapa.' &&
       tx(r1, 'desenlace') === 'Que la última página repita la imagen de la primera, pero cambiada.' && tx(r1, 'ilustracion') === 'En acuarela, con colores suaves.',
      '… con cada texto en su bloque: «Lo que debe sentir el lector:» (seis palabras) y «Lo que el cuento explica: El ciclo del agua: …» con sus dos pares de dos puntos', muestra(r1));
    ok(ids(r1) === 'tema,audiencia,personaje,escenario,concepto,leccion,emociones,tono,desenlace,extension,ilustracion,reglas' && !r1.avisos.length && !r1.anadido.length,
      '… los doce, en su orden, sin un aviso y sin añadir nada', ids(r1) + ' · ' + JSON.stringify(r1.avisos));
    cuadra('el cuento de Storybook vuelto a pegar', EJC || '', r1);
    ok((r1.estructura || []).some(t => /^Crea un cuento ilustrado/.test(t)), 'la cabecera «Crea un cuento ilustrado con estas indicaciones.» se lee como forma, no como texto de la Tarea');

    /* ⚠️ Y en las TRES formas. Con Claude las etiquetas son los ids
       (<leccion>, <emociones>…), que fuera de un cuento no son de nadie:
       lo que dice que el texto salió de aquí es la cabecera, que el armado
       escribe ahora en las tres. Sin ella, el cuento armado para Claude
       volvía como bloques libres. */
    const CU = PIEZAS7 && PIEZAS7.CUENTO;
    if (!CU) ok(false, 'el cuento del §7 de la parte 2 está a mano', 'la parte 2 no llegó a escribirlo');
    else {
      const armarL = L('csgArmar'), defL = L('csgBloqueDef');
      const plano = t => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
      const malos = [];
      ['claude', 'chatgpt', 'storybook', 'notebooklm'].forEach(maq => {
        const txt = armarL(CU, maq).principal;
        const r = csgLeer(txt);
        const f = [];
        if (r.molde !== 'cuento') f.push('volvió como ' + r.molde);
        const esperados = CU.bloques.filter(b => String(b.t).trim()).map(b => b.id).join(',');
        if (ids(r) !== esperados) f.push('bloques ' + ids(r));
        CU.bloques.forEach(b => {
          if (!String(b.t).trim() || defL('cuento', b.id).lista) return;
          if (plano(tx(r, b.id)) !== plano(b.t)) f.push(b.id + ': ' + JSON.stringify(tx(r, b.id)).slice(0, 60));
        });
        if (r.avisos.length) f.push('avisos: ' + r.avisos.map(a => a.texto).join(' | '));
        const d = descuadre(txt, r);
        if (d) f.push(d);
        if (f.length) malos.push(maq + ': ' + f.join('; '));
      });
      ok(!malos.length, 'el cuento armado para Claude (xml), ChatGPT (md), Storybook y NotebookLM (seguida), pegado otra vez, vuelve como el MISMO cuento: cada texto en su bloque y sin un aviso', malos.join('\n'));
      /* Solo los cinco obligatorios: ninguno de sus rótulos es una señal
         por sí solo (el cuento entero trae «Desenlace», que sí lo es). */
      const MIN = Object.assign({}, CU, { bloques: CU.bloques.filter(b => ['tema', 'audiencia', 'leccion', 'emociones', 'extension'].includes(b.id)) });
      const conCab = armarL(MIN, 'claude').principal;
      const rc = csgLeer(conCab), rs = csgLeer(conCab.replace(/^Crea un cuento ilustrado con estas indicaciones\.\n\n/, ''));
      ok(rc.molde === 'cuento' && ids(rc) === 'tema,audiencia,leccion,emociones,extension', 'un cuento con solo sus cinco obligatorios, armado para Claude, vuelve como cuento: su firma es la cabecera', muestra(rc));
      ok(rs.molde !== 'cuento' && !rs.bloques.some(b => L('CSG_LEC_IDS_CUENTO').includes(b.id)) && rs.bloques.some(b => b.rotulo === 'leccion'),
        '… y sin la cabecera, unas etiquetas <leccion> y <emociones> no bastan: sin señal se quedan como bloques libres con su nombre', muestra(rs));
    }

    /* Un prompt de cuento escrito en inglés, como los que circulan. */
    const EN = 'Story idea: a shy turtle who is afraid of the sea.\nTarget age: 4-6\nProtagonist: Tuga, a small green turtle with a yellow shell.\nArt style: watercolor\nTone: gentle and warm\nLesson: being brave does not mean not being afraid.';
    const r2 = csgLeer(EN);
    ok(r2.molde === 'cuento' && tx(r2, 'tema') === 'a shy turtle who is afraid of the sea.' && tx(r2, 'audiencia') === '4-6' && !!bl(r2, 'personaje') && tx(r2, 'ilustracion') === 'watercolor' && !!bl(r2, 'tono') && !!bl(r2, 'leccion'),
      'en inglés («Story idea», «Target age», «Art style», «Lesson»): Cuento que enseña con cada cosa en su bloque', muestra(r2));
    cuadra('el cuento en inglés', EN, r2);

    /* ⚠️ LO QUE NO ES UN CUENTO SE LEE COMO ANTES DE QUE EL CUENTO EXISTIERA.
       Es lo que cazó la revisión del 26 de septiembre de 2026: con las
       claves del cuento sueltas, «Edad: 3 años» de un prompt a un pediatra
       se iba a «Audiencia», «Concepto:» se rebautizaba «Lo que el cuento
       explica» y un juego de rol se proponía como cuento para Storybook. La
       cuenta de palabras no lo ve (la palabra de la persona va a la
       estructura), así que aquí se mira también que NINGÚN rótulo ni bloque
       del cuento aparezca, y dónde se quedó cada renglón. */
    const ROTULOS_CUENTO = L('CSG_MOLDES').cuento.bloques.map(b => L('csgBloqueDef')('cuento', b.id).rotulo);
    const IDS_CUENTO = L('CSG_LEC_IDS_CUENTO');
    const sinCuento = (nombre, t, molde, dondeQueda) => {
      const r = csgLeer(t);
      /* Un rótulo del cuento que la persona NO escribió es un rebautizo
         («Concepto» → «Lo que el cuento explica»); uno que sí escribió
         («## Extensión» en un Gem) es su bloque libre, con su palabra. */
      const ajenos = r.bloques.filter(b => IDS_CUENTO.includes(b.id) || (ROTULOS_CUENTO.includes(b.rotulo) && !t.includes(b.rotulo))).map(b => b.id + '«' + b.rotulo + '»');
      const malDonde = Object.keys(dondeQueda || {}).filter(id => !(tx(r, id) || '').includes(dondeQueda[id]));
      ok(r.molde === molde && !ajenos.length && !malDonde.length, nombre + ': ' + molde + ', sin un solo bloque ni rótulo del cuento, cada renglón donde estaba',
        r.molde + ' · ajenos: ' + ajenos.join(', ') + ' · mal colocados: ' + malDonde.join(', ') + ' · ' + muestra(r));
      cuadra(nombre, t, r);
      return r;
    };
    const ped = sinCuento('un prompt a un pediatra con «Edad: 3 años»',
      'Rol: Eres un pediatra con experiencia.\nContexto: Mi hijo tiene fiebre desde ayer.\nEdad: 3 años\nPeso: 14 kg\nTarea: Dime qué señales de alarma debo vigilar.',
      'encargo', { contexto: 'Edad: 3 años' });
    ok(!bl(ped, 'audiencia') && ped.avisos.some(a => a.renglon === 3 && /«Edad:» no es un bloque; se quedó en Contexto\./.test(a.texto)),
      '… la edad del niño NO es la Audiencia (la máquina escribiría para un niño de tres años): se queda en el Contexto, nombrada', JSON.stringify(ped.avisos));
    const rol = sinCuento('un juego de rol con «Escenario:» y «Personaje:»',
      'Rol: Eres un entrevistador de recursos humanos.\nEscenario: Una entrevista para un puesto de contador junior.\nPersonaje: Te llamas Laura, eres exigente pero amable.\nTarea: Hazme las preguntas una por una y espera mi respuesta.\nFormato: Una pregunta por mensaje.',
      'encargo', { rol: 'Escenario: Una entrevista' });
    ok(!rol.avisos.some(a => /Dónde pasa|Protagonista/.test(a.texto)), '… y el aviso no sugiere un bloque del cuento («¿Querías Dónde pasa?» mandaría a colocarlo donde no va)', JSON.stringify(rol.avisos));
    sinCuento('un glosario con «Concepto:»', 'Concepto: inflación\nTarea: Explícalo con un ejemplo de la vida diaria.\nFormato: un párrafo corto.', 'rapido', { tarea: 'Concepto: inflación' });
    sinCuento('un ensayo con «Extensión: 800 palabras»',
      'Rol: Eres un profesor de historia.\nTarea: Escribe un ensayo sobre la independencia de Honduras.\nExtensión: 800 palabras\nTono: académico pero cercano\nFormato: con introducción, desarrollo y conclusión.',
      'encargo', { tarea: 'Extensión: 800 palabras' });
    sinCuento('un plan de clase («Tema», «Aprendizaje», «Concepto»)',
      'Tema: las fracciones\nAudiencia: alumnos de quinto grado\nAprendizaje: que sumen fracciones con distinto denominador\nConcepto: fracción equivalente\nTarea: Diseña una clase de 45 minutos.',
      'encargo', { audiencia: 'Aprendizaje: que sumen' });
    sinCuento('un análisis de ventas con «Setting: B2C»',
      "Role: You are a senior data analyst.\nContext: We sell shoes online.\nTask: Analyze last quarter's churn.\nSetting: B2C, Latin America.\nOutput format: a table and three bullet points.",
      'encargo', { tarea: 'Setting: B2C' });
    sinCuento('un gráfico con «Plot:»', 'Role: You are a data scientist.\nTask: Analyze the attached sales CSV.\nPlot: a bar chart of revenue by region.\nOutput format: Python code with matplotlib.', 'encargo', { tarea: 'Plot: a bar chart' });
    sinCuento('un tuit con «Characters: 280 max»', 'Task: Write a tweet announcing our new app.\nCharacters: 280 max\nTone: playful', 'encargo', { tarea: 'Characters: 280 max' });
    sinCuento('un guion de video con «Personajes:» y «Escenario:»',
      'Tarea: Escribe el guion de un video de YouTube sobre ahorro.\nPersonajes: Ana (mamá) y Luis (hijo adolescente)\nEscenario: la cocina de la casa\nTono: divertido\nDuración: 3 minutos',
      'encargo', { tarea: 'Personajes: Ana' });
    sinCuento('un anuncio en CO-STAR con «Emociones:» y «Extensión:»',
      'Contexto: Lanzamos un café artesanal en Tegucigalpa.\nObjetivo: Escribir un anuncio para Instagram.\nEstilo: publicitario\nTono: cálido\nAudiencia: jóvenes profesionales\nEmociones: nostalgia y calidez\nExtensión: 80 palabras\nFormato: un párrafo y tres hashtags',
      'costar', { objetivo: 'Escribir un anuncio', audiencia: 'Emociones: nostalgia' });
    sinCuento('un cliente difícil con «Edad: 60 años»',
      'Rol: Vas a interpretar a un cliente difícil para que yo practique ventas.\nNombre: Don Ramón\nEdad: 60 años\nPersonalidad: desconfiado, pregunta mucho por el precio\nTarea: Empieza tú la conversación.', 'encargo');
    sinCuento('el análisis de una película con su «Desenlace:» (una señal, pero no un encargo de cuento)',
      'Tarea: Analiza la película Coco para una clase.\nPersonajes: Miguel y Héctor.\nDesenlace: la familia lo perdona.', 'rapido', { tarea: 'Desenlace: la familia' });
    sinCuento('un cuento pedido en inglés SIN ninguna señal (se queda entero, como antes)',
      "Write a children's story.\nMain character: Leo, a shy lion cub.\nSetting: the savanna at dawn.\nLesson: being brave means being scared and doing it anyway.\nTarget age: 4-6\nArt style: watercolor\nPages: 10", 'libre');
    /* La mudanza de la Tarea al Tema es SOLO del cuento: en un Voz prestada
       la Tarea se queda donde se leía antes de que el cuento existiera. */
    sinCuento('un Voz prestada con su Tarea (fuera del cuento, la Tarea no se muda al Tema)',
      'Voz: Juan Rulfo, frases cortas.\nGénero: cuento\nTarea: escribe sobre la lluvia en Comala.', 'voz', { tarea: 'escribe sobre la lluvia' });
    const gem = sinCuento('las instrucciones de un Gem que cuenta cuentos (Identidad, Misión, Nunca y debajo Personajes, Escenario, Extensión)',
      '## Identidad\nEres Abuela Cuentacuentos.\n\n## Misión\nContar un cuento corto cada noche.\n\n## Nunca\nAsustes de más.\n\n## Personajes\nAnimales del monte.\n\n## Escenario\nUna aldea de Copán.\n\n## Extensión\nCinco minutos leídos.', 'sistema');
    ok(gem.clase === 'habilidad' && tx(gem, 'nunca') === 'Asustes de más.', '… sigue siendo una Habilidad · Instrucción de sistema, con su «Nunca» en su sitio', muestra(gem));
    const gemM = csgLeer('## Identidad\nEres Abuela Cuentacuentos.\n\n## Misión\nContar un cuento.\n\n## Nunca\nAsustes de más.\n\n## Personajes\nAnimales.\n\n## Moraleja\nCompartir alegra.');
    ok(gemM.molde === 'sistema', 'y con una «Moraleja» también: los bloques del cuento no votan la clase, y una Instrucción no pasa a ser un prompt', muestra(gemM));
    ok(L('csgLecClaseVotada')(['identidad', 'mision', 'nunca', 'personaje', 'escenario', 'extension', 'leccion']) === 'habilidad',
      'csgLecClaseVotada: cuatro bloques del cuento no le ganan a tres de sistema');
    const xa = csgLeer('<concepto>inflación</concepto>\n<tarea>Explícalo con un ejemplo.</tarea>');
    ok(xa.molde === 'rapido' && bl(xa, 'tarea') && xa.bloques.some(b => b.rotulo === 'concepto' && b.t === 'inflación') && !xa.bloques.some(b => b.rotulo === 'Lo que el cuento explica'),
      'una etiqueta <concepto> en un prompt que no es un cuento es un bloque libre con su nombre, no «Lo que el cuento explica» (la guarda va antes de buscar el id en el vocabulario)', muestra(xa));
    const nu = csgLeer('Tarea: Resume el artículo.\nNunca: uses jerga técnica.\nFormato: tres viñetas.');
    ok(nu.molde === 'rapido' || nu.molde === 'encargo', 'un prompt con «Nunca:» sigue siendo un prompt', nu.molde);
    ok(!bl(nu, 'reglas') && tx(nu, 'nunca') === 'uses jerga técnica.' && nu.bloques.find(b => b.id === 'nunca').rotulo === 'Nunca',
      '«Nunca: uses jerga técnica.» NO se muda a Reglas, donde se leería «uses jerga técnica.» (lo contrario): se queda como «Nunca», que es la regla', muestra(nu));

    /* Y lo que SÍ es un cuento, escrito como lo escribe la gente. */
    const fab = csgLeer('Escribe una fábula para niños.\nGénero: fábula\nPersonajes: un zorro y un cuervo\nMoraleja: no te fíes de los aduladores\nEdad: 6 años');
    ok(fab.molde === 'cuento' && tx(fab, 'tema') === 'Escribe una fábula para niños.' && tx(fab, 'personaje') === 'un zorro y un cuervo' && /^no te fíes de los aduladores/.test(tx(fab, 'leccion')),
      'una fábula con su «Moraleja»: Cuento que enseña, con lo pedido en el Tema y los personajes en su bloque', muestra(fab));
    ok(fab.avisos.some(a => a.renglon === 1 && /lo que venía sin rótulo se leyó como «Tema de la historia»/.test(a.texto)) && fab.avisos.some(a => a.renglon === 5 && /«Edad:» no es un bloque/.test(a.texto)),
      '… y se dice: lo que venía sin rótulo pasó al Tema (sin llamarlo «Tarea», que nadie escribió), y la «Edad» —¿del lector o del zorro?— se nombra y se queda', JSON.stringify(fab.avisos));
    ok(!bl(fab, 'extension') && tx(fab, 'genero') === 'fábula', '«Género: fábula» NO se muda a la Extensión (una es qué es y la otra cuánto mide): se queda como Género', muestra(fab));
    /* csgPegPieza no es el lector: nace con la máquina del aparato (lee el
       almacén), así que su toque no cuenta en «el lector no tocó nada». */
    const toquesAntes = SL.toques.length;
    const fabP = L('csgPegPieza')(fab);
    SL.toques.length = toquesAntes;
    ok(fabP.bloques.find(b => b.id === 'extension').t === L('csgBloqueDef')('cuento', 'extension').inicial,
      '… y la Extensión del cuento conserva sus diez páginas, que la fábula ya no pisa');
    const est = csgLeer('Crea un cuento sobre el ciclo del agua.\nProtagonista: Gotita, una gota curiosa.\nMoraleja: todo vuelve.\nEstilo: acuarela suave.');
    ok(est.molde === 'cuento' && tx(est, 'estilo') === 'acuarela suave.' && !bl(est, 'tono'),
      'en un cuento, «Estilo: acuarela suave» se queda como «Estilo» y no va a «Cómo se cuenta» (puede ser el de los dibujos o el de la voz)', muestra(est));
    const tem = csgLeer('Tema: el ciclo del agua\nEdad: 6 años\nMoraleja: el agua que usamos vuelve');
    ok(tem.molde === 'cuento' && /^el ciclo del agua/.test(tx(tem, 'tema')) && tx(tem, 'leccion') === 'el agua que usamos vuelve', '«Tema / Edad / Moraleja»: Cuento que enseña', muestra(tem));
    const vet = csgLeer('Rol: Eres un cuentacuentos.\nTarea: Escribe un cuento de un conejo.\nProtagonista: Toto\nMoraleja: lavarse las manos protege.\nFormato: 300 palabras.');
    ok(vet.molde === 'encargo' && /Protagonista: Toto\nMoraleja: lavarse/.test(tx(vet, 'tarea')) && !bl(vet, 'leccion') && !bl(vet, 'personaje'),
      'con un «Rol» y un «Formato» es un prompt para un chat: Encargo, y el protagonista y la moraleja se quedan en su Tarea como antes (se cambia de un toque si era un cuento)', muestra(vet));
    cuadra('la fábula', 'Escribe una fábula para niños.\nGénero: fábula\nPersonajes: un zorro y un cuervo\nMoraleja: no te fíes de los aduladores\nEdad: 6 años', fab);

    const voz = csgLeer('Voz: Juan Rulfo, frases cortas y pueblo seco.\nTema: un pueblo que espera la lluvia.\nProtagonista: una niña que cuenta los días.\nMoraleja: la paciencia también cansa.');
    ok(voz.molde === 'voz', 'con una voz que imitar es Voz prestada aunque traiga protagonista y moraleja: lo suyo va a La Voz Prestada con la etiqueta', voz.molde);
    const P = L('csgProponerMolde');
    ok(P('prompt', ['tema', 'leccion'], null, true) === 'cuento' && P('prompt', ['tarea', 'leccion'], null, true) === 'cuento' &&
       P('prompt', ['tema', 'audiencia', 'leccion', 'emociones', 'extension']) !== 'cuento' &&
       P('prompt', ['leccion'], null, true) !== 'cuento' && P('prompt', ['personaje', 'escenario', 'desenlace'], null, true) !== 'cuento' &&
       P('prompt', ['tema', 'audiencia', 'rol'], null, true) !== 'cuento' && P('prompt', ['tema', 'audiencia', 'objetivo'], null, true) === 'costar' &&
       P('prompt', ['tema', 'leccion', 'formato'], null, true) !== 'cuento' && P('prompt', ['personaje', 'leccion', 'etiqueta'], null, true) === 'voz',
      'csgProponerMolde: con la señal, dos obligatorios (una Tarea cuenta como el Tema) → cuento; sin la señal, nunca; con Rol, Objetivo o Formato, no; con la etiqueta de la casa, Voz prestada');

    /* «Final:» no es un rótulo: es el «Fin» de un bucle dicho de otra
       manera, y ascenderlo partiría la consigna en un bloque que no es suyo. */
    const bu = csgLeer('Para cuando el crítico diga APROBADO.\nMáximo 3 vueltas.\nFinal: entrega la versión aprobada.');
    ok(!bl(bu, 'desenlace') && !r1.bloques.some(b => b.id === 'final') && !bu.bloques.some(b => b.id === 'final') && /Final: entrega la versión aprobada\./.test(bu.bloques.map(b => b.t).join('\n')),
      '«Final: …» se queda como texto donde estaba: ni `final` ni `desenlace`', muestra(bu));
    ok(SL.toques.length === 0, 'y el lector del cuento no tocó el navegador', SL.toques.slice(0, 5).join(', '));
  });
}

function parte5() {
  parte(5, 'El repaso: lo que PARA, lo que AVISA, y en cada tecla');
  const L = SL.L;
  const csgRevisar = L('csgRevisar');
  const pieza = (molde, bloques, extra) => Object.assign({ id: 'csg-prueba', clase: L('CSG_MOLDES')[molde].clase, molde, titulo: 'Prueba', maquina: 'claude', bloques: Object.keys(bloques).map(id => ({ id, rotulo: id, t: bloques[id] })), material: '' }, extra || {});
  const hay = (lista, re, bloque) => lista.some(x => re.test(x.msg) && (bloque === undefined || x.bloque === bloque));
  /* csgVivas lee la lista del aparato: para el aviso del título repetido
     se le pone una a mano. */
  const ponerVivas = lista => vm.runInContext('_csgLista = ' + JSON.stringify(lista), SL.ctx);

  seccion('5.1 Lo que PARA', () => {
    const r = csgRevisar(pieza('rapido', { tarea: '', formato: 'Lista.' }), 'claude');
    const t = r.para.find(x => x.bloque === 'tarea');
    ok(!!t && /Falta «Tarea»/.test(t.msg) && t.arreglo && t.arreglo.tipo === 'ir' && t.arreglo.bloque === 'tarea', 'obligatorio vacío: PARA nombrándolo, con un toque que lleva a él', JSON.stringify(r.para));
    const h = csgRevisar(pieza('rapido', { tarea: 'Resume {{}} y {{nombre del autor}} y {{bien}}.' }), 'claude');
    ok(hay(h.para, /sin nombre/, 'tarea'), '«{{}}»: PARA', JSON.stringify(h.para));
    const hm = h.para.find(x => /nombre del autor/.test(x.msg));
    ok(!!hm && hm.arreglo.tipo === 'hueco' && hm.arreglo.de === '{{nombre del autor}}' && hm.arreglo.a === '{{nombre_del_autor}}' && !h.para.some(x => /\{\{bien\}\}/.test(x.msg)),
      '«{{nombre del autor}}» no se puede rellenar: PARA con su arreglo; «{{bien}}» no', JSON.stringify(hm));
    const b = csgRevisar(pieza('hasta', { paso: 'Escribe.', parada: 'Para cuando rime.', tope: '', salida: 'La final.' }), 'claude');
    ok(hay(b.para, /sin tope no se puede usar/i, 'tope'), 'bucle sin tope: PARA', JSON.stringify(b.para));
    const bc = csgRevisar(pieza('careo', { postura_a: 'A.', postura_b: 'B.', juez: 'J.', tope: '', etiqueta: 'E.' }), 'claude');
    ok(hay(bc.para, /«Rondas»: sin tope/, 'tope'), '  y en el Careo lo llama por su rótulo, «Rondas»', JSON.stringify(bc.para));
    const nodos = 'Investigador: recibe el tema, entrega fuentes.\nGuionista: recibe las fuentes, entrega el guion.\nVerificador: recibe el guion, entrega lo que no cuadra.\nEditor: recibe todo, entrega la versión final.';
    const g1 = csgRevisar(pieza('cadena', { meta: 'Un video.', nodos, aristas: 'Investigador → Guionista.\nGuionista → Revisor.\nEditor → FIN.', fin: 'Termina al entregar.' }), 'claude');
    ok(hay(g1.para, /va a «Revisor», que no está/, 'aristas') && !hay(g1.para, /FIN/), 'arista a un nodo que no existe: PARA nombrándolo; FIN existe siempre', JSON.stringify(g1.para));
    const g0 = csgRevisar(pieza('cadena', { meta: 'Un video.', nodos, aristas: 'Investigadr → Guionista.\nEditor → FIN.', fin: 'Termina al entregar.' }), 'claude');
    ok(hay(g0.para, /sale de «Investigadr», que no está/, 'aristas') && !hay(g0.para, /va a «Guionista»/),
      'una arista que SALE de un nodo mal escrito se nombra por su origen, y no se acusa al destino, que sí existe', JSON.stringify(g0.para));
    const g2 = csgRevisar(pieza('cadena', { meta: 'Un video.', nodos, aristas: 'Investigador → Guionista.\nGuionista → Verificador.\nVerificador → Guionista si hay citas malas; si no → Editor.\nEditor → FIN.', fin: 'Termina cuando el Verificador no encuentra citas malas.' }), 'claude');
    const vu = g2.para.find(x => /vuelve atrás/.test(x.msg));
    ok(!!vu && vu.arreglo.tipo === 'frase' && vu.arreglo.bloque === 'fin' && /vueltas/.test(vu.arreglo.texto), 'arista de vuelta sin tope ni en la arista ni en Fin: PARA, con la frase de Fin que lo arregla', JSON.stringify(g2.para));
    const g3 = csgRevisar(pieza('cadena', { meta: 'Un video.', nodos, aristas: 'Investigador → Guionista.\nGuionista → Verificador.\nVerificador → Guionista si hay citas malas (máximo 2 vueltas); si no → Editor.\nEditor → FIN.', fin: 'Termina al entregar.' }), 'claude');
    const g4 = csgRevisar(pieza('cadena', { meta: 'Un video.', nodos, aristas: 'Investigador → Guionista.\nVerificador → Guionista si hay citas malas; si no → Editor.', fin: 'Termina cuando no haya citas malas, o a la segunda vuelta.' }), 'claude');
    const g5 = csgRevisar(pieza('cadena', { meta: 'Un video.', nodos, aristas: 'Verificador → Guionista si falla.', fin: vu ? vu.arreglo.texto : '' }), 'claude');
    ok(!hay(g3.para, /vuelve atrás/) && !hay(g4.para, /vuelve atrás/) && !hay(g5.para, /vuelve atrás/), '  con «máximo 2 vueltas» en la arista, con «a la segunda vuelta» en Fin, o con la frase del arreglo puesta, ya no', JSON.stringify([g3.para, g4.para, g5.para]));
    const s = (nombre, desc) => csgRevisar(pieza('skill', { nombre, disparador: desc, pasos: '1. Lee.\n2. Corrige.', comprobacion: '- Nada cambiado.' }), 'claude');
    const s1 = s('Corrector Revista', 'Corrige notas. Úsala cuando pidan «corrige».');
    const sn = s1.para.find(x => x.bloque === 'nombre');
    ok(!!sn && sn.arreglo.tipo === 'hueco' && sn.arreglo.a === 'corrector-revista', 'name con mayúscula: PARA, y propone «corrector-revista»', JSON.stringify(s1.para));
    ok(hay(s('a'.repeat(65), 'x').para, /65 caracteres/, 'nombre') && !hay(s('a'.repeat(64), 'x').para, /name/, 'nombre') && !hay(s('corregir-{{que}}', 'x').para, /name/, 'nombre'),
      'name de 65: PARA; de 64: no; con un {{hueco}} dentro: no (se rellena al usar)');
    ok(hay(s('ok', 'd'.repeat(1025)).para, /1\.025 caracteres/, 'disparador') && !hay(s('ok', 'd'.repeat(1024)).para, /description/, 'disparador') && hay(s('ok', '').para, /Falta «Descripción y disparador/, 'disparador'),
      'description de 1.025: PARA; de 1.024: no; vacía: PARA por obligatoria');
    const e1 = csgRevisar(pieza('ejemplos', { tarea: 'Convierte.', ejemplos: 'Harari 2014 → (Harari, 2014)\nAsí NO: {{malo}}', caso: 'Ahora tú.' }), 'claude');
    const e2 = csgRevisar(pieza('ejemplos', { tarea: 'Convierte.', ejemplos: 'Harari 2014 → (Harari, 2014)\nBID 2023 -> (BID, 2023)', caso: 'Ahora tú.' }), 'claude');
    ok(hay(e1.para, /al menos dos pares/, 'ejemplos') && !hay(e2.para, /pares/), 'Con ejemplos con un solo par: PARA; con dos, no', JSON.stringify(e1.para));
    /* El repaso cuenta como pares exactamente los renglones que el armado
       PINTA como <ejemplo>: los dos le preguntan a csgArmPar. Con dos copias
       de la regla no casaban en «1) → b». */
    const RAROS = ['1) → b', '- → b', 'a->b', 'a -> b', 'a  →  b', '→ b', 'a →', '* a → b', '• a → b', '· a → b', 'a --> b', '  - a → b', '2. x -> y', '- - a → b'];
    const desacuerdos = RAROS.filter(r0 => {
      const rep = csgRevisar(pieza('ejemplos', { tarea: 'T.', ejemplos: r0 + '\n' + r0, caso: 'C.' }), 'claude');
      const repasoVeDos = !rep.para.some(x => /al menos dos pares/.test(x.msg));
      const pintados = (L('csgArmar')(pieza('ejemplos', { ejemplos: r0 + '\n' + r0 }), 'claude', {}, {}).principal.match(/<ejemplo>/g) || []).length;
      return repasoVeDos !== (pintados === 2);
    });
    ok(!desacuerdos.length, 'el repaso cuenta como pares justo los renglones que el armado pinta como <ejemplo> (' + RAROS.length + ' renglones raros)', desacuerdos.join(' | '));
    const big = csgRevisar(pieza('libre', { texto: 'x'.repeat(60001) }), 'claude');
    ok(hay(big.para, /No cabe en la nube: recorta \d/), 'bloques que no caben en la nube: PARA con lo que sobra', JSON.stringify(big.para));
    const nb = csgRevisar(pieza('fuentes', { pregunta: '¿Qué se sabe?', fuentes: '', citas: 'Cada dato con su dirección.', formato: 'Ensayo.' }), 'notebooklm');
    ok(!hay(nb.para, /Fuentes permitidas/), 'en NotebookLM, Investigación sin Fuentes no para: el armado pone «Usa solo las fuentes del cuaderno.»', JSON.stringify(nb.para));
  });

  seccion('5.2 Lo que AVISA', () => {
    const sf = csgRevisar(pieza('rapido', { tarea: 'Resume el informe de la OCDE.', formato: '' }), 'claude');
    ok(hay(sf.avisa, /Sin «Formato de salida»/, 'formato') && !sf.para.length, 'sin Formato: AVISA (y no para)', JSON.stringify(sf));
    ok(!hay(csgRevisar(pieza('ejemplos', { tarea: 'Convierte.', ejemplos: 'a → b\nc → d', caso: 'Ahora.' }), 'claude').avisa, /Sin «Formato/), '  en Con ejemplos no: allí los ejemplos son el formato');
    /* Solo cuentan los bloques que tienen que decir algo de ESTA pieza
       (CSG_REV_PROPIOS): unas Reglas, un Formato o un Tono de chip son
       genéricos a propósito, y avisar de ellos saltaba en las piezas
       modelo del propio §7 (la sección 5.6 lo comprueba con ellas). */
    const fh = csgRevisar(pieza('encargo', { rol: 'Eres un editor de textos en español, riguroso con las fuentes.', contexto: 'El texto es mío; puedes ser duro.', tarea: 'Reescribe el arranque de la nota sobre la memoria.', formato: 'En una lista de puntos, sin introducción ni despedida.', tono: 'Directo y sin adornos.\nCercano, tuteando, sin condescender.', reglas: '- No inventes datos; si no lo sabes, dilo.' }), 'claude');
    const fa = fh.avisa.filter(x => /frases hechas/.test(x.msg));
    ok(fa.length === 1 && /«Rol», «Contexto» están hechos/.test(fa[0].msg) && !/Tarea|Reglas|Formato|Tono/.test(fa[0].msg),
      'bloques propios hechos solo de frases hechas: UN aviso con todos (Rol y Contexto, en el orden del molde); ni la Tarea escrita a mano ni las Reglas, el Formato o el Tono de chip', JSON.stringify(fa));
    ok(!csgRevisar(pieza('rapido', { tarea: 'Resume {{texto}} en diez puntos, uno por renglón.', formato: 'Lista.' }), 'claude').avisa.some(x => /frases hechas/.test(x.msg)), '  una frase con {{hueco}} no cuenta: se rellena con algo de esta pieza');
    const dc = csgRevisar(pieza('encargo', { tarea: 'Resume.', formato: 'Lista.', contexto: 'Llama al +504 9876-5432 o escribe a jose.polanco@correo.hn; los datos son de 2015-2024 y del 2026-09-22. Pregúntale a Evelyn.' }), 'claude');
    const tel = dc.avisa.find(x => /un teléfono/.test(x.msg));
    const mail = dc.avisa.find(x => /un correo/.test(x.msg));
    const nom = dc.avisa.find(x => /un nombre de la casa/.test(x.msg));
    ok(!!tel && tel.arreglo.tipo === 'hueco' && tel.arreglo.de === '+504 9876-5432' && tel.arreglo.a === '{{telefono}}', 'teléfono: AVISA con su arreglo a {{telefono}}', JSON.stringify(dc.avisa));
    ok(!!mail && mail.arreglo.de === 'jose.polanco@correo.hn' && mail.arreglo.a === '{{correo}}', 'correo: AVISA con su arreglo a {{correo}}');
    ok(!!nom && nom.arreglo.de === 'Evelyn' && nom.arreglo.a === '{{nombre}}', 'nombre de MIEMBROS: AVISA con su arreglo a {{nombre}}');
    ok(dc.avisa.filter(x => /teléfono/.test(x.msg)).length === 1, '  y «2015-2024» o «2026-09-22» no se toman por teléfonos', JSON.stringify(dc.avisa.filter(x => /teléfono/.test(x.msg))));
    const DC = L('csgDatosDeCasa');
    ok(JSON.stringify(DC('Josué Edmundo lo firma; josue también.')) === JSON.stringify([{ tipo: 'nombre', trozo: 'Josué Edmundo' }, { tipo: 'nombre', trozo: 'josue' }]), 'csgDatosDeCasa: el nombre entero es un aviso, no dos; y sin tilde también casa', JSON.stringify(DC('Josué Edmundo lo firma; josue también.')));
    /* El nombre DENTRO de un correo (o de una dirección) no es un nombre
       suelto: su chip partía el correo en «{{nombre}}@correo.com». */
    const enCorreo = DC('Manda el resumen a josue@correo.com y a https://ejemplo.org/evelyn hoy.');
    ok(JSON.stringify(enCorreo) === JSON.stringify([{ tipo: 'correo', trozo: 'josue@correo.com' }]), 'csgDatosDeCasa: el nombre dentro de un correo o de una dirección no sale como nombre de la casa', JSON.stringify(enCorreo));
    const inv = b => pieza('fuentes', Object.assign({ pregunta: '¿Qué efecto tuvo la jornada extendida?', fuentes: 'Solo informes de organismos.', formato: 'Ensayo.' }, b));
    const px = csgRevisar(inv({ citas: 'Cada dato con (Autor, año, página) pegado a la frase.' }), 'perplexity');
    const pa = px.avisa.find(x => /Perplexity/.test(x.msg));
    ok(!!pa && pa.arreglo.tipo === 'frase' && pa.arreglo.bloque === 'citas' && /dirección/.test(pa.arreglo.texto), 'Perplexity sin dirección en Citas: AVISA con la frase que la pide', JSON.stringify(px.avisa));
    ok(!hay(csgRevisar(inv({ citas: 'Cada dato con su dirección.' }), 'perplexity').avisa, /Perplexity/) && !hay(csgRevisar(inv({ citas: 'Cada dato con (Autor, año).' }), 'claude').avisa, /Perplexity/),
      '  con dirección, no; y en Claude, no');
    const nl = csgRevisar(pieza('rapido', { tarea: 'Resume <tarea>esto</tarea>.', formato: 'Lista.' }), 'notebooklm');
    ok(hay(nl.avisa, /«<tarea>»/, 'tarea') && !hay(csgRevisar(pieza('rapido', { tarea: 'Resume <tarea>esto</tarea>.', formato: 'Lista.' }), 'claude').avisa, /NotebookLM/), 'NotebookLM con <tarea> dentro: AVISA; en Claude, no', JSON.stringify(nl.avisa));
    const largo = Array.from({ length: 1600 }, (x, i) => 'palabra' + i).join(' ');
    const l1 = csgRevisar(pieza('libre', { texto: largo }), 'claude');
    const l2 = csgRevisar(pieza('libre', { texto: 'Resume lo de abajo.' }, { material: largo }), 'claude');
    ok(hay(l1.avisa, /pasa de 1\.500 palabras/) && !hay(l2.avisa, /1\.500 palabras/) && l2.palabras > 1500, 'más de 1.500 palabras: AVISA; y el material no cuenta para el aviso (sí para la cuenta)', JSON.stringify([l1.avisa, l2.palabras]));
    ponerVivas([{ id: 'otra-1', titulo: 'Resumen de informe', eliminado: false }, { id: 'retirada', titulo: 'Borrada', eliminado: true }]);
    const tr = csgRevisar(pieza('rapido', { tarea: 'Resume.', formato: 'Lista.' }, { titulo: '  resumen DE INFORME ' }), 'claude');
    const ta = tr.avisa.find(x => /Ya hay otra consigna/.test(x.msg));
    ok(!!ta && ta.arreglo.tipo === 'abrir' && ta.arreglo.id === 'otra-1' && !hay(csgRevisar(pieza('rapido', { tarea: 'R.', formato: 'L.' }, { titulo: 'Borrada' }), 'claude').avisa, /Ya hay otra/),
      'mismo título normalizado que otra pieza viva: AVISA con el enlace a abrirla; con una retirada, no', JSON.stringify(tr.avisa));
    ponerVivas([]);
    const vc = csgRevisar(pieza('rapido', { tarea: 'Escribe sobre {{Tema}} para {{publico}}.', formato: 'Sobre {{tema}}.' }), 'claude');
    const va = vc.avisa.find(x => /misma variable/.test(x.msg));
    ok(!!va && va.arreglo.tipo === 'hueco' && va.arreglo.de === '{{tema}}' && va.arreglo.a === '{{Tema}}', 'variable repetida con otra mayúscula: AVISA con su arreglo', JSON.stringify(vc.avisa));
    const ps = csgRevisar(pieza('receta', { disparador: 'Cada vez que pegue un texto.', pasos: 'Corriges ortografía.\n2. Señalas estilo.', comprobacion: 'Nada cambiado.' }), 'claude');
    ok(hay(ps.avisa, /un paso sin número/, 'pasos'), 'pasos sin numerar en una habilidad: AVISA', JSON.stringify(ps.avisa));
    const lo = csgRevisar(pieza('lotes', { lista: 'Los elementos van abajo, entre las marcas ===.', paso: 'Para cada uno: tres preguntas.', tope: 'Un elemento por vuelta.', salida: 'Todo junto.' }), 'claude');
    const lo2 = csgRevisar(pieza('lotes', { lista: 'Los elementos van abajo, entre las marcas ===.', paso: 'P.', tope: 'T.', salida: 'S.' }, { material: 'Fracciones\nDecimales\n\nPorcentajes' }), 'claude');
    ok(hay(lo.avisa, /Material está vacío/, 'lista') && !hay(lo2.avisa, /Material/) && lo2.elementos === 3, 'Por lotes con la lista remitiendo al Material vacío: AVISA; con Material, cuenta sus 3 elementos', JSON.stringify([lo.avisa, lo2.elementos]));
    const sano = csgRevisar(pieza('encargo', { rol: 'Eres el editor de la revista de la casa, con dos décadas de oficio.', tarea: 'Reescribe el arranque de la nota de octubre.', formato: 'El párrafo y debajo los cambios.' }), 'claude');
    ok(!sano.para.length && !sano.avisa.length, 'una pieza sana no para ni avisa de nada', JSON.stringify(sano));
  });

  seccion('5.3 Palabras, tokens y si cabe en la dirección', () => {
    const p = pieza('rapido', { tarea: 'Resume el informe en diez puntos.', formato: 'Lista numerada.' });
    const c = csgRevisar(p, 'claude');
    ok(c.palabras >= 8 && c.tokens === Math.round(c.palabras * 1.4) && c.cabe === true, 'corta en Claude: cuenta sus palabras, tokens a ojo (×1,4) y cabe en la dirección', JSON.stringify({ palabras: c.palabras, tokens: c.tokens, cabe: c.cabe }));
    ok(csgRevisar(p, 'gemini').cabe === false && csgRevisar(p, 'otra').cabe === false && csgRevisar(p, 'chatgpt').cabe === true, 'en Gemini y en Otra nunca cabe (se abren sin texto); en ChatGPT sí');
    const n = L('csgArmar')(p, 'claude', {}, {}).principal.length;
    const hasta = s => pieza('libre', { texto: s });
    /* Lo que el armado pone alrededor del texto se mide una vez: con letras
       sin codificar, cada una más es un carácter más en la dirección. */
    const sobra = encodeURIComponent(L('csgArmar')(hasta('a'), 'claude', {}, {}).principal).length - 1;
    const s = 'a'.repeat(1500 - sobra);
    const justo = csgRevisar(hasta(s), 'claude'), pasa = csgRevisar(hasta(s + 'ñ'), 'claude');
    ok(justo.cabe === true && pasa.cabe === false, 'la frontera: ' + encodeURIComponent(L('csgArmar')(hasta(s), 'claude', {}, {}).principal).length + ' codificados cabe; uno más, no (una «ñ» son seis)', n);
    const sk = csgRevisar(pieza('skill', { nombre: 'corregir-notas', disparador: 'Corrige notas.', pasos: '1. Lee.', comprobacion: '- Nada.' }), 'claude');
    ok(sk.palabras > 0, 'en un SKILL.md cuenta el archivo (principal)', JSON.stringify(sk));
  });

  seccion('5.4 El repaso no revienta con piezas rotas', () => {
    const raras = [null, {}, { molde: 'no-existe', bloques: [{ id: 'x', rotulo: 'X', t: 'y' }] }, { molde: 'rapido', bloques: 'no es una lista' }, { molde: 'cadena', bloques: [{ id: 'aristas', t: 'A → → B\n→\n; si no → ' }, { id: 'nodos', t: ':' }] }, { molde: 'toString', bloques: [] }];
    let rota = '';
    raras.forEach(p => { try { const r = csgRevisar(p, 'claude'); if (!Array.isArray(r.para) || !Array.isArray(r.avisa) || typeof r.palabras !== 'number' || typeof r.cabe !== 'boolean') rota += JSON.stringify(p) + ' → ' + JSON.stringify(r) + '; '; } catch (e) { rota += JSON.stringify(p) + ': ' + e.message + '; '; } });
    ok(!rota, 'null, vacía, molde desconocido, bloques que no son lista, aristas rotas, molde «toString»: devuelve su forma sin reventar', rota);
    ok(SL.toques.length === 0, 'y ni el lector ni el repaso tocaron el navegador en toda la parte 4 y la 5', SL.toques.slice(0, 5).join(', '));
  });

  seccion('5.5 Un texto largo no congela el repaso (corre en cada tecla)', () => {
    /* Medido, no supuesto: la primera versión del correo tardaba tres
       segundos en un renglón de 60.000 letras sin @. Cada forma de abajo es
       una manera de que una expresión regular vuelva atrás desde cada
       carácter; el tope es holgado a propósito (la avería daba 3.000 ms). */
    const csgLeer = L('csgLeer');
    const TOPE = 400;
    const formas = [
      ['60.000 letras sin @', 'x'.repeat(60000)],
      ['60.000 cifras', '1'.repeat(60000)],
      ['30.000 palabras cortas', 'a '.repeat(30000)],
      ['un encabezado con 60.000 espacios', '# ' + ' '.repeat(60000) + 'x'],
      ['60.000 espacios antes de unos dos puntos', 'Tarea' + ' '.repeat(60000) + ':'],
      ['{{ sin cerrar y 60.000 letras', '{{' + 'x'.repeat(60000)],
      ['< sin cerrar', '<a '.repeat(20000)],
      ['5.000 renglones de bucle', 'Máximo 3 vueltas.\nPara cuando rime.\n'.repeat(2500)],
      /* Mil y no cinco mil: casar cada destino con los nombres de todos los
         nodos es O(aristas × nodos) dentro de csgAristas, y eso es su
         diseño, sensato para los diez nodos de un grafo de verdad. Lo que se
         vigila aquí es que el repaso no lo MULTIPLIQUE llamándolo una vez
         por renglón, que es lo que hacía (cuarenta segundos con 5.000). */
      ['1.000 aristas encadenadas', Array.from({ length: 1000 }, (x, i) => 'N' + i + ' → N' + (i + 1)).join('\n')],
      ['una arista con 60.000 letras detrás', 'Investigador → Guionista si ' + 'x '.repeat(30000)],
      ['5.000 rótulos que no se entienden', 'Contexto: x\n' + 'Notas: y\n'.repeat(5000)],
      /* Con una señal de cuento, csgLeer lee DOS veces (la segunda con los
         rótulos del cuento): el reloj tiene que medir también ese camino. */
      ['una moraleja y 5.000 rótulos del cuento (las dos vueltas)', 'Tema: el agua\nMoraleja: vuelve\n' + 'Protagonista: y\nNotas: z\n'.repeat(2500)],
      ['la cabecera del cuento y 30.000 palabras', 'Crea un cuento ilustrado con estas indicaciones.\n\nTema de la historia: ' + 'a '.repeat(30000)],
    ];
    const lentos = [];
    formas.forEach(([nombre, t]) => {
      let t0 = Date.now(); const r = csgLeer(t); const tl = Date.now() - t0;
      t0 = Date.now(); csgRevisar({ id: 'x', clase: r.clase, molde: r.molde, titulo: 't', bloques: r.bloques, material: '' }, 'claude'); const tr = Date.now() - t0;
      t0 = Date.now(); csgRevisar({ id: 'x', clase: 'prompt', molde: 'libre', titulo: 't', bloques: [{ id: 'texto', rotulo: 'Texto', t }], material: '' }, 'notebooklm'); const tr2 = Date.now() - t0;
      if (Math.max(tl, tr, tr2) > TOPE) lentos.push(nombre + ': leer ' + tl + ' ms, repasar ' + tr + ' / ' + tr2 + ' ms');
    });
    ok(!lentos.length, 'las ' + formas.length + ' formas de texto largo, dos con las dos vueltas del cuento: leer y repasar cada una en menos de ' + TOPE + ' ms', lentos.join('\n'));
    /* Y un renglón de Ejemplos con una racha de espacios y sin flecha: ahí
       mira csgArmPar, que el repaso y el armado comparten, y con una
       expresión `\s+(→|->)\s+` eran segundos. */
    const t0 = Date.now();
    csgRevisar({ id: 'x', clase: 'prompt', molde: 'ejemplos', titulo: 't', bloques: [{ id: 'tarea', t: 'Convierte.' }, { id: 'ejemplos', t: 'a' + ' '.repeat(60000) + 'b\nc → d' }, { id: 'caso', t: 'Ahora.' }], material: '' }, 'claude');
    const tEj = Date.now() - t0;
    ok(tEj <= TOPE, 'un renglón de Ejemplos con 60.000 espacios y sin flecha se repasa y se arma en menos de ' + TOPE + ' ms (' + tEj + ' ms)');
    /* Y el repaso del Cuento que enseña, que mira la edad, las páginas y
       si el tema dice que explica: con 60.000 letras seguidas, con 30.000
       palabras cortas y con 60.000 espacios en cada uno de sus bloques. */
    const lentosC = [];
    [['60.000 letras', 'x'.repeat(60000)], ['30.000 palabras', 'a '.repeat(30000)], ['60.000 espacios', ' '.repeat(60000) + 'páginas'], ['30.000 «páginas»', 'páginas '.repeat(30000)]].forEach(([nombre, t]) => {
      const t0c = Date.now();
      csgRevisar({ id: 'x', clase: 'prompt', molde: 'cuento', titulo: 't', material: '', bloques: ['tema', 'audiencia', 'personaje', 'concepto', 'leccion', 'emociones', 'extension'].map(id => ({ id, rotulo: id, t })) }, 'storybook');
      const tc = Date.now() - t0c;
      if (tc > TOPE) lentosC.push(nombre + ': ' + tc + ' ms');
    });
    ok(!lentosC.length, 'el repaso del cuento (edad, páginas, «explica») con cuatro formas de texto largo en cada bloque: menos de ' + TOPE + ' ms', lentosC.join('\n'));
  });

  /* Lo que encontró la revisión del repaso del 23 de septiembre de 2026.
     Cada comprobación se probó quitando su arreglo: sin él, suspende. */
  seccion('5.6 Lo que cazó la revisión del repaso', () => {
    const csgLeer = L('csgLeer');
    const MAQS = ['claude', 'chatgpt', 'gemini', 'storybook', 'notebooklm', 'perplexity', 'otra'];

    /* Libre existe para lo que no se entiende como bloques: no para con
       «Falta Texto» un prompt pegado con sus propios encabezados. */
    const lb = csgLeer('## Antecedentes\nEl colegio abre en enero.\n\n## Lo que necesito\nUn plan de clases.');
    const plb = { id: 'csg-x', clase: lb.clase, molde: lb.molde, titulo: 't', bloques: lb.bloques, material: '' };
    ok(lb.molde === 'libre' && !csgRevisar(plb, 'claude').para.length && /El colegio abre en enero\.[\s\S]*Un plan de clases\./.test(L('csgArmar')(plb, 'claude', {}, {}).principal),
      'un prompt con encabezados propios cae en Libre, se arma entero, y el repaso NO para con «Falta «Texto»»', JSON.stringify(csgRevisar(plb, 'claude').para));
    ok(hay(csgRevisar(pieza('libre', { texto: '' }), 'claude').para, /Falta «Texto»/, 'texto'), '… y un Libre de verdad vacío sí para');

    /* «Vuelve atrás» es un ciclo, no un puesto en la lista de Nodos. */
    const g = (nodos, aristas) => csgRevisar(pieza('cadena', { meta: 'Un video.', nodos, aristas, fin: 'Termina al entregar.' }), 'claude').para.filter(x => /vuelve atrás/.test(x.msg));
    const acic = g('Editor: pule el guion.\nInvestigador: busca fuentes.\nGuionista: escribe.', 'Investigador → Guionista\nGuionista → Editor\nEditor → FIN');
    ok(!acic.length, 'un grafo sin ninguna vuelta NO para aunque sus nodos se escribieran en otro orden («Editor» el primero)', JSON.stringify(acic));
    const ciclo = g('A: uno.\nB: dos.', 'A → B\nB → A');
    ok(ciclo.length === 1 && /«B → A» vuelve atrás/.test(ciclo[0].msg), 'un ida y vuelta sin tope para UNA vez, por la arista que cierra el ciclo', JSON.stringify(ciclo));
    ok(!g('A: uno.\nB: dos.', 'A → B (máximo 2 vueltas)\nB → A').length, '… y el tope vale escrito en cualquier arista del ciclo');
    ok(g('A: uno.\nB: dos.', 'A → A\nA → B').length === 1 && g('A: uno.\nB: dos.\nC: tres.', 'A → B\nB → A\nB → C\nC → B').length === 2,
      'un nodo que vuelve a sí mismo es un ciclo; dos ciclos sin tope, dos avisos');

    /* «Solo frases hechas» no salta en las piezas bien hechas del §7, ni en
       los moldes llenos con su «📄 usar el ejemplo». */
    if (!PIEZAS7) ok(false, 'las piezas del §7 de la parte 2 están a mano', 'la parte 2 no llegó a escribirlas');
    else {
      const ruido = [];
      Object.entries(PIEZAS7).forEach(([n, p]) => MAQS.forEach(m => { csgRevisar(p, m).avisa.filter(x => /frases hechas/.test(x.msg)).forEach(x => ruido.push(n + ' en ' + m + ': ' + x.msg)); }));
      ok(!ruido.length, 'las ocho piezas del §7, en las siete máquinas: ni un «hecho solo de frases hechas»', ruido.join('\n'));
    }
    const Mo = L('CSG_MOLDES'), def = L('csgBloqueDef');
    const ruidoM = [];
    Object.keys(Mo).forEach(mid => {
      const p = { id: 'csg-p', clase: Mo[mid].clase, molde: mid, titulo: 'Prueba', material: '',
        bloques: Mo[mid].bloques.map(b => { const d = def(mid, b.id); return { id: b.id, rotulo: d.rotulo, t: d.inicial || d.ejemplo || '' }; }) };
      MAQS.forEach(m => { const r = csgRevisar(p, m); r.avisa.filter(x => /frases hechas/.test(x.msg)).concat(r.para).forEach(x => ruidoM.push(mid + ' en ' + m + ': ' + x.msg)); });
    });
    ok(!ruidoM.length, 'los 18 moldes llenos con su ejemplo, en las siete máquinas: ni paran ni avisan de frases hechas', ruidoM.join('\n'));

    /* «Parece que se repite» no salta con un «para cada» o un «como mucho»
       cualquiera. */
    ok(!hay(csgRevisar(pieza('rapido', { tarea: 'Resume el informe y, para cada sección, da una frase con su dato más fuerte.', formato: 'Lista.' }), 'claude').avisa, /se repite/) &&
       !hay(csgRevisar(pieza('rapido', { tarea: 'Escribe un eslogan. Usa como mucho 2 veces la palabra «innovación».', formato: 'Lista.' }), 'claude').avisa, /se repite/),
      '«para cada sección, da una frase» y «como mucho 2 veces la palabra»: no «parece que se repite»');
    ok(!csgLeer('Tarea: Resume el informe y, para cada sección, da una frase con su dato más fuerte.\nFormato: lista.').avisos.some(a => /se repite/.test(a.texto)), '… y el lector tampoco lo dice');
    const rr = csgRevisar(pieza('rapido', { tarea: 'Repite esto para cada tema de la lista.', formato: 'Lista.' }), 'claude').avisa.find(x => /se repite/.test(x.msg));
    ok(!!rr && rr.arreglo.tipo === 'molde' && rr.arreglo.molde === 'lotes', '… pero «Repite esto para cada tema» sí, y propone Por lotes', JSON.stringify(rr));

    /* Las llaves de una plantilla dentro del código son literales. */
    const hb = csgRevisar(pieza('encargo', { tarea: 'Escribe el correo de aviso.', formato: 'Devuélvela en Handlebars:\n```\nHola {{#if nombre}}{{nombre}}{{/if}}, tu pedido {{ pedido.id }} va en camino.\n```' }), 'claude');
    ok(!hb.para.length, 'unas llaves de Handlebars dentro de ``` no paran el uso: se copian tal cual, que es lo que se quiere', JSON.stringify(hb.para));
    ok(!csgRevisar(pieza('encargo', { tarea: 'Usa `{{#each items}}` para la lista.', formato: 'Lista.' }), 'claude').para.length, '… ni dentro de un `trozo de código` en la frase');
    const fuera = csgRevisar(pieza('encargo', { tarea: 'Resume {{nombre del autor}} y {{}}.', formato: 'Lista.' }), 'claude');
    ok(hay(fuera.para, /nombre del autor/) && hay(fuera.para, /sin nombre/), '… y fuera del código un hueco que no se puede rellenar sigue parando (regla 6: no se copia en silencio)', JSON.stringify(fuera.para));
    const hbFuera = csgRevisar(pieza('encargo', { tarea: 'Hola {{#if nombre}}{{nombre}}{{/if}}.', formato: 'Lista.' }), 'claude').para.filter(x => /no se puede rellenar/.test(x.msg));
    ok(hbFuera.length === 2 && hbFuera.every(x => /ponla entre ```/.test(x.msg)) && !fuera.para.some(x => /ponla entre/.test(x.msg)),
      '… y si las llaves tienen pinta de plantilla (#, /, .), el aviso dice la salida —ponerla entre ```—; a «{{nombre del autor}}» no', JSON.stringify(hbFuera));

    /* Lo que tiene forma de teléfono y no lo es. */
    const DC = L('csgDatosDeCasa');
    const noTel = ['ISBN 978-84-376-0494-7', 'ISBN 9788499924212', 'ISBN 84-376-0494-2', 'el libro 9788499924212', 'PIB 2019 2020 2021 2022', 'del 1 al 10: 1 2 3 4 5 6 7 8 9 10'];
    const mal = noTel.filter(t => DC(t).some(d => d.tipo === 'telefono'));
    ok(!mal.length, 'un ISBN (de 13 o con su palabra delante), una racha de años o una cuenta no son teléfonos', mal.join(' | '));
    ok(['Llama al +504 9876-5432', 'Llama al 9876-5432', 'Llama al (504) 2234-5678'].every(t => DC(t).some(d => d.tipo === 'telefono')), '… y los teléfonos de verdad se siguen viendo');

    /* Una viñeta no es un número. */
    ok(hay(csgRevisar(pieza('skill', { nombre: 'x', disparador: 'd', pasos: '- Lee el texto.\n- Corrige.\n- Devuelve.', comprobacion: 'c' }), 'claude').avisa, /3 pasos sin número/, 'pasos'),
      'pasos con viñeta en una habilidad: AVISA de que van sin número');
    ok(!hay(csgRevisar(pieza('skill', { nombre: 'x', disparador: 'd', pasos: '1. Lee.\n   - con calma\n2. Corrige.', comprobacion: 'c' }), 'claude').avisa, /sin número/),
      '… y una sub-viñeta sangrada bajo un paso numerado no cuenta');
  });

  /* El repaso del Cuento que enseña: cuatro cosas que se escapan
     escribiendo un cuento. Ninguna PARA —guardar y usar se siguen
     pudiendo— y ninguna salta en un cuento bien hecho. */
  seccion('5.7 El repaso del Cuento que enseña', () => {
    const lleno = {
      tema: 'Un cuento que explique por qué llueve, contado por una gota de agua que tiene miedo de caer.',
      audiencia: 'Niños de 6 a 8 años que empiezan a leer solos.',
      personaje: 'Gotita, una gota de agua redonda y transparente.',
      concepto: 'El ciclo del agua: el sol calienta el agua y la vuelve vapor.',
      leccion: 'Que el agua que cae es la misma que subió.',
      emociones: 'Curiosidad al principio y asombro al final.',
      extension: 'Diez páginas, con dos o tres frases cortas en cada una.',
    };
    const cuento = cambios => pieza('cuento', Object.assign({}, lleno, cambios || {}), { maquina: 'storybook' });
    const bueno = csgRevisar(cuento(), 'storybook');
    ok(!bueno.para.length && !bueno.avisa.length, 'un cuento bien hecho, con Storybook: ni para ni avisa', JSON.stringify(bueno.para.concat(bueno.avisa)));

    const vacio = csgRevisar(pieza('cuento', { tema: '', audiencia: '', leccion: '', emociones: '', extension: '' }), 'storybook');
    ok(['tema', 'audiencia', 'leccion', 'emociones', 'extension'].every(id => hay(vacio.para, /Falta «/, id)) && vacio.para.filter(x => /Falta «/.test(x.msg)).length === 5,
      'los cinco obligatorios —los cinco que pidió el autor— PARAN si faltan, nombrados', JSON.stringify(vacio.para.map(x => x.msg)));

    const sinProta = csgRevisar(cuento({ personaje: '' }), 'storybook');
    ok(hay(sinProta.avisa, /Sin «Protagonista», la máquina lo inventa/, 'personaje') && !sinProta.para.length, 'sin «Protagonista»: AVISA (no para), con el porqué y un toque que lleva al bloque');

    const edad = t => hay(csgRevisar(cuento({ audiencia: t }), 'storybook').avisa, /no dice la edad/, 'audiencia');
    ok(edad('Para mi hijo, que se aburre con los libros.') && edad('Toda la familia.'), '«Para quién» sin ninguna edad: AVISA');
    ok(!edad('Niños de 6 a 8 años.') && !edad('Adolescentes que creen que el tema no les interesa.') && !edad('Un niño de {{edad}} años que se llama {{nombre}}.') && !edad('Estudiantes de sexto grado.') && !edad('Adultos que nunca entendieron el tema.') && !edad('Niñas de primaria.'),
      '… y con una cifra o una palabra de edad (niños, adolescentes, años, grado, adultos, primaria) no avisa');
    /* Lo que cazó la revisión: el curso dicho con su ordinal, la edad dicha
       con su nombre y el inglés. Un aviso que salta con la edad escrita
       enseña a no leer los avisos. */
    ok(['Alumnos de sexto.', 'Estudiantes de tercero.', 'Personas de la tercera edad.', 'Toddlers.', 'A child who is afraid of the dark.', 'Preschoolers and their parents.'].every(t => !edad(t)),
      '… ni con «Alumnos de sexto», «de tercero», «la tercera edad», «Toddlers» o «A child…»');

    const expl = (tema, concepto) => hay(csgRevisar(cuento({ tema, concepto }), 'storybook').avisa, /dice que el cuento explica algo/, 'concepto');
    ok(expl('Un cuento que explique por qué llueve.', '') && expl('Para enseñar las fracciones a un niño.', '') && expl('Cómo funciona el corazón, contado por un glóbulo rojo.', ''),
      'el tema dice que explica o enseña y «Lo que el cuento explica» está vacío: AVISA (sin los datos exactos, la máquina los inventa)');
    ok(!expl('Un cuento que explique por qué llueve.', 'El ciclo del agua.') && !expl('Un cuento para contar antes de dormir sobre la luna.', ''),
      '… y no avisa con el concepto escrito, ni en un cuento que no dice explicar nada');
    ok(expl('¿Por qué llueve?', '') && expl('How the water cycle works.', '') && expl('Quiero que expliques la fotosíntesis.', ''),
      '«¿Por qué llueve?» al principio (la pregunta que el cuento contesta), el inglés y «expliques» con su qu: AVISA');
    ok(['Una niña que aprende a andar en bicicleta.', 'Un niño que no entiende por qué su abuelo ya no está.', 'Una historia de amistad, sin enseñar nada.', 'La enseñanza de la paciencia.', 'A story that does not explain anything.'].every(t => !expl(t, '')),
      '… y NO en los cuentos de emociones: lo que aprende la protagonista, el «por qué» de un personaje a media frase, un «sin enseñar» negado ni la enseñanza de un valor');

    const largo = n => csgRevisar(cuento({ concepto: 'palabra '.repeat(n).trim() }), 'storybook').avisa.filter(x => /es mucho para un cuento breve/.test(x.msg));
    ok(largo(121).length === 1 && /121 palabras/.test(largo(121)[0].msg) && !largo(120).length, '«Lo que el cuento explica» de 121 palabras AVISA diciendo cuántas; de 120, no');

    const pags = (t, m) => hay(csgRevisar(cuento({ extension: t }), m).avisa, /Storybook hace libros de unas diez páginas/, 'extension');
    ok(pags('Veinte páginas, una escena por página.', 'storybook') && pags('Que sean 15 páginas.', 'storybook') && /con 20 pedidas/.test(csgRevisar(cuento({ extension: 'Veinte páginas.' }), 'storybook').avisa.map(x => x.msg).join()),
      'con Storybook, una Extensión de más de doce páginas AVISA con el número que se pidió (en cifra o en letra)');
    ok(!pags('Veinte páginas.', 'claude') && !pags('Doce páginas.', 'storybook') && !pags('Diez páginas, con dos o tres frases cortas en cada una.', 'storybook'),
      '… y no con Claude (que escribe lo que se le pida), ni con doce, ni con diez');
    /* Lo que cazó la revisión: el número solo (lo que deja «Páginas: 20»
       pegado), las decenas compuestas y el inglés. «Treinta y dos» se leía
       2 y callaba el aviso. */
    const pn = L('csgRevPaginas');
    ok(pn('20') === 20 && pn('Treinta y dos páginas.') === 32 && pn('Veintidós páginas.') === 22 && pn('fourteen pages') === 14 && pn('thirty-two pages') === 32 && pn('Diez páginas, una escena por página.') === 10 && pn('entre 10 y 12 páginas') === 12 && pn('Una escena por página.') === 0,
      'csgRevPaginas: «20» solo, «treinta y dos», «veintidós», «fourteen», «thirty-two»; y «una escena por página» no es un número de páginas',
      [pn('20'), pn('Treinta y dos páginas.'), pn('Veintidós páginas.'), pn('fourteen pages'), pn('thirty-two pages'), pn('Una escena por página.')].join(','));
    ok(pags('20', 'storybook') && pags('Treinta y dos páginas.', 'storybook') && /con 32 pedidas/.test(csgRevisar(cuento({ extension: 'Treinta y dos páginas.' }), 'storybook').avisa.map(x => x.msg).join()),
      '… y con ellos el aviso de Storybook dice el número que de verdad se pidió');
    const tope = L('csgArmTope');
    ok(tope('Ten en cuenta que el crítico decide.') === 'N' && tope('Five rounds max.') === '5' && tope('Sixteen rounds.') === '16' && tope('Tres rondas: apertura, réplica y cierre. Cada turno, 150 palabras.') === '3',
      'y la tabla de números es UNA (csgArmTope la comparte): el {N} de un bucle entiende «Five rounds», y «Ten en cuenta…» no es un tope de diez');

    const soloFrases = csgRevisar(cuento({ concepto: 'Un paso del concepto en cada página, en orden.', leccion: 'Que pedir ayuda no es rendirse.' }), 'storybook');
    ok(hay(soloFrases.avisa, /solo de frases hechas/, 'concepto') && !soloFrases.avisa.some(x => /frases hechas/.test(x.msg) && /Lo que se aprende/.test(x.msg)),
      'un «Lo que el cuento explica» hecho solo de un chip dice CÓMO y no QUÉ: AVISA; una lección de un chip es una lección entera: no', JSON.stringify(soloFrases.avisa.map(x => x.msg)));

    const otro = csgRevisar(pieza('encargo', { tarea: 'Escribe algo.', formato: 'Texto.', personaje: '' }), 'storybook');
    ok(!otro.avisa.some(x => /Protagonista|no dice la edad|páginas/.test(x.msg)), 'fuera de su molde, esos avisos no salen: allí nadie pidió un protagonista');
  });
}

/* ══════════════════════════════════════════════════════════════════
   6. LOS DATOS
   ══════════════════════════════════════════════════════════════════ */
function parte6() {
  parte(6, 'Los datos: moldes, sinónimos, máquinas, topes y cada literal contra el plan');
  const L = cargaEn({ console, document: { addEventListener() {}, getElementById: () => null, querySelector: () => null }, window: {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} } });
  const M = L('CSG_MOLDES'), O = L('CSG_MOLDES_ORDEN'), B = L('CSG_BLOQUES'), C = L('CSG_CLASES');
  const S = L('CSG_SINONIMOS'), P = L('CSG_PATRONES_BUCLE'), Q = L('CSG_MAQUINAS'), E = L('CSG_EQUIVALE');
  const mezcla = (m, b) => Object.assign({}, B[b.id] || { rotulo: b.id }, b);

  seccion('6.1 Los 18 moldes y su orden', () => {
    const IDS = 'rapido encargo costar ejemplos razonado fuentes voz cuento libre skill sistema receta cadena coordinador hasta critica lotes careo'.split(' ');
    ok(IDS.every(i => M[i] && M[i].id === i) && Object.keys(M).length === 18, 'los 18 moldes existen con su id');
    const nombrados = [].concat(...Object.values(O));
    ok(nombrados.length === 18 && new Set(nombrados).size === 18 && IDS.every(i => nombrados.includes(i)), 'CSG_MOLDES_ORDEN nombra a los 18 una vez');
    ok(O.prompt.join() === 'rapido,encargo,costar,ejemplos,razonado,fuentes,voz,cuento,libre', 'el Cuento que enseña va delante de Libre, que es donde cae lo que no se entiende');
    ok(Object.values(M).every(m => !m.maquina || Q.some(q => q.id === m.maquina)), 'la máquina que declara un molde existe en CSG_MAQUINAS');
    ok(Object.entries(O).every(([cl, ls]) => ls.every(i => M[i].clase === cl)), 'cada molde está en el orden de su clase');
    ok(Object.values(O).every(ls => M[ls[0]].recomendado), 'el recomendado va primero en su clase');
  });

  seccion('6.2 Cada bloque de cada molde es del vocabulario, y solo sobrescribe lo que difiere', () => {
    const malos3 = [], malos4 = [], iguales = [];
    for (const m of Object.values(M)) {
      ok(typeof m.nombre === 'string' && m.nombre && typeof m.cuando === 'string' && m.cuando && typeof m.recomendado === 'boolean' && Array.isArray(m.bloques) && m.bloques.length, 'molde ' + m.id + ': nombre, cuando, recomendado y bloques');
      const vistos = new Set();
      for (const b of m.bloques) {
        if (!B[b.id]) malos3.push(m.id + '.' + b.id);
        if (vistos.has(b.id)) malos3.push(m.id + '.' + b.id + ' (repetido)');
        vistos.add(b.id);
        if (typeof b.ob !== 'boolean') malos3.push(m.id + '.' + b.id + ' (ob)');
        const d = mezcla(m, b);
        if (!d.rotulo || !d.para_que || !d.ejemplo || !Array.isArray(d.frases) || d.frases.length < 4) malos4.push(m.id + '.' + b.id);
        /* Una sobreescritura que repite el vocabulario no rompe nada hoy,
           pero el día que alguien corrija la frase en CSG_BLOQUES la copia
           seguiría diciendo la vieja en ese molde, sin ningún aviso. */
        for (const k of ['rotulo', 'para_que', 'ejemplo', 'inicial', 'plantilla']) if (k in b && B[b.id] && B[b.id][k] === b[k]) iguales.push(m.id + '.' + b.id + '.' + k);
        if ('frases' in b && B[b.id] && JSON.stringify(B[b.id].frases) === JSON.stringify(b.frases)) iguales.push(m.id + '.' + b.id + '.frases');
        for (const k of Object.keys(b)) if (!['id', 'ob', 'rotulo', 'para_que', 'ejemplo', 'frases', 'inicial', 'plantilla'].includes(k)) malos3.push(m.id + '.' + b.id + ' campo raro ' + k);
      }
    }
    ok(!malos3.length, 'cada bloque de cada molde es un id de CSG_BLOQUES, con ob booleano y sin repetir', malos3.join(', '));
    ok(!malos4.length, 'mezclados, todos tienen rotulo, para_que, ejemplo y ≥ 4 frases', malos4.join(', '));
    ok(!iguales.length, 'ninguna sobreescritura repite el vocabulario', iguales.join(', '));
    for (const c of C) {
      const rec = Object.values(M).filter(m => m.clase === c.id && m.recomendado);
      ok(rec.length === 1 && rec[0].id === c.molde, 'clase ' + c.id + ': un solo recomendado y es ' + c.molde);
    }
  });

  seccion('6.3 Sinónimos, patrones del bucle, máquinas y equivalencias', () => {
    const norm = s => sinTildesP(s).toLowerCase().replace(/\s+/g, ' ').trim();
    const malS = Object.entries(S).filter(([k, v]) => k !== norm(k) || !B[v] || /[0-9[\]{}()#→]/.test(k));
    ok(!malS.length, 'CSG_SINONIMOS normalizado y apuntando al vocabulario (' + Object.keys(S).length + ' claves)', JSON.stringify(malS));
    const ESPERADAS = 'rol|role|persona|eres|contexto|context|background|situacion|tarea|task|instruccion|instrucciones|instruction|goal|pedido|encargo|objetivo|objective|reglas|rules|constraints|restricciones|guidelines|no hagas|formato|formato de salida|format|output|output format|respuesta|response|ejemplos|examples|few-shot|comprobacion|comprobaciones|checks|verification|validation|como se comprueba|que revisas|tono|tone|estilo|style|audiencia|audience|publico|ahora tu|ahora|caso|caso nuevo|now|pasos|steps|como pensarlo|que haces|luego responde|responde|answer|pregunta|question|research question|fuentes|fuentes permitidas|sources|citas|reglas de cita|citations|limites|limits|scope|voz|voice|genero|genre|genero y largo|tema|topic|tema o encargo|etiqueta|etiqueta de la casa|nombre|name|description|descripcion|cuando se dispara|cuando|when|trigger|cuando usarla|when to use|recursos|resources|herramientas|tools|identidad|identity|mision|mission|siempre|always|nunca|never|meta|goal final|nodos|nodes|agentes|agents|especialistas|aristas|edges|flujo|flow|pasos y condiciones|estado|state|lo que viaja|fin|fin y entrega|end|salida del grafo|coordinador|orquestador|orchestrator|reparto|como se reparte|juntar|como se junta|paso|paso que se repite|step|vuelta|parada|criterio de parada|stop|para cuando|tope|rondas|max|limit|memoria|memory|acumulado|entre vueltas|verificacion|verify|salida|que sale al final|deliverable|borrador|draft|critico|critic|revision|revise|lista|list|elementos|postura a|postura b|juez|judge|texto|text|prompt|tema de la historia|de que trata|trama|plot|story idea|para quien|edad del lector|publico objetivo|target age|target audience|protagonista|protagonistas|personaje|personajes|protagonist|protagonists|character|characters|main character|escenario|donde pasa|ambientacion|setting|concepto|lo que el cuento explica|que explica|leccion|lo que se aprende|aprendizaje|moraleja|ensenanza|lesson|moral|moral of the story|emociones|emocion|lo que debe sentir el lector|lo que debe sentir|sensaciones|sentimientos|sentimiento|emotions|feelings|como se cuenta|narrador|voz narrativa|narrator|desenlace|como termina|final del cuento|ending|extension|paginas|numero de paginas|pages|number of pages|ilustracion|ilustraciones|estilo de ilustracion|estilo de las ilustraciones|estilo visual|estilo artistico|dibujos|art style|illustrations|illustration style'.split('|');
    ok(ESPERADAS.every(k => k in S), 'están todas las claves del §5', ESPERADAS.filter(k => !(k in S)).join(', '));
    ok(!('final' in S) && !B.final, '«final» no es clave ni id: es el «Fin» de un grafo o de un bucle dicho de otra manera (por eso el id es `desenlace`)');
    ok(!('edad' in S) && !('concept' in S), '«edad» y «concept» no son claves: la edad puede ser la del lector o la del protagonista, y «concept» la idea de la historia o lo que explica');
    /* Las claves del cuento viven aparte y solo ascienden dentro de un
       cuento: cada una es una clave de CSG_SINONIMOS, y las señales, del
       cuento también. Los bloques que solo tiene su molde salen del molde. */
    const SC = L('CSG_SINONIMOS_CUENTO'), CL = L('CSG_LEC_CLAVES_CUENTO'), SE = L('CSG_LEC_SENALES_CUENTO');
    ok(Object.keys(SC).every(k => S[k] === SC[k]) && Object.keys(SC).every(k => CL.has(k)) && CL.size === Object.keys(SC).length,
      'CSG_SINONIMOS_CUENTO está entero dentro de CSG_SINONIMOS, y todas sus claves son del cuento (' + CL.size + ')');
    ok([...SE].every(k => CL.has(k)) && SE.size === 7 && ['moraleja', 'desenlace', 'tema de la historia', 'lo que el cuento explica'].every(k => SE.has(k)) &&
       !['personaje', 'escenario', 'concepto', 'emociones', 'extension', 'para quien', 'target age', 'lesson'].some(k => SE.has(k)),
      'las siete señales son claves del cuento, y ninguna de las que salen también en un juego de rol, un glosario, un ensayo o un anuncio');
    ok(String(L('CSG_LEC_IDS_CUENTO')) === 'personaje,escenario,concepto,leccion,emociones,desenlace,extension,ilustracion',
      'CSG_LEC_IDS_CUENTO: los ocho bloques que solo tiene el cuento (tema, audiencia, tono y reglas son también de otros moldes)');
    ok(['tema de la historia', 'lo que el cuento explica', 'lo que se aprende', 'lo que debe sentir el lector', 'estilo de las ilustraciones'].every(k => L('CSG_LEC_ROTULOS_LARGOS').has(k)),
      'los rótulos largos del cuento solo ascienden si casan enteros (CSG_LEC_ROTULOS_LARGOS)');
    for (const i of ['hasta', 'critica', 'lotes', 'careo']) ok(['auto', 'pseudo', 'cierre'].every(k => typeof M[i][k] === 'string' && M[i][k].length > 20) && (i === 'lotes' || M[i].pseudo.includes('{N}')), 'bucle ' + i + ': auto, pseudo con {N} y cierre');
    ok(M.cadena.orquestar === 'cadena' && M.coordinador.orquestar === 'coordinador', 'los grafos llevan orquestar');
    ok(Q.map(m => m.id).join() === 'claude,chatgpt,gemini,storybook,perplexity,notebooklm,otra', 'CSG_MAQUINAS en su orden (Storybook pegada a Gemini, que es de donde sale)');
    ok(Q.every(m => ['xml', 'md', 'seguida'].includes(m.forma) && (m.abrir === '' || /^https:\/\//.test(m.abrir)) && typeof m.param === 'string' && typeof m.donde === 'string' && m.nota), 'CSG_MAQUINAS con forma, abrir, param, donde y nota');
    ok(Object.values(E).every(l => l.every(i => B[i])) && Object.keys(E).every(i => B[i]) && Object.keys(E).length === 23, 'CSG_EQUIVALE: 23 entradas del vocabulario');
    ok(String(E.leccion) === 'objetivo,meta' && String(E.objetivo) === 'meta,tarea,leccion' && String(E.extension) === 'genero,limites' && String(E.genero) === 'extension' && !E.personaje && !E.concepto,
      'las equivalencias del cuento: la lección es lo que se quiere LOGRAR y el «Género y largo» es su extensión; el protagonista y el concepto no se colocan a la fuerza');
    ok(Object.values(P).every(l => l.every(r => Object.prototype.toString.call(r) === '[object RegExp]')), 'patrones de bucle son RegExp');
    ok(P.tope[0].test('Máximo 4 vueltas') && P.parada[0].test('Para cuando el párrafo tenga menos') && P.paso[0].test('Repite el paso') && P.lotes[0].test('Para cada tema, tres preguntas') && !P.parada[0].test('Pasa la sal'), 'los patrones muerden lo que tienen que morder');
  });

  seccion('6.4 Textos fijos, topes, columnas y llaves', () => {
    const T = L('CSG_TEXTOS');
    ok(T.orquestarCadena('Investigador') === 'Vas a hacer tú solo, por turnos, el papel de cada nodo. Empieza por Investigador. En cada turno escribe NODO: y su nombre en su propio renglón, haz lo suyo con lo que recibe, y pasa al siguiente según las aristas y sus condiciones; lo que viaja entre nodos es lo único que el siguiente ve. No inventes nodos ni te saltes aristas. Termina cuando se llegue a FIN o se cumpla lo dicho en «Fin y entrega», y entonces entrega lo que allí se pide.', 'orquestarCadena literal (§7)');
    ok(M.hasta.pseudo.replace('{N}', '5') === 'VUELTA 1..5:\n  hacer el paso\n  comprobar el criterio de parada, condición por condición\n  si cumple: parar y entregar\n  si no: apuntar qué falló y volver a hacer el paso con eso en cuenta\nal llegar al tope: entregar lo mejor y decir por qué no paró', 'pseudo de Repite hasta igual al ejemplo de §7');
    ok(JSON.stringify(L('CSG_TOPES')) === JSON.stringify({ bloques: 60000, material: 20000, estantes: 1000, notas: 4000, bitacora: 60000, versiones: 200000, nota_uso: 300, estante: 40, estantes_n: 12, titulo: 200, clase: 20, molde: 30, maquina: 40, cuaderno: 80, autor: 40, version: 100000 }) && L('CSG_PREFILL_MAX') === 1500, 'CSG_TOPES (todos los de la fila, también los cortos) y CSG_PREFILL_MAX', JSON.stringify(L('CSG_TOPES')));
    if (!SQL) ok(false, 'se puede leer supabase/sql/consigna.sql', 'sin él no se pueden comparar los topes ni las columnas');
    else {
      const tp = L('CSG_TOPES'); const vist = {};
      for (const m of SQL.matchAll(/length\((\w+)(?:::text)?\)\s*<=\s*(\d+)/g)) vist[m[1]] = +m[2];
      for (const m of SQL.matchAll(/check \((?:length\()?(\w+)\)?\s+between\s+\d+\s+and\s+(\d+)\)/g)) if (m[1] !== 'id') vist[m[1]] = +m[2];
      ok(['bloques', 'material', 'estantes', 'notas', 'bitacora', 'versiones', 'maquina', 'cuaderno', 'autor', 'clase', 'molde', 'version'].every(k => vist[k] === tp[k]), 'los topes coinciden con consigna.sql', JSON.stringify(vist));
      const cols = L('CSG_COLUMNAS').split(',');
      ok(cols.length === 19 && cols.every(c => new RegExp('\\b' + c + '\\b').test(SQL)), 'CSG_COLUMNAS: 19 columnas que están en el SQL');
    }
    ok(L('CSG_CLAVES').piezas === 'faro_consigna_v1' && L('CSG_RESERVADAS').join() === 'maquina,titulo,hoy', 'CSG_CLAVES y CSG_RESERVADAS');
    ok(mezcla(M.careo, M.careo.bloques[4]).inicial.includes('Género: entrevista') && mezcla(M.lotes, M.lotes.bloques[3]).inicial.startsWith('Un elemento por vuelta') && mezcla(M.voz, M.voz.bloques[3]).inicial.startsWith('Encabeza el texto'), 'los inicial de Voz prestada, Careo y Por lotes');
  });

  seccion('6.5 Cada texto literal del JS está escrito tal cual en el plan', () => {
    /* Lo que se escribe en un chip o sale en el armado tiene que ser lo
       que dice la especificación. Se busca en el plan con su forma de allí:
       los ejemplos y las frases entre «», el pseudocódigo con sus \n
       escritos. Los «para qué» del vocabulario no se miran: donde el plan
       no trae uno se escribió a mano, y el propio archivo lo dice. */
    let n = 0;
    const f = [];
    const mira = (q, s) => { n++; if (!PLAN.includes(s)) f.push(q + ': ' + s); };
    for (const m of Object.values(M)) {
      mira(m.id + '.nombre', '**' + m.nombre + '**');
      for (const k of ['auto', 'cierre']) if (m[k]) mira(m.id + '.' + k, m[k]);
      if (m.pseudo) mira(m.id + '.pseudo', m.pseudo.replace(/\n/g, '\\n'));
      for (const b of m.bloques) {
        for (const k of ['rotulo', 'para_que', 'inicial', 'plantilla']) if (b[k]) mira(m.id + '.' + b.id + '.' + k, b[k]);
        if (b.ejemplo) b.ejemplo.split('\n').forEach(l => mira(m.id + '.' + b.id + '.ejemplo', '«' + l + '»'));
        (b.frases || []).forEach(l => mira(m.id + '.' + b.id + '.frase', '«' + l + '»'));
      }
    }
    ok(n > 150 && !f.length, 'los ' + n + ' textos literales de los moldes están en el plan', f.join('\n'));
    let nv = 0;
    const fv = [];
    const miraV = (q, s) => { nv++; if (!PLAN.includes(s)) fv.push(q + ': ' + s); };
    for (const [id, b] of Object.entries(B)) {
      miraV(id + '.rotulo', '`' + id + '` ' + b.rotulo);
      if (b.ejemplo) b.ejemplo.split('\n').forEach(l => miraV(id + '.ejemplo', '«' + l + '»'));
      (b.frases || []).forEach(l => miraV(id + '.frase', '«' + l + '»'));
      if (b.inicial) miraV(id + '.inicial', b.inicial);
    }
    ok(nv > 250 && !fv.length, 'y los ' + nv + ' del vocabulario (rótulos, ejemplos, frases e iniciales del §3)', fv.join('\n'));
  });

  /* Storybook es la máquina de UN molde (§4): el Cuento que enseña nace con
     ella, pero no se apunta como «la última» del aparato —el Rápido
     siguiente nacería para una máquina que solo hace libros— ni viaja con
     «Duplicar» a un molde que no es el suyo. En un salón con un almacén de
     verdad, que es donde vive «la última». */
  seccion('6.6 Storybook, la máquina de un molde', () => {
    const almacen = new Map();
    const LS = cargaEn({ console, document: { addEventListener() {}, getElementById: () => null, querySelector: () => null }, window: {},
      localStorage: { getItem: k => (almacen.has(k) ? almacen.get(k) : null), setItem: (k, v) => almacen.set(k, String(v)), removeItem: k => almacen.delete(k) } });
    const deMolde = LS('csgMaquinaDeMolde'), ultima = LS('csgMaquinaUltima'), apunta = LS('csgMaquinaApunta');
    const sb = LS('csgMaquina')('storybook');
    ok(sb.id === 'storybook' && sb.forma === 'seguida' && sb.abrir === 'https://gemini.google.com/gem/storybook' && sb.param === '' && /gem\/storybook/.test(sb.donde),
      'Storybook: forma seguida, se abre en el Gem (no en Gemini a secas) y sin texto en la dirección', JSON.stringify(sb));
    const d = LS('csgUsarDestino')('storybook', 'Crea un cuento.', {});
    ok(d.url === 'https://gemini.google.com/gem/storybook' && d.lleno === false, '↗ abre el Gem pelado: el texto va copiado, no en la dirección', JSON.stringify(d));
    ok(deMolde('storybook') && !deMolde('claude') && !deMolde('gemini') && !deMolde('') && !deMolde(null), 'csgMaquinaDeMolde: Storybook sí; Claude, Gemini y nada, no');

    apunta('chatgpt');
    ok(ultima() === 'chatgpt', 'apuntar ChatGPT la deja como la última');
    apunta('storybook');
    ok(ultima() === 'chatgpt', 'apuntar Storybook NO la pisa: la última sigue siendo ChatGPT');
    almacen.set(LS('CSG_CLAVES').maquina, 'storybook');
    ok(ultima() === 'claude', 'y si una versión vieja dejó Storybook apuntada, no se devuelve: se vuelve a Claude');
    apunta('chatgpt');

    const nuevo = LS('csgNuevaPieza');
    const cu = nuevo('prompt', 'cuento'), ra = nuevo('prompt', 'rapido');
    ok(cu.maquina === 'storybook' && cu.molde === 'cuento' && ra.maquina === 'chatgpt', 'una pieza nueva del Cuento que enseña nace para Storybook; un Rápido, para la última (ChatGPT)', cu.maquina + ' / ' + ra.maquina);
    const ext = cu.bloques.find(b => b.id === 'extension');
    ok(!!ext && ext.t === 'Diez páginas, una escena por página, con el texto justo para leerlo en voz alta sin cansar.' && cu.bloques.filter(b => b.t).length === 1,
      'y nace con la Extensión rellena (el `inicial`) y lo demás vacío', JSON.stringify(cu.bloques.filter(b => b.t)));
    ok(cu.bloques.map(b => b.rotulo).join(' · ') === 'Tema de la historia · Para quién · Protagonista · Dónde pasa · Lo que el cuento explica · Lo que se aprende · Lo que debe sentir el lector · Cómo se cuenta · Cómo termina · Extensión · Ilustraciones · Reglas',
      'con sus doce rótulos, en el orden del storytelling', cu.bloques.map(b => b.rotulo).join(' · '));

    const dup = LS('csgDuplicarEnMolde');
    cu.bloques.find(b => b.id === 'leccion').t = 'Que pedir ayuda no es rendirse.';
    cu.bloques.find(b => b.id === 'personaje').t = 'Tuga, una tortuga tímida.';
    const aCostar = dup(cu, 'costar');
    ok(aCostar.maquina === 'chatgpt', 'Duplicar un cuento en CO-STAR no se lleva Storybook: se queda la última del aparato', aCostar.maquina);
    ok((aCostar.bloques.find(b => b.id === 'objetivo') || {}).t === 'Que pedir ayuda no es rendirse.' && aCostar.bloques.some(b => b.rotulo === 'Protagonista' && b.t === 'Tuga, una tortuga tímida.' && b.traido),
      '… la lección va al Objetivo (CSG_EQUIVALE) y el protagonista, a la vista como bloque libre traído', JSON.stringify(aCostar.bloques));
    const vz = nuevo('prompt', 'voz');
    vz.maquina = 'gemini';
    vz.bloques.find(b => b.id === 'genero').t = 'Un cuento de unas 1.200 palabras, en tres capítulos.';
    const aCuento = dup(vz, 'cuento');
    ok(aCuento.maquina === 'storybook' && (aCuento.bloques.find(b => b.id === 'extension') || {}).t === 'Un cuento de unas 1.200 palabras, en tres capítulos.',
      'Duplicar un Voz prestada en el Cuento que enseña pone Storybook, y su «Género y largo» va a la Extensión', aCuento.maquina + ' · ' + JSON.stringify(aCuento.bloques.find(b => b.id === 'extension')));

    /* ⚠️ Solo se deja atrás la Storybook que puso el molde. Una elegida a
       mano en otro molde, o otra máquina elegida a mano dentro del cuento,
       las eligió alguien, y duplicar no decide por él. */
    const li = nuevo('prompt', 'libre');
    li.maquina = 'storybook';
    li.bloques.find(b => b.id === 'texto').t = 'Un libro de un dragón que le teme al fuego.';
    ok(dup(li, 'rapido').maquina === 'storybook', 'Duplicar un Libre para Storybook (elegida a mano) en Rápido conserva Storybook', dup(li, 'rapido').maquina);
    const cuC = nuevo('prompt', 'cuento');
    cuC.maquina = 'claude';
    cuC.bloques.find(b => b.id === 'tema').t = 'Por qué llueve.';
    ok(dup(cuC, 'encargo').maquina === 'claude', 'y un cuento que se pasó a Claude a mano, duplicado en Encargo, sigue para Claude', dup(cuC, 'encargo').maquina);
  });
}

/* ══════════════════════════════════════════════════════════════════ */
(async () => {
  parte1();
  parte2();
  await parte3();
  parte4();
  parte5();
  parte6();
  veredicto();
})();
