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

   Dos motores trabajan juntos:
   · Las REGLAS de este archivo cazan los errores de norma que un
     diccionario no ve (tildes con historia, dequeísmo, «haber»
     impersonal, signos de abrir…) y los vicios de estilo que
     afean un artículo de revista. Cada una con su porqué.
   · El DICCIONARIO (js/tools/diccionario.js, 570.000 formas del
     español expandidas de es_HN) caza las palabras que no existen:
     «conveza», «filosfía», la tilde en la sílaba equivocada. Se
     carga en segundo plano la primera vez y propone con qué
     sustituir cada tecleo.
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
   humano ('revisa'), y (lo importante) el porqué que enseña. */
const COR_REGLAS = [

  /* ═══ ORTOGRAFÍA ═══ */
  {
    id: 'monosilabos', cat: 'ortografia', nivel: 'error',
    re: corPal('fué|fuí|dió|vió|fé|tí|ví'),
    sug: m => ({ 'fué': 'fue', 'fuí': 'fui', 'dió': 'dio', 'vió': 'vio', 'fé': 'fe', 'tí': 'ti', 'ví': 'vi' }[m.toLowerCase()]),
    titulo: 'Monosílabo con tilde',
    porque: 'Los monosílabos no llevan tilde, salvo los diacríticos que distinguen dos palabras (él/el, sé/se, más/mas). «Fue», «fui», «dio» y «vio» la perdieron oficialmente a mediados del siglo XX (Nuevas normas de 1959), y «ti» nunca la tuvo: se le contagia de «mí», que sí la lleva por ser diacrítica.',
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
    id: 'demostrativos', cat: 'ortografia', nivel: 'revisa',
    re: corPal('éste|ésta|éstos|éstas|ése|ésa|ésos|ésas|aquél|aquélla|aquéllos|aquéllas'),
    sug: m => m.normalize('NFD').replace(/[̀]|́/g, '').normalize('NFC'),
    titulo: 'Demostrativo con tilde',
    porque: 'Desde 2010 la RAE recomienda no tildar nunca este, ese y aquel, tampoco cuando funcionan como pronombres; desde 2023, tildarlos ante una ambigüedad real es licencia opcional del que escribe, no obligación. Como con «solo»: para la revista, mejor una sola forma, sin tilde.',
    norma: 'RAE · Ortografía 2010/2023',
    ejemplo: { mal: 'Éste es el problema', bien: 'Este es el problema' },
  },
  {
    id: 'tilde-comun', cat: 'ortografia', nivel: 'error',
    // «ultimo/ultima/ultimas» salieron de esta lista: son formas
    // válidas del verbo ultimar («la comisión ultima los detalles»);
    // el caso seguro (con artículo delante) lo caza ultimo-con-articulo.
    re: corPal('ahi|asi|aqui|alli|tambien|ademas|despues|dificil|facil|ultimos|todavia|mayoria|dia|dias'),
    sug: m => ({ ahi: 'ahí', asi: 'así', aqui: 'aquí', alli: 'allí', tambien: 'también', ademas: 'además',
      despues: 'después', dificil: 'difícil', facil: 'fácil',
      ultimos: 'últimos', todavia: 'todavía', mayoria: 'mayoría', dia: 'día', dias: 'días' }[m.toLowerCase()]),
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
    /* Tres cautelas de la verificación filológica: (1) «que» se fue a
       su propia regla 'revisa' (que-pregunta): «¿Que no quiere gas?»
       (eco, sin tilde) es correcto y hasta ejemplo del DPD. (2) La
       pregunta puede arrancar con átono: «¿Y como te fue?» también
       cae. (3) «cuando» con coma dentro de la pregunta suele ser
       subordinada legítima («¿Cuando termine la lluvia, salimos?»)
       y no salta. */
    re: new RegExp(`(¿\\s*(?:(?:y|pero|entonces|bueno|o)\\s+)?)(como|donde|cuanto|cuanta|cuantos|cuantas|quien|quienes|cual|cuales|cuando(?![^?\\n]*,))(?![${COR_L}])`, 'giu'),
    sug: m => null,   // se arma en corSugInterrogativo
    titulo: 'Pregunta sin su tilde',
    porque: 'Cómo, cuándo, dónde, cuánto, quién y cuál llevan tilde cuando preguntan o exclaman: es la tilde diacrítica que los distingue de sus gemelos átonos («como», «cuando»…). Dentro de «¿…?» casi siempre la llevan.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: '¿como fue? ¿y cuando vienes?', bien: '¿cómo fue? ¿y cuándo vienes?' },
  },
  {
    id: 'porque-sust', cat: 'ortografia', nivel: 'error',
    // Sin este|ese|aquel: como pronombres van con «porque» causal y
    // la frase es impecable («prefiero este porque es más barato»).
    re: new RegExp(`(?<![${COR_L}])(el|un|su)\\s+porque(?![${COR_L}])`, 'giu'),
    sug: m => m.replace(/porque$/i, 'porqué'),
    titulo: '«El porqué», sustantivo con tilde',
    porque: 'Con artículo delante, «porqué» es un sustantivo que significa «el motivo» y lleva tilde: «el porqué de las cosas». Sin artículo, «porque» explica una causa y va sin tilde; «por qué» separado pregunta.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'no explicó el porque', bien: 'no explicó el porqué' },
  },

  /* ═══ GRAMÁTICA ═══ */
  {
    id: 'dequeismo', cat: 'gramatica', nivel: 'error',
    // «resulta» salió de la lista: «resultar DE algo» es régimen
    // legítimo («su fama resulta de que nunca miente»).
    re: new RegExp(`(?<![${COR_L}])(pienso|piensa|pensamos|creo|cree|creemos|opino|opinamos|considero|considera|consideramos|supongo|imagino|parece)\\s+de\\s+que(?![${COR_L}])`, 'giu'),
    sug: m => m.replace(/\s+de\s+que$/i, ' que'),
    titulo: 'Dequeísmo: sobra el «de»',
    porque: 'Estos verbos van directos con «que»: pienso que, creo que, parece que. La prueba del espejo: convierte la frase en pregunta: se dice «¿Qué piensas?», no «¿De qué piensas?» (con ese sentido); entonces el «de» sobra.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'pienso de que es tarde', bien: 'pienso que es tarde' },
  },
  {
    id: 'queismo', cat: 'gramatica', nivel: 'error',
    // «con tal» salió de la lista: «con tal que» es variante válida
    // registrada por el DPD (con tal (de) que).
    re: new RegExp(`(?<![${COR_L}])(me di cuenta|se dio cuenta|nos dimos cuenta|te das cuenta|me alegro|se alegra|me acuerdo|se acuerda|estoy segur[oa]|estamos segur[oa]s|está segur[oa]|a pesar|en caso)\\s+que(?![${COR_L}])`, 'giu'),
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
    porque: 'En América «de acuerdo a» corre con naturalidad y la RAE la registra, pero la forma preferida por la norma culta panhispánica (y la que mejor viste en una revista) es «de acuerdo con».',
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

  /* ═══ AQUÍ-REGLAS-AMPLIADAS ═══
     (las reglas de abajo se autoraron con ayuda y se verificaron una
     a una contra pruebas y contra el corpus de la casa; el marcador
     lo usa _dev/fusiona-reglas.js para regenerarlas) */
  {
    id: 'haber-si', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?<!(?:pued[ea]n?|podrían?|pudier[ao]n?|pudiesen?|deb[ea]n?|deberían?|debían?|suel[ea]n?|podían?) )(?<! a )haber si(?![${COR_L}])`, 'giu'),
    sug: () => 'a ver si',
    titulo: '«Haber si» por «a ver si»',
    porque: '«A ver si» viene del verbo ver: es un «veamos si» encogido («a ver si llueve»). «Haber» es el infinitivo de haber y nunca abre esa expresión de expectativa. Truco: si puedes decir «veamos si…», va separado y con v.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Haber si nos vemos pronto', bien: 'A ver si nos vemos pronto' },
  },
  {
    id: 'vamos-haber', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(vamos|voy|vas) haber(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' a ver',
    titulo: '«Vamos haber» por «vamos a ver»',
    porque: 'Lo que vamos a hacer es VER (mirar, comprobar), así que hacen falta tres piezas: vamos + a + ver. «Haber» pegado se come la preposición y cambia el verbo. Truco: si puedes responder «sí, ve tú», era el verbo ver.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'vamos haber qué pasa', bien: 'vamos a ver qué pasa' },
  },
  {
    id: 'clitico-echo', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(te|me|le|les|lo|los|la|las|nos|os) hecho ((?:mucho|muchísimo|tanto|tantísimo|bastante|harto|un montón) )?(de menos|en falta)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' echo ' + (m[2] || '') + m[3],
    titulo: '«Te hecho de menos» por «te echo»',
    porque: 'Extrañar a alguien es echarlo de menos, del verbo echar, que va sin h en todas sus formas. «Hecho» con h es el participio de hacer («lo has hecho bien»). Truco de escuela: echar ya echó la h fuera.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'te hecho de menos', bien: 'te echo de menos' },
  },
  {
    id: 'has-imperativo', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])has (caso|clic|clics|memoria|el favor|de cuenta)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'haz ' + m[1],
    titulo: '«Has caso» por «haz caso»',
    porque: 'La orden de hacer algo es «haz», imperativo de hacer: haz caso, haz clic, haz el favor. «Has» con s es del verbo haber y acompaña a un participio («has hecho caso») o abre «has de + infinitivo» («has de saber»). Truco: si estás mandando, termina en z.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'has clic en el botón azul', bien: 'haz clic en el botón azul' },
  },
  {
    id: 'haz-auxiliar', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?<!el )(?<!un )(?<!del )(?<!al )(?<!este )(?<!ese )(?<!aquel )haz (?!dicho (?:ejercicio|ejemplo|trámite|documento|problema|procedimiento|texto|paso|dibujo))(sido|hecho|dicho|estado|tenido|visto|puesto|escrito|llegado|venido|logrado|terminado|comido|ganado|perdido|entendido|aprendido|pensado|querido|podido|sabido|dado|leído|oído|vivido|trabajado|jugado|empezado|estudiado|olvidado)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'has ' + m[1],
    titulo: '«Haz sido» por «has sido»',
    porque: 'Delante de un participio (sido, hecho, visto…) va el auxiliar haber: «has sido», «has visto». «Haz» con z es la orden de hacer («haz la tarea»). Truco: si puedes decirlo con «yo he…», la segunda persona es «tú has…» con s.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'haz sido muy amable', bien: 'has sido muy amable' },
  },
  {
    id: 'halla-haya-participio', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?<!se )(?<!lo )(?<!la )(?<!los )(?<!las )halla(n?) (sido|hecho|estado|tenido|habido|podido|querido|sabido|dicho|visto|dado|puesto|llegado|venido|salido|pasado|terminado|empezado|logrado|ocurrido|sucedido|cambiado|aprendido|entendido)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'haya' + m[1] + ' ' + m[2],
    titulo: '«Halla sido» por «haya sido»',
    porque: 'Delante de un participio va el verbo haber: «haya sido», «hayan llegado». «Halla» con ll es de hallar, que significa encontrar. Truco: si puedes cambiarlo por «encuentra» y la frase pierde el sentido, era con y.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'quizá halla sido un error', bien: 'quizá haya sido un error' },
  },
  {
    id: 'que-halla', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(espero|esperamos|ojalá|dudo|dudamos|no creo|no creemos) que (no )?halla(n?)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' que ' + (m[2] || '') + 'haya' + m[3],
    titulo: '«Espero que halla» por «haya»',
    porque: 'Después de «espero que», «ojalá que» o «dudo que» el verbo va en subjuntivo: haya (de haber) o halle (de hallar). «Halla» con ll ahí no cabe nunca: o falta la y de haber o falta la e de hallar. Casi siempre es «haya».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'espero que halla llegado bien', bien: 'espero que haya llegado bien' },
  },
  {
    id: 'se-halla-subjuntivo', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(cuando|hasta que|una vez que|después de que|antes de que|en cuanto|ojalá|quizá|quizás|tal vez|talvez) se halla (?!(?:situad|ubicad|localizad|emplazad|asentad|instalad|rodead))([${COR_L}]+(?:ad|id)[oa]s?|resuelt[oa]s?|vuelt[oa]s?|hech[oa]s?|dich[oa]s?|puest[oa]s?|abiert[oa]s?|escrit[oa]s?|rot[oa]s?|cubiert[oa]s?|vist[oa]s?)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' se haya ' + m[2],
    titulo: '¿«Se halla» o «se haya»?',
    porque: '«Se halla» significa «se encuentra» («la escuela se halla en el valle»); «se haya» es el subjuntivo de haber y pide participio («cuando se haya terminado»). Tras «cuando», «ojalá» o «una vez que» casi siempre toca haber, pero revísalo: «cuando se halla cansado, descansa» también existe.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'cuando se halla terminado la obra', bien: 'cuando se haya terminado la obra' },
  },
  {
    id: 'se-haya-lugar', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])se haya en (el|la|los|las|un|una|su|este|esta|ese|esa|pleno|plena)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'se halla en ' + m[1],
    titulo: '¿«Se haya en» o «se halla en»?',
    porque: 'Para decir dónde está algo, el verbo es hallar(se), con ll: «el museo se halla en el centro» (= se encuentra). «Se haya» es de haber y necesita un participio detrás («se haya perdido»), no un lugar. Revísalo por si el participio venía después.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'el museo se haya en el centro', bien: 'el museo se halla en el centro' },
  },
  {
    id: 'ay-que', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])ay que ([${COR_L}]+(?:arse|erse|irse|ar|er|ir))(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'hay que ' + m[1],
    titulo: '«Ay que» por «hay que»',
    porque: 'La obligación se escribe con h: «hay que estudiar» (verbo haber). «Ay» sin h es el quejido («¡ay, me duele!») y «ahí» con tilde es el lugar. Truco de escuela: hay que hacer, ahí está, ay me dolió.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'ay que estudiar más', bien: 'hay que estudiar más' },
  },
  {
    id: 'hay-exclamativo', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`¡hay!`, 'giu'),
    sug: () => '¡ay!',
    titulo: '«¡Hay!» por «¡ay!»',
    porque: 'El grito de dolor o sorpresa es «¡ay!», sin h: interjección pura. «Hay» con h es del verbo haber («hay pan»). Entre signos de exclamación casi siempre se quiso el quejido, pero revísalo: «¿Hay tortillas?» y la respuesta «¡Hay!» también se puede.',
    norma: 'RAE · DPD',
    ejemplo: { mal: '¡hay!, me pinché con la aguja', bien: '¡ay!, me pinché con la aguja' },
  },
  {
    id: 'asta-hasta', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?<!el )(?<!del )(?<!al )(?<!un )(?<!la )(?<!una )(?<!media )(?<!su )(?<!sus )(?<!esa )(?<!esta )(?<!cada )asta (el|la|los|las|que|luego|mañana|ahora|aquí|hoy|donde|cuando|pronto|entonces)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'hasta ' + m[1],
    titulo: '«Asta» por «hasta»',
    porque: 'La preposición que marca el límite lleva h: «hasta mañana», «hasta la meta». «Asta» sin h existe, pero es otra cosa: el palo de la bandera o el cuerno del toro. Truco: si puedes cambiarla por «hasta el momento de», llevaba h.',
    norma: 'RAE · DLE',
    ejemplo: { mal: 'asta mañana, nos vemos', bien: 'hasta mañana, nos vemos' },
  },
  {
    id: 'e-he-participio', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])e (comido|dicho|hecho|sido|estado|visto|tenido|llegado|venido|puesto|escrito|terminado|logrado|pensado|querido|podido|sabido|dado|vivido|trabajado|aprendido|leído|jugado|ganado|perdido|empezado|olvidado|dejado|pasado|estudiado|dormido|entendido|acabado)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'he ' + m[1],
    titulo: '«E» por «he»',
    porque: 'Delante de un participio va «he», del verbo haber, con su h: «he comido», «he dicho». La «e» sin h solo es la conjunción que sustituye a «y» delante de i- («padres e hijos»). Truco: si puedes decir «has comido» a otra persona, lo tuyo es «he» con h.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'e comido demasiado', bien: 'he comido demasiado' },
  },
  {
    id: 'iva-iba', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?<!el )(?<!del )(?<!al )(?:iva(n?)|Iva) a ([${COR_L}]+(?:arse|erse|irse|ar|er|ir))(?![${COR_L}])`, 'gu'),
    sugm: (m) => 'iba' + (m[1] || '') + ' a ' + m[2],
    titulo: '«Iva» por «iba»',
    porque: 'El pasado de ir se escribe con b: iba, ibas, íbamos, como todos los imperfectos en -ba (cantaba, jugaba). «IVA», con mayúsculas, es el impuesto al valor agregado. Truco: b de «-ba», la terminación que siempre lleva b.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'iva a comprar pan', bien: 'iba a comprar pan' },
  },
  {
    id: 'tubo-tuvo', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?:(se|me|te|le|les|nos|lo|la|los|las) tubo(?![${COR_L}])|(?<!un )(?<!el )(?<!del )(?<!al )(?<!este )(?<!ese )(?<!aquel )(?<!cada )(?<!otro )(?<!cualquier )tubo que ([${COR_L}]+(?:arse|erse|irse|ar|er|ir))(?![${COR_L}]))`, 'giu'),
    sugm: (m) => m[1] ? m[1] + ' tuvo' : 'tuvo que ' + m[2],
    titulo: '«Tubo» por «tuvo»',
    porque: 'El pasado de tener va con v: tuvo, estuvo, anduvo (los pretéritos en -uve/-uvo siempre llevan v). «Tubo» con b es el cilindro hueco: el tubo de ensayo, el tubo del desagüe. Truco: si es alguien haciendo algo, es con v.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'tubo que salir corriendo', bien: 'tuvo que salir corriendo' },
  },
  {
    id: 'valla-vaya', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?:(que (?:te|le|les|nos|me|os) |ojalá )valla(n?)(?![${COR_L}])|(?<!una )(?<!la )(?<!esa )(?<!esta )(?<!cada )(?<!aquella )valla(n?) a ([${COR_L}]+(?:arse|erse|irse|ar|er|ir))(?![${COR_L}]))`, 'giu'),
    sugm: (m) => m[1] !== undefined ? m[1] + 'vaya' + m[2] : 'vaya' + m[3] + ' a ' + m[4],
    titulo: '«Valla» por «vaya»',
    porque: '«Vaya» es del verbo ir: «que te vaya bien», «ojalá vaya». «Valla» con ll es la cerca o el cartel grande de la carretera. Truco: si puedes cambiarlo por «fuera» o «vamos», es del verbo ir y va con y.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'que te valla bien en el examen', bien: 'que te vaya bien en el examen' },
  },
  {
    id: 'vaya-valla', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(una|la|esa|esta|aquella) vaya (publicitaria|metálica|electrificada|de madera|del jardín)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' valla ' + m[2],
    titulo: '«Vaya» por «valla» (la cerca)',
    porque: 'La cerca y el cartel grande de carretera se escriben con ll: valla publicitaria, valla metálica. «Vaya» con y es del verbo ir. Revísalo porque «la vaya» también puede ser verbo con pronombre («que la vaya a buscar»).',
    norma: 'RAE · DLE',
    ejemplo: { mal: 'una vaya publicitaria enorme', bien: 'una valla publicitaria enorme' },
  },
  {
    id: 'sino-junto', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<=(?:solo|sólo|solamente|únicamente)[^.!?¿¡\\n]{0,60})(?<![${COR_L}])si\\s+no\\s+(también|tambien)(?![${COR_L}])|(?<=(?:solo|sólo|solamente|únicamente)[^.!?¿¡\\n]{0,60})(?<![${COR_L}])si\\s+no\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] ? 'sino también' : 'sino que',
    titulo: '«Si no» que debía ser «sino»',
    porque: 'En la pareja «no solo… sino también» / «no solo… sino que», el «sino» va junto: es la conjunción que opone («no vino Ana, sino Luis»). Separado, «si no» es condición con negación: «si no vienes, aviso». Truco: si puedes meter un «que sí» en medio («si [acaso] no vienes»), va separado; si opone dos cosas, va junto. La regla solo salta cuando antes hay un «no solo…», que es donde el «sino» adversativo es seguro; «me pregunto si no también nosotros fallamos» es un condicional legítimo y se queda en paz.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'No solo canta, si no también baila', bien: 'No solo canta, sino también baila' },
  },
  {
    id: 'sino-separado', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<!(?:el|un|su|mi|tu|este|ese|aquel|nuestro|vuestro)\\s)(?<![${COR_L}])sino\\s+(vienes|puedes|quieres|sabes|tienes|estás|está|hay|venís|podés|querés|sabés|tenés|vas)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'si no ' + m[1],
    titulo: '«Sino» que debía ser «si no»',
    porque: 'Delante de un verbo conjugado, casi siempre es la condición negada y va separado: «si no puedes venir, avisá». Junto, «sino» opone («no es lunes, sino martes») o es el sustantivo destino («su sino era viajar»). Se marca para revisar porque existe un tercer caso: en «no solo estudia sino tiene dos trabajos» lo que falta es un «que» («sino que tiene»), no la separación.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Sino puedes venir, avisá', bien: 'Si no puedes venir, avisá' },
  },
  {
    id: 'aun-todavia', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])aun\\s+(?:no|nadie)\\s+(?:(?:se|lo|la|los|las|le|les|me|te|nos)\\s+)?(?:ha|han|he|hemos|había|habían|habrá|habrán|hay|es|son|era|eran|está|están|estoy|estamos|estaba|estaban|sé|sabe|saben|sabemos|sabía|puedo|puede|pueden|podemos|podía|podían|tengo|tiene|tienen|tenemos|tenía|tenían|existe|existen|llega|llegan|queda|quedan|entiendo|entiende|conozco|conoce|veo|ve|vemos|falta|faltan|termina|terminan|empieza|empiezan|llegó|llegaron|vino|vinieron|terminó|terminaron|salió|salieron|volvió|volvieron|empezó|empezaron|pasó|pasaron|apareció|aparecieron|respondió|respondieron|contestó|contestaron)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'aún' + m[0].slice(3),
    titulo: '«Aun» que significa todavía',
    porque: 'Cuando puedes cambiarlo por «todavía», lleva tilde: «aún no ha llegado» = «todavía no ha llegado». Sin tilde, «aun» significa «incluso, hasta»: «aun los niños lo saben». Truco del reloj: si la frase habla de tiempo que no acaba, es «aún» con tilde.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Aun no ha llegado el bus', bien: 'Aún no ha llegado el bus' },
  },
  {
    id: 'aun-asi', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?<!sigue )(?<!sigo )(?<!siguen )(?<!seguía )(?<!seguían )(?<!seguís )(?<!está )(?<!estás )(?<!estaba )(?<!estaban )(?<!queda )(?<!quedan )(?<!quedó )aún\\s+así(?![${COR_L}])(?!\\s+de(?![${COR_L}]))`, 'giu'),
    sug: () => 'aun así',
    titulo: '«Aún así» pierde la tilde',
    porque: 'Cuando significa «a pesar de eso», es «aun así» sin tilde (aun = incluso). Pero existe la vecina legítima con tilde: «la rodilla sigue aún así de hinchada» = TODAVÍA está así. Truco: si puedes cambiarlo por «a pesar de eso», va sin tilde; si puedes cambiarlo por «todavía», la tilde se queda. Por eso esta señal pregunta en vez de corregir sola.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Llovía, y aún así salieron', bien: 'Llovía, y aun así salieron' },
  },
  {
    id: 'aun-cuando', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])aún\\s+cuando(?![${COR_L}])`, 'giu'),
    sug: () => 'aun cuando',
    titulo: '«Aún cuando», casi siempre «aun cuando»',
    porque: 'La locución que significa «aunque» va sin tilde: «aun cuando llueva, iremos» = «aunque llueva». Se marca para revisar porque existe un caso legítimo con «todavía»: «dormía aún cuando llegué» (= todavía dormía en ese momento). La prueba de siempre: si cabe «aunque», quita la tilde; si cabe «todavía», déjala.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Aún cuando llueva, iremos', bien: 'Aun cuando llueva, iremos' },
  },
  {
    id: 'mas-conjuncion', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])[Mm]as(?![${COR_L}])`, 'gu'),
    sug: () => 'más',
    titulo: '«Mas» sin tilde, ¿de verdad?',
    porque: 'Sin tilde, «mas» es la conjunción antigua que significa «pero» («quiso ir, mas no pudo») y hoy casi no se usa fuera de la poesía. Con tilde, «más» es cantidad o comparación, que es lo que se quiere decir el 99 % de las veces. Si tu frase no admite cambiar «mas» por «pero», le falta la tilde.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'quiero mas café', bien: 'quiero más café' },
  },
  {
    id: 'porque-pregunta', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(¿\\s*(?:(?:y|pero|entonces|bueno|o)\\s+)?)(porqu[eé]|por\\s+que)(?![${COR_L}])(?!\\s*sí(?![${COR_L}]))(?![^?\\n]*\\so\\s+porque(?![${COR_L}]))`, 'giu'),
    sugm: (m) => m[1] + (/^[PÁ]/.test(m[2]) ? 'Por qué' : 'por qué'),
    titulo: 'Pregunta con «porque»: es «por qué»',
    porque: 'Cuando la pregunta empieza preguntando el motivo, son dos palabras y la segunda con tilde: «¿Por qué no viniste?». «Porque» junto y sin tilde responde («porque llovía»), y «porqué» junto con tilde es el sustantivo motivo («el porqué»). Quien pregunta, separa y tilda; quien responde, junta. Se queda en «revísalo» porque el junto átono también puede ser correcto: «¿Porque llueve no vas a ir?» discute una causa ya dicha (= ¿por el hecho de que llueve?), y «¿porque sí?» o «¿porque no quisiste o porque no pudiste?» preguntan cuál causa vale. Si tu pregunta PIDE el motivo, entonces sí: «por qué», separado y con tilde.',
    norma: 'RAE · DPD',
    ejemplo: { mal: '¿Porque no viniste ayer?', bien: '¿Por qué no viniste ayer?' },
  },
  {
    id: 'por-que-separado', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])por\\s+que(?![${COR_L}])`, 'giu'),
    titulo: '«Por que» separado y sin tilde',
    porque: 'Esta combinación existe pero es rarísima: «optó por que viniera» (por + que conjunción) o «la razón por que luchamos» (= por la que). Casi siempre lo que se quería escribir era «porque» junto (causa: «no fui porque llovía») o «por qué» con tilde (pregunta: «no sé por qué vino»). Léela en voz alta: si suena a pregunta o a causa, cámbiala.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'no sé por que lo hizo', bien: 'no sé por qué lo hizo' },
  },
  {
    id: 'conque-trio', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])conque(?![${COR_L}])`, 'giu'),
    titulo: '«Conque», «con que» o «con qué»',
    porque: 'Son tres: «conque» junto significa «así que» («conque ya lo sabés»); «con que» separado es preposición más que («el lápiz con que escribo», «basta con que vengas»); y «con qué» con tilde pregunta («¿con qué dinero?»). Si en tu frase cabe «así que», el junto está bien; si cabe «el cual» o es pregunta, sepáralo.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'no sé conque pagarlo', bien: 'no sé con qué pagarlo' },
  },
  {
    id: 'con-que-pregunta', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(¿\\s*)con\\s+que(?![${COR_L}])(?=\\s+[${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + 'con qué',
    titulo: '«¿Con que…» casi siempre pide tilde',
    porque: 'Si la pregunta pide un instrumento o un medio, es «¿con qué…?» con tilde: «¿con qué dinero?», «¿con qué herramienta?». Se marca para revisar porque existe la sorpresa con «conque» junto («¿Conque esas tenemos?»), que a veces se escribe separado por error: ahí la corrección sería juntarlo, no tildarlo.',
    norma: 'RAE · DPD',
    ejemplo: { mal: '¿Con que dinero pagarás?', bien: '¿Con qué dinero pagarás?' },
  },
  {
    id: 'esta-demas', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(está|están|estás|estaba|estaban|estaría|estarían|esté|estén|estar|estuvo|estuvieron)\\s+demás(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' de más',
    titulo: '«Está demás» es «está de más»',
    porque: 'Lo que sobra «está de más», en dos palabras: de + más, como «cobró de más» o «hablé de más». «Demás» junto significa «los otros, el resto» y siempre acompaña o sustituye a un grupo: «los demás alumnos», «lo demás no importa». Tras el verbo estar con sentido de sobrar, va separado siempre.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Tu ayuda no está demás', bien: 'Tu ayuda no está de más' },
  },
  {
    id: 'los-de-mas', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(los|las|lo)\\s+de\\s+más(?![${COR_L}])(?=\\s+(?:se|no|son|eran|están|estaban|ya|también|nunca|siempre)(?![${COR_L}])|\\s*[,.;:])`, 'giu'),
    sugm: (m) => m[1] + ' demás',
    titulo: '«Los de más» que parecen «los demás»',
    porque: 'Para decir «los otros, el resto», es una sola palabra: «los demás se fueron». Separado, «los de más» necesita algo detrás que complete la comparación: «los de más edad», «los de más peso». Se marca para revisar porque esa segunda construcción es perfectamente correcta; aquí el contexto sugiere que hablabas del resto.',
    norma: 'RAE · DLE',
    ejemplo: { mal: 'los de más se quedaron en casa', bien: 'los demás se quedaron en casa' },
  },
  {
    id: 'a-si-mismo', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])a\\s+si\\s+mism([oa]s?)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'a sí mism' + m[1].toLowerCase(),
    titulo: '«A si mismo» pide la tilde de «sí»',
    porque: 'Cuando uno se hace algo a su propia persona, es «a sí mismo»: ese «sí» es el pronombre (como en «volvió en sí») y lleva tilde diacrítica que lo separa del «si» de condición. Sus hermanos: «asimismo» junto es la grafía preferida para «también» (aunque «así mismo» separado también se admite con ese sentido)..',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'se engaña a si mismo', bien: 'se engaña a sí mismo' },
  },
  {
    id: 'asi-mismo', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])asi\\s+mismo(?![${COR_L}])`, 'giu'),
    sug: () => 'así mismo',
    titulo: '«Asi mismo»: tilde, y ojo al trío',
    porque: 'A «asi» le falta la tilde de «así». Y de paso, el trío completo: «así mismo» separado = «de esa misma manera»; «asimismo» junto = «también, además»; «a sí mismo» = a la propia persona («se premió a sí mismo»). Elegí el que diga lo que querías decir; la sugerencia da el arreglo mínimo. Matiz de la Academia: para el sentido «también» valen las dos grafías («asimismo» es la preferida); «así mismo» es además la forma natural para «de esa misma manera».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'asi mismo lo confirmó', bien: 'así mismo lo confirmó' },
  },
  {
    id: 'e-eufonica', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![¿¡]\\s*(?:pero\\s+|y\\s+)?)(?<![${COR_L}])y\\s+(?!(?:II|III|IV|IX)(?![${COR_L}]))((?:hi(?![ae])|[ií](?![aeouáéóú]))[${COR_L}]+)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'e ' + m[1],
    titulo: '«Y» que debe sonar «e»',
    porque: 'Cuando la palabra siguiente empieza con el sonido i (i-, hi-), la «y» se convierte en «e» para que no choquen dos íes: «padres e hijos», «geografía e historia». Excepciones: ante hie- y hia- se queda la y («agua y hielo», «diptongos y hiatos») porque ahí suena ye, y al abrir pregunta («¿Y Inés?»).',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'padres y hijos', bien: 'padres e hijos' },
  },
  {
    id: 'u-eufonica', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<!\\.)(?<![${COR_L}])o\\s+(h?[oó][${COR_L}]+)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'u ' + m[1],
    titulo: '«O» que debe sonar «u»',
    porque: 'Cuando la palabra siguiente empieza con el sonido o (o-, ho-), la «o» se convierte en «u» para no fundirse con ella: «siete u ocho», «mujeres u hombres», «ayer u hoy». Es la hermana de la regla de «y»→«e»: el oído manda, y dos oes seguidas se comerían la disyuntiva.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'siete o ocho días', bien: 'siete u ocho días' },
  },
  {
    id: 'aun-mas', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])aun\\s+(más|menos|mejor|peor)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'aún ' + m[1],
    titulo: '«Aun más» casi siempre es «aún más»',
    porque: 'Delante de «más, menos, mejor, peor», lo normal es «aún» con tilde, que ahí significa «todavía»: «aún más difícil» = «todavía más difícil». Se marca para revisar porque el sin tilde también existe con sentido de «incluso»: «ni aun más dinero lo salvaría» (= ni siquiera con más dinero). Si cabe «todavía», tilde.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'esto es aun más difícil', bien: 'esto es aún más difícil' },
  },
  {
    id: 'dequeismo-verbos-2', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])((?:dijo|dice|dicen|decía|decían|afirmó|afirma|afirman|contó|pensó|pensaba|pensé|creyó|creía|creí|opinó|opinaba|consideró|consideraba|supuso|suponía|imaginó|imaginaba|resultó|resultaba|pareció|parecía)|(?<!(?<![${COR_L}])se\\s)(?<!(?<![${COR_L}])me\\s)(?<!(?<![${COR_L}])te\\s)(?<!(?<![${COR_L}])nos\\s)asegur(?:ó|a|an))\\s+de\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' que',
    titulo: 'Dequeísmo: sobra el «de» (más tiempos)',
    porque: '«Dijo que», «pensé que», «aseguró que»: estos verbos llevan «que» directo, sin «de». La prueba del espejo también sirve aquí: se pregunta «¿Qué dijo?», no «¿De qué dijo?»; si la pregunta natural va sin «de», el «de» sobra en la frase. Ojo: «SE aseguró de que» sí lo lleva (asegurarse DE algo), y por eso el corrector deja en paz las formas con «se», «me», «te», «nos» delante.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Dijo de que vendría temprano', bien: 'Dijo que vendría temprano' },
  },
  {
    id: 'dequeismo-impersonal', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(es|era|fue|será|sería)\\s+(posible|probable|seguro|evidente|cierto)\\s+de\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' ' + m[2] + ' que',
    titulo: '«Es posible de que»: sobra el «de»',
    porque: 'Con «ser + adjetivo» la cosa va directa: es posible QUE llueva, era evidente QUE mentía. El «de» se cuela por contagio de «estar seguro DE que», que sí lo pide, porque quien está seguro lo está DE algo. Truco: dale la vuelta: «que llueva es posible» funciona; «de que llueva es posible» no.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Es posible de que llueva', bien: 'Es posible que llueva' },
  },
  {
    id: 'locucion-de-que', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(a\\s+menos|una\\s+vez)\\s+de\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' que',
    titulo: '«A menos de que», «una vez de que»',
    porque: 'Las locuciones asentadas son «a menos que» y «una vez que»: el «de» intruso se cuela por analogía con «antes de que», que sí lo lleva. La forma sin «de» es la preferida por la norma culta. Se marca como «revísalo» porque hay frases correctas parecidas donde «una vez» va por su cuenta: «ya hablamos una vez de que debías estudiar».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'No iré a menos de que me inviten', bien: 'No iré a menos que me inviten' },
  },
  {
    id: 'queismo-ampliado', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])((?:da|daba|dio)\\s+la\\s+casualidad|(?:tengo|tienes|tiene|tenemos|tienen|tenía|tenías|teníamos|tenían|tuve|tuviste|tuvo|tuvimos|tuvieron)\\s+miedo|me\\s+acord(?:é|aba)|te\\s+acordaste|se\\s+acord(?:ó|aba|aron)|nos\\s+acordamos|(?:estoy|estás|está|estamos|están|estaba|estabas|estábamos|estaban)\\s+convencid[oa]s?|a\\s+fin)\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' de que',
    titulo: 'Queísmo: falta el «de» (más contextos)',
    porque: '«Miedo DE algo», «acordarse DE algo», «convencido DE algo», «a fin DE algo», «la casualidad DE algo»: el «de» es parte del régimen y quitárselo deja la frase coja. Prueba del espejo: «¿De qué tenés miedo?», «¿De qué te acordaste?»: si la pregunta pide «de», la frase también.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Tengo miedo que se caiga', bien: 'Tengo miedo de que se caiga' },
  },
  {
    id: 'queismo-sustantivo', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])((?:el|del|al)\\s+hecho|no\\s+(?:cabe|hay)\\s+duda|no\\s+me\\s+cabe\\s+duda)\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' de que',
    titulo: '«El hecho que», «no cabe duda que»',
    porque: 'Los sustantivos también tienen régimen: el hecho DE que, la duda DE que. Se marca como «revísalo» porque ese «que» puede ser un relativo, y entonces la frase es correcta sin «de»: «el hecho que más me impresionó». La prueba: si lo que sigue es una oración completa que EXPLICA el hecho o la duda («el hecho ___ no viniera»), falta el «de».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'No cabe duda que es talentosa', bien: 'No cabe duda de que es talentosa' },
  },
  {
    id: 'falta-que-subjuntivo', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(dudo|dudamos|espero|esperamos)\\s+(haya|hayan|sea|sean|esté|estén|pueda|puedan|venga|vengan|llegue|lleguen)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' que ' + m[2],
    titulo: '¿Falta un «que» antes del subjuntivo?',
    porque: '«Dudo haya», «espero estén bien»: en la prosa corriente ese «que» no se omite («dudo QUE haya», «espero QUE estén»). Omitirlo («espero sea de su agrado») es un rasgo del registro formal epistolar y administrativo: correcto, pero suena a oficio membretado, no a revista familiar. Por eso se marca para revisar y no como error.',
    norma: 'RAE · NGLE',
    ejemplo: { mal: 'Espero estén todos bien', bien: 'Espero que estén todos bien' },
  },
  {
    id: 'consiste-de', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(consiste|consisten|consistía|consistían|consistió|consistieron|consistirá)\\s+de(?![${COR_L}])(?!\\s+(?:verdad|momento|hecho|entrada|nuevo|paso|repente|maravilla|forma|manera)(?![${COR_L}]))`, 'giu'),
    sugm: (m) => m[1] + ' en',
    titulo: '«Consiste de», calco del inglés',
    porque: 'En español las cosas consisten EN algo; «consiste de» es un calco de «consists of». El vecino que sí lleva «de» es «constar»: el examen CONSTA DE tres partes o CONSISTE EN tres partes (dos maneras correctas de decir lo mismo, cada una con su preposición).',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'El examen consiste de tres partes', bien: 'El examen consiste en tres partes' },
  },
  {
    id: 'depende-en', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(depende|dependen|dependía|dependían|dependerá|dependo|dependemos)\\s+en\\s+(?!(?:el\\s+fondo|la\\s+práctica|la\\s+medida|la\\s+actualidad|la\\s+vida)(?![${COR_L}]))(el|la|los|las|que|si)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[2].toLowerCase() === 'el' ? m[1] + ' del' : m[1] + ' de ' + m[2],
    titulo: '«Depende en», el régimen es «de»',
    porque: 'Depender rige «de»: todo depende DE algo («¿DE qué depende?»). El «en» se cuela por el inglés «depends on». Ojo: «depende EN gran medida de…» o «depende, EN el fondo, de…» son correctos, porque ahí el «en» abre un inciso y el «de» llega después; por eso esta regla pide ojo humano en vez de corregir sola.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Todo depende en el esfuerzo', bien: 'Todo depende del esfuerzo' },
  },
  {
    id: 'cerca-a', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?<!de\\s)cerca\\s+(a|al)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1].toLowerCase() === 'al' ? 'cerca del' : 'cerca de',
    titulo: '«Cerca a», mejor «cerca de»',
    porque: 'La norma culta prefiere «cerca DE la escuela»; «cerca a» se oye en varias zonas de América y no es ningún disparate, pero en prosa cuidada canta. Se marca para revisar porque hay frases correctas parecidas: «miraba de cerca a los pájaros», donde «de cerca» va por su lado y la «a» es la de persona.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Vivimos cerca a la escuela', bien: 'Vivimos cerca de la escuela' },
  },
  {
    id: 'de-gratis', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?<!nada\\s)de\\s+gratis(?![${COR_L}])`, 'giu'),
    sug: () => 'gratis',
    titulo: '«De gratis»: el «de» sobra',
    porque: '«Gratis» ya es adverbio y adjetivo completito: «entramos gratis», «la función es gratis». El «de» se le pega por analogía con «de balde», pero la norma lo tacha de redundante: «gratis» a secas dice exactamente lo mismo con una palabra menos.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Entramos de gratis al cine', bien: 'Entramos gratis al cine' },
  },
  {
    id: 'bajo-punto-vista', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])bajo\\s+(mi|tu|su|nuestro|vuestro)\\s+punto\\s+de\\s+vista(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'desde ' + m[1] + ' punto de vista',
    titulo: '«Bajo mi punto de vista»',
    porque: 'Las dos son válidas: «bajo el punto de vista» es construcción tradicional (la usaba Bello y el diccionario la registra) y «desde el punto de vista» es la mayoritaria hoy. Para la revista preferimos «desde», que pinta la imagen completa: un punto de vista es un lugar DESDE el que se mira. Uniformidad, no censura.',
    norma: 'Estilo de la casa',
    ejemplo: { mal: 'Bajo mi punto de vista, es un error', bien: 'Desde mi punto de vista, es un error' },
  },
  {
    id: 'mayor-brevedad', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])a\\s+la\\s+mayor\\s+brevedad(?![${COR_L}])`, 'giu'),
    sug: () => 'con la mayor brevedad',
    titulo: '«A la mayor brevedad»',
    porque: 'La locución tradicional es «CON la mayor brevedad» (= muy pronto): la brevedad es el modo de responder, no el destino. «A la mayor brevedad» está tan extendida (sobre todo en cartas de oficina) que ya no escandaliza, pero la norma culta sigue prefiriendo «con». Por eso: revísalo, que no es pecado.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Respondan a la mayor brevedad', bien: 'Respondan con la mayor brevedad' },
  },
  {
    id: 'en-base-de', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])en\\s+base\\s+de(?!\\s+datos)(?![${COR_L}])`, 'giu'),
    sug: () => 'con base en',
    titulo: '«En base de», doble tropiezo',
    porque: 'Si «en base a» ya cojea, «en base de» tropieza dos veces: la locución que la norma recomienda es «con base en», o mejor aún las llanas «según», «a partir de», «basándose en». (La informática se salva: «base de datos» es otra cosa y esta regla no la toca.)',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Decidieron en base de los informes', bien: 'Decidieron con base en los informes' },
  },
  {
    id: 'al-interior-de', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])al\\s+interior\\s+(de|del)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1].toLowerCase() === 'del' ? 'dentro del' : 'dentro de',
    titulo: '«Al interior de» sin movimiento',
    porque: 'Con verbos de movimiento es correcta: «viajó al interior del país», «el balón entró al interior del arco». El problema es usarla como sinónimo elegante de «dentro de» o «en»: «se discutió al interior del comité» → «dentro del comité», «en el comité». Si nada se mueve hacia adentro, sobra el viaje.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Se discutió al interior de la familia', bien: 'Se discutió dentro de la familia' },
  },
  {
    id: 'a-nivel-de', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])a\\s+nivel\\s+(?:de|del)(?!\\s+(?:mar|suelo|piso))(?![${COR_L}])`, 'giu'),
    titulo: '«A nivel de», comodín gastado',
    porque: 'Solo es propia cuando hay niveles de verdad: «a nivel del mar», «a nivel de calle», o jerarquías reales («a nivel estatal»). Como comodín («a nivel de contenido», «a nivel de familia») la norma la desaconseja, y casi siempre hay algo más preciso y más corto: «en cuanto a», «en», «entre», «en el plano de»… o reescribir sin muleta: «a nivel de contenido, la nota es sólida» → «el contenido de la nota es sólido».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'A nivel de contenido, la nota es sólida', bien: 'El contenido de la nota es sólido' },
  },
  {
    id: 'habemos', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])habemos\\s+(much[oa]s|vari[oa]s|algun[oa]s|un[oa]s|poc[oa]s|demasiad[oa]s|bastantes|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|veinte|cientos|miles|\\d+)(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'somos ' + m[1],
    titulo: '«Habemos muchos», con cariño',
    porque: 'Frecuentísimo y muy querido en toda América: «habemos muchos que pensamos igual». Pero el «haber» de existencia es impersonal y no admite «nosotros»: la norma pide «somos muchos» o «estamos muchos» cuando quien escribe se incluye, y «hay muchos» cuando no. En un diálogo citado puede quedarse tal cual: es habla real y retratarla no es error.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Habemos muchos que pensamos igual', bien: 'Somos muchos los que pensamos igual' },
  },
  {
    id: 'posesivo-adverbio', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(delante|detrás|detras|encima|debajo|enfrente|adelante|atrás|atras|cerca)\\s+(m[íi][oa]s?|tuy[oa]s?|suy[oa]s?|nuestr[oa]s?(?!\\s+[${COR_L}])|vuestr[oa]s?(?!\\s+[${COR_L}]))(?![${COR_L}])`, 'giu'),
    sugm: (m) => { const a = ({ detras: 'detrás', atras: 'atrás' })[m[1].toLowerCase()] || m[1]; const p = m[2].toLowerCase(); if (p[0] === 'm') return a + ' de mí'; if (p[0] === 't') return a + ' de ti'; return null; },
    titulo: '«Delante mío», «detrás suyo»',
    porque: 'Estos adverbios se combinan con «de + pronombre»: delante DE MÍ, detrás DE ÉL, cerca DE NOSOTROS. Como «delante» no es un sustantivo, no puede llevar posesivo: nadie diría «el delante de la casa». «Delante mío» está tan extendido que en el Río de la Plata es lo normal al hablar, pero la norma culta general lo desaconseja en prosa formal. Para «suyo» o «nuestro» no hay corrección automática: decide tú si es «de él», «de ella», «de ellos», «de nosotros»…',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Se sentó delante mío', bien: 'Se sentó delante de mí' },
  },
  {
    id: 'han-habido', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(han|habían|habrán|habrían)\\s+habido(?![${COR_L}])`, 'giu'),
    sugm: (m) => ({ 'han': 'ha', 'habían': 'había', 'habrán': 'habrá', 'habrían': 'habría' }[m[1].toLowerCase()] + ' habido'),
    titulo: '«Han habido», el impersonal no se pluraliza',
    porque: 'Cuando «haber» dice que algo existe u ocurre, no tiene sujeto: es impersonal y va en singular también en los tiempos compuestos. «Ha habido fiestas» funciona igual que «hay fiestas» y «hubo fiestas»: las fiestas no son el sujeto, son el complemento. Truco: si «hay» te suena bien en presente, en compuesto toca «ha habido», nunca «han».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Han habido muchas quejas', bien: 'Ha habido muchas quejas' },
  },
  {
    id: 'van-a-haber', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(van|iban)\\s+a\\s+haber(?![${COR_L}])(?!\\s+(?:[${COR_L}]*(?:ad|id)[oa]s?|hecho|dicho|visto|puesto|escrito|vuelto|muerto|roto|abierto|cubierto)(?![${COR_L}]))`, 'giu'),
    sugm: (m) => (m[1].toLowerCase() === 'van' ? 'va' : 'iba') + ' a haber',
    titulo: '«Van a haber»: la perífrasis también es impersonal',
    porque: 'La regla del «haber» impersonal viaja con él a todas partes, también dentro de «ir a + haber»: «va a haber elecciones» como «hay elecciones» y «hubo elecciones». Lo que parece sujeto plural (las elecciones) es el complemento, así que el verbo se queda quieto en singular. Ojo: «van a haber terminado» (futuro perfecto, haber auxiliar) sí es correcto: por eso esta regla no toca a «haber» cuando le sigue un participio.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Van a haber cambios importantes', bien: 'Va a haber cambios importantes' },
  },
  {
    id: 'pueden-haber', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(pueden|deben|podrían|deberían)\\s+haber\\s+(much[ao]s|vari[ao]s|algun[ao]s|un[ao]s|demasiad[ao]s|bastantes|poc[ao]s|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|veinte|treinta|cien|decenas|cientos|miles|\\d+)(?![${COR_L}])`, 'giu'),
    sugm: (m) => ({ 'pueden': 'puede', 'deben': 'debe', 'podrían': 'podría', 'deberían': 'debería' }[m[1].toLowerCase()] + ' haber ' + m[2]),
    titulo: '«Pueden haber muchas…»: el singular sigue mandando',
    porque: 'Con «poder» o «deber» delante, el «haber» impersonal no cambia de carácter: «puede haber muchas razones», «debe haber dos copias». El auxiliar hereda el singular del impersonal. Ojo, que hay un primo legítimo: «pueden haber terminado» sí es correcto, porque ahí «haber» es auxiliar de otro verbo; por eso este hallazgo pide tu ojo.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Pueden haber muchas razones', bien: 'Puede haber muchas razones' },
  },
  {
    id: 'genero-griego', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?:(la|una)\\s+(problema|tema|sistema|clima|idioma|planeta|enigma|dilema|esquema|síntoma|sintoma)|(las|unas)\\s+(problemas|temas|sistemas|climas|idiomas|planetas|enigmas|dilemas|esquemas|síntomas|sintomas))(?![${COR_L}])`, 'giu'),
    sugm: (m) => { if (m[1]) { const det = m[1].toLowerCase() === 'la' ? 'el' : 'un'; const w = m[2].toLowerCase() === 'sintoma' ? 'síntoma' : m[2]; return det + ' ' + w; } const det = m[3].toLowerCase() === 'las' ? 'los' : 'unos'; const w = m[4].toLowerCase() === 'sintomas' ? 'síntomas' : m[4]; return det + ' ' + w; },
    titulo: 'Termina en -a… pero es masculino',
    porque: 'Problema, tema, sistema, clima, idioma, planeta, dilema, esquema, síntoma… vienen del griego y son masculinos aunque acaben en -a: «el problema», «un dilema», «los temas». Truco de familia: casi todas las palabras en -ma de origen griego (las que tienen prima en «-mático»: problemático, sistemático, climático) van con «el».',
    norma: 'RAE · DLE',
    ejemplo: { mal: 'la problema del agua', bien: 'el problema del agua' },
  },
  {
    id: 'a-tonica', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?:la|La)\\s+(agua|águila|aguila|alma|hambre|área|area|aula|arma|ala|ancla|hacha)(?![${COR_L}])`, 'gu'),
    sugm: (m) => { const fix = { aguila: 'águila', area: 'área' }; const w = m[1].toLowerCase(); return 'el ' + (fix[w] || m[1]); },
    titulo: '«El agua»: la a tónica pide artículo el',
    porque: 'Agua, águila, alma, hambre, área, aula… son femeninas, pero cuando el artículo va pegado delante y la palabra empieza con a tónica, se usa «el/un» para que no choquen las dos aes: «el agua», «un hacha». El género NO cambia: «el agua fría», «las aguas», «esta agua», «mucha hambre». Solo el artículo inmediato se disfraza.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'la agua está fría', bien: 'el agua está fría' },
  },
  {
    id: 'preteritos-fuertes', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(?:andé|andó|andaron|cabió|cabieron|dijieron|trajieron|veniste|venistes|produció|producieron|produjieron|condució|conducieron|satisfació|satisfacieron)(?![${COR_L}])`, 'giu'),
    sug: m => ({ 'andé': 'anduve', 'andó': 'anduvo', 'andaron': 'anduvieron', 'cabió': 'cupo', 'cabieron': 'cupieron', 'dijieron': 'dijeron', 'trajieron': 'trajeron', 'veniste': 'viniste', 'venistes': 'viniste', 'produció': 'produjo', 'producieron': 'produjeron', 'produjieron': 'produjeron', 'condució': 'condujo', 'conducieron': 'condujeron', 'satisfació': 'satisfizo', 'satisfacieron': 'satisficieron' })[m.toLowerCase()],
    titulo: 'Pretérito irregular «regularizado»',
    porque: 'Andar, caber, decir, traer, venir, producir y satisfacer guardan pretéritos irregulares heredados del latín: anduve, cupo, dijeron, trajeron, viniste, produjo, satisfizo. Al forzarlos al molde regular («andé», «dijieron», «produció») salen formas que nunca han existido en la norma. Truco: andar copia a tener (tuve → anduve) y los verbos en -ducir copian a decir (dije → produje, conduje).',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'andé toda la tarde y dijieron que no', bien: 'anduve toda la tarde y dijeron que no' },
  },
  {
    id: 'participios-fuertes', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(romp|mor|volv|escrib|pon|hac)id([oa]s?)(?![${COR_L}])`, 'giu'),
    sugm: (m) => ({ romp: 'rot', mor: 'muert', volv: 'vuelt', escrib: 'escrit', pon: 'puest', hac: 'hech' }[m[1].toLowerCase()] + m[2].toLowerCase()),
    titulo: 'Participio irregular único: roto, no «rompido»',
    porque: 'Romper, morir, volver, escribir, poner y hacer tienen un solo participio, y es el irregular: roto, muerto, vuelto, escrito, puesto, hecho. La versión en -ido no existe en la norma. Distinto es el caso de freír e imprimir, que sí tienen dos participios válidos: freído/frito, imprimido/impreso.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'se ha rompido la taza', bien: 'se ha roto la taza' },
  },
  {
    id: 'partitivo-ordinal', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?:(\\d+)\\s?av([oa])s?(?!\\s+de\\s+final)|(onceav|doceav|quinceav|dieciseisav|dieciséisav|veinteav)([oa])\\s+(aniversario|cumpleaños|lugar|puesto|piso|grado|edición|edicion|capítulo|capitulo|episodio|vez|temporada))(?![${COR_L}])`, 'giu'),
    sugm: (m) => { if (m[1]) return m[1] + (m[2].toLowerCase() === 'a' ? '.ª' : '.º'); const bases = { onceav: 'undécim', doceav: 'duodécim', quinceav: 'decimoquint', dieciseisav: 'decimosext', 'dieciséisav': 'decimosext', veinteav: 'vigésim' }; return bases[m[3].toLowerCase()] + m[4].toLowerCase() + ' ' + m[5]; },
    titulo: '«12avo» es una fracción, no un puesto',
    porque: '«Doceavo» y «15avo» son partitivos: nombran una fracción (un doceavo = 1/12 del pastel), no el lugar en una serie. Para el orden, el español pide el ordinal: duodécimo aniversario, decimoquinta edición, o la abreviatura 12.º/15.ª. La excepción consagrada por el uso deportivo: «dieciseisavos de final», que sí es correcta.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'celebró su 15avo aniversario', bien: 'celebró su 15.º aniversario' },
  },
  {
    id: 'doble-negacion', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?<![${COR_L}] )(nadie|nunca|nada)\\s+no\\s+(?!más(?![${COR_L}]))([${COR_L}]+)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' ' + m[2],
    titulo: '«Nadie no vino»: un no que sobra',
    porque: 'El español dobla la negación con gusto («no vino nadie»), pero solo cuando el «no» va delante del verbo y la palabra negativa detrás. Si la palabra negativa encabeza la frase, ella sola ya niega: «nadie vino», «nunca llegó». Revísalo con calma: a veces ese «no» abre otra oración y lo que falta es una coma o un punto, no quitar la palabra.',
    norma: 'RAE · Gramática (NGLE)',
    ejemplo: { mal: 'Nadie no quiso venir', bien: 'Nadie quiso venir' },
  },
  {
    id: 'mas-mejor', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<!cuant[oa]s?\\s)(?<!cuánt[oa]s?\\s)(?<!entre\\s)(?<!mientras\\s)(?<![${COR_L}])m[aá]s\\s+(mejor|peor|menor)(es)?(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + (m[2] || ''),
    titulo: '«Más mejor»: el comparativo ya viene puesto',
    porque: '«Mejor», «peor» y «menor» ya son comparativos: llevan el «más» dentro (mejor = más bueno). Ponerles otro «más» delante es sumar dos veces lo mismo. Distinto es «mayor», que tiene regla propia: mirala en su tarjeta.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'así queda más mejor', bien: 'así queda mejor' },
  },
  {
    id: 'muy-isimo', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])muy\\s+(?!ilustrísim|santísim)([${COR_L}]+[ií]sim[oa]s?)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1],
    titulo: '«Muy buenísimo»: dos aceleradores a la vez',
    porque: 'El superlativo -ísimo ya lleva el adjetivo al grado máximo: «buenísimo» significa «muy bueno». Ponerle otro «muy» delante es pisar dos veces el mismo acelerador. Se elige uno de los dos caminos: «muy bueno» o «buenísimo», nunca los dos juntos.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'el almuerzo estaba muy buenísimo', bien: 'el almuerzo estaba buenísimo' },
  },
  {
    id: 'laismo', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<!me\\s)(?<!te\\s)(?<!se\\s)(?<!nos\\s)(?<![${COR_L}])la\\s+(dije|dijo|dijeron|pregunté|preguntó|preguntaron|contesté|contestó|contestaron|respondí|respondió|respondieron)\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'le ' + m[1] + ' que',
    titulo: '«La dije que…»: aquí toca «le»',
    porque: 'Con decir, preguntar, contestar y responder, la persona que recibe el mensaje es complemento indirecto: «le dije (a ella) que viniera». Lo que se dice es lo directo; a quien se le dice, indirecto. Usar «la» para ese papel es laísmo, propio del centro de España. Se marca para revisar porque a veces ese «la» sí es directo y se refiere a otra cosa nombrada antes.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'la dije que viniera temprano', bien: 'le dije que viniera temprano' },
  },
  {
    id: 'deber-de', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(debemos|debes|debés|deben|debo|debe)\\s+de\\s+(?!(?:ayer|alquiler|mujer|lugar|taller|azúcar|dólar|hogar)(?![${COR_L}]))([${COR_L}]*[aei]r(?:se)?)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] + ' ' + m[2],
    titulo: '«Debe de» o «debe»: depende de lo que digas',
    porque: 'La norma reparte el matiz: «debe llegar a las ocho» = obligación; «debe de estar llegando» = suposición o cálculo. Si tu frase manda, exige o recomienda, el «de» sobra: «debes estudiar». Si solo conjeturas («deben de ser las cinco»), el «de» es correcto (y también se admite sin él). Por eso este hallazgo se decide con tu ojo, no en automático.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'debes de estudiar más (obligación)', bien: 'debes estudiar más' },
  },
  {
    id: 'pegado-tras-punto', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`(?<=[${COR_L}][a-záéíóúüñ])(?<!www)\\.(?=[A-ZÁÉÍÓÚÜÑ])(?!(?:Com|Org|Net|Edu|Gob|Hn)(?![${COR_L}]))`, 'gu'),
    sug: () => '. ',
    titulo: 'Falta el espacio después del punto',
    porque: 'El punto va pegado a la palabra que cierra y separado de la que abre: «terminó. Luego» y nunca «terminó.Luego». Al teclear rápido el pulgar se come ese espacio, y en la maqueta las dos oraciones quedan soldadas. La regla solo salta con minúscula.Mayúscula, así los decimales (3.5), las abreviaturas dobladas (EE. UU., que, ojo, llevan espacio propio tras cada punto), las eras (d.C.) y los dominios (algo.com) quedan en paz.',
    norma: 'Ortotipografía',
    ejemplo: { mal: 'Llegó tarde.Otra vez será', bien: 'Llegó tarde. Otra vez será' },
  },
  {
    id: 'pegado-tras-dos-puntos', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`(?<![.#{;}=-][a-zA-Z0-9-]{0,30})(?<=[${COR_L}])(?<!https|http|mailto|tel):(?=[${COR_L}]+(?:[ \\n.,!?…]|$))`, 'giu'),
    sug: () => ': ',
    titulo: 'Falta el espacio después de los dos puntos',
    porque: 'Los dos puntos anuncian algo (una lista, una cita, una explicación) y ese anuncio necesita su pausa visual: «Nota: la reunión» y no «Nota:la reunión». Entre cifras sí van pegados (las 3:30). Se marca para revisar porque en nombres técnicos (una orden como build:www, un enlace) los dos puntos pegados son legítimos.',
    norma: 'Ortotipografía',
    ejemplo: { mal: 'Ingredientes:harina, huevos y sal', bien: 'Ingredientes: harina, huevos y sal' },
  },
  {
    id: 'pegado-tras-cierre', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`(?<=[${COR_L}])([?!])(?=[A-ZÁÉÍÓÚÜÑ])`, 'gu'),
    sugm: (m) => m[1] + ' ',
    titulo: 'Falta el espacio tras cerrar la pregunta o la exclamación',
    porque: 'Después de «?» o «!» empieza otra oración, y toda oración nueva pide su espacio: «¿Vienes? Claro» y no «¿Vienes?Claro». La regla espera una mayúscula al otro lado del signo, que es la señal inequívoca de que ahí arrancaba una frase nueva.',
    norma: 'Ortotipografía',
    ejemplo: { mal: '¿Vienes mañana?Claro que sí', bien: '¿Vienes mañana? Claro que sí' },
  },
  {
    id: 'espacio-tras-abrir', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`([¿¡]) +(?=\\S)`, 'gu'),
    sugm: (m) => m[1],
    titulo: 'Espacio de más tras el signo de abrir',
    porque: 'Los signos de apertura van pegados a la primera palabra de la pregunta o la exclamación: «¿Cómo?» y nunca «¿ Cómo?». Es la imagen espejo de la coma: la coma se pega a lo de antes, «¿» y «¡» se pegan a lo de después.',
    norma: 'Ortotipografía',
    ejemplo: { mal: '¿ Cómo te fue hoy?', bien: '¿Cómo te fue hoy?' },
  },
  {
    id: 'signos-repetidos', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`(?<![=&|!(])[!?]{2,}|[¡¿]{2,}`, 'gu'),
    sugm: (m) => { const t = m[0]; if (t.includes('¿')) return '¿'; if (t.includes('¡')) return '¡'; if (t.includes('?')) return '?'; return '!'; },
    titulo: 'Signos amontonados: con uno basta',
    porque: '«!!!» y «???» gritan en vez de decir. En prosa de revista, un solo signo bien puesto tiene más fuerza que tres: la sorpresa la pone la frase, no la tipografía. La RAE solo admite duplicarlos como recurso muy expresivo (cómics, diálogos encendidos); aquí conviene el signo simple.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: '¡Ganamos el torneo!!!', bien: '¡Ganamos el torneo!' },
  },
  {
    id: 'punto-doble', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`(?<![.…])(?<!etc)\\.\\.(?!\\.)`, 'giu'),
    sug: () => '.',
    titulo: 'Dos puntos seguidos: ¿punto o puntos suspensivos?',
    porque: 'Dos puntos seguidos no son nada en español: o sobraba uno (era un punto) o faltaba otro (eran los puntos suspensivos, que son exactamente tres: «…»). Casi siempre es un rebote del dedo, por eso se propone el punto simple; si querías dejar la frase en el aire, escribe los tres.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Se fue temprano.. y no volvió', bien: 'Se fue temprano. Y no volvió' },
  },
  {
    id: 'puntos-de-mas', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`(?<![.…])\\.{4,9}(?!\\.)`, 'gu'),
    sug: () => '…',
    titulo: 'Los puntos suspensivos son tres, ni uno más',
    porque: 'Los puntos suspensivos son exactamente tres (de hecho existen como un solo carácter: «…»). Cuatro, cinco o siete puntos no suspenden más: solo despeinan el renglón. Las ristras larguísimas (diez o más), que en un ejercicio pueden ser una línea para completar, se dejan en paz.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Y entonces..... nada', bien: 'Y entonces… nada' },
  },
  {
    id: 'elipsis-y-punto', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`…\\.+|\\.…`, 'gu'),
    sug: () => '…',
    titulo: 'Puntos suspensivos con punto de propina',
    porque: 'Los puntos suspensivos ya cierran la oración: nunca se les suma un punto más («se fue….» tiene cuatro). Sí conviven con otros signos (coma, interrogación: «¿vienes…?»), pero con el punto final jamás: los tres puntos ya lo llevan dentro.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Se fue para siempre….', bien: 'Se fue para siempre…' },
  },
  {
    id: 'etc-sin-punto', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])etc(?![${COR_L}])(?![.…])`, 'giu'),
    sug: () => 'etc.',
    titulo: '«Etc» siempre lleva su punto',
    porque: '«Etc.» es la abreviatura de «etcétera» y toda abreviatura carga su punto, incluso cuando después viene una coma: «lápices, etc., y más». Si la frase sigue, el punto de la abreviatura no la cierra: se sigue en minúscula tras la coma o el conector.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'cuadernos, lápices, etc en la mochila', bien: 'cuadernos, lápices, etc. en la mochila' },
  },
  {
    id: 'etc-puntos-de-mas', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])etc(?:\\.{2,}|\\.?…)`, 'giu'),
    sug: () => 'etc.',
    titulo: '«Etc.» con puntos de más',
    porque: 'A «etc.» le basta su punto de abreviatura: «etc..», «etc...» o «etc…» son redundantes. De hecho, «etcétera» y los puntos suspensivos dicen lo mismo (que la lista sigue), así que se usa uno u otro, nunca los dos juntos.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'lápices, borradores, etc... y más', bien: 'lápices, borradores, etc. y más' },
  },
  {
    id: 'coma-doble', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`,(?: *,)+`, 'gu'),
    sug: () => ',',
    titulo: 'Coma repetida',
    porque: 'Dos comas seguidas no existen en español: son un rebote del dedo o el rastro de una palabra que se borró y dejó su coma huérfana. Al releer, el ojo las salta; por eso conviene que las cace la máquina.',
    norma: 'Ortotipografía',
    ejemplo: { mal: 'trajo pan,, queso y miel', bien: 'trajo pan, queso y miel' },
  },
  {
    id: 'coma-y-punto', cat: 'tipografia', nivel: 'error',
    re: new RegExp(`[;,] *\\.(?![${COR_L}])(?![.0-9])`, 'gu'),
    sug: () => '.',
    titulo: 'Coma (o punto y coma) pegada al punto',
    porque: '«,.» y «;.» son dos señales de tráfico contradictorias en el mismo poste: una pide seguir, la otra parar. Casi siempre la frase quería terminar ahí, así que se queda el punto y la coma se va. Si en realidad la frase seguía, quita el punto tú.',
    norma: 'Ortotipografía',
    ejemplo: { mal: 'Terminamos el mural,. Quedó precioso', bien: 'Terminamos el mural. Quedó precioso' },
  },
  {
    id: 'coma-antes-pero', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])([${COR_L}]+) +pero(?![${COR_L}])`, 'gu'),
    sugm: (m) => m[1] + ', pero',
    titulo: '¿Le falta la coma a ese «pero»?',
    porque: 'Cuando «pero» une dos oraciones, la coma va delante: «es tarde, pero iremos». La excepción viva: entre dos adjetivos o adverbios cortos puede ir sin coma («lento pero seguro», «tarde pero llega»), y ahí decide el oído del que escribe. Por eso esta señal pide tu ojo en vez de corregir sola.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Es tarde pero iremos de todos modos', bien: 'Es tarde, pero iremos de todos modos' },
  },
  {
    id: 'conector-sin-coma', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`(?<=^|\\n|[.!?…»] )(Sin embargo|No obstante|Además|Por lo tanto|Por consiguiente|Es decir|O sea|Por ejemplo|En cambio|En primer lugar|Por último|Finalmente|Asimismo|Ahora bien|Aun así|De hecho|En efecto|Por cierto)(?= +[${COR_L}])(?! +(?:de|del|que)(?![${COR_L}]))`, 'gu'),
    sugm: (m) => m[0] + ',',
    titulo: 'Conector de arranque sin su coma',
    porque: '«Sin embargo», «además», «por lo tanto», «es decir»… son conectores: presentan la oración pero no forman parte de ella, y esa frontera se dibuja con una coma. Truco: al leer en voz alta, después del conector el aire hace una pausita; la coma es esa pausa por escrito. Revísalo tú porque con algunos («finalmente», «además») la coma es recomendable pero no siempre obligatoria.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Sin embargo salimos a caminar', bien: 'Sin embargo, salimos a caminar' },
  },
  {
    id: 'sin-embargo-inciso', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`, ?(sin embargo|no obstante) ?,`, 'gu'),
    sugm: (m) => '; ' + m[1] + ',',
    titulo: '«, sin embargo,» entre dos oraciones: pide punto y coma',
    porque: 'Cuando «sin embargo» une dos oraciones completas, delante va un punto y coma, no una coma: «Llovía mucho; sin embargo, salimos». La coma sola deja las dos oraciones mal cosidas. OJO: si es un inciso dentro de UNA sola oración («Juan, sin embargo, no vino»), las dos comas están perfectas y aquí no hay nada que tocar; por eso esta señal solo pregunta.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Llovía mucho, sin embargo, salimos', bien: 'Llovía mucho; sin embargo, salimos' },
  },
  {
    id: 'parentesis-sin-cerrar', cat: 'tipografia', nivel: 'revisa', zona: true,
    re: new RegExp(`\\((?![^()]{0,400}\\))[^()\\n]*`, 'gu'),
    titulo: 'Paréntesis que se abre y no se cierra',
    porque: 'Todo paréntesis que se abre queda esperando a su pareja, y hasta aquí no llegó. El lector se queda con el inciso abierto en la cabeza: búscale su «)» o quita el de apertura. Se marca para revisar porque en fragmentos técnicos (código, fórmulas, listas con «a)») un paréntesis suelto puede ser legítimo.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Trajo frutas (mangos y bananos para todos', bien: 'Trajo frutas (mangos y bananos) para todos' },
  },
  {
    id: 'comillas-sin-cerrar', cat: 'tipografia', nivel: 'error', zona: true,
    re: new RegExp(`«(?![^«»]{0,1200}»)[^«»\\n]*`, 'gu'),
    titulo: 'Comillas que se abren y no se cierran',
    porque: 'Las comillas latinas trabajan en pareja: «así». Si el párrafo termina y la cita sigue abierta, el lector no sabe dónde acaba la voz citada y dónde vuelve la tuya. Ponle su «»» donde termina la cita o quita las de apertura.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Dijo: «ya vuelvo y no volvió', bien: 'Dijo: «ya vuelvo» y no volvió' },
  },
  {
    id: 'pregunta-sin-cerrar', cat: 'tipografia', nivel: 'error', zona: true,
    re: new RegExp(`¿(?![^¿?]{0,250}\\?)[^¿?\\n]*`, 'gu'),
    titulo: 'Pregunta que se abre y no se cierra',
    porque: 'El «¿» promete un «?» antes de que acabe el párrafo, y aquí la promesa quedó pendiente: la entonación de pregunta no sabe dónde bajar. Es el error espejo del clásico «pregunta sin abrir»: en español los signos siempre son dos.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: '¿Vendrás mañana a la feria', bien: '¿Vendrás mañana a la feria?' },
  },
  {
    id: 'exclamacion-sin-cerrar', cat: 'tipografia', nivel: 'error', zona: true,
    re: new RegExp(`¡(?![^¡!]{0,250}!)[^¡!\\n]*`, 'gu'),
    titulo: 'Exclamación que se abre y no se cierra',
    porque: 'El «¡» pide su «!» antes del final del párrafo: sin él, la emoción queda flotando y el lector no sabe hasta dónde llegaba el énfasis. En español los signos de exclamación, como los de pregunta, van siempre en pareja.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: '¡Qué golazo el de anoche', bien: '¡Qué golazo el de anoche!' },
  },
  {
    id: 'coma-entre-sujeto-y-verbo', cat: 'tipografia', nivel: 'revisa', zona: true,
    re: new RegExp(`(?<=^|\\n|[.!?…] )(El|La|Los|Las|Un|Una) (?![^,\\n]* (?:es|son|fue|fueron|está|están|era|eran|tiene|tienen|hace|hacen|puede|pueden|debe|deben|va|van|será|serán|no|se|hay|que) )([^,;:.!?¿¡()«»\\n]{2,60}), +(?=(?:es(?! decir)|son|fue|fueron|está|están|era|eran|tiene|tienen|hace|hacen|puede|pueden|debe|deben|va|van|será|serán)(?![${COR_L}]))`, 'gu'),
    titulo: '¿Una coma entre el sujeto y su verbo?',
    porque: 'El sujeto no se separa de su verbo con una sola coma: «El director de la escuela es amable», sin pausa escrita aunque al hablar respiremos ahí. La llaman la «coma criminal». Lo que SÍ vale es el inciso entre DOS comas: «El director, que llegó tarde, es amable». Y si lo de delante no es el sujeto sino un complemento («El año pasado, fue difícil encontrar trabajo»), la coma también puede estar bien: por eso esta señal solo pregunta.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'El director de la escuela, es muy amable', bien: 'El director de la escuela es muy amable' },
  },
  {
    id: 'redundancia-direccion', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?:(sub(?:iendo|ieron|imos|ido|ir[áé]?n?|ía|ían|ió|í|e|en|es|o|a|an|amos))\\s+arriba|(baj(?:ando|aron|amos|ado|ar[áé]?n?|aba|aban|ó|é|a|an|as|o|e|en))\\s+abajo|(entr(?:ando|aron|amos|ado|ar[áé]?n?|aba|aban|ó|é|a|an|as|o|e|en))\\s+a?dentro|(sal(?:iendo|ieron|imos|ido|ir|dr[áé]n?|ía|ían|ió|í|e|en|es|go|ga|gan))\\s+a?fuera)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] || m[2] || m[3] || m[4],
    titulo: 'El verbo ya lleva la dirección',
    porque: 'Subir ya es hacia arriba, bajar ya es hacia abajo, quien entra va adentro y quien sale va afuera: el verbo trae la dirección incluida, así que el adverbio no añade nada y le roba paso a la frase. En el habla, la redundancia da énfasis y no pasa nada; en la página, sobra. Si el énfasis importa de verdad, se busca con otra cosa: «subió hasta el último piso».',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'El gato salió afuera corriendo', bien: 'El gato salió corriendo' },
  },
  {
    id: 'redundancia-pareja', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?:lapsos?\\s+de\\s+tiempo|per[íi]odos?\\s+de\\s+tiempo|protagonistas?\\s+principal(?:es)?|conclusi(?:ón|ones)\\s+final(?:es)?|consensos?\\s+general(?:es)?|nexos?\\s+de\\s+unión|erario\\s+público|sorpresas?\\s+inesperadas?|totalmente\\s+gratis)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[0].replace(/\s+de\s+(?:tiempo|unión)$|\s+(?:principal(?:es)?|final(?:es)?|general(?:es)?|público|inesperadas?)$/i, '').replace(/^totalmente\s+/i, ''),
    titulo: 'Pareja redundante: la segunda palabra sobra',
    porque: 'Hay parejas donde la segunda palabra repite lo que la primera ya dice: todo lapso es de tiempo, toda conclusión llega al final, toda sorpresa es inesperada y lo gratis ya es total. Quitar el añadido no resta información: deja la frase más liviana. Ojo, no toda pareja enfática es error («requisito imprescindible» es válido); estas son las que la tradición de corrección señala una y otra vez.',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'Fue un lapso de tiempo muy corto', bien: 'Fue un lapso muy corto' },
  },
  {
    id: 'redundancia-verbo', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?:(volver)\\s+a\\s+repetir|(vuelv(?:e|en|o|es|a|an)|volv(?:emos|ió|ieron|ía|ían|iendo|í|erán|erá|eré|amos))\\s+a\\s+repetir|(prev(?:er|én|é|eo|emos|ió|ieron|eía|eían|iendo|erán|erá|isto|ista|istos|istas))\\s+con\\s+(?:antelación|anticipación)|(insist(?:iendo|ieron|imos|ido|iera|ían|ía|ió|ir[áé]?n?|í|e|en|es|o))\\s+reiteradamente)(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1] ? 'repetir' : (m[2] ? null : (m[3] || m[4])),
    titulo: 'El verbo ya lo dice solo',
    porque: 'Repetir ya es volver a hacer, prever ya es ver con antelación e insistir ya trae la porfía puesta: añadirle el refuerzo es decir lo mismo dos veces. Salvedad honesta: «volver a repetir» puede ser legítimo si algo se repite por segunda vez; por eso esta regla pide tu ojo en vez de corregir sola.',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'Hay que prever con antelación los gastos', bien: 'Hay que prever los gastos' },
  },
  {
    id: 'es-por-eso-que', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?:es|fue|era)\\s+por\\s+(eso|ello|esto)\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => 'por ' + m[1].toLowerCase(),
    titulo: '«Es por eso que»: el que galicado',
    porque: '«Es por eso que llegué tarde» es un giro calcado del francés (el llamado «que galicado»). El español clásico dice «por eso llegué tarde», directo, o «es por eso por lo que…», completo. En América el giro corre con toda naturalidad y no es un pecado, pero la prosa gana músculo con la forma corta: casi siempre basta «por eso».',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Es por eso que llegamos tarde', bien: 'Por eso llegamos tarde' },
  },
  {
    id: 'muletillas-mas', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?:cabe\\s+señalar\\s+que|resulta\\s+evidente\\s+que|como\\s+bien\\s+sabemos|ni\\s+que\\s+decir\\s+tiene\\s+que|debo\\s+decir\\s+que|en\\s+el\\s+sentido\\s+de\\s+que|valga\\s+la\\s+redundancia)(?![${COR_L}])`, 'giu'),
    titulo: 'Muletilla de relleno (segunda tanda)',
    porque: 'Más frases que ocupan renglón sin cargar información: «cabe señalar que», «resulta evidente que» (si es evidente, ¿para qué decirlo?), «como bien sabemos» (si ya lo sabemos, no hace falta), «debo decir que» (mejor decirlo y ya). Bórralas y vuelve a leer la oración: casi siempre queda más firme sin ellas.',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'Cabe señalar que hubo lluvia', bien: 'Hubo lluvia' },
  },
  {
    id: 'el-dia-de-hoy', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?:en\\s+)?el\\s+día\\s+de\\s+hoy(?![${COR_L}])`, 'giu'),
    sug: () => 'hoy',
    titulo: '«El día de hoy» son cuatro palabras para «hoy»',
    porque: 'Hoy ya es un día: no hace falta aclararlo. «El día de hoy» suena a acta notarial o a noticiero leyendo el teleprompter; en una revista familiar, «hoy» dice exactamente lo mismo con la naturalidad de la conversación. Lo mismo vale para «el día de ayer» y «el día de mañana» cuando solo significan ayer y mañana.',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'El día de hoy celebramos el aniversario', bien: 'Hoy celebramos el aniversario' },
  },
  {
    id: 'de-cara-a', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])de\\s+cara\\s+al?(?![${COR_L}])`, 'giu'),
    sugm: (m) => /l$/i.test(m[0]) ? 'para el' : 'para',
    titulo: '«De cara a», comodín de niebla',
    porque: '«De cara a» se volvió comodín para casi cualquier «para», «ante» o «antes de»: «de cara a los exámenes», «de cara al futuro». No es incorrecto, pero es niebla: elegir la preposición precisa aclara la frase. Y ojo: si alguien se pone literalmente de cara a la pared, ahí la expresión es exacta y no se toca; por eso esta regla pide tu ojo.',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'Estudian de cara a los exámenes', bien: 'Estudian para los exámenes' },
  },
  {
    id: 'pasiva-con-agente', cat: 'estilo', nivel: 'revisa', zona: true,
    re: new RegExp(`(?<![${COR_L}])(?:(?:ha|han)\\s+sido|fue(?:ron)?|es|son|era(?:n)?|ser(?:á|án))\\s+(?!demasiad)((?:[A-Za-zñüÑÜ]{2,}[ai]|[A-Za-zñüÑÜ]+í)d[oa]s?)\\s+por(?![${COR_L}])`, 'giu'),
    titulo: 'Pasiva con agente: dale la vuelta',
    porque: '«El informe fue presentado por María» no es incorrecto (la pasiva es tan gramatical como la activa), pero da un rodeo: quien actuó llega al final y el verbo se parte en dos. Volteada a activa, «María presentó el informe», la frase es más corta, más directa y con la protagonista al frente. La pasiva se queda cuando el agente no importa o se desconoce; si hay un «por alguien» a la vista, casi siempre la activa gana en ritmo.',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'El informe fue presentado por María', bien: 'María presentó el informe' },
  },
  {
    id: 'cacofonia-cion', cat: 'estilo', nivel: 'revisa', zona: true,
    re: new RegExp(`(?<![${COR_L}])[${COR_L}]{2,}(?:ci|si)(?:ón|ones)(?:\\s+[${COR_L}]+){0,2}?\\s+[${COR_L}]{2,}(?:ci|si)(?:ón|ones)(?![${COR_L}])`, 'giu'),
    titulo: 'Rima involuntaria en -ción',
    porque: 'Dos terminaciones en -ción o -sión muy juntas riman sin querer y el oído tropieza: «la organización de la evaluación de la programación». Una revista se lee con el oído, y esa sonsonete distrae. Suele bastar con cambiar una de las dos por un verbo o un sinónimo: «organizar la evaluación», «cómo se evalúa el programa».',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'La organización de la evaluación fue lenta', bien: 'Organizar la evaluación llevó tiempo' },
  },
  {
    id: 'cosa-que', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?<!(?:una|la|esa|esta|otra|cualquier|alguna|ninguna|toda|cada|misma|única|poca|sola|gran|es|era|fue|son|sea)\\s)cosa\\s+que(?![${COR_L}])`, 'giu'),
    sug: () => 'lo que',
    titulo: '«Cosa que»: el comodín que no dice nada',
    porque: '«Cosa» es la palabra más comodín del idioma: cabe todo y no dice nada. En «llegó tarde, cosa que molestó», el relativo «lo que» hace el mismo trabajo con más elegancia: «llegó tarde, lo que molestó». Reserva «cosa» para cuando de verdad hables de una cosa: «esa cosa que brilla» está muy bien dicho.',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'Llegó tarde, cosa que molestó a todos', bien: 'Llegó tarde, lo que molestó a todos' },
  },
  {
    id: 'siendo-que', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])(?<!(?:sigue|siguió|seguía|seguirá|sigan?|continúa|continuaba|continuó|termina|terminó|terminaba|acaba|acabó|acababa|está|estaba|estuvo|iba|va)\\s)siendo\\s+que(?![${COR_L}])`, 'giu'),
    sug: () => 'ya que',
    titulo: '«Siendo que» causal',
    porque: '«Siendo que llovía, cancelaron el paseo» usa el gerundio como causa, un giro que la prosa cuidada evita porque las conjunciones causales de toda la vida lo dicen mejor y más claro: «ya que llovía», «como llovía», «puesto que llovía». Ojo: «el problema sigue siendo que…» es otra construcción, perfectamente correcta, y el corrector la deja en paz.',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'Siendo que llovía, cancelaron el paseo', bien: 'Ya que llovía, cancelaron el paseo' },
  },
  {
    id: 'mismamente', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])mismamente(?![${COR_L}])`, 'giu'),
    sug: () => 'precisamente',
    titulo: '«Mismamente», voz del habla popular',
    porque: '«Mismamente» vive en el habla popular y tiene su gracia, pero el diccionario lo marca como coloquial y en un texto de revista desentona. Según el matiz, sirven «precisamente», «justamente» o, muchas veces, nada: «aquí mismamente» es simplemente «aquí mismo». Revisa cuál le va a tu frase.',
    norma: 'RAE · DLE',
    ejemplo: { mal: 'Mismamente ayer lo vimos en la plaza', bien: 'Precisamente ayer lo vimos en la plaza' },
  },
  {
    id: 'y-o', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])y\\s*/\\s*o(?![${COR_L}])`, 'giu'),
    sug: () => 'o',
    titulo: '«Y/o»: con «o» basta',
    porque: 'La fórmula «y/o» viene del inglés jurídico (and/or) y en español casi nunca hace falta: la conjunción «o» no excluye («pueden traer lápices o crayones» admite perfectamente que traigan ambos). La Academia desaconseja «y/o» salvo en textos técnicos donde evite una ambigüedad real; en una revista, «o» a secas lee mejor.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Traigan lápices y/o crayones', bien: 'Traigan lápices o crayones' },
  },
  {
    id: 'comillas-rectas', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`"[^\\s"][^"\\n]{0,78}"`, 'gu'),
    sugm: (m) => '«' + m[0].slice(1, -1) + '»',
    titulo: 'Comillas rectas de máquina',
    porque: 'Las comillas rectas " son herencia de la máquina de escribir: valen para programar, no para publicar. La jerarquía del español empieza por las angulares «…», que además nunca se confunden con el apóstrofo ni con el símbolo de pulgadas. Para la revista: «así» en primer nivel, y las inglesas “…” solo para citar dentro de una cita.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Dijo "buenos días" al entrar', bien: 'Dijo «buenos días» al entrar' },
  },
  {
    id: 'cifra-pequena', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<=[${COR_L}] )(?<!(?:las?|el|los|del|al|a|y|o|u|casos?|piezas?|líneas?|campos?|comprobaciones?|palancas?|asignaciones?|asignación|normas?|errores?|error|mes|meses|capítulos?|páginas?|lecci(?:ón|ones)|grados?|nivel(?:es)?|tomos?|números?|núm|artículos?|unidad(?:es)?|tablas?|figuras?|misi(?:ón|ones)|fases?|pasos?|partes?|secci(?:ón|ones)|versículos?|salmos?|apartados?|incisos?|puntos?|preguntas?|ejercicios?|etapas?|tandas?|módulos?|mundos?|ids?|columnas?|filas?|rondas?|años?|días?) )[1-9](?= [${COR_L}])(?! al? [0-9])(?! de(?![${COR_L}]))(?! (?:km|kg|cm|mm|ml|gb|mb|kb|h|hrs?|min|seg|lps)(?![${COR_L}]))`, 'giu'),
    sug: m => ({ '1': 'uno', '2': 'dos', '3': 'tres', '4': 'cuatro', '5': 'cinco', '6': 'seis', '7': 'siete', '8': 'ocho', '9': 'nueve' })[m.toLowerCase()],
    titulo: 'Cifra pequeña en medio de la prosa',
    porque: 'La Ortografía académica recomienda escribir con letra, en prosa corriente, los números cortos; los libros de estilo de prensa concretan el hábito: del uno al nueve, con letra («compró tres libros»), y del 10 en adelante, con cifra. Es la convención que adopta la revista. Fechas, horas, porcentajes y medidas siempre van en cifra.',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'Compró 3 libros en la feria', bien: 'Compró tres libros en la feria' },
  },
  {
    id: 'coma-sujeto-clitico', cat: 'tipografia', nivel: 'revisa', zona: true,
    re: new RegExp(`(?<=^|\\n|[.!?…] )(?!(?:Una vez|Un día|Una tarde|Una noche|Una mañana|El día|El año|El mes|El lunes|El martes|El miércoles|El jueves|El viernes|El sábado|El domingo|La semana|La tarde|La mañana|La noche)(?![${COR_L}]))((?:El|La|Los|Las|Un|Una) [^,;:.!?¿¡()«»\\n]{2,70}), +(?=(?:nos|me|te|le|les) +[${COR_L}]+(?:ó|aron|ieron|eron|aba|aban|ía|ían)(?![${COR_L}]) *[^,\\n])`, 'gu'),
    titulo: '¿Una coma entre el sujeto y su verbo?',
    porque: 'Cuando el sujeto es largo («Las filosofías y creencias que uno va cargando en la vida») dan ganas de respirar con una coma antes del verbo. Pero el sujeto no se separa de su verbo con una sola coma, por largo que sea: la pausa se hace con el aire, no con el signo. Lo que SÍ vale es el inciso entre DOS comas. Y si lo de delante era un complemento y no el sujeto, la coma puede estar bien: por eso esta señal solo pregunta.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Las lecciones que aprendimos, nos marcaron', bien: 'Las lecciones que aprendimos nos marcaron' },
  },
  {
    id: 'conector-sin-coma-medio', cat: 'tipografia', nivel: 'revisa',
    re: new RegExp(`[,;] +(sin embargo|no obstante|por lo tanto|por consiguiente|es decir|o sea|por ejemplo|en cambio|aun así|ahora bien|de hecho|en efecto|por último|en primer lugar)(?= +[${COR_L}])(?! +(?:de|del|que)(?![${COR_L}]))`, 'giu'),
    sugm: (m) => m[0] + ',',
    titulo: 'Conector sin su coma de cierre',
    porque: 'Los conectores del discurso (sin embargo, es decir, por ejemplo…) van aislados entre comas: una antes y otra después. «…del maestro español, sin embargo mientras no encuentre…» deja al conector pegado a lo que sigue y el lector entona mal. La coma de cierre le devuelve su casilla: «…, sin embargo, mientras…».',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'Lo intenté, sin embargo nada cambió', bien: 'Lo intenté; sin embargo, nada cambió' },
  },
  {
    id: 'mas-mayor-que', cat: 'gramatica', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])m[aá]s\\s+(mayor|menor)(es)?\\s+que(?![${COR_L}])`, 'giu'),
    sugm: (m) => m[1].toLowerCase() + (m[2] || '') + ' que',
    titulo: '«Más mayor que», comparación doblada',
    porque: 'En una comparación, «mayor» y «menor» ya llevan el «más» dentro: «es mayor que yo», nunca «más mayor que yo». El «más» extra solo se admite cuando NO se compara, con el sentido de hacerse grande: «ya está más mayor» (mira la tarjeta de «más mayor»).',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'Mi hermana es más mayor que yo', bien: 'Mi hermana es mayor que yo' },
  },
  {
    id: 'mas-mayor', cat: 'gramatica', nivel: 'revisa',
    re: new RegExp(`(?<!cuant[oa]s?\\s)(?<!cuánt[oa]s?\\s)(?<![${COR_L}])m[aá]s\\s+mayor(es)?(?![${COR_L}])(?!\\s+que(?![${COR_L}]))`, 'giu'),
    titulo: '«Más mayor», depende',
    porque: 'Comparando, sobra el «más»: «es mayor que yo». Pero sin comparación, con el sentido de «grandecito, de más edad», la Academia lo admite: «cuando seas más mayor lo entenderás», «ya está muy mayor». Si tu frase compara con «que», quítale el «más»; si habla de hacerse grande, puede quedarse.',
    norma: 'RAE · DPD',
    ejemplo: { mal: 'es más mayor que su primo', bien: 'es mayor que su primo' },
  },
  {
    id: 'que-que', cat: 'estilo', nivel: 'revisa',
    re: new RegExp(`(?<![${COR_L}])[Qq]ue\\s+que(?![${COR_L}])`, 'gu'),
    titulo: '«Que que»: ¿tecleo o gramática?',
    porque: 'Casi siempre es un dedo que tropezó: «dijo que que vendría». Pero el doble «que» legítimo existe cuando el segundo abre un sujeto oracional: «Creo que que venga tan tarde es mala señal». Si es lo primero, sobra uno; si es lo segundo, suele leerse mejor reformulando: «Creo que venir tan tarde…».',
    norma: 'Revisión de estilo',
    ejemplo: { mal: 'Nos dijo que que vendría pronto', bien: 'Nos dijo que vendría pronto' },
  },
  {
    id: 'ultimo-con-articulo', cat: 'ortografia', nivel: 'error',
    re: new RegExp(`(?<![${COR_L}])(el|la|los|las|del|al|este|esta|estos|estas|mi|tu|su|nuestro|nuestra) ultim(o|a|os|as)(?![${COR_L}])(?!\\s+(?:los|las|el|la|un|una|sus|mis|esta|este|estos|estas|esa|ese)(?![${COR_L}]))`, 'giu'),
    sugm: (m) => m[1] + ' últim' + m[2].toLowerCase(),
    titulo: '«Ultimo» sin su tilde',
    porque: 'Con artículo o posesivo delante es el adjetivo «último», esdrújula, y las esdrújulas llevan tilde todas: «el último día», «su última carta». La cautela viene de que «ultimo» a secas puede ser el verbo ultimar («yo ultimo los detalles»): por eso esta regla solo salta cuando el artículo delata al adjetivo.',
    norma: 'RAE · Ortografía 2010',
    ejemplo: { mal: 'el ultimo día del mes', bien: 'el último día del mes' },
  },
  {
    id: 'que-pregunta', cat: 'ortografia', nivel: 'revisa',
    re: new RegExp(`(¿\\s*(?:(?:[Yy]|[Pp]ero|[Ee]ntonces|[Bb]ueno|[Oo])\\s+)?)([Qq]ue)(?![${COR_L}])(?!\\s+(?:no|sí|si|ya|acaso)(?![${COR_L}]))`, 'gu'),
    sugm: (m) => m[1] + (/^Q/.test(m[2]) ? 'Qué' : 'qué'),
    titulo: '«¿Que…» · ¿pregunta o eco?',
    porque: 'Si la pregunta PIDE algo («¿qué pasó?», «¿qué tal?»), «qué» lleva su tilde diacrítica. Pero el «que» átono sin tilde también abre preguntas legítimas cuando repite o replica lo ya dicho: «¿Que no quiere gas? Pues eso dijo» (ejemplo de la propia Academia). Léela en voz alta: si el «que» suena golpeado, tilde; si se desliza, déjalo.',
    norma: 'RAE · DPD',
    ejemplo: { mal: '¿que pasó ayer?', bien: '¿qué pasó ayer?' },
  },
  /* ═══ FIN-REGLAS-AMPLIADAS ═══ */
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
    const con = { como: 'cómo', cuando: 'cuándo', donde: 'dónde', cuanto: 'cuánto',
      cuanta: 'cuánta', cuantos: 'cuántos', cuantas: 'cuántas', quien: 'quién', quienes: 'quiénes',
      cual: 'cuál', cuales: 'cuáles' }[m[2].toLowerCase()];
    // «¿Como fue?» hereda su mayúscula: «¿Cómo fue?»
    const conMayus = /^[A-ZÁÉÍÓÚÑ]/.test(m[2]) ? con.charAt(0).toUpperCase() + con.slice(1) : con;
    return m[1] + conMayus;
  }
  if (typeof regla.sugm === 'function') {
    /* sugm recibe el match ENTERO (con sus grupos), para las reglas
       que arman la corrección con piezas: «daba la casualidad que»
       necesita saber qué verbo casó para reponerlo. */
    const s = regla.sugm(m);
    return s === null || s === undefined ? null : corMayus(t, s);
  }
  if (typeof regla.sug === 'function') {
    const s = regla.sug(t);
    return s === null || s === undefined ? null : corMayus(t, s);
  }
  return null;
}

/* La palabra duplicada legítima existe («había había»… no; pero «muy muy»
   coloquial sí): las poquitas aceptables se dejan pasar. La risa escrita
   (ja ja) también; y «que que» tiene su propia regla 'revisa' (que-que),
   porque el doble que gramatical existe: «creo que que venga es señal». */
const COR_DUP_OK = new Set(['muy', 'ya', 'no', 'ja', 'je', 'jo', 'que']);

/* ── El paso del diccionario: palabras que no existen ─────────────
   Las reglas cazan errores DE NORMA; esto caza el tecleo puro:
   «conveza» no infringe ninguna regla, simplemente no es una
   palabra. Se consulta el diccionario grande (js/tools/diccionario.js)
   y para cada desconocida se pescan sugerencias. */
const R_TECLEO = {
  id: 'tecleo', cat: 'ortografia', nivel: 'error', manual: true,
  titulo: 'Palabra que el diccionario no encuentra',
  porque: 'Esta palabra no aparece entre las 570.000 formas del diccionario del español (variante hondureña) ni en el diccionario de la casa. Casi siempre es un tecleo: una letra que falta, sobra o bailó, o una tilde en la sílaba equivocada. Si es una palabra tuya de verdad (un apellido, un lugar, una voz nuestra) enséñasela al corrector con «A mi diccionario» y no la vuelve a marcar.',
  norma: 'Diccionario es_HN · RLA-ES',
  ejemplo: { mal: 'que me conveza con su lucidez', bien: 'que me convenza con su lucidez' },
};
const R_PROPIO = {
  id: 'nombre-propio', cat: 'ortografia', nivel: 'revisa', manual: true,
  titulo: '¿Nombre propio… o tecleo?',
  porque: 'Empieza con mayúscula en medio de la oración y el diccionario no la conoce: puede ser un nombre propio legítimo (un apellido, un lugar, una marca) o un tecleo disfrazado. Si es un nombre que vas a volver a usar, enséñaselo al corrector con «A mi diccionario»; si no, revisa las sugerencias.',
  norma: 'Diccionario es_HN · RLA-ES',
  ejemplo: { mal: 'el filósofo Gustabo Bueno', bien: 'el filósofo Gustavo Bueno' },
};

/* Lo que el diccionario no debe tocar: URLs, correos y dominios */
const COR_URLS = /(?:https?:\/\/|www\.)[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+|[A-Za-z0-9-]+\.(?:com|org|net|es|hn|edu|gob|info|io|app|dev|me)(?:\/[^\s]*)?(?![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g;

/* ¿El tramo empieza oración? (para saber si una Mayúscula es de
   inicio o de nombre propio) */
function corInicioDeOracion(texto, i) {
  for (let j = i - 1; j >= 0; j--) {
    const c = texto[j];
    if (' \t"«»“”\'’(¿¡—–·*'.includes(c)) continue;
    return c === '\n' || c === '.' || c === '!' || c === '?' || c === '…' || c === ':' || c === '￼';
  }
  return true;
}

function corAnalizarDiccionario(texto, campo, hallazgos) {
  if (typeof diccListo !== 'function' || !diccListo()) return;
  const mascara = [];
  let mU;
  COR_URLS.lastIndex = 0;
  while ((mU = COR_URLS.exec(texto))) mascara.push([mU.index, mU.index + mU[0].length]);
  const reTok = new RegExp(`[${COR_L}]+`, 'gu');
  let m;
  while ((m = reTok.exec(texto))) {
    const w = m[0], ini = m.index, fin = ini + w.length;
    if (w.length < 2 || w.length > 30) continue;
    if (mascara.some(([a, b]) => ini >= a && fin <= b)) continue;
    const antes = texto[ini - 1], despues = texto[fin];
    if (antes && /[0-9@#_/-]/.test(antes)) continue;   // «covid19», «#tag», «@usuario», «pre-» partida
    if (despues && /[0-9_/-]/.test(despues)) continue;
    if (w === w.toUpperCase()) continue;               // siglas y VOCES EN ALTO: no se acusan
    if (/[a-záéíóúüñ][A-ZÁÉÍÓÚÜÑ]/u.test(w)) continue; // CamelCase: marcas y código
    if (diccConoce(w)) continue;
    const esMayus = /^[A-ZÁÉÍÓÚÜÑ]/u.test(w);
    const sugs = diccSugerencias(w, 4).map(s => corMayus(w, s));
    hallazgos.push({
      campo, ini, fin, original: w,
      sugerencia: sugs.length ? sugs[0] : null,
      otras: sugs.slice(1), aprender: w,
      regla: (esMayus && !corInicioDeOracion(texto, ini)) ? R_PROPIO : R_TECLEO,
    });
  }
}

/* Arrancar el diccionario y volver a analizar cuando esté listo:
   la primera revisión de la sesión sale solo con las reglas y unos
   segundos después se le suman los tecleos, sin que nadie espere. */
function corDiccAsegura() {
  if (typeof diccArrancar !== 'function') return;
  /* Desde 'fallo' también se reintenta: un wifi caído al abrir el
     corrector no puede dejar la caza de tecleos muerta toda la
     sesión. diccArrancar ya se protege sola de 'cargando'/'listo'. */
  if (diccEstado() !== 'apagado' && diccEstado() !== 'fallo') return;
  diccArrancar();
  diccAlTerminar(ok => {
    /* Solo si llegó BIEN hay algo nuevo que enseñar (los tecleos).
       En fallo no se toca el panel: re-renderizar aquí borraba la
       tarjeta activa que corAbrirEn acababa de destacar. */
    if (!ok) return;
    const overlay = document.getElementById('cor-overlay');
    const abierto = overlay && overlay.style.display === 'flex';
    if (abierto || _corPintado) {
      corAnalizar();
      corPintar();
      if (abierto) corRender();
      corActualizarPildora();
    }
  });
}

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
      // «Bora Bora», «Baden Baden»: la reduplicación de nombre propio
      // (ambas con Mayúscula) no es un tropiezo de tecleo.
      if (regla.id === 'duplicada' && /^[A-ZÁÉÍÓÚÜÑ]/u.test(m[1]) &&
          /^[A-ZÁÉÍÓÚÜÑ]/u.test(m[0].slice(m[0].length - m[1].length))) continue;
      const sug = corSugerencia(regla, m);
      hallazgos.push({ campo, ini: m.index, fin: m.index + m[0].length,
        original: m[0], sugerencia: sug, regla });
      if (m.index === regla.re.lastIndex) regla.re.lastIndex++;   // por si el patrón casa vacío
    }
  }

  /* Reglas de oración. Antes de razonar por oraciones se tapan URLs
     y citas entrecomilladas: el «?» de una consulta web o de un
     título extranjero («Why not?») no es una pregunta del texto, y
     el punto de ejemplo.com no cierra oración. El tapado conserva
     el largo, así que los índices siguen cuadrando con el texto. */
  let textoOra = texto;
  COR_URLS.lastIndex = 0;
  textoOra = textoOra.replace(COR_URLS, u => u.replace(/[.!?¿¡…:]/g, '~'));
  textoOra = textoOra.replace(/"[^"\n]{1,120}"|«[^»\n]{1,160}»|“[^”\n]{1,160}”/g,
    c => c.replace(/[!?¿¡]/g, '~'));
  const oraciones = corOraciones(textoOra);
  const R_ABRIR_INT = {
    id: 'abrir-pregunta', cat: 'tipografia', nivel: 'error', titulo: 'Pregunta sin abrir',
    zona: true,
    porque: 'El español abre y cierra: ¿…? El signo de apertura existe porque (a diferencia del inglés) aquí nada al inicio de la frase avisa de que viene una pregunta; sin él, el lector entona mal y relee.',
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
    zona: true,   // subraya la oración entera: es señal de fondo, no botón
    porque: 'Más de 45 palabras sin un punto: el lector llega al final sin aire y sin recordar el inicio. Casi siempre hay dos o tres ideas ahí dentro pidiendo su propia oración. El punto es gratis.',
    norma: 'Estilo periodístico',
    ejemplo: null,
  };
  const R_ECO = {
    id: 'eco', cat: 'estilo', nivel: 'revisa', titulo: 'Palabra que hace eco',
    porque: 'La misma palabra dos veces en pocas líneas resuena al leer en voz alta (y una revista se lee con el oído). Un sinónimo, un pronombre o reordenar la frase deshacen el eco.',
    norma: 'Estilo periodístico',
    ejemplo: { mal: 'El proyecto del proyecto educativo', bien: 'El proyecto del plan educativo' },
  };
  const R_MENTE = {
    id: 'mente', cat: 'estilo', nivel: 'revisa', titulo: 'Racimo de adverbios en -mente',
    zona: true,
    porque: 'Tres o más «-mente» en un mismo párrafo cargan el ritmo (realmente, obviamente, claramente…). Suele bastar uno; los demás se cambian por formas cortas: «con claridad», «de verdad», o nada.',
    norma: 'Estilo periodístico',
    ejemplo: null,
  };

  oraciones.forEach(o => {
    const abre = o.txt.includes('¿'), cierra = o.txt.includes('?');
    if (cierra && !abre) {
      const off = o.ini + (o.txt.match(/^\s*/)[0] || '').length;
      // hlFin: al subrayar se pinta la oración entera, que es lo que está cojo
      hallazgos.push({ campo, ini: off, fin: off, hlFin: o.fin, original: '', sugerencia: '¿', regla: R_ABRIR_INT });
    }
    const abreE = o.txt.includes('¡'), cierraE = o.txt.includes('!');
    if (cierraE && !abreE) {
      const off = o.ini + (o.txt.match(/^\s*/)[0] || '').length;
      hallazgos.push({ campo, ini: off, fin: off, hlFin: o.fin, original: '', sugerencia: '¡', regla: R_ABRIR_EXC });
    }
    const m0 = o.txt.match(/^(\s*)([a-záéíóúñ])/u);
    if (m0 && o.ini > 0) {
      const off = o.ini + m0[1].length;
      hallazgos.push({ campo, ini: off, fin: off + 1, original: m0[2],
        sugerencia: m0[2].toUpperCase(), regla: R_MAYUS });
    }
    const palabras = o.txt.split(/\s+/).filter(Boolean);
    if (palabras.length > 45) {
      // ancho cero + hlIni/hlFin, como las preguntas sin abrir: la zona
      // se subraya entera pero no reclama el tramo, para que los
      // errores DE DENTRO de la oración larga no desaparezcan.
      hallazgos.push({ campo, ini: o.ini, fin: o.ini, hlIni: o.ini, hlFin: o.fin,
        original: o.txt.trim(), sugerencia: null, regla: R_LARGA });
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

  /* El diccionario, al final: si una regla ya reclamó ese tramo
     («educacion» es de la regla -ción, que enseña mejor), el
     descarte de solapes de abajo se queda con la regla. */
  corAnalizarDiccionario(texto, campo, hallazgos);

  /* Sin solapes: gana el que empieza antes (y el más largo si empatan).
     Las ZONAS (oración kilométrica, racimo de -mente, pareja sin
     cerrar…) conviven con todo: ni bloquean ni son bloqueadas. Sin
     esta excepción, una oración de 46 palabras se tragaba en silencio
     todos los errores reales que llevaba dentro. */
  hallazgos.sort((a, b) => a.ini - b.ini || b.fin - a.fin);
  const limpios = [];
  let tope = -1;
  for (const h of hallazgos) {
    if (h.regla.zona) { limpios.push(h); continue; }
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
let _corPintado = false;   // ¿hay subrayados puestos sobre el texto?

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
  // Se cuenta PRESENCIA por revisión, no cada aparición: una nota con
  // ocho oraciones largas revisada diez veces marcaba «80 veces» y eso
  // no mide el hábito, lo infla. «Se te repite en 10 revisiones» sí.
  new Set(hallazgos.map(h => h.regla.id)).forEach(id => {
    const regla = hallazgos.find(h => h.regla.id === id).regla;
    st[id] = st[id] || { n: 0, titulo: regla.titulo };
    st[id].n++;
    st[id].titulo = regla.titulo;
  });
  try { localStorage.setItem(COR_STATS_KEY, JSON.stringify(st)); } catch (_) {}
}

/* ── Subrayar los hallazgos SOBRE el propio texto ──────────────────
   Buscar a ojo «la palabra que hace eco» en un artículo largo es
   trabajo a medias: el corrector debe señalar el punto exacto. Se usa
   la API de resaltado del navegador (CSS Custom Highlight): pinta
   rangos SIN tocar el HTML, así el autoguardado nunca se lleva una
   marca de color dentro de la nota. Cada categoría con su color, el
   mismo de su etiqueta en el panel. */

const COR_HL_GRUPOS = { ortografia: 'corr-orto', gramatica: 'corr-gram', estilo: 'corr-estilo', tipografia: 'corr-tipo' };
const COR_HL_TODOS = ['corr-orto', 'corr-gram', 'corr-estilo', 'corr-tipo', 'corr-activa'];

function corSoportaPintura() {
  return typeof Highlight !== 'undefined' && window.CSS && CSS.highlights;
}

/* El rango DOM de un hallazgo del cuerpo (puede cruzar negritas: para
   subrayar da igual, aunque para corregirse solo necesite un nodo). */
function corRango(h) {
  if (h.campo !== 'cuerpo' || !_corMapa) return null;
  const ini = (h.hlIni !== undefined) ? h.hlIni : h.ini;
  const fin = (h.hlFin !== undefined) ? h.hlFin : h.fin;
  const tIni = _corMapa.tramos.find(t => t.ini <= ini && ini <= t.fin);
  const tFin = _corMapa.tramos.find(t => t.ini <= fin && fin <= t.fin);
  if (!tIni || !tFin) return null;
  const r = document.createRange();
  try {
    r.setStart(tIni.node, ini - tIni.ini);
    r.setEnd(tFin.node, fin - tFin.ini);
  } catch (_) { return null; }
  return r;
}

function corDespintar() {
  if (corSoportaPintura()) COR_HL_TODOS.forEach(k => CSS.highlights.delete(k));
  _corPintado = false;
  const pildora = document.getElementById('cor-pildora');
  if (pildora) pildora.style.display = 'none';
}

function corPintar() {
  _corHallazgos.forEach(h => { h._rango = corRango(h); });
  if (!corSoportaPintura()) return false;
  COR_HL_TODOS.forEach(k => CSS.highlights.delete(k));
  const grupos = {};
  _corHallazgos.forEach(h => {
    if (!h._rango) return;
    const g = COR_HL_GRUPOS[h.regla.cat];
    (grupos[g] = grupos[g] || []).push(h._rango);
  });
  let n = 0;
  Object.entries(grupos).forEach(([g, rangos]) => {
    CSS.highlights.set(g, new Highlight(...rangos));
    n += rangos.length;
  });
  _corPintado = n > 0;
  corActualizarPildora();
  return true;
}

/* La píldora flotante: con el panel cerrado y el texto subrayado, es el
   camino de vuelta al corrector sin perder el hilo. */
function corActualizarPildora() {
  const pildora = document.getElementById('cor-pildora');
  if (!pildora) return;
  const enCuerpo = _corHallazgos.filter(h => h._rango).length;
  const abierto = document.getElementById('cor-overlay')?.style.display === 'flex';
  pildora.style.display = (_corPintado && !abierto && enCuerpo) ? 'flex' : 'none';
  if (enCuerpo) pildora.innerHTML =
    `<i class="fa-solid fa-spell-check"></i> ${enCuerpo} marcado${enCuerpo === 1 ? '' : 's'} en el texto`;
}

/* Ir desde una tarjeta hasta su lugar exacto en el texto */
function corIrAlTexto(i) {
  const h = _corHallazgos[i];
  if (!h || !h._rango) return;
  corCerrar();
  const rect = h._rango.getBoundingClientRect();
  const scroll = document.querySelector('#view-redaccion-editor .view-scroll');
  if (scroll && rect.height) {
    scroll.scrollBy({ top: rect.top - window.innerHeight * 0.35, behavior: 'smooth' });
  }
  if (corSoportaPintura()) {
    CSS.highlights.set('corr-activa', new Highlight(h._rango));
  } else {
    // Sin la API (navegador viejo): se selecciona, que también se ve
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(h._rango); }
  }
  corActualizarPildora();
}

/* Y el camino inverso: tocar lo subrayado abre su tarjeta */
function corPuntoARango(x, y) {
  if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    if (!p) return null;
    const r = document.createRange();
    r.setStart(p.offsetNode, p.offset);
    return r;
  }
  return null;
}

function corHallazgoEnPunto(x, y) {
  const punto = corPuntoARango(x, y);
  if (!punto) return -1;
  // Las «zonas» (oración kilométrica, pregunta sin abrir…) se subrayan
  // pero NO responden al toque: tocar dentro de una oración larga para
  // ponerle su punto reabría el panel una y otra vez, justo cuando se
  // intentaba obedecerlo. Si varios hallazgos se solapan, gana el más
  // pequeño: la palabra, no la oración que la envuelve.
  let mejor = -1, mejorTam = Infinity;
  _corHallazgos.forEach((h, i) => {
    if (!h._rango || h.regla.zona) return;
    try {
      if (!h._rango.isPointInRange(punto.startContainer, punto.startOffset)) return;
    } catch (_) { return; }
    const tam = (h.hlFin !== undefined ? h.hlFin : h.fin) - (h.hlIni !== undefined ? h.hlIni : h.ini);
    if (tam < mejorTam) { mejor = i; mejorTam = tam; }
  });
  return mejor;
}

function corAbrirEn(indice) {
  corAbrir();
  const lista = document.getElementById('cor-lista');
  const carta = lista && lista.children[indice];
  if (carta) {
    carta.classList.add('cor-card-activa');
    carta.scrollIntoView({ block: 'center' });
  }
}

/* ── La burbuja: explicación al toque, sin taparte el texto ────────
   Tocar una palabra subrayada ya no abre el panel entero (se plantaba
   delante justo cuando se quería corregir a mano). Sale una burbuja
   pequeña con el título del hallazgo, «Corregir» si es automático y
   «¿Por qué?» para quien quiera la lección completa. Se esfuma sola
   al escribir, al desplazarse o al tocar en otra parte. */

function corOcultarBurbuja() {
  const b = document.getElementById('cor-burbuja');
  if (b) b.style.display = 'none';
}

function corMostrarBurbuja(indice, x, y) {
  const b = document.getElementById('cor-burbuja');
  const h = _corHallazgos[indice];
  if (!b || !h) return;
  const cat = COR_CATS[h.regla.cat];
  b.innerHTML = `
    <div class="cor-burbuja-titulo"><span class="cor-chip ${cat.cls}">${cat.nombre}</span> ${redEsc(h.regla.titulo)}</div>
    ${h.sugerencia !== null && h.sugerencia !== undefined && h.original !== h.sugerencia
      ? `<div class="cor-burbuja-cambio">${redEsc(h.original || '∅')} → <b>${redEsc(h.sugerencia)}</b></div>` : ''}
    <div class="cor-burbuja-btns">
      ${corEsAplicable(h) ? `<button type="button" class="cor-burbuja-fix" data-bur-fix="${indice}">✓ Corregir</button>` : ''}
      ${h.aprender && typeof diccAprender === 'function'
        ? `<button type="button" class="cor-burbuja-apr" data-bur-apr="${indice}">📖 Aprender</button>` : ''}
      <button type="button" class="cor-burbuja-por" data-bur-por="${indice}">¿Por qué?</button>
    </div>`;
  b.style.display = 'block';
  // Cerca del dedo pero dentro de la pantalla, y por encima del punto
  const ancho = Math.min(280, window.innerWidth - 20);
  b.style.left = Math.max(10, Math.min(x - ancho / 2, window.innerWidth - ancho - 10)) + 'px';
  const alto = b.offsetHeight || 90;
  b.style.top = Math.max(8, y - alto - 16) + 'px';

  b.querySelector('[data-bur-fix]')?.addEventListener('click', () => {
    const hh = _corHallazgos[indice];
    corOcultarBurbuja();
    if (hh && corAplicar(hh)) {
      redQueueSave();
      corAnalizar();
      corPintar();
      if (typeof toast === 'function') toast('✅ Corregido');
    }
  });
  b.querySelector('[data-bur-por]')?.addEventListener('click', () => {
    corOcultarBurbuja();
    corAbrirEn(indice);
  });
  b.querySelector('[data-bur-apr]')?.addEventListener('click', () => {
    const hh = _corHallazgos[indice];
    corOcultarBurbuja();
    if (!hh || !hh.aprender) return;
    diccAprender(hh.aprender);
    corAnalizar();
    corPintar();
    if (typeof toast === 'function') toast('📖 Aprendida: ' + hh.aprender);
  });
}

/* ── Aplicar una corrección sin romper el HTML ──
   Con cinturón: antes de tocar nada se comprueba que en ese tramo
   siga estando LO QUE SE VA A CORREGIR. Si el escritor tecleó después
   del análisis, los índices apuntan a texto viejo, y aplicar a ciegas
   corrompía la nota en silencio («Sí,educacióncion…»). Si no cuadra,
   no se toca nada: el re-análisis pondrá el hallazgo donde toca. */
function corAplicar(h) {
  if (h.sugerencia === null || h.sugerencia === undefined) return false;

  if (h.campo === 'titulo' || h.campo === 'entradilla') {
    const el = document.getElementById(h.campo === 'titulo' ? 'red-e-titulo' : 'red-e-entradilla');
    if (!el) return false;
    if (h.original && el.value.slice(h.ini, h.fin) !== h.original) return false;
    el.value = el.value.slice(0, h.ini) + h.sugerencia + el.value.slice(h.fin);
    return true;
  }

  /* En el cuerpo: localizar el tramo (nodo de texto) que contiene el rango */
  const tramo = _corMapa.tramos.find(t => t.ini <= h.ini && h.fin <= t.fin);
  if (!tramo) return false;   // partido por formato: se corrige a mano
  const rel0 = h.ini - tramo.ini, rel1 = h.fin - tramo.ini;
  const v = tramo.node.nodeValue;
  if (h.original && v.slice(rel0, rel1) !== h.original) return false;
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
  /* Un tecleo (regla.manual) nunca entra en la corrección en masa:
     su primera sugerencia suele ser la buena, pero no siempre, y
     cambiar palabras a ciegas es de mal corrector. */
  const seguras = hs.filter(h => h.regla.nivel === 'error' && !h.regla.manual && corEsAplicable(h));

  /* El diccionario grande avisa de en qué anda */
  const diccLinea = typeof diccEstado !== 'function' ? '' :
    diccEstado() === 'cargando'
      ? '<div class="cor-dicc-nota">📖 El diccionario grande (570.000 formas) se está cargando en segundo plano: la caza de tecleos como «conveza» llegará sola en unos segundos.</div>'
      : diccEstado() === 'fallo'
        ? '<div class="cor-dicc-nota">📖 El diccionario no se pudo cargar esta vez: se revisó la norma y el estilo, pero no el tecleo. Con conexión (una sola vez) quedará guardado.</div>'
        : '';

  resumen.innerHTML = (hs.length
    ? Object.keys(COR_CATS).filter(c => porCat[c]).map(c =>
        `<span class="cor-chip ${COR_CATS[c].cls}">${COR_CATS[c].nombre} · ${porCat[c]}</span>`).join('') +
      (seguras.length ? `<button type="button" class="cor-aplicar-todo" id="cor-aplicar-todo">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Corregir las ${seguras.length} seguras</button>` : '')
    : '<div class="cor-limpio">✨ Ni un hallazgo. El texto está limpio de todo lo que este corrector sabe mirar.</div>') + diccLinea;

  /* La memoria: lo que más se repite entre notas */
  const st = corStatsLoad();
  const top = Object.entries(st).filter(([, v]) => v.n >= 3)
    .sort((a, b) => b[1].n - a[1].n).slice(0, 3);
  const memoria = document.getElementById('cor-memoria');
  memoria.innerHTML = top.length
    ? '<div class="cor-memoria-t">📈 Lo que más se te repite (todas tus notas)</div>' +
      top.map(([, v]) => `<div class="cor-memoria-item">${redEsc(v.titulo)} · <b>en ${v.n} revisi${v.n === 1 ? 'ón' : 'ones'}</b></div>`).join('') +
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
      ${h.otras && h.otras.length
        ? `<div class="cor-otras">¿O era…? ${h.otras.map((o, j) =>
            `<button type="button" class="cor-otra" data-cor-alt="${i}:${j}">${redEsc(o)}</button>`).join(' ')}</div>` : ''}
      <div class="cor-porque">${h.regla.porque} <span class="cor-norma">${redEsc(h.regla.norma)}</span></div>
      ${h.regla.ejemplo ? `<div class="cor-ejemplo">✗ ${redEsc(h.regla.ejemplo.mal)}<br>✓ ${redEsc(h.regla.ejemplo.bien)}</div>` : ''}
      <div class="cor-card-acciones">
        ${aplicable
          ? `<button type="button" class="cor-btn-aplicar" data-cor="${i}"><i class="fa-solid fa-check"></i> Corregir</button>` : ''}
        ${h._rango
          ? `<button type="button" class="cor-btn-ver" data-cor-ver="${i}"><i class="fa-solid fa-location-dot"></i> Ver en el texto</button>` : ''}
        ${h.aprender && typeof diccAprender === 'function'
          ? `<button type="button" class="cor-btn-aprende" data-cor-apr="${i}"><i class="fa-solid fa-book-medical"></i> A mi diccionario</button>` : ''}
      </div>
      ${!aplicable && h.sugerencia !== null && h.sugerencia !== undefined
        ? '<div class="cor-mano">Está partido por formato: corrígelo a mano en el texto.</div>' : ''}
    </div>`;
  }).join('');

  lista.querySelectorAll('[data-cor]').forEach(btn =>
    btn.addEventListener('click', () => {
      const h = _corHallazgos[Number(btn.dataset.cor)];
      if (h && corAplicar(h)) {
        redQueueSave();
        corAnalizar();
        corPintar();
        corRender();
        if (typeof toast === 'function') toast('✅ Corregido');
      }
    }));

  lista.querySelectorAll('[data-cor-ver]').forEach(btn =>
    btn.addEventListener('click', () => corIrAlTexto(Number(btn.dataset.corVer))));

  /* Las otras sugerencias del diccionario: tocar una la aplica */
  lista.querySelectorAll('[data-cor-alt]').forEach(btn =>
    btn.addEventListener('click', () => {
      const [i, j] = btn.dataset.corAlt.split(':').map(Number);
      const h = _corHallazgos[i];
      if (!h || !h.otras || h.otras[j] === undefined) return;
      h.sugerencia = h.otras[j];
      if (corAplicar(h)) {
        redQueueSave();
        corAnalizar();
        corPintar();
        corRender();
        if (typeof toast === 'function') toast('✅ Corregido');
      }
    }));

  /* «A mi diccionario»: la palabra deja de marcarse para siempre */
  lista.querySelectorAll('[data-cor-apr]').forEach(btn =>
    btn.addEventListener('click', () => {
      const h = _corHallazgos[Number(btn.dataset.corApr)];
      if (!h || !h.aprender) return;
      diccAprender(h.aprender);
      corAnalizar();
      corPintar();
      corRender();
      if (typeof toast === 'function') toast('📖 Aprendida: ' + h.aprender);
    }));

  document.getElementById('cor-aplicar-todo')?.addEventListener('click', () => {
    /* De atrás hacia adelante para que los desplazamientos no muevan
       los rangos de lo que falta */
    let n = 0;
    [...seguras].sort((a, b) => b.ini - a.ini).forEach(h => { if (corAplicar(h)) n++; });
    redQueueSave();
    corAnalizar();
    corPintar();
    corRender();
    if (typeof toast === 'function') toast(`✅ ${n} correcciones aplicadas`);
  });
}

function corAbrir() {
  const overlay = document.getElementById('cor-overlay');
  if (!overlay || typeof redNota !== 'function' || !redNota()) return;
  corDiccAsegura();
  corAnalizar();
  corStatsContar(_corHallazgos);
  corPintar();          // el texto queda subrayado por categoría, detrás del panel
  corRender();
  overlay.style.display = 'flex';
  corActualizarPildora();
}

/* El botón del editor arranca una sesión nueva (cuenta para la memoria);
   la píldora y los toques sobre el texto reabren SIN volver a contar. */
function corAbrirNueva() {
  _corStatsContadas = false;
  corAbrir();
}

function corCerrar() {
  const overlay = document.getElementById('cor-overlay');
  if (overlay) overlay.style.display = 'none';
  corActualizarPildora();   // si quedan subrayados, aparece el camino de vuelta
}

/* ── Wiring ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('red-corr-btn')?.addEventListener('click', corAbrirNueva);
  document.getElementById('cor-close')?.addEventListener('click', corCerrar);
  document.getElementById('cor-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'cor-overlay') corCerrar();
  });
  document.getElementById('cor-pildora')?.addEventListener('click', corAbrir);

  /* Tocar un subrayado enseña su burbuja SIN estorbar la escritura.
     La marca de cita tiene prioridad: su propio modal ya escucha este
     mismo click. El toque nunca se traga: el cursor se coloca igual,
     así corregir a mano dentro de una oración marcada fluye normal. */
  const cuerpoCor = document.getElementById('red-e-cuerpo');
  cuerpoCor?.addEventListener('click', e => {
    corOcultarBurbuja();
    if (!_corPintado) return;
    if (e.target.closest && e.target.closest('sup.red-cita')) return;
    const i = corHallazgoEnPunto(e.clientX, e.clientY);
    if (i >= 0) corMostrarBurbuja(i, e.clientX, e.clientY);
  });
  // La burbuja se esfuma al escribir o al desplazar el texto.
  // Y escribir es la mejor señal de que el diccionario hará falta:
  // se pone a cargar desde ya, para que al pulsar «Corregir y
  // aprender» los tecleos salgan a la primera.
  // Además, si hay subrayados puestos, teclear los deja RANCIOS
  // (apuntan a índices del texto viejo): se re-analiza con un
  // respiro de medio segundo para que todo vuelva a cuadrar.
  let _corReanaliza = null;
  cuerpoCor?.addEventListener('input', () => {
    corOcultarBurbuja();
    corDiccAsegura();
    if (!_corPintado) return;
    clearTimeout(_corReanaliza);
    _corReanaliza = setTimeout(() => {
      if (!_corPintado) return;
      corAnalizar();
      corPintar();
      corActualizarPildora();
    }, 500);
  });
  document.querySelector('#view-redaccion-editor .view-scroll')
    ?.addEventListener('scroll', corOcultarBurbuja, { passive: true });

  /* Al salir del editor, los subrayados, la burbuja y la píldora se
     recogen: pertenecen a la nota que se estaba corrigiendo. */
  document.getElementById('red-editor-back-btn')?.addEventListener('click', () => {
    corOcultarBurbuja();
    corDespintar();
  });
});
