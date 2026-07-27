/* Inyecta los bancos de la misión «Los datos de los demás» (Ruta de la Casa
   Cerrada, etapa 2) sobre el molde copiado de la misión del presupuesto.
   Uso:  node _dev/inyecta-bancos-datos.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-casa-cerrada-datos', 'js', 'datos.js');

let _semilla = 20240727;
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
B.SAVE_KEY = `'faro_cib_datos_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de los datos ajenos superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del manejo de datos explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de dato que identifica y agregado experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del manejo maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de los datos' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta de la Casa Cerrada completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Guarda todo por si acaso 📦' },
  { t: 25, n: 'Distingue lo que identifica 🪪' },
  { t: 55, n: 'Pide el mínimo ✂️' },
  { t: 90, n: 'Sabe quién ve qué 👀' },
  { t: 130, n: 'Le pone fecha de borrado ⏱️' },
  { t: 165, n: 'Tiene plan si se filtra 🚨' },
  { t: 190, n: 'Responde por lo que guarda 🛡️' },
]);

B.fcData = JSON.stringify([
  { w: 'Dato que identifica', a: '🪪 El que permite llegar a <strong>una persona concreta</strong>: nombre y apellido, correo, teléfono, foto, o la combinación de escuela, grado y sección. Se guarda solo si hace falta y se borra cuando deja de servir.' },
  { w: 'Dato agregado', a: '📊 El que habla de <strong>un grupo</strong>: «22 estudiantes de sexto completaron la misión en marzo». Sirve igual para decidir, no identifica a nadie y se puede compartir sin miedo.' },
  { w: 'Finalidad', a: '🎯 El para qué, escrito <strong>en una línea concreta</strong>. «Por si acaso» y «para estadísticas» no son finalidades: son la forma en que se acumula lo que después se filtra.' },
  { w: 'Minimización', a: '✂️ Quedarse con <strong>el mínimo que cumple la finalidad</strong>. Se quitan campos hasta que deja de cumplirse y se para justo antes. El dato que no se guarda no se puede perder.' },
  { w: 'Consentimiento', a: '📝 Un menor no autoriza: <strong>autoriza su familia</strong>, y para algo concreto, no un permiso general para siempre. Quien autorizó puede cambiar de opinión cuando quiera.' },
  { w: 'Plazo de borrado', a: '⏱️ Toda pieza de dato nace con <strong>fecha o condición de borrado</strong>. Un dato sin caducidad se queda para siempre y algún día lo hereda alguien que no sabe qué es.' },
  { w: 'Control de acceso', a: '👀 Quién puede ver cada dato, <strong>con nombre y cargo</strong>, no «el equipo» ni «los maestros». Si no se puede nombrar a la persona, es que nadie está respondiendo por eso.' },
  { w: 'Incidente', a: '🚨 Lo que se hace cuando algo se filtra: a quién se avisa, en qué orden y en cuánto tiempo. Se escribe <strong>antes</strong>, porque el día que pasa nadie está en condiciones de improvisar.' },
  { w: 'Seudonimizar', a: '🔢 Cambiar el nombre por un identificador que solo la escuela sabe traducir. El proyecto puede contar y medir, y <strong>aun con toda la base robada</strong> no se sabe de quién es cada fila.' },
  { w: 'Dato en el aparato', a: '📱 Lo que se guarda solo en el teléfono y <strong>nunca viaja a un servidor</strong>. Es el único dato que no se puede filtrar desde el servidor, porque nunca estuvo ahí.' },
  { w: 'La copia también es un sitio', a: '💾 Un respaldo contiene lo mismo que la base de datos. Sin cifrar, es la base entera regalada, y encima <strong>nadie se entera</strong> de que se la llevaron.' },
  { w: 'Copia oculta', a: '📧 Cuando hay varios destinatarios que no se conocen entre sí, sus correos van en copia oculta. Un campo mal elegido es <strong>una filtración completa</strong> y no hay forma de recogerla.' },
  { w: 'Derecho a que se borre', a: '🚪 Una familia puede pedir que se borre todo lo de su hija, y se borra, se confirma con fecha y <strong>no se pregunta el motivo</strong>. Es el mejor examen del inventario.' },
  { w: 'Inventario de datos', a: '📋 La lista de todo lo que el proyecto guarda de otras personas, campo por campo, con su finalidad, su dueño de acceso y su fecha de borrado. Sin él, lo demás es una intención.' },
  { w: 'La duda hacia el no', a: '🛡️ Con menores, cuando no está claro si se puede, <strong>no se puede</strong>. El daño de una filtración no lo paga quien la causó: lo paga un niño que no eligió nada de esto.' },
  { w: 'Ocultarlo cuesta más', a: '📣 Una filtración contada a tiempo se perdona; una descubierta después, no. Avisar, decir qué pasó y qué se cambió es más barato que cualquier intento de que no se note.' },
]);

B.qzData = JSON.stringify([
  { q: '¿De quién son los datos de un niño que usa M.E.T.A.S?', o: ['a) Del proyecto que los guarda', 'b) Suyos y de su familia, prestados al proyecto', 'c) De la escuela', 'd) De quien los recogió'], c: 1 },
  { q: '«22 estudiantes de sexto completaron la misión» es un dato…', o: ['a) Agregado', 'b) Que identifica', 'c) Sensible', 'd) Sin finalidad'], c: 0 },
  { q: '¿Qué es minimizar?', o: ['a) Guardar los datos comprimidos', 'b) Borrar todo cada mes', 'c) Quedarse con el mínimo que cumple la finalidad', 'd) Pedir permiso a menos personas'], c: 2 },
  { q: 'Un menor quiere aparecer en una foto pública. ¿Quién autoriza?', o: ['a) Él mismo si está de acuerdo', 'b) La maestra que tomó la foto', 'c) El director del centro', 'd) Su madre, su padre o quien lo tenga a cargo'], c: 3 },
  { q: 'Mandar treinta correos con todos en el campo «Para» es…', o: ['a) Una filtración de datos', 'b) Un descuido sin consecuencias', 'c) Lo normal en avisos escolares', 'd) Aceptable si son padres del mismo grado'], c: 0 },
  { q: '¿Cuándo se decide la fecha de borrado de un dato?', o: ['a) Cuando ya no se usa', 'b) Al guardarlo por primera vez', 'c) Cuando alguien lo pide', 'd) Al final del año escolar'], c: 1 },
  { q: 'Una empresa ofrece una función gratis a cambio de datos de uso de estudiantes. ¿Qué se contesta?', o: ['a) Que sí, porque no hay dinero de por medio', 'b) Que sí, si prometen cuidarlos', 'c) Solo con datos agregados y sin identificadores, por escrito', 'd) Que sí, y se avisa después a las familias'], c: 2 },
  { q: 'El respaldo de la base de datos en un teléfono sin clave…', o: ['a) Está bien si el teléfono tiene patrón', 'b) Es la base de datos entera expuesta', 'c) No cuenta como dato guardado', 'd) Solo importa si es reciente'], c: 1 },
  { q: 'Una familia pide borrar los datos de su hija. ¿Qué se hace?', o: ['a) Se borran y se confirma por escrito con la fecha', 'b) Se pide que expliquen el motivo', 'c) Se borran al final del año', 'd) Se conservan por si el centro los necesita'], c: 0 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saberse los términos de memoria', 'b) Tener contraseña en todo', 'c) No guardar ningún dato nunca', 'd) Poder decir de cada dato para qué está, quién lo ve y cuándo se borra'], c: 3 },
]);

B.classGroups = JSON.stringify([
  { label: ['Identifica', 'Agregado'], headA: '🪪 Identifica', headB: '📊 Agregado', colA: 'ok', colB: 'no',
    words: [{ w: 'Nombre y apellido del estudiante', t: 'ok' }, { w: '22 de sexto terminaron la misión', t: 'no' },
      { w: 'El correo de la madre', t: 'ok' }, { w: 'El 60% usó la ficha impresa', t: 'no' },
      { w: 'La foto con la cara', t: 'ok' }, { w: 'Tres centros activos en marzo', t: 'no' },
      { w: 'Escuela, grado y sección juntos', t: 'ok' }, { w: 'Promedio de la sección', t: 'no' }] },
  { label: ['Mínimo', 'De más'], headA: '✂️ Mínimo necesario', headB: '📦 De más', colA: 'ok', colB: 'no',
    words: [{ w: 'Grado y fecha para medir uso', t: 'ok' }, { w: 'Nombre completo para medir uso', t: 'no' },
      { w: 'Nombre de pila para la constancia', t: 'ok' }, { w: 'Dirección de la casa', t: 'no' },
      { w: 'Un identificador que traduce la escuela', t: 'ok' }, { w: 'Teléfono del estudiante', t: 'no' },
      { w: 'Conteo por sección', t: 'ok' }, { w: 'Fecha de nacimiento completa', t: 'no' }] },
  { label: ['Se comparte', 'Nunca'], headA: '✅ Se puede compartir', headB: '🚫 No sale de aquí', colA: 'ok', colB: 'no',
    words: [{ w: 'El conteo por grado', t: 'ok' }, { w: 'El listado con nombres', t: 'no' },
      { w: 'La foto de las manos y la pantalla', t: 'ok' }, { w: 'La foto con caras sin permiso', t: 'no' },
      { w: 'El número de centros activos', t: 'ok' }, { w: 'Los correos de los padres', t: 'no' },
      { w: 'El porcentaje que completó la misión', t: 'ok' }, { w: 'Las notas con nombre y apellido', t: 'no' }] },
  { label: ['Baja el riesgo', 'Lo sube'], headA: '🛡️ Baja el riesgo', headB: '⚠️ Lo sube', colA: 'ok', colB: 'no',
    words: [{ w: 'Guardar el nombre solo en el teléfono', t: 'ok' }, { w: 'Mandar la lista por WhatsApp', t: 'no' },
      { w: 'Cifrar la copia de seguridad', t: 'ok' }, { w: 'Guardar «por si acaso»', t: 'no' },
      { w: 'Poner fecha de borrado', t: 'ok' }, { w: 'Hacer una copia más de la lista', t: 'no' },
      { w: 'Usar copia oculta en los avisos', t: 'ok' }, { w: 'Dar acceso a «los maestros» en general', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['El', 'dato', 'agregado', 'no', 'identifica', 'a', 'nadie.'], c: 2, art: 'El que se puede compartir' },
  { s: ['Minimizar', 'es', 'quedarse', 'con', 'lo', 'necesario.'], c: 0, art: 'Quitar campos hasta el límite' },
  { s: ['La', 'finalidad', 'se', 'escribe', 'en', 'una', 'línea.'], c: 1, art: 'El para qué de cada dato' },
  { s: ['Todo', 'dato', 'nace', 'con', 'fecha', 'de', 'borrado.'], c: 4, art: 'Lo que evita que se quede para siempre' },
  { s: ['El', 'consentimiento', 'de', 'un', 'menor', 'lo', 'da', 'su', 'familia.'], c: 1, art: 'El permiso que hace falta' },
  { s: ['La', 'copia', 'de', 'seguridad', 'también', 'es', 'un', 'sitio.'], c: 1, art: 'El respaldo que nadie protege' },
  { s: ['Seudonimizar', 'cambia', 'el', 'nombre', 'por', 'un', 'código.'], c: 0, art: 'Medir sin saber de quién es' },
  { s: ['Un', 'incidente', 'se', 'avisa,', 'no', 'se', 'oculta.'], c: 1, art: 'Lo que pasa cuando algo se filtra' },
]);

B.cmpData = JSON.stringify([
  { s: 'El dato que permite llegar a una persona concreta es el que ___.', opts: ['identifica', 'agrega', 'resume'], c: 0 },
  { s: 'El dato que habla de un grupo y no de nadie es el dato ___.', opts: ['agregado', 'personal', 'sensible'], c: 0 },
  { s: 'Quedarse con lo mínimo que cumple la finalidad es ___.', opts: ['minimizar', 'comprimir', 'ordenar'], c: 0 },
  { s: 'El permiso de un menor lo da su ___.', opts: ['familia', 'maestra', 'escuela'], c: 0 },
  { s: 'Todo dato nace con fecha de ___.', opts: ['borrado', 'revisión', 'copia'], c: 0 },
  { s: 'Cambiar el nombre por un código que otro traduce es ___.', opts: ['seudonimizar', 'cifrar', 'agregar'], c: 0 },
  { s: 'Con menores, la duda se resuelve hacia el ___.', opts: ['no', 'sí', 'quizá'], c: 0 },
  { s: 'Lo que no se guarda no se puede ___.', opts: ['perder', 'medir', 'contar'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Identifica', 'Agregado'], btnA: '🪪 Identifica', btnB: '📊 Agregado', colA: 'ok', colB: 'no',
    words: [{ w: 'Nombre y apellido', t: 'ok' }, { w: '22 de sexto', t: 'no' }, { w: 'Correo de la madre', t: 'ok' },
      { w: 'El 60% usó la ficha', t: 'no' }, { w: 'Foto con la cara', t: 'ok' }, { w: 'Tres centros activos', t: 'no' },
      { w: 'Teléfono de contacto', t: 'ok' }, { w: 'Promedio de la sección', t: 'no' },
      { w: 'Escuela, grado y sección', t: 'ok' }, { w: 'Total de misiones abiertas', t: 'no' }] },
  { label: ['Se comparte', 'Nunca'], btnA: '✅ Se comparte', btnB: '🚫 Nunca', colA: 'ok', colB: 'no',
    words: [{ w: 'El conteo por grado', t: 'ok' }, { w: 'El listado con nombres', t: 'no' },
      { w: 'Foto de manos y pantalla', t: 'ok' }, { w: 'Foto con caras sin permiso', t: 'no' },
      { w: 'Número de centros', t: 'ok' }, { w: 'Correos de los padres', t: 'no' },
      { w: 'Porcentaje que completó', t: 'ok' }, { w: 'Notas con nombre', t: 'no' },
      { w: 'Misiones más usadas', t: 'ok' }, { w: 'La base de datos entera', t: 'no' }] },
  { label: ['Baja riesgo', 'Sube riesgo'], btnA: '🛡️ Baja', btnB: '⚠️ Sube', colA: 'ok', colB: 'no',
    words: [{ w: 'Guardar solo en el teléfono', t: 'ok' }, { w: 'Mandar la lista por WhatsApp', t: 'no' },
      { w: 'Cifrar el respaldo', t: 'ok' }, { w: 'Guardar por si acaso', t: 'no' },
      { w: 'Fecha de borrado escrita', t: 'ok' }, { w: 'Una copia más de la lista', t: 'no' },
      { w: 'Copia oculta en los avisos', t: 'ok' }, { w: 'Acceso para «el equipo»', t: 'no' },
      { w: 'Seudonimizar la base', t: 'ok' }, { w: 'Pedir la fecha de nacimiento', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se decide guardar un dato', steps: ['Escribir en una línea para qué se necesita', 'Quitar campos hasta quedarse con el mínimo que sirve', 'Decidir quién lo ve, con nombre y cargo', 'Ponerle fecha o condición de borrado', 'Anotarlo en el inventario de datos', 'Revisar el inventario una vez al año y borrar lo vencido'] },
  { label: 'Qué se hace cuando llega una petición de datos', steps: ['Preguntar para qué se van a usar', 'Ver si el conteo agregado cumple la misma finalidad', 'Si hace falta con nombres, comprobar quién autoriza', 'Mandar lo mínimo y por un canal que no deje copias sueltas', 'Apuntar qué se envió, a quién y con qué fecha'] },
  { label: 'Qué se hace si algo se filtra', steps: ['Cortar el acceso: cambiar claves de todo lo que ese aparato o cuenta podía abrir', 'Averiguar qué datos salieron exactamente y de cuántas personas', 'Avisar a las familias afectadas, sin adornos', 'Escribir qué se cambió para que no vuelva a pasar', 'Guardar el registro del incidente con su fecha'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Permite llegar a una persona concreta', ans: 'Dato que identifica', opts: ['Dato que identifica', 'Dato agregado', 'Finalidad', 'Plazo de borrado'] },
  { desc: 'Habla de un grupo y no señala a nadie', ans: 'Dato agregado', opts: ['Dato agregado', 'Dato que identifica', 'Consentimiento', 'Incidente'] },
  { desc: 'El para qué, escrito en una línea concreta', ans: 'Finalidad', opts: ['Finalidad', 'Minimización', 'Acceso', 'Inventario'] },
  { desc: 'Quedarse con el mínimo de campos que sirve', ans: 'Minimización', opts: ['Minimización', 'Seudonimización', 'Plazo de borrado', 'Consentimiento'] },
  { desc: 'Quién puede ver el dato, con nombre y cargo', ans: 'Control de acceso', opts: ['Control de acceso', 'Finalidad', 'Incidente', 'Dato agregado'] },
  { desc: 'La fecha o condición con la que el dato se elimina', ans: 'Plazo de borrado', opts: ['Plazo de borrado', 'Consentimiento', 'Minimización', 'Inventario'] },
  { desc: 'Cambiar el nombre por un código que otro sabe traducir', ans: 'Seudonimización', opts: ['Seudonimización', 'Minimización', 'Dato agregado', 'Copia oculta'] },
  { desc: 'Lo que se hace cuando algo se filtra, escrito de antemano', ans: 'Plan de incidente', opts: ['Plan de incidente', 'Inventario de datos', 'Control de acceso', 'Finalidad'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Saber si la misión de fracciones funcionó en sexto', func: 'Grado, fecha y si se completó, sin nombres', opts: ['Grado, fecha y si se completó, sin nombres', 'Nombre completo y sección de cada estudiante', 'Correo del padre para preguntarle', 'La lista con notas de todo el grado'] },
  { trans: 'Poner el nombre en la constancia de una misión', func: 'El nombre de pila, guardado solo en el teléfono', opts: ['El nombre de pila, guardado solo en el teléfono', 'Nombre y apellido en el servidor', 'Nombre, escuela y grado', 'El número de identidad'] },
  { trans: 'Enseñar que las misiones se usan de verdad en un aula', func: 'Una foto de las manos y la pantalla, sin caras', opts: ['Una foto de las manos y la pantalla, sin caras', 'Una foto del grupo mirando a la cámara', 'Un vídeo con los nombres en pantalla', 'La lista de quiénes participaron'] },
  { trans: 'Avisar de una actividad a treinta familias', func: 'Un correo con los destinatarios en copia oculta', opts: ['Un correo con los destinatarios en copia oculta', 'Un correo con todos en el campo Para', 'Un grupo de WhatsApp con todos los números', 'Una lista publicada en el sitio'] },
  { trans: 'Medir cuántos centros siguen activos este mes', func: 'El número de centros, sin decir cuáles ni quiénes', opts: ['El número de centros, sin decir cuáles ni quiénes', 'El nombre de cada centro y su director', 'La lista de maestros por centro', 'Los correos de contacto de cada escuela'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Los correos de treinta padres quedaron visibles para todos', characteristic: 'Se usó el campo Para en vez de copia oculta', opts: ['Se usó el campo Para en vez de copia oculta', 'El servidor de correo falló', 'Alguien reenvió el mensaje', 'La lista estaba desactualizada'] },
  { disease: 'Se perdió un teléfono y con él la base de datos entera', characteristic: 'La copia de seguridad estaba sin cifrar', opts: ['La copia de seguridad estaba sin cifrar', 'El teléfono no tenía patrón', 'La base era demasiado grande', 'Faltaba respaldo en la nube'] },
  { disease: 'Una familia pidió borrar los datos de su hija y no se pudo', characteristic: 'Nunca hubo inventario: no se sabía dónde estaba cada dato', opts: ['Nunca hubo inventario: no se sabía dónde estaba cada dato', 'La petición llegó tarde', 'El sistema no tiene botón de borrar', 'Los datos eran necesarios'] },
  { disease: 'Salieron a internet las caras de una sección entera', characteristic: 'Se publicó con el permiso de la maestra y no de las familias', opts: ['Se publicó con el permiso de la maestra y no de las familias', 'La foto tenía mala calidad', 'Se publicó en la red equivocada', 'Faltó etiquetar el centro'] },
  { disease: 'Una empresa terminó con datos de uso de menores', characteristic: 'Se aceptó una función gratis a cambio de datos identificables', opts: ['Se aceptó una función gratis a cambio de datos identificables', 'La empresa incumplió el contrato', 'Los datos se enviaron por error', 'Faltó leer los términos'] },
  { disease: 'Nadie supo qué hacer el día que se filtró algo', characteristic: 'El plan de incidente no estaba escrito antes', opts: ['El plan de incidente no estaba escrito antes', 'La filtración fue muy grande', 'No había quién respondiera el teléfono', 'Se descubrió demasiado tarde'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Permite llegar a una persona concreta.', type: 'Dato que identifica' },
  { s: 'Habla de un grupo y no señala a nadie.', type: 'Dato agregado' },
  { s: 'El para qué, escrito en una línea.', type: 'Finalidad' },
  { s: 'Quedarse con el mínimo de campos que sirve.', type: 'Minimización' },
  { s: 'Quién puede ver el dato, con nombre y cargo.', type: 'Control de acceso' },
  { s: 'La fecha con la que el dato se elimina.', type: 'Plazo de borrado' },
  { s: 'Cambiar el nombre por un código que otro traduce.', type: 'Seudonimización' },
  { s: 'Lo que se hace si algo se filtra, escrito antes.', type: 'Plan de incidente' },
  { s: 'La lista de todo lo que el proyecto guarda de otros.', type: 'Inventario de datos' },
  { s: 'El permiso que da la familia, no el menor.', type: 'Consentimiento' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Nombre y apellido', gen: 'Dato', n: 'Persona', g: 'Identifica', t: 'Llega a alguien concreto' },
  { w: '22 de sexto completaron', gen: 'Dato', n: 'Grupo', g: 'Agregado', t: 'No señala a nadie' },
  { w: 'Correo de la madre', gen: 'Dato', n: 'Persona', g: 'Identifica', t: 'Llega a alguien concreto' },
  { w: 'Tres centros activos', gen: 'Dato', n: 'Grupo', g: 'Agregado', t: 'No señala a nadie' },
  { w: 'Grado y fecha para medir uso', gen: 'Cantidad', n: 'Justa', g: 'Mínimo', t: 'Cumple la finalidad' },
  { w: 'Fecha de nacimiento completa', gen: 'Cantidad', n: 'Sobra', g: 'De más', t: 'No hace falta para nada' },
  { w: 'Cifrar el respaldo', gen: 'Efecto', n: 'Protege', g: 'Baja el riesgo', t: 'Menos superficie expuesta' },
  { w: 'Mandar la lista por WhatsApp', gen: 'Efecto', n: 'Expone', g: 'Sube el riesgo', t: 'Copias que no se controlan' },
  { w: 'Fecha de borrado escrita', gen: 'Efecto', n: 'Protege', g: 'Baja el riesgo', t: 'El dato no se queda para siempre' },
  { w: 'Guardar por si acaso', gen: 'Efecto', n: 'Expone', g: 'Sube el riesgo', t: 'Sin finalidad no hay límite' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'El dato que llega a una persona concreta es el que ___.', opts: ['identifica', 'agrega', 'resume'], ans: 'identifica' },
  { s: 'El dato que habla de un grupo es el dato ___.', opts: ['agregado', 'personal', 'privado'], ans: 'agregado' },
  { s: 'Quedarse con lo mínimo que sirve es ___.', opts: ['minimizar', 'cifrar', 'agregar'], ans: 'minimizar' },
  { s: 'El permiso de un menor lo da su ___.', opts: ['familia', 'escuela', 'maestra'], ans: 'familia' },
  { s: 'Todo dato nace con fecha de ___.', opts: ['borrado', 'copia', 'revisión'], ans: 'borrado' },
  { s: 'Cambiar el nombre por un código es ___.', opts: ['seudonimizar', 'minimizar', 'agregar'], ans: 'seudonimizar' },
  { s: 'Con menores, la duda se resuelve hacia el ___.', opts: ['no', 'sí', 'después'], ans: 'no' },
  { s: 'Lo que no se guarda no se puede ___.', opts: ['perder', 'medir', 'usar'], ans: 'perder' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica la diferencia entre dato que identifica y dato agregado, y por qué casi todo se puede resolver con el segundo.', ans: 'El dato que identifica permite llegar a una persona concreta: nombre y apellido, correo, teléfono, foto, o la combinación de escuela, grado y sección, que juntas también señalan. El agregado habla de un grupo: «22 estudiantes de sexto completaron la misión en marzo». Casi todas las peticiones que llegan «con nombres» buscan en realidad saber si algo funcionó, y para eso el conteo sirve igual y no crea una copia más de datos personales. La pregunta educada cuando alguien insiste es: qué vas a hacer con los nombres que no puedas hacer con el conteo.' },
  { q: '¿Qué es minimizar y cómo se aplica al nombre en la constancia de una misión?', ans: 'Minimizar es quedarse con el mínimo de campos que todavía cumple la finalidad: se van quitando campos hasta que la finalidad deja de cumplirse y se para justo antes. En la constancia, la finalidad es que el estudiante vea su nombre en un papel bonito, y para eso basta el nombre de pila, escrito por él en el momento. Ni siquiera hace falta que ese dato salga del teléfono: si se arma la constancia en el aparato, el proyecto no se entera y no tiene nada que proteger. El dato que nunca viaja a un servidor es el único que no se puede filtrar desde el servidor.' },
  { q: '¿Quién autoriza el uso de datos o fotos de un menor, y qué límites tiene esa autorización?', ans: 'Un menor no autoriza: autoriza su madre, su padre o quien lo tenga a cargo. Y la autorización es para algo concreto, no un permiso general para siempre: que una familia acepte que su hija salga en el mural del aula no significa que acepte verla en una publicación pública de internet, y eso hay que preguntarlo por separado. Además, quien autorizó puede cambiar de opinión: si pide que se borre, se borra, se confirma por escrito con la fecha y no se le pregunta el motivo.' },
  { q: 'Una empresa ofrece añadir gratis una función de IA a cambio de los datos de uso de los estudiantes. ¿Qué se contesta y con qué condición?', ans: 'Mete una función vistosa y saca datos de menores hacia una empresa sobre la que el proyecto no manda y a la que las familias nunca autorizaron nada. Y lo que sale no se puede traer de vuelta. La condición con la que sí: datos agregados y sin identificadores, con un documento que diga qué reciben exactamente, para qué y por cuánto tiempo. Si eso no les sirve, la respuesta es no y no pasa nada: una función vistosa vale menos que la confianza de una maestra, que es lo que sostiene el proyecto.' },
  { q: 'Se perdió un teléfono que tenía el respaldo de la base de datos. ¿Qué falló y qué se hace?', ans: 'Falló olvidar que la copia de seguridad es un sitio más donde vive el dato: se protege el servidor y se deja el respaldo sin cifrar, y entonces es la base entera regalada, con el agravante de que nadie se entera de que se la llevaron. Lo que hay que tener escrito de antemano: dónde viven las copias, con qué clave están cifradas y quién la tiene. Y el plan de incidente empieza siempre igual: cambiar las claves de todo lo que ese aparato podía abrir, antes de averiguar nada más; después, saber qué datos salieron y de cuántas personas, avisar a las familias afectadas sin adornos, y escribir qué se cambió.' },
  { q: 'Escribe la política de una página de este proyecto: sus cinco puntos y por qué cada uno.', ans: '1) Qué se guarda: la lista completa de campos, sin «etcétera», porque lo que no está en la lista es lo que nadie revisa. 2) Para qué: una línea concreta por dato, porque «por si acaso» es como se acumula lo que después se filtra. 3) Quién lo ve: con nombre y cargo, no «el equipo», porque si no se puede nombrar a la persona es que nadie responde por eso. 4) Cuánto tiempo: una fecha o condición de borrado desde el primer día, porque un dato sin caducidad se queda para siempre. 5) Qué se hace si se filtra: a quién se avisa, en qué orden y en cuánto tiempo, escrito antes, porque el día que pasa nadie está en condiciones de improvisar.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['MINIMO', 'DATO', 'BORRAR', 'ACCESO', 'PLAZO', 'NINO']),
  haceSopa(10, ['AGREGADO', 'PERMISO', 'FAMILIA', 'COPIA', 'CLAVE', 'FUGA']),
  haceSopa(10, ['INVENTARIO', 'FINALIDAD', 'CIFRAR', 'OCULTA', 'AVISO', 'MENOR']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Los datos de un niño pertenecen al proyecto que los guarda.', a: false },
  { q: 'Un dato agregado no permite identificar a nadie.', a: true },
  { q: 'Escuela, grado y sección juntos pueden identificar a un estudiante.', a: true },
  { q: 'Minimizar es guardar los datos comprimidos.', a: false },
  { q: 'Un menor puede autorizar por sí mismo la publicación de su foto.', a: false },
  { q: 'La autorización de una familia sirve para siempre y para cualquier uso.', a: false },
  { q: 'Todo dato debe tener fecha o condición de borrado desde el primer día.', a: true },
  { q: 'Una copia de seguridad sin cifrar equivale a la base de datos expuesta.', a: true },
  { q: 'Mandar treinta correos en el campo Para es una filtración de datos.', a: true },
  { q: 'Si una familia pide borrar los datos de su hija hay que preguntarle el motivo.', a: false },
  { q: 'El dato que se guarda solo en el teléfono no se puede filtrar desde el servidor.', a: true },
  { q: 'Con menores, cuando hay duda sobre si se puede, se puede.', a: false },
  { q: 'Ocultar una filtración sale más barato que contarla.', a: false },
  { q: 'Seudonimizar permite medir sin saber de quién es cada fila.', a: true },
  { q: 'El control de acceso se define por grupos, no por personas con nombre.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿De quién son los datos de un menor?', o: ['a) Del proyecto', 'b) De la escuela', 'c) Suyos y de su familia', 'd) De quien los recogió'], a: 2 },
  { q: '«El 60% de sexto usó la ficha» es un dato…', o: ['a) Agregado', 'b) Que identifica', 'c) Sensible', 'd) Prohibido'], a: 0 },
  { q: 'Minimizar significa…', o: ['a) Comprimir los archivos', 'b) Quedarse con el mínimo que cumple la finalidad', 'c) Borrar cada mes', 'd) Pedir menos permisos'], a: 1 },
  { q: '¿Quién autoriza el uso de la foto de un niño?', o: ['a) El niño', 'b) La maestra', 'c) El director', 'd) Su familia, y para un uso concreto'], a: 3 },
  { q: 'Treinta correos en el campo «Para» es…', o: ['a) Un descuido sin consecuencias', 'b) Una filtración completa', 'c) Lo habitual y aceptable', 'd) Un problema solo si son menores'], a: 1 },
  { q: '¿Cuándo se define la fecha de borrado?', o: ['a) Al guardar el dato por primera vez', 'b) Cuando deja de usarse', 'c) Cuando alguien lo reclama', 'd) Nunca hace falta'], a: 0 },
  { q: 'Una empresa quiere datos de uso de estudiantes a cambio de una función. Se acepta…', o: ['a) Si prometen cuidarlos', 'b) Si no hay dinero de por medio', 'c) Solo agregados y sin identificadores, por escrito', 'd) Nunca, bajo ninguna forma'], a: 2 },
  { q: 'El respaldo sin cifrar en un teléfono perdido significa…', o: ['a) Nada, si tenía patrón', 'b) La base de datos entera expuesta', 'c) Solo pérdida de la copia', 'd) Un problema del fabricante'], a: 1 },
  { q: 'Ante una petición de borrado de una familia…', o: ['a) Se borra y se confirma con fecha', 'b) Se pide el motivo', 'c) Se espera al fin de año', 'd) Se consulta con el centro'], a: 0 },
  { q: 'Seudonimizar es…', o: ['a) Cifrar el disco', 'b) Borrar los nombres para siempre', 'c) Cambiar el nombre por un código que otro traduce', 'd) Publicar solo iniciales'], a: 2 },
  { q: '¿Cuál de estas cosas baja el riesgo?', o: ['a) Guardar por si acaso', 'b) Dar acceso a «el equipo»', 'c) Hacer una copia más de la lista', 'd) Poner fecha de borrado a cada dato'], a: 3 },
  { q: 'Para la constancia de una misión basta con…', o: ['a) El nombre de pila, guardado en el teléfono', 'b) Nombre y apellido en el servidor', 'c) Nombre, escuela y grado', 'd) El número de identidad'], a: 0 },
  { q: 'Al publicar que las misiones se usan en un aula, lo correcto es…', o: ['a) Una foto del grupo mirando a la cámara', 'b) Un vídeo con nombres en pantalla', 'c) La lista de participantes', 'd) Una foto de las manos y la pantalla'], a: 3 },
  { q: '¿Qué se hace primero cuando se pierde un aparato con datos?', o: ['a) Cambiar las claves de todo lo que podía abrir', 'b) Avisar a las familias', 'c) Buscar el aparato', 'd) Revisar los respaldos'], a: 0 },
  { q: 'La prueba de que esta etapa está aprendida es…', o: ['a) No guardar ningún dato', 'b) Tener contraseñas largas', 'c) Decir de cada dato para qué está, quién lo ve y cuándo se borra', 'd) Saberse la ley de memoria'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'El dato que llega a una persona concreta es el que ___.', a: 'identifica' },
  { q: 'El dato que habla de un grupo es el dato ___.', a: 'agregado' },
  { q: 'Quedarse con el mínimo que cumple la finalidad es ___.', a: 'minimizar' },
  { q: 'El para qué de un dato, en una línea, es su ___.', a: 'finalidad' },
  { q: 'El permiso sobre los datos de un menor lo da su ___.', a: 'familia' },
  { q: 'Todo dato nace con fecha de ___.', a: 'borrado' },
  { q: 'Cambiar el nombre por un código que otro traduce es ___.', a: 'seudonimizar' },
  { q: 'Cuando hay varios destinatarios que no se conocen se usa copia ___.', a: 'oculta' },
  { q: 'La lista de todo lo que se guarda de otros es el ___ de datos.', a: 'inventario' },
  { q: 'Lo que se hace si algo se filtra, escrito antes, es el plan de ___.', a: 'incidente' },
  { q: 'Con menores, la duda se resuelve hacia el ___.', a: 'no' },
  { q: 'Lo que no se guarda no se puede ___.', a: 'perder' },
  { q: 'Un respaldo se guarda ___ para que no sea la base regalada.', a: 'cifrado' },
  { q: 'El acceso se define con nombre y ___.', a: 'cargo' },
  { q: 'Una filtración se ___, porque ocultarla cuesta más.', a: 'avisa' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Dato que identifica', def: 'Permite llegar a una persona concreta' },
  { term: 'Dato agregado', def: 'Habla de un grupo y no señala a nadie' },
  { term: 'Finalidad', def: 'El para qué, escrito en una línea' },
  { term: 'Minimización', def: 'Quedarse con el mínimo que sirve' },
  { term: 'Consentimiento', def: 'El permiso que da la familia, no el menor' },
  { term: 'Plazo de borrado', def: 'La fecha con la que el dato se elimina' },
  { term: 'Control de acceso', def: 'Quién lo ve, con nombre y cargo' },
  { term: 'Seudonimización', def: 'Cambiar el nombre por un código' },
  { term: 'Plan de incidente', def: 'Qué se hace si se filtra, escrito antes' },
  { term: 'Inventario de datos', def: 'La lista de todo lo que se guarda de otros' },
  { term: 'Copia oculta', def: 'Destinatarios que no se ven entre sí' },
  { term: 'Dato en el aparato', def: 'El que nunca viaja a un servidor' },
  { term: 'La copia es un sitio', def: 'El respaldo contiene lo mismo que la base' },
  { term: 'La duda hacia el no', def: 'Con menores, si no está claro, no se puede' },
  { term: 'Derecho a que se borre', def: 'La familia pide y se borra, sin motivo' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Un centro pide que M.E.T.A.S guarde las calificaciones de sus estudiantes para llevar el registro del año escolar.' },
  { txt: 'Sale una foto muy buena de una sección trabajando con las misiones y la maestra dice que se puede publicar.' },
  { txt: 'Hay que avisar de una actividad a treinta familias y se prepara un correo con todas las direcciones.' },
  { txt: 'La aplicación pide el nombre del estudiante para personalizar la constancia y se plantea guardarlo en el servidor.' },
  { txt: 'Una empresa ofrece añadir gratis una función de inteligencia artificial a cambio de recibir los datos de uso de los estudiantes.' },
  { txt: 'Un maestro pide el listado con nombres de quiénes de su sección entraron a las misiones esta semana.' },
  { txt: 'El respaldo de la base de datos estaba sin clave en un teléfono que se quedó en un bus.' },
  { txt: 'Una madre escribe pidiendo que se borre todo lo que el proyecto tenga de su hija.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué datos se están pidiendo o guardando exactamente, y quién responde por ellos?',
  '2. ¿Con qué mínimo se cumple la misma finalidad?',
  '3. Escribe en 3-4 frases lo que contestarías, por escrito.',
  '4. ¿Cuándo se borra, quién lo ve y qué pasa si se filtra?',
]);

B.critCaseGuides = JSON.stringify([
  'Nombrar los campos uno por uno, sin «etcétera». Y ojo con quién responde: aceptar datos es aceptar responder por ellos, aunque el que los pidió sea otro.',
  'Casi siempre basta el conteo agregado, un identificador que traduce la escuela, o un dato que se queda en el aparato. El mínimo se busca quitando campos hasta que la finalidad deja de cumplirse.',
  'La respuesta se escribe, no se manda a la carrera. Y casi ninguna petición se rechaza entera: se contesta con lo que sí se puede dar, que suele resolver lo mismo.',
  'Sin fecha de borrado, sin dueño de acceso con nombre y sin plan de incidente, el dato no está guardado: está esperando.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Se lo mando con nombres, total es la maestra de esos niños".', g1: 'Aunque la relación sea legítima, cada copia de una lista con nombres es un sitio más del que se puede filtrar, y las copias no se vigilan.', g2: 'Se pregunta qué va a hacer con la lista. Si es para saber si la actividad funcionó, el conteo por grado le sirve igual y no crea la copia.' },
  { txt: '"La maestra dio permiso para la foto, así que se puede publicar".', g1: 'El permiso que hace falta lo da la familia de cada niño que salga, y para esa publicación concreta.', g2: 'La foto de las manos y la pantalla cumple lo mismo sin necesitar permiso de nadie. Si la cara aporta algo que la mano no, entonces se pide autorización por escrito, una por niño.' },
  { txt: '"Guardamos también la fecha de nacimiento y la dirección, por si hacen falta".', g1: 'Sin finalidad escrita no hay límite, y así es como se acumula lo que después se filtra.', g2: 'Se quitan campos hasta que la finalidad deje de cumplirse. Lo que no se guarda no se puede perder ni hay que protegerlo.' },
  { txt: '"El respaldo lo tengo en el teléfono, que siempre ando conmigo".', g1: 'La copia contiene lo mismo que la base de datos, y sin cifrar es la base entera regalada. Además, si se pierde, nadie se entera de que se la llevaron.', g2: 'Se escribe dónde viven las copias, con qué clave están cifradas y quién la tiene. Y el plan de incidente empieza por cambiar las claves de todo lo que ese aparato abría.' },
  { txt: '"La función de IA es gratis, solo quieren datos de uso".', g1: 'Los datos de uso de menores salen hacia una empresa sobre la que el proyecto no manda y a la que las familias no autorizaron nada.', g2: 'Datos agregados y sin identificadores, con un documento que diga qué reciben, para qué y por cuánto tiempo. Si eso no les sirve, no hay trato.' },
  { txt: '"Se filtró algo pequeño, mejor no alarmar a nadie".', g1: 'Una filtración contada a tiempo se perdona; una descubierta después, no. Y las familias tienen derecho a saber qué salió.', g2: 'Se avisa, se dice qué datos salieron y de cuántas personas, y se escribe qué se cambió para que no se repita. Ocultarlo cuesta más que contarlo.' },
]);

B.critDecisionBank = JSON.stringify([
  'Un centro quiere que M.E.T.A.S guarde las notas de sus menores: ¿qué se acepta guardar y qué se devuelve al centro?',
  'Hay una foto buenísima de una sección usando las misiones: ¿qué se publica y con qué permiso?',
  'Aviso a treinta familias por correo: ¿cómo se manda para que no sea una filtración?',
  'La constancia necesita el nombre del estudiante: ¿dónde se guarda ese dato y por qué?',
  'Una empresa ofrece IA gratis a cambio de datos de uso: ¿qué se contesta y con qué condición?',
  'Un maestro pide el listado con nombres de su sección: ¿qué se le manda?',
  'Se perdió el teléfono con el respaldo sin cifrar: ¿cuál es el primer paso y en qué orden siguen los demás?',
  'Una familia pide borrar todo lo de su hija: ¿qué se hace y qué demuestra este caso?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Guardar un identificador que la escuela sabe traducir.', b: 'Guardar el nombre y apellido de cada estudiante.', ga: 'Caso A: se puede medir y contar igual, y aun con toda la base robada no se sabe de quién es cada fila.', gb: 'Caso B: cualquier fuga expone a personas concretas, y el que responde por eso pasa a ser el proyecto.' },
  { a: 'Publicar la foto de las manos y la pantalla.', b: 'Publicar la foto del grupo mirando a la cámara.', ga: 'Caso A: enseña que se usa de verdad y no necesita permiso de nadie.', gb: 'Caso B: necesita autorización escrita de la familia de cada niño, para esa publicación concreta.' },
  { a: 'Armar la constancia en el teléfono con lo que el usuario escribió.', b: 'Guardar el nombre completo en el servidor para la constancia.', ga: 'Caso A: el dato nunca viaja, así que no se puede filtrar desde el servidor ni hay que responder por él.', gb: 'Caso B: se crea una base de nombres de menores para resolver algo que se resolvía sin ella.' },
  { a: 'Contestar a una petición de datos al día siguiente y por escrito.', b: 'Mandar el archivo por WhatsApp el mismo día que lo piden.', ga: 'Caso A: da tiempo a ver si el conteo cumple lo mismo y deja registro de qué se envió.', gb: 'Caso B: el archivo sale y ya no vuelve: queda en su teléfono, en su nube y en el grupo al que lo reenvíe.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se guardan datos sin escribir para qué.', guide: 'Sin finalidad no hay límite: se acumula «por si acaso» y lo acumulado es exactamente lo que se filtra.' },
  { cause: 'Se manda un listado con nombres por un canal que deja copias.', guide: 'El archivo ya no vuelve. Queda en el teléfono de quien lo recibe, en su nube y en cualquier grupo al que lo reenvíe.' },
  { cause: 'Se publica una foto con caras con el permiso de la maestra.', guide: 'El permiso que hacía falta era el de cada familia, y para esa publicación concreta. Lo que sirve para el mural del aula no sirve para internet.' },
  { cause: 'El respaldo se guarda sin cifrar.', guide: 'La copia contiene lo mismo que la base. Un aparato perdido se convierte en la base de datos entera, y sin aviso.' },
  { cause: 'Ningún dato tiene fecha de borrado.', guide: 'Todo se queda para siempre, y llega el día en que se hereda una base que nadie sabe qué contiene ni por qué.' },
  { cause: 'No hay inventario de datos.', guide: 'El día que una familia pide un borrado no se puede cumplir, porque nadie sabe dónde está cada dato de esa persona.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Una petición de borrado se cumplió en el mismo día.', guide: 'Había inventario: se sabía dónde estaba cada dato de esa persona. Ese es el examen real del sistema.' },
  { effect: 'Se perdió un teléfono y no salió ningún dato.', guide: 'El respaldo estaba cifrado y el aparato no era el único sitio. La copia también es un sitio, y estaba tratada como tal.' },
  { effect: 'La escuela quedó conforme sin recibir ningún nombre.', guide: 'El conteo agregado cumplía la misma finalidad. Casi todas las peticiones «con nombres» se resuelven así.' },
  { effect: 'Se publicó la actividad sin pedir un solo permiso.', guide: 'La foto era de manos y pantalla. Cuando la cara no aporta nada que no aporte la mano, no hay que pedir nada.' },
  { effect: 'Una filtración pequeña no dañó la confianza de las familias.', guide: 'Se avisó el mismo día, se dijo qué salió y qué se cambió. Contarlo a tiempo es lo que la salva.' },
  { effect: 'El proyecto pudo decir que no a una empresa sin quedar mal.', guide: 'Había una política de una página escrita de antes. Con la regla en la mano, el no es de la norma y no es personal.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🪪', label: 'Qué dato es', text: '¿<strong>Identifica</strong> a alguien o habla de un grupo? <strong>Decide:</strong> todo lo demás. <strong>Se rompe:</strong> al olvidar que escuela, grado y sección juntos también señalan. <strong>En M.E.T.A.S:</strong> el conteo por grado no identifica; el nombre sí.' },
  { y: '2', icon: '🎯', label: 'Para qué se pide', text: 'La <strong>finalidad</strong>, en una línea concreta. <strong>Decide:</strong> si el dato se pide o no. <strong>Se rompe:</strong> con «por si acaso» y «para estadísticas». <strong>En M.E.T.A.S:</strong> saber si una misión funcionó, que se resuelve sin nombres.' },
  { y: '3', icon: '✂️', label: 'El mínimo', text: 'El <strong>menor número de campos</strong> que cumple la finalidad. <strong>Decide:</strong> cuánto hay que proteger después. <strong>Se rompe:</strong> al pedir el formulario completo por costumbre. <strong>En M.E.T.A.S:</strong> grado y fecha bastan.' },
  { y: '4', icon: '👀', label: 'Quién lo ve', text: 'El <strong>control de acceso</strong>, con nombre y cargo. <strong>Decide:</strong> quién responde. <strong>Se rompe:</strong> con «el equipo» o «los maestros». <strong>En M.E.T.A.S:</strong> si no se puede nombrar a la persona, nadie está respondiendo.' },
  { y: '5', icon: '⏱️', label: 'Cuánto se guarda', text: 'La <strong>fecha o condición de borrado</strong>, puesta el primer día. <strong>Decide:</strong> que no se quede para siempre. <strong>Se rompe:</strong> al no ponerla nunca. <strong>En M.E.T.A.S:</strong> al terminar el año escolar.' },
  { y: '6', icon: '📝', label: 'Quién autoriza', text: 'Con menores, <strong>la familia</strong>, y para un uso concreto. <strong>Decide:</strong> si se puede usar. <strong>Se rompe:</strong> al tomar el permiso de la maestra como si fuera el de la familia. <strong>En M.E.T.A.S:</strong> una autorización por niño y por publicación.' },
  { y: '7', icon: '🚨', label: 'Si se filtra', text: 'El <strong>plan de incidente</strong>, escrito antes. <strong>Decide:</strong> cuánto daño hace. <strong>Se rompe:</strong> improvisando el día que pasa. <strong>En M.E.T.A.S:</strong> cortar accesos, ver qué salió, avisar y escribir qué se cambió.' },
]);

B.parteData = JSON.stringify({
  minimo: {
    nombre: 'El mínimo necesario', icon: '✂️',
    estructura: { title: 'Qué es', info: '• El <strong>menor número de campos</strong> que cumple la finalidad<br>• Se busca quitando, no añadiendo<br>• Lo que no se guarda no se puede perder ni hay que protegerlo' },
    funcion: { title: 'Cómo se decide', info: '• Se escribe la finalidad en una línea<br>• Se quitan campos hasta que <strong>deja de cumplirse</strong><br>• Se para justo antes de ese punto y se anota por qué' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al copiar un formulario completo por costumbre<br>• Con el «por si acaso» y el «para estadísticas»<br>• Al pedir fecha de nacimiento o dirección sin usarlas nunca' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Para medir uso bastan <strong>grado y fecha</strong><br>• Para la constancia basta el <strong>nombre de pila</strong>, en el teléfono<br>• Para el centro, un identificador que <strong>solo la escuela traduce</strong>' },
  },
  acceso: {
    nombre: 'Quién lo ve', icon: '👀',
    estructura: { title: 'Qué es', info: '• La lista de <strong>quién puede ver cada dato</strong><br>• Se escribe con nombre y cargo, no por grupos<br>• Si no se puede nombrar a la persona, nadie responde por eso' },
    funcion: { title: 'Cómo se decide', info: '• Por defecto, <strong>nadie</strong>: se abre solo lo que hace falta<br>• Cada acceso tiene un motivo escrito<br>• Se revisa cuando alguien cambia de rol o se va' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con accesos que se dan «temporalmente» y se quedan<br>• Cuando el archivo se manda por WhatsApp y ya no se controla<br>• Con la tabla que tiene la seguridad por fila desactivada' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Cada copia enviada es <strong>un acceso más que no se vigila</strong><br>• Regla: el conteo por defecto, la lista solo si hace falta<br>• Y se apunta en Destellos qué se envió, a quién y cuándo' },
  },
  plazo: {
    nombre: 'Cuánto se guarda', icon: '⏱️',
    estructura: { title: 'Qué es', info: '• La <strong>fecha o condición de borrado</strong> de cada dato<br>• Se pone el día que el dato entra, no después<br>• Un dato sin caducidad se queda para siempre' },
    funcion: { title: 'Cómo se decide', info: '• Se mira la finalidad: cuando se cumple, el dato sobra<br>• Se elige una fecha concreta o un hecho claro<br>• Se revisa el inventario <strong>una vez al año</strong> y se borra lo vencido' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con los respaldos, que conservan lo ya borrado<br>• Con las copias sueltas en teléfonos y correos<br>• Cuando el proyecto cambia de manos y nadie sabe qué hay' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Lo del año escolar se borra <strong>al cerrar el año</strong><br>• Los respaldos también caducan, no solo la base<br>• El simulacro del caso 8 se hace <strong>una vez al año</strong>' },
  },
  incidente: {
    nombre: 'Si se filtra', icon: '🚨',
    estructura: { title: 'Qué es', info: '• El plan de <strong>qué se hace cuando algo sale</strong><br>• Escrito antes, porque ese día nadie improvisa bien<br>• Incluye a quién se avisa, en qué orden y en cuánto tiempo' },
    funcion: { title: 'Cómo se decide', info: '• Primero <strong>cortar el acceso</strong>: cambiar claves de todo lo que abría<br>• Después saber qué salió y de cuántas personas<br>• Avisar a las familias afectadas, sin adornos, y escribir qué se cambió' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al querer averiguar todo antes de cortar el acceso<br>• Al decidir «no alarmar» y que se descubra después<br>• Al no dejar registro, y repetir el mismo fallo el año siguiente' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Casos reales que hay que prever: <strong>teléfono perdido</strong> con respaldo, correo con copias visibles, APK compartido con una clave dentro<br>• Regla: <strong>ocultarlo cuesta más que contarlo</strong>' },
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

const textos = [
  [/🧾 \*Ruta del Poder · Etapa 2\* 🧾/g, '🛡️ *Ruta de la Casa Cerrada · Etapa 2* 🛡️'],
  [/A dónde se va el dinero y la hora: costo por unidad, margen y punto de equilibrio, con las ocho cuentas del proyecto\. 🧾/g, 'Qué se guarda de otras personas, por cuánto tiempo y quién responde, con las ocho peticiones que va a recibir el proyecto. 🛡️'],
  [/_Incluye evaluación conceptual y la cuenta sobre la mesa\._ ✍️/g, '_Incluye evaluación conceptual y la petición que llega._ ✍️'],
  [/Ruta del Poder · Etapa 2: El presupuesto real/g, 'Ruta de la Casa Cerrada · Etapa 2: Los datos de los demás'],
  [/La cuenta sobre la mesa/g, 'La petición que llega'],
  [/la cuenta sobre la mesa/g, 'la petición que llega'],
  [/El presupuesto real/g, 'Los datos de los demás'],
  [/el presupuesto real/g, 'los datos de los demás'],
  [/Ruta del Poder/g, 'Ruta de la Casa Cerrada'],
  [/mapa del presupuesto/g, 'mapa de los datos'],
  [/🧾 ¡/g, '🛡️ ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
