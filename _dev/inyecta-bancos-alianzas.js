/* Inyecta los bancos de la misión «Alianzas, patronato y comunidad» (Ruta del
   Poder Político, etapa 4) sobre el molde copiado de la etapa 3, y de paso
   cambia los rótulos que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-alianzas.js

   La etapa 1 dibujó quién decide, la 2 qué papel hace falta y la 3 cómo se
   negocia una mesa. Aquí aparecen los que no salen en el organigrama y
   deciden igual: el patronato, los padres, la iglesia y el comercio pequeño.
   La prueba de la etapa es que aliado es quien sigue diciendo que sí cuando
   cambia el director, y la regla corta es que lo que no está en el acta no
   pasó.                                                                     */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-politica-alianzas', 'js', 'alianzas.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260804;
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

B.SAVE_KEY = `'faro_pol_alianzas_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de las alianzas superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de las alianzas explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de aliados experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la alianza maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la comunidad' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 4 de la Ruta del Poder Político completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Confía en el apretón de manos 🫱' },
  { t: 25, n: 'Pregunta qué gana el otro 🎁' },
  { t: 55, n: 'Distingue al aliado del entusiasta 🎉' },
  { t: 90, n: 'Pide el punto de acta 📖' },
  { t: 130, n: 'Prueba en pequeño y con fecha 📅' },
  { t: 165, n: 'Deja dos personas enteradas por lado 🫂' },
  { t: 200, n: 'Su alianza aguanta el cambio de junta 🏘️' },
]);

B.fcData = JSON.stringify([
  { w: 'Una alianza', a: '🫂 Un acuerdo entre <strong>personas que un día se van</strong>. Por eso la prueba no es lo bien que va hoy: es si sigue en pie cuando cambia el director.' },
  { w: 'La señal de alarma', a: '🚨 <strong>Cuando la alianza solo existe en la cabeza de dos personas.</strong> Sin papel y sin nadie más enterado, no hay alianza: hay una amistad útil.' },
  { w: 'La regla del acta', a: '📖 En un patronato, <strong>lo que no está en el acta no pasó</strong>. Pedirlo no ofende: es exactamente lo que la junta hace con todo lo demás.' },
  { w: 'El aliado de acceso', a: '🚪 Te abre una puerta que estaba cerrada: una directora, un presidente de patronato. Vale mucho y <strong>se va con la persona</strong> si no queda escrito.' },
  { w: 'El aliado de manos', a: '✋ Trabaja contigo: la maestra que prueba las fichas, el joven que imprime. Es <strong>el más escaso y el que menos se agradece</strong>.' },
  { w: 'El aliado de dinero', a: '💵 Pone recursos o materiales. Es el más fácil de contar y el más fácil de perder, porque <strong>se decide en otro presupuesto</strong>.' },
  { w: 'El aliado de nombre', a: '🏅 Te hace creíble en dos minutos. Por eso mismo es <strong>el que más caro sale si sale mal</strong>, y el que hay que mirar con más calma.' },
  { w: 'El entusiasta', a: '🎉 Dice que sí a todo, no aporta nada concreto y <strong>ocupa el sitio de un aliado real</strong>. Se descubre pidiéndole una cosa pequeña con fecha.' },
  { w: 'El patronato', a: '🏘️ La <strong>junta directiva de la comunidad</strong>: presidente, secretario, tesorero y vocales, elegidos en asamblea y con periodo fijo. Puede ceder el salón, convocar y poner algo en acta.' },
  { w: 'Lo que el patronato no puede', a: '🚫 Decidir lo que pasa <strong>dentro</strong> de la escuela, ni comprometer dinero público. Y ningún directivo puede acordar solo lo que la junta no ha visto.' },
  { w: 'La prueba en pequeño', a: '📅 Toda alianza se estrena con <strong>algo pequeño y con fecha</strong>: un taller, un mes, una actividad. Lo que no se puede probar en pequeño no se firma en grande.' },
  { w: 'Qué gana el otro', a: '🎁 Lo que él diría <strong>con sus palabras</strong>, no lo que tú supones. Si no se sabe, la alianza se apoya en una suposición y se cae sin avisar.' },
  { w: 'El relevo', a: '🔄 Que la alianza sobreviva a las personas: papel, <strong>dos personas enteradas por cada lado</strong> y una fecha de renovación para que alguien tenga que acordarse.' },
  { w: 'La comunidad', a: '🏡 Padres organizados, patronato, iglesia y comercio pequeño. <strong>No salen en el organigrama</strong> y pueden parar o empujar cualquier cosa.' },
  { w: 'La regla de la asamblea', a: '📢 Lo que se anuncia en público <strong>se cumple en público</strong>. Por eso no se anuncia nada que no esté seguro: una promesa incumplida tarda años en olvidarse.' },
  { w: 'De la foto se sale', a: '🗳️ Se acepta lo que sea <strong>de la institución</strong> y no de la campaña. De una foto se sale con el tiempo; de un acta, no, y eso vale en los dos sentidos.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Cuál es la prueba de una alianza?', o: ['a) Que vaya bien hoy', 'b) Que siga en pie cuando cambie el director', 'c) Que sea con alguien importante', 'd) Que no cueste dinero'], c: 1 },
  { q: 'La señal de alarma de esta etapa es…', o: ['a) Que pidan dinero', 'b) Que tarden en contestar', 'c) Que la alianza solo exista en la cabeza de dos personas', 'd) Que haya mucha gente'], c: 2 },
  { q: 'En un patronato, la regla corta es…', o: ['a) Manda el presidente', 'b) Lo que no está en el acta no pasó', 'c) Todo se decide en asamblea', 'd) Las decisiones son anuales'], c: 1 },
  { q: '¿Cuál es el tipo de aliado más escaso?', o: ['a) El de acceso', 'b) El de dinero', 'c) El de manos', 'd) El de nombre'], c: 2 },
  { q: '¿Cómo se descubre a un entusiasta?', o: ['a) Preguntándole por su experiencia', 'b) Pidiéndole una cosa pequeña con fecha', 'c) Mirando si viene a las reuniones', 'd) Preguntando a otros'], c: 1 },
  { q: 'Un presidente de patronato que acuerda solo algo que la junta no ha visto…', o: ['a) Compromete a la junta entera', 'b) Hace un acuerdo que dura lo que dure él', 'c) Actúa fuera de la ley', 'd) No puede hacerlo nunca'], c: 1 },
  { q: 'El aliado de nombre es peligroso porque…', o: ['a) Nunca cumple', 'b) Cobra caro', 'c) Te hace creíble rápido y sale caro si sale mal', 'd) No aporta nada'], c: 2 },
  { q: 'Toda alianza se prueba…', o: ['a) Firmando un convenio anual', 'b) Con algo pequeño y con fecha', 'c) Consultando a un abogado', 'd) Esperando a que el otro proponga'], c: 1 },
  { q: 'Para que una alianza sobreviva a las personas hacen falta…', o: ['a) Buenas relaciones', 'b) Papel, dos personas por lado y fecha de renovación', 'c) Un convenio notariado', 'd) Reuniones mensuales'], c: 1 },
  { q: 'Ante un ofrecimiento en año electoral conviene…', o: ['a) Aceptarlo entero', 'b) Rechazarlo todo', 'c) Aceptar lo que sea de la institución y no de la campaña', 'd) Esperar a después de las elecciones'], c: 2 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Aliado', 'Entusiasta'], headA: '🫂 Aliado', headB: '🎉 Entusiasta', colA: 'ok', colB: 'no',
    words: [
      { w: 'Consigue el salón para el sábado 12', t: 'ok' }, { w: 'Prueba las fichas y devuelve comentarios', t: 'ok' },
      { w: 'Pone el punto en el acta', t: 'ok' }, { w: 'Imprime cincuenta hojas el jueves', t: 'ok' },
      { w: '«Claro, hablamos»', t: 'no' }, { w: '«Cuenten conmigo para lo que sea»', t: 'no' },
      { w: '«Eso hay que hacerlo, sin duda»', t: 'no' }, { w: '«Yo los apoyo al cien por ciento»', t: 'no' },
    ],
  },
  {
    label: ['Está escrito', 'Se dijo'], headA: '📖 Escrito', headB: '🗣️ Se dijo', colA: 'ok', colB: 'no',
    words: [
      { w: 'Punto en el acta de la junta', t: 'ok' }, { w: 'Carta con sello de la dirección', t: 'ok' },
      { w: 'Mensaje guardado con la fecha', t: 'ok' }, { w: 'Nota en el archivo del centro', t: 'ok' },
      { w: 'Un apretón de manos en la puerta', t: 'no' }, { w: '«Ya quedamos la vez pasada»', t: 'no' },
      { w: 'Lo que se dijo en el pasillo', t: 'no' }, { w: 'Una promesa en la asamblea sin acta', t: 'no' },
    ],
  },
  {
    label: ['Puede el patronato', 'No puede el patronato'], headA: '✅ Puede', headB: '🚫 No puede', colA: 'ok', colB: 'no',
    words: [
      { w: 'Ceder el salón comunal', t: 'ok' }, { w: 'Convocar a los vecinos', t: 'ok' },
      { w: 'Respaldar una solicitud a la alcaldía', t: 'ok' }, { w: 'Poner un acuerdo en acta', t: 'ok' },
      { w: 'Decidir el horario de clases', t: 'no' }, { w: 'Nombrar maestros', t: 'no' },
      { w: 'Comprometer dinero público', t: 'no' }, { w: 'Cambiar lo que se enseña en el aula', t: 'no' },
    ],
  },
  {
    label: ['De la institución', 'De la persona'], headA: '🏛️ Institución', headB: '🙋 Persona', colA: 'ok', colB: 'no',
    words: [
      { w: 'Un permiso municipal por escrito', t: 'ok' }, { w: 'El salón cedido en acta', t: 'ok' },
      { w: 'Una carta con sello del centro', t: 'ok' }, { w: 'Un espacio solicitado formalmente', t: 'ok' },
      { w: 'La foto con el candidato', t: 'no' }, { w: 'El favor del amigo regidor', t: 'no' },
      { w: 'El apoyo verbal de la directora', t: 'no' }, { w: 'El transporte prestado en campaña', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['Una', 'alianza', 'es', 'un', 'acuerdo', 'entre', 'personas.'], c: 1, art: 'Lo que se prueba con el cambio de director' },
  { s: ['Lo', 'que', 'no', 'está', 'en', 'el', 'acta', 'no', 'pasó.'], c: 6, art: 'Donde vive un acuerdo de patronato' },
  { s: ['El', 'entusiasta', 'ocupa', 'el', 'sitio', 'de', 'un', 'aliado.'], c: 1, art: 'El que dice que sí a todo' },
  { s: ['El', 'patronato', 'puede', 'ceder', 'el', 'salón', 'comunal.'], c: 1, art: 'La junta directiva de la comunidad' },
  { s: ['El', 'relevo', 'hace', 'que', 'sobreviva', 'a', 'las', 'personas.'], c: 1, art: 'Dos personas enteradas por cada lado' },
  { s: ['Toda', 'alianza', 'se', 'prueba', 'en', 'pequeño.'], c: 3, art: 'Con algo concreto y con fecha' },
  { s: ['La', 'comunidad', 'no', 'sale', 'en', 'el', 'organigrama.'], c: 1, art: 'Padres, patronato, iglesia y comercio' },
  { s: ['El', 'aporte', 'dice', 'qué', 'pone', 'cada', 'uno.'], c: 1, art: 'Lo concreto que cada parte entrega' },
]);

B.cmpData = JSON.stringify([
  { s: 'Aliado es quien sigue diciendo que sí cuando cambia el ___.', opts: ['director', 'tema', 'horario'], c: 0 },
  { s: 'Lo que no está en el ___ no pasó.', opts: ['acta', 'correo', 'plan'], c: 0 },
  { s: 'Al entusiasta se le pide una cosa concreta y con ___.', opts: ['fecha', 'precio', 'testigo'], c: 0 },
  { s: 'El patronato es la junta ___ de la comunidad.', opts: ['directiva', 'escolar', 'municipal'], c: 0 },
  { s: 'El aliado de ___ es el más escaso.', opts: ['manos', 'nombre', 'dinero'], c: 0 },
  { s: 'Toda alianza se prueba en ___.', opts: ['pequeño', 'público', 'grupo'], c: 0 },
  { s: 'Hacen falta dos personas enteradas por cada ___.', opts: ['lado', 'mes', 'centro'], c: 0 },
  { s: 'De la foto se sale, del ___ no.', opts: ['acta', 'grupo', 'trato'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Aliado', 'Entusiasta'], btnA: '🫂 Aliado', btnB: '🎉 Entusiasta', colA: 'ok', colB: 'no',
    words: [
      { w: 'Consigue el salón para el día 12', t: 'ok' }, { w: 'Prueba las fichas y comenta', t: 'ok' },
      { w: 'Pone el punto en el acta', t: 'ok' }, { w: 'Imprime las hojas el jueves', t: 'ok' },
      { w: '«Claro, hablamos»', t: 'no' }, { w: '«Cuenten conmigo»', t: 'no' },
      { w: '«Eso hay que hacerlo»', t: 'no' }, { w: '«Los apoyo al cien por ciento»', t: 'no' },
    ],
  },
  {
    label: ['Está escrito', 'Se dijo'], btnA: '📖 Escrito', btnB: '🗣️ Se dijo', colA: 'ok', colB: 'no',
    words: [
      { w: 'Punto en el acta', t: 'ok' }, { w: 'Carta con sello', t: 'ok' },
      { w: 'Mensaje guardado con fecha', t: 'ok' }, { w: 'Nota en el archivo', t: 'ok' },
      { w: 'Apretón de manos', t: 'no' }, { w: '«Ya quedamos»', t: 'no' },
      { w: 'Lo del pasillo', t: 'no' }, { w: 'Promesa en asamblea sin acta', t: 'no' },
    ],
  },
  {
    label: ['De la institución', 'De la persona'], btnA: '🏛️ Institución', btnB: '🙋 Persona', colA: 'ok', colB: 'no',
    words: [
      { w: 'Permiso municipal escrito', t: 'ok' }, { w: 'Salón cedido en acta', t: 'ok' },
      { w: 'Carta con sello del centro', t: 'ok' }, { w: 'Espacio solicitado formalmente', t: 'ok' },
      { w: 'La foto con el candidato', t: 'no' }, { w: 'El favor del amigo regidor', t: 'no' },
      { w: 'El apoyo verbal de la directora', t: 'no' }, { w: 'Transporte de campaña', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se cierra una alianza', steps: ['Averiguar qué gana el otro, dicho con sus palabras', 'Decir qué pone cada uno, en cosas concretas', 'Comprobar quién tiene que firmar para que valga', 'Proponer una prueba pequeña y con fecha', 'Pedir que quede escrito: acta, carta o mensaje', 'Contar a una segunda persona de cada lado lo acordado'] },
  { label: 'Cómo se pide un punto de acta al patronato', steps: ['Hablar antes con quien lleva la secretaría', 'Llevar el acuerdo escrito en tres líneas', 'Pedir que se incluya como punto en la próxima reunión', 'Asistir por si hay preguntas', 'Pedir copia del acta cuando esté firmada'] },
  { label: 'Qué se hace cuando cambia la persona aliada', steps: ['Buscar el papel donde quedó lo acordado', 'Presentarse a quien llega con lo que ya está funcionando', 'Nombrar a las personas del propio centro que lo usan', 'Proponer seguir con una prueba pequeña y con fecha', 'Pedir que se renueve el acuerdo por escrito'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Lo concreto que pone cada parte', ans: 'El aporte', opts: ['El aporte', 'La firma', 'El papel', 'La salida'] },
  { desc: 'Lo que el otro gana, dicho con sus palabras', ans: 'La ganancia', opts: ['La ganancia', 'El aporte', 'El plazo', 'El relevo'] },
  { desc: 'Quién puede comprometer a su institución de verdad', ans: 'La firma', opts: ['La firma', 'El papel', 'La ganancia', 'La salida'] },
  { desc: 'Dónde queda escrito: acta, carta o mensaje guardado', ans: 'El papel', opts: ['El papel', 'La firma', 'El aporte', 'El plazo'] },
  { desc: 'Hasta cuándo dura y cuándo se vuelve a hablar', ans: 'El plazo', opts: ['El plazo', 'La salida', 'El relevo', 'El papel'] },
  { desc: 'Qué pasa si se rompe y cómo se termina sin pelea', ans: 'La salida', opts: ['La salida', 'El plazo', 'La firma', 'La ganancia'] },
  { desc: 'Que sobreviva al cambio de personas', ans: 'El relevo', opts: ['El relevo', 'El papel', 'El aporte', 'La salida'] },
  { desc: 'El que dice que sí a todo y no aporta nada concreto', ans: 'El entusiasta', opts: ['El entusiasta', 'El aliado de manos', 'El aliado de nombre', 'El aliado de acceso'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'El presidente del patronato ofrece el salón de palabra', func: '«¿Lo pueden poner como punto en el acta de la próxima reunión?»', opts: ['«¿Lo pueden poner como punto en el acta de la próxima reunión?»', '«Perfecto, empezamos el sábado»', '«¿Me lo puede firmar usted?»', '«¿Está seguro de que puede?»'] },
  { trans: 'Una ONG grande propone incluir el material en su programa', func: '«Aparecemos los dos y el material queda a nombre de M.E.T.A.S, con licencia de uso»', opts: ['«Aparecemos los dos y el material queda a nombre de M.E.T.A.S, con licencia de uso»', '«Está bien, ustedes ponen el nombre»', '«Prefiero seguir solo»', '«¿Cuánto pagan por el material?»'] },
  { trans: 'La directora que apoyaba todo se traslada de centro', func: 'Visitar a la nueva con lo que ya funciona y los nombres de sus maestras', opts: ['Visitar a la nueva con lo que ya funciona y los nombres de sus maestras', 'Esperar a que ella llame', 'Contar que la anterior lo apoyaba', 'Buscar otro centro'] },
  { trans: 'Un regidor ofrece transporte y foto a cinco meses de las elecciones', func: 'Aceptar el permiso municipal por escrito y declinar lo de la campaña', opts: ['Aceptar el permiso municipal por escrito y declinar lo de la campaña', 'Aceptar todo, que hace falta', 'Rechazarlo todo de plano', 'Aceptar y no publicar la foto'] },
  { trans: 'El comité de padres se ofrece a ayudar y nadie sabe en qué', func: 'Llevar tres tareas concretas con nombre y fecha a la próxima reunión', opts: ['Llevar tres tareas concretas con nombre y fecha a la próxima reunión', 'Agradecer y avisar cuando haga falta', 'Pedirles que propongan ellos', 'Invitarlos a la siguiente actividad'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Trasladaron a la directora y el proyecto salió del centro en un mes', characteristic: 'La alianza estaba en una sola cabeza de cada lado y sin papel', opts: ['La alianza estaba en una sola cabeza de cada lado y sin papel', 'La directora nueva era hostil', 'El material no gustaba', 'Faltó presupuesto'] },
  { disease: 'Cambió la junta del patronato y el salón dejó de estar disponible', characteristic: 'El acuerdo nunca pasó por el acta: era del presidente, no del patronato', opts: ['El acuerdo nunca pasó por el acta: era del presidente, no del patronato', 'La junta nueva cobraba', 'Se rompió el salón', 'Ya no había talleres'] },
  { disease: 'El comité de padres se ofreció a ayudar y en un mes se apagó', characteristic: 'Nadie tradujo el entusiasmo en tareas concretas con nombre y fecha', opts: ['Nadie tradujo el entusiasmo en tareas concretas con nombre y fecha', 'Los padres no tenían tiempo', 'El proyecto no los necesitaba', 'Hubo un malentendido'] },
  { disease: 'La maestra que sostenía todo se cansó y dejó de contestar', characteristic: 'Se le cargó de trabajo sin acordarlo y sin reconocerlo', opts: ['Se le cargó de trabajo sin acordarlo y sin reconocerlo', 'Cambió de escuela', 'No le gustaba el material', 'Le faltaba formación'] },
  { disease: 'Después de las elecciones, la alcaldía dejó de atender al proyecto', characteristic: 'El proyecto quedó asociado a una candidatura y no a la institución', opts: ['El proyecto quedó asociado a una candidatura y no a la institución', 'Cambió la ley', 'Se acabó el presupuesto', 'El proyecto creció demasiado'] },
  { disease: 'La escuela que no fue elegida dejó de contestar los mensajes', characteristic: 'Se eligió sin criterio dicho antes, así que pareció un agravio', opts: ['Se eligió sin criterio dicho antes, así que pareció un agravio', 'Nunca estuvieron interesados', 'Se lo tomaron a mal sin razón', 'Encontraron otro proyecto'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Sigue diciendo que sí cuando cambia el director.', type: 'Un aliado' },
  { s: 'Dice que sí a todo y no aporta nada concreto.', type: 'Un entusiasta' },
  { s: 'Te abre una puerta que estaba cerrada.', type: 'Aliado de acceso' },
  { s: 'Trabaja contigo probando el material.', type: 'Aliado de manos' },
  { s: 'Te hace creíble en dos minutos.', type: 'Aliado de nombre' },
  { s: 'La junta directiva de la comunidad, elegida en asamblea.', type: 'El patronato' },
  { s: 'Donde queda escrito lo acordado por la junta.', type: 'El acta' },
  { s: 'Que la alianza sobreviva al cambio de personas.', type: 'El relevo' },
  { s: 'Algo pequeño y con fecha para estrenar el acuerdo.', type: 'La prueba en pequeño' },
  { s: 'Padres, patronato, iglesia y comercio pequeño.', type: 'La comunidad' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Consigue el salón para el día 12', gen: 'Tipo de apoyo', n: 'Concreto y con fecha', g: 'Aliado', t: 'Contesta sí o no' },
  { w: '«Cuenten conmigo para lo que sea»', gen: 'Tipo de apoyo', n: 'Sin nada concreto', g: 'Entusiasta', t: 'Ocupa el sitio de uno real' },
  { w: 'Punto en el acta de la junta', gen: 'Dónde queda', n: 'Sobrevive a las personas', g: 'Está escrito', t: 'Vale ante la junta siguiente' },
  { w: 'Un apretón de manos en la puerta', gen: 'Dónde queda', n: 'Vive en dos cabezas', g: 'Se dijo', t: 'Se acaba con la persona' },
  { w: 'Ceder el salón comunal', gen: 'Competencia', n: 'Es de la comunidad', g: 'Puede el patronato', t: 'Se pide en acta' },
  { w: 'Decidir el horario de clases', gen: 'Competencia', n: 'Es del centro', g: 'No puede el patronato', t: 'Eso es de la dirección' },
  { w: 'Un permiso municipal por escrito', gen: 'De quién viene', n: 'Sobrevive al cargo', g: 'De la institución', t: 'Sirve con quien venga' },
  { w: 'La foto con el candidato', gen: 'De quién viene', n: 'Tiene calendario propio', g: 'De la persona', t: 'Caduca con la elección' },
  { w: 'La maestra que prueba las fichas', gen: 'Aporte', n: 'Trabajo', g: 'Aliado de manos', t: 'El más escaso de todos' },
  { w: 'La ONG que presta su nombre', gen: 'Aporte', n: 'Credibilidad', g: 'Aliado de nombre', t: 'El que más caro sale si sale mal' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Aliado es quien sigue diciendo que sí cuando cambia el ___.', opts: ['director', 'tema', 'horario'], ans: 'director' },
  { s: 'Lo que no está en el ___ no pasó.', opts: ['acta', 'correo', 'plan'], ans: 'acta' },
  { s: 'Al entusiasta se le pide una cosa concreta y con ___.', opts: ['fecha', 'precio', 'testigo'], ans: 'fecha' },
  { s: 'El patronato es la junta ___ de la comunidad.', opts: ['directiva', 'escolar', 'municipal'], ans: 'directiva' },
  { s: 'El aliado de ___ es el más escaso.', opts: ['manos', 'nombre', 'dinero'], ans: 'manos' },
  { s: 'Toda alianza se prueba en ___.', opts: ['pequeno', 'publico', 'grupo'], ans: 'pequeno' },
  { s: 'Hacen falta dos personas enteradas por cada ___.', opts: ['lado', 'mes', 'centro'], ans: 'lado' },
  { s: 'De la foto se sale, del ___ no.', opts: ['acta', 'grupo', 'trato'], ans: 'acta' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica por qué una alianza es un acuerdo entre personas y qué consecuencia tiene eso.', ans: 'Porque quien dice que sí es siempre una persona concreta, y las personas se van: la directora se traslada, el regidor pierde las elecciones, el presidente del patronato termina su periodo. Las instituciones siguen ahí, pero el acuerdo estaba en la cabeza de quien lo hizo. La consecuencia práctica es que la prueba de una alianza no es lo bien que va hoy, sino si sigue en pie cuando cambia el director. Y de ahí sale la señal de alarma de la etapa: cuando la alianza solo existe en la cabeza de dos personas, no hay alianza, hay una amistad útil. Es una cosa estupenda y se acaba el día que esa persona se va, sin que nadie haya hecho nada mal, que es lo que la hace difícil de ver a tiempo.' },
  { q: '¿Qué es la regla del acta y por qué pedirla no ofende a nadie?', ans: 'La regla del acta dice que, en un patronato, lo que no está escrito en el libro no pasó. No es desconfianza hacia la persona que ofrece: es cómo funciona esa institución con todo lo demás, desde una compra hasta un permiso. Pedir un punto de acta es pedir un trámite, no un favor, y se dice con esas palabras: «¿lo pueden poner como punto en la próxima reunión?». Lo que se gana es enorme para el trabajo que cuesta: media línea en el libro hace que el acuerdo sobreviva al cambio de junta directiva, que en Honduras ocurre cada dos años. Y hay un beneficio menos evidente: al pasar por la junta, el acuerdo deja de ser del presidente y pasa a ser del patronato, con lo cual más gente lo defiende.' },
  { q: 'Di cuáles son los cuatro tipos de aliado y cómo se reconoce al que no lo es.', ans: 'El de acceso te abre una puerta cerrada: una directora, un presidente de patronato. El de manos trabaja contigo, y es el más escaso y el que menos se agradece: la maestra que prueba las fichas, el joven que ayuda a imprimir. El de dinero pone recursos o materiales. El de nombre te hace creíble en dos minutos, y por eso mismo es el que más caro sale si sale mal. El quinto no es aliado: el entusiasta, que dice que sí a todo, no aporta nada concreto y ocupa el sitio de uno real, que es el daño de verdad. Se reconoce con una prueba de cinco segundos: se le pide una cosa pequeña con fecha, «¿me consigues el salón para el sábado 12?». El aliado contesta sí o no; el entusiasta contesta «claro, hablamos», y esa frase se repite hasta que se acaba el año.' },
  { q: 'Explica qué puede y qué no puede el patronato, y por qué conviene saberlo.', ans: 'Puede ceder el salón comunal, convocar a los vecinos, respaldar una solicitud ante la alcaldía y poner un acuerdo en acta. No puede decidir lo que pasa dentro de la escuela, que es de la dirección y la supervisión, ni comprometer dinero público. Y ningún directivo, ni siquiera el presidente, puede acordar solo lo que la junta no ha visto: si lo hace, el acuerdo dura lo que dure él en el cargo. Conviene saberlo por dos razones. Primero, para no pedir lo que no pueden dar, que hace perder tiempo y credibilidad. Y segundo, para saber a quién hay que llevar cada cosa: un permiso de aula se pide a la dirección, un salón comunal al patronato y un permiso municipal a la alcaldía por escrito.' },
  { q: '¿Qué es el relevo de una alianza y qué tres cosas hacen falta para que exista?', ans: 'El relevo es que la alianza sobreviva a las personas que la hicieron. Hacen falta tres cosas concretas y ninguna es cara. La primera, que esté en un papel: un acta, una carta con sello, un mensaje guardado con fecha; media página basta. La segunda, que la conozcan al menos dos personas por cada lado, para que la información no se vaya con quien se va. Y la tercera, que tenga una fecha de renovación, para que alguien tenga que acordarse de ella antes de que caduque. Sin las tres, lo que hay es una relación buena mientras dure, y en un centro educativo hondureño los traslados no avisan. El día que trasladan a la directora, un proyecto con relevo cambia de interlocutor; uno sin relevo empieza de cero, y encima parece «cosa de la anterior».' },
  { q: 'Explica cómo se trabaja con la comunidad y qué regla no se puede saltar.', ans: 'Se empieza con algo útil y sin pedir nada: un taller para padres, una hoja que sirva, algo que se pueda usar el lunes. La comunidad (padres organizados, patronato, iglesia y comercio pequeño) no sale en ningún organigrama y puede parar o empujar cualquier cosa, así que tratarla como público y no como aliado es el error más caro de esta etapa. La regla que no se puede saltar es la de la asamblea: lo que se anuncia en público se cumple en público, así que no se anuncia nada que no esté seguro. Una promesa incumplida en una asamblea tarda años en olvidarse y no se arregla con explicaciones. Y para el entusiasmo hay una regla práctica: se traduce en tres tareas concretas con nombre y fecha en la misma reunión, porque el entusiasmo sin tarea se apaga en tres semanas, siempre.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['ALIANZA', 'ACTA', 'PATRONATO', 'APORTE', 'FIRMA', 'RELEVO']),
  haceSopa(10, ['COMUNIDAD', 'ASAMBLEA', 'SALON', 'JUNTA', 'PADRES', 'PLAZO']),
  haceSopa(10, ['ACCESO', 'MANOS', 'NOMBRE', 'PAPEL', 'SALIDA', 'PRUEBA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Una alianza es en el fondo un acuerdo entre personas.', a: true },
  { q: 'La prueba de una alianza es lo bien que va el primer año.', a: false },
  { q: 'Si no hay papel ni nadie más enterado, no hay alianza.', a: true },
  { q: 'En un patronato, lo que no está en el acta no pasó.', a: true },
  { q: 'Pedir un punto de acta es una desconfianza que conviene evitar.', a: false },
  { q: 'El aliado de manos es el más escaso y el que menos se agradece.', a: true },
  { q: 'El entusiasta es un aliado más, solo que menos activo.', a: false },
  { q: 'Al entusiasta se le reconoce pidiéndole algo concreto con fecha.', a: true },
  { q: 'El presidente del patronato puede comprometer a la junta él solo.', a: false },
  { q: 'El patronato puede decidir el horario de clases del centro.', a: false },
  { q: 'Toda alianza se prueba primero en pequeño y con fecha.', a: true },
  { q: 'Para el relevo hacen falta dos personas enteradas por cada lado.', a: true },
  { q: 'Conviene aceptar todo lo que ofrezca un candidato en campaña.', a: false },
  { q: 'Lo que se anuncia en una asamblea se cumple en público.', a: true },
  { q: 'El entusiasmo sin tarea concreta se mantiene solo si hay buen ambiente.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: 'La prueba de una alianza es…', o: ['a) Que vaya bien hoy', 'b) Que siga cuando cambie el director', 'c) Que sea con alguien importante', 'd) Que esté firmada ante notario'], a: 1 },
  { q: 'La señal de alarma de la etapa es…', o: ['a) Que pidan dinero', 'b) Que tarden en contestar', 'c) Que la alianza viva solo en dos cabezas', 'd) Que haya muchos aliados'], a: 2 },
  { q: '¿Qué es el patronato?', o: ['a) Una asociación de padres del centro', 'b) La junta directiva de la comunidad', 'c) Una oficina municipal', 'd) Un comité de la iglesia'], a: 1 },
  { q: 'El patronato SÍ puede…', o: ['a) Nombrar maestros', 'b) Cambiar lo que se enseña', 'c) Ceder el salón comunal', 'd) Comprometer dinero público'], a: 2 },
  { q: 'El aliado más escaso es el de…', o: ['a) Acceso', 'b) Manos', 'c) Dinero', 'd) Nombre'], a: 1 },
  { q: 'El aliado de nombre sale caro si sale mal porque…', o: ['a) Cobra comisión', 'b) Te hace creíble muy rápido', 'c) Nunca firma nada', 'd) Cambia de opinión'], a: 1 },
  { q: 'La respuesta típica del entusiasta es…', o: ['a) «No puedo»', 'b) «Claro, hablamos»', 'c) «¿Cuánto cuesta?»', 'd) «Déjame consultarlo»'], a: 1 },
  { q: 'Un acuerdo hecho solo por el presidente del patronato…', o: ['a) Obliga a toda la junta', 'b) Dura lo que dure él en el cargo', 'c) Es ilegal', 'd) Tiene que ratificarlo la alcaldía'], a: 1 },
  { q: 'La prueba en pequeño consiste en…', o: ['a) Firmar por un año', 'b) Empezar con algo concreto y con fecha', 'c) Pedir referencias', 'd) Hacer una reunión larga'], a: 1 },
  { q: 'Para el relevo hace falta…', o: ['a) Un convenio notariado', 'b) Papel, dos personas por lado y fecha de renovación', 'c) Reuniones mensuales', 'd) Un responsable único'], a: 1 },
  { q: 'Ante un ofrecimiento de campaña conviene…', o: ['a) Aceptar todo', 'b) Rechazar todo', 'c) Aceptar lo institucional y declinar lo de campaña', 'd) Posponerlo un año'], a: 2 },
  { q: 'La regla de la asamblea dice que…', o: ['a) Todo se vota', 'b) Lo anunciado en público se cumple en público', 'c) Solo habla la directiva', 'd) Las decisiones son anuales'], a: 1 },
  { q: 'Cuando dos escuelas piden lo mismo y solo hay para una…', o: ['a) Se elige la más grande', 'b) Se decide en el momento', 'c) Se publica el criterio antes de elegir', 'd) Se rifa'], a: 2 },
  { q: 'Con un comité de padres que quiere ayudar hay que…', o: ['a) Agradecer y avisar cuando haga falta', 'b) Llevar tres tareas concretas con nombre y fecha', 'c) Pedirles que propongan ellos', 'd) Invitarlos a la próxima actividad'], a: 1 },
  { q: 'Cuando trasladan a la directora aliada, lo primero es…', o: ['a) Buscar otro centro', 'b) Esperar a que llamen', 'c) Presentarse a la nueva con lo que ya funciona', 'd) Escribir a la supervisión'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Aliado es quien sigue diciendo que sí cuando cambia el ___.', a: 'director' },
  { q: 'Lo que no está en el ___ no pasó.', a: 'acta' },
  { q: 'El patronato es la junta ___ de la comunidad.', a: 'directiva' },
  { q: 'El aliado de ___ es el más escaso.', a: 'manos' },
  { q: 'El aliado de ___ te hace creíble en dos minutos.', a: 'nombre' },
  { q: 'Al ___ se le pide una cosa concreta y con fecha.', a: 'entusiasta' },
  { q: 'Toda alianza se prueba en ___.', a: 'pequeno' },
  { q: 'Hacen falta dos personas enteradas por cada ___.', a: 'lado' },
  { q: 'El ___ hace que la alianza sobreviva a las personas.', a: 'relevo' },
  { q: 'De la foto se sale, del ___ no.', a: 'acta' },
  { q: 'Lo que se anuncia en público se cumple en ___.', a: 'publico' },
  { q: 'El patronato no puede comprometer dinero ___.', a: 'publico' },
  { q: 'El ___ dice qué pone cada parte, en cosas concretas.', a: 'aporte' },
  { q: 'El entusiasmo sin ___ se apaga en tres semanas.', a: 'tarea' },
  { q: 'Se acepta lo que sea de la ___ y no de la campaña.', a: 'institucion' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Una alianza', def: 'Acuerdo entre personas que un día se van' },
  { term: 'La señal de alarma', def: 'Que viva solo en la cabeza de dos personas' },
  { term: 'La regla del acta', def: 'Lo que no está escrito no pasó' },
  { term: 'Aliado de acceso', def: 'Abre una puerta que estaba cerrada' },
  { term: 'Aliado de manos', def: 'Trabaja contigo; el más escaso' },
  { term: 'Aliado de dinero', def: 'Pone recursos o materiales' },
  { term: 'Aliado de nombre', def: 'Te hace creíble en dos minutos' },
  { term: 'El entusiasta', def: 'Dice que sí a todo y no aporta nada concreto' },
  { term: 'El patronato', def: 'La junta directiva de la comunidad' },
  { term: 'La prueba en pequeño', def: 'Estrenar con algo concreto y con fecha' },
  { term: 'El relevo', def: 'Que sobreviva al cambio de personas' },
  { term: 'La comunidad', def: 'Padres, patronato, iglesia y comercio' },
  { term: 'La regla de la asamblea', def: 'Lo anunciado en público se cumple en público' },
  { term: 'El aporte', def: 'Lo concreto que pone cada parte' },
  { term: 'La salida', def: 'Qué pasa si se rompe y cómo se termina' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'El presidente del patronato ofrece el salón comunal los sábados a cambio de un taller para padres cada trimestre. Todo hablado en la puerta de su casa y sin nadie más delante.' },
  { txt: 'Una ONG grande propone incluir las fichas en su programa: ellos ponen el nombre, la difusión y los contactos; el proyecto pone el material y los talleres.' },
  { txt: 'La directora que abrió las puertas del centro y convenció al claustro es trasladada a otro centro en diciembre.' },
  { txt: 'La iglesia ofrece anunciar los talleres los domingos, que es donde más gente se entera de todo en la comunidad. No piden nada a cambio.' },
  { txt: 'Un regidor ofrece transporte, un espacio en la casa comunal y salir en la foto. Faltan cinco meses para las elecciones.' },
  { txt: 'Una maestra prueba todas las fichas, contesta dudas de las demás y ya la llaman a ella antes que a ti. No hay ningún acuerdo escrito.' },
  { txt: 'Dos escuelas piden lo mismo y solo hay tiempo y material para una este trimestre. En una está la maestra referente; en la otra hay más niños.' },
  { txt: 'El comité de padres se ofrece a ayudar en lo que sea, y nadie sabe decirles en qué. Ha pasado un mes desde entonces.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué tipo de aliado es, y qué gana el otro dicho por él?',
  '2. ¿Quién tiene que firmar o aprobar para que valga?',
  '3. ¿Qué queda escrito exactamente, y dónde?',
  '4. Escribe en 3-4 frases qué pasa si mañana cambia esa persona.',
]);

B.critCaseGuides = JSON.stringify([
  'Se nombra el tipo (acceso, manos, dinero o nombre) y se dice lo que el otro ganaría con sus palabras, no con las tuyas. Si no se sabe, hay que ir a preguntarlo antes de cerrar nada.',
  'La persona que puede comprometer a su institución de verdad. En un patronato es la junta y no el presidente; en un centro, la dirección; en la alcaldía, el papel con sello.',
  'Acta, carta con sello o mensaje guardado con fecha. Media página basta. Y siempre con el plazo dentro: hasta cuándo dura y cuándo se vuelve a hablar.',
  'Si la respuesta es «se acaba», falta el relevo: papel, dos personas enteradas por cada lado y fecha de renovación. Sin eso el proyecto empieza de cero en ese sitio.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Con el presidente del patronato ya está hablado, empezamos el sábado".', g1: 'Un acuerdo hablado con una persona dura lo que dure esa persona en el cargo, y el periodo de una junta son dos años.', g2: 'Se pide un punto en el acta, que es un trámite y no un favor. Media línea en el libro y el acuerdo pasa a ser del patronato en vez de ser del presidente.' },
  { txt: '"Ellos ponen el nombre y nosotros el material; así llegamos a más gente".', g1: 'En ese reparto, el grande pone lo que no se gasta y el chico pone lo que se gasta. Y al terminar el convenio, el nombre se lo lleva quien lo trajo.', g2: 'La contraoferta es aparecer los dos, con el material a nombre de M.E.T.A.S y licencia de uso para el programa. Y probarlo en un municipio y un trimestre.' },
  { txt: '"La directora nos apoya en todo, ese centro está asegurado".', g1: 'Está asegurado mientras ella esté. Los traslados no avisan y ocurren en diciembre.', g2: 'Antes de que pase: que dos maestras del centro usen el material y que exista una nota en el archivo de la dirección. Después: presentarse a quien llegue con lo que ya funciona.' },
  { txt: '"El regidor nos ofrece de todo, hay que aprovecharlo ahora".', g1: 'A cinco meses de las elecciones, la oferta tiene calendario propio. Y si el proyecto queda asociado a una candidatura, el que gane del otro lado no lo va a querer.', g2: 'Se acepta lo que sea de la institución y por escrito (un permiso, un espacio solicitado) y se declina con educación lo de la campaña.' },
  { txt: '"La maestra referente lo hace porque quiere, no hace falta acordar nada".', g1: 'Es el aliado de manos, el más escaso, y se pierde de dos maneras: no reconociéndolo o cargándolo de trabajo sin decirlo.', g2: 'Se acuerda qué hace, cuánto tiempo le va a costar al mes y qué recibe. Escrito, aunque sea en un mensaje: los acuerdos entre amigos son los que peor terminan cuando no se dicen.' },
  { txt: '"Los padres querían ayudar pero al final no hicieron nada".', g1: 'El entusiasmo sin tarea se apaga en tres semanas, siempre. No falló la gente: faltó traducir «queremos ayudar» en tres cosas concretas.', g2: 'Se lleva a la reunión una lista corta con nombre y fecha al lado, y una tarea pequeña la primera semana para que haya algo hecho antes de que se enfríe.' },
]);

B.critDecisionBank = JSON.stringify([
  'El salón comunal ofrecido de palabra por el presidente del patronato: ¿se empieza el sábado o se pide algo antes?',
  'Una ONG grande que pone el nombre y pide que tú pongas el material: ¿se acepta, se rechaza o se contraoferta?',
  'Trasladan en diciembre a la directora que abría las puertas: ¿qué se hace en enero y con quién?',
  'La iglesia ofrece anunciar los talleres los domingos sin pedir nada: ¿se acepta, y de qué manera?',
  'Un regidor ofrece transporte y foto a cinco meses de las elecciones: ¿qué parte se acepta y qué parte no?',
  'La maestra referente sostiene medio proyecto sin acuerdo escrito: ¿se deja así o se acuerda algo?',
  'Dos escuelas piden lo mismo y solo hay para una: ¿cómo se elige sin dejar un agravio?',
  'El comité de padres quiere ayudar y nadie sabe en qué: ¿qué se lleva a la próxima reunión?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Pedir que el acuerdo del salón quede como punto en el acta.', b: 'Empezar el sábado, que ya está hablado con el presidente.', ga: 'Caso A: cuesta esperar una reunión y a cambio el acuerdo sobrevive al cambio de junta, que ocurre cada dos años.', gb: 'Caso B: se empieza antes y se depende de una persona. El día que termine su periodo, el salón vuelve a estar por negociar y sin nada a lo que remitirse.' },
  { a: 'Contraofertar aparecer los dos, con el material a nombre propio.', b: 'Aceptar que la ONG ponga el nombre y el proyecto el material.', ga: 'Caso A: se llega igual de lejos y lo producido sigue siendo del proyecto cuando el convenio termine.', gb: 'Caso B: se llega rápido y al terminar el convenio queda el trabajo hecho y el nombre en la otra casa. Es el activo de otro, como enseña la etapa 4 del Poder Económico.' },
  { a: 'Llevar al comité de padres tres tareas concretas con nombre y fecha.', b: 'Agradecer el ofrecimiento y avisarles cuando haga falta algo.', ga: 'Caso A: hay algo hecho en la primera semana, y eso convierte el entusiasmo en costumbre.', gb: 'Caso B: en tres semanas el entusiasmo se apagó y además quedó la sensación de que el proyecto no los quería, que es peor que no haber hablado.' },
  { a: 'Publicar el criterio antes de elegir entre las dos escuelas.', b: 'Elegir la escuela donde está la maestra referente y explicarlo después.', ga: 'Caso A: la que no entra se queda esperando turno, con fecha concreta y algo pequeño mientras tanto.', gb: 'Caso B: la decisión es razonable y aun así parece un agravio, y en una comunidad pequeña los agravios se recuerdan durante años.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Un acuerdo importante queda solo de palabra.', guide: 'Dura lo que dure la persona que lo hizo. Cuando cambia la junta o trasladan a la directora, no hay nada a lo que remitirse y el proyecto empieza de cero en ese sitio.' },
  { cause: 'No se pregunta qué gana el otro.', guide: 'La alianza se apoya en una suposición. Cuando la suposición falla, el otro deja de responder y nadie entiende por qué, porque nunca se dijo en voz alta qué esperaba.' },
  { cause: 'Se acepta un ofrecimiento de campaña sin separar lo institucional.', guide: 'El proyecto queda asociado a una candidatura. Si gana el otro lado, la puerta se cierra durante cuatro años, y en una comunidad pequeña eso se nota en todo.' },
  { cause: 'Se carga de trabajo al aliado de manos sin acordarlo.', guide: 'Se cansa, y además se va molesto, porque nunca se habló de cuánto tiempo le iba a costar. Es la manera más común de perder al aliado más escaso.' },
  { cause: 'Se elige entre dos centros sin criterio dicho antes.', guide: 'La decisión, por razonable que sea, se lee como un agravio. Con criterio publicado antes, la que no entra se queda esperando turno en vez de enfadada.' },
  { cause: 'Se recibe entusiasmo y no se convierte en tareas.', guide: 'Se apaga en tres semanas y deja una sensación rara de rechazo. El entusiasmo es un recurso perecedero: o se usa la primera semana o se pierde.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'El salón siguió disponible después de cambiar la junta.', guide: 'El acuerdo estaba en el acta, así que era del patronato y no del presidente que lo ofreció.' },
  { effect: 'El proyecto siguió en el centro después del traslado de la directora.', guide: 'Dos maestras usaban el material y había una nota en el archivo de la dirección. Se cambió de interlocutor, no de punto de partida.' },
  { effect: 'La alianza con la ONG terminó y el material siguió siendo del proyecto.', guide: 'Se contraofertó aparecer los dos, con el material a nombre de M.E.T.A.S y licencia de uso para el programa.' },
  { effect: 'El comité de padres lleva ocho meses funcionando.', guide: 'Se llevaron tres tareas concretas con nombre y fecha a la primera reunión, y una de ellas se hizo esa misma semana.' },
  { effect: 'La escuela que no fue elegida volvió a llamar al trimestre siguiente.', guide: 'El criterio se publicó antes de elegir y se le dio una fecha concreta, además de las fichas impresas mientras tanto.' },
  { effect: 'Cambió el gobierno municipal y el proyecto siguió trabajando igual.', guide: 'Todo lo aceptado había sido de la institución y por escrito; de la campaña no se aceptó nada.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🎁', label: 'El aporte', text: 'Qué pone cada uno, <strong>en cosas concretas</strong> y no en intenciones. <strong>Si falta:</strong> cada uno espera del otro algo distinto. <strong>En M.E.T.A.S:</strong> el patronato pone salón, el proyecto pone taller.' },
  { y: '2', icon: '🤲', label: 'La ganancia', text: 'Qué gana el otro, <strong>dicho con sus palabras</strong>. <strong>Si falta:</strong> la alianza se apoya en una suposición. <strong>Ejemplo:</strong> un patronato gana actividad y algo que enseñar en la asamblea.' },
  { y: '3', icon: '✍️', label: 'La firma', text: 'Quién puede <strong>comprometer a su institución</strong> de verdad. <strong>Si falta:</strong> el acuerdo dura lo que dure esa persona. <strong>En un patronato:</strong> la junta, no el presidente solo.' },
  { y: '4', icon: '📖', label: 'El papel', text: 'Dónde queda escrito: <strong>acta, carta con sello o mensaje guardado</strong>. <strong>Si falta:</strong> lo que no está en el acta no pasó. <strong>Basta con:</strong> media página con fecha.' },
  { y: '5', icon: '📅', label: 'El plazo', text: 'Hasta cuándo dura y <strong>cuándo se vuelve a hablar</strong>. <strong>Si falta:</strong> la alianza se va apagando sin que nadie la dé por terminada. <strong>Sirve para:</strong> obligar a acordarse.' },
  { y: '6', icon: '🚪', label: 'La salida', text: 'Qué pasa si se rompe y <strong>cómo se termina sin pelea</strong>. <strong>Si falta:</strong> el final deja resentimiento en una comunidad donde todos se ven. <strong>Se dice al principio</strong>, que es cuando no duele.' },
  { y: '7', icon: '🔄', label: 'El relevo', text: 'Que sobreviva al <strong>cambio de personas</strong>. <strong>Cómo:</strong> papel, dos enterados por cada lado y fecha de renovación. <strong>Si falta:</strong> se empieza de cero cada traslado.' },
]);

B.parteData = JSON.stringify({
  aporte: {
    nombre: 'El aporte', icon: '🎁',
    estructura: { title: 'Qué es', info: '• Lo que pone cada parte, <strong>en cosas concretas</strong><br>• No intenciones ni apoyos generales: cosas con nombre<br>• Salón, horas, hojas, contactos, dinero' },
    funcion: { title: 'Cómo se acuerda', info: '• Se dice en voz alta y se escribe en una línea cada uno<br>• Se comprueba que <strong>los dos puedan cumplirlo</strong> el mes que viene<br>• Y se estrena con algo pequeño y con fecha' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Cada uno espera del otro algo distinto<br>• Y el que más pone se cansa sin decir nada<br>• Cuando se nota, ya hay resentimiento' },
    cuidados: { title: 'En M.E.T.A.S', info: '• El patronato pone el <strong>salón los sábados</strong><br>• El proyecto pone un <strong>taller para padres cada trimestre</strong><br>• Escrito así, con las dos líneas, cabe en un punto de acta' },
  },
  firma: {
    nombre: 'Quién firma', icon: '✍️',
    estructura: { title: 'Qué es', info: '• Quién puede <strong>comprometer a su institución</strong> de verdad<br>• No siempre es quien habla contigo<br>• En un patronato es la junta, no el presidente solo' },
    funcion: { title: 'Cómo se acuerda', info: '• Se pregunta sin rodeos: <strong>«¿esto lo aprueba usted o la junta?»</strong><br>• Se lleva el acuerdo escrito en tres líneas<br>• Y se pide asistir a la reunión por si hay preguntas' },
    enfermedades: { title: 'Qué pasa si falta', info: '• El acuerdo dura lo que dure esa persona en el cargo<br>• Y el siguiente no tiene por qué saber nada<br>• Nadie mintió: es que nunca fue de la institución' },
    cuidados: { title: 'En M.E.T.A.S', info: '• Con la escuela: <strong>la dirección</strong>, y mejor con nota en el archivo<br>• Con la comunidad: <strong>la junta del patronato</strong><br>• Con la alcaldía: el papel con sello, no el amigo regidor' },
  },
  papel: {
    nombre: 'El papel', icon: '📖',
    estructura: { title: 'Qué es', info: '• Dónde queda escrito: <strong>acta, carta con sello o mensaje guardado</strong><br>• No hace falta un contrato de abogado<br>• Hace falta media página que sobreviva a las personas' },
    funcion: { title: 'Cómo se acuerda', info: '• Se pide como <strong>un trámite y no como un favor</strong><br>• «¿Lo pueden poner como punto en la próxima reunión?»<br>• Y se pide copia cuando el acta esté firmada' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Lo que no está en el acta no pasó<br>• Se discute de memoria, y las memorias no coinciden<br>• Y el que llega nuevo empieza de cero, con razón' },
    cuidados: { title: 'En M.E.T.A.S', info: '• Cada acuerdo se apunta en <strong>Destellos con fecha</strong> y con quién<br>• Y al lado, dónde quedó escrito<br>• La lista de esas dos columnas es el mapa de aliados' },
  },
  salida: {
    nombre: 'La salida', icon: '🚪',
    estructura: { title: 'Qué es', info: '• Qué pasa si se rompe y <strong>cómo se termina sin pelea</strong><br>• Incluye el plazo: hasta cuándo y cuándo se vuelve a hablar<br>• Se dice al principio, que es cuando no duele' },
    funcion: { title: 'Cómo se acuerda', info: '• Con una frase: «lo probamos un trimestre y en marzo hablamos»<br>• Y otra: «si a alguno no le sirve, se dice y no pasa nada»<br>• Las dos <strong>tranquilizan al otro</strong> más de lo que uno espera' },
    enfermedades: { title: 'Qué pasa si falta', info: '• La alianza se apaga sin que nadie la dé por terminada<br>• Queda un asunto pendiente que enfría el trato<br>• Y en una comunidad pequeña <strong>todos se siguen viendo</strong>' },
    cuidados: { title: 'En M.E.T.A.S', info: '• Todo empieza con <strong>una prueba de un trimestre</strong><br>• Con fecha de revisión escrita en el mismo acuerdo<br>• Y con la promesa de avisar por adelantado si algo cambia' },
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

/* El molde declara critDecisionGuide con comillas simples o dobles según de
   qué misión venga, así que la expresión acepta las dos. */
src = src.replace(/const critDecisionGuide=(['"])[\s\S]*?\1;/,
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: aliado es quien sigue diciendo que sí cuando cambia el director, así que lo primero es preguntar qué gana el otro dicho con sus palabras y quién puede comprometer a su institución de verdad, que en un patronato es la junta y no el presidente. Lo que no está en el acta no pasó, y pedir un punto de acta es un trámite y no un favor. Toda alianza se estrena con algo pequeño y con fecha, porque lo que no se puede probar en pequeño tampoco se debería firmar en grande. Al entusiasta se le pide una cosa concreta con fecha y se ve enseguida. Y de lo que llega en año electoral se acepta lo que sea de la institución y por escrito, nunca lo de la campaña: de la foto se sale, del acta no.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  [/🤝 \*Ruta del Poder Político · Etapa 3\* 🤝/g, '🫂 *Ruta del Poder Político · Etapa 4* 🫂'],
  [/La mesa que se cierra/g, 'La alianza que aguanta'],
  [/la mesa que se cierra/g, 'la alianza que aguanta'],
  [/La mesa: negociar con una institución/g, 'Alianzas, patronato y comunidad'],
  [/Ruta del Poder Político · Etapa 3: La mesa/g, 'Ruta del Poder Político · Etapa 4: Alianzas'],
  [/Evaluación Final · La mesa ·/g, 'Evaluación Final · Alianzas ·'],
  [/Evaluación La mesa ·/g, 'Evaluación Alianzas ·'],
  [/· La mesa ·/g, '· Alianzas ·'],
  /* el <title> de la ventana de impresión y el mensaje de WhatsApp llevaban
     «La mesa» a secas, sin los separadores que capturan las otras reglas */
  [/La alianza que aguanta La mesa ·/g, 'La alianza que aguanta · Alianzas ·'],
  [/\(La mesa\)/g, '(Alianzas, patronato y comunidad)'],
  [/Final: la mesa/g, 'Final: las alianzas'],
  [/Etapa 3 · Poder Político/g, 'Etapa 4 · Poder Político'],
  [/🤝 ¡/g, '🫂 ¡'],
  [/completó la Etapa 3 de la Ruta del Poder Político/g, 'completó la Etapa 4 de la Ruta del Poder Político'],
  /* la sección I venía con el nombre que el molde arrastra desde su propia etapa 1 */
  [/I\. Simulacro de Presión: la interpelación/g, 'I. La alianza sobre la mesa'],
  /* los mensajes de la constancia eran de una misión todavía más vieja */
  [/\['¡Sigue estudiando tu sistema!','¡Muy buen trabajo!','¡Excelente gestor en formación!','¡Sabes por dónde se mueve esto!','¡Estratega institucional!'\]/g,
   "['¡Sigue preguntando qué gana el otro!','¡Muy buen trabajo!','¡Ya distingues al aliado del entusiasta!','¡Pides el punto de acta!','¡Tus alianzas aguantan el relevo!']"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV seguían siendo las de la etapa 3 */
src = src.replace(/¿Cuál es el interés que hay debajo, quién decide de verdad y qué piloto propones con la moneda que pides a cambio\? Explica por qué tu salida es mejor que aceptar completo o que rechazar de plano\./g,
  '¿Qué tipo de aliado es, qué gana el otro dicho por él y quién tiene que firmar para que valga? Explica por qué dejarlo escrito es mejor que confiar en el apretón de manos o que rechazar la oferta.');
src = src.replace(/1\. ¿Qué gana cada caso y cuál aguanta un cambio de funcionario\? 2\. ¿Por qué no son el mismo caso\?/g,
  '1. ¿Cuál de las dos alianzas sigue en pie si mañana cambia la persona? 2. ¿Por qué no son el mismo acuerdo, aunque hoy den lo mismo?');

/* el desenlace de la simulación seguía narrando la mesa de la etapa 3 */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(pideElActa){sfx(pideElActa?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(pideElActa){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">📖</span><span class="ms-text"><strong>Lo pediste como trámite:</strong> «¿lo pueden poner como punto en el acta de la próxima reunión?». Nadie se molestó, porque es lo que el patronato hace con todo.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✅</span><span class="ms-text"><strong>Ocho meses después cambió la junta</strong> y el salón siguió disponible: el acuerdo era del patronato y no del presidente. Además, ahora lo defienden cuatro personas y no una.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🫱</span><span class="ms-text"><strong>Empezaste el sábado:</strong> el salón estaba abierto, vinieron dieciocho padres y todo salió bien durante ocho meses.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🚪</span><span class="ms-text"><strong>Y llegó la junta nueva:</strong> nadie sabía nada de ningún acuerdo, y no había nada a lo que remitirse. Hubo que volver a pedirlo desde el principio, ahora con menos fuerza.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='[a-zA-Z]+',labAspecto='estructura';/, "let labParte='aporte',labAspecto='estructura';");
/* y el botón que se resalta al abrir: si no coincide, el laboratorio abre sin nada marcado */
src = src.replace(/(document\.querySelector\('\[data-parte=")[a-zA-Z]+("\]')/, '$1aporte$2');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
