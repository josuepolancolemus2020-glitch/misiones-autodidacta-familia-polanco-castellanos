/* Inyecta los bancos de la misión «La deuda por dentro» (Ruta del Poder,
   etapa 3) sobre el molde copiado de la etapa 2, y de paso cambia los rótulos
   que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-deuda.js

   Los números de toda la misión salen de un solo juego, para que ninguna
   cuenta se contradiga con otra. El préstamo de ejemplo es siempre el mismo:

     12.000 lempiras a 12 meses, abono fijo a capital de 1.000
       sobre saldos al 2% mensual   interés 1.560   total 13.560
       sobre el monto al 2% mensual interés 2.880   total 14.880
       la primera cuota es 1.240 EN LAS DOS: ahí está toda la lección

     el mismo préstamo sobre saldos, cambiando solo el plazo:
       12 meses  cuota 1.240  interés 1.560  total 13.560
       24 meses  cuota   740  interés 3.000  total 15.000
       36 meses  cuota   573  interés 4.440  total 16.440

     desembolso: aprobado 20.000, comisión 3% (600) + seguro 400 + gastos 250
       llegan 18.750 y los intereses se calculan sobre 20.000

   Y se enlaza con la etapa 2 sin cambiarle un número: fijos 750 al mes,
   margen por aula 100, equilibrio 8 aulas. Con la cuota de 1.240 dentro,
   los fijos son 1.990 y el equilibrio salta a 20 aulas.                     */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-poder-deuda', 'js', 'deuda.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260728;
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

B.SAVE_KEY = `'faro_eco_deuda_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la deuda superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del crédito explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de capital e interés experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la deuda maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la deuda' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta del Poder completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Firma por la cuota 🌫️' },
  { t: 25, n: 'Separa capital de interés 💵' },
  { t: 55, n: 'Pregunta sobre qué se calcula 📈' },
  { t: 90, n: 'Suma el costo total 🧮' },
  { t: 130, n: 'Lee el cuadro de amortización 📋' },
  { t: 165, n: 'Recalcula su equilibrio ⚖️' },
  { t: 190, n: 'No firma sin las siete preguntas 📄' },
]);

B.fcData = JSON.stringify([
  { w: 'Capital', a: '💵 El dinero prestado, y en concreto <strong>el que de verdad llegó a la cuenta</strong>. Si aprobaron 20.000 y descontaron 1.250 de comisiones, el capital útil fue 18.750, aunque los intereses se cobren sobre 20.000.' },
  { w: 'Interés', a: '📈 El precio de usar dinero ajeno durante un tiempo. No es un castigo ni un abuso: es un precio. Lo que hay que saber es <strong>sobre qué monto se aplica</strong>, porque ahí cambia todo.' },
  { w: 'Interés sobre saldos', a: '📉 Se cobra el porcentaje <strong>sobre lo que todavía se debe</strong>, así que baja mes a mes. 12.000 al 2% mensual a doce meses dan <strong>1.560</strong> de intereses.' },
  { w: 'Interés sobre el monto', a: '📌 Llamado tasa plana: se cobra el porcentaje <strong>sobre el préstamo original todos los meses</strong>, incluso por dinero ya devuelto. El mismo 2% sube los intereses a <strong>2.880</strong>.' },
  { w: 'La regla del doble', a: '⚖️ Una tasa sobre el monto cuesta <strong>casi el doble</strong> que la misma tasa sobre saldos. Por eso las cinco palabras que hay que decir siempre son: <strong>«¿sobre saldos o sobre el monto?»</strong>.' },
  { w: 'Cuota', a: '🧾 Lo que se paga cada mes: una parte es capital y otra es interés. Es la cifra cómoda, la que se compara con el sueldo, y <strong>baja sola con solo alargar el plazo</strong>.' },
  { w: 'Plazo', a: '📅 Los meses que dura la deuda. No abarata: <strong>reparte</strong>. Pasar de doce a veinticuatro meses baja la cuota de 1.240 a 740 y sube los intereses de 1.560 a 3.000.' },
  { w: 'Costo total', a: '🧮 Cuota por número de cuotas, más comisiones y seguros, menos lo que llegó a la mano. Es <strong>la única cifra que compara dos ofertas</strong> y la que se dice en voz alta antes de firmar.' },
  { w: 'Cuadro de amortización', a: '📋 La tabla mes por mes: saldo, interés, abono a capital y cuota. Nadie lo niega si se pide, y <strong>enseña de un vistazo</strong> cuánto de cada cuota se va en interés.' },
  { w: 'Comisiones y seguro', a: '✂️ Lo que se descuenta <strong>antes</strong> de que el dinero llegue: comisión de administración, seguro de deuda, papelería. Aprobado 20.000, llegan 18.750, se devuelven intereses de 20.000.' },
  { w: 'Mora', a: '⏰ Lo que se cobra por pagar tarde: un recargo fijo más un interés sobre lo vencido. No es proporcional: es <strong>una deuda nueva encima de la vieja</strong>, y crece más rápido que la original.' },
  { w: 'Abono a capital', a: '💪 Pagar de más sobre el saldo, no sobre la cuota del mes. Baja el capital y con él todos los intereses que faltaban. <strong>Cuanto antes se hace, más vale</strong>.' },
  { w: 'Refinanciar', a: '🔄 Cambiar la deuda por otra con cuota menor y plazo mayor. Es <strong>comprar tiempo</strong>, y el tiempo tiene precio: en el préstamo de la casa, 1.440 lempiras por doce meses más.' },
  { w: 'Deuda que produce', a: '🌱 La que compra algo que mete <strong>más de lo que el interés saca</strong>, y con margen. Una laptop que permite producir dos misiones al mes puede serlo; tapar un mes flojo nunca lo es.' },
  { w: 'La cuota es un fijo', a: '⚖️ El día que se firma, la cuota entra en los costos fijos del mes. Con 1.240 de cuota, los fijos de M.E.T.A.S pasan de 750 a 1.990 y el equilibrio, de ocho aulas a <strong>veinte</strong>.' },
  { w: 'La pregunta que vende', a: '🎣 «¿Cuánto puede pagar al mes?». Suena a amabilidad y es el marco entero: con esa respuesta se arma un plazo que haga caber la cuota y <strong>el precio del dinero deja de discutirse</strong>.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Cuál es la única cifra que permite comparar dos ofertas de crédito?', o: ['a) La cuota mensual', 'b) El costo total en lempiras', 'c) El plazo', 'd) El monto aprobado'], c: 1 },
  { q: 'El interés «sobre saldos» se calcula cada mes sobre…', o: ['a) El préstamo original', 'b) La cuota del mes', 'c) Lo que todavía se debe', 'd) El total a devolver'], c: 2 },
  { q: '12.000 al 2% mensual a doce meses sobre saldos dan de intereses…', o: ['a) 1.560', 'b) 2.880', 'c) 240', 'd) 3.000'], c: 0 },
  { q: 'La misma tasa cobrada sobre el monto, en cambio, da…', o: ['a) 1.560', 'b) 1.240', 'c) 2.880', 'd) 4.440'], c: 2 },
  { q: '¿Qué pasa con la primera cuota en esas dos ofertas?', o: ['a) Es 1.240 en las dos, por eso no distingue nada', 'b) La plana es mucho mayor', 'c) La de saldos es mucho mayor', 'd) No se puede saber'], c: 0 },
  { q: 'Alargar el plazo de doce a veinticuatro meses…', o: ['a) Abarata el préstamo', 'b) Baja la cuota y sube el total', 'c) No cambia nada', 'd) Baja la cuota y el total'], c: 1 },
  { q: 'Aprueban 20.000 y descuentan 1.250 de comisiones, seguro y gastos. El préstamo real es…', o: ['a) 20.000', 'b) 21.250', 'c) 18.750, aunque los intereses se cobren sobre 20.000', 'd) 1.250'], c: 2 },
  { q: 'Con fijos de 750 y una cuota de 1.240, el punto de equilibrio de M.E.T.A.S pasa a…', o: ['a) 8 aulas', 'b) 12 aulas', 'c) 20 aulas', 'd) No cambia'], c: 2 },
  { q: '¿Cuándo es buena una deuda?', o: ['a) Cuando la tasa es baja', 'b) Cuando la cuota cabe en el mes', 'c) Cuando el plazo es largo', 'd) Cuando lo comprado mete más de lo que el interés saca'], c: 3 },
  { q: 'La señal de alarma de esta etapa es que la conversación gire alrededor de…', o: ['a) Cuánto puedes pagar al mes', 'b) La garantía', 'c) El destino del dinero', 'd) La fecha de desembolso'], c: 0 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Capital', 'Interés'], headA: '💵 Capital', headB: '📈 Interés', colA: 'ok', colB: 'no',
    words: [
      { w: 'Los 12.000 que llegaron a la cuenta', t: 'ok' }, { w: 'Los 240 del primer mes', t: 'no' },
      { w: 'El abono de 1.000 del mes', t: 'ok' }, { w: 'El 2% mensual sobre saldos', t: 'no' },
      { w: 'El saldo que todavía se debe', t: 'ok' }, { w: 'El recargo por pagar tarde', t: 'no' },
      { w: 'Lo que baja la deuda de verdad', t: 'ok' }, { w: 'El precio de usar dinero ajeno', t: 'no' },
    ],
  },
  {
    label: ['Baja', 'Sube'], headA: '⬇️ Baja el costo total', headB: '⬆️ Lo sube', colA: 'ok', colB: 'no',
    words: [
      { w: 'Abonar a capital cuando sobra', t: 'ok' }, { w: 'Alargar el plazo para respirar', t: 'no' },
      { w: 'Pedir el plazo más corto que se aguante', t: 'ok' }, { w: 'Atrasarse una cuota', t: 'no' },
      { w: 'Que la tasa sea sobre saldos', t: 'ok' }, { w: 'Que la tasa sea sobre el monto', t: 'no' },
      { w: 'Pagar el mismo día del vencimiento', t: 'ok' }, { w: 'Refinanciar sin cambiar nada más', t: 'no' },
    ],
  },
  {
    label: ['Produce', 'Pesa'], headA: '🌱 Deuda que produce', headB: '🪨 Deuda que solo pesa', colA: 'ok', colB: 'no',
    words: [
      { w: 'La laptop que permite dos misiones más al mes', t: 'ok' }, { w: 'Tapar el mes que no alcanzó', t: 'no' },
      { w: 'La impresora que baja el costo por ficha', t: 'ok' }, { w: 'Pagar una deuda con otra deuda', t: 'no' },
      { w: 'El equipo de grabación que ya tiene trabajo', t: 'ok' }, { w: 'Comprar equipo por si acaso', t: 'no' },
      { w: 'La compra que ahorra horas todos los meses', t: 'ok' }, { w: 'Adelantar un gasto que podía esperar', t: 'no' },
    ],
  },
  {
    label: ['Es deuda', 'No lo es'], headA: '💳 Es deuda', headB: '🧾 No es deuda', colA: 'ok', colB: 'no',
    words: [
      { w: 'Las cuotas «sin intereses» de la tienda', t: 'ok' }, { w: 'Comprar de contado con lo ahorrado', t: 'no' },
      { w: 'El adelanto del patrocinador', t: 'ok' }, { w: 'El sobre de ahorro del mes', t: 'no' },
      { w: 'El fiado de la papelería', t: 'ok' }, { w: 'Un donativo sin nada a cambio', t: 'no' },
      { w: 'La tarjeta que se paga en pagos', t: 'ok' }, { w: 'Cobrar un taller que ya se impartió', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['El', 'capital', 'es', 'lo', 'que', 'llegó', 'a', 'la', 'cuenta.'], c: 1, art: 'El dinero prestado de verdad' },
  { s: ['La', 'tasa', 'sola', 'no', 'dice', 'el', 'precio.'], c: 1, art: 'El porcentaje que hay que preguntar sobre qué se aplica' },
  { s: ['El', 'plazo', 'reparte,', 'no', 'abarata.'], c: 1, art: 'Los meses que dura la deuda' },
  { s: ['La', 'cuota', 'es', 'un', 'costo', 'fijo', 'nuevo.'], c: 1, art: 'Lo que se paga cada mes' },
  { s: ['El', 'total', 'es', 'la', 'cifra', 'que', 'compara.'], c: 1, art: 'La suma de todo lo que se devuelve' },
  { s: ['La', 'mora', 'crece', 'sola', 'cada', 'mes.'], c: 1, art: 'Lo que se cobra por pagar tarde' },
  { s: ['Las', 'comisiones', 'bajan', 'lo', 'que', 'llega.'], c: 1, art: 'El descuento antes del desembolso' },
  { s: ['El', 'saldo', 'es', 'lo', 'que', 'todavía', 'se', 'debe.'], c: 1, art: 'La base sobre la que se cobra un interés honesto' },
]);

B.cmpData = JSON.stringify([
  { s: 'La única cifra que compara dos ofertas es el costo ___.', opts: ['total', 'mensual', 'aprobado'], c: 0 },
  { s: 'El interés honesto se calcula sobre ___.', opts: ['saldos', 'el monto', 'la cuota'], c: 0 },
  { s: 'Una tasa plana cuesta casi el ___ que la misma tasa sobre saldos.', opts: ['doble', 'triple', 'mismo'], c: 0 },
  { s: 'El plazo no abarata: ___.', opts: ['reparte', 'perdona', 'reduce'], c: 0 },
  { s: 'La cuota que se firma entra en los costos ___.', opts: ['fijos', 'variables', 'de oportunidad'], c: 0 },
  { s: 'Lo que se cobra por pagar tarde se llama ___.', opts: ['mora', 'comisión', 'plazo'], c: 0 },
  { s: 'Pagar de más sobre el saldo es abonar a ___.', opts: ['capital', 'interés', 'plazo'], c: 0 },
  { s: 'La tabla mes por mes de una deuda es el cuadro de ___.', opts: ['amortización', 'equilibrio', 'ingresos'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Capital', 'Interés'], btnA: '💵 Capital', btnB: '📈 Interés', colA: 'ok', colB: 'no',
    words: [
      { w: 'Los 12.000 prestados', t: 'ok' }, { w: 'Los 240 del primer mes', t: 'no' },
      { w: 'El abono de 1.000', t: 'ok' }, { w: 'El 2% mensual', t: 'no' },
      { w: 'El saldo pendiente', t: 'ok' }, { w: 'El recargo por mora', t: 'no' },
      { w: 'Lo que llegó a la cuenta', t: 'ok' }, { w: 'Lo que cobra el prestamista', t: 'no' },
      { w: 'La parte que baja la deuda', t: 'ok' }, { w: 'La parte que no baja nada', t: 'no' },
    ],
  },
  {
    label: ['Baja', 'Sube'], btnA: '⬇️ Baja el total', btnB: '⬆️ Lo sube', colA: 'ok', colB: 'no',
    words: [
      { w: 'Abonar a capital', t: 'ok' }, { w: 'Alargar el plazo', t: 'no' },
      { w: 'Plazo corto', t: 'ok' }, { w: 'Atrasarse', t: 'no' },
      { w: 'Tasa sobre saldos', t: 'ok' }, { w: 'Tasa sobre el monto', t: 'no' },
      { w: 'Pagar puntual', t: 'ok' }, { w: 'Refinanciar', t: 'no' },
      { w: 'Pedir menos dinero', t: 'ok' }, { w: 'Seguro de deuda obligatorio', t: 'no' },
    ],
  },
  {
    label: ['Es deuda', 'No lo es'], btnA: '💳 Es deuda', btnB: '🧾 No lo es', colA: 'ok', colB: 'no',
    words: [
      { w: 'Cuotas «sin intereses»', t: 'ok' }, { w: 'Comprar de contado', t: 'no' },
      { w: 'El fiado', t: 'ok' }, { w: 'El sobre de ahorro', t: 'no' },
      { w: 'El adelanto del patrocinador', t: 'ok' }, { w: 'Un donativo', t: 'no' },
      { w: 'La tarjeta en pagos', t: 'ok' }, { w: 'Cobrar un taller ya dado', t: 'no' },
      { w: 'Comprar hoy y pagar después', t: 'ok' }, { w: 'Guardar para comprar después', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se lee una oferta de crédito, de principio a fin', steps: ['Preguntar cuánto llega de verdad a la cuenta, ya descontado todo', 'Preguntar si la tasa es sobre saldos o sobre el monto', 'Pedir el cuadro de amortización mes por mes', 'Sumar el costo total en lempiras, cuotas y gastos incluidos', 'Recalcular el punto de equilibrio del proyecto con la cuota dentro', 'Decidir en frío, al día siguiente, y dejar la condición por escrito'] },
  { label: 'Cómo se arma un cuadro de amortización', steps: ['Anotar el saldo con el que empieza el mes', 'Calcular el interés del mes sobre ese saldo', 'Decidir cuánto se abona a capital', 'Sumar interés más abono: esa es la cuota', 'Restar el abono al saldo y pasar al mes siguiente', 'Repetir hasta que el saldo llegue a cero y sumar la columna de intereses'] },
  { label: 'Qué hacer cuando un mes no alcanza para la cuota', steps: ['Avisar antes del vencimiento, no después', 'Pedir por escrito la reprogramación o el cambio de fecha', 'Calcular cuánto sube el total con la nueva propuesta', 'Aceptar solo si el alivio sirve para cambiar la situación', 'Anotar la nueva cuota como fijo y rehacer el equilibrio'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'El dinero prestado que de verdad llegó a la cuenta', ans: 'Capital', opts: ['Capital', 'Interés', 'Cuota', 'Costo total'] },
  { desc: 'El precio de usar dinero ajeno durante un tiempo', ans: 'Interés', opts: ['Interés', 'Capital', 'Plazo', 'Comisión'] },
  { desc: 'Los meses que dura la deuda: reparte, no abarata', ans: 'Plazo', opts: ['Plazo', 'Cuota', 'Mora', 'Capital'] },
  { desc: 'Lo que se paga cada mes, con una parte de capital y otra de interés', ans: 'Cuota', opts: ['Cuota', 'Saldo', 'Comisión', 'Capital'] },
  { desc: 'Cuotas por meses más gastos, menos lo que llegó a la mano', ans: 'Costo total', opts: ['Costo total', 'Cuota', 'Capital', 'Tasa'] },
  { desc: 'Lo que se descuenta antes de que el dinero llegue', ans: 'Comisiones y seguro', opts: ['Comisiones y seguro', 'Mora', 'Interés', 'Abono a capital'] },
  { desc: 'Recargo más interés sobre lo vencido: crece sola', ans: 'Mora', opts: ['Mora', 'Comisión', 'Plazo', 'Saldo'] },
  { desc: 'La tabla mes por mes con saldo, interés y abono', ans: 'Cuadro de amortización', opts: ['Cuadro de amortización', 'Costo total', 'Cuota', 'Capital'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: '«Solo 1.150 al mes y se la lleva hoy»', func: '¿Cuál es el precio de contado y cuánto suman las 24 cuotas?', opts: ['¿Cuál es el precio de contado y cuánto suman las 24 cuotas?', '¿Puedo pagar el primer mes por adelantado?', '¿Tiene garantía el equipo?', '¿Aceptan tarjeta?'] },
  { trans: '«Es apenas un 2% mensual, la tasa más baja del pueblo»', func: '¿Es sobre saldos o sobre el monto?', opts: ['¿Es sobre saldos o sobre el monto?', '¿Me la pueden bajar un poco más?', '¿Cuánto tiempo lleva la financiera?', '¿Puedo pagar en efectivo?'] },
  { trans: '«Le tenemos aprobados 20.000 lempiras, pase mañana»', func: '¿Cuánto llega de verdad a la cuenta después de los descuentos?', opts: ['¿Cuánto llega de verdad a la cuenta después de los descuentos?', '¿A qué hora abren?', '¿Puedo pedir más?', '¿Necesito fiador?'] },
  { trans: '«Se la dejamos en 740 al mes, para que respire»', func: '¿Cuánto sube el total al alargar el plazo?', opts: ['¿Cuánto sube el total al alargar el plazo?', '¿Desde qué mes aplica la cuota nueva?', '¿Puedo cambiar la fecha de pago?', '¿Sale en el estado de cuenta?'] },
  { trans: '«Cero interés, usted solo paga el manejo»', func: '¿Cuánto suman las comisiones y el seguro, en lempiras?', opts: ['¿Cuánto suman las comisiones y el seguro, en lempiras?', '¿El manejo se cobra al final?', '¿Cuántos clientes tienen?', '¿Puedo firmar hoy mismo?'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'La cuota era baja y al final se devolvió casi el doble de lo prestado', characteristic: 'No se sumó el costo total, solo se miró la cuota', opts: ['No se sumó el costo total, solo se miró la cuota', 'La tasa subió a mitad de camino', 'Se pagó tarde varias veces', 'El préstamo era muy grande'] },
  { disease: 'Dos ofertas al mismo 2% y una costó 1.320 lempiras más', characteristic: 'No se preguntó si el interés era sobre saldos o sobre el monto', opts: ['No se preguntó si el interés era sobre saldos o sobre el monto', 'Una financiera cobró más comisiones', 'El plazo era distinto', 'La segunda pidió fiador'] },
  { disease: 'Aprobaron 20.000 y no alcanzó para comprar lo que se iba a comprar', characteristic: 'No se preguntó cuánto llegaba a la cuenta después de los descuentos', opts: ['No se preguntó cuánto llegaba a la cuenta después de los descuentos', 'El equipo subió de precio', 'Se gastó en otra cosa', 'El banco tardó en desembolsar'] },
  { disease: 'La cuota se pagaba puntual y aun así el mes no cerraba', characteristic: 'No se rehizo el punto de equilibrio con la cuota como costo fijo', opts: ['No se rehizo el punto de equilibrio con la cuota como costo fijo', 'Los ingresos bajaron sin aviso', 'Se cobró poco por aula', 'Subió el precio del dominio'] },
  { disease: 'Tres meses de atraso convirtieron 3.720 en cerca de 4.570', characteristic: 'No se avisó ni se pidió reprogramar antes del vencimiento', opts: ['No se avisó ni se pidió reprogramar antes del vencimiento', 'El contrato cambió de condiciones', 'Se perdió el recibo', 'El cobrador no pasó'] },
  { disease: 'La refinanciación alivió el mes y a los seis meses todo seguía igual', characteristic: 'Se compró tiempo sin usarlo para cambiar la situación', opts: ['Se compró tiempo sin usarlo para cambiar la situación', 'La nueva tasa era más alta', 'No se leyó la letra pequeña', 'Se cambió de financiera'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'El dinero prestado que de verdad llegó a la cuenta.', type: 'Capital' },
  { s: 'El precio de usar dinero ajeno durante un tiempo.', type: 'Interés' },
  { s: 'Se cobra el porcentaje sobre lo que todavía se debe.', type: 'Interés sobre saldos' },
  { s: 'Se cobra el porcentaje sobre el préstamo original, hasta el último mes.', type: 'Interés sobre el monto' },
  { s: 'Lo que se paga cada mes, con parte de capital y parte de interés.', type: 'Cuota' },
  { s: 'Los meses que dura la deuda.', type: 'Plazo' },
  { s: 'Cuotas por meses más gastos, menos lo que llegó a la mano.', type: 'Costo total' },
  { s: 'Recargo e interés por pagar tarde.', type: 'Mora' },
  { s: 'Pagar de más sobre el saldo para bajar los intereses que faltan.', type: 'Abono a capital' },
  { s: 'La tabla mes por mes con saldo, interés, abono y cuota.', type: 'Cuadro de amortización' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Los 12.000 que llegaron a la cuenta', gen: 'Parte de la deuda', n: 'Baja el saldo', g: 'Capital', t: 'Es el dinero prestado' },
  { w: 'Los 240 del primer mes', gen: 'Parte de la deuda', n: 'No baja el saldo', g: 'Interés', t: 'Es el precio del dinero' },
  { w: 'El abono de 1.000 del mes', gen: 'Parte de la deuda', n: 'Baja el saldo', g: 'Capital', t: 'Es el dinero prestado' },
  { w: 'El recargo por pagar tarde', gen: 'Parte de la deuda', n: 'No baja el saldo', g: 'Interés', t: 'Es el precio del dinero' },
  { w: 'Abonar a capital cuando sobra', gen: 'Efecto en el total', n: 'Menos meses de interés', g: 'Baja el total', t: 'Conviene hacerlo pronto' },
  { w: 'Alargar el plazo para respirar', gen: 'Efecto en el total', n: 'Más meses de interés', g: 'Sube el total', t: 'El alivio se paga' },
  { w: 'La laptop que permite dos misiones más al mes', gen: 'Tipo de deuda', n: 'Compra algo que mete', g: 'Deuda que produce', t: 'Se juzga por lo que compra' },
  { w: 'Tapar el mes que no alcanzó', gen: 'Tipo de deuda', n: 'No compra nada que meta', g: 'Deuda que pesa', t: 'Mueve el problema adelante' },
  { w: 'Las cuotas «sin intereses» de la tienda', gen: 'Naturaleza', n: 'Se recibe hoy y se paga después', g: 'Es deuda', t: 'Aunque no la llamen así' },
  { w: 'Comprar de contado con lo ahorrado', gen: 'Naturaleza', n: 'No se debe nada después', g: 'No es deuda', t: 'Se pagó antes de recibir' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La única cifra que compara dos ofertas es el costo ___.', opts: ['total', 'mensual', 'aprobado'], ans: 'total' },
  { s: 'El interés honesto se calcula sobre ___.', opts: ['saldos', 'el monto', 'la cuota'], ans: 'saldos' },
  { s: 'Una tasa plana cuesta casi el ___ que la misma tasa sobre saldos.', opts: ['doble', 'triple', 'mismo'], ans: 'doble' },
  { s: 'El plazo no abarata: ___.', opts: ['reparte', 'perdona', 'reduce'], ans: 'reparte' },
  { s: 'La cuota que se firma entra en los costos ___.', opts: ['fijos', 'variables', 'hundidos'], ans: 'fijos' },
  { s: 'Lo que se cobra por pagar tarde se llama ___.', opts: ['mora', 'comision', 'plazo'], ans: 'mora' },
  { s: 'Pagar de más sobre el saldo es abonar a ___.', opts: ['capital', 'interes', 'plazo'], ans: 'capital' },
  { s: 'La tabla mes por mes de una deuda es el cuadro de ___.', opts: ['amortizacion', 'equilibrio', 'ingresos'], ans: 'amortizacion' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica la diferencia entre interés sobre saldos e interés sobre el monto, con los números del préstamo de la casa.', ans: 'Sobre saldos se cobra el porcentaje cada mes sobre lo que todavía se debe, así que el interés baja a medida que baja la deuda. Sobre el monto, llamado tasa plana, se cobra sobre el préstamo original todos los meses, incluso por dinero que ya se devolvió. Con 12.000 lempiras al 2% mensual a doce meses, sobre saldos son 1.560 de intereses y sobre el monto 2.880: la misma tasa cuesta 1.320 lempiras más. Lo que hace la trampa perfecta es que la primera cuota es 1.240 en las dos, así que el recibo del primer mes no distingue nada y la diferencia solo aparece al final. La regla del doble resume todo: una tasa plana cuesta casi el doble que la misma tasa sobre saldos.' },
  { q: '¿Por qué se dice que el plazo reparte y no abarata? Usa la tabla del préstamo de 12.000.', ans: 'Porque alargar el plazo baja la cuota pero sube el total. El mismo préstamo de 12.000 al 2% sobre saldos da, a doce meses, una primera cuota de 1.240, intereses de 1.560 y un total de 13.560. A veinticuatro meses la cuota baja a 740, pero los intereses suben a 3.000 y el total a 15.000. A treinta y seis meses la cuota queda en 573 y el total sube a 16.440. Es decir: la cuota bajó 500 lempiras y el total subió 1.440 por cada año extra. El alivio es real y el precio también, y por eso la decisión se toma mirando el total, que es la cifra que no se enseña sola.' },
  { q: 'Explica por qué una cuota es un costo fijo nuevo y qué hay que hacer antes de firmar.', ans: 'Porque se paga todos los meses haya trabajo o no, exactamente igual que el dominio o los datos del teléfono, y por eso entra en los costos fijos del mes desde el día que se firma. En M.E.T.A.S los fijos son 750 al mes y el margen por aula es de 100, así que el punto de equilibrio son ocho aulas. Con una cuota de 1.240, los fijos pasan a 1.990 y el equilibrio salta a veinte aulas. Hoy hay seis. Antes de firmar hay que rehacer esa cuenta: si el plan depende de conseguir catorce aulas en doce meses, no es un plan sino una apuesta con fecha de vencimiento. Una deuda se paga con volumen que todavía no existe, y ese es el riesgo entero.' },
  { q: 'Aprueban 20.000 lempiras y descuentan 600 de comisión, 400 de seguro y 250 de gastos. Explica qué cambia.', ans: 'Cambia que el préstamo no es de 20.000 sino de 18.750, porque eso es lo que llega a la cuenta. Los intereses, en cambio, se siguen calculando sobre 20.000, así que se paga por 1.250 lempiras que nunca se tuvieron. El monto aprobado es publicidad; el monto desembolsado es el préstamo. De ahí salen dos consecuencias prácticas: toda tasa que se compare hay que compararla contra lo que de verdad entró, y el préstamo se pide por lo que hace falta más los descuentos, para que lo que llegue alcance para comprar lo que se iba a comprar.' },
  { q: '¿Cuándo es buena una deuda? Compara los dos préstamos de 15.000 del proyecto.', ans: 'Una deuda es buena solo si lo que se compra con ella mete más de lo que el interés saca, y con margen, no justo. Los dos préstamos de 15.000 tienen el mismo monto, la misma tasa y el mismo plazo, y los dos sacan lo mismo todos los meses. El primero compra una laptop que permite producir dos misiones más al mes: compra algo que mete. El segundo cubre un mes en que no alcanzó: no compra nada, solo mueve el problema tres meses adelante y lo devuelve con intereses encima. La deuda no se juzga por la tasa, se juzga por lo que se compra con ella; y si la cuenta sale justa, cualquier mes flojo la vuelve mala. Para tapar un hueco la respuesta es recortar o cobrar antes, nunca pedir prestado: eso no arregla el hueco, lo alquila.' },
  { q: '¿Cuál es la señal de alarma de esta etapa y por qué funciona tan bien la pregunta que la produce?', ans: 'La señal es que la conversación gire alrededor de cuánto cabe en tu mes y no de cuánto cuesta el dinero. La pregunta que la produce es «¿cuánto puede pagar al mes?», y funciona porque suena a amabilidad: parece que se están adaptando a tu situación. Lo que hace en realidad es fijar el marco entero, porque con esa respuesta se arma un plazo que haga caber la cuota y el precio del dinero deja de discutirse. No hay engaño: la cuota es real y el plazo también. Lo que falta es el número que los ata, el costo total en lempiras, y ese no aparece si no se pide. La salida es devolver la conversación a la cifra que compara: «¿cuánto devuelvo en total?».' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['CAPITAL', 'INTERES', 'CUOTA', 'PLAZO', 'MORA', 'SALDO']),
  haceSopa(10, ['TASA', 'DEUDA', 'TOTAL', 'ABONO', 'PAGO', 'MES']),
  haceSopa(10, ['PRESTAMO', 'COMISION', 'SEGURO', 'ATRASO', 'MONTO', 'BANCO']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'La cuota mensual es la cifra que permite comparar dos ofertas de crédito.', a: false },
  { q: 'El costo total en lempiras es la cifra que permite comparar dos ofertas.', a: true },
  { q: 'El interés sobre saldos se calcula cada mes sobre lo que todavía se debe.', a: true },
  { q: 'Una tasa cobrada sobre el monto original cuesta lo mismo que sobre saldos.', a: false },
  { q: 'Alargar el plazo baja la cuota y sube el costo total.', a: true },
  { q: 'El monto aprobado y el monto que llega a la cuenta son siempre iguales.', a: false },
  { q: 'La cuota de un préstamo se anota como costo fijo del mes.', a: true },
  { q: 'La mora es un recargo proporcional y pequeño que casi no cambia la deuda.', a: false },
  { q: 'Abonar a capital baja los intereses que faltaban por pagar.', a: true },
  { q: 'Refinanciar es comprar tiempo, y el tiempo tiene precio.', a: true },
  { q: 'Una deuda es buena cuando la cuota cabe cómoda en el mes.', a: false },
  { q: 'Un adelanto que se paga con trabajo futuro también es una deuda.', a: true },
  { q: 'El cuadro de amortización es un documento secreto que no se puede pedir.', a: false },
  { q: 'En el préstamo de la casa, la primera cuota es la misma con tasa plana y con tasa sobre saldos.', a: true },
  { q: 'Con una cuota de 1.240, el punto de equilibrio de M.E.T.A.S pasa de ocho aulas a veinte.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Cuál es la única cifra que compara dos ofertas de crédito?', o: ['a) El costo total en lempiras', 'b) La cuota mensual', 'c) El plazo', 'd) El monto aprobado'], a: 0 },
  { q: 'El interés sobre saldos se calcula sobre…', o: ['a) El préstamo original', 'b) La cuota del mes', 'c) Lo que todavía se debe', 'd) El total a devolver'], a: 2 },
  { q: '12.000 al 2% mensual a doce meses sobre saldos dan de intereses…', o: ['a) 2.880', 'b) 1.560', 'c) 240', 'd) 3.000'], a: 1 },
  { q: 'La misma tasa cobrada sobre el monto da de intereses…', o: ['a) 1.560', 'b) 1.240', 'c) 4.440', 'd) 2.880'], a: 3 },
  { q: '¿Por qué la tasa plana engaña tan bien?', o: ['a) Porque la primera cuota es idéntica a la de saldos', 'b) Porque nunca se escribe en el contrato', 'c) Porque el plazo es más corto', 'd) Porque no cobra comisiones'], a: 0 },
  { q: 'Alargar el plazo de doce a veinticuatro meses…', o: ['a) Abarata el préstamo', 'b) No cambia el total', 'c) Baja la cuota y sube el total', 'd) Baja la cuota y el total'], a: 2 },
  { q: 'Aprueban 20.000 y descuentan 1.250 antes del desembolso. El préstamo real es…', o: ['a) 21.250', 'b) 18.750, aunque los intereses se cobren sobre 20.000', 'c) 20.000', 'd) 1.250'], a: 1 },
  { q: 'Con fijos de 750, margen de 100 por aula y una cuota de 1.240, el equilibrio pasa a…', o: ['a) 8 aulas', 'b) 12 aulas', 'c) 14 aulas', 'd) 20 aulas'], a: 3 },
  { q: '¿Cuándo es buena una deuda?', o: ['a) Cuando la tasa es baja', 'b) Cuando lo comprado mete más de lo que el interés saca, con margen', 'c) Cuando la cuota cabe en el mes', 'd) Cuando el plazo es largo'], a: 1 },
  { q: 'La señal de alarma de esta etapa es que pregunten…', o: ['a) Para qué es el dinero', 'b) Cuánto puedes pagar al mes', 'c) Si tienes fiador', 'd) Dónde trabajas'], a: 1 },
  { q: 'Tres meses de atraso sobre cuotas de 1.240, con 200 de recargo y 5% mensual, dejan una deuda de cerca de…', o: ['a) 3.720', 'b) 4.000', 'c) 4.570', 'd) 6.000'], a: 2 },
  { q: 'Refinanciar de doce a veinticuatro meses en el préstamo de la casa cuesta…', o: ['a) Nada, solo alivia', 'b) 500 lempiras', 'c) 1.440 lempiras más de intereses', 'd) 2.880 lempiras'], a: 2 },
  { q: '24 cuotas de 1.150 por una laptop que al contado vale 20.000 significan un sobreprecio de…', o: ['a) 7.600, un 38%', 'b) 1.150', 'c) Cero, porque es sin intereses', 'd) 27.600'], a: 0 },
  { q: '¿Qué documento hay que pedir siempre antes de firmar?', o: ['a) La constancia de la financiera', 'b) El cuadro de amortización mes por mes', 'c) La copia del reglamento', 'd) El recibo del primer mes'], a: 1 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saberse los términos', 'b) Tener la ficha impresa', 'c) Haber leído el módulo entero', 'd) Decir ante cualquier oferta cuánto se devuelve en total y cuántas aulas hacen falta'], a: 3 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La única cifra que compara dos ofertas es el costo ___.', a: 'total' },
  { q: 'El interés honesto se calcula sobre ___.', a: 'saldos' },
  { q: 'Una tasa plana cuesta casi el ___ que la misma tasa sobre saldos.', a: 'doble' },
  { q: 'El plazo no abarata: ___.', a: 'reparte' },
  { q: 'La cuota que se firma entra en los costos ___.', a: 'fijos' },
  { q: 'Lo que se cobra por pagar tarde se llama ___.', a: 'mora' },
  { q: 'Pagar de más sobre el saldo es abonar a ___.', a: 'capital' },
  { q: 'La tabla mes por mes de una deuda es el cuadro de ___.', a: 'amortizacion' },
  { q: '12.000 al 2% mensual a doce meses sobre saldos dan ___ de intereses.', a: '1560' },
  { q: 'La misma tasa sobre el monto da ___ de intereses.', a: '2880' },
  { q: 'La primera cuota del préstamo de la casa es de ___ lempiras.', a: '1240' },
  { q: 'Con una cuota de 1.240 los fijos pasan de 750 a ___ lempiras.', a: '1990' },
  { q: 'Y el punto de equilibrio salta de ocho aulas a ___.', a: 'veinte' },
  { q: 'De 20.000 aprobados con 1.250 de descuentos llegan ___ lempiras.', a: '18750' },
  { q: 'La pregunta que vende una deuda es cuánto puedes pagar al ___.', a: 'mes' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Capital', def: 'El dinero prestado que llegó a la cuenta' },
  { term: 'Interés', def: 'El precio de usar dinero ajeno un tiempo' },
  { term: 'Interés sobre saldos', def: 'Se cobra sobre lo que todavía se debe' },
  { term: 'Interés sobre el monto', def: 'Se cobra siempre sobre el préstamo original' },
  { term: 'Cuota', def: 'Lo que se paga cada mes, capital más interés' },
  { term: 'Plazo', def: 'Los meses que dura la deuda' },
  { term: 'Costo total', def: 'Todas las cuotas más gastos, menos lo recibido' },
  { term: 'Comisiones y seguro', def: 'Lo que se descuenta antes del desembolso' },
  { term: 'Mora', def: 'Recargo e interés por pagar tarde' },
  { term: 'Abono a capital', def: 'Pagar de más sobre el saldo pendiente' },
  { term: 'Refinanciar', def: 'Cambiar la deuda por otra de plazo mayor' },
  { term: 'Cuadro de amortización', def: 'La tabla mes por mes de saldo e interés' },
  { term: 'Deuda que produce', def: 'La que compra algo que mete más de lo que saca' },
  { term: 'La regla del doble', def: 'Una tasa plana cuesta casi el doble' },
  { term: 'La pregunta que vende', def: 'Cuánto puede pagar al mes' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Una tienda ofrece la laptop de trabajo en 24 cuotas de 1.150 lempiras, «sin intereses». No aparece por ningún lado el precio de contado, que en otra tienda es de 20.000.' },
  { txt: 'Hacen falta 12.000 lempiras para el equipo de grabación. Dos prestamistas ofrecen 2% mensual a doce meses: uno cobra sobre saldos y el otro sobre el monto. La primera cuota es 1.240 en los dos casos.' },
  { txt: 'Un préstamo de 12.000 a doce meses deja una cuota de 1.240 al mes. Los fijos de M.E.T.A.S son hoy 750, el margen por aula es de 100 y hay seis aulas pagando.' },
  { txt: 'Aprueban 20.000 lempiras. Del desembolso descuentan 3% de comisión, 400 de seguro de deuda y 250 de gastos, pero los intereses se calculan sobre los 20.000.' },
  { txt: 'Dos préstamos iguales de 15.000: uno compra una laptop que permite producir dos misiones más al mes; el otro cubre un mes en que no alcanzó para los fijos.' },
  { txt: 'Un mes malo y la cuota de 1.240 no se paga. El contrato dice 200 lempiras de recargo por cuota vencida y 5% mensual sobre lo vencido. Ya van tres meses.' },
  { txt: 'A mitad del préstamo ofrecen bajar la cuota de 1.240 a 740 pasando el plazo de doce a veinticuatro meses, «para que respire».' },
  { txt: 'Un negocio ofrece adelantar 10.000 lempiras hoy a cambio de que su logo esté en las fichas dos años en vez de uno. No hay contrato de préstamo, ni tasa, ni cuota.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué falta preguntar en la oferta tal como está planteada?',
  '2. Calcula el costo total en lempiras, o lo que de verdad se recibe.',
  '3. ¿Qué le pasa al punto de equilibrio del proyecto si esto se firma?',
  '4. Escribe en 3-4 frases qué decidirías y con qué condición por escrito.',
]);

B.critCaseGuides = JSON.stringify([
  'Lo que casi siempre falta es el precio de contado, si la tasa es sobre saldos o sobre el monto, cuánto llega de verdad a la cuenta y qué pasa si un mes no se paga. Y falta el cuadro de amortización, que nadie niega cuando se pide.',
  'La cuenta se hace con el juego de números de la casa: préstamo de 12.000 a doce meses, 1.560 de intereses sobre saldos contra 2.880 sobre el monto, primera cuota de 1.240 en los dos, y 18.750 que llegan de 20.000 aprobados.',
  'Toda cuota es un costo fijo nuevo. Con los fijos en 750 y el margen por aula en 100, el equilibrio son ocho aulas; con una cuota de 1.240, los fijos son 1.990 y el equilibrio salta a veinte. Ese salto es la decisión.',
  'Casi ninguna oferta se acepta o se rechaza completa: se acepta con condiciones, y la condición sale del número. Se decide al día siguiente, nunca con alguien enfrente esperando una firma.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Son 24 cuotas de 1.150 y no cobran intereses, así que sale igual que de contado".', g1: 'Sale 27.600 en total, y la misma laptop al contado cuesta 20.000: el «sin intereses» costó 7.600 lempiras, un 38% sobre el precio, escondido dentro del precio de lista.', g2: 'Cuando el interés no se nombra, se cobra por dentro del precio. Sin el precio de contado escrito al lado no hay tasa que calcular ni oferta que comparar.' },
  { txt: '"Las dos son al 2% mensual, así que da igual con cuál me quede".', g1: 'No da igual: sobre saldos son 1.560 de intereses y sobre el monto 2.880, o sea 1.320 lempiras de diferencia por el mismo dinero y el mismo plazo.', g2: 'Y la primera cuota es 1.240 en las dos, así que el recibo del primer mes no distingue nada. Las cinco palabras que hay que decir siempre son: ¿sobre saldos o sobre el monto?' },
  { txt: '"La cuota de 1.240 cabe en el mes, la pagamos con lo que entra de las aulas".', g1: 'La cuota es un costo fijo nuevo: los fijos pasan de 750 a 1.990 y el punto de equilibrio, de ocho aulas a veinte. Hoy hay seis.', g2: 'La deuda no se paga con lo que el proyecto gana hoy, sino con aulas que todavía no existen. El equilibrio se rehace antes de firmar, nunca después.' },
  { txt: '"Nos aprobaron 20.000, con eso compramos el equipo completo".', g1: 'A la cuenta llegan 18.750, porque antes se descuentan 600 de comisión, 400 de seguro y 250 de gastos. Y los intereses se cobran sobre 20.000.', g2: 'El monto aprobado es publicidad; el desembolsado es el préstamo. Se pide por lo que hace falta más los descuentos, para que lo que llegue alcance.' },
  { txt: '"Mejor a 24 meses, así la cuota es de 740 y respiramos".', g1: 'El alivio es real: 500 lempiras menos al mes. El precio también: los intereses pasan de 1.560 a 3.000, o sea 1.440 lempiras por doce meses más atado.', g2: 'El plazo reparte, no abarata. Se acepta si el aire sirve para cambiar la situación, no si solo hace el mes más cómodo.' },
  { txt: '"Este mes no pagamos y el otro nos ponemos al día, total es una sola cuota".', g1: 'A los tres meses no se deben 3.720 sino cerca de 4.570, entre recargos de 200 por cuota y 5% mensual sobre lo vencido, y el historial queda dañado.', g2: 'La mora es una deuda nueva encima de la vieja. Antes de dejar de pagar se llama y se pide reprogramar por escrito, y se pide antes del vencimiento, no después.' },
]);

B.critDecisionBank = JSON.stringify([
  'La laptop en 24 cuotas de 1.150 «sin intereses», con precio de contado de 20.000: ¿se compra a cuotas o se busca el dinero aparte?',
  'Dos ofertas al 2% mensual por 12.000 a doce meses, una sobre saldos y otra sobre el monto: ¿cómo se distingue cuál es cuál antes de firmar?',
  'Un préstamo con cuota de 1.240 cuando los fijos son 750 y hay seis aulas pagando: ¿se firma, y con qué condición?',
  'Un desembolso de 18.750 sobre 20.000 aprobados: ¿por cuánto se pide el préstamo y qué se pregunta del seguro de deuda?',
  '15.000 para una laptop que produce dos misiones más al mes contra 15.000 para tapar el mes que no alcanzó: ¿cuál se pide y cuál no?',
  'Tres meses de atraso sobre cuotas de 1.240, con recargos y mora corriendo: ¿qué se hace primero y qué se pide por escrito?',
  'La refinanciación que baja la cuota de 1.240 a 740 y sube los intereses 1.440: ¿cuándo vale la pena aceptarla?',
  'El adelanto de 10.000 del patrocinador a cambio de dos años de logo en vez de uno: ¿es deuda, y con qué condición se acepta?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Firmar mirando la cuota: 740 al mes cabe cómodo.', b: 'Firmar mirando el total: 15.000 devueltos por 12.000 prestados.', ga: 'Caso A: la decisión se toma con la cifra que el vendedor eligió enseñar, y el precio del dinero nunca llega a discutirse.', gb: 'Caso B: la decisión se toma con la única cifra que compara ofertas, y de paso aparece que doce meses más cuestan 1.440 lempiras.' },
  { a: 'Pedir 12.000 a doce meses con cuota de 1.240.', b: 'Pedir 12.000 a veinticuatro meses con cuota de 740.', ga: 'Caso A: aprieta más cada mes y se sale con 1.560 de intereses y la libertad de vuelta en un año.', gb: 'Caso B: respira mejor cada mes y cuesta 3.000 de intereses y dos años sin poder decir que no a un trabajo que no conviene.' },
  { a: 'Pedir prestado para una laptop que permite dos misiones más al mes.', b: 'Pedir prestado para cubrir el mes en que no alcanzó.', ga: 'Caso A: la deuda compra algo que mete, así que puede pagarse sola si el ingreso ya existe y no solo está prometido.', gb: 'Caso B: la deuda no compra nada; mueve el hueco tres meses adelante y lo devuelve con intereses encima.' },
  { a: 'Avisar antes del vencimiento y pedir reprogramar por escrito.', b: 'Dejar pasar tres meses y ponerse al día después.', ga: 'Caso A: casi siempre existe la opción, casi nunca la ofrecen, y pedirla a tiempo mantiene el historial intacto.', gb: 'Caso B: 3.720 de cuotas se vuelven cerca de 4.570 entre recargos y mora, y el crédito siguiente sale más caro o no sale.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se decide mirando la cuota y no el costo total.', guide: 'Se firma con la cifra que el que presta eligió enseñar. La cuota baja sola con solo alargar el plazo, así que no dice nada sobre el precio del dinero.' },
  { cause: 'No se pregunta si la tasa es sobre saldos o sobre el monto.', guide: 'La misma tasa puede costar casi el doble. Y como la primera cuota es idéntica en los dos casos, el error no se nota hasta el final del préstamo.' },
  { cause: 'Se toma el monto aprobado como si fuera el monto recibido.', guide: 'Las comisiones, el seguro y los gastos se descuentan antes del desembolso, así que llega menos de lo que hace falta y se pagan intereses por dinero que nunca se tuvo.' },
  { cause: 'No se rehace el punto de equilibrio con la cuota dentro.', guide: 'La cuota es un costo fijo nuevo y mueve el equilibrio de golpe. Firmar sin esa cuenta es apostar a un volumen de aulas que todavía no existe.' },
  { cause: 'Se deja de pagar sin avisar.', guide: 'La mora no es proporcional: es una deuda nueva encima de la vieja, con recargo fijo más interés sobre lo vencido, y encima daña el crédito siguiente.' },
  { cause: 'Se pide prestado para tapar un mes que no alcanzó.', guide: 'La deuda no compra nada que meta dinero: alquila el hueco por unos meses y lo devuelve con intereses. La salida es recortar o cobrar antes.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Se eligió la oferta correcta entre dos que sonaban idénticas.', guide: 'Se preguntó si el interés era sobre saldos o sobre el monto antes de mirar la cuota, y esas cinco palabras ahorraron 1.320 lempiras.' },
  { effect: 'El préstamo alcanzó justo para comprar lo que se iba a comprar.', guide: 'Se pidió por el monto necesario más los descuentos, sabiendo que de 20.000 aprobados llegan 18.750 a la cuenta.' },
  { effect: 'Se dijo que no a una cuota que cabía cómoda en el mes.', guide: 'Se rehizo el punto de equilibrio con la cuota dentro: pasaba de ocho aulas a veinte y solo había seis. El número decidió, no la comodidad.' },
  { effect: 'La deuda se pagó tres meses antes y costó menos de lo previsto.', guide: 'Se abonó a capital en cuanto sobró dinero, y como el interés se cobraba sobre saldos, cada abono borró los intereses de los meses que faltaban.' },
  { effect: 'Un mes malo no se convirtió en una bola de nieve.', guide: 'Se avisó antes del vencimiento y se pidió la reprogramación por escrito, así que no hubo recargos ni interés de mora ni historial dañado.' },
  { effect: 'El adelanto del patrocinador acabó siendo un buen ingreso.', guide: 'Se cotizó el segundo año al precio de ese año y se dejó escrito qué no incluye el patrocinio. Con esas dos líneas dejó de ser una hipoteca sobre la marca.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '💵', label: 'El capital', text: 'El dinero prestado, y en concreto <strong>el que llega a la cuenta</strong>. <strong>Se mide:</strong> en lempiras desembolsados, no aprobados. <strong>Engaña:</strong> cuando se toma el monto de la carta de aprobación. <strong>En M.E.T.A.S:</strong> de 20.000 aprobados llegan 18.750.' },
  { y: '2', icon: '📈', label: 'La tasa', text: 'El precio del dinero por unidad de tiempo. <strong>Se mide:</strong> en porcentaje mensual o anual. <strong>Engaña:</strong> cuando no se dice <strong>sobre qué</strong> se aplica. <strong>En M.E.T.A.S:</strong> el mismo 2% da 1.560 sobre saldos y 2.880 sobre el monto.' },
  { y: '3', icon: '📅', label: 'El plazo', text: 'Los meses que dura la deuda. <strong>Se mide:</strong> en número de cuotas. <strong>Engaña:</strong> porque baja la cuota y por eso parece que abarata. <strong>En M.E.T.A.S:</strong> de 12 a 24 meses la cuota baja 500 y el total sube 1.440.' },
  { y: '4', icon: '🧾', label: 'La cuota', text: 'Capital <strong>más</strong> interés, cada mes. <strong>Se mide:</strong> en lempiras y con fecha de vencimiento. <strong>Engaña:</strong> porque es la cifra cómoda y la que se compara con el sueldo. <strong>En M.E.T.A.S:</strong> 1.240 el primer mes, y es un costo fijo nuevo.' },
  { y: '5', icon: '✂️', label: 'Comisiones y seguro', text: 'Lo que se descuenta <strong>antes</strong> de recibir. <strong>Se mide:</strong> sumando todo en lempiras, no en porcentajes sueltos. <strong>Engaña:</strong> porque no aparece en la cuota. <strong>En M.E.T.A.S:</strong> 600 de comisión, 400 de seguro y 250 de gastos.' },
  { y: '6', icon: '🧮', label: 'El costo total', text: 'Cuotas por meses, más gastos, <strong>menos lo que llegó</strong>. <strong>Se mide:</strong> en lempiras, una sola cifra. <strong>Engaña:</strong> cuando nadie la calcula porque nadie la pide. <strong>En M.E.T.A.S:</strong> 13.560 devueltos por 12.000 prestados.' },
  { y: '7', icon: '⏰', label: 'La mora', text: 'Lo que se cobra por pagar tarde. <strong>Se mide:</strong> recargo fijo más interés sobre lo vencido. <strong>Engaña:</strong> porque parece proporcional y crece más rápido que la deuda. <strong>En M.E.T.A.S:</strong> tres meses de atraso vuelven 3.720 en unos 4.570.' },
]);

B.parteData = JSON.stringify({
  capital: {
    nombre: 'El capital', icon: '💵',
    estructura: { title: 'Qué es', info: '• El dinero prestado, y solo <strong>el que llegó a la cuenta</strong><br>• Es la parte de la cuota que baja la deuda de verdad<br>• Lo demás que se paga cada mes es precio, no deuda' },
    funcion: { title: 'Cómo se calcula', info: '• Monto aprobado <strong>menos</strong> comisiones, seguro y gastos<br>• Se comprueba con el comprobante de depósito, no con la carta<br>• El saldo de capital es lo que queda por devolver en cualquier mes' },
    enfermedades: { title: 'Dónde engaña', info: '• Cuando se toma el monto aprobado como si fuera el recibido<br>• Cuando los intereses se calculan sobre el aprobado y no sobre el recibido<br>• Cuando se pide justo lo que hace falta y llega menos' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• Aprobado: <strong>20.000</strong><br>• Comisión 3%: <strong>600</strong> · Seguro: <strong>400</strong> · Gastos: <strong>250</strong><br>• Llega a la cuenta: <strong>18.750</strong><br>• Y los intereses corren sobre 20.000' },
  },
  tasa: {
    nombre: 'La tasa', icon: '📈',
    estructura: { title: 'Qué es', info: '• El precio de usar dinero ajeno durante un tiempo<br>• No es un abuso: es un precio, y como todo precio se compara<br>• Sola no dice nada: hace falta saber <strong>sobre qué se aplica</strong>' },
    funcion: { title: 'Cómo se calcula', info: '• <strong>Sobre saldos:</strong> el porcentaje del mes sobre lo que aún se debe<br>• <strong>Sobre el monto:</strong> el porcentaje siempre sobre el préstamo original<br>• Regla del doble: la plana cuesta casi el doble que la de saldos' },
    enfermedades: { title: 'Dónde engaña', info: '• En que la <strong>primera cuota es idéntica</strong> en las dos formas<br>• En las tasas mensuales, que suenan pequeñas y se multiplican por doce<br>• En el «cero interés», que se cobra por dentro del precio' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• 12.000 a doce meses al 2% mensual<br>• Sobre saldos: <strong>1.560</strong> de intereses<br>• Sobre el monto: <strong>2.880</strong><br>• Diferencia por no preguntar: <strong>1.320</strong>' },
  },
  plazo: {
    nombre: 'El plazo', icon: '📅',
    estructura: { title: 'Qué es', info: '• Los meses durante los que se debe<br>• Es la palanca que usa el que vende para hacer caber la cuota<br>• <strong>Reparte, no abarata:</strong> más meses son más meses de interés' },
    funcion: { title: 'Cómo se calcula', info: '• Se elige el <strong>plazo más corto que el mes aguante</strong><br>• Se comprueba con el total, no con la cuota<br>• Cada año extra tiene un precio que se puede decir en lempiras' },
    enfermedades: { title: 'Dónde engaña', info: '• Cuando se ofrece «bajar la cuota» sin decir cuánto sube el total<br>• Cuando la refinanciación se presenta como un favor<br>• Cuando el plazo dura más que la vida útil de lo que se compró' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• 12 meses: cuota <strong>1.240</strong> · total <strong>13.560</strong><br>• 24 meses: cuota <strong>740</strong> · total <strong>15.000</strong><br>• 36 meses: cuota <strong>573</strong> · total <strong>16.440</strong><br>• Cada año extra: <strong>1.440</strong> más' },
  },
  total: {
    nombre: 'El costo total', icon: '🧮',
    estructura: { title: 'Qué es', info: '• Todo lo que se devuelve, <strong>menos lo que se recibió</strong><br>• Es la única cifra que compara dos ofertas distintas<br>• Se dice en lempiras y en voz alta antes de firmar' },
    funcion: { title: 'Cómo se calcula', info: '• Cuota <strong>por</strong> número de cuotas<br>• <strong>Más</strong> comisiones, seguro y gastos<br>• <strong>Menos</strong> lo que llegó de verdad a la cuenta' },
    enfermedades: { title: 'Dónde engaña', info: '• Cuando nadie lo calcula porque nadie lo pide<br>• Cuando se compara con otra oferta usando la cuota en su lugar<br>• Cuando se olvida que la cuota es un costo fijo nuevo del mes' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• Devuelto: <strong>13.560</strong> por 12.000 prestados<br>• Fijos con la cuota dentro: <strong>1.990</strong> al mes<br>• Equilibrio: de <strong>8 aulas a 20</strong><br>• Aulas de hoy: <strong>6</strong>' },
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
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: se firma el total en lempiras y no la cuota; se pregunta siempre si el interés es sobre saldos o sobre el monto; se recuerda que el plazo reparte y no abarata; se anota la cuota como costo fijo y se rehace el punto de equilibrio antes de firmar; y solo se debe por algo que meta más de lo que el interés saca, con margen y no justo. Cuando la oferta es buena y hay prisa, la respuesta es siempre la misma: el total por escrito hoy y la firma mañana.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  /* la tarjeta de WhatsApp */
  [/🧾 \*Ruta del Poder · Etapa 2\* 🧾/g, '💳 *Ruta del Poder · Etapa 3* 💳'],
  [/A dónde se va el dinero y la hora: costo por unidad, margen y punto de equilibrio, con las ocho cuentas del proyecto\. 🧾/g,
   'Interés, plazo y costo total: cómo se lee una oferta de crédito antes de firmarla, con las ocho ofertas que le pueden tocar la puerta al proyecto. 💳'],
  [/_Incluye evaluación conceptual y la cuenta sobre la mesa\._ ✍️/g, '_Incluye evaluación conceptual y el contrato antes de firmar._ ✍️'],
  /* los rótulos de las dos pruebas */
  [/La cuenta sobre la mesa/g, 'El contrato antes de firmar'],
  [/la cuenta sobre la mesa/g, 'el contrato antes de firmar'],
  [/Ruta del Poder · Etapa 2: El presupuesto real/g, 'Ruta del Poder · Etapa 3: La deuda por dentro'],
  [/El presupuesto real/g, 'La deuda por dentro'],
  [/el presupuesto real/g, 'la deuda por dentro'],
  [/mapa del presupuesto/g, 'mapa de la deuda'],
  /* la cabecera de las pruebas impresas: esto no es un instituto */
  [/Autocapacitación Técnica/g, 'Etapa 3 · Poder Económico'],
  [/🧾 ¡/g, '💳 ¡'],
  /* la constancia decía la etapa equivocada ya en el molde */
  [/completó la Etapa 1 de la Ruta del Poder/g, 'completó la Etapa 3 de la Ruta del Poder'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La sección I se llamaba «la interpelación», que es palabra de la ruta
   política y aquí no significa nada: lo que hay sobre la mesa es una oferta.
   Y la comparación de la sección IV preguntaba por un cambio de funcionario,
   que venía de la misma ruta. Los dos rótulos vienen arrastrados en el molde
   desde hace varias misiones. */
src = src.replace(/Simulacro de Presión: la interpelación/g, 'La oferta sobre la mesa');
src = src.replace(/1\. ¿Qué gana cada caso y cuál aguanta un cambio de funcionario\? 2\. ¿Por qué no son el mismo caso\?/g,
  '1. ¿Cuánto cuesta cada caso en total y cuál deja al proyecto más libre el año que viene? 2. ¿Por qué no son la misma decisión?');

/* la pregunta de la sección III venía de otra misión y el reemplazo en bloque
   la dejó sin sentido: se escribe entera */
const preguntaIII = '¿Qué falta preguntar, cuánto se devuelve en total y con qué condición por escrito lo firmarías? Explica por qué tu salida es mejor que aceptar la cuota que te ofrecen o que rechazar de plano.';
src = src.replace(/¿La deuda por dentro, qué se pide a cambio y con qué condición por escrito aceptarías\? Explica por qué tu salida es mejor que aceptar completo o que rechazar de plano\./g, preguntaIII);

/* el desenlace de la simulación seguía narrando una oferta a 24 horas */
const antesSim = /function resolveMethod\(conInternet\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(conInternet){sfx(conInternet?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(conInternet){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🧮</span><span class="ms-text"><strong>Pediste los dos totales:</strong> 13.560 a doce meses y 15.000 a veinticuatro. La conversación pasa de la cuota al precio del dinero.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📄</span><span class="ms-text"><strong>Y ahora decides tú:</strong> si los 500 al mes de alivio valen 1.440 lempiras, se firma el plazo largo a propósito. Si no, se firma el corto y se acabó.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">✍️</span><span class="ms-text"><strong>Firmaste por la cuota:</strong> cabía en el mes, y esa fue toda la cuenta que se hizo.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🕰️</span><span class="ms-text"><strong>Y el total llega igual:</strong> 1.440 lempiras más y doce meses más atado. No fue un engaño: fue una decisión tomada con la única cifra que te enseñaron.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='fijos',labAspecto='estructura';/, "let labParte='capital',labAspecto='estructura';");

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
