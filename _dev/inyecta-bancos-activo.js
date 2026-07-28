/* Inyecta los bancos de la misión «Del salario al activo» (Ruta del Poder,
   etapa 4) sobre el molde copiado de la etapa 3, y de paso cambia los rótulos
   que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-activo.js

   La etapa 1 separó activos de pasivos, la 2 puso el presupuesto y la 3 enseñó
   lo que cuesta el dinero prestado. Esta contesta de dónde sale el dinero
   cuando no se puede dar una clase más: la escalera de cuatro escalones (hora,
   paquete, producto, sistema), los tres disfraces del empleo y la prueba que
   no admite discusión, que es si el ingreso cobra cuando tú no estás.        */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-poder-activo', 'js', 'activo.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260803;
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

B.SAVE_KEY = `'faro_eco_activo_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del activo superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del activo explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de ingresos experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del activo maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del activo' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 4 de la Ruta del Poder completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Vende horas y no lo sabe ⏳' },
  { t: 25, n: 'Cuenta lo que entra sin trabajar 📓' },
  { t: 55, n: 'Guarda el material de cada taller 🧱' },
  { t: 90, n: 'Arma su primer paquete 📦' },
  { t: 130, n: 'Termina lo que se vende dos veces 📕' },
  { t: 165, n: 'Cuenta el mantenimiento en horas 🔧' },
  { t: 200, n: 'Pregunta a nombre de quién queda 📜' },
]);

B.fcData = JSON.stringify([
  { w: 'Un activo', a: '🌱 Algo que <strong>sigue produciendo cuando tú no estás delante</strong>. La prueba no admite discusión: si el ingreso se para cuando tú te paras, es un empleo aunque sea tuyo.' },
  { w: 'La señal de alarma', a: '🚨 <strong>Cuando descansar cuesta dinero.</strong> Si una semana de enfermedad significa cero ingresos, todo lo construido sigue siendo empleo.' },
  { w: 'La medida de la libertad', a: '🏖️ No se mide en dinero: <strong>se mide en semanas que puedes faltar</strong> sin que se caiga lo que entra.' },
  { w: 'Escalón 1: la hora', a: '⏳ Das el taller y cobras. Se acabó al terminar. No es malo: <strong>es donde empieza todo</strong> y lo que paga las cuentas mientras se construye lo demás.' },
  { w: 'Escalón 2: el paquete', a: '📦 El mismo trabajo con material listo, guía y precio cerrado. Sigue pidiendo tu presencia, pero <strong>prepararlo ya no cuesta nada</strong> porque el molde existe.' },
  { w: 'Escalón 3: el producto', a: '📕 Se hace una vez y se vende muchas: el cuaderno impreso, el material descargable. <strong>Este sí cobra el mes que estés enfermo.</strong>' },
  { w: 'Escalón 4: el sistema', a: '⚙️ La licencia anual, la suscripción de un centro. <strong>Cobra sin que nadie haga nada ese mes</strong>, y es el final de los otros tres, no el principio.' },
  { w: 'El molde', a: '🧱 Lo que se hace <strong>una vez</strong> para no volver a hacerlo: la guía, las hojas preparadas, el archivo que se copia. Sin molde no se sube ningún escalón.' },
  { w: 'El empleo con un solo jefe', a: '🎭 La asesoría mensual ilimitada. Parece ingreso fijo y es <strong>un empleo sin prestaciones y sin horario</strong>, que crece hasta ocupar todo el mes.' },
  { w: 'El producto que se atiende', a: '🕵️ Se cobró como producto y cuesta como empleo: cada copia trae dudas. Empeora con el éxito, porque <strong>vender más es trabajar más</strong>.' },
  { w: 'El activo de otro', a: '📜 Lo que produce dinero todos los años, <strong>para quien tiene el papel</strong>. La pregunta que lo descubre no es cuánto deja, sino a nombre de quién queda.' },
  { w: 'El mantenimiento', a: '🔧 Lo que pide un activo para seguir vivo, <strong>contado en horas al mes</strong>. Si pide más de lo que deja, es una afición cara. Y el que no pide nada está muerto.' },
  { w: 'El relevo', a: '🤝 Qué pasa con esto si te enfermas un mes. Si la respuesta es «se para», entonces <strong>el activo eres tú</strong>, que es lo que esta etapa viene a cambiar.' },
  { w: 'La puerta', a: '🚪 Lo que se regala para traer gente a lo que sí cobra. Una ficha gratis no se juzga por lo que deja, sino por <strong>cuántas personas trae</strong>.' },
  { w: 'Construir con el sueldo', a: '💼 El activo se construye <strong>con el sueldo, no en lugar del sueldo</strong>. No se deja el empleo: se le quitan horas al ocio, no a la comida.' },
  { w: 'Dos horas semanales', a: '📆 La cuenta que ordena la etapa: con dos horas por semana, un cuaderno de ochenta páginas <strong>se termina en un año</strong>. Lo que no se puede es que esa columna sea cero.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué distingue a un activo de un empleo?', o: ['a) Que deja más dinero', 'b) Que sigue produciendo cuando no estás', 'c) Que es tuyo', 'd) Que no tiene jefe'], c: 1 },
  { q: 'La señal de alarma de esta etapa es…', o: ['a) Cobrar poco', 'b) Trabajar de noche', 'c) Que descansar cueste dinero', 'd) No tener contrato'], c: 2 },
  { q: 'La libertad de esta etapa se mide en…', o: ['a) Lempiras al mes', 'b) Semanas que puedes faltar', 'c) Número de clientes', 'd) Horas trabajadas'], c: 1 },
  { q: 'Los cuatro escalones, en orden, son…', o: ['a) Hora, paquete, producto, sistema', 'b) Producto, hora, sistema, paquete', 'c) Sistema, producto, paquete, hora', 'd) Paquete, hora, producto, sistema'], c: 0 },
  { q: 'Una asesoría mensual ilimitada es…', o: ['a) Un producto', 'b) Un sistema', 'c) Un empleo con un solo jefe', 'd) Un activo pequeño'], c: 2 },
  { q: 'Un curso grabado que exige contestar dudas cada semana…', o: ['a) Es un producto normal', 'b) Se cobró como producto y cuesta como empleo', 'c) Es un sistema', 'd) No tiene arreglo'], c: 1 },
  { q: 'La pregunta que descubre el activo de otro es…', o: ['a) ¿Cuánto deja?', 'b) ¿Cuánto cuesta hacerlo?', 'c) ¿A nombre de quién queda?', 'd) ¿Cuándo se cobra?'], c: 2 },
  { q: 'Un activo que no pide ningún mantenimiento…', o: ['a) Es el mejor de todos', 'b) Probablemente ya está muerto', 'c) Es un sistema', 'd) No existe en papel'], c: 1 },
  { q: 'El activo se construye…', o: ['a) Dejando el empleo', 'b) Con el sueldo, sin dejar el empleo', 'c) Pidiendo un préstamo', 'd) Buscando un socio'], c: 1 },
  { q: 'Una ficha regalada sin código ni contacto es…', o: ['a) Una puerta', 'b) Un producto gratis', 'c) Trabajo regalado', 'd) Un activo pequeño'], c: 2 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Activo', 'Empleo'], headA: '🌱 Activo', headB: '⏳ Empleo', colA: 'ok', colB: 'no',
    words: [
      { w: 'El cuaderno impreso que se vende solo', t: 'ok' }, { w: 'La licencia anual de la aplicación', t: 'ok' },
      { w: 'El material descargable ya terminado', t: 'ok' }, { w: 'El curso grabado sin atención semanal', t: 'ok' },
      { w: 'El taller presencial de tres horas', t: 'no' }, { w: 'La asesoría mensual ilimitada', t: 'no' },
      { w: 'La clase particular del sábado', t: 'no' }, { w: 'La corrección de exámenes por encargo', t: 'no' },
    ],
  },
  {
    label: ['Sube escalón', 'Se queda igual'], headA: '🪜 Sube', headB: '🔁 Igual', colA: 'ok', colB: 'no',
    words: [
      { w: 'Guardar el material de cada taller', t: 'ok' }, { w: 'Escribir la guía del facilitador', t: 'ok' },
      { w: 'Grabar el taller una vez', t: 'ok' }, { w: 'Convertir las dudas repetidas en una hoja', t: 'ok' },
      { w: 'Dar el mismo taller otra vez', t: 'no' }, { w: 'Subir el precio por hora', t: 'no' },
      { w: 'Aceptar dos centros más', t: 'no' }, { w: 'Trabajar también los domingos', t: 'no' },
    ],
  },
  {
    label: ['Tuyo', 'De otro'], headA: '📜 Tuyo', headB: '🏢 De otro', colA: 'ok', colB: 'no',
    words: [
      { w: 'El cuaderno con tu nombre impreso dentro', t: 'ok' }, { w: 'La aplicación en tu repositorio', t: 'ok' },
      { w: 'La lista de correos de las maestras', t: 'ok' }, { w: 'La guía que dice quién la escribió', t: 'ok' },
      { w: 'El material cuya autoría cede el contrato', t: 'no' }, { w: 'El curso alojado en la plataforma del centro', t: 'no' },
      { w: 'Las fichas publicadas solo en una red social', t: 'no' }, { w: 'El texto entregado sin firma a una editorial', t: 'no' },
    ],
  },
  {
    label: ['Mantenimiento en horas', 'Trabajo cada semana'], headA: '🔧 Horas al año', headB: '🪤 Cada semana', colA: 'ok', colB: 'no',
    words: [
      { w: 'Corregir erratas del cuaderno', t: 'ok' }, { w: 'Actualizar la guía cuando cambia el currículo', t: 'ok' },
      { w: 'Hacer copias de seguridad', t: 'ok' }, { w: 'Reimprimir un lote', t: 'ok' },
      { w: 'Contestar las dudas de cada comprador', t: 'no' }, { w: 'Estar disponible para lo que haga falta', t: 'no' },
      { w: 'Preparar el material de cada sesión desde cero', t: 'no' }, { w: 'Ir al centro cada vez que llaman', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['Un', 'activo', 'produce', 'cuando', 'tú', 'no', 'estás.'], c: 1, art: 'Lo que sigue cobrando sin ti' },
  { s: ['El', 'molde', 'se', 'hace', 'una', 'vez.'], c: 1, art: 'Lo que evita volver a empezar' },
  { s: ['La', 'hora', 'vendida', 'se', 'acaba', 'al', 'terminar.'], c: 1, art: 'El primer escalón' },
  { s: ['El', 'producto', 'se', 'vende', 'muchas', 'veces.'], c: 1, art: 'El tercer escalón' },
  { s: ['El', 'sistema', 'cobra', 'sin', 'que', 'nadie', 'trabaje.'], c: 1, art: 'El cuarto escalón' },
  { s: ['Todo', 'activo', 'pide', 'mantenimiento', 'en', 'horas.'], c: 3, art: 'Lo que cuesta seguir vivo' },
  { s: ['La', 'propiedad', 'decide', 'de', 'quién', 'es', 'lo', 'que', 'produce.'], c: 1, art: 'A nombre de quién queda' },
  { s: ['El', 'relevo', 'contesta', 'qué', 'pasa', 'si', 'te', 'enfermas.'], c: 1, art: 'La pieza que casi nadie prepara' },
]);

B.cmpData = JSON.stringify([
  { s: 'Si se para cuando tú te paras, es un ___.', opts: ['empleo', 'activo', 'negocio'], c: 0 },
  { s: 'La señal de alarma es que descansar cueste ___.', opts: ['dinero', 'tiempo', 'salud'], c: 0 },
  { s: 'La libertad se mide en ___ que puedes faltar.', opts: ['semanas', 'lempiras', 'clientes'], c: 0 },
  { s: 'El primer escalón es la ___ vendida.', opts: ['hora', 'idea', 'ficha'], c: 0 },
  { s: 'El ___ se hace una vez y se vende muchas.', opts: ['producto', 'taller', 'servicio'], c: 0 },
  { s: 'Todo activo pide ___ para seguir vivo.', opts: ['mantenimiento', 'publicidad', 'permiso'], c: 0 },
  { s: 'La pregunta final es a nombre de ___ queda.', opts: ['quién', 'cuánto', 'cuándo'], c: 0 },
  { s: 'El activo se construye con el ___, no en lugar del sueldo.', opts: ['sueldo', 'préstamo', 'ahorro'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Activo', 'Empleo'], btnA: '🌱 Activo', btnB: '⏳ Empleo', colA: 'ok', colB: 'no',
    words: [
      { w: 'El cuaderno impreso terminado', t: 'ok' }, { w: 'La licencia anual por centro', t: 'ok' },
      { w: 'El material descargable', t: 'ok' }, { w: 'El curso grabado sin atención', t: 'ok' },
      { w: 'El taller presencial', t: 'no' }, { w: 'La asesoría ilimitada', t: 'no' },
      { w: 'La clase particular', t: 'no' }, { w: 'Corregir exámenes por encargo', t: 'no' },
    ],
  },
  {
    label: ['Sube escalón', 'Se queda igual'], btnA: '🪜 Sube', btnB: '🔁 Igual', colA: 'ok', colB: 'no',
    words: [
      { w: 'Guardar el material con fecha', t: 'ok' }, { w: 'Escribir la guía', t: 'ok' },
      { w: 'Grabar el taller una vez', t: 'ok' }, { w: 'Hacer hoja de dudas frecuentes', t: 'ok' },
      { w: 'Dar el taller otra vez', t: 'no' }, { w: 'Subir el precio por hora', t: 'no' },
      { w: 'Aceptar dos centros más', t: 'no' }, { w: 'Trabajar los domingos', t: 'no' },
    ],
  },
  {
    label: ['Tuyo', 'De otro'], btnA: '📜 Tuyo', btnB: '🏢 De otro', colA: 'ok', colB: 'no',
    words: [
      { w: 'Cuaderno con tu nombre dentro', t: 'ok' }, { w: 'La aplicación en tu repositorio', t: 'ok' },
      { w: 'La lista de correos', t: 'ok' }, { w: 'La guía firmada', t: 'ok' },
      { w: 'Material con autoría cedida', t: 'no' }, { w: 'Curso en la plataforma del centro', t: 'no' },
      { w: 'Fichas solo en una red social', t: 'no' }, { w: 'Texto entregado sin firma', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se sube de la hora al producto', steps: ['Dar el taller y guardar el material en una carpeta con fecha', 'A la quinta vez, armar el paquete con guía y precio cerrado', 'Cobrar el paquete más caro sin trabajar más', 'Usar las horas que sobran para escribir el producto', 'Terminarlo aunque no pague nada ese mes', 'Ponerle nombre, fecha y autoría antes de enseñarlo'] },
  { label: 'Cómo se decide si algo vale la pena', steps: ['Escribir en qué escalón está hoy', 'Preguntar si cobra estando dos semanas fuera', 'Contar cuántas horas al mes pide de mantenimiento', 'Comprobar a nombre de quién queda y dónde está escrito', 'Comparar las horas que pide con el dinero que deja'] },
  { label: 'Cómo se arregla un producto que se atiende', steps: ['Anotar durante un mes todas las dudas que llegan', 'Separar las que se repiten de las que no', 'Convertir las repetidas en material añadido', 'Cobrar las que no se repiten como asesoría', 'Volver a contar las horas al mes siguiente'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Lo que se hace una vez para no volver a hacerlo', ans: 'El molde', opts: ['El molde', 'La copia', 'El cobro', 'El relevo'] },
  { desc: 'Que se pueda entregar otra vez sin volver a fabricarlo', ans: 'La copia', opts: ['La copia', 'El molde', 'El mantenimiento', 'La propiedad'] },
  { desc: 'Que alguien pague por ello y por dónde se paga', ans: 'El cobro', opts: ['El cobro', 'La copia', 'El relevo', 'El molde'] },
  { desc: 'Qué pasa con esto si te enfermas un mes', ans: 'El relevo', opts: ['El relevo', 'El cobro', 'El molde', 'La copia'] },
  { desc: 'Las horas al mes que pide para seguir vivo', ans: 'El mantenimiento', opts: ['El mantenimiento', 'El molde', 'El cobro', 'La copia'] },
  { desc: 'A nombre de quién queda lo que produce', ans: 'La propiedad', opts: ['La propiedad', 'El relevo', 'El cobro', 'El molde'] },
  { desc: 'Lo que se regala para traer gente a lo que sí cobra', ans: 'La puerta', opts: ['La puerta', 'El molde', 'La copia', 'El relevo'] },
  { desc: 'El escalón donde el ingreso cobra sin que nadie trabaje ese mes', ans: 'El sistema', opts: ['El sistema', 'El producto', 'El paquete', 'La hora'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Dar el mismo taller de tres horas por quinta vez', func: 'Guardar el material y armar el paquete con guía', opts: ['Guardar el material y armar el paquete con guía', 'Subir el precio por hora', 'Aceptar dos centros más', 'Dar el taller también los domingos'] },
  { trans: 'El paquete ya está armado y se vende bien', func: 'Grabarlo una vez y escribir la guía para que lo dé otro', opts: ['Grabarlo una vez y escribir la guía para que lo dé otro', 'Hacer un paquete más grande', 'Cobrar por adelantado', 'Buscar más centros'] },
  { trans: 'El curso grabado trae dudas por mensaje cada semana', func: 'Convertir las dudas repetidas en material añadido', opts: ['Convertir las dudas repetidas en material añadido', 'Dejar de contestar', 'Subir el precio del curso', 'Contratar a alguien que conteste'] },
  { trans: 'Un centro quiere el material y que quede a su nombre', func: 'Ofrecer licencia de uso ilimitada dentro del centro', opts: ['Ofrecer licencia de uso ilimitada dentro del centro', 'Aceptar, porque pagan bien', 'Rechazar el trato entero', 'Pedir el doble de dinero'] },
  { trans: 'La asesoría mensual ocupa cada vez más horas', func: 'Ponerle número: cuatro horas al mes y lo demás aparte', opts: ['Ponerle número: cuatro horas al mes y lo demás aparte', 'Subir la cuota mensual', 'Dejar de contestar rápido', 'Cancelar el acuerdo'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Se enfermó dos semanas y ese mes no entró nada', characteristic: 'Todo el ingreso estaba en el primer escalón: horas vendidas', opts: ['Todo el ingreso estaba en el primer escalón: horas vendidas', 'Cobraba muy poco por hora', 'No tenía ahorros', 'Los centros no pagaron'] },
  { disease: 'Cuanto más vendía el curso, menos tiempo libre tenía', characteristic: 'Se cobró como producto y cuesta como empleo: cada copia trae atención', opts: ['Se cobró como producto y cuesta como empleo: cada copia trae atención', 'El curso era muy largo', 'El precio estaba mal', 'Faltaba publicidad'] },
  { disease: 'El material que hizo genera dinero cada año y él no ve un lempiral', characteristic: 'La autoría quedó a nombre del centro y nadie leyó esa línea', opts: ['La autoría quedó a nombre del centro y nadie leyó esa línea', 'El centro no cumplió', 'El material no era bueno', 'Cobró demasiado poco'] },
  { disease: 'El cuaderno lleva cuatro meses al ochenta por ciento', characteristic: 'Nunca es urgente, porque no paga hoy y el taller sí', opts: ['Nunca es urgente, porque no paga hoy y el taller sí', 'Le falta imprenta', 'No sabe qué poner', 'Nadie se lo pide'] },
  { disease: 'La asesoría mensual acabó ocupando tres tardes por semana', characteristic: 'Se vendió sin número de horas, así que creció hasta llenar el mes', opts: ['Se vendió sin número de horas, así que creció hasta llenar el mes', 'El centro abusó', 'Cobraba poco', 'No sabía decir que no'] },
  { disease: 'La aplicación deja poco y pide arreglos cada semana', characteristic: 'El mantenimiento pide más horas de las que el ingreso deja', opts: ['El mantenimiento pide más horas de las que el ingreso deja', 'Está mal programada', 'Los centros no la usan', 'El precio es bajo'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Sigue produciendo cuando tú no estás delante.', type: 'Un activo' },
  { s: 'Se para el mes que te enfermas.', type: 'Un empleo' },
  { s: 'Das el taller y cobras ese día.', type: 'La hora vendida' },
  { s: 'El mismo taller con material listo, guía y precio cerrado.', type: 'El paquete' },
  { s: 'Se hace una vez y se vende muchas.', type: 'El producto' },
  { s: 'Cobra cada año sin que nadie haga nada ese mes.', type: 'El sistema' },
  { s: 'Las horas al mes que pide para seguir vivo.', type: 'El mantenimiento' },
  { s: 'A nombre de quién queda lo que produce.', type: 'La propiedad' },
  { s: 'Ingreso fijo a cambio de tiempo indefinido.', type: 'El empleo con un solo jefe' },
  { s: 'Se regala para traer gente a lo que sí cobra.', type: 'La puerta' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'El taller presencial de tres horas', gen: 'Escalón', n: 'Se acaba al terminar', g: 'La hora', t: 'Paga las cuentas mientras se construye' },
  { w: 'La licencia anual por centro', gen: 'Escalón', n: 'Cobra sin ti', g: 'El sistema', t: 'Es el final de los otros tres' },
  { w: 'Guardar el material con fecha', gen: 'Movimiento', n: 'Construye molde', g: 'Sube escalón', t: 'A la quinta vez hay un paquete' },
  { w: 'Subir el precio por hora', gen: 'Movimiento', n: 'Sigue siendo hora', g: 'Se queda igual', t: 'Mejor pagado, igual de atado' },
  { w: 'El cuaderno con tu nombre impreso dentro', gen: 'Propiedad', n: 'Queda contigo', g: 'Tuyo', t: 'Produce para ti cada año' },
  { w: 'El material con la autoría cedida', gen: 'Propiedad', n: 'Queda con otro', g: 'De otro', t: 'Produce, pero no para ti' },
  { w: 'Corregir erratas una vez al año', gen: 'Costo', n: 'Horas al año', g: 'Mantenimiento sano', t: 'Se puede presupuestar' },
  { w: 'Contestar las dudas de cada comprador', gen: 'Costo', n: 'Horas cada semana', g: 'Empleo disfrazado', t: 'Empeora al vender más' },
  { w: 'La ficha gratis con código y teléfono', gen: 'Función', n: 'No cobra', g: 'Puerta', t: 'Se mide en gente que trae' },
  { w: 'La ficha gratis sin nombre ni contacto', gen: 'Función', n: 'No cobra ni trae', g: 'Trabajo regalado', t: 'No sirve para nada' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Si se para cuando tú te paras, es un ___.', opts: ['empleo', 'activo', 'negocio'], ans: 'empleo' },
  { s: 'La señal de alarma es que descansar cueste ___.', opts: ['dinero', 'tiempo', 'salud'], ans: 'dinero' },
  { s: 'La libertad se mide en ___ que puedes faltar.', opts: ['semanas', 'lempiras', 'clientes'], ans: 'semanas' },
  { s: 'El primer escalón es la ___ vendida.', opts: ['hora', 'idea', 'ficha'], ans: 'hora' },
  { s: 'El ___ se hace una vez y se vende muchas.', opts: ['producto', 'taller', 'servicio'], ans: 'producto' },
  { s: 'Todo activo pide ___ para seguir vivo.', opts: ['mantenimiento', 'publicidad', 'permiso'], ans: 'mantenimiento' },
  { s: 'La pregunta final es a nombre de ___ queda.', opts: ['quien', 'cuanto', 'cuando'], ans: 'quien' },
  { s: 'El activo se construye con el ___, no en lugar del sueldo.', opts: ['sueldo', 'prestamo', 'ahorro'], ans: 'sueldo' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica qué es un activo y cuál es la prueba que lo distingue de un empleo.', ans: 'Un activo es algo que sigue produciendo cuando tú no estás delante. La prueba es cruda y no admite discusión: si el ingreso se para cuando tú te paras, no es un activo, es un empleo aunque sea tuyo. Trabajar por cuenta propia no cambia nada de eso; solo cambia quién es el jefe, que a veces es peor, porque no tiene horario ni vacaciones. La manera práctica de comprobarlo es preguntarse cuánto entró el mes que menos se trabajó, y ese número, y no el total del año, es el que mide esta etapa. Por eso la señal de alarma es que descansar cueste dinero: si una semana de enfermedad significa cero ingresos, todo lo construido sigue siendo empleo, por bien que se cobre la hora.' },
  { q: 'Di cuáles son los cuatro escalones y cómo se sube de uno al siguiente.', ans: 'La hora vendida, el paquete, el producto y el sistema. La hora es dar el taller y cobrar ese día: se acaba al terminar. El paquete es el mismo taller con el material listo, la guía y un precio cerrado; sigue pidiendo tu presencia, pero prepararlo ya no cuesta nada porque el molde existe, y además permite cobrar más sin trabajar más. El producto se hace una vez y se vende muchas, y es el primero que cobra el mes que estés enfermo. El sistema es la licencia o la suscripción, que cobra sin que nadie haga nada ese mes. No se salta ninguno: se sube con lo que ya se está haciendo. Cada vez que se da un taller se guarda el material, y a la quinta vez hay un paquete armado sin haber dedicado una sola hora extra a fabricarlo.' },
  { q: '¿Cuáles son los tres disfraces del empleo y cómo se reconocen?', ans: 'El primero es la asesoría mensual ilimitada: parece un ingreso fijo y es un empleo sin prestaciones ni horario, con el agravante de que, al no haber horas contadas, crece hasta ocupar todo el mes sin que nadie lo decida. El segundo es el producto que se atiende: un curso grabado que exige contestar dudas cada semana se cobró como producto y cuesta como empleo, y empeora con el éxito, porque vender más significa trabajar más. El tercero es lo que produce y no es tuyo: el material hecho para un centro que se queda con la autoría produce dinero todos los años, pero para quien tiene el papel. Los tres se descubren con la misma pregunta: cuánto trabajo pide este ingreso el mes que viene. Si la respuesta es «el mismo de siempre», no subió ningún escalón.' },
  { q: 'Explica por qué el mantenimiento decide si algo es un activo o una afición cara.', ans: 'Porque todo activo pide algo para seguir vivo: un cuaderno impreso pide reimprimir y corregir erratas, una aplicación pide arreglos y copias de seguridad, un curso grabado pide actualizarse cuando cambia el currículo. Lo que no pide nada es que ya está muerto y todavía no se ha notado. La cuenta honesta se hace en horas, no en ganas: cuántas horas al mes pide para seguir funcionando. Si pide más horas de las que deja en dinero, entonces no es un activo, es una afición cara con nombre de negocio, y conviene saberlo antes de meterle otro año. Y hay un caso especialmente traicionero, que es el mantenimiento que crece con las ventas: ese no se arregla trabajando más, se arregla convirtiendo lo repetido en material.' },
  { q: '¿Por qué la pregunta final no es cuánto deja sino a nombre de quién queda?', ans: 'Porque un ingreso se cobra una vez y una propiedad produce durante años. El material hecho para un centro que se queda con la autoría es un activo perfectamente sano: sencillamente es el activo del centro. Tú cobraste las horas, que es lo que se te pagó, y lo que sigue produciendo cada curso ya no te pertenece. La pregunta se hace antes de firmar y no después, porque después ya está escrita en una línea que nadie leyó. Y casi siempre tiene una salida buena para los dos: «el material es mío y ustedes tienen licencia de uso ilimitada dentro del centro». Cuesta lo mismo para ellos y resuelve su necesidad entera, porque lo que querían era usarlo, no venderlo.' },
  { q: 'Explica por qué el activo se construye con el sueldo y no en lugar del sueldo.', ans: 'Porque el activo tarda en producir y las cuentas no esperan. Dejar el empleo para construirlo pone al proyecto en la peor situación posible: hay que cobrar rápido, y cobrar rápido significa vender horas, que es exactamente el escalón del que se quería salir. El sueldo, en cambio, compra la única cosa que hace falta para subir de escalón, que es tiempo sin urgencia. La cuenta que ordena la etapa es sencilla: con dos horas semanales, un cuaderno de ochenta páginas se termina en un año. No hacen falta muchas horas; hace falta que esa columna no sea cero ninguna semana. El seguimiento honesto es apuntar cada semana cuántas horas fueron a vender tiempo y cuántas a construir molde, y la primera semana el reparto asusta.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['ACTIVO', 'EMPLEO', 'MOLDE', 'ESCALON', 'HORA', 'COBRO']),
  haceSopa(10, ['PRODUCTO', 'SISTEMA', 'PAQUETE', 'RELEVO', 'COPIA', 'SUELDO']),
  haceSopa(10, ['LICENCIA', 'AUTORIA', 'PUERTA', 'GUIA', 'FICHA', 'TALLER']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Un activo sigue produciendo cuando tú no estás delante.', a: true },
  { q: 'Trabajar por cuenta propia ya convierte un ingreso en activo.', a: false },
  { q: 'La señal de alarma es que descansar cueste dinero.', a: true },
  { q: 'La libertad de esta etapa se mide en semanas que puedes faltar.', a: true },
  { q: 'Se puede saltar del primer escalón al cuarto sin pasar por los otros.', a: false },
  { q: 'El paquete permite cobrar más sin trabajar más.', a: true },
  { q: 'Una asesoría mensual ilimitada es un activo pequeño.', a: false },
  { q: 'Un curso que exige contestar dudas cada semana empeora al vender más.', a: true },
  { q: 'Lo que importa de un ingreso es solo cuánto deja.', a: false },
  { q: 'Un activo que no pide ningún mantenimiento probablemente está muerto.', a: true },
  { q: 'El mantenimiento se cuenta en horas al mes.', a: true },
  { q: 'Conviene dejar el empleo para poder construir el activo.', a: false },
  { q: 'Una ficha gratis se juzga por cuánta gente trae, no por lo que deja.', a: true },
  { q: 'Guardar el material de cada taller sube un escalón sin horas extra.', a: true },
  { q: 'La autoría cedida en una línea del contrato se puede revisar después.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: 'La prueba que distingue un activo de un empleo es…', o: ['a) Cuánto deja al mes', 'b) Si cobra cuando no estás', 'c) Si tiene contrato', 'd) Si es legal'], a: 1 },
  { q: 'La señal de alarma de esta etapa es…', o: ['a) Cobrar tarde', 'b) Tener un solo cliente', 'c) Que descansar cueste dinero', 'd) Trabajar de noche'], a: 2 },
  { q: 'El segundo escalón es…', o: ['a) El producto', 'b) El paquete', 'c) El sistema', 'd) La hora'], a: 1 },
  { q: 'El primer escalón que cobra estando enfermo es…', o: ['a) La hora', 'b) El paquete', 'c) El producto', 'd) Ninguno'], a: 2 },
  { q: 'Guardar el material de cada taller sirve para…', o: ['a) Ordenar la computadora', 'b) Tener el molde del paquete', 'c) Cobrar más por hora', 'd) Justificar el precio'], a: 1 },
  { q: 'La asesoría mensual ilimitada se arregla…', o: ['a) Subiendo la cuota', 'b) Poniéndole número de horas', 'c) Contestando más despacio', 'd) Cancelándola'], a: 1 },
  { q: 'Un curso que trae dudas cada semana se arregla…', o: ['a) Dejando de contestar', 'b) Convirtiendo las dudas repetidas en material', 'c) Subiendo el precio', 'd) Vendiendo menos'], a: 1 },
  { q: 'La pregunta que descubre el activo de otro es…', o: ['a) ¿Cuánto pagan?', 'b) ¿Cuándo pagan?', 'c) ¿A nombre de quién queda?', 'd) ¿Quién lo usa?'], a: 2 },
  { q: 'La contraoferta al centro que pide la autoría es…', o: ['a) Cobrar el doble', 'b) Licencia de uso ilimitada dentro del centro', 'c) Rechazar el trato', 'd) Firmar por dos años'], a: 1 },
  { q: 'El mantenimiento se mide en…', o: ['a) Lempiras al año', 'b) Horas al mes', 'c) Número de clientes', 'd) Ganas de seguir'], a: 1 },
  { q: 'Si el mantenimiento pide más horas de las que deja, eso es…', o: ['a) Un activo joven', 'b) Una afición cara', 'c) Un sistema', 'd) Un producto normal'], a: 1 },
  { q: 'El activo se construye…', o: ['a) Dejando el empleo', 'b) Con el sueldo', 'c) Con un préstamo', 'd) Buscando socio'], a: 1 },
  { q: 'Con dos horas semanales, un cuaderno de ochenta páginas se termina en…', o: ['a) Un mes', 'b) Tres meses', 'c) Un año', 'd) Cinco años'], a: 2 },
  { q: 'Una ficha gratis sin código ni contacto es…', o: ['a) Una puerta', 'b) Trabajo regalado', 'c) Un producto', 'd) Publicidad'], a: 1 },
  { q: 'El relevo contesta…', o: ['a) Quién cobra', 'b) Qué pasa si te enfermas un mes', 'c) Cuánto cuesta', 'd) Dónde se vende'], a: 1 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Si se para cuando tú te paras, es un ___.', a: 'empleo' },
  { q: 'La señal de alarma es que descansar cueste ___.', a: 'dinero' },
  { q: 'La libertad se mide en ___ que puedes faltar.', a: 'semanas' },
  { q: 'El primer escalón es la ___ vendida.', a: 'hora' },
  { q: 'El segundo escalón es el ___.', a: 'paquete' },
  { q: 'El ___ se hace una vez y se vende muchas.', a: 'producto' },
  { q: 'El cuarto escalón es el ___.', a: 'sistema' },
  { q: 'Lo que se hace una vez para no repetirlo es el ___.', a: 'molde' },
  { q: 'Todo activo pide ___ para seguir vivo.', a: 'mantenimiento' },
  { q: 'El mantenimiento se cuenta en ___ al mes.', a: 'horas' },
  { q: 'La pregunta final es a nombre de ___ queda.', a: 'quien' },
  { q: 'El ___ contesta qué pasa si te enfermas un mes.', a: 'relevo' },
  { q: 'El activo se construye con el ___.', a: 'sueldo' },
  { q: 'Lo que se regala para traer gente es una ___.', a: 'puerta' },
  { q: 'La asesoría ilimitada es un empleo con un solo ___.', a: 'jefe' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Activo', def: 'Sigue produciendo cuando no estás delante' },
  { term: 'Empleo', def: 'Se para el mes que tú te paras' },
  { term: 'La hora vendida', def: 'Se cobra el día que se da y se acaba' },
  { term: 'El paquete', def: 'El mismo trabajo con molde, guía y precio cerrado' },
  { term: 'El producto', def: 'Se hace una vez y se vende muchas' },
  { term: 'El sistema', def: 'Cobra sin que nadie trabaje ese mes' },
  { term: 'El molde', def: 'Lo que se hace una vez para no repetirlo' },
  { term: 'El mantenimiento', def: 'Las horas al mes que pide para seguir vivo' },
  { term: 'La propiedad', def: 'A nombre de quién queda lo que produce' },
  { term: 'El relevo', def: 'Qué pasa si te enfermas un mes' },
  { term: 'La puerta', def: 'Lo gratis que trae gente a lo que cobra' },
  { term: 'El empleo con un solo jefe', def: 'Ingreso fijo por tiempo indefinido' },
  { term: 'El producto que se atiende', def: 'Se cobró como producto y cuesta como empleo' },
  { term: 'El activo de otro', def: 'Produce cada año para quien tiene el papel' },
  { term: 'La señal de alarma', def: 'Que descansar cueste dinero' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'El taller presencial de tres horas: 1.500 lempiras por sesión. Es lo que más rápido se cobra y lo que más dinero deja hoy.' },
  { txt: 'El mismo taller en paquete, con las hojas listas, la guía del facilitador y un precio cerrado por centro.' },
  { txt: 'El cuaderno impreso de fichas: ochenta páginas, se vende por centro o por maestra, y lleva cuatro meses al ochenta por ciento.' },
  { txt: 'La licencia anual de la aplicación por centro: pagan una vez al año y sus maestras la usan todo el curso.' },
  { txt: 'Una asesoría mensual «ilimitada» a un centro: cantidad fija cada mes y disponibilidad para lo que haga falta.' },
  { txt: 'Un curso grabado que se vendió como producto, y cada compra trae dudas por mensaje durante semanas.' },
  { txt: 'Un centro paga bien y por adelantado por un material, y el contrato dice en una línea que la autoría queda a su nombre.' },
  { txt: 'Una ficha suelta buena, gratis y descargable por cualquiera. No deja un lempira y se descarga mucho.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿En qué escalón está, y cobra si te vas dos semanas?',
  '2. ¿Qué se haría UNA sola vez para subir el escalón siguiente?',
  '3. ¿Cuántas horas al mes pide de mantenimiento?',
  '4. Escribe en 3-4 frases a nombre de quién queda y dónde está escrito eso.',
]);

B.critCaseGuides = JSON.stringify([
  'Se nombra el escalón (hora, paquete, producto o sistema) y se contesta con un sí o un no, sin medias tintas: solo el producto y el sistema cobran estando fuera.',
  'Tiene que ser algo que se hace una vez: guardar el material, escribir la guía, grabar, convertir las dudas repetidas en una hoja. Si hay que repetirlo cada vez, no sube ningún escalón.',
  'En horas, no en ganas. Si pide más horas de las que deja, es una afición cara. Y si son cero, hay que mirarlo otra vez, porque ningún activo cuesta cero.',
  'A nombre de quién queda, y en qué papel está escrito. Si la respuesta es «no lo sé», ese es el trabajo pendiente, y se hace antes de firmar y no después.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Este mes gané más que nunca, vamos bien".', g1: 'El total no mide esta etapa. Lo que mide es cuánto entró sin haber trabajado ese mes, que puede ser cero en el mejor mes del año.', g2: 'Ganar más dando más talleres es seguir en el primer escalón, mejor pagado y con menos tiempo para construir el segundo.' },
  { txt: '"Voy a dejar el trabajo para dedicarme a esto a tiempo completo".', g1: 'Es la peor situación posible para construir: hay que cobrar rápido, y cobrar rápido significa vender horas, que es el escalón del que se quería salir.', g2: 'El sueldo compra lo único que hace falta, que es tiempo sin urgencia. Con dos horas semanales un cuaderno de ochenta páginas se termina en un año.' },
  { txt: '"El curso está grabado, ya es un producto".', g1: 'Si cada compra trae dudas por mensaje, se cobró como producto y cuesta como empleo. Y empeora con el éxito: vender más es trabajar más.', g2: 'Se arregla una vez: las dudas repetidas se convierten en material añadido y las que no se repiten se cobran como asesoría.' },
  { txt: '"Pagan muy bien, no importa a nombre de quién quede".', g1: 'Importa, y es lo único que importa a cinco años vista. El material va a producir todos los cursos, para quien tenga el papel.', g2: 'La contraoferta casi siempre se acepta: «el material es mío y ustedes tienen licencia de uso ilimitada dentro del centro». Lo que querían era usarlo.' },
  { txt: '"La aplicación no me cuesta nada mantenerla".', g1: 'Ningún activo cuesta cero. Si de verdad no pide nada, o está muerto o el costo lo está pagando alguien sin decirlo.', g2: 'Se cuentan las horas de un mes normal: arreglos, copias de seguridad, dudas. Con ese número ya se puede decidir si sigue o no.' },
  { txt: '"Regalo esta ficha para que me conozcan".', g1: 'Una ficha gratis está bien, pero es una puerta y se juzga como puerta: por cuánta gente trae, no por lo que deja.', g2: 'Y para que sea puerta tiene que llevar dentro el nombre, el código y a dónde ir después. Sin eso es trabajo regalado.' },
]);

B.critDecisionBank = JSON.stringify([
  'El único sábado libre del mes: ¿taller de 1.500 lempiras o terminar el cuaderno que lleva cuatro meses al ochenta por ciento?',
  'Un centro pide asesoría mensual ilimitada por una cantidad fija: ¿se acepta, se rechaza o se replantea?',
  'El curso grabado trae dudas cada semana: ¿se contesta, se deja de contestar o se cambia algo de una vez?',
  'Un contrato bueno con una línea que cede la autoría: ¿se firma, se rechaza o se contraoferta?',
  'La aplicación pide arreglos cada semana y deja poco: ¿se sostiene, se sube el precio o se cierra?',
  'Cinco talleres dados y ningún material guardado: ¿qué se hace antes del sexto?',
  'Una ficha gratis que se descarga mucho y no trae contactos: ¿se deja de hacer o se le cambia algo?',
  'Hay dos horas libres el domingo: ¿se preparan dos talleres nuevos o se avanza el producto?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Dar el taller del sábado por 1.500 lempiras.', b: 'Terminar el cuaderno que lleva cuatro meses al ochenta por ciento.', ga: 'Caso A: entra dinero seguro hoy y las cuentas se pagan. Es la decisión correcta si ese dinero hace falta este mes de verdad.', gb: 'Caso B: cero lempiras hoy y un producto que se vende muchas veces después. Y hay un dato que decide: llevas seis meses eligiendo A, y el cuaderno lleva seis meses al ochenta por ciento.' },
  { a: 'Cobrar por hora, con precio alto.', b: 'Cobrar un paquete cerrado con material y guía.', ga: 'Caso A: el precio sube pero el techo es el mismo, porque las horas del día no crecen. Y sigue sin cobrar el mes que faltes.', gb: 'Caso B: el mismo trabajo y más dinero, porque el centro recibe más cosas; y sobre todo, el molde queda hecho para el siguiente.' },
  { a: 'Aceptar el contrato que cede la autoría, que paga bien.', b: 'Contraofertar licencia de uso ilimitada dentro del centro.', ga: 'Caso A: entra dinero ahora y el material produce cada curso para el centro, no para ti. Se cobró una vez lo que iba a valer años.', gb: 'Caso B: cuesta lo mismo para ellos y resuelve su necesidad entera. Casi siempre se acepta, porque lo que querían era usarlo, no venderlo.' },
  { a: 'Contestar cada duda del curso grabado, una por una.', b: 'Convertir las dudas repetidas en material añadido.', ga: 'Caso A: el comprador queda contento y el trabajo semanal no baja nunca; al contrario, sube con cada venta nueva.', gb: 'Caso B: cuesta un fin de semana una sola vez y baja el mantenimiento de horas semanales a horas anuales.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Todo el ingreso está en el primer escalón.', guide: 'Cualquier semana de enfermedad se convierte en un mes sin dinero. Y como no hay margen, no hay horas para construir el segundo escalón: el trabajo se come a sí mismo.' },
  { cause: 'Se vende una asesoría sin número de horas.', guide: 'Crece hasta ocupar todo el mes sin que nadie lo decida, porque el centro pide lo que necesita y tú aceptas lo que puedes. Acaba siendo un empleo sin prestaciones.' },
  { cause: 'Se cobra como producto algo que exige atención semanal.', guide: 'El éxito se vuelve castigo: cada venta añade trabajo fijo. Es el único caso donde vender más empeora la situación de quien vende.' },
  { cause: 'Se firma un contrato sin mirar a nombre de quién queda el material.', guide: 'El material produce cada curso, para el centro. Se cobró una vez lo que iba a valer durante años, y esa línea no se puede renegociar después.' },
  { cause: 'No se cuenta el mantenimiento en horas.', guide: 'Se sostienen cosas que cuestan más de lo que dejan, y se sostienen por cariño. Con el número delante la decisión se toma en dos minutos.' },
  { cause: 'Se regalan fichas sin nombre, código ni contacto.', guide: 'Se descargan mucho y no traen a nadie. Eso no es una puerta: es trabajo regalado, y de eso ya hay bastante en este oficio.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Preparar el sexto taller costó media hora en vez de seis.', guide: 'Se guardó el material de los cinco anteriores en una carpeta con fecha. El molde se construyó sin dedicarle una sola hora extra.' },
  { effect: 'Entró dinero el mes que estuvo enfermo.', guide: 'Había algo en el tercer escalón: un producto terminado que alguien podía entregar sin él.' },
  { effect: 'El mantenimiento del curso bajó de horas semanales a horas anuales.', guide: 'Las dudas repetidas se convirtieron en material añadido y las que no se repetían pasaron a cobrarse como asesoría.' },
  { effect: 'El material sigue produciendo y es suyo.', guide: 'Se contraofertó licencia de uso ilimitada dentro del centro en vez de ceder la autoría, y el centro aceptó sin discutir.' },
  { effect: 'Se cerró una aplicación sin remordimiento.', guide: 'Se contaron las horas de mantenimiento de un mes normal y se compararon con lo que dejaba. Con el número delante no hubo debate.' },
  { effect: 'Una ficha gratis trajo once contactos en un mes.', guide: 'Llevaba dentro el nombre, el código y a dónde ir después. Era una puerta, no trabajo regalado.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🧱', label: 'El molde', text: 'Lo que se hace <strong>una vez</strong> para no volver a hacerlo. <strong>Si falta:</strong> cada venta cuesta lo mismo que la primera. <strong>En M.E.T.A.S:</strong> la guía del taller y las hojas preparadas.' },
  { y: '2', icon: '🔁', label: 'La copia', text: 'Que se pueda entregar otra vez <strong>sin volver a fabricarlo</strong>. <strong>Si falta:</strong> hay molde pero no hay activo. <strong>En M.E.T.A.S:</strong> el cuaderno impreso y el material descargable.' },
  { y: '3', icon: '💵', label: 'El cobro', text: 'Que alguien pague, y <strong>por dónde paga</strong>. <strong>Si falta:</strong> es un buen material que no da de comer. <strong>En M.E.T.A.S:</strong> por centro, por maestra o por licencia anual.' },
  { y: '4', icon: '🚪', label: 'La puerta', text: 'Lo que se regala para <strong>traer gente</strong> a lo que cobra. <strong>Si falta:</strong> el producto no se vende solo. <strong>En M.E.T.A.S:</strong> la ficha gratis con código y teléfono.' },
  { y: '5', icon: '🔧', label: 'El mantenimiento', text: 'Las <strong>horas al mes</strong> que pide para seguir vivo. <strong>Si es más de lo que deja:</strong> es una afición cara. <strong>En M.E.T.A.S:</strong> erratas, reimpresiones y copias de seguridad.' },
  { y: '6', icon: '📜', label: 'La propiedad', text: '<strong>A nombre de quién queda</strong> lo que produce. <strong>Si falta:</strong> el activo es de otro y produce para otro. <strong>En M.E.T.A.S:</strong> nombre impreso dentro, no solo en la portada.' },
  { y: '7', icon: '🤝', label: 'El relevo', text: 'Qué pasa <strong>si te enfermas un mes</strong>. <strong>Si la respuesta es «se para»:</strong> el activo eres tú. <strong>En M.E.T.A.S:</strong> guía escrita para que otro pueda dar el taller.' },
]);

B.parteData = JSON.stringify({
  molde: {
    nombre: 'El molde', icon: '🧱',
    estructura: { title: 'Qué es', info: '• Lo que se hace <strong>una sola vez</strong> para no repetirlo<br>• La guía, las hojas preparadas, el archivo que se copia<br>• Sin molde no se sube ningún escalón' },
    funcion: { title: 'Cómo se construye', info: '• Con lo que ya se está haciendo: <strong>guardar el material de cada vez</strong><br>• Con fecha, en una carpeta, aunque esté a medias<br>• A la quinta vez el paquete ya está armado' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Cada venta cuesta lo mismo que la primera<br>• Y a los cinco años se sigue empezando de cero cada vez<br>• El precio por hora sube y el techo no se mueve' },
    cuidados: { title: 'En M.E.T.A.S', info: '• Las fichas son el molde: <strong>se hicieron una vez</strong><br>• El molde de misión de la aplicación es otro, y por eso cada etapa nueva cuesta menos<br>• Lo que falta es el molde del taller: la guía escrita' },
  },
  copia: {
    nombre: 'La copia', icon: '🔁',
    estructura: { title: 'Qué es', info: '• Que se pueda entregar otra vez <strong>sin volver a fabricarlo</strong><br>• Es lo que separa el molde del activo<br>• Un cuaderno se copia; una clase particular no' },
    funcion: { title: 'Cómo se construye', info: '• Poniendo el trabajo en un soporte que se reproduce<br>• Papel, archivo, grabación, aplicación<br>• Y comprobando que <strong>funcione sin ti delante</strong>' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Hay molde pero no hay activo: el trabajo está hecho y no se puede vender dos veces<br>• Se acumulan carpetas de material que nadie usa<br>• Y se sigue cobrando por hora' },
    cuidados: { title: 'En M.E.T.A.S', info: '• El cuaderno impreso se copia en la fotocopiadora<br>• La aplicación se copia sola: <strong>una vez escrita, sirve a todos</strong><br>• El taller presencial no se copia, y por eso hay que grabarlo' },
  },
  cobro: {
    nombre: 'El cobro', icon: '💵',
    estructura: { title: 'Qué es', info: '• Que alguien pague, y <strong>por dónde paga</strong><br>• Precio, forma de cobro y quién entrega<br>• Un activo sin cobro es un buen material que no da de comer' },
    funcion: { title: 'Cómo se construye', info: '• Precio decidido en frío, con la etapa 2 de esta ruta delante<br>• Una manera concreta de pagar, no «ya veremos»<br>• Y alguien que pueda entregar si tú no estás' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Se regala lo que costó meses<br>• O se cobra tan tarde que da igual haber cobrado<br>• Y se confunde interés con venta: <strong>preguntar no es pagar</strong>' },
    cuidados: { title: 'En M.E.T.A.S', info: '• Por centro, por maestra o por <strong>licencia anual</strong><br>• El precio se pone antes, no cuando llaman<br>• Y la ficha gratis es puerta, no producto' },
  },
  relevo: {
    nombre: 'El relevo', icon: '🤝',
    estructura: { title: 'Qué es', info: '• Qué pasa con esto <strong>si te enfermas un mes</strong><br>• Es la prueba final de toda la etapa<br>• Si la respuesta es «se para», el activo eres tú' },
    funcion: { title: 'Cómo se construye', info: '• Escribiendo la guía para que <strong>lo pueda dar otra persona</strong><br>• Dejando el material donde alguien más lo encuentre<br>• Y probándolo una vez de verdad, no en teoría' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Descansar cuesta dinero, que es la señal de alarma de la etapa<br>• Y el proyecto entero depende de que una persona no se enferme<br>• Que es una manera cara de vivir' },
    cuidados: { title: 'En M.E.T.A.S', info: '• Las fichas ya tienen relevo: <strong>funcionan sin nadie delante</strong><br>• El taller todavía no, y por eso hace falta la guía<br>• Y las llaves de la aplicación se guardan como enseña la Casa Cerrada' },
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
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: si el ingreso se para cuando tú te paras es un empleo, aunque sea tuyo, así que lo primero es decir en qué escalón está la cosa: hora, paquete, producto o sistema. Nada nace activo, y no se salta ningún escalón: se sube con lo que ya se está haciendo, haciendo una sola vez lo que se venía haciendo cada vez. El activo se construye con el sueldo y no en lugar del sueldo, porque el sueldo compra lo único que hace falta, que es tiempo sin urgencia. Todo activo pide mantenimiento y se cuenta en horas al mes: si pide más de lo que deja, es una afición cara. Y la pregunta final no es cuánto deja, sino a nombre de quién queda y dónde está escrito eso, que se pregunta antes de firmar y no después.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  [/💳 \*Ruta del Poder · Etapa 3\* 💳/g, '🌱 *Ruta del Poder · Etapa 4* 🌱'],
  [/El contrato antes de firmar/g, 'El escalón siguiente'],
  [/el contrato antes de firmar/g, 'el escalón siguiente'],
  [/La deuda por dentro: interés, plazo y costo total/g, 'Del salario al activo: ingresos que no dependen de tus horas'],
  [/La deuda por dentro/g, 'Del salario al activo'],
  [/Ruta del Poder · Etapa 3: La deuda/g, 'Ruta del Poder · Etapa 4: Del salario al activo'],
  [/Evaluación Final · La deuda ·/g, 'Evaluación Final · Del salario al activo ·'],
  [/Evaluación La deuda ·/g, 'Evaluación Del salario al activo ·'],
  [/Final: la deuda/g, 'Final: del salario al activo'],
  [/Etapa 3 · Poder Económico/g, 'Etapa 4 · Poder Económico'],
  [/💳 ¡/g, '🌱 ¡'],
  [/completó la Etapa 3 de la Ruta del Poder/g, 'completó la Etapa 4 de la Ruta del Poder'],
  /* la sección I se llamaba «La oferta sobre la mesa» en la etapa 3 */
  [/I\. La oferta sobre la mesa/g, 'I. El ingreso sobre la mesa'],
  /* los mensajes de la constancia eran de una misión todavía más vieja */
  [/\['¡Sigue estudiando tu sistema!','¡Muy buen trabajo!','¡Excelente gestor en formación!','¡Sabes por dónde se mueve esto!','¡Estratega institucional!'\]/g,
   "['¡Sigue contando lo que entra sin ti!','¡Muy buen trabajo!','¡Ya distingues el activo del empleo!','¡Construyes molde cada semana!','¡Preguntas a nombre de quién queda!']"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV seguían siendo las de la etapa 3 */
src = src.replace(/¿Qué falta preguntar, cuánto se devuelve en total y con qué condición por escrito lo firmarías\? Explica por qué tu salida es mejor que aceptar la cuota que te ofrecen o que rechazar de plano\./g,
  '¿En qué escalón está este ingreso, qué se haría una sola vez para subir el siguiente y cuántas horas al mes pide de mantenimiento? Explica por qué eso es mejor que cobrar más por hora o que aceptar más trabajo del mismo.');
src = src.replace(/1\. ¿Cuánto cuesta cada caso en total y cuál deja al proyecto más libre el año que viene\? 2\. ¿Por qué no son la misma decisión\?/g,
  '1. ¿Cuál de los dos sigue cobrando el mes que te enfermes? 2. ¿Por qué no son la misma decisión, aunque este mes dejen lo mismo?');

/* el desenlace de la simulación seguía narrando la cuota de la etapa 3 */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(terminaElCuaderno){sfx(terminaElCuaderno?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(terminaElCuaderno){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🧱</span><span class="ms-text"><strong>Ese sábado entraron 0 lempiras</strong> y el cuaderno quedó terminado. La semana siguiente fue a la imprenta un lote de cincuenta.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✅</span><span class="ms-text"><strong>Cuatro meses después:</strong> el cuaderno dejó más que tres talleres, y el mes que estuviste con gripe siguió entrando dinero. El taller se puede seguir dando; el cuaderno ya no hay que volver a hacerlo.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">💵</span><span class="ms-text"><strong>Entraron 1.500 lempiras</strong> y estuvieron muy bien: pagaron la fotocopiadora del mes. La decisión no fue mala.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">7</span><span class="ms-icon">📉</span><span class="ms-text"><strong>Pero es la séptima vez:</strong> el cuaderno sigue al ochenta por ciento y el mes que viene el sábado libre traerá la misma oferta. Siete sábados son 10.500 lempiras y un producto sin terminar.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='[a-zA-Z]+',labAspecto='estructura';/, "let labParte='molde',labAspecto='estructura';");
/* y el botón que se resalta al abrir: si no coincide, el laboratorio abre sin nada marcado */
src = src.replace(/(document\.querySelector\('\[data-parte=")[a-zA-Z]+("\]')/, '$1molde$2');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
