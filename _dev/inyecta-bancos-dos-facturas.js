/* Inyecta los bancos de la misión «Las dos facturas» (Ruta del Expediente
   Dorado, etapa 4: Crítica al Capitalismo, materia 27 del Estudio Mayor)
   sobre el molde copiado de la etapa 3 de esta misma ruta, que es la misión
   más reciente y completa.
   Uso:  node _dev/inyecta-bancos-dos-facturas.js

   REGLA DEL ESTUDIO MAYOR: ningún estudio, obra o cifra entra sin su
   etiqueta. Las fuentes que sostienen esta etapa, con la suya:

     · Piketty, «El capital en el siglo XXI» (2013 en francés, 2014 en
       inglés): CLÁSICO CONTEMPORÁNEO, Y MUY AUDITADO. Nunca se cita solo.
     · Rognlie (2015), en la Brookings Institution: LA AUDITORÍA OBLIGADA.
       Casi todo el aumento de la participación del capital viene de la
       vivienda, y eso cambia el remedio.
     · Giles, en el «Financial Times» (2014): OBJECIÓN PERIODÍSTICA DE
       DATOS, y Piketty respondió publicando los suyos.
     · Lakner y Milanović, y Milanović, «Global Inequality» (2016): LA
       REFERENCIA DE LA DESIGUALDAD GLOBAL, de donde sale la curva del
       elefante: entre países bajó y dentro de los ricos subió.
     · Corlett, en la Resolution Foundation (2016): LA OBJECIÓN
       METODOLÓGICA a esa curva.
     · Sexto informe del IPCC (2021): FUENTE OFICIAL QUE PUBLICA SU RANGO.
       Sensibilidad de 2,5 a 4 °C con 3 °C como mejor estimación, y unos
       1,1 °C de calentamiento ya ocurrido respecto de 1850 a 1900.
     · La serie de Keeling, desde 1958 en Mauna Loa: LA MEDICIÓN MÁS LIMPIA
       que tiene el tema, y se cita por el método.
     · Acuerdo de París (2015): DECISIÓN POLÍTICA, no resultado científico.
     · Stern (2006) contra Nordhaus (Nobel 2018): DISPUTA DE VALORES Y NO DE
       DATOS. Miran la misma física y discrepan en la tasa de descuento.
     · Weitzman (2009): EL GIRO TEÓRICO, las colas gordas.
     · Pindyck, en el «Journal of Economic Literature» (2013): EL ACERO, y
       viene de dentro de la profesión.
     · Chetty y su equipo, en «Science» (2017): MEDICIÓN DE MOVILIDAD.

   La idea que ordena todos los bancos: NINGUNA CIFRA SIN HORQUILLA Y SIN
   FUENTE. Y las dos facturas se leen distinto: la de la desigualdad tiene
   un problema de DEFINICIÓN (qué se mide: ingreso o riqueza, antes o
   después de impuestos, dentro o entre países) y la del clima un problema
   de INCERTIDUMBRE Y PLAZO (por eso las cifras serias vienen en horquilla).
   La destreza de la etapa es tomar una cifra que circula y volverla a poner
   de pie con la HOJA DE LA FACTURA.

   Tres cuidados del compendio gobiernan la misión. Uno: toda cifra entra
   CON SU AUDITORÍA AL LADO, y aquí eso significa Piketty con Rognlie y el
   elefante con Corlett. Dos: el modo de fallar de la etapa es ESCOGER LA
   PUNTA DEL RANGO y contarla como si fuera el centro, que es lo que hacen
   los dos bandos con el mismo informe. Tres: QUE UNA CIFRA ESTÉ MAL USADA
   NO BORRA EL PROBLEMA, y quien se queda en desarmar titulares cambió una
   consigna por otra más elegante.

   Y la regla de selección de la materia, que se respeta en los bancos: los
   conflictos vivos del patio entran COMO CATEGORÍA y no como caso con
   nombre propio. La asimetría de emitir poco y sufrir mucho se estudia con
   cifras y sin etiquetar a ningún funcionario, a ningún partido ni a nadie
   en campaña. */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-dorado-dos-facturas', 'js', 'dos-facturas.js');
/* ---------- sopa de letras: generador determinista ---------- */
/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20261217;
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
  { w: 'Las dos facturas', a: '🌡️ Las dos cuentas grandes que deja la máquina: <strong>la desigualdad</strong> y <strong>el clima</strong>. Llegan juntas y <strong>se leen distinto</strong>: la primera tiene un problema de definición, la segunda de incertidumbre y de plazo.' },
  { w: 'La regla de la etapa', a: '📐 <strong>Ninguna cifra entra sin decir qué mide exactamente, de dónde sale y entre qué números anda.</strong> Sin eso hay titular, que es gratis, y no hay cuenta.' },
  { w: 'Las cuatro decisiones antes de medir la desigualdad', a: '🧮 <strong>Qué</strong> (ingreso o riqueza), <strong>cuándo</strong> (antes o después de impuestos y transferencias), <strong>entre quiénes</strong> (dentro de un país o entre países) y <strong>con qué número</strong> (un índice como el Gini o participaciones del 10 % o del 1 %). Las cuatro son legítimas y las cuatro cambian el resultado.' },
  { w: 'Piketty (2014)', a: '📕 En <strong>«El capital en el siglo XXI»</strong> sostiene que cuando <strong>el capital rinde más de lo que crece la economía</strong>, la riqueza heredada pesa más que la trabajada. Etiqueta: <strong>clásico contemporáneo, y muy auditado</strong>. Nunca se cita solo.' },
  { w: 'Rognlie (2015)', a: '🏠 La auditoría obligada: mostró que <strong>casi todo el aumento de la participación del capital viene de la vivienda</strong>, y no del capital productivo. No derriba la tesis: <strong>cambia el remedio</strong>, que es distinto y más útil.' },
  { w: 'El episodio del «Financial Times» (2014)', a: '📰 <strong>Chris Giles</strong> cuestionó parte de las series de riqueza de Piketty, y <strong>Piketty respondió públicamente y publicó sus datos</strong>. Se cita porque enseña la conducta que esta casa premia: publicar los números con los que a uno se le puede refutar.' },
  { w: 'La curva del elefante', a: '🐘 De <strong>Lakner y Milanović</strong>: ordenando a toda la humanidad de más pobre a más rica entre <strong>1988 y 2008</strong>, ganó mucho la mitad de en medio (el lomo), casi nada el percentil 80 (el cuello hundido) y muchísimo el 1 % (la trompa).' },
  { w: 'Lo que dice el elefante', a: '⚖️ Que <strong>la desigualdad ENTRE países bajó</strong> mientras <strong>la desigualdad DENTRO de los países ricos subía</strong>. Las dos mitades tienen dueño en la discusión pública, y quien repite solo una cuenta media película.' },
  { w: 'Corlett (2016)', a: '📏 La objeción a la curva: su forma <strong>depende de qué países entren en la muestra</strong> y de cómo se traten los cambios de población. Ajustando eso, <strong>el hundimiento del percentil 80 se hace más pequeño</strong>, aunque sigue existiendo.' },
  { w: 'La serie de Keeling', a: '📈 <strong>Charles David Keeling</strong> empezó a medir dióxido de carbono en <strong>Mauna Loa en 1958</strong> y no paró. Su curva sube y baja con las estaciones y sube año tras año. Se cita por el método: <strong>anotar todos los días durante décadas</strong> vale más que cualquier discusión.' },
  { w: 'La horquilla del IPCC', a: '🌡️ En su <strong>sexto informe, de 2021</strong>: duplicar el CO₂ calentaría entre <strong>2,5 y 4 °C</strong>, con <strong>3 °C</strong> como mejor estimación; y llevamos alrededor de <strong>1,1 °C</strong> respecto de 1850 a 1900. <strong>La horquilla es el dato</strong>, no un defecto del dato.' },
  { w: 'La identidad de Kaya', a: '🧮 Descompone las emisiones en cuatro cosas que se multiplican: <strong>cuánta gente hay, cuánto produce cada uno, cuánta energía hace falta por unidad producida y cuánto carbono suelta esa energía</strong>. Sirve para ver <strong>por cuál de las cuatro empuja cada propuesta</strong>.' },
  { w: 'La tasa de descuento', a: '⏳ <strong>Cuánto vale hoy el bienestar de alguien que todavía no ha nacido.</strong> Es una decisión moral escrita como número, y es la pelea de verdad del clima: <strong>Stern (2006)</strong> la puso muy baja y <strong>Nordhaus</strong> más alta, mirando los mismos datos físicos.' },
  { w: 'Las colas gordas (Weitzman, 2009)', a: '🎲 Que lo decisivo <strong>no es el promedio sino la cola</strong>: la probabilidad pequeña de una catástrofe grande. Cambia la pregunta de «cuánto va a calentar» a «cuánto pagaríamos por evitar lo irreparable».' },
  { w: 'Pindyck (2013), el acero', a: '🔩 En el <strong>«Journal of Economic Literature»</strong> sostuvo que los modelos integrados que producen estas cifras tienen <strong>funciones de daño elegidas casi arbitrariamente</strong> y aparentan una precisión que no tienen. Viene de dentro de la profesión, y <strong>se contesta, no se esquiva</strong>.' },
  { w: 'El modo de fallar de la etapa', a: '🪤 <strong>Escoger la punta del rango y contarla como si fuera el centro.</strong> Con la misma horquilla, un bando titula «podría llegar a 4» y el otro «podría quedarse en 2,5», y los dos citan el mismo informe.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Cuál es la regla que ordena toda esta etapa?', o: ['a) Ninguna cifra entra sin decir qué mide, de dónde sale y entre qué números anda', 'b) Toda cifra grande es sospechosa', 'c) Solo valen las cifras oficiales', 'd) Los números no sirven para discutir'], c: 0 },
  { q: '¿Por qué las dos facturas se leen distinto?', o: ['a) Porque una es más grave que la otra', 'b) Porque la de la desigualdad tiene un problema de definición y la del clima de incertidumbre y plazo', 'c) Porque una tiene datos y la otra no', 'd) Porque una es de economía y la otra de política'], c: 1 },
  { q: 'Antes de decir si la desigualdad sube o baja hay que decidir cuatro cosas. ¿Cuáles?', o: ['a) El país, el año, el autor y la revista', 'b) La moneda, el impuesto, la fuente y el método', 'c) Qué se mide, cuándo, entre quiénes y con qué número', 'd) Ninguna: se mide igual en todas partes'], c: 2 },
  { q: 'La tesis central de Piketty (2014) es que…', o: ['a) Los pobres son cada vez más pobres', 'b) La desigualdad siempre sube', 'c) El capital debería prohibirse', 'd) Cuando el capital rinde más de lo que crece la economía, lo heredado pesa más que lo trabajado'], c: 3 },
  { q: '¿Qué mostró Rognlie en 2015?', o: ['a) Que casi todo el aumento de la participación del capital viene de la vivienda', 'b) Que Piketty inventó sus datos', 'c) Que la desigualdad no existe', 'd) Que el capital productivo creció más que nunca'], c: 0 },
  { q: 'La curva del elefante muestra que, entre 1988 y 2008…', o: ['a) Todo el mundo ganó por igual', 'b) La desigualdad entre países bajó mientras la de dentro de los países ricos subía', 'c) Solo ganaron los más ricos', 'd) Nadie ganó nada'], c: 1 },
  { q: '¿Cuál es la objeción de Corlett (2016) a esa curva?', o: ['a) Que los datos son falsos', 'b) Que no incluye a los más ricos', 'c) Que su forma depende de qué países entren en la muestra y de cómo se traten los cambios de población', 'd) Que el periodo es demasiado largo'], c: 2 },
  { q: 'El sexto informe del IPCC (2021) da, para la sensibilidad climática…', o: ['a) Una cifra exacta de 3 °C', 'b) Ninguna estimación', 'c) Un rango de 0 a 10 °C', 'd) Un rango probable de 2,5 a 4 °C, con 3 °C como mejor estimación'], c: 3 },
  { q: 'La pelea de fondo entre Stern y Nordhaus es sobre…', o: ['a) La tasa de descuento: cuánto vale hoy el bienestar de quien no ha nacido', 'b) Si el planeta se está calentando', 'c) Quién mide mejor la temperatura', 'd) Si existen los modelos climáticos'], c: 0 },
  { q: '¿Cuál es el modo de fallar propio de esta etapa?', o: ['a) Negar los datos', 'b) Escoger la punta del rango y contarla como si fuera el centro', 'c) Citar demasiadas fuentes', 'd) Usar cifras viejas'], c: 1 },
]);

/* ---------- clasificar ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Desigualdad', 'Clima'],
    headA: '💰 La primera factura',
    headB: '🌡️ La segunda factura',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Ingreso o riqueza: hay que decir cuál', t: 'ok' },
      { w: 'La horquilla de 2,5 a 4 °C', t: 'no' },
      { w: 'Antes o después de impuestos', t: 'ok' },
      { w: 'La serie de Keeling desde 1958', t: 'no' },
      { w: 'La curva del elefante', t: 'ok' },
      { w: 'La identidad de Kaya', t: 'no' },
      { w: 'Piketty con Rognlie al lado', t: 'ok' },
      { w: 'La tasa de descuento', t: 'no' },
    ],
  },
  {
    label: ['Es un dato', 'Es una decisión'],
    headA: '📊 Dato: se mide y se comprueba',
    headB: '⚖️ Decisión: se escoge y se justifica',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Llevamos alrededor de 1,1 °C de calentamiento', t: 'ok' },
      { w: 'Quedarse bien por debajo de 2 °C', t: 'no' },
      { w: 'La concentración de CO₂ medida en Mauna Loa', t: 'ok' },
      { w: 'Qué tasa de descuento se usa', t: 'no' },
      { w: 'La participación del 1 % en el ingreso', t: 'ok' },
      { w: 'Si se arregla el techo este año o el próximo', t: 'no' },
      { w: 'Cuánto ganó cada tramo entre 1988 y 2008', t: 'ok' },
      { w: 'Cuánto vale hoy quien todavía no ha nacido', t: 'no' },
    ],
  },
  {
    label: ['Cifra puesta de pie', 'Titular suelto'],
    headA: '🌡️ Puesta de pie: se puede comprobar',
    headB: '📰 Suelta: no se puede comprobar',
    colA: 'ok', colB: 'no',
    words: [
      { w: '«Entre 2,5 y 4 °C, con 3 como mejor estimación»', t: 'ok' },
      { w: '«Va a subir 4 grados»', t: 'no' },
      { w: '«Riqueza neta, informe de este año»', t: 'ok' },
      { w: '«El 1 % tiene más que la mitad del mundo»', t: 'no' },
      { w: '«Ingreso después de impuestos, dentro del país»', t: 'ok' },
      { w: '«La desigualdad siempre sube»', t: 'no' },
      { w: '«Emisiones territoriales, no de consumo»', t: 'ok' },
      { w: '«Aquí no contaminamos nada»', t: 'no' },
    ],
  },
  {
    label: ['Se estudia aquí', 'Es de otra etapa o de otra materia'],
    headA: '🌡️ Se estudia en esta etapa',
    headB: '🏠 Es de otra etapa o materia',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'La horquilla del IPCC y cómo se lee', t: 'ok' },
      { w: 'Las dos objeciones contra poner precio a un bien', t: 'no' },
      { w: 'Piketty con la auditoría de Rognlie', t: 'ok' },
      { w: 'Los cuatro supuestos del teorema y sus fallas', t: 'no' },
      { w: 'La disputa de la tasa de descuento', t: 'ok' },
      { w: 'La química de la atmósfera, con su detalle', t: 'no' },
      { w: 'La curva del elefante con su objeción', t: 'ok' },
      { w: 'Adam Smith leído entero y no en media frase', t: 'no' },
    ],
  },
]);

/* ---------- identificar la palabra ---------- */
B.idData = JSON.stringify([
  { s: ['La', 'horquilla', 'es', 'el', 'dato.'], c: 1, art: 'Lo que casi nadie considera parte del dato' },
  { s: ['Primero', 'hay', 'que', 'decir', 'qué', 'se', 'mide.'], c: 6, art: 'Lo que hay que decir antes de discutir' },
  { s: ['Piketty', 'entra', 'con', 'Rognlie', 'al', 'lado.'], c: 3, art: 'Quién audita a Piketty' },
  { s: ['La', 'curva', 'del', 'elefante', 'incomoda', 'a', 'los', 'dos.'], c: 3, art: 'La figura que descoloca a los dos bandos' },
  { s: ['Keeling', 'midió', 'todos', 'los', 'días', 'desde', '1958.'], c: 0, art: 'Quién empezó a medir en Mauna Loa' },
  { s: ['La', 'tasa', 'de', 'descuento', 'es', 'una', 'decisión', 'moral.'], c: 3, art: 'El número que en realidad es una decisión moral' },
  { s: ['El', 'error', 'es', 'escoger', 'la', 'punta', 'del', 'rango.'], c: 5, art: 'Lo que se escoge cuando se falla en esta etapa' },
  { s: ['Una', 'cifra', 'necesita', 'fuente', 'y', 'año.'], c: 3, art: 'Lo que ninguna cifra puede traer sin' },
]);

/* ---------- completar la oración ---------- */
B.cmpData = JSON.stringify([
  { s: 'En esta etapa, la ___ es el dato y no un defecto del dato.', opts: ['horquilla', 'consigna', 'sospecha'], c: 0 },
  { s: 'Antes de discutir si sube o baja hay que decir qué se ___.', opts: ['mide', 'opina', 'siente'], c: 0 },
  { s: 'Piketty (2014) nunca se cita sin la auditoría de ___.', opts: ['Rognlie', 'Keeling', 'Weitzman'], c: 0 },
  { s: 'La curva del ___ muestra quién ganó entre 1988 y 2008.', opts: ['elefante', 'camello', 'caballo'], c: 0 },
  { s: 'Keeling empezó a medir CO₂ en Mauna Loa en ___.', opts: ['1958', '1988', '2021'], c: 0 },
  { s: 'El IPCC (2021) da un rango de ___ para la sensibilidad climática.', opts: ['2,5 a 4 °C', '1 a 2 °C', '5 a 8 °C'], c: 0 },
  { s: 'Stern y Nordhaus discrepan en la tasa de ___.', opts: ['descuento', 'interés', 'cambio'], c: 0 },
  { s: 'El error de esta etapa es escoger la ___ del rango.', opts: ['punta', 'mitad', 'fuente'], c: 0 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Desigualdad', 'Clima'],
    btnA: '💰 Desigualdad', btnB: '🌡️ Clima',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Ingreso o riqueza', t: 'ok' },
      { w: 'De 2,5 a 4 °C', t: 'no' },
      { w: 'La curva del elefante', t: 'ok' },
      { w: 'Mauna Loa, 1958', t: 'no' },
      { w: 'Piketty y Rognlie', t: 'ok' },
      { w: 'La identidad de Kaya', t: 'no' },
      { w: 'Antes o después de impuestos', t: 'ok' },
      { w: 'La tasa de descuento', t: 'no' },
      { w: 'Chetty y la movilidad', t: 'ok' },
      { w: 'El Acuerdo de París', t: 'no' },
    ],
  },
  {
    label: ['Dato', 'Decisión'],
    btnA: '📊 Dato', btnB: '⚖️ Decisión',
    colA: 'ok', colB: 'no',
    words: [
      { w: '1,1 °C ya ocurridos', t: 'ok' },
      { w: 'Perseguir 1,5 °C', t: 'no' },
      { w: 'La serie de Mauna Loa', t: 'ok' },
      { w: 'Qué tasa de descuento usar', t: 'no' },
      { w: 'La participación del 1 %', t: 'ok' },
      { w: 'Arreglar el techo este año', t: 'no' },
      { w: 'Lo que ganó cada tramo', t: 'ok' },
      { w: 'Cuánto vale el que no ha nacido', t: 'no' },
      { w: 'El 90 % de los nacidos en 1940', t: 'ok' },
      { w: 'Qué se hace con ese dato', t: 'no' },
    ],
  },
  {
    label: ['Cifra de pie', 'Titular suelto'],
    btnA: '🌡️ De pie', btnB: '📰 Suelto',
    colA: 'ok', colB: 'no',
    words: [
      { w: 'Dice qué mide', t: 'ok' },
      { w: '«Va a subir 4 grados»', t: 'no' },
      { w: 'Trae fuente y año', t: 'ok' },
      { w: '«Se dice que»', t: 'no' },
      { w: 'Trae su horquilla', t: 'ok' },
      { w: 'Un número redondo sin rango', t: 'no' },
      { w: 'Dice quién paga', t: 'ok' },
      { w: '«La desigualdad siempre sube»', t: 'no' },
      { w: 'Dice qué la refutaría', t: 'ok' },
      { w: '«Todos lo saben»', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se pone de pie una cifra que llegó al teléfono',
    steps: [
      'Preguntar qué mide exactamente, con esas palabras y no con las del titular',
      'Buscar de qué fuente sale y de qué año, con nombre y no «se dice que»',
      'Ver si tiene horquilla, y si el titular tomó la punta o el centro',
      'Buscar la auditoría: quién la ha discutido y con qué argumento',
      'Decir quién paga esa factura y en qué plazo',
      'Y escribir qué dato haría cambiar de opinión, antes de discutir',
    ],
  },
  {
    label: 'Las cuatro decisiones antes de medir la desigualdad',
    steps: [
      'Decidir qué se mide: ingreso que entra cada mes o riqueza acumulada',
      'Decidir cuándo: antes o después de impuestos y transferencias',
      'Decidir entre quiénes: dentro de un país o entre países del mundo',
      'Decidir con qué número: un índice que resume o participaciones por tramo',
      'Recién entonces mirar si sube o baja, y en qué periodo',
      'Y decir las cuatro decisiones en voz alta al dar el resultado',
    ],
  },
  {
    label: 'De la medición a la decisión, en el clima',
    steps: [
      'Medir, todos los días y durante décadas, como hizo Keeling desde 1958',
      'Publicar el resultado con su rango y con su mejor estimación',
      'Traducir el rango a daños posibles, que es donde entran los modelos',
      'Escoger una tasa de descuento, que es una decisión moral y no científica',
      'De ahí sale el ritmo: fuerte y ya, o gradual, y por eso Stern y Nordhaus difieren',
      'Y anotar lo que dice el acero: los modelos aparentan más precisión de la que tienen',
    ],
  },
]);

/* ---------- identificar la pieza o la fuente por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'Sostuvo que cuando el capital rinde más de lo que crece la economía, lo heredado pesa más que lo trabajado', ans: 'Thomas Piketty', opts: ['Thomas Piketty', 'Branko Milanović', 'William Nordhaus', 'Raj Chetty'] },
  { desc: 'Mostró en 2015 que casi todo el aumento de la participación del capital viene de la vivienda', ans: 'Matthew Rognlie', opts: ['Matthew Rognlie', 'Chris Giles', 'Adam Corlett', 'Martin Weitzman'] },
  { desc: 'Ordenaron a la humanidad entera de más pobre a más rica y dibujaron sin querer un elefante', ans: 'Lakner y Milanović', opts: ['Lakner y Milanović', 'Stern y Nordhaus', 'Piketty y Rognlie', 'Chetty y su equipo'] },
  { desc: 'Mostró que la forma de esa curva depende de qué países entren en la muestra', ans: 'Adam Corlett', opts: ['Adam Corlett', 'Matthew Rognlie', 'Robert Pindyck', 'Chris Giles'] },
  { desc: 'Empezó a medir dióxido de carbono en Mauna Loa en 1958 y no paró', ans: 'Charles David Keeling', opts: ['Charles David Keeling', 'Nicholas Stern', 'William Nordhaus', 'Martin Weitzman'] },
  { desc: 'Usó una tasa de descuento muy baja y concluyó que conviene actuar fuerte y ya', ans: 'Nicholas Stern', opts: ['Nicholas Stern', 'William Nordhaus', 'Robert Pindyck', 'Thomas Piketty'] },
  { desc: 'Sostuvo que lo decisivo no es el promedio sino la cola: la probabilidad pequeña de lo irreparable', ans: 'Martin Weitzman', opts: ['Martin Weitzman', 'Adam Corlett', 'Raj Chetty', 'Nicholas Stern'] },
  { desc: 'Advirtió desde dentro de la profesión que los modelos aparentan una precisión que no tienen', ans: 'Robert Pindyck', opts: ['Robert Pindyck', 'Matthew Rognlie', 'Branko Milanović', 'Charles David Keeling'] },
]);

/* ---------- qué le toca a esa cifra ---------- */
B.neuroPairs = JSON.stringify([
  { trans: '«El uno por ciento tiene más que la mitad del mundo»', func: 'Falta la definición: eso mide riqueza neta, que resta deudas', opts: ['Falta la definición: eso mide riqueza neta, que resta deudas', 'Falta la horquilla', 'Es una decisión moral, no un dato', 'Está bien puesta de pie'] },
  { trans: '«El calentamiento va a ser de 4 grados»', func: 'Falta la horquilla: el rango va de 2,5 a 4, con 3 como mejor estimación', opts: ['Falta la horquilla: el rango va de 2,5 a 4, con 3 como mejor estimación', 'Falta la definición de qué se mide', 'Falta decir quién paga', 'Está bien puesta de pie'] },
  { trans: '«Hay que quedarse bien por debajo de 2 °C»', func: 'No es un dato: es una decisión política, la del Acuerdo de París de 2015', opts: ['No es un dato: es una decisión política, la del Acuerdo de París de 2015', 'Es una medición del IPCC', 'Es una cifra sin fuente', 'Es una auditoría'] },
  { trans: '«Aquí emitimos poco», dicho sin decir cómo se cuenta', func: 'Falta decir si son emisiones territoriales o de consumo, que dan números distintos', opts: ['Falta decir si son emisiones territoriales o de consumo, que dan números distintos', 'Falta la mejor estimación', 'Es una decisión moral', 'Está bien puesta de pie'] },
  { trans: '«Entre 2,5 y 4 °C, con 3 como mejor estimación, IPCC 2021»', func: 'Está bien puesta de pie: dice qué mide, de dónde sale y entre qué números anda', opts: ['Está bien puesta de pie: dice qué mide, de dónde sale y entre qué números anda', 'Le falta la fuente', 'Le falta la horquilla', 'Es una consigna'] },
]);

/* ---------- diagnóstico de la cifra ---------- */
B.enfermedadData = JSON.stringify([
  { disease: '«Va a subir 4 grados», y ahí termina la anotación', characteristic: 'Toma la punta del rango y la cuenta como si fuera el número: el informe da de 2,5 a 4 con 3 como mejor estimación, y decir solo el extremo es vender una conclusión disfrazada de dato', opts: ['Toma la punta del rango y la cuenta como si fuera el número: el informe da de 2,5 a 4 con 3 como mejor estimación, y decir solo el extremo es vender una conclusión disfrazada de dato', 'Está mal porque el clima no se puede medir', 'Le falta decir en qué país', 'Confunde ingreso con riqueza'] },
  { disease: '«La desigualdad siempre sube», escrito sin más', characteristic: 'No dice de qué desigualdad habla ni de qué años, y además es falso en una de sus lecturas: entre países bajó mientras dentro de los países ricos subía', opts: ['No dice de qué desigualdad habla ni de qué años, y además es falso en una de sus lecturas: entre países bajó mientras dentro de los países ricos subía', 'Está bien: la desigualdad siempre sube', 'Le falta citar a Keeling', 'El problema es usar la palabra desigualdad'] },
  { disease: 'Se cita a Piketty y se cierra el tema con eso', characteristic: 'Es media cita: Rognlie mostró en 2015 que casi todo el aumento viene de la vivienda, y Giles cuestionó series de riqueza en 2014, a lo que Piketty respondió publicando sus datos', opts: ['Es media cita: Rognlie mostró en 2015 que casi todo el aumento viene de la vivienda, y Giles cuestionó series de riqueza en 2014, a lo que Piketty respondió publicando sus datos', 'Piketty nunca escribió sobre desigualdad', 'El error es citar un libro tan largo', 'Faltaba citar el Acuerdo de París'] },
  { disease: 'Se usa la curva del elefante como si fuera intocable', characteristic: 'Corlett mostró en 2016 que su forma depende de qué países entren y de cómo se traten los cambios de población: el hundimiento sigue existiendo, pero es más pequeño de lo que el dibujo sugiere', opts: ['Corlett mostró en 2016 que su forma depende de qué países entren y de cómo se traten los cambios de población: el hundimiento sigue existiendo, pero es más pequeño de lo que el dibujo sugiere', 'La curva del elefante no existe', 'El error es que el periodo es muy corto', 'Falta decir quién dibujó la curva'] },
  { disease: 'Se dice que la ciencia no se pone de acuerdo porque da un rango', characteristic: 'Un rango no es no saber: es saber con precisión cuánto no se sabe, y eso es más de lo que ofrece cualquier número redondo sin fuente', opts: ['Un rango no es no saber: es saber con precisión cuánto no se sabe, y eso es más de lo que ofrece cualquier número redondo sin fuente', 'Es cierto: si hay rango, no hay dato', 'El problema es que el IPCC publica demasiado', 'Falta convertir el rango en una sola cifra'] },
  { disease: 'Se desarma un titular mal contado y se da el tema por cerrado', characteristic: 'Que una cifra esté mal usada no borra el problema: desarmar el titular es el principio del trabajo, y quien se queda ahí cambió una consigna por otra más elegante', opts: ['Que una cifra esté mal usada no borra el problema: desarmar el titular es el principio del trabajo, y quien se queda ahí cambió una consigna por otra más elegante', 'Está bien: si el titular falla, el problema no existe', 'Falta desarmar también la fuente', 'El error es haber leído el titular'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'Entre 2,5 y 4 °C, con 3 °C como mejor estimación.', type: 'Una horquilla bien dicha' },
  { s: 'Ingreso o riqueza, antes o después de impuestos, dentro o entre países.', type: 'Las decisiones antes de medir la desigualdad' },
  { s: 'El lomo, el cuello hundido y la trompa levantada.', type: 'La curva del elefante' },
  { s: 'Medir todos los días en un volcán de Hawái desde 1958.', type: 'La serie de Keeling' },
  { s: 'Cuánto vale hoy el bienestar de alguien que no ha nacido.', type: 'La tasa de descuento' },
  { s: 'Casi todo el aumento de la participación del capital viene de la vivienda.', type: 'La auditoría de Rognlie' },
  { s: 'Lo decisivo no es el promedio sino la cola.', type: 'Las colas gordas de Weitzman' },
  { s: 'Tomar el extremo del rango y contarlo como si fuera el número.', type: 'El modo de fallar de la etapa' },
  { s: 'Población, producto por persona, energía por unidad y carbono por energía.', type: 'La identidad de Kaya' },
  { s: 'Cuántos hijos terminan ganando más que sus padres.', type: 'La movilidad, medida por Chetty' },
]);

B.classifyTaskDB = JSON.stringify([
  { w: 'Piketty (2014)', gen: 'Fuente', n: 'Cuando el capital rinde más que el crecimiento', g: '«El capital en el siglo XXI»', t: 'Clásico contemporáneo, y muy auditado' },
  { w: 'Rognlie (2015)', gen: 'Fuente', n: 'Casi todo viene de la vivienda', g: 'Brookings Institution', t: 'La auditoría obligada' },
  { w: 'Giles (2014)', gen: 'Fuente', n: 'La objeción a las series de riqueza', g: '«Financial Times»', t: 'Objeción periodística de datos' },
  { w: 'Milanović (2016)', gen: 'Fuente', n: 'La curva del elefante, desarrollada', g: '«Global Inequality»', t: 'La referencia de la desigualdad global' },
  { w: 'Corlett (2016)', gen: 'Fuente', n: 'La forma depende de la muestra', g: 'Resolution Foundation', t: 'La objeción metodológica' },
  { w: 'IPCC (2021)', gen: 'Fuente', n: 'De 2,5 a 4 °C, con 3 como mejor estimación', g: 'Sexto informe de evaluación', t: 'Fuente oficial que publica su rango' },
  { w: 'Keeling (desde 1958)', gen: 'Fuente', n: 'La curva del dióxido de carbono', g: 'Observatorio de Mauna Loa', t: 'La medición más limpia del tema' },
  { w: 'Stern (2006) y Nordhaus', gen: 'Fuente', n: 'La tasa de descuento, y el ritmo que sale de ella', g: 'Stern Review y modelos DICE', t: 'Disputa de valores, no de datos' },
  { w: 'Pindyck (2013)', gen: 'Fuente', n: 'Los modelos aparentan precisión que no tienen', g: '«Journal of Economic Literature»', t: 'El acero, y viene de dentro' },
  { w: 'Chetty y su equipo (2017)', gen: 'Fuente', n: 'Del 90 % a cerca de la mitad', g: 'En «Science»', t: 'Medición de movilidad' },
]);

B.completeTaskDB = JSON.stringify([
  { s: 'La ___ es el dato, no un defecto del dato.', opts: ['horquilla', 'consigna', 'sospecha'], ans: 'horquilla' },
  { s: 'Antes de discutir hay que decir qué se ___.', opts: ['mide', 'siente', 'cree'], ans: 'mide' },
  { s: 'Piketty va siempre con la auditoría de ___.', opts: ['Rognlie', 'Keeling', 'Stern'], ans: 'Rognlie' },
  { s: 'La curva del ___ incomoda a los dos bandos.', opts: ['elefante', 'camello', 'caballo'], ans: 'elefante' },
  { s: 'Keeling empezó a medir en ___.', opts: ['1958', '2015', '2021'], ans: '1958' },
  { s: 'La pelea del clima es sobre la tasa de ___.', opts: ['descuento', 'interés', 'cambio'], ans: 'descuento' },
  { s: 'El error propio es escoger la ___ del rango.', opts: ['punta', 'mitad', 'base'], ans: 'punta' },
  { s: 'Que una cifra esté mal usada no ___ el problema.', opts: ['borra', 'agranda', 'mide'], ans: 'borra' },
]);

B.explainQuestions = JSON.stringify([
  { q: '¿Cuál es la regla que ordena esta etapa, y por qué hace falta una regla y no basta con tener buena voluntad?', ans: 'La regla es que ninguna cifra entra sin decir qué mide exactamente, de dónde sale y entre qué números anda. Hace falta una regla porque el problema de esta etapa no es la mala fe sino la estructura de la conversación: la mayoría de las cifras que circulan son verdaderas y aun así producen retratos falsos, y eso no se arregla siendo honrado, se arregla preguntando siempre lo mismo. Un ejemplo lo muestra entero: el titular de que el uno por ciento tiene más que la mitad del mundo está bien calculado y mide riqueza neta, es decir lo que uno tiene menos lo que debe, de modo que un recién graduado con un préstamo aparece más pobre que un campesino sin deudas y sin tierra. Quien repite la cifra no miente y aun así deja al que escucha con una idea equivocada. La regla convierte la buena voluntad en un procedimiento que se puede aplicar aunque uno esté apurado, que es cuando se reenvían las cosas.' },
  { q: '¿Por qué las dos facturas se leen distinto, y qué pregunta hay que hacerle a cada una?', ans: 'Porque su dificultad es de naturaleza distinta. La de la desigualdad tiene un problema de definición: antes de decir si sube o baja hay que decidir cuatro cosas, y las cuatro son legítimas y cambian el resultado, que son qué se mide (ingreso o riqueza), cuándo (antes o después de impuestos y transferencias), entre quiénes (dentro de un país o entre países) y con qué número (un índice como el Gini o participaciones por tramo). La del clima tiene un problema de incertidumbre y de plazo: lo que se mide está bastante claro y lleva décadas midiéndose, pero cuánto calienta cada cosa se sabe con un margen, y por eso las cifras serias vienen en horquilla. De ahí salen las dos preguntas de entrada. Ante una cifra de desigualdad, la primera es qué está midiendo. Ante una cifra de clima, la primera es cuál es la horquilla y de qué plazo habla. Hacer la pregunta cruzada es el error más común de los dos lados.' },
  { q: 'Explica la curva del elefante y por qué esta casa insiste en enseñarla con su objeción encima.', ans: 'Lakner y Milanović ordenaron a toda la humanidad de más pobre a más rica y midieron cuánto ganó cada tramo entre 1988 y 2008. El dibujo parece un elefante: un lomo alto, que son los cientos de millones que salieron de la pobreza sobre todo en Asia; un hundimiento donde iría el cuello, que son los trabajadores de los países ricos, cuyos ingresos casi no se movieron; y una trompa levantada, que es el uno por ciento más rico del mundo. La lección es doble y por eso incomoda a los dos estantes: la desigualdad entre países bajó mientras la desigualdad dentro de los países ricos subía. Se enseña con su objeción encima porque esa es la disciplina de esta ruta y porque la objeción existe: Adam Corlett mostró en 2016, en la Resolution Foundation, que la forma del elefante depende de qué países entren en la muestra y de cómo se traten los cambios de población, y que ajustando eso el hundimiento se hace más pequeño. Sigue habiendo hundimiento, pero menos dramático que el del dibujo.' },
  { q: '¿Qué es la tasa de descuento y por qué la casa dice que la pelea del clima no es sobre el termómetro?', ans: 'La tasa de descuento es cuánto vale hoy el bienestar de alguien que todavía no ha nacido. Es un número, pero lo que decide ese número no es un dato físico sino una posición moral. Por eso dos economistas grandes pueden mirar exactamente la misma ciencia y proponer ritmos distintos. Nicholas Stern, en su informe de 2006, usó una tasa muy baja, con lo cual el futuro pesa casi lo mismo que el presente y sale actuar con fuerza y de inmediato. William Nordhaus, que recibió el Nobel de Economía en 2018, usó una tasa más alta, tomada de cómo la gente descuenta realmente en su vida, y de ahí sale una senda más gradual. Ninguno de los dos niega la física. Decir esto en voz alta sirve para dos cosas: para que nadie confunda una discusión moral con una discusión de datos, y para que quien participe sepa que ahí no hay una autoridad científica que lo resuelva. La misma pregunta se la hace una familia cuando decide si arregla el techo este año o el próximo.' },
  { q: '¿Cuál es el modo de fallar propio de esta etapa, y cómo se corrige?', ans: 'El modo de fallar es escoger la punta del rango que conviene y contarla como si fuera el número. Se reconoce por tres señales: la cifra aparece sin horquilla, no se dice qué mide exactamente, y no se dice de qué fuente y de qué año sale. Lo notable es que este error lo cometen los dos bandos con el mismo informe: con la horquilla de 2,5 a 4 °C, uno titula que podría llegar a cuatro y el otro que podría quedarse en dos y medio, y los dos están citando lo mismo. La corrección tiene tres pasos, que son los de la hoja de la factura: se dice la horquilla entera con su mejor estimación señalada, se dice qué mide la cifra con esas palabras, y se dice la fuente con su año. Y encima va el aviso que impide el error simétrico: que una cifra esté mal usada no significa que el problema no exista, así que desarmar un titular es el principio del trabajo y no el final.' },
  { q: '¿Por qué esta etapa insiste en que Piketty se cite con su auditoría al lado, y qué enseña ese episodio sobre el método?', ans: 'Porque una obra tan influyente y tan discutida no se puede citar por la mitad sin faltar a la regla del Estudio Mayor. Piketty publicó en 2014 la tesis de que cuando el capital rinde más de lo que crece la economía, lo heredado pesa más que lo trabajado. Matthew Rognlie mostró en 2015, en un trabajo de la Brookings Institution, que casi todo el aumento de la participación del capital viene de la vivienda y no del capital productivo, lo cual no derriba la tesis pero cambia bastante qué habría que hacer. Y en 2014 Chris Giles, del Financial Times, cuestionó parte de sus series de riqueza. Lo que enseña el episodio es lo que hizo Piketty después: respondió públicamente y publicó sus datos. Un autor que pone a disposición los números con los que se le puede refutar vale más que cien que solo publican conclusiones, y esa es exactamente la conducta que esta casa premia y trata de imitar cuando publica sus propias cifras con fuente y año.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['CIFRA', 'FUENTE', 'RANGO', 'MEDIR', 'DATO', 'ANO']),
  haceSopa(10, ['CLIMA', 'KEELING', 'IPCC', 'CARBONO', 'GRADOS', 'PARIS']),
  haceSopa(10, ['INGRESO', 'RIQUEZA', 'PIKETTY', 'ELEFANTE', 'MOVILIDAD', 'FACTURA']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'La regla de esta etapa es que ninguna cifra entra sin decir qué mide, de dónde sale y entre qué números anda.', a: true },
  { q: 'Las dos facturas se leen igual, porque las dos son problemas de datos.', a: false },
  { q: 'Antes de decir si la desigualdad sube o baja hay que decidir qué se mide, cuándo, entre quiénes y con qué número.', a: true },
  { q: 'Medir riqueza neta y medir ingreso dan el mismo retrato de la desigualdad.', a: false },
  { q: 'Rognlie mostró en 2015 que casi todo el aumento de la participación del capital viene de la vivienda.', a: true },
  { q: 'Piketty se negó a publicar sus datos cuando el Financial Times cuestionó sus series.', a: false },
  { q: 'La curva del elefante muestra que la desigualdad entre países bajó mientras la de dentro de los países ricos subía.', a: true },
  { q: 'La curva del elefante es intocable y no tiene objeciones metodológicas.', a: false },
  { q: 'Keeling empezó a medir dióxido de carbono en Mauna Loa en 1958 y su serie sube año tras año.', a: true },
  { q: 'El sexto informe del IPCC da una cifra exacta de calentamiento, sin rango.', a: false },
  { q: 'El Acuerdo de París de 2015 es una decisión política y no un resultado científico.', a: true },
  { q: 'Stern y Nordhaus discrepan porque miran datos físicos distintos.', a: false },
  { q: 'La tasa de descuento es una decisión moral escrita como número.', a: true },
  { q: 'Weitzman sostuvo que lo decisivo no es el promedio sino la probabilidad pequeña de una catástrofe grande.', a: true },
  { q: 'Que una cifra esté mal usada demuestra que el problema que describe no existe.', a: false },
]);

B.evalMCBank = JSON.stringify([
  { q: 'La regla que ordena esta etapa es que ninguna cifra entra sin…', o: ['a) Decir qué mide, de dónde sale y entre qué números anda', 'b) Venir de una fuente oficial', 'c) Ser mayor que la del año pasado', 'd) Estar acompañada de una gráfica'], a: 0 },
  { q: 'La dificultad propia de la factura de la desigualdad es…', o: ['a) Que no hay datos', 'b) De definición: hay que decir qué se mide antes de discutir', 'c) De incertidumbre sobre el futuro', 'd) Que solo la miden los ricos'], a: 1 },
  { q: 'La dificultad propia de la factura del clima es…', o: ['a) Que nadie la mide', 'b) Que no tiene fuentes', 'c) De incertidumbre y de plazo, y por eso las cifras vienen en horquilla', 'd) De definición: no se sabe qué es el clima'], a: 2 },
  { q: 'El titular del uno por ciento mide, técnicamente…', o: ['a) Ingreso mensual', 'b) Consumo por hogar', 'c) Salario después de impuestos', 'd) Riqueza neta, es decir lo que se tiene menos lo que se debe'], a: 3 },
  { q: 'La auditoría de Rognlie (2015) sostiene que…', o: ['a) Casi todo el aumento de la participación del capital viene de la vivienda', 'b) Piketty inventó sus datos', 'c) La desigualdad bajó en todas partes', 'd) El capital productivo se multiplicó'], a: 0 },
  { q: 'Lo que enseña el episodio de Piketty con el «Financial Times» (2014) es que…', o: ['a) Los periódicos no entienden de economía', 'b) Un autor que publica los datos con los que se le puede refutar vale más que cien que solo publican conclusiones', 'c) Las series de riqueza no sirven', 'd) Hay que ignorar las objeciones periodísticas'], a: 1 },
  { q: 'En la curva del elefante, el tramo que casi no ganó nada es…', o: ['a) El uno por ciento', 'b) La mitad más pobre del mundo', 'c) La clase trabajadora de los países ricos, alrededor del percentil 80', 'd) Todo el mundo por igual'], a: 2 },
  { q: 'La objeción de Corlett (2016) a la curva del elefante es que…', o: ['a) Los datos están inventados', 'b) El periodo elegido es demasiado corto', 'c) No incluye a los más ricos', 'd) Su forma depende de qué países entren en la muestra y de cómo se traten los cambios de población'], a: 3 },
  { q: 'La serie de Keeling se cita en esta etapa sobre todo porque…', o: ['a) Enseña el método: anotar todos los días durante décadas', 'b) Es la única medición que existe', 'c) Demuestra la tasa de descuento', 'd) Mide la desigualdad'], a: 0 },
  { q: 'El sexto informe del IPCC (2021) estima el calentamiento ya ocurrido en…', o: ['a) 4 °C', 'b) Alrededor de 1,1 °C respecto del periodo 1850 a 1900', 'c) 2,5 °C', 'd) No lo estima'], a: 1 },
  { q: 'La identidad de Kaya sirve para…', o: ['a) Calcular la tasa de descuento', 'b) Medir la desigualdad global', 'c) Ver por cuál de los cuatro factores empuja cada propuesta sobre emisiones', 'd) Predecir la temperatura exacta'], a: 2 },
  { q: 'Stern (2006) concluye que conviene actuar fuerte y ya porque…', o: ['a) Los datos físicos que usa son distintos', 'b) Confía más en los modelos', 'c) Tiene mejores mediciones', 'd) Usa una tasa de descuento muy baja: el futuro casi vale lo mismo que el presente'], a: 3 },
  { q: 'El acero de esta etapa, que hay que contestar y no esquivar, es…', o: ['a) Pindyck (2013): los modelos integrados aparentan una precisión que no tienen', 'b) Que el clima no está cambiando', 'c) Que la desigualdad no se puede medir', 'd) Que el IPCC exagera a propósito'], a: 0 },
  { q: 'La diferencia entre desigualdad de resultados y movilidad es que…', o: ['a) Son lo mismo con otro nombre', 'b) La primera mide cuánto se llevan unos y otros; la segunda, si el lugar donde uno nació decide dónde termina', 'c) Solo la primera se puede medir', 'd) La movilidad se refiere a mudarse de casa'], a: 1 },
  { q: 'El modo de fallar propio de esta etapa consiste en…', o: ['a) Citar demasiadas fuentes', 'b) Usar cifras antiguas', 'c) Escoger la punta del rango y contarla como si fuera el centro', 'd) Negar que existan las facturas'], a: 2 },
]);

B.evalCPBank = JSON.stringify([
  { q: 'Ninguna cifra entra sin su horquilla y sin su ___.', a: 'fuente' },
  { q: 'Antes de medir la desigualdad hay que tomar ___ decisiones.', a: 'cuatro' },
  { q: 'Piketty publicó «El capital en el siglo XXI» en inglés en ___.', a: '2014' },
  { q: 'Rognlie mostró que casi todo el aumento del capital viene de la ___.', a: 'vivienda' },
  { q: 'El periodista del «Financial Times» que cuestionó las series se llama Chris ___.', a: 'Giles' },
  { q: 'La curva del ___ ordena a la humanidad de más pobre a más rica.', a: 'elefante' },
  { q: 'La objeción metodológica a esa curva la publicó Adam ___ en 2016.', a: 'Corlett' },
  { q: 'Keeling empezó a medir dióxido de carbono en Mauna Loa en ___.', a: '1958' },
  { q: 'El sexto informe del IPCC es de ___.', a: '2021' },
  { q: 'El rango probable de sensibilidad climática va de 2,5 a ___ grados.', a: '4' },
  { q: 'El Acuerdo de París es de ___.', a: '2015' },
  { q: 'La «Stern Review» se publicó en ___.', a: '2006' },
  { q: 'Nordhaus recibió el Nobel de Economía en ___.', a: '2018' },
  { q: 'Weitzman llamó la atención sobre las colas ___.', a: 'gordas' },
  { q: 'Chetty y su equipo publicaron su resultado sobre movilidad en ___.', a: '2017' },
]);

B.evalPRBank = JSON.stringify([
  { term: 'La horquilla', def: 'La parte del dato que dice cuánto sabemos' },
  { term: 'Las cuatro decisiones', def: 'Qué, cuándo, entre quiénes y con qué número' },
  { term: 'Riqueza neta', def: 'Lo que se tiene menos lo que se debe' },
  { term: 'Piketty (2014)', def: 'Cuando el capital rinde más que el crecimiento, lo heredado pesa más' },
  { term: 'Rognlie (2015)', def: 'Casi todo el aumento del capital viene de la vivienda' },
  { term: 'Giles (2014)', def: 'La objeción del «Financial Times», y la respuesta con datos' },
  { term: 'La curva del elefante', def: 'Lomo asiático, cuello hundido en los países ricos, trompa del 1 %' },
  { term: 'Corlett (2016)', def: 'La forma depende de qué países entren en la muestra' },
  { term: 'Keeling (1958)', def: 'Medir todos los días en Mauna Loa, y no parar' },
  { term: 'IPCC (2021)', def: 'De 2,5 a 4 °C, con 3 °C como mejor estimación' },
  { term: 'Acuerdo de París (2015)', def: 'Una decisión política, no un resultado científico' },
  { term: 'La identidad de Kaya', def: 'Población, producto, energía y carbono, multiplicados' },
  { term: 'Stern (2006)', def: 'Tasa de descuento baja: actuar fuerte y ya' },
  { term: 'Nordhaus (Nobel 2018)', def: 'Tasa más alta: una senda más gradual' },
  { term: 'Weitzman (2009)', def: 'Las colas gordas: la probabilidad pequeña de lo irreparable' },
  { term: 'Pindyck (2013)', def: 'El acero: los modelos aparentan precisión que no tienen' },
]);

/* ---------- prueba competencial: la cifra sobre la mesa ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'Llega reenviado al grupo de la familia: «el uno por ciento más rico tiene más que la mitad del mundo junta». Viene de un informe real y la cuenta está bien hecha.' },
  { txt: 'En la aldea dicen que antes llovía más y que el pozo aguantaba todo el verano. Varias personas mayores coinciden y a nadie le gusta que le pongan la memoria en duda.' },
  { txt: 'Pasa una tormenta fuerte y a las dos semanas el frijol sube. En la casa dicen que es el clima, en la pulpería que es el intermediario, y el noticiero dice las dos cosas el mismo día.' },
  { txt: 'Se afirma que este país emite muy poco comparado con los grandes. También es cierto que la ropa que se cose aquí se usa allá, y que la energía para coserla se cuenta de este lado.' },
  { txt: 'Un titular dice que el calentamiento va a ser de cuatro grados. El informe del que sale da un rango probable de 2,5 a 4 °C, con 3 °C como mejor estimación.' },
  { txt: 'Alguien sostiene que la desigualdad siempre sube, sin decir de qué desigualdad habla ni de qué años, y cita de memoria un libro que no ha leído entero.' },
  { txt: 'Se discute si arreglar el techo de la escuela este año o el próximo, y cada bando trae su cuenta, y las dos cuentas están bien hechas y dan resultados contrarios.' },
  { txt: 'Una misión de esta casa publica una cifra sin decir de qué año es ni de dónde sale, y una familia la copia en su cuaderno y la usa para discutir en el trabajo.' },
]);

B.critCaseQuestions = JSON.stringify([
  '1. Di qué mide esa cifra exactamente, con esas palabras: ingreso o riqueza, antes o después de impuestos, dentro o entre países, emisiones territoriales o de consumo.',
  '2. Di de qué fuente sale y de qué año, y cuál es su horquilla. Si el titular tomó la punta en vez del centro, señálalo.',
  '3. Trae la auditoría que va al lado: quién ha discutido esa cifra o esa tesis, con qué argumento, y qué queda en pie después de la objeción.',
  '4. Di quién paga esa factura y en qué plazo, distingue lo que es dato de lo que es decisión, y escribe qué dato te haría cambiar de opinión.',
]);

B.critCaseGuides = JSON.stringify([
  'Se empieza por la definición, que es el paso que casi nadie da y el que resuelve la mitad de los casos. La misma palabra nombra cosas distintas: ingreso no es riqueza, antes de impuestos no es después de impuestos, y emisiones territoriales no son emisiones de consumo. Una respuesta buena escribe la definición con las palabras técnicas y después traduce lo que eso significa para el retrato que el titular deja en la cabeza.',
  'Después van la fuente con su año y la horquilla. Si la cifra tiene rango, se dice entero y se señala la mejor estimación; si el titular tomó un extremo, se dice cuál y en qué dirección empuja. Aquí se cae en la trampa propia de la etapa, que es escoger la punta que conviene, y se cae desde los dos lados con el mismo informe: con 2,5 a 4 °C se puede alarmar y tranquilizar sin mentir en ninguna de las dos.',
  'La auditoría entra al lado y no debajo, igual que en toda esta ruta. Piketty va con Rognlie, que mostró en 2015 que casi todo el aumento de la participación del capital viene de la vivienda, y con el episodio del Financial Times de 2014, que Piketty respondió publicando sus datos. La curva del elefante va con Corlett, de 2016. Los modelos del clima van con Pindyck, de 2013. Y una respuesta muy buena dice qué queda en pie después de cada objeción, porque casi siempre queda algo y decir que no queda nada es el error simétrico.',
  'Al final se separa lo que es dato de lo que es decisión, que es la distinción más útil de la etapa: que llevamos alrededor de 1,1 °C es un dato; que haya que quedarse por debajo de 2 °C es una decisión, la del Acuerdo de París de 2015. Y la tasa de descuento, que es donde discrepan Stern y Nordhaus, es una decisión moral escrita como número, no un resultado científico. Se cierra diciendo quién paga y en qué plazo, y con el renglón que esta casa exige siempre: qué dato haría cambiar la conclusión, escrito antes de discutir y no después.',
]);

B.critErrorBank = JSON.stringify([
  { txt: '"Va a subir cuatro grados".', g1: 'Toma la punta del rango y la cuenta como si fuera el número: el informe da de 2,5 a 4 °C con 3 °C como mejor estimación, así que la frase cita bien y engaña igual.', g2: 'La corrección dice la horquilla entera, señala la mejor estimación y nombra la fuente con su año.' },
  { txt: '"El uno por ciento tiene más que la mitad del mundo, así que la mitad del mundo no tiene nada".', g1: 'La primera parte es cierta y mide riqueza neta; la segunda no se sigue, porque con esa vara un graduado endeudado aparece más pobre que alguien sin deudas y sin nada.', g2: 'Se corrige diciendo qué mide la cifra y, si lo que se quiere mostrar es concentración, usando participaciones de ingreso y de riqueza con su metodología.' },
  { txt: '"La desigualdad siempre sube".', g1: 'No dice de qué desigualdad ni de qué años, y en una de sus lecturas es falsa: entre países bajó mientras dentro de los países ricos subía, que es lo que muestra la curva del elefante.', g2: 'Se corrige diciendo cuál de las dos, en qué periodo y con qué fuente, y añadiendo la objeción de Corlett a la forma de la curva.' },
  { txt: '"Como el titular estaba mal, el problema no existe".', g1: 'Es el error simétrico y el más cómodo: desarmar una cifra mal contada es el principio del trabajo, no el final, y quien se queda ahí cambió una consigna por otra más elegante.', g2: 'Se corrige poniendo la cifra buena en el lugar de la mala, no borrando el tema.' },
  { txt: '"Si la ciencia da un rango, es que no se sabe nada".', g1: 'Un rango no es ignorancia: es saber con precisión cuánto no se sabe, y eso es más que cualquier número redondo sin fuente.', g2: 'Se corrige explicando qué significa el rango y dónde está la mejor estimación.' },
  { txt: '"Aquí emitimos poco y punto".', g1: 'Falta decir cómo se cuenta: las emisiones territoriales y las de consumo dan números distintos para el mismo país, y las dos son legítimas.', g2: 'Se corrige diciendo cuál de las dos contabilidades se está usando, y sosteniendo a la vez que aquí se emite poco por persona y que aquí se sufre mucho.' },
]);

B.critDecisionBank = JSON.stringify([
  'El titular del uno por ciento ya está en el grupo de la familia: ¿qué se contesta, en tres renglones, sin quedar de aguafiestas ni de repetidor?',
  'La aldea sostiene que antes llovía más: ¿cómo se respeta la memoria sin confundirla con una serie, y qué se propone hacer a partir de esta semana?',
  'El frijol subió después de la tormenta: ¿qué tres causas se ponen sobre la mesa y qué datos harían falta para saber cuál explica cuánto?',
  'Hay que explicarle a la familia por qué «aquí emitimos poco» y «aquí sufrimos mucho» son las dos ciertas: ¿cómo se dice sin que parezca una excusa?',
  'Angelly pregunta si es lo mismo que todos ganen parecido a que cualquiera pueda llegar a cualquier parte: ¿qué se contesta y con qué medición?',
  'La frase de Jael ya está escrita en el cuaderno: ¿se borra o se corrige, y con qué tres renglones se reescribe para que sirva para discutir?',
  'Alguien quiere usar esta etapa para señalar a un funcionario con pleito abierto: ¿qué dice la regla de selección de la materia, y cómo se escribe el caso para que entre como categoría?',
  'La casa se audita a sí misma: ¿qué reglas se impone sobre las cifras que publica, y qué señal obligaría a corregir una misión ya publicada?',
]);

B.critCompareBank = JSON.stringify([
  { a: 'Escribir «entre 2,5 y 4 °C, con 3 como mejor estimación, según el IPCC de 2021».', b: 'Escribir «va a subir cuatro grados».', ga: 'Caso A: dice la horquilla, la mejor estimación y la fuente con su año, así que quien lo lea puede comprobarlo y puede discutirlo.', gb: 'Caso B: toma la punta del rango, y aunque cite un informe verdadero deja en la cabeza un número que el informe no dijo.', gr: 'La diferencia no es de tono sino de comprobabilidad: solo la primera se puede verificar y solo la primera enseña a leer.' },
  { a: 'Citar a Piketty con Rognlie y con el episodio del Financial Times al lado.', b: 'Citar a Piketty como si nadie lo hubiera discutido.', ga: 'Caso A: deja la discusión donde está de verdad, que es qué parte del aumento viene de la vivienda y qué habría que hacer con eso.', gb: 'Caso B: usa a un autor como bandera y esconde diez años de auditoría, que es el vicio que esta materia enseña a cazar.', gr: 'La regla no cambia según de qué lado caiga la objeción: media cita es media cita.' },
  { a: 'Decir «esto es un dato» y «esto es una decisión», separado.', b: 'Mezclar las dos cosas en la misma frase con el mismo tono.', ga: 'Caso A: permite discutir la decisión sin negar el dato, que es la única conversación que puede terminar en algo.', gb: 'Caso B: convierte una posición moral en una supuesta autoridad científica, y del otro lado permite negar el dato porque la decisión no gusta.', gr: 'Que llevamos 1,1 °C es un dato; quedarse bajo 2 °C es una decisión; y la tasa de descuento es una decisión moral escrita como número.' },
  { a: 'Anotar cada semana el precio del frijol durante tres años.', b: 'Discutir de memoria si antes estaba más barato.', ga: 'Caso A: construye una serie, que es lo único que puede zanjar la discusión, y lo puede hacer cualquiera con un cuaderno.', gb: 'Caso B: enfrenta dos memorias, y las memorias guardan sustos y no promedios, así que la discusión no termina nunca.', gr: 'Una memoria es un dato; una serie es una prueba. Eso lo entendió Keeling en 1958 y lo puede repetir una niña con un cuaderno de espiral.' },
]);

B.critCauseBank = JSON.stringify([
  { cause: 'Se repite una cifra sin decir qué mide.', guide: 'Casi todas las cifras que circulan son verdaderas y aun así dejan un retrato falso, porque la palabra que las nombra cubre cosas distintas. Ingreso no es riqueza; antes de impuestos no es después de impuestos; territorial no es de consumo. Quien no dice la definición no está mintiendo, pero está transmitiendo un error, y el error viaja más rápido que la corrección.' },
  { cause: 'Se toma la punta del rango y se cuenta como el número.', guide: 'Es el modo de fallar propio de esta etapa y lo cometen los dos bandos con el mismo informe. Con la horquilla de 2,5 a 4 °C se puede titular alarmando o tranquilizando sin decir una sola falsedad. La lectura honrada dice el rango entero y señala la mejor estimación, y solo después opina. Un número redondo sin rango es casi siempre una conclusión disfrazada de dato.' },
  { cause: 'Se cita una tesis sin su auditoría.', guide: 'Es la misma falta que en las etapas anteriores, aplicada a cifras. Piketty va con Rognlie de 2015 y con el episodio del Financial Times de 2014; la curva del elefante va con Corlett de 2016; los modelos del clima van con Pindyck de 2013. Y hay que decir qué queda en pie después de cada objeción, porque casi siempre queda algo: la auditoría rara vez derriba, casi siempre matiza y cambia el remedio.' },
  { cause: 'Se confunde un dato con una decisión.', guide: 'Que llevamos alrededor de 1,1 °C es un dato, medido. Que haya que quedarse bien por debajo de 2 °C es una decisión, la del Acuerdo de París de 2015. Y la tasa de descuento, donde discrepan Stern y Nordhaus, es una decisión moral escrita como número. Mezclar las dos cosas hace dos daños: convierte una posición moral en autoridad científica, y le da al otro lado la excusa para negar el dato porque la decisión no le gusta.' },
  { cause: 'Se desarma un titular y se da el tema por cerrado.', guide: 'Es el error simétrico, y el más cómodo de todos, porque uno queda de listo sin haber estudiado nada. Que el titular del uno por ciento se lea mal no borra la concentración de la riqueza, que está medida por otras vías; que alguien exagere con el clima no baja la raya del termómetro. Desarmar una cifra mal contada es el principio del trabajo: lo que sigue es poner la cifra buena en su lugar.' },
  { cause: 'Se usa la etapa para señalar a alguien con pleito abierto.', guide: 'Rompe la regla de selección de la materia. La asimetría de emitir poco y sufrir mucho se estudia con cifras, con su fuente y su año, y como categoría: no se le pone la etiqueta a ningún funcionario, a ningún partido ni a nadie en campaña. La herramienta sirve para pensar el mecanismo y para pedir con números en vez de con adjetivos, que además funciona mejor y dura más de una semana.' },
]);

B.critEffectBank = JSON.stringify([
  { effect: 'El titular del uno por ciento entró al expediente con su definición y su fuente.', guide: 'Se anotó que mide riqueza neta, es decir lo que se tiene menos lo que se debe, y que con esa vara un graduado endeudado aparece más pobre que alguien sin deudas y sin tierra. Y se anotó lo segundo, que es lo difícil: eso no borra la concentración de la riqueza, que está medida por otras vías. Para mostrar concentración sirven mejor las participaciones de ingreso y de riqueza publicadas con su metodología.' },
  { effect: 'La aldea empezó a llevar un cuaderno con la fecha en que se seca el pozo.', guide: 'Es la lección de Keeling en pequeño: una memoria es un dato y una serie es una prueba. No se le quitó la razón a nadie ni se despreció la memoria de los mayores; se le añadió lo único que puede zanjar la discusión, que es anotar. Y se dejó escrito lo que todavía no se puede afirmar: que un verano concreto sea por el calentamiento requiere ciencia de atribución, y sin ella lo honrado es decir que encaja y no que está probado.' },
  { effect: 'La casa pudo sostener a la vez que aquí se emite poco y que aquí se sufre mucho.', guide: 'Porque son dos cifras distintas y las dos tienen fuente: emisiones por persona por un lado, exposición y capacidad de reponerse por otro. Y porque se dijo cuál de las dos contabilidades se estaba usando, la territorial o la de consumo, que dan números distintos para el mismo país. Ninguna de las dos frases cancela a la otra, y quien necesite que una cancele a la otra está discutiendo otra cosa.' },
  { effect: 'La frase de Jael quedó reescrita en tres renglones que se pueden comprobar.', guide: 'De «la desigualdad siempre sube» se pasó a: la desigualdad de ingreso dentro de los países ricos subió desde los años ochenta, la desigualdad entre países bajó en el mismo periodo, las dos cosas están en el trabajo de Lakner y Milanović, y la forma de esa curva tiene encima la objeción de Corlett de 2016. Se perdió la contundencia y se ganó lo único que importa: que ahora se puede discutir y se puede comprobar.' },
  { effect: 'La casa se auditó a sí misma y dejó por escrito sus reglas sobre cifras.', guide: 'Toda cifra publicada lleva fuente y año; las que tienen rango se escriben con su rango; las fichas se imprimen en papel para que sirvan sin datos ni batería, porque una misión que exige teléfono y luz tiene su propia factura de desigualdad de acceso. Y la señal que obligaría a cambiar: si una familia encuentra una cifra sin fuente, se corrige la misión, no se explica por qué estaba bien.' },
  { effect: 'La discusión del techo de la escuela terminó en una decisión y no en una pelea.', guide: 'Porque se separó lo que era cuenta de lo que era gusto. Las dos cuentas estaban bien hechas y daban resultados contrarios porque valoraban distinto el mañana, que es exactamente la tasa de descuento de Stern y Nordhaus traída a la cocina. Al decirlo en voz alta, la discusión dejó de ser sobre quién sumaba mal y pasó a ser sobre cuánto pesa el nieto que va a pasar por ese techo, que es una pregunta que sí se puede contestar entre personas.' },
]);

/* ---------- línea de tiempo ---------- */
B.timelineData = JSON.stringify([
  { y: '1958', icon: '📈', label: 'Keeling empieza a medir', text: '<strong>Charles David Keeling</strong> instala su equipo en <strong>Mauna Loa</strong> y empieza a medir dióxido de carbono todos los días. La curva sube y baja con las estaciones y sube año tras año. Etiqueta: <strong>la medición más limpia que tiene este tema</strong>, y se cita por el método.' },
  { y: '2006', icon: '⏳', label: 'La «Stern Review»', text: '<strong>Nicholas Stern</strong> publica un informe encargado por el gobierno británico donde usa una <strong>tasa de descuento muy baja</strong>: el futuro casi vale lo mismo que el presente, y de ahí sale actuar fuerte y ya. Etiqueta: <strong>informe oficial, y muy discutido</strong>.' },
  { y: '2009', icon: '🎲', label: 'Weitzman y las colas', text: '<strong>Martin Weitzman</strong> sostiene que la discusión del promedio se queda corta: lo que manda son <strong>las colas gordas</strong>, la probabilidad pequeña de una catástrofe grande. Etiqueta: <strong>el giro teórico</strong> de este debate.' },
  { y: '2013', icon: '🔩', label: 'Pindyck, el acero', text: 'En el <strong>«Journal of Economic Literature»</strong>, <strong>Robert Pindyck</strong> critica desde dentro de la profesión los modelos que producen estas cifras: <strong>sus funciones de daño están elegidas casi arbitrariamente</strong>. Etiqueta: <strong>el acero</strong>, y se contesta en vez de esquivarse.' },
  { y: '2014', icon: '📕', label: 'Piketty, y su auditoría', text: 'Aparece en inglés <strong>«El capital en el siglo XXI»</strong>: cuando el capital rinde más de lo que crece la economía, lo heredado pesa más que lo trabajado. Ese mismo año, <strong>Chris Giles</strong>, del <strong>Financial Times</strong>, cuestiona parte de sus series y <strong>Piketty responde publicando sus datos</strong>.' },
  { y: '2015', icon: '🏠', label: 'Rognlie mira la vivienda', text: '<strong>Matthew Rognlie</strong> muestra, en un trabajo de la <strong>Brookings Institution</strong>, que <strong>casi todo el aumento de la participación del capital viene de la vivienda</strong>. Etiqueta: <strong>la auditoría obligada</strong>. No derriba la tesis: cambia el remedio.' },
  { y: '2015', icon: '🌍', label: 'El Acuerdo de París', text: 'Se acuerda quedarse <strong>bien por debajo de 2 °C</strong> y perseguir <strong>1,5 °C</strong>. Etiqueta: <strong>decisión política, no resultado científico</strong>, y esa distinción es la mitad de la etapa.' },
  { y: '2016', icon: '🐘', label: 'El elefante, y su objeción', text: '<strong>Milanović</strong> desarrolla en <strong>«Global Inequality»</strong> la curva que él y <strong>Lakner</strong> habían trazado: entre países bajó, dentro de los ricos subió. Ese mismo año, <strong>Adam Corlett</strong>, en la <strong>Resolution Foundation</strong>, muestra que <strong>su forma depende de qué países entren</strong>.' },
  { y: '2017', icon: '🎓', label: 'Chetty mide la movilidad', text: 'En <strong>«Science»</strong>, <strong>Raj Chetty</strong> y su equipo publican que del <strong>90 %</strong> de los estadounidenses nacidos en <strong>1940</strong> que superó a sus padres se pasó a cerca de <strong>la mitad</strong> entre los nacidos en <strong>1984</strong>. Etiqueta: <strong>medición de movilidad</strong>.' },
  { y: '2021', icon: '🌡️', label: 'La horquilla del IPCC', text: 'El <strong>sexto informe de evaluación</strong> estima la sensibilidad climática entre <strong>2,5 y 4 °C</strong>, con <strong>3 °C</strong> como mejor estimación, y el calentamiento ya ocurrido en torno a <strong>1,1 °C</strong>. Etiqueta: <strong>fuente oficial, y de las que publican su rango</strong>.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  desigualdad: {
    nombre: 'La factura de la desigualdad', icon: '💰',
    estructura: { title: 'Qué dice', info: '• Que la máquina reparte, y que ese reparto <strong>se puede medir</strong><br>• Su dificultad no es de datos: es <strong>de definición</strong><br>• <strong>Piketty (2014)</strong>: cuando el capital rinde más que el crecimiento, lo heredado pesa más' },
    funcion: { title: 'Cómo se reconoce', info: '• Se piden las <strong>cuatro decisiones</strong> antes de aceptar la cifra<br>• Qué (ingreso o riqueza), cuándo (antes o después de impuestos)<br>• Entre quiénes (dentro o entre países) y con qué número (índice o participaciones)' },
    enfermedades: { title: 'Dónde se cae', info: '• Confundir <strong>riqueza neta con pobreza</strong>, que es el error del titular famoso<br>• Citar a <strong>Piketty sin Rognlie</strong>, que es media cita<br>• Y usar <strong>«siempre»</strong> sobre algo que se mide, que es renunciar a medirlo' },
    cuidados: { title: 'En esta casa', info: '• <strong>Piketty (2014) y Rognlie (2015) entran juntos</strong>, al lado y no debajo<br>• Con el episodio de <strong>Giles (2014)</strong> y la respuesta con datos<br>• Y toda cifra que se publique aquí lleva <strong>fuente y año</strong>' },
  },
  elefante: {
    nombre: 'La curva del elefante', icon: '🐘',
    estructura: { title: 'Qué dice', info: '• Ordena a <strong>toda la humanidad</strong> de más pobre a más rica, entre <strong>1988 y 2008</strong><br>• El <strong>lomo</strong>: cientos de millones que salieron de la pobreza<br>• El <strong>cuello hundido</strong>: los trabajadores de los países ricos. La <strong>trompa</strong>: el 1 %' },
    funcion: { title: 'Cómo se reconoce', info: '• Cuando alguien dice «la desigualdad subió» y otro «bajó», y <strong>los dos tienen razón</strong><br>• Uno mira <strong>dentro</strong> de un país y el otro <strong>entre</strong> países<br>• De <strong>Lakner y Milanović</strong>, desarrollada en <strong>«Global Inequality» (2016)</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Contar <strong>media película</strong>: solo el lomo, o solo el cuello hundido<br>• Tratar el dibujo como <strong>intocable</strong>, cuando tiene objeción publicada<br>• Y olvidar que <strong>el periodo importa</strong>: es de 1988 a 2008, no de siempre' },
    cuidados: { title: 'En esta casa', info: '• La curva entra <strong>con la objeción de Corlett (2016)</strong> encima, siempre<br>• Se dice que <strong>el hundimiento sigue existiendo, pero es más pequeño</strong><br>• Y se usa para lo que sirve: <strong>incomodar a los dos estantes con el mismo trazo</strong>' },
  },
  clima: {
    nombre: 'La factura del clima', icon: '🌡️',
    estructura: { title: 'Qué dice', info: '• Lo medido es sólido: la serie de <strong>Keeling desde 1958</strong> y <strong>1,1 °C</strong> ya ocurridos<br>• Lo incierto es <strong>cuánto calienta</strong>: de <strong>2,5 a 4 °C</strong>, con <strong>3 °C</strong> como mejor estimación<br>• Y lo acordado es político: <strong>París, 2015</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Se busca la <strong>horquilla</strong> antes que la conclusión<br>• Se separa <strong>lo medido</strong> de <strong>lo proyectado</strong> y de <strong>lo decidido</strong><br>• Y se usa la <strong>identidad de Kaya</strong> para ver por dónde empuja cada propuesta' },
    enfermedades: { title: 'Dónde se cae', info: '• <strong>Escoger la punta del rango</strong>, en cualquiera de las dos direcciones<br>• Saltar de <strong>un evento suelto</strong> a la causa sin ciencia de atribución<br>• Y mezclar <strong>emisiones territoriales con emisiones de consumo</strong>' },
    cuidados: { title: 'En esta casa', info: '• La horquilla se escribe <strong>entera y con su mejor estimación</strong><br>• Lo que es <strong>decisión política</strong> se dice que lo es, empezando por París<br>• Y los pleitos del patio entran <strong>como categoría, no con nombre propio</strong>' },
  },
  descuento: {
    nombre: 'La tasa de descuento', icon: '⏳',
    estructura: { title: 'Qué dice', info: '• <strong>Cuánto vale hoy el bienestar de alguien que todavía no ha nacido</strong><br>• Es un número, y lo que lo decide <strong>no es un dato físico sino una posición moral</strong><br>• De ahí sale el ritmo: <strong>fuerte y ya</strong> o <strong>gradual</strong>' },
    funcion: { title: 'Cómo se reconoce', info: '• Cuando dos personas miran <strong>los mismos datos</strong> y proponen cosas distintas<br>• <strong>Stern (2006)</strong> la puso muy baja; <strong>Nordhaus</strong>, más alta<br>• Y en la cocina: <strong>arreglar el techo este año o el próximo</strong>' },
    enfermedades: { title: 'Dónde se cae', info: '• Presentarla como <strong>un resultado científico</strong>, que no lo es<br>• Y del otro lado, negar el dato físico <strong>porque la decisión no gusta</strong><br>• Olvidar a <strong>Weitzman (2009)</strong>: lo que decide puede ser <strong>la cola</strong> y no el promedio' },
    cuidados: { title: 'En esta casa', info: '• <strong>Stern y Nordhaus entran juntos</strong>, y se dice que discrepan en valores<br>• Con <strong>el acero de Pindyck (2013)</strong> al lado, que viene de dentro de la profesión<br>• Y con la regla que atraviesa la ruta: <strong>lo que es decisión se dice que es decisión</strong>' },
  },
});

/* ---------- niveles y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Reenvía la cifra sin mirar de dónde viene 📰' },
  { t: 25, n: 'Ya pregunta qué mide antes de repetirla 🧮' },
  { t: 55, n: 'Lee una horquilla sin escoger la punta 🌡️' },
  { t: 90, n: 'Cita a Piketty con su auditoría al lado 📕' },
  { t: 130, n: 'Distingue la desigualdad de dentro de la de entre países 🐘' },
  { t: 165, n: 'Separa lo que es dato de lo que es decisión ⚖️' },
  { t: 190, n: 'Pone una cifra de pie y dice quién paga la factura 🧾' },
]);

B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de las dos facturas superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la etapa explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de datos y de decisiones' },
  id_master: { icon: '🔍', label: 'Identificador de piezas y fuentes maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de las dos facturas' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  lect_master: { icon: '📖', label: 'Las 15 preguntas de comprensión lectora respondidas' },
  full_xp: { icon: '👑', label: 'Etapa 4 de la Ruta del Expediente Dorado completada' },
});

/* ---------- preguntas de las tres lecturas (norma 5-quater) ---------- */
B.lectComprensionBank = JSON.stringify([
  { t: 'Borges', q: '¿Qué llevaba el abuelo del narrador durante cuarenta años, y con qué instrumentos?', o: ['a) Un registro diario de la lluvia, con un embudo de latón y una probeta de farmacia', 'b) Un libro de cuentas de la finca', 'c) Un herbario de la región', 'd) Un diario personal'], c: 0 },
  { t: 'Borges', q: 'Al sumar las columnas del abuelo, ¿qué descubrió el narrador sobre la lluvia de aquel valle?', o: ['a) Que llovió mucho menos que antes', 'b) Que llovió igual, pero peor repartido: menos días de lluvia y más lluvia por día', 'c) Que llovió más que nunca', 'd) Que los datos no servían para nada'], c: 1 },
  { t: 'Borges', q: '¿Qué le pasó al narrador cuando vio dos periódicos citar el mismo informe del IPCC?', o: ['a) Descubrió que el informe estaba mal', 'b) Comprobó que los dos mentían', 'c) Vio que uno alarmaba y otro tranquilizaba, y que cada uno había elegido una punta del rango', 'd) Dejó de leer periódicos'], c: 2 },
  { t: 'Borges', q: 'Según el cuento, ¿por qué Piketty se parece al abuelo del narrador?', o: ['a) Porque también medía la lluvia', 'b) Porque escribió un libro muy largo', 'c) Porque nunca opinaba', 'd) Porque publicó los datos con los que se le podía refutar'], c: 3 },
  { t: 'Borges', q: '¿Qué frase resume la regla que el narrador anota para sí mismo sobre los rangos?', o: ['a) Que la horquilla no es la debilidad del dato, sino la parte que dice cuánto sabemos', 'b) Que los rangos se deben convertir en una sola cifra', 'c) Que sin certeza no se puede decidir', 'd) Que los científicos exageran'], c: 0 },
  { t: 'Cervantes', q: '¿Cómo descubrió Sancho el engaño del báculo?', o: ['a) Porque el viejo confesó', 'b) Porque advirtió que el juramento era verdadero solo mientras el otro tuviera la caña, y mandó quebrarla', 'c) Porque contó las monedas del acreedor', 'd) Porque el mayordomo se lo dijo'], c: 1 },
  { t: 'Cervantes', q: 'Según Sancho, ¿dónde estaba la mentira del viejo?', o: ['a) En las palabras, que eran falsas', 'b) En el juramento, que fue mal hecho', 'c) No en las palabras, que eran ciertas, sino en lo que dejaban entender', 'd) En el báculo, que no era suyo'], c: 2 },
  { t: 'Cervantes', q: '¿Por qué no concordaban los dos memoriales de los contadores de la ínsula?', o: ['a) Porque uno había sumado mal', 'b) Porque uno mentía a propósito', 'c) Porque faltaban papeles', 'd) Porque uno contaba lo que entra cada mes y el otro lo que cada casa tiene guardado quitando lo que debe'], c: 3 },
  { t: 'Cervantes', q: '¿Qué manda Sancho que se escriba desde entonces en la cabeza de cada memorial?', o: ['a) Qué cosa es la que se cuenta, con letra gruesa', 'b) El nombre del contador', 'c) La fecha y la hora', 'd) El sello del gobernador'], c: 0 },
  { t: 'Cervantes', q: '¿De quién se fía más Sancho: del que da un número entre dos cantidades o del que clava una cifra exacta?', o: ['a) Del que clava la cifra exacta, porque parece más sabio', 'b) Del que dice «entre cien y ciento cincuenta», porque también le está diciendo lo que no sabe', 'c) De ninguno de los dos', 'd) Del que trae más papeles'], c: 1 },
  { t: 'Harari', q: 'Según el ensayo, ¿qué es lo verdaderamente nuevo en la historia de la especie, y desde hace cuánto?', o: ['a) La agricultura, desde hace milenios', 'b) El dinero, desde hace siglos', 'c) Que aprendimos a medirnos, y tiene apenas unos siglos', 'd) La escritura, desde hace cinco mil años'], c: 2 },
  { t: 'Harari', q: '¿Qué dice el ensayo que significa de verdad un rango publicado por los científicos?', o: ['a) Que no se pusieron de acuerdo', 'b) Que faltan mediciones', 'c) Que el tema es político', 'd) Que se sabe con precisión cuánto no se sabe'], c: 3 },
  { t: 'Harari', q: '¿Cuál es, según el ensayo, la parte mejor de la historia de Piketty y que casi nunca se cuenta?', o: ['a) Que lo auditaron: Rognlie en 2015 y Giles en 2014, y él respondió publicando sus datos', 'b) Que vendió muchos ejemplares', 'c) Que escribió en francés', 'd) Que nadie pudo discutirlo'], c: 0 },
  { t: 'Harari', q: 'El resultado de Chetty y su equipo publicado en «Science» en 2017 dice que…', o: ['a) La desigualdad bajó en Estados Unidos', 'b) Del 90 % de los nacidos en 1940 que superó a sus padres se pasó a cerca de la mitad entre los nacidos en 1984', 'c) La movilidad no se puede medir', 'd) Todos los hijos ganan más que sus padres'], c: 1 },
  { t: 'Harari', q: '¿Cuáles son las tres preguntas que el ensayo propone para cualquier número?', o: ['a) Quién lo dice, cuándo y por qué', 'b) Si es grande, si es nuevo y si asusta', 'c) Qué mide exactamente, de qué fuente y año sale, y entre qué números anda', 'd) Si conviene, si convence y si se puede compartir'], c: 2 },
]);

B.lectCompletarBank = JSON.stringify([
  { t: 'las tres', q: 'Charles David Keeling empezó a medir dióxido de carbono en Mauna Loa en ___.', a: '1958' },
  { t: 'las tres', q: 'El sexto informe del IPCC, de ___, estima la sensibilidad climática entre 2,5 y 4 °C.', a: '2021' },
  { t: 'las tres', q: 'La mejor estimación de ese rango es de ___ grados.', a: '3' },
  { t: 'Borges', q: 'Thomas Piketty publicó en inglés su libro sobre el capital en ___.', a: '2014' },
  { t: 'Borges', q: 'Matthew Rognlie mostró en ___ que casi todo el aumento venía de la vivienda.', a: '2015' },
  { t: 'Harari', q: 'Adam Corlett publicó su objeción a la curva del elefante en ___.', a: '2016' },
  { t: 'Harari', q: 'Raj Chetty y su equipo publicaron su medición de movilidad en la revista ___.', a: 'Science' },
  { t: 'las tres', q: 'Nicholas Stern publicó su informe en ___.', a: '2006' },
  { t: 'las tres', q: 'William Nordhaus recibió el Nobel de Economía en ___.', a: '2018' },
  { t: 'Cervantes', q: 'Sancho mandó quebrar el ___ para hallar dentro los diez escudos.', a: 'báculo' },
]);

B.lectAnalisisBank = JSON.stringify([
  { q: '1. Las tres lecturas llegan a la misma disciplina por tres puertas. Explica qué hace cada voz que las otras dos no pueden hacer, y qué se perdería leyendo solo una.', guia: 'El cuento convierte el método en una herencia y por eso lo vuelve memorable: ochenta y siete cuadernos de hule negro, un hombre que durante cuarenta años prefirió medir a tener razón, y el hallazgo de que en aquel valle no llovió menos sino peor repartido, cosa que ninguna sobremesa habría podido establecer. Esa forma enseña algo que una tabla no puede: que anotar es un acto de humildad y también el único camino para saber. El capítulo lo vuelve escena, risa y refrán, y llega a donde el argumento no llega: el báculo con los escudos dentro deja pegada de por vida la idea de que se puede mentir con verdades, y los dos contadores que no concuerdan enseñan en cuatro líneas lo que aquí se llama la definición. El ensayo pone la escala de especie y encadena la erudición con sus años, que es lo que permite comprobar. Leyendo solo el cuento se tendría método sin fuentes; solo el capítulo, astucia sin datos; solo el ensayo, datos sin ninguna imagen que los fije. Las tres juntas dan lo mismo por tres caminos, y por eso la casa las escribe así.' },
  { q: '2. El cuento dice que «una memoria es un dato y una serie es una prueba». Explica esa frase con el caso del pozo de la aldea y con el de la lluvia del valle.', guia: 'Una memoria es un dato porque no es mentira ni es despreciable: la gente mayor que recuerda que el pozo aguantaba todo el verano está aportando información real sobre lo que vivió. Lo que no puede hacer una memoria es promediar, porque la cabeza no guarda promedios sino sustos, y por eso todo el mundo recuerda el año que se secó y no los tres que estuvieron normales. Una serie es una prueba porque sí promedia y porque permite separar variabilidad de tendencia, que es la distinción que decide estos casos: un año malo no es una tendencia, y una tendencia no se ve sin varios años anotados. En el cuento eso se muestra con elegancia, porque el resultado no le da la razón a nadie del todo: los viejos decían que llovía más y en realidad llovía igual pero peor repartido, con menos días de lluvia y más lluvia por día. Tenían razón en lo que sentían y no en lo que afirmaban, y eso solo se pudo saber porque hubo cuadernos. La consecuencia práctica para esta casa es directa y barata: anotar la fecha en que se seca el pozo, año tras año, vale más que diez discusiones.' },
  { q: '3. Sancho dice que la mentira del viejo no estaba en las palabras sino en lo que las palabras dejaban entender. Aplica esa idea al titular del uno por ciento.', guia: 'El viejo juró que había devuelto los diez escudos de su mano a la del otro, y era verdad en el instante exacto del juramento, porque acababa de darle el báculo que los llevaba dentro. Cada palabra era cierta y el resultado era un engaño completo. El titular del uno por ciento funciona igual: la cifra está bien calculada y mide riqueza neta, es decir lo que uno tiene menos lo que debe, de modo que la afirmación es correcta. El engaño está en lo que deja entender, porque con esa vara un recién graduado con un préstamo grande aparece más pobre que un campesino sin deudas y sin tierra, y el retrato que se forma quien escucha no corresponde a la realidad que quería describirse. La lección de método es que no basta con preguntar si una cifra es verdadera, hay que preguntar qué mide y qué imagen deja. Y la lección honrada, que Sancho también habría aceptado, es que descubrir el truco del báculo no borra la deuda: que el titular se lea mal no elimina la concentración de la riqueza, que está medida por otras vías.' },
  { q: '4. Los dos contadores de la ínsula tienen razón y dicen cosas contrarias. Explica el episodio y relaciónalo con las cuatro decisiones de esta etapa.', guia: 'Uno cuenta lo que entra en la ínsula cada mes y el otro lo que cada casa tiene guardado quitando lo que debe, de manera que el primero mide un flujo y el segundo un patrimonio. Los dos suman bien y llegan a conclusiones opuestas sobre si la ínsula está más rica o más pobre, y Sancho no le da la razón a ninguno: manda que cada memorial escriba arriba, con letra gruesa, qué cosa es la que cuenta. Eso es exactamente la primera de las cuatro decisiones de esta etapa, la de qué se mide, ingreso o riqueza. Las otras tres funcionan igual de bien en la ínsula: cuándo se mide, es decir antes o después de lo que el gobierno quita y da; entre quiénes, dentro de la ínsula o comparándola con las de al lado; y con qué número, un índice que resume todo en una cifra o participaciones que dicen cuánto se lleva cada tramo. Ninguna de esas decisiones es tramposa, y ahí está el detalle importante: el problema no son los contadores deshonestos, son los memoriales sin encabezado. Por eso la regla de Sancho es de procedimiento y no de moral, y por eso funciona.' },
  { q: '5. Sancho dice que se fía más del que le da un rango que del que le clava un número exacto. Explica por qué, y por qué al público le pasa lo contrario.', guia: 'Se fía más porque el que dice «entre cien y ciento cincuenta fanegas» le está dando dos informaciones en vez de una: lo que sabe y, sobre todo, cuánto no sabe, y con las dos se puede gobernar, que es lo que él necesita. El que clava ciento veinticuatro sin pestañear le está ocultando la segunda, y como nadie puede tener esa precisión, lo que le está entregando es su parecer vestido de cuenta. Al público le pasa lo contrario por dos razones. La primera es práctica: un número redondo se recuerda, se repite y se comparte, y una horquilla no. La segunda es psicológica: la incertidumbre incomoda, y quien la declara parece menos competente que quien no la declara, aunque sea al revés. Eso explica el modo de fallar propio de esta etapa, que es escoger la punta del rango: quien quiere convencer sabe que el extremo funciona mejor que el centro, y lo toma. La defensa es la disciplina de Sancho llevada a la cocina: preferir la fuente que publica su rango, y desconfiar por sistema del número redondo sin fuente.' },
  { q: '6. Explica por qué la casa insiste en que Piketty se cite junto a Rognlie y al episodio del «Financial Times», y qué enseña eso sobre cómo se discute bien.', guia: 'Porque una obra tan influyente y tan discutida no se puede citar por la mitad sin faltar a la regla del Estudio Mayor, que rige toda esta ruta y que ya se aplicó en las etapas anteriores con Coase y con Titmuss. Piketty sostuvo en 2014 que cuando el capital rinde más de lo que crece la economía, lo heredado pesa más que lo trabajado. Matthew Rognlie mostró en 2015 que casi todo el aumento de la participación del capital venía de la vivienda y no del capital productivo, lo cual no derriba la tesis pero cambia qué habría que hacer con ella, que es la clase de objeción más útil que existe. Y Chris Giles, del Financial Times, cuestionó en 2014 parte de sus series de riqueza. Lo que enseña el episodio es la conducta que vino después: Piketty respondió públicamente y publicó sus datos. Un autor que pone a disposición los números con los que se le puede refutar es más fiable que uno que solo publica conclusiones, y esa es la vara con la que esta casa quiere ser medida cuando publica sus propias cifras.' },
  { q: '7. El ensayo dice que la discusión seria sobre el clima no es sobre el termómetro. Explica de qué es, y por qué eso cambia la manera de discutir.', guia: 'Es sobre cuánto vale hoy el bienestar de alguien que todavía no ha nacido, que es lo que técnicamente se llama tasa de descuento. Nicholas Stern, en su informe de 2006, usó una tasa muy baja, con lo cual el futuro pesa casi como el presente y la conclusión es actuar con fuerza y de inmediato. William Nordhaus, Nobel de Economía en 2018, usó una tasa más alta, tomada de cómo la gente descuenta realmente, y su conclusión es una senda más gradual. Los dos miran los mismos datos físicos, y por eso llamarlos negacionista o alarmista es no haber entendido de qué hablan. Que la discusión sea de valores y no de datos cambia tres cosas. Primero, nadie puede ganarla apelando a la autoridad científica, porque la ciencia no fija esa tasa. Segundo, hay que argumentar moralmente en voz alta, que es incómodo y honrado. Y tercero, la discusión deja de ser inaccesible: es la misma pregunta que se hace una familia cuando decide si arregla el techo este año o el próximo, y en esa forma cualquiera puede opinar con sentido.' },
  { q: '8. Weitzman y Pindyck aparecen en los tres textos como incomodidades. Explica qué dice cada uno y por qué esta casa los incluye en vez de dejarlos fuera.', guia: 'Weitzman sostuvo en 2009 que la discusión centrada en el promedio se queda corta, porque lo que debería pesar en una decisión son las colas: la probabilidad pequeña de una catástrofe grande e irreversible. Eso cambia la pregunta de cuánto va a calentar a cuánto pagaríamos por evitar lo irreparable, que es como se razona cuando uno compra un seguro. Pindyck escribió en 2013, en el Journal of Economic Literature, que los modelos integrados con los que se calculan los costos del clima tienen funciones de daño elegidas de manera casi arbitraria y aparentan una precisión que no tienen. Los dos incomodan, y en direcciones distintas: uno empuja a actuar más de lo que sugiere el promedio y el otro quita autoridad a los números con los que se decide. La casa los incluye porque la regla del acero se aplica siempre y no solo cuando conviene, y porque quien no conoce las objeciones a su propia posición no la está defendiendo, la está repitiendo. Y la respuesta que se da es la misma disciplina de la ruta: si el modelo no es preciso, se dice, y se decide igual, porque no decidir también es una decisión con factura.' },
  { q: '9. Explica el error propio de esta etapa y por qué la casa insiste en que desarmar un titular es el principio del trabajo y no el final.', guia: 'El error propio es escoger la punta del rango que conviene y contarla como si fuera el número. Se reconoce en tres señales: la cifra aparece sin horquilla, no se dice qué mide exactamente, y no se dice de qué fuente y de qué año sale. Lo que hace a este error tan interesante es que lo cometen los dos bandos con el mismo informe, porque con una horquilla de 2,5 a 4 °C se puede alarmar y tranquilizar sin decir una sola falsedad. Ahora bien, quien aprende a detectarlo cae inmediatamente en el error simétrico, que es el más cómodo de todos: creer que porque el titular estaba mal contado el problema no existe. Eso es falso en las dos facturas. Que la cifra del uno por ciento se lea mal no borra la concentración de la riqueza, que está medida por otras vías; que alguien exagere con el clima no baja la raya del termómetro ni acorta la serie de Keeling. Por eso la casa insiste: desarmar una cifra mal contada es el primer paso, y el trabajo consiste en poner la cifra buena en su lugar, con su definición, su fuente y su rango.' },
  { q: '10. Los tres textos llevan la etiqueta de ejercicio de estilo de la casa. Explica por qué esa etiqueta pertenece al temario de esta etapa en particular, y qué pasaría si se quitara.', guia: 'Porque esta etapa se estudia entera sobre la diferencia entre una afirmación verdadera y una afirmación bien puesta de pie, y un pastiche sin declarar es exactamente el caso del báculo: cada frase del texto puede ser cierta y el conjunto engañar, porque el lector cree estar recibiendo la autoridad de Borges, de Cervantes o de Harari cuando detrás hay una casa que escribe misiones para sus hijas. Enseñar a pedir la fuente de cada cifra y firmar con una voz prestada sería la contradicción más rápida posible. Hay además una razón técnica que es el contenido mismo: la etiqueta funciona como el encabezado que Sancho manda escribir con letra gruesa en cada memorial, el renglón que dice qué cosa es esto. Si se quitara pasarían dos cosas comprobables. La primera, que alguien citaría a Piketty, al IPCC o a Chetty a través de una frase que ninguno escribió, con lo cual la casa estaría produciendo justamente la cifra sin fuente que su propia etapa enseña a cazar. La segunda, que la lección quedaría desmentida por el ejemplo, que es la forma más eficaz de no enseñar nada.' },
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

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_dorado_facturas_v1';");

/* La pauta de la sección III (toma de decisiones) es una sola guía fija:
   aquí ordena la definición, la horquilla, la auditoría y quién paga. */
src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden, y el orden es el método. Primero se dice qué mide la cifra exactamente, con las palabras tecnicas y no con las del titular, porque la misma palabra nombra cosas distintas: ingreso no es riqueza, antes de impuestos no es despues de impuestos, y emisiones territoriales no son emisiones de consumo. Ese paso resuelve la mitad de los casos y casi nadie lo da. Despues va la fuente con su año, con nombre y no con un se dice que, y va la horquilla entera si la cifra tiene rango, señalando cual es la mejor estimacion; y si el titular tomo un extremo se dice cual y en que direccion empuja, porque el modo de fallar de esta etapa es escoger la punta del rango y lo cometen los dos bandos con el mismo informe. Luego entra la auditoria al lado y no debajo, igual que en toda esta ruta: Piketty de 2014 va con Rognlie de 2015, que mostro que casi todo el aumento de la participacion del capital viene de la vivienda, y con el episodio del Financial Times de 2014, al que Piketty respondio publicando sus datos; la curva del elefante de Lakner y Milanovic va con la objecion de Corlett de 2016 sobre que su forma depende de que paises entren; y los modelos del clima van con Pindyck de 2013, que advirtio desde dentro de la profesion que aparentan una precision que no tienen. Y de cada objecion se dice que queda en pie despues, porque casi siempre queda algo. Al final se separa lo que es dato de lo que es decision, que es la distincion mas util de la etapa: que llevamos alrededor de 1,1 grados esta medido, que haya que quedarse por debajo de 2 es una decision politica del Acuerdo de Paris de 2015, y la tasa de descuento, donde discrepan Stern y Nordhaus mirando la misma fisica, es una decision moral escrita como numero. Se cierra diciendo quien paga esa factura y en que plazo, y con el renglon que esta casa exige siempre: que dato haria cambiar la conclusion, escrito antes de discutir y no despues. Y encima de todo, el aviso que impide el error simetrico: que una cifra este mal usada no borra el problema que describe.";');

const textos = [
  [/🩸 \*Ruta del Expediente Dorado · Etapa 3\* 🩸\\n\\nLo que el dinero no debe comprar: decir «eso no se vende» es fácil; sostenerlo con un argumento que aguante es el trabajo\. 🩸\\n\\n_Incluye evaluación conceptual, el bien sobre la mesa, guion de video, tres lecturas y sus 35 preguntas\._ ✍️/g,
    '🌡️ *Ruta del Expediente Dorado · Etapa 4* 🌡️\\n\\nLas dos facturas: ninguna cifra entra sin decir qué mide, de dónde sale y entre qué números anda. 🌡️\\n\\n_Incluye evaluación conceptual, la cifra sobre la mesa, guion de video, tres lecturas y sus 35 preguntas._ ✍️'],
  /* los rótulos de las dos pruebas y de las hojas impresas */
  [/Lo que el dinero no debe comprar/g, 'Las dos facturas'],
  [/lo que el dinero no debe comprar/g, 'las dos facturas'],
  [/El bien sobre la mesa/g, 'La cifra sobre la mesa'],
  [/el bien sobre la mesa/g, 'la cifra sobre la mesa'],
  [/Etapa 3 de la Ruta del Expediente Dorado/g, 'Etapa 4 de la Ruta del Expediente Dorado'],
  [/Ruta del Expediente Dorado · Etapa 3 de 7/g, 'Ruta del Expediente Dorado · Etapa 4 de 7'],
  /* este vive en el encabezado de las dos pruebas imprimibles: no dice «de 7»
     sino «· Estudio Mayor», y es el que se le escapó al primer grep en
     misiones pasadas */
  [/Ruta del Expediente Dorado · Etapa 3 · Estudio Mayor/g, 'Ruta del Expediente Dorado · Etapa 4 · Estudio Mayor'],
  [/const msgs=\['¡Sigue llenando la hoja del bien!','¡Muy buen trabajo!','¡Aprendiz de criterio!','¡Ya distingues la justicia de la corrupción!','¡Muestras la pérdida y pagas la factura!'\]/,
    "const msgs=['¡Sigue llenando la hoja de la factura!','¡Muy buen trabajo!','¡Aprendiz de lectura de cifras!','¡Ya no escoges la punta del rango!','¡Pones la cifra de pie y dices quién paga!']"],
  [/\['#4c1d95','#a78bfa','#a8a29e','#a16207','#00b894'\]/, "['#115e59','#5eead4','#a8a29e','#c2410c','#00b894']"],
  /* el verde azulado profundo y el naranja quemado de la etapa */
  [/#4c1d95/g, '#115e59'],
  [/#2e1065/g, '#042f2e'],
  [/#f5f3ff/g, '#f0fdfa'],
  /* el ejemplo del generador de tareas venía de la etapa anterior */
  [/Son dos, y no una: la de justicia y la de corrupción\./g, 'Entre 2,5 y 4 °C, con 3 °C como mejor estimación.'],
  [/>Las dos objeciones</g, '>Una horquilla bien dicha<'],
  /* las preguntas fijas de la prueba competencial preguntaban por el bien */
  [/¿Cuál de las dos objeciones le cabe a este bien, y qué se pierde exactamente si se vende\? Nombra la fuente con su etiqueta y su contracrítica al lado, escoge una de las cuatro salidas, y calcula qué cuesta esa salida y a quién, contando también a los que pierden si se prohíbe\./g,
    '¿Qué mide exactamente esta cifra, de qué fuente y de qué año sale, y cuál es su horquilla? Nombra la auditoría que va al lado con su etiqueta, di si el titular tomó la punta o el centro, y separa lo que es dato de lo que es decisión, diciendo quién paga y en qué plazo.'],
  [/1\. ¿Cuál de los dos se puede llevar a una reunión donde haya que decidir, y cuál solo se puede repetir\? 2\. ¿Por qué no son la misma decisión\?/g,
    '1. ¿Cuál de los dos se puede comprobar y cuál solo se puede repetir? 2. ¿Por qué no enseñan lo mismo a quien los lee?'],
  /* el subtítulo del pliego de las tres lecturas */
  [/Un cuento, un capítulo de caballerías y un ensayo, sobre el mismo límite/g,
    'Un cuento, un capítulo de caballerías y un ensayo, sobre las mismas cifras'],
  /* los títulos de las tres lecturas, que viven en LECTURAS_IMPR */
  [/borges:\{titulo:'El catálogo de las cosas invendibles',tipo:'Cuento, a la manera de Jorge Luis Borges'\}/,
    "borges:{titulo:'El hombre que midió la lluvia',tipo:'Cuento, a la manera de Jorge Luis Borges'}"],
  [/cervantes:\{titulo:'De los azotes que se pusieron a precio, y de lo que sobre las cosas que el dinero estropea platicaron caballero y escudero',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'\}/,
    "cervantes:{titulo:'Del pleito del báculo, y de lo que Sancho sentenció sobre las cuentas que dicen verdad y engañan',tipo:'Capítulo, a la manera de Miguel de Cervantes Saavedra'}"],
  [/harari:\{titulo:'La especie que le puso precio a casi todo',tipo:'Ensayo, a la manera de Yuval Noah Harari'\}/,
    "harari:{titulo:'La especie que aprendió a medirse',tipo:'Ensayo, a la manera de Yuval Noah Harari'}"],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* La simulación de la etapa anterior era la multa de la guardería. Aquí es
   el titular del uno por ciento: el titular tal cual, o la cifra de pie. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(prueba){sfx(prueba?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(prueba){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">🌡️</span><span class="ms-text"><strong>Quedó anotada la cifra de pie:</strong> «el uno por ciento más rico tiene más <strong>riqueza neta</strong> que la mitad más pobre; riqueza neta es lo que se tiene menos lo que se debe, y por eso un graduado endeudado aparece más pobre que alguien sin deudas y sin tierra». Fuente y año al lado.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🧾</span><span class="ms-text"><strong>Y debajo, lo que no se puede olvidar:</strong> que el titular se lea mal <strong>no borra la concentración de la riqueza</strong>, que está medida por otras vías. Si lo que se quiere mostrar es concentración, sirven mejor <strong>las participaciones de ingreso y de riqueza publicadas con su metodología</strong>. Desarmar el titular es el principio del trabajo, no el final.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">📰</span><span class="ms-text"><strong>Quedó el titular tal cual:</strong> «el uno por ciento tiene más que la mitad del mundo». Es verdadero, viene de un informe serio y se comparte solo, que es justo el problema.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🪤</span><span class="ms-text"><strong>El costo llega en dos partes:</strong> quien lo lea se queda con un retrato que la cifra no sostiene, porque mide riqueza neta; y de camino queda enseñado que en esta casa <strong>una cifra se repite sin preguntar qué mide</strong>. Se tacha y se reescribe con la definición, la fuente y el año.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='desigualdad',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"desigualdad\"]')?.classList.add('active-pri');");

/* el emoji de la etapa anterior, en lo que quede del motor */
src = src.replace(/🩸/g, '🌡️');

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
