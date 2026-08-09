/* ============================================================
   ¿ESTÁ BIEN DIBUJADO EL CÓDIGO QR?
   ------------------------------------------------------------
   El QR del buzón se imprime en la revista y se queda en papel
   durante años. Un QR mal generado NO se ve mal: se ve perfecto,
   cuadrado y limpio, y no lleva a ninguna parte. El error se
   descubre con la tirada ya impresa y el número repartido.

   Por eso no se comprueba «a ojo» ni escaneando uno con el
   teléfono. Se comprueba por dos lados distintos, porque cada
   uno ve lo que al otro se le escapa:

     1. LAS TABLAS. Cuánto cabe en cada versión y en cuántos
        bloques se parte, contrastado casilla por casilla con la
        tabla oficial. Aquí no hay nada que razonar: son cifras
        copiadas, y copiar es justo donde se falla. Una sola mal
        —un 5 donde iba un 6— pasó las demás pruebas y dio un
        código impecable que ningún teléfono leía.
     2. LOS MUEBLES. Los módulos que no dependen del texto
        —localizadores, tiempos, alineación, formato y versión—
        se comparan uno a uno contra segno, en las 40 versiones,
        las 4 correcciones y las 8 máscaras. Son los que hacen
        que el teléfono ENCUENTRE el código y sepa leerlo; si uno
        falla, no hay dato que valga.
     3. EL MENSAJE. Los códigos que genera la aplicación de
        verdad (con la máscara que elige ella) se pintan como
        imagen y se DECODIFICAN con zxing, el lector que llevan
        media docena de aplicaciones de teléfono. Que un lector
        independiente devuelva exactamente la dirección que se
        quería poner es la única prueba que de verdad importa.
        (OpenCV también trae lector, pero se rinde con los
        códigos densos: daba por malos algunos que estaban bien,
        y también los de segno. Con él no se distingue un fallo
        propio de una limitación suya.)

   Por qué no se comparan las cuadrículas enteras contra segno:
   segno mete un códigoword de relleno de más. Su
   write_padding_bits hace `8 - (largo % 8)` en vez de
   `(8 - largo % 8) % 8`, así que cuando el flujo ya termina justo
   en el borde de un byte —que en modo byte es SIEMPRE— añade
   ocho ceros que la norma no pide. No rompe nada (el
   decodificador para en el terminador y el relleno le da igual)
   pero mueve todos los códigos de corrección, y con ellos media
   cuadrícula. Se persiguió un buen rato como si fuera un fallo
   nuestro; queda escrito para que no se persiga otra vez.

   Uso:
     pip install segno zxing-cpp numpy
     node _dev/verifica-qr.js
   ============================================================ */
const { execFileSync } = require('child_process');
const path = require('path');

const QR = require(path.join(__dirname, '..', 'js', 'qr.js'));

const NIVELES = ['L', 'M', 'Q', 'H'];
let pruebas = 0, fallos = 0;
const fallo = (msg) => { fallos++; console.log('  ❌ ' + msg); };

function python(codigo, entrada) {
  return JSON.parse(execFileSync('python3', ['-c', codigo], {
    input: entrada == null ? '' : JSON.stringify(entrada), maxBuffer: 1 << 28,
  }).toString());
}

/* ════════════════════════════════════════════════════════════
   1. LAS TABLAS: cuánto cabe en cada versión
   ════════════════════════════════════════════════════════════
   La tabla oficial se saca de segno y se compara con lo que dice
   el generador para las 160 combinaciones de versión y
   corrección. Se comprueba la CAPACIDAD RESULTANTE, no las cifras
   sueltas: así entra en la cuenta también la fórmula de los
   módulos crudos, que es de donde sale todo lo demás. */
console.log('\n🔢 Cuánto cabe en cada versión (contra la tabla oficial)\n');

const oficial = python(`
import json, segno.consts as C
sal = {}
for lvl, nombre in [(C.ERROR_LEVEL_L,'L'), (C.ERROR_LEVEL_M,'M'),
                    (C.ERROR_LEVEL_Q,'Q'), (C.ERROR_LEVEL_H,'H')]:
    datos = [-1]
    for v in range(1, 41):
        datos.append(sum(i.num_blocks * i.num_data for i in C.ECC[v][lvl]))
    sal[nombre] = datos
print(json.dumps(sal))
`);

let capMalas = 0, capTotal = 0;
const alLimite = [];   // los 160 códigos llenos hasta el borde, para leerlos luego
NIVELES.forEach(nivel => {
  for (let ver = 1; ver <= 40; ver++) {
    capTotal++; pruebas++;
    // La capacidad se mide por fuera: el texto más largo que entra
    // sin obligar a subir de versión. Se llena hasta el borde a
    // propósito: con el símbolo lleno el terminador se acorta y el
    // relleno desaparece, que es donde se esconden los descuadres.
    // El relleno va en ASCII puro y a propósito: aquí se mide cuánto
    // cabe en CÓDIGOS, y una tilde ocupa dos. Con acentos en el relleno
    // la cuenta no cuadra y la prueba acusa al generador de un error
    // que es suyo.
    const cabe = oficial[nivel][ver] - (ver <= 9 ? 1 : 2) - 1;
    const texto = 'Buzon del lector 0123456789 '.repeat(120).slice(0, cabe);
    const q = QR.matriz(texto, { nivel });
    if (q.version !== ver) {
      capMalas++;
      if (capMalas <= 10) fallo(`versión ${ver} ${nivel}: un texto de ${cabe} letras debería caber ahí y se va a la ${q.version}`);
      continue;
    }
    alLimite.push({ texto, nivel, ver, m: q.m.map(f => f.map(c => (c ? 1 : 0))) });
  }
});
console.log(`  ${capMalas ? '❌' : '✅'} ${capTotal - capMalas}/${capTotal} capacidades cuadran con la tabla oficial`);

/* ════════════════════════════════════════════════════════════
   2. LOS MUEBLES: todo lo que no es el texto
   ════════════════════════════════════════════════════════════
   Se piden a segno cuadrículas con versión, corrección y máscara
   fijadas, y se comparan SOLO los módulos que la aplicación marca
   como fijos: los tres localizadores con su separador, las líneas
   de tiempos, los cuadritos de alineación, los quince bits del
   formato (por duplicado) y los dieciocho de la versión. Ninguno
   depende del relleno, así que aquí sí se compara módulo a
   módulo y sin excusas. */
console.log('\n🪑 Los muebles del código (localizadores, tiempos, alineación, formato, versión)\n');

const RELLENO = 'B';   // texto mínimo: en esta parte da igual lo que diga
const peticiones = [];
for (let ver = 1; ver <= 40; ver++) {
  for (const nivel of NIVELES) {
    for (let mascara = 0; mascara < 8; mascara++) peticiones.push([ver, nivel.toLowerCase(), mascara]);
  }
}
const refs = python(`
import json, sys, segno
sal = []
for ver, nivel, mascara in json.loads(sys.stdin.read()):
    q = segno.make('B', version=ver, error=nivel, mask=mascara, mode='byte',
                   encoding='utf-8', boost_error=False, micro=False)
    sal.append([list(f) for f in q.matrix])
print(json.dumps(sal))
`, peticiones);

let mueblesComparados = 0;
peticiones.forEach(([ver, nivel, mascara], i) => {
  const ref = refs[i];
  const etiqueta = `versión ${ver} ${nivel.toUpperCase()} máscara ${mascara}`;
  pruebas++;
  const q = QR.matriz(RELLENO, { nivel: nivel.toUpperCase(), version: ver, mascara });
  if (q.n !== ref.length) { fallo(`${etiqueta}: lado ${q.n} contra ${ref.length}`); return; }

  // Los fijos se sacan comparando dos códigos con textos distintos:
  // lo que NO cambia entre ellos es el mueble. Se apoya además en
  // que el sitio del formato sí cambia entre máscaras, que ya está
  // cubierto porque se recorren las ocho.
  const otro = QR.matriz('CC', { nivel: nivel.toUpperCase(), version: ver, mascara });
  for (const [x, y] of fijosDe(q.n, ver)) {
    mueblesComparados++;
    if (q.m[y][x] !== (ref[y][x] === 1)) {
      fallo(`${etiqueta}: el módulo fijo (${x},${y}) no coincide`);
      return;
    }
    if (q.m[y][x] !== otro.m[y][x]) {
      fallo(`${etiqueta}: el módulo (${x},${y}) debería ser fijo y cambia con el texto`);
      return;
    }
  }
});
console.log(`  ${fallos ? '❌' : '✅'} ${mueblesComparados.toLocaleString('es')} módulos fijos comparados` +
            ` (40 versiones × 4 correcciones × 8 máscaras)`);

/* Dónde están los muebles, calculado aparte del generador a
   propósito: si los dos usaran la misma cuenta, un error en esa
   cuenta se cancelaría solo y la prueba lo aprobaría. */
function fijosDe(n, ver) {
  const s = new Set();
  const mete = (x, y) => { if (x >= 0 && y >= 0 && x < n && y < n) s.add(y * n + x); };
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([ox, oy]) => {
    for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) mete(ox + dx, oy + dy);
  });
  for (let i = 8; i < n - 8; i++) { mete(i, 6); mete(6, i); }
  const pos = alineacionesDe(ver);
  pos.forEach((cy, i) => pos.forEach((cx, j) => {
    const esquina = (i === 0 && j === 0) || (i === 0 && j === pos.length - 1) ||
                    (i === pos.length - 1 && j === 0);
    if (esquina) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) mete(cx + dx, cy + dy);
  }));
  for (let i = 0; i <= 5; i++) { mete(8, i); mete(i, 8); }
  mete(8, 7); mete(8, 8); mete(7, 8);
  for (let i = 0; i < 8; i++) mete(n - 1 - i, 8);
  for (let i = 0; i < 8; i++) mete(8, n - 1 - i);
  if (ver >= 7) {
    for (let i = 0; i < 18; i++) {
      mete(Math.floor(i / 3), n - 11 + (i % 3));
      mete(n - 11 + (i % 3), Math.floor(i / 3));
    }
  }
  return [...s].map(k => [k % n, Math.floor(k / n)]);
}
function alineacionesDe(ver) {
  if (ver === 1) return [];
  const cuantos = Math.floor(ver / 7) + 2;
  const paso = (ver === 32) ? 26 : Math.ceil((ver * 4 + 4) / (cuantos * 2 - 2)) * 2;
  const res = [6];
  for (let p = ver * 4 + 10; res.length < cuantos; p -= paso) res.splice(1, 0, p);
  return res;
}

/* ════════════════════════════════════════════════════════════
   3. EL MENSAJE: que un lector de verdad lea lo que se quiso poner
   ════════════════════════════════════════════════════════════ */
console.log('\n📖 Lo que lee un teléfono (zxing decodifica los códigos generados)\n');

/* Lo que de verdad se va a imprimir, más casos que estiran el
   codificador por sitios distintos: acentos y eñes (que en UTF-8
   ocupan dos bytes y descuadran la cuenta si se cuentan letras),
   y el salto de la versión 9 a la 10, donde el campo de la
   longitud pasa de 8 a 16 bits. */
const CASOS = [
  'https://metas.policastsapien.com/buzon.html',
  'https://metas.policastsapien.com/buzon.html?de=revista',
  'A',
  'Señor Ñandú, ¿cómo está? — acentos, eñes y signos',
  'x'.repeat(154),   // la versión 9 llena, en nivel L
  'x'.repeat(155),   // el primer texto que obliga a saltar a la 10
  'Aula en acción: la Escuela Lempira sembró 120 árboles el sábado.',
];

const paraLeer = [];
CASOS.forEach(texto => NIVELES.forEach(nivel => {
  const q = QR.matriz(texto, { nivel });          // ← la máscara la elige ella sola
  paraLeer.push({ texto, nivel, ver: q.version, mascara: q.mascara,
                  m: q.m.map(f => f.map(c => (c ? 1 : 0))) });
}));

const leidos = python(`
import json, sys
import numpy as np, zxingcpp
casos = json.loads(sys.stdin.read())
sal = []
for c in casos:
    m = c['m']; n = len(m); esc, marg = 8, 4
    img = np.ones(((n + 2*marg)*esc, (n + 2*marg)*esc), dtype=np.uint8) * 255
    for y in range(n):
        for x in range(n):
            if m[y][x]:
                img[(y+marg)*esc:(y+marg+1)*esc, (x+marg)*esc:(x+marg+1)*esc] = 0
    r = zxingcpp.read_barcode(img)
    sal.append(r.text if r else '')
print(json.dumps(sal))
`, paraLeer);

let leidosOk = 0;
paraLeer.forEach((c, i) => {
  pruebas++;
  const corto = `«${c.texto.slice(0, 26)}${c.texto.length > 26 ? '…' : ''}» ${c.nivel}`;
  if (leidos[i] === c.texto) leidosOk++;
  else if (leidos[i] === '') fallo(`${corto} (v${c.ver}, máscara ${c.mascara}): ningún lector lo encuentra`);
  else fallo(`${corto}: se lee OTRA COSA → «${String(leidos[i]).slice(0, 40)}»`);
});
console.log(`  ${leidosOk === paraLeer.length ? '✅' : '❌'} ${leidosOk}/${paraLeer.length} códigos` +
            ` devuelven exactamente el texto que se les puso`);

/* Y las 160 versiones llenas hasta el borde, también leídas. Es la
   prueba que habría cazado en el acto el 5 que debía ser 6: aquel
   fallo solo salía en las versiones que usan esa casilla de la tabla,
   y con cuatro textos de ejemplo no se pisa ni la mitad. */
const leidosLim = python(`
import json, sys
import numpy as np, zxingcpp
sal = []
for c in json.loads(sys.stdin.read()):
    m = c['m']; n = len(m); esc, marg = 4, 4
    img = np.ones(((n + 2*marg)*esc, (n + 2*marg)*esc), dtype=np.uint8) * 255
    for y in range(n):
        for x in range(n):
            if m[y][x]:
                img[(y+marg)*esc:(y+marg+1)*esc, (x+marg)*esc:(x+marg+1)*esc] = 0
    r = zxingcpp.read_barcode(img)
    sal.append(r.text if r else '')
print(json.dumps(sal))
`, alLimite);

let limOk = 0;
alLimite.forEach((c, i) => {
  pruebas++;
  if (leidosLim[i] === c.texto) limOk++;
  else if (leidosLim[i] === '') fallo(`versión ${c.ver} ${c.nivel} llena (${c.texto.length} letras): ningún lector la encuentra`);
  else fallo(`versión ${c.ver} ${c.nivel} llena: se lee OTRA COSA`);
});
console.log(`  ${limOk === alLimite.length ? '✅' : '❌'} ${limOk}/${alLimite.length} versiones llenas hasta el borde` +
            ` se leen enteras (las 40, en las 4 correcciones)`);

/* ════════════════════════════════════════════════════════════
   3. El código que se va a imprimir
   ════════════════════════════════════════════════════════════ */
console.log('\n🔗 El código del buzón, el que va en la revista\n');
const DIRECCION = 'https://metas.policastsapien.com/buzon.html';
pruebas++;
const buzon = QR.matriz(DIRECCION, { nivel: 'Q' });
console.log(`  · versión ${buzon.version}, ${buzon.n}×${buzon.n} módulos, corrección Q (aguanta un 25% dañado)`);
if (buzon.version > 6) {
  fallo(`sale un código de versión ${buzon.version}: demasiado fino para imprimirlo pequeño`);
} else {
  console.log('  ✅ es de los gruesos: se lee fotocopiado y a media página');
}

console.log(`\n${fallos ? '❌' : '✅'} ${pruebas - fallos}/${pruebas} comprobaciones\n`);
process.exit(fallos ? 1 : 0);
