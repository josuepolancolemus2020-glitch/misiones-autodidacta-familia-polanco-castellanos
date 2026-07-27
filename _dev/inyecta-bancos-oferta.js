/* Inyecta los bancos de la misión «La oferta: qué se entrega y a qué precio»
   (Ruta de la Marca, etapa 2) sobre el molde copiado de la etapa 1 de su ruta.
   Uso:  node _dev/inyecta-bancos-oferta.js
   Reemplaza líneas completas que empiezan por `const <nombre>=` y después barre
   los textos sueltos del motor que traían el nombre de la etapa 1.
   (El inyector de la etapa 1 quedó guardado en _dev/inyecta-bancos-marca-etapa1.js.) */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-marca-oferta', 'js', 'oferta.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260727;
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
B.SAVE_KEY = `'faro_mkt_oferta_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la oferta superado' },
  flash_master: { icon: '🃏', label: 'Todas las piezas de la oferta exploradas' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de promesa y oferta experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la oferta maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la oferta' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta de la Marca completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Promete y no cobra 🗣️' },
  { t: 25, n: 'Sabe qué entrega 📦' },
  { t: 55, n: 'Escribe el no incluye 🚫' },
  { t: 90, n: 'Le pone plazo y forma de pago 📅' },
  { t: 130, n: 'Cobra por valor, no por horas 💎' },
  { t: 165, n: 'Arma la escalera 🪜' },
  { t: 190, n: 'Cierra la oferta de una página 🏷️' },
]);

B.fcData = JSON.stringify([
  { w: 'Promesa', a: '🗣️ Lo que alguien <strong>recuerda del proyecto cuando uno no está</strong>: «esto me salva la clase del lunes». Se regala, se repite y se recomienda. No se cobra, porque no se entrega: se cumple.' },
  { w: 'Oferta', a: '🏷️ Lo que alguien <strong>recibe a cambio de un pago</strong>, escrito y comprobable: un objeto, un plazo, un precio y una salida. Cabe en una hoja, y por eso se puede cobrar.' },
  { w: 'Resultado prometido', a: '🎯 Qué queda distinto <strong>en la vida de quien paga</strong>, no en la del que cobra. Se rompe al describir lo que hace el producto en vez de lo que le pasa a la persona.' },
  { w: 'Entregable', a: '📦 El objeto concreto que se entrega y del que <strong>se puede comprobar que llegó</strong>. «Acompañamiento» y «acceso a la plataforma» no son entregables: son humo con nombre técnico.' },
  { w: 'Alcance', a: '📏 Hasta dónde llega lo que se entrega, contado en <strong>unidades que el otro entiende</strong>: una ficha, un aula, un mes. En horas propias no se entiende ni se compara.' },
  { w: 'No incluye', a: '🚫 La lista de lo que <strong>queda fuera del precio</strong>. Es la pieza que casi nadie escribe y la que evita casi todos los pleitos: lo que no está ahí se va a pedir gratis.' },
  { w: 'Plazo', a: '📅 La fecha de entrega y <strong>qué pasa si se atrasa</strong>. «Cuando esté listo» pierde la confianza sin haber cobrado un peso de más.' },
  { w: 'Precio', a: '💵 La cifra que se cobra, sacada del <strong>valor y no de las horas</strong>. Cobrar por horas castiga al que trabaja rápido y bien.' },
  { w: 'Forma de pago', a: '🧾 Cuándo se cobra, por qué medio y en cuántas partes. En M.E.T.A.S: <strong>por adelantado del 1 al 5</strong>. Admite pago en especie, siempre con precio puesto.' },
  { w: 'Prueba', a: '🔎 Lo que se puede <strong>abrir o comprobar hoy</strong> y hace creíble la oferta antes del pago. No es un adjetivo: es un objeto o una persona con nombre.' },
  { w: 'Salida', a: '🚪 Qué pasa <strong>si no sirve</strong>: devolución, cambio o cancelación, con plazo escrito. Es lo que quita el miedo de la primera compra.' },
  { w: 'Costo piso', a: '🧮 Lo que cuesta producir y sostener. Marca <strong>el mínimo</strong> por debajo del cual no se vende, y nada más: el costo es el piso, nunca el precio.' },
  { w: 'Precio por valor', a: '💎 Fijar la cifra por lo que la persona <strong>se ahorra o gana</strong>. Cuatro noches de domingo valen más que las doce horas que costó hacer la ficha.' },
  { w: 'Cobro por unidad', a: '🏷️ Una ficha, L 30. Sirve cuando la compra es <strong>puntual y se decide sola</strong>, sin pedirle permiso a nadie ni esperar presupuesto.' },
  { w: 'Suscripción', a: '📅 Un aula al mes, L 250. Sirve cuando <strong>el problema vuelve cada semana</strong>: el pago repetido paga un trabajo que también se repite.' },
  { w: 'Proyecto cerrado', a: '📐 Una vez, alcance fijo y <strong>rondas de cambios contadas</strong>. La misión a la medida: L 4.500, mitad al encargar y mitad al entregar, dos rondas incluidas.' },
]);

B.qzData = JSON.stringify([
  { q: 'Una maestra dice «me encanta, esto me salva el lunes» y no compra nada. ¿Qué falta?', o: ['a) Repetir más la promesa hasta que se convenza', 'b) La oferta: qué recibe, para cuándo y por cuánto', 'c) Bajar el precio para que se anime', 'd) Un logo que se vea más serio'], c: 1 },
  { q: 'Antes de contestar «¿y cuánto vale esto?», la primera pregunta que se hace uno es…', o: ['a) ¿Qué recibe exactamente y para cuándo?', 'b) ¿Cuántas horas me va a llevar?', 'c) ¿Cuánto cobra el que vende algo parecido?', 'd) ¿Cuánto puede pagar esta persona?'], c: 0 },
  { q: '¿Para qué sirve de verdad escribir el «no incluye»?', o: ['a) Para que la oferta se vea más completa', 'b) Para que cada cosa que van a pedir después tenga precio propio', 'c) Para tener con qué defenderse en un reclamo', 'd) Para que se note que uno trabaja en serio'], c: 1 },
  { q: 'Una ficha costó doce horas de trabajo y L 90 de internet. ¿Cómo se fija el precio?', o: ['a) Sumando las horas a una tarifa por hora', 'b) Costo más un margen del 30%', 'c) Igual que lo que cobra el que vende algo parecido', 'd) Por lo que le ahorra a la maestra que la usa'], c: 3 },
  { q: 'Una directora pregunta cuánto le cobra por sus seis aulas. ¿Qué se contesta?', o: ['a) «Lo que usted crea justo»', 'b) «¿Cuánto tiene de presupuesto?»', 'c) La primera cifra, con lo que incluye y lo que no', 'd) «Se lo paso por escrito la próxima semana»'], c: 2 },
  { q: 'Una red de veinte aulas pide la mitad de precio o no hay trato. Lo que sostiene el proyecto es…', o: ['a) Aceptar: veinte aulas son veinte aulas', 'b) Mantener el precio de lista y dejarlos ir', 'c) Dar el descuento solo el primer año', 'd) Bajar el precio quitando alcance y cobrar el año por adelantado'], c: 3 },
  { q: '¿Para qué existe el escalón gratis?', o: ['a) Para probar sin riesgo y empujar al escalón de pago', 'b) Para que el proyecto llegue a más gente', 'c) Para competir con lo que se regala en internet', 'd) Para que ninguna maestra se quede sin material'], c: 0 },
  { q: 'Una página con cuarenta mil seguidores ofrece publicaciones a cambio de las fichas gratis. ¿Qué se contesta?', o: ['a) Que sí: esa vitrina vale más que el dinero', 'b) Que no, porque la visibilidad no paga el internet', 'c) Que sí, como pago en especie con precio puesto y alcance limitado', 'd) Que sí, si dejan el enlace al sitio propio'], c: 2 },
  { q: 'Un cliente pide la cuarta ronda de cambios de una misión a la medida de L 4.500. ¿Qué falló antes?', o: ['a) El precio quedó bajo para ese trabajo', 'b) No se contaron las rondas de cambios dentro del alcance', 'c) Al cliente le gusta cambiar de opinión', 'd) Faltó ponerle fecha de entrega'], c: 1 },
  { q: '¿Cuál es la prueba de que una oferta quedó clara?', o: ['a) Que uno la pueda explicar de memoria', 'b) Que lleve precio en lempiras', 'c) Que quepa en una sola hoja', 'd) Que otra persona pueda repetir qué recibe y por cuánto'], c: 3 },
]);

B.classGroups = JSON.stringify([
  { label: ['Promesa', 'Oferta'], headA: '🗣️ Promesa', headB: '🏷️ Oferta', colA: 'ok', colB: 'no',
    words: [{ w: 'Tu clase del lunes lista', t: 'ok' }, { w: 'Ficha de 10 páginas por L 30', t: 'no' },
      { w: 'Que tu hijo no se atrase', t: 'ok' }, { w: 'Aula al mes por L 250', t: 'no' },
      { w: 'Material que no gasta datos', t: 'ok' }, { w: 'Misión a la medida en 10 días', t: 'no' },
      { w: 'Aquí nadie se queda atrás', t: 'ok' }, { w: 'Devolución a los 30 días', t: 'no' }] },
  { label: ['Incluye', 'No incluye'], headA: '✅ Sí incluye', headB: '🚫 No incluye', colA: 'ok', colB: 'no',
    words: [{ w: 'La ficha en PDF con su pauta', t: 'ok' }, { w: 'Imprimir las copias del aula', t: 'no' },
      { w: 'La misión abierta en el teléfono', t: 'ok' }, { w: 'Capacitación presencial', t: 'no' },
      { w: 'Versión imprimible en blanco y negro', t: 'ok' }, { w: 'Cambiar el contenido a pedido', t: 'no' },
      { w: 'Un cambio de erratas', t: 'ok' }, { w: 'Responder por WhatsApp a medianoche', t: 'no' }] },
  { label: ['Del valor', 'Del costo'], headA: '💎 Sale del valor', headB: '🧮 Sale del costo', colA: 'ok', colB: 'no',
    words: [{ w: 'Le ahorra cuatro noches al mes', t: 'ok' }, { w: 'Me llevó doce horas hacerla', t: 'no' },
      { w: 'Le evita comprar el libro de apoyo', t: 'ok' }, { w: 'El internet me cuesta L 900', t: 'no' },
      { w: 'Le resuelve la clase de mañana', t: 'ok' }, { w: 'Pagué la tinta de la impresora', t: 'no' },
      { w: 'Le sirve para el informe del centro', t: 'ok' }, { w: 'Estudié tres años para esto', t: 'no' }] },
  { label: ['Sostiene', 'Apaga'], headA: '💪 Sostiene el proyecto', headB: '🕳️ Lo apaga', colA: 'ok', colB: 'no',
    words: [{ w: 'Cobrar el aula por adelantado', t: 'ok' }, { w: 'Regalar «solo esta vez»', t: 'no' },
      { w: 'Escribir el no incluye', t: 'ok' }, { w: 'Cobrar cuando puedan', t: 'no' },
      { w: 'Bajar el precio quitando alcance', t: 'ok' }, { w: 'Descuento sin quitar nada', t: 'no' },
      { w: 'Tres pruebas gratis y el resto pagado', t: 'ok' }, { w: 'Todo gratis y ya veremos', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['La', 'oferta', 'es', 'lo', 'que', 'se', 'recibe', 'por', 'un', 'pago.'], c: 1, art: 'Lo único que se cobra' },
  { s: ['El', 'no', 'incluye', 'evita', 'casi', 'todos', 'los', 'pleitos.'], c: 2, art: 'La mitad que nadie escribe' },
  { s: ['El', 'costo', 'es', 'el', 'piso,', 'nunca', 'el', 'precio.'], c: 4, art: 'El mínimo, no la cifra' },
  { s: ['Quien', 'dice', 'la', 'primera', 'cifra', 'pone', 'el', 'ancla.'], c: 7, art: 'Lo que fija toda la conversación' },
  { s: ['El', 'entregable', 'se', 'puede', 'tocar', 'y', 'comprobar.'], c: 1, art: 'El objeto que se entrega' },
  { s: ['La', 'salida', 'quita', 'el', 'miedo', 'de', 'la', 'primera', 'compra.'], c: 1, art: 'Qué pasa si no sirve' },
  { s: ['El', 'escalón', 'gratis', 'es', 'una', 'prueba', 'sin', 'riesgo.'], c: 2, art: 'El que no debe comerse al de pago' },
  { s: ['Lo', 'que', 'no', 'se', 'paga', 'solo', 'se', 'apaga.'], c: 4, art: 'La razón de cobrar sin culpa' },
]);

B.cmpData = JSON.stringify([
  { s: 'Lo que alguien recibe a cambio de un pago es la ___.', opts: ['promesa', 'oferta', 'marca'], c: 1 },
  { s: 'La lista de lo que queda fuera del precio es el ___.', opts: ['no incluye', 'alcance', 'plazo'], c: 0 },
  { s: 'El costo marca el ___, nunca el precio.', opts: ['margen', 'techo', 'piso'], c: 2 },
  { s: 'Quien dice la primera cifra pone el ___.', opts: ['ancla', 'descuento', 'plazo'], c: 0 },
  { s: 'Qué pasa si no sirve se escribe en la ___.', opts: ['prueba', 'salida', 'promesa'], c: 1 },
  { s: 'Un aula al mes se cobra por ___.', opts: ['unidad', 'suscripción', 'proyecto'], c: 1 },
  { s: 'El escalón gratis existe para probar sin ___.', opts: ['pagar', 'cuenta', 'riesgo'], c: 2 },
  { s: 'Se baja el precio ___ alcance.', opts: ['quitando', 'sumando', 'regalando'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Promesa', 'Oferta'], btnA: '🗣️ Promesa', btnB: '🏷️ Oferta', colA: 'ok', colB: 'no',
    words: [{ w: 'Tu clase del lunes lista', t: 'ok' }, { w: 'Ficha de 10 páginas por L 30', t: 'no' },
      { w: 'Que tu hijo no se atrase', t: 'ok' }, { w: 'Aula al mes por L 250', t: 'no' },
      { w: 'Material que no gasta datos', t: 'ok' }, { w: 'Misión a la medida en 10 días', t: 'no' },
      { w: 'Aquí nadie se queda atrás', t: 'ok' }, { w: 'Devolución a los 30 días', t: 'no' },
      { w: 'Nunca más preparar de noche', t: 'ok' }, { w: 'Seis aulas por L 1.200 al mes', t: 'no' }] },
  { label: ['Incluye', 'No incluye'], btnA: '✅ Incluye', btnB: '🚫 No', colA: 'ok', colB: 'no',
    words: [{ w: 'La ficha en PDF con su pauta', t: 'ok' }, { w: 'Imprimir las copias del aula', t: 'no' },
      { w: 'La misión abierta en el teléfono', t: 'ok' }, { w: 'Capacitación presencial', t: 'no' },
      { w: 'Imprimible en blanco y negro', t: 'ok' }, { w: 'Cambiar el contenido a pedido', t: 'no' },
      { w: 'Un cambio de erratas', t: 'ok' }, { w: 'WhatsApp a medianoche', t: 'no' },
      { w: 'La pauta de respuestas', t: 'ok' }, { w: 'Fichas de otro grado', t: 'no' }] },
  { label: ['Del valor', 'Del costo'], btnA: '💎 Valor', btnB: '🧮 Costo', colA: 'ok', colB: 'no',
    words: [{ w: 'Le ahorra cuatro noches al mes', t: 'ok' }, { w: 'Me llevó doce horas hacerla', t: 'no' },
      { w: 'Le evita comprar el libro de apoyo', t: 'ok' }, { w: 'El internet me cuesta L 900', t: 'no' },
      { w: 'Le resuelve la clase de mañana', t: 'ok' }, { w: 'Pagué la tinta de la impresora', t: 'no' },
      { w: 'Le sirve para el informe del centro', t: 'ok' }, { w: 'Estudié tres años para esto', t: 'no' },
      { w: 'Le ahorra el sábado entero', t: 'ok' }, { w: 'Pagué el dominio del sitio', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se arma la oferta de una página', steps: ['Escribir el resultado que le queda a la persona, en una frase', 'Nombrar el entregable que se puede tocar y comprobar', 'Marcar el alcance en unidades del otro y escribir el no incluye', 'Poner el plazo y la forma de pago con fecha', 'Sacar el piso de costo y fijar el precio por lo que vale para quien paga', 'Agregar las tres pruebas y la salida escrita'] },
  { label: 'Cómo se contesta a quien pregunta el precio', steps: ['Preguntar qué resultado quiere y para cuándo lo necesita', 'Decir la primera cifra, antes de que la diga él', 'Enseñar la oferta de una página completa, con el no incluye', 'Si pide rebaja, quitar alcance y volver a cotizar', 'Dejarlo por escrito con fecha, forma de pago y salida'] },
  { label: 'Cómo se construye la escalera', steps: ['Definir el escalón gratis: qué se prueba sin riesgo y hasta dónde', 'Definir el básico: lo que resuelve el problema completo de una persona', 'Definir el completo: lo que se le ofrece a quien ya confía', 'Comprobar que el gratis empuja al básico y no lo reemplaza', 'Revisar cada tres meses si lo gratis se está comiendo lo de pago'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Qué queda distinto en la vida de quien paga', ans: 'El resultado', opts: ['El resultado', 'El entregable', 'La promesa', 'El alcance'] },
  { desc: 'El objeto concreto del que se comprueba que llegó', ans: 'El entregable', opts: ['El entregable', 'El resultado', 'La prueba', 'El plazo'] },
  { desc: 'Hasta dónde llega lo que se entrega y dónde se acaba', ans: 'El alcance', opts: ['El alcance', 'El precio', 'El plazo', 'La salida'] },
  { desc: 'La lista de lo que queda fuera del precio', ans: 'El no incluye', opts: ['El no incluye', 'El alcance', 'La salida', 'La forma de pago'] },
  { desc: 'La fecha de entrega y qué pasa si se atrasa', ans: 'El plazo', opts: ['El plazo', 'La forma de pago', 'El alcance', 'El resultado'] },
  { desc: 'La cifra que se cobra, cuándo se cobra y por qué medio', ans: 'El precio y la forma de pago', opts: ['El precio y la forma de pago', 'El costo piso', 'El ancla de precio', 'El entregable'] },
  { desc: 'Lo que se puede abrir y comprobar hoy, antes de pagar', ans: 'La prueba', opts: ['La prueba', 'El entregable', 'El resultado', 'El escalón gratis'] },
  { desc: 'Qué pasa si no sirve, con plazo escrito', ans: 'La salida', opts: ['La salida', 'El no incluye', 'El plazo', 'La prueba'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Una maestra quiere solo la ficha de fracciones, hoy, y paga de su bolsillo', func: 'L 30, descarga inmediata y sin cuenta, y de una vez se le dice que el aula son L 250 al mes', opts: ['L 30, descarga inmediata y sin cuenta, y de una vez se le dice que el aula son L 250 al mes', 'Que se la lleve gratis, que después se verá', 'Que se registre primero y luego se le pasa el precio', 'Que espere al paquete completo del grado'] },
  { trans: 'Un centro de seis aulas pide precio de paquete al mes', func: 'L 1.200 al mes, quitando la ficha a pedido y el soporte por WhatsApp, cobrado del 1 al 5', opts: ['L 1.200 al mes, quitando la ficha a pedido y el soporte por WhatsApp, cobrado del 1 al 5', 'L 1.500 al mes con absolutamente todo incluido', 'Los mismos L 250 por aula, sin tocar nada', 'Lo que ellos propongan, que son seis aulas de una vez'] },
  { trans: 'Un negocio ofrece L 8.000 por su logo en la portada de todas las fichas por un año', func: 'Contraportada, tamaño escrito, un año, y los L 8.000 por delante', opts: ['Contraportada, tamaño escrito, un año, y los L 8.000 por delante', 'Portada por L 8.000, que es dinero contante y el dueño es conocido', 'Portada si suben la oferta a L 30.000', 'Nada: el patrocinio no va con un proyecto educativo'] },
  { trans: 'Un centro pide una misión a la medida sobre la historia de su municipio', func: 'L 4.500, mitad al encargar y mitad al entregar, veinte días hábiles y dos rondas de cambios', opts: ['L 4.500, mitad al encargar y mitad al entregar, veinte días hábiles y dos rondas de cambios', 'L 4.500 al terminar, con los cambios que hagan falta', 'Por hora trabajada, que es lo más justo para los dos', 'Gratis, porque sirve de ejemplo para vender otras iguales'] },
  { trans: 'Una página con cuarenta mil seguidores ofrece publicaciones a cambio de las fichas', func: 'Tres publicaciones valoradas en L 6.000 por tres fichas y un mes de una sola aula', opts: ['Tres publicaciones valoradas en L 6.000 por tres fichas y un mes de una sola aula', 'El catálogo entero gratis: esa vitrina lo vale', 'Nada, porque la visibilidad no paga el internet', 'Las fichas gratis si dejan el enlace al sitio'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'La misión a la medida lleva cuatro meses y va por la quinta ronda de cambios', characteristic: 'No se contaron las rondas de cambios dentro del alcance', opts: ['No se contaron las rondas de cambios dentro del alcance', 'El cliente resultó difícil', 'El precio de L 4.500 quedó bajo', 'Faltó ponerle fecha de entrega'] },
  { disease: 'Se cobró L 125 por aula a una red y ahora nadie quiere pagar L 250', characteristic: 'Se bajó el precio sin quitar alcance, y el descuento se volvió el precio nuevo', opts: ['Se bajó el precio sin quitar alcance, y el descuento se volvió el precio nuevo', 'Los clientes hablan entre ellos', 'El precio de lista siempre estuvo muy alto', 'Faltó firmar un contrato con la red'] },
  { disease: 'Todo el mundo usa el material y no paga nadie', characteristic: 'El escalón gratis alcanza para el año entero: dejó de ser prueba y pasó a ser el producto', opts: ['El escalón gratis alcanza para el año entero: dejó de ser prueba y pasó a ser el producto', 'Falta publicidad', 'El precio es caro para una maestra', 'Aquí nadie paga por material educativo'] },
  { disease: 'Se entregó a tiempo y el centro reclamó que faltaban cosas', characteristic: 'El «no incluye» no estaba escrito, así que cada quien entendió lo que quiso', opts: ['El «no incluye» no estaba escrito, así que cada quien entendió lo que quiso', 'El centro cambió de opinión a mitad de camino', 'Se entregó en el formato equivocado', 'El precio incluía demasiadas cosas'] },
  { disease: 'La ficha se puso a L 200 y no la compró nadie', characteristic: 'El precio salió de sumar las horas de trabajo, no de lo que vale para quien paga', opts: ['El precio salió de sumar las horas de trabajo, no de lo que vale para quien paga', 'El tema de la ficha se pide poco', 'Hacía falta un logo más serio', 'No se hizo suficiente publicidad'] },
  { disease: 'La directora ofreció L 500 al mes por seis aulas y ya no hubo cómo subir', characteristic: 'Ella dijo la primera cifra: el ancla quedó de su lado', opts: ['Ella dijo la primera cifra: el ancla quedó de su lado', 'Es un centro con poco presupuesto', 'Faltó enseñarle todo lo que incluye', 'Se debió negociar en persona y no por teléfono'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Lo que alguien recuerda cuando uno no está.', type: 'Promesa' },
  { s: 'Lo que alguien recibe a cambio de un pago.', type: 'Oferta' },
  { s: 'El objeto del que se comprueba que llegó.', type: 'Entregable' },
  { s: 'Hasta dónde llega lo que se entrega.', type: 'Alcance' },
  { s: 'La lista de lo que queda fuera del precio.', type: 'No incluye' },
  { s: 'La fecha de entrega y qué pasa si se atrasa.', type: 'Plazo' },
  { s: 'Lo que cuesta producir: el mínimo, nunca el precio.', type: 'Costo piso' },
  { s: 'Lo que se puede abrir y comprobar antes de pagar.', type: 'Prueba' },
  { s: 'Qué pasa si no sirve, con plazo escrito.', type: 'Salida' },
  { s: 'La primera cifra que se dice y condiciona las demás.', type: 'Ancla de precio' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Tu clase del lunes lista', gen: 'Mensaje', n: 'Se recuerda', g: 'Promesa', t: 'No se entrega: se cumple' },
  { w: 'Ficha de 10 páginas por L 30', gen: 'Mensaje', n: 'Se cobra', g: 'Oferta', t: 'Se entrega y se comprueba' },
  { w: 'La ficha en PDF con su pauta', gen: 'Alcance', n: 'Dentro', g: 'Sí incluye', t: 'Va dentro del precio' },
  { w: 'Imprimir las copias del aula', gen: 'Alcance', n: 'Fuera', g: 'No incluye', t: 'Tiene precio aparte' },
  { w: 'Le ahorra cuatro noches al mes', gen: 'Cifra', n: 'Del que paga', g: 'Valor', t: 'De aquí sale el precio' },
  { w: 'Me llevó doce horas hacerla', gen: 'Cifra', n: 'Del que cobra', g: 'Costo', t: 'Solo marca el piso' },
  { w: 'Una ficha suelta, L 30', gen: 'Cobro', n: 'Puntual', g: 'Por unidad', t: 'La compra se decide sola' },
  { w: 'Un aula al mes, L 250', gen: 'Cobro', n: 'Repetido', g: 'Suscripción', t: 'El problema vuelve cada semana' },
  { w: 'Misión a la medida, L 4.500', gen: 'Cobro', n: 'Una sola vez', g: 'Proyecto cerrado', t: 'Alcance fijo y cambios contados' },
  { w: 'Devolución a los 30 días', gen: 'Riesgo', n: 'Lo carga quien cobra', g: 'Salida', t: 'Quita el miedo de la primera compra' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Lo que alguien recibe a cambio de un pago es la ___.', opts: ['marca', 'oferta', 'promesa'], ans: 'oferta' },
  { s: 'La lista de lo que queda fuera del precio es el ___.', opts: ['no incluye', 'plazo', 'alcance'], ans: 'no incluye' },
  { s: 'El costo marca el ___ y nunca el precio.', opts: ['techo', 'margen', 'piso'], ans: 'piso' },
  { s: 'La primera cifra que se dice es el ___.', opts: ['descuento', 'ancla', 'presupuesto'], ans: 'ancla' },
  { s: 'Qué pasa si no sirve se escribe en la ___.', opts: ['prueba', 'promesa', 'salida'], ans: 'salida' },
  { s: 'El aula al mes se cobra por ___.', opts: ['suscripción', 'unidad', 'proyecto'], ans: 'suscripción' },
  { s: 'El escalón gratis sirve para probar sin ___.', opts: ['cuenta', 'riesgo', 'pagar'], ans: 'riesgo' },
  { s: 'Se baja el precio ___ alcance.', opts: ['quitando', 'regalando', 'sumando'], ans: 'quitando' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica la diferencia entre la promesa y la oferta, y por qué con una sola no alcanza.', ans: 'La promesa es lo que alguien recuerda del proyecto cuando uno no está: «esto me salva la clase del lunes». Se regala, se repite y se recomienda, y por eso no tiene precio: no se entrega, se cumple. La oferta es lo que esa misma persona recibe a cambio de un pago, y eso ya se puede escribir en una hoja: qué recibe, para cuándo, por cuánto y qué pasa si no le sirve. Una promesa sin oferta es una charla bonita que deja a todo el mundo contento y no paga el internet. Una oferta sin promesa es un catálogo: técnicamente correcto y sin ningún motivo para abrirlo. La pregunta que convierte la primera en la segunda es una sola: ¿qué recibe exactamente por su dinero? Si la respuesta se puede envolver, ya hay oferta; si solo se puede contar, todavía es una charla.' },
  { q: '¿Para qué sirve el «no incluye» y cómo se escribe uno que funcione?', ans: 'El «no incluye» es la mitad de la oferta que casi nadie escribe y la que evita casi todos los pleitos, porque lo que no está escrito ahí se va a pedir gratis y se va a dar por vergüenza. Se saca preguntándose qué es lo que van a pedir después, cuando ya pagaron y ya hay confianza: imprimir las copias del aula, cambiar el contenido a pedido, una capacitación presencial, que se conteste por WhatsApp a medianoche, fichas de otro grado. Y hay un detalle que lo cambia todo: cada línea del «no incluye» lleva su precio al lado. Así deja de ser una negativa seca y pasa a ser una venta, y uno puede decir que sí a todo sin regalar nada. No se escribe para protegerse del cliente: se escribe para poder trabajar tranquilo con él el resto del año.' },
  { q: 'Una ficha costó doce horas de trabajo y L 90 de internet y energía. Explica de dónde sale el precio y por qué no es la suma de las horas.', ans: 'Esas doce horas y esos L 90 son el piso de costo, y el piso sirve para una sola cosa: saber por debajo de qué cifra no se vende. No es el precio. El precio sale de lo que vale para quien paga, y a la maestra que compra esa ficha lo que le vale son las cuatro noches al mes que no se queda preparando clase, el libro de apoyo que no tiene que comprar y la clase de mañana resuelta hoy. Cobrar por horas tiene además un castigo escondido: al que aprendió a hacerla en cuatro horas le tocaría cobrar menos que al que tardó doce, o sea que trabajar mejor sale más barato. Y desvía la conversación, que pasa a ser sobre el tiempo del que cobra en vez de sobre el resultado del que paga. Por eso la ficha suelta vale L 30 y el aula L 250 al mes: son cifras de valor, con el costo abajo asegurando que no se pierde.' },
  { q: 'Una red de tres centros suma veinte aulas y pide la mitad de precio, de L 250 a L 125 por aula. ¿Qué se contesta y por qué?', ans: 'No se acepta ni se rechaza completo: se contraoferta. La cifra puede ser L 150 por aula, o sea L 3.000 al mes en vez de L 5.000, pero quitando la ficha nueva a pedido, el soporte por WhatsApp y el acompañamiento, y cobrando el año entero por adelantado, que son L 30.000 en febrero. La regla de fondo es que se baja el precio quitando algo, siempre, y se escribe qué se quitó. Un descuento que no quita alcance no es un descuento: es el precio nuevo, y el siguiente cliente lo va a saber, porque el mercado se entera. Si se aceptan los L 125 con todo incluido, al mes siguiente el centro de seis aulas que paga L 250 lo va a reclamar con toda la razón, y ahí ya no hay precio de lista: hay una negociación distinta con cada quien y una agenda llena de reclamos.' },
  { q: 'Explica la escalera de la oferta de M.E.T.A.S y cuándo el escalón gratis se vuelve un problema.', ans: 'Son tres escalones. El gratis: tres fichas completas y las misiones abiertas, sin cuenta ni instalación, que existe para probar sin riesgo. El básico: el aula al mes, L 250, que resuelve el problema completo de una maestra. Y el completo: el centro, L 1.200 al mes por seis aulas, con constancias y reportes, que es para quien ya confía y por eso no se le ofrece a nadie en la primera conversación. El gratis se vuelve problema el día que le alcanza a alguien para resolver el año entero: ahí deja de ser prueba y pasa a ser el producto, y el de pago se muere solo, no por malo sino por falta de motivo. La señal de alarma no es cuánta gente usa lo gratis, es que en tres meses nadie haya subido de escalón. Al gratis le tiene que faltar cobertura, nunca calidad: si lo gratis se ve malo, lo que se rompe es la promesa.' },
  { q: 'Escribe la oferta de una página de M.E.T.A.S con sus ocho campos, y di qué regla de las cinco reglas de la oferta sostiene cada parte.', ans: 'Resultado: la maestra llega el lunes con la clase lista sin haberla preparado de noche. Entregable: ficha de diez páginas en PDF con su pauta, más la misión abierta en el teléfono. Alcance: una materia, un grado y un tema por ficha, y todas las fichas del grado si es por aula. No incluye: impresión, cambios de contenido a pedido, capacitación presencial ni soporte fuera de horario, y aquí manda la primera regla, que lo que no está escrito ahí se va a pedir gratis. Plazo: lo publicado hoy, ficha nueva a pedido diez días hábiles, misión a la medida veinte. Precio y forma de pago: ficha L 30, aula L 250 al mes, seis aulas L 1.200, misión a la medida L 4.500, cobro por adelantado del 1 al 5; aquí mandan dos reglas, que el costo es el piso y que quien dice la primera cifra pone el ancla. Prueba: tres fichas completas gratis, el Campeonísimo funcionando y una maestra que lo dice con su nombre. Salida: treinta días, se devuelve el mes cobrado y se cancela sin explicaciones. Y encima de todo la quinta regla, que es la que autoriza a cobrar sin culpa: lo que no se paga solo se apaga.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['OFERTA', 'PRECIO', 'PLAZO', 'ALCANCE', 'PRUEBA', 'SALIDA']),
  haceSopa(10, ['UNIDAD', 'AULA', 'MENSUAL', 'PROYECTO', 'ANCLA', 'VALOR']),
  haceSopa(10, ['ESCALERA', 'GRATIS', 'BASICO', 'COMPLETO', 'DESCUENTO', 'COSTO']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'La promesa se cobra y la oferta se regala.', a: false },
  { q: 'Una oferta se puede escribir en una hoja y comprobar.', a: true },
  { q: 'El «no incluye» es tan parte de la oferta como lo que sí se entrega.', a: true },
  { q: 'El costo de producir marca el precio de venta.', a: false },
  { q: 'El precio sale de lo que vale para quien paga.', a: true },
  { q: 'Conviene esperar a que el cliente diga la primera cifra.', a: false },
  { q: 'Un descuento que no quita alcance se convierte en el precio nuevo.', a: true },
  { q: '«Acompañamiento» y «acceso a la plataforma» son entregables comprobables.', a: false },
  { q: 'Un precio sin forma de pago escrita es un deseo.', a: true },
  { q: 'La salida se escribe con plazo, aunque alguna vez cueste una devolución.', a: true },
  { q: 'El escalón gratis está para resolverle el año entero a la maestra.', a: false },
  { q: 'La prueba se pone antes del precio, no después.', a: true },
  { q: 'Cobrar por hora premia al que trabaja rápido y bien.', a: false },
  { q: 'Un proyecto cerrado lleva las rondas de cambios contadas.', a: true },
  { q: 'La visibilidad puede sustituir al dinero si la audiencia es grande.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: 'Una maestra repite la promesa a tres compañeras y ninguna compra. ¿Qué falta?', o: ['a) Repetir más la promesa', 'b) Un precio más bajo', 'c) La oferta escrita: qué recibe, para cuándo y por cuánto', 'd) Estar más presente en redes'], a: 2 },
  { q: 'Antes de decir un precio, la pregunta que decide es…', o: ['a) ¿Qué recibe exactamente y para cuándo?', 'b) ¿Cuánto puede pagar?', 'c) ¿Cuánto cobra el de al lado?', 'd) ¿Cuántas horas me lleva?'], a: 0 },
  { q: 'El «no incluye» sirve sobre todo para…', o: ['a) Que la oferta se vea completa', 'b) Ponerle precio propio a lo que van a pedir después', 'c) Tener con qué defenderse en un reclamo', 'd) Que se note que uno trabaja en serio'], a: 1 },
  { q: 'Una ficha costó doce horas y L 90. El precio se fija…', o: ['a) Sumando horas y gastos', 'b) Con un margen del 30% sobre el costo', 'c) Copiando al que vende algo parecido', 'd) Por lo que le ahorra a quien la usa'], a: 3 },
  { q: 'Una directora pregunta el precio de sus seis aulas. Lo que sostiene el proyecto es…', o: ['a) «Lo que usted crea justo»', 'b) Preguntarle cuánto tiene de presupuesto', 'c) Decir la primera cifra, con lo que incluye y lo que no', 'd) Pasarle el precio la semana siguiente'], a: 2 },
  { q: 'Piden la mitad de precio por veinte aulas. La contraoferta correcta…', o: ['a) Baja el precio quitando alcance y cobra el año por adelantado', 'b) Mantiene el precio de lista sin moverse', 'c) Acepta: veinte aulas compensan la rebaja', 'd) Da el descuento solo el primer año'], a: 0 },
  { q: 'El escalón gratis existe para…', o: ['a) Llegar a más gente', 'b) Competir con lo que se regala en internet', 'c) Probar sin riesgo y empujar al escalón de pago', 'd) Que ninguna maestra se quede sin material'], a: 2 },
  { q: 'Un negocio ofrece L 8.000 por su logo en la portada de todas las fichas por un año. Se contesta…', o: ['a) Sí: son L 8.000 contantes', 'b) Contraportada, tamaño escrito y pago por delante', 'c) Sí, si suben a L 12.000', 'd) No, y hasta ahí la conversación'], a: 1 },
  { q: 'Una editorial ofrece L 60.000 por cuarenta fichas con exclusividad. La cuenta que hay que hacer antes es…', o: ['a) L 60.000 contra las horas que costaron', 'b) L 60.000 contra lo que pagaría otra editorial', 'c) L 1.500 por ficha contra el costo de cada una', 'd) L 60.000 contra lo que esas fichas producirían en cinco años'], a: 3 },
  { q: 'La misión a la medida de L 4.500 se cierra con…', o: ['a) Los cambios que el cliente necesite', 'b) Dos rondas de cambios, y la tercera a L 600', 'c) Cambios ilimitados durante el primer mes', 'd) Una sola ronda y ninguna más'], a: 1 },
  { q: 'Una página con cuarenta mil seguidores ofrece publicaciones por las fichas gratis. Se acepta…', o: ['a) Como pago en especie valorado en L 6.000 y con alcance limitado', 'b) Completo: esa vitrina lo vale', 'c) Nunca: eso no es pago', 'd) Solo si dejan el enlace al sitio'], a: 0 },
  { q: 'Anuncios dentro de la aplicación por L 1.800 al mes si todo queda gratis para siempre. Se contesta…', o: ['a) Sí: L 1.800 al mes es dinero seguro', 'b) No, y sin contrapropuesta', 'c) Solo en el escalón gratis, con rubros aprobados y el de pago intacto', 'd) Sí, si suben a L 3.000'], a: 2 },
  { q: 'La salida de la oferta de M.E.T.A.S dice que…', o: ['a) A los 30 días se devuelve el mes cobrado, sin pedir explicaciones', 'b) Se devuelve solo si el trabajo tuvo errores', 'c) Se cambia por otra ficha del mismo grado', 'd) No hay devoluciones por ser material digital'], a: 0 },
  { q: '¿Cuál de estas cosas es un entregable de verdad?', o: ['a) Acompañamiento durante el año', 'b) Acceso a la plataforma', 'c) Apoyo cuando lo necesite', 'd) Un PDF de diez páginas con su pauta'], a: 3 },
  { q: 'La prueba de que la oferta quedó clara es…', o: ['a) Que quepa en una hoja', 'b) Que otra persona pueda repetir qué recibe y por cuánto', 'c) Que lleve precio en lempiras', 'd) Que uno se la sepa de memoria'], a: 1 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Lo que alguien recibe a cambio de un pago es la ___.', a: 'oferta' },
  { q: 'Lo que alguien recuerda cuando uno no está es la ___.', a: 'promesa' },
  { q: 'La lista de lo que queda fuera del precio es el «no ___».', a: 'incluye' },
  { q: 'El objeto concreto que se entrega es el ___.', a: 'entregable' },
  { q: 'Hasta dónde llega lo que se entrega es el ___.', a: 'alcance' },
  { q: 'La fecha de entrega y qué pasa si se atrasa es el ___.', a: 'plazo' },
  { q: 'El costo marca el ___, nunca el precio.', a: 'piso' },
  { q: 'La primera cifra que se dice pone el ___.', a: 'ancla' },
  { q: 'Lo que se puede abrir y comprobar antes de pagar es la ___.', a: 'prueba' },
  { q: 'Qué pasa si no sirve se escribe en la ___.', a: 'salida' },
  { q: 'El aula al mes se cobra por ___.', a: 'suscripción' },
  { q: 'La misión a la medida se cobra como proyecto ___.', a: 'cerrado' },
  { q: 'El escalón gratis sirve para probar sin ___.', a: 'riesgo' },
  { q: 'Se baja el precio ___ alcance.', a: 'quitando' },
  { q: 'Lo que no se paga solo se ___.', a: 'apaga' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Promesa', def: 'Lo que alguien recuerda cuando uno no está' },
  { term: 'Oferta', def: 'Lo que se recibe a cambio de un pago' },
  { term: 'Resultado prometido', def: 'Qué queda distinto en la vida de quien paga' },
  { term: 'Entregable', def: 'El objeto que se entrega y se comprueba' },
  { term: 'Alcance', def: 'Hasta dónde llega y dónde se acaba' },
  { term: 'No incluye', def: 'La lista de lo que queda fuera del precio' },
  { term: 'Plazo', def: 'Para cuándo, y qué pasa si se atrasa' },
  { term: 'Precio por valor', def: 'La cifra sale de lo que le ahorra al otro' },
  { term: 'Costo piso', def: 'El mínimo por debajo del cual no se vende' },
  { term: 'Forma de pago', def: 'Cuándo se cobra, por qué medio y en cuántas partes' },
  { term: 'Prueba', def: 'Lo que se abre y se comprueba antes de pagar' },
  { term: 'Salida', def: 'Qué pasa si no sirve, con plazo escrito' },
  { term: 'Ancla de precio', def: 'La primera cifra condiciona todas las demás' },
  { term: 'Escalón gratis', def: 'La prueba sin riesgo que empuja al de pago' },
  { term: 'Suscripción', def: 'Un aula al mes, porque el problema vuelve' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Una maestra de sexto vio la ficha de fracciones y quiere solo esa, hoy, para la clase de mañana. Pregunta cuánto es y aclara que paga de su bolsillo.' },
  { txt: 'Una directora de un centro de seis aulas pide usar las misiones con todos sus grados y pregunta cuánto sería al mes. Hasta hoy no había ningún precio escrito.' },
  { txt: 'Un negocio de la zona ofrece L 8.000 por poner su logo en la portada de todas las fichas durante un año. Es dinero contante y el dueño es conocido de la familia.' },
  { txt: 'Una editorial ofrece L 60.000 de pago único por cuarenta fichas ya hechas, con su sello en la portada. Es más dinero del que el proyecto ha visto junto.' },
  { txt: 'Un centro pide una misión sobre la historia de su municipio, hecha a la medida, con sus fotos y sus nombres. Preguntan cuánto y para cuándo.' },
  { txt: 'Una red de tres centros suma veinte aulas y pide la mitad de precio: de L 250 a L 125 por aula. Dicen que por volumen es lo justo y que si no, no hay trato.' },
  { txt: 'Una página educativa con cuarenta mil seguidores ofrece tres publicaciones sobre M.E.T.A.S a cambio de las fichas gratis para su comunidad. Insisten en que es una vitrina.' },
  { txt: 'Una empresa de publicidad ofrece L 0,90 por cada mil anuncios mostrados dentro de la aplicación, unos L 1.800 al mes, con la condición de que todo quede gratis para siempre.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué se entrega exactamente y qué NO se incluye?',
  '2. ¿Cuál es el piso de costo y de dónde sale el precio que pones?',
  '3. Escribe en 3-4 frases la oferta que le contestarías, por escrito.',
  '4. ¿Cuál es el plazo, la forma de pago y la salida si no sirve?',
]);

B.critCaseGuides = JSON.stringify([
  'Se nombra el entregable en algo que se pueda tocar y comprobar, y el «no incluye» línea por línea, con su precio al lado. Lo que no aparezca ahí se va a pedir gratis, y se va a dar por vergüenza.',
  'El piso sale del presupuesto real: horas, internet, energía. Marca el mínimo y nada más, porque el costo es el piso, nunca el precio. El precio sale de lo que la persona se ahorra o gana, y se dice primero: quien dice la primera cifra pone el ancla.',
  'La oferta se escribe, no se improvisa por teléfono: resultado, entregable, alcance con su «no incluye», plazo, precio con fecha de cobro, prueba y salida. Y casi ninguna oferta se acepta o se rechaza completa: se acepta con condiciones pensadas en frío.',
  'Plazo con fecha y qué pasa si se atrasa; cobro por adelantado del 1 al 5, por un medio que deje recibo; salida escrita, con plazo y sin letra chica. Sin salida, todo el riesgo lo carga quien paga, y por eso muchos no llegan a pagar.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Se lo dejo en lo que usted crea justo".', g1: '«Lo que usted crea justo» suena generoso y es lo más caro que existe: el otro dice la primera cifra y esa cifra queda de ancla para todos los que vengan detrás.', g2: 'Se dice la primera cifra uno mismo, decidida en frío antes de que suene el teléfono, y se enseña la oferta completa con lo que incluye y lo que no.' },
  { txt: '"Le cobro por las horas: son doce horas de trabajo por ficha".', g1: 'Cobrar por horas castiga al que trabaja rápido y bien, y pone la conversación sobre el tiempo del que cobra en vez de sobre el resultado del que paga.', g2: 'Las horas sirven para sacar el piso de costo. El precio se saca de lo que la maestra se ahorra: cuatro noches al mes valen más que doce horas de trabajo ajeno.' },
  { txt: '"Se lo dejo a mitad de precio, total son veinte aulas".', g1: 'Un descuento que no quita alcance no es un descuento: es el precio nuevo, y el siguiente cliente lo va a saber porque el mercado se entera.', g2: 'Se baja el precio quitando algo, y se escribe qué se quitó: L 150 por aula sin ficha a pedido, sin soporte y sin acompañamiento, con el año por adelantado.' },
  { txt: '"El paquete incluye todo lo que el centro necesite".', g1: '«Todo lo que necesiten» no tiene fondo. Sin «no incluye» escrito, el trabajo extra se hace «por esta vez» y queda de costumbre.', g2: 'Cinco líneas de «no incluye» con su precio al lado: impresión, cambios de contenido, capacitación presencial, soporte fuera de horario y fichas de otro grado. Así cada negativa se vuelve una venta.' },
  { txt: '"Devoluciones no hay: el material ya se descargó".', g1: 'Sin salida escrita, todo el riesgo de la primera compra lo carga quien paga, y ese miedo es lo que frena casi todas las primeras compras.', g2: 'Treinta días: si no sirvió, se devuelve el mes cobrado y se cancela sin pedir explicaciones. Lo ya descargado se lo queda, que cuesta cero y compra confianza.' },
  { txt: '"Nos pagan con visibilidad, y eso hoy vale más que el dinero".', g1: 'La visibilidad no paga el internet ni la energía, y regalar el catálogo delante de cuarenta mil personas deja el precio en cero para todas ellas.', g2: 'Se acepta como pago en especie con precio puesto: tres publicaciones valoradas en L 6.000 por tres fichas y un mes de una sola aula, con enlace al sitio propio.' },
]);

B.critDecisionBank = JSON.stringify([
  'Una maestra quiere solo la ficha de fracciones para mañana: ¿se le cobra por unidad o se le regala como prueba, y qué se le dice del aula?',
  'Seis aulas al mes y ningún precio escrito todavía: ¿qué cifra se dice primero y qué se quita para poder sostenerla?',
  'L 8.000 por el logo en la portada durante un año: ¿qué se cede, qué no se cede ni por L 30.000 y qué se contraoferta?',
  'L 60.000 por cuarenta fichas con exclusividad: ¿qué cuenta hay que hacer antes de contestar y qué licencia se acepta?',
  'Misión a la medida por L 4.500: ¿cuántas rondas de cambios entran en el precio y qué pasa si el contenido del centro llega tarde?',
  'Veinte aulas a mitad de precio o no hay trato: ¿qué se quita para bajar de L 250 y qué condición de pago se agrega?',
  'Tres publicaciones a cambio del catálogo entero: ¿en cuánto se valora esa visibilidad y qué parte de la oferta se entrega?',
  'Anuncios por L 1.800 al mes con todo gratis para siempre: llena la oferta de una página de ese trato y decide si se acepta y con qué límites.',
]);

/* `critDecisionGuide` no es una lista, así que va fuera de `B` (igual que en los
   inyectores de datos, presupuesto, sesgos y política, que cuentan 32 bancos).
   Se reemplaza abajo, con la lista `textos`, por su línea completa. */
const CRIT_DECISION_GUIDE = JSON.stringify('La decisión correcta casi nunca es aceptar completo ni rechazar de plano: es aceptar con condiciones, y las condiciones se piensan en frío, no con alguien enfrente esperando una firma. El orden: se nombra qué se entrega y qué NO se incluye, línea por línea y con precio al lado; se saca el piso de costo del presupuesto real y se fija el precio por lo que vale para quien paga, no por las horas, porque el costo es el piso y nunca el precio; se dice la primera cifra, porque quien dice la primera cifra pone el ancla; si piden rebaja, se baja el precio quitando alcance y se escribe qué se quitó; y se cierra con plazo, forma de pago con fecha y salida escrita. Vale más una oferta chica cobrada que un trato grande que deja el escalón de pago en cero, porque lo que no se paga solo se apaga.');

B.critCompareBank = JSON.stringify([
  { a: 'Cobrar la ficha suelta a L 30, con el precio escrito en el sitio.', b: 'Regalar la ficha suelta a quien la pida y ya se verá después.', ga: 'Caso A: fija el precio de referencia de toda la línea y deja abierta la puerta al aula de L 250 al mes.', gb: 'Caso B: el precio queda en cero para esa maestra y para las tres a las que se lo cuente, y subirlo después cuesta el doble.' },
  { a: 'Bajar a L 150 por aula quitando la ficha a pedido y el soporte.', b: 'Bajar a L 125 por aula dejando el paquete igual.', ga: 'Caso A: el descuento se paga con alcance y se le puede explicar a cualquier otro cliente sin quedar mal.', gb: 'Caso B: no es descuento, es el precio nuevo. El centro de seis aulas que paga L 250 lo va a reclamar con toda la razón.' },
  { a: 'El logo del patrocinador en la contraportada por L 8.000 al año.', b: 'El logo del patrocinador en la portada por L 8.000 al año.', ga: 'Caso A: se cobra un espacio que estaba vacío sin tocar lo que decide la lectura del material.', gb: 'Caso B: la portada es donde la maestra decide en dos segundos si esto es material educativo o publicidad. Ahí el precio no es el espacio.' },
  { a: 'Licencia no exclusiva por dos años a la editorial, con el nombre del autor en la portada.', b: 'Vender las cuarenta fichas con exclusividad por L 60.000.', ga: 'Caso A: entra el dinero y entra la distribución, y el proyecto sigue vendiendo las mismas fichas por unidad y por aula.', gb: 'Caso B: L 60.000 no es el precio de cuarenta fichas: es el precio de todo lo que esas fichas iban a producir en cinco años.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se contesta «lo que usted crea justo» cuando preguntan el precio.', guide: 'El otro dice la primera cifra y esa cifra queda de ancla. Subirla después parece un abuso, aunque sea lo que de verdad cuesta.' },
  { cause: 'No se escribe el «no incluye».', guide: 'Lo que no está escrito se pide gratis y se da por vergüenza. El trabajo extra se hace «por esta vez» y al mes siguiente ya es costumbre.' },
  { cause: 'El precio se saca sumando las horas de trabajo.', guide: 'Se castiga al que trabaja rápido y bien, y la conversación pasa a ser sobre el tiempo del que cobra en vez de sobre el resultado del que paga.' },
  { cause: 'Se da un descuento sin quitar nada del alcance.', guide: 'El descuento se vuelve el precio nuevo para todos, porque el mercado se entera. El precio de lista deja de existir ese mismo día.' },
  { cause: 'El escalón gratis alcanza para resolver el año entero.', guide: 'Deja de ser prueba y pasa a ser el producto. El de pago se muere solo, y no por malo sino por falta de motivo para subir.' },
  { cause: 'La oferta se cierra sin escribir la salida.', guide: 'Todo el riesgo de la primera compra lo carga quien paga. Y cada reclamo se negocia de cero, con el cliente enojado enfrente.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La maestra pagó los L 30 sin pedir rebaja y volvió por el aula completa.', guide: 'El precio estaba escrito en el sitio y no se negoció caso por caso. La ficha suelta es la puerta, no el negocio.' },
  { effect: 'El centro aceptó L 1.200 al mes y nadie pidió más de lo pactado.', guide: 'El «no incluye» estaba escrito y con precio al lado. El descuento existía porque el alcance bajó, no porque el cliente insistió.' },
  { effect: 'Se dijo que no a los L 8.000 por la portada y el patrocinador firmó la contraportada.', guide: 'Había una contraoferta lista, con tamaño y plazo escritos. Decir que no con una alternativa en la mano no cierra la puerta.' },
  { effect: 'La misión a la medida se entregó a los veinte días y se cobró completa.', guide: 'Las rondas de cambios estaban contadas, la tercera tenía precio y el contenido histórico lo entregaba el centro por escrito.' },
  { effect: 'La red de veinte aulas pagó el año entero por adelantado en febrero.', guide: 'Se bajó de L 250 a L 150 quitando ficha a pedido, soporte y acompañamiento. La rebaja se pagó con alcance y con caja por delante.' },
  { effect: 'Con cuarenta mil personas mirando, el escalón de pago siguió existiendo.', guide: 'La visibilidad entró como pago en especie con precio puesto y alcance limitado: tres fichas y un aula, no el catálogo entero.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🎯', label: 'El resultado', text: '¿Qué queda distinto en la vida de quien paga? <strong>Decide:</strong> si el precio parece caro o barato, porque caro se mide contra el resultado y no contra el trabajo. <strong>Se rompe:</strong> al describir lo que hace el producto en vez de lo que le pasa a la persona. <strong>En M.E.T.A.S:</strong> la maestra llega el lunes con la clase lista sin haberla preparado de noche.' },
  { y: '2', icon: '📦', label: 'El entregable', text: '¿Qué recibe exactamente y en qué forma? <strong>Decide:</strong> si se puede comprobar que se entregó. <strong>Se rompe:</strong> con entregables que no se pueden tocar, como «acompañamiento» o «acceso a la plataforma». <strong>En M.E.T.A.S:</strong> un PDF de diez páginas con su pauta, más la misión abierta en el teléfono.' },
  { y: '3', icon: '📏', label: 'El alcance y el no incluye', text: '¿Hasta dónde llega esto y dónde se acaba? <strong>Decide:</strong> cuánto trabajo cabe dentro del mismo precio. <strong>Se rompe:</strong> al escribir solo lo que sí incluye, porque lo que no está escrito se pide gratis y se da por vergüenza. <strong>En M.E.T.A.S:</strong> una materia, un grado y un tema por ficha; no incluye impresión, ni cambios a pedido, ni capacitación presencial.' },
  { y: '4', icon: '📅', label: 'El plazo', text: '¿Para cuándo, y qué pasa si se atrasa? <strong>Decide:</strong> si el resultado llega a tiempo de servir. <strong>Se rompe:</strong> con «cuando esté listo», que pierde la confianza sin haber cobrado un peso de más. <strong>En M.E.T.A.S:</strong> lo publicado se descarga hoy; una ficha nueva a pedido, diez días hábiles.' },
  { y: '5', icon: '💵', label: 'El precio y la forma de pago', text: '¿Cuánto, cuándo se cobra y en qué forma? <strong>Decide:</strong> si el proyecto sigue existiendo el año que viene. <strong>Se rompe:</strong> al sacar el precio del costo en vez de sacarlo de lo que vale para quien paga, y al no decir la fecha de cobro. <strong>En M.E.T.A.S:</strong> L 30 la ficha suelta, L 250 el aula al mes, cobrado por adelantado del 1 al 5.' },
  { y: '6', icon: '🧾', label: 'La prueba', text: '¿Por qué creerte antes de pagarte? <strong>Decide:</strong> si llega a haber una primera compra. <strong>Se rompe:</strong> con adjetivos en lugar de cosas que se puedan abrir hoy mismo. <strong>En M.E.T.A.S:</strong> tres fichas completas abiertas y gratis, el Campeonísimo funcionando y una maestra que lo dice con su nombre.' },
  { y: '7', icon: '🚪', label: 'La salida', text: '¿Qué pasa si no sirve? <strong>Decide:</strong> cuánto riesgo carga el que paga, que es lo que frena casi todas las primeras compras. <strong>Se rompe:</strong> cuando no está escrita y cada reclamo se negocia de cero, con el cliente enojado enfrente. <strong>En M.E.T.A.S:</strong> treinta días; si no sirvió, se devuelve el mes cobrado y se cancela sin pedir explicaciones.' },
]);

B.parteData = JSON.stringify({
  alcance: {
    nombre: 'El alcance', icon: '📏',
    estructura: { title: 'Qué es', info: '• Hasta dónde llega lo que se entrega y <strong>dónde se acaba</strong><br>• Tiene dos mitades: el «sí incluye» y el <strong>«no incluye»</strong><br>• La segunda mitad es la que casi nadie escribe y la que evita los pleitos' },
    funcion: { title: 'Cómo se escribe', info: '• Se cuenta en unidades que el otro entienda: una ficha, un aula, un mes<br>• El «no incluye» se saca preguntando <strong>qué es lo que van a pedir después</strong><br>• Cada línea del «no incluye» tiene su precio aparte, no es una negativa seca' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con «y cualquier ajuste que necesite», que no tiene fondo<br>• Cuando el trabajo extra se hace «por esta vez» y queda de costumbre<br>• Al describir el alcance en horas propias en vez de en resultados del otro' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Una <strong>materia, un grado y un tema</strong> por ficha, con su pauta<br>• No incluye: impresión, cambios de contenido a pedido, capacitación presencial ni soporte fuera de horario<br>• Cada una de esas líneas tiene precio propio, y por eso se puede decir que sí' },
  },
  precio: {
    nombre: 'El precio', icon: '💵',
    estructura: { title: 'Qué es', info: '• La cifra que se cobra y <strong>cuándo se cobra</strong><br>• No es el costo: el costo es el piso, y el precio sale de lo que vale para quien paga<br>• Sin forma de pago escrita, el precio es un deseo' },
    funcion: { title: 'Cómo se escribe', info: '• Primero el piso, que sale del presupuesto real (la ruta hermana)<br>• Después el valor: qué se ahorra o gana la persona que paga<br>• Se dice <strong>la primera cifra</strong> y se escribe la fecha de cobro y el medio' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al cotizar sumando horas, que castiga al que trabaja rápido y bien<br>• Al esperar que el otro diga la cifra: la primera que se dice <strong>ancla</strong> todas las demás<br>• Con descuentos que no quitan nada, que se convierten en el precio nuevo' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Ficha suelta <strong>L 30</strong> · aula <strong>L 250 al mes</strong> · centro de seis aulas <strong>L 1.200 al mes</strong><br>• Misión a la medida <strong>L 4.500</strong>, mitad al encargar y mitad al entregar<br>• Cobro por adelantado del 1 al 5, por transferencia o en efectivo con recibo' },
  },
  prueba: {
    nombre: 'La prueba', icon: '🧾',
    estructura: { title: 'Qué es', info: '• Lo que hace creíble la oferta <strong>antes</strong> de que alguien pague<br>• Se puede abrir, tocar o comprobar hoy, sin pedir permiso<br>• No es un adjetivo: es un objeto o una persona con nombre' },
    funcion: { title: 'Cómo se escribe', info: '• Se eligen tres pruebas de tipos distintos: algo que se abre, algo que funciona y alguien que lo dice<br>• Los números van <strong>reales y con fecha</strong>, aunque sean chicos<br>• La prueba se pone <strong>antes</strong> del precio, nunca después' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con cifras que nadie puede comprobar, que derriban hasta lo que sí era cierto<br>• Cuando el escalón gratis es tan grande que ya nadie necesita pagar<br>• Al esconder la prueba detrás de un registro o un correo de confirmación' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• <strong>Tres fichas completas</strong> abiertas y gratis, sin cuenta ni instalación<br>• El <strong>Campeonísimo</strong> funcionando, no prometido<br>• Una maestra que ya lo usó y lo dice con su nombre y su centro' },
  },
  salida: {
    nombre: 'La salida', icon: '🚪',
    estructura: { title: 'Qué es', info: '• Qué pasa <strong>si no sirve</strong>: devolución, cambio o cancelación<br>• Es la pieza que quita el miedo de la primera compra<br>• Escrita, con plazo y sin condiciones escondidas' },
    funcion: { title: 'Cómo se escribe', info: '• Un plazo corto y claro, y <strong>qué se devuelve exactamente</strong><br>• Se dice quién decide (el que paga, no el que cobra)<br>• Se deja escrito qué se queda el cliente aunque cancele' },
    enfermedades: { title: 'Dónde se rompe', info: '• Cuando no existe y cada reclamo se pelea de cero<br>• Con letra chica que la anula, que sale más cara que no ofrecerla<br>• Al usarla como excusa para no arreglar el trabajo mal hecho' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• <strong>Treinta días</strong>: si no sirvió, se devuelve el mes cobrado y se cancela<br>• No se pide explicación ni se retiene lo ya descargado<br>• La ficha que ya imprimió se la queda: cuesta cero y compra confianza' },
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

/* ---------- los textos sueltos del motor que traía la etapa 1 ---------- */
const textos = [
  /* la pauta común de las decisiones, que no es lista y por eso va aquí */
  [/^const critDecisionGuide=.*$/m, 'const critDecisionGuide=' + CRIT_DECISION_GUIDE + ';'],
  /* mensaje de WhatsApp de compartirMision */
  [/📈 \*Ruta de la Marca · Etapa 1\* 📈/g, '📈 *Ruta de la Marca · Etapa 2* 📈'],
  [/Para quién y qué le cambia: audiencia y promesa antes que el logo, con los ocho casos del proyecto\. 🎯/g, 'Qué se entrega, qué no se incluye y a qué precio, con los ocho casos del proyecto. 🏷️'],
  [/_Incluye evaluación conceptual y prueba de la promesa\._ ✍️/g, '_Incluye evaluación conceptual y cuánto cobro por esto._ ✍️'],
  /* diploma: mensaje compartido y subtítulo */
  [/Etapa 1 de la Ruta de la Marca \(Para quién y qué le cambia\)/g, 'Etapa 2 de la Ruta de la Marca (La oferta: qué se entrega y a qué precio)'],
  [/Ruta de la Marca · Etapa 1: Para quién y qué le cambia/g, 'Ruta de la Marca · Etapa 2: La oferta'],
  [/Etapa 1 de la Ruta de la Marca/g, 'Etapa 2 de la Ruta de la Marca'],
  [/Ruta de la Marca · Etapa 1 de 6/g, 'Ruta de la Marca · Etapa 2 de 6'],
  /* la pregunta de la parte III, en pantalla y en papel */
  [/¿Para quién y qué le cambia, qué se pide a cambio y con qué condición por escrito aceptarías\?/g, '¿Qué se entrega exactamente, qué NO se incluye, a qué precio y con qué condición por escrito aceptarías?'],
  /* título del documento impreso de la prueba competencial */
  [/<title>Prueba de la promesa Para quién y qué le cambia · Ruta de la Marca/g, '<title>Cuánto cobro por esto · La oferta · Ruta de la Marca'],
  /* rótulos de las dos pruebas impresas, logros y quiz completado */
  [/Prueba de la promesa/g, 'Cuánto cobro por esto'],
  [/prueba de la promesa/g, 'cuánto cobro por esto'],
  [/Todos los términos de la marca explorados/g, 'Todas las piezas de la oferta exploradas'],
  [/Clasificador de característica y beneficio experto/g, 'Clasificador de promesa y oferta experto'],
  [/audiencia y promesa antes que el logo/g, 'qué se entrega y a qué precio'],
  [/Para quién y qué le cambia/g, 'La oferta'],
  [/para quién y qué le cambia/g, 'la oferta'],
  [/🎯 ¡/g, '🏷️ ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
