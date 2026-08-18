/* Inyecta los bancos de la misión «El hombre máquina y la base material»
   (Ruta de los Átomos y los Ídolos, etapa 2: Materialismo Filosófico,
   materia 23 del Estudio Mayor) sobre el molde copiado de la etapa 3 de la
   Ruta de las Gafas a la Vista, que es la misión más reciente y completa.
   Uso:  node _dev/inyecta-bancos-hombre-maquina.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · La Mettrie, «El hombre máquina» (1747): CLÁSICO SÓLIDO COMO DOCUMENTO
       DE SU TIEMPO. La etiqueta se dice entera porque es media lección: su
       fisiología está superada, su gesto no.
     · Marx, «Prólogo a la Contribución a la crítica de la economía
       política» (1859): CLÁSICO CUESTIONADO, tesis potente citada aquí con
       sus críticas. Es el texto donde está el verbo que ordena la etapa:
       CONDICIONA, que no es «determina».
     · Marx y Engels, «La ideología alemana» (escrita en 1845 y 1846,
       publicada entera en 1932): CLÁSICO CUESTIONADO.
     · Engels, carta a Joseph Bloch del 21 de septiembre de 1890: el
       documento que niega el determinismo DESDE DENTRO.
     · Popper, «La miseria del historicismo» (1957): LA CRÍTICA CLÁSICA, la
       que nombra el mecanismo de la inmunización.
     · G. A. Cohen, «La teoría de la historia de Karl Marx: una defensa»
       (1978): DEFENSA ANALÍTICA SERIA, para no quedarse con la caricatura
       de ningún bando.

   La idea que ordena todos los bancos: la misma pregunta de la etapa 1
   (¿de qué está hecho y qué lo sostiene?) subida dos escalones, primero al
   cuerpo y después a la sociedad. Y la distinción que es toda la etapa:
   CONDICIONAR NO ES DETERMINAR. El agua mueve los mazos del batán y sin
   agua no hay golpe, pero el agua no elige qué paño se pone debajo.

   Tres cuidados del compendio gobiernan la misión. Uno: las críticas van AL
   LADO de la tesis y no en nota al pie, así que Popper, las profecías
   falladas y Cohen entran con ella. Dos: el modo de fallar tiene nombre y
   se entrena de frente, el REDUCCIONISMO DE BROCHA GORDA, ese que ve dinero
   detrás de cada frase y con eso deja de ver nada. Tres: se audita la
   institución y no se desprecia a la gente que vive dentro de ella,
   empezando por la propia casa, y se dice en voz alta qué sobrevive entero
   a la auditoría, porque esto no es un ácido universal.               */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-atomos-hombre-maquina', 'js', 'hombre-maquina.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260820;
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
  { w: '«El hombre máquina» (1747)', a: '⚙️ De <strong>Julien Offray de La Mettrie</strong>, publicado sin firma en Leiden: <strong>si el estado del cuerpo cambia lo que uno piensa, el que piensa es el cuerpo</strong>. Etiqueta: <strong>clásico sólido como documento de su tiempo</strong>, y la etiqueta va entera: su fisiología está superada, su gesto no.' },
  { w: 'De dónde le vino la idea a La Mettrie', a: '🤒 Él mismo lo contó: durante una <strong>fiebre</strong> notó que su cabeza iba más lenta, y le pareció que ese detalle valía más que un tratado. Lo condenaron, salió de Francia, salió de Holanda, y murió en <strong>Berlín en 1751</strong> bajo la protección de Federico II de Prusia.' },
  { w: 'Phineas Gage (1848)', a: '🚂 Capataz de ferrocarril en Vermont: una barra de hierro le atravesó la cabeza, <strong>sobrevivió</strong>, y sus médicos describieron un cambio en su carácter. Con su etiqueta: <strong>los relatos más novelescos han sido corregidos por los historiadores</strong>. Lo que queda: se le tocó el cerebro y cambió la persona.' },
  { w: 'El prólogo de 1859', a: '🏗️ <strong>Marx, «Prólogo a la Contribución a la crítica de la economía política»</strong>: el modo en que una sociedad produce su vida material <strong>condiciona</strong> su vida social, política e intelectual. Etiqueta: <strong>clásico cuestionado</strong>, tesis potente citada con sus críticas.' },
  { w: 'El verbo que ordena la etapa', a: '🔤 <strong>Condiciona.</strong> Marx no escribió «dicta» ni «decide». La versión dura, la que dice que la base <strong>determina</strong> punto por punto lo que la gente cree, es un endurecimiento posterior, y es justo la que la historia apaleó.' },
  { w: '«La ideología alemana»', a: '📚 De <strong>Marx y Engels</strong>, escrita en <strong>1845 y 1846</strong> y publicada entera hasta <strong>1932</strong>. De aquí la fórmula famosa: <strong>las ideas dominantes de una época son las ideas de la clase dominante</strong>. Etiqueta: <strong>clásico cuestionado</strong>.' },
  { w: 'La base', a: '🧱 Cómo se produce y se reparte lo que hace falta para vivir. En la escala de andar por casa: <strong>de qué vive de verdad</strong> una escuela, una radio, una iglesia o esta misma casa, con números si se pueden.' },
  { w: 'Lo que se levanta encima', a: '🏛️ Las leyes, las costumbres, la moral, las ideas y <strong>lo que se da por obvio</strong>. La pregunta práctica que la revela: <strong>qué frase no se puede decir ahí adentro sin que a alguien le cueste dinero</strong>.' },
  { w: 'Condicionar', a: '🎲 <strong>La base carga los dados.</strong> No dice qué número va a salir; dice que unos salen mucho más seguido que otros, y por qué. Es la versión que sigue viva y la que esta etapa entrega.' },
  { w: 'Determinar', a: '🎯 <strong>La base dicta todo</strong>, y de las condiciones materiales se deduce lo que la gente va a creer y cuándo. Está <strong>apaleada por la historia</strong>: las profecías fallaron con fechas y hay demasiadas excepciones que explicar.' },
  { w: 'El batán, la imagen de la etapa', a: '💧 El agua del río mueve los mazos que golpean el paño: <strong>sin agua no hay golpe</strong>. Pero <strong>el agua no decide qué paño se pone debajo, ni de qué color, ni para quién</strong>. Confundir las dos cosas es creer que se sabe el resultado cuando solo se sabe la corriente.' },
  { w: 'La prueba de una línea', a: '✅ Ante cualquier explicación material: <strong>¿qué tendría que pasar para que esto fuera falso?</strong> Si hay respuesta, estás condicionando. Si no hay ninguna, no estás explicando: estás repartiendo culpas con vocabulario técnico.' },
  { w: 'La inmunización (Popper, 1957)', a: '🛡️ De <strong>«La miseria del historicismo»</strong>, <strong>la crítica clásica</strong>: la tesis se reinterpreta cada vez que falla, y así queda a salvo de cualquier hecho. <strong>Una explicación que gana siempre ha dejado de explicar.</strong>' },
  { w: 'La carta de Engels a Bloch (1890)', a: '✉️ Del <strong>21 de septiembre de 1890</strong>: Engels escribe que ni él ni Marx afirmaron nunca que lo económico fuera el <strong>único</strong> factor determinante, y añade que si los jóvenes cargan tanto ese lado, <strong>la culpa es en parte de ellos dos</strong>. La objeción más fuerte contra el determinismo la firmó Engels.' },
  { w: 'G. A. Cohen (1978)', a: '⚖️ <strong>«La teoría de la historia de Karl Marx: una defensa»</strong>, <strong>defensa analítica seria</strong>. Enseñó a sostener la parte defendible con argumentos limpios y a soltar la que no lo es, que es lo único que se puede llamar defender.' },
  { w: 'El reduccionismo de brocha gorda', a: '🖌️ El modo de fallar de esta materia: <strong>ver dinero detrás de cada frase</strong> y creer que con eso se entendió algo. Tres señales: <strong>explica todo, no pide pruebas y salta del interés al insulto</strong>. Se entrena de frente porque es el error que se comete primero.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Qué sostiene La Mettrie en «El hombre máquina» (1747)?', o: ['a) Que si el cuerpo cambia lo que se piensa, el que piensa es el cuerpo', 'b) Que el alma gobierna la materia', 'c) Que las máquinas van a pensar', 'd) Que la fiebre no afecta al juicio'], c: 0 },
  { q: 'La etiqueta de La Mettrie en esta casa dice que…', o: ['a) Su fisiología sigue vigente', 'b) Su fisiología está superada y su gesto no', 'c) Es divulgación con inflado', 'd) Es una tesis en disputa'], c: 1 },
  { q: 'El verbo exacto que Marx escribió en el prólogo de 1859 es…', o: ['a) Determina', 'b) Dicta', 'c) Condiciona', 'd) Impone'], c: 2 },
  { q: '«Las ideas dominantes de una época son las ideas de la clase dominante» viene de…', o: ['a) La carta a Bloch', 'b) «La miseria del historicismo»', 'c) El libro de Cohen', 'd) «La ideología alemana»'], c: 3 },
  { q: 'Decir que la base condiciona significa que…', o: ['a) Carga los dados: hace unas ideas mucho más probables que otras', 'b) Decide punto por punto lo que cada quien piensa', 'c) No influye en nada', 'd) Solo influye en los pobres'], c: 0 },
  { q: '¿Qué le pasó a la versión determinista de la tesis?', o: ['a) Nunca se enunció', 'b) La historia la apaleó: las profecías fallaron con fechas', 'c) Fue confirmada en 1917', 'd) Cohen la defendió entera'], c: 1 },
  { q: 'La inmunización que denunció Popper en 1957 consiste en…', o: ['a) Refutar una teoría con datos', 'b) Publicar sin firma', 'c) Reinterpretar la tesis cada vez que falla, hasta que nada la desmienta', 'd) Repetir un experimento'], c: 2 },
  { q: 'En su carta a Bloch de 1890, Engels dice que…', o: ['a) Marx tenía toda la razón sin matices', 'b) Lo económico decide todo', 'c) La historia no se puede estudiar', 'd) Ni él ni Marx dijeron que lo económico fuera el único factor'], c: 3 },
  { q: 'G. A. Cohen entra en esta etapa como…', o: ['a) Defensa analítica seria de la parte defendible', 'b) El crítico más duro de Marx', 'c) Un divulgador con inflado', 'd) Una fuente primaria del siglo XIX'], c: 0 },
  { q: 'El reduccionismo de brocha gorda es…', o: ['a) Leer las fuentes originales', 'b) Ver dinero detrás de cada frase y creer que con eso se explicó algo', 'c) Auditar con números', 'd) Citar a Popper y a Cohen juntos'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Condiciona', 'Determina'],
    headA: '🎲 Condiciona: carga los dados',
    headB: '🎯 Determina: la versión apaleada',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Sin capital inicial la misma decisión cuesta distinto»', t: 'ok' },
      { w: '«Sabiendo su sueldo, sé lo que va a votar»', t: 'no' },
      { w: '«En esa radio esa frase le cuesta un anunciante»', t: 'ok' },
      { w: '«Todo lo que dice un cura lo dice por la limosna»', t: 'no' },
      { w: '«El turno de noche hace más difícil sostener esa idea»', t: 'ok' },
      { w: '«La revolución tenía que ocurrir en el país más industrializado»', t: 'no' },
      { w: '«Quien vive del alquiler tiende a defender esa ley»', t: 'ok' },
      { w: '«Si es empresario, ya sé todo lo que piensa»', t: 'no' },
    ],
  },
  {
    label: ['Auditoría', 'Brocha gorda'],
    headA: '🔍 Auditoría: relación y prueba',
    headB: '🖌️ Brocha gorda: intención supuesta',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Tres programas los paga la misma cooperativa»', t: 'ok' },
      { w: '«Lo dice porque le pagan»', t: 'no' },
      { w: '«Se vería si alguien dijera lo contrario en ese micrófono»', t: 'ok' },
      { w: '«Todos los que hablan de valores están comprados»', t: 'no' },
      { w: '«El colegio vive de mensualidades, y aquí están los montos»', t: 'ok' },
      { w: '«Ese maestro no cree ni una palabra de lo que enseña»', t: 'no' },
      { w: '«Esta casa vive del ingreso familiar y de horas de la noche»', t: 'ok' },
      { w: '«Si defiende eso, es porque algo saca»', t: 'no' },
    ],
  },
  {
    label: ['La base', 'Lo que se levanta encima'],
    headA: '🧱 La base: de qué vive',
    headB: '🏛️ Encima: ideas, reglas, lo obvio',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La pauta de tres anunciantes', t: 'ok' },
      { w: '«Aquí se respeta a los patrocinadores»', t: 'no' },
      { w: 'Las mensualidades de las familias', t: 'ok' },
      { w: '«Nuestro método es el mejor del país»', t: 'no' },
      { w: 'El salón prestado y las llaves', t: 'ok' },
      { w: '«De eso mejor no se habla aquí»', t: 'no' },
      { w: 'Las horas de la noche del autor', t: 'ok' },
      { w: '«Con esfuerzo, cualquiera puede»', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Es de otra etapa o de otra materia'],
    headA: '⚙️ Se estudia en esta etapa',
    headB: '🏠 Es de otra etapa o materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La Mettrie y el cuerpo que explica al que piensa', t: 'ok' },
      { w: 'Qué se siente ser un murciélago', t: 'no' },
      { w: 'El prólogo de 1859 y la palabra «condiciona»', t: 'ok' },
      { w: 'Los tres géneros de materia y la symploké', t: 'no' },
      { w: 'La carta de Engels a Bloch de 1890', t: 'ok' },
      { w: 'El mito de la cultura y el mito de la felicidad', t: 'no' },
      { w: 'El reduccionismo de brocha gorda y sus señales', t: 'ok' },
      { w: 'El tetrafármaco y los dos miedos de Epicuro', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['La', 'Mettrie', 'publicó', 'su', 'libro', 'en', '1747.'], c: 6, art: 'El año de «El hombre máquina»' },
  { s: ['Si', 'la', 'fiebre', 'cambia', 'el', 'pensamiento,', 'piensa', 'el', 'cuerpo.'], c: 8, art: 'Lo que resulta ser el que piensa' },
  { s: ['Marx', 'escribió', 'que', 'la', 'base', 'condiciona.'], c: 5, art: 'El verbo exacto del prólogo de 1859' },
  { s: ['La', 'versión', 'que', 'determina', 'quedó', 'apaleada.'], c: 3, art: 'La versión que la historia apaleó' },
  { s: ['El', 'agua', 'mueve', 'los', 'mazos', 'del', 'batán.'], c: 1, art: 'Lo que mueve los mazos, y no elige el paño' },
  { s: ['Popper', 'la', 'acusó', 'de', 'inmunizarse', 'en', '1957.'], c: 4, art: 'El mecanismo que denunció Popper' },
  { s: ['Engels', 'escribió', 'la', 'carta', 'a', 'Bloch.'], c: 0, art: 'Quién firmó la carta de 1890' },
  { s: ['Cohen', 'hizo', 'una', 'defensa', 'analítica', 'seria.'], c: 3, art: 'Lo que hizo Cohen en 1978' },
]);

/* ---------- completa la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'La Mettrie publicó «El hombre máquina» en ___.', opts: ['1747', '1859', '1890'], c: 0 },
  { s: 'Marx escribió que la base ___ la vida intelectual.', opts: ['dicta', 'condiciona', 'ignora'], c: 1 },
  { s: 'La versión que dice que la base lo ___ todo está apaleada.', opts: ['sostiene', 'explica', 'determina'], c: 2 },
  { s: 'El agua mueve los mazos, pero no elige el ___.', opts: ['paño', 'río', 'molino'], c: 0 },
  { s: 'Popper acusó a la tesis dura de ___.', opts: ['copiar', 'inmunizarse', 'exagerar'], c: 1 },
  { s: 'La carta de Engels a Bloch es de ___.', opts: ['1848', '1867', '1890'], c: 2 },
  { s: 'Cohen hizo en 1978 una defensa ___ seria.', opts: ['analítica', 'poética', 'militante'], c: 0 },
  { s: 'Ver dinero detrás de cada frase es el reduccionismo de ___ gorda.', opts: ['letra', 'brocha', 'cuenta'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Condiciona', 'Determina'],
    btnA: '🎲 Condiciona', btnB: '🎯 Determina',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Carga los dados', t: 'ok' },
      { w: 'Dicta el resultado', t: 'no' },
      { w: 'Se puede desmentir', t: 'ok' },
      { w: 'Gana con cualquier dato', t: 'no' },
      { w: 'Explica por qué cuesta más', t: 'ok' },
      { w: 'Deduce la frase del bolsillo', t: 'no' },
      { w: 'Cuenta las excepciones', t: 'ok' },
      { w: 'Las llama apariencia', t: 'no' },
      { w: 'Es la versión que sigue viva', t: 'ok' },
      { w: 'Falló con fechas', t: 'no' },
    ],
  },
  {
    label: ['La base', 'Encima'],
    btnA: '🧱 La base', btnB: '🏛️ Encima',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La pauta de los anunciantes', t: 'ok' },
      { w: '«Aquí eso no se dice»', t: 'no' },
      { w: 'Las mensualidades', t: 'ok' },
      { w: '«Formamos los mejores»', t: 'no' },
      { w: 'El salón prestado', t: 'ok' },
      { w: 'La costumbre del favor', t: 'no' },
      { w: 'Las horas de la noche', t: 'ok' },
      { w: '«Con esfuerzo se puede»', t: 'no' },
      { w: 'El giro mensual que llega', t: 'ok' },
      { w: '«Irse es lo que hay que hacer»', t: 'no' },
    ],
  },
  {
    label: ['Auditoría', 'Brocha gorda'],
    btnA: '🔍 Auditoría', btnB: '🖌️ Brocha gorda',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Nombra la relación', t: 'ok' },
      { w: 'Adivina la intención', t: 'no' },
      { w: 'Trae números', t: 'ok' },
      { w: '«Algo saca»', t: 'no' },
      { w: 'Dice qué la desmentiría', t: 'ok' },
      { w: 'Explica todo', t: 'no' },
      { w: 'Dice qué sobrevive entero', t: 'ok' },
      { w: 'Salta al insulto', t: 'no' },
      { w: 'Empieza por la casa propia', t: 'ok' },
      { w: 'Solo apunta hacia afuera', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se audita la base material de una institución',
    steps: [
      'Escribir de qué vive, con números si se pueden conseguir',
      'Anotar quién paga, cuánto y cada cuánto, sin adjetivos',
      'Buscar qué frase no se puede decir ahí sin que a alguien le cueste',
      'Escribir el condicionamiento de modo que se pueda desmentir',
      'Anotar qué NO se concluye: intención, sinceridad ni verdad de lo dicho',
      'Y cerrar diciendo qué sobrevive entero a la auditoría',
    ],
  },
  {
    label: 'La prueba de una línea, paso a paso',
    steps: [
      'Escribir la explicación material tal como salió, sin arreglarla',
      'Preguntarse qué tendría que pasar para que fuera falsa',
      'Si no hay respuesta, tacharla: se inmunizó y ya no explica',
      'Buscar la relación concreta que sí se puede mirar',
      'Escribir cómo se comprobaría, con qué se vería y cuándo',
      'Y firmar la hoja con fecha, para poder volver a leerla',
    ],
  },
  {
    label: 'Cómo entra la tesis con sus críticas al lado',
    steps: [
      'Enunciar la tesis en su versión útil: la base condiciona',
      'Poner la fuente con su etiqueta: el prólogo de 1859, clásico cuestionado',
      'Añadir la crítica clásica: Popper y la inmunización, 1957',
      'Añadir las profecías que fallaron, con sus fechas',
      'Añadir la defensa que quita lo indefendible: Cohen, 1978',
      'Y la carta de Engels de 1890, que lo niega desde dentro',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Publicó sin firma «El hombre máquina» en 1747 y huyó de dos países', ans: 'La Mettrie', opts: ['La Mettrie', 'Karl Marx', 'Karl Popper', 'G. A. Cohen'] },
  { desc: 'Capataz de ferrocarril al que una barra de hierro le atravesó la cabeza en 1848', ans: 'Phineas Gage', opts: ['Phineas Gage', 'Joseph Bloch', 'Federico II de Prusia', 'E. P. Thompson'] },
  { desc: 'Escribió en 1859 que el modo de producir la vida material condiciona las ideas', ans: 'Karl Marx', opts: ['Karl Marx', 'Friedrich Engels', 'La Mettrie', 'Karl Popper'] },
  { desc: 'Firmó en 1890 la carta que niega que lo económico sea el único factor', ans: 'Friedrich Engels', opts: ['Friedrich Engels', 'Karl Marx', 'G. A. Cohen', 'Joseph Bloch'] },
  { desc: 'Acusó a la tesis dura de inmunizarse contra la refutación, en 1957', ans: 'Karl Popper', opts: ['Karl Popper', 'G. A. Cohen', 'Friedrich Engels', 'La Mettrie'] },
  { desc: 'Defendió en 1978 la parte defendible, soltando la que no lo era', ans: 'G. A. Cohen', opts: ['G. A. Cohen', 'Karl Popper', 'Karl Marx', 'Phineas Gage'] },
  { desc: 'La corriente que mueve los mazos y no elige el paño', ans: 'El condicionamiento', opts: ['El condicionamiento', 'El determinismo', 'La inmunización', 'La brocha gorda'] },
  { desc: 'Ver dinero detrás de cada frase y creer que con eso se explicó algo', ans: 'El reduccionismo de brocha gorda', opts: ['El reduccionismo de brocha gorda', 'La auditoría material', 'La prueba de una línea', 'El condicionamiento'] },
]);

/* ---------- base, encima o resto ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«La radio vive de la pauta de tres anunciantes»', func: 'La base: de qué vive, y se puede comprobar', opts: ['La base: de qué vive, y se puede comprobar', 'Lo que se levanta encima', 'Lo que sobrevive a la auditoría', 'Brocha gorda'] },
  { trans: '«En esa radio no se habla mal de los colegios privados»', func: 'Lo que se levanta encima: lo que se puede y no se puede decir', opts: ['Lo que se levanta encima: lo que se puede y no se puede decir', 'La base material', 'Una conclusión sobre la intención', 'Lo que sobrevive entero'] },
  { trans: '«El teorema que enseña ese colegio sigue siendo verdadero»', func: 'Lo que sobrevive entero: la auditoría no toca su verdad', opts: ['Lo que sobrevive entero: la auditoría no toca su verdad', 'La base material', 'Lo que se levanta encima', 'Una inmunización'] },
  { trans: '«El locutor no cree ni una palabra de lo que dice»', func: 'Brocha gorda: es una intención supuesta, y no se comprobó', opts: ['Brocha gorda: es una intención supuesta, y no se comprobó', 'La base material', 'Lo que se levanta encima', 'Un condicionamiento bien escrito'] },
  { trans: '«Esta casa vive del ingreso familiar y de horas de la noche»', func: 'La base propia: el mismo análisis, girado hacia adentro', opts: ['La base propia: el mismo análisis, girado hacia adentro', 'Lo que se levanta encima', 'Lo que sobrevive entero', 'Una conclusión determinista'] },
]);

/* ---------- diagnóstico: ¿por dónde falla la auditoría? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: '«Lo dice porque le pagan», y ahí termina la anotación', characteristic: 'Brocha gorda: adivina la intención, no se puede desmentir y agravia a una persona; se reescribe como relación comprobable', opts: ['Brocha gorda: adivina la intención, no se puede desmentir y agravia a una persona; se reescribe como relación comprobable', 'Está bien: es directo y se entiende', 'El error es no decir cuánto le pagan', 'Faltaba citar a Marx'] },
  { disease: 'La explicación encaja con cualquier cosa que pase después', characteristic: 'Se inmunizó, que es lo que Popper describió en 1957: una explicación que gana siempre ha dejado de explicar', opts: ['Se inmunizó, que es lo que Popper describió en 1957: una explicación que gana siempre ha dejado de explicar', 'Está bien: es una teoría muy potente', 'El error es que sea de 1957', 'Faltaba aplicarla a más casos'] },
  { disease: 'La hoja concluye que, sabiendo el sueldo, ya se sabe el voto', characteristic: 'Pasó de condicionar a determinar: la base carga los dados, pero no dice qué número sale', opts: ['Pasó de condicionar a determinar: la base carga los dados, pero no dice qué número sale', 'Está bien: el sueldo explica el voto', 'El error es hablar de votos', 'Faltaba una encuesta más grande'] },
  { disease: 'La auditoría del colegio concluye que el teorema que enseña es falso', characteristic: 'La auditoría no es un ácido universal: dice de qué está hecho algo y quién lo sostiene, no si lo que afirma es verdad', opts: ['La auditoría no es un ácido universal: dice de qué está hecho algo y quién lo sostiene, no si lo que afirma es verdad', 'Está bien: si cobra, miente', 'El error es auditar un colegio', 'Faltaba revisar también las notas'] },
  { disease: 'La tesis se presenta sola, y las críticas quedan en una nota al final', characteristic: 'En esta materia las críticas van al lado de la tesis: Popper, las profecías falladas y Cohen entran con ella, no debajo', opts: ['En esta materia las críticas van al lado de la tesis: Popper, las profecías falladas y Cohen entran con ella, no debajo', 'Está bien: primero se enseña y luego se critica', 'El error es citar a Popper', 'Faltaba poner la nota al principio'] },
  { disease: 'La casa lleva seis instituciones auditadas y ninguna propia', characteristic: 'Falta la que cuesta: M.E.T.A.S también tiene base material, y las ideas que le salen baratas son sospechosas por la misma razón', opts: ['Falta la que cuesta: M.E.T.A.S también tiene base material, y las ideas que le salen baratas son sospechosas por la misma razón', 'Con seis ajenas ya está cumplido', 'Un proyecto educativo no tiene base material', 'Faltaba auditar una séptima institución'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Si la fiebre cambia lo que uno piensa, el que piensa es el cuerpo.', type: 'El hombre máquina (La Mettrie, 1747)' },
  { s: 'Una barra de hierro, un cerebro tocado y un carácter distinto.', type: 'El caso de Phineas Gage (1848)' },
  { s: 'El modo de producir la vida material condiciona las ideas.', type: 'El prólogo de 1859 (clásico cuestionado)' },
  { s: 'Las ideas dominantes son las de la clase dominante.', type: '«La ideología alemana» (clásico cuestionado)' },
  { s: 'La base carga los dados, pero no dice qué número sale.', type: 'Condicionar' },
  { s: 'Del bolsillo se deduce la frase, con fecha y todo.', type: 'Determinar: la versión apaleada' },
  { s: 'La tesis se reinterpreta cada vez que falla.', type: 'La inmunización (Popper, 1957)' },
  { s: 'Ni él ni Marx dijeron que lo económico fuera lo único.', type: 'La carta de Engels a Bloch (1890)' },
  { s: 'Defender quitando primero lo que no se puede defender.', type: 'G. A. Cohen (1978)' },
  { s: 'Ver dinero detrás de cada frase y darse por satisfecho.', type: 'El reduccionismo de brocha gorda' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'La Mettrie (1747)', gen: 'Fuente', n: 'El cuerpo explica al que piensa', g: '«El hombre máquina»', t: 'Clásico sólido como documento de su tiempo' },
  { w: 'Marx (1859)', gen: 'Fuente', n: 'La base condiciona la vida intelectual', g: 'Prólogo a la Contribución', t: 'Clásico cuestionado, con sus críticas al lado' },
  { w: 'Marx y Engels', gen: 'Fuente', n: 'Las ideas dominantes de cada época', g: '«La ideología alemana», publicada en 1932', t: 'Clásico cuestionado' },
  { w: 'Engels (1890)', gen: 'Documento', n: 'Lo económico no es el único factor', g: 'Carta a Joseph Bloch, 21 de septiembre', t: 'La negación del determinismo desde dentro' },
  { w: 'Popper (1957)', gen: 'Fuente', n: 'La inmunización contra la refutación', g: '«La miseria del historicismo»', t: 'La crítica clásica' },
  { w: 'G. A. Cohen (1978)', gen: 'Fuente', n: 'La defensa que quita lo indefendible', g: 'La teoría de la historia de Karl Marx', t: 'Defensa analítica seria' },
  { w: 'Condicionar', gen: 'Concepto', n: 'La base carga los dados', g: 'Se puede desmentir, y por eso sirve', t: 'La versión que sigue viva' },
  { w: 'Determinar', gen: 'Concepto', n: 'La base dicta el resultado', g: 'Las profecías fallaron con fechas', t: 'La versión apaleada por la historia' },
  { w: 'El batán', gen: 'Imagen', n: 'El agua mueve los mazos', g: 'Y no elige qué paño se pone debajo', t: 'La imagen que resume la etapa' },
  { w: 'Brocha gorda', gen: 'Error', n: 'Dinero detrás de cada frase', g: 'Explica todo, no prueba nada, insulta', t: 'El modo de fallar de esta materia' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'La Mettrie publicó su libro en ___.', opts: ['1747', '1859', '1932'], ans: '1747' },
  { s: 'Marx escribió que la base ___.', opts: ['condiciona', 'determina', 'obliga'], ans: 'condiciona' },
  { s: 'La versión que ___ está apaleada por la historia.', opts: ['determina', 'condiciona', 'describe'], ans: 'determina' },
  { s: 'El agua mueve los mazos y no elige el ___.', opts: ['paño', 'molino', 'río'], ans: 'paño' },
  { s: 'Popper llamó a ese vicio la ___.', opts: ['inmunización', 'falsación', 'deducción'], ans: 'inmunización' },
  { s: 'La carta de Engels a Bloch es del año ___.', opts: ['1890', '1848', '1978'], ans: '1890' },
  { s: 'Cohen publicó su defensa en ___.', opts: ['1978', '1957', '1890'], ans: '1978' },
  { s: 'Ver dinero detrás de cada frase es brocha ___.', opts: ['gorda', 'fina', 'seca'], ans: 'gorda' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Qué sostiene La Mettrie en «El hombre máquina» (1747), con qué etiqueta entra en esta casa y dónde termina lo que esta etapa puede decir?', ans: 'Sostiene que si el estado del cuerpo cambia lo que uno piensa, entonces el que piensa es el cuerpo, y el alma como sustancia aparte deja de hacer falta para explicar nada. Él mismo contó que la idea le vino de una fiebre en la que notó su cabeza más lenta. La etiqueta se dice entera porque es media lección: clásico sólido como documento de su tiempo, con su fisiología superada y su gesto no; la biología de 1747 no sirve, y la pregunta que hizo la contesta hoy media neurología, con lesiones, fármacos y escáneres. El caso más citado del asunto es el de Phineas Gage, en 1848, y va con su propia etiqueta: los relatos más novelescos han sido corregidos por los historiadores, y lo que queda en pie basta. Y aquí está la frontera declarada: si con eso queda explicado lo que se siente por dentro es una pregunta abierta, con gente seria en los dos lados, y no se contesta en esta etapa sino en la 3 de esta misma ruta.' },
  { q: 'Explica la tesis del prólogo de 1859 y por qué el verbo exacto que Marx escribió cambia todo lo que se puede afirmar con ella.', ans: 'La tesis dice que el modo en que una sociedad produce su vida material condiciona su vida social, política e intelectual, y en «La ideología alemana» se completa con la fórmula de que las ideas dominantes de una época son las de su clase dominante. El verbo del texto de 1859 es condiciona, no dicta ni decide, y ahí cabe la etapa entera. Condicionar significa que la base carga los dados: hace mucho más probables unas ideas que otras y explica por qué, sin decir cuál va a salir en cada caso. Determinar significaría que de la base se deduce la idea, y esa versión, que es un endurecimiento posterior, está apaleada por la historia, porque las profecías fallaron con fechas y hay demasiadas excepciones que explicar. La consecuencia práctica es enorme: con la versión que condiciona hay que decir qué se vería si la explicación fuera falsa, y con la versión que determina no hace falta decir nada, porque cualquier resultado se acomoda después.' },
  { q: '¿Por qué las críticas van al lado de la tesis y no en nota al pie? Nombra las tres, con su etiqueta.', ans: 'Porque una herramienta que se entrega sin sus objeciones se usa como dogma, y porque en esta materia el estatus de una fuente es parte de la fuente. Las tres. Popper, en «La miseria del historicismo» (1957), la crítica clásica: acusa a la tesis, en manos de sus defensores, de inmunizarse, es decir de reinterpretarse cada vez que falla hasta que ya nada pueda desmentirla, y una explicación que gana siempre ha dejado de explicar. Las profecías con sus fechas, que no son opinión sino hecho histórico: la revolución se esperaba en los países más industrializados y llegó en 1917 a uno de los menos industrializados de Europa. Y G. A. Cohen, en «La teoría de la historia de Karl Marx: una defensa» (1978), defensa analítica seria, que está en la lista aunque defienda, porque enseñó a sostener la parte defendible con argumentos limpios y a soltar la que no lo es. A eso se añade un documento que zanja la caricatura desde dentro: la carta de Engels a Joseph Bloch del 21 de septiembre de 1890.' },
  { q: '¿Qué dice exactamente la carta de Engels a Bloch de 1890, y por qué es la pieza más incómoda para las dos caricaturas?', ans: 'Engels escribe, el 21 de septiembre de 1890, que ni él ni Marx afirmaron nunca que el factor económico fuera el único determinante, y añade algo que se agradece en un fundador: que si los jóvenes cargan demasiado el lado económico, la culpa es en parte de ellos dos, por haberlo subrayado tanto frente a quienes lo negaban. Es incómoda para las dos caricaturas al mismo tiempo. Para el adversario que quiere despachar la tesis como determinismo tosco, porque la negación viene firmada por uno de sus dos autores y no por un crítico externo. Y para el seguidor que usa la versión dura, porque no puede alegar que la corrección es un invento de sus enemigos. El valor de método es aún mayor: enseña que la versión útil de una idea a veces hay que ir a buscarla en las cartas y no en los eslóganes, y que las fuentes se leen enteras, con sus rectificaciones incluidas.' },
  { q: 'Explica el reduccionismo de brocha gorda con sus tres señales, y cómo se reescribe una frase que cayó en él.', ans: 'Es ver dinero detrás de cada frase y creer que con eso ya se entendió algo. Tres señales lo delatan. Uno: explica todo, y por eso ya no explica nada, porque encaja con cualquier resultado. Dos: no pide pruebas, porque la intención se supone en vez de mostrarse. Tres: salta del interés al insulto, es decir de una relación material comprobable a una acusación sobre una persona. La reescritura sigue tres pasos. Se cambia la intención por la relación: en vez de decir que alguien dice algo porque le pagan, se dice quién le paga, cuánto y qué frase le costaría dinero. Se añade la prueba: qué se vería si la explicación fuera falsa, por ejemplo qué pasaría el día que alguien dijera lo contrario en ese mismo micrófono. Y se añade lo que no se concluye: la sinceridad de nadie y la verdad o falsedad de lo que dijo, que son cosas distintas y que la auditoría no toca.' },
  { q: '¿Qué significa que la auditoría material no es un ácido universal, y por qué decirlo es parte del oficio?', ans: 'Significa que la auditoría contesta dos preguntas y solo dos: de qué está hecho algo y qué relaciones lo sostienen. No contesta si lo que ese algo afirma es verdadero, ni si vale la pena, ni si la gente que lo sostiene es sincera. Por eso hay cosas que la sobreviven enteras y hay que decirlo en voz alta: que un colegio viva de mensualidades no vuelve falso el teorema que enseña, y que alguien cobre por su trabajo no vuelve falso lo que ese trabajo produce. Decirlo es parte del oficio por dos razones. La primera es de honradez: quien solo publica lo que el análisis derriba está eligiendo los resultados, y eso ya no es analizar. La segunda es de eficacia: el cinismo del que desmonta todo y no construye nada no es dominio de la herramienta, es su caricatura, y además deja a quien lo practica sin manera de distinguir un fraude de una institución imperfecta pero útil, que es justo la distinción para la que se aprendió todo esto.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['MAQUINA', 'BASE', 'IDEAS', 'CUERPO', 'TALLER', 'MOTOR']),
  haceSopa(10, ['METTRIE', 'MARX', 'ENGELS', 'POPPER', 'COHEN', 'GAGE']),
  haceSopa(10, ['CONDICION', 'DETERMINA', 'PRUEBA', 'SALARIO', 'RELOJ', 'MAZOS']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'La Mettrie publicó «El hombre máquina» en 1747, y sin firmarlo.', a: true },
  { q: 'La etiqueta de La Mettrie dice que su fisiología sigue vigente.', a: false },
  { q: 'A Phineas Gage, en 1848, una barra de hierro le atravesó la cabeza y sobrevivió.', a: true },
  { q: 'Los relatos más novelescos del caso Gage han sido corregidos por los historiadores.', a: true },
  { q: 'En el prólogo de 1859, Marx escribió que la base «determina» la vida intelectual.', a: false },
  { q: '«La ideología alemana» se publicó entera hasta 1932.', a: true },
  { q: 'Condicionar significa que la base carga los dados, no que dicte el resultado.', a: true },
  { q: 'La versión determinista de la tesis salió reforzada por el siglo veinte.', a: false },
  { q: 'La revolución llegó en 1917 a uno de los países menos industrializados de Europa.', a: true },
  { q: 'Popper acusó a la tesis dura de inmunizarse contra la refutación.', a: true },
  { q: 'Una explicación que encaja con cualquier resultado es la más potente de todas.', a: false },
  { q: 'En la carta a Bloch de 1890, Engels niega que lo económico sea el único factor.', a: true },
  { q: 'G. A. Cohen entra en esta etapa como el crítico más duro de Marx.', a: false },
  { q: 'La auditoría material dice de qué está hecho algo, no si lo que afirma es verdad.', a: true },
  { q: 'Escribir «lo dice porque le pagan» es un buen ejemplo de auditoría material.', a: false },
]);
B.evalMCBank = JSON.stringify([
  { q: 'El argumento central de «El hombre máquina» (1747) es que…', o: ['a) Si el cuerpo cambia lo que se piensa, el que piensa es el cuerpo', 'b) Las máquinas llegarán a pensar', 'c) El alma gobierna la materia', 'd) La medicina debe separarse de la filosofía'], a: 0 },
  { q: 'La etiqueta completa de La Mettrie en esta casa es…', o: ['a) Divulgación con inflado', 'b) Clásico sólido como documento de su tiempo: fisiología superada, gesto no', 'c) Tesis discutida', 'd) Ciencia en disputa'], a: 1 },
  { q: 'El caso de Phineas Gage se cita aquí porque…', o: ['a) Demuestra el problema difícil de la conciencia', 'b) Prueba que el alma existe', 'c) Se le tocó el cerebro y cambió la persona', 'd) Confirma la tesis de Marx'], a: 2 },
  { q: 'El verbo que Marx escribió en el prólogo de 1859 es…', o: ['a) Determina', 'b) Impone', 'c) Dicta', 'd) Condiciona'], a: 3 },
  { q: '«Las ideas dominantes de una época son las de la clase dominante» está en…', o: ['a) «La ideología alemana»', 'b) «La miseria del historicismo»', 'c) La carta a Bloch', 'd) «El hombre máquina»'], a: 0 },
  { q: 'La diferencia práctica entre condicionar y determinar está en que la primera…', o: ['a) Es más elegante', 'b) Dice qué se vería si la explicación fuera falsa', 'c) No admite excepciones', 'd) No necesita fuentes'], a: 1 },
  { q: 'La versión determinista falló de manera comprobable porque…', o: ['a) Nadie la entendió', 'b) Era demasiado corta', 'c) Sus profecías fallaron con fechas', 'd) Engels la escribió mal'], a: 2 },
  { q: 'La inmunización, según Popper (1957), consiste en…', o: ['a) Publicar bajo seudónimo', 'b) Buscar datos que contradigan la teoría', 'c) Repetir el experimento', 'd) Reinterpretar la tesis cada vez que falla, hasta que nada la desmienta'], a: 3 },
  { q: 'La carta de Engels a Joseph Bloch es del…', o: ['a) 21 de septiembre de 1890', 'b) 14 de julio de 1893', 'c) 5 de mayo de 1859', 'd) 30 de enero de 1848'], a: 0 },
  { q: 'Lo que hace de la carta de 1890 una pieza tan incómoda es que…', o: ['a) Fue escrita en la cárcel', 'b) La negación del determinismo viene firmada por uno de los dos autores', 'c) Nadie la ha leído', 'd) Contradice a Popper'], a: 1 },
  { q: 'G. A. Cohen (1978) entra en la lista de esta etapa como…', o: ['a) Clásico cuestionado', 'b) Divulgación con inflado', 'c) Defensa analítica seria', 'd) Fuente primaria'], a: 2 },
  { q: 'La imagen del batán enseña que…', o: ['a) Las máquinas son peligrosas', 'b) El río siempre gana', 'c) Los mazos deciden solos', 'd) El agua mueve los mazos, pero no elige el paño'], a: 3 },
  { q: 'La prueba de una línea para cualquier explicación material es…', o: ['a) ¿Qué tendría que pasar para que esto fuera falso?', 'b) ¿A quién beneficia?', 'c) ¿Quién lo dijo primero?', 'd) ¿Cuánto dinero hay de por medio?'], a: 0 },
  { q: 'Las tres señales del reduccionismo de brocha gorda son…', o: ['a) Es largo, es viejo y es extranjero', 'b) Explica todo, no pide pruebas y salta al insulto', 'c) Cita fuentes, usa números y admite dudas', 'd) Es corto, es claro y es popular'], a: 1 },
  { q: 'Decir que la auditoría no es un ácido universal significa que…', o: ['a) Solo sirve para instituciones grandes', 'b) Hay que repetirla cada año', 'c) Hay cosas que la sobreviven enteras, y decirlo es parte del oficio', 'd) No se puede aplicar a la propia casa'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'La Mettrie publicó «El hombre máquina» en el año ___.', a: '1747' },
  { q: 'Su fisiología está superada, pero su ___ no.', a: 'gesto' },
  { q: 'El caso del capataz de ferrocarril de 1848 es el de Phineas ___.', a: 'Gage' },
  { q: 'El prólogo de Marx que se lee en esta etapa es de ___.', a: '1859' },
  { q: 'El verbo exacto de ese prólogo es ___.', a: 'condiciona' },
  { q: '«La ideología alemana» se publicó entera hasta ___.', a: '1932' },
  { q: 'La versión que dice que la base lo ___ todo está apaleada.', a: 'determina' },
  { q: 'El agua mueve los mazos, pero no elige el ___.', a: 'paño' },
  { q: 'La crítica clásica es «La miseria del ___», de Popper.', a: 'historicismo' },
  { q: 'Popper acusó a la tesis dura de ___ contra la refutación.', a: 'inmunizarse' },
  { q: 'Engels escribió su carta a Joseph ___ en 1890.', a: 'Bloch' },
  { q: 'La revolución llegó en ___ a un país poco industrializado.', a: '1917' },
  { q: 'G. A. Cohen publicó su defensa en ___.', a: '1978' },
  { q: 'Ver dinero detrás de cada frase es el reduccionismo de brocha ___.', a: 'gorda' },
  { q: 'La auditoría no es un ácido ___.', a: 'universal' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'La Mettrie (1747)', def: 'Si el cuerpo cambia lo que se piensa, el que piensa es el cuerpo' },
  { term: 'Phineas Gage (1848)', def: 'Se le tocó el cerebro y cambió la persona' },
  { term: 'El prólogo de 1859', def: 'La base material condiciona la vida intelectual' },
  { term: '«La ideología alemana»', def: 'Las ideas dominantes son las de la clase dominante' },
  { term: 'Condicionar', def: 'La base carga los dados' },
  { term: 'Determinar', def: 'La base dicta el resultado: la versión apaleada' },
  { term: 'El batán', def: 'El agua mueve los mazos y no elige el paño' },
  { term: 'La inmunización', def: 'Reinterpretar la tesis cada vez que falla' },
  { term: 'Popper (1957)', def: 'La crítica clásica: «La miseria del historicismo»' },
  { term: 'Carta a Bloch (1890)', def: 'Lo económico no es el único factor, firmado por Engels' },
  { term: 'G. A. Cohen (1978)', def: 'Defensa analítica seria: quita lo indefendible' },
  { term: 'La prueba de una línea', def: '¿Qué tendría que pasar para que esto fuera falso?' },
  { term: 'Brocha gorda', def: 'Dinero detrás de cada frase, y sin prueba' },
  { term: 'Lo que sobrevive', def: 'Lo que la auditoría no toca: la verdad de lo afirmado' },
  { term: 'La base propia', def: 'De qué vive esta casa, y qué ideas le salen baratas' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'Una radio local ofrece a M.E.T.A.S media hora gratis los domingos. La radio vive de la pauta de un puñado de anunciantes, y uno de ellos es un colegio privado del municipio.' },
  { txt: 'Una fundación empresarial ofrece L 40,000 anuales por poner su logo y su lema dentro de cada misión de M.E.T.A.S. El dinero pagaría dos años de servidor.' },
  { txt: 'Una iglesia presta gratis su salón para las tardes de estudio, y al mes quien lo administra pide con toda amabilidad que la unidad de ciencias no toque el origen del hombre.' },
  { txt: 'Un colegio privado ofrece L 18,000 por un taller para sus maestros, y dice en su publicidad tener el mejor método del país, con resultados que son ciertos.' },
  { txt: 'En su cuaderno de auditorías, Jael escribió sobre un locutor local: «dice eso porque le pagan». La observación de origen (tres programas pagados por la misma cooperativa) era buena.' },
  { txt: 'Con fiebre y sin tarea hecha, Angelly pregunta lo que La Mettrie preguntó en 1747: si con calentura piensa lento, si entonces ella es su cuerpo.' },
  { txt: 'Una organización ofrece L 6,000 por un módulo de emprendimiento juvenil cuyo material da por sentado, sin decirlo, que quien no emprende es porque no quiso.' },
  { txt: 'La auditoría se gira hacia adentro: M.E.T.A.S vive del ingreso de la familia, de las horas de la noche del autor y de un servidor que se paga cada mes.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿De qué vive materialmente la institución o la afirmación del caso? Escríbelo con números si se pueden conseguir, y sin adjetivos.',
  '2. ¿Qué se puede afirmar como condicionamiento y dónde empezaría a ser determinismo? Escribe la afirmación de modo que se pueda desmentir, y di con qué se vería.',
  '3. ¿Qué fuente de esta etapa sostiene tu análisis y con qué etiqueta de estatus entra? Nombra también la crítica que la acompaña.',
  '4. ¿Qué NO se concluye, y qué sobrevive entero a la auditoría? Añade la base propia de esta casa que se parece a esta.',
]);
B.critCaseGuides = JSON.stringify([
  'Se empieza por la base, y la base se escribe como se escribe un inventario: quién paga, cuánto, cada cuánto y por qué, con números si se pueden conseguir y con el hueco declarado si no se pueden. Nada de adjetivos en esta casilla, porque el adjetivo es donde se cuela la conclusión antes de tiempo. Y hay una pregunta que revela lo que se levanta encima mejor que cualquier teoría, así que va aquí mismo: qué frase no se puede decir ahí adentro sin que a alguien le cueste dinero. Esa pregunta es comprobable, se contesta mirando, y de ella sale el resto del análisis.',
  'Después viene la distinción que es toda la etapa, y se escribe con el verbo del prólogo de 1859: la base CONDICIONA. Es decir, carga los dados, hace unas ideas mucho más probables que otras y explica por qué; no dice qué número va a salir. Se pasa a determinismo en el momento en que de la base se deduce la frase o la intención de alguien, y esa raya se cruza casi siempre por comodidad. La prueba que hay que aplicar aquí, sin excepción, es la de una línea: qué tendría que pasar para que esto fuera falso. Si no hay respuesta, la explicación se inmunizó, que es lo que Popper describió en 1957, y una explicación que gana siempre ha dejado de explicar. Entonces se tacha y se vuelve a escribir con una relación que sí se pueda mirar.',
  'Toda fuente pasa por la regla del estatus, y aquí las etiquetas están fijadas: La Mettrie, «El hombre máquina» (1747), clásico sólido como documento de su tiempo, con su fisiología superada y su gesto no; Marx, el prólogo de 1859, y Marx y Engels, «La ideología alemana» (escrita en 1845 y 1846, publicada entera en 1932), los dos como clásicos cuestionados, tesis potente citada con sus críticas; Popper, «La miseria del historicismo» (1957), la crítica clásica; y G. A. Cohen (1978), defensa analítica seria. Y la crítica se nombra junto con la tesis y no debajo: la inmunización de Popper, las profecías que fallaron con fechas (la revolución esperada en los países industrializados llegó en 1917 a uno de los menos industrializados) y la carta de Engels a Joseph Bloch del 21 de septiembre de 1890, donde se niega desde dentro que lo económico sea el único factor. Los lempiras del caso se dicen enteros, con lo que compran y con lo que piden a cambio.',
  'Todo caso cierra con dos casillas que casi nadie llena y que son las que separan el oficio del desahogo. La primera es qué NO se concluye: ni la intención de nadie, ni su sinceridad, ni la verdad o falsedad de lo que dice, porque la auditoría contesta de qué está hecho algo y quién lo sostiene, y no toca esas tres cosas; y porque la mitad de las veces el que habla cree cada palabra, y esa sinceridad no es lo contrario del condicionamiento sino su modo de funcionar. La segunda es qué sobrevive entero, dicho en voz alta, porque la auditoría no es un ácido universal y el cinismo del que desmonta todo no es dominio sino caricatura. Y encima de las dos va el pago: la base propia de esta casa, que vive del ingreso familiar y de horas de la noche, con su renglón de qué evidencia haría cambiar la idea que esa base abarata.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"Lo dice porque le pagan".', g1: 'Adivina la intención en vez de mostrar la relación, y no se puede desmentir: si el otro argumenta, será porque le pagan, y si calla, también. Encima acusa a una persona de algo que no se comprobó.', g2: 'La corrección: se escribe la relación y la prueba. Quién paga, cuánto, y qué se vería si la explicación fuera falsa, por ejemplo qué pasa el día que alguien diga lo contrario en ese micrófono.' },
  { txt: '"Sabiendo de qué vive, ya sé lo que va a pensar".', g1: 'Ahí se cruzó la raya de condicionar a determinar. La base carga los dados y no dice qué número sale; si de la base se dedujera la idea, no harían falta ni las encuestas ni las conversaciones.', g2: 'La corrección es del verbo y del alcance: se afirma que unas ideas le salen baratas y otras caras, se dice cuáles, y se deja escrito qué caso lo desmentiría. Marx escribió condiciona, y esa palabra es la que hay que copiar.' },
  { txt: '"Cada vez que el dato no cuadra, encuentro la explicación de por qué en el fondo sí cuadra".', g1: 'Eso es exactamente la inmunización que Popper describió en 1957: la tesis se reinterpreta cada vez que falla y queda a salvo de cualquier hecho, que es otra manera de decir que ya no afirma nada.', g2: 'La corrección se decide antes de mirar: se escribe por adelantado qué resultado se aceptaría como refutación. Y si no se puede escribir ninguno, la hoja no se guarda, porque no era una auditoría.' },
  { txt: '"El colegio vive de mensualidades, así que lo que enseña es mentira".', g1: 'Confunde de qué está hecho algo con si lo que afirma es verdad. La auditoría contesta la primera pregunta y no la segunda, y el teorema no cambia según quién cobre por enseñarlo.', g2: 'La corrección es añadir la casilla que falta: qué sobrevive entero. Puede sobrevivir el contenido, puede sobrevivir el trabajo de los maestros, y decirlo no debilita el análisis, lo vuelve creíble.' },
  { txt: '"La tesis primero, y las críticas las pongo en una nota al final".', g1: 'En esta materia eso no se hace, porque una herramienta entregada sin sus objeciones se usa como dogma, y porque la nota al pie es donde va a morir lo que incomoda.', g2: 'La corrección: Popper, las profecías falladas y Cohen entran al lado de la tesis, en la misma página, y con ellos la carta de Engels a Bloch de 1890, que es la que niega el determinismo desde dentro.' },
  { txt: '"Ya audité la radio, el colegio y la iglesia: la etapa está cumplida".', g1: 'Falta la que cuesta. Esta casa también tiene base material, y las ideas que esa base le abarata son sospechosas por exactamente la misma razón que las de los demás.', g2: 'La corrección: se escribe de qué vive M.E.T.A.S, qué ideas le salen baratas por eso, y el renglón de qué evidencia las haría cambiar. Sin ese renglón, una premisa está funcionando como dogma, y así se anota, con fecha.' },
]);
B.critDecisionBank = JSON.stringify([
  'La radio espera respuesta por la media hora del domingo: ¿se acepta, y qué se escribe antes de sentarse al micrófono?',
  'La fundación espera respuesta por los L 40,000: ¿se acepta, se acepta con condiciones o no se acepta? ¿Qué dice el contrato exactamente?',
  'La iglesia pidió que la unidad de ciencias no toque el origen del hombre: ¿se acepta el salón, y en qué conversación se dice qué?',
  'El colegio del «mejor método» ofrece L 18,000: ¿se da el taller, y qué se enseña en la primera media hora?',
  'La frase «lo dice porque le pagan» ya está escrita en el cuaderno: ¿se borra, se matiza o se reescribe? ¿Con qué palabras exactas?',
  'Angelly pregunta si ella es su cuerpo: ¿qué se le contesta a su edad, y qué parte se le dice que queda abierta?',
  'La organización espera por los L 6,000 y su módulo de emprendimiento: ¿entra, entra con una hoja más, o no entra? ¿Qué lleva esa hoja?',
  'La base propia de M.E.T.A.S ya está escrita: ¿qué idea abarata, y qué renglón de evidencia se le agrega para que no funcione como dogma?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Escribir «tres programas de la misma emisora coinciden en X, y los tres los paga la misma cooperativa».', b: 'Escribir «el locutor dice eso porque le pagan».', ga: 'Caso A: nombra una relación que cualquiera puede ir a mirar, y deja abierto qué la desmentiría, así que se puede discutir y se puede corregir.', gb: 'Caso B: adivina una intención, gana con cualquier resultado y agravia a una persona; suena más valiente y no afirma nada comprobable.', gr: 'La diferencia no es de tono sino de estatus: una es una hipótesis y la otra es una sentencia, y solo la hipótesis se puede sostener delante de alguien.' },
  { a: 'Decir que la base carga los dados y decir cuáles.', b: 'Decir que la base decide el resultado.', ga: 'Caso A: obliga a nombrar qué ideas salen baratas y cuáles caras, y por eso se puede comprobar caso por caso.', gb: 'Caso B: ahorra el trabajo entero y por eso es tentador, pero ya falló en público: la revolución llegó en 1917 al país que la tesis no señalaba.', gr: 'Marx escribió condiciona, no decide, y toda la utilidad de la herramienta cabe en esa palabra.' },
  { a: 'Entregar la tesis con Popper, las profecías falladas y Cohen al lado.', b: 'Entregar la tesis limpia y dejar las críticas en una nota al final.', ga: 'Caso A: el que aprende recibe la herramienta y su manual de fallos al mismo tiempo, así que la usa con la mano firme y no la defiende con uñas.', gb: 'Caso B: produce discípulos, no analistas, y la primera vez que la tesis falle en la vida real el discípulo la defenderá inmunizándola.', gr: 'Las críticas al lado no debilitan una herramienta: son la parte del manual que dice hasta dónde llega.' },
  { a: 'Cerrar la auditoría diciendo qué sobrevive entero.', b: 'Cerrar la auditoría con la lista de lo que quedó desmontado.', ga: 'Caso A: distingue de qué está hecho algo de si lo que afirma es verdad, que son dos preguntas distintas, y deja al analista con criterio para el caso siguiente.', gb: 'Caso B: se siente más contundente y produce cinismo, que es la caricatura adolescente de esta materia y no su dominio.', gr: 'La auditoría no es un ácido universal, y decir qué sobrevive es la casilla que separa el oficio del desahogo.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se escribe una explicación material que no se puede desmentir.', guide: 'La tesis queda inmunizada y deja de afirmar nada: encaja con cualquier resultado, no se puede corregir nunca, y quien la sostiene confunde la sensación de entender con haber entendido.' },
  { cause: 'Se pasa de «condiciona» a «determina» sin darse cuenta.', guide: 'Se empieza a deducir la frase del bolsillo y la intención de la posición, y con eso desaparecen tanto las excepciones como las personas; es el camino corto hacia el reduccionismo de brocha gorda.' },
  { cause: 'Se nombra la base con números y se deja escrito qué la desmentiría.', guide: 'La hoja se vuelve discutible, que es lo que se buscaba: alguien puede traer el dato que la corrige, y el análisis mejora en vez de tener que defenderse.' },
  { cause: 'Las críticas se entregan al lado de la tesis y no en nota al pie.', guide: 'El que aprende recibe la herramienta con su manual de fallos, sabe hasta dónde llega, y cuando la tesis falla en un caso real la ajusta en vez de inmunizarla.' },
  { cause: 'La auditoría concluye sin decir qué sobrevive entero.', guide: 'Aparece el cinismo, que desmonta todo y no construye nada, y de paso se pierde la capacidad de distinguir un fraude de una institución imperfecta pero útil, que es justo para lo que se aprendió el método.' },
  { cause: 'La casa audita su propia base material.', guide: 'Aparecen las ideas que le salen baratas por vivir como vive, cada una queda escrita con su renglón de qué evidencia la haría cambiar, y la herramienta se vuelve usable delante de otros sin sonar a arma.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'La media hora del domingo se aceptó, y antes se escribió lo que se iba a decir.', guide: 'La casa dejó por escrito qué diría del estudio en casa aunque incomodara al anunciante. Si esa parte se cae el domingo, la relación material queda comprobada y no supuesta, y eso es lo que se anota en el cuaderno.' },
  { effect: 'La fundación firmó, y su logo quedó en la página de créditos y no dentro de las misiones.', guide: 'Contrato escrito de que el contenido no se toca, patrocinio visible en créditos, y ni logo ni lema dentro de las misiones. Aceptar con condiciones fue el resultado normal de la auditoría, no una derrota.' },
  { effect: 'El salón se agradeció en voz alta y el temario no se tocó.', guide: 'Las dos cosas se dijeron en la misma conversación y antes de la primera clase, y el favor recibido quedó declarado, porque también es una relación material. Se auditó la institución sin despreciar a la gente que vive dentro, empezando por esta casa.' },
  { effect: 'El taller se dio, y la primera media hora fue sobre separar el método del punto de partida.', guide: 'Se distinguieron las tres partes del resultado: el método, la mensualidad y los niños que ya llegaban leyendo. Y se dijo lo que sobrevivía entero: en ese colegio hay maestros buenos, y eso no lo produce ninguna mensualidad.' },
  { effect: 'La frase del cuaderno de Jael se reescribió, y quedó más larga y más útil.', guide: 'En vez de la intención, la relación y la prueba: tres programas de la misma emisora, pagados por la misma cooperativa, y la comprobación de qué pasaría el día que alguien dijera lo contrario en ese micrófono. Se puede desmentir, y no le pone a nadie una intención en la boca.' },
  { effect: 'La base propia de M.E.T.A.S quedó escrita, con lo que abarata y lo que encarece.', guide: 'Le sale barato decir que no a un patrocinio, porque nadie tiene la llave del contenido; le sale caro crecer, durar si el autor se enferma y ver de cerca al que no tiene esas horas. Con su renglón de qué lo haría cambiar: un semestre detenido por enfermedad, o tres familias que no puedan seguir las misiones por falta de tiempo y de datos.' },
]);

/* ---------- línea de tiempo: los siete momentos ---------- */
B.timelineData = JSON.stringify([
  { y: '1747', icon: '⚙️', label: 'La Mettrie y la fiebre', text: '<strong>«El hombre máquina»</strong>, publicado sin firma en Leiden: <strong>si el estado del cuerpo cambia lo que uno piensa, el que piensa es el cuerpo</strong>. Lo condenaron, huyó de dos países y murió en Berlín en 1751. Etiqueta: <strong>clásico sólido como documento de su tiempo</strong>, con su fisiología superada y su gesto no.' },
  { y: '1848', icon: '🚂', label: 'Phineas Gage', text: 'Una barra de hierro atraviesa la cabeza de un capataz de ferrocarril en Vermont. <strong>Sobrevive</strong>, y sus médicos describen un cambio en su carácter. Con su etiqueta puesta: <strong>los relatos más novelescos han sido corregidos por los historiadores</strong>. Lo que queda: se tocó el cerebro y cambió la persona.' },
  { y: '1845-1846', icon: '📚', label: 'La ideología alemana', text: 'Marx y Engels escriben el libro donde está la fórmula famosa: <strong>las ideas dominantes de una época son las de la clase dominante</strong>. No se publicó entero hasta <strong>1932</strong>, y ese dato importa: media discusión del siglo se hizo sin él. Etiqueta: <strong>clásico cuestionado</strong>.' },
  { y: '1859', icon: '🏗️', label: 'El prólogo, y el verbo', text: 'En el <strong>«Prólogo a la Contribución a la crítica de la economía política»</strong>, Marx escribe que el modo de producir la vida material <strong>condiciona</strong> la vida social, política e intelectual. <strong>Condiciona, no determina</strong>: la etapa entera cabe en ese verbo. Etiqueta: <strong>clásico cuestionado</strong>.' },
  { y: '1890', icon: '✉️', label: 'La carta de Engels a Bloch', text: 'El <strong>21 de septiembre</strong>, Engels escribe que ni él ni Marx afirmaron nunca que lo económico fuera el <strong>único</strong> factor, y admite que si los jóvenes cargan tanto ese lado, <strong>la culpa es en parte de ellos dos</strong>. La negación del determinismo, firmada desde dentro.' },
  { y: '1957', icon: '🛡️', label: 'Popper y la inmunización', text: 'En <strong>«La miseria del historicismo»</strong>, Popper describe el mecanismo: la tesis <strong>se reinterpreta cada vez que falla</strong> y queda a salvo de cualquier hecho. <strong>Una explicación que gana siempre ha dejado de explicar.</strong> Etiqueta: <strong>la crítica clásica</strong>.' },
  { y: '1978', icon: '⚖️', label: 'Cohen y la defensa limpia', text: 'En <strong>«La teoría de la historia de Karl Marx: una defensa»</strong>, G. A. Cohen sostiene la parte defendible con argumentos limpios y suelta la que no lo es. Etiqueta: <strong>defensa analítica seria</strong>, y está en la lista precisamente <strong>para no quedarse con la caricatura de ningún bando</strong>.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  maquina: {
    nombre: 'El hombre máquina (1747)', icon: '⚙️',
    estructura: { title: 'Qué es', info: '• De <strong>La Mettrie</strong>, publicado sin firma en Leiden<br>• <strong>Si el cuerpo cambia lo que se piensa, el que piensa es el cuerpo</strong><br>• Etiqueta: <strong>clásico sólido como documento de su tiempo</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• La idea le vino de una <strong>fiebre</strong>: la cabeza más lenta<br>• Un siglo después se pudo ver: <strong>Phineas Gage, 1848</strong><br>• Hoy lo confirman lesiones, fármacos y escáneres' },
    enfermedades: { title: 'Dónde se cae', info: '• Citar su <strong>fisiología</strong>, que está superada, en vez de su gesto<br>• Contar el caso Gage con los adornos que los historiadores <strong>corrigieron</strong><br>• Creer que con esto queda explicado <strong>lo que se siente por dentro</strong>' },
    cuidados: { title: 'En esta casa', info: '• La etiqueta se dice <strong>entera</strong>: fisiología superada, gesto no<br>• La frontera se declara: <strong>la conciencia es la etapa 3</strong><br>• Y a Angelly se le contesta: <strong>lo que pasa en el cuerpo cambia lo que piensas</strong>' },
  },
  base: {
    nombre: 'La base material (1859)', icon: '🏗️',
    estructura: { title: 'Qué es', info: '• Del <strong>prólogo de 1859</strong>: el modo de producir la vida material <strong>condiciona</strong> las ideas<br>• Con <strong>«La ideología alemana»</strong>: las ideas dominantes son las de la clase dominante<br>• Etiqueta de las dos: <strong>clásico cuestionado</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• <strong>De qué vive</strong> una institución, con números si se pueden<br>• Y la pregunta que revela lo de encima: <strong>qué frase no puede decir sin que a alguien le cueste</strong><br>• Se escribe sin adjetivos, como un inventario' },
    enfermedades: { title: 'Dónde se cae', info: '• Confundir la base con <strong>una acusación</strong>: no lo es<br>• Suponer que quien habla <strong>no cree lo que dice</strong><br>• Concluir que lo que la institución afirma es <strong>falso</strong>: eso no lo dice la base' },
    cuidados: { title: 'En esta casa', info: '• Se audita la institución y <strong>no se desprecia a la gente que vive dentro</strong><br>• Se empieza por la propia: <strong>de qué vive M.E.T.A.S</strong><br>• Y el favor recibido <strong>también se declara</strong>, que también es base' },
  },
  condiciona: {
    nombre: 'Condicionar, no determinar', icon: '🎲',
    estructura: { title: 'Qué es', info: '• <strong>Condicionar:</strong> la base carga los dados<br>• <strong>Determinar:</strong> la base dicta el resultado<br>• El verbo del texto de 1859 es <strong>condiciona</strong>, y ahí cabe la etapa' },
    funcion: { title: 'Cómo se reconoce', info: '• <strong>Prueba de una línea:</strong> ¿qué tendría que pasar para que fuera falso?<br>• Si hay respuesta, condiciona; si no hay, se pasó de la raya<br>• Y cuenta las excepciones en vez de llamarlas apariencia' },
    enfermedades: { title: 'Dónde se cae', info: '• Deducir <strong>la frase del bolsillo</strong> y la intención de la posición<br>• Predecir el desenlace <strong>con fecha</strong>: ahí falló la versión dura<br>• Confundir <strong>saber la corriente con saber el resultado</strong>' },
    cuidados: { title: 'En esta casa', info: '• La imagen que se memoriza: <strong>el agua mueve los mazos y no elige el paño</strong><br>• Toda explicación material se escribe <strong>de modo que se pueda desmentir</strong><br>• Y si no se puede, no se guarda' },
  },
  criticas: {
    nombre: 'Las críticas al lado', icon: '🛡️',
    estructura: { title: 'Qué es', info: '• <strong>Popper (1957):</strong> la tesis dura <strong>se inmuniza</strong><br>• <strong>Las profecías:</strong> fallaron con fechas, y en 1917 al revés de lo previsto<br>• <strong>Cohen (1978):</strong> defensa analítica seria, quita lo indefendible' },
    funcion: { title: 'Cómo se reconoce', info: '• Una tesis inmunizada <strong>encaja con cualquier resultado</strong><br>• Y el documento que lo zanja desde dentro: <strong>la carta de Engels a Bloch, 1890</strong><br>• Ahí Engels reparte la culpa de la exageración entre él y Marx' },
    enfermedades: { title: 'Dónde se cae', info: '• Dejarlas <strong>en nota al pie</strong>, que es donde muere lo que incomoda<br>• Usar a Popper para <strong>tirar la herramienta entera</strong><br>• O usar a Cohen para <strong>salvar también lo indefendible</strong>' },
    cuidados: { title: 'En esta casa', info: '• Las críticas van <strong>al lado de la tesis</strong>, en la misma página<br>• El tribunal completo a Marx <strong>vive en el Expediente Rojo</strong>, y se remite<br>• Aquí entran solo como el manual de fallos de la herramienta' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Cree que las ideas caen del cielo ☁️' },
  { t: 25, n: 'Sabe que el cuerpo explica al que piensa ⚙️' },
  { t: 55, n: 'Nombra la base material de una institución 🏗️' },
  { t: 90, n: 'Distingue condicionar de determinar 🎲' },
  { t: 130, n: 'Reconoce una explicación inmunizada 🔒' },
  { t: 165, n: 'Defiende la parte defendible, sin trampas ⚖️' },
  { t: 190, n: 'Audita sin brocha gorda, y dice qué sobrevive 🔍' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la base material superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la etapa explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de condicionamientos y determinismos' },
  id_master: { icon: '🔍', label: 'Identificador de piezas y fuentes maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del taller' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta de los Átomos y los Ídolos completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  /* --- el cuento a la manera de Borges --- */
  { t: 'Borges', q: '¿Qué encargo recibió el narrador del cuento?', o: ['a) La historia de una virtud, la puntualidad, para un volumen conmemorativo', 'b) Catalogar una biblioteca donada', 'c) Traducir a La Mettrie al español', 'd) Escribir la biografía de Marx'], c: 0 },
  { t: 'Borges', q: '¿Cuál fue el hallazgo que le cambió el trabajo?', o: ['a) Que los antiguos elogiaban mucho la puntualidad', 'b) Que los moralistas antiguos no le dedican un renglón: era una virtud joven y fabricada', 'c) Que el encargo estaba mal pagado', 'd) Que la palabra no existía en latín'], c: 1 },
  { t: 'Borges', q: 'Según el cuento, ¿qué mostró E. P. Thompson en 1967?', o: ['a) Que el reloj se inventó en la Edad Media', 'b) Que los obreros odiaban las fábricas', 'c) Que al pasar del trabajo por tarea al trabajo por hora, la gente cambió de moral', 'd) Que la puntualidad es una virtud antigua'], c: 2 },
  { t: 'Borges', q: '¿Cuáles fueron las dos preguntas que le hizo su madre?', o: ['a) Cuánto le pagaban y cuándo terminaba', 'b) Por qué escribía tan largo y para quién', 'c) Si había leído a Marx y si lo había entendido', 'd) Qué tendría que ocurrir para que alguna frase suya fuera falsa, y si el cariño de ella también era el crédito con otro nombre'], c: 3 },
  { t: 'Borges', q: '¿Cómo quedó el volumen después de rehacerlo?', o: ['a) Más corto y menos brillante, con el cariño sin nota y sin explicar', 'b) Más largo y más valiente', 'c) Igual que las ochenta páginas', 'd) Sin publicar'], c: 0 },
  /* --- el capítulo a la manera de Cervantes --- */
  { t: 'Cervantes', q: '¿Qué recuerda Sancho al oír el golpeteo?', o: ['a) La aventura de los molinos de viento', 'b) La noche en que ató las manos a Rocinante y al amanecer eran seis mazos de batán', 'c) La cueva de Montesinos', 'd) El pleito de la bacía'], c: 1 },
  { t: 'Cervantes', q: '¿Qué responde don Quijote sobre el ruido que ya lo engañó una vez?', o: ['a) Que hay que huir de él', 'b) Que hay que atacarlo de noche', 'c) Que hay que ir a ver de qué está hecho, que en verlo se acaba el miedo y empieza el saber', 'd) Que conviene rezar primero'], c: 2 },
  { t: 'Cervantes', q: 'Según don Quijote, ¿qué es lo que el agua NO hace en el batán?', o: ['a) Mover la rueda', 'b) Alzar los mazos', 'c) Correr todo el año', 'd) Escoger qué paño se pone debajo, de qué color y para quién'], c: 3 },
  { t: 'Cervantes', q: '¿Qué le pregunta don Quijote al «señor Mercado» que subió el precio del maíz?', o: ['a) De qué está hecho, dónde vive y quién le mueve los mazos', 'b) Cuánto cobra por quintal', 'c) Si es cristiano viejo', 'd) Quién le dio licencia del concejo'], c: 0 },
  { t: 'Cervantes', q: '¿Qué señal da don Quijote para conocer cuándo uno se ha pasado de la raya?', o: ['a) Que el otro se enoje', 'b) Preguntarse qué tendría que suceder para que lo que uno dice fuese falso', 'c) Que la frase sea muy larga', 'd) Que no haya testigos'], c: 1 },
  /* --- el ensayo a la manera de Harari --- */
  { t: 'Harari', q: 'Según el ensayo, ¿por qué se cita el caso de Phineas Gage con una advertencia?', o: ['a) Porque no está documentado', 'b) Porque ocurrió en Europa', 'c) Porque las versiones más novelescas del caso han sido corregidas por los historiadores', 'd) Porque Gage no sobrevivió'], c: 2 },
  { t: 'Harari', q: '¿Cuál es la palabra del prólogo de 1859 que el ensayo manda leer con lupa?', o: ['a) Producción', 'b) Sociedad', 'c) Estructura', 'd) Condiciona'], c: 3 },
  { t: 'Harari', q: '¿Para qué usa el ensayo la tesis de Lynn White Jr. sobre el estribo?', o: ['a) Como contraejemplo: es una tesis discutida, y sirve para distinguir condicionar de determinar', 'b) Como prueba definitiva del feudalismo', 'c) Para desmentir a Thompson', 'd) Para explicar la Revolución rusa'], c: 0 },
  { t: 'Harari', q: '¿Qué falló en público y con fecha, según el ensayo?', o: ['a) El experimento de Gage', 'b) La versión dura de la tesis: la revolución llegó en 1917 a un país poco industrializado', 'c) El libro de Cohen', 'd) La carta de Engels'], c: 1 },
  { t: 'Harari', q: '¿Cuáles son las dos cosas difíciles que el ensayo pide al final?', o: ['a) Leer a Marx entero y aprenderse las fechas', 'b) Escribir a los diarios y organizarse', 'c) No adivinarle la intención a nadie, y hacerse la misma pregunta a uno mismo', 'd) Dejar de oír radio y cambiar de escuela'], c: 2 },
]);
B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: 'La Mettrie publicó «El hombre máquina» en ___.', a: '1747' },
  { t: 'las tres', q: 'El prólogo de Marx que se cita en los tres textos es de ___.', a: '1859' },
  { t: 'Borges', q: 'El trabajo de E. P. Thompson sobre el tiempo y la disciplina del trabajo es de ___.', a: '1967' },
  { t: 'Borges', q: 'El narrador escribió ochenta páginas en ___ días y las creyó valientes.', a: 'once' },
  { t: 'Borges', q: 'La madre del narrador fue ___ durante cuarenta años.', a: 'lavandera' },
  { t: 'Cervantes', q: 'Al amanecer, lo que sonaba en la oscuridad eran seis mazos de ___.', a: 'batán' },
  { t: 'Cervantes', q: 'Sancho había atado las manos a ___ para que su amo no fuese.', a: 'Rocinante' },
  { t: 'Harari', q: 'A Phineas Gage le atravesó la cabeza una barra de hierro en ___.', a: '1848' },
  { t: 'Harari', q: 'Lynn White Jr. publicó «Medieval Technology and Social Change» en ___.', a: '1962' },
  { t: 'Harari', q: 'La carta de Engels a Joseph Bloch es del 21 de septiembre de ___.', a: '1890' },
]);
B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan a la misma distinción por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento instala el error como vergüenza propia y no como advertencia ajena: el narrador descubre una llave verdadera, se emborracha con ella, escribe ochenta páginas en once días y lo desarma su madre con dos preguntas en la cocina. Eso se recuerda porque humilla un poco, y porque el lector se reconoce en el entusiasmo antes de reconocerse en la caída. El capítulo lo vuelve escena, risa y refrán, y aporta lo que los otros dos no tienen: la máquina delante, con su rueda y sus mazos, de modo que la distinción se ve en vez de explicarse, y además trae el mismo golpeteo que de noche fue gigante y de día fue mecanismo. El ensayo lo pone a escala de especie y con datos comprobables, y por eso es el único que sirve para citar en una discusión: Thompson y el reloj de la fábrica en 1967 frente al estribo discutido de Lynn White en 1962, y la carta de 1890. Quien lee solo una se queda sin la vergüenza, sin la imagen o sin la prueba.' },
  { q: '2. El narrador del cuento y Sancho cometen el mismo error con distinta cara. Nómbralo, señala en qué se parecen sus dos versiones y en qué se distinguen.', guia: 'El error es el mismo y tiene nombre en la misión: el reduccionismo de brocha gorda, que consiste en tomar una relación material verdadera y convertirla en una explicación universal que ya no se puede desmentir. El narrador lo hace por arriba, con erudición: escribe que la honradez del comerciante es el crédito con otro nombre y que la modestia del artesano es la escasez bien peinada, y lo hace en ochenta páginas que le parecen valientes. Sancho lo hace por abajo, con refrán: sale del molino diciendo que todo lo que la gente dice lo dice por lo que cobra, y lo dice contento porque le ha salido barato. Se parecen en la estructura, que es la que importa: los dos ganan siempre, los dos ahorran el trabajo de comprobar y los dos terminan hablando de personas en vez de relaciones. Se distinguen en el tono y en el precio social: al narrador su error lo lleva a un volumen impreso, y a Sancho lo corrige don Quijote antes de que agravie a un cura. En los dos casos la corrección es la misma pregunta, la de una línea.' },
  { q: '3. Don Quijote dice que el agua mueve los mazos y no escoge el paño, y añade que también miente el que dice que la corriente no hace nada. Explica las dos mitades y por qué la segunda es la que casi nadie dice.', guia: 'La primera mitad es la advertencia contra el determinismo: sin agua no hay golpe, así que la corriente condiciona de verdad y no de mentira, pero no decide qué paño se pone debajo, ni de qué color, ni para quién. Quien confunde las dos cosas cree que sabe el resultado cuando solo sabe la corriente. La segunda mitad es la advertencia contraria y va con una frase dura: quien dice que la corriente no hace nada miente también, y con más daño, porque ese es el que no repara el canal cuando se seca. Casi nadie la dice por dos razones. Una es de conveniencia: negar el condicionamiento deja a cada quien como único responsable de su suerte, y esa idea le sale muy barata a quien ya tiene la corriente a favor. La otra es de método: reconocer que la base condiciona obliga a mirar números, contratos y horarios, que es trabajo, mientras que negarlo se hace con una frase. La misión pide sostener las dos mitades a la vez, y por eso el caso del módulo de emprendimiento aparece con las dos correcciones.' },
  { q: '4. El ensayo pone a Thompson (1967) y a Lynn White (1962) uno al lado del otro. Explica para qué sirve esa pareja y qué etiqueta lleva cada uno.', guia: 'Sirve para enseñar, con dos casos reales, la diferencia entre una explicación material que se puede comprobar y una que se queda en tesis discutida. Thompson mostró, con archivos, que cuando el trabajo dejó de medirse por tarea y pasó a medirse por hora aparecieron el reloj de la fábrica, las multas por retraso y, en dos generaciones, una virtud del carácter que los padres enseñaban con orgullo; ese es un condicionamiento documentado, con mecanismo visible y consecuencias que se pueden rastrear. Lynn White sostuvo que el estribo, al hacer posible el combate a caballo con lanza, explica el nacimiento del feudalismo; es elegante y sigue discutida, porque otros medievalistas la han rebatido durante décadas. Las etiquetas, entonces, son distintas y hay que decirlas: el trabajo de Thompson entra como historia documentada, y la tesis de White entra como tesis discutida. Y el ensayo lo dice explícitamente: una herramienta que solo se ilustra con sus aciertos es propaganda. Poner al lado el caso que no cerró es lo que vuelve creíble al que sí cerró.' },
  { q: '5. ¿Por qué el cuento termina dejando el cariño de la madre «sin nota y sin explicar»? Relaciónalo con la regla de que la auditoría no es un ácido universal.', guia: 'Porque hay cosas que sobreviven enteras a la auditoría, y decirlo es parte del oficio y no una concesión sentimental. La auditoría contesta dos preguntas: de qué está hecho algo y qué relaciones lo sostienen. No contesta si lo que examina es verdadero, ni si vale la pena, ni si es sincero. El narrador había empezado a contestar las tres con la misma herramienta, y por eso su madre pudo hacerle la pregunta que lo desarmó: si el cariño con que lo crió también era el crédito con otro nombre. La respuesta correcta no es que el cariño no tenga condiciones materiales (las tiene: hubo comida, hubo horarios, hubo cansancio), sino que de esas condiciones no se sigue que el cariño sea otra cosa disfrazada. Dejarlo sin nota es la manera de escribir esa distinción. Y tiene además una consecuencia práctica: quien no sabe decir qué sobrevive termina en el cinismo, que es la caricatura adolescente de esta materia, y pierde la capacidad de distinguir un fraude de una institución imperfecta pero útil.' },
  { q: '6. Compara la corrección que recibe el narrador del cuento con la que recibe Sancho en el camino. ¿Cuál es más eficaz y por qué?', guia: 'La del narrador es una pregunta y llega desde alguien sin autoridad académica: su madre, lavandera durante cuarenta años, le pide que diga qué tendría que ocurrir en el mundo para que alguna de sus frases resultara falsa. La de Sancho es una advertencia y llega desde su amo, con ejemplos y con una regla explícita: si dices que el ventero alaba su vino porque lo vende, dices algo que se puede mirar; si dices que el cura predica porque le pagan y lo dices sin haberlo mirado, ni has probado nada ni has entendido nada, y de camino has agraviado a un hombre. Se puede defender cualquiera de las dos como más eficaz si se argumenta. La del cuento suele ganar por una razón que conviene ver: no explica nada y por eso obliga a pensar, y además viene con un caso propio (el cariño) que el narrador no puede despachar. La de don Quijote tiene la ventaja de traer el criterio ya formulado y un ejemplo del daño causado a un tercero, que es la parte que el narrador todavía no había visto. Lo común a las dos, y es lo que hay que señalar, es que ninguna discute el contenido: las dos atacan la forma, es decir el hecho de que la explicación no se pueda desmentir.' },
  { q: '7. El capítulo empieza con un ruido que de noche parece gigante y de día resulta ser una máquina. Explica qué tiene que ver eso con el tema de la etapa y con la etapa anterior de esta ruta.', guia: 'La escena es la conexión entre las dos etapas y por eso está elegida. En la etapa 1 la pregunta de la materia se estrenó contra el miedo: se estudia el mecanismo y el miedo pierde a su cobrador. Aquí el mismo gesto sube de escala: ir a ver de qué está hecho el ruido es exactamente lo que después se hace con el precio del maíz y con el señor Mercado, y la respuesta de don Quijote lo dice sin adornos, que en verlo se acaba el miedo y empieza el saber. Hay además una diferencia que conviene marcar y que es propia de esta etapa: el batán, una vez visto, no desaparece, sigue golpeando y sigue haciendo su trabajo. Descubrir el mecanismo de una cosa no la disuelve, la vuelve auditable. El miedo del capítulo veinte se acaba al amanecer; el precio del maíz no se acaba porque uno sepa qué bodegas lo mueven. Y esa es justamente la diferencia entre desmontar un fantasma y auditar una institución, que es el paso que esta etapa añade.' },
  { q: '8. El ensayo dice que la sinceridad de quien habla «no es lo contrario del condicionamiento, es el modo en que el condicionamiento funciona». Explica esa frase y da un ejemplo.', guia: 'Significa que el condicionamiento material no necesita mentirosos para funcionar, y que suponer lo contrario es el error de fondo de la brocha gorda. Lo que la base hace no es obligar a nadie a decir lo que no cree: hace que unas ideas resulten más fáciles de pensar, más cómodas de sostener y más baratas de decir en voz alta, de modo que quien las sostiene llega a creerlas con toda honradez. Doña Rosa, la del guion de esta misión, es el ejemplo limpio: creía de verdad que el que no madruga es porque no quiere, y lo creía porque a ella el mundo la había premiado por madrugar; nadie la engañó, y cuando le cambiaron el turno cambió de idea sin que nadie discutiera con ella. El ejemplo puede ser cualquier otro con esas dos piezas, la sinceridad y la ventaja. La consecuencia práctica es doble y hay que decirla: no se le adivina la intención a nadie, y no se toma la sinceridad del otro como prueba de que no hay condicionamiento, porque son cosas que caben juntas.' },
  { q: '9. Los tres textos citan a Popper y a Cohen. Explica por qué una misión que enseña la herramienta de Marx incluye a su crítico más famoso y a un defensor que le quita partes.', guia: 'Porque en esta materia las críticas van al lado de la tesis y no en nota al pie, y porque las dos piezas hacen trabajos distintos que la herramienta necesita. Popper, en «La miseria del historicismo» de 1957, aporta el manual de fallos: describe la inmunización, es decir el hábito de reinterpretar la tesis cada vez que los hechos la contradicen, hasta dejarla a salvo de todo y sin decir nada. Sin esa crítica, el que aprende la herramienta la defenderá con uñas la primera vez que falle en la vida real, que es exactamente lo que hizo el narrador del cuento en once días. Cohen, en 1978, aporta lo contrario y por eso hace falta: enseña que se puede defender la parte defendible con argumentos limpios si primero se suelta la que no lo es, que es lo que hace un adulto con una herencia. Juntos evitan las dos salidas fáciles: tirar la herramienta entera porque una versión suya falló, y salvarla entera porque alguna parte sirve. Y encima está el documento que lo zanja desde dentro, la carta de Engels a Bloch de 1890.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué esa etiqueta pertenece al temario de esta etapa en particular, y qué pasaría si se quitara.', guia: 'Porque esta etapa enseña a preguntar de qué está hecho un texto y qué lo sostiene, y un pastiche sin declarar es un texto cuya base material está escondida: el lector cree estar recibiendo la autoridad de Borges, de Cervantes o de Harari, cuando lo que hay detrás es una casa que escribe misiones para sus hijas. Enseñar a auditar el origen de un discurso y ocultar el propio sería la contradicción más rápida posible. Hay además una razón que es exactamente el tema: la voz prestada funciona como una base material invisible, porque una tesis suena más verdadera dicha con el periodo de Cervantes, y esa ventaja no la produce el argumento sino el timbre. La etiqueta obliga a separar las dos cosas, que es la misma separación que la etapa pide entre lo que una idea afirma y lo que la sostiene. Si se quitara, pasarían dos cosas comprobables: alguien citaría a Thompson, a Popper o la carta de Engels a través de una frase que ninguno escribió, y la casa quedaría produciendo el tipo de fuente inflada que su propio compendio manda cazar.' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_atomos_maquina_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena la auditoría de la base y la prueba de una línea. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se escribe de qué vive la institución, como un inventario y sin adjetivos: quién paga, cuánto, cada cuánto y por qué, con números si se pueden conseguir y con el hueco declarado si no; y se busca la frase que ahí adentro no se puede decir sin que a alguien le cueste dinero, que es la pregunta comprobable que revela lo que se levanta encima. Después se escribe el condicionamiento con el verbo del prólogo de 1859, que es CONDICIONA: la base carga los dados y hace unas ideas más probables que otras, pero no dice qué número sale, y se pasa a determinismo en cuanto de la base se deduce la frase o la intención de alguien. A esa altura se aplica sin excepción la prueba de una línea, qué tendría que pasar para que esto fuera falso; si no hay respuesta, la explicación se inmunizó, que es lo que Popper describió en 1957, y se tacha y se reescribe con una relación que sí se pueda mirar. Luego pasan las fuentes por la regla del estatus, con fecha y etiqueta: La Mettrie 1747 como clásico sólido como documento de su tiempo (fisiología superada, gesto no), el prólogo de 1859 y La ideología alemana como clásicos cuestionados citados con sus críticas, Popper 1957 como la crítica clásica, Cohen 1978 como defensa analítica seria, y la carta de Engels a Bloch del 21 de septiembre de 1890, que niega el determinismo desde dentro; y los lempiras se dicen enteros, con lo que compran y con lo que piden a cambio. Y al final van las dos casillas que separan el oficio del desahogo: qué NO se concluye, que es la intención de nadie, la sinceridad de nadie y la verdad o falsedad de lo que dice, y qué sobrevive entero a la auditoría, porque esto no es un acido universal; encima de las dos va el pago, que es la base propia de esta casa, con su renglon de que evidencia haria cambiar la idea que esa base abarata.";');

/* ---------- lo que arrastra el molde (la etapa 3 de las Gafas) ---------- */
const textos = [
  [/🧬 \*Ruta de las Gafas a la Vista · Etapa 3\* 🧬\\n\\nEl mapa de las familias: siete familias, siete núcleos, y ninguna entra por su caricatura\. 🧬\\n\\n_Incluye evaluación conceptual, la familia en la mesa, guion de video, tres lecturas y sus 35 preguntas\._ ✍️/g,
    '⚙️ *Ruta de los Átomos y los Ídolos · Etapa 2* ⚙️\\n\\nEl hombre máquina y la base material: el agua mueve los mazos, pero no decide qué paño se abatana. ⚙️\\n\\n_Incluye evaluación conceptual, la base sobre la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/El mapa de las familias/g, 'El hombre máquina y la base material'],
  [/La familia en la mesa/g, 'La base sobre la mesa'],
  [/la familia en la mesa/g, 'la base sobre la mesa'],
  [/Etapa 3 de la Ruta de las Gafas a la Vista/g, 'Etapa 2 de la Ruta de los Átomos y los Ídolos'],
  [/Ruta de las Gafas a la Vista · Etapa 3 de 7/g, 'Ruta de los Átomos y los Ídolos · Etapa 2 de 6'],
  /* este vive en el encabezado de las dos pruebas imprimibles, y es el que se
     le escapó al primer grep en misiones pasadas: no dice «de 7» sino
     «· Estudio Mayor» */
  [/Ruta de las Gafas a la Vista · Etapa 3 · Estudio Mayor/g, 'Ruta de los Átomos y los Ídolos · Etapa 2 · Estudio Mayor'],
  /* y lo que quede del nombre de la ruta anterior, ya sin número */
  [/Ruta de las Gafas a la Vista/g, 'Ruta de los Átomos y los Ídolos'],
  [/const msgs=\['¡Sigue recorriendo el mapa!','¡Muy buen trabajo!','¡Aprendiz de cartógrafo!','¡Ya distingues la mejor versión del muñeco!','¡Dibujas las siete familias sin caricatura!'\]/,
    "const msgs=['¡Sigue buscando el mecanismo!','¡Muy buen trabajo!','¡Aprendiz de auditor!','¡Ya distingues condicionar de determinar!','¡Auditas sin brocha gorda!']"],
  [/\['#78350f','#d97706','#a8a29e','#3f6212','#00b894'\]/, "['#0369a1','#38bdf8','#a8a29e','#c2410c','#00b894']"],
  /* el azul de plano y el naranja de óxido en las pruebas y en las hojas */
  [/#78350f/g, '#0369a1'],
  [/#4a1f09/g, '#082f49'],
  [/#fdf3e7/g, '#eff8ff'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/La libertad del individuo, que no se sacrifica a ningún plan colectivo\./g, 'Si la fiebre cambia lo que uno piensa, el que piensa es el cuerpo.'],
  [/>Núcleo del liberalismo \(Mill, 1859\)</g, '>El hombre máquina (La Mettrie, 1747)<'],
  /* las preguntas fijas de la prueba competencial preguntaban por las familias */
  [/¿De qué familia es el texto del caso y cómo se sabe sin que se declare, y cuál es su núcleo en la versión que un militante firmaría\? Explica qué fuente lo sostiene con su etiqueta de estatus, la condición escrita que deja la casa y qué familia propia hay que dibujar para pagar la regla\./g,
    '¿De qué vive materialmente la institución del caso, y qué se puede afirmar como condicionamiento sin pasarse a determinismo? Explica qué fuente lo sostiene con su etiqueta, qué prueba lo desmentiría, qué NO se concluye y qué sobrevive entero a la auditoría.'],
  [/1\. ¿Cuál de los dos pone en pie la mejor versión y cuál dibuja un muñeco\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos se puede desmentir y cuál se inmuniza? 2. ¿Por qué no son la misma decisión?'],
  /* el subtítulo del pliego de las tres lecturas */
  [/Un cuento, un capítulo de caballerías y un ensayo, sobre el mismo mapa de familias/g,
    'Un cuento, un capítulo de caballerías y un ensayo, sobre la misma corriente'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'El cajón de los siete sin firma',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'El silbato de las seis',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'De cómo cada parecer fue defendido por su contrario',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'De lo que sonaba en la oscuridad, y de quién movía los mazos',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'Siete sistemas operativos para una sola especie',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'La especie que piensa con lo que tiene en las manos',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa anterior era la unidad que describe a una
   familia. Aquí es el cuaderno de Jael: escribir la brocha gorda («lo dice
   porque le pagan») o escribir el condicionamiento con su prueba. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(prueba){sfx(prueba?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(prueba){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🎲</span><span class="ms-text"><strong>Quedó escrito el condicionamiento:</strong> «tres programas de la misma emisora coinciden en esto, y los tres los paga la misma cooperativa». Una relación que cualquiera puede ir a mirar, y ninguna intención puesta en boca de nadie.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✅</span><span class="ms-text"><strong>Y debajo, la prueba:</strong> «se vería el día que alguien diga lo contrario en ese micrófono». Con eso la hoja se puede desmentir, y por eso se puede sostener delante de alguien. La auditoría empieza aquí, no en la sospecha.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🖌️</span><span class="ms-text"><strong>Quedó escrita una brocha gorda:</strong> una intención supuesta, sin prueba, sobre una persona con nombre. Suena valiente y explica todo de un plumazo, que es justo la señal de alarma.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega en dos partes:</strong> la frase no se puede desmentir (si argumenta, es porque le pagan; si calla, también), y de camino agravia a alguien. Popper le puso nombre a ese mecanismo en 1957. Se tacha y se reescribe con la relación y su prueba.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='maquina',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"maquina\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/🧬/g, '⚙️');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
