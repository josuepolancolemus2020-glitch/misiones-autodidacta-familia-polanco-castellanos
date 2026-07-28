/* Inyecta los bancos de la misión «Verificar: nadie firma lo que no leyó»
   (Ruta de la Máquina que Predice, etapa 3) sobre el molde copiado de la
   etapa 2, y de paso cambia los rótulos que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-verificar.js

   Los cinco primeros casos de la misión son fallos REALES de esta casa y
   están escritos en el repositorio, así que las cifras no se inventan:

     · los 226 mm: la carta menos una pulgada por lado, que es el margen por
       defecto de Chrome y no el que declara la hoja (11 mm). El alto real es
       252. Costó dos vueltas y la letra encogida a 9,5 pt. (norma 6)
     · la constancia que decía «Etapa 1» estando en la 2, y otros cinco
       rótulos que viajaron de misión en misión sin que nadie los leyera.
     · la política que decía using (true) y dejaba entrar a cualquiera.
     · las tres comprobaciones escritas de forma que aprobaban siempre.
     · la herramienta de reparto que reescribía las 21 misiones de una pasada.

   Los tres últimos son situaciones que le pueden llegar a M.E.T.A.S: la cita
   inventada en una ficha de 300 copias, el resumen que se comió la fecha
   límite y el correo a la Secretaría que prometió de más.                   */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-maquina-verificar', 'js', 'verificar.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260729;
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

B.SAVE_KEY = `'faro_ia_verificar_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la verificación superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de la verificación explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de dato y opinión experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la verificación maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la verificación' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta de la Máquina que Predice completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Copia y pega 🌫️' },
  { t: 25, n: 'Lee entero antes de usar 📖' },
  { t: 55, n: 'Marca lo comprobable 🔍' },
  { t: 90, n: 'Le pone riesgo a cada dato ⚖️' },
  { t: 130, n: 'Comprueba por fuera 🌐' },
  { t: 165, n: 'Busca lo que falta 🕳️' },
  { t: 190, n: 'Firma lo que entrega ✍️' },
]);

B.fcData = JSON.stringify([
  { w: 'Texto probable', a: '🎲 Lo que produce el modelo: la continuación <strong>más plausible</strong>, no la verdadera. Para él las dos cosas son lo mismo, y por eso un dato inventado y uno correcto salen con la misma cara.' },
  { w: 'El dato falso bien escrito', a: '🎩 El error peligroso. No es el disparate (ese se ve de lejos): es la cifra verosímil, la cita con autor y año, el artículo de ley con su número. <strong>Llega hasta la imprenta</strong> porque nada en él avisa.' },
  { w: 'El tono seguro', a: '🗣️ Un rasgo del estilo, <strong>no una señal de certeza</strong>. La máquina no sabe que no sabe, así que escribe igual de firme lo que le consta y lo que completó.' },
  { w: 'Verificar', a: '🔎 Comprobar una afirmación <strong>contra algo que no la produjo</strong>. Si la comprobación sale de la misma fuente que la afirmación, no es una verificación: es una repetición.' },
  { w: 'Comprobar por fuera', a: '🌐 Abrir <strong>otra cosa</strong>: el texto oficial, la página del ministerio, el archivo del proyecto, el código corriendo. Vale precisamente porque no depende de quien hizo la afirmación.' },
  { w: 'Verificación falsa', a: '❌ «¿Estás seguro?», «dame la fuente», «confírmalo». Todo eso pide <strong>otra predicción</strong>. Si inventó el artículo, puede inventar igual de bien el enlace que lo respalda.' },
  { w: 'La complacencia', a: '🙂 La máquina tiende a <strong>darte la razón</strong>. Si preguntas «¿verdad que conviene?», suele salir que sí; y si insistes, cambia de opinión. Por eso la pregunta se hace neutra o no se hace.' },
  { w: 'La omisión', a: '🕳️ El error que no está en la respuesta, porque <strong>consiste en lo que no dijo</strong>: la excepción, la fecha límite, el requisito. Solo lo ve quien leyó el original.' },
  { w: 'La escala de riesgo', a: '⚖️ Cuánto verificar no depende de lo raro que suene, sino de <strong>qué pasa si está mal</strong>. Un adorno se lee y basta; una cifra que va a una ficha impresa se comprueba una por una.' },
  { w: 'Fuente primaria', a: '📜 El documento original, no quien lo cuenta: el texto oficial de la ley, la convocatoria completa, el archivo del proyecto. Es lo único que cierra una duda de riesgo alto.' },
  { w: 'La firma', a: '✍️ Quien entrega, responde. <strong>«Lo dijo la IA» no es una defensa</strong> ante una maestra, ni ante una institución, ni en la mesa de esta casa. La máquina no tiene nada que perder; tú sí.' },
  { w: 'La prueba de las palabras propias', a: '🗯️ Si no puedes explicar algo con tus palabras, <strong>no lo leíste: lo moviste</strong>. Y lo que se mueve sin leer llega igual a la ficha impresa, ya con tu nombre debajo.' },
  { w: 'Un cálculo no es una medición', a: '📏 Un razonamiento correcto sobre un dato equivocado suena perfecto. Los 226 milímetros de esta casa salieron así, y costaron dos vueltas: <strong>lo que se puede medir, se mide</strong>.' },
  { w: 'La prueba que nunca falló', a: '🎭 Una comprobación que no se ha visto <strong>fallar al menos una vez</strong> no se sabe si funciona. Tres de esta casa avisaban pero nunca detenían nada, y salían en verde igual.' },
  { w: 'El alcance de una herramienta', a: '🔁 De una herramienta no se verifica el resultado que promete, sino <strong>todo lo que toca</strong>. La comprobación buena casi nunca es leer su informe: es mirar la lista de archivos que cambió.' },
  { w: 'Los verbos que comprometen', a: '📣 En un texto que va hacia fuera se buscan uno por uno: acompañamos, garantizamos, entregamos, capacitamos. <strong>Cada uno es una promesa que alguien va a cobrar.</strong>' },
]);

B.qzData = JSON.stringify([
  { q: '¿Cuál es el error peligroso de una respuesta de IA?', o: ['a) El disparate, que se ve de lejos', 'b) El dato falso bien escrito', 'c) Que sea muy larga', 'd) Que use palabras difíciles'], c: 1 },
  { q: 'El tono seguro con el que está escrito algo indica…', o: ['a) Que la máquina lo comprobó', 'b) Que viene de una fuente fiable', 'c) Nada sobre si es cierto', 'd) Que el encargo estaba bien hecho'], c: 2 },
  { q: 'Preguntarle a la misma máquina «¿estás seguro?» produce…', o: ['a) Una verificación', 'b) Otra predicción', 'c) La fuente original', 'd) Un aviso de error'], c: 1 },
  { q: '¿Qué decide cuánto hay que verificar una respuesta?', o: ['a) Lo rara que suene', 'b) Lo larga que sea', 'c) Cuánto tiempo haya', 'd) Qué pasa si está mal'], c: 3 },
  { q: 'El error que no se puede buscar dentro de la respuesta es…', o: ['a) La omisión', 'b) La cifra inventada', 'c) La cita falsa', 'd) La lógica que no cierra'], c: 0 },
  { q: '¿Qué significa comprobar por fuera?', o: ['a) Pedirle a la máquina que se califique', 'b) Releerlo hasta que suene bien', 'c) Abrir una fuente que no produjo la afirmación', 'd) Preguntarle a otra IA lo mismo'], c: 2 },
  { q: '«Lo dijo la IA» como defensa ante una maestra…', o: ['a) Sirve si se cita la herramienta', 'b) No sirve: quien entrega, firma', 'c) Sirve si el error es pequeño', 'd) Depende del encargo'], c: 1 },
  { q: 'Los 226 milímetros de esta casa fallaron porque…', o: ['a) El número se calculó en vez de medirse', 'b) La impresora estaba mal', 'c) Nadie leyó la norma', 'd) La hoja cambió de tamaño'], c: 0 },
  { q: 'Una comprobación que nunca se ha visto fallar…', o: ['a) Es la mejor señal de que todo va bien', 'b) No se sabe si funciona', 'c) Se puede borrar', 'd) Hay que ejecutarla más veces'], c: 1 },
  { q: 'Si no puedes explicar algo con tus palabras, lo correcto es…', o: ['a) Entregarlo igual y avisar', 'b) Pedirle a la máquina que lo simplifique', 'c) No entregarlo', 'd) Entregarlo citando la herramienta'], c: 2 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Dato', 'Estilo'], headA: '🔎 Dato comprobable', headB: '💬 Estilo u opinión', colA: 'ok', colB: 'no',
    words: [
      { w: 'El artículo 123 de la Constitución', t: 'ok' }, { w: '«Un tema apasionante para los niños»', t: 'no' },
      { w: 'La fecha de cierre de inscripciones', t: 'ok' }, { w: 'El orden de los párrafos', t: 'no' },
      { w: '«El estudio de 2019 concluyó que…»', t: 'ok' }, { w: 'Que la introducción quede cálida', t: 'no' },
      { w: 'El enlace a la convocatoria', t: 'ok' }, { w: 'El emoji del título', t: 'no' },
    ],
  },
  {
    label: ['De verdad', 'De mentira'], headA: '✅ Verificación real', headB: '❌ Verificación falsa', colA: 'ok', colB: 'no',
    words: [
      { w: 'Abrir el texto oficial y buscar el artículo', t: 'ok' }, { w: 'Preguntarle «¿estás seguro?»', t: 'no' },
      { w: 'Ejecutar el código con el caso real', t: 'ok' }, { w: 'Pedirle que se ponga una nota', t: 'no' },
      { w: 'Buscar la frase textual de la cita', t: 'ok' }, { w: 'Releerlo hasta que suene bien', t: 'no' },
      { w: 'Comparar con el archivo del proyecto', t: 'ok' }, { w: 'Pedirle el enlace que lo respalda', t: 'no' },
    ],
  },
  {
    label: ['Alto', 'Bajo'], headA: '🔴 Riesgo alto', headB: '🟢 Riesgo bajo', colA: 'ok', colB: 'no',
    words: [
      { w: 'Una cifra en una ficha de 300 copias', t: 'ok' }, { w: 'El título de un párrafo de adorno', t: 'no' },
      { w: 'Un compromiso en un correo a la Secretaría', t: 'ok' }, { w: 'La redacción de una frase interna', t: 'no' },
      { w: 'Código que se sube a la aplicación', t: 'ok' }, { w: 'Un emoji en un botón', t: 'no' },
      { w: 'Una ley citada en material escolar', t: 'ok' }, { w: 'El orden de dos ejemplos', t: 'no' },
    ],
  },
  {
    label: ['Se delega', 'No se delega'], headA: '🤝 Se le puede pedir', headB: '🚫 No se delega jamás', colA: 'ok', colB: 'no',
    words: [
      { w: 'Redactar un primer borrador', t: 'ok' }, { w: 'Firmar la entrega', t: 'no' },
      { w: 'Ordenar ideas ya decididas', t: 'ok' }, { w: 'Decidir qué se promete por escrito', t: 'no' },
      { w: 'Proponer títulos alternativos', t: 'ok' }, { w: 'Comprobar si un dato es cierto', t: 'no' },
      { w: 'Resumir un texto que vas a leer igual', t: 'ok' }, { w: 'Elegir qué se le enseña a las niñas', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['El', 'modelo', 'predice', 'texto', 'probable.'], c: 1, art: 'Quien escribe la respuesta' },
  { s: ['El', 'tono', 'seguro', 'no', 'prueba', 'nada.'], c: 1, art: 'Un rasgo del estilo, no de la certeza' },
  { s: ['La', 'omisión', 'no', 'está', 'en', 'la', 'respuesta.'], c: 1, art: 'El error que consiste en lo que falta' },
  { s: ['El', 'riesgo', 'decide', 'cuánto', 'se', 'comprueba.'], c: 1, art: 'Qué pasa si ese dato está mal' },
  { s: ['La', 'fuente', 'tiene', 'que', 'ser', 'independiente.'], c: 1, art: 'Contra qué se comprueba' },
  { s: ['La', 'firma', 'la', 'pone', 'quien', 'entrega.'], c: 1, art: 'Lo que no se delega jamás' },
  { s: ['Una', 'cita', 'falsa', 'se', 'escribe', 'igual', 'de', 'bien.'], c: 1, art: 'Lo que hay que abrir para comprobar' },
  { s: ['Un', 'cálculo', 'no', 'es', 'una', 'medición.'], c: 1, art: 'Lo que sonaba correcto y costó dos vueltas' },
]);

B.cmpData = JSON.stringify([
  { s: 'El modelo produce texto ___, no texto verdadero.', opts: ['probable', 'revisado', 'oficial'], c: 0 },
  { s: 'El error peligroso es el dato falso bien ___.', opts: ['escrito', 'guardado', 'traducido'], c: 0 },
  { s: 'Comprobar por fuera significa abrir una fuente ___.', opts: ['independiente', 'parecida', 'reciente'], c: 0 },
  { s: 'Lo que decide cuánto verificar es el ___.', opts: ['riesgo', 'tiempo', 'tamaño'], c: 0 },
  { s: 'El error que consiste en lo que no se dijo es la ___.', opts: ['omisión', 'cita', 'lógica'], c: 0 },
  { s: 'Preguntarle si está seguro produce otra ___.', opts: ['predicción', 'fuente', 'prueba'], c: 0 },
  { s: 'Quien entrega, ___.', opts: ['firma', 'espera', 'consulta'], c: 0 },
  { s: 'Lo que no se puede explicar con palabras propias no se ___.', opts: ['entrega', 'guarda', 'imprime'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Dato', 'Estilo'], btnA: '🔎 Dato', btnB: '💬 Estilo', colA: 'ok', colB: 'no',
    words: [
      { w: 'Un artículo de ley', t: 'ok' }, { w: 'El tono del párrafo', t: 'no' },
      { w: 'Una fecha límite', t: 'ok' }, { w: 'El orden de las ideas', t: 'no' },
      { w: 'Una cifra', t: 'ok' }, { w: 'Un emoji', t: 'no' },
      { w: 'Un enlace', t: 'ok' }, { w: 'La longitud del título', t: 'no' },
      { w: 'El nombre de un autor', t: 'ok' }, { w: 'Que quede cálido', t: 'no' },
    ],
  },
  {
    label: ['De verdad', 'De mentira'], btnA: '✅ Real', btnB: '❌ Falsa', colA: 'ok', colB: 'no',
    words: [
      { w: 'Abrir el texto oficial', t: 'ok' }, { w: '«¿Estás seguro?»', t: 'no' },
      { w: 'Ejecutar el código', t: 'ok' }, { w: 'Pedirle el enlace', t: 'no' },
      { w: 'Buscar la frase textual', t: 'ok' }, { w: 'Releerlo otra vez', t: 'no' },
      { w: 'Mirar el archivo original', t: 'ok' }, { w: 'Pedirle que se califique', t: 'no' },
      { w: 'Preguntar a quien lo escribió', t: 'ok' }, { w: 'Insistir hasta que cambie', t: 'no' },
    ],
  },
  {
    label: ['Alto', 'Bajo'], btnA: '🔴 Riesgo alto', btnB: '🟢 Riesgo bajo', colA: 'ok', colB: 'no',
    words: [
      { w: 'Una ley en una ficha impresa', t: 'ok' }, { w: 'Un título de adorno', t: 'no' },
      { w: 'Código que se sube', t: 'ok' }, { w: 'Un emoji', t: 'no' },
      { w: 'Una promesa por escrito', t: 'ok' }, { w: 'El orden de dos ejemplos', t: 'no' },
      { w: 'Una cifra que se publica', t: 'ok' }, { w: 'Una frase de saludo', t: 'no' },
      { w: 'Un dato médico', t: 'ok' }, { w: 'El color de un botón', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se verifica una respuesta, de principio a fin', steps: ['Leer la respuesta entera hasta el final, antes de decidir nada', 'Marcar todo lo comprobable: cifras, fechas, nombres, citas, enlaces y promesas', 'Ponerle riesgo a cada marca: qué pasa exactamente si esa está mal', 'Comprobar por fuera las de riesgo alto, con una fuente que no sea la máquina', 'Volver al original a buscar lo que falta, que no aparece en la respuesta', 'Corregir o borrar, y firmar anotando contra qué se comprobó'] },
  { label: 'Cómo se comprueba una cita o un dato', steps: ['Copiar la frase textual, no el resumen', 'Buscarla en la fuente primaria, no en quien la cuenta', 'Comprobar que el número, el año y el nombre coincidan', 'Si no aparece, borrarla en vez de dejarla por si acaso'] },
  { label: 'Qué se hace con un texto que va hacia fuera', steps: ['Leerlo entero en voz alta, que es donde se oyen las promesas', 'Subrayar los verbos que comprometen: acompañamos, garantizamos, entregamos', 'Comprobar uno por uno si el proyecto puede cumplirlos hoy', 'Quitar los que no, y dejar solo lo que se está dispuesto a firmar', 'Guardar la versión enviada, con la fecha y quién la revisó'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Hacerlo entero y hasta el final, antes de decidir nada', ans: 'Leer', opts: ['Leer', 'Marcar', 'Firmar', 'Comprobar'] },
  { desc: 'Señalar las cifras, fechas, nombres, citas y promesas', ans: 'Marcar lo comprobable', opts: ['Marcar lo comprobable', 'Leer entero', 'Medir el riesgo', 'Corregir'] },
  { desc: 'Preguntarse qué pasa exactamente si ese dato está mal', ans: 'Medir el riesgo', opts: ['Medir el riesgo', 'Comprobar por fuera', 'Marcar lo comprobable', 'Firmar'] },
  { desc: 'Abrir una fuente que no produjo la afirmación', ans: 'Comprobar por fuera', opts: ['Comprobar por fuera', 'Preguntar otra vez', 'Medir el riesgo', 'Leer entero'] },
  { desc: 'Volver al original a ver qué tendría que estar y no está', ans: 'Buscar lo que falta', opts: ['Buscar lo que falta', 'Comprobar por fuera', 'Corregir o borrar', 'Marcar'] },
  { desc: 'Quitar lo que no se pudo comprobar, en vez de dejarlo por si acaso', ans: 'Corregir o borrar', opts: ['Corregir o borrar', 'Firmar', 'Medir el riesgo', 'Leer entero'] },
  { desc: 'Anotar contra qué se comprobó y quién responde', ans: 'Firmar y registrar', opts: ['Firmar y registrar', 'Corregir o borrar', 'Comprobar por fuera', 'Marcar'] },
  { desc: 'El error que no está en la respuesta porque consiste en lo que falta', ans: 'La omisión', opts: ['La omisión', 'El dato inventado', 'La fuente falsa', 'La complacencia'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: '«El artículo 123 de la Constitución dice…»', func: 'Abrir el texto oficial y buscar ese artículo', opts: ['Abrir el texto oficial y buscar ese artículo', 'Preguntarle si está seguro del número', 'Pedirle que cite la fuente', 'Buscar el número en otra respuesta suya'] },
  { trans: '«Según un estudio de 2019, el 68% de los docentes…»', func: 'Buscar el estudio y comprobar la cifra en el original', opts: ['Buscar el estudio y comprobar la cifra en el original', 'Preguntarle quién hizo el estudio', 'Aceptarlo porque la cifra es razonable', 'Pedirle que lo confirme'] },
  { trans: '«Este código ya funciona, puedes subirlo»', func: 'Ejecutarlo con el caso real que importa', opts: ['Ejecutarlo con el caso real que importa', 'Pedirle que lo revise otra vez', 'Leerlo hasta que se entienda', 'Subirlo y ver qué pasa'] },
  { trans: '«Aquí tienes el resumen del reglamento»', func: 'Abrir el original y buscar lo que el resumen no menciona', opts: ['Abrir el original y buscar lo que el resumen no menciona', 'Pedirle un resumen más largo', 'Preguntarle si dejó algo fuera', 'Compararlo con otro resumen suyo'] },
  { trans: '«El proyecto acompaña a los centros todo el año»', func: 'Comprobar quién decidió ese compromiso y si se puede cumplir', opts: ['Comprobar quién decidió ese compromiso y si se puede cumplir', 'Pedirle que lo escriba más suave', 'Dejarlo, que suena bien', 'Preguntarle si es exagerado'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'La ficha salió con la letra encogida y con un hueco enorme abajo', characteristic: 'El alto útil de la hoja se calculó en vez de medirse', opts: ['El alto útil de la hoja se calculó en vez de medirse', 'La impresora estaba mal configurada', 'Se escribió demasiado texto', 'El papel no era tamaño carta'] },
  { disease: 'La constancia felicitaba por completar una etapa que no era', characteristic: 'Se copió el molde sin leer los rótulos que no dan error', opts: ['Se copió el molde sin leer los rótulos que no dan error', 'Se equivocó el número en el catálogo', 'La misión cambió de etapa después', 'Faltaba una traducción'] },
  { disease: 'La casa parecía cerrada y entraba cualquiera que se registrara', characteristic: 'Se leyó el nombre de la regla y no lo que hacía', opts: ['Se leyó el nombre de la regla y no lo que hacía', 'La base de datos estaba mal instalada', 'Faltaba una contraseña', 'El servidor estaba caído'] },
  { disease: 'Las comprobaciones salían en verde y la puerta seguía abierta', characteristic: 'Nunca se vio fallar ninguna: avisaban pero no detenían nada', opts: ['Nunca se vio fallar ninguna: avisaban pero no detenían nada', 'Se ejecutaron pocas veces', 'Estaban escritas en otro idioma', 'Faltaba una comprobación más'] },
  { disease: 'Una herramienta arregló un banco y cambió las veintiuna misiones', characteristic: 'Se leyó su informe en vez de la lista de archivos que tocó', opts: ['Se leyó su informe en vez de la lista de archivos que tocó', 'La herramienta tenía un error', 'Se ejecutó dos veces seguidas', 'Faltaba hacer una copia'] },
  { disease: 'El correo salió con un compromiso que nadie había decidido', characteristic: 'No se buscaron los verbos que comprometen antes de enviarlo', opts: ['No se buscaron los verbos que comprometen antes de enviarlo', 'El correo era demasiado largo', 'Se envió a la persona equivocada', 'Faltaba la firma al pie'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'La continuación más plausible, que no siempre es la verdadera.', type: 'Texto probable' },
  { s: 'La cifra verosímil y la cita con autor y año que no existen.', type: 'Dato falso bien escrito' },
  { s: 'Un rasgo del estilo que no dice nada sobre la certeza.', type: 'El tono seguro' },
  { s: 'Comprobar contra una fuente que no produjo la afirmación.', type: 'Comprobar por fuera' },
  { s: 'Preguntarle a la misma máquina si tiene razón.', type: 'Verificación falsa' },
  { s: 'La tendencia a darte la razón cuando insistes.', type: 'La complacencia' },
  { s: 'El error que consiste en lo que no se dijo.', type: 'La omisión' },
  { s: 'Qué pasa si ese dato está mal.', type: 'El riesgo' },
  { s: 'El documento original, no quien lo cuenta.', type: 'Fuente primaria' },
  { s: 'Quien entrega, responde por lo entregado.', type: 'La firma' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'El artículo 123 de la Constitución', gen: 'Contenido', n: 'Se puede abrir y mirar', g: 'Dato comprobable', t: 'Existe o no existe' },
  { w: 'Que la introducción quede cálida', gen: 'Contenido', n: 'No se puede abrir', g: 'Estilo u opinión', t: 'Se discute, no se comprueba' },
  { w: 'La fecha de cierre de inscripciones', gen: 'Contenido', n: 'Se puede abrir y mirar', g: 'Dato comprobable', t: 'Existe o no existe' },
  { w: 'El emoji del título', gen: 'Contenido', n: 'No se puede abrir', g: 'Estilo u opinión', t: 'Se discute, no se comprueba' },
  { w: 'Abrir el texto oficial', gen: 'Método', n: 'Fuente independiente', g: 'Verificación real', t: 'No depende de la máquina' },
  { w: 'Preguntarle «¿estás seguro?»', gen: 'Método', n: 'La misma fuente', g: 'Verificación falsa', t: 'Es otra predicción' },
  { w: 'Una cifra en una ficha de 300 copias', gen: 'Riesgo', n: 'Sale de casa impresa', g: 'Riesgo alto', t: 'Se comprueba una por una' },
  { w: 'El título de un párrafo de adorno', gen: 'Riesgo', n: 'No decide nada', g: 'Riesgo bajo', t: 'Se lee y basta' },
  { w: 'Redactar un primer borrador', gen: 'Delegación', n: 'Se revisa después', g: 'Se le puede pedir', t: 'La persona sigue decidiendo' },
  { w: 'Firmar la entrega', gen: 'Delegación', n: 'Nadie más responde', g: 'No se delega jamás', t: 'Quien entrega, responde' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'El modelo produce texto ___, no texto verdadero.', opts: ['probable', 'revisado', 'oficial'], ans: 'probable' },
  { s: 'El error peligroso es el dato falso bien ___.', opts: ['escrito', 'guardado', 'traducido'], ans: 'escrito' },
  { s: 'Comprobar por fuera es abrir una fuente ___.', opts: ['independiente', 'parecida', 'reciente'], ans: 'independiente' },
  { s: 'Lo que decide cuánto verificar es el ___.', opts: ['riesgo', 'tiempo', 'tamano'], ans: 'riesgo' },
  { s: 'El error que consiste en lo que no se dijo es la ___.', opts: ['omision', 'cita', 'logica'], ans: 'omision' },
  { s: 'Preguntarle si está seguro produce otra ___.', opts: ['prediccion', 'fuente', 'prueba'], ans: 'prediccion' },
  { s: 'Quien entrega, ___.', opts: ['firma', 'espera', 'consulta'], ans: 'firma' },
  { s: 'Un cálculo no es una ___.', opts: ['medicion', 'opinion', 'prueba'], ans: 'medicion' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica por qué el tono seguro de una respuesta no dice nada sobre si es cierta.', ans: 'Porque el modelo produce la continuación más probable del texto, y para él un dato que le consta y uno que completó son lo mismo: texto plausible. La seguridad con la que algo está redactado es un rasgo del estilo, no una medida de certeza, y la máquina no tiene forma de saber que no sabe. De ahí sale el error peligroso de esta etapa, que no es el disparate (ese se ve de lejos y se borra) sino el dato falso bien escrito: la cifra verosímil, la cita con autor y año, el artículo de ley con su número. Está redactado exactamente igual que lo cierto, así que nada dentro de la respuesta avisa, y por eso llega hasta la imprenta.' },
  { q: '¿Qué es comprobar por fuera y por qué no vale preguntarle a la misma máquina?', ans: 'Comprobar por fuera es contrastar la afirmación contra algo que no la produjo: el texto oficial, la página del organismo, el archivo del proyecto, el código ejecutándose con el caso real. Vale precisamente porque no depende de quien hizo la afirmación. Preguntarle a la misma máquina «¿estás seguro?» o «dame la fuente» no es una verificación: es pedirle otra predicción, y si inventó un artículo puede inventar igual de bien el enlace que lo respalda. Hay además un problema peor, que es la complacencia: la máquina tiende a darte la razón y, si insistes, cambia de opinión. Así que insistir no acerca a la verdad, solo mueve la respuesta hacia lo que pareces querer oír.' },
  { q: 'Explica la escala de riesgo y por qué no se verifica todo igual.', ans: 'Porque verificar cuesta tiempo, que es el gasto más grande del proyecto, así que hace falta un criterio para repartirlo. El criterio no es lo raro que suene la respuesta, sino qué pasa si está mal. Riesgo bajo son los títulos, los emojis y la redacción de adorno: se leen enteros y basta. Riesgo medio es un texto explicativo o un correo interno: se leen los datos y se comprueba lo que se afirma. Riesgo alto es una cifra, una cita o una ley que va a una ficha impresa: fuente primaria, una por una. Y riesgo muy alto es el código que se sube y cualquier compromiso por escrito con alguien de fuera: se prueba el caso real y lo revisa una segunda persona.' },
  { q: '¿Por qué la omisión es el error más difícil de encontrar? Da el ejemplo del reglamento.', ans: 'Porque no está en la respuesta: consiste justamente en lo que no está. Los otros errores (el dato inventado, la fuente falsa, la lógica que no cierra) se pueden buscar leyendo con atención lo que hay escrito. La omisión solo la ve quien sabe qué tendría que estar. El ejemplo de esta casa es el resumen del reglamento de un concurso: era correcto, ordenado y claro, y no decía ni una mentira. Lo que pasaba es que no mencionaba la fecha de cierre de inscripciones, que estaba en una nota al pie del original. Contra un resumen solo hay una defensa: abrir el original y leer al menos los encabezados y las notas, buscando lo que falta.' },
  { q: 'Cuenta el caso de los 226 milímetros y di qué regla dejó escrita.', ans: 'Para saber cuánto texto cabe en una hoja carta se calculó el alto útil en vez de medirlo: 279,4 milímetros menos una pulgada por lado, o sea 226. El razonamiento era correcto, pero esa pulgada es el margen por defecto de Chrome y no el que declara la hoja de F.A.R.O, que son 11 milímetros. El alto real era 252. Como consecuencia se desperdiciaban 26 milímetros en cada página y se encogió la letra a 9,5 puntos para que cupiera algo que ya cabía, y costó dos vueltas enteras de trabajo. La regla que quedó escrita en la norma 6 es que un cálculo no es una medición: lo que se puede medir, se mide, y en el caso de las fichas el PDF es el único juez.' },
  { q: '¿Qué significa que quien entrega firma, y qué se hace con un texto que va hacia fuera?', ans: 'Significa que la responsabilidad no se puede repartir con la máquina. Ella no tiene trabajo que perder, ni una maestra enfrente, ni un nombre en el pie de la ficha; la persona que pega el texto, sí. «Lo dijo la IA» no es una defensa ante una maestra, ni ante una institución, ni en la mesa de esta casa. Con un texto que va hacia fuera el método es concreto: se lee entero en voz alta, que es donde se oyen las promesas; se subrayan los verbos que comprometen (acompañamos, garantizamos, entregamos, capacitamos); se comprueba uno por uno si el proyecto puede cumplirlos hoy; se quitan los que no; y se guarda la versión enviada con la fecha y quién la revisó. Cada verbo de esos es una promesa que alguien va a cobrar.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['VERIFICAR', 'FUENTE', 'DATO', 'RIESGO', 'FIRMA', 'LEER']),
  haceSopa(10, ['CITA', 'PRUEBA', 'ERROR', 'ORIGEN', 'COPIA', 'DUDA']),
  haceSopa(10, ['OMISION', 'REVISAR', 'SESGO', 'TEXTO', 'PAPEL', 'LIMITE']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'El modelo distingue por dentro entre lo que sabe y lo que completa.', a: false },
  { q: 'Un dato inventado y uno correcto salen escritos con la misma cara.', a: true },
  { q: 'El tono seguro de una respuesta indica que fue comprobada.', a: false },
  { q: 'Preguntarle a la misma máquina si está segura es una verificación válida.', a: false },
  { q: 'Comprobar por fuera es contrastar contra una fuente que no produjo la afirmación.', a: true },
  { q: 'Cuánto se verifica depende de qué pasa si el dato está mal.', a: true },
  { q: 'La omisión se puede encontrar leyendo con atención la respuesta.', a: false },
  { q: 'La máquina tiende a darte la razón si insistes.', a: true },
  { q: '«Lo dijo la IA» sirve como defensa si el error fue pequeño.', a: false },
  { q: 'Una comprobación que nunca se ha visto fallar no se sabe si funciona.', a: true },
  { q: 'Un cálculo correcto sobre un dato equivocado suena igual de convincente.', a: true },
  { q: 'De una herramienta basta con verificar el resultado que promete.', a: false },
  { q: 'Lo que no se puede explicar con palabras propias no se entrega.', a: true },
  { q: 'Una cita que no aparece en la fuente se deja por si acaso.', a: false },
  { q: 'En un texto que va hacia fuera hay que buscar los verbos que comprometen.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Cuál es el error peligroso de una respuesta de IA?', o: ['a) El dato falso bien escrito', 'b) El disparate evidente', 'c) La respuesta demasiado larga', 'd) El vocabulario difícil'], a: 0 },
  { q: 'El tono seguro de un texto indica…', o: ['a) Que la máquina lo comprobó', 'b) Que la fuente es buena', 'c) Nada sobre si es cierto', 'd) Que el encargo fue claro'], a: 2 },
  { q: 'Pedirle a la máquina que confirme su respuesta produce…', o: ['a) Una verificación', 'b) La fuente original', 'c) Un aviso de error', 'd) Otra predicción'], a: 3 },
  { q: '¿Qué decide cuánto verificar?', o: ['a) Lo raro que suene', 'b) Qué pasa si está mal', 'c) La longitud del texto', 'd) El tiempo disponible'], a: 1 },
  { q: 'El error que no se puede buscar dentro de la respuesta es…', o: ['a) La cifra inventada', 'b) La cita falsa', 'c) La omisión', 'd) La lógica que no cierra'], a: 2 },
  { q: 'Comprobar por fuera significa…', o: ['a) Releerlo hasta que suene bien', 'b) Abrir una fuente que no produjo la afirmación', 'c) Preguntarle a otra IA lo mismo', 'd) Pedirle que se califique'], a: 1 },
  { q: 'Ante una maestra, «lo dijo la IA»…', o: ['a) Sirve si se cita la herramienta', 'b) Depende del encargo', 'c) No sirve: quien entrega, firma', 'd) Sirve si el error es pequeño'], a: 2 },
  { q: 'Los 226 milímetros de esta casa fallaron porque…', o: ['a) La impresora estaba mal', 'b) Nadie leyó la norma', 'c) La hoja cambió de tamaño', 'd) El número se calculó en vez de medirse'], a: 3 },
  { q: 'Tres comprobaciones de esta casa salían en verde siempre porque…', o: ['a) Avisaban pero nunca detenían nada', 'b) Se ejecutaban pocas veces', 'c) Estaban desactivadas', 'd) El servidor no respondía'], a: 0 },
  { q: 'La constancia que decía «Etapa 1» enseña que…', o: ['a) Hay que numerar mejor las misiones', 'b) Copiar no es leer', 'c) Los moldes no sirven', 'd) El texto de adorno sobra'], a: 1 },
  { q: 'De una herramienta hay que verificar sobre todo…', o: ['a) Su informe final', 'b) Que no dé error', 'c) El alcance completo de lo que toca', 'd) Su velocidad'], a: 2 },
  { q: 'Una cita que no aparece en la fuente primaria…', o: ['a) Se deja marcada por si acaso', 'b) Se borra', 'c) Se sustituye por otra parecida', 'd) Se cita como aproximada'], a: 1 },
  { q: '¿Qué NO se delega jamás a una máquina?', o: ['a) Redactar un borrador', 'b) Ordenar ideas ya decididas', 'c) Proponer títulos', 'd) Firmar la entrega'], a: 3 },
  { q: 'En un correo hacia fuera hay que subrayar…', o: ['a) Los verbos que comprometen', 'b) Las palabras largas', 'c) Los saludos', 'd) Las fechas de envío'], a: 0 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saberse los cinco errores', 'b) Tener la ficha impresa', 'c) Haber leído el módulo entero', 'd) Poder explicar la entrega con palabras propias y decir qué no se comprobó'], a: 3 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'El modelo produce texto ___, no texto verdadero.', a: 'probable' },
  { q: 'El error peligroso es el dato falso bien ___.', a: 'escrito' },
  { q: 'Comprobar por fuera es abrir una fuente ___.', a: 'independiente' },
  { q: 'Lo que decide cuánto verificar es el ___.', a: 'riesgo' },
  { q: 'El error que consiste en lo que no se dijo es la ___.', a: 'omision' },
  { q: 'Preguntarle si está segura produce otra ___.', a: 'prediccion' },
  { q: 'La tendencia de la máquina a darte la razón se llama ___.', a: 'complacencia' },
  { q: 'Quien entrega, ___.', a: 'firma' },
  { q: 'Un cálculo no es una ___.', a: 'medicion' },
  { q: 'El alto útil de la hoja no era 226 sino ___ milímetros.', a: '252' },
  { q: 'Una comprobación que nunca se ha visto ___ no se sabe si funciona.', a: 'fallar' },
  { q: 'El documento original, y no quien lo cuenta, es la fuente ___.', a: 'primaria' },
  { q: 'Lo que no se puede explicar con palabras propias no se ___.', a: 'entrega' },
  { q: 'En un texto hacia fuera se subrayan los verbos que ___.', a: 'comprometen' },
  { q: 'Una cita que no aparece en la fuente se ___.', a: 'borra' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Texto probable', def: 'La continuación más plausible, no la verdadera' },
  { term: 'Dato falso bien escrito', def: 'La cifra o la cita verosímil que no existe' },
  { term: 'El tono seguro', def: 'Rasgo del estilo que no prueba nada' },
  { term: 'Comprobar por fuera', def: 'Contrastar con una fuente independiente' },
  { term: 'Verificación falsa', def: 'Preguntarle a la misma máquina si acertó' },
  { term: 'La complacencia', def: 'La tendencia a darte la razón si insistes' },
  { term: 'La omisión', def: 'El error que consiste en lo que no se dijo' },
  { term: 'La escala de riesgo', def: 'Cuánto verificar según qué pasa si está mal' },
  { term: 'Fuente primaria', def: 'El documento original, no quien lo cuenta' },
  { term: 'La firma', def: 'Quien entrega responde por lo entregado' },
  { term: 'Palabras propias', def: 'La prueba de que algo se leyó y no se movió' },
  { term: 'Un cálculo no es una medición', def: 'Razonamiento correcto sobre un dato equivocado' },
  { term: 'La prueba que nunca falló', def: 'Comprobación de la que no se sabe si funciona' },
  { term: 'Alcance de una herramienta', def: 'Todo lo que toca, no solo lo que promete' },
  { term: 'Verbos que comprometen', def: 'Promesas que alguien va a cobrar después' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Para saber cuánto texto cabe en una hoja carta se calculó el alto útil en vez de medirlo: 279,4 milímetros menos una pulgada por lado, o sea 226. Esa pulgada es el margen por defecto del navegador, no el que declara la hoja del proyecto.' },
  { txt: 'Cada misión se construye copiando la anterior. En el molde había una constancia que felicitaba por completar «la Etapa 1», y viajó de misión en misión junto con otros cinco rótulos heredados.' },
  { txt: 'Una regla de seguridad de la base de datos, revisada y aprobada, decía «using (true)». Tenía la forma de una protección y dejaba entrar a cualquiera que se registrara en el proyecto.' },
  { txt: 'Tres comprobaciones escritas para confirmar que la casa estaba cerrada se ejecutaban y salían siempre en verde. Estaban escritas de forma que avisaban pero nunca detenían nada.' },
  { txt: 'Una herramienta reparte las respuestas correctas del quiz entre las cuatro letras y funciona bien. Su informe sale en verde, y de una pasada reescribe las veintiuna misiones del proyecto, incluidas las que ya estaban bien.' },
  { txt: 'La máquina devuelve la introducción de una ficha de Estudios Sociales: tres párrafos claros y una cita de un artículo de la Constitución con número y texto entre comillas. La ficha va a trescientas copias en tres escuelas.' },
  { txt: 'Se le pide resumir el reglamento de un concurso al que M.E.T.A.S quiere presentar el Campeonísimo. El resumen es correcto, ordenado y claro, y no menciona la fecha de cierre de inscripciones, que estaba en una nota al pie.' },
  { txt: 'Se le pide redactar el correo de presentación del proyecto a una Secretaría. Sale un texto excelente que dice que el proyecto «acompaña a los centros durante todo el año escolar». Nadie ha decidido eso.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué se puede comprobar aquí, y contra qué exactamente?',
  '2. ¿Qué riesgo tiene si está mal: qué pasa y a quién le pasa?',
  '3. ¿Qué falta, o qué no se está mirando por estar mirando otra cosa?',
  '4. Escribe en 3-4 frases qué harías antes de entregar, y qué firmarías.',
]);

B.critCaseGuides = JSON.stringify([
  'Lo comprobable son las cifras, las fechas, los nombres, las citas, los enlaces y las promesas. Se comprueba contra una fuente que no produjo la afirmación: el texto oficial, el archivo del proyecto, la lista de cambios, el código corriendo con el caso real.',
  'El riesgo se mide por lo que pasa si está mal y por quién lo paga: un adorno no lo paga nadie; una ficha impresa la paga una maestra delante de sus alumnos; un correo lo paga el proyecto durante todo un año.',
  'Casi siempre lo que no se mira es lo que no da error: los rótulos heredados, el alcance de una herramienta, lo que el resumen dejó fuera, y las comprobaciones que nunca se han visto en rojo.',
  'La entrega se firma o no se entrega. Si algo no se pudo comprobar, se borra o se marca como no comprobado, con nombre y fecha; lo que no se puede explicar con palabras propias no sale de casa.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"La cita viene con número de artículo y todo, así que es fiable".', g1: 'El número y las comillas son parte del estilo: una cita inventada se escribe exactamente igual de bien que una real, porque las dos son texto probable.', g2: 'Solo se distinguen abriendo la fuente primaria. Y si el artículo no aparece, la cita se borra, no se deja «por si acaso» ni se sustituye por otra parecida.' },
  { txt: '"Le pregunté si estaba seguro y me dijo que sí".', g1: 'Eso no es una verificación: es una segunda predicción de la misma máquina. Si inventó el dato, puede inventar igual de bien la confirmación.', g2: 'Y hay algo peor: la complacencia. Si insistes, muchas veces cambia de opinión hacia lo que pareces querer oír, así que insistir aleja de la verdad en vez de acercar.' },
  { txt: '"El código funcionó a la primera en mi teléfono, ya se puede subir".', g1: 'Funcionó en un caso, no en el que importa. Riesgo muy alto: lo que se sube lo usan la maestra sin internet y las niñas en el teléfono viejo.', g2: 'La verificación aquí es ejecutar el caso real, no leerlo hasta que se entienda. Y en riesgo muy alto conviene que lo mire una segunda persona antes de subirlo.' },
  { txt: '"El resumen está perfecto, no dice nada que no esté en el reglamento".', g1: 'Es verdad y aun así puede estar mal: el error de un resumen no está en lo que dice, está en lo que calla, y en este caso calló la fecha de cierre.', g2: 'La única defensa contra una omisión es abrir el original y leer al menos los encabezados y las notas, buscando qué tendría que estar y no está.' },
  { txt: '"La herramienta dice que arregló los tres bancos, todo en verde".', g1: 'El informe solo habla de lo que la herramienta vino a arreglar. No dice qué más tocó, y en este caso reescribió las veintiuna misiones del proyecto.', g2: 'De una herramienta se verifica el alcance completo, no el resultado prometido. Aquí la comprobación buena era mirar la lista de archivos modificados.' },
  { txt: '"El correo quedó buenísimo, lo mando ya".', g1: 'Antes hay que buscar los verbos que comprometen: acompañamos, garantizamos, entregamos, capacitamos. Cada uno es una promesa que alguien va a cobrar.', g2: 'Y el compromiso lo firma quien envía. No se puede alegar después que lo escribió una máquina: para la Secretaría lo escribió el proyecto.' },
]);

B.critDecisionBank = JSON.stringify([
  'Un número que salió de un cálculo razonable y no de una medición: ¿cómo se comprueba y qué se hace mientras tanto?',
  'Un molde heredado con rótulos de otra misión: ¿qué partes se revisan y cómo se evita que vuelva a pasar?',
  'Una regla de seguridad que tiene la forma correcta: ¿cómo se lee de verdad antes de aprobarla?',
  'Tres comprobaciones que siempre salen en verde: ¿cómo se sabe si funcionan?',
  'Una herramienta que arregla lo que promete: ¿qué se verifica además del resultado?',
  'Una cita de ley en una ficha que va a trescientas copias: ¿se comprueba, se borra o se marca?',
  'Un resumen correcto de un reglamento con fechas: ¿qué se hace antes de usarlo para decidir?',
  'Un correo a una institución con un compromiso que nadie decidió: ¿qué se quita y quién firma?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Abrir el texto oficial y buscar el artículo citado.', b: 'Preguntarle a la máquina si el artículo es correcto.', ga: 'Caso A: la comprobación no depende de quien hizo la afirmación, así que puede desmentirla. Cuesta tres minutos y cierra la duda.', gb: 'Caso B: se pide una segunda predicción a la misma fuente. Puede confirmar un dato inventado con total seguridad, y encima deja la sensación de haber verificado.' },
  { a: 'Leer la respuesta entera antes de decidir qué hacer con ella.', b: 'Ir corrigiendo por partes según se va leyendo.', ga: 'Caso A: se ve el conjunto, y sobre todo se ve lo que falta, que es lo único que no aparece leyendo por trozos.', gb: 'Caso B: se corrigen frases y se pierde la omisión, que es el error más caro y el que no está escrito en ninguna parte.' },
  { a: 'Verificar una cifra de una ficha impresa contra la fuente primaria.', b: 'Verificar con el mismo cuidado el emoji del título.', ga: 'Caso A: riesgo alto, porque sale de casa impresa y lo paga una maestra delante de sus alumnos. Ahí el tiempo está bien gastado.', gb: 'Caso B: riesgo cero. Verificar todo igual no es rigor: es gastar en lo barato el tiempo que hacía falta en lo caro.' },
  { a: 'Entregar solo lo que se puede explicar con palabras propias.', b: 'Entregar todo y avisar de que lo revisó una máquina.', ga: 'Caso A: la firma significa algo, porque quien firma puede responder preguntas sobre lo que firmó.', gb: 'Caso B: el aviso no traslada la responsabilidad a nadie. Para la maestra, para la Secretaría y para la familia, lo entregó una persona.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se toma el tono seguro de una respuesta como señal de que es cierta.', guide: 'El tono es estilo. La máquina escribe igual de firme lo que le consta y lo que completó, porque no sabe que no sabe.' },
  { cause: 'Se comprueba preguntándole a la misma máquina.', guide: 'Se obtiene otra predicción, no una comprobación, y encima con complacencia: si insistes, cambia de opinión hacia lo que pareces querer.' },
  { cause: 'Se verifica todo con el mismo cuidado, sin escala de riesgo.', guide: 'Se gasta en lo barato el tiempo que hacía falta en lo caro, y al final no se revisa bien justo lo que sale de casa impresa.' },
  { cause: 'Se lee la respuesta por trozos, corrigiendo sobre la marcha.', guide: 'Se pierde la omisión, que es el error que no está escrito y que solo se ve mirando el conjunto contra el original.' },
  { cause: 'Se copia un molde sin leer lo que no da error.', guide: 'Los títulos, los pies y las etiquetas heredadas viajan intactos de misión en misión, porque nada avisa de que están mal.' },
  { cause: 'Se confía en una comprobación que nunca se ha visto fallar.', guide: 'No se sabe si funciona. Puede estar avisando en vez de deteniendo, y salir en verde mientras la puerta sigue abierta.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La cita se cayó antes de imprimir las trescientas copias.', guide: 'Se abrió el texto oficial en vez de preguntarle a la máquina, y el artículo no estaba. La cita se borró en lugar de dejarla por si acaso.' },
  { effect: 'La ficha volvió a caber sin encoger la letra.', guide: 'Se midió el alto útil real de la hoja en lugar de calcularlo con el margen del navegador: 252 milímetros y no 226.' },
  { effect: 'El correo salió sin comprometer al proyecto a un año entero.', guide: 'Se leyó en voz alta y se subrayaron los verbos que comprometen, y el que no se podía cumplir hoy se quitó antes de enviar.' },
  { effect: 'Se descubrió a tiempo que la herramienta tocaba misiones que no debía.', guide: 'Se miró la lista de archivos modificados y no el informe, que solo hablaba de lo que la herramienta venía a arreglar.' },
  { effect: 'Una comprobación empezó a servir de verdad.', guide: 'Se la hizo fallar a propósito una vez para ver si detenía algo. Hasta entonces salía en verde y no probaba nada.' },
  { effect: 'La inscripción al concurso se envió dentro del plazo.', guide: 'Se abrió el reglamento original en vez de fiarse del resumen, y la fecha de cierre estaba en una nota al pie.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '📖', label: 'Leer entero', text: 'Hasta el final, <strong>antes de decidir nada</strong>. <strong>Sirve para:</strong> ver el conjunto y sobre todo lo que falta. <strong>Si se salta:</strong> se corrigen frases y se pierde la omisión. <strong>La prueba:</strong> poder contarlo con palabras propias.' },
  { y: '2', icon: '🔍', label: 'Marcar lo comprobable', text: 'Señalar <strong>cifras, fechas, nombres, citas, enlaces y promesas</strong>. <strong>Sirve para:</strong> separar lo que se comprueba de lo que se discute. <strong>Si se salta:</strong> se verifica al azar. <strong>En M.E.T.A.S:</strong> el lápiz sobre el papel, marca por marca.' },
  { y: '3', icon: '⚖️', label: 'Medir el riesgo', text: '<strong>Qué pasa si esa marca está mal</strong>, y a quién le pasa. <strong>Sirve para:</strong> repartir el tiempo. <strong>Si se salta:</strong> se gasta en lo barato lo que hacía falta en lo caro. <strong>En M.E.T.A.S:</strong> una ficha impresa la paga una maestra delante de su clase.' },
  { y: '4', icon: '🌐', label: 'Comprobar por fuera', text: 'Abrir <strong>algo que no produjo la afirmación</strong>. <strong>Sirve para:</strong> que la comprobación pueda desmentir. <strong>Si se salta:</strong> se confirma un invento con otro. <strong>En M.E.T.A.S:</strong> el texto oficial, el archivo del proyecto, el código corriendo.' },
  { y: '5', icon: '🕳️', label: 'Buscar lo que falta', text: 'Volver al original a ver <strong>qué tendría que estar</strong>. <strong>Sirve para:</strong> cazar la omisión, que no está escrita. <strong>Si se salta:</strong> se entrega un resumen correcto y sin la fecha límite. <strong>En M.E.T.A.S:</strong> encabezados y notas al pie del original.' },
  { y: '6', icon: '✂️', label: 'Corregir o borrar', text: 'Lo que no se pudo comprobar <strong>sale</strong>. <strong>Sirve para:</strong> que no quede nada dudoso dentro. <strong>Si se salta:</strong> se deja «por si acaso» y acaba impreso. <strong>En M.E.T.A.S:</strong> una cita que no aparece en la fuente se borra.' },
  { y: '7', icon: '✍️', label: 'Firmar y registrar', text: 'Anotar <strong>contra qué se comprobó y quién responde</strong>. <strong>Sirve para:</strong> que la verificación exista después. <strong>Si se salta:</strong> se repite el mismo trabajo dentro de un mes. <strong>En M.E.T.A.S:</strong> la hoja de verificación, con fecha y nombre.' },
]);

B.parteData = JSON.stringify({
  leer: {
    nombre: 'Leer entero', icon: '📖',
    estructura: { title: 'Qué es', info: '• Recorrer la respuesta <strong>hasta el final</strong> antes de decidir nada<br>• No es pasar los ojos: es poder contarla con palabras propias<br>• Es el único paso que enseña <strong>lo que falta</strong>' },
    funcion: { title: 'Cómo se hace', info: '• De una sentada, sin corregir sobre la marcha<br>• En voz alta si el texto va hacia fuera: ahí se oyen las promesas<br>• Al terminar, resumirla sin mirarla; lo que no salga, no se leyó' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• Se corrigen frases sueltas y se pierde el conjunto<br>• La omisión pasa entera, porque no está escrita en ningún sitio<br>• Se entrega algo que no se puede defender si alguien pregunta' },
    cuidados: { title: 'En este proyecto', info: '• La constancia que decía <strong>«Etapa 1»</strong> viajó por varias misiones<br>• Con ella viajaron cinco rótulos más, todos de texto de adorno<br>• Regla: <strong>copiar no es leer</strong>, y lo heredado se revisa entero' },
  },
  riesgo: {
    nombre: 'Medir el riesgo', icon: '⚖️',
    estructura: { title: 'Qué es', info: '• Preguntarse <strong>qué pasa si esto está mal</strong>, y a quién le pasa<br>• No depende de lo raro que suene: depende de dónde va a parar<br>• Es lo que reparte el tiempo de verificación, que es limitado' },
    funcion: { title: 'Cómo se hace', info: '• Bajo: adornos y redacción. Se lee entero y basta<br>• Alto: cifras, citas y leyes que se imprimen. Fuente primaria<br>• Muy alto: código que se sube y compromisos por escrito. Segunda persona' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• Se verifica todo igual, que es la forma elegante de no verificar nada<br>• O no se verifica nada, con el argumento de que no hay tiempo<br>• El error acaba saliendo justo por donde más caro cuesta' },
    cuidados: { title: 'En este proyecto', info: '• Una ficha impresa la paga <strong>una maestra delante de su clase</strong><br>• Un correo a una institución compromete al proyecto un año<br>• Un emoji mal puesto no lo paga nadie: ahí no se gasta tiempo' },
  },
  fuente: {
    nombre: 'Comprobar por fuera', icon: '🌐',
    estructura: { title: 'Qué es', info: '• Contrastar contra algo que <strong>no produjo la afirmación</strong><br>• Vale porque puede desmentirla; si no puede, no es una comprobación<br>• Preguntarle a la misma máquina es pedir otra predicción' },
    funcion: { title: 'Cómo se hace', info: '• Citas y leyes: <strong>el texto oficial</strong>, buscando la frase textual<br>• Cifras: el estudio o el informe original, no quien lo cuenta<br>• Código: <strong>ejecutarlo con el caso real</strong>, no leerlo hasta entenderlo' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• Se confirma un invento con otro invento igual de bien escrito<br>• Aparece la complacencia: si insistes, cambia de opinión<br>• Queda la sensación de haber verificado, que es lo más peligroso' },
    cuidados: { title: 'En este proyecto', info: '• Los <strong>226 milímetros</strong> salieron de un cálculo, no de una medición<br>• El alto real era 252 y costó dos vueltas de trabajo<br>• Con las fichas quedó escrito: <strong>el PDF es el único juez</strong>' },
  },
  firma: {
    nombre: 'Firmar', icon: '✍️',
    estructura: { title: 'Qué es', info: '• Quien entrega, <strong>responde</strong> por lo entregado<br>• «Lo dijo la IA» no es una defensa ante nadie<br>• La máquina no tiene nada que perder; la persona sí' },
    funcion: { title: 'Cómo se hace', info: '• Se anota <strong>contra qué se comprobó</strong> y qué quedó sin comprobar<br>• Con fecha y nombre, para que la verificación exista dentro de un mes<br>• Lo que no se puede explicar con palabras propias, no se entrega' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• Se repite el mismo trabajo, porque nadie sabe qué se revisó ya<br>• Si aparece un error, no hay forma de saber dónde falló la cadena<br>• La responsabilidad se diluye, y lo que se diluye no se corrige' },
    cuidados: { title: 'En este proyecto', info: '• Cada misión lleva su <strong>sonda</strong>, y la sonda se escribe viéndola fallar<br>• Las fichas se confirman contando las hojas del PDF<br>• Lo que no se delega jamás: la firma y <strong>qué se le enseña a las niñas</strong>' },
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

/* critDecisionGuide es una cadena suelta, no un banco con forma */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: quien entrega firma, así que lo primero es preguntarse si se puede explicar con palabras propias; el error que se busca no es el disparate sino el dato falso bien escrito; la comprobación se hace por fuera, contra una fuente que no produjo la afirmación, nunca preguntándole otra vez a la misma máquina; se verifica según qué pasa si está mal y a quién le pasa, no según lo raro que suene; y lo que no se pudo comprobar se borra o se marca como no comprobado, con fecha y nombre. Cuando hay prisa por entregar, la respuesta es siempre la misma: sale lo comprobado y se queda lo demás.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  /* la tarjeta de WhatsApp */
  [/📝 \*Ruta de la Máquina que Predice · Etapa 2\* 📝/g, '🔎 *Ruta de la Máquina que Predice · Etapa 3* 🔎'],
  [/_Incluye evaluación conceptual y el encargo que se escribe\._ ✍️/g, '_Incluye evaluación conceptual y la firma al pie._ ✍️'],
  /* los rótulos de las dos pruebas */
  [/El encargo que se escribe/g, 'La firma al pie'],
  [/el encargo que se escribe/g, 'la firma al pie'],
  [/Pedir bien: el encargo, el contexto y el ejemplo/g, 'Verificar: nadie firma lo que no leyó'],
  [/Ruta de la Máquina que Predice · Etapa 2: Pedir bien/g, 'Ruta de la Máquina que Predice · Etapa 3: Verificar'],
  [/Pedir bien/g, 'Verificar'],
  [/pedir bien/g, 'verificar'],
  /* la cabecera de las pruebas impresas: esto no es un instituto */
  [/Autocapacitación Técnica/g, 'Etapa 3 · Inteligencia Artificial'],
  [/📝 ¡/g, '🔎 ¡'],
  /* la constancia decía la etapa de la que se copió */
  [/completó la Etapa 2 de la Ruta de la Máquina que Predice/g, 'completó la Etapa 3 de la Ruta de la Máquina que Predice'],
  /* la sección I se llamaba «la interpelación», que es palabra de la ruta
     política y viaja en el molde desde hace varias misiones */
  [/Simulacro de Presión: la interpelación/g, 'La entrega sobre la mesa'],
  /* el texto de la tarjeta de WhatsApp seguía describiendo la etapa 2 */
  [/Cómo se escribe un encargo que sale bien a la primera: papel, tarea, contexto, formato, ejemplo, restricciones y criterio\. 📝/g,
   'Qué se hace con una respuesta antes de usarla: leerla entera, medir el riesgo, comprobar por fuera y firmar lo que se entrega. 🔎'],
  /* y los mensajes de la constancia hablaban de encargos. Este es el séptimo
     tipo de rótulo heredado que aparece: la norma 1 avisa de tres. */
  [/\['¡Sigue puliendo tu encargo!','¡Muy buen trabajo!','¡Ya distingues encargo de petición!','¡Escribes encargos que salen a la primera!','¡Dueño de tu colección de encargos!'\]/g,
   "['¡Sigue leyendo antes de entregar!','¡Muy buen trabajo!','¡Ya distingues el dato de la opinión!','¡Compruebas por fuera y no por dentro!','¡Firmas solo lo que puedes explicar!']"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV seguían siendo las de la etapa 2
   (las siete casillas del encargo, y si el caso se puede reutilizar en la
   próxima misión). Se escriben enteras, que es más seguro que parchearlas. */
src = src.replace(/¿Cuál de las siete casillas de la hoja de encargo faltaba[^<]*/g,
  '¿Qué se puede comprobar aquí, contra qué fuente exactamente y qué riesgo tiene si está mal? Explica por qué comprobar por fuera es mejor que preguntarle otra vez a la máquina o que entregarlo tal cual.');
src = src.replace(/1\. ¿Qué gana cada caso y cuál se puede volver a usar en la próxima misión sin escribirlo de nuevo\? 2\. ¿Por qué no son el mismo caso\?/g,
  '1. ¿Cuál de los dos deja una entrega que se puede defender si alguien pregunta, y por qué? 2. ¿Por qué no son la misma decisión?');

/* el desenlace de la simulación seguía narrando el encargo de la etapa 2 */
const antesSim = /function resolveMethod\(conInternet\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(conInternet){sfx(conInternet?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(conInternet){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🌐</span><span class="ms-text"><strong>Abriste el texto oficial:</strong> el artículo existe, pero dice otra cosa y va con otro número. Tres minutos.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✍️</span><span class="ms-text"><strong>Y ahora puedes firmar:</strong> se corrige la cita, se anota contra qué se comprobó, y la ficha sale con tu nombre sin que te quite el sueño.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🤖</span><span class="ms-text"><strong>Le preguntaste si estaba seguro:</strong> dijo que sí, con la misma seguridad con la que lo había escrito.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🖨️</span><span class="ms-text"><strong>Y salieron las trescientas copias:</strong> el error lo encuentra una maestra delante de sus alumnos. No lo dijo la IA: lo firmaste tú.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='contexto',labAspecto='estructura';/, "let labParte='leer',labAspecto='estructura';");

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
