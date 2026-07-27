/* Inyecta los bancos de la misión «Normas y trámites: qué papel hace falta y
   quién lo emite» (Ruta del Poder Político, etapa 2) sobre el molde copiado de
   la etapa 1 de esa misma ruta.
   Uso:  node _dev/inyecta-bancos-politica.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-politica-normas-tramites', 'js', 'normas-tramites.js');

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
B.SAVE_KEY = `'faro_pol_tramites_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de normas y trámites superado' },
  flash_master: { icon: '🃏', label: 'Todos los tipos de papel explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de norma y costumbre experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del trámite maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de los trámites' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta del Poder Político completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Lo hace primero y pregunta después 🙈' },
  { t: 25, n: 'Pregunta qué papel hace falta 🙋' },
  { t: 55, n: 'Sabe quién emite cada papel 🏢' },
  { t: 90, n: 'Distingue norma de costumbre 📖' },
  { t: 130, n: 'Le pone vigencia a todo ⏳' },
  { t: 165, n: 'Guarda copia sellada de todo 🗄️' },
  { t: 190, n: 'Tiene el expediente listo antes 📜' },
]);

B.fcData = JSON.stringify([
  { w: 'Trámite', a: '📜 La serie de pasos para conseguir un papel que <strong>autoriza o prueba</strong> algo. Se pregunta primero y se hace después: al revés se pierde el trabajo entero.' },
  { w: 'Requisito escrito', a: '📖 Lo que se exige y está en <strong>un documento que alguien puede enseñar</strong>. Se cumple sin discutir, y se puede leer antes de ir a la ventanilla.' },
  { w: 'Costumbre de oficina', a: '🗣️ Lo que siempre se ha hecho ahí y <strong>nadie puede enseñar por escrito</strong>. Se cumple igual, pero se anota quién lo pidió y cuándo, porque el año que viene puede no pedirlo nadie.' },
  { w: 'Permiso', a: '🔓 El papel que <strong>deja hacer algo concreto</strong>, en un lugar y por un tiempo. Si no dice qué, dónde y hasta cuándo, no es un permiso: es una buena intención.' },
  { w: 'Constancia', a: '🧾 El papel que <strong>prueba que algo pasó</strong>, con fecha y con el nombre de quien lo emite. Lo que no se puede demostrar no se pone en una constancia.' },
  { w: 'Aval', a: '🛡️ El papel con el que una autoridad <strong>respalda a alguien ante otros</strong>. Abre varias puertas de una vez, y pedido a destiempo cierra las de abajo.' },
  { w: 'Carta de entendimiento', a: '🤝 Dos partes escriben qué va a hacer cada una, <strong>sin dinero de por medio</strong>. Su parte más útil es la que dice <strong>qué no incluye</strong>.' },
  { w: 'Convenio', a: '📑 El acuerdo que <strong>obliga a las dos partes</strong>. Por eso se lee dos veces y se firma en frío, nunca con alguien enfrente esperando.' },
  { w: 'Recibo', a: '💵 El papel que prueba que se pagó: <strong>monto, fecha y a nombre de quién</strong>. Se numera desde el primero, que es justo el que siempre parece que no hace falta.' },
  { w: 'Emisor', a: '🏢 La oficina que firma y sella, que <strong>casi nunca es quien atiende</strong>. La persona cambia de escritorio en marzo; la oficina sigue emitiendo.' },
  { w: 'Vigencia', a: '📅 <strong>Desde cuándo y hasta cuándo</strong> vale un papel. El que no la trae, hay que preguntar por qué no la trae: un papel sin fecha es una foto vieja.' },
  { w: 'Sello', a: '🔖 La marca de la oficina, que dice que el papel <strong>pasó por ahí de verdad</strong>. Es lo que separa una copia entregada de una copia guardada en la casa.' },
  { w: 'Copia sellada (acuse)', a: '🗄️ La copia de lo que uno entregó, <strong>con sello, firma y fecha de quien recibió</strong>. Vale más que la promesa de quien lo recibió, y es el único trámite que no se puede rehacer.' },
  { w: 'Correo de confirmación', a: '📧 El resumen escrito de lo hablado, <strong>mandado el mismo día</strong>. No es un papel oficial, no lo pide nadie y muchas veces es la única prueba que queda.' },
  { w: 'Expediente del proyecto', a: '📂 La carpeta con los papeles <strong>listos antes de que los pidan</strong>. Quien los tiene entra; quien los va a buscar pierde el año escolar.' },
  { w: 'Autoría', a: '✍️ Quién hizo el material y con qué nombre circula. Se cede el <strong>uso</strong>, acotado en tiempo y en alcance; <strong>la autoría no se cede nunca</strong>.' },
]);

B.qzData = JSON.stringify([
  { q: 'Una directora dice de palabra que sí a usar las misiones en dos secciones. Imprimir las 120 fichas cuesta 480 lempiras. ¿Qué se hace primero?', o: ['a) Imprimir: el sí de la directora es la autorización', 'b) Pedirle tres líneas por escrito con las secciones y el horario', 'c) Esperar a que el distrito emita un aval', 'd) Imprimir la mitad y ver qué pasa'], c: 1 },
  { q: 'Un empleado pide un requisito que no aparece en ningún documento. ¿Qué se le pregunta?', o: ['a) «¿Está usted seguro de que eso se pide?»', 'b) «¿Con quién puedo hablar arriba de usted?»', 'c) «¿Dónde puedo leerlo?»', 'd) «¿Y si esta vez lo dejamos pasar?»'], c: 2 },
  { q: 'Catorce centros del mismo distrito quieren el material. ¿Cuándo se pide el aval de arriba?', o: ['a) Antes que nada, para llegar a los centros con papel en la mano', 'b) Solo si algún director se niega', 'c) Nunca: se hace centro por centro y ya', 'd) Después de haber hablado con dos o tres directores'], c: 3 },
  { q: 'Una ferretería aporta 8.000 lempiras y pide una constancia para su contabilidad. ¿Qué se pregunta antes de firmarla?', o: ['a) En qué forma necesita el papel quien lo pide, porque de eso depende si le sirve', 'b) Si se puede poner un monto redondo para que quede mejor', 'c) Si conviene emitirla a nombre de alguien conocido', 'd) Si hace falta esperar a que termine el año'], c: 0 },
  { q: 'El primer centro pregunta a nombre de quién hace el cheque de los 150 lempiras del mes. ¿Qué se hace?', o: ['a) Se da el nombre propio y se resuelve después', 'b) Se constituye una organización antes de cobrar nada', 'c) Se pregunta en el centro con qué documento pueden pagar', 'd) Se cobra en efectivo para no complicarse'], c: 2 },
  { q: 'Una institución quiere imprimir 5.000 ejemplares de las fichas. ¿Cuándo se escribe lo de la autoría?', o: ['a) Cuando salga la primera impresión, para ver cómo queda el crédito', 'b) Si algún día aparece un problema', 'c) Al final, junto con el informe de cierre', 'd) Antes de entregar el archivo, porque después no hay con qué negociar'], c: 3 },
  { q: 'Una ONG entrega quince tabletas valoradas en 90.000 lempiras y no hay dinero de por medio. ¿Qué papel corresponde?', o: ['a) Un convenio, porque el monto es alto', 'b) Una carta de entendimiento que diga también qué no incluye', 'c) Un recibo por el valor de las tabletas', 'd) Ninguno: basta con el correo de la ONG'], c: 1 },
  { q: 'Hay una foto buenísima de treinta niños usando las misiones y ningún papel firmado. ¿Qué se publica hoy?', o: ['a) La foto de las manos y la pantalla, que cumple lo mismo', 'b) La foto completa, porque la maestra dio permiso', 'c) La foto con las caras borrosas', 'd) La foto, y se piden los permisos después'], c: 0 },
  { q: 'Se entregó la solicitud en ventanilla y no quisieron sellar la copia. ¿Qué se hace el mismo día?', o: ['a) Nada: ya quedó entregada y había testigos', 'b) Volver al día siguiente a exigir el sello', 'c) Mandar un correo resumiendo qué se entregó, a quién y cuándo', 'd) Guardar una foto del sobre cerrado'], c: 2 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saberse de memoria los siete tipos de papel', 'b) Tener un archivador con muchas copias', 'c) Conocer a alguien en cada oficina', 'd) Poder decir de cada papel quién lo emite, hasta cuándo vale y dónde está la copia'], c: 3 },
]);

B.classGroups = JSON.stringify([
  { label: ['Escrito', 'Costumbre'], headA: '📜 Está escrito', headB: '🗣️ Es costumbre', colA: 'ok', colB: 'no',
    words: [{ w: 'Copia de la identidad del solicitante', t: 'ok' }, { w: 'Que la carta venga en letra de molde', t: 'no' },
      { w: 'El formato de solicitud que entrega la oficina', t: 'ok' }, { w: 'Tres copias de todo, por si acaso', t: 'no' },
      { w: 'La lista de centros donde se va a trabajar', t: 'ok' }, { w: 'Que el aval lo firmen el mismo día', t: 'no' },
      { w: 'La solicitud dirigida al cargo que firma', t: 'ok' }, { w: 'Que vaya a nombre del titular de ahora', t: 'no' }] },
  { label: ['Permiso', 'Constancia'], headA: '🔓 Deja hacer algo', headB: '🧾 Prueba que pasó', colA: 'ok', colB: 'no',
    words: [{ w: 'Usar las misiones en dos secciones de sexto', t: 'ok' }, { w: 'Que la ferretería aportó 8.000 lempiras', t: 'no' },
      { w: 'Dar un taller de dos horas a las maestras', t: 'ok' }, { w: 'Que el taller se dio el 14 de marzo', t: 'no' },
      { w: 'Publicar la foto de una sección', t: 'ok' }, { w: 'Que se entregaron 150 fichas al centro', t: 'no' },
      { w: 'Entrar al centro un sábado por la mañana', t: 'ok' }, { w: 'Que el centro pagó los 3.000 del mes', t: 'no' }] },
  { label: ['Lo emite otro', 'Lo emite uno'], headA: '🏢 Lo emite una institución', headB: '✍️ Lo emite el proyecto', colA: 'ok', colB: 'no',
    words: [{ w: 'El permiso de uso en aula', t: 'ok' }, { w: 'La constancia para el patrocinador', t: 'no' },
      { w: 'El aval del distrito para varios centros', t: 'ok' }, { w: 'El recibo del cobro mensual', t: 'no' },
      { w: 'El sello en la copia de la solicitud', t: 'ok' }, { w: 'El correo de confirmación de la reunión', t: 'no' },
      { w: 'El permiso de foto que da cada familia', t: 'ok' }, { w: 'La carta que dice qué material se entrega', t: 'no' }] },
  { label: ['Prueba', 'No prueba'], headA: '✅ Prueba de verdad', headB: '💨 No prueba nada', colA: 'ok', colB: 'no',
    words: [{ w: 'La copia sellada de lo entregado', t: 'ok' }, { w: 'El «ya quedamos» al salir de la reunión', t: 'no' },
      { w: 'El correo del mismo día con lo acordado', t: 'ok' }, { w: 'La llamada en la que dijeron que sí', t: 'no' },
      { w: 'El recibo numerado, con fecha y monto', t: 'ok' }, { w: 'La foto del sobre antes de entregarlo', t: 'no' },
      { w: 'La constancia firmada por quien la emite', t: 'ok' }, { w: 'Que había tres testigos en la sala', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['El', 'emisor', 'es', 'una', 'oficina,', 'no', 'una', 'persona.'], c: 1, art: 'El que firma y sella el papel' },
  { s: ['Todo', 'papel', 'nace', 'con', 'vigencia', 'escrita.'], c: 4, art: 'Desde cuándo y hasta cuándo vale' },
  { s: ['Nadie', 'puede', 'enseñar', 'por', 'escrito', 'una', 'costumbre.'], c: 6, art: 'Lo que siempre se ha hecho ahí' },
  { s: ['Un', 'permiso', 'deja', 'hacer', 'algo', 'concreto.'], c: 1, art: 'El papel que autoriza' },
  { s: ['Lo', 'que', 'ya', 'pasó', 'se', 'prueba', 'con', 'una', 'constancia.'], c: 8, art: 'El papel que demuestra' },
  { s: ['Sin', 'acuse', 'sellado', 'no', 'hay', 'nada', 'que', 'reclamar.'], c: 1, art: 'La copia con sello y fecha' },
  { s: ['El', 'aval', 'de', 'arriba', 'autoriza', 'y', 'no', 'obliga.'], c: 1, art: 'El respaldo que abre varias puertas' },
  { s: ['El', 'expediente', 'se', 'arma', 'antes', 'de', 'que', 'lo', 'pidan.'], c: 1, art: 'La carpeta lista de antemano' },
]);

B.cmpData = JSON.stringify([
  { s: 'La oficina que firma y sella el papel es el ___.', opts: ['emisor', 'testigo', 'solicitante'], c: 0 },
  { s: 'Lo que se exige y está en un documento que alguien puede enseñar es un requisito ___.', opts: ['antiguo', 'escrito', 'urgente'], c: 1 },
  { s: 'El papel que deja hacer algo concreto es el ___.', opts: ['recibo', 'aval', 'permiso'], c: 2 },
  { s: 'El papel que prueba que algo ya pasó es la ___.', opts: ['constancia', 'solicitud', 'carta'], c: 0 },
  { s: 'Desde cuándo y hasta cuándo vale un papel es su ___.', opts: ['formato', 'vigencia', 'sello'], c: 1 },
  { s: 'La copia con sello y fecha de quien recibió se llama ___.', opts: ['borrador', 'duplicado', 'acuse'], c: 2 },
  { s: 'Lo que siempre se ha hecho en esa oficina y nadie enseña por escrito es ___.', opts: ['costumbre', 'norma', 'reglamento'], c: 0 },
  { s: 'De las fichas se cede el uso; lo que no se cede nunca es la ___.', opts: ['portada', 'autoría', 'fecha'], c: 1 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Escrito', 'Costumbre'], btnA: '📜 Escrito', btnB: '🗣️ Costumbre', colA: 'ok', colB: 'no',
    words: [{ w: 'Copia de la identidad', t: 'ok' }, { w: 'Letra de molde en la carta', t: 'no' },
      { w: 'El formato que da la oficina', t: 'ok' }, { w: 'Tres copias por si acaso', t: 'no' },
      { w: 'La lista de centros', t: 'ok' }, { w: 'Que lo firmen el mismo día', t: 'no' },
      { w: 'Dirigirla al cargo que firma', t: 'ok' }, { w: 'Dirigirla al nombre del titular', t: 'no' },
      { w: 'El requisito que está en el reglamento del centro', t: 'ok' }, { w: 'Entregarla solo los martes', t: 'no' }] },
  { label: ['Permiso', 'Constancia'], btnA: '🔓 Permiso', btnB: '🧾 Constancia', colA: 'ok', colB: 'no',
    words: [{ w: 'Usar las misiones en dos secciones', t: 'ok' }, { w: 'La ferretería aportó 8.000 lempiras', t: 'no' },
      { w: 'Dar un taller a las maestras', t: 'ok' }, { w: 'El taller se dio el 14 de marzo', t: 'no' },
      { w: 'Publicar la foto de la sección', t: 'ok' }, { w: 'Se entregaron 150 fichas', t: 'no' },
      { w: 'Entrar al centro un sábado', t: 'ok' }, { w: 'El centro pagó los 3.000 del mes', t: 'no' },
      { w: 'Instalar las tabletas en el aula', t: 'ok' }, { w: 'La ONG entregó quince tabletas', t: 'no' }] },
  { label: ['Prueba', 'No prueba'], btnA: '✅ Prueba', btnB: '💨 No prueba', colA: 'ok', colB: 'no',
    words: [{ w: 'Copia sellada de lo entregado', t: 'ok' }, { w: 'El «ya quedamos» al salir', t: 'no' },
      { w: 'Correo del mismo día con lo acordado', t: 'ok' }, { w: 'La llamada donde dijeron que sí', t: 'no' },
      { w: 'Recibo numerado con fecha', t: 'ok' }, { w: 'La foto del sobre cerrado', t: 'no' },
      { w: 'Constancia firmada y sellada', t: 'ok' }, { w: 'Que había testigos en la sala', t: 'no' },
      { w: 'Acta de la reunión con firmas', t: 'ok' }, { w: 'El «yo se lo arreglo» de un empleado', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se saca un papel de principio a fin', steps: ['Escribir en una línea qué acto concreto se quiere hacer', 'Preguntar qué papel hace falta y qué oficina lo emite', 'Pedir la lista completa de requisitos, por escrito', 'Presentar la solicitud y quedarse con la copia sellada', 'Anotar la fecha prometida y volver a preguntar antes de esa fecha', 'Guardar el papel con su vigencia y su recordatorio de renovación'] },
  { label: 'Cómo se arma el expediente del proyecto', steps: ['Listar todos los papeles que el proyecto ya necesitó alguna vez', 'Marcar cuáles ya se tienen y cuáles faltan', 'Averiguar quién emite cada uno de los que faltan', 'Sacar primero los que sirven para todo el año, en enero', 'Guardar cada copia en la carpeta del centro, con la fecha en el nombre'] },
  { label: 'Qué se escribe antes de entregar las fichas a una institución', steps: ['Decir qué material exactamente se entrega y en qué formato', 'Escribir para qué lo pueden usar y por cuánto tiempo', 'Escribir qué NO se cede: la autoría, la venta y el cambio de contenido', 'Acordar cómo aparece el crédito en cada ejemplar impreso', 'Firmar las dos partes y quedarse cada una con su copia'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'El acto concreto que se quiere hacer, escrito en una línea', ans: 'Qué se quiere hacer', opts: ['Qué se quiere hacer', 'Qué lo regula', 'Quién lo emite', 'Qué vigencia tiene'] },
  { desc: 'La respuesta a dónde está escrito ese requisito', ans: 'Qué lo regula', opts: ['Qué lo regula', 'Qué requisitos pide', 'Dónde queda la copia', 'Cuánto tarda y cuánto cuesta'] },
  { desc: 'La oficina cuyo cargo firma y sella el papel', ans: 'Quién lo emite', opts: ['Quién lo emite', 'Qué se quiere hacer', 'Qué vigencia tiene', 'Qué lo regula'] },
  { desc: 'La lista de lo que hay que llevar, pedida completa y por escrito', ans: 'Qué requisitos pide', opts: ['Qué requisitos pide', 'Quién lo emite', 'Dónde queda la copia', 'Qué se quiere hacer'] },
  { desc: 'Los días de espera y los lempiras que hay que poner', ans: 'Cuánto tarda y cuánto cuesta', opts: ['Cuánto tarda y cuánto cuesta', 'Qué vigencia tiene', 'Qué lo regula', 'Qué requisitos pide'] },
  { desc: 'La fecha en que el papel deja de servir', ans: 'Qué vigencia tiene', opts: ['Qué vigencia tiene', 'Cuánto tarda y cuánto cuesta', 'Dónde queda la copia', 'Quién lo emite'] },
  { desc: 'El sello y la fecha de quien recibió, guardados en la carpeta del centro', ans: 'Dónde queda la copia', opts: ['Dónde queda la copia', 'Qué requisitos pide', 'Qué lo regula', 'Qué se quiere hacer'] },
  { desc: 'La carpeta con los papeles listos antes de que los pidan', ans: 'El expediente del proyecto', opts: ['El expediente del proyecto', 'La hoja de seguimiento', 'Dónde queda la copia', 'Qué requisitos pide'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Usar las misiones en dos secciones de sexto, con el sí de palabra de la directora', func: 'Un permiso por escrito del centro, con las secciones y el horario', opts: ['Un permiso por escrito del centro, con las secciones y el horario', 'Un aval del distrito antes de pisar el centro', 'Una constancia firmada por el proyecto', 'Un convenio con la Secretaría'] },
  { trans: 'Justificar ante la ferretería los 8.000 lempiras que aportó', func: 'Una constancia del proyecto con fecha, monto y en qué se usó', opts: ['Una constancia del proyecto con fecha, monto y en qué se usó', 'Un recibo emitido por el centro educativo', 'Un permiso de la oficina del distrito', 'Una carta de entendimiento con la ferretería'] },
  { trans: 'Cobrar 150 lempiras al mes a un centro que paga con cheque', func: 'Un recibo numerado, y antes preguntar con qué documento pueden pagar', opts: ['Un recibo numerado, y antes preguntar con qué documento pueden pagar', 'Una constancia de donación al centro', 'Un aval del distrito para poder cobrar', 'Un convenio de tres años con el centro'] },
  { trans: 'Recibir quince tabletas de una ONG, sin dinero de por medio', func: 'Una carta de entendimiento que diga también qué no incluye', opts: ['Una carta de entendimiento que diga también qué no incluye', 'Un convenio que obligue a las dos partes', 'Un recibo por los 90.000 lempiras de las tabletas', 'Un permiso del patronato del centro'] },
  { trans: 'Publicar la foto de una sección de treinta niños', func: 'Un permiso por familia, para esa publicación y no para siempre', opts: ['Un permiso por familia, para esa publicación y no para siempre', 'El permiso de la maestra que tomó la foto', 'Una constancia del centro educativo', 'El aval del distrito para publicar'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Se esperaron tres semanas y la oficina nunca emitió nada', characteristic: 'Se le pidió el papel a quien solo puede recomendar, no emitir', opts: ['Se le pidió el papel a quien solo puede recomendar, no emitir', 'La oficina tenía demasiado trabajo', 'Faltó insistir por teléfono', 'El trámite era demasiado nuevo'] },
  { disease: 'Se imprimieron 300 fichas por 1.200 lempiras y el taller no se pudo dar', characteristic: 'Se imprimió antes de preguntar qué papel hacía falta', opts: ['Se imprimió antes de preguntar qué papel hacía falta', 'La imprenta se atrasó una semana', 'El director cambió de opinión', 'Las fichas salieron con errores'] },
  { disease: 'La solicitud se rehizo tres veces con letra de molde y siguió sin salir', characteristic: 'Se cumplió el invento de una persona como si fuera norma', opts: ['Se cumplió el invento de una persona como si fuera norma', 'La letra seguía sin gustarles', 'Faltaba una firma en la última hoja', 'El formato estaba vencido'] },
  { disease: 'El centro dice que nunca recibió la solicitud y no hay con qué contestar', characteristic: 'Se entregó sin quedarse con copia sellada ni mandar correo', opts: ['Se entregó sin quedarse con copia sellada ni mandar correo', 'El correo se fue a la carpeta de no deseados', 'La secretaria estaba de vacaciones', 'La solicitud iba mal dirigida'] },
  { disease: 'En septiembre el aval ya no servía y el taller se cayó', characteristic: 'Nadie apuntó la vigencia ni puso recordatorio de renovación', opts: ['Nadie apuntó la vigencia ni puso recordatorio de renovación', 'Cambiaron las reglas a mitad de año', 'El aval estaba mal redactado', 'El distrito perdió el expediente'] },
  { disease: 'Las fichas circulan impresas y sin el nombre de quien las hizo', characteristic: 'Se entregó el archivo sin escribir antes qué se cedía y qué no', opts: ['Se entregó el archivo sin escribir antes qué se cedía y qué no', 'La imprenta olvidó poner el crédito', 'El diseño no tenía espacio para el nombre', 'A nadie se le ocurrió preguntar por el autor'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'La oficina cuyo cargo firma y sella el papel.', type: 'Emisor' },
  { s: 'Desde cuándo y hasta cuándo vale un papel.', type: 'Vigencia' },
  { s: 'Deja hacer algo concreto, en un lugar y por un tiempo.', type: 'Permiso' },
  { s: 'Prueba que algo pasó, con fecha y con quien lo emite.', type: 'Constancia' },
  { s: 'Una autoridad respalda a alguien ante otros.', type: 'Aval' },
  { s: 'Dos partes escriben qué hace cada una, sin dinero de por medio.', type: 'Carta de entendimiento' },
  { s: 'Obliga a las dos partes y por eso se lee dos veces.', type: 'Convenio' },
  { s: 'Prueba que se pagó, con monto, fecha y a nombre de quién.', type: 'Recibo' },
  { s: 'La copia de lo entregado, con sello y fecha de quien recibió.', type: 'Acuse' },
  { s: 'El resumen de lo hablado, mandado el mismo día.', type: 'Correo de confirmación' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Permiso de uso en aula', gen: 'Permiso', n: 'Con secciones y horario', g: 'Lo emite el centro', t: 'Deja entrar con el material' },
  { w: 'Aval del distrito', gen: 'Aval', n: 'Autoriza y no obliga', g: 'Lo emite el nivel de arriba', t: 'Abre varios centros de una vez' },
  { w: 'Constancia para el patrocinador', gen: 'Constancia', n: 'Fecha, monto y destino', g: 'La emite el proyecto', t: 'Prueba en qué se usó lo aportado' },
  { w: 'Recibo del cobro mensual', gen: 'Recibo', n: 'Numerado desde el primero', g: 'Lo emite el proyecto', t: 'Prueba que el centro pagó' },
  { w: 'Carta con la ONG de las tabletas', gen: 'Carta de entendimiento', n: 'Sin dinero de por medio', g: 'La firman las dos partes', t: 'Dice qué pone cada uno y qué no incluye' },
  { w: 'Acuerdo de autoría y uso', gen: 'Convenio', n: 'Cede el uso, no la autoría', g: 'Lo firman las dos partes', t: 'Fija qué se cede y por cuánto tiempo' },
  { w: 'Permiso de foto por familia', gen: 'Permiso', n: 'Por niño y por publicación', g: 'Lo emite la familia', t: 'Autoriza esa publicación y no otra' },
  { w: 'Correo de confirmación', gen: 'Correo', n: 'Mandado el mismo día', g: 'Lo manda el proyecto', t: 'Deja constancia de lo hablado' },
  { w: 'Copia sellada de la solicitud', gen: 'Acuse', n: 'Sello, firma y fecha', g: 'Lo devuelve quien recibe', t: 'Prueba que se entregó y cuándo' },
  { w: 'Hoja de seguimiento', gen: 'Instrumento propio', n: 'Once campos, cinco antes de ir', g: 'La lleva el proyecto', t: 'Evita que el trámite se abandone' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La oficina que firma y sella el papel es el ___.', opts: ['solicitante', 'emisor', 'testigo'], ans: 'emisor' },
  { s: 'Desde cuándo y hasta cuándo vale un papel es su ___.', opts: ['formato', 'sello', 'vigencia'], ans: 'vigencia' },
  { s: 'El papel que deja hacer algo concreto es el ___.', opts: ['permiso', 'recibo', 'aval'], ans: 'permiso' },
  { s: 'El papel que prueba que algo ya pasó es la ___.', opts: ['solicitud', 'constancia', 'carta'], ans: 'constancia' },
  { s: 'La copia con sello y fecha de quien recibió es el ___.', opts: ['borrador', 'duplicado', 'acuse'], ans: 'acuse' },
  { s: 'Lo que nadie puede enseñar por escrito es una ___.', opts: ['costumbre', 'norma', 'circular'], ans: 'costumbre' },
  { s: 'De las fichas se cede el ___, nunca la autoría.', opts: ['nombre', 'uso', 'crédito'], ans: 'uso' },
  { s: 'Ante un requisito nuevo se pregunta dónde está ___.', opts: ['firmado', 'sellado', 'escrito'], ans: 'escrito' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'En la ventanilla te piden un requisito que no esperabas. ¿Cómo averiguas si es norma escrita, costumbre de la oficina o invento de una persona, y qué haces con cada uno?', ans: 'Se averigua con una sola pregunta, hecha sin levantar la voz: «¿dónde puedo leerlo?». Si hay documento, se pide copia o el nombre exacto y se cumple sin discutir, porque discutir una norma de verdad solo demuestra que uno no la leyó. Si no hay documento, puede ser la costumbre de esa oficina o el invento de una persona, y en los dos casos se cumple igual, porque pelearlo de frente cuesta más que hacerlo. Lo que cambia es lo que se anota: quién lo pidió, con qué cargo y en qué fecha, y si se puede, un correo del mismo día pidiendo que confirmen lo que dijeron. Eso sirve para dos cosas. Para no heredar el requisito el año que viene, cuando esa persona ya esté en otro escritorio y nadie lo pida. Y para saber, cuando el trámite se atrasa, si el atraso viene de la norma o de una costumbre que se puede conversar.' },
  { q: 'Explica por qué el emisor de un papel es una oficina y no una persona, y qué se anota entonces de la persona que atiende.', ans: 'El emisor es el cargo que firma y sella, y ese cargo sigue emitiendo aunque la persona cambie de escritorio en marzo. Si el trámite se apoya en que «el ingeniero es amigo», el día que trasladan al ingeniero el trámite empieza otra vez desde cero y el proyecto se queda sin nada en la mano. Por eso la primera pregunta es qué oficina emite este papel, y la segunda es si esa oficina emite o solo recomienda: quien recomienda ayuda, y su carta no abre ninguna puerta por sí sola. Ahora bien, de la persona que atiende sí se anota todo: nombre, cargo y fecha de la conversación, y se le confirma por escrito lo que dijo, aunque sea con un correo de tres líneas. No es desconfianza, es memoria. Dentro de seis meses, cuando alguien diga que ese requisito nunca se pidió, esas tres líneas son lo único que queda.' },
  { q: 'Explica qué es la vigencia de un papel y por qué en M.E.T.A.S casi todo se vuelve a sacar en febrero.', ans: 'La vigencia es desde cuándo y hasta cuándo vale un papel, y se pregunta al emitirlo, no el día que se necesita. Un papel sin fecha es una foto vieja: en la ventanilla lo miran, ven que es de hace tres años y ya no lo reconoce nadie, aunque en su momento fuera perfectamente válido. En este proyecto la vigencia real de casi todo es el año lectivo, aunque eso no esté escrito en ninguna parte: un aval del año escolar se muere en noviembre, y en febrero hay que sacarlo otra vez. Por eso el mismo trámite hecho en enero rinde por todo el año y hecho en septiembre no rinde nada. Lo que se hace con eso es simple: se apunta en el expediente desde cuándo y hasta cuándo, y se pone un recordatorio dos meses antes de que venza, para que la renovación caiga en una semana tranquila y no el día del taller.' },
  { q: 'Una directora te dice que sí a un taller para 40 maestras y quedó en conseguir el aval. ¿Qué haces ese mismo día y por qué?', ans: 'Ese mismo día se manda un correo de confirmación, antes de que se enfríe la reunión y antes de imprimir un solo papel. Empieza con «para dejar constancia de lo que hablamos hoy», lista lo acordado en puntos, dice quién hace qué y con qué fecha, y termina pidiendo que corrijan si algo quedó distinto. No lo pide nadie, no es un papel oficial y toma cinco minutos. Sirve para tres cosas: deja por escrito que ella pide el aval y no uno; fija la fecha, que es lo que después se discute; y si el día del taller aparece un requisito nuevo, hay algo con qué comparar. Lo que no se hace ese día es imprimir. Mientras el aval no esté, se preparan 20 fichas de prueba y nada más, porque el sí de una persona es verdadero y no siempre alcanza: quien autoriza en su centro no autoriza una actividad con docentes de varios centros.' },
  { q: 'Una institución quiere adoptar tus fichas e imprimir 5.000 ejemplares. ¿Qué se cede, qué no se cede nunca y cuándo se escribe?', ans: 'Se cede el uso, y acotado: imprimir y repartir en sus centros, durante un tiempo definido y para ese fin. No se cede la autoría, ni el derecho a modificar el contenido sin consultar, ni el de venderlo, ni el de quitar el crédito, y el crédito va impreso en cada ejemplar, no en una lista de agradecimientos al final. Eso se escribe antes de entregar el archivo, y ahí está todo el asunto: mientras el archivo no ha salido, uno tiene algo que la otra parte quiere, y por eso se puede pedir que quede claro. Después de entregarlo ya no hay con qué negociar, y lo adoptado sin acuerdo tiende a quedarse sin nombre, no por mala fe sino porque nadie se acuerda de preguntar. Cinco mil ejemplares son alcance y legitimidad de verdad, así que la respuesta es que sí, con esa condición escrita.' },
  { q: 'Explica el expediente del proyecto y la hoja de seguimiento: qué es cada uno, en qué se diferencian y cuándo se llenan.', ans: 'El expediente del proyecto en una hoja es una tabla con una fila por papel y siete columnas: qué papel, quién lo emite, qué pide, cuánto tarda y cuánto cuesta, vigencia desde y hasta, dónde está la copia, y estado. En estado solo caben tres palabras: listo, pedido o falta. Es la foto de lo que se tiene, y se revisa en enero, antes de que empiece el año lectivo. La idea de fondo es que el expediente son los papeles listos antes de que los pidan: quien los tiene entra, quien los va a buscar pierde el año escolar. La hoja de seguimiento es otra cosa: es una hoja por cada trámite que está en curso, con once campos, y los cinco primeros se llenan hoy, antes de pisar ninguna oficina. Si no se pueden llenar, ya se sabe cuál es la primera pregunta que hay que ir a hacer. Y el campo once, el próximo paso con fecha y con el nombre de quien lo hace, nunca se deja en blanco: un trámite sin próximo paso con fecha es un trámite abandonado.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['TRAMITE', 'PERMISO', 'AVAL', 'RECIBO', 'SELLO', 'COPIA']),
  haceSopa(10, ['CONSTANCIA', 'VIGENCIA', 'CONVENIO', 'FIRMA', 'OFICINA', 'REQUISITO']),
  haceSopa(10, ['EXPEDIENTE', 'AUTORIA', 'LICENCIA', 'COSTUMBRE', 'ACUSE', 'EMISOR']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'El sí de palabra de una directora alcanza para imprimir 480 lempiras en fichas.', a: false },
  { q: 'El emisor de un papel es la oficina que firma, no la persona que atiende.', a: true },
  { q: 'Un requisito que nadie puede enseñar por escrito se discute de frente hasta que lo retiren.', a: false },
  { q: 'Ante un requisito que no está escrito se cumple igual, y se anota quién lo pidió y cuándo.', a: true },
  { q: 'Todo papel nace con vigencia: desde cuándo y hasta cuándo vale.', a: true },
  { q: 'El aval del distrito se pide antes de hablar con ningún director, para llegar con papel.', a: false },
  { q: 'Una carta de entendimiento obliga a las dos partes igual que un convenio.', a: false },
  { q: 'El convenio obliga a las dos partes y por eso se lee dos veces antes de firmarlo.', a: true },
  { q: 'Una constancia puede decir cosas que no se pueden demostrar, si quien la pide lo necesita.', a: false },
  { q: 'Si no sellan la copia, el correo de confirmación del mismo día sirve como respaldo.', a: true },
  { q: 'El permiso para publicar la foto de un niño lo da la maestra que tomó la foto.', a: false },
  { q: 'Al entregar las fichas a una institución se cede el uso y también la autoría.', a: false },
  { q: 'El mismo trámite hecho en enero rinde más que hecho en septiembre.', a: true },
  { q: 'El nombre exacto del papel y la lista de requisitos se confirman en la oficina que lo emite.', a: true },
  { q: 'Un trámite sin próximo paso con fecha es un trámite abandonado.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Qué decide cuál es el papel que hace falta?', o: ['a) La oficina más grande que quede cerca', 'b) El acto concreto que se quiere hacer, escrito en una línea', 'c) El dinero que hay disponible', 'd) La costumbre del centro'], a: 1 },
  { q: 'El emisor de un papel es…', o: ['a) La oficina cuyo cargo firma y sella', 'b) La persona que atiende la ventanilla', 'c) Quien recomienda al solicitante', 'd) Quien redacta la solicitud'], a: 0 },
  { q: 'Ante un requisito que no está en ningún documento, la pregunta es…', o: ['a) «¿Y si esta vez lo dejamos pasar?»', 'b) «¿Quién es su jefe?»', 'c) «¿Cuánto cuesta agilizarlo?»', 'd) «¿Dónde puedo leerlo?»'], a: 3 },
  { q: 'Catorce centros del mismo distrito quieren el material. El aval de arriba…', o: ['a) Se pide primero, para llegar con papel en la mano', 'b) No hace falta nunca', 'c) Se pide después de hablar con dos o tres directores, y dice que autoriza y que no obliga', 'd) Se pide solo si un director se niega'], a: 2 },
  { q: 'La constancia para la ferretería que aportó 8.000 lempiras debe decir…', o: ['a) Qué se recibió, para qué se usó y en qué fecha', 'b) Un monto redondeado hacia arriba', 'c) Que el aporte fue mayor, para que quede mejor', 'd) Solo el nombre del patrocinador'], a: 0 },
  { q: 'Antes de ponerle precio a un aula hay que saber…', o: ['a) Cuánto cobran los demás', 'b) Cuántas aulas tiene el distrito', 'c) Si el año escolar ya empezó', 'd) Con qué documento se va a cobrar, porque hay quien no le paga a una persona'], a: 3 },
  { q: 'Una ONG entrega quince tabletas de 90.000 lempiras sin dinero de por medio. Corresponde…', o: ['a) Un convenio, por el monto', 'b) Una carta de entendimiento que diga también qué no incluye', 'c) Un recibo por el valor de las tabletas', 'd) Nada por escrito, porque es una donación'], a: 1 },
  { q: 'El permiso para publicar la foto de un niño lo emite…', o: ['a) La maestra de la sección', 'b) La dirección del centro', 'c) Su familia, y para esa publicación concreta', 'd) El proyecto que tomó la foto'], a: 2 },
  { q: 'De las fichas, lo que no se cede nunca es…', o: ['a) El derecho a imprimirlas', 'b) El derecho a repartirlas en sus centros', 'c) El formato del archivo', 'd) La autoría y el crédito impreso'], a: 3 },
  { q: 'Se entregó la solicitud y no quisieron sellar la copia. El mismo día se…', o: ['a) Manda un correo que resuma qué se entregó, a quién y cuándo', 'b) Vuelve al día siguiente a exigir el sello', 'c) Anota en el cuaderno personal', 'd) Deja así: ya quedó entregada'], a: 0 },
  { q: 'La vigencia de un papel se pregunta…', o: ['a) Cuando se va a usar', 'b) Cuando alguien lo rechaza', 'c) Al emitirlo, no al necesitarlo', 'd) Solo si el papel no trae fecha'], a: 2 },
  { q: 'El calendario escolar, en la práctica…', o: ['a) No afecta a los trámites', 'b) Manda igual que una norma, aunque no esté escrito en ninguna parte', 'c) Solo importa para los permisos de aula', 'd) Se negocia con la oficina que emite'], a: 1 },
  { q: 'La hoja de seguimiento se empieza a llenar…', o: ['a) Cuando sale el papel', 'b) Cuando se cumple la fecha prometida', 'c) Cuando alguien reclama', 'd) Antes de empezar el trámite: los cinco primeros campos se llenan hoy'], a: 3 },
  { q: 'El expediente del proyecto es…', o: ['a) La carpeta con los papeles listos antes de que los pidan', 'b) La lista de contactos de cada oficina', 'c) El archivo de correos del año', 'd) El presupuesto anual del proyecto'], a: 0 },
  { q: 'La prueba de que esta etapa está aprendida es…', o: ['a) Saberse los siete tipos de papel de memoria', 'b) Tener un conocido en cada oficina', 'c) Poder decir de cada papel quién lo emite, hasta cuándo vale y dónde está la copia', 'd) No necesitar ningún papel'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La oficina que firma y sella el papel es el ___.', a: 'emisor' },
  { q: 'Desde cuándo y hasta cuándo vale un papel es su ___.', a: 'vigencia' },
  { q: 'El papel que deja hacer algo concreto es el ___.', a: 'permiso' },
  { q: 'El papel que prueba que algo pasó es la ___.', a: 'constancia' },
  { q: 'El papel con el que una autoridad respalda a alguien ante otros es el ___.', a: 'aval' },
  { q: 'El acuerdo que obliga a las dos partes es el ___.', a: 'convenio' },
  { q: 'El papel que prueba que se pagó es el ___.', a: 'recibo' },
  { q: 'La copia con sello y fecha de quien recibió es el ___.', a: 'acuse' },
  { q: 'Lo que siempre se ha hecho en esa oficina y nadie enseña por escrito es la ___.', a: 'costumbre' },
  { q: 'La marca que dice que el papel pasó por la oficina de verdad es el ___.', a: 'sello' },
  { q: 'La carpeta con los papeles listos antes de que los pidan es el ___ del proyecto.', a: 'expediente' },
  { q: 'De las fichas se cede el uso, nunca la ___.', a: 'autoría' },
  { q: 'El resumen de lo hablado, mandado el mismo día, es el ___ de confirmación.', a: 'correo' },
  { q: 'Ante un requisito nuevo se pregunta dónde está ___.', a: 'escrito' },
  { q: 'La hoja de ___ lleva los once campos de un trámite en curso.', a: 'seguimiento' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Trámite', def: 'Los pasos para conseguir un papel que autoriza o prueba' },
  { term: 'Requisito escrito', def: 'Lo exigido en un documento que alguien puede enseñar' },
  { term: 'Costumbre de oficina', def: 'Lo que siempre se ha hecho ahí, sin nada escrito' },
  { term: 'Invento personal', def: 'El requisito que puso alguien por su cuenta' },
  { term: 'Permiso', def: 'Deja hacer algo concreto, en un lugar y por un tiempo' },
  { term: 'Constancia', def: 'Prueba que algo pasó, con fecha y con quien la emite' },
  { term: 'Aval', def: 'Una autoridad respalda a alguien ante otros' },
  { term: 'Carta de entendimiento', def: 'Dos partes escriben qué hace cada una, sin dinero' },
  { term: 'Convenio', def: 'Obliga a las dos partes y se lee dos veces' },
  { term: 'Recibo', def: 'Prueba que se pagó, con monto y con fecha' },
  { term: 'Emisor', def: 'La oficina que firma, no quien atiende' },
  { term: 'Vigencia', def: 'Desde cuándo y hasta cuándo vale un papel' },
  { term: 'Copia sellada', def: 'La copia de lo entregado, con sello y fecha' },
  { term: 'Correo de confirmación', def: 'El resumen de lo hablado, del mismo día' },
  { term: 'Expediente del proyecto', def: 'Los papeles listos antes de que los pidan' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Una directora dice que sí a que las misiones se usen en dos secciones de sexto y pide empezar el lunes. Imprimir las 120 fichas cuesta 480 lempiras y el taller para las maestras son dos horas de un sábado.' },
  { txt: 'Catorce centros del mismo distrito quieren el material, y visitarlos uno por uno son catorce permisos y unos 600 lempiras de transporte por vuelta.' },
  { txt: 'Una ferretería aporta 8.000 lempiras para imprimir fichas y pide una constancia para justificar el gasto en su contabilidad. El proyecto nunca ha emitido una.' },
  { txt: 'Veinte aulas a 150 lempiras al mes son 3.000 lempiras mensuales y 36.000 al año, y el primer centro pregunta a nombre de quién hace el cheque.' },
  { txt: 'Una institución quiere adoptar las fichas e imprimir 5.000 ejemplares para sus centros, unos 60.000 lempiras de impresión que no pone el proyecto. En la reunión nadie habló de autoría.' },
  { txt: 'Una ONG ofrece quince tabletas valoradas en 90.000 lempiras para tres centros, sin dinero de por medio, y quiere «algo firmado» para su informe.' },
  { txt: 'Hay una foto muy buena de una sección usando las misiones y se quiere publicar: son 30 niños, 30 permisos de familia y unos 300 lempiras de transporte en dos visitas al centro. No hay ningún papel firmado.' },
  { txt: 'Un centro reclama 12.000 lempiras de perjuicio por 150 fichas que dice que faltaron, y existe un correo de hace cuatro meses, del mismo día de la reunión, que dice exactamente qué se acordó.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué papel hace falta aquí y cómo se llama en la práctica?',
  '2. ¿Quién lo emite, y esa oficina emite o solo recomienda?',
  '3. ¿Está escrito o es costumbre, y cómo lo averiguas sin pelear?',
  '4. ¿Qué vigencia debe tener y dónde va a quedar la copia?',
]);

B.critCaseGuides = JSON.stringify([
  'Se nombra el documento, no la intención: no «apoyo» ni «permiso» en general, sino permiso de uso en aula, aval, constancia, recibo, carta de entendimiento o convenio. Y el nombre exacto se confirma en la oficina que lo emite: esa consulta es parte del trámite, no un paso previo.',
  'Una oficina, no una persona simpática. Vale la pena separar emitir de recomendar: quien recomienda ayuda y no firma, y su carta no abre ninguna puerta sola. Si no se puede decir qué cargo firma, todavía no se está decidiendo: se está adivinando.',
  'La pregunta buena es siempre alguna forma de «¿dónde puedo leerlo?», hecha sin levantar la voz. Si hay documento, se cumple sin discutir. Si no lo hay, se cumple igual y se anota quién lo pidió, con qué cargo y en qué fecha.',
  'Desde cuándo y hasta cuándo, con recordatorio dos meses antes de que venza. Y la copia sellada en la carpeta del centro, con la fecha en el nombre del archivo; si no sellan, el correo del mismo día. Sin copia, el trámite se repite entero el año que viene.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"La directora ya dijo que sí, mando a imprimir las 120 fichas hoy mismo".', g1: 'El sí de palabra es verdadero y no es un papel: la persona cambia de escritorio, y en la puerta pueden pedir algo que ella nunca mencionó. Los 480 lempiras se pierden completos.', g2: 'Se le piden tres líneas por escrito con las secciones y el horario, aunque sea un correo. Con eso se imprime; sin eso, se imprimen 20 fichas de prueba y nada más.' },
  { txt: '"Me piden la carta en letra de molde y con tres copias, así que hay que hacerlo y ya".', g1: 'Puede ser norma, costumbre o invento de una persona, y no da lo mismo: lo que se inventó una persona se va con ella, y el año que viene nadie lo pide.', g2: 'Se cumple, y de paso se pregunta sin pelear «¿dónde puedo leerlo?». Se anota quién lo pidió y cuándo, para no heredar el requisito para siempre.' },
  { txt: '"Como voy a trabajar en catorce centros, primero saco el aval de arriba y después aviso abajo".', g1: 'Un aval que llega antes que la conversación se lee abajo como una orden, y una orden que no se quiso se cumple mal: el papel entra y el proyecto no.', g2: 'Primero se habla con dos o tres directores; después se pide el aval, y el papel dice que autoriza y que no obliga, para que cada centro decida si entra.' },
  { txt: '"El de la ventanilla dijo que sí se puede, así que ya está".', g1: 'Quien atiende casi nunca es quien emite: puede orientar, recomendar o equivocarse, y su palabra no sostiene nada dentro de seis meses.', g2: 'Se anota su nombre y su cargo, y se confirma por escrito lo que dijo, aunque sea con un correo de tres líneas del mismo día.' },
  { txt: '"El aval lo sacamos el año pasado, sirve igual".', g1: 'Todo papel tiene vigencia, y el del año escolar se muere en noviembre. Además, un cambio de titular lo acorta en la práctica aunque la fecha diga otra cosa.', g2: 'Se apunta desde cuándo y hasta cuándo vale, con recordatorio dos meses antes, y lo del año escolar se vuelve a sacar en febrero.' },
  { txt: '"Entregué la solicitud en la oficina; no me dieron nada, pero ahí quedó".', g1: 'Sin copia sellada no hay nada que reclamar. Es el único trámite que no se puede rehacer, porque el papel ya salió de las manos de uno.', g2: 'Se pide acuse: sello, firma y fecha en la copia. Si no sellan, se manda el mismo día un correo diciendo qué se entregó, a quién y cuándo, y se guarda en la carpeta del centro.' },
]);

B.critDecisionBank = JSON.stringify([
  'El sí de la directora alcanza para dos secciones de sexto y 480 lempiras impresos, ¿o hace falta un papel de más arriba? ¿Qué se pide, a quién y antes de qué?',
  'Catorce centros y un solo papel: ¿la oficina a la que vas emite el aval o solo recomienda, y qué tiene que decir ese papel para no quemar el proyecto en el aula?',
  'La ferretería aporta 8.000 lempiras y pide constancia: ¿quién la emite, qué dice exactamente y qué se adjunta para poder demostrarlo?',
  'Veinte aulas a 150 lempiras al mes: ¿se cobra como persona o como organización, y cuál de las dos puede pagar el centro?',
  'Cinco mil ejemplares de las fichas: ¿qué se cede exactamente, qué no se cede nunca y en qué momento se escribe?',
  'Las quince tabletas de 90.000 lempiras: ¿carta de entendimiento o convenio, y qué va en el apartado de qué no incluye?',
  'Treinta niños en la foto y ningún papel: ¿quién emite ese permiso, para qué uso concreto, y qué se publica mientras tanto?',
  'Nadie pidió que quedara nada por escrito de la reunión: ¿qué se manda hoy mismo, con qué palabras y dónde se guarda?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Pedir un permiso de uso en aula, con secciones y horario.', b: 'Pedir una constancia de que el taller se dio.', ga: 'Caso A: es el papel que deja hacer algo concreto, y por eso se pide antes. Sin él, el trabajo se hace y se pierde en la puerta.', gb: 'Caso B: prueba que algo ya pasó, y por eso se pide después. Sirve para el expediente y para el patrocinador, no para entrar.' },
  { a: 'Firmar una carta de entendimiento con la ONG de las tabletas.', b: 'Firmar un convenio con la ONG de las tabletas.', ga: 'Caso A: no hay dinero de por medio, así que basta escribir qué pone cada uno, qué no incluye y hasta cuándo dura.', gb: 'Caso B: obliga a las dos partes, y obligaría a dar soporte a quince aparatos que el proyecto no puede sostener. Se lee dos veces y se firma en frío.' },
  { a: 'Un requisito que la oficina puede enseñar en un documento.', b: 'Un requisito que solo existe en la boca de quien atiende.', ga: 'Caso A: se cumple sin discutir y se puede leer antes de ir, así que no hay sorpresas en la ventanilla.', gb: 'Caso B: se cumple igual, pero se anota quién lo pidió y cuándo, porque el año que viene puede no pedirlo nadie y no conviene heredarlo.' },
  { a: 'Quedarse con la copia sellada de lo entregado.', b: 'Quedarse con la promesa de que «ahí quedó».', ga: 'Caso A: aguanta un cambio de funcionario, una mudanza de oficina y cuatro meses de olvido. Es lo único que sostiene un reclamo de 12.000 lempiras.', gb: 'Caso B: no sobrevive al primer traslado. Cuando el papel se pierde, el trámite se repite entero y el año escolar ya no espera.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se imprime y se prepara el material antes de preguntar qué papel hace falta.', guide: 'El trabajo entero queda a merced de un requisito que nadie mencionó. Una llamada de cinco minutos antes de imprimir vale 1.200 lempiras y tres semanas.' },
  { cause: 'Se le pide el papel a quien solo puede recomendar.', guide: 'Pasan las semanas y no sale nada, porque esa oficina nunca pudo emitirlo. La pregunta que faltó es si emite o solo recomienda.' },
  { cause: 'Se cumple como norma un requisito que se inventó una persona.', guide: 'Se rehace el trabajo tres veces y el requisito se hereda: al año siguiente se vuelve a hacer igual, aunque quien lo pidió ya no esté.' },
  { cause: 'Se entrega la solicitud sin quedarse con copia sellada.', guide: 'El día que la oficina dice que nunca la recibió no hay con qué contestar. Es el único trámite que no se puede rehacer.' },
  { cause: 'Nadie apuntó la vigencia del aval ni puso recordatorio.', guide: 'En septiembre el papel ya no sirve, el taller se cae y hay que empezar el trámite en la peor semana del año.' },
  { cause: 'Se entrega el archivo de las fichas sin escribir qué se cede.', guide: 'Lo adoptado sin acuerdo tiende a quedarse sin nombre. Después de entregar ya no hay con qué negociar el crédito impreso.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'El taller se dio en la fecha prometida y sin sustos en la puerta.', guide: 'Se preguntó antes de imprimir qué papel hacía falta y quién lo emitía, y las 300 fichas salieron cuando ya había fecha segura.' },
  { effect: 'Catorce centros abrieron la puerta con un solo papel y ninguno se sintió obligado.', guide: 'El aval se pidió después de hablar con dos o tres directores, y decía que autoriza y que no obliga. Cada centro decidió si entraba.' },
  { effect: 'La ferretería repitió su aporte al año siguiente.', guide: 'La constancia decía qué se recibió, para qué se usó y en qué fecha, con la copia de la factura de la imprenta. Lo que se puede demostrar se puede repetir.' },
  { effect: 'Un reclamo de 12.000 lempiras se cerró en una tarde.', guide: 'Había un correo del mismo día de la reunión con lo acordado en puntos. No lo pidió nadie y fue la única prueba que quedó.' },
  { effect: 'En febrero el proyecto ya estaba trabajando mientras otros empezaban a pedir permisos.', guide: 'El expediente se revisó en enero y los papeles del año se sacaron entonces. El trámite hecho en enero vale por todo el año.' },
  { effect: 'Las fichas se imprimieron en 5.000 ejemplares con el crédito del autor en cada uno.', guide: 'Se escribió antes de entregar el archivo qué se cedía (el uso, acotado) y qué no se cedía nunca: autoría, venta, modificación y crédito.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🎯', label: 'Qué se quiere hacer', text: '¿Qué acto concreto se quiere hacer? <strong>Decide:</strong> qué papel hace falta y ninguno más. <strong>Se rompe:</strong> al pedir «apoyo» o «permiso» en general, que nadie sabe cómo firmar. <strong>En M.E.T.A.S:</strong> no es «entrar al sistema educativo», es «dar un taller de dos horas a las maestras de una escuela».' },
  { y: '2', icon: '📖', label: 'Qué lo regula', text: '¿Esto está escrito en algún lado o es la costumbre de esta oficina? <strong>Decide:</strong> si el requisito se cumple o se conversa. <strong>Se rompe:</strong> al obedecer inventos personales y al discutir normas de verdad. <strong>En M.E.T.A.S:</strong> casi nada de lo que piden está escrito, y por eso se pregunta con calma dónde lo dice.' },
  { y: '3', icon: '🏢', label: 'Quién lo emite', text: '¿Qué oficina firma este papel? <strong>Decide:</strong> adónde se va y con quién se habla. <strong>Se rompe:</strong> al pedirle a quien solo puede recomendar, no emitir. <strong>En M.E.T.A.S:</strong> el permiso de aula lo da el centro; el aval para varios centros, el nivel de arriba.' },
  { y: '4', icon: '📋', label: 'Qué requisitos pide', text: '¿Qué hay que llevar exactamente? <strong>Decide:</strong> cuánto trabajo hay antes de ir. <strong>Se rompe:</strong> cuando el requisito aparece en la ventanilla y hay que volver otro día. <strong>En M.E.T.A.S:</strong> se pide la lista completa por escrito antes de mover un dedo.' },
  { y: '5', icon: '⏳', label: 'Cuánto tarda y cuánto cuesta', text: '¿Cuántos días y cuántos lempiras? <strong>Decide:</strong> si el plan cabe en el calendario escolar. <strong>Se rompe:</strong> al no preguntar el tiempo y prometer una fecha imposible. <strong>En M.E.T.A.S:</strong> entre el sí de palabra y el papel firmado pasan semanas, y hay que contarlas.' },
  { y: '6', icon: '📅', label: 'Qué vigencia tiene', text: '¿Hasta cuándo vale este papel? <strong>Decide:</strong> cuándo toca repetir el trámite. <strong>Se rompe:</strong> al creer que lo firmado una vez vale para siempre. <strong>En M.E.T.A.S:</strong> un aval del año escolar se muere en noviembre y en febrero hay que sacarlo otra vez.' },
  { y: '7', icon: '🗄️', label: 'Dónde queda la copia', text: '¿Dónde va a estar este papel dentro de un año? <strong>Decide:</strong> si el trámite se repite o se hereda. <strong>Se rompe:</strong> sin copia sellada, que es el único trámite que no se puede rehacer. <strong>En M.E.T.A.S:</strong> una carpeta por centro, con la fecha en el nombre del archivo.' },
]);

B.parteData = JSON.stringify({
  norma: {
    nombre: 'Qué lo regula', icon: '📖',
    estructura: { title: 'Qué es', info: '• La respuesta a <strong>¿dónde está escrito esto?</strong><br>• Tres cosas distintas: la norma, la práctica y el invento personal<br>• Confundirlas cuesta meses de trabajo' },
    funcion: { title: 'Cómo se averigua', info: '• Se pregunta sin pelear: <strong>«¿dónde puedo leerlo?»</strong><br>• Si hay documento, se pide copia o el nombre exacto<br>• Si no hay, se pide por correo lo que le dijeron a uno' },
    enfermedades: { title: 'Dónde se traba', info: '• Con el requisito que se inventó una persona y nadie revisó<br>• Con la costumbre que se cumple como si fuera ley<br>• Con la norma real que uno discute por no haberla leído' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Casi nada de lo que piden a un proyecto escolar está escrito<br>• Por eso se guarda <strong>quién lo pidió y cuándo</strong><br>• Y se cumple lo razonable sin dejar de preguntar la base' },
  },
  emisor: {
    nombre: 'Quién lo emite', icon: '🏢',
    estructura: { title: 'Qué es', info: '• La <strong>oficina</strong> que firma y sella el papel<br>• No es la persona que atiende: es el cargo que firma<br>• Una recomendación no es una emisión' },
    funcion: { title: 'Cómo se averigua', info: '• Se pregunta en la ventanilla más cercana, no en la más alta<br>• Se anota el <strong>nombre y el cargo</strong> de quien contesta<br>• Se confirma por escrito lo que dijo, aunque sea un correo' },
    enfermedades: { title: 'Dónde se traba', info: '• Al pedirle el papel a quien solo puede opinar<br>• Al saltarse el nivel de abajo y volver con un aval que abajo molesta<br>• Con el cambio de titular, que reinicia la conversación' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• El permiso de aula lo da <strong>el centro</strong><br>• El aval para varios centros lo da <strong>el nivel de arriba</strong><br>• La constancia de una donación la emite <strong>el proyecto</strong>' },
  },
  vigencia: {
    nombre: 'Hasta cuándo vale', icon: '📅',
    estructura: { title: 'Qué es', info: '• La <strong>fecha en que el papel deja de servir</strong><br>• A veces está escrita y a veces se deduce del año escolar<br>• Sin vigencia, un papel es una foto vieja' },
    funcion: { title: 'Cómo se averigua', info: '• Se pregunta al emitirlo, no al necesitarlo<br>• Se apunta en el expediente <strong>desde cuándo y hasta cuándo</strong><br>• Se pone un recordatorio dos meses antes de que venza' },
    enfermedades: { title: 'Dónde se traba', info: '• Con el papel de hace tres años que ya no lo reconoce nadie<br>• Con el cambio de autoridad, que en la práctica lo acorta<br>• Al pedir en septiembre lo que rendía pedido en enero' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• El año lectivo es la vigencia real de casi todo<br>• Lo del año escolar <strong>se vuelve a sacar en febrero</strong><br>• Un permiso de foto vence con la publicación para la que se pidió' },
  },
  copia: {
    nombre: 'Dónde queda la copia', icon: '🗄️',
    estructura: { title: 'Qué es', info: '• El <strong>respaldo de lo entregado y de lo recibido</strong><br>• La copia sellada de lo que uno entregó vale más que la promesa de quien lo recibió<br>• El correo de confirmación también es copia' },
    funcion: { title: 'Cómo se averigua', info: '• Al entregar se pide <strong>acuse</strong>: sello, firma y fecha en la copia<br>• Si no sellan, se manda el mismo día un correo resumiendo lo entregado<br>• Se guarda en una carpeta por centro, con la fecha en el nombre' },
    enfermedades: { title: 'Dónde se traba', info: '• Al entregar sin quedarse con nada<br>• Al guardarlo todo en un teléfono que se pierde<br>• Al no anotar quién recibió, y no poder reclamar a nadie' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Una carpeta por centro y un archivo por trámite<br>• El correo de confirmación se guarda igual que un oficio<br>• Sin copia, el trámite se repite entero el año siguiente' },
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

/* critDecisionGuide es una cadena, no una lista, y va aquí para que el conteo de
   bancos siga siendo el del molde. Se reemplaza la línea entera igual que un banco. */
const GUIA_DECISIONES = 'En cada decisión, escribe primero qué papel hace falta y quién lo emite; después, si eso está escrito o es costumbre; después qué vigencia debe tener y dónde va a quedar la copia. Casi ninguna decisión es sí o no: casi todas son sí con la condición de que quede algo escrito, con fecha y con nombre de quien lo firma. Si no puedes decir quién emite el papel, todavía no estás decidiendo: estás adivinando, y esa es la primera pregunta que hay que ir a hacer.';

const textos = [
  /* La línea completa de critDecisionGuide */
  [/^const critDecisionGuide="[^"]*";$/m, 'const critDecisionGuide=' + JSON.stringify(GUIA_DECISIONES) + ';'],

  /* El mensaje de WhatsApp de la misión (compartirMision) */
  [/const texto='[^']*'\+url;/, "const texto='📜 *Ruta del Poder Político · Etapa 2* 📜\\n\\nQué papel hace falta, quién lo emite, qué pide y hasta cuándo vale, con los ocho trámites del proyecto. 📜\\n\\n_Incluye evaluación conceptual y el papel que falta._ ✍️\\n\\n🔗 *Enlace:* '+url;"],

  /* El mensaje del diploma (shareWA) */
  [/'[^']*¡'\+name\+' completó la Etapa 1 de la Ruta del Poder Político \(Quién decide de verdad\)!/, "'📜 ¡'+name+' completó la Etapa 2 de la Ruta del Poder Político (Normas y trámites)!"],

  /* El subtítulo del diploma */
  [/Ruta del Poder Político · Etapa 1: Quién decide de verdad/g, 'Ruta del Poder Político · Etapa 2: Normas y trámites'],

  /* La pregunta de la sección III de la prueba competencial (pantalla e impresa) */
  [/¿Quién decide de verdad, qué se pide a cambio y con qué condición por escrito aceptarías\?/g, '¿Qué papel hace falta aquí, quién lo emite y con qué condición por escrito seguirías adelante?'],

  /* Los rótulos de la prueba competencial: título, encabezado impreso, pauta y aviso */
  [/🧠 Simulacro de negociación/g, '📜 El papel que falta'],
  [/Simulacro de negociación/g, 'El papel que falta'],
  [/simulacro de negociación/g, 'el papel que falta'],

  /* El nombre de la misión en la evaluación final, el título de impresión y la pauta */
  [/Quién decide de verdad/g, 'Normas y trámites'],
  [/quién decide de verdad/g, 'normas y trámites'],
  [/el mapa del poder/g, 'el mapa del trámite'],
  [/mapa del poder/g, 'mapa del trámite'],

  /* La simulación de Aprende: el taller que se hizo sin el papel */
  [/<span class="ms-icon">[^<]*<\/span><span class="ms-text"><strong>Pediste 24 horas:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">📞</span><span class="ms-text"><strong>Llamaste al distrito antes de imprimir:</strong> cinco minutos de llamada descubren el aval que nadie había mencionado, y quedan dos semanas para sacarlo.</span>'],
  [/<span class="ms-icon">[^<]*<\/span><span class="ms-text"><strong>Al día siguiente decides tú:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">📜</span><span class="ms-text"><strong>El taller se hace, tarde pero se hace:</strong> las 300 fichas se imprimen cuando ya hay fecha segura y papel en la mano.</span>'],
  [/<span class="ms-icon">[^<]*<\/span><span class="ms-text"><strong>Contestaste en caliente:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">🖨️</span><span class="ms-text"><strong>Te pusiste a imprimir con el sí del director:</strong> ese sí era verdadero y no alcanzaba, porque él autoriza en su centro y no una actividad con docentes de varios centros.</span>'],
  [/<span class="ms-icon">[^<]*<\/span><span class="ms-text"><strong>Y la coherencia lo amarra:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">💸</span><span class="ms-text"><strong>La cuenta del día:</strong> 1.200 lempiras impresos y tres semanas de trabajo perdidos por no hacer una pregunta de cinco minutos.</span>'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
