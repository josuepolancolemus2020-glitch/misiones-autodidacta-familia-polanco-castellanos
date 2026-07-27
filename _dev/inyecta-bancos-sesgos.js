/* Inyecta los bancos de la misión «Sesgos, los atajos que deciden por ti»
   (Ruta de la Persuasión, etapa 2) sobre el molde copiado de la misión de Marca.
   Uso:  node _dev/inyecta-bancos-sesgos.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-persuasion-sesgos', 'js', 'sesgos.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 19860727;
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

B.SAVE_KEY = `'faro_psi_sesgos_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de los sesgos superado' },
  flash_master: { icon: '🃏', label: 'Todos los atajos de la mente explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de sesgo y palanca experto' },
  id_master: { icon: '🔍', label: 'Cazador de sesgos maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de los sesgos' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta de la Persuasión completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Decide en caliente 🔥' },
  { t: 25, n: 'Se mira al espejo 🪞' },
  { t: 55, n: 'Reconoce el ancla ⚓' },
  { t: 90, n: 'Busca lo que contradice 🔍' },
  { t: 130, n: 'Suelta el costo hundido 🕳️' },
  { t: 165, n: 'Escribe antes de hablar ✍️' },
  { t: 190, n: 'Decide en frío 🧊' },
]);

B.fcData = JSON.stringify([
  { w: 'Sesgo', a: '🧠 Un <strong>atajo</strong> que el cerebro usa para ahorrar energía y que muchas veces acierta. Por eso no se puede apagar: solo se puede compensar, y solo se compensa el que se sabe nombrar.' },
  { w: 'Sesgo y palanca', a: '⚖️ El sesgo viene de <strong>dentro</strong> y no tiene culpable; la palanca la aplica <strong>otro</strong> a propósito. Casi toda palanca se apoya en un sesgo que ya estaba ahí.' },
  { w: 'Anclaje', a: '⚓ El <strong>primer número</strong> que se escucha fija el terreno de toda la conversación. Después ya no se discute cuánto vale, sino cuánto se baja desde esa cifra.' },
  { w: 'Confirmación', a: '🔍 Se busca y se recuerda lo que <strong>encaja con lo que ya se creía</strong>, y se pasa por encima de lo demás. Preguntarle solo a quien ya te quiere es su forma más común.' },
  { w: 'Aversión a la pérdida', a: '😰 Perder duele <strong>alrededor del doble</strong> de lo que alegra ganar lo mismo. Por eso la urgencia funciona: no vende el beneficio, vende el miedo a quedarse sin él.' },
  { w: 'Disponibilidad', a: '📢 Lo que se recuerda con fuerza <strong>se siente más probable</strong> de lo que es. Una queja ruidosa pesa más que cuarenta usos callados.' },
  { w: 'Halo', a: '✨ Bueno en una cosa se contagia a <strong>todas las demás</strong>. El prestigio de quien propone dice cómo son en lo suyo, no si este trato concreto conviene.' },
  { w: 'Costo hundido', a: '🕳️ Seguir por lo ya invertido. Lo gastado <strong>no vuelve se decida lo que se decida</strong>, así que meterlo en la balanza solo añade pérdidas nuevas a las viejas.' },
  { w: 'Exceso de confianza', a: '📅 Estimar con el <strong>mejor día imaginable</strong>: sin cortes de luz, sin rehacer nada, sin imprevistos. El antídoto no es el pesimismo, es mirar el historial propio.' },
  { w: 'Sesgo del superviviente', a: '🏆 Se ve al que ganó y <strong>no a los cuatrocientos</strong> que hicieron lo mismo y desaparecieron. Los que fracasan no publican su fracaso.' },
  { w: 'Decidir en frío', a: '🧊 Separar el momento de <strong>escuchar</strong> del momento de <strong>decidir</strong>. Escuchar se puede en cualquier lado; decidir se hace solo y sin nadie mirando el reloj.' },
  { w: 'La pregunta del origen', a: '❓ «¿De dónde salió ese número?» Es el antídoto del anclaje y la pregunta más barata que existe: cuesta cinco palabras y devuelve el terreno.' },
  { w: 'La pregunta del cambio', a: '🔄 «¿Qué dato me haría cambiar de opinión?» Si no hay ninguno, no se está razonando: se está defendiendo algo que ya se decidió.' },
  { w: 'La pregunta del cero', a: '🔁 «Si empezara hoy desde cero, ¿elegiría esto?» Es el antídoto del costo hundido, y sirve igual para un motor de software que para una costumbre.' },
  { w: 'El primer número', a: '1️⃣ Quien lo dice fija el terreno. Si lo puso el otro, se dice en voz alta <strong>«ese número es tuyo»</strong> y se saca el propio, calculado antes de la reunión.' },
  { w: 'La decisión escrita antes', a: '📝 Qué se busca y qué se aceptaría, apuntado <strong>antes de la primera conversación</strong>. Después ya no se sabe cuánto de lo que uno piensa lo pensó uno.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué es un sesgo, según esta etapa?', o: ['a) Un error de gente que no piensa', 'b) Un atajo del cerebro que ahorra energía y a veces acierta', 'c) Una técnica de manipulación', 'd) Una opinión mal formada'], c: 1 },
  { q: '¿En qué se diferencia un sesgo de una palanca?', o: ['a) El sesgo viene de dentro y la palanca la aplica otro', 'b) El sesgo es peor que la palanca', 'c) La palanca es involuntaria', 'd) No se diferencian en nada'], c: 0 },
  { q: '«Esto vale 200.000, te lo dejo en 80.000». ¿Qué sesgo trabaja?', o: ['a) Halo', 'b) Disponibilidad', 'c) Anclaje', 'd) Costo hundido'], c: 2 },
  { q: '¿Cuál es el antídoto del costo hundido?', o: ['a) Calcular cuánto se ha invertido', 'b) Preguntarse qué se elegiría empezando hoy desde cero', 'c) Esperar a recuperar lo gastado', 'd) Pedir una segunda opinión'], c: 1 },
  { q: 'Preguntarle solo a las maestras que ya usan M.E.T.A.S es un caso de…', o: ['a) Sesgo de confirmación', 'b) Anclaje', 'c) Exceso de confianza', 'd) Aversión a la pérdida'], c: 0 },
  { q: '¿Por qué funciona la urgencia de «si no aceptas hoy se cae»?', o: ['a) Porque la oferta es realmente buena', 'b) Porque el plazo siempre es cierto', 'c) Porque genera simpatía', 'd) Porque perder duele más que ganar lo mismo'], c: 3 },
  { q: 'Copiar la táctica de un canal con un millón de vistas es…', o: ['a) Sesgo del superviviente', 'b) Sesgo de halo', 'c) Anclaje', 'd) Disponibilidad'], c: 0 },
  { q: 'Una queja ruidosa pesa más que cuarenta usos callados por…', o: ['a) Costo hundido', 'b) Disponibilidad', 'c) Confirmación', 'd) Halo'], c: 1 },
  { q: '¿Cuándo NO se toma una decisión que importa?', o: ['a) Por la mañana y con tiempo', 'b) Después de escribir lo que se busca', 'c) Cansado y con alguien esperando respuesta', 'd) Con la hoja de las cinco preguntas delante'], c: 2 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saber los ocho nombres de memoria', 'b) Haberse cazado a uno mismo en una decisión real', 'c) Reconocer los sesgos de los demás', 'd) Haber leído la ficha completa'], c: 1 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Sesgo', 'Palanca'], headA: '🧠 Sesgo (viene de dentro)', headB: '🎣 Palanca (la aplica otro)', colA: 'ok', colB: 'no',
    words: [
      { w: 'Seguir por las horas ya invertidas', t: 'ok' }, { w: 'Un favor previo que obliga', t: 'no' },
      { w: 'Recordar la queja más ruidosa', t: 'ok' }, { w: 'Un plazo que vence el viernes', t: 'no' },
      { w: 'Estimar con el mejor día posible', t: 'ok' }, { w: 'Una autoridad prestada en el correo', t: 'no' },
      { w: 'Creer que el nombre grande garantiza el trato', t: 'ok' }, { w: 'Una prueba social inflada', t: 'no' },
    ],
  },
  {
    label: ['Anclaje', 'Costo hundido'], headA: '⚓ Anclaje', headB: '🕳️ Costo hundido', colA: 'ok', colB: 'no',
    words: [
      { w: '«Vale 200.000, te doy 80.000»', t: 'ok' }, { w: '«Ya metí setecientas horas»', t: 'no' },
      { w: 'Discutir cuánto se baja y no cuánto vale', t: 'ok' }, { w: 'Seguir con algo que ya no sirve', t: 'no' },
      { w: 'El primer número lo puso el otro', t: 'ok' }, { w: '«Sería tirar a la basura lo hecho»', t: 'no' },
      { w: 'El descuento que se siente victoria', t: 'ok' }, { w: 'Pagar más para no perder lo pagado', t: 'no' },
    ],
  },
  {
    label: ['Confirma', 'Contradice'], headA: '👍 Dato que confirma', headB: '🔎 Dato que contradice', colA: 'ok', colB: 'no',
    words: [
      { w: 'Preguntar a quien ya lo usa', t: 'ok' }, { w: 'Llamar a tres que lo dejaron', t: 'no' },
      { w: 'Contar las felicitaciones', t: 'ok' }, { w: 'Contar los que abrieron y no volvieron', t: 'no' },
      { w: 'Leer los comentarios buenos', t: 'ok' }, { w: 'Buscar los que probaron y fracasaron', t: 'no' },
      { w: 'Repasar los casos que salieron bien', t: 'ok' }, { w: 'Anotar qué dato cambiaría la decisión', t: 'no' },
    ],
  },
  {
    label: ['En frío', 'En caliente'], headA: '🧊 Decisión en frío', headB: '🔥 Decisión en caliente', colA: 'ok', colB: 'no',
    words: [
      { w: 'Con lo que se busca escrito antes', t: 'ok' }, { w: 'Con el otro esperando la respuesta', t: 'no' },
      { w: 'Solo y sin plazo encima', t: 'ok' }, { w: 'De noche y después de un día largo', t: 'no' },
      { w: 'Con el número propio calculado', t: 'ok' }, { w: 'A partir de la cifra que dijo el otro', t: 'no' },
      { w: '«Lo veo y te contesto mañana»', t: 'ok' }, { w: '«Firmemos ya para no perderlo»', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['El', 'anclaje', 'lo', 'fija', 'el', 'primer', 'número.'], c: 1, art: 'El sesgo que decide el terreno' },
  { s: ['Un', 'sesgo', 'es', 'un', 'atajo,', 'no', 'un', 'error.'], c: 1, art: 'Lo que estudia toda la etapa' },
  { s: ['La', 'confirmación', 'busca', 'solo', 'lo', 'que', 'encaja.'], c: 1, art: 'El sesgo de preguntar a los propios' },
  { s: ['El', 'costo', 'hundido', 'no', 'es', 'un', 'argumento.'], c: 2, art: 'Lo gastado que ya no vuelve' },
  { s: ['El', 'halo', 'contagia', 'lo', 'bueno', 'a', 'todo.'], c: 1, art: 'El sesgo del nombre que suena bien' },
  { s: ['La', 'disponibilidad', 'confunde', 'ruido', 'con', 'frecuencia.'], c: 1, art: 'El sesgo de la queja más fuerte' },
  { s: ['Las', 'decisiones', 'se', 'escriben', 'antes', 'de', 'hablar.'], c: 1, art: 'Lo que se apunta en frío' },
  { s: ['El', 'superviviente', 'esconde', 'a', 'los', 'que', 'perdieron.'], c: 1, art: 'El sesgo de copiar al que ganó' },
]);

B.cmpData = JSON.stringify([
  { s: 'El sesgo que fija el terreno con el primer número es el ___.', opts: ['anclaje', 'halo', 'ruido'], c: 0 },
  { s: 'Un sesgo viene de dentro; una ___ la aplica otro.', opts: ['palanca', 'oferta', 'prueba'], c: 0 },
  { s: 'Buscar solo lo que encaja con lo que ya se creía es el sesgo de ___.', opts: ['confirmación', 'disponibilidad', 'halo'], c: 0 },
  { s: 'Lo ya invertido y que no vuelve es el costo ___.', opts: ['hundido', 'fijo', 'variable'], c: 0 },
  { s: 'Perder duele más que ganar lo mismo: es la aversión a la ___.', opts: ['pérdida', 'duda', 'espera'], c: 0 },
  { s: 'Bueno en una cosa parece bueno en todas: es el sesgo del ___.', opts: ['halo', 'ancla', 'cero'], c: 0 },
  { s: 'Copiar solo a los que ganaron es el sesgo del ___.', opts: ['superviviente', 'optimista', 'competidor'], c: 0 },
  { s: 'La decisión que importa se escribe ___ de la conversación.', opts: ['antes', 'después', 'durante'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Sesgo', 'Palanca'], btnA: '🧠 Sesgo', btnB: '🎣 Palanca', colA: 'ok', colB: 'no',
    words: [
      { w: 'Seguir por lo ya invertido', t: 'ok' }, { w: 'Un favor previo que obliga', t: 'no' },
      { w: 'Recordar lo más ruidoso', t: 'ok' }, { w: 'Un plazo que vence hoy', t: 'no' },
      { w: 'Estimar con el mejor día', t: 'ok' }, { w: 'Autoridad prestada', t: 'no' },
      { w: 'El nombre grande convence', t: 'ok' }, { w: 'Prueba social inflada', t: 'no' },
      { w: 'Preguntar a los propios', t: 'ok' }, { w: 'Regalo antes de pedir', t: 'no' },
    ],
  },
  {
    label: ['Anclaje', 'Costo hundido'], btnA: '⚓ Anclaje', btnB: '🕳️ Hundido', colA: 'ok', colB: 'no',
    words: [
      { w: 'El primer número lo puso el otro', t: 'ok' }, { w: '«Ya metí setecientas horas»', t: 'no' },
      { w: 'Discutir el descuento', t: 'ok' }, { w: 'Seguir con lo que no sirve', t: 'no' },
      { w: '«Vale 200.000, te doy 80.000»', t: 'ok' }, { w: '«Sería tirar lo hecho»', t: 'no' },
      { w: 'El regateo que parece victoria', t: 'ok' }, { w: 'Pagar más por no perder', t: 'no' },
      { w: 'La cifra de apertura', t: 'ok' }, { w: 'Un año más por si acaso', t: 'no' },
    ],
  },
  {
    label: ['En frío', 'En caliente'], btnA: '🧊 En frío', btnB: '🔥 En caliente', colA: 'ok', colB: 'no',
    words: [
      { w: 'Escrito antes de hablar', t: 'ok' }, { w: 'Con el otro esperando', t: 'no' },
      { w: 'Solo y sin plazo', t: 'ok' }, { w: 'De noche y cansado', t: 'no' },
      { w: 'Con el número propio', t: 'ok' }, { w: 'Desde la cifra del otro', t: 'no' },
      { w: '«Te contesto mañana»', t: 'ok' }, { w: '«Firmemos ya»', t: 'no' },
      { w: 'Con la hoja de las cinco', t: 'ok' }, { w: 'Con la oferta que se cae hoy', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se decide en frío, de principio a fin', steps: ['Escribir qué se busca y qué se aceptaría, antes de hablar con nadie', 'Calcular el número propio y dejarlo apuntado', 'Escuchar la oferta completa sin comprometerse a nada', 'Contestar «lo veo y te digo mañana»', 'Contestar a solas la hoja de las cinco preguntas', 'Decidir, y dejar por escrito por qué'] },
  { label: 'Cómo se desmonta un anclaje', steps: ['Notar que la primera cifra la puso el otro', 'Preguntar de dónde salió ese número', 'Decir en voz alta que ese número no es el propio', 'Sacar el número calculado antes de la reunión', 'Negociar desde el propio, no desde el ajeno'] },
  { label: 'Cómo se sale de un costo hundido', steps: ['Escribir cuánto se lleva invertido y aceptarlo como perdido', 'Preguntarse qué se elegiría empezando hoy desde cero', 'Listar las razones que no dependen de lo ya gastado', 'Decidir con esas razones solamente', 'Apuntar la fecha, para no volver a discutirlo cada mes'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'El primer número que se escucha fija el terreno de la conversación', ans: 'Anclaje', opts: ['Anclaje', 'Halo', 'Disponibilidad', 'Costo hundido'] },
  { desc: 'Se busca y se recuerda solo lo que encaja con lo que ya se creía', ans: 'Confirmación', opts: ['Confirmación', 'Anclaje', 'Superviviente', 'Exceso de confianza'] },
  { desc: 'Perder duele alrededor del doble de lo que alegra ganar lo mismo', ans: 'Aversión a la pérdida', opts: ['Aversión a la pérdida', 'Halo', 'Confirmación', 'Anclaje'] },
  { desc: 'Lo que se recuerda con fuerza se siente más probable de lo que es', ans: 'Disponibilidad', opts: ['Disponibilidad', 'Costo hundido', 'Anclaje', 'Halo'] },
  { desc: 'Bueno en una cosa se contagia a todas las demás', ans: 'Halo', opts: ['Halo', 'Superviviente', 'Disponibilidad', 'Confirmación'] },
  { desc: 'Se sigue por lo ya invertido, que no vuelve se decida lo que se decida', ans: 'Costo hundido', opts: ['Costo hundido', 'Aversión a la pérdida', 'Anclaje', 'Halo'] },
  { desc: 'Se estima con el mejor día imaginable, sin imprevistos', ans: 'Exceso de confianza', opts: ['Exceso de confianza', 'Disponibilidad', 'Confirmación', 'Anclaje'] },
  { desc: 'Se ve al que ganó y no a los cuatrocientos que hicieron lo mismo', ans: 'Superviviente', opts: ['Superviviente', 'Halo', 'Costo hundido', 'Disponibilidad'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: '«Esto vale doscientos mil, pero te lo dejo en ochenta»', func: 'Anclaje: el primer número fija el terreno', opts: ['Anclaje: el primer número fija el terreno', 'Halo: el prestigio de quien lo dice', 'Disponibilidad: lo que más se recuerda', 'Confirmación: solo lo que encaja'] },
  { trans: '«Si no firmas esta semana, el presupuesto se cierra»', func: 'Aversión a la pérdida: duele más perderlo que ganarlo', opts: ['Aversión a la pérdida: duele más perderlo que ganarlo', 'Costo hundido: lo que ya se invirtió', 'Superviviente: solo se ven los que ganaron', 'Anclaje: la primera cifra'] },
  { trans: '«Es una institución muy seria, seguro que el convenio conviene»', func: 'Halo: lo bueno en una cosa se contagia a todas', opts: ['Halo: lo bueno en una cosa se contagia a todas', 'Disponibilidad: el caso más ruidoso', 'Confirmación: preguntar a los propios', 'Exceso de confianza: estimar de más'] },
  { trans: '«Este canal explotó con vídeos cortos, hagamos lo mismo»', func: 'Superviviente: no se ve a los que hicieron igual y fracasaron', opts: ['Superviviente: no se ve a los que hicieron igual y fracasaron', 'Anclaje: la cifra de las vistas', 'Halo: el nombre del canal', 'Costo hundido: lo ya publicado'] },
  { trans: '«Llevamos setecientas horas, no vamos a tirarlas ahora»', func: 'Costo hundido: lo gastado no vuelve y no es un argumento', opts: ['Costo hundido: lo gastado no vuelve y no es un argumento', 'Aversión a la pérdida: el plazo que vence', 'Confirmación: el dato que encaja', 'Disponibilidad: lo más reciente'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Se siguió un año más con algo que ya no servía', characteristic: 'Costo hundido: se contaron las horas gastadas como razón', opts: ['Costo hundido: se contaron las horas gastadas como razón', 'Anclaje: el primer número era alto', 'Halo: el proveedor tenía buen nombre', 'Disponibilidad: hubo una queja fuerte'] },
  { disease: 'Se cerró el trato en la cifra que propuso el otro', characteristic: 'Anclaje: nunca se calculó el número propio antes', opts: ['Anclaje: nunca se calculó el número propio antes', 'Confirmación: se preguntó a los propios', 'Superviviente: se copió a quien ganó', 'Exceso de confianza: se estimó de más'] },
  { disease: 'Todos los que opinaron dijeron que iba muy bien, y el uso bajaba', characteristic: 'Confirmación: solo se le preguntó a quien ya lo usaba', opts: ['Confirmación: solo se le preguntó a quien ya lo usaba', 'Halo: los que opinaron eran conocidos', 'Anclaje: la primera opinión pesó de más', 'Costo hundido: ya se había publicado'] },
  { disease: 'Se rediseñó el proyecto entero por un solo comentario', characteristic: 'Disponibilidad: el caso ruidoso se confundió con el frecuente', opts: ['Disponibilidad: el caso ruidoso se confundió con el frecuente', 'Aversión a la pérdida: se temía perder a esa persona', 'Halo: quien se quejó tenía prestigio', 'Anclaje: la queja fue la primera'] },
  { disease: 'Se firmó un convenio que leído con calma no convenía', characteristic: 'Halo: el prestigio de la institución tapó las condiciones', opts: ['Halo: el prestigio de la institución tapó las condiciones', 'Superviviente: otros lo habían firmado', 'Costo hundido: ya se habían hecho reuniones', 'Disponibilidad: se recordaba un caso bueno'] },
  { disease: 'La ruta que iba a estar en un mes tardó cinco', characteristic: 'Exceso de confianza: se estimó sin mirar el historial propio', opts: ['Exceso de confianza: se estimó sin mirar el historial propio', 'Confirmación: se buscó quien dijera que sí', 'Anclaje: alguien dijo un mes primero', 'Aversión a la pérdida: no se quiso soltar'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'El primer número que se escucha fija el terreno.', type: 'Anclaje' },
  { s: 'Se busca solo lo que encaja con lo que ya se creía.', type: 'Confirmación' },
  { s: 'Perder duele más que ganar lo mismo.', type: 'Aversión a la pérdida' },
  { s: 'Lo ruidoso se confunde con lo frecuente.', type: 'Disponibilidad' },
  { s: 'Bueno en una cosa parece bueno en todo.', type: 'Halo' },
  { s: 'Se sigue por lo ya invertido, que no vuelve.', type: 'Costo hundido' },
  { s: 'Se estima con el mejor día imaginable.', type: 'Exceso de confianza' },
  { s: 'Solo se ve a los que ganaron.', type: 'Superviviente' },
  { s: 'Se aplica desde fuera y a propósito.', type: 'Palanca' },
  { s: 'Se contesta a solas y sin plazo encima.', type: 'Decisión en frío' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Seguir por las horas invertidas', gen: 'Origen', n: 'Adentro', g: 'Sesgo', t: 'Nadie lo aplica' },
  { w: 'Un plazo que vence el viernes', gen: 'Origen', n: 'Afuera', g: 'Palanca', t: 'Alguien la aplica' },
  { w: 'Recordar la queja más ruidosa', gen: 'Origen', n: 'Adentro', g: 'Sesgo', t: 'Nadie lo aplica' },
  { w: 'Un favor previo que obliga', gen: 'Origen', n: 'Afuera', g: 'Palanca', t: 'Alguien la aplica' },
  { w: '«Vale 200.000, te doy 80.000»', gen: 'Sesgo', n: 'Cifra', g: 'Anclaje', t: 'El primer número manda' },
  { w: '«Ya metí setecientas horas»', gen: 'Sesgo', n: 'Pasado', g: 'Costo hundido', t: 'Lo gastado no vuelve' },
  { w: 'Preguntar a quien ya lo usa', gen: 'Dato', n: 'Cómodo', g: 'Confirma', t: 'Solo puede salir un sí' },
  { w: 'Llamar a tres que lo dejaron', gen: 'Dato', n: 'Incómodo', g: 'Contradice', t: 'Ahí está la respuesta útil' },
  { w: 'Escrito antes de hablar con nadie', gen: 'Momento', n: 'Frío', g: 'En frío', t: 'Sin presión encima' },
  { w: 'De noche y con alguien esperando', gen: 'Momento', n: 'Caliente', g: 'En caliente', t: 'El cerebro toma atajos' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'El sesgo que fija el terreno con el primer número es el ___.', opts: ['anclaje', 'halo', 'ruido'], ans: 'anclaje' },
  { s: 'Un sesgo viene de dentro; una ___ la aplica otro.', opts: ['palanca', 'oferta', 'prueba'], ans: 'palanca' },
  { s: 'Buscar solo lo que encaja es el sesgo de ___.', opts: ['confirmación', 'halo', 'pérdida'], ans: 'confirmación' },
  { s: 'Lo ya invertido y que no vuelve es el costo ___.', opts: ['hundido', 'fijo', 'medio'], ans: 'hundido' },
  { s: 'Perder duele más que ganar: aversión a la ___.', opts: ['pérdida', 'espera', 'duda'], ans: 'pérdida' },
  { s: 'Bueno en una cosa parece bueno en todas: sesgo del ___.', opts: ['halo', 'cero', 'ancla'], ans: 'halo' },
  { s: 'Copiar solo a los que ganaron es el sesgo del ___.', opts: ['superviviente', 'ganador', 'optimista'], ans: 'superviviente' },
  { s: 'La decisión que importa se escribe ___ de hablar con nadie.', opts: ['antes', 'después', 'mientras'], ans: 'antes' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica con tus palabras la diferencia entre un sesgo y una palanca, con un ejemplo del proyecto.', ans: 'La palanca la aplica otro a propósito y viene de fuera: un plazo que vence el viernes, un favor previo, una autoridad prestada. Se defiende nombrándola en voz alta, que fue lo de la etapa 1. El sesgo viene de dentro y no tiene culpable: el cerebro toma el atajo solo, antes de que llegue nadie. Por eso no se defiende reconociendo a una persona, sino con un procedimiento escrito de antemano. Lo peligroso es la combinación: la urgencia de una oferta funciona porque ya existe la aversión a la pérdida, así que quien tapa el sesgo deja la palanca sin dónde agarrarse.' },
  { q: '¿Qué es el anclaje y cómo se desmonta cuando alguien ya puso el primer número?', ans: 'El anclaje es que la primera cifra que se escucha fija el terreno de toda la conversación: a partir de ahí ya no se discute cuánto vale la cosa, sino cuánto se baja desde ese número, y el regateo se siente como una victoria aunque se cierre donde el otro quería. Se desmonta con una pregunta de cinco palabras, «¿de dónde salió esa cifra?», y con una regla: el número propio se calcula en casa, antes de la reunión, y se saca diciendo en voz alta que el número del otro no es el mío. Si el número propio no está escrito antes, el ajeno gana siempre.' },
  { q: 'Setecientas horas en el motor de misiones y aparece una plataforma que hace el 80% por 30 dólares al mes. ¿Cómo se decide sin costo hundido?', ans: 'Las setecientas horas ya se gastaron y no vuelven, se decida lo que se decida, así que meterlas en la balanza no protege la inversión: añade horas nuevas a las perdidas. La pregunta correcta es «si empezara hoy desde cero, ¿qué elegiría?». Y la respuesta puede ser perfectamente seguir con el motor propio, porque hay razones buenas que no dependen de lo gastado: control total, funciona sin internet, no depende de que un servicio siga existiendo ni suba de precio. Lo que no vale como razón es «ya invertí mucho».' },
  { q: '¿Por qué preguntarle a las maestras que ya usan M.E.T.A.S da una respuesta engañosa?', ans: 'Porque es sesgo de confirmación: se busca información justo donde solo puede salir un sí. Las que abrieron una misión una vez y no volvieron son las que tienen la respuesta útil, y son exactamente a las que no se les pregunta, porque esa conversación incomoda. El antídoto es la pregunta «¿qué dato me haría cambiar de opinión, y dónde lo busco?». En este caso concreto: hablar con tres maestras que dejaron de usarlo. Una hora de esas conversaciones vale más que veinte felicitaciones.' },
  { q: 'Explica el sesgo del superviviente y por qué es peligroso al copiar tácticas de otros proyectos.', ans: 'Se ve al canal que llegó al millón de vistas y no a los cuatrocientos que hicieron exactamente lo mismo y desaparecieron, porque los que fracasan no publican su fracaso. La muestra que uno mira está formada solo por ganadores, así que cualquier cosa que hayan hecho parece la causa del éxito. La pregunta que lo desactiva es «¿cuántos hicieron esto mismo y no funcionó?». Si no se puede responder, la táctica no está probada: está contada. Lo que sí se puede copiar es el método verificable, no el resultado.' },
  { q: 'Escribe las cinco preguntas de la hoja en frío y di para qué sirve cada una.', ans: '1) «¿De dónde salió ese número?», contra el anclaje: devuelve el terreno y obliga a sacar el número propio. 2) «¿Qué dato me haría cambiar de opinión?», contra la confirmación: si no hay ninguno, no se está razonando, se está defendiendo algo ya decidido. 3) «Si empezara hoy desde cero, ¿elegiría esto?», contra el costo hundido: lo gastado no cuenta. 4) «¿Cuántos casos hay de esto, sobre cuántos en total?», contra la disponibilidad: el ruido no es la frecuencia. 5) «Si no tuviera fecha, ¿lo aceptaría igual?», contra la aversión a la pérdida: si la respuesta es no, no se está aceptando, se está huyendo.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['ANCLAJE', 'SESGO', 'HALO', 'ATAJO', 'FRIO', 'CERO']),
  haceSopa(10, ['PERDIDA', 'HUNDIDO', 'ESPEJO', 'RUIDO', 'DATO', 'ANTES']),
  haceSopa(10, ['CONFIRMA', 'PRUEBA', 'COSTO', 'NUMERO', 'DUDA', 'HOJA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Un sesgo es un error que solo comete la gente que no piensa.', a: false },
  { q: 'Un sesgo es un atajo del cerebro que muchas veces acierta.', a: true },
  { q: 'El sesgo viene de dentro y la palanca la aplica otro.', a: true },
  { q: 'El anclaje se desactiva regateando hasta bajar bastante.', a: false },
  { q: 'El primer número que se dice fija el terreno de la conversación.', a: true },
  { q: 'Lo ya invertido es una buena razón para seguir.', a: false },
  { q: 'Perder duele alrededor del doble de lo que alegra ganar lo mismo.', a: true },
  { q: 'Una queja ruidosa demuestra que el problema es frecuente.', a: false },
  { q: 'El prestigio de quien propone dice si el trato conviene.', a: false },
  { q: 'Los que fracasaron con una táctica casi nunca publican su fracaso.', a: true },
  { q: 'Estimar mirando el historial propio compensa el exceso de confianza.', a: true },
  { q: 'Una decisión importante se puede tomar cansado si se tiene experiencia.', a: false },
  { q: 'La decisión que importa se escribe antes de la primera conversación.', a: true },
  { q: 'Casi toda palanca se apoya en un sesgo que ya estaba ahí.', a: true },
  { q: 'Un sesgo se puede apagar del todo si uno se esfuerza.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Qué es un sesgo?', o: ['a) Una opinión mal formada', 'b) Una técnica de manipulación', 'c) Un atajo del cerebro que ahorra energía', 'd) Un error de cálculo'], a: 2 },
  { q: '«Vale 200.000, te lo dejo en 80.000» usa…', o: ['a) Anclaje', 'b) Halo', 'c) Disponibilidad', 'd) Costo hundido'], a: 0 },
  { q: 'El antídoto del costo hundido es…', o: ['a) Calcular lo invertido', 'b) Esperar a recuperarlo', 'c) Pedir otra opinión', 'd) Preguntarse qué se elegiría empezando hoy'], a: 3 },
  { q: 'Preguntarle solo a quien ya usa el proyecto es…', o: ['a) Anclaje', 'b) Confirmación', 'c) Halo', 'd) Superviviente'], a: 1 },
  { q: '¿Por qué funciona un plazo que vence el viernes?', o: ['a) Por el sesgo del halo', 'b) Por el anclaje', 'c) Por la aversión a la pérdida', 'd) Por la disponibilidad'], a: 2 },
  { q: 'Copiar al canal del millón de vistas es sesgo del…', o: ['a) Superviviente', 'b) Halo', 'c) Anclaje', 'd) Costo hundido'], a: 0 },
  { q: 'Una queja ruidosa contra cuarenta usos callados es…', o: ['a) Confirmación', 'b) Exceso de confianza', 'c) Disponibilidad', 'd) Anclaje'], a: 2 },
  { q: 'Que una institución seria proponga algo malo y suene bien es…', o: ['a) Halo', 'b) Anclaje', 'c) Superviviente', 'd) Disponibilidad'], a: 0 },
  { q: '¿Cuál es la diferencia entre sesgo y palanca?', o: ['a) La palanca es involuntaria', 'b) El sesgo es más grave', 'c) No hay diferencia real', 'd) El sesgo viene de dentro, la palanca de fuera'], a: 3 },
  { q: '¿Qué pregunta desactiva el anclaje?', o: ['a) ¿Cuánto es lo mínimo?', 'b) ¿De dónde salió esa cifra?', 'c) ¿Puedo pensarlo?', 'd) ¿Quién más lo aceptó?'], a: 1 },
  { q: '¿Cuándo NO se decide algo que importa?', o: ['a) Con la hoja de las cinco preguntas', 'b) Por la mañana y con tiempo', 'c) Cansado y con alguien esperando', 'd) Después de escribir el número propio'], a: 2 },
  { q: 'Calcular que seis etapas salen en un mes es…', o: ['a) Disponibilidad', 'b) Confirmación', 'c) Halo', 'd) Exceso de confianza'], a: 3 },
  { q: '¿Qué se hace si el otro ya puso el primer número?', o: ['a) Decir que ese número es suyo y sacar el propio', 'b) Negociar a partir de ahí', 'c) Aceptar si el descuento es bueno', 'd) Pedir tiempo y volver con la mitad'], a: 0 },
  { q: 'La prueba de que la etapa está aprendida es…', o: ['a) Saber los ocho nombres', 'b) Reconocer los sesgos ajenos', 'c) Haberse cazado a uno mismo y haberlo apuntado', 'd) Haber leído la ficha'], a: 2 },
  { q: '¿Qué significa decidir en frío?', o: ['a) Decidir rápido para no dudar', 'b) Separar el momento de escuchar del de decidir', 'c) Decidir sin sentimientos', 'd) Decidir siempre que no'], a: 1 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'El sesgo que fija el terreno con el primer número es el ___.', a: 'anclaje' },
  { q: 'Un sesgo viene de dentro; una ___ la aplica otro.', a: 'palanca' },
  { q: 'Buscar solo lo que encaja es el sesgo de ___.', a: 'confirmación' },
  { q: 'Lo ya invertido y que no vuelve es el costo ___.', a: 'hundido' },
  { q: 'Perder duele más que ganar: aversión a la ___.', a: 'pérdida' },
  { q: 'Confundir lo ruidoso con lo frecuente es el sesgo de ___.', a: 'disponibilidad' },
  { q: 'Bueno en una cosa parece bueno en todas: sesgo del ___.', a: 'halo' },
  { q: 'Copiar solo a los que ganaron es el sesgo del ___.', a: 'superviviente' },
  { q: 'Estimar con el mejor día imaginable es exceso de ___.', a: 'confianza' },
  { q: 'La decisión que importa se escribe ___ de hablar con nadie.', a: 'antes' },
  { q: 'La hoja de la decisión en frío tiene ___ preguntas.', a: 'cinco' },
  { q: 'Si empezara hoy desde ___, ¿elegiría esto?', a: 'cero' },
  { q: 'El primer número lo debe poner ___.', a: 'uno' },
  { q: 'Nada que importe se decide ___ ni con alguien esperando.', a: 'cansado' },
  { q: 'Un sesgo no se apaga: se ___.', a: 'compensa' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Sesgo', def: 'Un atajo del cerebro que ahorra energía y a veces acierta' },
  { term: 'Palanca', def: 'La que aplica otro a propósito, desde fuera' },
  { term: 'Anclaje', def: 'El primer número fija el terreno de la conversación' },
  { term: 'Confirmación', def: 'Buscar solo lo que encaja con lo que ya se creía' },
  { term: 'Aversión a la pérdida', def: 'Perder duele más que ganar lo mismo' },
  { term: 'Disponibilidad', def: 'Lo que se recuerda con fuerza parece más probable' },
  { term: 'Halo', def: 'Bueno en una cosa parece bueno en todas' },
  { term: 'Costo hundido', def: 'Seguir por lo ya invertido, que no vuelve' },
  { term: 'Exceso de confianza', def: 'Estimar con el mejor día imaginable' },
  { term: 'Superviviente', def: 'Solo se ve a los que ganaron' },
  { term: 'Decidir en frío', def: 'Separar el momento de escuchar del de decidir' },
  { term: 'La pregunta del origen', def: '¿De dónde salió ese número?' },
  { term: 'La pregunta del cambio', def: '¿Qué dato me haría cambiar de opinión?' },
  { term: 'La pregunta del cero', def: 'Si empezara hoy, ¿elegiría esto?' },
  { term: 'El primer número', def: 'Quien lo dice fija el terreno' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Un inversionista abre la reunión así: «esto vale 200.000 lempiras, y te doy 80.000 por el 40%». Nadie ha calculado antes cuánto vale el proyecto.' },
  { txt: 'Llevas setecientas horas en el motor de misiones y aparece una plataforma que hace el 80% de lo mismo por 30 dólares al mes.' },
  { txt: 'Se propone copiar la táctica de un canal educativo que llegó al millón de vistas: vídeos cortos, títulos llamativos y publicar a diario.' },
  { txt: 'Para saber si el proyecto va bien, se le pregunta a las maestras que usan M.E.T.A.S todas las semanas.' },
  { txt: 'Una institución ofrece un convenio y avisa de que el presupuesto se cierra el viernes, así que hay que contestar antes.' },
  { txt: 'Una maestra se queja fuerte de que una misión no le sirvió. Ese mismo mes hubo cuarenta usos sin ningún comentario.' },
  { txt: 'Una institución muy conocida propone un convenio cuyas condiciones, leídas con calma, no convienen al proyecto.' },
  { txt: 'Al planear una ruta nueva se calcula que las seis etapas estarán construidas en cuatro semanas.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué sesgo está trabajando por debajo de esta decisión?',
  '2. ¿Qué información falta en la mesa, y quién la tiene?',
  '3. Escribe en 3-4 frases la pregunta que harías antes de contestar.',
  '4. ¿Qué decidirías si empezaras hoy desde cero y sin plazo?',
]);

B.critCaseGuides = JSON.stringify([
  'Nombrar el sesgo es la mitad del trabajo: anclaje si hay una cifra ajena, costo hundido si se cuenta lo ya gastado, confirmación si solo se consultó a los propios, halo si pesa el nombre de quien propone.',
  'Casi siempre falta el dato incómodo: los que probaron y fracasaron, los que dejaron de usarlo, el número real sobre el total, o el cálculo propio que nadie hizo antes de la reunión.',
  'La pregunta se escribe, no se improvisa. Las cinco de la hoja cubren casi todo: de dónde salió el número, qué dato me haría cambiar, si empezaría hoy, cuántos casos sobre cuántos, y si lo aceptaría sin fecha.',
  'Quitar el plazo y lo invertido deja ver la decisión desnuda. Si sin presión la respuesta cambia, entonces la presión estaba decidiendo, no los hechos.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Bajaron de doscientos mil a sesenta mil, así que salimos ganando".', g1: 'Los doscientos mil no salieron de ningún cálculo: los puso quien compra, y todo el regateo ocurrió dentro de su terreno.', g2: 'El número propio se calcula en casa antes de la reunión. Sin él, el descuento se siente victoria y se cierra donde el otro quería.' },
  { txt: '"Llevamos setecientas horas, sería tirar todo eso a la basura".', g1: 'Las horas ya se gastaron y no vuelven, se decida lo que se decida. Contarlas solo añade horas nuevas a las perdidas.', g2: 'La pregunta es qué se elegiría empezando hoy desde cero. Puede que la respuesta sea seguir, pero por control y por funcionar sin internet, no por lo gastado.' },
  { txt: '"Todas las maestras a las que preguntamos dicen que va muy bien".', g1: 'Se preguntó donde solo podía salir un sí. Las que abrieron una vez y no volvieron tienen la respuesta útil y nadie las llamó.', g2: 'Se anota qué dato haría cambiar de opinión y se sale a buscarlo: tres conversaciones con quien lo dejó valen más que veinte felicitaciones.' },
  { txt: '"Hay que cambiarlo todo, porque una maestra se quejó muchísimo".', g1: 'Lo ruidoso no es lo frecuente: una queja vívida pesa más que cuarenta usos callados, y el proyecto termina cambiando por el caso más sonoro.', g2: 'La queja se atiende siempre, porque puede tener razón. Lo que no se hace es rediseñar sin mirar cuántos casos hay sobre cuántos en total.' },
  { txt: '"Es una institución muy seria, el convenio seguro que conviene".', g1: 'El prestigio dice cómo son en lo suyo, no si este trato concreto conviene. Lo bueno en una cosa se contagia a todas sin motivo.', g2: 'Se lee la propuesta con el nombre tapado y se pregunta si se aceptaría igual viniendo de un desconocido.' },
  { txt: '"Las seis etapas salen en un mes, ya le agarré el ritmo".', g1: 'Se está estimando con el mejor día imaginable: sin cortes de luz, sin fichas que rehacer, sin domingos que se van en otra cosa.', g2: 'Se mira el historial propio: si la etapa anterior tomó tres tandas, esta va a tomar tres. El antídoto no es el pesimismo, es el dato.' },
]);

B.critDecisionBank = JSON.stringify([
  'Un inversionista abre con «vale 200.000, te doy 80.000 por el 40%»: ¿qué se hace antes de responder cualquier cifra?',
  'Aparece una plataforma que hace el 80% del motor por 30 dólares al mes: ¿cómo se decide sin contar las setecientas horas?',
  'Se propone copiar al canal del millón de vistas: ¿qué hay que averiguar antes de imitar la táctica?',
  'Todas las maestras consultadas dicen que va bien y el uso baja: ¿a quién hay que llamar?',
  'El convenio se cae si no se firma el viernes: ¿qué pregunta se contesta primero?',
  'Una queja muy fuerte contra cuarenta usos callados: ¿qué se mira antes de cambiar nada?',
  'Una institución conocida propone condiciones que no convienen: ¿cómo se lee la propuesta?',
  'Se calcula que la ruta nueva sale en un mes: ¿de dónde se saca la estimación buena?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Llegar a la reunión con el valor del proyecto ya calculado y escrito.', b: 'Llegar a escuchar la oferta y ver qué cifra proponen.', ga: 'Caso A: el terreno es propio y el número del otro se puede nombrar como ajeno.', gb: 'Caso B: el primer número que se escuche va a decidir toda la conversación, y el regateo va a parecer una victoria.' },
  { a: 'Hablar con tres maestras que dejaron de usar M.E.T.A.S.', b: 'Hablar con las tres que lo usan todas las semanas.', ga: 'Caso A: ahí está el dato que puede cambiar la decisión, aunque la conversación incomode.', gb: 'Caso B: se busca información donde solo puede salir un sí, y se confunde con una medición.' },
  { a: 'Estimar la ruta nueva mirando cuánto tardó la anterior.', b: 'Estimar la ruta nueva pensando en un mes de trabajo seguido.', ga: 'Caso A: el historial propio es el único dato honesto que hay sobre uno mismo.', gb: 'Caso B: se estima con el mejor día imaginable y después se explica el retraso con imprevistos que siempre ocurren.' },
  { a: 'Contestar «lo veo y te digo mañana» y responder la hoja de las cinco.', b: 'Contestar en la reunión porque el presupuesto se cierra el viernes.', ga: 'Caso A: si el plazo era real, un día no lo rompe; si lo rompe, dependía de que no lo pensaras.', gb: 'Caso B: se decide con aversión a la pérdida y con alguien esperando, que es la peor combinación posible.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se entra a negociar sin el número propio calculado.', guide: 'La primera cifra del otro fija el terreno y todo lo demás es regateo dentro de su marco. El descuento se sentirá como victoria.' },
  { cause: 'Se cuentan las horas invertidas como razón para seguir.', guide: 'Es costo hundido: lo gastado no vuelve y meterlo en la balanza solo añade pérdidas nuevas. La pregunta correcta es qué se elegiría hoy desde cero.' },
  { cause: 'Se consulta solo a quien ya usa el proyecto.', guide: 'Sesgo de confirmación: se busca donde solo puede salir un sí, y el dato útil está en quien dejó de usarlo.' },
  { cause: 'Se rediseña por el comentario más ruidoso.', guide: 'Disponibilidad: lo vívido se confunde con lo frecuente. Antes de cambiar, cuántos casos hay sobre cuántos en total.' },
  { cause: 'Se acepta un plazo corto sin preguntarse si es real.', guide: 'Aversión a la pérdida: no se está aceptando la oferta, se está huyendo de perderla. Un día de espera lo revela.' },
  { cause: 'Se estima el trabajo sin mirar cuánto tardó lo anterior.', guide: 'Exceso de confianza: se planifica con el mejor día imaginable, y después el retraso se explica con imprevistos que siempre ocurren.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La reunión empezó con el número propio sobre la mesa.', guide: 'El anclaje quedó desactivado antes de existir: quien pone la primera cifra fija el terreno, y esta vez fue el que construyó.' },
  { effect: 'Se soltó una función en la que había mucho trabajo metido.', guide: 'Se decidió mirando qué convenía de aquí en adelante y no lo gastado. Eso es exactamente vencer el costo hundido.' },
  { effect: 'Tres conversaciones incómodas cambiaron el rumbo del proyecto.', guide: 'Se fue a buscar el dato que podía contradecir, en vez del que iba a confirmar. Es la hora mejor invertida del mes.' },
  { effect: 'Se atendió la queja sin rediseñar el proyecto entero.', guide: 'Se miró cuántos casos había sobre el total. La queja tenía parte de razón y aun así no era la regla.' },
  { effect: 'Se pidió un día para contestar y el plazo resultó flexible.', guide: 'Casi todos los plazos lo son. El que no lo es, casi siempre dependía de que no lo pensaras.' },
  { effect: 'La ruta se planificó en tres tandas y salió en tres tandas.', guide: 'Se estimó con el historial propio en la mano. El antídoto del exceso de confianza es un dato, no una actitud.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '⚓', label: 'Anclaje', text: 'El <strong>primer número</strong> fija el terreno. <strong>Gatillo:</strong> alguien dice una cifra antes que tú. <strong>Por dentro:</strong> todo lo demás se juzga como distancia a ese número. <strong>Antídoto:</strong> «¿de dónde salió esa cifra?», y sacar la propia, calculada antes.' },
  { y: '2', icon: '🔍', label: 'Confirmación', text: 'Se ve <strong>lo que encaja</strong> con lo que ya se creía. <strong>Gatillo:</strong> tener ya una opinión. <strong>Por dentro:</strong> se busca donde solo puede salir un sí. <strong>Antídoto:</strong> «¿qué dato me haría cambiar de opinión?», y salir a buscarlo.' },
  { y: '3', icon: '😰', label: 'Aversión a la pérdida', text: 'Perder duele el <strong>doble</strong> de lo que alegra ganar. <strong>Gatillo:</strong> un plazo o una amenaza de quedarse sin algo. <strong>Por dentro:</strong> se decide huyendo, no eligiendo. <strong>Antídoto:</strong> «si no tuviera fecha, ¿lo aceptaría igual?».' },
  { y: '4', icon: '📢', label: 'Disponibilidad', text: 'Lo que se <strong>recuerda con fuerza</strong> parece más probable. <strong>Gatillo:</strong> un caso vívido o reciente. <strong>Por dentro:</strong> el ruido se confunde con la frecuencia. <strong>Antídoto:</strong> «¿cuántos casos hay, sobre cuántos en total?».' },
  { y: '5', icon: '✨', label: 'Halo', text: 'Bueno en una cosa, <strong>bueno en todas</strong>. <strong>Gatillo:</strong> un nombre con prestigio. <strong>Por dentro:</strong> la reputación tapa las condiciones concretas. <strong>Antídoto:</strong> leer la propuesta con el nombre tapado.' },
  { y: '6', icon: '🕳️', label: 'Costo hundido', text: 'Seguir por <strong>lo ya invertido</strong>. <strong>Gatillo:</strong> mucho tiempo o dinero metido. <strong>Por dentro:</strong> se añaden pérdidas nuevas a las viejas. <strong>Antídoto:</strong> «si empezara hoy desde cero, ¿elegiría esto?».' },
  { y: '7', icon: '📅', label: 'Exceso de confianza', text: 'Estimar con el <strong>mejor día imaginable</strong>. <strong>Gatillo:</strong> planificar sin datos. <strong>Por dentro:</strong> se olvidan los imprevistos que siempre ocurren. <strong>Antídoto:</strong> «¿cuánto tardó de verdad la última vez?».' },
  { y: '8', icon: '🏆', label: 'Superviviente', text: 'Solo se ve a los que <strong>ganaron</strong>. <strong>Gatillo:</strong> un caso de éxito muy visible. <strong>Por dentro:</strong> los que fracasaron no publican su fracaso. <strong>Antídoto:</strong> «¿cuántos hicieron esto mismo y no funcionó?».' },
]);

B.parteData = JSON.stringify({
  anclaje: {
    nombre: 'El anclaje', icon: '⚓',
    estructura: { title: 'Qué es', info: '• El <strong>primer número</strong> que se escucha fija el terreno<br>• Todo lo que viene después se mide como distancia a esa cifra<br>• Funciona igual con precios, plazos y porcentajes' },
    funcion: { title: 'Cómo se dispara', info: '• Alguien dice una cifra antes que tú<br>• La conversación pasa de «cuánto vale» a <strong>«cuánto se baja»</strong><br>• El descuento conseguido se siente como una victoria propia' },
    enfermedades: { title: 'Dónde se ve en el proyecto', info: '• El inversionista que abre con 200.000 y ofrece 80.000<br>• El patrocinador que dice cuánto suele pagar «en estos casos»<br>• La primera estimación de horas que alguien suelta en una reunión' },
    cuidados: { title: 'El antídoto', info: '• Preguntar <strong>«¿de dónde salió esa cifra?»</strong><br>• Calcular el número propio en casa, antes de la reunión<br>• Decir en voz alta «ese número es tuyo» y sacar el propio' },
  },
  confirmacion: {
    nombre: 'La confirmación', icon: '🔍',
    estructura: { title: 'Qué es', info: '• Se busca y se recuerda <strong>lo que encaja</strong> con lo que ya se creía<br>• Lo que contradice se mira por encima o se explica<br>• No es mala fe: es economía de esfuerzo' },
    funcion: { title: 'Cómo se dispara', info: '• Basta con tener ya una opinión formada<br>• Se elige la fuente que va a decir que sí<br>• Se cuenta lo que confirma y se olvida contar lo demás' },
    enfermedades: { title: 'Dónde se ve en el proyecto', info: '• Preguntar solo a las maestras que ya usan M.E.T.A.S<br>• Leer los comentarios buenos y saltarse los tibios<br>• Medir el éxito por las felicitaciones y no por el uso' },
    cuidados: { title: 'El antídoto', info: '• <strong>«¿Qué dato me haría cambiar de opinión?»</strong><br>• Ir a buscar ese dato a propósito, aunque incomode<br>• Hablar con tres que lo dejaron: valen más que veinte que aplauden' },
  },
  perdida: {
    nombre: 'La aversión a la pérdida', icon: '😰',
    estructura: { title: 'Qué es', info: '• Perder duele <strong>alrededor del doble</strong> de lo que alegra ganar lo mismo<br>• Por eso se prefiere no perder antes que ganar<br>• Es el motor de casi toda la urgencia comercial' },
    funcion: { title: 'Cómo se dispara', info: '• Un plazo que vence<br>• La idea de que otro se lo va a llevar<br>• Cualquier frase con la forma <strong>«si no lo tomas ahora…»</strong>' },
    enfermedades: { title: 'Dónde se ve en el proyecto', info: '• «El presupuesto se cierra el viernes»<br>• No soltar una función que nadie usa, por si acaso<br>• Aceptar un convenio flojo para no quedarse sin ninguno' },
    cuidados: { title: 'El antídoto', info: '• <strong>«Si no tuviera fecha, ¿lo aceptaría igual?»</strong><br>• Pedir un día: casi todos los plazos resisten un día<br>• Si el plazo no resiste, dependía de que no lo pensaras' },
  },
  hundido: {
    nombre: 'El costo hundido', icon: '🕳️',
    estructura: { title: 'Qué es', info: '• Seguir por <strong>lo ya invertido</strong> en vez de por lo que conviene<br>• Lo gastado no vuelve, se decida lo que se decida<br>• Cuanto más se lleva metido, más fuerte tira' },
    funcion: { title: 'Cómo se dispara', info: '• Mucho tiempo, dinero o cariño puesto en algo<br>• La idea de «tirar a la basura» lo hecho<br>• Tener que explicarle a otro por qué se cambia de rumbo' },
    enfermedades: { title: 'Dónde se ve en el proyecto', info: '• Las setecientas horas del motor de misiones<br>• Sostener una ruta que nadie de la casa está estudiando<br>• Mantener una herramienta propia solo porque costó hacerla' },
    cuidados: { title: 'El antídoto', info: '• <strong>«Si empezara hoy desde cero, ¿elegiría esto?»</strong><br>• Listar las razones que NO dependen de lo gastado<br>• Si quedan razones buenas, se sigue; si no, se suelta y se anota la fecha' },
  },
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

const textos = [
  [/📈 \*Ruta de la Marca · Etapa 1\* 📈/g, '🪞 *Ruta de la Persuasión · Etapa 2* 🪞'],
  [/Para quién y qué le cambia: audiencia y promesa antes que el logo, con los ocho casos del proyecto\. 🎯/g, 'Los ocho sesgos que deciden por ti antes de que llegue nadie, y la hoja para decidir en frío. 🪞'],
  [/_Incluye evaluación conceptual y prueba de la promesa\._ ✍️/g, '_Incluye evaluación conceptual y la sala de espejos._ ✍️'],
  [/Ruta de la Marca · Etapa 1: Para quién y qué le cambia/g, 'Ruta de la Persuasión · Etapa 2: Sesgos, los atajos que deciden por ti'],
  [/Prueba de la promesa/g, 'La sala de espejos'],
  [/prueba de la promesa/g, 'la sala de espejos'],
  [/Para quién y qué le cambia/g, 'Sesgos, los atajos que deciden por ti'],
  [/para quién y qué le cambia/g, 'los atajos que deciden por ti'],
  [/Ruta de la Marca/g, 'Ruta de la Persuasión'],
  [/mapa de la marca/g, 'mapa de los sesgos'],
  [/📈 ¡/g, '🪞 ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
