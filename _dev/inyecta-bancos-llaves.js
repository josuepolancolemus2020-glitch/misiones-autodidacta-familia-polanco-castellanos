/* Inyecta los bancos de la misión «Llaves y secretos» (Ruta de la Casa
   Cerrada, etapa 4) sobre el molde copiado de la etapa 3, y de paso cambia
   los rótulos que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-llaves.js

   Los seis primeros casos de la misión son cosas que están EN EL REPOSITORIO
   ahora mismo, comprobadas antes de escribirlas:

     · la clave anónima está a la vista en js/auth.js y js/chat.js;
     · las seis funciones de supabase/functions/ usan SERVICE_ROLE_KEY, y el
       aviso de send-chat-push/index.ts ya dice que esa clave no se pone jamás
       en el código del cliente;
     · antena-oauth-start, antena-oauth-callback y antena-publicar guardan
       tokens de redes: son llaves que abren voz, no datos;
     · PLAN-FARO-PRIVADO.md pide comprobar que el repositorio esté en privado;
     · el .gitignore tiene una sola línea (supabase/.temp/);
     · el APK se distribuye a los cuatro teléfonos, así que va firmado.

   Ninguna clave se escribe aquí, ni se escribirá: se nombra qué llave es, qué
   abre y dónde vive, que es justo lo que hay que saber decir sin enseñarla.  */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-casa-cerrada-llaves', 'js', 'llaves.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260730;
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

B.SAVE_KEY = `'faro_cib_llaves_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de las llaves superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del llavero explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de secretos experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del secreto maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de las llaves' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 4 de la Ruta de la Casa Cerrada completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Guarda las llaves donde caigan 🌫️' },
  { t: 25, n: 'Distingue secreto de público 🤫' },
  { t: 55, n: 'Mide el alcance de cada llave 👑' },
  { t: 90, n: 'Las saca del código 🏠' },
  { t: 130, n: 'Sabe que el historial recuerda 📜' },
  { t: 165, n: 'Rota el mismo día 🔄' },
  { t: 190, n: 'Custodio y suplente en cada fila 👤' },
]);

B.fcData = JSON.stringify([
  { w: 'Secreto', a: '🤫 No es lo que está escondido: es <strong>lo que da un poder que no debería tener quien lo encuentre</strong>. Por eso hay claves a la vista que no son un descuido, y archivos privados que sí lo son.' },
  { w: 'Clave anónima', a: '🎫 La que viaja con la aplicación y se puede leer desde cualquier teléfono. <strong>Está diseñada para verse</strong>: sola no abre nada, porque quien decide qué ve cada quien son las políticas de seguridad por fila.' },
  { w: 'Clave de servicio', a: '👑 <strong>Salta todas las políticas.</strong> Lee y escribe cualquier fila de cualquier familia. Vive solo en las variables del servicio y el propio código del proyecto lo deja escrito: no se pone jamás en el cliente.' },
  { w: 'El alcance', a: '📏 Qué puede hacer quien tenga la llave, <strong>en la peor lectura posible</strong> y no en la que uno tenía en mente. Es lo que decide si algo es secreto, no dónde está guardado.' },
  { w: 'El entorno', a: '🏠 Las variables del servicio: el sitio donde vive un secreto sin pasar por el repositorio ni por el navegador. Si una clave no puede vivir ahí, la pregunta es <strong>por qué se necesita en otro sitio</strong>.' },
  { w: 'El historial recuerda', a: '📜 Borrar la clave del archivo deja el archivo limpio y <strong>el historial intacto</strong>. Y hay copias en cada aparato clonado y en cada respaldo. Un secreto que se subió una vez ya está quemado.' },
  { w: 'Rotar', a: '🔄 Cambiar la clave en el servicio para que la vieja deje de servir. Es <strong>lo único que cierra la puerta de verdad</strong>, y funciona aunque la clave ya esté copiada en cien sitios: deja de abrir.' },
  { w: 'El custodio', a: '👤 Quién tiene la llave. Y con él siempre <strong>el suplente</strong>: quién más puede llegar a ella. Una llave con un solo custodio no es más segura, es un punto único de fallo con otro nombre.' },
  { w: 'Privado no es cifrado', a: '🚪 Un repositorio privado significa <strong>no lo ve cualquiera</strong>. Lo ve quien tenga acceso, quien tenga un token robado y todo el mundo el día que alguien cambie la visibilidad sin querer.' },
  { w: 'El .gitignore', a: '📄 La lista de lo que no se sube. Se escribe <strong>antes</strong> del primer archivo de claves, no después, porque después ya no sirve de nada: el archivo ya está en el historial.' },
  { w: 'Llave que abre voz', a: '📣 Los tokens de redes sociales no leen datos de nadie: <strong>publican en tu nombre</strong>. El daño no es una filtración, es una suplantación, y se descubre cuando ya lo vio todo el mundo.' },
  { w: 'Llave que no se puede rotar', a: '📱 La firma del APK. Si se pierde, no hay actualización posible de esa aplicación; si se filtra, cualquiera firma algo que el teléfono <strong>acepta como si fuera tuyo</strong>. Se guarda con copia aparte.' },
  { w: 'El inventario de llaves', a: '📋 Seis columnas y ninguna es la clave: nombre, qué abre, dónde vive, custodio y suplente, si se puede rotar, y la fecha de la última revisión.' },
  { w: '«Lo pongo aquí un momento»', a: '⚠️ La señal de alarma de esta etapa. Ese momento es cuando se filtran casi todas las claves: el archivo se guarda, se sube y nadie vuelve a mirarlo. No hay un ataque, hay <strong>una prisa</strong>.' },
  { w: 'La captura de pantalla', a: '📸 Por donde se escapan de verdad los secretos. Una imagen con un token en la esquina se reenvía, se respalda en la nube del teléfono y se queda ahí, y quien la mandó <strong>ni sabe que mandó una llave</strong>.' },
  { w: 'Las tres preguntas', a: '❓ Antes de escribir una clave en cualquier sitio: <strong>¿esto es un secreto?</strong>, <strong>¿este sitio se sube?</strong> y <strong>¿qué pasa si se filtra?</strong> Las tres se contestan en diez segundos.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué hace que algo sea un secreto?', o: ['a) Que esté escondido', 'b) El poder que da a quien lo encuentre', 'c) Que esté en un repositorio privado', 'd) Que tenga muchos caracteres'], c: 1 },
  { q: 'La clave anónima está a la vista en el código de F.A.R.O. Eso es…', o: ['a) Un fallo grave', 'b) Un descuido menor', 'c) Correcto: está diseñada para verse', 'd) Imposible de saber'], c: 2 },
  { q: '¿Qué protege a la clave anónima de abrir la casa entera?', o: ['a) Que es muy larga', 'b) Que va cifrada', 'c) Que caduca cada hora', 'd) Las políticas de seguridad por fila'], c: 3 },
  { q: 'La clave de servicio…', o: ['a) Salta todas las políticas', 'b) Solo lee, no escribe', 'c) Es igual que la anónima', 'd) Solo sirve desde el teléfono'], c: 0 },
  { q: 'Se subió una clave al repositorio y luego se borró la línea. ¿Qué hay que hacer?', o: ['a) Nada, ya está borrada', 'b) Avisar por chat', 'c) Rotarla en el servicio', 'd) Poner el archivo en el .gitignore'], c: 2 },
  { q: '¿Dónde debe vivir la clave de servicio?', o: ['a) En el código, comentada', 'b) En las variables del servicio', 'c) En un archivo del repositorio privado', 'd) En el gestor de claves del navegador'], c: 1 },
  { q: 'Un repositorio privado significa…', o: ['a) Que el contenido está cifrado', 'b) Que nadie puede clonarlo', 'c) Que no lo ve cualquiera', 'd) Que las claves están a salvo'], c: 2 },
  { q: '¿Qué llave de este proyecto NO se puede rotar?', o: ['a) La clave de servicio', 'b) La firma del APK', 'c) Los tokens de la Antena', 'd) La clave anónima'], c: 1 },
  { q: 'Una llave con un solo custodio y sin suplente es…', o: ['a) La forma más segura de guardarla', 'b) Un punto único de fallo', 'c) Lo que pide el testamento técnico', 'd) Obligatorio por ley'], c: 1 },
  { q: 'La señal de alarma de esta etapa es la frase…', o: ['a) «Lo pongo aquí un momento para probar»', 'b) «Esto ya lo revisé»', 'c) «Nadie va a mirar esto»', 'd) «Después lo documento»'], c: 0 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Secreto', 'Se puede ver'], headA: '🤫 Es un secreto', headB: '👀 Se puede ver', colA: 'ok', colB: 'no',
    words: [
      { w: 'La clave de servicio de Supabase', t: 'ok' }, { w: 'La clave anónima del cliente', t: 'no' },
      { w: 'El token de una red social', t: 'ok' }, { w: 'La dirección del proyecto en Supabase', t: 'no' },
      { w: 'La firma del APK', t: 'ok' }, { w: 'El nombre de una tabla', t: 'no' },
      { w: 'La contraseña del dominio', t: 'ok' }, { w: 'El código de la aplicación', t: 'no' },
    ],
  },
  {
    label: ['Sí', 'No'], headA: '🏠 Puede vivir en el repositorio', headB: '🚫 Nunca en el repositorio', colA: 'ok', colB: 'no',
    words: [
      { w: 'La clave anónima', t: 'ok' }, { w: 'La clave de servicio', t: 'no' },
      { w: 'La dirección del servicio', t: 'ok' }, { w: 'Un token de red social', t: 'no' },
      { w: 'El nombre de las tablas', t: 'ok' }, { w: 'La contraseña de una cuenta', t: 'no' },
      { w: 'Las políticas de seguridad en SQL', t: 'ok' }, { w: 'El archivo de firma del APK', t: 'no' },
    ],
  },
  {
    label: ['Cierra', 'No cierra'], headA: '✅ Cierra la puerta', headB: '❌ No cierra nada', colA: 'ok', colB: 'no',
    words: [
      { w: 'Rotar la clave en el servicio', t: 'ok' }, { w: 'Borrar la línea del archivo', t: 'no' },
      { w: 'Revocar el token de la red', t: 'ok' }, { w: 'Poner el archivo en el .gitignore después', t: 'no' },
      { w: 'Cambiar la contraseña de la cuenta', t: 'ok' }, { w: 'Volver el repositorio privado', t: 'no' },
      { w: 'Quitarle el acceso a quien se fue', t: 'ok' }, { w: 'Avisar por chat de que no la usen', t: 'no' },
    ],
  },
  {
    label: ['Se rota', 'No se rota'], headA: '🔄 Se puede rotar', headB: '⚠️ No se puede rotar', colA: 'ok', colB: 'no',
    words: [
      { w: 'La clave de servicio', t: 'ok' }, { w: 'La firma del APK', t: 'no' },
      { w: 'Un token de red social', t: 'ok' }, { w: 'El nombre del dominio ya publicado', t: 'no' },
      { w: 'La contraseña de una cuenta', t: 'ok' }, { w: 'Un dato de una niña ya filtrado', t: 'no' },
      { w: 'La clave anónima', t: 'ok' }, { w: 'Una captura que ya se reenvió', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['Un', 'secreto', 'da', 'un', 'poder', 'que', 'no', 'corresponde.'], c: 1, art: 'Lo que hay que proteger' },
  { s: ['El', 'alcance', 'dice', 'qué', 'puede', 'abrir.'], c: 1, art: 'Lo que de verdad se juzga' },
  { s: ['El', 'entorno', 'es', 'donde', 'debe', 'vivir.'], c: 1, art: 'El sitio que no se sube' },
  { s: ['El', 'historial', 'no', 'olvida', 'lo', 'que', 'se', 'subió.'], c: 1, art: 'La memoria del repositorio' },
  { s: ['Rotar', 'es', 'lo', 'único', 'que', 'cierra.'], c: 0, art: 'La acción que sí sirve' },
  { s: ['El', 'custodio', 'necesita', 'siempre', 'un', 'suplente.'], c: 1, art: 'Quien tiene la llave' },
  { s: ['Privado', 'no', 'significa', 'cifrado.'], c: 0, art: 'La confusión más cara' },
  { s: ['La', 'firma', 'del', 'APK', 'no', 'se', 'puede', 'rotar.'], c: 1, art: 'La llave sin segunda oportunidad' },
]);

B.cmpData = JSON.stringify([
  { s: 'Una llave se juzga por lo que puede ___.', opts: ['abrir', 'pesar', 'durar'], c: 0 },
  { s: 'La clave de servicio salta todas las ___.', opts: ['políticas', 'tablas', 'funciones'], c: 0 },
  { s: 'Un secreto debe vivir en las variables del ___.', opts: ['servicio', 'navegador', 'repositorio'], c: 0 },
  { s: 'Lo que se subió una vez se ___, no se borra.', opts: ['rota', 'oculta', 'comenta'], c: 0 },
  { s: 'Cada llave necesita custodio y ___.', opts: ['suplente', 'copia', 'nombre'], c: 0 },
  { s: 'Un repositorio privado no está ___.', opts: ['cifrado', 'guardado', 'publicado'], c: 0 },
  { s: 'La llave que no se puede rotar es la ___ del APK.', opts: ['firma', 'versión', 'licencia'], c: 0 },
  { s: 'La señal de alarma es «lo pongo aquí un ___».', opts: ['momento', 'día', 'rato largo'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Secreto', 'Se puede ver'], btnA: '🤫 Secreto', btnB: '👀 Se puede ver', colA: 'ok', colB: 'no',
    words: [
      { w: 'La clave de servicio', t: 'ok' }, { w: 'La clave anónima', t: 'no' },
      { w: 'Un token de red social', t: 'ok' }, { w: 'La dirección del servicio', t: 'no' },
      { w: 'La firma del APK', t: 'ok' }, { w: 'El nombre de una tabla', t: 'no' },
      { w: 'La contraseña del dominio', t: 'ok' }, { w: 'El código de la aplicación', t: 'no' },
      { w: 'La clave del correo', t: 'ok' }, { w: 'Las políticas en SQL', t: 'no' },
    ],
  },
  {
    label: ['Cierra', 'No cierra'], btnA: '✅ Cierra', btnB: '❌ No cierra', colA: 'ok', colB: 'no',
    words: [
      { w: 'Rotar la clave', t: 'ok' }, { w: 'Borrar la línea', t: 'no' },
      { w: 'Revocar el token', t: 'ok' }, { w: 'Poner el .gitignore después', t: 'no' },
      { w: 'Cambiar la contraseña', t: 'ok' }, { w: 'Volverlo privado', t: 'no' },
      { w: 'Quitar el acceso', t: 'ok' }, { w: 'Avisar por chat', t: 'no' },
      { w: 'Revocar la sesión', t: 'ok' }, { w: 'Renombrar el archivo', t: 'no' },
    ],
  },
  {
    label: ['Dentro', 'Fuera'], btnA: '🏠 Puede ir dentro', btnB: '🚫 Fuera del repositorio', colA: 'ok', colB: 'no',
    words: [
      { w: 'La clave anónima', t: 'ok' }, { w: 'La clave de servicio', t: 'no' },
      { w: 'El SQL de las políticas', t: 'ok' }, { w: 'El archivo de firma', t: 'no' },
      { w: 'La dirección del proyecto', t: 'ok' }, { w: 'Un token de la Antena', t: 'no' },
      { w: 'El nombre de las tablas', t: 'ok' }, { w: 'La contraseña del dominio', t: 'no' },
      { w: 'El manifiesto de la PWA', t: 'ok' }, { w: 'Una copia de la base de datos', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Qué se hace cuando una clave se filtra, de principio a fin', steps: ['Rotar la clave en el servicio, hoy mismo, antes de investigar nada', 'Comprobar que la aplicación sigue funcionando con la clave nueva', 'Mirar los registros para ver si alguien la usó y desde dónde', 'Quitar la clave del archivo y añadir el archivo al .gitignore', 'Anotar en el inventario la fecha, qué pasó y qué se cambió', 'Contarlo en casa: una filtración callada se repite'] },
  { label: 'Cómo se apunta una llave en el inventario', steps: ['Nombrarla en palabras de la casa, sin escribir la clave', 'Anotar qué abre y qué puede hacer quien la tenga', 'Anotar dónde vive: variables del servicio, gestor o sobre', 'Poner custodio y suplente, con nombre y apellido', 'Marcar si se puede rotar, y si no, dónde está la copia', 'Fechar la revisión, que es lo que caduca antes que la llave'] },
  { label: 'Las tres preguntas antes de escribir una clave', steps: ['¿Esto es un secreto, o solo lo parece?', '¿Este sitio se sube al repositorio o se comparte con alguien?', '¿Qué puede hacer quien lo encuentre, en la peor lectura?', 'Si alguna respuesta incomoda, la clave va al entorno y no al archivo'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Lo que da un poder que no corresponde a quien lo encuentre', ans: 'El secreto', opts: ['El secreto', 'El entorno', 'El custodio', 'La rotación'] },
  { desc: 'Qué puede hacer quien tenga la llave, en la peor lectura', ans: 'El alcance', opts: ['El alcance', 'El historial', 'El custodio', 'El secreto'] },
  { desc: 'Las variables del servicio: donde vive sin pasar por el repositorio', ans: 'El entorno', opts: ['El entorno', 'El .gitignore', 'La rotación', 'El alcance'] },
  { desc: 'Guarda para siempre lo que se subió una vez', ans: 'El historial', opts: ['El historial', 'El entorno', 'El respaldo', 'El custodio'] },
  { desc: 'Cambiar la clave para que la vieja deje de servir', ans: 'La rotación', opts: ['La rotación', 'El borrado', 'El cifrado', 'La revisión'] },
  { desc: 'Quién tiene la llave, y quién más puede llegar a ella', ans: 'El custodio', opts: ['El custodio', 'El alcance', 'El entorno', 'El secreto'] },
  { desc: 'Qué se hace el día que un secreto se escapa', ans: 'La salida', opts: ['La salida', 'La rotación', 'El historial', 'El inventario'] },
  { desc: 'La que no se puede rotar y por eso lleva copia aparte', ans: 'La firma del APK', opts: ['La firma del APK', 'La clave de servicio', 'El token de la Antena', 'La clave anónima'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'La clave de servicio de Supabase', func: 'En las variables del servicio, nunca en el repositorio', opts: ['En las variables del servicio, nunca en el repositorio', 'En un archivo del repositorio privado', 'En el código, comentada', 'En el gestor de claves del navegador'] },
  { trans: 'La clave anónima que usa el navegador', func: 'En el código: está diseñada para verse', opts: ['En el código: está diseñada para verse', 'En las variables del servicio', 'En un sobre cerrado', 'En ningún sitio: hay que quitarla'] },
  { trans: 'El archivo de firma del APK', func: 'Fuera del repositorio y con copia en otro sitio físico', opts: ['Fuera del repositorio y con copia en otro sitio físico', 'En el repositorio, que es privado', 'En las variables del servicio', 'En la Bóveda de la aplicación'] },
  { trans: 'La contraseña de la cuenta del dominio', func: 'En el gestor de claves, con custodio y suplente', opts: ['En el gestor de claves, con custodio y suplente', 'En el código del proyecto', 'En un mensaje de chat guardado', 'En las variables del servicio'] },
  { trans: 'El inventario de llaves ya lleno', func: 'En la Bóveda de F.A.R.O, sin ninguna clave dentro', opts: ['En la Bóveda de F.A.R.O, sin ninguna clave dentro', 'En el repositorio, que es privado', 'En un mensaje al grupo de la familia', 'En las variables del servicio'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Se borró la clave del archivo y aun así alguien la usó una semana después', characteristic: 'Seguía en el historial del repositorio y nunca se rotó', opts: ['Seguía en el historial del repositorio y nunca se rotó', 'Alguien la adivinó', 'El servicio la volvió a activar', 'Se filtró por el navegador'] },
  { disease: 'Un token publicó en las redes del proyecto algo que nadie escribió', characteristic: 'El token de la red se filtró y no se revocó a tiempo', opts: ['El token de la red se filtró y no se revocó a tiempo', 'La red social falló', 'Alguien entró a la aplicación', 'Se perdió la clave anónima'] },
  { disease: 'Alguien pudo leer los datos de otra familia entera', characteristic: 'Se usó la clave de servicio donde tocaba la anónima', opts: ['Se usó la clave de servicio donde tocaba la anónima', 'Las tablas estaban mal hechas', 'El navegador guardó los datos', 'Se compartió una contraseña'] },
  { disease: 'La clave apareció en una conversación del grupo familiar', characteristic: 'Se mandó una captura de pantalla sin mirarla antes', opts: ['Se mandó una captura de pantalla sin mirarla antes', 'El chat se hackeó', 'Alguien la escribió a mano', 'Se subió al repositorio'] },
  { disease: 'No se pudo publicar la actualización de la aplicación en los teléfonos', characteristic: 'Se perdió la firma del APK, que no se puede rotar', opts: ['Se perdió la firma del APK, que no se puede rotar', 'Caducó la clave de servicio', 'El repositorio se volvió público', 'Se acabó el espacio del servicio'] },
  { disease: 'Venció el dominio y el sitio se apagó sin que nadie pudiera evitarlo', characteristic: 'La cuenta tenía un solo custodio y ningún suplente', opts: ['La cuenta tenía un solo custodio y ningún suplente', 'El proveedor cerró', 'Se filtró la contraseña', 'Nadie pagó a tiempo por descuido'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Lo que da un poder que no corresponde a quien lo encuentre.', type: 'Secreto' },
  { s: 'La clave que viaja con la aplicación y está diseñada para verse.', type: 'Clave anónima' },
  { s: 'La clave que salta todas las políticas de seguridad por fila.', type: 'Clave de servicio' },
  { s: 'Qué puede hacer quien tenga la llave, en la peor lectura.', type: 'El alcance' },
  { s: 'Las variables del servicio, donde vive sin pasar por el repositorio.', type: 'El entorno' },
  { s: 'Guarda para siempre lo que se subió una sola vez.', type: 'El historial' },
  { s: 'Cambiar la clave para que la vieja deje de abrir.', type: 'Rotar' },
  { s: 'Quién tiene la llave y quién más puede llegar a ella.', type: 'Custodio y suplente' },
  { s: 'La llave que abre voz en vez de datos.', type: 'Token de red social' },
  { s: 'La llave que si se pierde no tiene segunda oportunidad.', type: 'Firma del APK' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'La clave de servicio', gen: 'Naturaleza', n: 'Da poder total', g: 'Secreto', t: 'No sale del entorno' },
  { w: 'La clave anónima', gen: 'Naturaleza', n: 'Sola no abre nada', g: 'Se puede ver', t: 'La protegen las políticas' },
  { w: 'Un token de red social', gen: 'Naturaleza', n: 'Publica en tu nombre', g: 'Secreto', t: 'Abre voz, no datos' },
  { w: 'El nombre de una tabla', gen: 'Naturaleza', n: 'No abre nada', g: 'Se puede ver', t: 'Es estructura, no llave' },
  { w: 'Rotar la clave en el servicio', gen: 'Reacción', n: 'La vieja deja de servir', g: 'Cierra', t: 'Funciona aunque haya copias' },
  { w: 'Borrar la línea del archivo', gen: 'Reacción', n: 'Queda en el historial', g: 'No cierra', t: 'El archivo limpio engaña' },
  { w: 'La clave de servicio en el repositorio', gen: 'Dónde vive', n: 'Se sube y se queda', g: 'Nunca', t: 'Aunque el repositorio sea privado' },
  { w: 'La clave anónima en el código', gen: 'Dónde vive', n: 'Tiene que viajar al cliente', g: 'Puede ir dentro', t: 'Está diseñada para verse' },
  { w: 'El archivo de firma del APK', gen: 'Rotación', n: 'Sin segunda oportunidad', g: 'No se rota', t: 'Se guarda copia aparte' },
  { w: 'La contraseña de una cuenta', gen: 'Rotación', n: 'Se cambia y ya', g: 'Se rota', t: 'El mismo día' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Una llave se juzga por lo que puede ___.', opts: ['abrir', 'pesar', 'durar'], ans: 'abrir' },
  { s: 'La clave de servicio salta todas las ___.', opts: ['politicas', 'tablas', 'funciones'], ans: 'politicas' },
  { s: 'Un secreto vive en las variables del ___.', opts: ['servicio', 'navegador', 'repositorio'], ans: 'servicio' },
  { s: 'Lo que se subió una vez se ___, no se borra.', opts: ['rota', 'oculta', 'comenta'], ans: 'rota' },
  { s: 'Cada llave necesita custodio y ___.', opts: ['suplente', 'copia', 'nombre'], ans: 'suplente' },
  { s: 'Un repositorio privado no está ___.', opts: ['cifrado', 'guardado', 'publicado'], ans: 'cifrado' },
  { s: 'La ___ del APK no se puede rotar.', opts: ['firma', 'version', 'licencia'], ans: 'firma' },
  { s: 'El ___ se escribe antes del primer archivo de claves.', opts: ['gitignore', 'inventario', 'respaldo'], ans: 'gitignore' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica por qué la clave anónima puede estar a la vista en el código y la de servicio no.', ans: 'Porque tienen alcances opuestos aunque abran el mismo servicio. La clave anónima tiene que viajar con la aplicación para que el navegador pueda hablar con la nube, así que se descarga y se puede leer desde cualquier teléfono; está diseñada para eso. Sola no abre nada, porque quien decide qué ve cada quien son las políticas de seguridad por fila que se estudiaron en la etapa 1. La clave de servicio, en cambio, salta todas esas políticas: con ella se lee y se escribe cualquier fila de cualquier familia sin permiso de nadie. Por eso vive solo en las variables del servicio, la usan las funciones de borde del proyecto, y el propio código lo deja escrito en el aviso de send-chat-push: esa clave no se pone jamás en el cliente. La lección general es que «hay una clave en el código» no es un diagnóstico: la pregunta es qué puede hacer esa clave concreta.' },
  { q: 'Se subió una clave al repositorio y se borró en el commit siguiente. ¿Está resuelto? Explica.', ans: 'No. Borrarla deja el archivo limpio y el historial intacto: cualquiera con una copia del repositorio puede ver la versión anterior, y hay copias en cada aparato donde se clonó y en cada respaldo. La clave está quemada aunque el archivo se vea bien. Lo único que cierra la puerta de verdad es rotar, es decir cambiar la clave en el servicio para que la vieja deje de servir; eso funciona aunque la clave ya esté copiada en cien sitios, porque deja de abrir. Se rota el mismo día, antes de investigar si alguien la usó, y después se mira en los registros. Reescribir el historial ayuda para el futuro, pero no alcanza a las copias que ya salieron, así que nunca sustituye a la rotación.' },
  { q: '¿Por qué un repositorio privado no es un sitio seguro para guardar secretos?', ans: 'Porque privado significa «no lo ve cualquiera», no significa cifrado. Lo ve todo el que tenga acceso, lo ve quien tenga un token robado de alguna de esas cuentas, y lo ve el mundo entero el día que alguien cambie la visibilidad por error, que son dos clics. Además el contenido queda en el historial, en los clones y en los respaldos, así que un cambio de visibilidad expone también el pasado y no solo el estado actual. La regla se sostiene igual de estricta: dentro de un repositorio, aunque sea privado, no van secretos. Lo privado sirve para proteger el contenido de la casa, que es el motivo por el que F.A.R.O lo es, pero no para proteger las llaves de la casa.' },
  { q: 'Explica qué es el alcance de una llave y por qué se mide en la peor lectura posible.', ans: 'El alcance es qué puede hacer quien tenga la llave, y es lo que decide si algo es un secreto o no, mucho más que dónde esté guardado. Se mide en la peor lectura posible y no en la que uno tenía en mente porque quien la encuentre no va a usarla como estaba previsto: va a usarla para todo lo que permita. Un token que se pidió para publicar una foto puede servir también para borrar publicaciones o leer mensajes, según lo que se le concedió al pedirlo. De ahí sale la regla del alcance mínimo: cada llave debe dar el poder justo para su trabajo, porque una llave que sirve para todo es una llave que, perdida, lo pierde todo. Y de ahí sale también la clasificación de esta etapa: hay llaves que abren datos y hay llaves que abren voz, y las segundas hacen un daño que no se mide en información sino en confianza.' },
  { q: '¿Qué es un custodio, por qué siempre lleva suplente, y qué llave del proyecto lo enseña?', ans: 'El custodio es quien tiene la llave; el suplente es quien más puede llegar a ella si el custodio falta. No es lo mismo compartir la clave que compartir cómo se recupera: basta con que el suplente sepa dónde está guardada y pueda alcanzarla. Se hace así porque una llave con un solo custodio se siente segura, ya que nadie más puede filtrarla, y en realidad es un punto único de fallo con otro nombre: si esa persona falta, el proyecto no puede seguir. La llave que lo enseña en esta casa es la de la cuenta del dominio: si solo una persona sabe dónde está, el día que falte no se renueva y el sitio se apaga solo, sin que nadie pueda evitarlo. Por eso el inventario de llaves lleva las dos columnas y por eso el testamento técnico de la Ruta de la Ingeniería pide exactamente lo mismo.' },
  { q: 'Cuenta cómo se filtran de verdad los secretos y qué costumbre lo evita.', ans: 'Casi nunca por un ataque. Se filtran por una captura de pantalla mandada por chat para pedir ayuda, con un token visible en una esquina que nadie miró; por un archivo de prueba en el que se puso la clave «un momento» y acabó subido; por un correo reenviado con la conversación entera debajo; y por la prisa de un martes. En todos esos casos no hay fallo de programación: hay una persona que no sabía que estaba mandando una llave. Las costumbres que lo evitan son cortas y no son técnicas: antes de mandar una captura, mirar la captura y recortar si hay duda; no escribir nunca una clave en un archivo del proyecto, ni siquiera temporalmente, porque ese temporalmente es el momento exacto en que se filtra; y si algo ya salió, rotar sin discutir si alguien lo vio. Ante la duda se rota, porque rotar cuesta cinco minutos y no rotar cuesta el proyecto.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['SECRETO', 'LLAVE', 'CLAVE', 'ROTAR', 'ENTORNO', 'TOKEN']),
  haceSopa(10, ['ALCANCE', 'CUSTODIO', 'FIRMA', 'PRIVADO', 'SUBIR', 'COPIA']),
  haceSopa(10, ['HISTORIAL', 'SERVICIO', 'ANONIMA', 'PERMISO', 'CUENTA', 'RIESGO']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Un secreto es todo aquello que está escondido.', a: false },
  { q: 'Un secreto es lo que da un poder que no corresponde a quien lo encuentre.', a: true },
  { q: 'La clave anónima de F.A.R.O está a la vista en el código, y eso es correcto.', a: true },
  { q: 'Lo que impide que la clave anónima abra la casa entera son las políticas por fila.', a: true },
  { q: 'La clave de servicio respeta las políticas de seguridad por fila.', a: false },
  { q: 'La clave de servicio puede ponerse en el código si el repositorio es privado.', a: false },
  { q: 'Borrar una clave del archivo la quita también del historial.', a: false },
  { q: 'Rotar una clave funciona aunque ya esté copiada en muchos sitios.', a: true },
  { q: 'Un repositorio privado mantiene su contenido cifrado.', a: false },
  { q: 'El .gitignore sirve igual si se escribe después de subir el archivo.', a: false },
  { q: 'Los tokens de redes sociales abren voz en vez de datos.', a: true },
  { q: 'La firma del APK se puede rotar como cualquier otra clave.', a: false },
  { q: 'Una llave con un solo custodio es la forma más segura de guardarla.', a: false },
  { q: 'Los secretos se filtran más por capturas y prisas que por ataques.', a: true },
  { q: 'Ante la duda de si una clave se vio, se rota igual.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Qué convierte algo en un secreto?', o: ['a) El poder que da a quien lo encuentre', 'b) Que esté escondido', 'c) Su longitud', 'd) Que esté en un repositorio privado'], a: 0 },
  { q: 'La clave anónima en el código de F.A.R.O es…', o: ['a) Un fallo grave', 'b) Un descuido menor', 'c) Correcta: está diseñada para verse', 'd) Un resto de una prueba'], a: 2 },
  { q: '¿Qué impide que esa clave abra la casa entera?', o: ['a) Que va cifrada', 'b) Las políticas de seguridad por fila', 'c) Que caduca', 'd) Que es muy larga'], a: 1 },
  { q: 'La clave de servicio…', o: ['a) Solo lee', 'b) Es igual que la anónima', 'c) Caduca cada día', 'd) Salta todas las políticas'], a: 3 },
  { q: '¿Dónde vive la clave de servicio en este proyecto?', o: ['a) En las variables del servicio', 'b) En el código, comentada', 'c) En un archivo del repositorio', 'd) En el gestor del navegador'], a: 0 },
  { q: 'Se subió una clave y luego se borró la línea. ¿Qué hay que hacer?', o: ['a) Nada más', 'b) Añadirla al .gitignore', 'c) Rotarla en el servicio hoy mismo', 'd) Avisar por chat'], a: 2 },
  { q: '«Repositorio privado» significa…', o: ['a) Contenido cifrado', 'b) Nadie puede clonarlo', 'c) Las claves están a salvo', 'd) No lo ve cualquiera'], a: 3 },
  { q: '¿Qué llave del proyecto NO se puede rotar?', o: ['a) La de servicio', 'b) Los tokens de la Antena', 'c) La firma del APK', 'd) La anónima'], a: 2 },
  { q: 'Los tokens de las redes sociales…', o: ['a) Leen los datos de la familia', 'b) Publican en nombre del proyecto', 'c) Solo sirven para entrar', 'd) No hace falta protegerlos'], a: 1 },
  { q: 'Una llave sin suplente es…', o: ['a) Más segura', 'b) Lo que pide el testamento', 'c) Un punto único de fallo', 'd) Obligatoria'], a: 2 },
  { q: '¿Por dónde se filtran de verdad los secretos?', o: ['a) Por capturas, prisas y archivos de prueba', 'b) Por ataques al servidor', 'c) Por fallos del navegador', 'd) Por las políticas mal escritas'], a: 0 },
  { q: 'La primera acción ante una filtración es…', o: ['a) Revisar los registros', 'b) Rotar la clave', 'c) Borrar el archivo', 'd) Reescribir el historial'], a: 1 },
  { q: 'El .gitignore se escribe…', o: ['a) Cuando aparece el problema', 'b) Antes del primer archivo de claves', 'c) Solo en repositorios públicos', 'd) Al terminar el proyecto'], a: 1 },
  { q: '¿Qué NO va nunca dentro del inventario de llaves?', o: ['a) El custodio', 'b) Qué abre la llave', 'c) La clave misma', 'd) La fecha de revisión'], a: 2 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saberse los términos', 'b) Tener la ficha impresa', 'c) Haber leído el módulo', 'd) Decir sin mirar cuál llave no se puede rotar y qué se hace en su lugar'], a: 3 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Una llave se juzga por lo que puede ___.', a: 'abrir' },
  { q: 'La clave de servicio salta todas las ___.', a: 'politicas' },
  { q: 'Un secreto vive en las variables del ___.', a: 'servicio' },
  { q: 'Lo que se subió una vez se ___, no se borra.', a: 'rota' },
  { q: 'Cada llave necesita custodio y ___.', a: 'suplente' },
  { q: 'Un repositorio privado no está ___.', a: 'cifrado' },
  { q: 'La ___ del APK no se puede rotar.', a: 'firma' },
  { q: 'El archivo que dice qué no se sube es el ___.', a: 'gitignore' },
  { q: 'Los tokens de redes sociales abren ___ en vez de datos.', a: 'voz' },
  { q: 'La clave que viaja con la aplicación es la ___.', a: 'anonima' },
  { q: 'Qué puede hacer quien tenga la llave es su ___.', a: 'alcance' },
  { q: 'La memoria del repositorio se llama ___.', a: 'historial' },
  { q: 'La señal de alarma es «lo pongo aquí un ___».', a: 'momento' },
  { q: 'El inventario de llaves se guarda en la ___.', a: 'boveda' },
  { q: 'Ante la duda de si alguien la vio, se ___ igual.', a: 'rota' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Secreto', def: 'Lo que da un poder que no corresponde' },
  { term: 'Clave anónima', def: 'Viaja con la aplicación y está hecha para verse' },
  { term: 'Clave de servicio', def: 'Salta todas las políticas por fila' },
  { term: 'El alcance', def: 'Qué puede hacer quien tenga la llave' },
  { term: 'El entorno', def: 'Las variables del servicio, fuera del repositorio' },
  { term: 'El historial', def: 'La memoria que no olvida lo subido' },
  { term: 'Rotar', def: 'Cambiar la clave para que la vieja no abra' },
  { term: 'Custodio y suplente', def: 'Quién la tiene y quién más la alcanza' },
  { term: 'Privado no es cifrado', def: 'No lo ve cualquiera, pero se ve' },
  { term: 'El .gitignore', def: 'La lista de lo que no se sube' },
  { term: 'Token de red social', def: 'La llave que abre voz en vez de datos' },
  { term: 'Firma del APK', def: 'La llave sin segunda oportunidad' },
  { term: 'Inventario de llaves', def: 'Seis columnas y ninguna es la clave' },
  { term: 'Las tres preguntas', def: '¿Es secreto? ¿Se sube? ¿Y si se filtra?' },
  { term: 'La captura de pantalla', def: 'Por donde se escapan de verdad' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'En js/auth.js y js/chat.js hay una clave de Supabase escrita en el código, que se descarga con la aplicación y cualquiera puede leer desde su teléfono.' },
  { txt: 'Las seis funciones de borde del proyecto corren con la clave de servicio, que salta todas las políticas de seguridad por fila. Una de ellas necesita esa clave para poder ver las suscripciones de aviso.' },
  { txt: 'La Antena publica en redes sociales, así que hay funciones de autorización y un token guardado por cada red conectada al proyecto.' },
  { txt: 'F.A.R.O vive en un repositorio privado y ahí está el material de la casa. Alguien propone guardar también ahí un archivo con las claves, total, nadie más lo ve.' },
  { txt: 'El .gitignore del proyecto tiene una sola línea. Hoy no hay archivos de claves, pero mañana hay que crear el primero para probar una función nueva.' },
  { txt: 'La aplicación se entrega como APK a los cuatro teléfonos de la familia, y ese APK va firmado con una llave que se generó una vez.' },
  { txt: 'Algo no funciona, se abre el panel del servicio y se manda una captura por el grupo de la familia para pedir ayuda. En una esquina de la imagen se ve un token entero.' },
  { txt: 'La cuenta del dominio, la del servicio y la de la tienda están a nombre de una sola persona, y solo esa persona sabe dónde están las claves.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué puede hacer quien tenga esa llave, en la peor lectura?',
  '2. ¿Dónde debería vivir, y por qué ahí y no en otro sitio?',
  '3. ¿Hay que rotar? Si no se puede rotar, ¿qué se hace en su lugar?',
  '4. Escribe en 3-4 frases quién la custodia, quién es el suplente y qué queda anotado.',
]);

B.critCaseGuides = JSON.stringify([
  'El alcance se mide en la peor lectura, no en la prevista: quien la encuentre la va a usar para todo lo que permita. Hay llaves que abren datos y llaves que abren voz, y esas segundas hacen daño en confianza y no en información.',
  'La clave anónima va en el código porque tiene que viajar al navegador; la de servicio va en las variables del servicio y nunca en el repositorio, aunque sea privado; la firma del APK vive fuera y con copia en otro sitio físico.',
  'Casi todo se rota, y se rota el mismo día, antes de investigar. Lo que no se puede rotar (la firma del APK) cambia de categoría entera: copia aparte, anotada en el testamento técnico y probada una vez al año.',
  'Cada fila del inventario lleva custodio y suplente con nombre, y ninguna columna es la clave. Lo que se anota es dónde está y cómo se recupera, no el secreto.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Hay una clave escrita en el código de la aplicación, hay que sacarla de ahí ya".', g1: 'Depende de cuál. La clave anónima tiene que estar ahí para que el navegador pueda hablar con la nube, y está diseñada para verse: sola no abre nada.', g2: 'Lo que la protege son las políticas de seguridad por fila. Si esas estuvieran mal escritas, esta misma clave abriría la casa entera: es pública porque las políticas están puestas.' },
  { txt: '"Ya borré la clave del archivo y volví a subir, quedó resuelto".', g1: 'El archivo quedó limpio y el historial no: cualquiera con una copia del repositorio ve la versión anterior, y hay copias en cada clon y en cada respaldo.', g2: 'Lo único que cierra es rotar la clave en el servicio, hoy mismo y antes de investigar nada. Reescribir el historial ayuda para el futuro pero no alcanza a las copias que ya salieron.' },
  { txt: '"El repositorio es privado, ahí podemos guardar el archivo de claves".', g1: 'Privado significa que no lo ve cualquiera, no que esté cifrado. Lo ve quien tenga acceso, quien tenga un token robado, y todo el mundo el día que alguien cambie la visibilidad con dos clics.', g2: 'Dentro de un repositorio no van secretos, aunque sea privado. Lo privado sirve para el contenido de la casa, no para las llaves de la casa.' },
  { txt: '"El token de la red social no importa tanto, total no tiene datos de nadie".', g1: 'No abre datos: abre voz. Quien lo tenga publica en nombre del proyecto, y eso se descubre cuando ya lo vio todo el mundo.', g2: 'El daño no se mide en información perdida sino en confianza, que es más lenta de reconstruir. Se revisan cada cierto tiempo y se revocan los de redes que ya no se usan.' },
  { txt: '"La firma del APK la tengo yo en la computadora, no hace falta más".', g1: 'Esa es la única llave del proyecto que no se puede rotar: si se pierde, no hay forma de publicar una actualización de esa misma aplicación y hay que reinstalar en todos los aparatos.', g2: 'Cambia de categoría: copia en otro sitio físico, anotada en el testamento técnico, y una prueba al año de que la copia sirve de verdad.' },
  { txt: '"Solo yo sé dónde están las claves, así están más seguras".', g1: 'Se siente seguro porque nadie más puede filtrarlas, y lo que significa de verdad es que el proyecto entero cabe en una cabeza.', g2: 'Cada llave necesita custodio y suplente. No hay que compartir la clave: basta con que el suplente sepa dónde está guardada y pueda llegar a ella el día que haga falta.' },
]);

B.critDecisionBank = JSON.stringify([
  'Una clave a la vista en el código del cliente: ¿se saca, se deja o depende? ¿De qué depende?',
  'Una función necesita ver filas de todas las familias: ¿qué llave se le da y dónde vive?',
  'Los tokens de las redes conectadas a la Antena: ¿cada cuánto se revisan y qué se hace con los que ya no se usan?',
  'Alguien propone guardar el archivo de claves en el repositorio privado: ¿qué respondes y con qué argumento?',
  'Hay que crear el primer archivo con una clave para probar: ¿qué se hace antes de escribir la primera letra?',
  'La firma del APK: ¿dónde vive, quién la custodia y qué se prueba una vez al año?',
  'Una captura con un token salió por el grupo de la familia: ¿qué se hace primero y qué se hace después?',
  'Todas las cuentas están a nombre de una sola persona: ¿qué se cambia y qué queda escrito?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Rotar la clave el mismo día que aparece en el repositorio.', b: 'Borrar la línea y revisar después si alguien la usó.', ga: 'Caso A: la llave vieja deja de abrir aunque esté copiada en cien sitios. Cuesta cinco minutos y cierra de verdad.', gb: 'Caso B: el archivo se ve limpio y la llave sigue sirviendo. Se investiga con la puerta abierta, que es el peor momento para investigar.' },
  { a: 'Guardar la clave de servicio en las variables del servicio.', b: 'Guardarla en un archivo del repositorio privado.', ga: 'Caso A: no pasa por el repositorio ni por el navegador, así que no hay historial, ni clones, ni respaldos con la llave dentro.', gb: 'Caso B: queda en el historial para siempre y depende de que nadie cambie la visibilidad ni pierda un token de acceso.' },
  { a: 'Una llave con custodio y suplente.', b: 'Una llave que solo conoce una persona.', ga: 'Caso A: si falta el custodio, el suplente sabe dónde está y cómo llegar a ella. El proyecto sigue.', gb: 'Caso B: se siente más seguro y en realidad es un punto único de fallo: el día que falte esa persona, el dominio no se renueva y el sitio se apaga solo.' },
  { a: 'Escribir el .gitignore antes de crear el archivo de claves.', b: 'Añadirlo al .gitignore en cuanto se note el problema.', ga: 'Caso A: el archivo nunca entra al historial, así que no hay nada que rotar ni que reescribir.', gb: 'Caso B: llega tarde por definición. El archivo ya se subió al menos una vez y la clave ya está quemada.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se juzga una llave por si está a la vista y no por lo que abre.', guide: 'Se saca del código la clave anónima, que tiene que estar ahí, y se deja tranquila la de servicio si nadie preguntó qué hace. Se arregla lo que no estaba roto y se deja lo que sí.' },
  { cause: 'Se escribe una clave en un archivo «un momento, para probar».', guide: 'Ese momento es cuando se filtran casi todas: el archivo se guarda, se sube con el resto y nadie vuelve a mirarlo. No hay ataque, hay prisa.' },
  { cause: 'Se borra la clave del archivo y no se rota.', guide: 'El historial la conserva, y también los clones y los respaldos. La llave sigue abriendo y el archivo limpio da una sensación de resuelto que es lo más peligroso.' },
  { cause: 'Se confía en que el repositorio es privado.', guide: 'Privado no es cifrado: lo ve quien tenga acceso o un token robado, y lo ve todo el mundo el día que alguien cambie la visibilidad sin querer.' },
  { cause: 'Se manda una captura de pantalla sin mirarla.', guide: 'Es la vía de filtración más común y la menos vigilada. La imagen se reenvía, se respalda en la nube del teléfono y se queda ahí para siempre.' },
  { cause: 'Se guarda una llave con un solo custodio.', guide: 'El proyecto entero pasa a depender de una persona. No es seguridad: es un punto único de fallo con nombre de precaución.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Una clave apareció en el repositorio y no pasó nada.', guide: 'Se rotó el mismo día, antes de investigar. La que estaba subida dejó de abrir, así que las copias que hubiera quedaron sin valor.' },
  { effect: 'Nadie tuvo que discutir si la clave del código era un problema.', guide: 'Estaba en el inventario con su alcance escrito: clave anónima, protegida por las políticas por fila. La pregunta ya tenía respuesta antes de hacerse.' },
  { effect: 'El dominio se renovó a tiempo estando el custodio de viaje.', guide: 'Había suplente, y el suplente sabía dónde estaba guardada la clave y cómo llegar a ella. No hizo falta compartir el secreto, solo el camino.' },
  { effect: 'Se pudo publicar una actualización del APK dos años después.', guide: 'La firma estaba guardada fuera del repositorio, con copia en otro sitio, y una vez al año alguien comprobaba que la copia servía.' },
  { effect: 'Un token de red social dejó de existir antes de hacer daño.', guide: 'Se revisaban cada cierto tiempo y se revocaban los de redes que ya no se usaban, así que el que se filtró llevaba meses sin servir.' },
  { effect: 'Una captura con un token no acabó en filtración.', guide: 'Se miró la imagen antes de mandarla y se recortó la esquina. Y como quedó la duda, se rotó igual: cuesta cinco minutos.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🤫', label: 'El secreto', text: 'Lo que da <strong>un poder que no corresponde</strong> a quien lo encuentre. <strong>Se reconoce:</strong> preguntando qué haría alguien con esto. <strong>Se pierde:</strong> creyendo que secreto es lo que está escondido. <strong>Aquí:</strong> la clave anónima está a la vista y no lo es.' },
  { y: '2', icon: '👑', label: 'El alcance', text: 'Qué puede hacer quien la tenga, <strong>en la peor lectura</strong>. <strong>Se mide:</strong> por lo que permite, no por lo previsto. <strong>Se pierde:</strong> pidiendo más permisos de los necesarios. <strong>Aquí:</strong> la clave de servicio salta todas las políticas.' },
  { y: '3', icon: '🏠', label: 'El entorno', text: 'Dónde vive: <strong>las variables del servicio</strong>. <strong>Sirve para:</strong> que no pase por el repositorio ni por el navegador. <strong>Se pierde:</strong> en el archivo de prueba de un martes. <strong>Aquí:</strong> ahí viven las llaves de las seis funciones de borde.' },
  { y: '4', icon: '📜', label: 'El historial', text: 'La memoria del repositorio, que <strong>no olvida nunca</strong>. <strong>Guarda:</strong> cada versión de cada archivo. <strong>Se pierde:</strong> creyendo que borrar una línea borra el pasado. <strong>Aquí:</strong> el .gitignore tiene una sola línea, y hay que revisarlo antes del primer archivo de claves.' },
  { y: '5', icon: '🔄', label: 'La rotación', text: 'Cambiar la clave para que <strong>la vieja deje de abrir</strong>. <strong>Sirve para:</strong> cerrar de verdad, aunque haya copias. <strong>Se pierde:</strong> dejándolo para el fin de semana. <strong>Aquí:</strong> se rota el mismo día, antes de investigar.' },
  { y: '6', icon: '👤', label: 'El custodio', text: 'Quién la tiene, y <strong>quién más puede llegar a ella</strong>. <strong>Sirve para:</strong> que el proyecto no quepa en una cabeza. <strong>Se pierde:</strong> guardando la llave «por seguridad» sin decírselo a nadie. <strong>Aquí:</strong> el dominio, el servicio y la tienda.' },
  { y: '7', icon: '🚪', label: 'La salida', text: 'Qué se hace <strong>el día que un secreto se escapa</strong>. <strong>Orden:</strong> rotar, comprobar, mirar registros, anotar y contarlo. <strong>Se pierde:</strong> callándolo por vergüenza. <strong>Aquí:</strong> una filtración callada se repite.' },
]);

B.parteData = JSON.stringify({
  secreto: {
    nombre: 'Qué es un secreto', icon: '🤫',
    estructura: { title: 'Qué es', info: '• Lo que da <strong>un poder que no corresponde</strong> a quien lo encuentre<br>• No es lo que está escondido: hay claves a la vista que no son secretas<br>• Y archivos privados que sí lo son' },
    funcion: { title: 'Cómo se hace', info: '• Se pregunta: <strong>¿qué haría alguien si encuentra esto?</strong><br>• Si la respuesta incomoda, es un secreto<br>• Y entonces vale la segunda pregunta: ¿este sitio se sube?' },
    enfermedades: { title: 'Dónde se pierde', info: '• Cuando se confunde secreto con escondido<br>• Cuando se protege lo que se ve y se olvida lo que no<br>• Cuando nadie ha hecho nunca la lista de las llaves que existen' },
    cuidados: { title: 'En este proyecto', info: '• La <strong>clave anónima</strong> está en js/auth.js y no es un secreto<br>• La <strong>clave de servicio</strong> sí lo es, y no aparece en ningún archivo<br>• Los <strong>tokens de la Antena</strong> también, y abren voz en vez de datos' },
  },
  alcance: {
    nombre: 'El alcance', icon: '👑',
    estructura: { title: 'Qué es', info: '• Qué puede hacer quien tenga la llave<br>• Se mide <strong>en la peor lectura</strong>, no en la prevista<br>• Es lo que decide si algo es secreto, más que dónde esté' },
    funcion: { title: 'Cómo se hace', info: '• Se escribe al lado de cada llave, en una frase<br>• Regla del <strong>alcance mínimo</strong>: el poder justo para su trabajo<br>• Una llave que sirve para todo, perdida, lo pierde todo' },
    enfermedades: { title: 'Dónde se pierde', info: '• Al pedir permisos de más «por si acaso» al conectar un servicio<br>• Al usar la llave de servicio donde bastaba la del visitante<br>• Al suponer que un token solo hace aquello para lo que se pidió' },
    cuidados: { title: 'En este proyecto', info: '• Anónima: <strong>no abre nada sola</strong>, la frenan las políticas por fila<br>• De servicio: <strong>todas las filas de todas las familias</strong><br>• Token de red: <strong>publica en nombre del proyecto</strong>' },
  },
  entorno: {
    nombre: 'El entorno', icon: '🏠',
    estructura: { title: 'Qué es', info: '• Las <strong>variables del servicio</strong>: el sitio donde vive un secreto<br>• No pasa por el repositorio ni llega al navegador<br>• Si una clave no puede vivir ahí, hay que preguntarse por qué' },
    funcion: { title: 'Cómo se hace', info: '• Se carga una vez en el panel del servicio y no se copia a ningún lado<br>• El código la pide por su nombre, nunca la escribe<br>• Lo que sí se escribe es <strong>el nombre de la variable</strong>' },
    enfermedades: { title: 'Dónde se pierde', info: '• En el archivo de prueba de «lo pongo aquí un momento»<br>• En el <code>.gitignore</code> que se escribió tarde<br>• En una captura de pantalla del panel, mandada por chat' },
    cuidados: { title: 'En este proyecto', info: '• Ahí viven las llaves de las <strong>seis funciones de borde</strong><br>• El <code>.gitignore</code> tiene <strong>una sola línea</strong>: se revisa antes del primer archivo de claves<br>• El repositorio es privado, y aun así no lleva secretos' },
  },
  rotacion: {
    nombre: 'La rotación', icon: '🔄',
    estructura: { title: 'Qué es', info: '• Cambiar la clave para que <strong>la vieja deje de abrir</strong><br>• Es lo único que cierra la puerta de verdad<br>• Funciona aunque la clave ya esté copiada en cien sitios' },
    funcion: { title: 'Cómo se hace', info: '• <strong>Primero se rota</strong>, el mismo día, antes de investigar<br>• Luego se comprueba que la aplicación sigue funcionando<br>• Después se miran los registros, se anota y <strong>se cuenta en casa</strong>' },
    enfermedades: { title: 'Dónde se pierde', info: '• Al dejarlo para el fin de semana «porque seguro nadie la vio»<br>• Al creer que borrar el archivo sustituye a rotar<br>• Al callarlo por vergüenza: una filtración callada se repite' },
    cuidados: { title: 'En este proyecto', info: '• Se rota: la de servicio, los tokens y las contraseñas<br>• <strong>No se rota: la firma del APK</strong>, así que lleva copia aparte<br>• Ante la duda de si alguien la vio, <strong>se rota igual</strong>' },
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

src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: una llave se juzga por lo que puede abrir y no por si está a la vista; la clave de servicio no viaja nunca al navegador ni al repositorio, aunque sea privado, porque el historial no olvida; lo que se subió una vez se rota y no se borra, el mismo día y antes de investigar; cada llave lleva custodio y suplente, que no es compartir el secreto sino el camino para llegar a él; y antes de escribir una clave en cualquier sitio se hacen tres preguntas de diez segundos: si es un secreto, si ese sitio se sube y qué pasa si se filtra. Cuando hay prisa por probar algo, la respuesta es siempre la misma: la clave va al entorno, nunca al archivo.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  [/🚦 \*Ruta de la Casa Cerrada · Etapa 3\* 🚦/g, '🗝️ *Ruta de la Casa Cerrada · Etapa 4* 🗝️'],
  [/El fallo que no se oyó/g, 'El llavero sobre la mesa'],
  [/el fallo que no se oyó/g, 'el llavero sobre la mesa'],
  [/Ruta de la Casa Cerrada · Etapa 3: El código que no confía/g, 'Ruta de la Casa Cerrada · Etapa 4: Llaves y secretos'],
  [/El código que no confía: validación, límites e inyección/g, 'Llaves y secretos: claves, entornos y repositorios'],
  [/El código que no confía/g, 'Llaves y secretos'],
  [/el código que no confía/g, 'llaves y secretos'],
  /* La cabecera de las pruebas impresas ya venía arreglada de la etapa 3, así
     que aquí lo que hay que cambiar es el número, no «Autocapacitación». */
  [/Autocapacitación Técnica/g, 'Etapa 4 · Ciberseguridad'],
  [/Etapa 3 · Ciberseguridad/g, 'Etapa 4 · Ciberseguridad'],
  [/🚦 ¡/g, '🗝️ ¡'],
  [/completó la Etapa 3 de la Ruta de la Casa Cerrada/g, 'completó la Etapa 4 de la Ruta de la Casa Cerrada'],
  /* palabra de la ruta política que viaja en el molde desde hace misiones */
  [/Simulacro de Presión: la interpelación/g, 'La llave sobre la mesa'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV seguían siendo las de la etapa 3
   (qué se da por cierto sin comprobar) y la de un cambio de funcionario, que
   viene de la ruta política y viaja en el molde desde hace varias misiones. */
src = src.replace(/¿Qué se está dando por cierto sin comprobar[^<]*/g,
  '¿Qué puede abrir esa llave, dónde debería vivir y hay que rotarla? Explica por qué tu respuesta cierra la puerta de verdad, en vez de dejar el archivo limpio y la llave abriendo.');
src = src.replace(/1\. ¿Qué gana cada caso y cuál aguanta un cambio de funcionario\? 2\. ¿Por qué no son el mismo caso\?/g,
  '1. ¿Cuál de los dos deja la puerta cerrada de verdad, y por qué? 2. ¿Por qué no son la misma decisión?');

/* el desenlace de la simulación seguía narrando el fallo silencioso de la etapa 3 */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(rotaLaClave){sfx(rotaLaClave?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(rotaLaClave){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🔄</span><span class="ms-text"><strong>Rotaste la clave el mismo día:</strong> la que estaba subida dejó de abrir, así que las copias que hubiera quedaron sin valor.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📋</span><span class="ms-text"><strong>Y después lo demás:</strong> comprobar que la aplicación sigue viva, mirar los registros, anotarlo en el inventario y contarlo en casa. Cinco minutos.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🧽</span><span class="ms-text"><strong>Borraste la línea:</strong> el archivo quedó limpio y la sensación fue de problema resuelto.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📜</span><span class="ms-text"><strong>Y la llave sigue abriendo:</strong> está en el historial, en cada clon y en cada respaldo. Lo único que cambió es que ahora nadie la está mirando.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='entrada',labAspecto='estructura';/, "let labParte='secreto',labAspecto='estructura';");

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
