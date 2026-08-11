/* Inyecta los bancos de la misión «Los derechos y la coletilla que los
   devuelve» (Ruta de la Ley y sus Grietas, etapa 3) sobre el molde copiado de
   la etapa 2.
   Uso:  node _dev/inyecta-bancos-ley-coletilla.js

   REGLA DE LA RUTA: aquí no se cita nada de memoria. Los artículos del Título
   III que usa esta etapa se comprobaron contra fuente el 11 de agosto de 2026,
   y por eso van con su número y con su texto:

     · 59: la persona humana es el fin supremo de la sociedad y del Estado;
       todos tienen la obligación de respetarla y protegerla, y la dignidad del
       ser humano es inviolable.
     · 60: todos los hombres nacen libres e iguales en derechos; en Honduras no
       hay clases privilegiadas y todos los hondureños son iguales ante la ley;
       se declara punible toda discriminación por motivo de sexo, raza, clase y
       cualquier otra lesiva a la dignidad humana.
     · 72: es libre la emisión del pensamiento por cualquier medio de difusión,
       SIN PREVIA CENSURA; son responsables ante la ley los que abusen de este
       derecho y quienes por medios directos o indirectos restrinjan o impidan
       la comunicación y circulación de ideas y opiniones.
     · 78: se garantizan las libertades de asociación y de reunión SIEMPRE QUE
       NO SEAN CONTRARIAS al orden público y a las buenas costumbres.
     · 80: toda persona o asociación tiene derecho de presentar peticiones a
       las autoridades, por interés particular o general, y de obtener pronta
       respuesta EN EL PLAZO LEGAL.
     · 82: el derecho de defensa es inviolable; los habitantes tienen libre
       acceso a los tribunales para ejercitar sus acciones EN LA FORMA QUE
       SEÑALAN LAS LEYES.
     · 89: toda persona es inocente mientras no se haya declarado su
       responsabilidad por autoridad competente.
     · 95: ninguna persona será sancionada con penas no establecidas
       previamente en la ley, ni podrá ser juzgada otra vez por los mismos
       hechos punibles que motivaron anteriores enjuiciamientos.
     · 96: la ley no tiene efecto retroactivo, EXCEPTO en materia penal cuando
       la nueva ley favorezca al delincuente o procesado.

   Las mayúsculas de arriba son las coletillas, y son el tema de la misión.
   Nótese que la del 96 no recorta: protege. Esa distinción es la mitad de la
   etapa, porque quien aprende a ver coletillas y no aprende a distinguirlas
   acaba peleando contra la única que estaba de su lado.                    */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-ley-coletilla', 'js', 'coletilla.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260813;
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
  { w: 'La coletilla', a: '🎭 Lo que viene <strong>después del derecho</strong> y decide cuánto queda de él. Puede condicionarlo («siempre que no sea contrario a…»), remitirlo a otra norma («en la forma que señalen las leyes») o exceptuarlo («salvo…»).' },
  { w: 'Reconocer, remitir, condicionar', a: '🔁 La técnica, en tres pasos: se reconoce el derecho en la primera frase, se remite a la ley que lo desarrollará, y se condiciona con un concepto que <strong>nadie define en el mismo texto</strong>. Se aprende a leer de un vistazo porque se repite.' },
  { w: 'La primera frase engaña', a: '⚠️ Es la que se cita, la que se recuerda y la que se pone en los carteles. <strong>La que decide suele ser la última.</strong> Quien lee solo la primera cree que tiene un derecho absoluto y descubre lo contrario en la ventanilla.' },
  { w: 'Artículo 59', a: '👤 <strong>La persona humana es el fin supremo de la sociedad y del Estado.</strong> Todos tienen la obligación de respetarla y protegerla, y la dignidad del ser humano es inviolable. Sirve de contraste: aquí no hay coletilla, el artículo cierra.' },
  { w: 'Artículo 60', a: '⚖️ Todos los hombres nacen libres e iguales en derechos, no hay clases privilegiadas y todos los hondureños son iguales ante la ley. <strong>Se declara punible toda discriminación</strong> por sexo, raza, clase y cualquier otra lesiva a la dignidad humana.' },
  { w: 'Artículo 72', a: '🗣️ Es libre la emisión del pensamiento por cualquier medio, <strong>sin previa censura</strong>. Y la coletilla: son responsables ante la ley <strong>los que abusen</strong> de este derecho. Nadie te calla antes; te responsabilizan después.' },
  { w: '«Abuso»', a: '❓ La palabra que decide el alcance del artículo 72, y que el artículo no define. Quién dice qué es abuso, cuándo lo dice y si responde de ello es <strong>la pregunta real</strong> detrás de la libertad de expresión.' },
  { w: 'Artículo 78', a: '👥 Se garantizan las libertades de asociación y de reunión <strong>siempre que no sean contrarias al orden público y a las buenas costumbres</strong>. Dos conceptos indeterminados en una sola línea, y los dos los llena quien está enfrente.' },
  { w: '«Orden público»', a: '🚧 El concepto indeterminado más usado del mundo. No se define en el texto que lo invoca, así que su contenido lo pone <strong>quien tiene que autorizar</strong>. Por eso la reunión se pide por escrito y con antelación: para que la decisión quede.' },
  { w: 'Artículo 80', a: '📨 Toda persona tiene derecho a presentar peticiones a las autoridades y <strong>a obtener pronta respuesta en el plazo legal</strong>. Reconoce y remite en la misma frase: promete prontitud y manda el plazo a otra norma.' },
  { w: 'Artículo 82', a: '🛡️ <strong>El derecho de defensa es inviolable.</strong> Y a continuación: los habitantes tienen libre acceso a los tribunales para ejercitar sus acciones <strong>en la forma que señalan las leyes</strong>. Lo inviolable es el derecho; la puerta la regula otro.' },
  { w: 'Artículo 89', a: '🤍 Toda persona es <strong>inocente</strong> mientras no se haya declarado su responsabilidad por autoridad competente. Se cita poco fuera de lo penal y sirve para mucho más: nadie está obligado a probar que no hizo algo.' },
  { w: 'Artículo 95', a: '📏 Ninguna persona será sancionada con penas <strong>no establecidas previamente en la ley</strong>, ni juzgada otra vez por los mismos hechos que motivaron anteriores enjuiciamientos. Sanción sin norma previa, no.' },
  { w: 'Artículo 96', a: '⏪ La ley no tiene efecto retroactivo, <strong>excepto en materia penal cuando la nueva ley favorezca</strong> al delincuente o procesado. Es una excepción que <strong>protege</strong>: la coletilla que está de tu lado.' },
  { w: 'Coletilla que quita y coletilla que da', a: '🪞 No todas recortan. La del 96 amplía a favor de quien podría ser sancionado, y la del 72 protege también contra <strong>quien restrinja o impida</strong> la circulación de ideas. Confundirlas hace pelear contra la única que estaba de tu lado.' },
  { w: 'Cómo se lee un derecho', a: '🔎 Cuatro pasos: 1) subrayar <strong>qué da</strong>; 2) subrayar <strong>qué condiciona, remite o exceptúa</strong>; 3) preguntar <strong>quién llena</strong> el concepto que no se define; 4) preguntar <strong>si la norma remitida existe</strong>.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: 'En un artículo de derechos, ¿qué parte suele decidir cuánto queda del derecho?', o: ['a) La primera frase', 'b) El título del capítulo', 'c) Lo que viene después: la condición, la remisión o la excepción', 'd) El número del artículo'], c: 2 },
  { q: 'El artículo 72 garantiza la libre emisión del pensamiento sin previa censura, y añade que…', o: ['a) Son responsables ante la ley los que abusen de ese derecho', 'b) Solo aplica a la prensa escrita', 'c) Requiere permiso previo', 'd) No aplica en año electoral'], c: 0 },
  { q: 'El artículo 78 condiciona la asociación y la reunión a que no sean contrarias a…', o: ['a) La opinión del alcalde', 'b) Los tratados', 'c) El presupuesto', 'd) El orden público y las buenas costumbres'], c: 3 },
  { q: '¿Qué tienen en común «orden público» y «buenas costumbres»?', o: ['a) Están definidos en el mismo artículo', 'b) Son conceptos indeterminados que llena quien decide', 'c) Solo se aplican en materia penal', 'd) Los define un tratado'], c: 1 },
  { q: 'El artículo 80 promete pronta respuesta, pero remite el plazo…', o: ['a) A la ley', 'b) Al reglamento del centro', 'c) A la costumbre', 'd) A la Corte Suprema'], c: 0 },
  { q: 'El artículo 82 dice que la defensa es inviolable y luego remite el acceso a los tribunales…', o: ['a) A un acuerdo internacional', 'b) A la decisión del juez', 'c) A la forma que señalan las leyes', 'd) Al criterio del abogado'], c: 2 },
  { q: 'La excepción del artículo 96 (retroactividad penal favorable)…', o: ['a) Recorta un derecho', 'b) Es una remisión', 'c) No tiene efecto', 'd) Protege a quien podría ser sancionado'], c: 3 },
  { q: 'Según el artículo 89, mientras no se declare su responsabilidad, toda persona es…', o: ['a) Sospechosa', 'b) Inocente', 'c) Responsable a medias', 'd) Investigada'], c: 1 },
  { q: '¿Qué hay que preguntar siempre ante una remisión de un artículo de derechos?', o: ['a) A qué norma manda y si esa norma existe', 'b) Quién firmó el artículo', 'c) En qué año se escribió', 'd) Si el derecho es popular'], c: 0 },
  { q: 'Un artículo reconoce un derecho y no trae coletilla. Eso significa que…', o: ['a) Está mal redactado', 'b) Es solo declarativo', 'c) Cierra él mismo: lo que dice es lo que hay', 'd) Necesita reglamento para aplicarse'], c: 2 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Da', 'Condiciona'], headA: '🎁 La parte que da', headB: '🎭 La parte que condiciona', colA: 'ok', colB: 'no',
    words: [
      { w: '«Es libre la emisión del pensamiento»', t: 'ok' }, { w: '«Son responsables los que abusen»', t: 'no' },
      { w: '«Se garantizan las libertades de asociación»', t: 'ok' }, { w: '«Siempre que no sean contrarias al orden público»', t: 'no' },
      { w: '«Derecho de presentar peticiones»', t: 'ok' }, { w: '«En el plazo legal»', t: 'no' },
      { w: '«El derecho de defensa es inviolable»', t: 'ok' }, { w: '«En la forma que señalan las leyes»', t: 'no' },
    ],
  },
  {
    label: ['Indeterminado', 'Definido'], headA: '❓ Concepto indeterminado', headB: '📏 Término definido', colA: 'ok', colB: 'no',
    words: [
      { w: 'Orden público', t: 'ok' }, { w: 'Dos tercios de los votos', t: 'no' },
      { w: 'Buenas costumbres', t: 'ok' }, { w: 'La subsiguiente legislatura', t: 'no' },
      { w: 'Abuso del derecho', t: 'ok' }, { w: 'Mandato escrito de autoridad competente', t: 'no' },
      { w: 'Interés social', t: 'ok' }, { w: 'Publicación en La Gaceta', t: 'no' },
    ],
  },
  {
    label: ['Recorta', 'Protege'], headA: '✂️ La coletilla recorta', headB: '🛡️ La coletilla protege', colA: 'ok', colB: 'no',
    words: [
      { w: '«Siempre que no sean contrarias al orden público»', t: 'ok' }, { w: '«Excepto cuando la nueva ley favorezca»', t: 'no' },
      { w: '«En la forma que señalan las leyes»', t: 'ok' }, { w: '«Ni juzgada otra vez por los mismos hechos»', t: 'no' },
      { w: '«En el plazo legal»', t: 'ok' }, { w: '«Ni quienes restrinjan la circulación de ideas»', t: 'no' },
      { w: '«Conforme lo determine la ley»', t: 'ok' }, { w: '«Sin previa censura»', t: 'no' },
    ],
  },
  {
    label: ['Cierra', 'Deja abierto'], headA: '🔒 El artículo cierra', headB: '🚪 Deja que otro decida', colA: 'ok', colB: 'no',
    words: [
      { w: 'La dignidad del ser humano es inviolable', t: 'ok' }, { w: 'El acceso a los tribunales', t: 'no' },
      { w: 'Todos son iguales ante la ley', t: 'ok' }, { w: 'El plazo para responder una petición', t: 'no' },
      { w: 'Toda persona es inocente hasta que se declare lo contrario', t: 'ok' }, { w: 'Qué cuenta como orden público', t: 'no' },
      { w: 'No hay pena sin ley previa', t: 'ok' }, { w: 'Qué cuenta como abuso del pensamiento', t: 'no' },
    ],
  },
]);

/* ---------- identificar ---------- */
B.idData = JSON.stringify([
  { s: ['La', 'coletilla', 'decide', 'cuánto', 'queda', 'del', 'derecho.'], c: 1, art: 'Lo que viene después' },
  { s: ['La', 'remisión', 'manda', 'el', 'contenido', 'a', 'otra', 'norma.'], c: 1, art: 'La que manda a otra norma' },
  { s: ['La', 'condición', 'limita', 'el', 'derecho', 'desde', 'dentro.'], c: 1, art: 'La que limita' },
  { s: ['La', 'excepción', 'saca', 'un', 'caso', 'de', 'la', 'regla.'], c: 1, art: 'La que saca un caso' },
  { s: ['Un', 'concepto', 'indeterminado', 'lo', 'llena', 'quien', 'decide.'], c: 2, art: 'El que nadie define' },
  { s: ['El', 'artículo', '96', 'trae', 'una', 'excepción', 'que', 'protege.'], c: 5, art: 'La coletilla que está de tu lado' },
  { s: ['La', 'primera', 'frase', 'es', 'la', 'que', 'se', 'cita.'], c: 1, art: 'La que engaña' },
  { s: ['La', 'dignidad', 'del', 'ser', 'humano', 'es', 'inviolable.'], c: 1, art: 'Lo que el 59 declara sin condición' },
]);

/* ---------- completa ---------- */
B.cmpData = JSON.stringify([
  { s: 'La parte del artículo que decide cuánto queda del derecho es la ___.', opts: ['coletilla', 'rúbrica', 'numeración'], c: 0 },
  { s: 'El artículo 72 garantiza la emisión del pensamiento sin previa ___.', opts: ['consulta', 'censura', 'firma'], c: 1 },
  { s: 'El artículo 78 condiciona la reunión al orden público y a las buenas ___.', opts: ['razones', 'formas', 'costumbres'], c: 2 },
  { s: 'El artículo 80 remite el plazo de respuesta a la ___.', opts: ['ley', 'costumbre', 'oficina'], c: 0 },
  { s: '«Orden público» es un concepto jurídico ___.', opts: ['definido', 'indeterminado', 'derogado'], c: 1 },
  { s: 'La excepción del artículo 96 en materia penal ___ a quien podría ser sancionado.', opts: ['perjudica', 'ignora', 'favorece'], c: 2 },
  { s: 'El artículo 82 remite el acceso a los tribunales a la forma que señalan las ___.', opts: ['leyes', 'salas', 'partes'], c: 0 },
  { s: 'Un artículo sin coletilla ___ él mismo.', opts: ['remite', 'cierra', 'caduca'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Da', 'Condiciona'], btnA: '🎁 Da', btnB: '🎭 Condiciona', colA: 'ok', colB: 'no',
    words: [
      { w: '«Es libre la emisión del pensamiento»', t: 'ok' }, { w: '«Los que abusen»', t: 'no' },
      { w: '«Se garantizan las libertades de reunión»', t: 'ok' }, { w: '«Siempre que no sean contrarias»', t: 'no' },
      { w: '«Derecho de presentar peticiones»', t: 'ok' }, { w: '«En el plazo legal»', t: 'no' },
      { w: '«La defensa es inviolable»', t: 'ok' }, { w: '«En la forma que señalan las leyes»', t: 'no' },
      { w: '«Sin previa censura»', t: 'ok' }, { w: '«Salvo lo que la ley disponga»', t: 'no' },
    ],
  },
  {
    label: ['Indeterminado', 'Definido'], btnA: '❓ Indeterminado', btnB: '📏 Definido', colA: 'ok', colB: 'no',
    words: [
      { w: 'Orden público', t: 'ok' }, { w: 'Dos tercios de los votos', t: 'no' },
      { w: 'Buenas costumbres', t: 'ok' }, { w: 'La subsiguiente legislatura', t: 'no' },
      { w: 'Abuso', t: 'ok' }, { w: 'Autoridad competente', t: 'no' },
      { w: 'Interés social', t: 'ok' }, { w: 'Publicación en La Gaceta', t: 'no' },
      { w: 'Moral', t: 'ok' }, { w: 'Mandato escrito', t: 'no' },
    ],
  },
  {
    label: ['Recorta', 'Protege'], btnA: '✂️ Recorta', btnB: '🛡️ Protege', colA: 'ok', colB: 'no',
    words: [
      { w: '«Siempre que no sean contrarias»', t: 'ok' }, { w: '«Excepto si la nueva ley favorece»', t: 'no' },
      { w: '«En la forma que señalan las leyes»', t: 'ok' }, { w: '«Ni juzgada otra vez por lo mismo»', t: 'no' },
      { w: '«En el plazo legal»', t: 'ok' }, { w: '«Sin previa censura»', t: 'no' },
      { w: '«Conforme lo determine la ley»', t: 'ok' }, { w: '«Ni quienes impidan la circulación de ideas»', t: 'no' },
      { w: '«Salvo los casos que la ley señale»', t: 'ok' }, { w: '«No hay pena sin ley previa»', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se lee un artículo de derechos, de principio a fin',
    steps: [
      'Subrayar qué da: el derecho, tal como lo enuncia la primera frase',
      'Subrayar qué viene después: condición, remisión o excepción',
      'Decidir si esa coletilla recorta el derecho o lo protege',
      'Marcar los conceptos que el artículo usa y no define',
      'Preguntar quién llena esos conceptos y si responde de ello',
      'Si hay remisión, ir a buscar la norma y comprobar que existe',
    ],
  },
  {
    label: 'Qué se hace cuando una autoridad invoca «el orden público»',
    steps: [
      'Pedir que lo diga por escrito, con nombre y cargo',
      'Preguntar qué hecho concreto considera contrario al orden público',
      'Pedir la norma en que consta esa apreciación',
      'Ofrecer por escrito las medidas que resolverían esa preocupación',
      'Guardar copia sellada de todo lo entregado',
      'Anotar la fecha y el resultado en el Registro de Grietas',
    ],
  },
  {
    label: 'Cómo se presenta una petición del artículo 80 para que corra el plazo',
    steps: [
      'Escribir la petición con hechos numerados y una petición concreta',
      'Dirigirla a la autoridad que de verdad puede resolverla',
      'Entregarla por duplicado en la oficina que corresponde',
      'Exigir el sello de recibido con la fecha en la copia',
      'Anotar el nombre y el cargo de quien recibió',
      'Contar el plazo desde ese sello, no desde la conversación',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Lo que viene después del derecho y decide cuánto queda de él', ans: 'La coletilla', opts: ['La coletilla', 'La rúbrica', 'El capítulo', 'El preámbulo'] },
  { desc: 'Manda el contenido real del derecho a otra norma', ans: 'La remisión', opts: ['La remisión', 'La condición', 'La excepción', 'La declaración'] },
  { desc: 'Limita el derecho desde dentro, sin mandarlo a otra parte', ans: 'La condición', opts: ['La condición', 'La remisión', 'La excepción', 'El supuesto'] },
  { desc: 'Saca un caso concreto de la regla general', ans: 'La excepción', opts: ['La excepción', 'La condición', 'La remisión', 'La garantía'] },
  { desc: 'Una palabra que el artículo usa y no define, y que llena quien decide', ans: 'El concepto indeterminado', opts: ['El concepto indeterminado', 'El término técnico', 'La definición legal', 'La cláusula pétrea'] },
  { desc: 'La coletilla que amplía en favor de quien podría ser sancionado', ans: 'La excepción que protege', opts: ['La excepción que protege', 'La condición que recorta', 'La remisión al vacío', 'El concepto indeterminado'] },
  { desc: 'Un artículo que decide él mismo y no manda a nadie a completarlo', ans: 'El artículo que cierra', opts: ['El artículo que cierra', 'El artículo que remite', 'El artículo derogado', 'El artículo transitorio'] },
  { desc: 'Una remisión a una norma que nunca se dictó', ans: 'La remisión al vacío', opts: ['La remisión al vacío', 'La excepción que protege', 'El concepto indeterminado', 'La condición expresa'] },
]);

/* ---------- ¿qué tipo de coletilla es? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«Son responsables ante la ley los que abusen de este derecho»', func: 'Condición con concepto indeterminado', opts: ['Condición con concepto indeterminado', 'Remisión a otra norma', 'Excepción que protege', 'Sin coletilla'] },
  { trans: '«Siempre que no sean contrarias al orden público y a las buenas costumbres»', func: 'Condición con concepto indeterminado', opts: ['Condición con concepto indeterminado', 'Excepción que protege', 'Remisión a otra norma', 'Sin coletilla'] },
  { trans: '«Y de obtener pronta respuesta en el plazo legal»', func: 'Remisión a otra norma', opts: ['Remisión a otra norma', 'Condición con concepto indeterminado', 'Excepción que protege', 'Sin coletilla'] },
  { trans: '«Excepto en materia penal cuando la nueva ley favorezca al procesado»', func: 'Excepción que protege', opts: ['Excepción que protege', 'Condición con concepto indeterminado', 'Remisión a otra norma', 'Sin coletilla'] },
  { trans: '«La dignidad del ser humano es inviolable»', func: 'Sin coletilla', opts: ['Sin coletilla', 'Remisión a otra norma', 'Condición con concepto indeterminado', 'Excepción que protege'] },
]);

/* ---------- diagnóstico: ¿por dónde falla? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Se cita la primera frase del artículo y en la reunión contestan con la última', characteristic: 'Se leyó lo que da y no lo que condiciona', opts: ['Se leyó lo que da y no lo que condiciona', 'El artículo estaba derogado', 'Era materia pétrea', 'Faltaba ratificación'] },
  { disease: 'Niegan una reunión invocando el orden público y no dicen qué hecho la hace contraria', characteristic: 'Usan un concepto indeterminado sin llenarlo, y hay que pedirlo por escrito', opts: ['Usan un concepto indeterminado sin llenarlo, y hay que pedirlo por escrito', 'El artículo 78 no existe', 'Hace falta un tratado', 'Es un problema de vigencia'] },
  { disease: 'La petición lleva meses sin respuesta y nadie sabe cuál era el plazo', characteristic: 'El artículo 80 remite el plazo a la ley: hay que ir a buscar cuál', opts: ['El artículo 80 remite el plazo a la ley: hay que ir a buscar cuál', 'El derecho de petición no existe', 'El plazo lo fija la Constitución', 'Se necesita abogado para pedir'] },
  { disease: 'Se pelea contra la excepción del artículo 96 creyendo que recorta un derecho', characteristic: 'Esa excepción protege: favorece a quien podría ser sancionado', opts: ['Esa excepción protege: favorece a quien podría ser sancionado', 'El artículo 96 está derogado', 'Es una remisión al vacío', 'Solo aplica a la administración'] },
  { disease: 'Un reglamento define «abuso» de una forma que deja fuera casi todo lo que se quiere decir', characteristic: 'Quien llena el concepto indeterminado decide el alcance real del derecho', opts: ['Quien llena el concepto indeterminado decide el alcance real del derecho', 'El reglamento no puede definir nada', 'El artículo 72 no admite reglamento', 'Es problema de eficacia'] },
  { disease: 'El artículo remite a una ley de desarrollo y esa ley no aparece por ninguna parte', characteristic: 'Es una remisión al vacío: el derecho queda sin contenido exigible', opts: ['Es una remisión al vacío: el derecho queda sin contenido exigible', 'El artículo se derogó solo', 'La remisión se cumple sola', 'Hace falta esperar la reforma'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Lo que viene después del derecho y decide cuánto queda de él.', type: 'Coletilla' },
  { s: 'Manda el contenido real del derecho a otra norma.', type: 'Remisión' },
  { s: 'Limita el derecho desde dentro, sin mandarlo a otra parte.', type: 'Condición' },
  { s: 'Saca un caso concreto de la regla general.', type: 'Excepción' },
  { s: 'Una palabra que el artículo usa y no define.', type: 'Concepto indeterminado' },
  { s: 'La coletilla que amplía en favor de quien podría ser sancionado.', type: 'Excepción que protege' },
  { s: 'Un artículo que decide él mismo, sin mandar a nadie.', type: 'Artículo que cierra' },
  { s: 'Una remisión a una norma que nunca se dictó.', type: 'Remisión al vacío' },
  { s: 'Lo que se subraya primero al leer un derecho.', type: 'Lo que da' },
  { s: 'El sello con fecha que hace correr el plazo de una petición.', type: 'Constancia de recibido' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: '«Sin previa censura»', gen: 'Parte', n: 'Enuncia el derecho', g: 'Da', t: 'Artículo 72' },
  { w: '«Son responsables los que abusen»', gen: 'Parte', n: 'Condiciona con concepto abierto', g: 'Condiciona', t: 'Artículo 72' },
  { w: '«Se garantizan las libertades de reunión»', gen: 'Parte', n: 'Enuncia el derecho', g: 'Da', t: 'Artículo 78' },
  { w: '«Siempre que no sean contrarias al orden público»', gen: 'Parte', n: 'Condiciona con concepto abierto', g: 'Condiciona', t: 'Artículo 78' },
  { w: '«Derecho de presentar peticiones»', gen: 'Parte', n: 'Enuncia el derecho', g: 'Da', t: 'Artículo 80' },
  { w: '«En el plazo legal»', gen: 'Parte', n: 'Remite a otra norma', g: 'Condiciona', t: 'Artículo 80' },
  { w: '«La defensa es inviolable»', gen: 'Parte', n: 'Enuncia el derecho', g: 'Da', t: 'Artículo 82' },
  { w: '«En la forma que señalan las leyes»', gen: 'Parte', n: 'Remite a otra norma', g: 'Condiciona', t: 'Artículo 82' },
  { w: '«La dignidad del ser humano es inviolable»', gen: 'Parte', n: 'Cierra sin condición', g: 'Da', t: 'Artículo 59' },
  { w: '«Excepto si la nueva ley favorece»', gen: 'Parte', n: 'Excepción que protege', g: 'Da', t: 'Artículo 96' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'Lo que decide cuánto queda del derecho es la ___.', opts: ['coletilla', 'rúbrica', 'numeración'], ans: 'coletilla' },
  { s: 'El artículo 72 garantiza el pensamiento sin previa ___.', opts: ['censura', 'consulta', 'firma'], ans: 'censura' },
  { s: 'El 78 condiciona la reunión al orden público y a las buenas ___.', opts: ['costumbres', 'razones', 'formas'], ans: 'costumbres' },
  { s: 'El 80 remite el plazo de respuesta a la ___.', opts: ['ley', 'oficina', 'costumbre'], ans: 'ley' },
  { s: '«Orden público» es un concepto jurídico ___.', opts: ['indeterminado', 'definido', 'derogado'], ans: 'indeterminado' },
  { s: 'La excepción del 96 ___ a quien podría ser sancionado.', opts: ['favorece', 'perjudica', 'ignora'], ans: 'favorece' },
  { s: 'El 82 remite el acceso a los tribunales a la forma que señalan las ___.', opts: ['leyes', 'salas', 'partes'], ans: 'leyes' },
  { s: 'Un artículo sin coletilla ___ él mismo.', opts: ['cierra', 'remite', 'caduca'], ans: 'cierra' },
]);
B.explainQuestions = JSON.stringify([
  { q: 'Explica la técnica de «reconocer, remitir, condicionar» con un artículo de ejemplo.', ans: 'Se reconoce el derecho en la primera frase, que es la que se cita y la que se recuerda; se remite a la ley que lo desarrollará, con lo que el contenido real pasa a escribirlo otro; y se condiciona con un concepto que el propio texto no define. El artículo 82 lo hace en dos frases: declara que el derecho de defensa es inviolable y a continuación remite el acceso a los tribunales a la forma que señalan las leyes. Lo inviolable es el derecho; la puerta la regula otro, y ahí es donde se decide de verdad cuánto vale.' },
  { q: '¿Qué es un concepto jurídico indeterminado y por qué importa quién lo llena?', ans: 'Es una palabra que el artículo usa para condicionar un derecho y no define en ningún sitio: orden público, buenas costumbres, abuso, interés social, moral. Importa quién lo llena porque el contenido de esa palabra es el contenido real del límite. Si quien la llena es la misma autoridad que tiene que autorizar, el derecho queda a su criterio, y por eso lo que se pide en la práctica no es discutir la palabra sino que se diga por escrito qué hecho concreto la hace aplicable, con nombre y cargo de quien lo afirma.' },
  { q: 'No todas las coletillas recortan. Explica una que protege y por qué conviene distinguirlas.', ans: 'La del artículo 96: la ley no tiene efecto retroactivo, excepto en materia penal cuando la nueva ley favorezca al delincuente o procesado. Esa excepción amplía a favor de quien podría ser sancionado. También protege parte del 72, que responsabiliza no solo al que abusa del derecho sino a quienes por medios directos o indirectos restrinjan o impidan la circulación de ideas. Distinguirlas importa porque quien aprende a ver coletillas y no aprende a leerlas acaba peleando contra la única que estaba de su lado.' },
  { q: 'Le niegan una reunión invocando el orden público. ¿Qué hace, en orden?', ans: 'Pedir que lo digan por escrito, con nombre y cargo. Preguntar qué hecho concreto consideran contrario al orden público, porque el concepto sin hecho no es motivación de nada. Pedir la norma en que consta esa apreciación. Ofrecer por escrito las medidas que resolverían esa preocupación, que convierte una negativa en una negociación. Guardar copia sellada de todo. Y anotar el resultado, porque un concepto indeterminado usado sin llenarlo es material del Registro de Grietas.' },
  { q: '¿Por qué el artículo 80 es la grieta más limpia de esta etapa?', ans: 'Porque promete dos cosas a la vez y la segunda se la come a la primera: derecho a obtener pronta respuesta, en el plazo legal. La prontitud es del texto constitucional; el plazo lo fija una ley, y esa ley la tramita y aplica la misma administración que debe responder. El derecho queda reconocido en el escalón más alto y medido en uno más bajo por el propio obligado. No hace falta mala fe para que funcione mal: basta con que nadie fije el plazo.' },
  { q: '¿Cómo se lee un artículo de derechos, paso a paso?', ans: 'Cuatro pasos. Uno: subrayar qué da, el derecho tal como lo enuncia. Dos: subrayar qué viene después, y decir si es condición, remisión o excepción. Tres: marcar los conceptos que el artículo usa y no define, y preguntar quién los llena y si responde de ello. Cuatro: si hay remisión, ir a buscar la norma remitida y comprobar que existe, porque una remisión al vacío deja el derecho en el papel. Con eso ya se sabe cuánto vale el artículo, que casi nunca es lo que promete su primera frase.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['DERECHO', 'COLETILLA', 'CONDICION', 'REMISION', 'GARANTIA', 'CENSURA']),
  haceSopa(10, ['REUNION', 'PETICION', 'DEFENSA', 'INOCENTE', 'DIGNIDAD', 'IGUALDAD']),
  haceSopa(10, ['ABUSO', 'MORAL', 'PLAZO', 'SALVO', 'EXCEPCION', 'COSTUMBRES']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'En un artículo de derechos, la primera frase suele ser la que decide su alcance real.', a: false },
  { q: 'La coletilla puede condicionar, remitir o exceptuar.', a: true },
  { q: 'El artículo 72 garantiza la emisión del pensamiento sin previa censura.', a: true },
  { q: 'El artículo 72 no establece ninguna responsabilidad posterior.', a: false },
  { q: 'El artículo 78 condiciona la asociación y la reunión al orden público y a las buenas costumbres.', a: true },
  { q: '«Orden público» está definido en el mismo artículo que lo invoca.', a: false },
  { q: 'El artículo 80 remite a la ley el plazo para responder una petición.', a: true },
  { q: 'El artículo 82 declara inviolable el derecho de defensa.', a: true },
  { q: 'El artículo 82 no remite nada a la ley.', a: false },
  { q: 'Todas las coletillas recortan el derecho.', a: false },
  { q: 'La excepción del artículo 96 favorece a quien podría ser sancionado.', a: true },
  { q: 'Según el artículo 89, se presume la responsabilidad hasta que se pruebe lo contrario.', a: false },
  { q: 'El artículo 95 prohíbe sancionar con penas no establecidas previamente en la ley.', a: true },
  { q: 'Una remisión a una ley que nunca se dictó deja el derecho sin contenido exigible.', a: true },
  { q: 'El artículo 59 condiciona la dignidad humana al interés social.', a: false },
]);
B.evalMCBank = JSON.stringify([
  { q: '¿Qué parte de un artículo de derechos decide cuánto queda del derecho?', o: ['a) El número', 'b) La coletilla que viene después', 'c) El título del capítulo', 'd) La primera frase'], a: 1 },
  { q: 'Las tres formas de la coletilla son…', o: ['a) Condicionar, remitir y exceptuar', 'b) Declarar, publicar y reglamentar', 'c) Aprobar, ratificar y sancionar', 'd) Derogar, reformar y suspender'], a: 0 },
  { q: 'El artículo 72 responsabiliza ante la ley a…', o: ['a) Los medios de difusión únicamente', 'b) Nadie', 'c) Los que abusen del derecho y quienes impidan la circulación de ideas', 'd) Solo a los funcionarios'], a: 2 },
  { q: '«Buenas costumbres» es…', o: ['a) Un término definido en la ley penal', 'b) Un tratado', 'c) Una remisión expresa', 'd) Un concepto jurídico indeterminado'], a: 3 },
  { q: 'El artículo 80 promete pronta respuesta y remite el plazo…', o: ['a) A la ley', 'b) Al reglamento del centro', 'c) A la costumbre de la oficina', 'd) Al criterio del funcionario'], a: 0 },
  { q: 'El artículo 82 remite el acceso a los tribunales…', o: ['a) A un acuerdo', 'b) A la forma que señalan las leyes', 'c) Al juez de turno', 'd) A la Corte Suprema'], a: 1 },
  { q: 'La excepción del artículo 96…', o: ['a) Recorta la defensa', 'b) Remite al reglamento', 'c) Protege a quien podría ser sancionado', 'd) No tiene efecto'], a: 2 },
  { q: 'Según el artículo 89, toda persona es…', o: ['a) Sospechosa hasta el fallo', 'b) Responsable si hay denuncia', 'c) Investigada de oficio', 'd) Inocente mientras no se declare su responsabilidad'], a: 3 },
  { q: 'El artículo 95 prohíbe…', o: ['a) Sancionar con penas no establecidas previamente en la ley', 'b) Publicar sentencias', 'c) Reunirse sin permiso', 'd) Presentar peticiones'], a: 0 },
  { q: 'Ante una remisión, la segunda pregunta obligatoria es…', o: ['a) Quién firmó el artículo', 'b) Si la norma remitida existe', 'c) En qué año se escribió', 'd) Cuántos artículos tiene'], a: 1 },
  { q: 'Un artículo que no remite ni condiciona…', o: ['a) Está incompleto', 'b) Necesita reglamento', 'c) Cierra él mismo', 'd) Es transitorio'], a: 2 },
  { q: 'El artículo 59 declara que la dignidad del ser humano es…', o: ['a) Reglamentable', 'b) Condicionada al orden público', 'c) Sujeta a la ley', 'd) Inviolable'], a: 3 },
  { q: 'Lo primero que se hace cuando invocan «orden público» es…', o: ['a) Pedirlo por escrito con el hecho concreto', 'b) Aceptar y reprogramar', 'c) Discutir la palabra', 'd) Cambiar de oficina'], a: 0 },
  { q: 'El artículo 60 declara punible…', o: ['a) La crítica al Estado', 'b) Toda discriminación lesiva a la dignidad humana', 'c) La reunión sin aviso', 'd) La petición colectiva'], a: 1 },
  { q: 'Una remisión al vacío deja el derecho…', o: ['a) Derogado', 'b) Reforzado', 'c) Reconocido en el papel y sin contenido exigible', 'd) Convertido en pétreo'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'Lo que viene después del derecho y decide cuánto queda es la ___.', a: 'coletilla' },
  { q: 'La coletilla que manda el contenido a otra norma es una ___.', a: 'remision' },
  { q: 'La que limita el derecho desde dentro es una ___.', a: 'condicion' },
  { q: 'La que saca un caso de la regla es una ___.', a: 'excepcion' },
  { q: 'Una palabra que el artículo usa y no define es un concepto ___.', a: 'indeterminado' },
  { q: 'El artículo 72 garantiza el pensamiento sin previa ___.', a: 'censura' },
  { q: 'El artículo 78 invoca el orden público y las buenas ___.', a: 'costumbres' },
  { q: 'El artículo 80 remite el ___ de respuesta a la ley.', a: 'plazo' },
  { q: 'El artículo 82 declara inviolable el derecho de ___.', a: 'defensa' },
  { q: 'El artículo 89 declara a toda persona ___ mientras no se declare su responsabilidad.', a: 'inocente' },
  { q: 'El artículo 59 declara inviolable la ___ del ser humano.', a: 'dignidad' },
  { q: 'El artículo 60 declara punible toda ___ lesiva a la dignidad humana.', a: 'discriminacion' },
  { q: 'La excepción del 96 ___ a quien podría ser sancionado.', a: 'favorece' },
  { q: 'Una remisión a una ley que no existe es una remisión al ___.', a: 'vacio' },
  { q: 'Un artículo que no remite ni condiciona ___ él mismo.', a: 'cierra' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Coletilla', def: 'Lo que viene después y decide cuánto queda' },
  { term: 'Condición', def: 'Limita el derecho desde dentro' },
  { term: 'Remisión', def: 'Manda el contenido a otra norma' },
  { term: 'Excepción', def: 'Saca un caso de la regla' },
  { term: 'Concepto indeterminado', def: 'Palabra que el artículo usa y no define' },
  { term: 'Artículo 59', def: 'La dignidad del ser humano es inviolable' },
  { term: 'Artículo 60', def: 'Punible toda discriminación lesiva a la dignidad' },
  { term: 'Artículo 72', def: 'Sin previa censura, pero responden los que abusen' },
  { term: 'Artículo 78', def: 'Reunión, salvo contra el orden público' },
  { term: 'Artículo 80', def: 'Pronta respuesta, en el plazo legal' },
  { term: 'Artículo 82', def: 'Defensa inviolable, acceso según las leyes' },
  { term: 'Artículo 89', def: 'Inocente hasta que se declare lo contrario' },
  { term: 'Artículo 95', def: 'No hay pena sin ley previa' },
  { term: 'Artículo 96', def: 'La excepción penal que favorece' },
  { term: 'Remisión al vacío', def: 'Manda a una norma que no se dictó' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'M.E.T.A.S publica una crítica documentada al sistema de evaluación de la Secretaría. Un funcionario avisa de que eso «puede ser un abuso del derecho de expresión» y que hay responsabilidad.' },
  { txt: 'La familia convoca a treinta madres y padres en un patio para presentar el proyecto. En la alcaldía les dicen que no, porque podría ser contrario al orden público.' },
  { txt: 'Se presenta una petición a la dirección departamental pidiendo autorización para usar las fichas. Pasan cuatro meses sin respuesta y nadie sabe decir cuál era el plazo.' },
  { txt: 'Un maestro quiere reclamar por una ficha reproducida sin crédito y le dicen que primero necesita un abogado para poder entrar a un tribunal.' },
  { txt: 'Un centro anuncia que sancionará a quien use material «no aprobado», y la sanción no aparece en ninguna norma anterior.' },
  { txt: 'Cambian el reglamento y una oficina quiere aplicarlo a un trámite de M.E.T.A.S que se presentó tres meses antes.' },
  { txt: 'Se acusa al proyecto de haber incumplido un requisito, y le piden que demuestre que sí lo cumplió, sin decir en qué se basa la acusación.' },
  { txt: 'Un acuerdo dice que el material educativo se usará «conforme al interés social», y nadie sabe decir quién define ese interés social ni con qué criterio.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué da el artículo que está en juego, y qué le viene detrás: condición, remisión o excepción?',
  '2. ¿Hay algún concepto que el texto use y no defina? ¿Quién lo está llenando, y responde de ello?',
  '3. ¿La coletilla recorta o protege? Nómbralo, porque cambia de bando la discusión.',
  '4. ¿Qué pides por escrito, y qué guardas del intercambio?',
]);
B.critCaseGuides = JSON.stringify([
  'Se separan las dos partes antes de discutir nada, porque casi todo el mundo cita la primera y decide la segunda. Qué da: el derecho tal como lo enuncia la primera frase. Qué le viene detrás: una condición que lo limita desde dentro, una remisión que manda el contenido a otra norma, o una excepción que saca un caso de la regla. Si no hay nada detrás, el artículo cierra y lo que dice es lo que hay, que es más raro de lo que parece y por eso conviene notarlo.',
  'Orden público, buenas costumbres, abuso, interés social, moral. Son palabras que condicionan un derecho y que el texto no define, así que su contenido lo escribe quien las invoca. La pregunta no es filosófica: es quién, en este caso concreto, está diciendo que se aplica, con qué hecho, y si eso queda por escrito con su nombre y su cargo. Un concepto indeterminado invocado de palabra y sin hecho no es una motivación, es una respuesta sin fundamento.',
  'No todas las coletillas quitan. La excepción del artículo 96 amplía a favor de quien podría ser sancionado, y el propio 72 responsabiliza también a quienes restrinjan o impidan la circulación de ideas, no solo a quien abusa. Nombrar si la coletilla recorta o protege cambia de bando la discusión entera: se pasa de defenderse a invocar. Quien aprende a ver coletillas y no aprende a distinguirlas acaba peleando contra la única que estaba de su lado.',
  'Por escrito se pide lo mismo casi siempre: qué hecho concreto sostiene la decisión, en qué norma consta, y quién la firma con su cargo. Y del intercambio se guarda copia sellada de recibido con fecha, que además es lo que hace correr el plazo del artículo 80. Si de todo esto sale un concepto usado sin llenarlo o una remisión a una norma que no existe, eso se documenta en el Registro de Grietas antes de que se olvide.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"El artículo dice que es libre, así que puedo publicar lo que quiera sin consecuencias".', g1: 'La primera parte es cierta: no hay censura previa, nadie puede impedirlo antes. La segunda no: el mismo artículo dice que son responsables ante la ley los que abusen de ese derecho.', g2: 'La distinción práctica importa: la protección es contra el permiso previo, no contra la responsabilidad posterior. Se publica sin pedir permiso, y se responde de lo que se publica.' },
  { txt: '"Nos negaron la reunión por orden público, así que no hay nada que hacer".', g1: 'Orden público es un concepto que el artículo no define, y quien lo invoca tiene que decir qué hecho concreto lo hace aplicable. Sin hecho, no hay motivación.', g2: 'Lo que se hace es pedirlo por escrito y ofrecer por escrito las medidas que resolverían esa preocupación. Eso convierte una negativa cerrada en una negociación con constancia.' },
  { txt: '"El artículo 80 dice pronta respuesta, así que tienen que contestar rápido".', g1: 'Dice pronta respuesta en el plazo legal. La prontitud es del texto constitucional, pero el plazo concreto lo fija una ley, y hay que ir a buscar cuál es.', g2: 'Y ahí está la grieta: esa ley la tramita y la aplica la misma administración que debe responder. No hace falta mala fe para que funcione mal.' },
  { txt: '"Toda coletilla es una trampa para quitarte el derecho".', g1: 'No. La del artículo 96 amplía a favor de quien podría ser sancionado, y parte del 72 protege contra quienes restrinjan o impidan la circulación de ideas.', g2: 'Aprender a ver coletillas sin aprender a leerlas lleva a pelear contra la que estaba de tu lado, que es peor que no haberlas visto.' },
  { txt: '"Me acusan, así que tengo que demostrar que no lo hice".', g1: 'El artículo 89 dice lo contrario: toda persona es inocente mientras no se haya declarado su responsabilidad por autoridad competente.', g2: 'En la práctica esto se usa poco fuera de lo penal y sirve para mucho más: lo que se pide es que quien afirma diga en qué se basa, antes de ponerse uno a probar lo imposible.' },
  { txt: '"Cambió el reglamento, así que ahora se aplica también a lo que presentamos antes".', g1: 'El artículo 96 dice que la ley no tiene efecto retroactivo, y la excepción es solo en materia penal cuando favorece.', g2: 'Aplicar hacia atrás una regla nueva y más exigente es exactamente lo que ese artículo impide, y conviene decirlo por escrito y con su número.' },
]);
B.critDecisionBank = JSON.stringify([
  'Le avisan de que una publicación del proyecto «puede ser un abuso»: ¿se retira, se mantiene o se pregunta? ¿Qué se pregunta exactamente?',
  'Niegan una reunión invocando el orden público: ¿se reprograma, se discute o se pide por escrito? ¿Y qué se ofrece a cambio?',
  'La petición del artículo 80 lleva cuatro meses sin respuesta: ¿qué se busca primero y qué se presenta después?',
  'Un centro anuncia una sanción que no consta en ninguna norma anterior: ¿qué artículo se cita y en qué momento?',
  'Quieren aplicar un reglamento nuevo a un trámite presentado antes: ¿qué se contesta en una línea?',
  'Un acuerdo remite al «interés social» sin decir quién lo define: ¿se firma, se pregunta o se propone otra redacción?',
  'Le piden a la familia que demuestre que cumplió algo, sin decir en qué se basa la acusación: ¿qué se pide primero?',
  'Un artículo de derechos remite a una ley que nunca se dictó: ¿qué se puede exigir mientras tanto y qué se apunta?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Pedir por escrito qué hecho concreto hace aplicable el «orden público».', b: 'Discutir en la oficina si la reunión es o no contraria al orden público.', ga: 'Caso A: obliga a llenar el concepto con un hecho, que es lo que casi nunca hay, y deja constancia con nombre y cargo.', gb: 'Caso B: convierte un problema de motivación en una discusión de opiniones, donde gana quien tiene la firma.' },
  { a: 'Leer el artículo entero antes de citarlo en la reunión.', b: 'Citar la primera frase, que es la que todos recuerdan.', ga: 'Caso A: se llega sabiendo qué le van a contestar, porque la respuesta suele estar en la última línea del mismo artículo.', gb: 'Caso B: se cita algo cierto y a medias, y basta con que el otro lea la coletilla para que se caiga el argumento entero.' },
  { a: 'Entregar la petición por duplicado y exigir sello de recibido con fecha.', b: 'Entregarla y confiar en que quedó registrada.', ga: 'Caso A: el plazo del artículo 80 empieza a correr desde ese sello, y hay con qué demostrarlo.', gb: 'Caso B: sin constancia no hay fecha, y sin fecha no hay plazo que reclamar por mucho que la Constitución prometa prontitud.' },
  { a: 'Nombrar si la coletilla recorta o protege antes de decidir la estrategia.', b: 'Tratar toda coletilla como un recorte y atacarla.', ga: 'Caso A: cuando protege, se invoca en vez de pelearla, y eso cambia de bando la discusión entera.', gb: 'Caso B: se gasta esfuerzo en tumbar la excepción del 96, que era justamente la que estaba a favor.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se cita solo la primera frase de un artículo de derechos.', guide: 'En la reunión contestan con la última y el argumento se cae entero, incluida la parte que sí era correcta. Se pierde el punto y la credibilidad de lo que venía después.' },
  { cause: 'Se acepta una negativa fundada en «orden público» sin pedir el hecho concreto.', guide: 'Queda el precedente de que aquí basta invocar la palabra, y la próxima vez se invocará antes y con menos explicación.' },
  { cause: 'Se entrega una petición sin exigir sello de recibido.', guide: 'El plazo del artículo 80 nunca empieza a correr de forma demostrable, y a los cuatro meses no hay ni respuesta ni forma de reclamarla.' },
  { cause: 'Se pelea contra la excepción del artículo 96 creyendo que recorta.', guide: 'Se gasta el esfuerzo en tumbar la coletilla que estaba a favor, y de paso se le enseña al otro un argumento que no había visto.' },
  { cause: 'Se firma un acuerdo que remite al «interés social» sin decir quién lo define.', guide: 'El alcance de lo firmado lo escribirá después quien invoque esa palabra, y no será la casa.' },
  { cause: 'Se acepta la carga de demostrar que se cumplió algo, sin que digan en qué se basa la acusación.', guide: 'Se entra a probar lo imposible mientras el que acusa no sostiene nada, cuando el artículo 89 pone la inocencia como punto de partida.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'La publicación se mantuvo y nadie volvió a hablar de abuso.', guide: 'Se contestó que el artículo 72 prohíbe la censura previa y que la responsabilidad posterior exige decir qué hecho concreto constituye el abuso. Eso no se contestó nunca.' },
  { effect: 'La reunión se hizo, y con la negativa por escrito guardada.', guide: 'Se pidió el hecho concreto que la hacía contraria al orden público y se ofrecieron por escrito medidas para resolverlo. La negativa no se sostuvo.' },
  { effect: 'La petición se resolvió, y el plazo se pudo contar desde una fecha cierta.', guide: 'Se entregó por duplicado, con sello de recibido, nombre y cargo. Sin eso el artículo 80 promete prontitud sobre nada.' },
  { effect: 'El reglamento nuevo no se aplicó al trámite anterior.', guide: 'Se citó el artículo 96 con su número: la ley no tiene efecto retroactivo, y la excepción es solo penal y solo cuando favorece.' },
  { effect: 'Quien acusaba tuvo que decir en qué se basaba.', guide: 'Se invocó el artículo 89 antes de ponerse a probar nada. La inocencia es el punto de partida, no el premio final.' },
  { effect: 'El acuerdo quedó firmado sin la frase «conforme al interés social».', guide: 'Se pidió cambiarla por el hecho concreto que se quería asegurar. Lo que no se puede definir, no se firma.' },
]);

/* ---------- línea de tiempo: las siete piezas ---------- */
B.timelineData = JSON.stringify([
  { y: '1', icon: '🎁', label: 'Lo que da', text: 'La primera frase: <strong>el derecho tal como se enuncia</strong>. <strong>Sirve para:</strong> saber de qué se está hablando. <strong>Engaña:</strong> porque es la que se cita y la que se recuerda, y casi nunca es la que decide.' },
  { y: '2', icon: '🎭', label: 'La coletilla', text: 'Lo que viene después y <strong>decide cuánto queda</strong>. <strong>Tres formas:</strong> condiciona, remite o exceptúa. <strong>Se pierde:</strong> leyendo solo hasta el primer punto.' },
  { y: '3', icon: '🔗', label: 'La condición', text: 'Limita el derecho <strong>desde dentro</strong>, sin mandarlo a otra parte. <strong>Se reconoce:</strong> «siempre que», «en tanto no». <strong>Aquí:</strong> el artículo 78 con el orden público y las buenas costumbres.' },
  { y: '4', icon: '➡️', label: 'La remisión', text: 'Manda el contenido real <strong>a otra norma</strong>. <strong>Se reconoce:</strong> «en el plazo legal», «en la forma que señalan las leyes». <strong>Aquí:</strong> los artículos 80 y 82, que reconocen y remiten en la misma frase.' },
  { y: '5', icon: '🚪', label: 'La excepción', text: 'Saca <strong>un caso concreto</strong> de la regla. <strong>Se reconoce:</strong> «salvo», «excepto». <strong>Ojo:</strong> no siempre recorta. La del artículo 96 protege a quien podría ser sancionado.' },
  { y: '6', icon: '❓', label: 'El concepto indeterminado', text: 'Una palabra que el artículo usa y <strong>no define</strong>: orden público, buenas costumbres, abuso, interés social. <strong>Lo llena:</strong> quien lo invoca. <strong>Por eso:</strong> se pide el hecho concreto, por escrito.' },
  { y: '7', icon: '🔒', label: 'El artículo que cierra', text: 'El que <strong>decide él mismo</strong> y no manda a nadie. <strong>Aquí:</strong> el 59, que declara inviolable la dignidad humana, y el 89, que declara inocente a toda persona. <strong>Sirve de contraste:</strong> así se ve lo que hace la coletilla en los demás.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  daquita: {
    nombre: 'Lo que da y lo que quita', icon: '🎭',
    estructura: { title: 'Qué es', info: '• <strong>Lo que da:</strong> el derecho, en la primera frase<br>• <strong>La coletilla:</strong> lo que viene después y decide cuánto queda<br>• Tres formas: condiciona, remite o exceptúa' },
    funcion: { title: 'Cómo se reconoce', info: '• Se subraya con dos colores: <strong>lo que da</strong> y <strong>lo que condiciona</strong><br>• Se lee hasta el final del artículo, no hasta el primer punto<br>• Se pregunta: si me contestan con la última línea, ¿qué me queda?' },
    enfermedades: { title: 'Dónde se cae', info: '• Citando la primera frase, que es la que todos recuerdan<br>• Creyendo que un derecho reconocido es un derecho absoluto<br>• Descubriendo la coletilla <strong>en la ventanilla</strong> y no antes' },
    cuidados: { title: 'En este proyecto', info: '• Antes de invocar un derecho en una reunión, se lee <strong>entero</strong><br>• Se llega sabiendo con qué van a contestar<br>• Y lo que salga de esa lectura se apunta en el <strong>Registro de Grietas</strong>' },
  },
  indeterminados: {
    nombre: 'Los conceptos que nadie define', icon: '❓',
    estructura: { title: 'Qué es', info: '• Palabras que condicionan un derecho y <strong>el texto no define</strong><br>• Orden público, buenas costumbres, abuso, interés social, moral<br>• Su contenido lo escribe <strong>quien las invoca</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se pregunta: ¿esta palabra está definida en algún sitio?<br>• Y la pregunta que sirve de verdad: <strong>¿qué hecho concreto</strong> la hace aplicable aquí?<br>• Un concepto sin hecho no es motivación, es una respuesta sin fundamento' },
    enfermedades: { title: 'Dónde se cae', info: '• Discutiendo la palabra en abstracto, que es la discusión que se pierde<br>• Aceptando la negativa de palabra, sin nombre ni cargo<br>• Sin ofrecer nada: una negativa cerrada es más fácil de sostener que una negociada' },
    cuidados: { title: 'En este proyecto', info: '• Toda invocación de estas palabras se pide <strong>por escrito</strong><br>• Con el hecho concreto y con <strong>quién la firma</strong><br>• Y se ofrece por escrito qué resolvería esa preocupación' },
  },
  proteger: {
    nombre: 'La coletilla que protege', icon: '🛡️',
    estructura: { title: 'Qué es', info: '• No todas recortan: algunas <strong>amplían a tu favor</strong><br>• <strong>Art. 96:</strong> la ley no es retroactiva, <strong>excepto</strong> en penal cuando favorece<br>• <strong>Art. 72:</strong> responden también quienes restrinjan o impidan la circulación de ideas' },
    funcion: { title: 'Cómo se reconoce', info: '• Se pregunta <strong>a quién beneficia</strong> la excepción, no solo qué dice<br>• Si beneficia a quien podría ser sancionado, es de las que protegen<br>• Y entonces no se pelea: <strong>se invoca</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Tratando toda coletilla como un recorte, por costumbre<br>• Gastando el esfuerzo en tumbar la única que estaba a favor<br>• Y de paso enseñándole al otro un argumento que no había visto' },
    cuidados: { title: 'En este proyecto', info: '• Antes de atacar una coletilla se nombra: <strong>¿recorta o protege?</strong><br>• El <strong>96</strong> sirve cuando quieren aplicar hacia atrás una regla nueva<br>• El <strong>89</strong> sirve cuando le piden a la casa probar lo imposible' },
  },
  peticion: {
    nombre: 'La petición y su plazo', icon: '📨',
    estructura: { title: 'Qué es', info: '• <strong>Art. 80:</strong> derecho a presentar peticiones y a obtener <strong>pronta respuesta en el plazo legal</strong><br>• Reconoce y remite en la misma frase<br>• La prontitud es constitucional; el plazo lo fija una ley' },
    funcion: { title: 'Cómo se reconoce', info: '• Se escribe con hechos numerados y <strong>una petición concreta</strong><br>• Se dirige a quien de verdad puede resolverla<br>• Se entrega <strong>por duplicado</strong> y se exige sello de recibido con fecha' },
    enfermedades: { title: 'Dónde se cae', info: '• Entregando sin sello: sin fecha cierta <strong>no hay plazo</strong> que reclamar<br>• Pidiendo de palabra, que no deja rastro<br>• Escribiendo una queja en vez de una petición que se pueda cumplir' },
    cuidados: { title: 'En este proyecto', info: '• De toda entrega se guarda <strong>copia sellada</strong> con nombre y cargo<br>• El plazo se cuenta desde ese sello, no desde la conversación<br>• Y la remisión del 80 va al Registro: es la grieta más limpia de la etapa' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Cita la primera frase 🌫️' },
  { t: 25, n: 'Lee hasta el final del artículo 🎭' },
  { t: 55, n: 'Separa lo que da de lo que quita ✂️' },
  { t: 90, n: 'Caza el concepto que nadie define ❓' },
  { t: 130, n: 'Distingue la coletilla que protege 🛡️' },
  { t: 165, n: 'Pide el hecho concreto por escrito 📨' },
  { t: 190, n: 'Llega sabiendo qué le van a contestar ⚖️' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de las coletillas superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de los derechos explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de lo que da y lo que quita experto' },
  id_master: { icon: '🔍', label: 'Identificador de coletillas maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de los derechos' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta de la Ley y sus Grietas completada' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_ley_coletilla_v1';");

src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se separa lo que el artículo da de lo que le viene detrás, porque casi todo el mundo cita la primera frase y decide la última: condición si limita desde dentro, remisión si manda el contenido a otra norma, excepción si saca un caso de la regla. Después se buscan las palabras que el texto usa y no define, que son orden público, buenas costumbres, abuso, interés social y moral, y se pregunta quién las está llenando en este caso concreto, con qué hecho y si eso queda por escrito con nombre y cargo. Luego se nombra si la coletilla recorta o protege, porque eso cambia de bando la discusión entera y hay coletillas que están a favor, como la excepción penal del artículo 96. Y al final se pide por escrito el hecho concreto y la norma en que consta, se ofrece por escrito qué resolvería la preocupación, y se guarda copia sellada con fecha, que además es lo que hace correr el plazo del artículo 80.";');

/* ---------- lo que arrastra el molde (la etapa 2) ---------- */
const textos = [
  [/📜 \*Ruta de la Ley y sus Grietas · Etapa 2\* 📜/g, '🎭 *Ruta de la Ley y sus Grietas · Etapa 3* 🎭'],
  [/La Constitución de 1982 por dentro: sus ocho títulos, cómo se lee un artículo por piezas y qué hace falta para reformarlo\. 📜/g,
    'Los derechos y la coletilla que los devuelve: qué da un artículo, qué le viene detrás y quién llena las palabras que nadie define. 🎭'],
  [/_Incluye evaluación conceptual y el artículo sobre la mesa\._ ✍️/g, '_Incluye evaluación conceptual y el derecho sobre la mesa._ ✍️'],
  [/El artículo sobre la mesa/g, 'El derecho sobre la mesa'],
  [/el artículo sobre la mesa/g, 'el derecho sobre la mesa'],
  [/Ruta de la Ley y sus Grietas · Etapa 2: Anatomía de la Constitución de 1982/g, 'Ruta de la Ley y sus Grietas · Etapa 3: Los derechos y la coletilla que los devuelve'],
  [/Anatomía de la Constitución de 1982: qué declara y cómo se reforma/g, 'Los derechos y la coletilla que los devuelve'],
  [/Anatomía de la Constitución de 1982/g, 'Los derechos y la coletilla'],
  [/anatomía de la Constitución de 1982/g, 'los derechos y la coletilla'],
  [/Etapa 2 · Derecho y Ley/g, 'Etapa 3 · Derecho y Ley'],
  [/completó la Etapa 2 de la Ruta de la Ley y sus Grietas/g, 'completó la Etapa 3 de la Ruta de la Ley y sus Grietas'],
  [/📜 ¡/g, '🎭 ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV venían de la etapa 2. */
src = src.replace(/¿En qué título vive lo que está en juego[^<]*/g,
  '¿Qué da el artículo y qué le viene detrás, hay alguna palabra que el texto no defina, y esa coletilla recorta o protege? Explica qué pides por escrito y qué guardas del intercambio.');
src = src.replace(/1\. ¿Cuál de los dos se sostiene con el texto comprobado en la mano\? 2\. ¿Por qué no son la misma decisión\?/g,
  '1. ¿Cuál de los dos deja al otro con la carga de decir en qué se basa? 2. ¿Por qué no son la misma decisión?');

/* La simulación de la etapa 2 era la reforma celebrada antes de tiempo. Aquí
   es el derecho que se invoca a medias y se cae con su propia coletilla. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(leyoEntero){sfx(leyoEntero?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(leyoEntero){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🔎</span><span class="ms-text"><strong>Leíste el artículo entero antes de la reunión:</strong> el derecho está en la primera frase y la responsabilidad por abuso, en la última. Llegaste sabiendo con qué te iban a contestar.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📝</span><span class="ms-text"><strong>Y pediste el hecho concreto:</strong> qué parte de lo publicado constituye el abuso, en qué norma consta y quién lo firma. Eso no se contestó, y la publicación se quedó donde estaba.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">📣</span><span class="ms-text"><strong>Citaste la primera frase:</strong> «es libre la emisión del pensamiento, sin previa censura». Sonó fuerte y era verdad.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🎭</span><span class="ms-text"><strong>Y te contestaron con la última:</strong> «son responsables ante la ley los que abusen de este derecho». Del mismo artículo. Se cayó el argumento entero, incluida la parte que sí era correcta.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='daquita',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"daquita\"]')?.classList.add('active-pri');");

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
