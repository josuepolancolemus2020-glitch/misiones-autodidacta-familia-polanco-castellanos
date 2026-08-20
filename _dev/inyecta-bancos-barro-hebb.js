/* Inyecta los bancos de la misión «La regla de Hebb, bien contada» (Ruta del
   Barro Vivo, etapa 1: la puerta de la Neuroplasticidad) sobre el molde
   copiado de la etapa 1 de la Ruta de la Máquina que se Mira.
   Uso:  node _dev/inyecta-bancos-barro-hebb.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio entra sin su etiqueta. Los que
   sostienen esta etapa, con la suya:

     · Hebb (1949), «The Organization of Behavior», capítulo 4: el postulado
       neurofisiológico. CLÁSICO SÓLIDO, con la letra chica que puso el propio
       Hebb: era una CONJETURA teórica, no un experimento.
     · Löwel y Singer (1992), Science: de aquí sale «lo que dispara junto se
       cablea junto», y la rima que corrió el mundo es de Carla Shatz, del
       mismo año. El estudio es SÓLIDO; el eslogan es DIVULGACIÓN CON INFLADO,
       empezando por atribuírselo a Hebb.
     · Markram y colegas (1997), Science, y Bi y Poo (1998), Journal of
       Neuroscience: la plasticidad dependiente del orden de disparo, con su
       ventana de decenas de milisegundos. SÓLIDOS, con la limitación
       declarada: medido en tejido y cultivo, no en animal despierto.
     · Hebb (1947): las ratas que anduvieron sueltas por su casa resolvían
       mejor. CLÁSICO SÓLIDO.
     · Ericsson y colegas (1993): la práctica deliberada, con corrección
       inmediata. CLÁSICO CUESTIONADO en el tamaño de su efecto (Macnamara y
       colegas, 2014). Se estudia entero en la etapa 4 de esta ruta.

   La idea que ordena todos los bancos: el postulado pide que A PARTICIPE en
   hacer disparar a B, y eso trae causa y orden; el eslogan solo pide
   simultaneidad. Por eso la exposición pasiva junta estímulos y solo la
   práctica activa (producir, fallar, ser corregido enseguida) encadena causa
   y efecto, que es lo único que la regla premia.                          */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-barro-regla-hebb', 'js', 'regla-hebb.js');

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
  { w: 'La regla de Hebb', a: '🏺 El <strong>postulado neurofisiológico</strong> que Donald Hebb publicó en 1949, en el capítulo 4 de «The Organization of Behavior». No es una ley demostrada: él mismo la llamó postulado, es decir, algo que se da por supuesto para poder seguir razonando.' },
  { w: 'El postulado, entero', a: '📕 Cuando el axón de A está lo bastante cerca de B para excitarla y <strong>participa de forma repetida o persistente en hacerla disparar</strong>, ocurre un cambio de crecimiento o metabólico que <strong>aumenta la eficacia de A para disparar a B</strong>.' },
  { w: '«Participa en hacerla disparar»', a: '🔑 Las cuatro palabras que el eslogan borró. No dice «coincide»: dice que <strong>A contribuye a encender a B</strong>. Ahí hay causa y hay orden, y ahí está toda la etapa.' },
  { w: 'El eslogan', a: '📣 «Lo que dispara junto se cablea junto.» Rima, se pega y <strong>no es de Hebb</strong>. Aplana el postulado porque «junto» no distingue quién ayudó a quién ni quién llegó primero.' },
  { w: 'Quién escribió el eslogan', a: '🗓️ La formulación es de <strong>Siegrid Löwel y Wolf Singer</strong>, en Science, en <strong>1992</strong>; la rima que corrió el mundo la puso <strong>Carla Shatz</strong> ese mismo año. Atribuírsela a Hebb es el error más citado de la neurociencia popular.' },
  { w: 'Coincidencia contra causalidad', a: '⚖️ Dos células activas a la vez son <strong>coincidencia</strong>, y en un cerebro despierto hay millones cada instante. Que una <strong>participe</strong> en encender a la otra es causalidad, y es lo único que la regla premia.' },
  { w: 'Orden de disparo', a: '⏱️ El nombre técnico es <strong>plasticidad dependiente del orden de disparo</strong>. Si A dispara antes que B, la conexión se refuerza; si dispara después, se debilita. El mismo par de células, el resultado contrario.' },
  { w: 'La ventana de milisegundos', a: '🔬 <strong>Bi y Poo (1998)</strong>, en el Journal of Neuroscience, con neuronas de hipocampo en cultivo: unas <strong>decenas de milisegundos</strong> deciden el signo del cambio. Fuera de esa ventana, casi no pasa nada.' },
  { w: 'Potenciación y depresión', a: '🔀 Reforzar una conexión es <strong>potenciación</strong>; debilitarla es <strong>depresión</strong>. Debilitar no es una avería: es la otra mitad del aprendizaje, y aparece cuando el orden se invierte.' },
  { w: 'Markram (1997)', a: '🧪 Markram, Lübke, Frotscher y Sakmann publicaron en <strong>Science</strong>, en 1997, que la eficacia de la sinapsis se regula por la <strong>coincidencia con orden</strong> entre el potencial postsináptico y el disparo de la célula receptora.' },
  { w: 'La asamblea de células', a: '🧱 La otra idea grande del libro de 1949: un <strong>grupo de células que se enciende en conjunto</strong> y acaba funcionando como una unidad. Hebb la encadenaba en «secuencias de fases» para explicar un pensamiento.' },
  { w: 'Las ratas de 1947', a: '🐀 Hebb se llevó ratas del laboratorio a su casa para que jugaran sus hijas. Las que anduvieron sueltas resolvían después mejor los problemas que las de la jaula. <strong>La diferencia no fue el estímulo: fue quién producía el movimiento.</strong>' },
  { w: 'Práctica activa', a: '🎯 Se <strong>produce</strong> la respuesta, aparece el resultado y llega la <strong>corrección enseguida</strong>. Es la traducción práctica del postulado: hay dirección, hay orden y hay repetición.' },
  { w: 'Exposición pasiva', a: '📺 El material pasa por delante y no se produce nada: video de fondo, audio en el bus, tutorial mientras se cocina. Cumple el eslogan (los estímulos coinciden) y <strong>no cumple el postulado</strong>.' },
  { w: 'La regla no distingue', a: '⚠️ Refuerza <strong>lo que se repite</strong>, sea acierto o error. Practicar sin corrección es la forma más segura de volverse muy bueno en algo que se hace mal, y por eso mejorar obliga a ir más lento.' },
  { w: 'La cláusula de especificidad', a: '📐 Se gana <strong>lo practicado y nada más</strong>. Quien mira quince años se vuelve excelente en reconocer, no en hacer. Con esta cláusula caen, en la etapa 6, todos los mitos de esta materia.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿En qué libro y en qué año aparece el postulado de Hebb?', o: ['a) «The Organization of Behavior», en 1949', 'b) «The Organization of Behavior», en 1992', 'c) «Principles of Neural Science», en 1949', 'd) Un artículo de Science, en 1997'], c: 0 },
  { q: 'Según el postulado, para que la conexión se fortalezca hace falta que A…', o: ['a) Esté activa al mismo tiempo que B', 'b) Participe en hacer disparar a B', 'c) Esté más lejos de B', 'd) Dispare después que B'], c: 1 },
  { q: '¿De quién es la frase «lo que dispara junto se cablea junto»?', o: ['a) De Donald Hebb, en 1949', 'b) De Bi y Poo, en 1998', 'c) De Löwel y Singer, en 1992, con la rima de Carla Shatz', 'd) De Karl Lashley, en 1950'], c: 2 },
  { q: '¿Qué le quita al postulado el eslogan de 1992?', o: ['a) La repetición', 'b) La cercanía entre las células', 'c) El nombre del autor', 'd) La causa y el orden: «junto» no dice quién ayudó a quién'], c: 3 },
  { q: 'Si A dispara unas decenas de milisegundos DESPUÉS que B, la conexión…', o: ['a) Se debilita', 'b) Se refuerza igual', 'c) No cambia nunca', 'd) Se refuerza el doble'], c: 0 },
  { q: '¿Cómo se llama lo que midieron Markram (1997) y Bi y Poo (1998)?', o: ['a) La memoria de trabajo', 'b) La plasticidad dependiente del orden de disparo', 'c) El periodo crítico', 'd) La práctica deliberada'], c: 1 },
  { q: 'Hebb llamó a su enunciado «postulado» porque…', o: ['a) Era una ley ya demostrada', 'b) Se lo pidió su editor', 'c) Era una conjetura que alguien tendría que comprobar', 'd) Lo copió de un colega'], c: 2 },
  { q: 'Poner un video de inglés de fondo mientras se ordena el cuarto es…', o: ['a) Práctica deliberada', 'b) Corrección inmediata', 'c) Repetición con dirección', 'd) Coincidencia: no hay nada que participe en encender nada'], c: 3 },
  { q: 'Practicar mucho y sin corrección produce sobre todo…', o: ['a) Un error muy bien cableado', 'b) Un aprendizaje más lento pero seguro', 'c) Ningún cambio en absoluto', 'd) Una mejora automática con el tiempo'], c: 0 },
  { q: '¿Qué mostraron las ratas que Hebb se llevó a casa en 1947?', o: ['a) Que las jaulas grandes bastan', 'b) Que las que anduvieron sueltas resolvían mejor los problemas', 'c) Que el tamaño del cerebro no cambia', 'd) Que las ratas no aprenden'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Hebb', 'Eslogan'], headA: '📕 Lo que dice el postulado', headB: '📣 Lo que dice el eslogan', colA: 'ok', colB: 'no',
    words: [
      { w: 'A participa en hacer disparar a B', t: 'ok' }, { w: 'Basta con estar activas a la vez', t: 'no' },
      { w: 'El refuerzo va de A hacia B', t: 'ok' }, { w: 'El refuerzo es mutuo y simétrico', t: 'no' },
      { w: 'Publicado en 1949', t: 'ok' }, { w: 'Publicado en 1992', t: 'no' },
      { w: 'Se declara conjetura', t: 'ok' }, { w: 'Se cita como ley probada', t: 'no' },
    ],
  },
  {
    label: ['Refuerza', 'Debilita'], headA: '⬆️ La conexión se refuerza', headB: '⬇️ La conexión se debilita', colA: 'ok', colB: 'no',
    words: [
      { w: 'A dispara antes que B', t: 'ok' }, { w: 'A dispara después que B', t: 'no' },
      { w: 'El intento y su corrección enseguida', t: 'ok' }, { w: 'La corrección ocho días después', t: 'no' },
      { w: 'Preguntar y comprobar en el momento', t: 'ok' }, { w: 'Ver la respuesta antes de intentar', t: 'no' },
      { w: 'La mano del abuelo corrigiendo el pulgar', t: 'ok' }, { w: 'El error repetido sin que nadie lo nombre', t: 'no' },
    ],
  },
  {
    label: ['Práctica activa', 'Exposición pasiva'], headA: '🎯 Práctica activa', headB: '📺 Exposición pasiva', colA: 'ok', colB: 'no',
    words: [
      { w: 'Decirlo en voz alta sin mirar', t: 'ok' }, { w: 'Oír el audio en el bus', t: 'no' },
      { w: 'Resolver el ejercicio y comprobar', t: 'ok' }, { w: 'Ver el tutorial mientras se cocina', t: 'no' },
      { w: 'Tocar el pasaje y que corrijan el dedo', t: 'ok' }, { w: 'Escuchar la grabación veinte veces', t: 'no' },
      { w: 'Escribir la frase y que la tachen', t: 'ok' }, { w: 'Subrayar mientras se relee', t: 'no' },
    ],
  },
  {
    label: ['Dato con etiqueta', 'Inflado'], headA: '✅ Lo que se puede sostener', headB: '🎈 Lo inflado', colA: 'ok', colB: 'no',
    words: [
      { w: 'Hebb lo llamó postulado, no ley', t: 'ok' }, { w: '«Hebb demostró que el cerebro se recablea solo»', t: 'no' },
      { w: 'Bi y Poo lo midieron en cultivo', t: 'ok' }, { w: '«Está probado en la vida diaria de cualquiera»', t: 'no' },
      { w: 'El eslogan es de Löwel y Singer', t: 'ok' }, { w: '«El eslogan es la frase famosa de Hebb»', t: 'no' },
      { w: 'Se gana lo practicado', t: 'ok' }, { w: '«Entrena el cerebro y mejora todo»', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra clave ---------- */
B.idData = JSON.stringify([
  { s: ['El', 'postulado', 'pide', 'que', 'A', 'participe.'], c: 1, art: 'Lo que Hebb escribió en 1949' },
  { s: ['El', 'eslogan', 'solo', 'pide', 'coincidencia.'], c: 1, art: 'La frase de 1992 que se le atribuye mal' },
  { s: ['El', 'orden', 'decide', 'si', 'refuerza', 'o', 'debilita.'], c: 1, art: 'Lo que el eslogan borra' },
  { s: ['Disparar', 'antes', 'refuerza', 'la', 'conexión.'], c: 1, art: 'La posición de A que potencia' },
  { s: ['La', 'corrección', 'vale', 'por', 'su', 'cercanía.'], c: 1, art: 'Lo que engancha el intento con su resultado' },
  { s: ['La', 'exposición', 'pasiva', 'solo', 'acompaña.'], c: 1, art: 'Lo que cumple el eslogan y no el postulado' },
  { s: ['Se', 'gana', 'lo', 'practicado', 'y', 'nada', 'más.'], c: 3, art: 'La cláusula de especificidad' },
  { s: ['Hebb', 'llamó', 'postulado', 'a', 'su', 'conjetura.'], c: 2, art: 'La palabra que declara el estatus' },
]);

/* ---------- completa ---------- */
B.cmpData = JSON.stringify([
  { s: 'Hebb publicó su postulado en el año ___.', opts: ['1949', '1992', '1998'], c: 0 },
  { s: 'El postulado exige que A ___ en hacer disparar a B.', opts: ['coincida', 'participe', 'compita'], c: 1 },
  { s: 'El eslogan de 1992 es de Löwel y ___.', opts: ['Poo', 'Hebb', 'Singer'], c: 2 },
  { s: 'Si A dispara después que B, la conexión se ___.', opts: ['debilita', 'refuerza', 'duplica'], c: 0 },
  { s: 'La ventana que midieron Bi y Poo se cuenta en ___.', opts: ['horas', 'milisegundos', 'semanas'], c: 1 },
  { s: 'La regla refuerza lo que se repite, sea acierto o ___.', opts: ['premio', 'descanso', 'error'], c: 2 },
  { s: 'Mirar quince años cablea la destreza de ___.', opts: ['reconocer', 'fabricar', 'vender'], c: 0 },
  { s: 'Hebb llamó a su enunciado un ___, no una ley.', opts: ['dogma', 'postulado', 'teorema'], c: 1 },
]);

/* ---------- reto final ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Hebb', 'Eslogan'], btnA: '📕 Hebb', btnB: '📣 Eslogan', colA: 'ok', colB: 'no',
    words: [
      { w: 'A participa en disparar a B', t: 'ok' }, { w: 'Basta con estar activas a la vez', t: 'no' },
      { w: 'Publicado en 1949', t: 'ok' }, { w: 'Publicado en 1992', t: 'no' },
      { w: 'Tiene dirección: de A hacia B', t: 'ok' }, { w: 'No dice quién ayudó a quién', t: 'no' },
      { w: 'Se declara conjetura', t: 'ok' }, { w: 'Rima en inglés', t: 'no' },
      { w: 'Capítulo 4 del libro', t: 'ok' }, { w: 'Sale en anuncios de aplicaciones', t: 'no' },
    ],
  },
  {
    label: ['Refuerza', 'Debilita'], btnA: '⬆️ Refuerza', btnB: '⬇️ Debilita', colA: 'ok', colB: 'no',
    words: [
      { w: 'A antes que B', t: 'ok' }, { w: 'A después que B', t: 'no' },
      { w: 'Intento y corrección pegados', t: 'ok' }, { w: 'Corrección el lunes siguiente', t: 'no' },
      { w: 'Comprobar tras responder', t: 'ok' }, { w: 'Ver la respuesta y luego copiarla', t: 'no' },
      { w: 'El pulgar corregido en el segundo', t: 'ok' }, { w: 'El error repetido sin nombrarlo', t: 'no' },
      { w: 'Preguntar suelto y verificar', t: 'ok' }, { w: 'Cantar la tabla sin fallar nunca', t: 'no' },
    ],
  },
  {
    label: ['Activa', 'Pasiva'], btnA: '🎯 Activa', btnB: '📺 Pasiva', colA: 'ok', colB: 'no',
    words: [
      { w: 'Decirlo sin mirar', t: 'ok' }, { w: 'Audio de fondo en el bus', t: 'no' },
      { w: 'Resolver y comprobar', t: 'ok' }, { w: 'Tutorial mientras se cocina', t: 'no' },
      { w: 'Escribir y que lo tachen', t: 'ok' }, { w: 'Subrayar releyendo', t: 'no' },
      { w: 'Tocar el pasaje despacio', t: 'ok' }, { w: 'Escuchar la grabación', t: 'no' },
      { w: 'Grabarse y volver a oírse', t: 'ok' }, { w: 'Ver a otro hacerlo bien', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'La práctica que sí cablea, de principio a fin',
    steps: [
      'Elegir la tarea concreta que se va a producir, no la que se va a mirar',
      'Bajar la velocidad hasta que quepa la corrección',
      'Producir el intento sin mirar el modelo',
      'Comprobar enseguida si salió, en el mismo minuto',
      'Nombrar en voz alta qué falló, antes del intento siguiente',
      'Repetir el intento con la corrección puesta y apuntar cuántos salieron',
    ],
  },
  {
    label: 'Cómo se desmonta una frase mal atribuida',
    steps: [
      'Escribir la frase tal como la citan',
      'Buscar a quién se la atribuyen y en qué año',
      'Buscar el texto original y leer la frase entera',
      'Marcar qué palabras del original no están en la cita',
      'Decir qué cambia en la práctica por esas palabras que faltan',
      'Guardar la fuente buena con su etiqueta de estatus',
    ],
  },
  {
    label: 'Cómo se audita una práctica de la casa',
    steps: [
      'Contar la práctica tal como ocurre hoy, sin adornarla',
      'Separar qué produce quien practica y qué solo recibe',
      'Apuntar quién corrige y cuánto tarda en llegar la corrección',
      'Poner en orden el intento y su consecuencia, y ver cuál va primero',
      'Preguntarse qué quedará cableado si esto se repite un mes',
      'Cambiar una sola cosa, la más barata, y volver a medir a la semana',
    ],
  },
]);

/* ---------- identifica la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Exige que A tome parte en hacer disparar a B', ans: 'El postulado de Hebb', opts: ['El postulado de Hebb', 'El eslogan de 1992', 'La asamblea de células', 'La exposición pasiva'] },
  { desc: 'Dice que basta con que dos células se enciendan a la vez', ans: 'El eslogan de 1992', opts: ['El eslogan de 1992', 'El postulado de Hebb', 'La práctica deliberada', 'La depresión sináptica'] },
  { desc: 'Decide el signo del cambio según quién dispara primero', ans: 'El orden de disparo', opts: ['El orden de disparo', 'La cercanía entre células', 'La asamblea de células', 'La especificidad'] },
  { desc: 'Las decenas de milisegundos dentro de las cuales el cambio ocurre', ans: 'La ventana temporal', opts: ['La ventana temporal', 'El periodo crítico', 'La secuencia de fases', 'La corrección diferida'] },
  { desc: 'Grupo de células que se enciende en conjunto y funciona como unidad', ans: 'La asamblea de células', opts: ['La asamblea de células', 'La ventana temporal', 'El axón', 'La práctica activa'] },
  { desc: 'Producir la respuesta y recibir la corrección enseguida', ans: 'La práctica activa', opts: ['La práctica activa', 'La exposición pasiva', 'El eslogan de 1992', 'La depresión sináptica'] },
  { desc: 'El material pasa por delante y no se produce nada', ans: 'La exposición pasiva', opts: ['La exposición pasiva', 'La práctica activa', 'El postulado de Hebb', 'El orden de disparo'] },
  { desc: 'Se gana lo practicado y nada más', ans: 'La cláusula de especificidad', opts: ['La cláusula de especificidad', 'La asamblea de células', 'La ventana temporal', 'El eslogan de 1992'] },
]);

/* ---------- qué está haciendo esa frase ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«Lo que dispara junto se cablea junto»', func: 'El eslogan de 1992, atribuido mal a Hebb', opts: ['El eslogan de 1992, atribuido mal a Hebb', 'El postulado de Hebb, citado entero', 'El resultado de Bi y Poo', 'La cláusula de especificidad'] },
  { trans: '«A participa de forma repetida en hacer disparar a B»', func: 'El postulado de Hebb, citado entero', opts: ['El postulado de Hebb, citado entero', 'El eslogan de 1992', 'Una conclusión de Markram', 'La práctica deliberada'] },
  { trans: '«Si A llega después, la conexión se debilita»', func: 'El resultado del orden de disparo', opts: ['El resultado del orden de disparo', 'El postulado de 1949', 'El eslogan de 1992', 'Las ratas de 1947'] },
  { trans: '«Con este audio de fondo ya vas aprendiendo»', func: 'Exposición pasiva vendida como práctica', opts: ['Exposición pasiva vendida como práctica', 'Práctica activa bien diseñada', 'Una cita correcta de Hebb', 'Una medición de laboratorio'] },
  { trans: '«Intentalo primero y comprobá enseguida»', func: 'La traducción práctica del postulado', opts: ['La traducción práctica del postulado', 'El eslogan de 1992', 'Una promesa de la industria', 'La asamblea de células'] },
]);

/* ---------- diagnóstico ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Angelly oye el audio de inglés mientras ordena su cuarto y no aprende nada', characteristic: 'Es coincidencia, no participación: nada de lo que ella hace ayuda a encender lo que oye', opts: ['Es coincidencia, no participación: nada de lo que ella hace ayuda a encender lo que oye', 'El audio está mal grabado', 'Le faltan horas de exposición', 'No tiene oído para los idiomas'] },
  { disease: 'La maestra devuelve las tareas corregidas ocho días después y el error se repite', characteristic: 'La corrección llega fuera de tiempo: no se engancha con el intento que quería arreglar', opts: ['La corrección llega fuera de tiempo: no se engancha con el intento que quería arreglar', 'Los alumnos no leen la corrección', 'Hay que corregir con más severidad', 'La tarea estaba mal puesta'] },
  { disease: 'Jael canta la tabla del siete entera pero tarda en decir siete por ocho suelto', characteristic: 'Se practicó la cadena en un solo orden: cada eslabón dispara al siguiente y a ningún otro', opts: ['Se practicó la cadena en un solo orden: cada eslabón dispara al siguiente y a ningún otro', 'No repitió suficientes veces', 'Las tablas no sirven para nada', 'Le falta memoria'] },
  { disease: 'El papá escribe hace veinte años con dos dedos y no ha mejorado', characteristic: 'Hubo repetición de sobra y ninguna corrección: se reforzó exactamente el método viejo', opts: ['Hubo repetición de sobra y ninguna corrección: se reforzó exactamente el método viejo', 'Ya es tarde para cambiar a su edad', 'El teclado es el problema', 'Escribe demasiado rápido'] },
  { disease: 'Wílmer mira quince años a su abuelo en el torno y no sabe centrar el barro', characteristic: 'Practicó mirar, así que se volvió excelente en reconocer: el cambio es específico de lo practicado', opts: ['Practicó mirar, así que se volvió excelente en reconocer: el cambio es específico de lo practicado', 'No prestaba atención', 'El abuelo enseñaba mal', 'No tiene manos de alfarero'] },
  { disease: 'Una aplicación promete recablear el cerebro citando «lo que dispara junto se cablea junto» y firmando Hebb', characteristic: 'La cita está mal atribuida y además promete lo que la especificidad niega', opts: ['La cita está mal atribuida y además promete lo que la especificidad niega', 'El precio es demasiado alto', 'Le falta versión para tableta', 'Hebb nunca escribió sobre el cerebro'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Exige que A participe en hacer disparar a B.', type: 'El postulado de Hebb (1949)' },
  { s: 'Dice que basta con dispararse a la vez.', type: 'El eslogan de 1992' },
  { s: 'Decide el signo del cambio según quién dispara primero.', type: 'El orden de disparo' },
  { s: 'Las decenas de milisegundos en que el cambio ocurre.', type: 'La ventana temporal' },
  { s: 'Un grupo de células que se enciende en conjunto.', type: 'La asamblea de células' },
  { s: 'Producir la respuesta y comprobarla enseguida.', type: 'La práctica activa' },
  { s: 'Tener el video puesto mientras se hace otra cosa.', type: 'La exposición pasiva' },
  { s: 'Se gana lo practicado y nada más.', type: 'La cláusula de especificidad' },
  { s: 'Fortalecer una conexión.', type: 'Potenciación' },
  { s: 'Debilitar una conexión al invertir el orden.', type: 'Depresión' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'A participa en disparar a B', gen: 'Postulado', n: 'Exige causa y dirección', g: '1949', t: 'Hebb' },
  { w: 'Lo que dispara junto se cablea junto', gen: 'Eslogan', n: 'Solo exige coincidencia', g: '1992', t: 'Löwel y Singer' },
  { w: 'A antes que B', gen: 'Orden', n: 'La conexión se refuerza', g: 'Dentro de la ventana', t: 'Potenciación' },
  { w: 'A después que B', gen: 'Orden', n: 'La conexión se debilita', g: 'Dentro de la ventana', t: 'Depresión' },
  { w: 'Decirlo sin mirar y comprobar', gen: 'Práctica', n: 'Produce y corrige', g: 'Activa', t: 'Cablea lo que se busca' },
  { w: 'Audio de fondo en el bus', gen: 'Práctica', n: 'No produce nada', g: 'Pasiva', t: 'Solo coincidencia' },
  { w: 'La corrección en el mismo minuto', gen: 'Corrección', n: 'Se engancha con el intento', g: 'A tiempo', t: 'Refuerza' },
  { w: 'La corrección ocho días después', gen: 'Corrección', n: 'Llega sola, sin enganche', g: 'Tarde', t: 'No refuerza' },
  { w: 'Las ratas sueltas por la casa', gen: 'Evidencia', n: 'Resolvieron mejor', g: '1947', t: 'Hebb' },
  { w: 'La ventana de milisegundos', gen: 'Evidencia', n: 'Medida en cultivo', g: '1998', t: 'Bi y Poo' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Hebb publicó su postulado en ___.', opts: ['1949', '1992', '1998'], ans: '1949' },
  { s: 'El postulado exige que A ___ en hacer disparar a B.', opts: ['participe', 'coincida', 'espere'], ans: 'participe' },
  { s: 'El eslogan es de Löwel y ___.', opts: ['Singer', 'Poo', 'Hebb'], ans: 'Singer' },
  { s: 'Si A dispara después que B, la conexión se ___.', opts: ['debilita', 'refuerza', 'rompe'], ans: 'debilita' },
  { s: 'La ventana de Bi y Poo se cuenta en ___.', opts: ['milisegundos', 'minutos', 'días'], ans: 'milisegundos' },
  { s: 'La regla refuerza el acierto y también el ___.', opts: ['error', 'premio', 'descanso'], ans: 'error' },
  { s: 'Mirar mucho cablea la destreza de ___.', opts: ['reconocer', 'fabricar', 'vender'], ans: 'reconocer' },
  { s: 'Se gana lo ___ y nada más.', opts: ['practicado', 'leído', 'pagado'], ans: 'practicado' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Escribe el postulado de Hebb con tus palabras y señala las cuatro piezas que lo componen.', ans: 'Cuando el axón de una célula A está lo bastante cerca de una célula B para excitarla y participa de forma repetida o persistente en hacerla disparar, ocurre un cambio de crecimiento o metabólico en una de las dos células, o en las dos, que aumenta la eficacia de A para disparar a B. Las cuatro piezas son: cercanía (A puede excitar a B), participación (A toma parte en encenderla, que es lo que introduce la causa), repetición (de forma repetida o persistente) y dirección (crece la eficacia de A hacia B, no al revés). Quitar cualquiera de las cuatro cambia el significado; quitar la participación es lo que produce el eslogan.' },
  { q: '¿Por qué «lo que dispara junto se cablea junto» no es una versión corta del postulado, sino otra afirmación?', ans: 'Porque «junto» significa simultaneidad y el postulado pide participación. Que dos células estén activas a la vez no dice nada: en un cerebro despierto hay millones activas en cualquier instante. El postulado exige que una contribuya a encender a la otra, y eso trae dos cosas que la simultaneidad no trae: una causa y un orden temporal, porque para ayudar a encender algo hay que llegar antes. Además, la frase no es de Hebb: la formulación es de Löwel y Singer, en Science, en 1992, y la rima famosa es de Carla Shatz, del mismo año. En la práctica, quien cree el eslogan pone las cosas juntas y espera; quien entiende el postulado hace producir y corrige.' },
  { q: '¿Qué añadieron Markram (1997) y Bi y Poo (1998) al postulado, y qué limitación hay que declarar al citarlos?', ans: 'Añadieron el reloj. Midieron que el signo del cambio depende del orden de los disparos: si A dispara unas decenas de milisegundos antes que B la conexión se refuerza, y si dispara después se debilita. Es la plasticidad dependiente del orden de disparo, y confirma la dirección que el postulado ya pedía. La limitación que hay que declarar es dónde se midió: en rodajas de tejido y en neuronas en cultivo, que es donde se puede medir bien. Su peso exacto en un animal despierto aprendiendo tareas de la vida real sigue siendo materia de discusión, y decirlo forma parte de citar honestamente.' },
  { q: 'Explica por qué veinte años de escribir con dos dedos no mejoran la mecanografía.', ans: 'Porque la regla refuerza lo que se repite y no distingue entre acierto y error. Veinte años son repetición de sobra, así que el postulado se cumplió al pie de la letra: lo que quedó firmemente cableado fue el método viejo, con su error incluido. Lo que nunca hubo fue un intento distinto con su corrección detrás, que es lo único capaz de encadenar una manera nueva. De ahí sale la consecuencia incómoda: practicar sin corrección es la forma más segura de volverse muy bueno en algo que se hace mal, y mejorar obliga a ir más lento que la costumbre para que quepa la corrección.' },
  { q: '¿Qué se le cableó a Wílmer en quince años de mirar el torno de su abuelo, y por qué no le sirvió al sentarse?', ans: 'Se le cableó mirar, y muy bien. Después de quince años era excelente reconociendo una olla bien centrada, distinguiendo el barro demasiado húmedo y viendo venir un error antes de que ocurriera. Eso es exactamente lo que practicó. Lo que no practicó ni una vez fue mover las manos sobre el barro, así que esa destreza no se cableó, porque nada de lo que él hacía participaba en el resultado. Es la cláusula de especificidad: el cambio es específico de lo practicado. Mirar cablea mirar; hacer cablea hacer.' },
  { q: 'Una aplicación cobra L 250 al mes citando el eslogan y firmando a Hebb. Escribe las dos preguntas que la descartan.', ans: 'La primera pregunta es de fuente: ¿la frase que citan es de quien dicen? No lo es. El eslogan es de Löwel y Singer (1992) con la rima de Carla Shatz, y lo que Hebb escribió en 1949 no promete nada parecido. Una cita mal atribuida en la publicidad es un dato comprobable sobre el vendedor, no sobre el cerebro. La segunda pregunta es de especificidad: ¿el juego mejora la vida o mejora el juego? El cambio es específico de lo practicado, así que quien practica un juego se vuelve bueno en ese juego. La condición con que sí se pagaría ese dinero es practicar la tarea real que se quiere mejorar, porque ahí lo específico juega a favor.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['HEBB', 'ORDEN', 'DISPARO', 'SINAPSIS', 'REFUERZO', 'AXON']),
  haceSopa(10, ['ESLOGAN', 'CAUSA', 'VENTANA', 'ASAMBLEA', 'BARRO', 'SINGER']),
  haceSopa(10, ['PRACTICA', 'CORREGIR', 'REPETIR', 'INTENTO', 'PASIVA', 'ACTIVA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'Hebb publicó su postulado neurofisiológico en 1949.', a: true },
  { q: 'El postulado dice que basta con que dos células estén activas a la vez.', a: false },
  { q: 'El postulado exige que A participe en hacer disparar a B.', a: true },
  { q: 'La frase «lo que dispara junto se cablea junto» la escribió Hebb.', a: false },
  { q: 'La formulación del eslogan es de Löwel y Singer, en Science, en 1992.', a: true },
  { q: 'Carla Shatz puso en circulación la versión rimada del eslogan.', a: true },
  { q: 'Si A dispara después que B, la conexión se refuerza igual.', a: false },
  { q: 'Bi y Poo midieron la ventana temporal en neuronas de hipocampo en cultivo.', a: true },
  { q: 'Markram y sus colegas publicaron su trabajo sobre la coincidencia con orden en 1997.', a: true },
  { q: 'La regla de Hebb refuerza solo lo que se hace bien.', a: false },
  { q: 'Debilitar una conexión es una avería del sistema, no aprendizaje.', a: false },
  { q: 'Hebb llamó postulado a su enunciado porque era una conjetura por comprobar.', a: true },
  { q: 'La exposición pasiva cumple el eslogan pero no cumple el postulado.', a: true },
  { q: 'Mirar a alguien practicar durante años cablea la destreza de hacerlo.', a: false },
  { q: 'En 1947 Hebb informó que unas ratas criadas sueltas en su casa resolvían mejor los problemas.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿En qué año y en qué libro aparece el postulado de Hebb?', o: ['a) 1992, en un artículo de Science', 'b) 1949, en «The Organization of Behavior»', 'c) 1998, en el Journal of Neuroscience', 'd) 1947, en un artículo sobre ratas'], a: 1 },
  { q: 'El verbo que el eslogan borra del postulado es…', o: ['a) Participar', 'b) Repetir', 'c) Excitar', 'd) Crecer'], a: 0 },
  { q: '¿Quiénes formularon «lo que dispara junto se cablea junto»?', o: ['a) Markram y Sakmann', 'b) Bi y Poo', 'c) Löwel y Singer', 'd) Hebb y Lashley'], a: 2 },
  { q: '¿Quién popularizó la versión rimada del eslogan, en 1992?', o: ['a) Donald Hebb', 'b) Wilder Penfield', 'c) Karl Lashley', 'd) Carla Shatz'], a: 3 },
  { q: 'Si A dispara unas decenas de milisegundos antes que B, la conexión…', o: ['a) Se refuerza', 'b) Se debilita', 'c) No cambia', 'd) Se rompe'], a: 0 },
  { q: 'El nombre técnico de lo que midieron Markram, y Bi y Poo, es…', o: ['a) Periodo crítico', 'b) Plasticidad dependiente del orden de disparo', 'c) Práctica deliberada', 'd) Memoria de trabajo'], a: 1 },
  { q: '¿Por qué Hebb llamó «postulado» a su enunciado?', o: ['a) Porque era una ley probada', 'b) Por modestia social', 'c) Porque era una conjetura que otros tendrían que comprobar', 'd) Porque lo copió de Cajal'], a: 2 },
  { q: 'La limitación que hay que declarar al citar a Bi y Poo es que…', o: ['a) No publicaron su trabajo', 'b) Midieron con muy pocas repeticiones', 'c) El resultado se conoció mucho después', 'd) Se midió en cultivo, no en animal despierto'], a: 3 },
  { q: 'Poner un audio de idioma de fondo mientras se hace otra cosa es…', o: ['a) Coincidencia sin participación', 'b) Práctica deliberada', 'c) Corrección inmediata', 'd) Repetición con dirección'], a: 0 },
  { q: 'Practicar mucho sin corrección produce sobre todo…', o: ['a) Un aprendizaje lento pero correcto', 'b) Un error firmemente cableado', 'c) Ningún cambio', 'd) Mejora automática'], a: 1 },
  { q: 'La cláusula de especificidad dice que…', o: ['a) Todo entrenamiento mejora todo', 'b) El cerebro no cambia en adultos', 'c) Se gana lo practicado y nada más', 'd) La repetición basta por sí sola'], a: 2 },
  { q: 'La otra idea grande del libro de 1949, además del postulado, es…', o: ['a) El periodo crítico', 'b) La memoria episódica', 'c) La práctica deliberada', 'd) La asamblea de células y la secuencia de fases'], a: 3 },
  { q: 'Lo que mostraron las ratas que Hebb llevó a su casa en 1947 es que…', o: ['a) Producir el movimiento importa más que ver pasar el mundo', 'b) Las jaulas grandes bastan', 'c) Las ratas no aprenden fuera del laboratorio', 'd) El tamaño del cerebro no cambia'], a: 0 },
  { q: 'La corrección de una tarea vale sobre todo por…', o: ['a) Su severidad', 'b) Su cercanía en el tiempo al intento', 'c) La nota que trae', 'd) La cantidad de comentarios'], a: 1 },
  { q: 'Quien mira a otro practicar durante quince años se vuelve experto en…', o: ['a) Hacerlo', 'b) Enseñarlo', 'c) Reconocerlo', 'd) Nada en absoluto'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'El postulado de Hebb se publicó en el año ___.', a: '1949' },
  { q: 'El postulado exige que A ___ en hacer disparar a B.', a: 'participe' },
  { q: 'El eslogan lo formularon Löwel y ___, en Science.', a: 'Singer' },
  { q: 'La rima del eslogan la popularizó Carla ___.', a: 'Shatz' },
  { q: 'Si A dispara antes que B, la conexión se ___.', a: 'refuerza' },
  { q: 'Si A dispara después que B, la conexión se ___.', a: 'debilita' },
  { q: 'La ventana medida por Bi y Poo se cuenta en ___.', a: 'milisegundos' },
  { q: 'Hebb llamó a su enunciado un ___, no una ley.', a: 'postulado' },
  { q: 'Al grupo de células que se enciende en conjunto Hebb lo llamó ___ de células.', a: 'asamblea' },
  { q: 'Fortalecer una conexión se llama ___.', a: 'potenciación' },
  { q: 'Debilitar una conexión se llama ___.', a: 'depresión' },
  { q: 'Se gana lo ___ y nada más.', a: 'practicado' },
  { q: 'El material que solo pasa por delante es exposición ___.', a: 'pasiva' },
  { q: 'La práctica que produce y recibe corrección es práctica ___.', a: 'activa' },
  { q: 'Las ratas sueltas por la casa de Hebb salieron en el informe de ___.', a: '1947' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Postulado de Hebb', def: 'Si A participa en hacer disparar a B, crece la eficacia de A hacia B' },
  { term: 'El eslogan', def: 'Lo que dispara junto se cablea junto, de Löwel y Singer (1992)' },
  { term: 'Carla Shatz', def: 'Puso en circulación la versión rimada del eslogan, en 1992' },
  { term: 'Orden de disparo', def: 'Antes refuerza, después debilita: el signo depende de quién llega primero' },
  { term: 'Potenciación', def: 'El fortalecimiento de una conexión' },
  { term: 'Depresión', def: 'El debilitamiento de una conexión, que también es aprendizaje' },
  { term: 'Bi y Poo (1998)', def: 'Midieron la ventana de milisegundos en hipocampo cultivado' },
  { term: 'Markram (1997)', def: 'Publicó en Science la regulación por coincidencia con orden' },
  { term: 'Asamblea de células', def: 'Grupo que se enciende en conjunto y funciona como una unidad' },
  { term: 'Secuencia de fases', def: 'El encadenado de asambleas con que Hebb explicaba un pensamiento' },
  { term: 'Práctica activa', def: 'Producir la respuesta y recibir la corrección enseguida' },
  { term: 'Exposición pasiva', def: 'El material pasa por delante sin que se produzca nada' },
  { term: 'Especificidad', def: 'Se gana lo practicado y nada más' },
  { term: 'Las ratas de 1947', def: 'Las que anduvieron sueltas resolvían mejor que las de la jaula' },
  { term: 'Postulado', def: 'La palabra con que Hebb declaró que era conjetura y no ley' },
]);

/* ---------- prueba competencial: la práctica sobre la mesa ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'Angelly pone videos de inglés mientras ordena su cuarto, dos horas al día durante un mes. Al mes siguiente sigue sin poder pedir un vaso de agua en inglés y concluye que no tiene oído.' },
  { txt: 'Una aplicación de entrenamiento cerebral ofrece suscripción familiar por L 250 al mes y anuncia, en letras grandes, «lo que dispara junto se cablea junto», atribuido a Donald Hebb.' },
  { txt: 'Una maestra que usa M.E.T.A.S recoge las tareas el viernes y las devuelve corregidas el lunes siguiente. Los alumnos miran la nota, guardan la hoja y repiten el mismo error a la semana.' },
  { txt: 'Jael se sabe la tabla del siete de corrido y no falla ninguna, pero tarda cinco segundos cuando le preguntan siete por ocho suelto, porque tiene que cantar desde el principio.' },
  { txt: 'El autor lleva más de veinte años escribiendo a computadora con dos dedos y mirando el teclado, muchas horas al día, y no ha mejorado nada en la última década.' },
  { txt: 'Alguien propone poner «lo que dispara junto se cablea junto» como lema en la portada de las guías de maestro de M.E.T.A.S, porque es corto y suena a ciencia.' },
  { txt: 'En M.E.T.A.S se discute si el cuestionario de cada misión debe ir todo al final, como examen, o repartido: unas preguntas al abrir y otras después de cada bloque.' },
  { txt: 'Una academia ofrece inglés para las dos niñas por L 1,200 al mes. La familia decide ir a mirar una clase antes de decidir, en vez de preguntar por el método.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué produce quien practica en este caso, y qué solo recibe sin producir nada?',
  '2. ¿Quién corrige, y cuánto tarda la corrección en llegar desde el intento?',
  '3. ¿En qué orden quedan el intento y su consecuencia, y qué dice el postulado sobre ese orden?',
  '4. ¿Qué quedará cableado si esto se repite un mes, y qué UNA cosa se cambia para que la regla juegue a favor?',
]);

B.critCaseGuides = JSON.stringify([
  'Se empieza separando producción de recepción, que es la separación que el eslogan no permite hacer. Producir es decir, escribir, tocar, resolver o intentar algo por cuenta propia; recibir es tener el material delante mientras avanza solo. La pregunta útil no es cuántas horas hubo, sino cuántas veces salió algo de las manos o de la boca de quien practica. Un caso con muchas horas y cero producción es coincidencia pura, y el postulado no premia la coincidencia: premia que algo de lo que uno hace participe en el resultado.',
  'Después se busca la corrección y se le mide el retraso. Corrección es cualquier cosa que diga si el intento salió bien: una persona, una respuesta tapada, una grabación que se vuelve a oír, el resultado visible de la acción. Lo que importa no es su severidad ni su extensión, sino cuánto tarda en llegar desde el intento, porque una corrección que llega días después llega sola y no se engancha con nada: quien la recibe ya no tiene delante lo que hizo ni por qué lo hizo.',
  'Luego se pone en fila el intento y su consecuencia. El postulado tiene dirección, de A hacia B, y la fisiología le añadió el reloj: Markram (1997) y Bi y Poo (1998) mostraron que unas decenas de milisegundos deciden si la conexión se refuerza o se debilita, según quién dispara primero. Traducido a la práctica: intentar y después comprobar no es lo mismo que comprobar y después copiar, aunque las dos cosas ocurran en la misma tarde con el mismo material. Ver la respuesta antes de intentar deja al alumno reconociendo, no produciendo.',
  'Y todo caso termina igual: se dice qué quedará cableado si la escena se repite un mes, recordando que la regla no distingue acierto de error y que se gana lo practicado y nada más. Después se cambia UNA sola cosa, la más barata, casi siempre la misma: convertir un rato de recepción en un rato de producción con comprobación inmediata. No hace falta corregir más; hace falta corregir antes. Y se vuelve a mirar a la semana, porque una decisión sin segunda medición es una opinión con fecha.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Llevo sesenta horas de video en inglés, así que algo se me habrá quedado".', g1: 'Sesenta horas de coincidencia: el sonido y la tarea doméstica ocurrieron a la vez, y ninguna participó en encender a la otra. Es exactamente el «junto» del eslogan, y el postulado pide participación.', g2: 'Se cambian veinte minutos de video por veinte minutos de producir: repetir en voz alta, contestar, escribir, y comprobar enseguida. Diez minutos así valen más que dos horas de fondo.' },
  { txt: '"Como dijo Hebb, lo que dispara junto se cablea junto".', g1: 'Hebb no dijo eso. La formulación es de Löwel y Singer, en Science, en 1992, y la rima famosa es de Carla Shatz, del mismo año. Lo que Hebb escribió en 1949 pide que A participe en hacer disparar a B.', g2: 'Se cita la frase real con su fuente y se explica qué cambia el lunes: con el eslogan uno pone las cosas juntas y espera; con el postulado uno hace producir y corrige enseguida.' },
  { txt: '"Repitió el ejercicio cien veces, ya le tiene que salir".', g1: 'Cien veces qué. La repetición no es un mérito sino un multiplicador, y multiplica lo que encuentra: si encuentra el error, lo multiplica con la misma diligencia con que multiplicaría el acierto.', g2: 'Se baja la velocidad hasta que quepa la corrección y se nombra el fallo en voz alta antes del intento siguiente. Doce intentos mirados enseñan más que cien a ciegas.' },
  { txt: '"Devuelvo las tareas corregidas la semana siguiente, así las reviso con calma".', g1: 'La corrección vale por su cercanía en el tiempo, no por su calidad de redacción. A los ocho días el alumno ya no tiene delante lo que hizo, así que la corrección llega sola y no se encadena con ningún intento.', g2: 'Cinco preguntas comprobadas en el momento enseñan más que veinte devueltas el lunes. Por eso el cuestionario va dentro de la misión y no al final del trimestre.' },
  { txt: '"Este juego entrena el cerebro, así que va a mejorar en todo".', g1: 'La cláusula de especificidad lo niega: se gana lo practicado y nada más. Quien practica un juego se vuelve bueno en ese juego, igual que quien mira quince años se vuelve bueno en reconocer.', g2: 'Ese mismo dinero y esas mismas horas se ponen en la tarea real que se quiere mejorar, porque ahí la especificidad juega a favor en vez de en contra.' },
  { txt: '"Ya vi el tutorial dos veces, mañana lo hago".', g1: 'Ver el modelo antes de intentar deja al que aprende reconociendo el procedimiento, no produciéndolo, y el orden importa: primero las manos, después el modelo.', g2: 'Se intenta primero con lo que se tenga, se falla, y solo entonces se mira el tutorial, que ahora corrige algo concreto en vez de acompañar a nadie.' },
]);

B.critDecisionBank = JSON.stringify([
  'Angelly quiere seguir con sus dos horas de video en inglés: ¿se le prohíbe, se le deja, o se le cambia algo? ¿Qué exactamente, y cuánto tiempo dura el cambio?',
  'La aplicación de L 250 al mes espera respuesta esta semana: ¿qué dos preguntas se le hacen, y qué respuesta la descarta?',
  'La maestra pregunta cómo corregir mejor: ¿se le pide más detalle en las correcciones o algo distinto? ¿Qué, y por qué?',
  'Jael tarda en siete por ocho: ¿se le manda cantar la tabla más veces o se cambia el ejercicio? ¿A cuál, y qué se mide para saber si funcionó?',
  'El papá quiere aprender a escribir con diez dedos sin dejar de trabajar: ¿qué se hace con los veinte años de costumbre, y por qué al principio va a escribir más lento?',
  'Alguien insiste con el eslogan para la portada de las guías de maestro: ¿se acepta, se rechaza, o se acepta con condición? ¿Cuál sería esa condición?',
  'Hay que decidir dónde va el cuestionario de las misiones de M.E.T.A.S: ¿todo al final o repartido? ¿Con qué límite, y por qué ese límite?',
  'La familia sale de mirar la clase de inglés de L 1,200: ¿qué dos números se apuntaron durante la visita, y qué se decide con ellos?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Contestar y comprobar en el mismo minuto.', b: 'Contestar y recibir la corrección el lunes siguiente.', ga: 'Caso A: el intento y su consecuencia quedan encadenados, que es el orden que la regla premia, y el alumno todavía sabe por qué contestó eso.', gb: 'Caso B: la corrección llega sola, sin nada a lo que engancharse, y el error ha tenido ocho días para hacerse camino.' },
  { a: 'Intentar el pasaje y después oír la grabación.', b: 'Oír la grabación veinte veces y después intentar el pasaje.', ga: 'Caso A: la grabación corrige un intento concreto, así que hay algo que participa en encender algo. Primero las manos, después el modelo.', gb: 'Caso B: se practica escuchar, que es una destreza real y no es la que se examina. Se llega al instrumento con el oído lleno y las manos vacías.' },
  { a: 'Preguntar los pares de la tabla sueltos y al azar.', b: 'Cantar la tabla entera de corrido, veinte veces.', ga: 'Caso A: se practica lo que después se va a pedir, así que cada par queda accesible por su propia puerta.', gb: 'Caso B: se refuerza una cadena en un solo orden, y para llegar a un eslabón hay que arrancar desde el primero.' },
  { a: 'Veinte minutos produciendo y comprobando.', b: 'Dos horas con el material puesto de fondo.', ga: 'Caso A: pocos minutos, pero cada intento cumple las cuatro piezas del postulado: cercanía, participación, repetición y dirección.', gb: 'Caso B: muchas horas de coincidencia perfecta y causalidad cero. Cumple el eslogan y no cumple el postulado.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se estudia con el material puesto de fondo y sin producir nada.', guide: 'Se acumulan horas de coincidencia, la sensación de haber avanzado sube, y al llegar el momento de producir no hay nada cableado: la conclusión falsa que queda apuntada es que uno no sirve para eso.' },
  { cause: 'La corrección llega días después del intento.', guide: 'El error se repite intacto durante esos días, se hace camino, y cuando la corrección llega ya no corrige un intento sino una costumbre, que es una obra mucho más cara.' },
  { cause: 'Se repite mucho y nadie nombra el fallo.', guide: 'La regla multiplica lo que encuentra, así que se cablea el error con el mismo cuidado que el acierto, y quien practica se vuelve rápido y seguro haciéndolo mal.' },
  { cause: 'Se cita el eslogan de 1992 como si fuera el postulado de 1949.', guide: 'El maestro que lo cree pone dos cosas juntas y espera, en vez de hacer producir y corregir, y una atribución falsa en la portada le quita autoridad a todo lo demás que diga esa guía.' },
  { cause: 'Se compra entrenamiento genérico en vez de practicar la tarea real.', guide: 'Se mejora en el juego comprado y en nada más, porque el cambio es específico, y encima el dinero y las horas gastadas dejan de estar disponibles para lo que sí transfería.' },
  { cause: 'Se ve el modelo antes de intentar.', guide: 'Se practica reconocer el procedimiento, la sensación de dominio sube muchísimo, y el día que hay que producirlo aparece el hueco entero, que es el orden más caro posible para descubrirlo.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Angelly empezó a pedir cosas en inglés sin pensarlo.', guide: 'Se cambiaron veinte minutos de video de fondo por veinte minutos de repetir en voz alta y contestar, con comprobación inmediata. Las horas bajaron y lo cableado subió.' },
  { effect: 'En esa aula el mismo error dejó de repetirse cada semana.', guide: 'La maestra cambió corregir mucho por corregir pronto: cinco preguntas comprobadas en el momento, dentro de la clase, en vez de veinte devueltas el lunes.' },
  { effect: 'Jael contesta siete por ocho sin cantar la tabla.', guide: 'Se practicaron los pares sueltos y al azar, que es como llegan en la vida, con la respuesta comprobada enseguida. Se practicó lo que se iba a pedir.' },
  { effect: 'El papá escribe con diez dedos y ya no mira el teclado.', guide: 'Aceptó escribir más lento durante tres semanas, que es lo que cuesta que quepa la corrección, y practicó con un programa que le decía el fallo en la misma tecla.' },
  { effect: 'La guía de maestro de M.E.T.A.S cita bien la regla.', guide: 'Se puso el postulado con su fuente y su año, y el eslogan quedó dentro, como ejemplo de cita mal atribuida, que es el uso honesto que le quedaba.' },
  { effect: 'La familia decidió lo de la academia sin pelearse.', guide: 'Fueron a mirar una clase y apuntaron dos números: minutos que habla cada alumno y veces que lo corrigen por hora. Con esos dos datos la discusión se acabó sola.' },
]);

/* ---------- línea de tiempo: los siete momentos ---------- */
B.timelineData = JSON.stringify([
  { y: '1', icon: '🎯', label: 'La tarea', text: 'Se elige <strong>qué se va a producir</strong>, no qué se va a mirar. Tiene que parecerse a lo que después se va a pedir. <strong>Se cae:</strong> eligiendo material («voy a ver este curso») en vez de conducta («voy a decir diez frases»).' },
  { y: '2', icon: '🐢', label: 'La velocidad', text: 'Se baja hasta que <strong>quepa la corrección</strong>. Un error alcanzado en el primer intento vuelve al corral; alcanzado a la décima ya es costumbre. <strong>Se cae:</strong> con la prisa, que es la enemiga natural de esta regla.' },
  { y: '3', icon: '✍️', label: 'El intento', text: 'Se <strong>produce sin mirar el modelo</strong>: se dice, se escribe, se toca, se resuelve. Aquí es donde A empieza a participar en algo, y sin este momento no hay nada que la regla pueda premiar.' },
  { y: '4', icon: '🔎', label: 'La comprobación', text: 'Enseguida, en el <strong>mismo minuto</strong>: la respuesta tapada, la grabación, el resultado visible, la persona que mira. <strong>Se cae:</strong> dejándola para el final de la sesión, que ya es tarde, o para el lunes, que es tardísimo.' },
  { y: '5', icon: '🗣️', label: 'El nombre del fallo', text: 'Se dice <strong>en voz alta qué salió mal</strong> antes del intento siguiente. Nombrarlo es lo que impide que el intento que viene nazca de la gana de acabar en vez de nacer de lo que vio el ojo.' },
  { y: '6', icon: '🔁', label: 'La repetición dirigida', text: 'Ahora sí se repite, pero <strong>con la corrección puesta</strong>. La repetición no es un mérito: es un multiplicador, y solo conviene multiplicar después de haber arreglado lo que se va a multiplicar.' },
  { y: '7', icon: '📊', label: 'El recuento', text: 'Se apunta <strong>cuántos intentos y cuántas correcciones</strong> hubo, no cuántos minutos. <strong>La meta:</strong> que el número de intentos suba y la sesión siga cabiendo en la tarde. Es el registro que esta ruta va llenando.' },
]);

/* ---------- laboratorio de conceptos ---------- */
B.parteData = JSON.stringify({
  postulado: {
    nombre: 'El postulado de 1949', icon: '📕',
    estructura: { title: 'Qué es', info: '• El enunciado de <strong>Donald Hebb</strong>, capítulo 4 de «The Organization of Behavior»<br>• Si A <strong>participa repetidamente en hacer disparar</strong> a B, crece la eficacia de A hacia B<br>• Cuatro piezas: cercanía, participación, repetición y dirección' },
    funcion: { title: 'Cómo se reconoce', info: '• Trae un <strong>verbo de causa</strong>: participar, tomar parte, contribuir<br>• Trae una <strong>dirección</strong>: de A hacia B, no al revés<br>• Y se declara <strong>postulado</strong>, no ley: era una conjetura por comprobar' },
    enfermedades: { title: 'Dónde se cae', info: '• Citándolo por el eslogan, que le quita la participación<br>• Presentándolo como <strong>hecho demostrado en 1949</strong>, que no lo era<br>• Olvidando que la idea general venía de antes (Tanzi, Ramón y Cajal)' },
    cuidados: { title: 'En esta casa', info: '• Se cita <strong>entero y con su año</strong>, o no se cita<br>• Se dice que era conjetura, y qué vino después a medirlo<br>• Y se traduce a conducta: <strong>producir, fallar, corregir enseguida</strong>' },
  },
  orden: {
    nombre: 'El orden de disparo', icon: '⏱️',
    estructura: { title: 'Qué es', info: '• La <strong>plasticidad dependiente del orden de disparo</strong><br>• A antes que B: la conexión <strong>se refuerza</strong><br>• A después que B: la misma conexión <strong>se debilita</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se mide en <strong>decenas de milisegundos</strong>: Bi y Poo (1998)<br>• Markram y colegas lo publicaron en <strong>Science, 1997</strong><br>• Mismo par de células, mismo número de repeticiones, resultado contrario' },
    enfermedades: { title: 'Dónde se cae', info: '• Creyendo que invertir el orden deja las cosas <strong>igual</strong><br>• Citándolo como probado en la vida diaria: se midió en <strong>tejido y cultivo</strong><br>• Confundiendo la ventana con el periodo crítico, que es otra cosa (etapa 3)' },
    cuidados: { title: 'En esta casa', info: '• Primero el intento, <strong>después</strong> la comprobación<br>• La corrección vale por su <strong>cercanía</strong>, no por su severidad<br>• Y ver el modelo antes de intentar se considera invertir el orden' },
  },
  eslogan: {
    nombre: 'El eslogan de 1992', icon: '📣',
    estructura: { title: 'Qué es', info: '• «Lo que dispara junto se cablea junto»<br>• Formulación de <strong>Löwel y Singer</strong>, en Science, en 1992<br>• La rima que corrió el mundo es de <strong>Carla Shatz</strong>, ese mismo año' },
    funcion: { title: 'Cómo se reconoce', info: '• Aparece <strong>firmado por Hebb</strong> en anuncios y en cursos<br>• No nombra ninguna dirección ni ningún orden<br>• Su virtud es que se pega; su defecto es <strong>lo que borra al pegarse</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Dando por bueno que basta con <strong>poner las cosas juntas</strong><br>• Vendiendo exposición pasiva como si fuera práctica<br>• Repitiendo la atribución falsa hasta en guías de maestro' },
    cuidados: { title: 'En esta casa', info: '• Se usa <strong>solo como ejemplo de cita mal atribuida</strong><br>• Y al lado va siempre el postulado entero, con su año<br>• Los dos estudios que lo originan se citan con su etiqueta' },
  },
  practica: {
    nombre: 'La práctica activa', icon: '🎯',
    estructura: { title: 'Qué es', info: '• <strong>Producir</strong> la respuesta, ver el resultado y <strong>corregir enseguida</strong><br>• Es la traducción a conducta de las cuatro piezas del postulado<br>• Ericsson y colegas (1993) la llamaron práctica deliberada' },
    funcion: { title: 'Cómo se reconoce', info: '• Se cuenta en <strong>intentos y correcciones</strong>, no en minutos<br>• Algo sale de las manos o de la boca de quien practica<br>• Y la comprobación llega <strong>en el mismo minuto</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Cambiándola por exposición, que se siente igual de productiva y cuesta menos<br>• Corrigiendo <strong>mucho y tarde</strong> en vez de poco y pronto<br>• Prometiendo con ella lo que la <strong>especificidad</strong> niega (Macnamara y colegas, 2014)' },
    cuidados: { title: 'En esta casa', info: '• Ninguna práctica se da por buena si <strong>no produce y no corrige</strong><br>• Se practica lo que después se va a pedir, y en desorden<br>• Y se apunta el recuento, que es lo que la ruta va llenando' },
  },
});

/* ---------- las seis lecturas: comprensión (30, cinco por voz) ---------- */
B.lectComprensionBank = JSON.stringify([
  { t: 'Borges', q: '¿Qué prohibía don Aciar a sus alumnos?', o: ['a) Estudiar más de una hora seguida', 'b) Repetir un pasaje sin haber nombrado el error en el instante en que ocurría', 'c) Tocar delante de otros alumnos', 'd) Aprender piezas que no fueran de su gusto'], c: 1 },
  { t: 'Borges', q: '¿Para qué usaba don Aciar el metrónomo alemán?', o: ['a) Para medir cuánto duraba la clase', 'b) Para castigar al que iba desacompasado', 'c) Para ir tan despacio que la corrección alcanzara a llegar', 'd) Para que los alumnos tocaran cada vez más rápido'], c: 2 },
  { t: 'Borges', q: 'Cuando un alumno decía que había repetido cien veces, ¿qué contestaba el maestro?', o: ['a) «Cien veces qué», porque la repetición multiplica lo que encuentra', 'b) Que estaba muy bien y que repitiera doscientas', 'c) Que la guitarra no era para él', 'd) Que buscara otro maestro más rápido'], c: 0 },
  { t: 'Borges', q: '¿Qué regla tenía don Aciar sobre escuchar la grabación de la pieza?', o: ['a) Que se oyera veinte veces antes de tocar', 'b) Que no se oyera nunca', 'c) Que se oyera solo en clase', 'd) Que no se oyera antes de intentar el pasaje: primero las manos, después el modelo'], c: 3 },
  { t: 'Borges', q: '¿Qué encontró el narrador, años después, entre dos estantes de una biblioteca?', o: ['a) El libro de Hebb de 1949 con el postulado que explicaba la pedagogía del viejo', 'b) Una partitura anotada por don Aciar', 'c) Un tratado de acústica del siglo XIX', 'd) Las cartas del maestro a sus alumnos'], c: 0 },
  { t: 'Cervantes', q: '¿Qué quería conseguir el mozo que llegó a la fragua?', o: ['a) Comprar un caballo', 'b) Sacar el oficio de herrero en tres días', 'c) Casarse con la hija del ventero', 'd) Aprender a leer y escribir'], c: 1 },
  { t: 'Cervantes', q: '¿Qué le respondió el maestro Cebrián cuando el mozo dijo que llevaba dos años viendo herrar?', o: ['a) Que entonces ya era oficial', 'b) Que dos años eran pocos y que hacían falta diez', 'c) Que él había visto llover cuarenta años y no por eso hacía llover', 'd) Que se fuera a otra fragua'], c: 2 },
  { t: 'Cervantes', q: '¿Cómo quedó el hierro después de los treinta primeros golpes del mozo?', o: ['a) Perfectamente derecho', 'b) Partido en dos', 'c) Igual que al principio', 'd) Torcido como cuerno de cabra'], c: 3 },
  { t: 'Cervantes', q: '¿En qué consistía la doctrina del herrero viejo?', o: ['a) Un golpe y mirar, decir en voz alta lo que salió, y que el golpe siguiente nazca de lo que dijo el ojo', 'b) Dar los golpes lo más fuerte posible', 'c) Contar los golpes hasta cien sin parar', 'd) Copiar exactamente lo que hace el maestro'], c: 0 },
  { t: 'Cervantes', q: '¿Qué hizo escribir Cebrián con carbón en la pared de la fragua, en vez de cobrar?', o: ['a) El precio de las herraduras', 'b) Que allí no se repite lo que no se ha mirado, porque el hierro aprende igual el yerro que el acierto', 'c) Los nombres de sus aprendices', 'd) Una oración a los santos del oficio'], c: 1 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué compró la evolución al alargar tanto la infancia humana?', o: ['a) Un cuerpo más resistente', 'b) Una vida más larga', 'c) Un cerebro que se termina de fabricar por fuera, con lo que le pasa', 'd) Una dentadura más fuerte'], c: 2 },
  { t: 'Harari', q: '¿Cómo se enseñaba la escritura cuneiforme en Mesopotamia, según el ensayo?', o: ['a) Escuchando recitar al escriba mayor', 'b) Memorizando listas de signos sin escribirlos', 'c) Solo a los hijos de los reyes', 'd) Copiando tablillas y recibiendo la corrección en el mismo barro húmedo'], c: 3 },
  { t: 'Harari', q: '¿Qué dice el ensayo sobre la regla de las diez mil horas?', o: ['a) Que viene de un libro de divulgación de 2008 y no de la ciencia, y que Ericsson la desmintió', 'b) Que está confirmada por la neurociencia', 'c) Que la escribió Hebb en 1949', 'd) Que se midió en los taxistas de Londres'], c: 0 },
  { t: 'Harari', q: '¿Qué encontró el equipo de Eleanor Maguire en 2000 con los taxistas de Londres?', o: ['a) Un cerebro más grande en general', 'b) Más grande la parte del hipocampo que maneja mapas, y no un cerebro mejor en todo', 'c) Que conducir encoge el cerebro', 'd) Que no había ninguna diferencia'], c: 1 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué tienen en común un aprendiz de herrero y una red neuronal artificial?', o: ['a) Que los dos aprenden mirando', 'b) Que ninguno de los dos necesita corrección', 'c) Que los dos producen una respuesta, la comparan con lo esperado y ajustan según el error', 'd) Que los dos trabajan con metales'], c: 2 },
  { t: 'Entrevista', q: '¿Qué quería ser Donald Hebb antes de dedicarse a la ciencia?', o: ['a) Médico, como sus padres', 'b) Maestro de escuela toda la vida', 'c) Pescador en Nueva Escocia', 'd) Novelista'], c: 3 },
  { t: 'Entrevista', q: '¿Por qué dice Hebb que usó la palabra «postulado» y no «ley»?', o: ['a) Porque significa que lo da por supuesto para seguir razonando y alguien tendrá que comprobarlo', 'b) Porque se lo pidió su editor', 'c) Porque no le gustaba la palabra ley', 'd) Porque ya había una ley con ese nombre'], c: 0 },
  { t: 'Entrevista', q: '¿En qué palabra del postulado se detiene Soler Serrano, y por qué?', o: ['a) En «axón», porque es la parte física', 'b) En «participa», porque no es lo mismo que coincidir e implica causa y orden', 'c) En «repetida», porque es lo que más se olvida', 'd) En «metabólico», porque es el término técnico'], c: 1 },
  { t: 'Entrevista', q: '¿Qué le preocupa a Hebb del eslogan, más que la autoría?', o: ['a) Que no rime bien en inglés', 'b) Que se cobre dinero por él', 'c) Lo que la frase hace cuando llega: el maestro que solo pone cosas juntas y espera', 'd) Que Löwel y Singer no lo citaran'], c: 2 },
  { t: 'Entrevista', q: 'Sobre las ratas que se llevó a casa en 1947, ¿cuál dice Hebb que fue la diferencia?', o: ['a) Que comieron mejor', 'b) Que eran ratas más jóvenes', 'c) Que hacía más calor en la casa', 'd) No el estímulo, sino quién producía el movimiento'], c: 3 },
  { t: 'Quintero y Gala', q: '¿Qué responde Gala a la pregunta de si es lo que quiso ser o lo que repitió?', o: ['a) Que es lo que repitió, y que lo que quiso ser está en un cajón', 'b) Que es exactamente lo que quiso ser', 'c) Que no lo sabe y prefiere no pensarlo', 'd) Que es lo que otros quisieron que fuera'], c: 0 },
  { t: 'Quintero y Gala', q: '¿Qué ejemplo del teatro usa Gala para explicar la diferencia entre acompañar y aprender?', o: ['a) El estreno de una obra en Madrid', 'b) Los ensayos de «Anillos para una dama», donde la función empieza la noche en que el actor suelta el papel', 'c) Una gira por provincias', 'd) La lectura de un guion en una radio'], c: 1 },
  { t: 'Quintero y Gala', q: '¿Con qué imagen explica Gala la costumbre?', o: ['a) Con un reloj de arena', 'b) Con una vela que se consume', 'c) Con el camino que dibujan los pies en la alameda y al que ya no se le discute', 'd) Con un espejo empañado'], c: 2 },
  { t: 'Quintero y Gala', q: '¿Qué les pide Gala el primer día a los jóvenes de su Fundación de Córdoba?', o: ['a) Que lean a los clásicos durante un año', 'b) Que aprendan de memoria un poema diario', 'c) Que no escriban hasta estar seguros', 'd) Que no le traigan lo que han leído sino lo que han escrito, y pronto, para que sea malo delante de él'], c: 3 },
  { t: 'Quintero y Gala', q: '¿Cuál es la frase con que Gala cierra la conversación?', o: ['a) Que no confundan asistir con hacer, porque uno se vuelve lo que repite y nada más', 'b) Que el talento se lleva en la sangre', 'c) Que hay que escribir todos los días a la misma hora', 'd) Que la juventud se desperdicia en los jóvenes'], c: 0 },
  { t: 'Debate', q: 'Según el careo, ¿cuál es exactamente la pregunta en disputa?', o: ['a) Si la regla de Hebb existe o es un invento', 'b) Si la regla de Hebb es el mecanismo del aprendizaje o solo una pieza de un mecanismo mayor', 'c) Quién escribió antes el postulado', 'd) Si el receptor NMDA existe'], c: 1 },
  { t: 'Debate', q: '¿Qué mostraron Bliss y Lømo en 1973, según la defensa?', o: ['a) Que estimular una vía del hipocampo la dejaba potenciada durante horas', 'b) Que las neuronas mueren sin estímulo', 'c) Que el magnesio tapa el receptor NMDA', 'd) Que la dopamina señala el error de predicción'], c: 0 },
  { t: 'Debate', q: 'La objeción dice que una regla puramente hebbiana, dejada sola, no puede funcionar. ¿Por qué?', o: ['a) Porque es demasiado lenta', 'b) Porque nadie ha logrado medirla', 'c) Porque es una realimentación positiva sin freno: se refuerza a sí misma hasta saturarse', 'd) Porque solo funciona en animales jóvenes'], c: 2 },
  { t: 'Debate', q: '¿Qué aporta el llamado tercer factor, según la objeción?', o: ['a) Un segundo detector de coincidencias', 'b) Una manera de medir milisegundos', 'c) Una copia de seguridad de la sinapsis', 'd) Una señal que dice qué merece la pena aprenderse, porque la coincidencia sola no lo dice'], c: 3 },
  { t: 'Debate', q: 'Según el cierre del careo, ¿qué dato resolvería la disputa?', o: ['a) Medir el cambio de sinapsis concretas en un animal despierto que aprende algo suyo, con sus patrones naturales', 'b) Repetir el experimento de 1973 con más conejos', 'c) Preguntar a más investigadores', 'd) Aumentar la potencia de los estímulos en cultivo'], c: 0 },
]);

/* ---------- completar (12: dos por lectura) ---------- */
B.lectCompletarBank = JSON.stringify([
  { t: 'Borges', q: 'La nota de tres palabras que dejó don Aciar con el metrónomo decía «despacio, para ___».', a: 'corregir' },
  { t: 'Borges', q: 'El narrador cuenta que Bi y Poo midieron el orden de disparo en el año ___.', a: '1998' },
  { t: 'Cervantes', q: 'Al final de la tarde, al mozo le salieron cuatro golpes derechos de ___.', a: 'doce' },
  { t: 'Cervantes', q: 'El maestro herrero de la fragua se llamaba ___.', a: 'Cebrián' },
  { t: 'Harari', q: 'Frank Rosenblatt construyó el perceptrón en el año ___.', a: '1958' },
  { t: 'Harari', q: 'Macnamara, Hambrick y Oswald dejaron el efecto de la práctica en torno al ___ por ciento de la variación.', a: 'doce' },
  { t: 'Entrevista', q: 'Joaquín Soler Serrano dirigió y presentó en TVE el programa de entrevistas ___.', a: 'A fondo' },
  { t: 'Entrevista', q: 'Hebb presidió en 1960 la Asociación Estadounidense de ___.', a: 'Psicología' },
  { t: 'Quintero y Gala', q: 'El perro de Antonio Gala, que le sacó un libro entero de conversaciones, se llamaba ___.', a: 'Troylo' },
  { t: 'Quintero y Gala', q: 'Quintero le cuenta a Gala que Hebb escribió su postulado en un libro del año ___.', a: '1949' },
  { t: 'Debate', q: 'En 1984, Nowak y sus colegas mostraron que el receptor NMDA está tapado por un ion de ___.', a: 'magnesio' },
  { t: 'Debate', q: 'Turrigiano y sus colegas mostraron en 1998 que una neurona ___ todas sus sinapsis a la vez, conservando las proporciones.', a: 'reescala' },
]);

/* ---------- análisis complejo (12: dos por lectura, sin XP a propósito) ---------- */
B.lectAnalisisBank = JSON.stringify([
  { t: 'Borges', q: '1. Don Aciar prohibía repetir y contestaba «cien veces qué». Explica su método completo y por qué el narrador tardó cuarenta años en entenderlo.', guia: 'El método tiene tres reglas y las tres salen del postulado sin que el viejo lo supiera. Primero, no dejaba repetir un pasaje si no se sabía de antemano qué iba a salir mal, y no dejaba pasar de compás si el error no se nombraba en voz alta en el instante en que ocurría: la corrección tiene que caber dentro de la ventana, y por eso ponía el metrónomo tan lento. Segundo, trataba la repetición como un multiplicador y no como un mérito, y de ahí la respuesta «cien veces qué»: si lo que se multiplica es el pulgar torcido, cien repeticiones producen un error firmemente cableado. Tercero, no permitía oír la grabación antes de intentar el pasaje, porque el orden decide: primero las manos, después el modelo. El narrador tardó cuarenta años porque el método se siente lento y feo, y porque la lentitud se confunde con torpeza mientras no se mide el resultado a los diez años, que es cuando los alumnos de los otros maestros ya no tocaban.' },
  { t: 'Borges', q: '2. El cuento dice que la frase que se pegó a la memoria de la especie es justo la que borra la condición para pegarse a la memoria. Explica esa ironía.', guia: 'La frase famosa es «lo que dispara junto se cablea junto», que rima, es corta y por eso viaja. Lo que borra es la palabra que el postulado de 1949 exige: participar. En el original, A tiene que tomar parte en hacer disparar a B, y de ahí salen una causa y un orden; en el eslogan basta con la simultaneidad, que no es lo mismo y que no cablea nada. La ironía es doble. Primero, porque una frase que triunfa por ser fácil de recordar enseña precisamente que basta con poner cosas juntas, que es lo contrario de lo que hace falta para recordar. Y segundo, porque el propio eslogan es un caso de lo que niega: se pegó por repetición y por compañía (aparece siempre al lado del nombre de Hebb) y no porque nadie comprobara nada, que es exactamente la manera de aprender que el postulado no premia.' },
  { t: 'Cervantes', q: '3. El mozo dio sesenta golpes por la mañana y doce por la tarde, y por la tarde le salieron cuatro derechos. Explica qué cambió, con el vocabulario de la etapa.', guia: 'No cambió la cantidad de esfuerzo, que bajó, ni la fuerza del brazo, que era la misma: cambió que entre golpe y golpe hubo una comprobación y un nombre para el fallo. Por la mañana hubo sesenta repeticiones y cero correcciones, así que se cumplió el postulado al pie de la letra y quedó reforzada la manera de torcer el hierro, que es lo que se practicó. Por la tarde cada golpe se miró, se dijo en voz alta qué había salido, y el golpe siguiente nació de lo que vio el ojo y no de la gana de acabar: eso encadena el intento con su consecuencia, en el orden que la regla premia y dentro de un tiempo en que todavía se enganchan. Es la misma cuenta que la de don Neto en el guion y la del papá de los dos dedos: menos intentos mejor puestos ganan a muchos intentos a ciegas.' },
  { t: 'Cervantes', q: '4. Cebrián no cobró la doctrina: la hizo escribir con carbón en la pared. Explica qué dice esa frase y por qué en la pared y no en un papel.', guia: 'La frase dice que allí no se repite lo que no se ha mirado, porque el hierro no sabe de intenciones y aprende igual el yerro que el acierto, y con la misma paciencia. Es el postulado dicho por un herrero: la regla no distingue entre lo bueno y lo malo, refuerza lo que se repite, y por eso la corrección no es un adorno pedagógico sino la única manera de elegir qué se va a reforzar. Que sea en la pared y no en un papel tiene dos lecturas y las dos valen. La práctica: el papel se pierde y la pared espera a los que vengan, así que la doctrina queda donde se trabaja y no donde se guarda. Y la del propio capítulo, que el padre del mozo dice en voz alta: a los veinte años nadie lee esa doctrina si se la dan escrita, así que hay que ponerla donde la vea todos los días quien todavía no está listo para buscarla.' },
  { t: 'Harari', q: '5. El ensayo dice que las pantallas ofrecen «coincidencia perfecta y causalidad cero». Explica la frase y aplícala a un caso concreto de tu casa.', guia: 'Un video, un audio o una clase grabada avanzan solos: los estímulos ocurren a la vez que la tarde, pero nada de lo que hace quien mira participa en lo que ocurre en la pantalla. Eso cumple el eslogan al pie de la letra, porque todo dispara junto, y no cumple ninguna de las cuatro piezas del postulado, porque falta la participación y con ella se van la dirección y el orden. El caso de la casa es el de las sesenta horas de video de inglés en un mes mientras se ordena el cuarto: la sensación de aprovechar el tiempo es alta y lo cableado es la costumbre de tener ruido en inglés de fondo. La corrección no es dejar la pantalla, sino cambiar veinte minutos de recepción por veinte de producción con comprobación inmediata. Se valora que el caso sea real y que se cuente en veces producidas, no en minutos.' },
  { t: 'Harari', q: '6. El ensayo cita a Ericsson (1993) y a Macnamara y colegas (2014) uno detrás del otro. Explica por qué la casa no cita al primero sin el segundo.', guia: 'Porque Ericsson describió la práctica deliberada, trabajar al borde de la propia capacidad con retroalimentación inmediata, y esa descripción es sólida y sigue siendo el mejor método de entrenamiento conocido, pero el tamaño de su efecto se infló muchísimo por el camino. Macnamara, Hambrick y Oswald revisaron el conjunto de la evidencia en 2014 y encontraron que la práctica explica alrededor del doce por ciento de la variación entre personas, menos en educación y en profesiones. Citar solo a Ericsson deja la promesa de que cualquiera llega a cualquier sitio con horas suficientes, que es la versión de las diez mil horas que popularizó un libro de divulgación de 2008 y que el propio Ericsson desmintió. Citar solo a Macnamara deja la conclusión contraria y también falsa, que practicar da igual. La regla de la casa es que ninguna afirmación entra al mapa sin su mejor crítica en la casilla de al lado.' },
  { t: 'Entrevista', q: '7. Hebb insiste en que llamó «postulado» a su enunciado y en que la idea general no era suya. ¿Por qué importan esas dos precisiones para la regla del estatus?', guia: 'Porque las dos son declaraciones de estatus hechas por el propio autor, y la regla de la casa dice que ningún estudio entra sin su etiqueta. Llamarlo postulado significa: esto es una conjetura teórica, no un resultado experimental, y alguien tendrá que comprobarlo. Quien lo cita como ley demostrada de 1949 está inflando la fuente, aunque lo haga con admiración. Decir que la idea general venía de antes, porque en el siglo XIX Tanzi y el propio Ramón y Cajal habían conjeturado que el uso fortalece las conexiones, evita el otro inflado, el del genio solitario, y sitúa su aportación en lo concreto: la condición de participación, la asamblea de células y la secuencia de fases. Y tiene una consecuencia práctica: como era conjetura, lo que la sostiene hoy son las mediciones de 1997 y 1998, que a su vez traen su propia letra chica.' },
  { t: 'Entrevista', q: '8. Sobre las ratas de 1947, Hebb dice que la diferencia no fue el estímulo sino quién producía el movimiento. Explica esa frase y qué tiene que ver con el verbo «participa».', guia: 'Las ratas que se quedaron en la jaula tenían delante exactamente el mismo laboratorio que las que se fueron a la casa de Hebb: los mismos ruidos, las mismas luces, el mismo mundo al otro lado de los barrotes. Lo que no tenían era la posibilidad de tropezar con él, subir una escalera, caerse y volver a subir. Por eso Hebb dice que la diferencia no fue el estímulo. Y ahí está el verbo del postulado hecho biografía de rata: participar no es estar presente, es que algo de lo que uno hace tome parte en lo que ocurre después. La misma frase explica al nieto que mira quince años el torno del abuelo, al actor que ensaya con el papel en la mano y al alumno con el video de fondo. Se valora que la respuesta conecte las tres cosas: la anécdota, el verbo y algún caso propio.' },
  { t: 'Quintero y Gala', q: '9. Gala dice que la costumbre es «un escultor lento» y cuenta el camino de la alameda. Explica qué parte del postulado está diciendo con esa imagen.', guia: 'El camino de la alameda no lo dibujó ningún ingeniero: lo dibujaron los pies pasando por donde era más cómodo, y al año había un surco al que ya no se le discute. Eso es la repetición como multiplicador: nadie decidió aquel camino y todos lo obedecían después. La parte del postulado que dice la imagen es la que más incomoda, y Gala la dice entera: el escultor no distingue, talla con la misma paciencia la virtud y el vicio, la buena caligrafía y la mala, el pulgar torcido del alfarero y el derecho. Es decir, la regla refuerza lo que se repite y no lo que conviene, y por eso practicar sin corrección es la manera más segura de volverse muy bueno en algo que se hace mal. Se valora que la respuesta note lo que la imagen añade a la definición técnica: que el trabajo del escultor ocurre mientras uno mira para otro lado.' },
  { t: 'Quintero y Gala', q: '10. «Que no confundan asistir con hacer.» Explica por qué Gala llama a eso la confusión de nuestro tiempo y la más cara.', guia: 'Asistir es estar delante: leer a los maestros, ver el ensayo, oír la conferencia, tener el tutorial puesto. Hacer es producir algo que salga de uno y pueda salir mal delante de alguien. Gala lo llama la confusión de nuestro tiempo porque nunca fue tan fácil asistir a todo y tan raro producir algo, y la llama la más cara por lo que él mismo cuenta de su Fundación: el joven que lee tres años siente que avanza, y el que escribe siente que no puede, así que la sensación va justo al revés que el provecho y empuja a cada uno hacia lo que menos rinde. En el vocabulario de la etapa: asistir es coincidencia y hacer es participación, y solo la segunda cumple el postulado. Se valora que la respuesta enlace la trampa de la sensación con la cláusula de especificidad: uno no se vuelve lo que admira, se vuelve lo que repite, y exactamente eso.' },
  { t: 'Debate', q: '11. Resume las dos posturas del careo en su mejor versión, y di qué le concede cada una a la otra.', guia: 'La defensa sostiene que la regla es el mecanismo del aprendizaje, y no lo dice de palabra: se apoya en la potenciación a largo plazo de Bliss y Lømo (1973), en el receptor NMDA como detector de coincidencias con su bloqueo por magnesio (Nowak y colegas, 1984), en el experimento de Morris y colegas (1986) donde bloquear ese receptor tumba el aprendizaje espacial sin tocar el nado, y en la medición del reloj por Markram (1997) y Bi y Poo (1998). La objeción sostiene que la regla no basta, y da tres razones: sola es una realimentación positiva que se satura, y por eso hizo falta el umbral móvil de Bienenstock, Cooper y Munro (1982) y el reescalado sináptico de Turrigiano y colegas (1998); la coincidencia dice qué va con qué pero no qué merece aprenderse, y por eso hacen falta reglas de tres factores con la dopamina señalando el error de predicción (Schultz, Dayan y Montague, 1997); y la ventana está medida sobre todo en rodajas y cultivos, con la crítica explícita de Lisman y Spruston (2005) y la revisión de Feldman (2012). Las concesiones son lo que se valora: la objeción concede que la potenciación existe, que el NMDA detecta coincidencias y que el orden cambia el signo; la defensa concede que hacen falta mecanismos estabilizadores y un tercer factor, y sostiene que completan la regla en vez de sustituirla.' },
  { t: 'Debate', q: '12. El careo termina diciendo qué dato resolvería la disputa. Explica cuál es, por qué las dos partes lo aceptarían, y qué gana quien estudia aunque no se resuelva nunca.', guia: 'El dato sería medir el cambio de sinapsis concretas en un animal despierto que está aprendiendo algo suyo, con sus patrones de disparo naturales y sin estímulos escogidos por el laboratorio, y comprobar si el signo del cambio se predice con el orden y la ventana. Las dos partes lo aceptarían porque ataca justo el punto que las separa y no otro: nadie discute lo que pasa en una rodaja de tejido, se discute cuánto de eso opera en la vida del animal, así que el experimento decisivo tiene que ocurrir en la vida del animal. Y lo que gana quien estudia sin esperar el resultado es lo que el propio careo pone en el terreno común: los dos lados exigen que el alumno produzca y que la consecuencia llegue pegada al intento, porque la actividad coincidente y dirigida cambia las conexiones y la mera compañía no. Se valora especialmente que la respuesta note que ninguno de los dos bandos defiende el eslogan de 1992, que es lo que casi todo el mundo cita.' },
]);

/* ---------- logros y niveles ---------- */
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la regla de Hebb superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la plasticidad explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de postulado y eslogan experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la regla maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del barro vivo' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 25 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta del Barro Vivo completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Repite sin orden 🌫️' },
  { t: 25, n: 'Cita el postulado entero 📕' },
  { t: 55, n: 'Distingue junto de participar 🔑' },
  { t: 90, n: 'Sabe quién escribió el eslogan 📣' },
  { t: 130, n: 'Lee el orden de disparo ⏱️' },
  { t: 165, n: 'Diseña práctica con corrección 🎯' },
  { t: 190, n: 'Cablea lo que quiere ser 🏺' },
]);

/* ══════════ inyección ══════════ */
let src = fs.readFileSync(ARCHIVO, 'utf8');
let lineas = src.split('\n');
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_barro_hebb_v1';");

/* La guía de la sección de decisión: la del molde hablaba de partes y de
   timones, que aquí no existen. */
src = src.replace(/const critDecisionGuide='[^']*';/,
  "const critDecisionGuide='La decisión correcta en esta etapa sigue siempre el mismo orden. Primero se separa lo que se produce de lo que solo se recibe, porque el eslogan no permite hacer esa separación y el postulado la exige: hay que contar cuántas veces sale algo de las manos o de la boca de quien practica, no cuántos minutos duró la escena. Después se le mide el retraso a la corrección, que puede ser una persona, una respuesta tapada, una grabación o el resultado visible de la acción, y lo que importa no es su severidad sino cuánto tarda en llegar desde el intento, porque la que llega días después llega sola y no se engancha con nada. Luego se pone en fila el intento y su consecuencia, recordando que el orden decide el signo del cambio y que ver el modelo antes de intentar deja al que aprende reconociendo en vez de produciendo. Y al final se cambia UNA sola cosa, la más barata, casi siempre la misma: convertir un rato de recepción en un rato de producción con comprobación inmediata, y volver a medir a la semana, porque una decisión sin segunda medición es una opinión con fecha.';");

/* ---------- lo que arrastra el molde (la etapa 1 del espejo) ---------- */
const textos = [
  [/🪞 \*Ruta de la Máquina que se Mira · Etapa 1\* 🪞\\n\\nEl vigía y el timón: el piso que estudia, el piso que vigila, y por qué la gente decide bien sobre datos malos\. 🪞\\n\\n_Incluye evaluación conceptual, la sesión sobre la mesa, guion de video, cinco lecturas y sus 45 preguntas\._ ✍️/g,
    '🏺 *Ruta del Barro Vivo · Etapa 1* 🏺\\n\\nLa regla de Hebb, bien contada: no es lo que dispara junto, es lo que ayuda a disparar, y el eslogan famoso ni siquiera es de Hebb. 🏺\\n\\n_Incluye evaluación conceptual, la práctica sobre la mesa, guion de video, cinco lecturas y sus 45 preguntas._ ✍️'],
  [/¿Qué parte subió el vigía y de dónde salió, qué decidió el timón y con qué dato, y dónde está el parte falso con la pista que lo fabricó\? Explica qué compruebas a cuaderno cerrado y qué apuntas en el registro\./g,
    '¿Qué produce quien practica y qué solo recibe, quién corrige y cuánto tarda, y en qué orden quedan el intento y su consecuencia? Explica qué quedará cableado en un mes y qué UNA cosa cambiarías.'],
  [/1\. ¿Cuál de los dos comprueba el parte antes de decidir\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos cumple el postulado y no solo el eslogan? 2. ¿Por qué no cablean lo mismo?'],
  [/La sesión sobre la mesa/g, 'La práctica sobre la mesa'],
  [/la sesión sobre la mesa/g, 'la práctica sobre la mesa'],
  [/El vigía y el timón/g, 'La regla de Hebb, bien contada'],
  [/el vigía y el timón/g, 'la regla de Hebb, bien contada'],
  [/Ruta de la Máquina que se Mira/g, 'Ruta del Barro Vivo'],
  [/completó la Etapa 1 de la Ruta del Barro Vivo \(La regla de Hebb, bien contada\)/g,
    'completó la Etapa 1 de la Ruta del Barro Vivo (La regla de Hebb, bien contada)'],
  [/const msgs=\['¡Sigue mirando tu estudio!','¡Muy buen trabajo!','¡Vigía en entrenamiento!','¡Ya separas el parte de la decisión!','¡Auditor del propio estudio!'\]/,
    "const msgs=['¡Sigue produciendo y corrigiendo!','¡Muy buen trabajo!','¡Ya citas el postulado entero!','¡Distingues junto de participar!','¡Diseñador de práctica que sí cablea!']"],
  [/\['#4338ca','#818cf8','#94a3b8','#d4a017','#00b894'\]/, "['#9a3412','#fdba74','#a8a29e','#d4a017','#00b894']"],
  /* los colores de las hojas impresas, que eran el índigo del espejo */
  [/#4338ca/g, '#9a3412'],
  [/#1e1b4b/g, '#431407'],
  [/#eef2ff/g, '#fff7ed'],
  [/un ensayo y dos entrevistas imaginadas, sobre el mismo vigía/g,
    'un ensayo y dos entrevistas imaginadas, sobre la misma regla'],
  [/🪞/g, '🏺'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las cinco lecturas de esta etapa, con sus títulos y su género. */
src = src.replace(/const LECTURAS_IMPR=\{[\s\S]*?\n\};/,
  `const LECTURAS_IMPR={
  borges:{titulo:'El metrónomo de don Aciar',tipo:'Cuento, a la manera de Jorge Luis Borges'},
  cervantes:{titulo:'Donde se cuenta lo que sucedió en la fragua a un mozo que quería aprender el oficio en tres días, y de la doctrina que le dio un herrero viejo sobre el orden con que se aprende',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'},
  harari:{titulo:'La especie que se cablea a sí misma',tipo:'Ensayo, a la manera de Yuval Noah Harari'},
  entrevista:{titulo:'El hombre que escribió una conjetura y le salió una industria',tipo:'Entrevista imaginada con Donald O. Hebb, a la manera de Joaquín Soler Serrano',ficcion:true},
  gala:{titulo:'La costumbre, que es un escultor lento',tipo:'El Loco de la Colina: Jesús Quintero conversa con Antonio Gala (conversación imaginada)',ficcion:true},
};`);

/* El pliego de las cinco: la etiqueta nombra a los invitados de esta etapa. */
src = src.replace(/Las conversaciones con John H\. Flavell, y entre Jesús Quintero y Antonio Gala, son invención del Proyecto Educativo F\.A\.R\.O\./,
  'Las conversaciones con Donald O. Hebb, y entre Jesús Quintero y Antonio Gala, son invención del Proyecto Educativo F.A.R.O.');

/* La simulación de la etapa del espejo era la noche antes del examen. Aquí es
   la tarde de la tabla del siete: repetir la cadena o practicar el par suelto
   con corrección inmediata. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(pregunto){sfx(pregunto?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(pregunto){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🎯</span><span class="ms-text"><strong>Preguntaste pares sueltos y al azar:</strong> siete por ocho, siete por cuatro, siete por nueve. Angelly falló seis de veinte, y cada fallo se corrigió en el mismo segundo, antes de la pregunta siguiente.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🏺</span><span class="ms-text"><strong>Se practicó lo que después se pide:</strong> cada par quedó con su propia puerta de entrada, porque el intento participó en el resultado. A la semana contesta suelto y sin cantar.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🔁</span><span class="ms-text"><strong>La cantó veinte veces más:</strong> las veinte le salieron perfectas, porque cantada nunca falla. La sensación de dominio subió, y con razón: hizo muy bien lo que hizo.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">⏱️</span><span class="ms-text"><strong>Se reforzó la cadena, no el par:</strong> veinte repeticiones más de un solo orden. En la fila del mercado sigue tardando cinco segundos, porque para llegar al eslabón hay que arrancar desde el primero.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='postulado',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"postulado\"]')?.classList.add('active-pri');");


/* ── El motor de las lecturas se mudó a js/lecturas.js (20 de agosto de 2026) ──
   Las tres baterías dejaron de vivir juntas al final de la sección y pasaron a
   estar DENTRO de cada lectura, filtradas por su voz, y las seis lecturas se
   pliegan. Eso no es contenido de esta etapa: es un aparato de lectura que
   tiene que comportarse igual en las trece misiones del Estudio Mayor, así que
   vive en un archivo compartido (tercera excepción de la casa a la norma 1).
   Aquí se borran las funciones de pantalla que quedaron sin dueño; los BANCOS
   y las funciones de IMPRESIÓN se quedan, porque el contenido sí es de la
   etapa y el aparato compartido lo lee de aquí. */
src = src.replace(
  /const xpLect=\{c:new Set\(\),f:new Set\(\)\};[\s\S]*?\n\/\* ---------- impresión: cada lectura por separado ---------- \*\//,
  '/* Las tres baterías de pantalla las monta ahora js/lecturas.js dentro de\n'
  + '   cada lectura, leyendo estos mismos bancos por su etiqueta de voz. */\n\n'
  + '/* ---------- impresión: cada lectura por separado ---------- */');

/* La sexta lectura entra en la tabla de las hojas impresas. El careo no imita
   a ningún autor, así que NO lleva la etiqueta de pastiche: lleva la suya. */
src = src.replace(
  /  gala:\{titulo:'La costumbre, que es un escultor lento',tipo:'([^']*)',ficcion:true\},\n\};/,
  "  gala:{titulo:'La costumbre, que es un escultor lento',tipo:'$1',ficcion:true},\n"
  + "  debate:{titulo:'¿Basta la regla de Hebb?',tipo:'Careo: las dos posturas de una disputa abierta, con sus réplicas',careo:true},\n};");

/* La etiqueta del careo, que es distinta: no hay voz imitada ni encuentro que
   declarar, hay una disputa real contada por los dos lados. */
src = src.replace(
  "function _etiquetaImpresa(meta){\n  if(meta&&meta.ficcion){",
  "function _etiquetaImpresa(meta){\n"
  + "  if(meta&&meta.careo){\n"
  + "    return '<div class=\"etiqueta\"><strong>⚖️ Careo escrito por la casa sobre una disputa real.</strong> Los turnos los firman los <strong>papeles</strong> (moderación, defensa, objeción) y no personas: aquí no se le pone a nadie una palabra en la boca. Los investigadores se citan en tercera persona como fuentes, <strong>toda obra, revista, fecha y cifra es real y comprobable</strong>, y cada postura va escrita en su mejor versión, no en la que sería fácil de tumbar.</div>';\n"
  + "  }\n"
  + "  if(meta&&meta.ficcion){");

/* Las hojas impresas pasan de cinco a seis, y el pliego de preguntas de 45 a 54. */
const impresion = [
  ['Las cinco lecturas 📖', 'Las seis lecturas 📖'],
  ['<h1>Las cinco lecturas de «La regla de Hebb, bien contada»</h1><div class="tipo">Un cuento, un capítulo, un ensayo y dos entrevistas imaginadas, sobre la misma regla</div>',
   '<h1>Las seis lecturas de «La regla de Hebb, bien contada»</h1><div class="tipo">Un cuento, un capítulo, un ensayo, dos entrevistas imaginadas y un careo, sobre la misma regla</div>'],
  ["['borges','cervantes','harari','entrevista','gala']", "['borges','cervantes','harari','entrevista','gala','debate']"],
  ["_hojaImpresa('Las cinco lecturas'", "_hojaImpresa('Las seis lecturas'"],
  ["' · Las cinco lecturas'", "' · Las seis lecturas'"],
  ['<h1>Preguntas de las cinco lecturas</h1>', '<h1>Preguntas de las seis lecturas</h1>'],
  ['25 de comprensión lectora, 10 de completar y 10 de análisis complejo',
   '30 de comprensión lectora, 12 de completar y 12 de análisis complejo'],
  ['I. Comprensión lectora (25 preguntas)', 'I. Comprensión lectora (30 preguntas)'],
  ['II. Completa la oración (10 preguntas)', 'II. Completa la oración (12 preguntas)'],
  ['III. Análisis complejo (10 preguntas)', 'III. Análisis complejo (12 preguntas)'],
  ['Los cinco textos son <strong>ejercicios de estilo de la casa</strong>: no son obra de Borges, Cervantes ni Harari, y las dos entrevistas son imaginadas (los encuentros nunca ocurrieron).',
   'Los cinco primeros son <strong>ejercicios de estilo de la casa</strong>: no son obra de Borges, Cervantes ni Harari, y las dos entrevistas son imaginadas (los encuentros nunca ocurrieron). El sexto es un <strong>careo</strong> sobre una disputa real, con los turnos firmados por papeles y no por personas.'],
  ['Los cinco textos <strong>NO son obra de Jorge Luis Borges, de Miguel de Cervantes Saavedra ni de Yuval Noah Harari</strong>',
   'Los cinco primeros <strong>NO son obra de Jorge Luis Borges, de Miguel de Cervantes Saavedra ni de Yuval Noah Harari</strong>, y el sexto es un careo escrito por la casa sobre una disputa real'],
];
for (const [de, a] of impresion) {
  /* Solo se avisa si no está ni lo viejo ni lo nuevo: correr este script dos
     veces seguidas es normal y no tiene por qué llenar la pantalla de avisos. */
  if (src.indexOf(de) < 0 && src.indexOf(a) < 0) console.log('OJO: no estaba para cambiar → ' + de.slice(0, 60));
  src = src.split(de).join(a);
}

/* Cada lectura se imprime con SUS preguntas detrás, y su pauta en hoja aparte
   (norma 5-quater). Las arma el aparato compartido, que ya sabe cuáles son de
   cada voz. */
src = src.replace(
  "_abreImpresion(_hojaImpresa(meta.titulo,cuerpo+FaroMarcador.impresionExtra([clave]),' · '+meta.titulo));",
  "const preg=(window.FaroLecturas&&FaroLecturas.preguntasImpresas)?FaroLecturas.preguntasImpresas(clave):'';\n"
  + "  _abreImpresion(_hojaImpresa(meta.titulo,cuerpo+preg+FaroMarcador.impresionExtra([clave]),' · '+meta.titulo));");


/* El arranque de la misión llamaba a las tres pantallas viejas. Ya no
   existen: quien monta las baterías es js/lecturas.js, y lo hace solo. */
src = src.replace(/\n *showLectC\(\);\n *showLectF\(\);\n *showLectA\(\);/,
  '\n  /* Las baterías de cada lectura las monta js/lecturas.js al cargar. */');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
