/* Inyecta los bancos de la misión «El mapa de las familias» (Ruta de las
   Gafas a la Vista, etapa 3: Estudio de las Ideologías, materia 25 del
   Estudio Mayor) sobre el molde copiado de la etapa 2 de la misma ruta.
   Uso:  node _dev/inyecta-bancos-mapa-familias.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Andrew Heywood, «Political Ideologies»: MANUAL ACADÉMICO CON MUCHAS
       EDICIONES, sólido como manual. Da el plano general y no la sentencia.
     · John Stuart Mill, «Sobre la libertad» (1859): CLÁSICO SÓLIDO, FUENTE
       PRIMARIA. La libertad en el núcleo del liberalismo.
     · Edmund Burke, «Reflexiones sobre la Revolución en Francia» (1790):
       CLÁSICO SÓLIDO, FUENTE PRIMARIA. La desconfianza de los planes
       perfectos, y el cambio como reparación y no como demolición.
     · Benedict Anderson, «Comunidades imaginadas» (1983) y Ernest Gellner,
       «Naciones y nacionalismo» (1983): CLÁSICOS SÓLIDOS QUE SE DISCUTEN
       ENTRE SÍ. Los dos se nombran, y se dice que discuten.
     · Colin Ward, «Anarchism: A Very Short Introduction» (2004): ENTRADA
       SERIA. El anarquismo completo y no la caricatura con bomba.
     · Robert Paxton, «Anatomía del fascismo» (2004): ACADÉMICO SÓLIDO. Lo
       define por lo que HACE: las etapas y las alianzas con las élites.
     · Roger Griffin, «The Nature of Fascism» (1991): ACADÉMICO SÓLIDO,
       DEFINICIÓN EN DISPUTA. El mito del renacer nacional.
     · Umberto Eco, «Ur-Fascism» (1995): ENSAYO CÉLEBRE, ESTATUS DE ENSAYO
       Y NO DE CIENCIA. Catorce rasgos que calzan demasiado fácil, y una
       lista que da positivo con casi todo no mide nada.
     · Zeev Sternhell, «Ni derecha ni izquierda» (1983): TESIS DISCUTIDA.
       El fascismo nacido de un cruce de nacionalismo y revisión del
       marxismo en la Francia de entreguerras; el debate queda más honesto
       con ella dentro.
     · Cas Mudde, «The Populist Zeitgeist» (2004): ACADÉMICO SÓLIDO. El
       populismo como IDEOLOGÍA DELGADA: el pueblo puro contra la élite
       corrupta, con un núcleo que necesita anfitriona.
     · Mudde con Cristóbal Rovira Kaltwasser, «Populism: A Very Short
       Introduction» (2017): ACADÉMICO SÓLIDO, escrito a medias desde
       América Latina.

   La idea que ordena todos los bancos: con el bisturí de la etapa 2 se
   recorre el mapa, y cada familia entra POR SU MEJOR VERSIÓN. La vara de la
   etapa: dibujar la morfología de cada familia, reconocer de cuál es un
   texto sin que el texto se declare, saber cuándo «fascista» describe y
   cuándo solo escupe, y escribir media página de la familia que peor le cae
   al alumno, tan bien que un militante la firmaría.

   Tres cuidados del arco gobiernan la misión entera. Uno: en este arco LA
   REGLA DEL ACERO ES LA REGLA MADRE, así que si el núcleo dibujado no lo
   firmaría nadie de esa familia, lo dibujado es un muñeco y la hoja se
   rehace. Dos: el detector se gira hacia adentro, porque un detector que no
   se prueba en casa no es un instrumento, es un arma; de ahí la regla de
   pago, y el pago se hace con el ideario MÁS PARECIDO al propio. Tres: CERO
   PARTIDISMO HONDUREÑO ACTUAL, y aquí el cuidado es doble, porque
   «fascista» y «populista» son las dos palabras más gastadas del debate
   diario: la misión enseña cuándo describen y cuándo solo escupen, y no las
   aplica a nadie vivo del país.                                          */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-gafas-mapa-familias', 'js', 'mapa-familias.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260819;
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
  { w: 'La regla del acero, aquí regla madre', a: '🛡️ En este arco no es una recomendación: <strong>cada familia se pone en pie en su mejor versión antes de tocarla</strong>. Si el núcleo que dibujaste no lo firmaría nadie de esa familia, dibujaste un muñeco y la hoja se rehace.' },
  { w: 'El desfile de ismos', a: '🎪 Cómo se enseña esto en la escuela: <strong>cada familia contada por sus enemigos</strong>, una semana por ismo y examen de reconocer autores. Se aprende rápido y no sirve para nada: con eso no se reconoce un texto que no se declara.' },
  { w: 'Núcleo del liberalismo', a: '🕊️ <strong>La libertad</strong> del individuo, que no se sacrifica a ningún plan colectivo. El argumento de <strong>Mill («Sobre la libertad», 1859)</strong> no es egoísta: nadie está en el lugar de otro adulto, así que nadie tiene autoridad para decidir por él. Etiqueta: clásico sólido, fuente primaria.' },
  { w: 'Núcleo del conservadurismo', a: '🏛️ <strong>La desconfianza de los planes perfectos</strong>, y el cambio como <strong>reparación y no como demolición</strong>. <strong>Burke</strong> lo escribió mirando la <strong>Revolución francesa en 1790</strong>, cuando nadie sabía cómo iba a terminar. Etiqueta: clásico sólido, fuente primaria.' },
  { w: 'Núcleo del socialismo', a: '🤝 <strong>La igualdad y la comunidad</strong>: nadie se salva solo y las condiciones materiales cuentan. Y su rasgo propio: <strong>un siglo de variantes internas que pelean entre sí más que con nadie</strong>, así que confundir a un socialdemócrata con un leninista es no entender a ninguno.' },
  { w: '«Comunidades imaginadas» (1983)', a: '📰 De <strong>Benedict Anderson</strong>: la nación existe porque <strong>millones que nunca se van a conocer se piensan juntos</strong>, con el periódico y el libro impreso como motor. Imaginada no quiere decir falsa. Etiqueta: <strong>clásico sólido</strong>.' },
  { w: '«Naciones y nacionalismo» (1983)', a: '🏭 De <strong>Ernest Gellner</strong>: la nación no despierta, <strong>se fabrica</strong>, y la fabrica la <strong>industrialización</strong>, que necesita gente móvil y alfabetizada. <strong>Es el nacionalismo el que engendra las naciones, y no al revés.</strong> Etiqueta: <strong>clásico sólido</strong>.' },
  { w: 'Anderson y Gellner se discuten', a: '⚔️ Los dos son de 1983 y <strong>no se llevan bien</strong>: Anderson le objetó a Gellner que confunde <strong>inventar con falsificar</strong>, cuando inventar también quiere decir imaginar y crear. Se citan los dos y se dice que discuten: quien elige uno sin conocer al otro no eligió, heredó.' },
  { w: 'La familia que se cuela en todas', a: '🏴 El <strong>nacionalismo</strong>: casi nunca viene solo. Se engancha a un liberalismo, a un conservadurismo o a un socialismo y les cambia una sola cosa: <strong>a quién se le debe algo</strong>. Por eso hay que preguntar a quién incluye y a quién deja fuera ese «nosotros».' },
  { w: 'Núcleo del anarquismo', a: '🕊️ <strong>El rechazo de la autoridad que no puede justificarse</strong>, y la letra pequeña es todo: no dice «de toda autoridad». Su pregunta es «¿con qué derecho manda usted aquí?», y <strong>ha producido más cooperativas que atentados</strong>. Fuente: <strong>Colin Ward (2004), entrada seria</strong>.' },
  { w: 'Paxton: por lo que HACE', a: '⚒️ <strong>«Anatomía del fascismo» (2004)</strong>: se define <strong>por lo que hace y no por lo que dice</strong>, mirando las <strong>etapas</strong> y las <strong>alianzas con las élites</strong> que le abren la puerta. Etiqueta: <strong>académico sólido</strong>.' },
  { w: 'Griffin: el mito del renacer', a: '🔥 <strong>«The Nature of Fascism» (1991)</strong>: lo define por el <strong>mito del renacer nacional</strong>, la nación humillada que va a volver a nacer purificada. Etiqueta: <strong>académico sólido, definición en disputa</strong>.' },
  { w: '«Ur-Fascism» de Eco (1995)', a: '📏 <strong>Ensayo célebre, con estatus de ENSAYO y no de ciencia</strong>. Catorce rasgos sugerentes, y el propio texto advierte que basta que uno aparezca; con esa regla la lista da positivo con un colegio, un equipo y una familia. <strong>Una lista que da positivo con casi todo no mide nada.</strong>' },
  { w: 'Sternhell, la tesis incómoda', a: '🇫🇷 <strong>«Ni derecha ni izquierda» (1983)</strong>: hace nacer el fascismo de un <strong>cruce de nacionalismo y revisión del marxismo</strong> en la Francia de entreguerras. Etiqueta: <strong>tesis discutida</strong>, y el debate queda más honesto con ella dentro que fuera.' },
  { w: 'Ideología delgada', a: '🪶 De <strong>Mudde («The Populist Zeitgeist», 2004)</strong>: el populismo es <strong>el pueblo puro contra la élite corrupta</strong> y nada más. Un núcleo tan flaco <strong>necesita engancharse a una familia anfitriona</strong>, de izquierda o de derecha. Etiqueta: académico sólido.' },
  { w: 'Cuándo «fascista» describe', a: '📐 Describe cuando viene <strong>con una definición que predice algo</strong>: con Paxton dice qué hace y con qué élites se alió, y se puede comprobar; con Griffin afirma que hay mito de renacer, y se puede buscar. <strong>Sin definición no describe: solo escupe</strong>, y la palabra gastada se queda sin filo.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Qué manda la regla del acero, que en este arco es la regla madre?', o: ['a) Que cada familia entre por su mejor versión antes de tocarla', 'b) Que se estudien las familias por orden alfabético', 'c) Que no se critique a nadie', 'd) Que se lean solo manuales'], c: 0 },
  { q: 'Mill, en «Sobre la libertad» (1859), pone en el núcleo del liberalismo…', o: ['a) La propiedad privada', 'b) La libertad del individuo', 'c) La nación', 'd) El mérito'], c: 1 },
  { q: 'Burke, en 1790, defiende el cambio entendido como…', o: ['a) Demolición y arranque de cero', 'b) Rechazo de todo cambio', 'c) Reparación y no demolición', 'd) Un plan perfecto bien diseñado'], c: 2 },
  { q: 'El rasgo propio del socialismo que esta etapa subraya es…', o: ['a) Que no tiene autores', 'b) Que nunca cambió', 'c) Que es la familia más nueva', 'd) Un siglo de variantes internas que pelean entre sí'], c: 3 },
  { q: 'Anderson (1983) llamó a la nación una comunidad imaginada porque…', o: ['a) Millones que nunca se van a conocer se piensan juntos', 'b) Es una mentira de los gobiernos', 'c) No existe realmente', 'd) La inventaron los periódicos por error'], c: 0 },
  { q: 'Gellner (1983) ató el nacionalismo sobre todo a…', o: ['a) La religión', 'b) La industrialización', 'c) La geografía', 'd) La lengua antigua'], c: 1 },
  { q: 'El núcleo del anarquismo es el rechazo de…', o: ['a) Toda forma de organización', 'b) La propiedad y nada más', 'c) La autoridad que no puede justificarse', 'd) La cooperación'], c: 2 },
  { q: 'Paxton (2004) propone definir el fascismo…', o: ['a) Por su programa escrito', 'b) Por sus símbolos', 'c) Por el número de seguidores', 'd) Por lo que hace, y no por lo que dice'], c: 3 },
  { q: 'El «Ur-Fascism» de Eco (1995) se lee con estatus de…', o: ['a) Ensayo, no de ciencia', 'b) Ley científica comprobada', 'c) Fuente primaria de archivo', 'd) Manual académico'], c: 0 },
  { q: 'El populismo es una ideología delgada porque…', o: ['a) Tiene pocos seguidores', 'b) Su núcleo es tan flaco que necesita una familia anfitriona', 'c) Se escribe en textos cortos', 'd) Solo existe en un continente'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Mejor versión', 'Muñeco'],
    headA: '🛡️ Mejor versión: la firmaría un militante',
    headB: '🎭 Muñeco: un defecto en el núcleo',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Nadie está en el lugar de otro adulto»', t: 'ok' },
      { w: '«Lo que quieren en el fondo es mandar»', t: 'no' },
      { w: '«Lo que funciona costó siglos y nadie sabe cómo»', t: 'ok' },
      { w: '«Le tienen miedo al futuro porque son cobardes»', t: 'no' },
      { w: '«Nadie se salva solo y el punto de partida cuenta»', t: 'ok' },
      { w: '«Lo que sienten es envidia del que tiene»', t: 'no' },
      { w: '«Se rechaza la autoridad que no puede justificarse»', t: 'ok' },
      { w: '«Solo quieren poner bombas»', t: 'no' },
    ],
  },
  {
    label: ['Liberalismo', 'Conservadurismo'],
    headA: '🕊️ Liberalismo: la libertad en el centro',
    headB: '🏛️ Conservadurismo: reparar, no demoler',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Ningún adulto necesita tutor para su propia vida»', t: 'ok' },
      { w: '«Antes de cambiar la regla, pregunta para qué se puso»', t: 'no' },
      { w: '«El límite del Estado es donde empieza cada uno»', t: 'ok' },
      { w: '«Los planes que empiezan de cero salen caros»', t: 'no' },
      { w: '«Que cada quien elija su camino y responda por él»', t: 'ok' },
      { w: '«Lo que aguantó cien años merece el beneficio de la duda»', t: 'no' },
      { w: '«Mill, «Sobre la libertad», 1859»', t: 'ok' },
      { w: '«Burke, «Reflexiones sobre la Revolución en Francia», 1790»', t: 'no' },
    ],
  },
  {
    label: ['Describe', 'Solo escupe'],
    headA: '📐 Describe: trae definición y predice',
    headB: '💢 Solo escupe: no dice nada',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Es fascista según Paxton: mira con qué élites se alió»', t: 'ok' },
      { w: '«Es fascista porque me cae mal»', t: 'no' },
      { w: '«Trae el mito del renacer nacional, como en Griffin»', t: 'ok' },
      { w: '«Fascista el que exige puntualidad»', t: 'no' },
      { w: '«Es populista: pueblo puro contra élite corrupta, y se pegó a una anfitriona»', t: 'ok' },
      { w: '«Populista todo el que promete algo»', t: 'no' },
      { w: '«Marcó cuatro de las etapas que describe Paxton»', t: 'ok' },
      { w: '«Comunista porque el estudio es gratis»', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Viene después o vive en otra etapa'],
    headA: '🧬 Se estudia en esta etapa',
    headB: '🏠 Viene después o es de otra etapa',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El núcleo de cada una de las siete familias', t: 'ok' },
      { w: 'El eje izquierda y derecha, y sus dos ejes reales', t: 'no' },
      { w: 'El nacionalismo colado en las demás familias', t: 'ok' },
      { w: 'El votante que no piensa en términos ideológicos', t: 'no' },
      { w: 'El debate definicional del fascismo, con sus cuatro etiquetas', t: 'ok' },
      { w: '«Esto no es política, es técnica»: la naturalización', t: 'no' },
      { w: 'El populismo como ideología delgada', t: 'ok' },
      { w: 'El eufemismo y el cliché terminador en el texto', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['El', 'liberalismo', 'pone', 'la', 'libertad', 'en', 'el', 'núcleo.'], c: 4, art: 'Qué pone el liberalismo en el centro' },
  { s: ['Burke', 'desconfía', 'de', 'los', 'planes', 'perfectos.'], c: 4, art: 'De qué desconfía el conservadurismo' },
  { s: ['El', 'socialismo', 'pone', 'igualdad', 'y', 'comunidad.'], c: 3, art: 'El primer concepto del núcleo socialista' },
  { s: ['Anderson', 'habló', 'de', 'comunidades', 'imaginadas.'], c: 3, art: 'Cómo llamó Anderson a la nación' },
  { s: ['Gellner', 'ató', 'la', 'nación', 'a', 'la', 'industrialización.'], c: 6, art: 'A qué ató Gellner el nacionalismo' },
  { s: ['El', 'anarquismo', 'rechaza', 'la', 'autoridad', 'injustificada.'], c: 5, art: 'Qué clase de autoridad se rechaza' },
  { s: ['Paxton', 'define', 'el', 'fascismo', 'por', 'lo', 'que', 'hace.'], c: 7, art: 'Por qué se define el fascismo según Paxton' },
  { s: ['El', 'populismo', 'es', 'una', 'ideología', 'delgada.'], c: 5, art: 'Cómo es el núcleo del populismo' },
]);

/* ---------- completa la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'Cada familia entra por su mejor ___, como manda la regla del acero.', opts: ['versión', 'época', 'cifra'], c: 0 },
  { s: 'Mill puso la ___ en el núcleo del liberalismo, en 1859.', opts: ['nación', 'libertad', 'igualdad'], c: 1 },
  { s: 'Burke entendió el cambio como reparación y no como ___.', opts: ['costumbre', 'plan', 'demolición'], c: 2 },
  { s: 'Anderson llamó a la nación una comunidad ___.', opts: ['imaginada', 'fabricada', 'antigua'], c: 0 },
  { s: 'Gellner ató el nacionalismo a la ___.', opts: ['religión', 'industrialización', 'lengua'], c: 1 },
  { s: 'El anarquismo rechaza la autoridad que no puede ___.', opts: ['crecer', 'mandar', 'justificarse'], c: 2 },
  { s: 'Paxton define el fascismo por lo que ___, y no por lo que dice.', opts: ['hace', 'promete', 'escribe'], c: 0 },
  { s: 'El populismo es una ideología ___ y necesita anfitriona.', opts: ['gruesa', 'delgada', 'antigua'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Liberalismo', 'Conservadurismo'],
    btnA: '🕊️ Liberalismo', btnB: '🏛️ Conservadurismo',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La libertad en el núcleo', t: 'ok' },
      { w: 'Desconfía de los planes perfectos', t: 'no' },
      { w: 'Mill, 1859', t: 'ok' },
      { w: 'Burke, 1790', t: 'no' },
      { w: 'Nadie decide por otro adulto', t: 'ok' },
      { w: 'El cambio como reparación', t: 'no' },
      { w: 'Límites al poder sobre la vida propia', t: 'ok' },
      { w: 'Lo que aguantó siglos merece duda', t: 'no' },
      { w: 'Cada uno responde por su camino', t: 'ok' },
      { w: 'Nadie sabe cómo se tiene lo que se tiene', t: 'no' },
    ],
  },
  {
    label: ['Describe', 'Solo escupe'],
    btnA: '📐 Describe', btnB: '💢 Solo escupe',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Fascista según Paxton: mira las alianzas»', t: 'ok' },
      { w: '«Fascista porque me cae mal»', t: 'no' },
      { w: '«Trae el mito del renacer, como Griffin»', t: 'ok' },
      { w: '«Populista todo el que promete»', t: 'no' },
      { w: '«Pueblo puro contra élite corrupta, con anfitriona»', t: 'ok' },
      { w: '«Comunista porque es gratis»', t: 'no' },
      { w: '«Cumple cuatro etapas de las que describe Paxton»', t: 'ok' },
      { w: '«Fascista el que pide puntualidad»', t: 'no' },
      { w: '«Su documento dice que la nación va a renacer purificada»', t: 'ok' },
      { w: '«Anarquista el desordenado»', t: 'no' },
    ],
  },
  {
    label: ['Mejor versión', 'Muñeco'],
    btnA: '🛡️ Mejor versión', btnB: '🎭 Muñeco',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Nadie está en el lugar de otro adulto', t: 'ok' },
      { w: 'En el fondo solo quieren mandar', t: 'no' },
      { w: 'Reparar antes que demoler', t: 'ok' },
      { w: 'Son cobardes con miedo al futuro', t: 'no' },
      { w: 'Nadie se salva solo', t: 'ok' },
      { w: 'Lo que sienten es envidia', t: 'no' },
      { w: 'La autoridad se justifica o no manda', t: 'ok' },
      { w: 'Solo quieren romper cosas', t: 'no' },
      { w: 'En la nación están los muertos y los que nacerán', t: 'ok' },
      { w: 'Odian al que no es de aquí, y eso es todo', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se levanta la mejor versión de una familia',
    steps: [
      'Leer a alguien de esa familia que la defienda bien, y no a quien la resume para atacarla',
      'Escribir su núcleo en una frase, sin adjetivos y sin ironía',
      'Preguntarse si un militante de esa familia firmaría esa frase',
      'Si el núcleo escrito es un defecto, romper la hoja y volver al primer paso',
      'Añadir la mejor objeción que la familia tiene contra la propia',
      'Y solo entonces escribir la crítica, aparte y con su nombre',
    ],
  },
  {
    label: 'Cómo se reconoce la familia de un texto que no se declara',
    steps: [
      'Leer el texto entero sin buscar todavía ninguna palabra',
      'Descartar las palabras que usan todos: pueblo, libertad, patria, justicia, orden',
      'Buscar la afirmación que el texto da por hecha y nunca argumenta',
      'Comprobar si esa afirmación es el núcleo de alguna de las siete familias',
      'Mirar si el nacionalismo viene colado, cambiando a quién se le debe algo',
      'Y si solo aparece pueblo puro contra élite corrupta, buscar la anfitriona',
    ],
  },
  {
    label: 'Cómo se usa la palabra «fascista» sin gastarla',
    steps: [
      'Parar antes de decirla, y preguntarse con qué definición se va a usar',
      'Elegir la definición y nombrarla: Paxton por lo que hace, o Griffin por el mito del renacer',
      'Decir qué predice esa definición en este caso concreto',
      'Ir a comprobarlo en los hechos, y aceptar que puede no dar',
      'Dejar la lista de catorce rasgos de Eco donde le toca: ensayo para pensar, no termómetro',
      'Y no aplicarla a nadie vivo del país: el entrenamiento va con textos históricos o de fuera',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Puso la libertad en el núcleo del liberalismo, en 1859', ans: 'John Stuart Mill', opts: ['John Stuart Mill', 'Edmund Burke', 'Cas Mudde', 'Colin Ward'] },
  { desc: 'Escribió su libro mirando la Revolución francesa en 1790', ans: 'Edmund Burke', opts: ['Edmund Burke', 'John Stuart Mill', 'Benedict Anderson', 'Roger Griffin'] },
  { desc: 'Llamó a la nación una comunidad imaginada, en 1983', ans: 'Benedict Anderson', opts: ['Benedict Anderson', 'Ernest Gellner', 'Zeev Sternhell', 'Umberto Eco'] },
  { desc: 'Ató el nacionalismo a la industrialización, también en 1983', ans: 'Ernest Gellner', opts: ['Ernest Gellner', 'Benedict Anderson', 'Robert Paxton', 'Andrew Heywood'] },
  { desc: 'Escribió la entrada seria del anarquismo, en 2004', ans: 'Colin Ward', opts: ['Colin Ward', 'Cas Mudde', 'Robert Paxton', 'Ernest Gellner'] },
  { desc: 'Define el fascismo por lo que hace, mirando etapas y alianzas con las élites', ans: 'Robert Paxton', opts: ['Robert Paxton', 'Roger Griffin', 'Umberto Eco', 'Zeev Sternhell'] },
  { desc: 'Lo define por el mito del renacer nacional, en 1991', ans: 'Roger Griffin', opts: ['Roger Griffin', 'Robert Paxton', 'Umberto Eco', 'Cristóbal Rovira Kaltwasser'] },
  { desc: 'Definió el populismo como ideología delgada, en 2004', ans: 'Cas Mudde', opts: ['Cas Mudde', 'Andrew Heywood', 'Colin Ward', 'John Stuart Mill'] },
]);

/* ---------- ¿de qué familia es esa frase? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«Nadie sabe mejor que uno mismo lo que le conviene»', func: 'Liberalismo: la libertad en el núcleo', opts: ['Liberalismo: la libertad en el núcleo', 'Conservadurismo: reparar y no demoler', 'Socialismo: nadie se salva solo', 'Populismo: pueblo contra élite'] },
  { trans: '«Antes de derribar esa regla, averigua para qué se puso»', func: 'Conservadurismo: desconfianza de los planes perfectos', opts: ['Conservadurismo: desconfianza de los planes perfectos', 'Anarquismo: la autoridad se justifica o no manda', 'Nacionalismo colado', 'Liberalismo: la libertad en el núcleo'] },
  { trans: '«Quien nace sin pozo no nace libre, nace sediento»', func: 'Socialismo: la igualdad y la comunidad en el núcleo', opts: ['Socialismo: la igualdad y la comunidad en el núcleo', 'Liberalismo: la libertad en el núcleo', 'Fascismo: el mito del renacer', 'Conservadurismo: reparar y no demoler'] },
  { trans: '«Si el que manda no puede decir con qué derecho manda, no manda: abusa»', func: 'Anarquismo: rechazo de la autoridad que no puede justificarse', opts: ['Anarquismo: rechazo de la autoridad que no puede justificarse', 'Populismo: pueblo puro contra élite corrupta', 'Liberalismo: la libertad en el núcleo', 'Nacionalismo: la lealtad primera es la de la tierra'] },
  { trans: '«El pueblo es limpio y los de arriba están podridos, y punto»', func: 'Populismo: ideología delgada, todavía sin anfitriona', opts: ['Populismo: ideología delgada, todavía sin anfitriona', 'Socialismo: la igualdad en el núcleo', 'Anarquismo: la autoridad injustificada', 'Conservadurismo: reparar y no demoler'] },
]);

/* ---------- diagnóstico: ¿por dónde falla el recorrido del mapa? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'La hoja pone en el núcleo del liberalismo el egoísmo', characteristic: 'Es un muñeco: nadie pone un defecto en el centro de su propio ideario, y el núcleo que Mill firmaría es que nadie está en el lugar de otro adulto', opts: ['Es un muñeco: nadie pone un defecto en el centro de su propio ideario, y el núcleo que Mill firmaría es que nadie está en el lugar de otro adulto', 'Está bien: así se ve claro el problema', 'El error es citar a Mill y no a Burke', 'Falta poner la fecha del libro'] },
  { disease: 'La unidad presenta el conservadurismo como miedo al futuro', characteristic: 'Otra caricatura: su núcleo es la desconfianza de los planes perfectos y el cambio como reparación, y Burke defendió a los colonos americanos', opts: ['Otra caricatura: su núcleo es la desconfianza de los planes perfectos y el cambio como reparación, y Burke defendió a los colonos americanos', 'Está bien: es lo que todos dicen', 'El error es hablar de 1790', 'Faltaba mencionar la Revolución rusa'] },
  { disease: 'El material cita a Anderson y a Gellner como si dijeran lo mismo', characteristic: 'Son clásicos sólidos que se discuten entre sí: Anderson le objeta a Gellner que confunde inventar con falsificar, y la disputa se presenta con los dos lados nombrados', opts: ['Son clásicos sólidos que se discuten entre sí: Anderson le objeta a Gellner que confunde inventar con falsificar, y la disputa se presenta con los dos lados nombrados', 'Está bien: los dos son de 1983', 'El error es citar dos libros del mismo año', 'Faltaba escoger uno de los dos y callar al otro'] },
  { disease: 'La ficha del anarquismo lleva dibujada una bomba', characteristic: 'Es la caricatura de la familia: su núcleo es el rechazo de la autoridad que no puede justificarse, y su pregunta ha producido más cooperativas que atentados', opts: ['Es la caricatura de la familia: su núcleo es el rechazo de la autoridad que no puede justificarse, y su pregunta ha producido más cooperativas que atentados', 'Está bien: es el dibujo tradicional', 'El error es no poner también una bandera', 'Faltaba citar a Ward para justificar la bomba'] },
  { disease: 'Se aplica la lista de catorce rasgos de Eco y da positivo, y con eso se cierra el caso', characteristic: 'La lista es un ensayo y no un termómetro: basta un rasgo para que dé positivo, así que también lo da con un colegio o una familia, y para medir hacen falta Paxton o Griffin', opts: ['La lista es un ensayo y no un termómetro: basta un rasgo para que dé positivo, así que también lo da con un colegio o una familia, y para medir hacen falta Paxton o Griffin', 'Está bien: son catorce señales muy claras', 'El error es que Eco escribió en 1995 y no hoy', 'Faltaba aplicarla dos veces para confirmar'] },
  { disease: 'La casa tiene dibujadas las seis familias ajenas y ninguna propia', characteristic: 'La regla de pago sin pagar: un desenmascaramiento propio por cada uno ajeno, y con el ideario más parecido, porque un detector que no se prueba en casa no es un instrumento, es un arma', opts: ['La regla de pago sin pagar: un desenmascaramiento propio por cada uno ajeno, y con el ideario más parecido, porque un detector que no se prueba en casa no es un instrumento, es un arma', 'Con seis ajenas ya está cumplido', 'La casa no tiene familia política, así que no aplica', 'Faltaba dibujar una séptima familia ajena'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'La libertad del individuo, que no se sacrifica a ningún plan colectivo.', type: 'Núcleo del liberalismo (Mill, 1859)' },
  { s: 'La desconfianza de los planes perfectos, y el cambio como reparación.', type: 'Núcleo del conservadurismo (Burke, 1790)' },
  { s: 'La igualdad y la comunidad, con un siglo de variantes que pelean entre sí.', type: 'Núcleo del socialismo' },
  { s: 'Millones que nunca se van a conocer se piensan juntos.', type: 'La comunidad imaginada (Anderson, 1983)' },
  { s: 'Es el nacionalismo el que engendra las naciones, y no al revés.', type: 'La tesis de Gellner (1983)' },
  { s: 'El rechazo de la autoridad que no puede justificarse.', type: 'Núcleo del anarquismo (Ward, 2004)' },
  { s: 'Se define por lo que hace: etapas y alianzas con las élites.', type: 'El fascismo según Paxton (2004)' },
  { s: 'Se define por el mito del renacer nacional.', type: 'El fascismo según Griffin (1991)' },
  { s: 'Catorce rasgos de los que basta que aparezca uno.', type: 'La lista de Eco (1995): ensayo, no ciencia' },
  { s: 'El pueblo puro contra la élite corrupta, y nada más.', type: 'La ideología delgada (Mudde, 2004)' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'Andrew Heywood', gen: 'Fuente', n: 'El plano general de las siete familias', g: '«Political Ideologies», muchas ediciones', t: 'Manual académico, sólido como manual' },
  { w: 'John Stuart Mill', gen: 'Fuente', n: 'La libertad en el núcleo del liberalismo', g: '«Sobre la libertad», 1859', t: 'Clásico sólido, fuente primaria' },
  { w: 'Edmund Burke', gen: 'Fuente', n: 'El cambio como reparación y no como demolición', g: '«Reflexiones sobre la Revolución en Francia», 1790', t: 'Clásico sólido, fuente primaria' },
  { w: 'Benedict Anderson', gen: 'Fuente', n: 'La nación como comunidad imaginada', g: '«Comunidades imaginadas», 1983', t: 'Clásico sólido, y discute con Gellner' },
  { w: 'Ernest Gellner', gen: 'Fuente', n: 'El nacionalismo atado a la industrialización', g: '«Naciones y nacionalismo», 1983', t: 'Clásico sólido, y discute con Anderson' },
  { w: 'Colin Ward', gen: 'Fuente', n: 'El anarquismo completo, sin caricatura', g: '«Anarchism: A Very Short Introduction», 2004', t: 'Entrada seria' },
  { w: 'Robert Paxton', gen: 'Fuente', n: 'El fascismo por lo que hace', g: '«Anatomía del fascismo», 2004', t: 'Académico sólido' },
  { w: 'Roger Griffin', gen: 'Fuente', n: 'El fascismo por el mito del renacer nacional', g: '«The Nature of Fascism», 1991', t: 'Académico sólido, definición en disputa' },
  { w: 'Umberto Eco', gen: 'Fuente', n: 'Los catorce rasgos que calzan demasiado fácil', g: '«Ur-Fascism», 1995', t: 'Ensayo célebre: estatus de ensayo, no de ciencia' },
  { w: 'Cas Mudde', gen: 'Fuente', n: 'El populismo como ideología delgada', g: '«The Populist Zeitgeist», 2004', t: 'Académico sólido' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'Cada familia entra por su mejor ___.', opts: ['versión', 'cifra', 'época'], ans: 'versión' },
  { s: 'Mill puso la ___ en el núcleo, en 1859.', opts: ['libertad', 'nación', 'igualdad'], ans: 'libertad' },
  { s: 'Burke desconfiaba de los planes ___.', opts: ['perfectos', 'baratos', 'lentos'], ans: 'perfectos' },
  { s: 'Anderson llamó a la nación comunidad ___.', opts: ['imaginada', 'fabricada', 'heredada'], ans: 'imaginada' },
  { s: 'Gellner la ató a la ___.', opts: ['industrialización', 'religión', 'geografía'], ans: 'industrialización' },
  { s: 'El anarquismo rechaza la autoridad que no puede ___.', opts: ['justificarse', 'crecer', 'pagar'], ans: 'justificarse' },
  { s: 'Paxton define el fascismo por lo que ___.', opts: ['hace', 'dice', 'promete'], ans: 'hace' },
  { s: 'El populismo es una ideología ___.', opts: ['delgada', 'gruesa', 'antigua'], ans: 'delgada' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Por qué en este arco la regla del acero es la regla madre, y qué señal indica que el núcleo que dibujaste de una familia está mal?', ans: 'Porque esta etapa recorre el mapa político entero y cada familia entra por su mejor versión: la que sus propios militantes dirían en voz alta y con orgullo. Sin esa regla el recorrido se vuelve un desfile de ismos contados por sus enemigos, y contra una caricatura se gana todas las tardes sin haber tocado nunca al adversario real, lo que produce la ilusión de tener razón y ninguna capacidad de discutir con alguien que exista. La señal de que el dibujo salió mal es de un segundo y no es de opinión: si el núcleo que escribiste es un defecto, dibujaste un muñeco, porque nadie pone la codicia, el miedo, la envidia ni el odio en el centro de su propio ideario. Entonces la hoja se rehace, y la prueba definitiva es que alguien de esa familia lea la media página y no encuentre que le falta lo principal.' },
  { q: 'Escribe el núcleo del liberalismo, del conservadurismo y del socialismo en su mejor versión, con su fuente y su etiqueta.', ans: 'El liberalismo pone la libertad del individuo en el núcleo, y su mejor versión no es egoísta: nadie está en el lugar de otro adulto, así que nadie tiene autoridad para decidir por él lo que le conviene. Su fuente primaria es Mill, «Sobre la libertad» (1859), clásico sólido. El conservadurismo pone la desconfianza de los planes perfectos, y entiende el cambio como reparación y no como demolición, porque lo que funciona costó siglos y casi nadie sabe explicar por qué funciona. Su fuente primaria es Burke, «Reflexiones sobre la Revolución en Francia» (1790), clásico sólido, escrito mirando la Revolución cuando nadie sabía cómo iba a terminar. El socialismo pone la igualdad y la comunidad: nadie se salva solo y el punto de partida cuenta. El plano general está en Heywood, «Political Ideologies», manual académico sólido como manual, y su rasgo propio es un siglo de variantes internas que pelean entre sí más que con nadie.' },
  { q: '¿Por qué se dice que el nacionalismo es la familia que se cuela en todas las demás, y en qué se discuten Anderson y Gellner?', ans: 'Porque casi nunca viene solo: se engancha a un liberalismo, a un conservadurismo o a un socialismo y les cambia una sola cosa, que es a quién se le debe algo. Por eso dos textos con el mismo núcleo declarado pueden dar decisiones contrarias según a quién incluyan en el «nosotros». Sus dos clásicos son de 1983 y se discuten entre sí. Anderson, en «Comunidades imaginadas», dice que la nación existe porque millones que nunca se van a conocer se piensan juntos, con el periódico y el libro impreso como motor, e insiste en que imaginada no quiere decir falsa. Gellner, en «Naciones y nacionalismo», dice que la nación se fabrica y que la fabrica la industrialización, porque necesita gente móvil, alfabetizada y con una sola lengua de escuela: es el nacionalismo el que engendra las naciones y no al revés. Anderson le objetó que confunde inventar con falsificar, cuando inventar también quiere decir imaginar y crear. Los dos son clásicos sólidos y la disputa se presenta con los dos lados nombrados.' },
  { q: 'Explica el núcleo del anarquismo y por qué la caricatura de la bomba es el error más caro que se comete con esta familia.', ans: 'Su núcleo es el rechazo de la autoridad que no puede justificarse, y toda la diferencia está en la letra pequeña: no dice «de toda autoridad», dice de la que no puede justificarse. La pregunta que hace no es «¿destruimos esto?», es «¿con qué derecho manda usted aquí?», y es una pregunta que cualquiera puede contestar si tiene con qué. La caricatura de la bomba es el error más caro por dos razones. La primera es de método: convierte a la familia en un muñeco, y contra un muñeco no se aprende nada ni se discute con nadie. La segunda es de hechos: la pregunta de esta familia ha producido muchas más cooperativas que atentados, y los atentados salen en el periódico precisamente porque son raros. Su entrada seria es Colin Ward, «Anarchism: A Very Short Introduction» (2004), etiquetada como entrada seria, y Ward insistía en algo comprobable: buena parte de lo que hace funcionar un barrio ya se organiza sin que nadie mande.' },
  { q: '¿Cuándo la palabra «fascista» describe y cuándo solo escupe? Nombra las cuatro piezas del debate definicional con su etiqueta.', ans: 'Describe cuando viene con una definición que predice algo comprobable, y solo escupe cuando no viene con ninguna: entonces no dice nada del que la recibe y solo avisa a los presentes de a quién hay que morder. Las cuatro piezas del debate, con su etiqueta. Paxton, «Anatomía del fascismo» (2004), académico sólido: lo define por lo que hace y no por lo que dice, mirando las etapas y sobre todo las alianzas con las élites que le abren la puerta. Griffin, «The Nature of Fascism» (1991), académico sólido con definición en disputa: lo define por el mito del renacer nacional. Eco, «Ur-Fascism» (1995), ensayo célebre con estatus de ensayo y no de ciencia: catorce rasgos de los que basta que aparezca uno, y una lista que da positivo con casi todo no mide nada. Y Sternhell, «Ni derecha ni izquierda» (1983), tesis discutida: lo hace nacer de un cruce de nacionalismo y revisión del marxismo en la Francia de entreguerras, y el debate queda más honesto con ella dentro. La razón práctica de no gastar la palabra es sencilla: quien la usa con todo el mundo se queda sin ella el día que de verdad haga falta.' },
  { q: '¿Qué es una ideología delgada, y por qué esta etapa gira el detector hacia adentro con la regla de pago?', ans: 'Una ideología delgada es la que tiene un núcleo tan escaso que no alcanza para decidir nada por sí solo. Mudde definió así el populismo en «The Populist Zeitgeist» (2004), académico sólido: el pueblo puro contra la élite corrupta, y nada más. De ahí se sigue lo que se ve en la práctica: necesita engancharse a una familia anfitriona, de izquierda o de derecha, y por eso dos movimientos populistas pueden pedir cosas contrarias sin dejar de ser lo mismo. La segunda fuente es Mudde con Cristóbal Rovira Kaltwasser (2017), académico sólido y escrito a medias desde América Latina. El giro hacia adentro es el cuidado central del arco: diseccionar el ideario del bando contrario lo hace cualquiera y no cuesta nada, y un detector que solo se prueba con los textos de los otros no es un instrumento, es un arma. La regla de pago lo vuelve procedimiento: un desenmascaramiento propio por cada uno ajeno, y el pago se hace con el ideario MÁS PARECIDO al propio, no con el más lejano, porque con el lejano se cumple la apariencia y no el propósito.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['LIBERAL', 'SOCIAL', 'NACION', 'ANARCO', 'PUEBLO', 'FAMILIA']),
  haceSopa(10, ['MILL', 'BURKE', 'ANDERSON', 'GELLNER', 'PAXTON', 'MUDDE']),
  haceSopa(10, ['NUCLEO', 'DELGADA', 'ACERO', 'RENACER', 'IMAGINADA', 'ELITE']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'En este arco la regla del acero es la regla madre: cada familia entra por su mejor versión.', a: true },
  { q: 'Si el núcleo que dibujaste de una familia es un defecto, el dibujo está bien hecho.', a: false },
  { q: 'Mill publicó «Sobre la libertad» en 1859 y puso la libertad en el núcleo del liberalismo.', a: true },
  { q: 'Burke escribió sus «Reflexiones sobre la Revolución en Francia» en 1790.', a: true },
  { q: 'El conservadurismo, en su mejor versión, entiende el cambio como demolición.', a: false },
  { q: 'El socialismo trae un siglo de variantes internas que pelean entre sí más que con nadie.', a: true },
  { q: 'Anderson y Gellner publicaron sus libros sobre la nación el mismo año, 1983.', a: true },
  { q: 'Anderson y Gellner dicen lo mismo y se pueden citar juntos sin más.', a: false },
  { q: 'Gellner ató el nacionalismo a la industrialización.', a: true },
  { q: 'El núcleo del anarquismo es el rechazo de toda autoridad, sin excepción.', a: false },
  { q: 'Paxton define el fascismo por lo que hace, mirando las etapas y las alianzas con las élites.', a: true },
  { q: 'Griffin define el fascismo por el mito del renacer nacional, y su definición sigue en disputa.', a: true },
  { q: 'El «Ur-Fascism» de Eco (1995) se lee como ciencia comprobada y sirve de termómetro.', a: false },
  { q: 'La tesis de Sternhell (1983) es discutida, y el debate queda más honesto con ella dentro.', a: true },
  { q: 'El populismo, según Mudde, tiene un núcleo grueso que no necesita anfitriona.', a: false },
]);
B.evalMCBank = JSON.stringify([
  { q: 'La regla madre de este arco pide que…', o: ['a) Cada familia entre por su mejor versión antes de tocarla', 'b) No se critique a ninguna familia', 'c) Se estudien solo tres familias', 'd) Se cite un autor por familia'], a: 0 },
  { q: 'La señal de que dibujaste un muñeco es que el núcleo escrito…', o: ['a) Es muy largo', 'b) Es un defecto que nadie de esa familia confesaría', 'c) Cita una fecha', 'd) Está en primera persona'], a: 1 },
  { q: 'El núcleo del liberalismo, en su mejor versión, dice que…', o: ['a) Cada uno hace lo que le da la gana', 'b) El mercado nunca se equivoca', 'c) Nadie está en el lugar de otro adulto para decidir por él', 'd) El Estado no debe existir'], a: 2 },
  { q: 'Burke, en su mejor versión, desconfía de…', o: ['a) Todo cambio', 'b) La gente pobre', 'c) Los libros', 'd) Los planes perfectos que borran todo y empiezan de cero'], a: 3 },
  { q: 'El núcleo del socialismo son…', o: ['a) La igualdad y la comunidad', 'b) La nación y la tradición', 'c) La libertad y el mérito', 'd) El pueblo y la élite'], a: 0 },
  { q: 'La expresión «comunidades imaginadas» es de…', o: ['a) Gellner, en 1983', 'b) Anderson, en 1983', 'c) Paxton, en 2004', 'd) Mudde, en 2004'], a: 1 },
  { q: 'Anderson le objetó a Gellner que…', o: ['a) No citaba fuentes', 'b) Escribía demasiado corto', 'c) Confundía inventar con falsificar', 'd) Ignoraba la industrialización'], a: 2 },
  { q: 'Se dice que el nacionalismo se cuela en las demás familias porque…', o: ['a) Es el más antiguo', 'b) Nadie lo estudia', 'c) Tiene más militantes', 'd) Se engancha a otras y les cambia a quién se le debe algo'], a: 3 },
  { q: 'El núcleo del anarquismo es el rechazo de…', o: ['a) La autoridad que no puede justificarse', 'b) Toda organización posible', 'c) La cooperación entre vecinos', 'd) La propiedad, y nada más'], a: 0 },
  { q: 'La entrada seria del anarquismo en esta etapa es…', o: ['a) «Anatomía del fascismo» (2004)', 'b) Colin Ward, «Anarchism: A Very Short Introduction» (2004)', 'c) «Political Ideologies», de Heywood', 'd) «The Populist Zeitgeist» (2004)'], a: 1 },
  { q: '«Anatomía del fascismo» (2004), de Paxton, aporta…', o: ['a) El mito del renacer nacional', 'b) Los catorce rasgos', 'c) La definición por lo que hace: etapas y alianzas con las élites', 'd) La tesis del cruce francés'], a: 2 },
  { q: 'La definición del fascismo por el mito del renacer nacional es de…', o: ['a) Eco, en 1995', 'b) Sternhell, en 1983', 'c) Paxton, en 2004', 'd) Griffin, en 1991'], a: 3 },
  { q: 'La lista de catorce rasgos de Eco no sirve de termómetro porque…', o: ['a) Basta que uno aparezca, así que da positivo con casi todo', 'b) Está en otro idioma', 'c) Es demasiado corta', 'd) Nadie la ha leído'], a: 0 },
  { q: 'La tesis de Sternhell (1983) sostiene que el fascismo nació de…', o: ['a) La Revolución francesa', 'b) Un cruce de nacionalismo y revisión del marxismo en Francia', 'c) La industrialización inglesa', 'd) El liberalismo de Mill'], a: 1 },
  { q: 'Que el populismo sea una ideología delgada significa que…', o: ['a) Tiene pocos seguidores', 'b) Se escribe en textos breves', 'c) Su núcleo es tan flaco que necesita una familia anfitriona', 'd) Solo existe en un continente'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'En este arco, la regla madre es la regla del ___.', a: 'acero' },
  { q: 'Si el núcleo dibujado no lo firmaría nadie de esa familia, dibujaste un ___.', a: 'muñeco' },
  { q: 'Mill publicó «Sobre la libertad» en el año ___.', a: '1859' },
  { q: 'Burke escribió sus «Reflexiones sobre la Revolución en Francia» en ___.', a: '1790' },
  { q: 'El socialismo pone en el núcleo la igualdad y la ___.', a: 'comunidad' },
  { q: 'Anderson llamó a la nación una comunidad ___.', a: 'imaginada' },
  { q: 'Gellner ató el nacionalismo a la ___.', a: 'industrialización' },
  { q: 'Anderson y Gellner publicaron sus dos clásicos en el año ___.', a: '1983' },
  { q: 'El anarquismo rechaza la autoridad que no puede ___.', a: 'justificarse' },
  { q: 'Paxton define el fascismo por lo que ___, y no por lo que dice.', a: 'hace' },
  { q: 'Griffin lo define por el mito del ___ nacional.', a: 'renacer' },
  { q: 'El «Ur-Fascism» de Eco se lee con estatus de ___.', a: 'ensayo' },
  { q: 'La tesis de Sternhell sobre el cruce francés está ___.', a: 'discutida' },
  { q: 'El populismo es una ideología ___.', a: 'delgada' },
  { q: 'Su núcleo es el pueblo puro contra la ___ corrupta.', a: 'élite' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'John Stuart Mill (1859)', def: 'La libertad en el núcleo del liberalismo' },
  { term: 'Edmund Burke (1790)', def: 'El cambio como reparación y no como demolición' },
  { term: 'Benedict Anderson (1983)', def: 'La nación como comunidad imaginada' },
  { term: 'Ernest Gellner (1983)', def: 'El nacionalismo atado a la industrialización' },
  { term: 'Colin Ward (2004)', def: 'La entrada seria al anarquismo, sin caricatura' },
  { term: 'Robert Paxton (2004)', def: 'El fascismo por lo que hace: etapas y alianzas' },
  { term: 'Roger Griffin (1991)', def: 'El fascismo por el mito del renacer nacional' },
  { term: 'Umberto Eco (1995)', def: 'Catorce rasgos, con estatus de ensayo y no de ciencia' },
  { term: 'Zeev Sternhell (1983)', def: 'Tesis discutida: el cruce francés de entreguerras' },
  { term: 'Cas Mudde (2004)', def: 'El populismo como ideología delgada' },
  { term: 'Andrew Heywood', def: 'El plano general: manual académico sólido como manual' },
  { term: 'Ideología delgada', def: 'Un núcleo que necesita familia anfitriona' },
  { term: 'El muñeco', def: 'Un núcleo dibujado que nadie de esa familia firmaría' },
  { term: 'La regla de pago', def: 'Uno propio por cada ajeno, con el más parecido' },
  { term: 'La palabra que solo escupe', def: 'La que se usa sin definición y no predice nada' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'El borrador de la unidad de M.E.T.A.S sobre las familias políticas dice, en el renglón de una de ellas, que lo que esa gente quiere en el fondo es mandar. Se lee redondo y nadie lo objetó.' },
  { txt: 'Una fundación extranjera ofrece L 90,000 para una unidad de «educación para la democracia», con material propio que reparte las siete familias en dos grupos: las compatibles con la democracia y las otras.' },
  { txt: 'En la misma semana llaman comunista a M.E.T.A.S porque es gratuita, y fascista al autor porque exige orden en las tareas. Ninguna de las dos palabras viene con definición.' },
  { txt: 'Un colegio del barrio ofrece L 25,000 por un taller para sus maestros, con una condición escrita: que no se hable de ideologías, solo de valores.' },
  { txt: 'A Jael le toca la prueba dura: media página de la familia política que peor le cae, tan bien escrita que un militante la firmaría. El primer intento le puso como núcleo un defecto.' },
  { txt: 'En el acto del quince de septiembre, Angelly pregunta por qué se le hace un nudo con un himno de gente que no conoce. No hay oferta ni lempiras: hay una niña con la pregunta que Anderson contestó en 1983.' },
  { txt: 'Una página de memes ofrece L 15,000 por un material con la lista de catorce rasgos de Eco en tarjetas, aplicada a la política hondureña de este mes.' },
  { txt: 'Dibujando el mapa completo, el autor llega al último dibujo, que es el de esta casa, y el núcleo de M.E.T.A.S sale más parecido al liberalismo de Mill que a lo que la familia dice de sí misma.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿De qué familia es el texto o la acusación del caso, y cómo se sabe sin que se declare? Nombra la afirmación que se da por hecha y nunca se argumenta.',
  '2. Escribe su núcleo en la versión que un militante de esa familia firmaría, y di qué señal delataría que lo que escribiste es un muñeco.',
  '3. ¿Qué fuente sostiene esa descripción y qué etiqueta de estatus le toca? Si el caso toca el fascismo o el populismo, nombra las definiciones en disputa.',
  '4. ¿Qué condición escrita deja la casa, y qué familia propia se parece a esta lo bastante para que haya que dibujarla también?',
]);
B.critCaseGuides = JSON.stringify([
  'Se empieza por la familia, y no se busca por las palabras que el texto repite, porque pueblo, libertad, patria, justicia y orden las usan todas. Se busca al revés: la afirmación que el texto da por hecha y nunca defiende, como si defenderla fuera una grosería. Esa afirmación es el centro, y el centro es la familia. Después se mira si el nacionalismo viene colado, porque casi nunca viene solo y lo que cambia al engancharse es a quién se le debe algo; y si lo único que aparece es el pueblo puro contra la élite corrupta, entonces no hay casa sino puerta, y hay que buscar la familia anfitriona a la que se pegó.',
  'El núcleo se escribe en la versión que un militante firmaría, y aquí es donde la regla del acero manda por ser la regla madre de este arco: el liberalismo dice que nadie está en el lugar de otro adulto, el conservadurismo que lo que funciona costó siglos y se remienda antes de demolerse, el socialismo que nadie se salva solo y que el punto de partida cuenta, el anarquismo que la autoridad que no puede justificarse no manda sino abusa. La señal de que lo escrito es un muñeco es de un segundo: si el núcleo es un defecto (codicia, miedo, envidia, odio), nadie de esa familia lo pondría en su propio centro, y la hoja se rehace. La prueba definitiva no es de opinión: se le da a leer a alguien de esa familia y se le pregunta si le falta lo principal.',
  'Toda fuente pasa por la regla del estatus, y aquí las etiquetas están fijadas: Heywood, «Political Ideologies», manual académico sólido como manual; Mill, «Sobre la libertad» (1859), y Burke, «Reflexiones sobre la Revolución en Francia» (1790), clásicos sólidos y fuentes primarias; Anderson, «Comunidades imaginadas» (1983), y Gellner, «Naciones y nacionalismo» (1983), clásicos sólidos que se discuten entre sí, y se nombran los dos; Ward (2004), entrada seria. Si el caso toca el fascismo, entran sus cuatro piezas con su etiqueta: Paxton (2004), académico sólido, por lo que hace; Griffin (1991), académico sólido con definición en disputa, por el mito del renacer; Eco (1995), ensayo célebre y no ciencia, porque basta un rasgo de los catorce y así la lista da positivo con casi todo; y Sternhell (1983), tesis discutida. Si toca el populismo, Mudde (2004) y Mudde con Rovira Kaltwasser (2017), académicos sólidos. Los lempiras se dicen enteros, con lo que compran y con lo que piden a cambio.',
  'Todo caso termina con la condición escrita y con el pago. La condición es concreta y se puede leer: qué se publica, qué se reescribe, qué queda declarado como crítica de la casa y aparte del núcleo ajeno, y con qué textos se entrena, que son históricos o de fuera, porque a ningún político vivo del país se le reparte etiqueta y en esta etapa el cuidado es doble, ya que «fascista» y «populista» son las dos palabras más gastadas del debate diario. Y el pago no es opcional: se dibuja también la familia propia, y se dibuja con la MÁS PARECIDA y no con la más lejana, porque dibujar a la que ya disgusta es el ejercicio cómodo y casi siempre sale un muñeco sin que nadie lo note. Si en el dibujo propio aparece algo que nunca se había declarado, se escribe, y se le pone su renglón de qué evidencia lo haría cambiar; si ese renglón no existe, funciona como dogma y así se anota, con fecha.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"El núcleo de esa familia es la codicia, y con eso está dicho todo".', g1: 'Eso no es un núcleo, es un insulto ordenado. Nadie pone un defecto en el centro de su propio ideario, así que lo dibujado es un muñeco, y contra un muñeco se gana todas las tardes sin haber tocado nunca al adversario real.', g2: 'La corrección la manda la regla del acero, que en este arco es la regla madre: se rehace la hoja con el núcleo que un militante firmaría, y la prueba es dársela a leer a alguien de esa familia y preguntarle si le falta lo principal.' },
  { txt: '"Burke era un reaccionario con miedo al futuro: eso es el conservadurismo".', g1: 'La caricatura se cae con los hechos del propio Burke: defendió a los colonos americanos y pasó años persiguiendo los abusos de una compañía imperial en la India. Su desconfianza no era del cambio.', g2: 'La corrección: el núcleo es la desconfianza de los planes perfectos, y el cambio como reparación y no como demolición. Escrito así, se le puede discutir en serio, y la discusión se vuelve mucho más difícil, que es exactamente lo que se busca.' },
  { txt: '"Cito a Anderson y a Gellner juntos porque los dos explican el nacionalismo".', g1: 'Los dos son de 1983 y no se llevan bien: para Gellner la nación se fabrica y el nacionalismo trabaja con una máscara; para Anderson se imagina, y la imaginación es verdadera. Anderson le objetó justamente que confundía inventar con falsificar.', g2: 'La corrección: se citan los dos y se dice que discuten. Presentar una disputa como acuerdo es mentir en silencio, y además quien elige un lado sin conocer el otro no eligió: heredó.' },
  { txt: '"El anarquismo es la bomba: por eso no se estudia en serio".', g1: 'Su núcleo no es el rechazo de toda autoridad, sino de la que no puede justificarse, y esa letra pequeña es toda la familia. La caricatura impide ver la pregunta, que es «con qué derecho manda usted aquí».', g2: 'La corrección: entra completo, con su entrada seria (Ward, 2004), y con el hecho comprobable que desarma el dibujo: esa pregunta ha producido muchas más cooperativas que atentados, y los atentados salen en el periódico porque son raros.' },
  { txt: '"Le corrí la lista de catorce rasgos de Eco y dio positivo: caso cerrado".', g1: 'El propio Eco advierte que basta que uno de los catorce esté presente, así que la lista da positivo con un colegio, con una liga de fútbol y con la mayoría de las familias. Una lista que da positivo con casi todo no mide nada.', g2: 'La corrección: la lista se queda donde le toca, como ensayo espléndido para pensar, y para medir se usan los instrumentos hechos para eso: Paxton, por lo que hace y con qué élites se alió, o Griffin, por el mito del renacer, que además sigue en disputa.' },
  { txt: '"Ya dibujé las seis familias ajenas: la etapa está cumplida".', g1: 'Falta la que cuesta. Dibujar lo ajeno lo hace cualquiera y no cuesta nada; la etapa pide además la propia, y un detector que solo se prueba con los textos de los otros no es un instrumento, es un arma.', g2: 'La corrección es la regla de pago corriendo de verdad: un desenmascaramiento propio por cada uno ajeno, y con el ideario MÁS PARECIDO al propio, porque con el más lejano se cumple la apariencia y no el propósito.' },
]);
B.critDecisionBank = JSON.stringify([
  'El borrador de la unidad dice que esa gente «en el fondo quiere mandar»: ¿se publica, se corrige o se rehace? ¿Y qué renglón se escribe en su lugar?',
  'La fundación espera respuesta por los L 90,000: ¿se acepta el material, se acepta reescribiendo, o no se acepta? ¿Qué se reescribe exactamente?',
  'Llegaron las dos palabras, «comunista» y «fascista», sin definición: ¿se contesta, se calla, o se hace otra cosa? ¿Qué exactamente?',
  'El colegio pide un taller de L 25,000 sin hablar de ideologías: ¿se da el taller, y con qué textos se entrena para cumplir la condición sin traicionar el tema?',
  'Jael tiene su media página con un defecto en el núcleo: ¿qué se hace con esa hoja, y cómo se sabe cuándo la nueva ya sirve?',
  'Angelly pregunta por el nudo en la garganta con el himno: ¿qué se le contesta a su edad, y qué pregunta se le deja abierta después?',
  'La página de memes espera por los L 15,000 y la lista de catorce rasgos: ¿se hace el material, se hace otro, o no se hace? ¿Con qué razones?',
  'El núcleo propio salió más parecido al liberalismo de Mill que a lo que la casa dice de sí misma: ¿se escribe, se discute o se corrige? ¿Y qué renglón se le agrega?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Publicar la unidad con el núcleo de cada familia en la versión que un militante firmaría, y la crítica de la casa aparte.', b: 'Publicar la unidad con el núcleo que aplaude la mitad del barrio.', ga: 'Caso A: el niño sale sabiendo reconocer un texto real, y la crítica de la casa vale porque cae en el cuerpo y no en el aire.', gb: 'Caso B: se gana un aplauso inmediato y se pierde la mitad de las casas, y además el niño queda entrenado contra adversarios que no existen.', gr: 'Poner en pie a alguien no es darle la razón: es asegurarse de que el golpe caiga en el cuerpo real, y eso es lo único que vuelve útil la crítica.' },
  { a: 'Decir «fascista» nombrando la definición y lo que predice.', b: 'Decir «fascista» sin definición, porque el otro cae mal.', ga: 'Caso A: la palabra describe, se puede ir a comprobar si es verdad, y quien la recibe puede defenderse o quedar retratado con hechos.', gb: 'Caso B: la palabra no dice nada del otro y solo avisa a los presentes de a quién morder, y de paso pierde el filo para siempre.', gr: 'La palabra que se le pone a todo el mundo deja de servir el día en que de verdad haga falta: gastarla es desarmarse.' },
  { a: 'Estudiar el fascismo con el debate definicional entero: Paxton, Griffin, Eco con su estatus de ensayo y Sternhell como tesis discutida.', b: 'Estudiarlo con la lista de catorce rasgos, que es corta y se entiende rápido.', ga: 'Caso A: se aprende que hay una disputa real entre historiadores serios, y se sale con dos instrumentos que predicen algo comprobable.', gb: 'Caso B: se sale con un termómetro que marca fiebre en un colegio, en una liga de fútbol y en la propia casa, es decir sin termómetro.', gr: 'Una lista que da positivo con casi todo no mide nada, y un ensayo brillante sigue siendo un ensayo: el estatus de la fuente decide para qué sirve.' },
  { a: 'Pagar la regla dibujando la familia propia, que resultó parecerse al liberalismo de Mill.', b: 'Pagar la regla dibujando la familia política que peor le cae a la casa.', ga: 'Caso A: el pago cuesta y por eso sirve: es donde aparecen las premisas propias sin declarar, porque el parecido obliga a mirar de cerca.', gb: 'Caso B: se siente como pago y no lo es: dibujar a la que ya disgusta es el ejercicio cómodo, y suele salir un muñeco sin que nadie lo note.', gr: 'La regla de pago se cumple con el ideario más parecido, no con el más lejano; con el lejano se cumple la apariencia.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se escribe el núcleo de una familia con un defecto en el centro.', guide: 'Sale un muñeco: la crítica gana todas las tardes sin tocar al adversario real, los militantes de esa familia se confirman al verse mal leídos, y el alumno queda entrenado contra alguien que no existe.' },
  { cause: 'Cada familia entra por su mejor versión antes de tocarla.', guide: 'La crítica se vuelve más difícil y mucho más seria, y pasa algo medible: dos o tres objeciones viejas se caen solas porque atacaban cosas que esa familia no sostiene. Quedan menos objeciones, y las que quedan pesan.' },
  { cause: 'Se cita a Anderson y a Gellner como si estuvieran de acuerdo.', guide: 'La disputa desaparece del papel y el lector hereda un lado sin saber que había otro; y como la objeción de Anderson es precisamente sobre el punto central, lo que queda es una explicación mocha presentada como consenso.' },
  { cause: 'Se usa «fascista» sin decir con qué definición.', guide: 'La palabra deja de describir y solo avisa a quién morder, se gasta para todo el mundo, y el día en que hace falta para lo que Paxton describe ya no queda con qué decirlo.' },
  { cause: 'El nacionalismo se estudia como una familia más, y no como la que se cuela.', guide: 'Se pierde la explicación de por qué dos textos con el mismo núcleo declarado dan decisiones contrarias: la diferencia está en a quién incluye el «nosotros», y esa pieza es la que el nacionalismo cambia al engancharse.' },
  { cause: 'La casa dibuja su propia familia con el mismo mapa, y con la más parecida.', guide: 'Aparecen las premisas que nunca se declararon y de las que sin embargo salían decisiones; cada una queda escrita con su renglón de qué evidencia la haría cambiar, y el instrumento se vuelve usable fuera de esta mesa.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'La unidad se publicó con los siete núcleos escritos en su mejor versión.', guide: 'El renglón del defecto se rehizo: ninguna familia quedó con la codicia, el miedo, la envidia o el odio en el centro, y la crítica de la casa quedó aparte, con su nombre y en la misma página, para que se viera cuál era cuál.' },
  { effect: 'El material de la fundación entró reescrito, y el debate del fascismo con sus cuatro piezas.', guide: 'Las familias que el material caricaturizaba se reescribieron; el fascismo entró con Paxton, Griffin, Eco con su estatus de ensayo y Sternhell como tesis discutida; el financiador apareció con su nombre en lo que financió y el control editorial quedó entero en la casa.' },
  { effect: 'A las dos palabras sin definición no se les contestó con otra etiqueta.', guide: 'Se contestó con lo que la casa hace y con quién la paga, y se explicó la prueba de los cinco segundos: con qué definición, y qué predice. La razón no fue moral sino práctica: la palabra que se le pone a todo el mundo se queda sin filo.' },
  { effect: 'El taller del colegio se dio, y nadie salió con una etiqueta puesta.', guide: 'Se entrenó con textos históricos o de fuera, ninguna familia se nombró por su caricatura y ninguna etiqueta cayó sobre nadie vivo del país. El colegio tuvo la paz que quería, y los maestros salieron con el mapa completo.' },
  { effect: 'La media página de Jael quedó firmada por alguien de esa familia.', guide: 'El primer intento tenía un defecto en el núcleo y se rehizo. Al terminar, dos de sus objeciones viejas se cayeron solas porque atacaban cosas que esa familia no sostiene, y la que quedó pesaba el doble.' },
  { effect: 'El parecido de la casa con el liberalismo de Mill quedó escrito en el inventario de gafas.', guide: 'Con su renglón de qué evidencia lo haría cambiar: un cotejo de resultados que muestre que el estudio decidido en familia rinde menos que el decidido por cada uno. Sin ese renglón habría quedado anotado como dogma, con fecha.' },
]);

/* ---------- línea de tiempo: los siete momentos del mapa ---------- */
B.timelineData = JSON.stringify([
  { y: '1790', icon: '🏛️', label: 'Burke mira la Revolución', text: '<strong>Edmund Burke</strong> publica las <strong>«Reflexiones sobre la Revolución en Francia»</strong> cuando nadie sabía cómo iba a terminar: el núcleo del conservadurismo es la <strong>desconfianza de los planes perfectos</strong>, y el cambio como <strong>reparación y no como demolición</strong>. Etiqueta: <strong>clásico sólido, fuente primaria</strong>.' },
  { y: '1859', icon: '🕊️', label: 'Mill pone la libertad en el centro', text: 'En <strong>«Sobre la libertad»</strong>, <strong>John Stuart Mill</strong> da el argumento que no es egoísta: <strong>nadie está en el lugar de otro adulto</strong>, así que nadie tiene autoridad para decidir por él lo que le conviene. Etiqueta: <strong>clásico sólido, fuente primaria</strong>.' },
  { y: 'Un siglo', icon: '🤝', label: 'El socialismo y su pleito interno', text: 'Núcleo: <strong>la igualdad y la comunidad</strong>, porque nadie se salva solo y el punto de partida cuenta. Y su rasgo propio: <strong>un siglo de variantes internas que pelean entre sí más que con nadie</strong>. Quien no lo sabe confunde a un socialdemócrata con un leninista y no entiende a ninguno.' },
  { y: '1983', icon: '🏴', label: 'Anderson y Gellner, dos libros y un pleito', text: '<strong>Anderson</strong> («Comunidades imaginadas»): la nación existe porque <strong>millones que nunca se conocerán se piensan juntos</strong>. <strong>Gellner</strong> («Naciones y nacionalismo»): la nación <strong>se fabrica</strong>, y la fabrica la industrialización. <strong>Clásicos sólidos que se discuten entre sí</strong>, y los dos se nombran.' },
  { y: '2004', icon: '🕊️', label: 'El anarquismo, completo', text: '<strong>Colin Ward</strong>, «Anarchism: A Very Short Introduction»: <strong>entrada seria</strong>. Núcleo: el <strong>rechazo de la autoridad que no puede justificarse</strong>, y no de toda autoridad. Su pregunta <strong>ha producido más cooperativas que atentados</strong>, y la caricatura con bomba se queda fuera.' },
  { y: 'El debate', icon: '⚖️', label: 'El fascismo, en disputa', text: '<strong>Paxton (2004)</strong>, académico sólido: por lo que <strong>hace</strong>, sus etapas y las <strong>alianzas con las élites</strong>. <strong>Griffin (1991)</strong>, académico sólido con <strong>definición en disputa</strong>: el <strong>mito del renacer nacional</strong>. <strong>Eco (1995)</strong>: <strong>ensayo, no ciencia</strong>, catorce rasgos que calzan demasiado fácil. <strong>Sternhell (1983)</strong>: <strong>tesis discutida</strong>, y el debate queda más honesto con ella dentro.' },
  { y: '2004 y 2017', icon: '🪶', label: 'Mudde y la ideología delgada', text: '<strong>«The Populist Zeitgeist» (2004)</strong>: el populismo es <strong>el pueblo puro contra la élite corrupta</strong> y nada más, un núcleo tan flaco que <strong>necesita familia anfitriona</strong>, de izquierda o de derecha. Con <strong>Rovira Kaltwasser (2017)</strong>, la introducción breve <strong>escrita a medias desde América Latina</strong>. Etiqueta: <strong>académico sólido</strong>.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  familias: {
    nombre: 'Las siete familias y su núcleo', icon: '🧭',
    estructura: { title: 'Qué es', info: '• El plano de la etapa, con el <strong>núcleo de cada familia</strong><br>• Escrito como lo diría su propia gente, no su adversario<br>• Plano general: <strong>Heywood, «Political Ideologies»</strong> (manual académico sólido)' },
    funcion: { title: 'Cómo se reconoce', info: '• <strong>Liberalismo:</strong> la libertad (Mill, 1859)<br>• <strong>Conservadurismo:</strong> desconfianza de los planes perfectos (Burke, 1790)<br>• <strong>Socialismo:</strong> igualdad y comunidad, con un siglo de variantes internas' },
    enfermedades: { title: 'Dónde se cae', info: '• Contar cada familia con <strong>el resumen que hicieron sus enemigos</strong><br>• Poner un <strong>defecto en el núcleo</strong>: ahí se dibujó un muñeco<br>• Creer que reconocer autores es reconocer familias' },
    cuidados: { title: 'En esta casa', info: '• <strong>Ninguna familia entra por su caricatura</strong>: la regla del acero es la regla madre<br>• La prueba: <strong>que un militante firmaría el núcleo escrito</strong><br>• Y el último dibujo <strong>es el de esta casa</strong>' },
  },
  nacion: {
    nombre: 'El nacionalismo que se cuela', icon: '🏴',
    estructura: { title: 'Qué es', info: '• La familia que <strong>casi nunca viene sola</strong><br>• <strong>Anderson (1983):</strong> comunidad imaginada, millones que no se conocerán<br>• <strong>Gellner (1983):</strong> la fabrica la industrialización' },
    funcion: { title: 'Cómo se reconoce', info: '• Se engancha a otra familia y le cambia <strong>a quién se le debe algo</strong><br>• Pregunta clave: <strong>¿a quién incluye y a quién deja fuera ese «nosotros»?</strong><br>• Dos textos con el mismo núcleo pueden decidir al revés por esto' },
    enfermedades: { title: 'Dónde se cae', info: '• Citar a <strong>Anderson y a Gellner como si dijeran lo mismo</strong><br>• Leer «imaginada» como «falsa»: es el error que Anderson le objetó a Gellner<br>• Tratarlo como un estante y no como <strong>una humedad que pasa por todos</strong>' },
    cuidados: { title: 'En esta casa', info: '• Los dos se nombran, y <strong>se dice que discuten</strong><br>• El nudo en la garganta con un himno <strong>no es tonto ni es mentira</strong><br>• Y después viene la pregunta: <strong>a quién deja fuera</strong>' },
  },
  debate: {
    nombre: 'El debate del fascismo', icon: '⚖️',
    estructura: { title: 'Qué es', info: '• La única familia cuya <strong>definición sigue en disputa</strong> entre historiadores serios<br>• <strong>Paxton (2004):</strong> por lo que HACE, etapas y alianzas con las élites<br>• <strong>Griffin (1991):</strong> por el mito del renacer nacional' },
    funcion: { title: 'Cómo se reconoce', info: '• Con Paxton: <strong>qué hace y con qué élites se alió</strong>, y se va a comprobar<br>• Con Griffin: <strong>hay o no hay mito de renacer</strong>, y se busca en el texto<br>• Y <strong>Sternhell (1983)</strong> queda dentro como <strong>tesis discutida</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Usar la lista de <strong>catorce rasgos de Eco (1995) como termómetro</strong>: es ensayo<br>• Basta un rasgo, así que <strong>da positivo con un colegio y con tu casa</strong><br>• Y gastar la palabra: <strong>en gastándola se queda sin filo</strong>' },
    cuidados: { title: 'En esta casa', info: '• Se dice <strong>con qué definición</strong>, o no se dice<br>• Entrenamiento con <strong>casos históricos o de fuera</strong><br>• <strong>Cero etiquetas a políticos vivos del país</strong>, y aquí el cuidado es doble' },
  },
  delgada: {
    nombre: 'La ideología delgada', icon: '🪶',
    estructura: { title: 'Qué es', info: '• De <strong>Mudde («The Populist Zeitgeist», 2004)</strong>, académico sólido<br>• Núcleo completo: <strong>el pueblo puro contra la élite corrupta</strong><br>• Y nada más: por eso se llama <strong>delgada</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• No dice qué hacer con nada concreto: <strong>es puerta y no casa</strong><br>• <strong>Necesita familia anfitriona</strong>, de izquierda o de derecha<br>• Dos movimientos populistas piden lo contrario <strong>sin dejar de ser lo mismo</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Llamar populista <strong>a todo el que promete algo</strong><br>• Creer que es de un solo lado del mapa<br>• Olvidar que <strong>a veces la puerta manda más que la casa</strong>' },
    cuidados: { title: 'En esta casa', info: '• Segunda fuente: <strong>Mudde con Rovira Kaltwasser (2017)</strong>, a medias desde América Latina<br>• Se nombra la <strong>anfitriona</strong> antes de opinar<br>• Y no se le pone la palabra <strong>a nadie vivo del país</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Ve el mapa como un desfile de ismos 🎪' },
  { t: 25, n: 'Nombra el núcleo de tres familias 🧭' },
  { t: 55, n: 'Pone cada familia en su mejor versión 🛡️' },
  { t: 90, n: 'Reconoce un texto que no se declara 🔎' },
  { t: 130, n: 'Ve el nacionalismo colado en las demás 🏴' },
  { t: 165, n: 'Distingue cuándo «fascista» describe 📐' },
  { t: 190, n: 'Dibuja el mapa de las siete familias 🧬' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del mapa superado' },
  flash_master: { icon: '🃏', label: 'Los siete núcleos y sus fuentes explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de mejores versiones y muñecos' },
  id_master: { icon: '🔍', label: 'Identificador de familias sin firma maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del mapa' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta de las Gafas a la Vista completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  /* --- el cuento a la manera de Borges --- */
  { t: 'Borges', q: '¿Qué tarea le encomendó el director al narrador con el segundo cajón?', o: ['a) Repartir por familia ciento cuarenta folletos sin portada ni firma', 'b) Encuadernar los libros dañados por la humedad', 'c) Redactar el catálogo de los libros firmados', 'd) Devolverle el cajón a la viuda'], c: 0 },
  { t: 'Borges', q: '¿Por qué fracasó en tres días el método de buscar palabras?', o: ['a) Porque los folletos estaban en otro idioma', 'b) Porque todos los folletos usaban las mismas palabras', 'c) Porque no sabía leer letra de máquina', 'd) Porque el director le quitó el trabajo'], c: 1 },
  { t: 'Borges', q: '¿En qué consiste el método que el narrador descubre?', o: ['a) Buscar la palabra que más se repite', 'b) Contar las páginas de cada folleto', 'c) Buscar la afirmación que el folleto nunca argumenta', 'd) Preguntarle a la viuda por su marido'], c: 2 },
  { t: 'Borges', q: '¿Qué hizo el narrador después de que la lista de catorce rasgos de Eco diera positivo con el folleto?', o: ['a) Cerró el caso y archivó el folleto', 'b) Le escribió a Eco para preguntarle', 'c) Repitió la lista tres veces más con el mismo folleto', 'd) La aplicó al boletín parroquial, al reglamento del colegio y a un discurso, y dio positivo con los tres'], c: 3 },
  { t: 'Borges', q: '¿Qué descubre el narrador sobre el último folleto del cajón?', o: ['a) Que era suyo, escrito a los veintitrés años', 'b) Que era del marido de la viuda', 'c) Que estaba en blanco', 'd) Que lo había escrito el director de la biblioteca'], c: 0 },
  /* --- el capítulo a la manera de Cervantes --- */
  { t: 'Cervantes', q: '¿Qué ordenó don Quijote que hiciera cada uno de los siete caminantes?', o: ['a) Que se callaran hasta que dejara de llover', 'b) Que dijera lo que de veras quiere, y que después lo repitiera el que peor le cae', 'c) Que escribieran el nombre de su enemigo', 'd) Que pagaran al ventero por el ruido'], c: 1 },
  { t: 'Cervantes', q: 'Según don Quijote, ¿qué pinta el que pinta al vecino con los colores que al vecino no le gustan?', o: ['a) Un retrato exacto', 'b) Un mapa de la comarca', 'c) Un espantajo, contra el que se vence todas las tardes sin quebrar lanza', 'd) Una carta de queja'], c: 2 },
  { t: 'Cervantes', q: '¿Con qué imagen explica don Quijote a los dos que solo decían que el pueblo es limpio y los mandones sucios?', o: ['a) Que traen un pozo sin agua', 'b) Que traen una lanza sin punta', 'c) Que traen un caballo sin silla', 'd) Que traen solamente una puerta, y una puerta sin casa se cuelga de la pared del vecino'], c: 3 },
  { t: 'Cervantes', q: '¿Cómo distingue don Quijote el nombre que describe del nombre que solo escupe?', o: ['a) El que describe dice qué hace aquel a quien se pone, y se puede ir a mirar si es verdad', 'b) El que describe es más corto', 'c) El que describe lo dice un caballero y el otro un escudero', 'd) El que describe se dice en voz baja'], c: 0 },
  { t: 'Cervantes', q: '¿Qué le quiso comprar Sancho al de los mandones sucios?', o: ['a) El cántaro de vino', 'b) La puerta, si se la daban sin casa, para ponérsela a su choza', 'c) Un melón de la venta', 'd) La bandera de su aldea'], c: 1 },
  /* --- el ensayo a la manera de Harari --- */
  { t: 'Harari', q: 'Según el ensayo, ¿qué hacen las siete familias de ideas, entendidas como sistemas operativos?', o: ['a) Dicen exactamente qué pensar de cada cosa', 'b) Sustituyen a los gobiernos', 'c) Dicen qué preguntas hacer y a quién se le debe algo', 'd) Reparten el mundo en dos bandos'], c: 2 },
  { t: 'Harari', q: '¿Con qué dos textos ilustra el ensayo el pleito interno del socialismo?', o: ['a) Mill (1859) y Burke (1790)', 'b) Anderson (1983) y Gellner (1983)', 'c) Paxton (2004) y Griffin (1991)', 'd) El Manifiesto comunista de 1848 y el programa de Bad Godesberg de 1959'], c: 3 },
  { t: 'Harari', q: '¿Qué dato da el ensayo sobre los miembros de las Naciones Unidas?', o: ['a) Que en 1945 eran 51 y hoy son 193', 'b) Que en 1945 eran 100 y hoy son 200', 'c) Que siempre han sido los mismos', 'd) Que en 1983 llegaron a 51'], c: 0 },
  { t: 'Harari', q: '¿Qué dos hechos usa el ensayo para darle la razón a Paxton?', o: ['a) Dos elecciones perdidas por los fascismos', 'b) Que el rey Víctor Manuel III encargó gobierno a Mussolini en 1922 y que Hindenburg nombró canciller a Hitler el 30 de enero de 1933', 'c) Dos golpes de Estado por asalto', 'd) Dos listas de catorce rasgos'], c: 1 },
  { t: 'Harari', q: '¿Cuál es la pregunta de cinco segundos que el ensayo propone para las palabras «fascista» y «populista»?', o: ['a) Quién lo dijo primero', 'b) En qué periódico salió', 'c) Con qué definición, y qué predice', 'd) Si es de izquierda o de derecha'], c: 2 },
]);
B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: 'Mill publicó «Sobre la libertad» en el año ___.', a: '1859' },
  { t: 'las tres', q: 'Burke publicó sus «Reflexiones sobre la Revolución en Francia» en ___.', a: '1790' },
  { t: 'Borges', q: 'En el segundo cajón venían ___ folletos sin portada ni firma.', a: 'ciento cuarenta' },
  { t: 'Borges', q: 'Mill dedicó su libro a la memoria de su esposa, Harriet ___.', a: 'Taylor' },
  { t: 'Cervantes', q: 'Don Quijote mandó que cada parecer fuese defendido por su ___.', a: 'contrario' },
  { t: 'Cervantes', q: 'Sancho recuerda que por rebuznar de gracia le molieron las costillas a ___.', a: 'estacazos' },
  { t: 'Cervantes', q: 'Al final quedaron cinco hojas firmadas y ___ sin firmar.', a: 'dos' },
  { t: 'Harari', q: 'La Alianza Cooperativa Internacional contabiliza alrededor de ___ millones de cooperativas en el mundo.', a: 'tres' },
  { t: 'Harari', q: 'Umberto Eco publicó «Ur-Fascism» en el año ___.', a: '1995' },
  { t: 'Harari', q: 'El People\'s Party de los Estados Unidos se fundó en ___.', a: '1892' },
]);
B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan al mismo mapa por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento instala un método y lo instala como experiencia: alguien tiene que clasificar sin firmas, fracasa con el método obvio, descubre que hay que buscar la afirmación que nunca se argumenta, y al final se encuentra a sí mismo dentro del cajón; eso se recuerda porque incomoda. El capítulo lo vuelve escena, pleito y refrán, y añade lo que los otros dos no tienen: el procedimiento hecho cuerpo, porque cada parecer se dice en voz alta y lo repite el que peor le cae, con hojas que no valen hasta que el otro dice que las firmaría. El ensayo lo pone a escala de especie y con datos comprobables, y por eso es el único que sirve para citar en una discusión: 51 miembros de la ONU en 1945 y 193 hoy, los tres millones de cooperativas, los nombramientos de 1922 y de 1933. Quien lee solo una se queda sin el método, sin el procedimiento o sin la prueba.' },
  { q: '2. El bibliotecario del cuento y don Quijote llegan a la misma regla por caminos distintos. Formula esa regla en una frase y explica cómo la alcanza cada uno.', guia: 'La regla es la del acero, que en este arco es la regla madre: una familia solo se puede juzgar después de ponerla en pie en su mejor versión, es decir con el núcleo que sus propios militantes firmarían. El bibliotecario llega por el lado del conocimiento: necesita clasificar y descubre que la caricatura no clasifica, porque el folleto del anarquista proponía una cooperativa de panaderos y no un incendio, así que el dibujo que él traía en la cabeza no le servía para trabajar. Don Quijote llega por el lado del combate: dice que quien pinta al vecino con los colores que al vecino no le gustan no ha pintado a nadie, sino un espantajo, y que contra un espantajo se vence todas las tardes sin quebrar lanza. Uno la necesita para entender y el otro para pelear, y eso es lo interesante: la misma regla sirve al que quiere saber y al que quiere ganar, y por eso no depende de la buena voluntad de nadie.' },
  { q: '3. El cuento dice que «el nacionalismo no era un estante, era una humedad que había pasado por todos los estantes». Traduce la imagen al vocabulario de la etapa y da un ejemplo.', guia: 'Traducida: el nacionalismo casi nunca funciona como familia autónoma, sino como pieza que se engancha a otras familias y les cambia una sola cosa, que es a quién se le debe algo, es decir a quién incluye el «nosotros». Por eso los folletos nacionalistas del cajón no formaban una sola pila: unos suponían el individuo y otros suponían la comunidad, y esos supuestos son núcleos de familias distintas. El ejemplo puede ser cualquiera que tenga las dos piezas, la familia anfitriona y la frontera del nosotros: un programa que defiende la libertad de emprender pero solo para los nacidos aquí, o un programa que defiende el reparto de la tierra pero solo entre los del pueblo. Las dos frases se leen distinto según a quién dejan fuera, y ninguna de las dos se entiende si no se ve la humedad. La consecuencia práctica es que hay que hacer dos preguntas y no una: qué familia es, y a quién incluye.' },
  { q: '4. ¿Por qué el bibliotecario le aplica la lista de Eco al boletín parroquial y al reglamento del colegio? Explica qué demuestra ese experimento y qué se salva de Eco.', guia: 'Se la aplica por sospecha de sí mismo, y ese es el punto: acaba de obtener el resultado que quería y decide probar el instrumento donde no debería sonar. Suena igual. El experimento demuestra que la lista no discrimina, y la razón la da el propio Eco al advertir que basta que uno de los catorce rasgos esté presente: con ese umbral, casi cualquier institución humana da positivo, y un instrumento que da positivo con casi todo no informa de nada, aunque cada uno de sus catorce puntos sea agudo por separado. Lo que se salva de Eco es exactamente lo que es: un ensayo espléndido para pensar la familia, con observaciones que ayudan a mirar. Lo que no se salva es su uso como termómetro o como prueba en una acusación. Y de ahí la conducta correcta del cuento: guardar la lista y usar los instrumentos hechos para medir, Paxton por lo que hace y con qué élites se alió, o Griffin por el mito del renacer, con su definición en disputa declarada.' },
  { q: '5. En el capítulo, cinco caminantes «traen casa» y dos «traen solamente una puerta». Explica la distinción con el vocabulario de Mudde y di por qué don Quijote advierte que la puerta a veces manda más que la casa.', guia: 'La casa es una ideología con núcleo suficiente para decidir cosas concretas: liberalismo, conservadurismo, socialismo, nacionalismo y anarquismo dicen algo sobre el trigo y sobre el pozo. La puerta es una ideología delgada, como Mudde definió el populismo en 2004: el pueblo puro contra la élite corrupta y nada más, un núcleo tan escaso que no alcanza para gobernar y por eso necesita engancharse a una familia anfitriona, de izquierda o de derecha. El capítulo lo demuestra con el interrogatorio: preguntados si son de moler trigo o de venderlo, y si el pozo ha de ser del concejo o del dueño, los dos de la puerta no saben. La advertencia de que la puerta manda más que la casa es la parte fina y evita leer «delgada» como «inofensiva»: quien controla quién entra y quién queda fuera del pueblo puro decide antes que cualquier programa, porque decide con quién se discute. Delgada describe el contenido del núcleo, no su fuerza.' },
  { q: '6. El ensayo afirma que en ochenta años «la especie no creció: se dividió en más nosotros». Defiende esa lectura con el dato de la ONU y explica qué le añade Gellner y qué le añade Anderson.', guia: 'La lectura se defiende con la cifra: las Naciones Unidas se fundaron en 1945 con 51 miembros y hoy tienen 193, así que el número de unidades políticas que se reclaman nación se multiplicó casi por cuatro en ochenta años, sin que apareciera ningún continente nuevo. Es decir que lo que cambió no fue el mundo sino el trazado de los «nosotros». Gellner le añade el mecanismo y lo pone del lado de la función: una economía industrial necesita gente móvil, alfabetizada y con una sola lengua de escuela, así que la nación se fabrica, y es el nacionalismo el que engendra las naciones y no al revés. Anderson le añade el material y lo pone del lado de la imaginación: millones de personas que nunca se van a conocer se piensan juntas, con el periódico y el libro impreso como motor, e insiste en que imaginada no quiere decir falsa; de hecho le objetó a Gellner que confundía inventar con falsificar. Las dos mitades hacen falta: Gellner explica por qué apareció el molde y Anderson por qué la gente cabe adentro y llora con el himno.' },
  { q: '7. El capítulo dice que los nombres graves «en gastándolos se quedan sin filo». Explica la advertencia con el ancla real del rebuzno y con la razón práctica de esta etapa.', guia: 'La advertencia es que una palabra usada para todo deja de significar algo, y por tanto deja de servir cuando de verdad hace falta. El ancla real está declarada en la tarjeta y viene del propio Quijote: en el cuento del rebuzno, dos aldeas llegan a las armas con banderas y pendones por el apodo de «rebuznadores», y Sancho, por rebuznar para demostrar su habilidad, recibe una paliza a estacazos. Un apodo de burlas basta para juntar ejércitos, y no porque describa nada, sino porque marca a quién hay que morder. La razón práctica de esta etapa es la misma y no es moral: «fascista» y «populista» son las dos palabras más gastadas del debate diario, y quien le dice fascista al que le exige puntualidad se queda sin palabra el día en que aparezca lo que Paxton describe. La conducta correcta es de una línea: se dice con qué definición y qué predice, o no se dice; y no se le pone a nadie vivo del país, porque el entrenamiento va con textos históricos o de fuera.' },
  { q: '8. El bibliotecario dice que no cambió de estante su propio folleto y que esa es la única virtud que se atribuye. ¿Por qué es ese gesto el centro del cuento, y cómo se relaciona con la regla de pago de la casa?', guia: 'Porque es el único momento en que el instrumento se vuelve contra su dueño y no lo pierde. Un detector se puede usar de dos maneras que se ven iguales por fuera: como instrumento, si funciona igual en las dos direcciones, y como arma, si solo suena hacia afuera. El bibliotecario había clasificado ciento treinta y nueve folletos ajenos sin costo alguno, y el ciento cuarenta le costó su propia imagen de veinte años; dejarlo en su sitio es lo que valida todo lo anterior, porque prueba que el método no estaba calibrado para darle la razón. La regla de pago de la casa es esa misma exigencia convertida en procedimiento: un desenmascaramiento propio por cada uno ajeno, y con un detalle que la hace difícil, que el pago se hace con el ideario más parecido al propio y no con el más lejano, porque con el lejano se cumple la apariencia y no el propósito. Don Quijote lo dice con las mismas palabras en el camino: escribe una hoja tuya por cada hoja ajena, y del que más se te parece.' },
  { q: '9. El ensayo llama a las familias «sistemas operativos» y el cuento las llama «estantes». Compara las dos metáforas: qué acierta cada una y dónde falla.', guia: 'La metáfora del sistema operativo acierta en la función: dice que una familia no da opiniones sueltas sino que fija qué preguntas se hacen y a quién se le debe algo, es decir que trabaja por debajo de las posiciones concretas, y eso explica por qué dos personas con el mismo dato deciden distinto. Falla en que sugiere un programa cerrado y estable, cuando el socialismo tiene un siglo de variantes internas que pelean entre sí y el fascismo no tiene ni definición acordada. La metáfora del estante acierta en lo contrario: es la del que tiene que decidir dónde va cada texto real, con las manos, y de ahí sale el hallazgo del cuento, que el nacionalismo no es un estante sino una humedad, y que once folletos no encuentran estante porque son demasiado flacos para andar solos. Falla en que un estante es exterior al libro y da a entender que la familia es una etiqueta que se pone desde fuera. Juntas dicen la verdad: por dentro funciona como sistema, y por fuera hay que clasificarla a mano y aceptar que algunas casillas no cierran.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué esa etiqueta pertenece al temario de esta etapa en particular, y qué pasaría si se quitara.', guia: 'Porque esta etapa enseña a reconocer una familia en un texto que no se declara, y un pastiche sin declarar es exactamente un texto que no se declara, pero en el peor de los sentidos: no esconde su familia, esconde su autoría, y con ella la autoridad que el lector le concede. Enseñar a exigir la firma y no firmar sería la contradicción más rápida posible. Hay además una razón propia de esta etapa: la voz es una manera de ganar sin argumentos, porque una tesis suena más verdadera dicha con la prosa de Borges o con el periodo de Cervantes, y la etiqueta obliga al lector a separar lo que convence por razón de lo que convence por timbre, que es la misma separación que hay entre un núcleo dibujado y un muñeco bien escrito. Si se quitara, pasarían dos cosas comprobables: alguien citaría a Anderson, a Paxton o a Mudde a través de una frase que ninguno escribió, y la casa quedaría produciendo el tipo de fuente inflada que su propio compendio manda cazar.' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_gafas_familias_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena la mejor versión, la etiqueta de la fuente y la regla de pago. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se nombra la familia, y no se busca por las palabras que el texto repite (pueblo, libertad, patria, justicia y orden las usan todas) sino por la afirmación que el texto da por hecha y nunca argumenta: esa afirmación es el centro, y el centro es la familia. Después se escribe su núcleo en la versión que un militante firmaría, porque en este arco la regla del acero es la regla madre, y hay una señal de un segundo para saber si salió mal: si el núcleo escrito es un defecto, nadie de esa familia lo pondría en su propio centro, así que se dibujó un muñeco y la hoja se rehace. Se mira además si el nacionalismo viene colado, porque casi nunca viene solo y lo que cambia es a quién se le debe algo; y si lo único que aparece es el pueblo puro contra la élite corrupta, se busca la familia anfitriona, porque eso es una ideología delgada y no una casa. Luego pasan las fuentes por la regla del estatus, con fecha y etiqueta: Heywood como manual académico sólido, Mill 1859 y Burke 1790 como clásicos sólidos y fuentes primarias, Anderson y Gellner (los dos de 1983) como clásicos sólidos que se discuten entre sí y por tanto los dos nombrados, Ward 2004 como entrada seria, Paxton 2004 como académico sólido, Griffin 1991 como académico sólido con definición en disputa, Eco 1995 con estatus de ensayo y no de ciencia, Sternhell 1983 como tesis discutida, y Mudde 2004 y 2017 como académico sólido; y los lempiras se dicen enteros, con lo que compran y con lo que piden a cambio. Y al final se escribe la condición y se paga la regla: el entrenamiento va con textos históricos o de fuera y a ningún político vivo del país se le reparte etiqueta, con cuidado doble porque fascista y populista son las dos palabras más gastadas del debate diario; y se dibuja también la familia propia, con la MÁS PARECIDA y no con la más lejana, porque un detector que solo se prueba con los textos de los otros no es un instrumento, es un arma.";');

/* ---------- lo que arrastra el molde (la etapa 2 de las Gafas) ---------- */
const textos = [
  [/🔬 \*Ruta de las Gafas a la Vista · Etapa 2\* 🔬\\n\\nEl bisturí de Freeden: núcleo, adyacentes y periferia\. Un ideario no es una lista de opiniones: es una estructura que se puede dibujar\. 🔬\\n\\n_Incluye evaluación conceptual, el ideario en la mesa, guion de video, tres lecturas y sus 35 preguntas\._ ✍️/g,
    '🧬 *Ruta de las Gafas a la Vista · Etapa 3* 🧬\\n\\nEl mapa de las familias: siete familias, siete núcleos, y ninguna entra por su caricatura. 🧬\\n\\n_Incluye evaluación conceptual, la familia en la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/El bisturí de Freeden/g, 'El mapa de las familias'],
  [/El ideario en la mesa/g, 'La familia en la mesa'],
  [/el ideario en la mesa/g, 'la familia en la mesa'],
  [/Etapa 2 de la Ruta de las Gafas a la Vista/g, 'Etapa 3 de la Ruta de las Gafas a la Vista'],
  [/Ruta de las Gafas a la Vista · Etapa 2 de 7/g, 'Ruta de las Gafas a la Vista · Etapa 3 de 7'],
  /* este venía en el encabezado de las dos pruebas imprimibles, y es el que
     se le escapó al primer grep de la etapa 2: no dice «de 7» sino
     «· Estudio Mayor» */
  [/Ruta de las Gafas a la Vista · Etapa 2 · Estudio Mayor/g, 'Ruta de las Gafas a la Vista · Etapa 3 · Estudio Mayor'],
  [/const msgs=\['¡Sigue afilando el bisturí!','¡Muy buen trabajo!','¡Aprendiz de anatomista!','¡Ya distingues núcleo de periferia!','¡Dibujas idearios en una página!'\]/,
    "const msgs=['¡Sigue recorriendo el mapa!','¡Muy buen trabajo!','¡Aprendiz de cartógrafo!','¡Ya distingues la mejor versión del muñeco!','¡Dibujas las siete familias sin caricatura!']"],
  [/\['#0f766e','#2dd4bf','#a8a29e','#475569','#00b894'\]/, "['#78350f','#d97706','#a8a29e','#3f6212','#00b894']"],
  /* el sepia de atlas y el oliva en las pruebas y en las hojas imprimibles */
  [/#0f766e/g, '#78350f'],
  [/#0b4f4a/g, '#4a1f09'],
  [/#f0fdfa/g, '#fdf3e7'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/Su significado no queda cerrado nunca\./g, 'La libertad del individuo, que no se sacrifica a ningún plan colectivo.'],
  [/>Concepto esencialmente disputado \(Gallie, 1956\)</g, '>Núcleo del liberalismo (Mill, 1859)<'],
  /* las preguntas fijas de la prueba competencial preguntaban por el bisturí */
  [/¿Qué concepto disputado aparece en el caso y cómo lo descontesta el texto, y cómo queda su morfología en tres capas\? Explica qué fuente necesita su etiqueta, la condición escrita que deja la casa y qué morfología propia hay que dibujar para pagar la regla\./g,
    '¿De qué familia es el texto del caso y cómo se sabe sin que se declare, y cuál es su núcleo en la versión que un militante firmaría? Explica qué fuente lo sostiene con su etiqueta de estatus, la condición escrita que deja la casa y qué familia propia hay que dibujar para pagar la regla.'],
  [/1\. ¿Cuál de los dos dibuja la estructura y cuál solo cuenta puntos\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos pone en pie la mejor versión y cuál dibuja un muñeco? 2. ¿Por qué no son la misma decisión?'],
  /* el subtítulo del pliego de las tres lecturas, que arrastraba «expediente» */
  [/Un cuento, un capítulo de caballerías y un ensayo, sobre el mismo expediente/g,
    'Un cuento, un capítulo de caballerías y un ensayo, sobre el mismo mapa de familias'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'La palabra que no se deja cerrar',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'El cajón de los siete sin firma',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'De la libertad que pedían dos, siendo dos libertades',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'De cómo cada parecer fue defendido por su contrario',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'La palabra que firmaron todos',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'Siete sistemas operativos para una sola especie',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa 2 era la página de «quiénes somos». Aquí es la
   unidad que describe a una familia: dejarla con el núcleo que aplaude (un
   muñeco) o reescribirla en la mejor versión que un militante firmaría. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(acero){sfx(acero?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(acero){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🛡️</span><span class="ms-text"><strong>El núcleo quedó reescrito en su mejor versión:</strong> la frase que un militante de esa familia diría en voz alta y con orgullo, y la crítica de la casa aparte, con su nombre, en la misma página para que se vea cuál es cuál.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">⚖️</span><span class="ms-text"><strong>Y entonces pasó lo que tenía que pasar:</strong> la crítica se volvió más difícil y mucho más seria, y dos objeciones viejas se cayeron solas porque atacaban cosas que esa familia no sostiene. Poner en pie no es dar la razón: es que el golpe caiga en el cuerpo real.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🎭</span><span class="ms-text"><strong>Quedó publicado un muñeco:</strong> un defecto en el centro de un ideario ajeno, que nadie de esa familia firmaría. Se lee redondo, aplaude la mitad del barrio y no describe a nadie que exista.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega en dos partes:</strong> se pierden las casas donde esa familia se vota, y el niño queda entrenado para ganarle todas las tardes a un adversario que no existe. La hoja se rehace en su mejor versión.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='familias',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"familias\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/🔬/g, '🧬');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
