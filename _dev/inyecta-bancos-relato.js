/* Inyecta los bancos de la misión «El relato: contar el proyecto sin inflarlo»
   (Ruta de la Marca, etapa 3) sobre el molde copiado de la etapa 2, «La oferta».
   Uso:  node _dev/inyecta-bancos-relato.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-marca-relato', 'js', 'relato.js');

let _semilla = 20260729;
function rnd() { _semilla = (_semilla * 1103515245 + 12345) % 2147483648; return _semilla / 2147483648; }
const ABC = 'ABCDEFGHIJLMNOPRSTUVZ';
function haceSopa(size, palabras) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const dirs = [[0, 1], [1, 0], [1, 1]];
  const salida = [];
  for (const w of palabras) {
    let puesto = false;
    for (let i2 = 0; i2 < 800 && !puesto; i2++) {
      const [dr, dc] = dirs[Math.floor(rnd() * dirs.length)];
      const r0 = Math.floor(rnd() * size), c0 = Math.floor(rnd() * size);
      if (r0 + dr * (w.length - 1) >= size || c0 + dc * (w.length - 1) >= size) continue;
      let cabe = true;
      for (let i = 0; i < w.length; i++) { const ch = grid[r0 + dr * i][c0 + dc * i]; if (ch !== null && ch !== w[i]) { cabe = false; break; } }
      if (!cabe) continue;
      const cells = [];
      for (let i = 0; i < w.length; i++) { grid[r0 + dr * i][c0 + dc * i] = w[i]; cells.push([r0 + dr * i, c0 + dc * i]); }
      salida.push({ w, cells }); puesto = true;
    }
    if (!puesto) throw new Error('No cupo ' + w);
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c] === null) grid[r][c] = ABC[Math.floor(rnd() * ABC.length)];
  return { size, grid, words: salida };
}

const B = {};
B.SAVE_KEY = `'faro_mkt_relato_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del relato honesto superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del relato explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de hecho comprobable e inflado experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del relato maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del relato' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta de la Marca completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Adorna sin darse cuenta 🎈' },
  { t: 25, n: 'Quita los adjetivos ✂️' },
  { t: 55, n: 'Le pone denominador a la cifra 📊' },
  { t: 90, n: 'Enseña la prueba 🧾' },
  { t: 130, n: 'Dice lo que todavía no es 🚧' },
  { t: 165, n: 'Le pone fecha al relato 📅' },
  { t: 190, n: 'Cuenta el proyecto sin inflarlo 📣' },
]);

B.fcData = JSON.stringify([
  { w: 'El relato', a: '📣 La versión <strong>corta y verdadera</strong> de qué es esto, para quién, qué ha pasado ya y qué falta. No es publicidad ni es un currículum: es lo que otro repite cuando tú no estás delante.' },
  { w: 'Hecho comprobable', a: '🧾 Una afirmación que <strong>alguien más puede verificar</strong> sin creerte: un archivo, una fecha, una foto, un número que se puede contar. Lo que no se puede comprobar no es un hecho, es una opinión bien vestida.' },
  { w: 'La cifra con denominador', a: '📊 «Cuarenta» no dice nada: <strong>cuarenta de cuántos y en cuánto tiempo</strong> sí. Un número sin denominador ni fecha es la forma más educada de exagerar, porque no es mentira y engaña igual.' },
  { w: 'El futuro contado en presente', a: '⏭️ Decir «trabajamos con escuelas» cuando hay <strong>una y de prueba</strong>. Es la exageración más común y la más fácil de justificar por dentro, porque uno de verdad cree que va a pasar.' },
  { w: 'El adjetivo que tapa el dato', a: '🎈 «Innovador», «líder», «revolucionario». Cada adjetivo así ocupa el sitio de una cifra que no se quiso decir. <strong>Se quitan todos</strong> y se mira qué queda en pie.' },
  { w: 'El nosotros que agranda', a: '👥 «Nuestro equipo», «la organización», «el departamento de contenidos». Cuando son <strong>cuatro personas de una casa</strong>, decirlo así no protege nada y te obliga a sostener un tamaño que no tienes.' },
  { w: 'La prueba que se toca', a: '📦 Lo que se puede poner sobre la mesa: la ficha impresa, la aplicación abierta en un teléfono con datos escasos, el archivo con la fecha. <strong>Vale más que cualquier frase</strong> y no se puede discutir.' },
  { w: 'Lo que todavía no es', a: '🚧 La parte del relato que <strong>dices tú antes de que la descubran</strong>. Nombrar lo que falta no te quita fuerza: es lo único que hace creíble el resto.' },
  { w: 'El relato caduca', a: '📅 Un relato escrito hace un año <strong>miente sin querer</strong>. Por eso lleva fecha y fecha de revisión, como los datos: no porque haya cambiado la verdad, sino porque ha cambiado el proyecto.' },
  { w: 'Los tres largos', a: '📏 El mismo relato en <strong>una frase, en un minuto y en una página</strong>. Si la frase y la página no dicen lo mismo, una de las dos está inflada.' },
  { w: 'Un relato por público', a: '🎯 La maestra, la madre y quien pone dinero necesitan <strong>énfasis distintos</strong>, no verdades distintas. Cambia lo que se pone delante; no cambia ningún dato.' },
  { w: 'La exageración que nadie corrige', a: '🤐 Nadie te desmiente en la reunión: te desmiente <strong>el producto, meses después</strong>. Y para entonces el que se sintió engañado ya no discute contigo, simplemente no vuelve.' },
  { w: 'El préstamo contra la confianza', a: '💳 Inflar es <strong>pedir prestado</strong> contra la credibilidad que todavía no tienes. Se cobra entero el día que alguien abre lo que le prometiste, y con intereses.' },
  { w: 'La cifra que sí se enseña', a: '✅ Una pequeña y verdadera <strong>convence más</strong> que una grande y borrosa, porque se puede comprobar en el momento. «Una sección de sexto, veintidós estudiantes, marzo» abre puertas que «cientos de usuarios» cierra.' },
  { w: 'Fuente', a: '🔗 De dónde sale cada afirmación del relato. Sin fuente no se publica, ni en la revista ni en una reunión. <strong>El que afirma es el que enseña</strong>, no el que pregunta el que investiga.' },
  { w: 'El relato de una página', a: '📄 Qué es, para quién, qué ha pasado ya (con cifras y fecha), qué falta y qué se pide. <strong>Cinco piezas</strong>. Si no cabe en una página es que todavía no está entendido.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué es el relato de un proyecto?', o: ['a) El eslogan y los colores de la marca', 'b) La versión corta y verdadera que otro repite cuando tú no estás', 'c) La lista de todo lo que se ha hecho', 'd) La presentación para pedir dinero'], c: 1 },
  { q: '«Más de mil descargas» es un ejemplo de…', o: ['a) Una cifra con denominador', 'b) Un hecho comprobable', 'c) Un número sin denominador ni fecha', 'd) Una prueba que se toca'], c: 2 },
  { q: 'Decir «trabajamos con escuelas» cuando hay una y de prueba es…', o: ['a) El futuro contado en presente', 'b) Una forma correcta de resumir', 'c) Una cifra agregada', 'd) Una prueba social'], c: 0 },
  { q: '¿Qué se hace con los adjetivos tipo «innovador» o «líder»?', o: ['a) Se usan solo con quien pone dinero', 'b) Se quitan y se mira qué cifra queda en pie', 'c) Se acompañan de un logotipo', 'd) Se repiten para que se recuerden'], c: 1 },
  { q: '¿Por qué el relato lleva fecha?', o: ['a) Para saber quién lo escribió', 'b) Por costumbre de las presentaciones', 'c) Para poder cobrarlo después', 'd) Porque un relato viejo miente sin querer'], c: 3 },
  { q: 'Decir lo que el proyecto todavía no es…', o: ['a) Le quita fuerza al relato', 'b) Solo se hace si preguntan', 'c) Es lo que hace creíble el resto', 'd) Se deja para el final del trato'], c: 2 },
  { q: 'Ante tres públicos distintos, el relato cambia…', o: ['a) El énfasis, nunca los datos', 'b) Los datos, según lo que cada uno espera', 'c) Solo el idioma', 'd) Nada: se dice lo mismo palabra por palabra'], c: 0 },
  { q: '¿Qué convence más en una reunión?', o: ['a) Una cifra grande y aproximada', 'b) Una cifra pequeña, exacta y comprobable', 'c) Una promesa de crecimiento', 'd) La lista de todo lo que se piensa hacer'], c: 1 },
  { q: 'Inflar el relato se parece a…', o: ['a) Un descuento por volumen', 'b) Una inversión a largo plazo', 'c) Un préstamo contra la confianza, que se cobra entero', 'd) Un gasto fijo del proyecto'], c: 2 },
  { q: '¿Cuándo se sabe que una exageración salió cara?', o: ['a) Cuando alguien la desmiente en la reunión', 'b) Cuando abren el producto y no era lo que se dijo', 'c) Cuando la competencia la copia', 'd) Nunca se llega a saber'], c: 1 },
]);

B.classGroups = JSON.stringify([
  { label: ['Comprobable', 'Inflado'], headA: '🧾 Se puede comprobar', headB: '🎈 Está inflado', colA: 'ok', colB: 'no',
    words: [{ w: 'Veintidós de sexto lo completaron en marzo', t: 'ok' }, { w: 'Cientos de estudiantes lo usan', t: 'no' },
      { w: 'Diecisiete misiones publicadas', t: 'ok' }, { w: 'Una plataforma innovadora', t: 'no' },
      { w: 'Una escuela, en prueba, desde enero', t: 'ok' }, { w: 'Trabajamos con escuelas del país', t: 'no' },
      { w: 'La ficha tiene diez páginas, mide el PDF', t: 'ok' }, { w: 'Material de altísima calidad', t: 'no' }] },
  { label: ['Hecho', 'Opinión'], headA: '📌 Hecho', headB: '💭 Opinión', colA: 'ok', colB: 'no',
    words: [{ w: 'La aplicación abre sin internet', t: 'ok' }, { w: 'La aplicación es la mejor del mercado', t: 'no' },
      { w: 'La ficha se imprime en carta', t: 'ok' }, { w: 'Las fichas son las más completas', t: 'no' },
      { w: 'Nueve rutas declaradas, cuatro con dos etapas', t: 'ok' }, { w: 'El proyecto crece muy rápido', t: 'no' },
      { w: 'Cuatro personas lo construyen', t: 'ok' }, { w: 'Contamos con un equipo sólido', t: 'no' }] },
  { label: ['Lo dice uno', 'Que lo descubran'], headA: '🚧 Se dice antes', headB: '🙈 Se espera a que salga', colA: 'ok', colB: 'no',
    words: [{ w: 'Todavía no hay evaluación con maestros de fuera', t: 'ok' }, { w: 'Ocultar que la escuela es una y de prueba', t: 'no' },
      { w: 'La ruta tiene seis etapas y hay tres', t: 'ok' }, { w: 'Enseñar solo el mejor día del mes', t: 'no' },
      { w: 'Las notificaciones estuvieron rotas y se arreglaron', t: 'ok' }, { w: 'Dejar creer que el equipo es grande', t: 'no' },
      { w: 'El sitio todavía no está en el aula a diario', t: 'ok' }, { w: 'Llamar alianza a un patrocinio de una vez', t: 'no' }] },
  { label: ['Prueba', 'Frase'], headA: '📦 Prueba que se toca', headB: '🗣️ Solo una frase', colA: 'ok', colB: 'no',
    words: [{ w: 'La ficha impresa sobre la mesa', t: 'ok' }, { w: '«Nuestro material es excelente»', t: 'no' },
      { w: 'La aplicación abierta en un teléfono', t: 'ok' }, { w: '«Funciona en cualquier aparato»', t: 'no' },
      { w: 'El archivo con su fecha', t: 'ok' }, { w: '«Llevamos años en esto»', t: 'no' },
      { w: 'El collage de evidencias del aula', t: 'ok' }, { w: '«Los maestros están encantados»', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['El', 'relato', 'es', 'lo', 'que', 'otro', 'repite.'], c: 1, art: 'La versión corta y verdadera' },
  { s: ['Una', 'cifra', 'sin', 'denominador', 'engaña', 'sin', 'mentir.'], c: 3, art: 'De cuántos y en cuánto tiempo' },
  { s: ['El', 'adjetivo', 'ocupa', 'el', 'sitio', 'de', 'un', 'dato.'], c: 1, art: 'Lo que se quita para ver qué queda' },
  { s: ['La', 'prueba', 'se', 'pone', 'sobre', 'la', 'mesa.'], c: 1, art: 'Lo que se toca y no se discute' },
  { s: ['Decir', 'lo', 'que', 'falta', 'hace', 'creíble', 'el', 'resto.'], c: 3, art: 'Lo que uno dice antes de que lo descubran' },
  { s: ['Un', 'relato', 'sin', 'fecha', 'miente', 'sin', 'querer.'], c: 3, art: 'Lo que evita que el relato envejezca' },
  { s: ['Cada', 'afirmación', 'necesita', 'su', 'fuente.'], c: 4, art: 'De dónde sale lo que se afirma' },
  { s: ['Inflar', 'es', 'un', 'préstamo', 'contra', 'la', 'confianza.'], c: 3, art: 'Lo que se cobra entero después' },
]);

B.cmpData = JSON.stringify([
  { s: 'La versión corta y verdadera que otro repite es el ___.', opts: ['relato', 'anuncio', 'informe'], c: 0 },
  { s: 'Una cifra necesita su ___ y su fecha para significar algo.', opts: ['denominador', 'adjetivo', 'titular'], c: 0 },
  { s: 'Un adjetivo como «innovador» ocupa el sitio de un ___.', opts: ['dato', 'logo', 'permiso'], c: 0 },
  { s: 'Lo que se pone sobre la mesa y no se discute es la ___.', opts: ['prueba', 'promesa', 'oferta'], c: 0 },
  { s: 'Decir lo que todavía no es hace ___ el resto del relato.', opts: ['creíble', 'pequeño', 'difícil'], c: 0 },
  { s: 'Un relato sin ___ miente sin querer al cabo de un año.', opts: ['fecha', 'logo', 'precio'], c: 0 },
  { s: 'De dónde sale cada afirmación es su ___.', opts: ['fuente', 'formato', 'firma'], c: 0 },
  { s: 'Inflar el relato es un préstamo contra la ___.', opts: ['confianza', 'audiencia', 'promesa'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Comprobable', 'Inflado'], btnA: '🧾 Comprobable', btnB: '🎈 Inflado', colA: 'ok', colB: 'no',
    words: [{ w: '22 de sexto en marzo', t: 'ok' }, { w: 'Cientos de estudiantes', t: 'no' },
      { w: '17 misiones publicadas', t: 'ok' }, { w: 'Plataforma innovadora', t: 'no' },
      { w: 'Una escuela, en prueba', t: 'ok' }, { w: 'Trabajamos con escuelas', t: 'no' },
      { w: 'Diez páginas, medidas', t: 'ok' }, { w: 'Altísima calidad', t: 'no' },
      { w: 'Cuatro personas', t: 'ok' }, { w: 'Nuestro equipo', t: 'no' }] },
  { label: ['Hecho', 'Opinión'], btnA: '📌 Hecho', btnB: '💭 Opinión', colA: 'ok', colB: 'no',
    words: [{ w: 'Abre sin internet', t: 'ok' }, { w: 'Es la mejor del mercado', t: 'no' },
      { w: 'Se imprime en carta', t: 'ok' }, { w: 'Las más completas', t: 'no' },
      { w: 'Nueve rutas declaradas', t: 'ok' }, { w: 'Crece muy rápido', t: 'no' },
      { w: 'Cuatro personas la hacen', t: 'ok' }, { w: 'Equipo sólido', t: 'no' },
      { w: 'La ficha pesa 40 kilobytes', t: 'ok' }, { w: 'Es muy liviana', t: 'no' }] },
  { label: ['Prueba', 'Frase'], btnA: '📦 Prueba', btnB: '🗣️ Frase', colA: 'ok', colB: 'no',
    words: [{ w: 'La ficha impresa', t: 'ok' }, { w: '«Material excelente»', t: 'no' },
      { w: 'La aplicación abierta', t: 'ok' }, { w: '«Funciona en todo»', t: 'no' },
      { w: 'El archivo fechado', t: 'ok' }, { w: '«Llevamos años»', t: 'no' },
      { w: 'El collage del aula', t: 'ok' }, { w: '«Están encantados»', t: 'no' },
      { w: 'El PDF de diez hojas', t: 'ok' }, { w: '«Todo está medido»', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se escribe el relato de una página', steps: ['Escribir qué es esto en una frase, sin adjetivos', 'Decir para quién es, con el nombre del que lo usa', 'Poner lo que ya pasó, con cifra, denominador y fecha', 'Añadir con qué se prueba cada cosa', 'Nombrar lo que todavía no es', 'Terminar con lo que se pide, concreto', 'Ponerle fecha y fecha de revisión'] },
  { label: 'Cómo se limpia un relato inflado', steps: ['Tachar todos los adjetivos y ver qué queda', 'Buscar cada cifra y preguntarle de cuántos y cuándo', 'Cambiar a pasado lo que se contó en presente sin serlo', 'Sustituir el nosotros grande por el número real', 'Añadir la prueba de lo que quedó en pie'] },
  { label: 'Qué se hace cuando el relato se quedó viejo', steps: ['Leerlo entero como si fuera de otro', 'Marcar lo que ya no es cierto', 'Corregirlo con lo que sí pasó, con su fecha', 'Avisar a quien se lo creyó, si le afecta', 'Apuntar la fecha de la próxima revisión'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'La versión corta y verdadera que otro repite', ans: 'El relato', opts: ['El relato', 'La promesa', 'La oferta', 'La prueba'] },
  { desc: 'Una afirmación que otro puede verificar sin creerte', ans: 'Hecho comprobable', opts: ['Hecho comprobable', 'Opinión', 'Adjetivo', 'Petición'] },
  { desc: 'De cuántos y en cuánto tiempo', ans: 'El denominador', opts: ['El denominador', 'La fuente', 'La prueba', 'El público'] },
  { desc: 'Decir «trabajamos con escuelas» cuando hay una y de prueba', ans: 'Futuro contado en presente', opts: ['Futuro contado en presente', 'Cifra sin denominador', 'Adjetivo que tapa el dato', 'Nosotros que agranda'] },
  { desc: 'La palabra que ocupa el sitio de una cifra que no se quiso decir', ans: 'Adjetivo que tapa el dato', opts: ['Adjetivo que tapa el dato', 'Fuente', 'Prueba', 'Denominador'] },
  { desc: 'Lo que se pone sobre la mesa y no se puede discutir', ans: 'La prueba que se toca', opts: ['La prueba que se toca', 'El relato', 'La promesa', 'La opinión'] },
  { desc: 'La parte que dices tú antes de que la descubran', ans: 'Lo que todavía no es', opts: ['Lo que todavía no es', 'La petición', 'La fuente', 'El denominador'] },
  { desc: 'Lo que hace que un relato viejo mienta sin querer', ans: 'La falta de fecha', opts: ['La falta de fecha', 'La falta de prueba', 'El exceso de cifras', 'El público equivocado'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: '«Cientos de estudiantes usan nuestras misiones»', func: '«Veintidós de sexto completaron una misión en marzo»', opts: ['«Veintidós de sexto completaron una misión en marzo»', '«Muchos estudiantes ya nos conocen»', '«Nuestro alcance crece cada mes»', '«Somos la opción preferida en el aula»'] },
  { trans: '«Trabajamos con escuelas del país»', func: '«Una escuela, en prueba, desde enero, y buscamos la segunda»', opts: ['«Una escuela, en prueba, desde enero, y buscamos la segunda»', '«Tenemos presencia en el sistema educativo»', '«Varias escuelas nos han contactado»', '«Estamos en expansión en la zona»'] },
  { trans: '«Somos una plataforma educativa innovadora»', func: '«Misiones interactivas y fichas imprimibles para primaria»', opts: ['«Misiones interactivas y fichas imprimibles para primaria»', '«Somos referentes en educación digital»', '«Ofrecemos soluciones de vanguardia»', '«Transformamos la manera de aprender»'] },
  { trans: '«Nuestro equipo de contenidos»', func: '«Lo hacemos cuatro personas de una casa»', opts: ['«Lo hacemos cuatro personas de una casa»', '«Contamos con especialistas dedicados»', '«Nuestra organización lo respalda»', '«El departamento se encarga de eso»'] },
  { trans: '«El material está probado en el aula»', func: '«Se usó en una sección de sexto; falta probarlo con maestros de fuera»', opts: ['«Se usó en una sección de sexto; falta probarlo con maestros de fuera»', '«Los maestros lo recomiendan mucho»', '«Ha tenido excelente recepción»', '«Está validado pedagógicamente»'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: '«Más de mil descargas» y nadie pregunta de cuántos ni cuándo', characteristic: 'Cifra sin denominador ni fecha', opts: ['Cifra sin denominador ni fecha', 'Futuro contado en presente', 'Adjetivo que tapa el dato', 'Nosotros que agranda'] },
  { disease: '«Trabajamos con escuelas» cuando hay una y de prueba', characteristic: 'Futuro contado en presente', opts: ['Futuro contado en presente', 'Cifra sin denominador', 'Falta de prueba', 'Relato caducado'] },
  { disease: '«Una plataforma innovadora y líder en su categoría»', characteristic: 'Adjetivos que ocupan el sitio de las cifras', opts: ['Adjetivos que ocupan el sitio de las cifras', 'Cifra sin denominador', 'Nosotros que agranda', 'Falta de fuente'] },
  { disease: '«Nuestro equipo de contenidos» cuando son cuatro de una casa', characteristic: 'El nosotros que agranda el tamaño real', opts: ['El nosotros que agranda el tamaño real', 'Futuro en presente', 'Adjetivo que tapa el dato', 'Cifra sin fecha'] },
  { disease: 'El texto de presentación describe un proyecto que ya no existe', characteristic: 'El relato se quedó viejo y nadie le puso fecha', opts: ['El relato se quedó viejo y nadie le puso fecha', 'Faltaban adjetivos', 'La audiencia era la equivocada', 'El canal no era el correcto'] },
  { disease: 'Se afirmó que la ficha tenía diez páginas y el PDF tenía diecinueve', characteristic: 'Se afirmó sin comprobar contra la fuente', opts: ['Se afirmó sin comprobar contra la fuente', 'La ficha estaba mal hecha', 'El formato era el equivocado', 'Faltaba revisar la ortografía'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'La versión corta y verdadera que otro repite.', type: 'El relato' },
  { s: 'Una afirmación que otro puede verificar sin creerte.', type: 'Hecho comprobable' },
  { s: 'De cuántos y en cuánto tiempo.', type: 'El denominador' },
  { s: 'Decir en presente algo que todavía no ocurrió.', type: 'Futuro contado en presente' },
  { s: 'La palabra que ocupa el sitio de una cifra.', type: 'Adjetivo que tapa el dato' },
  { s: 'Lo que se pone sobre la mesa y no se discute.', type: 'La prueba que se toca' },
  { s: 'La parte que dices tú antes de que la descubran.', type: 'Lo que todavía no es' },
  { s: 'De dónde sale cada afirmación.', type: 'La fuente' },
  { s: 'Lo que hace que un relato viejo mienta sin querer.', type: 'La falta de fecha' },
  { s: 'Las cinco piezas en una sola hoja.', type: 'El relato de una página' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: '22 de sexto en marzo', gen: 'Cifra', n: 'Con denominador', g: 'Comprobable', t: 'Se puede contar' },
  { w: 'Cientos de estudiantes', gen: 'Cifra', n: 'Sin denominador', g: 'Inflado', t: 'No se puede comprobar' },
  { w: 'La aplicación abre sin internet', gen: 'Afirmación', n: 'Hecho', g: 'Comprobable', t: 'Se prueba abriéndola' },
  { w: 'Es la mejor del mercado', gen: 'Afirmación', n: 'Opinión', g: 'Inflado', t: 'Nadie la puede verificar' },
  { w: 'Una escuela, en prueba', gen: 'Alcance', n: 'Real', g: 'Comprobable', t: 'Se puede nombrar' },
  { w: 'Trabajamos con escuelas', gen: 'Alcance', n: 'Futuro en presente', g: 'Inflado', t: 'Todavía no ocurrió' },
  { w: 'La ficha impresa sobre la mesa', gen: 'Apoyo', n: 'Prueba', g: 'Se toca', t: 'No admite discusión' },
  { w: 'Material de altísima calidad', gen: 'Apoyo', n: 'Adjetivo', g: 'Solo una frase', t: 'Ocupa el sitio de un dato' },
  { w: 'Falta probarlo con maestros de fuera', gen: 'Límite', n: 'Dicho por uno', g: 'Da credibilidad', t: 'Se dice antes de que salga' },
  { w: 'Nuestro equipo de contenidos', gen: 'Tamaño', n: 'Agrandado', g: 'Inflado', t: 'Obliga a sostener lo que no hay' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La versión corta y verdadera que otro repite es el ___.', opts: ['relato', 'anuncio', 'resumen'], ans: 'relato' },
  { s: 'Una cifra sin ___ engaña sin mentir.', opts: ['denominador', 'titular', 'color'], ans: 'denominador' },
  { s: 'Los adjetivos ocupan el sitio de los ___.', opts: ['datos', 'logos', 'precios'], ans: 'datos' },
  { s: 'Lo que se pone sobre la mesa es la ___.', opts: ['prueba', 'promesa', 'oferta'], ans: 'prueba' },
  { s: 'Decir lo que falta hace ___ el resto.', opts: ['creíble', 'corto', 'barato'], ans: 'creíble' },
  { s: 'Un relato sin ___ envejece y miente solo.', opts: ['fecha', 'logo', 'firma'], ans: 'fecha' },
  { s: 'De dónde sale una afirmación es su ___.', opts: ['fuente', 'formato', 'función'], ans: 'fuente' },
  { s: 'Inflar es un préstamo contra la ___.', opts: ['confianza', 'audiencia', 'promesa'], ans: 'confianza' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica qué es el relato de un proyecto y en qué se diferencia de la publicidad.', ans: 'El relato es la versión corta y verdadera de qué es esto, para quién, qué ha pasado ya y qué falta: lo que otra persona repite cuando tú no estás delante. La publicidad la controlas tú y se paga; el relato lo repite otro y por eso no puede llevar nada que no aguante una comprobación. La diferencia práctica es qué pasa cuando alguien abre el producto: si el relato era cierto, lo que encuentra confirma lo que le contaron y la confianza sube; si estaba inflado, lo que encuentra lo desmiente, y entonces no discute contigo, simplemente no vuelve. Por eso el relato se escribe con hechos comprobables y cifras con denominador, no con adjetivos.' },
  { q: '¿Qué es una cifra con denominador y por qué una cifra pequeña convence más que una grande?', ans: 'Una cifra con denominador dice de cuántos y en cuánto tiempo: no «cuarenta», sino «cuarenta de una sección de cuarenta y dos, en marzo». Sin eso, el número no significa nada y además es la forma más educada de exagerar, porque no llega a ser mentira y engaña igual. Una cifra pequeña y exacta convence más que una grande y borrosa porque se puede comprobar en el momento y porque enseña que quien la dice sabe contar lo suyo. «Veintidós estudiantes de sexto, en marzo» abre una conversación que «cientos de usuarios» cierra, porque lo segundo obliga a la otra persona a decidir si te cree, y casi nadie quiere quedar en esa posición.' },
  { q: 'Nombra las cuatro formas de inflar un relato y da un ejemplo de cada una.', ans: 'Primera, la cifra sin denominador ni fecha: «más de mil descargas», sin decir de cuántos ni cuándo. Segunda, el futuro contado en presente: «trabajamos con escuelas» cuando hay una y de prueba; es la más común y la más fácil de justificarse por dentro, porque uno cree de verdad que va a pasar. Tercera, el adjetivo que tapa el dato: «innovador», «líder», «revolucionario», cada uno ocupando el sitio de una cifra que no se quiso decir. Cuarta, el nosotros que agranda: «nuestro equipo de contenidos» cuando son cuatro personas de una casa, que además obliga después a sostener un tamaño que no se tiene. Las cuatro se corrigen igual: quitar y sustituir por lo que sí se puede comprobar.' },
  { q: '¿Por qué decir lo que el proyecto todavía no es hace más creíble el resto del relato?', ans: 'Porque quien escucha está calculando, sin decirlo, cuánto hay que descontar de lo que le cuentan. Si el relato nombra sus propios límites, ese descuento desaparece: ya no hace falta buscar lo que se está callando, porque se dijo primero. Además cambia quién controla el momento: los límites de un proyecto se descubren siempre, y no es lo mismo que los diga uno con calma a que los encuentre la otra persona sola y en mal momento. En M.E.T.A.S eso significa decir que la ruta tiene seis etapas y hay tres construidas, que la escuela es una y de prueba, y que falta probar el material con maestros de fuera de la casa. Ninguna de las tres cosas resta: todas hacen que el resto se pueda creer.' },
  { q: 'Explica por qué un relato lleva fecha, con el caso del texto de presentación de este proyecto.', ans: 'Un relato escrito hace un año miente sin querer, no porque haya cambiado la verdad sino porque ha cambiado el proyecto. El README de este repositorio es el ejemplo de la casa: sigue presentando una colección de actividades de gramática y enlazando el sitio público, cuando lo que hay hoy es una aplicación privada de la familia con diecisiete misiones, nueve rutas, la Bóveda, el chat y las finanzas. Nadie mintió: el texto se quedó quieto mientras lo demás se movía. Por eso el relato lleva fecha y fecha de revisión, igual que un dato lleva plazo de borrado, y por eso revisarlo es una tarea con día en el calendario y no algo que se hace «cuando haga falta», que nunca llega.' },
  { q: 'Un patrocinador ofrece 8.000 lempiras y pide que se le llame «alianza estratégica». ¿Qué se contesta y con qué condición?', ans: 'Mete dinero que sirve, y en un proyecto de casa 8.000 lempiras cubren impresión y hospedaje un buen tiempo. Saca algo que no se ve en el momento: la palabra «alianza» describe una relación que no existe, y quien la lea va a suponer un compromiso mutuo, una continuidad y un respaldo que nadie ha firmado. El día que alguien pregunte en qué consiste la alianza, no hay respuesta, y el que queda mal no es el patrocinador. La condición con la que sí: se acepta el dinero y se le llama por su nombre, «patrocinio de la edición de marzo», con el logotipo en el sitio acordado y la fecha. Si el patrocinador necesita la palabra alianza para que le sirva, entonces lo que quiere no es patrocinar: es figurar, y eso se negocia aparte.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['RELATO', 'HECHO', 'CIFRA', 'FUENTE', 'PRUEBA', 'FECHA']),
  haceSopa(10, ['INFLAR', 'ADJETIVO', 'PRESENTE', 'TAMANO', 'FALTA', 'DATO']),
  haceSopa(10, ['CONFIANZA', 'PUBLICO', 'MEDIDA', 'PAGINA', 'CORTO', 'VERDAD']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'El relato es lo que otra persona repite cuando tú no estás delante.', a: true },
  { q: 'Una cifra sin denominador ni fecha ya dice algo útil.', a: false },
  { q: '«Trabajamos con escuelas» con una escuela de prueba es futuro contado en presente.', a: true },
  { q: 'Los adjetivos como «innovador» suplen bien la falta de cifras.', a: false },
  { q: 'Una cifra pequeña y exacta convence más que una grande y borrosa.', a: true },
  { q: 'Decir lo que el proyecto todavía no es le quita fuerza al relato.', a: false },
  { q: 'El relato cambia el énfasis según el público, pero no cambia los datos.', a: true },
  { q: 'Un relato sin fecha puede volverse falso sin que nadie lo toque.', a: true },
  { q: 'Llamar «nuestro equipo» a cuatro personas de una casa no tiene consecuencias.', a: false },
  { q: 'La prueba que se puede tocar vale más que la frase que la describe.', a: true },
  { q: 'Inflar el relato se cobra el día que alguien abre el producto.', a: true },
  { q: 'Quien afirma algo es quien tiene que enseñar la fuente.', a: true },
  { q: 'Si nadie desmiente una exageración en la reunión, es que no hubo daño.', a: false },
  { q: 'El relato de una página tiene cinco piezas: qué es, para quién, qué pasó, qué falta y qué se pide.', a: true },
  { q: 'La misma verdad se puede contar en una frase, en un minuto y en una página.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: 'El relato de un proyecto es…', o: ['a) El eslogan y la identidad visual', 'b) La versión corta y verdadera que otro repite', 'c) La lista completa de logros', 'd) La presentación para pedir dinero'], a: 1 },
  { q: '«Más de mil descargas» falla porque…', o: ['a) Es un número muy pequeño', 'b) No lleva denominador ni fecha', 'c) No menciona la audiencia', 'd) Se dice en presente'], a: 1 },
  { q: 'El futuro contado en presente es…', o: ['a) Prometer una función que se va a construir', 'b) Hablar de planes a cinco años', 'c) Decir «trabajamos con escuelas» con una y de prueba', 'd) Usar verbos en futuro'], a: 2 },
  { q: 'Ante un adjetivo como «líder», lo que se hace es…', o: ['a) Quitarlo y ver qué cifra queda en pie', 'b) Acompañarlo de un logotipo', 'c) Repetirlo para que se fije', 'd) Reservarlo para quien pone dinero'], a: 0 },
  { q: 'El «nosotros que agranda» es un problema porque…', o: ['a) Suena poco profesional', 'b) Confunde a la audiencia sobre el precio', 'c) Es más largo de escribir', 'd) Obliga a sostener un tamaño que no se tiene'], a: 3 },
  { q: 'La prueba que se toca es…', o: ['a) La ficha impresa o la aplicación abierta en el teléfono', 'b) Una frase bien escrita sobre la calidad', 'c) El testimonio de un conocido', 'd) El número de seguidores'], a: 0 },
  { q: 'Decir lo que el proyecto todavía no es sirve para…', o: ['a) Bajar las expectativas de precio', 'b) Que el resto del relato se pueda creer', 'c) Cumplir un requisito formal', 'd) Ganar tiempo antes de decidir'], a: 1 },
  { q: 'Cuando el relato se cuenta a tres públicos distintos, cambia…', o: ['a) El énfasis y el largo, nunca los datos', 'b) Los datos, según lo que cada uno espera', 'c) El nombre del proyecto', 'd) Nada en absoluto'], a: 0 },
  { q: 'Un relato lleva fecha porque…', o: ['a) Lo exige el formato', 'b) Sirve para cobrar', 'c) El proyecto cambia y el texto no', 'd) Ayuda a la memoria del autor'], a: 2 },
  { q: 'La consecuencia real de inflar es…', o: ['a) Que alguien te desmienta en la reunión', 'b) Que la competencia lo copie', 'c) Que suba el precio esperado', 'd) Que quien abra el producto no vuelva'], a: 3 },
  { q: 'Ante «¿cuántas escuelas lo usan?», la mejor respuesta es…', o: ['a) «Varias, y creciendo»', 'b) «Una, en prueba desde enero, y buscamos la segunda»', 'c) «No damos ese dato»', 'd) «Las suficientes para sostenernos»'], a: 1 },
  { q: 'La fuente de una afirmación…', o: ['a) La pide quien duda', 'b) Solo hace falta en textos técnicos', 'c) La enseña quien afirma', 'd) Se puede omitir si hay confianza'], a: 2 },
  { q: 'El relato de una página se compone de…', o: ['a) Portada, índice y anexos', 'b) Historia, misión, visión y valores', 'c) Problema, solución y precio', 'd) Qué es, para quién, qué pasó, qué falta y qué se pide'], a: 3 },
  { q: 'Un patrocinio de una edición que se anuncia como «alianza estratégica»…', o: ['a) Describe una relación que no existe', 'b) Es la forma habitual de nombrarlo', 'c) Beneficia por igual a los dos', 'd) Solo importa si hay contrato'], a: 0 },
  { q: 'La prueba de que esta etapa está aprendida es…', o: ['a) Tener un eslogan memorable', 'b) Poder decir el proyecto en una frase, un minuto y una página, sin cambiar un dato', 'c) Haber publicado en varios canales', 'd) Saberse las cifras de memoria'], a: 1 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La versión corta y verdadera que otro repite es el ___.', a: 'relato' },
  { q: 'Una cifra necesita su ___ para significar algo.', a: 'denominador' },
  { q: 'Decir en presente lo que todavía no ocurrió es contar el ___ en presente.', a: 'futuro' },
  { q: 'La palabra que ocupa el sitio de una cifra es un ___.', a: 'adjetivo' },
  { q: 'Lo que se pone sobre la mesa y no se discute es la ___.', a: 'prueba' },
  { q: 'Nombrar lo que todavía no es hace ___ el resto del relato.', a: 'creíble' },
  { q: 'De dónde sale una afirmación es su ___.', a: 'fuente' },
  { q: 'Un relato sin ___ envejece y miente solo.', a: 'fecha' },
  { q: 'Inflar el relato es un préstamo contra la ___.', a: 'confianza' },
  { q: 'Ante tres públicos cambia el énfasis, nunca los ___.', a: 'datos' },
  { q: 'El relato cabe en una ___ con cinco piezas.', a: 'página' },
  { q: 'Llamar «nuestro equipo» a cuatro personas es el nosotros que ___.', a: 'agranda' },
  { q: 'Una cifra pequeña y exacta convence más que una grande y ___.', a: 'borrosa' },
  { q: 'El mismo relato se cuenta en una frase, en un minuto y en una ___.', a: 'página' },
  { q: 'Lo que desmiente una exageración no es la reunión: es el ___.', a: 'producto' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'El relato', def: 'La versión corta que otro repite' },
  { term: 'Hecho comprobable', def: 'Se puede verificar sin creerte' },
  { term: 'Denominador', def: 'De cuántos y en cuánto tiempo' },
  { term: 'Futuro en presente', def: 'Contar como hecho lo que falta' },
  { term: 'Adjetivo que tapa', def: 'Ocupa el sitio de una cifra' },
  { term: 'Nosotros que agranda', def: 'Un tamaño que no se tiene' },
  { term: 'La prueba que se toca', def: 'La ficha o la aplicación abierta' },
  { term: 'Lo que todavía no es', def: 'El límite dicho por uno mismo' },
  { term: 'Fuente', def: 'La enseña quien afirma' },
  { term: 'El relato caduca', def: 'Lleva fecha y fecha de revisión' },
  { term: 'Los tres largos', def: 'Frase, minuto y página' },
  { term: 'Un relato por público', def: 'Cambia el énfasis, no los datos' },
  { term: 'Préstamo contra la confianza', def: 'Se cobra al abrir el producto' },
  { term: 'Cifra que sí se enseña', def: 'Pequeña, exacta y comprobable' },
  { term: 'El relato de una página', def: 'Qué es, para quién, qué pasó, qué falta, qué se pide' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'El texto de presentación del repositorio sigue describiendo una colección de actividades de gramática y enlaza el sitio público, cuando hoy F.A.R.O es la aplicación privada de la familia con diecisiete misiones y nueve rutas.' },
  { txt: 'Las tarjetas de las misiones familiares pintan un candado y dicen «material de la casa», mientras el repositorio se lee entero desde internet.' },
  { txt: 'Se afirmó que la ficha tenía diez páginas. Al llevarla a PDF tenía diecinueve, y nadie lo había comprobado antes de decirlo.' },
  { txt: 'En una reunión preguntan cuántas escuelas usan las misiones. Hay una, en prueba, desde enero, y la tentación es contestar «varias».' },
  { txt: 'Un patrocinador local ofrece 8.000 lempiras para imprimir fichas y pide que en la portada y en el sitio se le nombre «alianza estratégica».' },
  { txt: 'El resumen semanal de la Antena trae el mejor día del mes muy por encima del resto, y se plantea enseñar ese dato solo, sin el promedio.' },
  { txt: 'La revista PolicastSapien va a publicar un reportaje investigativo con una cifra que llegó por un mensaje reenviado, sin fuente que la respalde.' },
  { txt: 'Una maestra pregunta si el material está probado en el aula. Se usó en una sección de sexto y nunca lo ha revisado un maestro de fuera de la casa.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué se está afirmando exactamente, y qué parte de eso se puede comprobar hoy?',
  '2. ¿Cuál de las cuatro formas de inflar aparece aquí, y cómo se corrige?',
  '3. Escribe en 3-4 frases lo que dirías tú, con cifra, denominador y fecha.',
  '4. ¿Qué se pierde el día que alguien abra el producto y no sea lo que se contó?',
]);

B.critCaseGuides = JSON.stringify([
  'Separar la afirmación de lo comprobable: casi siempre hay un hecho verdadero pequeño debajo de la frase grande. Ese hecho es el que se dice.',
  'Cifra sin denominador, futuro contado en presente, adjetivo que tapa el dato o nosotros que agranda. Se corrigen quitando y sustituyendo por lo que sí se puede enseñar.',
  'La respuesta buena casi nunca es más larga: es más concreta. Y suele incluir lo que todavía no es, porque eso es lo que hace creíble lo demás.',
  'Nunca se pierde en el momento. Se pierde después, y no en forma de discusión: en forma de una persona que ya no vuelve y que además lo cuenta.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Pon que trabajamos con escuelas, total en unos meses va a ser cierto".', g1: 'Es el futuro contado en presente, la forma más común de inflar y la más fácil de justificarse por dentro. Quien lo lea va a decidir cosas hoy con un dato que todavía no existe.', g2: 'Se dice lo que hay con su fecha: una escuela, en prueba, desde enero. Y se añade lo que se busca, que además convierte el relato en una petición concreta.' },
  { txt: '"Mil descargas suena bien, no hace falta decir de cuánto tiempo".', g1: 'Una cifra sin denominador ni fecha no es mentira y engaña igual, que es justo lo que la hace peligrosa: no se puede defender ni se puede desmentir.', g2: 'Se pone el denominador y el plazo, aunque el número quede más pequeño. Una cifra chica y exacta abre conversaciones que una grande y borrosa cierra.' },
  { txt: '"Le ponemos innovador y de calidad, que queda mejor que la lista de lo que hace".', g1: 'Cada adjetivo así ocupa el sitio de una cifra que no se quiso decir, y quien escucha lo sabe: por eso los descuenta automáticamente.', g2: 'Se tachan todos los adjetivos y se mira qué queda en pie. Lo que quede es el relato; lo demás era relleno.' },
  { txt: '"Mejor decir nuestro equipo, así no parece cosa de una familia".', g1: 'El nosotros que agranda obliga a sostener después un tamaño que no se tiene, y la primera pregunta concreta lo derrumba.', g2: 'Cuatro personas de una casa no es una debilidad del relato: es lo que explica el precio, la cercanía y por qué las fichas se prueban en la mesa del comedor.' },
  { txt: '"El texto de presentación lleva un año igual, pero nadie se queja".', g1: 'Un relato viejo miente sin que nadie lo toque. Que nadie se queje no significa que nadie se lo esté creyendo.', g2: 'Se lee entero como si fuera de otro, se marca lo que ya no es cierto, se corrige con la fecha de hoy y se apunta la fecha de la próxima revisión.' },
  { txt: '"Enseñamos el mejor día del mes, que es un dato real".', g1: 'Es real y es una exageración: elegir el mejor punto y presentarlo como lo normal es inflar sin escribir una sola cifra falsa.', g2: 'Se enseña el promedio y, si el pico interesa, se dice que fue un pico y qué lo causó. Eso además es más útil, porque explica algo.' },
]);

B.critDecisionBank = JSON.stringify([
  'El texto de presentación del proyecto quedó viejo: ¿qué se corrige primero y qué se le pone para que no vuelva a pasar?',
  'El candado dice «material de la casa» y el repositorio se lee desde internet: ¿qué se cambia, el candado o el repositorio?',
  'Se afirmó que la ficha tenía diez páginas y tenía diecinueve: ¿qué regla nace de ahí y cómo se comprueba de ahora en adelante?',
  'Preguntan cuántas escuelas usan las misiones y hay una, en prueba: ¿qué contestas, con qué cifra y con qué fecha?',
  'Un patrocinador de 8.000 lempiras quiere que se le llame «alianza estratégica»: ¿qué se acepta y con qué condición?',
  'El resumen semanal trae un pico muy por encima del promedio: ¿qué dato se enseña y cómo se explica?',
  'La revista va a publicar una cifra que llegó por un mensaje reenviado: ¿se publica, se busca fuente o se quita?',
  'Una maestra pregunta si el material está probado en el aula: ¿qué se dice de lo que hay y de lo que falta?',
]);

B.critDecisionGuide = `'La decisión correcta en esta etapa sigue siempre el mismo orden: primero se separa el hecho comprobable de la frase grande que lo envuelve, porque debajo de casi toda exageración hay una verdad pequeña que sirve; después se le pone denominador y fecha a cada cifra, aunque el número quede menor; después se nombra lo que todavía no es, que es lo que hace creíble el resto; y al final se decide qué prueba se pone sobre la mesa, porque una ficha impresa o la aplicación abierta valen más que cualquier frase. Si la respuesta no se puede comprobar delante de quien pregunta, todavía no es el relato: es publicidad.'`;

B.critCompareBank = JSON.stringify([
  { a: '«Una escuela, en prueba desde enero, y buscamos la segunda».', b: '«Trabajamos con escuelas del país».', ga: 'Caso A: se puede comprobar, se puede nombrar, y encima convierte el relato en una petición concreta.', gb: 'Caso B: quien lo lea decide hoy con un dato que no existe, y la primera pregunta concreta lo derrumba.' },
  { a: '«Veintidós de sexto completaron la misión en marzo».', b: '«Cientos de estudiantes usan nuestras misiones».', ga: 'Caso A: cifra pequeña con denominador y fecha, verificable en el momento, y enseña que quien la dice sabe contar lo suyo.', gb: 'Caso B: obliga a la otra persona a decidir si te cree, y casi nadie quiere quedar en esa posición.' },
  { a: 'Poner la ficha impresa y el teléfono con la aplicación sobre la mesa.', b: 'Explicar con detalle lo buena que es la ficha.', ga: 'Caso A: la prueba se toca y no admite discusión; además deja a la otra persona sacando sus propias conclusiones.', gb: 'Caso B: cuanto mejor se describe, más descuenta quien escucha, porque describir bien no cuesta nada.' },
  { a: 'Llamarlo «patrocinio de la edición de marzo», con su fecha.', b: 'Llamarlo «alianza estratégica».', ga: 'Caso A: describe lo que de verdad pasó, y el patrocinador queda igual de visible sin que nadie tenga que sostener nada.', gb: 'Caso B: describe una relación que no existe, y el día que alguien pregunte en qué consiste, el que queda mal no es el patrocinador.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se cuenta en presente algo que todavía no ocurrió.', guide: 'Quien escucha toma decisiones hoy con un dato que no existe, y la primera pregunta concreta derrumba el resto del relato con él.' },
  { cause: 'Se da una cifra sin denominador ni fecha.', guide: 'El número no se puede defender ni desmentir, así que no convence a quien sabe y desactiva a quien no. No es mentira y engaña igual.' },
  { cause: 'Se llenan los huecos con adjetivos.', guide: 'Cada adjetivo ocupa el sitio de una cifra que no se quiso decir, y quien escucha los descuenta automáticamente: el relato queda más débil que si no se hubiera dicho nada.' },
  { cause: 'El relato no lleva fecha ni se revisa.', guide: 'Se vuelve falso sin que nadie lo toque, porque el proyecto se mueve y el texto no. Y como nadie se queja, nadie se entera.' },
  { cause: 'Se enseña el mejor dato y se calla el promedio.', guide: 'Es exagerar sin escribir una sola cifra falsa, y es lo más difícil de defender después, porque la otra persona ya no sabe qué más se eligió a dedo.' },
  { cause: 'Se afirma algo sin comprobarlo contra la fuente.', guide: 'Basta una vez para que todo lo demás pase a revisión. Y la fuente casi siempre estaba a un minuto de distancia.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La maestra volvió a la semana siguiente y trajo a otra.', guide: 'Lo que encontró al abrir el material confirmaba lo que le habían contado. Ese es todo el mecanismo de la confianza.' },
  { effect: 'Una cifra pequeña abrió una reunión que una grande habría cerrado.', guide: 'Se pudo comprobar en el momento, y quien la escuchó no tuvo que decidir si creía o no: pudo verlo.' },
  { effect: 'Nadie preguntó dos veces por el tamaño del proyecto.', guide: 'Se dijo desde el principio que lo hacen cuatro personas de una casa, así que no quedó nada que descubrir.' },
  { effect: 'El texto de presentación siguió siendo cierto un año después.', guide: 'Llevaba fecha y fecha de revisión, y esa revisión se hizo el día que tocaba, no cuando hizo falta.' },
  { effect: 'El patrocinador quedó visible y nadie tuvo que explicar nada.', guide: 'Se le llamó por su nombre, patrocinio de una edición concreta, y con eso no hubo relación que sostener después.' },
  { effect: 'Una afirmación dudosa no llegó a publicarse en la revista.', guide: 'Se pidió la fuente antes de imprimir, y como no apareció, se quitó. Costó un párrafo y salvó el reportaje entero.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '📣', label: 'Qué es esto', text: 'Una <strong>frase sin adjetivos</strong> que diga qué es. <strong>Decide:</strong> si la otra persona sigue escuchando. <strong>Se rompe:</strong> con «plataforma innovadora». <strong>En M.E.T.A.S:</strong> misiones interactivas y fichas imprimibles para primaria.' },
  { y: '2', icon: '🎯', label: 'Para quién', text: 'La <strong>audiencia concreta</strong> de la etapa 1, con el nombre de quien lo usa. <strong>Decide:</strong> qué se cuenta después. <strong>Se rompe:</strong> con «para todo el mundo». <strong>En M.E.T.A.S:</strong> la maestra de primaria y la madre que solo tiene el teléfono.' },
  { y: '3', icon: '📊', label: 'Qué ya pasó', text: 'Las <strong>cifras con denominador y fecha</strong>. <strong>Decide:</strong> si te creen. <strong>Se rompe:</strong> con «cientos» y «más de mil». <strong>En M.E.T.A.S:</strong> diecisiete misiones, nueve rutas, una escuela en prueba desde enero.' },
  { y: '4', icon: '🧾', label: 'Con qué se prueba', text: 'La <strong>evidencia que se toca</strong>: un archivo, una fecha, una ficha impresa. <strong>Decide:</strong> si hace falta creerte. <strong>Se rompe:</strong> al describir en vez de enseñar. <strong>En M.E.T.A.S:</strong> la ficha en la mano y la aplicación abierta en el teléfono.' },
  { y: '5', icon: '🚧', label: 'Qué todavía no es', text: 'El <strong>límite dicho por uno mismo</strong>, antes de que lo descubran. <strong>Decide:</strong> cuánto descuenta quien escucha. <strong>Se rompe:</strong> al esperar a que pregunten. <strong>En M.E.T.A.S:</strong> falta probarlo con maestros de fuera de la casa.' },
  { y: '6', icon: '🙋', label: 'Qué se pide', text: 'La <strong>petición concreta</strong>, en una línea. <strong>Decide:</strong> qué pasa después de la reunión. <strong>Se rompe:</strong> con «cualquier apoyo es bienvenido». <strong>En M.E.T.A.S:</strong> una segunda escuela que quiera probar un mes.' },
  { y: '7', icon: '📅', label: 'Cuándo caduca', text: 'La <strong>fecha del relato y la de su revisión</strong>. <strong>Decide:</strong> que no mienta solo. <strong>Se rompe:</strong> al no ponerla nunca. <strong>En M.E.T.A.S:</strong> el texto de presentación del repositorio, que se quedó en el proyecto anterior.' },
]);

B.parteData = JSON.stringify({
  hecho: {
    nombre: 'El hecho comprobable', icon: '🧾',
    estructura: { title: 'Qué es', info: '• Una afirmación que <strong>otro puede verificar sin creerte</strong><br>• Un archivo, una fecha, una foto, algo que se cuenta<br>• Lo que no se puede comprobar es opinión bien vestida' },
    funcion: { title: 'Cómo se escribe', info: '• Se tachan los adjetivos y se mira qué queda en pie<br>• Lo que queda se acompaña de <strong>su fuente</strong><br>• Si no hay fuente, no entra en el relato' },
    enfermedades: { title: 'Dónde se infla', info: '• Con «innovador», «líder» y «de altísima calidad»<br>• Al describir la prueba en vez de enseñarla<br>• Al afirmar sin comprobar: la ficha que decía diez páginas y tenía diecinueve' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Hechos que aguantan: <strong>abre sin internet</strong>, la ficha se imprime en carta, diecisiete misiones publicadas<br>• Y la regla que salió del error: <strong>el PDF es el único juez</strong>' },
  },
  cifra: {
    nombre: 'La cifra con denominador', icon: '📊',
    estructura: { title: 'Qué es', info: '• Un número con <strong>de cuántos</strong> y <strong>en cuánto tiempo</strong><br>• «Veintidós de una sección de cuarenta y dos, en marzo»<br>• Sin eso, el número no significa nada' },
    funcion: { title: 'Cómo se escribe', info: '• Se busca cada cifra y se le pregunta de cuántos y cuándo<br>• Se acepta que el número quede más pequeño<br>• Y se enseña <strong>el promedio</strong>, no el mejor día' },
    enfermedades: { title: 'Dónde se infla', info: '• «Más de mil descargas», sin base ni plazo<br>• El pico presentado como si fuera lo normal<br>• El total acumulado desde siempre, contado como si fuera de este mes' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Las cifras que hoy se pueden enseñar son <strong>pequeñas y exactas</strong>: 17 misiones, 9 rutas, 14 fichas<br>• Una cifra chica y comprobable <strong>abre</strong> conversaciones que una grande y borrosa cierra' },
  },
  falta: {
    nombre: 'Lo que todavía no es', icon: '🚧',
    estructura: { title: 'Qué es', info: '• El <strong>límite del proyecto dicho por uno mismo</strong><br>• Se dice antes de que la otra persona lo descubra<br>• No resta: es lo único que hace creíble el resto' },
    funcion: { title: 'Cómo se escribe', info: '• Se escriben las tres cosas que <strong>más incomoda</strong> decir<br>• Se dicen con la misma calma que lo demás<br>• Y se acompañan de qué se está haciendo al respecto' },
    enfermedades: { title: 'Dónde se infla', info: '• Al contar en presente lo que todavía no ocurrió<br>• Al esperar a que pregunten, y que la pregunta llegue en mal momento<br>• Al llamar «alianza» a lo que fue un patrocinio de una vez' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Lo que hay que decir sin que lo pregunten: la escuela es <strong>una y de prueba</strong>, las rutas declaran seis etapas y hay tres, y <strong>falta un maestro de fuera</strong> que revise el material' },
  },
  fecha: {
    nombre: 'El relato caduca', icon: '📅',
    estructura: { title: 'Qué es', info: '• Todo relato lleva <strong>fecha y fecha de revisión</strong><br>• No porque cambie la verdad: porque cambia el proyecto<br>• Un texto quieto sobre algo que se mueve acaba siendo falso' },
    funcion: { title: 'Cómo se escribe', info: '• Se lee entero <strong>como si fuera de otro</strong><br>• Se marca lo que ya no es cierto y se corrige con la fecha de hoy<br>• Se avisa a quien se lo creyó, si le afecta' },
    enfermedades: { title: 'Dónde se infla', info: '• Con el «nadie se queja», que no significa que nadie se lo esté creyendo<br>• Con los textos de presentación, que nadie vuelve a abrir<br>• Con los símbolos: un candado que dice «no se comparte» sobre algo que sí se comparte' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Caso de la casa: el <strong>texto de presentación del repositorio</strong> sigue contando el proyecto anterior<br>• Y el <strong>candado 🔒</strong> de las tarjetas fue decorativo hasta que el repositorio se cerró de verdad' },
  },
});

let src = fs.readFileSync(ARCHIVO, 'utf8');
const lineas = src.split(/\r?\n/);
let cambiados = 0; const noEnc = [];
for (const [nombre, literal] of Object.entries(B)) {
  const prefijo = 'const ' + nombre + '=';
  const idx = lineas.findIndex(l => l.startsWith(prefijo));
  if (idx === -1) { noEnc.push(nombre); continue; }
  lineas[idx] = prefijo + literal + ';'; cambiados++;
}
src = lineas.join('\n');

/* Los rótulos que arrastra el molde (norma 1: se revisan siempre al copiar). */
const textos = [
  [/🏷️ \*Ruta de la Marca · Etapa 2\* 🏷️/g, '📣 *Ruta de la Marca · Etapa 3* 📣'],
  [/Ruta de la Marca · Etapa 2: La oferta/g, 'Ruta de la Marca · Etapa 3: El relato'],
  [/La cuenta sobre la mesa/g, 'El relato que se sostiene'],
  [/la cuenta sobre la mesa/g, 'el relato que se sostiene'],
  [/La oferta: qué se entrega y a qué precio/g, 'El relato: contar el proyecto sin inflarlo'],
  [/La oferta sobre la mesa/g, 'El relato que se sostiene'],
  [/la oferta sobre la mesa/g, 'el relato que se sostiene'],
  [/La oferta/g, 'El relato'],
  [/la oferta/g, 'el relato'],
  [/🏷️ ¡/g, '📣 ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
