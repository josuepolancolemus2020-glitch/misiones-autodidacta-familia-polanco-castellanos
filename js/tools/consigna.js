/* ⚠️ EL NÚCLEO ESTÁ TERMINADO Y PROBADO; LA PANTALLA NO. Y NO SE CABLEA
   HASTA QUE ESTÉ ENTERO.
   ──────────────────────────────────────────────────────────────────
   Así quedó el 23 de septiembre de 2026. Lo que hay de aquí para abajo
   es el NÚCLEO entero —las listas cerradas (moldes, sinónimos,
   máquinas, topes), el armado, el lector de lo pegado, el repaso, la
   poda, la fusión y la nube— y está PROBADO EN NODE:

       node _dev/test-consigna-node.js

   carga este mismo archivo en un salón vacío y compara lo que arma,
   carácter por carácter, con los ejemplos escritos en el §7 del plan.
   Tiene que decir «RESULTADO: APRUEBA» antes y después de tocar
   cualquier cosa del núcleo.

   Falta la PANTALLA —el compositor, el anaquel, las tres hojas e
   initConsigna—, que va al final de este mismo archivo, detrás de la
   marca «PANTALLA», y css/consigna.css. Lo que falta, en orden, está en
   PLAN-LA-CONSIGNA.md, en la raíz. El SQL ya está terminado y probado
   (supabase/sql/consigna.sql).

   Y SIGUE SIN ESTAR EN `index.html`, a propósito, aunque el núcleo ya
   cargue limpio: la pantalla se va a escribir AQUÍ, y los <script> de la
   aplicación comparten un solo ámbito, así que un archivo a medio
   escribir que el navegador cargue no rompe esta herramienta —rompe
   F.A.R.O entero—. El `<script>` y el `<link>` se añaden el día que la
   pantalla esté entera y su sonda (_dev/probe-consigna.html) apruebe.
   ══════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════
   📜 LA CONSIGNA · lo que se le pide a la máquina, con forma, guardado
   y a dos toques de volver a usarse (js/tools/consigna.js)
   ──────────────────────────────────────────────────────────────────
   QUÉ ES: el espejo de La Voz Prestada. Allá se guarda lo que la máquina
   ESCRIBIÓ; aquí se escriben, con forma, las CONSIGNAS que se le dan
   —prompts, habilidades (SKILL.md e instrucciones de sistema), grafos de
   agentes y bucles—, se inventarían y se vuelven a usar. «Consigna» es
   las dos cosas que hace: la orden clara que se le da a alguien y el
   sitio de la estación donde se deja algo guardado para recogerlo
   después. Va PEGADA a La Voz Prestada en el Acceso Rápido, y por lo
   mismo que Redacción y La Voz Prestada están juntas: una escribe lo que
   se pide y la otra guarda lo que volvió, con su etiqueta puesta.

   CÓMO ESTÁ HECHA: una PIEZA es clase + molde + título + bloques +
   material + máquina + estantes + bitácora + versiones. Los bloques son
   el texto de la persona; la FORMA (etiquetas XML para Claude,
   encabezados Markdown para ChatGPT y Gemini, párrafos «Rótulo: texto»
   para NotebookLM, un SKILL.md) la decide la máquina en el momento de
   usar, y la arma csgArmar(), que es una función pura sin DOM. Nunca se
   guarda un texto armado.

   Este archivo va en DOS partes. Esta primera es el NÚCLEO sin pantalla:
   las listas cerradas, el vocabulario, los moldes, el armado, el lector
   de lo pegado, el repaso, la poda, la fusión y la nube. Tiene que poder
   cargarse en Node con dobles de document/window/localStorage
   (_dev/test-consigna-node.js lo hace), y por eso aquí no se toca el DOM
   a nivel de archivo. La pantalla (compositor, anaquel, hojas,
   initConsigna y el cableado) va al final, detrás de la marca
   «PANTALLA», y copia la forma de 📓 Cuadernos.

   EL NÚCLEO, EN ESTE ORDEN (cada apartado abre con su cartel ════):
   · el vocabulario (CSG_BLOQUES) y los moldes con las demás listas
     cerradas (CSG_MOLDES … CSG_RESERVADAS);
   · EL ARMADO (csgArmar y lo suyo, prefijo csgArm): puro, sin DOM;
   · EL LECTOR DE LO PEGADO Y EL REPASO (csgLeer, csgRevisar; csgLec);
   · LA NUBE Y EL APARATO (csgBajar, csgSubir, csgPodar, csgFusiona…).
   Se escribieron en cuatro trozos a la vez y se juntaron el 23 de
   septiembre de 2026. Donde dos trozos decidían lo mismo —si un renglón
   es un par, cómo se llama un nodo, qué es «la misma palabra», cuánto
   sobra de lo que no cabe— se dejó UNA función y los demás le preguntan
   a ella: con dos copias, el repaso y el armado acaban diciendo cosas
   distintas de la misma pieza, y ninguno da error.

   ⚠️ LAS REGLAS QUE NO SE NEGOCIAN (§10 de la especificación), con su
   porqué, que es lo que impide que alguien las «arregle» de vuelta:

   1. LO QUE SE COPIA ES LO QUE SE VE, CARÁCTER POR CARÁCTER. Vista
      previa y botones salen del mismo csgArmar. Un prompt que sale
      distinto de como se vio se descubre leyendo lo que la máquina
      devolvió, sin saber por qué.
   2. LA PIEZA SON BLOQUES; LA FORMA ES DE LA MÁQUINA. Nunca se guarda
      un texto armado; csgArmar es pura y sin DOM.
   3. UN VOCABULARIO ÚNICO; CADA MOLDE ES UNA LISTA DE IDS CON SUS
      SOBREESCRITURAS DECLARADAS. Un id tiene un significado
      (CSG_BLOQUES); el molde solo cambia las palabras —rotulo, para_que,
      ejemplo, frases, inicial, plantilla— y la obligatoriedad, y lo hace
      en su propia entrada. csgBloqueDef(molde, id) devuelve la mezcla y
      es lo ÚNICO que consultan el compositor, el armado y el repaso.
      `comprobacion` es un solo id en las cuatro clases (en la v1 había
      dos, y graduar de Encargo a SKILL.md dejaba la comprobación como
      bloque libre); CSG_EQUIVALE está escrito y es lo único que «Duplicar
      en otro molde» consulta además del id.
   4. LAS LISTAS CERRADAS VIVEN EN EL APARATO; LOS TOPES EN UN SITIO.
      Clases, moldes, bloques, frases, sinónimos, máquinas y CSG_TOPES en
      el JS; la base guarda texto con tope y sin lista, y sus `check`
      dicen los mismos números que CSG_TOPES (la sonda lo comprueba
      leyendo el SQL). Añadir una máquina o un molde es una línea aquí,
      no una migración que alguien pega desde una tableta.
   5. GUARDAR NUNCA SE BLOQUEA; USAR SÍ. Una pieza a medias es un
      borrador, no un error: se guarda con lo que falte nombrado. Lo que
      no cabe en la nube se guarda aquí y se dice cuánto sobra.
   6. UNA VARIABLE VACÍA NO SE COPIA EN SILENCIO. «Copiar con huecos» es
      otro botón. Los últimos valores son POR PIEZA y del aparato.
   7. LOS CHIPS INSERTAN Y QUITAN SU FRASE EXACTA; NUNCA REESCRIBEN.
   8. PEGAR RESPETA LA ASIMETRÍA de La Voz Prestada: equivocarse hacia
      «esto es prosa» cuesta un renglón que se coloca a mano; equivocarse
      hacia «esto es un rótulo» PARTE el texto y parece que funcionó. Solo
      asciende a rótulo lo corroborado; la clave es solo letras y
      espacios; una flecha solo es arista fuera de `ejemplos` y entre
      nombres cortos; un bucle solo se propone sin bloques de prompt
      reconocidos; lo que no se entiende se queda en Tarea y se NOMBRA
      con su renglón; nada se descarta; la clase se PROPONE con un chip,
      nunca se impone.
   9. LA BITÁCORA SE PREGUNTA, NO SE RELLENA, Y NUNCA SE INVENTA UN
      RESULTADO. Usar apunta un uso con ok: null; «¿sirvió?» se pregunta
      en la siguiente apertura, un uso cada vez, siete días.
   10. EL 👍 VA ATADO A LA VERSIÓN Y A LA MÁQUINA, Y NADA REESCRIBE EL
      HISTORIAL. Corregir una pieza usada crea versión; «volver a la v2»
      crea la v5. Las versiones se PODAN POR BYTES (csgPodar) antes de
      que el tope de la base rebote con un mensaje que habla de otra cosa.
   11. USOS Y VERSIONES SE FUSIONAN POR UNIÓN DE SU ID (uid/vid), NUNCA
      POR FILA ENTERA: dos aparatos que usaron la misma pieza sin señal
      no se pisan la bitácora. Y UN USO NO ES UNA EDICIÓN: no toca el
      reloj de la pieza y sube con la nube delante (csgApuntarUso,
      csgContestarUso); con el reloj puesto, copiar sin señal una pieza
      que otro aparato había retirado la resucitaba. El número de versión
      nunca retrocede al fusionar, y el texto que pierde, si tenía un 👍,
      se guarda como versión.
   12. EL BUCLE NO SE USA SIN TOPE, NI EL GRAFO CON VUELTA ATRÁS SIN FIN,
      NI CON UNA ARISTA A NINGUNA PARTE. Un bucle sin tope es un chat que
      no termina; una arista a un nodo que no existe es un nodo que la
      máquina se inventa.
   13. EL REPASO MIRA LO QUE CADA FORMATO EXIGE Y AVISA EN UN SOLO
      SENTIDO: lo que PARA a la vista, lo que avisa plegado (regla 12 de
      El Rodaje). Un frontmatter mal hecho no da error: la habilidad no
      carga nunca, y por eso el `name` y la `description` del SKILL.md
      PARAN.
   14. LA ETIQUETA VIAJA EN LA IDA. Voz prestada y Careo llevan el bloque
      `etiqueta` obligatorio y relleno con Título:, Voz:, Máquina:
      {{maquina}}, Género: y Consigna: {{titulo}}, que VOZ_ETIQUETAS
      entiende («consigna» cae en `encargo`). Lo que la máquina devuelva
      entra a La Voz Prestada ya etiquetado, sin tocar voz-prestada.js.
   15. NADA DE LO ESCRITO LLEGA A UN ATRIBUTO NI A innerHTML.
      createElement y textContent en todo, <pre> incluido; direcciones
      literales; encodeURIComponent; window.open con noopener,noreferrer.
      Esta aplicación tiene dentro la Bóveda, las finanzas y el chat.
   16. ABRIR LA MÁQUINA COPIA PRIMERO, SIEMPRE, y el texto en la
      dirección tiene tope (CSG_PREFILL_MAX, 1.500 codificados): una
      dirección larga se corta sin avisar, y lo que se pierde es el
      Formato, que va al final.
   17. EL REPASO AVISA DE DATOS DE LA CASA DENTRO DE UNA PIEZA (un
      teléfono, un correo, un nombre) y propone un {{hueco}} de un toque:
      la pieza viaja a la nube y a la máquina.
   18. LOCAL PRIMERO, NUBE DESPUÉS, Y LA CAUSA SE NOMBRA: 42P01 es «falta
      correr consigna.sql», 42703 es «la base va vieja» (se quita la
      columna que el error nombra y se sigue), FARO_RELOJ es la señal,
      «sin sesión» y «no cabe» son lo suyo. Ninguna fila viaja sin
      `autor`; la que no tiene firma espera a tenerla. Retirar deja
      lápida, dos toques, sin confirm().
   19. EL COMPOSITOR A MEDIO ESCRIBIR SE GUARDA EN CADA TECLA y se ofrece
      al volver; el material que no cabe vive ahí.
   20. LA HERRAMIENTA GUÍA, NO LLAMA: ninguna petición de red obligatoria
      ni ningún botón que le pida a una IA que escriba el prompt.
   21. PANTALLA A 390 PX Y UNA COSA CADA VEZ (eso es de la parte 2).
   22. EL PREFIJO ES `csg` Y NINGUNA FUNCIÓN REPITE NOMBRE DE OTRO
      ARCHIVO: los <script> de index.html comparten ámbito y una función
      repetida pisa a la otra sin ningún aviso (pasó con corAbrir).
   ══════════════════════════════════════════════════════════════════ */

/* 📜 y no 🧭: 🧭 ya es «Ensayo» en VOZ_GENEROS, «Guía de estudio» en la
   repisa y el avatar de la portada; el espejo de La Voz Prestada no puede
   llevar el emoji de uno de sus géneros. La sonda lo comprueba. */
const CSG_EMOJI = '📜';
const CSG_LEMA  = 'Lo que se le pide a la máquina, con forma, guardado y a dos toques de volver a usarse.';

/* Las cuatro clases, fijas: qué es la consigna PARA LA MÁQUINA. Cada una
   abre con su molde recomendado. `para` es lo que dice la baldosa. */
const CSG_CLASES = [
  { id: 'prompt',    ic: '💬', nombre: 'Prompt',    para: 'un encargo de una vez',                     molde: 'rapido' },
  { id: 'habilidad', ic: '🧰', nombre: 'Habilidad', para: 'lo que sabrá hacer siempre',                 molde: 'skill' },
  { id: 'grafo',     ic: '🕸', nombre: 'Grafo',     para: 'varios que se pasan el trabajo',             molde: 'cadena' },
  { id: 'bucle',     ic: '🔁', nombre: 'Bucle',     para: 'un paso que se repite hasta que salga',      molde: 'hasta' },
];

/* ══════════════════════════════════════════════════════════════════
   EL VOCABULARIO ÚNICO (§3.0). Cada id tiene UN significado; un molde
   solo elige cuáles, en qué orden, con qué palabras y si son
   obligatorios. Los ids son ASCII sin tildes porque son las etiquetas
   XML de Claude. `lista: true` = un renglón por elemento (se arma como
   lista); `sistema: true` = va en la mitad «sistema» de la forma xml;
   `plantilla` = lo que mete el botón «＋ Otro»; `inicial` = con qué nace
   el recuadro. Los ejemplos de varios renglones van con \n.
   ══════════════════════════════════════════════════════════════════ */
const CSG_BLOQUES = {
  tarea: {
    rotulo: 'Tarea',
    para_que: 'Qué tiene que hacer, en una frase que empiece por un verbo; el único bloque sin el que no existe un prompt.',
    ejemplo: 'Resume este informe de la OCDE en diez puntos, cada uno con su dato y la página de donde sale.',
    frases: ['Resume {{texto}} en diez puntos, uno por renglón.', 'Corrige la ortografía y el estilo de lo que va abajo sin cambiar el sentido.', 'Explícame {{tema}} como a alguien que lo oye por primera vez.', 'Dame cinco títulos para {{pieza}}, de menos de sesenta caracteres.', 'Compara {{a}} y {{b}} en una tabla de tres columnas.'],
  },
  formato: {
    rotulo: 'Formato de salida',
    para_que: 'Cómo se quiere ver la respuesta; sin esto la máquina elige por ti, y elige párrafos con introducción y despedida.',
    ejemplo: 'Lista numerada. Cada punto: dato · fuente · página. Sin introducción ni cierre.',
    frases: ['En una lista de puntos, sin introducción ni despedida.', 'En una tabla con estas columnas: {{columnas}}.', 'En español de Honduras, tuteando.', 'Máximo {{n}} palabras.', 'En Markdown, con un encabezado por sección.', 'Solo el texto pedido: nada de comentarios sobre lo que hiciste.', 'Primero el resultado; debajo, la lista de cambios.'],
  },
  rol: {
    rotulo: 'Rol', sistema: true,
    para_que: 'Quién es la máquina mientras contesta: cambia el nivel, el vocabulario y lo que da por sabido.',
    ejemplo: 'Eres un editor de una revista de divulgación en español, riguroso con las fuentes y alérgico a las frases hechas.',
    frases: ['Eres un editor de textos en español, riguroso con las fuentes.', 'Eres un maestro de secundaria que explica con ejemplos de la vida diaria.', 'Eres un investigador que distingue lo que sabe de lo que supone.', 'Eres un corrector de estilo: no cambias el sentido, solo la forma.', 'Eres un guionista de video-ensayos de diez minutos.'],
  },
  contexto: {
    rotulo: 'Contexto',
    para_que: 'Lo que la máquina no puede saber: para quién es, de dónde sale, qué ya se hizo.',
    ejemplo: 'Esto va en la revista de la casa, que leen cuatro personas de entre 12 y 50 años. Ya tengo el borrador; lo que falta es apretar el arranque.',
    frases: ['Es para {{destino}}, que lee {{quien}}.', 'Ya tengo esto hecho: {{lo_hecho}}. No lo repitas.', 'El material está abajo, entre las marcas ===.', 'Lo voy a pegar tal cual, sin retocar, así que cuida el formato.', 'El texto es mío; puedes ser duro.'],
  },
  reglas: {
    rotulo: 'Reglas', lista: true, sistema: true, plantilla: '- ',
    para_que: 'Lo que no se negocia; escrito aparte de la tarea se cumple, mezclado se pierde. Una por renglón.',
    ejemplo: 'No inventes datos; si no lo sabes, dilo.\nCita cada fuente con su dirección.\nNo uses «además» más de una vez.',
    frases: ['No inventes datos; si no lo sabes, dilo.', 'Cita cada fuente con su dirección; sin dirección no vale.', 'No cambies los nombres propios ni las cifras.', 'Si la instrucción es ambigua, pregunta antes de hacer.', 'Sin adornos: ni «en resumen», ni «es importante destacar».', 'Responde en español de Honduras.'],
  },
  ejemplos: {
    rotulo: 'Ejemplos', lista: true, plantilla: '{{entrada}} → {{salida}}',
    para_que: 'Una muestra vale más que tres reglas: la máquina imita antes que obedece. Pares «entrada → salida», uno por renglón.',
    ejemplo: 'El PIB creció 3 %. → El PIB creció 3 % (BCH, 2025, p. 4).',
    frases: ['{{entrada}} → {{salida}}', 'Así quiero que salga: {{ejemplo_bueno}}', 'Así NO: {{ejemplo_malo}}', 'Copia el tono de este párrafo: {{parrafo}}'],
  },
  comprobacion: {
    rotulo: 'Cómo se comprueba', lista: true, plantilla: '- ',
    para_que: 'Qué mira la máquina antes de entregar; es lo que la hace revisar en vez de soltar lo primero.',
    ejemplo: 'Cuenta los puntos: deben ser diez.\nMira que cada uno lleve página.\nBorra cualquier frase que empiece por «es importante».',
    frases: ['Antes de entregar, revisa que cumples cada regla y corrige lo que no.', 'Cuenta: tienen que ser exactamente {{n}}.', 'Si una fuente no tiene dirección, quítala y dilo.', 'Al final, di en una línea qué no pudiste cumplir y por qué.'],
  },
  tono: {
    rotulo: 'Tono', sistema: true,
    para_que: 'Cómo suena; si no se dice, sale el tono de manual de electrodoméstico.',
    ejemplo: 'Directo y sin adornos, como quien explica a un amigo listo.',
    frases: ['Directo y sin adornos.', 'Cercano, tuteando, sin condescender.', 'Técnico y preciso, para quien ya sabe del tema.', 'Como una conversación, no como un informe.'],
  },
  objetivo: {
    rotulo: 'Objetivo',
    para_que: 'Qué tiene que LOGRAR la respuesta, no qué tiene que hacer.',
    ejemplo: 'Que un lector que no conoce el tema entienda por qué importa en los dos primeros párrafos.',
    frases: ['Que {{quien}} entienda {{que}} sin haber leído nada antes.', 'Convencer a {{quien}} de {{que}} con datos, no con adjetivos.', 'Dejar una lista de decisiones que se puedan tomar hoy.', 'Que sirva de guion para hablar tres minutos.'],
  },
  estilo: {
    rotulo: 'Estilo',
    para_que: 'A qué se parece la escritura.',
    ejemplo: 'Periodístico: frases cortas, el dato primero, sin jerga.',
    frases: ['Periodístico: frases cortas, dato primero.', 'Académico, con citas en APA.', 'Como un manual: pasos numerados y nada más.', 'Como un ensayo: una idea por párrafo, con transiciones.'],
  },
  audiencia: {
    rotulo: 'Audiencia',
    para_que: 'Quién lo va a leer.',
    ejemplo: 'Un estudiante de sexto grado que lee bien pero no sabe nada de economía.',
    frases: ['Un niño de {{edad}} años que lee bien.', 'Un adulto sin formación en el tema.', 'Un colega que ya sabe del tema y quiere lo nuevo.', 'Un maestro que lo va a explicar en clase.'],
  },
  caso: {
    rotulo: 'Ahora tú',
    para_que: 'La entrada nueva; va aparte para que no se confunda con un ejemplo más, y SIEMPRE sale la última del texto armado.',
    ejemplo: 'Ahora haz lo mismo con cada renglón de lo que va abajo.',
    frases: ['Ahora haz lo mismo con esto: {{entrada}}', 'Ahora haz lo mismo con cada renglón de lo que va abajo.', 'Sigue exactamente el patrón de los ejemplos.', 'Si una entrada no encaja en el patrón, dilo en vez de forzarla.'],
  },
  pasos: {
    rotulo: 'Pasos', lista: true, plantilla: 'n. ',
    para_que: 'Lo que hace, en orden y numerado; un paso, una acción.',
    ejemplo: '1. Lee el texto entero antes de tocar nada.\n2. Marca las erratas.\n3. Marca el estilo, con la norma al lado.\n4. Devuelve el texto corregido y la lista de cambios.',
    frases: ['1. Lee todo antes de tocar nada.', 'Pregunta {{dato}} si no viene.', 'Devuelve primero el resultado y después la lista de cambios.', 'Si algo no encaja en los pasos, para y dilo.'],
  },
  responde: {
    rotulo: 'Luego responde',
    para_que: 'Separar razonamiento y respuesta, para copiar solo la respuesta.',
    ejemplo: 'Después del razonamiento, pon «RESPUESTA:» y debajo solo el resultado.',
    frases: ['Después, bajo el rótulo RESPUESTA:, solo el resultado.', 'La respuesta final en una sola frase.', 'Separa razonamiento y respuesta con una raya ---.', 'Si el razonamiento cambia tu primera idea, dilo.'],
  },
  pregunta: {
    rotulo: 'Pregunta',
    para_que: 'Una sola pregunta, concreta y con su alcance; dos preguntas son dos prompts.',
    ejemplo: '¿Qué efecto tuvo la jornada extendida en Honduras entre 2015 y 2024 sobre la deserción escolar?',
    frases: ['¿Qué se sabe de {{tema}} en {{lugar}} entre {{desde}} y {{hasta}}?', '¿Qué evidencia hay a favor y en contra de {{afirmacion}}?', '¿Quiénes son los tres autores más citados sobre {{tema}} y en qué discrepan?', '¿Qué cambió en {{tema}} desde {{anio}}?'],
  },
  fuentes: {
    rotulo: 'Fuentes permitidas',
    para_que: 'De dónde puede sacar y de dónde no.',
    ejemplo: 'Solo informes de organismos (BID, Banco Mundial, UNESCO), revistas con revisión por pares y prensa nacional con fecha. Nada de blogs ni de resúmenes de terceros.',
    frases: ['Solo fuentes con autor, fecha y dirección.', 'Prefiere informes de organismos y revistas con revisión por pares.', 'Nada de blogs, foros ni resúmenes de otras IA.', 'Si la fuente está en inglés, cita el original y traduce la cita.', 'Usa solo las fuentes del cuaderno.'],
  },
  citas: {
    rotulo: 'Reglas de cita',
    para_que: 'Cómo se cita cada dato, para que el lector de La Voz Prestada case las llamadas con la bibliografía.',
    ejemplo: 'Cada dato con (Autor, año, p.) pegado a la frase, y al final un apartado «## Referencias» con una entrada por renglón: autor, año, título, dirección.',
    frases: ['Cada dato con (Autor, año, página) pegado a la frase.', 'Al final, un apartado «## Referencias» con una entrada por renglón y su dirección.', 'Marca ⚠️ SIN VERIFICAR lo que no puedas comprobar.', 'No mezcles dos fuentes en una misma cita.', 'Numera las referencias y usa [n] en el texto.'],
  },
  limites: {
    rotulo: 'Límites',
    para_que: 'Qué queda fuera, cuánto, hasta cuándo.',
    ejemplo: 'Máximo 1.500 palabras. No entres en la parte legal. Solo hasta 2024.',
    frases: ['Máximo {{n}} palabras.', 'Deja fuera {{tema_fuera}}.', 'Solo hasta {{anio}}.', 'Si no hay evidencia suficiente, dilo y para.'],
  },
  voz: {
    rotulo: 'Voz',
    para_que: 'A quién imita, con una pista de qué de esa voz.',
    ejemplo: 'Juan Rulfo: frases cortas, pueblo seco, muertos que hablan, ningún adjetivo que sobre.',
    frases: ['Escribe a la manera de {{autor}}: {{rasgos}}.', 'Imita la voz de {{autor}} sin copiar ninguna frase suya.', 'Con el ritmo de {{autor}} pero con un tema de hoy: {{tema}}.', 'Como lo contaría {{autor}} en una entrevista imaginada.'],
  },
  genero: {
    rotulo: 'Género y largo',
    para_que: 'Con la palabra de la lista de La Voz Prestada (cuento, ensayo, poema, carta, entrevista…).',
    ejemplo: 'Un cuento de unas 1.200 palabras, en tres capítulos.',
    frases: ['Un cuento de {{n}} palabras en {{k}} capítulos.', 'Un ensayo de {{n}} palabras con subtítulos.', 'Un poema de {{n}} versos, respetando los saltos de renglón.', 'Una carta de una página.'],
  },
  tema: {
    rotulo: 'Tema o encargo',
    para_que: 'De qué va y lo que tiene que pasar sí o sí.',
    ejemplo: 'Un hombre vuelve a su pueblo a cobrar una deuda y descubre que el deudor murió hace diez años.',
    frases: ['Tiene que pasar esto: {{hecho}}.', 'Tiene que aparecer {{elemento}}.', 'Ambientado en {{lugar}} en {{epoca}}.', 'Termina sin resolverlo todo.'],
  },
  etiqueta: {
    rotulo: 'La etiqueta de la casa',
    para_que: 'Pedir a la máquina que encabece con las etiquetas que entiende la hoja de pegar de La Voz Prestada: Título, Voz, Máquina, Género, y «Consigna», que cae en su campo de encargo.',
    /* Viene RELLENO: es la regla 14. El ejemplo es el propio texto,
       para que se vea igual si alguien lo borra. */
    inicial: 'Encabeza el texto con estas líneas, una por renglón y nada más antes: «Título:» y el título que le pongas; «Voz:» y a quién imitas; «Máquina: {{maquina}}»; «Género:» y el género en una palabra (cuento, ensayo, poema, carta, entrevista); «Consigna: {{titulo}}». Los capítulos con «## » y su nombre; los subtítulos con «### »; las citas con «> ». Termina con FIN solo en su renglón.',
    ejemplo: 'Encabeza el texto con estas líneas, una por renglón y nada más antes: «Título:» y el título que le pongas; «Voz:» y a quién imitas; «Máquina: {{maquina}}»; «Género:» y el género en una palabra (cuento, ensayo, poema, carta, entrevista); «Consigna: {{titulo}}». Los capítulos con «## » y su nombre; los subtítulos con «### »; las citas con «> ». Termina con FIN solo en su renglón.',
    frases: ['Encabeza con Título:, Voz:, Máquina: y Género:, una por renglón.', 'Los capítulos con «## » y su nombre; los subtítulos con «### ».', 'Las citas con «> » y las listas con «- ».', 'Termina con la palabra FIN sola en su renglón.', 'Si hay bibliografía, al final bajo «## Referencias», una entrada por renglón.'],
  },
  texto: {
    rotulo: 'Texto',
    para_que: 'La consigna tal cual.',
    ejemplo: 'Corrige este texto sin cambiar el sentido y devuélvelo entero, en español de Honduras: {{texto}}',
    frases: ['No inventes datos; si no lo sabes, dilo.', 'Responde en español de Honduras.', 'Devuelve solo el resultado.', 'Si algo es ambiguo, pregunta antes.'],
  },
  nombre: {
    rotulo: 'Nombre (name)',
    para_que: 'Minúsculas, números y guiones; nombre de la carpeta y con el que se invoca. Se propone desde el título sin pisar lo escrito.',
    ejemplo: 'corrector-revista-casa',
    frases: ['corregir-{{que}}', 'revisar-{{que}}', 'escribir-{{que}}', 'resumir-{{que}}'],
  },
  disparador: {
    rotulo: 'Descripción y disparador (description)',
    para_que: 'Qué hace Y cuándo se usa, en tercera persona, con las palabras que dice la persona y para qué NO sirve.',
    ejemplo: 'Corrige ortografía y estilo de notas en español de Honduras y devuelve el texto corregido más la lista de cambios con su norma. Úsala cuando pidan «corrige», «revisa el estilo» o peguen una nota para la revista. No la uses para traducir.',
    frases: ['Úsala cuando pidan {{palabras}}.', 'Úsala cuando peguen {{tipo_de_texto}}.', 'No la uses para {{caso_fuera}}; para eso está {{otra_habilidad}}.', 'Se dispara aunque no la nombren, si la tarea es {{tarea}}.'],
  },
  recursos: {
    rotulo: 'Herramientas y recursos', lista: true, plantilla: '- ',
    para_que: 'Qué puede usar y qué no.',
    ejemplo: 'Usa la lista de reglas de estilo que va debajo. No busques en internet.',
    frases: ['Usa solo lo que va en este archivo.', 'Puede buscar en internet solo para {{que}}.', 'Lee primero {{archivo}} antes de empezar.', 'No ejecutes nada: solo escribe.'],
  },
  identidad: {
    rotulo: 'Identidad', sistema: true,
    para_que: 'Quién es, de dónde, en qué idioma.',
    ejemplo: 'Eres el corrector de la revista de la familia Polanco Castellanos. Hablas español de Honduras y no cambias el sentido de nada.',
    frases: ['Eres {{rol}} de {{lugar}}.', 'Hablas español de Honduras, tuteando.', 'Tu prioridad es {{prioridad}}.', 'No eres un asistente general: solo haces {{que}}.'],
  },
  mision: {
    rotulo: 'Misión', sistema: true,
    para_que: 'Para qué existe; lo que hace cuando nadie le dice nada más.',
    ejemplo: 'Recibir textos y devolverlos corregidos con la lista de cambios y su norma.',
    frases: ['Recibir {{entrada}} y devolver {{salida}}.', 'Ayudar a {{quien}} a {{que}}.', 'Si no te dan nada, pregunta por {{dato}}.', 'Cuando termines, ofrece {{siguiente}}.'],
  },
  siempre: {
    rotulo: 'Siempre', lista: true, sistema: true, plantilla: 'Siempre ',
    para_que: 'Las reglas fijas.',
    ejemplo: 'Siempre responde en español de Honduras.\nSiempre di qué no pudiste cumplir.',
    frases: ['Siempre responde en español de Honduras.', 'Siempre cita la fuente con su dirección.', 'Siempre di qué no pudiste cumplir.', 'Siempre pregunta antes de suponer un dato.'],
  },
  nunca: {
    rotulo: 'Nunca', lista: true, sistema: true, plantilla: 'Nunca ',
    para_que: 'Lo prohibido, aparte de lo obligatorio.',
    ejemplo: 'Nunca inventes datos.\nNunca cambies nombres propios ni cifras.',
    frases: ['Nunca inventes datos.', 'Nunca cambies nombres propios ni cifras.', 'Nunca uses «en resumen» ni «es importante destacar».', 'Nunca respondas fuera de tu misión: di que no es lo tuyo.'],
  },
  meta: {
    rotulo: 'Meta',
    para_que: 'Qué existe al final de todo, en una frase.',
    ejemplo: 'Un video-ensayo de doce minutos con guion en bloques, fuentes verificadas y rótulos.',
    frases: ['Al final tiene que existir {{resultado}}.', 'Se da por terminado cuando {{condicion}}.', 'El resultado va a {{destino}}.', 'Si un nodo falla, el resultado es {{que_pasa}}.'],
  },
  nodos: {
    rotulo: 'Nodos, uno por renglón', lista: true, plantilla: '{{nombre}}: recibe {{entrada}}, entrega {{salida}}.',
    para_que: 'Nombre, qué recibe y qué entrega; el nombre va delante de los dos puntos y es el que usan las aristas (se proponen como chips al escribirlas).',
    ejemplo: 'Investigador: recibe el tema, entrega diez fuentes con dirección.\nGuionista: recibe las fuentes, entrega el guion en bloques.\nVerificador: recibe el guion, entrega la lista de citas que no cuadran.\nEditor: recibe el guion aprobado, entrega la versión final.',
    frases: ['{{nombre}}: recibe {{entrada}}, entrega {{salida}}.', 'Investigador: recibe el tema, entrega fuentes con dirección.', 'Redactor: recibe el material, entrega el borrador.', 'Verificador: recibe el borrador, entrega lo que no cuadra.', 'Editor: recibe todo, entrega la versión final.'],
  },
  aristas: {
    rotulo: 'Aristas y condiciones', lista: true, plantilla: '{{a}} → {{b}}.',
    para_que: 'Quién pasa a quién y con qué condición, con la flecha → (o ->); FIN es un nodo que existe siempre. Una arista a un nodo que no existe PARA el uso nombrándola.',
    ejemplo: 'Investigador → Guionista.\nGuionista → Verificador.\nVerificador → Guionista si hay citas malas (máximo 2 vueltas); si no → Editor.\nEditor → FIN.',
    frases: ['{{a}} → {{b}}.', '{{a}} → {{b}} si {{condicion}}; si no → {{c}}.', '{{a}} → {{b}} como máximo {{n}} veces.', '{{a}} → FIN si {{condicion}}.'],
  },
  estado: {
    rotulo: 'Lo que viaja entre nodos',
    para_que: 'Qué se conserva de un nodo al siguiente.',
    ejemplo: 'Viaja: el tema, la lista de fuentes y el guion actual. No viaja: el razonamiento interno de cada uno.',
    frases: ['Viaja: {{lo_que_viaja}}.', 'No viaja: el razonamiento interno de cada nodo.', 'Cada nodo añade su parte al mismo documento; no lo reescribe.', 'Cada nodo firma lo suyo con su nombre.'],
  },
  fin: {
    rotulo: 'Fin y entrega',
    para_que: 'Cómo se sabe que terminó y en qué forma se entrega; con una arista de vuelta y sin tope aquí ni en la arista, el repaso PARA el uso.',
    ejemplo: 'Termina cuando el Verificador no encuentra citas malas, o a la segunda vuelta. El Editor entrega el guion en bloques [CÁMARA 0:30] para El Rodaje.',
    frases: ['Termina cuando {{condicion}}.', 'Como mucho {{n}} vueltas; después se entrega lo que haya.', 'Entrega en la forma: {{formato}}.', 'Entrega también una lista de lo que cada nodo decidió.'],
  },
  coordinador: {
    rotulo: 'Coordinador',
    para_que: 'El que reparte y junta; no hace el trabajo.',
    ejemplo: 'Coordinador: recibe el encargo, lo parte en tareas, se las da a los especialistas y junta lo que devuelven.',
    frases: ['Recibe {{encargo}} y lo parte en tareas.', 'No hace ninguna tarea: solo reparte y junta.', 'Si un especialista devuelve algo incompleto, se lo devuelve con lo que falta.', 'Al final entrega {{resultado}} con lo que cada uno hizo.'],
  },
  reparto: {
    rotulo: 'Cómo se reparte',
    /* La especificación no trae «para qué» para este bloque ni para los
       de abajo marcados igual: va el mínimo que dice el rótulo. */
    para_que: 'Con qué criterio el coordinador le da cada tarea a un especialista.',
    ejemplo: 'Por tema: lo que tenga cifras al Economista, lo que tenga fechas al Historiador; lo que no encaje, el Coordinador pregunta antes de repartir.',
    frases: ['Por tema: {{criterio}}.', 'Cada tarea a un solo especialista.', 'Si una tarea no encaja en ninguno, el coordinador pregunta.', 'Lo urgente primero.'],
  },
  juntar: {
    rotulo: 'Cómo se junta',
    para_que: 'Cómo el coordinador pega lo que cada especialista devuelve y qué hace con lo repetido y lo contradicho.',
    ejemplo: 'El Coordinador pega las partes en el orden de la meta, quita lo repetido y marca lo que se contradice.',
    frases: ['Juntar en el orden de {{orden}}.', 'Quitar lo repetido y marcar lo que se contradice.', 'Si dos especialistas se contradicen, gana el que trae fuente.', 'Entregar con un apartado por especialista.'],
  },
  paso: {
    rotulo: 'Paso que se repite',
    para_que: 'Lo que hace en cada vuelta, en una frase; escribirlo para UNA vuelta es lo que hace el bucle ejecutable.',
    ejemplo: 'Escribe el primer párrafo del ensayo.',
    frases: ['Escribe {{que}}.', 'Mejora el resultado anterior en {{aspecto}}.', 'Busca una fuente más sobre {{tema}}.', 'Resuelve el siguiente elemento de la lista.'],
  },
  parada: {
    rotulo: 'Criterio de parada',
    para_que: 'Algo comprobable, no «cuando quede bien».',
    ejemplo: 'Para cuando el párrafo tenga menos de 80 palabras, empiece con un dato y no lleve ningún adverbio en -mente.',
    frases: ['Para cuando {{condicion_comprobable}}.', 'Para cuando ya no encuentres nada que cambiar.', 'Para cuando tengas {{n}} elementos.', 'Para cuando dos vueltas seguidas no cambien nada.'],
  },
  tope: {
    rotulo: 'Tope',
    para_que: 'Máximo de vueltas y qué hace al llegar.',
    ejemplo: 'Máximo 5 vueltas. Si llegas al tope, entrega lo mejor que tengas y di por qué no paró.',
    frases: ['Máximo {{n}} vueltas.', 'Máximo 5 vueltas.', 'Si llegas al tope, entrega lo mejor que tengas y di por qué no paró.', 'Cuenta las vueltas en voz alta: «Vuelta 3 de 5».'],
  },
  memoria: {
    rotulo: 'Lo que se guarda entre vueltas',
    para_que: 'Sin esto cada vuelta repite los errores ya corregidos.',
    ejemplo: 'Se guarda: la última versión y la lista de lo que ya se corrigió. Se descarta: las versiones anteriores.',
    frases: ['Guarda la última versión y la lista de lo ya corregido.', 'Guarda solo lo que cumplió; descarta lo demás.', 'Numera cada vuelta y di qué cambió.', 'No repitas un cambio que ya se hizo.'],
  },
  verificacion: {
    rotulo: 'Verificación',
    para_que: 'Cómo se comprueba cada vuelta; sin esto el criterio es una opinión.',
    ejemplo: 'Después de cada vuelta, comprueba las tres condiciones una por una y di cuál falla y en qué frase.',
    frases: ['Después de cada vuelta, comprueba las reglas una por una y di cuáles fallan.', 'Cuenta: ¿el número de fallos bajó?', 'Compara con el ejemplo bueno: ¿se parece más o menos que antes?', 'Verifica con un dato que no usaste para escribir.'],
  },
  salida: {
    rotulo: 'Qué sale al final',
    para_que: 'Lo que se entrega al terminar, y solo eso.',
    ejemplo: 'La versión final y, debajo, en un renglón por vuelta, qué cambió.',
    frases: ['Solo la versión final.', 'La versión final y, debajo, qué cambió en cada vuelta.', 'Todas las vueltas, numeradas.', 'La final y la primera, para comparar.'],
  },
  borrador: {
    rotulo: 'Borrador',
    para_que: 'El primer texto, sin pulir, sobre el que va a trabajar el crítico.',
    ejemplo: 'Escribe un resumen de 150 palabras de lo que va abajo.',
    frases: ['Escribe {{que}} de {{n}} palabras.', 'Haz un primer borrador sin pulir.', 'Usa solo lo que va abajo, entre las marcas ===.', 'Empieza por {{que}}.'],
  },
  critico: {
    rotulo: 'Crítico',
    para_que: 'OTRO rol, con nombre, sin elogios y sin reescribir.',
    ejemplo: 'Como editor exigente, señala tres fallos concretos con su renglón: uno de datos, uno de forma, uno de claridad. Nada de elogios. Si no hay fallos graves, di solo «APROBADO».',
    frases: ['Como {{rol_critico}}, señala {{n}} fallos concretos con su renglón.', 'Nada de elogios: solo lo que falla.', 'Revisa contra esta lista: {{lista}}.', 'Si no hay fallos graves, di «APROBADO» y nada más.'],
  },
  revision: {
    rotulo: 'Revisión',
    para_que: 'Cómo se corrige con lo que el crítico señaló, y nada más.',
    ejemplo: 'Corrige solo lo que señaló el crítico; no toques lo demás. Cada corrección con su porqué en un renglón.',
    frases: ['Corrige solo lo señalado; no toques lo demás.', 'Cada corrección con su porqué en un renglón.', 'Si no estás de acuerdo con el crítico, dilo y no cambies.', 'Devuelve la pieza entera, no solo los cambios.'],
  },
  lista: {
    rotulo: 'Lista', lista: true, plantilla: '',
    para_que: 'Los elementos, uno por renglón; si es larga va en 📎 Material y aquí se dice «lo que va abajo».',
    ejemplo: 'Fracciones\nDecimales\nPorcentajes\nProporciones',
    frases: ['Uno por renglón: {{lista}}', 'Los elementos van abajo, entre las marcas ===.', 'Trata cada renglón como un elemento, sin juntar dos.', 'Si un renglón está vacío, sáltalo y dilo.'],
  },
  postura_a: {
    rotulo: 'Postura A',
    para_que: 'La tesis que defiende A, y con qué datos.',
    ejemplo: 'Defiende que la jornada extendida reduce la deserción, con datos de 2015-2024.',
    frases: ['Defiende que {{tesis}} con datos.', 'Habla como {{autor}} defendería {{tesis}}.', 'No concede nada sin una fuente en contra.', 'Máximo {{n}} palabras por turno.'],
  },
  postura_b: {
    rotulo: 'Postura B',
    para_que: 'La tesis contraria, que defiende B.',
    ejemplo: 'Defiende que la deserción bajó por otras causas y que la jornada extendida se lleva el mérito sin evidencia.',
    frases: ['Defiende lo contrario: {{antitesis}}.', 'Busca el punto más débil de A.', 'Habla como {{autor}}.', 'Máximo {{n}} palabras por turno.'],
  },
  juez: {
    rotulo: 'Juez',
    para_que: 'Sin juez, el careo termina en empate por cansancio.',
    ejemplo: 'Puntúa cada ronda por evidencia y no por retórica; nombra cada falacia que veas.',
    frases: ['Puntúa por evidencia, no por retórica.', 'Nombra cada falacia que veas.', 'No decide hasta la última ronda.', 'Resume lo mejor de cada lado antes de fallar.'],
  },
};

/* Los bloques que hacen de una pieza un PROMPT. Si el lector reconoce
   uno de estos por su rótulo, no propone un bucle (§5 paso 6): «Repite
   esto para cada tema» dentro de una Tarea es una frase de la tarea. */
const CSG_BLOQUES_PROMPT = ['rol', 'contexto', 'tarea', 'reglas', 'formato', 'ejemplos', 'comprobacion', 'tono', 'objetivo', 'estilo', 'audiencia', 'pregunta', 'fuentes', 'citas', 'voz', 'genero', 'tema'];

/* ══════════════════════════════════════════════════════════════════
   LOS MOLDES (§3.1 a §3.4). Un molde es un formato con nombre: una
   LISTA DE IDS del vocabulario, en su orden, con su obligatoriedad (`ob`)
   y con las SOBREESCRITURAS que ese molde declara. Lo que trae una
   entrada además del id —rotulo, para_que, ejemplo, frases, inicial,
   plantilla— pisa al vocabulario SOLO dentro de ese molde: así `formato`
   se llama «Respuesta» en CO-STAR y `tope` «Rondas» en el Careo sin que
   existan dos ids para lo mismo (regla 3). Si hubiera dos ids, cambiar
   de molde dejaría el texto de la persona como bloque libre, y la
   graduación de Encargo a SKILL.md es justo el camino que más se usa.

   ⚠️ Aquí SOLO va lo que difiere del vocabulario. Una sobreescritura
   que repite el texto del vocabulario no rompe nada hoy, pero el día que
   alguien corrija la frase en CSG_BLOQUES la copia de aquí seguiría
   diciendo la vieja en ese molde, sin ningún aviso. Menos copias, menos
   sitios donde una corrección se queda a medias.

   Las marcas del molde, con su porqué:
   · `recomendado`: el molde con que abre la clase. Uno por clase, y es
     el mismo que dice CSG_CLASES (la prueba lo cruza).
   · `sinEncabezados` (Rápido, Libre): el primer bloque sale pelado. Un
     «## Tarea» delante de una frase es ruido en un prompt de una línea.
   · `forma`: la fuerza el molde y no la máquina. Un SKILL.md es un
     archivo con su formato, lo pida quien lo pida; y un recuadro de
     instrucciones de sistema es texto plano en todas las máquinas.
   · `rotuloMayus`, `cabecera`: cómo se escriben los párrafos en forma
     seguida (§7).
   · `reordena`: `ultimo` son los bloques que salen al final pase lo que
     pase (el «Ahora tú» de Con ejemplos: si no va el último, la máquina
     lo toma por un ejemplo más); `porMaquina` es el orden entero para una
     máquina concreta (Perplexity lee primero de dónde puede sacar).
   · `auto`, `pseudo`, `cierre`: los textos de los bucles (§7, «Textos de
     los moldes»). `{N}` del pseudo lo rellena el armado con el primer
     entero del bloque `tope`.
   · `orquestar`: qué texto del «prompt para un solo chat» lleva el grafo
     (CSG_TEXTOS).
   · `vozPrestada`: lo que la máquina devuelva va a La Voz Prestada, y
     Usar ofrece «📖 Guardar lo que devolvió».
   · `cuando`: la línea que se lee en la hoja «Molde ▾». Donde la
     especificación no trae una línea de «cuándo» (los grafos y tres de
     los bucles) se escribió con lo que dice el encabezado de su clase:
     un molde sin «cuándo» obliga a abrirlo para saber si era ese.
   ══════════════════════════════════════════════════════════════════ */
const CSG_MOLDES = {

  /* ── 💬 PROMPT ──────────────────────────────────────────────────── */

  /* Un solo obligatorio, y es a propósito: un «rápido» con dos
     obligatorios no es rápido (regla 1 del Apunte rápido). */
  rapido: {
    id: 'rapido', clase: 'prompt', nombre: 'Rápido', recomendado: true, sinEncabezados: true,
    cuando: 'cuando sabes qué quieres y no se va a reusar.',
    bloques: [
      { id: 'tarea',   ob: true },
      { id: 'formato', ob: false },
    ],
  },

  /* Abre con Tarea y Formato abiertos y los otros seis plegados: eso lo
     dice `ob`, y el compositor pliega lo opcional. */
  encargo: {
    id: 'encargo', clase: 'prompt', nombre: 'Encargo completo', recomendado: false,
    cuando: 'cuando importa el resultado o se va a reusar.',
    bloques: [
      { id: 'rol',      ob: false },
      { id: 'contexto', ob: false },
      { id: 'tarea',    ob: true,
        ejemplo: 'Reescribe los tres primeros párrafos para que el dato más fuerte salga en la primera frase.',
        frases: ['Reescribe {{que}} para que {{objetivo}}.', 'Resume {{texto}} en diez puntos, uno por renglón.', 'Escribe {{pieza}} de {{n}} palabras sobre {{tema}}.', 'Revisa {{texto}} y señala lo que no se sostiene.', 'Convierte {{texto}} en {{forma}}.'] },
      { id: 'reglas',   ob: false },
      /* Aquí obligatorio: es lo que convierte una respuesta en material
         pegable. */
      { id: 'formato',  ob: true,
        ejemplo: 'Los tres párrafos reescritos, y debajo una lista de qué cambiaste y por qué, un cambio por renglón.' },
      { id: 'ejemplos', ob: false },
      { id: 'comprobacion', ob: false },
      { id: 'tono',     ob: false },
    ],
  },

  /* Seis bloques en el orden de la sigla, y ese orden no se cambia: el
     nombre ES el orden (Context, Objective, Style, Tone, Audience,
     Response). */
  costar: {
    id: 'costar', clase: 'prompt', nombre: 'CO-STAR', recomendado: false,
    cuando: 'cuando el problema no es qué hacer sino para quién y con qué efecto.',
    bloques: [
      { id: 'contexto', ob: false,
        ejemplo: 'Es la columna de apertura del número de octubre de la revista de la casa; el tema del número es la memoria.',
        frases: ['Es para {{destino}}, que lee {{quien}}.', 'Ya tengo esto hecho: {{lo_hecho}}. No lo repitas.', 'El material está abajo, entre las marcas ===.', 'Lo voy a pegar tal cual, sin retocar, así que cuida el formato.', 'El texto es mío; puedes ser duro.', 'Ya se publicó {{lo_anterior}}; esto es lo que sigue.'] },
      { id: 'objetivo', ob: true },
      { id: 'estilo',   ob: false },
      { id: 'tono',     ob: false,
        ejemplo: 'Cercano y con algo de humor, sin perder la seriedad del dato.' },
      { id: 'audiencia', ob: true },
      { id: 'formato',  ob: true, rotulo: 'Respuesta',
        para_que: 'La forma exacta: largo, estructura, idioma.',
        ejemplo: '600 palabras, cuatro párrafos, sin subtítulos, en español de Honduras.',
        frases: ['{{n}} palabras en {{k}} párrafos, sin subtítulos.', 'En una lista de puntos, sin introducción ni despedida.', 'En español de Honduras, tuteando.', 'Solo el texto pedido: nada de comentarios sobre lo que hiciste.'] },
    ],
  },

  /* El repaso avisa con menos de dos pares: un solo ejemplo se copia,
     dos distintos se generalizan. */
  ejemplos: {
    id: 'ejemplos', clase: 'prompt', nombre: 'Con ejemplos', recomendado: false,
    cuando: 'cuando es más fácil enseñar tres casos que explicar la regla.',
    reordena: { ultimo: ['caso'] },
    bloques: [
      { id: 'tarea',    ob: true,
        para_que: 'Qué hay que hacer con cada entrada.',
        ejemplo: 'Convierte cada cita suelta a la forma (Autor, año, p.).',
        frases: ['Convierte cada {{entrada}} a {{forma}}.', 'Clasifica cada renglón en una de estas clases: {{clases}}.', 'Extrae de cada texto: {{datos}}.', 'Reescribe cada frase siguiendo el patrón de los ejemplos.'] },
      { id: 'ejemplos', ob: true,
        para_que: 'Pares entrada → salida, al menos dos y que cubran casos distintos.',
        ejemplo: 'Harari 2014 página 45 → (Harari, 2014, p. 45)\nInforme del BID de 2023, p. 12 → (BID, 2023, p. 12)',
        frases: ['{{entrada}} → {{salida}}', 'Un caso difícil: {{entrada_dificil}} → {{salida}}', 'Así NO: {{ejemplo_malo}}', 'Un ejemplo por clase, para que ninguna quede sin enseñar.'] },
      { id: 'caso',     ob: true },
      { id: 'formato',  ob: false,
        para_que: 'Solo si la salida tiene que diferir de los ejemplos.',
        ejemplo: 'Un renglón por caso: «caso → clase», sin nada más.',
        frases: ['Un renglón por caso, con la misma flecha que los ejemplos.', 'Solo la salida, sin repetir la entrada.', 'En una tabla de dos columnas: entrada y salida.', 'Sin explicaciones salvo en los casos dudosos, y ahí en una frase.'] },
    ],
  },

  /* El «cuándo» dice que NO es para textos creativos: pedirle a un cuento
     que razone paso a paso da un cuento con índice. */
  razonado: {
    id: 'razonado', clase: 'prompt', nombre: 'Razonado', recomendado: false,
    cuando: 'cálculos, decisiones, análisis con varios caminos; NO para textos creativos.',
    bloques: [
      { id: 'tarea',    ob: true,
        para_que: 'La pregunta o el problema, con sus datos.',
        ejemplo: 'Decide si conviene pasar el presupuesto de la casa de mensual a quincenal, con estos datos: …',
        frases: ['Decide si {{opcion_a}} o {{opcion_b}}, con estos datos: {{datos}}.', 'Calcula {{que}} a partir de {{datos}}.', 'Analiza {{situacion}} y di qué harías.', 'Encuentra el error en {{razonamiento}}.'] },
      { id: 'pasos',    ob: true, rotulo: 'Cómo pensarlo',
        para_que: 'Los pasos en orden, escritos por quien sabe hacerlo: lo que separa «piensa paso a paso» de un método.',
        ejemplo: '1. Separa premisas de conclusión.\n2. Comprueba si la conclusión se sigue aunque las premisas sean falsas.\n3. Solo entonces mira si las premisas son verdad.',
        frases: ['Antes de responder, razona paso a paso y muéstralo.', 'Primero {{paso1}}; después {{paso2}}; solo al final {{paso3}}.', 'Considera al menos dos caminos y di por qué eliges uno.', 'Si un paso depende de un dato que no tienes, márcalo.'] },
      { id: 'responde', ob: true },
      { id: 'comprobacion', ob: false,
        ejemplo: 'Vuelve a hacer la cuenta por otro camino y mira que dé lo mismo.',
        frases: ['Vuelve a hacerlo por otro camino y mira que dé lo mismo.', 'Comprueba cada cifra contra los datos que te di.', 'Di qué pasaría si la suposición {{n}} fuera falsa.', 'Al final, di en una línea qué no pudiste comprobar.'] },
    ],
  },

  /* El molde de la casa: ninguna fuente entra sin su etiqueta. En
     Perplexity, Fuentes y Citas van delante porque es un buscador: lo
     primero que lee decide dónde busca. Y en NotebookLM, con Fuentes
     vacío, el armado inyecta «Usa solo las fuentes del cuaderno.»
     (CSG_TEXTOS.fuentesCuaderno): allí el cuaderno ES la bibliografía. */
  fuentes: {
    id: 'fuentes', clase: 'prompt', nombre: 'Investigación con fuentes', recomendado: false,
    cuando: 'cuando la respuesta va a acabar en La Voz Prestada como ensayo con bibliografía, en Redacción o en un video-ensayo.',
    reordena: { porMaquina: { perplexity: ['fuentes', 'citas', 'pregunta', 'formato', 'limites'] } },
    vozPrestada: true,
    bloques: [
      { id: 'pregunta', ob: true },
      { id: 'fuentes',  ob: true },
      { id: 'citas',    ob: true },
      { id: 'formato',  ob: true,
        ejemplo: 'Un ensayo de 1.500 palabras con subtítulos «## », en español de Honduras.',
        frases: ['Un ensayo de {{n}} palabras con subtítulos «## ».', 'Una tabla con un renglón por hallazgo: dato · fuente · año.', 'Primero lo que se sabe seguro; después lo discutido; al final lo que nadie ha medido.', 'Encabeza con Título:, Voz: y Máquina:, una por renglón.'] },
      { id: 'limites',  ob: false },
    ],
  },

  /* Lo que devuelva va derecho a La Voz Prestada, y por eso la etiqueta
     es obligatoria y nace rellena (regla 14): pedirla en la ida es lo
     único que asegura que el texto vuelva con su voz y su máquina
     escritas. La etiqueta lleva su `inicial` en el vocabulario. */
  voz: {
    id: 'voz', clase: 'prompt', nombre: 'Voz prestada', recomendado: false,
    cuando: 'un cuento, ensayo, poema o carta «a la manera de» alguien.',
    vozPrestada: true,
    bloques: [
      { id: 'voz',      ob: true },
      { id: 'genero',   ob: true },
      { id: 'tema',     ob: true },
      { id: 'etiqueta', ob: true },
    ],
  },

  /* Solo en Prompt: un «Libre» en Grafo sería una clase cuya exportación
     no existe. Lo pegado que no se entiende cae aquí, y el chip propone
     la clase. */
  libre: {
    id: 'libre', clase: 'prompt', nombre: 'Libre', recomendado: false, sinEncabezados: true,
    cuando: 'donde cae lo pegado que no se entiende como bloques y lo escrito de un tirón.',
    bloques: [
      { id: 'texto', ob: true },
    ],
  },

  /* ── 🧰 HABILIDAD ───────────────────────────────────────────────── */

  /* Un frontmatter mal hecho no da error: la habilidad no carga nunca.
     Por eso el repaso PARA el uso si `name` o `description` no cumplen,
     y por eso la forma la pone el molde y no la máquina. */
  skill: {
    id: 'skill', clase: 'habilidad', nombre: 'SKILL.md', recomendado: true, forma: 'skill',
    cuando: 'el formato de las Agent Skills: frontmatter name/description, que es lo que la máquina lee para decidir si la usa.',
    bloques: [
      { id: 'nombre',     ob: true },
      { id: 'disparador', ob: true },
      { id: 'pasos',      ob: true },
      { id: 'recursos',   ob: false },
      /* El mismo id que la comprobación de un prompt: graduar un Encargo
         a SKILL.md la deja en su sitio, no como bloque libre. */
      { id: 'comprobacion', ob: true, rotulo: 'Comprobaciones',
        para_que: 'Lo que revisa antes de dar por hecha la tarea; lo que separa una habilidad de un prompt largo.',
        ejemplo: 'Ningún nombre propio cambiado.\nNinguna cifra tocada.\nCada cambio con su norma.',
        frases: ['Antes de entregar, revisa que cumpliste cada paso.', 'Ningún dato del original cambiado.', 'Cuenta lo pedido: tienen que ser {{n}}.', 'Si una comprobación falla, corrige y vuelve a revisar, hasta {{n}} veces.'] },
      { id: 'ejemplos',   ob: false,
        para_que: 'Un pedido real y lo que hace con él, y uno en que NO se activa.',
        ejemplo: 'Pedido: «Arréglame esta nota» + texto pegado → corrige y devuelve las dos partes.\nNo se activa: «Hazme un post de esta nota».',
        frases: ['Pedido: «{{pedido}}» → {{que_hace}}.', '{{entrada}} → {{salida}}', 'Caso en que NO se activa: «{{pedido}}» → {{otra_habilidad}}.', 'Un caso corto vale más que tres reglas.'] },
    ],
  },

  /* Texto seguido SIEMPRE, aunque la máquina sea Claude: los recuadros de
     instrucciones son planos, y unas etiquetas XML pegadas ahí se leen
     como texto. Rótulos en mayúsculas («SIEMPRE: …») porque sin
     encabezados es lo único que separa un párrafo de otro. */
  sistema: {
    id: 'sistema', clase: 'habilidad', nombre: 'Instrucción de sistema', recomendado: false,
    forma: 'seguida', rotuloMayus: true,
    cuando: 'para un Gem, un GPT, un Proyecto de Claude o el «system prompt» de cualquier máquina.',
    bloques: [
      { id: 'identidad', ob: true },
      { id: 'mision',    ob: true },
      { id: 'siempre',   ob: true },
      { id: 'nunca',     ob: true },
      { id: 'formato',   ob: false, rotulo: 'Formato de siempre',
        para_que: 'Cómo entrega cada vez.',
        ejemplo: 'Primero el texto corregido; debajo «Cambios:» con uno por renglón y su norma.',
        frases: ['Primero el resultado; debajo, la lista de cambios.', 'En Markdown, con un encabezado por sección.', 'Máximo {{n}} palabras salvo que pidan más.', 'Solo el texto pedido: nada de comentarios sobre lo que hiciste.'] },
      { id: 'ejemplos',  ob: false, rotulo: 'Ejemplos de conversación',
        para_que: 'Cómo responde ante lo típico y ante lo que se sale del tema.',
        ejemplo: 'Usuario: «corrige esto: …» → Tú: el texto corregido + «Cambios: …».\nUsuario: «hazme un poema» → Tú: «Eso no es lo mío; pídeselo a otro chat.»',
        frases: ['Usuario: {{pide}} → Tú: {{respondes}}', 'Si el usuario pide {{x}}, responde {{y}}.', 'Si el usuario se sale del tema, di: {{frase}}.', 'Empieza siempre con {{saludo_o_nada}}.'] },
    ],
  },

  /* Tres ids que también tiene SKILL.md (disparador, pasos,
     comprobacion): cambiar la receta a SKILL.md conserva los tres en su
     sitio y solo falta el `name`, que se propone desde el título. */
  receta: {
    id: 'receta', clase: 'habilidad', nombre: 'Receta corta', recomendado: false,
    forma: 'seguida', cabecera: 'Regla para esta conversación:',
    cuando: 'cinco renglones que valen toda la charla.',
    bloques: [
      { id: 'disparador', ob: true, rotulo: 'Cuándo',
        para_que: 'En qué momentos de la conversación se aplica.',
        ejemplo: 'Cada vez que te pegue un texto entre marcas ===.',
        frases: ['Cada vez que te pegue {{que}}.', 'Cuando te pida {{palabras}}.', 'Durante toda esta conversación.', 'Solo cuando lo pida con la palabra {{clave}}.'] },
      { id: 'pasos',      ob: true, rotulo: 'Qué haces',
        ejemplo: '1. Corriges ortografía.\n2. Señalas estilo con su norma.\n3. Devuelves el texto y la lista.' },
      { id: 'comprobacion', ob: true, rotulo: 'Qué revisas',
        ejemplo: 'Que no cambiaste ningún nombre ni cifra.' },
    ],
  },

  /* ── 🕸 GRAFO ───────────────────────────────────────────────────── */

  /* Los nodos van en PROSA con dos puntos («Nombre: recibe X, entrega
     Y»), nunca con tubos: la tecla | no está en el teclado de una
     tableta. FIN es un nodo que existe siempre. */
  cadena: {
    id: 'cadena', clase: 'grafo', nombre: 'Cadena', recomendado: true, orquestar: 'cadena',
    cuando: 'cuando el trabajo pasa de uno a otro en orden, con alguna vuelta atrás si algo no cuadra.',
    bloques: [
      { id: 'meta',    ob: true },
      { id: 'nodos',   ob: true },
      { id: 'aristas', ob: true },
      { id: 'estado',  ob: false },
      { id: 'fin',     ob: true },
    ],
  },

  /* «Coordinador» y no «Orquestador»: ese nombre choca con la
     exportación «prompt para un solo chat» que sale de todos los grafos. */
  coordinador: {
    id: 'coordinador', clase: 'grafo', nombre: 'Coordinador y especialistas', recomendado: false, orquestar: 'coordinador',
    cuando: 'cuando uno reparte el encargo entre especialistas y junta lo que devuelven.',
    bloques: [
      { id: 'coordinador', ob: true },
      { id: 'nodos',   ob: true, rotulo: 'Especialistas, uno por renglón',
        para_que: 'Cada uno con su nombre y su tema.',
        ejemplo: 'Historiador: fechas y contexto, con fuente.\nEconomista: cifras con fuente y año.\nEditor: la forma final.',
        frases: ['{{nombre}}: {{tema}}, con fuente.', 'Historiador: fechas y contexto.', 'Economista: cifras con fuente y año.', 'Verificador: lo que no cuadra entre los demás.'],
        plantilla: '{{nombre}}: {{tema}}, con fuente.' },
      { id: 'reparto', ob: true },
      { id: 'juntar',  ob: true },
      { id: 'fin',     ob: true,
        ejemplo: 'Termina cuando todos entregaron y el Coordinador no encuentra contradicciones. Entrega un informe con un apartado por especialista y una bibliografía única.',
        frases: ['Termina cuando {{condicion}}.', 'Entrega en la forma: {{formato}}.', 'Con una bibliografía única al final.', 'Si alguien no entrega, se dice qué falta y se entrega igual.'] },
    ],
  },

  /* ── 🔁 BUCLE ───────────────────────────────────────────────────── */
  /* Sin tope no se puede USAR (se guarda como borrador con el tope en
     rojo): un bucle sin tope es un chat que no termina. Todos sacan un
     `plan` y un «auto-bucle»; el `pseudo` va solo en md, en un bloque de
     código, porque en xml o en texto seguido un bloque de código es ruido
     que la máquina copia. */

  hasta: {
    id: 'hasta', clase: 'bucle', nombre: 'Repite hasta', recomendado: true,
    cuando: 'cuando un mismo paso se repite hasta cumplir algo comprobable.',
    bloques: [
      { id: 'paso',         ob: true },
      { id: 'parada',       ob: true },
      { id: 'tope',         ob: true },
      { id: 'memoria',      ob: false },
      { id: 'verificacion', ob: false },
      { id: 'salida',       ob: true },
    ],
    auto: 'Hazlo tú solo, por vueltas y numerando cada una como VUELTA n. En cada vuelta: haz el paso; comprueba el criterio de parada, condición por condición, y di cuál falla; si cumple, para; si no, vuelve a hacer el paso con lo que falló en cuenta y con lo que se guarda entre vueltas. Al cumplir el criterio o al llegar al tope, entrega lo que dice «Qué sale al final».',
    pseudo: 'VUELTA 1..{N}:\n  hacer el paso\n  comprobar el criterio de parada, condición por condición\n  si cumple: parar y entregar\n  si no: apuntar qué falló y volver a hacer el paso con eso en cuenta\nal llegar al tope: entregar lo mejor y decir por qué no paró',
    cierre: 'Repite «Paso que se repite» hasta que se cumpla «Criterio de parada» o se llegue al «Tope», numerando cada vuelta como VUELTA n.',
  },

  /* El crítico es OTRO rol, con nombre y sin reescribir: un crítico que
     reescribe es un segundo redactor, y el bucle deja de converger. */
  critica: {
    id: 'critica', clase: 'bucle', nombre: 'Borrador y crítica', recomendado: false,
    cuando: 'cuando un texto mejora pasando por un crítico que señala y no reescribe.',
    bloques: [
      { id: 'borrador', ob: true },
      { id: 'critico',  ob: true },
      { id: 'revision', ob: true },
      { id: 'parada',   ob: true,
        ejemplo: 'Para cuando el crítico diga APROBADO.',
        frases: ['Para cuando el crítico diga APROBADO.', 'Para si dos vueltas seguidas no cambian nada.', 'Para cuando el crítico encuentre menos de {{n}} problemas.', 'Si el crítico repite la misma crítica dos veces, para y dilo.'] },
      { id: 'tope',     ob: true,
        ejemplo: 'Máximo 4 vueltas. Al tope, entrega la última y la lista de lo que quedó.' },
      { id: 'salida',   ob: true,
        ejemplo: 'La versión aprobada y, debajo, las críticas de cada vuelta.',
        frases: ['Solo la versión aprobada.', 'La aprobada y, debajo, las críticas de cada vuelta.', 'La primera y la última, para comparar.', 'La aprobada y lo que el crítico nunca dejó de señalar.'] },
    ],
    auto: 'Haz las dos voces tú solo, por turnos y en este orden. Primero, como REDACTOR: escribe el borrador. Después, como CRÍTICO: revísalo con la lista y señala los fallos, o di solo APROBADO. Después, como REDACTOR otra vez: corrige solo lo señalado. Repite CRÍTICO y REDACTOR hasta que el crítico diga APROBADO o se llegue al tope, numerando cada vuelta como VUELTA n. Al terminar, entrega lo que dice «Qué sale al final».',
    pseudo: 'VUELTA 1..{N}:\n  REDACTOR: escribir (vuelta 1) o corregir solo lo señalado\n  CRÍTICO: revisar y listar fallos, o decir APROBADO\n  si APROBADO: parar y entregar\nal llegar al tope: entregar la última versión y lo que quedó señalado',
    cierre: 'Repite «Crítico» y «Revisión» hasta «Criterio de parada» o hasta el «Tope», numerando cada vuelta como VUELTA n.',
  },

  /* Aquí el tope es la propia lista, y por eso nace relleno: pedirle a la
     persona «máximo N vueltas» cuando las vueltas son los renglones es
     hacerle contar lo que la máquina ya ve. */
  lotes: {
    id: 'lotes', clase: 'bucle', nombre: 'Por lotes', recomendado: false,
    cuando: 'cuando lo mismo se hace con cada elemento de una lista.',
    bloques: [
      { id: 'lista',   ob: true },
      { id: 'paso',    ob: true, rotulo: 'Paso por elemento',
        para_que: 'Qué se hace con cada uno, con el mismo formato para todos.',
        ejemplo: 'Para cada tema: tres preguntas de selección con cuatro opciones y la correcta marcada con ✅.',
        frases: ['Para cada uno: {{que}}.', 'Mismo formato para todos, sin variar.', 'No mezcles un elemento con otro.', 'Si uno no se puede, pon «NO SE PUDO» y sigue con el siguiente.'] },
      { id: 'memoria', ob: false, rotulo: 'Acumulado',
        para_que: 'Qué se lleva de un elemento al siguiente.',
        ejemplo: 'Lleva la cuenta: no repitas una pregunta ya hecha para otro tema.',
        frases: ['No repitas nada ya hecho para otro elemento.', 'Numera seguido de principio a fin.', 'Cada elemento empieza de cero.', 'Lleva una lista de lo que no se pudo.'] },
      { id: 'tope',    ob: true,
        para_que: 'Aquí el tope es la propia lista.',
        inicial: 'Un elemento por vuelta; termina al acabar la lista y nunca pasa de {{n}} elementos.' },
      { id: 'salida',  ob: true, rotulo: 'Salida',
        ejemplo: 'Todo junto, con un encabezado ## por tema y las preguntas numeradas seguidas.',
        frases: ['Todo junto, un encabezado por elemento.', 'Una tabla con un renglón por elemento.', 'Solo los que salieron; los fallidos en una lista aparte.', 'Entrega por partes de {{n}} elementos.'] },
    ],
    auto: 'Recorre la lista tú solo, un renglón por vuelta y en orden, sin juntar dos ni saltarte ninguno. En cada vuelta aplica el paso a ese elemento con el mismo formato, lleva el acumulado, y si uno no se puede, escribe NO SE PUDO y sigue. Al terminar la lista, entrega lo que dice «Salida».',
    pseudo: 'PARA CADA renglón de la lista, en orden:\n  hacer el paso con ese elemento\n  llevar el acumulado\nal terminar la lista: entregar',
    cierre: 'Aplica «Paso por elemento» a cada renglón de «Lista», en orden, hasta acabarla.',
  },

  /* El Careo NO es un grafo aunque tenga tres voces: dos posturas a
     rondas con un juez es un bucle con tope, y en Grafo se exportaría
     como una estrella que no dice cuántas rondas hay. */
  careo: {
    id: 'careo', clase: 'bucle', nombre: 'Careo', recomendado: false, vozPrestada: true,
    cuando: 'dos posturas a rondas con un juez: la forma de las lecturas «careo» de las misiones; lo que devuelve va a La Voz Prestada como género entrevista.',
    bloques: [
      { id: 'postura_a', ob: true },
      { id: 'postura_b', ob: true },
      { id: 'juez',      ob: true },
      { id: 'tope',      ob: true, rotulo: 'Rondas',
        para_que: 'Cuántas, de qué son y cuánto dura cada turno.',
        ejemplo: 'Tres rondas: apertura, réplica y cierre. Cada turno, 150 palabras.',
        frases: ['{{n}} rondas: apertura, réplica y cierre.', 'Cada turno de {{n}} palabras.', 'En la réplica solo se responde a lo dicho; nada nuevo.', 'El juez interviene solo entre rondas.'] },
      /* La especificación sobrescribe rótulo, para qué, inicial y frases.
         Se sobrescribe también el EJEMPLO, con el mismo texto que el
         inicial, por la razón que ya da el vocabulario: si alguien borra
         el recuadro, lo que se ve debajo tiene que ser la etiqueta del
         careo («Voz: A y B», «Género: entrevista»), no la de un cuento a
         la manera de alguien. */
      { id: 'etiqueta',  ob: true, rotulo: 'Veredicto y etiqueta',
        para_que: 'Qué entrega el juez y la etiqueta de la casa.',
        inicial: 'Al final, un veredicto de 200 palabras con la postura que gana, por qué, y las tres mejores pruebas de cada lado. Escribe el careo entero encabezado con estas líneas, una por renglón: «Título:» y un título; «Voz: A y B»; «Máquina: {{maquina}}»; «Género: entrevista»; «Consigna: {{titulo}}». Cada turno empieza en su propio renglón por A:, B: o JUEZ:. Termina con FIN solo en su renglón.',
        ejemplo: 'Al final, un veredicto de 200 palabras con la postura que gana, por qué, y las tres mejores pruebas de cada lado. Escribe el careo entero encabezado con estas líneas, una por renglón: «Título:» y un título; «Voz: A y B»; «Máquina: {{maquina}}»; «Género: entrevista»; «Consigna: {{titulo}}». Cada turno empieza en su propio renglón por A:, B: o JUEZ:. Termina con FIN solo en su renglón.',
        frases: ['Veredicto de {{n}} palabras con quién gana y por qué.', 'Las tres mejores pruebas de cada lado.', 'Lo que ninguno probó.', 'Encabeza con Título:, Voz:, Máquina: y Género: entrevista, una por renglón.'] },
    ],
    auto: 'Escribe el careo entero tú solo, haciendo las tres voces por turnos. Cada turno empieza en su propio renglón por A:, B: o JUEZ:. Respeta las rondas y el largo de cada turno. Al terminar la última ronda, el JUEZ da el veredicto. Encabeza todo con la etiqueta de la casa y termina con FIN solo en su renglón.',
    pseudo: 'RONDA 1..{N}:\n  A: turno\n  B: turno\n  JUEZ: puntúa la ronda\nal terminar las rondas: JUEZ da el veredicto y se escribe el careo entero con su etiqueta',
    cierre: 'Alterna A, B y JUEZ durante las «Rondas» y cierra con «Veredicto y etiqueta».',
  },
};

/* El orden de la hoja «Molde ▾», el recomendado primero. Va aparte y no
   se saca del orden de las llaves de CSG_MOLDES: el orden de un objeto
   depende de cómo se escribió, y el día que alguien añada un molde al
   final del archivo saldría el último de su clase aunque fuera el bueno. */
const CSG_MOLDES_ORDEN = {
  prompt:    ['rapido', 'encargo', 'costar', 'ejemplos', 'razonado', 'fuentes', 'voz', 'libre'],
  habilidad: ['skill', 'sistema', 'receta'],
  grafo:     ['cadena', 'coordinador'],
  bucle:     ['hasta', 'critica', 'lotes', 'careo'],
};

/* ══════════════════════════════════════════════════════════════════
   EQUIVALENCIAS (§2), para «Duplicar en otro molde» cuando el destino
   no tiene el id. Se toma el primer candidato que el destino tenga y
   esté vacío; lo demás queda como bloque libre marcado «traído de «X»».
   Está ESCRITO y no se adivina por el rótulo: «Rol» y «Identidad» no se
   parecen en nada y son lo mismo; «Salida» y «Formato» se parecen y no
   siempre lo son. Es lo único que Duplicar consulta además del id.
   ══════════════════════════════════════════════════════════════════ */
const CSG_EQUIVALE = {
  rol:          ['identidad'],
  identidad:    ['rol'],
  tarea:        ['mision', 'paso', 'pregunta', 'borrador', 'texto'],
  mision:       ['tarea'],
  paso:         ['tarea'],
  pregunta:     ['tarea'],
  borrador:     ['tarea'],
  texto:        ['tarea'],
  reglas:       ['siempre', 'limites'],
  siempre:      ['reglas'],
  nunca:        ['reglas'],
  limites:      ['reglas'],
  objetivo:     ['meta', 'tarea'],
  meta:         ['objetivo'],
  responde:     ['formato'],
  salida:       ['formato', 'fin'],
  fin:          ['salida'],
  estilo:       ['tono'],
  verificacion: ['comprobacion'],
  comprobacion: ['verificacion'],
};

/* ══════════════════════════════════════════════════════════════════
   SINÓNIMOS (§5): la palabra con que alguien rotula una parte de su
   prompt, en español o en inglés, y el bloque al que va. Las claves van
   YA NORMALIZADAS como las deja csgClaveEtiqueta —sin tildes, en
   minúsculas y con un solo espacio—, porque comparar contra una clave
   con tilde no casaría nunca y el rótulo se quedaría como prosa sin que
   nadie supiera por qué.

   ⚠️ Esta lista es la que decide qué ASCIENDE a rótulo con la forma
   «Palabra: …» o «PALABRA» sola (pasos c y d del lector). Añadir aquí una
   palabra común de la prosa («nota», «idea») haría que el lector partiera
   el texto en ese renglón, que es el fallo caro de la asimetría (regla 8).
   Solo entran palabras que en un prompt son rótulos y casi nunca otra cosa.
   ══════════════════════════════════════════════════════════════════ */
const CSG_SINONIMOS = {
  'rol': 'rol', 'role': 'rol', 'persona': 'rol', 'eres': 'rol',
  'contexto': 'contexto', 'context': 'contexto', 'background': 'contexto', 'situacion': 'contexto',
  'tarea': 'tarea', 'task': 'tarea', 'instruccion': 'tarea', 'instrucciones': 'tarea', 'instruction': 'tarea', 'goal': 'tarea', 'pedido': 'tarea', 'encargo': 'tarea',
  'objetivo': 'objetivo', 'objective': 'objetivo',
  'reglas': 'reglas', 'rules': 'reglas', 'constraints': 'reglas', 'restricciones': 'reglas', 'guidelines': 'reglas', 'no hagas': 'reglas',
  'formato': 'formato', 'formato de salida': 'formato', 'format': 'formato', 'output': 'formato', 'output format': 'formato', 'respuesta': 'formato', 'response': 'formato',
  'ejemplos': 'ejemplos', 'examples': 'ejemplos', 'few-shot': 'ejemplos',
  'comprobacion': 'comprobacion', 'comprobaciones': 'comprobacion', 'checks': 'comprobacion', 'verification': 'comprobacion', 'validation': 'comprobacion', 'como se comprueba': 'comprobacion', 'que revisas': 'comprobacion',
  'tono': 'tono', 'tone': 'tono',
  'estilo': 'estilo', 'style': 'estilo',
  'audiencia': 'audiencia', 'audience': 'audiencia', 'publico': 'audiencia',
  'ahora tu': 'caso', 'ahora': 'caso', 'caso': 'caso', 'caso nuevo': 'caso', 'now': 'caso',
  'pasos': 'pasos', 'steps': 'pasos', 'como pensarlo': 'pasos', 'que haces': 'pasos',
  'luego responde': 'responde', 'responde': 'responde', 'answer': 'responde',
  'pregunta': 'pregunta', 'question': 'pregunta', 'research question': 'pregunta',
  'fuentes': 'fuentes', 'fuentes permitidas': 'fuentes', 'sources': 'fuentes',
  'citas': 'citas', 'reglas de cita': 'citas', 'citations': 'citas',
  'limites': 'limites', 'limits': 'limites', 'scope': 'limites',
  'voz': 'voz', 'voice': 'voz',
  'genero': 'genero', 'genre': 'genero', 'genero y largo': 'genero',
  'tema': 'tema', 'topic': 'tema', 'tema o encargo': 'tema',
  'etiqueta': 'etiqueta', 'etiqueta de la casa': 'etiqueta',
  'nombre': 'nombre', 'name': 'nombre',
  'description': 'disparador', 'descripcion': 'disparador', 'cuando se dispara': 'disparador', 'cuando': 'disparador', 'when': 'disparador', 'trigger': 'disparador', 'cuando usarla': 'disparador', 'when to use': 'disparador',
  'recursos': 'recursos', 'resources': 'recursos', 'herramientas': 'recursos', 'tools': 'recursos',
  'identidad': 'identidad', 'identity': 'identidad',
  'mision': 'mision', 'mission': 'mision',
  'siempre': 'siempre', 'always': 'siempre',
  'nunca': 'nunca', 'never': 'nunca',
  'meta': 'meta', 'goal final': 'meta',
  'nodos': 'nodos', 'nodes': 'nodos', 'agentes': 'nodos', 'agents': 'nodos', 'especialistas': 'nodos',
  'aristas': 'aristas', 'edges': 'aristas', 'flujo': 'aristas', 'flow': 'aristas', 'pasos y condiciones': 'aristas',
  'estado': 'estado', 'state': 'estado', 'lo que viaja': 'estado',
  'fin': 'fin', 'fin y entrega': 'fin', 'end': 'fin', 'salida del grafo': 'fin',
  'coordinador': 'coordinador', 'orquestador': 'coordinador', 'orchestrator': 'coordinador',
  'reparto': 'reparto', 'como se reparte': 'reparto',
  'juntar': 'juntar', 'como se junta': 'juntar',
  'paso': 'paso', 'paso que se repite': 'paso', 'step': 'paso', 'vuelta': 'paso',
  'parada': 'parada', 'criterio de parada': 'parada', 'stop': 'parada', 'para cuando': 'parada',
  'tope': 'tope', 'rondas': 'tope', 'max': 'tope', 'limit': 'tope',
  'memoria': 'memoria', 'memory': 'memoria', 'acumulado': 'memoria', 'entre vueltas': 'memoria',
  'verificacion': 'verificacion', 'verify': 'verificacion',
  'salida': 'salida', 'que sale al final': 'salida', 'deliverable': 'salida',
  'borrador': 'borrador', 'draft': 'borrador',
  'critico': 'critico', 'critic': 'critico',
  'revision': 'revision', 'revise': 'revision',
  'lista': 'lista', 'list': 'lista', 'elementos': 'lista',
  'postura a': 'postura_a',
  'postura b': 'postura_b',
  'juez': 'juez', 'judge': 'juez',
  'texto': 'texto', 'text': 'texto', 'prompt': 'texto',

  /* Y los RÓTULOS con que esta misma herramienta arma en md, para que lo
     que salió de aquí vuelva a entrar por «Pegar» a su sitio y no como
     bloques libres. La lista del §5 ya trae casi todos («como pensarlo»,
     «que haces», «rondas», «acumulado»…); estos son los que faltaban.
     Ninguno se escribe en prosa: los de cuatro palabras o más, o con una
     coma, solo ascienden como encabezado «## » o negrita sola, que son
     inequívocos; los de tres («Aristas y condiciones:») pueden ascender
     con sus dos puntos, y en un prompt esa forma solo la tiene un rótulo.
     Los que llevan paréntesis en el vocabulario («Nombre (name)») no se
     pueden casar aquí —csgClaveEtiqueta devuelve vacío en cuanto ve un
     paréntesis—, pero el SKILL.md vuelve por su frontmatter, y
     «descripcion y disparador» cubre al que lo escriba sin paréntesis. */
  'la etiqueta de la casa': 'etiqueta',
  'veredicto y etiqueta': 'etiqueta',
  'nodos, uno por renglon': 'nodos',
  'especialistas, uno por renglon': 'nodos',
  'aristas y condiciones': 'aristas',
  'lo que viaja entre nodos': 'estado',
  'lo que se guarda entre vueltas': 'memoria',
  'paso por elemento': 'paso',
  'formato de siempre': 'formato',
  'ejemplos de conversacion': 'ejemplos',
  'herramientas y recursos': 'recursos',
  'descripcion y disparador': 'disparador',

  /* Y el plural inglés que al §5 se le quedó en el tintero: trae
     «instruction», «instruccion» e «instrucciones», pero no
     «instructions», que es la etiqueta XML con que casi cualquier prompt
     escrito para Claude envuelve la tarea (<instructions>…</instructions>).
     Sin ella, ese bloque entraba por «Pegar» como un bloque libre y el
     prompt se proponía como Libre en vez de Rápido o Encargo. */
  'instructions': 'tarea',
};

/* ══════════════════════════════════════════════════════════════════
   LOS PATRONES DEL BUCLE (§5, paso 6), literales. Solo se miran sobre
   los renglones que siguen en Tarea/Texto y solo si el lector no
   reconoció NINGÚN bloque de prompt (CSG_BLOQUES_PROMPT): «Repite esto
   para cada tema» dentro de un Encargo es una frase de la tarea, y
   convertir ese Encargo en un Bucle partiría el prompt de alguien.
   Hacen falta patrones de DOS clases distintas entre parada/tope/paso
   para proponer un Bucle: un solo «hasta que» aparece en cualquier
   prosa. Van anclados al principio del renglón donde el verbo manda
   («Repite…», «Guarda…») y sueltos donde la frase manda («… hasta que
   …», «máximo 4 vueltas»).
   ══════════════════════════════════════════════════════════════════ */
const CSG_PATRONES_BUCLE = {
  parada: [
    /^(para|parar|detente|termina)\b.*\b(cuando|que)\b/i,
    /\bhasta (que|conseguir|tener|lograr)\b/i,
    /^(until|stop when)\b/i,
  ],
  tope: [
    /\b(m[aá]ximo|como mucho|no m[aá]s de|hasta)\s+\d+\s*(vueltas?|veces|intentos?|iteraci[oó]n(es)?|rondas?)\b/i,
    /\bmax(imum)?\s+\d+\s+(iterations?|attempts?|rounds?|loops?)\b/i,
  ],
  paso: [
    /^(repite|rep[ií]telo|vuelve a|en cada (vuelta|iteraci[oó]n|ronda)|cada vuelta)\b/i,
    /^(repeat|each iteration|loop)\b/i,
  ],
  memoria: [
    /^(guarda|lleva|conserva|recuerda)\b/i,
    /\bentre (vuelta y vuelta|vueltas)\b/i,
  ],
  lotes: [
    /^(para|por) cada (uno|rengl[oó]n|elemento|tema|cap[ií]tulo|autor|caso|l[ií]nea|fila)\b/i,
    /^for each\b/i,
    /\buno por rengl[oó]n\b/i,
  ],
};

/* ══════════════════════════════════════════════════════════════════
   LAS MÁQUINAS (§4). Una lista en el JS y nunca en la base: añadir una
   es una línea aquí con `abrir` vacío, no una migración pegada desde
   una tableta. Son las cuatro de VOZ_MAQUINAS más NotebookLM y «Otra»;
   Copilot y Claude Code se quedan fuera porque nadie de la casa los
   nombró (el SKILL.md sale por Claude).

   · `forma`: cómo se arma cuando el molde no la fuerza. xml en Claude
     porque es lo que mejor sigue y separa instrucción de material; md
     en las demás; `seguida` en NotebookLM porque su recuadro enseña el
     texto crudo y unas almohadillas ahí se leen como almohadillas.
   · `abrir`: la dirección base, LITERAL (regla 15): nunca se arma con
     nada que haya escrito una persona. Vacía = no se abre, solo se copia.
   · `param`: el nombre del parámetro que recibe el texto en la dirección.
     Vacío = la máquina no lo admite y se abre pelada con el texto ya
     copiado (Gemini, NotebookLM). Se copia primero SIEMPRE (regla 16).
   · `donde`: el sitio que nombra el aviso cuando el navegador bloquea la
     ventana: «el texto va copiado; ábrelo tú en claude.ai». Un aviso que
     no dice adónde ir deja a la persona con el texto en el portapapeles
     y sin saber qué hacer con él.
   · `nota`: la línea que se lee bajo el chip de la máquina.
   ══════════════════════════════════════════════════════════════════ */
const CSG_MAQUINAS = [
  { id: 'claude', nombre: 'Claude', forma: 'xml',
    abrir: 'https://claude.ai/new', param: 'q', donde: 'claude.ai',
    nota: 'Cada bloque en su etiqueta. Con bloques de sistema salen «📋 Copiar sistema» (lo que va en las instrucciones de un Proyecto) y «📋 Copiar encargo». Admite SKILL.md.' },
  { id: 'chatgpt', nombre: 'ChatGPT', forma: 'md',
    abrir: 'https://chatgpt.com/', param: 'q', donde: 'chatgpt.com',
    nota: 'Un «## » por bloque y las reglas como lista. El sistema va a «instrucciones personalizadas» o a un GPT.' },
  { id: 'gemini', nombre: 'Gemini', forma: 'md',
    abrir: 'https://gemini.google.com/app', param: '', donde: 'gemini.google.com',
    nota: 'Se abre con el texto copiado: pégalo al llegar. El sistema va a un Gem.' },
  { id: 'perplexity', nombre: 'Perplexity', forma: 'md',
    abrir: 'https://www.perplexity.ai/search', param: 'q', donde: 'perplexity.ai',
    nota: 'Pídele las direcciones; las trae. En Investigación, Fuentes y Citas van primero.' },
  { id: 'notebooklm', nombre: 'NotebookLM', forma: 'seguida',
    abrir: 'https://notebooklm.google.com/', param: '', donde: 'notebooklm.google.com',
    nota: 'Párrafos «Rótulo: texto», sin almohadillas, etiquetas ni asteriscos: su recuadro enseña el texto crudo y el cuaderno ya es el contexto.' },
  { id: 'otra', nombre: 'Otra', forma: 'md',
    abrir: '', param: '', donde: '',
    nota: 'Solo Copiar y Compartir.' },
];

/* ══════════════════════════════════════════════════════════════════
   LOS TOPES, EN UN SOLO SITIO (§9, regla 4). Son los mismos números que
   los `check` de supabase/sql/consigna.sql, y la sonda los lee de ese
   archivo y suspende si uno difiere: si la pantalla dejara pasar más de
   lo que la base admite, el guardado rebotaría con un mensaje de
   PostgreSQL que habla de un `check`, y la persona creería que la nube
   está rota. `nota_uso`, `estante` y `estantes_n` no tienen columna
   propia: son los cortes que mantienen `bitacora` y `estantes` dentro
   de su tope en bytes.
   ⚠️ Y TODOS los que tiene la fila, también los cortos (clase, molde,
   máquina, cuaderno, autor, versión): estaban escritos a mano dentro de
   csgAFila, donde ninguna comprobación los comparaba con el SQL, y el día
   que el SQL cambiara uno el aparato mandaría de más sin enterarse. */
const CSG_TOPES = {
  bloques: 60000, material: 20000, estantes: 1000, notas: 4000,
  bitacora: 60000, versiones: 200000,
  nota_uso: 300, estante: 40, estantes_n: 12, titulo: 200,
  clase: 20, molde: 30, maquina: 40, cuaderno: 80, autor: 40, version: 100000,
};

/* Por encima de 1.500 caracteres codificados el texto NO va en la
   dirección: una dirección larga se corta sin avisar, y lo que se pierde
   es el final —el Formato—, que es justo lo que hace pegable la
   respuesta. Se abre pelada y el botón dice que el texto va copiado. */
const CSG_PREFILL_MAX = 1500;

/* ══════════════════════════════════════════════════════════════════
   TEXTOS FIJOS DEL ARMADO (§7), literales: son parte de lo que se copia,
   y lo que se copia es lo que se ve carácter por carácter (regla 1). La
   prueba de Node compara con los ejemplos de la especificación.
   ══════════════════════════════════════════════════════════════════ */
const CSG_TEXTOS = {
  /* El bloque sintético `como` de los grafos: un chat solo no tiene
     nodos, así que se le dice que los interprete por turnos y que no se
     invente ninguno (una arista a ninguna parte es un nodo inventado). */
  orquestarCadena: primero =>
    'Vas a hacer tú solo, por turnos, el papel de cada nodo. Empieza por ' + primero + '. En cada turno escribe NODO: y su nombre en su propio renglón, haz lo suyo con lo que recibe, y pasa al siguiente según las aristas y sus condiciones; lo que viaja entre nodos es lo único que el siguiente ve. No inventes nodos ni te saltes aristas. Termina cuando se llegue a FIN o se cumpla lo dicho en «Fin y entrega», y entonces entrega lo que allí se pide.',
  orquestarCoordinador: coordinador =>
    'Vas a hacer tú solo, por turnos, el papel del coordinador y de cada especialista. Empieza por ' + coordinador + ', que reparte según «Cómo se reparte». Cada especialista hace su turno en su propio renglón, empezando por NODO: y su nombre, y devuelve al coordinador, que junta según «Cómo se junta». No inventes especialistas. Termina como dice «Fin y entrega» y entrega lo que allí se pide.',
  /* El rótulo del bloque sintético `como` (grafos y bucles) y la frase
     que se inyecta en NotebookLM con Fuentes vacío. Van aquí para que el
     armado y la sonda los lean del mismo sitio y no de dos copias. */
  comoRotulo: 'Cómo hacerlo en este chat',
  fuentesCuaderno: 'Usa solo las fuentes del cuaderno.',
};

/* Las columnas que se piden a la base, una por una y nunca con `*`: con
   la base vieja, PostgREST rebota la consulta ENTERA por una sola columna
   que falte (42703), y pidiéndolas por nombre se puede quitar la que el
   error nombra y seguir. `creado_at` y `actualizado_at` no se piden:
   son de la base, y en la fusión manda el reloj del aparato. */
const CSG_COLUMNAS = 'id,clase,molde,titulo,maquina,bloques,material,estantes,cuaderno,notas,bitacora,versiones,version,usos,ultima,autor,eliminado,eliminado_at,actualizado';

/* Las llaves del aparato (§9). Todas son del APARATO y ninguna viaja:
   la vista del anaquel, los últimos valores de cada variable, la última
   máquina y el borrador a medio escribir son costumbres de este
   teléfono, como la letra de La Voz Prestada. Solo `piezas` es copia de
   lo que también está en la nube. */
const CSG_CLAVES = {
  piezas:   'faro_consigna_v1',
  anaquel:  'faro_consigna_anaquel_v1',
  vars:     'faro_consigna_vars_v1',
  maquina:  'faro_consigna_maquina_v1',
  borrador: 'faro_consigna_borrador_v1',
  pregunta: 'faro_consigna_pregunta_v1',
};

/* Las variables que se rellenan solas al usar y nunca se preguntan: el
   nombre de la máquina, el título de la pieza y la fecha. Preguntar por
   ellas sería pedir lo que la herramienta ya sabe. */
const CSG_RESERVADAS = ['maquina', 'titulo', 'hoy'];

/* Lo que se escribe donde una pieza no tiene título: en {{titulo}}, en el
   `# ` de un SKILL.md sin name, en el export, en la franja y en la fila
   que sube (el check de la base no admite un título vacío). Uno solo
   para todos, porque la nube lo DEVUELVE: si la fila y el aparato lo
   escribieran de dos maneras, csgDesdeFila no sabría reconocerlo y un
   borrador sin título volvería de la nube titulado «(sin título)», como
   si alguien lo hubiera escrito. */
const CSG_SIN_TITULO = '(sin título)';

/* Las etiquetas que el armado escribe como ESTRUCTURA y el lector lee
   como tal: <material> (lo que va debajo) y las partes de un par de
   ejemplos (<ejemplo>, que el lector también acepta en inglés, y
   <entrada>). Un bloque LIBRE no puede llamarse así: un libre rotulado
   «Material» salía como un segundo <material>…</material> justo encima
   del material de verdad, Claude no tenía forma de saber cuál era cuál,
   y al volver a pegarlo el libre desaparecía fundido en el material. El
   lector no le da estos ids a un libre, y el armado rebautiza los de las
   piezas que ya estaban guardadas así (<material_2>). */
const CSG_ETIQUETAS_ARMADO = ['material', 'ejemplo', 'example', 'entrada'];

/* ══════════════════════════════════════════════════════════════════
   EL ARMADO (§7, con el vocabulario del §2): de los bloques que
   escribió la persona al texto que se copia, en la forma que pide cada
   máquina.
   ──────────────────────────────────────────────────────────────────
   ⚠️ TODO LO DE AQUÍ ES PURO: recibe una pieza y devuelve texto, sin
   DOM, sin localStorage y sin red. No es una manía de orden: es la
   regla 1. La vista previa, 📋 Copiar, ↗ Abrir, 📤 Compartir, el repaso
   que cuenta palabras y la sonda que compara con la especificación
   llaman a la MISMA csgArmar. Si la vista previa armara por su cuenta,
   lo que se ve y lo que se copia podrían separarse un día sin ningún
   error, y eso se descubre leyendo lo que la máquina devolvió, sin
   saber por qué. Por lo mismo este apartado se carga en Node
   (_dev/test-consigna-node.js lo hace) y la única fecha que toca es la
   de {{hoy}}, por csgHoy.

   ⚠️ LOS EJEMPLOS DEL §7 SON LA VERDAD CARÁCTER POR CARÁCTER. Una línea
   en blanco de más entre dos bloques no rompe nada que se vea, y por eso
   mismo la prueba compara contra el texto del propio plan, sacado del
   archivo, y no contra una copia escrita en la prueba, que se quedaría
   vieja el día que alguien corrigiera el plan.

   Lo que el plan no dice y hubo que decidir va escrito donde se decide,
   con su porqué. Los ayudantes internos llevan el prefijo `csgArm` (los
   del lector, `csgLec`): los <script> de index.html comparten un solo
   ámbito, y este archivo se escribió en tres trozos a la vez, así que
   cada uno puso el suyo para no pisar los de los otros.
   ══════════════════════════════════════════════════════════════════ */

/* Las formas que se pueden pedir a mano con `opciones.forma`. Una forma
   que no está aquí se ignora y manda la del molde o la de la máquina:
   un texto armado en una forma inventada no lo entiende nadie. */
const CSG_ARM_FORMAS = ['xml', 'md', 'seguida', 'skill'];

/* Las palabras que Mermaid se come como sintaxis. Un nodo que se llame
   «End» cierra el diagrama y lo demás no se pinta, sin decir por qué. */
const CSG_ARM_MMD_RESERVADAS = ['end', 'graph', 'subgraph', 'style', 'class', 'click', 'flowchart'];

/* ── Letras, claves y fechas ───────────────────────────────────────── */

/* Las tildes se quitan con NFD y no con una tabla escrita a mano: una
   tabla se olvida de la ü, o de una tilde que llegó ya descompuesta en
   un texto pegado, y entonces la clave de «Revisión» deja de ser la de
   «Revision» sin ningún aviso.
   ⚠️ Y el rango de las marcas combinantes va con ESCAPES: en claro son
   caracteres invisibles que cualquier editor se come al copiar el
   archivo, y la comparación dejaría de quitar tildes sin ningún error
   (es la regla de rodClaveEtiqueta). Llegaron escritas en claro en dos
   de los trozos con que se armó este archivo.
   ⚠️ Y es UNA para todo el archivo: el armado, el lector y la nube
   comparan con esta y con csgClave. Los trozos se escribieron a la vez
   y cada uno traía su copia; con tres copias, arreglar una dejaba las
   otras dos comparando distinto sin ningún aviso, y el lector habría
   dado por distinto un nombre que el armado daba por igual. */
function csgSinTildes(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* «Maestría», «maestria» y « MAESTRÍA » son el MISMO estante: si no, el
   anaquel sale con tres montones iguales (La Voz Prestada, regla 32). Es
   la misma clave que rcuClave, escrita aquí para que La Consigna no
   dependa de que Cuadernos haya cargado. */
function csgClave(s) {
  return csgSinTildes(s).toLowerCase().trim().replace(/\s+/g, ' ');
}

/* El `name` que se propone para un SKILL.md: minúsculas, cifras y
   guiones sueltos, 64 como mucho. Un frontmatter con otro `name` no da
   error: la habilidad no carga nunca y nadie sabe por qué, y por eso lo
   que se propone ya cumple. Se corta en un guion y no a mitad de
   palabra: un «corrector-revista-cas» no se reconoce al invocarlo. */
function csgSlug(titulo) {
  let s = csgSinTildes(titulo).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 64) {
    const corte = s.slice(0, 65);
    if (corte.charAt(64) === '-') s = corte.slice(0, 64);
    else {
      const k = corte.lastIndexOf('-', 63);
      s = k > 0 ? corte.slice(0, k) : corte.slice(0, 64);
    }
    s = s.replace(/-+$/, '');
  }
  return s;
}

/* ¿Está ya usado este identificador? `usados` puede ser un Set, una
   lista o un objeto, según lo tenga a mano quien llama. Se pregunta por
   `.has` y no con `instanceof Set`: un Set creado en otro contexto (la
   prueba de Node, otro marco) no es instancia del Set de aquí, y la
   comprobación diría «no» a todo sin ningún error. */
function csgArmTiene(usados, id) {
  if (!usados) return false;
  if (typeof usados.has === 'function') return !!usados.has(id);
  if (Array.isArray(usados)) return usados.indexOf(id) >= 0;
  if (typeof usados === 'object') return Object.prototype.hasOwnProperty.call(usados, id);
  return false;
}

/* El identificador de un BLOQUE LIBRE (§2): su rótulo en minúsculas y
   sin tildes, con `_` en lo que no sea letra ni cifra, único en la
   pieza. Es además su etiqueta XML en Claude (<notas_del_autor>), y por
   eso los `_` seguidos se juntan en uno y los de los bordes se quitan:
   «¿Qué más?» daría <_que_mas_>, y una etiqueta con esa pinta parece un
   error aunque no lo sea. Cuarenta caracteres como mucho, por lo mismo.
   NO apunta el id en `usados`: lo apunta quien lo usa. Una función que
   escribe en la colección que le prestan rompe en silencio a quien le
   prestó un objeto que servía para otra cosa. */
function csgSlugId(rotulo, usados) {
  let base = csgSinTildes(rotulo).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (base.length > 40) base = base.slice(0, 40).replace(/_+$/, '');
  if (!base) base = 'bloque';
  let id = base, n = 2;
  while (csgArmTiene(usados, id)) id = base + '_' + n++;
  return id;
}

/* La fecha LOCAL en AAAA-MM-DD, y no la de toISOString(): a partir de
   las seis de la tarde en Honduras, toISOString ya dice mañana, y un
   {{hoy}} con la fecha de mañana dentro de un prompt se lee como un
   error de la máquina. Sin argumento es hoy; con un instante (ms o
   Date), el de ese instante: así el export escribe las fechas de la
   bitácora con la misma función y no con una segunda que un día diga
   otra cosa. */
function csgHoy(t) {
  const d = (t === undefined || t === null || t === '') ? new Date() : new Date(t);
  if (isNaN(d.getTime())) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* Un número con el punto de los miles, como se escribe en esta casa
   («1.500 palabras», «recorta 1.204 caracteres»). Uno solo para el
   repaso y para la franja de la nube: el mismo número escrito de dos
   maneras en dos sitios de la misma pantalla parece dos números. */
function csgMiles(n) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ── Variables ─────────────────────────────────────────────────────── */

/* Los huecos {{así}} de un texto, cada nombre una vez y en el orden en
   que aparecen: es el orden en que la hoja de Usar los pregunta, y
   preguntarlos en otro orden que el de la lectura obliga a buscar cuál
   es cuál. La expresión es la del §2, literal. Se distinguen mayúsculas
   ({{Tema}} y {{tema}} son dos) porque el repaso AVISA de esa pareja: si
   se juntaran aquí, ese aviso no tendría de qué hablar. Las reservadas
   (maquina, titulo, hoy) salen también; quitarlas es cosa de quien
   pregunta, con CSG_RESERVADAS. Acepta un texto o una lista de textos. */
function csgVariables(texto) {
  const s = Array.isArray(texto) ? texto.join('\n') : String(texto == null ? '' : texto);
  const re = /\{\{\s*([a-záéíóúñ0-9_]+)\s*\}\}/gi;
  const vistos = [];
  let m;
  while ((m = re.exec(s))) if (vistos.indexOf(m[1]) < 0) vistos.push(m[1]);
  return vistos;
}

/* ── Máquinas, moldes y bloques ────────────────────────────────────── */

/* La máquina por su id, o «Otra» si no se conoce. Nunca undefined: una
   pieza guardada con una máquina que un día se quite de la lista tiene
   que seguir armándose, y la forma de «Otra» (md) es la que entiende
   cualquiera. */
function csgMaquina(id) {
  for (let i = 0; i < CSG_MAQUINAS.length; i++) if (CSG_MAQUINAS[i].id === id) return CSG_MAQUINAS[i];
  for (let i = 0; i < CSG_MAQUINAS.length; i++) if (CSG_MAQUINAS[i].id === 'otra') return CSG_MAQUINAS[i];
  return { id: 'otra', nombre: 'Otra', forma: 'md', abrir: '', param: '', donde: '', nota: '' };
}

/* Un molde por su id, preguntando por la llave PROPIA del objeto:
   CSG_MOLDES['toString'] es una función heredada, y una pieza con ese
   molde (una fila tocada a mano) reventaría el armado con un error que
   no dice nada. También acepta el molde ya resuelto. */
function csgArmMolde(id) {
  if (id && typeof id === 'object') return id;
  return (typeof id === 'string' && Object.prototype.hasOwnProperty.call(CSG_MOLDES, id)) ? CSG_MOLDES[id] : null;
}

/* La definición de un bloque DENTRO de un molde (§2, regla 3): el
   vocabulario pisado por lo que ese molde declara, más `ob`. Es lo ÚNICO
   que consultan el compositor, el armado y el repaso: si cada uno
   mezclara por su cuenta, CO-STAR diría «Respuesta» en la pantalla y
   «Formato de salida» en el texto copiado.
   Lleva además `id` y `libre` (el molde no lo tiene: un bloque libre, o
   uno traído de otro molde). Un id que no está en el vocabulario es
   `{ rotulo: id }`, como dice el §2. Las frases salen COPIADAS: quien
   las reordene en una pantalla no puede cambiarlas en todos los moldes
   a la vez sin enterarse. */
function csgBloqueDef(moldeId, bloqueId) {
  const molde = csgArmMolde(moldeId);
  const id = String(bloqueId == null ? '' : bloqueId);
  const base = Object.prototype.hasOwnProperty.call(CSG_BLOQUES, id) ? CSG_BLOQUES[id] : { rotulo: id };
  let entrada = null;
  if (molde && Array.isArray(molde.bloques)) {
    for (let i = 0; i < molde.bloques.length; i++) {
      if (molde.bloques[i].id === id) { entrada = molde.bloques[i]; break; }
    }
  }
  const def = Object.assign({}, base, entrada || {});
  def.id = id;
  def.ob = !!(entrada && entrada.ob);
  def.libre = !entrada;
  if (Array.isArray(def.frases)) def.frases = def.frases.slice();
  return def;
}

/* Los bloques guardados de una pieza, siempre como lista. Una fila que
   llegó con `bloques` en texto (un jsonb leído a mano, una copia vieja)
   se lee igual, y una entrada rota se salta en vez de tumbar el armado
   entero: una pieza que no se puede ni mirar tampoco se puede arreglar. */
function csgArmGuardados(pieza) {
  let bs = pieza && pieza.bloques;
  if (typeof bs === 'string') { try { bs = JSON.parse(bs); } catch (e) { bs = []; } }
  return Array.isArray(bs) ? bs.filter(b => b && typeof b === 'object' && b.id != null && b.id !== '') : [];
}

/* El texto de un bloque en la pieza, o ''. Si un id saliera dos veces
   (una pieza fusionada a medias), manda el primero: es el que se ve
   arriba en el compositor. */
function csgTextoDe(pieza, bloqueId) {
  const bs = csgArmGuardados(pieza);
  const id = String(bloqueId);
  for (let i = 0; i < bs.length; i++) {
    if (String(bs[i].id) === id) return bs[i].t == null ? '' : String(bs[i].t);
  }
  return '';
}

/* Rellena los huecos de un texto al USAR, nunca en la pieza (§2). Las
   reservadas SIEMPRE, y con lo que la herramienta ya sabe: preguntar por
   el nombre de la máquina o por la fecha es pedir lo que ya se tiene.
   Van en minúsculas y exactas, como están en CSG_RESERVADAS: {{Hoy}} es
   una variable como las demás. La hoja de Usar quita las reservadas con
   esa misma lista, y si aquí se rellenaran sin mirar las mayúsculas, la
   hoja preguntaría por un {{Hoy}} cuyo valor luego no se usaría.
   Un valor vacío (o de puros espacios) deja el hueco como estaba: un
   hueco que desaparece sin valor se copia en silencio, que es lo que la
   regla 6 prohíbe, y «Copiar con huecos» funciona justo por esto. */
function csgRellena(t, pieza, maquinaId, valores) {
  const vals = (valores && typeof valores === 'object') ? valores : {};
  return String(t == null ? '' : t).replace(/\{\{\s*([a-záéíóúñ0-9_]+)\s*\}\}/gi, (todo, nombre) => {
    if (nombre === 'maquina') return csgMaquina(maquinaId).nombre;
    if (nombre === 'titulo') return String((pieza && pieza.titulo) || '').replace(/\s+/g, ' ').trim() || CSG_SIN_TITULO;
    if (nombre === 'hoy') return csgHoy();
    if (Object.prototype.hasOwnProperty.call(vals, nombre)) {
      const v = vals[nombre];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
    }
    return todo;
  });
}

/* ── El cuerpo de un bloque ────────────────────────────────────────── */

/* Un renglón que ya lleva viñeta o número: «- », «• », «* », «3. » o
   «3) ». El «* » no lo nombra el §7, y se acepta porque es la viñeta de
   Markdown: una lista pegada de otro chat saldría «- * No inventes
   datos», con dos viñetas, que es lo que la regla «salvo que ya empiece
   por…» existe para impedir. Sin la bandera `g`: así se puede reusar con
   .test sin arrastrar un lastIndex de una llamada a otra. */
const CSG_ARM_VINETA = /^(?:[-•*] |\d+[.)] )/;

function csgArmVineta(l) { return CSG_ARM_VINETA.test(l) ? l : '- ' + l; }
function csgArmSinVineta(l) { return String(l).replace(/^[-•*] /, ''); }
/* El punto final del texto seguido (§7): solo si el renglón no termina ya
   en . ! ? : o …, contando que detrás puede ir la comilla o el paréntesis
   que cierra. «…pídeselo a otro chat.»» ya termina en punto; ponerle otro
   detrás de la comilla da «chat.».», un punto doble que se lee como una
   errata de quien escribió la consigna. */
function csgArmPunto(l) { return /[.!?:…][»"”’')\]]*$/.test(l) ? l : l + '.'; }
function csgArmRenglones(t) {
  return String(t == null ? '' : t).split(/\r\n|\r|\n/).map(l => l.trim()).filter(Boolean);
}

/* Un texto en UN renglón: los saltos, con lo que los rodea, se vuelven un
   espacio. ⚠️ Partiendo y recortando, y no con `replace(/\s*\n\s*\/g, ' ')`:
   esa expresión, en un renglón con una racha larga de espacios y sin
   salto, vuelve atrás desde cada espacio —sesenta mil espacios eran más
   de tres segundos, medidos— y el texto seguido se arma en CADA tecla de
   la vista previa. */
function csgUnRenglon(t) {
  return csgArmRenglones(t).join(' ');
}

/* Un renglón de `ejemplos` es un PAR si lleva « → » o « -> » con aire a
   los lados (§7, paso 4): entrada a la izquierda de la primera flecha y
   salida a la derecha. Sin aire no es par: «a->b» puede ser un dato de
   la persona, y convertirlo en un ejemplo de entrada y salida sería
   decidir por ella. La viñeta de delante no es parte de la entrada.
   ⚠️ ES LA ÚNICA COPIA DE ESTA REGLA: el repaso cuenta los pares con
   esta misma función (csgLecPares). El lector traía la suya y no casaban
   en un caso: «1) → b» salía par aquí y no allí, así que el repaso de Con
   ejemplos contaba un par menos de los que el armado pintaba.
   ⚠️ Y SE BUSCA A MANO, sin `\s+(→|->)\s+`: esa expresión, en un renglón
   con una racha larga de espacios y sin flecha, vuelve atrás desde cada
   espacio: con sesenta mil eran más de cuatro segundos de pantalla
   congelada, medidos, y el repaso corre en cada tecla. La prueba de Node
   lo cronometra. */
function csgArmPar(l) {
  const s = csgArmSinVineta(String(l == null ? '' : l).trim());
  for (let i = 0; i < s.length; i++) {
    const f = s[i] === '→' ? 1 : (s[i] === '-' && s[i + 1] === '>') ? 2 : 0;
    if (!f) continue;
    if (/\s/.test(s[i - 1] || '') && /\s/.test(s[i + f] || '')) {
      const a = s.slice(0, i).trim(), b = s.slice(i + f).trim();
      return (a && b) ? [a, b] : null;
    }
    i += f - 1;
  }
  return null;
}

/* El cuerpo de un bloque en una forma (§7, paso 4). El texto normal va
   tal cual: es de la persona, y reescribirlo sería decidir por ella.
   Solo se tocan las LISTAS, y lo justo para que cada forma diga «esto es
   una lista»:
   · xml y md: un renglón por elemento con «- » delante, salvo que ya
     lleve viñeta o número (los pasos numerados se respetan); en
     `ejemplos`, los pares salen como <ejemplo> en xml y como
     **Entrada:** y **Salida:** en md, y en md separados por una línea en
     blanco, que es lo que hace que la máquina los lea como casos y no
     como una sola lista larga;
   · seguida: sin viñetas (los números se quedan), cada renglón con su
     punto final y todos en un párrafo, porque NotebookLM y los recuadros
     de sistema enseñan el texto crudo y una viñeta ahí es un guion
     suelto; los pares, «a → b.»;
   · skill: como md, pero los `pasos` sin número se numeran (el formato
     de las Agent Skills los lee en orden) y `ejemplos` no se parte en
     pares: en un SKILL.md cada ejemplo es un renglón de la lista, como en
     el ejemplo del §7.
   ⚠️ Y EN SEGUIDA, UN BLOQUE DE TEXTO NORMAL TAMBIÉN VA EN UN PÁRRAFO
   (§7: «un párrafo por bloque»). Salía «tal cual», con sus renglones en
   blanco dentro, y un bloque de dos párrafos se leía como DOS bloques:
   «IDENTIDAD: Eres el corrector.» y, suelto, «Tono: seco y breve.», que
   un Gem o NotebookLM toman por una regla más al nivel de «MISIÓN:», y
   que el lector, al volver a pegarlo, mudaba a un bloque Tono dejando la
   identidad cortada. Se junta con un espacio, como ya hace el plan de un
   bucle: en un recuadro de texto crudo, lo que separa un bloque del
   siguiente es la línea en blanco, y dentro de un bloque no puede haber
   ninguna. */
function csgCuerpo(b, texto, forma) {
  const def = b || {};
  const t = String(texto == null ? '' : texto).replace(/\r\n?/g, '\n').trim();
  if (!def.lista) return forma === 'seguida' ? csgUnRenglon(t) : t;
  const lineas = csgArmRenglones(t);
  const esEjemplos = def.id === 'ejemplos';
  if (forma === 'seguida') {
    return lineas.map(l => {
      const par = esEjemplos ? csgArmPar(l) : null;
      return csgArmPunto(par ? par[0] + ' → ' + par[1] : csgArmSinVineta(l));
    }).join(' ');
  }
  if (forma === 'skill') {
    /* ⚠️ Los pasos se numeran con un CONTADOR, no por su puesto en la
       lista. Por el puesto, «Antes de nada, lee todo.» delante de un «1.
       Marca erratas.» salía «1.» y dejaba dos «1.» seguidos, y una Agent
       Skill lee dos «1.» como un paso repetido. El número que escribió la
       persona se respeta (§7) mientras siga subiendo; si se quedaría igual
       o por detrás del anterior, toma el siguiente, con su punto o su
       paréntesis. */
    if (def.id === 'pasos') {
      let ultimo = 0;
      return lineas.map(l => {
        const m = /^(\d+)([.)]) /.exec(l);
        if (m && Number(m[1]) > ultimo) { ultimo = Number(m[1]); return l; }
        ultimo++;
        return m ? ultimo + m[2] + ' ' + l.slice(m[0].length) : ultimo + '. ' + csgArmSinVineta(l);
      }).join('\n');
    }
    return lineas.map(csgArmVineta).join('\n');
  }
  if (!esEjemplos) return lineas.map(csgArmVineta).join('\n');
  const trozos = [];
  let sueltos = [];
  lineas.forEach(l => {
    const par = csgArmPar(l);
    if (!par) { sueltos.push(csgArmVineta(l)); return; }
    if (sueltos.length) { trozos.push(sueltos.join('\n')); sueltos = []; }
    trozos.push(forma === 'xml'
      ? '<ejemplo>\n<entrada>' + par[0] + '</entrada>\n<salida>' + par[1] + '</salida>\n</ejemplo>'
      : '**Entrada:** ' + par[0] + '\n**Salida:** ' + par[1]);
  });
  if (sueltos.length) trozos.push(sueltos.join('\n'));
  return trozos.join(forma === 'xml' ? '\n' : '\n\n');
}

/* ── Los bloques que se arman ──────────────────────────────────────── */

/* Los bloques ARMABLES de una pieza (§7, pasos 1 y 2), con su texto ya
   rellenado por `rellena`:
   · los del molde en su orden, recortados, y los vacíos se saltan: un
     «## Tono» sin nada debajo es una instrucción vacía que la máquina
     intenta obedecer igual;
   · detrás, los LIBRES (los que el molde no tiene), en el orden en que
     están guardados, con su rótulo GUARDADO, `lista: false` y nunca en la
     mitad de sistema: su rótulo es lo único que se sabe de ellos, y
     adivinarles una forma sería inventar;
   · si el molde ya no existe en el JS, todos son libres: nada se pierde
     por quitar un molde;
   · NotebookLM con Fuentes vacío arma «Usa solo las fuentes del
     cuaderno.»: allí el cuaderno ES la bibliografía, y un Investigación
     sin fuentes le dejaría buscar donde quiera;
   · y los reordenes del molde: primero el de la máquina (Perplexity lee
     antes de dónde puede sacar) y después `ultimo`, que va el último pase
     lo que pase, libres incluidos: el «Ahora tú» de Con ejemplos detrás
     de otro bloque se lee como un ejemplo más. */
function csgArmBloques(pieza, molde, maquinaId, rellena) {
  const guardados = csgArmGuardados(pieza);
  const delMolde = (molde && Array.isArray(molde.bloques)) ? molde.bloques.map(e => e.id) : [];
  let out = [];
  delMolde.forEach(id => {
    let t = csgTextoDe(pieza, id).replace(/\r\n?/g, '\n').trim();
    if (!t && id === 'fuentes' && maquinaId === 'notebooklm') t = CSG_TEXTOS.fuentesCuaderno;
    if (!t) return;
    const def = csgBloqueDef(molde, id);
    out.push({ id, rotulo: String(def.rotulo || id), lista: !!def.lista, sistema: !!def.sistema, t: rellena(t), libre: false });
  });
  const vistos = Object.create(null);
  guardados.forEach(g => {
    const id = String(g.id);
    if (delMolde.indexOf(id) >= 0 || vistos[id]) return;
    vistos[id] = true;
    const t = String(g.t == null ? '' : g.t).replace(/\r\n?/g, '\n').trim();
    if (!t) return;
    const rotulo = String(g.rotulo || '').replace(/\s+/g, ' ').trim() || String(csgBloqueDef(molde, id).rotulo || id);
    out.push({ id, rotulo, lista: false, sistema: false, t: rellena(t), libre: true });
  });
  const r = molde && molde.reordena;
  if (r) {
    const pm = (r.porMaquina && Object.prototype.hasOwnProperty.call(r.porMaquina, maquinaId)) ? r.porMaquina[maquinaId] : null;
    if (Array.isArray(pm)) {
      /* Los nombrados, en su orden; los demás detrás y en el suyo. La
         clave explícita hace el orden estable en cualquier navegador. */
      out = out.map((b, i) => ({ b, k: pm.indexOf(b.id) >= 0 ? pm.indexOf(b.id) : pm.length + i }))
               .sort((x, y) => x.k - y.k).map(x => x.b);
    }
    if (Array.isArray(r.ultimo)) {
      const cola = [];
      r.ultimo.forEach(id => out.forEach(b => { if (b.id === id && !b.libre) cola.push(b); }));
      out = out.filter(b => cola.indexOf(b) < 0).concat(cola);
    }
  }
  return out;
}

/* El material, sin los renglones en blanco del principio ni lo que
   sobra al final: lo pegado casi siempre arrastra un salto de más, y un
   </material> separado del texto por tres renglones vacíos parece que se
   cortó. La sangría del primer renglón se queda: puede ser código. Y el
   material NO se rellena: es el texto de la persona (un informe, una
   plantilla que se está corrigiendo), y un {{nombre}} dentro de él es un
   dato suyo, no un hueco de la consigna. */
function csgArmMaterial(m) {
  return String(m == null ? '' : m).replace(/\r\n?/g, '\n').replace(/^\s*\n/, '').replace(/\s+$/, '');
}

/* ⚠️ EL MATERIAL NO PUEDE TRAER DENTRO SU PROPIA MARCA DE CIERRE. Lo que
   se pega debajo muchas veces es otro prompt —«revisa este prompt»—, y
   si salió de aquí trae su </material> o su «=== Fin del material ===».
   Metido tal cual entre las marcas, el primer cierre de dentro cierra el
   material antes de tiempo: la máquina lee el resto como si fuera parte
   de la consigna, y al volver a pegarlo el lector lo repartía entre la
   Tarea y el Formato. Se neutraliza SOLO esa marca —en xml con &lt;, que
   es como Claude lee un «<» escrito; en las demás con una barra delante
   del renglón— para que el cierre de verdad sea el único. Lo demás del
   material no se toca: es el texto de la persona. El lector deshace las
   dos cosas al leer (csgLecMaterialDesescapa) y el repaso lo dice, así
   que lo que vuelve a entrar es lo que se pegó. `forma` es 'xml' o
   cualquier otra cosa (las marcas «===»). */
function csgMaterialTraeCierre(m, forma) {
  const s = String(m == null ? '' : m);
  return forma === 'xml' ? /<\/material>/i.test(s) : s.split('\n').some(l => CSG_LEC_MAT_FIN.test(l));
}
function csgArmMaterialNeutro(m, forma) {
  const s = String(m == null ? '' : m);
  if (forma === 'xml') return s.replace(/<\/material>/gi, x => '&lt;' + x.slice(1));
  return s.split('\n').map(l => CSG_LEC_MAT_FIN.test(l) ? l.replace(/^(\s*)/, '$1\\') : l).join('\n');
}

/* La etiqueta XML de un bloque es su id. Un id raro (una fila tocada a
   mano) rompería la estructura que Claude lee, así que se rehace como el
   de un bloque libre. */
function csgArmEtiqueta(id) {
  const s = String(id == null ? '' : id);
  return /^[A-Za-z0-9_.-]+$/.test(s) ? s : csgSlugId(s);
}

/* ── Las tres formas de texto ──────────────────────────────────────── */

/* xml, md o seguida (§7, paso 5). Devuelve { principal, sistema,
   encargo }; las dos últimas solo existen en xml.
   · xml: cada bloque en su etiqueta y nada más. NO hay una línea
     «SISTEMA:» ni un «; » que junte reglas: cada bloque tiene una sola
     regla de escritura, la suya, y por eso `sistema` (los bloques con
     `sistema: true`, que es lo que va en las instrucciones de un
     Proyecto) y `encargo` (el resto, material incluido, que va en el
     chat) salen por separado y juntos son exactamente `principal`.
   · md: «## Rótulo» y el cuerpo. Con `sinEncabezados` (Rápido, Libre) el
     primer bloque va pelado y los demás como «Rótulo: cuerpo»: un
     «## Tarea» delante de una sola frase es ruido. El plan lo dice solo
     de md, y solo en md se aplica: en xml la etiqueta no es un
     encabezado sino la estructura que Claude lee.
   · seguida: un párrafo por bloque, «Rótulo: frase»; `rotuloMayus` y
     `cabecera` son del molde (Instrucción de sistema, Receta corta). */
function csgArmForma(bloques, forma, molde, material) {
  if (forma === 'xml') {
    /* Un libre con el nombre de una etiqueta de estructura (una pieza
       guardada antes de que el lector los apartara) sale rebautizado, y
       único entre los de la pieza. */
    const ocupados = new Set(bloques.map(b => csgArmEtiqueta(b.id)).concat(CSG_ETIQUETAS_ARMADO));
    const trozos = bloques.map(b => {
      let tag = csgArmEtiqueta(b.id);
      if (b.libre && CSG_ETIQUETAS_ARMADO.indexOf(tag) >= 0) { tag = csgSlugId(tag, ocupados); ocupados.add(tag); }
      return { sistema: !!b.sistema, txt: '<' + tag + '>\n' + csgCuerpo(b, b.t, 'xml') + '\n</' + tag + '>' };
    });
    if (material) trozos.push({ sistema: false, txt: '<material>\n' + csgArmMaterialNeutro(material, 'xml') + '\n</material>' });
    const une = ls => ls.map(x => x.txt).join('\n\n');
    return { principal: une(trozos), sistema: une(trozos.filter(x => x.sistema)), encargo: une(trozos.filter(x => !x.sistema)) };
  }
  const trozos = [];
  if (forma === 'seguida') {
    if (molde && molde.cabecera) trozos.push(molde.cabecera);
    const mayus = !!(molde && molde.rotuloMayus);
    bloques.forEach(b => trozos.push((mayus ? b.rotulo.toUpperCase() : b.rotulo) + ': ' + csgCuerpo(b, b.t, 'seguida')));
  } else {
    const pelado = !!(molde && molde.sinEncabezados);
    bloques.forEach((b, i) => {
      const cuerpo = csgCuerpo(b, b.t, 'md');
      trozos.push(!pelado ? '## ' + b.rotulo + '\n' + cuerpo : (i === 0 ? cuerpo : b.rotulo + ': ' + cuerpo));
    });
  }
  if (material) trozos.push('=== Material ===\n' + csgArmMaterialNeutro(material, 'marcas') + '\n=== Fin del material ===');
  return { principal: trozos.join('\n\n'), sistema: '', encargo: '' };
}

/* El SKILL.md (§7, con el ejemplo como verdad). Secciones fijas y en
   este orden, cada una solo si su bloque tiene texto salvo «Cuándo
   usarla» y «Pasos», que salen siempre: una habilidad sin esas dos no es
   una habilidad, y un hueco a la vista se nota antes que una ausencia.
   Los encabezados son los del formato («Recursos», no el rótulo largo
   del compositor), y los bloques libres van al final con el suyo.
   · `description` SIEMPRE entre comillas dobles, con `\` y `"`
     escapadas y los saltos de renglón como un espacio: es YAML, y una
     comilla o un «: » sin comillas rompen el frontmatter sin ningún
     error; la habilidad sencillamente no carga nunca.
   · `name` pelado: el repaso ya PARA si no cumple su forma.
   · El título «# …» es el `name`; si falta (el repaso ya lo para), el
     título de la pieza, para que la vista previa no enseñe un «# » solo.
   · El material, si lo hay, va al final entre sus marcas, como en md:
     el recurso de ejemplo dice «la lista de reglas de estilo que va
     debajo», y lo que va debajo es justo eso. */
function csgArmSkill(bloques, pieza, material) {
  const de = id => { for (let i = 0; i < bloques.length; i++) if (bloques[i].id === id) return bloques[i]; return null; };
  const nb = de('nombre'), db = de('disparador'), pb = de('pasos');
  const name = nb ? nb.t.replace(/\s+/g, ' ').trim() : '';
  const desc = db ? db.t : '';
  const titulo = name || String((pieza && pieza.titulo) || '').replace(/\s+/g, ' ').trim() || CSG_SIN_TITULO;
  const cab = [
    '---',
    'name: ' + name,
    'description: "' + csgUnRenglon(desc).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"',
    '---',
    '',
    '# ' + titulo,
  ];
  const sec = [
    '## Cuándo usarla' + (desc ? '\n' + desc : ''),
    '## Pasos' + (pb ? '\n' + csgCuerpo(pb, pb.t, 'skill') : ''),
  ];
  [['recursos', 'Recursos'], ['comprobacion', 'Comprobaciones'], ['ejemplos', 'Ejemplos']].forEach(par => {
    const b = de(par[0]);
    if (b) sec.push('## ' + par[1] + '\n' + csgCuerpo(b, b.t, 'skill'));
  });
  const fijos = ['nombre', 'disparador', 'pasos', 'recursos', 'comprobacion', 'ejemplos'];
  bloques.forEach(b => { if (fijos.indexOf(b.id) < 0) sec.push('## ' + b.rotulo + '\n' + csgCuerpo(b, b.t, 'md')); });
  if (material) sec.push('=== Material ===\n' + csgArmMaterialNeutro(material, 'marcas') + '\n=== Fin del material ===');
  return cab.join('\n') + '\n\n' + sec.join('\n\n');
}

/* ── Grafo: nodos, aristas y Mermaid ───────────────────────────────── */

/* El renglón sin su viñeta ni su número de lista: «- Investigador: …»
   y «1. Investigador: …» son el mismo nodo, y el número de la lista no
   puede acabar dentro de su nombre. */
function csgArmSinMarca(l) {
  return String(l).replace(/^(?:[-•*] |\d+[.)] )/, '').trim();
}

/* Los nodos de un bloque (§7): «Nombre: resto» → el nombre es lo que va
   antes de los PRIMEROS dos puntos; sin dos puntos, el renglón entero,
   sin su punto final. `linea` es el renglón entero, que es la etiqueta
   del nodo en el diagrama y su renglón en el plan. */
function csgNodos(texto) {
  const out = [];
  csgArmRenglones(texto).forEach(l => {
    const linea = csgArmSinMarca(l);
    if (!linea) return;
    const k = linea.indexOf(':');
    const nombre = (k >= 0 ? linea.slice(0, k) : linea.replace(/[.;,]+$/, '')).trim();
    if (nombre) out.push({ nombre, linea });
  });
  return out;
}

/* Un texto con su versión «sin tildes, en minúsculas y con un solo
   espacio» y, para cada letra de esa versión, dónde estaba en el
   original. Hace falta para cortar el ORIGINAL justo donde acaba el
   nombre que casó en la versión normalizada: quitar tildes y espacios
   dobles cambia los largos, y cortar el original por el largo de la
   versión normalizada deja la condición con una letra de más o de menos
   sin ningún error. */
function csgArmMapa(s) {
  let n = '';
  const pos = [];
  for (let i = 0; i < s.length;) {
    const ch = String.fromCodePoint(s.codePointAt(i));
    let base = csgSinTildes(ch).toLowerCase();
    if (base && /^\s+$/.test(base)) base = (n.slice(-1) === ' ') ? '' : ' ';
    for (let k = 0; k < base.length; k++) { n += base.charAt(k); pos.push(i); }
    i += ch.length;
  }
  pos.push(s.length);
  return { n, pos };
}

/* La condición de una arista: lo que queda, sin la coma de delante y sin
   el punto final (§7). */
function csgArmCond(s) {
  return String(s || '').trim().replace(/^[,;:]+\s*/, '').replace(/\.$/, '').trim();
}

/* El destino de una arista (§7): el nombre de nodo CONOCIDO más largo que
   case al principio del lado derecho, sin tildes ni mayúsculas, y que
   acabe ahí (una letra pegada detrás no cuenta: «Editora» no es
   «Editor»). FIN siempre es conocido. Si no casa ninguno, el destino son
   las palabras hasta « si », « cuando », « como máximo », «(» o «.», y
   queda DESCONOCIDO: punteado en el diagrama y PARA en el repaso, porque
   una arista a un nodo que no existe es un nodo que la máquina se
   inventa. */
function csgArmDestino(derecha, cands) {
  const s = String(derecha || '').trim();
  const mapa = csgArmMapa(s);
  for (let i = 0; i < cands.length; i++) {
    const k = cands[i].k;
    if (mapa.n.slice(0, k.length) !== k) continue;
    const sig = mapa.n.charAt(k.length);
    if (sig && /[\p{L}\p{N}]/u.test(sig)) continue;
    return { nombre: cands[i].nombre, conocido: true, resto: csgArmCond(s.slice(mapa.pos[k.length])) };
  }
  const m = /\s(?:si|cuando|como m[aá]ximo)(?=[\s,]|$)|\(|\./i.exec(s);
  const corte = m ? m.index : s.length;
  return { nombre: s.slice(0, corte).trim().replace(/[\s,;:.]+$/, ''), conocido: false, resto: csgArmCond(s.slice(corte)) };
}

/* Las aristas de un bloque (§7). Cada renglón se parte por «;» en
   cláusulas; la primera es «Origen → Destino [condición]», y una
   cláusula «si no → C» (o «si no, → C») hereda el origen y lleva la
   condición «si no».
   Dos cosas más, porque la frase hecha trae «;» pero la gente escribe
   como escribe: una «, si no →» o «. Si no →» también parte la cláusula
   (si no, la segunda arista acabaría DENTRO de la condición de la
   primera, con su flecha, y el diagrama la perdería sin avisar), y una
   cláusula sin flecha detrás de una arista se suma a su condición («…
   si hay citas malas; como mucho dos veces»), porque tirarla sería
   perder justo el tope de la vuelta atrás.
   El origen se casa con los nodos por su nombre entero y se escribe
   como en el bloque de nodos.
   ⚠️ `conocido` es el DESTINO, como lo define el §7 («desconocido →
   punteado y PARA»), y así lo lee el repaso. El origen va aparte, en
   `origenConocido` (y `destinoConocido` repite `conocido` para quien lo
   quiera explícito): con los dos juntos en un solo sí o no, una arista
   que sale de un nodo mal escrito y va a uno bueno haría decir al
   repaso «va a «Guionista», que no está en Nodos», que es falso y manda
   a buscar el error donde no está. `linea` es el renglón, para que el
   repaso la nombre. Un renglón sin flecha no es una arista. */
function csgAristas(texto, nombresNodos) {
  const nombres = (Array.isArray(nombresNodos) ? nombresNodos : [])
    .map(n => (n && typeof n === 'object') ? n.nombre : n)
    .filter(n => n != null && String(n).trim() !== '')
    .map(n => String(n).trim());
  const cands = nombres.concat(['FIN'])
    .map(n => ({ nombre: csgClave(n) === 'fin' ? 'FIN' : n, k: csgClave(n) }))
    .filter(c => c.k);
  cands.sort((a, b) => b.k.length - a.k.length);
  const canon = t => {
    const k = csgClave(t);
    for (let i = 0; i < cands.length; i++) if (cands[i].k === k) return cands[i].nombre;
    return null;
  };
  const FLECHA = /\s*(?:-->|->|→)\s*/;
  const out = [];
  csgArmRenglones(texto).forEach(l => {
    const linea = csgArmSinMarca(l);
    if (!FLECHA.test(linea)) return;
    let previa = null;
    linea.split(/;|[,.](?=\s*si no\s*,?\s*(?:-->|->|→))/i).forEach(c => {
      const cl = c.trim();
      if (!cl) return;
      const sino = /^si no\s*,?\s*(?:-->|->|→)\s*/i.exec(cl);
      let origen, derecha, cond0 = '';
      if (sino && previa) {
        origen = previa.origen;
        derecha = cl.slice(sino[0].length);
        cond0 = 'si no';
      } else {
        const m = FLECHA.exec(cl);
        if (!m) {
          if (previa) {
            const extra = cl.replace(/\.$/, '').trim();
            if (extra) previa.cond = previa.cond ? previa.cond + '; ' + extra : extra;
          }
          return;
        }
        origen = cl.slice(0, m.index).trim().replace(/[.,;:]+$/, '').trim();
        derecha = cl.slice(m.index + m[0].length);
      }
      const dest = csgArmDestino(derecha, cands);
      const cond = cond0 ? (dest.resto ? cond0 + ' ' + dest.resto : cond0) : dest.resto;
      const oCanon = canon(origen);
      const a = {
        origen: oCanon || origen, destino: dest.nombre, cond,
        conocido: dest.conocido, origenConocido: !!oCanon, destinoConocido: dest.conocido,
        linea,
      };
      out.push(a);
      previa = a;
    });
  });
  return out;
}

/* El id de un nodo en Mermaid (§7): sin tildes, `_` en lo que no sea
   letra, cifra o `_`, los `_` seguidos en uno, «n» delante si empieza
   por cifra y «_» detrás si es una palabra reservada, y único en el
   diagrama. Un id con espacios o comillas no da error en la pantalla de
   aquí: da un diagrama que no se pinta al pegarlo en otro sitio. Como
   csgSlugId, no apunta nada en `usados`: lo apunta quien lo usa. */
function csgMmdId(nombre, usados) {
  let id = csgSinTildes(nombre).replace(/[^A-Za-z0-9_]/g, '_').replace(/_+/g, '_');
  if (/^_*$/.test(id)) id = 'nodo';
  if (/^[0-9]/.test(id)) id = 'n' + id;
  if (CSG_ARM_MMD_RESERVADAS.indexOf(id.toLowerCase()) >= 0) id += '_';
  let final = id, k = 2;
  while (csgArmTiene(usados, final)) final = id + '_' + k++;
  return final;
}

/* Un texto dentro de una etiqueta de Mermaid (§7): la comilla cerraría
   la etiqueta, la barra cerraría la de una arista, y < > se leen como
   HTML. Los saltos de renglón, un espacio; y el punto final fuera, que
   en un rectángulo sobra. */
function csgMmdTexto(s) {
  return String(s == null ? '' : s)
    .replace(/"/g, '#quot;').replace(/\|/g, '/').replace(/</g, '#lt;').replace(/>/g, '#gt;')
    .replace(/\s*\r?\n\s*/g, ' ').trim().replace(/\.$/, '').trim();
}

/* El nombre del coordinador (§7): lo que va antes de los dos puntos del
   PRIMER renglón del bloque, o «Coordinador». Solo si parece un nombre:
   hasta tres palabras (el mismo tope que el lector pone al nombre de una
   arista, §5 paso 5), cuarenta letras y sin huecos. «No hace ninguna
   tarea: solo reparte y junta» es una frase hecha del propio bloque, y
   sin esta guarda el chat recibiría «Empieza por No hace ninguna tarea». */
function csgArmCoordNombre(t) {
  const linea = csgArmSinMarca(csgArmRenglones(t)[0] || '');
  const k = linea.indexOf(':');
  if (k > 0) {
    const n = linea.slice(0, k).trim();
    if (n && n.length <= 40 && n.indexOf('{{') < 0 && n.split(/\s+/).length <= 3) return n;
  }
  return 'Coordinador';
}

/* El Mermaid y el plan de un grafo (§7). En Cadena, los nodos declarados
   con su renglón, FIN, y una línea por arista (punteada si alguno de sus
   dos extremos no existe). En Coordinador, la estrella: una arista «reparte» de
   ida y una «entrega» de vuelta por especialista, y el coordinador a
   FIN. El id de cada nombre se reparte UNA vez (con csgClave de llave:
   «Editor» y «editor» son el mismo nodo), y FIN está apartado desde el
   principio para que ningún nodo se quede con su id. */
function csgArmGrafo(molde, pieza, rellena) {
  const txt = id => rellena(csgTextoDe(pieza, id).replace(/\r\n?/g, '\n').trim());
  const ids = Object.create(null);
  const usados = Object.create(null);
  usados.FIN = true;
  const idDe = nombre => {
    const k = csgClave(nombre);
    if (k === 'fin') return 'FIN';
    if (!ids[k]) { ids[k] = csgMmdId(nombre, usados); usados[ids[k]] = true; }
    return ids[k];
  };
  const mmd = ['flowchart TD'];
  const nodosL = [], pasosL = [];
  if (molde && molde.orquestar === 'coordinador') {
    const ct = txt('coordinador');
    const cn = csgArmCoordNombre(ct);
    const cid = idDe(cn);
    const linea = ct ? csgUnRenglon(ct) : cn;
    mmd.push('  ' + cid + '["' + csgMmdTexto(linea) + '"]');
    nodosL.push(linea);
    const vistos = Object.create(null);
    vistos[csgClave(cn)] = true;
    vistos.fin = true;
    const esp = csgNodos(txt('nodos')).filter(n => {
      const k = csgClave(n.nombre);
      if (vistos[k]) return false;
      vistos[k] = true;
      return true;
    });
    esp.forEach(n => { mmd.push('  ' + idDe(n.nombre) + '["' + csgMmdTexto(n.linea) + '"]'); nodosL.push(n.linea); });
    mmd.push('  FIN((FIN))');
    esp.forEach(n => {
      const eid = idDe(n.nombre);
      mmd.push('  ' + cid + ' -->|reparte| ' + eid, '  ' + eid + ' -->|entrega| ' + cid);
      pasosL.push('- ' + cn + ' → ' + n.nombre + ' (reparte)', '- ' + n.nombre + ' → ' + cn + ' (entrega)');
    });
    mmd.push('  ' + cid + ' --> FIN');
    pasosL.push('- ' + cn + ' → FIN');
  } else {
    const nodos = csgNodos(txt('nodos'));
    const vistos = Object.create(null);
    vistos.fin = true;
    nodos.forEach(n => {
      nodosL.push(n.linea);
      const k = csgClave(n.nombre);
      if (vistos[k]) return;
      vistos[k] = true;
      mmd.push('  ' + idDe(n.nombre) + '["' + csgMmdTexto(n.linea) + '"]');
    });
    mmd.push('  FIN((FIN))');
    csgAristas(txt('aristas'), nodos.map(n => n.nombre)).forEach(a => {
      pasosL.push('- ' + a.origen + ' → ' + a.destino + (a.cond ? ' ' + a.cond : ''));
      if (!a.origen || !a.destino) return;
      /* Punteada si falla CUALQUIERA de los dos extremos: en el diagrama
         lo que importa es que se vea que esa flecha no se sostiene. */
      mmd.push('  ' + idDe(a.origen) + ' ' + (a.conocido && a.origenConocido ? '-->' : '-.->') +
        (a.cond ? '|' + csgMmdTexto(a.cond) + '|' : '') + ' ' + idDe(a.destino));
    });
  }
  /* El plan (§7): Meta, Nodos numerados, Pasos, y después, cada uno en
     su párrafo y solo con texto, cómo se reparte, cómo se junta, lo que
     viaja y cuándo termina. Nodos y Pasos salen siempre, aunque vacíos:
     son el esqueleto, y un plan sin ellos parece de otra cosa. */
  const plan = [];
  const meta = txt('meta');
  if (meta) plan.push('Meta: ' + meta);
  plan.push('Nodos:' + nodosL.map((l, i) => '\n' + (i + 1) + '. ' + l).join(''));
  plan.push('Pasos:' + pasosL.map(l => '\n' + l).join(''));
  [['reparto', 'Cómo se reparte'], ['juntar', 'Cómo se junta'], ['estado', 'Lo que viaja'], ['fin', 'Termina cuando']].forEach(par => {
    const t = txt(par[0]);
    if (t) plan.push(par[1] + ': ' + t);
  });
  return { mermaid: mmd.join('\n'), plan: plan.join('\n\n') };
}

/* ── Bucle: el tope, el plan y el «cómo» ───────────────────────────── */

/* El {N} del pseudocódigo: cuántas vueltas dice el Tope (§7). «El primer
   entero» tomado al pie de la letra daría 150 en «Tres rondas: apertura,
   réplica y cierre. Cada turno, 150 palabras.», que es el ejemplo del
   propio plan y dice RONDA 1..3: un tope se escribe con palabras tanto
   como con cifras, y el número que cuenta es el que va pegado a lo que
   se cuenta (vueltas, veces, rondas…), no el primero que aparece. Así
   que: primero el número pegado a una de esas palabras; si no hay, el
   primer número del texto, en cifra o en palabra; y si tampoco, «N», que
   en un pseudocódigo se lee como «las que diga el tope» y no finge un
   número que nadie escribió. «Un» y «una» solo cuentan pegados a la
   unidad («una vuelta»): sueltos son un artículo, y «Un máximo de 5
   vueltas» no es 1. */
function csgArmTope(texto) {
  const s = csgSinTildes(texto).toLowerCase();
  const palabras = {
    un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
    diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
    dieciocho: 18, diecinueve: 19, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50, cien: 100,
  };
  const num = w => /^\d+$/.test(w) ? String(parseInt(w, 10)) : String(palabras[w]);
  const todas = Object.keys(palabras).join('|');
  const sinUn = Object.keys(palabras).filter(w => palabras[w] > 1).join('|');
  const unidad = '(?:vueltas?|veces|vez|rondas?|intentos?|iteracion(?:es)?|pasadas?|ciclos?|iterations?|rounds?|attempts?|loops?|times)';
  let m = new RegExp('(?:^|[^a-z0-9ñ])(\\d+|' + todas + ')\\s+' + unidad + '(?![a-z0-9ñ])').exec(s);
  if (m) return num(m[1]);
  m = new RegExp('(?:^|[^a-z0-9ñ])(\\d+|' + sinUn + ')(?![a-z0-9ñ])').exec(s);
  if (m) return num(m[1]);
  return 'N';
}

/* El bloque sintético «como» (§7): lo que convierte un grafo o un bucle
   en algo que UN chat puede hacer solo. En los grafos, el texto de
   orquestar con el primer nodo (Cadena) o el coordinador (Coordinador);
   en los bucles, el `auto` del molde y, en md y solo en md, el
   pseudocódigo en un bloque de código: en xml o en texto seguido un
   bloque de código es ruido que la máquina copia tal cual. */
function csgArmComo(clase, molde, forma, pieza, rellena) {
  if (!molde) return null;
  let t = '';
  if (clase === 'grafo' && molde.orquestar) {
    if (molde.orquestar === 'coordinador') {
      t = CSG_TEXTOS.orquestarCoordinador(csgArmCoordNombre(rellena(csgTextoDe(pieza, 'coordinador'))));
    } else {
      const ns = csgNodos(rellena(csgTextoDe(pieza, 'nodos')));
      t = CSG_TEXTOS.orquestarCadena(ns.length ? ns[0].nombre : 'el primer nodo');
    }
  } else if (clase === 'bucle' && molde.auto) {
    t = molde.auto;
    if (forma === 'md' && molde.pseudo) {
      t += '\n\n```\n' + molde.pseudo.split('{N}').join(csgArmTope(rellena(csgTextoDe(pieza, 'tope')))) + '\n```';
    }
  }
  return t ? { id: 'como', rotulo: CSG_TEXTOS.comoRotulo, lista: false, sistema: false, t, libre: false, sintetico: true } : null;
}

/* El plan de un bucle (§7): un renglón numerado por bloque con texto, en
   el orden del MOLDE (no el de la máquina: el plan se lee, no se pega),
   las listas unidas por « / » y los párrafos en un renglón, para que la
   numeración no se rompa; y al final el `cierre` del molde.
   ⚠️ Y DETRÁS DE LOS DEL MOLDE, LOS LIBRES, en su orden y antes del
   cierre. Recorriendo solo los ids del molde, una «Restricción de estilo:
   Sin adverbios.» escrita como bloque libre estaba en el auto-bucle y no
   en el plan: quien corre el bucle a mano leyendo el plan perdía una
   condición que sí escribió, sin ningún aviso. */
function csgArmPlanBucle(molde, bloques) {
  const orden = (molde && Array.isArray(molde.bloques)) ? molde.bloques.map(e => e.id) : bloques.map(b => b.id);
  const ls = [];
  const puestos = new Set();
  const pon = b => {
    puestos.add(b);
    const texto = b.lista ? csgArmRenglones(b.t).map(csgArmSinVineta).join(' / ') : csgUnRenglon(b.t);
    ls.push((ls.length + 1) + '. ' + b.rotulo + ': ' + texto);
  };
  orden.forEach(id => {
    for (let i = 0; i < bloques.length; i++) {
      if (bloques[i].id === id && !bloques[i].sintetico && !puestos.has(bloques[i])) { pon(bloques[i]); break; }
    }
  });
  bloques.forEach(b => { if (b.libre && !b.sintetico && !puestos.has(b)) pon(b); });
  if (molde && molde.cierre) ls.push(molde.cierre);
  return ls.join('\n');
}

/* ══════════════════════════════════════════════════════════════════
   csgArmar(pieza, maquinaId, valores, opciones) → { forma, principal,
   sistema, encargo, skill, mermaid, plan }, todo cadenas ('' si no
   aplica). FUNCIÓN PURA (regla 2): la pieza son bloques y la forma es de
   la máquina; nunca se guarda un texto armado.
   · `valores`: { nombre: valor } de las variables; las reservadas se
     rellenan solas y no se pueden pisar.
   · `opciones.material`: pisa el material de la pieza (la hoja de Usar
     deja cambiarlo sin guardarlo, y lo que no cabía en la pieza vive ahí).
   · `opciones.forma`: fuerza 'xml' | 'md' | 'seguida' | 'skill'. Sin él,
     manda la del molde (SKILL.md, Instrucción de sistema, Receta corta) y
     si no la de la máquina.
   · `principal` es SIEMPRE lo que copia 📋 Copiar. `sistema` y `encargo`
     solo existen en xml (lo que va en las instrucciones de un Proyecto y
     lo que va en el chat; juntos son `principal`). En un SKILL.md,
     `principal` y `skill` son el archivo, y `sistema` son los mismos
     bloques en forma seguida («📋 Copiar como instrucción de sistema»).
     Los grafos llevan `mermaid` y `plan`; los bucles, `plan`.
   ══════════════════════════════════════════════════════════════════ */
function csgArmar(pieza, maquinaId, valores, opciones) {
  const p = (pieza && typeof pieza === 'object') ? pieza : {};
  const op = (opciones && typeof opciones === 'object') ? opciones : {};
  const mid = maquinaId || p.maquina || '';
  const molde = csgArmMolde(p.molde);
  const clase = (molde && molde.clase) || p.clase || 'prompt';
  const forma = CSG_ARM_FORMAS.indexOf(op.forma) >= 0 ? op.forma : ((molde && molde.forma) || csgMaquina(mid).forma || 'md');
  const rellena = t => csgRellena(t, p, mid, valores);
  const material = csgArmMaterial(op.material !== undefined && op.material !== null ? op.material : p.material);
  const bloques = csgArmBloques(p, molde, mid, rellena);
  /* Un texto que salió de aquí y volvió a entrar por «Pegar» trae su
     «Cómo hacerlo en este chat» como bloque LIBRE. Añadir encima el
     sintético daría dos seguidos, y la máquina obedecería los dos. Manda
     el de la persona, que puede haberlo retocado: tirarlo sería descartar
     texto suyo en silencio. */
  const traeComo = bloques.some(b => b.libre && (b.id === 'como' || csgClave(b.rotulo) === csgClave(CSG_TEXTOS.comoRotulo)));
  const como = traeComo ? null : csgArmComo(clase, molde, forma, p, rellena);
  const todos = como ? bloques.concat([como]) : bloques;
  const out = { forma, principal: '', sistema: '', encargo: '', skill: '', mermaid: '', plan: '' };
  if (forma === 'skill') {
    out.skill = out.principal = csgArmSkill(todos, p, material);
    out.sistema = csgArmForma(todos, 'seguida', molde, material).principal;
  } else {
    const r = csgArmForma(todos, forma, molde, material);
    out.principal = r.principal;
    out.sistema = r.sistema;
    out.encargo = r.encargo;
  }
  if (clase === 'grafo') {
    const g = csgArmGrafo(molde, p, rellena);
    out.mermaid = g.mermaid;
    out.plan = g.plan;
  } else if (clase === 'bucle') {
    out.plan = csgArmPlanBucle(molde, bloques);
  }
  return out;
}

/* La consigna en md SIN RELLENAR NADA, sin material y sin el bloque
   sintético «como»: los bloques tal como los escribió la persona, en una
   forma que se puede leer y comparar. Lo usan el export (un respaldo que
   rellenara las reservadas, al volver por «Pegar», traería la pieza
   cambiada) y quien decide si al guardar nace una versión (§5, paso 5:
   «si el texto armado en md cambió»): se compara el de antes con el de
   después.
   ⚠️ Para eso NO sirve csgArmar(p, '', {}, { forma: 'md' }): rellena
   {{hoy}}, que cambia cada día, {{maquina}} y {{titulo}}, y lleva el
   material. Comparando con ella, guardar al día siguiente, cambiar de
   máquina, retocar el título o pegar otro material harían nacer una
   versión sin que los bloques —que son lo único que una versión guarda—
   hubieran cambiado, y la lista de versiones se llenaría de copias
   iguales. */
function csgMdCrudo(pieza) {
  const p = (pieza && typeof pieza === 'object') ? pieza : {};
  const molde = csgArmMolde(p.molde);
  return csgArmForma(csgArmBloques(p, molde, '', t => t), 'md', molde, '').principal;
}

/* ══════════════════════════════════════════════════════════════════
   📋 EL EXPORT DEL INVENTARIO (§7, al final): texto para un chat o un
   respaldo, no un formato que se importe (lo que se quiera traer entra
   por «Pegar», pieza a pieza). Las vivas, agrupadas por su PRIMER
   estante y con «también en: …» si están en más; «Sin estante» al
   final; cada pieza en forma md, sin material, con sus variables y su
   bitácora. Lo que no es contenido no sale: ni lápidas, ni material (la
   pieza es la consigna, no el informe), ni el bloque sintético «como».
   ⚠️ Y SIN RELLENAR NADA, tampoco las reservadas: un respaldo que
   escribiera «Máquina: Claude» donde la pieza dice {{maquina}}, al
   volver a entrar por «Pegar», traería la pieza cambiada sin que nadie
   la tocara. `hoy` se puede pasar (la prueba lo hace); si no, es hoy.
   ══════════════════════════════════════════════════════════════════ */

/* Los estantes de una pieza, sin vacíos y sin repetir la misma clave, en
   el orden en que están: el primero es el que decide el grupo. Con
   `rotulos` (clave → cómo se escribe), cada uno sale con el rótulo de la
   casa y no con el de esta pieza: «zeta» en una y «Zeta» en otra son el
   mismo estante, y el respaldo no puede nombrarlo de dos maneras. */
function csgArmEstantes(p, rotulos) {
  const out = [], vistos = Object.create(null);
  (Array.isArray(p && p.estantes) ? p.estantes : []).forEach(e => {
    const t = String(e == null ? '' : e).replace(/\s+/g, ' ').trim();
    const k = csgClave(t);
    if (!k || vistos[k]) return;
    vistos[k] = true;
    out.push((rotulos && rotulos[k]) || t);
  });
  return out;
}

/* El nombre de una máquina guardada, o su id tal cual si ya no está en
   la lista: en un respaldo, «Otra» en vez del nombre de verdad es un
   dato perdido. */
function csgArmNombreMaquina(id) {
  for (let i = 0; i < CSG_MAQUINAS.length; i++) if (CSG_MAQUINAS[i].id === id) return CSG_MAQUINAS[i].nombre;
  return String(id == null ? '' : id);
}

/* La ficha de una pieza en el export: la línea corrida, las variables,
   los bloques en md y la bitácora, del uso más nuevo al más viejo. */
function csgArmFichaExport(p, rotulos) {
  const out = [];
  let clase = null;
  for (let i = 0; i < CSG_CLASES.length; i++) if (CSG_CLASES[i].id === p.clase) clase = CSG_CLASES[i];
  const molde = csgArmMolde(p.molde);
  const est = csgArmEstantes(p, rotulos);
  const bit = (Array.isArray(p.bitacora) ? p.bitacora : []).filter(u => u && typeof u === 'object');
  const si = bit.filter(u => u.ok === 'si').length, no = bit.filter(u => u.ok === 'no').length;
  const usos = Math.max(0, parseInt(p.usos, 10) || 0);
  const partes = [
    CSG_EMOJI + ' ' + (String(p.titulo || '').replace(/\s+/g, ' ').trim() || CSG_SIN_TITULO),
    clase ? clase.ic + ' ' + clase.nombre : String(p.clase || ''),
    molde ? molde.nombre : String(p.molde || ''),
    p.maquina ? csgArmNombreMaquina(p.maquina) : '',
    'v' + (parseInt(p.version, 10) || 1),
    usos === 0 ? 'sin usar' : (usos === 1 ? 'usada 1 vez' : 'usada ' + usos + ' veces'),
  ];
  /* 👍 y 👎 van juntos y solo cuando hay alguno de los dos: «👍 0 · 👎 0»
     en una pieza sin probar, o que solo se contestó con 〰, se lee como
     una pieza que no gustó. Los 〰 se ven en la bitácora, debajo. */
  if (si || no) partes.push('👍 ' + si, '👎 ' + no);
  if (p.ultima) partes.push('última ' + csgHoy(p.ultima));
  if (est.length > 1) partes.push('también en: ' + est.slice(1).join(', '));
  out.push(partes.filter(Boolean).join(' · '));
  const vars = csgVariables(csgArmGuardados(p).map(b => b.t == null ? '' : String(b.t)))
    .filter(v => CSG_RESERVADAS.indexOf(v) < 0);
  if (vars.length) out.push('Variables: ' + vars.map(v => '{{' + v + '}}').join(' · '));
  const cuerpo = csgMdCrudo(p);
  if (cuerpo) out.push(cuerpo);
  if (bit.length) {
    out.push('— Bitácora —');
    bit.slice().sort((a, b) => (Number(b.t) || 0) - (Number(a.t) || 0)).forEach(u => {
      const ok = u.ok === 'si' ? '✅' : u.ok === 'regular' ? '〰' : u.ok === 'no' ? '❌' : '⏳ sin contestar';
      const nota = String(u.nota == null ? '' : u.nota).replace(/\s+/g, ' ').trim();
      out.push([
        u.t ? csgHoy(u.t) : '',
        u.maquina ? csgArmNombreMaquina(u.maquina) : '',
        'v' + (parseInt(u.v, 10) || 1),
        ok,
        nota ? '«' + nota + '»' : '',
      ].filter(Boolean).join(' · '));
    });
  }
  return out;
}

/* Por título y, a igualdad, por id: un respaldo que sale cada vez en otro
   orden no se puede comparar con el de la semana pasada. */
function csgArmPorTitulo(ls) {
  return ls.slice().sort((a, b) => {
    const c = csgClave(a.titulo).localeCompare(csgClave(b.titulo), 'es');
    return c || String(a.id || '').localeCompare(String(b.id || ''));
  });
}

function csgExportarTexto(lista, hoy) {
  const vivas = (Array.isArray(lista) ? lista : []).filter(p => p && typeof p === 'object' && !p.eliminado);
  const n = vivas.length;
  const lineas = ['F.A.R.O · La Consigna · ' + (hoy || csgHoy()) + ' · ' + n + (n === 1 ? ' pieza' : ' piezas')];
  /* El rótulo de cada estante es como se escribió la PRIMERA vez que
     aparece, en cualquier pieza y en cualquier puesto: lo mismo que hace
     rcuEstantesTodos en Cuadernos, para que el respaldo y el anaquel
     nombren igual el mismo montón. */
  const rotulos = Object.create(null);
  vivas.forEach(p => csgArmEstantes(p).forEach(e => { const k = csgClave(e); if (!rotulos[k]) rotulos[k] = e; }));
  const grupos = Object.create(null);
  const claves = [];
  const sin = [];
  vivas.forEach(p => {
    const est = csgArmEstantes(p, rotulos);
    if (!est.length) { sin.push(p); return; }
    const k = csgClave(est[0]);
    if (!grupos[k]) { grupos[k] = { rotulo: est[0], piezas: [] }; claves.push(k); }
    grupos[k].piezas.push(p);
  });
  const orden = claves.sort((a, b) => a.localeCompare(b, 'es')).map(k => ({ cab: '── Estante: ' + grupos[k].rotulo + ' ──', piezas: grupos[k].piezas }));
  if (sin.length) orden.push({ cab: '── Sin estante ──', piezas: sin });
  orden.forEach((g, gi) => {
    if (gi > 0) lineas.push('');
    lineas.push(g.cab);
    csgArmPorTitulo(g.piezas).forEach((p, pi) => {
      if (pi > 0) lineas.push('');
      csgArmFichaExport(p, rotulos).forEach(l => lineas.push(l));
    });
  });
  return lineas.join('\n') + '\n';
}

/* ══════════════════════════════════════════════════════════════════
   EL LECTOR DE LO PEGADO (§5, paso 1-bis) Y EL REPASO (§5, paso 3).
   ──────────────────────────────────────────────────────────────────
   Usa del armado csgBloqueDef, csgTextoDe, csgArmar, csgArmPar,
   csgVariables, csgSlugId, csgSlug, csgSinTildes, csgClave, csgMiles,
   csgMaquina, csgNodos y csgAristas; y de la nube, csgVivas (para avisar
   de un título repetido) y csgSobraBloques con csgTextoRecorta (para
   decir lo que no cabe con el mismo número que la franja). Donde hay que
   decidir lo mismo que el armado —si un renglón es un par, cómo se llama
   un nodo, qué es «la misma palabra»— se le PREGUNTA al armado y no se
   lleva una copia de su regla: con dos copias, el repaso diría «un par»
   donde el armado pinta dos, sin ningún error. A nivel de archivo no
   toca el DOM ni ninguna API del navegador: tiene que cargarse en Node.
   Sus ayudantes internos llevan el prefijo `csgLec` y sus constantes
   `CSG_LEC_`: los <script> de index.html comparten un solo ámbito, y un
   ayudante con el nombre de otro lo pisaría sin ningún aviso (es lo que
   dejó muerto dos semanas el corrector de la revista).

   ⚠️ LA ASIMETRÍA MANDA SOBRE CADA EXPRESIÓN REGULAR DEL LECTOR, y
   va escrita antes de tocar ninguna (es la regla 3 de La Voz Prestada):

     equivocarse hacia «esto es prosa» cuesta un renglón que se coloca
     a mano; equivocarse hacia «esto es un rótulo» PARTE el texto, y
     parece que funcionó.

   Lo primero se ve y se arregla con un toque. Lo segundo reparte la
   consigna de alguien en bloques que no eran, y el compositor lo enseña
   todo bien ordenado, con su punto de color: nadie sospecha nada hasta
   que la máquina contesta otra cosa. Por eso aquí solo asciende a
   rótulo lo CORROBORADO —una almohadilla, una negrita sola, unos dos
   puntos detrás de una palabra conocida, un rótulo conocido en
   mayúsculas, una etiqueta XML cerrada— y, ante la duda, prosa.

   ⚠️ Y NADA SE DESCARTA. Lo que no se entiende se queda donde estaba
   (en Tarea, o en Texto si no se entendió nada) y se NOMBRA con su
   renglón. Para poder comprobarlo sin fiarse de nadie, csgLeer devuelve,
   además de lo que usa la pantalla, dos listas que solo sirven para
   cuadrar las cuentas:

   · `estructura`: lo que se leyó como FORMA y no como contenido —los
     rótulos («## Tarea», «Contexto:»), las llaves del frontmatter
     («name», «description»), las marcas del material y la copia de la
     description que el propio SKILL.md repite bajo «Cuándo usarla»—.
     No se pierde: se convierte en el id del bloque o en su columna.
   · `anadido`: lo que el lector PUSO sin que estuviera escrito, que es
     una sola cosa: los nombres de nodo que saca de las aristas.

   Con ellas la cuenta sale exacta en todos los casos:
     palabras(entrada) = palabras(título + bloques + material)
                         + palabras(estructura) − palabras(anadido)
   y la sonda puede exigirla sin saber qué había pegado nadie.
   ══════════════════════════════════════════════════════════════════ */

/* ── Comparar sin tildes ni mayúsculas ─────────────────────────────
   Con csgSinTildes y csgClave, las del armado: «la misma palabra» se
   define en UN sitio del archivo. Si el lector comparara con una copia,
   el día que una de las dos cambiara, el lector daría por distinto un
   rótulo o un nodo que el armado y el repaso dan por igual. */

/* Quita de los bordes lo que diga `quita(c)`, con un bucle y no con una
   expresión anclada al final (`[\s*_:]+$`). ⚠️ Esa forma es cuadrática:
   en un renglón con una racha larga de espacios en medio, el motor la
   prueba desde cada espacio hasta la racha entera y vuelve. Con sesenta
   mil espacios eran doce segundos de pantalla congelada, medidos en la
   prueba de Node, y lo pegado puede ser cualquier cosa. Por lo mismo, en
   el lector el final de un renglón se recorta con trimEnd(), nunca
   con `\s+$`. */
function csgLecRecorta(s, quita) {
  let a = 0, b = s.length;
  while (a < b && quita(s[a])) a++;
  while (b > a && quita(s[b - 1])) b--;
  return s.slice(a, b);
}

/* La clave con que se busca un rótulo en CSG_SINONIMOS.

   ⚠️ UNA CLAVE ES SOLO LETRAS Y ESPACIOS, y eso es lo que salva a los
   encabezados que no son rótulos. «## Paso 1: leer» o «### Ejemplo 2»
   también llevan una palabra conocida; si al comparar se les quitara el
   dígito quedarían en «paso» y «ejemplo», y el lector partiría la
   consigna en ese renglón. Por eso esto devuelve vacío en cuanto ve un
   dígito, un corchete, una llave, un paréntesis, una almohadilla o una
   flecha: es la trampa que ya se pagó en el lector de El Rodaje
   (rodClaveEtiqueta) y en el de La Voz Prestada (vozClaveEtiqueta).
   Los asteriscos, los guiones bajos y los dos puntos de los bordes sí se
   quitan: «**Tarea:**» es como una máquina escribe «Tarea».
   ⚠️ Y TAMBIÉN, SOLO POR LA IZQUIERDA, LOS ADORNOS CON QUE LOS CHATS
   ROTULAN: los pictogramas («## 🎭 Rol», «🎯 Objetivo:») y un número de
   sección («### 1. Rol», «**2. Tarea:**»). Sin quitarlos, el prompt
   típico de ChatGPT entraba entero como bloques libres del molde Libre,
   y un CO-STAR con sus emojis se proponía como Libre sin decir por qué.
   Solo por la izquierda, que es donde los pone un rótulo: «Paso 1»
   sigue siendo vacío, porque su cifra no va delante. */
const CSG_LEC_PICTOS_IZQ = /^(?:[\p{Extended_Pictographic}\uFE0F\u200D\u20E3]|\d\uFE0F?\u20E3|\s)+/u;

function csgClaveEtiqueta(s) {
  const quita = c => c === '*' || c === '_' || c === ':' || /\s/.test(c);
  let t = csgLecRecorta(String(s == null ? '' : s), quita);
  t = csgLecRecorta(t.replace(CSG_LEC_PICTOS_IZQ, '').replace(/^\d{1,2}[.)]\s+/, ''), quita);
  if (!t) return '';
  if (/[0-9[\]{}()#→]/.test(t)) return '';
  return csgClave(t);
}

/* Los rótulos del vocabulario de cuatro palabras o más, o con una coma
   («Lo que se guarda entre vueltas», «Nodos, uno por renglón»). Son los
   que el armado escribe en texto seguido, y la forma (c) del lector no
   los admitía —tope de tres palabras, y sin comas—: lo que la propia
   herramienta armó para NotebookLM, pegado otra vez, se quedaba pegado
   al bloque de antes sin que nadie lo nombrara. Ascienden solo si la
   clave casa ENTERA con una de estas: nadie escribe «Qué sale al final:»
   seguido de dos puntos en mitad de una frase. Salen de CSG_SINONIMOS,
   no de una lista escrita aquí. */
const CSG_LEC_ROTULOS_LARGOS = new Set(Object.keys(CSG_SINONIMOS).filter(k => k.split(' ').length >= 4 || k.indexOf(',') >= 0));

/* El id al que va una clave: el de CSG_SINONIMOS, o el propio id del
   vocabulario si alguien escribe «## postura_a» (así se llaman las
   etiquetas XML que arma esta misma herramienta). */
function csgLecIdDeClave(clave) {
  if (!clave) return '';
  if (Object.prototype.hasOwnProperty.call(CSG_SINONIMOS, clave)) return CSG_SINONIMOS[clave];
  if (Object.prototype.hasOwnProperty.call(CSG_BLOQUES, clave)) return clave;
  return '';
}

/* ── Contar palabras ────────────────────────────────────────────────
   Una palabra es un trozo entre espacios con al menos una letra o una
   cifra: «→», «-», «##», «===» o «---» no son palabras, y así una
   flecha, una viñeta o una marca no descuadran la cuenta. Las etiquetas
   XML se quitan antes de contar porque son forma, no texto: con ellas,
   «<tarea>Resume» sería una palabra en la entrada y dos al separarlas,
   y «≈ 320 palabras» diría otra cosa según la máquina elegida. */
const CSG_LEC_ETIQUETA_XML = /<\/?[A-Za-z_][\w.:-]*(?:\s[^<>]*)?\/?>/g;

function csgPalabras(texto) {
  const limpio = String(texto == null ? '' : texto).replace(CSG_LEC_ETIQUETA_XML, ' ');
  let n = 0;
  for (const trozo of limpio.split(/\s+/)) if (/[\p{L}\p{N}]/u.test(trozo)) n++;
  return n;
}

/* ── Encabezados «## Rótulo» ───────────────────────────────────────
   Devuelve {nivel, etiqueta} o null. La etiqueta sale sin las
   almohadillas de cierre («## Tarea ##») —solo si van separadas: «C#» es
   un nombre— y sin los dos puntos del final. Se recorta a mano y no con
   una expresión como `(.+?)\s*#*\s*$`: esa forma, en un renglón largo con
   una racha de espacios en medio, vuelve atrás desde cada espacio, y el
   lector corre sobre textos pegados de cualquier largo. */
function csgLecEncabezado(tt) {
  const m = /^(#{1,6})\s+(\S.*)$/.exec(tt);
  if (!m) return null;
  let e = m[2].trimEnd();
  let j = e.length;
  while (j > 0 && e[j - 1] === '#') j--;
  /* «## ##» es un encabezado vacío: no rotula nada, y se queda como está. */
  if (j === 0) return null;
  if (j < e.length && /\s/.test(e[j - 1])) e = e.slice(0, j).trimEnd();
  if (e.endsWith(':')) e = e.slice(0, -1).trimEnd();
  return e ? { nivel: m[1].length, etiqueta: e } : null;
}

/* ── Aristas ────────────────────────────────────────────────────────
   Una flecha «a → b» es una arista SOLO fuera de un bloque de ejemplos y
   entre nombres cortos (§5, paso 5). «Harari 2014 → (Harari, 2014)» es
   un par de ejemplo, «{{entrada}} → {{salida}}» también, y convertirlos
   en un grafo sería el fallo caro de la asimetría. La viñeta de delante
   se quita antes de mirar: los grafos se escriben casi siempre en lista,
   y la regla del lado izquierdo (sin «-») la dejaría fuera. */
const CSG_LEC_ARISTA = /^([^:→>-]{1,40}?)\s*(→|->)\s*(.+)$/;

function csgLecSinVineta(t) {
  return String(t == null ? '' : t).trim().replace(/^(?:[-*•·]|\d{1,3}[.)])\s+/, '');
}

function csgEsArista(renglon) {
  const t = csgLecSinVineta(renglon);
  if (!t || t.indexOf('{{') >= 0) return false;
  const m = t.match(CSG_LEC_ARISTA);
  if (!m) return false;
  const izq = m[1].trim().replace(/\s+/g, ' ');
  /* 1 a 3 palabras de letras y cifras, sin punto: un nombre de nodo, no
     una frase («El PIB creció 3 %. → …» no pasa). */
  if (!/^[\p{L}\p{N}]+(?: [\p{L}\p{N}]+){0,2}$/u.test(izq)) return false;
  /* El destino empieza por un nombre (o por FIN) y puede seguir con una
     condición; si empieza por un paréntesis o un signo, es la salida de
     un ejemplo. */
  return /^[\p{L}\p{N}]/u.test(m[3].trim());
}

/* Hasta dónde llega el nombre de un destino: las palabras de antes de
   « si », « cuando », « como máximo », «(» o «.» (§7), y además la coma,
   que escrita a mano separa lo mismo que el «si». */
const CSG_LEC_CORTE_DESTINO = /\s+(?:si|cuando|como m[aá]ximo)\s|[(.;,]/i;

/* Los nombres de nodo de un renglón de aristas, en orden: el origen y
   cada destino (el de la primera cláusula y el de cada «si no → C»).
   FIN no es un nodo que haya que escribir: existe siempre. Un destino
   de más de tres palabras no se añade: ahí el lector no sabe dónde
   acaba el nombre, y el repaso lo nombrará como nodo que no existe. */
function csgLecNombresArista(renglon) {
  const t = csgLecSinVineta(renglon);
  const nombres = [];
  let origen = '';
  t.split(';').forEach((clausula, i) => {
    /* La flecha se busca con indexOf y no con `(.*?)\s*(→|->)`: una
       cláusula larga sin flecha haría volver atrás a la expresión desde
       cada espacio. */
    const a1 = clausula.indexOf('→'), a2 = clausula.indexOf('->');
    const k = a1 < 0 ? a2 : (a2 < 0 ? a1 : Math.min(a1, a2));
    if (k < 0) return;
    const m = [null, clausula.slice(0, k), clausula.slice(k + (k === a1 ? 1 : 2)).trim()];
    const izq = csgLecRecorta(m[1], c => c === ',' || c === ':' || /\s/.test(c));
    if (i === 0 || !/^(?:si no|sino|de lo contrario|en otro caso)$/i.test(csgClave(izq))) {
      if (/^[\p{L}\p{N}]+(?: [\p{L}\p{N}]+){0,2}$/u.test(izq)) { origen = izq; nombres.push(izq); }
    }
    const corte = m[2].search(CSG_LEC_CORTE_DESTINO);
    const destino = csgLecRecorta(corte >= 0 ? m[2].slice(0, corte) : m[2], c => ',;:.'.indexOf(c) >= 0 || /\s/.test(c));
    if (destino && /^[\p{L}\p{N}]+(?: [\p{L}\p{N}]+){0,2}$/u.test(destino)) nombres.push(destino);
  });
  return nombres.filter(n => csgClave(n) !== 'fin');
}

/* ── Las dos mitades de un par escrito con rótulos ──────────────────
   Un ejemplo se escribe muchas veces en dos renglones —«Entrada: gato» y
   «Salida: cat», «Input:/Output:», «Pregunta:/Respuesta:»— y así es como
   el armado en Markdown escribe los pares («**Entrada:** …» y
   «**Salida:** …»).
   ⚠️ Y VARIAS DE ESAS PALABRAS SON RÓTULOS CONOCIDOS: «Salida» es el
   bloque de un bucle, «Output» y «Respuesta» son Formato, «Pregunta» y
   «Texto» son bloques de prompt. Dentro de un bloque de Ejemplos, leídas
   como rótulos, cortaban cada par por la mitad y repartían los ejemplos
   en bloques que no eran, que es el fallo caro de la asimetría. Ahí son
   las mitades de un par: se quedan en Ejemplos, y dos seguidas se
   juntan en «a → b». Los demás rótulos («Ahora tú:», «Formato:») siguen
   cerrando el bloque, como siempre. */
const CSG_LEC_MITAD_A = ['entrada', 'input', 'pregunta', 'question', 'texto', 'text'];
const CSG_LEC_MITAD_B = ['salida', 'output', 'respuesta', 'response', 'answer', 'resultado', 'result'];

function csgLecMitad(renglon) {
  const t = String(renglon == null ? '' : renglon).trim();
  const m = t.match(/^\*\*([\p{L} ]{2,20}?)\s*:\s*\*\*\s*(.*)$/u) || t.match(/^\*\*([\p{L} ]{2,20}?)\*\*\s*:\s*(.*)$/u) ||
            t.match(/^([\p{L} ]{2,20}?)\s*:\s*(.*)$/u);
  if (!m) return null;
  const k = csgClave(m[1]);
  const lado = CSG_LEC_MITAD_A.indexOf(k) >= 0 ? 'a' : CSG_LEC_MITAD_B.indexOf(k) >= 0 ? 'b' : '';
  return lado ? { lado, etiqueta: m[1].trim(), resto: m[2].trim() } : null;
}

/* El nombre de un renglón de nodos, como lo lee csgNodos: lo de antes de
   los primeros dos puntos, o el renglón entero sin su punto final (§7).
   Se le pregunta al armado porque es él quien pinta los nodos y el
   repaso quien los busca: con una lectura propia, un nodo escrito
   «Editor.» (sin dos puntos) era «editor.» para el lector y «Editor»
   para los demás, y al pegar sus aristas el lector lo añadía otra vez. */
function csgLecNombreNodo(renglon) {
  const n = csgNodos(renglon);
  return n.length ? n[0].nombre : '';
}

/* ── Topes ──────────────────────────────────────────────────────────
   Un tope es un número de vueltas, escrito en cifra, en letra o con un
   hueco que se rellena al usar («como mucho {{n}} vueltas» es una frase
   hecha del propio Fin). Los patrones del bucle (CSG_PATRONES_BUCLE)
   solo aceptan cifras, que es lo justo para ADIVINAR un bucle en prosa;
   para dar por bueno un tope ya escrito hace falta más manga: «a la
   segunda vuelta» es un tope aunque no lleve una sola cifra. */
const CSG_LEC_TOPE = new RegExp(
  '\\b(?:m[aá]ximo(?: de)?|como mucho|como m[aá]ximo|no m[aá]s de|hasta|a la|a las|tras|despu[eé]s de)\\s+' +
  '(?:\\d+|\\{\\{\\s*[\\wáéíóúñ]+\\s*\\}\\}|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|' +
  'primer[ao]?|segund[ao]|tercer[ao]?|cuart[ao]|quint[ao])\\s*' +
  '(?:vueltas?|veces|intentos?|iteraci[oó]n(?:es)?|rondas?|pasadas?)\\b', 'i');

function csgLecTieneTope(texto) {
  const s = String(texto == null ? '' : texto);
  return CSG_PATRONES_BUCLE.tope.some(re => re.test(s)) || CSG_LEC_TOPE.test(s);
}

/* Qué clases de renglón de bucle toca una línea. Se miran todas; quién
   se queda el renglón lo decide csgLecClaseBucle.
   ⚠️ `pasoDebil`: el paso que solo lo es por empezar con «Vuelve a…».
   El patrón es del §5 y se queda, pero «vuelve a» es también una acción
   de cualquier frase («Vuelve a leerlo con calma y dime qué le falta»), y
   con un «hasta que» suelto en otro renglón de la misma prosa —«no avanzo
   hasta que aclare la metodología»— ya eran dos clases: la consulta sobre
   una tesis se proponía como un Bucle y se repartía por renglones, que
   es el descuartizado que parece funcionar. Un paso débil no cuenta como
   clase para proponer un bucle ni para avisar de que algo se repite;
   dentro de un bucle ya propuesto sigue yendo a «Paso que se repite». */
function csgLecMarcasBucle(t) {
  const s = String(t == null ? '' : t).trim();
  const r = {};
  for (const k of ['parada', 'tope', 'paso', 'memoria', 'lotes']) r[k] = CSG_PATRONES_BUCLE[k].some(re => re.test(s));
  r.pasoDebil = r.paso && /^vuelve a\b/i.test(s);
  return r;
}

/* A qué bloque va un renglón de bucle. Un número de vueltas es lo más
   inequívoco que hay, así que manda; después el criterio: «Repite hasta
   que no queden erratas» empieza como un paso, pero lo que dice es
   cuándo parar, y el paso de verdad es el otro renglón («Escribe…»). */
function csgLecClaseBucle(marcas) {
  if (marcas.tope) return 'tope';
  if (marcas.parada) return 'parada';
  if (marcas.memoria) return 'memoria';
  if (marcas.paso && !marcas.pasoDebil) return 'paso';
  return '';
}

/* «Parece que se repite» (§5, paso 6): los renglones de una Tarea que
   dicen que algo se repite, para AVISAR —el lector y el repaso le
   preguntan a esta misma función, para no avisar de cosas distintas—.
   Devuelve [{i, molde}] con el índice del renglón y el molde de bucle
   que se propone.
   ⚠️ Lo dispara un PASO de bucle (sin el «vuelve a» débil) o un renglón
   de lotes, como dice el §5, y un tope solo si el bloque trae además otra
   clase de bucle. Un «para cada» suelto o un «como mucho 2 veces» suelto
   son frases normales de un prompt («para cada sección, da una frase»,
   «usa como mucho 2 veces la palabra»), y un aviso que sale en casi toda
   pieza deja de leerse. El «para cada» sí vale para ELEGIR el molde: un
   «Repite esto para cada tema» es un Por lotes. */
function csgLecRepite(renglones) {
  const ms = renglones.map(r => String(r == null ? '' : r).trim() ? csgLecMarcasBucle(r) : null);
  const clases = new Set();
  ms.forEach(m => { if (m) { const c = csgLecClaseBucle(m); if (c === 'parada' || c === 'tope' || c === 'paso') clases.add(c); if (m.parada) clases.add('parada'); if (m.tope) clases.add('tope'); } });
  const out = [];
  ms.forEach((m, i) => {
    if (!m) return;
    if (!((m.paso && !m.pasoDebil) || m.lotes || (m.tope && clases.size >= 2))) return;
    out.push({ i, molde: (m.lotes || /\b(?:para|por) cada\b/i.test(renglones[i])) ? 'lotes' : 'hasta' });
  });
  return out;
}

/* Cuántos pares tiene un bloque de ejemplos: los renglones que el armado
   va a pintar como pares, preguntándoselo a él (csgArmPar). Si el repaso
   contara con su propia regla, diría «un par» donde el armado pinta dos,
   y el PARA de Con ejemplos pararía —o dejaría pasar— sin motivo. */
function csgLecPares(texto) {
  return String(texto == null ? '' : texto).split('\n').filter(l => csgArmPar(l)).length;
}

/* ── Levenshtein, para el «¿querías…?» ─────────────────────────────── */
function csgLecDistancia(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/* En qué clases vive cada id del vocabulario (sale de los moldes, no de
   una lista escrita: el día que un molde gane un bloque, esto lo sabe). */
let _csgLecClasesDeId = null;
function csgLecClasesDeId(id) {
  if (!_csgLecClasesDeId) {
    _csgLecClasesDeId = {};
    Object.keys(CSG_MOLDES).forEach(k => {
      const m = CSG_MOLDES[k];
      (m.bloques || []).forEach(b => {
        (_csgLecClasesDeId[b.id] = _csgLecClasesDeId[b.id] || new Set()).add(m.clase);
      });
    });
  }
  return _csgLecClasesDeId[id] || new Set();
}

/* La clave conocida que más se parece a un rótulo que no se entendió,
   a distancia ≤ 2 (§5) y SOLO entre las de la clase propuesta. Sin ese
   filtro, «Notas:» en un prompt proponía «Nodos», que es de los grafos:
   un «¿querías…?» que no tiene sentido enseña a no leer los avisos.
   ⚠️ Y en una palabra corta, dos cambios son media palabra: «notas» está
   a dos de «citas» y de «nodos», y ninguna de las dos es lo que alguien
   quiso escribir. Por eso la distancia, además de ≤ 2, no pasa de un
   tercio del largo: una errata en «ejemplo» (7) o en «contexto» (8) se
   sugiere; «notas» (5) solo se sugeriría a un cambio, y no hay ninguna. */
function csgLecSugerencia(clave, clase) {
  if (!clave || clave.length < 3) return '';
  let mejor = '', dMejor = 3;
  Object.keys(CSG_SINONIMOS).forEach(k => {
    if (clase && !csgLecClasesDeId(CSG_SINONIMOS[k]).has(clase)) return;
    const d = csgLecDistancia(clave, k);
    if (d <= 2 && d * 3 <= clave.length && (d < dMejor || (d === dMejor && k.length < mejor.length))) { mejor = k; dMejor = d; }
  });
  return mejor;
}

/* ── Frontmatter de un SKILL.md ─────────────────────────────────────
   Un valor de YAML puede venir pelado, entre comillas (con sus escapes)
   o en varios renglones (`>` o `|`). La description de una habilidad
   bien escrita pasa muchas veces de un renglón, y leer solo el primero
   perdería la mitad de lo que decide cuándo se dispara. */
function csgLecDesescapaYaml(v) {
  const s = String(v).trim();
  if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
    const mapa = { '"': '"', '\\': '\\', n: '\n', t: '\t', '/': '/' };
    return s.slice(1, -1).replace(/\\(.)/g, (x, c) => Object.prototype.hasOwnProperty.call(mapa, c) ? mapa[c] : x);
  }
  if (s.length >= 2 && s[0] === "'" && s[s.length - 1] === "'") return s.slice(1, -1).replace(/''/g, "'");
  return s;
}

function csgLecLeeFrontmatter(lineas) {
  const campos = [];   // { clave, valor, n, crudas: [los renglones de donde salió] }
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    const m = l.t.match(/^([A-Za-z_][\w-]*)\s*:\s?(.*)$/);
    if (!m) {
      /* Un renglón que no abre campo (sangrado o suelto) se queda con el
         campo de antes, para que no se pierda. */
      if (campos.length) { campos[campos.length - 1].valor += '\n' + l.t; campos[campos.length - 1].crudas.push(l); }
      else campos.push({ clave: '', valor: l.t, n: l.n, crudas: [l] });
      continue;
    }
    const campo = { clave: m[1], valor: m[2], n: l.n, crudas: [l] };
    const v = m[2].trim();
    if (/^[>|][+-]?$/.test(v)) {
      /* `>` junta los renglones con espacios; `|` los deja como vienen. */
      const cuerpo = [];
      while (i + 1 < lineas.length && /^\s+\S|^\s*$/.test(lineas[i + 1].t) && !/^[A-Za-z_][\w-]*\s*:/.test(lineas[i + 1].t)) {
        i++; cuerpo.push(lineas[i].t.trim()); campo.crudas.push(lineas[i]);
      }
      campo.valor = v[0] === '>' ? cuerpo.join(' ').replace(/\s+/g, ' ').trim() : cuerpo.join('\n').trim();
    } else if ((v[0] === '"' || v[0] === "'") && !(v.length >= 2 && v[v.length - 1] === v[0] && v[v.length - 2] !== '\\')) {
      /* Comillas que no se cierran en su renglón: el valor sigue abajo. */
      let acum = v;
      while (i + 1 < lineas.length) {
        i++; acum += ' ' + lineas[i].t.trim(); campo.crudas.push(lineas[i]);
        const r = lineas[i].t.trim();
        if (r.endsWith(v[0]) && !r.endsWith('\\' + v[0])) break;
      }
      campo.valor = csgLecDesescapaYaml(acum);
    } else {
      campo.valor = csgLecDesescapaYaml(v);
    }
    campos.push(campo);
  }
  return campos;
}

/* ══════════════════════════════════════════════════════════════════
   csgLeer(texto): lo pegado, repartido en bloques (§5, pasos 0 a 9).
   Devuelve lo que usa la pantalla —clase, molde, titulo, bloques
   [{id, rotulo, t}], material, variables, avisos [{renglon, texto,
   sugerencia}], propuesta {clase, molde, reconocidos, total}— y las dos
   listas de cuadrar la cuenta (estructura, anadido; ver arriba).
   La clase y el molde son una PROPUESTA: la pantalla la enseña en un
   chip y la persona la cambia de un toque. Nada aquí se impone.
   ══════════════════════════════════════════════════════════════════ */
/* Lo que la mudanza de csgLeer añade a CSG_EQUIVALE, y SOLO ella: en una
   habilidad, la Tarea son los Pasos. «## Instructions» (que es Tarea por
   sus sinónimos) es como las Agent Skills de Anthropic titulan sus pasos,
   y el cuerpo sin encabezados de un SKILL.md es lo mismo. No va en
   CSG_EQUIVALE porque esa lista es la del §2, la que consulta «Duplicar en
   otro molde», y allí una Tarea de un prompt que se gradúa a SKILL.md no
   se convierte sola en sus pasos numerados. */
const CSG_LEC_MUDA = { tarea: ['pasos'] };

const CSG_LEC_MAT_INI = /^\s*={3,}\s*material\s*={3,}\s*$/i;
const CSG_LEC_MAT_FIN = /^\s*={3,}\s*fin del material\s*={3,}\s*$/i;

/* Lo contrario de csgArmMaterialNeutro: el armado escapa la marca de
   cierre que el material traía dentro, y aquí se le devuelve su forma,
   para que lo que vuelve a entrar sea lo que se pegó. Solo en el material
   que venía entre SUS marcas ('etiqueta' o 'marcas'): fuera de ellas,
   una barra o un &lt; son del texto de la persona. */
function csgLecMaterialDesescapa(s, modo) {
  const t = String(s == null ? '' : s);
  if (modo === 'etiqueta') return t.replace(/&lt;(\/material>)/gi, '<$1');
  if (modo === 'marcas') {
    return t.split('\n').map(l => {
      const m = /^(\s*)\\(.*)$/.exec(l);
      return m && CSG_LEC_MAT_FIN.test(m[1] + m[2]) ? m[1] + m[2] : l;
    }).join('\n');
  }
  return t;
}

function csgLeer(texto) {
  /* ── Paso 0: normalizar. Los finales de renglón de Windows, las
     tabulaciones y los espacios duros no se ven, y sin quitarlos un
     «Tarea:» con un espacio duro detrás no casa con nada. La marca BOM
     del principio rompería el `---` del frontmatter. */
  const normal = String(texto == null ? '' : texto)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\u00A0\u202F\u2007]/g, ' ');
  let seq = 0;
  const lineas = normal.split('\n').map((t, i) => ({ n: i + 1, t: t.trimEnd(), seq: seq++ }));

  const estructura = [];
  const anadido = [];
  const avisosCrudos = [];   // se componen al final, cuando ya se sabe dónde quedó cada renglón

  /* Los bloques se van llenando con OBJETOS renglón ({n, t, seq}), no con
     texto: así, cuando un paso posterior mueve un renglón (una arista, un
     tope), el aviso que lo nombra sigue sabiendo en qué bloque acabó. */
  const bloques = new Map();   // llave → { llave, id, rotulo, libre, etiquetado, orden, lineas }
  const bloque = (llave, datos) => {
    let b = bloques.get(llave);
    if (!b) {
      b = Object.assign({ llave, id: '', rotulo: '', libre: false, etiquetado: false, orden: Infinity, lineas: [] }, datos || {});
      bloques.set(llave, b);
    }
    return b;
  };
  const tieneTexto = b => b && b.lineas.some(l => l.t.trim());

  /* ── Paso 1: frontmatter. `---` en el primer renglón con algo, un
     `name:` y el cierre `---`, todo dentro de los 30 primeros renglones:
     es la forma de un SKILL.md y no se escribe por accidente. */
  let i0 = 0;
  while (i0 < lineas.length && !lineas[i0].t.trim()) i0++;
  let frontmatter = false;
  let resto = lineas;
  if (i0 < lineas.length && lineas[i0].t.trim() === '---') {
    let cierre = -1;
    for (let j = i0 + 1; j < Math.min(lineas.length, i0 + 30); j++) {
      if (lineas[j].t.trim() === '---') { cierre = j; break; }
    }
    if (cierre > 0 && lineas.slice(i0 + 1, cierre).some(l => /^name\s*:/i.test(l.t))) {
      frontmatter = true;
      const extras = [];
      csgLecLeeFrontmatter(lineas.slice(i0 + 1, cierre)).forEach(c => {
        const clave = c.clave.toLowerCase();
        if (clave === 'name' || clave === 'description') {
          const id = clave === 'name' ? 'nombre' : 'disparador';
          const b = bloque(id, { id, etiquetado: true, orden: c.crudas[0].seq });
          estructura.push(c.clave);
          String(c.valor).split('\n').forEach((t, k) => b.lineas.push({ n: c.n, t, seq: c.crudas[0].seq + k / 1000, fm: true }));
        } else {
          /* Lo demás del frontmatter (license, allowed-tools…) no tiene
             columna en una consigna. No se tira: va entero, tal cual, a un
             bloque libre, y se dice. */
          const b = bloque('libre:frontmatter', { libre: true, rotulo: 'Frontmatter', orden: c.crudas[0].seq });
          c.crudas.forEach(l => b.lineas.push({ n: l.n, t: l.t, seq: l.seq }));
          if (c.clave) extras.push({ n: c.n, clave: c.clave });
        }
      });
      if (extras.length) avisosCrudos.push({ tipo: 'frontmatter', n: extras[0].n, claves: extras.map(e => e.clave) });
      resto = lineas.slice(cierre + 1);
    }
  }

  /* ── Paso 2: material. Lo que va entre sus marcas no es la consigna:
     es lo que se le pega DEBAJO (el informe, el texto a corregir). Se
     saca antes que nada para que un «Tarea:» dentro del informe no parta
     la consigna. Sin marca de cierre, es material hasta el final: quien
     puso la de apertura dijo «desde aquí».
     ⚠️ Y <material> ES MATERIAL SOLO SI VA SOLO AL PRINCIPIO DE SU
     RENGLÓN, con algo dentro y con su cierre terminando el renglón. Con
     texto de la persona delante o detrás, o vacío, es una palabra de la
     frase: «Resume lo que te pego dentro de <material></material> en tres
     viñetas» salía partido en dos renglones y sin las etiquetas, que ERAN
     la instrucción, y la cuenta de palabras cuadraba igual porque las
     etiquetas no son palabras. Es la asimetría de la regla 8: ante la
     duda, prosa. El cierre se busca con una tabla precalculada (dónde
     está el siguiente </material> desde cada renglón) y no mirando
     adelante desde cada apertura, que con muchas sería cuadrático. */
  const partesMaterial = [];
  const quedan = [];
  {
    const sigCierre = new Array(resto.length + 1).fill(-1);
    for (let i = resto.length - 1; i >= 0; i--) sigCierre[i] = resto[i].t.indexOf('</material>') >= 0 ? i : sigCierre[i + 1];
    let modo = '';
    let acum = [];
    for (let i = 0; i < resto.length; i++) {
      const l = resto[i];
      /* 'etiqueta' solo queda puesto con un <material> que no se cierra
         nunca: de ahí al final, como con las marcas. */
      if (modo === 'todo' || modo === 'etiqueta') { acum.push(l.t); continue; }
      if (modo === 'marcas') {
        if (CSG_LEC_MAT_FIN.test(l.t)) {
          estructura.push(l.t.replace(/=/g, '').trim());
          partesMaterial.push(csgLecMaterialDesescapa(acum.join('\n'), 'marcas'));
          acum = []; modo = '';
        } else acum.push(l.t);
        continue;
      }
      if (CSG_LEC_MAT_INI.test(l.t)) { estructura.push(l.t.replace(/=/g, '').trim()); modo = 'marcas'; continue; }
      if (l.t.trim() === '===') { modo = 'todo'; continue; }
      const k = l.t.indexOf('<material>');
      if (k >= 0 && !l.t.slice(0, k).trim()) {
        const tras = l.t.slice(k + 10);
        const c = tras.indexOf('</material>');
        if (c >= 0) {
          if (tras.slice(0, c).trim() && !tras.slice(c + 11).trim()) {
            partesMaterial.push(csgLecMaterialDesescapa(tras.slice(0, c), 'etiqueta'));
            continue;
          }
        } else {
          const j = sigCierre[i + 1];
          if (j < 0) { acum = [tras]; modo = 'etiqueta'; continue; }
          const cj = resto[j].t.indexOf('</material>');
          const cuerpo = [tras].concat(resto.slice(i + 1, j).map(x => x.t), [resto[j].t.slice(0, cj)]).join('\n');
          if (cuerpo.trim() && !resto[j].t.slice(cj + 11).trim()) {
            partesMaterial.push(csgLecMaterialDesescapa(cuerpo, 'etiqueta'));
            i = j;
            continue;
          }
        }
      }
      quedan.push(l);
    }
    if (modo) partesMaterial.push(csgLecMaterialDesescapa(acum.join('\n'), modo));
  }
  const material = partesMaterial.map(p => p.replace(/^(?:[ ]*\n)+/, '').trimEnd())
    .filter(p => p.trim()).join('\n\n');

  /* ── Paso 3: etiquetas XML. Una etiqueta CERRADA es inequívoca, así que
     lo de dentro va a su bloque sin mirar rótulos: un «Formato: tabla»
     dentro de <tarea> es parte de la tarea. Solo las de primer nivel; lo
     de dentro se queda como texto. Lo de fuera sigue al paso 4.
     ⚠️ CERRADA NO BASTA: TIENE QUE SER UN BLOQUE Y NO UNA PALABRA. En un
     prompt para Claude las etiquetas salen DENTRO de las frases —«Put your
     final answer in <answer></answer> tags»—, y leídas como bloques se
     borraban del texto (la frase quedaba partida en tres renglones sin lo
     que era la instrucción) y encima abrían un bloque vacío que votaba el
     molde. Así que cuenta como bloque solo si la apertura va sola al
     principio de su renglón, si lo de dentro dice algo, y si el cierre
     termina su renglón; lo de delante puede ser el cierre de otro bloque
     de ese mismo renglón, y lo de detrás la apertura del siguiente
     («<rol>…</rol><tarea>…</tarea>», todo en una línea). Lo demás se
     queda como texto, con sus etiquetas: ante la duda, prosa.
     Y una etiqueta puede llevar detrás el «_2» con que csgSlugId hace
     único un bloque libre: es lo que escribe el armado para él (un libre
     «Material» sale como <material_2>, porque <material> es del material),
     y sin leerlo aquí, ese bloque volvía como texto suelto en la Tarea. */
  const S = quedan.map(l => l.t).join('\n');
  const inicios = [];
  { let p = 0; for (const l of quedan) { inicios.push(p); p += l.t.length + 1; } }
  const indiceDe = off => {
    let a = 0, b = inicios.length - 1;
    while (a < b) { const m = (a + b + 1) >> 1; if (inicios[m] <= off) a = m; else b = m - 1; }
    return a;
  };
  const segmentos = [];
  const empujaTexto = (a, b) => {
    if (b <= a || !quedan.length) return;
    for (let k = indiceDe(a); k < quedan.length; k++) {
      const ini = inicios[k], fin = ini + quedan[k].t.length;
      if (ini >= b) break;
      if (fin < a) continue;
      const x = Math.max(a, ini), y = Math.min(b, fin);
      const parte = S.slice(x, y);
      /* El trozo de un renglón que comparte sitio con una etiqueta solo
         cuenta si dice algo: el salto que queda tras «</tarea>» no es un
         renglón en blanco de la persona. */
      if ((x > ini || y < fin) && !parte.trim()) continue;
      segmentos.push({ tipo: 'linea', n: quedan[k].n, t: parte, seq: quedan[k].seq + (x > ini ? 0.25 : 0) });
    }
  };
  {
    const re = /<([a-z_]{2,30}(?:_\d{1,3})?)>/g;
    let hecho = 0, m;
    while ((m = re.exec(S))) {
      const tag = m[1];
      if (tag === 'material') continue;
      const desde = m.index + m[0].length;
      const cierre = S.indexOf('</' + tag + '>', desde);
      if (cierre < 0) continue;   // sin cerrar no es un bloque: se queda como texto
      const tras = cierre + tag.length + 3;
      const iniRenglon = S.lastIndexOf('\n', m.index - 1) + 1;
      let finRenglon = S.indexOf('\n', tras);
      if (finRenglon < 0) finRenglon = S.length;
      const despues = S.slice(tras, finRenglon);
      if (S.slice(Math.max(iniRenglon, hecho), m.index).trim() || !S.slice(desde, cierre).trim() ||
          (despues.trim() && !/^\s*<[a-z_]{2,30}(?:_\d{1,3})?>/.test(despues))) continue;
      empujaTexto(hecho, m.index);
      const k = indiceDe(m.index);
      segmentos.push({ tipo: 'xml', tag, t: S.slice(desde, cierre), n: quedan[k].n, seq: quedan[k].seq + (m.index > inicios[k] ? 0.5 : 0) });
      hecho = cierre + tag.length + 3;
      re.lastIndex = hecho;
    }
    empujaTexto(hecho, S.length);
  }

  /* ── Paso 4: encabezados y rótulos, renglón a renglón. ────────────── */

  /* El nivel de encabezado de los rótulos conocidos manda: un encabezado
     DESCONOCIDO más hondo que ellos es un subtítulo dentro de un bloque
     («## Pasos» y debajo «### Primero»), no un bloque libre nuevo. Es la
     lección de La Voz Prestada con los capítulos y los subtítulos: sin
     esto, los subtítulos de unos Pasos los vaciaban en tres bloques
     libres. Y por lo mismo una negrita sola desconocida, en un texto que
     ya rotula con almohadillas, es un subtítulo. */
  let nivelConocido = Infinity;
  let enCodigoPre = false;
  segmentos.forEach(sg => {
    if (sg.tipo !== 'linea') return;
    const tt = sg.t.trim();
    if (/^(```|~~~)/.test(tt)) { enCodigoPre = !enCodigoPre; return; }
    if (enCodigoPre) return;
    const h = csgLecEncabezado(tt);
    if (h && csgLecIdDeClave(csgClaveEtiqueta(h.etiqueta))) nivelConocido = Math.min(nivelConocido, h.nivel);
  });
  const hayEncabezadoConocido = nivelConocido < Infinity;

  /* ⚠️ LOS PARES ESCRITOS CON RÓTULOS, SIN «EJEMPLOS:» DELANTE. Un
     few-shot se pega muchas veces así: «Pregunta: ¿Capital de Francia?» /
     «Respuesta: París» / «Pregunta: ¿Capital de Italia?» / «Respuesta:
     Roma» / «Pregunta: ¿Capital de España?». «Pregunta» y «Respuesta» son
     rótulos conocidos, y (c) los subía uno a uno: las preguntas acababan
     en Pregunta, las respuestas en Formato, se proponía Investigación y el
     repaso paraba tres veces. Es el fallo caro de la asimetría: un rótulo
     que se repite ALTERNANDO con otro no está corroborado, tiene la forma
     de un par. Así que dos o más parejas SEGUIDAS mitad A → mitad B (las
     de csgLecMitad, cada una con su valor y la B justo debajo de la A) no
     pasan por (b), (c) ni (d). Si se escribieron sueltas —fuera de todo
     rótulo, o en Tarea o Texto— van a Ejemplos, donde se juntan en
     «a → b»; y la A que viene detrás sin respuesta, con el mismo rótulo,
     es la entrada nueva: va a «Ahora tú», que es lo que es. Si están
     dentro de otro bloque (un Formato que enseña la forma con un par),
     se quedan en él, enteras. Se calcula aquí, antes de repartir, porque
     cuando (c) ve la primera «Pregunta:» todavía no sabe que detrás viene
     su «Respuesta:». */
  const parSuelto = new Map();   // segmento → { tanda, tipo: 'par' | 'caso' | 'vacio', etiqueta?, resto? }
  {
    const items = [];
    let enCod = false;
    segmentos.forEach(sg => {
      if (sg.tipo !== 'linea') { items.push(null); return; }
      const tt = sg.t.trim();
      if (/^(```|~~~)/.test(tt)) { enCod = !enCod; items.push(null); return; }
      items.push(enCod ? null : { sg, tt, m: tt ? csgLecMitad(tt) : null });
    });
    const salta = j => { while (items[j] && !items[j].tt) j++; return j; };
    const esA = it => !!(it && it.m && it.m.lado === 'a' && it.m.resto);
    const esB = it => !!(it && it.m && it.m.lado === 'b' && it.m.resto);
    let tanda = 0;
    for (let k = 0; k < items.length;) {
      if (!esA(items[k]) || !esB(items[k + 1])) { k++; continue; }
      const pares = [];
      let j = k;
      while (esA(items[j]) && esB(items[j + 1])) { pares.push(items[j], items[j + 1]); j = salta(j + 2); }
      if (pares.length < 4) { k++; continue; }
      tanda++;
      pares.forEach(it => parSuelto.set(it.sg, { tanda, tipo: 'par' }));
      const q = items[j];
      if (esA(q) && csgClave(q.m.etiqueta) === csgClave(items[k].m.etiqueta)) {
        parSuelto.set(q.sg, { tanda, tipo: 'caso', etiqueta: q.m.etiqueta, resto: q.m.resto });
        const qb = items[j + 1];
        j++;
        if (qb && qb.m && qb.m.lado === 'b' && !qb.m.resto) { parSuelto.set(qb.sg, { tanda, tipo: 'vacio', etiqueta: qb.m.etiqueta }); j++; }
      }
      k = j;
    }
  }
  let tandaVista = 0, tandaMovida = false;

  let actual = '__fuera';
  let titulo = '';
  let usaDosPuntos = false;
  let enCodigo = false;
  const candidatosNombrar = [];   // { renglon, etiqueta, clave, forma, resto }
  const seccionesGeneradas = [];  // { n, muestra }: lo que escribe el armado y volvió pegado

  /* El bloque que acaba de abrir un encabezado, mientras sigue vacío:
     «## Coordinador» y debajo «Coordinador: recibe el encargo…» no son dos
     rótulos, son un rótulo y su primer renglón, y ese «Coordinador» es el
     nombre del nodo, que el armado lee de ahí. */
  let recienEncabezado = '';
  /* El bloque que abrió un rótulo con viñeta o número de lista delante
     («- **Rol:** …», «1. Tarea: …»). Un rótulo así solo asciende fuera de
     todo bloque o seguido de otro igual: dentro de «## Reglas», un
     «- Tono: siempre formal» es una regla de la lista, y dentro de una
     Tarea, un «2. Formato: tabla» es el paso dos de esa tarea. Subirlos
     partiría la lista de alguien, que es el fallo caro. */
  let porMarca = '';
  const abrir = (id, etiqueta, sg, porEncabezado, conMarca) => {
    const b = bloque(id, { id });
    recienEncabezado = porEncabezado ? id : '';
    porMarca = conMarca ? id : '';
    b.etiquetado = true;
    if (b.orden === Infinity) b.orden = sg.seq;
    /* Dónde y cómo se rotuló por primera vez: la mudanza de después lo
       nombra así, con el renglón y con la palabra que escribió la
       persona, no con el rótulo del vocabulario. */
    if (b.renglon === undefined) { b.renglon = sg.n; b.escrito = etiqueta; }
    /* Un bloque que vuelve a salir se pega al que ya había, detrás de una
       línea en blanco (así entra «Cuándo usarla» a la description). */
    if (tieneTexto(b)) b.lineas.push({ n: sg.n, t: '', seq: sg.seq, sep: true });
    estructura.push(etiqueta);
    actual = id;
  };
  const abrirLibre = (etiqueta, sg) => {
    const llave = 'libre:' + (csgClave(etiqueta) || etiqueta);
    const b = bloque(llave, { libre: true, rotulo: etiqueta });
    porMarca = '';
    if (b.orden === Infinity) b.orden = sg.seq;
    if (tieneTexto(b)) b.lineas.push({ n: sg.n, t: '', seq: sg.seq, sep: true });
    estructura.push(etiqueta);
    actual = llave;
    if (csgClave(etiqueta) === csgClave(CSG_TEXTOS.comoRotulo)) seccionesGeneradas.push({ n: sg.n, muestra: etiqueta });
  };
  /* «Cómo hacerlo en este chat» lo escribe el ARMADO en los grafos y los
     bucles, no la persona. En texto seguido es un rótulo de cinco
     palabras, que (c) no admite, así que sin esto se pegaría al último
     bloque como prosa y el siguiente armado lo escribiría dos veces. La
     frase es un literal de CSG_TEXTOS que nadie escribe por accidente:
     se reconoce entera, al principio del renglón, y va a su bloque libre,
     nombrada. */
  const comoSeguido = new RegExp('^' + csgSinTildes(CSG_TEXTOS.comoRotulo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*(.*)$', 'i');
  /* Y la `cabecera` de un molde («Regla para esta conversación:», la
     Receta corta) también la escribe el armado: es forma, como un
     rótulo. Leída como prosa caía en Tarea, y esa Tarea de mentira
     empataba la votación de la clase y la receta volvía como un prompt. */
  const cabeceras = new Set(Object.keys(CSG_MOLDES).map(k => CSG_MOLDES[k].cabecera).filter(Boolean).map(csgClave));
  const empuja = (l, extra) => {
    const b = bloque(actual, actual === '__fuera' ? { orden: -1 } : null);
    const r = Object.assign({ n: l.n, t: l.t, seq: l.seq }, extra || {});
    b.lineas.push(r);
    return r;
  };

  for (const sg of segmentos) {
    if (sg.tipo === 'xml') {
      let id = '';
      if (sg.tag === 'ejemplo' || sg.tag === 'example') id = 'ejemplos';
      else id = csgLecIdDeClave(sg.tag) || csgLecIdDeClave(sg.tag.replace(/_/g, ' '));
      let dentro = sg.t;
      if (id === 'ejemplos') {
        /* <ejemplo><entrada>a</entrada><salida>b</salida></ejemplo> es un
           par, y un par se escribe «a → b» en un renglón: es como lo pinta
           el compositor y como lo cuenta el repaso. */
        const envuelto = sg.tag === 'ejemplo' || sg.tag === 'example' ? '<' + sg.tag + '>' + dentro + '</' + sg.tag + '>' : dentro;
        dentro = envuelto
          .replace(/<(ejemplo|example)>\s*<(entrada|input)>([\s\S]*?)<\/\2>\s*<(salida|output)>([\s\S]*?)<\/\4>\s*<\/\1>/g,
            (x, a, b, ent, c, sal) => csgUnRenglon(ent) + ' → ' + csgUnRenglon(sal))
          .replace(/<\/?(?:ejemplo|example)>/g, '');
      }
      let b;
      porMarca = '';
      if (id) {
        b = bloque(id, { id });
        b.etiquetado = true;
        if (b.orden === Infinity) b.orden = sg.seq;
        if (b.renglon === undefined) { b.renglon = sg.n; b.escrito = '<' + sg.tag + '>'; }
        if (tieneTexto(b)) b.lineas.push({ n: sg.n, t: '', seq: sg.seq, sep: true });
      } else {
        b = bloque('libre:' + sg.tag, { libre: true, rotulo: sg.tag });
        if (b.orden === Infinity) b.orden = sg.seq;
        if (tieneTexto(b)) b.lineas.push({ n: sg.n, t: '', seq: sg.seq, sep: true });
        if (sg.tag === 'como') seccionesGeneradas.push({ n: sg.n, muestra: '<como>' });
      }
      dentro.replace(/^[ ]*\n/, '').replace(/\n[ ]*$/, '').split('\n')
        .forEach((t, k) => b.lineas.push({ n: sg.n, t: t.trimEnd(), seq: sg.seq + (k + 1) / 10000, xml: true }));
      /* Lo que venga detrás de una etiqueta cerrada ya no es de ella. */
      actual = '__fuera';
      continue;
    }

    const tt = sg.t.trim();
    /* Dentro de un bloque de código no hay rótulos: es literal, y el
       seudocódigo de un bucle («si cumple: parar») no es una etiqueta. */
    if (/^(```|~~~)/.test(tt)) { enCodigo = !enCodigo; empuja(sg, { codigo: true }); continue; }
    if (enCodigo) { empuja(sg, { codigo: true }); continue; }

    /* Los pares sueltos (ver parSuelto, arriba): nunca suben como rótulo.
       Dónde van lo decide el bloque en curso al empezar la tanda, y
       `actual` no se toca: lo que venga después sigue donde iba. */
    const ps = parSuelto.get(sg);
    if (ps) {
      if (ps.tanda !== tandaVista) { tandaVista = ps.tanda; tandaMovida = actual === '__fuera' || actual === 'tarea' || actual === 'texto'; }
      if (!tandaMovida) { empuja(sg); continue; }
      if (ps.tipo === 'par') {
        const e = bloque('ejemplos', { id: 'ejemplos' });
        e.etiquetado = true;
        if (e.orden === Infinity) e.orden = sg.seq;
        e.lineas.push({ n: sg.n, t: sg.t, seq: sg.seq });
      } else if (ps.tipo === 'caso') {
        const c = bloque('caso', { id: 'caso' });
        c.etiquetado = true;
        if (c.orden === Infinity) c.orden = sg.seq;
        if (tieneTexto(c)) c.lineas.push({ n: sg.n, t: '', seq: sg.seq, sep: true });
        estructura.push(ps.etiqueta);
        c.lineas.push({ n: sg.n, t: ps.resto, seq: sg.seq + 0.1 });
      } else estructura.push(ps.etiqueta);   // la media pareja vacía de la consulta («Salida:»)
      continue;
    }

    if (cabeceras.has(csgClave(tt))) { estructura.push(tt); continue; }

    const mc = csgSinTildes(tt).match(comoSeguido);
    if (mc) {
      const corte = tt.indexOf(':');
      abrirLibre(tt.slice(0, corte).trim(), sg);
      const resto = tt.slice(corte + 1).trim();
      if (resto) empuja({ n: sg.n, t: resto, seq: sg.seq + 0.1 });
      continue;
    }

    /* Dentro de Ejemplos, «Salida: …» es media pareja, no un rótulo (ver
       csgLecMitad). Se mira antes que (b) y (c), que lo subirían. */
    if (actual === 'ejemplos' && csgLecMitad(tt)) { empuja(sg); continue; }

    /* (a) Encabezado con almohadillas: inequívoco. */
    const h = csgLecEncabezado(tt);
    if (h) {
      const nivel = h.nivel;
      const etiqueta = h.etiqueta;
      const id = csgLecIdDeClave(csgClaveEtiqueta(etiqueta));
      if (id) { abrir(id, etiqueta, sg, true); continue; }
      /* El primer «# Título» que no es una palabra de bloque es el título
         de la pieza (§5, paso 7). */
      if (nivel === 1 && !titulo) { titulo = etiqueta.replace(/^\*\*(.+)\*\*$/, '$1').trim(); continue; }
      if (nivel > nivelConocido) { empuja(sg); continue; }
      abrirLibre(etiqueta, sg);
      continue;
    }

    /* (b) Negrita sola en su renglón, con o sin dos puntos. */
    let m = tt.match(/^\*\*([^*]{2,40})\*\*:?\s*$/);
    if (m) {
      const etiqueta = m[1].replace(/\s*:\s*$/, '').trim();
      const id = csgLecIdDeClave(csgClaveEtiqueta(etiqueta));
      if (id) { abrir(id, etiqueta, sg, true); continue; }
      if (hayEncabezadoConocido) { empuja(sg); continue; }
      abrirLibre(etiqueta, sg);
      continue;
    }

    /* (c) «Palabra: lo que sigue», con 1 a 3 palabras de letras delante de
       los dos puntos y su clave en CSG_SINONIMOS. También en negrita
       («**Tarea:** …»), que es como rotula casi cualquier máquina.
       ⚠️ Los dos puntos son la corroboración: sin ellos, «Tono de voz de
       los personajes» es una frase, y lo tiene que seguir siendo.
       ⚠️ Y SE ESCRIBEN COMO LOS ESCRIBE UNA MÁQUINA: con viñeta («- **Rol:**
       …», que es como ChatGPT hace casi cualquier prompt), con un emoji
       delante («🎯 Objetivo: …») o numerados («**1. Contexto:** …»). Todo
       eso entraba como una sola Tarea de prosa, sin ascender y sin
       nombrarse. La viñeta y el número de lista se quitan para mirar el
       rótulo, pero entonces solo ascienden donde no pueden ser un elemento
       de una lista (ver `porMarca`); el emoji no pide nada, porque un
       emoji delante es cosa de rótulos y no de listas. Lo quitado va a la
       estructura con el rótulo, para que la cuenta de palabras cuadre
       («1.» es una palabra).
       ⚠️ Y LOS RÓTULOS LARGOS DEL VOCABULARIO (CSG_LEC_ROTULOS_LARGOS)
       pasan el tope de tres palabras, y los que llevan coma, la expresión
       de letras y espacios: son los que escribe el armado en texto
       seguido. */
    let etiquetaC = '', restoC = '', negritaC = false, escritoC = '';
    const sinMarca = csgLecSinVineta(tt);
    const conMarca = sinMarca !== tt;
    const baseC = sinMarca.replace(CSG_LEC_PICTOS_IZQ, '');
    const prefijoC = tt.slice(0, tt.length - baseC.length);
    m = baseC.match(/^\*\*([^*]{2,30}?)\s*:\s*\*\*\s*(.*)$/) || baseC.match(/^\*\*([^*]{2,30}?)\*\*\s*:\s*(.*)$/);
    if (m) {
      const e = m[1].trim().replace(CSG_LEC_PICTOS_IZQ, '').replace(/^\d{1,2}[.)]\s+/, '');
      if (/^[\p{L} ]+$/u.test(e)) { etiquetaC = e; escritoC = m[1].trim(); restoC = m[2]; negritaC = true; }
    }
    if (!etiquetaC) {
      m = baseC.match(/^([\p{L} ]{2,30}):\s*(.*)$/u);
      if (m) { etiquetaC = escritoC = m[1].trim(); restoC = m[2]; }
      else {
        const k = baseC.indexOf(':');
        if (k > 0 && k <= 60 && CSG_LEC_ROTULOS_LARGOS.has(csgClave(baseC.slice(0, k)))) {
          etiquetaC = escritoC = baseC.slice(0, k).trim(); restoC = baseC.slice(k + 1);
        }
      }
    }
    const largoC = !!etiquetaC && CSG_LEC_ROTULOS_LARGOS.has(csgClave(etiquetaC));
    const puedeC = !conMarca || actual === '__fuera' || porMarca === actual;
    if (etiquetaC && puedeC && (largoC || etiquetaC.split(/\s+/).length <= 3)) {
      const clave = csgClaveEtiqueta(etiquetaC);
      const id = csgLecIdDeClave(clave);
      if (id && id === actual && recienEncabezado === id && !tieneTexto(bloques.get(id))) { empuja(sg); continue; }
      if (id) {
        abrir(id, prefijoC + escritoC, sg, false, conMarca);
        usaDosPuntos = true;
        if (restoC.trim()) empuja({ n: sg.n, t: restoC.trim(), seq: sg.seq + 0.1 });
        continue;
      }
      const r = empuja(sg);
      candidatosNombrar.push({ renglon: r, etiqueta: escritoC + ':', clave, forma: negritaC ? 'negrita' : 'dospuntos', resto: restoC.trim() });
      continue;
    }

    /* (d) Un rótulo EN MAYÚSCULAS solo en su renglón: así se escribe una
       cabecera y así no se escribe la prosa. Con su emoji delante, igual. */
    const baseD = tt.replace(CSG_LEC_PICTOS_IZQ, '');
    if (/^[\p{Lu} ]{3,30}$/u.test(baseD) && /\p{Lu}/u.test(baseD)) {
      const clave = csgClaveEtiqueta(baseD);
      const id = csgLecIdDeClave(clave);
      if (id) { abrir(id, tt, sg); continue; }
      const r = empuja(sg);
      candidatosNombrar.push({ renglon: r, etiqueta: tt, clave, forma: 'mayusculas', resto: '' });
      continue;
    }

    empuja(sg);
  }

  /* «Cuándo usarla» de un SKILL.md hecho aquí repite, por construcción,
     la description del frontmatter. Pegar las dos en el disparador lo
     duplicaría en cada vuelta (pegar → armar → pegar), así que si son
     iguales la copia se lee como forma. Si alguien añadió algo, no son
     iguales y se quedan las dos: eso sí es texto de alguien. */
  if (frontmatter && bloques.has('disparador')) {
    const b = bloques.get('disparador');
    const delFm = b.lineas.filter(l => l.fm).map(l => l.t).join(' ');
    const delCuerpo = b.lineas.filter(l => !l.fm && !l.sep);
    if (delCuerpo.length && csgClave(delFm) === csgClave(delCuerpo.map(l => l.t).join(' '))) {
      estructura.push(delCuerpo.map(l => l.t).join('\n'));
      b.lineas = b.lineas.filter(l => l.fm);
    }
  }

  /* Dos mitades seguidas en Ejemplos —«Entrada: a» y «Salida: b», o los
     «**Entrada:** a» y «**Salida:** b» que escribe el armado en
     Markdown— vuelven a ser «a → b», que es como se escribe un par en el
     recuadro y lo único que el repaso cuenta como par: si no, un Con
     ejemplos pegado con sus pares así diría «hay ninguno» y pararía el
     uso. Se miran también las que vinieron dentro de <ejemplos>. Una
     mitad suelta, o con su valor en otro renglón, se queda como está. */
  if (bloques.has('ejemplos')) {
    const b = bloques.get('ejemplos');
    const nuevas = [];
    for (let k = 0; k < b.lineas.length; k++) {
      const a = b.lineas[k], s = b.lineas[k + 1];
      const ma = a.codigo ? null : csgLecMitad(a.t);
      const ms = s && !s.codigo ? csgLecMitad(s.t) : null;
      if (ma && ms && ma.lado === 'a' && ms.lado === 'b' && ma.resto && ms.resto) {
        estructura.push(ma.etiqueta, ms.etiqueta);
        nuevas.push(Object.assign({}, a, { t: ma.resto + ' → ' + ms.resto, par: true }));
        k++;
      } else nuevas.push(a);
    }
    /* El armado en Markdown pone un renglón en blanco a cada lado de cada
       par (para que la máquina los lea como casos y no como una lista
       larga). En el recuadro un par es un renglón y los blancos sobran: el
       que toca a un par rehecho se quita. No es una palabra, y en un bloque
       de lista el armado los ignora igual. */
    b.lineas = nuevas.filter((l, k) => !(l.t.trim() === '' && ((nuevas[k - 1] && nuevas[k - 1].par) || (nuevas[k + 1] && nuevas[k + 1].par))));
  }

  const etiquetados = () => [...bloques.values()].filter(b => b.id && b.etiquetado && CSG_BLOQUES[b.id]);
  const lineasDe = llaves => {
    const out = [];
    llaves.forEach(k => { const b = bloques.get(k); if (b) b.lineas.forEach(l => out.push({ b, l })); });
    return out.sort((x, y) => x.l.seq - y.l.seq);
  };
  /* Saca de sus bloques los renglones que se mudan, de una pasada por
     bloque: quitarlos uno a uno recorre el bloque entero por cada
     renglón, y un texto pegado de cinco mil renglones se notaría. */
  const sacarDeSuBloque = xs => {
    const van = new Set(xs.map(x => x.l));
    new Set(xs.map(x => x.b)).forEach(b => { b.lineas = b.lineas.filter(l => !van.has(l)); });
  };

  /* ── Paso 5: aristas. SOLO si no hay un bloque de ejemplos (un par
     «a → b» ahí es un par, nunca una arista) y SOLO sobre lo que sigue
     en Tarea, en Texto o en un bloque de aristas.
     ⚠️ Y hace falta que las flechas formen un FLUJO: que algún nombre
     salga en dos renglones distintos. «gato → cat / perro → dog» son dos
     renglones con flecha entre nombres cortos, cumplen la regla del §5 al
     pie de la letra, y son pares de un prompt de traducción pegado sin
     rótulos: convertirlos en un grafo sería partir un prompt que
     funcionaba. «Investigador → Guionista / Guionista → Editor» comparten
     a Guionista, y eso es lo que tiene un grafo y no tiene una lista de
     pares.
     ⚠️ Y EL NOMBRE COMPARTIDO TIENE QUE SER UN ORIGEN. «Algún nombre en dos
     renglones» no bastaba: en un few-shot de CLASIFICACIÓN la etiqueta de
     salida se repite siempre («Me encantó → positiva / Muy recomendable →
     positiva»), y un prompt con «Tarea:» y «Ahora tú:» se proponía como
     Grafo · Cadena, con el repaso parando por un «gato → animal» que
     «vuelve atrás». Lo que tiene un flujo es un nombre que ENTREGA en un
     renglón y aparece en OTRO: la cadena (el destino de uno es el origen
     del siguiente) y la estrella (el mismo origen reparte a varios). Un
     nombre que solo recibe no hace un grafo.
     ⚠️ Y CON «AHORA TÚ» LAS FLECHAS NO SE MIRAN COMO ARISTAS: la entrada
     nueva es lo que define un prompt con ejemplos, así que los pares
     sueltos (dos o más renglones «a → b» seguidos, de los que el armado
     pinta como pares) van a Ejemplos, igual que si llevaran su rótulo. */
  let aristasMovidas = false;
  if (!bloques.has('ejemplos') && bloques.has('caso')) {
    const ls = lineasDe(['__fuera', 'tarea', 'texto']).filter(x => !x.l.codigo && !x.l.xml && x.l.t.trim());
    const mover = [];
    let tanda = [];
    const cierra = () => { if (tanda.length >= 2) mover.push(...tanda); tanda = []; };
    ls.forEach(x => { if (csgArmPar(x.l.t)) tanda.push(x); else cierra(); });
    cierra();
    if (mover.length) {
      const e = bloque('ejemplos', { id: 'ejemplos' });
      e.etiquetado = true;
      if (e.orden === Infinity) e.orden = mover[0].l.seq;
      sacarDeSuBloque(mover);
      mover.forEach(x => e.lineas.push(x.l));
      e.lineas.sort((a, b) => a.seq - b.seq);
    }
  }
  if (!bloques.has('ejemplos')) {
    const candidatas = bloques.has('caso') ? [] : lineasDe(['__fuera', 'tarea', 'texto'])
      .filter(x => !x.l.codigo && !x.l.xml && csgEsArista(x.l.t));
    if (candidatas.length >= 2) {
      const donde = new Map();   // nombre → renglones (índices de candidatas) donde sale
      const origenes = candidatas.map((x, i) => {
        new Set(csgLecNombresArista(x.l.t).map(csgClave)).forEach(k => { if (!donde.has(k)) donde.set(k, new Set()); donde.get(k).add(i); });
        const mo = csgLecSinVineta(x.l.t).match(CSG_LEC_ARISTA);
        return mo ? csgClave(mo[1]) : '';
      });
      if (origenes.some((o, i) => { const s = o && o !== 'fin' ? donde.get(o) : null; return !!s && (s.size > 1 || !s.has(i)); })) {
        const destino = bloque('aristas', { id: 'aristas' });
        if (destino.orden === Infinity) destino.orden = candidatas[0].l.seq;
        sacarDeSuBloque(candidatas);
        candidatas.forEach(x => destino.lineas.push(x.l));
        destino.lineas.sort((a, b) => a.seq - b.seq);
        aristasMovidas = true;
      }
    }
    /* Los nombres de las aristas van a Nodos si no estaban (el nombre
       solo; «recibe…, entrega…» lo escribe la persona). Sin esto, cada
       arista pegada sería «una arista a un nodo que no existe» y el
       repaso pararía el uso por un nodo que está escrito dos renglones
       más arriba. */
    if (bloques.has('aristas')) {
      const nodos = bloque('nodos', { id: 'nodos' });
      if (nodos.orden === Infinity) nodos.orden = bloques.get('aristas').orden - 0.5;
      const yaEstan = new Set(nodos.lineas.filter(l => l.t.trim()).map(l => csgClave(csgLecNombreNodo(l.t))));
      let extra = 0;
      bloques.get('aristas').lineas.forEach(l => {
        if (l.codigo || !csgEsArista(l.t)) return;
        csgLecNombresArista(l.t).forEach(nombre => {
          const k = csgClave(nombre);
          if (yaEstan.has(k)) return;
          yaEstan.add(k);
          nodos.lineas.push({ n: l.n, t: nombre, seq: 1e9 + (extra++), anadido: true });
          anadido.push(nombre);
        });
      });
      if (!nodos.lineas.length) bloques.delete('nodos');
    }
  }

  /* ── Paso 6: bucle y lotes. SOLO si no se reconoció NINGÚN bloque de
     prompt: «Repite esto para cada tema» dentro de una Tarea es una
     frase de la tarea, y convertir ese prompt en un bucle lo partiría.
     Hacen falta renglones de DOS clases distintas entre parada, tope y
     paso: un «hasta que» suelto sale en cualquier prosa. */
  let bucle = '';
  const hayPrompt = etiquetados().some(b => CSG_BLOQUES_PROMPT.indexOf(b.id) >= 0);
  if (!hayPrompt && !aristasMovidas) {
    /* Tarea entra en la lista porque así lo dice el §5 («los renglones
       que siguen en tarea/texto»), aunque hoy una Tarea con texto solo
       puede venir rotulada, y entonces ya hay un bloque de prompt y no se
       llega aquí: es la guarda de arriba la que la protege, no la lista. */
    const lista = lineasDe(['__fuera', 'tarea', 'texto']).filter(x => !x.l.codigo && !x.l.xml);
    const conTexto = lista.filter(x => x.l.t.trim());
    const marcas = new Map(conTexto.map(x => [x.l, csgLecMarcasBucle(x.l.t)]));
    const clases = new Set(conTexto.map(x => csgLecClaseBucle(marcas.get(x.l))).filter(c => c === 'parada' || c === 'tope' || c === 'paso'));
    /* La tanda de Por lotes: tres o más renglones cortos seguidos, sin
       punto final y sin nada de bucle dentro («Fracciones», «Decimales»…).
       Un renglón en blanco la corta: dos listas no son una. */
    let tanda = [];
    {
      let corrida = [];
      const cierra = () => { if (!tanda.length && corrida.length >= 3) tanda = corrida; corrida = []; };
      lista.forEach(x => {
        const t = x.l.t.trim();
        const m = marcas.get(x.l);
        const corto = t && t.length <= 60 && !/[.!?…:;]$/.test(t) && m && !m.parada && !m.tope && !m.paso && !m.memoria && !m.lotes;
        if (corto) corrida.push(x); else cierra();
      });
      cierra();
    }
    const hayLotes = conTexto.some(x => marcas.get(x.l).lotes);
    if (hayLotes && tanda.length) bucle = 'lotes';
    else if (clases.size >= 2) bucle = 'hasta';
    if (bucle) {
      const enTanda = new Set(tanda.map(x => x.l));
      let ultimo = 'paso';
      sacarDeSuBloque(lista);
      lista.forEach(x => {
        let a;
        if (!x.l.t.trim()) a = ultimo;
        else if (enTanda.has(x.l)) a = 'lista';
        else {
          const m = marcas.get(x.l);
          const c = csgLecClaseBucle(m);
          if (bucle === 'lotes') a = m.lotes ? 'paso' : (c === 'tope' || c === 'memoria') ? c : 'paso';
          else a = c === 'tope' || c === 'parada' || c === 'memoria' ? c : 'paso';
        }
        ultimo = a;
        const b = bloque(a, { id: a });
        if (b.orden === Infinity) b.orden = x.l.seq;
        b.lineas.push(x.l);
      });
      ['paso', 'parada', 'tope', 'memoria', 'lista'].forEach(k => { if (bloques.has(k)) bloques.get(k).lineas.sort((a, b) => a.seq - b.seq); });
    }
  }

  /* ── El texto de fuera de todo rótulo va a Tarea, o a Texto si no se
     reconoció ningún bloque (§5, paso 4). Si ya había una Tarea
     rotulada, se juntan en el orden en que venían. */
  if (bloques.has('__fuera')) {
    const fuera = bloques.get('__fuera');
    bloques.delete('__fuera');
    if (tieneTexto(fuera)) {
      const reconoce = [...bloques.values()].some(b => b.id && CSG_BLOQUES[b.id] && (b.etiquetado || tieneTexto(b)));
      const id = reconoce ? 'tarea' : 'texto';
      const b = bloque(id, { id });
      b.orden = Math.min(b.orden, fuera.orden);
      b.lineas = b.lineas.concat(fuera.lineas).sort((x, y) => x.seq - y.seq);
    }
  }

  /* ── Paso 8: la propuesta. ─────────────────────────────────────────── */
  const textoDe = b => {
    const ls = b.lineas.map(l => l.t.trimEnd());
    while (ls.length && !ls[0].trim()) ls.shift();
    while (ls.length && !ls[ls.length - 1].trim()) ls.pop();
    return ls.join('\n');
  };
  const presentes = [...bloques.values()].filter(b => b.id && CSG_BLOQUES[b.id] && (b.etiquetado || tieneTexto(b)));
  const ids = [...new Set(presentes.map(b => b.id))];
  const paraProponer = presentes.map(b => ({ id: b.id, t: textoDe(b) }));
  let clase, molde;
  if (frontmatter) { clase = 'habilidad'; molde = 'skill'; }
  else if (aristasMovidas) { clase = 'grafo'; molde = csgProponerMolde('grafo', ids, paraProponer); }
  else if (bucle) { clase = 'bucle'; molde = csgProponerMolde('bucle', ids, paraProponer); }
  else { clase = csgLecClaseVotada(ids); molde = csgProponerMolde(clase, ids, paraProponer); }
  let moldeDef = CSG_MOLDES[molde];

  /* ── La mudanza. ⚠️ Un rótulo que existe pero es de OTRA clase caía en
     un bloque que el molde propuesto no tiene, y el repaso paraba por el
     hueco que dejaba: «Salida: una tabla» (el «Qué sale al final» de los
     bucles) en un prompt dejaba el Encargo con «Falta Formato», y el
     «## Instructions» de un SKILL.md de Anthropic caía en una Tarea al
     final y dejaba «Falta Pasos». Cada bloque que el molde no tiene se
     muda al primer candidato de CSG_EQUIVALE que el molde SÍ tenga y esté
     vacío —es lo mismo que hace «Duplicar en otro molde»—, y se dice. Si
     no hay sitio, se queda como bloque aparte, como antes. Y después se
     vuelve a proponer el molde con lo mudado: un «Tarea + Salida» es un
     Rápido, no un Encargo. */
  const mudados = [];
  {
    const idsM = moldeDef.bloques.map(x => x.id);
    [...bloques.values()]
      .filter(b => b.id && !b.libre && CSG_BLOQUES[b.id] && idsM.indexOf(b.id) < 0 && tieneTexto(b))
      .sort((x, y) => x.orden - y.orden)
      .forEach(b => {
        const cands = (CSG_EQUIVALE[b.id] || []).concat(CSG_LEC_MUDA[b.id] || []);
        const dest = cands.find(c => idsM.indexOf(c) >= 0 && !(bloques.has(c) && tieneTexto(bloques.get(c))));
        if (!dest) return;
        const d = bloque(dest, { id: dest });
        d.etiquetado = true;
        d.orden = Math.min(d.orden, b.orden);
        d.lineas = d.lineas.concat(b.lineas).sort((x, y) => x.seq - y.seq);
        bloques.delete(b.llave);
        mudados.push({ de: b, a: dest });
      });
    if (mudados.length && !frontmatter) {
      const pres = [...bloques.values()].filter(b => b.id && CSG_BLOQUES[b.id] && (b.etiquetado || tieneTexto(b)));
      const otro = csgProponerMolde(clase, [...new Set(pres.map(b => b.id))], pres.map(b => ({ id: b.id, t: textoDe(b) })));
      if (otro !== molde && CSG_MOLDES[otro]) { molde = otro; moldeDef = CSG_MOLDES[otro]; }
    }
  }

  /* ── Los bloques de salida: los del molde en su orden, y detrás los
     demás (libres o de otro molde) en el orden en que salieron. Un bloque
     vacío solo sale si alguien lo rotuló y el molde lo tiene: rotular
     «Formato:» y no escribir nada también es decir algo. */
  const salida = [];
  /* Un bloque libre no puede llevar el id de uno del vocabulario ni el
     de `como`, el bloque sintético que añade el armado: un <como> pegado
     que se llamara igual saldría confundido con el de verdad. Ni el de
     una etiqueta que el armado escribe como estructura (<material>,
     <ejemplo>…: CSG_ETIQUETAS_ARMADO): un «## Material» libre armado en
     Claude era un segundo <material> encima del de verdad. */
  const usados = Object.keys(CSG_BLOQUES).concat(['como'], CSG_ETIQUETAS_ARMADO);
  const idsMolde = moldeDef.bloques.map(b => b.id);
  moldeDef.bloques.forEach(mb => {
    const b = bloques.get(mb.id);
    if (!b) return;
    const t = textoDe(b);
    if (!t && !b.etiquetado) return;
    salida.push({ b, id: mb.id, rotulo: csgBloqueDef(molde, mb.id).rotulo, t });
  });
  [...bloques.values()]
    .filter(b => !(b.id && idsMolde.indexOf(b.id) >= 0))
    .sort((x, y) => x.orden - y.orden)
    .forEach(b => {
      const t = textoDe(b);
      if (!t) return;
      if (b.libre) {
        const id = csgSlugId(b.rotulo, usados);
        usados.push(id);
        salida.push({ b, id, rotulo: b.rotulo, t });
      } else {
        salida.push({ b, id: b.id, rotulo: csgBloqueDef(molde, b.id).rotulo, t });
      }
    });

  /* ── Paso 7: variables y título. ─────────────────────────────────── */
  const variables = csgVariables(salida.map(s => s.t).join('\n'));

  /* ── Los avisos, ya sabiendo dónde acabó cada renglón. ─────────────── */
  const deRenglon = new Map();
  salida.forEach(s => s.b.lineas.forEach(l => deRenglon.set(l, s)));
  const sugerencias = new Map();
  const avisos = [];
  /* Se nombran como mucho veinte, como en El Rodaje, y el resto se cuenta:
     una lista de quinientos renglones mal rotulados no la lee nadie, y el
     primero ya dice qué pasa. */
  const NOMBRAR_MAX = 20;
  let nombrados = 0, sinNombrar = 0, primeroSin = 0;
  candidatosNombrar.forEach(c => {
    const s = deRenglon.get(c.renglon);
    if (!s) return;
    const esLista = !!(CSG_BLOQUES[s.id] && CSG_BLOQUES[s.id].lista);
    /* ⚠️ SE NOMBRA LO QUE INTENTABA SER UN RÓTULO, no toda frase con dos
       puntos. Es la regla de El Rodaje y de La Voz Prestada: «Viaja: el
       tema y las fuentes», «Investigador: recibe el tema» o «Corrige
       esto:» son contenido, y un aviso por cada uno haría de la lista de
       avisos ruido que nadie lee. Lo intentaba si está en MAYÚSCULAS o en
       negrita, o si el texto ya rotula con dos puntos («Contexto: …»,
       «Tarea: …») y este renglón está entre esos rótulos: ahí «Notas: …»
       tiene la misma forma que los que sí se entendieron. Dentro de una
       lista (Nodos, Reglas, Ejemplos) «Nombre: algo» es un elemento, y no
       se nombra. Lo que no se nombra no se pierde: sigue en su bloque. */
    const intentaba = c.forma === 'mayusculas' ||
      (!esLista && (c.forma === 'negrita' || usaDosPuntos));
    if (!intentaba) return;
    if (nombrados >= NOMBRAR_MAX) { if (!sinNombrar++) primeroSin = c.renglon.n; return; }
    nombrados++;
    if (!sugerencias.has(c.clave)) sugerencias.set(c.clave, csgLecSugerencia(c.clave, clase));
    const sug = sugerencias.get(c.clave);
    const rotSug = sug ? csgBloqueDef(molde, CSG_SINONIMOS[sug]).rotulo : '';
    avisos.push({
      renglon: c.renglon.n,
      texto: 'renglón ' + c.renglon.n + ': «' + c.etiqueta + '» no es un bloque; se quedó en ' + s.rotulo + '.' +
        (rotSug ? ' ¿Querías ' + rotSug + '?' : ''),
      sugerencia: sug,
    });
  });
  if (sinNombrar) {
    avisos.push({
      renglon: primeroSin,
      texto: 'y ' + sinNombrar + (sinNombrar === 1 ? ' renglón más' : ' renglones más') +
        ' con un rótulo que no se entiende, desde el ' + primeroSin + ': se quedaron donde estaban.',
      sugerencia: '',
    });
  }
  avisosCrudos.forEach(a => {
    if (a.tipo === 'frontmatter') {
      avisos.push({
        renglon: a.n,
        texto: 'renglón ' + a.n + ': el frontmatter trae ' + a.claves.map(k => '«' + k + '»').join(', ') +
          ', que una consigna no guarda aparte: se ' + (a.claves.length === 1 ? 'quedó' : 'quedaron') +
          ' tal cual en el bloque libre «Frontmatter».',
        sugerencia: '',
      });
    }
  });
  mudados.forEach(x => {
    const n = x.de.renglon !== undefined ? x.de.renglon : ((x.de.lineas[0] || {}).n || 0);
    const escrito = String(x.de.escrito || CSG_BLOQUES[x.de.id].rotulo).replace(/[\s:]+$/, '');
    avisos.push({
      renglon: n,
      texto: 'renglón ' + n + ': «' + escrito + '» se leyó como «' + csgBloqueDef(molde, x.a).rotulo +
        '», que es el bloque que tiene ' + moldeDef.nombre + '.',
      sugerencia: '',
    });
  });
  seccionesGeneradas.forEach(g => {
    avisos.push({
      renglon: g.n,
      texto: 'renglón ' + g.n + ': «' + g.muestra + '» lo escribe La Consigna al armar; se quedó como bloque libre. ' +
        'Quítalo si no lo cambiaste, o saldrá dos veces.',
      sugerencia: '',
    });
  });
  /* «Parece que se repite»: con bloques de prompt no se propone un bucle
     (paso 6), pero callarlo sería esconder la pista. La frase se queda en
     su bloque y se dice; el repaso ofrece «Duplicar en ese molde». */
  if (clase === 'prompt') {
    let n = 0;
    salida.filter(s => s.id === 'tarea' || s.id === 'texto').forEach(s => {
      const ls = s.b.lineas.filter(l => !l.codigo && l.t.trim());
      csgLecRepite(ls.map(l => l.t)).forEach(x => {
        if (n >= 3) return;
        n++;
        const l = ls[x.i];
        const nombreMolde = CSG_MOLDES[x.molde].nombre;
        avisos.push({
          renglon: l.n,
          texto: 'renglón ' + l.n + ': parece que se repite («' + l.t.trim() + '»): ¿un Bucle · ' + nombreMolde +
            '? Se quedó en ' + s.rotulo + '; si lo es, «Duplicar en ese molde».',
          sugerencia: '',
        });
      });
    });
  }
  avisos.sort((a, b) => a.renglon - b.renglon);

  const reconocidos = idsMolde.filter(id => salida.some(s => s.id === id && s.t.trim())).length;
  return {
    clase,
    molde,
    titulo,
    bloques: salida.map(s => ({ id: s.id, rotulo: s.rotulo, t: s.t })),
    material,
    variables,
    avisos,
    propuesta: { clase, molde, reconocidos, total: idsMolde.length },
    estructura,
    anadido,
  };
}

/* La clase que proponen los rótulos reconocidos: la que tenga más de
   ellos entre sus moldes. A igualdad gana Prompt, que es la de los
   moldes que aceptan de todo (Encargo, Libre): proponer Habilidad por un
   empate sería forzar un SKILL.md donde había un prompt. */
function csgLecClaseVotada(ids) {
  const cuenta = { prompt: 0, habilidad: 0, grafo: 0, bucle: 0 };
  (ids || []).forEach(id => csgLecClasesDeId(id).forEach(c => { if (c in cuenta) cuenta[c]++; }));
  let mejor = 'prompt';
  ['habilidad', 'grafo', 'bucle'].forEach(c => { if (cuenta[c] > cuenta[mejor]) mejor = c; });
  return mejor;
}

/* ══════════════════════════════════════════════════════════════════
   csgProponerMolde(clase, ids, bloques?): el molde dentro de una clase
   según los bloques reconocidos (§5, paso 8), en el orden en que la
   especificación los escribe. `bloques` ([{id, t}]) solo hace falta para
   contar los pares de ejemplo; sin él, un bloque de ejemplos cuenta como
   si tuviera los que hacen falta (quien llama sin texto está preguntando
   por los ids, no por lo escrito).
   ══════════════════════════════════════════════════════════════════ */
function csgProponerMolde(clase, ids, bloques) {
  const tiene = new Set(ids || []);
  const hay = (...xs) => xs.some(x => tiene.has(x));
  if (clase === 'habilidad') {
    if (tiene.has('nombre')) return 'skill';
    if (hay('identidad', 'mision', 'siempre', 'nunca')) return 'sistema';
    if (tiene.has('disparador') && tiene.has('pasos')) return 'receta';
    return 'skill';
  }
  if (clase === 'grafo') return hay('coordinador', 'reparto', 'juntar') ? 'coordinador' : 'cadena';
  if (clase === 'bucle') {
    if (hay('borrador', 'critico')) return 'critica';
    if (tiene.has('lista')) return 'lotes';
    /* La especificación dice «postura_a»; postura_b y juez solo existen
       en el Careo, así que dicen lo mismo. */
    if (hay('postura_a', 'postura_b', 'juez')) return 'careo';
    return 'hasta';
  }
  /* Prompt. */
  let paresBastan = true;
  if (Array.isArray(bloques)) {
    const e = bloques.filter(b => b && b.id === 'ejemplos').map(b => b.t || '').join('\n');
    paresBastan = csgLecPares(e) >= 2;
  }
  if (tiene.has('objetivo') && tiene.has('audiencia')) return 'costar';
  if (tiene.has('caso') || (tiene.has('ejemplos') && paresBastan)) return 'ejemplos';
  if (hay('pregunta', 'fuentes', 'citas')) return 'fuentes';
  if (hay('voz', 'genero', 'etiqueta')) return 'voz';
  if (tiene.has('pasos') && tiene.has('responde')) return 'razonado';
  const utiles = [...tiene].filter(x => CSG_BLOQUES[x]);
  if (!utiles.length || (utiles.length === 1 && utiles[0] === 'texto')) return 'libre';
  if (tiene.has('tarea') && utiles.every(x => x === 'tarea' || x === 'formato')) return 'rapido';
  return 'encargo';
}

/* ══════════════════════════════════════════════════════════════════
   DATOS DE LA CASA DENTRO DE UNA PIEZA (regla 17). Una pieza viaja a la
   nube y a la máquina: un teléfono, un correo o el nombre de alguien de
   la casa escritos a mano dentro de un bloque se van con ella. Se avisa
   y se ofrece cambiarlos por un {{hueco}} que se rellena al usar.
   Devuelve [{tipo: 'correo'|'telefono'|'nombre', trozo}], el trozo tal
   como está escrito (el arreglo lo busca y lo reemplaza exacto).
   ══════════════════════════════════════════════════════════════════ */
/* ⚠️ El correo empieza donde empieza su racha de letras (la mirada hacia
   atrás) y su nombre no pasa de 64. Sin eso, en un renglón largo sin
   ninguna @ —una dirección kilométrica, un bloque en base64— la
   expresión probaba desde cada letra hasta el final y volvía: con 60.000
   caracteres eran tres segundos, y el repaso corre en CADA tecla de la
   vista previa. Medido, no supuesto: la prueba lo cronometra. */
const CSG_LEC_CORREO = /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,24}(?![A-Za-z0-9-])/g;
/* Un teléfono son de 8 a 15 cifras con separadores sueltos (espacio,
   punto, guion), con su «+504» y su «(504)» si los trae. En Honduras son
   ocho cifras: «9876-5432». */
const CSG_LEC_TELEFONO = /(?<![\p{L}\p{N}])(?:\+\d{1,3}[ .\-–]?)?(?:\(\d{1,4}\)[ .\-–]?)?\d(?:[ .\-–]?\d){6,14}(?![\p{L}\p{N}])/gu;

/* ⚠️ Lo que tiene cifras de teléfono y no lo es. «datos de 2015-2024»
   está en el propio ejemplo de la Postura A del Careo: son ocho cifras
   con un guion, igual que un teléfono de la casa. Un aviso que confunde
   un rango de años con un teléfono enseña a no leer los avisos. */
/* ⚠️ Y en un prompt de investigación hay más: un ISBN («978-84-376-0494-7»,
   trece cifras que empiezan por 978 o 979), una racha de años («PIB 2019
   2020 2021 2022») o una cuenta («1 2 3 4 5 6 7 8 9 10») tienen la forma
   de un teléfono, y el chip del aviso cambiaría el ISBN de una cita por
   un {{telefono}}. El ISBN escrito con su palabra delante lo aparta
   csgDatosDeCasa, que ve el texto de alrededor. */
function csgLecEsTelefono(trozo) {
  const t = String(trozo).trim();
  const cifras = t.replace(/\D/g, '');
  if (cifras.length < 8 || cifras.length > 15) return false;
  if (cifras.length === 13 && /^97[89]/.test(cifras)) return false;                    // ISBN-13
  if (/^(?:(?:19|20)\d\d\s+)+(?:19|20)\d\d$/.test(t)) return false;                   // años seguidos
  if (/^\d{1,2}(?: \d{1,2}){4,}$/.test(t)) return false;                               // una cuenta: 1 2 3 4 5…
  if (/^(1[5-9]\d\d|20\d\d)\s*[-–]\s*(1[5-9]\d\d|20\d\d)$/.test(t)) return false;   // años «2015-2024»
  if (/^\d{4}[-.]\d{2}[-.]\d{2}$/.test(t)) return false;                              // fecha «2026-09-22»
  if (/^\d{1,3}(?:[ .]\d{3})+$/.test(t)) return false;                                 // miles «12.345.678»
  if (/^\d+\.\d+$/.test(t)) return false;                                              // decimales
  if (/^\d{8}$/.test(t) && /^(19|20)\d\d(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(t)) return false;   // «20260922»
  return true;
}

/* Los nombres de la casa salen de MIEMBROS (js/auth.js), nunca de una
   lista escrita aquí: el día que cambie uno, esto lo sabe. Si MIEMBROS
   no está (en la prueba de Node, o si auth.js no cargó), no se busca
   ninguno. El nombre entero va primero, para que «Josué Edmundo» sea un
   aviso y no dos. */
function csgLecNombresCasa() {
  if (typeof MIEMBROS === 'undefined' || !MIEMBROS) return [];
  const out = [];
  Object.keys(MIEMBROS).forEach(k => {
    const nombre = String((MIEMBROS[k] || {}).nombre || '').trim();
    if (!nombre) return;
    out.push(nombre);
    nombre.split(/\s+/).forEach(p => { if (p.length >= 4) out.push(p); });
  });
  return [...new Set(out)].sort((a, b) => b.length - a.length);
}

/* Un nombre casa con o sin su tilde («Josué», «josue»), porque se
   escribe de las dos maneras y las dos son el mismo dato. */
function csgLecPatronNombre(nombre) {
  const variantes = { a: '[aáà]', e: '[eéè]', i: '[iíì]', o: '[oóò]', u: '[uúüù]' };
  const base = csgSinTildes(nombre).toLowerCase();
  let p = '';
  for (const c of base) p += variantes[c] || c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
  return new RegExp('(?<![\\p{L}\\p{N}])' + p + '(?![\\p{L}\\p{N}])', 'giu');
}

function csgDatosDeCasa(texto) {
  const s = String(texto == null ? '' : texto);
  const hallados = [];
  const vistos = new Set();
  const mete = (tipo, trozo) => {
    const k = tipo + '|' + trozo;
    if (!vistos.has(k)) { vistos.add(k); hallados.push({ tipo, trozo }); }
  };
  (s.match(CSG_LEC_CORREO) || []).forEach(c => mete('correo', c));
  /* Los teléfonos se buscan con los correos tapados: «ana2015@…» no
     lleva un teléfono dentro. */
  const sinCorreos = s.replace(CSG_LEC_CORREO, m => ' '.repeat(m.length));
  let m;
  CSG_LEC_TELEFONO.lastIndex = 0;
  while ((m = CSG_LEC_TELEFONO.exec(sinCorreos))) {
    const trozo = m[0].trim();
    /* Un número con «ISBN» delante es un libro, tenga las cifras que tenga
       (los de diez también). */
    if (/\bisbn(?:-1[03])?[\s:.-]*$/i.test(sinCorreos.slice(Math.max(0, m.index - 16), m.index))) continue;
    if (csgLecEsTelefono(trozo)) mete('telefono', trozo);
  }
  const ocupados = [];
  csgLecNombresCasa().forEach(nombre => {
    const re = csgLecPatronNombre(nombre);
    let x;
    while ((x = re.exec(s))) {
      const a = x.index, b = a + x[0].length;
      if (ocupados.some(([p, q]) => a < q && b > p)) continue;
      ocupados.push([a, b]);
      mete('nombre', x[0]);
    }
  });
  return hallados;
}

/* ══════════════════════════════════════════════════════════════════
   csgRevisar(pieza, maquinaId): el repaso (§5, paso 3). Corre en el
   aparato, sin red, en cada tecla de la vista previa. Separa lo que PARA
   el uso (a la vista, en rojo) de lo que solo AVISA (plegado tras su
   cuenta): es la regla 12 de El Rodaje, y por la misma razón —un panel
   lleno de avisos que no importan es un panel que no se lee—.
   Cada entrada es {bloque, msg, arreglo?}. `arreglo` es lo que hace el
   chip de al lado:
     {tipo:'ir', bloque}              lleva al bloque;
     {tipo:'frase', bloque, texto}    mete una frase hecha en ese bloque;
     {tipo:'hueco', bloque, de, a}    cambia el trozo `de` por `a` (un
                                      {{hueco}}, un name bien escrito, la
                                      misma variable con su mayúscula);
     {tipo:'abrir', id}               abre la otra pieza del mismo título;
     {tipo:'molde', clase, molde}     «Duplicar en ese molde».
   Los dos últimos no estaban en el primer reparto del trabajo: los pide
   la especificación («enlace a abrirla», «Duplicar en ese molde»), y el
   mensaje se entiende igual sin chip.
   Devuelve además `palabras` (del texto armado, material incluido: es
   lo que se copia), `tokens` (a ojo: 1,4 por palabra, la proporción del
   ejemplo de la especificación) y `cabe` (si el texto va en la
   dirección de la máquina: solo las que lo admiten, y con
   CSG_PREFILL_MAX codificados). En Por lotes, `elementos` es la cuenta
   de renglones de la lista («12 elementos»).
   ══════════════════════════════════════════════════════════════════ */
function csgLecNombreHueco(s) {
  return csgLecRecorta(String(s).trim().replace(/[^a-záéíóúñ0-9_]+/gi, '_'), c => c === '_').slice(0, 40) || 'dato';
}

/* El texto de un bloque SIN su código: los renglones de un bloque entre
   ``` o ~~~ (con sus vallas) se quedan vacíos, y un trozo entre `…` en
   mitad de un renglón se vuelve espacios. Lo de dentro del código es
   LITERAL: unas llaves de Handlebars o de Jinja («{{#if nombre}}»,
   «{{ pedido.id }}») son justo lo que la persona quiere copiar tal cual,
   y el repaso las paraba como huecos que no se pueden rellenar; y un
   seudocódigo con «repite» no es la persona pidiendo un bucle. Los
   renglones se conservan (vacíos) para que lo de fuera siga en su sitio. */
function csgLecSinCodigo(t) {
  let enCodigo = false;
  return String(t == null ? '' : t).split('\n').map(l => {
    if (/^\s*(```|~~~)/.test(l)) { enCodigo = !enCodigo; return ''; }
    return enCodigo ? '' : l.replace(/`[^`\n]*`/g, x => ' '.repeat(x.length));
  }).join('\n');
}

/* Las frases hechas de un id, de todas partes donde un chip pudo
   meterlas: el vocabulario y cada molde que las sobrescribe. Quien
   cambió de molde trae en el bloque las frases del molde de antes. */
let _csgLecFrases = null;
function csgLecFrasesDe(id) {
  if (!_csgLecFrases) {
    _csgLecFrases = {};
    const mete = (k, fs) => (fs || []).forEach(f => (_csgLecFrases[k] = _csgLecFrases[k] || new Set()).add(String(f).trim()));
    Object.keys(CSG_BLOQUES).forEach(k => mete(k, CSG_BLOQUES[k].frases));
    Object.keys(CSG_MOLDES).forEach(k => (CSG_MOLDES[k].bloques || []).forEach(b => mete(b.id, b.frases)));
  }
  return _csgLecFrases[id] || new Set();
}

/* Los bloques cuyo texto tiene que ser de ESTA pieza: el repaso solo
   avisa de «hecho solo de frases hechas» en ellos (ver csgRevisar). Van
   escritos y no deducidos: es una decisión de qué significa cada bloque,
   y un bloque nuevo del vocabulario no entra aquí hasta que alguien
   decida si una frase de chip sola es ahí un hueco o una respuesta. */
const CSG_REV_PROPIOS = ['rol', 'contexto', 'tarea', 'ejemplos', 'pregunta', 'voz', 'tema', 'texto',
  'identidad', 'mision', 'meta', 'nodos', 'coordinador', 'paso', 'borrador', 'postura_a', 'postura_b'];

function csgRevisar(pieza, maquinaId) {
  const p = pieza || {};
  const para = [];
  const avisa = [];
  const moldeId = String(p.molde || '');
  /* Por la llave PROPIA: CSG_MOLDES['toString'] es una función heredada,
     y una fila tocada a mano con ese molde reventaría el repaso, que
     corre en cada tecla, con un error que no dice nada. */
  const molde = Object.prototype.hasOwnProperty.call(CSG_MOLDES, moldeId) ? CSG_MOLDES[moldeId] : null;
  const clase = molde ? molde.clase : String(p.clase || '');
  const maq = csgMaquina(maquinaId || p.maquina || '');
  const bloques = Array.isArray(p.bloques) ? p.bloques.filter(b => b && b.id) : [];
  const textoDe = id => String(csgTextoDe(p, id) || '');
  const def = id => molde ? csgBloqueDef(moldeId, id) : (CSG_BLOQUES[id] || { rotulo: id });
  const rotulo = id => {
    if (CSG_BLOQUES[id]) return def(id).rotulo;
    const b = bloques.find(x => x.id === id);
    return (b && b.rotulo) || id;
  };
  const enMolde = id => !!(molde && molde.bloques.some(b => b.id === id));
  const vistos = new Set();
  const mete = (lista, item) => {
    const k = item.bloque + '|' + item.msg;
    if (vistos.has(k)) return;
    vistos.add(k);
    lista.push(item);
  };

  /* ── LO QUE PARA ─────────────────────────────────────────────────── */

  /* Obligatorio vacío, nombrado y con un toque que lleva a él. */
  if (molde) molde.bloques.forEach(b => {
    if (!b.ob || textoDe(b.id).trim()) return;
    /* En NotebookLM el armado pone «Usa solo las fuentes del cuaderno.»
       cuando Fuentes va vacío: allí el cuaderno ES la bibliografía. */
    if (moldeId === 'fuentes' && b.id === 'fuentes' && maq.id === 'notebooklm') return;
    /* Libre existe para lo pegado que no se entiende como bloques: un
       prompt con sus propios encabezados («## Antecedentes», «## Lo que
       necesito») entra ahí como bloques libres, se arma entero, y pararlo
       con «Falta Texto» mandaba a escribir algo que ya estaba escrito. En
       Libre, Texto está si CUALQUIER bloque dice algo. */
    if (moldeId === 'libre' && b.id === 'texto' && bloques.some(x => String(x.t || '').trim())) return;
    if (clase === 'bucle' && b.id === 'tope') {
      mete(para, { bloque: 'tope', msg: 'Falta «' + rotulo('tope') + '»: sin tope no se puede usar. Un bucle sin tope es un chat que no termina.', arreglo: { tipo: 'ir', bloque: 'tope' } });
      return;
    }
    mete(para, { bloque: b.id, msg: 'Falta «' + rotulo(b.id) + '»: es obligatorio.', arreglo: { tipo: 'ir', bloque: b.id } });
  });

  /* Huecos que no se pueden rellenar. «{{}}» no tiene nombre, y
     «{{nombre del autor}}» lleva espacios: ninguno de los dos se pregunta
     al usar, así que se copiarían tal cual, con las llaves dentro (y la
     regla 6 dice que un hueco no se copia en silencio). Pero SOLO fuera
     del código (csgLecSinCodigo): dentro, las llaves son una plantilla
     que se copia a propósito, y parar el uso por ellas dejaba sin usar
     el prompt que pide justamente esa plantilla. */
  bloques.forEach(b => {
    const re = /\{\{([^{}]*)\}\}/g;
    const sinCodigo = csgLecSinCodigo(b.t);
    let m;
    while ((m = re.exec(sinCodigo))) {
      if (/^\s*[a-záéíóúñ0-9_]+\s*$/i.test(m[1])) continue;
      if (!m[1].trim()) {
        mete(para, { bloque: b.id, msg: 'En «' + rotulo(b.id) + '» hay un hueco sin nombre, «{{}}»: ponle nombre entre las llaves, o se copiaría tal cual.', arreglo: { tipo: 'ir', bloque: b.id } });
      } else {
        const bueno = '{{' + csgLecNombreHueco(m[1]) + '}}';
        /* Unas llaves con #, /, ., |, > o ! dentro son casi siempre una
           plantilla (Handlebars, Jinja) escrita fuera de su bloque de
           código, y el chip de al lado la convertiría en un hueco que no
           es: se dice cuál es la salida buena. */
        const plantilla = /[#\/.|>!(]/.test(m[1]) ? ' Si es una plantilla que se copia tal cual, ponla entre ```.' : '';
        mete(para, { bloque: b.id, msg: 'En «' + rotulo(b.id) + '», «' + m[0] + '» no se puede rellenar: un hueco lleva solo letras, cifras y _. ¿' + bueno + '?' + plantilla, arreglo: { tipo: 'hueco', bloque: b.id, de: m[0], a: bueno } });
      }
    }
  });

  /* Aristas: a un nodo que no existe, o de vuelta atrás sin tope ni en
     la arista ni en Fin (regla 12). Se leen con csgNodos y csgAristas,
     los mismos que pintan el Mermaid: si el repaso leyera las flechas de
     otra manera, diría que todo está bien de un grafo que sale punteado. */
  if (enMolde('aristas')) {
    const nodos = (csgNodos(textoDe('nodos')) || []).map(x => x.nombre);
    const conocidos = new Set(nodos.map(csgClave));
    const finTope = csgLecTieneTope(textoDe('fin'));
    const fraseTope = [...(def('fin').frases || [])].find(csgLecTieneTope) || '';
    /* UNA llamada a csgAristas para todo el bloque y no una por renglón:
       cada llamada vuelve a ordenar los nombres de todos los nodos, y con
       muchas aristas eran segundos. */
    let todas = [];
    try { todas = csgAristas(textoDe('aristas'), nodos) || []; } catch (e) { todas = []; }
    /* ⚠️ «VUELVE ATRÁS» ES UN CICLO, NO UN PUESTO EN LA LISTA DE NODOS.
       Se decidía comparando en qué renglón de Nodos estaba cada extremo, y
       un grafo sin ninguna vuelta PARABA si sus nodos se habían escrito en
       otro orden («Editor» arriba del todo): la pieza no se podía usar por
       algo que no tenía. Ahora se recorre el grafo en profundidad desde
       sus entradas (los nodos a los que no llega nadie, en el orden de las
       aristas), y vuelve atrás la arista que llega a un nodo que todavía
       está en el camino: la que CIERRA un ciclo. Una por ciclo, y no todas
       las del ciclo; y el tope vale escrito en CUALQUIER arista de ese
       ciclo (o en Fin), porque en un ida y vuelta A → B → A no hay una
       manera buena de decir cuál de las dos es «la de vuelta», y parar la
       pieza porque el tope se escribió en la otra sería pedir que lo
       escriban dos veces. Sin recursión, para que mil aristas en fila no
       agoten la pila. */
    const atras = new Map();   // arista que cierra un ciclo → las aristas de ese ciclo
    {
      const salen = new Map(), entran = new Map(), inicios = [];
      todas.forEach(a => {
        const o = csgClave(a.origen), d = csgClave(a.destino);
        if (!conocidos.has(o) || !conocidos.has(d)) return;
        if (!salen.has(o)) { salen.set(o, []); inicios.push(o); }
        salen.get(o).push({ a, d });
        entran.set(d, (entran.get(d) || 0) + 1);
      });
      const terminado = new Set();
      const enPila = new Map();   // nodo → su puesto en la pila
      const recorre = inicio => {
        const pila = [{ n: inicio, i: 0, via: null }];
        enPila.set(inicio, 0);
        while (pila.length) {
          const cima = pila[pila.length - 1];
          const ls = salen.get(cima.n) || [];
          if (cima.i >= ls.length) { terminado.add(cima.n); enPila.delete(cima.n); pila.pop(); continue; }
          const x = ls[cima.i++];
          if (enPila.has(x.d)) atras.set(x.a, pila.slice(enPila.get(x.d) + 1).map(p => p.via).concat([x.a]));
          else if (!terminado.has(x.d)) { enPila.set(x.d, pila.length); pila.push({ n: x.d, i: 0, via: x.a }); }
        }
      };
      inicios.filter(n => !entran.get(n)).forEach(n => { if (!terminado.has(n)) recorre(n); });
      inicios.forEach(n => { if (!terminado.has(n)) recorre(n); });
    }
    const conTope = a => csgLecTieneTope(String(a.linea || '') + ' ' + (a.cond || ''));
    todas.forEach(a => {
      /* `linea` es el renglón de la arista sin su viñeta: es lo que se
         nombra, y donde se busca el tope de la vuelta atrás. */
      const linea = String(a.linea || '');
      const muestra = csgLecSinVineta(linea);
      /* csgAristas dice por separado si existe cada extremo:
         `destinoConocido` (que es su `conocido`, el DESTINO, como lo define
         el §7) y `origenConocido`. Se leen los dos por su nombre, y se le
         pregunta a csgAristas en vez de volver a casar los nombres aquí: es
         la misma lectura que puntea las flechas del Mermaid, y con dos, el
         repaso daría por buena una arista que sale punteada. Con un solo sí
         o no, una arista que SALE de un nodo mal escrito y va a uno bueno
         haría decir «va a «Guionista», que no está en Nodos», que es falso
         y manda a buscar el error donde no está. */
      const destinoOk = !!a.destinoConocido;
      const origenOk = !!a.origenConocido;
      if (!destinoOk) {
        mete(para, { bloque: 'aristas', msg: 'La arista «' + muestra + '» va a «' + a.destino + '», que no está en «' + rotulo('nodos') + '»: la máquina se lo inventaría.', arreglo: { tipo: 'ir', bloque: 'aristas' } });
      }
      if (a.origen && !origenOk) {
        mete(para, { bloque: 'aristas', msg: 'La arista «' + muestra + '» sale de «' + a.origen + '», que no está en «' + rotulo('nodos') + '».', arreglo: { tipo: 'ir', bloque: 'aristas' } });
      }
      if (atras.has(a) && !atras.get(a).some(conTope) && !finTope) {
        mete(para, {
          bloque: 'aristas',
          msg: '«' + muestra + '» vuelve atrás y ni la arista ni «' + rotulo('fin') + '» dicen cuántas vueltas como mucho: sin tope, el chat no termina.',
          arreglo: fraseTope ? { tipo: 'frase', bloque: 'fin', texto: fraseTope } : { tipo: 'ir', bloque: 'fin' },
        });
      }
    });
  }

  /* SKILL.md: un frontmatter mal hecho no da error; la habilidad no
     carga nunca. Por eso el name y la description PARAN. Un {{hueco}} en
     el name se da por bueno: se rellena al usar. */
  if (molde && molde.forma === 'skill') {
    const nombre = textoDe('nombre').trim();
    if (nombre) {
      const probar = nombre.replace(/\{\{[^{}]*\}\}/g, 'x');
      const ok = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(probar) && probar.length <= 64;
      if (!ok) {
        const bueno = csgSlug(nombre);
        const porQue = probar.length > 64
          ? 'tiene ' + probar.length + ' caracteres y el tope es 64'
          : 'solo lleva minúsculas, cifras y guiones sueltos';
        mete(para, {
          bloque: 'nombre',
          msg: 'El name «' + nombre + '» no vale: ' + porQue + '. Así la habilidad no carga nunca, y no da error.' + (bueno && bueno !== nombre ? ' ¿«' + bueno + '»?' : ''),
          arreglo: bueno && bueno !== nombre ? { tipo: 'hueco', bloque: 'nombre', de: nombre, a: bueno } : { tipo: 'ir', bloque: 'nombre' },
        });
      }
    }
    /* Se mide como va a salir: en una sola línea. */
    const desc = textoDe('disparador').trim().replace(/\n/g, ' ');
    if (desc.length > 1024) {
      mete(para, { bloque: 'disparador', msg: 'La description tiene ' + csgMiles(desc.length) + ' caracteres y el tope es 1.024: recorta ' + csgMiles(desc.length - 1024) + '.', arreglo: { tipo: 'ir', bloque: 'disparador' } });
    }
  }

  /* Con ejemplos: un solo ejemplo se copia; dos distintos se generalizan. */
  if (moldeId === 'ejemplos' && textoDe('ejemplos').trim()) {
    const n = csgLecPares(textoDe('ejemplos'));
    if (n < 2) mete(para, { bloque: 'ejemplos', msg: 'Con ejemplos pide al menos dos pares «entrada → salida», y hay ' + (n ? 'uno' : 'ninguno') + ': un solo ejemplo se copia; dos distintos enseñan la regla.', arreglo: { tipo: 'ir', bloque: 'ejemplos' } });
  }

  /* Lo que no cabe en la nube (§9): los bloques NUNCA se recortan solos,
     porque son el texto de la persona; se dice cuánto sobra. Con la
     medida de la base y la frase de la franja (csgSobraBloques,
     csgTextoRecorta): el repaso y la franja hablan de la misma pieza en
     la misma pantalla, y dos números distintos serían dos mentiras. */
  const sobra = csgSobraBloques(p);
  if (sobra > 0) mete(para, { bloque: '', msg: 'No cabe en la nube: ' + csgTextoRecorta(sobra) + '.' });

  /* ── LO QUE AVISA ────────────────────────────────────────────────── */

  /* Sin Formato: la máquina elige por ti, y elige párrafos con
     introducción y despedida. Solo donde el molde lo tiene y es
     opcional (donde es obligatorio, ya PARA). En Con ejemplos no: allí
     los ejemplos SON el formato, y su «para qué» dice que Formato solo
     hace falta si la salida difiere de ellos. */
  if (enMolde('formato') && moldeId !== 'ejemplos' && !molde.bloques.find(b => b.id === 'formato').ob && !textoDe('formato').trim()) {
    mete(avisa, { bloque: 'formato', msg: 'Sin «' + rotulo('formato') + '», la máquina elige por ti, y elige párrafos con introducción y despedida.', arreglo: { tipo: 'ir', bloque: 'formato' } });
  }

  /* Bloques hechos SOLO de frases hechas: los chips hacen fácil rellenar
     por rellenar. Va en UN aviso con todos, no uno por bloque: un
     Encargo hecho a golpe de chip tendría cinco avisos iguales, y cinco
     avisos iguales no se leen. No cuenta un bloque que sigue con su texto
     inicial, ni un renglón con un {{hueco}}: ese se rellena con algo de
     esta pieza al usar.
     ⚠️ Y SOLO MIRA LOS BLOQUES QUE TIENEN QUE DECIR ALGO DE ESTA PIEZA
     (CSG_REV_PROPIOS). Mirándolos todos, saltaba en las piezas modelo del
     propio §7 —el Encargo completo avisaba de sus Reglas, su Formato, su
     Comprobación y su Tono; el Borrador y crítica, de su «Para cuando el
     crítico diga APROBADO»—, que están bien hechas: «No inventes datos; si
     no lo sabes, dilo.» es genérica A PROPÓSITO, y para eso existe su
     chip. Un aviso que sale en casi toda pieza deja de leerse. Lo que no
     puede ser de cualquiera es la tarea, el contexto, el rol, la pregunta,
     el tema, los nodos o el paso: ahí una frase de chip sola es un hueco
     sin rellenar. La etiqueta de la casa no está: es siempre la misma a
     propósito (regla 14). */
  {
    const soloFrases = [];
    bloques.forEach(b => {
      if (CSG_REV_PROPIOS.indexOf(b.id) < 0) return;
      const t = String(b.t || '').trim();
      if (!t) return;
      const ini = String(def(b.id).inicial || '').trim();
      if (ini && t === ini) return;
      const frases = csgLecFrasesDe(b.id);
      if (!frases.size) return;
      const rs = t.split('\n').map(r => r.trim().replace(/^[-•*]\s+/, '')).filter(Boolean);
      if (rs.length && rs.every(r => frases.has(r) && !/\{\{/.test(r))) soloFrases.push(b.id);
    });
    /* En el orden del molde, que es el de la pantalla: un aviso que los
       nombra en otro orden obliga a buscarlos arriba y abajo. */
    const puesto = id => { const i = molde ? molde.bloques.findIndex(b => b.id === id) : -1; return i < 0 ? 1e6 : i; };
    soloFrases.sort((a, b) => puesto(a) - puesto(b));
    if (soloFrases.length) {
      mete(avisa, {
        bloque: soloFrases[0],
        msg: (soloFrases.length === 1 ? '«' + rotulo(soloFrases[0]) + '» está hecho' : soloFrases.map(id => '«' + rotulo(id) + '»').join(', ') + ' están hechos') +
          ' solo de frases hechas: cualquiera recibiría lo mismo. ¿Dicen lo que esta consigna necesita?',
        arreglo: { tipo: 'ir', bloque: soloFrases[0] },
      });
    }
  }

  /* Datos de la casa: esto viaja a la nube y a la máquina. */
  bloques.forEach(b => {
    csgDatosDeCasa(b.t).forEach(d => {
      const nombreHueco = d.tipo === 'correo' ? 'correo' : d.tipo === 'telefono' ? 'telefono' : 'nombre';
      const que = d.tipo === 'correo' ? 'un correo' : d.tipo === 'telefono' ? 'un teléfono' : 'un nombre de la casa';
      mete(avisa, {
        bloque: b.id,
        msg: 'En «' + rotulo(b.id) + '» hay ' + que + ' (' + d.trozo + '): esto viaja a la nube y a la máquina. ¿Un {{' + nombreHueco + '}}?',
        arreglo: { tipo: 'hueco', bloque: b.id, de: d.trozo, a: '{{' + nombreHueco + '}}' },
      });
    });
  });

  /* Perplexity trae las direcciones si se le piden (§4). Solo donde hay
     un bloque de citas que lo diga: es lo que el molde de investigación
     existe para asegurar. */
  if (maq.id === 'perplexity' && enMolde('citas')) {
    const citas = textoDe('citas');
    if (citas.trim() && !/direcci[oó]n|\burl\b|enlace|\blink|v[ií]nculo|https?:/i.test(citas)) {
      const frase = [...(def('citas').frases || [])].find(f => /direcci[oó]n/i.test(f)) || '';
      mete(avisa, {
        bloque: 'citas',
        msg: 'Perplexity trae las direcciones de sus fuentes si se le piden, y «' + rotulo('citas') + '» no las pide.',
        arreglo: frase ? { tipo: 'frase', bloque: 'citas', texto: frase } : { tipo: 'ir', bloque: 'citas' },
      });
    }
  }

  /* NotebookLM enseña el texto crudo: una etiqueta ahí se lee como texto. */
  if (maq.id === 'notebooklm') {
    bloques.forEach(b => {
      const m = String(b.t || '').match(/<\/?[A-Za-z_][\w-]*>/);
      if (m) mete(avisa, { bloque: b.id, msg: 'NotebookLM enseña el texto tal cual: «' + m[0] + '», en «' + rotulo(b.id) + '», le llegará como texto. Quita las etiquetas.', arreglo: { tipo: 'ir', bloque: b.id } });
    });
  }

  /* Mismo título que otra pieza viva: casi siempre es la misma pegada dos
     veces. No para nada (dos pueden llamarse igual), pero se dice. */
  const tit = String(p.titulo || '').trim();
  if (tit) {
    const k = csgClave(tit);
    const otra = csgVivas().find(x => x && x.id !== p.id && csgClave(x.titulo || '') === k);
    if (otra) mete(avisa, { bloque: '', msg: 'Ya hay otra consigna llamada «' + otra.titulo + '».', arreglo: { tipo: 'abrir', id: otra.id } });
  }

  /* Por lotes: la lista dice que los elementos van abajo y el Material
     está vacío. Si la lista está vacía, ya PARA por obligatoria. */
  let elementos;
  if (moldeId === 'lotes') {
    const lista = textoDe('lista');
    const mat = String(p.material || '');
    const remite = /\b(?:abajo|debajo)\b|===|\bmaterial\b/i.test(lista);
    if (lista.trim() && remite && !mat.trim()) {
      mete(avisa, { bloque: 'lista', msg: '«' + rotulo('lista') + '» dice que los elementos van abajo, y el 📎 Material está vacío.', arreglo: { tipo: 'ir', bloque: 'lista' } });
    }
    elementos = (remite && mat.trim() ? mat : lista).split('\n').filter(r => r.trim()).length;
  }

  /* Pasos sin numerar en una habilidad: un paso, una acción, en orden.
     Una viñeta NO es un número: «- Lee / - Corrige / - Devuelve» no dice
     en qué orden van, y el aviso existe para eso. Solo se salta lo
     sangrado, que es una sub-viñeta de un paso. */
  if (clase === 'habilidad' && enMolde('pasos')) {
    const sueltos = textoDe('pasos').split('\n').filter(r => r.trim() && !/^\s/.test(r) && !/^\d+[.)]\s/.test(r.trim()));
    if (sueltos.length) mete(avisa, { bloque: 'pasos', msg: 'En «' + rotulo('pasos') + '» hay ' + (sueltos.length === 1 ? 'un paso' : sueltos.length + ' pasos') + ' sin número: una habilidad los sigue en orden, y el orden lo dice el número.', arreglo: { tipo: 'ir', bloque: 'pasos' } });
  }

  /* La misma variable escrita con otra mayúscula: se preguntaría dos
     veces, y una de las dos se quedaría sin rellenar. */
  {
    const formas = new Map();   // minúsculas → [{forma, bloque, exacto}]
    bloques.forEach(b => {
      const re = /\{\{\s*([a-záéíóúñ0-9_]+)\s*\}\}/gi;
      let m;
      while ((m = re.exec(String(b.t || '')))) {
        const k = m[1].toLowerCase();
        const l = formas.get(k) || [];
        if (!l.some(x => x.forma === m[1])) l.push({ forma: m[1], bloque: b.id, exacto: m[0] });
        formas.set(k, l);
      }
    });
    formas.forEach(l => {
      for (let i = 1; i < l.length; i++) {
        mete(avisa, {
          bloque: l[i].bloque,
          msg: '«{{' + l[i].forma + '}}» y «{{' + l[0].forma + '}}» son la misma variable escrita de dos maneras: se preguntaría dos veces.',
          arreglo: { tipo: 'hueco', bloque: l[i].bloque, de: l[i].exacto, a: '{{' + l[0].forma + '}}' },
        });
      }
    });
  }

  /* «Parece que se repite» (paso 6 del lector): en un prompt no se
     propone un bucle, pero se dice, con el camino para hacerlo. */
  if (clase === 'prompt') {
    let hecho = false;
    ['tarea', 'texto'].forEach(id => {
      if (hecho) return;
      const rs = csgLecSinCodigo(textoDe(id)).split('\n').filter(r => r.trim());
      const x = csgLecRepite(rs)[0];
      if (!x) return;
      hecho = true;
      mete(avisa, {
        bloque: id,
        msg: 'Parece que se repite («' + rs[x.i].trim() + '»): ¿un Bucle · ' + CSG_MOLDES[x.molde].nombre + '? · Duplicar en ese molde.',
        arreglo: { tipo: 'molde', clase: 'bucle', molde: x.molde },
      });
    });
  }

  /* ── Palabras, tokens y si cabe en la dirección ──────────────────── */
  let principal = '';
  let armadoBien = false;
  let formaArmada = '';
  try {
    const arm = csgArmar(p, maq.id, {}, {}) || {};
    principal = String(arm.principal || arm.skill || '');
    formaArmada = String(arm.forma || '');
    armadoBien = true;
  } catch (e) {
    principal = bloques.map(b => String(b.t || '')).join('\n\n') + (p.material ? '\n\n' + p.material : '');
  }
  const palabras = csgPalabras(principal);

  /* El material que trae dentro su propia marca de cierre (csgArmMaterialNeutro):
     el armado la escapa, y lo que se ve en la vista previa y se copia
     lleva un «&lt;» o una barra que la persona no escribió. Se dice aquí,
     o la persona creería que el armado le estropeó el texto. */
  if (armadoBien && csgMaterialTraeCierre(p.material, formaArmada === 'xml' ? 'xml' : 'marcas')) {
    mete(avisa, {
      bloque: '',
      msg: 'El 📎 Material trae dentro su propia marca de cierre (' + (formaArmada === 'xml' ? '«</material>»' : '«=== Fin del material ===»') +
        '): al armar se escapa, para que la máquina no lo lea cortado.',
    });
  }

  /* Más de 1.500 palabras de CONSIGNA: el material no cuenta, porque el
     material «no se repasa» y un informe de cinco mil palabras pegado
     debajo es para lo que existe; lo largo que se lee a medias es la
     orden, no el texto al que se aplica. */
  let palabrasConsigna = palabras;
  if (armadoBien && String(p.material || '').trim()) {
    try {
      const sin = csgArmar(Object.assign({}, p, { material: '' }), maq.id, {}, {}) || {};
      palabrasConsigna = csgPalabras(String(sin.principal || sin.skill || ''));
    } catch (e) { palabrasConsigna = palabras; }
  }
  if (palabrasConsigna > 1500) {
    mete(avisa, { bloque: '', msg: 'La consigna pasa de 1.500 palabras (≈ ' + csgMiles(palabrasConsigna) + '): una orden tan larga se sigue a medias, y lo que se pierde es lo del final.' });
  }

  const cabe = !!(maq.abrir && maq.param) && encodeURIComponent(principal).length <= CSG_PREFILL_MAX;
  const r = { para, avisa, palabras, tokens: Math.round(palabras * 1.4), cabe };
  if (elementos !== undefined) r.elementos = elementos;
  return r;
}

/* ══════════════════════════════════════════════════════════════════
   LA NUBE Y EL APARATO (§9): local primero, nube después, y la causa
   se nombra.
   ──────────────────────────────────────────────────────────────────
   Calcado de 📓 Cuadernos (rcuBajar, rcuSubir, rcuSubirPendientes…) y
   de La Voz Prestada (la base que va vieja, las lápidas que se quedan
   en el aparato). Lo que esta herramienta añade a ese patrón, y por qué:

   · LA PODA POR BYTES (csgPodar). La bitácora y las versiones CRECEN
     solas, y los `check` de consigna.sql tienen tope. Sin podar antes,
     el día que una pieza muy usada pase de 60.000 caracteres de
     bitácora el upsert rebotaría con un 23514 que habla de un
     «check constraint» y no de usos viejos: el síntoma más lejano
     posible de la causa. Se poda antes de guardar y antes de subir.
   · LA FUSIÓN POR UNIÓN (csgFusiona). Un uso apuntado en la tableta y
     otro apuntado en la computadora son dos cosas que pasaron; si la
     fila entera la ganara el reloj más nuevo, una de las dos se
     borraría sin que nadie la hubiera tocado (regla 11).
   · LA FIRMA QUE ESPERA (csgAutor). Ninguna fila viaja sin `autor`: la
     que no tiene firma se guarda aquí, lo dice, y sube en cuanto hay
     sesión. Es la lección del 10 de septiembre de La Voz Prestada
     (regla 13): una escritura que la base rechaza se ve desde fuera
     igual que un problema de señal.

   Nada de esto toca el DOM al cargarse: solo declara. Las funciones de
   red usan el cliente de csgSb() cuando se las llama, y la prueba de
   Node las corre con un cliente de mentira.
   ══════════════════════════════════════════════════════════════════ */

const CSG_TABLA       = 'consigna_piezas';
const CSG_ESPERA_MAX  = 8000;                  // ms: la petición que no vuelve, no vuelve
const CSG_RESPIRO     = 2000;                  // ms: subir después de dejar de escribir
const CSG_LAPIDA_MS   = 180 * 86400000;        // seis meses, como lecturas_marcas
/* Los márgenes de la poda: el check de la base dice 60.000 y 200.000,
   y se poda a 58.000 y 198.000 para que un redondeo o un campo que
   crece después (la nota de un uso que se contesta) no la empuje por
   encima justo en el viaje. */
const CSG_PODA_BITACORA  = 58000;
const CSG_PODA_VERSIONES = 198000;
const CSG_BITACORA_MAX   = 200;               // usos que se conservan
const CSG_VERSIONES_CON  = 10;                // versiones que conservan sus bloques

let _csgLista       = [];          // todas, incluidas las retiradas (lápida)
let _csgCargada     = false;
let _csgNube        = 'mirando';   // mirando | puesta | sin-tabla | sin-senal | sin-sesion | vieja
let _csgHayTabla    = false;
let _csgColsFuera   = [];          // columnas que la base vieja no tiene (42703)
let _csgInitEnCurso = null;
let _csgLuego       = {};          // id → { t, esperan: [resolver], local, soloUsos } de csgSubirLuego
let _csgSinEspacio  = false;       // el último guardado en el aparato rebotó por el almacén lleno

/* ── Pequeños ayudantes ────────────────────────────────────────────── */

/* Un solo cliente de Supabase en toda la aplicación (CLAUDE.md): el de
   auth.js. Crear otro aquí es la avería larga y cara que está escrita
   en ese archivo. */
function csgSb() {
  if (typeof _sb !== 'undefined' && _sb) return _sb;
  return (typeof window !== 'undefined' && window && window.faroSb) || null;
}

/* El identificador NACE EN EL APARATO: la subida se reintenta, y sin un
   identificador propio el segundo intento dejaría una pieza gemela. Los
   seis del final se rellenan a mano porque `Math.random().toString(36)`
   a veces devuelve menos cifras, y el id tiene que caber en el check
   de la base (entre 4 y 60) siempre igual. */
function csgNuevoId(prefijo) {
  const azar = (Math.random().toString(36).slice(2) + '000000').slice(0, 6);
  return (prefijo || 'csg') + '-' + Date.now().toString(36) + '-' + azar;
}

/* Cuántos caracteres cuenta PostgreSQL en un texto: puntos de código,
   no unidades de JavaScript. Un emoji son dos para `s.length` y uno
   para `length()` de la base; contar con `s.length` a secas no rompe
   nada (sobra margen), pero haría decir «no cabe» a una pieza que sí. */
function csgLargoTexto(s) {
  s = String(s == null ? '' : s);
  const pares = s.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
  return s.length - (pares ? pares.length : 0);
}

/* Cortar por puntos de código, no por unidades: cortar un emoji por la
   mitad deja medio par suelto, y PostgreSQL rechaza el texto entero. */
function csgCorta(s, n) {
  s = String(s == null ? '' : s);
  if (csgLargoTexto(s) <= n) return s;
  return Array.from(s).slice(0, n).join('');
}

/* ⚠️ LO QUE MIDE EL CHECK NO ES `JSON.stringify(x).length`.
   El check es `length(bloques::text)`, y `jsonb::text` escribe «": "»
   y «", "» con su espacio: `[{"a":1,"b":2}]` son 15 caracteres en
   JavaScript y 17 en la base (comprobado contra el PostgreSQL de la
   sesión, con un emoji dentro: 46 contra 51). En una bitácora de 200
   usos con seis campos cada uno son ~2.400 caracteres de más, y el
   margen de la poda (58.000 contra 60.000) es de 2.000: medida con
   JSON.stringify, una bitácora «podada» rebotaría igual con un 23514.
   Así que se mide como mide la base: su misma forma, y en puntos de
   código. Las claves de un objeto salen en otro orden en la base, pero
   el largo es el mismo. */
function csgLargoBase(v) {
  if (v === null || v === undefined) return 4;                  // null
  if (Array.isArray(v)) {
    if (!v.length) return 2;
    let n = 2 + 2 * (v.length - 1);
    for (let i = 0; i < v.length; i++) {
      const x = v[i];
      n += (x === undefined || typeof x === 'function') ? 4 : csgLargoBase(x);
    }
    return n;
  }
  if (typeof v === 'object') {
    const ks = Object.keys(v).filter(k => v[k] !== undefined && typeof v[k] !== 'function');
    if (!ks.length) return 2;
    let n = 2 + 2 * (ks.length - 1);
    for (const k of ks) n += csgLargoTexto(JSON.stringify(k)) + 2 + csgLargoBase(v[k]);
    return n;
  }
  if (typeof v === 'string') return csgLargoTexto(JSON.stringify(v));
  if (typeof v === 'number') return isFinite(v) ? String(JSON.stringify(v)).length : 4;
  if (typeof v === 'boolean') return v ? 4 : 5;
  return 4;
}

/* Promise.race con reloj propio: medido en La Voz Prestada, cuando la
   petición NO VUELVE —no cuando falla: cuando no vuelve— el cliente de
   Supabase no devuelve error ni lanza, se queda pendiente para siempre,
   y la rama que dice «sin señal» no correría nunca. El reloj no cancela
   la petición; solo deja de esperarla. Y se apaga cuando la respuesta
   llega, para no dejar ocho segundos de reloj vivo por cada viaje.
   Si la petición LANZA (un fetch que revienta en algún cliente), se
   convierte en el mismo {data:null, error}: también es la señal. */
function csgConReloj(peticion, ms) {
  let reloj = null;
  const espera = new Promise(res => {
    reloj = setTimeout(() => res({
      data: null, error: { code: 'FARO_RELOJ', message: 'la petición no volvió' },
    }), ms || CSG_ESPERA_MAX);
  });
  const viaje = Promise.resolve(peticion).then(
    r => { clearTimeout(reloj); return r || { data: null, error: null }; },
    e => { clearTimeout(reloj); return { data: null, error: { code: 'FARO_RED', message: String((e && e.message) || e) } }; });
  return Promise.race([viaje, espera]);
}

/* ⚠️ QUIÉN FIRMA, Y DE DÓNDE SE SACA. Tres fuentes, en este orden:
   1. la sesión comprobada (`verificarSesion()`, de auth.js);
   2. el identificador que auth.js recuerda en el aparato
      (`faro.miembro`, AUTH_MIEMBRO_KEY) para pintar al instante
      mientras comprueba la sesión — sin él, en los primeros segundos de
      cada arranque con mala señal todo lo guardado se quedaría «sin
      firma» aunque la persona lleve meses dentro;
   3. nada: '' — y entonces la pieza se guarda aquí y NO se sube.
   Firmar con lo recordado no abre ninguna puerta: quien manda sobre la
   escritura es la seguridad por fila con el token de verdad. */
function csgAutor() {
  try {
    if (typeof verificarSesion === 'function') {
      const s = verificarSesion();
      if (s && s.user) return csgCorta(String(s.user), CSG_TOPES.autor);
    }
  } catch (e) {}
  try {
    const clave = (typeof AUTH_MIEMBRO_KEY !== 'undefined') ? AUTH_MIEMBRO_KEY : 'faro.miembro';
    const crudo = localStorage.getItem(clave);
    if (crudo) {
      let u = '';
      try { const m = JSON.parse(crudo); u = (m && typeof m === 'object') ? (m.user || '') : (typeof m === 'string' ? m : ''); }
      catch (e) { u = /^[a-z0-9_.-]{1,40}$/i.test(crudo) ? crudo : ''; }
      /* Si la casa tiene su lista de miembros, un identificador que no
         está en ella no firma: es lo mismo que hace `_miembroRecordado`. */
      if (u && (typeof MIEMBROS === 'undefined' || !MIEMBROS || MIEMBROS[u])) return csgCorta(String(u), CSG_TOPES.autor);
    }
  } catch (e) {}
  return '';
}

/* ── La pieza: de la fila al aparato y del aparato a la fila ──────── */

function csgNum(x, def) { const n = Number(x); return isFinite(n) ? n : (def || 0); }

function csgBloquesLimpios(v) {
  return Array.isArray(v)
    ? v.filter(b => b && typeof b === 'object' && b.id)
       .map(b => ({ id: String(b.id), rotulo: String(b.rotulo == null ? '' : b.rotulo), t: String(b.t == null ? '' : b.t) }))
    : [];
}

/* ⚠️ CUÁNTO SOBRA DE LOS BLOQUES, Y SE DICE IGUAL EN TODAS PARTES. Lo
   miden la poda, la franja de la nube y el repaso, y los tres con esto:
   lo que de verdad viaja (csgBloquesLimpios) medido como lo mide la base
   (csgLargoBase). El repaso medía con JSON.stringify, que se queda
   corto —jsonb::text escribe «": "» y «", "» con su espacio—, así que
   una pieza de 60.005 para la base era de 60.000 para el repaso: la
   franja decía «no cabe» y el repaso no paraba nada, o decían dos
   números distintos de la misma pieza en la misma pantalla. */
function csgSobraBloques(p) {
  return Math.max(0, csgLargoBase(csgBloquesLimpios(p && p.bloques)) - CSG_TOPES.bloques);
}
function csgTextoRecorta(n) {
  return 'recorta ' + csgMiles(n) + (n === 1 ? ' carácter' : ' caracteres');
}
function csgUsoLimpio(u) {
  const ok = (u.ok === 'si' || u.ok === 'regular' || u.ok === 'no') ? u.ok : null;
  return {
    uid: String(u.uid), t: csgNum(u.t), maquina: String(u.maquina || ''),
    v: Math.max(1, Math.round(csgNum(u.v, 1))), ok, nota: String(u.nota || ''),
  };
}
function csgVersionLimpia(x) {
  const o = { vid: String(x.vid), v: Math.max(1, Math.round(csgNum(x.v, 1))), t: csgNum(x.t) };
  if (Array.isArray(x.bloques)) o.bloques = csgBloquesLimpios(x.bloques);
  return o;
}

/* Normaliza cualquier cosa que llegue —una fila de la base o una pieza
   guardada en el aparato— a la forma de la pieza. Es UN solo normalizador
   a propósito: con dos, el día que se añada un campo se pone en uno y el
   otro lo tira. Lo que es solo del aparato (`subida`, `noCabe`,
   `motivo`) se conserva si viene; una fila de la base no lo trae, y
   entonces es que YA está subida. */
function csgDesdeFila(f) {
  const p = {
    id: String(f.id),
    clase: String(f.clase || 'prompt'),
    molde: String(f.molde || ''),
    /* ⚠️ El «(sin título)» lo pone csgAFila para cumplir el check de la
       base; al volver es un hueco, no un título. Sin esto, un borrador
       sin título volvía de la nube titulado «(sin título)»: el compositor
       ya no se lo proponía desde la Tarea (el campo no estaba vacío), dos
       borradores así se avisaban como «mismo título» y el export lo
       enseñaba como si alguien lo hubiera escrito. */
    titulo: f.titulo === CSG_SIN_TITULO ? '' : String(f.titulo || ''),
    maquina: String(f.maquina || ''),
    bloques: csgBloquesLimpios(f.bloques),
    material: String(f.material || ''),
    estantes: Array.isArray(f.estantes) ? f.estantes.filter(x => typeof x === 'string') : [],
    cuaderno: String(f.cuaderno || ''),
    notas: String(f.notas || ''),
    bitacora: Array.isArray(f.bitacora) ? f.bitacora.filter(u => u && typeof u === 'object' && u.uid).map(csgUsoLimpio) : [],
    versiones: Array.isArray(f.versiones) ? f.versiones.filter(x => x && typeof x === 'object' && x.vid).map(csgVersionLimpia) : [],
    version: Math.max(1, Math.round(csgNum(f.version, 1))),
    usos: Math.max(0, Math.round(csgNum(f.usos))),
    ultima: csgNum(f.ultima),
    autor: String(f.autor || ''),
    eliminado: !!f.eliminado,
    eliminado_at: f.eliminado_at || null,
    actualizado: csgNum(f.actualizado),
    subida: ('subida' in f) ? !!f.subida : true,
  };
  if (f.noCabe) p.noCabe = true;
  if (f.motivo) p.motivo = String(f.motivo);
  return p;
}

/* La fila que viaja. Cada campo va cortado a su check, para que la base
   no rebote nunca con un mensaje que habla de otra cosa; y las columnas
   que la base vieja no tiene (42703) NO se mandan: rebotaría el upsert
   entero por una sola. Se quitan de TODAS las filas por igual, porque en
   un upsert de varias filas una clave que falte en una se manda como
   null, y un null en una columna `not null` rebota también. */
function csgAFila(p) {
  const titulo = csgCorta(String(p.titulo || '').trim(), CSG_TOPES.titulo) || CSG_SIN_TITULO;
  const material = String(p.material || '');
  /* ⚠️ `eliminado_at` es un timestamptz. Todos los demás relojes de la
     pieza son milisegundos, y quien retire poniendo `Date.now()` —lo
     natural aquí— mandaría un número que PostgreSQL rechaza; y como el
     upsert va en un solo viaje, esa fila tumbaba el lote entero. Se manda
     siempre como fecha ISO. */
  const ea = p.eliminado_at;
  const eliminadoAt = !p.eliminado ? null
    : (typeof ea === 'number' && isFinite(ea)) ? new Date(ea).toISOString()
    : (typeof ea === 'string' && ea && !isNaN(Date.parse(ea))) ? ea
    : new Date().toISOString();
  const f = {
    id: p.id,
    clase: csgCorta(p.clase || 'prompt', CSG_TOPES.clase),
    molde: csgCorta(p.molde || 'libre', CSG_TOPES.molde),
    titulo,
    maquina: csgCorta(p.maquina || '', CSG_TOPES.maquina),
    bloques: csgBloquesLimpios(p.bloques),
    /* ⚠️ El material de más de 20.000 NO viaja (§9, paso 4): se queda
       en el borrador del compositor. csgPodar ya lo vació en la pieza;
       esto es el cinturón por si alguien sube sin podar. */
    material: csgLargoTexto(material) > CSG_TOPES.material ? '' : material,
    estantes: (p.estantes || []).map(e => csgCorta(e, CSG_TOPES.estante)).slice(0, CSG_TOPES.estantes_n),
    cuaderno: csgCorta(p.cuaderno || '', CSG_TOPES.cuaderno),
    notas: csgCorta(p.notas || '', CSG_TOPES.notas),
    bitacora: (p.bitacora || []).map(u => { const o = csgUsoLimpio(u); o.nota = csgCorta(o.nota, CSG_TOPES.nota_uso); return o; }),
    versiones: (p.versiones || []).map(csgVersionLimpia),
    version: Math.min(CSG_TOPES.version, Math.max(1, Math.round(csgNum(p.version, 1)))),
    usos: Math.max(0, Math.round(csgNum(p.usos))),
    ultima: Math.round(csgNum(p.ultima)),
    autor: csgCorta(p.autor || '', CSG_TOPES.autor),
    eliminado: !!p.eliminado,
    eliminado_at: eliminadoAt,
    actualizado: Math.round(csgNum(p.actualizado) || Date.now()),
  };
  _csgColsFuera.forEach(c => { if (c !== 'id') delete f[c]; });
  return f;
}

/* ── La poda por bytes (§9) ─────────────────────────────────────────
   Antes de guardar en el aparato y antes de cada upsert. Muta la pieza
   y devuelve lo que hizo, para que la pantalla lo DIGA: «se plegaron 3
   versiones viejas», «no cabe: recorta 1.204 caracteres», «el material
   no se guardó». Una poda callada se descubre buscando una versión que
   ya no está. */
function csgPodar(p) {
  const r = { plegadas: 0, descartadas: 0, usosFuera: 0, noCabe: false, sobra: 0, material: 0 };
  if (!p || typeof p !== 'object') return r;

  /* 1. La bitácora: los más recientes primero; cada nota a 300; 200
     como mucho; y mientras no quepa, fuera el más viejo SIN CONTESTAR
     —un uso sin contestar es el que menos dice— y, si no queda ninguno,
     el más viejo. Nunca se toca `usos`: el contador dice cuántas veces
     se usó, aunque ya no quede el detalle de cada una. */
  let bit = (p.bitacora || []).filter(u => u && typeof u === 'object' && u.uid).map(u => {
    const o = csgUsoLimpio(u); o.nota = csgCorta(o.nota, CSG_TOPES.nota_uso); return o;
  });
  bit.sort((a, b) => b.t - a.t);
  if (bit.length > CSG_BITACORA_MAX) { r.usosFuera += bit.length - CSG_BITACORA_MAX; bit = bit.slice(0, CSG_BITACORA_MAX); }
  let largo = csgLargoBase(bit);
  while (bit.length && largo > CSG_PODA_BITACORA) {
    let i = -1;
    for (let k = bit.length - 1; k >= 0; k--) if (bit[k].ok === null) { i = k; break; }
    if (i < 0) i = bit.length - 1;
    largo -= csgLargoBase(bit[i]) + (bit.length > 1 ? 2 : 0);
    bit.splice(i, 1);
    r.usosFuera++;
  }
  p.bitacora = bit;

  /* 2. Las versiones: solo las diez más recientes conservan sus bloques;
     y MANDA EL BYTE, no la cuenta: diez versiones de 60.000 no caben en
     200.000. Mientras no quepa, se pliega la más vieja que aún tenga
     bloques; si ya no tiene ninguna, se descarta la más vieja. */
  let ver = (p.versiones || []).filter(x => x && typeof x === 'object' && x.vid).map(csgVersionLimpia);
  ver.sort((a, b) => (b.t - a.t) || (b.v - a.v));
  ver.forEach((x, i) => {
    if (i >= CSG_VERSIONES_CON && x.bloques) { delete x.bloques; r.plegadas++; }
  });
  while (ver.length && csgLargoBase(ver) > CSG_PODA_VERSIONES) {
    let i = -1;
    for (let k = ver.length - 1; k >= 0; k--) if (ver[k].bloques) { i = k; break; }
    if (i >= 0) { delete ver[i].bloques; r.plegadas++; }
    else { ver.pop(); r.descartadas++; }
  }
  p.versiones = ver;

  /* 3. Los bloques NUNCA se recortan: son el texto de la persona. Lo que
     no cabe se guarda aquí con `noCabe`, no se sube, y la franja de la
     nube nombra la pieza y lo que sobra. */
  p.bloques = csgBloquesLimpios(p.bloques);
  const sobra = csgSobraBloques(p);
  if (sobra > 0) {
    p.noCabe = true; p.motivo = 'no-cabe';
    r.noCabe = true; r.sobra = sobra;
  } else {
    delete p.noCabe;
    if (p.motivo === 'no-cabe') delete p.motivo;
  }

  /* 4. El material de más de 20.000 NO se guarda, ni aquí ni en la
     nube: se vacía en la pieza y queda en el borrador del compositor y
     en la hoja de Usar (§5, paso 4: «lo guardado, o lo que quedó en el
     borrador si no cabía»). `r.material` dice cuánto sobraba. */
  const lm = csgLargoTexto(p.material || '');
  if (lm > CSG_TOPES.material) { r.material = lm - CSG_TOPES.material; p.material = ''; }

  /* 5. Estantes: 12 de 40 como mucho, sin repetidos por su clave
     («Maestría» y «maestria» son el mismo), y dentro del check de 1.000
     aunque vengan llenos de comillas, que la base escribe escapadas. */
  const vistos = new Set();
  let est = [];
  (p.estantes || []).forEach(e => {
    const t = csgCorta(String(e == null ? '' : e).trim().replace(/\s+/g, ' '), CSG_TOPES.estante);
    const k = csgClave(t);
    if (!t || vistos.has(k)) return;
    vistos.add(k); est.push(t);
  });
  est = est.slice(0, CSG_TOPES.estantes_n);
  while (est.length && csgLargoBase(est) > CSG_TOPES.estantes) est.pop();
  p.estantes = est;
  p.notas = csgCorta(p.notas || '', CSG_TOPES.notas);
  return r;
}

/* ── Guardado en el aparato ────────────────────────────────────────── */

function csgLeeLocal() {
  try {
    const d = JSON.parse(localStorage.getItem(CSG_CLAVES.piezas));
    const v = Array.isArray(d) ? d : (d && Array.isArray(d.piezas) ? d.piezas : []);
    return v.filter(p => p && typeof p === 'object' && p.id).map(csgDesdeFila);
  } catch (e) { return []; }
}

/* ⚠️ LA COPIA DEL APARATO GUARDA TAMBIÉN LAS LÁPIDAS, seis meses. Es la
   mitad escondida de La Voz Prestada (su regla 12): si la subida de la
   lápida había fallado y la copia de aquí la hubiera olvidado, en el
   arranque siguiente la nube devolvería la pieza viva sin nadie que la
   contradijera, y resucitaría. Pasados seis meses se barren, como
   hace la higiene de la nube; y si la lista en memoria todavía no se
   leyó, se lee antes: guardar sin haber leído PISARÍA el aparato entero
   con una lista vacía. */
/* ⚠️ Y UNA LÁPIDA QUE NUNCA LLEGÓ A LA NUBE NO SE BARRE, tenga los meses
   que tenga: barrerla es exactamente la resurrección que existe para
   impedir, porque la fila viva que siga en la nube volvería en el
   arranque siguiente sin nadie que la contradijera. Se barre cuando ya
   subió; mientras tanto espera, como espera cualquier otra pieza.
   ⚠️ Y SI EL APARATO NO TIENE SITIO, SE SABE. El origen se comparte con La
   Voz Prestada, que guarda ensayos enteros, y una pieza con diez
   versiones puede pasar de 300.000 caracteres: el `setItem` revienta con
   QuotaExceededError. Antes se tragaba en silencio y quien guardaba
   seguía como si nada; si además la nube fallaba, al cerrar la pieza se
   perdía sin un solo aviso. Ahora devuelve false, y la cuota queda
   apuntada (`_csgSinEspacio`) para que la franja la nombre. */
function csgGuardaLocal() {
  try {
    if (!_csgCargada) { _csgLista = csgFusionaLocal(csgLeeLocal(), _csgLista); _csgCargada = true; }
    const limite = Date.now() - CSG_LAPIDA_MS;
    const enMemoria = new Set(_csgLista.map(p => p.id));
    const lapidasViejas = csgLeeLocal().filter(p => p.eliminado && !enMemoria.has(p.id));
    const todas = _csgLista.concat(lapidasViejas)
      .filter(p => !p.eliminado || (p.actualizado || 0) > limite || p.subida === false);
    todas.forEach(csgPodar);
    localStorage.setItem(CSG_CLAVES.piezas, JSON.stringify({ piezas: todas }));
    _csgSinEspacio = false;
    return true;
  } catch (e) {
    if (csgEsCuota(e)) _csgSinEspacio = true;
    return false;
  }
}

/* ¿Es el almacén lleno? Cada navegador lo dice a su manera: el nombre
   (QuotaExceededError, o NS_ERROR_DOM_QUOTA_REACHED en Firefox) y los
   códigos viejos (22 y 1014). */
function csgEsCuota(e) {
  if (!e) return false;
  return e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014 ||
    /quota/i.test(String(e.message || ''));
}

/* Copia lo de `fuente` DENTRO de `destino` y devuelve `destino`: el
   objeto sigue siendo el mismo, y cualquier referencia que tuviera la
   pantalla ve lo nuevo (ver csgFusiona). */
function csgPisa(destino, fuente) {
  Object.keys(destino).forEach(k => { if (!(k in fuente)) delete destino[k]; });
  return Object.assign(destino, fuente);
}

/* Dos listas del mismo aparato: gana el `actualizado`. Solo la usa
   csgGuardaLocal (y el arranque) para no perder lo que ya había escrito.
   `b` es la lista EN MEMORIA: si lo guardado es más nuevo, se copia
   dentro de su objeto en vez de cambiarle el objeto, por lo mismo que en
   csgFusiona. A igualdad de reloj gana la memoria, como antes. */
function csgFusionaLocal(a, b) {
  const m = new Map();
  (a || []).forEach(p => {
    if (!p || !p.id) return;
    const ya = m.get(p.id);
    if (!ya || (p.actualizado || 0) >= (ya.actualizado || 0)) m.set(p.id, p);
  });
  (b || []).forEach(p => {
    if (!p || !p.id) return;
    const ya = m.get(p.id);
    if (ya && ya !== p && (ya.actualizado || 0) > (p.actualizado || 0)) csgPisa(p, ya);
    m.set(p.id, p);
  });
  return [...m.values()];
}

/* ── La fusión con la nube (§9) ─────────────────────────────────────
   ⚠️ ESCALARES POR RELOJ; USOS Y VERSIONES POR UNIÓN (regla 11).
   · Los escalares (título, bloques, material, estantes, máquina, notas,
     cuaderno, version, eliminado…) los gana el `actualizado` más nuevo,
     como en la repisa, en Redes y en Cuadernos. Con empate gana la nube:
     es lo que ya vieron los demás aparatos.
   · La bitácora y las versiones se juntan por su `uid`/`vid`. Un uso
     con `ok` puesto gana a uno con `null` del mismo `uid`: contestar
     «¿sirvió?» en el teléfono no se deshace porque la tableta, que no
     se enteró, tenga el reloj más nuevo por otra cosa.
   · `usos` es el mayor de los dos y nunca menos que la bitácora: un uso
     apuntado es un uso, lo sepa o no el contador del otro aparato.
   · Si el resultado trae algo que la nube no tiene, se marca
     `subida: false` para que csgSubirPendientes lo suba aunque su reloj
     no sea más nuevo que el de la nube: si no, los usos de este aparato
     no llegarían nunca a los otros.
   · Una columna que la base vieja no devolvió (42703) no pisa lo del
     aparato: no traerla no es traerla vacía. */
function csgFusiona(local, nube) {
  const m = new Map();
  (local || []).forEach(p => { if (p && p.id) m.set(p.id, p); });
  (nube || []).forEach(f => {
    if (!f || !f.id) return;
    const n = csgDesdeFila(f);
    const l = m.get(n.id);
    if (!l) { m.set(n.id, n); return; }

    const nubeGana = (n.actualizado || 0) >= (l.actualizado || 0);
    const base = nubeGana ? n : l;
    const otra = nubeGana ? l : n;
    const r = csgDesdeFila(Object.assign({}, base));
    /* Lo que la base vieja no devolvió se queda como estaba aquí. */
    if (nubeGana) {
      Object.keys(r).forEach(k => {
        if (k !== 'subida' && k !== 'noCabe' && k !== 'motivo' && !(k in f) && (k in l)) r[k] = l[k];
      });
    }

    /* La bitácora, por unión de uid. */
    const usos = new Map();
    const pon = (u, deBase) => {
      const ya = usos.get(u.uid);
      if (!ya) { usos.set(u.uid, csgUsoLimpio(u)); return; }
      if (ya.ok === null && u.ok !== null) usos.set(u.uid, csgUsoLimpio(u));
      else if (ya.ok !== null && u.ok !== null && deBase) usos.set(u.uid, csgUsoLimpio(u));
    };
    (otra.bitacora || []).forEach(u => pon(u, false));
    (base.bitacora || []).forEach(u => pon(u, true));
    r.bitacora = [...usos.values()].sort((a, b) => b.t - a.t);

    /* Las versiones, por unión de vid; la que aún tiene bloques gana. */
    const vers = new Map();
    (otra.versiones || []).concat(base.versiones || []).forEach(x => {
      const ya = vers.get(x.vid);
      if (!ya || (!ya.bloques && x.bloques)) vers.set(x.vid, csgVersionLimpia(x));
    });
    r.versiones = [...vers.values()].sort((a, b) => (b.t - a.t) || (b.v - a.v));

    /* ⚠️ EL NÚMERO DE VERSIÓN NO RETROCEDE, Y EL TEXTO QUE PIERDE NO SE
       PIERDE (regla 10). `version` era un escalar más y lo ganaba el
       reloj: con la tableta corrigiendo la v1 y el teléfono ya en la v2
       (con su 👍), la fusión dejaba la pieza en la v1 y el texto de la v2
       no estaba en ninguna parte; el 👍 hablaba de un texto perdido, y la
       corrección siguiente fabricaba OTRA v2, que heredaba ese 👍 sin
       merecerlo. Ahora el número es el mayor de los dos; y si el lado que
       pierde tenía otro texto en una versión más alta —o en la misma,
       usada allí y no aquí—, ese texto se guarda como versión, con un vid
       DETERMINISTA (los dos aparatos, fusionando cada uno por su lado,
       fabrican el mismo, y la unión no lo duplica), y lo que gana pasa a
       ser la versión siguiente. */
    const vBase = Math.max(1, Math.round(csgNum(r.version, 1)));
    const vOtra = Math.max(1, Math.round(csgNum(otra.version, 1)));
    r.version = Math.max(vBase, vOtra);
    const textoDistinto = JSON.stringify(csgBloquesLimpios(otra.bloques)) !== JSON.stringify(csgBloquesLimpios(r.bloques));
    const usadaSoloAlla = () => {
      const aqui = new Set((base.bitacora || []).map(u => u && u.uid));
      return (otra.bitacora || []).some(u => u && !aqui.has(u.uid) && Math.round(csgNum(u.v, 1)) === vOtra);
    };
    if (textoDistinto && (vOtra > vBase || (vOtra === vBase && usadaSoloAlla()))) {
      const vid = 'v-' + n.id + '-' + vOtra + '-' + Math.round(csgNum(otra.actualizado));
      if (!r.versiones.some(x => x.vid === vid)) {
        r.versiones.push({ vid, v: vOtra, t: Math.round(csgNum(otra.actualizado)), bloques: csgBloquesLimpios(otra.bloques) });
        r.versiones.sort((a, b) => (b.t - a.t) || (b.v - a.v));
      }
      r.version = Math.max(vBase, vOtra) + 1;
    }

    r.usos = Math.max(l.usos || 0, n.usos || 0, r.bitacora.length);
    /* `ultima` es cuándo se usó por última vez: no puede ser anterior
       al uso más reciente que ya está en la bitácora. */
    r.ultima = Math.max(r.ultima || 0, r.bitacora.length ? r.bitacora[0].t : 0);
    r.actualizado = Math.max(l.actualizado || 0, n.actualizado || 0);

    /* ¿Trae algo que la nube no tiene? Entonces hay que subirlo. */
    const nUsos = new Map((n.bitacora || []).map(u => [u.uid, u.ok]));
    const nVers = new Map((n.versiones || []).map(x => [x.vid, !!x.bloques]));
    const hayMas = !nubeGana
      || r.version !== n.version
      || r.usos !== n.usos
      || r.bitacora.some(u => !nUsos.has(u.uid) || (nUsos.get(u.uid) === null && u.ok !== null))
      || r.versiones.some(x => !nVers.has(x.vid) || (!nVers.get(x.vid) && !!x.bloques));
    r.subida = !hayMas;
    if (nubeGana) { delete r.noCabe; delete r.motivo; }
    else { if (l.noCabe) r.noCabe = true; if (l.motivo) r.motivo = l.motivo; }
    if (r.subida) delete r.motivo;
    /* ⚠️ Y SE ESCRIBE DENTRO DEL OBJETO QUE YA HABÍA, sin cambiarle el
       objeto a la lista. La pantalla guarda referencias a sus piezas —la
       hoja de Usar abierta, el compositor—, y con un objeto nuevo esas
       referencias quedaban huérfanas: el primer csgSubirLuego con una de
       ellas volvía a meter la copia vieja en la lista y subía la fila de
       ANTES de la fusión entera, y un uso apuntado sobre ella ni siquiera
       se guardaba en el aparato. */
    m.set(n.id, csgPisa(l, r));
  });
  return [...m.values()];
}

/* ── La nube ───────────────────────────────────────────────────────── */

function csgColumnas() {
  return CSG_COLUMNAS.split(',').filter(c => _csgColsFuera.indexOf(c) < 0).join(',');
}

/* ¿Qué columna nombra el error? PostgREST lo dice de dos maneras según
   el viaje: «column consigna_piezas.material does not exist» (42703, al
   leer) y «Could not find the 'material' column of 'consigna_piezas' in
   the schema cache» (PGRST204, al escribir). Solo se acepta una columna
   de la lista: quitar otra cosa no arreglaría nada y volvería a
   rebotar. */
function csgColumnaDelError(error) {
  if (!error) return '';
  const esCol = error.code === '42703' || error.code === 'PGRST204'
    || /column .* does not exist|could not find the .* column/i.test(error.message || '');
  if (!esCol) return '';
  const msg = String(error.message || '') + ' ' + String(error.details || '');
  const cols = CSG_COLUMNAS.split(',').filter(c => c !== 'id' && _csgColsFuera.indexOf(c) < 0);
  /* Las más largas primero: `eliminado_at` contiene a `eliminado`. */
  cols.sort((a, b) => b.length - a.length);
  return cols.find(c => new RegExp('(^|[^a-z_])' + c + '([^a-z_]|$)').test(msg)) || '';
}

/* ⚠️ LA CAUSA SE NOMBRA (regla 18). Cuatro motivos que se arreglan de
   cuatro maneras distintas: un aviso que se equivoca de causa manda a
   mirar donde no está el problema.
   · 42P01 → la tabla no está: «falta correr consigna.sql».
   · 42703 → la tabla está y le falta una columna: «la base va vieja».
   · 42501 → la base no deja: sin sesión buena (o no es de la casa).
   · lo demás —el reloj, la red— es la señal. */
function csgMotivoDe(error) {
  if (!error) return '';
  const msg = String(error.message || '');
  if (error.code === 'FARO_RELOJ' || error.code === 'FARO_RED') return 'sin-senal';
  if (error.code === '42P01' || /relation .* does not exist/i.test(msg)) return 'sin-tabla';
  if (error.code === '42703' || error.code === 'PGRST204' || /column .* does not exist|could not find the .* column/i.test(msg)) return 'vieja';
  if (error.code === '42501' || /row-level security|permission denied/i.test(msg)) return 'sin-permiso';
  if (error.code === 'PGRST301' || /jwt/i.test(msg)) return 'sin-sesion';
  if (/^(23|22)/.test(String(error.code || ''))) return 'rechazada';
  return 'sin-senal';
}

/* Bajar. ⚠️ Ninguna rama vacía la lista en memoria: devuelve `null` y
   quien llama se queda con lo que tenía. Un corte de red enseñado como
   «todavía no hay consignas» invita a pegarlas otra vez encima de las
   que ya estaban (El Rodaje, regla 14). */
async function csgBajar() {
  const sb = csgSb();
  if (!sb) { _csgNube = 'sin-sesion'; return null; }
  /* Se empieza cada vez con la lista entera: si alguien volvió a correr
     el SQL a media sesión, la columna que faltaba ya está. */
  _csgColsFuera = [];
  const total = CSG_COLUMNAS.split(',').length;
  let data = null, error = null;
  for (let intento = 0; intento < total; intento++) {
    ({ data, error } = await csgConReloj(sb.from(CSG_TABLA)
      .select(csgColumnas()).order('actualizado', { ascending: false }).limit(1000)));
    /* ⚠️ LA BASE PUEDE IR UNA VERSIÓN ATRÁS: PostgREST rebota la
       consulta ENTERA por una sola columna que no exista. Se quita LA
       QUE EL ERROR NOMBRA —una a una, nunca todas de golpe— y se
       repite; se apunta en _csgColsFuera para no mandarla al subir, y
       la franja dice qué volver a correr. */
    const col = csgColumnaDelError(error);
    if (!col) break;
    _csgColsFuera.push(col);
  }
  if (error) {
    const m = csgMotivoDe(error);
    if (m === 'sin-tabla') { _csgHayTabla = false; _csgNube = 'sin-tabla'; }
    else if (m === 'vieja') { _csgHayTabla = true; _csgNube = 'vieja'; }
    else if (m === 'sin-permiso' || m === 'sin-sesion') { _csgNube = 'sin-sesion'; }
    else { _csgNube = 'sin-senal'; }
    return null;
  }
  _csgHayTabla = true;
  _csgNube = _csgColsFuera.length ? 'vieja' : 'puesta';
  return Array.isArray(data) ? data : [];
}

/* Lo que tiene que seguir igual para dar una pieza por subida: su reloj
   (las ediciones) y su bitácora (los usos y sus respuestas, que no lo
   tocan). */
function csgHuellaSubida(p) {
  return (p.actualizado || 0) + '|' + (p.usos || 0) + '|' +
    JSON.stringify((p.bitacora || []).map(u => u ? [u.uid, u.ok, u.nota] : null));
}

/* Varios en UN viaje: con la señal de una tableta, una escritura por
   pieza es lo que hace que abrir tarde. Antes de mandar se poda cada
   una; la que no cabe y la que no tiene firma se quedan esperando, con
   su motivo apuntado para que la franja lo diga. */
async function csgSubirVarios(lista) {
  const van = [], esperan = [];
  (lista || []).forEach(p => {
    if (!p || !p.id) return;
    csgPodar(p);
    if (p.noCabe) { p.subida = false; p.motivo = 'no-cabe'; esperan.push(p); return; }
    /* ⚠️ Ninguna fila viaja sin firma: la que no la tiene se firma
       ahora si ya hay quien, y si no, espera (§9, csgAutor). */
    if (!p.autor) {
      const a = csgAutor();
      if (!a) { p.subida = false; p.motivo = 'sin-sesion'; esperan.push(p); return; }
      p.autor = a;
    }
    van.push(p);
  });
  const motivoEspera = esperan.length ? esperan[0].motivo : '';
  if (!van.length) return esperan.length ? { ok: false, motivo: motivoEspera, subidas: 0 } : { ok: true, subidas: 0 };

  const sb = csgSb();
  if (!sb || !_csgHayTabla) {
    const motivo = !sb ? 'sin-sesion' : (_csgNube === 'mirando' ? 'sin-nube' : _csgNube);
    van.forEach(p => { p.subida = false; p.motivo = motivo; });
    return { ok: false, motivo, subidas: 0 };
  }
  /* La huella de cada pieza al salir: si se corrige mientras viaja, lo
     que llegó a la nube es lo de ANTES, y no se puede dar por subida.
     ⚠️ Y LA HUELLA LLEVA LA BITÁCORA, no solo el reloj: un uso (o la
     respuesta a «¿sirvió?») no toca el reloj, así que copiar la pieza
     mientras su subida iba de camino la dejaba marcada como subida con el
     uso fuera de la fila que llegó, y ese uso no viajaba hasta que otra
     cosa volviera a marcar la pieza. */
  const relojes = van.map(csgHuellaSubida);
  let error = null;
  for (let intento = 0; intento < CSG_COLUMNAS.split(',').length; intento++) {
    ({ error } = await csgConReloj(sb.from(CSG_TABLA).upsert(van.map(csgAFila), { onConflict: 'id' })));
    const col = csgColumnaDelError(error);
    if (!col) break;
    _csgColsFuera.push(col); _csgNube = 'vieja';
  }
  if (error) {
    const motivo = csgMotivoDe(error);
    if (motivo === 'sin-tabla') { _csgHayTabla = false; _csgNube = 'sin-tabla'; }
    /* ⚠️ UNA FILA QUE LA BASE RECHAZA TUMBA EL LOTE ENTERO: el upsert va en
       un viaje y PostgreSQL lo deshace todo por una sola. Y la franja
       nombraba a la PRIMERA de la lista, no a la culpable, así que el autor
       iba a mirar una pieza que estaba bien. Rechazado un lote de varias,
       se reintentan de una en una: suben las buenas y solo la culpable se
       queda con su motivo. Es raro, y por eso puede costar un viaje por
       pieza. */
    if (motivo === 'rechazada' && van.length > 1) {
      let subidas = 0;
      for (const p of van) subidas += (await csgSubirVarios([p])).subidas || 0;
      const malas = van.filter(p => p.subida === false && p.motivo);
      const ok = !malas.length && !esperan.length;
      return { ok, motivo: ok ? '' : (malas.length ? malas[0].motivo : motivoEspera), detalle: error.message || '', subidas };
    }
    van.forEach(p => { p.subida = false; p.motivo = motivo; });
    return { ok: false, motivo, detalle: error.message || '', subidas: 0 };
  }
  /* Si llegó, la nube está: una bajada anterior con mala señal no puede
     seguir diciendo «sin señal · reintentar» en la franja mientras las
     piezas suben. */
  _csgHayTabla = true;
  if (_csgNube === 'sin-senal' || _csgNube === 'sin-sesion' || _csgNube === 'mirando') _csgNube = _csgColsFuera.length ? 'vieja' : 'puesta';
  van.forEach((p, i) => {
    if (csgHuellaSubida(p) === relojes[i]) { p.subida = true; delete p.motivo; }
  });
  return esperan.length
    ? { ok: false, motivo: motivoEspera, subidas: van.length }
    : { ok: true, subidas: van.length };
}

async function csgSubir(p) {
  const r = await csgSubirVarios([p]);
  return { ok: r.ok, motivo: r.ok ? '' : (r.motivo || (p && p.motivo) || 'error'), detalle: r.detalle };
}

/* Lo que no subió se reintenta DE VERDAD: al abrir, y al volver la
   señal o la sesión. Prometer «subirá cuando vuelva la señal» sin que
   nada lo vuelva a intentar es peor que decir que falló (La Voz
   Prestada, regla 14). Pendiente es: lo que la nube no tiene, lo que
   aquí es más nuevo, o lo que se marcó sin subir. En UN viaje.
   Devuelve cuántas subieron. */
async function csgSubirPendientes(nube) {
  /* ⚠️ SIN LA LISTA DE LA NUBE DELANTE, SE TRAE PRIMERO: reintentar es
     volver a cargar (baja, fusiona y sube lo pendiente en el mismo paso),
     como hace Cuadernos al volver la señal. Por dos averías que eran la
     misma:
     · Si la herramienta ARRANCÓ sin señal, `_csgHayTabla` seguía en falso
       —solo lo pone una bajada buena— y este reintento, el del evento
       `online`, devolvía 0 sin intentar nada: la promesa del §9 sin nada
       detrás (La Voz Prestada, regla 14).
     · Y con la tabla ya vista, subía a ciegas lo marcado. Un uso apuntado
       sin señal deja la pieza marcada con sus escalares VIEJOS (un uso no
       toca el reloj), y subirla a ciegas los escribía encima de la
       corrección que otro aparato había hecho mientras tanto: la pieza
       que la tableta retiró resucitaba por un «copiar» del teléfono. Con
       la nube delante, la fusión deja ganar al reloj más nuevo y junta la
       bitácora, y lo que sube es eso.
     Si lo que falta es el SQL, cargar otra vez no lo arregla; y si no hay
     nada pendiente, no se gasta un viaje. */
  if (!Array.isArray(nube)) {
    if (_csgNube === 'sin-tabla') return 0;
    if (!_csgCargada) { _csgLista = csgFusionaLocal(csgLeeLocal(), _csgLista); _csgCargada = true; }
    const antes = _csgLista.filter(p => p && p.id && p.subida !== true);
    if (!antes.length) return 0;
    await csgCargar();
    return antes.filter(p => p.subida === true).length;
  }
  if (!_csgHayTabla) return 0;
  const enNube = new Map(nube.map(f => [f && f.id, csgNum(f && f.actualizado)]));
  const pendientes = _csgLista.filter(p => p && p.id &&
    (!enNube.has(p.id) || enNube.get(p.id) < (p.actualizado || 0) || p.subida === false));
  if (!pendientes.length) return 0;
  const r = await csgSubirVarios(pendientes);
  csgGuardaLocal();
  return r.subidas || 0;
}

/* Guardar: aquí al instante, la nube después. Guardar NUNCA se bloquea
   (regla 5): una pieza a medias es un borrador, y la que no cabe o no
   tiene firma se queda en el aparato diciendo por qué. */
/* ⚠️ GUARDAR ES EDITAR, Y EL RELOJ SE PONE SIEMPRE. Solo se ponía si
   faltaba, así que corregir una pieza que ya existía salía con el reloj de
   la nube: si esa subida fallaba, en la carga siguiente el empate lo ganaba
   la nube y la corrección se perdía en silencio. La regla del reloj no
   puede depender de que cada botón de la pantalla se acuerde de ponerlo.
   Devuelve también `local`: false si el aparato no la pudo guardar (el
   almacén lleno), que con la nube fallando es perderla al cerrar. */
async function csgPersistir(p) {
  if (!p || !p.id) return { ok: false, motivo: 'error' };
  csgMeteEnLista(p);
  p.actualizado = Date.now();
  p.subida = false;
  const poda = csgPodar(p);
  let local = csgGuardaLocal();
  const r = await csgSubir(p);
  if (r.ok) local = csgGuardaLocal() || local;
  r.poda = poda;
  r.local = local;
  return r;
}

function csgMeteEnLista(p) {
  if (!_csgCargada) { _csgLista = csgFusionaLocal(csgLeeLocal(), _csgLista); _csgCargada = true; }
  const i = _csgLista.findIndex(x => x.id === p.id);
  if (i < 0) _csgLista.push(p); else if (_csgLista[i] !== p) _csgLista[i] = p;
}

/* Local al instante; la nube con un respiro de dos segundos (§5, paso
   5). Cada tecla que guarda reinicia el respiro de ESA pieza, así que
   escribir un párrafo es un viaje y no ochenta. Devuelve una promesa que
   se cumple con el resultado de la subida, la misma para todos los
   guardados que se juntaron en ese viaje: la pantalla la usa para
   repintar la franja. */
/* Y como csgPersistir, el reloj se pone siempre, SALVO con `{uso: true}`
   (lo que apunta un uso o contesta «¿sirvió?»): un uso no es una edición.
   Si lo fuera, usar sin señal una pieza vieja la haría «la más nueva» y
   su fila entera —título, bloques, lápida— les ganaría a las
   correcciones de los otros aparatos: la pieza que la tableta retiró
   resucitaba porque el teléfono la había copiado. El uso viaja igual,
   por la unión de la bitácora.
   ⚠️ Y UN RESPIRO CON SOLO USOS SUBE CON LA NUBE DELANTE
   (csgSubirPendientes sin lista), no a ciegas. Sin tocar el reloj, la
   pieza sigue llevando sus escalares de cuando se bajó, y el upsert
   escribe la fila ENTERA: el teléfono que tenía la pieza abierta desde
   la mañana y la copiaba por la tarde le pisaba a la tableta la
   corrección de mediodía. Con una edición en el respiro, la subida es la
   de siempre: ahí la pieza sí es la más nueva, y bajar la lista entera en
   cada pausa al escribir sería un viaje de más por tecla. */
function csgSubirLuego(p, opciones) {
  if (!p || !p.id) return Promise.resolve({ ok: false, motivo: 'error' });
  const op = (opciones && typeof opciones === 'object') ? opciones : {};
  csgMeteEnLista(p);
  if (!op.uso || !p.actualizado) p.actualizado = Date.now();
  p.subida = false;
  csgPodar(p);
  const local = csgGuardaLocal();
  return new Promise(res => {
    const ya = _csgLuego[p.id];
    if (ya) clearTimeout(ya.t);
    const esperan = ya ? ya.esperan.concat([res]) : [res];
    const soloUsos = !!op.uso && (!ya || !!ya.soloUsos);
    const t = setTimeout(async () => {
      const ent = _csgLuego[p.id];
      delete _csgLuego[p.id];
      let r;
      try {
        if (ent && ent.soloUsos) {
          await csgSubirPendientes();
          r = p.subida === true ? { ok: true, motivo: '' }
            : { ok: false, motivo: p.motivo || (['sin-tabla', 'sin-sesion'].indexOf(_csgNube) >= 0 ? _csgNube : 'sin-senal') };
        } else r = await csgSubir(p);
      } catch (e) { r = { ok: false, motivo: 'sin-senal' }; }
      r.local = csgGuardaLocal() || !!(ent && ent.local);
      esperan.forEach(f => f(r));
    }, CSG_RESPIRO);
    _csgLuego[p.id] = { t, esperan, local, soloUsos };
  });
}

/* El arranque de los DATOS, sin pantalla: lo del aparato al instante; la
   nube cuando llegue; y lo pendiente, subido en el mismo paso. Dos
   llamadas seguidas comparten el mismo viaje (_csgInitEnCurso): abrir y
   volver a la vista en el mismo segundo no pide la lista dos veces. */
function csgCargar() {
  if (_csgInitEnCurso) return _csgInitEnCurso;
  _csgInitEnCurso = (async () => {
    if (!_csgCargada) { _csgLista = csgFusionaLocal(csgLeeLocal(), _csgLista); _csgCargada = true; }
    const nube = await csgBajar();
    if (nube) {
      _csgLista = csgFusiona(_csgLista, nube);
      await csgSubirPendientes(nube);
    }
    csgGuardaLocal();
    return _csgLista;
  })().finally(() => { _csgInitEnCurso = null; });
  return _csgInitEnCurso;
}

/* La franja de la nube (§8): SOLO con algo que arreglar, y diciendo qué.
   Primero lo que le pasa a la base entera; después lo de cada pieza
   (la que no cabe, la que espera firma), porque esas son las que el
   autor tiene que tocar con la mano. `accion` dice qué botón lleva. */
function csgRotuloNube() {
  /* Lo primero, lo que puede perder algo: el aparato sin sitio. */
  if (_csgSinEspacio) return { ic: '💾', t: 'No cabe en este aparato: el almacén del navegador está lleno y lo último no se guardó aquí', ok: false };
  if (_csgNube === 'sin-tabla') return { ic: '📴', t: 'Solo en este aparato: falta correr consigna.sql', ok: false };
  if (_csgNube === 'sin-senal') return { ic: '📡', t: 'Solo en este aparato · sin señal · reintentar', ok: false, accion: 'reintentar' };
  /* ⚠️ Cualquier pieza que no subió por la sesión, lleve firma o no. Solo
     se miraban las SIN autor, y una pieza firmada cuya subida rebotó
     porque la sesión caducó (JWT expired) dejaba la franja en «☁️ viajan»
     mientras no viajaba: la causa sin nombrar (regla 18). Si todas están
     firmadas, lo que falta no es firmarlas: es volver a entrar. */
  const sinSesion = _csgLista.filter(p => p && p.subida === false && p.motivo === 'sin-sesion');
  if (_csgNube === 'sin-sesion' || sinSesion.length) {
    const firmadas = sinSesion.length > 0 && sinSesion.every(p => p.autor);
    return { ic: '🔑', t: firmadas ? 'Solo en este aparato · sin sesión: vuelve a entrar en F.A.R.O' : 'Solo en este aparato · sin sesión: se firmará al entrar', ok: false };
  }
  const grande = _csgLista.find(p => p && p.noCabe && !p.eliminado);
  if (grande) {
    const sobra = Math.max(1, csgSobraBloques(grande));
    return { ic: '✂️', t: '«' + (grande.titulo || CSG_SIN_TITULO) + '» no cabe en la nube: ' + csgTextoRecorta(sobra), ok: false, id: grande.id };
  }
  /* Una subida que falló con la base puesta: la pieza sigue aquí, y lo
     que se dice es el motivo de ESA subida, no el de la base. */
  const atascada = _csgLista.find(p => p && p.subida === false && p.motivo
    && p.motivo !== 'sin-sesion' && p.motivo !== 'no-cabe');
  if (atascada && _csgNube !== 'mirando') {
    if (atascada.motivo === 'sin-permiso') return { ic: '🔑', t: 'Solo en este aparato · la base no dejó guardar: vuelve a entrar en F.A.R.O', ok: false };
    if (atascada.motivo === 'rechazada') return { ic: '⚠️', t: 'Solo en este aparato · la base rechazó «' + (atascada.titulo || CSG_SIN_TITULO) + '»', ok: false, id: atascada.id };
    if (atascada.motivo === 'sin-senal') return { ic: '📡', t: 'Solo en este aparato · sin señal · reintentar', ok: false, accion: 'reintentar' };
  }
  if (_csgNube === 'vieja') {
    return { ic: '🧩', t: 'Viaja a medias · la base va vieja: vuelve a correr consigna.sql (le falta ' + _csgColsFuera.map(c => '«' + c + '»').join(', ') + ')', ok: false };
  }
  if (_csgNube === 'puesta') return { ic: '☁️', t: 'Las consignas viajan a todos los aparatos de la casa', ok: true };
  return { ic: '⏳', t: 'Mirando la nube…', ok: false };
}

/* ── Las piezas ────────────────────────────────────────────────────── */

function csgVivas() { return _csgLista.filter(p => p && !p.eliminado); }
function csgRetiradas() { return _csgLista.filter(p => p && p.eliminado); }
function csgDe(id) { return _csgLista.find(p => p && p.id === id) || null; }

/* Apuntar un uso al copiar o abrir (§5, paso 4). ⚠️ Aquí no se pregunta
   nada: el «¿sirvió?» inmediato preguntaba antes de que la máquina
   contestara. El uso nace con `ok: null` y se pregunta en la siguiente
   apertura del anaquel (§6.7). Lleva `v`: el 👍 va atado a la versión
   (regla 10). Se guarda en el aparato en el acto —un uso que se pierde
   al cerrar es un uso que no pasó— y SE SUBE SOLO, con el respiro de
   csgSubirLuego (copiar cinco veces seguidas es un viaje) y con
   `{uso: true}`, que no toca el reloj y sube con la nube delante. Quien
   llama NO tiene que subirlo después: con un csgSubirLuego a secas el uso
   contaría como edición (ver abajo). Si la pieza no es la de la lista
   (una sin guardar), se apunta en ella y nada más. */
function csgApuntarUso(pieza, maquinaId) {
  if (!pieza) return null;
  const ahora = Date.now();
  const uso = { uid: csgNuevoId('u'), t: ahora, maquina: String(maquinaId || pieza.maquina || ''), v: pieza.version || 1, ok: null, nota: '' };
  pieza.bitacora = Array.isArray(pieza.bitacora) ? pieza.bitacora : [];
  pieza.bitacora.unshift(uso);
  pieza.usos = Math.max((pieza.usos || 0) + 1, pieza.bitacora.length);
  pieza.ultima = ahora;
  /* ⚠️ Y `actualizado` NO SE TOCA: un uso no es una edición. Con el reloj
     puesto aquí, copiar sin señal una pieza que otro aparato ya había
     corregido y retirado la hacía «la más nueva», y al volver la señal su
     fila entera ganaba la fusión: la pieza retirada resucitaba y la
     corrección de la tableta se perdía para siempre. El uso llega igual
     —la bitácora se funde por unión y `ultima` y `usos` por el máximo—,
     y `subida: false` es lo que lo manda. */
  pieza.subida = false;
  if (csgDe(pieza.id) === pieza) csgSubirLuego(pieza, { uso: true });
  return uso;
}

/* La respuesta a «¿sirvió?» (§6.7): `ok` es 'si', 'regular' o 'no'; la
   nota, una línea de 300 como mucho. Como apuntar el uso, NO toca el
   reloj: es lo mismo que un uso, y contestar en el teléfono no puede
   pisarle a la tableta una corrección. La fusión ya hace que un `ok`
   puesto le gane a un null del mismo uid. Devuelve el uso, o null si la
   pieza no lo tiene. Se guarda y se sube solo, como el uso. */
function csgContestarUso(pieza, uid, ok, nota) {
  if (!pieza || !Array.isArray(pieza.bitacora)) return null;
  const u = pieza.bitacora.find(x => x && x.uid === uid);
  if (!u) return null;
  u.ok = (ok === 'si' || ok === 'regular' || ok === 'no') ? ok : null;
  if (nota !== undefined) u.nota = csgCorta(String(nota == null ? '' : nota).replace(/\s+/g, ' ').trim(), CSG_TOPES.nota_uso);
  pieza.subida = false;
  if (csgDe(pieza.id) === pieza) csgSubirLuego(pieza, { uso: true });
  return u;
}

/* ⚠️ NADA REESCRIBE EL HISTORIAL (regla 10). Corregir una pieza que ya
   se usó guarda lo de antes como versión n y la pieza pasa a n+1; quien
   decide si el texto cambió es quien llama (§5, paso 5: el armado en
   `md`), comparando csgMdCrudo de antes y de después —y no csgArmar, que
   rellena {{hoy}} y haría nacer una versión cada día—. Devuelve el
   número de la versión nueva. */
function csgNuevaVersion(pieza, bloquesAntes) {
  if (!pieza) return 0;
  const ahora = Date.now();
  pieza.versiones = Array.isArray(pieza.versiones) ? pieza.versiones : [];
  pieza.versiones.unshift({ vid: csgNuevoId('v'), v: pieza.version || 1, t: ahora, bloques: csgBloquesLimpios(bloquesAntes) });
  pieza.version = (pieza.version || 1) + 1;
  pieza.actualizado = ahora;
  pieza.subida = false;
  return pieza.version;
}

/* «Volver a la v2» NO borra la v3 ni la v4: crea la v5 con los bloques
   de la v2, y la v4 queda guardada como cualquier otra. Así el 👍 que
   se le dio a la v4 sigue diciendo de qué texto hablaba. Si la versión
   ya se plegó (sin bloques), no hay a qué volver, y se devuelve 0 para
   que la pantalla lo diga en vez de fingir. */
function csgVolverAVersion(pieza, vid) {
  if (!pieza || !Array.isArray(pieza.versiones)) return 0;
  const vieja = pieza.versiones.find(x => x && x.vid === vid);
  if (!vieja || !Array.isArray(vieja.bloques)) return 0;
  const copia = csgBloquesLimpios(vieja.bloques);
  const n = csgNuevaVersion(pieza, pieza.bloques || []);
  pieza.bloques = copia;
  return n;
}

/* ── PANTALLA: la escribe la parte 2 ── */
