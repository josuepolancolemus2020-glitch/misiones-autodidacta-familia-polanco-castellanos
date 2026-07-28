/* Inyecta los bancos de la misión «Canales: dónde está la audiencia y qué se
   publica» (Ruta de la Marca, etapa 4) sobre el molde copiado de la etapa 3, y
   de paso cambia los rótulos que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-canales.js

   La etapa 1 dijo para quién, la 2 qué se entrega y a qué precio, la 3 cómo se
   cuenta sin inflarlo. Faltaba dónde se dice y cada cuánto. Las siete piezas
   de un canal son la gente, la promesa, el ritmo, el formato, la puerta, la
   medida y el cierre; y la regla corta es que un canal que no se sostiene doce
   meses no es un canal, es una campaña.                                      */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-marca-canales', 'js', 'canales.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260802;
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

B.SAVE_KEY = `'faro_mkt_canales_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de los canales superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de los canales explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de canales experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del canal maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de los canales' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 4 de la Ruta de la Marca completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Publica donde le queda cómodo 📢' },
  { t: 25, n: 'Mira dónde está su gente 👥' },
  { t: 55, n: 'Elige un ritmo que aguanta 📅' },
  { t: 90, n: 'Pone puerta a lo que publica 🚪' },
  { t: 130, n: 'Construye sobre lo propio 🏠' },
  { t: 165, n: 'Mide lo que importa 📏' },
  { t: 200, n: 'Sostiene un canal doce meses 📡' },
]);

B.fcData = JSON.stringify([
  { w: 'Un canal', a: '📡 Un sitio donde tu gente <strong>ya está</strong> y donde tú apareces cada cierto tiempo con algo que le sirve. Una cuenta abierta y muda no es un canal: es una promesa que se ve incumplida.' },
  { w: 'La regla de los doce meses', a: '📅 Un canal que no puedes sostener un año <strong>no es un canal, es una campaña</strong>. Y una campaña está bien, siempre que se sepa que va a terminar.' },
  { w: 'La señal de alarma', a: '🚨 <strong>Abrir un canal nuevo cuando el anterior está sin contestar.</strong> Casi nunca falta un canal: casi siempre falta ritmo en el que ya se tiene.' },
  { w: 'El canal que alcanza', a: '📣 Sirve para que te <strong>conozca gente nueva</strong>: una charla, un video compartido, un anuncio. Se mide en primeras visitas y no vale nada si no hay puerta.' },
  { w: 'El canal que retiene', a: '🤝 Sirve para <strong>seguir hablando con quien ya te conoce</strong>: el grupo, el correo, la hoja de la reunión. Se mide en gente que vuelve y es el que sostiene el proyecto.' },
  { w: 'Canal propio', a: '🏠 Lo que <strong>no te pueden quitar</strong>: la lista de correos, el número de teléfono, el papel impreso, la aplicación de la casa. Sesenta correos propios valen más que cuatro mil seguidores prestados.' },
  { w: 'Canal prestado', a: '☁️ Una cuenta en una plataforma. Funciona, es gratis y <strong>la puede apagar alguien que no eres tú</strong>, sin avisar y sin devolverte los contactos.' },
  { w: 'Canal alquilado', a: '💵 El que se paga por aparecer. Trae gente <strong>mientras se paga</strong> y se apaga al dejar de pagar. Es un grifo, no una casa.' },
  { w: 'La puerta', a: '🚪 El sitio concreto al que lleva cada publicación. Sin puerta, la mejor publicación del año consigue <strong>admiración y ni un solo contacto</strong>.' },
  { w: 'El ritmo real', a: '⏳ El que aguantas <strong>la semana peor del año</strong>, con clases, exámenes y la casa. Si solo funciona en vacaciones, no es tu ritmo.' },
  { w: 'El reparto de tres', a: '✍️ Lo que se publica: <strong>enseñar</strong> (la mayoría), <strong>mostrar</strong> el trabajo hecho y <strong>pedir</strong>, que se hace poco y sin rodeos.' },
  { w: 'Enseñar', a: '📚 Publicar algo que <strong>sirve aunque no te contraten</strong>: una idea para el lunes, una plantilla, una manera de corregir más rápido. Es lo que hace que la gente se quede.' },
  { w: 'La medida que sirve', a: '📏 La que se puede usar para decidir algo. Cuántas contestan y cuántas piden una ficha sirven; <strong>el número de seguidores no</strong>, porque sube solo.' },
  { w: 'El canal muerto', a: '👻 Abierto, con seguidores y sin publicar desde hace meses. Dice sin decirlo <strong>que el proyecto empieza cosas y no las termina</strong>. O se sostiene o se cierra bien.' },
  { w: 'Cerrar bien', a: '🔚 Publicar una última cosa que <strong>diga dónde encontrarte ahora</strong> y dejarla fijada. Cuesta diez minutos y evita que un canal apagado hable mal de ti durante años.' },
  { w: 'El canal cómodo', a: '🪞 Aquel donde están los colegas y se aprecia el trabajo. Sirve para aprender y para que te inviten a dar charlas, pero <strong>ahí no está quien te va a contratar</strong>.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué es lo primero que se mira para elegir un canal?', o: ['a) Cuánta gente hay en total', 'b) Si tu gente ya está ahí', 'c) Si es gratis', 'd) Si es moderno'], c: 1 },
  { q: 'Un canal que no se puede sostener doce meses es…', o: ['a) Un canal pequeño', 'b) Una campaña', 'c) Un error', 'd) Un canal en pruebas'], c: 1 },
  { q: 'La señal de alarma de esta etapa es…', o: ['a) Publicar poco', 'b) Que baje el alcance', 'c) Abrir un canal nuevo con el anterior sin contestar', 'd) Que nadie comente'], c: 2 },
  { q: '¿Cuál se construye primero?', o: ['a) El que retiene', 'b) El que alcanza', 'c) El pagado', 'd) Da igual'], c: 0 },
  { q: 'Una lista de sesenta correos propios, comparada con cuatro mil seguidores prestados…', o: ['a) Vale menos', 'b) Vale lo mismo', 'c) Vale más, porque no te la pueden quitar', 'd) No se pueden comparar'], c: 2 },
  { q: 'Lo prestado sirve para…', o: ['a) Sustituir lo propio', 'b) Traer gente a lo propio', 'c) Ahorrar trabajo', 'd) Medir mejor'], c: 1 },
  { q: 'El canal alquilado (los anuncios) es…', o: ['a) Una casa', 'b) Un grifo', 'c) Una inversión segura', 'd) Un canal propio'], c: 1 },
  { q: 'Una publicación sin puerta consigue…', o: ['a) Contactos lentos', 'b) Aplausos y ningún contacto', 'c) Más alcance', 'd) Mejor reputación'], c: 1 },
  { q: 'El ritmo de un canal se decide según…', o: ['a) Lo que aguantas la semana peor del año', 'b) Lo que recomienda la plataforma', 'c) Lo que hacen los colegas', 'd) Las ganas del primer mes'], c: 0 },
  { q: 'De lo que se publica, la mayor parte debería ser…', o: ['a) Mostrar el trabajo hecho', 'b) Pedir', 'c) Enseñar algo útil', 'd) Compartir noticias'], c: 2 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Propio', 'Prestado'], headA: '🏠 Propio', headB: '☁️ Prestado', colA: 'ok', colB: 'no',
    words: [
      { w: 'La lista de correos', t: 'ok' }, { w: 'El número de WhatsApp', t: 'ok' },
      { w: 'La ficha impresa', t: 'ok' }, { w: 'La aplicación de la casa', t: 'ok' },
      { w: 'La página en una red social', t: 'no' }, { w: 'El canal de videos', t: 'no' },
      { w: 'El grupo dentro de una plataforma', t: 'no' }, { w: 'El perfil profesional', t: 'no' },
    ],
  },
  {
    label: ['Alcanza', 'Retiene'], headA: '📣 Alcanza', headB: '🤝 Retiene', colA: 'ok', colB: 'no',
    words: [
      { w: 'La charla en un centro nuevo', t: 'ok' }, { w: 'La publicación pagada', t: 'ok' },
      { w: 'El video que alguien comparte', t: 'ok' }, { w: 'La recomendación de una directora', t: 'ok' },
      { w: 'El grupo de las veintitrés maestras', t: 'no' }, { w: 'El correo mensual', t: 'no' },
      { w: 'La hoja que se entrega en la reunión', t: 'no' }, { w: 'La aplicación instalada en el teléfono', t: 'no' },
    ],
  },
  {
    label: ['Medida que sirve', 'Número que no dice nada'], headA: '📏 Sirve', headB: '🎈 No dice nada', colA: 'ok', colB: 'no',
    words: [
      { w: 'Cuántas maestras contestan', t: 'ok' }, { w: 'Cuántas piden una ficha', t: 'ok' },
      { w: 'Cuántos correos nuevos salieron de la charla', t: 'ok' }, { w: 'Cuántas vuelven al mes siguiente', t: 'ok' },
      { w: 'El número de seguidores', t: 'no' }, { w: 'Los «me gusta»', t: 'no' },
      { w: 'Cuánta gente vio la publicación', t: 'no' }, { w: 'Cuántos miembros tiene el grupo', t: 'no' },
    ],
  },
  {
    label: ['Se publica mucho', 'Se publica poco'], headA: '📚 Mucho', headB: '🏷️ Poco', colA: 'ok', colB: 'no',
    words: [
      { w: 'Una idea para el lunes', t: 'ok' }, { w: 'Una plantilla lista para usar', t: 'ok' },
      { w: 'Una manera de corregir más rápido', t: 'ok' }, { w: 'Una respuesta a una duda del grupo', t: 'ok' },
      { w: 'El precio del material del año', t: 'no' }, { w: 'La invitación a contratar el taller', t: 'no' },
      { w: 'El recordatorio de que quedan plazas', t: 'no' }, { w: 'La oferta del trimestre', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['El', 'canal', 'está', 'donde', 'ya', 'está', 'tu', 'gente.'], c: 1, art: 'El sitio donde apareces cada cierto tiempo' },
  { s: ['El', 'ritmo', 'es', 'el', 'de', 'la', 'semana', 'peor.'], c: 1, art: 'Cada cuánto se publica de verdad' },
  { s: ['Sin', 'puerta', 'hay', 'aplausos', 'y', 'ningún', 'contacto.'], c: 1, art: 'A dónde lleva cada publicación' },
  { s: ['Lo', 'propio', 'es', 'lo', 'que', 'no', 'te', 'pueden', 'quitar.'], c: 1, art: 'La lista, el número, el papel' },
  { s: ['Lo', 'prestado', 'lo', 'puede', 'apagar', 'otro.'], c: 1, art: 'La cuenta en una plataforma' },
  { s: ['El', 'canal', 'que', 'retiene', 'sostiene', 'el', 'proyecto.'], c: 3, art: 'El que habla con quien ya te conoce' },
  { s: ['La', 'medida', 'buena', 'sirve', 'para', 'decidir', 'algo.'], c: 1, art: 'Lo que se mira a los tres meses' },
  { s: ['Enseñar', 'es', 'la', 'mayor', 'parte', 'de', 'lo', 'publicado.'], c: 0, art: 'Lo que sirve aunque no te contraten' },
]);

B.cmpData = JSON.stringify([
  { s: 'El canal está donde ya está tu ___.', opts: ['gente', 'competencia', 'oficina'], c: 0 },
  { s: 'Un canal que no se sostiene doce meses es una ___.', opts: ['campaña', 'prueba', 'red'], c: 0 },
  { s: 'El ritmo se decide con la semana ___ del año.', opts: ['peor', 'mejor', 'primera'], c: 0 },
  { s: 'Sin ___ hay aplausos y ningún contacto.', opts: ['puerta', 'anuncio', 'foto'], c: 0 },
  { s: 'Lo ___ es lo que no te pueden quitar.', opts: ['propio', 'prestado', 'pagado'], c: 0 },
  { s: 'Lo prestado sirve para traer gente a lo ___.', opts: ['propio', 'pagado', 'nuevo'], c: 0 },
  { s: 'Primero se construye el canal que ___.', opts: ['retiene', 'alcanza', 'cuesta'], c: 0 },
  { s: 'De lo que se publica, la mayor parte es ___.', opts: ['enseñar', 'pedir', 'mostrar'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Propio', 'Prestado'], btnA: '🏠 Propio', btnB: '☁️ Prestado', colA: 'ok', colB: 'no',
    words: [
      { w: 'La lista de correos', t: 'ok' }, { w: 'La ficha impresa', t: 'ok' },
      { w: 'El número de teléfono', t: 'ok' }, { w: 'La aplicación de la casa', t: 'ok' },
      { w: 'La página en una red', t: 'no' }, { w: 'El canal de videos', t: 'no' },
      { w: 'El grupo de una plataforma', t: 'no' }, { w: 'El perfil profesional', t: 'no' },
    ],
  },
  {
    label: ['Alcanza', 'Retiene'], btnA: '📣 Alcanza', btnB: '🤝 Retiene', colA: 'ok', colB: 'no',
    words: [
      { w: 'La charla en un centro nuevo', t: 'ok' }, { w: 'La publicación pagada', t: 'ok' },
      { w: 'Un video compartido', t: 'ok' }, { w: 'La recomendación de otra maestra', t: 'ok' },
      { w: 'El grupo de maestras', t: 'no' }, { w: 'El correo mensual', t: 'no' },
      { w: 'La hoja de la reunión', t: 'no' }, { w: 'La aplicación instalada', t: 'no' },
    ],
  },
  {
    label: ['Medida que sirve', 'Número vacío'], btnA: '📏 Sirve', btnB: '🎈 Vacío', colA: 'ok', colB: 'no',
    words: [
      { w: 'Cuántas contestan', t: 'ok' }, { w: 'Cuántas piden una ficha', t: 'ok' },
      { w: 'Correos nuevos por charla', t: 'ok' }, { w: 'Cuántas vuelven al mes', t: 'ok' },
      { w: 'Número de seguidores', t: 'no' }, { w: 'Me gusta', t: 'no' },
      { w: 'Gente que vio la publicación', t: 'no' }, { w: 'Miembros del grupo', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se decide un canal', steps: ['Comprobar si tu gente ya está ahí, con tres nombres reales', 'Calcular el ritmo que aguantas la semana peor del año', 'Decidir qué se publica, con la mayoría en enseñar', 'Escribir la puerta: a dónde lleva cada publicación', 'Elegir qué se mira a los tres meses, con número', 'Apuntar qué harías si a los tres meses sale por debajo'] },
  { label: 'Cómo se aprovecha una charla', steps: ['Preparar la puerta antes de entrar: hojas y lista de correos', 'Dar la charla enseñando algo que sirva el lunes', 'Repartir la hoja impresa con el código y el teléfono', 'Pasar la lista para quien quiera el correo mensual', 'Contar los correos nuevos al salir', 'Escribir al día siguiente a quien se apuntó'] },
  { label: 'Cómo se cierra un canal que ya no se sostiene', steps: ['Reconocer que no se publica desde hace meses', 'Escribir una última publicación con dónde encontrarte', 'Dejarla fijada arriba del todo', 'Llevarse los contactos que se puedan a algo propio', 'No volver a abrir otro hasta sostener el que queda'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Las personas concretas que ya están en ese sitio', ans: 'La gente', opts: ['La gente', 'El ritmo', 'La puerta', 'La medida'] },
  { desc: 'Cada cuánto apareces, medido con la semana peor del año', ans: 'El ritmo', opts: ['El ritmo', 'El formato', 'La puerta', 'El cierre'] },
  { desc: 'El sitio concreto al que lleva cada publicación', ans: 'La puerta', opts: ['La puerta', 'La promesa', 'La medida', 'La gente'] },
  { desc: 'El número que se mira a los tres meses para decidir algo', ans: 'La medida', opts: ['La medida', 'El ritmo', 'El formato', 'La promesa'] },
  { desc: 'Lo que la gente puede esperar de ti cada vez que apareces', ans: 'La promesa', opts: ['La promesa', 'La puerta', 'La gente', 'El cierre'] },
  { desc: 'Si es texto corto, hoja impresa, audio o video', ans: 'El formato', opts: ['El formato', 'El ritmo', 'La medida', 'La promesa'] },
  { desc: 'Cómo se apaga un canal sin dejar a nadie colgado', ans: 'El cierre', opts: ['El cierre', 'La puerta', 'El formato', 'La gente'] },
  { desc: 'Lo que no te pueden quitar si mañana cierra una plataforma', ans: 'Lo propio', opts: ['Lo propio', 'Lo prestado', 'Lo alquilado', 'La medida'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Una idea para el lunes, publicada en el grupo de maestras', func: '«Está en la ficha 3, te la mando ahora mismo»', opts: ['«Está en la ficha 3, te la mando ahora mismo»', '«Espero que les guste»', '«Compartan si les sirvió»', '«Mañana subo otra»'] },
  { trans: 'Una charla de cuarenta minutos en un centro nuevo', func: 'La hoja impresa con el código y la lista de correos', opts: ['La hoja impresa con el código y la lista de correos', 'Un aplauso y las gracias', 'Decir el nombre del proyecto al final', 'Dejar el correo en la pizarra'] },
  { trans: 'El correo mensual a las sesenta maestras', func: '«Contéstame a este correo y te lo preparo»', opts: ['«Contéstame a este correo y te lo preparo»', '«Nos vemos el mes que viene»', '«Reenvíalo a quien le sirva»', '«Sigue el proyecto en la red»'] },
  { trans: 'Una publicación pagada vista por mil personas', func: 'Un enlace a la aplicación con el material gratis', opts: ['Un enlace a la aplicación con el material gratis', 'El nombre del proyecto en grande', 'Una foto del taller', 'Un lema bonito'] },
  { trans: 'La hoja que se entrega en la reunión de padres', func: 'El código impreso grande y un número de teléfono', opts: ['El código impreso grande y un número de teléfono', 'El logotipo del proyecto', 'La dirección de la escuela', 'Una frase de motivación'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Abrió tres cuentas el mismo mes y en agosto no quedaba ninguna viva', characteristic: 'Repartió el mismo esfuerzo entre más sitios en vez de sostener uno', opts: ['Repartió el mismo esfuerzo entre más sitios en vez de sostener uno', 'Eligió las plataformas equivocadas', 'No tenía suficiente contenido', 'Le faltó publicidad'] },
  { disease: 'La charla salió muy bien y no llegó ni un contacto nuevo', characteristic: 'No había puerta: nadie sabía a dónde ir después', opts: ['No había puerta: nadie sabía a dónde ir después', 'La charla no fue tan buena', 'El público no era el adecuado', 'Faltó tiempo'] },
  { disease: 'Publicaba cada día en enero y no volvió a publicar desde marzo', characteristic: 'Eligió el ritmo de las ganas del primer mes, no el de la semana peor', opts: ['Eligió el ritmo de las ganas del primer mes, no el de la semana peor', 'Se le acabaron las ideas', 'Nadie le respondía', 'Cambió de plataforma'] },
  { disease: 'Tenía dos mil seguidores y no pudo avisar a nadie cuando cerró la cuenta', characteristic: 'Todo estaba en lo prestado y nada en lo propio', opts: ['Todo estaba en lo prestado y nada en lo propio', 'La plataforma se portó mal', 'No avisó con tiempo', 'Los seguidores no eran reales'] },
  { disease: 'Dejó de pagar los anuncios y ese mes no llegó nadie', characteristic: 'Confundió un grifo con una casa: lo alquilado se apaga al dejar de pagar', opts: ['Confundió un grifo con una casa: lo alquilado se apaga al dejar de pagar', 'Los anuncios estaban mal hechos', 'Pagó poco', 'Era mala época'] },
  { disease: 'Publicaba mucho y siempre en el grupo de colegas', characteristic: 'Estaba en el canal cómodo, donde se aprecia el trabajo y nadie contrata', opts: ['Estaba en el canal cómodo, donde se aprecia el trabajo y nadie contrata', 'Publicaba demasiado', 'El contenido era muy técnico', 'Faltaba constancia'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Un sitio donde tu gente ya está y donde apareces cada cierto tiempo.', type: 'Un canal' },
  { s: 'Abrir uno nuevo con el anterior sin contestar.', type: 'La señal de alarma' },
  { s: 'Sirve para que te conozca gente nueva.', type: 'Canal que alcanza' },
  { s: 'Sirve para seguir hablando con quien ya te conoce.', type: 'Canal que retiene' },
  { s: 'La lista de correos y el papel impreso.', type: 'Canal propio' },
  { s: 'Una cuenta que puede apagar alguien que no eres tú.', type: 'Canal prestado' },
  { s: 'Trae gente mientras se paga y se apaga al dejar de pagar.', type: 'Canal alquilado' },
  { s: 'El sitio concreto al que lleva cada publicación.', type: 'La puerta' },
  { s: 'Lo que aguantas publicar la semana peor del año.', type: 'El ritmo real' },
  { s: 'Publicar algo que sirve aunque no te contraten.', type: 'Enseñar' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'La lista de sesenta correos', gen: 'Tipo de canal', n: 'No te lo quitan', g: 'Propio', t: 'Vale más que cuatro mil seguidores' },
  { w: 'La página en una red social', gen: 'Tipo de canal', n: 'Lo apaga otro', g: 'Prestado', t: 'Sirve para traer gente a lo propio' },
  { w: 'La charla en un centro nuevo', gen: 'Para qué sirve', n: 'Gente nueva', g: 'Alcanza', t: 'Sin puerta no sirve de nada' },
  { w: 'El grupo de las veintitrés maestras', gen: 'Para qué sirve', n: 'Gente que vuelve', g: 'Retiene', t: 'Es el que sostiene el proyecto' },
  { w: 'Cuántas piden una ficha', gen: 'Qué se mira', n: 'Se decide con ella', g: 'Medida que sirve', t: 'Se apunta cada mes' },
  { w: 'El número de seguidores', gen: 'Qué se mira', n: 'Sube solo', g: 'Número vacío', t: 'No se puede llevar a ninguna parte' },
  { w: 'Una idea para el lunes', gen: 'Qué se publica', n: 'La mayoría', g: 'Enseñar', t: 'Sirve aunque no te contraten' },
  { w: 'El precio del material del año', gen: 'Qué se publica', n: 'Poco y sin rodeos', g: 'Pedir', t: 'Quien rodea parece que esconde' },
  { w: 'Publicar los lunes, aunque sea corto', gen: 'Ritmo', n: 'Aguanta todo el año', g: 'Ritmo real', t: 'Es el de la semana peor' },
  { w: 'Publicar cada día en enero', gen: 'Ritmo', n: 'Se apaga en marzo', g: 'Ritmo de las ganas', t: 'Deja el canal muerto' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'El canal está donde ya está tu ___.', opts: ['gente', 'competencia', 'oficina'], ans: 'gente' },
  { s: 'Un canal que no se sostiene doce meses es una ___.', opts: ['campana', 'prueba', 'red'], ans: 'campana' },
  { s: 'El ritmo se decide con la semana ___ del año.', opts: ['peor', 'mejor', 'primera'], ans: 'peor' },
  { s: 'Sin ___ hay aplausos y ningún contacto.', opts: ['puerta', 'anuncio', 'foto'], ans: 'puerta' },
  { s: 'Lo ___ es lo que no te pueden quitar.', opts: ['propio', 'prestado', 'pagado'], ans: 'propio' },
  { s: 'Lo prestado sirve para traer gente a lo ___.', opts: ['propio', 'pagado', 'nuevo'], ans: 'propio' },
  { s: 'Primero se construye el canal que ___.', opts: ['retiene', 'alcanza', 'cuesta'], ans: 'retiene' },
  { s: 'De lo que se publica, la mayor parte es ___.', opts: ['ensenar', 'pedir', 'mostrar'], ans: 'ensenar' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica qué es un canal y por qué una cuenta abierta no lo es.', ans: 'Un canal es un sitio donde tu gente ya está y donde tú apareces cada cierto tiempo con algo que le sirve. Las tres partes importan: que la gente esté (si no está, no es un canal, es un escaparate en una calle vacía), que aparezcas cada cierto tiempo (si es cuando hay ganas, no hay canal) y que lo que lleves sirva. Una cuenta abierta y muda no cumple ninguna de las tres, y además hace daño: dice sin decirlo que el proyecto empieza cosas y no las termina, que es justo lo contrario de lo que se quiere transmitir. Por eso la regla corta de la etapa es que un canal que no puedes sostener doce meses no es un canal, es una campaña. Una campaña está bien, siempre que se sepa desde el principio que va a terminar.' },
  { q: '¿Cuál es la señal de alarma de esta etapa y qué está pasando cuando aparece?', ans: 'Abrir un canal nuevo cuando el anterior está sin contestar. Lo que está pasando es que se confunde avanzar con moverse: abrir una cuenta se siente como progreso porque es visible y rápido, mientras que contestar tres preguntas pendientes en el grupo no se ve desde fuera. Pero el esfuerzo disponible es el mismo, así que abrir otro canal no suma, reparte: lo que había para uno ahora se divide entre dos y los dos quedan a medias. Casi nunca falta un canal; casi siempre falta ritmo en el que ya se tiene. La comprobación es simple y molesta: antes de abrir nada, mirar si hay algo sin contestar en lo que ya existe. Si lo hay, ese es el trabajo, y no se parece nada a abrir un canal nuevo.' },
  { q: 'Explica la diferencia entre el canal que alcanza y el que retiene, y cuál se construye primero.', ans: 'El que alcanza sirve para que te conozca gente nueva: una charla en un centro, un video que alguien comparte, un anuncio pagado. Se mide en personas que llegan por primera vez. El que retiene sirve para seguir hablando con quien ya te conoce: el grupo de maestras, el correo mensual, la hoja que se entrega en la reunión. Se mide en gente que vuelve. Primero se construye el que retiene, aunque tenga doce personas, porque el error clásico es gastarlo todo en alcanzar sin tener dónde guardar a los que llegan: la gente mira, se va, y al mes siguiente hay que volver a buscarla, que es el trabajo más caro que existe. Con un canal que retiene, cada persona que llega se queda, y entonces sí vale la pena gastar en alcanzar.' },
  { q: '¿Qué son los canales propios, prestados y alquilados, y cuál es la regla que los ordena?', ans: 'Propio es lo que no te pueden quitar: la lista de correos, el número de WhatsApp, el papel impreso, la aplicación de la casa. Prestado es una cuenta en una plataforma: funciona, es gratis y la puede apagar alguien que no eres tú, sin avisar y sin devolverte los contactos. Alquilado es el que se paga por aparecer, y trae gente mientras se paga: es un grifo, no una casa. La regla que los ordena es que lo prestado y lo alquilado sirven para traer gente a lo propio, nunca al revés. Todo lo que se publica en una plataforma tiene que terminar en algo tuyo, aunque sea un número de teléfono apuntado a mano. Por eso una lista de sesenta correos vale más que cuatro mil seguidores prestados, aunque nadie presuma nunca de sesenta correos.' },
  { q: 'Explica qué es la puerta y qué pasa cuando falta.', ans: 'La puerta es el sitio concreto al que lleva cada publicación: un enlace, un código impreso, un número al que escribir, una lista donde apuntarse. Cuando falta, la mejor publicación del año consigue admiración y ni un solo contacto, y admiración no es lo que se estaba buscando. El caso más claro es la charla: cuarenta minutos delante de veinte maestras que no te conocen es el mejor canal de alcance que existe, y también el que más se desperdicia, porque se sale de ahí con aplausos y sin nada. La puerta se prepara antes de entrar, no se improvisa al final: hojas impresas con el código y una lista para apuntar el correo de quien quiera el mensual. Y da una medida clarísima: si de una charla salieron cero correos, el problema no fue la charla, fue que no había puerta.' },
  { q: 'Di cómo se elige el ritmo de un canal y qué se mira a los tres meses.', ans: 'El ritmo se elige con la semana peor del año, no con la mejor: lo que se puede hacer con clases, exámenes y la casa encima. Si un ritmo solo funciona en vacaciones, el ritmo real es otro, y conviene decirlo antes que descubrirlo en marzo con el canal ya apagado. Publicar cada día en enero y no volver a publicar desde marzo deja peor imagen que haber publicado una vez al mes todo el año. A los tres meses se mira una medida que sirva para decidir algo: cuántas personas contestan, cuántas piden una ficha, cuántos correos nuevos salieron de una charla, cuántas vuelven al mes siguiente. No sirven los seguidores ni los «me gusta», porque suben solos y no se pueden llevar a ninguna parte. Y la medida se escribe antes, con número, junto con qué se haría si sale por debajo.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['CANAL', 'RITMO', 'PUERTA', 'MEDIDA', 'GENTE', 'PROPIO']),
  haceSopa(10, ['ALCANCE', 'CORREO', 'GRUPO', 'CHARLA', 'FICHA', 'CIERRE']),
  haceSopa(10, ['PRESTADO', 'ENSENAR', 'MOSTRAR', 'PEDIR', 'SEMANA', 'PAPEL']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Un canal se elige por dónde ya está tu gente.', a: true },
  { q: 'Una cuenta abierta y sin publicar sigue siendo un canal.', a: false },
  { q: 'Un canal que no se sostiene doce meses es una campaña.', a: true },
  { q: 'Abrir un canal nuevo con el anterior sin contestar es buena señal.', a: false },
  { q: 'Primero se construye el canal que retiene.', a: true },
  { q: 'Una lista de correos propia vale más que muchos seguidores prestados.', a: true },
  { q: 'Lo prestado sirve para traer gente a lo propio.', a: true },
  { q: 'Los anuncios pagados siguen trayendo gente cuando se deja de pagar.', a: false },
  { q: 'Una publicación sin puerta consigue contactos igual.', a: false },
  { q: 'El ritmo se decide con la semana peor del año.', a: true },
  { q: 'El número de seguidores sirve para decidir cosas.', a: false },
  { q: 'De lo que se publica, la mayor parte debería ser enseñar.', a: true },
  { q: 'El grupo donde están los colegas es un buen canal para vender.', a: false },
  { q: 'Un canal apagado se puede cerrar bien en diez minutos.', a: true },
  { q: 'La puerta se prepara antes de la charla, no al final.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: 'Lo primero que se comprueba de un canal es…', o: ['a) Cuánta gente hay', 'b) Si tu gente ya está ahí', 'c) Si es gratis', 'd) Si es fácil de usar'], a: 1 },
  { q: 'Una cuenta abierta y muda es…', o: ['a) Un canal en pausa', 'b) Una promesa incumplida a la vista', 'c) Una reserva para después', 'd) Algo neutro'], a: 1 },
  { q: 'El ritmo real de un canal es el de…', o: ['a) El primer mes', 'b) Las vacaciones', 'c) La semana peor del año', 'd) Lo que hacen los colegas'], a: 2 },
  { q: '¿Qué canal se construye primero?', o: ['a) El que alcanza', 'b) El que retiene', 'c) El pagado', 'd) El de video'], a: 1 },
  { q: 'La lista de correos es un canal…', o: ['a) Prestado', 'b) Alquilado', 'c) Propio', 'd) Compartido'], a: 2 },
  { q: 'Una página en una red social es un canal…', o: ['a) Propio', 'b) Prestado', 'c) Alquilado', 'd) Público'], a: 1 },
  { q: 'La publicación pagada se parece a…', o: ['a) Una casa', 'b) Un grifo', 'c) Una lista', 'd) Un contrato'], a: 1 },
  { q: 'Sin puerta, una charla estupenda deja…', o: ['a) Contactos lentos', 'b) Aplausos y nada más', 'c) Buena reputación medible', 'd) Alcance pagado'], a: 1 },
  { q: 'La puerta de una charla puede ser…', o: ['a) El nombre del proyecto', 'b) Un aplauso', 'c) La hoja con el código y la lista de correos', 'd) Una foto de grupo'], a: 2 },
  { q: '¿Cuál es una medida que sirve?', o: ['a) Los me gusta', 'b) Cuántas piden una ficha', 'c) El alcance de la publicación', 'd) Los seguidores'], a: 1 },
  { q: 'De lo que se publica, «pedir» debería ser…', o: ['a) La mayoría', 'b) La mitad', 'c) Poco y sin rodeos', 'd) Nada'], a: 2 },
  { q: 'El grupo de colegas sirve sobre todo para…', o: ['a) Vender el material', 'b) Que te inviten a dar charlas', 'c) Conseguir maestras', 'd) Medir el alcance'], a: 1 },
  { q: 'Cerrar bien un canal significa…', o: ['a) Borrarlo', 'b) Dejarlo como está', 'c) Publicar dónde encontrarte y fijarlo', 'd) Cambiarle el nombre'], a: 2 },
  { q: 'La hoja impresa con código llega sobre todo a…', o: ['a) Quien tiene muchos datos', 'b) Quien no tiene datos', 'c) Los colegas', 'd) Las plataformas'], a: 1 },
  { q: 'Antes de pagar un anuncio conviene escribir…', o: ['a) El texto perfecto', 'b) Cuántos contactos harían que valiera la pena', 'c) El presupuesto anual', 'd) La lista de seguidores'], a: 1 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'El canal está donde ya está tu ___.', a: 'gente' },
  { q: 'Un canal que no se sostiene doce meses es una ___.', a: 'campana' },
  { q: 'El ritmo se decide con la semana ___ del año.', a: 'peor' },
  { q: 'Sin ___ hay aplausos y ningún contacto.', a: 'puerta' },
  { q: 'Lo ___ es lo que no te pueden quitar.', a: 'propio' },
  { q: 'Lo ___ lo puede apagar alguien que no eres tú.', a: 'prestado' },
  { q: 'Lo alquilado es un ___, no una casa.', a: 'grifo' },
  { q: 'Primero se construye el canal que ___.', a: 'retiene' },
  { q: 'El canal que ___ sirve para que te conozca gente nueva.', a: 'alcanza' },
  { q: 'De lo que se publica, la mayor parte es ___.', a: 'ensenar' },
  { q: 'La señal de alarma es abrir un canal ___ con el anterior sin contestar.', a: 'nuevo' },
  { q: 'Un canal abierto y sin publicar está ___.', a: 'muerto' },
  { q: 'Cerrar bien es decir dónde ___ ahora.', a: 'encontrarte' },
  { q: 'La medida buena sirve para ___ algo.', a: 'decidir' },
  { q: 'El número de ___ sube solo y no dice nada.', a: 'seguidores' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Un canal', def: 'Sitio donde tu gente ya está y donde apareces con ritmo' },
  { term: 'La señal de alarma', def: 'Abrir uno nuevo con el anterior sin contestar' },
  { term: 'Canal que alcanza', def: 'Sirve para que te conozca gente nueva' },
  { term: 'Canal que retiene', def: 'Sirve para seguir hablando con quien ya te conoce' },
  { term: 'Canal propio', def: 'Lo que no te pueden quitar' },
  { term: 'Canal prestado', def: 'Una cuenta que puede apagar otro' },
  { term: 'Canal alquilado', def: 'Trae gente mientras se paga' },
  { term: 'La puerta', def: 'El sitio concreto al que lleva cada publicación' },
  { term: 'El ritmo real', def: 'El que aguantas la semana peor del año' },
  { term: 'Enseñar', def: 'Publicar algo que sirve aunque no te contraten' },
  { term: 'Mostrar', def: 'Enseñar el trabajo hecho con nombre y fecha' },
  { term: 'Pedir', def: 'Decir qué ofreces y cuánto cuesta, sin rodeos' },
  { term: 'La medida que sirve', def: 'La que se puede usar para decidir algo' },
  { term: 'El canal muerto', def: 'Abierto, con seguidores y sin publicar hace meses' },
  { term: 'Cerrar bien', def: 'Publicar dónde encontrarte ahora y dejarlo fijado' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'El grupo de WhatsApp de las maestras existe solo, tiene veintitrés personas y ahí se preguntan cosas todas las semanas. Nadie lo abrió como canal.' },
  { txt: 'Una hoja de la ficha con el código impreso, entregada en mano en la reunión de padres. No depende de internet ni de ninguna plataforma.' },
  { txt: 'Una página heredada en una red social: dos años, cuatrocientos seguidores y la última publicación es de marzo del año pasado.' },
  { txt: 'Una lista de sesenta correos recogidos en los talleres. Ninguno se ha usado todavía y siguen guardados en una hoja de cálculo.' },
  { txt: 'Un colega aconseja abrir un canal de videos. Un video corto y decente son dos horas entre grabar, cortar y subir.' },
  { txt: 'Cuarenta minutos de charla delante de veinte maestras que no te conocen, invitado por la directora de un centro nuevo.' },
  { txt: 'Doscientos lempiras para que una publicación la vean mil personas del municipio, y se pueden repetir cada mes.' },
  { txt: 'Un grupo de doscientos maestros que hablan de metodología y donde da gusto publicar, porque entienden lo que uno hace.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Está ahí tu gente? Nombra a tres personas reales o di que no.',
  '2. ¿Qué ritmo aguantarías la semana peor del año?',
  '3. ¿Cuál es la puerta, escrita como una frase concreta?',
  '4. Escribe en 3-4 frases qué mirarías a los tres meses y qué harías si sale por debajo.',
]);

B.critCaseGuides = JSON.stringify([
  'Se piden nombres, no categorías. «Maestras» no vale; «la profe Marta de la Escuela Ramón Rosa» sí. Si no salen tres nombres, la gente todavía no está ahí.',
  'El ritmo de la semana peor, con clases y exámenes encima. Suele ser la mitad de lo que uno cree, y decirlo ahora ahorra un canal apagado en marzo.',
  'La puerta es un sitio concreto: un código impreso, una lista donde apuntarse, un número al que escribir. «Que nos conozcan» no es una puerta.',
  'Una medida que sirva para decidir: cuántas contestan, cuántas piden una ficha, cuántos correos nuevos. Y escrita antes, con número, junto con qué se hace si sale por debajo.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Voy a abrir el canal de videos y así estamos en todas partes".', g1: 'Estar en todas partes con el mismo esfuerzo significa estar a medias en todas. Y la señal de alarma está ahí mismo: hay tres preguntas sin contestar en el grupo que ya funciona.', g2: 'La cuenta lo decide: dos horas por video, uno por semana, son ocho horas al mes de un maestro que da clases de doce y media a cinco y media.' },
  { txt: '"Tenemos cuatrocientos seguidores, eso ya es una base".', g1: 'Cuatrocientos seguidores en una cuenta prestada no son cuatrocientas personas esperando: son un número que no se puede llevar a ninguna parte si mañana cierra la plataforma.', g2: 'La base son los sesenta correos que sí se pueden guardar, aunque el número parezca ridículo al lado del otro.' },
  { txt: '"La charla salió muy bien, la gente aplaudió mucho".', g1: 'Los aplausos no son una medida. La pregunta es cuántos correos nuevos salieron de ahí, y si son cero, la charla no sirvió para nada aunque fuera buena.', g2: 'La puerta se prepara antes de entrar: hojas impresas con el código y una lista para apuntar el correo. Improvisarla al final no funciona.' },
  { txt: '"Publico todos los días, así el algoritmo me ayuda".', g1: 'Todos los días es el ritmo de las ganas del primer mes. En marzo, con exámenes, se para, y un canal que se para deja peor imagen que uno que publicaba una vez al mes.', g2: 'El ritmo se elige con la semana peor del año y se cumple. Una vez por semana, cumplido doce meses, vale más que treinta publicaciones en enero.' },
  { txt: '"En el grupo de colegas es donde más me responden, ahí voy a publicar".', g1: 'Ahí responden porque entienden el trabajo, y eso se agradece, pero los colegas no van a contratar nada: hacen lo mismo que tú.', g2: 'Ese grupo sirve para aprender y para que te inviten a dar charlas, que es otra cosa muy útil. Pero la maestra que necesita la ficha no está ahí.' },
  { txt: '"Los anuncios funcionaron, así que ya tenemos canal".', g1: 'Lo pagado trae gente mientras se paga y se apaga el día que se deja de pagar. Es un grifo, no una casa.', g2: 'Sirve para empujar algo concreto que ya funciona y solo si hay algo propio al otro lado, con un número escrito antes de pagar: cuántos contactos harían que valiera la pena.' },
]);

B.critDecisionBank = JSON.stringify([
  'El grupo de maestras funciona solo y tiene tres preguntas sin contestar: ¿se abre un canal nuevo o se atiende ese?',
  'Una página heredada con cuatrocientos seguidores lleva un año sin publicar: ¿se cierra, se sostiene o se deja así?',
  'Sesenta correos recogidos en talleres y sin usar: ¿se empieza a escribir y con qué ritmo?',
  'Un colega insiste en el canal de videos: ¿se abre, se aplaza por escrito o se prueba un mes?',
  'Hay charla en un centro nuevo el jueves: ¿qué se prepara antes de entrar?',
  'Doscientos lempiras para una publicación pagada: ¿se pagan y con qué escrito antes?',
  'El grupo de colegas es donde más responden: ¿se publica ahí lo mismo que en el de maestras?',
  'La hoja impresa cuesta dinero de fotocopia cada mes: ¿se mantiene, se reduce o se sustituye por algo digital?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Sostener el grupo de veintitrés maestras con una cosa útil por semana.', b: 'Abrir un canal de videos con un video semanal.', ga: 'Caso A: la gente ya está, el ritmo cabe en la semana peor y cada publicación puede llevar a una ficha. Se puede sostener doce meses.', gb: 'Caso B: son ocho horas al mes que no existen, y en marzo se apaga. Un canal apagado dice que el proyecto empieza cosas y no las termina.' },
  { a: 'Empezar el correo mensual con sesenta direcciones propias.', b: 'Empujar la página prestada hasta llegar a mil seguidores.', ga: 'Caso A: sesenta correos son sesenta personas a las que puedes llegar mañana pase lo que pase, porque la lista está en tu computadora.', gb: 'Caso B: mil seguidores prestados desaparecen el día que la plataforma cambie las reglas, y no hay manera de avisarles.' },
  { a: 'Llevar a la charla hojas impresas con código y una lista de correos.', b: 'Dar la charla y decir el nombre del proyecto al final.', ga: 'Caso A: hay puerta, así que se puede contar cuántos entraron por ella y decidir si volver a ese centro.', gb: 'Caso B: hay aplausos y ningún contacto, y a los tres meses no se sabe si la charla sirvió de algo.' },
  { a: 'Cerrar bien la página muerta con una última publicación fijada.', b: 'Dejarla como está por si algún día se retoma.', ga: 'Caso A: cuesta diez minutos, redirige a quien llegue y deja de dar la impresión de proyecto abandonado.', gb: 'Caso B: sigue siendo lo primero que encuentra quien busca el proyecto, y lo que encuentra es una publicación de hace un año.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se abre un canal nuevo con el anterior sin contestar.', guide: 'El mismo esfuerzo se reparte entre más sitios y los dos quedan a medias. Y el canal que ya tenía gente esperando es el que más se resiente, porque ahí sí notan la ausencia.' },
  { cause: 'Se elige el ritmo con las ganas del primer mes.', guide: 'En marzo, con exámenes, se para. Un canal que publicaba a diario y se detiene deja peor imagen que uno que publicaba una vez al mes y sigue.' },
  { cause: 'Se publica sin puerta.', guide: 'Se consiguen aplausos y ningún contacto, y a los tres meses no hay manera de saber si eso sirvió para algo. La puerta es lo que convierte una publicación en una decisión de otra persona.' },
  { cause: 'Todo el proyecto vive en canales prestados.', guide: 'El día que la plataforma cambie las reglas o cierre la cuenta, no queda forma de avisar a nadie. Los contactos eran de la plataforma, no del proyecto.' },
  { cause: 'Se mide con seguidores y con «me gusta».', guide: 'Son números que suben solos y no se pueden llevar a ninguna parte. Con ellos no se puede decidir si un canal sigue o se cierra, que es para lo que sirve medir.' },
  { cause: 'Se publica sobre todo en el grupo donde están los colegas.', guide: 'Es el canal cómodo: ahí se aprecia el trabajo y eso anima, pero quien necesita el material no está ahí. Se confunde reconocimiento con alcance.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Un canal se sostuvo doce meses seguidos.', guide: 'Se eligió el ritmo con la semana peor del año, no con las ganas de enero, y se cumplió aunque algunas semanas la publicación fuera corta.' },
  { effect: 'De una charla salieron once correos nuevos.', guide: 'Había puerta preparada antes de entrar: hojas impresas con el código y una lista para apuntarse. Sin eso habrían salido cero.' },
  { effect: 'El proyecto sobrevivió al cierre de una cuenta.', guide: 'Los contactos estaban en algo propio: una lista de correos y una libreta con teléfonos. Lo prestado había servido solo para traer gente hasta ahí.' },
  { effect: 'Se supo exactamente cuánto cuesta conseguir un contacto.', guide: 'Antes de pagar el anuncio se escribió cuántos contactos harían que valiera la pena. Al final se contaron y se comparó con lo escrito.' },
  { effect: 'Una página abandonada dejó de hacer daño.', guide: 'Se cerró bien: una última publicación diciendo dónde encontrar el proyecto ahora, dejada fijada arriba. Diez minutos de trabajo.' },
  { effect: 'El grupo de maestras empezó a pedir fichas solo.', guide: 'Se publicó cosa útil cada semana durante meses, con la puerta siempre puesta, y sin pedir nada más que de vez en cuando.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '👥', label: 'La gente', text: 'Las personas concretas que <strong>ya están ahí</strong>. <strong>Cómo se comprueba:</strong> nombrando a tres. <strong>Si falta:</strong> es un escaparate en una calle vacía. <strong>En M.E.T.A.S:</strong> las veintitrés maestras del grupo.' },
  { y: '2', icon: '🤝', label: 'La promesa', text: 'Qué puede esperar la gente <strong>cada vez que apareces</strong>. <strong>Sirve para:</strong> que te abran cuando llegas. <strong>Si falta:</strong> cada publicación sorprende y nadie sabe si le interesa. <strong>En M.E.T.A.S:</strong> algo que sirva el lunes.' },
  { y: '3', icon: '📅', label: 'El ritmo', text: 'Cada cuánto apareces, medido con <strong>la semana peor del año</strong>. <strong>Si falta:</strong> se publica a diario en enero y nada desde marzo. <strong>En M.E.T.A.S:</strong> una cosa útil por semana, los lunes.' },
  { y: '4', icon: '📐', label: 'El formato', text: 'Texto corto, hoja impresa, audio o video. <strong>Se elige por:</strong> lo que puedes hacer bien y rápido. <strong>Si falta:</strong> cada publicación cuesta el triple. <strong>En M.E.T.A.S:</strong> texto corto y la ficha en papel.' },
  { y: '5', icon: '🚪', label: 'La puerta', text: 'El sitio concreto <strong>al que lleva</strong> cada publicación. <strong>Si falta:</strong> aplausos y ningún contacto. <strong>En M.E.T.A.S:</strong> el código impreso, la ficha y el número de teléfono.' },
  { y: '6', icon: '📏', label: 'La medida', text: 'Lo que se mira a los tres meses, <strong>con número</strong>. <strong>Sirve para:</strong> decidir si sigue o se cierra. <strong>Si falta:</strong> se mide con seguidores, que suben solos. <strong>En M.E.T.A.S:</strong> cuántas contestan y cuántas piden ficha.' },
  { y: '7', icon: '🔚', label: 'El cierre', text: 'Cómo se apaga <strong>sin dejar a nadie colgado</strong>. <strong>Cómo:</strong> una última publicación con dónde encontrarte, fijada arriba. <strong>Si falta:</strong> un canal muerto habla mal del proyecto durante años.' },
]);

B.parteData = JSON.stringify({
  gente: {
    nombre: 'La gente', icon: '👥',
    estructura: { title: 'Qué es', info: '• Las personas concretas que <strong>ya están</strong> en ese sitio<br>• No «la gente»: <strong>esta</strong> gente, con nombre y apellido<br>• Si ya te preguntan cosas ahí, ese sitio ya es tu canal' },
    funcion: { title: 'Cómo se decide', info: '• Se nombran <strong>tres personas reales</strong> que estén ahí<br>• Si no salen tres, la gente todavía no está<br>• Y se mira si alguna te ha escrito ya por su cuenta' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Se publica en una calle vacía y se llama a eso constancia<br>• Se confunde un sitio con mucha gente con un sitio con tu gente<br>• Se acaba hablando para colegas en vez de para maestras' },
    cuidados: { title: 'En M.E.T.A.S', info: '• El grupo de las <strong>veintitrés maestras</strong>, que se hizo solo<br>• Es el canal más importante y no costó nada abrirlo<br>• La reunión de padres, donde llega el papel impreso' },
  },
  ritmo: {
    nombre: 'El ritmo', icon: '📅',
    estructura: { title: 'Qué es', info: '• Cada cuánto apareces, decidido de antemano<br>• Medido con <strong>la semana peor del año</strong>, no con la mejor<br>• Es lo que separa un canal de una campaña' },
    funcion: { title: 'Cómo se decide', info: '• Se piensa en marzo, con exámenes y la casa encima<br>• Se elige <strong>la mitad</strong> de lo que uno cree que puede<br>• Y se fija el día: los lunes, aunque sea corto' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Se publica a diario en enero y nada desde marzo<br>• Y un canal que se para deja peor imagen que uno lento<br>• La gente deja de mirar aunque después se vuelva' },
    cuidados: { title: 'En M.E.T.A.S', info: '• <strong>Una cosa útil por semana</strong> en el grupo, los lunes<br>• <strong>Un correo al mes</strong>, el mismo día, aunque sea media página<br>• Una hoja impresa al mes, que es lo que aguanta la fotocopia' },
  },
  puerta: {
    nombre: 'La puerta', icon: '🚪',
    estructura: { title: 'Qué es', info: '• El sitio concreto <strong>al que lleva</strong> cada publicación<br>• Un código, una lista, un número al que escribir<br>• «Que nos conozcan» no es una puerta' },
    funcion: { title: 'Cómo se decide', info: '• Se escribe <strong>antes</strong> de publicar, como una frase<br>• En una charla, se prepara antes de entrar<br>• Y se dice en voz alta, no se deja adivinar' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Aplausos y ningún contacto<br>• Y a los tres meses no se sabe si aquello sirvió de algo<br>• Se echa la culpa al contenido, que casi nunca era el problema' },
    cuidados: { title: 'En M.E.T.A.S', info: '• El <strong>código impreso grande</strong> en la hoja de la ficha<br>• La lista de correos que circula en cada charla<br>• Y «contéstame a este correo y te lo preparo», en el mensual' },
  },
  medida: {
    nombre: 'La medida', icon: '📏',
    estructura: { title: 'Qué es', info: '• El número que se mira <strong>a los tres meses</strong><br>• Tiene que servir para <strong>decidir algo</strong>: seguir o cerrar<br>• Los seguidores no sirven: suben solos' },
    funcion: { title: 'Cómo se decide', info: '• Se escribe <strong>antes</strong>, con número, no después<br>• Junto con qué se haría si sale por debajo<br>• Y se apunta cada mes, aunque sea a mano en una libreta' },
    enfermedades: { title: 'Qué pasa si falta', info: '• Se mide con lo que la plataforma enseña en la pantalla<br>• Se sostienen canales que no traen a nadie, por costumbre<br>• Y se cierran otros que sí servían, porque nadie contó' },
    cuidados: { title: 'En M.E.T.A.S', info: '• <strong>Cuántas maestras contestan</strong> y cuántas piden una ficha<br>• Cuántos correos nuevos salieron de cada charla<br>• Y en Destellos: de dónde salió cada persona que escribe' },
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
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: el canal se elige por dónde ya está la gente y no por dónde se está cómodo, así que lo primero es nombrar a tres personas reales que estén ahí. El ritmo se decide con la semana peor del año, porque un canal que no se sostiene doce meses no es un canal, es una campaña. Antes de abrir uno nuevo se mira si queda algo sin contestar en el que ya funciona, que es la señal de alarma de esta etapa. Primero se construye el canal que retiene y después el que alcanza; lo prestado y lo pagado sirven para traer gente a lo propio, nunca al revés. Toda publicación termina en una puerta concreta, y a los tres meses se mira un número que sirva para decidir algo, escrito antes.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  /* La tarjeta de WhatsApp venía mal desde la etapa 2: el molde la arrastró
     entera al pasar por la etapa 3 sin que nadie la mirara. */
  [/📈 \*Ruta de la Marca · Etapa 2\* 📈/g, '📡 *Ruta de la Marca · Etapa 4* 📡'],
  [/Qué se entrega, qué no se incluye y a qué precio, con los ocho casos del proyecto\. 🏷️/g,
   'Dónde está la audiencia, cada cuánto se publica y a dónde lleva cada publicación, con los ocho canales del proyecto. 📡'],
  [/_Incluye evaluación conceptual y el relato que se sostiene\._ ✍️/g, '_Incluye evaluación conceptual y el canal que se sostiene._ ✍️'],
  [/El relato que se sostiene/g, 'El canal que se sostiene'],
  [/el relato que se sostiene/g, 'el canal que se sostiene'],
  [/El relato: contar el proyecto sin inflarlo/g, 'Canales: dónde está la audiencia y qué se publica'],
  [/Ruta de la Marca · Etapa 3: El relato/g, 'Ruta de la Marca · Etapa 4: Canales'],
  [/Evaluación Final · El relato ·/g, 'Evaluación Final · Canales ·'],
  /* el <title> de la ventana de impresión no lleva «Final» y se escapaba */
  [/Evaluación El relato ·/g, 'Evaluación Canales ·'],
  [/· El relato ·/g, '· Canales ·'],
  [/Final: el relato/g, 'Final: los canales'],
  [/Etapa 3 · Marketing y Marca/g, 'Etapa 4 · Marketing y Marca'],
  [/📣 ¡/g, '📡 ¡'],
  [/completó la Etapa 3 de la Ruta de la Marca/g, 'completó la Etapa 4 de la Ruta de la Marca'],
  /* la sección I venía con el nombre que el molde arrastra desde Poder Político */
  [/I\. Simulacro de Presión: la interpelación/g, 'I. El canal sobre la mesa'],
  /* los mensajes de la constancia eran de una misión todavía más vieja */
  [/\['¡Sigue estudiando tu sistema!','¡Muy buen trabajo!','¡Excelente gestor en formación!','¡Sabes por dónde se mueve esto!','¡Estratega institucional!'\]/g,
   "['¡Sigue mirando dónde está tu gente!','¡Muy buen trabajo!','¡Ya eliges el ritmo que aguantas!','¡Le pones puerta a lo que publicas!','¡Construyes sobre lo propio!']"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV seguían siendo las de la etapa 3 */
src = src.replace(/¿Qué se está afirmando, qué parte de eso se puede comprobar hoy y cómo lo dirías tú con cifra, denominador y fecha\? Explica por qué tu versión convence más que la inflada\./g,
  '¿Está ahí tu gente, qué ritmo aguantarías la semana peor del año y a dónde lleva cada publicación? Explica por qué ese canal se sostiene mejor que abrir uno nuevo o que publicar donde estás cómodo.');
src = src.replace(/1\. ¿Cuál de los dos aguanta que alguien lo comprobe delante de ti\? 2\. ¿Por qué no dicen lo mismo\?/g,
  '1. ¿Cuál de los dos se puede sostener doce meses? 2. ¿Por qué el otro se apaga y qué deja detrás cuando se apaga?');

/* el desenlace de la simulación seguía narrando el caso de la etapa 3 */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(sostieneElQueTiene){sfx(sostieneElQueTiene?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(sostieneElQueTiene){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">💬</span><span class="ms-text"><strong>Contestaste las tres preguntas</strong> y publicaste una idea corta el lunes. Ocho horas al mes en el sitio donde ya hay veintitrés maestras esperando.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✅</span><span class="ms-text"><strong>A los tres meses:</strong> once maestras piden fichas por su cuenta y dos te invitaron a su centro. El canal de videos sigue sin existir y no hace ninguna falta.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🎬</span><span class="ms-text"><strong>Abriste el canal:</strong> cuatro videos en enero, con muchas ganas y buen resultado. Se siente como avanzar.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">👻</span><span class="ms-text"><strong>En marzo hay dos canales a medias:</strong> el de videos lleva seis semanas parado y en el grupo de maestras ya nadie pregunta nada. El esfuerzo era el mismo, solo que repartido.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='[a-zA-Z]+',labAspecto='estructura';/, "let labParte='gente',labAspecto='estructura';");
/* y el botón que se resalta al abrir: si no coincide, el laboratorio abre sin nada marcado */
src = src.replace(/(document\.querySelector\('\[data-parte=")[a-zA-Z]+("\]')/, '$1gente$2');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
