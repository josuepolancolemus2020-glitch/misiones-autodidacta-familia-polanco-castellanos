/* Inyecta los bancos de la misión «Para quién y qué le cambia» (Ruta de la Marca,
   etapa 1) sobre el molde copiado de la misión de Poder Político.
   Uso:  node _dev/inyecta-bancos-marca.js
   Reemplaza líneas completas que empiezan por `const <nombre>=`. */

const fs = require('fs');
const path = require('path');
const ARCHIVO = path.join(__dirname, '..', 'misiones', 'ruta-marca-audiencia-promesa', 'js', 'audiencia-promesa.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260727;
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
      const rf = r0 + dr * (w.length - 1), cf = c0 + dc * (w.length - 1);
      if (rf >= size || cf >= size) continue;
      let cabe = true;
      for (let i = 0; i < w.length; i++) {
        const ch = grid[r0 + dr * i][c0 + dc * i];
        if (ch !== null && ch !== w[i]) { cabe = false; break; }
      }
      if (!cabe) continue;
      const cells = [];
      for (let i = 0; i < w.length; i++) {
        grid[r0 + dr * i][c0 + dc * i] = w[i];
        cells.push([r0 + dr * i, c0 + dc * i]);
      }
      salida.push({ w, cells });
      puesto = true;
    }
    if (!puesto) throw new Error('No cupo la palabra ' + w);
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++)
    if (grid[r][c] === null) grid[r][c] = ABC[Math.floor(rnd() * ABC.length)];
  return { size, grid, words: salida };
}

const sopaSets = [
  haceSopa(10, ['PROMESA', 'MARCA', 'DOLOR', 'PRUEBA', 'NICHO', 'LOGO']),
  haceSopa(10, ['AUDIENCIA', 'BENEFICIO', 'MAESTRA', 'RELATO', 'FICHA', 'BOCA']),
  haceSopa(10, ['CLIENTA', 'ETIQUETA', 'PUBLICO', 'DOCE', 'SELLO', 'VALOR']),
];

/* ---------- bancos ---------- */
const B = {};

B.SAVE_KEY = `'faro_mkt_promesa_v1'`;

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la promesa superado' },
  flash_master: { icon: '🃏', label: 'Todos los términos de la marca explorados' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de característica y beneficio experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas de la marca maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la marca' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta de la Marca completada' },
});

B.lvls = JSON.stringify([
  { t: 0, n: 'Vendedor de humo 🌫️' },
  { t: 25, n: 'Dueño de un logo 🏷️' },
  { t: 55, n: 'Lector de audiencias 👀' },
  { t: 90, n: 'Traductor de beneficios ❤️' },
  { t: 130, n: 'Escritor de promesas ✍️' },
  { t: 165, n: 'Constructor de prueba 📄' },
  { t: 190, n: 'Marca que se recuerda 📈' },
]);

B.fcData = JSON.stringify([
  { w: 'Marca', a: '📈 La <strong>promesa que alguien recuerda</strong> cuando uno no está presente. No es el logo: el logo solo es la etiqueta que le ponemos a esa frase.' },
  { w: 'Audiencia', a: '🎯 La persona concreta para quien es esto, con su hora del día y su problema del lunes. Si no se puede describir con nombre y situación, todavía no está elegida.' },
  { w: 'Promesa', a: '📣 Lo que le cambia a esa persona, en una frase corta y verificable. Cabe en <strong>doce palabras</strong> o todavía no se decidió para quién es.' },
  { w: 'Característica', a: '🔧 Lo que el trabajo <strong>es o tiene</strong>: 57 misiones, funciona sin internet, ficha de diez páginas. Es verdad y es necesaria, pero le habla al producto.' },
  { w: 'Beneficio', a: '❤️ Lo que <strong>le cambia a quien lo usa</strong>: no preparar la clase a medianoche. Es la misma característica contada desde el otro lado de la mesa.' },
  { w: 'La regla del «para que»', a: '⚙️ Toda característica se traduce con dos palabras. Funciona sin internet <strong>para que</strong> la clase no dependa de la señal. Si después del «para que» no aparece una persona, no es un beneficio.' },
  { w: 'Prueba', a: '📄 Algo que se puede tocar hoy: una ficha impresa, una misión abierta en el teléfono, una maestra que lo diga con su nombre. <strong>Promesa sin prueba es publicidad.</strong>' },
  { w: 'El trabajo por hacer', a: '🔨 Para qué te contrata de verdad esa persona. La maestra no quiere una aplicación: quiere <strong>terminar de calificar</strong> y que la clase no se le caiga.' },
  { w: 'Nicho', a: '🎯 La franja estrecha donde uno es la mejor opción. Se gana audiencia amplia <strong>estrechando</strong>, no ampliando: «las mejores fichas de sexto» abre más puertas que «material educativo variado».' },
  { w: 'Todo el mundo', a: '🚫 La audiencia que no existe. Si el mensaje sirve igual a una maestra, a un ingeniero y a un abuelo, ninguno se reconoce en él y ninguno lo repite.' },
  { w: 'Diferencia', a: '✨ Por qué esto y no lo que ya existe. No es ser mejor en todo: es ser <strong>claramente distinto en lo que a esa persona le importa</strong>.' },
  { w: 'Identidad visual', a: '🎨 El logo, los colores y la tipografía. Va <strong>al final</strong>, cuando ya hay promesa que etiquetar. Antes de eso es la etiqueta de un frasco vacío.' },
  { w: 'Boca a boca', a: '🗣️ La marca de verdad: lo que una maestra le dice a otra cuando uno no está. Solo se repite lo que se entendió y se pudo comprobar.' },
  { w: 'Número inflado', a: '🚨 La cifra grande que nadie puede verificar. Una sola pregunta la derriba y se lleva también lo que sí era cierto. Mejor un número chico con fecha.' },
  { w: 'Marca blanca', a: '🏷️ Que el trabajo circule con el sello de otro. El material llega lejos y la reputación se queda en otra parte: se puede rehacer una ficha, no se puede volver a ser el primero.' },
  { w: 'Público prestado', a: '📱 La audiencia que vive en la casa de otro. Al terminar el acuerdo se devuelve completa. Toda colaboración debe dejar algo que se queda: el nombre y el enlace propio.' },
]);

B.qzData = JSON.stringify([
  { q: '¿Qué es la marca, según esta etapa?', o: ['a) El logo, los colores y la tipografía', 'b) La promesa que alguien recuerda cuando uno no está', 'c) La cantidad de seguidores que se tienen', 'd) El nombre registrado del proyecto'], c: 1 },
  { q: '«Las misiones funcionan sin internet». ¿Qué es esa frase?', o: ['a) Una característica', 'b) Un beneficio', 'c) Una promesa completa', 'd) Una prueba'], c: 0 },
  { q: '¿Cómo se traduce una característica en beneficio?', o: ['a) Agregándole adjetivos', 'b) Poniéndola en mayúsculas', 'c) Completándola con «para que» hasta que aparezca una persona', 'd) Diciendo que es la mejor del mercado'], c: 2 },
  { q: '¿Por qué «para todo el mundo» no funciona como audiencia?', o: ['a) Porque es muy caro llegar a tantos', 'b) Porque nadie se reconoce en un mensaje tan general', 'c) Porque la ley lo prohíbe', 'd) Porque hace falta más presupuesto'], c: 1 },
  { q: 'Una promesa sin prueba es…', o: ['a) Una promesa fuerte', 'b) Publicidad', 'c) Una característica', 'd) Un beneficio'], c: 1 },
  { q: '¿Qué quiere de verdad la maestra a las nueve de la noche?', o: ['a) Una aplicación con buen diseño', 'b) Aprendizaje gamificado', 'c) Tener mañana la clase lista', 'd) Un certificado de participación'], c: 2 },
  { q: '¿Cuándo se decide el nombre y el logo?', o: ['a) Al final, cuando ya hay promesa que etiquetar', 'b) Al principio, para darle identidad', 'c) Cuando llega el primer patrocinador', 'd) Cuando lo pide la escuela'], c: 0 },
  { q: 'Alguien propone poner «usado por miles de maestros» sin tener el dato. ¿Qué falla?', o: ['a) Que suena poco profesional', 'b) Que es una promesa sin prueba y derriba lo que sí era cierto', 'c) Que es una frase muy larga', 'd) Que no menciona el logo'], c: 1 },
  { q: 'Una editorial ofrece distribuir las fichas con su sello y el autor en los créditos. ¿Qué se está cediendo?', o: ['a) El dinero de la impresión', 'b) El contenido pedagógico', 'c) La marca: quien lo recuerde recordará a la editorial', 'd) Nada importante, porque el material llega lejos'], c: 2 },
  { q: '¿Cuál es la mejor prueba de que la promesa está aprendida?', o: ['a) Que el logo se vea bien en el teléfono', 'b) Que otra persona pueda repetirla de memoria sin cambiarla', 'c) Que tenga muchas palabras técnicas', 'd) Que la apruebe un experto en publicidad'], c: 1 },
]);

B.classGroups = JSON.stringify([
  {
    label: ['Característica', 'Beneficio'], headA: '🔧 Característica', headB: '❤️ Beneficio', colA: 'ok', colB: 'no',
    words: [
      { w: 'Tiene 57 misiones', t: 'ok' }, { w: 'No prepara la clase a medianoche', t: 'no' },
      { w: 'Funciona sin internet', t: 'ok' }, { w: 'El niño sigue estudiando aunque no haya luz', t: 'no' },
      { w: 'La ficha tiene diez páginas', t: 'ok' }, { w: 'Llega al aula sin preparar nada', t: 'no' },
      { w: 'Está en tres idiomas', t: 'ok' }, { w: 'No gasta los datos del mes', t: 'no' },
    ],
  },
  {
    label: ['Promesa', 'Adorno'], headA: '📣 Promesa', headB: '🎨 Adorno', colA: 'ok', colB: 'no',
    words: [
      { w: 'Mañana tienes la clase lista', t: 'ok' }, { w: 'Un logo moderno y limpio', t: 'no' },
      { w: 'Se imprime y se usa sin cuenta', t: 'ok' }, { w: 'Colores llamativos en la portada', t: 'no' },
      { w: 'Sigue funcionando sin señal', t: 'ok' }, { w: 'Un nombre en inglés', t: 'no' },
      { w: 'La ficha trae la pauta resuelta', t: 'ok' }, { w: 'Tipografía más profesional', t: 'no' },
    ],
  },
  {
    label: ['Audiencia concreta', 'Todo el mundo'], headA: '🎯 Audiencia concreta', headB: '🌍 Todo el mundo', colA: 'ok', colB: 'no',
    words: [
      { w: 'Maestra de sexto que enseña fracciones', t: 'ok' }, { w: 'Cualquier persona que quiera aprender', t: 'no' },
      { w: 'Madre con un solo teléfono y datos contados', t: 'ok' }, { w: 'La comunidad educativa en general', t: 'no' },
      { w: 'Director que teme los teléfonos en el aula', t: 'ok' }, { w: 'Todos los grados y todas las materias', t: 'no' },
      { w: 'Negocio del barrio que quiere que lo vean', t: 'ok' }, { w: 'El público interesado en educación', t: 'no' },
    ],
  },
  {
    label: ['Con prueba', 'Sin prueba'], headA: '📄 Con prueba', headB: '🚨 Sin prueba', colA: 'ok', colB: 'no',
    words: [
      { w: '43 fichas publicadas desde febrero', t: 'ok' }, { w: 'Usado por miles de maestros', t: 'no' },
      { w: 'Tres centros lo usan, con nombre', t: 'ok' }, { w: 'El favorito de los docentes', t: 'no' },
      { w: 'La ficha se abre y se imprime hoy', t: 'ok' }, { w: 'Resultados comprobados', t: 'no' },
      { w: 'Una maestra lo dice y da su nombre', t: 'ok' }, { w: 'Reconocido a nivel nacional', t: 'no' },
    ],
  },
]);

B.idData = JSON.stringify([
  { s: ['La', 'marca', 'es', 'la', 'promesa', 'que', 'se', 'recuerda.'], c: 1, art: 'La palabra que se confunde con el logo' },
  { s: ['Toda', 'característica', 'se', 'traduce', 'con', 'para', 'que.'], c: 1, art: 'Lo que el producto es o tiene' },
  { s: ['El', 'beneficio', 'es', 'lo', 'que', 'le', 'cambia', 'a', 'ella.'], c: 1, art: 'La característica vista desde el otro lado' },
  { s: ['Una', 'promesa', 'sin', 'prueba', 'es', 'publicidad.'], c: 1, art: 'Lo que se ofrece en una frase' },
  { s: ['La', 'audiencia', 'se', 'elige', 'estrecha', 'y', 'concreta.'], c: 1, art: 'Para quién es esto exactamente' },
  { s: ['El', 'logo', 'va', 'al', 'final,', 'nunca', 'al', 'principio.'], c: 1, art: 'La etiqueta, no el contenido' },
  { s: ['La', 'prueba', 'es', 'algo', 'que', 'se', 'toca', 'hoy.'], c: 1, art: 'Lo que sostiene la promesa' },
  { s: ['El', 'nicho', 'se', 'gana', 'estrechando,', 'no', 'ampliando.'], c: 1, art: 'La franja donde uno es la mejor opción' },
]);

B.cmpData = JSON.stringify([
  { s: 'La marca es la ___ que alguien recuerda cuando uno no está.', opts: ['promesa', 'imagen', 'oferta'], c: 0 },
  { s: 'Lo que el producto es o tiene se llama ___.', opts: ['característica', 'beneficio', 'prueba'], c: 0 },
  { s: 'Lo que le cambia a quien lo usa se llama ___.', opts: ['beneficio', 'característica', 'adorno'], c: 0 },
  { s: 'Una promesa sin prueba es solo ___.', opts: ['publicidad', 'estrategia', 'diferencia'], c: 0 },
  { s: 'Para traducir una característica se le agrega «___ que».', opts: ['para', 'porque', 'aunque'], c: 0 },
  { s: 'La audiencia que sirve para todos no le sirve a ___.', opts: ['nadie', 'todos', 'muchos'], c: 0 },
  { s: 'El nombre y el logo se deciden al ___.', opts: ['final', 'principio', 'inicio'], c: 0 },
  { s: 'La promesa de M.E.T.A.S cabe en ___ palabras.', opts: ['doce', 'cuarenta', 'cien'], c: 0 },
]);

B.retoPairs = JSON.stringify([
  {
    label: ['Característica', 'Beneficio'], btnA: '🔧 Característica', btnB: '❤️ Beneficio', colA: 'ok', colB: 'no',
    words: [
      { w: 'Tiene 57 misiones', t: 'ok' }, { w: 'No trasnocha preparando', t: 'no' },
      { w: 'Funciona sin internet', t: 'ok' }, { w: 'Estudia aunque no haya luz', t: 'no' },
      { w: 'Ficha de diez páginas', t: 'ok' }, { w: 'Llega listo al aula', t: 'no' },
      { w: 'Está en tres idiomas', t: 'ok' }, { w: 'No gasta datos del mes', t: 'no' },
      { w: 'Trae pauta incluida', t: 'ok' }, { w: 'Califica más rápido', t: 'no' },
    ],
  },
  {
    label: ['Promesa', 'Adorno'], btnA: '📣 Promesa', btnB: '🎨 Adorno', colA: 'ok', colB: 'no',
    words: [
      { w: 'Mañana tienes la clase lista', t: 'ok' }, { w: 'Logo moderno', t: 'no' },
      { w: 'Se usa sin crear cuenta', t: 'ok' }, { w: 'Colores llamativos', t: 'no' },
      { w: 'Sigue sin señal', t: 'ok' }, { w: 'Nombre en inglés', t: 'no' },
      { w: 'Pauta resuelta incluida', t: 'ok' }, { w: 'Tipografía elegante', t: 'no' },
      { w: 'Se imprime en la pulpería', t: 'ok' }, { w: 'Tarjetas de presentación', t: 'no' },
    ],
  },
  {
    label: ['Con prueba', 'Sin prueba'], btnA: '📄 Con prueba', btnB: '🚨 Sin prueba', colA: 'ok', colB: 'no',
    words: [
      { w: '43 fichas desde febrero', t: 'ok' }, { w: 'Usado por miles', t: 'no' },
      { w: 'Tres centros con nombre', t: 'ok' }, { w: 'El favorito de todos', t: 'no' },
      { w: 'Se abre e imprime hoy', t: 'ok' }, { w: 'Resultados comprobados', t: 'no' },
      { w: 'Una maestra da su nombre', t: 'ok' }, { w: 'Reconocido nacionalmente', t: 'no' },
      { w: '57 misiones publicadas', t: 'ok' }, { w: 'Líder del mercado', t: 'no' },
    ],
  },
]);

B.routeSets = JSON.stringify([
  { label: 'Cómo se construye una promesa, en orden', steps: ['Elegir una audiencia concreta, aunque parezca que se pierde el resto', 'Nombrar su dolor con sus palabras, no con las nuestras', 'Escribir el resultado en una frase corta y verificable', 'Buscar la prueba que se pueda tocar hoy', 'Decirla en voz alta y ver si la repiten sin cambiarla', 'Y solo al final, ponerle nombre y logo'] },
  { label: 'Qué se hace cuando llega un patrocinador', steps: ['Escribir qué mete la oferta y qué saca, más allá del dinero', 'Preguntarse qué lee la maestra al ver la portada', 'Definir el espacio que sí se cede y el que no', 'Publicar las reglas iguales para todos', 'Firmar el tamaño y el lugar del logo por escrito'] },
  { label: 'Cómo se responde a «¿y eso qué es?»', steps: ['Decir para quién es', 'Decir qué le cambia a esa persona', 'Dar la prueba que puede comprobar hoy', 'Decir dónde encontrarlo', 'Callarse y escuchar qué preguntó de vuelta'] },
]);

B.neuronPartes = JSON.stringify([
  { desc: 'Para quién es esto exactamente, con su hora y su problema', ans: 'La audiencia', opts: ['La audiencia', 'La promesa', 'La prueba', 'El logo'] },
  { desc: 'Lo que le duele hoy a esa persona, dicho con sus palabras', ans: 'El dolor', opts: ['El dolor', 'La diferencia', 'El nombre', 'El canal'] },
  { desc: 'Para qué te contrata de verdad: terminar de calificar, no tener una aplicación', ans: 'El trabajo por hacer', opts: ['El trabajo por hacer', 'La característica', 'El logo', 'El nicho'] },
  { desc: 'Lo que le cambia, en una frase corta y verificable', ans: 'La promesa', opts: ['La promesa', 'La audiencia', 'El adorno', 'La etiqueta'] },
  { desc: 'Algo que se puede tocar hoy y comprobar sin creer en nadie', ans: 'La prueba', opts: ['La prueba', 'El dolor', 'La diferencia', 'El nombre'] },
  { desc: 'Por qué esto y no lo que ya existe, en lo que a esa persona le importa', ans: 'La diferencia', opts: ['La diferencia', 'La promesa', 'La prueba', 'La audiencia'] },
  { desc: 'La etiqueta que se le pone a todo lo anterior, y que va al final', ans: 'El nombre y el logo', opts: ['El nombre y el logo', 'El trabajo por hacer', 'El dolor', 'La prueba'] },
  { desc: 'Lo que una maestra le dice a otra cuando uno no está presente', ans: 'El boca a boca', opts: ['El boca a boca', 'La característica', 'El nicho', 'El adorno'] },
]);

B.neuroPairs = JSON.stringify([
  { trans: 'Las misiones funcionan sin internet', func: 'La clase no depende de la señal ni de los datos del mes', opts: ['La clase no depende de la señal ni de los datos del mes', 'La aplicación usa tecnología moderna', 'El sistema es más barato de mantener', 'Se puede programar sin servidor'] },
  { trans: 'La ficha trae la pauta resuelta', func: 'La maestra califica sin volver a resolver el ejercicio', opts: ['La maestra califica sin volver a resolver el ejercicio', 'La ficha tiene más páginas', 'El documento se ve más completo', 'Se imprime a doble cara'] },
  { trans: 'Las misiones están en tres idiomas', func: 'El estudiante que va a examen de inglés practica con lo mismo que ya usa', opts: ['El estudiante que va a examen de inglés practica con lo mismo que ya usa', 'El proyecto se ve internacional', 'Hay más contenido publicado', 'Se traduce automáticamente'] },
  { trans: 'La misión pesa poco y abre rápido', func: 'La madre con datos contados no elige entre estudiar y tener saldo', opts: ['La madre con datos contados no elige entre estudiar y tener saldo', 'El sitio ocupa menos espacio', 'La programación es más limpia', 'Se puede alojar gratis'] },
  { trans: 'La ficha se imprime en blanco y negro', func: 'Se saca en cualquier pulpería del barrio por dos lempiras', opts: ['Se saca en cualquier pulpería del barrio por dos lempiras', 'Se ahorra tinta de color', 'El diseño es más sobrio', 'Se ve mejor en fotocopia'] },
]);

B.enfermedadData = JSON.stringify([
  { disease: 'Le gustó a todos y no lo usó nadie', characteristic: 'La promesa era tan general que nadie se reconoció en ella', opts: ['La promesa era tan general que nadie se reconoció en ella', 'Faltó presupuesto de publicidad', 'El logo no era bonito', 'No estaba en redes sociales'] },
  { disease: 'Se gastó todo en el logo y la maestra sigue preguntando para qué sirve', characteristic: 'Se empezó por la etiqueta antes de tener promesa', opts: ['Se empezó por la etiqueta antes de tener promesa', 'El diseñador cobró de más', 'Los colores estaban mal elegidos', 'Faltaba una tarjeta de presentación'] },
  { disease: 'Preguntaron «¿cuántos maestros exactamente?» y no hubo respuesta', characteristic: 'Se publicó un número que nadie podía verificar', opts: ['Se publicó un número que nadie podía verificar', 'La pregunta fue malintencionada', 'Faltó un estudio de mercado', 'El dato estaba desactualizado'] },
  { disease: 'La madre lo abrió una vez y no volvió', characteristic: 'La promesa exigía datos que ella no tiene', opts: ['La promesa exigía datos que ella no tiene', 'El contenido era muy difícil', 'No le interesaba la educación', 'Faltaban más colores'] },
  { disease: 'El material circula por todo el país y nadie sabe quién lo hizo', characteristic: 'Se entregó sin exigir el nombre del autor en la portada', opts: ['Se entregó sin exigir el nombre del autor en la portada', 'La distribución fue demasiado rápida', 'El material era muy bueno', 'Faltó registrar la marca'] },
  { disease: 'Terminó el acuerdo con la página grande y no quedó nadie', characteristic: 'El público era prestado y se devolvió completo', opts: ['El público era prestado y se devolvió completo', 'La página incumplió el trato', 'El contenido dejó de gustar', 'Cambió el algoritmo'] },
]);

B.identifyTaskDB = JSON.stringify([
  { s: 'La promesa que alguien recuerda cuando uno no está.', type: 'Marca' },
  { s: 'Lo que el trabajo es o tiene, sin hablar de la persona.', type: 'Característica' },
  { s: 'Lo que le cambia a quien lo usa.', type: 'Beneficio' },
  { s: 'Algo que se puede tocar y comprobar hoy.', type: 'Prueba' },
  { s: 'La persona concreta para quien es esto.', type: 'Audiencia' },
  { s: 'La etiqueta que se pone al final, cuando ya hay promesa.', type: 'Logo' },
  { s: 'La franja estrecha donde uno es la mejor opción.', type: 'Nicho' },
  { s: 'Para qué te contrata de verdad esa persona.', type: 'Trabajo por hacer' },
  { s: 'Lo que una maestra le dice a otra sin que uno esté delante.', type: 'Boca a boca' },
  { s: 'La cifra grande que nadie puede verificar.', type: 'Número inflado' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Tiene 57 misiones', gen: 'Mensaje', n: 'Producto', g: 'Característica', t: 'Habla del producto' },
  { w: 'No trasnocha preparando la clase', gen: 'Mensaje', n: 'Persona', g: 'Beneficio', t: 'Habla de la persona' },
  { w: 'Funciona sin internet', gen: 'Mensaje', n: 'Producto', g: 'Característica', t: 'Habla del producto' },
  { w: 'El niño estudia aunque se vaya la luz', gen: 'Mensaje', n: 'Persona', g: 'Beneficio', t: 'Habla de la persona' },
  { w: 'Maestra de sexto que enseña fracciones', gen: 'Audiencia', n: 'Concreta', g: 'Concreta', t: 'Se puede describir' },
  { w: 'La comunidad educativa en general', gen: 'Audiencia', n: 'Vaga', g: 'Todo el mundo', t: 'No se reconoce nadie' },
  { w: '43 fichas publicadas desde febrero', gen: 'Afirmación', n: 'Verificable', g: 'Con prueba', t: 'Se puede comprobar' },
  { w: 'Usado por miles de maestros', gen: 'Afirmación', n: 'Vaga', g: 'Sin prueba', t: 'Nadie puede comprobarlo' },
  { w: 'Mañana tienes la clase lista', gen: 'Frase', n: 'Promesa', g: 'Promesa', t: 'Dice qué cambia' },
  { w: 'Un logo moderno y limpio', gen: 'Frase', n: 'Adorno', g: 'Adorno', t: 'No dice qué cambia' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La marca es la ___ que alguien recuerda cuando uno no está.', opts: ['promesa', 'imagen', 'oferta'], ans: 'promesa' },
  { s: 'Lo que el producto es o tiene se llama ___.', opts: ['característica', 'beneficio', 'adorno'], ans: 'característica' },
  { s: 'Lo que le cambia a quien lo usa se llama ___.', opts: ['beneficio', 'característica', 'prueba'], ans: 'beneficio' },
  { s: 'Una promesa sin prueba es solo ___.', opts: ['publicidad', 'estrategia', 'diferencia'], ans: 'publicidad' },
  { s: 'Toda característica se traduce agregándole «___ que».', opts: ['para', 'porque', 'aunque'], ans: 'para' },
  { s: 'Una audiencia que sirve para todos no le sirve a ___.', opts: ['nadie', 'todos', 'algunos'], ans: 'nadie' },
  { s: 'El nombre y el logo se deciden al ___.', opts: ['final', 'principio', 'comienzo'], ans: 'final' },
  { s: 'La franja estrecha donde uno es la mejor opción es el ___.', opts: ['nicho', 'canal', 'sello'], ans: 'nicho' },
]);

B.explainQuestions = JSON.stringify([
  { q: 'Explica con tus palabras la diferencia entre característica y beneficio, con un ejemplo de M.E.T.A.S.', ans: 'La característica es lo que el trabajo es o tiene: «la ficha tiene diez páginas», «funciona sin internet». Es verdad y es verificable, pero le habla al producto. El beneficio es lo que eso le cambia a la persona que lo usa: «la maestra llega al aula sin preparar nada», «el niño sigue estudiando aunque se vaya la luz». Se traduce agregando «para que» hasta que aparezca una persona: si después del «para que» solo aparece el producto, todavía es característica.' },
  { q: '¿Por qué «para todo el mundo» no es una audiencia? Da un ejemplo del propio proyecto.', ans: 'Porque un mensaje que sirve igual a una maestra de sexto, a un ingeniero y a un abuelo no hace que ninguno se reconozca en él, y lo que no se reconoce no se repite a un tercero. Cuando una escuela pide material «para todos los grados y todas las materias», el trabajo se reparte tan fino que ninguna materia queda buena y el mensaje se vuelve tan general que nadie lo recomienda. La audiencia amplia se gana estrechando: ser conocido por «las mejores fichas de sexto» abre más puertas que ser conocido por «material educativo variado».' },
  { q: 'Escribe la promesa de M.E.T.A.S en doce palabras y las tres pruebas que la sostienen.', ans: 'Promesa: «Misiones y fichas listas para imprimir: la maestra tiene mañana la clase preparada». Las tres pruebas, todas comprobables hoy: (1) las fichas impresas de diez páginas con su pauta, que llegan al aula sin preparar nada; (2) el Campeonísimo con preguntas de siete materias funcionando, no prometido para después; (3) las misiones abriendo en un teléfono con datos escasos y siguiendo sin conexión. La prueba es lo que separa una promesa de la publicidad.' },
  { q: 'Llega un patrocinador que ofrece 8.000 lempiras por su logo en la portada de las fichas. ¿Qué se cede, qué no y con qué condición se acepta?', ans: 'Se cede espacio de marca, que es real y tiene precio. No se cede la portada, porque es donde la maestra decide en dos segundos si esto es material educativo o publicidad, ni la autoría ni el criterio pedagógico. La condición: logo en la contraportada, con tamaño y lugar definidos por escrito, y reglas de patrocinio publicadas iguales para todos, de modo que el no al siguiente no sea personal sino la regla.' },
  { q: '¿Por qué el nombre y el logo van al final y no al principio?', ans: 'Porque el logo es la etiqueta que se le pone a una promesa, y una etiqueta sobre un frasco vacío no dice nada. Si primero no está claro para quién es y qué le cambia, ningún logo hace que la maestra entienda para qué le sirve. Además, decisiones de imagen tomadas antes de conocer a la audiencia suelen apuntar al lugar equivocado: un nombre en inglés en un centro rural aleja en vez de acercar. Primero audiencia, después promesa, después prueba, y al final el nombre.' },
  { q: '¿Qué es el público prestado y por qué conviene vigilarlo?', ans: 'Es la audiencia que vive en la casa de otro: una página grande que difunde el material a cambio de exclusividad. Mete alcance inmediato, pero al terminar el acuerdo el público sigue siendo de la página y hay que empezar de nuevo. La forma sana de colaborar es sin exclusividad, con el nombre visible y un enlace al sitio propio, de modo que cada publicación deje algo que se queda. La regla: público prestado se devuelve completo.' },
]);

B.sopaSets = JSON.stringify(sopaSets);

B.evalTFBank = JSON.stringify([
  { q: 'La marca es el logo y los colores del proyecto.', a: false },
  { q: 'La marca es la promesa que alguien recuerda cuando uno no está.', a: true },
  { q: '«Funciona sin internet» es una característica, no un beneficio.', a: true },
  { q: 'Una promesa sin prueba se sostiene igual si suena convincente.', a: false },
  { q: 'Toda característica se traduce en beneficio agregándole «para que».', a: true },
  { q: 'Una audiencia que sirve para todo el mundo es la más rentable.', a: false },
  { q: 'El nombre y el logo se deciden al final, cuando ya hay promesa.', a: true },
  { q: 'Un número grande sin fuente convence más que uno chico con fecha.', a: false },
  { q: 'El boca a boca solo repite lo que se entendió y se pudo comprobar.', a: true },
  { q: 'Ceder la portada a un patrocinador no cambia cómo se lee el material.', a: false },
  { q: 'La audiencia amplia se gana estrechando el mensaje, no ampliándolo.', a: true },
  { q: 'El público prestado se queda con el proyecto al terminar el acuerdo.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: '¿Qué es la marca?', o: ['a) El logo y los colores', 'b) La cantidad de seguidores', 'c) El nombre registrado', 'd) La promesa que se recuerda cuando uno no está'], a: 3 },
  { q: '«La ficha tiene diez páginas» es…', o: ['a) Una característica', 'b) Un beneficio', 'c) Una prueba', 'd) Una promesa'], a: 0 },
  { q: '¿Cómo se convierte una característica en beneficio?', o: ['a) Poniéndola en mayúsculas', 'b) Agregándole «para que» hasta que aparezca una persona', 'c) Agregándole adjetivos', 'd) Repitiéndola dos veces'], a: 1 },
  { q: '¿Qué le pasa a una promesa sin prueba?', o: ['a) Se vuelve más atractiva', 'b) Funciona si el logo es bueno', 'c) Es publicidad y no se repite a un tercero', 'd) Se convierte en característica'], a: 2 },
  { q: 'La maestra a las nueve de la noche quiere…', o: ['a) Aprendizaje gamificado', 'b) Un diseño moderno', 'c) Un certificado', 'd) Tener mañana la clase lista'], a: 3 },
  { q: '¿Cuándo se decide el logo?', o: ['a) Al final, para etiquetar la promesa', 'b) Antes que nada', 'c) Cuando llega dinero', 'd) Cuando lo pide la escuela'], a: 0 },
  { q: '¿Qué se cede al aceptar un sello ajeno en la portada?', o: ['a) El dinero de la impresión', 'b) La marca: quien lo recuerde recordará al otro', 'c) El contenido pedagógico', 'd) Nada relevante'], a: 1 },
  { q: '¿Cuál de estas afirmaciones tiene prueba?', o: ['a) Reconocido a nivel nacional', 'b) El favorito de los docentes', 'c) 43 fichas publicadas desde febrero', 'd) Resultados comprobados'], a: 2 },
  { q: '¿Por qué falla «material educativo para todos los grados»?', o: ['a) Porque es caro', 'b) Porque nadie se reconoce en el mensaje', 'c) Porque es ilegal', 'd) Porque falta presupuesto'], a: 1 },
  { q: 'El «trabajo por hacer» de una audiencia es…', o: ['a) La tarea que deja el maestro', 'b) Las horas que trabaja', 'c) El presupuesto que maneja', 'd) Para qué te contrata de verdad'], a: 3 },
  { q: '¿Qué es el público prestado?', o: ['a) La audiencia que vive en la casa de otro y se devuelve', 'b) Los que pagan por el material', 'c) Los que comparten sin permiso', 'd) Los estudiantes de una escuela'], a: 0 },
  { q: '¿Cuál es la prueba de que la promesa está bien escrita?', o: ['a) Que use palabras técnicas', 'b) Que la apruebe un publicista', 'c) Que otra persona la repita de memoria sin cambiarla', 'd) Que tenga más de treinta palabras'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'La marca es la ___ que alguien recuerda cuando uno no está.', a: 'promesa' },
  { q: 'Lo que el producto es o tiene se llama ___.', a: 'característica' },
  { q: 'Lo que le cambia a quien lo usa se llama ___.', a: 'beneficio' },
  { q: 'Una promesa sin prueba es solo ___.', a: 'publicidad' },
  { q: 'Toda característica se traduce agregándole «___ que».', a: 'para' },
  { q: 'Una audiencia para todo el mundo no le sirve a ___.', a: 'nadie' },
  { q: 'El nombre y el logo se deciden al ___.', a: 'final' },
  { q: 'La franja estrecha donde uno es la mejor opción es el ___.', a: 'nicho' },
  { q: 'La promesa de M.E.T.A.S cabe en ___ palabras.', a: 'doce' },
  { q: 'Lo que una maestra le dice a otra sin que uno esté es el ___ a boca.', a: 'boca' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'Marca', def: 'La promesa que alguien recuerda cuando uno no está' },
  { term: 'Audiencia', def: 'La persona concreta para quien es esto' },
  { term: 'Característica', def: 'Lo que el trabajo es o tiene' },
  { term: 'Beneficio', def: 'Lo que le cambia a quien lo usa' },
  { term: 'Prueba', def: 'Algo que se puede tocar y comprobar hoy' },
  { term: 'Trabajo por hacer', def: 'Para qué te contrata de verdad esa persona' },
  { term: 'Nicho', def: 'La franja estrecha donde uno es la mejor opción' },
  { term: 'Identidad visual', def: 'El logo y los colores, que van al final' },
  { term: 'Boca a boca', def: 'Lo que una maestra le dice a otra cuando uno no está' },
  { term: 'Público prestado', def: 'La audiencia que vive en la casa de otro' },
]);

B.critCaseBank = JSON.stringify([
  { txt: 'Son las nueve de la noche. Una maestra de sexto busca en el teléfono material de fracciones para mañana, con el niño ya dormido y sin haber preparado nada.' },
  { txt: 'Una madre con un solo teléfono para la casa y datos contados quiere que su hija siga estudiando en las tardes. La luz se va tres veces por semana.' },
  { txt: 'Un negocio del barrio ofrece 8.000 lempiras a cambio de que su logo aparezca en la portada de todas las fichas del año.' },
  { txt: 'Alguien con buena intención aconseja cambiarle el nombre al proyecto por uno en inglés, con colores nuevos y una tipografía más profesional.' },
  { txt: 'Una escuela pide que el material cubra de primero a noveno, todas las asignaturas, y que además sirva a los padres en casa.' },
  { txt: 'Proponen poner «usado por miles de maestros» en la portada del sitio, sin tener el dato, porque «así se ve más serio».' },
  { txt: 'Una editorial ofrece distribuir las fichas en su catálogo con su sello en la portada y el nombre del autor en la página de créditos.' },
  { txt: 'Una página con mucho público ofrece publicar las misiones a cambio de que no se publiquen en ningún otro lado durante un año.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. ¿A quién le habla de verdad esta situación, y qué quiere esa persona?',
  '2. ¿Qué se está prometiendo, y con qué prueba se comprueba hoy?',
  '3. Escribe en 3-4 frases qué se cede aquí sin darse cuenta.',
  '4. Reescribe la promesa o la respuesta en doce palabras.',
]);

B.critCaseGuides = JSON.stringify([
  'La audiencia no es «la comunidad educativa»: es una persona con su hora y su apuro. Nombrarla con su situación cambia todo el mensaje, porque lo que estorba a esa hora rompe la promesa aunque el contenido sea excelente.',
  'La promesa se dice en una frase corta y verificable, y detrás va la prueba que se toca hoy: una ficha impresa, una misión abierta, una maestra que lo diga con su nombre. Sin prueba, es publicidad.',
  'Lo que se cede casi nunca es dinero: es autoría, espacio de marca, lectura de qué es esto, relación directa con el público o libertad para seguir publicando. Eso es lo que hay que poner en la balanza.',
  'Doce palabras obligan a decidir para quién es. Si no cabe, es que todavía hay dos audiencias metidas en la misma frase.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Lo que le falta al proyecto es un logo moderno y un nombre en inglés".', g1: 'El logo es la etiqueta de una promesa; sin promesa clara no hay nada que etiquetar, y la maestra sigue sin saber para qué le sirve.', g2: 'El orden correcto es audiencia, promesa, prueba y al final el nombre. Un nombre en inglés en un centro rural aleja en vez de acercar.' },
  { txt: '"Pongamos que lo usan miles de maestros, total nadie va a preguntar".', g1: 'Basta una persona que pregunte «¿cuántos exactamente?» para derribar la cifra y, con ella, lo que sí era cierto.', g2: 'Un número chico con fecha convence más porque el que lo lee sabe que puede comprobarlo. 43 fichas desde febrero vale más que «miles».' },
  { txt: '"Mientras más amplio el mensaje, más gente lo va a usar".', g1: 'Un mensaje para todos no hace que nadie se reconozca en él, y lo que no se reconoce no se repite a un tercero.', g2: 'La audiencia amplia se gana estrechando: hacerlo impecable para un grado y una materia, y crecer desde ahí con una maestra que lo diga con su nombre.' },
  { txt: '"Aceptemos el logo del patrocinador en la portada, total es solo un espacio".', g1: 'La portada es donde la maestra decide en dos segundos si esto es material educativo o publicidad. No se cede espacio: se cede la lectura de qué es esto.', g2: 'Contraportada, tamaño definido por escrito y reglas publicadas iguales para todos. Así el no al siguiente no es personal, es la regla.' },
  { txt: '"Que la editorial ponga su sello, lo importante es que el material llegue lejos".', g1: 'El material llega y la reputación se queda en otra parte: quien lo recuerde recordará a la editorial, no al autor.', g2: 'Se puede volver a hacer una ficha; no se puede volver a ser el primero que la hizo. Nombre en portada y licencia para seguir publicando lo propio.' },
  { txt: '"Con la exclusividad de un año ganamos público de golpe".', g1: 'El público es de la página, no del proyecto: al terminar el acuerdo se devuelve completo y hay que empezar de nuevo.', g2: 'Difusión sin exclusividad, con enlace al sitio propio y nombre visible, para que cada publicación deje algo que se queda.' },
]);

B.critDecisionBank = JSON.stringify([
  'La maestra de sexto busca material a las nueve de la noche: ¿qué parte de la promesa hay que proteger para no perderla?',
  'La madre solo tiene el teléfono y datos contados: ¿qué característica se convierte aquí en el beneficio principal?',
  'Un negocio ofrece 8.000 lempiras por su logo en la portada: ¿qué se cede, qué no y con qué condición se acepta?',
  'Aconsejan cambiar el nombre y el logo antes que nada: ¿en qué orden se hacen de verdad las cosas y por qué?',
  'Una escuela pide material para todos los grados y materias: ¿qué se contraoferta y con qué argumento?',
  'Proponen publicar «usado por miles de maestros» sin el dato: ¿qué se publica en su lugar?',
  'Una editorial quiere el material con su sello: ¿qué se pide antes de entregar nada?',
  'Una página grande ofrece difusión con exclusividad de un año: ¿cómo se acepta sin quedarse sin público propio?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'La ficha se abre e imprime en tres clics, sin cuenta.', b: 'La ficha se descarga tras registrarse y esperar un correo de confirmación.', ga: 'Caso A: cumple la promesa a la hora en que la maestra decide, que es de noche y con apuro.', gb: 'Caso B: pierde a la clienta sin que uno se entere, porque a esa hora nadie espera un correo.' },
  { a: '«43 fichas publicadas desde febrero, usadas en tres centros».', b: '«Material educativo usado por miles de maestros en todo el país».', ga: 'Caso A: número chico, con fecha y verificable. El que lo lee sabe que puede comprobarlo.', gb: 'Caso B: una sola pregunta lo derriba y se lleva también lo que sí era cierto.' },
  { a: 'Hacerlo impecable para sexto grado y crecer desde ahí.', b: 'Cubrir de primero a noveno y todas las materias de una vez.', ga: 'Caso A: alguien puede decir «las mejores fichas de sexto», y eso se repite entre colegas.', gb: 'Caso B: el trabajo se reparte tan fino que ninguna materia queda buena y nadie lo recomienda.' },
  { a: 'Logo del patrocinador en la contraportada, con tamaño por escrito.', b: 'Logo del patrocinador en la portada, junto al nombre del proyecto.', ga: 'Caso A: se cede espacio real sin cambiar cómo se lee el material.', gb: 'Caso B: la maestra decide en dos segundos que esto es publicidad, y ya no la convence el contenido.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se elige «la comunidad educativa» como audiencia.', guide: 'El mensaje se vuelve tan general que nadie se reconoce en él, y sin reconocimiento no hay boca a boca. Hay que bajar a una persona con hora y problema.' },
  { cause: 'Se publica una cifra grande sin fuente ni fecha.', guide: 'La primera pregunta la derriba y arrastra la credibilidad de lo que sí era cierto. La confianza no se pierde por parecer pequeño, sino por parecer inflado.' },
  { cause: 'Se gasta el presupuesto en identidad visual antes de tener promesa.', guide: 'Queda una etiqueta preciosa sobre un frasco vacío: nadie sabe repetir qué hace el proyecto, que es justo lo que hace crecer.' },
  { cause: 'Se acepta que el material circule con el sello de otro.', guide: 'El alcance sube y la marca se queda en otra parte. Se puede rehacer una ficha; no se puede volver a ser el primero que la hizo.' },
  { cause: 'Se firma exclusividad con una página de mucho público.', guide: 'Al terminar el año el público sigue siendo de la página. Público prestado se devuelve completo.' },
  { cause: 'La misión pesa demasiado para un teléfono con datos contados.', guide: 'La promesa era falsa para esa audiencia desde el principio, y una promesa que falla la primera vez no tiene segunda.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'Una maestra le pasó la ficha a otras tres sin que nadie se lo pidiera.', guide: 'La promesa se entendió, se pudo comprobar y por eso se repitió. Eso es la marca funcionando, y no costó nada.' },
  { effect: 'El proyecto quedó conocido como «las fichas de sexto» en todo el distrito.', guide: 'Estrechar funcionó: un nicho claro se recuerda y se recomienda, y desde ahí se puede crecer hacia otros grados.' },
  { effect: 'Un patrocinador aceptó la contraportada sin discutir.', guide: 'Las reglas publicadas hicieron el trabajo: el límite no fue personal, fue la norma, y eso deja la puerta abierta para el año siguiente.' },
  { effect: 'Preguntaron por los números y la respuesta estuvo lista, con fecha.', guide: 'Publicar cifras reales y verificables convierte una pregunta incómoda en una demostración de seriedad.' },
  { effect: 'La madre siguió usando las misiones el mes en que se fue la luz cuatro veces.', guide: 'La característica técnica era exactamente el beneficio de esa audiencia, y por eso se dice primero.' },
  { effect: 'La editorial aceptó el nombre del autor en la portada.', guide: 'Se pidió antes de entregar nada. Lo que se pide antes se negocia; lo que se reclama después ya se perdió.' },
]);

B.timelineData = JSON.stringify([
  { y: '1', icon: '🎯', label: 'La audiencia', text: 'Para quién es esto <strong>exactamente</strong>. <strong>Resuelve:</strong> a quién se le habla y con qué palabras. <strong>Se rompe:</strong> cuando se dice «para todo el mundo», que no es nadie. <strong>En M.E.T.A.S:</strong> la maestra de sexto a las nueve de la noche.' },
  { y: '2', icon: '😣', label: 'El dolor', text: 'Lo que le duele hoy, dicho <strong>con sus palabras</strong>. <strong>Resuelve:</strong> que la persona se reconozca en la primera línea. <strong>Se rompe:</strong> cuando se describe con las palabras de uno. <strong>En M.E.T.A.S:</strong> «mañana toca fracciones y no tengo nada preparado».' },
  { y: '3', icon: '🔨', label: 'El trabajo por hacer', text: 'Para qué te <strong>contrata</strong> de verdad. <strong>Resuelve:</strong> distinguir lo que pide de lo que necesita. <strong>Se rompe:</strong> cuando se cree que quiere el producto. <strong>En M.E.T.A.S:</strong> no quiere una aplicación, quiere terminar de calificar.' },
  { y: '4', icon: '📣', label: 'La promesa', text: 'Qué le cambia, en <strong>una frase corta y verificable</strong>. <strong>Resuelve:</strong> que alguien pueda repetirla sin uno delante. <strong>Se rompe:</strong> cuando lleva adjetivos en vez de resultado. <strong>En M.E.T.A.S:</strong> «mañana tienes la clase lista».' },
  { y: '5', icon: '📄', label: 'La prueba', text: 'Algo que se puede <strong>tocar hoy</strong>. <strong>Resuelve:</strong> que no haya que creer en la palabra de nadie. <strong>Se rompe:</strong> con cifras que nadie puede verificar. <strong>En M.E.T.A.S:</strong> la ficha impresa, el Campeonísimo y el teléfono sin señal.' },
  { y: '6', icon: '✨', label: 'La diferencia', text: 'Por qué esto y <strong>no lo que ya existe</strong>. <strong>Resuelve:</strong> la comparación que el otro va a hacer igual. <strong>Se rompe:</strong> al querer ser mejor en todo. <strong>En M.E.T.A.S:</strong> funciona sin internet y se imprime en blanco y negro.' },
  { y: '7', icon: '🏷️', label: 'El nombre y el logo', text: 'La <strong>etiqueta</strong> de todo lo anterior. <strong>Resuelve:</strong> que se pueda señalar y recordar. <strong>Se rompe:</strong> cuando se hace primero. <strong>En M.E.T.A.S:</strong> va al final, y en el idioma de quien lo va a usar.' },
]);

B.parteData = JSON.stringify({
  maestra: {
    nombre: 'La maestra', icon: '👩‍🏫',
    estructura: { title: 'Quién es', info: '• Maestra de sexto grado, sección de 35 estudiantes<br>• Prepara la clase <strong>de noche</strong>, después de su propia casa<br>• Decide el material del día siguiente en menos de diez minutos' },
    funcion: { title: 'Qué quiere de verdad', info: '• Terminar de calificar y que la clase no se le caiga<br>• Llegar con algo <strong>listo</strong>, no con algo que hay que preparar<br>• Que sus colegas vean que su sección va bien' },
    enfermedades: { title: 'Qué la hace irse', info: '• Tener que crear una cuenta y esperar un correo<br>• Tres clics de más a las nueve de la noche<br>• Material que promete mucho y hay que armar antes de usar' },
    cuidados: { title: 'La promesa y su prueba', info: '• Promesa: <strong>«mañana tienes la clase lista»</strong><br>• Prueba: la ficha de diez páginas con la pauta ya resuelta<br>• Medida de éxito: si la usó esa misma noche, no si le gustó' },
  },
  madre: {
    nombre: 'La madre', icon: '👩',
    estructura: { title: 'Quién es', info: '• Un solo teléfono para toda la casa<br>• Datos contados, y la luz se va <strong>tres veces por semana</strong><br>• Quiere que su hija no se quede atrás, y no sabe cómo ayudar' },
    funcion: { title: 'Qué quiere de verdad', info: '• Que la niña avance sin depender de que ella sepa el tema<br>• No elegir entre <strong>estudiar y tener saldo</strong><br>• Algo que se pueda imprimir barato en la pulpería' },
    enfermedades: { title: 'Qué la hace irse', info: '• Una misión que pesa demasiado o exige estar conectada<br>• Contenido que se corta cuando se va la luz<br>• Promesas que fallan la primera vez: no hay segunda' },
    cuidados: { title: 'La promesa y su prueba', info: '• Promesa: <strong>«sigue estudiando aunque no haya señal»</strong><br>• Prueba: la misión abre y sigue funcionando sin conexión<br>• Aquí la característica técnica <strong>es</strong> el beneficio, y por eso se dice primero' },
  },
  director: {
    nombre: 'El director', icon: '🏫',
    estructura: { title: 'Quién es', info: '• Responde por todo lo que pase adentro del centro<br>• Ha visto proyectos que llegaron y se fueron<br>• Tiene miedo razonable a los <strong>teléfonos en el aula</strong>' },
    funcion: { title: 'Qué quiere de verdad', info: '• Que nada le explote y que el centro se vea bien<br>• Algo que él pueda <strong>mostrar como suyo</strong><br>• No quedar como el que aprobó un experimento que salió mal' },
    enfermedades: { title: 'Qué lo hace irse', info: '• Que se le pida permiso para todo el centro de una vez<br>• Que llegue una orden de arriba en vez de una propuesta<br>• Cualquier cosa que dependa de que los alumnos saquen el teléfono' },
    cuidados: { title: 'La promesa y su prueba', info: '• Promesa: <strong>«un piloto en una sección, sin riesgo y reversible»</strong><br>• Prueba: la versión impresa, que no necesita teléfono<br>• Se vuelve en un mes con resultados que él pueda enseñar' },
  },
  patrocinador: {
    nombre: 'El patrocinador', icon: '🤝',
    estructura: { title: 'Quién es', info: '• Un negocio del barrio o una institución local<br>• Tiene presupuesto chico y ganas de que lo vean<br>• Mide en <strong>visibilidad</strong>, no en aprendizaje' },
    funcion: { title: 'Qué quiere de verdad', info: '• Aparecer asociado a algo que la gente valora<br>• Algo concreto que pueda <strong>mostrar</strong>: una foto, un logo, un acto<br>• Que el trato sea sencillo y no le traiga problemas' },
    enfermedades: { title: 'Qué lo hace irse', info: '• Reglas que cambian según con quién se hable<br>• Que le prometan la portada y después se la quiten<br>• No saber qué recibe exactamente por su dinero' },
    cuidados: { title: 'La promesa y su prueba', info: '• Promesa: <strong>«su nombre en un material que se usa de verdad»</strong><br>• Prueba: las fichas circulando, con fecha y centros<br>• Condición: contraportada, tamaño por escrito y <strong>reglas iguales para todos</strong>' },
  },
});

/* ---------- aplicar ---------- */
let src = fs.readFileSync(ARCHIVO, 'utf8');
const lineas = src.split(/\r?\n/);
let cambiados = 0;
const noEncontrados = [];

for (const [nombre, literal] of Object.entries(B)) {
  const prefijo = 'const ' + nombre + '=';
  let idx = lineas.findIndex(l => l.startsWith(prefijo));
  if (idx === -1) { noEncontrados.push(nombre); continue; }
  lineas[idx] = prefijo + literal + ';';
  cambiados++;
}

src = lineas.join('\n');

/* Textos sueltos del molde anterior */
const textos = [
  [/🏛️ \*Ruta del Poder Político · Etapa 1\* 🏛️/g, '📈 *Ruta de la Marca · Etapa 1* 📈'],
  [/Quién decide de verdad: el mapa del poder que toca a M\.E\.T\.A\.S, quién firma, quién traba y quién paga\. 🗺️/g, 'Para quién y qué le cambia: audiencia y promesa antes que el logo, con los ocho casos del proyecto. 🎯'],
  [/_Incluye evaluación conceptual y simulacro de negociación\._ ✍️/g, '_Incluye evaluación conceptual y prueba de la promesa._ ✍️'],
  [/Ruta del Poder Político · Etapa 1: Quién decide de verdad/g, 'Ruta de la Marca · Etapa 1: Para quién y qué le cambia'],
  [/Simulacro de negociación/g, 'Prueba de la promesa'],
  [/quién decide de verdad/g, 'para quién y qué le cambia'],
  [/Quién decide de verdad/g, 'Para quién y qué le cambia'],
  [/mapa del poder/g, 'mapa de la marca'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

fs.writeFileSync(ARCHIVO, src, 'utf8');
console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
