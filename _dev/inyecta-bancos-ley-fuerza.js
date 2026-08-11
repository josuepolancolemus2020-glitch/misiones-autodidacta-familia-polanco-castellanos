/* Inyecta los bancos de la misión «De dónde saca su fuerza la ley» (Ruta de
   la Ley y sus Grietas, etapa 1) sobre el molde copiado de «Llaves y
   secretos», y de paso cambia los rótulos que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-ley-fuerza.js

   REGLA DE LA RUTA (capítulo 1 de COMPENDIO-RUTA-LEY.md): aquí no se cita
   ningún artículo de memoria. Los que aparecen en estos bancos se
   comprobaron contra fuente el 11 de agosto de 2026, y son estos:

     · art. 16, 17 y 18: los tratados aprobados por el Congreso forman parte
       del derecho interno al entrar en vigor; si el tratado afecta una
       disposición constitucional se aprueba por el procedimiento de reforma;
       y en conflicto entre tratado y ley, prevalece el tratado.
     · art. 70: el particular puede hacer lo que no perjudique a otro, y nadie
       está obligado a hacer lo que no está legalmente prescrito ni impedido
       de ejecutar lo que la ley no prohíbe.
     · art. 205 numeral 1: el Congreso crea, decreta, interpreta, reforma y
       deroga las leyes.
     · art. 320: si una norma constitucional y una legal ordinaria son
       incompatibles, se aplica la constitucional.
     · art. 321: los servidores del Estado no tienen más facultades que las
       que expresamente les confiere la ley, y todo acto que ejecuten fuera de
       la ley es nulo e implica responsabilidad.
     · art. 157: la educación del sistema formal, salvo la superior, la
       autoriza, organiza, dirige y supervisa «exclusivamente» el Poder
       Ejecutivo por medio de la Secretaría de Educación.
     · Ley Fundamental de Educación: Decreto 262-2011, publicada en La Gaceta
       32,754 del 22 de febrero de 2012.

   El par 70 contra 321 es el corazón de la misión y por eso se comprobó
   primero: es la asimetría que convierte a un ciudadano en alguien que puede
   preguntar en una ventanilla.                                            */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-ley-fuerza-norma', 'js', 'fuerza-norma.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260811;
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
  { w: 'Norma', a: '📜 Una regla que <strong>obliga aunque no estés de acuerdo</strong>. Lo que la distingue de un consejo no es el tono: es que detrás hay una consecuencia si no se cumple, y alguien con facultad para aplicarla.' },
  { w: 'Validez', a: '✅ Que la norma <strong>nació bien</strong>: la dictó quien podía, siguiendo el camino que correspondía. Una norma dictada por quien no tenía la facultad es inválida aunque esté escrita, sellada y firmada.' },
  { w: 'Vigencia', a: '📅 Que <strong>está rigiendo hoy</strong>. Una norma válida puede no estar vigente todavía (se publicó y aún no entra) o haber dejado de estarlo (la derogaron). Un artículo no es un texto: es un texto con fecha.' },
  { w: 'Eficacia', a: '🎯 Que <strong>de verdad se cumple</strong>. Es la que no depende de juristas sino de la calle. Una norma puede ser válida, vigente y no tener ninguna eficacia, y esa distancia es donde vive medio país.' },
  { w: 'Las tres juntas', a: '🔺 Validez, vigencia y eficacia <strong>no son lo mismo y no se implican</strong>. La confusión más cara es dar por muerta una norma porque nadie la cumple: sigue vigente, y el día que alguien decida aplicarla, se aplica.' },
  { w: 'La pirámide', a: '🏛️ El orden de quién manda sobre quién: Constitución, tratados, leyes del Congreso, decretos, reglamentos, acuerdos de Secretaría, circulares. <strong>Abajo no se puede contradecir arriba</strong>, y lo de abajo se cae, no lo de arriba.' },
  { w: 'Artículo 320', a: '⚖️ La supremacía constitucional en una línea: si una norma constitucional y una legal ordinaria <strong>son incompatibles, se aplica la constitucional</strong>. Es el artículo que sostiene toda la pirámide.' },
  { w: 'Los tratados', a: '🌎 Aprobados por el Congreso, al entrar en vigor <strong>forman parte del derecho interno</strong> (art. 16). Si afectan la Constitución se aprueban por el procedimiento de reforma (art. 17). Y en conflicto con una ley, <strong>prevalece el tratado</strong> (art. 18).' },
  { w: 'Artículo 321', a: '🏢 <strong>Los servidores del Estado no tienen más facultades que las que expresamente les confiere la ley</strong>, y lo que ejecuten fuera de ella es nulo e implica responsabilidad. El artículo más útil de toda esta etapa.' },
  { w: 'Artículo 70', a: '🙋 El otro lado: el particular puede hacer lo que no perjudique a otro, y <strong>nadie está obligado a hacer lo que la ley no manda ni impedido de hacer lo que no prohíbe</strong>. Con el 321 forman la asimetría que hay que saber de memoria.' },
  { w: 'La asimetría', a: '↔️ <strong>Tú puedes todo lo que no está prohibido; el funcionario solo lo que la ley le permite expresamente.</strong> Quien entiende esa sola frase ya puede preguntar en una ventanilla: «¿en qué norma dice usted que puede exigirme esto?».' },
  { w: 'Coacción', a: '💪 La consecuencia respaldada por la fuerza del Estado. Es una de las tres patas por las que una norma se cumple, y <strong>sola no alcanza</strong>: ningún Estado tiene inspectores suficientes para sostener una norma que nadie acepta.' },
  { w: 'Legitimidad', a: '🤝 Que la gente acepte que <strong>quien manda tiene derecho a mandar</strong>. Es la pata barata: una norma legítima se cumple sin vigilancia. Cuando se pierde, hay que sustituirla con coacción, que cuesta muchísimo más.' },
  { w: 'La costumbre', a: '🔁 «Siempre se ha hecho así». Es <strong>la tercera pata y no es un escalón de la pirámide</strong>: explica por qué la gente cumple, pero no convierte en exigible lo que ninguna norma manda. En una ventanilla, no es respuesta.' },
  { w: 'La Gaceta', a: '📰 Donde se publica lo que rige. Una norma que no se publicó <strong>no se le puede exigir a nadie</strong>: la publicidad no es un trámite, es la condición para poder obligar, y viene desde la piedra de Hammurabi en la plaza.' },
  { w: 'El papel que no es norma', a: '📄 Circulares, instructivos, correos y costumbres de oficina. Organizan a quien ya está obligado, pero <strong>no crean obligaciones nuevas para el ciudadano</strong>. Si un requisito solo vive ahí, la pregunta del 321 lo desarma.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Qué distingue una norma de un consejo?', o: ['a) Que está escrita', 'b) Que la firma un funcionario', 'c) Que hay una consecuencia y alguien con facultad para aplicarla', 'd) Que se publicó en un sitio oficial'], c: 2 },
  { q: 'Una norma que nadie cumple desde hace veinte años…', o: ['a) Queda derogada por la costumbre', 'b) Sigue vigente y puede aplicarse cualquier día', 'c) Pierde su validez', 'd) Solo obliga a quien la conocía'], c: 1 },
  { q: 'Un reglamento exige un requisito que la ley que reglamenta no pide. ¿Qué pasa?', o: ['a) Manda el reglamento, que es más específico', 'b) Se aplican los dos a la vez', 'c) Se cae el reglamento en esa parte, no la ley', 'd) Decide el funcionario de turno'], c: 2 },
  { q: 'Según el artículo 320, si una norma constitucional y una ley ordinaria son incompatibles…', o: ['a) Se aplica la constitucional', 'b) Se aplica la más reciente', 'c) Lo resuelve el Congreso', 'd) Se aplica la más específica'], c: 0 },
  { q: 'En conflicto entre un tratado vigente y una ley, el artículo 18 dice que…', o: ['a) Prevalece la ley nacional', 'b) Prevalece el tratado', 'c) Se suspenden los dos', 'd) Decide la Secretaría del ramo'], c: 1 },
  { q: 'El artículo 321 dice que los servidores del Estado…', o: ['a) Pueden todo lo que no esté prohibido', 'b) Responden solo ante su jefe', 'c) Pueden interpretar la ley a su criterio', 'd) No tienen más facultades que las que la ley les confiere expresamente'], c: 3 },
  { q: 'Un director exige un permiso que solo aparece en una circular interna suya. La primera pregunta correcta es…', o: ['a) «¿Cuánto cuesta el trámite?»', 'b) «¿En qué norma dice usted que puede exigirme esto?»', 'c) «¿Y si hablo con su jefe?»', 'd) «¿Desde cuándo se hace así?»'], c: 1 },
  { q: 'Validez, vigencia y eficacia son…', o: ['a) Tres nombres de lo mismo', 'b) Etapas obligatorias en ese orden', 'c) Categorías del derecho penal', 'd) Tres cosas distintas que no se implican entre sí'], c: 3 },
  { q: '«Siempre se ha hecho así» es…', o: ['a) Costumbre, que explica por qué se cumple pero no crea la obligación', 'b) Una fuente que manda más que el reglamento', 'c) Un escalón intermedio de la pirámide', 'd) Un argumento válido si lo dice la autoridad'], c: 0 },
  { q: '¿Por qué una norma que no se publicó no se le puede exigir a nadie?', o: ['a) Porque nadie la firmó', 'b) Porque el Congreso no la aprobó', 'c) Porque la publicidad es la condición para poder obligar', 'd) Porque no tiene reglamento'], c: 2 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Es norma', 'No es norma'], headA: '📜 Es norma', headB: '📄 No es norma', colA: 'ok', colB: 'no',
    words: [
      { w: 'Un artículo de la Constitución', t: 'ok' }, { w: 'Una circular interna de un centro', t: 'no' },
      { w: 'Una ley publicada en La Gaceta', t: 'ok' }, { w: 'Un correo de la dirección', t: 'no' },
      { w: 'Un reglamento del Ejecutivo', t: 'ok' }, { w: '«Siempre se ha hecho así»', t: 'no' },
      { w: 'Un tratado vigente y aprobado', t: 'ok' }, { w: 'Un instructivo verbal en ventanilla', t: 'no' },
    ],
  },
  {
    label: ['Lo puede el particular', 'Solo si la ley lo faculta'], headA: '🙋 Lo puede el particular', headB: '🏢 Solo si una norma lo faculta', colA: 'ok', colB: 'no',
    words: [
      { w: 'Publicar fichas de estudio gratis', t: 'ok' }, { w: 'Exigir un requisito a un ciudadano', t: 'no' },
      { w: 'Reunir a padres para enseñar el proyecto', t: 'ok' }, { w: 'Cobrar una tasa por un trámite', t: 'no' },
      { w: 'Estudiar en casa con material propio', t: 'ok' }, { w: 'Retener un expediente sin plazo', t: 'no' },
      { w: 'Escribir una crítica documentada', t: 'ok' }, { w: 'Prohibir una aplicación en el aula', t: 'no' },
    ],
  },
  {
    label: ['Validez', 'Eficacia'], headA: '✅ Habla de validez', headB: '🎯 Habla de eficacia', colA: 'ok', colB: 'no',
    words: [
      { w: 'La dictó quien tenía la facultad', t: 'ok' }, { w: 'Nadie la cumple desde hace años', t: 'no' },
      { w: 'Siguió el procedimiento que correspondía', t: 'ok' }, { w: 'En la práctica se hace lo contrario', t: 'no' },
      { w: 'La firmó el órgano competente', t: 'ok' }, { w: 'No hay quien la vigile', t: 'no' },
      { w: 'Respeta la norma superior', t: 'ok' }, { w: 'La gente ni sabe que existe', t: 'no' },
    ],
  },
  {
    label: ['Gana', 'Cede'], headA: '⚖️ Gana el choque', headB: '⬇️ Cede en el choque', colA: 'ok', colB: 'no',
    words: [
      { w: 'La Constitución frente a una ley', t: 'ok' }, { w: 'Un reglamento frente a su ley', t: 'no' },
      { w: 'Un tratado vigente frente a una ley', t: 'ok' }, { w: 'Una circular frente a un reglamento', t: 'no' },
      { w: 'Una ley frente a un acuerdo de Secretaría', t: 'ok' }, { w: 'Un acuerdo frente a una ley', t: 'no' },
      { w: 'Un reglamento frente a una circular', t: 'ok' }, { w: 'La costumbre frente a la ley escrita', t: 'no' },
    ],
  },
]);

/* ---------- identificar ---------- */
B.idData = JSON.stringify([
  { s: ['La', 'validez', 'dice', 'si', 'la', 'norma', 'nació', 'bien.'], c: 1, art: 'Si nació bien' },
  { s: ['La', 'vigencia', 'dice', 'si', 'rige', 'hoy.'], c: 1, art: 'Si rige hoy' },
  { s: ['La', 'eficacia', 'dice', 'si', 'de', 'verdad', 'se', 'cumple.'], c: 1, art: 'Si se cumple' },
  { s: ['La', 'jerarquía', 'decide', 'cuál', 'gana', 'el', 'choque.'], c: 1, art: 'El orden entre normas' },
  { s: ['La', 'coacción', 'es', 'la', 'consecuencia', 'que', 'respalda', 'el', 'Estado.'], c: 1, art: 'La consecuencia' },
  { s: ['La', 'legitimidad', 'hace', 'que', 'se', 'cumpla', 'sin', 'vigilancia.'], c: 1, art: 'La pata barata' },
  { s: ['La', 'costumbre', 'explica', 'pero', 'no', 'obliga.'], c: 1, art: 'Lo que no es escalón' },
  { s: ['Una', 'facultad', 'la', 'da', 'la', 'ley,', 'no', 'el', 'cargo.'], c: 1, art: 'Lo que el 321 exige' },
]);

/* ---------- completa ---------- */
B.cmpData = JSON.stringify([
  { s: 'Una norma que nadie cumple pierde eficacia, pero sigue ___.', opts: ['vigente', 'inválida', 'derogada'], c: 0 },
  { s: 'Si una norma constitucional y una ley ordinaria chocan, se aplica la ___.', opts: ['más nueva', 'constitucional', 'más específica'], c: 1 },
  { s: 'En conflicto entre un tratado vigente y una ley, prevalece el ___.', opts: ['reglamento', 'acuerdo', 'tratado'], c: 2 },
  { s: 'El funcionario solo puede lo que la ley le confiere ___.', opts: ['de palabra', 'por costumbre', 'expresamente'], c: 2 },
  { s: 'Una norma que no se ___ no se le puede exigir a nadie.', opts: ['publicó', 'reglamentó', 'tradujo'], c: 0 },
  { s: 'Cuando un reglamento contradice su ley, se cae el ___.', opts: ['artículo de la ley', 'reglamento', 'trámite entero'], c: 1 },
  { s: 'Que la norma la dictara quien podía se llama ___.', opts: ['eficacia', 'validez', 'vigencia'], c: 1 },
  { s: 'La costumbre explica por qué se cumple, pero no crea la ___.', opts: ['sanción', 'publicación', 'obligación'], c: 2 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Es norma', 'No es norma'], btnA: '📜 Es norma', btnB: '📄 No es norma', colA: 'ok', colB: 'no',
    words: [
      { w: 'Un artículo de la Constitución', t: 'ok' }, { w: 'Un correo del director', t: 'no' },
      { w: 'Una ley del Congreso', t: 'ok' }, { w: 'Una circular interna', t: 'no' },
      { w: 'Un reglamento del Ejecutivo', t: 'ok' }, { w: 'Lo que dijo el de la ventanilla', t: 'no' },
      { w: 'Un tratado en vigor', t: 'ok' }, { w: 'Un cartel pegado en la puerta', t: 'no' },
      { w: 'Un acuerdo de Secretaría', t: 'ok' }, { w: 'La costumbre de la oficina', t: 'no' },
    ],
  },
  {
    label: ['Lo puede el particular', 'Solo con norma'], btnA: '🙋 Lo puede el particular', btnB: '🏢 Solo con norma', colA: 'ok', colB: 'no',
    words: [
      { w: 'Regalar material de estudio', t: 'ok' }, { w: 'Exigir un permiso nuevo', t: 'no' },
      { w: 'Estudiar en casa', t: 'ok' }, { w: 'Cobrar una tasa', t: 'no' },
      { w: 'Publicar una crítica', t: 'ok' }, { w: 'Prohibir una actividad', t: 'no' },
      { w: 'Reunirse con otros padres', t: 'ok' }, { w: 'Retener un documento', t: 'no' },
      { w: 'Pedir copia de lo que entregó', t: 'ok' }, { w: 'Sancionar a alguien', t: 'no' },
    ],
  },
  {
    label: ['Gana', 'Cede'], btnA: '⚖️ Gana', btnB: '⬇️ Cede', colA: 'ok', colB: 'no',
    words: [
      { w: 'Constitución frente a ley', t: 'ok' }, { w: 'Reglamento frente a ley', t: 'no' },
      { w: 'Tratado frente a ley', t: 'ok' }, { w: 'Circular frente a reglamento', t: 'no' },
      { w: 'Ley frente a acuerdo', t: 'ok' }, { w: 'Acuerdo frente a ley', t: 'no' },
      { w: 'Reglamento frente a circular', t: 'ok' }, { w: 'Costumbre frente a ley', t: 'no' },
      { w: 'Ley frente a instructivo', t: 'ok' }, { w: 'Correo frente a acuerdo', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se comprueba si un requisito es exigible, de principio a fin',
    steps: [
      'Pedir el requisito por escrito, con el nombre y el cargo de quien lo exige',
      'Preguntar en qué norma consta, con su nombre y su artículo',
      'Buscar esa norma publicada y comprobar que está vigente hoy',
      'Ver en qué escalón vive y si contradice alguna norma superior',
      'Comprobar si la ley le da esa facultad al que la exige (art. 321)',
      'Contestar por escrito citando la norma, y guardar copia sellada',
    ],
  },
  {
    label: 'Cómo nace una ley y empieza a obligar',
    steps: [
      'El Congreso crea y decreta la ley (art. 205 numeral 1)',
      'Pasa al Ejecutivo para su sanción',
      'Se publica en La Gaceta, que es cuando el país puede conocerla',
      'Entra en vigencia el día que ella misma señale',
      'El Ejecutivo la reglamenta para poder aplicarla',
      'Las Secretarías dictan acuerdos dentro de lo que la ley permite',
    ],
  },
  {
    label: 'Qué se mira, en orden, cuando dos normas chocan',
    steps: [
      'Comprobar que las dos están vigentes hoy',
      'Ver si alcanzan al mismo caso, porque si no, no hay choque',
      'Mirar el escalón: si una es superior, gana la superior',
      'Si están en el mismo escalón, mirar cuál es posterior',
      'Si son del mismo tiempo, mirar cuál es la especial',
      'Escribir la ficha de grieta y guardarla en el Registro',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Que la norma la dictó quien podía, por el camino que correspondía', ans: 'La validez', opts: ['La validez', 'La vigencia', 'La eficacia', 'La coacción'] },
  { desc: 'Que la norma está rigiendo hoy y no la han derogado', ans: 'La vigencia', opts: ['La vigencia', 'La validez', 'La legitimidad', 'La costumbre'] },
  { desc: 'Que la norma de verdad se cumple en la calle', ans: 'La eficacia', opts: ['La eficacia', 'La validez', 'La jerarquía', 'La publicidad'] },
  { desc: 'El orden que decide cuál norma gana cuando dos se contradicen', ans: 'La jerarquía', opts: ['La jerarquía', 'La eficacia', 'La coacción', 'La vigencia'] },
  { desc: 'La consecuencia respaldada por la fuerza del Estado', ans: 'La coacción', opts: ['La coacción', 'La legitimidad', 'La validez', 'La costumbre'] },
  { desc: 'Que la gente acepte que quien manda tiene derecho a mandar', ans: 'La legitimidad', opts: ['La legitimidad', 'La coacción', 'La eficacia', 'La jerarquía'] },
  { desc: 'Lo que la ley le permite hacer a un funcionario, y nada más', ans: 'La facultad', opts: ['La facultad', 'El cargo', 'La costumbre', 'La circular'] },
  { desc: 'Publicar la norma para que el país pueda conocerla y quede obligado', ans: 'La publicidad', opts: ['La publicidad', 'La sanción', 'La reglamentación', 'La derogación'] },
]);

/* ---------- ¿en qué escalón vive? ---------- */
const ESCALONES = ['Constitución', 'Tratado en vigor', 'Ley del Congreso', 'Reglamento del Ejecutivo', 'Acuerdo de Secretaría', 'Papel que no es norma'];
B.neuroPairs = JSON.stringify([
  { trans: 'El artículo 157, sobre quién autoriza la educación formal', func: 'Constitución', opts: ['Constitución', 'Ley del Congreso', 'Reglamento del Ejecutivo', 'Acuerdo de Secretaría'] },
  { trans: 'La Ley Fundamental de Educación, Decreto 262-2011', func: 'Ley del Congreso', opts: ['Ley del Congreso', 'Constitución', 'Acuerdo de Secretaría', 'Papel que no es norma'] },
  { trans: 'La Convención sobre los Derechos del Niño, ya en vigor', func: 'Tratado en vigor', opts: ['Tratado en vigor', 'Reglamento del Ejecutivo', 'Papel que no es norma', 'Acuerdo de Secretaría'] },
  { trans: 'El reglamento que desarrolla la Ley Fundamental de Educación', func: 'Reglamento del Ejecutivo', opts: ['Reglamento del Ejecutivo', 'Ley del Congreso', 'Constitución', 'Tratado en vigor'] },
  { trans: 'La circular con la que un centro pide autorizar material de apoyo', func: 'Papel que no es norma', opts: ['Papel que no es norma', 'Acuerdo de Secretaría', 'Reglamento del Ejecutivo', 'Ley del Congreso'] },
]);

/* ---------- diagnóstico: ¿por dónde falla? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Exigen un requisito y nadie puede señalar en qué norma consta', characteristic: 'Falta la facultad: el artículo 321 pide norma expresa', opts: ['Falta la facultad: el artículo 321 pide norma expresa', 'La norma perdió eficacia', 'El tratado desplazó a la ley', 'La norma no se publicó'] },
  { disease: 'La norma existe y está vigente, pero en la práctica nadie la aplica', characteristic: 'Le falta eficacia, no validez ni vigencia', opts: ['Le falta eficacia, no validez ni vigencia', 'Quedó derogada por la costumbre', 'Nunca fue válida', 'Está en el escalón equivocado'] },
  { disease: 'Un reglamento pide un papel que la ley que reglamenta no pide', characteristic: 'El reglamento se salió de su escalón y cede en esa parte', opts: ['El reglamento se salió de su escalón y cede en esa parte', 'Manda el reglamento por ser más reciente', 'Los dos se aplican a la vez', 'La ley quedó derogada'] },
  { disease: 'Le contestan «siempre se ha hecho así» y no citan nada', characteristic: 'Es costumbre, que no es escalón de la pirámide', opts: ['Es costumbre, que no es escalón de la pirámide', 'Es un reglamento no escrito', 'Es doctrina legal', 'Es un acuerdo verbal válido'] },
  { disease: 'Se aplica un requisito de una norma que nunca salió publicada', characteristic: 'Sin publicidad no se le puede exigir a nadie', opts: ['Sin publicidad no se le puede exigir a nadie', 'Vale igual si el funcionario la conoce', 'Basta con que exista el borrador', 'Se aplica solo dentro de la oficina'] },
  { disease: 'Un acuerdo de Secretaría quita un derecho que reconoce una ley', characteristic: 'Un escalón inferior no puede recortar al superior', opts: ['Un escalón inferior no puede recortar al superior', 'El acuerdo gana por ser especial', 'Depende de la fecha de cada uno', 'Los dos quedan sin efecto'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Que la norma la dictó quien podía, por el camino que correspondía.', type: 'Validez' },
  { s: 'Que la norma está rigiendo hoy.', type: 'Vigencia' },
  { s: 'Que la norma de verdad se cumple.', type: 'Eficacia' },
  { s: 'El orden que decide cuál norma gana en un choque.', type: 'Jerarquía' },
  { s: 'La consecuencia respaldada por la fuerza del Estado.', type: 'Coacción' },
  { s: 'Que se acepte que quien manda tiene derecho a mandar.', type: 'Legitimidad' },
  { s: 'Lo que la ley le permite expresamente a un funcionario.', type: 'Facultad' },
  { s: 'Publicar la norma para que pueda obligar.', type: 'Publicidad' },
  { s: '«Siempre se ha hecho así», sin norma detrás.', type: 'Costumbre' },
  { s: 'Quitarle vigencia a una norma con otra posterior.', type: 'Derogación' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'Un artículo de la Constitución', gen: 'Naturaleza', n: 'Norma, escalón más alto', g: 'Es norma', t: 'Gana cualquier choque' },
  { w: 'Un tratado en vigor', gen: 'Naturaleza', n: 'Norma, parte del derecho interno', g: 'Es norma', t: 'Prevalece sobre la ley' },
  { w: 'Una ley del Congreso', gen: 'Naturaleza', n: 'Norma con rango de ley', g: 'Es norma', t: 'Cede ante Constitución y tratado' },
  { w: 'Un reglamento del Ejecutivo', gen: 'Naturaleza', n: 'Norma que desarrolla una ley', g: 'Es norma', t: 'No puede pedir lo que la ley no pide' },
  { w: 'Un acuerdo de Secretaría', gen: 'Naturaleza', n: 'Norma de escalón bajo', g: 'Es norma', t: 'No recorta derechos de una ley' },
  { w: 'Una circular interna', gen: 'Naturaleza', n: 'Organiza al que ya está obligado', g: 'No es norma', t: 'No crea obligaciones nuevas' },
  { w: 'Un correo de la dirección', gen: 'Naturaleza', n: 'Comunicación, no fuente', g: 'No es norma', t: 'Sirve de prueba, no de fundamento' },
  { w: '«Siempre se ha hecho así»', gen: 'Naturaleza', n: 'Costumbre de oficina', g: 'No es norma', t: 'Explica, no obliga' },
  { w: 'Un cartel en la ventanilla', gen: 'Naturaleza', n: 'Aviso sin rango', g: 'No es norma', t: 'Hay que pedir la norma que lo respalda' },
  { w: 'Un instructivo dicho de palabra', gen: 'Naturaleza', n: 'Ni escrito ni publicado', g: 'No es norma', t: 'Se pide por escrito' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'Una norma que nadie cumple sigue ___.', opts: ['vigente', 'inválida', 'derogada'], ans: 'vigente' },
  { s: 'Si chocan la Constitución y una ley, se aplica la ___.', opts: ['constitucional', 'más nueva', 'más corta'], ans: 'constitucional' },
  { s: 'Entre tratado vigente y ley, prevalece el ___.', opts: ['tratado', 'reglamento', 'acuerdo'], ans: 'tratado' },
  { s: 'El funcionario solo puede lo que la ley le confiere ___.', opts: ['expresamente', 'de palabra', 'por costumbre'], ans: 'expresamente' },
  { s: 'Sin ___ una norma no se le puede exigir a nadie.', opts: ['publicación', 'reglamento', 'traducción'], ans: 'publicación' },
  { s: 'Que la dictara quien podía se llama ___.', opts: ['validez', 'eficacia', 'vigencia'], ans: 'validez' },
  { s: 'Cuando un reglamento contradice su ley, se cae el ___.', opts: ['reglamento', 'artículo', 'trámite'], ans: 'reglamento' },
  { s: 'La costumbre explica pero no crea la ___.', opts: ['obligación', 'sanción', 'norma superior'], ans: 'obligación' },
]);
B.explainQuestions = JSON.stringify([
  { q: 'Explica la diferencia entre validez, vigencia y eficacia con un ejemplo de cada una.', ans: 'Validez es que la norma nació bien: la dictó quien tenía la facultad, por el procedimiento que correspondía. Vigencia es que está rigiendo hoy, porque ya entró y nadie la derogó. Eficacia es que de verdad se cumple. No se implican: una norma puede ser válida y vigente y tener eficacia cero, y ese es el caso más frecuente. La confusión cara es dar por muerta una norma porque nadie la cumple, porque el día que alguien decida aplicarla se aplica igual.' },
  { q: '¿Por qué el artículo 321 es más útil para un ciudadano que casi cualquier otro?', ans: 'Porque invierte la carga: el funcionario no puede hacer lo que quiera mientras no esté prohibido, solo puede lo que la ley le confiere expresamente, y lo que ejecute fuera de ella es nulo e implica responsabilidad. Con eso, ante un requisito raro, la pregunta deja de ser «convénzame» y pasa a ser «en qué norma dice usted que puede exigirme esto». Quien pregunta eso no está discutiendo, está pidiendo el fundamento que la Constitución ya exige.' },
  { q: 'Un reglamento pide un papel que la ley no pide. ¿Qué se cae y por qué?', ans: 'Se cae el reglamento en esa parte, no la ley. El reglamento existe para desarrollar la ley, no para ampliarla: si crea un requisito nuevo se salió de su escalón, y por el artículo 320 y por la lógica de la jerarquía, entre normas de distinto rango se aplica la superior. Lo importante en la práctica es que el reglamento se cae solo en el punto que excede, y el resto sigue rigiendo.' },
  { q: '¿Por qué la costumbre no sirve como respuesta en una ventanilla?', ans: 'Porque la costumbre explica por qué la gente cumple algo, pero no lo convierte en exigible. «Siempre se ha hecho así» describe un hábito de oficina, no una fuente que obligue al ciudadano. Sirve para entender la eficacia de una norma, no para fundar una obligación nueva. La respuesta correcta es pedir la norma, por escrito, con su nombre y su artículo.' },
  { q: '¿Qué papel juega la publicación en La Gaceta y por qué no es un trámite menor?', ans: 'Es la condición para poder obligar: una norma que no se publicó no se le puede exigir a nadie, porque el país no pudo conocerla. Viene de la idea más vieja que existe sobre la ley, la de escribirla en la plaza para que cualquiera la lea. En la práctica sirve de dos maneras: permite comprobar el texto exacto y su fecha, y desarma cualquier requisito que solo viva en un papel interno.' },
  { q: 'Explica las tres razones por las que una norma se cumple y por qué ninguna basta sola.', ans: 'Coacción: la consecuencia respaldada por la fuerza del Estado. Legitimidad: que se acepte que quien manda tiene derecho a mandar. Costumbre: que ya se venía haciendo. Ninguna basta sola. Solo con coacción no alcanzan los inspectores del mundo para sostener una norma que nadie acepta. Solo con legitimidad, el que decide incumplir no encuentra freno. Y la costumbre sostiene tanto lo bueno como lo que ya no tiene sentido.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['LEY', 'NORMA', 'GACETA', 'VIGENCIA', 'VALIDEZ', 'EFICACIA']),
  haceSopa(10, ['DECRETO', 'ACUERDO', 'CIRCULAR', 'DEROGAR', 'ESCALON', 'MANDATO']),
  haceSopa(10, ['TRATADO', 'COACCION', 'FACULTAD', 'PIRAMIDE', 'COSTUMBRE', 'SUPREMACIA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'Una norma que nadie cumple queda automáticamente derogada.', a: false },
  { q: 'Una norma puede ser válida y vigente y aun así no tener ninguna eficacia.', a: true },
  { q: 'La validez se refiere a que la norma la dictó quien tenía la facultad.', a: true },
  { q: 'Vigencia y eficacia significan lo mismo.', a: false },
  { q: 'Si una norma constitucional y una ley ordinaria son incompatibles, se aplica la constitucional.', a: true },
  { q: 'Un reglamento puede añadir requisitos que la ley que reglamenta no exige.', a: false },
  { q: 'Los tratados aprobados por el Congreso forman parte del derecho interno al entrar en vigor.', a: true },
  { q: 'En conflicto entre un tratado vigente y una ley, prevalece la ley nacional.', a: false },
  { q: 'Los servidores del Estado solo tienen las facultades que la ley les confiere expresamente.', a: true },
  { q: 'El particular necesita una norma que lo autorice para hacer algo que no está prohibido.', a: false },
  { q: 'Una circular interna crea obligaciones nuevas para el ciudadano.', a: false },
  { q: 'Una norma que no se publicó igual se le puede exigir a cualquiera.', a: false },
  { q: '«Siempre se ha hecho así» es costumbre, y la costumbre no es un escalón de la pirámide.', a: true },
  { q: 'La coacción sola alcanza para que una norma se cumpla.', a: false },
  { q: 'Un acuerdo de Secretaría puede recortar un derecho reconocido por una ley del Congreso.', a: false },
]);
B.evalMCBank = JSON.stringify([
  { q: '¿Qué es la validez de una norma?', o: ['a) Que se cumpla en la práctica', 'b) Que la dictó quien podía, como correspondía', 'c) Que esté publicada en papel', 'd) Que tenga reglamento'], a: 1 },
  { q: '¿Qué es la vigencia?', o: ['a) Que esté rigiendo hoy', 'b) Que sea conocida', 'c) Que sea justa', 'd) Que tenga sanción'], a: 0 },
  { q: '¿Qué es la eficacia?', o: ['a) Que nació bien', 'b) Que la firmó el Presidente', 'c) Que de verdad se cumple', 'd) Que está en La Gaceta'], a: 2 },
  { q: 'Dos normas chocan y son de distinto rango. ¿Qué criterio se aplica?', o: ['a) El cronológico', 'b) El de especialidad', 'c) El del funcionario', 'd) El jerárquico'], a: 3 },
  { q: 'El artículo 320 establece…', o: ['a) La supremacía de la Constitución sobre la ley ordinaria', 'b) El derecho de petición', 'c) La reforma constitucional', 'd) Las facultades del Congreso'], a: 0 },
  { q: 'Según el artículo 18, entre tratado vigente y ley…', o: ['a) Gana la ley', 'b) Prevalece el tratado', 'c) Se aplican los dos', 'd) Decide el Ejecutivo'], a: 1 },
  { q: 'El artículo 321 limita…', o: ['a) Al ciudadano', 'b) Al Congreso solamente', 'c) A los servidores del Estado', 'd) A los jueces solamente'], a: 2 },
  { q: 'El artículo 70 reconoce que el particular…', o: ['a) Debe pedir permiso para todo', 'b) Solo puede lo que la ley enumera', 'c) Depende de la costumbre', 'd) No está obligado a lo que la ley no manda'], a: 3 },
  { q: '¿Cuál de estos NO es una norma?', o: ['a) Una circular interna de un centro', 'b) Un reglamento', 'c) Una ley', 'd) Un tratado en vigor'], a: 0 },
  { q: 'La publicación en La Gaceta sirve para…', o: ['a) Archivar el expediente', 'b) Que la norma pueda obligar', 'c) Cobrar la tasa', 'd) Nombrar al funcionario'], a: 1 },
  { q: 'Un reglamento exige lo que su ley no pide. ¿Qué cede?', o: ['a) La ley', 'b) Los dos', 'c) El reglamento en esa parte', 'd) Ninguno'], a: 2 },
  { q: 'Las tres razones por las que una norma se cumple son…', o: ['a) Coacción, legitimidad y costumbre', 'b) Sanción, multa y cárcel', 'c) Validez, vigencia y eficacia', 'd) Ley, reglamento y acuerdo'], a: 0 },
  { q: 'La pregunta que desarma un requisito sin respaldo es…', o: ['a) «¿Cuánto cuesta?»', 'b) «¿Desde cuándo se hace así?»', 'c) «¿Quién es su jefe?»', 'd) «¿En qué norma dice usted que puede exigirme esto?»'], a: 3 },
  { q: 'Según el artículo 205 numeral 1, el Congreso puede…', o: ['a) Solo crear leyes', 'b) Crear, decretar, interpretar, reformar y derogar leyes', 'c) Reglamentar las leyes', 'd) Juzgar la constitucionalidad'], a: 1 },
  { q: 'Una norma vigente que nadie cumple…', o: ['a) Puede aplicarse cualquier día', 'b) Ya no obliga', 'c) Necesita nueva publicación', 'd) Pierde validez'], a: 0 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'Que la norma la dictó quien podía se llama ___.', a: 'validez' },
  { q: 'Que la norma rige hoy se llama ___.', a: 'vigencia' },
  { q: 'Que la norma de verdad se cumple se llama ___.', a: 'eficacia' },
  { q: 'El orden entre normas de distinto rango se llama ___.', a: 'jerarquia' },
  { q: 'La consecuencia respaldada por la fuerza del Estado es la ___.', a: 'coaccion' },
  { q: 'Que se acepte que quien manda tiene derecho a mandar es la ___.', a: 'legitimidad' },
  { q: 'Lo que la ley le confiere expresamente a un funcionario es su ___.', a: 'facultad' },
  { q: 'La norma se publica en La ___.', a: 'gaceta' },
  { q: 'Entre tratado vigente y ley prevalece el ___.', a: 'tratado' },
  { q: 'Si chocan la Constitución y una ley ordinaria, se aplica la ___.', a: 'constitucional' },
  { q: 'Quitarle vigencia a una norma con otra posterior es ___.', a: 'derogar' },
  { q: '«Siempre se ha hecho así» describe una ___.', a: 'costumbre' },
  { q: 'El escalón más alto de la pirámide es la ___.', a: 'constitucion' },
  { q: 'Una circular interna no crea obligaciones nuevas porque no es ___.', a: 'norma' },
  { q: 'Sin publicación la norma no puede ___ a nadie.', a: 'obligar' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Validez', def: 'La dictó quien podía, como correspondía' },
  { term: 'Vigencia', def: 'Está rigiendo hoy' },
  { term: 'Eficacia', def: 'De verdad se cumple' },
  { term: 'Jerarquía', def: 'Decide cuál gana cuando dos normas chocan' },
  { term: 'Coacción', def: 'La consecuencia que respalda el Estado' },
  { term: 'Legitimidad', def: 'Se acepta que quien manda tiene derecho a mandar' },
  { term: 'Costumbre', def: 'Explica por qué se cumple pero no obliga' },
  { term: 'Facultad', def: 'Lo que la ley le permite al funcionario' },
  { term: 'Artículo 320', def: 'La Constitución se aplica sobre la ley ordinaria' },
  { term: 'Artículo 321', def: 'El servidor público solo puede lo expresamente conferido' },
  { term: 'Artículo 70', def: 'Nadie obligado a lo que la ley no manda' },
  { term: 'Artículo 18', def: 'El tratado prevalece sobre la ley' },
  { term: 'La Gaceta', def: 'Donde se publica lo que rige' },
  { term: 'Derogación', def: 'Una norma posterior le quita vigencia a otra' },
  { term: 'Circular', def: 'Papel que organiza, no que obliga al ciudadano' },
]);

/* ---------- prueba de pensamiento crítico ----------
   Los ocho casos salen de M.E.T.A.S y de su futuro, como pide la norma 3 de
   NORMAS-MISIONES-FARO.md. Ninguno es un ejemplo de manual.               */
B.critCaseBank = JSON.stringify([
  { txt: 'Un director condiciona el uso de M.E.T.A.S en su centro a un permiso que solo aparece en una circular interna que él mismo firmó.' },
  { txt: 'La Secretaría ofrece adoptar las misiones para todo un departamento, con un acuerdo que pide ceder los derechos del material. La Ley del Derecho de Autor reconoce esos derechos al autor.' },
  { txt: 'Un reglamento educativo exige, para el material de apoyo, una aprobación previa que la ley que reglamenta no menciona en ninguna parte.' },
  { txt: 'En la ventanilla del distrito le contestan que el trámite pide una constancia más, y que «siempre se ha hecho así». Nadie sabe decir de qué norma sale.' },
  { txt: 'Un acuerdo departamental obliga a subir fotografías de los estudiantes a una plataforma. Hay un tratado sobre derechos de la niñez en vigor que protege su imagen.' },
  { txt: 'Existe una norma vigente que obliga a registrar todo material educativo, y en la práctica no la cumple nadie ni nadie la exige desde hace años.' },
  { txt: 'Le exigen a M.E.T.A.S un requisito que consta en un instructivo que nunca se publicó en La Gaceta, y del que solo hay una copia en la oficina.' },
  { txt: 'Un funcionario nuevo interpreta el artículo 157 y decide que M.E.T.A.S es sistema formal, así que necesita autorización. El anterior opinaba lo contrario.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿En qué escalón vive el papel que le están enseñando, y qué norma superior lo alcanza?',
  '2. ¿Quién lo exige tiene la facultad expresa para exigirlo? ¿En qué norma consta?',
  '3. ¿El problema es de validez, de vigencia o de eficacia? Nómbralo con esa palabra.',
  '4. ¿Qué contestas por escrito, en dos líneas, y qué guardas del intercambio?',
]);
B.critCaseGuides = JSON.stringify([
  'El escalón se nombra antes de discutir nada: Constitución, tratado en vigor, ley, reglamento, acuerdo, o papel que no es norma. Casi todos los problemas de esta casa vienen del último grupo, que no crea obligaciones nuevas para el ciudadano aunque venga en hoja membretada. Y cuando el papel sí es norma, la pregunta pasa a ser si contradice a alguna superior, porque entonces cede la de abajo y no la de arriba.',
  'Aquí manda el artículo 321: el servidor del Estado no tiene más facultades que las que expresamente le confiere la ley, y lo que ejecute fuera de ella es nulo e implica responsabilidad. Enfrente está el artículo 70, que dice que al particular nadie lo obliga a lo que la ley no manda. La pregunta correcta nunca es «por qué no debería hacerlo yo», es «en qué norma dice usted que puede exigírmelo». No es una pelea: es pedir el fundamento que la Constitución ya exige.',
  'Validez es que la norma nació bien; vigencia, que rige hoy; eficacia, que se cumple. Nombrar cuál falla cambia la respuesta entera. Si falla la validez, se ataca la norma. Si falla la vigencia, se demuestra con la fecha y el decreto que la derogó. Y si lo único que falla es la eficacia, la norma sigue viva: que nadie la aplique no es un permiso, es un riesgo dormido que despierta el día que alguien decida usarlo.',
  'Se contesta corto, por escrito y citando: qué se pide, con qué norma y qué hecho. Y se guarda copia sellada de recibido con el nombre y el cargo de quien recibió. Lo que no queda por escrito no ocurrió, y el que tiene el expediente completo llega a la segunda reunión con una ventaja que no se compra. Si de la respuesta sale una contradicción entre dos normas, se abre su ficha en el Registro de Grietas antes de que se olvide.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"Está escrito en hoja con sello y firma, así que hay que cumplirlo".', g1: 'El sello no da rango. Un instructivo sellado sigue siendo un papel que organiza a quien ya está obligado, y no crea obligaciones nuevas para el ciudadano.', g2: 'Lo que hay que preguntar es en qué norma consta el requisito. Si no consta en ninguna, el artículo 321 lo desarma sin necesidad de discutir el fondo.' },
  { txt: '"Esa ley ya no vale, hace años que nadie la cumple".', g1: 'Confunde eficacia con vigencia. Que nadie la cumpla no la deroga: sigue rigiendo y puede aplicarse cualquier día, normalmente el peor día.', g2: 'Una norma solo pierde vigencia si otra posterior se la quita o si se declara inconstitucional. La costumbre de incumplir no deroga nada.' },
  { txt: '"El reglamento es más específico, así que gana sobre la ley".', g1: 'El criterio de especialidad se usa entre normas del mismo rango. Entre rangos distintos manda la jerarquía, y el reglamento está por debajo de su ley.', g2: 'Si el reglamento pide algo que la ley no pide, se salió de su escalón: cede el reglamento en esa parte, y solo en esa parte.' },
  { txt: '"Como no hay ninguna norma que autorice lo que hacemos, no podemos hacerlo".', g1: 'Eso vale para el funcionario, no para el particular. El artículo 70 dice que nadie está obligado a lo que la ley no manda ni impedido de hacer lo que no prohíbe.', g2: 'La pregunta correcta para un proyecto de la casa no es «qué norma me autoriza», es «qué norma me lo prohíbe». Cambia el trabajo entero de buscar.' },
  { txt: '"Ese tratado no cuenta aquí, es internacional".', g1: 'Un tratado aprobado por el Congreso, una vez en vigor, forma parte del derecho interno. No es algo de fuera: rige aquí.', g2: 'Y hay más: si choca con una ley, prevalece el tratado. Por eso conviene saber cuáles están en vigor antes de aceptar un requisito que los contradiga.' },
  { txt: '"Lo dijo el funcionario, y él sabrá porque es su trabajo".', g1: 'El cargo no da la facultad: la da la ley, y expresamente. Un funcionario puede equivocarse de buena fe y su error no obliga a nadie.', g2: 'Pedirlo por escrito no es desconfianza, es el paso que convierte una conversación en un hecho comprobable, y muchas veces el requisito desaparece en ese paso.' },
]);
B.critDecisionBank = JSON.stringify([
  'Le exigen un permiso que solo consta en una circular interna: ¿se cumple, se discute o se pide por escrito? ¿Con qué artículo se sostiene la respuesta?',
  'Un acuerdo de Secretaría contradice una ley del Congreso: ¿cuál se aplica y qué se hace con el que cede?',
  'Una norma vigente que nadie cumple alcanza a M.E.T.A.S: ¿se ignora como todos o se prepara la respuesta? ¿Qué cambia si un día la aplican?',
  'Un tratado sobre derechos de la niñez choca con un acuerdo departamental que pide fotos de menores: ¿qué prevalece y cómo se dice sin pelear?',
  'Un requisito viene en un instructivo que nunca se publicó: ¿es exigible? ¿Qué se pide antes de contestar?',
  'Dos funcionarios interpretan distinto el mismo artículo: ¿de qué depende cuál interpretación se aplica, y qué se guarda por escrito?',
  'Un reglamento pide más que su ley: ¿se cae el reglamento entero o solo una parte? ¿Qué se hace mientras tanto?',
  'Le contestan «siempre se ha hecho así»: ¿qué se responde en una línea, sin discutir con la persona?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Preguntar por escrito en qué norma consta el requisito.', b: 'Discutir en la ventanilla que el requisito es injusto.', ga: 'Caso A: pone la carga donde el artículo 321 la pone, deja constancia y muchas veces el requisito desaparece sin que nadie tenga que ceder en público.', gb: 'Caso B: convierte un problema de fundamento en un problema de personas. Aunque se tenga razón, no queda registro y el funcionario tiene que defenderse.' },
  { a: 'Comprobar la norma publicada y su fecha antes de contestar.', b: 'Contestar de memoria porque uno ya leyó eso alguna vez.', ga: 'Caso A: cuesta diez minutos y protege la credibilidad de todo lo demás que se va a decir en esa reunión.', gb: 'Caso B: si el artículo cambió de número o lo reformaron, se pierde el punto y con él la confianza. Es el error que esta ruta prohíbe expresamente.' },
  { a: 'Nombrar si el problema es de validez, de vigencia o de eficacia.', b: 'Decir que «la norma está mal» y pedir que la cambien.', ga: 'Caso A: cada uno tiene una respuesta distinta y una vía distinta. Nombrarlo bien es la mitad de la solución.', gb: 'Caso B: mezcla tres problemas en uno y deja al otro sin nada concreto que responder. No abre ninguna puerta.' },
  { a: 'Guardar copia sellada con el nombre y el cargo de quien recibió.', b: 'Entregar el documento y confiar en que quedó registrado.', ga: 'Caso A: convierte la entrega en un hecho probado, con fecha. Es lo que sostiene cualquier reclamo posterior.', gb: 'Caso B: si mañana dicen que no llegó, no hay forma de demostrar lo contrario, y el plazo empieza a correr en contra.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se confunde eficacia con vigencia y se da por muerta una norma que nadie cumple.', guide: 'El proyecto se acostumbra a ignorarla, y el día que alguien decide aplicarla no hay preparada ni una respuesta. Lo que era un riesgo dormido se vuelve un problema con plazo.' },
  { cause: 'Se acepta un requisito porque venía en hoja sellada, sin preguntar en qué norma consta.', guide: 'Se cumple un trámite que nadie podía exigir, y peor: queda el precedente de que aquí se cumple lo que se pida, así que la próxima vez se pedirá más.' },
  { cause: 'Se cita un artículo de memoria en una reunión y el número está mal.', guide: 'Se pierde el punto y, con él, la credibilidad de todo lo demás que se iba a decir. Esta es la razón exacta por la que la ruta prohíbe citar sin comprobar.' },
  { cause: 'Se busca «qué norma me autoriza» en vez de «qué norma me lo prohíbe».', guide: 'El proyecto se paraliza esperando un permiso que nadie tiene que dar, porque el artículo 70 ya reconoce que el particular puede lo que la ley no prohíbe.' },
  { cause: 'Se discute el fondo con quien está en la ventanilla en vez de pedirlo por escrito.', guide: 'La conversación no deja rastro, el requisito sigue vivo y ahora además hay una persona que tiene que quedar bien delante de su fila.' },
  { cause: 'Se entrega un documento sin pedir copia sellada de recibido.', guide: 'Si mañana dicen que no llegó, no hay cómo demostrarlo, y el plazo que uno creía cumplido nunca empezó a correr.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'El requisito raro desapareció sin que nadie tuviera que discutir.', guide: 'Se pidió por escrito en qué norma constaba. Muchas veces no consta en ninguna, y la petición de fundamento resuelve sola lo que una discusión habría endurecido.' },
  { effect: 'La reunión con la Secretaría se sostuvo sin ceder la autoría.', guide: 'Se llegó sabiendo que un acuerdo de Secretaría no puede recortar un derecho reconocido por una ley del Congreso, y se llevó por escrito qué se acepta y con qué condición.' },
  { effect: 'Cuando aplicaron aquella norma dormida, la respuesta ya estaba escrita.', guide: 'Se había apuntado como riesgo de eficacia y no como norma muerta. Estaba en el Registro de Grietas con su ficha y su respuesta preparada.' },
  { effect: 'El acuerdo departamental que pedía fotos de menores no se cumplió, y no pasó nada.', guide: 'Se contestó citando el tratado en vigor, que forma parte del derecho interno y prevalece sobre la ley, y con más razón sobre un acuerdo.' },
  { effect: 'Todo lo hablado en la dirección quedó probado.', guide: 'Se entregó por escrito y se guardó copia sellada con el nombre y el cargo de quien recibió. Lo que no queda por escrito no ocurrió.' },
  { effect: 'Nadie pudo decir que el proyecto necesitaba un permiso que no existía.', guide: 'Se buscó qué norma lo prohíbe en vez de qué norma lo autoriza, y esa pregunta, que es la del artículo 70, dejó el terreno claro desde el principio.' },
]);

/* ---------- línea de tiempo: las siete piezas ---------- */
B.timelineData = JSON.stringify([
  { y: '1', icon: '📜', label: 'La norma', text: 'Una regla que <strong>obliga aunque no estés de acuerdo</strong>. <strong>Se reconoce:</strong> porque hay consecuencia y alguien con facultad para aplicarla. <strong>Se confunde:</strong> con el papel sellado que solo organiza una oficina. <strong>Aquí:</strong> casi todo lo que le exigen a M.E.T.A.S no es norma.' },
  { y: '2', icon: '✅', label: 'La validez', text: 'Que la norma <strong>nació bien</strong>. <strong>Se comprueba:</strong> viendo si la dictó quien podía y por el camino que correspondía. <strong>Se pierde:</strong> cuando un órgano dicta lo que no le toca. <strong>Aquí:</strong> un acuerdo que recorta una ley es inválido en esa parte.' },
  { y: '3', icon: '📅', label: 'La vigencia', text: 'Que la norma <strong>está rigiendo hoy</strong>. <strong>Se comprueba:</strong> con la fecha de publicación y con lo que la haya reformado o derogado. <strong>Se pierde:</strong> citando de memoria un artículo que ya cambió. <strong>Aquí:</strong> un artículo es un texto con fecha, no un texto.' },
  { y: '4', icon: '🎯', label: 'La eficacia', text: 'Que la norma <strong>de verdad se cumple</strong>. <strong>Se mide:</strong> en la calle, no en el papel. <strong>Se confunde:</strong> con la vigencia, y esa es la confusión más cara de la etapa. <strong>Aquí:</strong> la norma que nadie cumple es un riesgo dormido, no una norma muerta.' },
  { y: '5', icon: '🏛️', label: 'La jerarquía', text: 'El orden que decide <strong>cuál gana el choque</strong>. <strong>Regla:</strong> Constitución, tratado, ley, reglamento, acuerdo, y al final el papel que no es norma. <strong>Se pierde:</strong> creyendo que lo específico gana a lo superior. <strong>Aquí:</strong> el artículo 320 la sostiene entera.' },
  { y: '6', icon: '💪', label: 'La coacción', text: 'La consecuencia <strong>respaldada por la fuerza del Estado</strong>. <strong>Sirve para:</strong> que la norma no dependa de la buena voluntad. <strong>No basta sola:</strong> con legitimidad se cumple sin vigilancia, y sin ella no alcanzan los inspectores. <strong>Aquí:</strong> la costumbre es la tercera pata, y no es escalón.' },
  { y: '7', icon: '🏢', label: 'La facultad', text: 'Lo que la ley le permite <strong>expresamente</strong> a un funcionario, y nada más (art. 321). <strong>Enfrente:</strong> el artículo 70, que dice que al particular nadie lo obliga a lo que la ley no manda. <strong>Aquí:</strong> de esa asimetría sale la pregunta de ventanilla de esta misión.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  norma: {
    nombre: 'Qué es una norma', icon: '📜',
    estructura: { title: 'Qué es', info: '• Una regla que <strong>obliga aunque no estés de acuerdo</strong><br>• Detrás hay una consecuencia y alguien con facultad para aplicarla<br>• No es el tono lo que la distingue de un consejo, es eso' },
    funcion: { title: 'Cómo se reconoce', info: '• Se pregunta <strong>quién la dictó y con qué facultad</strong><br>• Se busca dónde se publicó y desde cuándo rige<br>• Si nadie puede señalar norma ni fecha, es un papel, no una norma' },
    enfermedades: { title: 'Dónde se cae', info: '• Al confundir hoja membretada y sello con rango normativo<br>• Al aceptar de palabra lo que nadie quiere poner por escrito<br>• Al tratar la costumbre de una oficina como si fuera fuente' },
    cuidados: { title: 'En este proyecto', info: '• Casi todo lo que le exigen a M.E.T.A.S <strong>no es norma</strong><br>• Lo que sí lo es se puede nombrar: ley, decreto, artículo y fecha<br>• Lo demás se pide <strong>por escrito</strong>, y ahí suele desaparecer' },
  },
  escalones: {
    nombre: 'Los escalones', icon: '🏛️',
    estructura: { title: 'Qué es', info: '• De arriba abajo: <strong>Constitución, tratado en vigor, ley, reglamento, acuerdo</strong><br>• Y al final, el papel que no es norma: circular, instructivo, correo<br>• Abajo no puede contradecir arriba' },
    funcion: { title: 'Cómo se reconoce', info: '• Por <strong>quién la dictó</strong>: el Congreso hace leyes, el Ejecutivo reglamenta, la Secretaría acuerda<br>• El artículo 320 dice que entre Constitución y ley ordinaria se aplica la primera<br>• El artículo 18, que entre tratado y ley prevalece el tratado' },
    enfermedades: { title: 'Dónde se cae', info: '• Creyendo que lo más específico gana siempre: eso vale <strong>entre iguales</strong><br>• Aceptando que un acuerdo recorte un derecho que reconoce una ley<br>• Discutiendo el fondo antes de saber en qué escalón está el papel' },
    cuidados: { title: 'En este proyecto', info: '• El <strong>artículo 157</strong> es Constitución y por eso pesa tanto en el estatus de M.E.T.A.S<br>• La <strong>Ley Fundamental de Educación</strong> (Decreto 262-2011) es ley<br>• Lo que llega de un distrito suele ser acuerdo o circular: dos escalones más abajo' },
  },
  vida: {
    nombre: 'La vida de una norma', icon: '📅',
    estructura: { title: 'Qué es', info: '• <strong>Validez:</strong> nació bien<br>• <strong>Vigencia:</strong> rige hoy<br>• <strong>Eficacia:</strong> de verdad se cumple<br>• Son tres cosas distintas y no se implican entre sí' },
    funcion: { title: 'Cómo se reconoce', info: '• Validez: quién la dictó y por qué camino<br>• Vigencia: la publicación, la fecha de entrada y lo que la reformó<br>• Eficacia: lo que pasa de verdad en la ventanilla' },
    enfermedades: { title: 'Dónde se cae', info: '• Dando por <strong>derogada</strong> una norma que solo tiene eficacia cero<br>• Citando un artículo que ya fue reformado y cambió de contenido<br>• Suponiendo que lo publicado hace años sigue igual hoy' },
    cuidados: { title: 'En este proyecto', info: '• Toda cita lleva <strong>decreto de reforma y fecha de consulta</strong><br>• Una norma que nadie cumple se apunta como <strong>riesgo dormido</strong><br>• Lo que no se pudo comprobar se escribe como pendiente, a la vista' },
  },
  facultad: {
    nombre: 'La facultad y la pregunta', icon: '🏢',
    estructura: { title: 'Qué es', info: '• <strong>Art. 321:</strong> el servidor del Estado solo tiene las facultades que la ley le confiere expresamente<br>• Y lo que ejecute fuera de la ley es nulo e implica responsabilidad<br>• <strong>Art. 70:</strong> al particular nadie lo obliga a lo que la ley no manda' },
    funcion: { title: 'Cómo se reconoce', info: '• La pregunta de ventanilla: <strong>«¿en qué norma dice usted que puede exigirme esto?»</strong><br>• Se hace sin subir la voz y por escrito si se puede<br>• No es una pelea: es pedir el fundamento que la Constitución ya exige' },
    enfermedades: { title: 'Dónde se cae', info: '• Buscando <strong>qué norma me autoriza</strong> cuando la pregunta es qué norma me lo prohíbe<br>• Suponiendo que el cargo da la facultad: la da la ley<br>• Discutiendo con la persona en vez de pedir el fundamento' },
    cuidados: { title: 'En este proyecto', info: '• Toda exigencia se pide <strong>por escrito</strong>, con nombre y cargo de quien la hace<br>• De todo lo entregado se guarda <strong>copia sellada de recibido</strong><br>• Si aparece una contradicción, se abre su ficha en el <strong>Registro de Grietas</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Cumple lo que le digan 🌫️' },
  { t: 25, n: 'Distingue norma de papel 📜' },
  { t: 55, n: 'Sabe si rige hoy 📅' },
  { t: 90, n: 'Coloca cada cosa en su escalón 🏛️' },
  { t: 130, n: 'No confunde eficacia con vigencia 🎯' },
  { t: 165, n: 'Pregunta con qué facultad 🏢' },
  { t: 190, n: 'Pide la norma por escrito ⚖️' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la fuerza de la ley superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la norma explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de escalones experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la norma maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la ley' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta de la Ley y sus Grietas completada' },
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

/* la clave de progreso es propia de cada misión (norma 1) */
src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_ley_fuerza_v1';");

src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se nombra el escalón del papel que tienen delante: Constitución, tratado en vigor, ley, reglamento, acuerdo, o papel que no es norma. Después se pregunta con qué facultad, porque el artículo 321 dice que el servidor del Estado solo tiene las que la ley le confiere expresamente, y el artículo 70 dice que al particular nadie lo obliga a lo que la ley no manda. Luego se nombra si lo que falla es la validez, la vigencia o la eficacia, porque cada una tiene una vía distinta y una norma sin eficacia sigue viva. Y al final se contesta corto, por escrito y citando, se guarda copia sellada con el nombre y el cargo de quien recibió, y si del intercambio salió una contradicción entre dos normas se le abre su ficha en el Registro de Grietas antes de que se olvide.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  [/🗝️ \*Ruta de la Casa Cerrada · Etapa 4\* 🗝️/g, '⚖️ *Ruta de la Ley y sus Grietas · Etapa 1* ⚖️'],
  [/Validar lo que llega, ponerle límite y no dejar que un fallo pase callando, con los ocho fallos reales del 28 de julio de 2026\. 🚦/g,
    'De dónde saca su fuerza la ley: jerarquía, validez y coacción, con la pregunta que desarma un requisito sin norma detrás. 🏛️'],
  [/_Incluye evaluación conceptual y el llavero sobre la mesa\._ ✍️/g, '_Incluye evaluación conceptual y el papel sobre la mesa._ ✍️'],
  [/El llavero sobre la mesa/g, 'El papel sobre la mesa'],
  [/el llavero sobre la mesa/g, 'el papel sobre la mesa'],
  [/La llave sobre la mesa/g, 'El papel sobre la mesa'],
  [/Ruta de la Casa Cerrada · Etapa 4: Llaves y secretos/g, 'Ruta de la Ley y sus Grietas · Etapa 1: De dónde saca su fuerza la ley'],
  [/Llaves y secretos: claves, entornos y repositorios/g, 'De dónde saca su fuerza la ley: jerarquía, validez y coacción'],
  [/Llaves y secretos/g, 'De dónde saca su fuerza la ley'],
  [/llaves y secretos/g, 'de dónde saca su fuerza la ley'],
  [/Etapa 4 · Ciberseguridad/g, 'Etapa 1 · Derecho y Ley'],
  [/🗝️ ¡/g, '⚖️ ¡'],
  [/completó la Etapa 4 de la Ruta de la Casa Cerrada/g, 'completó la Etapa 1 de la Ruta de la Ley y sus Grietas'],
  [/Ruta de la Casa Cerrada/g, 'Ruta de la Ley y sus Grietas'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV venían de la etapa de las llaves. */
src = src.replace(/¿Qué puede abrir esa llave[^<]*/g,
  '¿En qué escalón vive ese papel, quién lo exige tiene facultad expresa para exigirlo y qué falla: la validez, la vigencia o la eficacia? Explica qué contestas por escrito y qué guardas del intercambio.');
src = src.replace(/1\. ¿Cuál de los dos deja la puerta cerrada de verdad, y por qué\? 2\. ¿Por qué no son la misma decisión\?/g,
  '1. ¿Cuál de los dos deja constancia y pone la carga donde la pone el artículo 321? 2. ¿Por qué no son la misma decisión?');

/* El desenlace de la simulación seguía narrando la clave subida al repositorio.
   Aquí la decisión es la de la ventanilla: cumplir un requisito que nadie puede
   fundamentar, o pedir por escrito en qué norma consta. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(pideLaNorma){sfx(pideLaNorma?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(pideLaNorma){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">📝</span><span class="ms-text"><strong>Pediste la norma por escrito:</strong> nombre del requisito, artículo en que consta, y quién lo exige con su cargo. Sin levantar la voz y sin discutir el fondo.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">⚖️</span><span class="ms-text"><strong>Y el requisito se cayó solo:</strong> no constaba en ninguna norma, y el artículo 321 dice que el servidor del Estado no tiene más facultades que las que la ley le confiere expresamente. Nadie tuvo que ceder en público.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🧾</span><span class="ms-text"><strong>Cumpliste el requisito:</strong> se consiguió el papel, se pagó la copia y el trámite avanzó esa tarde. La sensación fue de problema resuelto.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📎</span><span class="ms-text"><strong>Y quedó el precedente:</strong> aquí se cumple lo que se pida. La próxima vez se pedirá uno más, y ahora será más difícil preguntar, porque la vez pasada no se preguntó.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='norma',labAspecto='estructura';");

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
const quedan = (src.match(/llave|clave|secreto|Casa Cerrada/gi) || []).length;
console.log('Rastros del molde que quedan en el JS: ' + quedan + ' (revisar si no es 0)');
