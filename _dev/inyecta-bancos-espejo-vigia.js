/* Inyecta los bancos de la misión «El vigía y el timón» (Ruta de la Máquina
   que se Mira, etapa 1: la puerta del Estudio Mayor) sobre el molde copiado de
   la etapa 3 de la Ley.
   Uso:  node _dev/inyecta-bancos-espejo-vigia.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio entra sin su etiqueta. Los que
   sostienen esta etapa, con la suya:

     · Flavell (1979), «Metacognition and cognitive monitoring»: el acta de
       nacimiento del término. CLÁSICO SÓLIDO.
     · Nelson y Narens (1990), «Metamemory: a theoretical framework and new
       findings»: el mapa de dos niveles (objeto y meta) con sus dos
       corrientes: el monitoreo SUBE información, el control BAJA decisiones.
       CLÁSICO SÓLIDO: es el marco que ordena el campo.
     · Koriat (1997): los juicios de aprendizaje se fabrican con pistas
       (fluidez, familiaridad) y las pistas se pueden falsear. CLÁSICO SÓLIDO.
       Es la base de la etapa 2; aquí solo se asoma.
     · Dunlosky et al. (2013): la monografía gratuita que ordena las técnicas.
       SÍNTESIS SÓLIDA. Texto de cabecera de las etapas 4 y 5.

   La idea que ordena todos los bancos: el vigía (monitoreo) sube partes y el
   timón (control) baja decisiones; la falla habitual está en el vigía, no en
   el timón. La gente no decide mal: decide bien sobre datos malos.        */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-espejo-vigia-timon', 'js', 'vigia-timon.js');

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
  { w: 'Metacognición', a: '🪞 El conocimiento y la vigilancia <strong>del propio pensar</strong>. Flavell le puso nombre en 1979. No es estudiar más: es estudiar <strong>mirando cómo se estudia</strong>, que es lo que abarata todo lo demás.' },
  { w: 'El mapa de los dos pisos', a: '🏗️ Nelson y Narens (1990): abajo el <strong>nivel objeto</strong> (el que lee, resuelve, memoriza) y arriba el <strong>metanivel</strong> (el que vigila y decide). Todo lo que pasa en una sesión de estudio vive en uno de los dos.' },
  { w: 'El nivel objeto', a: '📖 El piso de abajo: el que hace <strong>el trabajo de aprender</strong>. Resuelve la división, lee el capítulo, memoriza la tabla. Produce la nota; pero cuánto rinde cada hora lo decide el piso de arriba.' },
  { w: 'El metanivel', a: '🪞 El piso de arriba: el que <strong>vigila el trabajo y lo administra</strong>. Tiene dos oficios que no hay que confundir: el vigía, que sube partes, y el timón, que baja decisiones.' },
  { w: 'El monitoreo (el vigía)', a: '🔭 La corriente que <strong>sube</strong>: información de cómo va el trabajo. «¿Cuánto sé de esto?», «el tema 3 está flojo», «ya me lo sé». Todo parte del vigía <strong>puede ser falso</strong>, y ahí vive la falla habitual.' },
  { w: 'El control (el timón)', a: '⚓ La corriente que <strong>baja</strong>: decisiones sobre el trabajo. Las tres clásicas: <strong>seguir, cambiar de técnica, abandonar</strong>. El timón casi siempre decide bien; la pregunta es con qué datos.' },
  { w: 'La falla habitual', a: '⚠️ <strong>La gente no decide mal: decide bien sobre datos malos.</strong> Jael relee, el texto corre fácil, el vigía sube «ya me lo sé», y el timón decide dormir. La decisión era correcta; el parte era falso.' },
  { w: 'La sensación de saber', a: '🌫️ Un <strong>indicador indirecto</strong> del saber, no el saber. Y todo indicador indirecto se puede engañar. El vigía no lee la memoria directamente: <strong>adivina con pistas</strong> (Koriat, 1997), y las pistas se falsean.' },
  { w: '«Me suena»', a: '👀 La pista del <strong>reconocimiento</strong>: ver la página y notarla conocida. <strong>Reconocer no es recordar</strong>: el examen pide producir la respuesta, no saludarla cuando pasa.' },
  { w: '«Lo leí tres veces»', a: '⏱️ La pista del <strong>esfuerzo</strong>: mide horas invertidas, no saber producido. Es el parte favorito del vigía porque siempre está disponible, y no dice nada del resultado.' },
  { w: 'La lectura fiable', a: '📄 Una sola: <strong>producir la respuesta con el material cerrado</strong>. Cuaderno cerrado, hoja en blanco, reproducir. Un parte vale cuando sale de ahí; no vale cuando sale de la facilidad de tener el material delante.' },
  { w: 'El juicio de aprendizaje', a: '📝 La predicción del vigía puesta por escrito <strong>antes de la prueba</strong>: «voy a poder reproducir tanto», «voy a sacar tanto». Sin predicción apuntada no hay nada que comparar después.' },
  { w: 'La brecha', a: '📏 La diferencia entre <strong>lo predicho y lo que salió</strong>. Es el dato con que se entrena el vigía. La meta no es brecha cero: es <strong>brecha vista</strong>, porque un sesgo conocido se puede descontar.' },
  { w: 'El registro del vigía', a: '🗒️ Cuatro columnas y nada más: <strong>predicción, fecha, resultado, brecha</strong>. Dos líneas por prueba. Es el producto de esta ruta: la etapa 6 lo convierte en termómetro calibrado.' },
  { w: 'Seguir, cambiar, abandonar', a: '⚓ Las tres decisiones del timón. Ninguna es mala en sí: son malas <strong>sin parte comprobado</strong>. Cambiar de técnica por aburrimiento es un volantazo; cambiarla tras medir es gobernar.' },
  { w: 'Por qué esta etapa va primero', a: '🎓 Porque el Estudio Mayor entero se estudia <strong>con esta herramienta</strong>. Quien separa el vigía del timón y comprueba con el material cerrado estudia las otras veintiséis materias a mitad de precio.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Quién le puso nombre a la metacognición, y en qué año?', o: ['a) Flavell, en 1979', 'b) Nelson, en 1990', 'c) Koriat, en 1997', 'd) Narens, en 1979'], c: 0 },
  { q: 'En el mapa de Nelson y Narens, el nivel objeto es…', o: ['a) El que vigila el trabajo', 'b) El que lee, resuelve y memoriza', 'c) El que apunta la brecha', 'd) El que decide cuándo parar'], c: 1 },
  { q: 'El monitoreo es la corriente que…', o: ['a) Baja decisiones al trabajo', 'b) Borra lo que no sirve', 'c) Sube información de cómo va el trabajo', 'd) Reparte el tiempo de estudio'], c: 2 },
  { q: 'Las tres decisiones clásicas del timón son…', o: ['a) Leer, subrayar, copiar', 'b) Predecir, medir, apuntar', 'c) Sumar, restar, comparar', 'd) Seguir, cambiar de técnica, abandonar'], c: 3 },
  { q: 'La falla habitual del estudio está en…', o: ['a) El vigía: los partes que suben son falsos', 'b) El timón: las decisiones son absurdas', 'c) El cuaderno: está mal tomado', 'd) La memoria: es demasiado corta'], c: 0 },
  { q: '«Me suena» es una pista de…', o: ['a) Dominio del tema', 'b) Reconocimiento, que no es recuerdo', 'c) Comprensión profunda', 'd) Buena calibración'], c: 1 },
  { q: 'La única lectura fiable del propio saber sale de…', o: ['a) Releer con más atención', 'b) Subrayar con colores', 'c) Producir la respuesta con el material cerrado', 'd) Escuchar la explicación otra vez'], c: 2 },
  { q: 'La brecha del registro es la diferencia entre…', o: ['a) Horas invertidas y páginas leídas', 'b) XP ganados y XP posibles', 'c) Lo fácil y lo difícil', 'd) Lo predicho y el resultado real'], c: 3 },
  { q: 'La meta del registro del vigía es…', o: ['a) Brecha vista: conocer el sesgo propio', 'b) Brecha cero desde la primera semana', 'c) Acumular la mayor cantidad de horas', 'd) Predecir siempre nota máxima'], c: 0 },
  { q: '¿Cuándo se califica de verdad una sesión de estudio?', o: ['a) Al terminarla, por la sensación', 'b) Al día siguiente, con la comprobación', 'c) Nunca: no hace falta', 'd) Al final del mes, por promedio'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Vigía', 'Timón'], headA: '🔭 Parte del vigía', headB: '⚓ Decisión del timón', colA: 'ok', colB: 'no',
    words: [
      { w: '«¿Cuánto sé de esto?»', t: 'ok' }, { w: '«Cambio a tarjetas»', t: 'no' },
      { w: '«El tema 3 está flojo»', t: 'ok' }, { w: '«Repaso lo fallado primero»', t: 'no' },
      { w: '«Ya me lo sé»', t: 'ok' }, { w: '«Paro por hoy»', t: 'no' },
      { w: '«Creo que saco 90»', t: 'ok' }, { w: '«Sigo con el resumen»', t: 'no' },
    ],
  },
  {
    label: ['Nivel objeto', 'Metanivel'], headA: '🏗️ Nivel objeto (trabaja)', headB: '🪞 Metanivel (vigila y decide)', colA: 'ok', colB: 'no',
    words: [
      { w: 'Resolver la división', t: 'ok' }, { w: 'Predecir la nota de mañana', t: 'no' },
      { w: 'Leer el capítulo', t: 'ok' }, { w: 'Notar que no se entendió', t: 'no' },
      { w: 'Copiar la tabla', t: 'ok' }, { w: 'Decidir repasar el tema 3', t: 'no' },
      { w: 'Escribir el resumen', t: 'ok' }, { w: 'Darse cuenta de que va lento', t: 'no' },
    ],
  },
  {
    label: ['Fiable', 'Engañoso'], headA: '✅ Parte fiable', headB: '🌫️ Parte engañoso', colA: 'ok', colB: 'no',
    words: [
      { w: 'Reproducirlo a cuaderno cerrado', t: 'ok' }, { w: '«Me suena»', t: 'no' },
      { w: 'Explicarlo sin mirar y que salga', t: 'ok' }, { w: '«Lo leí tres veces»', t: 'no' },
      { w: 'La nota de la prueba de práctica', t: 'ok' }, { w: '«El texto corre fácil»', t: 'no' },
      { w: 'La brecha apuntada en el registro', t: 'ok' }, { w: '«Lo acabo de ver»', t: 'no' },
    ],
  },
  {
    label: ['Con datos', 'A ciegas'], headA: '🧭 Timón con datos', headB: '🌫️ Timón a ciegas', colA: 'ok', colB: 'no',
    words: [
      { w: 'Repasar lo que falló en la prueba cerrada', t: 'ok' }, { w: 'Repasar lo que se siente flojo', t: 'no' },
      { w: 'Cambiar de técnica después de medirla', t: 'ok' }, { w: 'Cambiar de técnica por aburrimiento', t: 'no' },
      { w: 'Parar cuando la predicción acertó dos veces', t: 'ok' }, { w: 'Parar cuando ya no se aguanta el sueño', t: 'no' },
      { w: 'Dormir tras comprobar en hoja en blanco', t: 'ok' }, { w: 'Dormir tras la tercera relectura', t: 'no' },
    ],
  },
]);

/* ---------- identificar ---------- */
B.idData = JSON.stringify([
  { s: ['El', 'vigía', 'sube', 'partes', 'del', 'trabajo.'], c: 1, art: 'El oficio que monitorea' },
  { s: ['El', 'timón', 'baja', 'las', 'decisiones.'], c: 1, art: 'El oficio que controla' },
  { s: ['El', 'nivel', 'objeto', 'lee,', 'resuelve', 'y', 'memoriza.'], c: 2, art: 'La palabra que nombra al piso de abajo' },
  { s: ['El', 'metanivel', 'vigila', 'y', 'administra', 'el', 'estudio.'], c: 1, art: 'El piso de arriba' },
  { s: ['La', 'predicción', 'es', 'el', 'parte', 'por', 'escrito.'], c: 1, art: 'El juicio antes de la prueba' },
  { s: ['La', 'brecha', 'separa', 'lo', 'predicho', 'de', 'lo', 'real.'], c: 1, art: 'Lo que alimenta el registro' },
  { s: ['Reconocer', 'no', 'es', 'recordar.'], c: 0, art: 'La pista que fabrica partes falsos' },
  { s: ['La', 'comprobación', 'se', 'hace', 'con', 'el', 'cuaderno', 'cerrado.'], c: 1, art: 'La lectura fiable' },
]);

/* ---------- completa ---------- */
B.cmpData = JSON.stringify([
  { s: 'El piso que lee, resuelve y memoriza es el nivel ___.', opts: ['objeto', 'superior', 'medio'], c: 0 },
  { s: 'El monitoreo ___ información del trabajo.', opts: ['baja', 'sube', 'borra'], c: 1 },
  { s: 'El control baja ___ al piso de abajo.', opts: ['decisiones', 'partes', 'notas'], c: 0 },
  { s: 'La gente no decide mal: decide bien sobre datos ___.', opts: ['viejos', 'ajenos', 'malos'], c: 2 },
  { s: 'Reconocer no es ___.', opts: ['recordar', 'leer', 'repasar'], c: 0 },
  { s: 'La única lectura fiable sale del material ___.', opts: ['abierto', 'cerrado', 'nuevo'], c: 1 },
  { s: 'La diferencia entre lo predicho y lo real es la ___.', opts: ['brecha', 'meta', 'curva'], c: 0 },
  { s: 'A la metacognición le puso nombre ___ en 1979.', opts: ['Flavell', 'Nelson', 'Narens'], c: 0 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Vigía', 'Timón'], btnA: '🔭 Vigía', btnB: '⚓ Timón', colA: 'ok', colB: 'no',
    words: [
      { w: '«¿Cuánto sé de esto?»', t: 'ok' }, { w: '«Cambio a tarjetas»', t: 'no' },
      { w: '«El tema 3 está flojo»', t: 'ok' }, { w: '«Repaso lo fallado primero»', t: 'no' },
      { w: '«Ya me lo sé»', t: 'ok' }, { w: '«Paro por hoy»', t: 'no' },
      { w: '«Voy lento»', t: 'ok' }, { w: '«Sigo con el resumen»', t: 'no' },
      { w: '«Creo que saco 90»', t: 'ok' }, { w: '«Abandono este capítulo»', t: 'no' },
    ],
  },
  {
    label: ['Fiable', 'Engañoso'], btnA: '✅ Fiable', btnB: '🌫️ Engañoso', colA: 'ok', colB: 'no',
    words: [
      { w: 'Reproducir a cuaderno cerrado', t: 'ok' }, { w: '«Me suena»', t: 'no' },
      { w: 'Explicarlo sin mirar', t: 'ok' }, { w: '«Lo leí tres veces»', t: 'no' },
      { w: 'La prueba de práctica', t: 'ok' }, { w: '«El texto corre fácil»', t: 'no' },
      { w: 'La brecha apuntada', t: 'ok' }, { w: '«Lo acabo de ver»', t: 'no' },
      { w: 'El examen de la semana pasada', t: 'ok' }, { w: 'La sensación al terminar', t: 'no' },
    ],
  },
  {
    label: ['Nivel objeto', 'Metanivel'], btnA: '🏗️ Objeto', btnB: '🪞 Metanivel', colA: 'ok', colB: 'no',
    words: [
      { w: 'Resolver la división', t: 'ok' }, { w: 'Predecir la nota', t: 'no' },
      { w: 'Leer el capítulo', t: 'ok' }, { w: 'Decidir cambiar de técnica', t: 'no' },
      { w: 'Copiar la tabla', t: 'ok' }, { w: 'Notar que no se entendió', t: 'no' },
      { w: 'Memorizar los pasos', t: 'ok' }, { w: 'Elegir qué repasar', t: 'no' },
      { w: 'Escribir el resumen', t: 'ok' }, { w: 'Darse cuenta de que va lento', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'La sesión vigilada, de principio a fin',
    steps: [
      'Planear la sesión: qué toca y con qué técnica',
      'Apuntar la predicción: cuánto se va a poder reproducir',
      'Estudiar: el nivel objeto hace el trabajo',
      'Pedir el parte del vigía: ¿cómo voy?',
      'Decidir con el timón: seguir, cambiar o parar',
      'Comprobar a cuaderno cerrado y apuntar la brecha',
    ],
  },
  {
    label: 'Qué se hace cuando el vigía dice «ya me lo sé»',
    steps: [
      'Cerrar el cuaderno sin discutir la sensación',
      'Tomar una hoja en blanco',
      'Reproducir lo estudiado sin mirar',
      'Comparar lo que salió con lo que se predijo',
      'Apuntar la brecha en el registro',
      'Decidir el repaso empezando por lo que falló',
    ],
  },
  {
    label: 'Cómo se localiza dónde mintió el vigía',
    steps: [
      'Relatar la sesión completa, tal como pasó',
      'Separar qué fue monitoreo y qué fue control',
      'Listar los partes que subió el vigía',
      'Comprobar cada parte contra una prueba cerrada',
      'Marcar el parte que no se sostuvo',
      'Escribir qué pista lo fabricó: fluidez, «me suena», horas',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Sube información de cómo va el trabajo', ans: 'El monitoreo', opts: ['El monitoreo', 'El control', 'El nivel objeto', 'La brecha'] },
  { desc: 'Baja decisiones: seguir, cambiar, abandonar', ans: 'El control', opts: ['El control', 'El monitoreo', 'El metanivel', 'El registro'] },
  { desc: 'El piso que lee, resuelve y memoriza', ans: 'El nivel objeto', opts: ['El nivel objeto', 'El metanivel', 'El vigía', 'El timón'] },
  { desc: 'El piso que vigila el trabajo y lo administra', ans: 'El metanivel', opts: ['El metanivel', 'El nivel objeto', 'La comprobación', 'La predicción'] },
  { desc: 'La predicción sobre el propio saber, apuntada antes de la prueba', ans: 'El juicio de aprendizaje', opts: ['El juicio de aprendizaje', 'La brecha', 'El reconocimiento', 'La falla habitual'] },
  { desc: 'La diferencia entre lo predicho y el resultado real', ans: 'La brecha', opts: ['La brecha', 'El juicio de aprendizaje', 'El monitoreo', 'La regla de parada'] },
  { desc: 'Decidir bien sobre datos malos', ans: 'La falla habitual', opts: ['La falla habitual', 'La lectura fiable', 'El control', 'La calibración'] },
  { desc: 'Producir la respuesta con el material cerrado', ans: 'La comprobación', opts: ['La comprobación', 'La relectura', 'El reconocimiento', 'El parte del vigía'] },
]);

/* ---------- ¿qué está haciendo esa frase? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«¿Cuánto de esto voy a recordar mañana?»', func: 'Monitoreo: un juicio de aprendizaje', opts: ['Monitoreo: un juicio de aprendizaje', 'Control: un cambio de técnica', 'Trabajo del nivel objeto', 'Una comprobación'] },
  { trans: '«Dejo el resumen y paso a tarjetas»', func: 'Control: un cambio de técnica', opts: ['Control: un cambio de técnica', 'Monitoreo: un juicio de aprendizaje', 'Trabajo del nivel objeto', 'Una comprobación'] },
  { trans: '«Resuelvo el ejercicio 4 del cuaderno»', func: 'Trabajo del nivel objeto', opts: ['Trabajo del nivel objeto', 'Control: una regla de parada', 'Monitoreo: un parte', 'Una comprobación'] },
  { trans: '«Me suena, sigamos»', func: 'Monitoreo engañado: reconocer no es recordar', opts: ['Monitoreo engañado: reconocer no es recordar', 'Control con datos', 'Trabajo del nivel objeto', 'Una comprobación fiable'] },
  { trans: '«Cierro el cuaderno y lo escribo de memoria»', func: 'Una comprobación: la lectura fiable', opts: ['Una comprobación: la lectura fiable', 'Monitoreo engañado', 'Control: un abandono', 'Trabajo sin vigilancia'] },
]);

/* ---------- diagnóstico: ¿por dónde falla? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Jael relee el cuaderno tres veces, se siente lista, y el examen sale mal', characteristic: 'El vigía facturó la facilidad de releer como saber: el parte era falso', opts: ['El vigía facturó la facilidad de releer como saber: el parte era falso', 'El timón decidió mal la hora de dormir', 'El cuaderno estaba incompleto', 'El examen estaba mal hecho'] },
  { disease: 'Angelly cambia de técnica cada cinco minutos y dice que ninguna le funciona', characteristic: 'El timón decide sin partes: cambiar sin dato comprobado es un volantazo', opts: ['El timón decide sin partes: cambiar sin dato comprobado es un volantazo', 'Las técnicas son todas malas', 'Le falta fuerza de voluntad', 'El material es demasiado difícil'] },
  { disease: 'Se repasa siempre lo que se siente flojo, y en el examen falla otra cosa', characteristic: 'La sensación eligió el repaso: sin comprobación no se sabe qué está flojo de verdad', opts: ['La sensación eligió el repaso: sin comprobación no se sabe qué está flojo de verdad', 'Había que repasarlo todo dos veces', 'El examen preguntó lo que no tocaba', 'Faltaron horas de estudio'] },
  { disease: 'Se estudia hasta el cansancio y se para cuando ya no se puede más', characteristic: 'El timón no tiene regla de parada: la decide el sueño y no un dato', opts: ['El timón no tiene regla de parada: la decide el sueño y no un dato', 'Estudiar mucho siempre rinde más', 'El problema es madrugar', 'Faltó café'] },
  { disease: 'La maestra pregunta «¿entendieron?», todos asienten, y la prueba sale mal', characteristic: 'La pregunta midió reconocimiento: nadie produjo nada con el material cerrado', opts: ['La pregunta midió reconocimiento: nadie produjo nada con el material cerrado', 'Los alumnos mintieron a propósito', 'La explicación fue demasiado corta', 'La prueba fue injusta'] },
  { disease: 'La predicción nunca se apunta y el registro está vacío', characteristic: 'Sin registro no hay brecha, y sin brecha el vigía no puede aprender de sus errores', opts: ['Sin registro no hay brecha, y sin brecha el vigía no puede aprender de sus errores', 'Apuntar quita tiempo de estudio', 'La memoria guarda las predicciones sola', 'El registro es solo para los adultos'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Sube partes de cómo va el trabajo.', type: 'El monitoreo (el vigía)' },
  { s: 'Baja al piso de abajo las decisiones de seguir, cambiar o parar.', type: 'El control (el timón)' },
  { s: 'El piso que lee, resuelve y memoriza.', type: 'El nivel objeto' },
  { s: 'El piso que vigila y administra el estudio.', type: 'El metanivel' },
  { s: 'La predicción sobre el propio saber, hecha antes de la prueba.', type: 'El juicio de aprendizaje' },
  { s: 'La diferencia entre lo que se predijo y lo que salió.', type: 'La brecha' },
  { s: 'Ver la página y decir «esto me suena».', type: 'Reconocimiento (pista engañosa)' },
  { s: 'Cerrar el material y producir la respuesta.', type: 'La comprobación (recuperación)' },
  { s: 'Decidir bien sobre datos malos.', type: 'La falla habitual' },
  { s: 'Apuntar predicción, fecha, resultado y brecha.', type: 'El registro del vigía' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: '«Ya me lo sé»', gen: 'Parte del vigía', n: 'Sale de la fluidez de releer', g: 'Durante el estudio', t: 'Monitoreo (engañoso)' },
  { w: '«Cambio a tarjetas»', gen: 'Decisión del timón', n: 'Cambia la técnica', g: 'Durante el estudio', t: 'Control' },
  { w: 'Resolver la división', gen: 'Trabajo', n: 'Produce la tarea', g: 'Piso de abajo', t: 'Nivel objeto' },
  { w: '«Voy a sacar 85»', gen: 'Parte del vigía', n: 'Predicción por escrito', g: 'Antes de la prueba', t: 'Juicio de aprendizaje' },
  { w: 'Reproducir a cuaderno cerrado', gen: 'Comprobación', n: 'Produce sin material delante', g: 'Después del estudio', t: 'Monitoreo (fiable)' },
  { w: '«Paro por hoy»', gen: 'Decisión del timón', n: 'Regla de parada', g: 'Durante el estudio', t: 'Control' },
  { w: 'La brecha de la semana', gen: 'Registro', n: 'Predicho contra real', g: 'Después de la prueba', t: 'Calibración' },
  { w: '«Me suena»', gen: 'Parte del vigía', n: 'Sale de reconocer la página', g: 'Durante el estudio', t: 'Monitoreo (engañoso)' },
  { w: 'Leer el capítulo', gen: 'Trabajo', n: 'Entra material nuevo', g: 'Piso de abajo', t: 'Nivel objeto' },
  { w: '«Repaso primero lo que falló»', gen: 'Decisión del timón', n: 'Usa un dato comprobado', g: 'Después de la comprobación', t: 'Control con datos' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'El vigía sube ___ del trabajo.', opts: ['partes', 'órdenes', 'notas'], ans: 'partes' },
  { s: 'El timón baja ___.', opts: ['decisiones', 'partes', 'sensaciones'], ans: 'decisiones' },
  { s: 'Nelson y Narens ordenaron el mapa en dos ___.', opts: ['pisos', 'listas', 'fases'], ans: 'pisos' },
  { s: 'La falla habitual está en el ___.', opts: ['vigía', 'timón', 'cuaderno'], ans: 'vigía' },
  { s: 'Un parte vale por su ___.', opts: ['origen', 'fuerza', 'hora'], ans: 'origen' },
  { s: 'La meta del registro no es brecha cero: es brecha ___.', opts: ['vista', 'corta', 'nueva'], ans: 'vista' },
  { s: 'La sesión se califica al día siguiente, con la ___.', opts: ['comprobación', 'sensación', 'relectura'], ans: 'comprobación' },
  { s: 'Saber no se siente: se ___.', opts: ['comprueba', 'repite', 'subraya'], ans: 'comprueba' },
]);
B.explainQuestions = JSON.stringify([
  { q: 'Explica el mapa de los dos pisos de Nelson y Narens con un ejemplo de esta casa.', ans: 'Abajo está el nivel objeto: el que hace el trabajo de aprender. Cuando Jael resuelve una división o lee el capítulo del sistema nervioso, trabaja el piso de abajo. Arriba está el metanivel: el que vigila ese trabajo y decide sobre él. Cuando Jael se pregunta cuánto va a recordar mañana, sube un parte (monitoreo); cuando decide dejar el resumen y pasar a tarjetas, baja una decisión (control). Todo lo que pasa en una sesión vive en uno de los dos pisos, y la nota la produce el de abajo, pero cuánto rinde cada hora lo decide el de arriba.' },
  { q: '¿Por qué se dice que la gente no decide mal, sino que decide bien sobre datos malos?', ans: 'Porque la falla casi nunca está en el timón: está en el vigía. Si el vigía sube «ya me lo sé», irse a dormir es la decisión correcta con ese dato; el problema es que el dato era falso, porque salía de la facilidad de releer y no de una prueba. Por eso regañar la decisión no arregla nada: lo que se audita es el parte, preguntando de dónde salió. Un parte que sale de producir con el material cerrado vale; uno que sale de la facilidad de tener el material delante, no.' },
  { q: '¿Qué hace válido o inválido un parte del vigía? Da dos ejemplos de cada lado.', ans: 'El origen. Un parte vale cuando sale de producir la respuesta con el material cerrado: reproducirlo en hoja en blanco, o explicarlo sin mirar y que salga. No vale cuando sale de la facilidad de tener el material delante: «me suena» (reconocimiento: el examen pide producir, no saludar la página) y «lo leí tres veces» (esfuerzo: mide horas invertidas, no saber producido). La regla cabe en una línea: producir con material cerrado, sí; facilidad con material abierto, no.' },
  { q: 'Jael dice «ya me lo sé» tras releer tres veces. ¿Qué se hace, paso a paso y por qué?', ans: 'No se discute la sensación, porque es sincera y discutirla no la corrige. Se cierra el cuaderno, se toma una hoja en blanco y se reproduce lo estudiado sin mirar. Si sale, el parte queda confirmado y se duerme tranquila con razón. Si no sale, aparecieron los huecos que la relectura escondía, y el repaso siguiente empieza exactamente por lo que falló, no por releer todo. Y lo que salga se apunta en el registro, porque la brecha de hoy entrena al vigía de mañana.' },
  { q: '¿Qué es la brecha, cómo se apunta y para qué sirve un registro donde la brecha no es cero?', ans: 'La brecha es la diferencia entre lo que el vigía predijo y lo que salió en la comprobación. Se apunta en cuatro columnas: predicción, fecha, resultado, brecha; dos líneas por prueba. Y un registro con brecha no es un registro fracasado: es el único que enseña algo. La meta es brecha vista, no brecha cero: quien descubre que se pasa de optimista en Ciencias por diez puntos ya puede descontarlo, y ese descuento vale más que cien buenas intenciones de estudiar más.' },
  { q: '¿Por qué esta etapa es la puerta del Estudio Mayor entero?', ans: 'Porque el Estudio Mayor son más de veinte materias, y todas se estudian con la misma máquina: la propia cabeza. Esta etapa enseña a vigilar esa máquina: separar el trabajo (nivel objeto) de la vigilancia (metanivel), auditar los partes del vigía por su origen, y darle al timón datos comprobados en vez de sensaciones. Quien tiene eso estudia cualquier materia a mitad de precio; quien no lo tiene, estudia a ciegas todas. Por eso va primero, y por eso su registro lo heredan las etapas y materias que siguen.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['VIGIA', 'TIMON', 'MONITOREO', 'CONTROL', 'FLAVELL', 'BRECHA']),
  haceSopa(10, ['METANIVEL', 'OBJETO', 'JUICIO', 'PREDICCION', 'NELSON', 'NARENS']),
  haceSopa(10, ['CUADERNO', 'CERRADO', 'SESION', 'PARTE', 'REGISTRO', 'SABER']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'El nivel objeto es el piso que lee, resuelve y memoriza.', a: true },
  { q: 'El monitoreo baja decisiones al piso de abajo.', a: false },
  { q: 'El control decide seguir, cambiar de técnica o abandonar.', a: true },
  { q: 'Flavell le puso nombre a la metacognición en 1979.', a: true },
  { q: 'La falla habitual del estudio está casi siempre en el timón.', a: false },
  { q: 'Reconocer una página es lo mismo que poder recordarla.', a: false },
  { q: 'Un parte del vigía vale por su origen, no por su fuerza.', a: true },
  { q: 'La comprobación fiable se hace con el material delante.', a: false },
  { q: 'La brecha es la diferencia entre lo predicho y el resultado real.', a: true },
  { q: 'La meta del registro es que la brecha sea exactamente cero.', a: false },
  { q: 'Nelson y Narens ordenaron la metacognición en dos niveles.', a: true },
  { q: '«Lo leí tres veces» mide horas invertidas, no saber producido.', a: true },
  { q: 'Una sesión que fluye fácil garantiza que se aprendió más.', a: false },
  { q: 'Los XP de F.A.R.O miden dominio, no recorrido.', a: false },
  { q: 'La sensación de saber es un indicador indirecto que se puede engañar.', a: true },
]);
B.evalMCBank = JSON.stringify([
  { q: '¿Quién le puso nombre a la metacognición, y en qué año?', o: ['a) Flavell, en 1979', 'b) Nelson, en 1990', 'c) Narens, en 1979', 'd) Koriat, en 1997'], a: 0 },
  { q: 'En el mapa de Nelson y Narens, el nivel objeto…', o: ['a) Lee, resuelve y memoriza', 'b) Vigila el trabajo', 'c) Baja decisiones', 'd) Apunta la brecha'], a: 0 },
  { q: 'El monitoreo es…', o: ['a) La información que sube del trabajo', 'b) Las decisiones que bajan', 'c) La técnica de estudio', 'd) La nota final'], a: 0 },
  { q: 'El control es…', o: ['a) Las decisiones que bajan al piso de abajo', 'b) La información que sube', 'c) La sensación de saber', 'd) El registro de la casa'], a: 0 },
  { q: 'La falla habitual del estudio está en…', o: ['a) El vigía: los datos', 'b) El timón: las decisiones', 'c) El cuaderno', 'd) La memoria'], a: 0 },
  { q: '«Me suena» es una pista de…', o: ['a) Reconocimiento', 'b) Recuerdo producido', 'c) Comprensión', 'd) Dominio'], a: 0 },
  { q: 'La lectura fiable del propio saber sale de…', o: ['a) Producir con el material cerrado', 'b) Releer con atención', 'c) Subrayar con colores', 'd) Escuchar la explicación'], a: 0 },
  { q: 'La brecha del registro es…', o: ['a) Predicho contra real', 'b) Horas contra páginas', 'c) XP contra notas', 'd) Fácil contra difícil'], a: 0 },
  { q: 'La meta del registro del vigía es…', o: ['a) Brecha vista', 'b) Brecha cero', 'c) Más horas', 'd) Más XP'], a: 0 },
  { q: 'Las tres decisiones clásicas del timón son…', o: ['a) Seguir, cambiar, abandonar', 'b) Leer, subrayar, copiar', 'c) Predecir, medir, apuntar', 'd) Sumar, restar, comparar'], a: 0 },
  { q: '¿Qué mide «lo leí tres veces»?', o: ['a) El esfuerzo invertido', 'b) El saber producido', 'c) La brecha', 'd) La calibración'], a: 0 },
  { q: 'Un parte del vigía vale por…', o: ['a) Su origen', 'b) Su fuerza', 'c) Su hora', 'd) Su tamaño'], a: 0 },
  { q: 'El «¿entendieron?» del aula mide…', o: ['a) Reconocimiento de la explicación', 'b) Recuerdo producido', 'c) Dominio del tema', 'd) La brecha'], a: 0 },
  { q: 'Los XP de una misión miden…', o: ['a) Recorrido', 'b) Dominio', 'c) Brecha', 'd) Calibración'], a: 0 },
  { q: '¿Cuándo se califica de verdad una sesión de estudio?', o: ['a) Al día siguiente, con la comprobación', 'b) Al terminarla, por la sensación', 'c) A fin de mes', 'd) No se califica'], a: 0 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'El piso que lee, resuelve y memoriza es el nivel ___.', a: 'objeto' },
  { q: 'El piso que vigila y administra es el ___.', a: 'metanivel' },
  { q: 'La información que sube del trabajo es el ___.', a: 'monitoreo' },
  { q: 'Las decisiones que bajan al trabajo son el ___.', a: 'control' },
  { q: 'Al oficio que sube partes lo llamamos el ___.', a: 'vigía' },
  { q: 'Al oficio que baja decisiones lo llamamos el ___.', a: 'timón' },
  { q: 'La predicción apuntada antes de la prueba es el juicio de ___.', a: 'aprendizaje' },
  { q: 'La diferencia entre lo predicho y lo real es la ___.', a: 'brecha' },
  { q: 'Reconocer no es ___.', a: 'recordar' },
  { q: 'La comprobación fiable se hace con el cuaderno ___.', a: 'cerrado' },
  { q: 'La gente decide bien sobre datos ___.', a: 'malos' },
  { q: 'Saber no se siente: se ___.', a: 'comprueba' },
  { q: 'A la metacognición le puso nombre ___ en 1979.', a: 'Flavell' },
  { q: 'El mapa de los dos pisos es de Nelson y ___.', a: 'Narens' },
  { q: 'Estudiar sin comprobar es estudiar a ___.', a: 'ciegas' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Metacognición', def: 'El conocimiento y la vigilancia del propio pensar' },
  { term: 'Nivel objeto', def: 'El piso que lee, resuelve y memoriza' },
  { term: 'Metanivel', def: 'El piso que vigila el trabajo y decide sobre él' },
  { term: 'Monitoreo', def: 'La información que sube: cómo va el trabajo' },
  { term: 'Control', def: 'Las decisiones que bajan: seguir, cambiar, parar' },
  { term: 'El vigía', def: 'El oficio que sube partes del estudio' },
  { term: 'El timón', def: 'El oficio que baja las decisiones' },
  { term: 'Juicio de aprendizaje', def: 'La predicción sobre lo que se va a recordar' },
  { term: 'La brecha', def: 'La distancia entre lo predicho y lo real' },
  { term: 'Reconocimiento', def: 'La pista de «me suena», que no es recuerdo' },
  { term: 'Recuperación', def: 'Producir la respuesta con el material cerrado' },
  { term: 'La falla habitual', def: 'Decidir bien sobre datos malos' },
  { term: 'El registro', def: 'Predicción, fecha, resultado y brecha, por escrito' },
  { term: 'Flavell', def: 'Puso nombre a la metacognición en 1979' },
  { term: 'Nelson y Narens', def: 'Dibujaron el mapa de los dos pisos en 1990' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'La noche antes del examen de Ciencias, Jael relee el cuaderno tres veces. El texto corre fácil, dice «ya me lo sé» y cierra el cuaderno para irse a dormir.' },
  { txt: 'Angelly estudia con resumen, a los cinco minutos pasa a tarjetas, a los cinco vuelve al cuaderno, después prueba un video. Al final de la hora dice que ninguna técnica le funciona.' },
  { txt: 'Un vendedor ofrece a la familia un curso de «técnicas de estudio y súper aprendizaje» por L 3,500: subrayado de colores, mapas mentales, relectura guiada y testimonios de alumnos felices.' },
  { txt: 'En un aula que usa M.E.T.A.S, la maestra explica, pregunta «¿entendieron?», todos asienten, y el examen de la semana siguiente sale mal. La maestra concluye que los alumnos le mintieron.' },
  { txt: 'El autor lee el compendio de la Ruta de la Ley completo en dos tardes y siente que domina la pirámide normativa. Tres días después intenta explicarla y se le mezclan dos escalones.' },
  { txt: 'Alguien de la casa descubre que puede voltear todas las flashcards de una misión sin leerlas, y la barra de XP sube igual.' },
  { txt: 'Una tarde de estudio sale redonda: con música, sin trabas, todo fluye. La prueba corta del día siguiente sale peor que la de la semana anterior, que se había sentido torpe.' },
  { txt: 'La familia arranca el registro del vigía: cada quien apunta su predicción antes de cada prueba de la semana, y después el resultado real. La primera semana casi nadie acierta.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué parte subió el vigía en este caso, y de dónde salió ese parte: de producir con el material cerrado o de la facilidad de tenerlo delante?',
  '2. ¿Qué decidió el timón (o qué está por decidir), y decidió con un dato comprobado o con una sensación?',
  '3. ¿Dónde está el parte falso, si lo hay, y qué pista lo fabricó: la fluidez, el «me suena», las horas invertidas?',
  '4. ¿Qué se comprueba a cuaderno cerrado, y qué se apunta en el registro para que el vigía aprenda de este caso?',
]);
B.critCaseGuides = JSON.stringify([
  'Se busca primero el parte: la frase del vigía («ya me lo sé», «ninguna técnica me funciona», «esto fluye») y se le pregunta el origen. Un parte que sale de producir la respuesta con el material cerrado vale; uno que sale de la facilidad de releer, de reconocer la página o de contar horas, no vale, por fuerte y sincero que se sienta. La sensación no se regaña: se audita.',
  'Después se mira la decisión. El timón casi siempre decide razonablemente CON EL DATO QUE TIENE: dormir si «ya lo sé», cambiar de técnica si «no funciona». Por eso el diagnóstico no es «decidió mal» sino «decidió sin parte comprobado». Una decisión de control sin monitoreo detrás es un volantazo, aunque salga bien.',
  'El parte falso se localiza nombrando la pista que lo fabricó. La fluidez: el texto corre fácil y la facilidad se factura como saber. El reconocimiento: «me suena» no es poder producirlo. El esfuerzo: «lo leí tres veces» mide horas, no resultado. Nombrar la pista importa porque la vacuna es distinta para cada una, y la etapa 2 de esta ruta las caza una por una.',
  'Todo caso termina igual: una comprobación con el material cerrado (hoja en blanco, explicarlo sin mirar, la prueba corta) y dos líneas en el registro: qué se predijo, qué salió, cuánta brecha quedó. La meta de la casa no es acertar la predicción: es ver la brecha, porque el sesgo conocido se descuenta y el desconocido se paga en el examen.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"Releí todo el cuaderno tres veces, así que ya me lo sé".', g1: 'La relectura produce fluidez, y el vigía factura esa facilidad como saber. El parte sale de tener el material delante, que es justo el origen que no vale.', g2: 'Se comprueba con la hoja en blanco: si sale, confirmado y a dormir; si no sale, el repaso empieza por lo que falló. El «ya me lo sé» no se discute: se comprueba.' },
  { txt: '"Sentí la clase facilísima, o sea que aprendí muchísimo".', g1: 'La sensación durante el estudio mide la comodidad del momento, y el aprendizaje se mide después y con el material cerrado. Las dos medidas pueden ir al revés.', g2: 'La sesión se califica al día siguiente, con la comprobación. En el registro, la columna del resultado siempre se llena un día después que la de la predicción.' },
  { txt: '"Esta técnica me aburre, mejor cambio a otra".', g1: 'Cambiar de técnica es una decisión del timón, y aquí no hay ningún parte comprobado detrás: hay aburrimiento. Es un volantazo, no gobierno.', g2: 'Antes de cambiar se pide el parte: una comprobación pequeña con el material cerrado. Si la técnica rinde, se queda aunque aburra; si no rinde, se cambia con causa.' },
  { txt: '"Los niños me dijeron que entendieron; me mintieron".', g1: 'Nadie mintió: el «¿entendieron?» le pide a cada vigía un parte, y cada vigía contesta con la pista que tiene: la explicación se dejó seguir. Eso es reconocimiento, no recuerdo.', g2: 'La pregunta útil obliga a producir: «cierren el cuaderno y escríbanme los dos pasos». Cinco minutos de eso valen más que cualquier asentimiento.' },
  { txt: '"Llené la barra de XP, ya domino la misión".', g1: 'Los XP son un vigía externo: un indicador indirecto del recorrido. Como todo indicador indirecto, se puede engañar, y quien lo engaña se engaña.', g2: 'El dominio lo mide la evaluación con el material cerrado, no la barra. Saber qué mide cada indicador de la casa es la misma destreza que auditar al propio vigía.' },
  { txt: '"No apunto predicciones porque casi nunca acierto".', g1: 'Acertar no es la meta: la meta es la brecha vista. Un registro donde nadie falla no enseña nada; el error apuntado es el dato más útil que produce la casa.', g2: 'El vigía solo se entrena comparando predicción contra resultado. Quien no apunta porque falla se queda con el fallo y sin el aprendizaje, que es pagar el precio sin llevarse el producto.' },
]);
B.critDecisionBank = JSON.stringify([
  'Jael dice «ya me lo sé» a las nueve de la noche: ¿se le discute la sensación, se le manda releer, o se le pone la hoja en blanco? ¿Y qué se hace con lo que salga?',
  'Angelly quiere cambiar de técnica por tercera vez en la misma hora: ¿se le deja, se le prohíbe, o se le pide algo antes de cambiar? ¿Qué exactamente?',
  'El vendedor del curso de L 3,500 espera respuesta esta semana: ¿qué pregunta única se le hace, y qué respuesta lo descarta?',
  'La maestra quiere saber si la clase entendió: ¿qué pregunta hace en los últimos cinco minutos, y por qué esa y no «¿entendieron?»?',
  'El papá cierra el compendio con sensación de dominio: ¿qué comprobación se hace antes de darlo por estudiado, y cuándo?',
  'Alguien voltea flashcards sin leerlas y la barra sube: ¿qué se cambia, la barra o la costumbre? ¿Por qué?',
  'La sesión de hoy fluyó perfecta: ¿cuándo y con qué se califica de verdad?',
  'La familia arranca el registro del vigía: ¿qué cuatro columnas lleva, y cuál es la meta de la primera semana?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Comprobar con hoja en blanco antes de dormir.', b: 'Confiar en el «ya me lo sé» de la relectura.', ga: 'Caso A: el parte queda confirmado o desmentido esta noche, cuando arreglarlo cuesta diez minutos sobre lo fallado.', gb: 'Caso B: el parte se comprueba mañana en el examen, que es el lugar más caro para descubrir un hueco.' },
  { a: 'Cambiar de técnica después de una comprobación pequeña.', b: 'Cambiar de técnica por aburrimiento.', ga: 'Caso A: el cambio tiene causa y deja un dato: la técnica anterior rendía o no rendía, y quedó apuntado.', gb: 'Caso B: se gira el timón sin parte, y al final de la hora «ninguna técnica funciona» porque ninguna se midió.' },
  { a: 'Preguntar «cierren el cuaderno y escriban los dos pasos».', b: 'Preguntar «¿entendieron?».', ga: 'Caso A: obliga a producir con el material cerrado, que es la única lectura fiable, y dice exactamente qué reexplicar.', gb: 'Caso B: pide partes de vigías engañados por la explicación fluida, y todos asienten con sinceridad y sin saber.' },
  { a: 'Apuntar la predicción y mirar la brecha.', b: 'Estudiar sin registro y fiarse de la memoria del vigía.', ga: 'Caso A: en un mes la casa sabe quién es optimista, en qué materia y por cuánto, y el timón lo descuenta.', gb: 'Caso B: el vigía nunca se entera de sus errores, y el mismo «ya me lo sé» falso vuelve cada semana.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se estudia releyendo, y el vigía factura la facilidad como saber.', guide: 'El parte falso llega al timón, la decisión razonable se toma sobre datos malos, y el hueco aparece en el examen: el lugar más caro y más tarde posible para descubrirlo.' },
  { cause: 'El timón cambia de técnica sin ninguna comprobación.', guide: 'Ninguna técnica llega a medirse, todas aburren antes de rendir, y al final de la hora la conclusión es «nada me funciona», que es falsa pero queda apuntada en la cabeza.' },
  { cause: 'Nadie apunta predicciones.', guide: 'No hay brecha que mirar, el vigía repite sus sesgos intactos, y cada semana se vuelve a pagar el mismo error como si fuera nuevo.' },
  { cause: 'La sesión se califica por la sensación al terminarla.', guide: 'Las tardes cómodas se premian y las tardes fértiles e incómodas se castigan, así que el timón aprende a elegir exactamente las técnicas que menos rinden.' },
  { cause: 'La pregunta de cierre del aula mide asentimiento.', guide: 'La maestra sale con partes falsos de treinta vigías, reexplica lo que no hacía falta y deja intacto el hueco real, que aparece completo el día del examen.' },
  { cause: 'Se optimizan los XP en vez del dominio.', guide: 'La barra se llena, el indicador deja de significar, y el día de la evaluación con material cerrado la brecha entre barra y cabeza sale a cobrar entera.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'El examen dejó de dar sorpresas: lo que el vigía decía, salía.', guide: 'Cada «ya me lo sé» se comprobó con el cuaderno cerrado antes de darlo por bueno, y el repaso siempre empezó por lo que la hoja en blanco desmintió.' },
  { effect: 'Angelly se quedó con una técnica y empezó a rendirle.', guide: 'Antes de cada cambio se pidió una comprobación pequeña. La técnica que rendía se quedó aunque aburriera, y el aburrimiento se le pasó al ver la brecha encoger.' },
  { effect: 'La familia sabe quién es optimista, en qué materia y por cuánto.', guide: 'Cuatro columnas durante un mes: predicción, fecha, resultado, brecha. Nadie mejoró la puntería la primera semana, y no hacía falta: la meta era ver el sesgo.' },
  { effect: 'La maestra supo qué reexplicar antes del examen.', guide: 'Cambió el «¿entendieron?» por «cierren el cuaderno y escríbanme los dos pasos». Cinco minutos de producción con material cerrado le dijeron lo que treinta asentimientos escondían.' },
  { effect: 'El curso de L 3,500 se declinó sin pelear.', guide: 'Se hizo la pregunta única: ¿en qué minuto el alumno produce la respuesta con el material cerrado? La respuesta fue el silencio de siempre, y con eso alcanzó.' },
  { effect: 'La barra de XP volvió a significar algo.', guide: 'Se acordó en familia qué mide cada indicador: XP el recorrido, la evaluación el dominio. Engañar la barra dejó de ser gracia cuando quedó claro a quién se engañaba.' },
]);

/* ---------- línea de tiempo: los siete momentos ---------- */
B.timelineData = JSON.stringify([
  { y: '1', icon: '🗺️', label: 'El plan', text: 'Antes de abrir el cuaderno: <strong>qué toca y con qué técnica</strong>. Es la primera decisión del timón. <strong>Se cae:</strong> cuando el plan lo decide la costumbre («siempre empiezo releyendo») y no un dato de la semana pasada.' },
  { y: '2', icon: '📝', label: 'La predicción', text: 'El parte del vigía <strong>por escrito y antes de empezar</strong>: «voy a poder reproducir tanto». <strong>Sirve para:</strong> tener con qué comparar después. <strong>Se cae:</strong> no apuntándola, que es lo normal y por eso casi nadie tiene registro.' },
  { y: '3', icon: '🏗️', label: 'El estudio', text: 'El nivel objeto hace <strong>el trabajo</strong>: lee, resuelve, memoriza. <strong>Ojo:</strong> este momento produce la nota, pero cuánto rinde cada hora lo deciden los otros seis. Estudiar más no arregla lo que la vigilancia hace mal.' },
  { y: '4', icon: '🔭', label: 'El parte del vigía', text: 'A mitad de sesión: <strong>«¿cómo voy?»</strong>. <strong>La pregunta clave:</strong> ¿de dónde sale este parte? Si sale de producir con el material cerrado, vale. Si sale de que el texto corre fácil, es la falla habitual en camino.' },
  { y: '5', icon: '⚓', label: 'La decisión del timón', text: '<strong>Seguir, cambiar de técnica o parar.</strong> Ninguna es mala en sí: son malas sin parte comprobado. <strong>Regla de la casa:</strong> el timón no gira sin dato; cambiar por aburrimiento es un volantazo.' },
  { y: '6', icon: '📄', label: 'La comprobación', text: 'Al final: <strong>cuaderno cerrado, hoja en blanco, reproducir</strong>. Es la única lectura fiable del propio saber. <strong>Se cae:</strong> saltándosela porque la sensación ya dijo que todo está bien, que es exactamente cuando más hace falta.' },
  { y: '7', icon: '📏', label: 'La brecha', text: 'Lo predicho contra lo que salió, <strong>apuntado en el registro</strong>. <strong>La meta:</strong> brecha vista, no brecha cero. Este momento alimenta el plan de la próxima sesión, y así el círculo se cierra: el vigía de hoy entrena al de mañana.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  niveles: {
    nombre: 'Los dos pisos', icon: '🏗️',
    estructura: { title: 'Qué es', info: '• El mapa de <strong>Nelson y Narens (1990)</strong><br>• Abajo, el <strong>nivel objeto</strong>: lee, resuelve, memoriza<br>• Arriba, el <strong>metanivel</strong>: vigila el trabajo y decide sobre él' },
    funcion: { title: 'Cómo se reconoce', info: '• Pregunta de bolsillo: ¿esta frase <strong>hace la tarea</strong> o <strong>habla de la tarea</strong>?<br>• «Resuelvo la división»: piso de abajo<br>• «Voy mal en divisiones»: piso de arriba' },
    enfermedades: { title: 'Dónde se cae', info: '• Creyendo que estudiar es <strong>solo el piso de abajo</strong><br>• Echándole horas al trabajo cuando la falla está en la vigilancia<br>• Confundiendo los dos oficios de arriba: el parte no es la decisión' },
    cuidados: { title: 'En esta casa', info: '• Toda sesión se relata <strong>con el vocabulario de los dos pisos</strong><br>• La hoja del vigía separa qué fue monitoreo y qué fue control<br>• Y la nota se explica mirando los dos, no solo las horas' },
  },
  vigia: {
    nombre: 'El vigía (monitoreo)', icon: '🔭',
    estructura: { title: 'Qué es', info: '• La corriente que <strong>sube</strong>: información de cómo va el trabajo<br>• «¿Cuánto sé?», «esto está flojo», «ya me lo sé»<br>• Todo parte del vigía <strong>puede ser falso</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Un parte vale por <strong>su origen</strong>, no por su fuerza<br>• De producir con el material cerrado: <strong>vale</strong><br>• De la facilidad de tener el material delante: <strong>no vale</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• La <strong>fluidez</strong>: el texto corre fácil y se factura como saber<br>• El <strong>«me suena»</strong>: reconocer no es recordar<br>• Las <strong>horas</strong>: «lo leí tres veces» mide esfuerzo, no resultado' },
    cuidados: { title: 'En esta casa', info: '• El «ya me lo sé» <strong>no se discute: se comprueba</strong><br>• Cuaderno cerrado, hoja en blanco, reproducir<br>• Y el parte comprobado se apunta, porque entrena al vigía de mañana' },
  },
  timon: {
    nombre: 'El timón (control)', icon: '⚓',
    estructura: { title: 'Qué es', info: '• La corriente que <strong>baja</strong>: decisiones sobre el trabajo<br>• Las tres clásicas: <strong>seguir, cambiar de técnica, abandonar</strong><br>• También: qué repasar primero, cuándo parar, cómo repartir la hora' },
    funcion: { title: 'Cómo se reconoce', info: '• Toda frase que <strong>cambia lo que se hace</strong> es del timón<br>• La pregunta de auditoría: ¿esta decisión <strong>con qué dato</strong> se tomó?<br>• Con parte comprobado: gobierno. Sin parte: volantazo' },
    enfermedades: { title: 'Dónde se cae', info: '• Cambiando de técnica <strong>por aburrimiento</strong><br>• Repasando lo que <strong>se siente</strong> flojo sin comprobar nada<br>• Parando cuando lo decide <strong>el sueño</strong> y no una regla' },
    cuidados: { title: 'En esta casa', info: '• El timón <strong>no gira sin parte</strong>: comprobación pequeña antes de cambiar<br>• La técnica que rinde se queda <strong>aunque aburra</strong><br>• Y la regla de parada se escribe antes de empezar la sesión' },
  },
  brecha: {
    nombre: 'La brecha y el registro', icon: '📏',
    estructura: { title: 'Qué es', info: '• La diferencia entre <strong>lo predicho y lo que salió</strong><br>• Vive en el registro: <strong>predicción, fecha, resultado, brecha</strong><br>• Es el dato con que el vigía aprende de sus errores' },
    funcion: { title: 'Cómo se reconoce', info: '• Antes de la prueba se apunta el parte: «creo que saco tanto»<br>• Después se apunta lo real, <strong>sin maquillar</strong><br>• La resta de los dos es la brecha, y se mira por semanas' },
    enfermedades: { title: 'Dónde se cae', info: '• No apuntando la predicción, <strong>que es lo normal</strong><br>• Apuntando solo cuando se acierta, que arruina el dato<br>• Buscando brecha cero, cuando la meta es <strong>brecha vista</strong>' },
    cuidados: { title: 'En esta casa', info: '• Dos líneas por prueba, <strong>cuatro columnas</strong>, y nada más<br>• La meta de la primera semana: descubrir <strong>el sesgo de cada quien</strong><br>• Este registro lo heredan la etapa 6 y la materia de predicción del Estudio Mayor' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Estudia a ciegas 🌫️' },
  { t: 25, n: 'Nombra los dos pisos 🏗️' },
  { t: 55, n: 'Separa el vigía del timón ⚓' },
  { t: 90, n: 'Audita el origen del parte 🔭' },
  { t: 130, n: 'Comprueba a cuaderno cerrado 📄' },
  { t: 165, n: 'Apunta la brecha sin maquillar 📏' },
  { t: 190, n: 'Vigila su propio estudio 🪞' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de los dos pisos superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario del vigía explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de partes y decisiones experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del estudio maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del vigía' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta de la Máquina que se Mira completada' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_espejo_vigia_v1';");

src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se busca el parte del vigía y se le pregunta el origen: si salió de producir la respuesta con el material cerrado, vale; si salió de la facilidad de releer, de reconocer la página o de contar las horas invertidas, no vale, por fuerte y sincera que sea la sensación. Después se mira la decisión del timón sabiendo que casi siempre es razonable con el dato que tiene, así que el diagnóstico nunca es regañar la decisión sino auditar el dato. Luego se hace la comprobación que falte, que es una sola y siempre la misma: cerrar el material, tomar una hoja en blanco y reproducir, porque el que puede producir sabe y el que solo reconoce todavía no. Y al final se apuntan las dos líneas del registro, predicción y resultado con su brecha, porque la meta de esta casa no es acertar sino ver el sesgo propio, y el sesgo visto se descuenta mientras que el invisible se paga en el examen.";');

/* ---------- lo que arrastra el molde (la etapa 3 de la Ley) ---------- */
const textos = [
  [/🎭 \*Ruta de la Ley y sus Grietas · Etapa 3\* 🎭\\n\\nLos derechos y la coletilla que los devuelve: qué da un artículo, qué le viene detrás y quién llena las palabras que nadie define\. 🎭\\n\\n_Incluye evaluación conceptual y el derecho sobre la mesa\._ ✍️/g,
    '🪞 *Ruta de la Máquina que se Mira · Etapa 1* 🪞\\n\\nEl vigía y el timón: el piso que estudia, el piso que vigila, y por qué la gente decide bien sobre datos malos. 🪞\\n\\n_Incluye evaluación conceptual y la sesión sobre la mesa._ ✍️'],
  [/Los derechos y la coletilla · Ruta de la Ley y sus Grietas/g, 'El vigía y el timón · Ruta de la Máquina que se Mira'],
  [/Etapa 3 · Derecho y Ley/g, 'Etapa 1 · Estudio Mayor'],
  [/El derecho sobre la mesa/g, 'La sesión sobre la mesa'],
  [/el derecho sobre la mesa/g, 'la sesión sobre la mesa'],
  [/completó la Etapa 3 de la Ruta de la Ley y sus Grietas \(Los derechos y la coletilla\)/g,
    'completó la Etapa 1 de la Ruta de la Máquina que se Mira (El vigía y el timón)'],
  [/const msgs=\['¡Sigue estudiando tu sistema!','¡Muy buen trabajo!','¡Excelente gestor en formación!','¡Sabes por dónde se mueve esto!','¡Estratega institucional!'\]/,
    "const msgs=['¡Sigue mirando tu estudio!','¡Muy buen trabajo!','¡Vigía en entrenamiento!','¡Ya separas el parte de la decisión!','¡Auditor del propio estudio!']"],
  [/\['#3b3a86','#5b5ac9','#b8860b','#d4a017','#00b894'\]/, "['#4338ca','#818cf8','#94a3b8','#d4a017','#00b894']"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa 3 era el derecho invocado a medias. Aquí es la
   noche antes del examen: el parte del vigía, confiado o comprobado. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(comprobo){sfx(comprobo?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(comprobo){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">📝</span><span class="ms-text"><strong>Cerraste el cuaderno y escribiste lo que sabías:</strong> salieron dos huecos que la relectura no había enseñado. El parte decía «todo», y la hoja en blanco dijo «casi todo».</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">⚓</span><span class="ms-text"><strong>El timón decidió con datos:</strong> diez minutos sobre los dos huecos, la brecha apuntada en el registro, y a dormir con el parte confirmado. El examen no dio ninguna sorpresa.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">😴</span><span class="ms-text"><strong>Confiaste en la sensación:</strong> era fuerte y era sincera. También salía de la facilidad de releer, que es exactamente el origen que no vale.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📄</span><span class="ms-text"><strong>El examen pidió producir, no reconocer:</strong> los huecos aparecieron delante de la hoja, que es el lugar más caro para descubrirlos. La decisión de dormir era razonable; el parte era falso, y nadie lo auditó.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='niveles',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"niveles\"]')?.classList.add('active-pri');");

/* Las preguntas de las secciones de la prueba competencial venían de la
   etapa 3 de la Ley. Aquí preguntan por el parte y la decisión. */
src = src.replace(/¿Qué da el artículo y qué le viene detrás, hay alguna palabra que el texto no defina, y esa coletilla recorta o protege\? Explica qué pides por escrito y qué guardas del intercambio\./g,
  '¿Qué parte subió el vigía y de dónde salió, qué decidió el timón y con qué dato, y dónde está el parte falso con la pista que lo fabricó? Explica qué compruebas a cuaderno cerrado y qué apuntas en el registro.');
src = src.replace(/1\. ¿Cuál de los dos deja al otro con la carga de decir en qué se basa\? 2\. ¿Por qué no son la misma decisión\?/g,
  '1. ¿Cuál de los dos comprueba el parte antes de decidir? 2. ¿Por qué no son la misma decisión?');

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/🎭/g, '🪞');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
