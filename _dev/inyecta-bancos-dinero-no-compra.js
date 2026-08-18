/* Inyecta los bancos de la misión «Lo que el dinero no debe comprar» (Ruta
   del Expediente Dorado, etapa 3: Crítica al Capitalismo, materia 27 del
   Estudio Mayor) sobre el molde copiado de la etapa 2 de esta misma ruta,
   que es la misión más reciente y completa.
   Uso:  node _dev/inyecta-bancos-dinero-no-compra.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Sandel, «What Money Can't Buy» (2012): FILOSOFÍA POLÍTICA
       CONTEMPORÁNEA. De aquí sale la separación entre las dos objeciones.
     · Satz, «Why Some Things Should Not Be for Sale» (2010): FILOSOFÍA
       POLÍTICA CONTEMPORÁNEA, Y LA MÁS OPERATIVA: cuatro parámetros que se
       encienden por separado.
     · Anderson, «Value in Ethics and Economics» (1993): LA BASE FILOSÓFICA.
     · Titmuss, «The Gift Relationship» (1970): CLÁSICO FUNDADOR, Y
       DISCUTIDO. Nunca se cita solo.
     · Arrow, «Gifts and Exchanges» (1972): LA CONTRACRÍTICA OBLIGADA, y de
       un premio Nobel.
     · Gneezy y Rustichini, «A Fine is a Price» (2000): EXPERIMENTO DE
       CAMPO. La multa subió los retrasos, y quitarla no los devolvió.
     · Frey y Oberholzer-Gee (1997) y Frey y Jegen (2001): EXPERIMENTO DE
       CAMPO el primero, LA TEORÍA QUE LO ORDENA el segundo.
     · Lacetera, Macis y Slonim, en «Science» (2013): DISPUTA EMPÍRICA VIVA.
       Los incentivos sí aumentaron la donación de sangre.
     · Fryer (2011): EXPERIMENTO ALEATORIZADO GRANDE. Pagar por insumos
       funcionó mejor que pagar por resultados.
     · Roth, «Repugnance as a Constraint on Markets» (2007): DISEÑO DE
       MERCADOS, Nobel en 2012 con Lloyd Shapley.
     · Brennan y Jaworski, «Markets Without Limits» (2015): EL ACERO DEL
       BANDO CONTRARIO. Se contesta, no se esquiva.
     · Zelizer, «Morals and Markets» (1979): HISTORIA SOCIAL. El asco cambia.
     · Marco legal citado: la National Organ Transplant Act de 1984 en
       Estados Unidos, y el sistema regulado de compensación por riñón que
       existe en Irán desde 1988. Entran juntos, porque cada uno incomoda a
       un lado distinto.

   La idea que ordena todos los bancos: SON DOS OBJECIONES Y NO UNA. La de
   JUSTICIA dice que el trato no fue libre, y se puede arreglar quitando la
   urgencia; la de CORRUPCIÓN dice que el precio degrada el bien, y si vale,
   vale siempre. La destreza de la etapa es poner un bien concreto sobre la
   mesa, decir cuál de las dos le cabe, MOSTRAR QUÉ SE PIERDE, escoger una
   de las CUATRO SALIDAS (permitir, permitir con reglas, sacar el dinero y
   diseñar otro mecanismo, o prohibir) y calcular su factura.

   Tres cuidados del compendio gobiernan la misión. Uno: la objeción de
   corrupción SE MUESTRA Y NO SE AFIRMA. Dos: toda tesis entra con SU ACERO
   AL LADO, y aquí el acero es Brennan y Jaworski. Tres: el modo de fallar
   de la etapa es SALTAR DEL ASCO A LA PROHIBICIÓN, y contra eso van la hoja
   del bien y la regla heredada de la etapa 2: NINGUNA REGLA ES GRATIS, y
   prohibir también tiene factura y también tiene víctimas.

   Y la regla de selección de la materia, que se respeta en los bancos: los
   conflictos vivos del patio entran COMO CATEGORÍA y no como caso con
   nombre propio. Comprar votos y comprar sentencias se estudian como
   mecanismo; no se le pone la etiqueta a ninguna persona ni a ningún
   partido, y la política hondureña de hoy no entra ni de ejemplo. */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-dorado-dinero-no-compra', 'js', 'dinero-no-compra.js');
/* ---------- sopa de letras: generador determinista ---------- */
/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20261103;
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
  { w: 'Las dos objeciones', a: '⚖️ Cuando alguien dice «eso no debería venderse» está diciendo una de dos cosas muy distintas: <strong>la objeción de justicia</strong> (el trato no fue libre) o <strong>la objeción de corrupción</strong> (el precio degrada el bien). Las separó <strong>Michael Sandel</strong> en <strong>«What Money Can\'t Buy» (2012)</strong>.' },
  { w: 'La objeción de justicia', a: '⚖️ Dice que <strong>una de las partes no estaba eligiendo de verdad</strong>, porque entró con una necesidad urgente que la otra no tenía. No objeta el mercado en sí, sino <strong>las condiciones en que se firmó</strong>. Si esas condiciones cambian, la objeción se cae sola.' },
  { w: 'La objeción de corrupción', a: '🩸 Dice que <strong>hay bienes que cambian de naturaleza cuando se les pone precio</strong>, aunque el trato sea libre y entre iguales. No salen peores: <strong>ya no son la misma cosa</strong>. Un amigo comprado no es un amigo flojo: no es un amigo.' },
  { w: 'La asimetría entre las dos', a: '🔑 <strong>La de justicia se puede arreglar</strong> (quitando la urgencia, informando, poniendo reglas al contrato) <strong>y la de corrupción no</strong>: si vale, vale siempre. Por eso una pide reformar el mercado y la otra pide sacarlo de ahí.' },
  { w: 'Los cuatro parámetros de Satz', a: '📐 De <strong>«Why Some Things Should Not Be for Sale» (2010)</strong>, y se encienden por separado: <strong>vulnerabilidad</strong>, <strong>agencia débil</strong>, <strong>daño extremo a la persona</strong> y <strong>daño extremo a la sociedad</strong>. Sirven para medir qué tan tóxico es un mercado concreto, no para decir sí o no de golpe.' },
  { w: 'Elizabeth Anderson (1993)', a: '📚 En <strong>«Value in Ethics and Economics»</strong> pone la base: <strong>valorar no es un verbo único</strong>. Se usa una herramienta, se respeta a una persona, se venera un símbolo. Tratar como mercancía lo que se valoraba de otro modo es <strong>un error de tipo, no de precio</strong>.' },
  { w: 'Desplazamiento de motivos', a: '🧪 <strong>El precio no se suma al motivo: a veces lo reemplaza.</strong> Mientras algo se hacía por vergüenza, por vecindad o por deber, uno lo hacía; cuando pasa a costar, uno paga y se queda tranquilo. Lo ordenaron como teoría <strong>Bruno Frey y Reto Jegen en 2001</strong>.' },
  { w: 'Titmuss (1970)', a: '🩸 En <strong>«The Gift Relationship»</strong> comparó la sangre donada con la comprada y sostuvo que pagar la empeoraba. Etiqueta: <strong>clásico fundador, y discutido</strong>. <strong>Nunca se cita solo</strong>: va con Arrow y con la evidencia posterior.' },
  { w: 'Arrow (1972)', a: '✋ En <strong>«Gifts and Exchanges»</strong> le objetó a Titmuss que <strong>de esos datos no salía esa conclusión moral</strong>. Etiqueta: <strong>la contracrítica obligada</strong>, y de un premio Nobel. Citar a Titmuss sin Arrow es citar la mitad que conviene.' },
  { w: 'La multa de la guardería', a: '⏰ <strong>Gneezy y Rustichini, «A Fine is a Price» (2000)</strong>: unas guarderías multaron a los padres impuntuales y <strong>los retrasos subieron</strong>. La multa convirtió un favor en un servicio. Y el remate: <strong>cuando quitaron la multa, no volvieron a bajar</strong>.' },
  { w: 'El pueblo suizo y el depósito', a: '🇨🇭 <strong>Frey y Oberholzer-Gee (1997)</strong>: un pueblo aceptaba mayoritariamente un depósito de residuos peligrosos, y <strong>cuando se ofreció dinero por aceptarlo, el apoyo bajó</strong>. Etiqueta: <strong>experimento de campo</strong>.' },
  { w: 'La disputa que sigue viva', a: '⚖️ <strong>Lacetera, Macis y Slonim</strong> publicaron en <strong>«Science» (2013)</strong> experimentos de campo grandes donde <strong>los incentivos sí aumentaron la donación de sangre</strong>. El desplazamiento existe, pero <strong>no es automático</strong>: depende del bien, del monto y de la forma del pago.' },
  { w: 'Fryer (2011)', a: '🎓 Midió qué pasa cuando se paga a estudiantes: <strong>pagar por insumos (leer un libro) funcionó bastante mejor que pagar por resultados (subir la nota)</strong>. Etiqueta: <strong>experimento aleatorizado grande</strong>. De ahí sale la regla de XP que esta casa se aplica a sí misma.' },
  { w: 'La repugnancia como restricción', a: '🧩 <strong>Alvin Roth, «Repugnance as a Constraint on Markets» (2007)</strong>: el asco de la gente <strong>no es un error que corregir, es una condición del terreno</strong>, como la gravedad para un ingeniero. Cambia con el tiempo, y aun así es terca y real.' },
  { w: 'Las cuatro salidas', a: '🚪 <strong>Permitir</strong> (si ninguna objeción se sostiene), <strong>permitir con reglas</strong> (si la objeción es de justicia), <strong>sacar el dinero y diseñar otro mecanismo</strong> (la salida de Roth, que casi nadie propone) y <strong>prohibir</strong> (si el daño a la sociedad es grave y no hay diseño mejor). Cuatro y no dos.' },
  { w: 'El acero: Brennan y Jaworski (2015)', a: '🔩 En <strong>«Markets Without Limits»</strong> sostienen que <strong>si puedes hacer algo gratis, puedes hacerlo por dinero</strong>, y que lo reprobable, cuando lo hay, está en el acto y no en el pago. <strong>Quien no pueda decir dónde falla ese argumento no terminó la etapa.</strong>' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Cuántas objeciones serias hay contra poner precio a un bien, y quién las separó?', o: ['a) Dos, y las separó Michael Sandel en 2012', 'b) Una sola, y es el asco', 'c) Cuatro, y las separó Alvin Roth', 'd) Ninguna: cualquier trato libre es correcto'], c: 0 },
  { q: 'La objeción de justicia sostiene que…', o: ['a) El precio degrada el bien aunque el trato sea libre', 'b) El trato no fue libre de verdad, porque una parte estaba con la urgencia encima', 'c) Todo mercado es injusto', 'd) El dinero es sucio por naturaleza'], c: 1 },
  { q: '¿Cuál es la asimetría clave entre las dos objeciones?', o: ['a) Las dos se caen si mejora el mundo', 'b) Ninguna se puede discutir con datos', 'c) La de justicia se puede arreglar mejorando las condiciones, y la de corrupción, si vale, vale siempre', 'd) La de corrupción es más fácil de probar'], c: 2 },
  { q: 'Los cuatro parámetros de Debra Satz (2010) sirven para…', o: ['a) Prohibir todo mercado incómodo', 'b) Medir por separado qué tan tóxico es un mercado concreto', 'c) Calcular el precio justo de cualquier bien', 'd) Demostrar que el mercado siempre funciona'], c: 1 },
  { q: 'En el experimento de la guardería de Gneezy y Rustichini (2000), al poner la multa por llegar tarde…', o: ['a) Los retrasos bajaron y se mantuvieron bajos', 'b) No cambió nada', 'c) Los retrasos subieron, y quitar la multa no los devolvió al punto de partida', 'd) Los padres dejaron de llevar a los niños'], c: 2 },
  { q: '¿Por qué Titmuss (1970) nunca se cita solo en esta casa?', o: ['a) Porque su libro no existe', 'b) Porque Kenneth Arrow le objetó en 1972 y la evidencia posterior lo discutió, y ocultarlo sería citar la mitad que conviene', 'c) Porque era economista y no filósofo', 'd) Porque su tesis quedó demostrada del todo'], c: 1 },
  { q: 'Lacetera, Macis y Slonim publicaron en «Science» (2013) que…', o: ['a) Los incentivos sí aumentaron la donación de sangre en experimentos de campo', 'b) Pagar por sangre la vuelve siempre peor', 'c) La sangre donada no sirve', 'd) El desplazamiento de motivos no existe en ningún caso'], c: 0 },
  { q: 'La tesis de Alvin Roth (2007) sobre la repugnancia es que…', o: ['a) Hay que enseñarle a la gente a superarla', 'b) Es una prueba moral definitiva', 'c) Es una restricción real del terreno, con la que hay que diseñar en vez de discutir', 'd) Nunca cambia con el tiempo'], c: 2 },
  { q: '¿Cuáles son las cuatro salidas ante un bien delicado?', o: ['a) Vender, prohibir, callar y esperar', 'b) Permitir, permitir con reglas, sacar el dinero y diseñar otro mecanismo, o prohibir', 'c) Regular el precio, subsidiar, importar o exportar', 'd) Solo dos: vender o prohibir'], c: 1 },
  { q: 'El acero de Brennan y Jaworski (2015) dice que…', o: ['a) Todos los mercados son buenos', 'b) El dinero corrompe todo lo que toca', 'c) Prohibir siempre funciona', 'd) Si algo puede regalarse también puede venderse, y lo reprobable, cuando lo hay, está en el acto y no en el pago'], c: 3 },
]);

/* ---------- clasificar ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Justicia', 'Corrupción'],
    headA: '⚖️ Justicia: el trato no fue libre',
    headB: '🩸 Corrupción: el precio degrada el bien',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Vende porque debe la operación de un hijo', t: 'ok' },
      { w: 'Una disculpa que se paga ya no es una disculpa', t: 'no' },
      { w: 'Firma sin entender el riesgo a treinta años', t: 'ok' },
      { w: 'Un premio de honor comprado solo dice cuánto tenía el comprador', t: 'no' },
      { w: 'El daño es grave y no se puede deshacer', t: 'ok' },
      { w: 'La fila deja de ser el lugar donde todos valen igual', t: 'no' },
      { w: 'Una parte puede esperar y la otra no', t: 'ok' },
      { w: 'Un amigo comprado no es un amigo flojo: no es un amigo', t: 'no' },
    ],
  },
  {
    label: ['Se puede arreglar', 'Si vale, vale siempre'],
    headA: '🛠️ Se cae si mejoran las condiciones',
    headB: '🪨 No depende de las condiciones',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La objeción de justicia', t: 'ok' },
      { w: 'La objeción de corrupción', t: 'no' },
      { w: 'Quitar la urgencia la desactiva', t: 'ok' },
      { w: 'Vale aunque las dos partes sean iguales', t: 'no' },
      { w: 'Se ataca con información y con reglas del contrato', t: 'ok' },
      { w: 'Exige mostrar qué se pierde en concreto', t: 'no' },
      { w: 'Pide reformar el mercado', t: 'ok' },
      { w: 'Pide sacar el mercado de ahí', t: 'no' },
    ],
  },
  {
    label: ['Argumento', 'Asco sin argumento'],
    headA: '🩸 Argumento: se puede discutir',
    headB: '😖 Asco: no se puede discutir',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Se pierde el único lugar donde todos valían igual»', t: 'ok' },
      { w: '«Eso no se vende y punto»', t: 'no' },
      { w: '«Está encendida la vulnerabilidad, y aquí está por qué»', t: 'ok' },
      { w: '«A mí me da asco y con eso basta»', t: 'no' },
      { w: '«Prohibirlo costaría esto, y lo pagaría esta gente»', t: 'ok' },
      { w: '«Todo lo que se vende se corrompe»', t: 'no' },
      { w: '«Esto se notaría así si de verdad se perdió»', t: 'ok' },
      { w: '«Siempre ha sido así»', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Es de otra etapa o de otra materia'],
    headA: '🩸 Se estudia en esta etapa',
    headB: '🏠 Es de otra etapa o materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Las dos objeciones de Sandel', t: 'ok' },
      { w: 'Los cuatro supuestos del teorema y sus fallas', t: 'no' },
      { w: 'Los cuatro parámetros de Satz', t: 'ok' },
      { w: 'La teoría de la justicia leída entera, con Rawls y Nozick', t: 'no' },
      { w: 'El desplazamiento de motivos y su disputa viva', t: 'ok' },
      { w: 'La desigualdad y el clima, que son las dos facturas', t: 'no' },
      { w: 'La repugnancia como restricción de diseño', t: 'ok' },
      { w: 'Adam Smith leído entero y no en media frase', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['Son', 'dos', 'objeciones,', 'no', 'una.'], c: 1, art: 'Cuántas objeciones serias hay' },
  { s: ['La', 'objeción', 'de', 'justicia', 'mira', 'las', 'condiciones.'], c: 3, art: 'La objeción que se cae si mejoran las condiciones' },
  { s: ['La', 'objeción', 'de', 'corrupción', 'mira', 'el', 'bien.'], c: 3, art: 'La objeción que no depende de las condiciones' },
  { s: ['Satz', 'dio', 'cuatro', 'parámetros', 'que', 'se', 'encienden', 'aparte.'], c: 3, art: 'Lo que Satz aportó para poder medir' },
  { s: ['El', 'precio', 'a', 'veces', 'reemplaza', 'el', 'motivo.'], c: 4, art: 'Lo que el precio le hace al motivo anterior' },
  { s: ['La', 'multa', 'de', 'la', 'guardería', 'subió', 'los', 'retrasos.'], c: 5, art: 'Lo que hicieron los retrasos con la multa' },
  { s: ['Roth', 'trató', 'la', 'repugnancia', 'como', 'una', 'restricción.'], c: 6, art: 'Cómo trató Roth el asco de la gente' },
  { s: ['Las', 'salidas', 'son', 'cuatro', 'y', 'no', 'dos.'], c: 3, art: 'Cuántas salidas hay de verdad' },
]);

/* ---------- completar la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'Las objeciones serias contra poner precio a un bien son ___.', opts: ['dos', 'cuatro', 'siete'], c: 0 },
  { s: 'La objeción de ___ dice que el trato no fue libre.', opts: ['justicia', 'corrupción', 'diseño'], c: 0 },
  { s: 'La objeción de ___ dice que el precio degrada el bien.', opts: ['corrupción', 'justicia', 'escasez'], c: 0 },
  { s: 'Debra Satz dio ___ parámetros que se encienden por separado.', opts: ['cuatro', 'dos', 'diez'], c: 0 },
  { s: 'En la guardería, la multa hizo que los retrasos ___.', opts: ['subieran', 'bajaran', 'desaparecieran'], c: 0 },
  { s: 'A Titmuss (1970) le respondió ___ en 1972.', opts: ['Kenneth Arrow', 'Michael Sandel', 'Alvin Roth'], c: 0 },
  { s: 'Roth trató la repugnancia como una ___ del terreno.', opts: ['restricción', 'tontería', 'prueba'], c: 0 },
  { s: 'Entre vender y prohibir está la salida de ___.', opts: ['diseñar otro mecanismo', 'callarse', 'esperar'], c: 0 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Justicia', 'Corrupción'],
    btnA: '⚖️ Justicia', btnB: '🩸 Corrupción',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Vende por una deuda urgente', t: 'ok' },
      { w: 'Un premio comprado', t: 'no' },
      { w: 'Firma sin entender', t: 'ok' },
      { w: 'Una disculpa pagada', t: 'no' },
      { w: 'Una parte no puede esperar', t: 'ok' },
      { w: 'Un amigo comprado', t: 'no' },
      { w: 'Daño grave e irreversible', t: 'ok' },
      { w: 'La fila que deja de igualar', t: 'no' },
      { w: 'Se arregla quitando la urgencia', t: 'ok' },
      { w: 'Si vale, vale siempre', t: 'no' },
    ],
  },
  {
    label: ['Evidencia', 'Filosofía'],
    btnA: '🧪 Evidencia', btnB: '📚 Filosofía',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La multa de la guardería', t: 'ok' },
      { w: 'Las dos objeciones de Sandel', t: 'no' },
      { w: 'El pueblo suizo y el depósito', t: 'ok' },
      { w: 'Los modos de valorar de Anderson', t: 'no' },
      { w: 'Los experimentos de 2013 en Science', t: 'ok' },
      { w: 'Los cuatro parámetros de Satz', t: 'no' },
      { w: 'Pagar por leer contra pagar por notas', t: 'ok' },
      { w: 'Si se regala, se puede vender', t: 'no' },
      { w: 'La sangre donada y la comprada', t: 'ok' },
      { w: 'Valorar no es un verbo único', t: 'no' },
    ],
  },
  {
    label: ['Argumento', 'Consigna'],
    btnA: '🩸 Argumento', btnB: '📢 Consigna',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Nombra la objeción', t: 'ok' },
      { w: '«Eso no se vende»', t: 'no' },
      { w: 'Muestra qué se pierde', t: 'ok' },
      { w: '«Todo se corrompe»', t: 'no' },
      { w: 'Escoge una de las cuatro salidas', t: 'ok' },
      { w: '«Hay que prohibirlo»', t: 'no' },
      { w: 'Cuenta las víctimas de prohibir', t: 'ok' },
      { w: '«Prohibir no le hace daño a nadie»', t: 'no' },
      { w: 'Contesta a Brennan y Jaworski', t: 'ok' },
      { w: '«Ese argumento ni vale la pena»', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se decide si un bien se vende o no',
    steps: [
      'Describir el bien: quién vende, quién compra y qué cambia de manos de verdad',
      'Preguntar cuál de las dos objeciones le cabe, o si no le cabe ninguna',
      'Si es de justicia, encender los cuatro parámetros de Satz uno por uno',
      'Si es de corrupción, mostrar qué se pierde, quién lo pierde y cómo se notaría',
      'Escoger entre las cuatro salidas, y no entre dos',
      'Y calcular la factura de esa salida, incluidas las víctimas de prohibir',
    ],
  },
  {
    label: 'El experimento de la multa, paso a paso',
    steps: [
      'Los padres llegaban tarde y las maestras se quedaban esperando',
      'Se pone una multa por cada retraso, que es lo que dicta el sentido común',
      'Llegar tarde deja de ser una falta de consideración y pasa a tener precio',
      'Quien paga el precio ya no tiene por qué sentir vergüenza',
      'Los retrasos suben en vez de bajar',
      'Y al quitar la multa no vuelven a bajar, porque la vergüenza ya no se recuelga',
    ],
  },
  {
    label: 'La salida de diseño, la que casi nadie propone',
    steps: [
      'Se observa que la gente rechaza que ese bien se compre y se venda',
      'Se acepta ese rechazo como una condición del terreno, no como un error',
      'Se busca dónde estaba de verdad el problema, que casi nunca es el precio',
      'En los riñones el problema era de emparejamiento y no de precio',
      'Se diseña un mecanismo que resuelve eso sin que el dinero entre a la sala',
      'Y se escribe también lo que cuesta montar y sostener ese mecanismo',
    ],
  },
]);

/* ---------- identificar la pieza o la fuente por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Separó la objeción de justicia de la de corrupción, en un libro de 2012', ans: 'Michael Sandel', opts: ['Michael Sandel', 'Debra Satz', 'Alvin Roth', 'Richard Titmuss'] },
  { desc: 'Dio cuatro parámetros que se encienden por separado para medir un mercado nocivo', ans: 'Debra Satz', opts: ['Debra Satz', 'Elizabeth Anderson', 'Kenneth Arrow', 'Roland Fryer'] },
  { desc: 'Mostró que valorar no es un verbo único: no se respeta a un amigo como se usa un martillo', ans: 'Elizabeth Anderson', opts: ['Elizabeth Anderson', 'Viviana Zelizer', 'Debra Satz', 'Bruno Frey'] },
  { desc: 'Comparó en 1970 la sangre donada con la comprada y sostuvo que pagar la empeoraba', ans: 'Richard Titmuss', opts: ['Richard Titmuss', 'Kenneth Arrow', 'Uri Gneezy', 'Alvin Roth'] },
  { desc: 'Le objetó a Titmuss en 1972 que de esos datos no salía esa conclusión moral', ans: 'Kenneth Arrow', opts: ['Kenneth Arrow', 'Michael Sandel', 'Aldo Rustichini', 'Peter Jaworski'] },
  { desc: 'Midieron la multa de la guardería en 2000 y encontraron que los retrasos subieron', ans: 'Gneezy y Rustichini', opts: ['Gneezy y Rustichini', 'Frey y Jegen', 'Lacetera y Macis', 'Brennan y Jaworski'] },
  { desc: 'Trató la repugnancia como una restricción del terreno y diseñó cadenas de trasplante', ans: 'Alvin Roth', opts: ['Alvin Roth', 'Lloyd Shapley', 'Roland Fryer', 'Michael Sandel'] },
  { desc: 'Sostienen que si algo puede regalarse también puede venderse, y hay que contestarles', ans: 'Brennan y Jaworski', opts: ['Brennan y Jaworski', 'Frey y Oberholzer-Gee', 'Titmuss y Arrow', 'Sandel y Satz'] },
]);

/* ---------- qué le toca a ese bien ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«Vende el riñón porque debe la operación de su hijo»', func: 'La objeción: es de justicia, porque la deuda es la que habla', opts: ['La objeción: es de justicia, porque la deuda es la que habla', 'La objeción de corrupción', 'La factura de prohibir', 'Un asco sin argumento'] },
  { trans: '«Una disculpa pagada ya no dice nada del que la dio»', func: 'La objeción: es de corrupción, y aquí sí se muestra qué se pierde', opts: ['La objeción: es de corrupción, y aquí sí se muestra qué se pierde', 'La objeción de justicia', 'Una de las cuatro salidas', 'La factura de la regla'] },
  { trans: '«Poner citas por teléfono para que madrugar deje de ser la moneda»', func: 'Una salida de diseño: se saca el dinero y se cambia el mecanismo', opts: ['Una salida de diseño: se saca el dinero y se cambia el mecanismo', 'La objeción de corrupción', 'La objeción de justicia', 'Una consigna sin argumento'] },
  { trans: '«Prohibir la venta deja a la gente en lista de espera»', func: 'La factura: prohibir también cuesta, y se cuenta con víctimas', opts: ['La factura: prohibir también cuesta, y se cuenta con víctimas', 'La objeción de justicia', 'Una salida de diseño', 'La prueba de la corrupción'] },
  { trans: '«Eso no se vende y punto»', func: 'Ni objeción ni prueba ni factura: es una consigna', opts: ['Ni objeción ni prueba ni factura: es una consigna', 'La objeción de corrupción bien puesta', 'La factura de la regla', 'Una salida de diseño'] },
]);

/* ---------- diagnóstico del argumento ---------- */
B.enfermedadData = JSON.stringify([
  { disease: '«Eso no se vende y punto», y ahí termina la anotación', characteristic: 'No dice cuál de las dos objeciones está usando, así que no hay nada que discutir ni nada que comprobar; puede que la intuición sea correcta y aun así la frase no sirve para decidir', opts: ['No dice cuál de las dos objeciones está usando, así que no hay nada que discutir ni nada que comprobar; puede que la intuición sea correcta y aun así la frase no sirve para decidir', 'Está mal porque todo se puede vender', 'Le falta calcular el precio de mercado', 'Confunde el monopolio con el monopsonio'] },
  { disease: 'Se afirma que el precio corrompe el bien, y no se dice qué se pierde', characteristic: 'La objeción de corrupción se muestra, no se afirma: hay que decir qué se pierde en concreto, quién lo pierde y cómo se notaría; sin eso lo que hay es una costumbre, y las costumbres cambian', opts: ['La objeción de corrupción se muestra, no se afirma: hay que decir qué se pierde en concreto, quién lo pierde y cómo se notaría; sin eso lo que hay es una costumbre, y las costumbres cambian', 'Le falta citar a Pigou', 'El error es usar un experimento en vez de filosofía', 'El problema es que la corrupción no existe'] },
  { disease: 'Se prohíbe el mercado y se da por resuelto el asunto', characteristic: 'Prohibir no hace desaparecer la necesidad que creó el mercado: aparece la versión clandestina, con los mismos daños y ninguna protección, y esa factura se escribe con víctimas concretas', opts: ['Prohibir no hace desaparecer la necesidad que creó el mercado: aparece la versión clandestina, con los mismos daños y ninguna protección, y esa factura se escribe con víctimas concretas', 'Prohibir siempre es la respuesta correcta', 'Falta subir el precio para que se ordene solo', 'El error es no haber consultado a un economista'] },
  { disease: 'Se cita a Titmuss (1970) y se cierra el tema con eso', characteristic: 'Es media cita: Arrow le objetó en 1972 y los experimentos de 2013 en Science encontraron lo contrario en donación de sangre, así que la disputa está viva y se enseña viva', opts: ['Es media cita: Arrow le objetó en 1972 y los experimentos de 2013 en Science encontraron lo contrario en donación de sangre, así que la disputa está viva y se enseña viva', 'Titmuss nunca escribió sobre sangre', 'El error es citar un libro tan viejo', 'Faltaba citar a Coase con su advertencia'] },
  { disease: 'Se descarta el argumento de Brennan y Jaworski porque incomoda', characteristic: 'Es la regla del acero al revés: la tesis contraria entra en su mejor versión y se contesta, y quien la esquiva no está defendiendo su posición, está evitando ponerla a prueba', opts: ['Es la regla del acero al revés: la tesis contraria entra en su mejor versión y se contesta, y quien la esquiva no está defendiendo su posición, está evitando ponerla a prueba', 'Ese argumento no existe en la literatura', 'Es correcto descartarlo porque es del otro bando', 'Basta con decir que están equivocados'] },
  { disease: 'Se usa la etapa para ponerle etiqueta a un funcionario con pleito abierto', characteristic: 'Rompe la regla de selección de la materia: los conflictos vivos del patio entran como categoría y nunca como caso con nombre, porque la herramienta sirve para pensar el mecanismo y no para ganar la discusión de esta semana', opts: ['Rompe la regla de selección de la materia: los conflictos vivos del patio entran como categoría y nunca como caso con nombre, porque la herramienta sirve para pensar el mecanismo y no para ganar la discusión de esta semana', 'Está bien, porque el caso es real', 'Le falta agregar el nombre del partido', 'El error es no haber puesto cifras'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Son dos, y no una: la de justicia y la de corrupción.', type: 'Las dos objeciones' },
  { s: 'Vulnerabilidad, agencia débil, daño extremo a la persona y daño extremo a la sociedad.', type: 'Los cuatro parámetros de Satz' },
  { s: 'El precio no se suma al motivo: a veces lo reemplaza.', type: 'El desplazamiento de motivos' },
  { s: 'Permitir, permitir con reglas, sacar el dinero y diseñar, o prohibir.', type: 'Las cuatro salidas' },
  { s: 'Los retrasos subieron, y quitar la multa no los devolvió.', type: 'La guardería de Gneezy y Rustichini' },
  { s: 'El asco no es un error que corregir, es una condición del terreno.', type: 'La repugnancia según Roth' },
  { s: 'Si puedes hacerlo gratis, puedes hacerlo por dinero.', type: 'El acero de Brennan y Jaworski' },
  { s: 'Prohibir también tiene factura, y a veces la paga una lista de espera.', type: 'La factura de prohibir' },
  { s: 'Valorar no es un verbo único: no se respeta a un amigo como se usa un martillo.', type: 'Los modos de valorar de Anderson' },
  { s: 'El asco cambia con el siglo, y por eso no basta como argumento.', type: 'La repugnancia, y por qué no prueba' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Sandel (2012)', gen: 'Fuente', n: 'La separación de las dos objeciones', g: '«What Money Can\'t Buy»', t: 'Filosofía política contemporánea' },
  { w: 'Satz (2010)', gen: 'Fuente', n: 'Los cuatro parámetros', g: '«Why Some Things Should Not Be for Sale»', t: 'La más operativa' },
  { w: 'Anderson (1993)', gen: 'Fuente', n: 'Los modos de valorar', g: '«Value in Ethics and Economics»', t: 'La base filosófica' },
  { w: 'Titmuss (1970)', gen: 'Fuente', n: 'La sangre donada y la comprada', g: '«The Gift Relationship»', t: 'Clásico fundador, y discutido' },
  { w: 'Arrow (1972)', gen: 'Fuente', n: 'La objeción a Titmuss', g: '«Gifts and Exchanges»', t: 'Contracrítica obligada' },
  { w: 'Gneezy y Rustichini (2000)', gen: 'Fuente', n: 'La multa que subió los retrasos', g: '«A Fine is a Price»', t: 'Experimento de campo' },
  { w: 'Lacetera, Macis y Slonim (2013)', gen: 'Fuente', n: 'Los incentivos que sí funcionaron', g: 'En «Science»', t: 'Disputa empírica viva' },
  { w: 'Roth (2007)', gen: 'Fuente', n: 'La repugnancia como restricción', g: '«Repugnance as a Constraint on Markets»', t: 'Diseño de mercados, Nobel 2012' },
  { w: 'Brennan y Jaworski (2015)', gen: 'Fuente', n: 'Si se puede regalar, se puede vender', g: '«Markets Without Limits»', t: 'El acero del bando contrario' },
  { w: 'Zelizer (1979)', gen: 'Fuente', n: 'El seguro de vida, de escándalo a rutina', g: '«Morals and Markets»', t: 'Historia social' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Las objeciones serias son ___.', opts: ['dos', 'cinco', 'ninguna'], ans: 'dos' },
  { s: 'La objeción de ___ se cae si mejoran las condiciones.', opts: ['justicia', 'corrupción', 'diseño'], ans: 'justicia' },
  { s: 'La objeción de corrupción hay que ___, no afirmarla.', opts: ['mostrarla', 'gritarla', 'repetirla'], ans: 'mostrarla' },
  { s: 'Satz propuso ___ parámetros.', opts: ['cuatro', 'tres', 'nueve'], ans: 'cuatro' },
  { s: 'La multa de la guardería hizo ___ los retrasos.', opts: ['subir', 'bajar', 'desaparecer'], ans: 'subir' },
  { s: 'A Titmuss le contestó ___ en 1972.', opts: ['Arrow', 'Sandel', 'Roth'], ans: 'Arrow' },
  { s: 'Las salidas son ___ y no dos.', opts: ['cuatro', 'tres', 'siete'], ans: 'cuatro' },
  { s: 'Prohibir también tiene ___.', opts: ['factura', 'premio', 'garantía'], ans: 'factura' },
]);

B.explainQuestions = JSON.stringify([
  { q: '¿Cuáles son las dos objeciones contra poner precio a un bien, y por qué no da lo mismo cuál se está usando?', ans: 'La objeción de justicia dice que el trato no fue libre de verdad, porque una de las partes entró con una necesidad urgente que la otra no tenía; la de corrupción dice que el bien cambia de naturaleza cuando se le pone precio, aunque el trato sea libre e informado. Michael Sandel las separó en «What Money Can\'t Buy», de 2012. No da lo mismo cuál se usa porque cada una se prueba distinto y lleva a reglas distintas. La de justicia se prueba mirando las condiciones, y por eso se puede resolver mejorándolas: si nadie estuviera desesperado, la objeción se caería sola. La de corrupción no depende de las condiciones, así que si vale, vale siempre, y por eso no pide reformar el mercado sino sacarlo de ahí. Confundirlas es la razón por la que estas discusiones no avanzan: uno responde con datos sobre pobreza a alguien que estaba hablando del bien mismo, o al revés.' },
  { q: '¿Para qué sirven los cuatro parámetros de Debra Satz, y por qué son mejores que una lista de bienes prohibidos?', ans: 'Son cuatro preguntas que se encienden por separado sobre un mercado concreto: si una parte es vulnerable, si entiende de verdad lo que firma, si el daño sobre ella es grave e irreversible, y si el daño alcanza a quienes no participaron. Vienen de «Why Some Things Should Not Be for Sale», de 2010. Son mejores que una lista de bienes prohibidos por dos razones. La primera es que una lista no explica nada: dice qué está prohibido, no por qué, y por eso no sirve para un caso nuevo. La segunda es que los parámetros gradúan la respuesta. Si solo se enciende el primero, la salida no es prohibir sino atacar la urgencia; si se enciende el cuarto, que es el más raro, la prohibición se justifica de verdad, y por eso casi todas las sociedades prohíben comprar votos y sentencias. Una lista obliga a decir sí o no; los parámetros permiten decir qué está mal exactamente y qué habría que cambiar para que dejara de estarlo.' },
  { q: 'Explica el desplazamiento de motivos con el experimento de la guardería, y di por qué el detalle final es el más importante.', ans: 'Uri Gneezy y Aldo Rustichini publicaron en 2000 «A Fine is a Price». Unas guarderías empezaron a cobrar una multa a los padres que llegaban tarde a recoger a los niños, y los retrasos aumentaron en vez de disminuir. La explicación es que el precio no se sumó al motivo anterior: lo reemplazó. Mientras llegar tarde era una falta de consideración con las maestras, uno se apuraba por vergüenza; cuando pasó a costar una cantidad, uno paga y llega tranquilo, porque ya compró el derecho. Bruno Frey y Reto Jegen ordenaron el fenómeno como teoría en 2001 con el nombre de desplazamiento de motivos. El detalle final es el más importante: cuando quitaron la multa, los retrasos no volvieron a bajar. Eso significa que la operación no era reversible, y por lo tanto que poner precio a algo no es una prueba que se pueda deshacer si sale mal. La vergüenza no se vuelve a colgar en la pared, y por eso la pregunta previa (qué se estaba haciendo aquí sin dinero) hay que hacerla antes y no después.' },
  { q: '¿Por qué esta casa nunca cita a Titmuss solo, y qué muestra eso sobre el método?', ans: 'Porque su tesis tiene una contracrítica obligada y una disputa empírica viva encima. Richard Titmuss sostuvo en «The Gift Relationship», de 1970, que pagar por sangre reducía y empeoraba la donación. Kenneth Arrow, premio Nobel, le respondió en 1972 en «Gifts and Exchanges» que de esos datos no se seguía esa conclusión moral. Y en 2013, Nicola Lacetera, Mario Macis y Robert Slonim publicaron en «Science» experimentos de campo grandes donde los incentivos sí aumentaron la donación. Citar solo a Titmuss sería quedarse con la mitad que conviene, que es exactamente el vicio que esta materia enseña a cazar cuando lo cometen otros: es la misma falta que citar a Coase sin su advertencia de 1988. Lo que muestra sobre el método es que la regla no cambia según el tema ni según de qué lado caiga el resultado. Cuando el dato incómodo va contra la conclusión bonita de la casa, se pone igual, y se pone en el mismo tamaño de letra.' },
  { q: '¿Qué aporta Alvin Roth que no aportan ni Sandel ni Satz, y por qué esta etapa lo considera la pieza más útil?', ans: 'Sandel y Satz ordenan la discusión: dicen qué objeción se está usando y cómo medirla. Roth hace otra cosa: convierte el problema en un problema de ingeniería. En «Repugnance as a Constraint on Markets», de 2007, sostiene que el rechazo de la gente a que ciertas cosas se compren no es un error que haya que corregir con educación, sino una restricción real del terreno, como la gravedad para quien construye un puente. De ahí saca una consecuencia práctica: si la gente no quiere que ese bien se venda, no insista con el precio, cambie el mecanismo. Con los riñones descubrió que el problema no era de precio sino de emparejamiento, y ayudó a construir cadenas de trasplante cruzado que funcionan sin dinero. Recibió el Nobel en 2012 junto a Lloyd Shapley. Es la pieza más útil porque rompe el falso dilema de la discusión pública: frente a un bien delicado las salidas no son dos, vender o prohibir, sino cuatro, y la tercera, diseñar otra cosa, es la que casi nadie propone y la que más vidas ha salvado en este caso concreto.' },
  { q: '¿Cuál es el modo de fallar propio de esta etapa, y cómo se corrige?', ans: 'El modo de fallar es saltar del asco a la prohibición sin pasar por el argumento. Se reconoce por tres señales: se dice «eso no se vende» sin decir cuál de las dos objeciones se está usando; se afirma que el precio corrompe el bien sin mostrar qué se pierde en concreto, quién lo pierde y cómo se notaría; y se pide prohibir sin escribir la factura de prohibir, como si prohibir no tuviera víctimas. La corrección tiene tres pasos que son los mismos de la hoja del bien. Primero se nombra la objeción, o se admite que no cabe ninguna, que también pasa. Segundo se muestra la pérdida, con algo que se pueda comprobar. Tercero se escoge entre las cuatro salidas y se calcula su costo, contando también a los que salen perdiendo si se prohíbe: donde se prohíbe sin resolver aparece la versión clandestina, con los mismos daños y ninguna protección. Y encima va la regla heredada de la etapa 2 sin cambiarle una coma: ninguna regla es gratis.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['JUSTICIA', 'PRECIO', 'BIEN', 'SANDEL', 'SATZ', 'ASCO']),
  haceSopa(10, ['MOTIVO', 'MULTA', 'SANGRE', 'TITMUSS', 'ARROW', 'FAVOR']),
  haceSopa(10, ['ROTH', 'DISENO', 'SALIDA', 'FACTURA', 'REGALO', 'LIMITE']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'Las objeciones serias contra poner precio a un bien son dos, y las separó Michael Sandel en 2012.', a: true },
  { q: 'La objeción de justicia sostiene que el bien cambia de naturaleza cuando se le pone precio.', a: false },
  { q: 'La objeción de corrupción se sostiene aunque las dos partes sean iguales y nadie esté presionado.', a: true },
  { q: 'La objeción de justicia se puede desactivar mejorando las condiciones de quien vende.', a: true },
  { q: 'Debra Satz propuso una lista cerrada de bienes que no se pueden vender.', a: false },
  { q: 'Los cuatro parámetros de Satz se encienden por separado y sirven para graduar la respuesta.', a: true },
  { q: 'En el experimento de la guardería, la multa hizo bajar los retrasos.', a: false },
  { q: 'Después de quitar la multa, los retrasos de la guardería volvieron al punto de partida.', a: false },
  { q: 'Kenneth Arrow le objetó a Titmuss en 1972 que de sus datos no salía esa conclusión moral.', a: true },
  { q: 'Los experimentos de Lacetera, Macis y Slonim publicados en 2013 encontraron que los incentivos sí aumentaron la donación de sangre.', a: true },
  { q: 'Roland Fryer encontró en 2011 que pagar por resultados funcionó mejor que pagar por insumos.', a: false },
  { q: 'Alvin Roth trata la repugnancia como una restricción del terreno con la que hay que diseñar.', a: true },
  { q: 'La repugnancia hacia ciertos mercados nunca ha cambiado a lo largo de la historia.', a: false },
  { q: 'Las salidas ante un bien delicado son cuatro, y una de ellas es diseñar un mecanismo sin dinero.', a: true },
  { q: 'Prohibir un mercado no tiene costos, porque nadie sale perdiendo cuando se prohíbe.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: 'La distinción entre la objeción de justicia y la de corrupción viene de…', o: ['a) Michael Sandel, «What Money Can\'t Buy» (2012)', 'b) Alvin Roth (2007)', 'c) Richard Titmuss (1970)', 'd) Kenneth Arrow (1972)'], a: 0 },
  { q: 'La objeción de justicia dice que…', o: ['a) El precio degrada el bien', 'b) El trato no fue libre, porque una parte entró con la urgencia encima', 'c) Todo mercado es inmoral', 'd) El dinero no debería existir'], a: 1 },
  { q: 'La objeción de corrupción sostiene que…', o: ['a) Los precios están mal calculados', 'b) Hay que subir los salarios', 'c) Hay bienes que cambian de naturaleza cuando se les pone precio', 'd) La gente miente al vender'], a: 2 },
  { q: 'La asimetría entre las dos objeciones es que…', o: ['a) Las dos se caen si mejora el mundo', 'b) Ninguna se puede discutir', 'c) La de corrupción es más fácil de probar', 'd) La de justicia se puede arreglar y la de corrupción, si vale, vale siempre'], a: 3 },
  { q: 'Los cuatro parámetros de Satz (2010) son vulnerabilidad, agencia débil, daño extremo a la persona y…', o: ['a) Daño extremo a la sociedad', 'b) Precio excesivo', 'c) Falta de contrato escrito', 'd) Ausencia de competencia'], a: 0 },
  { q: 'Elizabeth Anderson (1993) aportó la idea de que…', o: ['a) Todo se puede medir en dinero', 'b) Valorar no es un verbo único: no se respeta a un amigo como se usa un martillo', 'c) Los mercados son siempre eficientes', 'd) El Estado debe fijar los precios'], a: 1 },
  { q: 'El desplazamiento de motivos consiste en que…', o: ['a) La gente cambia de trabajo', 'b) Los precios se mueven con la demanda', 'c) El precio no se suma al motivo anterior sino que a veces lo reemplaza', 'd) Los motivos económicos son siempre más fuertes'], a: 2 },
  { q: 'El detalle más importante del experimento de la guardería es que…', o: ['a) Las maestras cobraron más', 'b) Los padres protestaron', 'c) La multa era muy baja', 'd) Al quitar la multa, los retrasos no volvieron a bajar'], a: 3 },
  { q: 'Frey y Oberholzer-Gee (1997) observaron en un pueblo suizo que…', o: ['a) Al ofrecer dinero por aceptar un depósito de residuos, el apoyo bajó', 'b) El dinero convenció a todos', 'c) Nadie quería el depósito desde el principio', 'd) El experimento no pudo hacerse'], a: 0 },
  { q: '¿Por qué esta casa nunca cita a Titmuss (1970) solo?', o: ['a) Porque su libro es difícil de conseguir', 'b) Porque Arrow le objetó en 1972 y la evidencia de 2013 discutió su tesis', 'c) Porque no era economista', 'd) Porque su tesis quedó demostrada'], a: 1 },
  { q: 'Roland Fryer (2011) encontró que…', o: ['a) Pagar a estudiantes nunca funciona', 'b) Pagar siempre mejora las notas', 'c) Pagar por insumos, como leer un libro, funcionó mejor que pagar por resultados', 'd) Los estudiantes rechazan el dinero'], a: 2 },
  { q: 'La tesis de Roth (2007) sobre la repugnancia es que…', o: ['a) Debe eliminarse con educación', 'b) Es una prueba moral definitiva', 'c) Es irrelevante para el diseño', 'd) Es una restricción real del terreno, con la que hay que diseñar'], a: 3 },
  { q: 'La salida de diseño que Roth ayudó a construir para los riñones consiste en…', o: ['a) Cadenas de trasplante cruzado que funcionan sin que el dinero entre a la sala', 'b) Un mercado libre de órganos', 'c) Una lotería nacional', 'd) Prohibir los trasplantes'], a: 0 },
  { q: 'El acero de esta etapa, que hay que contestar y no esquivar, es…', o: ['a) La tesis de Titmuss', 'b) Brennan y Jaworski (2015): si puedes hacerlo gratis, puedes hacerlo por dinero', 'c) Los parámetros de Satz', 'd) El experimento de la guardería'], a: 1 },
  { q: 'La factura de prohibir un mercado incluye…', o: ['a) Solo beneficios', 'b) Nada, porque prohibir es gratis', 'c) La versión clandestina, con los mismos daños y ninguna protección', 'd) Un aumento automático de la oferta'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Las objeciones serias contra poner precio a un bien son ___.', a: 'dos' },
  { q: 'Michael Sandel las separó en un libro de ___.', a: '2012' },
  { q: 'La objeción de ___ dice que el trato no fue libre de verdad.', a: 'justicia' },
  { q: 'La objeción de ___ dice que el precio degrada el bien.', a: 'corrupción' },
  { q: 'Debra Satz propuso ___ parámetros que se encienden por separado.', a: 'cuatro' },
  { q: 'Elizabeth Anderson publicó «Value in Ethics and Economics» en ___.', a: '1993' },
  { q: 'Richard Titmuss publicó «The Gift Relationship» en ___.', a: '1970' },
  { q: 'A Titmuss le respondió Kenneth ___ en 1972.', a: 'Arrow' },
  { q: 'Gneezy y Rustichini publicaron «A Fine is a Price» en ___.', a: '2000' },
  { q: 'En la guardería, los retrasos ___ cuando se puso la multa.', a: 'subieron' },
  { q: 'Frey y Jegen ordenaron el fenómeno como teoría en ___.', a: '2001' },
  { q: 'Alvin Roth escribió sobre la repugnancia como restricción en ___.', a: '2007' },
  { q: 'Roth recibió el Nobel de Economía en ___, junto a Lloyd Shapley.', a: '2012' },
  { q: 'Brennan y Jaworski publicaron «Markets Without Limits» en ___.', a: '2015' },
  { q: 'Las salidas ante un bien delicado son ___, y no dos.', a: 'cuatro' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Objeción de justicia', def: 'El trato no fue libre, porque una parte entró con la urgencia encima' },
  { term: 'Objeción de corrupción', def: 'El precio degrada el bien, aunque el trato sea libre y entre iguales' },
  { term: 'Sandel (2012)', def: 'Separó las dos objeciones, y con eso ordenó la discusión' },
  { term: 'Satz (2010)', def: 'Los cuatro parámetros que se encienden por separado' },
  { term: 'Anderson (1993)', def: 'Valorar no es un verbo único: usar, respetar, venerar' },
  { term: 'Titmuss (1970)', def: 'La sangre donada contra la comprada, y nunca se cita solo' },
  { term: 'Arrow (1972)', def: 'La contracrítica obligada, y de un premio Nobel' },
  { term: 'Gneezy y Rustichini (2000)', def: 'La multa que subió los retrasos, y no los devolvió al quitarla' },
  { term: 'Frey y Oberholzer-Gee (1997)', def: 'El pueblo suizo donde el dinero bajó el apoyo' },
  { term: 'Frey y Jegen (2001)', def: 'La teoría que ordena el desplazamiento de motivos' },
  { term: 'Lacetera, Macis y Slonim (2013)', def: 'Los incentivos que sí aumentaron la donación de sangre' },
  { term: 'Fryer (2011)', def: 'Pagar por insumos funcionó mejor que pagar por resultados' },
  { term: 'Roth (2007)', def: 'La repugnancia como restricción del terreno, y el diseño sin dinero' },
  { term: 'Zelizer (1979)', def: 'La historia del seguro de vida, la prueba de que el asco cambia' },
  { term: 'Brennan y Jaworski (2015)', def: 'El acero: si se puede regalar, se puede vender' },
  { term: 'Las cuatro salidas', def: 'Permitir, permitir con reglas, diseñar sin dinero, o prohibir' },
]);

/* ---------- prueba competencial: el bien sobre la mesa ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'En la fila del centro de salud, quien llega a las cuatro de la mañana consigue el primer turno y se lo vende por doscientos lempiras a quien llega a las siete con prisa. Los dos quedan mejor que antes y nadie fue obligado.' },
  { txt: 'Una empresa ofrece reparar el techo de la escuela, que lleva años goteando, a cambio de poner su nombre en la fachada y repartir su publicidad en las aulas. El techo hace falta de verdad.' },
  { txt: 'El vecino que echaba un ojo a la casa sin cobrar nada aceptó dinero por hacerlo, y desde entonces, si no se le paga, ya no lo hace.' },
  { txt: 'En una conversación de patio alguien dice que vendería un riñón para salir de una deuda. Comprarlo está prohibido en casi todo el mundo, y en un país existe un sistema regulado con compensación donde no hay lista de espera.' },
  { txt: 'El hospital pide reponer con donantes la sangre usada en una operación de la familia, y aparece alguien dispuesto a donar a cambio de dinero.' },
  { txt: 'Una plataforma de estudio le paga puntos a quien lee, acierta y termina, y la casa que la escribió sospecha de ese mecanismo por lo que acaba de aprender en esta etapa.' },
  { txt: 'Alguien propone cobrar entrada en el velorio de un vecino para ayudar a la familia con los gastos, en vez de pasar la colecta como siempre.' },
  { txt: 'En un pueblo se ofrece dinero a las familias por aceptar en sus tierras una obra que nadie quiere cerca, y el apoyo a la obra baja en vez de subir.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. Describe el bien: quién vende, quién compra y qué cambia de manos de verdad.',
  '2. Di cuál de las dos objeciones le cabe (justicia, corrupción, las dos o ninguna), y por qué. Si es de justicia, enciende los cuatro parámetros de Satz uno por uno.',
  '3. Si alegas corrupción, muéstrala: qué se pierde exactamente, quién lo pierde y cómo se notaría. Nombra la fuente de esta etapa que sostiene tu lectura, con su etiqueta y su contracrítica al lado.',
  '4. Escoge una de las cuatro salidas (permitir, permitir con reglas, sacar el dinero y diseñar otro mecanismo, o prohibir), calcula qué cuesta y a quién, contesta el acero de Brennan y Jaworski, y di qué te haría cambiar de opinión.',
]);

B.critCaseGuides = JSON.stringify([
  'Se empieza describiendo el bien como se describe un inventario: quién vende, quién compra y qué cambia de manos de verdad, que casi nunca es lo que parece a primera vista. En la fila no se vende un asiento: se vende el resultado de haber madrugado, y ahí ya está medio caso resuelto.',
  'Después se pregunta cuál de las dos objeciones cabe, y se admite sin vergüenza cuando no cabe ninguna, que pasa más seguido de lo que la indignación permite ver. Si es de justicia, los cuatro parámetros de Satz se encienden uno por uno y por separado: vulnerabilidad, agencia débil, daño extremo a la persona y daño extremo a la sociedad. Encender uno solo no autoriza a prohibir; autoriza a atacar ese uno.',
  'Si se alega corrupción, hay que mostrarla y no afirmarla: decir qué se pierde en concreto, quién lo pierde y cómo se notaría si de verdad se perdió. Esa es la parte que casi nadie escribe, y es la que separa un argumento de una costumbre. Y la fuente entra con su etiqueta y con su contracrítica al lado: Titmuss nunca va sin Arrow ni sin los experimentos de 2013, igual que Coase nunca va sin su advertencia de 1988.',
  'Al final se escoge entre las cuatro salidas y no entre dos, que es lo que hace toda la diferencia: permitir, permitir con reglas, sacar el dinero y diseñar otro mecanismo (la salida de Roth), o prohibir. Se calcula la factura de la que se escoja, contando también a los que salen perdiendo si se prohíbe, porque prohibir sin resolver produce la versión clandestina, con los mismos daños y ninguna protección. Se contesta a Brennan y Jaworski en su mejor versión, y se cierra con el renglón que esta casa exige siempre: qué evidencia haría cambiar la decisión, con fecha.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Eso no se vende y punto".', g1: 'No dice cuál de las dos objeciones está usando, así que no hay nada que discutir ni nada que comprobar; la intuición puede ser correcta y aun así la frase no sirve para decidir nada.', g2: 'La corrección nombra la objeción, muestra qué se pierde y escoge una de las cuatro salidas con su factura.' },
  { txt: '"Todo lo que se vende se corrompe".', g1: 'Una regla que condena todo no selecciona nada, y una regla que no selecciona no es herramienta sino humor: casi todo lo que usamos se compra, empezando por el cuaderno donde se escribió la frase.', g2: 'Se corrige diciendo qué bienes en concreto y por qué, con la pérdida mostrada caso por caso.' },
  { txt: '"Si les incomoda, que se prohíba".', g1: 'Salta del asco a la prohibición sin pasar por el argumento, que es el modo de fallar propio de esta etapa; y el asco cambia con el siglo, como muestra la historia del seguro de vida.', g2: 'Se corrige encendiendo los parámetros de Satz y escribiendo la factura de prohibir, con víctimas concretas.' },
  { txt: '"Titmuss demostró que pagar arruina la donación".', g1: 'Es media cita: Arrow le objetó en 1972 y los experimentos de campo publicados en «Science» en 2013 encontraron que los incentivos aumentaron la donación de sangre.', g2: 'Se corrige diciendo que la disputa está viva, mostrando los dos lados y anotando qué dato la resolvería.' },
  { txt: '"El argumento de Brennan y Jaworski no vale la pena ni contestarlo".', g1: 'Es la regla del acero al revés: la tesis contraria entra en su mejor versión y se contesta, y quien la esquiva no defiende su posición, evita ponerla a prueba.', g2: 'Se corrige reconstruyendo su argumento en su forma más fuerte antes de responderlo.' },
  { txt: '"Prohibir no le hace daño a nadie".', g1: 'Prohibir tiene factura y a veces la paga una lista de espera: donde se prohíbe sin resolver aparece la versión clandestina, con los mismos daños y ninguna protección.', g2: 'Se corrige escribiendo las dos facturas, la de permitir y la de prohibir, y comparándolas.' },
]);

B.critDecisionBank = JSON.stringify([
  'La casa va a escribir sobre la venta de turnos en la fila del centro de salud: ¿qué objeción se nombra primero, y qué salida se recomienda sin fingir que prohibir crea médicos?',
  'Hay que explicarle a la familia por qué el favor del vecino se enfrió cuando se le pagó: ¿qué se dice exactamente, y qué NO se dice del vecino?',
  'El caso del riñón entra al expediente: ¿cómo se escribe para que se enciendan los parámetros uno por uno, y qué se hace con el dato de que prohibir también deja muertos?',
  'La escuela recibió la oferta del techo a cambio del nombre y la publicidad: ¿qué se recomienda, y qué factura se declara junto con la recomendación?',
  'La disputa de la sangre va a la ficha: ¿se cita a Titmuss, a Arrow o a los experimentos de 2013, y qué dato haría falta para poder cerrarla?',
  'La frase de Jael ya está escrita en el cuaderno: ¿se borra o se corrige, y con qué tres renglones se reescribe para que sirva para decidir algo?',
  'Alguien quiere usar esta etapa para señalar a un funcionario con pleito abierto: ¿qué dice la regla de selección de la materia, y cómo se escribe el caso para que entre como categoría?',
  'La casa se audita a sí misma por el XP que paga: ¿qué regla se impone, qué dice Fryer al respecto y qué señal haría cambiar el diseño?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Escribir «vender turnos de la fila reparte por capacidad de pago lo que se repartía por madrugar».', b: 'Escribir «vender turnos de la fila es una vergüenza».', ga: 'Caso A: nombra la objeción y muestra qué cambia, así que de ahí salen las cuatro salidas con sus cuatro facturas y la conversación puede terminar en una decisión.', gb: 'Caso B: describe un sentimiento verdadero y no propone nada; se puede repetir toda la vida sin que la fila cambie.', gr: 'La diferencia no es de tono sino de uso: solo la primera se puede llevar a una reunión donde haya que decidir algo.' },
  { a: 'Citar a Titmuss con Arrow y con los experimentos de 2013 al lado.', b: 'Citar a Titmuss como si hubiera cerrado el asunto en 1970.', ga: 'Caso A: deja la pregunta donde de verdad está, que es de qué depende el desplazamiento (el bien, el monto, la forma del pago), y eso se puede medir.', gb: 'Caso B: usa a un autor como bandera y esconde medio siglo de discusión posterior, que es el vicio que esta materia enseña a cazar.', gr: 'La regla no cambia según el tema: media cita es media cita, aunque la mitad ocultada sea la que a uno le estorba.' },
  { a: 'Proponer citas por teléfono para que madrugar deje de ser la moneda de la fila.', b: 'Proponer prohibir la venta de turnos y dar el asunto por resuelto.', ga: 'Caso A: es la salida de diseño, ataca el mecanismo y no el síntoma, y viene con su costo declarado, que es montar y sostener el sistema de citas.', gb: 'Caso B: prohíbe el intercambio y deja intacta la escasez que lo creó, así que la fila sigue igual y aparece la versión disimulada.', gr: 'Entre vender y prohibir está diseñar, y esa tercera salida es la que casi nadie propone porque exige trabajo en vez de indignación.' },
  { a: 'Decir «la objeción aquí es de justicia, y se ataca quitando la urgencia».', b: 'Decir «la objeción aquí es de corrupción» sin poder decir qué se pierde.', ga: 'Caso A: identifica una objeción que se puede desactivar, y por lo tanto abre una política concreta que se puede evaluar después.', gb: 'Caso B: usa la objeción más fuerte sin pagar su precio, que es mostrar la pérdida; así queda una afirmación que no se puede comprobar ni refutar.', gr: 'La objeción de corrupción es la más poderosa y por eso es la que más exige: quien la use sin mostrar la pérdida la está gastando.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se dice «eso no se vende» sin decir cuál de las dos objeciones es.', guide: 'La frase no se puede usar para nada: no hay salida que se siga de ella, no hay factura que calcular y no hay manera de comprobar si el remedio funcionó. Y de paso enseña que en esta casa las palabras nuevas se usan como banderas, que es justo lo contrario de lo que la etapa quiere. La corrección cabe en una línea: nombrar la objeción, y si no cabe ninguna, decirlo.' },
  { cause: 'Se alega corrupción y no se muestra qué se pierde.', guide: 'Sin la pérdida mostrada no hay diferencia entre un argumento y una costumbre, y las costumbres cambian: el seguro de vida fue escandaloso y hoy no lo es, y esa historia la documentó Zelizer en 1979. Mostrar la pérdida obliga a decir quién la sufre y cómo se notaría, y esas dos preguntas suelen ordenar el caso entero.' },
  { cause: 'Se prohíbe sin escribir la factura de prohibir.', guide: 'Prohibir no hace desaparecer la necesidad que creó el mercado. Donde se prohíbe sin resolver aparece la versión clandestina, con los mismos daños y ninguna de las protecciones, y en algunos casos la factura se paga en lista de espera. Escribir esa factura no significa estar a favor de vender: significa estar dispuesto a mirar el costo de la propia posición.' },
  { cause: 'Se cita a Titmuss sin Arrow y sin los experimentos posteriores.', guide: 'Es exactamente la misma falta que citar a Coase sin su advertencia de 1988, y la casa la castiga igual aunque aquí la mitad ocultada sea la que le conviene a la conclusión bonita. La disputa sobre el desplazamiento de motivos está viva, se enseña viva, y quien la declare cerrada en cualquiera de las dos direcciones está vendiendo postura.' },
  { cause: 'Se descarta el acero de Brennan y Jaworski porque incomoda.', guide: 'La regla del acero, que esta ruta trajo del expediente gemelo, dice que la tesis contraria entra en su mejor versión. Aquí esa tesis es fuerte: si regalar un riñón es admirable, hay que explicar por qué venderlo sería un crimen. Quien no la conteste no ha terminado la etapa, y quien la caricaturice está haciendo lo que la materia entera enseña a no hacer.' },
  { cause: 'Se usa la etapa para señalar a alguien con pleito abierto.', guide: 'Rompe la regla de selección de la materia. Los conflictos vivos del patio entran como categoría y nunca como caso con nombre: se estudia qué hace el dinero con un voto o con una sentencia, y no se le pone la etiqueta a ninguna persona, a ningún partido ni a nadie en campaña. La herramienta sirve para pensar el mecanismo, no para ganar la discusión de esta semana.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'El caso de la fila entró al expediente con su objeción nombrada y su salida escogida.', guide: 'Objeción de justicia, porque reparte por capacidad de pago lo que se repartía por madrugar; y también de corrupción, porque la fila era el único lugar donde el que tiene y el que no tiene valían igual. La salida escogida no es prohibir, porque prohibir no crea médicos, sino cambiar el mecanismo por citas, con su costo declarado: alguien tiene que montar y sostener ese sistema.' },
  { effect: 'La casa pudo explicar por qué el favor del vecino se enfrió sin culpar al vecino.', guide: 'Porque el pago no se sumó al favor: lo reemplazó. Antes era vecindad y se pagaba en vecindad; después fue un servicio y se paga en dinero. Es el mismo mecanismo que midieron Gneezy y Rustichini en 2000 y que Frey y Jegen ordenaron en 2001. Y el detalle que enseña la prudencia: quitar el pago no devuelve el favor, así que la pregunta hay que hacerla antes.' },
  { effect: 'El caso del riñón quedó escrito con los cuatro parámetros encendidos uno por uno.', guide: 'Vulnerabilidad encendida, porque la deuda es la que habla; agencia débil a medias, porque el riesgo a treinta años casi nadie lo entiende; daño extremo a la persona encendido, porque es irreversible; daño a la sociedad, discutible. Y con la otra mitad de la factura escrita: prohibir también deja muertos en lista de espera, y por eso la salida de diseño de Roth es la más seria de las cuatro.' },
  { effect: 'La disputa de la sangre se enseñó viva, con los tres nombres y las tres etiquetas.', guide: 'Titmuss (1970) como clásico fundador y discutido; Arrow (1972) como contracrítica obligada; y Lacetera, Macis y Slonim (2013) como disputa empírica viva. La casa no escogió bando: dijo de qué podría depender la diferencia, que es el bien, el monto, la forma del pago y si es anónimo o público, y anotó cuál sería el dato que la resolvería.' },
  { effect: 'La escuela contestó a la empresa del techo sin quedarse con el techo goteando.', guide: 'La objeción aquí es de corrupción y no de justicia, porque nadie estaba presionado: lo que se pierde es que el aula sea el único lugar donde a un niño no se le habla para venderle algo. Y la factura de decir que no se escribió con la misma letra: el techo sigue goteando. Por eso la respuesta no fue ni aceptar todo ni rechazar todo, sino la franja de en medio, que es donde viven casi todas las decisiones reales: una placa pequeña, sin publicidad en las aulas y por un plazo escrito.' },
  { effect: 'La casa se auditó a sí misma por el XP que paga y dejó la regla por escrito.', guide: 'El riesgo es real y tiene nombre: que el XP reemplace la curiosidad en vez de sumarse. Fryer (2011) encontró que pagar por insumos funciona mejor que pagar por resultados, y por eso esta casa paga sobre todo por hacer. Las preguntas de análisis de las lecturas van sin XP a propósito. Y la señal que obligaría a cambiar el diseño está escrita: que alguien deje de leer el día que ya no dan puntos.' },
]);

/* ---------- línea de tiempo ---------- */
B.timelineData = JSON.stringify([
  { y: '1970', icon: '🩸', label: 'Titmuss y el regalo', text: 'En <strong>«The Gift Relationship»</strong>, Richard Titmuss compara la sangre donada con la comprada y sostiene que <strong>pagar reduce y empeora la donación</strong>. Etiqueta: <strong>clásico fundador, y discutido</strong>. Es el texto con el que empieza toda esta conversación.' },
  { y: '1972', icon: '✋', label: 'Arrow contesta', text: 'En <strong>«Gifts and Exchanges»</strong>, <strong>Kenneth Arrow</strong> le objeta a Titmuss que <strong>de esos datos no se sigue esa conclusión moral</strong>. Etiqueta: <strong>la contracrítica obligada</strong>, y de un premio Nobel. Desde aquí, Titmuss no se cita nunca solo.' },
  { y: '1979', icon: '📜', label: 'Zelizer y el asco que cambia', text: 'En <strong>«Morals and Markets»</strong>, <strong>Viviana Zelizer</strong> documenta cómo el <strong>seguro de vida</strong> pasó de escandaloso a normal. Etiqueta: <strong>historia social</strong>. Es la prueba de que la repugnancia se mueve con el siglo, y por eso no basta como argumento.' },
  { y: '1993', icon: '📚', label: 'Anderson y los modos de valorar', text: 'En <strong>«Value in Ethics and Economics»</strong>, <strong>Elizabeth Anderson</strong> muestra que <strong>valorar no es un verbo único</strong>: se usa una herramienta, se respeta a una persona, se venera un símbolo. Etiqueta: <strong>la base filosófica</strong> de la objeción de corrupción.' },
  { y: '2000', icon: '⏰', label: 'La multa que salió al revés', text: '<strong>Uri Gneezy y Aldo Rustichini</strong> publican <strong>«A Fine is a Price»</strong>: unas guarderías multan a los padres impuntuales y <strong>los retrasos suben</strong>; al quitar la multa, no vuelven a bajar. Etiqueta: <strong>experimento de campo</strong>, y el más citado de la etapa.' },
  { y: '2007', icon: '🧩', label: 'Roth y la repugnancia', text: 'En <strong>«Repugnance as a Constraint on Markets»</strong>, <strong>Alvin Roth</strong> trata el asco como <strong>una restricción del terreno</strong> y no como un error. De ahí sale la salida de diseño: cambiar el mecanismo en vez de discutir el precio. <strong>Nobel en 2012</strong>, con Lloyd Shapley.' },
  { y: '2010', icon: '📐', label: 'Satz y los cuatro parámetros', text: 'En <strong>«Why Some Things Should Not Be for Sale»</strong>, <strong>Debra Satz</strong> da <strong>cuatro parámetros que se encienden por separado</strong>: vulnerabilidad, agencia débil, daño extremo a la persona y daño extremo a la sociedad. Etiqueta: <strong>la más operativa</strong> de todas.' },
  { y: '2012', icon: '⚖️', label: 'Sandel separa las dos', text: 'En <strong>«What Money Can\'t Buy»</strong>, <strong>Michael Sandel</strong> separa <strong>la objeción de justicia de la de corrupción</strong>, y con eso la discusión se puede tener sin gritar. Etiqueta: <strong>filosofía política contemporánea</strong>. Es la columna vertebral de esta etapa.' },
  { y: '2013', icon: '🧪', label: 'El dato que descoloca', text: 'En <strong>«Science»</strong>, <strong>Lacetera, Macis y Slonim</strong> publican experimentos de campo grandes donde <strong>los incentivos sí aumentaron la donación de sangre</strong>. Etiqueta: <strong>disputa empírica viva</strong>. La casa lo pone aunque desordene la conclusión bonita.' },
  { y: '2015', icon: '🔩', label: 'El acero del otro lado', text: 'En <strong>«Markets Without Limits»</strong>, <strong>Jason Brennan y Peter Jaworski</strong> sostienen que <strong>si algo puede regalarse, puede venderse</strong>, y que lo reprobable está en el acto y no en el pago. Etiqueta: <strong>el acero del bando contrario</strong>. Se contesta, no se esquiva.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  justicia: {
    nombre: 'La objeción de justicia', icon: '⚖️',
    estructura: { title: 'Qué dice', info: '• Que <strong>el trato no fue libre de verdad</strong>, porque una parte entró con la urgencia encima<br>• No objeta el bien: objeta <strong>las condiciones en que se firmó</strong><br>• Y por eso <strong>se cae sola si esas condiciones mejoran</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se encienden los <strong>cuatro parámetros de Satz</strong>, uno por uno y por separado<br>• Vulnerabilidad, agencia débil, daño extremo a la persona, daño extremo a la sociedad<br>• Y se pregunta <strong>quién de los dos podía esperar</strong>, que casi siempre resuelve el caso' },
    enfermedades: { title: 'Dónde se cae', info: '• Encender <strong>un solo parámetro y pedir prohibición</strong>, cuando lo que toca es atacar ese uno<br>• Confundirla con la de corrupción y responderla con datos que no vienen al caso<br>• Y olvidar que <strong>prohibir no quita la urgencia</strong>: la deja igual y sin salida' },
    cuidados: { title: 'En esta casa', info: '• <strong>Satz (2010)</strong> se usa como instrumento, no como lista de prohibiciones<br>• Con <strong>Anderson (1993)</strong> detrás, que puso la base de por qué hay modos distintos de valorar<br>• Y los pleitos vivos del patio entran <strong>como categoría, no con nombre propio</strong>' },
  },
  corrupcion: {
    nombre: 'La objeción de corrupción', icon: '🩸',
    estructura: { title: 'Qué dice', info: '• Que <strong>el precio degrada el bien</strong>, aunque el trato sea libre y entre iguales<br>• No que salga peor: que <strong>ya no es la misma cosa</strong><br>• Y si vale, <strong>vale siempre</strong>, porque no depende de las condiciones' },
    funcion: { title: 'Cómo se reconoce', info: '• Se pregunta <strong>qué era ese bien cuando se daba</strong> y qué queda cuando se compra<br>• La disculpa, el premio de honor, el turno de la fila, la amistad<br>• Y se exige la prueba: <strong>qué se pierde, quién lo pierde y cómo se notaría</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• <strong>Afirmarla en vez de mostrarla</strong>, que es el error más común de la etapa<br>• Usarla para todo, con lo cual <strong>deja de seleccionar nada</strong><br>• Y confundir una <strong>costumbre</strong> con una pérdida: las costumbres cambian, y hay historia que lo prueba' },
    cuidados: { title: 'En esta casa', info: '• <strong>Sandel (2012)</strong> entra siempre con <strong>Brennan y Jaworski (2015)</strong> al lado<br>• Y con <strong>Zelizer (1979)</strong>, que recuerda que el seguro de vida también fue escandaloso<br>• La prueba de la pérdida <strong>se escribe, no se supone</strong>' },
  },
  motivos: {
    nombre: 'El desplazamiento de motivos', icon: '🧪',
    estructura: { title: 'Qué dice', info: '• Que <strong>el precio no se suma al motivo anterior: a veces lo reemplaza</strong><br>• Y que la operación <strong>no siempre es reversible</strong>: quitar el pago no devuelve el motivo<br>• Ordenado como teoría por <strong>Frey y Jegen (2001)</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se pregunta antes de poner precio: <strong>¿esto ya se estaba haciendo por otro motivo?</strong><br>• La multa de la guardería, el pueblo suizo, el favor del vecino<br>• Y se mira si al pagar <strong>la conducta empeoró en vez de mejorar</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Tomarlo por <strong>ley automática</strong>: en 2013 los incentivos sí aumentaron la donación de sangre<br>• Citar a <strong>Titmuss sin Arrow</strong>, que es media cita y la casa la castiga igual<br>• Y olvidar que depende del <strong>bien, del monto y de la forma del pago</strong>' },
    cuidados: { title: 'En esta casa', info: '• <strong>Titmuss (1970), Arrow (1972) y los experimentos de 2013</strong> se citan juntos, siempre<br>• La casa se aplica el hallazgo a sí misma: <strong>el XP y lo que dice Fryer (2011)</strong><br>• Y la disputa <strong>se enseña viva</strong>, con el dato que la resolvería anotado' },
  },
  diseno: {
    nombre: 'La repugnancia y el diseño', icon: '🧩',
    estructura: { title: 'Qué dice', info: '• Que el asco de la gente es <strong>una restricción real del terreno</strong>, no un error a corregir<br>• Que <strong>cambia con el tiempo</strong>, y por eso no basta como argumento<br>• Pero que es <strong>terca</strong>, y un diseño que la ignore no se aplica nunca' },
    funcion: { title: 'Cómo se reconoce', info: '• Se busca <strong>dónde estaba el problema de verdad</strong>, que casi nunca es el precio<br>• En los riñones era <strong>de emparejamiento</strong>, y por eso hubo cadenas de trasplante<br>• Y se abre la tercera salida: <strong>sacar el dinero y diseñar otro mecanismo</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Quedarse en <strong>los dos botones</strong> de la discusión pública: vender o prohibir<br>• Usar el asco <strong>como prueba</strong>, cuando la historia enseña que se mueve<br>• Y proponer un diseño <strong>sin decir lo que cuesta montarlo y sostenerlo</strong>' },
    cuidados: { title: 'En esta casa', info: '• <strong>Roth (2007)</strong> entra con su <strong>Nobel de 2012</strong> y con lo que construyó, no solo con lo que dijo<br>• Las salidas son <strong>cuatro y no dos</strong>, y eso se repite hasta que se vuelva reflejo<br>• Y toda salida se escribe <strong>con su factura</strong>, porque ninguna regla es gratis' },
  },
});

/* ---------- niveles y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Dice «eso no se vende» y se queda ahí 📢' },
  { t: 25, n: 'Ya sabe que las objeciones son dos ⚖️' },
  { t: 55, n: 'Enciende los cuatro parámetros uno por uno 📐' },
  { t: 90, n: 'Muestra qué se pierde, en vez de afirmarlo 🩸' },
  { t: 130, n: 'Reconoce el desplazamiento de motivos en su cuadra 🧪' },
  { t: 165, n: 'Propone la salida de diseño, que casi nadie propone 🧩' },
  { t: 190, n: 'Nombra la objeción, muestra la pérdida y paga la factura 🔩' },
]);

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de las dos objeciones superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la etapa explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de objeciones y de consignas' },
  id_master: { icon: '🔍', label: 'Identificador de piezas y fuentes maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del límite' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta del Expediente Dorado completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  { t: 'Borges', q: '¿Qué oficio tenía el tío del narrador, y qué sostenía?', o: ['a) Era rematador, y sostenía que no existe objeto que no encuentre comprador', 'b) Era notario, y sostenía que todo contrato es válido', 'c) Era médico, y sostenía que la salud no tiene precio', 'd) Era librero, y sostenía que los libros no se venden'], c: 0 },
  { t: 'Borges', q: 'Al segundo año de su catálogo, ¿qué descubrió el narrador con alarma?', o: ['a) Que su tío había muerto', 'b) Que todas las palabras de su lista figuraban en avisos clasificados', 'c) Que el catálogo se había perdido', 'd) Que nadie quería leerlo'], c: 1 },
  { t: 'Borges', q: '¿Qué trabajo de Alvin Roth encontró en la biblioteca, y de qué año?', o: ['a) «The Gift Relationship», de 1970', 'b) «Markets Without Limits», de 2015', 'c) «Repugnance as a Constraint on Markets», de 2007', 'd) «Morals and Markets», de 1979'], c: 2 },
  { t: 'Borges', q: '¿Cuál es la asimetría que el narrador anota al margen como la más honda?', o: ['a) Que la de corrupción es más fácil de probar', 'b) Que ninguna de las dos objeciones sirve', 'c) Que las dos se caen con el tiempo', 'd) Que la objeción de justicia puede desaparecer si mejora el mundo, y la de corrupción, si es verdadera, lo es para siempre'], c: 3 },
  { t: 'Borges', q: '¿Cuál fue la última entrada que el narrador agregó al catálogo?', o: ['a) Una objeción contra sí mismo, tomada de Brennan y Jaworski', 'b) El nombre de su tío', 'c) La lista de los objetos vendidos', 'd) Una cita inventada'], c: 0 },
  { t: 'Cervantes', q: '¿A cuánto se convino primero el precio por azote, y a cuánto lo subió Sancho?', o: ['a) A un real, y lo subió a un ducado', 'b) A cuartillo, y lo subió a real', 'c) A dos maravedís, y no lo subió', 'd) No hubo precio: fue gratis'], c: 1 },
  { t: 'Cervantes', q: '¿Dónde descargó Sancho los azotes que había vendido?', o: ['a) En sus propias espaldas', 'b) En el jumento', 'c) En los troncos de las hayas', 'd) En el aire, sin tocar nada'], c: 2 },
  { t: 'Cervantes', q: 'Según don Quijote, ¿qué compró él con su dinero y qué se quedó sin comprar?', o: ['a) No compró nada de nada', 'b) Compró la voluntad y perdió la obra', 'c) Compró las hayas', 'd) Compró la obra y se quedó sin la voluntad, que es lo que más le importaba'], c: 3 },
  { t: 'Cervantes', q: 'En la escena de la venta, ¿quiénes son los quejosos según don Quijote?', o: ['a) Los que no hablaron, como la mujer del niño que madrugó y quedó última', 'b) El caminante que compró el lugar', 'c) El primero de la fila, que vendió su lugar', 'd) El cirujano que sacaba muelas'], c: 0 },
  { t: 'Cervantes', q: '¿Qué remedio propone Sancho para la fila, y qué le advierte don Quijote?', o: ['a) Prohibir la venta; y le advierte que está bien así', 'b) Cédulas con la hora escrita; y le advierte que también cuesta, y que ese costo lo paga alguien', 'c) Pagar más caro; y le advierte que es lo justo', 'd) Que todos madruguen; y no le advierte nada'], c: 1 },
  { t: 'Harari', q: '¿Qué ejemplo usa el ensayo para mostrar que el asco cambia con el tiempo?', o: ['a) La compra de votos', 'b) La donación de sangre', 'c) El seguro de vida, cuya historia documentó Viviana Zelizer en 1979', 'd) Las cadenas de trasplante'], c: 2 },
  { t: 'Harari', q: '¿Cuál de los cuatro parámetros de Satz explica que casi todas las sociedades prohíban comprar votos y sentencias?', o: ['a) La vulnerabilidad', 'b) La agencia débil', 'c) El daño extremo a la persona', 'd) El cuarto: el daño que alcanza a quienes no participaron'], c: 3 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué pasó cuando las guarderías quitaron la multa?', o: ['a) Los retrasos no volvieron a bajar', 'b) Los retrasos desaparecieron', 'c) Los padres pagaron el doble', 'd) Las guarderías cerraron'], c: 0 },
  { t: 'Harari', q: '¿Qué encontró Roland Fryer en 2011 al pagar a estudiantes?', o: ['a) Que ningún pago funciona', 'b) Que pagar por leer libros funcionó bastante mejor que pagar por sacar buenas notas', 'c) Que pagar por notas fue lo más eficaz', 'd) Que los estudiantes devolvieron el dinero'], c: 1 },
  { t: 'Harari', q: '¿Qué dos datos legales pone el ensayo uno al lado del otro, y por qué?', o: ['a) Dos leyes del mismo país, para mostrar que se contradicen', 'b) Ninguno: el ensayo no cita leyes', 'c) La ley estadounidense de 1984 que prohíbe comprar órganos y el sistema regulado que existe en Irán desde 1988, porque cada uno incomoda a un lado distinto', 'd) Dos tratados internacionales, para mostrar que todos prohíben lo mismo'], c: 2 },
]);

B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: 'Richard Titmuss publicó «The Gift Relationship» en ___.', a: '1970' },
  { t: 'las tres', q: 'Kenneth Arrow le respondió en «Gifts and Exchanges», de ___.', a: '1972' },
  { t: 'Borges', q: 'Alvin Roth escribió «Repugnance as a Constraint on Markets» en ___.', a: '2007' },
  { t: 'las tres', q: 'Michael Sandel separó las dos objeciones en «What Money Can\'t Buy», de ___.', a: '2012' },
  { t: 'las tres', q: 'Debra Satz publicó «Why Some Things Should Not Be for Sale» en ___.', a: '2010' },
  { t: 'Harari', q: 'Gneezy y Rustichini publicaron «A Fine is a Price» en ___.', a: '2000' },
  { t: 'Harari', q: 'Viviana Zelizer documentó la historia del seguro de vida en «Morals and Markets», de ___.', a: '1979' },
  { t: 'Borges', q: 'Brennan y Jaworski publicaron «Markets Without Limits» en ___.', a: '2015' },
  { t: 'Cervantes', q: 'Sancho descargó los azotes que había vendido en los troncos de las ___.', a: 'hayas' },
  { t: 'Cervantes', q: 'Don Quijote dijo que compró la obra y se quedó sin la ___.', a: 'voluntad' },
]);

B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan al mismo límite por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento convierte el límite en una manía personal y por eso lo vuelve memorable: un hombre pasa la vida armando el catálogo de lo invendible y descubre que su lista no era de imposibles sino de incomodidades, que varían con la latitud y con el siglo. Esa forma enseña algo que un manual no puede: que el asco es un dato y no una prueba. El capítulo lo vuelve escena, risa y refrán, y con eso llega a donde el argumento no llega: los azotes vendidos a real, las hayas maltratadas sin culpa y la fila del sacamuelas dejan la lección pegada al cuerpo, y el refrán final la deja en dos renglones que cualquiera se puede repetir. El ensayo pone la escala de especie y ordena la erudición: separa las dos objeciones, encadena los estudios con sus años y obliga a mirar la factura de prohibir. Leyendo solo el cuento se tendría melancolía sin instrumento; solo el capítulo, sabiduría sin fuentes; solo el ensayo, fuentes sin ninguna imagen que las sostenga en la memoria. Las tres juntas dan lo mismo por tres caminos, y por eso la casa las escribe así.' },
  { q: '2. El narrador del cuento dice que su catálogo «dejó de ser una lista y se volvió un formulario». Explica qué significa eso y por qué es exactamente lo que esta etapa quiere enseñar.', guia: 'Una lista dice qué está prohibido y no dice por qué, de modo que no sirve para ningún caso nuevo: si aparece un bien que la lista no contempla, hay que inventar la respuesta de cero o copiar la costumbre. Un formulario es otra cosa: son preguntas que se aplican a cualquier caso y que obligan a decir dónde está el problema. Por eso el narrador cambia su lista por los cuatro parámetros de Satz, que se encienden por separado, y por la distinción de Sandel entre las dos objeciones. Eso es exactamente la vara de la etapa: no se pide una opinión sobre los riñones o sobre la fila, se pide llenar la hoja del bien, que es un formulario de cinco renglones. Y hay una ganancia extra que el cuento hace notar sin decirlo: un formulario se puede discutir con alguien que piense distinto, porque los dos pueden señalar en qué renglón discrepan. Con una lista de invendibles solo se puede coincidir o pelear.' },
  { q: '3. Don Quijote dice que compró la obra y se quedó sin la voluntad, y que en el trato salió perdiendo aunque las cuentas digan que ganó. Explica esa frase con el vocabulario de la etapa.', guia: 'Es la objeción de corrupción dicha en cervantino, y dicha mejor que en muchos manuales. Lo que don Quijote quería no era que unos azotes ocurrieran: era que Sancho quisiera darlos, porque el valor de la penitencia estaba en la voluntad de quien la hacía. Al poner precio compró la conducta y expulsó el motivo, que es exactamente el desplazamiento de motivos que midieron Gneezy y Rustichini en 2000 y que Frey y Jegen ordenaron como teoría en 2001. Las cuentas dicen que ganó porque recibió lo que pagó, y esa contabilidad es correcta en su propio idioma: hubo un intercambio voluntario y las dos partes lo aceptaron. Lo que la contabilidad no registra es que el bien cambió de naturaleza en el camino. El remate del capítulo lo lleva al extremo cómico y perfecto: Sancho ni siquiera entregó la obra, se la dio a las hayas, de modo que el dinero terminó comprando solamente el ruido. Quien paga por lo que solo la voluntad puede dar compra la apariencia, y encima se queda tan satisfecho que ya no busca la cosa.' },
  { q: '4. En la escena de la venta, don Quijote dice que los quejosos son los que no hablaron. Explica por qué esa frase es el argumento contra la venta de turnos, y qué objeción está usando.', guia: 'Está usando las dos, y por eso la escena es útil. La de justicia salta a la vista: la mujer del niño madrugó y quedó última, de modo que el reparto pasó de premiar el madrugón a premiar la bolsa, y ella no podía competir en esa moneda. La de corrupción es la que la frase señala con más finura: mientras la fila se ganaba madrugando, era el único lugar donde el rico y el pobre valían lo mismo por una vez, y eso no era un efecto secundario sino parte de lo que la fila era. Al comprarse, la fila se vuelve un bien más, repartido como todos los demás. Y el hallazgo del argumento es de método: el intercambio que se ve fue voluntario y dejó contentos a los dos que hablaron, así que quien mire solo a las partes que firman va a concluir que todo mejoró. El daño está en los que no participaron, que es también el cuarto parámetro de Satz, el más raro y el más grave. Por eso la frase vale como regla general: ante cualquier trato, hay que preguntar a quién le cambió la vida sin haber firmado nada.' },
  { q: '5. El ensayo insiste en que «el asco cambia». Explica qué hace esa afirmación con la posición de quien quiere prohibir, y por qué no la destruye.', guia: 'La debilita en un punto concreto y la obliga a mejorar. Si el único fundamento para decir que algo no debe venderse es que repugna, la historia deja mal parado ese fundamento: prestar con interés fue pecado, el seguro de vida pareció indecente y hoy se contrata sin pensarlo, y esa mudanza la documentó Viviana Zelizer en 1979. Quien apoye su prohibición solo en el asco está apoyándola en algo que se mueve con el siglo. Pero no la destruye por dos razones. La primera es que el sentimiento suele señalar dónde mirar, y casi siempre acierta en el sitio aunque no en el argumento: el asco frente a la venta de riñones apunta a la vulnerabilidad y a la irreversibilidad, que son parámetros reales. La segunda la aporta Roth en 2007: aunque el asco cambie, mientras exista es una restricción del terreno, y un diseño que lo ignore no se va a aplicar nunca por bueno que sea en el papel. De modo que el asco no es una prueba, pero sí es un dato con el que hay que trabajar, y esa distinción es la que separa esta etapa de una discusión de sobremesa.' },
  { q: '6. Los tres textos citan a Titmuss (1970) y ninguno lo deja solo. Explica por qué, y qué principio de la casa se está aplicando.', guia: 'Porque su tesis tiene una contracrítica obligada y una disputa empírica encima, y ocultarlas sería exactamente el vicio que esta materia enseña a cazar. Titmuss sostuvo que pagar por sangre reducía y empeoraba la donación; Kenneth Arrow le objetó en 1972 que de sus datos no se seguía esa conclusión moral; y en 2013, Lacetera, Macis y Slonim publicaron en «Science» experimentos de campo donde los incentivos sí aumentaron la donación. El principio que se aplica es el mismo que la etapa anterior usó con Coase y su rectificación de 1988: media cita es media cita. Y aquí aprieta más, porque la mitad que se estaría ocultando es la que le conviene a la conclusión bonita de la propia casa, que simpatiza con la idea de que hay límites. Una regla que solo se cumple cuando el resultado gusta no es una regla, es una preferencia con disfraz. Por eso el dato de 2013 entra en el mismo tamaño de letra que el de 1970, y por eso los tres textos lo llevan adentro.' },
  { q: '7. El ensayo dice que las salidas son cuatro y no dos. Enumera las cuatro, explica cuál es la que casi nadie propone y por qué.', guia: 'Las cuatro son: permitir, cuando ninguna objeción se sostiene; permitir con reglas, cuando la objeción es de justicia y se puede atacar la urgencia, la información o el daño; sacar el dinero y diseñar otro mecanismo; y prohibir, cuando el daño a la sociedad es grave y no hay diseño mejor. La que casi nadie propone es la tercera, y la razón es que exige trabajo en lugar de postura. Vender y prohibir son botones: se aprietan en una discusión de tres minutos y cada uno tiene su público. Diseñar obliga a averiguar dónde estaba el problema de verdad, que casi nunca es el precio. Alvin Roth lo mostró con los riñones: el problema no era cuánto se pagaba, era que había parejas de donante y paciente incompatibles entre sí y compatibles cruzadas, de modo que la solución era de emparejamiento y funciona sin dinero. Le dieron el Nobel en 2012, junto a Lloyd Shapley. En el caso de la fila del centro de salud, la salida de diseño son las citas por teléfono, que quitan valor al madrugón y por lo tanto al turno vendido. Y como toda salida, se escribe con su factura: montar y sostener ese sistema cuesta, y alguien lo paga.' },
  { q: '8. El cuento termina con una entrada que contradice al propio catálogo, y el narrador decide dejarla. Explica esa decisión y relaciónala con la regla del acero.', guia: 'La entrada es la tesis de Brennan y Jaworski, de «Markets Without Limits», de 2015: si algo puede regalarse, también puede venderse, y lo reprobable, cuando lo hay, está en el acto y no en el pago. El narrador reconoce que no ha podido refutarla del todo y decide que esa incapacidad forma parte del catálogo en vez de invalidarlo. La decisión es la regla del acero llevada al extremo honesto: la tesis contraria entra en su mejor versión, no en una caricatura, y se deja escrita aunque incomode. Y hay algo más fino en la frase con que el cuento cierra, porque es la respuesta que el narrador sí puede dar: la pregunta nunca fue si algo puede venderse, sino qué queda de ese algo después de la venta. Es decir, concede el punto del adversario en el plano de lo posible y desplaza la discusión al plano donde su objeción sí funciona, que es el de la naturaleza del bien. Un catálogo que borrara la entrada incómoda no sería un catálogo, sería un alegato, y esa distinción es la que la casa persigue en todas las materias.' },
  { q: '9. Explica por qué esta etapa se sostiene sobre la etapa anterior y sobre la primera, y qué pasaría si alguien la leyera sola.', guia: 'La etapa 1 puso el acero con cifras: la salida masiva de la pobreza es real y está medida, y sin eso cualquier crítica al mercado se lee como panfleto. La etapa 2 auditó la máquina por dentro y encontró cuatro fallas con nombre, todas firmadas por economistas y varias con Nobel, de modo que quedó claro que criticar no es estar del otro estante. Esta etapa hace la pregunta que ninguna de las dos podía hacer: qué pasa con los bienes donde el mercado funciona perfectamente y aun así uno no quiere que entre. Quien la leyera sola sacaría la conclusión que la etapa entera intenta evitar, que es «todo lo que se vende se corrompe», porque no tendría delante ni el acero de la etapa 1 ni la disciplina de la 2, que exige nombrar, proponer y calcular. Y al revés: quien se quedara en la 1 tendría una máquina sin condiciones de uso, y quien se quedara en la 2 tendría un diagnóstico técnico sin la pregunta moral. El arco tiene siete etapas y está declarado desde el principio precisamente para que nadie salga con media idea.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué esa etiqueta pertenece al temario de esta etapa en particular, y qué pasaría si se quitara.', guia: 'Porque esta etapa se estudia entera sobre qué pasa cuando se le pone precio a algo cuyo valor dependía de otra cosa, y el prestigio de un autor es justamente uno de esos bienes. Un pastiche sin declarar toma prestada la autoridad de Borges, de Cervantes o de Harari para que el texto pese más de lo que pesa por sí mismo, y eso es cobrar con una moneda que no se ganó. Enseñar que la disculpa comprada ya no es una disculpa, y firmar en la misma página con un nombre que no es el propio, sería la contradicción más rápida posible. Hay además una razón de método: la etiqueta funciona como el remedio que la etapa anterior estudió para la asimetría de información, y como todo remedio tiene un costo, que aquí es quitarle al texto parte de su prestigio prestado. Que la casa pague ese costo por escrito es la prueba práctica de que entendió la lección. Si se quitara pasarían dos cosas comprobables: alguien citaría a Sandel, a Satz o a Roth a través de una frase que ninguno escribió, y la casa quedaría produciendo la fuente inflada que su propio compendio manda cazar, justo en la materia donde más caro se paga hacerlo.' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_dorado_dinero_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena la objeción, la prueba de la pérdida y la factura de la salida. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden, y el orden es el método. Primero se describe el bien como se describe un inventario: quién vende, quién compra y qué cambia de manos de verdad, que casi nunca es lo que parece a primera vista, porque en la fila del centro de salud no se vende un asiento sino el resultado de haber madrugado. Después se pregunta cuál de las dos objeciones cabe, y se admite sin vergüenza cuando no cabe ninguna, que ocurre más seguido de lo que la indignación deja ver. Si la objeción es de justicia, se encienden los cuatro parámetros de Debra Satz uno por uno y por separado, porque encender uno solo no autoriza a prohibir sino a atacar ese uno: vulnerabilidad, agencia débil, daño extremo a la persona y daño extremo a la sociedad. Si la objeción es de corrupción, hay que mostrarla y no afirmarla, que es la parte que casi nadie escribe: qué se pierde exactamente, quién lo pierde y cómo se notaría si de verdad se perdió; sin eso lo que hay es una costumbre, y las costumbres cambian, como lo prueba la historia del seguro de vida que Zelizer documentó en 1979. Las fuentes entran con su etiqueta y con su contracrítica al lado, sin excepción y sin importar de qué lado caiga el resultado: Titmuss de 1970 nunca va sin Arrow de 1972 ni sin los experimentos publicados en Science en 2013, igual que en la etapa anterior Coase no iba sin su advertencia de 1988. Al final se escoge entre las cuatro salidas y no entre dos, que es lo que hace toda la diferencia: permitir, permitir con reglas, sacar el dinero y disenar otro mecanismo como hizo Roth con las cadenas de trasplante, o prohibir. Y se escribe la factura de la salida escogida, contando tambien a los que salen perdiendo si se prohibe, porque prohibir sin resolver produce la version clandestina con los mismos danos y ninguna proteccion, y a veces la cuenta se paga en lista de espera. Se contesta ademas el acero de Brennan y Jaworski en su mejor version, no en caricatura. Cuando el bien auditado es de la propia casa, la misma vara y el renglon de que evidencia haria cambiar la decision, con fecha.";');

const textos = [
  [/🔧 \*Ruta del Expediente Dorado · Etapa 2\* 🔧\\n\\nLas fallas de la máquina: cada supuesto que falla es una familia de fallas reales, y todas tienen nombre\. 🔧\\n\\n_Incluye evaluación conceptual, la falla sobre la mesa, guion de video, tres lecturas y sus 35 preguntas\._ ✍️/g,
    '🩸 *Ruta del Expediente Dorado · Etapa 3* 🩸\\n\\nLo que el dinero no debe comprar: decir «eso no se vende» es fácil; sostenerlo con un argumento que aguante es el trabajo. 🩸\\n\\n_Incluye evaluación conceptual, el bien sobre la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/Las fallas de la máquina/g, 'Lo que el dinero no debe comprar'],
  [/las fallas de la máquina/g, 'lo que el dinero no debe comprar'],
  [/La falla sobre la mesa/g, 'El bien sobre la mesa'],
  [/la falla sobre la mesa/g, 'el bien sobre la mesa'],
  [/Etapa 2 de la Ruta del Expediente Dorado/g, 'Etapa 3 de la Ruta del Expediente Dorado'],
  [/Ruta del Expediente Dorado · Etapa 2 de 7/g, 'Ruta del Expediente Dorado · Etapa 3 de 7'],
  /* este vive en el encabezado de las dos pruebas imprimibles: no dice «de 7»
     sino «· Estudio Mayor», y es el que se le escapó al primer grep en
     misiones pasadas */
  [/Ruta del Expediente Dorado · Etapa 2 · Estudio Mayor/g, 'Ruta del Expediente Dorado · Etapa 3 · Estudio Mayor'],
  [/const msgs=\['¡Sigue revisando los supuestos!','¡Muy buen trabajo!','¡Aprendiz de diagnóstico!','¡Ya distingues el monopolio del monopsonio!','¡Nombras la falla y calculas su factura!'\]/,
    "const msgs=['¡Sigue llenando la hoja del bien!','¡Muy buen trabajo!','¡Aprendiz de criterio!','¡Ya distingues la justicia de la corrupción!','¡Muestras la pérdida y pagas la factura!']"],
  [/\['#164e63','#22d3ee','#a8a29e','#991b1b','#00b894'\]/, "['#4c1d95','#a78bfa','#a8a29e','#a16207','#00b894']"],
  /* el violeta profundo y el oro de la etapa en las pruebas y en las hojas */
  [/#164e63/g, '#4c1d95'],
  [/#083344/g, '#2e1065'],
  [/#ecfeff/g, '#f5f3ff'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/Mercados completos, información perfecta, nadie con poder y nada sobre terceros\./g, 'Son dos, y no una: la de justicia y la de corrupción.'],
  [/>Los cuatro supuestos del teorema</g, '>Las dos objeciones<'],
  /* las preguntas fijas de la prueba competencial preguntaban por la falla */
  [/¿Qué supuesto del teorema se rompió en este mercado, y cómo se llama la falla que resulta\? Nombra la fuente con su etiqueta y su contracrítica al lado, propón la regla que la corregiría con quién la aplica, y calcula qué cuesta esa regla y a quién\./g,
    '¿Cuál de las dos objeciones le cabe a este bien, y qué se pierde exactamente si se vende? Nombra la fuente con su etiqueta y su contracrítica al lado, escoge una de las cuatro salidas, y calcula qué cuesta esa salida y a quién, contando también a los que pierden si se prohíbe.'],
  [/1\. ¿Cuál de los dos sirve para decidir algo y cuál solo describe un malestar\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos se puede llevar a una reunión donde haya que decidir, y cuál solo se puede repetir? 2. ¿Por qué no son la misma decisión?'],
  /* el subtítulo del pliego de las tres lecturas */
  [/Un cuento, un capítulo de caballerías y un ensayo, sobre la misma letra pequeña/g,
    'Un cuento, un capítulo de caballerías y un ensayo, sobre el mismo límite'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'El catálogo de los cuatro supuestos',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'El catálogo de las cosas invendibles',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'De lo que sucedió al caballero con un muchacho atado a una encina, y de lo que sobre los amos únicos se platicó después',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'De los azotes que se pusieron a precio, y de lo que sobre las cosas que el dinero estropea platicaron caballero y escudero',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'El manual que nadie lee',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'La especie que le puso precio a casi todo',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa anterior era el cuaderno del préstamo de la
   esquina. Aquí es la multa de la guardería: la consigna o el motivo. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(prueba){sfx(prueba?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(prueba){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🩸</span><span class="ms-text"><strong>Quedó anotado lo que de verdad pasó:</strong> «el precio no se sumó al motivo, lo reemplazó: mientras llegar tarde era una falta de consideración, uno se apuraba por vergüenza; cuando pasó a costar, uno paga y llega tranquilo».</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🧾</span><span class="ms-text"><strong>Y debajo, lo que se sigue de ahí:</strong> antes de poner precio a algo hay que preguntar <strong>qué se estaba haciendo ahí sin precio</strong>, porque la operación no siempre es reversible. <strong>Gneezy y Rustichini (2000) y Frey y Jegen (2001)</strong> entran con su etiqueta, y al lado entra el dato incómodo: <strong>en 2013 los incentivos sí aumentaron la donación de sangre</strong>, así que esto no es una maldición automática.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">💸</span><span class="ms-text"><strong>Quedó una regla falsa:</strong> «con multa la gente se porta bien». Funciona en muchísimos casos, suena a sentido común, y por eso mismo es peligrosa: nadie la va a revisar.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega en dos partes:</strong> con esa regla no se puede explicar por qué los retrasos subieron, ni por qué al quitar la multa no volvieron a bajar; y de camino queda enseñado que aquí los datos que estorban se ignoran. Se tacha y se reescribe con el mecanismo: <strong>el precio a veces reemplaza el motivo, y esa operación no siempre se puede deshacer.</strong></span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='justicia',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"justicia\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/🔧/g, '🩸');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
