/* Inyecta los bancos de la misión «La IA que programa» (Ruta de la Máquina que
   Predice, etapa 4) sobre el molde copiado de la etapa 3, y de paso cambia los
   rótulos que el molde arrastra.
   Uso:  node _dev/inyecta-bancos-programa.js

   Los seis primeros casos de la misión son fallos REALES del 28 de julio de
   2026, cometidos construyendo estas mismas misiones con ayuda de una IA, y
   están en los mensajes de los commits del repositorio:

     · una sonda con cinco comprobaciones en verde sobre una lista vacía;
     · esa misma sonda «limpiaba» faro_familia_v1, clave que no existe;
     · w.ASIGNACIONES daba indefinido: const no se cuelga de la ventana;
     · el script que reescribe el molde buscaba por el nombre de un parámetro
       que la misión anterior había renombrado a propósito;
     · un anclaje de corte cayó dentro de una tabla y partió la ficha;
     · el generador contó 29 preguntas donde tenían que ser 30, y se negó a
       escribir. Este último es el único que no costó tiempo.                 */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-maquina-programa', 'js', 'programa.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260731;
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

B.SAVE_KEY = `'faro_ia_programa_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la revisión superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de la revisión explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de cambios experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la revisión maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del código' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 4 de la Ruta de la Máquina que Predice completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Pega y sube 🌫️' },
  { t: 25, n: 'Lee lo que llegó 📖' },
  { t: 55, n: 'Mira qué archivos tocó 🔍' },
  { t: 90, n: 'Busca lo que desapareció 🗑️' },
  { t: 130, n: 'Prueba el caso incómodo 🧪' },
  { t: 165, n: 'Hace fallar sus comprobaciones 🔴' },
  { t: 190, n: 'Sube un cambio por vez ↩️' },
]);

B.fcData = JSON.stringify([
  { w: '«Funciona» y «está bien»', a: '⚖️ Funciona = hace lo que pediste <strong>en el caso que probaste</strong>. Está bien = eso, y además no rompe nada más, se explica línea por línea y se puede deshacer mañana.' },
  { w: '«Funcionó a la primera»', a: '🚨 La señal de alarma de esta etapa. No es buena noticia: es el momento de más riesgo, porque <strong>nada te obligó a mirar</strong>. Cuando algo falla, uno lee; cuando funciona, uno sube.' },
  { w: 'El caso fácil', a: '😊 Con señal, con datos completos, con el teléfono nuevo y una sola persona. Es el caso que la máquina prueba, y sirve para saber que <strong>no está roto del todo</strong>, para nada más.' },
  { w: 'El caso que decide', a: '😬 La maestra sin internet, el teléfono viejo, la lista vacía, el nombre con acento, dos personas a la vez. <strong>El que da pereza probar es el que hay que probar.</strong>' },
  { w: 'El alcance del cambio', a: '🔍 Qué archivos tocó de verdad, no cuáles dijo que iba a tocar. Se mira <strong>la lista de archivos modificados</strong>, y es el primer aviso de que algo se fue de madre.' },
  { w: 'El borrado silencioso', a: '💀 El peor fallo de los cinco: reescribe un archivo entero y <strong>se lleva por delante un arreglo anterior</strong>. Los otros se notan al probar; este se descubre semanas después y en otro sitio.' },
  { w: 'Revisar el cambio, no el archivo', a: '📋 Un archivo entero se lee y todo parece razonable. El cambio enseña <strong>qué se movió y qué desapareció</strong>, que es donde vive lo caro.' },
  { w: 'La dependencia de regalo', a: '📦 Una librería nueva «porque es lo estándar». En un proyecto estático y sin compilación eso no es una línea: es <strong>una decisión de arquitectura</strong> tomada por alguien que no conoce tus decisiones.' },
  { w: 'Lo que no sabe de tu casa', a: '🏠 Tus normas, tus nombres, lo que ya decidiste y lo que está prohibido aquí. Escribe código <strong>correcto que no encaja</strong>, y encaja peor cuanto más grande es el archivo que reescribe.' },
  { w: 'La prueba que nunca falló', a: '🟢 Una comprobación que no se ha visto en rojo <strong>no se sabe si funciona</strong>. Antes de confiar en ella hay que romperla a propósito una vez.' },
  { w: 'La lista vacía', a: '🕳️ Recorrer una lista vacía preguntando si todos cumplen algo devuelve que sí. Por eso la comprobación más aburrida es la que más salva: <strong>¿hay algo que comprobar?</strong>' },
  { w: 'La comprobación dentro', a: '🛠️ El mejor sitio para una comprobación es <strong>dentro de la herramienta que produce la cosa</strong>: no hay que acordarse de ejecutarla, no se puede saltar y falla en el momento exacto.' },
  { w: 'Un cambio por vez', a: '↩️ Subir una cosa a la vez, con su mensaje diciendo el porqué. Es lo que convierte un error en un rato perdido en vez de <strong>una tarde de arqueología</strong>.' },
  { w: 'El código que no entiendes', a: '🚫 No se sube. No porque esté mal, sino porque el día que falle a las diez de la noche <strong>vas a estar tú delante y la máquina no</strong>.' },
  { w: 'Funcionó cinco veces', a: '♻️ Una herramienta que funciona no está probada: está <strong>probada en lo de siempre</strong>. Cambia una palabra del contexto y falla, así que tiene que avisar cuando no encuentra lo que busca.' },
  { w: 'Avisar en vez de callar', a: '📢 Cuando una herramienta no encuentra lo que buscaba, lo barato es que <strong>lo diga</strong>. Un aviso cuesta una línea y es la diferencia entre notarlo hoy o dentro de un mes.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Por qué el código es donde antes se abandona la verificación?', o: ['a) Porque es más difícil de leer', 'b) Porque se ejecuta y parece que se verificó solo', 'c) Porque es más largo', 'd) Porque lo revisa el navegador'], c: 1 },
  { q: '«Funcionó a la primera» significa…', o: ['a) Que el cambio está bien', 'b) Que la máquina acertó', 'c) Que nada te obligó a mirarlo', 'd) Que se puede subir'], c: 2 },
  { q: '¿Cuál es el peor de los cinco fallos del código que llega hecho?', o: ['a) El caso fácil', 'b) La dependencia nueva', 'c) El alcance', 'd) El borrado silencioso'], c: 3 },
  { q: 'Una revisión se hace mirando…', o: ['a) El archivo terminado', 'b) Lo que cambió', 'c) La documentación', 'd) El mensaje del commit'], c: 1 },
  { q: 'Recorrer una lista vacía preguntando si todos cumplen algo devuelve…', o: ['a) Que sí, aunque no haya nada', 'b) Un error', 'c) Que no', 'd) Depende del navegador'], c: 0 },
  { q: 'Una comprobación que nunca se ha visto fallar…', o: ['a) Es la mejor señal', 'b) No se sabe si funciona', 'c) Se puede borrar', 'd) Hay que ejecutarla más veces'], c: 1 },
  { q: 'La máquina añade una librería nueva para formatear una fecha. Eso es…', o: ['a) Una línea más de código', 'b) Lo estándar y conviene', 'c) Una decisión de arquitectura', 'd) Indiferente en un sitio estático'], c: 2 },
  { q: '¿Dónde conviene poner una comprobación?', o: ['a) En una sonda aparte', 'b) Dentro de la herramienta que produce la cosa', 'c) En el mensaje del commit', 'd) En la documentación'], c: 1 },
  { q: 'El código que no entiendes…', o: ['a) Se sube si funciona', 'b) Se sube con un comentario', 'c) Se sube y se estudia después', 'd) No se sube'], c: 3 },
  { q: 'La última defensa cuando todo lo demás falla es…', o: ['a) Poder deshacer', 'b) Tener copias', 'c) Avisar en el chat', 'd) Probar más casos'], c: 0 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Funciona', 'Está bien'], headA: '▶️ Solo funciona', headB: '✅ Está bien', colA: 'ok', colB: 'no',
    words: [
      { w: 'Hace lo que pedí en el caso fácil', t: 'ok' }, { w: 'Lo puedo explicar línea por línea', t: 'no' },
      { w: 'Se ejecutó sin dar error', t: 'ok' }, { w: 'Probé el caso de la maestra sin internet', t: 'no' },
      { w: 'La pantalla se ve igual que antes', t: 'ok' }, { w: 'Miré qué líneas desaparecieron', t: 'no' },
      { w: 'La prueba salió en verde', t: 'ok' }, { w: 'Se puede deshacer mañana sin arrastrar nada', t: 'no' },
    ],
  },
  {
    label: ['Del cambio', 'Del archivo'], headA: '🔍 Se ve en el cambio', headB: '📄 Solo se ve leyendo entero', colA: 'ok', colB: 'no',
    words: [
      { w: 'Qué archivos se tocaron', t: 'ok' }, { w: 'Si el archivo entero tiene sentido', t: 'no' },
      { w: 'Qué líneas desaparecieron', t: 'ok' }, { w: 'Si los nombres son coherentes', t: 'no' },
      { w: 'Una dependencia nueva al principio', t: 'ok' }, { w: 'Si sobra código de hace meses', t: 'no' },
      { w: 'Un archivo tocado que no tocaba', t: 'ok' }, { w: 'Si la estructura general encaja', t: 'no' },
    ],
  },
  {
    label: ['Caso real', 'Caso fácil'], headA: '😬 El caso que decide', headB: '😊 El caso que luce', colA: 'ok', colB: 'no',
    words: [
      { w: 'La maestra sin internet', t: 'ok' }, { w: 'Con señal y datos completos', t: 'no' },
      { w: 'La lista vacía', t: 'ok' }, { w: 'La lista de ejemplo con tres cosas', t: 'no' },
      { w: 'El teléfono viejo de la casa', t: 'ok' }, { w: 'El navegador del escritorio', t: 'no' },
      { w: 'Un nombre con acento', t: 'ok' }, { w: 'Un nombre corto sin tildes', t: 'no' },
    ],
  },
  {
    label: ['Ayuda', 'Estorba'], headA: '🛡️ Ayuda a revisar', headB: '⚠️ Da falsa calma', colA: 'ok', colB: 'no',
    words: [
      { w: 'Un cambio pequeño por vez', t: 'ok' }, { w: 'Un archivo entero reescrito', t: 'no' },
      { w: 'Que la herramienta avise si no encuentra algo', t: 'ok' }, { w: 'Que se calle y siga', t: 'no' },
      { w: 'Ver la comprobación fallar una vez', t: 'ok' }, { w: 'Que salga en verde a la primera', t: 'no' },
      { w: 'Un mensaje que dice el porqué', t: 'ok' }, { w: '«Varios arreglos» como mensaje', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['Funciona', 'no', 'es', 'lo', 'mismo', 'que', 'está', 'bien.'], c: 0, art: 'Lo que se comprueba solo al ejecutar' },
  { s: ['El', 'alcance', 'dice', 'qué', 'archivos', 'tocó.'], c: 1, art: 'El primer aviso de que algo se fue de madre' },
  { s: ['El', 'borrado', 'silencioso', 'es', 'el', 'peor.'], c: 1, art: 'Lo que desaparece sin que nadie lo pida' },
  { s: ['La', 'prueba', 'que', 'nunca', 'falló', 'no', 'prueba', 'nada.'], c: 1, art: 'Lo que hay que romper a propósito' },
  { s: ['Una', 'dependencia', 'nueva', 'es', 'una', 'decisión.'], c: 1, art: 'Lo que la máquina trae de regalo' },
  { s: ['El', 'contexto', 'cambia', 'y', 'la', 'herramienta', 'falla.'], c: 1, art: 'Lo que la máquina no conoce de tu casa' },
  { s: ['Deshacer', 'es', 'la', 'última', 'red.'], c: 0, art: 'Lo que salva cuando todo lo demás falló' },
  { s: ['La', 'lista', 'vacía', 'siempre', 'cumple', 'todo.'], c: 1, art: 'El caso que pone en verde una prueba falsa' },
]);

B.cmpData = JSON.stringify([
  { s: 'Funciona no es lo mismo que ___ bien.', opts: ['está', 'suena', 'parece'], c: 0 },
  { s: 'La revisión se hace mirando el ___, no el archivo.', opts: ['cambio', 'resultado', 'mensaje'], c: 0 },
  { s: 'El fallo más caro es el borrado ___.', opts: ['silencioso', 'evidente', 'parcial'], c: 0 },
  { s: 'Una prueba que nunca se ha visto ___ no prueba nada.', opts: ['fallar', 'ejecutar', 'escribir'], c: 0 },
  { s: 'El caso que hay que probar es el que da ___.', opts: ['pereza', 'risa', 'orgullo'], c: 0 },
  { s: 'Una librería nueva es una decisión de ___.', opts: ['arquitectura', 'estilo', 'formato'], c: 0 },
  { s: 'La comprobación se pone dentro de la ___ que produce la cosa.', opts: ['herramienta', 'sonda', 'ficha'], c: 0 },
  { s: 'La última red es poder ___.', opts: ['deshacer', 'avisar', 'esperar'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Se revisa', 'Solo se ejecuta'], btnA: '✅ Se revisa', btnB: '▶️ Solo se ejecuta', colA: 'ok', colB: 'no',
    words: [
      { w: 'Qué líneas desaparecieron', t: 'ok' }, { w: 'Que la pantalla no dé error', t: 'no' },
      { w: 'Qué archivos se tocaron', t: 'ok' }, { w: 'Que cargue rápido', t: 'no' },
      { w: 'Si trae una librería nueva', t: 'ok' }, { w: 'Que se vea bonito', t: 'no' },
      { w: 'Si lo puedo explicar', t: 'ok' }, { w: 'Que salga en verde', t: 'no' },
      { w: 'Si se puede deshacer', t: 'ok' }, { w: 'Que funcione en mi teléfono', t: 'no' },
    ],
  },
  {
    label: ['Decide', 'Luce'], btnA: '😬 Caso que decide', btnB: '😊 Caso que luce', colA: 'ok', colB: 'no',
    words: [
      { w: 'Sin internet', t: 'ok' }, { w: 'Con buena señal', t: 'no' },
      { w: 'Lista vacía', t: 'ok' }, { w: 'Lista de ejemplo', t: 'no' },
      { w: 'Teléfono viejo', t: 'ok' }, { w: 'Navegador de escritorio', t: 'no' },
      { w: 'Nombre con acento', t: 'ok' }, { w: 'Nombre sin tildes', t: 'no' },
      { w: 'Dos personas a la vez', t: 'ok' }, { w: 'Una sola persona', t: 'no' },
    ],
  },
  {
    label: ['Ayuda', 'Falsa calma'], btnA: '🛡️ Ayuda', btnB: '⚠️ Falsa calma', colA: 'ok', colB: 'no',
    words: [
      { w: 'Un cambio por vez', t: 'ok' }, { w: 'Archivo entero reescrito', t: 'no' },
      { w: 'La herramienta avisa', t: 'ok' }, { w: 'La herramienta se calla', t: 'no' },
      { w: 'Verla fallar una vez', t: 'ok' }, { w: 'Verde a la primera', t: 'no' },
      { w: 'Mensaje con el porqué', t: 'ok' }, { w: '«Varios arreglos»', t: 'no' },
      { w: 'Comprobación dentro', t: 'ok' }, { w: 'Acordarse de comprobar', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se revisa un cambio antes de subirlo', steps: ['Mirar la lista de archivos tocados, uno por uno', 'Leer las líneas que desaparecen antes que las que llegan', 'Comprobar que se puede explicar cada parte con palabras propias', 'Buscar dependencias nuevas y maneras de hacer que no son las de la casa', 'Probar el caso incómodo, no el que propuso la máquina', 'Subir un cambio por vez, con su mensaje diciendo el porqué'] },
  { label: 'Cómo se comprueba que una comprobación sirve', steps: ['Ejecutarla y ver que sale en verde', 'Romper a propósito lo que debería detectar', 'Volver a ejecutarla y ver que ahora sale en rojo', 'Arreglar lo roto y ver que vuelve al verde', 'Solo entonces confiar en ella'] },
  { label: 'Qué se hace cuando algo subido sale mal', steps: ['Deshacer el cambio y volver a lo que funcionaba', 'Reproducir el fallo con el caso real que lo destapó', 'Escribir la comprobación que lo habría cazado', 'Verla fallar con el código malo, para saber que sirve', 'Arreglar de nuevo y subir, ahora con la comprobación puesta'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Poder decir qué hace cada parte con palabras propias', ans: 'Lo entiendo', opts: ['Lo entiendo', 'El alcance', 'La prueba', 'Deshacer'] },
  { desc: 'Qué archivos tocó de verdad, no los que dijo que iba a tocar', ans: 'El alcance', opts: ['El alcance', 'La prueba', 'El borrado', 'Deshacer'] },
  { desc: 'Las líneas que desaparecen sin que nadie lo pidiera', ans: 'El borrado silencioso', opts: ['El borrado silencioso', 'El alcance', 'La dependencia', 'La prueba'] },
  { desc: 'Una librería nueva que llega de regalo con el código', ans: 'La dependencia', opts: ['La dependencia', 'El borrado silencioso', 'El alcance', 'Lo entiendo'] },
  { desc: 'El caso incómodo: sin señal, lista vacía, teléfono viejo', ans: 'La prueba real', opts: ['La prueba real', 'El caso fácil', 'El alcance', 'Deshacer'] },
  { desc: 'Ponerla dentro de la herramienta que produce la cosa', ans: 'La comprobación', opts: ['La comprobación', 'La prueba real', 'El alcance', 'El borrado'] },
  { desc: 'Un cambio por vez, con su mensaje, para poder volver atrás', ans: 'Deshacer', opts: ['Deshacer', 'Lo entiendo', 'La comprobación', 'El alcance'] },
  { desc: 'Recorrerla preguntando si todos cumplen algo siempre sale que sí', ans: 'La lista vacía', opts: ['La lista vacía', 'La prueba real', 'El borrado silencioso', 'La dependencia'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Una pantalla que guarda un destello', func: 'Guardarlo con el teléfono en modo avión', opts: ['Guardarlo con el teléfono en modo avión', 'Guardarlo con buena señal', 'Abrir la pantalla y mirarla', 'Guardar tres seguidos'] },
  { trans: 'Una lista que se recorre y se pinta', func: 'Probarla con la lista vacía', opts: ['Probarla con la lista vacía', 'Probarla con tres elementos', 'Probarla con muchos elementos', 'Mirar que se pinte bien'] },
  { trans: 'Un formulario con el nombre de una niña', func: 'Escribir un nombre con tilde y con ñ', opts: ['Escribir un nombre con tilde y con ñ', 'Escribir un nombre corto', 'Dejarlo vacío y ya', 'Escribirlo en mayúsculas'] },
  { trans: 'Una función que sincroniza con la nube', func: 'Cortar la señal a la mitad de la subida', opts: ['Cortar la señal a la mitad de la subida', 'Subir con buena conexión', 'Subir dos veces seguidas', 'Mirar la tabla al terminar'] },
  { trans: 'Una comprobación nueva que salió en verde', func: 'Romper a propósito lo que debería detectar', opts: ['Romper a propósito lo que debería detectar', 'Ejecutarla otra vez', 'Ejecutarla en otro navegador', 'Añadirle más comprobaciones'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'La prueba salía en verde y no comprobaba absolutamente nada', characteristic: 'La lista llegaba vacía y nadie comprobó que hubiera algo que comprobar', opts: ['La lista llegaba vacía y nadie comprobó que hubiera algo que comprobar', 'La prueba estaba mal escrita', 'Se ejecutó en el navegador equivocado', 'Faltaban comprobaciones'] },
  { disease: 'La sonda decía partir de cero y arrastraba el estado anterior', characteristic: 'Borraba una clave con un nombre que no existe, y borrar lo que no hay no da error', opts: ['Borraba una clave con un nombre que no existe, y borrar lo que no hay no da error', 'El navegador no permitía borrar', 'Se ejecutó dos veces', 'Faltaba recargar la página'] },
  { disease: 'Un dato existía en la aplicación y desde fuera salía indefinido', characteristic: 'Se leía por la ventana, y una constante no se cuelga de ahí', opts: ['Se leía por la ventana, y una constante no se cuelga de ahí', 'El archivo no estaba cargado', 'El nombre estaba mal escrito', 'Faltaba esperar más tiempo'] },
  { disease: 'Una herramienta funcionó en cinco misiones y falló en la sexta', characteristic: 'Buscaba por el nombre de un parámetro que se había renombrado', opts: ['Buscaba por el nombre de un parámetro que se había renombrado', 'La sexta misión era más grande', 'Se ejecutó con prisa', 'El archivo estaba corrupto'] },
  { disease: 'La ficha salió con una tabla abierta en una hoja y cerrada en otra', characteristic: 'El corte cayó dentro de la tabla y la herramienta solo sabía retroceder sobre otro bloque', opts: ['El corte cayó dentro de la tabla y la herramienta solo sabía retroceder sobre otro bloque', 'La tabla era demasiado larga', 'Se midió mal la página', 'Faltaba cerrar la etiqueta a mano'] },
  { disease: 'Volvió un fallo que ya se había arreglado la semana pasada', characteristic: 'Se reescribió el archivo entero y el arreglo viejo no estaba en la versión nueva', opts: ['Se reescribió el archivo entero y el arreglo viejo no estaba en la versión nueva', 'El arreglo estaba mal hecho', 'Alguien lo borró a propósito', 'El navegador guardó una copia vieja'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Hace lo que pediste en el caso que probaste.', type: 'Funciona' },
  { s: 'Hace lo que pediste, no rompe nada más y se puede deshacer.', type: 'Está bien' },
  { s: 'Qué archivos tocó de verdad el cambio.', type: 'El alcance' },
  { s: 'Las líneas que desaparecieron sin que nadie lo pidiera.', type: 'El borrado silencioso' },
  { s: 'Una librería nueva que llegó con el código.', type: 'La dependencia' },
  { s: 'Sin señal, lista vacía, teléfono viejo, nombre con acento.', type: 'El caso que decide' },
  { s: 'Una comprobación que no se ha visto en rojo nunca.', type: 'La prueba que nunca falló' },
  { s: 'Ponerla dentro de la herramienta que produce la cosa.', type: 'La comprobación' },
  { s: 'Un cambio por vez, con su mensaje diciendo el porqué.', type: 'Deshacer' },
  { s: 'Recorrerla siempre devuelve que todos cumplen.', type: 'La lista vacía' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Se ejecutó sin dar error', gen: 'Estado del cambio', n: 'Solo el caso fácil', g: 'Funciona', t: 'No dice nada más' },
  { w: 'Lo puedo explicar línea por línea', gen: 'Estado del cambio', n: 'Se puede sostener', g: 'Está bien', t: 'Se puede arreglar de noche' },
  { w: 'Qué líneas desaparecieron', gen: 'Dónde se ve', n: 'Solo en el cambio', g: 'Se ve en el cambio', t: 'Aquí vive lo caro' },
  { w: 'Si la estructura general encaja', gen: 'Dónde se ve', n: 'Hay que leer entero', g: 'Se ve leyendo', t: 'Otra revisión, otro momento' },
  { w: 'La maestra sin internet', gen: 'Caso de prueba', n: 'Incómodo', g: 'Caso que decide', t: 'Es el que hay que probar' },
  { w: 'Con señal y datos completos', gen: 'Caso de prueba', n: 'Cómodo', g: 'Caso que luce', t: 'Solo dice que no está roto del todo' },
  { w: 'La herramienta avisa si no encuentra algo', gen: 'Efecto', n: 'Se nota hoy', g: 'Ayuda a revisar', t: 'Cuesta una línea' },
  { w: 'La comprobación sale en verde a la primera', gen: 'Efecto', n: 'Se nota tarde', g: 'Da falsa calma', t: 'Hay que hacerla fallar' },
  { w: 'Un cambio pequeño por vez', gen: 'Forma de subir', n: 'Reversible', g: 'Ayuda a revisar', t: 'Se puede deshacer solo eso' },
  { w: 'Un archivo entero reescrito', gen: 'Forma de subir', n: 'Difícil de revisar', g: 'Da falsa calma', t: 'Aquí se cuela el borrado' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Funciona no es lo mismo que ___ bien.', opts: ['esta', 'suena', 'parece'], ans: 'esta' },
  { s: 'La revisión se hace mirando el ___, no el archivo.', opts: ['cambio', 'resultado', 'mensaje'], ans: 'cambio' },
  { s: 'El fallo más caro es el borrado ___.', opts: ['silencioso', 'evidente', 'parcial'], ans: 'silencioso' },
  { s: 'Una prueba que nunca se ha visto ___ no prueba nada.', opts: ['fallar', 'ejecutar', 'escribir'], ans: 'fallar' },
  { s: 'El caso que hay que probar es el que da ___.', opts: ['pereza', 'risa', 'orgullo'], ans: 'pereza' },
  { s: 'Una librería nueva es una decisión de ___.', opts: ['arquitectura', 'estilo', 'formato'], ans: 'arquitectura' },
  { s: 'La comprobación se pone dentro de la ___ que produce la cosa.', opts: ['herramienta', 'sonda', 'ficha'], ans: 'herramienta' },
  { s: 'La última red es poder ___.', opts: ['deshacer', 'avisar', 'esperar'], ans: 'deshacer' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica por qué con el código la verificación se abandona antes que con el texto.', ans: 'Porque el código no suena bien: funciona. Se ejecuta delante de ti, hace lo que pediste y no queda nada que sospechar, así que parece que ya se verificó solo. Con un texto uno sabe que hay que comprobar los datos; con un cambio que corre, la ejecución hace de comprobante falso. Y hay un agravante: cuando algo falla uno lo lee entero para arreglarlo, pero cuando funciona uno lo sube. Por eso la señal de alarma de esta etapa es «funcionó a la primera», que no es una buena noticia sino el momento de más riesgo, porque nada te obligó a mirar. La distinción que ordena todo es que funciona significa que hace lo que pediste en el caso que probaste, y está bien significa además que no rompe nada más, que se puede explicar y que se puede deshacer mañana.' },
  { q: '¿Por qué se revisa el cambio y no el archivo? Di qué se busca en cada parte.', ans: 'Porque un archivo entero se lee y todo parece razonable, mientras que el cambio enseña exactamente qué se movió y qué desapareció. Se miran cuatro cosas. La lista de archivos tocados, para ver si hay alguno que no tenía por qué estar: ese es el primer aviso de que el alcance se fue de madre. Las líneas que desaparecen, que es donde vive el fallo más caro, porque nadie las pidió borrar. Las líneas que se añaden, para comprobar que se entiende cada una y que ninguna trae una dependencia nueva. Y lo que no cambió y debería: el comentario que ahora miente o la norma que quedó sin cumplir. De las cuatro, la segunda es la que casi nadie hace y la que más cuesta cuando se salta.' },
  { q: 'Cuenta el caso de la prueba que salía en verde y di qué se aprendió.', ans: 'Una sonda comprobaba que las ocho asignaciones tuvieran sus cinco partes, y las cinco comprobaciones salieron en verde a la primera. El código estaba bien escrito. Lo que pasaba es que la lista llegaba vacía, y recorrer una lista vacía preguntando si todos sus elementos cumplen algo devuelve que sí. Eran cinco comprobaciones perfectas sobre nada, dando permiso para seguir. Se aprendieron dos cosas. La primera, general: antes de creerle a una prueba hay que verla fallar una vez, porque una comprobación que nunca se ha visto en rojo no se sabe si funciona. La segunda, concreta y aburrida: cuando se comprueba una lista, lo primero es preguntar si hay algo que comprobar. El arreglo fue una línea.' },
  { q: '¿Qué es el borrado silencioso y por qué es el peor de los cinco fallos?', ans: 'Es cuando la máquina reescribe un archivo entero y se lleva por delante un arreglo anterior, sin decir nada. No lo borra a propósito: reescribe desde lo que sabe, y lo que sabe no incluye tu última semana de trabajo. Es el peor de los cinco porque los otros cuatro se notan al probar (el caso fácil falla con datos raros, el alcance se ve en la lista de archivos, la dependencia se ve al principio del archivo y lo que no encaja con la casa salta a la vista), mientras que este no se nota: lo que se borró funcionaba y no lo estabas mirando. Se descubre semanas después, en otro sitio y sin relación aparente, cuando vuelve un fallo que ya se había arreglado. La defensa es mirar qué líneas desaparecen, pedir cambios pequeños en vez de archivos completos, y subir un cambio por vez.' },
  { q: 'Explica por qué una herramienta que funcionó cinco veces puede fallar la sexta.', ans: 'Porque funcionar no es estar probada: es estar probada en lo de siempre. En este proyecto hay un script que reescribe un trozo del molde en cada misión nueva, y funcionó en cinco misiones seguidas. Falló en la sexta porque buscaba ese trozo por el nombre de un parámetro, y en la misión anterior ese parámetro se había renombrado justamente para que dijera algo mejor. El mismo código, el mismo encargo, otro contexto. Lo que salvó la situación fue que la herramienta avisaba cuando no encontraba lo que buscaba, en vez de callarse y seguir: ese aviso cuesta una línea y es la diferencia entre notarlo el mismo día o dentro de un mes. La lección general es que el código correcto lo es para el contenido que había cuando se escribió, así que las herramientas tienen que quejarse cuando el mundo cambia.' },
  { q: '¿Dónde conviene poner una comprobación, y por qué? Da el ejemplo de las treinta preguntas.', ans: 'Dentro de la herramienta que produce la cosa. Así no hay que acordarse de ejecutarla, no se puede saltar y falla en el momento exacto en que algo se rompe, no días después. El ejemplo de esta casa es un generador que crea una ficha desde el catálogo, y una de sus páginas tiene que llevar exactamente treinta preguntas. Trajo veintinueve. Nadie lo habría notado leyendo, porque veintinueve preguntas se ven igual que treinta y contarlas a mano es justo lo que nadie hace. Lo cazó una línea dentro del propio generador que cuenta y se niega a escribir el archivo si el número no cuadra. De los seis fallos reales que cuenta esta misión, ese es el único que no costó tiempo, y la diferencia fue solo dónde estaba puesta la comprobación.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['REVISAR', 'CAMBIO', 'PRUEBA', 'ALCANCE', 'SUBIR', 'ERROR']),
  haceSopa(10, ['BORRADO', 'LIBRERIA', 'CONTEXTO', 'CASO', 'LINEA', 'VERDE']),
  haceSopa(10, ['DESHACER', 'ARCHIVO', 'FALLO', 'ORDEN', 'LIMITE', 'PRISA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Que un código se ejecute sin error significa que está bien.', a: false },
  { q: '«Funcionó a la primera» es el momento de más riesgo, no de menos.', a: true },
  { q: 'La revisión se hace leyendo el archivo terminado.', a: false },
  { q: 'Las líneas que desaparecen son donde vive el fallo más caro.', a: true },
  { q: 'Recorrer una lista vacía preguntando si todos cumplen algo devuelve que sí.', a: true },
  { q: 'Una comprobación que siempre sale en verde es señal de que todo va bien.', a: false },
  { q: 'Añadir una librería en un proyecto sin compilación es solo una línea más.', a: false },
  { q: 'La máquina conoce las normas y convenciones de tu proyecto.', a: false },
  { q: 'El caso que da pereza probar suele ser el que decide.', a: true },
  { q: 'Una herramienta que funcionó cinco veces ya está probada.', a: false },
  { q: 'Conviene que una herramienta avise cuando no encuentra lo que busca.', a: true },
  { q: 'El mejor sitio para una comprobación es dentro de la herramienta que produce la cosa.', a: true },
  { q: 'El código que no se entiende se puede subir si funciona.', a: false },
  { q: 'Subir un cambio por vez facilita deshacer sin arrastrar lo demás.', a: true },
  { q: 'Pedir el archivo entero reescrito es más seguro que pedir un cambio pequeño.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Por qué con el código se abandona antes la verificación?', o: ['a) Porque se ejecuta y parece comprobado', 'b) Porque es más largo', 'c) Porque es más difícil', 'd) Porque lo revisa el navegador'], a: 0 },
  { q: '«Funcionó a la primera» significa…', o: ['a) Que está bien', 'b) Que nada te obligó a mirarlo', 'c) Que la máquina acertó', 'd) Que se puede subir'], a: 1 },
  { q: 'El peor de los cinco fallos es…', o: ['a) La dependencia nueva', 'b) El caso fácil', 'c) El borrado silencioso', 'd) El alcance'], a: 2 },
  { q: 'Una revisión mira sobre todo…', o: ['a) El archivo terminado', 'b) El mensaje del commit', 'c) La documentación', 'd) Lo que cambió'], a: 3 },
  { q: 'Una lista vacía, al comprobar si todos cumplen algo…', o: ['a) Da error', 'b) Devuelve que sí', 'c) Devuelve que no', 'd) Depende del navegador'], a: 1 },
  { q: 'Antes de confiar en una comprobación hay que…', o: ['a) Ejecutarla varias veces', 'b) Documentarla', 'c) Verla fallar a propósito una vez', 'd) Añadirle más casos'], a: 2 },
  { q: 'Una librería nueva en un sitio estático es…', o: ['a) Una decisión de arquitectura', 'b) Una línea más', 'c) Lo estándar', 'd) Indiferente'], a: 0 },
  { q: '¿Qué NO sabe la máquina de tu proyecto?', o: ['a) El lenguaje', 'b) Tus normas y lo que ya decidiste', 'c) Cómo se escribe una función', 'd) Qué es una lista'], a: 1 },
  { q: 'El caso que hay que probar es…', o: ['a) El que propone la máquina', 'b) El más rápido', 'c) El que da pereza', 'd) El del navegador de escritorio'], a: 2 },
  { q: 'Una herramienta que funcionó cinco veces y falla la sexta…', o: ['a) Está rota', 'b) Estaba probada solo en lo de siempre', 'c) Se ejecutó mal', 'd) Necesita más memoria'], a: 1 },
  { q: '¿Qué conviene que haga una herramienta que no encuentra lo que busca?', o: ['a) Seguir en silencio', 'b) Reintentar sola', 'c) Avisar', 'd) Borrar el archivo'], a: 2 },
  { q: 'El mejor sitio para una comprobación es…', o: ['a) Una sonda aparte', 'b) La documentación', 'c) El mensaje del commit', 'd) Dentro de la herramienta que produce la cosa'], a: 3 },
  { q: 'El código que no entiendes…', o: ['a) No se sube', 'b) Se sube con comentario', 'c) Se sube si funciona', 'd) Se estudia después de subirlo'], a: 0 },
  { q: 'La última defensa cuando todo lo demás falla es…', o: ['a) Avisar en el chat', 'b) Poder deshacer', 'c) Tener copias', 'd) Probar más'], a: 1 },
  { q: '¿Cuál es la prueba de que esta etapa está aprendida?', o: ['a) Saberse los cinco fallos', 'b) Tener la ficha impresa', 'c) Haber leído el módulo', 'd) Haber encontrado una línea borrada que nadie pidió borrar'], a: 3 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Funciona no es lo mismo que ___ bien.', a: 'esta' },
  { q: 'La revisión se hace mirando el ___, no el archivo.', a: 'cambio' },
  { q: 'El fallo más caro es el borrado ___.', a: 'silencioso' },
  { q: 'Una prueba que nunca se ha visto ___ no prueba nada.', a: 'fallar' },
  { q: 'El caso que hay que probar es el que da ___.', a: 'pereza' },
  { q: 'Una librería nueva es una decisión de ___.', a: 'arquitectura' },
  { q: 'La comprobación se pone dentro de la ___ que produce la cosa.', a: 'herramienta' },
  { q: 'La última red es poder ___.', a: 'deshacer' },
  { q: 'La señal de alarma es «funcionó a la ___».', a: 'primera' },
  { q: 'Se sube un cambio por ___.', a: 'vez' },
  { q: 'Recorrer una lista ___ siempre devuelve que todos cumplen.', a: 'vacia' },
  { q: 'Lo primero que se mira es la lista de ___ tocados.', a: 'archivos' },
  { q: 'Una herramienta que no encuentra lo que busca tiene que ___.', a: 'avisar' },
  { q: 'El código que no entiendes no se ___.', a: 'sube' },
  { q: 'La máquina no conoce las ___ de tu proyecto.', a: 'normas' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Funciona', def: 'Hace lo pedido en el caso que probaste' },
  { term: 'Está bien', def: 'Además no rompe nada y se puede deshacer' },
  { term: 'El alcance', def: 'Qué archivos tocó de verdad' },
  { term: 'El borrado silencioso', def: 'Lo que desaparece sin que nadie lo pida' },
  { term: 'La dependencia', def: 'La librería que llega de regalo' },
  { term: 'El caso que decide', def: 'Sin señal, lista vacía, teléfono viejo' },
  { term: 'El caso que luce', def: 'Con datos completos y buena conexión' },
  { term: 'La prueba que nunca falló', def: 'Comprobación de la que no se sabe si sirve' },
  { term: 'La lista vacía', def: 'Recorrerla siempre devuelve que sí' },
  { term: 'La comprobación dentro', def: 'Va en la herramienta que produce la cosa' },
  { term: 'Avisar en vez de callar', def: 'Lo que cuesta una línea y salva un mes' },
  { term: 'Un cambio por vez', def: 'Lo que permite volver atrás sin arrastrar' },
  { term: 'Revisar el cambio', def: 'Mirar qué se movió, no el archivo entero' },
  { term: '«Funcionó a la primera»', def: 'La señal de alarma de esta etapa' },
  { term: 'Lo que no sabe de tu casa', def: 'Tus normas, tus nombres y lo ya decidido' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Una sonda nueva comprueba que las ocho asignaciones traigan sus cinco partes. Se ejecuta y salen cinco comprobaciones en verde a la primera.' },
  { txt: 'Una sonda dice partir de cero borrando el estado guardado antes de medir. El código pide borrar una clave, y el nombre de la clave no coincide con el que usa la aplicación.' },
  { txt: 'Una sonda lee el catálogo desde fuera con w.CATALOGO y le sale indefinido, aunque el archivo está cargado y bien escrito.' },
  { txt: 'Un script reescribe un trozo del molde en cada misión nueva. Funcionó en cinco misiones seguidas y en la sexta no encuentra lo que busca, porque un parámetro se renombró.' },
  { txt: 'La herramienta que reparte una ficha en diez páginas retrocede hasta el inicio de un bloque para no cortar por la mitad, pero solo sabe retroceder sobre un tipo de bloque.' },
  { txt: 'Un generador crea una ficha desde el catálogo y una de sus páginas tiene que llevar exactamente treinta preguntas. Trae veintinueve.' },
  { txt: 'Se pide una función para dar formato a fechas en español. Llega hecha, funciona, y su primera línea trae una librería nueva. El proyecto es estático y sin compilación.' },
  { txt: 'Se pide arreglar una función y llega el archivo entero reescrito. La función arreglada funciona y todo lo demás se ve bien.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué mirarías de este cambio, y en qué orden?',
  '2. ¿Con qué caso real lo probarías, aparte del fácil?',
  '3. ¿Qué puede haber roto o borrado sin avisar?',
  '4. Escribe en 3-4 frases si lo subirías, y qué comprobación dejarías puesta.',
]);

B.critCaseGuides = JSON.stringify([
  'El orden es siempre el mismo: la lista de archivos tocados, las líneas que desaparecen, las que se añaden, y lo que no cambió y debería. La segunda es la que casi nadie hace.',
  'El caso real es el incómodo: sin señal, lista vacía, teléfono viejo, nombre con acento, dos personas a la vez. El que propone la máquina sirve solo para saber que no está roto del todo.',
  'Lo que más se rompe sin avisar son los arreglos anteriores del mismo archivo, las convenciones de la casa y las cosas que dependían de un nombre que cambió.',
  'La comprobación que se deja puesta vale más que el arreglo: se pone dentro de la herramienta que produce la cosa, y antes de confiar en ella se rompe algo a propósito para verla en rojo.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"La sonda salió en verde a la primera, ya está lista".', g1: 'Verde a la primera es sospechoso, no tranquilizador: puede estar comprobando sobre una lista vacía, y recorrer una lista vacía siempre devuelve que todos cumplen.', g2: 'Antes de confiar en ella hay que romper a propósito lo que debería detectar y verla en rojo. Y con listas, la comprobación que falta suele ser la más aburrida: ¿hay algo que comprobar?' },
  { txt: '"El código dice que borra el estado antes de medir, así que parte de cero".', g1: 'Dice que lo borra, y borrar algo que no existe no da error. Si el nombre de la clave no es el de la aplicación, no limpia nada y nadie se entera.', g2: 'Se comprueba el efecto y no la intención: si algo dice que limpia, hay que mirar después que de verdad esté limpio.' },
  { txt: '"Funcionó en las cinco misiones anteriores, no hace falta mirarlo".', g1: 'Funcionar no es estar probado: es estar probado en lo de siempre. Basta con que una palabra del contexto cambie para que deje de encontrar lo que busca.', g2: 'Lo barato es que la herramienta avise cuando no encuentra su objetivo, en vez de callarse. Un aviso cuesta una línea y ahorra un mes de no enterarse.' },
  { txt: '"Le pedí que arreglara la función y me reescribió el archivo entero, pero se ve bien".', g1: 'Ahí es donde vive el borrado silencioso: la máquina reescribe desde lo que sabe, y lo que sabe no incluye los arreglos de tu última semana.', g2: 'Hay que mirar qué líneas desaparecen, no solo cuáles llegan. Y la defensa práctica es pedir cambios pequeños en vez de archivos completos.' },
  { txt: '"Añadió una librería para las fechas, pero es la estándar y pesa poco".', g1: 'En un proyecto estático y sin compilación, cada librería es un archivo más que descargar, que cachear, que mantener y que puede caerse.', g2: 'Eso no es una línea de código: es una decisión de arquitectura, y la toma quien conoce las decisiones del proyecto, no quien no las conoce.' },
  { txt: '"La ficha salió bien, la miré y se ve correcta".', g1: 'Mirarla no basta cuando lo que falla no se ve: veintinueve preguntas se ven igual que treinta, y una tabla partida entre dos hojas puede pasar desapercibida.', g2: 'Lo que caza esos fallos es una comprobación dentro de la herramienta que produce la ficha, que cuenta y se niega a escribir si el número no cuadra.' },
]);

B.critDecisionBank = JSON.stringify([
  'Una sonda nueva con cinco comprobaciones en verde a la primera: ¿se da por buena o qué se hace antes?',
  'Un código que dice limpiar el estado antes de medir: ¿cómo se comprueba que de verdad limpia?',
  'Un dato que existe en la aplicación y desde fuera sale indefinido: ¿cuál es la primera sospecha?',
  'Una herramienta que funcionó cinco veces y falla la sexta: ¿se arregla la herramienta o se cambia otra cosa?',
  'Un corte que partió una tabla entre dos hojas: ¿se arregla el corte o se añade una comprobación?',
  'Un generador que trajo 29 preguntas en vez de 30: ¿dónde debería haber estado la comprobación?',
  'Una librería nueva que llegó con la función pedida: ¿se acepta, se quita o depende?',
  'Un archivo entero reescrito cuando se pidió arreglar una función: ¿qué se mira antes de subirlo?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Pedir un cambio pequeño en una función concreta.', b: 'Pedir el archivo entero reescrito y revisarlo después.', ga: 'Caso A: el cambio se lee en un minuto, se ve qué desapareció y se puede deshacer solo eso si sale mal.', gb: 'Caso B: todo parece razonable porque está escrito de nuevo, y ahí es exactamente donde se cuela el arreglo de la semana pasada que ya no está.' },
  { a: 'Poner la comprobación dentro del generador que produce la ficha.', b: 'Poner la comprobación en una sonda aparte que se ejecuta al final.', ga: 'Caso A: no hay que acordarse, no se puede saltar, y falla en el momento exacto en que algo se rompe.', gb: 'Caso B: sirve, pero solo si alguien se acuerda de ejecutarla, y el día con prisa es justo el día que no se ejecuta.' },
  { a: 'Probar el caso de la maestra sin internet.', b: 'Probar con buena señal y datos completos.', ga: 'Caso A: prueba lo que de verdad se usa en el campo, que es donde el proyecto tiene que funcionar.', gb: 'Caso B: dice que no está roto del todo. Es información, pero no es la que decide si se sube.' },
  { a: 'Una herramienta que avisa cuando no encuentra lo que busca.', b: 'Una herramienta que sigue en silencio si no lo encuentra.', ga: 'Caso A: el fallo se nota el mismo día, cuesta una línea escribirlo y evita enterarse un mes después.', gb: 'Caso B: parece que todo salió bien, y el trozo que tenía que cambiar se quedó como estaba sin que nadie lo sepa.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se toma «se ejecutó sin error» como prueba de que el cambio está bien.', guide: 'Ejecutarse solo dice que funciona en el caso que probaste, que casi siempre es el fácil. No dice nada de lo que rompió ni de lo que borró.' },
  { cause: 'Se revisa leyendo el archivo terminado.', guide: 'Todo parece razonable, porque está escrito de corrido. Lo que desapareció no aparece en ningún sitio: solo se ve mirando qué cambió.' },
  { cause: 'Se confía en una comprobación que nunca se ha visto en rojo.', guide: 'No se sabe si funciona. Puede estar comprobando sobre una lista vacía, o mirando algo que ya no existe, y salir en verde igual.' },
  { cause: 'Se prueba con el caso que propone la máquina.', guide: 'Es el caso que hace lucir el código: datos completos, buena señal, un solo usuario. El que decide es el incómodo, y es el que da pereza montar.' },
  { cause: 'Se acepta el archivo entero reescrito porque se ve bien.', guide: 'Ahí vive el borrado silencioso: la máquina reescribe desde lo que sabe, y no sabe lo que arreglaste la semana pasada.' },
  { cause: 'Se suben varios cambios juntos para ahorrar tiempo.', guide: 'El día que uno falla no se puede deshacer solo ese, así que o se pierde todo o se pasa la tarde separando lo bueno de lo malo.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Una sonda empezó a servir de verdad.', guide: 'Se rompió a propósito lo que debía detectar y se la vio en rojo. Hasta entonces salía en verde sobre una lista vacía y no probaba nada.' },
  { effect: 'Se descubrió el mismo día que una herramienta no había hecho su trabajo.', guide: 'Avisaba cuando no encontraba lo que buscaba, en vez de callarse. El aviso costó una línea y ahorró un mes de no enterarse.' },
  { effect: 'La ficha nunca volvió a salir con una tabla partida.', guide: 'No se arregló la herramienta de cortar: se añadió una comprobación que cuenta tablas abiertas y cerradas. A veces el arreglo barato es notar el fallo.' },
  { effect: 'No volvió un fallo que ya se había arreglado.', guide: 'Se miraron las líneas que desaparecían antes que las que llegaban, y ahí estaba el arreglo viejo que el archivo reescrito no traía.' },
  { effect: 'Un cambio que salió mal costó diez minutos y no una tarde.', guide: 'Estaba subido solo, con su mensaje diciendo el porqué, así que se deshizo sin arrastrar nada de lo demás.' },
  { effect: 'El proyecto siguió sin librerías nuevas durante todo el año.', guide: 'Cada vez que llegó una de regalo se leyó la primera línea del archivo, y la decisión la tomó quien conoce las decisiones del proyecto.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '📖', label: 'Lo entiendo', text: 'Poder decir <strong>qué hace cada parte</strong>, con palabras propias. <strong>Sirve para:</strong> poder arreglarlo cuando falle. <strong>Si se salta:</strong> a las diez de la noche estás tú delante y la máquina no. <strong>La prueba:</strong> contarlo sin volver a mirarlo.' },
  { y: '2', icon: '🔍', label: 'El alcance', text: 'Qué archivos <strong>tocó de verdad</strong>. <strong>Sirve para:</strong> ver si se fue de madre. <strong>Si se salta:</strong> se cambian cosas que nadie pidió cambiar. <strong>Cómo:</strong> la lista de archivos modificados, uno por uno, antes de leer nada.' },
  { y: '3', icon: '🗑️', label: 'El borrado', text: 'Las líneas <strong>que desaparecen</strong>. <strong>Sirve para:</strong> cazar el fallo más caro. <strong>Si se salta:</strong> vuelve un problema arreglado hace semanas. <strong>Cómo:</strong> leer lo borrado antes que lo añadido, siempre.' },
  { y: '4', icon: '📦', label: 'La dependencia', text: 'Lo que <strong>llega de regalo</strong>: librerías, formatos, maneras nuevas. <strong>Sirve para:</strong> que la arquitectura la decidas tú. <strong>Si se salta:</strong> el proyecto engorda solo. <strong>Cómo:</strong> mirar las primeras líneas del archivo.' },
  { y: '5', icon: '🧪', label: 'La prueba real', text: 'El caso <strong>incómodo</strong>, no el que propone la máquina. <strong>Sirve para:</strong> saber si aguanta lo que de verdad pasa. <strong>Si se salta:</strong> funciona en tu teléfono y no en el de la maestra. <strong>Cómo:</strong> sin señal, lista vacía, aparato viejo.' },
  { y: '6', icon: '🛠️', label: 'La comprobación', text: 'Ponerla <strong>dentro de la herramienta</strong> que produce la cosa. <strong>Sirve para:</strong> que no se pueda olvidar ni saltar. <strong>Si se salta:</strong> se comprueba el día que hay tiempo, o sea nunca. <strong>Cómo:</strong> que se niegue a escribir si algo no cuadra.' },
  { y: '7', icon: '↩️', label: 'Deshacer', text: '<strong>Un cambio por vez</strong>, con su mensaje. <strong>Sirve para:</strong> volver atrás sin arrastrar lo demás. <strong>Si se salta:</strong> un error se convierte en una tarde de arqueología. <strong>Cómo:</strong> subir poco y seguido, diciendo el porqué.' },
]);

B.parteData = JSON.stringify({
  entiendo: {
    nombre: 'Lo entiendo', icon: '📖',
    estructura: { title: 'Qué es', info: '• Poder decir <strong>qué hace cada parte</strong> con palabras propias<br>• No es reconocerlo: es poder contarlo sin volver a mirarlo<br>• Es la misma prueba de la etapa 3, aplicada al código' },
    funcion: { title: 'Cómo se hace', info: '• Se lee el cambio entero antes de tocar nada<br>• Se explica en voz alta, como si hubiera alguien delante<br>• Lo que no se pueda explicar <strong>se pregunta o se quita</strong>' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• El día que falle no se sabe por dónde empezar<br>• Se acumula código propio que nadie del proyecto entiende<br>• Y a las diez de la noche estás tú delante, no la máquina' },
    cuidados: { title: 'En este proyecto', info: '• La regla: <strong>el código que no entiendes no se sube</strong><br>• Vale también para lo copiado de otra misión<br>• Y para las herramientas de <code>_dev/</code>, que son las que más duran' },
  },
  alcance: {
    nombre: 'El alcance', icon: '🔍',
    estructura: { title: 'Qué es', info: '• Qué archivos <strong>tocó de verdad</strong> el cambio<br>• No los que dijo que iba a tocar: los que aparecen en la lista<br>• Es el primer aviso de que algo se fue de madre' },
    funcion: { title: 'Cómo se hace', info: '• Se mira <strong>la lista de archivos modificados</strong> antes de leer nada<br>• Se pregunta por cada uno: ¿este tenía que estar aquí?<br>• Después se leen <strong>las líneas borradas</strong>, y solo luego las añadidas' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• Se cambian cosas que nadie pidió cambiar<br>• Y se descubre semanas después, en un sitio sin relación<br>• Es el fallo que más veces ha pasado en esta casa' },
    cuidados: { title: 'En este proyecto', info: '• Una herramienta de reparto reescribió <strong>las 21 misiones</strong> de una pasada<br>• Su informe salía en verde: solo hablaba de lo que venía a arreglar<br>• La comprobación buena no era leer el informe: era <strong>mirar la lista</strong>' },
  },
  prueba: {
    nombre: 'La prueba', icon: '🧪',
    estructura: { title: 'Qué es', info: '• Ejecutar el <strong>caso que decide</strong>, no el que luce<br>• Sin señal, lista vacía, teléfono viejo, nombre con acento<br>• El que da pereza montar es justo el que hay que montar' },
    funcion: { title: 'Cómo se hace', info: '• Se escribe el caso incómodo <strong>antes</strong> de mirar si funciona<br>• Se rompe a propósito lo que la comprobación debe detectar<br>• Y se mira que se ponga <strong>en rojo</strong>: si no, no sirve' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• Funciona en tu teléfono y no en el de la maestra<br>• Las comprobaciones salen en verde sobre listas vacías<br>• Y el verde da permiso para seguir, que es lo peligroso' },
    cuidados: { title: 'En este proyecto', info: '• Las sondas se escriben <strong>mirando primero que fallen</strong><br>• Una salió en verde comprobando <strong>una lista vacía</strong><br>• El arreglo fue una línea: preguntar si hay algo que comprobar' },
  },
  deshacer: {
    nombre: 'Deshacer', icon: '↩️',
    estructura: { title: 'Qué es', info: '• Poder <strong>volver a lo que funcionaba</strong> sin arrastrar nada más<br>• Es la última defensa, la que actúa cuando todo lo demás falló<br>• Y la única que no depende de haber acertado' },
    funcion: { title: 'Cómo se hace', info: '• <strong>Un cambio por vez</strong>, no cinco cosas juntas<br>• Cada uno con su mensaje diciendo <strong>el porqué</strong>, no el qué<br>• Subir poco y seguido en vez de mucho de golpe' },
    enfermedades: { title: 'Qué pasa si se salta', info: '• Un error se vuelve una tarde separando lo bueno de lo malo<br>• O se deshace todo, incluido lo que sí servía<br>• Y el mensaje «varios arreglos» no ayuda a nadie dentro de un mes' },
    cuidados: { title: 'En este proyecto', info: '• Cada misión sube en <strong>un solo cambio</strong>, con su mensaje largo<br>• Los mensajes cuentan qué falló y qué se aprendió<br>• Son, de hecho, <strong>la bitácora de la asignación 5</strong>' },
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
  'const critDecisionGuide="La decisión correcta sigue las reglas de la casa: funciona no es lo mismo que está bien, así que lo primero es mirar el cambio y no el archivo, empezando por la lista de archivos tocados y siguiendo por las líneas que desaparecen; el código que no se puede explicar con palabras propias no se sube; se prueba el caso incómodo y no el que propone la máquina; una comprobación que nunca se ha visto en rojo no prueba nada, así que se rompe a propósito antes de confiar en ella; y la comprobación que se deja puesta va dentro de la herramienta que produce la cosa, para que no se pueda olvidar. Cuando hay prisa por subir, la respuesta es siempre la misma: un cambio por vez, con su mensaje, para poder deshacer.";');

/* ---------- lo que arrastra el molde ---------- */
const textos = [
  [/🔎 \*Ruta de la Máquina que Predice · Etapa 3\* 🔎/g, '⌨️ *Ruta de la Máquina que Predice · Etapa 4* ⌨️'],
  [/Qué se hace con una respuesta antes de usarla: leerla entera, medir el riesgo, comprobar por fuera y firmar lo que se entrega\. 🔎/g,
   'Qué se revisa en el código que llega hecho antes de subirlo: el alcance, lo que desaparece, el caso incómodo y poder deshacer. ⌨️'],
  [/_Incluye evaluación conceptual y la firma al pie\._ ✍️/g, '_Incluye evaluación conceptual y antes de subir._ ✍️'],
  [/La firma al pie/g, 'Antes de subir'],
  [/la firma al pie/g, 'antes de subir'],
  [/Ruta de la Máquina que Predice · Etapa 3: Verificar/g, 'Ruta de la Máquina que Predice · Etapa 4: La IA que programa'],
  [/Verificar: nadie firma lo que no leyó/g, 'La IA que programa: qué revisar antes de subir'],
  [/· Verificar ·/g, '· La IA que programa ·'],
  [/Verificar · Ruta de la Máquina/g, 'La IA que programa · Ruta de la Máquina'],
  [/Final: verificar/g, 'Final: la IA que programa'],
  [/Etapa 3 · Inteligencia Artificial/g, 'Etapa 4 · Inteligencia Artificial'],
  [/🔎 ¡/g, '⌨️ ¡'],
  [/completó la Etapa 3 de la Ruta de la Máquina que Predice/g, 'completó la Etapa 4 de la Ruta de la Máquina que Predice'],
  /* la sección I se llamaba «La entrega sobre la mesa» en la etapa 3 */
  [/La entrega sobre la mesa/g, 'El cambio sobre la mesa'],
  /* los mensajes de la constancia hablaban de entregar, no de subir */
  [/\['¡Sigue leyendo antes de entregar!','¡Muy buen trabajo!','¡Ya distingues el dato de la opinión!','¡Compruebas por fuera y no por dentro!','¡Firmas solo lo que puedes explicar!'\]/g,
   "['¡Sigue mirando antes de subir!','¡Muy buen trabajo!','¡Ya distingues funcionar de estar bien!','¡Revisas el cambio y no el archivo!','¡Solo subes lo que puedes explicar!']"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV seguían siendo las de la etapa 3 */
src = src.replace(/¿Qué se puede comprobar aquí, contra qué fuente exactamente y qué riesgo tiene si está mal\? Explica por qué comprobar por fuera es mejor que preguntarle otra vez a la máquina o que entregarlo tal cual\./g,
  '¿Qué mirarías de este cambio, con qué caso real lo probarías y qué puede haber borrado sin avisar? Explica por qué revisar el cambio es mejor que leer el archivo o que fiarse de que se ejecutó sin error.');
src = src.replace(/1\. ¿Cuál de los dos deja una entrega que se puede defender si alguien pregunta, y por qué\? 2\. ¿Por qué no son la misma decisión\?/g,
  '1. ¿Cuál de los dos deja un cambio que se puede deshacer y defender mañana? 2. ¿Por qué no son la misma decisión?');

/* el desenlace de la simulación seguía narrando la cita inventada de la etapa 3 */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(laHaceFallar){sfx(laHaceFallar?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(laHaceFallar){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🔴</span><span class="ms-text"><strong>La rompiste a propósito:</strong> le quitaste una parte a una asignación y la sonda siguió en verde. Ahí se vio.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✅</span><span class="ms-text"><strong>Y el arreglo fue una línea:</strong> preguntar primero si hay algo que comprobar. Ahora sí, cuando sale en verde significa algo.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🟢</span><span class="ms-text"><strong>La diste por buena:</strong> cinco comprobaciones en verde dan mucha tranquilidad.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🕳️</span><span class="ms-text"><strong>Y seguirá en verde para siempre:</strong> comprueba sobre una lista vacía. No avisará nunca, ni ahora ni el día que de verdad falte una parte.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (norma 1) */
src = src.replace(/let labParte='leer',labAspecto='estructura';/, "let labParte='entiendo',labAspecto='estructura';");

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
