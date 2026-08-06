'use strict';

/* ─────────────────────────────────────────────
   CORRECTOR 🪶 · el corrector que enseña
   (vive dentro de Redacción, sobre la nota abierta)

   No es un corrector cualquiera: cada hallazgo lleva su PORQUÉ,
   con la norma vigente al lado, porque el objetivo no es solo
   limpiar el texto de hoy sino que quien escribe cometa ese error
   una vez menos mañana. Y lleva memoria: apunta qué reglas se te
   repiten entre nota y nota, para que veas tu propio progreso.

   Todo corre AQUÍ, en el aparato: ni una palabra del texto sale
   hacia ningún servicio externo. Mismo criterio que la bitácora y
   la papelera: los textos de la familia son de la familia.

   Lo que NO es: un diccionario completo. Las faltas de tecleo
   raras las subraya el teclado del aparato; esto caza los errores
   de norma que el teclado no entiende (tildes con historia,
   dequeísmo, «haber» impersonal, signos de abrir…) y los vicios
   de estilo que afean un artículo de revista.
───────────────────────────────────────────── */

const COR_STATS_KEY = 'faro_corrector_stats_v1';
const COR_L = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';

/* Palabra exacta con fronteras de verdad: el \b de JavaScript no
   entiende acentos (para él «é» ya es frontera) y \bfué\b nunca
   casaría. Se construye la frontera a mano. */
function corPal(alts) {
  return new RegExp(`(?<![${COR_L}])(?:${alts})(?![${COR_L}])`, 'giu');
}

/* Si lo corregido empezaba con mayúscula, la corrección la hereda */
function corMayus(original, sug) {
  if (!sug || !original) return sug;
  if (/^[A-ZÁÉÍÓÚÑ]/.test(original) && /^[a-záéíóúñ]/.test(sug)) {
    return sug[0].toUpperCase() + sug.slice(1);
  }
  return sug;
}

/* ── Las reglas ────────────────────────────────────────────────────
   Cada una: qué caza (re), qué propone (sug: cadena con $1 o función),
   de qué familia es (cat), si es segura (nivel 'error') o pide ojo
   humano ('revisa'), y —lo importante— el porqué que enseña. */
const COR_REGLAS = [

  /* ═══ ORTOGRAFÍA ═══ */
  {
    id: 'monosilabos', cat: 'ortografia', nivel: 'error',
    re: corPal('fué|fuí|dió|vió|fé|tí|ví'),
    sug: m => ({ 'fué': 'fue', 'fuí': 'fui', 'dió': 'dio', 'vió': 'vio', 'fé': 'fe', 'tí': 'ti', 'ví': 'vi' }[m.toLowerCase()]),
    titulo: 'Monosílabo con tilde',
    porque: 'Los monosílabos no llevan tilde, salvo los diacríticos que distinguen dos palabras (él/el, sé/se, más/mas). «Fue», «fui», «dio» y «vio» la perdieron oficialmente hace más de un siglo, y «ti» nunca la tuvo: se le contagia de «mí», que sí la lleva por ser diacrítica.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Fué un éxito para tí', bien: 'Fue un éxito para ti' },
  },
  {
    id: 'cion', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])([${COR_L}]{2,})(cion|sion)(es)?(?![${COR_L}])`, 'gu'),
    sug: m => null,   // se calcula en corSugCion (hay que poner la tilde en la o)
    titulo: 'Falta la tilde en -ción / -sión',
    porque: 'TODAS las palabras terminadas en -ción y -sión llevan tilde en singular: son agudas terminadas en n. En plural la pierden porque pasan a ser llanas: nación → naciones.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'la educacion y la mision', bien: 'la educación y la misión' },
  },
  {
    id: 'solo', cat: 'ortografia', nivel: 'revisa',
    re: corPal('sólo'),
    sug: () => 'solo',
    titulo: '«Sólo» con tilde',
    porque: 'Desde 2010 la RAE recomienda escribir «solo» sin tilde siempre, también cuando significa «solamente». Desde 2023 tildarlo es una licencia opcional ante ambigüedad, nunca una obligación: para la revista, mejor una sola forma.',
    norma: 'RAE · Ortografía 2010/2023',
    ejemplo: { mal: 'Sólo faltan dos días', bien: 'Solo faltan dos días' },
  },
  {
    id: 'demostrativos', cat: 'ortografia', nivel: 'error',
    re: corPal('éste|ésta|éstos|éstas|ése|ésa|ésos|ésas|aquél|aquélla|aquéllos|aquéllas'),
    sug: m => m.normalize('NFD').replace(/[̀]|́/g, '').normalize('NFC'),
    titulo: 'Demostrativo con tilde',
    porque: 'Este, ese y aquel —con sus femeninos y plurales— ya no se tildan nunca, ni siquiera cuando funcionan como pronombres. La vieja tilde diacrítica se eliminó en 2010 porque la ambigüedad real casi no existe.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Éste es el problema', bien: 'Este es el problema' },
  },
  {
    id: 'tilde-comun', cat: 'ortografia', nivel: 'error',
    re: corPal('ahi|asi|aqui|alli|tambien|ademas|despues|dificil|facil|ultimo|ultima|ultimos|ultimas|todavia|mayoria|dia|dias'),
    sug: m => ({ ahi: 'ahí', asi: 'así', aqui: 'aquí', alli: 'allí', tambien: 'también', ademas: 'además',
      despues: 'después', dificil: 'difícil', facil: 'fácil', ultimo: 'último', ultima: 'última',
      ultimos: 'últimos', ultimas: 'últimas', todavia: 'todavía', mayoria: 'mayoría', dia: 'día', dias: 'días' }[m.toLowerCase()]),
    titulo: 'Tilde que falta',
    porque: 'Palabras de uso diario que la llevan siempre: «así», «ahí», «también», «después», «día»… El teclado a veces las deja pasar porque existen como tecleo válido, pero la norma no las perdona.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'asi es mas facil', bien: 'así es más fácil' },
  },
  {
    id: 'pegadas', cat: 'ortografia', nivel: 'error',
    re: corPal('enmedio|osea|apesar|atravez|atraves|derrepente|alomejor|enserio'),
    sug: m => ({ enmedio: 'en medio', osea: 'o sea', apesar: 'a pesar', atravez: 'a través',
      atraves: 'a través', derrepente: 'de repente', alomejor: 'a lo mejor', enserio: 'en serio' }[m.toLowerCase()]),
    titulo: 'Palabras que van separadas',
    porque: 'Estas locuciones se escriben en dos (o tres) palabras: «en medio», «o sea», «a pesar», «a través», «de repente». Al oído van juntas, pero la escritura las separa. Y «a través» además lleva tilde.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'enmedio de la noche, osea, tiritando', bien: 'en medio de la noche, o sea, tiritando' },
  },
  {
    id: 'talvez', cat: 'ortografia', nivel: 'revisa',
    re: corPal('talvez|sobretodo'),
    sug: m => ({ talvez: 'tal vez', sobretodo: 'sobre todo' }[m.toLowerCase()]),
    titulo: '¿Junto o separado? Depende',
    porque: '«Tal vez» en dos palabras es la forma general; «talvez» junto está admitida en América (Honduras incluida), pero conviene elegir UNA para toda la revista. «Sobre todo» (= principalmente) va separado; «sobretodo» junto es un abrigo.',
    norma: 'RAE · DLE',
    ejemplo: { mal: 'sobretodo en invierno', bien: 'sobre todo en invierno' },
  },
  {
    id: 'haber-plural', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(habían|habrán|habrían|hubieron)\\s+(much[ao]s|vari[ao]s|algun[ao]s|un[ao]s|demasiad[ao]s|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|decenas|cientos|miles|\\d+)(?![${COR_L}])`, 'giu'),
    sug: m => null,   // se arma en corSugHaber
    titulo: '«Haber» impersonal, siempre en singular',
    porque: 'Cuando «haber» significa que algo existe, no tiene sujeto: es impersonal y va en singular. «Habían muchos niños» suena natural porque «muchos niños» parece el sujeto, pero es el complemento: hubo niños igual que hubo fiesta.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Habían muchos alumnos', bien: 'Había muchos alumnos' },
  },
  {
    id: 'haiga', cat: 'ortografia', nivel: 'error',
    re: corPal('haiga|haigan|nadien'),
    sug: m => ({ haiga: 'haya', haigan: 'hayan', nadien: 'nadie' }[m.toLowerCase()]),
    titulo: 'Forma popular que la norma no admite',
    porque: '«Haiga» es una forma antigua de «haya» que sobrevive en el habla, y «nadien» un cruce de «nadie» con «alguien». En conversación se entienden; en un texto de revista restan autoridad a quien firma.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'cuando haiga tiempo', bien: 'cuando haya tiempo' },
  },
  {
    id: 'astes', cat: 'gramatica', nivel: 'error',
    re: corPal('dijistes|hicistes|fuistes|vinistes|trajistes|llegastes|hablastes|pusistes|quisistes|pudistes|estuvistes|tuvistes|comistes|distes'),
    sug: m => m.slice(0, -1),
    titulo: 'El pretérito no termina en -s',
    porque: 'La segunda persona lleva -s en casi todos los tiempos (comes, comías, comerás)… excepto en el pretérito: dijiste, hiciste, fuiste. La -s de más se contagia de los otros tiempos, pero ahí nunca ha sido correcta.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'vos dijistes que sí', bien: 'vos dijiste que sí' },
  },
  {
    id: 'a-ha', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])a\\s+(hecho|sido|tenido|llegado|logrado|venido|comido|terminado|empezado|escrito|visto)(?![${COR_L}])`, 'giu'),
    sug: m => null,   // «a hecho» → «ha hecho»: se arma aparte
    titulo: '«A» por «ha»',
    porque: 'Delante de un participio (hecho, sido, tenido…) va el verbo haber: «ha hecho». La preposición «a» sin hache nunca acompaña al participio. Truco: si puedes decirlo en plural («han hecho»), es con h.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'el proyecto a tenido éxito', bien: 'el proyecto ha tenido éxito' },
  },
  {
    id: 'echo', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(he|has|ha|hemos|han|había|habías|habíamos|habían|habrá|habré|habría)\\s+echo(?![${COR_L}])`, 'giu'),
    sug: m => null,   // «ha echo» → «ha hecho»
    titulo: '«Echo» por «hecho»',
    porque: '«Hecho» viene de hacer y lleva h; «echo» viene de echar y no la lleva («echo de menos», «me echo una siesta»). Después de haber siempre es el participio de hacer: «ha hecho».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'lo han echo bien', bien: 'lo han hecho bien' },
  },
  {
    id: 'hechar', cat: 'ortografia', nivel: 'error',
    re: corPal('hechar|hechando|hechó|hechan|hecharon'),
    sug: m => m.replace(/^h/i, '').replace(/^E/, 'e'),
    titulo: '«Echar» no lleva h',
    porque: 'El verbo echar va sin hache en todas sus formas. La confusión nace de «hecho» (de hacer). Truco de escuela: «echar» ya echó la h fuera.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'van a hechar de menos', bien: 'van a echar de menos' },
  },
  {
    id: 'interrogativos', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(¿\\s*)(que|como|cuando|donde|cuanto|cuanta|cuantos|cuantas|quien|quienes|cual|cuales)(?![${COR_L}])`, 'giu'),
    sug: m => null,   // se arma en corSugInterrogativo
    titulo: 'Pregunta sin su tilde',
    porque: 'Qué, cómo, cuándo, dónde, cuánto, quién y cuál llevan tilde cuando preguntan o exclaman: es la tilde diacrítica que los distingue de sus gemelos átonos («que», «como»…). Dentro de «¿…?» casi siempre la llevan.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: '¿que pasó? ¿como fue?', bien: '¿qué pasó? ¿cómo fue?' },
  },
  {
    id: 'porque-sust', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(el|un|su|este|ese|aquel)\\s+porque(?![${COR_L}])`, 'giu'),
    sug: m => m.replace(/porque$/i, 'porqué'),
    titulo: '«El porqué», sustantivo con tilde',
    porque: 'Con artículo delante, «porqué» es un sustantivo que significa «el motivo» y lleva tilde: «el porqué de las cosas». Sin artículo, «porque» explica una causa y va sin tilde; «por qué» separado pregunta.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'no explicó el porque', bien: 'no explicó el porqué' },
  },

  /* ═══ GRAMÁTICA ═══ */
  {
    id: 'dequeismo', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(pienso|piensa|pensamos|creo|cree|creemos|opino|opinamos|considero|considera|consideramos|supongo|imagino|resulta|parece)\\s+de\\s+que(?![${COR_L}])`, 'giu'),
    sug: m => m.replace(/\s+de\s+que$/i, ' que'),
    titulo: 'Dequeísmo: sobra el «de»',
    porque: 'Estos verbos van directos con «que»: pienso que, creo que, parece que. La prueba del espejo: convierte la frase en pregunta — se dice «¿Qué piensas?», no «¿De qué piensas?» (con ese sentido); entonces el «de» sobra.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'pienso de que es tarde', bien: 'pienso que es tarde' },
  },
  {
    id: 'queismo', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(me di cuenta|se dio cuenta|nos dimos cuenta|te das cuenta|me alegro|se alegra|me acuerdo|se acuerda|estoy segur[oa]|estamos segur[oa]s|está segur[oa]|a pesar|con tal|en caso)\\s+que(?![${COR_L}])`, 'giu'),
    sug: m => m.replace(/\s+que$/i, ' de que'),
    titulo: 'Queísmo: falta el «de»',
    porque: 'El error espejo del dequeísmo: aquí el «de» es parte de la construcción y quitárselo la deja coja. La misma prueba al revés: se dice «¿De qué te diste cuenta?», así que es «darse cuenta DE que».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'me di cuenta que era tarde', bien: 'me di cuenta de que era tarde' },
  },
  {
    id: 'en-base-a', cat: 'gramatica', nivel: 'revisa',
    re: corPal('en base a'),
    sug: () => 'con base en',
    titulo: '«En base a», mejor evitarlo',
    porque: 'Locución muy extendida que la norma culta desaconseja: las cosas se sostienen CON base EN algo. Alternativas con más músculo: «con base en», «a partir de», «según».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'en base a los datos', bien: 'con base en los datos' },
  },
  {
    id: 'de-acuerdo-a', cat: 'gramatica', nivel: 'revisa',
    re: corPal('de acuerdo a'),
    sug: () => 'de acuerdo con',
    titulo: '«De acuerdo a» / «de acuerdo con»',
    porque: 'En América «de acuerdo a» corre con naturalidad y la RAE la registra, pero la forma preferida por la norma culta panhispánica —y la que mejor viste en una revista— es «de acuerdo con».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'de acuerdo a la ley', bien: 'de acuerdo con la ley' },
  },
  {
    id: 'relacion-a', cat: 'gramatica', nivel: 'revisa',
    re: corPal('en relación a'),
    sug: () => 'en relación con',
    titulo: '«En relación a», cruce de caminos',
    porque: 'Es el cruce de dos correctas: «en relación con» y «con relación a». El resultado mezclado se usa mucho, pero la norma pide cualquiera de las dos puras.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'en relación a su carta', bien: 'en relación con su carta' },
  },
  {
    id: 'a-el', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(a|de)\\s+el\\s(?=[a-záéíóúñ])`, 'gu'),
    sug: m => (m.trim().startsWith('a') ? 'al ' : 'del '),
    titulo: 'Contracción obligatoria: al / del',
    porque: '«A + el» y «de + el» se contraen SIEMPRE en «al» y «del»… salvo cuando El es parte de un nombre propio con mayúscula («viajó a El Progreso», «el diario de El Salvador»), que es justo cuando esta regla no salta.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'fue a el mercado', bien: 'fue al mercado' },
  },

  /* ═══ ESTILO ═══ */
  {
    id: 'duplicada', cat: 'estilo', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])([${COR_L}]+)\\s+\\1(?![${COR_L}])`, 'giu'),
    sug: m => m.replace(/\s+\S+$/, ''),
    titulo: 'Palabra repetida seguida',
    porque: 'Un clásico del tecleo y del cortar-y-pegar: «el el proyecto», «que que». El ojo la salta al releer porque el cerebro corrige solo; por eso conviene que la busque una máquina.',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'en el el aula', bien: 'en el aula' },
  },
  {
    id: 'muletillas', cat: 'estilo', nivel: 'revisa',
    re: corPal('cabe destacar que|cabe mencionar que|es importante mencionar que|es importante destacar que|vale la pena mencionar que|dicho esto|a día de hoy|hoy por hoy|en el marco de'),
    sug: null,
    titulo: 'Muletilla de relleno',
    porque: 'Frases que ocupan renglón sin decir nada: si algo no fuera importante, no lo escribirías. Casi siempre la oración mejora quitándolas enteras y dejando que el dato hable: en vez de «cabe destacar que ganó», simplemente «ganó».',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'Cabe destacar que ganó el premio', bien: 'Ganó el premio' },
  },
];

/* Sugerencias que necesitan armarse con las piezas del match */
function corSugerencia(regla, m) {
  const t = m[0];
  if (regla.id === 'cion') {
    const acento = { cion: 'ción', sion: 'sión' }[m[2].toLowerCase()];
    return m[3] ? null : corMayus(t, m[1] + acento);   // el plural (naciones) es correcto
  }
  if (regla.id === 'haber-plural') {
    const v = { 'habían': 'había', 'habrán': 'habrá', 'habrían': 'habría', 'hubieron': 'hubo' }[m[1].toLowerCase()];
    return corMayus(t, `${v} ${m[2]}`);
  }
  if (regla.id === 'a-ha')  return corMayus(t, t.replace(/^a(?=\s)/i, 'ha'));
  if (regla.id === 'echo')  return t.replace(/echo$/i, 'hecho');
  if (regla.id === 'interrogativos') {
    const con = { que: 'qué', como: 'cómo', cuando: 'cuándo', donde: 'dónde', cuanto: 'cuánto',
      cuanta: 'cuánta', cuantos: 'cuántos', cuantas: 'cuántas', quien: 'quién', quienes: 'quiénes',
      cual: 'cuál', cuales: 'cuáles' }[m[2].toLowerCase()];
    return m[1] + con;
  }
  if (typeof regla.sug === 'function') {
    const s = regla.sug(t);
    return s === null || s === undefined ? null : corMayus(t, s);
  }
  return null;
}

/* La palabra duplicada legítima existe («había había»… no; pero «muy muy»
   coloquial sí): las poquitas aceptables se dejan pasar. */
const COR_DUP_OK = new Set(['muy', 'ya', 'no']);

/* ── Extraer el texto con su mapa ─────────────────────────────────
   El cuerpo es HTML (negritas, fuentes, marcas de cita). Se recorre
   y se arma UNA cadena de texto plano junto con el mapa de qué nodo
   del DOM aporta cada tramo: así los hallazgos se pueden aplicar
   sin tocar las etiquetas ni las citas. Las marcas [n] se sustituyen
   por un separador para que ninguna regla case «a través» de ellas. */
function corMapaCuerpo() {
  const cuerpo = document.getElementById('red-e-cuerpo');
  const estado = { texto: '', tramos: [] };
  if (!cuerpo) return estado;
  (function anda(nodo) {
    nodo.childNodes.forEach(ch => {
      if (ch.nodeType === Node.TEXT_NODE) {
        estado.tramos.push({ node: ch, ini: estado.texto.length, fin: estado.texto.length + ch.nodeValue.length });
        estado.texto += ch.nodeValue;
        return;
      }
      if (ch.nodeType !== Node.ELEMENT_NODE) return;
      if (ch.matches && ch.matches('sup.red-cita')) { estado.texto += '￼'; return; }
      if (ch.tagName === 'BR') { estado.texto += '\n'; return; }
      anda(ch);
      if (/^(DIV|P|LI|H[1-6])$/.test(ch.tagName)) estado.texto += '\n';
    });
  })(cuerpo);
  return estado;
}

/* Oraciones con sus posiciones. El punto de una abreviatura corriente
   (pág., Prof., etc.) no cierra oración. */
const COR_ABREV = /(?:págs?|sr|sra|srta|dr|dra|prof|ing|lic|abg|núm|arts?|cap|vol|ed|pp?|ej|etc|ee|uu)$/i;
function corOraciones(texto) {
  const out = [];
  let ini = 0;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '\n' || ((c === '.' || c === '!' || c === '?' || c === '…') &&
        !(c === '.' && COR_ABREV.test((texto.slice(Math.max(0, i - 6), i).match(new RegExp(`[${COR_L}]+$`, 'u')) || [''])[0])))) {
      const fin = i + 1;
      if (texto.slice(ini, fin).trim()) out.push({ ini, fin, txt: texto.slice(ini, fin) });
      ini = fin;
    }
  }
  if (texto.slice(ini).trim()) out.push({ ini, fin: texto.length, txt: texto.slice(ini) });
  return out;
}

const COR_STOP = new Set(['sobre', 'entre', 'hasta', 'desde', 'porque', 'cuando', 'donde', 'mientras',
  'aunque', 'también', 'además', 'estos', 'estas', 'otros', 'otras', 'todos', 'todas', 'mismo', 'misma',
  'puede', 'pueden', 'tiene', 'tienen', 'hacer', 'haber', 'estar', 'según', 'quien', 'quienes']);

/* ── El análisis completo de un campo de texto ── */
function corAnalizarTexto(texto, campo) {
  const hallazgos = [];

  for (const regla of COR_REGLAS) {
    regla.re.lastIndex = 0;
    let m;
    while ((m = regla.re.exec(texto))) {
      if (regla.id === 'cion' && m[3]) continue;                   // plural: correcto
      if (regla.id === 'duplicada' && COR_DUP_OK.has(m[1].toLowerCase())) continue;
      const sug = corSugerencia(regla, m);
      hallazgos.push({ campo, ini: m.index, fin: m.index + m[0].length,
        original: m[0], sugerencia: sug, regla });
      if (m.index === regla.re.lastIndex) regla.re.lastIndex++;   // por si el patrón casa vacío
    }
  }

  /* Reglas de oración */
  const oraciones = corOraciones(texto);
  const R_ABRIR_INT = {
    id: 'abrir-pregunta', cat: 'tipografia', nivel: 'error', titulo: 'Pregunta sin abrir',
    porque: 'El español abre y cierra: ¿…? El signo de apertura existe porque —a diferencia del inglés— aquí nada al inicio de la frase avisa de que viene una pregunta; sin él, el lector entona mal y relee.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Qué haremos ahora?', bien: '¿Qué haremos ahora?' },
  };
  const R_ABRIR_EXC = Object.assign({}, R_ABRIR_INT,
    { id: 'abrir-exclamacion', titulo: 'Exclamación sin abrir',
      ejemplo: { mal: 'Qué gran noticia!', bien: '¡Qué gran noticia!' } });
  const R_MAYUS = {
    id: 'mayuscula', cat: 'tipografia', nivel: 'revisa', titulo: 'Minúscula tras punto',
    porque: 'Después de punto, mayúscula. Se marca como «revísalo» porque a veces el punto es de una abreviatura y la frase sigue.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Terminó. luego se fue', bien: 'Terminó. Luego se fue' },
  };
  const R_LARGA = {
    id: 'oracion-larga', cat: 'estilo', nivel: 'revisa', titulo: 'Oración kilométrica',
    porque: 'Más de 45 palabras sin un punto: el lector llega al final sin aire y sin recordar el inicio. Casi siempre hay dos o tres ideas ahí dentro pidiendo su propia oración. El punto es gratis.',
    norma: 'Estilo periodístico',
    ejemplo: null,
  };
  const R_ECO = {
    id: 'eco', cat: 'estilo', nivel: 'revisa', titulo: 'Palabra que hace eco',
    porque: 'La misma palabra dos veces en pocas líneas resuena al leer en voz alta —y una revista se lee con el oído. Un sinónimo, un pronombre o reordenar la frase deshacen el eco.',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'El proyecto del proyecto educativo', bien: 'El proyecto del plan educativo' },
  };
  const R_MENTE = {
    id: 'mente', cat: 'estilo', nivel: 'revisa', titulo: 'Racimo de adverbios en -mente',
    porque: 'Tres o más «-mente» en un mismo párrafo cargan el ritmo (realmente, obviamente, claramente…). Suele bastar uno; los demás se cambian por formas cortas: «con claridad», «de verdad», o nada.',
    norma: 'Estilo periodístico',
    ejemplo: null,
  };

  oraciones.forEach(o => {
    const abre = o.txt.includes('¿'), cierra = o.txt.includes('?');
    if (cierra && !abre) {
      const off = o.ini + (o.txt.match(/^\s*/)[0] || '').length;
      hallazgos.push({ campo, ini: off, fin: off, original: '', sugerencia: '¿', regla: R_ABRIR_INT });
    }
    const abreE = o.txt.includes('¡'), cierraE = o.txt.includes('!');
    if (cierraE && !abreE) {
      const off = o.ini + (o.txt.match(/^\s*/)[0] || '').length;
      hallazgos.push({ campo, ini: off, fin: off, original: '', sugerencia: '¡', regla: R_ABRIR_EXC });
    }
    const m0 = o.txt.match(/^(\s*)([a-záéíóúñ])/u);
    if (m0 && o.ini > 0) {
      const off = o.ini + m0[1].length;
      hallazgos.push({ campo, ini: off, fin: off + 1, original: m0[2],
        sugerencia: m0[2].toUpperCase(), regla: R_MAYUS });
    }
    const palabras = o.txt.split(/\s+/).filter(Boolean);
    if (palabras.length > 45) {
      hallazgos.push({ campo, ini: o.ini, fin: o.fin, original: o.txt.trim(), sugerencia: null, regla: R_LARGA });
    }
    /* eco dentro de la oración */
    const tokens = [];
    const reTok = new RegExp(`[${COR_L}]{5,}`, 'gu');
    let mt;
    while ((mt = reTok.exec(o.txt))) tokens.push({ w: mt[0].toLowerCase(), ini: o.ini + mt.index, fin: o.ini + mt.index + mt[0].length });
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length && j <= i + 12; j++) {
        if (tokens[i].w === tokens[j].w && !COR_STOP.has(tokens[i].w)) {
          hallazgos.push({ campo, ini: tokens[j].ini, fin: tokens[j].fin,
            original: tokens[j].w, sugerencia: null, regla: R_ECO });
          i = j; break;
        }
      }
    }
  });

  /* -mente por párrafo */
  texto.split('\n').reduce((pos, parrafo) => {
    const ms = [...parrafo.matchAll(new RegExp(`[${COR_L}]{3,}mente(?![${COR_L}])`, 'giu'))];
    if (ms.length >= 3) {
      const t = ms[2];
      hallazgos.push({ campo, ini: pos + t.index, fin: pos + t.index + t[0].length,
        original: t[0], sugerencia: null, regla: R_MENTE });
    }
    return pos + parrafo.length + 1;
  }, 0);

  /* Tipografía fina */
  const R_DOBLE = {
    id: 'doble-espacio', cat: 'tipografia', nivel: 'error', titulo: 'Doble espacio',
    porque: 'Dos espacios seguidos se cuelan al teclear y en la maqueta se ven como un hueco. En imprenta, después de punto también va UNO.',
    norma: 'Ortotipografía', ejemplo: null,
  };
  const R_ANTES = {
    id: 'espacio-antes', cat: 'tipografia', nivel: 'error', titulo: 'Espacio antes del signo',
    porque: 'La coma, el punto y sus hermanos van pegados a la palabra que los precede y separados de la que sigue: «así, no» y nunca «así , no».',
    norma: 'Ortotipografía', ejemplo: { mal: 'la escuela , dijo', bien: 'la escuela, dijo' },
  };
  const R_DESPUES = {
    id: 'espacio-despues', cat: 'tipografia', nivel: 'error', titulo: 'Falta espacio tras el signo',
    porque: 'Tras coma o punto y coma va un espacio. Pegar la palabra siguiente hace tropezar la lectura y confunde al corrector de la maqueta.',
    norma: 'Ortotipografía', ejemplo: { mal: 'uno,dos', bien: 'uno, dos' },
  };
  let m2;
  const reDoble = / {2,}/g;
  while ((m2 = reDoble.exec(texto))) hallazgos.push({ campo, ini: m2.index, fin: m2.index + m2[0].length, original: m2[0], sugerencia: ' ', regla: R_DOBLE });
  const reAntes = /[  ]+([,.;:!?])/g;
  while ((m2 = reAntes.exec(texto))) hallazgos.push({ campo, ini: m2.index, fin: m2.index + m2[0].length, original: m2[0], sugerencia: m2[1], regla: R_ANTES });
  const reDespues = new RegExp(`([,;])(?=[${COR_L}])`, 'gu');
  while ((m2 = reDespues.exec(texto))) hallazgos.push({ campo, ini: m2.index, fin: m2.index + 1, original: m2[1], sugerencia: m2[1] + ' ', regla: R_DESPUES });

  /* Sin solapes: gana el que empieza antes (y el más largo si empatan) */
  hallazgos.sort((a, b) => a.ini - b.ini || b.fin - a.fin);
  const limpios = [];
  let tope = -1;
  for (const h of hallazgos) {
    if (h.ini < tope && h.fin > h.ini) continue;
    limpios.push(h);
    tope = Math.max(tope, h.fin);
  }
  return limpios;
}

/* ── Analizar la nota entera: título, entradilla y cuerpo ── */
let _corHallazgos = [];
let _corMapa = null;
let _corStatsContadas = false;

function corAnalizar() {
  _corMapa = corMapaCuerpo();
  const titulo = document.getElementById('red-e-titulo');
  const entrad = document.getElementById('red-e-entradilla');
  _corHallazgos = [
    ...corAnalizarTexto(titulo ? titulo.value : '', 'titulo'),
    ...corAnalizarTexto(entrad ? entrad.value : '', 'entradilla'),
    ...corAnalizarTexto(_corMapa.texto, 'cuerpo'),
  ];
  return _corHallazgos;
}

/* ── La memoria del aprendiz ──────────────────────────────────────
   Cuenta cuántas veces ha aparecido cada regla, entre notas y entre
   días. No para regañar: para que el escritor VEA qué se le repite
   y celebre cuando deje de aparecer. */
function corStatsLoad() {
  try { return JSON.parse(localStorage.getItem(COR_STATS_KEY)) || {}; } catch (_) { return {}; }
}
function corStatsContar(hallazgos) {
  if (_corStatsContadas) return;      // solo la primera pasada de cada sesión
  _corStatsContadas = true;
  const st = corStatsLoad();
  hallazgos.forEach(h => {
    st[h.regla.id] = st[h.regla.id] || { n: 0, titulo: h.regla.titulo };
    st[h.regla.id].n++;
    st[h.regla.id].titulo = h.regla.titulo;
  });
  try { localStorage.setItem(COR_STATS_KEY, JSON.stringify(st)); } catch (_) {}
}

/* ── Aplicar una corrección sin romper el HTML ── */
function corAplicar(h) {
  if (h.sugerencia === null || h.sugerencia === undefined) return false;

  if (h.campo === 'titulo' || h.campo === 'entradilla') {
    const el = document.getElementById(h.campo === 'titulo' ? 'red-e-titulo' : 'red-e-entradilla');
    if (!el) return false;
    el.value = el.value.slice(0, h.ini) + h.sugerencia + el.value.slice(h.fin);
    return true;
  }

  /* En el cuerpo: localizar el tramo (nodo de texto) que contiene el rango */
  const tramo = _corMapa.tramos.find(t => t.ini <= h.ini && h.fin <= t.fin);
  if (!tramo) return false;   // partido por formato: se corrige a mano
  const rel0 = h.ini - tramo.ini, rel1 = h.fin - tramo.ini;
  const v = tramo.node.nodeValue;
  tramo.node.nodeValue = v.slice(0, rel0) + h.sugerencia + v.slice(rel1);
  return true;
}

/* ¿Se puede aplicar sola? (tiene sugerencia y no cruza etiquetas) */
function corEsAplicable(h) {
  if (h.sugerencia === null || h.sugerencia === undefined) return false;
  if (h.campo !== 'cuerpo') return true;
  return !!_corMapa.tramos.find(t => t.ini <= h.ini && h.fin <= t.fin);
}

/* ── La vista de resultados ── */
const COR_CATS = {
  ortografia: { nombre: 'Ortografía', cls: 'cor-cat-orto' },
  gramatica:  { nombre: 'Gramática',  cls: 'cor-cat-gram' },
  estilo:     { nombre: 'Estilo',     cls: 'cor-cat-estilo' },
  tipografia: { nombre: 'Tipografía', cls: 'cor-cat-tipo' },
};
const COR_CAMPOS = { titulo: 'Título', entradilla: 'Entradilla', cuerpo: '' };

function corExtracto(h) {
  let texto;
  if (h.campo === 'cuerpo') texto = _corMapa.texto;
  else texto = (document.getElementById(h.campo === 'titulo' ? 'red-e-titulo' : 'red-e-entradilla') || { value: '' }).value;
  const ini = Math.max(0, h.ini - 28), fin = Math.min(texto.length, h.fin + 28);
  const antes = (ini > 0 ? '…' : '') + texto.slice(ini, h.ini);
  const despues = texto.slice(h.fin, fin) + (fin < texto.length ? '…' : '');
  const marcado = h.original || '⟨aquí⟩';
  return `${redEsc(antes)}<mark>${redEsc(marcado)}</mark>${redEsc(despues)}`.replace(/\n/g, ' ');
}

function corRender() {
  const lista = document.getElementById('cor-lista');
  const resumen = document.getElementById('cor-resumen');
  if (!lista) return;

  const hs = _corHallazgos;
  const porCat = {};
  hs.forEach(h => { porCat[h.regla.cat] = (porCat[h.regla.cat] || 0) + 1; });
  const seguras = hs.filter(h => h.regla.nivel === 'error' && corEsAplicable(h));

  resumen.innerHTML = hs.length
    ? Object.keys(COR_CATS).filter(c => porCat[c]).map(c =>
        `<span class="cor-chip ${COR_CATS[c].cls}">${COR_CATS[c].nombre} · ${porCat[c]}</span>`).join('') +
      (seguras.length ? `<button type="button" class="cor-aplicar-todo" id="cor-aplicar-todo">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Corregir las ${seguras.length} seguras</button>` : '')
    : '<div class="cor-limpio">✨ Ni un hallazgo. El texto está limpio de todo lo que este corrector sabe mirar.</div>';

  /* La memoria: lo que más se repite entre notas */
  const st = corStatsLoad();
  const top = Object.entries(st).filter(([, v]) => v.n >= 3)
    .sort((a, b) => b[1].n - a[1].n).slice(0, 3);
  const memoria = document.getElementById('cor-memoria');
  memoria.innerHTML = top.length
    ? '<div class="cor-memoria-t">📈 Lo que más se te repite (todas tus notas)</div>' +
      top.map(([, v]) => `<div class="cor-memoria-item">${redEsc(v.titulo)} · <b>${v.n} veces</b></div>`).join('') +
      '<div class="cor-memoria-pie">Cuando una de estas deje de aparecer, ya no será un error tuyo: será historia.</div>'
    : '';

  lista.innerHTML = hs.map((h, i) => {
    const cat = COR_CATS[h.regla.cat];
    const aplicable = corEsAplicable(h);
    return `
    <div class="cor-card">
      <div class="cor-card-head">
        <span class="cor-chip ${cat.cls}">${cat.nombre}</span>
        ${COR_CAMPOS[h.campo] ? `<span class="cor-chip cor-chip-campo">${COR_CAMPOS[h.campo]}</span>` : ''}
        ${h.regla.nivel === 'revisa' ? '<span class="cor-chip cor-chip-revisa">revísalo tú</span>' : ''}
        <span class="cor-card-titulo">${redEsc(h.regla.titulo)}</span>
      </div>
      <div class="cor-extracto">${corExtracto(h)}</div>
      ${h.sugerencia !== null && h.sugerencia !== undefined && h.original !== h.sugerencia
        ? `<div class="cor-cambio">${redEsc(h.original || '∅')} <i class="fa-solid fa-arrow-right"></i> <b>${redEsc(h.sugerencia)}</b></div>` : ''}
      <div class="cor-porque">${h.regla.porque} <span class="cor-norma">${redEsc(h.regla.norma)}</span></div>
      ${h.regla.ejemplo ? `<div class="cor-ejemplo">✗ ${redEsc(h.regla.ejemplo.mal)}<br>✓ ${redEsc(h.regla.ejemplo.bien)}</div>` : ''}
      ${aplicable
        ? `<button type="button" class="cor-btn-aplicar" data-cor="${i}"><i class="fa-solid fa-check"></i> Corregir</button>`
        : (h.sugerencia !== null && h.sugerencia !== undefined
            ? '<div class="cor-mano">Está partido por formato: corrígelo a mano en el texto.</div>' : '')}
    </div>`;
  }).join('');

  lista.querySelectorAll('[data-cor]').forEach(btn =>
    btn.addEventListener('click', () => {
      const h = _corHallazgos[Number(btn.dataset.cor)];
      if (h && corAplicar(h)) {
        redQueueSave();
        corAnalizar();
        corRender();
        if (typeof toast === 'function') toast('✅ Corregido');
      }
    }));

  document.getElementById('cor-aplicar-todo')?.addEventListener('click', () => {
    /* De atrás hacia adelante para que los desplazamientos no muevan
       los rangos de lo que falta */
    let n = 0;
    [...seguras].sort((a, b) => b.ini - a.ini).forEach(h => { if (corAplicar(h)) n++; });
    redQueueSave();
    corAnalizar();
    corRender();
    if (typeof toast === 'function') toast(`✅ ${n} correcciones aplicadas`);
  });
}

function corAbrir() {
  const overlay = document.getElementById('cor-overlay');
  if (!overlay || typeof redNota !== 'function' || !redNota()) return;
  _corStatsContadas = false;
  corAnalizar();
  corStatsContar(_corHallazgos);
  corRender();
  overlay.style.display = 'flex';
}

function corCerrar() {
  const overlay = document.getElementById('cor-overlay');
  if (overlay) overlay.style.display = 'none';
}

/* ── Wiring ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('red-corr-btn')?.addEventListener('click', corAbrir);
  document.getElementById('cor-close')?.addEventListener('click', corCerrar);
  document.getElementById('cor-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'cor-overlay') corCerrar();
  });
});
