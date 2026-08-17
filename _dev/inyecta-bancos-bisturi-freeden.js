/* Inyecta los bancos de la misión «El bisturí de Freeden» (Ruta de las Gafas
   a la Vista, etapa 2: Estudio de las Ideologías, materia 25 del Estudio
   Mayor) sobre el molde copiado de la etapa 1 de la misma ruta.
   Uso:  node _dev/inyecta-bancos-bisturi-freeden.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · W. B. Gallie, «Essentially Contested Concepts» (1956): CLÁSICO SÓLIDO
       DE LA FILOSOFÍA. De aquí la pieza que ordena la etapa: la disputa de
       ciertos conceptos no es un defecto, es su modo de existir.
     · Isaiah Berlin, «Dos conceptos de libertad» (1958): CLÁSICO SÓLIDO, y
       la FUENTE CANÓNICA del ejemplo central: libertad negativa (que nadie
       me estorbe) y libertad positiva (poder de verdad hacer).
     · Michael Freeden, «Ideologies and Political Theory» (1996): ACADÉMICO
       SÓLIDO, LA BASE DEL ANÁLISIS MORFOLÓGICO: núcleo, adyacentes,
       periféricos y descontestación.
     · Michael Freeden, «Ideology: A Very Short Introduction» (2003): LA
       RAMPA DE ENTRADA, corta y seria, DEL PROPIO DUEÑO DEL INSTRUMENTO.

   La idea que ordena todos los bancos: un ideario no es una lista de
   opiniones, es una morfología que se puede dibujar en una página. La vara
   de la etapa: decir qué concepto descontesta un ideario, cómo lo
   descontesta, y qué queda en el núcleo cuando se le quita el adorno.

   Dos cuidados del compendio gobiernan la misión entera. Uno: en este arco
   la regla del acero es la regla madre, así que si el núcleo dibujado no lo
   firmaría nadie de esa familia, lo dibujado es un muñeco y se rehace. Dos:
   el bisturí se gira hacia adentro, porque un detector que no se prueba en
   casa no es un instrumento, es un arma; de ahí la regla de pago. Y la
   regla de la casa que no se negocia: cero partidismo hondureño actual, el
   entrenamiento va con textos históricos o de fuera.                    */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-gafas-bisturi-freeden', 'js', 'bisturi-freeden.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260818;
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
  { w: 'Concepto esencialmente disputado', a: '🔓 De <strong>W. B. Gallie (1956)</strong>: concepto cuyo significado <strong>nunca queda cerrado</strong>. Libertad, igualdad, justicia, democracia. Etiqueta: clásico sólido de la filosofía.' },
  { w: 'La disputa como modo de existir', a: '💡 La pieza que ordena la etapa: que un concepto se discuta <strong>no es un defecto del idioma ni pereza de los diccionarios</strong>. Es su manera de ser lo que es. La disputa no se termina: se entiende.' },
  { w: 'Libertad negativa', a: '🚪 De <strong>Berlin (1958)</strong>: <strong>que nadie me estorbe</strong>. Se conserva estándose quieto: basta con que nadie intervenga. El vecino que no quiere topes está pidiendo esta.' },
  { w: 'Libertad positiva', a: '🪜 De <strong>Berlin (1958)</strong>: <strong>poder de verdad hacer</strong>. No se alcanza sin que alguien mueva algo. La vecina que pide topes para que sus hijos salgan está pidiendo esta.' },
  { w: '«Dos conceptos de libertad» (1958)', a: '✂️ La lección de <strong>Isaiah Berlin</strong> en Oxford que partió el ejemplo mayor en dos. Etiqueta: <strong>clásico sólido</strong>, y la fuente canónica del ejemplo central de este módulo.' },
  { w: 'Michael Freeden', a: '🔬 Quien convirtió a Gallie y a Berlin en instrumento: <strong>«Ideologies and Political Theory» (1996)</strong>, <strong>académico sólido</strong> y la base del análisis morfológico que esta etapa entrega.' },
  { w: '«Ideology: A Very Short Introduction» (2003)', a: '🚪 La <strong>rampa de entrada</strong>, corta y seria, escrita por el <strong>propio dueño del instrumento</strong>. Es por donde conviene empezar si el libro de 1996 se hace cuesta arriba.' },
  { w: 'Morfología', a: '🧬 Lo que es una ideología según Freeden: <strong>un arreglo de conceptos en tres capas</strong>. Con eso, un ideario deja de ser una lista de opiniones y se vuelve una estructura que se puede dibujar.' },
  { w: 'Núcleo', a: '🎯 Primera capa: <strong>lo que no se negocia sin dejar de ser esa ideología</strong>. La prueba: si se le quita, el ideario cambia de nombre, ya es otra cosa.' },
  { w: 'Conceptos adyacentes', a: '🛰️ Segunda capa: <strong>los que precisan el núcleo</strong> y le dan forma concreta. Se puede discutir cuál, pero alguno hace falta: el núcleo solo es demasiado vago para decidir nada.' },
  { w: 'Conceptos periféricos', a: '🎈 Tercera capa: <strong>lo que cambia con el lugar y con la década</strong>. Decorado de temporada. Casi todas las peleas ocurren aquí y se pelean como si fueran el núcleo.' },
  { w: 'Descontestación', a: '🔒 El movimiento clave: <strong>tomar un concepto disputado y fijarle un solo significado como si fuera el único posible</strong>, y después vender ese cierre <strong>como sentido común</strong>.' },
  { w: 'Cómo descontesta el liberalismo', a: '🚪 Toma <strong>«libertad»</strong> y la cierra: como <strong>no interferencia</strong> o como <strong>autonomía</strong>. Cierra en uno de los dos sentidos y deja de mencionar el otro, como si nunca hubiera existido.' },
  { w: 'Cómo descontesta el socialismo', a: '⚖️ Toma <strong>«igualdad»</strong> y la cierra: como <strong>algo más que la igualdad ante la ley</strong>, llevándola a las condiciones materiales. El cierre se presenta como lo obvio.' },
  { w: 'La práctica del módulo', a: '📐 <strong>Tres textos que no se parezcan</strong> (un plan de gobierno viejo, la declaración de principios de una iglesia o de una ONG, el «quiénes somos» de una empresa) y <strong>la morfología de cada uno dibujada en una página</strong>.' },
  { w: 'La vara de la etapa', a: '📏 Tomar cualquier ideario y decir tres cosas: <strong>qué concepto descontesta, cómo lo descontesta, y qué queda en el núcleo cuando se le quita el adorno</strong>. Ese gesto es el que las dos Críticas del arco corren a fondo.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Qué es un concepto esencialmente disputado, según Gallie (1956)?', o: ['a) Uno cuyo significado nunca queda cerrado', 'b) Uno que nadie sabe pronunciar', 'c) Uno que solo usan los filósofos', 'd) Uno que cambió de idioma'], c: 0 },
  { q: 'Que esos conceptos se discutan es…', o: ['a) Un defecto del idioma que hay que corregir', 'b) Su modo de existir, no un defecto', 'c) Culpa de los diccionarios', 'd) Señal de mala educación'], c: 1 },
  { q: 'La libertad negativa, según Berlin (1958), es…', o: ['a) Poder de verdad hacer', 'b) La libertad de los malos', 'c) Que nadie me estorbe', 'd) La libertad del Estado'], c: 2 },
  { q: 'La libertad positiva es…', o: ['a) Pensar bonito', 'b) Que nadie intervenga', 'c) La libertad de los ricos', 'd) Poder de verdad hacer'], c: 3 },
  { q: 'Para Freeden (1996), una ideología es…', o: ['a) Una morfología: un arreglo de conceptos en capas', 'b) Una lista de opiniones', 'c) Una mentira organizada', 'd) Un partido político'], c: 0 },
  { q: 'El núcleo de un ideario es…', o: ['a) Su primer punto, siempre', 'b) Lo que no se negocia sin dejar de ser esa ideología', 'c) Lo que más se repite', 'd) Lo que se cambia cada década'], c: 1 },
  { q: 'Los conceptos adyacentes son…', o: ['a) Los que nadie usa', 'b) Los del ideario vecino', 'c) Los que precisan el núcleo y le dan forma concreta', 'd) Los que se van a quitar'], c: 2 },
  { q: 'Los conceptos periféricos son…', o: ['a) Los más importantes', 'b) Los que están en el centro', 'c) Los que definen la familia', 'd) Los que cambian con el lugar y con la década'], c: 3 },
  { q: 'La descontestación consiste en…', o: ['a) Fijar un solo significado a un concepto disputado y venderlo como sentido común', 'b) Negarse a contestar una pregunta', 'c) Discutir sin argumentos', 'd) Traducir un concepto a otro idioma'], c: 0 },
  { q: 'El liberalismo descontesta sobre todo el concepto de…', o: ['a) Nación', 'b) Libertad', 'c) Tradición', 'd) Pueblo'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Núcleo', 'Periferia'],
    headA: '🎯 Núcleo: no se puede quitar',
    headB: '🎈 Periferia: cambia con la década',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Todo niño puede aprender si alguien se sienta con él', t: 'ok' },
      { w: 'Los colores y el logo de la aplicación', t: 'no' },
      { w: 'El estudio es gratuito para quien lo use', t: 'ok' },
      { w: 'Que las misiones se abran en el teléfono', t: 'no' },
      { w: 'La familia decide su propio temario', t: 'ok' },
      { w: 'El nombre del botón de la sección', t: 'no' },
      { w: 'Ninguna fuente entra sin su etiqueta', t: 'ok' },
      { w: 'Cuántas tarjetas trae cada flashcard', t: 'no' },
    ],
  },
  {
    label: ['Concepto disputado', 'Término descriptivo'],
    headA: '🔓 Disputado: no se deja cerrar',
    headB: '📏 Descriptivo: se comprueba',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Libertad', t: 'ok' },
      { w: 'Kilómetro', t: 'no' },
      { w: 'Justicia', t: 'ok' },
      { w: 'Temperatura de ebullición', t: 'no' },
      { w: 'Igualdad', t: 'ok' },
      { w: 'Número de páginas', t: 'no' },
      { w: 'Mérito', t: 'ok' },
      { w: 'Fecha de publicación', t: 'no' },
    ],
  },
  {
    label: ['Libertad negativa', 'Libertad positiva'],
    headA: '🚪 Negativa: que nadie me estorbe',
    headB: '🪜 Positiva: poder de verdad hacer',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Que nadie me diga qué hacer en mi terreno»', t: 'ok' },
      { w: '«Que haya una beca para poder estudiar»', t: 'no' },
      { w: '«Que el concejo no me ponga tributo»', t: 'ok' },
      { w: '«Que pongan topes para que salgan los niños»', t: 'no' },
      { w: '«Que nadie revise lo que publico»', t: 'ok' },
      { w: '«Que exista transporte para llegar al trabajo»', t: 'no' },
      { w: '«Que me dejen en paz con mi negocio»', t: 'ok' },
      { w: '«Que haya agua en el pozo del que no tiene»', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Viene después o vive en otra materia'],
    headA: '🔬 Se estudia en esta etapa',
    headB: '🏠 Viene después o es de otra materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El concepto disputado de Gallie', t: 'ok' },
      { w: 'El origen de la palabra en 1796', t: 'no' },
      { w: 'Las dos libertades de Berlin', t: 'ok' },
      { w: 'El mapa de las familias, una por una', t: 'no' },
      { w: 'La morfología en tres capas', t: 'ok' },
      { w: 'El eje izquierda-derecha y sus límites', t: 'no' },
      { w: 'La descontestación como movimiento', t: 'ok' },
      { w: 'El eufemismo y el cliché terminador', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['Hay', 'conceptos', 'esencialmente', 'disputados.'], c: 2, art: 'Cómo son esos conceptos, según Gallie' },
  { s: ['La', 'libertad', 'negativa', 'pide', 'que', 'nadie', 'estorbe.'], c: 2, art: 'Cuál de las dos libertades es' },
  { s: ['La', 'libertad', 'positiva', 'es', 'poder', 'hacer.'], c: 2, art: 'La otra libertad de Berlin' },
  { s: ['Un', 'ideario', 'es', 'una', 'morfología', 'de', 'conceptos.'], c: 4, art: 'Lo que un ideario es, según Freeden' },
  { s: ['El', 'núcleo', 'no', 'se', 'negocia.'], c: 1, art: 'La capa que no se puede quitar' },
  { s: ['Los', 'adyacentes', 'precisan', 'el', 'núcleo.'], c: 1, art: 'La capa que da forma concreta' },
  { s: ['La', 'periferia', 'cambia', 'con', 'la', 'década.'], c: 1, art: 'La capa del decorado de temporada' },
  { s: ['Toda', 'ideología', 'practica', 'la', 'descontestación.'], c: 4, art: 'El movimiento que cierra un concepto abierto' },
]);

/* ---------- completa la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'Gallie mostró en 1956 que hay conceptos esencialmente ___.', opts: ['disputados', 'inventados', 'prohibidos'], c: 0 },
  { s: 'Que se discutan no es un defecto: es su modo de ___.', opts: ['fallar', 'existir', 'crecer'], c: 1 },
  { s: 'La libertad negativa pide que nadie me ___.', opts: ['ayude', 'escuche', 'estorbe'], c: 2 },
  { s: 'La libertad positiva es poder de verdad ___.', opts: ['hacer', 'callar', 'esperar'], c: 0 },
  { s: 'Para Freeden, un ideario es una ___ de conceptos.', opts: ['lista', 'morfología', 'suma'], c: 1 },
  { s: 'La capa que no se puede quitar es el ___.', opts: ['adorno', 'borde', 'núcleo'], c: 2 },
  { s: 'Lo que cambia con la década es la ___.', opts: ['periferia', 'raíz', 'ley'], c: 0 },
  { s: 'Fijarle un solo sentido a un concepto disputado se llama ___.', opts: ['traducción', 'descontestación', 'definición'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Núcleo', 'Periferia'],
    btnA: '🎯 Núcleo', btnB: '🎈 Periferia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Todo niño puede aprender', t: 'ok' },
      { w: 'El logo y los colores', t: 'no' },
      { w: 'El estudio es gratuito', t: 'ok' },
      { w: 'El nombre de un botón', t: 'no' },
      { w: 'La familia decide su temario', t: 'ok' },
      { w: 'Que corra en el teléfono', t: 'no' },
      { w: 'Toda fuente con su etiqueta', t: 'ok' },
      { w: 'El emoji de la misión', t: 'no' },
      { w: 'Nadie se queda fuera por dinero', t: 'ok' },
      { w: 'Cuántas flashcards trae', t: 'no' },
    ],
  },
  {
    label: ['Negativa', 'Positiva'],
    btnA: '🚪 Negativa', btnB: '🪜 Positiva',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Que nadie me estorbe»', t: 'ok' },
      { w: '«Que pueda de verdad hacerlo»', t: 'no' },
      { w: '«Sin tributo del concejo»', t: 'ok' },
      { w: '«Con una beca para estudiar»', t: 'no' },
      { w: '«Que no revisen lo que publico»', t: 'ok' },
      { w: '«Que haya transporte al trabajo»', t: 'no' },
      { w: '«Déjenme en paz con mi negocio»', t: 'ok' },
      { w: '«Que el pozo dé agua a todos»', t: 'no' },
      { w: '«Nadie entra a mi dehesa»', t: 'ok' },
      { w: '«Topes para que salgan los niños»', t: 'no' },
    ],
  },
  {
    label: ['Disputado', 'Descriptivo'],
    btnA: '🔓 Disputado', btnB: '📏 Descriptivo',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Libertad', t: 'ok' },
      { w: 'Kilómetro', t: 'no' },
      { w: 'Justicia', t: 'ok' },
      { w: 'Número de páginas', t: 'no' },
      { w: 'Igualdad', t: 'ok' },
      { w: 'Fecha de publicación', t: 'no' },
      { w: 'Mérito', t: 'ok' },
      { w: 'Peso en kilos', t: 'no' },
      { w: 'Democracia', t: 'ok' },
      { w: 'Hora de salida', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se disecciona un ideario, paso a paso',
    steps: [
      'Leer el texto entero sin marcar nada, para no discutir todavía',
      'Subrayar los conceptos disputados que aparecen',
      'Ver cómo el texto cierra cada uno, y con qué palabras',
      'Buscar el núcleo: lo que no se puede quitar sin que deje de ser eso',
      'Colgar del núcleo los adyacentes, y afuera la periferia',
      'Dibujarlo en una página, y recién entonces opinar',
    ],
  },
  {
    label: 'La prueba de los tres segundos',
    steps: [
      'Encontrar la frase que suena obvia y que nadie discute',
      'Localizar en ella el concepto disputado',
      'Cambiarlo por su otro significado, sin tocar nada más',
      'Leer la frase otra vez, en voz alta',
      'Si cambió de bando o se volvió absurda, había un cierre escondido',
      'Anotar cuál era el cierre, con las palabras del texto',
    ],
  },
  {
    label: 'Cómo se dibuja la morfología propia (la regla de pago)',
    steps: [
      'Escribir la frase que en esta casa no se negocia',
      'Probar a quitarla: si la casa sigue siendo la misma, no era núcleo',
      'Nombrar los tres o cuatro conceptos que la precisan',
      'Poner afuera lo que podría cambiar el año que viene',
      'Marcar el adyacente que nunca se había declarado',
      'Y escribirle su renglón de qué evidencia lo haría cambiar',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Mostró en 1956 que hay conceptos cuyo significado no se cierra nunca', ans: 'W. B. Gallie', opts: ['W. B. Gallie', 'Isaiah Berlin', 'Michael Freeden', 'Clifford Geertz'] },
  { desc: 'Partió el ejemplo mayor en dos, en Oxford, en 1958', ans: 'Isaiah Berlin', opts: ['Isaiah Berlin', 'W. B. Gallie', 'Michael Freeden', 'Karl Mannheim'] },
  { desc: 'Convirtió todo eso en instrumento en 1996', ans: 'Michael Freeden', opts: ['Michael Freeden', 'Isaiah Berlin', 'W. B. Gallie', 'Antoine Destutt de Tracy'] },
  { desc: 'Que nadie me estorbe', ans: 'La libertad negativa', opts: ['La libertad negativa', 'La libertad positiva', 'La descontestación', 'El núcleo'] },
  { desc: 'Poder de verdad hacer', ans: 'La libertad positiva', opts: ['La libertad positiva', 'La libertad negativa', 'La periferia', 'El concepto adyacente'] },
  { desc: 'Lo que no se puede quitar sin que el ideario deje de ser el que es', ans: 'El núcleo', opts: ['El núcleo', 'El adyacente', 'El periférico', 'El decorado'] },
  { desc: 'Lo que cambia con el lugar y con la década', ans: 'Los conceptos periféricos', opts: ['Los conceptos periféricos', 'El núcleo', 'Los adyacentes', 'La morfología'] },
  { desc: 'Fijarle un solo significado a un concepto abierto y venderlo como obvio', ans: 'La descontestación', opts: ['La descontestación', 'La definición de diccionario', 'La traducción', 'La disputa esencial'] },
]);

/* ---------- ¿en qué capa va esa frase? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«Todo niño puede aprender si alguien se sienta con él»', func: 'Núcleo: quítalo y ya no es este proyecto', opts: ['Núcleo: quítalo y ya no es este proyecto', 'Periferia: cambia con la década', 'Adyacente: precisa el núcleo', 'Concepto descriptivo'] },
  { trans: '«El estudio se entrega en la lengua materna del niño»', func: 'Adyacente: precisa el núcleo y le da forma concreta', opts: ['Adyacente: precisa el núcleo y le da forma concreta', 'Núcleo del ideario', 'Periferia de temporada', 'Descontestación'] },
  { trans: '«Las misiones llevan tarjetas de colores y sonidos»', func: 'Periferia: se puede cambiar sin que nadie deje de ser lo que era', opts: ['Periferia: se puede cambiar sin que nadie deje de ser lo que era', 'Núcleo intocable', 'Adyacente necesario', 'Concepto disputado'] },
  { trans: '«Creemos en la libertad, sin más»', func: 'Descontestación sin declarar: cierra un concepto abierto y no dice cómo', opts: ['Descontestación sin declarar: cierra un concepto abierto y no dice cómo', 'Núcleo bien enunciado', 'Periferia declarada', 'Término descriptivo'] },
  { trans: '«La ficha tiene diez páginas tamaño carta»', func: 'Término descriptivo: se comprueba midiendo, no se disputa', opts: ['Término descriptivo: se comprueba midiendo, no se disputa', 'Concepto esencialmente disputado', 'Núcleo del ideario', 'Adyacente del núcleo'] },
]);

/* ---------- diagnóstico: ¿por dónde falla la disección? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Una disección lista diez frases del ideario, todas al mismo nivel', characteristic: 'No es una morfología: es una lista de opiniones, y así no se puede comparar con ninguna otra', opts: ['No es una morfología: es una lista de opiniones, y así no se puede comparar con ninguna otra', 'Está bien: diez frases son suficientes', 'El error es que sean diez y no doce', 'Falta ordenarlas por orden alfabético'] },
  { disease: 'El dibujo pone como núcleo el primer punto del documento', characteristic: 'El núcleo casi nunca es el punto 1: se busca con la prueba de quitarlo, no por el orden en que está impreso', opts: ['El núcleo casi nunca es el punto 1: se busca con la prueba de quitarlo, no por el orden en que está impreso', 'Está bien: el primero siempre es el principal', 'El error es no haber leído el último punto', 'Faltaba numerar los puntos'] },
  { disease: 'Un texto dice «defendemos la libertad» y la disección lo da por claro', characteristic: 'Quedó sin ver la descontestación: no dice cuál de las dos libertades, y ahí estaba lo que el texto afirmaba', opts: ['Quedó sin ver la descontestación: no dice cuál de las dos libertades, y ahí estaba lo que el texto afirmaba', 'Está claro: libertad es libertad', 'El error es citar a Berlin', 'Faltaba el año del texto'] },
  { disease: 'El núcleo dibujado de una familia política es un defecto que nadie confesaría', characteristic: 'Se dibujó un muñeco: nadie pone un defecto en el núcleo de su propio ideario, así que la hoja se rehace en su mejor versión', opts: ['Se dibujó un muñeco: nadie pone un defecto en el núcleo de su propio ideario, así que la hoja se rehace en su mejor versión', 'Está bien: así se ve claro el problema', 'El error es dibujar a esa familia', 'Faltaba poner más adyacentes'] },
  { disease: 'La pelea de la reunión duró dos horas sobre el nombre de un programa', characteristic: 'Discusión de periferia peleada como si fuera núcleo: es el error más frecuente y el más caro en horas', opts: ['Discusión de periferia peleada como si fuera núcleo: es el error más frecuente y el más caro en horas', 'Los nombres son lo más importante', 'El error fue no votar antes', 'Faltaba un moderador'] },
  { disease: 'La casa lleva tres idearios ajenos diseccionados y ninguno propio', characteristic: 'La regla de pago sin pagar: un bisturí que solo corta hacia afuera no es instrumento, es arma', opts: ['La regla de pago sin pagar: un bisturí que solo corta hacia afuera no es instrumento, es arma', 'Con tres ajenos ya está cumplido', 'Los idearios propios no tienen morfología', 'Faltaba un cuarto ideario ajeno'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Su significado no queda cerrado nunca.', type: 'Concepto esencialmente disputado (Gallie, 1956)' },
  { s: 'Que nadie me estorbe.', type: 'Libertad negativa (Berlin, 1958)' },
  { s: 'Poder de verdad hacer.', type: 'Libertad positiva (Berlin, 1958)' },
  { s: 'Un arreglo de conceptos en tres capas.', type: 'La morfología (Freeden, 1996)' },
  { s: 'Lo que no se puede quitar sin que deje de ser eso.', type: 'El núcleo' },
  { s: 'Los conceptos que precisan el núcleo.', type: 'Los adyacentes' },
  { s: 'Lo que cambia con el lugar y con la década.', type: 'Los periféricos' },
  { s: 'Fijarle un solo sentido y venderlo como obvio.', type: 'La descontestación' },
  { s: 'Tres textos que no se parezcan, uno por página.', type: 'La práctica del módulo' },
  { s: 'Si el núcleo no lo firmaría nadie de esa familia.', type: 'Se dibujó un muñeco: se rehace' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'W. B. Gallie', gen: 'Fuente', n: 'Los conceptos esencialmente disputados', g: '«Essentially Contested Concepts», 1956', t: 'Clásico sólido de la filosofía' },
  { w: 'Isaiah Berlin', gen: 'Fuente', n: 'Las dos libertades', g: '«Dos conceptos de libertad», 1958', t: 'Clásico sólido, fuente canónica del ejemplo' },
  { w: 'Michael Freeden (1996)', gen: 'Fuente', n: 'La morfología y la descontestación', g: '«Ideologies and Political Theory»', t: 'Académico sólido, base del análisis' },
  { w: 'Freeden (2003)', gen: 'Fuente', n: 'La rampa de entrada, corta y seria', g: '«Ideology: A Very Short Introduction»', t: 'Del propio dueño del instrumento' },
  { w: 'Libertad negativa', gen: 'Concepto', n: 'Que nadie me estorbe', g: 'Se guarda estándose quieto', t: 'Una de las dos mitades de Berlin' },
  { w: 'Libertad positiva', gen: 'Concepto', n: 'Poder de verdad hacer', g: 'No se alcanza sin que alguien mueva algo', t: 'La otra mitad de Berlin' },
  { w: 'Núcleo', gen: 'Capa', n: 'Lo que no se negocia', g: 'Prueba: quítalo y mira si sigue siendo eso', t: 'Primera capa de la morfología' },
  { w: 'Adyacentes', gen: 'Capa', n: 'Lo que precisa el núcleo', g: 'Se discute cuál, pero alguno hace falta', t: 'Segunda capa' },
  { w: 'Periféricos', gen: 'Capa', n: 'Decorado de temporada', g: 'Cambia con el lugar y la década', t: 'Tercera capa' },
  { w: 'Descontestación', gen: 'Movimiento', n: 'El cierre vendido como sentido común', g: 'Lo hace toda ideología', t: 'La señal que hay que aprender a ver' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'Hay conceptos esencialmente ___.', opts: ['disputados', 'olvidados', 'traducidos'], ans: 'disputados' },
  { s: 'La disputa es su modo de ___.', opts: ['existir', 'fallar', 'terminar'], ans: 'existir' },
  { s: 'La libertad negativa pide que nadie me ___.', opts: ['estorbe', 'ayude', 'mire'], ans: 'estorbe' },
  { s: 'La libertad positiva es poder de verdad ___.', opts: ['hacer', 'callar', 'pedir'], ans: 'hacer' },
  { s: 'Un ideario es una ___ de conceptos.', opts: ['morfología', 'lista', 'pila'], ans: 'morfología' },
  { s: 'La capa intocable es el ___.', opts: ['núcleo', 'borde', 'adorno'], ans: 'núcleo' },
  { s: 'El decorado de temporada es la ___.', opts: ['periferia', 'raíz', 'base'], ans: 'periferia' },
  { s: 'Cerrar un concepto abierto y venderlo como obvio es la ___.', opts: ['descontestación', 'definición', 'aclaración'], ans: 'descontestación' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Qué es un concepto esencialmente disputado y por qué su disputa no es un defecto? Explícalo con el caso de los dos vecinos y la calle.', ans: 'Es un concepto cuyo significado no queda cerrado nunca, como libertad, igualdad, justicia o democracia; lo nombró W. B. Gallie en 1956. Su disputa no es un defecto del idioma ni pereza de los diccionarios: es su modo de existir, porque el concepto solo funciona mientras admite versiones rivales que compiten por él. El caso de la calle lo enseña sin teoría: dos vecinos firmaron la misma carta pidiendo libertad, uno quería topes para que sus hijos pudieran salir y el otro quería que nadie le dijera a qué velocidad manejar. Ninguno mintió y ninguno se equivocó de palabra: los dos usaron la palabra correcta, y la palabra admitía las dos cosas. Por eso el remedio no es definir mejor de una vez para siempre, sino preguntar en cuál de sus sentidos la está usando cada uno.' },
  { q: 'Explica las dos libertades de Berlin (1958) y por qué media pelea política del siglo cabe en cuál de las dos se nombra.', ans: 'Libertad negativa es que nadie me estorbe: se conserva si nadie interviene, y por eso se protege con límites al poder. Libertad positiva es poder de verdad hacer: no se alcanza sin que alguien mueva algo, y por eso se persigue con recursos, instituciones o reglas. Berlin las separó en su lección de Oxford de 1958, y la separación explica discusiones enteras que parecían de mala fe: cuando un lado dice que el otro está contra la libertad, casi siempre está diciendo que está contra la suya. La pelea del siglo veinte entre bloques se lee así: los dos decían defender la libertad, cada uno hablaba de una de las dos mitades, y cada uno acusaba al otro de no tener ninguna. Nombrar cuál de las dos se está pidiendo no acaba el desacuerdo, pero lo vuelve un desacuerdo real y por tanto negociable.' },
  { q: '¿Qué son el núcleo, los adyacentes y los periféricos, y cómo se distinguen en la práctica?', ans: 'Son las tres capas de la morfología de Freeden (1996). El núcleo es lo que no se negocia sin dejar de ser esa ideología, y se encuentra con una prueba, no leyendo el orden del documento: se le quita, y si el ideario sigue siendo el mismo, no era núcleo. Los adyacentes son los conceptos que precisan el núcleo y le dan forma concreta; se puede discutir cuál se elige, pero alguno hace falta, porque un núcleo solo es demasiado vago para decidir nada. Los periféricos son lo que cambia con el lugar y con la década, el decorado de temporada, y se pueden cambiar sin que nadie deje de ser lo que era. La utilidad práctica es inmediata: casi todas las peleas ocurren en la periferia y se pelean como si fueran el núcleo, y al mismo tiempo el núcleo suele negociarse sin que nadie note que se está tocando.' },
  { q: '¿Qué es la descontestación y cómo se detecta en un texto real?', ans: 'Es el movimiento que hace toda ideología: tomar un concepto disputado, fijarle un solo significado como si fuera el único posible, y vender ese cierre como sentido común. El liberalismo lo hace con libertad, cerrándola como no interferencia o como autonomía; el socialismo lo hace con igualdad, llevándola más allá de la igualdad ante la ley. Se detecta con dos señales y una prueba. Señal uno: el texto usa el concepto sin decir en qué sentido. Señal dos: da por hecho que su sentido es el obvio, y no menciona que hubo alternativa. La prueba de los tres segundos: se pone el otro significado en la misma frase, sin tocar nada más. Si la frase se vuelve absurda o cambia de bando, había un cierre escondido, y ese cierre era la afirmación de verdad del texto.' },
  { q: '¿Por qué el entrenamiento de esta etapa usa textos históricos o de fuera, y no documentos políticos de hoy?', ans: 'Por una regla de la casa que no se negocia: cero partidismo hondureño actual, y a ningún político vivo del país se le reparte etiqueta. La razón no es cobardía sino calibración. Un documento que todavía puede ganar o perder una elección se disecciona con el pulso torcido, porque el que corta ya sabe qué quiere encontrar y la familia entera lo lee como un golpe. Un plan de gobierno de hace décadas, la declaración de principios de una organización o el «quiénes somos» de una empresa cualquiera se dejan diseccionar sin que nadie se sienta atacado, y por tanto enseñan el instrumento en vez de servir de arma. Y hay un beneficio extra: quien aprende con textos viejos llega entrenado al texto de hoy, y entonces el análisis vale, porque el instrumento no nació torcido.' },
  { q: '¿Por qué la etapa obliga a dibujar la morfología propia, y qué señal indica que un dibujo ajeno salió mal?', ans: 'Porque un bisturí que solo corta hacia afuera no es instrumento, es arma: diseccionar el ideario del bando contrario lo hace cualquiera, y auditar el propio no lo hace casi nadie. La regla de pago lo vuelve procedimiento: un desenmascaramiento propio por cada uno ajeno, y el pago se hace con el ideario más parecido al propio, no con el más lejano, porque ahí es donde de verdad cuesta. La señal de que un dibujo ajeno salió mal es clara y se comprueba en un segundo: si el núcleo que dibujaste es un defecto que nadie de esa familia confesaría, dibujaste un muñeco, porque nadie pone un defecto en el centro de su propio ideario. Entonces la hoja se rehace con la mejor versión, como manda la regla del acero, que en este arco es la regla madre; y la crítica que venga después será más difícil y mucho más seria.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['NUCLEO', 'ADYACENTE', 'PERIFERIA', 'CAPAS', 'IDEARIO', 'DIBUJO']),
  haceSopa(10, ['GALLIE', 'BERLIN', 'FREEDEN', 'OXFORD', 'DISPUTA', 'CIERRE']),
  haceSopa(10, ['LIBERTAD', 'IGUALDAD', 'JUSTICIA', 'MERITO', 'VALORES', 'LEMA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'Un concepto esencialmente disputado es uno cuyo significado no queda cerrado nunca.', a: true },
  { q: 'Según Gallie, la disputa de esos conceptos es un defecto del idioma que hay que corregir.', a: false },
  { q: 'Gallie publicó «Essentially Contested Concepts» en 1956.', a: true },
  { q: 'Berlin partió el concepto de libertad en dos en su lección de 1958.', a: true },
  { q: 'La libertad negativa consiste en poder de verdad hacer.', a: false },
  { q: 'La libertad positiva no se alcanza sin que alguien mueva algo.', a: true },
  { q: 'Para Freeden, una ideología es una lista de opiniones sin estructura.', a: false },
  { q: 'El núcleo es lo que no se negocia sin dejar de ser esa ideología.', a: true },
  { q: 'Los conceptos adyacentes son los que precisan el núcleo.', a: true },
  { q: 'Los conceptos periféricos son los que nunca cambian.', a: false },
  { q: 'La descontestación consiste en fijar un solo significado a un concepto disputado.', a: true },
  { q: 'Una descontestación se presenta normalmente como sentido común.', a: true },
  { q: '«Ideology: A Very Short Introduction» (2003) es de un autor distinto de Freeden.', a: false },
  { q: 'La práctica del módulo pide diseccionar tres textos que no se parezcan entre sí.', a: true },
  { q: 'El entrenamiento de esta etapa usa documentos de políticos hondureños vivos.', a: false },
]);
B.evalMCBank = JSON.stringify([
  { q: 'Un concepto esencialmente disputado es…', o: ['a) Uno cuyo significado no queda cerrado nunca', 'b) Uno que cambió de idioma', 'c) Uno que solo usan los abogados', 'd) Uno mal traducido'], a: 0 },
  { q: 'Quien nombró esos conceptos, en 1956, fue…', o: ['a) Isaiah Berlin', 'b) W. B. Gallie', 'c) Michael Freeden', 'd) Karl Mannheim'], a: 1 },
  { q: 'Que se discutan es, según él…', o: ['a) Un error de los diccionarios', 'b) Una moda pasajera', 'c) Su modo de existir', 'd) Culpa de la política'], a: 2 },
  { q: 'La lección «Dos conceptos de libertad» es de…', o: ['a) Freeden, en 1996', 'b) Gallie, en 1956', 'c) Geertz, en 1964', 'd) Berlin, en 1958'], a: 3 },
  { q: 'La libertad negativa es…', o: ['a) Que nadie me estorbe', 'b) Poder de verdad hacer', 'c) La libertad del Estado', 'd) Una libertad de segunda'], a: 0 },
  { q: 'La libertad positiva es…', o: ['a) Que nadie intervenga', 'b) Poder de verdad hacer', 'c) Hacer lo que uno quiera', 'd) Obedecer sin queja'], a: 1 },
  { q: '«Ideologies and Political Theory» (1996) aporta…', o: ['a) La historia del término ideología', 'b) La ideología como mapa', 'c) El análisis morfológico: núcleo, adyacentes y periféricos', 'd) La crítica de la falsa conciencia'], a: 2 },
  { q: 'El núcleo de un ideario se encuentra…', o: ['a) En el primer punto del documento', 'b) En el punto más largo', 'c) En el que más se repite', 'd) Con la prueba de quitarlo y ver si sigue siendo eso'], a: 3 },
  { q: 'Los conceptos adyacentes…', o: ['a) Precisan el núcleo y le dan forma concreta', 'b) Son adorno de temporada', 'c) Pertenecen al ideario vecino', 'd) Se pueden quitar sin consecuencia'], a: 0 },
  { q: 'Los conceptos periféricos…', o: ['a) Definen la familia ideológica', 'b) Cambian con el lugar y con la década', 'c) Son los más disputados', 'd) No existen en los idearios serios'], a: 1 },
  { q: 'La descontestación es…', o: ['a) Negarse a debatir', 'b) Traducir un concepto', 'c) Fijarle un solo significado a un concepto disputado y venderlo como obvio', 'd) Definir bien una palabra'], a: 2 },
  { q: 'El socialismo descontesta sobre todo el concepto de…', o: ['a) Nación', 'b) Tradición', 'c) Autoridad', 'd) Igualdad'], a: 3 },
  { q: 'La rampa de entrada corta y seria al instrumento es…', o: ['a) «Ideology: A Very Short Introduction» (2003), del propio Freeden', 'b) «Dos conceptos de libertad» (1958)', 'c) «Essentially Contested Concepts» (1956)', 'd) «La interpretación de las culturas» (1973)'], a: 0 },
  { q: 'La práctica del módulo consiste en…', o: ['a) Memorizar las tres capas', 'b) Diseccionar tres textos que no se parezcan y dibujar cada morfología en una página', 'c) Debatir con un compañero', 'd) Leer los dos libros de Freeden enteros'], a: 1 },
  { q: 'Si el núcleo que dibujaste de una familia es un defecto que nadie confesaría…', o: ['a) El dibujo está bien: así se ve el problema', 'b) Hay que añadir más periferia', 'c) Dibujaste un muñeco y la hoja se rehace en su mejor versión', 'd) Hay que cambiar de familia'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'Los conceptos cuyo significado no se cierra nunca son esencialmente ___.', a: 'disputados' },
  { q: 'Quien los nombró en 1956 fue W. B. ___.', a: 'Gallie' },
  { q: 'Su disputa no es un defecto: es su modo de ___.', a: 'existir' },
  { q: 'Partió la libertad en dos, en 1958, Isaiah ___.', a: 'Berlin' },
  { q: 'La libertad ___ pide que nadie me estorbe.', a: 'negativa' },
  { q: 'La libertad ___ es poder de verdad hacer.', a: 'positiva' },
  { q: 'El autor de «Ideologies and Political Theory» (1996) es Michael ___.', a: 'Freeden' },
  { q: 'Para él, un ideario es una ___ de conceptos.', a: 'morfología' },
  { q: 'La capa que no se negocia se llama ___.', a: 'núcleo' },
  { q: 'Los conceptos que precisan el núcleo son los ___.', a: 'adyacentes' },
  { q: 'Los que cambian con la década son los ___.', a: 'periféricos' },
  { q: 'Fijar un solo sentido a un concepto abierto es la ___.', a: 'descontestación' },
  { q: 'La rampa de entrada corta y seria de Freeden es de ___.', a: '2003' },
  { q: 'La práctica pide diseccionar ___ textos que no se parezcan.', a: 'tres' },
  { q: 'Si el núcleo dibujado no lo firmaría nadie de esa familia, dibujaste un ___.', a: 'muñeco' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'W. B. Gallie', def: 'Nombró los conceptos esencialmente disputados, en 1956' },
  { term: 'Isaiah Berlin', def: 'Partió la libertad en dos, en Oxford, en 1958' },
  { term: 'Michael Freeden', def: 'Convirtió todo eso en instrumento, en 1996' },
  { term: 'Libertad negativa', def: 'Que nadie me estorbe' },
  { term: 'Libertad positiva', def: 'Poder de verdad hacer' },
  { term: 'Morfología', def: 'Un arreglo de conceptos en tres capas' },
  { term: 'Núcleo', def: 'Lo que no se negocia sin dejar de ser esa ideología' },
  { term: 'Adyacentes', def: 'Los conceptos que precisan el núcleo' },
  { term: 'Periféricos', def: 'Lo que cambia con el lugar y con la década' },
  { term: 'Descontestación', def: 'Fijar un solo sentido y venderlo como sentido común' },
  { term: 'Freeden (2003)', def: 'La rampa de entrada, del propio dueño del instrumento' },
  { term: 'La práctica del módulo', def: 'Tres textos que no se parezcan, una página cada uno' },
  { term: 'La prueba de los tres segundos', def: 'Poner el otro significado en la misma frase' },
  { term: 'El muñeco', def: 'Un núcleo dibujado que nadie de esa familia firmaría' },
  { term: 'La regla de pago', def: 'Un desenmascaramiento propio por cada uno ajeno' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'La primera versión de la página de «quiénes somos» de M.E.T.A.S dice: «creemos en la libertad y en la igualdad de oportunidades». Suena bien, nadie la va a discutir, y no dice qué significa ninguna de las dos.' },
  { txt: 'Una red educativa internacional ofrece L 75,000 anuales si M.E.T.A.S firma su declaración de principios de diez puntos. La casa está de acuerdo con ocho, y al diseccionar el documento aparece que el núcleo está en el punto 6, no en el 1.' },
  { txt: 'A Jael le toca la práctica del módulo con un plan de gobierno de hace décadas sacado de un archivo. La mitad del documento resulta ser periferia de su década, y el núcleo cabe en dos frases.' },
  { txt: 'El colegio del barrio tiene impreso en la entrada su lema: «formamos líderes con valores». Angelly pregunta qué significa, y el lema no dice ni qué es un líder ni de quién son los valores.' },
  { txt: 'Una empresa local ofrece L 12,000 por una charla de M.E.T.A.S a sus empleados. Su página dice que creen «en el mérito y en la libertad de emprender», y al dibujarla resulta ser casi la misma morfología que la de esta casa.' },
  { txt: 'Angelly pregunta, de regreso del acto: «si los dos dicen que quieren justicia, ¿por qué se pelean?». No hay oferta ni lempiras: hay una niña con la pregunta que Gallie contestó en 1956.' },
  { txt: 'Jael dibuja la morfología de la familia política que peor le cae, y en el primer intento le pone como núcleo un defecto que ningún militante de esa familia confesaría.' },
  { txt: 'Dibujando la morfología de M.E.T.A.S, el autor descubre que «mérito» está funcionando como adyacente del núcleo y que nunca lo había declarado, aunque de ahí salían decisiones.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué concepto disputado aparece en el caso, y cómo lo descontesta el texto? Cita la frase exacta donde se cierra.',
  '2. Dibuja la morfología en tres capas: qué queda en el núcleo, qué es adyacente y qué es periferia de temporada.',
  '3. ¿Qué fuente, fecha o cifra del caso necesita su etiqueta de estatus antes de usarse, y cuál le toca?',
  '4. ¿Qué condición escrita deja la casa, y qué morfología propia se parece a esta lo bastante para que haya que dibujarla también?',
]);
B.critCaseGuides = JSON.stringify([
  'Se empieza por el concepto disputado, porque es el que sostiene todo lo demás: libertad, igualdad, mérito, justicia, valores, líder. Y se cita la frase exacta donde el texto lo cierra, porque la descontestación vive en las palabras y no en las intenciones. La señal es doble: el texto usa el concepto sin decir en qué sentido, y da por hecho que su sentido es el obvio. La prueba de los tres segundos lo confirma: se pone el otro significado en la misma frase, sin tocar nada más, y si la frase se vuelve absurda o cambia de bando, ahí estaba el cierre, y ese cierre era la afirmación de verdad del documento.',
  'Después se dibuja, y se dibuja de verdad, en tres capas. El núcleo no se busca por el orden en que están impresos los puntos (casi nunca es el punto 1, y muy a menudo es uno del medio, el que dice cómo se resuelve un desacuerdo): se busca con la prueba de quitarlo y ver si el ideario sigue siendo el mismo. Los adyacentes son los que precisan el núcleo y le dan forma concreta, y hacen falta porque un núcleo solo no decide nada. La periferia es lo que cambia con el lugar y con la década, y conviene medirla, porque descubrir que la mitad del documento era periferia es la mitad del hallazgo.',
  'Toda fuente y toda cifra pasan por la regla del estatus, y aquí las etiquetas están fijadas: Gallie (1956) como clásico sólido de la filosofía; Berlin (1958) como clásico sólido y fuente canónica del ejemplo central; Freeden con «Ideologies and Political Theory» (1996) como académico sólido y base del análisis morfológico, y con «Ideology: A Very Short Introduction» (2003) como la rampa de entrada del propio dueño del instrumento. Los lempiras del caso se dicen enteros, con lo que compran y con lo que piden a cambio. Y los textos de entrenamiento son históricos o de fuera: cero etiquetas a políticos vivos del país.',
  'Todo caso termina con la condición escrita y con el pago. La condición es concreta: el núcleo declarado en prosa llana, los adyacentes nombrados, la periferia dicha como periferia, y la morfología publicada junto a la firma cuando hay una firma. Y el pago no es opcional: se dibuja también la morfología propia, y se dibuja con el ideario más parecido, no con el más lejano, porque el bisturí que solo corta hacia afuera no es instrumento, es arma. Si en el dibujo propio aparece un adyacente que nunca se había declarado, se escribe, y se le pone su renglón de qué evidencia lo haría cambiar; si ese renglón no existe, funciona como dogma y así se anota, con fecha.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"Este ideario son diez opiniones, y estoy de acuerdo con siete".', g1: 'Eso no es una disección, es un marcador. Diez frases al mismo nivel no se pueden comparar con ningún otro ideario, ni permiten saber qué le pasaría a este si se le quita una pieza.', g2: 'La corrección: dibujarlo en tres capas. Casi siempre resulta que los siete acuerdos están en la periferia y los tres desacuerdos en el núcleo, y entonces «estar de acuerdo en el setenta por ciento» era una cuenta sin sentido.' },
  { txt: '"El punto 1 de la declaración es su núcleo, porque va primero".', g1: 'El orden de impresión no es la morfología. El punto 1 suele ser el más presentable, y el núcleo suele estar en el medio: en el punto que dice cómo se resuelve un desacuerdo, del que se siguen los demás.', g2: 'La corrección es la prueba de quitarlo: se tapa un punto y se lee el resto. Si el ideario sigue siendo el mismo, ese punto no era núcleo, aunque abra el documento.' },
  { txt: '"El texto dice que defiende la libertad, así que ya sé qué defiende".', g1: 'No se sabe todavía nada: falta cuál de las dos. Berlin partió la palabra en 1958 justamente porque las dos mitades piden cosas contrarias, y un texto que no dice cuál está descontestando sin declararlo.', g2: 'La corrección es la prueba de los tres segundos: poner la otra libertad en la misma frase. Si la frase cambia de bando, ahí estaba escondida la afirmación de verdad del texto.' },
  { txt: '"Esa familia política tiene en el núcleo el odio al que trabaja".', g1: 'Nadie pone un defecto en el núcleo de su propio ideario, así que lo dibujado es un muñeco. Y contra un muñeco se puede ganar todas las tardes sin haber tocado nunca al adversario real.', g2: 'La corrección la manda la regla del acero, que en este arco es la regla madre: se rehace la hoja con la mejor versión, la que un militante firmaría, y solo entonces la crítica vale y además se vuelve más difícil.' },
  { txt: '"Llevamos dos horas discutiendo el nombre del programa: es lo más importante".', g1: 'Es periferia peleada como si fuera núcleo, el error más frecuente y el más caro en horas. Mientras se discute el nombre, el núcleo suele estarse negociando sin que nadie lo mire.', g2: 'La corrección: preguntar qué pasaría si el nombre fuera otro. Si la respuesta es «nada, seguiríamos siendo lo mismo», la discusión vale lo que valga el gusto, y se decide rápido y sin drama.' },
  { txt: '"Ya diseccionamos tres idearios ajenos: la etapa está cumplida".', g1: 'Falta el que cuesta. Diseccionar lo ajeno lo hace cualquiera; la etapa pide además el propio, y pide que el pago se haga con el ideario más parecido, no con el más lejano.', g2: 'La corrección es la regla de pago corriendo de verdad: los tres anillos de esta casa, con el adyacente que nunca se declaró escrito y con su renglón de qué evidencia lo haría cambiar.' },
]);
B.critDecisionBank = JSON.stringify([
  'La página de «quiénes somos» se publica el lunes: ¿se deja como está, o se declara el cierre? ¿Y qué se escribe exactamente en el núcleo?',
  'La red educativa espera respuesta por los L 75,000: ¿se firma la declaración, se firma con hoja al margen, o no se firma? ¿Qué dice esa hoja?',
  'Jael tiene el plan de gobierno viejo sobre la mesa: ¿qué se dibuja primero, y cómo se comprueba que lo puesto en el núcleo es núcleo?',
  'El lema «formamos líderes con valores» se lee de camino al acto: ¿se comenta en el acto, se calla, o se hace otra cosa? ¿Qué exactamente?',
  'La empresa ofrece L 12,000 por la charla y su morfología es casi la de la casa: ¿se acepta, y qué se enseña primero al llegar?',
  'Angelly pregunta por qué se pelean dos que quieren justicia: ¿qué se le contesta a su edad, y con qué ejemplo de la calle?',
  'El primer dibujo de Jael puso un defecto en el núcleo: ¿qué se hace con esa hoja, y cómo se sabe cuándo el nuevo dibujo ya sirve?',
  'Apareció un adyacente sin declarar en la morfología de M.E.T.A.S: ¿se escribe, se discute o se quita? ¿Y qué renglón se le agrega?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Publicar la página declarando el cierre: qué libertad, qué igualdad, y qué queda en la periferia.', b: 'Publicar «creemos en la libertad y en la igualdad de oportunidades» y dejarlo bonito.', ga: 'Caso A: la casa queda discutible, que es lo que se busca: alguien puede objetarle a M.E.T.A.S lo que M.E.T.A.S dijo, y no lo que imaginó que dijo.', gb: 'Caso B: la frase la firman todos y no compromete a nadie; el día del desacuerdo la casa no puede apelar a su propio texto, porque su propio texto no decía nada.', gr: 'Declarar el cierre no debilita un ideario: lo vuelve auditable, y solo lo auditable se puede defender.' },
  { a: 'Dibujar en tres capas antes de opinar del ideario ajeno.', b: 'Ir punto por punto diciendo con cuáles se está de acuerdo.', ga: 'Caso A: aparece dónde está el núcleo de verdad, cuánto del documento era periferia de su década, y qué pasaría si se le quita una pieza.', gb: 'Caso B: se produce un marcador de siete a tres que no informa de nada, porque cuenta piezas de tamaños distintos como si pesaran igual.', gr: 'La diferencia es la de contar contra pesar: un ideario no se mide por cuántos puntos gustan, sino por qué sostiene qué.' },
  { a: 'Entrenar el bisturí con un plan de gobierno de hace décadas.', b: 'Entrenarlo con el discurso de un político hondureño de esta semana.', ga: 'Caso A: el documento ya no puede ganar ni perder una elección, así que se disecciona con pulso firme y la familia entera lo lee como ejercicio.', gb: 'Caso B: el análisis nace torcido, porque el que corta ya sabe qué quiere encontrar, y la casa queda repartiendo etiquetas a gente viva del país.', gr: 'La regla no es cobardía sino calibración: el instrumento que nace torcido miente después con cualquier texto, incluido el propio.' },
  { a: 'Pagar la regla dibujando la morfología de la empresa que se parece a la casa.', b: 'Pagar la regla dibujando la morfología de la familia política que peor le cae a la casa.', ga: 'Caso A: el pago cuesta y por eso sirve: es donde aparecen los adyacentes propios sin declarar, porque el parecido obliga a mirar de cerca.', gb: 'Caso B: se siente como pago y no lo es: dibujar al que ya disgusta es el ejercicio cómodo, y suele salir un muñeco sin que nadie lo note.', gr: 'La regla de pago se cumple con el ideario más parecido, no con el más lejano; con el lejano se cumple la apariencia.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Un texto usa un concepto disputado sin decir en cuál de sus sentidos.', guide: 'Cada lector le pone el significado que ya traía, el texto parece unánime, y el desacuerdo estalla el día de aplicarlo, cuando ya no hay a qué apelar porque el documento no decía nada.' },
  { cause: 'Se dibuja la morfología antes de opinar.', guide: 'Aparece el núcleo real (casi nunca el punto 1), se mide cuánta periferia había, y la discusión se vuelve posible: se sabe qué se está negociando y qué no se puede tocar sin cambiar de nombre.' },
  { cause: 'Se pone en el núcleo de una familia un defecto que nadie confesaría.', guide: 'Se dibuja un muñeco: la crítica gana todas las tardes sin tocar al adversario real, y los militantes de esa familia se confirman al verse mal leídos, que es lo contrario de lo que se quería.' },
  { cause: 'Se pelea la periferia como si fuera el núcleo.', guide: 'Se gastan horas en el nombre, el color o el formato, y mientras eso pasa el núcleo se negocia sin que nadie lo mire, que es exactamente cómo se pierden los proyectos sin que nadie recuerde cuándo.' },
  { cause: 'El entrenamiento se hace con textos históricos o de fuera.', guide: 'El instrumento nace derecho: se aprende sin que nadie se sienta atacado, la casa no reparte etiquetas a políticos vivos, y quien lo aprendió así llega entrenado al texto de hoy con el pulso firme.' },
  { cause: 'La casa dibuja su propia morfología con el mismo bisturí.', guide: 'Aparecen los adyacentes que nunca se declararon y de los que sin embargo salían decisiones; cada uno queda escrito con su renglón de qué lo haría cambiar, y el instrumento se vuelve usable fuera de esta mesa.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'La página de «quiénes somos» quedó publicada con su núcleo en prosa llana.', guide: 'Se declaró el cierre: el núcleo en una frase que no usa conceptos disputados, los adyacentes nombrados (acceso gratuito, temario oficial, lengua materna) y la periferia dicha como periferia (formato, aplicación, colores).' },
  { effect: 'Se firmó la declaración de principios, y la firma salió acompañada de una hoja.', guide: 'La hoja llevaba la morfología dibujada al margen, diciendo cuál punto la casa toma como núcleo y cuáles considera periféricos. La red aceptó la hoja, que era la única condición: sin ella habría sido un núcleo prestado.' },
  { effect: 'Jael entregó el plan de gobierno diseccionado, y el núcleo cabía en dos frases.', guide: 'La mitad del documento era periferia de su década (obras, nombres y tecnologías que ya no existen). Se comprobó quitándola: el ideario seguía siendo el mismo, y ese fue el hallazgo del ejercicio.' },
  { effect: 'El lema del colegio no se comentó en el acto, y sí se diseccionó en casa.', guide: 'Se le corrió la prueba de los tres segundos a «líderes» y a «valores», y salió que el lema aguantaba cualquier respuesta, así que no afirmaba nada. Y de paso se le corrió al lema propio, que aguantó solo porque la casa lo había escrito antes.' },
  { effect: 'La charla en la empresa se dio, y la casa llevó su morfología dibujada.', guide: 'Se enseñó primero, incluida la parte donde coincide con la empresa (el mérito como adyacente) y la parte donde no (aquí el estudio es gratuito, y eso es núcleo). El pago de la regla se hizo con el ideario más parecido, que es donde cuesta.' },
  { effect: 'El adyacente «mérito» quedó escrito en el inventario de gafas.', guide: 'Con su renglón de qué evidencia lo haría cambiar: un cotejo de resultados que muestre que premiar el esfuerzo comparado desanima más de lo que anima. Sin ese renglón habría quedado anotado como dogma, con fecha.' },
]);

/* ---------- línea de tiempo: los siete momentos ---------- */
B.timelineData = JSON.stringify([
  { y: '1956', icon: '🔓', label: 'Gallie nombra el problema', text: '<strong>W. B. Gallie</strong> publica <strong>«Essentially Contested Concepts»</strong>: hay conceptos cuyo significado <strong>no queda cerrado nunca</strong>. Y lo decisivo: <strong>eso no es un defecto del idioma, es su modo de existir</strong>. Etiqueta: clásico sólido de la filosofía.' },
  { y: '1958', icon: '✂️', label: 'Berlin parte la libertad', text: 'En Oxford, <strong>Isaiah Berlin</strong> dicta <strong>«Dos conceptos de libertad»</strong> y separa la <strong>negativa</strong> (que nadie me estorbe) de la <strong>positiva</strong> (poder de verdad hacer). Etiqueta: <strong>clásico sólido</strong>, y la fuente canónica del ejemplo central de esta etapa.' },
  { y: 'El siglo', icon: '🚧', label: 'La pelea de las dos', text: '<strong>Media pelea política del siglo cabe en cuál de las dos se está nombrando</strong>, y casi nunca se dice cuál. Los dos vecinos de la calle, los dos bloques de la guerra fría: la misma palabra pidiendo cosas contrarias, y cada lado acusando al otro de no tener ninguna.' },
  { y: '1996', icon: '🔬', label: 'Freeden lo vuelve instrumento', text: 'En <strong>«Ideologies and Political Theory»</strong>, <strong>Michael Freeden</strong> construye sobre los dos: una ideología es una <strong>morfología</strong>, un arreglo de conceptos. Etiqueta: <strong>académico sólido</strong>, la base del análisis morfológico de la materia entera.' },
  { y: 'La anatomía', icon: '🎯', label: 'Las tres capas', text: '<strong>Núcleo</strong> (lo que no se negocia sin dejar de ser eso), <strong>adyacentes</strong> (los que precisan el núcleo) y <strong>periféricos</strong> (lo que cambia con el lugar y la década). Con eso <strong>un ideario se dibuja en una página</strong>, y dos dibujos se pueden comparar.' },
  { y: 'El movimiento', icon: '🔒', label: 'La descontestación', text: 'Toda ideología toma un concepto disputado, <strong>le fija un solo significado como si fuera el único posible</strong>, y <strong>vende ese cierre como sentido común</strong>. Aprender a ver ese gesto es aprender a leer política, y también a leerse.' },
  { y: '2003 y hoy', icon: '📐', label: 'La rampa y el dibujo', text: '<strong>«Ideology: A Very Short Introduction»</strong> es la puerta corta y seria escrita por el <strong>propio dueño del instrumento</strong>. Y la práctica de esta etapa: <strong>tres textos que no se parezcan, una página cada uno</strong>, y uno de los tres de la propia casa.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  disputado: {
    nombre: 'El concepto disputado', icon: '🔓',
    estructura: { title: 'Qué es', info: '• De <strong>Gallie (1956)</strong>: concepto cuyo significado <strong>no se cierra nunca</strong><br>• Libertad, igualdad, justicia, democracia, mérito<br>• Y la clave: <strong>la disputa es su modo de existir</strong>, no un defecto' },
    funcion: { title: 'Cómo se reconoce', info: '• Dos personas lo usan de acuerdo <strong>hasta el momento de aplicarlo</strong><br>• Nadie logra una definición que sirva a los dos lados<br>• Y sin embargo <strong>los dos lo usan correctamente</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Creer que se arregla <strong>definiendo mejor</strong>, de una vez y para siempre<br>• Tratarlo como un término descriptivo (kilómetro, fecha, peso)<br>• Acusar al otro de <strong>no saber castellano</strong> cuando usa el otro sentido' },
    cuidados: { title: 'En esta casa', info: '• Ningún concepto disputado <strong>se usa sin decir en cuál de sus sentidos</strong><br>• Antes de discutir se pregunta cuál está pidiendo el otro<br>• Y se acepta que <strong>eso no acaba la pelea: la vuelve real</strong>' },
  },
  libertad: {
    nombre: 'Las dos libertades', icon: '✂️',
    estructura: { title: 'Qué es', info: '• De <strong>Berlin (1958)</strong>, en Oxford: el ejemplo mayor partido en dos<br>• <strong>Negativa:</strong> que nadie me estorbe<br>• <strong>Positiva:</strong> poder de verdad hacer' },
    funcion: { title: 'Cómo se reconoce', info: '• La negativa <strong>se guarda estándose quieto</strong>: basta que nadie intervenga<br>• La positiva <strong>no se alcanza sin que alguien mueva algo</strong><br>• Prueba rápida: ¿esto pide que quiten algo o que pongan algo?' },
    enfermedades: { title: 'Dónde se cae', info: '• Decir «libertad» y no decir cuál: <strong>ahí vive la trampa</strong><br>• Regalar una libertad <strong>sin preguntar cuál quería el otro</strong><br>• Acusar al rival de estar contra la libertad <strong>cuando está contra la tuya</strong>' },
    cuidados: { title: 'En esta casa', info: '• Toda petición se traduce: <strong>¿quitar un estorbo o dar un medio?</strong><br>• Las dos son libertad, y las dos tienen coste<br>• Y el coste <strong>se dice en la misma frase</strong>, no en la letra chica' },
  },
  morfologia: {
    nombre: 'La morfología', icon: '🎯',
    estructura: { title: 'Qué es', info: '• De <strong>Freeden (1996)</strong>: un ideario es un <strong>arreglo de conceptos</strong><br>• Tres capas: <strong>núcleo</strong>, <strong>adyacentes</strong>, <strong>periféricos</strong><br>• Y por eso <strong>se puede dibujar en una página</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• El <strong>núcleo</strong> se encuentra quitándolo: si sigue siendo eso, no era<br>• Los <strong>adyacentes</strong> le dan forma concreta: sin ellos no decide nada<br>• Los <strong>periféricos</strong> cambian con el lugar y la década' },
    enfermedades: { title: 'Dónde se cae', info: '• Leer el ideario como <strong>lista de opiniones</strong> al mismo nivel<br>• Poner de núcleo <strong>el punto 1</strong>, que suele ser el más presentable<br>• Pelear la periferia <strong>como si fuera el núcleo</strong>' },
    cuidados: { title: 'En esta casa', info: '• Todo ideario se dibuja <strong>antes</strong> de opinar, y en una sola página<br>• Uno de los tres dibujos <strong>es de esta casa</strong><br>• Y si el núcleo ajeno <strong>no lo firmaría nadie de esa familia, se rehace</strong>' },
  },
  descontesta: {
    nombre: 'La descontestación', icon: '🔒',
    estructura: { title: 'Qué es', info: '• El movimiento clave de Freeden: <strong>fijar un solo significado</strong><br>• A un concepto que estaba abierto, <strong>como si fuera el único posible</strong><br>• Y vender ese cierre <strong>como sentido común</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• El texto usa el concepto <strong>sin decir en qué sentido</strong><br>• Y no menciona que hubo alternativa: <strong>la borra</strong><br>• <strong>Prueba de tres segundos:</strong> pon el otro sentido en la misma frase' },
    enfermedades: { title: 'Dónde se cae', info: '• Creer que solo descontestan <strong>los idearios ajenos</strong><br>• Confundir descontestar con <strong>definir con claridad</strong>: definir declara, descontestar esconde<br>• Dejar la propia descontestación <strong>sin declarar por comodidad</strong>' },
    cuidados: { title: 'En esta casa', info: '• Cuando la casa cierra un concepto, <strong>lo dice y firma el cierre</strong><br>• Cada cierre ajeno detectado <strong>se paga con uno propio</strong><br>• Y el pago se hace con <strong>el ideario más parecido, no con el más lejano</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Lee idearios como listas de opiniones 📋' },
  { t: 25, n: 'Reconoce un concepto disputado 🔓' },
  { t: 55, n: 'Distingue las dos libertades ✂️' },
  { t: 90, n: 'Encuentra el núcleo quitándolo 🎯' },
  { t: 130, n: 'Separa adyacentes de periferia 🛰️' },
  { t: 165, n: 'Caza una descontestación 🔒' },
  { t: 190, n: 'Dibuja el ideario en una página 🔬' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del bisturí superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario del instrumento explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de núcleos y periferias experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del instrumento maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del bisturí' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta de las Gafas a la Vista completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  /* --- el cuento a la manera de Borges --- */
  { t: 'Borges', q: '¿Qué tarea le encomendaron al narrador en el diccionario?', o: ['a) Redactar en veinte líneas la definición de «libertad»', 'b) Corregir las tildes de la letra L', 'c) Escribir el prefacio de la obra', 'd) Traducir el diccionario al inglés'], c: 0 },
  { t: 'Borges', q: '¿Por qué no le servía ninguna de sus catorce versiones?', o: ['a) Porque el director las rechazaba sin leerlas', 'b) Porque al cerrar la definición por un lado se le abría por otro', 'c) Porque le faltaban ejemplos', 'd) Porque eran demasiado largas'], c: 1 },
  { t: 'Borges', q: '¿Qué confesó Samuel Johnson en el prefacio de su diccionario de 1755?', o: ['a) Que había copiado de otros diccionarios', 'b) Que la obra le había costado poco trabajo', 'c) Que había empezado creyendo que podía fijar el idioma y terminó sabiendo que era vano', 'd) Que solo había definido las palabras difíciles'], c: 2 },
  { t: 'Borges', q: '¿Cómo terminó el narrador su encargo?', o: ['a) Renunciando al empleo', 'b) Copiando la definición de Johnson', 'c) Entregando una sola definición muy larga', 'd) Entregando dos definiciones numeradas, con una nota'], c: 3 },
  { t: 'Borges', q: 'Según el final del cuento, ¿qué eran aquellos números que el director despachó como tipografía?', o: ['a) La primera página de una morfología', 'b) Un error de imprenta', 'c) Una costumbre inútil de los diccionarios', 'd) Una idea de Johnson'], c: 0 },
  /* --- el capítulo a la manera de Cervantes --- */
  { t: 'Cervantes', q: '¿Qué entendía por libertad el hidalgo del capítulo?', o: ['a) Poder sacar agua del pozo', 'b) Que nadie le entrase en su dehesa ni le pusiera tributo', 'c) Que el concejo le diera cabras', 'd) Que todos fueran iguales'], c: 1 },
  { t: 'Cervantes', q: '¿Y qué entendía por libertad el labrador?', o: ['a) Que nadie le hablara', 'b) Que le quitaran el tributo', 'c) Poder sacar agua del único pozo de la comarca', 'd) Tener más cabras que el hidalgo'], c: 2 },
  { t: 'Cervantes', q: '¿Qué episodio propio recuerda don Quijote para probar su sentencia?', o: ['a) La aventura de los molinos', 'b) La bacía del barbero', 'c) La cueva de Montesinos', 'd) Que dio libertad a unos hombres en cadenas y le pagaron con pedradas'], c: 3 },
  { t: 'Cervantes', q: '¿Qué mandó dibujar don Quijote en el suelo?', o: ['a) Tres cercos, uno dentro de otro', 'b) Un mapa de la comarca', 'c) El plano del pozo', 'd) Dos rayas paralelas'], c: 0 },
  { t: 'Cervantes', q: '¿Qué le quiso vender Sancho al labrador?', o: ['a) Dos pares de antojos de Toledo', 'b) Su libertad de dormir a mediodía', 'c) El cántaro de vino', 'd) La bacía de su amo'], c: 1 },
  /* --- el ensayo a la manera de Harari --- */
  { t: 'Harari', q: 'Según el ensayo, ¿qué tipo de ficciones funcionan mejor para unir a millones?', o: ['a) Las que están definidas con precisión', 'b) Las que se escriben en varios idiomas', 'c) Las que no están del todo definidas', 'd) Las que tienen un autor famoso'], c: 2 },
  { t: 'Harari', q: '¿Cuál fue el resultado de la votación de la Declaración Universal de Derechos Humanos, el 10 de diciembre de 1948?', o: ['a) Cuarenta países a favor y diez en contra', 'b) Aprobación por unanimidad absoluta', 'c) Veinte a favor y veinte en contra', 'd) Cuarenta y ocho a favor, ninguno en contra y ocho abstenciones'], c: 3 },
  { t: 'Harari', q: '¿Cómo explica el ensayo que en 1948 nadie votara en contra?', o: ['a) Porque la palabra estaba abierta y cada bloque leyó adentro su propio programa', 'b) Porque el mundo estaba de acuerdo', 'c) Porque no se permitía votar en contra', 'd) Porque el texto era muy corto'], c: 0 },
  { t: 'Harari', q: 'Según el ensayo, ¿dónde suele estar el núcleo de un ideario?', o: ['a) En el punto número uno', 'b) En uno de los del medio, el que dice cómo se resuelve un desacuerdo', 'c) En el último punto', 'd) En el título'], c: 1 },
  { t: 'Harari', q: '¿Cuál es el uso del instrumento que, dice el ensayo, casi nadie hace?', o: ['a) Aplicarlo a los partidos políticos', 'b) Aplicarlo a las empresas', 'c) Dibujar los tres anillos de su propia casa', 'd) Aplicarlo a los documentos históricos'], c: 2 },
]);
B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: 'Gallie publicó «Essentially Contested Concepts» en ___.', a: '1956' },
  { t: 'las tres', q: 'Berlin dictó «Dos conceptos de libertad» en ___.', a: '1958' },
  { t: 'Borges', q: 'Samuel Johnson publicó su diccionario de la lengua inglesa en ___.', a: '1755' },
  { t: 'Borges', q: 'El narrador llegó a tener ___ versiones de la definición y ninguna le servía.', a: 'catorce' },
  { t: 'Cervantes', q: 'El labrador quería poder sacar agua del ___ del hidalgo.', a: 'pozo' },
  { t: 'Cervantes', q: 'Don Quijote los hizo dibujar tres ___ en el suelo.', a: 'cercos' },
  { t: 'Cervantes', q: 'Sancho quiso vender su libertad de dormir a ___.', a: 'mediodía' },
  { t: 'Harari', q: 'La Declaración Universal de Derechos Humanos se adoptó el 10 de diciembre de ___.', a: '1948' },
  { t: 'Harari', q: 'Freeden explicó el instrumento en corto en «Ideology: A Very Short Introduction», de ___.', a: '2003' },
  { t: 'Harari', q: 'El artículo primero de la Declaración francesa de ___ dice que los hombres nacen libres e iguales en derechos.', a: '1789' },
]);
B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan al mismo instrumento por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento instala la idea como experiencia y como fracaso propio: alguien intenta cerrar una palabra, no puede, y descubre que su impotencia tenía nombre y fecha; eso se recuerda porque duele un poco. El capítulo la vuelve escena, pleito y refrán, y añade algo que los otros dos no tienen: el cuerpo, porque los tres cercos se dibujan en el suelo con un palo y el lector los ve. El ensayo la pone a escala de especie y con números comprobables, y por eso es el único que sirve para citar en una discusión. Quien lee solo una se queda sin la experiencia, sin la escena o sin la prueba, y el instrumento necesita las tres: se aprende sintiéndolo, se recuerda viéndolo y se defiende midiéndolo.' },
  { q: '2. El narrador del cuento y el hidalgo del capítulo cometen errores opuestos con el mismo concepto. Nombra los dos y di qué le habría dicho Berlin a cada uno.', guia: 'El narrador comete el error del que quiere cerrar: cree que existe una definición única de libertad y que no encontrarla es torpeza suya, así que gasta un mes en catorce intentos de meter dos cosas en una. El hidalgo comete el error del que ya cerró sin saberlo: usa libertad en un solo sentido, el negativo, y da por hecho que ese es el sentido de la palabra, de modo que al labrador lo acusa de no saber castellano. A Berlin le habría bastado una frase para los dos, y sería la misma: la palabra nombra dos cosas distintas. Al narrador le habría dicho que su fracaso era la respuesta y no el problema; al hidalgo, que la libertad que el labrador pide también es libertad, y que negarlo no es rigor sino conveniencia.' },
  { q: '3. Don Quijote dice que «quien regala una libertad sin preguntar cuál, hace merced a su propio gusto y no al del prójimo». Traduce esa frase al vocabulario de esta etapa y da un ejemplo de la vida real.', guia: 'Traducida: quien actúa sobre un concepto disputado sin declarar en cuál de sus sentidos lo está usando, descontesta por su cuenta y le impone al otro su cierre, aunque crea estar ayudando. El propio don Quijote es el ejemplo mayor y por eso la frase le duele: liberó a los galeotes quitándoles el estorbo (libertad negativa) cuando ellos querían otra cosa, y se lo pagaron a pedradas. Un ejemplo de la vida real vale cualquiera que tenga las dos piezas, el bien intencionado y el cierre no declarado: la beca que se da como dinero cuando lo que faltaba era transporte, la regla del hogar que se levanta «para que sean libres» cuando lo que hacía falta era acompañamiento, la donación de equipo a una escuela que no tiene electricidad. La corrección es siempre la misma pregunta, y es de una línea: cuál de las dos libertades está pidiendo el otro.' },
  { q: '4. El ensayo afirma que la imprecisión de las grandes declaraciones «no fue un descuido de redactores apurados». Defiende esa tesis con el dato de 1948 y explica su lado incómodo.', guia: 'La tesis se defiende con la votación: el 10 de diciembre de 1948, cuarenta y ocho países votaron a favor de la Declaración Universal, ninguno en contra y ocho se abstuvieron, y eso ocurrió con el mundo partiéndose en dos bloques que iban a amenazarse durante cuarenta años. Un texto que hubiera especificado qué libertad y qué igualdad no habría reunido esa mayoría: la apertura del concepto fue la condición del acuerdo, no un defecto de redacción. El lado incómodo es el que sigue: un acuerdo así no es un acuerdo sobre lo que las palabras dicen, sino sobre las palabras, y por eso los dos bloques pudieron pasar cuarenta años acusándose de violar el mismo documento que ambos habían firmado. Sirve para empezar y no alcanza para decidir; el trabajo de decidir aparece después, y es el que el bisturí hace.' },
  { q: '5. Compara la solución del diccionario del cuento (numerar los sentidos) con la solución de don Quijote (dibujar tres cercos). ¿Cuál va más lejos, y por qué hacen falta las dos?', guia: 'Numerar va menos lejos, y es imprescindible: separa los sentidos de una palabra y evita el pleito de quién habla castellano, pero deja los sentidos sueltos, uno al lado del otro, sin decir qué sostiene qué. Dibujar va más lejos porque ordena: pone en el centro lo que no se puede quitar, alrededor lo que lo precisa, y afuera lo que cambia con el tiempo, de modo que se ve qué le pasaría al conjunto si se toca una pieza. Hacen falta las dos y en ese orden. Sin numerar, el dibujo se hace sobre una palabra confusa y el núcleo sale borroso; sin dibujar, la numeración se queda en una cortesía de diccionario y no permite comparar dos idearios ni prever un desacuerdo. El cuento lo dice sin decirlo: los números eran la primera página de una morfología, es decir el paso uno de dos.' },
  { q: '6. ¿Por qué el capítulo cervantino termina con «el que dibuja el cerco del vecino y nunca el suyo, no tiene bisturí, tiene lanza»? Relaciona esa frase con la regla de pago de la casa.', guia: 'Porque el instrumento y el arma se distinguen por la dirección en que se usan, no por su forma. Diseccionar el ideario ajeno produce ventaja en la discusión y no cuesta nada; diseccionar el propio produce hallazgos incómodos y no da ninguna ventaja inmediata, así que casi nadie lo hace sin obligación. La frase pone la prueba en el gesto y no en la intención: no pregunta si quien corta es honesto, pregunta cuántos cercos propios ha dibujado. La regla de pago de la casa es esa misma exigencia convertida en procedimiento contable, un desenmascaramiento propio por cada uno ajeno, y con un detalle que la hace difícil: el pago se hace con el ideario más parecido al propio, no con el más lejano, porque con el lejano se cumple la apariencia y no el propósito.' },
  { q: '7. El ensayo dice que el núcleo suele estar «en uno de los del medio, el que dice cómo se resuelve un desacuerdo». Explica por qué es ahí, y qué consecuencia práctica tiene al leer la declaración de principios de una organización.', guia: 'Es ahí porque el punto que fija cómo se resuelve un desacuerdo gobierna a todos los demás: de él depende qué pasa cuando dos principios chocan, y ningún principio significa nada operativo hasta que se sabe quién decide en el choque. Los puntos de apertura, en cambio, suelen elegirse por presentables, para que nadie objete, y por tanto suelen ser los más vagos y los más fáciles de firmar. La consecuencia práctica es que la lectura no se hace en el orden impreso: se busca directamente el punto del procedimiento (quién decide, con qué mayoría, quién puede vetar, qué pasa si no hay acuerdo) y desde ahí se leen los otros. Y si ese punto no existe en el documento, el hallazgo es igual de importante: la organización tiene el núcleo fuera del papel, en quien manda de hecho.' },
  { q: '8. ¿Cuál de las tres lecturas usarías para explicarle esta etapa a alguien que dice que esto es «enredar las palabras para no decidir nada»? Defiende tu elección citando el texto.', guia: 'Se acepta cualquiera de las tres si la defensa cita y argumenta; lo que se corrige es la defensa, no la elección. La más eficaz suele ser el capítulo, porque contesta la objeción con un resultado y no con una teoría: los dos contendientes dejan de disputar de castellano, dibujan los cercos, y salen con un acuerdo concreto, que el labrador saque agua a ciertas horas y el hidalgo no pague tributo por el pozo; cada uno se queda con la libertad que de verdad pedía y pierde la que nunca había querido. El ensayo también sirve si se usa el contraste entre las veinte firmas dormidas y el acuerdo real. El cuento es el menos indicado para esa persona en particular, porque su asunto es la impotencia de cerrar una palabra, y eso es justo lo que ese interlocutor va a leer como pérdida de tiempo.' },
  { q: '9. Las tres lecturas hablan de conceptos abiertos, y sin embargo esta casa exige declarar sus propios cierres. ¿Hay contradicción? Resuélvela.', guia: 'No hay contradicción, y verla es entender la etapa. Que un concepto sea esencialmente disputado significa que no se puede cerrar de una vez y para todos, no que nadie pueda cerrarlo para sí: de hecho toda ideología cierra, y no puede no cerrar, porque un concepto abierto no decide nada. Lo que la casa exige, entonces, no es no cerrar, que es imposible, sino declarar el cierre: decir con qué sentido está usando la palabra y firmarlo. La diferencia entre descontestar y declarar no está en el acto de cerrar sino en si el cierre queda a la vista o escondido, y esa diferencia lo cambia todo, porque un cierre declarado se puede discutir y uno escondido se hereda. La casa hace lo mismo que las demás; lo distinto es que lo escribe.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué la etiqueta pertenece al temario de esta etapa en particular, y qué pasaría si se quitara.', guia: 'Porque esta etapa entrega un instrumento para detectar cierres escondidos, y un pastiche sin declarar es exactamente un cierre escondido: el lector recibe una tesis con la autoridad de un clásico y sin poder saber que la autoridad es prestada. Enseñar a cazar ese movimiento y practicarlo en la misma página sería la contradicción más rápida posible. Hay además una razón propia del bisturí: la voz es un adyacente poderoso, porque una idea suena más verdadera dicha con la prosa de Borges o el periodo de Cervantes, y la etiqueta obliga al lector a separar lo que convence por argumento de lo que convence por timbre. Si se quitara, pasarían dos cosas comprobables: alguien citaría a Berlin o a Freeden a través de una frase que ninguno escribió, y la casa quedaría produciendo el tipo de fuente inflada que su propio compendio manda cazar.' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_gafas_bisturi_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena el dibujo de la morfología y la regla de pago. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se busca el concepto disputado y se cita la frase exacta donde el texto lo cierra, porque la descontestación vive en las palabras y no en las intenciones, y porque hasta que no se sabe en qué sentido se usa «libertad», «igualdad» o «mérito» no se sabe todavía qué afirma el documento. Después se dibuja en tres capas, y el núcleo se busca con la prueba de quitarlo y no por el orden en que están impresos los puntos: casi nunca es el punto 1, y muy a menudo es el del medio, el que dice cómo se resuelve un desacuerdo, porque de él dependen todos los demás. Luego pasan las fuentes por la regla del estatus, con fecha y etiqueta (Gallie 1956 como clásico sólido de la filosofía, Berlin 1958 como clásico sólido y fuente canónica del ejemplo, Freeden 1996 como académico sólido y base del análisis, y su introducción de 2003 como la rampa del propio dueño del instrumento), y los lempiras se dicen enteros, con lo que compran y con lo que piden a cambio. Y al final se escribe la condición y se paga la regla: se dibuja también la morfología propia, con el ideario más parecido y no con el más lejano, porque el bisturí que solo corta hacia afuera no es instrumento, es arma; y si en el dibujo propio aparece un adyacente que nunca se había declarado, se escribe con su renglón de qué evidencia lo haría cambiar, y si ese renglón no existe se anota que funciona como dogma, con fecha.";');

/* ---------- lo que arrastra el molde (la etapa 1 de las Gafas) ---------- */
const textos = [
  [/👓 \*Ruta de las Gafas a la Vista · Etapa 1\* 👓\\n\\nLa palabra con expediente: nació ciencia y quedó insulto\. Nadie mira a ojo desnudo, y el oficio es ver las gafas\. 👓\\n\\n_Incluye evaluación conceptual, las gafas sobre la mesa, guion de video y tres lecturas\._ ✍️/g,
    '🔬 *Ruta de las Gafas a la Vista · Etapa 2* 🔬\\n\\nEl bisturí de Freeden: núcleo, adyacentes y periferia. Un ideario no es una lista de opiniones: es una estructura que se puede dibujar. 🔬\\n\\n_Incluye evaluación conceptual, el ideario en la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/La palabra con expediente/g, 'El bisturí de Freeden'],
  [/Las gafas sobre la mesa/g, 'El ideario en la mesa'],
  [/las gafas sobre la mesa/g, 'el ideario en la mesa'],
  [/Etapa 1 de la Ruta de las Gafas a la Vista/g, 'Etapa 2 de la Ruta de las Gafas a la Vista'],
  [/Ruta de las Gafas a la Vista · Etapa 1 de 7/g, 'Ruta de las Gafas a la Vista · Etapa 2 de 7'],
  /* este venía en el encabezado de las dos pruebas imprimibles, y es el que
     se le escapó al primer grep: no dice «de 7» sino «· Estudio Mayor» */
  [/Ruta de las Gafas a la Vista · Etapa 1 · Estudio Mayor/g, 'Ruta de las Gafas a la Vista · Etapa 2 · Estudio Mayor'],
  [/const msgs=\['¡Sigue abriendo el expediente!','¡Muy buen trabajo!','¡Aprendiz de óptico!','¡Ya distingues expediente de insulto!','¡Con las gafas a la vista!'\]/,
    "const msgs=['¡Sigue afilando el bisturí!','¡Muy buen trabajo!','¡Aprendiz de anatomista!','¡Ya distingues núcleo de periferia!','¡Dibujas idearios en una página!']"],
  [/\['#5b21b6','#8b5cf6','#a8a29e','#57534e','#00b894'\]/, "['#0f766e','#2dd4bf','#a8a29e','#475569','#00b894']"],
  /* el verde quirúrgico en las pruebas y en las hojas imprimibles */
  [/#5b21b6/g, '#0f766e'],
  [/#3b1580/g, '#0b4f4a'],
  [/#f5f3ff/g, '#f0fdfa'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/Acuñó la palabra hacia 1796 como nombre de una ciencia\./g, 'Su significado no queda cerrado nunca.'],
  [/>Destutt de Tracy</g, '>Concepto esencialmente disputado (Gallie, 1956)<'],
  /* las preguntas fijas de la prueba competencial preguntaban por el expediente */
  [/¿En qué sentido está usada la palabra «ideología» en el caso, qué mapa da por obvio cada lado, y qué fuente o fecha necesita su etiqueta de estatus\? Explica la condición escrita que deja la casa y qué desenmascaramiento propio paga esa misma semana\./g,
    '¿Qué concepto disputado aparece en el caso y cómo lo descontesta el texto, y cómo queda su morfología en tres capas? Explica qué fuente necesita su etiqueta, la condición escrita que deja la casa y qué morfología propia hay que dibujar para pagar la regla.'],
  [/1\. ¿Cuál de los dos nombra su propio mapa y cuál lo esconde\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos dibuja la estructura y cuál solo cuenta puntos? 2. ¿Por qué no son la misma decisión?'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'El hombre que miraba sin gafas',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'La palabra que no se deja cerrar',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'De la reñida disputa sobre si era bacía o yelmo',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'De la libertad que pedían dos, siendo dos libertades',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'Los mapas invisibles',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'La palabra que firmaron todos',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa 1 era la palabra en la mesa. Aquí es la página de
   «quiénes somos»: dejarla bonita (una descontestación sin declarar) o
   declarar el cierre y dibujar la morfología. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(declara){sfx(declara?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(declara){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🎯</span><span class="ms-text"><strong>El cierre quedó declarado:</strong> el núcleo en prosa llana («todo niño puede aprender si alguien se sienta con él»), los adyacentes nombrados (acceso gratuito, temario oficial, lengua materna) y la periferia dicha como periferia (formato, aplicación, colores).</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🤝</span><span class="ms-text"><strong>Y con eso la casa se volvió discutible:</strong> ahora alguien puede objetarle a M.E.T.A.S lo que M.E.T.A.S dijo, y no lo que imaginó que dijo. Declarar el cierre no debilita un ideario: lo vuelve auditable, y solo lo auditable se puede defender.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🔒</span><span class="ms-text"><strong>Quedó una descontestación sin declarar:</strong> la frase fija por debajo un sentido de «libertad» y de «igualdad» y lo vende como sentido común. Suena a todo el mundo y no compromete a nadie.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega el día del desacuerdo:</strong> cada lector le había puesto el significado que ya traía, y la casa no puede apelar a su propio texto porque su propio texto no decía nada. Se reescribe declarando el cierre.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='disputado',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"disputado\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/👓/g, '🔬');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
