/* Inyecta los bancos de la misión «El código que no confía» (Ruta de la Casa
   Cerrada, etapa 3) sobre el molde copiado de la etapa 2, «Los datos de los
   demás».
   Uso:  node _dev/inyecta-bancos-codigo.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-casa-cerrada-codigo', 'js', 'codigo.js');

let _semilla = 20260728;
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
B.SAVE_KEY = `'faro_cib_codigo_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del código que no confía superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de validación y límites explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de entrada fiable y entrada sospechosa experto' },
  id_master: { icon: '🔍', label: 'Identificador de comprobaciones maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del código' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta de la Casa Cerrada completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Se cree lo que llega 🫴' },
  { t: 25, n: 'Comprueba la forma 🔍' },
  { t: 55, n: 'Le pone límite 🚧' },
  { t: 90, n: 'Separa el dato de la orden 💉' },
  { t: 130, n: 'Falla cerrado, no callado 🔔' },
  { t: 165, n: 'Prueba que su prueba puede fallar 🧪' },
  { t: 190, n: 'Escribe código que no confía 🚦' },
]);

B.fcData = JSON.stringify([
  { w: 'Frontera de confianza', a: '🚧 La línea donde el dato <strong>deja de ser tuyo</strong>: el formulario, la dirección web, la respuesta de un servidor, el archivo que sube alguien. Todo lo que la cruza entra como sospechoso hasta que se comprueba.' },
  { w: 'Validar', a: '🔍 Comprobar que un dato <strong>es lo que dice ser</strong> antes de usarlo: el tipo, el largo, el formato y el rango. Validar no es rechazar por gusto: es no construir encima de una suposición.' },
  { w: 'Lista permitida', a: '✅ Se escribe <strong>lo que sí se acepta</strong> y todo lo demás se rechaza. Es la única que se sostiene, porque no hay que adivinar el ataque: hay que conocer el uso legítimo, que sí se conoce.' },
  { w: 'Lista prohibida', a: '🚫 Se escribe lo que no se acepta. Siempre <strong>llega tarde</strong>: solo detiene lo que ya se le ocurrió a alguien, y basta una forma nueva de escribir lo mismo para pasarla de largo.' },
  { w: 'Validar en el aparato', a: '📱 Lo que comprueba el navegador es <strong>cortesía</strong>: avisa antes de mandar y ahorra un viaje. No es seguridad, porque quien quiera saltárselo lo hace sin abrir la aplicación.' },
  { w: 'Validar en el servidor', a: '🛡️ La única comprobación que cuenta, porque es la que <strong>el usuario no puede editar</strong>. Regla de la casa: si una comprobación solo existe en el navegador, es como si no existiera.' },
  { w: 'Autorizar no es autenticar', a: '🪪 Autenticar responde «¿quién eres?»; autorizar responde «¿qué te dejan hacer?». Tener sesión <strong>no es ser de la casa</strong>: hay que comprobar la condición correcta, no solo que haya alguien al otro lado.' },
  { w: 'Límite', a: '🚧 Cuánto, cuántas veces, hasta cuándo y hasta dónde. Tamaño del archivo, largo del texto, intentos por minuto, tiempo de espera y filas por consulta. <strong>Sin límite escrito, el límite lo pone quien ataca.</strong>' },
  { w: 'Inyección', a: '💉 Un <strong>dato que se acaba ejecutando como una instrucción</strong>. Pasa siempre igual: alguien pega texto donde se esperaba un valor y ese texto termina dentro de una consulta, de una página o de un encargo.' },
  { w: 'Consulta con parámetros', a: '🧷 La forma de separar el dato de la orden: la instrucción va escrita aparte y el valor viaja en su casilla. Así el texto <strong>nunca puede cambiar la pregunta</strong>, por raro que venga.' },
  { w: 'Pintar como texto', a: '🖍️ Poner el contenido con <strong>textContent</strong> y no con innerHTML. Con textContent, unas etiquetas escritas por alguien se ven tal cual; con innerHTML se ejecutan. El chat familiar se pinta así a propósito.' },
  { w: 'Inyección de instrucciones', a: '🤖 La misma idea con una IA: texto que viene de fuera y que la máquina <strong>obedece como si fuera el encargo</strong>. Todo lo que se le pega es dato, nunca orden, y hay que decírselo.' },
  { w: 'Fallar cerrado', a: '🔒 Cuando algo no se puede comprobar, se toma la salida <strong>que no hace daño</strong>: no se pasa, no se borra, no se guarda. Un fallo que abre la puerta es un fallo que se convirtió en agujero.' },
  { w: 'Fallar en silencio', a: '🤫 El peor de todos: la operación sale mal y <strong>nadie se entera</strong>, porque no hay error, solo un resultado vacío. Se descubre semanas después, cuando alguien pregunta por qué no llegó nada.' },
  { w: 'El cero sospechoso', a: '0️⃣ Una respuesta vacía sin error <strong>no es una respuesta</strong>: es una pregunta. Cero suscripciones, cero filas o cero destinatarios en algo que siempre tiene datos significa que se está preguntando mal.' },
  { w: 'La prueba que puede fallar', a: '🧪 Una comprobación que <strong>nunca ha dicho que no</strong> no comprueba nada. Antes de fiarse de ella hay que romperla a propósito una vez y ver que se pone roja de verdad.' },
]);

B.qzData = JSON.stringify([
  { q: 'En este tema, ¿qué es la frontera de confianza?', o: ['a) La contraseña de administrador', 'b) La línea donde el dato deja de ser tuyo y entra como sospechoso', 'c) El límite de tamaño de la base de datos', 'd) El cortafuegos del servidor'], c: 1 },
  { q: 'La validación que hace el navegador antes de mandar el formulario es…', o: ['a) La única que hace falta', 'b) Suficiente si el usuario no sabe programar', 'c) Cortesía: avisa y ahorra un viaje, pero no es seguridad', 'd) Innecesaria y hay que quitarla'], c: 2 },
  { q: '¿Por qué una lista permitida es mejor que una lista prohibida?', o: ['a) Porque es más corta de escribir', 'b) Porque no hay que adivinar el ataque, solo conocer el uso legítimo', 'c) Porque el servidor la procesa más rápido', 'd) Porque no necesita mantenimiento'], c: 1 },
  { q: 'Una política que deja entrar a «cualquiera con sesión iniciada» falla porque…', o: ['a) Tener sesión no es ser de la casa: comprueba la condición equivocada', 'b) Las sesiones caducan demasiado pronto', 'c) La sesión no se puede leer desde la base de datos', 'd) No permite entrar desde el teléfono'], c: 0 },
  { q: 'Una consulta con parámetros evita la inyección porque…', o: ['a) Borra los caracteres raros del texto', 'b) Cifra el dato antes de guardarlo', 'c) Comprueba el texto contra una lista de ataques conocidos', 'd) La instrucción va aparte y el dato nunca puede cambiar la pregunta'], c: 3 },
  { q: 'Pintar un mensaje del chat con textContent en vez de innerHTML sirve para…', o: ['a) Que cargue más rápido', 'b) Que unas etiquetas escritas por alguien se vean y no se ejecuten', 'c) Que se pueda copiar el texto', 'd) Que funcione sin internet'], c: 1 },
  { q: 'Un barrido que borra un archivo porque no llegó la confirmación de guardado…', o: ['a) Está bien: no dejar basura es prioritario', 'b) Confunde «no me enteré» con «no pasó», y puede destruir algo bien guardado', 'c) Solo es un problema si el archivo era grande', 'd) Es correcto si se avisa después'], c: 1 },
  { q: '¿Qué significa fallar cerrado?', o: ['a) Cerrar la aplicación cuando hay un error', 'b) Guardar el error en un archivo y seguir', 'c) Ante lo que no se puede comprobar, tomar la salida que no hace daño', 'd) Reintentar hasta que salga bien'], c: 2 },
  { q: 'Una función que devuelve cero filas y ningún error…', o: ['a) Está funcionando correctamente', 'b) Hay que reintentarla sin más', 'c) Solo importa si el usuario se queja', 'd) Es un cero sospechoso: hay que tratarlo como pregunta, no como respuesta'], c: 3 },
  { q: '¿Cómo se sabe que una comprobación de verdad comprueba?', o: ['a) Rompiéndola a propósito una vez y viendo que se pone roja', 'b) Leyéndola con calma dos veces', 'c) Viendo que siempre sale en verde', 'd) Preguntándole a quien la escribió'], c: 0 },
]);

B.classGroups = JSON.stringify([
  { label: ['Se comprueba', 'Se puede confiar'], headA: '🚧 Cruza la frontera', headB: '🏠 Nace dentro', colA: 'ok', colB: 'no',
    words: [{ w: 'Lo que se escribe en un formulario', t: 'ok' }, { w: 'Una constante escrita en el propio código', t: 'no' },
      { w: 'Lo que viene en la dirección web', t: 'ok' }, { w: 'El resultado de sumar dos números tuyos', t: 'no' },
      { w: 'El archivo que sube alguien', t: 'ok' }, { w: 'Un texto fijo de la interfaz', t: 'no' },
      { w: 'La respuesta de un servidor ajeno', t: 'ok' }, { w: 'El número de secciones de la misión', t: 'no' }] },
  { label: ['Validar', 'Limitar'], headA: '🔍 Es validar', headB: '🚧 Es limitar', colA: 'ok', colB: 'no',
    words: [{ w: 'Comprobar que el correo tiene forma de correo', t: 'ok' }, { w: 'Aceptar como mucho cinco intentos por minuto', t: 'no' },
      { w: 'Exigir que la fecha exista de verdad', t: 'ok' }, { w: 'Rechazar archivos de más de diez megas', t: 'no' },
      { w: 'Aceptar solo los tipos de archivo de la lista', t: 'ok' }, { w: 'Cortar la espera a los diez segundos', t: 'no' },
      { w: 'Revisar que el número esté entre 0 y 100', t: 'ok' }, { w: 'Pedir las filas de cien en cien', t: 'no' }] },
  { label: ['Separa', 'Mezcla'], headA: '🧷 Separa dato y orden', headB: '💉 Los mezcla', colA: 'ok', colB: 'no',
    words: [{ w: 'Consulta con parámetros', t: 'ok' }, { w: 'Armar la consulta pegando el texto del usuario', t: 'no' },
      { w: 'Pintar el mensaje con textContent', t: 'ok' }, { w: 'Pintar el mensaje con innerHTML', t: 'no' },
      { w: 'Decirle a la IA que lo pegado es dato', t: 'ok' }, { w: 'Pegar el correo recibido dentro del encargo', t: 'no' },
      { w: 'Pasar el nombre del archivo como argumento', t: 'ok' }, { w: 'Meter el nombre del archivo en una orden de consola', t: 'no' }] },
  { label: ['Se oye', 'Se calla'], headA: '🔔 El fallo se oye', headB: '🤫 El fallo se calla', colA: 'ok', colB: 'no',
    words: [{ w: 'El bloque se cae con error rojo', t: 'ok' }, { w: 'Un aviso que va al panel que nadie mira', t: 'no' },
      { w: 'Contar las filas y fallar si no son las esperadas', t: 'ok' }, { w: 'Devolver cero filas y seguir', t: 'no' },
      { w: 'Rechazar la respuesta que no es del tipo pedido', t: 'ok' }, { w: 'Guardar lo que llegue porque vino con código 200', t: 'no' },
      { w: 'Parar y avisar cuando no se puede comprobar', t: 'ok' }, { w: 'Suponer que si no hubo error, salió bien', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['Validar', 'es', 'comprobar', 'antes', 'de', 'usar.'], c: 0, art: 'Comprobar que el dato es lo que dice ser' },
  { s: ['La', 'lista', 'permitida', 'dice', 'lo', 'que', 'sí', 'entra.'], c: 2, art: 'La lista que sí se sostiene' },
  { s: ['Un', 'límite', 'escrito', 'evita', 'que', 'lo', 'ponga', 'otro.'], c: 1, art: 'Cuánto, cuántas veces y hasta cuándo' },
  { s: ['La', 'inyección', 'convierte', 'un', 'dato', 'en', 'una', 'orden.'], c: 1, art: 'El dato que se acaba ejecutando' },
  { s: ['Con', 'textContent', 'la', 'etiqueta', 'se', 've,', 'no', 'se', 'ejecuta.'], c: 1, art: 'Cómo se pinta sin ejecutar' },
  { s: ['Ante', 'la', 'duda,', 'el', 'código', 'falla', 'cerrado.'], c: 5, art: 'Tomar la salida que no hace daño' },
  { s: ['Un', 'cero', 'sin', 'error', 'es', 'una', 'pregunta.'], c: 1, art: 'El resultado vacío que hay que mirar dos veces' },
  { s: ['La', 'comprobación', 'tiene', 'que', 'poder', 'decir', 'que', 'no.'], c: 1, art: 'Lo que se rompe a propósito para creerle' },
]);

B.cmpData = JSON.stringify([
  { s: 'Comprobar que un dato es lo que dice ser antes de usarlo es ___.', opts: ['validarlo', 'guardarlo', 'cifrarlo'], c: 0 },
  { s: 'La lista que dice lo que sí se acepta se llama lista ___.', opts: ['permitida', 'prohibida', 'ordenada'], c: 0 },
  { s: 'La validación del navegador es cortesía; la que cuenta es la del ___.', opts: ['servidor', 'usuario', 'teclado'], c: 0 },
  { s: 'Cuando un dato termina ejecutándose como una orden hay una ___.', opts: ['inyección', 'copia', 'pausa'], c: 0 },
  { s: 'La consulta con ___ mantiene el dato fuera de la instrucción.', opts: ['parámetros', 'comillas', 'mayúsculas'], c: 0 },
  { s: 'Cuando algo no se puede comprobar, el código falla ___.', opts: ['cerrado', 'abierto', 'callado'], c: 0 },
  { s: 'Un resultado vacío sin error es un cero ___.', opts: ['sospechoso', 'correcto', 'normal'], c: 0 },
  { s: 'Una comprobación que nunca dice que no no ___ nada.', opts: ['comprueba', 'guarda', 'tarda'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Cruza', 'Nace dentro'], btnA: '🚧 Se comprueba', btnB: '🏠 Es de casa', colA: 'ok', colB: 'no',
    words: [{ w: 'Lo escrito en un formulario', t: 'ok' }, { w: 'Una constante del código', t: 'no' },
      { w: 'Lo que viene en la dirección', t: 'ok' }, { w: 'Un texto fijo del botón', t: 'no' },
      { w: 'El archivo que sube alguien', t: 'ok' }, { w: 'El número de secciones', t: 'no' },
      { w: 'La respuesta de otro servidor', t: 'ok' }, { w: 'Una suma de dos números tuyos', t: 'no' },
      { w: 'El mensaje que llega al chat', t: 'ok' }, { w: 'El nombre de la misión', t: 'no' }] },
  { label: ['Validar', 'Limitar'], btnA: '🔍 Validar', btnB: '🚧 Limitar', colA: 'ok', colB: 'no',
    words: [{ w: 'Forma de correo', t: 'ok' }, { w: 'Cinco intentos por minuto', t: 'no' },
      { w: 'Que la fecha exista', t: 'ok' }, { w: 'Diez megas como máximo', t: 'no' },
      { w: 'Tipo de archivo permitido', t: 'ok' }, { w: 'Cortar la espera a diez segundos', t: 'no' },
      { w: 'Número entre 0 y 100', t: 'ok' }, { w: 'Cien filas por página', t: 'no' },
      { w: 'Que el campo no venga vacío', t: 'ok' }, { w: 'Mil caracteres como tope', t: 'no' }] },
  { label: ['Se oye', 'Se calla'], btnA: '🔔 Se oye', btnB: '🤫 Se calla', colA: 'ok', colB: 'no',
    words: [{ w: 'Error rojo que corta', t: 'ok' }, { w: 'Aviso al panel que nadie mira', t: 'no' },
      { w: 'Contar las filas y fallar', t: 'ok' }, { w: 'Cero filas y seguir', t: 'no' },
      { w: 'Rechazar el tipo que no toca', t: 'ok' }, { w: 'Guardar porque vino con 200', t: 'no' },
      { w: 'Parar cuando no se puede comprobar', t: 'ok' }, { w: 'Suponer que salió bien', t: 'no' },
      { w: 'Avisar en pantalla y dejar rastro', t: 'ok' }, { w: 'Tragarse el error sin apuntarlo', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se recibe un dato de fuera', steps: ['Reconocer que cruzó la frontera de confianza', 'Comprobar el tipo y la forma contra una lista permitida', 'Comprobar el tamaño y el rango', 'Comprobar el permiso de quien lo manda, en el servidor', 'Usarlo separado de cualquier instrucción', 'Dejar rastro de lo que se aceptó y de lo que se rechazó'] },
  { label: 'Cómo se escribe una comprobación que sirve', steps: ['Escribir qué tiene que ser verdad para seguir', 'Hacer que el fallo corte y se vea, no que solo avise', 'Romperla a propósito y ver que se pone roja', 'Arreglar lo roto y ver que vuelve a verde', 'Dejarla puesta donde corre sola'] },
  { label: 'Qué se hace con un resultado vacío', steps: ['Mirar si hubo error de verdad o solo silencio', 'Preguntarse si ese cero es posible en un día normal', 'Repetir la consulta con otro permiso para comparar', 'Si el cero cambia con el permiso, el fallo era de autorización', 'Avisar y dejar apuntado el hallazgo con su fecha'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'La línea donde el dato deja de ser tuyo', ans: 'Frontera de confianza', opts: ['Frontera de confianza', 'Lista permitida', 'Límite', 'Fallar cerrado'] },
  { desc: 'Comprobar que el dato es lo que dice ser', ans: 'Validación', opts: ['Validación', 'Autorización', 'Inyección', 'Límite'] },
  { desc: 'Se escribe lo que sí se acepta y lo demás se rechaza', ans: 'Lista permitida', opts: ['Lista permitida', 'Lista prohibida', 'Consulta con parámetros', 'Fallar cerrado'] },
  { desc: 'Cuánto, cuántas veces, hasta cuándo y hasta dónde', ans: 'Límite', opts: ['Límite', 'Validación', 'Frontera de confianza', 'Cero sospechoso'] },
  { desc: 'Un dato que termina ejecutándose como una orden', ans: 'Inyección', opts: ['Inyección', 'Límite', 'Lista prohibida', 'Fallar en silencio'] },
  { desc: 'La instrucción va aparte y el dato viaja en su casilla', ans: 'Consulta con parámetros', opts: ['Consulta con parámetros', 'Lista prohibida', 'Frontera de confianza', 'Autorización'] },
  { desc: 'Ante lo que no se puede comprobar, la salida que no hace daño', ans: 'Fallar cerrado', opts: ['Fallar cerrado', 'Fallar en silencio', 'Límite', 'Validación'] },
  { desc: 'La operación sale mal y nadie se entera', ans: 'Fallar en silencio', opts: ['Fallar en silencio', 'Fallar cerrado', 'Inyección', 'Lista permitida'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Aceptar la foto de un documento en la Bóveda', func: 'Aceptar solo los tipos de la lista y con tope de tamaño', opts: ['Aceptar solo los tipos de la lista y con tope de tamaño', 'Aceptar cualquier archivo y revisarlo después', 'Rechazar los nombres con caracteres raros', 'Fiarse de la extensión que trae el nombre'] },
  { trans: 'Pintar en pantalla el mensaje que otro escribió en el chat', func: 'Ponerlo con textContent, que lo muestra tal cual', opts: ['Ponerlo con textContent, que lo muestra tal cual', 'Ponerlo con innerHTML y quitar las etiquetas raras', 'Buscar la palabra script y borrarla', 'Guardarlo ya convertido a HTML'] },
  { trans: 'Dejar que solo los cuatro de la casa lean las tablas', func: 'Preguntar si quien consulta tiene fila en familia_miembros', opts: ['Preguntar si quien consulta tiene fila en familia_miembros', 'Comprobar que hay una sesión iniciada', 'Confiar en el nombre que trae el usuario', 'Filtrar por la dirección desde la que entra'] },
  { trans: 'Guardar en la caché solo lo que de verdad es el archivo pedido', func: 'Rechazar la respuesta con redirección o con HTML donde iba un script', opts: ['Rechazar la respuesta con redirección o con HTML donde iba un script', 'Guardar todo lo que venga con código 200', 'Guardar solo los archivos pequeños', 'Volver a pedirlo hasta que llegue bien'] },
  { trans: 'Saber que el sembrado de la tabla se hizo de verdad', func: 'Contar las filas al final y caerse si no son cuatro', opts: ['Contar las filas al final y caerse si no son cuatro', 'Mirar que el editor diga Success', 'Dejar un aviso en el panel de notas', 'Volver a correr el bloque por si acaso'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Las notificaciones del chat dejaron de llegar y nadie se enteró', characteristic: 'La función leía con la clave anónima y recibía cero filas sin error', opts: ['La función leía con la clave anónima y recibía cero filas sin error', 'Los teléfonos perdieron la conexión', 'El servicio de notificaciones se cayó', 'Los mensajes tardaban demasiado'] },
  { disease: 'La aplicación quedó envenenada y recargar no la arreglaba', characteristic: 'El service worker guardó la pantalla de acceso como si fuera app.js', opts: ['El service worker guardó la pantalla de acceso como si fuera app.js', 'El archivo app.js estaba mal escrito', 'La caché se llenó de archivos viejos', 'El teléfono se quedó sin memoria'] },
  { disease: 'La casa parecía cerrada y entraba cualquiera que pidiera una cuenta', characteristic: 'La política comprobaba que hubiera sesión, no que fuera de la familia', opts: ['La política comprobaba que hubiera sesión, no que fuera de la familia', 'Las contraseñas eran demasiado cortas', 'La clave pública estaba en el navegador', 'Faltaba activar la seguridad por fila'] },
  { disease: 'Un documento bien guardado desapareció al fallar la red', characteristic: 'El barrido confundió «no llegó la confirmación» con «no se guardó»', opts: ['El barrido confundió «no llegó la confirmación» con «no se guardó»', 'El archivo se subió incompleto', 'El depósito estaba lleno', 'La ficha se creó dos veces'] },
  { disease: 'El editor dijo «Success» y la tabla se quedó vacía', characteristic: 'Las comprobaciones solo avisaban, así que ninguna podía detener nada', opts: ['Las comprobaciones solo avisaban, así que ninguna podía detener nada', 'El bloque se ejecutó dos veces', 'Los correos estaban mal escritos', 'La tabla no se había creado'] },
  { disease: 'Se dio por cerrada una casa que seguía abierta', characteristic: 'La prueba se hizo con sesión iniciada, así que no podía salir mal', opts: ['La prueba se hizo con sesión iniciada, así que no podía salir mal', 'La prueba se hizo demasiado rápido', 'Se probó en el teléfono equivocado', 'Faltaba borrar la caché del navegador'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'La línea donde el dato deja de ser tuyo.', type: 'Frontera de confianza' },
  { s: 'Comprobar que un dato es lo que dice ser antes de usarlo.', type: 'Validación' },
  { s: 'Se escribe lo que sí se acepta y lo demás se rechaza.', type: 'Lista permitida' },
  { s: 'Solo detiene lo que ya se le ocurrió a alguien.', type: 'Lista prohibida' },
  { s: 'Cuánto, cuántas veces, hasta cuándo y hasta dónde.', type: 'Límite' },
  { s: 'Un dato que termina ejecutándose como una orden.', type: 'Inyección' },
  { s: 'La instrucción va aparte y el dato viaja en su casilla.', type: 'Consulta con parámetros' },
  { s: 'Ante lo que no se puede comprobar, la salida que no hace daño.', type: 'Fallar cerrado' },
  { s: 'La operación sale mal y nadie se entera.', type: 'Fallar en silencio' },
  { s: 'El resultado vacío que hay que tratar como pregunta.', type: 'Cero sospechoso' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Lo escrito en un formulario', gen: 'Origen', n: 'De fuera', g: 'Cruza la frontera', t: 'Se comprueba entero' },
  { w: 'Una constante del propio código', gen: 'Origen', n: 'De dentro', g: 'Nace en casa', t: 'No la escribió nadie de fuera' },
  { w: 'Que el correo tenga forma de correo', gen: 'Defensa', n: 'Forma', g: 'Validar', t: 'Mira qué es el dato' },
  { w: 'Cinco intentos por minuto', gen: 'Defensa', n: 'Cantidad', g: 'Limitar', t: 'Mira cuánto y cuántas veces' },
  { w: 'Consulta con parámetros', gen: 'Defensa', n: 'Separación', g: 'Separar', t: 'El dato no puede cambiar la orden' },
  { w: 'Armar la consulta pegando texto', gen: 'Fallo', n: 'Mezcla', g: 'Inyección', t: 'El dato se vuelve instrucción' },
  { w: 'Cero filas sin error', gen: 'Fallo', n: 'Silencio', g: 'Fallar en silencio', t: 'Nadie se entera de que salió mal' },
  { w: 'Parar cuando no se puede comprobar', gen: 'Defensa', n: 'Salida segura', g: 'Fallar cerrado', t: 'Ante la duda, no se hace daño' },
  { w: 'Un aviso al panel que nadie mira', gen: 'Fallo', n: 'Silencio', g: 'Fallar en silencio', t: 'Avisar no es detener' },
  { w: 'Romper la prueba a propósito', gen: 'Defensa', n: 'Confianza', g: 'Validar la prueba', t: 'Solo se cree lo que ya dijo que no' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Comprobar que un dato es lo que dice ser es ___.', opts: ['validarlo', 'copiarlo', 'cifrarlo'], ans: 'validarlo' },
  { s: 'La lista que dice lo que sí entra es la lista ___.', opts: ['permitida', 'prohibida', 'completa'], ans: 'permitida' },
  { s: 'La validación que cuenta es la del ___.', opts: ['servidor', 'navegador', 'teclado'], ans: 'servidor' },
  { s: 'Un dato que se ejecuta como orden es una ___.', opts: ['inyección', 'copia', 'consulta'], ans: 'inyección' },
  { s: 'El dato viaja aparte en la consulta con ___.', opts: ['parámetros', 'comillas', 'espacios'], ans: 'parámetros' },
  { s: 'Ante lo que no se puede comprobar, se falla ___.', opts: ['cerrado', 'abierto', 'rápido'], ans: 'cerrado' },
  { s: 'Un resultado vacío sin error es un cero ___.', opts: ['sospechoso', 'correcto', 'seguro'], ans: 'sospechoso' },
  { s: 'Una comprobación que nunca dice que no no ___ nada.', opts: ['comprueba', 'cuesta', 'ocupa'], ans: 'comprueba' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica qué es la frontera de confianza y por qué la validación del navegador no basta.', ans: 'La frontera de confianza es la línea donde un dato deja de ser tuyo: lo que se escribe en un formulario, lo que viene en la dirección web, el archivo que sube alguien, la respuesta de un servidor ajeno. Todo lo que la cruza entra como sospechoso hasta que se comprueba. La validación del navegador queda del lado de fuera de esa línea: es cortesía, porque avisa al usuario antes de mandar y ahorra un viaje, pero cualquiera puede saltársela sin abrir siquiera la aplicación, mandando la petición directamente. La comprobación que cuenta es la del servidor, porque es la única que el usuario no puede editar. Regla de la casa: si una comprobación solo existe en el navegador, es como si no existiera.' },
  { q: '¿Por qué una lista permitida se sostiene y una lista prohibida no?', ans: 'La lista prohibida enumera lo que no se acepta, así que solo detiene lo que ya se le ocurrió a alguien: basta una forma nueva de escribir lo mismo (otra codificación, otro espaciado, otro idioma) para pasarla de largo. Y cada vez que aparece un truco nuevo hay que ir a añadirlo, siempre después del daño. La lista permitida enumera lo que sí se acepta y rechaza todo lo demás, y para escribirla no hace falta adivinar el ataque: hace falta conocer el uso legítimo, que es lo único que de verdad se conoce. Si un campo es un grado escolar, la lista permitida son los grados que existen, y con eso queda cerrado sin tener que imaginar nada.' },
  { q: 'Explica qué es una inyección y por qué la consulta con parámetros la evita.', ans: 'Una inyección es un dato que termina ejecutándose como una instrucción. Pasa siempre igual: alguien escribe texto donde se esperaba un valor y ese texto acaba dentro de una consulta a la base de datos, dentro de una página web, dentro de una orden de consola o dentro del encargo que se le da a una IA. La causa es una sola, mezclar el dato con la orden, y por eso la solución también es una sola: separarlos. En una consulta con parámetros la instrucción va escrita aparte, con casillas vacías, y el valor viaja en su casilla, así que por raro que venga el texto no puede cambiar la pregunta. Lo mismo en pantalla con textContent en vez de innerHTML: las etiquetas escritas por alguien se ven tal cual y no se ejecutan.' },
  { q: '¿Qué es fallar en silencio, por qué es el peor fallo y cómo se cazan los ceros sospechosos?', ans: 'Fallar en silencio es que una operación salga mal y nadie se entere, porque no hubo error: hubo un resultado vacío. Es el peor fallo porque no deja rastro y porque el sistema sigue diciendo que todo está bien, así que se descubre semanas después, cuando alguien pregunta por qué no llegó nada. El caso de esta casa: la función de las notificaciones leía las suscripciones con la clave anónima, que después de cerrar los datos ya no ve ninguna fila; no dio error, devolvió cero, y las notificaciones del chat murieron sin una sola alarma. Se cazan tratando el cero como pregunta y no como respuesta: si un dato que en un día normal siempre tiene filas devuelve cero, hay que comprobarlo con otro permiso antes de seguir, y si el cero cambia con el permiso, el fallo era de autorización.' },
  { q: 'Explica la diferencia entre autenticar y autorizar con el caso de la política que decía using (true).', ans: 'Autenticar responde a «¿quién eres?» y autorizar responde a «¿qué te dejan hacer?». La política del 28 de julio comprobaba lo primero y creía estar comprobando lo segundo: decía que podían leer y escribir los usuarios autenticados, y autenticado no significa «uno de los cuatro de esta casa», significa «cualquiera con una sesión iniciada en este proyecto». Como la clave publicable vive en el navegador, cualquiera podía registrarse con su propio correo, recibir un permiso válido y leerlo y escribirlo todo sin abrir siquiera la aplicación. La política que parecía cerrar la casa la dejaba abierta a quien supiera pedir una cuenta. El arreglo fue comprobar la condición correcta con una función propia que pregunta si quien consulta tiene fila en la tabla de la familia.' },
  { q: '¿Cómo se sabe que una comprobación de verdad comprueba? Explícalo con el sembrado que decía «Success».', ans: 'Se sabe rompiéndola a propósito una vez y viendo que se pone roja de verdad. Una comprobación que nunca ha dicho que no no ha demostrado nada: puede estar mirando el sitio equivocado, puede estar escrita al revés, o puede no poder detener nada aunque vea el problema. Eso último fue lo que pasó con el sembrado de la tabla de la familia: sus tres avisos usaban una forma que solo escribe una nota en un panel lateral y deja seguir, así que el editor mostró un «Success» grande y verde mientras la tabla quedaba vacía. Ninguna de las tres podía decir que no. El arreglo fue que cortaran de verdad, y añadir una cuarta que cuenta las filas al final y se cae si no son exactamente cuatro, que es la que comprueba el resultado y no la intención.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['VALIDAR', 'LIMITE', 'FRONTERA', 'FORMA', 'RANGO', 'TIPO']),
  haceSopa(10, ['INYECCION', 'PARAMETRO', 'ORDEN', 'TEXTO', 'PEGAR', 'DATO']),
  haceSopa(10, ['SILENCIO', 'CERRADO', 'CERO', 'ROJO', 'AVISO', 'PRUEBA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Todo lo que cruza la frontera de confianza entra como sospechoso hasta que se comprueba.', a: true },
  { q: 'La validación que hace el navegador es suficiente si el formulario está bien hecho.', a: false },
  { q: 'Una lista prohibida solo detiene lo que ya se le ocurrió a alguien.', a: true },
  { q: 'Para escribir una lista permitida hay que adivinar todos los ataques posibles.', a: false },
  { q: 'Tener sesión iniciada en un proyecto es lo mismo que ser de la familia.', a: false },
  { q: 'Un límite que no está escrito lo acaba poniendo quien ataca.', a: true },
  { q: 'La inyección aparece cuando un dato termina ejecutándose como una instrucción.', a: true },
  { q: 'Quitar del texto las palabras peligrosas es la forma correcta de evitar la inyección.', a: false },
  { q: 'Con textContent, unas etiquetas escritas por alguien se ven y no se ejecutan.', a: true },
  { q: 'Una respuesta con código 200 siempre es el archivo que se pidió.', a: false },
  { q: 'Fallar cerrado es tomar, ante lo que no se puede comprobar, la salida que no hace daño.', a: true },
  { q: 'Si no hubo error, se puede dar por hecho que la operación salió bien.', a: false },
  { q: 'Un aviso que va a un panel que nadie mira cuenta como comprobación.', a: false },
  { q: 'Un cero sin error hay que tratarlo como una pregunta, no como una respuesta.', a: true },
  { q: 'Una comprobación se puede dar por buena solo cuando ya se la ha visto fallar a propósito.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Qué entra por la frontera de confianza?', o: ['a) Una constante del propio código', 'b) Lo que escribe alguien en un formulario', 'c) El número de secciones de la misión', 'd) Un texto fijo de la interfaz'], a: 1 },
  { q: 'La validación del navegador sirve para…', o: ['a) Sustituir la del servidor', 'b) Cifrar el dato antes de mandarlo', 'c) Avisar y ahorrar un viaje, nada más', 'd) Impedir que alguien mande la petición a mano'], a: 2 },
  { q: 'La ventaja de la lista permitida es que…', o: ['a) No hay que adivinar el ataque, solo conocer el uso legítimo', 'b) Es más rápida de procesar', 'c) No se tiene que actualizar nunca', 'd) Permite guardar más datos'], a: 0 },
  { q: 'Una política que autoriza a «cualquiera con sesión» está…', o: ['a) Bien, porque exige contraseña', 'b) Bien, si el alta de cuentas está cerrada', 'c) Mal solo si hay muchos usuarios', 'd) Comprobando la condición equivocada'], a: 3 },
  { q: 'Un límite razonable para una subida de archivo es…', o: ['a) El que quepa en el disco', 'b) Un tope de tamaño y una lista de tipos aceptados', 'c) Ninguno, se revisa después', 'd) Solo comprobar la extensión del nombre'], a: 1 },
  { q: 'La causa de toda inyección es…', o: ['a) Usar comillas simples', 'b) No cifrar la base de datos', 'c) Mezclar el dato con la instrucción', 'd) Un servidor mal configurado'], a: 2 },
  { q: 'La consulta con parámetros funciona porque…', o: ['a) Limpia el texto de caracteres raros', 'b) Rechaza los textos muy largos', 'c) Compara con una lista de ataques', 'd) La instrucción va aparte y el dato no puede cambiarla'], a: 3 },
  { q: 'Pintar el mensaje del chat con innerHTML permite que…', o: ['a) Se ejecute lo que otro escribió', 'b) Se vea más ordenado', 'c) Se pueda copiar el texto', 'd) Cargue más rápido'], a: 0 },
  { q: 'Un service worker debe rechazar una respuesta cuando…', o: ['a) Tarda más de un segundo', 'b) Viene HTML donde se pidió un script, o hubo redirección', 'c) Pesa más de cien kilobytes', 'd) Viene de un servidor distinto'], a: 1 },
  { q: 'Si no llega la confirmación de que un documento se guardó, lo correcto es…', o: ['a) Borrar el archivo para no dejar basura', 'b) Volver a subirlo de una vez', 'c) Preguntar si la ficha existe antes de borrar nada', 'd) Suponer que falló y avisar de eso'], a: 2 },
  { q: 'Fallar cerrado significa…', o: ['a) Cerrar la aplicación al primer error', 'b) Ante lo que no se puede comprobar, tomar la salida que no hace daño', 'c) Guardar el error y seguir adelante', 'd) Reintentar hasta que salga bien'], a: 1 },
  { q: 'Una función que devuelve cero filas y ningún error…', o: ['a) Está bien: cero es un resultado válido', 'b) Hay que reintentarla y ya', 'c) Solo importa si alguien se queja', 'd) Es un cero sospechoso y hay que comprobarlo con otro permiso'], a: 3 },
  { q: 'Un aviso que no interrumpe la ejecución es…', o: ['a) La forma correcta de comprobar', 'b) Suficiente si se lee el registro', 'c) Una comprobación que no puede decir que no', 'd) Mejor que un error, porque no asusta'], a: 2 },
  { q: 'La forma de creerle a una comprobación es…', o: ['a) Romperla a propósito y ver que se pone roja', 'b) Leerla dos veces con calma', 'c) Ver que siempre sale en verde', 'd) Que la escriba otra persona'], a: 0 },
  { q: 'Ante una IA, el texto que llega de fuera se trata como…', o: ['a) Instrucción, si viene bien redactado', 'b) Dato, nunca como orden', 'c) Contexto de confianza', 'd) Ejemplo que se puede seguir'], a: 1 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La línea donde el dato deja de ser tuyo es la frontera de ___.', a: 'confianza' },
  { q: 'Comprobar que un dato es lo que dice ser es ___.', a: 'validar' },
  { q: 'La lista que dice lo que sí se acepta es la lista ___.', a: 'permitida' },
  { q: 'La validación que de verdad cuenta es la del ___.', a: 'servidor' },
  { q: 'Cuánto, cuántas veces y hasta cuándo lo decide el ___.', a: 'límite' },
  { q: 'Un dato que se acaba ejecutando como orden es una ___.', a: 'inyección' },
  { q: 'La consulta que deja el dato fuera de la instrucción es la consulta con ___.', a: 'parámetros' },
  { q: 'Para que la etiqueta se vea y no se ejecute, se pinta con ___.', a: 'textContent' },
  { q: 'Ante lo que no se puede comprobar, el código falla ___.', a: 'cerrado' },
  { q: 'El fallo que nadie oye es fallar en ___.', a: 'silencio' },
  { q: 'Un resultado vacío sin error es un cero ___.', a: 'sospechoso' },
  { q: 'Preguntar quién eres es autenticar; preguntar qué te dejan hacer es ___.', a: 'autorizar' },
  { q: 'Una comprobación solo se cree cuando ya se la vio ___ a propósito.', a: 'fallar' },
  { q: 'El aviso que no interrumpe nada no comprueba: solo ___.', a: 'avisa' },
  { q: 'El service worker rechaza la respuesta que trae ___ donde se pidió un script.', a: 'HTML' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Frontera de confianza', def: 'Donde el dato deja de ser tuyo' },
  { term: 'Validar', def: 'Comprobar que es lo que dice ser' },
  { term: 'Lista permitida', def: 'Se escribe lo que sí se acepta' },
  { term: 'Lista prohibida', def: 'Solo detiene lo ya conocido' },
  { term: 'Validación del servidor', def: 'La que el usuario no puede editar' },
  { term: 'Autorizar', def: 'Qué te dejan hacer, no quién eres' },
  { term: 'Límite', def: 'Cuánto, cuántas veces y hasta cuándo' },
  { term: 'Inyección', def: 'Un dato ejecutado como instrucción' },
  { term: 'Consulta con parámetros', def: 'La orden aparte y el dato en su casilla' },
  { term: 'textContent', def: 'La etiqueta se ve y no se ejecuta' },
  { term: 'Fallar cerrado', def: 'Ante la duda, la salida que no hace daño' },
  { term: 'Fallar en silencio', def: 'Sale mal y nadie se entera' },
  { term: 'Cero sospechoso', def: 'Un vacío sin error es una pregunta' },
  { term: 'La prueba que puede fallar', def: 'Solo se cree la que ya dijo que no' },
  { term: 'Inyección de instrucciones', def: 'Texto de fuera que la IA obedece' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'La política de seguridad por fila dice que pueden leer y escribir los usuarios autenticados. Parece que cierra la casa, pero el alta de cuentas del proyecto está abierta y la clave publicable vive en el navegador.' },
  { txt: 'El service worker guarda en la caché todo lo que responde con código 200. Detrás de la puerta de Cloudflare, cuando la sesión caduca el servidor devuelve la pantalla de acceso, en HTML y con 200, donde se había pedido js/app.js.' },
  { txt: 'Al subir un documento a la Bóveda falla la respuesta del guardado de la ficha. El código de limpieza borra el archivo del depósito para no dejar basura suelta.' },
  { txt: 'El bloque que siembra los cuatro miembros de la familia avisa con un mensaje si un correo no coincide, pero no interrumpe. El editor muestra «Success» y la tabla queda vacía.' },
  { txt: 'La función que manda las notificaciones del chat lee las suscripciones con la clave anónima. Desde que se cerraron los datos, esa consulta devuelve cero filas y ningún error.' },
  { txt: 'Para saber qué tablas quedaban abiertas se usó la lista de los archivos .sql del repositorio. Cuatro tablas que el código usa de verdad no estaban en esa lista.' },
  { txt: 'Para comprobar que un extraño ya no ve nada se abrió la aplicación en una ventana de incógnito y se inició sesión. No salió ningún dato ajeno y se dio por buena la prueba.' },
  { txt: 'Un formulario de la aplicación acepta un texto libre que después se pega dentro de un mensaje que se le manda a una IA para que lo resuma.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué se está dando por cierto sin comprobar, y dónde cruzó ese dato la frontera de confianza?',
  '2. ¿Cuál es la comprobación correcta, y en qué lado (aparato o servidor) tiene que vivir?',
  '3. Escribe en 3-4 frases qué pasa el día que esto falle, y si se va a notar o va a fallar en silencio.',
  '4. ¿Qué se rompe a propósito para saber que el arreglo de verdad comprueba?',
]);

B.critCaseGuides = JSON.stringify([
  'Nombrar el dato exacto y de dónde viene. Casi siempre lo que se da por cierto es una condición parecida a la correcta, no una mentira evidente: sesión en vez de familia, código 200 en vez de archivo pedido, ausencia de error en vez de éxito.',
  'La comprobación correcta se escribe como lista permitida y vive donde el usuario no puede editarla. Si la única defensa está en el navegador, no hay defensa.',
  'Lo que decide la gravedad no es el fallo, es si se oye. Un fallo ruidoso se arregla el mismo día; uno silencioso se descubre semanas después y para entonces ya hay daño acumulado.',
  'Una comprobación que nunca ha dicho que no todavía no ha demostrado nada. Se rompe a propósito, se ve la señal roja, se arregla y se ve volver el verde.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"La política ya exige estar autenticado, así que la casa está cerrada".', g1: 'Autenticado significa «cualquiera con sesión en este proyecto», no «uno de los cuatro». Con el alta de cuentas abierta, eso es una puerta con letrero, no una puerta.', g2: 'Se comprueba la condición correcta: una función propia que pregunta si quien consulta tiene fila en la tabla de la familia, y se aplica en el using y en el with check.' },
  { txt: '"Vino con código 200, así que es el archivo que pedí y se puede guardar en la caché".', g1: 'Detrás de una puerta con contraseña, una sesión caducada devuelve la pantalla de acceso en HTML y con 200. Guardar eso como si fuera app.js envenena la aplicación, y recargar no arregla nada.', g2: 'Se mira lo que llega, no solo el número: se rechaza si hubo redirección y si viene HTML donde se pidió un script, una hoja de estilo o una imagen.' },
  { txt: '"No llegó la confirmación de que se guardó la ficha, así que borro el archivo para no dejar basura".', g1: 'No enterarse no es lo mismo que no pasar. Si la fila entró y lo que se perdió fue la respuesta, ese borrado destruye un documento que estaba bien guardado.', g2: 'Primero se pregunta si la ficha existe. Se borra solo cuando se sabe que no hay ficha que reclame el archivo, y si no se puede averiguar, no se borra nada.' },
  { txt: '"El bloque avisa si algún correo no coincide, así que si algo falla me voy a enterar".', g1: 'Avisar no es detener. El aviso se va a un panel lateral que casi nadie mira mientras el resultado grande y verde dice «Success», y la tabla se queda vacía.', g2: 'Las comprobaciones cortan con error y deshacen la transacción, y al final se cuentan las filas: si no son exactamente cuatro, falla igual.' },
  { txt: '"La consulta no dio error, así que las notificaciones están funcionando".', g1: 'No hubo error porque no hubo pregunta mal formada: hubo cero filas. La clave anónima dejó de ver suscripciones al cerrar los datos y las notificaciones murieron sin una sola alarma.', g2: 'Se usa la clave de servicio, que corre en el servidor y no baja al navegador, y además se trata el cero como sospecha: cero suscripciones en una casa con cuatro teléfonos no es un resultado, es un aviso.' },
  { txt: '"Abrí la aplicación en incógnito, inicié sesión y no vi datos ajenos: está cerrado".', g1: 'Iniciar sesión convierte al que prueba en familia, así que esa prueba no podía salir mal. Una prueba que no puede fallar no prueba nada.', g2: 'La prueba es la petición cruda con la clave pública y sin sesión, y tiene que devolver vacío. Y antes de fiarse de ella, se comprueba que con la casa abierta esa misma petición devolvía todo.' },
]);

B.critDecisionBank = JSON.stringify([
  'La política de la base dice «to authenticated»: ¿qué condición hay que comprobar de verdad y dónde se escribe?',
  'El service worker guarda todo lo que responde 200: ¿qué tres señales delatan a un intruso y cuál basta?',
  'Falló la respuesta al guardar la ficha de un documento: ¿se borra el archivo, se deja o se pregunta antes?',
  'El sembrado dijo «Success» con la tabla vacía: ¿qué se cambia para que no pueda volver a decirlo?',
  'Las notificaciones no llegan y la función no da error: ¿por dónde se empieza a buscar y qué se mira primero?',
  'Hay que saber qué tablas están abiertas: ¿se mira el repositorio o el servidor, y por qué?',
  'Hay que probar que un extraño no ve nada: ¿cómo se hace la prueba para que pueda salir mal?',
  'Un texto que escribe un usuario va a acabar dentro del encargo que se le da a una IA: ¿qué se hace con él?',
]);

B.critDecisionGuide = `'La decisión correcta en esta etapa sigue siempre el mismo orden: primero se nombra el dato que cruza la frontera y de dónde viene; después se escribe la comprobación como lista permitida y se pone del lado del servidor, que es el que el usuario no puede editar; después se decide qué pasa cuando la comprobación no se puede hacer, y ahí se falla cerrado, nunca en silencio; y al final se rompe la comprobación a propósito para ver que de verdad se pone roja. Si el fallo no se puede oír, todavía no está resuelto.'`;

B.critCompareBank = JSON.stringify([
  { a: 'Comprobar que quien consulta tiene fila en la tabla de la familia.', b: 'Comprobar que quien consulta tiene una sesión iniciada.', ga: 'Caso A: comprueba la condición que de verdad importa, y quien no está en la tabla no ve nada, tenga cuenta o no.', gb: 'Caso B: con el alta de cuentas abierta, cualquiera se registra, recibe un permiso válido y lo lee todo sin abrir la aplicación.' },
  { a: 'Rechazar la respuesta que llega con redirección o con HTML donde iba un script.', b: 'Guardar en la caché todo lo que responda con código 200.', ga: 'Caso A: mira el contenido, no solo el número, así que la pantalla de acceso no se cuela nunca como si fuera la aplicación.', gb: 'Caso B: una sesión caducada envenena la caché, y desde el teléfono no hay forma de arreglarlo porque recargar sirve la basura otra vez.' },
  { a: 'Preguntar si la ficha existe antes de borrar el archivo suelto.', b: 'Borrar el archivo en cuanto falle la respuesta del guardado.', ga: 'Caso A: distingue «no me enteré» de «no pasó», y ante la duda deja el archivo quieto, que es la salida que no destruye nada.', gb: 'Caso B: si la fila sí entró y lo que se perdió fue la respuesta, queda una ficha que se ve, se toca y no abre.' },
  { a: 'Que la comprobación corte con error y además cuente el resultado al final.', b: 'Que la comprobación deje un aviso y siga adelante.', ga: 'Caso A: el fallo se oye el mismo día y la transacción se deshace, así que no queda nada a medias.', gb: 'Caso B: el aviso se va a un panel que nadie mira, el resultado sale verde y el problema se descubre mucho después.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se comprueba una condición parecida a la correcta, pero no la correcta.', guide: 'Es el fallo que más engaña, porque el código se lee bien: sesión en vez de familia, código 200 en vez de archivo pedido, ausencia de error en vez de éxito.' },
  { cause: 'La única validación vive en el navegador.', guide: 'Cualquiera manda la petición directamente y se salta la comprobación sin abrir la aplicación. Lo que no está en el servidor, no está.' },
  { cause: 'El dato del usuario se pega dentro de una instrucción.', guide: 'Ahí nace toda inyección, sea una consulta, una página, una orden de consola o el encargo de una IA. La causa es una sola: mezclar dato y orden.' },
  { cause: 'La comprobación avisa pero no interrumpe.', guide: 'El aviso se va a un panel lateral, el resultado sale verde y la operación sigue adelante como si nada. Avisar no es comprobar.' },
  { cause: 'Se toma la ausencia de error como prueba de éxito.', guide: 'Un cero sin error es la forma más común de fallar en silencio: nada se rompe, nada avisa, y el problema se descubre semanas después.' },
  { cause: 'La prueba se monta de forma que no pueda salir mal.', guide: 'Probar la casa cerrada con la sesión iniciada, o dar por buena una comprobación que nunca ha dicho que no. Una prueba que no puede fallar no prueba nada.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La aplicación quedó envenenada y recargar no la arreglaba.', guide: 'La caché guardó la pantalla de acceso como si fuera un archivo de la aplicación, porque se miró el código 200 y no el contenido.' },
  { effect: 'Las notificaciones del chat dejaron de llegar durante semanas sin una sola alarma.', guide: 'La consulta se hizo con un permiso que ya no veía ninguna fila, devolvió cero y nadie trató ese cero como sospechoso.' },
  { effect: 'La tabla quedó vacía mientras el editor mostraba «Success».', guide: 'Las comprobaciones solo avisaban, así que ninguna podía detener nada, y no había un recuento final del resultado.' },
  { effect: 'Un documento bien guardado desapareció del depósito.', guide: 'La limpieza confundió una respuesta perdida con un guardado fallido y borró antes de preguntar si la ficha existía.' },
  { effect: 'Cuatro tablas siguieron abiertas justo después de dar la casa por cerrada.', guide: 'La lista se sacó del repositorio, que dice lo que se pensó, en vez del código y del servidor, que dicen lo que hay.' },
  { effect: 'Se firmó como cerrada una casa que seguía abierta.', guide: 'La prueba se hizo con sesión iniciada, así que medía otra cosa. La prueba buena es la que puede salir mal.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🚧', label: 'De dónde viene', text: 'La <strong>frontera de confianza</strong>: dónde deja el dato de ser tuyo. <strong>Decide:</strong> qué hay que comprobar. <strong>Se rompe:</strong> al tratar como propio lo que escribió otro. <strong>En F.A.R.O:</strong> el formulario, la dirección, el archivo que se sube y la respuesta de un servidor ajeno.' },
  { y: '2', icon: '🔍', label: 'Qué forma tiene', text: 'La <strong>validación</strong>: tipo, largo, formato y rango, contra una <strong>lista permitida</strong>. <strong>Decide:</strong> si el dato entra. <strong>Se rompe:</strong> con listas prohibidas que siempre llegan tarde. <strong>En F.A.R.O:</strong> la Bóveda acepta unos tipos y un tamaño, no cualquier cosa.' },
  { y: '3', icon: '🪪', label: 'Quién lo manda', text: 'La <strong>autorización</strong>, comprobada en el servidor. <strong>Decide:</strong> si esa persona puede. <strong>Se rompe:</strong> al confundir tener sesión con ser de la casa. <strong>En F.A.R.O:</strong> es_familia() pregunta por la fila en familia_miembros, no por la sesión.' },
  { y: '4', icon: '🚧', label: 'Cuánto se acepta', text: 'El <strong>límite</strong>: tamaño, cantidad, ritmo, tiempo de espera y filas por consulta. <strong>Decide:</strong> hasta dónde puede llegar el daño. <strong>Se rompe:</strong> al no escribirlo. <strong>En F.A.R.O:</strong> sin tope, un archivo llena el depósito de la Bóveda.' },
  { y: '5', icon: '💉', label: 'Dato u orden', text: 'La <strong>separación</strong> entre dato e instrucción. <strong>Decide:</strong> si hay inyección. <strong>Se rompe:</strong> al pegar el texto dentro de una consulta, de una página o de un encargo. <strong>En F.A.R.O:</strong> el chat se pinta con textContent a propósito.' },
  { y: '6', icon: '🔒', label: 'Qué pasa si falla', text: '<strong>Fallar cerrado</strong>: la salida que no hace daño. <strong>Decide:</strong> si un fallo se vuelve agujero. <strong>Se rompe:</strong> al borrar, guardar o dejar pasar por si acaso. <strong>En F.A.R.O:</strong> la Bóveda no borra el archivo cuando no puede comprobar si hay ficha.' },
  { y: '7', icon: '🔔', label: 'Se oye o no', text: 'El fallo tiene que <strong>hacer ruido</strong>. <strong>Decide:</strong> cuánto tiempo dura el daño. <strong>Se rompe:</strong> con avisos que no interrumpen y con ceros que se dan por buenos. <strong>En F.A.R.O:</strong> las notificaciones murieron en silencio por un cero sin error.' },
]);

B.parteData = JSON.stringify({
  entrada: {
    nombre: 'La entrada que llega', icon: '🚧',
    estructura: { title: 'Qué es', info: '• Todo dato que <strong>cruza la frontera de confianza</strong><br>• Formulario, dirección web, archivo subido, respuesta ajena<br>• Entra como sospechoso hasta que se comprueba' },
    funcion: { title: 'Cómo se comprueba', info: '• Contra una <strong>lista permitida</strong>: se escribe lo que sí entra<br>• Tipo, largo, formato y rango, en ese orden<br>• Y siempre <strong>en el servidor</strong>: el navegador es cortesía' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con listas prohibidas, que solo paran lo ya conocido<br>• Al fiarse del código 200 sin mirar el contenido<br>• Al tratar como propio lo que en realidad escribió otro' },
    cuidados: { title: 'Cómo está en F.A.R.O', info: '• El <strong>service worker</strong> rechaza lo que llega con redirección o con HTML donde iba un script<br>• La <strong>Bóveda</strong> acepta tipos y tamaños concretos<br>• El chat pinta el mensaje con textContent' },
  },
  limite: {
    nombre: 'El límite', icon: '🚦',
    estructura: { title: 'Qué es', info: '• <strong>Cuánto, cuántas veces, hasta cuándo y hasta dónde</strong><br>• Tamaño, cantidad, ritmo, tiempo de espera y alcance<br>• Un límite que no se escribe lo acaba poniendo otro' },
    funcion: { title: 'Cómo se comprueba', info: '• Se elige un número concreto y se escribe, aunque sea provisional<br>• Se comprueba <strong>antes</strong> de hacer el trabajo, no después<br>• Y el rechazo dice qué pasó, sin contar de más' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con la subida sin tope, que llena el depósito<br>• Con la consulta sin paginar, que trae la tabla entera<br>• Con la espera sin corte, que deja la pantalla colgada' },
    cuidados: { title: 'Cómo está en F.A.R.O', info: '• La <strong>Bóveda</strong> es donde más se nota: archivos de la familia sin tope es un problema esperando<br>• Y el <strong>límite de intentos</strong> de la puerta es de la etapa 1, no se repite aquí' },
  },
  inyeccion: {
    nombre: 'Dato u orden', icon: '💉',
    estructura: { title: 'Qué es', info: '• Un dato que termina <strong>ejecutándose como instrucción</strong><br>• Cuatro caras, una sola causa: consulta, página, consola y encargo a una IA<br>• La causa es mezclar el dato con la orden' },
    funcion: { title: 'Cómo se comprueba', info: '• <strong>Consulta con parámetros:</strong> la orden aparte, el dato en su casilla<br>• <strong>textContent</strong> en vez de innerHTML al pintar<br>• Con una IA: decir que lo pegado es dato y nunca instrucción' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al armar la consulta pegando el texto del usuario<br>• Al intentar «limpiar» el texto quitando palabras peligrosas<br>• Al meter en el encargo de una IA un correo o un mensaje de fuera' },
    cuidados: { title: 'Cómo está en F.A.R.O', info: '• El <strong>chat familiar</strong> pinta usuario, tema y mensaje con textContent, así que unas etiquetas escritas se ven y no se ejecutan<br>• Las consultas van por el cliente de Supabase, con el valor aparte' },
  },
  silencio: {
    nombre: 'El fallo que no se oye', icon: '🤫',
    estructura: { title: 'Qué es', info: '• La operación sale mal y <strong>nadie se entera</strong><br>• No hay error: hay un resultado vacío o un aviso que nadie lee<br>• Es el fallo más caro porque dura semanas' },
    funcion: { title: 'Cómo se comprueba', info: '• El fallo <strong>corta</strong>, no avisa: error rojo y transacción deshecha<br>• Se cuenta el resultado al final y se falla si no cuadra<br>• El <strong>cero</strong> se trata como pregunta, no como respuesta' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con avisos que van a un panel que nadie mira<br>• Al tomar la ausencia de error como prueba de éxito<br>• Con pruebas montadas de forma que no puedan salir mal' },
    cuidados: { title: 'Cómo está en F.A.R.O', info: '• Caso real del 28 de julio de 2026: las <strong>notificaciones del chat</strong> murieron por un cero sin error<br>• El sembrado de la familia ya se cae con error rojo y cuenta las cuatro filas<br>• Regla: <strong>si no se puede oír, no está resuelto</strong>' },
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

/* Los rótulos que arrastra el molde. El de la constancia venía además con un
   error heredado: decía «Etapa 1» estando en la etapa 2. Aquí se corrige. */
const textos = [
  [/🛡️ \*Ruta de la Casa Cerrada · Etapa 2\* 🛡️/g, '🚦 *Ruta de la Casa Cerrada · Etapa 3* 🚦'],
  [/Qué se guarda de otras personas, por cuánto tiempo y quién responde, con las ocho peticiones que va a recibir el proyecto\. 🛡️/g, 'Validar lo que llega, ponerle límite y no dejar que un fallo pase callando, con los ocho fallos reales del 28 de julio de 2026. 🚦'],
  [/_Incluye evaluación conceptual y la petición que llega\._ ✍️/g, '_Incluye evaluación conceptual y el fallo que no se oyó._ ✍️'],
  [/Ruta de la Casa Cerrada · Etapa 2: Los datos de los demás/g, 'Ruta de la Casa Cerrada · Etapa 3: El código que no confía'],
  [/completó la Etapa 1 de la Ruta de la Casa Cerrada/g, 'completó la Etapa 3 de la Ruta de la Casa Cerrada'],
  [/La petición que llega/g, 'El fallo que no se oyó'],
  [/la petición que llega/g, 'el fallo que no se oyó'],
  [/Los datos de los demás/g, 'El código que no confía'],
  [/los datos de los demás/g, 'el código que no confía'],
  [/🛡️ ¡/g, '🚦 ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
