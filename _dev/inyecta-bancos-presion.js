/* Inyecta los bancos de la misión «Tácticas de presión y sus antídotos» (Ruta
   de la Persuasión, etapa 4) sobre el molde copiado de la etapa 3, y de paso
   cambia los rótulos que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-presion.js

   La etapa 3 enseñó el marco, que decide de qué se discute. Esta enseña lo que
   pasa cuando el marco no basta: en vez de convencerte, te apuran. Las siete
   tácticas son el reloj, la escasez, el paquete, la autoridad prestada, la
   deuda, el público y el desgaste; el antídoto son tres movimientos (parar el
   reloj, sacar la decisión de la sala, volver al criterio escrito en frío) y
   una frase de bolsillo que se dice siempre igual: «no decido hoy».          */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-persuasion-presion', 'js', 'presion.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260801;
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

B.SAVE_KEY = `'faro_psi_presion_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la presión superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de la presión explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de urgencias experto' },
  id_master: { icon: '🔍', label: 'Identificador de tácticas maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del reloj' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 4 de la Ruta de la Persuasión completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Contesta antes de pensar ⏱️' },
  { t: 25, n: 'Nota las ganas de que se acabe 🚨' },
  { t: 55, n: 'Pregunta qué pasa el jueves 📅' },
  { t: 90, n: 'Pide el motivo por escrito ✉️' },
  { t: 130, n: 'Saca la decisión de la sala 🚪' },
  { t: 165, n: 'Dice «no decido hoy» sin enfado ⏸️' },
  { t: 200, n: 'Llega con el criterio escrito 📋' },
]);

B.fcData = JSON.stringify([
  { w: 'La presión', a: '⏱️ Todo lo que <strong>te quita tiempo de pensar</strong> sin darte información nueva. No cambia lo que te ofrecen: cambia el reloj con el que lo miras.' },
  { w: 'Las ganas de que se acabe', a: '🚨 La señal de alarma de esta etapa. Cuando lo que más quieres es salir de la conversación, ya no decides el asunto: decides <strong>dejar de sentir la presión</strong>.' },
  { w: 'La urgencia real', a: '📅 Trae <strong>un porqué que se entiende a la primera</strong>: una convocatoria que cierra, un año escolar que empieza. Se comprueba en un papel y sigue siendo verdad aunque digas que no.' },
  { w: 'La urgencia fabricada', a: '🎭 Nació dentro de la conversación y <strong>solo se explica repitiendo que es urgente</strong>. Firma inconfundible: si dices que no, se estira sola.' },
  { w: 'El reloj', a: '⏱️ «Tiene que ser hoy». La más común y la más barata de montar, porque no cuesta nada decirla y casi nadie pregunta qué pasa si es el jueves.' },
  { w: 'La escasez', a: '📉 «Quedan dos cupos». La de verdad <strong>se puede contar</strong>; la fabricada nunca se comprueba, y si dices que no, mañana quedan tres.' },
  { w: 'El paquete', a: '📦 «Todo o nada». Esconde lo que no aguantaría solo: una parte buena, una normal y una cara, aprobadas juntas. Se abre con «¿cuánto cuesta solo esto?».' },
  { w: 'La autoridad prestada', a: '🎖️ «Esto ya lo aprobó la Secretaría», y nadie enseña el papel. No es la autoridad de quien habla: <strong>es una autoridad que se cita</strong>. Se contesta pidiendo el documento.' },
  { w: 'La deuda', a: '🧾 «Después de todo lo que hicimos por ti». No aprieta el bolsillo, aprieta <strong>la relación</strong>. El favor era real; lo falso es que sea infinito.' },
  { w: 'El público', a: '🎪 Decidir delante de gente. No cambia el trato: <strong>cambia el precio de decir que no</strong>. Por eso la salida no es valentía, es sacar la decisión de la sala.' },
  { w: 'El desgaste', a: '🪨 Volver cada semana con lo mismo. Ninguna vez es presión; <strong>las cuatro juntas sí</strong>. Termina en ceder de cansancio, que es la peor manera de aceptar algo.' },
  { w: 'La frase de bolsillo', a: '⏸️ <strong>«No decido hoy.»</strong> Siempre la misma, sin enfado y sin explicación. Se lleva aprendida justamente para no tener que inventarla en el momento.' },
  { w: 'La prueba de los tres días', a: '📆 Decir «necesito hasta el jueves» y mirar qué pasa. Casi nada de lo que importa se rompe en tres días, y <strong>lo que se rompe convenía saberlo</strong>.' },
  { w: 'La salida', a: '🚪 Saber <strong>qué haces tú si esto no pasa</strong>. Pensada antes, permite oír «entonces se cae el trato» sin que se mueva nada por dentro.' },
  { w: 'El criterio', a: '📋 Lo que decidiste <strong>en frío</strong>, escrito antes de que llegara nadie. No discute, no se cansa y no queda mal con nadie.' },
  { w: 'Por escrito', a: '✉️ Donde se caen casi todas las presiones. Nadie pone por escrito una escasez inventada, porque escribirla la convierte en <strong>una promesa que se puede enseñar después</strong>.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué es lo único que cambia una táctica de presión?', o: ['a) Lo que te ofrecen', 'b) El precio', 'c) El tiempo que tienes para pensarlo', 'd) La persona que lo ofrece'], c: 2 },
  { q: 'La señal de alarma de esta etapa es…', o: ['a) Notar que te enfadas', 'b) Notar las ganas de que se acabe', 'c) Que suban el precio', 'd) Que haya mucha gente'], c: 1 },
  { q: 'Una urgencia real se distingue porque…', o: ['a) La repiten muchas veces', 'b) Viene con un contador', 'c) Trae un porqué que se entiende a la primera', 'd) La dice alguien importante'], c: 2 },
  { q: 'Si dices que no y la oferta sigue viva mañana, eso era…', o: ['a) Un descuido', 'b) Escasez fabricada', 'c) Mala suerte', 'd) Una segunda oportunidad'], c: 1 },
  { q: '¿Qué esconde un paquete de «todo o nada»?', o: ['a) La parte que no aguantaría sola', 'b) El precio real del transporte', 'c) Un descuento mayor', 'd) Nada, es más cómodo'], c: 0 },
  { q: '«Esto ya lo aprobó la Secretaría», sin papel a la vista, es…', o: ['a) Un dato', 'b) Autoridad prestada', 'c) Un trámite', 'd) Una garantía'], c: 1 },
  { q: 'El público en una reunión cambia…', o: ['a) El trato que te ofrecen', 'b) El precio de decir que no', 'c) La ley', 'd) La calidad del acuerdo'], c: 1 },
  { q: 'Contra el desgaste, lo que funciona es…', o: ['a) Pensarlo mejor cada vez', 'b) Explicar más argumentos', 'c) Contestar una vez y de forma definitiva', 'd) Dejar de contestar'], c: 2 },
  { q: 'La frase de bolsillo de esta etapa es…', o: ['a) «Déjame consultarlo con la almohada»', 'b) «No decido hoy»', 'c) «No me interesa»', 'd) «Mándame la propuesta»'], c: 1 },
  { q: '¿Por qué se pide por escrito lo que es urgente?', o: ['a) Para tener pruebas ante un juez', 'b) Porque una urgencia inventada casi nunca se escribe', 'c) Para ganar tiempo de negociación', 'd) Porque es más educado'], c: 1 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Urgencia real', 'Urgencia fabricada'], headA: '📅 Real', headB: '🎭 Fabricada', colA: 'ok', colB: 'no',
    words: [
      { w: 'La convocatoria cierra el día 30', t: 'ok' }, { w: 'El año escolar empieza en febrero', t: 'ok' },
      { w: 'El pago vence el viernes en el banco', t: 'ok' }, { w: 'La imprenta cierra por vacaciones', t: 'ok' },
      { w: '«Necesito saberlo antes de irme»', t: 'no' }, { w: '«El descuento se acaba esta noche»', t: 'no' },
      { w: '«Quedan dos cupos»', t: 'no' }, { w: '«Si no es hoy, ya no puedo»', t: 'no' },
    ],
  },
  {
    label: ['Aprieta el bolsillo', 'Aprieta la relación'], headA: '💰 El bolsillo', headB: '❤️ La relación', colA: 'ok', colB: 'no',
    words: [
      { w: 'El descuento que caduca', t: 'ok' }, { w: 'Quedan dos cupos', t: 'ok' },
      { w: 'El paquete completo o nada', t: 'ok' }, { w: 'El precio sube el lunes', t: 'ok' },
      { w: '«Después de todo lo que hicimos por ti»', t: 'no' }, { w: 'Votarlo delante del claustro', t: 'no' },
      { w: '«Pensé que éramos amigos»', t: 'no' }, { w: 'El mensaje amable de cada semana', t: 'no' },
    ],
  },
  {
    label: ['Táctica', 'Antídoto'], headA: '⏱️ Táctica', headB: '⏸️ Antídoto', colA: 'ok', colB: 'no',
    words: [
      { w: 'Poner un contador en la pantalla', t: 'ok' }, { w: 'Pedir la respuesta antes de salir', t: 'ok' },
      { w: 'Citar una aprobación sin enseñarla', t: 'ok' }, { w: 'Volver cada semana con lo mismo', t: 'ok' },
      { w: 'Preguntar qué pasa si contesto el jueves', t: 'no' }, { w: 'Pedir el motivo por escrito', t: 'no' },
      { w: 'Sacar la decisión de la reunión', t: 'no' }, { w: 'Volver al criterio escrito en frío', t: 'no' },
    ],
  },
  {
    label: ['Se decide en caliente', 'No se decide en caliente'], headA: '🔥 Puede decidirse', headB: '🧊 Nunca en caliente', colA: 'ok', colB: 'no',
    words: [
      { w: 'El color de una portada', t: 'ok' }, { w: 'La hora de la próxima reunión', t: 'ok' },
      { w: 'Si se manda la ficha por correo', t: 'ok' }, { w: 'Qué se lleva impreso mañana', t: 'ok' },
      { w: 'Un precio para todo el año', t: 'no' }, { w: 'Ceder la autoría del material', t: 'no' },
      { w: 'Entregar datos de menores', t: 'no' }, { w: 'Un compromiso de doce meses', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['La', 'presión', 'no', 'cambia', 'los', 'hechos:', 'cambia', 'el', 'reloj.'], c: 8, art: 'Lo único que de verdad te quitan' },
  { s: ['La', 'urgencia', 'fabricada', 'solo', 'se', 'explica', 'repitiéndose.'], c: 2, art: 'La que nació en la conversación' },
  { s: ['La', 'escasez', 'de', 'verdad', 'se', 'puede', 'contar.'], c: 1, art: 'La táctica que quita opciones' },
  { s: ['El', 'paquete', 'esconde', 'lo', 'que', 'no', 'aguantaría', 'solo.'], c: 1, art: 'La táctica del todo o nada' },
  { s: ['La', 'deuda', 'aprieta', 'la', 'relación,', 'no', 'el', 'bolsillo.'], c: 1, art: 'El favor viejo que se cobra' },
  { s: ['El', 'público', 'cambia', 'el', 'precio', 'de', 'decir', 'que', 'no.'], c: 1, art: 'La táctica de los testigos' },
  { s: ['El', 'desgaste', 'espera', 'un', 'día', 'malo,', 'no', 'un', 'argumento.'], c: 1, art: 'La táctica que no pasa en un día' },
  { s: ['El', 'criterio', 'se', 'escribe', 'en', 'frío', 'y', 'no', 'se', 'cansa.'], c: 1, art: 'Lo que decides antes de que llegue nadie' },
]);

B.cmpData = JSON.stringify([
  { s: 'La presión no cambia los hechos: cambia el ___.', opts: ['reloj', 'precio', 'trato'], c: 0 },
  { s: 'La señal de alarma son las ganas de que ___.', opts: ['se acabe', 'suba', 'llame'], c: 0 },
  { s: 'La urgencia real trae un ___ que se entiende a la primera.', opts: ['porqué', 'papel', 'plazo'], c: 0 },
  { s: 'La escasez de verdad se puede ___.', opts: ['contar', 'discutir', 'pedir'], c: 0 },
  { s: 'El ___ esconde lo que no aguantaría solo.', opts: ['paquete', 'descuento', 'contrato'], c: 0 },
  { s: 'La autoridad prestada se contesta pidiendo el ___.', opts: ['documento', 'precio', 'plazo'], c: 0 },
  { s: 'La frase de bolsillo es «no ___ hoy».', opts: ['decido', 'firmo', 'contesto'], c: 0 },
  { s: 'Todo lo urgente se pide por ___.', opts: ['escrito', 'teléfono', 'favor'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Es presión', 'Es un motivo'], btnA: '⏱️ Es presión', btnB: '📅 Es un motivo', colA: 'ok', colB: 'no',
    words: [
      { w: '«Necesito saberlo antes de irme»', t: 'ok' }, { w: '«El descuento se acaba esta noche»', t: 'ok' },
      { w: '«Quedan dos cupos»', t: 'ok' }, { w: '«Si de verdad te importara, lo harías ya»', t: 'ok' },
      { w: 'La convocatoria cierra el día 30', t: 'no' }, { w: 'El año escolar empieza en febrero', t: 'no' },
      { w: 'La imprenta cierra dos semanas', t: 'no' }, { w: 'El pago vence el viernes', t: 'no' },
    ],
  },
  {
    label: ['Aprieta el bolsillo', 'Aprieta la relación'], btnA: '💰 El bolsillo', btnB: '❤️ La relación', colA: 'ok', colB: 'no',
    words: [
      { w: 'El contador en la pantalla', t: 'ok' }, { w: '«Es el último cupo»', t: 'ok' },
      { w: 'El paquete completo o nada', t: 'ok' }, { w: '«El precio sube el lunes»', t: 'ok' },
      { w: '«Después de todo lo que hicimos»', t: 'no' }, { w: 'Votarlo delante de todos', t: 'no' },
      { w: '«Pensé que éramos amigos»', t: 'no' }, { w: 'El recordatorio amable de cada lunes', t: 'no' },
    ],
  },
  {
    label: ['Táctica', 'Antídoto'], btnA: '🎣 Táctica', btnB: '🛡️ Antídoto', colA: 'ok', colB: 'no',
    words: [
      { w: 'Pedir la firma antes de salir', t: 'ok' }, { w: 'Citar una aprobación sin papel', t: 'ok' },
      { w: 'Insistir cada semana', t: 'ok' }, { w: 'Juntarlo todo en un solo trato', t: 'ok' },
      { w: '«¿Qué pasa si contesto el jueves?»', t: 'no' }, { w: '«Mándamelo por escrito»', t: 'no' },
      { w: '«No decido hoy»', t: 'no' }, { w: 'Mirar la lista escrita en frío', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se aguanta una presión', steps: ['Notar la señal: las ganas de que se acabe', 'Nombrar la táctica por dentro, sin decirla en voz alta', 'Preguntar qué pasa exactamente si se contesta el jueves', 'Pedir por escrito el motivo y el plazo', 'Sacar la decisión de la sala y de la prisa', 'Volver al criterio escrito en frío y contestar'] },
  { label: 'Cómo se prepara la hoja del reloj', steps: ['Escribir qué no se decide en caliente', 'Escribir la frase de bolsillo tal como se va a decir', 'Fijar el plazo que se pide siempre', 'Escribir la salida: qué haces si esto no pasa', 'Anotar con quién lo consultas antes de decir que sí'] },
  { label: 'Qué se hace con quien insiste cada semana', steps: ['Comprobar en la hoja qué se decidió en frío', 'Contestar una sola vez y por escrito', 'Decir que la respuesta no cambia este año', 'Ofrecer avisar tú si algo cambia', 'Dejar de contestar a los recordatorios'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Quita el tiempo: la respuesta tiene que ser hoy', ans: 'El reloj', opts: ['El reloj', 'La escasez', 'El paquete', 'La deuda'] },
  { desc: 'Quita opciones: quedan dos y se acaban', ans: 'La escasez', opts: ['La escasez', 'El reloj', 'El público', 'El desgaste'] },
  { desc: 'Junta lo bueno con lo caro para que se apruebe todo', ans: 'El paquete', opts: ['El paquete', 'La autoridad prestada', 'La deuda', 'El reloj'] },
  { desc: 'Cita una aprobación que nadie enseña', ans: 'La autoridad prestada', opts: ['La autoridad prestada', 'El público', 'La escasez', 'El criterio'] },
  { desc: 'Cobra un favor viejo y verdadero como si no tuviera fin', ans: 'La deuda', opts: ['La deuda', 'El desgaste', 'El paquete', 'El reloj'] },
  { desc: 'Pone testigos para que decir que no cueste el triple', ans: 'El público', opts: ['El público', 'La deuda', 'La escasez', 'El paquete'] },
  { desc: 'Vuelve cada semana hasta que cedes de cansancio', ans: 'El desgaste', opts: ['El desgaste', 'El reloj', 'El público', 'La autoridad prestada'] },
  { desc: 'Lo que decidiste en frío y no se cansa ni queda mal con nadie', ans: 'El criterio', opts: ['El criterio', 'La salida', 'El guion', 'El reloj'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: '«Necesito que me confirmes hoy mismo»', func: '«¿Qué pasa exactamente si te confirmo el jueves?»', opts: ['«¿Qué pasa exactamente si te confirmo el jueves?»', '«Es que hoy no puedo, tengo mucho trabajo»', '«Está bien, dame diez minutos»', '«¿Por qué siempre con prisas?»'] },
  { trans: '«Quedan dos cupos»', func: '«Mándame por escrito hasta cuándo dura»', opts: ['«Mándame por escrito hasta cuándo dura»', '«¿Y si me guardas uno?»', '«Entonces lo tomo ya»', '«No te creo»'] },
  { trans: '«O el paquete completo o no podemos»', func: '«¿Cuánto cuesta solo la impresión?»', opts: ['«¿Cuánto cuesta solo la impresión?»', '«Déjame ver si consigo el dinero»', '«Está bien, el paquete»', '«Entonces no hay trato»'] },
  { trans: '«Esto ya lo aprobó la Secretaría»', func: '«Perfecto, pásame el documento y lo leo esta semana»', opts: ['«Perfecto, pásame el documento y lo leo esta semana»', '«¿Y quién lo aprobó exactamente?»', '«Si está aprobado, adelante»', '«Eso no puede ser verdad»'] },
  { trans: '«Vamos a votarlo aquí mismo, delante de todos»', func: '«Les mando la respuesta el lunes por escrito»', opts: ['«Les mando la respuesta el lunes por escrito»', '«Prefiero no opinar»', '«Voten ustedes, me da igual»', '«Está bien, que sea rápido»'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Firmó el viernes a las cinco para no alargar la reunión', characteristic: 'Decidió con público y con prisa, que son dos tácticas a la vez', opts: ['Decidió con público y con prisa, que son dos tácticas a la vez', 'No sabía lo que firmaba', 'El trato era malo desde el principio', 'Le faltó carácter'] },
  { disease: 'Mandó la propuesta de madrugada y puso un precio equivocado', characteristic: 'Aceptó un plazo que nadie justificó y perdió el tiempo de revisarla', opts: ['Aceptó un plazo que nadie justificó y perdió el tiempo de revisarla', 'Calculó mal la suma', 'La propuesta era difícil', 'Le faltó una plantilla'] },
  { disease: 'Compró la herramienta porque el descuento se acababa esa noche', characteristic: 'No estaba en la lista de lo que hacía falta antes de aparecer la oferta', opts: ['No estaba en la lista de lo que hacía falta antes de aparecer la oferta', 'La herramienta era mala', 'El descuento era falso', 'Se gastó más de la cuenta'] },
  { disease: 'Aceptó dar el material del año gratis a un centro amigo', characteristic: 'Confundió devolver un favor con aceptar una deuda sin fin', opts: ['Confundió devolver un favor con aceptar una deuda sin fin', 'No sabía decir que no', 'El amigo se aprovechó', 'El material no valía nada'] },
  { disease: 'Cedió a la quinta vez que se lo pidieron, sin razones nuevas', characteristic: 'Cedió de cansancio: el desgaste no espera argumentos, espera un día malo', opts: ['Cedió de cansancio: el desgaste no espera argumentos, espera un día malo', 'Al final lo convencieron', 'Se dio cuenta de que tenía razón', 'Ya no tenía excusas'] },
  { disease: 'Aprobó el paquete entero por quedarse con una sola parte', characteristic: 'No preguntó cuánto costaba esa parte por separado', opts: ['No preguntó cuánto costaba esa parte por separado', 'El paquete estaba bien de precio', 'Necesitaba las tres cosas', 'No había alternativa'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Todo lo que te quita tiempo de pensar sin darte información nueva.', type: 'La presión' },
  { s: 'Notar que lo que más quieres es salir de la conversación.', type: 'La señal de alarma' },
  { s: 'Trae un porqué que se entiende a la primera y se comprueba en un papel.', type: 'Urgencia real' },
  { s: 'Solo se explica repitiendo que es urgente, y se estira si dices que no.', type: 'Urgencia fabricada' },
  { s: 'Quedan dos cupos y se acaban esta noche.', type: 'La escasez' },
  { s: 'Todo junto o nada, aunque solo hacía falta una parte.', type: 'El paquete' },
  { s: 'Ya lo aprobó alguien importante, y nadie enseña el papel.', type: 'La autoridad prestada' },
  { s: 'Después de todo lo que hicimos por ti.', type: 'La deuda' },
  { s: 'Volver cada semana con lo mismo hasta que el otro cede.', type: 'El desgaste' },
  { s: 'No decido hoy, dicho siempre igual y sin enfado.', type: 'La frase de bolsillo' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'La convocatoria cierra el día 30', gen: 'Tipo de urgencia', n: 'Se comprueba', g: 'Real', t: 'Sigue siendo verdad si dices que no' },
  { w: '«Si no es hoy, ya no puedo»', gen: 'Tipo de urgencia', n: 'No se comprueba', g: 'Fabricada', t: 'Se estira sola al día siguiente' },
  { w: 'El descuento que caduca esta noche', gen: 'Dónde aprieta', n: 'Dinero', g: 'El bolsillo', t: 'Se contesta con la lista escrita' },
  { w: '«Después de todo lo que hicimos por ti»', gen: 'Dónde aprieta', n: 'Vínculo', g: 'La relación', t: 'Se reconoce el favor y se propone otra cosa' },
  { w: 'Pedir la respuesta antes de salir de la sala', gen: 'Papel', n: 'La usan contigo', g: 'Táctica', t: 'Se responde con una pregunta concreta' },
  { w: 'Preguntar qué pasa si contesto el jueves', gen: 'Papel', n: 'La usas tú', g: 'Antídoto', t: 'Devuelve el tiempo sin pelear' },
  { w: 'El color de una portada', gen: 'Momento', n: 'Barato de deshacer', g: 'Se decide en caliente', t: 'No hace falta hoja' },
  { w: 'Ceder la autoría del material', gen: 'Momento', n: 'Caro de deshacer', g: 'Nunca en caliente', t: 'Va en la hoja del reloj' },
  { w: 'Contestar una vez y de forma definitiva', gen: 'Contra qué sirve', n: 'Insistencia', g: 'Contra el desgaste', t: 'El que insiste espera un día malo' },
  { w: 'Mandar la respuesta el lunes por escrito', gen: 'Contra qué sirve', n: 'Testigos', g: 'Contra el público', t: 'Saca la decisión de la sala' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La presión no cambia los hechos: cambia el ___.', opts: ['reloj', 'precio', 'trato'], ans: 'reloj' },
  { s: 'La señal de alarma son las ganas de que ___.', opts: ['se acabe', 'suba', 'llame'], ans: 'se acabe' },
  { s: 'La urgencia real trae un ___ que se entiende a la primera.', opts: ['porque', 'papel', 'plazo'], ans: 'porque' },
  { s: 'La escasez de verdad se puede ___.', opts: ['contar', 'discutir', 'pedir'], ans: 'contar' },
  { s: 'El ___ esconde lo que no aguantaría solo.', opts: ['paquete', 'descuento', 'contrato'], ans: 'paquete' },
  { s: 'La autoridad prestada se contesta pidiendo el ___.', opts: ['documento', 'precio', 'plazo'], ans: 'documento' },
  { s: 'La frase de bolsillo es «no ___ hoy».', opts: ['decido', 'firmo', 'contesto'], ans: 'decido' },
  { s: 'Todo lo urgente se pide por ___.', opts: ['escrito', 'telefono', 'favor'], ans: 'escrito' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica por qué la presión no da información nueva y qué es lo único que cambia.', ans: 'Porque ninguna táctica de presión dice nada sobre lo que te ofrecen: el trato es exactamente el mismo antes y después de que aparezca la prisa. Lo único que cambia es el tiempo que tienes para mirarlo, y esa es toda la técnica. Por eso el resumen de la etapa cabe en una línea: una decisión que no aguanta veinticuatro horas casi nunca es una decisión, es una rendición. Y por eso funciona la comprobación más simple, que es preguntar qué pasa exactamente si se contesta el jueves. Si la respuesta es «nada», no había urgencia; si hay un motivo real, se dice en diez segundos y se entiende a la primera.' },
  { q: 'Di cuál es la señal de alarma de esta etapa y por qué es tan fiable.', ans: 'Las ganas de que se acabe. Es fiable porque no depende de analizar el trato, que es justo lo que la prisa impide: se nota en el cuerpo antes de que la cabeza tenga tiempo de razonar nada. Y dice algo muy concreto: cuando lo que más quieres es salir de la conversación, ya no estás decidiendo el asunto, estás decidiendo dejar de sentir la presión. Son dos decisiones distintas y la segunda se paga después, cuando el alivio se acaba y queda el compromiso. La ventaja práctica es que la señal aparece igual con las siete tácticas, así que no hace falta saber cuál te están haciendo para saber que hay que parar.' },
  { q: '¿En qué se distingue una urgencia real de una fabricada? Da la prueba corta.', ans: 'La real viene de un calendario que existe sin ti: una convocatoria que cierra, un año escolar que empieza, un pago que vence. Se comprueba en un papel, la explica cualquiera en una frase y sigue siendo verdad aunque digas que no. La fabricada nació dentro de la conversación, no se puede comprobar, solo se explica repitiendo que es urgente y, si dices que no, se estira sola: la oferta que caducaba anoche sigue viva mañana. La prueba corta es pedir tres días en voz alta: «necesito hasta el jueves». Casi nada de lo que de verdad importa se rompe en tres días, y lo que se rompe era una trampa o era un favor que te estaban haciendo a ti. En los dos casos conviene enterarse.' },
  { q: 'Explica por qué la deuda y el público duelen más que el reloj o la escasez.', ans: 'Porque no aprietan el bolsillo, aprietan la relación. El reloj y la escasez juegan con el miedo a perder algo, que es incómodo pero se calcula: se mira la lista, se ve si hacía falta y se decide. La deuda cobra un favor viejo que además fue real, así que se siente verdadera; lo que no es verdad es que la deuda sea infinita ni que se cobre en la moneda que decida el otro. El público no cambia el trato: cambia el precio de decir que no, porque nadie quiere quedar como el que traba la reunión. Las dos se contestan igual, reconociendo lo que hay de cierto y cambiando el terreno: al favor se le da las gracias en voz alta y se propone otra forma de devolverlo; con el público se saca la decisión de la sala y se manda por escrito después.' },
  { q: '¿Qué es el desgaste y por qué no se le puede ganar pensando mejor?', ans: 'Es la insistencia repartida en el tiempo: volver cada semana con lo mismo, siempre de forma amable y pidiendo un poco más. Ninguna de las veces es presión, y por eso no se ve; las cuatro juntas sí lo son. No se le gana pensando mejor porque quien insiste no está esperando un argumento nuevo: está esperando un día malo, y todo el mundo tiene días malos. La defensa no es intelectual, es de procedimiento: tener la decisión escrita en frío, contestar una sola vez de forma definitiva y por escrito, ofrecer avisar tú si algo cambia y dejar de contestar los recordatorios. Ceder de cansancio es la peor manera de aceptar algo, porque después ni siquiera se sabe por qué se dijo que sí.' },
  { q: 'Cuenta los tres movimientos del antídoto y por qué el primero no se puede saltar.', ans: 'Parar el reloj, sacar la decisión de la sala y volver al criterio escrito en frío. El primero es una frase de bolsillo que se dice siempre igual y sin enfado: «no decido hoy». No se puede saltar porque los otros dos necesitan tiempo, y el tiempo es justo lo que la presión te está quitando; si no se para el reloj primero, sacar la decisión de la sala se convierte en una excusa que hay que defender allí mismo, y volver al criterio no llega a pasar. El segundo movimiento es no decidir delante de quien presiona ni con público, y el tercero es mirar lo que uno decidió en frío, antes de que llegara nadie. El criterio tiene una ventaja sobre uno mismo: no discute, no se cansa y no queda mal con nadie.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['PRESION', 'RELOJ', 'ESCASEZ', 'JUEVES', 'PLAZO', 'CRITERIO']),
  haceSopa(10, ['PAQUETE', 'DEUDA', 'PUBLICO', 'DESGASTE', 'FRASE', 'SALIDA']),
  haceSopa(10, ['URGENCIA', 'ESCRITO', 'MOTIVO', 'FRIO', 'CUPO', 'PRISA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'La presión cambia lo que te ofrecen.', a: false },
  { q: 'Lo único que cambia una táctica de presión es el tiempo que tienes.', a: true },
  { q: 'Las ganas de que se acabe son la señal de alarma de esta etapa.', a: true },
  { q: 'Una urgencia real se explica repitiendo que es urgente.', a: false },
  { q: 'Si la oferta sigue viva mañana, la escasez era fabricada.', a: true },
  { q: 'El paquete de todo o nada suele esconder la parte que no aguanta sola.', a: true },
  { q: '«Ya lo aprobó la Secretaría», sin papel, es un dato comprobado.', a: false },
  { q: 'Pedir el documento a quien cita una aprobación es desconfiar de la persona.', a: false },
  { q: 'La deuda aprieta la relación y no el bolsillo.', a: true },
  { q: 'El público cambia el precio de decir que no.', a: true },
  { q: 'Contra el desgaste lo que funciona es dar más argumentos.', a: false },
  { q: 'La frase de bolsillo se dice siempre igual y sin explicación.', a: true },
  { q: 'Lo urgente se pide por escrito, porque una urgencia inventada casi nunca se escribe.', a: true },
  { q: 'Saber cuál es tu alternativa antes hace que la presión funcione mejor.', a: false },
  { q: 'El criterio escrito en frío no se cansa ni queda mal con nadie.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: 'Una táctica de presión te quita…', o: ['a) Dinero', 'b) Tiempo de pensar', 'c) Opciones legales', 'd) Información'], a: 1 },
  { q: 'La señal de alarma de la etapa es…', o: ['a) El enfado', 'b) La duda', 'c) Las ganas de que se acabe', 'd) La curiosidad'], a: 2 },
  { q: 'La urgencia real se reconoce porque…', o: ['a) La dice alguien con autoridad', 'b) Trae un porqué que se comprueba', 'c) Viene con contador', 'd) Se repite mucho'], a: 1 },
  { q: 'Si dices que no y mañana quedan tres cupos, eso era…', o: ['a) Un error del sistema', 'b) Una segunda oportunidad', 'c) Escasez fabricada', 'd) Buena suerte'], a: 2 },
  { q: 'La pregunta que abre un paquete es…', o: ['a) «¿Me haces descuento?»', 'b) «¿Cuánto cuesta solo esta parte?»', 'c) «¿Hay garantía?»', 'd) «¿Quién más lo tiene?»'], a: 1 },
  { q: 'Ante «esto ya lo aprobó la Secretaría» lo que se hace es…', o: ['a) Aceptarlo', 'b) Discutir la autoridad', 'c) Pedir el documento', 'd) Consultarlo con otro'], a: 2 },
  { q: 'La deuda es difícil porque…', o: ['a) El favor recibido era real', 'b) Siempre implica dinero', 'c) La dice un desconocido', 'd) No se puede comprobar'], a: 0 },
  { q: 'Contra el público, la salida es…', o: ['a) Decir que no con firmeza', 'b) Pedir votación secreta', 'c) Sacar la decisión de la sala', 'd) Salir de la reunión'], a: 2 },
  { q: 'El desgaste espera…', o: ['a) Un argumento nuevo', 'b) Un día malo', 'c) Un cambio de precio', 'd) Una reunión más'], a: 1 },
  { q: 'La frase de bolsillo de esta etapa es…', o: ['a) «Lo pensaré»', 'b) «No decido hoy»', 'c) «Hablemos otro día»', 'd) «No me presiones»'], a: 1 },
  { q: '¿Por qué conviene pedir la urgencia por escrito?', o: ['a) Para poder demandar', 'b) Porque casi nadie escribe una urgencia inventada', 'c) Para ganar tiempo legal', 'd) Porque es más formal'], a: 1 },
  { q: 'La prueba de los tres días consiste en…', o: ['a) Esperar tres días sin contestar', 'b) Pedir hasta el jueves y ver qué pasa', 'c) Consultar con tres personas', 'd) Dar tres opciones'], a: 1 },
  { q: 'La salida, en esta etapa, es…', o: ['a) La puerta de la reunión', 'b) Qué haces tú si esto no pasa', 'c) La excusa que se usa', 'd) El plazo que pides'], a: 1 },
  { q: 'El criterio se escribe…', o: ['a) Durante la reunión', 'b) Al terminar el trato', 'c) En frío, antes de que llegue nadie', 'd) Cuando aparece la duda'], a: 2 },
  { q: '¿Qué se decide siempre en caliente?', o: ['a) Un precio anual', 'b) La autoría del material', 'c) La hora de la próxima reunión', 'd) Datos de menores'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La presión no cambia los hechos: cambia el ___.', a: 'reloj' },
  { q: 'La señal de alarma son las ganas de que ___.', a: 'se acabe' },
  { q: 'La urgencia real trae un porqué que se ___.', a: 'comprueba' },
  { q: 'La escasez de verdad se puede ___.', a: 'contar' },
  { q: 'El ___ esconde lo que no aguantaría solo.', a: 'paquete' },
  { q: 'La autoridad prestada se contesta pidiendo el ___.', a: 'documento' },
  { q: 'La deuda aprieta la ___ y no el bolsillo.', a: 'relacion' },
  { q: 'El público cambia el ___ de decir que no.', a: 'precio' },
  { q: 'El desgaste no espera un argumento: espera un día ___.', a: 'malo' },
  { q: 'La frase de bolsillo es «no ___ hoy».', a: 'decido' },
  { q: 'Todo lo urgente se pide por ___.', a: 'escrito' },
  { q: 'La prueba corta es pedir hasta el ___.', a: 'jueves' },
  { q: 'La ___ es saber qué haces tú si esto no pasa.', a: 'salida' },
  { q: 'El criterio se escribe en ___, antes de que llegue nadie.', a: 'frio' },
  { q: 'No se decide delante de quien ___.', a: 'presiona' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'La presión', def: 'Quita tiempo de pensar sin dar información nueva' },
  { term: 'La señal de alarma', def: 'Las ganas de que la conversación se acabe' },
  { term: 'Urgencia real', def: 'Viene de un calendario que existe sin ti' },
  { term: 'Urgencia fabricada', def: 'Solo se explica repitiendo que es urgente' },
  { term: 'El reloj', def: 'La respuesta tiene que ser hoy' },
  { term: 'La escasez', def: 'Quedan dos y se acaban' },
  { term: 'El paquete', def: 'Todo junto o nada' },
  { term: 'La autoridad prestada', def: 'Una aprobación que se cita y no se enseña' },
  { term: 'La deuda', def: 'Un favor viejo cobrado sin fin' },
  { term: 'El público', def: 'Testigos que encarecen decir que no' },
  { term: 'El desgaste', def: 'Insistir hasta que el otro cede de cansancio' },
  { term: 'La frase de bolsillo', def: 'No decido hoy' },
  { term: 'La salida', def: 'Qué haces tú si esto no pasa' },
  { term: 'El criterio', def: 'Lo decidido en frío y por escrito' },
  { term: 'La prueba de los tres días', def: 'Pedir hasta el jueves y mirar qué se rompe' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Un director pide la propuesta completa para mañana a primera hora. Son las seis de la tarde de un jueves y el viernes es feriado, con el centro cerrado.' },
  { txt: 'Una plataforma para centros educativos enseña un contador en pantalla: quedan dos cupos en el programa y el plazo termina esta noche.' },
  { txt: 'Un proveedor de imprenta ofrece diseño, impresión y distribución en un solo trato: o entra el paquete completo o no puede hacer ninguna de las tres.' },
  { txt: 'Un técnico dice en una reunión que el cambio ya lo aprobó la Secretaría. Nadie enseña ningún papel y la frase cierra la discusión sola.' },
  { txt: 'El colega que te consiguió la primera reunión pide ahora todo el material del año gratis para su centro, y lo pide recordando aquel favor.' },
  { txt: 'Viernes a las cinco, los seis del claustro quieren votar el punto antes de irse. Se trata de un precio para todo el año escolar.' },
  { txt: 'Es el cuarto mensaje del mes sobre lo mismo. Todos amables, todos cortos, y cada uno pide un poco más que el anterior.' },
  { txt: 'Una herramienta de diseño ofrece el año a mitad de precio y el descuento se acaba esta noche. No estaba en la lista de lo que hacía falta.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué táctica de presión es, y qué está apretando de verdad?',
  '2. ¿Qué pasa exactamente si se contesta el jueves?',
  '3. ¿Qué se pide por escrito antes de decidir nada?',
  '4. Escribe en 3-4 frases cómo paras el reloj sin romper la relación.',
]);

B.critCaseGuides = JSON.stringify([
  'Se nombra la táctica (reloj, escasez, paquete, autoridad prestada, deuda, público o desgaste) y se dice dónde aprieta: el bolsillo o la relación. Las que aprietan la relación duelen más y se ven menos.',
  'Casi siempre la respuesta honesta es «nada». Si hay algo de verdad, se explica en una frase y se comprueba; si aparecen rodeos, el rodeo es la respuesta.',
  'El motivo y el plazo. Nadie pone por escrito una urgencia inventada, porque escrita se convierte en una promesa que se puede enseñar después.',
  'Se acepta lo que hay de cierto en voz alta, se dice la frase de bolsillo sin enfado («no decido hoy»), se pone fecha propia y se saca la decisión de la sala. Nada de discutir si la urgencia es real: no hace falta ganar esa discusión.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Si me lo piden para mañana, será que es urgente".', g1: 'La urgencia se comprueba, no se supone. La pregunta cuesta cinco segundos: qué pasa exactamente si contesto el jueves. Si hay motivo, se dice en una frase; si no lo hay, la fecha se mueve sola.', g2: 'Y hay un costo escondido: lo escrito de madrugada casi siempre lleva un número equivocado, así que aceptar el plazo sale más caro que pedirlo.' },
  { txt: '"Le dije que no y me insistió, así que algo bueno tendrá".', g1: 'Insistir no es un argumento. El que vuelve cada semana no espera una razón nueva: espera un día malo, y todos los tenemos.', g2: 'La respuesta es de procedimiento y no de convencimiento: se contesta una vez, por escrito y de forma definitiva, y se ofrece avisar uno mismo si algo cambia.' },
  { txt: '"Firmé ahí mismo para no quedar mal delante de todos".', g1: 'Eso es exactamente lo que hace el público: no cambia el trato, cambia el precio de decir que no.', g2: 'La salida no es valentía, es procedimiento dicho como norma propia: «no cierro dinero en una reunión, lo mando por escrito el lunes». Dicho así nadie lo discute.' },
  { txt: '"Aproveché el descuento porque se acababa esa noche".', g1: 'La pregunta no es si el descuento existe, que suele ser verdad, sino si la herramienta hacía falta antes de que apareciera el descuento.', g2: 'Si estaba en la lista, se compra sin mirar el reloj; si no estaba, no se compra hoy. Y conviene saberlo: estas ofertas vuelven, casi siempre el mes siguiente.' },
  { txt: '"Me hicieron un favor grande, así que no podía negarme".', g1: 'El favor era real y se reconoce en voz alta, sin regatearlo. Lo que no es verdad es que la deuda sea infinita ni que se cobre en la moneda que decida el otro.', g2: 'Un favor se devuelve; no se convierte en una suscripción. Se propone algo concreto que sí se pueda sostener, con su plazo.' },
  { txt: '"Como el paquete salía más barato, lo tomé entero".', g1: 'Más barato que qué. El paquete junta una parte buena, una normal y una cara para que se aprueben las tres de una vez.', g2: 'La pregunta que lo abre es «¿cuánto cuesta solo esto?». Si no hay manera de separarlo, no es una oferta: es una condición, y las condiciones se negocian con calma.' },
]);

B.critDecisionBank = JSON.stringify([
  'Una propuesta pedida para mañana a primera hora, con el centro cerrado el viernes: ¿se manda de madrugada o se propone otra fecha?',
  'Un contador en pantalla que dice que quedan dos cupos: ¿se toma el cupo o se pide algo antes?',
  'Un paquete de imprenta que no se puede separar: ¿se acepta entero, se parte o se deja?',
  'Una aprobación citada en reunión y sin papel a la vista: ¿se da por buena o se pide algo, y cómo se pide sin ofender?',
  'Un favor viejo y real que ahora se cobra en material gratis para todo el año: ¿se paga, se niega o se propone otra cosa?',
  'Un precio anual que quieren votar el viernes a las cinco delante del claustro: ¿se vota o se saca de la sala?',
  'El cuarto recordatorio amable del mes sobre lo mismo: ¿se contesta otra vez o se cierra de una manera distinta?',
  'Un descuento que caduca esta noche sobre algo que no estaba en la lista: ¿se aprovecha o se deja pasar?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Preguntar qué pasa exactamente si se contesta el jueves.', b: 'Explicar por qué hoy no se puede contestar.', ga: 'Caso A: devuelve el tiempo sin pedir permiso y pone la carga donde corresponde, que es en quien puso la prisa. Además da información: si hay motivo real, se conoce en una frase.', gb: 'Caso B: convierte tu agenda en el tema de la conversación, y a partir de ahí cualquiera puede discutirla o proponerte un hueco.' },
  { a: 'Pedir por escrito el motivo y el plazo.', b: 'Discutir en voz alta si la urgencia es real.', ga: 'Caso A: no acusa a nadie, se hace en un mensaje y casi nadie escribe una urgencia inventada. Se resuelve solo.', gb: 'Caso B: convierte una conversación de negocio en una pelea sobre la sinceridad del otro, que no se puede ganar y deja resentimiento aunque se gane.' },
  { a: 'Decir la frase de bolsillo, siempre la misma y sin enfado.', b: 'Inventar una excusa distinta cada vez.', ga: 'Caso A: no hay que pensarla en el momento, que es cuando peor se piensa, y al repetirla se convierte en una norma conocida que nadie discute.', gb: 'Caso B: cada excusa se puede rebatir, y quien la oye aprende cuál funciona contigo; a la tercera vez ya sabe cómo empujar.' },
  { a: 'Contestar una sola vez, por escrito y de forma definitiva.', b: 'Ir contestando cada recordatorio con un poco más de paciencia.', ga: 'Caso A: corta el desgaste en su raíz, porque quita lo único que espera quien insiste, que es una siguiente oportunidad.', gb: 'Caso B: alarga la conversación hasta un día malo, y ese día se cede de cansancio y sin razones nuevas.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se acepta un plazo que nadie justificó.', guide: 'Se pierde el tiempo de revisar y aparecen los errores caros: precios mal calculados, condiciones sin leer, compromisos que no se pueden sostener. La prisa no cambia el trato, cambia la calidad de tu revisión.' },
  { cause: 'Se decide delante de un grupo que espera para irse.', guide: 'El precio de decir que no sube tanto que la decisión deja de ser sobre el asunto y pasa a ser sobre no quedar mal. Se firma lo que no se habría firmado a solas.' },
  { cause: 'No se tiene escrito qué no se decide en caliente.', guide: 'La lista se improvisa a las cinco de la tarde de un viernes, con ganas de irse, que es el peor momento posible para inventar un criterio.' },
  { cause: 'Se contesta cada recordatorio con un poco más de paciencia.', guide: 'El desgaste se alarga hasta un día malo y entonces se cede de cansancio, sin razones nuevas y sin saber después por qué se dijo que sí.' },
  { cause: 'Se confunde devolver un favor con aceptar una deuda sin fin.', guide: 'El favor era real, así que la culpa también se siente real. Pero la deuda pasa a cobrarse en la moneda que decida el otro y sin fecha de término, que es lo que la vuelve impagable.' },
  { cause: 'Se compra algo que no estaba en la lista porque el descuento caducaba.', guide: 'El ahorro es verdadero y aun así se gasta de más, porque lo que se compra no hacía falta. La lista escrita antes es lo único que distingue una oferta de una trampa.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Una urgencia se desinfló sola en un mensaje.', guide: 'Se pidió el motivo y el plazo por escrito. Casi nadie escribe una urgencia inventada, porque escrita se puede enseñar después.' },
  { effect: 'Una reunión terminó sin acuerdo y nadie se molestó.', guide: 'Se dijo como norma propia y no como excusa del día: «no cierro dinero en reunión, lo mando por escrito el lunes». Dicho como norma, no se discute.' },
  { effect: 'Un paquete de tres servicios se quedó en uno solo.', guide: 'Se preguntó cuánto costaba por separado la parte que sí hacía falta. Lo que no aguanta solo se cae en cuanto se le quita la compañía.' },
  { effect: 'Un descuento se dejó pasar sin arrepentimiento.', guide: 'No estaba en la lista escrita en frío. Y volvió el mes siguiente, igual, que es lo que suele pasar con estas ofertas.' },
  { effect: 'Un favor viejo se devolvió sin perder el proyecto.', guide: 'Se reconoció en voz alta y se propuso algo concreto y sostenible: precio de aliado durante un año en vez de todo el material gratis para siempre.' },
  { effect: 'La insistencia semanal se acabó de golpe.', guide: 'Se contestó una vez, por escrito y de forma definitiva, ofreciendo avisar uno mismo si algo cambiaba. Se le quitó lo único que esperaba, que era otra oportunidad.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '⏱️', label: 'El reloj', text: '«Tiene que ser hoy». <strong>Qué aprieta:</strong> el tiempo de pensar. <strong>Cómo se reconoce:</strong> nadie explica qué pasa mañana. <strong>El antídoto:</strong> «¿qué pasa exactamente si contesto el jueves?».' },
  { y: '2', icon: '📉', label: 'La escasez', text: 'Quedan dos y se acaban. <strong>Qué aprieta:</strong> el miedo a perderlo. <strong>Cómo se reconoce:</strong> no se puede contar, y si dices que no, mañana quedan tres. <strong>El antídoto:</strong> pedirlo por escrito.' },
  { y: '3', icon: '📦', label: 'El paquete', text: 'Todo junto o nada. <strong>Qué aprieta:</strong> lo que sí hacía falta, para colar lo demás. <strong>Cómo se reconoce:</strong> una parte buena, una normal y una cara. <strong>El antídoto:</strong> «¿cuánto cuesta solo esto?».' },
  { y: '4', icon: '🎖️', label: 'La autoridad prestada', text: '«Ya está aprobado». <strong>Qué aprieta:</strong> las ganas de no llevar la contraria. <strong>Cómo se reconoce:</strong> nadie enseña el papel. <strong>El antídoto:</strong> «pásame el documento», sin poner en duda a la persona.' },
  { y: '5', icon: '🧾', label: 'La deuda', text: '«Después de todo lo que hicimos por ti». <strong>Qué aprieta:</strong> la relación, no el bolsillo. <strong>Cómo se reconoce:</strong> el favor era real y la deuda no tiene fin. <strong>El antídoto:</strong> agradecer y proponer otra forma.' },
  { y: '6', icon: '🎪', label: 'El público', text: 'Decidir delante de gente. <strong>Qué aprieta:</strong> el precio de decir que no. <strong>Cómo se reconoce:</strong> el asunto es serio y la sala está llena. <strong>El antídoto:</strong> sacar la decisión de la sala.' },
  { y: '7', icon: '🪨', label: 'El desgaste', text: 'Volver cada semana. <strong>Qué aprieta:</strong> la paciencia. <strong>Cómo se reconoce:</strong> ninguna vez es presión y las cuatro juntas sí. <strong>El antídoto:</strong> contestar una vez, por escrito y de forma definitiva.' },
]);

B.parteData = JSON.stringify({
  reloj: {
    nombre: 'El reloj', icon: '⏱️',
    estructura: { title: 'Qué es', info: '• El tiempo que tienes para pensarlo<br>• Es <strong>lo único</strong> que cambia una táctica de presión<br>• Por eso recuperarlo desarma casi todas de una vez' },
    funcion: { title: 'Cómo se usa', info: '• Se pregunta en voz alta y sin ironía: <strong>«¿qué pasa si contesto el jueves?»</strong><br>• Si hay motivo real, se explica en una frase<br>• Si aparecen rodeos, <strong>el rodeo es la respuesta</strong>' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Se acepta un plazo que nadie justificó<br>• Y lo escrito de madrugada lleva un número equivocado<br>• Después se defiende ese número durante un año' },
    cuidados: { title: 'En M.E.T.A.S', info: '• El plazo propio se dice <strong>antes</strong> de que lleguen las prisas<br>• Toda propuesta de precio se manda <strong>al día siguiente</strong><br>• Y ninguna sale de madrugada, por norma' },
  },
  criterio: {
    nombre: 'El criterio', icon: '📋',
    estructura: { title: 'Qué es', info: '• Lo que decidiste <strong>en frío</strong>, escrito antes de que llegara nadie<br>• Qué no se decide en caliente y cuál es tu precio<br>• No es rigidez: es tener con qué comparar' },
    funcion: { title: 'Cómo se usa', info: '• Se lee <strong>antes</strong> de la conversación, no durante<br>• Se contesta desde él: «esto no está en lo que hago este año»<br>• Y se revisa después, con calma, si de verdad hacía falta' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Se improvisa a las cinco de un viernes con ganas de irse<br>• Cada conversación empieza de cero y cansa el doble<br>• Y lo decidido depende del ánimo de ese día' },
    cuidados: { title: 'En M.E.T.A.S', info: '• La lista de lo que no se decide en caliente: <strong>dinero, autoría, datos de menores y compromisos de más de un mes</strong><br>• Está escrita y cabe en media página<br>• Es la misma que se lleva a cualquier reunión' },
  },
  salida: {
    nombre: 'La salida', icon: '🚪',
    estructura: { title: 'Qué es', info: '• Qué haces tú <strong>si esto no pasa</strong><br>• Pensada antes de necesitarla, no en el momento<br>• Es lo que hace que «se cae el trato» no dé miedo' },
    funcion: { title: 'Cómo se usa', info: '• Se escribe en una línea, con nombre y fecha<br>• Se compara con lo que te ofrecen, no con el vacío<br>• Se mejora entre reunión y reunión, que es cuando se puede' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Cualquier oferta parece la única<br>• Y la presión funciona sola, sin que nadie tenga que empujar<br>• Se acepta por miedo y se justifica después' },
    cuidados: { title: 'En M.E.T.A.S', info: '• Si un centro no firma, <strong>quedan los otros y queda el material</strong><br>• Las fichas funcionan en papel sin ninguna plataforma<br>• Eso, escrito, es lo que permite decir que no sin temblar' },
  },
  guion: {
    nombre: 'El guion', icon: '🗣️',
    estructura: { title: 'Qué es', info: '• Las frases de bolsillo, <strong>escritas tal como se van a decir</strong><br>• La primera y la más importante: «no decido hoy»<br>• Se llevan aprendidas para no inventarlas en el momento' },
    funcion: { title: 'Cómo se usa', info: '• Siempre igual, <strong>sin enfado y sin explicación</strong><br>• Dicho como norma propia, no como excusa del día<br>• Y con una fecha propia detrás: «te contesto el lunes»' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Se improvisa una excusa distinta cada vez<br>• Cada excusa se puede rebatir, y la otra persona aprende cuál funciona<br>• A la tercera vez ya sabe por dónde empujar' },
    cuidados: { title: 'En M.E.T.A.S', info: '• «No cierro dinero en una reunión; lo mando por escrito el lunes»<br>• «Pásame el documento y lo leo esta semana»<br>• «¿Cuánto cuesta solo esa parte?»' },
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
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: si lo que más quieres es que la conversación se acabe, no estás decidiendo, así que lo primero es parar el reloj con la frase de bolsillo, que se dice siempre igual y sin enfado. No se discute si la urgencia es real: se pregunta qué pasa exactamente si se contesta el jueves y se pide el motivo y el plazo por escrito, que es donde casi todas las urgencias inventadas se caen solas. Nada de dinero, autoría, datos de menores ni compromisos de más de un mes se decide en caliente, delante de quien presiona ni con público. Y contra quien insiste cada semana no valen más argumentos: se contesta una vez, por escrito y de forma definitiva.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  [/🖼️ \*Ruta de la Persuasión · Etapa 3\* 🖼️/g, '⏱️ *Ruta de la Persuasión · Etapa 4* ⏱️'],
  [/Los ocho sesgos que deciden por ti antes de que llegue nadie, y la hoja para decidir en frío\. 🪞/g,
   'Las siete tácticas que te quitan el tiempo de pensar, y la hoja del reloj para aguantarlas sin romper nada. ⏱️'],
  [/_Incluye evaluación conceptual y quién puso el marco\._ ✍️/g, '_Incluye evaluación conceptual y aguantar el reloj._ ✍️'],
  [/Quién puso el marco/g, 'Aguantar el reloj'],
  [/quién puso el marco/g, 'aguantar el reloj'],
  [/Marcos, quien pone el marco gana la conversación/g, 'Tácticas de presión y sus antídotos'],
  [/Ruta de la Persuasión · Etapa 3: Marcos/g, 'Ruta de la Persuasión · Etapa 4: Tácticas de presión'],
  [/Evaluación Final · Marcos ·/g, 'Evaluación Final · Tácticas de presión ·'],
  [/· Marcos ·/g, '· Tácticas de presión ·'],
  [/Final: los marcos/g, 'Final: las tácticas de presión'],
  [/Etapa 3 · Psicología y Persuasión/g, 'Etapa 4 · Psicología y Persuasión'],
  [/🖼️ ¡/g, '⏱️ ¡'],
  [/completó la Etapa 3 de la Ruta de la Persuasión/g, 'completó la Etapa 4 de la Ruta de la Persuasión'],
  /* la sección I venía con el nombre que el molde arrastra desde Poder Político */
  [/I\. Simulacro de Presión: la interpelación/g, 'I. El reloj sobre la mesa'],
  /* los mensajes de la constancia eran de una misión todavía más vieja */
  [/\['¡Sigue estudiando tu sistema!','¡Muy buen trabajo!','¡Excelente gestor en formación!','¡Sabes por dónde se mueve esto!','¡Estratega institucional!'\]/g,
   "['¡Sigue notando las prisas!','¡Muy buen trabajo!','¡Ya distingues la urgencia real de la fabricada!','¡Paras el reloj sin romper nada!','¡Llegas con el criterio escrito!']"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV seguían siendo las de la etapa 3 */
src = src.replace(/¿Cuál es el marco, qué preocupación legítima hay debajo y cómo lo reencuadras en tres movimientos\? Explica por qué tu salida es mejor que contestar dentro del marco o que rechazar de plano\./g,
  '¿Qué táctica de presión es, qué está apretando de verdad y qué pasa exactamente si contestas el jueves? Explica por qué parar el reloj es mejor que ceder ahí mismo o que discutir si la urgencia es real.');
src = src.replace(/1\. ¿Cuál de las dos respuestas cambia el terreno de la conversación\? 2\. ¿Por qué la otra confirma el marco ajeno\?/g,
  '1. ¿Cuál de las dos respuestas te devuelve el tiempo sin romper la relación? 2. ¿Por qué la otra deja el reloj en manos del que presiona?');

/* el desenlace de la simulación seguía narrando la pregunta de la etapa 3 */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(paraElReloj){sfx(paraElReloj?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(paraElReloj){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">⏸️</span><span class="ms-text"><strong>Lo dijiste como norma:</strong> «no cierro dinero en una reunión; les mando la respuesta el lunes por escrito». Nadie discutió, porque no era una excusa del día.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✅</span><span class="ms-text"><strong>Y el lunes el precio salió distinto:</strong> con la hoja delante y sin seis personas esperando, aparecieron dos condiciones que el viernes no se habrían escrito.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">✍️</span><span class="ms-text"><strong>Cerraste ahí:</strong> la reunión terminó a tiempo y todos se fueron contentos, tú el primero, por el alivio.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🧾</span><span class="ms-text"><strong>Y el precio dura todo el año:</strong> el alivio se acabó el sábado y el compromiso sigue en septiembre. Eso no fue decidir: fue dejar de sentir la presión.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='marco',labAspecto='estructura';/, "let labParte='reloj',labAspecto='estructura';");
/* y el botón que se resalta al abrir: si no coincide, el laboratorio abre sin nada marcado */
src = src.replace(/(document\.querySelector\('\[data-parte=")[a-zA-Z]+("\]')/, '$1reloj$2');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
