/* Inyecta los bancos de la misión «El escocés dorado» (Ruta del Expediente
   Dorado, etapa 5: Crítica al Capitalismo, materia 27 del Estudio Mayor)
   sobre el molde copiado de la etapa 4 de esta misma ruta, que es la misión
   más reciente y completa.
   Uso:  node _dev/inyecta-bancos-escoces-dorado.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Adam Smith, «La teoría de los sentimientos morales» (1759): FUENTE
       PRIMARIA, y el gran olvidado. Revisado por su autor hasta la SEXTA
       EDICIÓN, de 1790, el año de su muerte.
     · Adam Smith, «La riqueza de las naciones» (1776): FUENTE PRIMARIA.
       Cinco libros. Las direcciones que esta etapa exige de memoria:
         - libro IV, cap. 2: la única aparición de «mano invisible», y en un
           párrafo sobre la preferencia por invertir en el propio país.
         - libro I, cap. 2: el carnicero, el cervecero y el panadero.
         - libro I, cap. 10: los del mismo oficio y la conspiración contra
           el público.
         - libro I, cap. 8: la combinación tácita de los patrones para no
           subir salarios, y «ninguna sociedad puede ser floreciente y feliz
           si la mayor parte de sus miembros son pobres y miserables».
         - libro V, cap. 2: los ricos contribuyendo algo más que en
           proporción a su renta.
         - libro V, cap. 1: la división del trabajo que embrutece, y de ahí
           la educación pública.
     · Glasgow Edition (Oxford, desde 1976): LA EDICIÓN ACADÉMICA DE
       REFERENCIA. Se nombra porque en esta misión las frases van
       PARAFRASEADAS y no como traducción literal, y eso se declara.
     · Viner, «Adam Smith and Laissez Faire» (1927), en el Journal of
       Political Economy: CLÁSICO DE LA INTERPRETACIÓN, y de Chicago, es
       decir NO del bando al que le convenía el resultado.
     · Rothschild, «Economic Sentiments» (2001): HISTORIA INTELECTUAL. La
       fama de la frase la construyeron los lectores, no el autor.
     · Stigler, «Smith's Travels on the Ship of State» (1971): EL ACERO DEL
       BANDO CONTRARIO. No niega los pasajes: discute la coherencia.
     · Ross, «The Life of Adam Smith» (1995): LA BIOGRAFÍA ESTÁNDAR. De ahí
       la cátedra de Glasgow, la aduana de Edimburgo desde 1778 y los
       manuscritos quemados.

   La idea que ordena todos los bancos: NINGUNA CITA SIN OBRA, AÑO Y
   CAPÍTULO. Y la destreza es EL TEST DE LA FECHA Y DEL LIBRO, cuyas cinco
   preguntas terminan en la que hace todo el trabajo: LA CONTRACITA, la
   frase del mismo autor que le estorba a quien cita.

   Tres cuidados del compendio gobiernan la misión. Uno: el test CORTA EN
   LAS DOS DIRECCIONES, contra el devoto y contra el detractor, con el mismo
   filo. Dos: DESCUBRIR QUE A UN AUTOR LO CITAN MAL NO LO VUELVE ALIADO DE
   UNO, que es el error simétrico y aquí es el más dulce. Tres: el hallazgo
   de Smith SIGUE EN PIE, y lo que la etapa añade es que venía con su letra
   pequeña escrita por el propio autor.

   Y la regla de selección de la materia, que se respeta en los bancos: la
   cita de autoridad entra COMO CATEGORÍA y no como caso con nombre propio.
   No se etiqueta a ningún funcionario, a ningún partido ni a nadie en
   campaña, y tampoco a vecinos ni a maestros. */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-dorado-escoces-dorado', 'js', 'escoces-dorado.js');
/* ---------- sopa de letras: generador determinista ---------- */
/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20270128;
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
  { w: 'La mano invisible: cuántas veces', a: '✋ Aparece <strong>una sola vez</strong> en «La riqueza de las naciones» (1776), en el <strong>libro IV, capítulo 2</strong>, de una obra que tiene cinco libros. Y una vez más en «La teoría de los sentimientos morales» (1759) y otra en un ensayo temprano sobre historia de la astronomía. <strong>Tres veces en toda su obra.</strong>' },
  { w: 'Y qué dice ese párrafo', a: '📖 Que el comerciante que busca su propia seguridad <strong>prefiere invertir en su propio país</strong> antes que en el extranjero, y que al hacerlo favorece sin querer al conjunto. Es un argumento <strong>contra el sistema mercantil de su época</strong>, no una ley general del universo.' },
  { w: 'Los dos libros', a: '📚 <strong>«La teoría de los sentimientos morales» (1759)</strong>, sobre cómo nos importa la suerte de los demás y sobre el <strong>espectador imparcial</strong>; y <strong>«La riqueza de las naciones» (1776)</strong>, en cinco libros, cuyo quinto trata de lo que debe hacer el Estado.' },
  { w: 'El dato que desarma la excusa', a: '📅 Que el libro de la moral fuera cosa de juventud es falso: <strong>Smith lo siguió corrigiendo hasta la sexta edición, publicada en 1790</strong>, el año en que murió. <strong>Catorce años después</strong> de la Riqueza de las naciones. No lo abandonó nunca.' },
  { w: 'La frase del carnicero', a: '🥩 Libro I, capítulo 2: no esperamos la cena de la bondad del carnicero, del cervecero y del panadero, sino de que atiendan a su propio interés. Dice que <strong>el sistema no necesita santos</strong>; <strong>no dice que no necesite reglas</strong>, que es de lo que trata el libro V.' },
  { w: 'Los del mismo oficio', a: '🤫 Libro I, capítulo 10: la gente del mismo oficio <strong>raras veces se reúne, aunque sea para divertirse, sin que la conversación termine en una conspiración contra el público</strong>. Lo escribió Smith, no un crítico del comercio.' },
  { w: 'La combinación de los patrones', a: '💵 Libro I, capítulo 8: <strong>los patrones están siempre y en todas partes en una especie de combinación tácita, pero constante y uniforme, para no subir los salarios</strong>. Y en el mismo capítulo: ninguna sociedad puede ser floreciente y feliz si la mayor parte de sus miembros son pobres y miserables.' },
  { w: 'Los impuestos, según Smith', a: '🧾 Libro V, capítulo 2: no es muy irrazonable que los ricos contribuyan al gasto público <strong>no solo en proporción a su renta, sino algo más que en esa proporción</strong>. Lo escribió el mismo hombre de la frase del carnicero.' },
  { w: 'El lado oscuro de la división del trabajo', a: '🏭 Libro V, capítulo 1: llevada al extremo puede volver al trabajador <strong>tan estúpido e ignorante como es posible que llegue a ser una criatura humana</strong>. Y de ahí Smith deduce la <strong>educación pública</strong>.' },
  { w: 'Los tres deberes del soberano', a: '🏛️ En el libro V: <strong>la defensa, la justicia y las obras e instituciones públicas</strong>. Y el libro IV entero es una demolición del sistema mercantil y de los monopolios concedidos por el Estado, incluida la Compañía de las Indias Orientales.' },
  { w: 'Viner (1927)', a: '📐 En <strong>«Adam Smith and Laissez Faire»</strong>, en el <strong>Journal of Political Economy</strong>, catalogó una por una las excepciones que Smith admite. Etiqueta: <strong>clásico de la interpretación</strong>, y de un economista de Chicago: <strong>no viene del bando al que le convenía</strong>.' },
  { w: 'Rothschild (2001)', a: '📜 En <strong>«Economic Sentiments»</strong> rastrea cómo una expresión menor, y hasta irónica, se convirtió en el emblema de una doctrina entera. Su conclusión: <strong>la fama de la frase la construyeron los lectores, no el autor</strong>. Etiqueta: <strong>historia intelectual</strong>.' },
  { w: 'El acero: Stigler (1971)', a: '🔩 En <strong>«Smith\'s Travels on the Ship of State»</strong> sostiene que las excepciones intervencionistas de Smith <strong>no encajan con su propio análisis del interés propio</strong>: si los comerciantes capturan el mercado, los funcionarios capturan el Estado. <strong>No niega los pasajes: discute la coherencia.</strong>' },
  { w: 'El test de la fecha y del libro', a: '🔬 Cinco preguntas: <strong>de qué libro y de qué año</strong>, <strong>qué dice el párrafo entero</strong>, <strong>cuál es la contracita</strong>, <strong>qué edición se usa</strong> y <strong>qué se sigue de eso</strong>. La tercera es la que separa a un lector de un hincha.' },
  { w: 'La contracita', a: '↔️ La frase <strong>del mismo autor</strong> que apunta al lado contrario. Cualquiera puede encontrar una que le dé la razón; <strong>solo quien leyó puede encontrar la que se la quita</strong>. Es la prueba de lectura de esta etapa.' },
  { w: 'El error simétrico de la etapa', a: '⚠️ Creer que <strong>descubrir que a un autor lo citan mal lo vuelve aliado de uno</strong>. Que Smith pidiera impuestos y escuela pública no lo vuelve socialista, igual que la frase del carnicero no lo vuelve un panfleto. <strong>Un clásico leído entero casi nunca cabe en un bando.</strong>' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Cuántas veces aparece la expresión «mano invisible» en «La riqueza de las naciones»?', o: ['a) Una sola vez, en el libro IV, capítulo 2', 'b) En cada capítulo', 'c) Unas veinte veces', 'd) Ninguna: es un invento posterior'], c: 0 },
  { q: 'El párrafo donde aparece esa expresión habla de…', o: ['a) Una fuerza providencial que arregla cualquier mercado', 'b) Que el comerciante prefiere invertir en su propio país antes que en el extranjero', 'c) Los impuestos a los ricos', 'd) La educación pública'], c: 1 },
  { q: '¿Cuáles son los dos libros de Adam Smith y de qué años son?', o: ['a) Dos tomos de la Riqueza de las naciones, de 1776 y 1790', 'b) Uno de moral y uno de astronomía, de 1759 y 1776', 'c) «La teoría de los sentimientos morales» (1759) y «La riqueza de las naciones» (1776)', 'd) Solo escribió uno, en 1776'], c: 2 },
  { q: '¿Qué dato desarma la excusa de que el libro de la moral era obra de juventud superada?', o: ['a) Que Smith nunca lo publicó', 'b) Que lo escribió después del otro', 'c) Que era más corto', 'd) Que Smith lo siguió corrigiendo hasta la sexta edición, de 1790, el año de su muerte'], c: 3 },
  { q: 'La frase del carnicero, el cervecero y el panadero sostiene que…', o: ['a) El sistema no necesita santos para dar de comer a una ciudad', 'b) El egoísmo es una virtud', 'c) No hacen falta reglas de ningún tipo', 'd) La bondad no existe'], c: 0 },
  { q: 'En el libro I, capítulo 10, Smith escribe que la gente del mismo oficio…', o: ['a) Siempre compite con honradez', 'b) Raras veces se reúne sin que la conversación acabe en una conspiración contra el público', 'c) No debería organizarse nunca', 'd) Nunca se pone de acuerdo en nada'], c: 1 },
  { q: 'Sobre los impuestos, en el libro V, capítulo 2, Smith dice que…', o: ['a) Todo impuesto es un robo', 'b) Solo debe haber impuestos al consumo', 'c) No es muy irrazonable que los ricos contribuyan algo más que en proporción a su renta', 'd) El Estado no debe cobrar nada'], c: 2 },
  { q: '¿Qué demostró Jacob Viner en 1927, y por qué importa de dónde venía?', o: ['a) Que Smith inventó la mano invisible en 1776', 'b) Que Smith no leía a sus críticos', 'c) Que el libro V es apócrifo', 'd) Que Smith no era un doctrinario del dejar hacer, y venía de Chicago: no del bando al que le convenía'], c: 3 },
  { q: 'La tercera pregunta del test de la fecha y del libro, la que separa a un lector de un hincha, es…', o: ['a) ¿Cuál es la contracita: la frase del mismo autor que apunta al otro lado?', 'b) ¿Cuántas páginas tiene el libro?', 'c) ¿En qué idioma lo escribió?', 'd) ¿Quién lo tradujo?'], c: 0 },
  { q: '¿Cuál es el error simétrico que esta etapa advierte?', o: ['a) Citar demasiadas veces al mismo autor', 'b) Creer que descubrir que a un autor lo citan mal lo vuelve aliado de uno', 'c) Leer ediciones traducidas', 'd) Preferir las fuentes primarias'], c: 1 },
]);

/* ---------- clasificar ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Lo dijo Smith', 'Se lo atribuyen'],
    headA: '📖 Está en el libro, con su capítulo',
    headB: '🗣️ Se lo cuelgan, y no está',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Los del mismo oficio conspiran contra el público', t: 'ok' },
      { w: 'El mercado se arregla solo en cualquier caso', t: 'no' },
      { w: 'Los patrones se coordinan para no subir salarios', t: 'ok' },
      { w: 'Todo impuesto es un robo al que trabaja', t: 'no' },
      { w: 'Los ricos podrían contribuir algo más que en proporción', t: 'ok' },
      { w: 'El Estado no debe hacer nada, nunca', t: 'no' },
      { w: 'La división del trabajo puede embrutecer al trabajador', t: 'ok' },
      { w: 'Fue el padre del neoliberalismo', t: 'no' },
    ],
  },
  {
    label: ['Riqueza de las naciones', 'Teoría de los sentimientos'],
    headA: '💰 De 1776, y tiene cinco libros',
    headB: '❤️ De 1759, revisado hasta 1790',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La frase del carnicero, libro I capítulo 2', t: 'ok' },
      { w: 'El espectador imparcial', t: 'no' },
      { w: 'Los tres deberes del soberano', t: 'ok' },
      { w: 'Cómo nos importa la suerte de los demás', t: 'no' },
      { w: 'La demolición del sistema mercantil', t: 'ok' },
      { w: 'La sexta edición, de 1790', t: 'no' },
      { w: 'Los impuestos del libro V', t: 'ok' },
      { w: 'El libro que casi nadie menciona', t: 'no' },
    ],
  },
  {
    label: ['Cita puesta de pie', 'Cita de bandera'],
    headA: '🪶 Se puede ir a comprobar',
    headB: '🚩 No quiere que la comprueben',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Libro IV, capítulo 2, y habla de otra cosa»', t: 'ok' },
      { w: '«Lo dijo Adam Smith»', t: 'no' },
      { w: '«Y aquí está la frase suya que me estorba»', t: 'ok' },
      { w: '«Todo el mundo sabe que él decía eso»', t: 'no' },
      { w: '«Está en la Glasgow Edition, de Oxford»', t: 'ok' },
      { w: '«Lo vi en una imagen con su foto»', t: 'no' },
      { w: '«Parafraseado, y digo que es paráfrasis»', t: 'ok' },
      { w: '«Una frase bonita que suena a él»', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Es de otra etapa o de otra materia'],
    headA: '🪶 Se estudia en esta etapa',
    headB: '🏠 Es de otra etapa o materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El test de la fecha y del libro', t: 'ok' },
      { w: 'La horquilla del IPCC y cómo se lee', t: 'no' },
      { w: 'Las cuatro direcciones de la Riqueza de las naciones', t: 'ok' },
      { w: 'La historia de la palabra «neoliberal»', t: 'no' },
      { w: 'El acero de Stigler contra las excepciones de Smith', t: 'ok' },
      { w: 'Ricardo, Malthus y Keynes leídos enteros', t: 'no' },
      { w: 'La contracita como prueba de lectura', t: 'ok' },
      { w: 'La filosofía moral con sus escuelas', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['La', 'mano', 'invisible', 'aparece', 'una', 'vez.'], c: 4, art: 'Cuántas veces aparece en el libro' },
  { s: ['Está', 'en', 'el', 'libro', 'cuarto,', 'capítulo', 'dos.'], c: 4, art: 'En qué libro de los cinco está' },
  { s: ['Smith', 'escribió', 'dos', 'libros,', 'no', 'uno.'], c: 2, art: 'Cuántos libros escribió' },
  { s: ['La', 'sexta', 'edición', 'salió', 'en', '1790.'], c: 5, art: 'El año que desarma la excusa' },
  { s: ['Los', 'patrones', 'también', 'se', 'coordinan.'], c: 1, art: 'Quiénes se coordinan, según el capítulo 8' },
  { s: ['La', 'contracita', 'es', 'la', 'prueba', 'de', 'lectura.'], c: 1, art: 'La pregunta que separa al lector del hincha' },
  { s: ['Viner', 'catalogó', 'las', 'excepciones', 'en', '1927.'], c: 0, art: 'Quién catalogó las excepciones de Smith' },
  { s: ['Stigler', 'discute', 'la', 'coherencia,', 'no', 'los', 'pasajes.'], c: 0, art: 'Quién pone el acero de esta etapa' },
]);

/* ---------- completar la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'La expresión «mano invisible» aparece ___ vez en la Riqueza de las naciones.', opts: ['una', 'cada', 'ninguna'], c: 0 },
  { s: 'Está en el libro ___, capítulo 2.', opts: ['IV', 'I', 'V'], c: 0 },
  { s: 'La frase del carnicero está en el libro ___, capítulo 2.', opts: ['I', 'IV', 'V'], c: 0 },
  { s: 'Los del mismo oficio y la conspiración están en el libro I, capítulo ___.', opts: ['10', '2', '8'], c: 0 },
  { s: 'Smith revisó la Teoría de los sentimientos hasta ___.', opts: ['1790', '1759', '1776'], c: 0 },
  { s: 'La frase del mismo autor que apunta al otro lado es la ___.', opts: ['contracita', 'bandera', 'paráfrasis'], c: 0 },
  { s: 'La edición académica de referencia es la de ___.', opts: ['Glasgow', 'Edimburgo', 'Londres'], c: 0 },
  { s: 'El acero de esta etapa lo pone ___.', opts: ['Stigler', 'Viner', 'Rothschild'], c: 0 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Lo dijo Smith', 'Se lo atribuyen'],
    btnA: '📖 Lo dijo', btnB: '🗣️ Se lo cuelgan',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Los del mismo oficio conspiran', t: 'ok' },
      { w: 'El mercado arregla todo solo', t: 'no' },
      { w: 'Los patrones se coordinan', t: 'ok' },
      { w: 'Todo impuesto es un robo', t: 'no' },
      { w: 'Los ricos, algo más que en proporción', t: 'ok' },
      { w: 'El Estado nunca debe intervenir', t: 'no' },
      { w: 'La escuela pública hace falta', t: 'ok' },
      { w: 'Fue el padre del neoliberalismo', t: 'no' },
      { w: 'Ninguna sociedad floreciente con la mayoría pobre', t: 'ok' },
      { w: 'La codicia es buena', t: 'no' },
    ],
  },
  {
    label: ['1776', '1759'],
    btnA: '💰 Riqueza', btnB: '❤️ Sentimientos',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El carnicero y el panadero', t: 'ok' },
      { w: 'El espectador imparcial', t: 'no' },
      { w: 'Cinco libros', t: 'ok' },
      { w: 'La sexta edición de 1790', t: 'no' },
      { w: 'Los deberes del soberano', t: 'ok' },
      { w: 'Nos importa la suerte de los demás', t: 'no' },
      { w: 'La demolición del mercantilismo', t: 'ok' },
      { w: 'El libro que casi nadie menciona', t: 'no' },
      { w: 'Los impuestos del libro V', t: 'ok' },
      { w: 'El juez de dentro', t: 'no' },
    ],
  },
  {
    label: ['Cita de pie', 'Cita de bandera'],
    btnA: '🪶 De pie', btnB: '🚩 De bandera',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Trae libro y capítulo', t: 'ok' },
      { w: '«Lo dijo Adam Smith»', t: 'no' },
      { w: 'Trae el párrafo entero', t: 'ok' },
      { w: 'Sale de una imagen bonita', t: 'no' },
      { w: 'Trae la contracita', t: 'ok' },
      { w: 'Solo la mitad que conviene', t: 'no' },
      { w: 'Dice qué edición se usa', t: 'ok' },
      { w: '«Todo el mundo sabe que decía eso»', t: 'no' },
      { w: 'Declara que es paráfrasis', t: 'ok' },
      { w: 'Cierra la conversación', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'El test de la fecha y del libro, en orden',
    steps: [
      'Copiar la frase tal como llegó, sin arreglarla',
      'Buscar de qué obra es y de qué año, y de qué libro y capítulo',
      'Leer el párrafo entero y ver de qué estaba hablando el autor ahí',
      'Buscar la contracita: la frase suya que apunta al otro lado',
      'Anotar qué edición o traducción se está usando, para que otro pueda comprobarlo',
      'Y decir qué se sigue de todo eso para lo que se estaba discutiendo',
    ],
  },
  {
    label: 'Cómo se desarma la media frase de la mano invisible',
    steps: [
      'Reconocer que la cita es real y que el autor existe',
      'Decir que aparece una sola vez, en el libro IV, capítulo 2',
      'Contar de qué habla ese párrafo: preferir invertir en el propio país',
      'Traer la contracita del libro I, capítulo 10: los del mismo oficio',
      'Añadir que el mismo autor pedía impuestos y escuela en el libro V',
      'Y cerrar sin convertirlo en aliado: un clásico entero no cabe en un bando',
    ],
  },
  {
    label: 'Los dos libros, y por qué no se puede quedarse con uno',
    steps: [
      'En 1759 publica «La teoría de los sentimientos morales»',
      'En 1776 publica «La riqueza de las naciones», en cinco libros',
      'La excusa habitual: que el primero era cosa de juventud, superada',
      'El dato que la desarma: siguió corrigiéndolo hasta la sexta edición',
      'Y esa sexta edición apareció en 1790, el año en que murió',
      'Conclusión: quien se queda con uno de los dos está leyendo a otra persona',
    ],
  },
]);

/* ---------- identificar la pieza o la fuente por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Catedrático de Filosofía Moral en Glasgow que nunca dio una clase de economía, porque esa carrera no existía', ans: 'Adam Smith', opts: ['Adam Smith', 'Jacob Viner', 'George Stigler', 'Ian Simpson Ross'] },
  { desc: 'Catalogó en 1927 las excepciones que Smith admite, y venía de Chicago', ans: 'Jacob Viner', opts: ['Jacob Viner', 'Emma Rothschild', 'George Stigler', 'Adam Smith'] },
  { desc: 'Rastreó cómo una expresión menor se convirtió en el emblema de una doctrina entera', ans: 'Emma Rothschild', opts: ['Emma Rothschild', 'Jacob Viner', 'Ian Simpson Ross', 'George Stigler'] },
  { desc: 'Sostuvo en 1971 que las excepciones de Smith no encajan con su propio análisis del interés propio', ans: 'George Stigler', opts: ['George Stigler', 'Jacob Viner', 'Emma Rothschild', 'Adam Smith'] },
  { desc: 'Escribió en 1995 la biografía estándar del escocés', ans: 'Ian Simpson Ross', opts: ['Ian Simpson Ross', 'Emma Rothschild', 'Jacob Viner', 'George Stigler'] },
  { desc: 'La edición académica de referencia, que Oxford empezó a publicar en 1976', ans: 'La Glasgow Edition', opts: ['La Glasgow Edition', 'La sexta edición de 1790', 'El Journal of Political Economy', 'La primera traducción al español'] },
  { desc: 'El libro de 1759 sobre cómo nos importa la suerte de los demás, con el espectador imparcial dentro', ans: 'La teoría de los sentimientos morales', opts: ['La teoría de los sentimientos morales', 'La riqueza de las naciones', 'Economic Sentiments', 'Adam Smith and Laissez Faire'] },
  { desc: 'La frase del mismo autor que apunta al lado contrario, y que solo puede traer quien leyó', ans: 'La contracita', opts: ['La contracita', 'La paráfrasis', 'La cita de autoridad', 'El acero'] },
]);

/* ---------- qué le toca a esa cita ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«Eso lo resuelve la mano invisible, lo dijo Adam Smith»', func: 'Falta la ubicación: aparece una vez, en el libro IV capítulo 2, y sobre otro asunto', opts: ['Falta la ubicación: aparece una vez, en el libro IV capítulo 2, y sobre otro asunto', 'Falta la contracita', 'Falta decir qué edición es', 'Está bien puesta de pie'] },
  { trans: '«Smith dijo que el panadero madruga por su interés, y con eso ya está todo dicho»', func: 'Falta la contracita: el mismo libro I, capítulo 8, dice que los patrones se coordinan', opts: ['Falta la contracita: el mismo libro I, capítulo 8, dice que los patrones se coordinan', 'Falta la ubicación de la frase', 'No es una cita real', 'Está bien puesta de pie'] },
  { trans: '«Adam Smith fue el padre del neoliberalismo»', func: 'Es un problema de calendario: la palabra se acuñó y se popularizó mucho después de 1790', opts: ['Es un problema de calendario: la palabra se acuñó y se popularizó mucho después de 1790', 'Falta la horquilla', 'Es una contracita', 'Está bien puesta de pie'] },
  { trans: '«Vi una frase suya en una imagen, pero no dice de qué libro es»', func: 'Sin obra y sin capítulo no entra: si no aparece en ninguna de las dos obras, no es de Smith', opts: ['Sin obra y sin capítulo no entra: si no aparece en ninguna de las dos obras, no es de Smith', 'Falta el párrafo entero', 'Falta el acero', 'Está bien puesta de pie'] },
  { trans: '«Libro I, capítulo 10, y aquí está la del carnicero que me estorba»', func: 'Está bien puesta de pie: trae ubicación, párrafo y contracita', opts: ['Está bien puesta de pie: trae ubicación, párrafo y contracita', 'Le falta la fuente', 'Le falta la contracita', 'Es una cita de bandera'] },
]);

/* ---------- diagnóstico de la cita ---------- */
B.enfermedadData = JSON.stringify([
  { disease: '«Lo dijo Adam Smith», y ahí termina la anotación', characteristic: 'Falta la dirección: obra, año, libro y capítulo. Sin eso no se puede comprobar nada, y una cita que no quiere ser comprobada está funcionando como escudo y no como fuente', opts: ['Falta la dirección: obra, año, libro y capítulo. Sin eso no se puede comprobar nada, y una cita que no quiere ser comprobada está funcionando como escudo y no como fuente', 'Está mal porque Smith no dijo nada de eso', 'El error es citar a un autor tan antiguo', 'Le falta convertir la frase en cifra'] },
  { disease: 'Se cita la frase del carnicero y se cierra el tema', characteristic: 'Falta la contracita: en el mismo libro I, capítulo 8, Smith escribe que los patrones se coordinan tácitamente para no subir los salarios, y en el 10 que los del mismo oficio conspiran contra el público', opts: ['Falta la contracita: en el mismo libro I, capítulo 8, Smith escribe que los patrones se coordinan tácitamente para no subir los salarios, y en el 10 que los del mismo oficio conspiran contra el público', 'La frase del carnicero es apócrifa', 'El problema es que el ejemplo es de comida', 'Falta decir cuántas páginas tiene el libro'] },
  { disease: 'Se dice que Smith fue el padre del neoliberalismo', characteristic: 'Es un problema de calendario antes que de ideas: Smith murió en 1790 y la palabra se acuñó y se popularizó mucho después, para nombrar políticas que él no vio', opts: ['Es un problema de calendario antes que de ideas: Smith murió en 1790 y la palabra se acuñó y se popularizó mucho después, para nombrar políticas que él no vio', 'Está bien, porque defendía el mercado', 'Falta citar el libro V', 'El error es no decir en qué país'] },
  { disease: 'Se usa una frase sacada de una imagen con su foto', characteristic: 'Si no se puede señalar en qué obra y en qué capítulo está, la frase no entra aunque sea bonita: circulan atribuciones que nadie ha encontrado nunca en sus libros, y esa es la forma más pura de fuente inflada', opts: ['Si no se puede señalar en qué obra y en qué capítulo está, la frase no entra aunque sea bonita: circulan atribuciones que nadie ha encontrado nunca en sus libros, y esa es la forma más pura de fuente inflada', 'Está bien si la imagen es de una cuenta seria', 'El error es no citar la imagen', 'Basta con decir que es de Smith'] },
  { disease: 'Se descubre el Smith incómodo y se lo declara aliado propio', characteristic: 'Es el error simétrico y el más dulce de esta etapa: que a un autor lo citen mal no lo vuelve de nadie, y un clásico leído entero casi nunca cabe en un bando', opts: ['Es el error simétrico y el más dulce de esta etapa: que a un autor lo citen mal no lo vuelve de nadie, y un clásico leído entero casi nunca cabe en un bando', 'Está bien, porque pedía impuestos', 'El error es haber leído el libro V', 'Falta citar a Viner'] },
  { disease: 'Se descarta el argumento de Stigler porque incomoda', characteristic: 'Es la regla del acero al revés: Stigler no niega ningún pasaje, discute si el autor era coherente, y a eso se le contesta leyendo la obra completa en vez de esquivarlo', opts: ['Es la regla del acero al revés: Stigler no niega ningún pasaje, discute si el autor era coherente, y a eso se le contesta leyendo la obra completa en vez de esquivarlo', 'Está bien descartarlo porque era de Chicago', 'Ese argumento no existe en la literatura', 'Basta con decir que se equivoca'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Aparece una sola vez, en el libro IV, capítulo 2.', type: 'La mano invisible, con su dirección' },
  { s: 'No esperamos la cena de su bondad, sino de su propio interés.', type: 'La frase del carnicero (libro I, cap. 2)' },
  { s: 'Raras veces se reúnen sin que la charla acabe en conspiración contra el público.', type: 'Los del mismo oficio (libro I, cap. 10)' },
  { s: 'Están en una combinación tácita pero constante para no subir los salarios.', type: 'Los patrones (libro I, cap. 8)' },
  { s: 'No es muy irrazonable que contribuyan algo más que en proporción a su renta.', type: 'Los impuestos (libro V, cap. 2)' },
  { s: 'Puede volverlo tan estúpido e ignorante como es posible que llegue a ser una criatura humana.', type: 'La división del trabajo (libro V, cap. 1)' },
  { s: 'Siguió corrigiéndolo hasta la sexta edición, la de 1790.', type: 'El dato que desarma la excusa' },
  { s: 'La frase del mismo autor que apunta al lado contrario.', type: 'La contracita' },
  { s: 'Catalogó las excepciones que Smith admite, y venía de Chicago.', type: 'Viner (1927)' },
  { s: 'No niega los pasajes: discute si el autor era coherente.', type: 'El acero de Stigler (1971)' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Smith (1759)', gen: 'Fuente', n: 'El espectador imparcial', g: '«La teoría de los sentimientos morales»', t: 'Fuente primaria, y el gran olvidado' },
  { w: 'Smith (1776)', gen: 'Fuente', n: 'Cinco libros, y el quinto sobre el Estado', g: '«La riqueza de las naciones»', t: 'Fuente primaria' },
  { w: 'La sexta edición (1790)', gen: 'Dato', n: 'Smith corrigiendo la moral hasta morir', g: 'Catorce años después del otro libro', t: 'El dato que desarma la excusa' },
  { w: 'Glasgow Edition (desde 1976)', gen: 'Edición', n: 'El texto exacto, para citar sin parafrasear', g: 'Oxford', t: 'La edición académica de referencia' },
  { w: 'Viner (1927)', gen: 'Fuente', n: 'Las excepciones, catalogadas', g: '«Journal of Political Economy»', t: 'Clásico de la interpretación, y de Chicago' },
  { w: 'Rothschild (2001)', gen: 'Fuente', n: 'Cómo una frase menor se volvió emblema', g: '«Economic Sentiments»', t: 'Historia intelectual' },
  { w: 'Stigler (1971)', gen: 'Fuente', n: 'La coherencia, en discusión', g: '«Smith\'s Travels on the Ship of State»', t: 'El acero del bando contrario' },
  { w: 'Ross (1995)', gen: 'Fuente', n: 'Glasgow, la aduana y los manuscritos quemados', g: '«The Life of Adam Smith»', t: 'La biografía estándar' },
  { w: 'La contracita', gen: 'Herramienta', n: 'La frase que le estorba al que cita', g: 'Tercera pregunta del test', t: 'La prueba de lectura' },
  { w: 'La hoja de la cita', gen: 'Herramienta', n: 'Frase, dirección, párrafo, contracita y consecuencia', g: 'Cinco renglones', t: 'El instrumento de la etapa' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La mano invisible aparece ___ vez en la Riqueza de las naciones.', opts: ['una', 'cada', 'diez'], ans: 'una' },
  { s: 'Y está en el libro ___, capítulo 2.', opts: ['IV', 'I', 'V'], ans: 'IV' },
  { s: 'La conspiración de los del mismo oficio está en el libro I, capítulo ___.', opts: ['10', '2', '8'], ans: '10' },
  { s: 'Los impuestos a los ricos están en el libro ___.', opts: ['V', 'I', 'II'], ans: 'V' },
  { s: 'La sexta edición de la Teoría salió en ___.', opts: ['1790', '1776', '1759'], ans: '1790' },
  { s: 'La frase del autor que apunta al otro lado se llama ___.', opts: ['contracita', 'paráfrasis', 'epígrafe'], ans: 'contracita' },
  { s: 'El acero de esta etapa lo pone ___ en 1971.', opts: ['Stigler', 'Viner', 'Ross'], ans: 'Stigler' },
  { s: 'La edición académica de referencia es la de ___.', opts: ['Glasgow', 'Madrid', 'Chicago'], ans: 'Glasgow' },
]);

B.explainQuestions = JSON.stringify([
  { q: '¿Cuántas veces aparece «la mano invisible» en la obra de Smith, y por qué ese dato cambia una conversación?', ans: 'Aparece tres veces en toda su obra: una en «La riqueza de las naciones», de 1776, en el libro IV capítulo 2; una en «La teoría de los sentimientos morales», de 1759; y una en un ensayo temprano sobre historia de la astronomía. En la obra que todo el mundo cita, entonces, aparece una sola vez, en un libro que tiene cinco libros dentro. Ese dato cambia la conversación porque desplaza la carga: quien usaba la frase como principio general tiene ahora que explicar por qué un autor que escribió miles de páginas la usó una vez de pasada. Y hay una segunda parte que es la que remata: el párrafo donde está no habla de que el mercado se arregle solo, sino de que el comerciante prefiere invertir en su propio país antes que en el extranjero, es decir un argumento concreto contra el sistema mercantil de su época. Cómo esa expresión menor terminó siendo el emblema de una doctrina entera lo rastreó Emma Rothschild en «Economic Sentiments», de 2001, y su respuesta es que la fama la construyeron los lectores.' },
  { q: '¿Por qué esta etapa insiste en que Smith escribió dos libros, y cuál es el dato que cierra la discusión?', ans: 'Porque quien conoce solo «La riqueza de las naciones», de 1776, no está leyendo a Smith a medias: está leyendo a otra persona. El primero es «La teoría de los sentimientos morales», de 1759, y trata de cómo nos importa la suerte de los demás y de esa figura que él llamó el espectador imparcial, una especie de juez interior con el que uno se mira desde fuera. La excusa habitual para ignorarlo es que fue una obra de juventud superada por la de economía, y es una excusa razonable que resulta falsa. El dato que la cierra es sencillo y se recuerda solo: Smith siguió corrigiendo ese libro hasta su sexta edición, publicada en 1790, el año en que murió, es decir catorce años después de la Riqueza de las naciones. No lo abandonó nunca, y por lo tanto no hay ninguna base para tratarlo como un borrador. Quien quiera usar a Smith de bandera tendrá que hacerlo con los dos libros sobre la mesa.' },
  { q: '¿Qué dice la frase del carnicero, qué no dice, y por qué importa la diferencia?', ans: 'Está en el libro I, capítulo 2, y dice que no esperamos nuestra cena de la bondad del carnicero, del cervecero y del panadero, sino de que atiendan a su propio interés. Lo que afirma es un hallazgo genuino y sigue siendo enorme: que una ciudad puede comer sin necesidad de que sus proveedores sean santos, y que por lo tanto el sistema no depende de la virtud de nadie en particular. Lo que no afirma son dos cosas que se le cuelgan constantemente. No dice que la benevolencia no exista ni que el egoísmo sea una virtud, cosa difícil de sostener para el hombre que había publicado diecisiete años antes un libro entero sobre por qué nos importan los demás. Y no dice que no hagan falta reglas: de las reglas trata el libro V, donde Smith asigna al soberano la defensa, la justicia y las obras públicas. La diferencia importa porque «no hace falta bondad» y «no hace falta ley» son afirmaciones distintas, y confundirlas es exactamente el atajo que esta etapa enseña a cazar.' },
  { q: 'Enumera cuatro pasajes que incomodan a los devotos de Smith, con su dirección, y explica qué demuestran y qué no.', ans: 'Primero, libro I capítulo 10: la gente del mismo oficio raras veces se reúne, aunque sea para divertirse, sin que la conversación acabe en una conspiración contra el público. Segundo, libro I capítulo 8: los patrones están siempre y en todas partes en una combinación tácita pero constante para no subir los salarios; y en el mismo capítulo, que ninguna sociedad puede ser floreciente y feliz si la mayor parte de sus miembros son pobres y miserables. Tercero, libro V capítulo 2: no es muy irrazonable que los ricos contribuyan al gasto público algo más que en proporción a su renta. Cuarto, libro V capítulo 1: la división del trabajo llevada al extremo puede volver al trabajador tan estúpido e ignorante como es posible que llegue a ser una criatura humana, de lo cual deriva su defensa de la educación pública. Lo que demuestran es que el autor no era un doctrinario del dejar hacer, cosa que Jacob Viner ya había catalogado en 1927. Lo que no demuestran, y aquí está el freno de esta etapa, es que Smith sea aliado de ninguna posición de hoy: usarlo así es el mismo vicio con la bandera cambiada.' },
  { q: 'Explica el test de la fecha y del libro, y por qué la tercera pregunta hace todo el trabajo.', ans: 'Son cinco preguntas en orden. Uno: de qué obra y de qué año es la frase, y de qué libro y capítulo si se puede. Dos: qué dice el párrafo entero alrededor, porque casi nunca es lo que se cree. Tres: cuál es la contracita, es decir la frase del mismo autor que apunta al lado contrario. Cuatro: qué edición o traducción se está usando, para que otro pueda comprobarlo; en Smith la académica es la Glasgow Edition, que Oxford publica desde 1976. Cinco: qué se sigue de todo eso para lo que se estaba discutiendo. La tercera hace todo el trabajo porque es la única que no se puede contestar sin haber leído. Cualquiera puede encontrar una frase que le dé la razón, incluso sin abrir el libro, porque esa frase circula; solo quien leyó puede traer la que se la quita. Y funciona como prueba en las dos direcciones: el que llega con el carnicero y no conoce el capítulo 10 y el que llega con la conspiración de los comerciantes y no conoce el capítulo 2 están haciendo lo mismo con distinta bandera.' },
  { q: '¿Cuál es el modo de fallar propio de esta etapa, y cuál es su error simétrico?', ans: 'El modo de fallar es usar al autor como escudo en vez de como fuente. Se reconoce por tres señales: la cita aparece sin obra ni capítulo, la frase va recortada de lo que la rodea, y no se trae nunca la frase del mismo autor que estorba. El error simétrico aparece justo después de aprender esto y es el más dulce de todos: creer que descubrir que a un autor lo citan mal lo convierte en aliado de uno. Que Smith pidiera impuestos y educación pública no lo vuelve socialista, igual que la frase del carnicero no lo vuelve un panfleto. Un clásico leído entero casi nunca cabe en un bando, y precisamente por eso vale la pena leerlo: porque no se puede usar sin pensar. La corrección de los dos errores es la misma hoja de la cita: la frase tal como llegó, su dirección, su párrafo, su contracita y qué se sigue de eso.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['CITA', 'LIBRO', 'PARRAFO', 'FECHA', 'PAGINA', 'LEER']),
  haceSopa(10, ['SMITH', 'GLASGOW', 'MANO', 'CARNICERO', 'PANADERO', 'ADUANA']),
  haceSopa(10, ['VINER', 'STIGLER', 'ACERO', 'MORAL', 'IMPUESTO', 'ESCUELA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'La expresión «mano invisible» aparece una sola vez en «La riqueza de las naciones», en el libro IV, capítulo 2.', a: true },
  { q: 'El párrafo donde aparece esa expresión proclama que el mercado se arregla solo en cualquier caso.', a: false },
  { q: 'Adam Smith publicó dos libros: uno en 1759 sobre los sentimientos morales y otro en 1776 sobre la riqueza de las naciones.', a: true },
  { q: 'Smith abandonó el libro de la moral después de publicar el de economía.', a: false },
  { q: 'La sexta edición de «La teoría de los sentimientos morales» apareció en 1790, el año de la muerte de Smith.', a: true },
  { q: 'La frase del carnicero sostiene que el egoísmo es una virtud y que la bondad no existe.', a: false },
  { q: 'En el libro I, capítulo 10, Smith escribe que los del mismo oficio raras veces se reúnen sin conspirar contra el público.', a: true },
  { q: 'Smith sostuvo que los patrones nunca se coordinan entre ellos.', a: false },
  { q: 'En el libro V, capítulo 2, Smith admite que los ricos podrían contribuir algo más que en proporción a su renta.', a: true },
  { q: 'Smith consideraba que la división del trabajo solo tiene efectos buenos.', a: false },
  { q: 'Jacob Viner catalogó en 1927 las excepciones que Smith admitía, y venía de la escuela de Chicago.', a: true },
  { q: 'La expresión «mano invisible» se volvió famosa porque Smith la repitió muchas veces.', a: false },
  { q: 'George Stigler sostuvo en 1971 que las excepciones de Smith no encajan con su propio análisis del interés propio.', a: true },
  { q: 'Stigler niega que los pasajes incómodos existan en el texto.', a: false },
  { q: 'Descubrir que a un autor lo citan mal no lo convierte en aliado de la posición de uno.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Cuántas veces aparece «mano invisible» en «La riqueza de las naciones», y dónde?', o: ['a) Una vez, en el libro IV, capítulo 2', 'b) Una vez en cada uno de los cinco libros', 'c) En el prólogo y en la conclusión', 'd) Nunca: es un añadido de sus editores'], a: 0 },
  { q: 'El párrafo de la mano invisible trata de…', o: ['a) La educación pública', 'b) Que el comerciante prefiere invertir en su propio país antes que en el extranjero', 'c) Los impuestos a los ricos', 'd) La conspiración de los comerciantes'], a: 1 },
  { q: 'Los dos libros de Smith y sus años son…', o: ['a) Uno de 1776 y otro de 1790, los dos de economía', 'b) Uno de astronomía y otro de moral', 'c) «La teoría de los sentimientos morales» (1759) y «La riqueza de las naciones» (1776)', 'd) Solo escribió el de 1776'], a: 2 },
  { q: 'El dato que desarma la excusa de la «obra de juventud» es que…', o: ['a) El libro de la moral es más largo', 'b) Smith lo escribió después', 'c) Nunca lo publicó en vida', 'd) Smith lo revisó hasta la sexta edición, de 1790, catorce años después del otro'], a: 3 },
  { q: '¿Dónde está la frase del carnicero, el cervecero y el panadero?', o: ['a) Libro I, capítulo 2', 'b) Libro IV, capítulo 2', 'c) Libro V, capítulo 1', 'd) En la Teoría de los sentimientos morales'], a: 0 },
  { q: 'La frase del carnicero NO afirma que…', o: ['a) El interés propio funcione en un intercambio corriente', 'b) No hagan falta reglas, porque de eso trata el libro V', 'c) Una ciudad pueda comer sin proveedores santos', 'd) El panadero madrugue por su cuenta'], a: 1 },
  { q: 'La conspiración de los del mismo oficio está en…', o: ['a) Libro V, capítulo 2', 'b) La Teoría de los sentimientos morales', 'c) Libro I, capítulo 10', 'd) Un ensayo sobre astronomía'], a: 2 },
  { q: 'Sobre los salarios, en el libro I, capítulo 8, Smith escribe que…', o: ['a) Los trabajadores son los únicos que se organizan', 'b) Los salarios los fija la naturaleza', 'c) Nadie se coordina nunca', 'd) Los patrones están en una combinación tácita pero constante para no subirlos'], a: 3 },
  { q: 'Los tres deberes del soberano, según el libro V, son…', o: ['a) La defensa, la justicia y las obras e instituciones públicas', 'b) Cobrar impuestos, imprimir moneda y firmar tratados', 'c) Educar, sanar y vigilar', 'd) Ninguno: el libro V dice que el Estado estorba'], a: 0 },
  { q: 'Jacob Viner (1927) importa en esta etapa porque…', o: ['a) Tradujo a Smith al español', 'b) Catalogó las excepciones que Smith admite, y venía de Chicago, no del bando al que convenía', 'c) Descubrió la Glasgow Edition', 'd) Escribió la biografía estándar'], a: 1 },
  { q: 'Emma Rothschild (2001) sostiene que…', o: ['a) La frase es apócrifa', 'b) Smith se contradijo a propósito', 'c) La fama de la mano invisible la construyeron los lectores, no el autor', 'd) El libro V fue añadido después'], a: 2 },
  { q: 'El acero de esta etapa, que hay que contestar y no esquivar, es que…', o: ['a) Smith no existió', 'b) La Riqueza de las naciones es apócrifa', 'c) Los pasajes incómodos son falsos', 'd) Stigler (1971) discute la coherencia: si los comerciantes capturan el mercado, los funcionarios capturan el Estado'], a: 3 },
  { q: 'La tercera pregunta del test de la fecha y del libro pide…', o: ['a) La contracita: la frase del mismo autor que apunta al otro lado', 'b) El número de páginas', 'c) La nacionalidad del autor', 'd) El precio del libro'], a: 0 },
  { q: 'Decir que Smith fue «el padre del neoliberalismo» falla, antes que nada, porque…', o: ['a) Smith no hablaba de economía', 'b) Es un problema de calendario: la palabra se acuñó y se popularizó mucho después de 1790', 'c) La palabra no existe', 'd) Smith era escocés y no inglés'], a: 1 },
  { q: 'El error simétrico que advierte esta etapa consiste en…', o: ['a) Citar a Smith en español', 'b) Leer solo la Teoría de los sentimientos morales', 'c) Creer que descubrir que a un autor lo citan mal lo vuelve aliado de uno', 'd) Usar la Glasgow Edition'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La expresión «mano invisible» aparece ___ vez en «La riqueza de las naciones».', a: 'una' },
  { q: 'Y está en el libro ___, capítulo 2.', a: 'IV' },
  { q: '«La teoría de los sentimientos morales» se publicó en ___.', a: '1759' },
  { q: '«La riqueza de las naciones» se publicó en ___.', a: '1776' },
  { q: 'La sexta edición de la Teoría apareció en ___.', a: '1790' },
  { q: 'La frase del carnicero está en el libro I, capítulo ___.', a: '2' },
  { q: 'La conspiración de los del mismo oficio está en el libro I, capítulo ___.', a: '10' },
  { q: 'La combinación tácita de los patrones está en el libro I, capítulo ___.', a: '8' },
  { q: 'Los impuestos a los ricos están en el libro ___, capítulo 2.', a: 'V' },
  { q: 'Jacob Viner publicó «Adam Smith and Laissez Faire» en ___.', a: '1927' },
  { q: 'Emma Rothschild publicó «Economic Sentiments» en ___.', a: '2001' },
  { q: 'George Stigler publicó «Smith\'s Travels on the Ship of State» en ___.', a: '1971' },
  { q: 'La edición académica de referencia es la de ___.', a: 'Glasgow' },
  { q: 'Smith fue comisionado de aduanas en Edimburgo desde ___.', a: '1778' },
  { q: 'La frase del mismo autor que apunta al otro lado se llama ___.', a: 'contracita' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Libro IV, capítulo 2', def: 'La única aparición de la mano invisible, y habla de otra cosa' },
  { term: 'Libro I, capítulo 2', def: 'El carnicero, el cervecero y el panadero' },
  { term: 'Libro I, capítulo 8', def: 'La combinación tácita de los patrones, y la sociedad floreciente' },
  { term: 'Libro I, capítulo 10', def: 'Los del mismo oficio y la conspiración contra el público' },
  { term: 'Libro V, capítulo 1', def: 'La división del trabajo que embrutece, y la escuela pública' },
  { term: 'Libro V, capítulo 2', def: 'Los ricos contribuyendo algo más que en proporción' },
  { term: '1759', def: '«La teoría de los sentimientos morales», con el espectador imparcial' },
  { term: '1776', def: '«La riqueza de las naciones», en cinco libros' },
  { term: '1790', def: 'La sexta edición de la Teoría, y el año en que Smith muere' },
  { term: '1778', def: 'Smith, comisionado de aduanas en Edimburgo' },
  { term: 'Glasgow Edition', def: 'La edición académica de referencia, de Oxford desde 1976' },
  { term: 'Viner (1927)', def: 'Las excepciones catalogadas, y desde Chicago' },
  { term: 'Rothschild (2001)', def: 'La fama de la frase la hicieron los lectores' },
  { term: 'Stigler (1971)', def: 'El acero: discute la coherencia, no los pasajes' },
  { term: 'Ross (1995)', def: 'La biografía estándar del escocés' },
  { term: 'La contracita', def: 'La frase del propio autor que le estorba a quien cita' },
]);

/* ---------- prueba competencial: la cita sobre la mesa ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'En la sobremesa alguien remata una discusión sobre el precio del transporte con «eso lo arregla la mano invisible, lo dijo Adam Smith». La cita es real y el autor existe.' },
  { txt: 'Del otro lado de la mesa, y con la misma seguridad: «Adam Smith es el padre del neoliberalismo, por eso estamos así».' },
  { txt: 'Las tres pulperías de la colonia subieron el precio del mismo producto la misma semana, y en la casa se discute si eso es casualidad, competencia o arreglo.' },
  { txt: 'Alguien sostiene que la idea de que los patrones se coordinan para no subir salarios es pura paranoia.' },
  { txt: 'Jael trae para una tarea una frase de Smith que sacó de una imagen con letras bonitas y el nombre del autor abajo, sin decir de qué libro viene.' },
  { txt: 'En la escuela se discute si los impuestos son necesarios, y Angelly pregunta qué decía sobre eso el que inventó la economía.' },
  { txt: 'En una discusión de barrio alguien cierra el tema trayendo un nombre grande en vez de un argumento, y todos se callan.' },
  { txt: 'Una misión de esta casa cita una frase de Smith parafraseada al español, y una familia quiere ir a buscar el texto exacto para comprobarla.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. Di de qué obra y de qué año es la frase, y de qué libro y capítulo si se puede. Si no aparece en ninguna de las dos obras, dilo.',
  '2. Cuenta qué dice el párrafo completo alrededor de la frase, es decir de qué estaba hablando el autor ahí.',
  '3. Trae la contracita: la frase del mismo autor que apunta al lado contrario, con su dirección.',
  '4. Di qué edición o traducción se está usando, si la cita es literal o parafraseada, y qué se sigue de todo eso para lo que se estaba discutiendo.',
]);

B.critCaseGuides = JSON.stringify([
  'Se empieza por la dirección, que es el paso que casi nadie da y el que decide la mitad de los casos. Obra y año, y libro y capítulo si se puede: la mano invisible está en el libro IV capítulo 2 de la Riqueza de las naciones, de 1776, y aparece una sola vez. Y si la frase no se encuentra en ninguna de las dos obras, eso también es un resultado, y de los buenos: circulan atribuciones que nadie ha localizado nunca.',
  'Después va el párrafo entero, porque casi nunca dice lo que la frase recortada sugiere. El de la mano invisible habla de que el comerciante prefiere invertir en su propio país, es decir de un argumento contra el sistema mercantil de su siglo. Una respuesta buena cuenta de qué trataba el capítulo y qué problema tenía el autor delante, no solo repite la línea.',
  'Luego la contracita, que es la prueba de lectura de esta etapa y la parte que casi nadie escribe. Con Smith está a mano: al que trae el carnicero del libro I capítulo 2 se le pone al lado el libro I capítulo 10, donde los del mismo oficio conspiran contra el público, o el capítulo 8, donde los patrones se coordinan tácitamente para no subir salarios. Y al que trae los impuestos del libro V se le pone el carnicero. El test corta en las dos direcciones con el mismo filo.',
  'Al final se dice qué edición se usa y si la cita es literal o parafraseada, porque de eso depende que otro pueda comprobarla: la académica es la Glasgow Edition, que Oxford publica desde 1976, y esta casa declara sus paráfrasis en vez de fingir una página. Y se cierra con lo que se sigue para la discusión que había: qué ya no se puede decir, qué queda en pie y qué habría que mirar ahora. Encima de todo va el aviso que impide el error simétrico: descubrir que a un autor lo citan mal no lo vuelve aliado de uno, y un clásico leído entero casi nunca cabe en un bando.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Eso lo arregla la mano invisible, lo dijo Adam Smith".', g1: 'Falta la dirección y falta el párrafo: la expresión aparece una sola vez, en el libro IV capítulo 2, y ese párrafo habla de que el comerciante prefiere invertir en su propio país.', g2: 'La corrección da obra, año, libro y capítulo, cuenta de qué trata el párrafo y añade la contracita del libro I capítulo 10.' },
  { txt: '"Adam Smith fue el padre del neoliberalismo".', g1: 'Es un problema de calendario antes que de ideas: Smith murió en 1790 y la palabra se acuñó y se popularizó mucho después, para nombrar políticas que él no vio.', g2: 'Se corrige poniendo las fechas y remitiendo la palabra a su propio expediente, que es la etapa 6 de esta ruta.' },
  { txt: '"Smith pedía impuestos a los ricos, así que estaba de nuestro lado".', g1: 'Es el error simétrico y el más dulce: el pasaje del libro V capítulo 2 existe, pero descubrir que a un autor lo citan mal no lo convierte en aliado de nadie de hoy.', g2: 'Se corrige diciendo qué dice el pasaje y qué no se sigue de él, y poniendo al lado la frase del carnicero.' },
  { txt: '"Vi la frase en una imagen con su foto, así que es suya".', g1: 'Sin obra y sin capítulo no entra: si no aparece en ninguna de las dos obras, la frase no es de Smith aunque lleve su cara al lado, y esa es la forma más pura de fuente inflada.', g2: 'Se corrige buscándola en el texto y anotando el resultado, aunque el resultado sea que no está.' },
  { txt: '"El libro de la moral era cosa de juventud, ya superada".', g1: 'Es falso y hay un dato que lo cierra: Smith siguió corrigiendo la Teoría de los sentimientos morales hasta su sexta edición, la de 1790, catorce años después de la Riqueza de las naciones.', g2: 'Se corrige citando las dos obras con sus años y el dato de la sexta edición.' },
  { txt: '"El argumento de Stigler no vale la pena ni contestarlo".', g1: 'Es la regla del acero al revés: Stigler no niega ningún pasaje, discute si el autor era coherente, y esa es una objeción legítima que hay que responder leyendo la obra completa.', g2: 'Se corrige reconstruyendo su argumento en su forma más fuerte antes de contestarlo.' },
]);

B.critDecisionBank = JSON.stringify([
  'El tío ya cerró la sobremesa con la mano invisible: ¿qué se contesta en tres renglones, sin quedar de sabelotodo?',
  'El primo dijo que Smith fue el padre del neoliberalismo: ¿qué se le contesta, y por qué el test corta en las dos direcciones?',
  'Las tres pulperías subieron el precio la misma semana: ¿qué cita sirve aquí, qué NO prueba esa cita, y qué pregunta la reemplaza?',
  'Alguien dice que los patrones nunca se coordinan: ¿qué pasaje se trae, y qué cuidado hay que tener con un pasaje que le da la razón a uno?',
  'Jael trajo una frase de una imagen: ¿qué procedimiento se sigue, y qué se hace si la frase no aparece en ningún libro?',
  'Angelly pregunta qué decía Smith de los impuestos: ¿qué se le contesta, y qué freno se pone para no convertirlo en bandera propia?',
  'Alguien quiere usar esta etapa para señalar a una persona con pleito abierto: ¿qué dice la regla de selección de la materia y cómo se escribe el caso como categoría?',
  'La casa parafrasea a Smith en sus misiones: ¿qué se declara, qué se indica en vez de la página, y qué señal obligaría a corregir una misión publicada?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Decir «libro IV, capítulo 2, y aparece una sola vez en toda la obra».', b: 'Decir «lo dijo Adam Smith».', ga: 'Caso A: da la dirección exacta, así que cualquiera puede ir a leer el párrafo y discutirlo, y de paso queda claro cuánto peso tiene la frase en la obra.', gb: 'Caso B: usa el prestigio del nombre y no ofrece nada verificable; funciona para cerrar la conversación, que es para lo que se dijo.', gr: 'La diferencia no es de erudición sino de intención: una cita usada como fuente quiere ser comprobada y una usada como escudo no.' },
  { a: 'Traer el carnicero y, al lado, la conspiración de los del mismo oficio.', b: 'Traer solo el carnicero.', ga: 'Caso A: demuestra lectura, porque la segunda frase le estorba a quien la trae, y deja la discusión en el terreno del texto.', gb: 'Caso B: puede repetirse sin haber abierto el libro, porque esa frase circula sola en carteles e imágenes.', gr: 'La contracita es la prueba de lectura de esta etapa, y funciona igual contra el devoto y contra el detractor.' },
  { a: 'Decir «esto es paráfrasis, y el texto exacto está en la Glasgow Edition».', b: 'Poner la frase entre comillas como si fuera traducción literal.', ga: 'Caso A: es honrado y comprobable: quien quiera el texto exacto sabe dónde buscarlo, y quien lea sabe qué está leyendo.', gb: 'Caso B: finge una precisión que no tiene, y si alguien va a comprobarlo no encontrará esas palabras, con lo cual la casa pierde lo único que le importa.', gr: 'Declarar la paráfrasis cuesta un renglón y compra toda la credibilidad de la misión.' },
  { a: 'Contestar a Stigler reconstruyendo su argumento antes de responderlo.', b: 'Descartar a Stigler por ser de Chicago.', ga: 'Caso A: es la regla del acero de esta ruta, y además obliga a leer más y mejor, porque su objeción es sobre coherencia y no sobre datos.', gb: 'Caso B: descalifica por procedencia, que es lo mismo que hacen los que citan a Smith sin leerlo, con la bandera cambiada.', gr: 'Y hay un detalle que remata: Viner también era de Chicago, y su resultado va en la dirección contraria a la de Stigler.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se cita a un clásico sin obra, año ni capítulo.', guide: 'Sin dirección no hay nada que comprobar, y una cita que no puede comprobarse está funcionando como escudo y no como fuente. La prueba práctica cabe en una pregunta amable: pásame de dónde es, para leerlo completo. Quien usa la cita como fuente la da con gusto; quien la usa como escudo cambia de tema.' },
  { cause: 'Se recorta la frase de su párrafo.', guide: 'Casi ninguna frase famosa dice, en su contexto, lo que dice suelta. La mano invisible está en un párrafo sobre la preferencia por invertir en el propio país, dentro de un libro dedicado a demoler el sistema mercantil. Leer el párrafo no es un lujo de erudito: es la diferencia entre citar al autor y citar a su fama.' },
  { cause: 'No se trae nunca la contracita.', guide: 'Es la señal más limpia de que no se ha leído. Cualquiera encuentra la frase que le da la razón, porque esa circula sola; solo quien leyó encuentra la que se la quita. Con Smith el ejercicio es fácil y demoledor: al carnicero del libro I capítulo 2 se le opone el capítulo 10, y a los impuestos del libro V se les opone el carnicero.' },
  { cause: 'Se cuelga a un autor una palabra posterior a su muerte.', guide: 'Es un problema de calendario antes que de ideas, y por eso se resuelve rápido: Smith murió en 1790 y la palabra que se le cuelga se acuñó y se popularizó mucho después. Eso no significa que no se pueda discutir su influencia, significa que hay que discutirla con fechas y no con etiquetas. La historia de esa palabra tiene su propio expediente en la etapa 6.' },
  { cause: 'Se convierte al autor bien citado en aliado propio.', guide: 'Es el error simétrico de esta etapa y aparece justo cuando uno acaba de aprender lo demás, que es lo que lo hace peligroso. Que Smith pidiera impuestos y educación pública no lo vuelve socialista, igual que la frase del carnicero no lo vuelve un panfleto. Un clásico leído entero casi nunca cabe en un bando, y esa incomodidad es la señal de que se leyó bien.' },
  { cause: 'Se cita en paráfrasis y se presenta como traducción literal.', guide: 'Es una falta pequeña que cuesta muy caro, porque es exactamente la que la etapa enseña a cazar. Si alguien va a comprobar el pasaje y no encuentra esas palabras, pierde la confianza en todo lo demás, y con razón. La regla de la casa es barata: se declara la paráfrasis, se da libro y capítulo en vez de una página inventada, y se nombra la edición académica para quien quiera el texto exacto.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La sobremesa terminó con la cita puesta de pie y sin pelea.', guide: 'Se dijo que la frase es real, que aparece una sola vez, en el libro IV capítulo 2, y que ese párrafo habla de que el comerciante prefiere invertir en su propio país. Y se añadió la contracita del libro I capítulo 10, la de los del mismo oficio y la conspiración contra el público. Nadie quedó humillado y la conversación pasó del prestigio al texto, que es donde se puede discutir.' },
  { effect: 'Al primo se le contestó con el mismo test, y no con la bandera contraria.', guide: 'Se le mostró que llamar a Smith padre del neoliberalismo es primero un problema de calendario, porque murió en 1790 y la palabra vino mucho después. Y se le pidió lo mismo que al tío: obra, año y capítulo. El test corta en las dos direcciones y por eso sirve; si solo cortara hacia un lado sería otra bandera.' },
  { effect: 'El caso de las tres pulperías quedó bien escrito en el expediente.', guide: 'Se trajo el pasaje del libro I capítulo 10, y se anotó expresamente lo que ese pasaje no prueba: no demuestra que las tres se pusieran de acuerdo, y decir lo contrario sería el vicio de la etapa. Lo que hizo fue cambiar la pregunta, de si son malas personas a cuántos venden aquí y qué tan fácil es coordinarse, que es una pregunta que se contesta mirando la cuadra.' },
  { effect: 'Jael aprendió el procedimiento para las frases de imagen, y sin regaño.', guide: 'Primero la dirección: si la imagen no dice obra ni capítulo, eso ya es un dato sobre la imagen. Después la búsqueda en el texto, que está publicado. Y el resultado que decide: si no aparece en ninguna de las dos obras, la frase no es de Smith aunque lleve su cara. La regla quedó escrita: una frase sin obra y sin capítulo no entra en un trabajo, aunque sea bonita.' },
  { effect: 'La casa dejó por escrito cómo cita a Smith en sus misiones.', guide: 'Toda cita lleva obra, año y capítulo; lo parafraseado se declara parafraseado y por eso se da libro y capítulo en vez de una página; el acero del bando contrario entra en su mejor versión, que aquí es Stigler; y las lecturas de estilo llevan su etiqueta de pastiche. Y la señal que obligaría a corregir: si una familia busca un pasaje citado aquí y no lo encuentra donde dice, se corrige la misión.' },
  { effect: 'Angelly obtuvo una respuesta que sirve para discutir y no para ganar.', guide: 'Se le mostró el libro V, con los tres deberes del soberano y el pasaje del capítulo 2 sobre que los ricos podrían contribuir algo más que en proporción a su renta. Y se le puso el freno en la misma frase: eso no convierte a Smith en partidario de nada de hoy. Lo que hace es sacar la discusión de las etiquetas y llevarla a la pregunta útil, que es cuáles impuestos, para qué y con qué factura, tal como enseñó la etapa 2.' },
]);

/* ---------- línea de tiempo ---------- */
B.timelineData = JSON.stringify([
  { y: '1759', icon: '❤️', label: 'El libro olvidado', text: 'Smith publica <strong>«La teoría de los sentimientos morales»</strong>, sobre cómo nos importa la suerte de los demás y sobre el <strong>espectador imparcial</strong>, ese juez de dentro con el que uno se mira desde fuera. Etiqueta: <strong>fuente primaria, y el gran olvidado</strong>.' },
  { y: '1776', icon: '💰', label: 'La riqueza de las naciones', text: 'Aparece la obra en <strong>cinco libros</strong>. En el <strong>I, capítulo 2</strong> está el carnicero; en el <strong>I, capítulo 10</strong>, la conspiración de los del mismo oficio; en el <strong>IV, capítulo 2</strong>, la <strong>única</strong> aparición de la mano invisible; y el <strong>V</strong> trata de lo que debe hacer el Estado. Etiqueta: <strong>fuente primaria</strong>.' },
  { y: '1778', icon: '⚓', label: 'La ironía de la aduana', text: 'Smith empieza a trabajar como <strong>comisionado de aduanas en Edimburgo</strong>: el crítico más famoso del sistema mercantil pasa sus últimos años cobrando por hacer cumplir aranceles. Del dato responde la biografía estándar, la de <strong>Ross (1995)</strong>.' },
  { y: '1790', icon: '📅', label: 'La sexta edición, y la muerte', text: 'Sale la <strong>sexta edición</strong> de «La teoría de los sentimientos morales», corregida por su autor, el <strong>mismo año en que muere</strong>. Catorce años después de la Riqueza de las naciones. Etiqueta: <strong>el dato que desarma la excusa</strong> de la obra de juventud superada.' },
  { y: '1927', icon: '📐', label: 'Viner cataloga las excepciones', text: 'En el <strong>Journal of Political Economy</strong>, <strong>Jacob Viner</strong> publica <strong>«Adam Smith and Laissez Faire»</strong> y cataloga una por una las excepciones que Smith admite. Etiqueta: <strong>clásico de la interpretación</strong>, y de un economista de Chicago: no del bando al que le convenía.' },
  { y: '1971', icon: '🔩', label: 'Stigler, el acero', text: 'En <strong>«Smith\'s Travels on the Ship of State»</strong>, <strong>George Stigler</strong> sostiene que las excepciones intervencionistas <strong>no encajan con el propio análisis del interés propio</strong>: si los comerciantes capturan el mercado, los funcionarios capturan el Estado. Etiqueta: <strong>el acero</strong>, y se contesta leyendo.' },
  { y: '1976', icon: '📗', label: 'La edición de Glasgow', text: 'Oxford empieza a publicar la <strong>Glasgow Edition of the Works and Correspondence of Adam Smith</strong>. Etiqueta: <strong>la edición académica de referencia</strong>. Es la que se cita cuando hace falta el texto exacto y no una paráfrasis.' },
  { y: '1995', icon: '🧑‍🏫', label: 'La vida, documentada', text: '<strong>Ian Simpson Ross</strong> publica <strong>«The Life of Adam Smith»</strong>, la <strong>biografía estándar</strong>. De ahí salen la cátedra de Filosofía Moral en Glasgow, el puesto de aduanas y la orden de <strong>quemar sus manuscritos inéditos</strong> antes de morir.' },
  { y: '2001', icon: '📜', label: 'Rothschild sigue la pista de la frase', text: 'En <strong>«Economic Sentiments»</strong>, <strong>Emma Rothschild</strong> rastrea cómo una expresión menor, y hasta irónica, se volvió el emblema de una doctrina entera. Su conclusión: <strong>la fama de la frase la construyeron los lectores, no el autor</strong>. Etiqueta: <strong>historia intelectual</strong>.' },
  { y: 'Hoy', icon: '🪶', label: 'El test de la fecha y del libro', text: 'De todo lo anterior sale la herramienta de la etapa, y no sirve solo para Smith: <strong>obra y año, párrafo entero, contracita, edición y qué se sigue de eso</strong>. La tercera pregunta es la que separa a un lector de un hincha, porque <strong>solo quien leyó puede traer la frase que le estorba</strong>.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  libros: {
    nombre: 'Dos libros, una cabeza', icon: '📚',
    estructura: { title: 'Qué dice', info: '• Smith escribió <strong>dos</strong> obras, y el que casi nadie menciona es el primero<br>• <strong>1759:</strong> «La teoría de los sentimientos morales», con el <strong>espectador imparcial</strong><br>• <strong>1776:</strong> «La riqueza de las naciones», en cinco libros' },
    funcion: { title: 'Cómo se reconoce', info: '• Cuando alguien habla de «Smith» y solo conoce <strong>una</strong> de las dos obras<br>• Cuando dice que la moral era <strong>cosa de juventud</strong><br>• Ahí entra el dato: <strong>la sexta edición es de 1790</strong>, el año en que murió' },
    enfermedades: { title: 'Dónde se cae', info: '• Quedarse con <strong>un solo libro</strong>, que es leer a otra persona<br>• Creer que el <strong>orden</strong> de publicación indica abandono<br>• Y olvidar que el <strong>libro V</strong> de la Riqueza trata del Estado' },
    cuidados: { title: 'En esta casa', info: '• Las <strong>dos obras entran juntas</strong>, con su año, y la Teoría con su sexta edición<br>• Los datos del hombre vienen de <strong>Ross (1995)</strong>, la biografía estándar<br>• Y la <strong>Glasgow Edition</strong> se nombra para quien quiera el texto exacto' },
  },
  carnicero: {
    nombre: 'La frase del carnicero', icon: '🥩',
    estructura: { title: 'Qué dice', info: '• <strong>Libro I, capítulo 2:</strong> la cena no viene de la bondad sino del propio interés<br>• Que el sistema <strong>no necesita santos</strong> para alimentar una ciudad<br>• Es un hallazgo genuino, y esta casa lo trata con respeto' },
    funcion: { title: 'Cómo se reconoce', info: '• Se distingue <strong>lo que afirma</strong> de <strong>lo que se le cuelga</strong><br>• No dice que la bondad no exista: el autor escribió un libro sobre eso<br>• Y no dice que <strong>no hagan falta reglas</strong>, que es el libro V' },
    enfermedades: { title: 'Dónde se cae', info: '• Confundir <strong>«no hace falta bondad»</strong> con <strong>«no hace falta ley»</strong><br>• Citarla y detenerse, sin llegar al capítulo <strong>8</strong> ni al <strong>10</strong><br>• Y usarla como final de conversación en vez de como punto de partida' },
    cuidados: { title: 'En esta casa', info: '• Va siempre con su <strong>contracita</strong>, que está en el mismo libro I<br>• Y con la frase del capítulo 8: <strong>ninguna sociedad floreciente con la mayoría pobre</strong><br>• El corte se señala en <strong>los dos bandos</strong>, porque los dos lo hacen' },
  },
  incomodo: {
    nombre: 'El Smith incómodo', icon: '😬',
    estructura: { title: 'Qué dice', info: '• <strong>I, 10:</strong> los del mismo oficio y la conspiración contra el público<br>• <strong>I, 8:</strong> los patrones coordinados tácitamente para no subir salarios<br>• <strong>V, 2 y V, 1:</strong> los ricos contribuyendo algo más, y la escuela pública' },
    funcion: { title: 'Cómo se reconoce', info: '• Es la parte del libro que <strong>no está en los carteles</strong><br>• Y el <strong>libro IV</strong> entero, que demuele el sistema mercantil y los monopolios<br>• Con los <strong>tres deberes del soberano</strong>: defensa, justicia y obras públicas' },
    enfermedades: { title: 'Dónde se cae', info: '• Descubrirlo y <strong>declararlo aliado propio</strong>, que es el error simétrico<br>• Usarlo para <strong>probar cosas de hoy</strong> que el texto no prueba<br>• Y olvidar que <strong>Viner ya lo había catalogado en 1927</strong>: no es un hallazgo nuevo' },
    cuidados: { title: 'En esta casa', info: '• Cada pasaje entra <strong>con su libro y su capítulo</strong>, para que se pueda comprobar<br>• Con <strong>el acero de Stigler (1971)</strong> al lado, que discute la coherencia<br>• Y con el freno escrito: <strong>un clásico entero casi nunca cabe en un bando</strong>' },
  },
  test: {
    nombre: 'El test de la fecha y del libro', icon: '🔬',
    estructura: { title: 'Qué dice', info: '• Cinco preguntas: <strong>obra y año, párrafo, contracita, edición y consecuencia</strong><br>• Sirve para <strong>cualquier clásico</strong>, no solo para Smith<br>• Y termina en la hoja de la cita, que se llena antes de repetir nada' },
    funcion: { title: 'Cómo se reconoce', info: '• La tercera pregunta es la que hace el trabajo: <strong>la contracita</strong><br>• Porque cualquiera halla la frase que le da la razón<br>• Y <strong>solo quien leyó</strong> halla la que se la quita' },
    enfermedades: { title: 'Dónde se cae', info: '• Aplicarlo <strong>en una sola dirección</strong>, contra el bando ajeno<br>• Pedir la dirección y no leer el <strong>párrafo</strong><br>• Y presentar una <strong>paráfrasis</strong> entre comillas como si fuera literal' },
    cuidados: { title: 'En esta casa', info: '• El test <strong>corta en las dos direcciones</strong>, contra el devoto y contra el detractor<br>• Las citas de esta misión van <strong>parafraseadas y declaradas como tal</strong><br>• Y con <strong>libro y capítulo</strong> en vez de una página inventada' },
  },
});

/* ---------- niveles y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Cierra discusiones con una frase enmarcada 🖼️' },
  { t: 25, n: 'Ya pregunta de qué libro es 🪶' },
  { t: 55, n: 'Sabe que la mano invisible aparece una vez ✋' },
  { t: 90, n: 'Distingue los dos libros y sus años 📚' },
  { t: 130, n: 'Trae la contracita, la que le estorba ↔️' },
  { t: 165, n: 'Aplica el test en las dos direcciones 🔬' },
  { t: 190, n: 'Lee al clásico entero, y ya no cabe en su bando 📗' },
]);

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del escocés superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la etapa explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de lo que dijo y lo que le atribuyen' },
  id_master: { icon: '🔍', label: 'Identificador de piezas y fuentes maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del escocés' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 5 de la Ruta del Expediente Dorado completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  { t: 'Borges', q: '¿En qué estado encontró el narrador el ejemplar de «La riqueza de las naciones» de su padre?', o: ['a) Las primeras páginas muy usadas y el resto del volumen intacto', 'b) Completamente subrayado de principio a fin', 'c) Sin abrir, con las hojas pegadas', 'd) Roto y sin portada'], c: 0 },
  { t: 'Borges', q: '¿Por qué la frase que usaba su padre no podía estar en las páginas gastadas?', o: ['a) Porque su padre la había inventado', 'b) Porque está en el libro IV, capítulo 2, lejos del café y los dobleces', 'c) Porque estaba en el otro libro de Smith', 'd) Porque el ejemplar estaba incompleto'], c: 1 },
  { t: 'Borges', q: '¿Qué excusa de su padre resultó imposible, y con qué dato?', o: ['a) Que el libro era demasiado largo', 'b) Que la traducción era mala', 'c) Que el libro de la moral era obra de juventud superada, porque Smith lo revisó hasta 1790', 'd) Que nadie había leído el libro V'], c: 2 },
  { t: 'Borges', q: '¿Qué hizo el narrador con los subrayados de su padre?', o: ['a) Los borró todos', 'b) Vendió el libro', 'c) Copió el libro a mano', 'd) No los borró: añadió los suyos con otro lápiz, más blando'], c: 3 },
  { t: 'Borges', q: 'Según el narrador, ¿en qué consiste la diferencia entre citar y leer?', o: ['a) No es de erudición sino de valentía, porque leer entero obliga a defender una posición más incómoda', 'b) En la cantidad de libros que uno tiene', 'c) En saber idiomas', 'd) En tener buena memoria'], c: 0 },
  { t: 'Cervantes', q: '¿Qué querían hacer el cura y el barbero con el libro gordo de pasta parda?', o: ['a) Leerlo juntos en voz alta', 'b) Uno quemarlo y el otro salvarlo, los dos por lo que habían oído', 'c) Venderlo en la feria', 'd) Regalárselo al hidalgo'], c: 1 },
  { t: 'Cervantes', q: '¿Qué preguntó la sobrina desde la puerta?', o: ['a) Cuánto costaba el libro', 'b) Quién lo había traído', 'c) Si alguno de los dos lo había abierto', 'd) Si tenía dibujos'], c: 2 },
  { t: 'Cervantes', q: '¿Qué plazo propuso la sobrina, y para qué?', o: ['a) Un año, para copiarlo', 'b) Una semana, para venderlo', 'c) Tres días, para consultar al maestro', 'd) Treinta días: ella lo lee y después ellos lo sentencian'], c: 3 },
  { t: 'Cervantes', q: 'Cuando el cura dijo que el libro era suyo porque manda enseñar y repartir, ¿qué le contestó la sobrina?', o: ['a) Que el libro no es de bando: es de dos manos', 'b) Que tenía razón y podía quedárselo', 'c) Que el libro era del barbero', 'd) Que había que quemarlo igual'], c: 0 },
  { t: 'Cervantes', q: '¿Qué regla mandó escribir la sobrina encima del libro, en el estante?', o: ['a) Que nadie lo tocara sin permiso', 'b) Que no se cita nada sin decir de qué libro y capítulo, y que quien traiga una frase traiga la que le estorbe', 'c) Que se leyera solo los domingos', 'd) Que se copiara antes de prestarlo'], c: 1 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué es lo que nos hace únicos al discutir?', o: ['a) Que usamos el lenguaje', 'b) Que escribimos libros', 'c) Que somos la única especie que puede ganar una discusión mencionando a un muerto', 'd) Que tenemos memoria larga'], c: 2 },
  { t: 'Harari', q: '¿Qué división del trabajo curiosa describe el ensayo?', o: ['a) Que unos escriben y otros venden', 'b) Que unos traducen y otros publican', 'c) Que unos enseñan y otros aprenden', 'd) Que unos pocos leen los libros y todos los demás repetimos las frases'], c: 3 },
  { t: 'Harari', q: '¿Qué dos detalles biográficos añade el ensayo para ver al hombre en vez del emblema?', o: ['a) Que fue comisionado de aduanas desde 1778 y que mandó destruir sus manuscritos inéditos', 'b) Que nació en Escocia y viajó a Francia', 'c) Que era hijo único y nunca se casó', 'd) Que fue tutor de un duque y murió pobre'], c: 0 },
  { t: 'Harari', q: 'Según el ensayo, la primera invención de la especie fue un avance y la segunda hay que usarla con cuidado. ¿Cuáles son?', o: ['a) La agricultura y el dinero', 'b) La escritura, para no depender de la memoria; y la cita, para no depender de la lectura', 'c) La imprenta y la escuela', 'd) El lenguaje y la escritura'], c: 1 },
  { t: 'Harari', q: '¿Cuáles son las tres preguntas que el ensayo propone para cualquier cita?', o: ['a) Quién la dijo, cuándo y por qué', 'b) Si es larga, si es clara y si convence', 'c) De qué obra y año es, qué dice el párrafo completo, y cuál es la frase del autor que apunta al lado contrario', 'd) Si está traducida, si es literal y si es bonita'], c: 2 },
]);

B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: '«La teoría de los sentimientos morales» se publicó en ___.', a: '1759' },
  { t: 'las tres', q: '«La riqueza de las naciones» se publicó en ___.', a: '1776' },
  { t: 'las tres', q: 'La expresión «mano invisible» está en el libro ___, capítulo 2.', a: 'IV' },
  { t: 'las tres', q: 'Smith revisó la Teoría hasta la sexta edición, de ___.', a: '1790' },
  { t: 'Borges', q: 'Jacob Viner publicó «Adam Smith and Laissez Faire» en ___.', a: '1927' },
  { t: 'Borges', q: 'Emma Rothschild publicó «Economic Sentiments» en ___.', a: '2001' },
  { t: 'Borges', q: 'George Stigler publicó «Smith\'s Travels on the Ship of State» en ___.', a: '1971' },
  { t: 'Harari', q: 'Smith fue comisionado de aduanas en Edimburgo desde ___.', a: '1778' },
  { t: 'Harari', q: 'La edición académica de referencia es la de ___, publicada por Oxford desde 1976.', a: 'Glasgow' },
  { t: 'Cervantes', q: 'La sobrina pidió un plazo de ___ días para leer el libro antes de que lo sentenciaran.', a: 'treinta' },
]);

B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan al mismo asunto por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento convierte el problema en una herencia y por eso lo vuelve inolvidable: un volumen gastado en las primeras páginas y virgen en el resto es un retrato completo de un hombre y de una costumbre, y no hay explicación teórica que llegue tan hondo como ese detalle físico. Además hace algo que solo la ficción puede hacer, que es dejar al narrador incómodo consigo mismo: añade sus subrayados con otro lápiz y reconoce que perdió las sobremesas que su padre ganaba. El capítulo lo vuelve escena, risa y refrán, y ahí está la pregunta que resume la etapa entera en cinco palabras, la de la sobrina desde la puerta: si alguno de los dos lo había abierto. El ensayo pone la escala de especie y encadena la erudición con sus años y capítulos, que es lo que permite comprobar. Leyendo solo el cuento se tendría melancolía sin fuentes; solo el capítulo, astucia sin datos; solo el ensayo, datos sin ninguna imagen que los fije. Las tres juntas dan lo mismo por tres caminos, y por eso la casa las escribe así.' },
  { q: '2. El cuento dice que el ejemplar del padre estaba muy usado al principio e intacto en el resto. Explica qué significa ese detalle y por qué basta como retrato.', guia: 'Significa que aquel hombre no leyó el libro: fue a buscar en él una frase que ya sabía. Las primeras páginas del libro primero muestran dobleces, una mancha de café y tres subrayados, es decir uso real; el resto conserva la rigidez de los cuadernillos que nunca se abrieron. Y el detalle basta como retrato por una razón aritmética que el cuento aprovecha muy bien: la frase que él usaba durante cuarenta años está en el libro IV, capítulo 2, o sea a una distancia considerable de la única zona gastada, de modo que el volumen mismo demuestra que la cita venía de otra parte, probablemente de oírla. Hay además una lección de método escondida en la escena: los objetos guardan pruebas que las conversaciones no guardan, igual que una serie de lluvia guarda lo que la memoria no. Un libro es un cuaderno de dos autores, el que lo escribió y el que lo usó, y el segundo también deja constancia.' },
  { q: '3. La sobrina pregunta si alguno de los dos había abierto el libro. Explica por qué esa pregunta es la etapa entera, y qué hacen el cura y el barbero antes de ella.', guia: 'Antes de la pregunta, los dos están sentenciando por lo que han oído: el barbero quiere quemarlo porque le contaron que dice que cada uno mire por sí, y el cura quiere salvarlo porque le contaron que manda repartir y poner escuelas. Los dos hablan del mismo libro y lo describen como cosas opuestas, y ninguno lo ha abierto. Ahí está el diagnóstico de la etapa en forma de escena: la media frase no es la trampa de un bando, es la comodidad de los dos, y las dos mitades circulan por separado porque cada una le sirve a alguien. La pregunta de la sobrina es la etapa entera porque no discute el contenido, discute el procedimiento: no dice quién tiene razón, dice que sentenciar antes de leer no es justicia sino adivinanza. Y tiene una virtud que conviene señalar: es una pregunta que cualquiera puede hacer sin haber leído nada, con lo cual está al alcance de la niña de la casa igual que del cura del pueblo.' },
  { q: '4. Explica el dato de la sexta edición de 1790 y por qué esta etapa lo trata como la pieza que cierra una discusión.', guia: 'La excusa más común para ignorar «La teoría de los sentimientos morales», de 1759, es que fue una obra de juventud superada por «La riqueza de las naciones», de 1776. Es una excusa razonable, y por eso hace falta un dato y no un argumento para desmontarla. El dato es que Smith siguió corrigiendo ese libro hasta su sexta edición, publicada en 1790, el año en que murió, es decir catorce años después de la obra de economía. No lo abandonó nunca: lo estaba trabajando al final de su vida. Eso cierra la discusión porque cambia lo que hay que explicar: quien quiera sostener que el Smith verdadero es solo el de la Riqueza de las naciones tiene que explicar por qué su autor dedicó sus últimos años a revisar el otro. Y tiene un efecto secundario útil para esta casa: enseña que a veces una fecha vale más que una interpretación, y que buscar fechas es más barato que discutir.' },
  { q: '5. Enumera los pasajes incómodos que aparecen en las tres lecturas, con su dirección, y explica qué demuestran y qué no.', guia: 'Aparecen cuatro, y los tres textos los citan con su libro y su capítulo. Libro I, capítulo 10: la gente del mismo oficio raras veces se reúne, aunque sea para divertirse, sin que la conversación acabe en una conspiración contra el público. Libro I, capítulo 8: los patrones están siempre y en todas partes en una combinación tácita pero constante para no subir los salarios, y en el mismo capítulo, que ninguna sociedad puede ser floreciente y feliz si la mayor parte de sus miembros son pobres y miserables. Libro V, capítulo 2: no es muy irrazonable que los ricos contribuyan algo más que en proporción a su renta. Libro V, capítulo 1: la división del trabajo llevada al extremo puede volver al trabajador tan estúpido e ignorante como es posible que llegue a ser una criatura humana, de donde deriva la educación pública. Demuestran que el autor no era un doctrinario del dejar hacer, cosa que Viner ya había catalogado en 1927. No demuestran que Smith sea aliado de ninguna posición de hoy, y creerlo es el error simétrico de esta etapa.' },
  { q: '6. Explica qué es la contracita, por qué es la prueba de lectura de esta etapa, y aplícala en las dos direcciones.', guia: 'La contracita es la frase del mismo autor que apunta al lado contrario de aquello que uno quiere sostener. Es la prueba de lectura porque es la única de las cinco preguntas del test que no se puede contestar sin haber abierto el libro: la frase que le da la razón a uno circula sola, en carteles y en imágenes, y se puede repetir sin leer nada; la que se la quita hay que ir a buscarla. Aplicada en las dos direcciones se ve por qué el test es honrado. Al que llega con el carnicero del libro I capítulo 2 y celebra el interés propio se le pone al lado el capítulo 10, donde los del mismo oficio conspiran contra el público, y el capítulo 8, donde los patrones se coordinan tácitamente. Y al que llega con los impuestos del libro V capítulo 2 o con la escuela pública del capítulo 1 y cree haber ganado, se le pone el carnicero y el hallazgo genuino de que una ciudad puede comer sin que sus proveedores sean santos. El que no puede traer su propia contracita todavía no llegó al libro.' },
  { q: '7. El ensayo dice que somos la única especie que puede ganar una discusión mencionando a un muerto. Explica esa frase y qué tiene de bueno y de peligroso.', guia: 'Significa que las sociedades humanas grandes funcionan con relatos compartidos, y que una cita es un relato comprimido: en cinco palabras trae siglos de prestigio y ahorra la discusión entera. Ningún otro animal resuelve un conflicto invocando a alguien que ya no está y no puede desmentirlo. Lo bueno es evidente y no hay que despreciarlo: sin esa capacidad no habría derecho, ni ciencia acumulada, ni escuelas, porque todos tendríamos que verificar todo desde cero. Lo peligroso está en la compresión misma: una frase comprime tan bien que también comprime lo que le estorba, y como somos una especie ocupada, hemos organizado una división del trabajo por la cual unos pocos leen los libros y todos los demás repetimos las frases. En la mayoría de los casos eso funciona. En algunos casos concretos, como el de Smith, la frase repetida acaba diciendo lo contrario del libro, y entonces millones de personas discuten décadas sobre una idea que su supuesto autor no defendió.' },
  { q: '8. Stigler aparece en el cuento y en el ensayo como una incomodidad. Explica qué sostiene y por qué esta casa lo incluye en vez de dejarlo fuera.', guia: 'Stigler sostuvo en 1971, en «Smith\'s Travels on the Ship of State», que las excepciones intervencionistas de Smith no encajan del todo con su propio análisis del interés propio: si los comerciantes capturan el mercado, los funcionarios capturan el Estado, de modo que el Smith consistente sería el más severo y no el matizado. Lo importante es lo que no hace: no niega ningún pasaje ni dice que el libro V sea apócrifo. Discute la coherencia del autor, que es una discusión legítima y de otro nivel. La casa lo incluye porque la regla del acero, que esta ruta trajo del expediente gemelo, se aplica siempre y no solo cuando el resultado conviene, y en esta etapa conviene el resultado contrario, lo cual la pone a prueba de verdad. Y la respuesta que se da no es un grito: es leer la obra completa y notar que Smith publicó las dos cosas hasta el último año de su vida. Hay además un detalle que remata: Viner, que va en dirección contraria a Stigler, también venía de Chicago.' },
  { q: '9. Explica el error simétrico de esta etapa y por qué el cuento y el ensayo se cuidan de no cometerlo.', guia: 'El error simétrico es creer que descubrir que a un autor lo citan mal lo convierte en aliado de uno. Aparece justo después de aprender todo lo demás, y por eso es peligroso: uno acaba de encontrar los pasajes de los impuestos y de la escuela pública y siente que ha ganado la discusión de toda la vida. No la ha ganado. Que Smith admitiera impuestos y educación pública no lo vuelve partidario de nada de hoy, igual que la frase del carnicero no lo vuelve un panfleto. Los dos textos se cuidan de eso de maneras distintas y las dos son elegantes. El ensayo lo dice de frente en la escena de la objeción del público: un clásico leído entero casi nunca cabe en un bando, y por eso vale la pena leerlo. El cuento lo hace con el gesto final del narrador, que no borra los subrayados de su padre y añade los suyos: no cambia una lectura por otra, superpone dos, y reconoce que perdió casi todas sus sobremesas. La incomodidad que queda al final es la señal de que se leyó bien.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué esa etiqueta pertenece al temario de esta etapa más que a ninguna otra, y qué pasaría si se quitara.', guia: 'Porque esta etapa trata exactamente de eso: de qué pasa cuando una frase circula sin la dirección que permitiría comprobar quién la escribió. Un pastiche sin declarar es una atribución falsa, es decir el objeto mismo que la etapa enseña a cazar, y hacerlo aquí sería una burla en vez de un descuido. Enseñar a pedir libro y capítulo y firmar con la voz de Borges, de Cervantes o de Harari sin decirlo sería la contradicción más rápida posible, y la más justamente castigada. Hay además una razón de simetría interna: la etiqueta funciona igual que la regla que la sobrina manda escribir en el estante, la de que no se cita nada sin decir de qué libro y capítulo. Si se quitara pasarían dos cosas comprobables. La primera, que alguien atribuiría a esos autores frases que nunca escribieron, y la casa quedaría produciendo la fuente inflada que su propio compendio manda perseguir. La segunda, que la lección quedaría desmentida por el ejemplo, que es la manera más eficaz de no enseñar nada.' },
]);

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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_dorado_escoces_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena la ubicación, el párrafo, la contracita y la edición. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden, y el orden es el método. Primero se copia la frase tal como llegó, sin arreglarla, porque arreglarla ya es interpretarla. Segundo se busca la direccion: obra y año, y libro y capitulo si se puede. Con Smith las direcciones que hay que tener de memoria son cuatro: la mano invisible en el libro IV capitulo 2, donde aparece UNA sola vez en una obra de cinco libros; el carnicero en el libro I capitulo 2; los del mismo oficio y su conspiracion contra el publico en el libro I capitulo 10; y los patrones coordinados tacitamente para no subir salarios en el libro I capitulo 8, el mismo capitulo donde dice que ninguna sociedad puede ser floreciente y feliz si la mayor parte de sus miembros son pobres y miserables. Y si la frase no aparece en ninguna de las dos obras, eso tambien es un resultado, y de los buenos. Tercero se lee el parrafo entero y se cuenta de que estaba hablando el autor ahi, que casi nunca es lo que la frase suelta sugiere. Cuarto, y es la pregunta que hace todo el trabajo, se trae la contracita: la frase del mismo autor que apunta al lado contrario, con su direccion. Esa es la prueba de lectura, porque cualquiera encuentra la que le da la razon y solo quien leyo encuentra la que se la quita, y funciona igual contra el devoto y contra el detractor. Quinto se dice que edicion o traduccion se esta usando y si la cita es literal o parafraseada: la academica es la Glasgow Edition, que Oxford publica desde 1976, y esta casa declara sus parafrasis y da libro y capitulo en vez de fingir una pagina. Se cierra diciendo que se sigue de todo eso para la discusion que habia: que ya no se puede decir, que queda en pie y que habria que mirar ahora. Y encima de todo va el aviso que impide el error simetrico, que en esta etapa es el mas dulce: descubrir que a un autor lo citan mal no lo vuelve aliado de uno, y un clasico leido entero casi nunca cabe en un bando.";');

const textos = [
  [/🌡️ \*Ruta del Expediente Dorado · Etapa 4\* 🌡️\\n\\nLas dos facturas: ninguna cifra entra sin decir qué mide, de dónde sale y entre qué números anda\. 🌡️\\n\\n_Incluye evaluación conceptual, la cifra sobre la mesa, guion de video, tres lecturas y sus 35 preguntas\._ ✍️/g,
    '🪶 *Ruta del Expediente Dorado · Etapa 5* 🪶\\n\\nEl escocés dorado: la mano invisible aparece una vez, y no dice lo que todos creen. 🪶\\n\\n_Incluye evaluación conceptual, la cita sobre la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/Las dos facturas/g, 'El escocés dorado'],
  [/las dos facturas/g, 'el escocés dorado'],
  [/La cifra sobre la mesa/g, 'La cita sobre la mesa'],
  [/la cifra sobre la mesa/g, 'la cita sobre la mesa'],
  [/Etapa 4 de la Ruta del Expediente Dorado/g, 'Etapa 5 de la Ruta del Expediente Dorado'],
  [/Ruta del Expediente Dorado · Etapa 4 de 7/g, 'Ruta del Expediente Dorado · Etapa 5 de 7'],
  /* este vive en el encabezado de las dos pruebas imprimibles: no dice «de 7»
     sino «· Estudio Mayor», y es el que se le escapó al primer grep en
     misiones pasadas */
  [/Ruta del Expediente Dorado · Etapa 4 · Estudio Mayor/g, 'Ruta del Expediente Dorado · Etapa 5 · Estudio Mayor'],
  [/const msgs=\['¡Sigue llenando la hoja de la factura!','¡Muy buen trabajo!','¡Aprendiz de lectura de cifras!','¡Ya no escoges la punta del rango!','¡Pones la cifra de pie y dices quién paga!'\]/,
    "const msgs=['¡Sigue llenando la hoja de la cita!','¡Muy buen trabajo!','¡Aprendiz de lectura de clásicos!','¡Ya preguntas de qué libro es!','¡Traes la contracita, la que te estorba!']"],
  [/\['#115e59','#5eead4','#a8a29e','#c2410c','#00b894'\]/, "['#3f6212','#bef264','#a8a29e','#b45309','#00b894']"],
  /* el verde de encuadernación y el dorado quemado de la etapa */
  [/#115e59/g, '#3f6212'],
  [/#042f2e/g, '#1a2e05'],
  [/#f0fdfa/g, '#f7fee7'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/Entre 2,5 y 4 °C, con 3 °C como mejor estimación\./g, 'Aparece una sola vez, en el libro IV, capítulo 2.'],
  [/>Una horquilla bien dicha</g, '>La mano invisible, con su dirección<'],
  /* las preguntas fijas de la prueba competencial preguntaban por la cifra */
  [/¿Qué mide exactamente esta cifra, de qué fuente y de qué año sale, y cuál es su horquilla\? Nombra la auditoría que va al lado con su etiqueta, di si el titular tomó la punta o el centro, y separa lo que es dato de lo que es decisión, diciendo quién paga y en qué plazo\./g,
    '¿De qué obra y de qué año es esta frase, y de qué libro y capítulo? Cuenta qué dice el párrafo completo alrededor, trae la contracita del mismo autor con su dirección, di qué edición se usa y si la cita es literal o parafraseada, y explica qué se sigue de todo eso para lo que se estaba discutiendo.'],
  [/1\. ¿Cuál de los dos se puede comprobar y cuál solo se puede repetir\? 2\. ¿Por qué no enseñan lo mismo a quien los lee\?/g,
    '1. ¿Cuál de los dos se puede ir a comprobar en el libro y cuál solo se puede repetir? 2. ¿Por qué uno demuestra lectura y el otro no?'],
  /* el subtítulo del pliego de las tres lecturas */
  [/Un cuento, un capítulo de caballerías y un ensayo, sobre las mismas cifras/g,
    'Un cuento, un capítulo de caballerías y un ensayo, sobre la misma media frase'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'El hombre que midió la lluvia',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'Los subrayados de mi padre',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'Del pleito del báculo, y de lo que Sancho sentenció sobre las cuentas que dicen verdad y engañan',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'Del segundo escrutinio, y de un libro que se juzgó por una línea',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'La especie que aprendió a medirse',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'La especie que cita sin leer',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa anterior era el titular del uno por ciento. Aquí
   es la frase enmarcada: la cita tal cual, o la cita con su dirección. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(prueba){sfx(prueba?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(prueba){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🪶</span><span class="ms-text"><strong>Quedó anotada la cita con su dirección:</strong> «la expresión aparece <strong>una sola vez</strong> en «La riqueza de las naciones», de 1776, en el <strong>libro IV, capítulo 2</strong>, y ese párrafo habla de que el comerciante prefiere invertir en su propio país».</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">↔️</span><span class="ms-text"><strong>Y debajo, la contracita, que es la prueba de lectura:</strong> en el <strong>libro I, capítulo 10</strong>, el mismo autor escribe que los del mismo oficio raras veces se reúnen sin que la charla acabe en una conspiración contra el público. <strong>Y el freno, escrito antes de que dé gusto:</strong> esto no convierte a Smith en aliado de nadie; un clásico leído entero casi nunca cabe en un bando.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🖼️</span><span class="ms-text"><strong>Quedó la frase de bandera:</strong> «Adam Smith dijo que el mercado se arregla solo». Suena a erudición, cierra la sobremesa y nadie va a ir a comprobarla, que es justo para lo que se usó.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega en dos partes:</strong> se le atribuye al autor lo que dijo su fama, y de camino queda enseñado que en esta casa <strong>una cita se repite sin preguntar de qué libro es</strong>. Se tacha y se reescribe con la obra, el año, el libro y el capítulo, y con la frase suya que estorba.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='libros',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"libros\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/🌡️/g, '🪶');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
