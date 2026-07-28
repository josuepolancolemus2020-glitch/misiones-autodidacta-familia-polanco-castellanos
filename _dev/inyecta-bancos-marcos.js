/* Inyecta los bancos de la misión «Marcos: quien pone el marco gana la
   conversación» (Ruta de la Persuasión, etapa 3) sobre el molde copiado de la
   etapa 2, «Sesgos».
   Uso:  node _dev/inyecta-bancos-marcos.js */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-persuasion-marcos', 'js', 'marcos.js');

let _semilla = 20260731;
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
B.SAVE_KEY = `'faro_psi_marcos_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de los marcos superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos del encuadre explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de marco propio y marco ajeno experto' },
  id_master: { icon: '🔍', label: 'Identificador de marcos maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de los marcos' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 3 de la Ruta de la Persuasión completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Contesta lo que le preguntan 🗯️' },
  { t: 25, n: 'Nota que hay un marco 🖼️' },
  { t: 55, n: 'Le pone nombre al marco 🏷️' },
  { t: 90, n: 'Elige el punto de comparación 📐' },
  { t: 130, n: 'Devuelve la carga de la prueba ⚖️' },
  { t: 165, n: 'Encuentra la tercera salida 🚪' },
  { t: 190, n: 'Pone el marco de la conversación 🖼️' },
]);

B.fcData = JSON.stringify([
  { w: 'El marco', a: '🖼️ La manera de plantear una situación, que decide <strong>de qué se va a discutir y de qué no</strong>. No es un truco de palabras: es lo que hace que unas preguntas parezcan razonables y otras ni se le ocurran a nadie.' },
  { w: 'Quien pone el marco gana', a: '🏆 Porque el que contesta <strong>dentro del marco ajeno</strong> ya aceptó lo más importante sin discutirlo. Se puede ganar cada argumento de una conversación y perderla entera por eso.' },
  { w: 'La señal de alarma', a: '🚨 Notar que <strong>te estás justificando</strong>. Justificarse es la prueba de que la carga de la prueba cayó de tu lado y no lo decidiste tú. Ahí se para, se nombra el marco y se propone otro.' },
  { w: 'La pregunta cargada', a: '❓ La que <strong>ya trae la respuesta dentro</strong>: «¿cuánto descuento me hace?» da por hecho que hay descuento. Contestar con un número acepta la premisa; la salida es contestar a la premisa, no a la pregunta.' },
  { w: 'Ganancia y pérdida', a: '⚖️ Lo mismo contado como <strong>lo que ganas</strong> o como <strong>lo que pierdes</strong> cambia la decisión de la mayoría de la gente. Es el sesgo de la etapa 2 visto desde fuera: allá está en tu cabeza, aquí lo activa otro.' },
  { w: 'El punto de comparación', a: '📐 Caro o barato, mucho o poco, avanzado o básico: <strong>siempre comparado con algo</strong>, y ese algo casi nunca se dice en voz alta. Quien elige la comparación ya decidió la conclusión.' },
  { w: 'La falsa disyuntiva', a: '🚪 «O esto o lo otro», cuando existe una tercera salida que no se nombró. Se reconoce porque <strong>las dos opciones convienen a quien las ofrece</strong>, y porque nunca incluyen la de esperar.' },
  { w: 'Quién carga con la prueba', a: '⚖️ A quién le toca demostrar. Es el marco <strong>más invisible de todos</strong>, porque se reparte sin decirlo, y el que carga con ella trabaja el doble. Regla justa: la enseña quien afirma.' },
  { w: 'El marco moral', a: '😇 Convertir una decisión práctica en una prueba de bondad: «si de verdad te importaran los niños, lo harías gratis». Discutirlo dentro del marco es imposible, porque <strong>cualquier respuesta suena a mala persona</strong>.' },
  { w: 'El «solo»', a: '🤏 «Es solo un logo», «es solo un favor», «solo esta vez». La palabra <strong>encoge lo que se pide</strong> antes de que lo mires. Se quita el «solo» y se vuelve a leer la frase: casi siempre suena distinto.' },
  { w: 'El marco de los papeles', a: '🎭 La frase que reparte quién es quién: «nosotros ponemos la plataforma, ustedes ponen el contenido». Ahí ya se decidió, sin discutirlo, <strong>quién es el dueño y quién el proveedor</strong>.' },
  { w: 'Nombrar el marco', a: '🏷️ Decir en voz alta y sin agresividad de qué se está hablando en realidad: «me parece que estamos discutiendo si esto se regala, y lo que yo traigo es otra cosa». <strong>Nombrarlo lo desarma</strong>, porque solo funciona mientras no se ve.' },
  { w: 'Reencuadrar', a: '🔄 Cambiar el marco sin pelear: se acepta la preocupación de fondo, se rechaza la manera de plantearla y se propone otra. Son tres movimientos y <strong>el primero no se puede saltar</strong>, o suena a evasiva.' },
  { w: 'La tercera salida', a: '🚦 La opción que la falsa disyuntiva no nombró. Casi siempre existe, y casi siempre es <strong>más pequeña y más pronto</strong>: una prueba, un plazo, una parte. Buscarla es el hábito de esta etapa.' },
  { w: 'El marco propio', a: '📋 El que traes escrito de casa: de qué va esta conversación, qué se decide hoy y qué no. <strong>Quien llega sin marco propio adopta el ajeno</strong> sin darse cuenta, por educación.' },
  { w: 'Marco y mentira', a: '🧭 Un marco no es una mentira: es <strong>una verdad recortada</strong>. Por eso no se responde llamando mentiroso a nadie, sino ampliando el recorte hasta que se vea lo que quedaba fuera.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué es un marco en una conversación?', o: ['a) Una mentira bien construida', 'b) La manera de plantear algo, que decide de qué se discute', 'c) El tono de voz que se usa', 'd) El resumen final de lo hablado'], c: 1 },
  { q: '¿Por qué se dice que quien pone el marco gana?', o: ['a) Porque habla primero', 'b) Porque suele tener más poder', 'c) Porque quien contesta dentro del marco ajeno ya aceptó lo importante', 'd) Porque los marcos no se pueden cambiar'], c: 2 },
  { q: 'La señal de que estás dentro del marco de otro es…', o: ['a) Que te estás justificando', 'b) Que la conversación se alarga', 'c) Que suben la voz', 'd) Que aparecen números'], c: 0 },
  { q: '«¿Cuánto descuento me hace?» es un ejemplo de…', o: ['a) Falsa disyuntiva', 'b) Marco moral', 'c) Punto de comparación', 'd) Pregunta cargada'], c: 3 },
  { q: '«Comparado con una plataforma de verdad, esto es básico» juega con…', o: ['a) El punto de comparación', 'b) La carga de la prueba', 'c) El marco de los papeles', 'd) El «solo»'], c: 0 },
  { q: '¿Cómo se reconoce una falsa disyuntiva?', o: ['a) Porque una opción es mucho peor', 'b) Porque las dos opciones convienen a quien las ofrece', 'c) Porque se plantea con prisa', 'd) Porque incluye un precio'], c: 1 },
  { q: 'La carga de la prueba, cuando se reparte de forma justa…', o: ['a) La lleva quien pregunta', 'b) La llevan los dos por igual', 'c) La lleva quien afirma', 'd) Depende de quién tenga más poder'], c: 2 },
  { q: '«Si de verdad te importaran los niños, lo harías gratis» es…', o: ['a) Una pregunta cargada', 'b) Un punto de comparación', 'c) Una falsa disyuntiva', 'd) Un marco moral'], c: 3 },
  { q: 'Los tres movimientos para reencuadrar son…', o: ['a) Aceptar la preocupación, rechazar la manera de plantearla y proponer otra', 'b) Negar, explicar y repetir', 'c) Callar, esperar y volver otro día', 'd) Preguntar, anotar y consultar'], c: 0 },
  { q: 'Un marco, comparado con una mentira, es…', o: ['a) Lo mismo con otro nombre', 'b) Una verdad recortada', 'c) Siempre involuntario', 'd) Más fácil de desmentir'], c: 1 },
]);

B.classGroups = JSON.stringify([
  { label: ['Marco ajeno', 'Marco propio'], headA: '🎣 Marco que te ponen', headB: '📋 Marco que traes', colA: 'ok', colB: 'no',
    words: [{ w: '«¿Cuánto descuento me hace?»', t: 'ok' }, { w: '«Hoy vengo a decidir solo el piloto»', t: 'no' },
      { w: '«O te adaptas o te quedas fuera»', t: 'ok' }, { w: '«Traigo dos opciones, las dos con precio»', t: 'no' },
      { w: '«Es solo un logo en la portada»', t: 'ok' }, { w: '«Esto se compara con lo que usan hoy»', t: 'no' },
      { w: '«Si te importaran los niños sería gratis»', t: 'ok' }, { w: '«Lo que cobro es el trabajo, no la educación»', t: 'no' }] },
  { label: ['Cargada', 'Abierta'], headA: '❓ Pregunta cargada', headB: '💬 Pregunta abierta', colA: 'ok', colB: 'no',
    words: [{ w: '«¿Cuánto me rebaja por veinte aulas?»', t: 'ok' }, { w: '«¿Qué incluye el precio?»', t: 'no' },
      { w: '«¿Por qué cobras si es educación?»', t: 'ok' }, { w: '«¿Cómo se sostiene el proyecto?»', t: 'no' },
      { w: '«¿Cuándo lo tienes listo para todos?»', t: 'ok' }, { w: '«¿Qué haría falta para ampliarlo?»', t: 'no' },
      { w: '«¿Verdad que se puede probar gratis?»', t: 'ok' }, { w: '«¿Cómo funciona la prueba?»', t: 'no' }] },
  { label: ['Recorta', 'Amplía'], headA: '✂️ Recorta el cuadro', headB: '🔍 Amplía el cuadro', colA: 'ok', colB: 'no',
    words: [{ w: '«Es solo un favor»', t: 'ok' }, { w: '«¿Qué implica esto en un año?»', t: 'no' },
      { w: '«Comparado con una plataforma grande»', t: 'ok' }, { w: '«Comparado con lo que usan hoy»', t: 'no' },
      { w: '«O gratis o nada»', t: 'ok' }, { w: '«Hay una tercera: un piloto pagado»', t: 'no' },
      { w: '«Ustedes ponen el contenido»', t: 'ok' }, { w: '«¿Quién es el dueño de lo que se haga?»', t: 'no' }] },
  { label: ['Reencuadra', 'Se defiende'], headA: '🔄 Reencuadra', headB: '🛡️ Se justifica', colA: 'ok', colB: 'no',
    words: [{ w: '«Entiendo lo del presupuesto; hablemos de qué cubre el piloto»', t: 'ok' }, { w: '«No es caro, es que no entiendes lo que cuesta»', t: 'no' },
      { w: '«Estamos discutiendo si se regala, y yo traigo otra cosa»', t: 'ok' }, { w: '«De verdad me importan los niños, mira todo lo que hago»', t: 'no' },
      { w: '«Hay una tercera opción que no hemos nombrado»', t: 'ok' }, { w: '«Es que las otras plataformas también cobran»', t: 'no' },
      { w: '«¿Comparado con qué es básico?»', t: 'ok' }, { w: '«Tiene muchas más funciones de las que parece»', t: 'no' }] },
]);

B.idData = JSON.stringify([
  { s: ['El', 'marco', 'decide', 'de', 'qué', 'se', 'discute.'], c: 1, art: 'La manera de plantear la situación' },
  { s: ['Justificarse', 'es', 'la', 'señal', 'de', 'alarma.'], c: 0, art: 'Lo que delata que el marco es ajeno' },
  { s: ['Una', 'pregunta', 'cargada', 'ya', 'trae', 'la', 'respuesta.'], c: 2, art: 'La que da por hecho lo importante' },
  { s: ['Caro', 'o', 'barato', 'depende', 'de', 'la', 'comparación.'], c: 6, art: 'Lo que casi nunca se dice en voz alta' },
  { s: ['La', 'disyuntiva', 'falsa', 'esconde', 'una', 'tercera', 'salida.'], c: 1, art: 'El «o esto o lo otro»' },
  { s: ['Quien', 'afirma', 'carga', 'con', 'la', 'prueba.'], c: 5, art: 'Lo que se reparte sin decirlo' },
  { s: ['Nombrar', 'el', 'marco', 'lo', 'desarma.'], c: 0, art: 'Decir en voz alta de qué se habla' },
  { s: ['Reencuadrar', 'no', 'es', 'negar:', 'es', 'ampliar.'], c: 0, art: 'Cambiar el marco sin pelear' },
]);

B.cmpData = JSON.stringify([
  { s: 'La manera de plantear algo, que decide de qué se discute, es el ___.', opts: ['marco', 'tono', 'guion'], c: 0 },
  { s: 'La señal de que el marco es ajeno es que te estás ___.', opts: ['justificando', 'cansando', 'repitiendo'], c: 0 },
  { s: 'La pregunta que ya trae la respuesta dentro es una pregunta ___.', opts: ['cargada', 'larga', 'directa'], c: 0 },
  { s: 'Caro o barato siempre es respecto a un punto de ___.', opts: ['comparación', 'partida', 'equilibrio'], c: 0 },
  { s: 'El «o esto o lo otro» que esconde una tercera salida es una ___ disyuntiva.', opts: ['falsa', 'larga', 'clara'], c: 0 },
  { s: 'La prueba la enseña quien ___.', opts: ['afirma', 'pregunta', 'escucha'], c: 0 },
  { s: 'Decir en voz alta de qué se está hablando es ___ el marco.', opts: ['nombrar', 'romper', 'aceptar'], c: 0 },
  { s: 'Un marco no es una mentira: es una verdad ___.', opts: ['recortada', 'antigua', 'repetida'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  { label: ['Marco ajeno', 'Marco propio'], btnA: '🎣 Te lo ponen', btnB: '📋 Lo traes', colA: 'ok', colB: 'no',
    words: [{ w: '«¿Cuánto descuento?»', t: 'ok' }, { w: '«Hoy decidimos el piloto»', t: 'no' },
      { w: '«O te adaptas o fuera»', t: 'ok' }, { w: '«Traigo dos opciones con precio»', t: 'no' },
      { w: '«Es solo un logo»', t: 'ok' }, { w: '«Comparado con lo de hoy»', t: 'no' },
      { w: '«Si te importaran los niños»', t: 'ok' }, { w: '«Cobro el trabajo, no la educación»', t: 'no' },
      { w: '«Ustedes ponen el contenido»', t: 'ok' }, { w: '«¿Quién es el dueño?»', t: 'no' }] },
  { label: ['Cargada', 'Abierta'], btnA: '❓ Cargada', btnB: '💬 Abierta', colA: 'ok', colB: 'no',
    words: [{ w: '«¿Cuánto me rebaja?»', t: 'ok' }, { w: '«¿Qué incluye?»', t: 'no' },
      { w: '«¿Por qué cobras?»', t: 'ok' }, { w: '«¿Cómo se sostiene?»', t: 'no' },
      { w: '«¿Cuándo para todos?»', t: 'ok' }, { w: '«¿Qué haría falta?»', t: 'no' },
      { w: '«¿Verdad que es gratis?»', t: 'ok' }, { w: '«¿Cómo es la prueba?»', t: 'no' },
      { w: '«¿Y si no funciona?»', t: 'ok' }, { w: '«¿Cómo se mide?»', t: 'no' }] },
  { label: ['Recorta', 'Amplía'], btnA: '✂️ Recorta', btnB: '🔍 Amplía', colA: 'ok', colB: 'no',
    words: [{ w: '«Es solo un favor»', t: 'ok' }, { w: '«¿Y en un año?»', t: 'no' },
      { w: '«Comparado con una grande»', t: 'ok' }, { w: '«Comparado con lo de hoy»', t: 'no' },
      { w: '«O gratis o nada»', t: 'ok' }, { w: '«Hay una tercera»', t: 'no' },
      { w: '«Solo esta vez»', t: 'ok' }, { w: '«¿Cuántas veces más?»', t: 'no' },
      { w: '«Es un detalle menor»', t: 'ok' }, { w: '«¿Qué queda fuera?»', t: 'no' }] },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se responde a un marco ajeno', steps: ['Notar la señal: te estás justificando', 'Parar antes de contestar el contenido', 'Nombrar el marco en voz alta y sin agresividad', 'Aceptar la preocupación de fondo, que casi siempre es legítima', 'Proponer el marco propio con una pregunta', 'Volver al contenido, ya dentro del marco nuevo'] },
  { label: 'Cómo se prepara el marco propio', steps: ['Escribir de qué va esta conversación, en una frase', 'Escribir qué se decide hoy y qué no', 'Elegir el punto de comparación que sí corresponde', 'Preparar la tercera salida por si aparece una disyuntiva', 'Decidir de antemano qué no se discute'] },
  { label: 'Cómo se desarma una falsa disyuntiva', steps: ['Comprobar si las dos opciones convienen a quien las ofrece', 'Preguntar qué pasa si no se elige ninguna', 'Nombrar la tercera salida, más pequeña y más pronto', 'Proponerla con fecha, para que no parezca una evasiva'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'La manera de plantear algo, que decide de qué se discute', ans: 'El marco', opts: ['El marco', 'La palanca', 'El sesgo', 'La oferta'] },
  { desc: 'La señal de que el marco lo puso otro', ans: 'Estarte justificando', opts: ['Estarte justificando', 'Que suban la voz', 'Que aparezcan cifras', 'Que la reunión se alargue'] },
  { desc: 'La que ya trae la respuesta dentro', ans: 'La pregunta cargada', opts: ['La pregunta cargada', 'La falsa disyuntiva', 'El marco moral', 'El punto de comparación'] },
  { desc: 'Caro o barato, siempre respecto a algo que no se dice', ans: 'El punto de comparación', opts: ['El punto de comparación', 'El «solo»', 'La carga de la prueba', 'El marco de los papeles'] },
  { desc: '«O esto o lo otro», con una tercera salida sin nombrar', ans: 'La falsa disyuntiva', opts: ['La falsa disyuntiva', 'La pregunta cargada', 'El marco moral', 'Nombrar el marco'] },
  { desc: 'A quién le toca demostrar, repartido sin decirlo', ans: 'La carga de la prueba', opts: ['La carga de la prueba', 'El punto de comparación', 'La tercera salida', 'El marco propio'] },
  { desc: 'Convertir una decisión práctica en una prueba de bondad', ans: 'El marco moral', opts: ['El marco moral', 'El «solo»', 'La falsa disyuntiva', 'Reencuadrar'] },
  { desc: 'Aceptar la preocupación, rechazar la manera y proponer otra', ans: 'Reencuadrar', opts: ['Reencuadrar', 'Nombrar el marco', 'La tercera salida', 'El marco propio'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: '«¿Por qué cobras si es educación?»', func: '«No cobro la educación: cobro el trabajo de hacerla. ¿Cómo se sostiene si no?»', opts: ['«No cobro la educación: cobro el trabajo de hacerla. ¿Cómo se sostiene si no?»', '«Es que también hay costos, mira la lista»', '«Todas las plataformas cobran algo»', '«Puedo hacerte un precio especial»'] },
  { trans: '«Comparado con una plataforma de verdad, esto es muy básico»', func: '«¿Comparado con qué? Hoy la maestra usa una fotocopia; contra eso se mide»', opts: ['«¿Comparado con qué? Hoy la maestra usa una fotocopia; contra eso se mide»', '«Tiene más funciones de las que parece»', '«Vamos a agregar muchas cosas pronto»', '«Es que somos un proyecto pequeño»'] },
  { trans: '«O te adaptas a la plataforma del Estado o te quedas fuera»', func: '«Hay una tercera: que las fichas funcionen al lado, sin depender de ninguna»', opts: ['«Hay una tercera: que las fichas funcionen al lado, sin depender de ninguna»', '«Entonces me adapto, no me queda otra»', '«Prefiero quedarme fuera»', '«Vamos a ver qué dice la Secretaría»'] },
  { trans: '«Si de verdad te importaran los niños, lo harías gratis»', func: '«Me importan, y por eso quiero que exista el año que viene. Gratis se apaga»', opts: ['«Me importan, y por eso quiero que exista el año que viene. Gratis se apaga»', '«Claro que me importan, mira todo lo que he hecho»', '«Entonces se lo dejo gratis este año»', '«No es cierto que solo me interese el dinero»'] },
  { trans: '«Nosotros ponemos la plataforma, ustedes ponen el contenido»', func: '«Antes de repartir papeles: ¿de quién es lo que se haga y quién puede retirarlo?»', opts: ['«Antes de repartir papeles: ¿de quién es lo que se haga y quién puede retirarlo?»', '«Perfecto, así cada quien hace lo suyo»', '«Nosotros también podríamos poner la plataforma»', '«¿Cuánto contenido necesitan?»'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Salió de la reunión explicando durante veinte minutos por qué cobra', characteristic: 'Contestó dentro de un marco que daba por hecho que debía ser gratis', opts: ['Contestó dentro de un marco que daba por hecho que debía ser gratis', 'No sabía explicar sus costos', 'La otra persona fue agresiva', 'Faltaba una lista de precios'] },
  { disease: 'Aceptó un descuento que nunca pensó dar', characteristic: 'Contestó con un número a una pregunta que daba el descuento por hecho', opts: ['Contestó con un número a una pregunta que daba el descuento por hecho', 'El cliente insistió mucho', 'El precio era demasiado alto', 'No tenía política de descuentos'] },
  { disease: 'El proyecto quedó como «básico» sin que nadie lo probara', characteristic: 'Se aceptó un punto de comparación que eligió la otra parte', opts: ['Se aceptó un punto de comparación que eligió la otra parte', 'Faltaban funciones de verdad', 'La demostración salió mal', 'No había capturas de pantalla'] },
  { disease: 'Se eligió entre dos opciones malas y ninguna servía', characteristic: 'Era una falsa disyuntiva y no se buscó la tercera salida', opts: ['Era una falsa disyuntiva y no se buscó la tercera salida', 'Las dos opciones eran razonables', 'Había poco tiempo para decidir', 'Faltó consultar con alguien'] },
  { disease: 'Se pasó la reunión demostrando que el material sirve', characteristic: 'La carga de la prueba cayó de su lado sin que nadie lo decidiera', opts: ['La carga de la prueba cayó de su lado sin que nadie lo decidiera', 'El material no estaba probado', 'Faltaban datos de uso', 'La otra parte no escuchaba'] },
  { disease: 'Cedió el logotipo, el nombre y después la autoría', characteristic: 'Cada petición venía con un «solo» que la hacía parecer pequeña', opts: ['Cada petición venía con un «solo» que la hacía parecer pequeña', 'Las peticiones eran razonables', 'No había nada escrito', 'La relación era muy buena'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'La manera de plantear algo, que decide de qué se discute.', type: 'El marco' },
  { s: 'La señal de que el marco lo puso otro.', type: 'Estarte justificando' },
  { s: 'La pregunta que ya trae la respuesta dentro.', type: 'La pregunta cargada' },
  { s: 'Caro o barato, siempre respecto a algo que no se dice.', type: 'El punto de comparación' },
  { s: '«O esto o lo otro», con una tercera salida sin nombrar.', type: 'La falsa disyuntiva' },
  { s: 'A quién le toca demostrar, repartido sin decirlo.', type: 'La carga de la prueba' },
  { s: 'Convertir una decisión práctica en una prueba de bondad.', type: 'El marco moral' },
  { s: 'La palabra que encoge lo que se pide antes de mirarlo.', type: 'El «solo»' },
  { s: 'Decir en voz alta de qué se está hablando en realidad.', type: 'Nombrar el marco' },
  { s: 'Aceptar la preocupación, rechazar la manera y proponer otra.', type: 'Reencuadrar' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: '«¿Cuánto descuento me hace?»', gen: 'Pregunta', n: 'Cargada', g: 'Marco ajeno', t: 'Da el descuento por hecho' },
  { w: '«¿Qué incluye el precio?»', gen: 'Pregunta', n: 'Abierta', g: 'Marco propio', t: 'No presupone nada' },
  { w: '«Comparado con una plataforma grande»', gen: 'Comparación', n: 'Ajena', g: 'Recorta', t: 'La conclusión ya está elegida' },
  { w: '«Comparado con lo que usan hoy»', gen: 'Comparación', n: 'Propia', g: 'Amplía', t: 'Mide contra lo real' },
  { w: '«O gratis o nada»', gen: 'Opciones', n: 'Dos', g: 'Falsa disyuntiva', t: 'Falta la tercera salida' },
  { w: '«Un piloto pagado de un mes»', gen: 'Opciones', n: 'Tercera', g: 'Salida', t: 'Más pequeña y más pronto' },
  { w: '«Es solo un logo»', gen: 'Tamaño', n: 'Encogido', g: 'El «solo»', t: 'Se lee sin el solo' },
  { w: '«¿Qué implica esto en un año?»', gen: 'Tamaño', n: 'Real', g: 'Amplía', t: 'Enseña lo que se pide' },
  { w: '«Demuéstrame que funciona»', gen: 'Prueba', n: 'De tu lado', g: 'Carga ajena', t: 'Trabajas el doble' },
  { w: '«¿Con qué lo compararías para saberlo?»', gen: 'Prueba', n: 'Compartida', g: 'Reencuadre', t: 'Devuelve la carga' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La manera de plantear algo es el ___.', opts: ['marco', 'guion', 'tono'], ans: 'marco' },
  { s: 'Si te estás ___, el marco lo puso otro.', opts: ['justificando', 'riendo', 'callando'], ans: 'justificando' },
  { s: 'La pregunta que trae la respuesta dentro es ___.', opts: ['cargada', 'larga', 'clara'], ans: 'cargada' },
  { s: 'Caro o barato depende del punto de ___.', opts: ['comparación', 'venta', 'partida'], ans: 'comparación' },
  { s: 'El «o esto o lo otro» es una ___ disyuntiva.', opts: ['falsa', 'buena', 'nueva'], ans: 'falsa' },
  { s: 'La prueba la enseña quien ___.', opts: ['afirma', 'duda', 'paga'], ans: 'afirma' },
  { s: 'Decir de qué se habla de verdad es ___ el marco.', opts: ['nombrar', 'perder', 'copiar'], ans: 'nombrar' },
  { s: 'Un marco es una verdad ___.', opts: ['recortada', 'inventada', 'repetida'], ans: 'recortada' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica qué es un marco y por qué quien lo pone gana la conversación.', ans: 'Un marco es la manera de plantear una situación, y lo que hace es decidir de qué se va a discutir y de qué no. No es un truco de palabras: es lo que consigue que unas preguntas parezcan razonables y que otras ni se le ocurran a nadie. Quien lo pone gana porque el que contesta dentro de un marco ajeno ya aceptó lo más importante sin haberlo discutido: se puede tener razón en cada argumento de una conversación y perderla entera, porque se estuvo respondiendo a la pregunta equivocada. La señal de que ha pasado es fácil de notar y cuesta aceptar: uno se está justificando. Justificarse significa que la carga de la prueba cayó de tu lado y no fuiste tú quien lo decidió.' },
  { q: '¿Qué es una pregunta cargada y cómo se contesta sin quedar mal?', ans: 'Es la que ya trae la respuesta dentro: «¿cuánto descuento me hace?» da por hecho que hay descuento, y contestar con cualquier número acepta la premisa antes de discutirla. Lo mismo con «¿por qué cobras si es educación?», que da por hecho que lo educativo se regala. No se contesta al número: se contesta a la premisa, y se puede hacer sin sonar cortante, porque casi siempre hay debajo una preocupación legítima. «Antes del descuento, déjame decirte qué incluye el precio y qué no» acepta la conversación, cambia el marco y no ofende a nadie. La clave es que el cambio de marco va primero y el contenido después, nunca al revés.' },
  { q: 'Explica el punto de comparación con el caso de «esto es muy básico».', ans: 'Caro o barato, mucho o poco, avanzado o básico: nada de eso significa nada por sí solo, siempre es respecto a algo, y ese algo casi nunca se dice en voz alta. Quien elige la comparación ya eligió la conclusión. Cuando alguien dice que M.E.T.A.S es básico comparado con una plataforma grande, la comparación está mal puesta a propósito o por costumbre: la maestra de sexto no está eligiendo entre M.E.T.A.S y una plataforma de millones, está eligiendo entre M.E.T.A.S y la fotocopia que sacó ayer. Contra eso se mide. Y la manera de sacarlo a la luz es una pregunta corta y sin ironía: «¿comparado con qué?».' },
  { q: '¿Qué es una falsa disyuntiva, cómo se reconoce y cómo se sale de ella?', ans: 'Es un «o esto o lo otro» que esconde una tercera salida que no se nombró. Se reconoce por dos señales: las dos opciones que se ofrecen convienen a quien las ofrece, y ninguna de las dos es esperar. «O te adaptas a la plataforma del Estado o te quedas fuera» es una: la tercera es que las fichas funcionen al lado, en papel y sin depender de ninguna plataforma. Se sale nombrando la tercera salida, que casi siempre es más pequeña y más pronto que las dos ofrecidas: una prueba, un plazo, una parte. Y conviene proponerla con fecha, porque una tercera salida sin fecha suena a evasiva y la conversación vuelve al mismo sitio.' },
  { q: 'Explica el marco moral y por qué es el más difícil de contestar.', ans: 'El marco moral convierte una decisión práctica en una prueba de bondad: «si de verdad te importaran los niños, lo harías gratis». Es el más difícil porque cualquier respuesta dentro de él suena a mala persona: si explicas los costos, pareces interesado; si te defiendes, pareces culpable; y si aceptas, pierdes el proyecto. La salida no es discutir si a uno le importan los niños, que es justo lo que el marco quiere, sino ampliar el recorte: «me importan, y por eso quiero que esto exista el año que viene; lo gratis se apaga en marzo». Eso acepta el valor que se está invocando, lo lleva al terreno de lo que de verdad se decide y no acusa a nadie de nada.' },
  { q: '¿Cómo se reencuadra en tres movimientos, y por qué el primero no se puede saltar?', ans: 'Primero se acepta la preocupación de fondo, que casi siempre es legítima: quien pide rebaja tiene un presupuesto de verdad, y quien dice que el material es básico teme perder el tiempo. Segundo se rechaza la manera de plantearla, nombrando el marco en voz alta y sin agresividad: «me parece que estamos discutiendo si esto se regala, y lo que yo traigo es otra cosa». Tercero se propone el marco propio, mejor en forma de pregunta, para que la otra persona entre en él por su cuenta. El primer movimiento no se puede saltar porque sin él los otros dos suenan a evasiva o a soberbia: la gente acepta un cambio de marco cuando siente que su preocupación fue oída, no cuando siente que la esquivaron.' },
]);

B.sopaSets = JSON.stringify([
  haceSopa(10, ['MARCO', 'PREGUNTA', 'CARGADA', 'PRUEBA', 'TERCERA', 'NOMBRE']),
  haceSopa(10, ['ENCUADRE', 'COMPARAR', 'SALIDA', 'MORAL', 'SOLO', 'PAPEL']),
  haceSopa(10, ['REENCUADRE', 'PERDIDA', 'GANANCIA', 'PREMISA', 'AMPLIAR', 'CORTE']),
]);

B.evalTFBank = JSON.stringify([
  { q: 'Un marco decide de qué se discute y de qué no.', a: true },
  { q: 'Se puede ganar cada argumento de una conversación y perderla entera.', a: true },
  { q: 'La señal de que el marco es ajeno es que uno se está justificando.', a: true },
  { q: '«¿Cuánto descuento me hace?» es una pregunta abierta.', a: false },
  { q: 'Caro o barato tienen significado por sí solos, sin comparación.', a: false },
  { q: 'En una falsa disyuntiva, las dos opciones suelen convenir a quien las ofrece.', a: true },
  { q: 'La carga de la prueba la lleva, de forma justa, quien afirma.', a: true },
  { q: 'El marco moral se contesta mejor demostrando que uno es buena persona.', a: false },
  { q: 'La palabra «solo» encoge lo que se pide antes de que lo mires.', a: true },
  { q: 'Nombrar el marco en voz alta lo desarma, porque solo funciona sin verse.', a: true },
  { q: 'Reencuadrar empieza por rechazar lo que dijo la otra persona.', a: false },
  { q: 'La tercera salida suele ser más pequeña y más pronto que las dos ofrecidas.', a: true },
  { q: 'Quien llega sin marco propio acaba adoptando el ajeno.', a: true },
  { q: 'Un marco es lo mismo que una mentira.', a: false },
  { q: '«Nosotros ponemos la plataforma, ustedes el contenido» ya reparte quién es el dueño.', a: true },
]);

B.evalMCBank = JSON.stringify([
  { q: 'Un marco es…', o: ['a) Una mentira bien construida', 'b) La manera de plantear algo, que decide de qué se discute', 'c) El resumen de una reunión', 'd) Un tono de voz'], a: 1 },
  { q: 'Quien pone el marco gana porque…', o: ['a) Habla primero', 'b) Tiene más poder', 'c) Quien contesta dentro ya aceptó lo importante', 'd) Los marcos no se cambian'], a: 2 },
  { q: 'La señal de alarma de estar en un marco ajeno es…', o: ['a) Que te estás justificando', 'b) Que la reunión se alarga', 'c) Que aparecen cifras', 'd) Que suben la voz'], a: 0 },
  { q: '«¿Por qué cobras si es educación?» es…', o: ['a) Un punto de comparación', 'b) Una falsa disyuntiva', 'c) Una pregunta cargada', 'd) Una petición legítima sin marco'], a: 2 },
  { q: 'Ante «¿comparado con qué?», lo que se está sacando a la luz es…', o: ['a) La falta de datos', 'b) El punto de comparación oculto', 'c) La mala intención del otro', 'd) El precio real'], a: 1 },
  { q: 'Una falsa disyuntiva se reconoce porque…', o: ['a) Se plantea con prisa', 'b) Una opción es mucho peor', 'c) Incluye un precio', 'd) Las dos opciones convienen a quien las ofrece'], a: 3 },
  { q: 'Ante «demuéstrame que esto funciona», lo primero es…', o: ['a) Preguntar qué habría que ver para darlo por bueno', 'b) Enseñar todos los datos que se tengan', 'c) Ofrecer una rebaja', 'd) Cambiar de tema'], a: 0 },
  { q: 'El marco moral es difícil porque…', o: ['a) Se plantea delante de más gente', 'b) Cualquier respuesta dentro de él suena a mala persona', 'c) Usa cifras falsas', 'd) No admite preguntas'], a: 1 },
  { q: 'Ante «es solo un logo en la portada», la salida es…', o: ['a) Aceptar, porque es pequeño', 'b) Negarse sin explicar', 'c) Quitar el «solo» y volver a leer lo que se pide', 'd) Pedir dinero a cambio'], a: 2 },
  { q: 'Los tres movimientos del reencuadre, en orden, son…', o: ['a) Negar, explicar, repetir', 'b) Preguntar, anotar, consultar', 'c) Callar, esperar, volver', 'd) Aceptar la preocupación, rechazar la manera, proponer otra'], a: 3 },
  { q: 'El primer movimiento del reencuadre no se puede saltar porque…', o: ['a) Sin él los otros dos suenan a evasiva', 'b) Es el más corto', 'c) Lo exige la cortesía', 'd) Sirve para ganar tiempo'], a: 0 },
  { q: 'La tercera salida de una falsa disyuntiva suele ser…', o: ['a) La más cara', 'b) Más pequeña y más pronto', 'c) La que propone el otro después', 'd) Esperar al año siguiente'], a: 1 },
  { q: 'La diferencia entre el marco y el sesgo de la etapa 2 es que…', o: ['a) El sesgo es voluntario', 'b) Son dos nombres para lo mismo', 'c) El sesgo está en tu cabeza y el marco lo activa otro desde fuera', 'd) El marco solo aparece por escrito'], a: 2 },
  { q: '«Nosotros ponemos la plataforma, ustedes el contenido» decide sobre todo…', o: ['a) El calendario', 'b) El precio', 'c) La calidad', 'd) Quién es el dueño y quién el proveedor'], a: 3 },
  { q: 'La prueba de que esta etapa está aprendida es…', o: ['a) Notar el marco antes de contestar, y llegar con el propio escrito', 'b) Ganar todas las discusiones', 'c) Aprenderse los nombres de los marcos', 'd) Evitar las conversaciones difíciles'], a: 0 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La manera de plantear algo, que decide de qué se discute, es el ___.', a: 'marco' },
  { q: 'La señal de que el marco es ajeno es que te estás ___.', a: 'justificando' },
  { q: 'La pregunta que ya trae la respuesta dentro es una pregunta ___.', a: 'cargada' },
  { q: 'Caro o barato depende del punto de ___.', a: 'comparación' },
  { q: 'El «o esto o lo otro» que esconde otra opción es una ___ disyuntiva.', a: 'falsa' },
  { q: 'La opción que la disyuntiva no nombró es la ___ salida.', a: 'tercera' },
  { q: 'De forma justa, la prueba la enseña quien ___.', a: 'afirma' },
  { q: 'Convertir una decisión práctica en prueba de bondad es el marco ___.', a: 'moral' },
  { q: 'La palabra que encoge lo que se pide es el ___.', a: 'solo' },
  { q: 'Decir en voz alta de qué se habla de verdad es ___ el marco.', a: 'nombrar' },
  { q: 'Cambiar el marco sin pelear es ___.', a: 'reencuadrar' },
  { q: 'El primer movimiento del reencuadre es ___ la preocupación de fondo.', a: 'aceptar' },
  { q: 'Un marco no es una mentira: es una verdad ___.', a: 'recortada' },
  { q: 'Quien llega sin marco ___ adopta el ajeno.', a: 'propio' },
  { q: 'Lo mismo dicho como ganancia o como ___ cambia la decisión.', a: 'pérdida' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'El marco', def: 'Decide de qué se discute' },
  { term: 'La señal de alarma', def: 'Estarte justificando' },
  { term: 'La pregunta cargada', def: 'Ya trae la respuesta dentro' },
  { term: 'El punto de comparación', def: 'Caro o barato respecto a qué' },
  { term: 'La falsa disyuntiva', def: 'Esconde una tercera salida' },
  { term: 'La carga de la prueba', def: 'A quién le toca demostrar' },
  { term: 'El marco moral', def: 'Decisión convertida en prueba de bondad' },
  { term: 'El «solo»', def: 'Encoge lo que se pide' },
  { term: 'El marco de los papeles', def: 'Reparte dueño y proveedor' },
  { term: 'Nombrar el marco', def: 'Decirlo en voz alta lo desarma' },
  { term: 'Reencuadrar', def: 'Aceptar, rechazar la manera, proponer' },
  { term: 'La tercera salida', def: 'Más pequeña y más pronto' },
  { term: 'El marco propio', def: 'El que traes escrito de casa' },
  { term: 'Ganancia y pérdida', def: 'Lo mismo contado de dos maneras' },
  { term: 'Marco y mentira', def: 'Una verdad recortada, no una falsedad' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Una directora pregunta, con toda naturalidad: «¿y por qué cobras, si esto es educación?». No hay mala intención: para ella lo educativo se regala.' },
  { txt: 'En una demostración, alguien dice: «comparado con una plataforma de verdad, esto es muy básico». Los demás asienten.' },
  { txt: 'Un técnico plantea: «o te adaptas a la plataforma que va a usar el Estado, o el proyecto se queda fuera del sistema».' },
  { txt: 'Un posible aliado dice: «demuéstrame que esto funciona» y se queda esperando, sin decir qué habría que ver para darlo por bueno.' },
  { txt: 'Un patrocinador pide el logotipo en la portada y lo presenta así: «es solo un logo, no cambia nada del material».' },
  { txt: 'Alguien cierra la conversación con: «si de verdad te importaran los niños, lo harías gratis».' },
  { txt: 'Una empresa propone: «nosotros ponemos la plataforma y ustedes ponen el contenido», y sigue hablando de calendarios.' },
  { txt: 'Un maestro dice: «estás perdiendo la oportunidad de que esto llegue a todo el departamento», cuando lo que hay sobre la mesa es ceder la autoría.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿Cuál es el marco, y qué da por hecho sin decirlo?',
  '2. ¿Qué preocupación legítima hay debajo, que sí conviene aceptar?',
  '3. Escribe en 3-4 frases tu reencuadre, con los tres movimientos en orden.',
  '4. ¿Qué marco propio traerías escrito para que esto no te agarre de nuevo?',
]);

B.critCaseGuides = JSON.stringify([
  'El marco casi nunca se dice: se da por hecho. Nombrar lo que da por hecho es la mitad del trabajo, y hacerlo en voz alta ya lo desarma.',
  'Debajo de casi todo marco hay una preocupación real: un presupuesto que no alcanza, un miedo a perder el tiempo, una meta que cumplir. Aceptarla no es ceder.',
  'Aceptar, rechazar la manera, proponer. Si se salta el primer movimiento suena a evasiva; si se salta el tercero, la conversación vuelve al marco de antes.',
  'El marco propio se escribe en una frase: de qué va esta conversación, qué se decide hoy y qué no se discute. Quien llega sin él adopta el ajeno por educación.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Le expliqué durante veinte minutos todos los costos que tiene el proyecto".', g1: 'Explicar los costos es contestar dentro del marco de que hay que justificar el cobro, y cuanto más se explica, más se confirma que había algo que justificar.', g2: 'Se nombra el marco y se cambia: «no cobro la educación, cobro el trabajo de hacerla; ¿cómo se sostiene esto el año que viene si no?». Después ya se puede hablar de números.' },
  { txt: '"Me dijeron que era básico y me puse a enumerar funciones".', g1: 'Enumerar funciones acepta la comparación que eligió el otro, y en esa comparación se pierde siempre, porque está elegida para que se pierda.', g2: 'Se pregunta «¿comparado con qué?» sin ironía. Hoy la alternativa real de esa maestra es una fotocopia, y contra eso se mide.' },
  { txt: '"Como solo eran esas dos opciones, elegí la menos mala".', g1: 'Cuando las dos opciones convienen a quien las ofrece, elegir es perder despacio. Y ninguna de las dos era esperar, que casi siempre es una opción de verdad.', g2: 'Se nombra la tercera salida, más pequeña y más pronto, y se propone con fecha para que no suene a evasiva.' },
  { txt: '"Me pidió que demostrara que funciona y me pasé la reunión demostrando".', g1: 'La carga de la prueba cayó de un lado sin que nadie lo decidiera, y quien la carga trabaja el doble y aun así no convence.', g2: 'Antes de demostrar nada: «¿qué tendrías que ver para darlo por bueno?». Eso reparte la carga y además convierte la prueba en algo alcanzable.' },
  { txt: '"Era solo un logo, así que dije que sí sin pensarlo".', g1: 'El «solo» encoge la petición antes de mirarla. Y casi nunca viene solo: la siguiente petición llega con el mismo «solo» y ya con un precedente.', g2: 'Se quita la palabra y se vuelve a leer: «un logotipo en la portada de todo el material». Dicho así, se decide con la cabeza y no con la cortesía.' },
  { txt: '"Me dijo que si me importaran los niños lo daría gratis, y me sentí culpable".', g1: 'Ese es el marco moral funcionando: cualquier respuesta dentro de él deja mal, incluso la verdadera.', g2: 'Se acepta el valor y se amplía el recorte: «me importan, y por eso quiero que esto exista el año que viene; lo gratis se apaga en marzo». No acusa a nadie y cambia el terreno.' },
]);

B.critDecisionBank = JSON.stringify([
  '«¿Por qué cobras si es educación?»: ¿qué contestas, y en qué orden pones los tres movimientos?',
  '«Comparado con una plataforma de verdad esto es básico»: ¿cómo cambias el punto de comparación sin sonar defensivo?',
  '«O te adaptas a la plataforma del Estado o te quedas fuera»: ¿cuál es la tercera salida y cómo la propones?',
  '«Demuéstrame que funciona»: ¿qué preguntas antes de ponerte a demostrar nada?',
  '«Es solo un logo en la portada»: ¿cómo lees la petición sin el «solo» y qué contestas?',
  '«Si de verdad te importaran los niños sería gratis»: ¿cómo se sale de un marco moral sin quedar mal?',
  '«Nosotros ponemos la plataforma, ustedes el contenido»: ¿qué se decidió ahí sin discutirlo?',
  '«Estás perdiendo la oportunidad»: ¿cómo se cuenta lo mismo en términos de lo que se conserva?',
]);

B.critDecisionGuide = `'La respuesta correcta en esta etapa sigue siempre el mismo orden: primero se nombra qué da por hecho el marco, que casi nunca se dijo en voz alta; después se acepta la preocupación legítima que hay debajo, porque casi siempre la hay y sin ese paso todo lo demás suena a evasiva; después se rechaza la manera de plantearlo, no a la persona; y al final se propone el marco propio, mejor en forma de pregunta, para que la otra parte entre en él por su cuenta. Si al terminar la conversación uno se ha pasado el rato justificándose, el marco era ajeno y la discusión estaba perdida desde la primera frase, por mucha razón que se tuviera en cada argumento.'`;

B.critCompareBank = JSON.stringify([
  { a: '«¿Comparado con qué? Hoy la maestra usa una fotocopia».', b: 'Enumerar las funciones que sí tiene el material.', ga: 'Caso A: saca a la luz el punto de comparación y devuelve la conversación al terreno real, donde el material gana.', gb: 'Caso B: acepta una comparación elegida para perder, y cuanto más se enumera, más pequeño parece.' },
  { a: '«¿Qué tendrías que ver para darlo por bueno?».', b: 'Ponerse a enseñar todos los datos que se tengan.', ga: 'Caso A: reparte la carga de la prueba y convierte una exigencia infinita en una lista concreta.', gb: 'Caso B: carga con una prueba que nadie definió, así que nunca es suficiente por mucho que se enseñe.' },
  { a: '«Me importan, y por eso quiero que exista el año que viene».', b: '«Claro que me importan, mira todo lo que llevo hecho».', ga: 'Caso A: acepta el valor invocado y amplía el recorte hacia lo que de verdad se está decidiendo.', gb: 'Caso B: se queda dentro del marco moral, donde defenderse ya parece una confesión.' },
  { a: '«Hay una tercera: que las fichas funcionen al lado, en papel».', b: 'Elegir la menos mala de las dos opciones ofrecidas.', ga: 'Caso A: nombra la salida que la disyuntiva ocultaba, y suele ser más pequeña y más pronto.', gb: 'Caso B: elegir entre dos opciones que convienen al otro es perder despacio y con permiso.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se contesta al contenido antes de mirar el marco.', guide: 'Se puede tener razón en cada argumento y perder la conversación entera, porque se estuvo respondiendo a la pregunta equivocada.' },
  { cause: 'Se acepta el punto de comparación que eligió el otro.', guide: 'La conclusión ya estaba decidida cuando se eligió la comparación, así que la discusión solo sirve para confirmarla.' },
  { cause: 'Se elige entre las dos opciones que ofrecieron.', guide: 'Cuando las dos convienen a quien las ofrece, elegir es perder despacio. Y casi nunca está la de esperar, que suele ser la mejor.' },
  { cause: 'Se carga con una prueba que nadie definió.', guide: 'Sin saber qué habría que ver para darlo por bueno, ninguna cantidad de datos alcanza, y quien demuestra queda siempre en deuda.' },
  { cause: 'Se acepta un «solo» sin quitarle la palabra.', guide: 'La petición entra encogida y crea un precedente, así que la siguiente llega con el mismo «solo» y con la puerta ya abierta.' },
  { cause: 'Se entra en el marco moral a defenderse.', guide: 'Dentro de ese marco cualquier respuesta deja mal, incluso la verdadera, porque el terreno ya no es la decisión sino el carácter.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'La conversación sobre el precio duró tres minutos y terminó bien.', guide: 'Se nombró el marco al principio: no se cobra la educación, se cobra el trabajo de hacerla. Después los números fueron fáciles.' },
  { effect: 'La palabra «básico» no volvió a aparecer.', guide: 'Se preguntó «¿comparado con qué?» y quedó claro que la alternativa real era una fotocopia, no una plataforma de millones.' },
  { effect: 'Apareció una opción que nadie había puesto sobre la mesa.', guide: 'Se buscó la tercera salida en vez de elegir entre las dos ofrecidas, y era más pequeña y más pronto que las dos.' },
  { effect: 'La demostración duró diez minutos y bastó.', guide: 'Antes de enseñar nada se preguntó qué habría que ver para darlo por bueno, así que se enseñó exactamente eso.' },
  { effect: 'El logotipo se aceptó y la autoría no se tocó.', guide: 'Se leyó la petición sin el «solo», así que se vio lo que se pedía de verdad y se pudo negociar pieza por pieza.' },
  { effect: 'Nadie salió de la reunión sintiéndose acusado.', guide: 'El reencuadre empezó aceptando la preocupación de fondo, que es lo que permite cambiar de marco sin que parezca una esquiva.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🖼️', label: 'Qué es el marco', text: 'La <strong>manera de plantear algo</strong>, que decide de qué se discute. <strong>Decide:</strong> la conversación entera. <strong>Se rompe:</strong> al contestar el contenido sin mirarlo. <strong>En M.E.T.A.S:</strong> «¿por qué cobras si es educación?» ya dio por hecho que se regala.' },
  { y: '2', icon: '🚨', label: 'La señal', text: 'Notar que <strong>te estás justificando</strong>. <strong>Decide:</strong> si te das cuenta a tiempo. <strong>Se rompe:</strong> cuando justificarse se confunde con explicar bien. <strong>En M.E.T.A.S:</strong> veinte minutos enumerando costos son veinte minutos dentro del marco ajeno.' },
  { y: '3', icon: '❓', label: 'La pregunta cargada', text: 'La que <strong>ya trae la respuesta dentro</strong>. <strong>Decide:</strong> qué se da por aceptado. <strong>Se rompe:</strong> al contestar con un número. <strong>En M.E.T.A.S:</strong> «¿cuánto descuento me hace?» se contesta con lo que incluye el precio, no con una cifra.' },
  { y: '4', icon: '📐', label: 'La comparación', text: 'Caro o básico, <strong>siempre respecto a algo</strong> que no se dijo. <strong>Decide:</strong> la conclusión. <strong>Se rompe:</strong> al aceptar la comparación ajena. <strong>En M.E.T.A.S:</strong> la alternativa real de la maestra es una fotocopia.' },
  { y: '5', icon: '🚪', label: 'La disyuntiva', text: 'Dos opciones que <strong>convienen a quien las ofrece</strong>. <strong>Decide:</strong> si aparece la tercera salida. <strong>Se rompe:</strong> al elegir la menos mala. <strong>En M.E.T.A.S:</strong> las fichas en papel funcionan al lado de cualquier plataforma.' },
  { y: '6', icon: '⚖️', label: 'La carga', text: 'A quién le toca <strong>demostrar</strong>, repartido sin decirlo. <strong>Decide:</strong> quién trabaja el doble. <strong>Se rompe:</strong> al demostrar sin preguntar qué basta. <strong>En M.E.T.A.S:</strong> «¿qué tendrías que ver para darlo por bueno?».' },
  { y: '7', icon: '🔄', label: 'El reencuadre', text: '<strong>Aceptar, rechazar la manera, proponer.</strong> <strong>Decide:</strong> si se cambia de terreno sin pelear. <strong>Se rompe:</strong> al saltarse el primer paso. <strong>En M.E.T.A.S:</strong> sin aceptar la preocupación, todo lo demás suena a evasiva.' },
]);

B.parteData = JSON.stringify({
  marco: {
    nombre: 'El marco', icon: '🖼️',
    estructura: { title: 'Qué es', info: '• La <strong>manera de plantear</strong> una situación<br>• Decide de qué se discute y de qué no<br>• No es una mentira: es una <strong>verdad recortada</strong>' },
    funcion: { title: 'Cómo se detecta', info: '• Por la señal: <strong>te estás justificando</strong><br>• Preguntándose qué da por hecho la frase sin decirlo<br>• Y mirando a quién le conviene que se discuta eso' },
    enfermedades: { title: 'Dónde se pierde', info: '• Al contestar el contenido antes de mirar el marco<br>• Al confundir justificarse con explicar bien<br>• Al creer que tener razón en cada argumento basta' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• El marco que más aparece: <strong>lo educativo se regala</strong><br>• Y el que más caro sale: <strong>quién es el dueño</strong> de lo que se haga en conjunto<br>• Los dos se desarman nombrándolos' },
  },
  referencia: {
    nombre: 'El punto de comparación', icon: '📐',
    estructura: { title: 'Qué es', info: '• Caro, barato, básico o avanzado: <strong>siempre respecto a algo</strong><br>• Ese algo casi nunca se dice en voz alta<br>• Quien elige la comparación ya eligió la conclusión' },
    funcion: { title: 'Cómo se detecta', info: '• Con una pregunta corta y sin ironía: <strong>«¿comparado con qué?»</strong><br>• Buscando cuál es la alternativa <strong>real</strong> de quien decide<br>• Y diciendo la propia comparación antes de que la pongan' },
    enfermedades: { title: 'Dónde se pierde', info: '• Al enumerar funciones para defenderse<br>• Al aceptar que el rival es una plataforma grande<br>• Al comparar con lo que se quiere ser, no con lo que hay' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• La alternativa real de la maestra de sexto no es una plataforma: es <strong>la fotocopia de ayer</strong> o nada<br>• Contra eso se mide, y contra eso el material gana' },
  },
  prueba: {
    nombre: 'La carga de la prueba', icon: '⚖️',
    estructura: { title: 'Qué es', info: '• A quién le toca <strong>demostrar</strong> lo que se afirma<br>• Es el marco más invisible: se reparte sin decirlo<br>• Regla justa: <strong>la enseña quien afirma</strong>' },
    funcion: { title: 'Cómo se detecta', info: '• Mirando quién está trabajando en la conversación<br>• Antes de demostrar nada: <strong>«¿qué tendrías que ver para darlo por bueno?»</strong><br>• Eso convierte una exigencia infinita en una lista' },
    enfermedades: { title: 'Dónde se pierde', info: '• Al ponerse a enseñar datos sin saber cuáles bastan<br>• Al aceptar demostrar algo que nadie ha definido<br>• Al confundir «probar que sirve» con «probar que es lo mejor»' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• Lo que sí se puede enseñar: la <strong>ficha impresa</strong> y la aplicación abierta en un teléfono<br>• Y lo que hay que decir uno mismo: falta que lo revise un maestro de fuera' },
  },
  reencuadre: {
    nombre: 'El reencuadre', icon: '🔄',
    estructura: { title: 'Qué es', info: '• Cambiar el marco <strong>sin pelear</strong><br>• Tres movimientos: aceptar, rechazar la manera, proponer<br>• El primero no se puede saltar' },
    funcion: { title: 'Cómo se detecta', info: '• Se acepta la <strong>preocupación de fondo</strong>, que casi siempre es real<br>• Se nombra el marco en voz alta y sin agresividad<br>• Se propone el propio, mejor <strong>en forma de pregunta</strong>' },
    enfermedades: { title: 'Dónde se pierde', info: '• Al saltarse el primer paso: entonces suena a evasiva<br>• Al reencuadrar acusando a la persona en vez de a la manera<br>• Al no proponer nada, que devuelve la conversación al marco de antes' },
    cuidados: { title: 'Cómo está en M.E.T.A.S', info: '• El reencuadre de la casa, ya probado: <strong>«no cobro la educación, cobro el trabajo de hacerla»</strong><br>• Y el que hace falta tener escrito: <strong>de qué va esta conversación y qué se decide hoy</strong>' },
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
  [/🪞 \*Ruta de la Persuasión · Etapa 2\* 🪞/g, '🖼️ *Ruta de la Persuasión · Etapa 3* 🖼️'],
  [/Ruta de la Persuasión · Etapa 2: Sesgos/g, 'Ruta de la Persuasión · Etapa 3: Marcos'],
  [/completó la Etapa 2 de la Ruta de la Persuasión/g, 'completó la Etapa 3 de la Ruta de la Persuasión'],
  [/La sala de espejos/g, 'Quién puso el marco'],
  [/la sala de espejos/g, 'quién puso el marco'],
  [/Sesgos, los atajos que deciden por ti/g, 'Marcos, quien pone el marco gana la conversación'],
  [/Sesgos: los atajos que deciden por ti/g, 'Marcos: quien pone el marco gana la conversación'],
  [/Ruta de la Persuasión · Autocapacitación Técnica/g, 'Ruta de la Persuasión · Etapa 3 · Psicología y Persuasión'],
  [/\bSesgos\b/g, 'Marcos'],
  [/🪞 ¡/g, '🖼️ ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEnc.length) console.log('NO ENCONTRADOS: ' + noEnc.join(', '));
