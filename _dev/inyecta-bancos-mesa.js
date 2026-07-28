/* Inyecta los bancos de la misión «La mesa: negociar con una institución»
   (Ruta del Poder Político, etapa 3) sobre el molde copiado de la etapa 2,
   «Normas y trámites».
   Uso:  node _dev/inyecta-bancos-mesa.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-politica-mesa', 'js', 'mesa.js');

let _semilla = 20260730;
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
B.SAVE_KEY = `'faro_pol_mesa_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la mesa superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de la negociación explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de posición e interés experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la mesa maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la mesa' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta del Poder Político completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Va a la mesa a ver qué sale 🚶' },
  { t: 25, n: 'Sabe quién decide de verdad 🪑' },
  { t: 55, n: 'Lleva su mínimo escrito 📋' },
  { t: 90, n: 'Cobra en la moneda que sirve 🪙' },
  { t: 130, n: 'Sabe cuándo levantarse 🚪' },
  { t: 165, n: 'Convierte el sí grande en piloto 🌱' },
  { t: 190, n: 'Cierra por escrito y con fecha 🤝' },
]);

B.fcData = JSON.stringify([
  { w: 'La mesa', a: '🤝 La conversación en la que se reparte algo entre <strong>dos que se necesitan</strong>. No es una pelea ni un favor: es un intercambio, y en un intercambio los dos tienen que salir pudiendo explicar por qué firmaron.' },
  { w: 'Quién firma de verdad', a: '🪑 En una institución, quien te recibe <strong>casi nunca puede decir sí</strong>, pero casi siempre puede decir no. Antes de preparar nada hay que saber si enfrente hay alguien que decide, alguien que traba o alguien que solo transmite.' },
  { w: 'El riesgo del funcionario', a: '🛡️ Lo que la institución protege no es el dinero: es <strong>que no le caiga un problema a quien firma</strong>. Casi toda negativa que parece burocracia es en realidad alguien evitando un riesgo que nadie le va a agradecer haber corrido.' },
  { w: 'Posición e interés', a: '🎯 La posición es <strong>lo que piden</strong> («queremos las misiones gratis para el departamento»). El interés es <strong>para qué lo piden</strong> (enseñar resultados en el informe de fin de año). Casi siempre hay dos maneras de cubrir el interés y solo una de dar la posición.' },
  { w: 'Qué pasa si no hay trato', a: '🚪 Tu plan si te levantas de la mesa, escrito <strong>antes</strong> de sentarte. Es lo único que de verdad da fuerza: quien no tiene a dónde ir acepta cualquier cosa, y en la mesa eso se nota sin que digas nada.' },
  { w: 'El límite que no se cruza', a: '⛔ La línea que se decide <strong>en frío y en casa</strong>: la autoría, el nombre del autor, los datos de menores, el criterio pedagógico. Se escribe antes porque en la reunión, con seis personas mirando, siempre parece razonable ceder un poco.' },
  { w: 'La moneda que no es dinero', a: '🪙 En una institución casi nunca hay presupuesto, y casi siempre hay <strong>otras monedas</strong>: alcance, legitimidad, una constancia, acceso a directores, tiempo de capacitación pagado, transporte, impresión. Se cobran igual y se piden igual.' },
  { w: 'Concesión con condición', a: '⚖️ Nada se da suelto: cada cosa que cedes <strong>lleva pegada una petición</strong>. «Puedo bajar el precio si el acuerdo pasa de un año a tres» no es regatear: es cambiar una cosa por otra, que es lo que se hace en una mesa.' },
  { w: 'El piloto', a: '🌱 Convertir un sí grande y lejano en un <strong>sí pequeño y pronto</strong>: un centro, una sección, un mes. Baja el riesgo del que firma, que es lo que lo tenía frenado, y crea el hecho que hace fácil la siguiente conversación.' },
  { w: 'El sí que no es un sí', a: '😶 «Vamos a verlo», «déjelo conmigo», «estamos en eso». La institución casi nunca dice que no: <strong>deja de contestar</strong>. Y quien se queda esperando pierde meses sin darse cuenta, que es el daño más caro de esta etapa.' },
  { w: 'La minuta', a: '📝 El papel de media hoja que dice <strong>qué se acordó, quién hace qué y para cuándo</strong>, escrito por ti y enviado el mismo día. Quien escribe la minuta fija lo que pasó, y casi nadie se molesta en escribirla.' },
  { w: 'La asimetría de tiempo', a: '⏳ La institución tiene todo el tiempo del mundo y tú no. Ellos siguen cobrando pase lo que pase; tú tienes un año escolar que corre. <strong>El que tiene prisa paga más</strong>, así que la prisa no se enseña.' },
  { w: 'El calendario como palanca', a: '📅 Una decisión en enero vale por todo el año escolar; la misma en septiembre no vale nada. <strong>Cuándo se pide es parte de qué se pide</strong>, y a veces esperar dos meses vale más que negociar mejor.' },
  { w: 'La mesa pública', a: '👀 Cuando hay más gente en la sala, quien está enfrente ya no negocia contigo: <strong>negocia con lo que van a pensar de él</strong>. Por eso lo difícil se habla aparte y en la sala solo se confirma lo ya hablado.' },
  { w: 'La institución no recuerda', a: '🔄 Cambia el funcionario y empiezas de cero, aunque el acuerdo fuera excelente. Por eso todo va <strong>por escrito y a nombre de la institución</strong>, no de la persona simpática que te recibió.' },
  { w: 'El acta de lo que no se acordó', a: '🚧 En la minuta también se escribe <strong>lo que quedó fuera</strong>. Es lo que evita que dentro de seis meses alguien dé por incluido algo que nunca se habló, y no hay forma de discutirlo entonces.' },
]);

B.qzData = JSON.stringify([
  { q: 'En una institución, quien te recibe normalmente…', o: ['a) Puede decidirlo todo en la reunión', 'b) Casi nunca puede decir sí, pero casi siempre puede decir no', 'c) Solo transmite y no influye', 'd) Decide si le caes bien'], c: 1 },
  { q: '¿Qué protege de verdad la institución al negociar?', o: ['a) Su presupuesto', 'b) Su prestigio', 'c) Que no le caiga un problema a quien firma', 'd) El tiempo de sus empleados'], c: 2 },
  { q: 'La diferencia entre posición e interés es que…', o: ['a) La posición es lo que piden y el interés es para qué lo piden', 'b) La posición es la del jefe y el interés el del técnico', 'c) La posición se escribe y el interés se habla', 'd) Son dos nombres para lo mismo'], c: 0 },
  { q: '¿Qué te da fuerza de verdad en una mesa?', o: ['a) Hablar con seguridad', 'b) Llevar más datos que el otro', 'c) Que te acompañe alguien conocido', 'd) Tener escrito qué haces si no hay trato'], c: 3 },
  { q: 'Cuando una institución no tiene presupuesto…', o: ['a) No hay nada que negociar', 'b) Se acepta trabajar gratis por el alcance', 'c) Casi siempre tiene otras monedas: alcance, constancias, transporte, tiempo', 'd) Se espera al año siguiente'], c: 2 },
  { q: 'Ceder algo en la mesa sin pedir nada a cambio…', o: ['a) Enseña buena voluntad y ayuda', 'b) Mueve la línea y hace esperar la siguiente cesión', 'c) Es lo normal cuando el otro es más grande', 'd) Se compensa al final de la reunión'], c: 1 },
  { q: 'Un piloto (un centro, una sección, un mes) sirve para…', o: ['a) Bajar el riesgo del que firma y crear un hecho', 'b) Ganar tiempo mientras se decide el precio', 'c) Probar si la aplicación funciona', 'd) Cumplir un requisito administrativo'], c: 0 },
  { q: '«Déjelo conmigo, vamos a verlo» normalmente significa…', o: ['a) Que ya está aprobado', 'b) Que falta un papel', 'c) Que hay interés real y solo falta tiempo', 'd) Que no hay un no, pero tampoco un sí: hay que fijar fecha'], c: 3 },
  { q: '¿Por qué se escribe la minuta el mismo día?', o: ['a) Por cortesía institucional', 'b) Porque quien la escribe fija lo que se acordó', 'c) Porque lo exige la Secretaría', 'd) Para tener respaldo legal ante un juez'], c: 1 },
  { q: 'Si cambian al funcionario con el que acordaste…', o: ['a) El acuerdo sigue si está por escrito y a nombre de la institución', 'b) Se pierde todo y se empieza de cero', 'c) El nuevo funcionario está obligado por costumbre', 'd) Hay que volver a negociar el precio'], c: 0 },
]);

B.classGroups = JSON.stringify([
  { label: ['Posición', 'Interés'], headA: '🗣️ Lo que piden', headB: '🎯 Para qué lo piden', colA: 'ok', colB: 'no',
    words: [{ w: '«Queremos las misiones gratis»', t: 'ok' }, { w: 'Enseñar resultados en el informe anual', t: 'no' },
      { w: '«Tiene que estar en nuestro servidor»', t: 'ok' }, { w: 'Que nadie los culpe si se filtra algo', t: 'no' },
      { w: '«Necesitamos exclusividad por zona»', t: 'ok' }, { w: 'Que la competencia no llegue primero', t: 'no' },
      { w: '«Póngalo a nombre de la alcaldía»', t: 'ok' }, { w: 'Que se vea que hicieron algo este año', t: 'no' }] },
  { label: ['Se prepara antes', 'Se improvisa'], headA: '📋 Se lleva escrito', headB: '⚠️ Se improvisa en la sala', colA: 'ok', colB: 'no',
    words: [{ w: 'El límite que no se cruza', t: 'ok' }, { w: 'Decidir el precio delante de seis personas', t: 'no' },
      { w: 'Qué haces si no hay trato', t: 'ok' }, { w: 'Aceptar «lo que ustedes crean justo»', t: 'no' },
      { w: 'El mínimo que necesitas de verdad', t: 'ok' }, { w: 'Contestar sí en caliente', t: 'no' },
      { w: 'Las tres monedas que puedes pedir', t: 'ok' }, { w: 'Prometer una fecha sin mirar el calendario', t: 'no' }] },
  { label: ['Moneda que sirve', 'Humo'], headA: '🪙 Se puede cobrar', headB: '💨 Suena bien y no es nada', colA: 'ok', colB: 'no',
    words: [{ w: 'Una constancia firmada por el distrito', t: 'ok' }, { w: '«Visibilidad» sin decir dónde', t: 'no' },
      { w: 'Transporte y viáticos de la capacitación', t: 'ok' }, { w: '«Le vamos a recomendar mucho»', t: 'no' },
      { w: 'Una carta de presentación a tres directores', t: 'ok' }, { w: '«Esto le abre muchas puertas»', t: 'no' },
      { w: 'La impresión de mil fichas pagada', t: 'ok' }, { w: '«Quedamos en algo para el otro año»', t: 'no' }] },
  { label: ['Cierra', 'Se queda abierto'], headA: '🤝 Cierra de verdad', headB: '😶 Se queda en el aire', colA: 'ok', colB: 'no',
    words: [{ w: 'Minuta enviada el mismo día', t: 'ok' }, { w: '«Déjelo conmigo»', t: 'no' },
      { w: 'Fecha y nombre de quien firma', t: 'ok' }, { w: '«Estamos en eso»', t: 'no' },
      { w: 'Un piloto de un mes acordado', t: 'ok' }, { w: '«Cuando salga el presupuesto»', t: 'no' },
      { w: 'Lo que queda fuera, escrito', t: 'ok' }, { w: 'Un apretón de manos y nada más', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['Quien', 'te', 'recibe', 'casi', 'nunca', 'decide.'], c: 5, art: 'Lo que casi nunca puede hacer quien te atiende' },
  { s: ['La', 'posición', 'es', 'lo', 'que', 'piden.'], c: 1, art: 'Lo que se dice en voz alta' },
  { s: ['El', 'interés', 'explica', 'para', 'qué', 'lo', 'piden.'], c: 1, art: 'Lo que hay detrás de la petición' },
  { s: ['Cada', 'concesión', 'lleva', 'pegada', 'una', 'petición.'], c: 1, art: 'Lo que nunca se da suelto' },
  { s: ['Un', 'piloto', 'convierte', 'el', 'sí', 'grande', 'en', 'pequeño.'], c: 1, art: 'Un centro, una sección, un mes' },
  { s: ['La', 'minuta', 'fija', 'lo', 'que', 'se', 'acordó.'], c: 1, art: 'Media hoja enviada el mismo día' },
  { s: ['El', 'límite', 'se', 'decide', 'en', 'frío.'], c: 1, art: 'La línea que no se cruza' },
  { s: ['La', 'institución', 'no', 'recuerda:', 'cambia', 'el', 'funcionario.'], c: 1, art: 'Lo que obliga a escribirlo todo' },
]);

B.cmpData = JSON.stringify([
  { s: 'Lo que piden en voz alta es la ___.', opts: ['posición', 'minuta', 'moneda'], c: 0 },
  { s: 'Para qué lo piden de verdad es el ___.', opts: ['interés', 'límite', 'aval'], c: 0 },
  { s: 'Lo que haces si te levantas de la mesa es tu ___.', opts: ['alternativa', 'excusa', 'condición'], c: 0 },
  { s: 'La línea que se decide en frío es el ___ que no se cruza.', opts: ['límite', 'precio', 'plazo'], c: 0 },
  { s: 'Alcance, constancias y transporte son ___ que no es dinero.', opts: ['moneda', 'trámite', 'favor'], c: 0 },
  { s: 'Un centro, una sección y un mes es un ___.', opts: ['piloto', 'aval', 'informe'], c: 0 },
  { s: 'El papel que fija lo acordado el mismo día es la ___.', opts: ['minuta', 'constancia', 'factura'], c: 0 },
  { s: 'Lo que la institución protege es el ___ de quien firma.', opts: ['riesgo', 'sueldo', 'horario'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Posición', 'Interés'], btnA: '🗣️ Posición', btnB: '🎯 Interés', colA: 'ok', colB: 'no',
    words: [{ w: '«Lo queremos gratis»', t: 'ok' }, { w: 'Enseñar algo en el informe', t: 'no' },
      { w: '«En nuestro servidor»', t: 'ok' }, { w: 'Que no los culpen si se filtra', t: 'no' },
      { w: '«Exclusividad por zona»', t: 'ok' }, { w: 'Que no llegue la competencia', t: 'no' },
      { w: '«A nombre de la alcaldía»', t: 'ok' }, { w: 'Que se vea que hicieron algo', t: 'no' },
      { w: '«Necesitamos veinte aulas»', t: 'ok' }, { w: 'Justificar el presupuesto', t: 'no' }] },
  { label: ['Moneda', 'Humo'], btnA: '🪙 Moneda', btnB: '💨 Humo', colA: 'ok', colB: 'no',
    words: [{ w: 'Constancia del distrito', t: 'ok' }, { w: '«Visibilidad»', t: 'no' },
      { w: 'Transporte pagado', t: 'ok' }, { w: '«Le recomendamos»', t: 'no' },
      { w: 'Carta a tres directores', t: 'ok' }, { w: '«Le abre puertas»', t: 'no' },
      { w: 'Mil fichas impresas', t: 'ok' }, { w: '«El otro año vemos»', t: 'no' },
      { w: 'Dos horas de capacitación pagadas', t: 'ok' }, { w: '«Cuente con nosotros»', t: 'no' }] },
  { label: ['Cierra', 'Se abre'], btnA: '🤝 Cierra', btnB: '😶 Queda abierto', colA: 'ok', colB: 'no',
    words: [{ w: 'Minuta el mismo día', t: 'ok' }, { w: '«Déjelo conmigo»', t: 'no' },
      { w: 'Fecha y quien firma', t: 'ok' }, { w: '«Estamos en eso»', t: 'no' },
      { w: 'Piloto de un mes', t: 'ok' }, { w: '«Cuando salga el presupuesto»', t: 'no' },
      { w: 'Lo que queda fuera, escrito', t: 'ok' }, { w: 'Solo un apretón de manos', t: 'no' },
      { w: 'Copia a quien decide', t: 'ok' }, { w: '«Ya nos comunicamos»', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se prepara una mesa', steps: ['Averiguar quién decide, quién traba y quién solo transmite', 'Escribir el interés que hay detrás de lo que piden', 'Escribir tu mínimo: lo que necesitas de verdad', 'Escribir el límite que no se cruza', 'Escribir qué haces si no hay trato', 'Preparar tres monedas que puedes pedir además del dinero'] },
  { label: 'Cómo se conduce la reunión', steps: ['Preguntar para qué lo quieren, antes de proponer nada', 'Ofrecer una salida que cubra ese interés y no tu posición', 'Cambiar cada cesión por una condición', 'Proponer un piloto en vez de un acuerdo grande', 'Cerrar diciendo quién hace qué y para cuándo'] },
  { label: 'Qué se hace después de la reunión', steps: ['Escribir la minuta ese mismo día, en media hoja', 'Incluir lo que quedó fuera, no solo lo acordado', 'Enviarla a quien estuvo y con copia a quien decide', 'Pedir que confirmen por escrito, aunque sea con un «de acuerdo»', 'Fijar la fecha de la siguiente y apuntarla en el calendario'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Casi nunca puede decir sí, pero casi siempre puede decir no', ans: 'Quien te recibe', opts: ['Quien te recibe', 'Quien decide', 'Quien traba', 'Quien transmite'] },
  { desc: 'Lo que la institución protege de verdad', ans: 'El riesgo del funcionario', opts: ['El riesgo del funcionario', 'El presupuesto', 'El prestigio', 'El calendario'] },
  { desc: 'Lo que piden en voz alta', ans: 'La posición', opts: ['La posición', 'El interés', 'El límite', 'La moneda'] },
  { desc: 'Para qué lo piden en realidad', ans: 'El interés', opts: ['El interés', 'La posición', 'La minuta', 'El piloto'] },
  { desc: 'Tu plan si te levantas de la mesa', ans: 'Qué pasa si no hay trato', opts: ['Qué pasa si no hay trato', 'El límite que no se cruza', 'La concesión con condición', 'La mesa pública'] },
  { desc: 'Alcance, constancias, transporte e impresión', ans: 'La moneda que no es dinero', opts: ['La moneda que no es dinero', 'El interés', 'El piloto', 'La minuta'] },
  { desc: 'Un centro, una sección, un mes', ans: 'El piloto', opts: ['El piloto', 'La minuta', 'El límite', 'La posición'] },
  { desc: 'Media hoja con quién hace qué y para cuándo', ans: 'La minuta', opts: ['La minuta', 'El aval', 'La constancia', 'El interés'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: '«Queremos las misiones gratis para todo el departamento»', func: 'Un piloto en tres centros, con constancia del distrito y fecha de revisión', opts: ['Un piloto en tres centros, con constancia del distrito y fecha de revisión', 'Aceptar y confiar en que después se arregle', 'Decir que no y cerrar la puerta', 'Pedir el doble para poder bajar luego'] },
  { trans: '«Esto tiene que estar alojado en nuestro servidor»', func: 'Preguntar qué temen que pase, y ofrecer un informe agregado que lo cubra', opts: ['Preguntar qué temen que pase, y ofrecer un informe agregado que lo cubra', 'Aceptar el traslado para no perder el acuerdo', 'Explicar por qué su servidor es peor', 'Dejar el tema para más adelante'] },
  { trans: 'No hay presupuesto, pero quieren el material', func: 'Cobrar en otra moneda: constancia, transporte, impresión y acceso a directores', opts: ['Cobrar en otra moneda: constancia, transporte, impresión y acceso a directores', 'Regalarlo este año y cobrar el próximo', 'Rechazar la reunión hasta que haya dinero', 'Bajar el precio a la mitad'] },
  { trans: 'Piden bajar el precio delante de seis personas', func: 'No decidir en la sala: ofrecer mandar dos opciones por escrito mañana', opts: ['No decidir en la sala: ofrecer mandar dos opciones por escrito mañana', 'Bajarlo un poco para no quedar mal', 'Explicar los costos con detalle ahí mismo', 'Mantener el precio y no dar alternativa'] },
  { trans: 'Llevan tres meses con «lo estamos viendo»', func: 'Poner una fecha y decir qué pasa si llega sin respuesta', opts: ['Poner una fecha y decir qué pasa si llega sin respuesta', 'Seguir esperando y recordar cada semana', 'Bajar las condiciones para desatascarlo', 'Buscar a alguien por encima sin avisar'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Se acordó todo con un funcionario y al mes lo trasladaron', characteristic: 'El acuerdo era con la persona y no con la institución, por escrito', opts: ['El acuerdo era con la persona y no con la institución, por escrito', 'El nuevo funcionario tenía otra opinión', 'Faltó insistir más', 'El proyecto no era prioritario'] },
  { disease: 'Se bajó el precio en la reunión y después pidieron más cosas', characteristic: 'Se cedió sin pedir nada a cambio, así que la línea se movió', opts: ['Se cedió sin pedir nada a cambio, así que la línea se movió', 'El precio inicial era muy alto', 'Había demasiada gente en la sala', 'No se explicaron bien los costos'] },
  { disease: 'Pasaron cuatro meses esperando una respuesta que nunca llegó', characteristic: 'Se tomó un «déjelo conmigo» por un sí y nadie puso fecha', opts: ['Se tomó un «déjelo conmigo» por un sí y nadie puso fecha', 'La institución actuó de mala fe', 'Faltaba un documento', 'El correo se perdió'] },
  { disease: 'Usaron el material un año entero «de prueba» y nunca se firmó', characteristic: 'El piloto no traía fecha de fin ni qué pasaba al terminar', opts: ['El piloto no traía fecha de fin ni qué pasaba al terminar', 'El material gustó demasiado', 'Faltó cobrarles antes', 'No se hizo capacitación'] },
  { disease: 'Se aceptó un trato en el que no había ninguna moneda para el proyecto', characteristic: 'Se fue a la mesa sin escribir qué se necesitaba de verdad', opts: ['Se fue a la mesa sin escribir qué se necesitaba de verdad', 'La institución era demasiado grande', 'El proyecto no tenía experiencia', 'Faltó un abogado'] },
  { disease: 'Seis meses después dieron por incluido algo que nunca se habló', characteristic: 'La minuta no decía qué quedaba fuera del acuerdo', opts: ['La minuta no decía qué quedaba fuera del acuerdo', 'Se firmó demasiado rápido', 'Hubo mala intención', 'El acuerdo era muy largo'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Casi nunca puede decir sí, pero casi siempre puede decir no.', type: 'Quien te recibe' },
  { s: 'Lo que la institución protege de verdad.', type: 'El riesgo del funcionario' },
  { s: 'Lo que piden en voz alta.', type: 'La posición' },
  { s: 'Para qué lo piden en realidad.', type: 'El interés' },
  { s: 'Tu plan si te levantas de la mesa.', type: 'Qué pasa si no hay trato' },
  { s: 'La línea que se decide en frío y en casa.', type: 'El límite que no se cruza' },
  { s: 'Alcance, constancias, transporte e impresión.', type: 'La moneda que no es dinero' },
  { s: 'Un centro, una sección, un mes.', type: 'El piloto' },
  { s: 'Media hoja con quién hace qué y para cuándo.', type: 'La minuta' },
  { s: '«Déjelo conmigo», «estamos en eso».', type: 'El sí que no es un sí' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: '«Lo queremos gratis»', gen: 'Petición', n: 'En voz alta', g: 'Posición', t: 'Lo que se dice' },
  { w: 'Enseñar algo en el informe anual', gen: 'Petición', n: 'Por debajo', g: 'Interés', t: 'Para qué lo piden' },
  { w: 'El límite que no se cruza', gen: 'Preparación', n: 'Antes', g: 'Se lleva escrito', t: 'Se decide en frío' },
  { w: 'Decidir el precio en la sala', gen: 'Preparación', n: 'En caliente', g: 'Se improvisa', t: 'Casi siempre sale caro' },
  { w: 'Constancia del distrito', gen: 'Pago', n: 'Real', g: 'Moneda', t: 'Se puede enseñar' },
  { w: '«Visibilidad» sin decir dónde', gen: 'Pago', n: 'Vago', g: 'Humo', t: 'No se puede cobrar' },
  { w: 'Minuta el mismo día', gen: 'Cierre', n: 'Escrito', g: 'Cierra', t: 'Fija lo acordado' },
  { w: '«Déjelo conmigo»', gen: 'Cierre', n: 'Verbal', g: 'Queda abierto', t: 'Ni sí ni no' },
  { w: 'Un piloto de un mes', gen: 'Alcance', n: 'Pequeño', g: 'Baja el riesgo', t: 'Crea un hecho' },
  { w: 'Un convenio para el departamento', gen: 'Alcance', n: 'Grande', g: 'Sube el riesgo', t: 'Tarda y se atasca' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Lo que piden en voz alta es la ___.', opts: ['posición', 'minuta', 'moneda'], ans: 'posición' },
  { s: 'Para qué lo piden es el ___.', opts: ['interés', 'aval', 'plazo'], ans: 'interés' },
  { s: 'Lo que haces si no hay trato es tu ___.', opts: ['alternativa', 'condición', 'excusa'], ans: 'alternativa' },
  { s: 'La línea que se decide en frío es el ___.', opts: ['límite', 'precio', 'informe'], ans: 'límite' },
  { s: 'Constancias y transporte son ___ que no es dinero.', opts: ['moneda', 'favor', 'trámite'], ans: 'moneda' },
  { s: 'Un mes en una sección es un ___.', opts: ['piloto', 'aval', 'censo'], ans: 'piloto' },
  { s: 'El papel del mismo día es la ___.', opts: ['minuta', 'factura', 'boleta'], ans: 'minuta' },
  { s: 'La institución protege el ___ de quien firma.', opts: ['riesgo', 'sueldo', 'puesto'], ans: 'riesgo' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica la diferencia entre posición e interés, con el caso de la institución que pide las misiones gratis para el departamento.', ans: 'La posición es lo que dicen en voz alta: «queremos las misiones gratis para todos los centros del departamento». El interés es para qué lo quieren, y casi nunca coincide: suele ser poder enseñar algo hecho en el informe de fin de año, o cumplir una meta que le pusieron a quien te recibe. Eso cambia la conversación entera, porque a la posición solo se puede decir sí o no, y al interés se le pueden ofrecer dos o tres salidas. Un piloto en tres centros, con constancia del distrito y con datos agregados para el informe, cubre el interés completo y no regala el trabajo de un año. La pregunta que abre esto es corta y hay que hacerla antes de proponer nada: «¿para qué lo necesitan?».' },
  { q: '¿Qué es «qué pasa si no hay trato» y por qué es lo que de verdad da fuerza en una mesa?', ans: 'Es tu plan si te levantas: qué haces con tu tiempo, con tu material y con tu año escolar si esa conversación no termina en nada. Se escribe antes de sentarse, en casa y en frío. Da fuerza porque quien no tiene a dónde ir acepta cualquier cosa, y eso se nota en la mesa aunque nadie lo diga: se nota en que aceptas plazos imposibles, en que bajas el precio sin que te lo pidan dos veces y en que contestas que sí en caliente. Al revés, quien tiene escrito que puede seguir con dos centros por su cuenta negocia tranquilo, y esa tranquilidad vale más que cualquier argumento. Además obliga a mirar algo incómodo y útil: a veces el plan sin trato es mejor que el trato que están ofreciendo.' },
  { q: 'La institución dice que no tiene presupuesto. ¿Qué monedas se pueden pedir y cómo se piden?', ans: 'Casi nunca hay dinero y casi siempre hay otras monedas, que se piden igual de concretas que un precio: la constancia firmada por el distrito, que sirve para todas las puertas siguientes; el transporte y los viáticos de la capacitación, que son gasto real; la impresión de las fichas, que ellos tienen y el proyecto no; el acceso a directores, con una carta de presentación a personas con nombre; y horas de capacitación pagadas dentro de la jornada. La regla para distinguir moneda de humo es simple: una moneda se puede escribir con número, con fecha y con nombre. «Visibilidad», «le abre puertas» y «le vamos a recomendar» no se pueden escribir así, así que no son pago: son una forma amable de pedir el trabajo gratis.' },
  { q: '¿Qué es el sí que no es un sí, cuánto cuesta y cómo se corta?', ans: 'Es el «vamos a verlo», el «déjelo conmigo» y el «estamos en eso». La institución casi nunca dice que no, porque decir que no cuesta y callar no cuesta nada: simplemente deja de contestar. El daño no es la negativa, es el tiempo: se pierden tres o cuatro meses esperando algo que nunca fue un sí, y en un proyecto con año escolar eso puede ser la mitad de la oportunidad. Se corta poniendo fecha en la propia reunión, en voz alta y sin sonar a amenaza: «te llamo el 15, y si para entonces no hay respuesta lo entiendo como que este año no se puede y seguimos con los centros que ya tenemos». Eso convierte el silencio en una respuesta, que es todo lo que hacía falta.' },
  { q: 'Explica por qué un piloto es mejor que un acuerdo grande, y qué tiene que traer escrito.', ans: 'Un acuerdo grande obliga a quien firma a asumir un riesgo que nadie le va a agradecer si sale bien y que le van a cobrar si sale mal, así que su reacción natural es aplazar. Un piloto (un centro, una sección, un mes) baja ese riesgo casi a cero y además crea un hecho: al mes siguiente ya no se discute una idea, se discute algo que pasó, con datos. Pero un piloto sin escribir se convierte en la trampa contraria: se usa el material un año entero «de prueba» y nunca se firma nada. Por eso tiene que traer cuatro cosas por escrito: qué incluye, cuándo termina, cómo se mide si funcionó y qué pasa el día siguiente de que termine, con las dos opciones nombradas, la de seguir y la de parar.' },
  { q: '¿Qué es la minuta, qué lleva y por qué la escribe siempre uno mismo?', ans: 'La minuta es media hoja enviada el mismo día que dice qué se acordó, quién hace qué, para cuándo, y también qué quedó fuera. La escribe uno mismo por una razón práctica: quien escribe la minuta fija lo que pasó, y casi nadie se molesta en escribirla, así que la versión que queda es la tuya. Lo que quedó fuera es la parte que más se olvida y la que más problemas evita: sin ella, dentro de seis meses alguien da por incluido algo que nunca se habló y ya no hay manera de discutirlo. Se manda a quien estuvo en la reunión y con copia a quien decide, y se pide una confirmación aunque sea de una línea. Y todo va a nombre de la institución, no de la persona: la institución no recuerda, cambia el funcionario y empieza de cero.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['MESA', 'INTERES', 'POSICION', 'LIMITE', 'MONEDA', 'FIRMA']),
  haceSopa(10, ['MINUTA', 'PILOTO', 'PLAZO', 'CEDER', 'RIESGO', 'ACTA']),
  haceSopa(10, ['ACUERDO', 'FUNCION', 'ALCANCE', 'ESPERA', 'FECHA', 'COPIA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'En una institución, quien te recibe casi siempre puede decir sí.', a: false },
  { q: 'Lo que la institución protege de verdad es que no le caiga un problema a quien firma.', a: true },
  { q: 'La posición es lo que piden y el interés es para qué lo piden.', a: true },
  { q: 'A una posición se le puede ofrecer más de una salida distinta.', a: false },
  { q: 'Tener escrito qué haces si no hay trato es lo que más fuerza da en una mesa.', a: true },
  { q: 'Ceder algo sin pedir nada a cambio enseña buena voluntad y ayuda al acuerdo.', a: false },
  { q: 'Cuando no hay presupuesto, casi siempre hay otras monedas que se pueden pedir.', a: true },
  { q: '«Visibilidad» y «le abre puertas» son formas de pago que se pueden escribir.', a: false },
  { q: 'Un piloto baja el riesgo de quien firma y crea un hecho para la siguiente conversación.', a: true },
  { q: 'Un piloto sin fecha de fin puede convertirse en un año de uso sin firmar nada.', a: true },
  { q: '«Déjelo conmigo» equivale a un sí mientras no digan lo contrario.', a: false },
  { q: 'La minuta la escribe quien convocó la reunión.', a: false },
  { q: 'En la minuta también se escribe lo que quedó fuera del acuerdo.', a: true },
  { q: 'Si cambian al funcionario, un acuerdo escrito a nombre de la institución sigue en pie.', a: true },
  { q: 'Lo difícil de una negociación se resuelve mejor con mucha gente en la sala.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: 'Antes de preparar una mesa, lo primero que hay que averiguar es…', o: ['a) Cuánto presupuesto tienen', 'b) Quién decide, quién traba y quién solo transmite', 'c) Quién es el más simpático', 'd) Cuántos van a asistir'], a: 1 },
  { q: 'La mayoría de las negativas que parecen burocracia son en realidad…', o: ['a) Alguien evitando un riesgo que nadie le va a agradecer', 'b) Falta de interés en el tema', 'c) Un problema de presupuesto', 'd) Mala organización interna'], a: 0 },
  { q: '«Queremos las misiones gratis para el departamento» es…', o: ['a) Un interés', 'b) Un límite', 'c) Una posición', 'd) Una moneda'], a: 2 },
  { q: 'La pregunta que hay que hacer antes de proponer nada es…', o: ['a) «¿Cuánto pueden pagar?»', 'b) «¿Quién firma esto?»', 'c) «¿Para cuándo lo necesitan?»', 'd) «¿Para qué lo necesitan?»'], a: 3 },
  { q: 'El límite que no se cruza se decide…', o: ['a) En frío y en casa, antes de sentarse', 'b) En la reunión, según cómo vaya', 'c) Al final, cuando se ve la oferta', 'd) Cuando la otra parte lo pregunta'], a: 0 },
  { q: 'Ante «bájenos el precio» delante de seis personas, lo mejor es…', o: ['a) Bajarlo un poco para no quedar mal', 'b) No decidir en la sala y mandar dos opciones por escrito', 'c) Explicar los costos con detalle ahí mismo', 'd) Mantener el precio sin dar alternativa'], a: 1 },
  { q: 'Una moneda que no es dinero se distingue del humo porque…', o: ['a) La ofrece alguien con cargo alto', 'b) Se menciona en la reunión', 'c) Se puede escribir con número, fecha y nombre', 'd) Viene por escrito después'], a: 2 },
  { q: 'Cada cesión en la mesa debe ir acompañada de…', o: ['a) Una explicación de los costos', 'b) Un agradecimiento', 'c) Una fecha límite', 'd) Una petición a cambio'], a: 3 },
  { q: 'Un piloto bien hecho trae escrito…', o: ['a) Qué incluye, cuándo termina, cómo se mide y qué pasa después', 'b) Solo la fecha de inicio', 'c) El precio del acuerdo grande', 'd) La lista de participantes'], a: 0 },
  { q: 'Ante tres meses de «lo estamos viendo», lo que corta el silencio es…', o: ['a) Insistir cada semana', 'b) Poner una fecha y decir qué pasa si llega sin respuesta', 'c) Buscar a alguien por encima', 'd) Bajar las condiciones'], a: 1 },
  { q: 'La minuta se manda…', o: ['a) Cuando la pidan', 'b) Al final del proceso', 'c) El mismo día, a quien estuvo y con copia a quien decide', 'd) Solo si hubo acuerdo'], a: 2 },
  { q: 'Escribir en la minuta lo que quedó fuera sirve para…', o: ['a) Alargar el documento', 'b) Cumplir un requisito', 'c) Enseñar que se estuvo atento', 'd) Que nadie dé por incluido después lo que nunca se habló'], a: 3 },
  { q: 'La asimetría de tiempo significa que…', o: ['a) La institución tiene tiempo y tú no, así que la prisa no se enseña', 'b) Las reuniones duran demasiado', 'c) Hay que responder rápido para no perder el turno', 'd) Los trámites tardan lo mismo para todos'], a: 0 },
  { q: 'Una decisión tomada en enero, comparada con la misma en septiembre…', o: ['a) Vale lo mismo', 'b) Vale por todo el año escolar', 'c) Es más difícil de conseguir', 'd) Necesita más papeles'], a: 1 },
  { q: 'El acuerdo se escribe a nombre de…', o: ['a) Quien te recibió, que es quien lo impulsa', 'b) Las dos personas que hablaron', 'c) La institución, porque cambia el funcionario', 'd) El proyecto, para simplificar'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Lo que piden en voz alta es la ___.', a: 'posición' },
  { q: 'Para qué lo piden en realidad es el ___.', a: 'interés' },
  { q: 'Lo que la institución protege es el ___ de quien firma.', a: 'riesgo' },
  { q: 'Tu plan si te levantas de la mesa es tu ___.', a: 'alternativa' },
  { q: 'La línea que se decide en frío es el ___ que no se cruza.', a: 'límite' },
  { q: 'Alcance, constancias y transporte son la ___ que no es dinero.', a: 'moneda' },
  { q: 'Cada cesión lleva pegada una ___.', a: 'condición' },
  { q: 'Un centro, una sección y un mes es un ___.', a: 'piloto' },
  { q: 'El papel de media hoja del mismo día es la ___.', a: 'minuta' },
  { q: 'En la minuta también se escribe lo que quedó ___.', a: 'fuera' },
  { q: '«Déjelo conmigo» no es un sí: hay que poner una ___.', a: 'fecha' },
  { q: 'El acuerdo se escribe a nombre de la ___, no de la persona.', a: 'institución' },
  { q: 'El que tiene ___ paga más, así que no se enseña.', a: 'prisa' },
  { q: 'Una decisión en enero vale por todo el ___ escolar.', a: 'año' },
  { q: 'Con seis personas en la sala, lo difícil se habla ___.', a: 'aparte' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'La posición', def: 'Lo que piden en voz alta' },
  { term: 'El interés', def: 'Para qué lo piden de verdad' },
  { term: 'El riesgo del funcionario', def: 'Lo que la institución protege' },
  { term: 'Qué pasa si no hay trato', def: 'Tu plan si te levantas' },
  { term: 'El límite que no se cruza', def: 'Se decide en frío y en casa' },
  { term: 'La moneda que no es dinero', def: 'Constancias, transporte, impresión' },
  { term: 'Concesión con condición', def: 'Nada se da suelto' },
  { term: 'El piloto', def: 'Un centro, una sección, un mes' },
  { term: 'El sí que no es un sí', def: '«Déjelo conmigo»' },
  { term: 'La minuta', def: 'Media hoja el mismo día' },
  { term: 'El acta de lo que no se acordó', def: 'Lo que quedó fuera, escrito' },
  { term: 'La asimetría de tiempo', def: 'Ellos tienen tiempo y tú no' },
  { term: 'El calendario como palanca', def: 'Enero vale por todo el año' },
  { term: 'La mesa pública', def: 'Negocia con lo que van a pensar de él' },
  { term: 'La institución no recuerda', def: 'Cambia el funcionario y se empieza de cero' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'La dirección departamental convoca a una mesa: quieren las misiones para todos los centros del departamento, sin costo, y piden empezar el mes que viene. Quien preside la reunión no puede firmar convenios.' },
  { txt: 'Al terminar una reunión que fue muy bien, el funcionario dice «déjelo conmigo, yo lo muevo». Han pasado tres meses y no hay respuesta a dos correos.' },
  { txt: 'En una reunión con seis personas de la institución, el que la preside pide delante de todos que se baje el precio de 150 lempiras por aula al mes a la mitad.' },
  { txt: 'Ofrecen adoptar las misiones para el departamento a cambio de que el material salga a nombre de la institución y sin el nombre del autor.' },
  { txt: 'La alcaldía ofrece imprimir 5.000 fichas si el logotipo va en la portada. Hay elecciones municipales en ocho meses.' },
  { txt: 'Un centro lleva un año usando las misiones «de prueba». Nunca se firmó nada, nadie ha pagado y el director habla del proyecto como si ya fuera suyo.' },
  { txt: 'Trasladan al funcionario con el que se acordó todo. El nuevo pide que se le explique el proyecto desde el principio y no encuentra ningún papel del acuerdo anterior.' },
  { txt: 'Ponen como condición para dar el aval que la aplicación se aloje en el servidor de la institución y que ellos administren los datos de los estudiantes.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Cuál es la posición y cuál es el interés que hay debajo?',
  '2. ¿Quién puede firmar esto, y qué riesgo está protegiendo?',
  '3. Escribe en 3-4 frases lo que propones, con el piloto y la moneda que pides a cambio.',
  '4. ¿Cuál es tu límite, qué haces si no hay trato y qué va en la minuta?',
]);

B.critCaseGuides = JSON.stringify([
  'La posición es lo que se dijo en voz alta; el interés casi nunca coincide y suele ser enseñar algo hecho, cumplir una meta o no cargar con un riesgo.',
  'Quien recibe casi nunca firma. Y lo que se protege no es el presupuesto: es que a quien firme no le caiga después un problema que nadie le va a agradecer haber evitado.',
  'Casi ninguna mesa se cierra entera: se cierra un pedazo pequeño y pronto. El piloto es la herramienta, y la moneda se pide en la misma frase, no después.',
  'Sin límite escrito, sin alternativa y sin minuta no hubo negociación: hubo una conversación agradable de la que cada uno salió con una idea distinta.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Como no tienen presupuesto, se lo damos gratis este año y el otro ya veremos".', g1: 'Regalar el primer año fija el precio de todos los siguientes: lo que se dio gratis una vez pasa a ser lo normal, y pedir dinero después parece un cambio de condiciones.', g2: 'Se cobra en otra moneda desde el primer día: constancia del distrito, transporte de la capacitación, impresión pagada. Y se escribe qué pasa al terminar el año.' },
  { txt: '"Bajo el precio ahora para que se vea buena voluntad y luego pido algo".', g1: 'Una cesión suelta mueve la línea y no compra nada: la siguiente conversación empieza desde el precio nuevo, y encima se espera otra cesión.', g2: 'Cada cesión lleva pegada una condición en la misma frase: «puedo bajar a 100 si el acuerdo pasa de un año a tres y lo firma el distrito».' },
  { txt: '"Me dijo que lo dejara con él, así que está encaminado".', g1: '«Déjelo conmigo» no es un sí ni un no, y como callar no le cuesta nada a la institución, el silencio puede durar meses.', g2: 'Se pone fecha en la propia reunión, en voz alta: «te llamo el 15, y si no hay respuesta lo entiendo como que este año no se puede».' },
  { txt: '"El piloto va bien, mejor no molestar con papeles ahora".', g1: 'Un piloto sin fecha de fin se convierte en un año de uso gratis, y cuanto más dura, más difícil es cobrar por algo que ya se estaba dando.', g2: 'El piloto se escribe antes de empezar: qué incluye, cuándo termina, cómo se mide y qué pasa el día siguiente, con las dos opciones nombradas.' },
  { txt: '"El acuerdo lo tengo con el licenciado, que es muy accesible".', g1: 'La institución no recuerda: si lo trasladan, el acuerdo se va con él y el que llega no tiene ninguna obligación de sostener lo que no está escrito.', g2: 'Todo a nombre de la institución, por escrito, con copia a quien decide, y una minuta por reunión aunque parezca exagerado.' },
  { txt: '"Nos piden el nombre del autor fuera, pero a cambio entramos a todo el departamento".', g1: 'La autoría es de las pocas cosas que no vuelven: una vez que el material circula sin nombre, recuperarlo exige una pelea que no se puede ganar.', g2: 'Ese es un límite que se decide en frío y en casa. Se acepta el alcance, se cede el logotipo si hace falta, y el nombre del autor se queda, que además no le cuesta nada a la institución.' },
]);

B.critDecisionBank = JSON.stringify([
  'La dirección departamental quiere las misiones para todos los centros sin costo: ¿qué propones y con qué piloto?',
  'Llevan tres meses con «déjelo conmigo»: ¿qué haces, y qué dices exactamente para cortar el silencio?',
  'Piden bajar el precio delante de seis personas: ¿qué contestas ahí y qué mandas después?',
  'Ofrecen alcance a cambio de que el material salga sin el nombre del autor: ¿qué se cede y qué no?',
  'La alcaldía imprime 5.000 fichas con su logotipo y hay elecciones en ocho meses: ¿se acepta y con qué condición?',
  'Un centro lleva un año «de prueba» sin firmar nada: ¿cómo se cierra sin romper la relación?',
  'Trasladaron al funcionario y el nuevo pide empezar de cero: ¿qué se enseña y qué se pide?',
  'Condicionan el aval a alojar la aplicación en su servidor y administrar los datos: ¿qué se contesta?',
]);

B.critDecisionGuide = `'La decisión correcta en esta etapa sigue siempre el mismo orden: primero se separa la posición del interés, porque a la posición solo se puede decir sí o no y al interés se le pueden ofrecer dos o tres salidas; después se mira quién decide de verdad y qué riesgo está protegiendo, que casi nunca es el presupuesto; después se propone un piloto pequeño y pronto en vez del acuerdo grande, y se pide la moneda en la misma frase en que se cede algo; y al final se cierra con minuta el mismo día, a nombre de la institución y con lo que quedó fuera escrito. Si al salir de la reunión no hay fecha ni papel, no hubo acuerdo: hubo una conversación agradable.'`;

B.critCompareBank = JSON.stringify([
  { a: 'Un piloto de un mes en tres centros, con fecha de fin escrita.', b: 'Un convenio para todo el departamento, firmado más adelante.', ga: 'Caso A: baja el riesgo de quien firma casi a cero y crea un hecho con datos para la siguiente conversación.', gb: 'Caso B: obliga a asumir un riesgo que nadie agradece si sale bien, así que la reacción natural es aplazarlo.' },
  { a: '«Puedo bajar a 100 si el acuerdo pasa de uno a tres años».', b: '«Se lo dejo en 100 para que se vea la buena voluntad».', ga: 'Caso A: cambia una cosa por otra, que es lo que se hace en una mesa, y deja el precio explicado.', gb: 'Caso B: mueve la línea sin comprar nada, y la próxima conversación empieza en 100 esperando otra rebaja.' },
  { a: '«Te llamo el 15; si no hay respuesta, este año seguimos con los centros que ya tenemos».', b: '«Quedo pendiente de lo que me digan».', ga: 'Caso A: convierte el silencio en una respuesta y pone el calendario de tu lado sin sonar a amenaza.', gb: 'Caso B: deja el reloj en manos de quien no tiene ninguna prisa, y tres meses después no ha pasado nada.' },
  { a: 'Minuta de media hoja, a nombre de la institución, con lo que quedó fuera.', b: 'Un apretón de manos con el funcionario que impulsa el proyecto.', ga: 'Caso A: sobrevive a un traslado y evita que dentro de seis meses se dé por incluido lo que nunca se habló.', gb: 'Caso B: se va con la persona el día que la cambien, y no queda nada que enseñarle al que llega.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se va a la mesa sin saber quién decide.', guide: 'Se negocia durante horas con alguien que no puede decir sí, y todo lo acordado tiene que volver a explicarse desde el principio a quien sí firma.' },
  { cause: 'Se contesta a la posición y no al interés.', guide: 'La conversación queda reducida a sí o no sobre lo que ellos propusieron, cuando había dos o tres salidas que cubrían lo que de verdad necesitaban.' },
  { cause: 'Se cede algo sin pedir nada a cambio.', guide: 'La línea se mueve, no se compra nada, y la siguiente reunión empieza desde la posición nueva esperando otra cesión.' },
  { cause: 'Se toma un «déjelo conmigo» por un sí.', guide: 'Pasan meses sin respuesta y sin daño aparente, hasta que se acaba el año escolar y la oportunidad se fue con él.' },
  { cause: 'El piloto empieza sin fecha de fin escrita.', guide: 'Se convierte en un año de uso gratis, y cuanto más dura, más difícil resulta cobrar por algo que ya se estaba dando.' },
  { cause: 'El acuerdo está a nombre de la persona, no de la institución.', guide: 'Un traslado lo borra entero, y el funcionario que llega no tiene ninguna obligación de sostener lo que no está escrito.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'El acuerdo sobrevivió a un cambio de funcionario.', guide: 'Estaba por escrito, a nombre de la institución y con copia a quien decide, así que el nuevo encontró el expediente hecho.' },
  { effect: 'Se cerró un piloto en tres centros en la misma reunión.', guide: 'Era pequeño y pronto, así que quien presidía sí podía autorizarlo sin pedir permiso a nadie.' },
  { effect: 'La rebaja de precio vino acompañada de tres años de acuerdo.', guide: 'La cesión llevaba pegada su condición en la misma frase, así que no se regaló nada: se cambió una cosa por otra.' },
  { effect: 'Un silencio de tres meses se resolvió en una semana.', guide: 'Había una fecha dicha en voz alta y una consecuencia clara, así que callar dejó de ser gratis.' },
  { effect: 'El proyecto entró al departamento y el autor siguió apareciendo.', guide: 'El nombre del autor estaba en el límite escrito en frío, y ceder el logotipo institucional cubrió el interés real sin tocarlo.' },
  { effect: 'Nadie dio por incluido después lo que nunca se habló.', guide: 'La minuta traía escrito lo que quedaba fuera, que es la parte que casi nadie escribe y la que más discusiones evita.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🪑', label: 'Quién está enfrente', text: 'Si <strong>decide, traba o solo transmite</strong>. <strong>Decide:</strong> qué se puede cerrar hoy. <strong>Se rompe:</strong> al negociar horas con quien no puede firmar. <strong>En M.E.T.A.S:</strong> el director autoriza su centro; el departamento necesita otra firma.' },
  { y: '2', icon: '🛡️', label: 'Qué protege', text: 'El <strong>riesgo de quien firma</strong>, no el presupuesto. <strong>Decide:</strong> por qué te dicen que no. <strong>Se rompe:</strong> al confundir burocracia con desinterés. <strong>En M.E.T.A.S:</strong> nadie premia al que autorizó algo que salió bien, y sí se le cobra si sale mal.' },
  { y: '3', icon: '🎯', label: 'Posición e interés', text: 'Lo que piden y <strong>para qué lo piden</strong>. <strong>Decide:</strong> cuántas salidas hay. <strong>Se rompe:</strong> al contestar a la posición. <strong>En M.E.T.A.S:</strong> «las misiones gratis» suele ser «algo que enseñar en el informe».' },
  { y: '4', icon: '🪙', label: 'La moneda', text: 'Alcance, constancias, transporte, impresión, acceso. <strong>Decide:</strong> si se puede cerrar sin presupuesto. <strong>Se rompe:</strong> al aceptar «visibilidad». <strong>En M.E.T.A.S:</strong> una constancia del distrito abre las diez puertas siguientes.' },
  { y: '5', icon: '⛔', label: 'El límite', text: 'La línea decidida <strong>en frío y en casa</strong>. <strong>Decide:</strong> cuándo levantarse. <strong>Se rompe:</strong> en la sala, donde ceder un poco siempre parece razonable. <strong>En M.E.T.A.S:</strong> el nombre del autor, los datos de menores y el criterio pedagógico.' },
  { y: '6', icon: '🌱', label: 'El piloto', text: 'Un sí grande convertido en <strong>uno pequeño y pronto</strong>. <strong>Decide:</strong> si hoy sale algo. <strong>Se rompe:</strong> sin fecha de fin, cuando se vuelve un año gratis. <strong>En M.E.T.A.S:</strong> un centro, una sección, un mes.' },
  { y: '7', icon: '📝', label: 'El cierre', text: 'La <strong>minuta del mismo día</strong>, con lo acordado y lo que quedó fuera. <strong>Decide:</strong> si el acuerdo existe. <strong>Se rompe:</strong> con el apretón de manos. <strong>En M.E.T.A.S:</strong> a nombre de la institución, porque el funcionario cambia.' },
]);

B.parteData = JSON.stringify({
  enfrente: {
    nombre: 'Quién está enfrente', icon: '🪑',
    estructura: { title: 'Qué es', info: '• Saber si quien te recibe <strong>decide, traba o transmite</strong><br>• Casi nunca puede decir sí, casi siempre puede decir no<br>• Y detrás hay alguien que firma y que no está en la sala' },
    funcion: { title: 'Cómo se prepara', info: '• Se pregunta antes: <strong>«¿quién firma esto?»</strong><br>• Se averigua qué meta le pusieron a esa persona este año<br>• Y se lleva algo que <strong>esa persona sí pueda autorizar hoy</strong>' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al negociar dos horas con quien no puede firmar<br>• Al confundir simpatía con capacidad de decidir<br>• Al saltarse a quien traba, que después lo cobra' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Un <strong>director</strong> autoriza su centro y puede decidirlo en la reunión<br>• El <strong>distrito</strong> abre varios centros pero tarda<br>• La <strong>Secretaría</strong> da alcance y nunca decide en una sola mesa' },
  },
  moneda: {
    nombre: 'La moneda que no es dinero', icon: '🪙',
    estructura: { title: 'Qué es', info: '• Todo lo que la institución <strong>sí tiene</strong> aunque no tenga presupuesto<br>• Constancias, transporte, impresión, horas pagadas, acceso<br>• Se pide igual de concreta que un precio' },
    funcion: { title: 'Cómo se prepara', info: '• Se llevan <strong>tres monedas escritas</strong>, en orden de lo que más sirve<br>• Se pide en la misma frase en que se cede algo<br>• Prueba: una moneda se escribe con <strong>número, fecha y nombre</strong>' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al aceptar «visibilidad» y «le abre puertas», que no se pueden cobrar<br>• Al regalar el primer año «para entrar»<br>• Al pedir la moneda después de haber cedido' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• La que más vale hoy: una <strong>constancia firmada por el distrito</strong>, que abre las puertas siguientes<br>• Y la impresión pagada, que es gasto real del proyecto y ellos ya tienen' },
  },
  limite: {
    nombre: 'El límite que no se cruza', icon: '⛔',
    estructura: { title: 'Qué es', info: '• La línea escrita <strong>en frío y en casa</strong>, antes de sentarse<br>• Va junto a «qué pasa si no hay trato»<br>• No es una postura dura: es lo que evita decidirlo con gente delante' },
    funcion: { title: 'Cómo se prepara', info: '• Se escriben <strong>tres cosas que no se ceden</strong> y por qué<br>• Se escribe la alternativa: qué haces si te levantas<br>• Y se lee otra vez la mañana de la reunión' },
    enfermedades: { title: 'Dónde se rompe', info: '• En la mesa pública, donde ceder un poco siempre parece razonable<br>• Con el «total, es solo esta vez»<br>• Cuando hay prisa: el que tiene prisa paga más' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Los tres de esta casa: el <strong>nombre del autor</strong>, los <strong>datos de menores</strong> y el <strong>criterio pedagógico</strong><br>• El logotipo institucional sí se cede; la autoría no vuelve' },
  },
  cierre: {
    nombre: 'El cierre por escrito', icon: '📝',
    estructura: { title: 'Qué es', info: '• Media hoja el <strong>mismo día</strong>: qué se acordó, quién hace qué, para cuándo<br>• Y <strong>lo que quedó fuera</strong>, que es lo que casi nadie escribe<br>• A nombre de la institución, no de la persona' },
    funcion: { title: 'Cómo se prepara', info: '• La escribe uno mismo: <strong>quien escribe la minuta fija lo que pasó</strong><br>• Se manda a quien estuvo, con copia a quien decide<br>• Se pide una confirmación, aunque sea de una línea' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con el apretón de manos y el «ya nos comunicamos»<br>• Al no poner fecha, que deja el reloj en manos de quien no tiene prisa<br>• Al dejar fuera lo que quedó fuera' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Es la misma disciplina del <strong>expediente</strong> de la etapa 2: lo que no está escrito, no pasó<br>• Y la razón de fondo: <strong>la institución no recuerda</strong>, cambia el funcionario y se empieza de cero' },
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
  [/📜 \*Ruta del Poder Político · Etapa 2\* 📜/g, '🤝 *Ruta del Poder Político · Etapa 3* 🤝'],
  [/Ruta del Poder Político · Etapa 2: Normas y trámites/g, 'Ruta del Poder Político · Etapa 3: La mesa'],
  [/completó la Etapa 2 de la Ruta del Poder Político/g, 'completó la Etapa 3 de la Ruta del Poder Político'],
  [/El papel que falta/g, 'La mesa que se cierra'],
  [/el papel que falta/g, 'la mesa que se cierra'],
  [/Normas y trámites: qué papel hace falta y quién lo emite/g, 'La mesa: negociar con una institución'],
  [/Normas y trámites/g, 'La mesa'],
  [/normas y trámites/g, 'la mesa'],
  [/Ruta del Poder Político · Autocapacitación Técnica/g, 'Ruta del Poder Político · Etapa 3 · Poder Político'],
  [/📜 ¡/g, '🤝 ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
