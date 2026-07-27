/* Inyecta los bancos de la misión «Pedir bien: el encargo, el contexto y el ejemplo»
   (Ruta de la Máquina que Predice, etapa 2) sobre el molde copiado de la etapa 1 de su
   propia ruta, «La máquina que predice».
   Uso:  node _dev/inyecta-bancos-maquina.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-maquina-pedir-bien', 'js', 'pedir-bien.js');

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
B.SAVE_KEY = `'faro_ia_pedir_v1'`;

/* Las ocho claves son las que el motor de pedir-bien.js llama de verdad
   (primer_quiz, flash_master, clasif_pro, id_master, reto_hero, nivel3, nivel5,
   widgets_master). Las del molde de datos (sopa_champ, eval_ace, full_xp) nacen
   muertas porque nadie las invoca. */
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz del encargo superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del encargo explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de petición y encargo experto' },
  id_master: { icon: '🔍', label: 'Identificador de las siete piezas maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  nivel3: { icon: '🧳', label: '¡Escribe el contexto! Nivel 3' },
  nivel5: { icon: '📐', label: '¡Formato y criterio medibles! Nivel 5' },
  widgets_master: { icon: '🧩', label: 'Widgets de la hoja de encargo dominados' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Pide y espera suerte 🎲' },
  { t: 25, n: 'Distingue petición de encargo 🙋' },
  { t: 55, n: 'Escribe el contexto que solo él sabe 🧳' },
  { t: 90, n: 'Pega el ejemplo antes de explicar 🪞' },
  { t: 130, n: 'Pone formato y criterio medibles 📐' },
  { t: 165, n: 'Corrige el encargo, no la respuesta 🔁' },
  { t: 190, n: 'Dueño de su colección de encargos 🗂️' },
]);

B.fcData = JSON.stringify([
  { w: 'Encargo de siete piezas', a: '📋 La orden de trabajo completa: <strong>papel, tarea, contexto, formato, ejemplo, restricciones y criterio</strong>. La prueba de que está completo es sencilla: otra persona podría hacer el trabajo sin preguntarte nada.' },
  { w: 'Petición', a: '🙋 Decir el tema y nada más: «hazme algo bonito para la misión». La máquina <strong>rellena los huecos con lo más probable</strong>, que casi nunca es lo tuyo, y lo escribe con tan buena letra que parece bueno hasta que se lee con la norma al lado.' },
  { w: 'Papel', a: '🎭 Desde dónde le pides que escriba. Decide el vocabulario, el nivel y <strong>qué da por sabido</strong>. «Eres quien redacta las misiones de F.A.R.O y conoce las normas de la casa» sirve; «eres un experto en educación» devuelve folleto.' },
  { w: 'Tarea', a: '🔨 El <strong>verbo exacto</strong>, y uno solo por encargo: escribe, ordena, compara, traduce, parte en diez, cuenta. «Mejora», «trabaja» y «hazme algo con» no son tareas: son humo, y el resultado sale del mismo tamaño que la instrucción.' },
  { w: 'Contexto propio', a: '🧳 Lo que <strong>solo tú sabes</strong> del trabajo: el proyecto, quién lo va a leer y lo que ya se decidió. Ella tiene millones de textos ajenos y cero información sobre tu norma 6. Si no se lo escribes, no existe.' },
  { w: 'Formato de salida', a: '📐 En qué forma, de qué tamaño y <strong>para dónde va</strong>: «diez líneas en viñetas, para pegar en el README». Sin esa línea llegan tres páginas donde hacían falta diez renglones, y recortarlas la pagas tú.' },
  { w: 'Ejemplo', a: '🪞 Una <strong>muestra pegada entera</strong>, no una descripción. Enseña tono, largo, forma y nivel de detalle de un golpe. Un ejemplo bien elegido reemplaza una página de instrucciones; tres ejemplos distintos entre sí no enseñan nada.' },
  { w: 'Restricción', a: '🚧 Lo que <strong>no debe hacer</strong>, dicho antes y en concreto: «ni un guion largo», no «cuida el estilo». Cada restricción escrita es un error que ya no va a ocurrir; cada una que te callas la descubres en el resultado.' },
  { w: 'Criterio de aceptación', a: '✅ Cómo se sabrá que está bien, <strong>con quién lo mide y con qué</strong>. «Que quede de diez páginas» no se puede aprobar ni reprobar. «Diez páginas medidas con el medidor y contadas en el PDF» sí, y sin discutir.' },
  { w: 'Regla del dato que falta', a: '❓ La línea que más sirve de todas: <strong>«si te falta un dato, pregúntamelo, no lo inventes»</strong>. Prohibir la invención sin dar permiso de preguntar no sirve de nada: si no puede preguntar, rellena.' },
  { w: 'Lista de lo no verificado', a: '🧾 Lo que se le pide <strong>de vuelta</strong>: qué no pudo comprobar con lo que le diste. Convierte una invención en una pregunta contestable, y es lo primero que hay que leer del resultado.' },
  { w: 'Iterar el encargo', a: '🔁 Cuando sale mal se reescribe <strong>la instrucción</strong>, no el resultado. Se busca cuál de las siete casillas estaba vacía o floja, se llena y se vuelve a pedir completo. Lo demás es trabajar dos veces.' },
  { w: 'Parche a mano', a: '🩹 Arreglar la respuesta y <strong>dejar el encargo igual de malo</strong>. A las diez de la noche se siente más rápido, y la próxima misión llega con el mismo error, porque nada quedó escrito.' },
  { w: 'Tanda grande', a: '📦 Juntar el trabajo y pedirlo <strong>de una vez</strong>, con todo el material adjunto. Lo mismo picoteado en nueve vueltas costó <strong>L 470</strong>; en una sola tanda, <strong>L 180</strong>, porque cada ida y vuelta reenvía la conversación entera.' },
  { w: 'Encargo guardado', a: '🗂️ El encargo que funcionó, archivado para volver a usarlo. El de los 32 bancos se escribió una vez y sirvió en las seis misiones del año: <strong>L 3.750</strong> que no se volvieron a pagar. La colección de encargos es el activo.' },
  { w: 'Encargo de arranque', a: '🚀 El que abre una conversación nueva cuando la vieja empezó a olvidar: <strong>qué se está haciendo, qué se decidió, qué se descartó y qué falta</strong>. Media hoja. La memoria del proyecto está en lo que quedó escrito, no en la máquina.' },
]);

B.qzData = JSON.stringify([
  { q: 'Pediste «hazme la misión de fracciones para sexto» y llegaron diez páginas bien escritas que no cumplían ninguna norma de la casa. ¿Qué falló?', o: ['a) La máquina no sirve para material escolar', 'b) El encargo no llevaba el molde, las normas ni las cifras', 'c) El trabajo era demasiado grande para pedirlo de una vez', 'd) Faltó pedirle que se esforzara más'], c: 1 },
  { q: 'Dijo que la ficha tenía diez páginas y el PDF trajo diecinueve. ¿Qué pasó de verdad?', o: ['a) Mintió sobre su propio trabajo', 'b) La impresión usó otros márgenes', 'c) El criterio no decía cómo se miden las páginas', 'd) Diez páginas nunca era posible con ese contenido'], c: 2 },
  { q: 'Le pides corregir los guiones de una ficha y le describes el archivo en vez de pegarlo. ¿Qué va a devolver?', o: ['a) Una versión inventada, parecida y falsa', 'b) Un aviso de que no tiene el archivo', 'c) El archivo corregido, porque ya conoce el proyecto', 'd) Nada, porque no puede trabajar sin adjuntos'], c: 0 },
  { q: 'Llegaron tres páginas donde hacían falta diez líneas para el README. ¿Cuál casilla se quedó vacía?', o: ['a) El papel', 'b) El contexto', 'c) Las restricciones', 'd) El formato de salida, con tamaño y destino'], c: 3 },
  { q: 'Devolvió una tabla de costos con L 4.800 de servidor, cifra que nunca vio. ¿Qué había que escribir en el encargo?', o: ['a) Que revisara sus fuentes antes de contestar', 'b) Que no usara números si no estaba segura', 'c) El recibo adjunto y «si te falta un dato, pregúntamelo, no lo inventes»', 'd) Que la tabla la iba a revisar un contador'], c: 2 },
  { q: 'La misma misión costó nueve vueltas cortas (L 470) y después una sola tanda de L 180. ¿Por qué sale más caro picotear?', o: ['a) Porque cada ida y vuelta reenvía toda la conversación anterior', 'b) Porque los mensajes cortos se cobran más caros', 'c) Porque la máquina trabaja peor cuando se le apura', 'd) Porque cada archivo adjunto se paga aparte'], c: 0 },
  { q: 'A la cuarta hora seguida volvió a proponer un formato que ya se había descartado. ¿Qué se hace?', o: ['a) Repetirle que eso ya se descartó y seguir en la misma conversación', 'b) Partir el trabajo en pedazos más chicos', 'c) Aceptar que se va a repetir y revisar todo al final', 'd) Cerrar y abrir otra con un encargo de arranque de media hoja'], c: 3 },
  { q: 'Terminó una tanda que salió muy bien. ¿Qué se guarda?', o: ['a) La respuesta, que es la que sirve para la misión', 'b) El encargo, que se vuelve a usar y mejora en cada vuelta', 'c) Las dos cosas, en la carpeta de la misión', 'd) Nada: cada misión se pide desde cero'], c: 1 },
  { q: 'Quieres que copie el tono de tus casos. ¿Qué funciona mejor?', o: ['a) Pegar entero un caso ya aprobado y decir qué imitar y qué no', 'b) Describir el tono con tres adjetivos bien elegidos', 'c) Pegar tres ejemplos distintos para que saque el patrón', 'd) Pedirle que escriba como escribes tú'], c: 0 },
  { q: '¿Cuál es la prueba de que un encargo está bien escrito?', o: ['a) Que sea largo y detallado', 'b) Que la máquina conteste rápido', 'c) Que no haya que corregir nada del resultado', 'd) Que otra persona pudiera hacer el trabajo sin preguntarte nada'], c: 3 },
]);

B.classGroups = JSON.stringify([
  { label: ['Encargo', 'Petición'], headA: '📋 Encargo', headB: '🙋 Petición', colA: 'ok', colB: 'no',
    words: [{ w: 'Escribe los ocho casos con este molde, en lempiras', t: 'ok' }, { w: 'Hazme una misión completa', t: 'no' },
      { w: 'Ordena esta lista por fecha y devuélvela en tabla', t: 'ok' }, { w: 'Mejora esto', t: 'no' },
      { w: 'Traduce este párrafo sin tocar los nombres propios', t: 'ok' }, { w: 'Ponlo más profesional', t: 'no' },
      { w: 'Parte esta ficha en diez páginas de 215 a 252 mm', t: 'ok' }, { w: 'Hazme algo bonito para la portada', t: 'no' }] },
  { label: ['Se le encarga', 'No se le encarga'], headA: '✅ Se le encarga', headB: '🚫 No se le encarga', colA: 'ok', colB: 'no',
    words: [{ w: 'El primer borrador de una misión', t: 'ok' }, { w: 'Contar las páginas del PDF', t: 'no' },
      { w: 'Ordenar y comparar una lista larga', t: 'ok' }, { w: 'La cuenta exacta del mes', t: 'no' },
      { w: 'Cambiar la forma de algo que ya es correcto', t: 'ok' }, { w: 'Recordar lo que se decidió el martes', t: 'no' },
      { w: 'Encontrar una frase dentro de mucho texto', t: 'ok' }, { w: 'Decidir por otras personas', t: 'no' }] },
  { label: ['Corrige el encargo', 'Parcha la respuesta'], headA: '🔁 Corrige el encargo', headB: '🩹 Parcha la respuesta', colA: 'ok', colB: 'no',
    words: [{ w: 'Reescribir la instrucción con el formato que faltaba', t: 'ok' }, { w: 'Quitar los guiones a mano uno por uno', t: 'no' },
      { w: 'Adjuntar el archivo que no se adjuntó', t: 'ok' }, { w: 'Recortar el texto tú mismo cada vez', t: 'no' },
      { w: 'Añadir la restricción que se olvidó', t: 'ok' }, { w: 'Rehacer la tabla en el editor y no decir nada', t: 'no' },
      { w: 'Guardar el encargo corregido', t: 'ok' }, { w: 'Volver a pedir lo mismo con el mismo encargo', t: 'no' }] },
  { label: ['Tanda grande', 'Ida y vuelta'], headA: '📦 Tanda grande', headB: '🌀 Ida y vuelta', colA: 'ok', colB: 'no',
    words: [{ w: 'Los 32 bancos en un solo encargo con el molde', t: 'ok' }, { w: '«Ahora el siguiente»', t: 'no' },
      { w: 'Mandar el archivo entero y no el pedazo', t: 'ok' }, { w: '«Sigue»', t: 'no' },
      { w: 'Pedir de una vez las tres cosas que dependen de lo mismo', t: 'ok' }, { w: '«Ahora arréglame este otro»', t: 'no' },
      { w: 'Adjuntar el molde y las cifras en el mismo mensaje', t: 'ok' }, { w: 'Preguntar de a una cosa por mensaje', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['Lo', 'que', 'solo', 'tú', 'sabes', 'se', 'llama', 'contexto.'], c: 7, art: 'La casilla que decide casi todo el resultado' },
  { s: ['Pega', 'un', 'ejemplo', 'antes', 'de', 'explicar', 'el', 'estilo.'], c: 2, art: 'La muestra que reemplaza una página de instrucciones' },
  { s: ['El', 'criterio', 'dice', 'quién', 'mide', 'y', 'con', 'qué.'], c: 1, art: 'Cuándo el trabajo está terminado' },
  { s: ['Cuando', 'sale', 'mal', 'se', 'corrige', 'el', 'encargo.'], c: 6, art: 'Lo que se reescribe, en vez de la respuesta' },
  { s: ['Lo', 'que', 'no', 'debe', 'hacer', 'son', 'restricciones.'], c: 6, art: 'Los errores que ni siquiera ocurren' },
  { s: ['Sin', 'formato', 'llegan', 'tres', 'páginas', 'de', 'más.'], c: 1, art: 'La forma, el tamaño y el destino del resultado' },
  { s: ['La', 'tarea', 'pide', 'un', 'verbo,', 'no', 'un', 'deseo.'], c: 1, art: 'Qué va a hacer exactamente, y una sola cosa' },
  { s: ['El', 'trabajo', 'se', 'junta', 'en', 'una', 'tanda.'], c: 6, art: 'Lo que evita pagar nueve veces por lo mismo' },
]);

B.cmpData = JSON.stringify([
  { s: 'Lo que solo tú sabes del trabajo es el ___.', opts: ['papel', 'contexto', 'formato'], c: 1 },
  { s: 'Una muestra pegada entera, no descrita, es el ___.', opts: ['ejemplo', 'formato', 'papel'], c: 0 },
  { s: 'Lo que dice quién mide y con qué es el ___ de aceptación.', opts: ['papel', 'formato', 'criterio'], c: 2 },
  { s: 'Cuando el resultado sale mal se corrige el ___.', opts: ['encargo', 'resultado', 'estilo'], c: 0 },
  { s: 'Pedir el tema y nada más es una ___.', opts: ['petición', 'tarea', 'tanda'], c: 0 },
  { s: 'El verbo exacto de lo que hay que hacer es la ___.', opts: ['pauta', 'tarea', 'salida'], c: 1 },
  { s: 'Juntar el trabajo y pedirlo de una vez es una ___ grande.', opts: ['vuelta', 'tanda', 'lista'], c: 1 },
  { s: 'Lo que se guarda para la próxima misión es el ___.', opts: ['resultado', 'archivo', 'encargo'], c: 2 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Encargo', 'Petición'], btnA: '📋 Encargo', btnB: '🙋 Petición', colA: 'ok', colB: 'no',
    words: [{ w: 'Ordena esta lista por fecha', t: 'ok' }, { w: 'Hazme una misión completa', t: 'no' },
      { w: 'Diez líneas en viñetas', t: 'ok' }, { w: 'Mejora esto', t: 'no' },
      { w: 'Traduce sin tocar los nombres', t: 'ok' }, { w: 'Ponlo más profesional', t: 'no' },
      { w: 'Parte la ficha en diez páginas', t: 'ok' }, { w: 'Hazme algo bonito', t: 'no' },
      { w: 'Ocho casos con este molde', t: 'ok' }, { w: 'Que quede bien', t: 'no' }] },
  { label: ['Se encarga', 'No'], btnA: '✅ Se encarga', btnB: '🚫 No', colA: 'ok', colB: 'no',
    words: [{ w: 'El primer borrador', t: 'ok' }, { w: 'Contar las páginas del PDF', t: 'no' },
      { w: 'Ordenar una lista larga', t: 'ok' }, { w: 'La cuenta exacta del mes', t: 'no' },
      { w: 'Traducir un párrafo', t: 'ok' }, { w: 'Lo que se decidió el martes', t: 'no' },
      { w: 'Buscar en mucho texto', t: 'ok' }, { w: 'Decidir por la familia', t: 'no' },
      { w: 'Cambiar la forma del texto', t: 'ok' }, { w: 'Medir el tamaño del archivo', t: 'no' }] },
  { label: ['El encargo', 'La respuesta'], btnA: '🔁 El encargo', btnB: '🩹 La respuesta', colA: 'ok', colB: 'no',
    words: [{ w: 'Adjuntar el archivo que faltó', t: 'ok' }, { w: 'Quitar los guiones a mano', t: 'no' },
      { w: 'Añadir la restricción olvidada', t: 'ok' }, { w: 'Recortar el texto tú mismo', t: 'no' },
      { w: 'Poner el formato que faltaba', t: 'ok' }, { w: 'Rehacer la tabla en el editor', t: 'no' },
      { w: 'Guardar el encargo corregido', t: 'ok' }, { w: 'Arreglarlo de noche y callarse', t: 'no' },
      { w: 'Reescribir la casilla floja', t: 'ok' }, { w: 'Volver a pedir lo mismo igual', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se escribe un encargo que sale bien a la primera', steps: ['Escribir en una línea qué tiene que quedar hecho', 'Poner el papel y un solo verbo para la tarea', 'Volcar el contexto que solo tú sabes y adjuntar el material', 'Decir el formato de salida, con tamaño y destino', 'Pegar un ejemplo y decir qué imitar y qué no', 'Cerrar con las restricciones y el criterio que se puede medir'] },
  { label: 'Qué se hace cuando el resultado sale mal', steps: ['Leer el resultado entero y anotar qué falló exactamente', 'Buscar cuál de las siete casillas estaba vacía o floja', 'Reescribir esa casilla del encargo, no el resultado', 'Volver a pedirlo completo, con el material otra vez adjunto', 'Guardar el encargo corregido para la próxima misión'] },
  { label: 'Cómo se prepara una tanda grande', steps: ['Juntar todo lo que se va a pedir de este tema', 'Reunir los archivos y las cifras en lempiras que hacen falta', 'Escribir la hoja de encargo con sus siete casillas', 'Adjuntar el molde y el ejemplo dentro del mismo mensaje', 'Mandarlo de una vez y leer el resultado completo', 'Guardar el encargo y cerrar la conversación antes de cambiar de tema'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Desde dónde tiene que escribir, y qué da por sabido', ans: 'El papel', opts: ['El papel', 'La tarea', 'El contexto', 'El criterio de aceptación'] },
  { desc: 'El verbo exacto, uno solo por encargo', ans: 'La tarea', opts: ['La tarea', 'El papel', 'El formato de salida', 'El ejemplo'] },
  { desc: 'Lo que solo tú sabes del trabajo y ella no puede averiguar', ans: 'El contexto', opts: ['El contexto', 'El ejemplo', 'El papel', 'Las restricciones'] },
  { desc: 'En qué forma, de qué tamaño y para dónde va el resultado', ans: 'El formato de salida', opts: ['El formato de salida', 'El criterio de aceptación', 'La tarea', 'El contexto'] },
  { desc: 'La muestra que se pega entera en vez de describirla', ans: 'El ejemplo', opts: ['El ejemplo', 'El contexto', 'El formato de salida', 'El papel'] },
  { desc: 'Lo que no debe hacer, dicho antes y en concreto', ans: 'Las restricciones', opts: ['Las restricciones', 'El criterio de aceptación', 'La tarea', 'El papel'] },
  { desc: 'Cómo se sabrá que está bien, con quién lo mide y con qué', ans: 'El criterio de aceptación', opts: ['El criterio de aceptación', 'Las restricciones', 'El formato de salida', 'El contexto'] },
  { desc: 'Las siete casillas juntas, que se llenan de arriba abajo sin saltarse ninguna', ans: 'La hoja de encargo', opts: ['La hoja de encargo', 'El encargo de arranque', 'La lista de lo no verificado', 'La tanda grande'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Quieres que los casos nuevos salgan con el tono de los que ya aprobaste', func: 'Pegar entero un caso aprobado y decir qué imitar y qué no', opts: ['Pegar entero un caso aprobado y decir qué imitar y qué no', 'Describir el tono con tres adjetivos bien elegidos', 'Pegar tres ejemplos distintos y dejar que saque el patrón', 'Pedirle que escriba como escribes tú'] },
  { trans: 'Necesitas diez líneas para pegar en el README, no una explicación', func: 'Decir el formato con tamaño y destino: diez líneas en viñetas, para el README', opts: ['Decir el formato con tamaño y destino: diez líneas en viñetas, para el README', 'Pedirle que sea breve y vaya al punto', 'Recortar después lo que sobre', 'Pedir un resumen de lo que devuelva'] },
  { trans: 'Le pides el resumen de costos del mes de M.E.T.A.S', func: 'Adjuntar los recibos y escribir «si te falta un dato, pregúntamelo, no lo inventes»', opts: ['Adjuntar los recibos y escribir «si te falta un dato, pregúntamelo, no lo inventes»', 'Pedirle que use solo cifras de las que esté segura', 'Revisar la tabla al final y corregir lo que esté mal', 'Pedirle que diga de dónde saca cada número'] },
  { trans: 'A la cuarta hora repite un formato que ya se había descartado', func: 'Cerrar y abrir otra conversación con un encargo de arranque', opts: ['Cerrar y abrir otra conversación con un encargo de arranque', 'Recordarle otra vez qué se descartó y seguir', 'Seguir trabajando y revisar todo al final', 'Pedirle que resuma la conversación hasta aquí'] },
  { trans: 'La tanda salió perfecta a la primera y ya está pegada en la misión', func: 'Guardar el encargo en _dev, con el tema y las cifras cambiables', opts: ['Guardar el encargo en _dev, con el tema y las cifras cambiables', 'Guardar la respuesta, que es la que sirvió para la misión', 'Guardar la conversación entera por si acaso', 'No guardar nada: la próxima misión es de otro tema'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'La ficha traía diecinueve páginas y ya se habían impreso 30 juegos', characteristic: 'El criterio no decía cómo se miden las páginas', opts: ['El criterio no decía cómo se miden las páginas', 'La máquina mintió sobre su propio trabajo', 'La impresión usó márgenes distintos', 'El contenido no cabía en diez páginas'] },
  { disease: 'Devolvió una ficha corregida que no era tu archivo', characteristic: 'Se describió el archivo en vez de adjuntarlo', opts: ['Se describió el archivo en vez de adjuntarlo', 'La máquina confundió dos misiones', 'Faltó pedirle que fuera exacta', 'El archivo era demasiado largo'] },
  { disease: 'Llegaron tres páginas donde hacían falta diez líneas', characteristic: 'No se dijo el formato de salida, con tamaño y destino', opts: ['No se dijo el formato de salida, con tamaño y destino', 'La respuesta se fue por las ramas', 'Faltó pedir un resumen al final', 'El tema daba para mucho'] },
  { disease: 'La tabla de costos traía L 4.800 de servidor, cifra que nunca vio', characteristic: 'Faltaba el recibo adjunto y el permiso de preguntar', opts: ['Faltaba el recibo adjunto y el permiso de preguntar', 'La máquina buscó precios en internet', 'Los datos del proyecto estaban mal', 'Faltó revisar la tabla antes de usarla'] },
  { disease: 'La misma misión costó nueve mensajes y L 470', characteristic: 'El trabajo se picoteó en vez de juntarlo en una tanda', opts: ['El trabajo se picoteó en vez de juntarlo en una tanda', 'Los mensajes cortos se cobran más caros', 'El tema era más difícil que el de la semana anterior', 'La máquina estaba lenta ese día'] },
  { disease: 'Volvió a proponer un formato descartado dos horas antes', characteristic: 'La mesa se llenó y nadie abrió una conversación nueva', opts: ['La mesa se llenó y nadie abrió una conversación nueva', 'La máquina no presta atención a lo que se le dice', 'Faltó repetirle la decisión una vez más', 'El formato descartado era en realidad el mejor'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'Desde dónde tiene que escribir.', type: 'El papel' },
  { s: 'El verbo exacto, uno solo por encargo.', type: 'La tarea' },
  { s: 'Lo que solo tú sabes del trabajo.', type: 'El contexto' },
  { s: 'En qué forma, de qué tamaño y para dónde va.', type: 'El formato de salida' },
  { s: 'La muestra que se pega entera.', type: 'El ejemplo' },
  { s: 'Lo que no debe hacer, dicho antes.', type: 'Las restricciones' },
  { s: 'Cómo se sabrá que está bien y quién lo mide.', type: 'El criterio de aceptación' },
  { s: 'Pedir el tema y nada más.', type: 'Petición' },
  { s: 'Juntar el trabajo y pedirlo de una vez.', type: 'Tanda grande' },
  { s: 'Arreglar la respuesta y dejar el encargo igual.', type: 'Parche a mano' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Ordena esta lista por fecha y devuélvela en tabla', gen: 'Instrucción', n: 'Verbo claro', g: 'Encargo', t: 'Otro podría hacerlo sin preguntar' },
  { w: 'Hazme algo bonito para la portada', gen: 'Instrucción', n: 'Deseo', g: 'Petición', t: 'Hay que adivinar lo que querías' },
  { w: 'Parte la ficha en diez páginas de 215 a 252 mm', gen: 'Instrucción', n: 'Medible', g: 'Encargo', t: 'Se puede aprobar o reprobar' },
  { w: 'Ponlo más profesional', gen: 'Instrucción', n: 'Adjetivo', g: 'Petición', t: 'No dice qué cambiar ni cómo se mide' },
  { w: 'Escribir el primer borrador de una misión', gen: 'Trabajo', n: 'Se corrige barato', g: 'Se le encarga', t: 'Tú lo lees y lo arreglas' },
  { w: 'Contar las páginas del PDF', gen: 'Trabajo', n: 'Medición', g: 'No se le encarga', t: 'Medir es contar, no predecir' },
  { w: 'La cuenta exacta de los costos del mes', gen: 'Trabajo', n: 'Número', g: 'No se le encarga', t: 'Sale de los recibos, no del texto' },
  { w: 'Adjuntar el archivo que no se adjuntó', gen: 'Arreglo', n: 'En la instrucción', g: 'Corrige el encargo', t: 'La próxima vez ya sale bien' },
  { w: 'Quitar los guiones a mano uno por uno', gen: 'Arreglo', n: 'En la respuesta', g: 'Parcha la respuesta', t: 'El encargo queda igual de malo' },
  { w: 'Guardar el encargo que funcionó', gen: 'Arreglo', n: 'Se acumula', g: 'Corrige el encargo', t: 'Sirve en las seis misiones del año' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'Lo que solo tú sabes del trabajo es el ___.', opts: ['contexto', 'papel', 'formato'], ans: 'contexto' },
  { s: 'La muestra que se pega entera es el ___.', opts: ['formato', 'ejemplo', 'criterio'], ans: 'ejemplo' },
  { s: 'Lo que no debe hacer, dicho antes, es una ___.', opts: ['tarea', 'salida', 'restricción'], ans: 'restricción' },
  { s: 'Cómo se sabrá que está bien es el ___.', opts: ['criterio', 'papel', 'molde'], ans: 'criterio' },
  { s: 'Cuando sale mal se corrige el ___.', opts: ['encargo', 'resultado', 'formato'], ans: 'encargo' },
  { s: 'Pedir el tema y nada más es una ___.', opts: ['tanda', 'petición', 'pauta'], ans: 'petición' },
  { s: 'Juntar el trabajo y pedirlo de una vez es una ___.', opts: ['vuelta', 'tanda', 'lista'], ans: 'tanda' },
  { s: 'Si le falta un dato para terminar, tiene que ___.', opts: ['inventarlo', 'preguntarlo', 'saltarlo'], ans: 'preguntarlo' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica la diferencia entre una petición y un encargo, y di con qué prueba se sabe cuál de las dos escribiste.', ans: 'Una petición dice el tema y nada más: «hazme algo bonito para la misión». Un encargo dice qué, para quién, con qué forma y con qué límite, así que se parece más a una orden de trabajo que a una pregunta. La diferencia no es de largo ni de educación: es que el encargo se puede aprobar o reprobar, porque trae escrito cuándo está terminado. Y la prueba es una sola: otra persona podría hacer ese trabajo sin preguntarte nada. Si para hacerlo hay que adivinar algo que solo tú sabes, todavía es una petición, aunque tenga tres párrafos.' },
  { q: '¿Por qué el contexto decide casi todo el resultado, y qué va siempre en el contexto de un encargo de M.E.T.A.S?', ans: 'Porque la máquina no adivina lo que está en tu cabeza: contesta con lo que le cabe en la mesa, y lo que no le pusiste ahí lo rellena con lo más probable. Tiene millones de textos ajenos y cero información sobre tu proyecto, tu norma 6, tu maestra de Comayagua y lo que ya se decidió el martes. Si no se lo escribes, no existe. En un encargo de M.E.T.A.S va siempre el molde de la misión anterior adjunto, las normas 1-bis, 3, 4 y 6, la materia, la ruta y la etapa, quién lo va a leer (maestras de primaria en Honduras, madres con datos escasos, directores) y lo que ya está decidido, para que no lo vuelva a proponer. Y el archivo se adjunta: describir un archivo no es darlo.' },
  { q: 'Se pidió una ficha de diez páginas, contestó que estaba lista y el PDF trajo diecinueve. Explica por qué es un fallo del encargo y escribe el criterio como debía ir.', ans: 'No fue una mentira: fue un criterio que ella no podía comprobar sola. Medir es contar, y lo que hace la máquina es predecir texto, así que cuando le pides diez páginas sin decir cómo se miden, contesta que sí de buena fe. El fallo costó dinero de verdad: 30 juegos impresos a L 2 la página, L 1.140 en vez de L 600, o sea L 540 de sobrecosto. El criterio correcto nombra el instrumento y a quien lo usa: cada página entre 215 y 252 mm, letra de impresión de 10 pt, medido con el medidor de páginas y confirmado contando las hojas del PDF antes de mandar a imprimir. De ahí salió la norma 6 de la casa: el PDF es el único juez.' },
  { q: '¿Por qué un ejemplo pegado vale más que tres párrafos explicando el estilo?', ans: 'Porque el ejemplo enseña tono, largo, forma y nivel de detalle todo a la vez, y sin discutir qué significa cada palabra. Los adjetivos no se pueden comprobar: «que quede claro», «profesional», «cercano» se interpretan, y casi nunca como tú lo pensabas. Se pega la muestra completa, no un pedazo, y se dice qué de ella hay que imitar y qué no, porque si no imita también el tema. Un contraejemplo («así no») sirve igual de bien. Y hay una trampa que se repite: pegar tres ejemplos distintos entre sí y esperar que adivine el patrón; con tres formas distintas la más probable es la del promedio, que no es ninguna de las tres. La regla de la casa es corta: antes de explicar el estilo, pegar una muestra.' },
  { q: 'Devolvió una tabla de costos con L 4.800 de servidor, cifra que nunca vio. Escribe las dos restricciones que salvan el caso y explica por qué hacen falta las dos.', ans: 'La primera es «si te falta un dato, pregúntamelo, no lo inventes». La segunda es «al final, devuélveme la lista de lo que no pudiste verificar con lo que te di». Hacen falta las dos porque prohibir la invención sin dar permiso de preguntar no sirve de nada: si le falta un dato para terminar y no tiene salida, rellena con lo más probable, y lo hace con la misma seguridad con la que acierta. La lista de lo no verificado es el mejor invento de esta etapa, porque convierte una invención en una pregunta contestable: en vez de una celda falsa que se ve igual que las verdaderas, queda una línea que dice «esto no lo pude comprobar». Con los recibos adjuntos, el servidor de ese mes eran L 1.150, no L 4.800, y esa tabla iba a una reunión con un director y con tu nombre encima.' },
  { q: 'Explica por qué cuando el resultado sale mal se corrige el encargo y no la respuesta, y qué se guarda al final del día.', ans: 'Porque el parche a mano arregla una vez y no deja rastro: el encargo queda igual de malo, así que la próxima misión llega con el mismo error y la tarde se repite. A las diez de la noche arreglar los guiones a mano se ve más rápido que volver a explicar todo, y es cierto para esa noche y falso para el mes. Corregir el encargo es buscar cuál de las siete casillas estaba vacía o floja, llenarla y volver a pedirlo completo con el material otra vez adjunto. Y lo que se guarda es el encargo, no la respuesta: la respuesta sirve para una misión y caduca; el encargo se vuelve a usar, mejora en cada vuelta y es lo único que se acumula. El de los 32 bancos costó dos horas escribirlo (L 500) y ahorró L 3.750 en las seis misiones del año. La colección de encargos es el activo, no la colección de respuestas.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['ENCARGO', 'PAPEL', 'TAREA', 'CONTEXTO', 'FORMATO', 'EJEMPLO']),
  haceSopa(10, ['CRITERIO', 'LIMITE', 'MUESTRA', 'SALIDA', 'MOLDE', 'ADJUNTO']),
  haceSopa(10, ['TANDA', 'ITERAR', 'CORREGIR', 'GUARDAR', 'RESUMEN', 'PREGUNTA']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Un encargo dice qué, para quién, con qué forma y con qué límite.', a: true },
  { q: 'La máquina puede saber lo que ya se decidió en el proyecto aunque no se lo escribas.', a: false },
  { q: 'Describir un archivo en el mensaje equivale a adjuntarlo.', a: false },
  { q: 'Un ejemplo pegado entero enseña tono, largo y forma a la vez.', a: true },
  { q: 'Cuando la ficha salió con diecinueve páginas, la máquina mintió sobre su trabajo.', a: false },
  { q: 'El criterio de aceptación tiene que nombrar quién mide y con qué.', a: true },
  { q: 'Prohibir que invente sirve igual aunque no se le dé permiso de preguntar.', a: false },
  { q: 'Pedir la lista de lo que no pudo verificar convierte una invención en una pregunta.', a: true },
  { q: 'Cuando el resultado sale mal, lo correcto es arreglarlo a mano y seguir.', a: false },
  { q: 'Cada ida y vuelta reenvía la conversación anterior, y por eso se paga otra vez.', a: true },
  { q: 'Contar las páginas de un PDF es un trabajo que se le puede encargar.', a: false },
  { q: 'La tarea lleva un verbo concreto, y uno solo por encargo.', a: true },
  { q: 'Si repite algo ya descartado, conviene abrir otra conversación con un encargo de arranque.', a: true },
  { q: 'Lo que se guarda al final del día es la respuesta, no el encargo.', a: false },
  { q: 'Un encargo está completo si otra persona podría hacer el trabajo sin preguntarte nada.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: 'La causa de casi todo lo que sale mal en un encargo es…', o: ['a) Que la máquina no entiende español de Honduras', 'b) Que el tema era muy difícil', 'c) Que faltaba contexto: lo que solo tú sabes no estaba escrito', 'd) Que hacía falta pedirlo con más educación'], a: 2 },
  { q: 'La prueba de que es un encargo y no una petición es…', o: ['a) Que otra persona podría hacerlo sin preguntarte nada', 'b) Que ocupa más de diez líneas', 'c) Que lleva un ejemplo pegado', 'd) Que la máquina contestó rápido'], a: 0 },
  { q: '«Mejora esto» falla porque…', o: ['a) Es demasiado corto para una máquina', 'b) No trae papel', 'c) No trae ejemplo', 'd) No trae verbo concreto, ni forma, ni criterio para aprobarlo'], a: 3 },
  { q: 'El formato de salida se escribe con…', o: ['a) La forma, nada más', 'b) La forma, el tamaño y el destino', 'c) Un adjetivo que describa el estilo', 'd) El nombre del archivo donde va'], a: 1 },
  { q: 'Para que copie el tono de tus casos, lo que funciona es…', o: ['a) Describir el estilo con tres adjetivos', 'b) Pedirle que escriba como escribes tú', 'c) Pegar entero un caso aprobado y decir qué imitar y qué no', 'd) Pegar tres ejemplos distintos y dejar que saque el patrón'], a: 2 },
  { q: 'La ficha dijo diez páginas y el PDF trajo diecinueve. La lección es…', o: ['a) Que el criterio tiene que nombrar el instrumento con el que se mide', 'b) Que a la máquina no se le puede pedir fichas', 'c) Que hay que revisar todo dos veces por si acaso', 'd) Que diez páginas es un objetivo poco realista'], a: 0 },
  { q: 'La restricción que más sirve de todas es…', o: ['a) «Ni un guion largo»', 'b) «Cifras en lempiras»', 'c) «Nada de datos de menores»', 'd) «Si te falta un dato, pregúntamelo, no lo inventes»'], a: 3 },
  { q: 'La lista de lo no verificado sirve para…', o: ['a) Saber cuánto tiempo tardó', 'b) Convertir lo que iba a inventar en una pregunta contestable', 'c) Repartir la culpa cuando algo sale mal', 'd) Acortar el resultado'], a: 1 },
  { q: 'Cuando el resultado no sirve, lo primero es…', o: ['a) Buscar cuál de las siete casillas estaba vacía o floja', 'b) Arreglar el resultado a mano y seguir', 'c) Volver a pedir lo mismo por si sale mejor', 'd) Cambiar de máquina'], a: 0 },
  { q: 'Nueve vueltas cortas costaron L 470 y la misma tanda L 180 porque…', o: ['a) Los mensajes cortos tienen un cargo fijo', 'b) La máquina cobra por hora de conversación', 'c) Cada ida y vuelta reenvía todo lo anterior y se paga otra vez', 'd) La tanda grande tenía menos contenido'], a: 2 },
  { q: 'De estas cuatro cosas, la única que NO se le encarga es…', o: ['a) Escribir un primer borrador', 'b) Ordenar una lista larga', 'c) Encontrar una frase dentro de mucho texto', 'd) Contar las páginas del PDF'], a: 3 },
  { q: 'El encargo de arranque se escribe cuando…', o: ['a) Empieza una misión nueva de la ruta', 'b) La conversación se llenó y empieza a repetir lo descartado', 'c) Se cambia de tema dentro de la misma tanda', 'd) La respuesta salió demasiado larga'], a: 1 },
  { q: 'Al terminar una tanda que salió bien, se guarda…', o: ['a) El encargo, porque se vuelve a usar y mejora en cada vuelta', 'b) La respuesta, porque es la que sirve para la misión', 'c) La conversación completa, por si acaso', 'd) Nada, porque cada misión es distinta'], a: 0 },
  { q: 'La hoja de encargo se llena…', o: ['a) Solo en las casillas que apliquen al trabajo', 'b) Empezando por el criterio y subiendo', 'c) De arriba abajo, y la que no aplica se escribe con su razón', 'd) Después de ver el primer resultado'], a: 2 },
  { q: 'Lo que se acumula con los años de trabajar así es…', o: ['a) Una carpeta de respuestas buenas', 'b) La costumbre de escribir más largo', 'c) Una máquina que ya conoce el proyecto', 'd) Una colección de encargos que se reutilizan'], a: 3 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Pedir el tema y nada más es una ___.', a: 'petición' },
  { q: 'Lo que solo tú sabes del trabajo es el ___.', a: 'contexto' },
  { q: 'Desde dónde le pides que escriba es el ___.', a: 'papel' },
  { q: 'El verbo concreto de lo que tiene que hacer es la ___.', a: 'tarea' },
  { q: 'La forma, el tamaño y el destino del resultado son el ___ de salida.', a: 'formato' },
  { q: 'La muestra que se pega entera es el ___.', a: 'ejemplo' },
  { q: 'Lo que no debe hacer, dicho antes y en concreto, es una ___.', a: 'restricción' },
  { q: 'Cómo se sabrá que está bien es el ___ de aceptación.', a: 'criterio' },
  { q: 'Si le falta un dato para terminar, tiene que ___ en vez de inventar.', a: 'preguntar' },
  { q: 'De vuelta se pide la lista de lo no ___.', a: 'verificado' },
  { q: 'Cuando el resultado sale mal se corrige el ___.', a: 'encargo' },
  { q: 'Arreglar la respuesta y dejar la instrucción igual es un ___.', a: 'parche' },
  { q: 'Juntar el trabajo y pedirlo de una vez es una ___ grande.', a: 'tanda' },
  { q: 'De las diez páginas de la ficha, el único juez es el ___.', a: 'PDF' },
  { q: 'La plantilla de siete casillas es la hoja de ___.', a: 'encargo' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Encargo de siete piezas', def: 'Papel, tarea, contexto, formato, ejemplo, restricciones y criterio' },
  { term: 'Petición', def: 'Decir el tema y esperar que adivine el resto' },
  { term: 'Papel', def: 'Desde dónde le pides que escriba' },
  { term: 'Tarea', def: 'El verbo concreto, uno solo por encargo' },
  { term: 'Contexto propio', def: 'Lo que solo tú sabes del trabajo' },
  { term: 'Formato de salida', def: 'Forma, tamaño y destino del resultado' },
  { term: 'Ejemplo', def: 'Una muestra pegada entera, no descrita' },
  { term: 'Restricción', def: 'Lo que no debe hacer, dicho antes' },
  { term: 'Criterio de aceptación', def: 'Cómo se sabrá que está bien, y quién lo mide' },
  { term: 'Regla del dato que falta', def: 'Que pregunte en vez de inventar' },
  { term: 'Lista de lo no verificado', def: 'Lo que no pudo comprobar con lo que le diste' },
  { term: 'Iterar el encargo', def: 'Reescribir la instrucción, no el resultado' },
  { term: 'Parche a mano', def: 'Arreglar la respuesta y dejar el encargo igual' },
  { term: 'Tanda grande', def: 'Juntar el trabajo y pedirlo de una vez' },
  { term: 'Encargo guardado', def: 'El que funcionó y se archiva para reutilizarlo' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Se pidió «hazme la misión de fracciones para sexto» y volvieron diez páginas bien redactadas que no cumplían ninguna norma de la casa. Rehacerlas a mano costó tres horas (L 750), más los L 180 de la tanda perdida.' },
  { txt: 'Se pidió una ficha de diez páginas, contestó que estaba lista con diez y el PDF trajo diecinueve. Se imprimieron 30 juegos antes de contar: L 1.140 en vez de L 600, o sea L 540 de sobrecosto.' },
  { txt: 'Se pidió corregir los guiones largos de una ficha describiendo el archivo en vez de pegarlo, y devolvió una versión inventada, parecida y falsa. Descubrir que no era el mismo texto costó 40 minutos (L 165).' },
  { txt: 'Se pidió «explícame cómo funciona el inyector de bancos» y llegaron tres páginas cuando lo que hacía falta cabía en diez líneas para el README. Leerlas y recortarlas costó 25 minutos (L 105).' },
  { txt: 'Se pidió el resumen de costos del mes de M.E.T.A.S y devolvió una tabla impecable con L 4.800 de servidor y L 2.300 de dominio, cifras que nunca vio. Con el recibo adjunto, el servidor de ese mes eran L 1.150.' },
  { txt: 'La misión que la semana anterior había costado nueve mensajes cortos (L 470) salió a la primera con un encargo de media hoja y una sola tanda de L 180. Se ahorraron seis vueltas: L 625 de tiempo y L 290 de tokens.' },
  { txt: 'A la cuarta hora seguida, la máquina volvió a proponer un formato de casos descartado dos horas antes y a meter guiones largos ya corregidos. Recuperar el hilo a mano costó una hora (L 250).' },
  { txt: 'El encargo de los 32 bancos, escrito una vez en dos horas (L 500) y guardado en la carpeta _dev, se ha reutilizado en las seis misiones del año cambiando solo el tema y las cifras: L 3.750 que no se volvieron a pagar.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Qué se pidió exactamente y qué faltaba en el encargo?',
  '2. ¿Cuál de las siete casillas resuelve el problema, y qué diría?',
  '3. Escribe el encargo corregido en 4 o 5 líneas, listo para mandar.',
  '4. ¿Con qué se va a medir que quedó bien, y quién lo mide?',
]);

B.critCaseGuides = JSON.stringify([
  'Primero lo que se pidió, con las palabras que se usaron; después lo que faltaba, casilla por casilla. Casi siempre falta el contexto o el formato de salida, en ese orden, y lo que faltó no es lo que más se nota en el resultado: es lo que nadie escribió en el encargo.',
  'Una sola casilla suele resolver el caso entero. Se escribe completa, tal como iría en el encargo, no en abstracto: si no se puede escribir la línea, es que todavía no está pensada.',
  'Cuatro o cinco líneas alcanzan si llevan el verbo, el material adjunto, el formato con tamaño y destino, y la regla del dato que falta. La prueba sigue siendo la misma: si para hacerlo hay que adivinar algo, sigue siendo una petición.',
  'El criterio nombra el instrumento y a la persona: el medidor de páginas, el PDF contado, node --check, el grep de guiones largos, y quién los corre. Lo que la máquina no puede comprobar sola (páginas, tamaños, cantidades) lo mide alguien, y se dice quién.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Hazme la misión completa, que quede bien".', g1: 'No hay tarea, ni formato, ni criterio: «que quede bien» no se puede aprobar ni reprobar, así que el resultado se discute después en vez de medirse, y el que reescribe tres horas eres tú.', g2: 'Se parte en piezas con un verbo cada una, se adjunta el molde de la misión anterior con las normas y las cifras en lempiras, y se cierra con un criterio medible: tantos casos, con estas cinco partes, cero guiones largos.' },
  { txt: '"Arréglame la ficha de fracciones, la que tiene los guiones largos".', g1: 'Nombrar un archivo no es adjuntarlo. Sin el texto adentro reconstruye algo parecido y falso, y comparar dos archivos que no son el mismo cuesta más que el arreglo. El riesgo de verdad es pegar el falso.', g2: 'Se pega el contenido completo, se dice qué parte se toca y qué parte no, y se cierra con «si no te di el archivo, dímelo, no lo reconstruyas».' },
  { txt: '"Que la ficha quede de diez páginas".', g1: 'Es un criterio que la máquina no puede comprobar sola: medir es contar y lo que ella hace es predecir texto. Va a contestar que sí de buena fe, y el papel ya está impreso cuando se descubre.', g2: 'El criterio nombra el instrumento: cada página entre 215 y 252 mm, letra de 10 pt, medido con el medidor y contado en el PDF antes de imprimir. De ahí salió la norma 6 de la casa.' },
  { txt: '"No inventes nada".', g1: 'Prohibir sin dar salida no funciona: si le falta un dato para terminar y no puede preguntar, rellena con lo más probable, y lo hace con la misma seguridad con la que acierta.', g2: 'Se escribe la salida de emergencia: «si te falta un dato, pregúntamelo, no lo inventes», y de vuelta, la lista de lo que no pudo verificar con lo que le diste.' },
  { txt: '"Ya van tres veces con los guiones largos, se los quito a mano y listo".', g1: 'El parche no deja rastro y el encargo sigue igual de malo: la próxima misión vuelve con guiones y la tarde se repite. Ese costo se paga cada vez, no una.', g2: 'La restricción va en la casilla 6 y el grep en la casilla 7, y el encargo corregido se guarda. Se corrige el encargo, no la respuesta.' },
  { txt: '"Mejor le voy preguntando de a poquito, así lo llevo controlado".', g1: 'Cada ida y vuelta reenvía la conversación entera y se paga otra vez por el mismo texto: la misma misión costó L 470 picoteada y L 180 en una sola tanda.', g2: 'Se junta todo lo del tema, se reúnen los archivos y las cifras, se llena la hoja de encargo y se manda de una vez. Y se cierra la conversación antes de cambiar de tema.' },
]);

B.critDecisionBank = JSON.stringify([
  'Son las diez de la noche y los ocho casos volvieron genéricos y con guiones largos: ¿los arreglas a mano o reescribes el encargo con las siete piezas?',
  'La ficha dice diez páginas y hay 30 juegos por imprimir a L 2 la página: ¿qué se mide antes de mandar a imprimir, con qué y quién lo mide?',
  'Hace falta el resumen de costos del mes para una reunión con un director: ¿qué se adjunta y qué dos restricciones se escriben?',
  'La conversación lleva cuatro horas y repite cosas ya descartadas: ¿se sigue ahí o se abre otra, y qué lleva el encargo de arranque?',
  'Hay que pedirle las 15 preguntas de verdadero y falso de esta misión: ¿qué va en cada una de las siete casillas y cuál dejarías en «no aplica»?',
  'La tanda salió perfecta a la primera: ¿qué se guarda, dónde, y qué parte se cambia para reutilizarlo en la próxima misión?',
  'Quieres que copie el tono de tus casos: ¿pegas una muestra o describes el estilo, y qué dices que NO hay que imitar?',
  'La misión completa se puede pedir de una vez o en seis vueltas cortas: ¿cuál sale más barata y con qué condición funciona la grande?',
]);

/* `critDecisionGuide` no es una lista, así que va fuera de `B` (igual que en los
   inyectores de datos, presupuesto, sesgos, marca y política, que cuentan 32 bancos).
   Se reemplaza abajo, con la lista `textos`, por su línea completa. */
const CRIT_DECISION_GUIDE = JSON.stringify('La decisión correcta casi nunca es «lo arreglo a mano» ni «se lo vuelvo a explicar»: es escribir la casilla que faltaba y volver a pedirlo completo. El orden: se dice en una línea qué tiene que quedar hecho; se pone el papel y un solo verbo para la tarea; se vuelca el contexto que solo tú sabes y se adjunta el material, porque describir un archivo no es darlo; se dice el formato de salida con tamaño y destino; se pega un ejemplo y se dice qué imitar y qué no; y se cierra con las restricciones (ni un guion largo, cifras en lempiras, ningún dato de menores y «si te falta un dato, pregúntamelo, no lo inventes») y con un criterio que alguien pueda medir con un instrumento, no con su opinión. Cuando el resultado no sirve, se corrige el encargo y no la respuesta; el trabajo se junta en una tanda en vez de picotearlo, porque cada ida y vuelta se paga otra vez; y el encargo que funcionó se guarda: la respuesta sirve una vez, el encargo sirve todas las que vengan.');

B.critCompareBank = JSON.stringify([
  { a: 'Escribir veinte minutos de encargo con las siete piezas y mandar una sola tanda de L 180.', b: 'Mandar una línea con prisa y arreglar el resultado a mano en dos horas (L 500).', ga: 'Caso A: sale a la primera, con las cifras del proyecto y sin un guion largo, y el encargo queda guardado para la próxima misión.', gb: 'Caso B: el tiempo se paga cada vez y el encargo sigue igual de malo, así que la próxima misión llega con exactamente el mismo error.' },
  { a: 'Pegar entero un caso ya aprobado y decir qué imitar y qué no.', b: 'Describir el estilo con adjetivos: que quede claro, profesional y cercano.', ga: 'Caso A: enseña tono, largo, forma y nivel de detalle de un golpe, y no hay que discutir qué significa cada palabra.', gb: 'Caso B: cada adjetivo se interpreta, y casi nunca como tú lo pensabas. Explicar el estilo con adjetivos no ha funcionado nunca.' },
  { a: 'Criterio: diez páginas medidas con el medidor y contadas en el PDF, cada una entre 215 y 252 mm.', b: 'Criterio: que la ficha quede de diez páginas.', ga: 'Caso A: se puede aprobar o reprobar sin discutir, y quien lo mide está nombrado. El PDF es el único juez.', gb: 'Caso B: la máquina contesta que sí de buena fe, porque medir es contar y ella predice. Ese criterio costó L 540 de papel.' },
  { a: 'Guardar el encargo que funcionó, en la carpeta _dev, con el tema y las cifras cambiables.', b: 'Guardar la respuesta que salió buena, en la carpeta de la misión.', ga: 'Caso A: se reutilizó en las seis misiones del año y ahorró L 3.750. La colección de encargos es el activo.', gb: 'Caso B: sirve para esa misión y caduca. La siguiente vuelve a empezar por la línea escrita con prisa.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se manda el tema y nada más.', guide: 'Lo que no le pusiste en la mesa lo rellena con lo más probable, que casi nunca es lo tuyo, y lo escribe con buena letra: el resultado parece bueno hasta que se lee con la norma al lado.' },
  { cause: 'Se describe el archivo en vez de adjuntarlo.', guide: 'Reconstruye algo parecido y falso. El daño no es perder los 40 minutos de comparar: es pegar el falso creyendo que era el tuyo.' },
  { cause: 'No se dice el formato de salida.', guide: 'Llega lo más probable, que son tres páginas donde hacían falta diez líneas. Leerlas y recortarlas lo pagas tú, y por una línea que no escribiste.' },
  { cause: 'El criterio pide algo que la máquina no puede medir sola.', guide: 'Contesta que sí de buena fe y la medición se hace después, cuando ya hay 30 juegos impresos. Medir es contar, y contar no es predecir.' },
  { cause: 'Se prohíbe inventar sin dar permiso de preguntar.', guide: 'Si le falta un dato y no puede preguntar, rellena. Lo que cierra el hueco es la salida de emergencia, no la prohibición.' },
  { cause: 'El trabajo se picotea en vueltas cortas.', guide: 'Cada ida y vuelta reenvía la conversación entera y se paga otra vez por el mismo texto: L 470 contra L 180 por el mismo trabajo.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La misión salió a la primera y no hubo que corregir nada.', guide: 'El encargo llevaba las siete casillas llenas y el molde adjunto. Veinte minutos de escritura ahorraron seis vueltas de 25 minutos.' },
  { effect: 'La ficha se imprimió una sola vez y salieron diez páginas.', guide: 'El criterio nombraba el instrumento y alguien lo corrió antes de imprimir. El PDF se contó, no se creyó.' },
  { effect: 'La tabla de costos llegó con dos celdas vacías y una pregunta.', guide: 'Funcionó la regla del dato que falta: preguntó en vez de rellenar, y devolvió la lista de lo que no pudo verificar.' },
  { effect: 'Los ocho casos salieron con el tono de la casa sin una sola instrucción de estilo.', guide: 'Se pegó un caso aprobado entero y se dijo qué imitar y qué no. Un ejemplo bien elegido reemplaza una página de instrucciones.' },
  { effect: 'La misión de la semana siguiente arrancó en cinco minutos.', guide: 'El encargo estaba guardado y solo hubo que cambiar el tema y las cifras. Lo que se acumula es el encargo, no la respuesta.' },
  { effect: 'La cuarta hora de trabajo rindió igual que la primera.', guide: 'Se cerró la conversación llena y se abrió otra con un encargo de arranque de media hoja: qué se está haciendo, qué se decidió, qué se descartó y qué falta.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🎭', label: 'El papel', text: '¿Desde <strong>dónde</strong> tiene que escribir? <strong>Decide:</strong> el vocabulario, el nivel y qué da por sabido. <strong>Se rompe:</strong> al no ponerlo y recibir un texto de folleto corporativo. <strong>En M.E.T.A.S:</strong> «eres el que redacta las misiones de F.A.R.O y conoce las normas de la casa», no «eres un experto en educación».' },
  { y: '2', icon: '🔨', label: 'La tarea', text: '¿Qué <strong>verbo</strong> exacto? <strong>Decide:</strong> qué va a hacer y qué no. <strong>Se rompe:</strong> con verbos de humo: «mejora», «trabaja», «hazme algo con». <strong>En M.E.T.A.S:</strong> escribe, ordena, compara, traduce, parte en diez, cuenta. Un verbo por encargo.' },
  { y: '3', icon: '🧳', label: 'El contexto', text: '¿Qué sé yo que <strong>ella no puede saber</strong>? <strong>Decide:</strong> casi todo el resultado. <strong>Se rompe:</strong> cuando el dato vive en tu cabeza o en un archivo que no adjuntaste. <strong>En M.E.T.A.S:</strong> el molde de la misión anterior, las normas 1-bis, 3, 4 y 6, quién lo va a leer y lo que ya se decidió.' },
  { y: '4', icon: '📐', label: 'El formato de salida', text: '¿En qué <strong>forma</strong> y de qué tamaño? <strong>Decide:</strong> si sirve tal cual o hay que rehacerlo. <strong>Se rompe:</strong> al no decirlo y recibir tres páginas donde hacían falta diez líneas. <strong>En M.E.T.A.S:</strong> «diez líneas», «un archivo .js con el objeto B», «una tabla de tres columnas», «para pegar en la ficha».' },
  { y: '5', icon: '🪞', label: 'El ejemplo', text: '¿Con qué se <strong>parece</strong> a lo que quiero? <strong>Decide:</strong> el tono, el nivel de detalle y la forma, de un golpe. <strong>Se rompe:</strong> al describir el estilo con adjetivos en vez de pegar una muestra. <strong>En M.E.T.A.S:</strong> se pega un caso ya aprobado y se dice «así, con esta forma, para este otro tema».' },
  { y: '6', icon: '🚧', label: 'Las restricciones', text: '¿Qué <strong>no</strong> debe hacer, y qué hace si le falta un dato? <strong>Decide:</strong> los errores que ni siquiera ocurren. <strong>Se rompe:</strong> al callarlas y descubrirlas en el resultado. <strong>En M.E.T.A.S:</strong> «ni un guion largo», «nada de datos de menores», y sobre todo: «si te falta un dato, pregúntamelo, no lo inventes».' },
  { y: '7', icon: '✅', label: 'El criterio de aceptación', text: '¿Cómo se sabrá que <strong>está bien</strong>, y quién lo mide? <strong>Decide:</strong> cuándo el trabajo está terminado. <strong>Se rompe:</strong> con criterios que la máquina no puede comprobar por sí sola. <strong>En M.E.T.A.S:</strong> «diez páginas medidas con el medidor y confirmadas en el PDF», no «que quede de diez páginas».' },
]);

B.parteData = JSON.stringify({
  contexto: {
    nombre: 'El contexto', icon: '🧳',
    estructura: { title: 'Qué es', info: '• Lo que <strong>solo tú sabes</strong> del trabajo<br>• El proyecto, quién lo va a leer y lo que ya se decidió<br>• No es «más texto»: es lo que ella no tiene forma de averiguar' },
    funcion: { title: 'Cómo se escribe', info: '• Se lista lo decidido, con fecha si importa<br>• Se <strong>adjunta el archivo</strong>, no se describe el archivo<br>• Se dice para quién es el resultado y qué va a hacer con él' },
    enfermedades: { title: 'Dónde se rompe', info: '• Cuando el dato vive en tu cabeza y das por hecho que se entiende<br>• Al pedir que arregle algo <strong>sin dar la cosa que hay que arreglar</strong><br>• Al mandar solo el pedazo y esperar coherencia con el resto' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Va siempre: el <strong>molde de la misión anterior</strong>, las normas 1-bis, 3, 4 y 6, la materia, la ruta y la etapa<br>• Público: maestras de primaria en Honduras, madres con datos escasos, directores<br>• Y lo que ya está decidido, para que no lo vuelva a proponer' },
  },
  ejemplo: {
    nombre: 'El ejemplo', icon: '🪞',
    estructura: { title: 'Qué es', info: '• Una <strong>muestra</strong> de lo que quieres, no una descripción<br>• Un solo ejemplo bien elegido reemplaza una página de instrucciones<br>• Enseña tono, largo, forma y nivel de detalle a la vez' },
    funcion: { title: 'Cómo se escribe', info: '• Se pega <strong>completo</strong>, no un pedazo<br>• Se dice qué de ese ejemplo hay que imitar y qué no<br>• Si hay un contraejemplo («así no»), también sirve, y mucho' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al describir el estilo con adjetivos: «que quede bonito», «profesional»<br>• Al pegar un ejemplo que en realidad no te gustaba<br>• Al dar tres ejemplos distintos entre sí y esperar que adivine el patrón' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• El caso 4 de la misión de datos, pegado entero, sirve de molde para los ocho casos de cualquier etapa nueva<br>• Regla de la casa: <strong>antes de explicar el estilo, pegar una muestra</strong>' },
  },
  restricciones: {
    nombre: 'Las restricciones', icon: '🚧',
    estructura: { title: 'Qué es', info: '• Lo que <strong>no debe hacer</strong>, dicho antes<br>• Y qué hacer si le falta un dato para terminar<br>• Cada restricción es un error que ya no va a ocurrir' },
    funcion: { title: 'Cómo se escribe', info: '• En negativo y en concreto: «ni un guion largo», no «cuida el estilo»<br>• Con la salida de emergencia: <strong>«si te falta un dato, pregúntamelo, no lo inventes»</strong><br>• Y con la devolución: «al final, la lista de lo que no pudiste verificar»' },
    enfermedades: { title: 'Dónde se rompe', info: '• Al no ponerlas y pasar la tarde corrigiendo lo mismo de siempre<br>• Al ponerlas tan generales que no se pueden comprobar<br>• Al pedir que no invente <strong>sin darle permiso de preguntar</strong>: si no puede preguntar, rellena' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Las tres fijas: <strong>sin guion largo</strong>, <strong>sin datos de menores</strong>, <strong>cifras en lempiras</strong><br>• Y la cuarta, la que más sirve: que pregunte en vez de inventar' },
  },
  criterio: {
    nombre: 'El criterio de aceptación', icon: '✅',
    estructura: { title: 'Qué es', info: '• Cómo se sabrá que el trabajo <strong>está bien</strong><br>• Escrito antes de empezar, no discutido después<br>• Incluye <strong>quién lo mide y con qué</strong>' },
    funcion: { title: 'Cómo se escribe', info: '• Una condición comprobable: un número, un archivo, un comando<br>• Se nombra el instrumento: el medidor, el PDF, node --check, el grep<br>• Se dice qué pasa si no se cumple: se corrige el encargo y se repite' },
    enfermedades: { title: 'Dónde se rompe', info: '• Con criterios que la máquina <strong>no puede medir sola</strong>: páginas, tamaños, cantidades<br>• Con «que quede bien», que no se puede aprobar ni reprobar<br>• Al aceptar la palabra de la máquina como si fuera la medición' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• La norma 6 nació de aquí: se pidieron <strong>diez páginas sin decir cómo se miden</strong> y el PDF trajo diecinueve<br>• Hoy el criterio dice: diez páginas medidas con mide-ficha-paginas.html y confirmadas en el PDF<br>• <strong>El PDF es el único juez</strong>' },
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

  /* el mensaje del diploma (shareWA): emoji heredado, etapa y nombre de la etapa 1 */
  [/'[^']*¡'\+name\+' completó la Etapa 1 de la Ruta de la Máquina que Predice \(La máquina que predice\)!/,
    "'📝 ¡'+name+' completó la Etapa 2 de la Ruta de la Máquina que Predice (Pedir bien)!"],

  /* el mensaje de WhatsApp de la misión (compartirMision) */
  [/🤖 \*Ruta de la Máquina que Predice · Etapa 1\* 🤖/g, '📝 *Ruta de la Máquina que Predice · Etapa 2* 📝'],
  [/Qué es y qué no es un modelo de lenguaje: tokens, contexto, por qué inventa y cómo se verifica\. 🔎/g,
    'Cómo se escribe un encargo que sale bien a la primera: papel, tarea, contexto, formato, ejemplo, restricciones y criterio. 📝'],
  [/_Incluye evaluación conceptual y simulacro de verificación\._ ✍️/g, '_Incluye evaluación conceptual y el encargo que se escribe._ ✍️'],

  /* el título del documento impreso de la prueba competencial, que en el molde iba sin
     separador entre el rótulo y el nombre de la misión */
  [/<title>Simulacro de verificación La máquina que predice ·/, '<title>El encargo que se escribe · Pedir bien ·'],

  /* los rótulos de la prueba competencial: título de pantalla, encabezado impreso,
     pauta, aviso y toast del puntaje (los seis sitios) */
  [/Simulacro de verificación/g, 'El encargo que se escribe'],

  /* el nombre de la misión en la evaluación final, en los títulos de impresión y en las pautas */
  [/La máquina que predice/g, 'Pedir bien'],

  /* la pregunta de la sección III (decisiones), en pantalla y en papel */
  [/¿Qué parte se puede verificar, con qué se verifica y qué harías antes de firmarlo\? Explica por qué tu verificación es mejor que confiar o que rehacerlo todo a mano\./g,
    '¿Cuál de las siete casillas de la hoja de encargo faltaba, qué diría escrita completa y con qué se va a medir que quedó bien? Explica por qué corregir el encargo es mejor que arreglar la respuesta a mano.'],

  /* la pregunta de la sección IV (comparación), en pantalla y en papel */
  [/¿Qué gana cada caso y cuál aguanta que alguien pregunte de dónde salió el dato\? 2\. ¿Por qué no son el mismo caso\?/g,
    '¿Qué gana cada caso y cuál se puede volver a usar en la próxima misión sin escribirlo de nuevo? 2. ¿Por qué no son el mismo caso?'],

  /* la simulación de Aprende: los dos pasos de cada rama, heredados de otra misión */
  [/<span class="ms-icon">🛡️<\/span><span class="ms-text"><strong>Pediste 24 horas:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">🔁</span><span class="ms-text"><strong>Reescribiste el encargo con las siete piezas:</strong> veinte minutos de escritura y una sola tanda de L 180.</span>'],
  [/<span class="ms-icon">📄<\/span><span class="ms-text"><strong>Al día siguiente decides tú:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">🗂️</span><span class="ms-text"><strong>Salió a la primera:</strong> con las cifras del proyecto y sin un guion largo. Y el encargo quedó guardado: la próxima misión arranca desde ahí.</span>'],
  [/<span class="ms-icon">✍️<\/span><span class="ms-text"><strong>Contestaste en caliente:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">🩹</span><span class="ms-text"><strong>Los arreglaste a mano:</strong> dos horas de tu tiempo (L 500) a las diez de la noche, y ni una línea escrita para la próxima.</span>'],
  [/<span class="ms-icon">🔗<\/span><span class="ms-text"><strong>Y la coherencia lo amarra:<\/strong>[^<]*<\/span>/,
    '<span class="ms-icon">🔂</span><span class="ms-text"><strong>Y el encargo quedó igual de malo:</strong> la próxima misión vas a recibir exactamente lo mismo, y lo vas a volver a arreglar a mano.</span>'],

  /* los mensajes del diploma */
  [/'¡Sigue estudiando tu sistema!'/g, "'¡Sigue puliendo tu encargo!'"],
  [/'¡Excelente verificador en formación!'/g, "'¡Ya distingues encargo de petición!'"],
  [/'¡Usas bien la máquina!'/g, "'¡Escribes encargos que salen a la primera!'"],
  [/'¡Dueño de la herramienta!'/g, "'¡Dueño de tu colección de encargos!'"],

  /* la pieza con la que abre el laboratorio: la primera clave de parteData */
  [/let labParte='token'/g, "let labParte='contexto'"],
  [/data-parte="token"/g, 'data-parte="contexto"'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
