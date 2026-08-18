/* Inyecta los bancos de la misión «Las fallas de la máquina» (Ruta del
   Expediente Dorado, etapa 2: Crítica al Capitalismo, materia 27 del
   Estudio Mayor) sobre el molde copiado de la etapa 1 de esta misma ruta,
   que es la misión más reciente y completa.
   Uso:  node _dev/inyecta-bancos-fallas-maquina.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Pigou, «The Economics of Welfare» (1920): CLÁSICO SÓLIDO.
     · Coase, «The Problem of Social Cost» (1960): CLÁSICO SÓLIDO, LA
       CONTRACRÍTICA OBLIGADA. Y va siempre con la advertencia del propio
       autor: su argumento vale donde negociar cuesta poco, y la versión de
       manual la RECHAZÓ ÉL POR ESCRITO en «The Firm, the Market and the
       Law» (1988).
     · Akerlof, «The Market for Lemons» (1970): CLÁSICO SÓLIDO, Nobel 2001.
     · Greenwald y Stiglitz (1986): EL RESULTADO GENERAL, con información
       imperfecta los mercados no son eficientes por regla.
     · Manning, «Monopsony in Motion» (2003): LA REFERENCIA ACADÉMICA del
       monopsonio, que es la falla que casi nadie enseña.
     · Card y Krueger (1994) contra Neumark y Wascher: DISPUTA EMPÍRICA
       VIVA sobre el salario mínimo, y viva se enseña.
     · Minsky, «Stabilizing an Unstable Economy» (1986): HETERODOXO EN SU
       DÍA, REHABILITADO TRAS 2008.
     · Informe de la Financial Crisis Inquiry Commission (2011): FUENTE
       OFICIAL, y se cita CON SUS DISIDENCIAS INCLUIDAS.

   La idea que ordena todos los bancos: LA LETRA PEQUEÑA DEL TEOREMA. Un
   mercado competitivo asigna bien los recursos si se cumplen cuatro
   supuestos (mercados completos, información perfecta, nadie con poder de
   mercado, nada que caiga sobre terceros), y CADA SUPUESTO QUE FALLA ES UNA
   FAMILIA DE FALLAS REALES. La destreza de la etapa es ponerle NOMBRE Y
   APELLIDO a la falla de un mercado hondureño concreto.

   Tres cuidados del compendio gobiernan la misión. Uno: la crítica la
   firman LOS PROPIOS ECONOMISTAS, y por eso no se puede despachar diciendo
   que viene del otro estante. Dos: toda crítica entra con SU CONTRACRÍTICA
   AL LADO, y Coase con su propia rectificación de 1988. Tres: el modo de
   fallar de la etapa es SALTAR DE LA FALLA A LA CONSIGNA, y contra eso van
   la hoja de la falla y la regla de que NINGUNA REGLA ES GRATIS: la falla
   de mercado se compara con la falla de gobierno concreta y no con un
   gobierno imaginario que siempre acierta.

   Y la regla de selección de la materia, que se respeta en los bancos: los
   conflictos vivos del patio entran COMO CATEGORÍA y no como caso con
   nombre propio, y la política hondureña de hoy no entra ni de ejemplo. */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-dorado-fallas-maquina', 'js', 'fallas-maquina.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260915;
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

/* ---------- flashcards ---------- */
B.fcData = JSON.stringify([
  { w: 'La letra pequeña del teorema', a: '📜 Un mercado competitivo asigna bien los recursos <strong>si</strong> se cumplen cuatro supuestos: <strong>mercados completos, información perfecta, nadie con poder de mercado y nada que caiga sobre terceros</strong>. Los escribieron quienes demostraron el teorema, no sus críticos.' },
  { w: 'Por qué esta crítica es la más afilada', a: '🔧 Porque <strong>la firman los propios economistas</strong>: gente que aceptó todas las reglas del juego y demostró con las mismas herramientas dónde el juego se rompe solo. No se puede despachar diciendo que viene del otro estante.' },
  { w: 'Externalidad', a: '🌊 <strong>El costo que paga quien no firmó nada.</strong> El taller tira el agua sucia a la quebrada y el daño lo paga la aldea de abajo. El precio de lo que se vende no incluye ese costo, así que se produce más de lo que se produciría si el precio dijera la verdad.' },
  { w: 'Pigou (1920)', a: '💰 En <strong>«The Economics of Welfare»</strong>, propone que el que causa el daño <strong>lo pague en el precio</strong>, con un impuesto del tamaño del daño. Etiqueta: <strong>clásico sólido</strong>.' },
  { w: 'Coase (1960)', a: '🤝 En <strong>«The Problem of Social Cost»</strong>, responde que <strong>si los derechos de propiedad están claros, las partes pueden negociar</strong> y llegar solas al resultado eficiente. Etiqueta: <strong>clásico sólido, y la contracrítica obligada</strong>.' },
  { w: 'La advertencia del propio Coase', a: '⚠️ Que su argumento <strong>vale donde negociar cuesta poco</strong>, que es donde la falla menos importa. <strong>La versión de manual la rechazó él por escrito</strong>, en <strong>«The Firm, the Market and the Law» (1988)</strong>. Citar a Coase sin esto es citar la mitad que conviene.' },
  { w: 'Monopolio', a: '🏭 El <strong>único que vende</strong>: cobra de más y vende menos de lo que se vendería con competencia. Es la falla que sí se enseña en la escuela.' },
  { w: 'Monopsonio', a: '🏭 El <strong>único que compra</strong>, y casi siempre compra trabajo: <strong>paga de menos sin violar ninguna ley</strong>. No hace falta que nadie sea malo; basta con ser el único, porque el trabajador no tiene a dónde ir a comparar. Es la falla que casi nadie enseña.' },
  { w: 'Manning (2003)', a: '📘 <strong>«Monopsony in Motion»</strong>, la referencia académica del monopsonio. Su punto incómodo: casi todo el mundo vende su tiempo en mercados con pocos compradores, así que la falla que no se enseña es la que más gente padece.' },
  { w: 'La disputa del salario mínimo', a: '⚖️ Si el que paga tiene poder, subir el mínimo <strong>no tiene por qué destruir empleo</strong>. <strong>Card y Krueger (1994)</strong> midieron un caso real y no hallaron esa caída; <strong>Neumark y Wascher</strong> los rebatieron con otros datos. <strong>Disputa empírica viva</strong>, y viva se enseña.' },
  { w: 'Información asimétrica', a: '🍋 <strong>Uno sabe y el otro no.</strong> El que compra no distingue, ofrece precio de promedio, el dueño de lo bueno se retira, el promedio empeora y el mercado se degrada solo, <strong>sin que nadie haga trampa</strong>.' },
  { w: 'Akerlof (1970)', a: '🚗 <strong>«The Market for Lemons»</strong>: con los carros usados demostró que un mercado puede deshacerse solo. Etiqueta: <strong>clásico sólido</strong>, y su autor recibió el <strong>Nobel de Economía en 2001</strong>.' },
  { w: 'Greenwald y Stiglitz (1986)', a: '📐 El remate teórico: <strong>con información imperfecta los mercados no son eficientes por regla</strong>, y no por excepción. Convierte el ejemplo de los carros usados en un resultado general.' },
  { w: 'La falla dinámica de Minsky', a: '🎈 <strong>La estabilidad incuba inestabilidad.</strong> Los años buenos convencen a todos de que el riesgo bajó: el prudente se vuelve especulativo y el especulativo se vuelve pirámide. De <strong>«Stabilizing an Unstable Economy» (1986)</strong>: <strong>heterodoxo en su día, rehabilitado tras 2008</strong>.' },
  { w: 'La ficha de 2008', a: '🏚️ La burbuja de la vivienda, los derivados que empaquetaban hipotecas malas con etiqueta de buenas, el rescate y <strong>quién pagó la cuenta</strong>. Fuente oficial: el <strong>informe de la Financial Crisis Inquiry Commission (2011)</strong>, y se cita <strong>con sus disidencias</strong>, porque no fue unánime.' },
  { w: 'Ninguna regla es gratis', a: '🧾 De que un mercado falle <strong>no se sigue</strong> que otro arreglo lo haga mejor. La falla de mercado se compara con <strong>la falla de gobierno concreta</strong>, con nombre, y no con un gobierno imaginario que siempre acierta. Y toda regla se escribe con <strong>quién la aplica, cuánto cuesta y a quién</strong>.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Cuántos supuestos pide el teorema que promete eficiencia, y quién los escribió?', o: ['a) Cuatro, y los escribieron quienes demostraron el teorema', 'b) Dos, y los escribieron sus críticos', 'c) Ninguno: el teorema no tiene supuestos', 'd) Diez, y están en disputa'], c: 0 },
  { q: 'Una externalidad es…', o: ['a) Un impuesto mal calculado', 'b) Un costo que recae sobre quien no participó en el intercambio', 'c) Un precio demasiado alto', 'd) Una importación'], c: 1 },
  { q: 'La contracrítica obligada a Pigou la escribió…', o: ['a) Akerlof, en 1970', 'b) Minsky, en 1986', 'c) Coase, en 1960', 'd) Manning, en 2003'], c: 2 },
  { q: 'La advertencia que el propio Coase dejó por escrito en 1988 es que…', o: ['a) Los impuestos siempre funcionan', 'b) Su argumento no valía para nada', 'c) Pigou tenía razón en todo', 'd) Su argumento vale donde negociar cuesta poco, y rechazó la versión de manual'], c: 3 },
  { q: 'El monopsonio es el caso en que…', o: ['a) El único que compra paga de menos, sin violar ninguna ley', 'b) El único que vende cobra de más', 'c) Hay muchos compradores y muchos vendedores', 'd) El Estado fija los precios'], c: 0 },
  { q: '¿Por qué la disputa Card y Krueger contra Neumark y Wascher se enseña como disputa?', o: ['a) Porque nadie la ha estudiado', 'b) Porque midieron el mismo tipo de caso y llegaron a resultados distintos, y sigue abierta', 'c) Porque es muy antigua', 'd) Porque ya se resolvió a favor de Card y Krueger'], c: 1 },
  { q: 'En el mercado de los limones de Akerlof, ¿qué pasa con los productos buenos?', o: ['a) Suben de precio', 'b) Se venden primero', 'c) Se retiran, porque a precio de promedio no conviene venderlos', 'd) Los compra el Estado'], c: 2 },
  { q: 'Lo que Greenwald y Stiglitz demostraron en 1986 es que…', o: ['a) La información siempre es perfecta', 'b) Los carros usados son un caso raro', 'c) Los monopolios no existen', 'd) Con información imperfecta los mercados no son eficientes por regla'], c: 3 },
  { q: 'La tesis de Minsky es que…', o: ['a) La estabilidad incuba inestabilidad', 'b) Las crisis vienen siempre de afuera', 'c) El riesgo se puede eliminar', 'd) Los bancos son innecesarios'], c: 0 },
  { q: 'Cuando se propone una regla para corregir una falla, esta casa exige además…', o: ['a) Que la firme un premio Nobel', 'b) Decir qué cuesta esa regla y a quién, y compararla con la alternativa real', 'c) Que se aplique en todo el mundo', 'd) Que sea gratis'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Externalidad', 'Otra falla'],
    headA: '🌊 Externalidad: paga quien no firmó',
    headB: '🔧 Es otra de las cuatro',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El taller tira el agua sucia a la quebrada', t: 'ok' },
      { w: 'El médico sabe lo que el paciente no sabe', t: 'no' },
      { w: 'El humo de la fábrica lo respira el vecino', t: 'ok' },
      { w: 'En el pueblo hay un solo empleador formal', t: 'no' },
      { w: 'El ruido del bar a las dos de la mañana', t: 'ok' },
      { w: 'Los años buenos convencen de que no hay riesgo', t: 'no' },
      { w: 'La represa exporta megavatios e interna el costo al río', t: 'ok' },
      { w: 'El dueño del carro bueno prefiere no venderlo', t: 'no' },
    ],
  },
  {
    label: ['Monopsonio', 'Monopolio'],
    headA: '🏭 Monopsonio: el único que compra',
    headB: '🏬 Monopolio: el único que vende',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Un solo taller da planilla en el pueblo', t: 'ok' },
      { w: 'Un solo proveedor de internet en la colonia', t: 'no' },
      { w: 'Una sola empacadora compra la cosecha del valle', t: 'ok' },
      { w: 'Una sola empresa vende el agua embotellada', t: 'no' },
      { w: 'El salario baja porque no hay a dónde irse', t: 'ok' },
      { w: 'El precio sube porque no hay a quién comprarle', t: 'no' },
      { w: 'Manning escribió el tratado de esta falla', t: 'ok' },
      { w: 'Es la falla que sí se enseña en la escuela', t: 'no' },
    ],
  },
  {
    label: ['Diagnóstico', 'Consigna'],
    headA: '🔧 Diagnóstico: sirve para decidir',
    headB: '📢 Consigna: suena y no decide',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Esto es asimetría, y la regla sería publicar precios»', t: 'ok' },
      { w: '«El mercado falla»', t: 'no' },
      { w: '«Hay un solo comprador, así que el salario baja solo»', t: 'ok' },
      { w: '«Todo es culpa del sistema»', t: 'no' },
      { w: '«La regla cuesta un regulador que sepa hacerlo»', t: 'ok' },
      { w: '«Hay que regularlo todo»', t: 'no' },
      { w: '«Se compara con esta alternativa concreta»', t: 'ok' },
      { w: '«El Estado lo haría mejor»', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Es de otra etapa o de otra materia'],
    headA: '🔧 Se estudia en esta etapa',
    headB: '🏠 Es de otra etapa o materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Los cuatro supuestos del teorema', t: 'ok' },
      { w: 'El gran escape de Deaton y sus cifras fechadas', t: 'no' },
      { w: 'Pigou contra Coase, y el aviso de 1988', t: 'ok' },
      { w: 'Los bienes que el precio corrompe en vez de asignar', t: 'no' },
      { w: 'Minsky y la ficha completa de 2008', t: 'ok' },
      { w: 'La Gran Depresión y sus lecturas en pelea', t: 'no' },
      { w: 'El monopsonio y la disputa del salario mínimo', t: 'ok' },
      { w: 'La desigualdad de Piketty y sus auditores', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['El', 'teorema', 'pide', 'cuatro', 'supuestos.'], c: 3, art: 'Cuántos supuestos pide el teorema' },
  { s: ['Pigou', 'propuso', 'un', 'impuesto', 'en', '1920.'], c: 0, art: 'Quién propuso el impuesto del tamaño del daño' },
  { s: ['Coase', 'respondió', 'con', 'la', 'negociación', 'en', '1960.'], c: 0, art: 'Quién escribió la contracrítica obligada' },
  { s: ['El', 'monopsonio', 'es', 'el', 'único', 'que', 'compra.'], c: 1, art: 'La falla que casi nadie enseña' },
  { s: ['Akerlof', 'explicó', 'los', 'limones', 'en', '1970.'], c: 0, art: 'Quién explicó el mercado de los limones' },
  { s: ['La', 'estabilidad', 'incuba', 'inestabilidad,', 'dijo', 'Minsky.'], c: 5, art: 'Quién dijo que la calma fabrica la tormenta' },
  { s: ['El', 'informe', 'oficial', 'de', '2011', 'trae', 'disidencias.'], c: 6, art: 'Lo que el informe de 2011 incluye y no se omite' },
  { s: ['Ninguna', 'regla', 'sale', 'gratis', 'en', 'esta', 'casa.'], c: 3, art: 'Lo que ninguna regla sale, según la etapa' },
]);

/* ---------- completa la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'El teorema pide ___ supuestos.', opts: ['cuatro', 'dos', 'siete'], c: 0 },
  { s: 'El costo que paga quien no firmó se llama ___.', opts: ['monopolio', 'externalidad', 'asimetría'], c: 1 },
  { s: 'Pigou publicó «The Economics of Welfare» en ___.', opts: ['1960', '1970', '1920'], c: 2 },
  { s: 'Coase advirtió que su argumento vale donde negociar cuesta ___.', opts: ['poco', 'mucho', 'igual'], c: 0 },
  { s: 'El único que compra y paga de menos ejerce ___.', opts: ['monopolio', 'monopsonio', 'competencia'], c: 1 },
  { s: 'Akerlof recibió el Nobel de Economía en ___.', opts: ['1970', '1986', '2001'], c: 2 },
  { s: 'Minsky sostuvo que la ___ incuba inestabilidad.', opts: ['estabilidad', 'inflación', 'deuda'], c: 0 },
  { s: 'El informe oficial de la crisis se publicó en 2011, y se cita con sus ___.', opts: ['gráficas', 'disidencias', 'anexos'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Externalidad', 'Asimetría'],
    btnA: '🌊 Externalidad', btnB: '🍋 Asimetría',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El humo que respira el vecino', t: 'ok' },
      { w: 'El carro usado muy barato', t: 'no' },
      { w: 'El agua sucia en la quebrada', t: 'ok' },
      { w: 'La consulta médica', t: 'no' },
      { w: 'El ruido de madrugada', t: 'ok' },
      { w: 'El seguro que no sabe quién se enferma', t: 'no' },
      { w: 'Paga quien no firmó', t: 'ok' },
      { w: 'Uno sabe y el otro no', t: 'no' },
      { w: 'Pigou y Coase', t: 'ok' },
      { w: 'Akerlof y Stiglitz', t: 'no' },
    ],
  },
  {
    label: ['Monopsonio', 'Monopolio'],
    btnA: '🏭 Monopsonio', btnB: '🏬 Monopolio',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El único que compra', t: 'ok' },
      { w: 'El único que vende', t: 'no' },
      { w: 'Paga de menos', t: 'ok' },
      { w: 'Cobra de más', t: 'no' },
      { w: 'Un solo empleador formal', t: 'ok' },
      { w: 'Un solo proveedor de internet', t: 'no' },
      { w: 'Manning, 2003', t: 'ok' },
      { w: 'Es el que sí se enseña', t: 'no' },
      { w: 'La disputa del salario mínimo', t: 'ok' },
      { w: 'El precio del servicio sube', t: 'no' },
    ],
  },
  {
    label: ['Diagnóstico', 'Consigna'],
    btnA: '🔧 Diagnóstico', btnB: '📢 Consigna',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Nombra la falla', t: 'ok' },
      { w: '«El mercado falla»', t: 'no' },
      { w: 'Propone una regla', t: 'ok' },
      { w: '«Hay que regularlo todo»', t: 'no' },
      { w: 'Calcula el costo de la regla', t: 'ok' },
      { w: '«El Estado lo haría mejor»', t: 'no' },
      { w: 'Compara con la alternativa real', t: 'ok' },
      { w: 'Compara con el paraíso', t: 'no' },
      { w: 'Dice quién la aplica', t: 'ok' },
      { w: '«Alguien debería hacer algo»', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se diagnostica una falla de mercado',
    steps: [
      'Describir el mercado: quién vende, quién compra y qué se intercambia',
      'Revisar los cuatro supuestos y ver cuál se rompió',
      'Ponerle nombre a la falla: externalidad, poder, asimetría o dinámica',
      'Buscar la contracrítica: quién dice que ahí no hay falla, y por qué',
      'Proponer la regla, con quién la aplica y cómo se comprueba',
      'Y calcular qué cuesta esa regla y a quién se la cobra',
    ],
  },
  {
    label: 'La discusión de las externalidades, en orden',
    steps: [
      'Ver el costo que recae sobre quien no participó',
      'Pigou (1920): que el precio lo incluya, con un impuesto del tamaño del daño',
      'Coase (1960): con derechos claros, las partes pueden negociar solas',
      'La advertencia del propio Coase: eso vale donde negociar cuesta poco',
      'Medir en el caso concreto cuánto cuesta negociar de verdad',
      'Y recién entonces decidir cuál de los dos caminos conviene aquí',
    ],
  },
  {
    label: 'Los tres escalones de Minsky, y la caída',
    steps: [
      'Años buenos y sin accidentes: el riesgo parece haber desaparecido',
      'Prudente: paga intereses y capital con lo que produce el negocio',
      'Especulativo: paga los intereses, y el capital lo refinancia',
      'Pirámide: no paga ni los intereses, y apuesta a que el precio suba',
      'El precio deja de subir y el tercer escalón no puede refinanciar',
      'Y la caída arrastra a los dos escalones de abajo, que parecían sanos',
    ],
  },
]);

/* ---------- identificar la falla o la fuente por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Propuso en 1920 que el que causa el daño lo pague en el precio', ans: 'Arthur Pigou', opts: ['Arthur Pigou', 'Ronald Coase', 'George Akerlof', 'Hyman Minsky'] },
  { desc: 'Respondió en 1960 que con derechos claros las partes pueden negociar', ans: 'Ronald Coase', opts: ['Ronald Coase', 'Arthur Pigou', 'Alan Manning', 'Joseph Stiglitz'] },
  { desc: 'Explicó en 1970 por qué un mercado puede deshacerse solo, con carros usados', ans: 'George Akerlof', opts: ['George Akerlof', 'Ronald Coase', 'Hyman Minsky', 'David Card'] },
  { desc: 'Demostraron en 1986 que con información imperfecta la ineficiencia es la regla', ans: 'Greenwald y Stiglitz', opts: ['Greenwald y Stiglitz', 'Card y Krueger', 'Neumark y Wascher', 'Pigou y Coase'] },
  { desc: 'Escribió en 2003 el tratado de referencia sobre el único que compra', ans: 'Alan Manning', opts: ['Alan Manning', 'George Akerlof', 'Arthur Pigou', 'Hyman Minsky'] },
  { desc: 'Sostuvo que los años buenos convencen a todos de que el riesgo bajó', ans: 'Hyman Minsky', opts: ['Hyman Minsky', 'Ronald Coase', 'Alan Manning', 'George Akerlof'] },
  { desc: 'El costo que recae sobre quien no participó en el intercambio', ans: 'La externalidad', opts: ['La externalidad', 'El monopsonio', 'La información asimétrica', 'La falla dinámica'] },
  { desc: 'El único que compra trabajo, y por eso paga de menos sin violar ley alguna', ans: 'El monopsonio', opts: ['El monopsonio', 'El monopolio', 'La externalidad', 'La falla dinámica'] },
]);

/* ---------- falla, regla o factura ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«El taller tira el agua sucia a la quebrada de la aldea»', func: 'La falla: es una externalidad, y hay que nombrarla así', opts: ['La falla: es una externalidad, y hay que nombrarla así', 'La regla que la corregiría', 'La factura de esa regla', 'Una consigna sin diagnóstico'] },
  { trans: '«Que el taller pague un permiso del tamaño del daño que causa»', func: 'La regla: es la propuesta de Pigou, aplicada al caso', opts: ['La regla: es la propuesta de Pigou, aplicada al caso', 'La falla que se diagnostica', 'La factura de la regla', 'Un veredicto sobre el sistema'] },
  { trans: '«Habría que medir el daño y pagarle a alguien para que lo mida cada año»', func: 'La factura: lo que cuesta la regla, y a quién le cae', opts: ['La factura: lo que cuesta la regla, y a quién le cae', 'La falla del mercado', 'Una contracrítica', 'La alternativa real'] },
  { trans: '«El mercado falla y por eso la gente pobre paga más»', func: 'Consigna: no dice cuál falla, ni qué regla, ni qué cuesta', opts: ['Consigna: no dice cuál falla, ni qué regla, ni qué cuesta', 'Un diagnóstico completo', 'Una regla bien escrita', 'La factura de la regla'] },
  { trans: '«Con derechos claros, el taller y la aldea podrían arreglarse solos»', func: 'La contracrítica de Coase, que entra al lado y con su propia advertencia', opts: ['La contracrítica de Coase, que entra al lado y con su propia advertencia', 'La falla que se diagnostica', 'La factura de la regla', 'Una consigna'] },
]);

/* ---------- diagnóstico: ¿por dónde falla el diagnóstico? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: '«El mercado falla», y ahí termina la anotación', characteristic: 'No dice cuál de las cuatro fallas es, y sin el nombre no hay regla que proponer ni costo que calcular; la frase puede ser cierta y aun así no sirve para decidir nada', opts: ['No dice cuál de las cuatro fallas es, y sin el nombre no hay regla que proponer ni costo que calcular; la frase puede ser cierta y aun así no sirve para decidir nada', 'Está bien: es directo y se entiende', 'El error es hablar del mercado', 'Faltaba citar a un premio Nobel'] },
  { disease: 'Se cita a Coase para decir que las externalidades se resuelven solas', characteristic: 'Falta la advertencia del propio Coase: su argumento vale donde negociar cuesta poco, y él rechazó por escrito la versión de manual en 1988', opts: ['Falta la advertencia del propio Coase: su argumento vale donde negociar cuesta poco, y él rechazó por escrito la versión de manual en 1988', 'Está bien: Coase refutó a Pigou', 'El error es citar a Coase', 'Faltaba decir el título completo'] },
  { disease: 'Se nombra la falla y se propone una regla, y ahí termina la hoja', characteristic: 'Falta la factura: quién aplica la regla, cuánto cuesta y sobre quién cae; una regla sin costo declarado es un deseo con vocabulario técnico', opts: ['Falta la factura: quién aplica la regla, cuánto cuesta y sobre quién cae; una regla sin costo declarado es un deseo con vocabulario técnico', 'Está bien: con la regla basta', 'El error es proponer reglas', 'Faltaba una gráfica'] },
  { disease: 'De la falla de mercado se salta directo a que el Estado lo arregle', characteristic: 'Se saltó el paso de la comparación: que un mercado falle no prueba que otro arreglo lo haga mejor, y eso se compara con la falla de gobierno concreta y no con un gobierno imaginario', opts: ['Se saltó el paso de la comparación: que un mercado falle no prueba que otro arreglo lo haga mejor, y eso se compara con la falla de gobierno concreta y no con un gobierno imaginario', 'Está bien: para eso está el Estado', 'El error es mencionar al Estado', 'Faltaba una ley que lo respalde'] },
  { disease: 'Se diagnostica poder de mercado y se concluye que el dueño es mala persona', characteristic: 'La falla está en la estructura y no en las personas: el monopsonio paga de menos aunque el dueño sea honrado, porque el trabajador no tiene a dónde ir a comparar', opts: ['La falla está en la estructura y no en las personas: el monopsonio paga de menos aunque el dueño sea honrado, porque el trabajador no tiene a dónde ir a comparar', 'Está bien: si paga poco, es malo', 'El error es hablar de salarios', 'Faltaba entrevistar al dueño'] },
  { disease: 'Se dice que la disputa del salario mínimo ya está resuelta', characteristic: 'Card y Krueger (1994) y Neumark y Wascher siguen enfrentados con datos y métodos distintos: es disputa empírica viva, y declararla cerrada en cualquier dirección es vender bando', opts: ['Card y Krueger (1994) y Neumark y Wascher siguen enfrentados con datos y métodos distintos: es disputa empírica viva, y declararla cerrada en cualquier dirección es vender bando', 'Está bien: ganó el que tiene más citas', 'El error es hablar del salario mínimo', 'Faltaba un dato de Honduras'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Mercados completos, información perfecta, nadie con poder y nada sobre terceros.', type: 'Los cuatro supuestos del teorema' },
  { s: 'El costo que recae sobre quien no participó en el intercambio.', type: 'Externalidad' },
  { s: 'Que el que causa el daño lo pague en el precio, con un impuesto.', type: 'La propuesta de Pigou (1920)' },
  { s: 'Con derechos claros, las partes pueden negociar y llegar solas al resultado.', type: 'La contracrítica de Coase (1960)' },
  { s: 'Vale donde negociar cuesta poco, y él mismo rechazó la versión de manual.', type: 'La advertencia de Coase (1988)' },
  { s: 'El único que compra paga de menos sin violar ninguna ley.', type: 'Monopsonio (Manning, 2003)' },
  { s: 'El que compra ofrece precio de promedio y los buenos se retiran.', type: 'Información asimétrica (Akerlof, 1970)' },
  { s: 'Con información imperfecta la ineficiencia es la regla y no la excepción.', type: 'El resultado de Greenwald y Stiglitz (1986)' },
  { s: 'La calma financia la audacia, y la audacia el esquema de pirámide.', type: 'La falla dinámica (Minsky, 1986)' },
  { s: 'Decir que el mercado falla sin nombrar cuál, ni la regla, ni su costo.', type: 'El modo de fallar de la etapa' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'Pigou (1920)', gen: 'Fuente', n: 'El impuesto del tamaño del daño', g: '«The Economics of Welfare»', t: 'Clásico sólido' },
  { w: 'Coase (1960)', gen: 'Fuente', n: 'La negociación con derechos claros', g: '«The Problem of Social Cost»', t: 'Clásico sólido: la contracrítica obligada' },
  { w: 'Coase (1988)', gen: 'Rectificación', n: 'Vale donde negociar cuesta poco', g: '«The Firm, the Market and the Law»', t: 'El autor corrige el uso que hacen de él' },
  { w: 'Akerlof (1970)', gen: 'Fuente', n: 'El mercado que se deshace solo', g: '«The Market for Lemons», Nobel en 2001', t: 'Clásico sólido' },
  { w: 'Greenwald y Stiglitz (1986)', gen: 'Fuente', n: 'La ineficiencia como regla', g: 'Con información imperfecta', t: 'El resultado general' },
  { w: 'Manning (2003)', gen: 'Fuente', n: 'El único que compra trabajo', g: '«Monopsony in Motion»', t: 'La referencia académica del monopsonio' },
  { w: 'Card y Krueger (1994)', gen: 'Disputa', n: 'El salario mínimo y el empleo', g: 'Con Neumark y Wascher enfrente', t: 'Disputa empírica viva' },
  { w: 'Minsky (1986)', gen: 'Fuente', n: 'La estabilidad incuba inestabilidad', g: '«Stabilizing an Unstable Economy»', t: 'Heterodoxo en su día, rehabilitado tras 2008' },
  { w: 'Informe de 2011', gen: 'Documento', n: 'La investigación oficial de la crisis', g: 'Financial Crisis Inquiry Commission', t: 'Fuente oficial, con sus disidencias' },
  { w: '«El mercado falla»', gen: 'Error', n: 'La falla sin nombre', g: 'Sin regla y sin costo', t: 'El modo de fallar de esta etapa' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'El teorema pide ___ supuestos.', opts: ['cuatro', 'dos', 'seis'], ans: 'cuatro' },
  { s: 'El costo que paga quien no firmó es una ___.', opts: ['externalidad', 'asimetría', 'pirámide'], ans: 'externalidad' },
  { s: 'Pigou publicó su obra en ___.', opts: ['1920', '1960', '1986'], ans: '1920' },
  { s: 'Coase rechazó la versión de manual de su idea en ___.', opts: ['1988', '1960', '1970'], ans: '1988' },
  { s: 'El único que compra ejerce ___.', opts: ['monopsonio', 'monopolio', 'competencia'], ans: 'monopsonio' },
  { s: 'Akerlof recibió el Nobel en ___.', opts: ['2001', '1970', '1986'], ans: '2001' },
  { s: 'Minsky dijo que la ___ incuba inestabilidad.', opts: ['estabilidad', 'quiebra', 'inflación'], ans: 'estabilidad' },
  { s: 'El informe oficial de la crisis se cita con sus ___.', opts: ['disidencias', 'anexos', 'gráficas'], ans: 'disidencias' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Cuál es la letra pequeña del teorema que promete eficiencia, y por qué importa tanto quién la escribió?', ans: 'El teorema dice que un mercado competitivo asigna los recursos de manera eficiente, y es verdadero. Pero como todo teorema vale solo si se cumplen sus supuestos, y sus supuestos son cuatro: mercados completos, información perfecta, ningún participante con poder para mover el precio, y ningún costo que recaiga sobre quien no participó. Importa muchísimo quién escribió esa letra pequeña, y la respuesta es que la escribieron los propios economistas, trabajando dentro de las reglas del oficio y con sus mismas herramientas; a varios de ellos les dieron el Nobel precisamente por señalar dónde su propia máquina se rompe. Esa autoría cambia la conversación entera por dos razones. La primera es que la crítica no se puede despachar diciendo que viene del otro estante, que es la salida más común y la más perezosa. La segunda es de método y vale para toda la ruta: una disciplina que publica sus propias condiciones de operación merece más respeto que sus devotos y que sus detractores, que suelen coincidir en no haber llegado nunca a esa página.' },
  { q: 'Explica qué es una externalidad y por qué Pigou y Coase tienen que entrar juntos, con la advertencia del propio Coase incluida.', ans: 'Una externalidad es un costo que recae sobre quien no participó en el intercambio: el taller lava piezas, tira el agua a la quebrada, y el daño lo paga una aldea que no firmó nada con nadie. El precio de la pieza no incluye ese costo, así que el mercado produce más de lo que produciría si el precio dijera la verdad. Pigou, en «The Economics of Welfare» de 1920, propuso corregir la mentira del precio con un impuesto del tamaño del daño. Coase, en «The Problem of Social Cost» de 1960, respondió que si los derechos de propiedad están bien definidos las partes pueden negociar entre ellas y llegar solas a un buen resultado, sin ningún impuesto; y por eso es la contracrítica obligada y no un apéndice. Y aquí viene la pieza que casi nadie cuenta y que esta casa cuenta siempre: el propio Coase advirtió que su argumento supone que negociar cueste poco, que es justamente donde la falla menos importa, y rechazó por escrito la versión de manual de su idea en «The Firm, the Market and the Law», de 1988. Con una aldea entera, sin abogado y sin tiempo, negociar cuesta carísimo. La consecuencia práctica es que la pregunta que decide no es Pigou o Coase, sino cuánto cuesta negociar en este caso concreto.' },
  { q: '¿Qué es el monopsonio, por qué casi no se enseña, y qué disputa empírica nace de él?', ans: 'El monopsonio es la falla de poder de mercado del lado del que compra: cuando el comprador es uno solo, paga de menos sin violar ninguna ley y sin necesidad de que nadie sea mala persona, porque el que vende no tiene a dónde ir a comparar. Casi siempre lo que se compra en esos mercados es trabajo. Casi no se enseña porque la escuela explica el monopolio, que es el que vende y cobra de más, y se detiene ahí; y la omisión no es inocente, porque la mayoría de los seres humanos no vende bienes sino su tiempo, y lo vende en lugares con pocos compradores, de modo que la falla que no se enseña es la que más gente padece. La referencia académica es Alan Manning, «Monopsony in Motion», de 2003. De ahí nace una disputa empírica que sigue viva: si el que paga tiene poder de mercado, subir el salario mínimo no tiene por qué destruir empleo, que es lo que David Card y Alan Krueger midieron en 1994 sin hallar la caída que el modelo simple predecía, y lo que David Neumark y William Wascher rebatieron con otros datos y otro método. La disputa no está resuelta, se enseña como disputa, y quien la declare cerrada hacia cualquiera de los dos lados está vendiendo una postura.' },
  { q: 'Explica el mercado de los limones de Akerlof paso a paso, y qué añadieron Greenwald y Stiglitz en 1986.', ans: 'Akerlof publicó «The Market for Lemons» en 1970 y mostró algo que parecía imposible: que un mercado se deshaga solo sin que nadie haga trampa. El mecanismo tiene tres pasos. Primero, el que compra no puede distinguir lo bueno de lo malo, así que ofrece un precio de promedio, que es lo racional cuando no se sabe. Segundo, a ese precio el dueño de lo bueno prefiere no vender y se retira del mercado. Tercero, al retirarse los buenos el promedio empeora, el precio baja más, y se retiran más buenos; y así hasta que en la plaza solo quedan los malos o el mercado se vacía. Nadie mintió y el resultado es pésimo para todos, que es lo que vuelve tan potente el argumento. A Akerlof le dieron el Nobel de Economía en 2001. Lo que Bruce Greenwald y Joseph Stiglitz añadieron en 1986 es lo que convierte el ejemplo en teoría: demostraron que con información imperfecta los mercados no son eficientes por regla, y no por excepción curiosa. Es decir, la información perfecta era un supuesto y no una descripción del mundo, y en cuanto se relaja, la eficiencia deja de estar garantizada en general.' },
  { q: '¿Qué sostuvo Minsky, por qué su tesis es de otro tipo que las tres anteriores, y qué se queda esta materia de 2008?', ans: 'Minsky sostuvo, en «Stabilizing an Unstable Economy» de 1986, que la estabilidad incuba inestabilidad: el sistema financiero no falla cuando las cosas van mal, sino precisamente cuando llevan mucho tiempo yendo bien, porque los años sin accidentes convencen a todo el mundo de que el riesgo bajó. Su escalera tiene tres peldaños: el prudente paga intereses y capital con lo que produce el negocio; el especulativo solo puede pagar intereses y refinancia el capital; y el tercero no puede pagar ni los intereses y apuesta a que el precio del activo siga subiendo. Cuando el precio deja de subir, el tercer escalón se cae y arrastra a los dos de abajo, que parecían sanos. Es de otro tipo que las tres anteriores porque no es la falla de un momento ni de un supuesto concreto: es una falla dinámica, del comportamiento del sistema a lo largo del tiempo, y por eso cuesta mucho más verla y creerla. Su etiqueta se dice entera: heterodoxo en su día y rehabilitado después de 2008, cuando media profesión volvió a leerlo de golpe. Y de 2008 esta materia se queda con la ficha completa, que no tenía nadie: la burbuja de la vivienda, los derivados que empaquetaban hipotecas malas con etiqueta de buenas, el rescate y quién pagó la cuenta al final, con el informe de la Financial Crisis Inquiry Commission de 2011 como fuente oficial y citado con sus disidencias incluidas, porque la comisión no fue unánime.' },
  { q: 'Explica el modo de fallar de esta etapa y por qué la regla de que ninguna regla es gratis corta en las dos direcciones.', ans: 'El modo de fallar de esta etapa no es negar las fallas: es usarlas como consigna en vez de como diagnóstico, y se comete con el mejor ánimo porque el vocabulario nuevo da gusto. Tres señales lo delatan. La primera es decir «el mercado falla» sin nombrar cuál de las cuatro, con lo cual la frase puede ser verdadera y aun así no servir para decidir nada. La segunda es nombrar el daño y no proponer ninguna regla. La tercera es proponer la regla como si aplicarla fuera gratis. La corrección son los tres pasos juntos: el nombre de la falla, la regla escrita de modo que se sepa quién la aplica y cómo se comprueba, y la factura de esa regla, es decir cuánto cuesta y sobre quién cae. Y la regla corta en las dos direcciones, que es lo que la vuelve honrada. Hacia un lado: que un mercado tenga una falla demostrada no prueba que el Estado la vaya a arreglar mejor, y esa comparación se hace contra la falla de gobierno concreta y con nombre, no contra un ministerio imaginario que siempre acierta. Hacia el otro: negar la falla porque el remedio es difícil tampoco es rigor, es comodidad, y deja a la gente con el problema y sin diagnóstico. Regular el precio del internet suena razonable hasta que nadie tiende cable nuevo, y dejarlo libre suena razonable hasta que la colonia entera paga caro un servicio malo.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['FALLA', 'PIGOU', 'COASE', 'IMPUESTO', 'DANO', 'RIO']),
  haceSopa(10, ['AKERLOF', 'LIMON', 'PRECIO', 'MANNING', 'SALARIO', 'PODER']),
  haceSopa(10, ['MINSKY', 'CALMA', 'RIESGO', 'REGLA', 'COSTO', 'TEOREMA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'El teorema que promete eficiencia pide cuatro supuestos, y los escribieron quienes lo demostraron.', a: true },
  { q: 'Las críticas de esta etapa las escribieron enemigos declarados del mercado.', a: false },
  { q: 'Una externalidad es un costo que recae sobre quien no participó en el intercambio.', a: true },
  { q: 'Coase sostuvo que su argumento vale en cualquier caso, cueste lo que cueste negociar.', a: false },
  { q: 'Coase rechazó por escrito la versión de manual de su propia idea, en 1988.', a: true },
  { q: 'El monopolio es el único que compra y el monopsonio el único que vende.', a: false },
  { q: 'En un mercado con un solo comprador de trabajo, el salario baja sin que nadie viole ninguna ley.', a: true },
  { q: 'La disputa entre Card y Krueger y sus críticos ya quedó resuelta.', a: false },
  { q: 'Akerlof mostró que un mercado puede degradarse solo sin que nadie haga trampa.', a: true },
  { q: 'Greenwald y Stiglitz demostraron que la información imperfecta es una excepción rara.', a: false },
  { q: 'Minsky sostuvo que la estabilidad prolongada incuba inestabilidad.', a: true },
  { q: 'El informe oficial de la crisis de 2008 fue unánime y no tiene disidencias.', a: false },
  { q: 'Que un mercado falle no prueba por sí solo que otro arreglo lo haga mejor.', a: true },
  { q: 'Una regla que corrige una falla no tiene costo si está bien diseñada.', a: false },
  { q: 'La falla de mercado se compara con la falla de gobierno concreta, no con un gobierno imaginario.', a: true },
]);
B.evalMCBank = JSON.stringify([
  { q: 'Los cuatro supuestos del teorema son mercados completos, información perfecta, nadie con poder de mercado y…', o: ['a) Ningún costo sobre quien no participó', 'b) Moneda estable', 'c) Contratos escritos', 'd) Libre comercio internacional'], a: 0 },
  { q: 'Lo que vuelve tan afilada la crítica de esta etapa es que…', o: ['a) Es muy antigua', 'b) La firman los propios economistas, con sus mismas herramientas', 'c) Nadie la ha respondido', 'd) Viene de la sociología'], a: 1 },
  { q: 'La propuesta de Pigou ante una externalidad es…', o: ['a) Prohibir la actividad', 'b) Dejar que las partes negocien', 'c) Un impuesto del tamaño del daño, para que el precio diga la verdad', 'd) Nacionalizar la empresa'], a: 2 },
  { q: 'La contracrítica de Coase dice que…', o: ['a) Las externalidades no existen', 'b) El impuesto siempre es mejor', 'c) Hay que prohibir la actividad', 'd) Con derechos de propiedad claros, las partes pueden negociar y llegar solas al resultado'], a: 3 },
  { q: 'La advertencia que el propio Coase dejó escrita en 1988 es que su argumento…', o: ['a) Vale donde negociar cuesta poco, que es donde menos falta hace', 'b) Vale siempre y en todo lugar', 'c) Solo vale para fábricas', 'd) Era una broma'], a: 0 },
  { q: 'El monopsonio produce salarios bajos porque…', o: ['a) El dueño es mala persona', 'b) El trabajador no tiene a dónde ir a comparar', 'c) La ley lo permite expresamente', 'd) Los trabajadores no se esfuerzan'], a: 1 },
  { q: 'Card y Krueger (1994) encontraron que…', o: ['a) El salario mínimo destruye siempre el empleo', 'b) El monopsonio no existe', 'c) Un aumento del salario mínimo no produjo la caída de empleo que el modelo simple predecía', 'd) Los datos no servían'], a: 2 },
  { q: 'En el mercado de los limones, la razón de que los buenos se retiren es que…', o: ['a) Los compran primero', 'b) El Estado los prohíbe', 'c) Sus dueños no quieren venderlos nunca', 'd) A precio de promedio no les conviene vender'], a: 3 },
  { q: 'Greenwald y Stiglitz (1986) demostraron que…', o: ['a) Con información imperfecta la ineficiencia es la regla, no la excepción', 'b) La información siempre acaba siendo perfecta', 'c) Akerlof se equivocó', 'd) Los seguros no funcionan'], a: 0 },
  { q: 'La escalera de Minsky va de…', o: ['a) Rico a pobre', 'b) Prudente a especulativo, y de especulativo a esquema de pirámide', 'c) Público a privado', 'd) Local a internacional'], a: 1 },
  { q: 'El informe de la Financial Crisis Inquiry Commission se cita en esta casa…', o: ['a) Solo su resumen', 'b) Sin fecha', 'c) Con sus disidencias incluidas, porque no fue unánime', 'd) Como fuente militante'], a: 2 },
  { q: 'El modo de fallar propio de esta etapa es…', o: ['a) Negar que existan fallas', 'b) Citar demasiadas fuentes', 'c) Exagerar las cifras', 'd) Usar las fallas como consigna en vez de como diagnóstico'], a: 3 },
  { q: 'Un diagnóstico completo de esta etapa incluye…', o: ['a) El nombre de la falla, la regla que la corrige y el costo de esa regla', 'b) Solo el nombre de la falla', 'c) Solo la denuncia', 'd) Una cita de autoridad'], a: 0 },
  { q: 'Cuando se compara una falla de mercado con una intervención, la comparación honesta se hace…', o: ['a) Con el mejor gobierno imaginable', 'b) Contra la alternativa real y concreta, con su propia falla', 'c) Con otro país cualquiera', 'd) Con el pasado'], a: 1 },
  { q: 'Que un médico sepa más que su paciente es un caso de…', o: ['a) Externalidad', 'b) Monopolio', 'c) Información asimétrica', 'd) Falla dinámica'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'El teorema de la eficiencia pide ___ supuestos.', a: 'cuatro' },
  { q: 'El costo que recae sobre quien no participó se llama ___.', a: 'externalidad' },
  { q: 'Pigou publicó «The Economics of Welfare» en ___.', a: '1920' },
  { q: 'Coase publicó «The Problem of Social Cost» en ___.', a: '1960' },
  { q: 'Coase rechazó la versión de manual de su idea en el libro de ___.', a: '1988' },
  { q: 'El único que compra y paga de menos ejerce ___.', a: 'monopsonio' },
  { q: 'La referencia académica del monopsonio la escribió Alan ___.', a: 'Manning' },
  { q: 'El estudio del salario mínimo de 1994 lo firmaron Card y ___.', a: 'Krueger' },
  { q: 'Akerlof tituló su artículo de 1970 «The Market for ___».', a: 'Lemons' },
  { q: 'Akerlof recibió el Nobel de Economía en ___.', a: '2001' },
  { q: 'Greenwald y ___ demostraron en 1986 el resultado general.', a: 'Stiglitz' },
  { q: 'Minsky sostuvo que la ___ incuba inestabilidad.', a: 'estabilidad' },
  { q: 'El libro de Minsky de 1986 se llama «Stabilizing an Unstable ___».', a: 'Economy' },
  { q: 'El informe oficial de la crisis se publicó en ___.', a: '2011' },
  { q: 'Ninguna regla es ___: siempre hay que decir qué cuesta y a quién.', a: 'gratis' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'La letra pequeña', def: 'Los cuatro supuestos que el teorema necesita para valer' },
  { term: 'Externalidad', def: 'El costo que paga quien no firmó nada' },
  { term: 'Pigou (1920)', def: 'Un impuesto del tamaño del daño, para que el precio diga la verdad' },
  { term: 'Coase (1960)', def: 'Con derechos claros, las partes pueden negociar solas' },
  { term: 'Coase (1988)', def: 'La rectificación: vale donde negociar cuesta poco' },
  { term: 'Monopolio', def: 'El único que vende: cobra de más' },
  { term: 'Monopsonio', def: 'El único que compra: paga de menos, sin violar ley alguna' },
  { term: 'Manning (2003)', def: 'La referencia académica de la falla que casi nadie enseña' },
  { term: 'Card y Krueger (1994)', def: 'La disputa viva del salario mínimo, con Neumark y Wascher enfrente' },
  { term: 'Akerlof (1970)', def: 'El mercado que se deshace solo, y el Nobel de 2001' },
  { term: 'Greenwald y Stiglitz (1986)', def: 'La ineficiencia como regla cuando la información es imperfecta' },
  { term: 'Minsky (1986)', def: 'La estabilidad incuba inestabilidad' },
  { term: 'El informe de 2011', def: 'La investigación oficial de la crisis, con sus disidencias' },
  { term: 'La hoja de la falla', def: 'Mercado, supuesto roto, nombre, regla y factura' },
  { term: 'Ninguna regla es gratis', def: 'Quién la aplica, cuánto cuesta y contra qué alternativa real' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'En el barrio se presta dinero sin papeles y a interés diario. Puesto en años, el interés es enorme comparado con el de un banco, y aun así la gente va, porque al banco no puede ir.' },
  { txt: 'Una consulta en la clínica privada cuesta L 600, y quien la paga no tiene manera de saber si necesitaba los exámenes que le mandaron. El médico sí lo sabe, y cobra por decírselo.' },
  { txt: 'En muchos pueblos hay un solo lugar que da trabajo con planilla y seguro. El resto es informal o es irse. El salario que paga ese lugar es bajo, y nadie ha violado ninguna ley.' },
  { txt: 'En la colonia donde estudian las niñas hay un solo proveedor de internet. El servicio se cae, sube de precio, y no hay a quién cambiarse.' },
  { txt: 'Un taller lava piezas y tira el agua sucia a la quebrada. Aguas abajo hay una aldea que no firmó nada con nadie. El taller cumple con lo que le piden y vende barato.' },
  { txt: 'Después de aprender las cuatro fallas, Jael escribe en su cuaderno la conclusión que a todo el mundo le sale primero: «entonces el mercado no sirve».' },
  { txt: 'Ofrecen un carro usado a un precio muy bueno y en la casa todos desconfían sin saber explicar por qué. Angelly pregunta por qué si está barato es sospechoso.' },
  { txt: 'M.E.T.A.S es gratis, y por eso nadie puede juzgar si una misión es buena antes de usarla; y si es mala, se abandona en silencio y la casa no se entera.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. Describe el mercado y di qué supuesto del teorema se rompió: mercados completos, información perfecta, nadie con poder, o nada sobre terceros.',
  '2. Ponle nombre a la falla, con su apellido: externalidad, poder de mercado (monopolio o monopsonio), información asimétrica o falla dinámica.',
  '3. ¿Qué fuente de esta etapa la explica, con su etiqueta de estatus? Nombra también la contracrítica que va al lado, si la hay.',
  '4. Propón la regla que la corregiría, di quién la aplicaría y cómo se comprobaría, y calcula qué cuesta y a quién. Compárala con la alternativa real, no con un gobierno imaginario.',
]);
B.critCaseGuides = JSON.stringify([
  'Se empieza describiendo el mercado como se describe un inventario: quién vende, quién compra, qué se intercambia y cuántos hay de cada lado. Ese último dato es el que casi siempre resuelve el caso, y casi nadie lo anota. Después se van revisando los cuatro supuestos uno por uno, en orden y sin saltarse ninguno, porque la falla suele estar en el que menos se sospecha: mercados completos, información perfecta, ningún participante con poder para mover el precio, y ningún costo que recaiga sobre quien no participó. Conviene escribir cuál se rompió antes de nombrar la falla, y no al revés, porque el nombre viene del supuesto y no de la intuición. Y hay que resistir la tentación de encontrar las cuatro fallas en todos lados: cuando de verdad hay más de una, como en el préstamo de la esquina, se dicen las dos y se dice cuál pesa más.',
  'El nombre importa porque de él sale el remedio, y sin nombre no hay remedio que discutir. Externalidad si el costo recae sobre quien no participó. Poder de mercado si alguien puede mover el precio, y aquí hay que distinguir las dos formas y decir cuál es: monopolio si el que manda es el que vende y cobra de más, monopsonio si es el que compra y paga de menos. Información asimétrica si una parte sabe lo que la otra no puede saber. Y falla dinámica si el problema no está en un momento sino en la trayectoria, es decir si los años buenos son los que fabrican el accidente. Un aviso que esta etapa repite: la falla está en la estructura y no en las personas, de modo que decir monopsonio no es decir que el dueño sea mala persona, y quien salta de la falla a la acusación cometió el error de la etapa anterior, que era la brocha gorda con otro vocabulario.',
  'Toda fuente pasa por la regla del estatus, y aquí las etiquetas están fijadas: Pigou, «The Economics of Welfare» (1920), clásico sólido; Coase, «The Problem of Social Cost» (1960), clásico sólido y la contracrítica obligada, que entra siempre con la advertencia del propio autor de que su argumento vale donde negociar cuesta poco, rechazada la versión de manual por escrito en «The Firm, the Market and the Law» (1988); Akerlof, «The Market for Lemons» (1970), clásico sólido, Nobel en 2001; Greenwald y Stiglitz (1986), el resultado general; Manning, «Monopsony in Motion» (2003), la referencia académica del monopsonio; Card y Krueger (1994) contra Neumark y Wascher, disputa empírica viva que se enseña como disputa; Minsky (1986), heterodoxo en su día y rehabilitado tras 2008; y el informe de la Financial Crisis Inquiry Commission (2011), fuente oficial y citada con sus disidencias. Y la contracrítica se nombra junto con la crítica y no debajo, que es donde muere lo que incomoda.',
  'El caso cierra con la parte que separa el diagnóstico del desahogo, y son tres piezas. La regla, escrita de modo que se sepa quién la aplica y cómo se comprobaría que funcionó: no vale «que alguien regule», vale «que se publiquen los precios y que el colegio profesional lo verifique cada año». La factura de esa regla, es decir cuánto cuesta y sobre quién cae, porque ninguna regla es gratis y varias encarecen justo lo que querían abaratar. Y la comparación, que es la que casi nadie hace: la falla de mercado se compara con la falla de gobierno concreta, con nombre y con historia, y no con un ministerio imaginario que siempre acierta; y esa comparación corta en las dos direcciones, porque negar la falla porque el remedio es difícil tampoco es rigor, es comodidad. Encima de las tres va el pago de la casa: cuando el mercado auditado es el propio, la misma vara, y el renglón de qué evidencia haría cambiar la decisión, con fecha.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"El mercado falla, y por eso la gente pobre paga más".', g1: 'Puede ser cierto y aun así no sirve: no dice cuál de las cuatro fallas está mirando, así que no hay regla que proponer ni costo que calcular ni forma de saber si la regla empeoraría las cosas.', g2: 'La corrección nombra las fallas concretas: hay información asimétrica, porque quien presta no puede saber quién va a pagar y cobra a todos como al peor; y hay poder de mercado local, porque en tres cuadras no hay a quién más pedirle. Cada una tiene su regla y su costo.' },
  { txt: '"Coase demostró que las externalidades se arreglan solas".', g1: 'Es la versión de manual, y la rechazó el propio Coase por escrito en 1988. Su argumento supone que negociar cueste poco, y con una aldea entera, sin abogado y sin tiempo, negociar cuesta carísimo.', g2: 'La corrección deja la pregunta abierta y medible: lo que hay que averiguar en cada caso es cuánto cuesta negociar de verdad. Si cuesta poco, Coase; si cuesta mucho, la propuesta de Pigou vuelve a la mesa. El autor que corrige el uso que hacen de él es mejor fuente que sus divulgadores.' },
  { txt: '"Ese patrón paga poco porque es un abusivo".', g1: 'Confunde la estructura con las personas. Donde hay un solo comprador de trabajo el salario baja aunque el dueño sea honrado, porque el trabajador no tiene a dónde ir a comparar; y si el dueño fuera un santo, el efecto seguiría ahí.', g2: 'La corrección nombra el monopsonio y cambia el remedio de sitio: no se cura riñendo al amo, se cura haciendo que haya otro amo a quien irse, o poniendo un piso que la teoría del monopsonio permite discutir en serio. Ahí entra la disputa de Card y Krueger contra Neumark y Wascher, y entra como disputa.' },
  { txt: '"Como el mercado tiene fallas, que lo regule el Estado".', g1: 'Falta el paso del medio, que es el más importante: de que un mercado falle no se sigue que otro arreglo lo haga mejor. Eso se demuestra caso por caso, y se compara con la falla de gobierno concreta y no con un gobierno imaginario que siempre acierta.', g2: 'La corrección exige tres datos antes de proponer: quién aplicaría la regla, con qué capacidad real, y qué pasó las otras veces que se aplicó algo parecido. Regular el precio del internet suena bien hasta que nadie tiende cable nuevo, y ese riesgo se escribe junto con la propuesta.' },
  { txt: '"Ese estudio del salario mínimo ya zanjó la discusión".', g1: 'No la zanjó. Card y Krueger midieron un caso en 1994 y no hallaron la caída de empleo que el modelo simple predecía; Neumark y Wascher los rebatieron con otros datos y otro método, y la disputa sigue abierta en las mejores revistas.', g2: 'La corrección es de estatus: entra como disputa empírica viva, con los dos nombres y con la pregunta que la resolvería, que es cuánto poder de compra tiene de verdad el empleador de ese mercado. Declararla cerrada hacia cualquier lado es vender bando.' },
  { txt: '"Nombramos la falla y propusimos la regla: el caso está cerrado".', g1: 'Falta la factura, que es la casilla que la casa no perdona. Una regla sin costo declarado es un deseo con vocabulario técnico, y varias reglas encarecen exactamente lo que querían abaratar.', g2: 'La corrección añade tres renglones: cuánto cuesta aplicarla, quién paga ese costo, y contra qué alternativa real se está comparando. Con eso la propuesta se puede discutir con alguien que piense distinto, que es la única prueba que vale.' },
]);
B.critDecisionBank = JSON.stringify([
  'La casa va a escribir una misión sobre el préstamo de la esquina: ¿qué falla se nombra primero, y qué regla se propone sin dejar a la gente con el problema y sin el préstamo?',
  'Hay que explicarle a la familia por qué la consulta de L 600 no se juzga como se juzga el precio del maíz: ¿qué se dice exactamente, y qué NO se dice de los médicos?',
  'El caso del único empleador entra al expediente: ¿cómo se escribe para que sea categoría y no denuncia con nombre propio, y qué se hace con la disputa del salario mínimo?',
  'La escuela pide ayuda con el internet de la colonia: ¿cuál de las tres reglas posibles se recomienda, y qué factura se declara junto con la recomendación?',
  'El caso de la quebrada va a la ficha: ¿se resuelve por Pigou o por Coase, y qué dato hace falta medir antes de poder contestar eso?',
  'La frase de Jael ya está escrita en el cuaderno: ¿se borra, se matiza o se reescribe? ¿Con qué tres renglones exactos?',
  'Angelly quiere comprar el carro usado barato: ¿qué tres cosas se piden antes de comprar, y qué se le explica sobre lo que cuesta cada una?',
  'La falla propia de M.E.T.A.S ya está diagnosticada: ¿qué regla se pone la casa, quién la verifica, y qué evidencia la haría cambiar?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Escribir «en esta colonia hay un solo proveedor de internet: es poder de mercado del que vende».', b: 'Escribir «el internet aquí es un abuso».', ga: 'Caso A: nombra la falla, y del nombre salen las tres reglas posibles con sus tres facturas, así que la conversación puede terminar en una decisión.', gb: 'Caso B: describe un sentimiento verdadero y no propone nada; se puede repetir toda la vida sin que cambie el servicio ni el precio.', gr: 'La diferencia no es de tono sino de uso: solo la primera se puede llevar a una reunión donde haya que decidir algo.' },
  { a: 'Citar a Coase con su advertencia de 1988 al lado.', b: 'Citar a Coase como si hubiera refutado a Pigou de una vez por todas.', ga: 'Caso A: deja la pregunta donde de verdad está, que es cuánto cuesta negociar en el caso concreto, y esa pregunta se puede medir.', gb: 'Caso B: usa a un autor contra sí mismo, porque él rechazó por escrito esa lectura, y además cierra una discusión que sigue abierta.', gr: 'Cuando un autor corrige el uso que hacen de él, esa corrección es parte de la fuente y no una curiosidad biográfica.' },
  { a: 'Decir que el salario bajo del único empleador es monopsonio.', b: 'Decir que el salario bajo del único empleador es abuso del dueño.', ga: 'Caso A: la explicación funciona aunque el dueño sea honrado, y por eso señala el remedio correcto, que es que haya otro comprador o un piso discutido con datos.', gb: 'Caso B: puede ser cierto o no, no se puede comprobar, y de camino agravia a una persona; y si el dueño cambia, el problema sigue igual.', gr: 'La falla está en la estructura y no en las personas: esa distinción es la que separa esta etapa del insulto con vocabulario técnico.' },
  { a: 'Proponer una regla con su costo y con la alternativa real al lado.', b: 'Proponer una regla porque la falla es evidente.', ga: 'Caso A: se puede discutir con alguien que piense distinto, y si la regla resulta peor que la falla, se sabe a tiempo.', gb: 'Caso B: se siente más urgente y produce reglas que encarecen justo lo que querían abaratar, que es la falla de gobierno de manual.', gr: 'Ninguna regla es gratis: la factura no es un apéndice del diagnóstico, es la mitad que lo vuelve utilizable.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se dice «el mercado falla» sin nombrar cuál de las cuatro.', guide: 'La frase no se puede usar para nada: no hay regla que se siga de ella, no hay costo que calcular y no hay manera de comprobar si el remedio funcionó. Y de paso enseña a los que escuchan que en esta casa las palabras nuevas se usan como banderas.' },
  { cause: 'Se revisan los cuatro supuestos uno por uno antes de nombrar la falla.', guide: 'El nombre sale del supuesto roto y no de la intuición, que es lo que evita el diagnóstico de moda; y cuando hay más de una falla, como en el préstamo de la esquina, se ven las dos en vez de quedarse con la primera que suena.' },
  { cause: 'Se cita a Coase sin su advertencia de 1988.', guide: 'Se convierte una contracrítica seria en una excusa para no hacer nada, y se usa a un autor en contra de lo que él mismo dejó por escrito; además se pierde la única pregunta útil del caso, que es cuánto cuesta negociar de verdad ahí.' },
  { cause: 'Se confunde la falla estructural con la maldad de una persona.', guide: 'El diagnóstico apunta al remedio equivocado: se pide que el dueño cambie de actitud cuando lo que hace falta es otro comprador o un piso discutido con datos; y de camino se agravia a alguien por algo que la estructura explica sin necesidad de culpables.' },
  { cause: 'Se propone una regla sin declarar su factura.', guide: 'Aparecen las reglas que encarecen lo que querían abaratar y los reguladores que nadie puede pagar; y cuando la regla falla, el que la propuso no tiene con qué defenderse, porque nunca dijo qué esperaba que costara.' },
  { cause: 'Se compara la falla de mercado con la falla de gobierno concreta.', guide: 'La discusión deja de ser una pelea de fe y se vuelve una comparación con datos, en la que puede ganar cualquiera de los dos lados según el caso; y esa es exactamente la disciplina que la materia quiere instalar, porque es la que sirve para decidir un martes por la mañana.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'El caso del préstamo de la esquina entró al expediente con sus dos fallas nombradas.', guide: 'Información asimétrica, porque quien presta no puede saber quién va a pagar y cobra a todos como al peor; y poder de mercado local, porque en tres cuadras no hay a quién más pedirle. Con las dos nombradas aparecieron dos reglas distintas, y quedó escrito que prohibir el préstamo sin resolver ninguna deja a la gente con el problema y sin el préstamo.' },
  { effect: 'La familia entendió por qué la consulta médica no se juzga como el precio del maíz.', guide: 'Porque el que paga es exactamente el que menos sabe lo que necesita, que es información asimétrica en su forma más pura. Y quedó dicho lo que no se concluye: la falla existe aunque todos los médicos sean honrados, porque está en la estructura. De ahí salieron las reglas que existen en todos los países, y su factura, porque alguna encarece la consulta que quería abaratar.' },
  { effect: 'El caso del único empleador quedó escrito como categoría y no como denuncia.', guide: 'Se estudió la estructura del monopsonio sin nombrar ninguna empresa con pleito abierto ni a nadie en campaña, que es la regla de selección de esta materia. Y la disputa del salario mínimo entró como disputa: Card y Krueger de un lado, Neumark y Wascher del otro, con la pregunta que la resolvería anotada al margen.' },
  { effect: 'La recomendación sobre el internet de la colonia salió con sus tres facturas.', guide: 'Regular el precio y arriesgar que nadie invierta; obligar a compartir la red y tener que fijar a qué precio; o dejarlo libre y pagarlo en servicio caro y malo. Quedó escrito que decir cuál cuesta menos exige números que la casa todavía no tiene, así que eso figura como pendiente y no como opinión.' },
  { effect: 'La frase de Jael se reescribió y quedó en tres renglones.', guide: 'La falla con su nombre, la regla que otros países usan, y el costo de esa regla. Con eso la frase pasó de consigna a diagnóstico, y se puede comprobar si funcionó. Y quedó el apunte de método: nombrar bien la falla ya es la mitad del trabajo, y es la mitad que casi nunca se hace.' },
  { effect: 'La falla propia de M.E.T.A.S quedó diagnosticada y con su regla escrita.', guide: 'Es información asimétrica agravada por la gratuidad: un producto gratis y malo se abandona en silencio y nadie se entera, que es la peor señal posible para quien lo escribe. Las reglas que la casa se puso son las fuentes con su etiqueta, la pauta al lado del ejercicio y las sondas antes de publicar. Y su renglón: si tres familias abandonan una misión sin decir por qué, la señal que falta hay que ir a buscarla.' },
]);

/* ---------- línea de tiempo: las cuatro fallas y sus fechas ---------- */
B.timelineData = JSON.stringify([
  { y: '1920', icon: '🌊', label: 'Pigou y la externalidad', text: 'En <strong>«The Economics of Welfare»</strong>, Arthur Pigou describe el costo que recae sobre quien no participó y propone que <strong>el precio diga la verdad</strong>, con un impuesto del tamaño del daño. Etiqueta: <strong>clásico sólido</strong>. Es la primera falla y la más visible de las cuatro.' },
  { y: '1960', icon: '🤝', label: 'Coase responde', text: 'En <strong>«The Problem of Social Cost»</strong>, Ronald Coase objeta que <strong>si los derechos de propiedad están claros, las partes pueden negociar</strong> y llegar solas al resultado, sin impuesto. Etiqueta: <strong>clásico sólido, y la contracrítica obligada</strong>: en esta casa entra siempre al lado de Pigou y no debajo.' },
  { y: '1970', icon: '🍋', label: 'Akerlof y los limones', text: '<strong>«The Market for Lemons»</strong>: si el que vende sabe y el que compra no, el comprador ofrece precio de promedio, los buenos se retiran y <strong>el mercado se degrada solo, sin que nadie haga trampa</strong>. Etiqueta: <strong>clásico sólido</strong>, y su autor recibió el <strong>Nobel de Economía en 2001</strong>.' },
  { y: '1986', icon: '📐', label: 'Greenwald, Stiglitz y Minsky', text: 'Dos piezas el mismo año. <strong>Greenwald y Stiglitz</strong> demuestran que <strong>con información imperfecta la ineficiencia es la regla</strong>, no la excepción. Y <strong>Hyman Minsky</strong> publica <strong>«Stabilizing an Unstable Economy»</strong>: <strong>la estabilidad incuba inestabilidad</strong>. Etiqueta de Minsky: <strong>heterodoxo en su día</strong>.' },
  { y: '1988', icon: '⚠️', label: 'Coase corrige a sus lectores', text: 'En <strong>«The Firm, the Market and the Law»</strong>, Coase <strong>rechaza por escrito la versión de manual de su propia idea</strong>: su argumento vale donde negociar cuesta poco, que es donde la falla menos importa. <strong>Un autor que corrige el uso que hacen de él es mejor fuente que sus divulgadores.</strong>' },
  { y: '1994', icon: '⚖️', label: 'Card y Krueger, y la réplica', text: '<strong>David Card</strong> y <strong>Alan Krueger</strong> miden un aumento real del salario mínimo y <strong>no encuentran la caída de empleo</strong> que el modelo simple predecía; <strong>Neumark y Wascher</strong> los rebaten con otros datos y otro método. Etiqueta: <strong>disputa empírica viva</strong>, y viva se enseña.' },
  { y: '2008 y 2011', icon: '🏚️', label: 'La crisis, y su informe', text: 'La crisis financiera <strong>rehabilita a Minsky</strong>, a quien media profesión vuelve a leer de golpe. La <strong>Financial Crisis Inquiry Commission</strong> publica su informe en <strong>2011</strong>: <strong>fuente oficial, y se cita con sus disidencias incluidas</strong>, porque la comisión no fue unánime y omitirlo sería el vicio que el informe examina.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  externalidad: {
    nombre: 'Externalidades', icon: '🌊',
    estructura: { title: 'Qué es', info: '• <strong>El costo que recae sobre quien no participó</strong> en el intercambio<br>• Rompe el cuarto supuesto: <strong>nada que caiga sobre terceros</strong><br>• El precio no lo incluye, así que <strong>el precio miente por omisión</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se busca <strong>a quién le cae el costo sin haber firmado nada</strong><br>• El humo, el ruido, el río, la represa que exporta y deja el daño<br>• Y se pregunta si ese costo <strong>aparece o no en el precio</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Citar a <strong>Coase sin su advertencia de 1988</strong>, que es media cita<br>• O citar a <strong>Pigou como si poner el impuesto fuera fácil</strong>: hay que medir el daño<br>• Y olvidar la pregunta que decide: <strong>cuánto cuesta negociar aquí</strong>' },
    cuidados: { title: 'En esta casa', info: '• <strong>Pigou (1920) y Coase (1960) entran juntos</strong>, y al lado y no debajo<br>• Con la rectificación del propio Coase, de <strong>1988</strong><br>• Y los conflictos del patio entran <strong>como categoría, no con nombre propio</strong>' },
  },
  poder: {
    nombre: 'Poder de mercado', icon: '🏭',
    estructura: { title: 'Qué es', info: '• Alguien puede <strong>mover el precio</strong>, y rompe el tercer supuesto<br>• <strong>Monopolio:</strong> el único que vende, y cobra de más<br>• <strong>Monopsonio:</strong> el único que compra, y paga de menos' },
    funcion: { title: 'Cómo se reconoce', info: '• Se cuenta <strong>cuántos hay de cada lado</strong>, que es el dato que casi nadie anota<br>• Si el que vende no tiene competencia, sube el precio<br>• Si el que compra no la tiene, <strong>baja el salario sin violar ley alguna</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Enseñar solo el monopolio y <strong>saltarse el monopsonio</strong>, que toca a más gente<br>• Confundir la <strong>estructura</strong> con la maldad del dueño<br>• Y declarar resuelta la disputa del salario mínimo, hacia cualquier lado' },
    cuidados: { title: 'En esta casa', info: '• La referencia es <strong>Manning (2003)</strong>, y se cita con su nombre<br>• <strong>Card y Krueger (1994) contra Neumark y Wascher</strong>: disputa viva<br>• Y el remedio no es reñir al amo: es <strong>que haya otro amo a quien irse</strong>' },
  },
  informacion: {
    nombre: 'Información asimétrica', icon: '🍋',
    estructura: { title: 'Qué es', info: '• <strong>Uno sabe y el otro no</strong>, y rompe el segundo supuesto<br>• <strong>Akerlof (1970):</strong> el mercado puede deshacerse solo, sin fraude<br>• <strong>Greenwald y Stiglitz (1986):</strong> la ineficiencia es la regla, no la excepción' },
    funcion: { title: 'Cómo se reconoce', info: '• Se pregunta <strong>quién puede juzgar la calidad antes de pagar</strong><br>• Si la respuesta es «el que vende», ahí está la falla<br>• Señal práctica: <strong>cuando uno no confía en el precio y busca a una persona</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Concluir que <strong>el que sabe más está estafando</strong>: la falla es estructural<br>• Pedir para ese mercado <strong>las mismas reglas que para el maíz</strong><br>• Y olvidar que <strong>garantías, certificaciones y segundas opiniones cuestan</strong>' },
    cuidados: { title: 'En esta casa', info: '• Akerlof entra con su <strong>Nobel de 2001</strong> y con su etiqueta<br>• El caso propio se audita igual: <strong>M.E.T.A.S es gratis y nadie puede juzgarla antes</strong><br>• Y lo que sobrevive se dice: <strong>la falla no vuelve deshonesto a nadie</strong>' },
  },
  dinamica: {
    nombre: 'La falla dinámica', icon: '🎈',
    estructura: { title: 'Qué es', info: '• <strong>La estabilidad incuba inestabilidad</strong>, de <strong>Minsky (1986)</strong><br>• No es la falla de un momento: es la del <strong>camino</strong><br>• El sistema se rompe <strong>en la cima y no en el pozo</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Tres escalones: <strong>prudente, especulativo y pirámide</strong><br>• Se mira <strong>con qué se pagan las deudas</strong>: producción, refinanciación o subida de precio<br>• Y la señal de alarma: <strong>todos convencidos de que el riesgo bajó</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Creer que las crisis vienen siempre <strong>de afuera</strong> o de un culpable<br>• Usar 2008 <strong>sin su expediente</strong>: burbuja, derivados, rescate y quién pagó<br>• Y citar el informe de 2011 <strong>sin sus disidencias</strong>' },
    cuidados: { title: 'En esta casa', info: '• Minsky con su etiqueta entera: <strong>heterodoxo, y rehabilitado tras 2008</strong><br>• La <strong>Gran Depresión vive en Economía política</strong>, y aquí solo se saluda<br>• Lo que esta materia se queda entero es <strong>2008 con su ficha completa</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Dice «el mercado falla» y se queda ahí 📢' },
  { t: 25, n: 'Se sabe los cuatro supuestos del teorema 📜' },
  { t: 55, n: 'Nombra la externalidad y trae a Coase con su aviso 🌊' },
  { t: 90, n: 'Distingue el monopolio del monopsonio 🏭' },
  { t: 130, n: 'Reconoce una asimetría en la calle 🍋' },
  { t: 165, n: 'Ve la falla dinámica cuando todo va bien 🎈' },
  { t: 190, n: 'Nombra la falla, propone la regla y calcula su factura 🔧' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de las cuatro fallas superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la etapa explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de fallas y de consignas' },
  id_master: { icon: '🔍', label: 'Identificador de fallas y fuentes maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del taller' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta del Expediente Dorado completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  { t: 'Borges', q: '¿Qué heredó el narrador de su padre, además del depósito?', o: ['a) Los manuales de todo lo que había vendido', 'b) Una biblioteca de economía', 'c) Un taller mecánico', 'd) Una deuda con el banco'], c: 0 },
  { t: 'Borges', q: '¿Por qué no estaba fallada la bomba de agua que le devolvieron?', o: ['a) Porque era nueva', 'b) Porque el comprador había violado tres de sus cuatro condiciones de operación', 'c) Porque la habían reparado antes', 'd) Porque el manual estaba equivocado'], c: 1 },
  { t: 'Borges', q: 'Según el sobrino, ¿quién escribió la letra chica del teorema de la eficiencia?', o: ['a) Los adversarios del comercio', 'b) Nadie: no tiene letra chica', 'c) Los mismos que demostraron el teorema, y a varios les dieron el Nobel por eso', 'd) Los fabricantes de maquinaria'], c: 2 },
  { t: 'Borges', q: '¿Por qué el narrador dice que llevaba treinta años dentro de un teorema?', o: ['a) Porque estudió economía de joven', 'b) Porque su padre era profesor', 'c) Porque había leído a Akerlof sin darse cuenta', 'd) Porque había vendido bombas buenas a precio bajo por no poder demostrar que eran buenas'], c: 3 },
  { t: 'Borges', q: '¿Cómo quedó su teoría después de rehacerla?', o: ['a) Más pequeña y más útil: solo se usa bien una máquina si se leen las dos páginas', 'b) Más ambiciosa que antes', 'c) Igual, pero con más ejemplos', 'd) Abandonada'], c: 0 },
  { t: 'Cervantes', q: '¿Qué le pregunta Sancho a don Quijote después del encinar?', o: ['a) Si el amo era rico', 'b) Cómo puede ser que el remedio salga más caro que la enfermedad', 'c) Cuánto le debían al muchacho', 'd) Si habrá que volver por ese camino'], c: 1 },
  { t: 'Cervantes', q: '¿Cómo explica don Quijote su propio error?', o: ['a) Que no debió meterse', 'b) Que el muchacho mintió', 'c) Que tomó juramento y se fue, que es poner la ley y no dejar quien la mire', 'd) Que el amo era más fuerte que él'], c: 2 },
  { t: 'Cervantes', q: 'Según don Quijote, ¿por qué le pagaban tan poco al muchacho?', o: ['a) Porque guardaba mal las ovejas', 'b) Porque era muy joven', 'c) Porque así era la costumbre', 'd) Porque en aquel valle no había más que un amo'], c: 3 },
  { t: 'Cervantes', q: '¿Qué razón da Sancho para no pagar por el jubón lo que vale uno de Segovia?', o: ['a) Que como no puede saber si lo es, ofrece lo que vale un jubón que puede que no lo sea', 'b) Que no tiene dinero', 'c) Que el buhonero es tramposo', 'd) Que ya tiene otro jubón'], c: 0 },
  { t: 'Cervantes', q: '¿Qué le responde don Quijote cuando Sancho propone que un rey muy sabio ponga los precios?', o: ['a) Que es una idea excelente', 'b) Que de que una cosa esté mal no se sigue que otra la componga, y que hay que comparar remedio con remedio', 'c) Que los reyes no saben de precios', 'd) Que mejor lo decida el concejo'], c: 1 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué tiene de extraordinario la máquina que inventamos?', o: ['a) Que la dirige un plano central', 'b) Que funciona sin errores', 'c) Que coordina a millones de personas que no se conocen, sin que nadie mande', 'd) Que es reciente'], c: 2 },
  { t: 'Harari', q: '¿Por qué dice el ensayo que importa quién escribió la página de condiciones?', o: ['a) Porque estaba en otro idioma', 'b) Porque se perdió durante años', 'c) Porque la escribió un solo autor', 'd) Porque la escribieron los propios economistas, y despacharla como crítica del otro bando revela no haber leído a ninguno'], c: 3 },
  { t: 'Harari', q: '¿Qué dice el ensayo sobre por qué el monopsonio se enseña menos que el monopolio?', o: ['a) Que la asimetría es curiosa, porque el monopsonio toca a más gente: casi todos vendemos tiempo', 'b) Que es una falla menos importante', 'c) Que se descubrió hace poco', 'd) Que solo ocurre en países ricos'], c: 0 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué hay que hacer cuando un mercado tiene una falla demostrada?', o: ['a) Intervenir de inmediato', 'b) Contestar aparte una segunda pregunta: si la intervención concreta lo mejora, comparada con la alternativa real', 'c) Dejarlo como está', 'd) Buscar un culpable'], c: 1 },
  { t: 'Harari', q: '¿Cuál es el ejercicio de tres preguntas que propone el final del ensayo?', o: ['a) Quién gana, quién pierde y quién manda', 'b) Cuándo, dónde y cómo', 'c) Cuál falla es, qué regla la corrige y cuánto cuesta esa regla', 'd) Qué dice la ley, qué dice el juez y qué dice la gente'], c: 2 },
]);
B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: 'Pigou publicó «The Economics of Welfare» en ___.', a: '1920' },
  { t: 'las tres', q: 'Coase rechazó por escrito la versión de manual de su idea en ___.', a: '1988' },
  { t: 'Borges', q: 'El narrador heredó el depósito y los manuales de su ___.', a: 'padre' },
  { t: 'Borges', q: 'La página de las condiciones de operación estaba siempre al ___ del manual.', a: 'final' },
  { t: 'Borges', q: 'A Akerlof le dieron el Nobel en ___.', a: '2001' },
  { t: 'Cervantes', q: 'El muchacho del encinar estaba atado a una ___.', a: 'encina' },
  { t: 'Cervantes', q: 'Don Quijote dice que en aquel valle no había más que un ___.', a: 'amo' },
  { t: 'Cervantes', q: 'Sancho quiere comprar un jubón que el buhonero jura ser de ___.', a: 'Segovia' },
  { t: 'Harari', q: 'El tratado de referencia del monopsonio lo escribió Alan ___.', a: 'Manning' },
  { t: 'Harari', q: 'El informe oficial de la crisis se publicó en ___ y no fue unánime.', a: '2011' },
]);
B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan a la misma disciplina por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento convierte la letra pequeña en una manía de coleccionista y por eso la vuelve memorable: la penúltima página de todos los manuales, escrita siempre en tono de disculpa, y el hallazgo de que la economía tiene la suya. Y hace algo que ninguna explicación consigue: pone al narrador dentro del teorema sin que él lo sepa, vendiendo bombas buenas a precio bajo durante treinta años por no poder demostrar que eran buenas. Eso se recuerda porque humilla un poco. El capítulo lo vuelve escena, risa y refrán, y aporta lo que los otros dos no tienen: la falla ocurriendo delante, con el muchacho atado y el amo que vuelve a atarlo, de modo que el estudiante ve el costo de una regla sin quien la mire antes de que nadie se lo explique; y además pone el monopsonio en una frase que se queda, que en aquel valle no había más que un amo. El ensayo lo pone a escala de especie y con nombres, años y disputas, y por eso es el único que sirve para citar en una discusión. Quien lee solo una se queda sin la vergüenza, sin la escena o sin la prueba.' },
  { q: '2. El capítulo cervantino se ancla en un episodio real donde don Quijote deshace un agravio y lo empeora. Explica qué falla de gobierno ilustra eso y por qué la casa lo eligió para esta etapa.', guia: 'Ilustra la falla de gobierno más común y la más barata de cometer: poner la regla y no dejar quien la mire. Don Quijote toma juramento al labrador, se marcha satisfecho, y el labrador vuelve a atar al muchacho y lo azota peor; el remedio no solo no funcionó, sino que empeoró la situación de la persona que pretendía proteger. La casa lo eligió porque esta etapa tiene dos mitades y la segunda es la que casi nadie enseña: no basta con nombrar la falla del mercado y proponer una regla, hay que preguntarse quién la aplica, con qué capacidad, y qué pasa el día que el que la impuso se va. La formulación del propio don Quijote es la que hay que memorizar: la ley que nadie mira no es ley, es un papel que enfurece al que ha de cumplirla y desampara al que había de amparar. Y hay una razón más fina para el episodio: el agravio original es de soldadas no pagadas, es decir un problema de mercado de trabajo, de modo que el mismo capítulo sirve para las dos cosas, la falla y el remedio fallido.' },
  { q: '3. Explica la conversación sobre el jubón de Segovia y por qué don Quijote dice que la respuesta de Sancho valdría un doctorado.', guia: 'Sancho palpa el jubón, lo mira al trasluz y concluye que, como no puede saber si es de Segovia, no ofrece lo que vale un jubón de Segovia sino lo que vale un jubón que puede que no lo sea; y añade la consecuencia sin darse cuenta: si el del buhonero fuese de veras bueno, el buhonero pierde y no se lo vende. Eso es exactamente el argumento de Akerlof de 1970, deducido en la venta y con las manos. Don Quijote lo formula después con más orden: cuando el que vende sabe y el que compra no, el que compra ofrece precio de en medio, el que tiene la mercancía buena se la lleva a su casa antes que malbaratarla, en la plaza van quedando las malas, el precio baja más y se van más buenas, y la plaza se despuebla de lo bueno sin que nadie haya hecho trampa. Y el capítulo no se queda ahí, que es lo que lo vuelve de esta etapa: cuando Sancho propone el remedio de llevarse el jubón ocho días a prueba, don Quijote acepta el remedio y le cobra su precio, porque los ocho días cuestan y el riesgo del buhonero cuesta, y ese costo alguien lo paga en el precio final. No hay remedio de balde.' },
  { q: '4. El narrador del cuento anota a Coase como refutación de Pigou y dice que se equivocó. Explica en qué consistió su error y por qué la casa insiste tanto en él.', guia: 'Su error fue tomar la contracrítica como una cancelación. Coase objetó en 1960 que si los derechos de propiedad están bien definidos las partes pueden negociar y llegar solas al resultado eficiente, y muchos leyeron eso como que las externalidades se resuelven solas y el impuesto de Pigou sobra. El propio Coase se encargó de aclarar que su argumento suponía que negociar no costara nada, y que un mundo así no es este; lo dejó por escrito en «The Firm, the Market and the Law», de 1988. Es decir, la refutación traía su propia letra chica, que es la simetría que el cuento celebra. La casa insiste porque este caso enseña tres cosas a la vez. Una de método: cuando un autor corrige el uso que hacen de él, esa corrección es parte de la fuente y no una curiosidad biográfica. Otra de contenido: la pregunta útil no es Pigou o Coase, sino cuánto cuesta negociar en el caso concreto que se tiene delante, y esa pregunta se puede medir. Y una tercera de honradez: citar a Coase sin la advertencia es citar la mitad que conviene, que es exactamente lo que esta materia enseña a cazar.' },
  { q: '5. Los tres textos insisten en que la crítica la firman los propios economistas. Explica por qué ese dato cambia la conversación, y qué pasaría si se omitiera.', guia: 'Cambia la conversación porque desarma la salida más común y más perezosa de las discusiones sobre el sistema, que es clasificar al que critica y despacharlo con la clasificación. Si las cuatro fallas las hubieran descrito adversarios declarados del mercado, cualquiera podría decir que están sesgadas y ahorrarse la lectura. Pero las describieron gente que aceptó todas las reglas del oficio y trabajó con sus mismas herramientas, y a varios les dieron el Nobel precisamente por eso: Akerlof en 2001, y Stiglitz también premiado por sus trabajos sobre información. Eso obliga a discutir el contenido y no la procedencia. Si se omitiera pasarían dos cosas comprobables. La primera es que la etapa se leería como panfleto, y todo el trabajo de la etapa 1, que fue poner el acero con las cifras del gran escape, quedaría anulado por el tono. La segunda es más grave y es de método: se perdería la lección de fondo, que una disciplina capaz de publicar sus propias condiciones de operación merece más respeto que sus devotos y que sus detractores, y que esa autocrítica es exactamente la señal de que se puede confiar en ella para otras cosas.' },
  { q: '6. Compara el error de don Quijote en el encinar con el error de decir «entonces el mercado no sirve». ¿En qué se parecen?', guia: 'Se parecen en la estructura, que es lo que importa. Los dos parten de un hecho verdadero: el muchacho estaba siendo azotado por soldadas que se le debían, y las cuatro fallas están demostradas. Los dos saltan del hecho a una acción sin el paso del medio. Y los dos empeoran las cosas de manera comprobable: al muchacho lo azotan peor, y la frase «el mercado no sirve» deja al que la dice sin diagnóstico, sin regla y sin manera de saber si el remedio funcionó. El paso que falta es el mismo en los dos casos y tiene dos mitades. Primero, nombrar con precisión lo que está mal, que en el encinar era un mercado de trabajo con un solo comprador y en la frase de Jael es cualquiera de las cuatro fallas sin especificar. Y segundo, preguntar qué hace falta para que el remedio se sostenga cuando el que lo impuso se dé la vuelta: quién lo aplica, con qué capacidad y a qué costo. La diferencia entre los dos casos es de época y no de lógica, y por eso el capítulo funciona como espejo: quien reconoce el error en el caballero lo reconoce después en su propio cuaderno.' },
  { q: '7. El ensayo dice que la regla de no saltar de la falla al remedio corta en las dos direcciones. Explica las dos, con un ejemplo de cada una.', guia: 'La primera dirección es la que casi todo el mundo espera: que un mercado tenga una falla demostrada no prueba que una intervención concreta lo mejore. Esa es una segunda pregunta y se contesta aparte, comparando con la alternativa real y no con un gobierno imaginario que siempre acierta. El ejemplo del ensayo es el internet de la colonia: regular el precio suena razonable hasta que nadie tiende cable nuevo, y entonces la regla que iba a abaratar el servicio termina congelándolo. La segunda dirección es la que casi nadie menciona y es igual de importante: negar la falla porque el remedio es difícil no es rigor, es comodidad, y deja a la gente con el problema y además sin diagnóstico. El ejemplo es el préstamo de la esquina: quien dice que ahí no hay falla porque las dos partes aceptaron libremente está ignorando que hay información asimétrica y poder de mercado local, y que el hecho de que un remedio sea difícil no borra ninguna de las dos. La disciplina que la casa propone es la misma para los dos lados: nombrar la falla, proponer la regla y calcular su costo, las tres cosas o ninguna.' },
  { q: '8. El cuento termina diciendo que los devotos y los detractores suelen coincidir en no haber llegado nunca a la página final. Explica esa frase y relaciónala con la posición de esta ruta.', guia: 'La frase señala que las dos posturas más ruidosas comparten un mismo defecto, que es no haber leído las condiciones de operación. El devoto usa el teorema como si valiera siempre y en todas partes, y por eso no puede explicar el préstamo de la esquina ni la consulta médica sin recurrir a que la gente se equivoca. El detractor usa las fallas como prueba de que la máquina no sirve, y por eso tampoco puede explicar por qué esa máquina produjo la salida de la pobreza que la etapa 1 documentó con cifras. Los dos se ahorran la misma página, y por eso terminan discutiendo con caricaturas. La posición de esta ruta es exactamente la del que sí llegó al final del manual: la máquina funciona, y funciona muy bien, donde se cumplen sus cuatro condiciones; donde no se cumplen hace falta diseño y no fe, ni a favor ni en contra. Por eso el arco tiene siete etapas y no una: la primera pone el acero, esta pone la primera factura, y las que siguen ponen las demás. Quien se quede con una sola de las siete va a salir con media idea, y el orden está declarado para que eso no pase.' },
  { q: '9. Explica por qué el ensayo llama a la de Minsky una falla «de otro tipo», y qué la hace más difícil de creer que las otras tres.', guia: 'Las otras tres son fallas de un momento y de un supuesto concreto: en un instante dado hay un costo que cae sobre terceros, o alguien con poder para mover el precio, o una parte que sabe lo que la otra ignora. Se pueden señalar con el dedo en una transacción. La de Minsky es de trayectoria: no dice que el sistema falle en un momento, dice que el comportamiento acumulado a lo largo de los años buenos es lo que fabrica el accidente. Es más difícil de creer por dos razones. La primera es contraintuitiva: sostiene que el peligro crece cuando todo va bien, de modo que la evidencia que uno tiene delante, años sin accidentes, es precisamente la que alimenta el problema; y nadie quiere oír que su racha buena es la señal de alarma. La segunda es que no tiene culpable identificable, y las explicaciones sin culpable circulan mal: en la escalera de Minsky nadie hace nada ilegal, el prudente pasa a especulativo y el especulativo a pirámide por grados, y cada paso individual parece razonable. Por eso Minsky fue tratado como excéntrico mientras duró la calma, y por eso en 2008 media profesión volvió a leerlo de golpe, cuando el mecanismo que él había descrito ya había terminado de funcionar.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué esa etiqueta pertenece al temario de esta etapa en particular, y qué pasaría si se quitara.', guia: 'Porque esta etapa se estudia entera sobre información asimétrica, y un pastiche sin declarar es información asimétrica pura: el que lee no puede saber lo que el que escribe sí sabe, que es que esa voz no es de quien parece. El lector cree recibir la autoridad de Borges, de Cervantes o de Harari, cuando detrás hay una casa que escribe misiones para sus hijas. Enseñar el mercado de los limones y vender un limón en la misma página sería la contradicción más rápida posible. Hay además una razón que es exactamente el contenido: la etiqueta funciona como la garantía y la certificación que la propia etapa estudia, es decir como uno de esos remedios que existen para tapar la asimetría, y como todos ellos tiene un costo, que aquí es quitarle al texto parte de su prestigio prestado. Que la casa pague ese costo por escrito es la demostración práctica de que entendió la lección. Si se quitara pasarían dos cosas comprobables: alguien citaría a Pigou, a Coase o el informe de 2011 a través de una frase que ninguno escribió, y la casa quedaría produciendo la fuente inflada que su propio compendio manda cazar, en la etapa donde más caro se paga hacerlo.' },
]);

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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_dorado_fallas_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena el diagnóstico de la falla y la factura de la regla. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden, y el orden es el método. Primero se describe el mercado como se describe un inventario: quién vende, quién compra, qué se intercambia y, sobre todo, cuántos hay de cada lado, que es el dato que casi nadie anota y el que suele resolver el caso. Después se revisan los cuatro supuestos del teorema uno por uno y sin saltarse ninguno, porque la falla suele estar en el que menos se sospecha: mercados completos, información perfecta, ningún participante con poder para mover el precio, y ningún costo que recaiga sobre quien no participó. Del supuesto roto sale el nombre de la falla, y no al revés: externalidad, poder de mercado (y aquí hay que decir si es monopolio o monopsonio), información asimétrica o falla dinámica. Con el nombre puesto entran las fuentes con su etiqueta y su contracrítica al lado: Pigou 1920 y Coase 1960, clásicos sólidos los dos, y Coase siempre con su advertencia de 1988 de que su argumento vale donde negociar cuesta poco; Akerlof 1970, clásico sólido y Nobel en 2001, con el resultado general de Greenwald y Stiglitz de 1986; Manning 2003 para el monopsonio, con la disputa viva de Card y Krueger contra Neumark y Wascher; y Minsky 1986, heterodoxo en su día y rehabilitado tras 2008, con el informe oficial de 2011 citado con sus disidencias. Y al final van las dos casillas que separan el diagnóstico del desahogo: la regla, escrita de modo que se sepa quién la aplica y cómo se comprobaría que funcionó, y la factura de esa regla, es decir cuánto cuesta y sobre quién cae, porque ninguna regla es gratis y varias encarecen justo lo que querían abaratar. Encima de las dos va la comparación que casi nadie hace: la falla de mercado se compara con la falla de gobierno concreta, con nombre y con historia, y no con un ministerio imaginario que siempre acierta; y esa comparación corta en las dos direcciones, porque negar la falla porque el remedio es dificil tampoco es rigor, es comodidad. Cuando el mercado auditado es el propio, la misma vara y el renglon de que evidencia haria cambiar la decision, con fecha.";');

/* ---------- lo que arrastra el molde (la etapa 1 del Dorado) ---------- */
const textos = [
  [/📒 \*Ruta del Expediente Dorado · Etapa 1\* 📒\\n\\nLa gran fuga: nadie audita bien lo que no sabe defender con sus mejores cifras\. 📒\\n\\n_Incluye evaluación conceptual, la cifra sobre la mesa, guion de video, tres lecturas y sus 35 preguntas\._ ✍️/g,
    '🔧 *Ruta del Expediente Dorado · Etapa 2* 🔧\\n\\nLas fallas de la máquina: cada supuesto que falla es una familia de fallas reales, y todas tienen nombre. 🔧\\n\\n_Incluye evaluación conceptual, la falla sobre la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/La gran fuga/g, 'Las fallas de la máquina'],
  [/la gran fuga/g, 'las fallas de la máquina'],
  [/La cifra sobre la mesa/g, 'La falla sobre la mesa'],
  [/la cifra sobre la mesa/g, 'la falla sobre la mesa'],
  [/Etapa 1 de la Ruta del Expediente Dorado/g, 'Etapa 2 de la Ruta del Expediente Dorado'],
  [/Ruta del Expediente Dorado · Etapa 1 de 7/g, 'Ruta del Expediente Dorado · Etapa 2 de 7'],
  /* este vive en el encabezado de las dos pruebas imprimibles: no dice «de 7»
     sino «· Estudio Mayor», y es el que se le escapó al primer grep en
     misiones pasadas */
  [/Ruta del Expediente Dorado · Etapa 1 · Estudio Mayor/g, 'Ruta del Expediente Dorado · Etapa 2 · Estudio Mayor'],
  [/const msgs=\['¡Sigue llenando la hoja!','¡Muy buen trabajo!','¡Aprendiz de auditor!','¡Ya separas la línea de la atribución!','¡Haces el acero sin mueca!'\]/,
    "const msgs=['¡Sigue revisando los supuestos!','¡Muy buen trabajo!','¡Aprendiz de diagnóstico!','¡Ya distingues el monopolio del monopsonio!','¡Nombras la falla y calculas su factura!']"],
  [/\['#854d0e','#facc15','#a8a29e','#166534','#00b894'\]/, "['#164e63','#22d3ee','#a8a29e','#991b1b','#00b894']"],
  /* el azul profundo y el rojo de aviso en las pruebas y en las hojas */
  [/#854d0e/g, '#164e63'],
  [/#422006/g, '#083344'],
  [/#fffbeb/g, '#ecfeff'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/La salida masiva de la pobreza y de la muerte temprana en dos siglos\./g, 'Mercados completos, información perfecta, nadie con poder y nada sobre terceros.'],
  [/>Las fallas de la máquina \(Deaton, 2013\)</g, '>Los cuatro supuestos del teorema<'],
  /* las preguntas fijas de la prueba competencial preguntaban por la cifra */
  [/¿Cuál es el mejor caso de lo que hay sobre la mesa, dicho con sus números y sin mueca\? Llena después la hoja de la cifra, di de cuál de las dos disputas se trata si la hay, con qué fuente y con qué etiqueta, y qué queda en pie pase lo que pase\./g,
    '¿Qué supuesto del teorema se rompió en este mercado, y cómo se llama la falla que resulta? Nombra la fuente con su etiqueta y su contracrítica al lado, propón la regla que la corregiría con quién la aplica, y calcula qué cuesta esa regla y a quién.'],
  [/1\. ¿Cuál de los dos se puede sostener de pie y cuál se desarma con una pregunta\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos sirve para decidir algo y cuál solo describe un malestar? 2. ¿Por qué no son la misma decisión?'],
  /* el subtítulo del pliego de las tres lecturas */
  [/Un cuento, un capítulo de caballerías y un ensayo, sobre la misma fuga/g,
    'Un cuento, un capítulo de caballerías y un ensayo, sobre la misma letra pequeña'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'El libro que fue adelgazando',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'El catálogo de los cuatro supuestos',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'De lo que vieron en las bodas del rico, y de la cuenta que sacó Sancho antes de las ollas',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'De lo que sucedió al caballero con un muchacho atado a una encina, y de lo que sobre los amos únicos se platicó después',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'La especie que se fugó de su propia historia',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'El manual que nadie lee',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa anterior era la lámina de la cifra. Aquí es el
   cuaderno del préstamo de la esquina: la consigna o la falla con nombre. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(prueba){sfx(prueba?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(prueba){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🔧</span><span class="ms-text"><strong>Quedaron nombradas las dos fallas:</strong> «hay información asimétrica, porque quien presta no puede saber quién va a pagar y cobra a todos como al peor; y hay poder de mercado local, porque en tres cuadras no hay a quién más pedirle».</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🧾</span><span class="ms-text"><strong>Y debajo, la regla con su factura:</strong> un historial de crédito que se pueda llevar de un lado a otro atacaría la primera, y que entre alguien más a competir atacaría la segunda. Las dos cuestan, y se dice cuánto y a quién. <strong>Prohibir el préstamo sin resolver ninguna deja a la gente con el problema y sin el préstamo.</strong></span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">📢</span><span class="ms-text"><strong>Quedó una consigna:</strong> «el mercado falla y por eso la gente pobre paga más». Es verdad que algo falla, suena justo, y en el aula nadie la va a discutir, que es justo el problema.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega en dos partes:</strong> con esa frase no hay regla que proponer, ni costo que calcular, ni manera de saber si el remedio empeoraría las cosas; y de camino queda enseñado que en esta casa las palabras nuevas se usan como banderas. Se tacha y se reescribe con el nombre, la regla y la factura.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='externalidad',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"externalidad\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/📒/g, '🔧');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
