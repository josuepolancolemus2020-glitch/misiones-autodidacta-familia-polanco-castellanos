/* Inyecta los bancos de la misión «Átomos contra el miedo» (Ruta de los
   Átomos y los Ídolos, etapa 1: Materialismo Filosófico, materia 23 del
   Estudio Mayor) sobre el molde copiado de la etapa 1 del espejo.
   Uso:  node _dev/inyecta-bancos-atomos-miedo.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Epicuro, Carta a Meneceo: la física convertida en medicina contra
       los dos miedos (los dioses y la muerte). CLÁSICO SÓLIDO: se lee
       entera, y cabe en una tarde.
     · Lucrecio, De rerum natura (siglo I a. C.): el programa en verso,
       seis libros para curar el miedo, con el clinamen como intento de
       salvar la libertad. CLÁSICO SÓLIDO y además literatura: se lee en
       selección, libros I y III.
     · Demócrito (siglo V a. C.): no queda libro entero; se le lee POR
       FRAGMENTOS Y DOXOGRAFÍA, y así se dice cada vez que se le cita.
     · Diógenes Laercio, Vidas de los filósofos ilustres, libro X: la
       fuente antigua que preserva las cartas de Epicuro. Compilador
       tardío, valioso y de segunda mano: se lee sabiéndolo.
     · Stephen Greenblatt, El giro: DIVULGACIÓN CON INFLADO: el relato
       del hallazgo del manuscrito (1417) es bueno; su caricatura de la
       Edad Media fue corregida por los medievalistas.

   La idea que ordena todos los bancos: el gesto de Lucrecio (desarmar
   miedos enseñando el mecanismo) es el corazón de la misión, no la física
   atómica moderna. Y el error que se mata de entrada: el materialismo
   filosófico no es el consumismo; el deseo sin límite es el anzuelo.   */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-atomos-contra-miedo', 'js', 'atomos-miedo.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260817;
function rnd() { _semilla = (_semilla * 1103515245 + 12345) % 2147483648; return _semilla / 2147483648; }
const ABC = 'ABCDEFGHIJLMNOPRSTUVZ';

function haceSopa(size, palabras) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const dirs = [[0, 1], [1, 0], [1, 1]];
  const salida = [];
  for (const w of palabras) {
    let puesto = false;
    for (let intento = 0; intento < 800 && !puesto; intento++) {
      const [dr, dc] = dirs[Math.floor(rnd() * dirs.length)];
      const r0 = Math.floor(rnd() * size), c0 = Math.floor(rnd() * size);
      if (r0 + dr * (w.length - 1) >= size || c0 + dc * (w.length - 1) >= size) continue;
      let cabe = true;
      for (let i = 0; i < w.length; i++) {
        const ch = grid[r0 + dr * i][c0 + dc * i];
        if (ch !== null && ch !== w[i]) { cabe = false; break; }
      }
      if (!cabe) continue;
      const cells = [];
      for (let i = 0; i < w.length; i++) { grid[r0 + dr * i][c0 + dc * i] = w[i]; cells.push([r0 + dr * i, c0 + dc * i]); }
      salida.push({ w, cells });
      puesto = true;
    }
    if (!puesto) throw new Error('No cupo la palabra ' + w);
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++)
    if (grid[r][c] === null) grid[r][c] = ABC[Math.floor(rnd() * ABC.length)];
  return { size, grid, words: salida };
}

const B = {};

/* ---------- flashcards ---------- */
B.fcData = JSON.stringify([
  { w: 'Materialismo filosófico', a: '⚛️ La pregunta operativa: <strong>¿de qué está hecho y qué lo sostiene?</strong> No es amor a las tiendas: es negarse a comprar entidades a ciegas, se paguen con dinero, con voto o con miedo.' },
  { w: 'Los átomos y el vacío', a: '🏺 La propuesta de <strong>Leucipo y Demócrito</strong>: no hay más que átomos y vacío, y lo demás es arreglo de esas piezas. Con esa frase se funda el programa entero.' },
  { w: 'Demócrito', a: '📜 Escribió decenas de libros y <strong>no nos llegó ninguno entero</strong>: se le lee por fragmentos y por doxografía (resúmenes de autores posteriores), y así se dice cada vez que se le cita.' },
  { w: 'La doxografía', a: '🗃️ Los <strong>resúmenes antiguos de libros perdidos</strong>: autores posteriores que copian, citan y a veces deforman. Es segunda mano declarada, y declararla es parte del oficio.' },
  { w: 'El programa materialista', a: '🔥 Lo que sigue vivo del atomismo: <strong>lo que existe está hecho de algo</strong>, y lo que pasa tiene mecanismo, no capricho. La física de Demócrito quedó atrás; esta apuesta, no.' },
  { w: 'Epicuro', a: '💊 Convirtió la física en <strong>medicina</strong>: se estudia la naturaleza para quitar los miedos que gobiernan la vida. Vivía de pan y queso, y su escuela desconfiaba del deseo sin límite.' },
  { w: 'La Carta a Meneceo', a: '✉️ La carta donde Epicuro resume su medicina: <strong>cabe entera en una tarde</strong>. Se conserva porque Diógenes Laercio la copió en el libro X de sus Vidas. Clásico sólido: se lee completa.' },
  { w: 'Los dos miedos', a: '🌩️ El diagnóstico de Epicuro: a la gente la gobiernan <strong>el miedo a los dioses</strong> (el castigo del cielo) y <strong>el miedo a la muerte</strong>. Sobre esos dos se cobra casi todo lo demás.' },
  { w: 'El tetrafármaco', a: '💊 El remedio de <strong>cuatro frascos</strong>: a los dioses no se les teme; la muerte no es nada para nosotros; el bien es fácil de conseguir; el dolor es corto o llevadero.' },
  { w: '«La muerte no es nada»', a: '🌙 El segundo frasco, que es un argumento y no una anestesia: <strong>donde estamos nosotros no está la muerte; cuando está ella, ya no estamos nosotros</strong>. Se conversa, no se receta.' },
  { w: 'Los deseos con límite', a: '🍞 Los naturales y necesarios (agua, comida, techo, amistad) <strong>se cumplen y descansan</strong>. Esa es la riqueza de Epicuro: saber dónde se acaba el deseo.' },
  { w: 'El deseo sin límite', a: '🎣 El vano (fama, lujo por estatus): <strong>al cumplirse pide otro</strong>, y esa hambre perpetua es justo lo que la tienda necesita. Es el anzuelo, no el premio.' },
  { w: 'Lucrecio', a: '🖋️ El romano que puso el programa en verso: <strong>De rerum natura</strong>, seis libros de física atomista escritos para curar el miedo. Clásico sólido y además literatura.' },
  { w: 'La miel del borde', a: '🍯 Su imagen más famosa: como el médico que unta <strong>miel en el borde del vaso</strong>, el poema endulza la física para que el lector se tome la medicina sin darse cuenta.' },
  { w: 'El clinamen', a: '🌀 La <strong>desviación mínima e impredecible del átomo</strong>: el intento de Lucrecio de salvar la libertad dentro de la materia. Si todo cayera en línea recta, todo estaría ya decidido.' },
  { w: 'El gesto de Lucrecio', a: '🔬 El corazón de esta misión: los miedos <strong>se desarman enseñando el mecanismo</strong> de lo que asusta, no con burlas ni con amenazas mayores. Quien conoce el mecanismo deja de pagar.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Quiénes propusieron que no hay más que átomos y vacío?', o: ['a) Leucipo y Demócrito', 'b) Epicuro y Meneceo', 'c) Lucrecio y Cicerón', 'd) Platón y Aristóteles'], c: 0 },
  { q: 'Demócrito llega hasta nosotros…', o: ['a) Con sus libros completos', 'b) Por fragmentos y doxografía', 'c) Por una sola carta', 'd) Solo por el poema de Lucrecio'], c: 1 },
  { q: 'Según Epicuro, la naturaleza se estudia para…', o: ['a) Aprobar exámenes', 'b) Ganar discusiones', 'c) Quitar los miedos que gobiernan la vida', 'd) Hacerse rico'], c: 2 },
  { q: 'Los dos miedos que Epicuro quiere quitar son…', o: ['a) El hambre y el frío', 'b) La pobreza y la fama', 'c) La escuela y el trabajo', 'd) El de los dioses y el de la muerte'], c: 3 },
  { q: 'La Carta a Meneceo se conserva porque…', o: ['a) Diógenes Laercio la copió en su libro X', 'b) Se imprimió en Roma', 'c) Lucrecio la tradujo', 'd) Se encontró en 1417'], c: 0 },
  { q: 'El tetrafármaco es…', o: ['a) Un poema de seis libros', 'b) El remedio de cuatro frascos de la escuela', 'c) Una dieta de pan y queso', 'd) Un templo griego'], c: 1 },
  { q: 'De rerum natura es…', o: ['a) Una carta breve', 'b) Un diálogo de Platón', 'c) Seis libros de física atomista en verso', 'd) Un manual de retórica'], c: 2 },
  { q: 'El clinamen es…', o: ['a) La miel del borde del vaso', 'b) Un tipo de átomo', 'c) El miedo a los dioses', 'd) La desviación mínima que intenta salvar la libertad'], c: 3 },
  { q: 'El atomismo, hoy…', o: ['a) Sigue siendo física vigente', 'b) Como física está superado; como programa sigue vivo', 'c) Quedó refutado entero', 'd) Es un secreto de escuela'], c: 1 },
  { q: '¿En qué se equivoca quien confunde esta materia con el consumismo?', o: ['a) En nada: son lo mismo', 'b) En que Epicuro era comerciante', 'c) En que esta escuela enseña que el deseo sin límite es el anzuelo, no el premio', 'd) En que el consumismo es más antiguo'], c: 2 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Mecanismo', 'Amenaza'], headA: '🔬 Enseña el mecanismo', headB: '🌩️ Cobra con la amenaza', colA: 'ok', colB: 'no',
    words: [
      { w: 'Explica de qué está hecho el trueno', t: 'ok' }, { w: 'El kit de velas del eclipse', t: 'no' },
      { w: 'El aviso oficial con la ruta de la tormenta', t: 'ok' }, { w: 'La cadena que anuncia castigos', t: 'no' },
      { w: 'El video que enseña por qué tiembla la tierra', t: 'ok' }, { w: 'La cuota mensual de protección', t: 'no' },
      { w: 'La lista de preparación de la casa', t: 'ok' }, { w: 'El video que monetiza el pánico', t: 'no' },
    ],
  },
  {
    label: ['Con límite', 'Sin límite'], headA: '🍞 Deseo con límite', headB: '🎣 Deseo sin límite', colA: 'ok', colB: 'no',
    words: [
      { w: 'El agua cuando hay sed', t: 'ok' }, { w: 'La fama de las redes', t: 'no' },
      { w: 'Un techo que no se moje', t: 'ok' }, { w: 'El teléfono más nuevo cada año', t: 'no' },
      { w: 'La comida del día', t: 'ok' }, { w: 'Más likes que ayer', t: 'no' },
      { w: 'Los amigos de la mesa', t: 'ok' }, { w: 'El lujo que siempre pide otro', t: 'no' },
    ],
  },
  {
    label: ['Física superada', 'Programa vivo'], headA: '🏺 Física superada', headB: '🔥 Programa vivo', colA: 'ok', colB: 'no',
    words: [
      { w: 'El átomo indivisible e indestructible', t: 'ok' }, { w: 'Lo que existe está hecho de algo', t: 'no' },
      { w: 'Los átomos con ganchitos que se enredan', t: 'ok' }, { w: 'Explicar por mecanismo y no por capricho', t: 'no' },
      { w: 'Los átomos del alma, más finos y redondos', t: 'ok' }, { w: 'Auditar lo que se presenta venido de fuera', t: 'no' },
      { w: 'Contar las formas de los átomos a ojo', t: 'ok' }, { w: 'Pedir el mecanismo antes de pagar el miedo', t: 'no' },
    ],
  },
  {
    label: ['Epicuro', 'Tienda'], headA: '🏛️ La escuela de Epicuro', headB: '🛒 El materialismo de tienda', colA: 'ok', colB: 'no',
    words: [
      { w: 'Pan y queso, y la mesa con amigos', t: 'ok' }, { w: 'Comprar para calmar la ansiedad', t: 'no' },
      { w: 'El deseo con límite se cumple y descansa', t: 'ok' }, { w: 'El deseo que al cumplirse pide otro', t: 'no' },
      { w: 'La física que quita el miedo', t: 'ok' }, { w: 'La felicidad como producto en cuotas', t: 'no' },
      { w: 'Medir la riqueza por lo que no hace falta', t: 'ok' }, { w: 'Aparentar para la foto', t: 'no' },
    ],
  },
]);

/* ---------- identificar ---------- */
B.idData = JSON.stringify([
  { s: ['Los', 'átomos', 'y', 'el', 'vacío', 'son', 'lo', 'único', 'que', 'hay.'], c: 1, art: 'La pieza de Demócrito' },
  { s: ['El', 'tetrafármaco', 'es', 'el', 'remedio', 'de', 'cuatro', 'frascos.'], c: 1, art: 'El botiquín de Epicuro' },
  { s: ['Lucrecio', 'escribió', 'física', 'en', 'verso', 'para', 'curar', 'el', 'miedo.'], c: 0, art: 'El poeta del programa' },
  { s: ['El', 'clinamen', 'desvía', 'al', 'átomo', 'un', 'poquito.'], c: 1, art: 'La desviación que intenta salvar la libertad' },
  { s: ['La', 'doxografía', 'transmite', 'a', 'Demócrito', 'de', 'segunda', 'mano.'], c: 1, art: 'Cómo llega el que no tiene libro entero' },
  { s: ['El', 'deseo', 'sin', 'límite', 'es', 'el', 'anzuelo.'], c: 3, art: 'Lo que separa el pan del lujo' },
  { s: ['La', 'miel', 'del', 'borde', 'hace', 'pasar', 'la', 'medicina.'], c: 1, art: 'La imagen del poema' },
  { s: ['El', 'mecanismo', 'explicado', 'le', 'quita', 'el', 'negocio', 'al', 'miedo.'], c: 1, art: 'Lo que se enseña para no pagar' },
]);

/* ---------- completa ---------- */
B.cmpData = JSON.stringify([
  { s: 'No hay más que átomos y ___.', opts: ['vacío', 'fuego', 'agua'], c: 0 },
  { s: 'Epicuro estudia la naturaleza para quitar el ___.', opts: ['sueño', 'miedo', 'hambre'], c: 1 },
  { s: 'La Carta a Meneceo cabe entera en una ___.', opts: ['vida', 'semana', 'tarde'], c: 2 },
  { s: 'De rerum natura tiene ___ libros.', opts: ['seis', 'dos', 'doce'], c: 0 },
  { s: 'La muerte no es ___ para nosotros.', opts: ['broma', 'nada', 'poco'], c: 1 },
  { s: 'El deseo sin límite es el ___.', opts: ['premio', 'camino', 'anzuelo'], c: 2 },
  { s: 'El clinamen intenta salvar la ___.', opts: ['libertad', 'física', 'fama'], c: 0 },
  { s: 'El atomismo como física está ___.', opts: ['vivo', 'superado', 'prohibido'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Mecanismo', 'Amenaza'], btnA: '🔬 Mecanismo', btnB: '🌩️ Amenaza', colA: 'ok', colB: 'no',
    words: [
      { w: 'Explica de qué está hecho el trueno', t: 'ok' }, { w: 'El kit de velas del eclipse', t: 'no' },
      { w: 'El aviso oficial de la tormenta', t: 'ok' }, { w: 'La cadena que anuncia castigos', t: 'no' },
      { w: 'El video del mecanismo del eclipse', t: 'ok' }, { w: 'La cuota mensual de protección', t: 'no' },
      { w: 'La lista de preparación de la casa', t: 'ok' }, { w: 'El pánico monetizado', t: 'no' },
      { w: 'El experimento que cualquiera repite', t: 'ok' }, { w: 'La desgracia si no reenvías', t: 'no' },
    ],
  },
  {
    label: ['Con límite', 'Sin límite'], btnA: '🍞 Con límite', btnB: '🎣 Sin límite', colA: 'ok', colB: 'no',
    words: [
      { w: 'El agua cuando hay sed', t: 'ok' }, { w: 'La fama de las redes', t: 'no' },
      { w: 'Un techo que no se moje', t: 'ok' }, { w: 'El teléfono nuevo cada año', t: 'no' },
      { w: 'La comida del día', t: 'ok' }, { w: 'Más likes que ayer', t: 'no' },
      { w: 'Los amigos de la mesa', t: 'ok' }, { w: 'El lujo que pide otro lujo', t: 'no' },
      { w: 'El abrigo que abriga', t: 'ok' }, { w: 'La marca por la marca', t: 'no' },
    ],
  },
  {
    label: ['Física superada', 'Programa vivo'], btnA: '🏺 Superada', btnB: '🔥 Vivo', colA: 'ok', colB: 'no',
    words: [
      { w: 'El átomo indivisible', t: 'ok' }, { w: 'Todo está hecho de algo', t: 'no' },
      { w: 'Los átomos con ganchitos', t: 'ok' }, { w: 'Buscar mecanismo, no capricho', t: 'no' },
      { w: 'Los átomos del alma', t: 'ok' }, { w: 'Auditar lo venido de fuera', t: 'no' },
      { w: 'Las formas contadas a ojo', t: 'ok' }, { w: 'Pedir mecanismo antes de pagar', t: 'no' },
      { w: 'El átomo indestructible', t: 'ok' }, { w: 'Preguntar quién cobra el miedo', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo cura el poema de Lucrecio, paso a paso',
    steps: [
      'Llega el miedo: el trueno, el eclipse, la muerte',
      'El poema pregunta de qué está hecho eso que asusta',
      'Enseña el mecanismo: átomos y vacío en movimiento',
      'La miel del verso hace pasar la explicación',
      'Visto el mecanismo, el castigo del cielo se queda sin oficio',
      'El miedo pierde a su cobrador y baja de tamaño',
    ],
  },
  {
    label: 'El tetrafármaco aplicado a un miedo propio',
    steps: [
      'Nombrar el miedo por escrito, sin vergüenza',
      'Preguntar qué mecanismo hay detrás de lo que asusta',
      'Buscar qué frasco del botiquín le corresponde',
      'Separar lo que se puede preparar de lo que solo se teme',
      'Hacer la preparación que sí está en la mano',
      'Apuntar qué quedó del miedo después de verlo entero',
    ],
  },
  {
    label: 'Cómo se audita una oferta que vende miedo o deseo',
    steps: [
      'Leer la oferta completa, con el precio en lempiras',
      'Preguntar de qué está hecha: qué entrega de verdad',
      'Buscar el mecanismo: ¿enseña cómo funciona o solo amenaza y promete?',
      'Preguntar qué deseo o qué miedo la sostiene',
      'Ver si ese deseo tiene límite o pide sin fin',
      'Decidir con condición escrita, pensada en frío',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'No hay más que esto y vacío, dijeron Leucipo y Demócrito', ans: 'Los átomos', opts: ['Los átomos', 'Los dioses', 'Los deseos', 'Los versos'] },
  { desc: 'El remedio de cuatro frascos de la escuela', ans: 'El tetrafármaco', opts: ['El tetrafármaco', 'El clinamen', 'La doxografía', 'La miel del borde'] },
  { desc: 'La carta de Epicuro que cabe entera en una tarde', ans: 'La Carta a Meneceo', opts: ['La Carta a Meneceo', 'De rerum natura', 'El libro X', 'El giro'] },
  { desc: 'Seis libros de física en verso para curar el miedo', ans: 'De rerum natura', opts: ['De rerum natura', 'La Carta a Meneceo', 'Las Vidas de Laercio', 'Los fragmentos'] },
  { desc: 'La desviación mínima del átomo que intenta salvar la libertad', ans: 'El clinamen', opts: ['El clinamen', 'El vacío', 'El tetrafármaco', 'El mecanismo'] },
  { desc: 'La imagen del vaso con miel para la medicina amarga', ans: 'La miel del borde', opts: ['La miel del borde', 'El anzuelo', 'El clinamen', 'El botiquín'] },
  { desc: 'El deseo que nunca se llena, y por eso es el que más vende', ans: 'El deseo sin límite', opts: ['El deseo sin límite', 'El deseo necesario', 'El miedo con mecanismo', 'El pan y el queso'] },
  { desc: 'Copiar y resumir a un autor cuyos libros se perdieron', ans: 'La doxografía', opts: ['La doxografía', 'La traducción', 'La imprenta', 'La poesía'] },
]);

/* ---------- ¿qué está haciendo esa frase? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«¿De qué está hecho y qué lo sostiene?»', func: 'La pregunta operativa del materialismo', opts: ['La pregunta operativa del materialismo', 'El segundo frasco del tetrafármaco', 'Un deseo sin límite', 'La miel del borde'] },
  { trans: '«Donde estamos nosotros no está la muerte»', func: 'El segundo frasco del tetrafármaco', opts: ['El segundo frasco del tetrafármaco', 'La pregunta operativa', 'El clinamen', 'Una amenaza que cobra'] },
  { trans: '«Con pan y queso tengo fiesta»', func: 'El deseo con límite: se cumple y descansa', opts: ['El deseo con límite: se cumple y descansa', 'El deseo vano', 'El miedo a los dioses', 'La doxografía'] },
  { trans: '«Compra la vela o el eclipse te alcanza»', func: 'Miedo sin mecanismo: la amenaza que cobra', opts: ['Miedo sin mecanismo: la amenaza que cobra', 'Miedo con mecanismo: preparación', 'El gesto de Lucrecio', 'Un deseo natural'] },
  { trans: '«El rayo es descarga, no castigo»', func: 'El gesto de Lucrecio: mecanismo contra miedo', opts: ['El gesto de Lucrecio: mecanismo contra miedo', 'El anzuelo del deseo', 'La suscripción al miedo', 'Física de decorado'] },
]);

/* ---------- diagnóstico: ¿por dónde falla? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Jael paga L 1.200 por un curso que promete abundancia sin límite', characteristic: 'El anzuelo del deseo sin tope: la promesa que nunca se llena es la que más vende', opts: ['El anzuelo del deseo sin tope: la promesa que nunca se llena es la que más vende', 'El curso era demasiado corto', 'Faltó pagar la versión premium', 'Jael no puso suficiente fe'] },
  { disease: 'La cadena del eclipse pide comprar velas antes del viernes', characteristic: 'Miedo sin mecanismo: la amenaza cobra lo que la explicación cura gratis', opts: ['Miedo sin mecanismo: la amenaza cobra lo que la explicación cura gratis', 'Las velas eran de mala calidad', 'El eclipse era de verdad peligroso', 'Faltaba reenviar a más contactos'] },
  { disease: 'Alguien dice que estudiar materialismo es volverse comprador de lujos', characteristic: 'Confunde el materialismo filosófico con el de tienda: esta escuela enseña el límite del deseo', opts: ['Confunde el materialismo filosófico con el de tienda: esta escuela enseña el límite del deseo', 'Tiene razón: es lo mismo', 'El error es estudiar filosofía', 'Epicuro vendía productos'] },
  { disease: 'Un vendedor jura que la física cuántica garantiza prosperidad', characteristic: 'Física de decorado: usa palabras de ciencia sin enseñar un mecanismo comprobable', opts: ['Física de decorado: usa palabras de ciencia sin enseñar un mecanismo comprobable', 'La cuántica sí atrae dinero', 'Le faltó citar más científicos', 'El precio era el problema'] },
  { disease: 'Angelly no duerme pensando en la muerte y nadie le habla del tema', characteristic: 'El miedo sin conversación crece: el argumento de Epicuro se conversa, no se calla', opts: ['El miedo sin conversación crece: el argumento de Epicuro se conversa, no se calla', 'A las niñas no se les habla de eso', 'Es un problema de sueño, no de miedo', 'Falta comprarle algo que la distraiga'] },
  { disease: 'La casa trata igual el aviso del huracán que el video del castigo', characteristic: 'Mezcla dos miedos: el del mecanismo se prepara; el de la amenaza solo se paga', opts: ['Mezcla dos miedos: el del mecanismo se prepara; el de la amenaza solo se paga', 'Los dos mensajes son basura', 'Los dos mensajes son igual de útiles', 'El huracán no existe'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'No hay más que átomos y vacío.', type: 'El atomismo de Leucipo y Demócrito' },
  { s: 'Se estudia la naturaleza para quitar el miedo.', type: 'El programa de Epicuro' },
  { s: 'La muerte no es nada para nosotros.', type: 'El segundo frasco del tetrafármaco' },
  { s: 'Seis libros de física en verso.', type: 'De rerum natura (Lucrecio)' },
  { s: 'La desviación mínima del átomo.', type: 'El clinamen' },
  { s: 'El vaso con miel en el borde.', type: 'La imagen de Lucrecio para el poema' },
  { s: 'El deseo que nunca se llena.', type: 'El deseo vano (sin límite)' },
  { s: 'Pan, agua, techo y amigos.', type: 'Los deseos naturales y necesarios' },
  { s: 'Copias y resúmenes de libros perdidos.', type: 'La doxografía' },
  { s: '¿De qué está hecho y qué lo sostiene?', type: 'La pregunta operativa del materialismo' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'Los átomos y el vacío', gen: 'Física antigua', n: 'Lo único que hay, dijo Demócrito', g: 'Siglo V antes de Cristo', t: 'Atomismo' },
  { w: 'La Carta a Meneceo', gen: 'Fuente primaria', n: 'Cabe entera en una tarde', g: 'Escuela de Epicuro', t: 'Clásico sólido' },
  { w: 'De rerum natura', gen: 'Fuente primaria', n: 'Física en verso, seis libros', g: 'Roma, siglo I antes de Cristo', t: 'Clásico sólido y literatura' },
  { w: 'El giro (Greenblatt)', gen: 'Divulgación', n: 'El hallazgo del manuscrito en 1417', g: 'Historia moderna', t: 'Divulgación con inflado' },
  { w: 'El tetrafármaco', gen: 'Herramienta', n: 'Cuatro frascos contra dos miedos', g: 'Escuela de Epicuro', t: 'Medicina filosófica' },
  { w: 'El clinamen', gen: 'Hipótesis antigua', n: 'Desviación mínima del átomo', g: 'De rerum natura, libro II', t: 'Intento de salvar la libertad' },
  { w: 'El deseo sin límite', gen: 'Diagnóstico', n: 'Nunca se llena, y por eso vende', g: 'La tienda y la red', t: 'El anzuelo' },
  { w: 'La doxografía', gen: 'Transmisión', n: 'Resume libros perdidos', g: 'Antigüedad tardía', t: 'Segunda mano declarada' },
  { w: 'Diógenes Laercio, libro X', gen: 'Fuente antigua', n: 'Preserva las cartas de Epicuro', g: 'Vidas de los filósofos ilustres', t: 'El archivero del programa' },
  { w: 'El aviso del huracán', gen: 'Mecanismo', n: 'Explica y prepara, no amenaza', g: 'La casa, hoy', t: 'Miedo que se trabaja' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'Leucipo y Demócrito propusieron átomos y ___.', opts: ['vacío', 'fuego', 'números'], ans: 'vacío' },
  { s: 'Epicuro convirtió la física en ___.', opts: ['medicina', 'negocio', 'poesía'], ans: 'medicina' },
  { s: 'Los dos miedos: los dioses y la ___.', opts: ['muerte', 'pobreza', 'noche'], ans: 'muerte' },
  { s: 'Lucrecio escribió la física en ___.', opts: ['verso', 'tablas', 'cartas'], ans: 'verso' },
  { s: 'La miel del borde hace pasar la ___.', opts: ['medicina', 'tarea', 'tarde'], ans: 'medicina' },
  { s: 'El deseo sin límite es el ___.', opts: ['anzuelo', 'premio', 'motor'], ans: 'anzuelo' },
  { s: 'El atomismo como programa sigue ___.', opts: ['vivo', 'preso', 'igual'], ans: 'vivo' },
  { s: 'Demócrito llega por fragmentos y ___.', opts: ['doxografía', 'fotos', 'actas'], ans: 'doxografía' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Por qué un poema de física quita el miedo? Explícalo en cinco minutos, como pide el compendio.', ans: 'Porque los miedos grandes (el castigo del cielo, la muerte) se alimentan de no saber cómo funcionan las cosas: donde no hay mecanismo, cualquiera puede poner una amenaza y cobrarla. De rerum natura enseña, verso a verso, de qué está hecho lo que asusta: el trueno es choque de nubes y descarga, no puntería divina; el mundo es átomos y vacío en movimiento, no un tribunal. La poesía es la miel del borde del vaso: hace pasar la explicación. Y visto el mecanismo, el miedo pierde a su cobrador: no desaparece del todo, pero baja al tamaño de lo que de verdad es. Ese gesto (curar enseñando cómo funciona) es el corazón de la misión.' },
  { q: '¿Qué es el tetrafármaco y cómo se aplica a un miedo de esta casa?', ans: 'Es el remedio de cuatro frascos de la escuela de Epicuro: a los dioses no hay que temerles; la muerte no es nada para nosotros; el bien es fácil de conseguir; el dolor es corto o llevadero. Se aplica por escrito: se nombra el miedo (por ejemplo, la pregunta de Angelly después del funeral), se busca su mecanismo, se elige el frasco que le toca (el segundo: donde estamos nosotros no está la muerte), y se conversa como argumento, a la edad de quien pregunta y sin atropellar lo que la familia cree. El tetrafármaco es herramienta de mesa, no anestesia: el duelo es real y no se desmonta.' },
  { q: '¿En qué se equivoca exactamente quien confunde esta materia con el materialismo de tienda?', ans: 'La entendió al revés. El materialismo de tienda necesita deseos sin límite: que el teléfono de este año pida el del que viene, que la felicidad se venda en cuotas. La escuela materialista más famosa de la historia enseñaba lo contrario: Epicuro vivía de pan y queso, clasificaba los deseos, y advertía que el deseo sin límite es el anzuelo, no el premio, porque nunca se llena. El materialismo filosófico pregunta de qué está hecho lo que te venden y quién lo sostiene: es la herramienta con que se le dice que no a la tienda, no su vitrina.' },
  { q: '¿Qué está superado y qué sigue vivo del atomismo de Demócrito?', ans: 'Superada está la física: el átomo indivisible e indestructible, los átomos con ganchitos, los átomos finos del alma. El átomo de Demócrito no es el de la tabla periódica, y hasta el «átomo» moderno se parte. Vivo sigue el programa: lo que existe está hecho de algo, lo que pasa tiene mecanismo y no capricho, y lo que se presenta como venido de fuera del mundo se puede auditar. La ciencia entera terminó adoptando esa apuesta. Decir cuál es cuál, sin mezclarlas, es la cuarta regla de la etapa.' },
  { q: '¿Cómo llega Demócrito hasta nosotros, y por qué hay que decirlo al citarlo?', ans: 'No nos llegó ninguno de sus libros entero: se le lee por fragmentos (citas sueltas en otros autores) y por doxografía (resúmenes antiguos que copian, ordenan y a veces deforman). Decirlo al citarlo es la regla del estatus aplicada a la Antigüedad: una frase de Demócrito llega con siglos de intermediarios, y quien la cita como si la hubiera leído en el original está inflando su fuente. Lo mismo vale para Epicuro: sus cartas sobreviven porque Diógenes Laercio las copió en su libro X, y Laercio es un compilador tardío, valioso y de segunda mano.' },
  { q: '¿Qué es el clinamen y qué problema intenta resolver?', ans: 'Es la desviación mínima e impredecible que Lucrecio le atribuye al átomo en su caída. El problema que ataca es serio: si todo es materia cayendo en línea recta por leyes fijas, todo estaría ya decidido, y no habría lugar para la libertad ni sentido en dar consejos. El clinamen abre una holgura dentro de la materia para que la libertad quepa. Como física es un parche antiguo; como problema sigue abierto (la materia y la libertad se siguen discutiendo hoy), y verlo planteado en verso hace veintiún siglos enseña que el programa materialista carga sus propias preguntas difíciles, y las declara en vez de esconderlas.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['ATOMOS', 'VACIO', 'DEMOCRITO', 'LEUCIPO', 'MIEDO', 'FISICA']),
  haceSopa(10, ['EPICURO', 'MENECEO', 'PLACER', 'LIMITE', 'DIOSES', 'MUERTE']),
  haceSopa(10, ['LUCRECIO', 'CLINAMEN', 'POEMA', 'VERSO', 'MIEL', 'NATURA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'Leucipo y Demócrito propusieron que no hay más que átomos y vacío.', a: true },
  { q: 'Demócrito nos llegó con sus libros completos.', a: false },
  { q: 'Epicuro enseñaba a acumular lujos para ser feliz.', a: false },
  { q: 'La Carta a Meneceo se puede leer entera en una tarde.', a: true },
  { q: 'Los dos miedos de Epicuro son el de los dioses y el de la muerte.', a: true },
  { q: 'El tetrafármaco tiene cuatro remedios.', a: true },
  { q: 'De rerum natura es un tratado en prosa.', a: false },
  { q: 'La miel del borde es la poesía que hace pasar la física.', a: true },
  { q: 'El clinamen es la desviación mínima del átomo.', a: true },
  { q: 'El átomo de Demócrito es el mismo de la tabla periódica.', a: false },
  { q: 'El atomismo como programa sigue vivo.', a: true },
  { q: 'El materialismo filosófico es lo mismo que el consumismo.', a: false },
  { q: 'Los deseos naturales y necesarios tienen límite.', a: true },
  { q: 'Según los medievalistas, El giro retrata la Edad Media con justicia.', a: false },
  { q: 'Diógenes Laercio preservó las cartas de Epicuro en su libro X.', a: true },
]);
B.evalMCBank = JSON.stringify([
  { q: '¿Quiénes fundaron el atomismo?', o: ['a) Leucipo y Demócrito', 'b) Epicuro y Meneceo', 'c) Lucrecio y Cicerón', 'd) Platón y Aristóteles'], a: 0 },
  { q: 'Demócrito llega a nosotros…', o: ['a) Con obras completas', 'b) Por fragmentos y doxografía', 'c) Por una película', 'd) Solo por Lucrecio'], a: 1 },
  { q: 'Para Epicuro, la física se estudia para…', o: ['a) Aprobar exámenes', 'b) Ganar debates', 'c) Quitar los miedos', 'd) Hacerse rico'], a: 2 },
  { q: 'Los dos miedos que gobiernan a la gente son…', o: ['a) Al hambre y al frío', 'b) A la escuela y al trabajo', 'c) A la pobreza y a la fama', 'd) A los dioses y a la muerte'], a: 3 },
  { q: 'La Carta a Meneceo se conserva gracias a…', o: ['a) Diógenes Laercio, libro X', 'b) Greenblatt', 'c) Un discurso de Cicerón', 'd) La tradición oral'], a: 0 },
  { q: 'El tetrafármaco es…', o: ['a) Un poema de amor', 'b) El remedio de cuatro frascos', 'c) Una dieta antigua', 'd) Un templo'], a: 1 },
  { q: 'De rerum natura es…', o: ['a) Una carta breve', 'b) Un diálogo', 'c) Física atomista en seis libros de verso', 'd) Un manual de retórica'], a: 2 },
  { q: 'La miel del borde del vaso es…', o: ['a) Una receta médica', 'b) Un postre romano', 'c) El clinamen', 'd) La poesía que hace pasar la física'], a: 3 },
  { q: 'El clinamen intenta salvar…', o: ['a) La libertad dentro de la materia', 'b) La fama de Epicuro', 'c) El honor de los dioses', 'd) La rima del poema'], a: 0 },
  { q: 'El atomismo como física…', o: ['a) Sigue igual que entonces', 'b) Está superado', 'c) Nunca existió', 'd) Es secreto'], a: 1 },
  { q: 'El atomismo como programa…', o: ['a) Se abandonó', 'b) Es solo poesía', 'c) Sigue vivo y ganando', 'd) Quedó en Grecia'], a: 2 },
  { q: 'Confundir esta materia con el consumismo es un error porque…', o: ['a) Epicuro era banquero', 'b) El consumismo es griego', 'c) Lucrecio vendía cursos', 'd) La escuela enseña que el deseo sin límite es el anzuelo'], a: 3 },
  { q: 'El giro, de Greenblatt, se lee como…', o: ['a) Divulgación con inflado: buen relato, Edad Media en caricatura', 'b) Clásico sólido', 'c) Fuente primaria', 'd) Ciencia en disputa'], a: 0 },
  { q: 'El corazón de esta misión es…', o: ['a) La tabla periódica', 'b) El gesto de Lucrecio: desarmar miedos enseñando el mecanismo', 'c) Memorizar fechas', 'd) La química moderna'], a: 1 },
  { q: 'Un deseo natural y necesario…', o: ['a) No existe', 'b) Nunca se cumple', 'c) Tiene límite y se cumple con poco', 'd) Es el anzuelo'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'No hay más que átomos y ___.', a: 'vacío' },
  { q: 'Los fundadores del atomismo: Leucipo y ___.', a: 'Demócrito' },
  { q: 'Epicuro convirtió la física en ___.', a: 'medicina' },
  { q: 'La carta de Epicuro que se lee entera: Carta a ___.', a: 'Meneceo' },
  { q: 'El remedio de cuatro frascos es el ___.', a: 'tetrafármaco' },
  { q: 'La muerte no es ___ para nosotros.', a: 'nada' },
  { q: 'Lucrecio escribió De rerum ___.', a: 'natura' },
  { q: 'La desviación mínima del átomo es el ___.', a: 'clinamen' },
  { q: 'La poesía es la ___ del borde del vaso.', a: 'miel' },
  { q: 'El deseo sin límite es el ___.', a: 'anzuelo' },
  { q: 'Demócrito llega por fragmentos y ___.', a: 'doxografía' },
  { q: 'Las cartas de Epicuro las preserva Diógenes ___.', a: 'Laercio' },
  { q: 'El atomismo como programa sigue ___.', a: 'vivo' },
  { q: 'Epicuro vivía de pan y ___.', a: 'queso' },
  { q: 'El miedo se desarma enseñando el ___.', a: 'mecanismo' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Atomismo', def: 'No hay más que átomos y vacío' },
  { term: 'Demócrito', def: 'El fundador que llega por fragmentos y doxografía' },
  { term: 'Epicuro', def: 'Convirtió la física en medicina contra el miedo' },
  { term: 'Carta a Meneceo', def: 'La carta que cabe entera en una tarde' },
  { term: 'Tetrafármaco', def: 'El remedio de cuatro frascos' },
  { term: 'Lucrecio', def: 'Puso el programa entero en verso' },
  { term: 'De rerum natura', def: 'Seis libros de física para curar el miedo' },
  { term: 'Clinamen', def: 'La desviación mínima que intenta salvar la libertad' },
  { term: 'La miel del borde', def: 'La poesía que hace pasar la medicina' },
  { term: 'Doxografía', def: 'Resúmenes antiguos de libros perdidos' },
  { term: 'Diógenes Laercio', def: 'Preservó las cartas de Epicuro en su libro X' },
  { term: 'El deseo sin límite', def: 'El anzuelo, no el premio' },
  { term: 'Deseo natural y necesario', def: 'Pan, agua, techo: tiene límite y descansa' },
  { term: 'El giro', def: 'Divulgación con inflado sobre el hallazgo del manuscrito' },
  { term: 'El programa materialista', def: 'Todo lo que existe está hecho de algo, y se audita' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'A Jael le llega por WhatsApp un curso de «abundancia y felicidad» a L 1.200: doce videos, un grupo de Telegram y la promesa de que la felicidad es una decisión diaria. Varias amigas ya pagaron.' },
  { txt: 'Llega la cadena del eclipse: «el del viernes trae desgracias a quien no se prepare», con un kit de velas y sales a L 350 y la orden de reenviar a diez contactos. Angelly pregunta asustada si es cierto.' },
  { txt: 'Jael pide un teléfono de L 18.000 «porque lo necesita para estudiar». El que tiene funciona; el nuevo es el que sale en los videos de sus amigas.' },
  { txt: 'Un colegio ofrece L 8.000 por incluir en M.E.T.A.S una misión de «mentalidad de abundancia», con frases de motivación y visualización de riqueza.' },
  { txt: 'Después del funeral de un vecino, Angelly no puede dormir y pregunta: «¿a dónde va uno cuando se muere?». No hay oferta ni lempiras: hay una niña despierta a las diez de la noche.' },
  { txt: 'Un programa de radio ofrece una «oración de protección personalizada» por L 500 mensuales, con testimonios de desgracias que les cayeron a los que dejaron de pagar.' },
  { txt: 'Un vendedor ofrece al autor un curso de «física cuántica de la prosperidad» a L 2.500, y propone que M.E.T.A.S lo revenda a sus usuarios.' },
  { txt: 'Se anuncia un huracán. Al grupo de WhatsApp llegan dos mensajes: el aviso oficial con la ruta y las recomendaciones, y un video monetizado que grita que «esto es castigo» y pide donaciones.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué miedo o qué deseo sostiene este caso, y tiene límite o pide sin fin?',
  '2. ¿Qué mecanismo hay detrás: quién lo enseña, quién lo esconde y quién cobra por mantenerlo escondido?',
  '3. ¿Qué frasco del tetrafármaco, o qué distinción de la etapa, le toca a este caso?',
  '4. ¿Qué condición escrita deja la casa, y qué se le contesta a quien trajo la oferta, sin burlarse de nadie?',
]);
B.critCaseGuides = JSON.stringify([
  'Se busca primero el motor del caso: un miedo (el castigo, la muerte, la desgracia) o un deseo (la abundancia, el estatus, la pertenencia). Y se le mide el tope: el deseo natural y necesario se cumple y descansa; el deseo vano y el miedo difuso piden sin fin, y esa hambre perpetua es exactamente lo que la oferta necesita para renovarse. Un caso sin motor identificado no está auditado.',
  'Después se pregunta por el mecanismo. Si alguien lo enseña (el aviso oficial, el video del eclipse, el experimento repetible), el caso se trabaja gratis. Si nadie lo enseña y en su lugar hay amenaza, testimonio o palabras de ciencia sin experimento, hay que buscar la caja: el miedo sin mecanismo casi siempre tiene un cobrador cerca, y nombrarlo es la mitad de la auditoría.',
  'El tetrafármaco se aplica frasco por frasco: al castigo del cielo le toca el primero (a los dioses no se les teme, y el mecanismo del eclipse lo confirma); a la pregunta de la muerte, el segundo, conversado como argumento y no recetado; a la promesa de abundancia, la tabla de los deseos (el bien es fácil de conseguir: pan, techo, amigos); al dolor y al huracán, el cuarto y la preparación. Si ningún frasco calza, la distinción mecanismo contra amenaza suele resolver el resto.',
  'Todo caso termina con la condición escrita, pensada en frío: qué tendría que mostrar la oferta para que el sí fuera posible (el mecanismo comprobable, el experimento repetible, el precio contra la alternativa gratuita), y qué se contesta sin burla, porque esta casa también vive dentro de creencias y también tiene miedos. Casi ninguna oferta se acepta o se rechaza completa: se acepta con condiciones, y las condiciones se escriben antes de contestar.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"El materialismo es amar las compras y el lujo".', g1: 'Confunde la materia de estudio con la tienda: el materialismo filosófico pregunta de qué está hecho lo que te venden, y su escuela más famosa vivía de pan y queso.', g2: 'La corrección exacta: esta escuela enseña que el deseo sin límite es el anzuelo, no el premio. Es la herramienta para decirle que no a la tienda, no su vitrina.' },
  { txt: '"Si el átomo de Demócrito no es el de la química, todo el programa quedó refutado".', g1: 'Mezcla la física con el programa: la física antigua (átomo indivisible, ganchitos) sí está superada, y se dice sin pena.', g2: 'El programa (todo está hecho de algo, todo tiene mecanismo) no solo sigue vivo: es la apuesta que la ciencia entera terminó adoptando. Se corrige separando las dos cosas.' },
  { txt: '"Epicuro enseñaba a darse todos los gustos".', g1: 'Al revés: su escuela clasificaba los deseos y enseñaba que los naturales y necesarios se cumplen con poco, mientras el deseo vano nunca se llena.', g2: 'El «placer» de Epicuro es la ausencia de dolor y de miedo, no el banquete: por eso el tetrafármaco es su centro y el pan con queso su mesa.' },
  { txt: '"El eclipse trae castigo: mejor compro las velas, por si acaso".', g1: 'El «por si acaso» es el modelo de negocio: la amenaza no enseña mecanismo, y cobra exactamente porque no lo enseña.', g2: 'La cura cuesta cero: el mecanismo del eclipse explicado. Visto el mecanismo, el castigo se queda sin oficio y las velas sin cliente.' },
  { txt: '"A la niña no se le habla de la muerte, para que no se asuste".', g1: 'El miedo sin conversación no se apaga: crece de noche. Callarlo es dejárselo entero a quien sí quiera cobrárselo después.', g2: 'El segundo frasco se conversa como argumento, a su edad y sin atropellar lo que la familia cree: el duelo es real y no se desmonta; el terror nocturno sí se trabaja.' },
  { txt: '"El poema de Lucrecio es solo literatura bonita; la física sobra".', g1: 'Parte el poema por la mitad: la miel del borde existe para hacer pasar la medicina. Sin la física, el verso es vaso vacío.', g2: 'La lectura completa es el gesto: física para curar, poesía para que la cura entre. Por eso se lee como clásico sólido y además como literatura, con las dos etiquetas.' },
]);
B.critDecisionBank = JSON.stringify([
  'El curso de abundancia de L 1.200 espera respuesta de Jael esta semana: ¿qué pregunta única se le hace a la oferta, y qué alternativa gratuita tiene la casa en la biblioteca?',
  'La cadena del eclipse ya asustó a Angelly: ¿se le compran las velas, se le prohíbe el teléfono, o se hace otra cosa esta noche? ¿Qué exactamente?',
  'Jael insiste con el teléfono de L 18.000: ¿cómo se parte la petición con la tabla de los deseos, y qué condición se le escribe?',
  'El colegio ofrece L 8.000 por la misión de «mentalidad de abundancia» en M.E.T.A.S: ¿qué pregunta decide, y qué contrapropuesta honesta cabe?',
  'Angelly pregunta por la muerte a las diez de la noche: ¿qué frasco se abre, cómo se conversa a su edad, y qué no se hace?',
  'La «oración de protección» de L 500 mensuales suena en la radio de la casa: ¿qué se audita y qué se respeta, y cuál es la pregunta que termina la conversación?',
  'El vendedor cuántico ofrece comisión por revender en M.E.T.A.S: ¿qué se le pide que muestre, y por qué la reventa ni se conversa?',
  'El huracán viene en camino y llegaron los dos mensajes: ¿cuál se convierte en lista, cuál se archiva como espécimen, y qué aprende la familia del par?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Explicar el mecanismo del eclipse con un video, juntos.', b: 'Comprar el kit de velas de L 350, por si acaso.', ga: 'Caso A: el miedo se desarma de raíz y gratis, y Angelly aprende un gesto que sirve para todas las cadenas que vienen.', gb: 'Caso B: se paga la cuota del miedo, la cadena queda confirmada como verdadera, y el próximo kit ya tiene cliente.', gr: 'La diferencia no es el gasto: es quién se queda con el miedo. El mecanismo lo apaga; la compra lo alquila y lo renueva.' },
  { a: 'Leer la Carta a Meneceo, que es gratis y cabe en una tarde.', b: 'Pagar L 1.200 por el curso de abundancia de doce videos.', ga: 'Caso A: la versión seria del mismo tema, de primera mano, con veintitrés siglos de servicio comprobado y sin grupo de Telegram.', gb: 'Caso B: la promesa de un deseo sin límite, que no se llena y por diseño pide el siguiente curso.', gr: 'Cuando la alternativa gratuita es mejor que la de pago, la oferta no compite con la biblioteca: compite con no haberla abierto.' },
  { a: 'Cubrir el teléfono de L 4.000 que cumple el deseo con límite.', b: 'Pagar los L 18.000 del teléfono que sale en los videos.', ga: 'Caso A: el deseo natural (estudiar con un aparato que funcione) se cumple y descansa, y quedan L 14.000 para lo que sí tiene fondo.', gb: 'Caso B: se compra estatus, que es deseo sin límite: el año que viene el aparato nuevo será viejo y la petición volverá más cara.', gr: 'La tabla de los deseos no es tacañería: es saber qué parte del precio compra la cosa y qué parte alimenta el anzuelo.' },
  { a: 'El aviso oficial del huracán, convertido en lista de preparación.', b: 'El video del castigo, con su enlace de donación.', ga: 'Caso A: miedo con mecanismo: enseña de qué está hecho el peligro y qué hacer, y termina en agua, radio y documentos en alto.', gb: 'Caso B: miedo con cobrador: no prepara nada, sube el pánico y lo monetiza; es el tetrafármaco al revés.', gr: 'El mismo huracán produce los dos miedos: el que se trabaja cuesta cero lempiras, y el que se compra no protege de nada.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'La cadena amenaza sin explicar el mecanismo del eclipse.', guide: 'El miedo queda entero y sin dueño, el kit de velas encuentra cliente, y la próxima cadena llega a una casa que ya demostró que paga.' },
  { cause: 'La casa explica el mecanismo de lo que asusta, juntos y sin burla.', guide: 'El miedo baja al tamaño de lo que de verdad es, el cobrador se queda sin oficio, y las niñas aprenden el gesto de Lucrecio para la siguiente amenaza.' },
  { cause: 'Se alimenta un deseo sin límite como si fuera necesidad.', guide: 'El deseo se cumple y no descansa: pide el siguiente teléfono, el siguiente curso, la siguiente cuota, y el presupuesto de la casa financia un pozo sin fondo.' },
  { cause: 'Se cita a Demócrito como si sus libros se conservaran enteros.', guide: 'La fuente queda inflada: lo que llega es fragmento y doxografía con siglos de intermediarios, y quien no lo declara le presta a su cita una firmeza que no tiene.' },
  { cause: 'La pregunta de la muerte se calla «para no asustar».', guide: 'El miedo crece de noche y sin conversación, y queda disponible entero para el primer cobrador que pase con una promesa y una tarifa.' },
  { cause: 'Una oferta usa palabras de ciencia sin experimento que mostrar.', guide: 'La física funciona como decorado: presta autoridad sin prestar mecanismo, y el único flujo comprobable termina siendo el precio del curso.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'La cadena del eclipse murió en el teléfono de la casa, sin reenvío ni compra.', guide: 'Se abrió el video del mecanismo y lo miraron juntos: visto cómo funciona, la amenaza quedó sin oficio, y Angelly aprendió la pregunta que mata cadenas: ¿quién gana si el miedo sigue vivo?' },
  { effect: 'Jael declinó el curso de abundancia sin pelear con sus amigas.', guide: 'Se hizo la pregunta única: ¿qué sabe hacer quien lo termina que no supiera antes? El silencio bastó, y la Carta a Meneceo (gratuita y de una tarde) quedó como la versión seria del tema.' },
  { effect: 'El teléfono se resolvió con L 4.000 y sin drama.', guide: 'La tabla de los deseos partió la petición: el deseo con límite (estudiar) lo cubrió la casa; el deseo de estatus, si lo quiere, lo ahorra ella, y con eso se mide solo.' },
  { effect: 'La conversación de la muerte terminó con Angelly dormida y sin sustos nuevos.', guide: 'Se abrió el segundo frasco como argumento y a su edad: donde estamos nosotros no está la muerte. La familia terminó la conversación con lo suyo, y el miedo dejó de crecer a oscuras.' },
  { effect: 'La casa pasó el huracán preparada y sin donar al pánico.', guide: 'El aviso oficial se volvió lista (agua, radio, documentos en alto) y el video del castigo se archivó como espécimen de miedo con cobrador para esta misión.' },
  { effect: 'El vendedor cuántico no volvió a llamar.', guide: 'Se le pidió lo único que la física de verdad siempre tiene: el experimento que cualquiera puede repetir. No existía, y la reventa en M.E.T.A.S ni se conversó: la plataforma enseña lo contrario.' },
]);

/* ---------- línea de tiempo: los siete momentos ---------- */
B.timelineData = JSON.stringify([
  { y: 'S. V a. C.', icon: '🏺', label: 'Átomos y vacío', text: '<strong>Leucipo y Demócrito</strong> proponen que no hay más que átomos y vacío. <strong>Aporta:</strong> el programa entero en una frase. <strong>Cuidado:</strong> no queda libro entero; se les lee por fragmentos y doxografía, y así se dice.' },
  { y: '306 a. C.', icon: '🏛️', label: 'El Jardín', text: 'Epicuro funda su escuela en Atenas: <strong>el Jardín</strong>, con amigos, pan y queso. <strong>Aporta:</strong> la física convertida en medicina. <strong>Cuidado:</strong> desde entonces lo caricaturizan como glotón; era casi lo contrario.' },
  { y: '~300 a. C.', icon: '✉️', label: 'La Carta a Meneceo', text: 'La medicina resumida en una carta que <strong>cabe entera en una tarde</strong>: los dos miedos, el tetrafármaco, la tabla de los deseos. <strong>Sobrevive</strong> porque Diógenes Laercio la copia siglos después en su libro X.' },
  { y: 'S. I a. C.', icon: '📜', label: 'De rerum natura', text: 'Lucrecio pone el programa <strong>en seis libros de verso</strong>: la miel del borde, el clinamen, el miedo desarmado con mecanismo. <strong>Aporta:</strong> el gesto que es el corazón de esta misión. Clásico sólido y además literatura.' },
  { y: '1417', icon: '🔦', label: 'El manuscrito', text: 'Poggio Bracciolini encuentra en un monasterio una copia de De rerum natura <strong>que estuvo a nada de perderse</strong>. Greenblatt lo cuenta en El giro: <strong>divulgación con inflado</strong>: buen relato, Edad Media en caricatura.' },
  { y: 'S. XIX y XX', icon: '⚗️', label: 'La física se va', text: 'La química y la física modernas toman la palabra «átomo» y la cambian entera: <strong>el de Demócrito no es el de la tabla periódica</strong>, y el moderno hasta se parte. <strong>La física antigua queda superada, y se dice sin pena.</strong>' },
  { y: 'Hoy', icon: '⚛️', label: 'El programa vivo', text: 'Lo que sigue en pie: <strong>todo lo que actúa está hecho de algo</strong>, lo que pasa tiene mecanismo, y lo que se presenta venido de fuera se audita. <strong>En esta casa:</strong> la pregunta operativa se corre contra miedos y ofertas reales.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  atomos: {
    nombre: 'Los átomos y el vacío', icon: '🏺',
    estructura: { title: 'Qué es', info: '• La propuesta de <strong>Leucipo y Demócrito</strong> (siglo V a. C.)<br>• No hay más que <strong>átomos y vacío</strong>: lo demás es arreglo de eso<br>• Funda el programa: lo que existe <strong>está hecho de algo</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Pregunta de bolsillo: ¿esto <strong>tiene mecanismo</strong> o se presenta como capricho?<br>• «El trueno es descarga»: programa<br>• «El trueno es puntería divina»: lo que el programa vino a jubilar' },
    enfermedades: { title: 'Dónde se cae', info: '• Confundiendo <strong>la física antigua</strong> (superada) con <strong>el programa</strong> (vivo)<br>• Citando a Demócrito como si sus libros se conservaran<br>• Olvidando decir <strong>fragmentos y doxografía</strong>' },
    cuidados: { title: 'En esta casa', info: '• Toda cita antigua lleva su <strong>cómo nos llegó</strong><br>• La pregunta operativa se usa a diario: <strong>¿de qué está hecho?</strong><br>• Y la física moderna se estudia en su materia, no aquí' },
  },
  botiquin: {
    nombre: 'El tetrafármaco', icon: '💊',
    estructura: { title: 'Qué es', info: '• El remedio de <strong>cuatro frascos</strong> de la escuela de Epicuro<br>• A los dioses no se les teme · la muerte no es nada<br>• El bien es fácil de conseguir · el dolor es corto o llevadero' },
    funcion: { title: 'Cómo se reconoce', info: '• Cada miedo grande de la casa <strong>tiene su frasco</strong><br>• El del castigo: el primero, con el mecanismo delante<br>• El de la muerte: el segundo, <strong>conversado como argumento</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Usándolo como <strong>anestesia</strong>: el duelo es real y no se desmonta<br>• Recitándolo sin conversar<br>• Aplicándolo a miedos <strong>con mecanismo</strong>, que lo que piden es preparación' },
    cuidados: { title: 'En esta casa', info: '• Se aplica <strong>por escrito y a miedos reales</strong><br>• Con las niñas: a su edad, en su idioma y sin atropellar lo que la familia cree<br>• Y el resultado se apunta: qué quedó del miedo al verlo entero' },
  },
  poema: {
    nombre: 'El poema que cura', icon: '📜',
    estructura: { title: 'Qué es', info: '• <strong>De rerum natura</strong>: seis libros de física atomista en verso<br>• Escrito por Lucrecio <strong>para curar el miedo</strong><br>• Clásico sólido y además literatura: se lee en selección (libros I y III)' },
    funcion: { title: 'Cómo se reconoce', info: '• La <strong>miel del borde</strong>: el verso hace pasar la medicina<br>• El <strong>clinamen</strong>: la desviación que intenta salvar la libertad<br>• El gesto: <strong>enseñar el mecanismo</strong> de lo que asusta' },
    enfermedades: { title: 'Dónde se cae', info: '• Leyéndolo <strong>solo como literatura</strong>: sin física, el vaso queda vacío<br>• O solo como física: sin miel, la medicina no entra<br>• Y olvidando que casi se pierde: <strong>un solo manuscrito</strong> en 1417' },
    cuidados: { title: 'En esta casa', info: '• El gesto se practica: <strong>mecanismo contra miedo</strong>, sin burlas<br>• La cadena del eclipse se contesta con el video del mecanismo<br>• Y El giro se disfruta <strong>con su etiqueta puesta</strong>: divulgación con inflado' },
  },
  limite: {
    nombre: 'El límite del deseo', icon: '🍞',
    estructura: { title: 'Qué es', info: '• La tabla de la escuela: deseos <strong>naturales y necesarios</strong>, naturales no necesarios, y <strong>vanos</strong><br>• Los primeros <strong>se cumplen y descansan</strong>: agua, techo, amistad<br>• Los vanos no tienen tope: al cumplirse piden otro' },
    funcion: { title: 'Cómo se reconoce', info: '• Pregunta de bolsillo: si esto se cumple, <strong>¿descansa o pide el siguiente?</strong><br>• El teléfono que estudia: con límite<br>• El teléfono que aparenta: <strong>sin límite, y por eso vende</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Confundiendo esta materia <strong>con el consumismo</strong>: es su contrario<br>• Tratando el estatus como necesidad<br>• Y comprando <strong>la promesa de abundancia</strong>, que es el anzuelo empaquetado' },
    cuidados: { title: 'En esta casa', info: '• Las peticiones grandes se parten con la tabla: <strong>qué parte compra la cosa y qué parte alimenta el anzuelo</strong><br>• La parte con límite la cubre la casa<br>• Y la parte sin límite se ahorra: con eso se mide sola' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Le teme al trueno 🌩️' },
  { t: 25, n: 'Nombra los átomos y el vacío 🏺' },
  { t: 55, n: 'Lee la Carta en una tarde ✉️' },
  { t: 90, n: 'Abre el botiquín de cuatro frascos 💊' },
  { t: 130, n: 'Distingue el pan del anzuelo 🍞' },
  { t: 165, n: 'Explica el mecanismo de lo que asusta 🔬' },
  { t: 190, n: 'Desarma miedos como Lucrecio ⚛️' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de los átomos superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario del Jardín explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de miedos y deseos experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del poema maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de los átomos' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta de los Átomos y los Ídolos completada' },
});

/* ---------- aplicar ---------- */
let src = fs.readFileSync(ARCHIVO, 'utf8');
const lineas = src.split(/\r?\n/);
let cambiados = 0;
const noEncontrados = [];

for (const [nombre, literal] of Object.entries(B)) {
  const prefijo = 'const ' + nombre + '=';
  const idx = lineas.findIndex(l => l.startsWith(prefijo));
  if (idx === -1) { noEncontrados.push(nombre); continue; }
  lineas[idx] = prefijo + literal + ';';
  cambiados++;
}
src = lineas.join('\n');

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_atomos_miedo_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena la auditoría del miedo y del deseo, no la del parte del vigía. */
src = src.replace(/const critDecisionGuide='[^']*';/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se nombra el motor del caso: qué miedo o qué deseo lo sostiene, y se le mide el tope, porque el deseo con límite se cumple y descansa mientras el vano y el miedo difuso piden sin fin. Después se pregunta por el mecanismo: si alguien lo enseña, el caso se trabaja gratis; si nadie lo enseña y en su lugar hay amenaza, testimonio o palabras de ciencia sin experimento, se busca la caja y se nombra al cobrador. Luego se abre el botiquín: el frasco del tetrafármaco que calce, o la distinción de la etapa que resuelva, conversado y no recetado, porque esta casa desmonta miedos sin burlarse de quien los vive. Y al final se escribe la condición, pensada en frío: qué tendría que mostrar la oferta para el sí, y qué se contesta sin pelear, porque casi nada se acepta ni se rechaza completo, se acepta con condiciones escritas antes de contestar.";');

/* ---------- lo que arrastra el molde (la etapa 1 del espejo) ---------- */
const textos = [
  [/🪞 \*Ruta de la Máquina que se Mira · Etapa 1\* 🪞\\n\\nEl vigía y el timón: el piso que estudia, el piso que vigila, y por qué la gente decide bien sobre datos malos\. 🪞\\n\\n_Incluye evaluación conceptual y la sesión sobre la mesa\._ ✍️/g,
    '⚛️ *Ruta de los Átomos y los Ídolos · Etapa 1* ⚛️\\n\\nÁtomos contra el miedo: Demócrito, Epicuro y Lucrecio, y la física que quita los dos miedos. ⚛️\\n\\n_Incluye evaluación conceptual y el miedo sobre la mesa._ ✍️'],
  [/El vigía y el timón · Ruta de la Máquina que se Mira/g, 'Átomos contra el miedo · Ruta de los Átomos y los Ídolos'],
  [/La sesión sobre la mesa/g, 'El miedo sobre la mesa'],
  [/la sesión sobre la mesa/g, 'el miedo sobre la mesa'],
  [/completó la Etapa 1 de la Ruta de la Máquina que se Mira \(El vigía y el timón\)/g,
    'completó la Etapa 1 de la Ruta de los Átomos y los Ídolos (Átomos contra el miedo)'],
  [/const msgs=\['¡Sigue mirando tu estudio!','¡Muy buen trabajo!','¡Vigía en entrenamiento!','¡Ya separas el parte de la decisión!','¡Auditor del propio estudio!'\]/,
    "const msgs=['¡Sigue preguntando de qué está hecho!','¡Muy buen trabajo!','¡Aprendiz del Jardín!','¡Ya distingues el pan del anzuelo!','¡Desmontador de miedos!']"],
  [/\['#4338ca','#818cf8','#94a3b8','#d4a017','#00b894'\]/, "['#92400e','#d97706','#a8a29e','#d4a017','#00b894']"],
  /* el índigo del espejo en las pruebas imprimibles pasa al bronce de la etapa */
  [/#3b3a86/g, '#92400e'],
  [/#ece9fb/g, '#f6ede2'],
  /* el ejemplo del generador de tareas venía de otra materia */
  [/Un solo contraejemplo basta para refutar una ley\./g, 'No hay más que átomos y vacío.'],
  [/>Falsacionismo</g, '>Atomismo<'],
  /* las preguntas fijas de la prueba competencial preguntaban por el vigía */
  [/¿Qué parte subió el vigía y de dónde salió, qué decidió el timón y con qué dato, y dónde está el parte falso con la pista que lo fabricó\? Explica qué compruebas a cuaderno cerrado y qué apuntas en el registro\./g,
    '¿Qué miedo o deseo sostiene el caso y con qué tope, qué mecanismo hay detrás y quién cobra por esconderlo, y qué frasco o distinción de la etapa lo resuelve? Explica la condición escrita que deja la casa y qué se contesta sin burlarse de nadie.'],
  [/1\. ¿Cuál de los dos comprueba el parte antes de decidir\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos enseña el mecanismo antes de pedir algo? 2. ¿Por qué no son la misma decisión?'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación del espejo era la noche antes del examen. Aquí es la cadena
   del eclipse: el miedo comprado o el mecanismo enseñado. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(mecanismo){sfx(mecanismo?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(mecanismo){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🔬</span><span class="ms-text"><strong>Abrieron juntos el video del mecanismo:</strong> la Luna pasa por la sombra de la Tierra, con fecha calculada desde hace años. Angelly lo vio entero y preguntó dos veces «¿solo eso?».</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">⚛️</span><span class="ms-text"><strong>El miedo perdió a su cobrador:</strong> la cadena murió sin reenvío, las velas se quedaron sin cliente, y quedó aprendida la pregunta que mata cadenas: ¿quién gana si el miedo sigue vivo?</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🕯️</span><span class="ms-text"><strong>Se compraron las velas «por si acaso»:</strong> L 350 al cobrador, y algo peor que el gasto: la cadena quedó confirmada como verdadera delante de Angelly.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🌩️</span><span class="ms-text"><strong>El miedo se quedó a vivir:</strong> nadie enseñó el mecanismo, así que la próxima cadena llega a una casa que ya demostró que paga. El «por si acaso» es exactamente el modelo de negocio.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='atomos',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"atomos\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/🪞/g, '⚛️');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
