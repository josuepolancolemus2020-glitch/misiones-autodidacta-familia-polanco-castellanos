/* Inyecta los bancos de la misión «La gran fuga» (Ruta del Expediente
   Dorado, etapa 1: Crítica al Capitalismo, materia 27 del Estudio Mayor)
   sobre el molde copiado de la etapa 2 de la Ruta de los Átomos y los
   Ídolos, que es la misión más reciente y completa.
   Uso:  node _dev/inyecta-bancos-gran-fuga.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Angus Deaton, «El gran escape: salud, riqueza y los orígenes de la
       desigualdad» (2013): CLÁSICO SÓLIDO RECIENTE. Nobel de Economía en
       2015. La segunda mitad del título es parte del argumento.
     · Deirdre McCloskey, «Bourgeois Dignity» (2010): SÓLIDA EN LOS DATOS
       (el gran enriquecimiento, factor de alrededor de treinta) Y CON UNA
       TESIS CAUSAL PROPIA que entra COMO TESIS y no como consenso.
     · Jürgen Kocka, «Historia del capitalismo» (2016 en español): SÍNTESIS
       ACADÉMICA BREVE. De aquí la definición corta de cuatro piezas y la
       advertencia de las variedades.
     · Las series de pobreza del Banco Mundial y de Our World in Data:
       SIEMPRE CON FECHA, y nunca sin decir con qué línea se midió.
     · El cruce Hickel contra Roser y Pinker (2019): DISPUTA VIVA DE
       MEDICIÓN, que se enseña como disputa y no como bando.
     · El tramo chino desde 1980: hecho establecido, y DISPUTA VIVA DE
       ATRIBUCIÓN, que corta en las dos direcciones.

   La idea que ordena todos los bancos: EL ACERO PRIMERO. Esta es la
   columna del haber del expediente, y las facturas tienen etapa propia y
   declarada (las fallas de la máquina la 2, lo que el dinero no debe
   comprar la 3, la desigualdad y el clima la 4). La regla del acero se
   enseña en el expediente gemelo, el rojo, y aquí solo se aplica.

   Tres cuidados del compendio gobiernan la misión. Uno: DEFINIR VIENE
   ANTES QUE JUZGAR, y la palabra en singular ya es una simplificación,
   porque el sistema vino en variedades desde el arranque. Dos: LAS
   DISPUTAS SON DOS Y HAY QUE SEPARARLAS, la de la línea (cuánto cayó) y la
   de la atribución (a qué se debe). Tres: el modo de fallar de esta etapa
   es LA CIFRA SUELTA, el número grande sin sus cuatro datos, y contra eso
   va la hoja de la cifra; y con él la REGLA DEL PLACER, que obliga a
   auditar doble el dato que confirma lo que uno ya creía.

   Y la regla de selección de la materia, que se respeta en los bancos: los
   conflictos vivos del patio entran COMO CATEGORÍA y no como caso con
   nombre propio, y la política hondureña de hoy no entra ni de ejemplo. */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-dorado-gran-fuga', 'js', 'gran-fuga.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260901;
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
  { w: 'La gran fuga', a: '🏃 El nombre que <strong>Angus Deaton</strong> le puso en <strong>2013</strong> a la salida masiva de la pobreza y de la muerte temprana ocurrida en dos siglos. Etiqueta: <strong>clásico sólido reciente</strong>. Deaton recibió el <strong>Nobel de Economía en 2015</strong>, y tomó el título de una película de <strong>1963</strong> sobre una evasión.' },
  { w: 'La segunda mitad del título de Deaton', a: '🚪 <strong>«…salud, riqueza y los orígenes de la desigualdad»</strong>, y no es un apéndice: es el argumento. <strong>De toda fuga se queda gente adentro</strong>, y ese hueco es la materia de las etapas siguientes. Celebrar la fuga sin mirar el hueco es leer medio libro.' },
  { w: 'La definición corta de Kocka', a: '📖 De <strong>«Historia del capitalismo» (2016 en español)</strong>, <strong>síntesis académica breve</strong>. Cuatro piezas y hacen falta las cuatro: <strong>mercados, propiedad privada de los medios de producción, trabajo asalariado y ganancia reinvertida</strong>.' },
  { w: 'Definir viene antes que juzgar', a: '⚖️ Casi todas las peleas sobre el capitalismo se pelean <strong>sin definirlo</strong>, y por eso no terminan nunca. En esta casa la definición se pone primero, y con ella la advertencia: <strong>la palabra en singular ya es una simplificación</strong>.' },
  { w: 'Las variedades, desde el arranque', a: '🧵 <strong>El de Mánchester no era el de Bismarck</strong>, que en <strong>1883</strong> montó el seguro obligatorio de enfermedad; y el nórdico de hoy no es el anglosajón. Quien dice «el capitalismo» a secas usa un apellido para una familia entera.' },
  { w: 'El gran enriquecimiento', a: '📈 El cálculo de <strong>Deirdre McCloskey</strong> en <strong>«Bourgeois Dignity» (2010)</strong>: un factor de alrededor de <strong>treinta</strong> en el nivel de vida del habitante común de los países que cursaron el proceso. Etiqueta doble: <strong>sólida en los datos, y su explicación causal entra como tesis</strong>.' },
  { w: 'Las cifras de la pobreza, con su fecha', a: '📉 La pobreza extrema pasó de <strong>más de un tercio de la humanidad hacia 1990</strong> a <strong>alrededor de una décima parte antes de la pandemia</strong>, según las series del <strong>Banco Mundial</strong> y de <strong>Our World in Data</strong>. Nunca se citan sin fecha y sin decir con qué línea se midieron.' },
  { w: 'Las cifras de la vida, con su fecha', a: '❤️ A comienzos del siglo diecinueve moría antes de los cinco años <strong>cerca de la mitad</strong> de los niños del mundo; hoy, <strong>menos de uno de cada veinte</strong>. Y la esperanza de vida al nacer pasó de rondar los <strong>treinta</strong> años a superar los <strong>setenta</strong> antes de la pandemia.' },
  { w: 'La pelea de la línea', a: '⚔️ La primera disputa: <strong>cuánto</strong> cayó la pobreza, y si la línea con que se mide no será demasiado baja para llamarle vida a lo que hay encima. <strong>Jason Hickel</strong> contra <strong>Max Roser</strong> y <strong>Steven Pinker</strong>, en el cruce de <strong>2019</strong>. Etiqueta: <strong>disputa viva de medición</strong>.' },
  { w: 'La pelea de la atribución', a: '🧮 La segunda disputa: <strong>a qué se debe</strong>. El tramo mayor de la salida desde <strong>1980</strong> ocurrió en <strong>China</strong>, bajo un híbrido de partido y Estado con mercado. El dato incomoda a los dos bandos, y por eso se estudia entero.' },
  { w: 'El puente entre las dos peleas', a: '🌉 Las <strong>variedades</strong> de Kocka. Si el sistema vino en variedades, preguntar por «el capitalismo» a secas es <strong>la pregunta mal hecha</strong>, y las dos peleas dejan de gritarse y empiezan a poder resolverse por partes.' },
  { w: 'La mejor defensa moral', a: '🛡️ Dos piezas: el <strong>intercambio voluntario como cooperación entre extraños</strong> que no se conocen ni se deben nada, y el resultado sin adornos, que <strong>ningún otro arreglo conocido sacó a tanta gente de la miseria tan rápido</strong>. Se pone en pie entera, y sin mueca.' },
  { w: 'La pregunta que sí rinde', a: '🔧 No «mercado sí o mercado no», que se contesta antes de mirar el dato, sino <strong>qué mercados, con qué reglas y para qué bienes</strong>. Convierte las fallas en <strong>problemas de diseño</strong>, que es el idioma en el que una casa puede decidir algo.' },
  { w: 'La hoja de la cifra', a: '🧾 Cinco renglones ante cualquier número grande: <strong>qué afirma exactamente, cuánto y entre qué y qué, según quién y de qué año, con qué línea o método, y quién lo disputa</strong>. Con los cinco es una prueba; sin uno solo es un adorno.' },
  { w: 'El modo de fallar: la cifra suelta', a: '🎈 El error propio de esta etapa no es exagerar: es <strong>soltar un número grande sin sus cuatro datos</strong>. Tres señales: <strong>sin fecha, sin línea y sin quien la discute</strong>. Es el error que esta casa va a cometer primero, y con la mejor intención.' },
  { w: 'La regla del placer', a: '🪞 <strong>El dato que confirma lo que ya se creía paga doble auditoría</strong>, venga del estante que venga. Un número que cae justo donde a uno le convenía es exactamente el que hay que ir a verificar dos veces, y esa incomodidad es el oficio.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Qué nombró Angus Deaton como «la gran fuga»?', o: ['a) La salida masiva de la pobreza y de la muerte temprana en dos siglos', 'b) La huida de capitales de un país', 'c) La migración del campo a la ciudad', 'd) El fin de las guerras mundiales'], c: 0 },
  { q: 'La segunda mitad del título del libro de Deaton habla de…', o: ['a) La historia de la medicina', 'b) Los orígenes de la desigualdad', 'c) El comercio internacional', 'd) La revolución industrial'], c: 1 },
  { q: 'La definición corta de Kocka tiene cuatro piezas: mercados, propiedad privada de los medios de producción, trabajo asalariado y…', o: ['a) Democracia', 'b) Libre comercio', 'c) Ganancia reinvertida', 'd) Moneda estable'], c: 2 },
  { q: '¿Por qué se dice que «el capitalismo» en singular ya es una simplificación?', o: ['a) Porque la palabra es moderna', 'b) Porque nadie la usa', 'c) Porque es difícil de traducir', 'd) Porque el sistema vino en variedades desde el arranque'], c: 3 },
  { q: 'El «gran enriquecimiento» de McCloskey es un factor de alrededor de…', o: ['a) Treinta', 'b) Tres', 'c) Trescientos', 'd) Uno y medio'], c: 0 },
  { q: 'La etiqueta completa de McCloskey en esta casa dice que…', o: ['a) Es divulgación con inflado', 'b) Es sólida en los datos, y su explicación causal entra como tesis', 'c) Es una fuente primaria del siglo XIX', 'd) Está desmentida'], c: 1 },
  { q: 'La pelea de la línea, entre Hickel y Roser, discute…', o: ['a) A qué se debe la caída', 'b) Quién descubrió la pobreza', 'c) Cuánto cayó, y si la línea es demasiado baja', 'd) Si Deaton merecía el Nobel'], c: 2 },
  { q: 'La pelea de la atribución se apoya en un dato que incomoda a los dos bandos:', o: ['a) La caída de la Unión Soviética', 'b) La crisis de 2008', 'c) El fin del patrón oro', 'd) El tramo mayor de la salida desde 1980 ocurrió en China, bajo un híbrido'], c: 3 },
  { q: 'La pregunta que esta materia considera útil es…', o: ['a) Qué mercados, con qué reglas y para qué bienes', 'b) Mercado sí o mercado no', 'c) Quién tiene la culpa', 'd) Cuál país es el mejor'], c: 0 },
  { q: 'El modo de fallar propio de esta etapa es…', o: ['a) Exagerar las cifras', 'b) Soltar un número grande sin fecha, sin línea y sin quien lo discute', 'c) Citar demasiadas fuentes', 'd) Usar tablas en vez de gráficas'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Acero', 'Adorno'],
    headA: '🧾 Acero: la cifra se puede sostener',
    headB: '🎈 Adorno: suena bien y no prueba nada',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Más de un tercio hacia 1990, según el Banco Mundial»', t: 'ok' },
      { w: '«La pobreza en el mundo bajó muchísimo»', t: 'no' },
      { w: '«Menos de uno de cada veinte muere antes de los cinco»', t: 'ok' },
      { w: '«Antes se vivía mucho peor, todo el mundo lo sabe»', t: 'no' },
      { w: '«Hickel discute esa línea, y Roser le responde»', t: 'ok' },
      { w: '«Los expertos coinciden en que mejoró»', t: 'no' },
      { w: '«McCloskey calcula un factor de treinta, y su causa es tesis»', t: 'ok' },
      { w: '«Está demostrado que el sistema funciona»', t: 'no' },
    ],
  },
  {
    label: ['La línea', 'La atribución'],
    headA: '📏 Pelea de la línea: cuánto cayó',
    headB: '🧮 Pelea de la atribución: a qué se debe',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Ese umbral es demasiado bajo para llamarle vida»', t: 'ok' },
      { w: '«El tramo mayor desde 1980 fue en China»', t: 'no' },
      { w: '«Con otra línea la caída se ve distinta»', t: 'ok' },
      { w: '«Sin la apertura de mercados ese tramo no ocurre»', t: 'no' },
      { w: '«Depende de qué se cuente como pobreza extrema»', t: 'ok' },
      { w: '«Fue un híbrido de partido y Estado con mercado»', t: 'no' },
      { w: '«Roser responde con las series largas»', t: 'ok' },
      { w: '«Las variedades de Kocka son el puente»', t: 'no' },
    ],
  },
  {
    label: ['Dato', 'Tesis'],
    headA: '📊 Dato: se cuenta y se verifica',
    headB: '💭 Tesis: se argumenta y se discute',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El factor de treinta que calculó McCloskey', t: 'ok' },
      { w: 'Que la causa fue la dignidad del comerciante', t: 'no' },
      { w: 'La esperanza de vida al nacer en el mundo', t: 'ok' },
      { w: 'Que el mercado es la única causa de la fuga', t: 'no' },
      { w: 'Las series de pobreza del Banco Mundial', t: 'ok' },
      { w: 'Que la línea de pobreza es demasiado baja', t: 'no' },
      { w: 'El seguro de enfermedad de Bismarck de 1883', t: 'ok' },
      { w: 'Que el estribo explica el feudalismo', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Es de otra etapa o de otra materia'],
    headA: '📒 Se estudia en esta etapa',
    headB: '🏠 Es de otra etapa o materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La definición de Kocka en sus cuatro piezas', t: 'ok' },
      { w: 'Las externalidades y el artículo de Coase', t: 'no' },
      { w: 'La gran fuga de Deaton y sus cifras fechadas', t: 'ok' },
      { w: 'Lo que el precio corrompe en vez de asignar', t: 'no' },
      { w: 'El cruce Hickel contra Roser de 2019', t: 'ok' },
      { w: 'La desigualdad de Piketty y sus auditores', t: 'no' },
      { w: 'Las variedades del sistema desde el arranque', t: 'ok' },
      { w: 'La palabra gastada y la regla de sustitución', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['Deaton', 'publicó', 'su', 'libro', 'en', '2013.'], c: 0, art: 'Quién le puso nombre a la gran fuga' },
  { s: ['El', 'Nobel', 'de', 'Economía', 'llegó', 'en', '2015.'], c: 6, art: 'El año del Nobel de Deaton' },
  { s: ['Kocka', 'define', 'el', 'sistema', 'con', 'cuatro', 'piezas.'], c: 5, art: 'Cuántas piezas tiene la definición corta' },
  { s: ['El', 'gran', 'enriquecimiento', 'es', 'un', 'factor', 'de', 'treinta.'], c: 7, art: 'El tamaño del gran enriquecimiento' },
  { s: ['La', 'pelea', 'de', 'la', 'línea', 'discute', 'cuánto.'], c: 4, art: 'Lo que discute la primera pelea' },
  { s: ['La', 'pelea', 'de', 'la', 'atribución', 'discute', 'la', 'causa.'], c: 4, art: 'Lo que discute la segunda pelea' },
  { s: ['El', 'tramo', 'mayor', 'desde', '1980', 'fue', 'en', 'China.'], c: 4, art: 'El año desde el que se cuenta ese tramo' },
  { s: ['Bismarck', 'montó', 'el', 'seguro', 'en', '1883.'], c: 5, art: 'El año del seguro obligatorio de enfermedad' },
]);

/* ---------- completa la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'Deaton publicó «El gran escape» en ___.', opts: ['2013', '2010', '2016'], c: 0 },
  { s: 'La segunda mitad de su título habla de los orígenes de la ___.', opts: ['riqueza', 'desigualdad', 'industria'], c: 1 },
  { s: 'La cuarta pieza de la definición de Kocka es la ganancia ___.', opts: ['repartida', 'gravada', 'reinvertida'], c: 2 },
  { s: 'El gran enriquecimiento de McCloskey es un factor de alrededor de ___.', opts: ['treinta', 'tres', 'trescientos'], c: 0 },
  { s: 'La primera pelea es la de la ___: cuánto cayó la pobreza.', opts: ['causa', 'línea', 'fecha'], c: 1 },
  { s: 'El tramo mayor de la salida desde 1980 ocurrió en ___.', opts: ['India', 'Brasil', 'China'], c: 2 },
  { s: 'Bismarck montó el seguro obligatorio de enfermedad en ___.', opts: ['1883', '1848', '1919'], c: 0 },
  { s: 'Un número grande sin sus cuatro datos no es una prueba: es un ___.', opts: ['error', 'adorno', 'promedio'], c: 1 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Acero', 'Adorno'],
    btnA: '🧾 Acero', btnB: '🎈 Adorno',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Trae el año', t: 'ok' },
      { w: '«Muchísimo»', t: 'no' },
      { w: 'Dice con qué línea', t: 'ok' },
      { w: '«Todo el mundo lo sabe»', t: 'no' },
      { w: 'Nombra a quien lo disputa', t: 'ok' },
      { w: '«Está demostrado»', t: 'no' },
      { w: 'Separa el dato de la tesis', t: 'ok' },
      { w: '«Los expertos coinciden»', t: 'no' },
      { w: 'Declara el hueco si no hay número', t: 'ok' },
      { w: '«Es de sentido común»', t: 'no' },
    ],
  },
  {
    label: ['La línea', 'La atribución'],
    btnA: '📏 La línea', btnB: '🧮 La atribución',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El umbral es muy bajo', t: 'ok' },
      { w: 'China desde 1980', t: 'no' },
      { w: 'Depende de qué se cuente', t: 'ok' },
      { w: 'El híbrido de partido y mercado', t: 'no' },
      { w: 'Hickel contra Roser', t: 'ok' },
      { w: 'Qué cambió al final de los setenta', t: 'no' },
      { w: 'Con otra línea se ve distinto', t: 'ok' },
      { w: 'A qué arreglo se le apunta', t: 'no' },
      { w: 'Cuánto cayó exactamente', t: 'ok' },
      { w: 'Las variedades como puente', t: 'no' },
    ],
  },
  {
    label: ['Dato', 'Tesis'],
    btnA: '📊 Dato', btnB: '💭 Tesis',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'El factor de treinta', t: 'ok' },
      { w: 'La dignidad del comerciante', t: 'no' },
      { w: 'La esperanza de vida', t: 'ok' },
      { w: 'Que el mercado fue la única causa', t: 'no' },
      { w: 'La mortalidad de menores de cinco', t: 'ok' },
      { w: 'Que la línea es demasiado baja', t: 'no' },
      { w: 'El seguro de Bismarck de 1883', t: 'ok' },
      { w: 'Que sin apertura no había tramo', t: 'no' },
      { w: 'Las series del Banco Mundial', t: 'ok' },
      { w: 'Que la fuga se debe al capitalismo', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo entra una cifra grande al expediente',
    steps: [
      'Escribir qué afirma exactamente, en una oración con sujeto y número',
      'Poner la cifra con su horquilla, y el hueco declarado si no la tiene',
      'Anotar según quién: obra, autor, año y etiqueta de estatus',
      'Decir con qué método y con qué línea o umbral se midió',
      'Nombrar a quien la disputa, y qué dato resolvería el pleito',
      'Y volver a leerla como si viniera del bando contrario',
    ],
  },
  {
    label: 'El acero primero, paso a paso',
    steps: [
      'Enunciar el mejor caso del sistema con sus números más fuertes',
      'Decirlo sin mueca, como lo firmaría quien de verdad lo defiende',
      'Añadir la mejor defensa moral: cooperación entre extraños',
      'Recién entonces abrir las disputas, y nombrarlas por separado',
      'Declarar en qué etapa vive cada factura, y no adelantarla aquí',
      'Y archivar el expediente junto a su gemelo, que la Bóveda pide los dos',
    ],
  },
  {
    label: 'Cómo se separan las dos peleas',
    steps: [
      'Preguntar primero de cuál de las dos se está hablando',
      'Si es cuánto cayó, es la pelea de la línea: Hickel contra Roser',
      'Si es a qué se debe, es la de la atribución: el tramo chino desde 1980',
      'Poner en cada pelea solo los datos que le tocan',
      'Usar las variedades de Kocka como puente, no como salida diplomática',
      'Y dejar las dos abiertas, con fecha, porque ninguna está resuelta',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Le puso nombre a la gran fuga en 2013 y recibió el Nobel en 2015', ans: 'Angus Deaton', opts: ['Angus Deaton', 'Deirdre McCloskey', 'Jürgen Kocka', 'Jason Hickel'] },
  { desc: 'Calculó el gran enriquecimiento, un factor de alrededor de treinta', ans: 'Deirdre McCloskey', opts: ['Deirdre McCloskey', 'Angus Deaton', 'Max Roser', 'Steven Pinker'] },
  { desc: 'Definió el sistema con cuatro piezas y advirtió de las variedades', ans: 'Jürgen Kocka', opts: ['Jürgen Kocka', 'Angus Deaton', 'Deirdre McCloskey', 'Jason Hickel'] },
  { desc: 'Sostiene que la línea de pobreza es demasiado baja para llamarle vida', ans: 'Jason Hickel', opts: ['Jason Hickel', 'Max Roser', 'Angus Deaton', 'Jürgen Kocka'] },
  { desc: 'Responde con las series largas de datos, en el cruce de 2019', ans: 'Max Roser', opts: ['Max Roser', 'Jason Hickel', 'Deirdre McCloskey', 'Jürgen Kocka'] },
  { desc: 'Montó en 1883 el seguro obligatorio de enfermedad para los trabajadores', ans: 'Bismarck', opts: ['Bismarck', 'Mánchester', 'El modelo nórdico', 'Our World in Data'] },
  { desc: 'Los cinco renglones que se le piden a todo número grande', ans: 'La hoja de la cifra', opts: ['La hoja de la cifra', 'La regla del placer', 'La pelea de la línea', 'La definición de Kocka'] },
  { desc: 'Soltar un número grande sin fecha, sin línea y sin quien lo discute', ans: 'La cifra suelta', opts: ['La cifra suelta', 'La regla del acero', 'La pelea de la atribución', 'El gran enriquecimiento'] },
]);

/* ---------- dato, disputa o veredicto ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«La pobreza extrema pasó de más de un tercio a una décima parte»', func: 'Dato con fuente y fecha: se verifica en las series', opts: ['Dato con fuente y fecha: se verifica en las series', 'Disputa viva de medición', 'Un veredicto sobre el sistema', 'Una tesis causal'] },
  { trans: '«Esa línea es demasiado baja para llamarle vida a lo que hay encima»', func: 'Disputa viva de medición: es la pelea de la línea', opts: ['Disputa viva de medición: es la pelea de la línea', 'Un dato verificable', 'Un veredicto de la materia', 'La definición de Kocka'] },
  { trans: '«El tramo mayor desde 1980 ocurrió en China, bajo un híbrido»', func: 'Dato establecido que alimenta la disputa de atribución', opts: ['Dato establecido que alimenta la disputa de atribución', 'Una tesis de McCloskey', 'Un veredicto sobre el mercado', 'La pelea de la línea'] },
  { trans: '«La causa fue la dignidad concedida al comerciante y al inventor»', func: 'Tesis causal de McCloskey: se cita como tesis, no como dato', opts: ['Tesis causal de McCloskey: se cita como tesis, no como dato', 'Un dato de las series', 'Una disputa de medición', 'La definición de Kocka'] },
  { trans: '«La pregunta útil es qué mercados, con qué reglas y para qué bienes»', func: 'Veredicto de método de la materia: cambia la pregunta a propósito', opts: ['Veredicto de método de la materia: cambia la pregunta a propósito', 'Un dato con fecha', 'La pelea de la atribución', 'Una tesis de Deaton'] },
]);

/* ---------- diagnóstico: ¿por dónde falla la cifra? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: '«La pobreza en el mundo bajó muchísimo», y ahí termina la anotación', characteristic: 'Cifra suelta: no dice de qué años, con qué línea, según quién ni quién la discute; el dato puede ser cierto y aun así no probar nada', opts: ['Cifra suelta: no dice de qué años, con qué línea, según quién ni quién la discute; el dato puede ser cierto y aun así no probar nada', 'Está bien: se entiende y es verdad', 'El error es hablar de pobreza', 'Faltaba poner un porcentaje redondo'] },
  { disease: 'Se cita el factor de treinta de McCloskey y también su explicación, con la misma cola', characteristic: 'Se pegaron un dato y una tesis: el cálculo es sólido y la causa que ella propone está discutida, y las dos cosas se citan distinto', opts: ['Se pegaron un dato y una tesis: el cálculo es sólido y la causa que ella propone está discutida, y las dos cosas se citan distinto', 'Está bien: viene todo en el mismo libro', 'El error es citar a McCloskey', 'Faltaba decir el título completo'] },
  { disease: 'En la misma frase se discute cuánto cayó la pobreza y a qué se debió', characteristic: 'Se mezclaron las dos peleas: la de la línea y la de la atribución tienen distintos contendientes y distinta clase de prueba, y juntas no se resuelve ninguna', opts: ['Se mezclaron las dos peleas: la de la línea y la de la atribución tienen distintos contendientes y distinta clase de prueba, y juntas no se resuelve ninguna', 'Está bien: es el mismo tema', 'El error es nombrar a China', 'Faltaba una gráfica'] },
  { disease: 'Se dice «el capitalismo» a secas y se le apunta la fuga entera', characteristic: 'Falta la advertencia de Kocka: el sistema vino en variedades, y la palabra en singular cubre cosas que no se parecen entre sí', opts: ['Falta la advertencia de Kocka: el sistema vino en variedades, y la palabra en singular cubre cosas que no se parecen entre sí', 'Está bien: todos entienden la palabra', 'El error es citar a Kocka', 'Faltaba decir en qué siglo'] },
  { disease: 'El expediente celebra la fuga y no menciona a los que quedaron adentro', characteristic: 'Se leyó medio título: Deaton escribió salud, riqueza Y LOS ORÍGENES DE LA DESIGUALDAD, y esa mitad es el argumento y no un apéndice', opts: ['Se leyó medio título: Deaton escribió salud, riqueza Y LOS ORÍGENES DE LA DESIGUALDAD, y esa mitad es el argumento y no un apéndice', 'Está bien: las facturas vienen después', 'El error es citar a Deaton', 'Faltaba una cifra más'] },
  { disease: 'El dato que confirma lo que la casa ya creía se anota sin verificar', characteristic: 'Se saltó la regla del placer: el dato cómodo paga doble auditoría, venga del estante que venga, y ese es justo el que hay que ir a mirar dos veces', opts: ['Se saltó la regla del placer: el dato cómodo paga doble auditoría, venga del estante que venga, y ese es justo el que hay que ir a mirar dos veces', 'Está bien: si coincide, es porque es cierto', 'El error es tener opiniones previas', 'Faltaba buscar un dato más grande'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'La salida masiva de la pobreza y de la muerte temprana en dos siglos.', type: 'La gran fuga (Deaton, 2013)' },
  { s: 'Mercados, propiedad privada, trabajo asalariado y ganancia reinvertida.', type: 'La definición corta de Kocka (2016)' },
  { s: 'Un factor de alrededor de treinta en el nivel de vida del habitante común.', type: 'El gran enriquecimiento (McCloskey, 2010)' },
  { s: 'Que la causa fue la dignidad concedida al comerciante y al inventor.', type: 'Tesis causal de McCloskey: se cita como tesis' },
  { s: 'Discutir si el umbral es demasiado bajo para llamarle vida.', type: 'La pelea de la línea (Hickel contra Roser, 2019)' },
  { s: 'Discutir a qué arreglo se le apunta el tramo mayor desde 1980.', type: 'La pelea de la atribución' },
  { s: 'El de Mánchester no era el de Bismarck, ni el nórdico es el anglosajón.', type: 'Las variedades del sistema' },
  { s: 'Cooperación entre extraños que no se conocen ni se deben nada.', type: 'La mejor defensa moral: el intercambio voluntario' },
  { s: 'Qué afirma, cuánto, según quién, con qué línea y quién lo disputa.', type: 'La hoja de la cifra' },
  { s: 'Un número grande dicho sin fecha, sin línea y sin contradictor.', type: 'La cifra suelta: el modo de fallar de la etapa' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'Deaton (2013)', gen: 'Fuente', n: 'La gran fuga: salud y riqueza', g: '«El gran escape», Nobel en 2015', t: 'Clásico sólido reciente' },
  { w: 'McCloskey (2010)', gen: 'Fuente', n: 'El gran enriquecimiento, factor de treinta', g: '«Bourgeois Dignity»', t: 'Sólida en los datos, y su causa entra como tesis' },
  { w: 'Kocka (2016)', gen: 'Fuente', n: 'La definición corta y las variedades', g: '«Historia del capitalismo»', t: 'Síntesis académica breve' },
  { w: 'Banco Mundial y Our World in Data', gen: 'Serie', n: 'Las cifras de pobreza en el tiempo', g: 'Se citan siempre con fecha y con su línea', t: 'Serie estadística, con fecha' },
  { w: 'Hickel contra Roser (2019)', gen: 'Disputa', n: 'Si la línea de pobreza es demasiado baja', g: 'Con Pinker de por medio', t: 'Disputa viva de medición' },
  { w: 'El tramo chino desde 1980', gen: 'Disputa', n: 'A qué arreglo se le apunta la salida', g: 'Un híbrido de partido y Estado con mercado', t: 'Dato establecido, atribución en disputa' },
  { w: 'Bismarck (1883)', gen: 'Hecho', n: 'El seguro obligatorio de enfermedad', g: 'Prueba de que las variedades son viejas', t: 'Hecho histórico fechado' },
  { w: 'El intercambio voluntario', gen: 'Concepto', n: 'Cooperación entre extraños', g: 'La mejor defensa moral, dicha entera', t: 'El acero de la etapa' },
  { w: 'La hoja de la cifra', gen: 'Herramienta', n: 'Cinco renglones para todo número grande', g: 'Con los cinco es prueba; sin uno, adorno', t: 'El producto de la etapa' },
  { w: 'La cifra suelta', gen: 'Error', n: 'El número sin sus cuatro datos', g: 'Sin fecha, sin línea, sin contradictor', t: 'El modo de fallar de esta etapa' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'Deaton publicó «El gran escape» en ___.', opts: ['2013', '2010', '2016'], ans: '2013' },
  { s: 'Recibió el Nobel de Economía en ___.', opts: ['2015', '2013', '2019'], ans: '2015' },
  { s: 'La definición de Kocka tiene ___ piezas.', opts: ['cuatro', 'tres', 'cinco'], ans: 'cuatro' },
  { s: 'El gran enriquecimiento es un factor de alrededor de ___.', opts: ['treinta', 'tres', 'cien'], ans: 'treinta' },
  { s: 'La pelea de la ___ discute cuánto cayó la pobreza.', opts: ['línea', 'atribución', 'fecha'], ans: 'línea' },
  { s: 'El tramo mayor de la salida desde 1980 ocurrió en ___.', opts: ['China', 'India', 'Corea'], ans: 'China' },
  { s: 'Bismarck montó el seguro de enfermedad en ___.', opts: ['1883', '1848', '1901'], ans: '1883' },
  { s: 'Un número grande sin sus cuatro datos es un ___.', opts: ['adorno', 'promedio', 'sesgo'], ans: 'adorno' },
]);
B.explainQuestions = JSON.stringify([
  { q: '¿Qué es la gran fuga, quién le puso ese nombre y por qué la segunda mitad del título de ese libro no es un adorno?', ans: 'La gran fuga es la salida masiva de la pobreza y de la muerte temprana ocurrida en los últimos dos siglos, y le puso ese nombre Angus Deaton en «El gran escape», de 2013, por el que recibió el Nobel de Economía en 2015; tomó el título de una película de 1963 sobre una evasión. Las cifras que la sostienen son de las menos discutidas que existen: a comienzos del siglo diecinueve moría antes de cumplir cinco años cerca de la mitad de los niños del mundo y hoy muere menos de uno de cada veinte, y la esperanza de vida al nacer pasó de rondar los treinta años a superar los setenta antes de la pandemia. La segunda mitad del título es «los orígenes de la desigualdad», y no es un apéndice sino el argumento: de toda fuga se queda gente adentro, y el hueco entre los que salieron y los que no es exactamente el material de las etapas siguientes de esta ruta. Quien cita solo la primera mitad está haciendo propaganda con un libro que dice otra cosa, y quien cita solo la segunda está negando un registro civil.' },
  { q: 'Enuncia la definición corta de Kocka y explica por qué en esta casa definir viene antes que juzgar.', ans: 'Jürgen Kocka, en «Historia del capitalismo» (2016 en español), síntesis académica breve, define el sistema con cuatro piezas que hacen falta juntas: mercados que forman precios, propiedad privada de los medios de producción, trabajo asalariado y ganancia que se reinvierte en lugar de gastarse entera. Definir viene antes que juzgar por una razón práctica y no por pedantería: casi todas las peleas sobre el capitalismo se pelean sin definirlo, y por eso no terminan nunca, porque cada quien está juzgando una cosa distinta. Y hay un segundo motivo, que Kocka subraya y que es la mitad de la lección: el sistema vino en variedades desde el arranque, de modo que la palabra en singular ya es una simplificación que hay que declarar el primer día. El de Mánchester no era el de Bismarck, que en 1883 montó el seguro obligatorio de enfermedad, y el nórdico de hoy no es el anglosajón. Quien dice «el capitalismo» a secas está usando un apellido para una familia entera.' },
  { q: 'Explica las dos disputas de la gran fuga, quién está enfrente de quién en cada una, y por qué mezclarlas arruina la conversación.', ans: 'La primera es la pelea de la línea y discute cuánto cayó la pobreza. Se suele decir que la pobreza extrema pasó de más de un tercio de la humanidad hacia 1990 a alrededor de una décima parte antes de la pandemia, según las series del Banco Mundial y de Our World in Data; Jason Hickel sostiene que esa línea es demasiado baja para llamarle vida a lo que hay por encima, y Max Roser le responde con las series largas, con Steven Pinker defendiendo la lectura optimista. El cruce es de 2019 y sigue abierto: es una disputa viva de medición y se enseña como disputa. La segunda es la pelea de la atribución y discute a qué se debe: el tramo mayor de la salida desde 1980 ocurrió en China bajo un híbrido de partido y Estado con mercado que no se parece a ningún manual, y ese dato incomoda a los dos bandos, porque obliga al que celebra a explicar el híbrido y al que acusa a explicar qué cambió al final de los años setenta. Mezclarlas arruina la conversación porque tienen contendientes distintos y clases de prueba distintas: la de la línea se resuelve con metodología y la de la atribución con historia comparada. Y el puente entre las dos son las variedades de Kocka, porque si el sistema vino en variedades, preguntar por «el capitalismo» a secas es la pregunta mal hecha.' },
  { q: '¿Cuál es la mejor defensa moral del sistema, y qué es exactamente lo que esa defensa no dice?', ans: 'Tiene dos piezas y las dos hay que poder decirlas sin mueca. La primera es el intercambio voluntario como cooperación entre extraños: gente que no se conoce, no se quiere y no se debe nada termina coordinándose para que aparezca el pan, el zapato y la medicina, sin que nadie lo mande y sin que nadie tenga el plano completo. Ninguna otra cosa conocida coordina a millones de desconocidos de esa manera. La segunda es el resultado sin adornos: ningún otro arreglo conocido sacó a tanta gente de la miseria tan rápido, y eso no es una promesa ni un modelo, es un registro con fechas. Lo que la defensa no dice es igual de importante y se declara en la misma respiración: no dice que el reparto sea justo, no dice que las facturas no existan, y no dice que no haya alternativas mejores en algún mercado concreto. Una defensa que dijera eso sería apología. Aquí la defensa se pone en pie entera precisamente para que la auditoría que viene después tenga valor, porque auditar lo que uno no supo defender no es rigor: es identidad con vocabulario técnico.' },
  { q: 'Explica el modo de fallar de esta etapa, la cifra suelta, con sus tres señales, y cómo se corrige una.', ans: 'El error propio de esta etapa no es exagerar: es soltar un número grande sin los datos que lo vuelven una prueba, y se comete con la mejor intención porque el número suele ser verdadero. Tres señales lo delatan. Uno: sin fecha, o sea que dice que algo bajó pero no entre qué años. Dos: sin línea, o sea que llama pobre a alguien sin decir con qué umbral se midió. Tres: sin quien la discute, presentada como si nadie la hubiera peleado nunca. La corrección es la hoja de la cifra, que tiene cinco renglones: qué afirma exactamente en una oración sin adjetivos, cuánto y entre qué y qué, según quién con obra y año y su etiqueta, con qué método y con qué línea, y quién lo disputa junto con qué dato resolvería el pleito. Un ejemplo de corrección completa: en vez de «la pobreza en el mundo bajó de un tercio a una décima parte», se escribe «según las series del Banco Mundial y de Our World in Data, la pobreza extrema pasó de más de un tercio de la humanidad hacia 1990 a alrededor de una décima parte antes de la pandemia; Jason Hickel discute que esa línea sea demasiado baja y Max Roser le responde, y la disputa sigue viva desde 2019». Es el mismo dato y ahora se puede sostener de pie delante de cualquiera.' },
  { q: '¿Qué es la regla del placer y por qué esta materia la aplica a los dos estantes por igual?', ans: 'La regla del placer dice que el dato que confirma lo que uno ya creía paga doble auditoría, venga del estante que venga. La razón es psicológica antes que metodológica: el número que cae justo donde a uno le convenía es el que menos ganas se tienen de verificar, y por eso es exactamente el que hay que ir a mirar dos veces. Esta materia la aplica a los dos estantes por igual porque tiene un expediente gemelo, el rojo, con el mismo esqueleto y la misma dureza, y porque la prueba de que una casa estudia en serio es que sus dos expedientes incomoden por igual a un lector de cualquier bando. En la práctica significa tres cosas concretas. Que el dato cómodo se busca en su fuente original antes de repetirlo. Que se busca activamente quién lo discute, en vez de esperar a que aparezca. Y que cuando el dato incómodo resiste la auditoría, se anota igual y con la misma letra, aunque estropee la lámina que uno ya tenía hecha. El dato que incomoda a los dos bandos, como el tramo chino desde 1980, casi siempre es el dato bueno.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['FUGA', 'DEATON', 'NOBEL', 'ESCAPE', 'SALUD', 'VIDA']),
  haceSopa(10, ['KOCKA', 'MERCADO', 'SALARIO', 'GANANCIA', 'PIEZAS', 'LINEA']),
  haceSopa(10, ['HICKEL', 'ROSER', 'DISPUTA', 'CIFRA', 'ACERO', 'CHINA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'Angus Deaton publicó «El gran escape» en 2013 y recibió el Nobel de Economía en 2015.', a: true },
  { q: 'El título completo del libro de Deaton habla solo de salud y riqueza.', a: false },
  { q: 'La definición corta de Kocka tiene cuatro piezas y hacen falta las cuatro juntas.', a: true },
  { q: 'Según Kocka, el capitalismo fue una sola cosa uniforme hasta el siglo veinte.', a: false },
  { q: 'A comienzos del siglo diecinueve moría antes de los cinco años cerca de la mitad de los niños del mundo.', a: true },
  { q: 'La esperanza de vida al nacer en el mundo bajó durante el siglo veinte.', a: false },
  { q: 'El gran enriquecimiento de McCloskey es un factor de alrededor de treinta.', a: true },
  { q: 'La explicación causal de McCloskey se cita en esta casa como consenso académico.', a: false },
  { q: 'La pelea de la línea discute cuánto cayó la pobreza y con qué umbral se mide.', a: true },
  { q: 'La disputa entre Hickel y Roser quedó resuelta en 2019.', a: false },
  { q: 'El tramo mayor de la salida de la pobreza desde 1980 ocurrió en China.', a: true },
  { q: 'El dato de China favorece limpiamente a uno de los dos bandos de la discusión.', a: false },
  { q: 'Bismarck estableció el seguro obligatorio de enfermedad en 1883.', a: true },
  { q: 'La mejor defensa moral del sistema afirma también que el reparto es justo.', a: false },
  { q: 'Una cifra sin fecha, sin línea y sin contradictor no es una prueba, aunque sea verdadera.', a: true },
]);
B.evalMCBank = JSON.stringify([
  { q: 'La gran fuga, según Deaton, es…', o: ['a) La salida masiva de la pobreza y de la muerte temprana en dos siglos', 'b) La fuga de capitales de los países pobres', 'c) El éxodo rural del siglo veinte', 'd) La huida de científicos hacia Estados Unidos'], a: 0 },
  { q: 'La segunda mitad del título de Deaton, la que casi nadie cita, es…', o: ['a) «y el futuro del trabajo»', 'b) «y los orígenes de la desigualdad»', 'c) «y la historia de la medicina»', 'd) «y el comercio entre naciones»'], a: 1 },
  { q: 'Las cuatro piezas de Kocka son mercados, propiedad privada de los medios de producción, trabajo asalariado y…', o: ['a) Libre comercio', 'b) Sufragio universal', 'c) Ganancia reinvertida', 'd) Banca central'], a: 2 },
  { q: 'La advertencia que Kocka añade a su definición es que…', o: ['a) El sistema es imposible de definir', 'b) La palabra es demasiado nueva', 'c) Solo existió en Europa', 'd) El sistema vino en variedades desde el arranque'], a: 3 },
  { q: 'La mortalidad de menores de cinco años pasó, en dos siglos, de…', o: ['a) Cerca de la mitad a menos de uno de cada veinte', 'b) Uno de cada diez a uno de cada cien', 'c) Un tercio a un cuarto', 'd) Casi cero a casi cero'], a: 0 },
  { q: 'La etiqueta de McCloskey en esta casa dice que…', o: ['a) Está desmentida por completo', 'b) Es sólida en los datos, y su explicación causal entra como tesis', 'c) Es una fuente primaria', 'd) Es divulgación con inflado'], a: 1 },
  { q: 'La pelea de la línea enfrenta a…', o: ['a) Deaton contra Kocka', 'b) McCloskey contra Deaton', 'c) Hickel contra Roser y Pinker, en el cruce de 2019', 'd) Bismarck contra Mánchester'], a: 2 },
  { q: 'La pelea de la atribución se apoya sobre todo en…', o: ['a) La crisis de 2008', 'b) La caída del muro de Berlín', 'c) El Plan Marshall', 'd) El tramo chino de la salida de la pobreza desde 1980'], a: 3 },
  { q: 'Las variedades de Kocka funcionan en esta etapa como…', o: ['a) El puente entre las dos peleas', 'b) Un adorno histórico', 'c) La refutación de Deaton', 'd) Una tesis de McCloskey'], a: 0 },
  { q: 'La mejor defensa moral del sistema se apoya en que el intercambio voluntario es…', o: ['a) Siempre justo', 'b) Cooperación entre extraños que no se conocen ni se deben nada', 'c) Un invento del siglo veinte', 'd) Incompatible con el Estado'], a: 1 },
  { q: 'Lo que esa defensa NO dice es que…', o: ['a) Coordina a desconocidos', 'b) Sacó a mucha gente de la miseria', 'c) El reparto sea justo o que no existan facturas', 'd) Existan varias formas de organizar mercados'], a: 2 },
  { q: 'La pregunta que esta materia considera fértil es…', o: ['a) ¿Quién tiene la culpa?', 'b) ¿Mercado sí o mercado no?', 'c) ¿Cuál es el mejor país?', 'd) ¿Qué mercados, con qué reglas y para qué bienes?'], a: 3 },
  { q: 'Los cinco renglones de la hoja de la cifra son qué afirma, cuánto, según quién, con qué línea y…', o: ['a) Quién lo disputa y qué resolvería la disputa', 'b) Cuánto cuesta averiguarlo', 'c) En qué idioma se publicó', 'd) Si le conviene a la casa'], a: 0 },
  { q: 'Las tres señales de la cifra suelta son…', o: ['a) Es larga, es vieja y es extranjera', 'b) Sin fecha, sin línea y sin quien la discute', 'c) Con fuente, con horquilla y con método', 'd) Es corta, es clara y es popular'], a: 1 },
  { q: 'La regla del placer obliga a…', o: ['a) Descartar los datos incómodos', 'b) Citar solo fuentes recientes', 'c) Auditar dos veces el dato que confirma lo que ya se creía', 'd) Repetir cada cifra tres veces'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'Angus Deaton publicó «El gran escape» en el año ___.', a: '2013' },
  { q: 'Recibió el Nobel de Economía en ___.', a: '2015' },
  { q: 'Tomó el título de una película de ___ sobre una evasión.', a: '1963' },
  { q: 'La segunda mitad del título habla de los orígenes de la ___.', a: 'desigualdad' },
  { q: 'La definición de Kocka tiene ___ piezas.', a: 'cuatro' },
  { q: 'La cuarta pieza de esa definición es la ganancia ___.', a: 'reinvertida' },
  { q: 'El gran enriquecimiento de McCloskey es un factor de alrededor de ___.', a: 'treinta' },
  { q: 'La obra de McCloskey de 2010 se titula «Bourgeois ___».', a: 'Dignity' },
  { q: 'Hacia 1990 estaba en pobreza extrema más de un ___ de la humanidad.', a: 'tercio' },
  { q: 'Antes de la pandemia la cifra rondaba una ___ parte.', a: 'décima' },
  { q: 'Quien sostiene que la línea de pobreza es demasiado baja es Jason ___.', a: 'Hickel' },
  { q: 'Le responde con las series largas Max ___.', a: 'Roser' },
  { q: 'El tramo mayor de la salida desde 1980 ocurrió en ___.', a: 'China' },
  { q: 'Bismarck montó el seguro obligatorio de enfermedad en ___.', a: '1883' },
  { q: 'Un número grande sin sus cuatro datos no es prueba: es un ___.', a: 'adorno' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Deaton (2013)', def: 'La gran fuga: salud, riqueza y los orígenes de la desigualdad' },
  { term: 'Nobel de Economía 2015', def: 'El premio que recibió el autor de la gran fuga' },
  { term: 'Kocka (2016)', def: 'La definición corta: cuatro piezas y las variedades' },
  { term: 'McCloskey (2010)', def: 'El gran enriquecimiento: un factor de alrededor de treinta' },
  { term: 'La tesis de la dignidad', def: 'La explicación causal de McCloskey, que entra como tesis' },
  { term: 'Más de un tercio', def: 'La pobreza extrema en el mundo hacia 1990' },
  { term: 'Alrededor de una décima', def: 'La pobreza extrema antes de la pandemia' },
  { term: 'Cerca de la mitad', def: 'Los niños que morían antes de los cinco años hacia 1800' },
  { term: 'La pelea de la línea', def: 'Cuánto cayó: Hickel contra Roser, 2019' },
  { term: 'La pelea de la atribución', def: 'A qué se debe: el tramo chino desde 1980' },
  { term: 'Las variedades', def: 'El puente entre las dos peleas' },
  { term: 'Bismarck, 1883', def: 'El seguro obligatorio de enfermedad: las variedades son viejas' },
  { term: 'El intercambio voluntario', def: 'Cooperación entre extraños: la mejor defensa moral' },
  { term: 'La hoja de la cifra', def: 'Los cinco renglones de todo número grande' },
  { term: 'La regla del placer', def: 'El dato que confirma lo que ya se creía paga doble auditoría' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'Un banco ofrece patrocinar M.E.T.A.S con L 300,000 anuales: su logo en la portada de cada misión y una misión de educación financiera donde los ejemplos sean sus productos.' },
  { txt: 'La familia estudia cobrar M.E.T.A.S a los colegios privados, unos L 50 por alumno al año, manteniéndolo gratis para las escuelas públicas.' },
  { txt: 'La fundación de una empresa extractiva ofrece L 150,000 en tabletas para escuelas cercanas a su operación, con entrega pública y fotos.' },
  { txt: 'Para su exposición del jueves, Jael escribió en la lámina: «la pobreza en el mundo bajó de un tercio a una décima parte». El dato es verdadero.' },
  { txt: 'Llegan dos materiales escolares: uno afirma que el libre mercado sacó al mundo de la pobreza, y el otro que el capitalismo produjo la pobreza del mundo.' },
  { txt: 'Después de oír las cifras, Angelly hace la pregunta directa: si entonces el capitalismo es bueno o es malo.' },
  { txt: 'Aparece el dato que los dos bandos usan y ninguno cuenta entero: el tramo mayor de la salida de la pobreza desde 1980 ocurrió en China, bajo un híbrido.' },
  { txt: 'La casa juzga su propio proyecto y tiene que decidir contra qué lo compara: contra la escuela ideal que se imagina, o contra las alternativas reales.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. Haz primero el acero: enuncia el mejor caso de lo que hay sobre la mesa, con sus números si los tiene, y dicho sin mueca.',
  '2. Llena la hoja de la cifra o de la oferta: qué afirma exactamente, cuánto, según quién y de qué año, con qué línea o método, y quién lo disputa.',
  '3. Si hay disputa, di de cuál de las dos se trata (la de la línea o la de la atribución) y qué fuente la sostiene, con su etiqueta de estatus.',
  '4. ¿Qué se decide, con qué condición escrita, y qué queda en pie pase lo que pase con las disputas? Añade el renglón de qué evidencia haría cambiar la decisión.',
]);
B.critCaseGuides = JSON.stringify([
  'Se empieza por el acero, y no es una cortesía: es la licencia para lo que viene después. El mejor caso se enuncia entero, con sus números más fuertes y con la voz de quien de verdad lo defendería, sin mueca y sin el «sí, pero» adelantado. Si lo que hay sobre la mesa es una oferta con lempiras, el acero es decir qué mete de verdad: cuánto dinero, para qué alcanza, qué se podría hacer con eso que hoy no se hace. Si lo que hay es una cifra, el acero es enunciarla en su versión más fuerte y más citable. La prueba de que el acero está bien hecho es incómoda y es la de esta casa: que quien defiende esa postura lo firmaría sin corregir una coma. Quien no puede hacer eso no está autorizado a auditar nada, y en este expediente esa regla no admite excepción, porque es la misma que rige en el gemelo rojo.',
  'La hoja tiene cinco renglones y ninguno es decorativo. Qué afirma exactamente, en una oración con sujeto, verbo y número, y sin adjetivos, porque el adjetivo es por donde se cuela la conclusión. Cuánto, con su horquilla si la tiene, y con el hueco declarado si no se consigue. Según quién, con obra, autor, año y la etiqueta de estatus que le toca: Deaton (2013) como clásico sólido reciente, McCloskey (2010) con su etiqueta doble, Kocka (2016) como síntesis académica breve, las series del Banco Mundial y de Our World in Data siempre con fecha. Con qué método y con qué línea, porque una cifra de pobreza sin el umbral con que se midió no dice nada. Y quién lo disputa, junto con qué dato resolvería el pleito. Cuando lo que hay sobre la mesa es una oferta y no una cifra, los mismos cinco renglones se leen así: qué se ofrece, cuánto en lempiras, quién lo ofrece y de qué vive, con qué condiciones escritas, y quién saldría perdiendo si se acepta.',
  'Si hay disputa, lo primero es decir de cuál se trata, porque en esta materia son dos y se confunden todo el tiempo. La pelea de la línea discute cuánto cayó la pobreza y si el umbral con que se mide no será demasiado bajo: ahí están Jason Hickel de un lado y Max Roser y Steven Pinker del otro, en el cruce de 2019, y es una disputa viva de medición que se enseña como disputa y no como bando. La pelea de la atribución discute a qué arreglo se le apunta el resultado, y su dato central es que el tramo mayor de la salida desde 1980 ocurrió en China bajo un híbrido de partido y Estado con mercado; ese dato incomoda a los dos lados y por eso se cuenta entero. El puente entre las dos son las variedades de Kocka: si el sistema vino en variedades desde el arranque, preguntar por «el capitalismo» a secas es la pregunta mal hecha. Y se dice también lo que aquí no se contesta: las fallas de mercado son la etapa 2, los bienes que el precio corrompe la 3, y la desigualdad, el clima y los expedientes históricos la 4.',
  'Todo caso cierra con dos casillas que son las que separan el oficio del desahogo. La primera es la decisión con su condición escrita: aceptar con condiciones es el resultado normal de una auditoría y no una derrota, y la condición se escribe antes y no después, con quién firma y qué pasa si se incumple. La segunda es qué queda en pie pase lo que pase con las disputas, dicho en voz alta: por ejemplo, que nadie discute que la gente vive mucho más y muere mucho menos de niña que hace dos siglos, y que ninguna de las dos peleas toca ese registro. Encima de las dos va el pago, que es la regla de esta casa: la comparación se hace contra las alternativas reales y no contra el paraíso, también cuando el objeto auditado es el proyecto propio; y la decisión lleva su renglón de qué evidencia la haría cambiar, con fecha, porque sin ese renglón una premisa está funcionando como dogma.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"La pobreza en el mundo bajó de un tercio a una décima parte".', g1: 'El dato es verdadero y aun así la frase no sirve: no dice de qué años habla, con qué línea se midió, quién publicó la serie ni quién la discute. Así escrita es un número prestado a favor de una postura.', g2: 'La corrección cabe en la misma lámina: «según las series del Banco Mundial y de Our World in Data, la pobreza extrema pasó de más de un tercio de la humanidad hacia 1990 a alrededor de una décima parte antes de la pandemia; Hickel discute que esa línea sea demasiado baja y Roser le responde, y la disputa sigue viva desde 2019».' },
  { txt: '"McCloskey demostró que la causa fue la dignidad concedida al comerciante".', g1: 'Se pegaron un dato y una tesis con la misma cola. El cálculo del gran enriquecimiento, un factor de alrededor de treinta, es sólido; la explicación causal que ella propone es suya y está discutida por otros historiadores.', g2: 'La corrección es de dos verbos: McCloskey calcula un factor de alrededor de treinta, y sostiene que la causa fue la dignidad burguesa. Calcula y sostiene no son la misma operación, y no se citan igual aunque vengan en el mismo libro.' },
  { txt: '"El capitalismo sacó al mundo de la pobreza".', g1: 'Falta la advertencia de Kocka: el sistema vino en variedades desde el arranque, y la palabra en singular cubre cosas que no se parecen. Y falta el dato que lo complica: el tramo mayor desde 1980 fue en China, bajo un híbrido.', g2: 'La corrección obliga a especificar: qué variedad, en qué países, en qué años, y qué se hace con el tramo chino. Una vez especificado, la frase se puede discutir; sin especificar, gana siempre y por eso no afirma nada.' },
  { txt: '"Como la línea de pobreza está discutida, esas cifras no valen nada".', g1: 'Es el error simétrico y también es cifra suelta: de que un umbral esté en disputa no se sigue que todo el registro se caiga. La mortalidad infantil y la esperanza de vida no dependen de esa línea y cuentan la misma historia.', g2: 'La corrección es separar lo que la disputa toca de lo que no toca: la pelea de la línea afecta a cuánto se llama salida de la pobreza, y no afecta a las actas de defunción. Eso queda en pie, y decirlo es parte del trabajo.' },
  { txt: '"Este expediente celebra la fuga; las facturas ya las veremos".', g1: 'Se leyó medio título. Deaton escribió salud, riqueza y los orígenes de la desigualdad, y esa segunda mitad es el argumento: de toda fuga se queda gente adentro. Aplazar no es esconder, pero hay que decir dónde está lo aplazado.', g2: 'La corrección es declarar el calendario: las fallas de la máquina en la etapa 2, lo que el dinero no debe comprar en la 3, la desigualdad y el clima en la 4, y el archivo junto al expediente rojo, que la Bóveda no acepta uno sin el otro.' },
  { txt: '"Ese dato me sirve, lo pongo en la lámina".', g1: 'Se saltó la regla del placer, que es la más incómoda de la materia: el dato que confirma lo que uno ya creía paga doble auditoría, precisamente porque es el que menos ganas dan de verificar.', g2: 'La corrección son tres pasos: buscar el dato en su fuente original, buscar activamente quién lo discute, y anotarlo con la misma letra aunque estropee la lámina que ya estaba hecha.' },
]);
B.critDecisionBank = JSON.stringify([
  'El banco espera respuesta por los L 300,000: ¿se acepta, se acepta con condiciones o no se acepta? ¿Qué dice el contrato exactamente sobre los ejemplos de la misión?',
  'La familia tiene que decidir el cobro de L 50 por alumno a los colegios privados: ¿se cobra, y qué se escribe antes para que no toque nunca a la escuela pública?',
  'La fundación extractiva espera por las L 150,000 en tabletas: ¿se aceptan, y qué se firma antes de que lleguen?',
  'La lámina de Jael se imprime mañana: ¿qué frase exacta va, con qué fuente y con qué nombre del que la discute?',
  'Los dos materiales escolares están sobre la mesa: ¿cuál se usa, cuál se guarda como ejercicio, y qué etiqueta se le escribe encima al que se guarda?',
  'Angelly espera la respuesta a si el capitalismo es bueno o malo: ¿qué se le contesta a su edad, y cómo se le explica por qué la pregunta se cambia?',
  'El dato de China va a entrar en el expediente: ¿en cuál de las dos peleas se coloca, y con qué nota al margen para que no lo use ningún bando a medias?',
  'La casa va a evaluar M.E.T.A.S: ¿contra qué alternativa real se compara, y qué evidencia haría que la casa dijera que hay algo mejor y se corriera a un lado?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Escribir «según el Banco Mundial, la pobreza extrema pasó de más de un tercio hacia 1990 a una décima parte antes de la pandemia, y Hickel discute esa línea».', b: 'Escribir «la pobreza en el mundo bajó muchísimo».', ga: 'Caso A: es el mismo dato con sus cuatro apoyos, así que se puede discutir, corregir y sostener de pie delante de alguien que piense distinto.', gb: 'Caso B: cabe mejor en una diapositiva y no afirma nada verificable; sirve para ganar en el aula y se desarma con una sola pregunta.', gr: 'La diferencia no es de rigor académico sino de uso: solo la primera se puede usar para decidir algo, y decidir es para lo que la casa estudia.' },
  { a: 'Hacer el acero del sistema antes de abrir las disputas.', b: 'Abrir las disputas primero, porque el acero suena a propaganda.', ga: 'Caso A: da la licencia para auditar, obliga a leer las fuentes del otro lado y hace que la crítica posterior tenga peso ante cualquiera.', gb: 'Caso B: se siente más honesto y produce lo contrario, porque una crítica de algo que no se supo defender se lee como identidad, y con razón.', gr: 'La regla del acero se enseña en el expediente rojo y aquí se aplica igual: esta casa no tiene una vara para cada bando.' },
  { a: 'Separar la pelea de la línea de la pelea de la atribución.', b: 'Discutir cuánto cayó y a qué se debió en la misma frase.', ga: 'Caso A: cada pelea recibe la clase de prueba que le corresponde, la metodológica una y la histórica comparada la otra, y las dos pueden avanzar.', gb: 'Caso B: es lo que hace casi todo el mundo, y por eso esas conversaciones no terminan nunca ni cambian de opinión a nadie.', gr: 'Mezclar las dos peleas es como discutir a la vez cuánto pesa algo y de quién es: las dos preguntas son buenas y ninguna se contesta así.' },
  { a: 'Comparar el proyecto propio con las alternativas reales.', b: 'Comparar el proyecto propio con la escuela ideal que uno se imagina.', ga: 'Caso A: es la abstracción central de la materia aplicada en casa, y da un veredicto que se puede usar, además de aceptarse en las dos direcciones.', gb: 'Caso B: da siempre el resultado que uno tenga ganas ese día, brillante o miserable, y por eso no informa ninguna decisión.', gr: 'No se compara con el paraíso: se compara con las alternativas reales, y esa regla vale igual para el sistema que para el proyecto de la casa.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se cita un número grande sin fecha, sin línea y sin contradictor.', guide: 'La cifra queda como adorno: puede ser verdadera y no prueba nada, se desarma con una sola pregunta, y de paso enseña a los que escuchan que en esta casa los números se usan como banderas.' },
  { cause: 'Se hace el acero del sistema antes de abrir las disputas.', guide: 'La auditoría que viene después gana peso ante cualquiera, incluido el que defiende lo auditado, y quien estudia aprende que la licencia para criticar se saca leyendo al otro lado.' },
  { cause: 'Se mezclan la pelea de la línea y la pelea de la atribución.', guide: 'Ninguna de las dos avanza, porque cada una necesita una clase de prueba distinta, y la conversación se convierte en un intercambio de banderas donde el que grita más parece tener razón.' },
  { cause: 'Se dice «el capitalismo» en singular y se le apunta la fuga entera.', guide: 'Se pierde de vista que el sistema vino en variedades, y con ello la única pregunta que rinde: qué mercados, con qué reglas y para qué bienes, que es la que se contesta uno por uno y decide cosas.' },
  { cause: 'Se celebra la fuga sin mirar a los que quedaron adentro.', guide: 'Se lee medio título de Deaton y se convierte una investigación seria en propaganda; además se pierde el hilo que conecta esta etapa con las tres siguientes, que es exactamente ese hueco.' },
  { cause: 'La casa aplica la regla del placer a sus propios datos cómodos.', guide: 'Aparecen las cifras que se estaban repitiendo sin verificar, se corrigen con fuente y fecha, y el expediente empieza a poder sostenerse delante de alguien que piensa distinto, que es la única prueba que vale.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'Los L 300,000 del banco se aceptaron con el logo en créditos y cero productos propios en los ejemplos.', guide: 'La pregunta que decidió fue si la misión enseñaría lo mismo con otro patrocinador. Con logo fuera del contenido, cláusula de salida sin penalidad y el trato publicado donde cualquier maestro lo pueda leer, la respuesta es sí, y por eso se aceptó con condiciones.' },
  { effect: 'El cobro a colegios privados quedó aprobado, y la escuela pública quedó blindada por escrito.', guide: 'El precio no alcanza a la escuela pública ni condiciona qué misiones se escriben, las cuentas se publican a la vista, y la opción de abrir el código y sostenerlo en comunidad quedó evaluada por escrito antes de decidir. Lo que el precio le hace al bien es la etapa 3, y se nombró sin contestarla.' },
  { effect: 'Las tabletas se aceptaron con independencia editorial firmada antes de la entrega.', guide: 'La donación quedó publicada con monto y fecha, y con el compromiso de que si algún día hay ficha sobre ese río se escribe con la misma doble columna que todo lo demás. El caso entró como categoría y no con nombre propio, que es la regla de selección de esta materia.' },
  { effect: 'La lámina de Jael se reescribió y quedó más larga y más útil.', guide: 'El mismo dato con sus cuatro apoyos: la fuente, los años, la línea y el nombre de quien la discute. Sigue cabiendo en la lámina, y ahora se puede defender delante de un maestro que pregunte de dónde salió.' },
  { effect: 'De los dos materiales escolares no se usó ninguno como fuente.', guide: 'Los dos fallaban en el mismo sitio: ni años, ni línea, ni países, ni contradictor. Se guardaron como ejercicio, con la etiqueta escrita encima para que nadie los cite después por error, y se usaron en clase precisamente para mostrar que la vara es una sola para los dos estantes.' },
  { effect: 'El dato de China quedó en el expediente, en la pelea de la atribución y con su nota al margen.', guide: 'La nota dice que corta en las dos direcciones: obliga al que celebra a explicar el híbrido y al que acusa a explicar qué cambió al final de los setenta. Y queda apuntada la disciplina de la casa: cuando un dato incomoda a los dos bandos, casi siempre es el dato bueno.' },
]);

/* ---------- línea de tiempo: los siete momentos ---------- */
B.timelineData = JSON.stringify([
  { y: '1883', icon: '🧵', label: 'Bismarck, y las variedades', text: 'Mientras en Inglaterra se discutía si el Estado debía existir, <strong>Bismarck monta el seguro obligatorio de enfermedad</strong> para los trabajadores. Es la prueba fechada de que <strong>el sistema vino en variedades desde el arranque</strong>: el de Mánchester no era el de Bismarck, y la palabra en singular ya es una simplificación.' },
  { y: '1963', icon: '🎬', label: 'La película del título', text: 'Se estrena una película sobre una <strong>evasión</strong>, y medio siglo después un economista le tomará prestado el nombre para su libro. El detalle no es anecdótico: la metáfora de la fuga trae consigo <strong>la idea de que algunos salen y otros no</strong>, que es la mitad del argumento.' },
  { y: '1990', icon: '📉', label: 'El punto de partida de la serie', text: 'Es el año desde el que se suele contar la caída: hacia entonces estaba en pobreza extrema <strong>más de un tercio de la humanidad</strong>, según las series del <strong>Banco Mundial</strong> y de <strong>Our World in Data</strong>. La cifra <strong>nunca se cita sin el año y sin la línea</strong> con que se midió.' },
  { y: '2010', icon: '📈', label: 'McCloskey y el gran enriquecimiento', text: 'En <strong>«Bourgeois Dignity»</strong>, Deirdre McCloskey calcula un factor de alrededor de <strong>treinta</strong> en el nivel de vida del habitante común. Etiqueta doble y las dos juntas: <strong>sólida en los datos</strong>, y su explicación causal (la dignidad del comerciante y del inventor) <strong>entra como tesis y no como consenso</strong>.' },
  { y: '2013', icon: '🏃', label: 'Deaton y la gran fuga', text: 'Se publica <strong>«El gran escape: salud, riqueza y los orígenes de la desigualdad»</strong>. Etiqueta: <strong>clásico sólido reciente</strong>. Y la segunda mitad del título es el argumento y no un apéndice: <strong>de toda fuga se queda gente adentro</strong>.' },
  { y: '2015', icon: '🏅', label: 'El Nobel', text: 'Angus Deaton recibe el <strong>Nobel de Economía</strong>. Importa para el estatus de la fuente: no es un ensayista de aeropuerto ni un panfletario, es el consenso profesional reconociendo un trabajo. Lo cual <strong>no lo vuelve inmune a la auditoría</strong>, solo obliga a hacerla en serio.' },
  { y: '2019', icon: '⚔️', label: 'Hickel contra Roser', text: '<strong>Jason Hickel</strong> sostiene que la línea de pobreza es demasiado baja para llamarle vida a lo que hay encima; <strong>Max Roser</strong> responde con las series largas, y <strong>Steven Pinker</strong> defiende la lectura optimista. Etiqueta: <strong>disputa viva de medición</strong>, y <strong>viva se enseña</strong>: quien diga que está resuelta está vendiendo bando.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  definicion: {
    nombre: 'La definición de Kocka', icon: '📖',
    estructura: { title: 'Qué es', info: '• De <strong>«Historia del capitalismo»</strong>, síntesis académica breve<br>• Cuatro piezas: <strong>mercados, propiedad privada, trabajo asalariado y ganancia reinvertida</strong><br>• Hacen falta <strong>las cuatro juntas</strong>: con tres no alcanza' },
    funcion: { title: 'Cómo se reconoce', info: '• Los precios se forman en el intercambio y no los fija una autoridad<br>• La mayoría vive de <strong>vender su tiempo</strong> por un salario<br>• Y la ganancia <strong>vuelve al negocio</strong> en vez de gastarse entera' },
    enfermedades: { title: 'Dónde se cae', info: '• Discutir el sistema <strong>sin definirlo</strong>, que es lo que hace casi todo el mundo<br>• Usar la palabra <strong>en singular</strong> como si nombrara una sola cosa<br>• Confundir <strong>mercado</strong> con <strong>capitalismo</strong>: hay mercados desde hace milenios' },
    cuidados: { title: 'En esta casa', info: '• Definir viene <strong>antes</strong> que juzgar, y se dice el primer día<br>• La teoría de precios y los clásicos enteros <strong>viven en Economía política</strong><br>• Aquí se remiten y no se repiten: esta materia audita el sistema entero' },
  },
  fuga: {
    nombre: 'La gran fuga', icon: '🏃',
    estructura: { title: 'Qué es', info: '• De <strong>Deaton (2013)</strong>, <strong>clásico sólido reciente</strong>, Nobel en 2015<br>• La salida masiva de <strong>la pobreza y de la muerte temprana</strong> en dos siglos<br>• Con <strong>McCloskey (2010)</strong>: el gran enriquecimiento, factor de treinta' },
    funcion: { title: 'Cómo se reconoce', info: '• Pobreza extrema: <strong>más de un tercio hacia 1990, una décima antes de la pandemia</strong><br>• Mortalidad de menores de cinco: <strong>cerca de la mitad en 1800, menos de 1 de 20 hoy</strong><br>• Esperanza de vida: de rondar los <strong>treinta</strong> a superar los <strong>setenta</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Citar las cifras <strong>sin año y sin línea</strong>: eso es la cifra suelta<br>• Pegar el dato de McCloskey con <strong>su tesis causal</strong>, que es otra cosa<br>• Leer <strong>medio título</strong> de Deaton y olvidar los orígenes de la desigualdad' },
    cuidados: { title: 'En esta casa', info: '• El acero primero: <strong>no se audita lo que no se sabe defender</strong><br>• Las facturas tienen etapa: <strong>la 2, la 3 y la 4</strong>, y no se adelantan<br>• Y este expediente <strong>se archiva junto al rojo</strong>: la Bóveda pide los dos' },
  },
  disputas: {
    nombre: 'Las dos disputas', icon: '⚔️',
    estructura: { title: 'Qué es', info: '• <strong>La de la línea:</strong> cuánto cayó, y si el umbral no es muy bajo<br>• <strong>La de la atribución:</strong> a qué arreglo se le apunta el resultado<br>• Son <strong>dos</strong>, con distintos contendientes y distinta clase de prueba' },
    funcion: { title: 'Cómo se reconoce', info: '• Línea: <strong>Hickel</strong> contra <strong>Roser</strong> y <strong>Pinker</strong>, en el cruce de <strong>2019</strong><br>• Atribución: el tramo mayor desde <strong>1980</strong> fue en <strong>China</strong>, bajo un híbrido<br>• Y ese dato <strong>incomoda a los dos bandos</strong>, que es la señal de que es bueno' },
    enfermedades: { title: 'Dónde se cae', info: '• <strong>Mezclarlas</strong> en la misma frase, y así no avanza ninguna<br>• Declarar resuelta la de la línea: <strong>quien lo hace está vendiendo bando</strong><br>• Usar el dato de China <strong>a medias</strong>, solo por el lado que conviene' },
    cuidados: { title: 'En esta casa', info: '• Las disputas vivas <strong>se enseñan vivas</strong>, con fecha y con los dos nombres<br>• Y con <strong>la regla del placer</strong>: el dato cómodo paga doble auditoría<br>• El puente entre las dos son <strong>las variedades de Kocka</strong>' },
  },
  variedades: {
    nombre: 'Las variedades', icon: '🧵',
    estructura: { title: 'Qué es', info: '• El sistema <strong>vino en variedades desde el arranque</strong>, no después<br>• <strong>Mánchester</strong> no era <strong>Bismarck</strong>, que en 1883 montó el seguro de enfermedad<br>• Y el <strong>nórdico</strong> de hoy no es el <strong>anglosajón</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Hay <strong>dos diales distintos</strong>: cuánto mercado y cuánta redistribución<br>• Confundirlos es el error más común del debate entero<br>• Y explica por qué <strong>«el capitalismo» a secas</strong> es la pregunta mal hecha' },
    enfermedades: { title: 'Dónde se cae', info: '• Apuntarle la fuga entera a <strong>una sola variedad</strong><br>• O culpar a <strong>una sola variedad</strong> de todas las facturas<br>• Usar las variedades como <strong>salida diplomática</strong> en vez de como puente' },
    cuidados: { title: 'En esta casa', info: '• La pregunta que rinde: <strong>qué mercados, con qué reglas y para qué bienes</strong><br>• Las variedades entran a fondo en la <strong>etapa 5</strong>, y aquí se nombran<br>• Y la política hondureña de hoy <strong>no entra ni de ejemplo</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Opina del agua en la que nada 🎽' },
  { t: 25, n: 'Define antes de juzgar 📖' },
  { t: 55, n: 'Recita la gran fuga con sus fechas 🏃' },
  { t: 90, n: 'Separa la pelea de la línea de la de la atribución ⚔️' },
  { t: 130, n: 'Llena la hoja de la cifra sin que le falte un renglón 🧾' },
  { t: 165, n: 'Hace el acero del sistema sin mueca 🛡️' },
  { t: 190, n: 'Compara con las alternativas reales, no con el paraíso 📒' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la gran fuga superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la etapa explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de aceros y adornos' },
  id_master: { icon: '🔍', label: 'Identificador de piezas y fuentes maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa del expediente' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 1 de la Ruta del Expediente Dorado completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  { t: 'Borges', q: '¿Qué encargo heredó el narrador junto con una deuda y un reloj que atrasaba?', o: ['a) Ordenar el archivo de una parroquia y escribir una crónica de la prosperidad del lugar', 'b) Traducir un libro de economía', 'c) Levantar el censo del pueblo', 'd) Administrar un molino'], c: 0 },
  { t: 'Borges', q: '¿Dónde encontró finalmente la huella de la prosperidad?', o: ['a) En los inventarios de las casas ricas', 'b) En el registro de entierros, que iba adelgazando en las anotaciones de criaturas', 'c) En las escrituras de las tierras', 'd) En los techos de teja'], c: 1 },
  { t: 'Borges', q: '¿Cuál fue el primer error del cronista, y quién se lo hizo ver?', o: ['a) Confundir dos siglos', 'b) Citar de memoria', 'c) Escribir «capitalismo» en singular, y se lo hizo ver un lector paciente con la advertencia de Kocka', 'd) Olvidar la fecha del Nobel'], c: 2 },
  { t: 'Borges', q: '¿En qué consistió el segundo error, el más fino?', o: ['a) Confundir a Deaton con McCloskey', 'b) Poner mal el factor de treinta', 'c) Citar una película equivocada', 'd) Pegar con la misma cola el dato de McCloskey y su explicación causal'], c: 3 },
  { t: 'Borges', q: '¿Qué quedó al principio de la crónica rehecha, sin cifra y sin nota?', o: ['a) El libro de entierros adelgazando, porque hay hechos que se sostienen solos', 'b) La definición de Kocka', 'c) El nombre del Nobel', 'd) La lista de techos de teja'], c: 0 },
  { t: 'Cervantes', q: '¿Qué diligencia le pide don Quijote a Sancho antes de examinar la abundancia de las bodas?', o: ['a) Que cuente las ollas', 'b) Que alabe bien lo alabable, sin mentir por adular ni por contradecir', 'c) Que hable con el novio', 'd) Que no coma nada'], c: 1 },
  { t: 'Cervantes', q: 'Cuando el cocinero responde que la abundancia viene de la hacienda del novio, don Quijote replica que…', o: ['a) Eso basta como respuesta', 'b) Los novios siempre exageran', 'c) También la hacienda está hecha de algo: caminos, bodegas, tratos y gente que madrugó', 'd) Habría que preguntarle al cura'], c: 2 },
  { t: 'Cervantes', q: '¿Qué detalle del relato del cocinero enseñó más que todos los demás?', o: ['a) El número de quesos', 'b) El nombre del novio', 'c) El precio del vino', 'd) El año en que no hubo boda ninguna porque se perdió todo'], c: 3 },
  { t: 'Cervantes', q: '¿Qué ve don Quijote en el pastor viejo que pasa por la orilla sin ser convidado?', o: ['a) Que de toda fiesta hay gente afuera, y el número de los de afuera es parte de la fiesta', 'b) Que el pastor es un encantador', 'c) Que las cabras valen más que el novillo', 'd) Que conviene seguirlo'], c: 0 },
  { t: 'Cervantes', q: '¿Cuáles son las dos cuentas fáciles contra las que previene don Quijote en el camino?', o: ['a) La del hambre y la del sueño', 'b) Que todo tiempo pasado fue mejor, y que porque hoy se come más ya no hay nada que mirar', 'c) La del vino y la del pan', 'd) La de los caminos y la de las bodegas'], c: 1 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué era lo normal en la vida humana durante casi toda la historia de la especie?', o: ['a) Vivir en ciudades grandes', 'b) Trabajar por un salario', 'c) Nacer pobre, trabajar la tierra, enterrar a varios hijos y morir antes de los cuarenta', 'd) Migrar cada generación'], c: 2 },
  { t: 'Harari', q: '¿Qué dos cosas del libro de McCloskey pide separar el ensayo?', o: ['a) El título y el subtítulo', 'b) El idioma original y la traducción', 'c) La primera y la segunda edición', 'd) Los datos, que son sólidos, y la explicación causal, que es una tesis discutida'], c: 3 },
  { t: 'Harari', q: 'Según Kocka, citado en el ensayo, ¿qué se omite casi siempre al hablar del capitalismo?', o: ['a) Que vino en variedades desde el principio y sigue viniendo', 'b) Que empezó en Inglaterra', 'c) Que necesita bancos', 'd) Que produce desigualdad'], c: 0 },
  { t: 'Harari', q: '¿Por qué dice el ensayo que el dato de China incomoda a los dos bandos?', o: ['a) Porque las cifras chinas no son fiables', 'b) Porque obliga al que celebra a explicar el híbrido y al que acusa a explicar qué cambió al final de los setenta', 'c) Porque ocurrió muy lejos', 'd) Porque nadie lo ha estudiado'], c: 1 },
  { t: 'Harari', q: '¿Cuál es el hábito de treinta segundos que propone el ensayo?', o: ['a) Leer el resumen antes que el libro', 'b) Anotar la fuente en un cuaderno', 'c) Preguntarle a todo número grande qué afirma, cuánto, según quién, con qué línea y quién lo discute', 'd) Buscar siempre una segunda opinión'], c: 2 },
]);
B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: 'El libro de Deaton que citan los tres textos se publicó en ___.', a: '2013' },
  { t: 'las tres', q: 'Deaton recibió el Nobel de Economía en ___.', a: '2015' },
  { t: 'Borges', q: 'El narrador heredó el encargo de su ___.', a: 'tío' },
  { t: 'Borges', q: 'La huella de la prosperidad estaba en el registro de ___.', a: 'entierros' },
  { t: 'Borges', q: 'Bismarck montó el seguro obligatorio de enfermedad en ___.', a: '1883' },
  { t: 'Cervantes', q: 'El novio rico de las bodas del ancla real se llama ___.', a: 'Camacho' },
  { t: 'Cervantes', q: 'Según la agüela de Sancho, solo hay dos linajes en el mundo: el tener y el no ___.', a: 'tener' },
  { t: 'Harari', q: 'El factor del gran enriquecimiento que calculó McCloskey es de alrededor de ___.', a: 'treinta' },
  { t: 'Harari', q: 'El tramo mayor de la salida de la pobreza desde 1980 ocurrió en ___.', a: 'China' },
  { t: 'Harari', q: 'La esperanza de vida en Honduras pasó de rondar los cuarenta a más de ___ hoy.', a: 'setenta' },
]);
B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan a la misma disciplina por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento instala el error como vergüenza propia y en tres tiempos, que es lo que ninguna explicación consigue: el cronista se equivoca primero por grueso (escribe la palabra en singular), después por fino (pega un dato con una tesis) y al final por lo que casi nadie ve (cita una cifra sin preguntar con qué línea se midió). Esa escalera de tres errores es la lección entera, y se recuerda porque humilla un poco. El capítulo lo vuelve escena y refrán, y aporta lo que los otros dos no tienen: la abundancia delante, con su olor y sus ollas, de modo que el acero se hace mirando en vez de razonando, y además pone al pastor que pasa por la orilla, que es la segunda mitad del título de Deaton convertida en imagen. El ensayo lo pone a escala de especie y con nombres propios, y por eso es el único que sirve para citar en una discusión: separa las dos disputas, nombra a Hickel y a Roser con su año, y trae el dato de China que incomoda a los dos bandos. Quien lee solo una se queda sin la vergüenza, sin la imagen o sin la prueba.' },
  { q: '2. El cronista del cuento comete tres errores, y el orden en que los comete no es casual. Explícalos y di por qué cada uno es más difícil de ver que el anterior.', guia: 'El primero es de vocabulario y se ve desde lejos una vez señalado: escribió «capitalismo» en singular, como quien nombra a un caballero conocido, y la advertencia de Kocka es que el sistema vino en variedades desde el arranque, con Mánchester y Bismarck de ejemplo y el seguro obligatorio de 1883 con fecha. El segundo es de estatus de fuente y ya no se ve a simple vista: citó el factor de alrededor de treinta que calculó McCloskey y le pegó su explicación causal como si fuera parte del mismo hallazgo, cuando el cálculo es sólido y la causa que ella propone es una tesis discutida. El tercero es el más fino y el más frecuente en gente honrada: dio una cifra correcta, con fuente y con años, y no supo con qué línea se había medido, que es justo donde vive la disputa entre Hickel y Roser. La escalera va de la palabra al estatus y del estatus al método, y por eso el cronista solo se cura en el tercer escalón: los dos primeros los puede corregir un lector atento, y el tercero exige ir a leer la metodología. Lo que ordena los tres es la misma pregunta, que es la de la hoja de la cifra.' },
  { q: '3. Don Quijote obliga a Sancho a alabar la abundancia antes de examinarla. Explica qué regla de esta casa está aplicando y por qué el orden importa tanto.', guia: 'Está aplicando la regla del acero, que en este arco es la regla madre y que se enseña en el expediente gemelo, el rojo: la mejor versión primero, el veredicto después. Su formulación en el capítulo es exacta y merece citarse: el que empieza a examinar sin haber alabado lo alabable no examina, regatea. El orden importa por tres razones que conviene distinguir. La primera es epistémica: para auditar algo hay que entenderlo, y la manera de comprobar que se entendió es poder enunciarlo como lo enunciaría quien lo defiende, sin mueca y sin el «sí, pero» adelantado. La segunda es retórica y muy práctica: una crítica hecha por alguien que evidentemente no leyó al otro lado se lee como identidad, y con razón, de modo que el acero es lo que le da peso a todo lo que viene después. La tercera es moral y es la que cuesta: quien no puede alabar lo alabable de aquello que va a criticar suele estar defendiendo una pertenencia y no una tesis. En la etapa esto se aplica al sistema entero, y la prueba de que el acero está bien hecho es que quien defiende esa postura lo firmaría sin corregir una coma.' },
  { q: '4. El pastor que pasa por la orilla sin ser convidado no dice una sola palabra en todo el capítulo. Explica qué hace ahí y con qué parte del libro de Deaton se corresponde.', guia: 'Se corresponde exactamente con la segunda mitad del título que casi nadie cita: «los orígenes de la desigualdad». Deaton no puso esa mitad como apéndice sino como argumento, porque la idea de fuga la trae incorporada: de toda evasión se queda gente adentro, y el hueco entre los que salieron y los que no es un producto de la misma salida y no un accidente aparte. En el capítulo, el pastor cumple esa función sin decir nada, que es la manera cervantina de decirlo: la fiesta es verdadera y el que la niega miente, y el que la cuenta sin contar al que va por la orilla miente también, aunque con mejores modales. La frase de don Quijote de que el número de los de afuera es parte de la fiesta, aunque no huela, es la traducción a lenguaje de camino de lo que en el libro es una tesis de economía. Y hay un detalle de composición que conviene notar: el pastor aparece después del acero y no antes, porque si apareciera antes serviría para no mirar las ollas, que es justo el vicio contrario.' },
  { q: '5. El ensayo dice que el dato de China desde 1980 incomoda a los dos bandos por igual. Explica en qué consiste esa incomodidad para cada uno y por qué la casa considera que un dato así es especialmente valioso.', guia: 'Para quien celebra el sistema, la incomodidad es que el tramo mayor de la salida de la pobreza desde 1980 ocurrió bajo un arreglo que no se parece al mercado de los manuales: un híbrido de partido y Estado con mercado, con planificación, con empresas estatales y con una apertura gradual decidida desde arriba. Apuntarle ese tramo al «capitalismo» a secas obliga entonces a explicar de qué variedad se está hablando, y esa explicación ya no cabe en una consigna. Para quien acusa al sistema, la incomodidad es simétrica: si el resultado se le quita al mercado, hay que explicar qué cambió exactamente al final de los años setenta, porque el arreglo anterior llevaba décadas y no había producido nada parecido. La casa considera valioso un dato así por una razón de método que se dice en voz alta: cuando un dato incomoda a los dos bandos, casi siempre es el dato bueno, porque significa que no fue seleccionado por nadie para ganar una discusión. Y su uso correcto no es ganar la discusión con él, sino mejorar la pregunta: las variedades de Kocka son el puente, y la pregunta que sale de ahí es qué mercados, con qué reglas y para qué bienes.' },
  { q: '6. Compara la corrección que recibe el cronista del cuento con la que recibe Sancho en el camino. ¿Cuál es más eficaz y por qué?', guia: 'La del cronista llega por partes y desde tres lectores distintos, y ninguno le explica nada: le hacen ver un uso de la lengua, le señalan que dos operaciones no son la misma y le preguntan con qué línea se midió una cifra. Es una corrección de artesano, lenta, y funciona porque cada señalamiento lo obliga a ir a leer. La de Sancho llega de una sola vez, desde su amo, con autoridad y con una regla explícita: guárdate de las dos cuentas fáciles, la de que todo tiempo pasado fue mejor y la de que porque hoy se come más ya no hay nada que mirar, y para saber cuándo te has pasado pregúntate cuánto, desde cuándo, quién lo contó y quién lo discute. Se puede defender cualquiera de las dos como más eficaz si se argumenta. La del cuento suele ganar porque no dice la conclusión y por eso obliga a pensar, y porque el error queda asociado a una vergüenza propia, que se recuerda mejor que una regla. La del capítulo tiene la ventaja de traer el criterio ya formulado y en cuatro palabras memorizables, que es lo que uno necesita en el momento en que la conversación va rápido. Lo común a las dos, y es lo que hay que señalar, es que ninguna discute el contenido: las dos atacan la forma en que la afirmación fue construida.' },
  { q: '7. «Definir viene antes que juzgar» aparece en las tres lecturas de manera distinta. Explica cómo aparece en cada una y por qué esta materia lo pone como primera regla.', guia: 'En el cuento aparece como error cometido: el cronista escribe la palabra en singular y un lector paciente le trae la advertencia de Kocka sobre las variedades, con Mánchester y Bismarck y el seguro obligatorio de 1883 de por medio. En el capítulo aparece convertido en interrogatorio: don Quijote no acepta que la abundancia venga «de la hacienda del novio» y exige saber de qué está hecha la hacienda, es decir los caminos, las bodegas, los tratos y la gente que madrugó, que es definir el objeto antes de opinar sobre él. En el ensayo aparece como exposición directa, con las cuatro piezas de Kocka enumeradas y con la advertencia de que la palabra en singular es un apellido para una familia entera. La materia lo pone como primera regla por una razón práctica y comprobable: casi todas las peleas sobre el capitalismo se pelean sin definirlo, de modo que cada quien está juzgando una cosa distinta y la conversación no puede terminar. Y hay una segunda razón, que es la que rinde de verdad: una vez definido en cuatro piezas y admitidas las variedades, la pregunta deja de ser mercado sí o no y pasa a ser qué mercados, con qué reglas y para qué bienes, que es una pregunta que se contesta uno por uno y que decide cosas.' },
  { q: '8. El cuento termina diciendo que el libro de entierros quedó al principio de la crónica «sin cifra y sin nota». Explica por qué, y relaciónalo con lo que en esta etapa queda en pie pase lo que pase con las dos disputas.', guia: 'Queda sin cifra y sin nota porque hay hechos que se sostienen solos y decirlo es parte del oficio: nadie discute que aquel escribiente del siglo dieciocho necesitaba abreviaturas para que le cupieran las anotaciones de criaturas y que el del siglo veinte tenía sitio de sobra. Ese hecho no depende de dónde se ponga una línea de pobreza ni de a qué arreglo se le apunte el mérito. Y ahí está la correspondencia con la etapa: terminadas la disputa de la línea y la de la atribución, algo queda en pie, y la casa lo dice en voz alta porque callarlo sería tan poco serio como exagerarlo. Lo que queda en pie es que la gente vive mucho más y muere mucho menos de niña que hace dos siglos, con la mortalidad de menores de cinco años pasando de cerca de la mitad a menos de uno de cada veinte, y con la esperanza de vida al nacer pasando de rondar los treinta a superar los setenta. Lo que se discute, y se discute en serio, es cuánto de esa mejora cuenta como salida de la pobreza y a qué arreglo se le atribuye, que son dos preguntas distintas y ninguna de las dos borra el registro civil. Distinguir el hecho que sobrevive de la interpretación que se pelea es exactamente lo que el cronista aprendió en seis semanas.' },
  { q: '9. ¿Por qué esta etapa, que es la primera de una ruta crítica, está dedicada entera a la defensa de lo que después va a auditar? Argumenta a favor y en contra de esa decisión.', guia: 'A favor hay tres razones y conviene darlas con nombre. La epistémica: para auditar algo hay que entenderlo, y la prueba de que se entendió es poder hacer su mejor caso con sus mejores números, tal que su defensor lo firmaría. La retórica: una crítica hecha por quien no supo defender lo criticado se lee como identidad y no convence a nadie que no estuviera ya convencido. Y la de simetría, que es la que hace honesta a la casa: existe un expediente gemelo, el rojo, con el mismo esqueleto y la misma dureza, y los dos se archivan juntos porque la Bóveda no acepta uno sin el otro; un lector de cualquier bando debe salir incómodo por igual. En contra se puede argumentar, y hay que dejarlo dicho: que dedicar una séptima parte del curso a la defensa corre el riesgo de que alguien se quede solo con esta etapa y salga con una versión apologética; que las cifras de la fuga, dichas sin las facturas, tienen un efecto emocional que las facturas posteriores difícilmente compensan; y que el orden podría invertirse sin pérdida lógica. La respuesta de la casa a esas objeciones es de método y no de fe: las facturas están fechadas y declaradas en esta misma etapa, con su número de etapa cada una, y el archivo conjunto de los dos expedientes es la garantía comprobable de que no se trata de una parada apologética.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué esa etiqueta pertenece al temario de esta etapa en particular, y qué pasaría si se quitara.', guia: 'Porque esta etapa enseña que una afirmación vale lo que valen su fuente y su estatus, y un pastiche sin declarar es exactamente una fuente con el estatus falsificado: el lector cree estar recibiendo la autoridad de Borges, de Cervantes o de Harari, cuando lo que hay detrás es una casa que escribe misiones para sus hijas. Enseñar a exigirle a cada cifra su firma y ocultar la propia sería la contradicción más rápida posible. Hay además una razón que es exactamente el tema de la etapa: en esta materia la trampa más fácil de todas no sería inventar un argumento sino inventar una cifra redonda, y una voz prestada hace que cualquier número suene más verdadero; la etiqueta obliga a separar el timbre del contenido, que es la misma separación que la hoja de la cifra pide entre lo que un dato afirma y quién lo sostiene. Si se quitara pasarían dos cosas comprobables. Alguien citaría a Deaton, a McCloskey o el cruce de Hickel y Roser a través de una frase que ninguno de ellos escribió, y la casa quedaría produciendo el tipo de fuente inflada que su propio compendio manda cazar, en la materia donde más caro se paga hacerlo.' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_dorado_fuga_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena el acero primero y la hoja de la cifra. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden, y el orden es el método. Primero el acero: se enuncia el mejor caso de lo que hay sobre la mesa con sus números más fuertes y con la voz de quien de verdad lo defendería, sin mueca y sin el pero adelantado; la prueba de que está bien hecho es que quien sostiene esa postura lo firmaria sin corregir una coma, y quien no puede hacer eso no esta autorizado a auditar nada. Después se llena la hoja de la cifra, que tiene cinco renglones y ninguno es decorativo: que afirma exactamente, en una oración con sujeto y número y sin adjetivos; cuánto, con su horquilla si la tiene y con el hueco declarado si no; según quién, con obra, autor, año y etiqueta de estatus, que aquí son Deaton 2013 como clásico sólido reciente, McCloskey 2010 sólida en los datos y con su explicación causal entrando como tesis, Kocka 2016 como síntesis académica breve, y las series del Banco Mundial y de Our World in Data siempre con fecha; con qué método y con qué línea o umbral, porque una cifra de pobreza sin el umbral no dice nada; y quién lo disputa, junto con qué dato resolvería el pleito. Si hay disputa se dice de cuál de las dos se trata, porque son dos y se confunden todo el tiempo: la de la línea discute cuánto cayó, con Hickel de un lado y Roser y Pinker del otro en el cruce de 2019, y la de la atribución discute a qué arreglo se le apunta, con el tramo chino desde 1980 como dato central; el puente entre las dos son las variedades de Kocka. Y al final van las dos casillas que separan el oficio del desahogo: la decisión con su condición escrita, porque aceptar con condiciones es el resultado normal de una auditoría y no una derrota, y qué queda en pie pase lo que pase con las disputas. Encima de las dos va la regla de la casa: no se compara con el paraíso sino con las alternativas reales, también cuando el objeto auditado es el proyecto propio, y toda decisión lleva su renglon de que evidencia la haria cambiar, con fecha.";');

/* ---------- lo que arrastra el molde (la etapa 2 de los Átomos) ---------- */
const textos = [
  [/⚙️ \*Ruta de los Átomos y los Ídolos · Etapa 2\* ⚙️\\n\\nEl hombre máquina y la base material: el agua mueve los mazos, pero no decide qué paño se abatana\. ⚙️\\n\\n_Incluye evaluación conceptual, la base sobre la mesa, guion de video, tres lecturas y sus 35 preguntas\._ ✍️/g,
    '📒 *Ruta del Expediente Dorado · Etapa 1* 📒\\n\\nLa gran fuga: nadie audita bien lo que no sabe defender con sus mejores cifras. 📒\\n\\n_Incluye evaluación conceptual, la cifra sobre la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/El hombre máquina y la base material/g, 'La gran fuga'],
  [/el hombre máquina y la base material/g, 'la gran fuga'],
  [/La base sobre la mesa/g, 'La cifra sobre la mesa'],
  [/la base sobre la mesa/g, 'la cifra sobre la mesa'],
  [/Etapa 2 de la Ruta de los Átomos y los Ídolos/g, 'Etapa 1 de la Ruta del Expediente Dorado'],
  [/Ruta de los Átomos y los Ídolos · Etapa 2 de 6/g, 'Ruta del Expediente Dorado · Etapa 1 de 7'],
  /* este vive en el encabezado de las dos pruebas imprimibles, y es el que se
     le escapó al primer grep en misiones pasadas: no dice «de 6» sino
     «· Estudio Mayor» */
  [/Ruta de los Átomos y los Ídolos · Etapa 2 · Estudio Mayor/g, 'Ruta del Expediente Dorado · Etapa 1 · Estudio Mayor'],
  /* y lo que quede del nombre de la ruta anterior, ya sin número */
  [/Ruta de los Átomos y los Ídolos/g, 'Ruta del Expediente Dorado'],
  [/const msgs=\['¡Sigue buscando el mecanismo!','¡Muy buen trabajo!','¡Aprendiz de auditor!','¡Ya distingues condicionar de determinar!','¡Auditas sin brocha gorda!'\]/,
    "const msgs=['¡Sigue llenando la hoja!','¡Muy buen trabajo!','¡Aprendiz de auditor!','¡Ya separas la línea de la atribución!','¡Haces el acero sin mueca!']"],
  [/\['#0369a1','#38bdf8','#a8a29e','#c2410c','#00b894'\]/, "['#854d0e','#facc15','#a8a29e','#166534','#00b894']"],
  /* el oro viejo y el verde del haber en las pruebas y en las hojas */
  [/#0369a1/g, '#854d0e'],
  [/#082f49/g, '#422006'],
  [/#eff8ff/g, '#fffbeb'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/Si la fiebre cambia lo que uno piensa, el que piensa es el cuerpo\./g, 'La salida masiva de la pobreza y de la muerte temprana en dos siglos.'],
  [/>El hombre máquina \(La Mettrie, 1747\)</g, '>La gran fuga (Deaton, 2013)<'],
  /* las preguntas fijas de la prueba competencial preguntaban por la base */
  [/¿De qué vive materialmente la institución del caso, y qué se puede afirmar como condicionamiento sin pasarse a determinismo\? Explica qué fuente lo sostiene con su etiqueta, qué prueba lo desmentiría, qué NO se concluye y qué sobrevive entero a la auditoría\./g,
    '¿Cuál es el mejor caso de lo que hay sobre la mesa, dicho con sus números y sin mueca? Llena después la hoja de la cifra, di de cuál de las dos disputas se trata si la hay, con qué fuente y con qué etiqueta, y qué queda en pie pase lo que pase.'],
  [/1\. ¿Cuál de los dos se puede desmentir y cuál se inmuniza\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos se puede sostener de pie y cuál se desarma con una pregunta? 2. ¿Por qué no son la misma decisión?'],
  /* el subtítulo del pliego de las tres lecturas */
  [/Un cuento, un capítulo de caballerías y un ensayo, sobre la misma corriente/g,
    'Un cuento, un capítulo de caballerías y un ensayo, sobre la misma fuga'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'El silbato de las seis',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'El libro que fue adelgazando',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'De lo que sonaba en la oscuridad, y de quién movía los mazos',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'De lo que vieron en las bodas del rico, y de la cuenta que sacó Sancho antes de las ollas',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'La especie que piensa con lo que tiene en las manos',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'La especie que se fugó de su propia historia',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa anterior era el cuaderno de Jael y la brocha
   gorda. Aquí es la lámina del jueves: soltar la cifra tal cual o llenarle
   la hoja de la cifra antes de usarla. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(prueba){sfx(prueba?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(prueba){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🧾</span><span class="ms-text"><strong>La cifra entró con sus cinco renglones:</strong> «según las series del Banco Mundial y de Our World in Data, la pobreza extrema pasó de más de un tercio de la humanidad hacia 1990 a alrededor de una décima parte antes de la pandemia». Mismo dato, ahora con año y con fuente.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">⚔️</span><span class="ms-text"><strong>Y el renglón que casi nadie llena:</strong> «Jason Hickel discute que esa línea sea demasiado baja, y Max Roser le responde con las series largas; el cruce es de 2019 y sigue abierto». Con eso la lámina se puede defender delante de cualquiera.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🎈</span><span class="ms-text"><strong>Quedó una cifra suelta:</strong> un número verdadero sin año, sin línea, sin fuente y sin contradictor. Suena redondo, cabe en la diapositiva y nadie va a discutirlo en el aula, que es justo el problema.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega en dos partes:</strong> la primera persona que pregunte con qué línea se midió desarma la lámina entera, y de camino queda enseñado que en esta casa los números se usan como banderas. Se tacha y se reescribe con los cinco renglones.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='definicion',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"definicion\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/⚙️/g, '📒');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
