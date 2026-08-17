/* Inyecta los bancos de la misión «El acero antes del juicio» (Ruta del
   Expediente Rojo, etapa 1: Crítica al Marxismo, materia 26 del Estudio
   Mayor) sobre el molde copiado de la etapa 1 de los átomos.
   Uso:  node _dev/inyecta-bancos-acero-juicio.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Marx y Engels, «El manifiesto comunista» (1848) y Marx, «El capital»,
       tomo I (1867): EN RESUMEN DE TRABAJO: los enteros ya los cursaron sus
       materias dueñas (Economía política y Materialismo Filosófico); aquí
       solo entra el resumen que un marxista firmaría.
     · Peter Singer, «Marx: una breve introducción»: DIVULGACIÓN SÓLIDA
       para armar el resumen fuerte.
     · Bryan Caplan, la prueba de Turing ideológica: CONCEPTO DE
       DIVULGACIÓN, útil como ejercicio, NO una medida validada. La
       herramienta se fabrica en Estudio de las Ideologías.
     · Robert Allen, «Farm to Factory» (2003): la mejor defensa empírica de
       la industrialización soviética, DISPUTA VIVA, con sus auditores
       enfrente.
     · Amartya Sen, salud comparada China-India: ACADÉMICO SÓLIDO.

   La idea que ordena todos los bancos: ninguna crítica empieza sin poner
   en pie la mejor versión (el acero), la fuerza moral documentada y los
   mejores números del sistema, con su etiqueta. La licencia de la etapa:
   exponer el marxismo diez minutos de pie sin que un marxista lo corrija.
   Y la regla del placer: el dato que te alegra paga doble auditoría.    */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-rojo-acero-juicio', 'js', 'acero-juicio.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260817;
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
  { w: 'El hombre de acero', a: '🛡️ La versión más fuerte de un argumento, <strong>la que su autor firmaría</strong>. Lo contrario del hombre de paja. La regla de la casa: se reconstruye ANTES de responder, también entre hermanas.' },
  { w: 'El hombre de paja', a: '📰 El muñeco flojo que se arma para tumbarlo fácil: «querían quitarle la casa a todos». Refutarlo <strong>no refuta nada</strong>: el sistema real queda intacto y sin auditar.' },
  { w: 'La licencia de la etapa', a: '🗝️ Exponer el marxismo <strong>diez minutos de pie sin que un marxista lo corrija</strong>. Sin esa licencia no se entra al resto de la materia: nadie audita lo que no puede enunciar.' },
  { w: 'El materialismo histórico', a: '🏭 Primera pieza del resumen fuerte: <strong>el modo de producir condiciona instituciones e ideas</strong>. Se enuncia como programa de investigación, no como profecía.' },
  { w: 'La teoría de la explotación', a: '⚖️ Segunda pieza: <strong>el excedente lo produce el trabajo y se lo apropia el dueño</strong>. Es una tesis con definiciones, no «roban y ya»: por eso se puede auditar.' },
  { w: 'La tendencia a la crisis', a: '📉 Tercera pieza: el sistema produce <strong>sus propias sacudidas periódicas</strong>. Es la parte del edificio que hasta rivales serios le reconocieron al autor.' },
  { w: 'La sociedad sin clases', a: '🌅 Cuarta pieza: <strong>la promesa que ordena el edificio entero</strong>. Sale del Manifiesto (1848), y el acero la enuncia sin burla y sin bandera.' },
  { w: 'La prueba de Turing ideológica', a: '🎭 El ejercicio de Caplan: exponer la doctrina de modo que <strong>un defensor no te distinga de uno de los suyos</strong>. Etiqueta: ejercicio de divulgación, no medida validada.' },
  { w: 'La fuerza moral', a: '⛏️ Lo que la crítica perezosa omite: Marx señalaba <strong>niños en minas con informes de inspectores ingleses</strong> en la mano. Esa indignación documentada explica siglo y medio de lealtades.' },
  { w: 'Los números del acero', a: '📊 El mejor expediente empírico que un defensor presentaría: <strong>Allen (2003) sobre la industrialización, Sen sobre salud básica</strong>. Entran con su etiqueta de disputa, y se pesarán después.' },
  { w: 'El resumen de trabajo', a: '📚 Cómo entran el Manifiesto y El capital aquí: <strong>en resumen</strong>, porque los enteros ya los cursaron sus materias dueñas. No se repite lo cursado: se remite.' },
  { w: 'La caridad interpretativa', a: '🤝 Exponer bien lo que se va a auditar <strong>no obliga a estar de acuerdo</strong>: obliga a apuntar al blanco real. Es la primera mano de Teología, aplicada a una doctrina política.' },
  { w: 'La defensa detenida', a: '✋ La regla de la prueba: si la exposición <strong>suena a caricatura, la familia la detiene</strong> y se repite otro día, sin drama. La licencia se gana con precisión, no con velocidad.' },
  { w: 'La regla del placer', a: '😊 Si un dato te alegra porque hunde al bando contrario, <strong>paga doble auditoría</strong> antes de entrar al cuaderno. La alegría no invalida el dato: obliga a pesarlo mejor.' },
  { w: 'La báscula pareja', a: '⚖️ Esta materia tiene gemela (el Expediente Dorado) con el mismo esqueleto, y <strong>la Bóveda no acepta un expediente sin el otro</strong>. El acero de esta casa se mide en pares.' },
  { w: 'Los dos púlpitos', a: '🗣️ El que insulta y el que venera: <strong>los dos eximen de estudiar</strong>. Quien domina el acero deja de ser presa fácil de ambos, y en un país polarizado eso es una forma de libertad.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Qué exige la regla del acero antes de criticar un sistema?', o: ['a) Poner en pie su mejor versión, la que su autor firmaría', 'b) Resumir sus peores momentos', 'c) Contar sus muertos primero', 'd) Buscar quién lo financia'], c: 0 },
  { q: 'La prueba de Turing ideológica consiste en…', o: ['a) Programar una computadora que debata', 'b) Exponer la doctrina sin que un defensor te distinga de los suyos', 'c) Detectar bots en redes', 'd) Medir la inteligencia del rival'], c: 1 },
  { q: 'El materialismo histórico, en su resumen fuerte, dice que…', o: ['a) El dinero es lo único real', 'b) La historia no tiene sentido', 'c) El modo de producir condiciona instituciones e ideas', 'd) Las ideas no existen'], c: 2 },
  { q: 'La teoría de la explotación sostiene que…', o: ['a) Todo trabajo es sufrimiento', 'b) Los patrones son malvados por naturaleza', 'c) El comercio es un robo', 'd) El excedente lo produce el trabajo y se lo apropia el dueño'], c: 3 },
  { q: 'La fuerza moral del sistema venía de…', o: ['a) Indignación documentada: niños en minas, con informes de inspectores', 'b) La promesa de riqueza rápida', 'c) El carisma de sus oradores', 'd) El miedo al infierno'], c: 0 },
  { q: 'La prueba de Turing ideológica se etiqueta como…', o: ['a) Medida científica validada', 'b) Ejercicio de divulgación (Caplan), no medida validada', 'c) Ley de la lógica', 'd) Norma internacional'], c: 1 },
  { q: '«Farm to Factory», de Allen (2003), es…', o: ['a) Una novela histórica', 'b) Un panfleto soviético', 'c) La mejor defensa empírica de la industrialización soviética, con disputa viva', 'd) Un manual de agricultura'], c: 2 },
  { q: 'Quien termina esta etapa obtiene…', o: ['a) Un veredicto definitivo', 'b) La militancia en un bando', 'c) El derecho a burlarse mejor', 'd) La licencia: exponer el marxismo diez minutos sin que un marxista lo corrija'], c: 3 },
  { q: 'Si la exposición suena a caricatura, la defensa…', o: ['a) Sigue, pero con nota baja', 'b) Se detiene y se repite otro día, sin drama', 'c) Se aprueba si hay esfuerzo', 'd) Pasa a examen escrito'], c: 1 },
  { q: 'La regla del placer manda que el dato que te alegra…', o: ['a) Se publique de inmediato', 'b) Se descarte siempre', 'c) Pague doble auditoría antes de entrar al cuaderno', 'd) Se guarde en secreto'], c: 2 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Acero', 'Caricatura'], headA: '🛡️ Acero: lo firmaría un defensor', headB: '📰 Caricatura: nadie la firma', colA: 'ok', colB: 'no',
    words: [
      { w: 'El modo de producir condiciona las ideas', t: 'ok' }, { w: '«Querían quitarle la casa a todos»', t: 'no' },
      { w: 'El excedente lo produce el trabajo', t: 'ok' }, { w: '«Era pura envidia con barba»', t: 'no' },
      { w: 'La historia como pleito de clases', t: 'ok' }, { w: '«Odiaban a todo el que trabajara»', t: 'no' },
      { w: 'Señalaba las minas con informes en la mano', t: 'ok' }, { w: '«Solo prometían un paraíso vago»', t: 'no' },
    ],
  },
  {
    label: ['Con etiqueta', 'Sin etiqueta'], headA: '🏷️ Cifra con etiqueta', headB: '🚩 Cifra de bandera', colA: 'ok', colB: 'no',
    words: [
      { w: 'La horquilla, con método y fuente', t: 'ok' }, { w: 'El número redondo de bandera', t: 'no' },
      { w: 'Allen 2003, con su disputa declarada', t: 'ok' }, { w: 'El «todo el mundo sabe»', t: 'no' },
      { w: 'Sen, con su comparación exacta', t: 'ok' }, { w: 'El dato que llegó por un meme', t: 'no' },
      { w: 'La cifra con fecha y archivo', t: 'ok' }, { w: 'La cifra sin método ni fuente', t: 'no' },
    ],
  },
  {
    label: ['Con licencia', 'Sin licencia'], headA: '🗝️ Juicio con licencia', headB: '🚫 Veredicto sin lectura', colA: 'ok', colB: 'no',
    words: [
      { w: 'Expuso la doctrina y un defensor asintió', t: 'ok' }, { w: 'Refutó un panfleto que nadie firma', t: 'no' },
      { w: 'Enunció el resumen fuerte completo', t: 'ok' }, { w: 'Copió el veredicto de su bando', t: 'no' },
      { w: 'Concedió la fuerza moral antes de auditar', t: 'ok' }, { w: 'Juzgó con la cuenta de muertos y sin teoría', t: 'no' },
      { w: 'Pesó el mejor expediente empírico', t: 'ok' }, { w: 'Recitó teoría sin abrir los archivos', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Vive en otra materia'], headA: '📕 Se estudia en esta etapa', headB: '🏠 Vive en otra materia', colA: 'ok', colB: 'no',
    words: [
      { w: 'El resumen fuerte del sistema', t: 'ok' }, { w: 'El Marx economista entero', t: 'no' },
      { w: 'La prueba de Turing como estación primera', t: 'ok' }, { w: 'El Marx filósofo, base y superestructura', t: 'no' },
      { w: 'La fuerza moral documentada', t: 'ok' }, { w: 'La fábrica de la prueba de Turing', t: 'no' },
      { w: 'Los números del acero con etiqueta', t: 'ok' }, { w: 'La falsabilidad como herramienta general', t: 'no' },
    ],
  },
]);

/* ---------- identificar ---------- */
B.idData = JSON.stringify([
  { s: ['El', 'acero', 'se', 'arma', 'antes', 'del', 'juicio.'], c: 1, art: 'La regla que abre la materia' },
  { s: ['El', 'hombre', 'de', 'paja', 'se', 'tumba', 'sin', 'mérito.'], c: 3, art: 'El muñeco que nadie firma' },
  { s: ['La', 'licencia', 'son', 'diez', 'minutos', 'de', 'pie.'], c: 1, art: 'Lo que gana quien termina la etapa' },
  { s: ['La', 'explotación', 'es', 'una', 'tesis', 'con', 'definiciones.'], c: 1, art: 'La pieza difícil del resumen' },
  { s: ['Los', 'inspectores', 'documentaron', 'las', 'minas.'], c: 1, art: 'De dónde salía la fuerza moral' },
  { s: ['La', 'horquilla', 'acompaña', 'a', 'toda', 'cifra.'], c: 1, art: 'La regla de los números' },
  { s: ['El', 'dato', 'que', 'alegra', 'paga', 'doble', 'auditoría.'], c: 6, art: 'La regla del placer, al final de la frase' },
  { s: ['La', 'defensa', 'se', 'detiene', 'si', 'suena', 'a', 'caricatura.'], c: 3, art: 'Lo que hace la familia, sin drama' },
]);

/* ---------- completa ---------- */
B.cmpData = JSON.stringify([
  { s: 'La mejor versión de un argumento es su hombre de ___.', opts: ['acero', 'paja', 'palo'], c: 0 },
  { s: 'El muñeco flojo que se tumba fácil es el hombre de ___.', opts: ['acero', 'paja', 'barro'], c: 1 },
  { s: 'La licencia de la etapa son diez minutos de ___.', opts: ['lectura', 'silencio', 'pie'], c: 2 },
  { s: 'El excedente lo produce el ___.', opts: ['trabajo', 'dueño', 'banco'], c: 0 },
  { s: 'Marx señalaba las minas con ___ en la mano.', opts: ['banderas', 'informes', 'monedas'], c: 1 },
  { s: 'Toda cifra entra con su ___.', opts: ['bandera', 'música', 'horquilla'], c: 2 },
  { s: 'El dato que te alegra paga ___ auditoría.', opts: ['doble', 'media', 'cero'], c: 0 },
  { s: 'Si la defensa suena a caricatura, se ___.', opts: ['aprueba', 'detiene', 'grita'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Acero', 'Caricatura'], btnA: '🛡️ Acero', btnB: '📰 Caricatura', colA: 'ok', colB: 'no',
    words: [
      { w: 'El modo de producir condiciona las ideas', t: 'ok' }, { w: '«Querían quitarle todo a todos»', t: 'no' },
      { w: 'El excedente y su dueño', t: 'ok' }, { w: '«Pura envidia con barba»', t: 'no' },
      { w: 'La tendencia a la crisis', t: 'ok' }, { w: '«Odiaban el trabajo»', t: 'no' },
      { w: 'La promesa de la sociedad sin clases', t: 'ok' }, { w: '«Un paraíso vago y ya»', t: 'no' },
      { w: 'Las minas con informes', t: 'ok' }, { w: '«Todo por llamar la atención»', t: 'no' },
    ],
  },
  {
    label: ['Con etiqueta', 'De bandera'], btnA: '🏷️ Con etiqueta', btnB: '🚩 De bandera', colA: 'ok', colB: 'no',
    words: [
      { w: 'Horquilla, método y fuente', t: 'ok' }, { w: 'El número redondo', t: 'no' },
      { w: 'Allen 2003, disputa viva', t: 'ok' }, { w: '«Todo el mundo sabe»', t: 'no' },
      { w: 'Sen, académico sólido', t: 'ok' }, { w: 'El dato del meme', t: 'no' },
      { w: 'La cifra con archivo', t: 'ok' }, { w: 'La cifra sin fuente', t: 'no' },
      { w: 'La disputa nombrada', t: 'ok' }, { w: 'El veredicto con música', t: 'no' },
    ],
  },
  {
    label: ['Da licencia', 'No da licencia'], btnA: '🗝️ Da licencia', btnB: '🚫 No da', colA: 'ok', colB: 'no',
    words: [
      { w: 'Un defensor asintió al resumen', t: 'ok' }, { w: 'Ver un video de ocho minutos', t: 'no' },
      { w: 'Diez minutos de pie sin corrección', t: 'ok' }, { w: 'Repetir al tío del asado', t: 'no' },
      { w: 'La fuerza moral concedida', t: 'ok' }, { w: 'La burla bien contada', t: 'no' },
      { w: 'Los números del acero pesados', t: 'ok' }, { w: 'El eco del propio bando', t: 'no' },
      { w: 'La caridad interpretativa', t: 'ok' }, { w: 'El panfleto leído dos veces', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se arma un acero, paso a paso',
    steps: [
      'Leer la doctrina en sus fuentes, no en sus enemigos',
      'Escribir el resumen que su defensor firmaría',
      'Ponerle su fuerza moral y sus mejores números, con etiqueta',
      'Correr la prueba de Turing: que un defensor asienta',
      'Recién entonces abrir el expediente de críticas',
      'Y conceder en voz alta lo que quede en pie',
    ],
  },
  {
    label: 'La defensa de diez minutos, de principio a fin',
    steps: [
      'La familia pone la mesa, el reloj y la regla pactada',
      'Se enuncia el materialismo histórico sin caricatura',
      'Se explica la explotación como la firmaría un marxista',
      'Se pone la fuerza moral: los informes y las minas',
      'Se cierran los números del acero con su etiqueta',
      'Si sonó a panfleto, se detiene y se repite otro día',
    ],
  },
  {
    label: 'Qué se hace con un dato que te alegra',
    steps: [
      'Notar la alegría: el dato hunde al bando que te disgusta',
      'Recordar la regla del placer',
      'Buscarle la horquilla, el método y la fuente',
      'Buscar la contracrítica pegada a la crítica',
      'Pasarlo por la misma báscula que un dato propio',
      'Solo entonces, apuntarlo en el cuaderno',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'La versión más fuerte, la que su autor firmaría', ans: 'El hombre de acero', opts: ['El hombre de acero', 'El hombre de paja', 'La licencia', 'La horquilla'] },
  { desc: 'El muñeco flojo que se arma para tumbarlo fácil', ans: 'El hombre de paja', opts: ['El hombre de paja', 'El hombre de acero', 'La caricatura del cine', 'El tío del asado'] },
  { desc: 'Exponer la doctrina sin que un defensor te distinga', ans: 'La prueba de Turing ideológica', opts: ['La prueba de Turing ideológica', 'La defensa detenida', 'El resumen de trabajo', 'La báscula pareja'] },
  { desc: 'El modo de producir condiciona instituciones e ideas', ans: 'El materialismo histórico', opts: ['El materialismo histórico', 'La teoría de la explotación', 'La sociedad sin clases', 'La tendencia a la crisis'] },
  { desc: 'El excedente lo produce el trabajo y se lo apropia el dueño', ans: 'La teoría de la explotación', opts: ['La teoría de la explotación', 'El materialismo histórico', 'La regla del placer', 'La fuerza moral'] },
  { desc: 'Niños en minas, con informes de inspectores en la mano', ans: 'La fuerza moral documentada', opts: ['La fuerza moral documentada', 'Los números del acero', 'La caricatura', 'El panfleto'] },
  { desc: 'Allen y Sen, con su etiqueta de disputa puesta', ans: 'Los números del acero', opts: ['Los números del acero', 'La fuerza moral', 'La cifra de bandera', 'El resumen de trabajo'] },
  { desc: 'Exponer diez minutos de pie sin que un marxista corrija', ans: 'La licencia de la etapa', opts: ['La licencia de la etapa', 'La prueba de Turing', 'La defensa detenida', 'El veredicto final'] },
]);

/* ---------- ¿qué está haciendo esa frase? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«El modo de producir condiciona las ideas»', func: 'Acero: la primera pieza del resumen fuerte', opts: ['Acero: la primera pieza del resumen fuerte', 'Caricatura de panfleto', 'Una cifra de bandera', 'La regla del placer'] },
  { trans: '«Marx era un vago que odiaba el trabajo»', func: 'Hombre de paja: nadie lo firmaría', opts: ['Hombre de paja: nadie lo firmaría', 'Acero legítimo', 'Un dato con horquilla', 'La fuerza moral'] },
  { trans: '«Esa cifra me encanta: los hunde»', func: 'La alarma del placer: paga doble auditoría', opts: ['La alarma del placer: paga doble auditoría', 'Una fuente confirmada', 'La licencia ganada', 'El test del espejo'] },
  { trans: '«Un marxista leería esto y diría: así es»', func: 'La prueba de Turing, superada', opts: ['La prueba de Turing, superada', 'Una rendición ideológica', 'Una caricatura fina', 'La defensa detenida'] },
  { trans: '«Detengamos aquí y lo repetimos el jueves»', func: 'La defensa detenida: precisión antes que velocidad', opts: ['La defensa detenida: precisión antes que velocidad', 'Una reprobación', 'Censura de la mesa', 'El fin de la materia'] },
]);

/* ---------- diagnóstico: ¿por dónde falla? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Un video «destruye el marxismo» en cinco minutos, sin citar una sola fuente', characteristic: 'Veredicto sin acero: cinco minutos no cargan la mejor versión ni sus horquillas', opts: ['Veredicto sin acero: cinco minutos no cargan la mejor versión ni sus horquillas', 'Le faltó música más épica', 'El problema es la duración del video', 'Debió citar más memes'] },
  { disease: 'Alguien refuta «querían quitarle la casa a todos» y celebra la victoria', characteristic: 'Tumbó un hombre de paja: el sistema real queda intacto y sin auditar', opts: ['Tumbó un hombre de paja: el sistema real queda intacto y sin auditar', 'Ganó el debate limpiamente', 'La frase era el punto central de Marx', 'Celebrar es el único error'] },
  { disease: 'Una exposición omite las minas y los informes, y el sistema queda como capricho', characteristic: 'Acero incompleto: sin la fuerza moral no se explican siglo y medio de lealtades', opts: ['Acero incompleto: sin la fuerza moral no se explican siglo y medio de lealtades', 'Mejor: así no se hace propaganda', 'La fuerza moral es irrelevante', 'Faltaron más fechas'] },
  { disease: 'Un cuaderno usa el número que hunde al rival, sin horquilla ni fuente', characteristic: 'Cifra de bandera: y encima alegró, así que debía doble auditoría', opts: ['Cifra de bandera: y encima alegró, así que debía doble auditoría', 'Los números fuertes no necesitan fuente', 'La horquilla es para indecisos', 'El rival usa peores números'] },
  { disease: 'Jael dice «los patrones roban y ya» en plena defensa de diez minutos', characteristic: 'La pieza sonó a caricatura: se detiene la defensa y se repite otro día', opts: ['La pieza sonó a caricatura: se detiene la defensa y se repite otro día', 'Se aprueba por el esfuerzo', 'Se le baja un punto y sigue', 'Era la formulación correcta'] },
  { disease: 'La casa estudia la crítica al marxismo y nunca abre el expediente gemelo', characteristic: 'Báscula despareja: la Bóveda no acepta un expediente sin el otro', opts: ['Báscula despareja: la Bóveda no acepta un expediente sin el otro', 'Con un expediente alcanza', 'El otro sistema no tiene fallas', 'Los pares son para las bibliotecas'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'La versión que su autor firmaría.', type: 'El hombre de acero' },
  { s: 'El muñeco flojo para tumbar fácil.', type: 'El hombre de paja' },
  { s: 'Exponer sin que un defensor te distinga.', type: 'La prueba de Turing ideológica (Caplan)' },
  { s: 'El modo de producir condiciona las ideas.', type: 'El materialismo histórico' },
  { s: 'El excedente y quién se lo apropia.', type: 'La teoría de la explotación' },
  { s: 'Niños en minas, con informes de inspectores.', type: 'La fuerza moral documentada' },
  { s: 'Allen 2003 y Sen, con etiqueta de disputa.', type: 'Los números del acero' },
  { s: 'Diez minutos de pie sin corrección.', type: 'La licencia de la etapa' },
  { s: 'El dato que alegra paga doble auditoría.', type: 'La regla del placer' },
  { s: 'Dos expedientes gemelos o ninguno.', type: 'La báscula pareja' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'El hombre de acero', gen: 'Herramienta', n: 'La versión que su autor firmaría', g: 'Antes de todo juicio', t: 'Regla de la casa' },
  { w: 'El hombre de paja', gen: 'Vicio', n: 'El muñeco flojo de los panfletos', g: 'Los dos púlpitos', t: 'Falacia remitida a su materia' },
  { w: 'La prueba de Turing ideológica', gen: 'Ejercicio', n: 'Que un defensor no te distinga', g: 'Caplan, divulgación', t: 'No es medida validada' },
  { w: 'El manifiesto comunista (1848)', gen: 'Fuente primaria', n: 'Entra en resumen de trabajo', g: 'Su dueña es otra materia', t: 'Resumen, no relectura' },
  { w: 'El capital, tomo I (1867)', gen: 'Fuente primaria', n: 'La explotación con definiciones', g: 'Su dueña es otra materia', t: 'Resumen, no relectura' },
  { w: 'Singer, breve introducción', gen: 'Divulgación', n: 'La escalera corta al resumen fuerte', g: 'Biblioteca de la etapa', t: 'Divulgación sólida' },
  { w: 'Farm to Factory (Allen, 2003)', gen: 'Defensa empírica', n: 'La industrialización con datos', g: 'Números del acero', t: 'Disputa viva' },
  { w: 'Sen, China-India', gen: 'Comparación', n: 'Salud básica antes de la reforma', g: 'Números del acero', t: 'Académico sólido' },
  { w: 'La regla del placer', gen: 'Vigilancia', n: 'La alegría como alarma', g: 'El cuaderno propio', t: 'Doble auditoría' },
  { w: 'La defensa detenida', gen: 'Protocolo', n: 'La mano alzada sin drama', g: 'La mesa de la casa', t: 'Se repite otro día' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'La regla de la casa: primero el acero, después la ___.', opts: ['respuesta', 'burla', 'nota'], ans: 'respuesta' },
  { s: 'Nadie audita lo que no puede ___.', opts: ['enunciar', 'comprar', 'ver'], ans: 'enunciar' },
  { s: 'El resumen fuerte lo firmaría un ___.', opts: ['marxista', 'rival', 'juez'], ans: 'marxista' },
  { s: 'La prueba de Turing es un ejercicio, no una medida ___.', opts: ['validada', 'divertida', 'rápida'], ans: 'validada' },
  { s: 'Los informes de inspectores documentaban las ___.', opts: ['minas', 'fiestas', 'ventas'], ans: 'minas' },
  { s: 'Allen defiende la industrialización con ___.', opts: ['datos', 'banderas', 'poemas'], ans: 'datos' },
  { s: 'Los expedientes gemelos se archivan ___.', opts: ['juntos', 'separados', 'nunca'], ans: 'juntos' },
  { s: 'La licencia son diez minutos de ___.', opts: ['pie', 'video', 'lectura'], ans: 'pie' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Por qué ninguna crítica empieza sin el acero? Explícalo con la imagen del ajedrecista que entrena solo.', ans: 'Porque refutar una versión que nadie firma es ganarle a nadie. El ajedrecista que entrena solo mueve flojas las piezas del rival y se vuelve invencible contra un fantasma; el día del torneo real descubre que nunca jugó de verdad. Lo mismo pasa con las doctrinas: quien solo conoce la caricatura del panfleto lleva años ganando sobremesas y no ha tocado el sistema real, que sigue intacto y sin auditar. El acero (la versión que su autor firmaría) es apuntarle al blanco de verdad: solo esa victoria cuenta, y solo esa derrota enseña.' },
  { q: 'Enuncia las cuatro piezas del resumen fuerte como las firmaría un marxista.', ans: 'Una: el materialismo histórico como programa de investigación: el modo en que una sociedad produce su vida material condiciona sus instituciones y sus ideas. Dos: la teoría de la explotación: el excedente lo produce el trabajo y se lo apropia el dueño de los medios de producción. Tres: la tendencia a la crisis: el sistema produce sus propias sacudidas periódicas. Cuatro: la promesa de la sociedad sin clases, que ordena el edificio entero. Enunciadas así, sin burla y en su vocabulario, un defensor diría «así es»: esa es la señal de que hay acero y no muñeco.' },
  { q: '¿Qué es la prueba de Turing ideológica, de quién es, y con qué etiqueta se usa?', ans: 'Es el ejercicio de exponer una doctrina ajena de modo que un defensor no distinga al alumno de uno de los suyos. La propuso Bryan Caplan, y la casa la usa con su etiqueta exacta: concepto de divulgación, útil como ejercicio, no una medida validada; la herramienta se fabrica en Estudio de las Ideologías y aquí se corre como estación primera. Pasarla no significa estar de acuerdo: significa que la crítica que venga después apuntará al sistema real y no a la caricatura, que es la única manera de que el veredicto valga algo.' },
  { q: '¿Por qué el acero incluye la fuerza moral y los números, y no solo la teoría?', ans: 'Porque un sistema sin su fuerza moral es otro hombre de paja. Marx no vendía un cielo: señalaba niños en minas con informes de inspectores ingleses en la mano, y esa indignación documentada explica siglo y medio de lealtades; omitirla deja el sistema como capricho sin causa. Y el acero de un sistema con Estado incluye sus mejores números: la industrialización que Allen defiende con datos (2003, disputa viva), los saltos de alfabetización y salud, el cotejo de Sen entre China y la India en salud básica. Entran con su etiqueta, y el módulo de los tres expedientes los pesará después contra sus costos: ponerlos en pie no es absolver, es pesar completo.' },
  { q: '¿Qué es la regla del placer y por qué el remedio es de procedimiento y no de voluntad?', ans: 'La regla dice: si un dato te alegra porque hunde al bando contrario, paga doble auditoría (horquilla, método, fuente y contracrítica) antes de entrar al cuaderno. Es de procedimiento porque la evidencia sobre el sesgo de mi lado muestra que el detector de trampas se afina solo hacia el rival: proponerse ser imparcial no alcanza, igual que proponerse no tener sed no hidrata. Por eso la casa no confía en la voluntad: instala el procedimiento fijo, y el argumento propio pasa por las mismas preguntas críticas que el ajeno.' },
  { q: '¿Por qué esta materia se estudia en pares con el Expediente Dorado?', ans: 'Porque el acero de esta casa se mide en pares: la Crítica al Marxismo y la Crítica al Capitalismo comparten esqueleto módulo a módulo, y la Bóveda no acepta un expediente sin el otro. La razón es la misma báscula: quien audita con dureza solo al sistema que le disgusta no está auditando, está militando con notas al pie. El test del espejo lo dice en una pregunta: ¿aceptarías este argumento, esta cifra o esta oferta si viniera del bando contrario? Si la respuesta es no, el problema no es el bando: es la báscula.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['ACERO', 'PAJA', 'JUICIO', 'MARX', 'CLASES', 'MINAS']),
  haceSopa(10, ['TURING', 'CAPLAN', 'SINGER', 'ALLEN', 'SEN', 'LICENCIA']),
  haceSopa(10, ['EXPEDIENTE', 'ARCHIVO', 'FUENTE', 'METODO', 'BASCULA', 'PLACER']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'El hombre de acero es la versión que el autor del argumento firmaría.', a: true },
  { q: 'Refutar un hombre de paja refuta el sistema real.', a: false },
  { q: 'La licencia de la etapa es exponer el marxismo diez minutos sin corrección.', a: true },
  { q: 'El materialismo histórico se enuncia aquí como programa de investigación.', a: true },
  { q: 'La teoría de la explotación se resume honestamente como «roban y ya».', a: false },
  { q: 'La fuerza moral del sistema venía de informes de inspectores sobre las minas.', a: true },
  { q: 'La prueba de Turing ideológica es una medida científica validada.', a: false },
  { q: 'Allen (2003) presenta la mejor defensa empírica de la industrialización soviética.', a: true },
  { q: 'Los números del acero entran sin etiqueta, porque son favorables.', a: false },
  { q: 'Si la defensa suena a caricatura, se detiene y se repite otro día.', a: true },
  { q: 'La regla del placer manda doble auditoría al dato que te alegra.', a: true },
  { q: 'El Manifiesto y El capital se releen enteros en esta etapa.', a: false },
  { q: 'La Bóveda acepta el expediente rojo sin su gemelo dorado.', a: false },
  { q: 'Pasar la prueba de Turing obliga a estar de acuerdo con la doctrina.', a: false },
  { q: 'Los dos púlpitos (insulto y bandera) eximen igual de estudiar.', a: true },
]);
B.evalMCBank = JSON.stringify([
  { q: 'El hombre de acero es…', o: ['a) La versión más fuerte, la que su autor firmaría', 'b) El muñeco fácil de tumbar', 'c) Un personaje del cine', 'd) El moderador del debate'], a: 0 },
  { q: 'El hombre de paja es…', o: ['a) La mejor versión del rival', 'b) El muñeco flojo que se arma para tumbarlo', 'c) Un argumento económico', 'd) El árbitro de la mesa'], a: 1 },
  { q: 'La licencia de esta etapa consiste en…', o: ['a) Un examen escrito', 'b) Un veredicto publicado', 'c) Exponer el marxismo diez minutos sin que un marxista corrija', 'd) Leer El capital entero'], a: 2 },
  { q: 'El materialismo histórico afirma que…', o: ['a) Solo existe la materia', 'b) La historia la escriben los ganadores', 'c) Las ideas no importan', 'd) El modo de producir condiciona instituciones e ideas'], a: 3 },
  { q: 'La teoría de la explotación dice que…', o: ['a) El excedente lo produce el trabajo y se lo apropia el dueño', 'b) Todo comercio es robo', 'c) Los salarios siempre suben', 'd) El dinero es una ilusión'], a: 0 },
  { q: 'La fuerza moral del sistema salía de…', o: ['a) Promesas de riqueza', 'b) Niños en minas, documentados por inspectores', 'c) El carisma de Engels', 'd) La poesía de la época'], a: 1 },
  { q: 'La prueba de Turing ideológica es de…', o: ['a) Alan Turing', 'b) Peter Singer', 'c) Bryan Caplan', 'd) Robert Allen'], a: 2 },
  { q: 'Su etiqueta correcta es…', o: ['a) Ley de la lógica', 'b) Medida validada', 'c) Norma académica', 'd) Ejercicio de divulgación'], a: 3 },
  { q: '«Farm to Factory» (2003) es…', o: ['a) La mejor defensa empírica de la industrialización soviética, en disputa viva', 'b) Un panfleto de propaganda', 'c) Una novela', 'd) Un informe de la ONU'], a: 0 },
  { q: 'Sen comparó China y la India en…', o: ['a) Producción de acero', 'b) Salud básica antes de la reforma china', 'c) Carreras espaciales', 'd) Literatura'], a: 1 },
  { q: 'El Manifiesto y El capital entran aquí…', o: ['a) Enteros y por primera vez', 'b) Prohibidos', 'c) En resumen de trabajo: los enteros viven en sus materias dueñas', 'd) Solo en citas de enemigos'], a: 2 },
  { q: 'Si la defensa suena a caricatura…', o: ['a) Se aprueba con nota baja', 'b) Se cambia de tema', 'c) Se sube la voz', 'd) Se detiene y se repite otro día'], a: 3 },
  { q: 'La regla del placer manda que el dato que te alegra…', o: ['a) Pague doble auditoría antes de entrar al cuaderno', 'b) Se publique primero', 'c) Se descarte siempre', 'd) Se guarde para el final'], a: 0 },
  { q: 'Los expedientes rojo y dorado…', o: ['a) Compiten por la Bóveda', 'b) Se archivan juntos: uno no entra sin el otro', 'c) Se escriben por bandos', 'd) Son el mismo documento'], a: 1 },
  { q: 'Los dos púlpitos son…', o: ['a) Dos escuelas académicas', 'b) Dos partidos hondureños', 'c) El insulto y la bandera: los dos eximen de estudiar', 'd) Dos muebles de iglesia'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'La versión que su autor firmaría es el hombre de ___.', a: 'acero' },
  { q: 'El muñeco flojo de los panfletos es el hombre de ___.', a: 'paja' },
  { q: 'Nadie audita lo que no puede ___.', a: 'enunciar' },
  { q: 'La licencia son diez minutos de ___.', a: 'pie' },
  { q: 'El modo de producir condiciona instituciones e ___.', a: 'ideas' },
  { q: 'El excedente lo produce el ___.', a: 'trabajo' },
  { q: 'La prueba de Turing ideológica la propuso ___.', a: 'Caplan' },
  { q: 'La breve introducción a Marx es de ___.', a: 'Singer' },
  { q: '«Farm to Factory» (2003) es de ___.', a: 'Allen' },
  { q: 'La salud de China y la India la comparó ___.', a: 'Sen' },
  { q: 'Los inspectores documentaban niños en las ___.', a: 'minas' },
  { q: 'Toda cifra entra con su ___.', a: 'horquilla' },
  { q: 'El dato que alegra paga ___ auditoría.', a: 'doble' },
  { q: 'Si suena a caricatura, la defensa se ___.', a: 'detiene' },
  { q: 'Los expedientes gemelos se archivan ___.', a: 'juntos' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Hombre de acero', def: 'La versión más fuerte, la que su autor firmaría' },
  { term: 'Hombre de paja', def: 'El muñeco flojo que se tumba sin mérito' },
  { term: 'La licencia', def: 'Diez minutos de pie sin que un marxista corrija' },
  { term: 'Materialismo histórico', def: 'El modo de producir condiciona instituciones e ideas' },
  { term: 'Teoría de la explotación', def: 'El excedente lo produce el trabajo y se lo apropia el dueño' },
  { term: 'Prueba de Turing ideológica', def: 'Que un defensor no te distinga de los suyos' },
  { term: 'Bryan Caplan', def: 'Propuso la prueba de Turing: ejercicio, no medida' },
  { term: 'La fuerza moral', def: 'Las minas con informes de inspectores' },
  { term: 'Allen (2003)', def: 'La defensa empírica de la industrialización, en disputa' },
  { term: 'Sen', def: 'El cotejo China-India en salud básica' },
  { term: 'Resumen de trabajo', def: 'Cómo entran aquí el Manifiesto y El capital' },
  { term: 'La regla del placer', def: 'El dato que alegra paga doble auditoría' },
  { term: 'La defensa detenida', def: 'La mano alzada cuando suena a caricatura' },
  { term: 'La báscula pareja', def: 'Los expedientes gemelos se archivan juntos' },
  { term: 'Los dos púlpitos', def: 'El insulto y la bandera: ambos eximen de estudiar' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'La misma semana llegan a Sugerencias dos mensajes sobre la ficha de la huelga del 54: un maestro escribe que «adoctrina comunismo» y otro que «lava a las bananeras». La oferta implícita: reescribirla para calmar a uno.' },
  { txt: 'El mismo mes llegan dos ofertas: una cooperación ofrece L 200.000 para misiones de «pensamiento crítico y justicia social» con lista de lecturas incluida, y una fundación ofrece L 180.000 para misiones de «libertad económica» con la suya.' },
  { txt: 'Jael llega de un grupo de estudio con un video: «el marxismo destruyó todo lo que tocó», ocho minutos, música épica, cero fuentes. Pide verlo en la mesa esta noche.' },
  { txt: 'En el asado, un tío sentencia: «Marx era un vago que quería quitarle la casa al que trabajara». Varios asienten y Angelly espera la respuesta del autor.' },
  { txt: 'Angelly pregunta de regreso: «¿por qué vamos a estudiar a los malos? ¿No es peligroso aprender lo que dicen?».' },
  { txt: 'Un canal educativo ofrece L 3.000 por un video de M.E.T.A.S «destruyendo el marxismo en cinco minutos», con logo de la plataforma y garantía de vistas.' },
  { txt: 'Preparando la ficha, el autor encuentra una cifra devastadora contra el sistema auditado y nota la alegría de haberla encontrado: es perfecta para cerrar la página.' },
  { txt: 'Jael ensaya la defensa de diez minutos y, al llegar a la explotación, dice: «o sea, los patrones roban y ya». El papá levanta la mano, como estaba pactado.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué versión está sobre la mesa: el acero que un defensor firmaría, o la caricatura de un panfleto? Cita la frase exacta que lo delata.',
  '2. ¿Qué mete y qué saca la salida fácil, y qué dice el test del espejo: se aceptaría lo mismo viniendo del bando contrario?',
  '3. ¿Qué cifra o afirmación del caso necesita horquilla, método, fuente y fecha antes de usarse, y qué etiqueta le toca?',
  '4. ¿Qué condición escrita deja la casa, y qué se le concede en voz alta al otro lado, sin sermón y sin celebrar?',
]);
B.critCaseGuides = JSON.stringify([
  'Se identifica primero la versión en juego: si la frase que se va a juzgar no la firmaría ningún defensor (el vago, el ladrón de casas, el paraíso vago), es un hombre de paja, y tumbarlo no tumba nada. Si es el resumen fuerte (el modo de producir, el excedente, la crisis, la sociedad sin clases), hay acero y el juicio puede empezar. La frase exacta importa: la caricatura vive en las palabras, no en las intenciones.',
  'Después se pesa la salida fácil con el test del espejo: reescribir la ficha para un bando, aceptar la lista de lecturas de un patrocinador, firmar la demolición exprés. La pregunta es una: ¿aceptaría la casa exactamente lo mismo si viniera del bando contrario? Si la respuesta es no, no se acepta de ninguno, porque la báscula que cambia de dueño según quién reclame no es báscula: es militancia con notas al pie.',
  'Toda cifra del caso (la de un video, la que alegra, la que cierra perfecto una página) entra por el mismo torno: horquilla, método, fuente y fecha, y su etiqueta puesta (disputa viva, académico sólido, divulgación con inflado). Y si el dato alegra porque hunde al bando que disgusta, la regla del placer manda doble auditoría: la alegría no invalida el dato, pero convierte al auditor en sospechoso de su propia báscula.',
  'Todo caso termina con la condición escrita y la concesión en voz alta: qué tendría que pasar para el sí (la doble columna, el acero de dos minutos al frente del video, la cláusula editorial antes del primer lempira), y qué se le concede al otro lado (el video acierta en algo, el tío teme algo real, el patrocinador ofrece algo que la casa necesita). Conceder no es rendirse: es la señal de que el juicio fue con licencia, y la respuesta se da una vez y bien, sin sermón y sin celebrar.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"Ya vi tres videos en contra: estoy listo para el veredicto".', g1: 'Tres videos del propio bando no son lectura: son eco. La licencia no se gana mirando demoliciones, sino exponiendo la doctrina hasta que un defensor asienta.', g2: 'La corrección: antes del veredicto, la prueba de Turing. Si un marxista leyera tu resumen y se riera, todavía no tienes juicio: tienes playlist.' },
  { txt: '"Para qué enunciar bien lo que voy a refutar, si igual está mal".', g1: 'Si está mal, la versión fuerte también lo estará, y refutarla valdrá. Refutar la versión floja no vale: el sistema real queda intacto, esperando a alguien que sí lo haya leído.', g2: 'El acero no es cortesía: es control de calidad del propio veredicto. Quien le teme a la mejor versión del rival está confesando que su crítica solo funciona contra el muñeco.' },
  { txt: '"Esa cifra la uso sin revisar: viene de los míos".', g1: 'La cifra de los míos es exactamente la más peligrosa: el detector de trampas se afina solo hacia el rival, así que lo propio entra sin revisión y contamina el cuaderno.', g2: 'La regla es pareja: horquilla, método, fuente y fecha para toda cifra, y doble auditoría si además te alegra. El procedimiento no tiene bando; por eso funciona.' },
  { txt: '"Marx señalaba las minas, así que su sistema económico es correcto".', g1: 'Confunde la fuerza moral con la validez técnica: la indignación documentada explica lealtades, pero no suma ni resta en la calculadora. Son dos libros distintos del expediente.', g2: 'El acero pone las minas en pie porque omitirlas es caricatura; el módulo de la calculadora auditará la teoría con aritmética. Conceder la fuerza moral no es firmar el sistema.' },
  { txt: '"Detuvieron mi defensa: me reprobaron".', g1: 'Detener no es reprobar: es la regla pactada funcionando. La caricatura detectada a tiempo es el método protegiendo la licencia, no un castigo.', g2: 'La defensa se repite otro día, con la pieza revisada. La licencia se gana con precisión, y el que la gana a la segunda la tiene igual de entera que el que la gana a la primera.' },
  { txt: '"Estudiar el marxismo tan bien es volverse marxista".', g1: 'Confunde habitar una historia con ser poseído por ella: la prueba de Turing mide precisión, no lealtad. El médico que domina el virus no está infectado: está vacunado.', g2: 'El peligro real es el contrario: quien solo conoce la caricatura queda indefenso ante el primer predicador que le enseñe el original con música. La cepa completa es la vacuna.' },
]);
B.critDecisionBank = JSON.stringify([
  'Los dos maestros de la huelga del 54 esperan respuesta esta semana: ¿se reescribe la ficha, y con qué regla? ¿Y qué se les contesta a los dos?',
  'Las ofertas espejo (L 200.000 y L 180.000) tienen fecha límite: ¿qué dice el test del espejo, y qué cláusula tendría que quedar por escrito antes del primer lempira?',
  'El video de Jael se ve esta noche en la mesa: ¿con qué pregunta se mira, qué se le concede en voz alta, y qué no se hace?',
  'El tío del asado acaba de sentenciar y Angelly espera: ¿se debate en la sobremesa, se calla, o se hace otra cosa? ¿Qué exactamente?',
  'Angelly pregunta si es peligroso estudiar «a los malos»: ¿qué se le contesta a su edad, y qué garantía ofrece el método de la casa?',
  'El canal ofrece L 3.000 por la demolición de cinco minutos: ¿qué condición haría el sí posible, y por qué el formato original no la cumple?',
  'La cifra devastadora alegró al autor: ¿qué pasos manda la regla del placer antes de que entre a la ficha, y qué pasa si no los pasa?',
  'La defensa de Jael se detuvo en la explotación: ¿qué se hace esa noche, qué se revisa, y cómo se decide cuándo repetir?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Reconstruir el argumento del rival hasta que él diga «así es», y responder eso.', b: 'Responder la versión del rival que circula en los memes del propio bando.', ga: 'Caso A: la respuesta toca el sistema real; si lo tumba, tumbó algo, y si no puede, obliga a pensar mejor: las dos salidas enseñan.', gb: 'Caso B: se gana la sobremesa y se pierde el siglo: el muñeco cae, el sistema queda intacto, y los defensores se confirman al ver que nadie los ha leído.', gr: 'La diferencia no es de cortesía sino de puntería: solo la crítica que pasa por el acero sabe a qué le está disparando.' },
  { a: 'Responder a los dos maestros del 54 con el mismo texto a doble columna.', b: 'Calmar al que grita más fuerte reescribiendo la ficha a su gusto.', ga: 'Caso A: la ficha queda auditable (cada afirmación con fuente, cada disputa con dos lados) y la casa conserva la confianza de las dos mitades.', gb: 'Caso B: se compra paz con una mitad pagando con la honestidad de la ficha, y el próximo grito ya sabe que gritar funciona.', gr: 'El test es leer la ficha y no poder deducir el bando del autor: esa ilegibilidad del bando es la firma de la báscula pareja.' },
  { a: 'Aceptar patrocinio con cláusula escrita: el temario lo escribe la casa, toda lectura con su contracrítica.', b: 'Aceptar los L 200.000 con la lista de lecturas incluida, «total, son buenos libros».', ga: 'Caso A: entra el dinero sin entrar las gafas: la línea editorial queda en la casa y la cláusula lo prueba por escrito.', gb: 'Caso B: quien pone la lista pone las gafas, y en un año M.E.T.A.S enseña lo que el patrocinador lee, con el logo de la casa encima.', gr: 'El test del espejo decide: si la oferta gemela del bando contrario no se aceptaría en los mismos términos, esta tampoco.' },
  { a: 'Conceder en voz alta lo que el video de Jael acierta, y luego pedir el documento con fecha.', b: 'Burlarse del video completo porque el bando que lo hizo disgusta.', ga: 'Caso A: Jael aprende el gesto completo: el acero se les debe también a los videos, y la pregunta por el documento desarma sin humillar.', gb: 'Caso B: se le enseña a Jael que el veredicto depende de quién habla, no de qué sostiene, que es exactamente el vicio que la materia vino a curar.', gr: 'Conceder lo cierto no fortalece al video: fortalece la báscula, y una báscula fuerte es lo único que Jael podrá llevarse a todos sus grupos.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se refuta la caricatura en vez del acero.', guide: 'El muñeco cae, el sistema real queda intacto y sin auditar, los defensores se confirman al verse mal leídos, y el refutador celebra una victoria que no ocurrió.' },
  { cause: 'La casa exige la licencia antes del veredicto.', guide: 'El juicio que venga tocará el blanco real: la crítica valdrá si tumba, la concesión valdrá si sostiene, y ningún púlpito podrá usar a la casa de eco.' },
  { cause: 'Una cifra entra al cuaderno sin horquilla ni fuente.', guide: 'El cuaderno se contamina: la primera cifra de bandera abre la puerta a las demás, y el expediente termina valiendo lo que un video de ocho minutos con música.' },
  { cause: 'El dato que alegra se publica sin la doble auditoría.', guide: 'Tarde o temprano aparece la horquilla completa, la casa queda como un púlpito más, y la confianza que costó años se paga en una tarde.' },
  { cause: 'La defensa se detiene a tiempo cuando suena a caricatura.', guide: 'La pieza se revisa esa noche, la licencia se gana a la segunda con precisión entera, y la regla pactada demuestra que detener no es humillar: es cuidar el método.' },
  { cause: 'Se estudia un expediente sin abrir jamás el gemelo.', guide: 'La báscula queda despareja: la dureza de un solo lado no es auditoría sino militancia con notas al pie, y la Bóveda con razón no acepta el archivo.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'Los dos maestros del 54 recibieron el mismo texto, y ninguno pudo deducir el bando.', guide: 'La ficha se reescribió a doble columna: cada afirmación con fuente, cada disputa con sus dos lados nombrados, y la respuesta fue una sola para los dos.' },
  { effect: 'Ninguna de las dos ofertas espejo se aceptó.', guide: 'El test del espejo falló en ambas: la casa no aceptaría la lista de lecturas del bando contrario, así que no aceptó ninguna; el temario lo sigue escribiendo la casa.' },
  { effect: 'El video de Jael se apagó solo a la mitad, sin sermón.', guide: 'Se le hizo una pregunta por afirmación: ¿qué documento con fecha la sostiene? Al tercer silencio, la propia Jael pidió pausarlo, y lo que el video acertaba se concedió en voz alta.' },
  { effect: 'Angelly dejó de tenerle miedo a la materia.', guide: 'Se le explicó la vacuna con la cepa completa: nadie audita lo que no puede enunciar, y el método (crítica con contracrítica, cifra con horquilla) es la garantía de que estudiar no es convertirse.' },
  { effect: 'El canal retiró la oferta y la marca quedó entera.', guide: 'La casa contrapropuso el formato con acero (dos minutos donde un marxista asentiría, después la crítica con fuentes) y el canal no lo quiso: la demolición exprés era el producto, y M.E.T.A.S no lo firma.' },
  { effect: 'La cifra devastadora entró a la ficha, pero con su horquilla y su crítico al lado.', guide: 'La regla del placer la mandó a doble auditoría: resultó punta alta de una disputa viva, y entró etiquetada; el dato sobrevivió, y la báscula también.' },
]);

/* ---------- línea de tiempo: los siete momentos ---------- */
B.timelineData = JSON.stringify([
  { y: '1848', icon: '📜', label: 'El Manifiesto', text: 'Marx y Engels publican <strong>El manifiesto comunista</strong>: la promesa de la sociedad sin clases y la historia como pleito de clases. <strong>Aquí entra en resumen de trabajo:</strong> el entero vive en sus materias dueñas.' },
  { y: '1860s', icon: '⛏️', label: 'Los informes', text: 'Los <strong>inspectores fabriles ingleses</strong> documentan niños en minas y fábricas. Marx los usa como munición: <strong>la fuerza moral del sistema es indignación documentada</strong>, no promesa de cielo, y el acero la incluye.' },
  { y: '1867', icon: '📕', label: 'El capital', text: 'El tomo I arma la pieza técnica: <strong>el excedente lo produce el trabajo y se lo apropia el dueño</strong>. Es una tesis con definiciones, no un insulto: por eso se puede auditar, y por eso el panfleto la caricaturiza.' },
  { y: 'S. XX', icon: '🏭', label: 'El sistema con Estado', text: 'La doctrina gobierna países. Su mejor expediente (la industrialización que <strong>Allen defiende con datos</strong>, los saltos de alfabetización, el cotejo de <strong>Sen</strong> en salud) entra al acero <strong>con etiqueta de disputa viva</strong>; los costos se pesarán en su módulo.' },
  { y: '1900s', icon: '🗣️', label: 'Los dos púlpitos', text: 'Siglo y medio de insulto y bandera: en esta vecindad la palabra exime de estudiar <strong>en las dos direcciones</strong>. Quien domina el acero deja de ser presa fácil de ambos púlpitos, y eso es una forma de libertad.' },
  { y: 'Hoy', icon: '🎭', label: 'La prueba de Turing', text: 'Caplan propone el ejercicio: exponer la doctrina <strong>sin que un defensor te distinga</strong>. Etiqueta: divulgación útil, no medida validada. La casa la corre como estación primera de todo juicio.' },
  { y: 'Esta etapa', icon: '🗝️', label: 'La licencia', text: '<strong>Diez minutos de pie sin que un marxista corrija.</strong> Con la licencia ganada se abren las etapas que siguen: la calculadora, el tribunal, los tres expedientes. <strong>Sin licencia no hay juicio: hay eco.</strong>' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  resumen: {
    nombre: 'El resumen fuerte', icon: '🛡️',
    estructura: { title: 'Qué es', info: '• Las cuatro piezas que un marxista firmaría:<br>• <strong>Materialismo histórico</strong> y <strong>explotación</strong><br>• <strong>Tendencia a la crisis</strong> y <strong>sociedad sin clases</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se enuncia <strong>en el vocabulario del defensor</strong>, sin comillas de burla<br>• Como programa de investigación, no como profecía<br>• Y con las definiciones puestas: <strong>por eso se puede auditar</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• «Roban y ya»: la pieza difícil <strong>vuelta insulto</strong><br>• El paraíso vago: la promesa <strong>vuelta chiste</strong><br>• Releer los enteros que ya cursaron <strong>sus materias dueñas</strong>' },
    cuidados: { title: 'En esta casa', info: '• El resumen se escribe <strong>antes</strong> de toda crítica<br>• Se ensaya de pie, con reloj<br>• Y si suena a caricatura, <strong>se detiene y se repite otro día</strong>' },
  },
  turing: {
    nombre: 'La prueba de Turing', icon: '🎭',
    estructura: { title: 'Qué es', info: '• El ejercicio de <strong>Bryan Caplan</strong>: exponer la doctrina ajena<br>• De modo que <strong>un defensor no te distinga</strong> de los suyos<br>• Etiqueta: <strong>divulgación útil, no medida validada</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• El vocabulario es el del defensor, <strong>en su sentido</strong><br>• La fuerza moral aparece documentada<br>• Y el cierre lo diría un defensor: <strong>«así es, eso sostengo»</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Burlas o comillas de desprecio <strong>a media frase</strong><br>• Confundir pasar la prueba con <strong>estar de acuerdo</strong><br>• Usarla como medida científica: <strong>es un ejercicio</strong>' },
    cuidados: { title: 'En esta casa', info: '• Es la <strong>estación primera</strong> de todo juicio<br>• La fábrica de la herramienta vive en Estudio de las Ideologías<br>• Y se aplica <strong>a los dos púlpitos por igual</strong>' },
  },
  fuerza: {
    nombre: 'La fuerza moral', icon: '⚖️',
    estructura: { title: 'Qué es', info: '• Lo que la crítica perezosa omite: <strong>Marx no vendía un cielo</strong><br>• Señalaba <strong>niños en minas</strong> con informes de inspectores ingleses<br>• Indignación documentada: <strong>explica siglo y medio de lealtades</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Trae documento: <strong>los informes fabriles</strong>, con fecha<br>• Explica por qué gente seria creyó, <strong>sin volverla tonta</strong><br>• Y no suma en la calculadora: <strong>conmover no es demostrar</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Omitirla: el sistema queda como <strong>capricho sin causa</strong><br>• Confundirla con validez técnica: <strong>son libros distintos</strong><br>• Usarla de escudo contra toda auditoría' },
    cuidados: { title: 'En esta casa', info: '• Entra al acero <strong>siempre</strong>, antes del expediente<br>• Se concede en voz alta sin firmar el sistema<br>• Y se separa del veredicto: <strong>la báscula pesa, no llora</strong>' },
  },
  numeros: {
    nombre: 'Los números del acero', icon: '📊',
    estructura: { title: 'Qué es', info: '• El mejor expediente empírico que un defensor presentaría<br>• <strong>Allen (2003)</strong>: la industrialización, con datos<br>• <strong>Sen</strong>: salud básica China-India antes de la reforma' },
    funcion: { title: 'Cómo se reconoce', info: '• Cada cifra con <strong>horquilla, método, fuente y fecha</strong><br>• Cada defensa con <strong>su etiqueta</strong>: disputa viva, académico sólido<br>• Y el dato que alegra, <strong>con doble auditoría</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• El número redondo <strong>de bandera</strong><br>• Poner solo los números que hunden, <strong>o solo los que salvan</strong><br>• Confundir poner en pie con <strong>absolver</strong>: pesar viene después' },
    cuidados: { title: 'En esta casa', info: '• Se ponen en pie aquí, <strong>se pesan en los tres expedientes</strong><br>• La báscula es pareja: el expediente gemelo usa las mismas reglas<br>• Y ningún número entra <strong>sin su disputa nombrada</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Repite panfletos 📰' },
  { t: 25, n: 'Distingue acero de caricatura 🛡️' },
  { t: 55, n: 'Enuncia el materialismo histórico 🏭' },
  { t: 90, n: 'Pone la fuerza moral en pie ⚖️' },
  { t: 130, n: 'Carga los números con etiqueta 📊' },
  { t: 165, n: 'Pasa la prueba de Turing 🎭' },
  { t: 190, n: 'Tiene la licencia de los diez minutos 📕' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del acero superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario del expediente explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de aceros y caricaturas experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del expediente maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del expediente' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta del Expediente Rojo completada' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_rojo_acero_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena el juicio con licencia, no la auditoría del miedo. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se nombra la versión que está sobre la mesa: si la frase no la firmaría ningún defensor es un hombre de paja, y lo que se decida sobre él no decide nada, así que se reconstruye el acero antes de seguir. Después se corre el test del espejo sobre la salida fácil: si la casa no aceptaría lo mismo viniendo del bando contrario, no lo acepta de ninguno, porque la báscula que cambia de dueño no es báscula. Luego pasan las cifras por el torno: horquilla, método, fuente y fecha, con doble auditoría para el dato que alegra, porque el detector de trampas se afina solo hacia el rival y el remedio es de procedimiento, no de voluntad. Y al final se escribe la condición y se concede en voz alta lo que el otro lado tenga de cierto, una vez y bien, sin sermón y sin celebrar, porque conceder lo cierto no fortalece al rival: fortalece la báscula, que es lo único que la casa no puede perder.";');

/* ---------- lo que arrastra el molde (la etapa 1 de los átomos) ---------- */
const textos = [
  [/⚛️ \*Ruta de los Átomos y los Ídolos · Etapa 1\* ⚛️\\n\\nÁtomos contra el miedo: Demócrito, Epicuro y Lucrecio, y la física que quita los dos miedos\. ⚛️\\n\\n_Incluye evaluación conceptual y el miedo sobre la mesa\._ ✍️/g,
    '📕 *Ruta del Expediente Rojo · Etapa 1* 📕\\n\\nEl acero antes del juicio: la mejor versión primero, el veredicto después. Nadie audita lo que no puede enunciar. 📕\\n\\n_Incluye evaluación conceptual, el acero sobre la mesa, guion de video y tres lecturas._ ✍️'],
  [/Átomos contra el miedo · Ruta de los Átomos y los Ídolos/g, 'El acero antes del juicio · Ruta del Expediente Rojo'],
  [/El miedo sobre la mesa/g, 'El acero sobre la mesa'],
  [/el miedo sobre la mesa/g, 'el acero sobre la mesa'],
  [/completó la Etapa 1 de la Ruta de los Átomos y los Ídolos \(Átomos contra el miedo\)/g,
    'completó la Etapa 1 de la Ruta del Expediente Rojo (El acero antes del juicio)'],
  [/const msgs=\['¡Sigue preguntando de qué está hecho!','¡Muy buen trabajo!','¡Aprendiz del Jardín!','¡Ya distingues el pan del anzuelo!','¡Desmontador de miedos!'\]/,
    "const msgs=['¡Sigue armando el acero!','¡Muy buen trabajo!','¡Aprendiz de herrero!','¡Ya distingues acero de caricatura!','¡Juez con licencia!']"],
  [/\['#92400e','#d97706','#a8a29e','#d4a017','#00b894'\]/, "['#9f1239','#e11d48','#a8a29e','#d4a017','#00b894']"],
  /* el burdeos del expediente en las pruebas imprimibles */
  [/#92400e/g, '#9f1239'],
  [/#f6ede2/g, '#fdf0f3'],
  /* el ejemplo del generador de tareas venía de la materia anterior */
  [/No hay más que átomos y vacío\./g, 'La versión que su autor firmaría.'],
  [/>Atomismo</g, '>El hombre de acero<'],
  /* las preguntas fijas de la prueba competencial preguntaban por el miedo */
  [/¿Qué miedo o deseo sostiene el caso y con qué tope, qué mecanismo hay detrás y quién cobra por esconderlo, y qué frasco o distinción de la etapa lo resuelve\? Explica la condición escrita que deja la casa y qué se contesta sin burlarse de nadie\./g,
    '¿Qué versión está sobre la mesa y quién la firmaría, qué dice el test del espejo sobre la salida fácil, y qué cifra necesita horquilla, método y fuente? Explica la condición escrita que deja la casa y qué se concede en voz alta al otro lado.'],
  [/1\. ¿Cuál de los dos enseña el mecanismo antes de pedir algo\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos juzga con licencia y cuál hace eco? 2. ¿Por qué no son la misma decisión?'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de los átomos era la cadena del eclipse. Aquí es la defensa
   de diez minutos: la pieza difícil dicha como caricatura o como acero. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(acero){sfx(acero?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(acero){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🛡️</span><span class="ms-text"><strong>La pieza salió con definiciones:</strong> «el excedente lo produce el trabajo y se lo apropia el dueño de los medios». La familia escuchó completo, y nadie pudo distinguir si Jael era de los suyos: eso era la prueba.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🗝️</span><span class="ms-text"><strong>La licencia quedó ganada:</strong> diez minutos de pie sin corrección. Ahora sí viene el juicio, con las etapas que siguen, y la primera crítica que Jael escriba tocará el sistema real, no un muñeco.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">✋</span><span class="ms-text"><strong>La mano se alzó, como estaba pactado:</strong> «roban y ya» no lo firmaría ningún defensor. No es reprobación: es la regla protegiendo la licencia. La defensa se detiene sin drama.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📚</span><span class="ms-text"><strong>Esa noche se revisa la pieza:</strong> la tesis con sus definiciones, que justo por eso se puede auditar. La defensa se repite otro día, y la licencia ganada a la segunda vale igual de entera.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='resumen',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"resumen\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/⚛️/g, '📕');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
