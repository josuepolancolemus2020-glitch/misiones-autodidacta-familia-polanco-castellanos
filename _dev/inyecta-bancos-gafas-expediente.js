/* Inyecta los bancos de la misión «La palabra con expediente» (Ruta de las
   Gafas a la Vista, etapa 1: Estudio de las Ideologías, materia 25 del
   Estudio Mayor) sobre el molde copiado de la etapa 1 del Expediente Rojo.
   Uso:  node _dev/inyecta-bancos-gafas-expediente.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Antoine Destutt de Tracy, «Elementos de ideología» (1801-1815):
       CLÁSICO DE HISTORIA DE LAS IDEAS. Se cita por el origen del término,
       acuñado hacia 1796, y NO se lee entero.
     · Marx y Engels, «La ideología alemana» (escrita en 1845-1846,
       publicada completa en 1932): FUENTE PRIMARIA, CLÁSICO. De aquí sale
       la cámara oscura y la tesis de las ideas dominantes.
     · Engels, carta a Franz Mehring del 14 de julio de 1893: la FUENTE
       REAL de «falsa conciencia». La frase exacta NO está en la obra
       publicada de Marx, y ese matiz es medio módulo: se dice explícito.
     · Karl Mannheim, «Ideología y utopía» (1929): CLÁSICO SÓLIDO de la
       sociología del conocimiento, CON DEBATES VIVOS. De aquí el
       relacionismo, que no es relativismo.
     · Clifford Geertz, «La ideología como sistema cultural» (1964,
       recogido en «La interpretación de las culturas», 1973): CLÁSICO
       SÓLIDO de la antropología. La ideología como mapa, no patología.

   La idea que ordena todos los bancos: la palabra se maneja con su
   expediente completo, y el uso tramposo que se caza es el que reserva
   «ideología» para el bando contrario y «sentido común» para el propio.
   El cuidado central del compendio, que gobierna toda la misión: en este
   arco la regla del acero es la regla madre y el detector se gira hacia
   adentro; un detector que no se prueba en casa no es instrumento, es
   arma. De ahí la regla de pago: un desenmascaramiento propio por cada
   uno ajeno.                                                            */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-gafas-palabra-expediente', 'js', 'gafas-expediente.js');

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
  { w: 'Ideología (la palabra)', a: '👓 Acuñada hacia <strong>1796</strong> como el nombre de <strong>una ciencia</strong>: el estudio de cómo se forman las ideas. Hoy trabaja de insulto. <strong>Nació ciencia y quedó insulto</strong>, y ese expediente es el temario de la etapa.' },
  { w: 'Antoine Destutt de Tracy', a: '⚗️ El aristócrata francés que la acuñó. Su obra, <strong>«Elementos de ideología» (1801 a 1815)</strong>, entra con su etiqueta: <strong>clásico de historia de las ideas</strong>, y se cita <strong>por el origen del término</strong>, no se lee entera.' },
  { w: 'Napoleón y los «ideólogos»', a: '🗣️ Incómodo con esos intelectuales, el emperador convirtió «ideólogos» en <strong>burla</strong>: gente de ideas sin realidad. La palabra <strong>nunca se recuperó</strong>, y quien la usa apuntando al otro bando repite esa burla sin saberlo.' },
  { w: '«La ideología alemana»', a: '📷 De Marx y Engels: <strong>escrita en 1845 a 1846 y publicada completa en 1932</strong>. Durmió ochenta y seis años en un cajón, y eso conviene decirlo: se cita a menudo como si hubiera circulado desde 1846.' },
  { w: 'La cámara oscura', a: '📷 La imagen central de Marx y Engels: la ideología <strong>invierte el mundo</strong>, porque las ideas dominantes de una época son <strong>las ideas de la clase dominante</strong>. Enseña a preguntar quién gana con que algo parezca obvio.' },
  { w: 'Falsa conciencia (la fuente real)', a: '✉️ La frase exacta <strong>no está en la obra publicada de Marx</strong>: es de <strong>Engels, en su carta a Franz Mehring del 14 de julio de 1893</strong>. Decir esto no es erudición de adorno: es medio módulo.' },
  { w: 'La autoinmunización', a: '🔒 Quien diagnostica falsa conciencia <strong>se declara despierto entre dormidos</strong>: cada desacuerdo pasa a ser síntoma del otro, y objetar es más síntoma. <strong>Lo que explica cualquier respuesta no prohíbe ninguna.</strong>' },
  { w: 'Karl Mannheim', a: '🔭 En <strong>«Ideología y utopía» (1929)</strong> giró el instrumento hacia sí mismo: si toda posición social produce su punto de vista, <strong>el desenmascarador también mira desde algún lado</strong>. Etiqueta: clásico sólido con debates vivos.' },
  { w: 'El relacionismo', a: '⚖️ El nombre que Mannheim le puso a su salida, <strong>para no caer en el relativismo</strong> de que todo da igual. Cada mirada viene de un lugar, y aun así <strong>unos mapas llevan al río y otros pierden</strong>.' },
  { w: 'Clifford Geertz', a: '🗺️ En <strong>«La ideología como sistema cultural» (1964, recogido en «La interpretación de las culturas», 1973)</strong> bajó la temperatura: <strong>la ideología no es patología sino mapa</strong>. Etiqueta: clásico sólido de la antropología.' },
  { w: 'La ideología como mapa', a: '🗺️ El plano con que una sociedad <strong>se deja leer</strong>, y aparece justo donde <strong>los mapas heredados dejaron de servir</strong> para entender una realidad social que se volvió confusa. Un mapa no es una enfermedad.' },
  { w: 'El uso tramposo', a: '🪤 El más común de todos: reservar <strong>«ideología» para el bando contrario</strong> y <strong>«sentido común» para el propio</strong>. Se caza con una pregunta: ¿cuándo dijiste por última vez «mi ideología»?' },
  { w: 'La regla de pago', a: '💳 Cada desenmascaramiento ajeno <strong>se paga con uno propio</strong>. Quien solo ve gafas en los demás usa la materia como arma, que es el uso que Marx inauguró y Mannheim desmontó.' },
  { w: 'Las gafas a la vista', a: '👓 La meta declarada sin trampa: <strong>no es quedarse sin gafas</strong>, que la propia materia demostró imposible con Mannheim. Es <strong>tenerlas a la vista</strong>: saber cuál es el mapa propio y poder decirlo en voz alta.' },
  { w: 'El detector descompuesto', a: '🔧 El que <strong>solo suena con un bando</strong>. Se calibra en las dos direcciones, y corre igual sobre los textos que a la casa le gustan: <strong>un detector que no se prueba en casa no es instrumento, es arma</strong>.' },
  { w: 'La regla del acero, aquí', a: '📕 En este arco es <strong>la regla madre</strong>: cada familia se pone en pie <strong>en su mejor versión antes de tocarla</strong>. Viene de la etapa 1 del Expediente Rojo y aquí gobierna el mapa político entero.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Para qué se acuñó la palabra «ideología» hacia 1796?', o: ['a) Para nombrar una ciencia: el estudio de cómo se forman las ideas', 'b) Para insultar a los adversarios del emperador', 'c) Para nombrar un partido político', 'd) Para describir una enfermedad mental'], c: 0 },
  { q: '¿Quién convirtió «ideólogos» en burla?', o: ['a) Destutt de Tracy', 'b) Napoleón, incómodo con esos intelectuales', 'c) Mannheim', 'd) Geertz'], c: 1 },
  { q: '«La ideología alemana» fue escrita en 1845 a 1846 y publicada completa en…', o: ['a) 1848', 'b) 1867', 'c) 1932', 'd) 1964'], c: 2 },
  { q: 'La imagen de la cámara oscura sirve para decir que…', o: ['a) Las ideas no existen', 'b) La fotografía cambió la política', 'c) Toda idea es falsa', 'd) La ideología invierte el mundo, y las ideas dominantes son las de la clase dominante'], c: 3 },
  { q: '¿De dónde sale exactamente la frase «falsa conciencia»?', o: ['a) De la carta de Engels a Franz Mehring del 14 de julio de 1893', 'b) De El capital, tomo I', 'c) Del Manifiesto de 1848', 'd) De Ideología y utopía'], c: 0 },
  { q: '¿Por qué se dice que el concepto de falsa conciencia se autoinmuniza?', o: ['a) Porque nadie lo entiende', 'b) Porque convierte toda objeción en síntoma del que objeta', 'c) Porque es demasiado técnico', 'd) Porque cambió de nombre'], c: 1 },
  { q: 'El relacionismo de Mannheim sostiene que…', o: ['a) Todo da exactamente igual', 'b) Solo el sabio ve sin mapa', 'c) Toda mirada viene de un lugar, y aun así unas alumbran más que otras', 'd) La ideología es una enfermedad curable'], c: 2 },
  { q: 'Geertz, en 1964, propuso entender la ideología como…', o: ['a) Un delito', 'b) Un partido', 'c) Una patología del cerebro', 'd) Un mapa, que aparece cuando los mapas heredados dejaron de servir'], c: 3 },
  { q: '¿Cuál es el uso tramposo más común de la palabra?', o: ['a) Usarla en la escuela', 'b) Reservarla para el bando contrario y llamar «sentido común» al propio', 'c) Escribirla con mayúscula', 'd) Traducirla del francés'], c: 1 },
  { q: 'La regla de pago de esta materia manda que…', o: ['a) Se cobre por cada análisis', 'b) Se pague al que descubre una ideología', 'c) Cada desenmascaramiento ajeno se pague con uno propio', 'd) Nadie hable de política en la mesa'], c: 2 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Expediente', 'Insulto'],
    headA: '👓 Expediente: la palabra con su historia',
    headB: '🗣️ Insulto: la palabra como arma',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Acuñada hacia 1796 para nombrar una ciencia', t: 'ok' },
      { w: '«Eso es pura ideología, y ya»', t: 'no' },
      { w: 'La cámara oscura de Marx y Engels', t: 'ok' },
      { w: '«Nosotros no: lo nuestro es sentido común»', t: 'no' },
      { w: 'La carta de Engels a Mehring, 1893', t: 'ok' },
      { w: '«Ideólogos», dicho con desprecio', t: 'no' },
      { w: 'El relacionismo de Mannheim, 1929', t: 'ok' },
      { w: '«Los ideologizados son los otros»', t: 'no' },
    ],
  },
  {
    label: ['Fuente real', 'Mal atribuido'],
    headA: '📚 Se cita en su fuente real',
    headB: '❌ Atribución equivocada',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Falsa conciencia»: Engels a Mehring, 1893', t: 'ok' },
      { w: '«Falsa conciencia»: El capital, tomo I', t: 'no' },
      { w: 'La cámara oscura: La ideología alemana', t: 'ok' },
      { w: 'La palabra «ideología»: la inventó Marx', t: 'no' },
      { w: 'El relacionismo: Mannheim, 1929', t: 'ok' },
      { w: 'La ideología como mapa: Destutt de Tracy', t: 'no' },
      { w: 'La ideología como mapa: Geertz, 1964', t: 'ok' },
      { w: 'La burla de los «ideólogos»: Mannheim', t: 'no' },
    ],
  },
  {
    label: ['Relacionismo', 'Relativismo'],
    headA: '⚖️ Relacionismo: cada mirada tiene lugar',
    headB: '🌀 Relativismo: todo da igual',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Todos los mapas eligen, y algunos llevan al río', t: 'ok' },
      { w: 'Ningún mapa es mejor que otro', t: 'no' },
      { w: 'El que desenmascara también mira desde algún lado', t: 'ok' },
      { w: 'Como todos tienen sesgo, no hay que discutir', t: 'no' },
      { w: 'La meta es tener las gafas a la vista', t: 'ok' },
      { w: 'La meta es que nadie juzgue nada', t: 'no' },
      { w: 'Se declara el propio lugar y se sigue midiendo', t: 'ok' },
      { w: 'Todas las opiniones valen exactamente lo mismo', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Viene después o vive en otra materia'],
    headA: '👓 Se estudia en esta etapa',
    headB: '🏠 Viene después o es de otra materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El origen de la palabra en 1796', t: 'ok' },
      { w: 'El bisturí de Freeden y la descontestación', t: 'no' },
      { w: 'La cámara oscura y la falsa conciencia', t: 'ok' },
      { w: 'El eje izquierda-derecha y sus límites', t: 'no' },
      { w: 'El relacionismo de Mannheim', t: 'ok' },
      { w: 'El Marx filósofo: base y superestructura', t: 'no' },
      { w: 'La ideología como mapa, de Geertz', t: 'ok' },
      { w: 'El razonamiento motivado y la identidad', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['La', 'palabra', 'nació', 'como', 'ciencia', 'en', '1796.'], c: 4, art: 'Lo que la palabra quiso ser' },
  { s: ['Napoleón', 'la', 'convirtió', 'en', 'burla.'], c: 4, art: 'En qué la convirtió el emperador' },
  { s: ['La', 'ideología', 'invierte', 'el', 'mundo', 'como', 'una', 'cámara', 'oscura.'], c: 7, art: 'La imagen de Marx y Engels, al final de la frase' },
  { s: ['La', 'carta', 'a', 'Mehring', 'es', 'la', 'fuente', 'real.'], c: 3, art: 'A quién le escribió Engels en 1893' },
  { s: ['El', 'concepto', 'se', 'autoinmuniza', 'contra', 'toda', 'objeción.'], c: 3, art: 'El defecto de la falsa conciencia' },
  { s: ['Mannheim', 'llamó', 'relacionismo', 'a', 'su', 'salida.'], c: 2, art: 'El nombre que evita el relativismo' },
  { s: ['Para', 'Geertz', 'la', 'ideología', 'es', 'un', 'mapa.'], c: 6, art: 'Lo que la ideología es, y no una patología' },
  { s: ['Cada', 'desenmascaramiento', 'ajeno', 'se', 'paga', 'con', 'uno', 'propio.'], c: 1, art: 'Lo que la regla de pago cobra' },
]);

/* ---------- completa la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'La palabra «ideología» nació como el nombre de una ___.', opts: ['ciencia', 'burla', 'bandera'], c: 0 },
  { s: 'Napoleón convirtió «ideólogos» en ___.', opts: ['ciencia', 'burla', 'ley'], c: 1 },
  { s: 'Marx y Engels compararon la ideología con una cámara ___.', opts: ['lenta', 'de fotos', 'oscura'], c: 2 },
  { s: '«Falsa conciencia» es de Engels, en su carta a ___.', opts: ['Mehring', 'Marx', 'Mannheim'], c: 0 },
  { s: 'Quien diagnostica falsa conciencia se declara ___ entre dormidos.', opts: ['dormido', 'despierto', 'neutral'], c: 1 },
  { s: 'Mannheim llamó a su salida ___, y no relativismo.', opts: ['racionalismo', 'realismo', 'relacionismo'], c: 2 },
  { s: 'Para Geertz la ideología no es patología, es un ___.', opts: ['mapa', 'delito', 'partido'], c: 0 },
  { s: 'La meta no es quitarse las gafas: es tenerlas a la ___.', opts: ['sombra', 'vista', 'venta'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Expediente', 'Insulto'],
    btnA: '👓 Expediente', btnB: '🗣️ Insulto',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Acuñada hacia 1796 como ciencia', t: 'ok' },
      { w: '«Eso es pura ideología»', t: 'no' },
      { w: 'La cámara oscura', t: 'ok' },
      { w: '«Lo nuestro es sentido común»', t: 'no' },
      { w: 'La carta a Mehring de 1893', t: 'ok' },
      { w: '«Ideólogos», con desprecio', t: 'no' },
      { w: 'El relacionismo de 1929', t: 'ok' },
      { w: '«Los ideologizados son los otros»', t: 'no' },
      { w: 'La ideología como mapa', t: 'ok' },
      { w: '«Yo veo los hechos desnudos»', t: 'no' },
    ],
  },
  {
    label: ['Fuente real', 'Mal atribuido'],
    btnA: '📚 Fuente real', btnB: '❌ Mal atribuido',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Falsa conciencia: Engels, 1893', t: 'ok' },
      { w: 'Falsa conciencia: El capital', t: 'no' },
      { w: 'Cámara oscura: La ideología alemana', t: 'ok' },
      { w: 'La palabra la inventó Marx', t: 'no' },
      { w: 'Relacionismo: Mannheim, 1929', t: 'ok' },
      { w: 'El mapa: Destutt de Tracy', t: 'no' },
      { w: 'El mapa: Geertz, 1964', t: 'ok' },
      { w: 'La burla: Mannheim', t: 'no' },
      { w: 'Elementos de ideología: 1801 a 1815', t: 'ok' },
      { w: 'La ideología alemana: publicada en 1846', t: 'no' },
    ],
  },
  {
    label: ['Mapa', 'Patología'],
    btnA: '🗺️ Mapa', btnB: '🩺 Patología',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Un plano para leer una realidad confusa', t: 'ok' },
      { w: 'Una enfermedad que el otro tiene', t: 'no' },
      { w: 'Aparece cuando el mapa viejo dejó de servir', t: 'ok' },
      { w: 'Se cura enseñándole los hechos', t: 'no' },
      { w: 'Todos llevamos uno, y se puede declarar', t: 'ok' },
      { w: 'Solo la tienen los fanáticos', t: 'no' },
      { w: 'Elige qué mira y deja cosas afuera', t: 'ok' },
      { w: 'El que la señala está sano por definición', t: 'no' },
      { w: 'Se pone sobre la mesa antes de discutir', t: 'ok' },
      { w: 'Es un diagnóstico que cierra la conversación', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'El expediente de la palabra, en orden',
    steps: [
      'Hacia 1796, Destutt de Tracy la acuña como nombre de una ciencia',
      'Napoleón convierte «ideólogos» en burla, y la burla gana',
      'Marx y Engels le dan la cámara oscura y las ideas dominantes',
      'Engels escribe a Mehring en 1893 la frase «falsa conciencia»',
      'Mannheim gira el instrumento en 1929 y lo llama relacionismo',
      'Geertz baja la temperatura en 1964: no es patología, es mapa',
    ],
  },
  {
    label: 'Qué hacer cuando alguien dice «eso es ideología»',
    steps: [
      'Preguntar en qué sentido usa la palabra, de los cuatro',
      'Nombrar qué mapa trae el texto acusado',
      'Nombrar qué mapa traigo yo, en voz alta',
      'Pedir la fuente y la fecha de lo que cada uno cita',
      'Conceder lo que el otro lado tenga de cierto',
      'Y pagar el desenmascaramiento con uno propio',
    ],
  },
  {
    label: 'La regla de pago, paso a paso',
    steps: [
      'Anotar el desenmascaramiento ajeno que se acaba de hacer',
      'Buscar una premisa de esta casa que nadie discute nunca',
      'Escribir qué le conviene a la casa creer eso',
      'Escribir qué evidencia la haría cambiar',
      'Si no existe esa evidencia, anotarla como dogma, con fecha',
      'Y dejar las dos hojas juntas en el inventario de gafas',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Acuñó la palabra hacia 1796 como nombre de una ciencia', ans: 'Destutt de Tracy', opts: ['Destutt de Tracy', 'Napoleón', 'Mannheim', 'Geertz'] },
  { desc: 'Convirtió «ideólogos» en burla y la burla nunca se fue', ans: 'Napoleón', opts: ['Napoleón', 'Destutt de Tracy', 'Engels', 'Mehring'] },
  { desc: 'La imagen que dice que la ideología invierte el mundo', ans: 'La cámara oscura', opts: ['La cámara oscura', 'El mapa de Geertz', 'El relacionismo', 'La periferia'] },
  { desc: 'Escrita en 1845 a 1846 y publicada completa en 1932', ans: 'La ideología alemana', opts: ['La ideología alemana', 'Ideología y utopía', 'Elementos de ideología', 'La interpretación de las culturas'] },
  { desc: 'La fuente real de la frase «falsa conciencia»', ans: 'La carta de Engels a Mehring, 1893', opts: ['La carta de Engels a Mehring, 1893', 'El capital, tomo I', 'El Manifiesto de 1848', 'Ideología y utopía, 1929'] },
  { desc: 'Convierte cada objeción en síntoma del que objeta', ans: 'La autoinmunización', opts: ['La autoinmunización', 'El relacionismo', 'La descontestación', 'La cámara oscura'] },
  { desc: 'El nombre que Mannheim le puso a su salida, en 1929', ans: 'El relacionismo', opts: ['El relacionismo', 'El relativismo', 'El racionalismo', 'El realismo'] },
  { desc: 'Lo que la ideología es, según Geertz, en vez de una enfermedad', ans: 'Un mapa', opts: ['Un mapa', 'Un delito', 'Un partido', 'Un síntoma'] },
]);

/* ---------- ¿qué está haciendo esa frase? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«Yo no tengo ideología: yo tengo sentido común»', func: 'El uso tramposo: la palabra apuntando en una sola dirección', opts: ['El uso tramposo: la palabra apuntando en una sola dirección', 'Una definición correcta', 'El relacionismo bien aplicado', 'La cámara oscura'] },
  { trans: '«Él defiende eso por falsa conciencia»', func: 'Diagnóstico que se autoinmuniza: hay que pagarlo con uno propio', opts: ['Diagnóstico que se autoinmuniza: hay que pagarlo con uno propio', 'Una cita textual de El capital', 'Una descripción neutral', 'El mapa de Geertz'] },
  { trans: '«Este texto da por obvio que el Estado siempre estorba»', func: 'Detección de mapa: se nombra lo que el texto no discute', opts: ['Detección de mapa: se nombra lo que el texto no discute', 'Un insulto napoleónico', 'Una atribución falsa', 'Relativismo'] },
  { trans: '«En esta casa damos por sentado que emprender es el camino»', func: 'Premisa propia declarada: la regla de pago cumpliéndose', opts: ['Premisa propia declarada: la regla de pago cumpliéndose', 'Una acusación al vecino', 'Una cifra sin fuente', 'Una patología'] },
  { trans: '«Como todos tenemos sesgo, discutir no sirve»', func: 'Relativismo, justo lo que Mannheim rechazó por su nombre', opts: ['Relativismo, justo lo que Mannheim rechazó por su nombre', 'Relacionismo bien entendido', 'El mapa de Geertz', 'La regla de pago'] },
]);

/* ---------- diagnóstico: ¿por dónde falla? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Una ficha atribuye «falsa conciencia» a El capital, y ahí lo deja', characteristic: 'Atribución falsa: la frase es de Engels, en su carta a Mehring del 14 de julio de 1893', opts: ['Atribución falsa: la frase es de Engels, en su carta a Mehring del 14 de julio de 1893', 'Está bien: Marx y Engels escribían juntos', 'El error es citar a Marx en una ficha', 'Falta el número de página'] },
  { disease: 'Un video se titula «Cómo detectar a un ideologizado en tres frases»', characteristic: 'Detector de una sola dirección: reserva la palabra para el bando contrario', opts: ['Detector de una sola dirección: reserva la palabra para el bando contrario', 'El problema es que son solo tres frases', 'Está bien si las tres frases son ciertas', 'Falta música'] },
  { disease: 'Alguien dice: «yo no tengo ideología, yo veo los hechos desnudos»', characteristic: 'El uso tramposo: llama sentido común a su propio mapa, que no ha visto nunca', opts: ['El uso tramposo: llama sentido común a su propio mapa, que no ha visto nunca', 'Es una postura científica válida', 'Solo le falta leer más noticias', 'El error es hablar en primera persona'] },
  { disease: 'Una clase enseña «La ideología alemana» como libro que circuló desde 1846', characteristic: 'Fecha mal puesta: se escribió en 1845 a 1846, pero se publicó completa en 1932', opts: ['Fecha mal puesta: se escribió en 1845 a 1846, pero se publicó completa en 1932', 'Da igual la fecha de publicación', 'El error es enseñar ese libro', 'Faltaba decir el editor'] },
  { disease: 'Un ensayo concluye que, como todos tenemos sesgo, ninguna posición vale más', characteristic: 'Relativismo: Mannheim lo rechazó por su nombre y llamó relacionismo a lo suyo', opts: ['Relativismo: Mannheim lo rechazó por su nombre y llamó relacionismo a lo suyo', 'Es la conclusión correcta de Mannheim', 'El error es hablar de sesgo', 'Faltaba citar a Geertz'] },
  { disease: 'La casa disecciona tres idearios ajenos y ninguno propio', characteristic: 'La regla de pago sin pagar: un detector que no se prueba en casa es arma, no instrumento', opts: ['La regla de pago sin pagar: un detector que no se prueba en casa es arma, no instrumento', 'Con tres idearios ajenos basta', 'Los idearios propios no tienen mapa', 'Faltaba un cuarto ideario ajeno'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Acuñó la palabra hacia 1796 como nombre de una ciencia.', type: 'Destutt de Tracy' },
  { s: 'Convirtió «ideólogos» en burla.', type: 'Napoleón' },
  { s: 'La imagen que muestra el mundo invertido.', type: 'La cámara oscura' },
  { s: 'Escrita en 1845 a 1846, publicada completa en 1932.', type: 'La ideología alemana' },
  { s: 'La carta del 14 de julio de 1893.', type: 'La fuente real de «falsa conciencia» (Engels a Mehring)' },
  { s: 'Convierte toda objeción en síntoma del que objeta.', type: 'La autoinmunización' },
  { s: 'La salida de Mannheim que no es relativismo.', type: 'El relacionismo' },
  { s: 'La ideología no es patología sino esto.', type: 'Un mapa (Geertz, 1964)' },
  { s: '«Ideología» para el otro, «sentido común» para mí.', type: 'El uso tramposo' },
  { s: 'Un desenmascaramiento propio por cada ajeno.', type: 'La regla de pago' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'Destutt de Tracy', gen: 'Origen', n: 'Acuñó la palabra hacia 1796', g: 'Elementos de ideología, 1801 a 1815', t: 'Clásico de historia de las ideas' },
  { w: 'Napoleón', gen: 'Torcedura', n: 'Volvió «ideólogos» una burla', g: 'La palabra nunca se recuperó', t: 'Dato histórico del expediente' },
  { w: 'La ideología alemana', gen: 'Fuente primaria', n: 'La cámara oscura y las ideas dominantes', g: 'Escrita 1845 a 1846', t: 'Publicada completa en 1932' },
  { w: 'La cámara oscura', gen: 'Imagen', n: 'El mundo mostrado al revés', g: 'Marx y Engels', t: 'Potente, y con problema adentro' },
  { w: 'Carta a Franz Mehring', gen: 'Fuente real', n: 'Aquí sí aparece «falsa conciencia»', g: 'Engels, 14 de julio de 1893', t: 'No está en la obra publicada de Marx' },
  { w: 'La autoinmunización', gen: 'Defecto', n: 'Despierto entre dormidos', g: 'La crítica del mismo día', t: 'Lo que todo lo explica nada prohíbe' },
  { w: 'Ideología y utopía', gen: 'Fuente', n: 'El giro del instrumento hacia adentro', g: 'Mannheim, 1929', t: 'Clásico sólido con debates vivos' },
  { w: 'El relacionismo', gen: 'Concepto', n: 'Cada mirada tiene lugar, y unas alumbran más', g: 'Mannheim', t: 'No es relativismo' },
  { w: 'La ideología como sistema cultural', gen: 'Fuente', n: 'La ideología es mapa, no patología', g: 'Geertz, 1964 y 1973', t: 'Clásico sólido' },
  { w: 'La regla de pago', gen: 'Protocolo', n: 'Uno propio por cada ajeno', g: 'La mesa de la casa', t: 'Sin ella, el detector es arma' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'La palabra nació como el nombre de una ___.', opts: ['ciencia', 'burla', 'ley'], ans: 'ciencia' },
  { s: 'Napoleón convirtió «ideólogos» en ___.', opts: ['burla', 'ciencia', 'partido'], ans: 'burla' },
  { s: 'La ideología invierte el mundo como una cámara ___.', opts: ['oscura', 'lenta', 'clara'], ans: 'oscura' },
  { s: '«Falsa conciencia» aparece en la carta a ___.', opts: ['Mehring', 'Marx', 'Geertz'], ans: 'Mehring' },
  { s: 'La ideología alemana se publicó completa en ___.', opts: ['1932', '1846', '1929'], ans: '1932' },
  { s: 'Mannheim llamó a su salida ___.', opts: ['relacionismo', 'relativismo', 'realismo'], ans: 'relacionismo' },
  { s: 'Para Geertz la ideología es un ___.', opts: ['mapa', 'delito', 'síntoma'], ans: 'mapa' },
  { s: 'Cada desenmascaramiento ajeno se paga con uno ___.', opts: ['propio', 'ajeno', 'prestado'], ans: 'propio' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Por qué el dato de 1796 cambia toda la discusión? Explícalo con el caso del padre que escribe «no metan ideología en las fichas».', ans: 'Porque cambia quién carga la prueba. Si «ideología» fuera de nacimiento el nombre del error ajeno, el que la usa no debería explicar nada: le basta señalar. Pero la palabra fue acuñada hacia 1796 por Antoine Destutt de Tracy para nombrar una ciencia, el estudio de cómo se forman las ideas en cualquier cabeza, incluida la del que estudia. Con ese dato, el padre que escribe «no metan ideología en las fichas» ya no está describiendo la ficha: está usando una acusación, y lo que le toca es decir qué afirmación concreta le parece preferencia disfrazada de descripción. Y a la casa le toca lo mismo, en la misma hoja y esa misma semana.' },
  { q: 'Cuenta cómo la palabra pasó de ciencia a insulto, y por qué eso sigue trabajando hoy.', ans: 'Destutt de Tracy la acuñó hacia 1796 como el nombre de una ciencia y publicó sus «Elementos de ideología» entre 1801 y 1815. A Napoleón le estorbaban esos intelectuales que le objetaban con razones, y empezó a llamarlos «ideólogos» con desprecio: gente de ideas sin realidad. El desprecio prosperó más que la ciencia y la palabra nunca se recuperó: nació ciencia y quedó insulto. Sigue trabajando hoy porque el insulto conserva su dirección original, hacia afuera: nadie dice «mi ideología». Cada vez que se usa para señalar al bando contrario se repite la burla del emperador, con la ventaja retórica de que suena a análisis.' },
  { q: '¿Qué dice la cámara oscura, qué enseña bien, y qué problema trae adentro?', ans: 'Marx y Engels, en «La ideología alemana» (escrita en 1845 a 1846 y publicada completa en 1932), dijeron que la ideología invierte el mundo como en una cámara oscura, porque las ideas dominantes de una época son las ideas de la clase dominante. Enseña bien una cosa: las ideas tienen dueño y dirección, no caen del cielo, así que conviene preguntar a quién le conviene que algo parezca obvio. El problema que trae adentro es que supone una posición desde la cual el mundo se ve derecho y no dice cuál, y si el instrumento se aplica solo hacia afuera, se vuelve una llave que abre todas las puertas menos la propia. Ese es el problema que Mannheim recogió y giró.' },
  { q: '¿De dónde sale la frase «falsa conciencia» y por qué el matiz es medio módulo?', ans: 'La frase exacta no está en la obra publicada de Marx, aunque a él se le atribuya casi siempre: es de Engels, en su carta a Franz Mehring del 14 de julio de 1893. El matiz es medio módulo por dos razones. La primera es de honestidad de fuentes: el concepto más citado del tema resulta ser una frase de correspondencia privada, escrita casi medio siglo después de la obra a la que se le cuelga, y una materia que enseña a pedir fuentes no puede empezar fallando en la propia. La segunda es de método: el concepto se autoinmuniza, porque quien diagnostica falsa conciencia se declara despierto entre dormidos y convierte cada desacuerdo en síntoma del otro. Lo que explica cualquier respuesta no prohíbe ninguna, y una teoría que no prohíbe nada no informa de nada.' },
  { q: 'Explica la diferencia entre relacionismo y relativismo, con el ejemplo de dos mapas.', ans: 'Mannheim, en «Ideología y utopía» (1929), aceptó la consecuencia incómoda de su propio instrumento: si toda posición social produce su punto de vista, el que desenmascara también mira desde algún lado. A esa posición la llamó relacionismo, y se cuidó de distinguirla del relativismo, que sostiene que entonces todo da igual. El ejemplo son dos mapas del mismo terreno: los dos son parciales, los dos eligen qué dibujar y qué dejar afuera, y aun así uno te lleva al río y el otro te pierde. Que toda mirada tenga lugar de origen no borra la diferencia entre mirar bien y mirar mal: solo obliga a declarar desde dónde se mira antes de discutir.' },
  { q: '¿Por qué esta materia obliga a girar el detector hacia adentro, y cómo se cumple en esta casa?', ans: 'Porque diseccionar el ideario del bando contrario lo hace cualquiera y auditar el propio no lo hace casi nadie, así que un detector que solo suena con un bando está descompuesto: no es instrumento, es arma. Y porque la trampa propia de la materia es la peor de todas, el alumno que aprende a ver gafas ajenas y se cree descalzo; la vacuna es Mannheim, que demostró que nadie mira desde ningún lado. En esta casa se cumple con la regla de pago: cada desenmascaramiento ajeno se paga con uno propio, esa misma semana. Por eso las tres premisas de la casa (la fe, el proyecto educativo y el emprendimiento) entran al inventario de gafas con su núcleo declarado y con el renglón de qué evidencia haría cambiar cada una; si ese renglón no existe, la premisa está funcionando como dogma, y así se anota, con fecha.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['IDEOLOGIA', 'CIENCIA', 'INSULTO', 'BURLA', 'MAPA', 'GAFAS']),
  haceSopa(10, ['CAMARA', 'OSCURA', 'CLASE', 'ENGELS', 'MEHRING', 'CARTA']),
  haceSopa(10, ['MANNHEIM', 'GEERTZ', 'UTOPIA', 'CULTURA', 'NUCLEO', 'PERIFERIA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'La palabra «ideología» se acuñó hacia 1796 como el nombre de una ciencia.', a: true },
  { q: 'Destutt de Tracy inventó la palabra para insultar a sus adversarios.', a: false },
  { q: 'Napoleón convirtió «ideólogos» en una burla, y la palabra no se recuperó.', a: true },
  { q: '«Elementos de ideología» se publicó entre 1801 y 1815.', a: true },
  { q: '«La ideología alemana» se publicó completa el mismo año en que se escribió.', a: false },
  { q: 'La cámara oscura dice que la ideología muestra el mundo invertido.', a: true },
  { q: 'La frase «falsa conciencia» está en la obra publicada de Marx.', a: false },
  { q: '«Falsa conciencia» aparece en la carta de Engels a Franz Mehring del 14 de julio de 1893.', a: true },
  { q: 'El concepto de falsa conciencia se autoinmuniza contra toda objeción.', a: true },
  { q: 'Mannheim publicó «Ideología y utopía» en 1929.', a: true },
  { q: 'Mannheim llamó relativismo a su propia posición.', a: false },
  { q: 'Geertz sostuvo que la ideología es una patología del cerebro.', a: false },
  { q: 'Para Geertz la ideología es un mapa, y aparece cuando los mapas heredados fallan.', a: true },
  { q: 'El uso tramposo consiste en reservar «ideología» para el bando contrario.', a: true },
  { q: 'La meta de la materia es lograr mirar sin ninguna gafa.', a: false },
]);
B.evalMCBank = JSON.stringify([
  { q: 'La palabra «ideología» se acuñó hacia 1796 para nombrar…', o: ['a) Una ciencia: el estudio de cómo se forman las ideas', 'b) Un partido francés', 'c) Una enfermedad', 'd) Un delito político'], a: 0 },
  { q: 'Quien la acuñó fue…', o: ['a) Napoleón', 'b) Antoine Destutt de Tracy', 'c) Karl Mannheim', 'd) Clifford Geertz'], a: 1 },
  { q: '«Elementos de ideología» se publicó…', o: ['a) En 1929', 'b) En 1932', 'c) Entre 1801 y 1815', 'd) En 1964'], a: 2 },
  { q: 'Napoleón usó «ideólogos» para…', o: ['a) Nombrar a sus generales', 'b) Titular un libro', 'c) Bautizar una academia', 'd) Burlarse de los intelectuales que le objetaban'], a: 3 },
  { q: '«La ideología alemana» se escribió y se publicó completa en…', o: ['a) Escrita en 1845 a 1846, publicada completa en 1932', 'b) Escrita y publicada en 1846', 'c) Escrita en 1867, publicada en 1893', 'd) Escrita en 1929, publicada en 1964'], a: 0 },
  { q: 'La cámara oscura sostiene que…', o: ['a) La fotografía inventó la política moderna', 'b) La ideología invierte el mundo, y las ideas dominantes son las de la clase dominante', 'c) Nadie puede conocer nada', 'd) Las ideas no influyen en nada'], a: 1 },
  { q: 'La frase «falsa conciencia» proviene de…', o: ['a) El capital, tomo I', 'b) El Manifiesto de 1848', 'c) La carta de Engels a Franz Mehring del 14 de julio de 1893', 'd) Ideología y utopía'], a: 2 },
  { q: 'El defecto de método de la falsa conciencia es que…', o: ['a) Es difícil de traducir', 'b) Nadie la usa', 'c) No tiene autor conocido', 'd) Se autoinmuniza: toda objeción cuenta como síntoma'], a: 3 },
  { q: '«Ideología y utopía» (1929) es obra de…', o: ['a) Karl Mannheim', 'b) Clifford Geertz', 'c) Friedrich Engels', 'd) Destutt de Tracy'], a: 0 },
  { q: 'El relacionismo afirma que…', o: ['a) Todas las opiniones valen igual', 'b) Toda mirada viene de un lugar, y aun así unas alumbran más que otras', 'c) Solo el sabio ve sin mapa', 'd) La ideología no existe'], a: 1 },
  { q: '«La ideología como sistema cultural» se publicó en…', o: ['a) 1893', 'b) 1929', 'c) 1964, y se recogió en «La interpretación de las culturas» (1973)', 'd) 1932'], a: 2 },
  { q: 'Para Geertz, una ideología es sobre todo…', o: ['a) Una enfermedad ajena', 'b) Un partido', 'c) Un fraude', 'd) Un mapa para leer una realidad social confusa'], a: 3 },
  { q: 'El uso tramposo más común de la palabra consiste en…', o: ['a) Reservarla para el bando contrario y llamar «sentido común» al propio', 'b) Usarla en la escuela', 'c) Escribirla con mayúscula', 'd) Citar su origen francés'], a: 0 },
  { q: 'La regla de pago de esta materia dice que…', o: ['a) Se cobra por cada análisis publicado', 'b) Cada desenmascaramiento ajeno se paga con uno propio', 'c) Nadie puede hablar de política', 'd) Solo se auditan idearios ajenos'], a: 1 },
  { q: 'La meta declarada de la materia es…', o: ['a) Quedarse sin gafas', 'b) Demostrar que el otro bando está ciego', 'c) Tener las gafas a la vista y poder nombrar el mapa propio', 'd) Dejar de opinar de política'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'La palabra «ideología» se acuñó hacia el año ___.', a: '1796' },
  { q: 'Quien la acuñó fue Antoine Destutt de ___.', a: 'Tracy' },
  { q: 'Convirtió «ideólogos» en burla el emperador ___.', a: 'Napoleón' },
  { q: 'La ideología invierte el mundo como en una cámara ___.', a: 'oscura' },
  { q: '«La ideología alemana» se publicó completa en ___.', a: '1932' },
  { q: 'Las ideas dominantes de una época son las de la clase ___.', a: 'dominante' },
  { q: '«Falsa conciencia» aparece en la carta de Engels a ___.', a: 'Mehring' },
  { q: 'Esa carta es del 14 de julio de ___.', a: '1893' },
  { q: 'Quien diagnostica falsa conciencia se declara ___ entre dormidos.', a: 'despierto' },
  { q: '«Ideología y utopía» (1929) es de Karl ___.', a: 'Mannheim' },
  { q: 'La salida de Mannheim se llama ___.', a: 'relacionismo' },
  { q: '«La ideología como sistema cultural» (1964) es de Clifford ___.', a: 'Geertz' },
  { q: 'Para Geertz la ideología no es patología sino un ___.', a: 'mapa' },
  { q: 'El uso tramposo llama al mapa propio ___ común.', a: 'sentido' },
  { q: 'Cada desenmascaramiento ajeno se paga con uno ___.', a: 'propio' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Destutt de Tracy', def: 'Acuñó la palabra hacia 1796 como nombre de una ciencia' },
  { term: 'Elementos de ideología', def: 'Su obra, publicada entre 1801 y 1815' },
  { term: 'Napoleón', def: 'Convirtió «ideólogos» en burla, y la burla se quedó' },
  { term: 'La ideología alemana', def: 'Escrita en 1845 a 1846, publicada completa en 1932' },
  { term: 'La cámara oscura', def: 'La imagen del mundo mostrado al revés' },
  { term: 'Clase dominante', def: 'Sus ideas son las ideas dominantes de la época' },
  { term: 'Carta a Franz Mehring', def: 'La fuente real de «falsa conciencia», 14 de julio de 1893' },
  { term: 'Autoinmunización', def: 'Convertir toda objeción en síntoma del que objeta' },
  { term: 'Karl Mannheim', def: 'Giró el instrumento hacia adentro en 1929' },
  { term: 'Relacionismo', def: 'Cada mirada tiene lugar, y aun así unas alumbran más' },
  { term: 'Relativismo', def: 'La salida que Mannheim rechazó por su nombre' },
  { term: 'Clifford Geertz', def: 'Propuso en 1964 leer la ideología como mapa' },
  { term: 'La interpretación de las culturas', def: 'El libro de 1973 que recogió ese ensayo' },
  { term: 'El uso tramposo', def: '«Ideología» para el otro, «sentido común» para mí' },
  { term: 'La regla de pago', def: 'Un desenmascaramiento propio por cada uno ajeno' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'Con una semana de diferencia le llegan a M.E.T.A.S dos acusaciones contrarias: la carta de un dirigente magisterial habla de «privatización neoliberal de la educación» y un comentario en la radio local habla de «adoctrinamiento estatista». La oferta implícita: contestarle a uno con el vocabulario del otro.' },
  { txt: 'Una organización internacional ofrece L 60,000 y diseño profesional para que las misiones de ciencias sociales de M.E.T.A.S adopten su glosario de términos. Cada término del glosario fija un lado de un concepto disputado.' },
  { txt: 'El borrador de una misión de M.E.T.A.S sobre el trabajo y el ahorro da por hecho que «emprender es el camino» y trata el empleo asalariado como plan de reserva. Es la experiencia verdadera de esta casa, y va a leerla gente que vive de salario y de remesas.' },
  { txt: 'En el grupo de padres del colegio, un papá escribe «por favor no metan ideología en las fichas» y, tres mensajes después, otro escribe «al fin un material sin ideología». Hablan de la misma ficha y ninguno la leyó completa.' },
  { txt: 'Un canal educativo ofrece L 4,500 por un video de M.E.T.A.S titulado «Cómo detectar a un ideologizado en tres frases», con el logo de la plataforma y garantía de miles de vistas.' },
  { txt: 'En la mesa, Jael despacha el comentario político de un tío diciendo que «eso es pura falsa conciencia, él no se da cuenta de que defiende a los que lo explotan». Varios asienten y la conversación se cierra ahí.' },
  { txt: 'Angelly pregunta, terminada la mesa: «¿y nosotros tenemos ideología?». No hay oferta ni lempiras: hay una niña esperando una respuesta que no la deje sin piso.' },
  { txt: 'Preparando la ficha, el autor escribe sobre el proyecto: «esto no es ideología, es sentido común». Lo lee otra vez y se detiene, porque acaba de hacer en su propia página lo que la etapa enseña a cazar.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿En qué sentido está usada la palabra «ideología» en el caso (ciencia de las ideas, insulto napoleónico, cámara oscura o mapa)? Cita la frase exacta que lo delata.',
  '2. ¿Qué mete y qué saca la salida cómoda, y qué mapa está dando por obvio cada uno de los dos lados?',
  '3. ¿Qué fuente, fecha o cifra del caso necesita su etiqueta de estatus antes de usarse, y cuál le toca?',
  '4. ¿Qué condición escrita deja la casa, y qué desenmascaramiento propio paga esa misma semana?',
]);
B.critCaseGuides = JSON.stringify([
  'Se empieza nombrando el sentido en juego, porque la misma palabra hace cuatro trabajos distintos: la ciencia de las ideas de 1796, el insulto que Napoleón puso en circulación, la cámara oscura de Marx y Engels, y el mapa de Geertz. En los casos de acusación (los dos maestros, los dos padres, el título del video) el sentido es casi siempre el segundo, el insulto, y la frase exacta lo delata: «no metan ideología», «adoctrinamiento», «ideologizado». Nombrar eso no gana la discusión, pero la cambia de terreno: de quién está ciego a qué afirma cada texto.',
  'Después se pesa la salida cómoda. La más barata siempre es contestar «nosotros no tenemos ideología, lo nuestro es sentido común», porque mete el aplauso inmediato del bando que toque y saca la báscula entera. La otra salida barata es reescribir el material para calmar a quien grita, que mete paz con una mitad y saca la honestidad del material y la confianza de la otra mitad. En los dos casos hay que nombrar los dos mapas: qué da por obvio el que acusa y qué da por obvio la casa, con las palabras de cada uno y sin adoptar el vocabulario de ninguno.',
  'Toda fuente y toda cifra del caso pasan por la regla del estatus, y aquí las etiquetas están fijadas: Destutt de Tracy como clásico de historia de las ideas, citado por el origen del término y no leído entero; «La ideología alemana» como fuente primaria y clásico, escrita en 1845 a 1846 y publicada completa en 1932; la carta de Engels a Franz Mehring del 14 de julio de 1893 como la fuente real de «falsa conciencia», que no está en la obra publicada de Marx; Mannheim como clásico sólido con debates vivos; Geertz como clásico sólido. Y los lempiras del caso se dicen enteros, con lo que compran y con lo que piden a cambio.',
  'Todo caso termina con la condición escrita y con el pago. La condición es siempre concreta: la respuesta una sola vez y bien con el mapa a la vista, los términos del glosario que describen sin cerrar y el resto en prosa llana, la preferencia de la casa declarada como preferencia, el video que abre con el expediente y cierra con una frase propia bajo el detector. Y el pago no es opcional: cada desenmascaramiento ajeno se paga con uno propio esa misma semana, con su renglón de qué evidencia haría cambiar la premisa. Si ese renglón no existe, la premisa está funcionando como dogma y se anota como tal, con fecha.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"Yo no tengo ideología: yo veo los hechos desnudos".', g1: 'Es el uso tramposo en primera persona: llama sentido común a su propio mapa, que no ha visto nunca. Mannheim cerró esa salida en 1929: quien desenmascara también mira desde algún lado.', g2: 'La corrección no es acusarlo de ciego, sino pedirle tres frases: qué da por obvio, qué no discute nunca, y qué evidencia le haría cambiar una de las dos. Si no puede escribirlas, ahí está el mapa.' },
  { txt: '"Falsa conciencia, como decía Marx en El capital".', g1: 'La frase exacta no está en la obra publicada de Marx: es de Engels, en su carta a Franz Mehring del 14 de julio de 1893. Una materia que exige fuentes no puede fallar en la propia.', g2: 'Y la corrección de fondo es de método: el concepto se autoinmuniza, porque convierte cada objeción en síntoma. Si se usa, se usa con su crítica pegada y con el diagnóstico pagado.' },
  { txt: '"Como todos tenemos sesgo, discutir de política no sirve".', g1: 'Eso es relativismo, no relacionismo, y Mannheim lo rechazó por su nombre. Que toda mirada tenga lugar de origen no borra que unos mapas llevan al río y otros pierden.', g2: 'La corrección: se declara el propio lugar y se sigue midiendo. Renunciar a juzgar no es humildad epistémica; es dejarle el juicio al que grite más fuerte.' },
  { txt: '"Nuestro material es neutral, así que no tiene mapa".', g1: 'Ningún material tiene cero mapa: elegir qué entra y qué no ya es mapa, y Geertz explicó por qué (1964). Lo que se puede pedir no es neutralidad, es declaración.', g2: 'La corrección práctica es la tercera columna: qué es descripción, qué es preferencia declarada, y qué se había colado como obvio. La tercera columna casi nunca está vacía.' },
  { txt: '"Ese video detecta muy bien la ideología del otro bando".', g1: 'Un detector que solo suena con un bando está descompuesto: no es instrumento, es arma. Y el arma se siente exactamente igual que la lucidez, que es lo peligroso.', g2: 'La corrección es la calibración en las dos direcciones: se corre el mismo detector sobre los textos que a la casa le gustan, y si no suena nunca, el problema es el detector.' },
  { txt: '"Ya diseccionamos tres idearios ajenos: la materia está cumplida".', g1: 'Falta la mitad que duele. Diseccionar el ideario del bando contrario lo hace cualquiera; el módulo que cierra la materia son las premisas de la propia casa.', g2: 'La corrección es la regla de pago corriendo de verdad: la fe, el proyecto educativo y el emprendimiento, cada uno con su núcleo, su periferia y su renglón de qué lo haría cambiar.' },
]);
B.critDecisionBank = JSON.stringify([
  'El dirigente magisterial y la radio local esperan respuesta esta semana: ¿se contesta, con qué vocabulario, y qué se les dice a los dos con el mismo texto?',
  'La oferta de L 60,000 con glosario incluido tiene fecha límite: ¿qué términos entran, cuáles se sustituyen por prosa llana, y qué cláusula queda por escrito antes del primer lempira?',
  'El borrador que da por hecho que «emprender es el camino» entra a maquetar el lunes: ¿qué se corrige, qué se declara como preferencia, y qué se anota en el inventario?',
  'Los dos padres del grupo de mensajes están discutiendo ahora mismo: ¿se contesta en el grupo, se contesta con la ficha, o no se contesta? ¿Qué exactamente?',
  'El canal ofrece L 4,500 por el video de las tres frases: ¿qué condición haría el sí posible, y por qué el título original no la cumple?',
  'Jael acaba de diagnosticar falsa conciencia en la mesa: ¿qué se corrige primero, la fuente o el método, y qué paga ella esa misma noche?',
  'Angelly pregunta si nosotros tenemos ideología: ¿qué se le contesta a su edad, y con cuál de las dos versiones, la de Mannheim o la de Geertz?',
  'El autor se descubrió escribiendo «esto no es ideología, es sentido común»: ¿qué hace con la frase, y qué renglón le agrega a la premisa que estaba escondida?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Contestar la acusación nombrando los dos mapas: el del que acusa y el de la casa.', b: 'Contestar la acusación diciendo que la casa no tiene ideología, solo sentido común.', ga: 'Caso A: la discusión cambia de terreno, de quién está ciego a qué afirma cada texto, y la casa queda legible para las dos mitades del público.', gb: 'Caso B: se gana el aplauso del bando que toque y se pierde la báscula, porque es exactamente el uso que Napoleón inauguró, ahora en boca propia.', gr: 'La diferencia no es de modales sino de instrumento: solo el que nombra su propio mapa puede seguir usando la palabra sin convertirla en arma.' },
  { a: 'Citar «falsa conciencia» en su fuente real, con su crítica pegada.', b: 'Citar «falsa conciencia» como frase de Marx, porque así circula.', ga: 'Caso A: la frase entra con su expediente (Engels a Mehring, 14 de julio de 1893) y con su defecto declarado: se autoinmuniza, así que el diagnóstico se paga.', gb: 'Caso B: la ficha repite un error de atribución de un siglo, y una materia que exige fuentes queda desautorizada por su propia página.', gr: 'Quien enseña a pedir fuentes tiene que sobrevivir a que le pidan las suyas, y esta es la primera que se le va a pedir.' },
  { a: 'Aceptar el patrocinio con cláusula: los términos que describen entran, los que cierran se sustituyen.', b: 'Aceptar los L 60,000 con el glosario completo, «total, son palabras técnicas».', ga: 'Caso A: entra el dinero sin entrar el mapa: el control editorial queda en la casa y la cláusula lo prueba por escrito, con el financiador nombrado en lo que financió.', gb: 'Caso B: el niño aprende el cierre sin ver nunca la disputa, y en un año M.E.T.A.S enseña el mapa del financiador con el logo de la casa encima.', gr: 'El glosario es la manera más barata de comprar un aula: se compra el vocabulario y las conclusiones vienen solas.' },
  { a: 'Aplicar el detector primero a una frase de la propia casa, y después a las ajenas.', b: 'Aplicar el detector solo a los textos del bando que a la casa le disgusta.', ga: 'Caso A: el detector queda calibrado en las dos direcciones y las hijas aprenden el gesto completo, que es el único que sirve fuera de esta mesa.', gb: 'Caso B: se fabrica un alumno que ve gafas ajenas y se cree descalzo, que es la trampa propia de la materia y la más difícil de deshacer.', gr: 'Un detector que no se prueba en casa no es instrumento, es arma, y las armas no enseñan a nadie a mirar.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'La palabra se usa sin su expediente, como puro insulto.', guide: 'La discusión se vuelve un concurso de acusaciones: cada bando llama ideología al mapa del otro y sentido común al propio, nadie examina una afirmación, y la conversación termina donde empezó pero con menos confianza.' },
  { cause: 'Se cita «falsa conciencia» como frase de Marx.', guide: 'Se repite un error de atribución de más de un siglo, y la casa pierde autoridad justo en lo que enseña: pedir fuente y fecha. La corrección es Engels a Franz Mehring, 14 de julio de 1893.' },
  { cause: 'Se diagnostica falsa conciencia sin pagar el diagnóstico.', guide: 'El que diagnostica se instala como el único despierto, cada objeción pasa a contar como síntoma, y la conversación se cierra: lo que explica cualquier respuesta no prohíbe ninguna.' },
  { cause: 'Se confunde relacionismo con relativismo.', guide: 'Se concluye que discutir no sirve porque todos tenemos sesgo, y con eso el juicio se lo lleva quien grite más fuerte. Mannheim rechazó esa salida por su nombre, precisamente para evitar ese final.' },
  { cause: 'Se lee la ideología como mapa y no como enfermedad.', guide: 'La palabra deja de ser diagnóstico de enfermos y pasa a ser herramienta de lectura: se puede preguntar qué mapa trae un texto, qué deja afuera y en qué se parece al propio, sin acusar a nadie de estar ciego.' },
  { cause: 'La casa corre el detector sobre sus propias premisas.', guide: 'Aparece la tercera columna (lo que se había colado como obvio), las premisas quedan con su renglón de qué las haría cambiar, y el instrumento se vuelve utilizable fuera de la mesa, porque ya se probó donde duele.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'Los dos acusadores recibieron el mismo texto, y ninguno pudo deducir el bando de la casa.', guide: 'Se contestó una sola vez y bien, con el mapa a la vista: qué hace el proyecto, quién lo paga con cifras, qué temario sigue y qué no pide a cambio, y sin usar una sola palabra del vocabulario de ninguno de los dos marcos.' },
  { effect: 'El patrocinio de L 60,000 entró, y el glosario no.', guide: 'La cláusula quedó escrita antes del primer lempira: los términos que describen sin cerrar se aceptaron, los que fijaban un lado se sustituyeron por prosa llana, el financiador aparece nombrado y el control editorial se quedó entero en la casa.' },
  { effect: 'La misión del trabajo salió con tres caminos y una preferencia declarada.', guide: 'Empleo, emprendimiento y migración quedaron con números y costes reales, y la preferencia de la casa apareció dicha como preferencia. La premisa entró al inventario de gafas con su renglón de qué la haría cambiar.' },
  { effect: 'La discusión del grupo de padres se apagó sin que la casa escribiera un mensaje.', guide: 'Se contestó con la ficha misma, marcada en tres columnas: descripción, preferencia declarada y lo que se había colado como obvio. La tercera columna no estaba vacía, y eso también se dijo en voz alta.' },
  { effect: 'El canal retiró la oferta de los L 4,500 y la marca quedó entera.', guide: 'La casa contrapropuso el formato con el expediente al frente (1796, Napoleón, la carta de 1893) y el detector aplicado a una frase propia al cierre. El canal quería el título, no el instrumento: el título era el producto.' },
  { effect: 'Jael volvió a abrir la conversación con el tío esa misma noche.', guide: 'Corrigió la fuente (Engels a Mehring, 1893, y no Marx) y pagó el diagnóstico con una creencia propia que le conviene creer. Lo único que se había perdido con la frase era la conversación, y volvió.' },
]);

/* ---------- línea de tiempo: los siete momentos del expediente ---------- */
B.timelineData = JSON.stringify([
  { y: '1796', icon: '⚗️', label: 'Nace la palabra', text: '<strong>Antoine Destutt de Tracy</strong> acuña «ideología» como el nombre de <strong>una ciencia</strong>: el estudio de cómo se forman las ideas, <strong>en cualquier cabeza</strong>, incluida la del que estudia. La palabra nace como espejo y no como dedo.' },
  { y: '1801 a 1815', icon: '📚', label: 'Elementos de ideología', text: 'Sale la obra de Destutt de Tracy. Entra con su etiqueta: <strong>clásico de historia de las ideas</strong>, y se cita <strong>por el origen del término</strong>, no se lee entera. Saber eso es parte de la honestidad de fuentes de la etapa.' },
  { y: 'Poco después', icon: '🗣️', label: 'Napoleón y la burla', text: 'Al emperador le estorban esos intelectuales que le objetan con razones, y empieza a llamarlos <strong>«ideólogos» con desprecio</strong>: gente de ideas sin realidad. El desprecio prospera más que la ciencia: <strong>nació ciencia y quedó insulto</strong>.' },
  { y: '1845 a 1846', icon: '📷', label: 'La cámara oscura', text: 'Marx y Engels escriben <strong>«La ideología alemana»</strong>: las ideas dominantes son las de la clase dominante, y la ideología <strong>invierte el mundo como en una cámara oscura</strong>. Se publica completa <strong>en 1932</strong>: durmió ochenta y seis años.' },
  { y: '1893', icon: '✉️', label: 'La carta a Mehring', text: '<strong>La nota honesta:</strong> «falsa conciencia» <strong>no está en la obra publicada de Marx</strong>. Es de <strong>Engels, en su carta a Franz Mehring del 14 de julio de 1893</strong>. Y trae trampa: quien la diagnostica <strong>se declara despierto entre dormidos</strong>.' },
  { y: '1929', icon: '🔭', label: 'Mannheim se muerde la cola', text: 'En <strong>«Ideología y utopía»</strong> gira el instrumento hacia sí mismo: si toda posición produce su punto de vista, <strong>el desenmascarador también mira desde algún lado</strong>. Lo llama <strong>relacionismo</strong>, para no caer en el relativismo.' },
  { y: '1964', icon: '🗺️', label: 'Geertz baja la temperatura', text: '<strong>«La ideología como sistema cultural»</strong> (recogido en <strong>«La interpretación de las culturas», 1973</strong>): la ideología <strong>no es patología sino mapa</strong>, y aparece donde los mapas heredados dejaron de servir. <strong>Nadie mira a ojo desnudo.</strong>' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  tracy: {
    nombre: 'La palabra que nació ciencia', icon: '⚗️',
    estructura: { title: 'Qué es', info: '• Acuñada hacia <strong>1796</strong> por <strong>Destutt de Tracy</strong><br>• Nombre de una <strong>ciencia</strong>: cómo se forman las ideas<br>• Y en <strong>cualquier cabeza</strong>, incluida la del que estudia' },
    funcion: { title: 'Cómo se reconoce', info: '• Cuando la palabra <strong>se aplica también a quien habla</strong><br>• Cuando trae fecha y autor, y no solo un dedo apuntando<br>• Su obra, <strong>«Elementos de ideología» (1801 a 1815)</strong>, se cita por el origen' },
    enfermedades: { title: 'Dónde se cae', info: '• Usarla como <strong>burla napoleónica</strong> sin saberlo<br>• Creer que la inventó Marx: <strong>es medio siglo anterior</strong><br>• Leerla entera cuando <strong>solo se cita por el origen del término</strong>' },
    cuidados: { title: 'En esta casa', info: '• La palabra <strong>siempre con su expediente</strong>: fecha y autor<br>• Y con su etiqueta: <strong>clásico de historia de las ideas</strong><br>• Nunca en una sola dirección: <strong>si señala, también se gira</strong>' },
  },
  camara: {
    nombre: 'La cámara oscura', icon: '📷',
    estructura: { title: 'Qué es', info: '• De Marx y Engels, en <strong>«La ideología alemana»</strong><br>• Escrita <strong>1845 a 1846</strong>, publicada completa <strong>en 1932</strong><br>• La ideología <strong>invierte el mundo</strong>: las ideas dominantes son las de quien domina' },
    funcion: { title: 'Cómo se reconoce', info: '• Manda preguntar <strong>a quién le conviene</strong> que algo parezca obvio<br>• Enseña que las ideas <strong>tienen dueño y dirección</strong><br>• Y que no caen del cielo: alguien gana con ellas' },
    enfermedades: { title: 'Dónde se cae', info: '• Suponer <strong>una posición desde la que el mundo se ve derecho</strong>, sin decir cuál<br>• Aplicarlo solo hacia afuera: <strong>llave que abre todo menos la propia puerta</strong><br>• Citar la obra <strong>como si hubiera circulado desde 1846</strong>' },
    cuidados: { title: 'En esta casa', info: '• Se usa la pregunta y <strong>se gira también hacia adentro</strong><br>• La fecha se dice completa: <strong>escrita en 1846, publicada en 1932</strong><br>• Y el Marx filósofo <strong>vive en su materia</strong>: aquí entra el concepto' },
  },
  falsa: {
    nombre: 'La falsa conciencia', icon: '✉️',
    estructura: { title: 'Qué es', info: '• Creer con sinceridad <strong>lo que a otro le conviene</strong> que se crea<br>• Su <strong>fuente real</strong>: Engels, carta a <strong>Franz Mehring</strong><br>• Del <strong>14 de julio de 1893</strong>, y no de la obra publicada de Marx' },
    funcion: { title: 'Cómo se reconoce', info: '• Nombra algo que existe: <strong>gente sincera creyendo lo que la daña</strong><br>• Explica por qué el argumento correcto <strong>a veces no mueve a nadie</strong><br>• Y viene siempre con su crítica pegada, <strong>el mismo día</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Atribuirla a Marx: <strong>es un error de más de un siglo</strong><br>• <strong>Se autoinmuniza:</strong> toda objeción cuenta como síntoma<br>• Y quien la usa <strong>se declara despierto entre dormidos</strong>' },
    cuidados: { title: 'En esta casa', info: '• Se cita <strong>en su fuente real, con fecha</strong><br>• El diagnóstico <strong>se paga</strong>: una creencia propia conveniente, esa noche<br>• Y nunca cierra una conversación: <strong>si la cierra, era arma</strong>' },
  },
  mapa: {
    nombre: 'Del relacionismo al mapa', icon: '🗺️',
    estructura: { title: 'Qué es', info: '• <strong>Mannheim, «Ideología y utopía» (1929)</strong>: el que desenmascara también mira desde algún lado<br>• A eso lo llamó <strong>relacionismo</strong>, no relativismo<br>• <strong>Geertz (1964, en «La interpretación de las culturas», 1973)</strong>: es un <strong>mapa</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se declara <strong>el lugar propio</strong> y se sigue midiendo<br>• El mapa <strong>elige</strong>, y por eso sirve: deja cosas afuera<br>• Y aparece cuando <strong>los mapas heredados dejaron de servir</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Confundirlo con relativismo: <strong>«todo da igual»</strong><br>• Creer que se puede mirar <strong>sin mapa</strong><br>• Tratar la ideología como <strong>enfermedad del vecino</strong>' },
    cuidados: { title: 'En esta casa', info: '• La meta es <strong>tener las gafas a la vista</strong>, no quitárselas<br>• El mapa propio se escribe: <strong>núcleo, periferia y qué lo haría cambiar</strong><br>• Y el detector se prueba en casa: <strong>si no, es arma</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Usa la palabra como insulto 🗣️' },
  { t: 25, n: 'Sabe que la palabra tiene fecha ⚗️' },
  { t: 55, n: 'Enuncia la cámara oscura 📷' },
  { t: 90, n: 'Cita la carta de 1893 ✉️' },
  { t: 130, n: 'Distingue relacionismo de relativismo 🔭' },
  { t: 165, n: 'Lee la ideología como mapa 🗺️' },
  { t: 190, n: 'Tiene sus gafas a la vista 👓' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del expediente superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la palabra explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de expedientes e insultos experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del expediente maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de las gafas' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta de las Gafas a la Vista completada' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_gafas_expediente_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena la palabra con su expediente y la regla de pago. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se nombra en qué sentido está usada la palabra, porque «ideología» hace cuatro trabajos distintos: la ciencia de las ideas que Destutt de Tracy bautizó hacia 1796, el insulto que Napoleón puso en circulación, la cámara oscura de Marx y Engels, y el mapa de Geertz; sin ese paso la discusión es un concurso de acusaciones. Después se nombran los dos mapas, el del texto y el de la casa, con las palabras de cada uno y sin adoptar el vocabulario de ninguno de los dos marcos, porque quien acepta el vocabulario ajeno acepta las conclusiones que ese vocabulario ya traía cerradas. Luego pasan las fuentes por la regla del estatus, con fecha y etiqueta, y muy en especial la más citada de todas: «falsa conciencia» es de Engels en su carta a Franz Mehring del 14 de julio de 1893, no de la obra publicada de Marx, y se usa siempre con su crítica pegada porque el concepto se autoinmuniza. Y al final se escribe la condición y se paga el desenmascaramiento: uno propio por cada ajeno, esa misma semana, con su renglón de qué evidencia haría cambiar la premisa; si ese renglón no existe, la premisa está funcionando como dogma y se anota como tal, con fecha, porque un detector que no se prueba en casa no es instrumento, es arma.";');

/* ---------- lo que arrastra el molde (la etapa 1 del Expediente Rojo) ---------- */
const textos = [
  [/📕 \*Ruta del Expediente Rojo · Etapa 1\* 📕\\n\\nEl acero antes del juicio: la mejor versión primero, el veredicto después\. Nadie audita lo que no puede enunciar\. 📕\\n\\n_Incluye evaluación conceptual, el acero sobre la mesa, guion de video y tres lecturas\._ ✍️/g,
    '👓 *Ruta de las Gafas a la Vista · Etapa 1* 👓\\n\\nLa palabra con expediente: nació ciencia y quedó insulto. Nadie mira a ojo desnudo, y el oficio es ver las gafas. 👓\\n\\n_Incluye evaluación conceptual, las gafas sobre la mesa, guion de video y tres lecturas._ ✍️'],
  [/El acero antes del juicio · Ruta del Expediente Rojo/g, 'La palabra con expediente · Ruta de las Gafas a la Vista'],
  [/El acero sobre la mesa/g, 'Las gafas sobre la mesa'],
  [/el acero sobre la mesa/g, 'las gafas sobre la mesa'],
  [/completó la Etapa 1 de la Ruta del Expediente Rojo \(El acero antes del juicio\)/g,
    'completó la Etapa 1 de la Ruta de las Gafas a la Vista (La palabra con expediente)'],
  [/const msgs=\['¡Sigue armando el acero!','¡Muy buen trabajo!','¡Aprendiz de herrero!','¡Ya distingues acero de caricatura!','¡Juez con licencia!'\]/,
    "const msgs=['¡Sigue abriendo el expediente!','¡Muy buen trabajo!','¡Aprendiz de óptico!','¡Ya distingues expediente de insulto!','¡Con las gafas a la vista!']"],
  [/\['#9f1239','#e11d48','#a8a29e','#d4a017','#00b894'\]/, "['#5b21b6','#8b5cf6','#a8a29e','#57534e','#00b894']"],
  /* el violeta óptico en las pruebas imprimibles */
  [/#9f1239/g, '#5b21b6'],
  [/#7c1d33/g, '#3b1580'],
  [/#fdf0f3/g, '#f5f3ff'],
  /* el ejemplo del generador de tareas venía de la misión anterior */
  [/La versión que su autor firmaría\./g, 'Acuñó la palabra hacia 1796 como nombre de una ciencia.'],
  [/>El hombre de acero</g, '>Destutt de Tracy<'],
  /* las preguntas fijas de la prueba competencial preguntaban por el acero */
  [/¿Qué versión está sobre la mesa y quién la firmaría, qué dice el test del espejo sobre la salida fácil, y qué cifra necesita horquilla, método y fuente\? Explica la condición escrita que deja la casa y qué se concede en voz alta al otro lado\./g,
    '¿En qué sentido está usada la palabra «ideología» en el caso, qué mapa da por obvio cada lado, y qué fuente o fecha necesita su etiqueta de estatus? Explica la condición escrita que deja la casa y qué desenmascaramiento propio paga esa misma semana.'],
  [/1\. ¿Cuál de los dos juzga con licencia y cuál hace eco\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos nombra su propio mapa y cuál lo esconde? 2. ¿Por qué no son la misma decisión?'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación del acero era la defensa de diez minutos detenida. Aquí es la
   palabra en la mesa: contestar con la trampa del «sentido común» o abrir el
   expediente y nombrar los dos mapas, con Angelly mirando. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(expediente){sfx(expediente?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(expediente){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">👓</span><span class="ms-text"><strong>La casa contestó con los dos mapas:</strong> qué da por obvio el que acusa y qué da por sentado M.E.T.A.S, con cifras de quién lo paga y sin usar una palabra del vocabulario ajeno. Angelly entendió que la palabra no era un insulto: era una pregunta.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">💳</span><span class="ms-text"><strong>Y el desenmascaramiento se pagó:</strong> esa misma semana la casa anotó una premisa propia que nadie discute nunca, con su renglón de qué evidencia la haría cambiar. El detector quedó calibrado en las dos direcciones.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>La trampa quedó impresa:</strong> «lo nuestro es sentido común» reserva la palabra para el bando contrario, que es exactamente el uso que Napoleón inauguró. La casa acaba de hacer, en voz alta, lo que la etapa enseña a cazar.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🙋</span><span class="ms-text"><strong>Y Angelly aprendió lo contrario de lo que se quería enseñar:</strong> que la palabra sirve para señalar afuera. Se corrige esa misma noche, con la versión de Geertz: una ideología es un mapa, y en esta casa el mapa se pone sobre la mesa.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='tracy',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"tracy\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/📕/g, '👓');
src = src.replace(/🧠 Las gafas sobre la mesa/g, '👓 Las gafas sobre la mesa');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
