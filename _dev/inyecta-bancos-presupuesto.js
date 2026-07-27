/* Inyecta los bancos de la misión «El presupuesto real» (Ruta del Poder,
   etapa 2) sobre el molde copiado de la misión de Sesgos, y de paso cuadra dos
   cifras del HTML que no daban.
   Uso:  node _dev/inyecta-bancos-presupuesto.js

   Los números de toda la misión salen de un solo juego, para que ninguna cuenta
   se contradiga con otra:
     fijos del mes 750 L (dominio 250, datos 350, reserva de impresión 150)
     precio de la hora 100 L · cuota por aula 150 L
     soporte por aula media hora al mes = 50 L  →  margen por aula 100 L
     punto de equilibrio 750 / 100 = 8 aulas                                   */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-poder-presupuesto', 'js', 'presupuesto.js');
const HTML = path.join(RAIZ, 'misiones', 'ruta-poder-presupuesto', 'presupuesto.html');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20250727;
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

B.SAVE_KEY = `'faro_eco_presupuesto_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del presupuesto superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del costo explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de costo fijo y variable experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del presupuesto maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del presupuesto' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta del Poder completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Gasta sin apuntar 🌫️' },
  { t: 25, n: 'Separa fijo de variable 🏠' },
  { t: 55, n: 'Le pone precio a la hora ⏳' },
  { t: 90, n: 'Calcula el costo por unidad 🧮' },
  { t: 130, n: 'Conoce su punto de equilibrio ⚖️' },
  { t: 165, n: 'Reparte en sobres ✉️' },
  { t: 190, n: 'Presupuesto de doce meses 🧾' },
]);

B.fcData = JSON.stringify([
  { w: 'Costo fijo', a: '🏠 Lo que se paga <strong>aunque no pase nada</strong>: dominio, datos, reserva de impresión. No sube al atender más aulas, y por eso cada aula nueva lo abarata. En M.E.T.A.S son unos <strong>750 lempiras al mes</strong>.' },
  { w: 'Costo variable', a: '📄 Sube <strong>con cada unidad</strong>: el papel de cada ficha, la tinta, el pasaje de cada taller. Crecer no lo abarata, lo multiplica.' },
  { w: 'El costo de la hora', a: '⏳ El precio que se le pone al propio tiempo, <strong>aunque nadie lo pague</strong>. En esta casa se usa 100 lempiras la hora. Sin ese número, todo parece rentable y nada se puede comparar.' },
  { w: 'Costo de oportunidad', a: '🔀 Lo que se deja de hacer por hacer otra cosa. Las tres horas de un taller son tres horas que no se usaron en construir una ruta. <strong>No aparece en ningún recibo</strong> y es el gasto más grande.' },
  { w: 'Costo por unidad', a: '🧮 Variables más horas, por cada cosa que se entrega. Una ficha impresa no cuesta 20 lempiras de papel: cuesta <strong>unos 56</strong>, porque los veinte minutos de revisión valen 33.' },
  { w: 'Margen', a: '📈 Precio menos costo por unidad. Un aula a 150 lempiras con media hora de soporte al mes deja <strong>100 de margen</strong>, no 150.' },
  { w: 'Punto de equilibrio', a: '⚖️ Fijos entre margen: <strong>cuántas unidades hacen falta para no perder</strong>. 750 entre 100 son ocho aulas. Es la única cifra que hay que saber de memoria.' },
  { w: 'El sobre del mes', a: '✉️ Repartir el dinero <strong>el día que entra</strong>, en cuatro sobres: fijos, variables, ahorro y reinversión. Un sobre vacío es una respuesta clara; una cuenta con saldo siempre parece que alcanza.' },
  { w: 'Ingreso recurrente', a: '🔁 El que vuelve solo cada mes, como la cuota por aula. Vale mucho más que uno igual de grande que llega una vez, porque <strong>no hay que volver a conseguirlo</strong>.' },
  { w: 'Ingreso único', a: '💸 El que llega una vez: un patrocinio, un taller. Sirve para <strong>financiar lo que sí se repite</strong>, no para sostener el mes.' },
  { w: 'Lo gratis con precio', a: '☁️ Hospedaje y base de datos hoy no cuestan nada. En el presupuesto se anotan igual, <strong>con su precio de mercado entre paréntesis</strong>: gratis no es un precio, es un precio aplazado.' },
  { w: 'La hoja que salió mal', a: '🗑️ El costo que nadie apunta y que siempre existe: la impresión fallida, el viaje perdido, la ficha que hubo que rehacer. Se estima <strong>por arriba</strong>, no por abajo.' },
  { w: 'Plazo de retorno', a: '🖨️ En cuánto tiempo se paga sola una inversión. Una impresora de 4.500 que ahorra 2 por ficha necesita <strong>2.250 fichas</strong>: la pregunta no es si ahorra, es si el proyecto vivirá tanto.' },
  { w: 'Escalar', a: '📊 Que atender el doble no cueste el doble. Las fichas escalan (el archivo sirve para todos); <strong>los talleres no</strong>, porque se pagan con horas que no se repiten.' },
  { w: 'Regalar con costo conocido', a: '🎁 Regalar está bien; regalar <strong>sin saber cuánto cuesta</strong> no es generosidad, es una cuenta que llega después y la paga la casa.' },
  { w: 'Muerte por goteo', a: '💧 Un proyecto familiar no cierra de golpe: un mes no alcanza y se paga de la casa, y al tercero ya nadie sabe cuánto costaba ni cuánto entraba.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué es un costo fijo?', o: ['a) El que sube con cada unidad', 'b) El que se paga aunque no pase nada', 'c) El que nunca cambia de precio', 'd) El que se paga una sola vez'], c: 1 },
  { q: 'El papel de cada ficha impresa es un costo…', o: ['a) Fijo', 'b) De oportunidad', 'c) Variable', 'd) Hundido'], c: 2 },
  { q: 'Con fijos de 750 y un margen de 100 por aula, el punto de equilibrio es…', o: ['a) 5 aulas', 'b) 8 aulas', 'c) 15 aulas', 'd) 750 aulas'], c: 1 },
  { q: '¿Por qué se le pone precio a la hora aunque nadie la pague?', o: ['a) Para cobrarla algún día', 'b) Para que el proyecto se vea más serio', 'c) Porque lo exige la contabilidad', 'd) Para poder comparar dos usos de la misma tarde'], c: 3 },
  { q: 'Una ficha con 20 de papel y 20 minutos de revisión a 100 la hora cuesta…', o: ['a) Unos 56 lempiras', 'b) 20 lempiras', 'c) 120 lempiras', 'd) 33 lempiras'], c: 0 },
  { q: '¿Qué es el margen?', o: ['a) El precio de venta', 'b) Precio menos costo por unidad', 'c) Lo que queda al final del año', 'd) Los costos fijos del mes'], c: 1 },
  { q: 'Una impresora de 4.500 que ahorra 2 por ficha se paga en…', o: ['a) 450 fichas', 'b) 900 fichas', 'c) 2.250 fichas', 'd) 4.500 fichas'], c: 2 },
  { q: '¿Cómo se anota en el presupuesto un servicio que hoy es gratis?', o: ['a) No se anota, porque no cuesta', 'b) Con su precio de mercado entre paréntesis', 'c) Como ingreso', 'd) Solo el día que empiece a cobrar'], c: 1 },
  { q: '¿De qué sobre NO se saca nunca?', o: ['a) Del de fijos', 'b) Del de ahorro', 'c) Del de reinversión', 'd) Del de variables'], c: 0 },
  { q: 'Un taller que deja 5.500 con 14 horas metidas, a 100 la hora, deja de margen real…', o: ['a) 5.500', 'b) 1.400', 'c) 4.100', 'd) 6.900'], c: 2 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Fijo', 'Variable'], headA: '🏠 Costo fijo', headB: '📄 Costo variable', colA: 'ok', colB: 'no',
    words: [
      { w: 'El dominio del sitio', t: 'ok' }, { w: 'El papel de cada ficha', t: 'no' },
      { w: 'Los datos del teléfono', t: 'ok' }, { w: 'El pasaje a cada taller', t: 'no' },
      { w: 'El hospedaje del mes', t: 'ok' }, { w: 'La tinta de cada impresión', t: 'no' },
      { w: 'La cuota de la base de datos', t: 'ok' }, { w: 'El refrigerio por participante', t: 'no' },
    ],
  },
  {
    label: ['Se ve', 'No se ve'], headA: '👁️ Costo que se ve', headB: '🕳️ Costo que no se ve', colA: 'ok', colB: 'no',
    words: [
      { w: 'La factura del dominio', t: 'ok' }, { w: 'Las horas de quien lo revisa', t: 'no' },
      { w: 'El recibo de las copias', t: 'ok' }, { w: 'Las hojas que salieron mal', t: 'no' },
      { w: 'El pasaje del sábado', t: 'ok' }, { w: 'El taller que no se preparó por atender otro', t: 'no' },
      { w: 'El precio de la impresora', t: 'ok' }, { w: 'El hospedaje que hoy es gratis', t: 'no' },
    ],
  },
  {
    label: ['Ingreso', 'Costo'], headA: '💵 Ingreso', headB: '🧾 Costo', colA: 'ok', colB: 'no',
    words: [
      { w: 'La cuota de 150 por aula', t: 'ok' }, { w: 'La reserva de impresión del mes', t: 'no' },
      { w: 'Los 800 por maestro del taller', t: 'ok' }, { w: 'Las horas de preparar el taller', t: 'no' },
      { w: 'El patrocinio de 8.000', t: 'ok' }, { w: 'Rediseñar la portada para el patrocinador', t: 'no' },
      { w: 'La venta de fichas impresas', t: 'ok' }, { w: 'El viaje a sacar copias', t: 'no' },
    ],
  },
  {
    label: ['Baja', 'Sube'], headA: '⬇️ Baja el punto de equilibrio', headB: '⬆️ Lo sube', colA: 'ok', colB: 'no',
    words: [
      { w: 'Automatizar la revisión de fichas', t: 'ok' }, { w: 'Empezar a pagar el hospedaje', t: 'no' },
      { w: 'Subir la cuota por aula', t: 'ok' }, { w: 'Prometer soporte telefónico a todos', t: 'no' },
      { w: 'Formar un docente enlace por zona', t: 'ok' }, { w: 'Comprar equipo a plazos', t: 'no' },
      { w: 'Imprimir en blanco y negro', t: 'ok' }, { w: 'Añadir un servicio gratis más', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['El', 'fijo', 'se', 'paga', 'aunque', 'no', 'pase', 'nada.'], c: 1, art: 'El costo que no depende del volumen' },
  { s: ['El', 'variable', 'sube', 'con', 'cada', 'unidad.'], c: 1, art: 'El costo que se multiplica al crecer' },
  { s: ['La', 'hora', 'tiene', 'precio', 'aunque', 'no', 'se', 'cobre.'], c: 1, art: 'El gasto más grande y el no apuntado' },
  { s: ['El', 'margen', 'es', 'precio', 'menos', 'costo', 'por', 'unidad.'], c: 1, art: 'Lo que deja cada unidad entregada' },
  { s: ['El', 'equilibrio', 'dice', 'cuántas', 'hacen', 'falta.'], c: 1, art: 'La cifra que se sabe de memoria' },
  { s: ['Los', 'sobres', 'se', 'reparten', 'al', 'entrar', 'el', 'dinero.'], c: 1, art: 'El método para no gastar de más' },
  { s: ['Lo', 'gratis', 'se', 'anota', 'con', 'su', 'precio.'], c: 1, art: 'El fijo que todavía no llegó' },
  { s: ['Los', 'talleres', 'no', 'escalan,', 'las', 'fichas', 'sí.'], c: 1, art: 'Lo que se paga con horas que no vuelven' },
]);

B.cmpData = JSON.stringify([
  { s: 'El costo que se paga aunque no pase nada es el costo ___.', opts: ['fijo', 'variable', 'medio'], c: 0 },
  { s: 'El costo que sube con cada unidad es el costo ___.', opts: ['variable', 'fijo', 'total'], c: 0 },
  { s: 'Precio menos costo por unidad es el ___.', opts: ['margen', 'ingreso', 'ahorro'], c: 0 },
  { s: 'Fijos entre margen da el punto de ___.', opts: ['equilibrio', 'partida', 'venta'], c: 0 },
  { s: 'Lo que se deja de hacer por hacer otra cosa es el costo de ___.', opts: ['oportunidad', 'producción', 'traslado'], c: 0 },
  { s: 'El dinero se reparte en ___ el día que entra.', opts: ['sobres', 'partes', 'cuentas'], c: 0 },
  { s: 'En esta casa la hora se valora en ___ lempiras.', opts: ['100', '20', '750'], c: 0 },
  { s: 'Con fijos de 750 y margen de 100, hacen falta ___ aulas.', opts: ['ocho', 'cinco', 'quince'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Fijo', 'Variable'], btnA: '🏠 Fijo', btnB: '📄 Variable', colA: 'ok', colB: 'no',
    words: [
      { w: 'El dominio', t: 'ok' }, { w: 'El papel de una ficha', t: 'no' },
      { w: 'Los datos del mes', t: 'ok' }, { w: 'El pasaje de un taller', t: 'no' },
      { w: 'El hospedaje', t: 'ok' }, { w: 'La tinta', t: 'no' },
      { w: 'La base de datos', t: 'ok' }, { w: 'El refrigerio por persona', t: 'no' },
      { w: 'La reserva de impresión', t: 'ok' }, { w: 'Las copias de un aula', t: 'no' },
    ],
  },
  {
    label: ['Se ve', 'No se ve'], btnA: '👁️ Se ve', btnB: '🕳️ No se ve', colA: 'ok', colB: 'no',
    words: [
      { w: 'La factura del dominio', t: 'ok' }, { w: 'Las horas de revisión', t: 'no' },
      { w: 'El recibo de copias', t: 'ok' }, { w: 'Las hojas malas', t: 'no' },
      { w: 'El pasaje', t: 'ok' }, { w: 'La tarde que no se usó en otra cosa', t: 'no' },
      { w: 'El precio de la impresora', t: 'ok' }, { w: 'El hospedaje gratis de hoy', t: 'no' },
      { w: 'El refrigerio', t: 'ok' }, { w: 'El viaje a sacar copias', t: 'no' },
    ],
  },
  {
    label: ['Escala', 'No escala'], btnA: '📊 Escala', btnB: '🧍 No escala', colA: 'ok', colB: 'no',
    words: [
      { w: 'Una misión publicada', t: 'ok' }, { w: 'Un taller presencial', t: 'no' },
      { w: 'La ficha en PDF', t: 'ok' }, { w: 'Atender llamadas de soporte', t: 'no' },
      { w: 'El Campeonísimo', t: 'ok' }, { w: 'Visitar centro por centro', t: 'no' },
      { w: 'El manual publicado', t: 'ok' }, { w: 'Revisar cada ficha a mano', t: 'no' },
      { w: 'Un vídeo grabado', t: 'ok' }, { w: 'Una capacitación de un sábado', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se arma un presupuesto, de principio a fin', steps: ['Listar los fijos del mes, incluido lo gratis con su precio entre paréntesis', 'Medir con cronómetro lo que cuesta hacer una unidad de verdad', 'Elegir un precio para la hora y no volver a discutirlo', 'Sacar el costo por unidad sumando variables y horas', 'Restar el costo al precio para tener el margen', 'Dividir los fijos entre el margen: ese es el punto de equilibrio'] },
  { label: 'Cómo se calcula lo que cuesta una ficha', steps: ['Contar el papel y la tinta de las diez páginas', 'Añadir las hojas que salen mal, estimadas por arriba', 'Añadir el viaje si se imprime fuera', 'Cronometrar la revisión final y pasarla a lempiras', 'Sumar todo y comparar con lo que se creía que costaba'] },
  { label: 'Cómo se reparte el sobre del mes', steps: ['Apartar primero los fijos completos', 'Apartar los variables previstos del mes', 'Apartar el ahorro antes de pensar en nada nuevo', 'Lo que queda, y solo eso, es reinversión', 'Anotar qué sobre quedó corto para ajustarlo el mes siguiente'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Se paga igual haya trabajo o no, y cada unidad nueva lo abarata', ans: 'Costo fijo', opts: ['Costo fijo', 'Costo variable', 'Margen', 'Punto de equilibrio'] },
  { desc: 'Sube con cada unidad entregada y crecer lo multiplica', ans: 'Costo variable', opts: ['Costo variable', 'Costo fijo', 'Ingreso recurrente', 'Margen'] },
  { desc: 'El precio del propio tiempo, aunque no lo pague nadie', ans: 'El costo de la hora', opts: ['El costo de la hora', 'El costo variable', 'El margen', 'El sobre del mes'] },
  { desc: 'Lo que se deja de hacer por hacer otra cosa', ans: 'Costo de oportunidad', opts: ['Costo de oportunidad', 'Costo fijo', 'Plazo de retorno', 'Ingreso único'] },
  { desc: 'Variables más horas, por cada cosa que se entrega', ans: 'Costo por unidad', opts: ['Costo por unidad', 'Costo fijo', 'Margen', 'Ingreso recurrente'] },
  { desc: 'Precio menos costo por unidad', ans: 'Margen', opts: ['Margen', 'Ingreso', 'Punto de equilibrio', 'Costo variable'] },
  { desc: 'Cuántas unidades hacen falta para no perder', ans: 'Punto de equilibrio', opts: ['Punto de equilibrio', 'Margen', 'Plazo de retorno', 'Costo por unidad'] },
  { desc: 'Repartir el dinero el mismo día que entra', ans: 'El sobre del mes', opts: ['El sobre del mes', 'El margen', 'El costo fijo', 'El ingreso único'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'El dominio metas.policastsapien.com', func: 'Sobre de fijos: se paga aunque nadie use nada', opts: ['Sobre de fijos: se paga aunque nadie use nada', 'Sobre de variables: depende de las unidades', 'Sobre de ahorro: se guarda sin gastar', 'Sobre de reinversión: solo si sobra'] },
  { trans: 'El papel y la tinta de treinta fichas', func: 'Sobre de variables: sube con cada unidad', opts: ['Sobre de variables: sube con cada unidad', 'Sobre de fijos: no depende del volumen', 'Sobre de ahorro: no es un gasto', 'Sobre de reinversión: es equipo nuevo'] },
  { trans: 'Guardar algo por si un mes no alcanza', func: 'Sobre de ahorro: se aparta antes de pensar en nada nuevo', opts: ['Sobre de ahorro: se aparta antes de pensar en nada nuevo', 'Sobre de fijos: es un pago del mes', 'Sobre de variables: depende del uso', 'Sobre de reinversión: es para crecer'] },
  { trans: 'La impresora de 4.500 lempiras', func: 'Sobre de reinversión: solo con lo que sobra al final', opts: ['Sobre de reinversión: solo con lo que sobra al final', 'Sobre de fijos: es un pago mensual', 'Sobre de variables: sube por unidad', 'Sobre de ahorro: es dinero guardado'] },
  { trans: 'Los datos del teléfono para subir las misiones', func: 'Sobre de fijos: se paga todos los meses igual', opts: ['Sobre de fijos: se paga todos los meses igual', 'Sobre de variables: depende de cuántas misiones', 'Sobre de ahorro: se puede posponer', 'Sobre de reinversión: es una mejora'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'El taller dejó 2.400 lempiras y quedó la sensación de haber perdido', characteristic: 'No se contaron las horas de preparar y de dar el taller', opts: ['No se contaron las horas de preparar y de dar el taller', 'El precio por maestro era muy bajo', 'Fueron pocos participantes', 'El refrigerio salió caro'] },
  { disease: 'Las treinta fichas «gratis» se llevaron la tarde entera', characteristic: 'Se calculó papel y tinta pero no el viaje ni la revisión', opts: ['Se calculó papel y tinta pero no el viaje ni la revisión', 'La impresora era lenta', 'El papel estaba caro ese mes', 'Se imprimieron de más'] },
  { disease: 'Cinco aulas pagando y el mes seguía saliendo del bolsillo de la casa', characteristic: 'El equilibrio no eran cinco: el soporte por aula bajaba el margen', opts: ['El equilibrio no eran cinco: el soporte por aula bajaba el margen', 'Las aulas pagaron tarde', 'Los fijos subieron ese mes', 'Se cobró muy poco por aula'] },
  { disease: 'Llegó la factura del hospedaje y no había con qué', characteristic: 'Lo gratis no estaba anotado con su precio de mercado', opts: ['Lo gratis no estaba anotado con su precio de mercado', 'El proveedor subió los precios sin avisar', 'Se gastó de más en impresión', 'Faltaron aulas ese mes'] },
  { disease: 'Se compró equipo y en marzo no alcanzó para el dominio', characteristic: 'Se sacó del sobre de fijos para reinvertir', opts: ['Se sacó del sobre de fijos para reinvertir', 'El equipo salió más caro de lo previsto', 'Bajaron los ingresos', 'El dominio subió de precio'] },
  { disease: 'Los anuncios en el APK dieron menos que el dominio de un mes', characteristic: 'No se calculó cuánto entraba de verdad con el tráfico actual', opts: ['No se calculó cuánto entraba de verdad con el tráfico actual', 'Los anuncios estaban mal colocados', 'La aplicación tenía errores', 'Faltó publicidad del proyecto'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Se paga aunque no se atienda ninguna aula.', type: 'Costo fijo' },
  { s: 'Sube con cada ficha impresa.', type: 'Costo variable' },
  { s: 'El precio del propio tiempo, aunque no lo pague nadie.', type: 'Costo de la hora' },
  { s: 'Lo que se deja de hacer por hacer otra cosa.', type: 'Costo de oportunidad' },
  { s: 'Precio menos costo por unidad.', type: 'Margen' },
  { s: 'Cuántas unidades hacen falta para no perder.', type: 'Punto de equilibrio' },
  { s: 'Repartir el dinero el día que entra.', type: 'Sobre del mes' },
  { s: 'En cuánto tiempo se paga sola una compra.', type: 'Plazo de retorno' },
  { s: 'Atender el doble sin que cueste el doble.', type: 'Escalar' },
  { s: 'Un servicio que hoy no cobra y algún día cobrará.', type: 'Fijo aplazado' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'El dominio del sitio', gen: 'Costo', n: 'Mensual', g: 'Fijo', t: 'No depende del volumen' },
  { w: 'El papel de cada ficha', gen: 'Costo', n: 'Por unidad', g: 'Variable', t: 'Sube al crecer' },
  { w: 'Los datos del teléfono', gen: 'Costo', n: 'Mensual', g: 'Fijo', t: 'No depende del volumen' },
  { w: 'El pasaje a cada taller', gen: 'Costo', n: 'Por unidad', g: 'Variable', t: 'Sube al crecer' },
  { w: 'La factura del dominio', gen: 'Visibilidad', n: 'Con recibo', g: 'Se ve', t: 'Alguien lo cobró' },
  { w: 'Las horas de revisión', gen: 'Visibilidad', n: 'Sin recibo', g: 'No se ve', t: 'Nadie lo factura' },
  { w: 'La cuota de 150 por aula', gen: 'Flujo', n: 'Entra', g: 'Ingreso', t: 'Suma al mes' },
  { w: 'La reserva de impresión', gen: 'Flujo', n: 'Sale', g: 'Costo', t: 'Resta al mes' },
  { w: 'Una misión publicada', gen: 'Crecimiento', n: 'Sin más horas', g: 'Escala', t: 'Sirve para todos' },
  { w: 'Un taller presencial', gen: 'Crecimiento', n: 'Con más horas', g: 'No escala', t: 'Se paga con tiempo' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'El costo que se paga aunque no pase nada es el costo ___.', opts: ['fijo', 'variable', 'medio'], ans: 'fijo' },
  { s: 'El costo que sube con cada unidad es el costo ___.', opts: ['variable', 'fijo', 'total'], ans: 'variable' },
  { s: 'Precio menos costo por unidad es el ___.', opts: ['margen', 'ingreso', 'ahorro'], ans: 'margen' },
  { s: 'Fijos entre margen da el punto de ___.', opts: ['equilibrio', 'venta', 'partida'], ans: 'equilibrio' },
  { s: 'Lo que se deja de hacer por otra cosa es costo de ___.', opts: ['oportunidad', 'traslado', 'produccion'], ans: 'oportunidad' },
  { s: 'El dinero se reparte en ___ el día que entra.', opts: ['sobres', 'cuentas', 'partes'], ans: 'sobres' },
  { s: 'Lo gratis se anota con su ___ entre paréntesis.', opts: ['precio', 'nombre', 'plazo'], ans: 'precio' },
  { s: 'Los talleres no ___, porque se pagan con horas.', opts: ['escalan', 'cuestan', 'sirven'], ans: 'escalan' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica la diferencia entre costo fijo y costo variable con ejemplos de M.E.T.A.S, y di qué decide cada uno.', ans: 'El costo fijo se paga igual haya trabajo o no: el dominio, los datos del teléfono, la reserva de impresión, unos 750 lempiras al mes. No sube al atender más aulas, así que cada aula nueva lo abarata, y por eso es el que decide cuánto volumen hace falta para no perder. El costo variable sube con cada unidad: el papel y la tinta de cada ficha, el pasaje de cada taller, el refrigerio por participante. Crecer no lo abarata, lo multiplica, y por eso es el que decide si el precio de una unidad deja algo. Resumido: el fijo se cubre con volumen y el variable con precio.' },
  { q: '¿Por qué se le pone precio a la hora si nadie la paga? Da un ejemplo del proyecto.', ans: 'Porque si la hora vale cero, todo parece rentable y ninguna decisión se puede comparar. Ponerle precio no significa cobrarla: significa poder elegir entre dos usos de la misma tarde. Con la hora a 100 lempiras, hacer treinta fichas a mano (una tarde entera, unas cuatro horas, 400 lempiras) y pasar esa misma tarde escribiendo una herramienta que las revise sola dejan de ser cuestión de gusto y pasan a ser una comparación con resultado. Es también el motivo de que las herramientas de _dev sean una decisión económica y no solo técnica.' },
  { q: 'Calcula el punto de equilibrio de la cuota por aula y explica por qué no son cinco aulas.', ans: 'Los fijos del mes son 750 lempiras y la cuota por aula es de 150. Dividir 750 entre 150 da cinco, pero esa cuenta supone que atender un aula no cuesta nada. Cada aula come alrededor de media hora de acompañamiento al mes, y a 100 lempiras la hora eso son 50 por aula: el margen real es 100, no 150. El punto de equilibrio es 750 entre 100, es decir ocho aulas. La lección es que el equilibrio se calcula con el margen y nunca con el precio.' },
  { q: '¿Cómo se anota en el presupuesto un servicio que hoy es gratis, y por qué?', ans: 'Se anota igual que los demás fijos, con su precio de mercado entre paréntesis. Gratis no es un precio: es un precio aplazado. Hoy el sitio y la base de datos están en planes gratuitos, así que el fijo de infraestructura es casi cero, pero el día que haya que pagarlos el fijo mensual sube y el punto de equilibrio sube con él, de golpe y sin aviso. Si estaba anotado, ese día ya se sabe cuántas aulas hacen falta y no hay que decidir con prisa; si no estaba, se decide mal y con la factura encima.' },
  { q: 'Un taller deja 6.400 lempiras con 900 de gastos y catorce horas de trabajo. ¿Cuánto deja de verdad y qué enseña?', ans: 'Entran 6.400 y se van 900 en pasajes, refrigerio y copias, así que quedan 5.500. Pero hay catorce horas metidas, seis del taller y ocho de preparación, que a 100 lempiras la hora son 1.400. El margen real es 4.100, que sigue siendo bueno pero es la mitad de lo que parecía a simple vista. Lo que enseña: los talleres son el ingreso más rápido y el que peor escala, porque se pagan con horas que no se pueden repetir. Sirven para financiar lo que sí escala, como las fichas y las misiones, y no al revés.' },
  { q: 'Explica el método de los sobres y por qué la regla más importante es no sacar de los fijos.', ans: 'El dinero se reparte el día que entra en cuatro sobres: fijos, variables, ahorro y reinversión. Se hace así porque un sobre vacío es una respuesta clara, mientras que una cuenta con saldo siempre parece que alcanza para una cosa más. La regla de no tocar los fijos existe porque sacar de ahí para reinvertir se siente inteligente y es exactamente lo que apaga el dominio en marzo. Un proyecto familiar no cierra de golpe: se muere por goteo, un mes que no alcanzó y se pagó de la casa, y al tercero ya nadie sabe cuánto costaba ni cuánto entraba.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['MARGEN', 'FIJO', 'COSTO', 'HORA', 'SOBRE', 'AULA']),
  haceSopa(10, ['VARIABLE', 'UNIDAD', 'PRECIO', 'TINTA', 'GASTO', 'MES']),
  haceSopa(10, ['EQUILIBRIO', 'INGRESO', 'AHORRO', 'FICHA', 'PLAZO', 'CUOTA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'El costo fijo sube con cada unidad entregada.', a: false },
  { q: 'El costo fijo se paga aunque no se atienda ninguna aula.', a: true },
  { q: 'El papel de cada ficha es un costo variable.', a: true },
  { q: 'El punto de equilibrio se calcula dividiendo los fijos entre el precio.', a: false },
  { q: 'El punto de equilibrio se calcula dividiendo los fijos entre el margen.', a: true },
  { q: 'Ponerle precio a la hora obliga a cobrarla.', a: false },
  { q: 'El costo de oportunidad no aparece en ningún recibo.', a: true },
  { q: 'Un servicio gratuito no se anota en el presupuesto.', a: false },
  { q: 'De los fijos se puede sacar para reinvertir si hay una buena oportunidad.', a: false },
  { q: 'Los talleres se pagan con horas que no se pueden repetir.', a: true },
  { q: 'Una misión publicada escala mejor que una capacitación presencial.', a: true },
  { q: 'Regalar algo sin saber cuánto cuesta es una cuenta que llega después.', a: true },
  { q: 'Una inversión se juzga solo por lo que ahorra en cada unidad.', a: false },
  { q: 'El margen es el precio de venta de una unidad.', a: false },
  { q: 'En el presupuesto de esta casa la hora se valora en 100 lempiras.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Qué es un costo fijo?', o: ['a) El que se paga aunque no pase nada', 'b) El que sube con cada unidad', 'c) El que se paga una vez', 'd) El que no cambia de precio'], a: 0 },
  { q: 'La tinta de cada impresión es un costo…', o: ['a) Fijo', 'b) De oportunidad', 'c) Variable', 'd) Aplazado'], a: 2 },
  { q: 'Con fijos de 750 y margen de 100 por aula, el equilibrio está en…', o: ['a) 5 aulas', 'b) 15 aulas', 'c) 750 aulas', 'd) 8 aulas'], a: 3 },
  { q: '¿Para qué sirve ponerle precio a la hora?', o: ['a) Para cobrarla', 'b) Para comparar dos usos del mismo tiempo', 'c) Para pagar impuestos', 'd) Para justificar el precio'], a: 1 },
  { q: 'Una ficha con 20 de materiales y 20 minutos de revisión a 100 la hora cuesta…', o: ['a) 20 lempiras', 'b) 33 lempiras', 'c) Unos 56 lempiras', 'd) 120 lempiras'], a: 2 },
  { q: '¿Qué es el margen?', o: ['a) Precio menos costo por unidad', 'b) El precio de venta', 'c) Lo que sobra al año', 'd) Los fijos del mes'], a: 0 },
  { q: 'Una impresora de 4.500 que ahorra 2 por ficha se paga en…', o: ['a) 450 fichas', 'b) 2.250 fichas', 'c) 900 fichas', 'd) 4.500 fichas'], a: 1 },
  { q: '¿Cómo se anota un servicio que hoy es gratis?', o: ['a) No se anota', 'b) Como ingreso', 'c) Solo cuando empiece a cobrar', 'd) Con su precio de mercado entre paréntesis'], a: 3 },
  { q: '¿De qué sobre no se saca nunca?', o: ['a) Del de ahorro', 'b) Del de fijos', 'c) Del de reinversión', 'd) Del de variables'], a: 1 },
  { q: 'Un taller que deja 5.500 con 14 horas metidas a 100 deja de margen…', o: ['a) 4.100', 'b) 5.500', 'c) 1.400', 'd) 6.900'], a: 0 },
  { q: '¿Cuál de estas cosas escala?', o: ['a) Visitar centro por centro', 'b) Un taller de sábado', 'c) Una misión publicada', 'd) Atender llamadas de soporte'], a: 2 },
  { q: '¿Qué baja el punto de equilibrio?', o: ['a) Prometer soporte telefónico a todos', 'b) Empezar a pagar el hospedaje', 'c) Añadir un servicio gratis', 'd) Automatizar la revisión de fichas'], a: 3 },
  { q: 'El costo de oportunidad es…', o: ['a) Lo que se deja de hacer por hacer otra cosa', 'b) Lo que cuesta una oportunidad de negocio', 'c) El costo de un imprevisto', 'd) Lo que se ahorra al no gastar'], a: 0 },
  { q: '¿Por qué el patrocinio de 8.000 deja menos de 8.000?', o: ['a) Porque hay que pagar impuestos', 'b) Porque obliga a horas de trabajo que también cuestan', 'c) Porque se cobra en partes', 'd) Porque baja la cuota por aula'], a: 1 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saberse los términos', 'b) Tener la ficha impresa', 'c) Haber leído el módulo entero', 'd) Decir de memoria cuántas aulas hacen falta para no perder'], a: 3 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'El costo que se paga aunque no pase nada es el costo ___.', a: 'fijo' },
  { q: 'El costo que sube con cada unidad es el costo ___.', a: 'variable' },
  { q: 'Precio menos costo por unidad es el ___.', a: 'margen' },
  { q: 'Fijos entre margen da el punto de ___.', a: 'equilibrio' },
  { q: 'Lo que se deja de hacer por otra cosa es el costo de ___.', a: 'oportunidad' },
  { q: 'El dinero se reparte en ___ el día que entra.', a: 'sobres' },
  { q: 'Lo gratis se anota con su ___ de mercado entre paréntesis.', a: 'precio' },
  { q: 'Atender el doble sin que cueste el doble es ___.', a: 'escalar' },
  { q: 'En esta casa la hora se valora en ___ lempiras.', a: '100' },
  { q: 'Los fijos de M.E.T.A.S son unos ___ lempiras al mes.', a: '750' },
  { q: 'Con margen de 100 por aula hacen falta ___ aulas para no perder.', a: 'ocho' },
  { q: 'Una impresora de 4.500 que ahorra 2 por ficha se paga en ___ fichas.', a: '2250' },
  { q: 'El tiempo que tarda una compra en pagarse sola es el plazo de ___.', a: 'retorno' },
  { q: 'De los fijos no se saca ___.', a: 'nunca' },
  { q: 'Un proyecto familiar se muere por ___, no de golpe.', a: 'goteo' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Costo fijo', def: 'Se paga aunque no se entregue nada' },
  { term: 'Costo variable', def: 'Sube con cada unidad entregada' },
  { term: 'Costo de la hora', def: 'El precio del propio tiempo, aunque no se cobre' },
  { term: 'Costo de oportunidad', def: 'Lo que se deja de hacer por hacer otra cosa' },
  { term: 'Costo por unidad', def: 'Variables más horas, por cada cosa entregada' },
  { term: 'Margen', def: 'Precio menos costo por unidad' },
  { term: 'Punto de equilibrio', def: 'Fijos entre margen: cuántas para no perder' },
  { term: 'Sobre del mes', def: 'Repartir el dinero el día que entra' },
  { term: 'Ingreso recurrente', def: 'El que vuelve solo cada mes' },
  { term: 'Ingreso único', def: 'El que llega una vez y no se repite' },
  { term: 'Plazo de retorno', def: 'En cuánto tiempo se paga sola una compra' },
  { term: 'Escalar', def: 'Atender el doble sin que cueste el doble' },
  { term: 'Fijo aplazado', def: 'Lo gratis de hoy que algún día se cobrará' },
  { term: 'Muerte por goteo', def: 'El mes que no alcanzó y lo pagó la casa' },
  { term: 'La hoja que salió mal', def: 'El costo que siempre existe y nadie apunta' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Se propone cobrar 150 lempiras al mes por aula. Los fijos del mes son 750 y cada aula come media hora de acompañamiento, con la hora valorada en 100.' },
  { txt: 'Comprar una impresora de 4.500 lempiras ahorraría unos 2 lempiras por ficha frente a mandarlas a imprimir fuera. Hoy se imprimen unas cuarenta fichas al mes.' },
  { txt: 'Una maestra pide treinta fichas impresas. La cuenta rápida dice «papel y tinta». La ficha tiene diez páginas y la revisión final toma veinte minutos.' },
  { txt: 'Un taller para ocho maestros a 800 lempiras cada uno. Se gastan 900 en pasajes, refrigerio y copias, y se meten seis horas de taller más ocho de preparación.' },
  { txt: 'Se propone poner anuncios en el APK para tener ingresos sin cobrarle a nadie. Con el tráfico de hoy la publicidad daría unas decenas de lempiras al mes.' },
  { txt: 'El sitio y la base de datos están hoy en planes gratuitos, así que el fijo de infraestructura del proyecto es casi cero.' },
  { txt: 'Un negocio ofrece 8.000 lempiras por su logo en las fichas del año. El trato implicaría rediseñar portadas, mandar reportes y atender reuniones: unas quince horas.' },
  { txt: 'El proyecto lleva cientos de horas de trabajo y ninguna aparece en ninguna cuenta, porque nadie las paga.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué costos faltan en la cuenta tal como está planteada?',
  '2. Calcula el costo por unidad o el total real, con los números que tengas.',
  '3. ¿Cuántas unidades hacen falta para no perder, o en cuánto tiempo se recupera?',
  '4. Escribe en 3-4 frases qué decidirías y con qué condición.',
]);

B.critCaseGuides = JSON.stringify([
  'Lo que casi siempre falta son las horas, las hojas que salen mal, el traslado y lo que hoy es gratis y algún día no lo será. Un costo que no se apunta lo paga alguien, y en un proyecto familiar lo paga la casa.',
  'La cuenta se hace con el juego de números de la casa: fijos 750 al mes, hora a 100, cuota por aula 150 con media hora de soporte, o sea margen de 100 por aula.',
  'El equilibrio es fijos entre margen, nunca fijos entre precio. Para una compra, el plazo de retorno se compara con la vida esperada del proyecto: si tarda cinco años en pagarse, la pregunta es si va a haber cinco años.',
  'Casi ninguna oferta se acepta o se rechaza completa: se acepta con condiciones, y la condición sale del número, no del entusiasmo.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Cinco aulas y ya cubrimos los fijos, con eso arrancamos".', g1: 'Esa cuenta divide 750 entre 150 y supone que atender un aula no cuesta nada, cuando cada una come media hora de acompañamiento al mes.', g2: 'Con el soporte contado, el margen es 100 y no 150: el equilibrio son ocho aulas. El equilibrio se calcula con el margen, nunca con el precio.' },
  { txt: '"Imprimir treinta fichas sale casi gratis, es solo papel y tinta".', g1: 'Faltan las hojas que salen mal, el viaje a sacar copias y los veinte minutos de revisión de cada ficha, que a 100 la hora son 33 lempiras.', g2: 'El costo por ficha ronda los 56 lempiras y el dominante es el tiempo. Por eso automatizar la revisión vale más que ahorrar en papel.' },
  { txt: '"El taller dejó 5.500 lempiras limpios".', g1: 'Limpios de gastos en efectivo, sí, pero no de horas: seis de taller y ocho de preparación son catorce, o sea 1.400 lempiras.', g2: 'El margen real es 4.100. Sigue siendo bueno, y aun así conviene saber que es la mitad de lo que parecía, porque con eso se compara contra otras formas de usar el mismo sábado.' },
  { txt: '"El hospedaje es gratis, así que ahí no hay nada que presupuestar".', g1: 'Gratis no es un precio, es un precio aplazado. El día que empiece a cobrarse, el fijo mensual sube y el punto de equilibrio sube con él.', g2: 'Se anota como fijo con su precio de mercado entre paréntesis, para que ese día ya se sepa cuántas aulas hacen falta y no haya que decidir con prisa.' },
  { txt: '"Con los 8.000 del patrocinio cubrimos casi un año de dominio".', g1: 'El ingreso no es 8.000 si obliga a quince horas de trabajo: a 100 la hora eso son 1.500, así que quedan 6.500.', g2: 'Y llega una sola vez. La pregunta correcta no es cuánto dan, es cuánto queda por hora invertida, y con eso se comparan ofertas que parecían muy distintas.' },
  { txt: '"Sacamos del sobre de fijos para comprar el equipo, después reponemos".', g1: 'De los fijos no se saca nunca: es lo que apaga el dominio en marzo y deja el sitio caído sin que nadie lo haya decidido.', g2: 'El equipo sale del sobre de reinversión, y solo con lo que haya sobrado después de apartar fijos, variables y ahorro.' },
]);

B.critDecisionBank = JSON.stringify([
  'Cuota de 150 por aula con fijos de 750 y media hora de soporte por aula: ¿cuántas aulas hacen falta para no perder?',
  'Impresora de 4.500 que ahorra 2 por ficha, con cuarenta fichas al mes: ¿conviene comprarla y con qué condición?',
  'Treinta fichas impresas «de regalo»: ¿cuánto cuestan de verdad y qué se responde?',
  'Taller de ocho maestros a 800 con 900 de gastos y catorce horas: ¿cuánto deja por hora y con qué se compara?',
  'Anuncios en el APK con el tráfico de hoy: ¿cubren siquiera el dominio, y qué cuestan además del dinero?',
  'Hospedaje y base de datos hoy gratis: ¿cómo se anotan en el presupuesto y por qué?',
  'Patrocinio de 8.000 que obliga a quince horas de trabajo: ¿cuánto queda por hora invertida?',
  'Cientos de horas del proyecto sin precio: ¿qué número se elige y para qué sirve tenerlo?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Pasar una tarde escribiendo la herramienta que revisa las fichas sola.', b: 'Pasar esa misma tarde revisando treinta fichas a mano.', ga: 'Caso A: cuesta cuatro horas una vez y baja el costo por unidad de todas las fichas que vengan después.', gb: 'Caso B: cuesta las mismas cuatro horas y hay que volver a pagarlas la próxima vez que haya treinta fichas.' },
  { a: 'Cobrar 150 por aula sabiendo que el equilibrio son ocho aulas.', b: 'Cobrar 150 por aula creyendo que el equilibrio son cinco.', ga: 'Caso A: se sabe a partir de qué aula deja de ser trabajo regalado y se puede decidir cuándo parar de crecer.', gb: 'Caso B: se anuncia la cuota, llegan seis aulas y el mes sigue saliendo del bolsillo de la casa sin que nadie entienda por qué.' },
  { a: 'Un taller de 4.100 de margen real un sábado.', b: 'Cuatro aulas nuevas a 100 de margen cada mes.', ga: 'Caso A: entra rápido y no vuelve; sirve para financiar lo que sí se repite.', gb: 'Caso B: entra despacio y vuelve solo todos los meses, y no cuesta un sábado cada vez.' },
  { a: 'Anotar el hospedaje gratis con su precio entre paréntesis.', b: 'Dejarlo fuera del presupuesto porque hoy no cuesta.', ga: 'Caso A: el día de la factura ya se sabe cuántas aulas hacen falta y no hay decisión con prisa.', gb: 'Caso B: el fijo sube de golpe, el equilibrio se mueve y hay que decidir con la factura encima.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se calcula el equilibrio dividiendo los fijos entre el precio.', guide: 'Sale un número más bonito y más falso: el equilibrio se calcula con el margen, que es el precio menos lo que cuesta atender esa unidad.' },
  { cause: 'No se le pone precio a la hora del que hace el trabajo.', guide: 'Todo parece rentable y ninguna decisión se puede comparar. La hora es el gasto más grande del proyecto y el único invisible.' },
  { cause: 'Se deja fuera del presupuesto lo que hoy es gratis.', guide: 'El día que empiece a cobrarse, el fijo sube y el equilibrio se mueve de golpe, justo cuando hay menos margen para reaccionar.' },
  { cause: 'Se saca del sobre de fijos para una compra.', guide: 'Se siente inteligente y es lo que apaga el dominio en marzo. De los fijos no se saca nunca.' },
  { cause: 'Se acepta un ingreso sin contar las horas que obliga.', guide: 'El ingreso real baja y se compara mal con otras ofertas. La pregunta es cuánto queda por hora invertida.' },
  { cause: 'Se crece con servicios que no escalan.', guide: 'Cada cliente nuevo cuesta las mismas horas que el anterior, así que el trabajo crece igual que el ingreso y el proyecto se atasca en una persona.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Con nueve aulas el mes dejó de salir del bolsillo de la casa.', guide: 'El equilibrio estaba bien calculado, con el margen y no con el precio, así que el número sirvió para saber cuándo parar de preocuparse.' },
  { effect: 'La herramienta de revisión bajó el costo de cada ficha a la mitad.', guide: 'Se cambió tiempo por unidad por tiempo una sola vez. Es la única forma de crecer sin que crezcan las horas.' },
  { effect: 'Llegó la factura del hospedaje y ya estaba prevista.', guide: 'Estaba anotado como fijo con su precio entre paréntesis, así que no hubo que decidir con prisa ni recortar de donde no se debe.' },
  { effect: 'Se dijo que no a un patrocinio que parecía muy bueno.', guide: 'Al calcular lo que quedaba por hora invertida, la oferta bajaba de categoría. El número decidió, no el entusiasmo.' },
  { effect: 'El sobre de fijos llegó completo a fin de año.', guide: 'Nunca se sacó de ahí. Es la regla más aburrida del método y la que evita la muerte por goteo.' },
  { effect: 'Se cobró por el taller sabiendo exactamente cuánto dejaba por hora.', guide: 'Con ese dato se pudo comparar contra otras formas de usar el mismo sábado, que es justo para lo que sirve el precio de la hora.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '💵', label: 'El ingreso', text: 'Lo que entra, y de dónde. <strong>Se mide:</strong> por mes y por origen. <strong>Se esconde:</strong> cuando se cuenta un ingreso único como si volviera cada mes. <strong>En M.E.T.A.S:</strong> cuota por aula (vuelve) contra taller o patrocinio (no vuelven).' },
  { y: '2', icon: '🏠', label: 'El costo fijo', text: 'Lo que se paga <strong>aunque no pase nada</strong>. <strong>Se mide:</strong> sumando el mes completo. <strong>Se esconde:</strong> en lo que hoy es gratis. <strong>En M.E.T.A.S:</strong> unos 750 al mes entre dominio, datos y reserva de impresión.' },
  { y: '3', icon: '📄', label: 'El costo variable', text: 'Lo que sube <strong>con cada unidad</strong>. <strong>Se mide:</strong> por unidad, no por mes. <strong>Se esconde:</strong> en las hojas que salen mal y en el traslado. <strong>En M.E.T.A.S:</strong> unos 20 de papel y tinta por ficha de diez páginas.' },
  { y: '4', icon: '⏳', label: 'El costo de la hora', text: 'El precio del <strong>propio tiempo</strong>. <strong>Se mide:</strong> eligiendo un número y usándolo siempre. <strong>Se esconde:</strong> en todas partes, porque nadie lo factura. <strong>En M.E.T.A.S:</strong> 100 lempiras la hora.' },
  { y: '5', icon: '🧮', label: 'El costo por unidad', text: 'Variables <strong>más horas</strong>, por cada cosa entregada. <strong>Se mide:</strong> con cronómetro, una vez. <strong>Se esconde:</strong> cuando solo se cuenta lo que se pagó en efectivo. <strong>En M.E.T.A.S:</strong> una ficha impresa cuesta unos 56, no 20.' },
  { y: '6', icon: '📈', label: 'El margen', text: 'Precio <strong>menos</strong> costo por unidad. <strong>Se mide:</strong> por unidad vendida. <strong>Se esconde:</strong> cuando se confunde con el precio. <strong>En M.E.T.A.S:</strong> un aula a 150 con media hora de soporte deja 100.' },
  { y: '7', icon: '⚖️', label: 'El punto de equilibrio', text: 'Fijos <strong>entre</strong> margen. <strong>Se mide:</strong> en unidades, no en dinero. <strong>Se esconde:</strong> cuando se divide entre el precio y sale más bajo de lo real. <strong>En M.E.T.A.S:</strong> 750 entre 100 son ocho aulas.' },
]);

B.parteData = JSON.stringify({
  fijos: {
    nombre: 'Los costos fijos', icon: '🏠',
    estructura: { title: 'Qué es', info: '• Lo que se paga <strong>aunque no pase nada</strong><br>• No sube al atender más aulas ni al imprimir más fichas<br>• Cada unidad nueva lo abarata, y por eso el volumen lo cubre' },
    funcion: { title: 'Cómo se calcula', info: '• Se listan todos los pagos del mes, uno por uno<br>• Se incluye <strong>lo que hoy es gratis</strong>, con su precio entre paréntesis<br>• Se suma y ese número no se vuelve a discutir cada mes' },
    enfermedades: { title: 'Dónde se esconde', info: '• En los planes gratuitos de hospedaje y base de datos<br>• En los datos del teléfono, que se pagan igual y nadie apunta<br>• En la reserva de impresión, que se gasta sin registrarse' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• Dominio: unos <strong>250 al mes</strong><br>• Datos del teléfono: unos <strong>350</strong><br>• Reserva de impresión: unos <strong>150</strong><br>• Total: <strong>750 lempiras al mes</strong>' },
  },
  variables: {
    nombre: 'Los costos variables', icon: '📄',
    estructura: { title: 'Qué es', info: '• Lo que sube <strong>con cada unidad</strong> entregada<br>• Crecer no lo abarata: lo multiplica<br>• Es el que decide si el precio de una unidad deja algo' },
    funcion: { title: 'Cómo se calcula', info: '• Se mide sobre <strong>una sola unidad</strong>, no sobre el mes<br>• Se incluye lo que sale mal, estimado por arriba<br>• Se incluye el traslado, que casi nunca se apunta' },
    enfermedades: { title: 'Dónde se esconde', info: '• En las hojas que se imprimieron torcidas<br>• En el viaje a sacar copias, que cuesta pasaje y una hora<br>• En el refrigerio y los materiales de cada taller' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• Ficha de diez páginas: unos <strong>20 de papel y tinta</strong><br>• Hojas malas y traslado: unos <strong>3 más</strong> por ficha<br>• Taller: unos <strong>900</strong> entre pasajes, refrigerio y copias' },
  },
  hora: {
    nombre: 'El costo de la hora', icon: '⏳',
    estructura: { title: 'Qué es', info: '• El precio que se le pone al <strong>propio tiempo</strong><br>• No significa cobrarlo: significa poder comparar<br>• Es el gasto más grande del proyecto y el único invisible' },
    funcion: { title: 'Cómo se calcula', info: '• Se elige <strong>un número y se usa siempre</strong>, aunque incomode<br>• Se apuntan las horas reales durante dos semanas<br>• Se multiplican horas por precio, y ya es un costo como otro' },
    enfermedades: { title: 'Dónde se esconde', info: '• En «total, lo hago yo»<br>• En las tardes de soporte que no se apuntan en ningún lado<br>• En el costo de oportunidad: lo que no se hizo por hacer esto' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• Precio de la hora: <strong>100 lempiras</strong><br>• Revisión de una ficha: 20 minutos = <strong>33</strong><br>• Soporte por aula: media hora al mes = <strong>50</strong><br>• Preparar un taller: 8 horas = <strong>800</strong>' },
  },
  equilibrio: {
    nombre: 'El punto de equilibrio', icon: '⚖️',
    estructura: { title: 'Qué es', info: '• <strong>Cuántas unidades</strong> hacen falta para no perder<br>• Se dice en aulas, fichas o talleres, nunca en dinero<br>• Es la única cifra que hay que saber de memoria' },
    funcion: { title: 'Cómo se calcula', info: '• Fijos <strong>entre margen</strong>, nunca entre precio<br>• El margen es el precio menos lo que cuesta atender esa unidad<br>• Si el resultado no es entero, se redondea hacia arriba' },
    enfermedades: { title: 'Dónde se esconde', info: '• Cuando se divide entre el precio y sale un número más bonito<br>• Cuando sube sin avisar porque empezó a cobrarse algo gratis<br>• Cuando se promete un servicio nuevo que come horas de todos' },
    cuidados: { title: 'Los números de M.E.T.A.S', info: '• Fijos: <strong>750</strong> · Cuota por aula: <strong>150</strong><br>• Soporte por aula: media hora = <strong>50</strong><br>• Margen por aula: <strong>100</strong><br>• Equilibrio: 750 / 100 = <strong>8 aulas</strong>' },
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

const textos = [
  [/🪞 \*Ruta de la Persuasión · Etapa 2\* 🪞/g, '🧾 *Ruta del Poder · Etapa 2* 🧾'],
  [/Los ocho sesgos que deciden por ti antes de que llegue nadie, y la hoja para decidir en frío\. 🪞/g, 'A dónde se va el dinero y la hora: costo por unidad, margen y punto de equilibrio, con las ocho cuentas del proyecto. 🧾'],
  [/_Incluye evaluación conceptual y la sala de espejos\._ ✍️/g, '_Incluye evaluación conceptual y la cuenta sobre la mesa._ ✍️'],
  [/Ruta de la Persuasión · Etapa 2: Sesgos, los atajos que deciden por ti/g, 'Ruta del Poder · Etapa 2: El presupuesto real'],
  [/La sala de espejos/g, 'La cuenta sobre la mesa'],
  [/la sala de espejos/g, 'la cuenta sobre la mesa'],
  [/Sesgos, los atajos que deciden por ti/g, 'El presupuesto real'],
  [/los atajos que deciden por ti/g, 'el presupuesto real'],
  [/Ruta de la Persuasión/g, 'Ruta del Poder'],
  [/mapa de los sesgos/g, 'mapa del presupuesto'],
  [/🪞 ¡/g, '🧾 ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');

/* ---------- dos cifras del HTML que no cuadraban ---------- */
let html = fs.readFileSync(HTML, 'utf8');
let arreglos = 0;
const fix = (a, b) => { if (html.includes(a)) { html = html.replace(a, b); arreglos++; } else console.log('HTML sin cambiar: ' + a.slice(0, 40)); };

fix('750 entre 150 son <span class="hl">cinco aulas</span> solo para cubrir los fijos. Pero si además se quiere pagar una hora de trabajo a 100 lempiras, y el acompañamiento come cuatro horas al mes, hacen falta <span class="hl2">nueve aulas</span>, no cinco.',
    '750 entre 150 son <span class="hl">cinco aulas</span>, pero esa cuenta supone que atender un aula no cuesta nada. Cada una come media hora de acompañamiento al mes, y a 100 la hora eso son 50: el margen real es 100, no 150. El equilibrio es 750 entre 100, o sea <span class="hl2">ocho aulas</span>.');
fix('La cuenta rápida dice «papel y tinta, dos lempiras». La cuenta completa dice otra cosa.',
    'La cuenta rápida dice «papel y tinta, unos veinte lempiras». La cuenta completa dice otra cosa.');
fix('<span>Diez páginas de papel y tinta, más <span class="hl">las hojas que salen mal</span>',
    '<span>Veinte lempiras de papel y tinta, más <span class="hl">las hojas que salen mal</span>');

fs.writeFileSync(HTML, html, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
console.log('Cifras cuadradas en el HTML: ' + arreglos);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
