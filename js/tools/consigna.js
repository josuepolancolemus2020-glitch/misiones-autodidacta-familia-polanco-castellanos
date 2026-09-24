/* ⚠️ EL NÚCLEO Y LA PANTALLA ESTÁN ESCRITOS Y CABLEADOS; FALTAN LA
   SONDA Y LA DOCUMENTACIÓN.
   ──────────────────────────────────────────────────────────────────
   Así quedó el 23 de septiembre de 2026. De aquí para abajo va el
   NÚCLEO —las listas cerradas, el armado, el lector de lo pegado, el
   repaso, la poda, la fusión y la nube—, PROBADO EN NODE:

       node _dev/test-consigna-node.js

   que carga este mismo archivo en un salón vacío y compara lo que arma,
   carácter por carácter, con los ejemplos del §7 del plan. Tiene que
   decir «RESULTADO: APRUEBA» antes y después de tocar cualquier cosa.

   Y al final, detrás del cartel «PANTALLA», va la pantalla entera —el
   anaquel, el compositor, las hojas de Usar y de Pegar, e
   initConsigna—, con css/consigna.css. Ya está cableada: el botón del
   Acceso Rápido, las dos vistas y las tres hojas en index.html, sus dos
   líneas en switchView (js/app.js) y el sello de sw.js.

   Lo que FALTA, en orden: la sonda _dev/probe-consigna.html con las 22
   comprobaciones del §11 de PLAN-LA-CONSIGNA.md, corrida hasta APRUEBA
   —la prueba de Node mira el núcleo, pero lo que puede fallar en la
   pantalla es de pantalla y solo se ve pulsando—; y la normativa en
   CLAUDE.md y la entrada del SQL en PLAN-FARO-PRIVADO.md. Hasta que la
   sonda apruebe, esto NO se da por terminado aunque se vea funcionar:
   el «Corregir y aprender» de la revista estuvo dos semanas muerto con
   la pantalla entera a la vista.
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

   Este archivo va en DOS partes. La primera es el NÚCLEO sin pantalla:
   las listas cerradas, el vocabulario, los moldes, el armado, el lector
   de lo pegado, el repaso, la poda, la fusión y la nube. La segunda, al
   final y detrás del cartel «PANTALLA», es la pantalla (el anaquel, el
   compositor, las hojas e initConsigna), que copia la forma de
   📓 Cuadernos. El archivo ENTERO —pantalla incluida— tiene que poder
   cargarse en Node con dobles de document/window/localStorage
   (_dev/test-consigna-node.js lo hace), y por eso aquí no se toca el DOM
   a nivel de archivo: ni siquiera para colgar un DOMContentLoaded. Los
   botones se enganchan la primera vez que se abre cada vista u hoja.

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
        inicial: 'Al final, un veredicto de 200 palabras con la postura que gana, por qué, y las tres mejores pruebas de cada lado. Escribe el careo entero encabezado con estas líneas, una por renglón: «Título:» y un título; «Voz: A y B»; «Máquina: {{maquina}}»; «Género: entrevista»; «Consigna: {{titulo}}». Cada turno en su propio párrafo, con una línea en blanco entre uno y otro, empezando por A:, B: o JUEZ:. Termina con FIN solo en su renglón.',
        ejemplo: 'Al final, un veredicto de 200 palabras con la postura que gana, por qué, y las tres mejores pruebas de cada lado. Escribe el careo entero encabezado con estas líneas, una por renglón: «Título:» y un título; «Voz: A y B»; «Máquina: {{maquina}}»; «Género: entrevista»; «Consigna: {{titulo}}». Cada turno en su propio párrafo, con una línea en blanco entre uno y otro, empezando por A:, B: o JUEZ:. Termina con FIN solo en su renglón.',
        frases: ['Veredicto de {{n}} palabras con quién gana y por qué.', 'Las tres mejores pruebas de cada lado.', 'Lo que ninguno probó.', 'Encabeza con Título:, Voz:, Máquina: y Género: entrevista, una por renglón.'] },
    ],
    /* ⚠️ «Con una línea en blanco entre uno y otro», aquí y en la etiqueta:
       lo devuelto va a La Voz Prestada («📖 Guardar lo que devolvió»), y su
       lector junta los renglones seguidos en UN párrafo. Pidiendo solo «su
       propio renglón», un careo obediente entraba como un párrafo por
       ronda, con los tres turnos pegados y el primer «JUEZ:» nombrado como
       etiqueta sin entender; y el texto crudo no se guarda para rehacerlo. */
    auto: 'Escribe el careo entero tú solo, haciendo las tres voces por turnos. Cada turno en su propio párrafo, con una línea en blanco entre uno y otro, empezando por A:, B: o JUEZ:. Respeta las rondas y el largo de cada turno. Al terminar la última ronda, el JUEZ da el veredicto. Encabeza todo con la etiqueta de la casa y termina con FIN solo en su renglón.',
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
       se nombra. Lo que no se nombra no se pierde: sigue en su bloque.
       ⚠️ Y LO INTENTABA TAMBIÉN SI ES UNA ERRATA DE UN RÓTULO CONOCIDO
       (csgLecSugerencia no vacía): «Contexo: …» debajo de una sola frase
       de prosa no tenía otros rótulos al lado, se quedaba en el Texto sin
       decir nada, y es justo el caso para el que existe la sugerencia.
       Una palabra a dos letras de un rótulo no es una frase cualquiera
       («Viaja:», «Investigador:» no están cerca de ninguno). */
    if (!sugerencias.has(c.clave)) sugerencias.set(c.clave, csgLecSugerencia(c.clave, clase));
    const sug = sugerencias.get(c.clave);
    const intentaba = c.forma === 'mayusculas' ||
      (!esLista && (c.forma === 'negrita' || usaDosPuntos || !!sug));
    if (!intentaba) return;
    if (nombrados >= NOMBRAR_MAX) { if (!sinNombrar++) primeroSin = c.renglon.n; return; }
    nombrados++;
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
  /* ⚠️ Y LOS NOMBRES, TAMBIÉN CON LOS CORREOS TAPADOS (y las
     direcciones): «josue@correo.com» no es el nombre de Josué suelto en
     una frase, es un correo, y ya tiene su aviso. Buscado en el texto
     entero salía un segundo aviso por el nombre, y su chip «⇄ {{nombre}}»
     partía el correo en «{{nombre}}@correo.com»: el aviso del correo se
     iba —ya no parecía un correo— y el dato de la casa seguía ahí. */
  const sinDirecciones = sinCorreos.replace(/\bhttps?:\/\/[^\s<>"'«»]+/gi, x => ' '.repeat(x.length));
  const ocupados = [];
  csgLecNombresCasa().forEach(nombre => {
    const re = csgLecPatronNombre(nombre);
    let x;
    while ((x = re.exec(sinDirecciones))) {
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
let _csgNubeVista   = 0;           // cuándo llegó la última lista de la nube (Date.now); 0 = nunca
let _csgSubidaCola  = null;        // la cola de la fila de subidas (csgSubirEnCola); null = vacía
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
    if (csgHuellaSubida(p) === relojes[i]) {
      p.subida = true; delete p.motivo;
      /* ⚠️ Y SI ESTA PIEZA ESPERABA SU RESPIRO, YA NO HACE FALTA: lo que
         iba a subir es exactamente lo que acaba de llegar (la huella no se
         movió). Al volver del compositor con ‹, el guardado ponía su
         respiro de dos segundos y la carga del anaquel subía la pieza en
         seguida: la misma fila viajaba dos veces, y dos upserts en vuelo
         pueden llegar en otro orden. Se da por hecho con este resultado. */
      const ent = _csgLuego[p.id];
      if (ent) {
        clearTimeout(ent.t);
        delete _csgLuego[p.id];
        ent.esperan.forEach(f => f({ ok: true, motivo: '', local: !!ent.local }));
      }
    }
  });
  return esperan.length
    ? { ok: false, motivo: motivoEspera, subidas: van.length }
    : { ok: true, subidas: van.length };
}

/* ⚠️ LAS SUBIDAS VAN EN FILA, UNA DETRÁS DE OTRA. Cada upsert escribe la
   fila ENTERA, y dos en vuelo pueden llegar en cualquier orden: con ☑
   Elegir, meter una consigna en «Primero» y en seguida en «Segundo» (la
   hoja de mover se queda abierta justo para eso), o retirarla y
   devolverla en el acto, dejaba en la nube la PRIMERA si la segunda
   llegaba antes —y el aparato, con las dos subidas contestadas, la daba
   por subida y la franja decía «☁️ viajan» sin que viajara—. La huella
   de csgSubirVarios impide que un viaje viejo marque la pieza como
   subida; no impide que llegue DESPUÉS del nuevo. En fila, el último que
   sale es el último que llega. Nadie espera de más: lo del aparato ya
   está escrito antes de entrar en la fila, y cada viaje tiene su reloj
   (csgConReloj), así que uno que no vuelve no la para más de ocho
   segundos. La usan las dos subidas INMEDIATAS —csgPersistir y
   csgPersistirVarios, que son las de ☑ Elegir, ↩ Devolver y retirar—,
   que son las que se tocan una detrás de otra. La del reintento
   (csgSubirPendientes, al abrir y al volver la señal) va aparte y a
   propósito: sube lo más nuevo de la lista con la nube delante, y
   esperando en la fila detrás de una subida que se quedó sin señal
   tardaba hasta ocho segundos en salir justo cuando la señal volvía.
   La fila NO va dentro de csgSubirVarios: se llama a sí misma
   para reintentar de una en una, y dentro de la fila se esperaría a sí
   misma para siempre.
   Con la fila VACÍA sale en el acto, sin esperar ni un turno: la huella
   de lo que sale (csgHuellaSubida) se toma en el mismo instante que antes,
   y un uso apuntado justo después sigue sin darse por subido. Y al volver
   la señal la fila se vacía (csgSubidaColaSuelta): lo que salió sin señal
   ya no va a llegar, y lo nuevo no tiene por qué esperar a que se rinda. */
function csgSubirEnCola(lista) {
  const antes = _csgSubidaCola;
  const sale = () => csgSubirVarios(lista);
  const viaje = antes ? antes.then(sale, sale) : sale();
  const cola = viaje.then(() => {}, () => {});
  _csgSubidaCola = cola;
  cola.then(() => { if (_csgSubidaCola === cola) _csgSubidaCola = null; });
  return viaje;
}
function csgSubidaColaSuelta() { _csgSubidaCola = null; }

/* `enCola`: por la fila de arriba (lo pide csgPersistir). El respiro de
   csgSubirLuego sube directo, como siempre. */
async function csgSubir(p, enCola) {
  const r = await (enCola ? csgSubirEnCola([p]) : csgSubirVarios([p]));
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
  const r = await csgSubir(p, true);
  if (r.ok) local = csgGuardaLocal() || local;
  r.poda = poda;
  r.local = local;
  return r;
}

/* ⚠️ VARIAS EDICIONES DE GOLPE, EN UN SOLO VIAJE. Es lo que usa «☑ Elegir»
   del anaquel para mover veinte consignas a un estante, cambiarles la
   máquina o retirarlas: con la señal de una tableta, una escritura por
   pieza es lo que hace que mover veinte tarde (regla 6 de 📓 Cuadernos,
   regla 38 de La Voz Prestada), y veinte upserts en vuelo pueden llegar en
   cualquier orden. Así que es csgPersistir para una lista:
   · cada pieza entra en la lista, lleva EL RELOJ PUESTO (mover, cambiar
     la máquina o retirar es una edición: con el reloj viejo, la nube le
     ganaría el empate y el cambio se perdería en silencio, regla 18) y
     queda marcada como pendiente;
   · el aparato se escribe UNA vez antes del viaje —pase lo que pase con
     la red, lo hecho ya está aquí— y otra al volver, para apuntar lo que
     llegó, igual que csgPersistir: dos escrituras sean una pieza o veinte;
   · y todas suben en UN upsert (csgSubirVarios), que ya poda, firma, deja
     esperando la que no cabe o no tiene firma, reintenta de una en una si
     la base rechaza el lote y suelta el respiro pendiente de cada una.
   La misma pieza dos veces en la lista viaja una vez. Quien llama pasa
   SOLO las que de verdad cambió: una fila que no cambió no tiene por qué
   llevarse el reloj ni gastar sitio en el viaje. */
async function csgPersistirVarios(lista) {
  const van = [];
  const vistos = new Set();
  (Array.isArray(lista) ? lista : []).forEach(p => {
    if (!p || !p.id || vistos.has(p.id)) return;
    vistos.add(p.id);
    van.push(p);
  });
  if (!van.length) return { ok: true, motivo: '', subidas: 0, local: true };
  const ahora = Date.now();
  van.forEach(p => {
    csgMeteEnLista(p);
    p.actualizado = ahora;
    p.subida = false;
    csgPodar(p);
  });
  let local = csgGuardaLocal();
  let r;
  try { r = await csgSubirEnCola(van); } catch (e) { r = { ok: false, motivo: 'sin-senal', subidas: 0 }; }
  if (r.subidas) local = csgGuardaLocal() || local;
  return { ok: !!r.ok, motivo: r.ok ? '' : (r.motivo || 'error'), detalle: r.detalle || '', subidas: r.subidas || 0, local };
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
      _csgNubeVista = Date.now();
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
    /* ⚠️ Lo que se dice depende de si FALTA una firma, no de si hay
       pendientes firmadas: con la sesión caducada (JWT expired, o la base
       que no deja) y nada pendiente, «se firmará al entrar» nombraba una
       firma que nadie necesitaba; lo que hace falta es volver a entrar. */
    const faltaFirma = !csgAutor() || sinSesion.some(p => !p.autor);
    return { ic: '🔑', t: faltaFirma ? 'Solo en este aparato · sin sesión: se firmará al entrar' : 'Solo en este aparato · sin sesión: vuelve a entrar en F.A.R.O', ok: false };
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

/* ══════════════════════════════════════════════════════════════════
   📜 LA CONSIGNA · PANTALLA
   ──────────────────────────────────────────────────────────────────
   De aquí para abajo, lo que se ve. Va en tres trozos y en este orden,
   que importa: en un <script> clásico da igual el orden de las
   `function`, pero no el de los `let`, y leer uno antes de su renglón
   revienta con un ReferenceError.

   1. EL ANAQUEL: los ayudantes comunes (csgEl, csgBtn, csgVerAbrir,
      csgCopiarTexto, csgRepaso…), el inventario, el menú ⋯ e
      initConsigna.
   2. EL COMPOSITOR: la hoja «¿Qué le vas a pedir?», los bloques, la
      vista previa con el repaso, guardar y duplicar en otro molde.
   3. LAS HOJAS: ▶ Usar, 📋 Pegar lo que ya tengo y abrir la máquina.

   Se escribieron a la vez, cada uno con sus prefijos (csgAnq, csgFicha,
   csgMenu, csgBit · csgEd, csgNueva, csgDuplicar, csgBorrador · csgUsar,
   csgPeg, csgVars), y se juntaron el 23 de septiembre de 2026 con un
   contrato de ids, clases y firmas que los tres respetan. Un nombre
   repetido entre trozos pisaría al otro sin ningún aviso (pasó con
   corAbrir): la prueba de Node lo mira sobre el archivo entero.
   ══════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════
   📜 LA CONSIGNA · PANTALLA, PARTE 1 DE 3: LOS AYUDANTES COMUNES, EL
   ANAQUEL, EL MENÚ ⋯ E initConsigna
   ──────────────────────────────────────────────────────────────────
   Va la PRIMERA detrás de la marca «PANTALLA»: el compositor y las hojas
   usan los ayudantes de aquí (csgEl, csgBtn, csgVerAbrir, csgCopiarTexto,
   csgRepaso…), y en un <script> clásico da igual el orden de las
   `function`, pero no el de los `let`: leer uno antes de su renglón
   revienta con un ReferenceError.

   Es la forma de 📓 Cuadernos (su regla 11), que el autor aprobó el 22 de
   septiembre de 2026: una sola fila de botones con su palabra y su color
   por función, el buscador, SOLO lo que está puesto, y las fichas en
   cuadrícula con los botones al pie. Lo que esta herramienta añade a esa
   forma está dicho donde se hace: los chips de clase con su cuenta, el
   renglón que PREGUNTA «¿sirvió?» (§6.7) y el menú ⋯ con versiones,
   bitácora, estantes y cuaderno.

   ⚠️ A NIVEL DE ARCHIVO NO SE TOCA NI `document` NI `window`, TAMPOCO
   PARA COLGAR UN DOMContentLoaded. La prueba de Node
   (_dev/test-consigna-node.js) carga este archivo entero en salones cuyo
   `document` REVIENTA si se le toca y que apuntan cualquier toque, y un
   `document.addEventListener` aquí arriba la haría suspender. Los botones
   de la cabecera, la ✕ de la hoja vertical y el `online` se enganchan la
   primera vez que se abre la vista (initConsigna) o la hoja
   (csgVerAbrir), que es siempre antes de que nadie pueda tocarlos.

   ⚠️ Y NADA DE LO ESCRITO POR UNA PERSONA LLEGA A UN ATRIBUTO NI A
   innerHTML (regla 15): todo con createElement y textContent. Los
   `data-csg-foco` que se ponen son claves NUESTRAS («chip:prompt»,
   «grupo:3»), nunca un título ni un estante.
   ══════════════════════════════════════════════════════════════════ */

/* ── Constantes del anaquel ─────────────────────────────────────── */

const CSG_ANQ_TONOS = 8;
const CSG_ANQ_DIA = 86400000;
/* Solo se pregunta por lo de la última semana: un «¿sirvió?» de hace un
   mes ya no se contesta de memoria, y contestarlo a ojo es inventar. */
const CSG_ANQ_PREGUNTA_DIAS = 7;
/* Tres aperturas sin tocar el renglón y se pliega (§6.7): preguntar
   siempre lo mismo a quien no quiere contestar convierte la pregunta en
   ruido, y el ruido se aprende a no leer. */
const CSG_ANQ_PREGUNTA_VECES = 3;
/* Un prompt copiado tres veces en treinta días ya no es «de una vez»:
   es una instrucción que se quiere puesta (§6.9). */
const CSG_ANQ_USOS_MES = 3;
const CSG_ANQ_MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
/* ⚠️ «SIN ESTANTE» NO PUEDE LLAMARSE COMO UN ESTANTE. La clave de un
   estante la escribe una persona y csgClave la deja en minúsculas y
   RECORTADA; con el centinela 'sin' en el mismo espacio de nombres, un
   estante llamado «Sin» se confundía con «Sin estante»: filtrar por él
   enseñaba justo lo contrario (lo que NO tiene estante) y agrupando
   salían dos montones con la misma llave de plegado. Un blanco delante
   no lo puede producir csgClave nunca, así que ningún nombre escrito lo
   suplanta y no hay ningún nombre prohibido que explicar. */
const CSG_ANQ_SIN = ' sin';

const CSG_ANQ_ORDENES = [
  { id: 'ultima',    ic: '🕘', t: 'Última usada',     d: 'lo que usas a diario sube solo' },
  { id: 'usos',      ic: '🔥', t: 'Más usadas',       d: 'por cuántas veces se copiaron o abrieron' },
  { id: 'valor',     ic: '👍', t: 'Mejor valoradas',  d: '✅ menos ❌; con menos de dos respuestas, al final' },
  { id: 'titulo',    ic: '🔤', t: 'Título',           d: 'de la A a la Z' },
  { id: 'recientes', ic: '🆕', t: 'Recientes',        d: 'lo último que se escribió o se corrigió' },
];
const CSG_ANQ_AGRUPAR = [
  { id: 'no',      ic: '☰',  t: 'Sin agrupar',  d: 'una sola lista' },
  { id: 'estante', ic: '🗂', t: 'Por estante',  d: 'una consigna en dos estantes sale en los dos' },
  { id: 'clase',   ic: '💬', t: 'Por clase',    d: 'prompts, habilidades, grafos y bucles' },
  { id: 'maquina', ic: '🤖', t: 'Por máquina',  d: 'Claude, ChatGPT, Gemini…' },
];
const CSG_ANQ_ESPECIALES = {
  borradores: { ic: '🟡', t: 'Borradores' },
  sinprobar:  { ic: '⏳', t: 'Sin probar' },
};

/* ── Estado de la pantalla (del aparato y de esta sesión; nada viaja) ── */

let _csgAnqPrefs = null;              // las preferencias del anaquel, leídas UNA vez
let _csgAnqBusca = '';                // lo escrito en el buscador (de la sesión)
let _csgAnqBuscaFila = null;          // la fila del buscador: NO se rehace nunca (ver csgAnqBuscaFila)
let _csgAnqBuscaT = null;
let _csgAnqGrupos = [];               // [{k, rot, caja, vista}] del último pintado
let _csgAnqMando = null;              // el «▾ Abrir todos / ▴ Cerrar todos»
let _csgAnqRotulos = new Map();       // clave de estante → cómo lo escribe la casa
let _csgAnqRepasos = new Map();       // id → {k, r}: el repaso de cada ficha
let _csgAnqTextos = new Map();        // id → {k, t}: lo que mira el buscador
let _csgAnqEnganchado = false;
let _csgAnqPendiente = false;         // un repintado que esperó a que se soltara la nota
let _csgAnqRetAbiertas = false;
let _csgAnqVerPintar = null;          // lo que pinta la hoja vertical abierta
let _csgAnqBitPlegada = false;        // el renglón de la bitácora, plegado en esta apertura
let _csgAnqCuadernosPedidos = false;
let _csgAnqSeguirAhora = false;       // en esta apertura se ofrece seguir el borrador (y no se pregunta)
/* ⚠️ LA FOTO DE LA APERTURA. El «¿sirvió?» pregunta en la SIGUIENTE
   apertura (§6.7), así que solo cuentan los usos de ANTES de abrir: el
   que se apunta ahora mismo (📋 Copiar y cerrar la hoja) espera a la
   próxima. Sin la foto, el renglón salía en el mismo repintado del uso,
   que es el «¿Cómo salió?» inmediato que el §6.7 quitó: preguntaba antes
   de que la máquina contestara. */
let _csgAnqBitDesde = 0;
/* ‹ desde el compositor NO es una apertura: es volver dentro de la
   herramienta. Contándola, tres idas y vueltas a corregir en una sola
   visita plegaban la pregunta como si se hubiera ignorado tres veces. */
let _csgAnqVuelta = false;
/* ☑ Elegir (ver «ELEGIR VARIAS Y MOVERLAS DE UNA VEZ», más abajo). Todo en
   MEMORIA y nada en las preferencias del aparato ni en la nube: el modo no
   sobrevive a salir de la vista, y una selección que reapareciera al día
   siguiente haría retirar o mover lo que ya nadie recordaba haber elegido. */
let _csgEleg = null;                  // null = no se elige; si no, un Set de ids
let _csgElegRetirar = false;          // el primer toque de 🗑 Retirar ya se dio
let _csgElegNodos = new Map();        // id → [ficha o fila] del último pintado
let _csgElegBarraEl = null;           // la barra de elegidas, pegada abajo
let _csgElegSeq = 0;                  // para los id de aria-labelledby
let _csgElegHojaVistos = null;        // clave → rótulo de los estantes que ya enseñó la hoja de mover abierta
/* Cuánto vale la copia de la nube para actuar sobre ella sin volver a
   pedirla (csgElegNubeAlDia): un minuto. Es lo que se tarda en elegir unas
   cuantas y tocar una acción; pasado eso, la acción pide la lista antes
   de escribir. */
const CSG_ELEG_AL_DIA = 60000;
/* Y cuánto espera una acción a que la nube conteste antes de escribir
   igual (csgElegGuarda): lo de aquí no se guarda en el aparato hasta
   entonces, y cerrar la aplicación en ese rato lo perdería. */
const CSG_ELEG_ESPERA = 4000;

/* ══════════════════════════════════════════════════════════════════
   LOS AYUDANTES COMUNES (los usan también el compositor y las hojas)
   ══════════════════════════════════════════════════════════════════ */

/* Construir DOM sin innerHTML: lo escrito va siempre por textContent. */
function csgEl(tag, cls, texto) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto !== undefined && texto !== null) e.textContent = String(texto);
  return e;
}

/* El botón de la casa: icono en su baldosa y PALABRA (regla 11 de
   Cuadernos: se reconoce por el dibujo y el color y se confirma leyendo,
   sin adivinar qué hace un icono mudo). Con palabra, el icono se esconde
   del lector de pantalla para que no lea «portapapeles Copiar». */
function csgBtn(cls, ic, texto, alTocar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'csg-btn' + (cls ? ' ' + cls : '');
  const hayTexto = texto !== undefined && texto !== null && texto !== '';
  if (ic !== undefined && ic !== null && ic !== '') {
    const i = csgEl('span', 'csg-btn-ic', ic);
    if (hayTexto) i.setAttribute('aria-hidden', 'true');
    b.appendChild(i);
  }
  if (hayTexto) b.appendChild(csgEl('span', 'csg-btn-t', texto));
  if (typeof alTocar === 'function') b.addEventListener('click', alTocar);
  return b;
}

/* Un botón sin la forma de csgBtn (chips, rótulos, renglones). */
function csgAnqBoton(cls, texto, alTocar) {
  const b = csgEl('button', cls, texto);
  b.type = 'button';
  if (typeof alTocar === 'function') b.addEventListener('click', alTocar);
  return b;
}

/* toast() y no showToast(): la de la aplicación es toast (La Voz
   Prestada, regla 14, perdió todos sus avisos por el nombre). */
function csgAviso(msg) {
  if (typeof toast !== 'function') return;
  toast(msg);
  /* ⚠️ Y SE QUEDA LO QUE TARDA EN LEERSE. toast() lo quita a los dos
     segundos, y aquí hay avisos de cien caracteres que son una
     instrucción («va en .claude/skills/<nombre>/SKILL.md…»). Pasados los
     cincuenta, cada letra alarga el reloj (hasta ocho segundos). Se usa el
     mismo reloj de toast() (`_t`), para que el siguiente aviso lo cancele
     como siempre. */
  const n = String(msg == null ? '' : msg).length;
  const el = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById('meta-toast') : null;
  if (el && n > 50) {
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; }, Math.min(8000, 2000 + 45 * (n - 50)));
  }
}

/* «hace 3 d»: lo justo para saber de un vistazo cuándo fue, sin leer una
   fecha. Pasadas unas semanas, «hace 11 sem» ya no se lee de un vistazo:
   ahí sale la fecha. Un reloj del futuro (otro aparato adelantado) no
   dice «hace -2 min»: dice «hace un momento». */
function csgHace(ms) {
  const t = Number(ms);
  if (!t || !isFinite(t)) return '';
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return 'hace un momento';
  const m = Math.floor(s / 60);
  if (m < 60) return 'hace ' + m + ' min';
  const h = Math.floor(m / 60);
  if (h < 24) return 'hace ' + h + ' h';
  const d = Math.floor(h / 24);
  if (d < 14) return 'hace ' + d + ' d';
  const sem = Math.floor(d / 7);
  if (sem < 9) return 'hace ' + sem + ' sem';
  const f = new Date(t);
  const ahora = new Date();
  return f.getDate() + ' ' + CSG_ANQ_MESES[f.getMonth()] + (f.getFullYear() === ahora.getFullYear() ? '' : ' ' + f.getFullYear());
}

/* El TONO de un estante sale de su CLAVE y no del orden (copia de
   rcuTono): si saliera del orden, crear un estante nuevo les cambiaría el
   color a todos los demás. Dos estantes pueden compartir tono; se paga a
   cambio de que ninguno cambie nunca. «Sin estante» va en gris. */
function csgTono(clave) {
  const k = csgClave(clave);
  if (!k) return 'csg-tono-x';
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return 'csg-tono-' + (h % CSG_ANQ_TONOS);
}

/* La clase de una pieza, siempre una de las cuatro: una fila tocada a
   mano con una clase desconocida se pinta como Prompt en vez de romper
   la ficha. */
function csgClaseDe(id) {
  for (let i = 0; i < CSG_CLASES.length; i++) if (CSG_CLASES[i].id === id) return CSG_CLASES[i];
  return CSG_CLASES[0];
}

/* El recuadro crece con lo escrito (como rcuCrecer). ⚠️ Y el sitio de la
   pantalla se guarda y se devuelve: poner la altura en `auto` encoge el
   recuadro un instante, y si la vista estaba desplazada hasta abajo el
   navegador la sube de golpe; escribiendo en el último bloque de un
   compositor largo, la vista saltaba en cada tecla. */
function csgCrecer(ta) {
  if (!ta || !ta.style) return;
  const sc = (ta.closest && ta.closest('.view-scroll, .fin-modal')) || null;
  const y = sc ? sc.scrollTop : 0;
  ta.style.height = 'auto';
  ta.style.height = Math.max(44, ta.scrollHeight + 2) + 'px';
  if (sc && sc.scrollTop !== y) sc.scrollTop = y;
}

/* ⚠️ COPIAR VA DENTRO DEL TOQUE. writeText se llama aquí mismo, sin
   ningún `await` delante: el Safari de un iPad solo deja escribir en el
   portapapeles mientras dura el gesto, y un `await` antes lo deja fuera.
   Si la API no existe (una página sin https) o rechaza, se prueba el
   camino viejo, un recuadro escondido y execCommand('copy'). Nunca lanza:
   quien copia recibe true o false y decide qué decir. */
function csgCopiarTexto(texto) {
  const t = String(texto == null ? '' : texto);
  let p = null;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      p = navigator.clipboard.writeText(t);
    }
  } catch (e) { p = null; }
  if (!p || typeof p.then !== 'function') return Promise.resolve(csgAnqCopiarViejo(t));
  return p.then(() => true, () => csgAnqCopiarViejo(t));
}

function csgAnqCopiarViejo(t) {
  let ta = null;
  let antes = null;
  try {
    antes = document.activeElement;
    ta = document.createElement('textarea');
    ta.value = t;
    /* readonly: que no salga el teclado de la tableta por un recuadro que
       nadie ve; y 16 px, para que el iPad no acerque la página al
       enfocarlo. Estas son las únicas líneas de estilo del archivo que no
       son mostrar o esconder, y son para esconder. */
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';
    ta.style.opacity = '0';
    ta.style.fontSize = '16px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { ta.setSelectionRange(0, t.length); } catch (e) {}
    return !!(document.execCommand && document.execCommand('copy'));
  } catch (e) {
    return false;
  } finally {
    try { if (ta && ta.parentNode) ta.parentNode.removeChild(ta); } catch (e) {}
    try { if (antes && antes !== document.body && typeof antes.focus === 'function') antes.focus({ preventScroll: true }); } catch (e) {}
  }
}

/* La última máquina es una costumbre de ESTE aparato (CSG_CLAVES.maquina)
   y no viaja: en la tableta del autor es Claude y en el teléfono de su
   hija puede ser Gemini. Si lo guardado ya no es una máquina conocida, se
   vuelve a Claude en vez de proponer una que no existe. */
function csgMaquinaUltima() {
  try {
    let v = localStorage.getItem(CSG_CLAVES.maquina);
    if (v) {
      v = String(v).replace(/^"+|"+$/g, '');
      for (let i = 0; i < CSG_MAQUINAS.length; i++) if (CSG_MAQUINAS[i].id === v) return v;
    }
  } catch (e) {}
  return 'claude';
}
function csgMaquinaApunta(id) {
  const v = String(id == null ? '' : id);
  if (!CSG_MAQUINAS.some(m => m.id === v)) return;
  try { localStorage.setItem(CSG_CLAVES.maquina, v); } catch (e) {}
}

/* Las preferencias del anaquel (CSG_CLAVES.anaquel): vista, orden,
   agrupación, grupos abiertos, filtro y «Sin explicaciones». Son del
   APARATO y nunca de la nube: cómo se mira un anaquel es una postura de
   esta pantalla, como la letra de La Voz Prestada. Se leen una vez y se
   devuelve SIEMPRE el mismo objeto, para que el compositor y el anaquel
   escriban en el mismo sitio; lo que no se reconoce se deja como estaba
   (el compositor puede guardar ahí algo suyo) y lo que viene torcido se
   vuelve a lo de siempre. */
function csgAnqPrefs() {
  if (_csgAnqPrefs) return _csgAnqPrefs;
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CSG_CLAVES.anaquel)); } catch (e) { d = null; }
  if (!d || typeof d !== 'object' || Array.isArray(d)) d = {};
  const f = (d.filtro && typeof d.filtro === 'object') ? d.filtro : {};
  const filtro = {};
  if (typeof f.clase === 'string' && CSG_CLASES.some(c => c.id === f.clase)) filtro.clase = f.clase;
  if (typeof f.estante === 'string' && f.estante && f.estante.length <= 80) filtro.estante = f.estante;
  if (typeof f.maquina === 'string' && f.maquina && f.maquina.length <= CSG_TOPES.maquina) filtro.maquina = f.maquina;
  if (f.especial === 'borradores' || f.especial === 'sinprobar') filtro.especial = f.especial;
  const abiertos = {};
  if (d.abiertos && typeof d.abiertos === 'object') Object.keys(d.abiertos).forEach(k => { if (d.abiertos[k]) abiertos[k] = true; });
  _csgAnqPrefs = Object.assign({}, d, {
    vista: d.vista === 'lista' ? 'lista' : 'fichas',
    orden: CSG_ANQ_ORDENES.some(o => o.id === d.orden) ? d.orden : 'ultima',
    agrupar: CSG_ANQ_AGRUPAR.some(a => a.id === d.agrupar) ? d.agrupar : 'no',
    abiertos,
    filtro,
    sinExplicaciones: !!d.sinExplicaciones,
  });
  return _csgAnqPrefs;
}
function csgAnqGuardaPrefs() {
  try { localStorage.setItem(CSG_CLAVES.anaquel, JSON.stringify(csgAnqPrefs())); } catch (e) {}
}

/* ⚠️ EL REPASO DE CADA FICHA, CON MEMORIA. El anaquel lo necesita para
   cada pieza en cada pintado —los chips cuentan los borradores y la
   ficha dice qué falta— y csgRevisar lee el texto entero. La llave es
   una HUELLA del contenido y no el reloj: el compositor puede pedir el
   repaso de una copia sin guardar, que lleva el `actualizado` de la
   pieza de la lista, y con el reloj de llave recibiría el repaso de lo
   que había antes de escribir. */
function csgAnqHuella(p, maq) {
  let h = 2166136261;
  const mete = s => {
    s = String(s == null ? '' : s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= 31; h = Math.imul(h, 16777619);
  };
  mete(maq); mete(p.molde); mete(p.clase); mete(p.titulo);
  let largo = 0;
  (Array.isArray(p.bloques) ? p.bloques : []).forEach(b => {
    if (!b) return;
    mete(b.id); mete(b.rotulo); mete(b.t);
    largo += String(b.t == null ? '' : b.t).length;
  });
  const mat = String(p.material == null ? '' : p.material);
  mete(mat.length); mete(mat.slice(0, 64)); mete(mat.slice(-64));
  /* El repaso avisa de un título repetido mirando las demás piezas: con
     la cuenta de la lista dentro, una pieza nueva invalida los repasos. */
  mete(_csgLista.length);
  return (h >>> 0).toString(36) + ':' + largo;
}
function csgRepaso(p) {
  const vacio = { para: [], avisa: [], palabras: 0, tokens: 0, cabe: true };
  if (!p) return vacio;
  const maq = p.maquina || csgMaquinaUltima();
  const k = csgAnqHuella(p, maq);
  const id = String(p.id || '');
  const ya = id ? _csgAnqRepasos.get(id) : null;
  if (ya && ya.k === k) return ya.r;
  let r;
  try { r = csgRevisar(p, maq); } catch (e) { r = vacio; }
  if (!r || !Array.isArray(r.para)) r = vacio;
  if (id) {
    if (_csgAnqRepasos.size > 400) _csgAnqRepasos.clear();
    _csgAnqRepasos.set(id, { k, r });
  }
  return r;
}

/* Lo primero que PARA, dicho en corto para la ficha: devuelve la frase
   ENTERA («falta Formato», «no cabe en la nube»), y quien la pinta le pone
   delante «🟡 borrador: ». Vacío si no para nada. Un «no se puede» a secas
   obligaría a abrir la pieza para saber qué le pasa. */
function csgFaltaDe(p) {
  const r = csgRepaso(p);
  if (!r.para || !r.para.length) return '';
  const x = r.para[0] || {};
  const msg = String(x.msg || '');
  const m = msg.match(/^Falta «([^»]+)»/);
  if (m) return 'falta ' + m[1];
  if (/^No cabe en la nube/.test(msg)) return 'no cabe en la nube';
  if (x.bloque === 'aristas') return /vuelve atrás/.test(msg) ? 'una vuelta atrás sin tope' : 'una arista a ninguna parte';
  if (x.bloque === 'nombre') return 'el name no vale';
  if (x.bloque === 'disparador') return 'la description es muy larga';
  if (x.bloque === 'ejemplos') return 'faltan pares de ejemplo';
  if ((x.arreglo && x.arreglo.tipo === 'hueco') || /hueco sin nombre/.test(msg)) return 'un hueco que no se puede rellenar';
  const corto = msg.split(/[:.]\s/)[0].trim();
  return corto.length > 42 ? csgCorta(corto, 41) + '…' : corto;
}

/* Los estantes de una pieza, limpios: sin vacíos, sin la misma clave dos
   veces y con los espacios de uno. «Maestría» y « maestria » son el mismo
   estante (csgClave), o el anaquel sacaría dos montones iguales. */
function csgAnqEstantesDe(p) {
  const out = [];
  const vistos = new Set();
  (Array.isArray(p && p.estantes) ? p.estantes : []).forEach(e => {
    const t = String(e == null ? '' : e).replace(/\s+/g, ' ').trim();
    const k = csgClave(t);
    if (!k || vistos.has(k)) return;
    vistos.add(k);
    out.push(t);
  });
  return out;
}

/* Todos los estantes de las piezas vivas, con su cuenta. El rótulo es
   como se escribió la PRIMERA vez que aparece, como en Cuadernos y en el
   export: el anaquel y el respaldo nombran igual el mismo montón. */
function csgEstantesTodos() {
  const m = new Map();
  csgVivas().forEach(p => csgAnqEstantesDe(p).forEach(e => {
    const k = csgClave(e);
    if (!m.has(k)) m.set(k, { clave: k, rotulo: e, n: 0 });
    m.get(k).n++;
  }));
  return [...m.values()].sort((a, b) => a.clave.localeCompare(b.clave, 'es'));
}
function csgAnqRotuloEstante(clave) {
  if (clave === CSG_ANQ_SIN) return 'Sin estante';
  if (_csgAnqRotulos.has(clave)) return _csgAnqRotulos.get(clave);
  const e = csgEstantesTodos().find(x => x.clave === clave);
  return e ? e.rotulo : clave;
}

/* ── La hoja vertical (#csg-ver-overlay) ─────────────────────────────
   UNA hoja para todo lo que se elige de una lista: estantes, orden, el
   menú ⋯ y sus sub-hojas, y lo que abra el compositor («¿Qué le vas a
   pedir?», los moldes). Renglones de 44 px uno debajo de otro, que es
   como se mira una estantería (La Voz Prestada, regla 33), y no seis
   filas de chips deslizándose. Quien la abre le pasa lo que la PINTA; así
   csgVerPintar() la repinta en su sitio después de un cambio (un estante
   que se pone) sin que nadie tenga que acordarse de qué había dentro. */
function csgVerAbrir(titulo, pintar) {
  csgAnqEngancha();
  const ov = document.getElementById('csg-ver-overlay');
  if (!ov) return;
  const t = document.getElementById('csg-ver-titulo');
  if (t) t.textContent = titulo == null ? '' : String(titulo);
  _csgAnqVerPintar = typeof pintar === 'function' ? pintar : null;
  csgVerPintar();
  ov.style.display = 'flex';
  const modal = ov.querySelector('.fin-modal');
  if (modal) modal.scrollTop = 0;
}
function csgVerPintar() {
  const cuerpo = document.getElementById('csg-ver-cuerpo');
  if (!cuerpo) return;
  const ov = document.getElementById('csg-ver-overlay');
  const modal = ov ? ov.querySelector('.fin-modal') : null;
  const y = modal ? modal.scrollTop : 0;
  cuerpo.textContent = '';
  if (_csgAnqVerPintar) {
    try { _csgAnqVerPintar(cuerpo); }
    catch (e) {
      /* Una hoja que se abre vacía se lee como un botón roto: se dice. */
      if (typeof console !== 'undefined') console.error('La Consigna · hoja vertical', e);
      cuerpo.appendChild(csgEl('p', 'csg-nota', 'No se pudo pintar esta hoja: ' + ((e && e.message) || e)));
    }
  }
  if (modal) modal.scrollTop = y;
}
function csgVerCerrar() {
  const ov = document.getElementById('csg-ver-overlay');
  if (ov) ov.style.display = 'none';
  _csgAnqVerPintar = null;
  const cuerpo = document.getElementById('csg-ver-cuerpo');
  if (cuerpo) cuerpo.textContent = '';
}
function csgAnqVerAbierta() {
  const ov = document.getElementById('csg-ver-overlay');
  return !!(ov && ov.style.display && ov.style.display !== 'none');
}
/* Un renglón de 44 px: icono, rótulo (y una segunda línea gris), cuenta.
   `on` puede ser true o false (un filtro, un interruptor: se dice con
   aria-pressed) o null (una acción del menú, que no está «puesta»). */
function csgVerFila(ic, rotulo, cuenta, on, alTocar, sub) {
  const b = csgAnqBoton('csg-ver-fila' + (on === true ? ' on' : ''), null, alTocar);
  const i = csgEl('span', 'csg-ver-ic', ic == null ? '' : ic);
  i.setAttribute('aria-hidden', 'true');
  b.appendChild(i);
  const t = csgEl('span', 'csg-ver-txt');
  t.appendChild(document.createTextNode(rotulo == null ? '' : String(rotulo)));
  if (sub) t.appendChild(csgEl('span', 'csg-ver-sub', sub));
  b.appendChild(t);
  if (cuenta !== '' && cuenta !== null && cuenta !== undefined) b.appendChild(csgEl('span', 'csg-ver-n', String(cuenta)));
  if (on === true || on === false) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  return b;
}
function csgVerSep(texto) {
  return csgEl('div', 'csg-ver-sep', texto);
}

/* ══════════════════════════════════════════════════════════════════
   LO QUE SE PREGUNTA DE CADA PIEZA
   ══════════════════════════════════════════════════════════════════ */

function csgAnqMaquinaNombre(id) {
  for (let i = 0; i < CSG_MAQUINAS.length; i++) if (CSG_MAQUINAS[i].id === id) return CSG_MAQUINAS[i].nombre;
  return String(id == null ? '' : id);
}
/* La máquina con que se agrupa y se filtra: la de la lista, o «Otra» si
   la pieza trae una que ya no se conoce (nunca un montón sin nombre). */
function csgAnqMaquinaDe(p) {
  return csgMaquina(p && p.maquina).id;
}
function csgAnqMolde(p) {
  const id = String((p && p.molde) || '');
  return Object.prototype.hasOwnProperty.call(CSG_MOLDES, id) ? CSG_MOLDES[id] : null;
}
/* Borrador = el repaso PARA algo (§2). Se guarda igual —guardar nunca se
   bloquea—, pero usar no, y eso es lo que el chip tiene que dejar ver. */
function csgAnqBorrador(p) {
  return csgRepaso(p).para.length > 0;
}
/* Sin probar = ningún uso contestado (§8). Copiada diez veces sin decir
   nunca si sirvió sigue sin probar: el trabajo es saber cuáles faltan. */
function csgAnqSinProbar(p) {
  return !(Array.isArray(p.bitacora) ? p.bitacora : []).some(u => u && u.ok);
}
function csgAnqValor(p) {
  let si = 0, no = 0, reg = 0;
  (Array.isArray(p.bitacora) ? p.bitacora : []).forEach(u => {
    if (!u) return;
    if (u.ok === 'si') si++; else if (u.ok === 'no') no++; else if (u.ok === 'regular') reg++;
  });
  return { si, no, reg, contestados: si + no + reg, puntos: si - no };
}
function csgAnqUsosMes(p) {
  const desde = Date.now() - 30 * CSG_ANQ_DIA;
  return (Array.isArray(p.bitacora) ? p.bitacora : []).filter(u => u && (Number(u.t) || 0) >= desde).length;
}
function csgAnqCorto(s, n) {
  const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  return csgLargoTexto(t) > n ? csgCorta(t, n - 1) + '…' : t;
}

/* Lo que mira el buscador, sin tildes ni mayúsculas (quien busca
   «revision» en una tableta no escribe la tilde): título, texto de los
   bloques, estantes, variables, máquina, clase y molde, y las notas de la
   bitácora —«inventó una fuente» es justo lo que se busca un mes
   después—. Con memoria por pieza: el texto de una pieza puede tener
   sesenta mil caracteres y se busca en cada tecla. */
function csgAnqTextoDe(p) {
  const bit = Array.isArray(p.bitacora) ? p.bitacora : [];
  let notas = 0;
  bit.forEach(u => { if (u && u.nota) notas += String(u.nota).length; });
  const k = (p.actualizado || 0) + '|' + bit.length + '|' + notas + '|' + String(p.titulo || '').length + '|' +
    (Array.isArray(p.bloques) ? p.bloques.length : 0) + '|' + (p.maquina || '') + '|' + (Array.isArray(p.estantes) ? p.estantes.join('\u0001') : '');
  const ya = _csgAnqTextos.get(p.id);
  if (ya && ya.k === k) return ya.t;
  const bloques = (Array.isArray(p.bloques) ? p.bloques : []).filter(Boolean);
  let vars = [];
  try { vars = csgVariables(bloques.map(b => String(b.t == null ? '' : b.t))); } catch (e) { vars = []; }
  const molde = csgAnqMolde(p);
  const partes = [
    p.titulo,
    bloques.map(b => (b.rotulo || '') + ' ' + (b.t || '')).join(' '),
    csgAnqEstantesDe(p).join(' '),
    vars.join(' '),
    p.maquina ? csgAnqMaquinaNombre(p.maquina) : '',
    csgClaseDe(p.clase).nombre,
    molde ? molde.nombre : '',
    p.notas,
    bit.map(u => (u && u.nota) || '').join(' '),
  ];
  const t = csgClave(partes.join(' '));
  if (_csgAnqTextos.size > 400) _csgAnqTextos.clear();
  _csgAnqTextos.set(p.id, { k, t });
  return t;
}

/* El filtro de verdad. `sinChip` deja fuera la clase y lo especial, que
   es lo que cuentan los chips: cada chip dice cuántas saldrían al
   tocarlo, con la búsqueda, el estante y la máquina ya puestos. Varias
   palabras en el buscador tienen que estar TODAS, en cualquier orden. */
function csgAnqFiltra(lista, sinChip) {
  const f = csgAnqPrefs().filtro;
  const q = csgClave(_csgAnqBusca);
  const palabras = q ? q.split(' ').filter(Boolean) : [];
  return lista.filter(p => {
    if (palabras.length) {
      const t = csgAnqTextoDe(p);
      if (!palabras.every(w => t.indexOf(w) >= 0)) return false;
    }
    if (f.estante) {
      const ks = csgAnqEstantesDe(p).map(csgClave);
      if (f.estante === CSG_ANQ_SIN ? ks.length > 0 : ks.indexOf(f.estante) < 0) return false;
    }
    if (f.maquina && csgAnqMaquinaDe(p) !== f.maquina) return false;
    if (!sinChip) {
      if (f.clase && csgClaseDe(p.clase).id !== f.clase) return false;
      if (f.especial === 'borradores' && !csgAnqBorrador(p)) return false;
      if (f.especial === 'sinprobar' && !csgAnqSinProbar(p)) return false;
    }
    return true;
  });
}

/* El orden. Por defecto, la ÚLTIMA USADA: lo que se usa a diario sube
   solo, sin ordenar nada a mano (la regla 5 de Cuadernos); a igualdad, lo
   último que se tocó. «Mejor valoradas» deja al final las que tienen
   menos de dos respuestas: una sola ✅ no es una valoración, y ponerla
   delante de una con ocho ✅ y un ❌ mentiría. */
function csgAnqOrdena(lista) {
  const o = csgAnqPrefs().orden;
  const ult = (a, b) => (b.ultima || 0) - (a.ultima || 0) || (b.actualizado || 0) - (a.actualizado || 0);
  const l = lista.slice();
  if (o === 'usos') l.sort((a, b) => (b.usos || 0) - (a.usos || 0) || ult(a, b));
  else if (o === 'valor') {
    l.sort((a, b) => {
      const va = csgAnqValor(a), vb = csgAnqValor(b);
      const pa = va.contestados < 2, pb = vb.contestados < 2;
      if (pa !== pb) return pa ? 1 : -1;
      if (!pa) return (vb.puntos - va.puntos) || (vb.contestados - va.contestados) || ult(a, b);
      return ult(a, b);
    });
  } else if (o === 'titulo') {
    l.sort((a, b) => {
      const ta = csgClave(a.titulo), tb = csgClave(b.titulo);
      if (!ta !== !tb) return ta ? -1 : 1;           // las sin título, al final
      return ta.localeCompare(tb, 'es') || ult(a, b);
    });
  } else if (o === 'recientes') l.sort((a, b) => (b.actualizado || 0) - (a.actualizado || 0) || ult(a, b));
  else l.sort(ult);
  return l;
}

/* Los grupos que se pintan: [{eje, clave, rotulo, items}]. Una pieza en
   dos estantes sale en los dos (La Voz Prestada, regla 32): enseñarla
   solo en el primero la escondería del montón donde alguien la busca. Y
   filtrando por el mismo eje con que se agrupa sale UN montón, el
   elegido: con la pieza en dos estantes, enseñar también el otro
   contestaría a una pregunta que nadie hizo. */
function csgAnqGrupos(lista) {
  const pr = csgAnqPrefs();
  const ag = pr.agrupar;
  const f = pr.filtro;
  if (ag === 'estante') {
    if (f.estante) return [{ eje: 'estante', clave: f.estante, rotulo: csgAnqRotuloEstante(f.estante), items: csgAnqOrdena(lista) }];
    const m = new Map();
    lista.forEach(p => csgAnqEstantesDe(p).forEach(e => {
      const k = csgClave(e);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    }));
    const gs = [...m.keys()].sort((a, b) => a.localeCompare(b, 'es'))
      .map(k => ({ eje: 'estante', clave: k, rotulo: csgAnqRotuloEstante(k), items: csgAnqOrdena(m.get(k)) }));
    const sin = lista.filter(p => !csgAnqEstantesDe(p).length);
    if (sin.length) gs.push({ eje: 'estante', clave: CSG_ANQ_SIN, rotulo: 'Sin estante', items: csgAnqOrdena(sin) });
    return gs;
  }
  if (ag === 'clase') {
    if (f.clase) { const c = csgClaseDe(f.clase); return [{ eje: 'clase', clave: c.id, rotulo: c.ic + ' ' + c.nombre, items: csgAnqOrdena(lista) }]; }
    return CSG_CLASES.map(c => ({ eje: 'clase', clave: c.id, rotulo: c.ic + ' ' + c.nombre,
      items: csgAnqOrdena(lista.filter(p => csgClaseDe(p.clase).id === c.id)) })).filter(g => g.items.length);
  }
  if (ag === 'maquina') {
    if (f.maquina) return [{ eje: 'maquina', clave: f.maquina, rotulo: csgAnqMaquinaNombre(f.maquina), items: csgAnqOrdena(lista) }];
    return CSG_MAQUINAS.map(mq => ({ eje: 'maquina', clave: mq.id, rotulo: mq.nombre,
      items: csgAnqOrdena(lista.filter(p => csgAnqMaquinaDe(p) === mq.id)) })).filter(g => g.items.length);
  }
  return [{ eje: 'no', clave: 'todo', rotulo: '', items: csgAnqOrdena(lista) }];
}

/* ══════════════════════════════════════════════════════════════════
   EL ANAQUEL (§8)
   ──────────────────────────────────────────────────────────────────
   ⚠️ ANTES DE LA PRIMERA FICHA, COMO MUCHO CINCO COSAS: la barra, el
   buscador, los chips, los filtros PUESTOS y el renglón de la bitácora,
   y las dos últimas solo existen cuando tienen algo dentro. Es lo que la
   regla 11 de Cuadernos quitó: seis franjas de mandos antes de la primera
   ficha, y la cuenta escrita tres veces. Por eso la nube va AL PIE, como
   franja solo cuando hay algo que arreglar; y por eso aquí no hay bloque
   de presentación mientras haya piezas. La sonda 13 cuenta los hijos.
   ══════════════════════════════════════════════════════════════════ */

function csgPintarAnaquel() {
  if (typeof document === 'undefined' || !document || !document.getElementById) return;
  const raiz = document.getElementById('csg-anaquel');
  if (!raiz) return;
  const ae = document.activeElement;
  /* ⚠️ Mientras se escribe la nota de un «¿sirvió?», el anaquel no se
     repinta: le arrancaría el recuadro de debajo de los dedos a mitad de
     frase (la nube llega cuando llega). Se apunta y se repinta después de
     soltar el recuadro, con un respiro: repintar EN el blur quitaría de
     debajo del dedo lo que se iba a tocar, y el toque se perdería. */
  if (ae && ae !== document.body && raiz.contains(ae) && ae.classList && ae.classList.contains('csg-pregunta-nota')) {
    _csgAnqPendiente = true;
    return;
  }
  _csgAnqPendiente = false;
  const focoClave = (ae && ae !== document.body && raiz.contains(ae) && ae.dataset && ae.dataset.csgFoco) || '';
  let barraX = 0;
  for (let i = 0; i < raiz.children.length; i++) {
    if (raiz.children[i].classList.contains('csg-barra')) { barraX = raiz.children[i].scrollLeft; break; }
  }
  _csgAnqGrupos = [];
  _csgAnqMando = null;
  _csgAnqRotulos = new Map(csgEstantesTodos().map(e => [e.clave, e.rotulo]));
  /* Los nodos de cada pieza elegible se apuntan de nuevo en cada pintado
     (csgElegPrepara): los del pintado anterior ya no están en la página. */
  _csgElegNodos = new Map();

  const vivas = csgVivas();
  const frag = document.createDocumentFragment();
  if (!vivas.length) {
    /* Sin ninguna viva no hay nada que elegir: el modo se apaga, o la barra
       de abajo se quedaría diciendo «Ninguna elegida» sobre un anaquel
       vacío (pasa si otro aparato retira las últimas mientras se elige). */
    if (csgElegActivo()) { _csgEleg = null; _csgElegRetirar = false; }
    const seguir = csgAnqSeguirFila();
    if (seguir) frag.appendChild(seguir);
    csgAnqVacio(frag);
    const ret = csgAnqRetiradas();
    if (ret) frag.appendChild(ret);
    frag.appendChild(csgAnqNube());
    raiz.textContent = '';
    raiz.appendChild(frag);
    csgElegPinta();
    return;
  }

  const filtradas = csgAnqFiltra(vivas, false);
  const grupos = csgAnqGrupos(filtradas);
  const buscando = !!csgClave(_csgAnqBusca);
  const conMando = grupos.length > 1;

  const barra = csgAnqBarra();
  const fila = csgAnqBuscaFila(conMando && !buscando ? grupos : null);
  const chips = csgAnqChips(vivas);
  frag.appendChild(chips);
  const puestos = csgAnqPuestos(vivas.length, filtradas.length);
  if (puestos) frag.appendChild(puestos);
  /* El renglón de «seguir» y el de la bitácora ocupan el MISMO sitio, y
     solo uno cada vez (ver csgAnqSeguirFila): antes de la primera ficha
     caben como mucho cinco cosas (§8, regla 21). Quién se lo queda lo
     decide la apertura (initConsigna); si el suyo se va —se contestó, se
     descartó—, el hueco pasa al otro. */
  let preg = _csgAnqSeguirAhora ? csgAnqSeguirFila() : null;
  if (!preg) preg = csgBitFila();
  if (!preg) preg = csgAnqSeguirFila();
  if (preg) frag.appendChild(preg);
  csgAnqContenido(frag, filtradas, grupos, buscando, conMando);
  const ret = csgAnqRetiradas();
  if (ret) frag.appendChild(ret);
  frag.appendChild(csgAnqNube());

  /* ⚠️ LA FILA DEL BUSCADOR NO SE REHACE: se queda en su sitio y se
     cambia lo de alrededor. Sacar del documento un recuadro con el foco lo
     desenfoca, y en una tableta eso cierra el teclado en cada letra (y lo
     vuelve a abrir, si se le devuelve el foco). Todo se quita y se pone en
     el mismo tirón, sin medir nada en medio: si el navegador midiera la
     página a medio vaciar, bajaría el desplazamiento a cero y la vista
     saltaría arriba. */
  if (fila.parentNode === raiz) {
    Array.from(raiz.childNodes).forEach(n => { if (n !== fila) raiz.removeChild(n); });
    raiz.insertBefore(barra, fila);
    raiz.appendChild(frag);
  } else {
    raiz.textContent = '';
    raiz.appendChild(barra);
    raiz.appendChild(fila);
    raiz.appendChild(frag);
  }

  /* Ya en el documento, lo que se mide: la barra vuelve a donde estaba
   (sin eso, tocar ☰ al final de la barra la devolvía al principio y las
   vistas quedaban fuera de la pantalla), y el chip puesto se trae a la
   vista. */
  if (barraX) barra.scrollLeft = barraX;
  csgAnqChipALaVista(chips);
  if (focoClave) {
    const el = Array.from(raiz.querySelectorAll('[data-csg-foco]')).find(x => x.dataset.csgFoco === focoClave);
    if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  }
  /* La barra de elegidas se pone al día con lo que quedó a la vista: un
     filtro, una búsqueda o la nube cambian cuáles «no se ven». */
  csgElegPinta();
}

/* Sin ninguna pieza viva: la presentación y la tarjeta del §8, con las
   dos puertas. Aquí sí va el bloque de presentación: con el anaquel vacío
   no hay nada que empujar hacia abajo, y es la única vez que alguien
   necesita que le digan qué es esto. */
function csgAnqVacio(frag) {
  const intro = csgEl('div', 'msug-intro csg-intro');
  const ic = csgEl('div', 'msug-intro-ic', CSG_EMOJI);
  ic.setAttribute('aria-hidden', 'true');
  intro.appendChild(ic);
  const caja = csgEl('div');
  caja.appendChild(csgEl('p', 'msug-intro-txt', CSG_LEMA));
  /* Las máquinas salen de CSG_MAQUINAS, no de una lista escrita aquí: el
     día que entre una, esta frase la nombra sola. */
  const maqs = CSG_MAQUINAS.filter(m => m.id !== 'otra').map(m => m.nombre);
  const lista = maqs.length > 1 ? maqs.slice(0, -1).join(', ') + ' o ' + maqs[maqs.length - 1] : maqs.join('');
  caja.appendChild(csgEl('span', 'msug-intro-count', 'Prompts, habilidades, grafos de agentes y bucles, con la forma que pide ' + lista + '.'));
  intro.appendChild(caja);
  frag.appendChild(intro);

  const v = csgEl('div', 'csg-vacio');
  const grande = csgEl('div', 'csg-vacio-ic', CSG_EMOJI);
  grande.setAttribute('aria-hidden', 'true');
  v.appendChild(grande);
  /* El texto del §8 tal cual, en UN párrafo: partido en dos, el
     textContent de la tarjeta juntaría las frases sin espacio. */
  const p = csgEl('p');
  p.appendChild(csgEl('strong', '', 'Todavía no hay consignas.'));
  p.appendChild(document.createTextNode(' Cada consigna es lo que le pides a una máquina, con forma: un prompt, una habilidad, un grafo de agentes o un bucle. Se escribe una vez, se guarda y se vuelve a usar en dos toques.'));
  v.appendChild(p);
  const acc = csgEl('div', 'csg-vacio-acciones');
  acc.appendChild(csgBtn('csg-btn-lleno', '＋', 'Nueva', () => csgAnqNueva()));
  acc.appendChild(csgBtn('csg-btn-tenido', '📋', 'Pegar una que ya tengas', () => csgAnqPegar()));
  v.appendChild(acc);
  frag.appendChild(v);
}

/* Las puertas a las otras dos partes. Van por aquí para que, si una de
   ellas no cargó, el botón lo DIGA en vez de reventar: un toque que no
   hace nada se lee como una aplicación rota. */
function csgAnqNueva() {
  if (typeof csgNueva === 'function') csgNueva();
  else csgAviso('No se pudo abrir el compositor: vuelve a abrir F.A.R.O');
}
function csgAnqPegar() {
  if (typeof csgAbrirPegar === 'function') csgAbrirPegar('');
  else csgAviso('No se pudo abrir la hoja de pegar: vuelve a abrir F.A.R.O');
}
function csgAnqUsar(p) {
  if (typeof csgAbrirUsar === 'function') csgAbrirUsar(p);
  else csgAviso('No se pudo abrir la hoja de usar: vuelve a abrir F.A.R.O');
}
function csgAnqCorregir(p) {
  if (typeof csgAbrirCompositor === 'function') csgAbrirCompositor(p);
  else csgAviso('No se pudo abrir el compositor: vuelve a abrir F.A.R.O');
}

/* La barra: UNA fila que se desliza, los botones PRIMERO (lo que se toca a
   diario) y las vistas al final (se tocan una vez al mes). Es lo que se
   aprendió con ☑ Elegir en La Voz Prestada: lo último de una barra que se
   desliza es lo que se sale de la pantalla. El color dice la función:
   crear lleno, traer teñido, mirar neutro, sacar ámbar. */
/* ⚠️ ☑ ELEGIR VA JUSTO DETRÁS DE 📋 PEGAR, y no entre ⇅ Orden y 📋
   Exportar, que es donde lo ponía el §8 del plan. Medido el 23 de
   septiembre de 2026 con la vista abierta de verdad: a 320 px la barra
   mide 280 de ancho (con el degradado del borde en sus últimos 22), y
   ＋ Nueva y 📋 Pegar ya llegaban al píxel 225; 🗂 Estantes empezaba en el
   246 y acababa en el 361, y ⇅ Orden en el 469. Detrás de Orden, Elegir
   habría empezado en el 477, o sea FUERA de la pantalla en todos los
   teléfonos —a 390 solo se veían Nueva, Pegar y medio Estantes—: la mitad
   de lo que se pidió no se vería sin deslizar una barra que no parece
   deslizarse. Es la avería exacta de la regla 33 de La Voz Prestada, y la
   respuesta es la misma: los tres botones que se tocan PRIMERO, y lo que
   se sale por la derecha, lo que menos se toca (las vistas ▦ ☰, y antes
   📋 Exportar). Y por debajo de 390 px el CSS ciñe los botones de la
   barra (menos relleno, la baldosa más pequeña): aun adelantado, Elegir
   acababa en el 330, que a 320 es pasado el borde de la barra (300) y a
   360 debajo de su degradado; ceñido acaba en el 274, entero. */
function csgAnqBarra() {
  const pr = csgAnqPrefs();
  const barra = csgEl('div', 'csg-barra');
  const pon = (b, foco) => { b.dataset.csgFoco = foco; barra.appendChild(b); return b; };
  pon(csgBtn('csg-btn-lleno', '＋', 'Nueva', () => csgAnqNueva()), 'barra:nueva');
  pon(csgBtn('csg-btn-tenido', '📋', 'Pegar', () => csgAnqPegar()), 'barra:pegar');
  /* Un interruptor: puesto se ve puesto (aria-pressed y teñido), y volver
     a tocarlo sale del modo, igual que ✕ Salir de la barra de abajo. La
     palabra no cambia, para que la barra no se mueva al tocarlo. */
  const eligiendo = csgElegActivo();
  const bE = pon(csgBtn('csg-btn-neutro csg-anq-elegir' + (eligiendo ? ' on' : ''), '☑', 'Elegir',
    () => (csgElegActivo() ? csgElegSalir() : csgElegEntrar())), 'barra:elegir');
  bE.setAttribute('aria-pressed', eligiendo ? 'true' : 'false');
  const sep = () => { const s = csgEl('span', 'csg-barra-sep'); s.setAttribute('aria-hidden', 'true'); barra.appendChild(s); };
  sep();
  pon(csgBtn('csg-btn-neutro', '🗂', 'Estantes', csgAnqEstantesAbrir), 'barra:estantes');
  pon(csgBtn('csg-btn-neutro', '⇅', 'Orden', csgAnqOrdenAbrir), 'barra:orden');
  sep();
  pon(csgBtn('csg-btn-ambar', '📋', 'Exportar', csgAnqExportar), 'barra:exportar');
  const vistas = csgEl('div', 'csg-vistas');
  vistas.setAttribute('role', 'group');
  vistas.setAttribute('aria-label', 'Cómo se ven');
  [['fichas', '▦', 'Ver en fichas'], ['lista', '☰', 'Ver en lista']].forEach(([id, ic, et]) => {
    const on = pr.vista === id;
    const b = csgAnqBoton('csg-chip' + (on ? ' on' : ''), ic, () => {
      if (csgAnqPrefs().vista === id) return;
      csgAnqPrefs().vista = id;
      csgAnqGuardaPrefs();
      csgPintarAnaquel();
    });
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', et);
    b.dataset.csgFoco = 'vista:' + id;
    vistas.appendChild(b);
  });
  barra.appendChild(vistas);
  return barra;
}

/* ⚠️ La fila del buscador se crea UNA vez y se reutiliza (ver
   csgPintarAnaquel): solo se le cambia el mando de al lado. El mando es el
   único de la lista, y hace falta porque lo abierto se recuerda a
   propósito: quien abrió cinco estantes para buscar una cosa se queda con
   cinco abiertos para siempre. Buscando no sale: buscando se abre todo. */
function csgAnqBuscaFila(grupos) {
  if (!_csgAnqBuscaFila) {
    const fila = csgEl('div', 'csg-busca');
    const inp = csgEl('input', 'csg-busca-input');
    inp.type = 'search';
    inp.placeholder = '🔍 Buscar una consigna…';
    inp.setAttribute('aria-label', 'Buscar en las consignas: título, bloques, estantes, variables, máquina y notas');
    inp.setAttribute('autocomplete', 'off');
    inp.setAttribute('enterkeyhint', 'search');
    inp.spellcheck = false;
    inp.value = _csgAnqBusca;
    inp.addEventListener('input', () => {
      clearTimeout(_csgAnqBuscaT);
      _csgAnqBuscaT = setTimeout(() => { _csgAnqBusca = inp.value; csgPintarAnaquel(); }, 180);
    });
    fila.appendChild(inp);
    _csgAnqBuscaFila = fila;
  }
  const fila = _csgAnqBuscaFila;
  Array.from(fila.querySelectorAll('.csg-busca-mando')).forEach(n => n.parentNode.removeChild(n));
  if (grupos && grupos.length > 1) {
    const m = csgAnqBoton('csg-busca-mando', '', csgAnqMandoTocar);
    m.dataset.csgFoco = 'mando';
    _csgAnqMando = m;
    csgAnqMandoRotulo(grupos.map(g => g.eje + ':' + g.clave));
    fila.appendChild(m);
  }
  return fila;
}
function csgAnqMandoRotulo(claves) {
  if (!_csgAnqMando) return;
  const ks = claves || _csgAnqGrupos.map(r => r.k);
  const ab = csgAnqPrefs().abiertos;
  const alguno = ks.some(k => ab[k]);
  _csgAnqMando.textContent = alguno ? '▴ Cerrar todos' : '▾ Abrir todos';
}
/* Se toca el DOM, no se repinta (regla 40 de La Voz Prestada): un
   repintado deja sin foco al botón que se acaba de pulsar y le arranca a
   la tableta la tarjeta que iba a recibir el toque siguiente. */
function csgAnqMandoTocar() {
  const ab = csgAnqPrefs().abiertos;
  const alguno = _csgAnqGrupos.some(r => ab[r.k]);
  _csgAnqGrupos.forEach(r => {
    if (alguno) delete ab[r.k]; else ab[r.k] = true;
    csgAnqPonAbierto(r, !alguno);
  });
  csgAnqGuardaPrefs();
  csgAnqMandoRotulo();
  /* Plegar esconde fichas: la cuenta de «no se ven» de la barra de elegidas
     cambia sin que se repinte nada más. */
  csgElegPinta();
}

/* Los chips de clase, con su cuenta, en UNA fila que se desliza. «Sin
   probar» va TERCERO: el trabajo no es ver los prompts, es saber cuáles
   faltan por probar (la misma lección que «Sin video» en Videos
   M.E.T.A.S). Un chip a cero no sale —dice que no hay nada, y el anaquel
   ya lo dice sin él—, salvo que esté puesto. */
function csgAnqChips(vivas) {
  const f = csgAnqPrefs().filtro;
  const base = csgAnqFiltra(vivas, true);
  const fila = csgEl('div', 'csg-chips csg-desliza');
  fila.setAttribute('role', 'group');
  fila.setAttribute('aria-label', 'Filtrar por clase');
  const chip = (foco, rotulo, n, on, alTocar) => {
    if (!n && !on && foco !== 'chip:todas') return;
    const b = csgAnqBoton('csg-chip' + (on ? ' on' : ''), rotulo, alTocar);
    b.appendChild(csgEl('span', 'csg-chip-n', String(n)));
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.dataset.csgFoco = foco;
    fila.appendChild(b);
  };
  const pon = cambio => { csgAnqPonFiltro(cambio); csgPintarAnaquel(); };
  chip('chip:todas', 'Todas', base.length, !f.clase && !f.especial, () => pon({ clase: '', especial: '' }));
  Object.keys(CSG_ANQ_ESPECIALES).forEach(id => {
    const e = CSG_ANQ_ESPECIALES[id];
    const n = base.filter(id === 'borradores' ? csgAnqBorrador : csgAnqSinProbar).length;
    const on = f.especial === id;
    chip('chip:' + id, e.ic + ' ' + e.t, n, on, () => pon(on ? { especial: '' } : { especial: id }));
  });
  CSG_CLASES.forEach(c => {
    const n = base.filter(p => csgClaseDe(p.clase).id === c.id).length;
    const on = f.clase === c.id;
    chip('chip:' + c.id, c.ic + ' ' + c.nombre, n, on, () => pon(on ? { clase: '' } : { clase: c.id }));
  });
  return fila;
}
function csgAnqChipALaVista(fila) {
  if (!fila || !fila.getClientRects || !fila.getClientRects().length) return;
  const on = fila.querySelector('.csg-chip.on');
  if (!on || on === fila.firstElementChild) { fila.scrollLeft = 0; return; }
  const r = fila.getBoundingClientRect();
  const c = on.getBoundingClientRect();
  fila.scrollLeft += (c.left - r.left) - (r.width - c.width) / 2;
}

/* Poner o quitar un filtro. La clase y lo especial son UN solo sitio (la
   fila de chips elige uno), y el estante y la máquina van aparte: se
   puede mirar «los borradores de Maestría». `null` lo quita todo. */
function csgAnqPonFiltro(cambio) {
  const pr = csgAnqPrefs();
  if (!cambio) { pr.filtro = {}; csgAnqGuardaPrefs(); return; }
  const f = Object.assign({}, pr.filtro);
  if ('estante' in cambio) { if (cambio.estante) f.estante = cambio.estante; else delete f.estante; }
  if ('maquina' in cambio) { if (cambio.maquina) f.maquina = cambio.maquina; else delete f.maquina; }
  if ('clase' in cambio || 'especial' in cambio) {
    delete f.clase; delete f.especial;
    if (cambio.clase) f.clase = cambio.clase;
    if (cambio.especial) f.especial = cambio.especial;
  }
  pr.filtro = f;
  csgAnqGuardaPrefs();
}
function csgAnqQuitarFiltros() {
  csgAnqPonFiltro(null);
  _csgAnqBusca = '';
  clearTimeout(_csgAnqBuscaT);
  if (_csgAnqBuscaFila) {
    const inp = _csgAnqBuscaFila.querySelector('.csg-busca-input');
    if (inp) inp.value = '';
  }
  csgPintarAnaquel();
}

/* Los filtros PUESTOS, cada uno con su ✕, y al final «3 de 12». Sin
   filtro ni búsqueda la fila no existe: una fila que dice «12 de 12» es
   una noticia que ya se sabe. */
function csgAnqPuestos(total, vistas) {
  const f = csgAnqPrefs().filtro;
  const buscando = !!csgClave(_csgAnqBusca);
  const lista = [];
  if (f.estante) lista.push({ t: (f.estante === CSG_ANQ_SIN ? '' : '🗂 ') + csgAnqRotuloEstante(f.estante), foco: 'puesto:estante', quita: { estante: '' } });
  if (f.maquina) lista.push({ t: '🤖 ' + csgAnqMaquinaNombre(f.maquina), foco: 'puesto:maquina', quita: { maquina: '' } });
  if (f.clase) { const c = csgClaseDe(f.clase); lista.push({ t: c.ic + ' ' + c.nombre, foco: 'puesto:clase', quita: { clase: '' } }); }
  if (f.especial && CSG_ANQ_ESPECIALES[f.especial]) {
    const e = CSG_ANQ_ESPECIALES[f.especial];
    lista.push({ t: e.ic + ' ' + e.t, foco: 'puesto:especial', quita: { especial: '' } });
  }
  if (!lista.length && !buscando) return null;
  const fila = csgEl('div', 'csg-puestos');
  lista.forEach(x => {
    const b = csgAnqBoton('csg-puesto', x.t + ' ✕', () => { csgAnqPonFiltro(x.quita); csgPintarAnaquel(); });
    b.setAttribute('aria-label', 'Quitar este filtro');
    b.dataset.csgFoco = x.foco;
    fila.appendChild(b);
  });
  fila.appendChild(csgEl('span', 'csg-puestos-n', vistas + ' de ' + total));
  return fila;
}

/* Las fichas, en su caja o en sus grupos. ⚠️ LOS GRUPOS SE PLIEGAN CON
   LAS CUATRO REGLAS DEL ANAQUEL (La Voz Prestada, regla 40; Cuadernos,
   regla 4), y cada una salió de un fallo medido:
   · NADA SE ABRE SOLO: abrir «los que tengan algo» es abrir todos.
   · UN SOLO MONTÓN NO LLEVA MANDO: se pinta como rótulo, no como botón;
     cobrar un toque por un nivel que no separa nada es peor que no
     agrupar.
   · BUSCANDO SE ABRE TODO Y ESO NO SE GUARDA: un resultado escondido
     detrás de un rótulo plegado se lee igual que una búsqueda que no
     encontró nada.
   · TODO SE PINTA Y SE ESCONDE CON `hidden`; nunca nace al abrir: lo que
     no está en el documento no lo encuentra ni el buscador de la página
     ni la sonda. (.csg-grupo[hidden] lleva su display:none !important en
     el CSS: sin él, el `hidden` del navegador pierde contra el display de
     la clase y el mando responde sin hacer nada.)
   La llave lleva el eje delante (estante:maestria, clase:prompt,
   maquina:claude): un estante llamado «Prompt» y la clase prompt no
   pueden compartir llave. */
function csgAnqContenido(frag, filtradas, grupos, buscando, conMando) {
  const pr = csgAnqPrefs();
  if (!filtradas.length) {
    const v = csgEl('div', 'csg-vacio');
    v.appendChild(csgEl('p', '', 'Ninguna consigna con eso. Prueba con otra palabra o quita los filtros.'));
    v.appendChild(csgBtn('csg-btn-neutro', '✕', 'Quitar la búsqueda y los filtros', csgAnqQuitarFiltros));
    frag.appendChild(v);
    return;
  }
  const hazCaja = () => csgEl('div', pr.vista === 'lista' ? 'csg-lista' : 'csg-grid');
  const pinta = (caja, g) => g.items.forEach(p => caja.appendChild(pr.vista === 'lista' ? csgFichaFila(p, g) : csgFichaCrear(p, g)));
  if (grupos.length === 1 && !grupos[0].rotulo) {
    const caja = hazCaja();
    pinta(caja, grupos[0]);
    frag.appendChild(caja);
    return;
  }
  grupos.forEach((g, i) => {
    const k = g.eje + ':' + g.clave;
    const tono = g.eje === 'estante' ? csgTono(g.clave === CSG_ANQ_SIN ? '' : g.clave)
      : g.eje === 'clase' ? 'csg-clase-' + g.clave : 'csg-tono-x';
    const sec = csgEl('section');
    const caja = csgEl('div', 'csg-grupo');
    const dentro = hazCaja();
    pinta(dentro, g);
    caja.appendChild(dentro);
    if (!conMando) {
      const rot = csgEl('div', 'csg-grupo-rot-solo ' + tono);
      rot.appendChild(csgEl('span', 'csg-grupo-nombre', g.rotulo));
      rot.appendChild(csgEl('span', 'csg-grupo-n', String(g.items.length)));
      sec.appendChild(rot);
      sec.appendChild(caja);
      frag.appendChild(sec);
      return;
    }
    const rot = csgAnqBoton('csg-grupo-rot ' + tono, null, null);
    rot.appendChild(csgEl('span', 'csg-grupo-nombre', g.rotulo));
    rot.appendChild(csgEl('span', 'csg-grupo-n', String(g.items.length)));
    /* Plegado, el rótulo enseña los emojis de clase de lo que hay dentro,
       pegados a la cuenta: se sabe qué hay sin abrirlo. Agrupando por
       clase no sale: serían cinco veces el mismo emoji. */
    let vista = null;
    if (g.eje !== 'clase') {
      const em = g.items.slice(0, 5).map(p => csgClaseDe(p.clase).ic).join('');
      vista = csgEl('span', 'csg-grupo-vista', em + (g.items.length > 5 ? ' +' + (g.items.length - 5) : ''));
      vista.setAttribute('aria-hidden', 'true');
      rot.appendChild(vista);
    }
    /* El galón es una letra de verdad y no un icono de Font Awesome: ese
       viene de un CDN, y si no llega el rótulo se queda sin nada que diga
       que se abre. Siempre «▾»; plegado lo gira el CSS por aria-expanded. */
    const galon = csgEl('span', 'csg-grupo-galon', '▾');
    galon.setAttribute('aria-hidden', 'true');
    rot.appendChild(galon);
    rot.dataset.csgFoco = 'grupo:' + i;
    const reg = { k, rot, caja, vista };
    rot.addEventListener('click', () => csgAnqAlternar(reg));
    csgAnqPonAbierto(reg, buscando || !!pr.abiertos[k]);
    _csgAnqGrupos.push(reg);
    sec.appendChild(rot);
    sec.appendChild(caja);
    frag.appendChild(sec);
  });
}
function csgAnqPonAbierto(reg, abierto) {
  reg.caja.hidden = !abierto;
  reg.rot.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  if (reg.vista) reg.vista.hidden = abierto;
}
/* Al pulsar se toca el DOM y NO se repinta. Buscando, lo que se abre o
   cierra no se guarda (es el efecto de la búsqueda, no una decisión); y
   lo cerrado se BORRA de la llave en vez de guardarse en falso, para que
   no crezca con lo que alguien abrió una vez. */
function csgAnqAlternar(reg) {
  const abrir = reg.caja.hidden;
  csgAnqPonAbierto(reg, abrir);
  if (!csgClave(_csgAnqBusca)) {
    const ab = csgAnqPrefs().abiertos;
    if (abrir) ab[reg.k] = true; else delete ab[reg.k];
    csgAnqGuardaPrefs();
    csgAnqMandoRotulo();
  }
  csgElegPinta();
}

/* ── La ficha (▦) ───────────────────────────────────────────────────
   Vertical y con los botones al pie, sin hueco entre lo que dice y lo que
   se puede hacer (la captura de Cuadernos: medio metro de nada en medio).
   Lo que ya está dicho no se repite: el estante del grupo no sale dentro
   como chip, y «v1» no dice nada. Tres botones y no cuatro: Copiar vive en
   Usar y en ⋯ (§8: cuatro botones eran las cajitas que el autor
   rechazó). */
function csgFichaCrear(p, g) {
  const clase = csgClaseDe(p.clase);
  const art = csgEl('article', 'csg-ficha csg-clase-' + clase.id);
  const cab = csgEl('div', 'csg-ficha-cab');
  const bal = csgEl('span', 'csg-baldosa', clase.ic);
  bal.setAttribute('aria-hidden', 'true');
  cab.appendChild(bal);
  const tit = String(p.titulo || '').trim();
  const titEl = csgEl('span', 'csg-ficha-titulo' + (tit ? '' : ' csg-ficha-titulo-vacio'), tit || CSG_SIN_TITULO);
  cab.appendChild(titEl);
  art.appendChild(cab);
  art.appendChild(csgFichaMeta(p));

  const f = csgAnqPrefs().filtro;
  const enEstante = (g && g.eje === 'estante' && g.clave !== CSG_ANQ_SIN) ? g.clave
    : (f.estante && f.estante !== CSG_ANQ_SIN) ? f.estante : '';
  const otros = csgAnqEstantesDe(p).filter(e => csgClave(e) !== enEstante);
  if (otros.length) {
    const ests = csgEl('div', 'csg-ficha-estantes');
    otros.forEach(e => ests.appendChild(csgEl('span', csgTono(e), _csgAnqRotulos.get(csgClave(e)) || e)));
    art.appendChild(ests);
  }
  const ex = csgFichaExtracto(p);
  if (ex) art.appendChild(ex);

  /* ⚠️ MIENTRAS SE ELIGE, EL TOQUE ELIGE Y NADA MÁS: la ficha entera es la
     casilla y los tres botones del pie NO se pintan. Dejarlos puestos
     sería pedirle al mismo dedo dos cosas a la vez —un toque que cae en
     ▶ Usar abriría la hoja encima y la selección se perdería detrás—. */
  if (csgElegActivo()) { csgElegPrepara(art, p, titEl); return art; }
  const pie = csgEl('div', 'csg-ficha-pie');
  pie.appendChild(csgBtn('csg-btn-lleno', '▶', 'Usar', () => csgAnqUsar(p)));
  pie.appendChild(csgBtn('csg-btn-neutro', '✎', 'Corregir', () => csgAnqCorregir(p)));
  const mas = csgBtn('csg-mas csg-btn-neutro', '⋯', '', () => csgMenuAbrir(p));
  mas.setAttribute('aria-label', 'Más: copiar, duplicar, versiones, bitácora, estantes, retirar');
  pie.appendChild(mas);
  art.appendChild(pie);
  return art;
}

/* UNA línea corrida, con un token delante solo cuando toca, y nunca los
   dos: el borrador manda, porque una pieza que no se puede usar no se
   gradúa. */
function csgFichaMeta(p) {
  const meta = csgEl('div', 'csg-ficha-meta');
  const falta = csgFaltaDe(p);
  if (falta) {
    meta.appendChild(csgEl('span', 'csg-ficha-token csg-ficha-token-borrador', '🟡 borrador: ' + falta));
  } else if (csgClaseDe(p.clase).id === 'prompt') {
    const n = csgAnqUsosMes(p);
    /* Mientras se elige, el token se DICE pero no se toca: es un botón
       dentro de la ficha, y el toque que la elige lo pulsaría también. */
    if (n >= CSG_ANQ_USOS_MES && csgElegActivo()) {
      meta.appendChild(csgEl('span', 'csg-ficha-token csg-ficha-token-uso', '⚠ ' + n + ' usos este mes'));
    } else if (n >= CSG_ANQ_USOS_MES) {
      const b = csgAnqBoton('csg-ficha-token csg-ficha-token-uso', '⚠ ' + n + ' usos este mes ▸', () => csgFichaGraduar(p));
      b.setAttribute('aria-label', 'Usada ' + n + ' veces este mes: hacer una copia como Instrucción de sistema');
      meta.appendChild(b);
    }
  }
  const partes = csgFichaPartes(p);
  if (partes.length) meta.appendChild(document.createTextNode((meta.childNodes.length ? ' ' : '') + partes.join(' · ')));
  return meta;
}
function csgFichaPartes(p) {
  const molde = csgAnqMolde(p);
  const v = csgAnqValor(p);
  const usos = Math.max(0, parseInt(p.usos, 10) || 0);
  const partes = [
    molde ? molde.nombre : '',
    p.maquina ? csgAnqMaquinaNombre(p.maquina) : '',
    (parseInt(p.version, 10) || 1) > 1 ? 'v' + parseInt(p.version, 10) : '',
    usos ? (usos === 1 ? '1 uso' : usos + ' usos') : 'sin usar',
    v.si ? '👍 ' + v.si : '',
    v.no ? '👎 ' + v.no : '',
    /* Ordenando por valoración, las que van al final dicen por qué: si
       no, parecen las peores y son solo las menos contestadas. */
    csgAnqPrefs().orden === 'valor' && v.contestados < 2 ? 'pocos usos' : '',
    csgHace(p.ultima || p.actualizado),
  ];
  return partes.filter(Boolean);
}
/* «⚠ 3 usos este mes ▸» hace exactamente lo mismo que ⋯ → Duplicar hacia
   Habilidad · Instrucción de sistema, sin guardar (§6.9): un solo
   mecanismo, a la vista, y la original no se toca. */
function csgFichaGraduar(p) {
  if (typeof csgDuplicarEnMolde !== 'function' || typeof csgAbrirCompositor !== 'function') {
    csgAviso('No se pudo abrir el compositor: vuelve a abrir F.A.R.O');
    return;
  }
  const nueva = csgDuplicarEnMolde(p, 'sistema');
  if (!nueva) { csgAviso('No se pudo preparar la copia'); return; }
  csgAbrirCompositor(nueva);
  const m = CSG_MOLDES.sistema;
  csgAviso('Una copia como 🧰 ' + (m ? m.nombre : 'Instrucción de sistema') + ', sin guardar: la original sigue igual');
}
/* El primer bloque OBLIGATORIO con texto, en dos líneas grises. Se salta
   el que aún tiene su texto de nacimiento (la etiqueta de Voz prestada o
   de Careo): sería la misma frase en todas las fichas de ese molde. */
function csgFichaExtracto(p) {
  const molde = csgAnqMolde(p);
  let t = '';
  if (molde) {
    for (let i = 0; i < molde.bloques.length && !t; i++) {
      const b = molde.bloques[i];
      if (!b.ob) continue;
      const x = String(csgTextoDe(p, b.id) || '').trim();
      if (!x) continue;
      let ini = '';
      try { ini = String(csgBloqueDef(p.molde, b.id).inicial || '').trim(); } catch (e) { ini = ''; }
      if (ini && x === ini) continue;
      t = x;
    }
  }
  if (!t) {
    const b = (Array.isArray(p.bloques) ? p.bloques : []).find(x => x && String(x.t || '').trim());
    if (b) t = String(b.t).trim();
  }
  if (!t) return null;
  return csgEl('div', 'csg-ficha-extracto', t.slice(0, 600).replace(/\s+/g, ' ').trim().slice(0, 240));
}

/* ── La fila (☰): 44 px, lo justo para reconocerla y usarla ────────── */
function csgFichaFila(p) {
  const clase = csgClaseDe(p.clase);
  const f = csgEl('div', 'csg-fila csg-clase-' + clase.id);
  const punto = csgEl('span', 'csg-fila-punto');
  punto.setAttribute('aria-hidden', 'true');
  f.appendChild(punto);
  const tit = String(p.titulo || '').trim();
  const titEl = csgEl('span', 'csg-fila-titulo' + (tit ? '' : ' csg-ficha-titulo-vacio'), tit || CSG_SIN_TITULO);
  f.appendChild(titEl);
  /* El 🟡 también aquí: sin él, en la lista no se distingue un borrador y
     ▶ llevaría a una hoja de usar que se para. */
  const meta = [csgAnqBorrador(p) ? '🟡' : '', p.maquina ? csgAnqMaquinaNombre(p.maquina) : '', csgHace(p.ultima || p.actualizado)].filter(Boolean).join(' · ');
  f.appendChild(csgEl('span', 'csg-fila-meta', meta));
  /* Eligiendo, la fila entera es la casilla y sin ▶ ni ⋯ (ver csgFichaCrear). */
  if (csgElegActivo()) { csgElegPrepara(f, p, titEl); return f; }
  /* Con su palabra, como todos los botones de la casa; en el teléfono el
     CSS la esconde (.csg-fila-usar), porque ahí no cabe al lado del
     título, y la etiqueta sigue diciendo «Usar» al lector de pantalla. */
  const usar = csgBtn('csg-btn-lleno csg-btn-sm csg-fila-usar', '▶', 'Usar', () => csgAnqUsar(p));
  usar.setAttribute('aria-label', 'Usar');
  f.appendChild(usar);
  const mas = csgBtn('csg-mas csg-btn-neutro csg-btn-sm', '⋯', '', () => csgMenuAbrir(p));
  mas.setAttribute('aria-label', 'Más: copiar, corregir, duplicar, versiones, bitácora, estantes, retirar');
  f.appendChild(mas);
  return f;
}

/* ── Las retiradas: al final, plegadas, y de ahí se devuelven ──────── */
function csgAnqTiempo(v, def) {
  if (typeof v === 'number' && isFinite(v)) return v;
  const t = Date.parse(v);
  return isFinite(t) ? t : (def || 0);
}
function csgAnqRetiradas() {
  const ret = csgRetiradas().slice().sort((a, b) =>
    csgAnqTiempo(b.eliminado_at, b.actualizado) - csgAnqTiempo(a.eliminado_at, a.actualizado));
  if (!ret.length) return null;
  const d = csgEl('details', 'csg-retiradas');
  if (_csgAnqRetAbiertas) d.open = true;
  d.addEventListener('toggle', () => { _csgAnqRetAbiertas = d.open; });
  d.appendChild(csgEl('summary', '', '🗑 Retiradas (' + ret.length + ')'));
  d.appendChild(csgEl('p', 'csg-nota', '«Devolver» la pone otra vez en el anaquel, en todos los aparatos de la casa.'));
  ret.slice(0, 60).forEach(p => {
    const clase = csgClaseDe(p.clase);
    const f = csgEl('div', 'csg-fila csg-clase-' + clase.id);
    const punto = csgEl('span', 'csg-fila-punto');
    punto.setAttribute('aria-hidden', 'true');
    f.appendChild(punto);
    const tit = String(p.titulo || '').trim();
    f.appendChild(csgEl('span', 'csg-fila-titulo' + (tit ? '' : ' csg-ficha-titulo-vacio'), tit || CSG_SIN_TITULO));
    f.appendChild(csgEl('span', 'csg-fila-meta', ('retirada ' + csgHace(csgAnqTiempo(p.eliminado_at, p.actualizado))).trim()));
    f.appendChild(csgBtn('csg-btn-neutro csg-btn-sm', '↩', 'Devolver', () => {
      /* Quien devuelve una está mirando las retiradas: el repintado no se
         las puede cerrar (el aviso `toggle` llega tarde si se abrieron por
         programa, y entonces la lista se plegaba debajo del dedo). */
      _csgAnqRetAbiertas = true;
      p.eliminado = false;
      p.eliminado_at = null;
      const r = csgPersistir(p);
      csgPintarAnaquel();
      csgAviso('↩ «' + csgAnqCorto(tit || CSG_SIN_TITULO, 40) + '» vuelve al anaquel');
      Promise.resolve(r).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
    }));
    d.appendChild(f);
  });
  if (ret.length > 60) d.appendChild(csgEl('p', 'csg-nota', 'Y ' + (ret.length - 60) + ' más, las más viejas.'));
  return d;
}

/* ── La nube, al pie ─────────────────────────────────────────────────
   Franja SOLO con algo que arreglar, y diciendo qué (csgRotuloNube ya
   pone la causa: el SQL, la sesión, la señal, lo que no cabe). Cuando va
   bien —o mientras mira— es un renglón discreto: una franja verde en cada
   arranque es una noticia que ya se sabe. */
function csgAnqNube() {
  let r;
  try { r = csgRotuloNube(); } catch (e) { r = { ic: '⏳', t: 'Mirando la nube…', ok: false }; }
  if (r.ok || r.ic === '⏳') return csgEl('div', 'csg-nube-pie', r.ic + ' ' + r.t);
  const f = csgEl('div', 'csg-nube-no');
  f.setAttribute('role', 'status');
  f.appendChild(csgEl('span', '', r.ic + ' ' + r.t));
  if (r.accion === 'reintentar') {
    const b = csgBtn('csg-btn-neutro csg-btn-sm', '↻', 'Reintentar', () => {
      b.disabled = true;
      const t = b.querySelector('.csg-btn-t');
      if (t) t.textContent = 'Mirando…';
      /* Reintentar es VOLVER A CARGAR (baja, junta y sube lo pendiente):
         csgSubirPendientes a secas no vuelve a mirar la nube si no hay
         nada pendiente, y la franja se quedaría diciendo «sin señal». */
      Promise.resolve(csgCargar()).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
    });
    f.appendChild(b);
  }
  if (r.id && csgDe(r.id)) {
    f.appendChild(csgBtn('csg-btn-neutro csg-btn-sm', '✎', 'Abrirla', () => { const p = csgDe(r.id); if (p) csgAnqCorregir(p); }));
  }
  return f;
}

/* ── 🗂 Estantes: la hoja vertical de lo que se puede mirar ──────────
   Estantes primero (a eso se abre), con su tono y su cuenta; después las
   máquinas y lo que falta (borradores, sin probar). Elegir uno pone el
   filtro y CIERRA la hoja: se vino a ver ese montón, no a seguir mirando
   la lista. Volver a tocar el que está puesto lo quita. */
function csgAnqEstantesAbrir() {
  csgVerAbrir('🗂 Estantes', cuerpo => {
    const f = csgAnqPrefs().filtro;
    const vivas = csgVivas();
    const elige = cambio => { csgAnqPonFiltro(cambio); csgVerCerrar(); csgPintarAnaquel(); };
    const nada = !f.estante && !f.maquina && !f.especial && !f.clase;
    cuerpo.appendChild(csgVerFila(CSG_EMOJI, 'Todas', vivas.length, nada, () => elige(null)));

    cuerpo.appendChild(csgVerSep('Estantes'));
    const ests = csgEstantesTodos();
    ests.forEach(e => {
      const on = f.estante === e.clave;
      const r = csgVerFila('🗂', e.rotulo, e.n, on, () => elige({ estante: on ? '' : e.clave }));
      r.classList.add(csgTono(e.clave));
      cuerpo.appendChild(r);
    });
    const sin = vivas.filter(p => !csgAnqEstantesDe(p).length).length;
    if (sin && ests.length) {
      const on = f.estante === CSG_ANQ_SIN;
      /* 📥 y no ▫️: el cuadrado blanco salía como un punto gris en su
         baldosa, que se lee como un icono que no cargó. */
      const r = csgVerFila('📥', 'Sin estante', sin, on, () => elige({ estante: on ? '' : CSG_ANQ_SIN }), 'lo que falta por archivar');
      r.classList.add('csg-tono-x');
      cuerpo.appendChild(r);
    }
    if (!ests.length) cuerpo.appendChild(csgEl('p', 'csg-nota', 'Todavía no hay estantes. Se ponen desde el ⋯ de cada consigna, o en el compositor: la materia, el proyecto, para quién es. Una consigna puede estar en varios.'));
    /* Aquí no se crea ninguno, y se dice dónde: un estante vacío no existe
       (los estantes salen de las piezas, §8), y esta hoja es la de MIRAR:
       no tiene a qué ponérselo. Un campo que creara uno sin nada dentro se
       leería como una avería al no verlo en la lista. Se crea donde hay
       consignas a las que ponerlo: el ⋯ de una, el compositor, o varias a
       la vez con ☑ Elegir → 🗂 Mover a estante. */
    else cuerpo.appendChild(csgEl('p', 'csg-nota', 'Un estante nuevo se crea al archivar: en el ⋯ de una consigna → 🗂 Estantes, con «＋ estante» al escribirla, o a varias de golpe con ☑ Elegir → 🗂 Mover a estante.'));

    const cuentas = new Map();
    vivas.forEach(p => { const m = csgAnqMaquinaDe(p); cuentas.set(m, (cuentas.get(m) || 0) + 1); });
    const maqs = CSG_MAQUINAS.filter(m => cuentas.get(m.id));
    if (maqs.length) {
      cuerpo.appendChild(csgVerSep('Máquinas'));
      maqs.forEach(m => {
        const on = f.maquina === m.id;
        const r = csgVerFila('🤖', m.nombre, cuentas.get(m.id), on, () => elige({ maquina: on ? '' : m.id }));
        r.classList.add('csg-tono-x');
        cuerpo.appendChild(r);
      });
    }

    cuerpo.appendChild(csgVerSep('Lo que falta'));
    Object.keys(CSG_ANQ_ESPECIALES).forEach(id => {
      const e = CSG_ANQ_ESPECIALES[id];
      const n = vivas.filter(id === 'borradores' ? csgAnqBorrador : csgAnqSinProbar).length;
      const on = f.especial === id;
      cuerpo.appendChild(csgVerFila(e.ic, e.t, n, on, () => elige({ especial: on ? '' : id }),
        id === 'borradores' ? 'guardadas con algo que para el usar' : 'ningún uso contestado todavía'));
    });
  });
}

/* ── ⇅ Orden y agrupación, en la misma hoja ──────────────────────── */
function csgAnqOrdenAbrir() {
  csgVerAbrir('⇅ Orden', cuerpo => {
    const pr = csgAnqPrefs();
    const pon = (campo, valor) => { pr[campo] = valor; csgAnqGuardaPrefs(); csgVerCerrar(); csgPintarAnaquel(); };
    cuerpo.appendChild(csgVerSep('Ordenar por'));
    CSG_ANQ_ORDENES.forEach(o => cuerpo.appendChild(csgVerFila(o.ic, o.t, null, pr.orden === o.id, () => pon('orden', o.id), o.d)));
    cuerpo.appendChild(csgVerSep('Agrupar'));
    CSG_ANQ_AGRUPAR.forEach(a => cuerpo.appendChild(csgVerFila(a.ic, a.t, null, pr.agrupar === a.id, () => pon('agrupar', a.id), a.d)));
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'El orden y los grupos son de este aparato: no cambian lo que ven los demás.'));
  });
}

/* ── 📋 Exportar: el inventario entero, en texto ─────────────────────
   Se copia DENTRO del toque (csgCopiarTexto) y además se enseña en la
   hoja, seleccionable: si el portapapeles falla, el texto está ahí para
   mantener pulsado. Es texto para un chat o un respaldo, no un formato que
   se importe (§12); y sale del núcleo (csgExportarTexto), que ya deja
   fuera las retiradas. */
function csgAnqExportar() {
  const vivas = csgVivas();
  if (!vivas.length) { csgAviso('No hay consignas que exportar'); return; }
  let texto = '';
  try { texto = csgExportarTexto(_csgLista); } catch (e) { csgAviso('No se pudo armar el inventario'); return; }
  const copia = csgCopiarTexto(texto);
  let pre = null;
  csgVerAbrir('📋 Exportar', cuerpo => {
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'El inventario entero en texto: ' + vivas.length + (vivas.length === 1 ? ' consigna' : ' consignas') +
      ', agrupadas por estante, con sus bloques y su bitácora. Es para pegar en un chat o guardar de respaldo; no se vuelve a importar.'));
    pre = csgEl('pre', 'csg-pre', texto);
    cuerpo.appendChild(pre);
    const pie = csgEl('div', 'csg-usar-pie');
    pie.appendChild(csgBtn('csg-btn-lleno', '📋', 'Copiar', () => {
      csgCopiarTexto(texto).then(ok => {
        csgAviso(ok ? '📋 Inventario copiado' : 'No se pudo copiar: mantén pulsado el texto para seleccionarlo');
        if (!ok) csgAnqSelecciona(pre);
      });
    }));
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      pie.appendChild(csgBtn('csg-btn-neutro', '📤', 'Compartir', () => {
        try {
          navigator.share({ title: 'La Consigna · inventario', text: texto }).catch(e => {
            if (!e || e.name !== 'AbortError') csgAviso('No se pudo compartir');
          });
        } catch (e) { csgAviso('No se pudo compartir'); }
      }));
    }
    cuerpo.appendChild(pie);
  });
  copia.then(ok => {
    csgAviso(ok ? '📋 Inventario copiado: listo para pegar' : 'No se pudo copiar: está en la hoja, mantén pulsado para seleccionarlo');
    if (!ok && pre) csgAnqSelecciona(pre);
  });
}
function csgAnqSelecciona(el) {
  try {
    const sel = window.getSelection();
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(el);
    sel.addRange(r);
  } catch (e) {}
}

/* ══════════════════════════════════════════════════════════════════
   LA BITÁCORA PREGUNTADA (§6.7, regla 9)
   ──────────────────────────────────────────────────────────────────
   UN renglón, UN uso cada vez: el más reciente de los últimos siete días
   que siga sin contestar. Se pregunta DESPUÉS, al volver al anaquel,
   porque el «¿cómo salió?» inmediato preguntaba antes de que la máquina
   contestara; y se pregunta en vez de pedir que se escriba, porque una
   bitácora que hay que acordarse de escribir no la escribe nadie.
   ⚠️ NUNCA SE INVENTA UN RESULTADO: ✕ deja el uso sin contestar para
   siempre (solo deja de preguntarse), y un renglón ignorado tres
   aperturas seguidas se pliega a «N usos sin contestar ▸». Lo que se
   recuerda (lo descartado y las veces) es del aparato
   (CSG_CLAVES.pregunta): el uso contestado sí viaja, con la pieza.
   ══════════════════════════════════════════════════════════════════ */

/* ✏️ LO QUE SE DEJÓ A MEDIO ESCRIBIR SE OFRECE AL ENTRAR (§6.1). El
   compositor guarda cada tecla en el borrador del aparato, pero eso no
   sirve de nada si al volver no se dice: quien salió por la barra de abajo
   a mitad de un párrafo, o a quien se le cerró la aplicación, abre el
   anaquel y no ve su texto por ninguna parte. La hoja de ＋ Nueva también
   lo ofrece, pero hay que saber que está ahí.

   ⚠️ Va en el MISMO sitio que la pregunta de la bitácora y la sustituye
   en esa apertura: antes de la primera ficha caben como mucho cinco cosas
   (§8, regla 21), y de las dos, la que pierde algo si se ignora es esta
   —la pregunta vuelve en la siguiente apertura y no cuenta como ignorada
   (initConsigna no la apunta), el texto a medio escribir no vuelve si se
   descarta sin querer—. Con la pieza abierta en el compositor no sale:
   ahí ya se está siguiendo.
   ⚠️ Y GANA UNA VEZ POR BORRADOR, NO SIEMPRE. Ganando siempre, un
   borrador que nadie decidía dejaba la pregunta sin salir en TODAS las
   aperturas, y a los siete días el uso se quedaba para siempre sin
   preguntar. Ya ofrecido (csgAnqSeguirApunta, por su reloj: escribir más
   lo vuelve a ofrecer), cede el hueco mientras haya algo que preguntar;
   sigue en ＋ Nueva, y vuelve aquí en cuanto la pregunta se conteste. */
function csgAnqSeguirFila() {
  if (typeof csgBorradorLee !== 'function' || typeof csgBorradorSeguir !== 'function') return null;
  if (typeof csgEdEnVista === 'function' && csgEdEnVista()) return null;
  let b = null;
  try { b = csgBorradorLee(); } catch (e) { b = null; }
  if (!b || b.guardada || !b.pieza) return null;
  if (typeof csgEdAlgoEscritoDe === 'function') {
    let algo = false;
    try { algo = csgEdAlgoEscritoDe(b.pieza, b.material, b.tituloMano); } catch (e) { algo = false; }
    if (!algo) return null;
  }
  const clase = csgClaseDe(b.pieza.clase);
  const nombre = String(b.pieza.titulo || '').replace(/\s+/g, ' ').trim() || clase.nombre;
  const fila = csgEl('div', 'csg-pregunta csg-anq-seguir');
  fila.appendChild(csgEl('span', 'csg-pregunta-txt', '✏️ «' + csgAnqCorto(nombre, 32) + '» a medio escribir' + (b.t ? ' · ' + csgHace(b.t) : '')));
  const seguir = csgBtn('csg-btn-lleno csg-btn-sm', '', 'Seguir', () => { csgBorradorSeguir(); });
  seguir.dataset.csgFoco = 'seguir';
  fila.appendChild(seguir);
  /* Descartar es tirar texto de alguien: dos toques en el mismo sitio y
     sin confirm(), con el mismo botón que la hoja de ＋ Nueva. */
  if (typeof csgEdDosToques === 'function' && typeof csgBorradorDescarta === 'function') {
    fila.appendChild(csgEdDosToques('Descartar', 'Sí, descartar', () => {
      csgBorradorDescarta();
      csgAviso('Descartado lo que tenías a medio escribir');
      csgPintarAnaquel();
    }));
  }
  return fila;
}

function csgBitEstado() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CSG_CLAVES.pregunta)); } catch (e) { d = null; }
  if (!d || typeof d !== 'object') d = {};
  const desc = (d.descartados && typeof d.descartados === 'object') ? d.descartados : {};
  return { descartados: desc, veces: Math.max(0, parseInt(d.veces, 10) || 0), seguido: Number(d.seguido) || 0 };
}
function csgBitGuarda(st) {
  /* Lo descartado hace más de ocho días ya no se preguntaría de todos
     modos (el uso es de antes): se barre, para que la llave no crezca. */
  const limite = Date.now() - (CSG_ANQ_PREGUNTA_DIAS + 1) * CSG_ANQ_DIA;
  const desc = {};
  Object.keys(st.descartados || {}).forEach(u => {
    const t = Number(st.descartados[u]) || 0;
    if (t >= limite) desc[u] = t;
  });
  try { localStorage.setItem(CSG_CLAVES.pregunta, JSON.stringify({ descartados: desc, veces: st.veces || 0, seguido: st.seguido || 0 })); } catch (e) {}
}
/* ¿El borrador de ahora ya tuvo su apertura? Se mira por su RELOJ: cada
   tecla lo reescribe con uno nuevo, así que lo escrito después se vuelve
   a ofrecer. */
function csgAnqSeguirOfrecido() {
  let b = null;
  try { b = csgBorradorLee(); } catch (e) { b = null; }
  return !!(b && b.t && csgBitEstado().seguido === b.t);
}
function csgAnqSeguirApunta() {
  let b = null;
  try { b = csgBorradorLee(); } catch (e) { b = null; }
  if (!b || !b.t) return;
  const st = csgBitEstado();
  st.seguido = b.t;
  csgBitGuarda(st);
}
function csgBitPendientes() {
  const desde = Date.now() - CSG_ANQ_PREGUNTA_DIAS * CSG_ANQ_DIA;
  /* Solo lo de antes de esta apertura (ver _csgAnqBitDesde). */
  const hasta = _csgAnqBitDesde || Infinity;
  const st = csgBitEstado();
  const out = [];
  csgVivas().forEach(p => (Array.isArray(p.bitacora) ? p.bitacora : []).forEach(u => {
    const t = Number(u && u.t) || 0;
    if (u && u.uid && u.ok == null && t >= desde && t < hasta && !st.descartados[u.uid]) out.push({ p, u });
  }));
  out.sort((a, b) => (Number(b.u.t) || 0) - (Number(a.u.t) || 0));
  return out;
}
/* Una apertura del anaquel: si hay algo que preguntar, cuenta una vez que
   se enseña; a la cuarta sin tocarlo, sale plegado. */
function csgBitApertura() {
  if (!csgBitPendientes().length) { _csgAnqBitPlegada = false; return; }
  const st = csgBitEstado();
  if (st.veces >= CSG_ANQ_PREGUNTA_VECES) { _csgAnqBitPlegada = true; return; }
  st.veces++;
  csgBitGuarda(st);
  _csgAnqBitPlegada = false;
}
/* Cualquier toque en el renglón (contestar, descartar, desplegar) dice que
   se está mirando: la cuenta vuelve a cero. */
function csgBitTocada() {
  const st = csgBitEstado();
  st.veces = 0;
  csgBitGuarda(st);
  _csgAnqBitPlegada = false;
}
function csgBitFila() {
  const pend = csgBitPendientes();
  if (!pend.length) return null;
  if (_csgAnqBitPlegada) {
    const b = csgAnqBoton('csg-pregunta csg-pregunta-plegada', (pend.length === 1 ? '1 uso sin contestar' : pend.length + ' usos sin contestar') + ' ▸', () => {
      csgBitTocada();
      const nueva = csgBitFila();
      if (nueva) { b.replaceWith(nueva); const x = nueva.querySelector('button'); if (x) try { x.focus({ preventScroll: true }); } catch (e) {} }
      else b.remove();
    });
    b.setAttribute('aria-expanded', 'false');
    return b;
  }
  const { p, u } = pend[0];
  const maq = u.maquina ? ' en ' + csgAnqMaquinaNombre(u.maquina) : '';
  return csgBitFilaUso(p, u, {
    texto: 'Usaste «' + csgAnqCorto(String(p.titulo || '').trim() || CSG_SIN_TITULO, 32) + '»' + maq + ' ' + csgHace(u.t) + ' · ¿sirvió?',
    descartar: true,
    /* Contestado o descartado, en su sitio sale el siguiente; si no queda
       ninguno, el renglón se va. */
    alTerminar: fila => {
      const sig = csgBitFila();
      if (sig) fila.replaceWith(sig); else fila.remove();
    },
  });
}
/* El renglón de un uso sin contestar, con ✅ 〰 ❌ (y ✕ en el anaquel).
   Lo usan el anaquel y la bitácora del menú ⋯: una sola forma de
   contestar, en los dos sitios. */
function csgBitFilaUso(p, u, op) {
  const o = op || {};
  const fila = csgEl('div', 'csg-pregunta');
  fila.appendChild(csgEl('span', 'csg-pregunta-txt', o.texto || '¿Sirvió?'));
  [['si', '✅', 'Sirvió'], ['regular', '〰', 'A medias'], ['no', '❌', 'No sirvió']].forEach(([ok, ic, et]) => {
    const b = csgAnqBoton('csg-pregunta-b', ic, () => {
      csgBitTocada();
      const hecho = csgContestarUso(p, u.uid, ok);
      if (!hecho) { csgAviso('Ese uso ya no está en la consigna'); if (typeof o.alTerminar === 'function') o.alTerminar(fila); return; }
      const nota = csgBitFilaNota(p, u, ok, o.alTerminar);
      fila.replaceWith(nota);
    });
    b.setAttribute('aria-label', et);
    b.title = et;
    fila.appendChild(b);
  });
  if (o.descartar) {
    /* csg-pregunta-x: el ✕ no contesta, descarta; va apartado de los tres
       que contestan, al borde del renglón (css/consigna.css). */
    const x = csgAnqBoton('csg-pregunta-b csg-pregunta-x', '✕', () => {
      const st = csgBitEstado();
      st.descartados[u.uid] = Date.now();
      st.veces = 0;
      csgBitGuarda(st);
      _csgAnqBitPlegada = false;
      if (typeof o.alTerminar === 'function') o.alTerminar(fila);
    });
    x.setAttribute('aria-label', 'No preguntar por este uso');
    x.title = 'No preguntar por este uso';
    fila.appendChild(x);
  }
  return fila;
}
/* Contestado, en su sitio sale el campo de UNA línea «qué pasó», que no
   obliga: no se le pone el foco (sacaría el teclado de la tableta para
   algo opcional). Se guarda al salir del campo o con Enter, y ✓ pasa al
   siguiente. */
function csgBitFilaNota(p, u, ok, alTerminar) {
  const fila = csgEl('div', 'csg-pregunta');
  fila.appendChild(csgEl('span', 'csg-pregunta-txt', ok === 'si' ? '✅' : ok === 'no' ? '❌' : '〰'));
  const inp = csgEl('input', 'csg-pregunta-nota');
  inp.type = 'text';
  inp.maxLength = CSG_TOPES.nota_uso;
  inp.placeholder = 'qué pasó (opcional)';
  inp.setAttribute('aria-label', 'Qué pasó (opcional)');
  inp.setAttribute('autocomplete', 'off');
  inp.setAttribute('enterkeyhint', 'done');
  inp.value = String(u.nota || '');
  let guardada = inp.value.replace(/\s+/g, ' ').trim();
  const guarda = () => {
    const v = inp.value.replace(/\s+/g, ' ').trim();
    if (v === guardada) return;
    guardada = v;
    csgContestarUso(p, u.uid, ok, v);
  };
  const termina = () => {
    guarda();
    if (typeof alTerminar === 'function') alTerminar(fila);
  };
  inp.addEventListener('blur', () => {
    guarda();
    if (_csgAnqPendiente) setTimeout(csgPintarAnaquel, 400);
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); termina(); }
  });
  fila.appendChild(inp);
  const listo = csgAnqBoton('csg-pregunta-b', '✓', termina);
  listo.setAttribute('aria-label', 'Listo');
  fila.appendChild(listo);
  return fila;
}

/* ══════════════════════════════════════════════════════════════════
   EL MENÚ ⋯ (§8)
   ──────────────────────────────────────────────────────────────────
   Todo lo que no es usar ni corregir, en la hoja vertical y con un
   renglón por cosa. Las sub-hojas llevan «‹ Volver» arriba: en una
   tableta, cerrar y volver a abrir el ⋯ para mirar otra cosa son tres
   toques. La casa escribe en cualquier pieza (la tabla es de la casa, con
   es_familia()), así que aquí no hay botones apagados por «lo puso otro».
   ══════════════════════════════════════════════════════════════════ */

function csgMenuAbrir(p) {
  if (!p) return;
  const clase = csgClaseDe(p.clase);
  csgVerAbrir(clase.ic + ' ' + (String(p.titulo || '').trim() || CSG_SIN_TITULO), cuerpo => csgMenuPintar(p, cuerpo));
}
function csgMenuVolver(p) {
  return csgVerFila('‹', 'Volver', null, null, () => csgMenuAbrir(p));
}
function csgMenuPintar(p, cuerpo) {
  if (!csgDe(p.id) || p.eliminado) {
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Esta consigna ya no está en el anaquel.'));
    return;
  }
  const maq = csgAnqMaquinaNombre(p.maquina || csgMaquinaUltima());
  const molde = csgAnqMolde(p);
  const bit = (Array.isArray(p.bitacora) ? p.bitacora : []).filter(Boolean);
  const sinContestar = bit.filter(u => u.ok == null).length;
  const vers = (Array.isArray(p.versiones) ? p.versiones : []).filter(Boolean);
  const est = csgAnqEstantesDe(p);
  cuerpo.appendChild(csgVerFila('▶', 'Usar', null, null, () => { csgVerCerrar(); csgAnqUsar(p); }, 'rellenar, copiar o abrir en ' + maq));
  cuerpo.appendChild(csgVerFila('📋', 'Copiar', null, null, () => csgMenuCopiar(p), 'para ' + maq + ', con los últimos valores'));
  cuerpo.appendChild(csgVerFila('✎', 'Corregir', null, null, () => { csgVerCerrar(); csgAnqCorregir(p); }, molde ? molde.nombre : ''));
  cuerpo.appendChild(csgVerFila('🔀', 'Duplicar en otro molde…', null, null, () => csgMenuDuplicar(p), 'una copia nueva, sin guardar'));
  cuerpo.appendChild(csgVerFila('🕘', 'Versiones', vers.length || '', null, () => csgMenuVersiones(p), 'va por la v' + (parseInt(p.version, 10) || 1)));
  cuerpo.appendChild(csgVerFila('📓', 'Bitácora', bit.length || '', null, () => csgMenuBitacora(p),
    !bit.length ? 'todavía sin usar' : sinContestar ? (sinContestar === 1 ? '1 uso sin contestar' : sinContestar + ' usos sin contestar') : 'todos los usos contestados'));
  cuerpo.appendChild(csgVerFila('🗂', 'Estantes', est.length || '', null, () => csgMenuEstantes(p), est.length ? est.join(' · ') : 'en ninguno todavía'));
  /* Solo si 📓 Cuadernos está cargado: sin él no hay de dónde elegir, y un
     renglón que abre una lista vacía se lee como roto. */
  if (typeof rcuVivos === 'function') {
    let c = null;
    try { c = p.cuaderno && typeof rcuDe === 'function' ? rcuDe(p.cuaderno) : null; } catch (e) { c = null; }
    cuerpo.appendChild(csgVerFila('📓', p.cuaderno ? 'Cuaderno ligado' : 'Ligar al cuaderno', null, null, () => csgMenuCuaderno(p),
      p.cuaderno ? ((c && c.titulo) || p.notas || 'un cuaderno de NotebookLM') : '«↗ NotebookLM» abrirá ese cuaderno'));
  }
  cuerpo.appendChild(csgMenuRetirar(p));
}

/* Copiar desde el menú: lo hace la hoja de usar (csgCopiarDirecto), que
   es la que sabe armar, rellenar con los últimos valores, decir los
   huecos y apuntar el uso. Se llama DENTRO del toque, antes de cerrar
   nada: el portapapeles solo se deja escribir mientras dura el gesto. */
function csgMenuCopiar(p) {
  if (typeof csgCopiarDirecto !== 'function') { csgAviso('No se pudo copiar: vuelve a abrir F.A.R.O'); return; }
  let r = null;
  try { r = csgCopiarDirecto(p); } catch (e) { csgAviso('No se pudo copiar'); }
  csgVerCerrar();
  Promise.resolve(r).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
}

/* Los diecisiete moldes, por clase y con su «cuándo»: el nombre solo no
   dice cuál elegir. Abre el compositor con una pieza NUEVA sin guardar
   (§6.9); la original no se toca. */
function csgMenuDuplicar(p) {
  csgVerAbrir('🔀 Duplicar en otro molde', cuerpo => {
    cuerpo.appendChild(csgMenuVolver(p));
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Se abre una copia nueva, sin guardar, con lo escrito en su sitio. Lo que no encuentre sitio sale marcado para colocarlo o quitarlo. La original no cambia.'));
    CSG_CLASES.forEach(c => {
      cuerpo.appendChild(csgVerSep(c.ic + ' ' + c.nombre));
      (CSG_MOLDES_ORDEN[c.id] || []).forEach(mid => {
        const m = CSG_MOLDES[mid];
        if (!m) return;
        const actual = mid === p.molde;
        const r = csgVerFila(c.ic, m.nombre, null, actual, () => {
          if (typeof csgDuplicarEnMolde !== 'function' || typeof csgAbrirCompositor !== 'function') {
            csgAviso('No se pudo abrir el compositor: vuelve a abrir F.A.R.O');
            return;
          }
          const nueva = csgDuplicarEnMolde(p, mid);
          if (!nueva) { csgAviso('No se pudo preparar la copia'); return; }
          csgVerCerrar();
          csgAbrirCompositor(nueva);
        }, (actual ? 'el de ahora · ' : '') + m.cuando);
        r.classList.add('csg-clase-' + c.id);
        cuerpo.appendChild(r);
      });
    });
  });
}

/* ⚠️ LAS VERSIONES NO SE REESCRIBEN (regla 10). «Volver a esta» crea una
   versión NUEVA con aquel texto (csgVolverAVersion), y la de ahora queda
   guardada como otra más: el 👍 que se le dio a cada una sigue hablando de
   su texto. Cada versión dice cuántas veces se usó y cómo salió EN ESA
   versión, sacado de la bitácora. Las plegadas ya no guardan texto: se
   dice, en vez de ofrecer un botón que no puede hacer nada. */
function csgMenuVersiones(p) {
  csgVerAbrir('🕘 Versiones', cuerpo => {
    cuerpo.appendChild(csgMenuVolver(p));
    const bit = (Array.isArray(p.bitacora) ? p.bitacora : []).filter(Boolean);
    const cuenta = v => {
      const us = bit.filter(u => (parseInt(u.v, 10) || 1) === v);
      const si = us.filter(u => u.ok === 'si').length, no = us.filter(u => u.ok === 'no').length;
      return [us.length ? (us.length === 1 ? 'usada 1 vez' : 'usada ' + us.length + ' veces') : 'sin usar',
        si ? '👍 ' + si : '', no ? '👎 ' + no : ''].filter(Boolean).join(' · ');
    };
    const vers = (Array.isArray(p.versiones) ? p.versiones : []).filter(x => x && x.vid)
      .slice().sort((a, b) => (b.v || 0) - (a.v || 0) || (b.t || 0) - (a.t || 0));
    const plegadas = vers.filter(x => !Array.isArray(x.bloques)).length;
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Corregir una consigna que ya se usó guarda la anterior aquí. «Volver a esta» no borra nada: crea una versión nueva con aquel texto.'));
    if (plegadas) cuerpo.appendChild(csgEl('p', 'csg-nota', (plegadas === 1 ? 'Se plegó 1 versión vieja' : 'Se plegaron ' + plegadas + ' versiones viejas') +
      ': se sabe cuándo fueron y cómo salieron, pero ya no guardan su texto (se guardan diez con texto, para que quepan en la nube).'));
    const ahora = parseInt(p.version, 10) || 1;
    cuerpo.appendChild(csgMenuVersionFila('v' + ahora + ' · la de ahora', cuenta(ahora), null));
    vers.forEach(x => {
      const conTexto = Array.isArray(x.bloques);
      const sub = cuenta(parseInt(x.v, 10) || 1) + (conTexto ? '' : ' · plegada: ya no guarda su texto');
      cuerpo.appendChild(csgMenuVersionFila('v' + x.v + (x.t ? ' · hasta el ' + csgHoy(x.t) : ''), sub, conTexto ? () => {
        /* Si ese texto ya es el de ahora, no nace nada: «Volver a esta»
           dos veces seguidas fabricaba una versión idéntica y gastaba una
           de las diez que guardan su texto. */
        if (csgMdCrudo({ clase: p.clase, molde: p.molde, bloques: x.bloques }) === csgMdCrudo(p)) {
          csgAviso('Esa ya es la de ahora: no hace falta volver a ella');
          return;
        }
        const n = csgVolverAVersion(p, x.vid);
        if (!n) { csgAviso('Esa versión está plegada: ya no guarda su texto'); return; }
        const r = csgPersistir(p);
        csgAviso('↩ Vuelve el texto de la v' + x.v + ': ahora es la v' + n);
        csgVerPintar();
        csgPintarAnaquel();
        Promise.resolve(r).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
      } : null));
    });
    if (!vers.length) cuerpo.appendChild(csgEl('p', 'csg-nota', 'Todavía no hay versiones anteriores: nacen al corregir una consigna que ya se usó.'));
  });
}
function csgMenuVersionFila(txt, sub, alVolver) {
  const f = csgEl('div', 'csg-ver-fila');
  const ic = csgEl('span', 'csg-ver-ic', '🕘');
  ic.setAttribute('aria-hidden', 'true');
  f.appendChild(ic);
  const t = csgEl('span', 'csg-ver-txt');
  t.appendChild(document.createTextNode(txt));
  if (sub) t.appendChild(csgEl('span', 'csg-ver-sub', sub));
  f.appendChild(t);
  if (alVolver) f.appendChild(csgBtn('csg-btn-tenido csg-btn-sm', '↩', 'Volver a esta', alVolver));
  return f;
}

/* La bitácora entera de una pieza: cada uso con su máquina, su versión,
   su fecha y cómo salió. Los que siguen sin contestar se contestan aquí
   con los mismos botones que en el anaquel. */
function csgMenuBitacora(p) {
  csgVerAbrir('📓 Bitácora', cuerpo => {
    cuerpo.appendChild(csgMenuVolver(p));
    const bit = (Array.isArray(p.bitacora) ? p.bitacora : []).filter(u => u && u.uid)
      .slice().sort((a, b) => (Number(b.t) || 0) - (Number(a.t) || 0));
    if (!bit.length) {
      cuerpo.appendChild(csgEl('p', 'csg-nota', 'Todavía no se ha usado. Cada vez que la copies o la abras en una máquina se apunta aquí, y al volver al anaquel se te pregunta si sirvió.'));
      return;
    }
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Cada vez que se copia o se abre en una máquina se apunta un uso. Lo que no se contesta se queda sin contestar: nunca se inventa un resultado.'));
    bit.forEach(u => {
      const base = [u.t ? csgHoy(u.t) : '', u.maquina ? csgAnqMaquinaNombre(u.maquina) : '', 'v' + (parseInt(u.v, 10) || 1)].filter(Boolean).join(' · ');
      if (u.ok == null) {
        cuerpo.appendChild(csgBitFilaUso(p, u, { texto: base + ' · ¿sirvió?', alTerminar: () => { csgVerPintar(); csgPintarAnaquel(); } }));
        return;
      }
      const f = csgEl('div', 'csg-ver-fila');
      const ic = csgEl('span', 'csg-ver-ic', u.ok === 'si' ? '✅' : u.ok === 'no' ? '❌' : '〰');
      ic.setAttribute('aria-label', u.ok === 'si' ? 'Sirvió' : u.ok === 'no' ? 'No sirvió' : 'A medias');
      f.appendChild(ic);
      const t = csgEl('span', 'csg-ver-txt');
      t.appendChild(document.createTextNode(base));
      if (u.nota) t.appendChild(csgEl('span', 'csg-ver-sub', '«' + u.nota + '»'));
      f.appendChild(t);
      cuerpo.appendChild(f);
    });
  });
}

/* Los estantes de UNA pieza: un interruptor por estante (tocar pone o
   quita) y crear uno nuevo AQUÍ DENTRO, sin salir: si hubiera que salir a
   crearlo, archivar una consigna serían dos viajes. Como mucho doce, de
   cuarenta caracteres (el tope de `estantes` en la base, CSG_TOPES), y el
   botón lo dice al llegar en vez de rebotar al guardar. */
function csgMenuEstantes(p) {
  /* Lo que esta hoja ya enseñó, mientras siga abierta (csgEstantesConVistos):
     quitarle a la pieza el único estante que la tenía no puede hacer que
     el renglón de debajo suba al sitio del dedo. */
  const vistos = new Map();
  csgVerAbrir('🗂 Estantes', cuerpo => {
    cuerpo.appendChild(csgMenuVolver(p));
    const propios = new Set(csgAnqEstantesDe(p).map(csgClave));
    const tope = CSG_TOPES.estantes_n;
    const lleno = propios.size >= tope;
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Toca un estante para ponerla o quitarla. Una consigna puede estar en varios (hasta ' + tope + ').'));
    const todos = csgEstantesConVistos(vistos);
    todos.forEach(e => {
      const on = propios.has(e.clave);
      const r = csgVerFila('🗂', e.rotulo, e.n, on, () => csgMenuEstanteAlterna(p, e.rotulo));
      r.classList.add(csgTono(e.clave));
      cuerpo.appendChild(r);
    });
    if (!todos.length) cuerpo.appendChild(csgEl('p', 'csg-nota', 'Todavía no hay estantes: escribe el primero aquí abajo.'));

    cuerpo.appendChild(csgVerSep('Estante nuevo'));
    const inp = csgEl('input', 'csg-input');
    inp.type = 'text';
    inp.maxLength = CSG_TOPES.estante;
    inp.placeholder = 'Nombre del estante (p. ej. Maestría)';
    inp.setAttribute('aria-label', 'Nombre del estante nuevo');
    inp.setAttribute('autocomplete', 'off');
    inp.setAttribute('enterkeyhint', 'done');
    const crear = () => {
      const nombre = inp.value.replace(/\s+/g, ' ').trim();
      if (!nombre) { csgAviso('Escribe el nombre del estante'); inp.focus(); return; }
      const k = csgClave(nombre);
      if (!k) { csgAviso('Ese nombre no tiene letras'); inp.focus(); return; }
      if (propios.has(k)) { csgAviso('Ya está en «' + csgAnqRotuloEstante(k) + '»'); inp.value = ''; inp.focus(); return; }
      const ya = todos.find(e => e.clave === k);
      const rot = ya ? ya.rotulo : csgCorta(nombre, CSG_TOPES.estante);
      if (!csgMenuEstanteAlterna(p, rot)) return;
      csgAviso(ya ? '🗂 Puesta en «' + rot + '», que ya existía' : '🗂 Estante «' + rot + '» creado');
      /* La hoja se repintó: el foco va al recuadro NUEVO, en el mismo
         toque, para poder crear otro sin volver a tocar. */
      const otro = cuerpo.querySelector('input.csg-input');
      if (otro && !otro.disabled) otro.focus();
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); crear(); } });
    const btn = csgBtn('csg-btn-lleno csg-btn-sm', '＋', lleno ? tope + ' de ' + tope + ': es el tope' : 'Crear y poner', crear);
    if (lleno) {
      inp.disabled = true;
      btn.disabled = true;
      cuerpo.appendChild(csgEl('p', 'csg-nota', 'Ya está en ' + tope + ' estantes, que es el tope: quita uno para poner otro.'));
    }
    const fila = csgEl('div', 'csg-estante-nuevo');
    fila.appendChild(inp);
    fila.appendChild(btn);
    cuerpo.appendChild(fila);
  });
}
/* Pone o quita un estante. Es una EDICIÓN (se sube con el reloj puesto):
   el estante es de la pieza y viaja. Devuelve false si no se pudo. */
function csgMenuEstanteAlterna(p, rotulo) {
  const k = csgClave(rotulo);
  if (!k) return false;
  const actuales = csgAnqEstantesDe(p);
  if (actuales.some(e => csgClave(e) === k)) p.estantes = actuales.filter(e => csgClave(e) !== k);
  else {
    if (actuales.length >= CSG_TOPES.estantes_n) {
      csgAviso('Una consigna está como mucho en ' + CSG_TOPES.estantes_n + ' estantes: quita uno para poner otro');
      return false;
    }
    p.estantes = actuales.concat([csgCorta(String(rotulo).replace(/\s+/g, ' ').trim(), CSG_TOPES.estante)]);
  }
  const r = csgSubirLuego(p);
  csgVerPintar();
  csgPintarAnaquel();
  Promise.resolve(r).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
  return true;
}

/* 📓 Ligar al cuaderno: el identificador va a `cuaderno` y el título a
   `notas` (§8). Con él, «↗ NotebookLM» abre ESE cuaderno por su dirección
   comprobada (eso lo hace la hoja de usar). Si 📓 Cuadernos todavía no se
   abrió en esta sesión, su lista está vacía: se le pide que cargue, UNA
   vez, en vez de decir «no hay cuadernos» cuando sí los hay. */
function csgMenuCuaderno(p) {
  const pintar = cuerpo => {
    cuerpo.appendChild(csgMenuVolver(p));
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Con un cuaderno ligado, «↗ NotebookLM» abre ESE cuaderno. Salen de tu inventario de 📓 Cuadernos, en Redacción.'));
    let actual = null;
    try { actual = p.cuaderno && typeof rcuDe === 'function' ? rcuDe(p.cuaderno) : null; } catch (e) { actual = null; }
    if (p.cuaderno) {
      cuerpo.appendChild(csgVerFila('✂️', 'Desligar', null, null, () => {
        if (!actual || p.notas === actual.titulo) p.notas = '';
        p.cuaderno = '';
        const r = csgSubirLuego(p);
        csgAviso('📓 Desligada: NotebookLM se abrirá en su portada');
        Promise.resolve(r).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
        csgMenuAbrir(p);
      }, (actual && actual.titulo) || p.notas || ''));
    }
    const leer = () => { try { return typeof rcuVivos === 'function' ? rcuVivos() : []; } catch (e) { return []; } };
    let lista = leer();
    if (!lista.length && typeof rcuInit === 'function' && !_csgAnqCuadernosPedidos) {
      _csgAnqCuadernosPedidos = true;
      /* rcuInit lee la copia del aparato ANTES de su primera espera: al
         volver de la llamada ya están los cuadernos de aquí, y los de la
         nube repintan la hoja cuando lleguen (si sigue abierta en esto). */
      let viaje = null;
      try { viaje = rcuInit(); } catch (e) { viaje = null; }
      Promise.resolve(viaje).then(() => { if (_csgAnqVerPintar === pintar && csgAnqVerAbierta()) csgVerPintar(); }, () => {});
      lista = leer();
      if (!lista.length) { cuerpo.appendChild(csgEl('p', 'csg-nota', '⏳ Mirando tus cuadernos…')); return; }
    }
    if (!lista.length) {
      cuerpo.appendChild(csgEl('p', 'csg-nota', 'No hay cuadernos en el inventario. Se ponen en Redacción → 📓 Cuadernos.'));
      return;
    }
    cuerpo.appendChild(csgVerSep('Tus cuadernos'));
    lista.slice().sort((a, b) => csgClave(a.titulo).localeCompare(csgClave(b.titulo), 'es')).forEach(c => {
      const on = p.cuaderno === c.id;
      cuerpo.appendChild(csgVerFila(c.emoji || '📓', c.titulo || 'Sin título', null, on, () => {
        if (on) return;
        p.cuaderno = csgCorta(String(c.id), CSG_TOPES.cuaderno);
        p.notas = csgCorta(String(c.titulo || ''), CSG_TOPES.notas);
        const r = csgSubirLuego(p);
        csgAviso('📓 Ligada a «' + csgAnqCorto(c.titulo || 'el cuaderno', 40) + '»');
        Promise.resolve(r).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
        csgMenuAbrir(p);
      }));
    });
  };
  csgVerAbrir('📓 Ligar al cuaderno', pintar);
}

/* 🗑 Retirar: DOS TOQUES EN EL MISMO SITIO y sin confirm() (La Voz
   Prestada, regla 22: en la aplicación instalada confirm() puede no salir
   nunca y el botón parece muerto). El primero cambia el renglón por «Sí,
   retirar · No» ahí mismo; nada se retira con un solo toque. Retirar deja
   LÁPIDA (eliminado + eliminado_at en ISO): sin ella, la tableta que aún
   tiene la pieza la volvería a subir y resucitaría sola. */
function csgMenuRetirar(p) {
  const fila = csgVerFila('🗑', 'Retirar', null, null, () => {
    const dos = csgEl('div', 'csg-dos-toques');
    const sin = typeof csgEdSinGuardar === 'function' && csgEdSinGuardar([p.id]) > 0;
    dos.appendChild(csgEl('span', '', '¿Retirar? Se puede devolver desde «Retiradas», al final del anaquel.' +
      (sin ? ' Tenía cambios sin guardar: se guardan con ella.' : '')));
    dos.appendChild(csgBtn('csg-btn-peligro csg-btn-sm', '', 'Sí, retirar', () => {
      /* Lo que tenía a medio escribir se guarda CON ella antes de la
         lápida (csgEdGuardaAntesDeRetirar): «↩ Devolver» la trae entera. */
      if (typeof csgEdGuardaAntesDeRetirar === 'function') csgEdGuardaAntesDeRetirar(p.id);
      p.eliminado = true;
      p.eliminado_at = new Date().toISOString();
      /* Y su copia del compositor se suelta: si no, el anaquel seguía
         ofreciendo «Seguir» y abrir otra pieza la devolvía como nueva. */
      if (typeof csgEdSoltarPieza === 'function') csgEdSoltarPieza(p.id);
      const r = csgPersistir(p);
      csgVerCerrar();
      csgPintarAnaquel();
      csgAviso('🗑 Retirada. Se puede devolver desde «Retiradas», al final del anaquel');
      Promise.resolve(r).then(() => csgPintarAnaquel(), () => csgPintarAnaquel());
    }));
    const no = csgBtn('csg-btn-neutro csg-btn-sm', '', 'No', () => { dos.replaceWith(fila); try { fila.focus({ preventScroll: true }); } catch (e) {} });
    dos.appendChild(no);
    fila.replaceWith(dos);
    try { no.focus({ preventScroll: true }); } catch (e) {}
  }, 'se puede devolver desde el final del anaquel');
  /* En rojo: es el único renglón del menú que se lleva algo del anaquel. */
  fila.classList.add('csg-ver-fila-peligro');
  return fila;
}

/* ══════════════════════════════════════════════════════════════════
   ☑ ELEGIR VARIAS Y MOVERLAS DE UNA VEZ (§8)
   ──────────────────────────────────────────────────────────────────
   Pedido por el autor el 23 de septiembre de 2026: «Añade ☑ Elegir para
   mover varias de golpe». Con veinte consignas por archivar, hacerlo de
   una en una son veinte vueltas por el ⋯ de cada una; y eso es justo la
   carga que La Voz Prestada quitó con lo mismo (su regla 33).

   Lo que no se negocia, y por qué:
   · SE ENTRA POR UN BOTÓN (☑ Elegir de la barra), no por una pulsación
     larga: un gesto que sea la única manera de hacer algo es algo que a
     veces no se puede hacer (la regla del asa de la repisa).
   · MIENTRAS SE ELIGE, EL TOQUE ELIGE Y NADA MÁS. La ficha entera es la
     casilla (role="checkbox", con Intro y Espacio desde el teclado) y sus
     botones no se pintan: el mismo dedo no puede querer dos cosas. Los
     rótulos de los grupos siguen plegando: no son fichas.
   · LA SELECCIÓN ES DE IDS Y DE MEMORIA. Sobrevive a los repintados —la
     nube que llega, una búsqueda, un filtro— porque se guarda por id y no
     por nodo; lo que un filtro deja fuera sigue elegido y la barra lo dice
     («5 elegidas · 2 no se ven»), porque mover o retirar lo que no se ve
     sin decirlo sería una sorpresa. Y no se guarda en el aparato: el modo
     no sobrevive a salir de la vista (csgElegFuera, desde switchView).
   · CADA ACCIÓN ES UN SOLO VIAJE (csgPersistirVarios): solo las piezas que
     de verdad cambian, con el reloj puesto y en UN upsert. Mover veinte
     con una escritura por pieza, con la señal de una tableta, es lo que
     hace que mover veinte tarde.
   · RETIRAR SON DOS TOQUES EN EL MISMO SITIO, sin confirm() (regla 22 de
     La Voz Prestada), y deja la lápida de siempre.
   · EL BOTÓN DE DESTELLOS SE APARTA mientras se elige: vive en la esquina
     de abajo a la derecha, que es donde cae la barra. La regla del CSS
     lleva !important porque switchView le escribe el display EN LA
     ETIQUETA (css/consigna.css lo cuenta).
   · Y NADA DE LO ESCRITO POR UNA PERSONA LLEGA A UN ATRIBUTO (regla 15):
     la ficha se nombra con aria-labelledby apuntando a su propio título,
     con un id NUESTRO; el estante que se crea en la hoja es texto.
   ══════════════════════════════════════════════════════════════════ */

function csgElegActivo() { return !!_csgEleg; }

function csgElegEntrar() {
  if (!csgVivas().length) { csgAviso('Todavía no hay consignas que elegir'); return; }
  _csgEleg = new Set();
  _csgElegRetirar = false;
  /* ⚠️ Y SE PIDE LA NUBE AL ENTRAR. La lista solo se baja al abrir la
     vista y al volver la señal, así que una tableta que se quedó en el
     anaquel desde la mañana elige sobre la copia de la mañana; y cada
     acción sube la fila ENTERA (csgAFila) con el reloj puesto, o sea que
     esa copia GANA: mover veinte a un estante les pisaba a la vez el texto
     que otro aparato corrigió al mediodía, y resucitaba la que allí se
     retiró. Se elige sobre lo de ahora: la selección es de ids y aguanta
     el repintado, y la que otro aparato retiró sale sola de ella
     (csgElegCuenta). Lo que se toque antes de que conteste, lo espera
     csgElegGuarda. Es un viaje de bajada por cada vez que se entra, que es
     un gesto deliberado y raro; y si ahora no hay nube que conteste (falta
     el SQL, no hay sesión, no hay señal), no se pide. */
  const bajar = !!_csgInitEnCurso || csgElegNubeResponde();
  csgPintarAnaquel();
  if (bajar) {
    const tras = () => {
      csgPintarAnaquel();
      if (typeof csgEdTrasNube === 'function') csgEdTrasNube();
    };
    let viaje = null;
    try { viaje = csgCargar(); } catch (e) { viaje = null; }
    Promise.resolve(viaje).then(tras, tras);
  }
}

/* ¿Contesta la nube ahora? La última vez que se le preguntó, sí. */
function csgElegNubeResponde() {
  return _csgNube === 'puesta' || _csgNube === 'vieja';
}
/* ¿Se puede actuar sobre la copia de aquí sin volver a pedir la nube? Sí,
   si llegó hace menos de CSG_ELEG_AL_DIA y no hay otra bajada en camino. Y
   también si ahora no hay nube que consultar (falta el SQL, no hay
   sesión, no hay señal): ahí esperar una bajada que no va a llegar solo
   retrasaría ocho segundos guardar en el aparato, y lo hecho se sube como
   siempre cuando vuelva (csgSubirPendientes). */
function csgElegNubeAlDia() {
  if (_csgInitEnCurso) return false;
  if (!csgElegNubeResponde()) return true;
  return !!_csgNubeVista && Date.now() - _csgNubeVista < CSG_ELEG_AL_DIA;
}

/* Salir quita la clase del `body` SIEMPRE (csgElegPinta): si se quedara
   puesta, el botón de Destellos desaparecería de toda la aplicación. La
   hoja de mover o de máquina que estuviera abierta se cierra con el modo:
   sin selección no tiene a quién mover. */
function csgElegSalir(opciones) {
  const pintar = !(opciones && opciones.pintar === false);
  const estaba = !!_csgEleg;
  /* ⚠️ ¿El foco estaba en la barra que se va a esconder? Hay que mirarlo
     ANTES: escondida con el foco dentro, el navegador lo suelta en el
     `body` y el siguiente Tab empieza desde lo alto de la página. Con
     ✕ Salir o «Sí, retirar» desde el teclado, el foco vuelve a ☑ Elegir,
     que es donde lo deja Escape y por donde se entró. */
  const ae = typeof document !== 'undefined' && document ? document.activeElement : null;
  const focoEnBarra = !!(_csgElegBarraEl && ae && _csgElegBarraEl.contains(ae));
  _csgEleg = null;
  _csgElegRetirar = false;
  _csgElegHojaVistos = null;
  if (_csgAnqVerPintar === csgElegHojaMover || _csgAnqVerPintar === csgElegHojaMaquina) csgVerCerrar();
  csgElegPinta();
  if (pintar && estaba) csgPintarAnaquel();
  if (pintar && focoEnBarra) {
    const e = document.querySelector('#csg-anaquel [data-csg-foco="barra:elegir"]');
    if (e) { try { e.focus({ preventScroll: true }); } catch (err) {} }
  }
}

/* La puerta de switchView (js/app.js): irse a otra vista sale del modo.
   Corre en CADA cambio de vista de toda la aplicación, así que no hace
   nada si no hay nada que hacer y nunca lanza. */
function csgElegFuera() {
  try {
    const cls = typeof document !== 'undefined' && document && document.body && document.body.classList;
    if (!_csgEleg && !(cls && cls.contains('csg-eligiendo'))) return;
    csgElegSalir({ pintar: false });
  } catch (e) {}
}

/* Escape sale del modo, pero no si hay una hoja abierta encima (la cierra
   su propio Escape) ni si se está escribiendo en un recuadro: ahí Escape
   es del recuadro (el buscador lo usa para borrarse). */
function csgElegEscape(e) {
  if (!_csgEleg) return false;
  /* Si ya lo atendió otra hoja (📋 Pegar o ▶ Usar se cierran con su propio
     Escape en la fase de captura, y marcan el evento), ese Escape era suyo:
     mirando después, la hoja ya estaría cerrada y una sola tecla cerraba
     la hoja Y salía del modo, perdiendo la selección. Una tecla, un paso. */
  if (e && e.defaultPrevented) return false;
  const v = document.getElementById('view-consigna');
  if (!v || !v.classList.contains('active')) return false;
  /* ⚠️ Una hoja está encima si SE VE, no si su etiqueta dice `flex`: otras
     herramientas dejan sus hojas con `display: flex` dentro de un
     contenedor escondido (la del recurso de La Voz Prestada, dentro de la
     sala cerrada al saltar al chat), y mirando la etiqueta Escape no salía
     nunca del modo. getClientRects() da cero con la hoja o cualquiera de
     sus antepasados en `display: none`. */
  const encima = Array.from(document.querySelectorAll('.fin-modal-overlay')).some(o => o.getClientRects().length > 0);
  if (encima) return false;
  const t = e && e.target;
  if (t && t.tagName && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return false;
  csgElegSalir();
  return true;
}

/* La ficha (▦) o la fila (☰), convertida en casilla. La marca de la esquina
   es un cuadro dibujado por el CSS con su ✓ dentro, y no los signos ☑ ☐:
   cada tipo de letra pinta esos dos a su manera, y en algunas tabletas
   salen como un cuadrado vacío los dos. */
function csgElegPrepara(el, p, titEl) {
  const id = p.id;
  el.classList.add('csg-elegible');
  el.setAttribute('role', 'checkbox');
  el.tabIndex = 0;
  if (titEl) {
    titEl.id = 'csg-eleg-t' + (++_csgElegSeq);
    el.setAttribute('aria-labelledby', titEl.id);
  }
  const marca = csgEl('span', 'csg-eleg-marca', '✓');
  marca.setAttribute('aria-hidden', 'true');
  el.appendChild(marca);
  if (!_csgElegNodos.has(id)) _csgElegNodos.set(id, []);
  _csgElegNodos.get(id).push(el);
  csgElegMarcaNodo(el, !!(_csgEleg && _csgEleg.has(id)));
  el.addEventListener('click', () => csgElegAlterna(id));
  el.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') { e.preventDefault(); csgElegAlterna(id); }
  });
}
function csgElegMarcaNodo(el, on) {
  el.classList.toggle('csg-elegida', on);
  el.setAttribute('aria-checked', on ? 'true' : 'false');
}

/* Un toque marca o desmarca, y se toca el DOM: no se repinta el anaquel
   (le arrancaría a la tableta la ficha que iba a recibir el toque
   siguiente, y con el teclado se perdería el foco). Una pieza que sale en
   dos estantes tiene dos fichas: se marcan las dos. Cambiar la selección
   desarma el «Sí, retirar»: lo confirmado tiene que ser lo que se ve. */
function csgElegAlterna(id) {
  if (!_csgEleg) return;
  const p = csgDe(id);
  if (!p || p.eliminado) { _csgEleg.delete(id); csgElegPinta(); return; }
  const on = !_csgEleg.has(id);
  if (on) _csgEleg.add(id); else _csgEleg.delete(id);
  (_csgElegNodos.get(id) || []).forEach(el => csgElegMarcaNodo(el, on));
  _csgElegRetirar = false;
  csgElegPinta();
}

/* Cuántas hay elegidas, cuántas de ellas no se ven y cuáles se ven. Las
   retiradas —por aquí o desde otro aparato— salen de la selección: una
   lápida no se puede elegir. «Se ve» es tener una ficha pintada fuera de
   un grupo plegado: plegar también esconde. */
function csgElegCuenta() {
  if (!_csgEleg) return { n: 0, ocultas: 0, visibles: [] };
  Array.from(_csgEleg).forEach(id => { const p = csgDe(id); if (!p || p.eliminado) _csgEleg.delete(id); });
  const visibles = [];
  _csgElegNodos.forEach((nodos, id) => {
    const p = csgDe(id);
    if (!p || p.eliminado) return;
    if (nodos.some(n => n.isConnected && !(n.closest && n.closest('.csg-grupo[hidden]')))) visibles.push(id);
  });
  const vistas = new Set(visibles);
  let ocultas = 0;
  _csgEleg.forEach(id => { if (!vistas.has(id)) ocultas++; });
  return { n: _csgEleg.size, ocultas, visibles };
}
function csgElegPiezas() {
  if (!_csgEleg) return [];
  csgElegCuenta();
  return csgVivas().filter(p => _csgEleg.has(p.id));
}
function csgElegNoSeVen(n) {
  return n === 1 ? '1 no se ve' : n + ' no se ven';
}
function csgElegCuantas(n) {
  return n === 1 ? '1 consigna' : n + ' consignas';
}

/* «☑ Todas las que se ven» elige las que están a la vista; con todas ya
   elegidas, el mismo botón dice «Ninguna» y vacía la selección entera
   (también lo que no se ve: «ninguna» es ninguna, y la barra ya decía
   cuántas no se veían). */
function csgElegTodas() {
  if (!_csgEleg) return;
  const c = csgElegCuenta();
  const todas = c.visibles.length > 0 && c.visibles.every(id => _csgEleg.has(id));
  if (todas || (!c.visibles.length && c.n)) {
    _csgEleg.clear();
    _csgElegNodos.forEach(nodos => nodos.forEach(el => csgElegMarcaNodo(el, false)));
  } else if (!c.visibles.length) {
    csgAviso('No hay ninguna consigna a la vista: quita la búsqueda o el filtro');
    return;
  } else {
    c.visibles.forEach(id => { _csgEleg.add(id); (_csgElegNodos.get(id) || []).forEach(el => csgElegMarcaNodo(el, true)); });
  }
  _csgElegRetirar = false;
  csgElegPinta();
}

/* La barra de elegidas vive FUERA de #csg-anaquel, colgada de la vista, y
   fija encima de la barra de la aplicación, como la barra del compositor:
   así no se rehace con cada repintado del anaquel ni se va con el
   desplazamiento, y el anaquel le deja sitio debajo con su relleno
   (css/consigna.css). Se crea la primera vez que hace falta. */
function csgElegBarra() {
  if (_csgElegBarraEl && _csgElegBarraEl.isConnected) return _csgElegBarraEl;
  if (typeof document === 'undefined' || !document || !document.getElementById) return null;
  const vista = document.getElementById('view-consigna');
  if (!vista) return null;
  const b = csgEl('div', 'csg-eleg-barra');
  b.id = 'csg-eleg-barra';
  b.hidden = true;
  b.setAttribute('role', 'region');
  b.setAttribute('aria-label', 'Consignas elegidas');
  /* La cuenta es un nodo FIJO con role="status", y solo se le cambia el
     texto: un lector de pantalla anuncia los cambios de una región viva
     que ya estaba, no los de una que acaba de nacer. Los botones sí se
     rehacen en cada pintado. */
  const arriba = csgEl('div', 'csg-eleg-arriba');
  const n = csgEl('span', 'csg-eleg-n');
  n.setAttribute('role', 'status');
  arriba.appendChild(n);
  const mandos = csgEl('span', 'csg-eleg-mandos');
  arriba.appendChild(mandos);
  b.appendChild(arriba);
  const acc = csgEl('div', 'csg-eleg-acciones');
  b.appendChild(acc);
  vista.appendChild(b);
  _csgElegBarraEl = b;
  /* Su alto cambia (la cuenta parte renglones distintos al girar la
     tableta): el relleno del anaquel y el aviso de la aplicación lo leen
     de --csg-eleg-alto, que se pone al día solo. */
  if (typeof ResizeObserver === 'function') {
    try { new ResizeObserver(() => csgElegAlto()).observe(b); } catch (e) {}
  }
  return b;
}
function csgElegAlto() {
  const b = _csgElegBarraEl;
  if (!b || !document.body) return;
  if (b.hidden || !_csgEleg) { document.body.style.removeProperty('--csg-eleg-alto'); return; }
  const h = Math.ceil(b.getBoundingClientRect().height);
  if (h > 0) document.body.style.setProperty('--csg-eleg-alto', h + 'px');
}

/* Un botón de la barra: icono y palabra, como los de la barra fija del
   compositor (.csg-bb). `largo` es la parte de la palabra que sobra en un
   teléfono («Mover» · « a estante»): el CSS la esconde por debajo de 480. */
function csgElegBoton(cls, ic, texto, largo, alTocar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'csg-bb ' + cls;
  if (ic) {
    const i = csgEl('span', 'csg-bb-ic', ic);
    i.setAttribute('aria-hidden', 'true');
    b.appendChild(i);
  }
  const t = csgEl('span', 'csg-bb-t', texto);
  if (largo) t.appendChild(csgEl('span', 'csg-eleg-largo', largo));
  b.appendChild(t);
  b.addEventListener('click', alTocar);
  return b;
}

/* Pinta la barra con el estado de ahora. Se llama tras cada cambio, y
   también al final de cada pintado del anaquel, así que es la ÚNICA que
   pone y quita la clase del body. */
function csgElegPinta() {
  if (typeof document === 'undefined' || !document || !document.body) return;
  const barra = _csgEleg ? csgElegBarra() : _csgElegBarraEl;
  if (!_csgEleg) {
    document.body.classList.remove('csg-eligiendo');
    document.body.style.removeProperty('--csg-eleg-alto');
    if (barra) barra.hidden = true;
    return;
  }
  document.body.classList.add('csg-eligiendo');
  if (!barra) return;
  const ae = document.activeElement;
  const foco = ae && barra.contains(ae) && ae.dataset ? ae.dataset.csgFoco || '' : '';
  const c = csgElegCuenta();
  if (!c.n) _csgElegRetirar = false;
  barra.hidden = false;
  const n = barra.querySelector('.csg-eleg-n');
  const mandos = barra.querySelector('.csg-eleg-mandos');
  const acc = barra.querySelector('.csg-eleg-acciones');
  if (!n || !mandos || !acc) return;

  let txt;
  if (_csgElegRetirar) {
    /* Y si alguna tenía algo a medio escribir, se dice ANTES del «Sí»: se
       guarda con ella (csgElegRetirarYa), pero quien la retira tiene que
       saber que ese texto existe. */
    const sin = typeof csgEdSinGuardar === 'function' ? csgEdSinGuardar(csgElegPiezas().map(p => p.id)) : 0;
    txt = '¿Retirar ' + (c.n === 1 ? 'la elegida' : 'las ' + c.n) + '? Se pueden devolver desde «Retiradas».' +
      (sin ? ' ' + (c.n === 1 ? 'Tenía cambios sin guardar: se guardan con ella.' : sin === 1 ? '1 tenía cambios sin guardar: se guardan con ella.' : sin + ' tenían cambios sin guardar: se guardan con ellas.') : '');
  }
  else if (!c.n) txt = 'Ninguna elegida: toca las que quieras mover';
  else txt = (c.n === 1 ? '1 elegida' : c.n + ' elegidas') + (c.ocultas ? ' · ' + csgElegNoSeVen(c.ocultas) : '');
  if (n.textContent !== txt) n.textContent = txt;
  n.classList.toggle('csg-eleg-n-peligro', _csgElegRetirar);

  mandos.textContent = '';
  const todasVistas = c.visibles.length > 0 && c.visibles.every(id => _csgEleg.has(id));
  const ninguna = todasVistas || (!c.visibles.length && c.n > 0);
  const bt = csgBtn('csg-btn-neutro csg-btn-sm csg-eleg-todas', ninguna ? '☐' : '☑', ninguna ? 'Ninguna' : 'Todas', csgElegTodas);
  if (!ninguna) {
    const t = bt.querySelector('.csg-btn-t');
    if (t) t.appendChild(csgEl('span', 'csg-eleg-largo', ' las que se ven'));
    bt.setAttribute('aria-label', 'Elegir todas las que se ven');
  } else bt.setAttribute('aria-label', 'No elegir ninguna');
  bt.dataset.csgFoco = 'eleg:todas';
  mandos.appendChild(bt);
  const salir = csgBtn('csg-btn-neutro csg-btn-sm csg-eleg-salir', '✕', 'Salir', () => csgElegSalir());
  salir.setAttribute('aria-label', 'Salir de elegir');
  salir.dataset.csgFoco = 'eleg:salir';
  mandos.appendChild(salir);

  acc.textContent = '';
  acc.classList.toggle('csg-eleg-confirma', _csgElegRetirar);
  if (_csgElegRetirar) {
    /* «Sí» a la izquierda y «No» donde estaba 🗑 Retirar: un doble toque
       sin querer sobre Retirar cae en «No», y no se lleva nada. */
    const si = csgElegBoton('csg-bb-si', '🗑', 'Sí, retirar ' + c.n + (c.ocultas ? ' (' + csgElegNoSeVen(c.ocultas) + ')' : ''), '', csgElegRetirarYa);
    si.dataset.csgFoco = 'eleg:si';
    acc.appendChild(si);
    const no = csgElegBoton('csg-bb-no', '', 'No', '', () => {
      _csgElegRetirar = false;
      csgElegPinta();
      const r = barra.querySelector('.csg-bb-retirar');
      if (r) { try { r.focus({ preventScroll: true }); } catch (e) {} }
    });
    no.dataset.csgFoco = 'eleg:no';
    acc.appendChild(no);
  } else {
    const mover = csgElegBoton('csg-bb-mover', '🗂', 'Mover', ' a estante', csgElegMover);
    mover.dataset.csgFoco = 'eleg:mover';
    const maq = csgElegBoton('csg-bb-maquina', '🤖', 'Máquina', '', csgElegMaquina);
    maq.dataset.csgFoco = 'eleg:maquina';
    const ret = csgElegBoton('csg-bb-retirar', '🗑', 'Retirar', '', csgElegRetirar);
    ret.dataset.csgFoco = 'eleg:retirar';
    /* Con cero elegidas no se apagan: responden y DICEN por qué no hacen
       nada. Un botón apagado sin explicación se lee como una avería. */
    if (!c.n) [mover, maq, ret].forEach(b => b.setAttribute('aria-disabled', 'true'));
    acc.appendChild(mover);
    acc.appendChild(maq);
    acc.appendChild(ret);
  }
  if (foco) {
    const el = Array.from(barra.querySelectorAll('[data-csg-foco]')).find(x => x.dataset.csgFoco === foco);
    if (el) { try { el.focus({ preventScroll: true }); } catch (e) {} }
  }
  csgElegAlto();
}

/* Con cero elegidas, cada acción lo dice en vez de no hacer nada. */
function csgElegHay(que) {
  if (csgElegPiezas().length) return true;
  csgAviso('Ninguna elegida: toca primero las consignas que quieras ' + que);
  return false;
}

/* Guardar lo que cambió una acción: UN viaje (csgPersistirVarios), y el
   compositor se entera en el acto si tiene abierta una copia de alguna
   —si no, la copia seguiría con los estantes o la máquina de antes—. El
   anaquel se repinta al volver la nube, para que la franja diga cómo fue.
   `aplica(p)` es la MISMA acción sobre una pieza (poner el estante, la
   máquina, la lápida), escrita para poder repetirse sin cambiar nada más;
   `lapida` dice que la acción es retirar.
   ⚠️ LA ACCIÓN SE ESCRIBE SOBRE LA PIEZA COMO ESTÁ AHORA EN LA NUBE. El
   upsert sube la fila ENTERA con el reloj puesto, así que la copia de
   aquí gana todo: si es vieja, pisa el texto que otro aparato corrigió y
   resucita la que allí se retiró, y la corrección de allá no queda en
   ningún sitio. Con la copia al día (csgElegNubeAlDia) se guarda en el
   acto, como siempre. Si no —otra bajada en camino, o la última llegó
   hace más de un minuto—, primero se baja y se funde (csgCargar), y
   entonces la acción se vuelve a aplicar sobre lo fundido: la fusión, con
   la nube más nueva, le devuelve a la pieza SUS escalares —el texto de
   allá, y también los estantes de antes de tocar—, y `aplica` pone
   encima solo lo que se tocó aquí. La que llegó retirada no se toca: ni
   se mueve ni resucita. En pantalla no se nota: lo hecho ya se pintó al
   tocar, y lo fundido se repinta con la acción puesta en el mismo turno. */
function csgElegGuarda(cambiadas, aplica, lapida) {
  const tras = () => {
    csgPintarAnaquel();
    if (typeof csgEdTrasNube === 'function') { try { csgEdTrasNube(); } catch (e) {} }
  };
  let r = null;
  if (typeof aplica !== 'function' || csgElegNubeAlDia()) {
    try { r = csgPersistirVarios(cambiadas); } catch (e) { r = null; }
    if (typeof csgEdTrasNube === 'function') { try { csgEdTrasNube(); } catch (e) {} }
  } else {
    const ids = cambiadas.map(p => p && p.id).filter(Boolean);
    const sobreLaNube = () => {
      const van = ids.map(csgDe).filter(p => p && (lapida || !p.eliminado));
      van.forEach(p => aplica(p));
      tras();
      return csgPersistirVarios(van);
    };
    let viaje = null;
    try { viaje = csgCargar(); } catch (e) { viaje = null; }
    /* ⚠️ CON RELOJ: mientras se espera a la nube, lo tocado aún no está
       guardado en el aparato. Si la bajada no contesta en CSG_ELEG_ESPERA
       —sin señal, la petición no vuelve hasta los ocho segundos de
       csgConReloj—, se escribe con la copia de aquí, como antes de esto:
       sin nube no hay nada más nuevo que respetar, y cerrar la aplicación
       en ese rato perdería lo hecho sin ningún aviso. */
    let reloj = null;
    const espera = new Promise(res => { reloj = setTimeout(res, CSG_ELEG_ESPERA); });
    const suelta = () => clearTimeout(reloj);
    Promise.resolve(viaje).then(suelta, suelta);
    r = Promise.race([Promise.resolve(viaje), espera]).then(sobreLaNube, sobreLaNube);
  }
  Promise.resolve(r).then(tras, tras);
  return r;
}

/* Los títulos de unas pocas, para decir CUÁLES («A», «B» y 3 más). */
function csgElegCuales(ps) {
  const t = ps.slice(0, 3).map(p => '«' + csgAnqCorto(String(p.titulo || '').trim() || CSG_SIN_TITULO, 28) + '»').join(', ');
  return ps.length > 3 ? t + ' y ' + (ps.length - 3) + ' más' : t;
}

/* ── 🗂 Mover a estante ────────────────────────────────────────────── */
function csgElegMover() {
  if (!csgElegHay('mover')) return;
  _csgElegHojaVistos = new Map();
  csgVerAbrir('🗂 Mover a estante', csgElegHojaMover);
}

/* ⚠️ LOS ESTANTES QUE ENSEÑA UNA HOJA ABIERTA NO DESAPARECEN DEBAJO DEL
   DEDO. La lista sale de las piezas (csgEstantesTodos), así que sacar de
   un estante a las únicas que lo tenían lo borraba de la hoja en el acto:
   el renglón de debajo subía a su sitio y el segundo toque —el que quería
   volver a meterlas, porque es un interruptor— caía en OTRO estante y
   metía la selección ahí, sin que nadie lo hubiera tocado. Es la lección
   de «al soltar no se repinta»: lo que va a recibir el siguiente toque no
   se mueve. Mientras la hoja está abierta se recuerda lo que ya enseñó
   (clave → rótulo), y lo que se vació sigue en su sitio, sin marcar y con
   su rótulo de siempre, hasta cerrarla. No crea ningún estante vacío en
   la casa: al cerrar se olvida. Lo usan la hoja de mover de ☑ Elegir y la
   de ⋯ → Estantes de una sola pieza, que tenían la misma avería. */
function csgEstantesConVistos(vistos) {
  const todos = csgEstantesTodos();
  if (!vistos) return todos;
  todos.forEach(e => { if (!vistos.has(e.clave)) vistos.set(e.clave, e.rotulo); });
  const hay = new Set(todos.map(e => e.clave));
  vistos.forEach((rotulo, clave) => { if (!hay.has(clave)) todos.push({ clave, rotulo, n: 0 }); });
  return todos.sort((a, b) => a.clave.localeCompare(b.clave, 'es'));
}

/* La hoja vertical de mover: los estantes de la casa, un renglón de 44 px
   por estante con su tono y lo que pasa con la SELECCIÓN —✓ si están
   todas, «–» y «3 de 5» si están algunas, nada si ninguna—. Tocar uno es
   el interruptor de siempre sobre varias: si ya estaban todas, las saca;
   si no, las mete. Y se crea uno DENTRO, sin perder la selección: si
   hubiera que salir a crearlo, archivar veinte serían veinte selecciones.
   La hoja se queda abierta (se tocan varios estantes seguidos) y se
   repinta en su sitio; «Listo» la cierra. */
function csgElegHojaMover(cuerpo) {
  const ps = csgElegPiezas();
  const n = ps.length;
  const listo = csgBtn('csg-btn-lleno csg-eleg-listo', '', 'Listo', () => { csgVerCerrar(); csgElegPinta(); });
  if (!n) {
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Ya no queda ninguna elegida.'));
    cuerpo.appendChild(listo);
    return;
  }
  const c = csgElegCuenta();
  cuerpo.appendChild(csgEl('p', 'csg-nota', (n === 1 ? '1 consigna elegida' : n + ' consignas elegidas') +
    (c.ocultas ? ' (' + csgElegNoSeVen(c.ocultas) + ' con lo que está puesto)' : '') +
    '. Toca un estante para meterlas; si ya están todas, las saca.'));
  const todos = csgEstantesConVistos(_csgElegHojaVistos);
  todos.forEach(e => {
    const dentro = ps.filter(p => csgAnqEstantesDe(p).some(x => csgClave(x) === e.clave)).length;
    const todas = dentro === n;
    const parte = dentro > 0 && !todas;
    const r = csgVerFila('🗂', e.rotulo, parte ? dentro + ' de ' + n : '', todas, () => {
      csgElegEstante(e.rotulo, false);
      csgVerPintar();
      csgPintarAnaquel();
    });
    r.classList.add(csgTono(e.clave));
    if (parte) { r.classList.add('csg-ver-fila-parte'); r.setAttribute('aria-pressed', 'mixed'); }
    cuerpo.appendChild(r);
  });
  if (!todos.length) cuerpo.appendChild(csgEl('p', 'csg-nota', 'Todavía no hay estantes: escribe el primero aquí abajo.'));

  cuerpo.appendChild(csgVerSep('Estante nuevo'));
  const inp = csgEl('input', 'csg-input');
  inp.type = 'text';
  inp.maxLength = CSG_TOPES.estante;
  /* Corto: a 320 px el recuadro mide 150 y «Nombre del estante (p. ej.…»
     salía cortado; el rótulo «Estante nuevo» de encima ya dice qué va. */
  inp.placeholder = 'p. ej. Maestría';
  inp.setAttribute('aria-label', 'Nombre del estante nuevo');
  inp.setAttribute('autocomplete', 'off');
  inp.setAttribute('enterkeyhint', 'done');
  const crear = () => {
    const nombre = inp.value.replace(/\s+/g, ' ').trim();
    if (!nombre) { csgAviso('Escribe el nombre del estante'); inp.focus(); return; }
    if (!csgClave(nombre)) { csgAviso('Ese nombre no tiene letras'); inp.focus(); return; }
    csgElegEstante(nombre, true);
    csgVerPintar();
    csgPintarAnaquel();
    /* La hoja se repintó: el foco va al recuadro NUEVO, dentro del mismo
       toque, para poder crear otro sin volver a tocar. */
    const otro = cuerpo.querySelector('input.csg-input');
    if (otro) otro.focus();
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); crear(); } });
  const fila = csgEl('div', 'csg-estante-nuevo');
  fila.appendChild(inp);
  fila.appendChild(csgBtn('csg-btn-lleno csg-btn-sm', '＋', 'Crear y poner', crear));
  cuerpo.appendChild(fila);
  cuerpo.appendChild(csgEl('p', 'csg-nota', 'Hasta ' + CSG_TOPES.estantes_n + ' estantes por consigna, de ' + CSG_TOPES.estante + ' letras como mucho. «Maestría» y «maestria» son el mismo.'));
  cuerpo.appendChild(listo);
}

/* El interruptor sobre varias. Con `crear`, SIEMPRE mete (crear un estante
   nunca saca a nadie de él). El tope de doce por pieza se respeta: la que
   ya tiene doce no entra, y se dice cuántas y cuáles. «Maestría» y
   «maestria» son el mismo estante (csgClave), y se conserva el rótulo que
   ya existía en la casa: si no, el anaquel sacaría dos montones iguales. */
function csgElegEstante(rotulo, crear) {
  const ps = csgElegPiezas();
  const k = csgClave(rotulo);
  if (!ps.length || !k) return null;
  const ya = csgEstantesTodos().find(e => e.clave === k);
  const rot = ya ? ya.rotulo : csgCorta(String(rotulo).replace(/\s+/g, ' ').trim(), CSG_TOPES.estante);
  const tiene = p => csgAnqEstantesDe(p).some(x => csgClave(x) === k);
  const dentro = ps.filter(tiene).length;
  const sacar = !crear && dentro === ps.length;
  /* La acción sobre UNA pieza, repetible (csgElegGuarda puede volver a
     aplicarla sobre la pieza recién fundida con la nube): sacar el estante,
     o meterlo si no está y cabe. */
  const aplica = p => {
    const act = csgAnqEstantesDe(p);
    if (sacar) { p.estantes = act.filter(x => csgClave(x) !== k); return; }
    if (act.some(x => csgClave(x) === k) || act.length >= CSG_TOPES.estantes_n) return;
    p.estantes = act.concat([rot]);
  };
  const cambiadas = [], llenas = [];
  ps.forEach(p => {
    if (!sacar && tiene(p)) return;
    if (!sacar && csgAnqEstantesDe(p).length >= CSG_TOPES.estantes_n) { llenas.push(p); return; }
    aplica(p);
    cambiadas.push(p);
  });
  if (cambiadas.length) csgElegGuarda(cambiadas, aplica);
  let msg;
  if (sacar) msg = '🗂 ' + (cambiadas.length === 1 ? '1 consigna sale' : cambiadas.length + ' consignas salen') + ' de «' + rot + '»';
  else if (cambiadas.length) {
    msg = '🗂 ' + csgElegCuantas(cambiadas.length) + ' en «' + rot + '»' + (crear && !ya ? ' (estante nuevo)' : '');
    if (dentro) msg += ' · ' + (dentro === 1 ? '1 ya estaba' : dentro + ' ya estaban');
  } else if (!llenas.length) msg = 'Ya están todas en «' + rot + '»';
  else msg = '🗂 Ninguna entró en «' + rot + '»';
  if (llenas.length) {
    msg += ' · ' + (llenas.length === 1 ? '1 no cabe: ya está' : llenas.length + ' no caben: ya están') +
      ' en ' + CSG_TOPES.estantes_n + ' estantes (' + csgElegCuales(llenas) + ')';
  }
  csgAviso(msg);
  return { sacar, cambiadas: cambiadas.length, llenas: llenas.length, rotulo: rot };
}

/* ── 🤖 Máquina ───────────────────────────────────────────────────── */
function csgElegMaquina() {
  if (!csgElegHay('pasar a otra máquina')) return;
  csgVerAbrir('🤖 Máquina', csgElegHojaMaquina);
}
/* Las máquinas de CSG_MAQUINAS, con la marcada si todas las elegidas van
   a la misma y «2 de 5» si van algunas. Tocar una la pone en las que no la
   tienen y CIERRA la hoja: aquí no se elige más de una. Cambiar la máquina
   no toca el texto: la forma (xml, md, seguida) la pone la máquina al
   usarla (regla 2). */
function csgElegHojaMaquina(cuerpo) {
  const ps = csgElegPiezas();
  const n = ps.length;
  if (!n) {
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Ya no queda ninguna elegida.'));
    return;
  }
  cuerpo.appendChild(csgEl('p', 'csg-nota', 'La máquina que toques pasa a ' + (n === 1 ? 'la elegida' : 'las ' + n + ' elegidas') +
    '. El texto no cambia: la forma la pone la máquina al usarla.'));
  CSG_MAQUINAS.forEach(m => {
    const con = ps.filter(p => csgAnqMaquinaDe(p) === m.id).length;
    const todas = con === n;
    const parte = con > 0 && !todas;
    const r = csgVerFila('🤖', m.nombre, parte ? con + ' de ' + n : '', todas, () => csgElegPonMaquina(m.id));
    r.classList.add('csg-tono-x');
    if (parte) { r.classList.add('csg-ver-fila-parte'); r.setAttribute('aria-pressed', 'mixed'); }
    cuerpo.appendChild(r);
  });
}
function csgElegPonMaquina(id) {
  const ps = csgElegPiezas();
  const nombre = csgAnqMaquinaNombre(id);
  /* ⚠️ Con el MISMO criterio que pinta la hoja (csgAnqMaquinaDe): una
     máquina que la lista no conoce («grok», una fila tocada a mano) sale
     como ✓ Otra, y tocar la ✓ no puede cambiarla a «otra», gastar un
     viaje y ponerle el reloj. Si sale marcada, ya está. */
  const cambian = ps.filter(p => csgAnqMaquinaDe(p) !== id);
  csgVerCerrar();
  if (!cambian.length) { csgAviso('Ya van todas a ' + nombre); csgElegPinta(); return; }
  const aplica = p => { p.maquina = id; };
  cambian.forEach(aplica);
  csgElegGuarda(cambian, aplica);
  csgPintarAnaquel();
  csgAviso('🤖 ' + (cambian.length === 1 ? '1 consigna pasa' : cambian.length + ' consignas pasan') + ' a ' + nombre);
}

/* ── 🗑 Retirar ────────────────────────────────────────────────────── */
/* El primer toque arma y cambia la fila de acciones por «Sí, retirar N ·
   No», y la cuenta dice qué va a pasar ANTES de que pase; el foco va a
   «No». Nada se retira con un solo toque. */
function csgElegRetirar() {
  if (!csgElegHay('retirar')) return;
  _csgElegRetirar = true;
  csgElegPinta();
  const barra = _csgElegBarraEl;
  const no = barra && barra.querySelector('.csg-bb-no');
  if (no) { try { no.focus({ preventScroll: true }); } catch (e) {} }
}
/* Retirar es la lápida de siempre (eliminado + eliminado_at en ISO, como
   csgMenuRetirar): sin ella, la tableta que aún tiene las piezas las
   volvería a subir y resucitarían solas. Y se sale del modo: lo elegido ya
   no está en el anaquel.
   ⚠️ LO QUE CADA UNA TENÍA A MEDIO ESCRIBIR SE GUARDA CON ELLA, y después
   se suelta la copia del compositor (csgEdSoltarPieza). Soltarla sin más
   —como se hacía— tiraba el párrafo que se había dejado sin guardar al
   salir por la barra de abajo: la lápida llevaba el texto viejo, y
   «↩ Devolver» traía la consigna sin él, mientras la barra acababa de
   prometer que «se pueden devolver». Retirar se deshace ENTERO. */
function csgElegRetirarYa() {
  const ps = csgElegPiezas();
  if (!ps.length) { _csgElegRetirar = false; csgElegPinta(); return; }
  const cuando = new Date().toISOString();
  let conCambios = 0;
  ps.forEach(p => { if (typeof csgEdGuardaAntesDeRetirar === 'function' && csgEdGuardaAntesDeRetirar(p.id)) conCambios++; });
  const aplica = p => { p.eliminado = true; p.eliminado_at = cuando; };
  const van = ps.map(p => csgDe(p.id) || p);
  van.forEach(p => {
    aplica(p);
    if (typeof csgEdSoltarPieza === 'function') csgEdSoltarPieza(p.id);
  });
  csgElegGuarda(van, aplica, true);
  csgElegSalir();
  csgAviso('🗑 ' + (ps.length === 1 ? '1 consigna retirada' : ps.length + ' consignas retiradas') +
    (conCambios ? ' · ' + (ps.length === 1 ? 'con lo que tenía sin guardar' : (conCambios === 1 ? '1 con lo que tenía sin guardar' : conCambios + ' con lo que tenían sin guardar')) : '') +
    '. Se pueden devolver desde «🗑 Retiradas», al final del anaquel');
}

/* ══════════════════════════════════════════════════════════════════
   EL ARRANQUE DE LA VISTA (§6.1)
   ══════════════════════════════════════════════════════════════════ */

/* Los cables, UNA vez. Aquí y no en un DOMContentLoaded: ver la cabecera
   de esta parte (la prueba de Node carga el archivo con un `document` que
   revienta si se le toca). initConsigna y csgVerAbrir llaman a esto antes
   de que nadie pueda tocar ninguno de estos botones. */
function csgAnqEngancha() {
  if (_csgAnqEnganchado) return;
  if (typeof document === 'undefined' || !document || !document.getElementById) return;
  _csgAnqEnganchado = true;
  const al = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
  al('csg-back-btn', () => { if (typeof switchView === 'function') switchView('view-inicio'); });
  al('csg-nueva-btn', () => csgAnqNueva());
  al('csg-ver-close', () => csgVerCerrar());
  const ov = document.getElementById('csg-ver-overlay');
  if (ov) ov.addEventListener('click', e => { if (e.target === ov) csgVerCerrar(); });
  /* Escape cierra la hoja vertical, que es la de más arriba: con teclado,
     una hoja que solo se cierra apuntando a la ✕ es una trampa. Sin hoja
     abierta, sale de ☑ Elegir (una tecla, un paso: con la hoja de mover
     abierta, el primer Escape la cierra y la selección sigue). */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (csgAnqVerAbierta()) { csgVerCerrar(); if (csgElegActivo()) csgElegPinta(); return; }
    csgElegEscape(e);
  });
  /* Lo que no subió se reintenta DE VERDAD al volver la señal (La Voz
     Prestada, regla 14): prometer «subirá cuando vuelva» sin nada que lo
     vuelva a intentar es peor que decir que falló. */
  if (typeof window !== 'undefined' && window && typeof window.addEventListener === 'function') {
    window.addEventListener('online', () => {
      /* Lo que salió sin señal se quedó colgado en la fila de subidas hasta
         su reloj (ocho segundos): lo que se toque ahora no lo espera. */
      if (typeof csgSubidaColaSuelta === 'function') csgSubidaColaSuelta();
      const tras = () => {
        csgPintarAnaquel();
        if (typeof csgEdTrasNube === 'function') csgEdTrasNube();
      };
      Promise.resolve(csgSubirPendientes()).then(tras, tras);
    });
  }
}

/* Entrar al anaquel. Pinta AL INSTANTE con lo del aparato y repinta cuando
   llegue la nube: una pantalla en blanco mientras se espera a la red se lee
   como «se rompió» (el arranque de la aplicación, 9 de septiembre).
   csgCargar lee lo del aparato ANTES de su primera espera, así que
   llamarla primero ya deja la lista puesta para el primer pintado, sin
   copiar aquí su manera de leer; y dos entradas seguidas comparten el
   mismo viaje (_csgInitEnCurso), así que no se pide la lista dos veces. */
function initConsigna() {
  csgAnqEngancha();
  /* Una hoja vertical que se quedó abierta en el compositor no puede
     aparecer encima del anaquel al volver: sería la hoja de otra
     pantalla. */
  if (csgAnqVerAbierta()) csgVerCerrar();
  /* ☑ Elegir no sobrevive a salir de la vista (switchView llama a
     csgElegFuera); por si se entró sin pasar por ahí, se entra sin él. */
  if (csgElegActivo()) csgElegSalir({ pintar: false });
  let viaje = null;
  try { viaje = csgCargar(); } catch (e) { viaje = null; }
  /* Volver con ‹ desde el compositor no es abrir el anaquel: no cuenta,
     no mueve la foto de la bitácora y no vuelve a repartir el hueco. */
  const vuelta = _csgAnqVuelta && !!_csgAnqBitDesde;
  _csgAnqVuelta = false;
  if (!vuelta) {
    _csgAnqBitDesde = Date.now();
    /* Si esta apertura ofrece seguir un borrador, la pregunta de la
       bitácora no sale, y por eso no se apunta como una vez ignorada.
       Seguir gana si no hay nada que preguntar o si es la primera
       apertura de ESE borrador; si no, el hueco es de la pregunta. */
    const haySeguir = !!csgAnqSeguirFila();
    _csgAnqSeguirAhora = haySeguir && (!csgBitPendientes().length || !csgAnqSeguirOfrecido());
    if (_csgAnqSeguirAhora) csgAnqSeguirApunta();
    else csgBitApertura();
  }
  csgPintarAnaquel();
  if (viaje && typeof viaje.then === 'function') {
    const tras = () => {
      csgPintarAnaquel();
      if (typeof csgEdTrasNube === 'function') csgEdTrasNube();
    };
    viaje.then(tras, tras);
  }
}

/* ══════════════════════════════════════════════════════════════════
   📜 LA CONSIGNA · PANTALLA (2 de 3): EL COMPOSITOR
   ──────────────────────────────────────────────────────────────────
   La hoja «¿Qué le vas a pedir?», el compositor de bloques
   (#view-consigna-editor), su vista previa con el repaso, el guardado y
   «Duplicar en otro molde» (§5, pasos 1, 2, 3 y 5; §6.9).

   Va detrás del anaquel (parte 1, que declara los ayudantes comunes:
   csgEl, csgBtn, csgVerAbrir, csgAnqPrefs…) y delante de las hojas de
   Usar y Pegar (parte 3). Todo lo que declara aquí lleva el prefijo
   csgEd, csgNueva, csgDuplicar o csgBorrador —o _csgEd para el estado—:
   los <script> de index.html comparten un solo ámbito y una función con
   el nombre de otra la pisa sin ningún aviso (pasó con corAbrir).

   CÓMO ESTÁ HECHO, Y POR QUÉ:
   · SE EDITA UNA COPIA DE TRABAJO (_csgEdPieza), nunca la pieza de la
     lista. Así «‹» sin cambios no toca nada, y el anaquel no enseña a
     medias lo que todavía no se guardó. Al guardar, la copia se VUELCA
     sobre el objeto de la lista —el mismo objeto, porque la fusión de la
     nube conserva las referencias— o entra en ella si es nueva.
   · CADA TECLA VA AL BORRADOR (CSG_CLAVES.borrador) con un respiro
     corto (regla 19). Un compositor que se cierra por una llamada, por
     el botón de atrás o por una recarga del service worker perdería el
     párrafo a medio escribir, y eso en una tableta pasa a diario.
   · ESCRIBIR NO REPINTA. Cada tecla toca solo lo suyo (sus chips, la
     línea de variables, el título propuesto); repintar le arrancaría el
     foco al recuadro y, con él, el teclado de la tableta. Solo repintan
     los cambios de forma: el molde, abrir un bloque plegado, quitar un
     bloque libre, la vista previa.
   · EL FOCO VA DENTRO DEL MISMO TOQUE que abre, sin ningún await
     delante: es lo que hace que en una tableta salga el teclado solo
     (regla 4 del Apunte rápido).
   · NADA ESCRITO POR UNA PERSONA LLEGA A UN ATRIBUTO NI A innerHTML
     (regla 15): todo con createElement y textContent, el <pre> de la
     vista previa incluido. Lo único que va a un atributo son literales
     de este archivo (el ejemplo como marca de agua, los aria).
   ══════════════════════════════════════════════════════════════════ */

/* ── Estado del compositor ─────────────────────────────────────────── */

let _csgEdPieza     = null;       // la copia de trabajo (nunca el objeto de la lista)
let _csgEdNueva     = true;       // todavía no está en la lista
let _csgEdBase      = '';         // la huella de lo guardado, para saber si cambió
let _csgEdMaterial  = '';         // el material del compositor, aunque pase de 20.000
let _csgEdModo      = 'bloques';  // 'bloques' | 'previa'
let _csgEdTab       = '';         // la pestaña de la vista previa
let _csgEdAbiertos  = new Set();  // opcionales que la persona desplegó en esta sesión
let _csgEdAvisos    = [];         // lo que el lector nombró al repartir lo pegado
let _csgEdAvisosAbiertos = true;
let _csgEdRecuperar = null;       // un borrador con cambios de ESTA pieza, ofrecido arriba
let _csgEdAuto      = { tituloMano: false, nombre: '' };
let _csgEdIgual     = '';         // la clave de título que ya se aceptó repetir
let _csgEdGuardado  = '';         // '' | 'si': ya está guardada en la lista
let _csgEdPara      = false;      // lo guardado tiene algo que PARA el uso
/* ⚠️ LA FOTO DE LO QUE HABÍA EN LA LISTA AL ABRIR (o al guardar por
   última vez): título, forma, máquina, estantes y material. Contra ella se
   decide QUÉ cambió la persona, y al guardar se escribe SOLO eso. Volcando
   la copia entera, un 💾 sin tocar nada deshacía lo que otro aparato —o el
   menú ⋯ de este mismo— había cambiado mientras el compositor estaba
   abierto: el texto que la tableta corrigió desaparecía sin rastro. */
let _csgEdOrig      = null;
/* Una pieza NUEVA que nace copiando otra (un duplicado, o la copia de una
   que se retiró) no se guarda al volver si nadie la tocó: su huella al
   abrir. '' en lo pegado y en lo escrito de cero, que no tienen original y
   se guardan al volver en cuanto dicen algo. */
let _csgEdBaseNueva = '';
let _csgEdBaseNuevaQue = '';      // 'duplicado' | 'retirada': para decirlo con palabras
let _csgEdCual      = null;       // las preguntas de «¿Cuál elijo?» en curso
let _csgEdScroll    = 0;          // dónde estaban los bloques antes de la vista previa
/* Sin prototipo, como los valores de Usar: el id de un bloque libre viene
   de la fila, y un «__proto__» le cambiaría el prototipo al mapa. */
let _csgEdTa        = Object.create(null);   // id de bloque → su <textarea> pintado
let _csgEdCartas    = Object.create(null);   // id de bloque → su tarjeta (o su renglón plegado)
let _csgEdFilaEl    = null;
let _csgEdVarsEl    = null;
let _csgEdContEl    = null;
let _csgEdSeq       = 0;
let _csgEdBorradorT = null;
let _csgEdPreviaT   = null;
let _csgEdEnganchado = false;   // los cables del compositor, puestos una vez (ver csgEdEngancha)

/* Pistas que viajan con una pieza recién hecha (de un duplicado) y que
   no son datos de la pieza: qué `name` propuso la máquina, para no
   tomarlo después por escrito a mano. Un WeakMap y no un campo, porque
   un campo de más viajaría a la nube en la fila. */
const _csgEdPistas = new WeakMap();

/* De dónde sale el título propuesto (§5, paso 2): los seis del plan, en
   su orden, y detrás los que abren los moldes que no tienen ninguno de
   esos seis (Voz prestada, Instrucción de sistema, Coordinador, Careo…):
   sin ellos, esas piezas se guardarían como «(sin título)» y el anaquel
   se llenaría de gemelas sin nombre. */
const CSG_ED_TITULO_DE = ['tarea', 'pregunta', 'nombre', 'meta', 'paso', 'borrador',
  'texto', 'tema', 'objetivo', 'identidad', 'mision', 'coordinador', 'postura_a', 'disparador', 'lista'];

/* El respiro del borrador: lo bastante corto para que una recarga a
   destiempo no se lleve más de una palabra, y lo bastante largo para no
   escribir el almacén en cada tecla de una ráfaga. */
const CSG_ED_RESPIRO_BORRADOR = 350;

/* «❓ ¿Cuál elijo?» (§5, paso 2): tres preguntas de sí o no, en orden;
   la primera que se contesta con un sí decide, y si ninguna, Encargo
   completo. En ese orden porque va de lo más concreto (tener ejemplos)
   a lo más general: quien tiene ejemplos casi siempre puede decir
   también que «se va a reusar», y entonces saldría el molde peor. */
const CSG_ED_CUAL = [
  { preg: '¿Tienes ejemplos de cómo quieres la salida?', molde: 'ejemplos' },
  { preg: '¿Tiene que calcular algo o decidir entre opciones?', molde: 'razonado' },
  { preg: '¿Se va a quedar puesta en un Proyecto, un Gem o un GPT?', molde: 'sistema' },
];

/* ══════════════════════════════════════════════════════════════════
   PASO 1 · «¿QUÉ LE VAS A PEDIR?»
   ══════════════════════════════════════════════════════════════════ */

/* La hoja de ＋ Nueva. Tres cosas y en este orden: lo que se dejó a
   medias (lo primero que se quiere al volver), pegar lo que ya se tiene
   (casi nunca se empieza de cero: el prompt ya existe en otro chat) y
   las cuatro clases. Un toque en una baldosa abre el compositor
   DIRECTO, con el molde recomendado y el teclado puesto: preguntar el
   molde antes sería un toque más para decidir algo que casi siempre es
   el recomendado. */
function csgNueva() {
  csgVerAbrir('¿Qué le vas a pedir?', csgNuevaPintar);
}

function csgNuevaPintar(cuerpo) {
  /* Lo que esperaba su respiro se escribe ya: si se salió del compositor
     por la barra de abajo hace un instante, «Seguir con» tiene que traer
     también la última palabra. */
  if (_csgEdPieza) csgBorradorAhora();
  const b = csgBorradorLee();
  if (b && !b.guardada && csgEdAlgoEscritoDe(b.pieza, b.material, b.tituloMano)) {
    const nombre = String(b.pieza.titulo || '').trim() || csgEdTituloPropuesto(b.pieza) || csgEdNombreDeForma(b.pieza);
    const caja = csgEl('div', 'csg-seguir');
    caja.appendChild(csgVerFila('✏️', 'Seguir con «' + nombre + '»', null, null, () => {
      csgVerCerrar();
      csgBorradorSeguir();
    }, 'a medio escribir' + (b.t ? ' · ' + csgHace(b.t) : '')));
    /* Descartar es tirar texto de alguien: dos toques en el mismo sitio y
       sin confirm(), que en la aplicación instalada puede no salir nunca
       (La Voz Prestada, regla 22). */
    caja.appendChild(csgEdDosToques('Descartar', 'Sí, descartar', () => {
      csgBorradorDescarta();
      csgVerPintar();
      csgAviso('Descartado lo que tenías a medio escribir');
    }));
    cuerpo.appendChild(caja);
  }

  const pegar = csgVerFila('📋', 'Pegar lo que ya tengo', null, null, () => {
    csgVerCerrar();
    if (typeof csgAbrirPegar === 'function') csgAbrirPegar('');
  }, 'lo reparte en bloques y propone la forma');
  pegar.classList.add('csg-ver-fila-tenida');
  cuerpo.appendChild(pegar);

  const clases = csgEl('div', 'csg-clases');
  CSG_CLASES.forEach(c => {
    const bt = csgEl('button', 'csg-clase-baldosa csg-clase-' + c.id);
    bt.type = 'button';
    bt.appendChild(csgEl('span', 'csg-clase-ic', c.ic));
    bt.appendChild(csgEl('span', 'csg-clase-nom', c.nombre));
    bt.appendChild(csgEl('span', 'csg-clase-para', c.para));
    /* ⚠️ Sin nada asíncrono entre el toque y el foco: el compositor se
       abre y enfoca el primer obligatorio en esta misma pila, que es lo
       único que hace salir el teclado en una tableta. */
    bt.addEventListener('click', () => {
      csgVerCerrar();
      csgAbrirCompositor(null, { clase: c.id });
    });
    clases.appendChild(bt);
  });
  cuerpo.appendChild(clases);
}

/* Un botón que pide dos toques en el mismo sitio: el primero lo vuelve
   rojo y dice qué va a pasar; el segundo lo hace. Se deshace solo a los
   cuatro segundos, para que un roce de hace un rato no quede armado. */
function csgEdDosToques(texto, textoSi, alConfirmar) {
  const b = csgBtn('csg-btn-neutro csg-btn-sm', '', texto);
  let armado = false, reloj = null;
  const t = b.querySelector('.csg-btn-t') || b;
  b.addEventListener('click', () => {
    if (!armado) {
      armado = true;
      t.textContent = textoSi;
      b.classList.remove('csg-btn-neutro');
      b.classList.add('csg-btn-peligro');
      clearTimeout(reloj);
      reloj = setTimeout(() => {
        armado = false;
        t.textContent = texto;
        b.classList.remove('csg-btn-peligro');
        b.classList.add('csg-btn-neutro');
      }, 4000);
      return;
    }
    clearTimeout(reloj);
    alConfirmar();
  });
  return b;
}

/* ══════════════════════════════════════════════════════════════════
   LA PIEZA NUEVA Y EL DUPLICADO
   ══════════════════════════════════════════════════════════════════ */

function csgEdMoldeDe(id) {
  return (typeof id === 'string' && Object.prototype.hasOwnProperty.call(CSG_MOLDES, id)) ? CSG_MOLDES[id] : null;
}
function csgEdMolde(p) { return csgEdMoldeDe(p && p.molde); }

/* Una pieza nueva SIN guardar, con todos los campos del contrato de la
   pieza del núcleo (csgDesdeFila). Los bloques nacen con su `inicial`
   puesto (la etiqueta de Voz prestada y del Careo, el tope de Por
   lotes): son textos que casi nadie cambia y que, si hubiera que
   escribirlos, nadie escribiría. Nace sin reloj (`actualizado: 0`):
   el reloj lo pone el guardado, que es cuando pasa a existir. */
function csgNuevaPieza(clase, moldeId) {
  const c = csgClaseDe(clase || 'prompt');
  const molde = csgEdMoldeDe(moldeId) || csgEdMoldeDe(c && c.molde) || CSG_MOLDES.rapido;
  const maq = typeof csgMaquinaUltima === 'function' ? csgMaquinaUltima() : 'claude';
  return {
    id: csgNuevoId(),
    clase: molde.clase,
    molde: molde.id,
    titulo: '',
    maquina: maq || 'claude',
    bloques: molde.bloques.map(e => {
      const d = csgBloqueDef(molde.id, e.id);
      return { id: e.id, rotulo: String(d.rotulo || e.id), t: String(d.inicial || '') };
    }),
    material: '',
    estantes: [],
    cuaderno: '',
    notas: '',
    bitacora: [],
    versiones: [],
    version: 1,
    usos: 0,
    ultima: 0,
    autor: csgAutor(),
    eliminado: false,
    eliminado_at: null,
    actualizado: 0,
    subida: false,
  };
}

/* «Duplicar en otro molde» (§2, §6.9): una pieza NUEVA sin guardar, en
   el molde de destino. No abre nada: la devuelve, y quien llama decide.
   · Los ids que el destino tiene van a su sitio: `comprobacion` es un
     solo id en las cuatro clases justo para esto (regla 3).
   · Los demás consultan CSG_EQUIVALE y van al primer candidato que el
     destino tenga y que no haya recibido ya su propio bloque. Dos
     orígenes al mismo destino (Siempre y Nunca → Reglas) se pegan con
     una línea en blanco: juntarlos es la única forma de no perder
     ninguno.
   · Lo que no encuentra sitio va al final como BLOQUE LIBRE, con su
     rótulo de origen y marcado «traído de «X»: colócalo o quítalo». No
     se tira nada: es texto de la persona, y decidir por ella dónde va un
     «Rol» en un SKILL.md sería adivinar.
   · Un texto que sigue siendo el `inicial` de su molde de origen no se
     trae: la persona no lo escribió, y el destino ya pone el suyo. */
function csgDuplicarEnMolde(pieza, moldeId) {
  const src = (pieza && typeof pieza === 'object') ? pieza : {};
  const destino = csgEdMoldeDe(moldeId) || csgEdMolde(src) || CSG_MOLDES.encargo;
  const origen = csgEdMolde(src);
  const nueva = csgNuevaPieza(destino.clase, destino.id);
  const ids = destino.bloques.map(e => e.id);

  const fuentes = [];
  const porId = Object.create(null);
  (Array.isArray(src.bloques) ? src.bloques : []).forEach(b => {
    if (!b || b.id === undefined || b.id === null || b.id === '') return;
    const id = String(b.id);
    const t = String(b.t == null ? '' : b.t);
    if (!t.trim()) return;
    const ini = origen ? String(csgBloqueDef(origen.id, id).inicial || '').trim() : '';
    if (ini && t.trim() === ini) return;
    /* Un id repetido (una pieza fundida a medias) se junta en vez de
       perder el segundo. */
    if (porId[id]) { porId[id].t += '\n\n' + t; return; }
    const rotulo = String(b.rotulo || '').trim() ||
      String((origen ? csgBloqueDef(origen.id, id) : csgBloqueDef(null, id)).rotulo || id);
    porId[id] = { id, rotulo, t, traido: b.traido || '' };
    fuentes.push(porId[id]);
  });

  const propio = Object.create(null);
  const puestos = Object.create(null);
  const resto = [];
  fuentes.forEach(f => {
    if (ids.indexOf(f.id) >= 0) { propio[f.id] = true; (puestos[f.id] = puestos[f.id] || []).push(f.t); }
    else resto.push(f);
  });
  const libres = [];
  resto.forEach(f => {
    const cands = Object.prototype.hasOwnProperty.call(CSG_EQUIVALE, f.id) ? CSG_EQUIVALE[f.id] : [];
    const c = cands.find(x => ids.indexOf(x) >= 0 && !propio[x]);
    if (c) (puestos[c] = puestos[c] || []).push(f.t);
    else libres.push(f);
  });

  nueva.bloques = destino.bloques.map(e => {
    const d = csgBloqueDef(destino.id, e.id);
    const ts = puestos[e.id];
    return { id: e.id, rotulo: String(d.rotulo || e.id), t: ts ? ts.join('\n\n') : String(d.inicial || '') };
  });
  const usados = new Set(ids);
  const deDonde = origen ? origen.nombre : 'la pieza de origen';
  libres.forEach(f => {
    const id = csgSlugId(f.rotulo, usados);
    usados.add(id);
    nueva.bloques.push({ id, rotulo: f.rotulo, t: f.t, traido: f.traido || deDonde });
  });

  /* El título: una pieza que YA está en el anaquel se duplica con el
     nombre del molde detrás, o el anaquel tendría dos fichas iguales y el
     guardado avisaría de un título repetido que nadie eligió. Una pieza
     que todavía no existe (lo recién pegado, al cambiar la propuesta del
     lector) conserva el suyo: ahí no hay dos. */
  let titulo = String(src.titulo || '').trim();
  if (titulo && src.id && csgDe(src.id)) {
    titulo = csgCorta(csgEdTituloSinMolde(titulo) + ' (' + destino.nombre + ')', CSG_TOPES.titulo);
  }
  nueva.titulo = titulo;
  if (src.maquina) nueva.maquina = String(src.maquina);
  nueva.estantes = Array.isArray(src.estantes) ? src.estantes.filter(x => typeof x === 'string') : [];
  nueva.material = String(src.material || '');
  nueva.cuaderno = String(src.cuaderno || '');
  nueva.notas = String(src.notas || '');

  /* El `name` de un SKILL.md se propone desde el título de origen (sin
     el sufijo del molde) y se apunta como propuesto, para que corregir el
     título lo siga proponiendo mientras nadie lo toque a mano. */
  const pistas = {};
  if (ids.indexOf('nombre') >= 0 && !puestos.nombre) {
    const s = csgSlug(csgEdTituloSinMolde(src.titulo));
    if (s) {
      nueva.bloques.forEach(b => { if (b.id === 'nombre') b.t = s; });
      pistas.autoNombre = s;
    }
  }
  /* Y DE QUÉ es duplicado: ‹ sin tocarlo no lo guarda (§6.9 y §12, «a
     la vista y sin guardar»), pero solo si el original ESTÁ en el anaquel.
     ⚠️ Lo pegado con la forma cambiada («cambiar» en la hoja de Pegar)
     también pasa por aquí, y su original no está guardado en ninguna
     parte: tirarlo al volver sería perder lo pegado. Lo decide
     csgAbrirCompositor mirando la lista, no esta función. */
  pistas.duplicadoDe = String(src.id || '');
  _csgEdPistas.set(nueva, pistas);
  return nueva;
}

/* ══════════════════════════════════════════════════════════════════
   LA COPIA DE TRABAJO
   ══════════════════════════════════════════════════════════════════ */

/* Una copia profunda con todos los campos de la pieza (los que falten
   los pone csgNuevaPieza) y sin ids repetidos: si una fila fundida a
   medias trae dos veces el mismo, se JUNTAN con una línea en blanco en
   vez de quedarse con el primero, porque el segundo también es texto de
   alguien. */
function csgEdClonar(p) {
  const c = JSON.parse(JSON.stringify(p || {}));
  const base = csgNuevaPieza(c.clase || 'prompt', c.molde);
  Object.keys(c).forEach(k => { if (c[k] !== undefined) base[k] = c[k]; });
  const vistos = Object.create(null);
  const bloques = [];
  (Array.isArray(base.bloques) ? base.bloques : []).forEach(b => {
    if (!b || b.id === undefined || b.id === null || b.id === '') return;
    const id = String(b.id);
    const t = String(b.t == null ? '' : b.t);
    if (vistos[id]) {
      if (t.trim()) vistos[id].t = vistos[id].t.trim() ? vistos[id].t + '\n\n' + t : t;
      return;
    }
    const o = { id, rotulo: String(b.rotulo || ''), t };
    if (b.traido) o.traido = String(b.traido);
    vistos[id] = o;
    bloques.push(o);
  });
  base.bloques = bloques;
  base.estantes = Array.isArray(base.estantes) ? base.estantes.filter(x => typeof x === 'string') : [];
  return base;
}

function csgEdBloque(id) {
  const p = _csgEdPieza;
  if (!p || !Array.isArray(p.bloques)) return null;
  return p.bloques.find(b => b && b.id === id) || null;
}

function csgEdTexto(id) {
  const b = csgEdBloque(id);
  return b ? String(b.t == null ? '' : b.t) : '';
}

function csgEdPonTexto(id, t) {
  const p = _csgEdPieza;
  if (!p) return;
  let b = csgEdBloque(id);
  if (!b) {
    const molde = csgEdMolde(p);
    b = { id, rotulo: String(csgBloqueDef(molde ? molde.id : null, id).rotulo || id), t: '' };
    p.bloques.push(b);
  }
  b.t = String(t == null ? '' : t);
}

/* La huella de lo que importa para saber si algo cambió: título, forma,
   máquina, estantes, los bloques con texto (ordenados por id: el orden
   en que se guardan no es un cambio) y el material. */
function csgEdHuella(p, material) {
  if (!p) return '';
  const bs = (Array.isArray(p.bloques) ? p.bloques : [])
    .filter(b => b && b.id && String(b.t == null ? '' : b.t).trim())
    .map(b => [String(b.id), String(b.t)])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return JSON.stringify([String(p.titulo || '').trim(), String(p.clase || ''), String(p.molde || ''),
    String(p.maquina || ''), (p.estantes || []).map(String), bs, String(material == null ? '' : material)]);
}

/* El título como se guarda (un blanco entre palabras, recortado al tope):
   comparar el de la copia con el de la lista sin normalizar haría
   «cambiado» un título con un doble espacio que nadie tocó. */
function csgEdTituloNorm(t) {
  return csgCorta(String(t == null ? '' : t).replace(/\s+/g, ' ').trim(), CSG_TOPES.titulo);
}
/* La FORMA de una pieza: su molde y sus bloques como se guardan. Es la
   unidad que se escribe junta (unos bloques sin su molde no se entienden). */
function csgEdForma(p) {
  return JSON.stringify([String((p && p.molde) || ''), csgEdBloquesParaGuardar(p || {})]);
}
function csgEdFoto(obj, material) {
  if (!obj || typeof obj !== 'object') return null;
  return {
    titulo: csgEdTituloNorm(obj.titulo),
    maquina: String(obj.maquina || ''),
    estantes: (Array.isArray(obj.estantes) ? obj.estantes : []).filter(x => typeof x === 'string'),
    forma: csgEdForma(obj),
    material: String(material == null ? (obj.material || '') : material),
  };
}
/* La foto que viene del borrador (del aparato, o sea que puede venir
   tocada): o tiene todos sus campos con su tipo, o no vale. */
function csgEdFotoValida(o) {
  if (!o || typeof o !== 'object') return null;
  if (typeof o.titulo !== 'string' || typeof o.maquina !== 'string' || typeof o.forma !== 'string' ||
      typeof o.material !== 'string' || !Array.isArray(o.estantes)) return null;
  return { titulo: o.titulo, maquina: o.maquina, forma: o.forma, material: o.material, estantes: o.estantes.filter(x => typeof x === 'string') };
}
/* ¿La versión de AHORA ya se usó? Solo entonces corregirla la guarda
   aparte (regla 10: el 👍 va atado a su versión). Una versión que nadie
   ha usado se corrige en su sitio: ningún 👍 habla de ella, y hacer nacer
   una versión en cada 💾 plegaba a la undécima el texto de la versión que
   SÍ tenía su 👍. Sin bitácora (una fila de otra parte), manda `usos`. */
function csgEdVersionUsada(obj) {
  const v = parseInt(obj && obj.version, 10) || 1;
  const bit = (Array.isArray(obj && obj.bitacora) ? obj.bitacora : []).filter(u => u && u.uid);
  if (!bit.length) return ((obj && obj.usos) || 0) > 0;
  return bit.some(u => (parseInt(u.v, 10) || 1) === v);
}
/* Los estantes, a tres bandas y por clave: se quitan los que la persona
   quitó en el compositor, se añaden los que puso, y se quedan los que el
   menú ⋯ (u otro aparato) puso mientras tanto. */
function csgEdMezclaEstantes(actual, antes, mios) {
  const k = x => csgClave(x);
  const kAntes = new Set((antes || []).map(k)), kMios = new Set((mios || []).map(k));
  const out = [];
  const vistos = new Set();
  (Array.isArray(actual) ? actual : []).forEach(e => {
    if (typeof e !== 'string') return;
    const c = k(e);
    if (kAntes.has(c) && !kMios.has(c)) return;          // la persona lo quitó
    if (vistos.has(c)) return;
    vistos.add(c); out.push(e);
  });
  (mios || []).forEach(e => {
    const c = k(e);
    if (kAntes.has(c) || vistos.has(c)) return;          // ya estaba, o ya entró
    vistos.add(c); out.push(e);
  });
  return out.slice(0, CSG_TOPES.estantes_n);
}

/* ¿Hay algo ESCRITO por la persona? El texto `inicial` de un molde no
   cuenta (no lo escribió nadie), ni un título que propuso la
   herramienta. Es lo que decide si «‹» guarda o descarta una pieza
   nueva: una hoja en blanco no se guarda como borrador vacío. */
function csgEdAlgoEscritoDe(p, material, tituloMano) {
  if (!p) return false;
  if (String(material == null ? '' : material).trim()) return true;
  if (tituloMano && String(p.titulo || '').trim()) return true;
  const molde = csgEdMolde(p);
  return (Array.isArray(p.bloques) ? p.bloques : []).some(b => {
    if (!b || !b.id) return false;
    const t = String(b.t == null ? '' : b.t).trim();
    if (!t) return false;
    const ini = String(csgBloqueDef(molde ? molde.id : null, b.id).inicial || '').trim();
    return !(ini && t === ini);
  });
}
function csgEdAlgoEscrito() {
  return csgEdAlgoEscritoDe(_csgEdPieza, _csgEdMaterial, _csgEdAuto.tituloMano);
}

/* Sucio: una pieza nueva lo está en cuanto tiene algo escrito (no hay
   nada guardado con qué compararla); una de la lista, cuando su huella
   ya no es la de lo guardado. */
function csgEdSucio() {
  if (!_csgEdPieza) return false;
  if (_csgEdNueva) return csgEdAlgoEscrito();
  return csgEdHuella(_csgEdPieza, _csgEdMaterial) !== _csgEdBase;
}

/* ¿Hay que guardar antes de soltar la copia? Lo que decide el ‹, el
   cambio de pieza y el borrador. Una pieza de la lista, si cambió; una
   nueva con original (duplicado, copia de una retirada), si cambió desde
   que se abrió; una nueva de cero, si dice algo. Distinto de csgEdSucio,
   que es lo que dice la cabecera: un duplicado sin tocar SÍ está «sin
   guardar», pero volver sin tocarlo no tiene que dejar una ficha de más. */
function csgEdHayQueGuardar() {
  if (!_csgEdPieza) return false;
  if (_csgEdNueva) return _csgEdBaseNueva ? csgEdHuella(_csgEdPieza, _csgEdMaterial) !== _csgEdBaseNueva : csgEdAlgoEscrito();
  return csgEdSucio();
}

/* Suelta la copia de trabajo si es de esa pieza (la retiró el menú ⋯ de
   este aparato): su borrador y su copia en memoria se van con ella. Si no,
   al abrir otra pieza se guardaba «en silencio» lo de la retirada, y
   volvía como pieza nueva. */
function csgEdSoltarPieza(id) {
  if (!id) return;
  csgBorradorBorra(id);
  if (_csgEdPieza && _csgEdPieza.id === id && !csgEdEnVista()) {
    clearTimeout(_csgEdBorradorT);
    _csgEdBorradorT = null;
    _csgEdPieza = null;
    _csgEdRecuperar = null;
  }
}

/* ¿Cuántas de esas piezas tienen algo a medio escribir? La copia del
   compositor si es de una de ellas y cambió, o el borrador del aparato si
   es de una, no está guardado y dice algo (tras cerrar la aplicación, la
   copia ya no está y el borrador sí). El borrador se lee UNA vez. */
function csgEdSinGuardar(ids) {
  const quiere = new Set((ids || []).filter(Boolean));
  if (!quiere.size) return 0;
  const hay = new Set();
  if (_csgEdPieza && quiere.has(_csgEdPieza.id) && csgEdHayQueGuardar()) hay.add(_csgEdPieza.id);
  const b = csgBorradorLee();
  if (b && quiere.has(b.pieza.id) && !b.guardada && csgEdAlgoEscritoDe(b.pieza, b.material, b.tituloMano)) hay.add(b.pieza.id);
  return hay.size;
}

/* ⚠️ ANTES DE RETIRAR, LO QUE ESA PIEZA TENÍA A MEDIO ESCRIBIR SE GUARDA EN
   ELLA. Retirar soltaba la copia del compositor y su borrador
   (csgEdSoltarPieza) sin mirar si habían cambiado: el párrafo que se dejó
   sin guardar al salir por la barra de abajo no quedaba en NINGÚN sitio,
   ni en la lápida ni en la nube, y «↩ Devolver» traía la consigna sin él.
   Con esto, la lápida lleva el texto y devolverla la trae entera. La copia
   en memoria manda sobre el borrador (el borrador se escribe con un
   respiro y puede ir un paso atrás). Devuelve true si guardó algo. */
function csgEdGuardaAntesDeRetirar(id) {
  if (!id) return false;
  if (_csgEdPieza && _csgEdPieza.id === id && csgEdHayQueGuardar()) {
    csgEdGuardar('callado');
    return true;
  }
  const b = csgBorradorLee();
  if (b && b.pieza.id === id && !b.guardada && csgEdAlgoEscritoDe(b.pieza, b.material, b.tituloMano)) {
    csgBorradorRescata(b);
    return true;
  }
  return false;
}

function csgEdEnVista() {
  const v = document.getElementById('view-consigna-editor');
  return !!(v && v.classList.contains('active'));
}

/* El título propuesto: las primeras siete palabras del primer bloque de
   CSG_ED_TITULO_DE que tenga texto, sin la viñeta de delante y sin la
   coma o el punto de detrás. Siete, porque un título que no cabe en una
   ficha de 280 px se corta, y lo que se corta es lo que lo distinguía. */
function csgEdTituloPropuesto(p) {
  for (let i = 0; i < CSG_ED_TITULO_DE.length; i++) {
    const t = csgTextoDe(p, CSG_ED_TITULO_DE[i]).replace(/\s+/g, ' ').trim();
    if (!t) continue;
    const limpio = t.replace(/^(?:[-•*]\s+|\d+[.)]\s+)/, '');
    const pal = limpio.split(' ').filter(Boolean).slice(0, 7).join(' ').replace(/[\s.,;:…—–-]+$/, '');
    if (pal) return csgCorta(pal, CSG_TOPES.titulo);
  }
  return '';
}

/* El título sin el «(SKILL.md)» que le pone un duplicado: es un rótulo
   para el anaquel, no parte del nombre, y un `name` que acabe en
   «-skill-md» no lo escribiría nadie. */
function csgEdTituloSinMolde(t) {
  const s = String(t == null ? '' : t).trim();
  const m = s.match(/^(.*\S)\s+\(([^()]+)\)$/);
  if (m && Object.keys(CSG_MOLDES).some(k => CSG_MOLDES[k].nombre === m[2])) return m[1];
  return s;
}

/* Para nombrar una pieza que no tiene ni título ni texto de donde
   sacarlo: su clase y su molde («Prompt · Rápido»). */
function csgEdNombreDeForma(p) {
  const m = csgEdMolde(p);
  const c = csgClaseDe((m && m.clase) || (p && p.clase) || 'prompt');
  return (c ? c.nombre : 'Consigna') + (m ? ' · ' + m.nombre : '');
}

/* Los bloques como se guardan: primero los del molde en su orden y con
   texto, con el rótulo de ESE molde; después los libres en el suyo,
   también vacíos (llevan un rótulo que alguien escribió). Así la fila
   de la base va «en el orden del molde» (§9) y el armado no depende del
   orden en que se fueron escribiendo. */
function csgEdBloquesParaGuardar(p) {
  const molde = csgEdMolde(p);
  const ids = molde ? molde.bloques.map(e => e.id) : [];
  const out = [];
  const vistos = Object.create(null);
  const bs = Array.isArray(p.bloques) ? p.bloques : [];
  ids.forEach(id => {
    const b = bs.find(x => x && x.id === id);
    if (!b) return;
    const t = String(b.t == null ? '' : b.t);
    if (!t.trim()) return;
    vistos[id] = true;
    out.push({ id, rotulo: String(csgBloqueDef(molde.id, id).rotulo || id), t });
  });
  bs.forEach(b => {
    if (!b || !b.id || ids.indexOf(b.id) >= 0 || vistos[b.id]) return;
    vistos[b.id] = true;
    out.push({ id: String(b.id), rotulo: String(b.rotulo || b.id), t: String(b.t == null ? '' : b.t) });
  });
  return out;
}

/* ══════════════════════════════════════════════════════════════════
   EL BORRADOR A MEDIO ESCRIBIR (regla 19)
   ──────────────────────────────────────────────────────────────────
   Uno solo, con la forma del contrato ({pieza, material, t}) y además
   lo que hace falta para seguir donde se dejó (`nueva`, `tituloMano`,
   `autoNombre`). `guardada: true` marca el caso de un material de más de
   20.000 caracteres: la pieza ya se guardó, pero ese material no cabe
   en ella (§9, paso 4) y vive aquí para la hoja de Usar.
   ══════════════════════════════════════════════════════════════════ */

function csgBorradorLee() {
  try {
    const b = JSON.parse(localStorage.getItem(CSG_CLAVES.borrador));
    if (b && typeof b === 'object' && b.pieza && typeof b.pieza === 'object' && b.pieza.id) {
      b.material = String(b.material == null ? '' : b.material);
      return b;
    }
  } catch (e) {}
  return null;
}

/* Sin `id`, se borra el que haya; con `id`, solo si es de esa pieza: el
   borrador de OTRA pieza es texto de alguien que todavía no decidió. */
function csgBorradorBorra(id) {
  try {
    if (id) {
      const b = csgBorradorLee();
      if (!b || b.pieza.id !== id) return;
    }
    localStorage.removeItem(CSG_CLAVES.borrador);
  } catch (e) {}
}

/* El material que no cupo en la pieza (más de 20.000), si es de ESTA
   pieza. Lo usa la hoja de Usar cuando se abre desde el anaquel: «lo
   guardado, o lo que quedó en el borrador si no cabía» (§5, paso 4). */
function csgBorradorMaterial(id) {
  const b = csgBorradorLee();
  if (!b || !id || b.pieza.id !== id) return '';
  return csgLargoTexto(b.material) > CSG_TOPES.material ? b.material : '';
}

/* «Descartar» lo que se dejó a medio escribir. ⚠️ NO BASTA CON BORRAR LA
   LLAVE: si se salió del compositor por la barra de abajo, la copia de
   trabajo sigue en memoria y SUCIA, y el siguiente csgAbrirCompositor la
   «guardaría en silencio» al empezar otra pieza (es lo que hace con lo
   que no se guardó). O sea que lo descartado aparecería en el anaquel dos
   toques después, y precisamente lo que se pidió tirar. Se suelta también
   la copia, si es de esa pieza. Lo usan la hoja de ＋ Nueva y el renglón
   del anaquel: una sola manera de descartar. */
function csgBorradorDescarta() {
  const b = csgBorradorLee();
  clearTimeout(_csgEdBorradorT);
  _csgEdBorradorT = null;
  if (_csgEdPieza && (!b || _csgEdPieza.id === b.pieza.id) && !csgEdEnVista()) {
    _csgEdPieza = null;
    _csgEdRecuperar = null;
  }
  csgBorradorBorra();
}

function csgBorradorEscribe(guardada) {
  const p = _csgEdPieza;
  if (!p) return;
  /* ⚠️ HAY UNA SOLA RANURA, Y NO SE PISA EL BORRADOR DE OTRA PIEZA. Si lo
     que hay es de otra, con algo escrito y sin guardar, primero va al
     anaquel y se dice: es texto de alguien que todavía no decidió, y
     escribir encima lo borraba sin rastro. */
  const ya = csgBorradorLee();
  if (ya && !ya.guardada && ya.pieza.id !== p.id && csgEdAlgoEscritoDe(ya.pieza, ya.material, ya.tituloMano)) {
    csgBorradorRescata(ya);
  }
  try {
    localStorage.setItem(CSG_CLAVES.borrador, JSON.stringify({
      pieza: Object.assign({}, p, { material: '' }),
      material: _csgEdMaterial,
      t: Date.now(),
      nueva: _csgEdNueva,
      guardada: !!guardada,
      tituloMano: !!_csgEdAuto.tituloMano,
      autoNombre: _csgEdAuto.nombre || '',
      /* Con qué se comparó al escribirlo: rescatarlo después escribe SOLO
         lo que se cambió en aquella sesión, no la copia entera. */
      orig: _csgEdOrig,
      baseNueva: _csgEdBaseNueva,
      baseNuevaQue: _csgEdBaseNuevaQue,
    }));
  } catch (e) { /* el almacén lleno lo dice la franja de la nube; aquí no hay más sitio */ }
}

/* Lleva al anaquel un borrador que nadie decidió (lo de otra pieza que se
   quedó a medias) y lo dice. Sobre su pieza, escribiendo solo lo que se
   cambió en aquella sesión; si la pieza ya no está, como nueva. */
function csgBorradorRescata(b) {
  if (!b || !b.pieza) return null;
  const r = csgEdVolcar(csgEdClonar(b.pieza), b.material, csgEdFotoValida(b.orig));
  const obj = r.obj;
  csgBorradorBorra(b.pieza.id);
  csgAviso('💾 Lo que tenías a medio escribir se guardó en el anaquel: «' + (obj.titulo || csgEdNombreDeForma(obj)) + '»');
  return obj;
}

function csgBorradorAhora() {
  clearTimeout(_csgEdBorradorT);
  _csgEdBorradorT = null;
  const p = _csgEdPieza;
  if (!p) return;
  if (csgEdHayQueGuardar()) csgBorradorEscribe(false);
  else if (csgLargoTexto(_csgEdMaterial) > CSG_TOPES.material) csgBorradorEscribe(true);
  else if (!_csgEdRecuperar) csgBorradorBorra(p.id);
}

function csgBorradorProgramar() {
  clearTimeout(_csgEdBorradorT);
  _csgEdBorradorT = setTimeout(csgBorradorAhora, CSG_ED_RESPIRO_BORRADOR);
}

/* «✏️ Seguir con «X»»: se abre el compositor con lo que había, tal
   cual, y SUCIO: lo de dentro todavía no está guardado, y «‹» tiene que
   guardarlo. Si era la corrección de una pieza que entretanto se retiró,
   se sigue como pieza nueva: volcarla sobre una lápida la escondería. */
function csgBorradorSeguir() {
  if (_csgEdPieza) csgBorradorAhora();
  const b = csgBorradorLee();
  if (!b) return null;
  if (_csgEdPieza && _csgEdPieza.id !== b.pieza.id && csgEdHayQueGuardar()) csgEdGuardar('callado');
  const origen = csgDe(b.pieza.id);
  const copia = csgEdClonar(b.pieza);
  let nueva = !origen;
  if (origen && origen.eliminado) { copia.id = csgNuevoId(); nueva = true; }
  csgEdEmpezar(copia, {
    nueva,
    material: b.material,
    tituloMano: b.tituloMano !== undefined ? !!b.tituloMano : !!String(copia.titulo || '').trim(),
    autoNombre: b.autoNombre || '',
    /* La foto de cuando se empezó a escribir, si el borrador la trae: así
       lo que otro aparato cambió desde entonces se nota al guardar. */
    orig: nueva ? null : (csgEdFotoValida(b.orig) || csgEdFoto(origen, origen.material)),
  });
  if (!nueva) _csgEdBase = csgEdHuella(origen, origen.material || '');
  else if (b.nueva && typeof b.baseNueva === 'string' && b.baseNueva) {
    _csgEdBaseNueva = b.baseNueva;
    _csgEdBaseNuevaQue = String(b.baseNuevaQue || '');
  }
  switchView('view-consigna-editor');
  csgEdPintar();
  csgEdFocoInicial('');
  return _csgEdPieza;
}

/* ══════════════════════════════════════════════════════════════════
   ABRIR EL COMPOSITOR
   ══════════════════════════════════════════════════════════════════ */

/* Abre el compositor con una pieza de la lista (corregir), una nueva sin
   guardar (de csgNuevaPieza, de lo pegado o de un duplicado) o null con
   opts.clase (el molde recomendado de esa clase). opts: { clase, avisos
   (del lector), foco (id de bloque) }. Devuelve la copia de trabajo. */
function csgAbrirCompositor(pieza, opts) {
  const op = (opts && typeof opts === 'object') ? opts : {};
  let entrada = (pieza && typeof pieza === 'object') ? pieza : null;
  if (!entrada) {
    const c = csgClaseDe(op.clase || 'prompt');
    entrada = csgNuevaPieza(c.id, c.molde);
  }

  /* La MISMA pieza, abierta y con cambios sin guardar (se salió por la
     barra de abajo sin «‹», y ahora se vuelve por ✎ o por «✎ Corregir»
     de Usar): se sigue con la copia de trabajo. Rehacerla desde la lista
     tiraría lo escrito. */
  if (_csgEdPieza && entrada.id && _csgEdPieza.id === entrada.id && csgEdSucio()) {
    if (Array.isArray(op.avisos) && op.avisos.length) _csgEdAvisos = op.avisos.slice();
    _csgEdModo = 'bloques';
    switchView('view-consigna-editor');
    csgEdPintar();
    csgEdFocoInicial(op.foco || '');
    return _csgEdPieza;
  }

  /* OTRA pieza con algo sin guardar: se guarda antes, en silencio y
     diciéndolo. Hay un solo borrador, y la primera tecla de la pieza
     nueva lo pisaría. */
  if (_csgEdPieza && _csgEdPieza.id !== entrada.id && csgEdHayQueGuardar()) {
    csgEdGuardar('callado');
  }

  /* Y un borrador de OTRA pieza que se quedó a medias de otra vez (la
     aplicación se cerró con el compositor abierto): por lo mismo, al
     anaquel antes de empezar esta, y se dice.
     ⚠️ TAMBIÉN SI ES EL DE LA PIEZA QUE SE ESTÁ DEJANDO. Se saltaba
     cuando la copia en memoria era de esa misma pieza, dando por hecho que
     el bloque de arriba ya la había guardado; pero arriba solo se guarda
     la copia SUCIA, y con la franja «Tenías cambios sin guardar» puesta y
     sin elegir, la copia está limpia y lo de antes vive solo en el
     borrador: la primera tecla de la pieza nueva lo pisaba, sin aviso. */
  const suelto = csgBorradorLee();
  if (suelto && !suelto.guardada && suelto.pieza.id !== entrada.id) {
    if (csgEdAlgoEscritoDe(suelto.pieza, suelto.material, suelto.tituloMano)) csgBorradorRescata(suelto);
    else csgBorradorBorra(suelto.pieza.id);
    if (_csgEdPieza && _csgEdPieza.id === suelto.pieza.id) _csgEdRecuperar = null;
  }

  const pistas = _csgEdPistas.get(entrada) || {};
  const copia = csgEdClonar(entrada);
  const enLista = csgDe(copia.id);
  let nueva = !enLista;
  const deRetirada = !!(enLista && enLista.eliminado);
  if (deRetirada) { copia.id = csgNuevoId(); nueva = true; }

  let material = String(copia.material || '');
  let recuperar = null;
  const b = csgBorradorLee();
  if (b && b.pieza.id === copia.id) {
    if (b.guardada) {
      if (!material && csgLargoTexto(b.material) > CSG_TOPES.material) material = b.material;
    } else if (csgEdHuella(b.pieza, b.material) !== csgEdHuella(copia, material)) {
      recuperar = b;
    }
  }

  csgEdEmpezar(copia, {
    nueva,
    material,
    recuperar,
    avisos: op.avisos,
    tituloMano: !!String(copia.titulo || '').trim(),
    autoNombre: pistas.autoNombre || '',
  });
  /* Lo recién pegado o duplicado ya trae texto: el título se propone al
     abrir, no a la primera tecla. En una pieza de la lista no: cambiarle
     el título sin que nadie lo toque la haría «cambiada» y «‹» la
     guardaría. */
  if (nueva) {
    if (!_csgEdAuto.tituloMano) csgEdProponerTitulo();
    else if (!csgEdTexto('nombre').trim()) csgEdProponerNombre();
  }
  /* Un duplicado (§6.9: «una pieza nueva SIN guardar») y la copia de una
     pieza retirada tienen original: su huella de ahora, con el título ya
     propuesto, es lo que hay que cambiar para que ‹ la guarde. */
  const duplicado = !!(pistas.duplicadoDe && csgDe(pistas.duplicadoDe));
  if (nueva && (duplicado || deRetirada)) {
    _csgEdBaseNueva = csgEdHuella(_csgEdPieza, _csgEdMaterial);
    _csgEdBaseNuevaQue = duplicado ? 'duplicado' : 'retirada';
  }
  switchView('view-consigna-editor');
  csgEdPintar();
  csgEdFocoInicial(op.foco || '');
  return _csgEdPieza;
}

function csgEdEmpezar(copia, cfg) {
  csgEdEngancha();
  clearTimeout(_csgEdBorradorT);
  clearTimeout(_csgEdPreviaT);
  _csgEdPieza = copia;
  _csgEdNueva = !!cfg.nueva;
  _csgEdMaterial = String(cfg.material || '');
  copia.material = _csgEdMaterial;
  _csgEdBase = _csgEdNueva ? '' : csgEdHuella(copia, _csgEdMaterial);
  _csgEdModo = 'bloques';
  _csgEdTab = '';
  _csgEdAbiertos = new Set();
  _csgEdAvisos = Array.isArray(cfg.avisos) ? cfg.avisos.slice() : [];
  _csgEdAvisosAbiertos = true;
  _csgEdRecuperar = cfg.recuperar || null;
  _csgEdAuto = { tituloMano: !!cfg.tituloMano, nombre: String(cfg.autoNombre || '') };
  _csgEdIgual = '';
  _csgEdCual = null;
  _csgEdScroll = 0;
  _csgEdGuardado = _csgEdNueva ? '' : 'si';
  _csgEdBaseNueva = '';
  _csgEdBaseNuevaQue = '';
  if (cfg.orig !== undefined) _csgEdOrig = cfg.orig;
  else {
    const enL = _csgEdNueva ? null : csgDe(copia.id);
    _csgEdOrig = enL ? csgEdFoto(enL, enL.material) : null;
  }
  _csgEdPara = false;
  if (!_csgEdNueva) {
    try { _csgEdPara = csgRevisar(copia, copia.maquina).para.length > 0; } catch (e) { _csgEdPara = false; }
  }
}

/* El foco al abrir: el bloque pedido, o el primer obligatorio vacío. Si
   no falta ninguno (se abre para corregir algo terminado), no se enfoca
   nada: sacar el teclado encima de una pieza que se viene a leer tapa la
   mitad de lo que se quería ver. */
function csgEdFocoInicial(foco) {
  const id = foco || csgEdPrimerVacio();
  if (id) csgEdEnfocar(id);
}

function csgEdPrimerVacio() {
  const p = _csgEdPieza;
  const molde = csgEdMolde(p);
  if (!p || !molde) return '';
  /* En Libre, «Texto» está si CUALQUIER bloque dice algo (es lo que mira
     el repaso): lo pegado con sus propios encabezados entra como libres. */
  if (molde.id === 'libre' && (p.bloques || []).some(b => b && String(b.t || '').trim())) return '';
  const e = molde.bloques.find(x => x.ob && !csgEdTexto(x.id).trim());
  return e ? e.id : '';
}

/* ══════════════════════════════════════════════════════════════════
   PINTAR
   ══════════════════════════════════════════════════════════════════ */

function csgEdScrollEl() {
  return document.querySelector('#view-consigna-editor .view-scroll');
}

/* Repinta el cuerpo entero. Solo para cambios de forma: escribir no
   pasa por aquí. Conserva el desplazamiento, porque vaciar el cuerpo
   lo recorta a cero y la persona se encontraría arriba del todo después
   de quitar un bloque del fondo. */
function csgEdPintar() {
  const root = document.getElementById('csg-ed');
  if (!root || !_csgEdPieza) return;
  const sc = csgEdScrollEl();
  const y = sc ? sc.scrollTop : 0;
  root.textContent = '';
  _csgEdTa = Object.create(null);
  _csgEdCartas = Object.create(null);
  _csgEdFilaEl = null;
  _csgEdVarsEl = null;
  _csgEdContEl = null;
  if (_csgEdModo === 'previa') csgEdPintarPrevia(root);
  else csgEdPintarBloques(root);
  if (sc) sc.scrollTop = y;
  csgEdPintarBarra();
  csgEdPintarCabecera();
}

function csgEdPintarBarra() {
  const b = document.getElementById('csg-ed-ver');
  if (!b) return;
  const ic = b.querySelector('.csg-bb-ic');
  const t = b.querySelector('.csg-bb-t');
  const previa = _csgEdModo === 'previa';
  if (ic) ic.textContent = previa ? '✎' : '👁';
  if (t) t.textContent = previa ? 'Bloques' : 'Vista previa';
  b.setAttribute('aria-pressed', previa ? 'true' : 'false');
}

function csgEdPintarCabecera() {
  const inp = document.getElementById('csg-ed-titulo');
  if (inp && _csgEdPieza && inp.value !== String(_csgEdPieza.titulo || '')) inp.value = String(_csgEdPieza.titulo || '');
  csgEdPintarEstado();
}

/* Una palabra, a la derecha del título: lo que haría falta saber antes
   de salir. «Sin guardar» manda sobre todo; después, lo que impide usar
   lo guardado; después, que no llegó a la nube. */
function csgEdPintarEstado() {
  const el = document.getElementById('csg-ed-estado');
  if (!el) return;
  let t = '';
  if (csgEdSucio()) t = 'Sin guardar';
  else if (_csgEdGuardado === 'si') {
    if (_csgEdPara) t = '🟡 Borrador';
    else if (csgEdEstadoNube() === 'local') t = '📴 Solo aquí';
    else t = 'Guardado ✓';
  }
  el.textContent = t;
}

/* ⚠️ SI LLEGÓ A LA NUBE SE LEE DE LA PIEZA, NO DE UNA PALABRA GUARDADA.
   La palabra se fijaba una vez, al volver la subida: guardado mientras la
   primera bajada todavía miraba, la subida rebotaba («aún no se sabe si
   hay tabla»), se quedaba en «📴 Solo aquí», y cuando la bajada terminaba
   y subía la pieza nadie la repintaba. 'espera' mientras hay algo en
   camino (el respiro de csgSubirLuego o la carga), 'ok' si subió, y
   'local' solo cuando no subió y no hay nada que lo vaya a intentar. */
function csgEdEstadoNube() {
  const p = _csgEdPieza;
  const obj = p && csgDe(p.id);
  if (!obj) return 'local';
  if (obj.subida === true) return 'ok';
  if (_csgLuego[obj.id] || _csgInitEnCurso) return 'espera';
  if (!obj.motivo) return 'espera';
  return 'local';
}

/* ── Los bloques ───────────────────────────────────────────────────── */

function csgEdPintarBloques(root) {
  const p = _csgEdPieza;
  if (_csgEdRecuperar) root.appendChild(csgEdFranjaRecuperar());
  if (_csgEdAvisos.length) root.appendChild(csgEdAvisosLector());
  root.appendChild(csgEdFila());

  const molde = csgEdMolde(p);
  const ids = molde ? molde.bloques.map(e => e.id) : [];
  ids.forEach(id => {
    const def = csgBloqueDef(molde.id, id);
    const t = csgEdTexto(id);
    /* Obligatorio abierto; opcional plegado a un renglón, salvo que
       tenga texto (plegarlo lo escondería) o que se haya abierto ya. */
    const abierto = def.ob || !!t.trim() || _csgEdAbiertos.has(id);
    root.appendChild(abierto ? csgEdTarjeta(def, csgEdBloque(id), false) : csgEdPlegado(def));
  });

  const vistos = Object.create(null);
  (p.bloques || []).forEach(b => {
    if (!b || !b.id || ids.indexOf(b.id) >= 0 || vistos[b.id]) return;
    vistos[b.id] = true;
    const def = csgBloqueDef(molde ? molde.id : null, b.id);
    def.rotulo = String(b.rotulo || '').trim() || String(def.rotulo || b.id);
    def.ob = false;
    root.appendChild(csgEdTarjeta(def, b, true));
  });

  csgEdPie(root);
  /* Crecer después de colgar: antes de estar en el documento un
     <textarea> mide cero y se quedaría en su alto mínimo. */
  Object.keys(_csgEdTa).forEach(k => csgCrecer(_csgEdTa[k]));
}

/* «tenías cambios sin guardar · Seguir · Descartar». Arriba del todo,
   porque es lo primero que hay que decidir: escribir antes de decidir
   dejaría dos versiones de lo mismo. */
function csgEdFranjaRecuperar() {
  const b = _csgEdRecuperar;
  const el = csgEl('div', 'csg-ed-recuperar');
  el.appendChild(csgEl('span', '', 'Tenías cambios sin guardar en esta consigna' + (b && b.t ? ' (' + csgHace(b.t) + ')' : '') + '.'));
  el.appendChild(csgBtn('csg-btn-lleno csg-btn-sm', '', 'Seguir', () => {
    const r = _csgEdRecuperar;
    _csgEdRecuperar = null;
    if (!r) return;
    const id = _csgEdPieza.id;
    _csgEdPieza = csgEdClonar(r.pieza);
    _csgEdPieza.id = id;
    /* Contra lo que había CUANDO se escribió aquello: si otro aparato la
       corrigió desde entonces, guardar lo dirá y no lo pisará sin rastro. */
    const o = csgEdFotoValida(r.orig);
    if (o) _csgEdOrig = o;
    _csgEdMaterial = String(r.material || '');
    _csgEdPieza.material = _csgEdMaterial;
    _csgEdAuto = { tituloMano: r.tituloMano !== undefined ? !!r.tituloMano : !!String(_csgEdPieza.titulo || '').trim(), nombre: String(r.autoNombre || '') };
    csgEdPintar();
    csgEdTocado();
  }));
  el.appendChild(csgEdDosToques('Descartar', 'Sí, descartar', () => {
    const r = _csgEdRecuperar;
    _csgEdRecuperar = null;
    if (r) csgBorradorBorra(r.pieza.id);
    el.remove();
    csgAviso('Descartados los cambios que no se guardaron');
  }));
  return el;
}

/* ⚠️ ESCRIBIR CON LA FRANJA PUESTA NO PISA LO DE ANTES. La primera tecla
   escribía el borrador de ahora encima del que se estaba ofreciendo (lo
   de antes quedaba solo en memoria: cerrar la aplicación lo perdía), y
   después «Seguir» tiraba lo recién escrito de UN toque. Ahora, al primer
   cambio, lo de antes se guarda aparte como otra consigna y se dice: las
   dos versiones siguen, y la persona decide con calma cuál se queda. */
function csgEdApartarRecuperar() {
  const r = _csgEdRecuperar;
  _csgEdRecuperar = null;
  if (typeof document !== 'undefined' && document.querySelectorAll) {
    document.querySelectorAll('#csg-ed .csg-ed-recuperar').forEach(x => x.remove());
  }
  if (!r || !r.pieza) return null;
  const copia = csgEdClonar(r.pieza);
  copia.id = csgNuevoId();
  const base = String(copia.titulo || '').replace(/\s+/g, ' ').trim() || csgEdNombreDeForma(copia);
  copia.titulo = csgCorta(base + ' (lo que no se guardó)', CSG_TOPES.titulo);
  const obj = csgEdVolcar(copia, r.material, null).obj;
  csgAviso('💾 Lo que tenías sin guardar' + (r.t ? ' ' + csgHace(r.t) : '') + ' se guardó aparte: «' + obj.titulo + '»');
  return obj;
}

/* Lo que el lector nombró al repartir lo pegado (regla 8: lo que no se
   entiende se NOMBRA con su renglón). Arriba y plegable: es lo que
   explica por qué un renglón está donde está. */
function csgEdAvisosLector() {
  const d = document.createElement('details');
  d.className = 'csg-ed-avisos';
  d.open = _csgEdAvisosAbiertos;
  const n = _csgEdAvisos.length;
  d.appendChild(csgEl('summary', '', '📋 Al repartir lo pegado: ' + n + (n === 1 ? ' cosa que mirar' : ' cosas que mirar')));
  _csgEdAvisos.forEach(a => {
    const t = (a && typeof a === 'object') ? String(a.texto || '') : String(a || '');
    if (t) d.appendChild(csgEl('div', 'csg-rep-item csg-aviso-avisa', t));
  });
  d.addEventListener('toggle', () => { _csgEdAvisosAbiertos = d.open; });
  return d;
}

/* La primera fila: molde, máquina y estantes. Se desliza a lo ancho (una
   fila, no tres renglones de chips que empujen el primer bloque fuera
   de la pantalla: la regla de las materias de Videos M.E.T.A.S). */
function csgEdFila() {
  const p = _csgEdPieza;
  const molde = csgEdMolde(p);
  const fila = csgEl('div', 'csg-ed-fila csg-desliza');

  const chMolde = csgEl('button', 'csg-chip csg-ed-molde', 'Molde: ' + (molde ? molde.nombre : 'sin molde') + ' ▾');
  chMolde.type = 'button';
  chMolde.addEventListener('click', csgEdHojaMolde);
  fila.appendChild(chMolde);
  /* Una raya entre molde, máquinas y estantes: en una fila de chips
     iguales, las tres cosas se leían como una sola lista. */
  const raya = () => { const s = csgEl('span', 'csg-barra-sep'); s.setAttribute('aria-hidden', 'true'); fila.appendChild(s); };
  raya();

  CSG_MAQUINAS.forEach(m => {
    const on = String(p.maquina || '') === m.id;
    const ch = csgEl('button', 'csg-chip' + (on ? ' on' : ''), m.nombre);
    ch.type = 'button';
    ch.setAttribute('aria-pressed', on ? 'true' : 'false');
    ch.addEventListener('click', () => csgEdPonerMaquina(m.id));
    fila.appendChild(ch);
  });
  raya();

  (p.estantes || []).forEach(e => {
    const ch = csgEl('button', 'csg-chip on ' + csgTono(csgClave(e)), e + ' ✕');
    ch.type = 'button';
    ch.setAttribute('aria-pressed', 'true');
    ch.addEventListener('click', () => csgEdQuitarEstante(e));
    fila.appendChild(ch);
  });
  const lleno = (p.estantes || []).length >= CSG_TOPES.estantes_n;
  const mas = csgEl('button', 'csg-chip' + (lleno ? '' : ' csg-chip-mas'), lleno ? 'Tope: ' + CSG_TOPES.estantes_n + ' estantes' : '＋ estante');
  mas.type = 'button';
  mas.addEventListener('click', csgEdHojaEstante);
  fila.appendChild(mas);

  _csgEdFilaEl = fila;
  return fila;
}

function csgEdPintarFila() {
  if (!_csgEdFilaEl || !_csgEdFilaEl.parentNode) return;
  const vieja = _csgEdFilaEl;
  const x = vieja.scrollLeft;
  const nueva = csgEdFila();
  vieja.replaceWith(nueva);
  nueva.scrollLeft = x;
}

/* El renglón «○ Rol · ＋» de un opcional plegado. Un toque lo abre y
   pone el teclado en él, en el mismo toque. */
function csgEdPlegado(def) {
  const bt = csgEl('button', 'csg-bloque csg-bloque-op csg-bloque-plegado');
  bt.type = 'button';
  const cab = csgEl('span', 'csg-bloque-cab');
  cab.appendChild(csgEl('span', 'csg-punto', '○'));
  cab.appendChild(csgEl('span', '', String(def.rotulo || def.id)));
  cab.appendChild(csgEl('span', '', ' · ＋'));
  bt.appendChild(cab);
  bt.addEventListener('click', () => {
    csgEdAbrirBloque(def.id);
    csgEdEnfocar(def.id);
  });
  _csgEdCartas[def.id] = bt;
  return bt;
}

/* La tarjeta de un bloque abierto: rótulo con su punto, el «para qué»,
   el recuadro que crece, «📄 usar el ejemplo» mientras está vacío, y la
   fila de frases hechas. */
function csgEdTarjeta(def, b, libre) {
  const id = def.id;
  const traido = !!(libre && b && b.traido);
  const card = csgEl('div', 'csg-bloque ' + (def.ob ? 'csg-bloque-ob' : 'csg-bloque-op') +
    (libre ? ' csg-bloque-libre' : '') + (traido ? ' csg-bloque-traido' : ''));

  const cab = csgEl('div', 'csg-bloque-cab');
  cab.appendChild(csgEl('span', 'csg-punto', def.ob ? '●' : '○'));
  const rot = csgEl('span', '', String(def.rotulo || id));
  rot.id = 'csg-ed-rot-' + (++_csgEdSeq);
  cab.appendChild(rot);
  if (libre) cab.appendChild(csgEdBotonQuitarLibre(id, cab));
  card.appendChild(cab);

  if (traido) card.appendChild(csgEl('div', 'csg-nota', 'traído de «' + b.traido + '»: colócalo o quítalo'));
  if (def.para_que) {
    const pq = csgEl('div', 'csg-bloque-para', def.para_que);
    if (csgAnqPrefs().sinExplicaciones) pq.style.display = 'none';
    card.appendChild(pq);
  }

  const ta = document.createElement('textarea');
  ta.className = 'csg-bloque-ta';
  ta.rows = 2;
  if (def.ejemplo) ta.placeholder = def.ejemplo;
  ta.setAttribute('aria-labelledby', rot.id);
  if (id === 'nombre' && !libre) {
    /* El `name` de un SKILL.md es minúsculas y guiones: un corrector que
       le ponga mayúscula a la primera letra lo deja sin cargar. */
    ta.setAttribute('autocapitalize', 'none');
    ta.setAttribute('autocorrect', 'off');
    ta.spellcheck = false;
  }
  ta.value = b ? String(b.t == null ? '' : b.t) : '';
  card.appendChild(ta);
  _csgEdTa[id] = ta;

  let ej = null;
  if (def.ejemplo) {
    ej = csgEl('button', 'csg-bloque-ejemplo', '📄 usar el ejemplo');
    ej.type = 'button';
    ej.style.display = ta.value.trim() ? 'none' : '';
    ej.addEventListener('pointerdown', e => e.preventDefault());
    ej.addEventListener('mousedown', e => e.preventDefault());
    ej.addEventListener('click', () => {
      if (ta.value.trim()) return;
      csgEdEnfocarTa(ta);
      csgEdPonRango(ta, def.ejemplo, 0, ta.value.length);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
    card.appendChild(ej);
  }

  const chips = csgEdFrases(card, ta, def);
  ta.addEventListener('input', () => csgEdAlEscribir(id, ta, chips, ej));

  _csgEdCartas[id] = card;
  return card;
}

/* Quitar un bloque libre: al momento si está vacío; con texto, dos
   toques en el mismo sitio, porque lo que se quita es texto de alguien. */
function csgEdBotonQuitarLibre(id, cab) {
  const bt = csgBtn('csg-btn-neutro csg-btn-sm csg-mas', '', '✕');
  bt.setAttribute('aria-label', 'Quitar este bloque');
  bt.addEventListener('click', () => {
    if (!csgEdTexto(id).trim()) { csgEdQuitarLibre(id); return; }
    const dos = csgEl('span', 'csg-dos-toques');
    dos.appendChild(csgBtn('csg-btn-peligro csg-btn-sm', '', 'Sí, quitar', () => csgEdQuitarLibre(id)));
    dos.appendChild(csgBtn('csg-btn-neutro csg-btn-sm', '', 'No', () => dos.replaceWith(bt)));
    bt.replaceWith(dos);
  });
  return bt;
}

function csgEdQuitarLibre(id) {
  const p = _csgEdPieza;
  if (!p) return;
  p.bloques = (p.bloques || []).filter(b => !(b && b.id === id));
  csgEdPintar();
  csgEdTocado();
}

/* ── Las frases hechas (regla 7) ──────────────────────────────────── */

/* La fila de chips bajo el recuadro: «＋ Otro» en los bloques lista, las
   frases del bloque, y al final «{ } Variable». ⚠️ Todos cancelan el
   pointerdown: tocar un botón se lleva el foco, y con él el cursor y el
   teclado de la tableta, y la frase caería donde el cursor ya no está. */
function csgEdFrases(card, ta, def) {
  const fila = csgEl('div', 'csg-frases csg-desliza');
  const noRobes = el => {
    el.addEventListener('pointerdown', e => e.preventDefault());
    el.addEventListener('mousedown', e => e.preventDefault());
  };
  if (def.lista) {
    const otro = csgEl('button', 'csg-otro', '＋ Otro');
    otro.type = 'button';
    noRobes(otro);
    otro.addEventListener('click', () => csgEdOtro(ta, def));
    fila.appendChild(otro);
  }
  const chips = [];
  (Array.isArray(def.frases) ? def.frases : []).forEach(fr => {
    const frase = String(fr);
    if (!frase) return;
    const on = !!csgEdRenglonDe(ta.value, frase);
    /* La frase en su propio span, cortado a dos renglones por el CSS; en
       el `title`, entera. Es un texto NUESTRO (del vocabulario), no algo
       escrito por una persona: puede ir a un atributo (regla 15). */
    const ch = csgEl('button', 'csg-frase' + (on ? ' on' : ''));
    ch.appendChild(csgEl('span', 'csg-frase-t', frase));
    ch.title = frase;
    ch.type = 'button';
    ch.setAttribute('aria-pressed', on ? 'true' : 'false');
    noRobes(ch);
    ch.addEventListener('click', () => {
      if (!csgEdQuitarFrase(ta, frase)) csgEdMeterFrase(ta, frase);
    });
    chips.push({ ch, frase });
    fila.appendChild(ch);
  });
  const vr = csgEl('button', 'csg-frase csg-frase-var', '{ } Variable');
  vr.type = 'button';
  noRobes(vr);
  vr.addEventListener('click', () => csgEdVariable(ta));
  fila.appendChild(vr);
  card.appendChild(fila);
  return chips;
}

/* Cambia un trozo del recuadro conservando el deshacer (setRangeText),
   con un respaldo para el navegador que no lo tenga. */
function csgEdPonRango(ta, texto, a, b) {
  if (typeof ta.setRangeText === 'function') ta.setRangeText(texto, a, b, 'end');
  else {
    const v = ta.value;
    ta.value = v.slice(0, a) + texto + v.slice(b);
    try { ta.setSelectionRange(a + texto.length, a + texto.length); } catch (e) {}
  }
}

/* La frase entra donde está el cursor, EN SU PROPIO RENGLÓN: detrás del
   renglón en que está el cursor, o dentro de él si está vacío. Partir un
   renglón por la mitad para meterla rompería una frase de la persona, y
   eso es reescribir (regla 7). Sin foco, el cursor es el último que tuvo
   el recuadro, que al pintarlo es el final. */
function csgEdMeterFrase(ta, frase) {
  const v = ta.value;
  let pos = typeof ta.selectionEnd === 'number' ? ta.selectionEnd : v.length;
  if (pos > v.length) pos = v.length;
  const ini = v.lastIndexOf('\n', pos - 1) + 1;
  let fin = v.indexOf('\n', pos);
  if (fin < 0) fin = v.length;
  let a, b, texto;
  if (!v.slice(ini, fin).trim()) { a = ini; b = fin; texto = frase; }
  else { a = fin; b = fin; texto = '\n' + frase; }
  csgEdPonRango(ta, texto, a, b);
  const c = a + texto.length;
  try { ta.setSelectionRange(c, c); } catch (e) {}
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

/* ¿Dónde está la frase PUESTA? En un renglón que es ella y nada más
   (con su viñeta o su número delante, si los lleva). Un renglón en que la
   frase sigue pero la persona escribió algo más delante o detrás ya es
   suyo: la frase está EDITADA, el chip se desmarca y un toque no le quita
   nada (regla 7). Buscando la frase como un trozo cualquiera, añadirle un
   «!» al final dejaba el chip marcado, y el toque siguiente le arrancaba
   la frase a su renglón dejando el «!» solo. Devuelve el renglón entero
   [a, b) o null. */
function csgEdRenglonDe(v, frase) {
  if (!frase) return null;
  let desde = 0;
  while (true) {
    const i = v.indexOf(frase, desde);
    if (i < 0) return null;
    const ini = v.lastIndexOf('\n', i - 1) + 1;
    let fin = v.indexOf('\n', i + frase.length);
    if (fin < 0) fin = v.length;
    if (/^\s*(?:[-•*]\s+|\d+[.)]\s+)?$/.test(v.slice(ini, i)) && !v.slice(i + frase.length, fin).trim()) return [ini, fin];
    desde = i + 1;
  }
}

/* Quita EXACTAMENTE esa frase, con su renglón entero (y su viñeta, si la
   llevaba): quitar solo las palabras dejaría un «- » huérfano o un
   renglón en blanco en mitad de una lista. */
function csgEdQuitarFrase(ta, frase) {
  const v = ta.value;
  const r = csgEdRenglonDe(v, frase);
  if (!r) return false;
  let a = r[0], b = r[1];
  if (b < v.length) b++;
  else if (a > 0) a--;
  csgEdPonRango(ta, '', a, b);
  try { ta.setSelectionRange(a, a); } catch (e) {}
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

/* «{ } Variable»: mete {{}} con el cursor dentro, y enfoca, porque lo
   siguiente es escribir el nombre. */
function csgEdVariable(ta) {
  const enfocado = document.activeElement === ta;
  const pos = enfocado && typeof ta.selectionEnd === 'number' ? ta.selectionEnd : ta.value.length;
  csgEdEnfocarTa(ta);
  csgEdPonRango(ta, '{{}}', pos, pos);
  try { ta.setSelectionRange(pos + 2, pos + 2); } catch (e) {}
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

/* «＋ Otro»: la plantilla del bloque en un renglón nuevo al final; la de
   Pasos con el número siguiente. Si la plantilla trae un {{hueco}}, queda
   seleccionado: lo primero que se escriba lo reemplaza, y no hay que
   borrarlo a mano letra por letra en una tableta. */
function csgEdOtro(ta, def) {
  let pl = String(def.plantilla == null ? '' : def.plantilla);
  const v = ta.value;
  if (/^n\. /.test(pl)) {
    let max = 0, n = 0;
    v.split('\n').forEach(r => {
      const m = r.match(/^\s*(\d+)[.)]\s/);
      if (m) max = Math.max(max, Number(m[1]));
      if (r.trim()) n++;
    });
    pl = String(max ? max + 1 : n + 1) + pl.slice(1);
  }
  csgEdEnfocarTa(ta);
  const pre = v && !v.endsWith('\n') ? '\n' : '';
  const ins = pre + pl;
  if (!ins) { try { ta.setSelectionRange(v.length, v.length); } catch (e) {} return; }
  const a = v.length;
  csgEdPonRango(ta, ins, a, a);
  const m = pl.match(/\{\{[^{}]*\}\}/);
  try {
    if (m) { const s = a + pre.length + m.index; ta.setSelectionRange(s, s + m[0].length); }
    else ta.setSelectionRange(a + ins.length, a + ins.length);
  } catch (e) {}
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

/* ── Escribir ──────────────────────────────────────────────────────── */

function csgEdAlEscribir(id, ta, chips, ej) {
  csgEdPonTexto(id, ta.value);
  csgCrecer(ta);
  (chips || []).forEach(x => {
    const on = !!csgEdRenglonDe(ta.value, x.frase);
    x.ch.classList.toggle('on', on);
    x.ch.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  if (ej) ej.style.display = ta.value.trim() ? 'none' : '';
  /* El `name` escrito a mano ya no es el propuesto: el título no lo
     vuelve a pisar. */
  if (id === 'nombre' && ta.value !== _csgEdAuto.nombre) _csgEdAuto.nombre = '';
  if (!_csgEdAuto.tituloMano) csgEdProponerTitulo();
  csgEdTocado();
}

/* Lo que pasa en cada cambio, sea cual sea: la palabra del estado, la
   línea de variables y el contador, y el borrador con su respiro. */
function csgEdTocado() {
  if (_csgEdRecuperar && csgEdSucio()) csgEdApartarRecuperar();
  csgEdPintarEstado();
  csgEdPintarVars();
  csgEdPintarContador();
  csgBorradorProgramar();
}

/* El título propuesto se escribe EN el campo mientras nadie lo toque a
   mano (_csgEdAuto): así se ve qué nombre va a llevar la ficha antes de
   guardar, y se corrige ahí mismo. */
function csgEdProponerTitulo() {
  const p = _csgEdPieza;
  if (!p || _csgEdAuto.tituloMano) return;
  const t = csgEdTituloPropuesto(p);
  if (t === String(p.titulo || '')) return;
  p.titulo = t;
  const inp = document.getElementById('csg-ed-titulo');
  if (inp && inp.value !== t) inp.value = t;
}

/* El `name` de un SKILL.md se propone desde el título (csgSlug) mientras
   siga vacío o siga siendo lo que propuso la herramienta: lo escrito a
   mano no se pisa. */
function csgEdProponerNombre() {
  const p = _csgEdPieza;
  const molde = csgEdMolde(p);
  if (!p || !molde || !molde.bloques.some(e => e.id === 'nombre')) return;
  const actual = csgEdTexto('nombre');
  if (actual && actual !== _csgEdAuto.nombre) return;
  const s = csgSlug(csgEdTituloSinMolde(p.titulo));
  if (s === actual) return;
  csgEdPonTexto('nombre', s);
  _csgEdAuto.nombre = s;
  const ta = _csgEdTa.nombre;
  if (ta && ta.value !== s) {
    ta.value = s;
    csgCrecer(ta);
    const card = _csgEdCartas.nombre;
    const ej = card && card.querySelector('.csg-bloque-ejemplo');
    if (ej) ej.style.display = s.trim() ? 'none' : '';
  }
}

function csgEdAlTitulo() {
  const inp = document.getElementById('csg-ed-titulo');
  const p = _csgEdPieza;
  if (!inp || !p) return;
  p.titulo = inp.value;
  /* Vaciado a mano, vuelve a ser la herramienta quien lo propone (a la
     siguiente tecla de un bloque, no ahora: si se rellenara en el acto,
     no se podría borrar). */
  _csgEdAuto.tituloMano = inp.value.trim() !== '';
  if (_csgEdAuto.tituloMano) csgEdProponerNombre();
  csgEdTocado();
  /* En la vista previa, {{titulo}} sale rellenado: se re-arma con un
     respiro, no en cada tecla. */
  if (_csgEdModo === 'previa') {
    clearTimeout(_csgEdPreviaT);
    _csgEdPreviaT = setTimeout(() => { if (_csgEdModo === 'previa') csgEdPintar(); }, 300);
  }
}

/* ── Abrir un bloque y poner el foco ───────────────────────────────── */

function csgEdAbrirBloque(id) {
  const viejo = _csgEdCartas[id];
  if (!viejo || _csgEdTa[id] || !_csgEdPieza) return;
  _csgEdAbiertos.add(id);
  const molde = csgEdMolde(_csgEdPieza);
  const def = csgBloqueDef(molde ? molde.id : null, id);
  const nueva = csgEdTarjeta(def, csgEdBloque(id), false);
  viejo.replaceWith(nueva);
  csgCrecer(_csgEdTa[id]);
}

function csgEdEnfocarTa(ta) {
  if (!ta) return;
  if (document.activeElement === ta) return;
  try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); }
}

/* Enfoca un bloque (abriéndolo si estaba plegado), con el cursor al
   final, y lo trae al CENTRO: con el teclado de la tableta arriba, un
   recuadro enfocado al pie de la pantalla queda debajo del teclado.
   ⚠️ SALVO QUE EL RECUADRO SEA MÁS ALTO QUE EL HUECO: centrado, un bloque
   de veinte aristas dejaba arriba y abajo lo que no cabe, y el cursor
   —que va al FINAL— se quedaba debajo de la barra fija justo cuando el
   repaso decía «✎ Ir a…». Alto, se alinea por abajo, que respeta el
   scroll-padding-bottom de la vista: lo que queda a la vista es el
   cursor, que es donde se va a escribir. */
function csgEdEnfocar(id) {
  if (!id) return false;
  if (!_csgEdTa[id]) csgEdAbrirBloque(id);
  const ta = _csgEdTa[id];
  if (!ta) return false;
  csgEdEnfocarTa(ta);
  const n = ta.value.length;
  try { ta.setSelectionRange(n, n); } catch (e) {}
  let hueco = Infinity;
  try {
    const sc = csgEdScrollEl();
    if (sc && sc.clientHeight) hueco = sc.clientHeight - (parseFloat(getComputedStyle(sc).scrollPaddingBottom) || 0);
  } catch (e) { hueco = Infinity; }
  try { ta.scrollIntoView({ block: ta.offsetHeight > hueco * 0.8 ? 'end' : 'center' }); } catch (e) {}
  return true;
}

/* ── El pie: variables, contador, material e interruptor ──────────── */

function csgEdPie(root) {
  const vars = csgEl('div', 'csg-ed-vars');
  _csgEdVarsEl = vars;
  root.appendChild(vars);
  csgEdPintarVars();

  const cont = csgEl('div', 'csg-ed-contador');
  _csgEdContEl = cont;
  root.appendChild(cont);
  csgEdPintarContador();

  root.appendChild(csgEdMaterialCaja());

  const prefs = csgAnqPrefs();
  const sw = csgEl('button', 'csg-switch');
  sw.type = 'button';
  sw.setAttribute('role', 'switch');
  sw.setAttribute('aria-checked', prefs.sinExplicaciones ? 'true' : 'false');
  sw.appendChild(csgEl('span', '', 'Sin explicaciones (este aparato)'));
  sw.appendChild(csgEl('span', 'csg-switch-bola'));
  sw.addEventListener('click', () => {
    const pr = csgAnqPrefs();
    pr.sinExplicaciones = !pr.sinExplicaciones;
    csgAnqGuardaPrefs();
    sw.setAttribute('aria-checked', pr.sinExplicaciones ? 'true' : 'false');
    /* Se tocan los nodos que ya están, sin repintar: el interruptor está
       al pie, y repintar dejaría a la persona arriba del todo. */
    document.querySelectorAll('#csg-ed .csg-bloque-para').forEach(el => { el.style.display = pr.sinExplicaciones ? 'none' : ''; });
  });
  root.appendChild(sw);
}

/* «Variables: {{tema}} · {{n}}». Sin las reservadas ({{maquina}},
   {{titulo}}, {{hoy}}): se rellenan solas y nunca se preguntan, y
   nombrarlas aquí haría creer que al usar habrá que escribirlas. */
function csgEdPintarVars() {
  const el = _csgEdVarsEl;
  if (!el || !_csgEdPieza) return;
  /* Las MISMAS que va a preguntar la hoja de Usar: sin lo que va dentro
     de un bloque de código (ahí las llaves son una plantilla que se copia
     tal cual, y el repaso ya las trata así). Si esta línea nombrara un
     {{x}} que Usar no pregunta, uno buscaría el renglón que no sale. */
  const sinCodigo = typeof csgUsarSinCodigo === 'function' ? csgUsarSinCodigo : (t => t);
  const vs = csgVariables((_csgEdPieza.bloques || []).map(b => sinCodigo(String((b && b.t) || ''))))
    .filter(v => CSG_RESERVADAS.indexOf(v) < 0);
  el.textContent = '';
  if (!vs.length) { el.textContent = 'Sin variables'; return; }
  el.appendChild(document.createTextNode('Variables: '));
  vs.forEach((v, i) => {
    if (i) el.appendChild(document.createTextNode(' · '));
    el.appendChild(csgEl('span', 'csg-var', '{{' + v + '}}'));
  });
}

/* El contador solo aparece cuando hace falta (más de 50.000): un número
   que se ve siempre se deja de mirar, y el día que importa ya no se lee.
   Se mide como mide la base (csgLargoBase), que es lo que decide si cabe. */
function csgEdPintarContador() {
  const el = _csgEdContEl;
  if (!el || !_csgEdPieza) return;
  const bs = _csgEdPieza.bloques || [];
  let bruto = 0;
  bs.forEach(b => { bruto += String((b && b.t) || '').length; });
  const n = bruto > 45000 ? csgLargoBase(csgEdBloquesParaGuardar(_csgEdPieza)) : 0;
  if (n > 50000) {
    el.style.display = '';
    el.textContent = csgMiles(n) + ' de ' + csgMiles(CSG_TOPES.bloques) + ' caracteres' +
      (n > CSG_TOPES.bloques ? ': no cabe en la nube, ' + csgTextoRecorta(n - CSG_TOPES.bloques) : '');
  } else {
    el.style.display = 'none';
    el.textContent = '';
  }
}

/* 📎 Material: siempre el último y plegado. SIN maxlength: un recuadro
   con tope corta lo pegado sin avisar, y lo que se pierde es el final
   del informe. Lo que pasa de 20.000 no se recorta ni se guarda con la
   pieza: se queda en el borrador y en la hoja de Usar, y se DICE. */
function csgEdMaterialCaja() {
  const det = document.createElement('details');
  det.className = 'csg-material';
  const sum = csgEl('summary', '', '📎 Material');
  det.appendChild(sum);
  const ta = document.createElement('textarea');
  ta.className = 'csg-material-ta';
  ta.rows = 6;
  ta.placeholder = 'Lo que va DEBAJO de la consigna: el texto a corregir, el informe, la lista. Sale entre marcas y no se repasa.';
  ta.value = _csgEdMaterial;
  det.appendChild(ta);
  const nota = csgEl('div', 'csg-material-nota');
  det.appendChild(nota);
  const pinta = () => {
    const n = csgLargoTexto(_csgEdMaterial);
    sum.textContent = '📎 Material' + (n ? ' · ' + csgMiles(n) + (n === 1 ? ' carácter' : ' caracteres') : '');
    nota.textContent = n > CSG_TOPES.material
      ? '📎 material de ' + csgMiles(n) + ' caracteres: no se guarda con la pieza; pégalo al usar.'
      : 'Se guarda con la pieza hasta ' + csgMiles(CSG_TOPES.material) + ' caracteres.';
  };
  pinta();
  ta.addEventListener('input', () => {
    _csgEdMaterial = ta.value;
    if (_csgEdPieza) _csgEdPieza.material = ta.value;
    pinta();
    csgEdTocado();
  });
  return det;
}

/* ══════════════════════════════════════════════════════════════════
   MOLDE, MÁQUINA Y ESTANTES
   ══════════════════════════════════════════════════════════════════ */

function csgEdHojaMolde() {
  if (!_csgEdPieza) return;
  _csgEdCual = null;
  csgVerAbrir('📐 Molde', csgEdPintarHojaMolde);
}

function csgEdCuando(s) {
  s = String(s || '').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function csgEdPintarHojaMolde(cuerpo) {
  const p = _csgEdPieza;
  if (!p) return;
  const actual = csgEdMolde(p);
  /* ⚠️ La clase de la fila pasa por csgClaseDe, como en la ficha. Es un
     dato de la base y la base no lo limita a una lista (vive en el
     aparato): una fila tocada a mano con clase «constructor» indexaba
     CSG_MOLDES_ORDEN por una propiedad de Object y la hoja reventaba, y
     con «xyz» se abría vacía. Las dos veces, sin forma de volver a
     ponerle un molde desde el compositor. */
  const clase = (actual && actual.clase) || csgClaseDe(p.clase).id;
  const ids = (Object.prototype.hasOwnProperty.call(CSG_MOLDES_ORDEN, clase) ? CSG_MOLDES_ORDEN[clase] : []).filter(id => csgEdMoldeDe(id));
  const res = _csgEdCual && _csgEdCual.resultado;
  /* Cada renglón con el emoji de su clase, en su tono, como en «Duplicar
     en otro molde»: con la baldosa solo en el puesto (un ✓, repetido
     además por el ✓ del borde) y en el propuesto (👉), los demás quedaban
     sin baldosa y los nombres no empezaban a la misma altura. El puesto
     ya se ve por su fondo y su ✓. */
  const fila = id => {
    const m = CSG_MOLDES[id];
    const on = p.molde === id;
    const cm = csgClaseDe(m.clase || clase);
    const r = csgVerFila(res === id ? '👉' : cm.ic, m.nombre + (m.recomendado ? ' · recomendado' : ''), null, on, () => {
      csgVerCerrar();
      if (!on) csgEdCambiarMolde(id);
    }, csgEdCuando(m.cuando));
    r.classList.add('csg-clase-' + cm.id);
    return r;
  };
  ids.forEach(id => cuerpo.appendChild(fila(id)));
  if (res && ids.indexOf(res) < 0 && csgEdMoldeDe(res)) {
    const c = csgClaseDe(CSG_MOLDES[res].clase);
    cuerpo.appendChild(csgVerSep('De ' + (c ? c.ic + ' ' + c.nombre : 'otra clase')));
    cuerpo.appendChild(fila(res));
  }

  /* «❓ ¿Cuál elijo?» solo donde sus respuestas viven (Prompt y
     Habilidad): en un grafo o un bucle, las tres preguntas mandarían a
     otra clase de consigna por una razón que no tiene que ver. */
  if (clase !== 'prompt' && clase !== 'habilidad') return;
  cuerpo.appendChild(csgVerFila('❓', '¿Cuál elijo?', null, !!_csgEdCual, () => {
    _csgEdCual = _csgEdCual ? null : { paso: 0, dichas: [], resultado: '' };
    csgVerPintar();
  }, 'tres preguntas de sí o no'));
  if (!_csgEdCual) return;

  const caja = csgEl('div', 'csg-cual');
  _csgEdCual.dichas.forEach(d => caja.appendChild(csgEl('div', 'csg-nota', d.preg + ' — ' + (d.si ? 'Sí' : 'No'))));
  if (_csgEdCual.resultado) {
    const m = CSG_MOLDES[_csgEdCual.resultado];
    caja.appendChild(csgEl('div', 'csg-cual-preg', '👉 Te sirve «' + m.nombre + '»: está marcado arriba. Tócalo para cambiar.'));
    caja.appendChild(csgBtn('csg-btn-neutro csg-btn-sm', '↺', 'Otra vez', () => {
      _csgEdCual = { paso: 0, dichas: [], resultado: '' };
      csgVerPintar();
    }));
  } else {
    const q = CSG_ED_CUAL[_csgEdCual.paso];
    const preg = csgEl('div', 'csg-cual-preg');
    preg.appendChild(csgEl('span', '', q.preg));
    const responde = si => {
      _csgEdCual.dichas.push({ preg: q.preg, si });
      if (si) _csgEdCual.resultado = q.molde;
      else if (_csgEdCual.paso + 1 >= CSG_ED_CUAL.length) _csgEdCual.resultado = 'encargo';
      else _csgEdCual.paso++;
      csgVerPintar();
    };
    preg.appendChild(csgBtn('csg-btn-tenido csg-btn-sm', '', 'Sí', () => responde(true)));
    preg.appendChild(csgBtn('csg-btn-neutro csg-btn-sm', '', 'No', () => responde(false)));
    caja.appendChild(preg);
  }
  cuerpo.appendChild(caja);
}

/* ⚠️ CAMBIAR DE MOLDE NO MUEVE NI TIRA TEXTO. Los bloques se quedan en
   la pieza con su id: los que el molde nuevo tiene aparecen en su sitio,
   y los que no, al final como BLOQUES LIBRES, marcados y nombrados en el
   aviso. Por eso volver al molde de antes lo deja todo como estaba, sin
   que nadie tenga que colocar nada a mano. Lo único que se descarta es
   el `inicial` sin tocar del molde viejo (no lo escribió nadie), y los
   bloques nuevos que traen el suyo nacen con él. */
function csgEdCambiarMolde(id) {
  const p = _csgEdPieza;
  const nuevo = csgEdMoldeDe(id);
  if (!p || !nuevo || p.molde === id) return;
  const viejo = csgEdMolde(p);
  const ids = nuevo.bloques.map(e => e.id);
  const inicialViejo = bid => viejo ? String(csgBloqueDef(viejo.id, bid).inicial || '').trim() : '';

  p.bloques = (p.bloques || []).filter(b => {
    if (!b || !b.id) return false;
    if (ids.indexOf(b.id) >= 0) return true;
    const t = String(b.t == null ? '' : b.t).trim();
    if (!t) return false;
    const ini = inicialViejo(b.id);
    return !(ini && t === ini);
  });
  const libres = [];
  p.bloques.forEach(b => {
    if (ids.indexOf(b.id) >= 0) return;
    if (!String(b.rotulo || '').trim()) b.rotulo = String((viejo ? csgBloqueDef(viejo.id, b.id) : csgBloqueDef(null, b.id)).rotulo || b.id);
    /* Solo lo que ESTE cambio dejó sin sitio se marca como traído; un
       libre que ya estaba sigue como estaba. */
    if (viejo && viejo.bloques.some(e => e.id === b.id) && !b.traido) b.traido = viejo.nombre;
    libres.push(b);
  });
  nuevo.bloques.forEach(e => {
    const d = csgBloqueDef(nuevo.id, e.id);
    const b = p.bloques.find(x => x.id === e.id);
    if (b) {
      b.rotulo = String(d.rotulo || e.id);
      delete b.traido;
      const t = String(b.t == null ? '' : b.t).trim();
      if (d.inicial && (!t || (t === inicialViejo(e.id) && t !== String(d.inicial).trim()))) b.t = String(d.inicial);
    } else if (d.inicial) {
      p.bloques.push({ id: e.id, rotulo: String(d.rotulo || e.id), t: String(d.inicial) });
    }
  });
  /* En el orden del molde nuevo, con los libres detrás. */
  p.bloques = nuevo.bloques.map(e => p.bloques.find(x => x.id === e.id)).filter(Boolean)
    .concat(p.bloques.filter(b => ids.indexOf(b.id) < 0));
  p.molde = nuevo.id;
  p.clase = nuevo.clase;
  _csgEdTab = '';
  csgEdProponerNombre();
  if (!_csgEdAuto.tituloMano) csgEdProponerTitulo();
  csgEdPintar();
  csgEdTocado();
  csgAviso('Molde: ' + nuevo.nombre + (libres.length
    ? ' · quedan como bloques libres, al final: ' + libres.map(b => b.rotulo || b.id).join(', ')
    : ''));
}

function csgEdPonerMaquina(id) {
  const p = _csgEdPieza;
  if (!p || String(p.maquina || '') === id) return;
  p.maquina = id;
  if (_csgEdModo === 'previa') csgEdPintar();
  else csgEdPintarFila();
  csgEdTocado();
}

/* ＋ estante: la hoja vertical con los que ya existen (de un toque) y un
   campo para uno nuevo. «Maestría» y «maestria» son el MISMO estante
   (csgClave): escribir el segundo pone el primero, con su rótulo de
   siempre, y el anaquel no sale con dos montones iguales. */
function csgEdHojaEstante() {
  const p = _csgEdPieza;
  if (!p) return;
  if ((p.estantes || []).length >= CSG_TOPES.estantes_n) {
    csgAviso('Una consigna va en ' + CSG_TOPES.estantes_n + ' estantes como mucho: quita uno para poner otro.');
    return;
  }
  let campo = null, hay = 0;
  csgVerAbrir('🗂 Poner en un estante', cuerpo => {
    const todos = csgEdEstantesTodos();
    hay = todos.length;
    const puestos = new Set((p.estantes || []).map(csgClave));
    const inp = csgEl('input', 'csg-input');
    campo = inp;
    inp.type = 'text';
    inp.maxLength = CSG_TOPES.estante;
    inp.autocomplete = 'off';
    inp.placeholder = 'Uno nuevo: la materia, el curso, el proyecto…';
    inp.setAttribute('aria-label', 'Nombre del estante nuevo');
    inp.setAttribute('enterkeyhint', 'done');
    const crear = () => {
      const v = inp.value.replace(/\s+/g, ' ').trim();
      if (!v) { inp.focus(); return; }
      csgVerCerrar();
      csgEdPonerEstante(v, todos);
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); crear(); } });
    cuerpo.appendChild(inp);
    cuerpo.appendChild(csgBtn('csg-btn-lleno', '＋', 'Crear y poner', crear));
    if (todos.length) {
      cuerpo.appendChild(csgVerSep('Los que ya hay'));
      todos.forEach(e => {
        const on = puestos.has(e.clave);
        const f = csgVerFila('🗂', e.rotulo, e.n, on, () => {
          csgVerCerrar();
          if (on) csgEdQuitarEstante(e.rotulo);
          else csgEdPonerEstante(e.rotulo, todos);
        });
        f.classList.add(csgTono(e.clave));
        cuerpo.appendChild(f);
      });
    }
  });
  /* Sin estantes todavía, lo único que se puede hacer es escribir uno: el
     teclado sale ya, en el mismo toque que abrió la hoja. Se enfoca
     DESPUÉS de abrirla y no dentro del pintado: una hoja que todavía está
     escondida no recibe el foco, y el teclado no saldría. */
  if (campo && !hay) campo.focus();
}

function csgEdEstantesTodos() {
  if (typeof csgEstantesTodos === 'function') {
    try { return csgEstantesTodos() || []; } catch (e) {}
  }
  const m = new Map();
  csgVivas().forEach(x => (x.estantes || []).forEach(e => {
    const k = csgClave(e);
    if (!k) return;
    if (!m.has(k)) m.set(k, { clave: k, rotulo: String(e).trim(), n: 0 });
    m.get(k).n++;
  }));
  return Array.from(m.values()).sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'es'));
}

function csgEdPonerEstante(v, todos) {
  const p = _csgEdPieza;
  if (!p) return;
  const k = csgClave(v);
  if (!k) return;
  p.estantes = Array.isArray(p.estantes) ? p.estantes : [];
  if (p.estantes.some(e => csgClave(e) === k)) return;
  if (p.estantes.length >= CSG_TOPES.estantes_n) {
    csgAviso('Una consigna va en ' + CSG_TOPES.estantes_n + ' estantes como mucho: quita uno para poner otro.');
    return;
  }
  const ya = (todos || csgEdEstantesTodos()).find(e => e.clave === k);
  p.estantes.push(csgCorta(ya ? ya.rotulo : v, CSG_TOPES.estante));
  csgEdPintarFila();
  csgEdTocado();
}

function csgEdQuitarEstante(v) {
  const p = _csgEdPieza;
  if (!p) return;
  const k = csgClave(v);
  p.estantes = (p.estantes || []).filter(e => csgClave(e) !== k);
  csgEdPintarFila();
  csgEdTocado();
}

/* ══════════════════════════════════════════════════════════════════
   PASO 3 · LA VISTA PREVIA Y EL REPASO
   ──────────────────────────────────────────────────────────────────
   ⚠️ LO QUE SE VE ES LO QUE SE COPIA, CARÁCTER POR CARÁCTER (regla 1):
   el texto sale del mismo csgArmar que usan los botones de Usar, con el
   material del compositor, y el <pre> lleva ESE texto y nada más (las
   variables sin rellenar se pintan en ámbar troceando nodos, no
   escribiendo HTML). Y el repaso se pide a csgRevisar directamente, no
   a la caché del anaquel: la copia de trabajo lleva el mismo id y el
   mismo reloj que la pieza guardada, y la caché devolvería el repaso de
   lo guardado, no de lo que se está escribiendo.
   ══════════════════════════════════════════════════════════════════ */

function csgEdAlternarVista() {
  if (!_csgEdPieza) return;
  const sc = csgEdScrollEl();
  if (_csgEdModo === 'bloques') {
    _csgEdScroll = sc ? sc.scrollTop : 0;
    /* El teclado abajo: la vista previa se lee, no se escribe. */
    const a = document.activeElement;
    if (a && a.blur && a.closest && a.closest('#csg-ed')) a.blur();
    _csgEdModo = 'previa';
    csgEdPintar();
    if (sc) sc.scrollTop = 0;
  } else {
    _csgEdModo = 'bloques';
    csgEdPintar();
    if (sc) sc.scrollTop = _csgEdScroll;
  }
}

function csgEdPintarPrevia(root) {
  const p = _csgEdPieza;
  const maq = csgMaquina(p.maquina || (typeof csgMaquinaUltima === 'function' ? csgMaquinaUltima() : 'claude'));
  const caja = csgEl('div', 'csg-prev');

  const fila = csgEl('div', 'csg-prev-maquinas csg-desliza');
  CSG_MAQUINAS.forEach(m => {
    const on = m.id === maq.id;
    const ch = csgEl('button', 'csg-chip' + (on ? ' on' : ''), m.nombre);
    ch.type = 'button';
    ch.setAttribute('aria-pressed', on ? 'true' : 'false');
    ch.addEventListener('click', () => csgEdPonerMaquina(m.id));
    fila.appendChild(ch);
  });
  caja.appendChild(fila);
  if (maq.nota) caja.appendChild(csgEl('div', 'csg-nota', maq.nota));

  let arm = null, fallo = '';
  try { arm = csgArmar(p, maq.id, {}, { material: _csgEdMaterial }); }
  catch (e) { fallo = String((e && e.message) || e); }
  if (!arm) {
    caja.appendChild(csgEl('div', 'csg-rep-item csg-aviso-para', 'No se pudo armar esta consigna: ' + fallo));
    root.appendChild(caja);
    return;
  }

  const molde = csgEdMolde(p);
  const clase = (molde && molde.clase) || p.clase || 'prompt';
  let tabs = [];
  if (clase === 'grafo') tabs = [['mermaid', 'Mermaid'], ['plan', 'Plan'], ['principal', 'Prompt para un chat']];
  else if (clase === 'bucle') tabs = [['plan', 'Plan'], ['principal', 'Auto-bucle']];
  else if (arm.forma === 'xml' && arm.sistema) tabs = [['principal', 'Todo'], ['sistema', 'Sistema'], ['encargo', 'Encargo']];
  if (tabs.length && !tabs.some(t => t[0] === _csgEdTab)) _csgEdTab = 'principal';
  if (tabs.length) {
    const tt = csgEl('div', 'csg-prev-tabs');
    tt.setAttribute('role', 'tablist');
    tabs.forEach(t => {
      const on = t[0] === _csgEdTab;
      const b = csgEl('button', 'csg-prev-tab' + (on ? ' on' : ''), t[1]);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.addEventListener('click', () => { if (_csgEdTab !== t[0]) { _csgEdTab = t[0]; csgEdPintar(); } });
      tt.appendChild(b);
    });
    caja.appendChild(tt);
  }

  const texto = String((tabs.length ? arm[_csgEdTab] : arm.principal) || '');
  if (texto) caja.appendChild(csgEdPre(texto));
  else caja.appendChild(csgEl('div', 'csg-nota', 'Todavía no hay nada que armar: escribe algún bloque.'));

  const notaTab = {
    mermaid: 'Para verlo dibujado, pégalo en mermaid.live o en un bloque ```mermaid.',
    plan: 'Para leerlo tú: lo que hará, paso a paso.',
    sistema: 'Lo que va en las instrucciones de un Proyecto.',
    encargo: 'Lo que va en el chat.',
  }[tabs.length ? _csgEdTab : ''];
  if (notaTab) caja.appendChild(csgEl('div', 'csg-nota', notaTab));

  if (arm.forma === 'skill') {
    caja.appendChild(csgEl('div', 'csg-nota', 'Es el archivo SKILL.md: en Claude Code va en .claude/skills/<name>/SKILL.md; en claude.ai, en Ajustes → Capacidades → Habilidades.'));
    if (arm.sistema) {
      caja.appendChild(csgVerSep('Como instrucción de sistema'));
      caja.appendChild(csgEdPre(arm.sistema));
    }
  }

  let rep = null;
  try { rep = csgRevisar(p, maq.id); } catch (e) { rep = null; }
  if (rep) caja.appendChild(csgEdRepaso(rep, maq));
  root.appendChild(caja);
}

/* El texto armado en un <pre>, con cada {{hueco}} sin rellenar en su
   propio <span> ámbar. Troceando nodos de texto: un innerHTML aquí sería
   la puerta más ancha de la casa por el motivo más tonto. */
function csgEdPre(texto) {
  const pre = csgEl('pre', 'csg-pre');
  const s = String(texto == null ? '' : texto);
  const re = /\{\{[^{}\n]{0,60}\}\}/g;
  let i = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > i) pre.appendChild(document.createTextNode(s.slice(i, m.index)));
    pre.appendChild(csgEl('span', 'csg-var', m[0]));
    i = m.index + m[0].length;
  }
  if (i < s.length) pre.appendChild(document.createTextNode(s.slice(i)));
  return pre;
}

/* El repaso: lo que PARA, a la vista; lo que avisa, plegado tras su
   cuenta (regla 13: un panel lleno de avisos que no importan es un panel
   que no se lee, y entre los treinta dejan de verse los que paran). */
function csgEdRepaso(rep, maq) {
  const caja = csgEl('div', 'csg-repaso');
  let cabe;
  if (maq.abrir && maq.param) cabe = rep.cabe ? 'cabe en la dirección de ' + maq.nombre : 'no cabe: se abre sin texto y va copiado';
  else if (maq.abrir) cabe = maq.nombre + ' se abre sin texto: va copiado';
  else cabe = 'se copia y se pega a mano';
  caja.appendChild(csgEl('div', 'csg-rep-cuenta',
    '≈ ' + csgMiles(rep.palabras) + ' palabras (≈ ' + csgMiles(rep.tokens) + ' tokens, a ojo) · ' + cabe +
    (rep.elementos !== undefined ? ' · ' + rep.elementos + (rep.elementos === 1 ? ' elemento' : ' elementos') : '')));

  const para = Array.isArray(rep.para) ? rep.para : [];
  const avisa = Array.isArray(rep.avisa) ? rep.avisa : [];
  if (!para.length) caja.appendChild(csgEl('div', 'csg-nota', '✓ Nada impide usarla.'));
  para.forEach(x => caja.appendChild(csgEdRepItem(x, 'csg-aviso-para')));
  if (avisa.length) {
    const d = document.createElement('details');
    d.className = 'csg-rep-avisa';
    d.appendChild(csgEl('summary', '', '▲ ' + avisa.length + (avisa.length === 1 ? ' aviso' : ' avisos')));
    avisa.forEach(x => d.appendChild(csgEdRepItem(x, 'csg-aviso-avisa')));
    caja.appendChild(d);
  }
  return caja;
}

function csgEdRepItem(x, clase) {
  const it = csgEl('div', 'csg-rep-item ' + clase);
  it.appendChild(csgEl('span', '', String((x && x.msg) || '')));
  const a = x && x.arreglo;
  const rot = a ? csgEdRotuloArreglo(a) : '';
  if (rot) {
    const b = csgEl('button', 'csg-chip csg-rep-arreglo', rot);
    b.type = 'button';
    b.addEventListener('click', () => csgEdArreglo(a));
    it.appendChild(b);
  }
  return it;
}

/* La palabra del chip de cada arreglo: lo que va a pasar al tocarlo. */
function csgEdRotuloArreglo(a) {
  if (!a || !a.tipo) return '';
  if (a.tipo === 'ir') return a.bloque ? '✎ Ir a «' + csgEdRotuloDe(a.bloque) + '»' : '';
  if (a.tipo === 'frase') return a.texto ? '＋ ' + csgEdCorto(a.texto, 40) : '';
  if (a.tipo === 'hueco') return a.a ? '⇄ ' + csgEdCorto(a.a, 40) : '';
  if (a.tipo === 'abrir') return a.id && csgDe(a.id) ? '↗ Abrirla' : '';
  if (a.tipo === 'molde') return csgEdMoldeDe(a.molde) ? '⇄ Duplicar en ' + CSG_MOLDES[a.molde].nombre : '';
  return '';
}

function csgEdRotuloDe(id) {
  const molde = csgEdMolde(_csgEdPieza);
  if (molde && molde.bloques.some(e => e.id === id)) return String(csgBloqueDef(molde.id, id).rotulo || id);
  const b = csgEdBloque(id);
  return String((b && b.rotulo) || csgBloqueDef(null, id).rotulo || id);
}

function csgEdCorto(s, n) {
  s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  return csgLargoTexto(s) > n ? csgCorta(s, n - 1) + '…' : s;
}

/* Un arreglo del repaso, aplicado en el compositor abierto.
   · 'ir' vuelve a los bloques y pone el teclado en el que falta, en el
     mismo toque;
   · 'frase' y 'hueco' se aplican a los datos sin salir de la vista
     previa: se ve el arreglo hecho y el aviso desaparecer;
   · 'abrir' y 'molde' cambian de pieza, guardando antes lo de esta. */
function csgEdArreglo(a) {
  const p = _csgEdPieza;
  if (!a || !p) return;
  if (a.tipo === 'ir') {
    if (!a.bloque) return;
    if (_csgEdModo !== 'bloques') {
      _csgEdModo = 'bloques';
      csgEdPintar();
    }
    csgEdEnfocar(a.bloque);
    return;
  }
  if (a.tipo === 'frase') {
    if (!a.bloque || !a.texto) return;
    const t = csgEdTexto(a.bloque);
    if (t.indexOf(a.texto) < 0) csgEdPonTexto(a.bloque, t.trim() ? t.replace(/\s+$/, '') + '\n' + a.texto : a.texto);
    _csgEdAbiertos.add(a.bloque);
    csgEdPintar();
    csgEdTocado();
    csgAviso('＋ Puesta en «' + csgEdRotuloDe(a.bloque) + '»');
    return;
  }
  if (a.tipo === 'hueco') {
    if (!a.bloque || !a.de) return;
    const t = csgEdTexto(a.bloque);
    if (t.indexOf(a.de) < 0) return;
    csgEdPonTexto(a.bloque, t.split(a.de).join(String(a.a == null ? '' : a.a)));
    if (a.bloque === 'nombre') _csgEdAuto.nombre = '';
    csgEdPintar();
    csgEdTocado();
    return;
  }
  if (a.tipo === 'abrir') {
    const o = csgDe(a.id);
    if (!o || o.eliminado) return;
    csgAbrirCompositor(o);
    return;
  }
  if (a.tipo === 'molde') {
    if (!csgEdMoldeDe(a.molde)) return;
    /* Primero se guarda esta, y DESPUÉS se duplica: así el duplicado sabe
       que la de origen ya está en el anaquel y le pone el nombre del
       molde detrás, en vez de nacer con el mismo título que ella. */
    if (csgEdHayQueGuardar()) csgEdGuardar('callado');
    const dup = csgDuplicarEnMolde(_csgEdPieza || p, a.molde);
    csgAbrirCompositor(dup);
    csgAviso('Duplicada en ' + CSG_MOLDES[a.molde].nombre + ': sin guardar; lo que no encontró sitio va al final, marcado.');
  }
}

/* ══════════════════════════════════════════════════════════════════
   PASO 5 · GUARDAR
   ──────────────────────────────────────────────────────────────────
   Siempre se puede (regla 5): una pieza a medias es un borrador, no un
   error. Local al instante, nube con el respiro de csgSubirLuego. Si la
   pieza ya se usó y su texto en md cambió, nace una versión (regla 10).
   ══════════════════════════════════════════════════════════════════ */

/* Vuelca una copia de trabajo sobre el objeto de la lista, o la mete si
   es nueva, y la guarda. Sin pantalla: lo usan el guardado y el rescate
   de un borrador de otra pieza. Devuelve { obj, nuevaV, grande,
   promesa, localOk }.
   ⚠️ Sobre una pieza que ya existe se escriben SOLO los campos que el
   compositor edita (título, forma, máquina, bloques, material,
   estantes). La bitácora, las versiones, los usos y el cuaderno viven en
   el objeto de la lista y pueden haber cambiado mientras se escribía
   —un uso desde otra hoja, la nube que llegó—; volcarlos desde una copia
   hecha antes los borraría sin ningún aviso.
   ⚠️ Y DE ESOS, SOLO LOS QUE LA PERSONA CAMBIÓ: los que difieren de
   `orig`, la foto de lo que había al abrir (_csgEdOrig). Por lo mismo: un
   título corregido aquí no puede deshacer el texto que otro aparato
   corrigió mientras tanto, ni los estantes que puso el menú ⋯. Si los dos
   cambiaron el texto, gana el de aquí —es lo que se está viendo— y el de
   allá se guarda como versión y se dice (`pisada`): nada se pierde sin
   rastro. Sin foto (un borrador viejo), se escribe todo, como antes. */
function csgEdVolcar(p, materialCompositor, orig) {
  const titulo = csgEdTituloNorm(p.titulo);
  const limpios = csgEdBloquesParaGuardar(p);
  const matC = String(materialCompositor == null ? '' : materialCompositor);
  const grande = csgLargoTexto(matC) > CSG_TOPES.material;
  const material = grande ? '' : matC;
  const estantes = (p.estantes || []).map(String);
  const molde = csgEdMolde(p);
  const clase = (molde && molde.clase) || String(p.clase || 'prompt');

  let obj = csgDe(p.id);
  if (obj && obj.eliminado) { p.id = csgNuevoId(); obj = null; }
  let nuevaV = 0, pisada = 0;
  if (obj) {
    const o = (orig && typeof orig === 'object') ? orig : null;
    if (!o || csgEdForma(p) !== o.forma) {
      const antes = csgMdCrudo(obj);
      const despues = csgMdCrudo({ clase, molde: p.molde, bloques: limpios });
      if (antes !== despues) {
        /* ¿La cambió OTRO mientras tanto? Entonces su texto no se pisa sin
           más: queda como versión, aunque no se haya usado nunca. */
        if (o && csgEdForma(obj) !== o.forma) { nuevaV = csgNuevaVersion(obj, obj.bloques || []); pisada = nuevaV; }
        else if (csgEdVersionUsada(obj)) nuevaV = csgNuevaVersion(obj, obj.bloques || []);
      }
      obj.clase = clase;
      obj.molde = String(p.molde || obj.molde || '');
      obj.bloques = limpios;
    }
    if (!o || titulo !== o.titulo) obj.titulo = titulo;
    if (!o || String(p.maquina || '') !== o.maquina) obj.maquina = String(p.maquina || obj.maquina || '');
    if (!o || JSON.stringify(estantes) !== JSON.stringify(o.estantes)) obj.estantes = o ? csgEdMezclaEstantes(obj.estantes, o.estantes, estantes) : estantes;
    if (!o || material !== o.material) obj.material = material;
    if (!obj.autor) obj.autor = csgAutor();
  } else {
    obj = csgNuevaPieza(clase, p.molde);
    obj.id = p.id;
    obj.titulo = titulo;
    obj.clase = clase;
    obj.molde = String(p.molde || obj.molde);
    obj.maquina = String(p.maquina || obj.maquina || '');
    obj.bloques = limpios;
    obj.material = material;
    obj.estantes = estantes;
    obj.cuaderno = String(p.cuaderno || '');
    obj.notas = String(p.notas || '');
  }
  const promesa = csgSubirLuego(obj);
  const localOk = !_csgSinEspacio;
  if (typeof csgMaquinaApunta === 'function' && obj.maquina) csgMaquinaApunta(obj.maquina);
  return { obj, nuevaV, pisada, grande, promesa, localOk };
}

/* modo: 'boton' (💾), 'usar' (▶), 'volver' (‹) o 'callado' (al cambiar
   de pieza). Solo 'boton' y 'usar' preguntan por el título repetido: al
   salir con ‹ se guarda igual, y la ficha y el repaso ya lo avisan;
   parar la salida con una hoja sería un toque más para irse. `luego`
   recibe el objeto de la lista cuando el guardado se hizo. */
function csgEdGuardar(modo, luego) {
  const p = _csgEdPieza;
  if (!p) return null;
  /* ⚠️ 💾 SIN CAMBIOS NO ESCRIBE NADA. Escribía la copia de trabajo
     entera: con la nube recién llegada (otro aparato había corregido la
     pieza), un 💾 sin tocar nada devolvía la pieza a como estaba al abrir,
     y sobre una retirada en otro aparato la hacía nacer de nuevo. */
  if (modo === 'boton' && !_csgEdNueva && !csgEdSucio()) {
    const ya = csgDe(p.id);
    csgEdPintarEstado();
    csgAviso(ya && ya.eliminado ? 'Sin cambios: la retiraron en otro aparato, y no hay nada que guardar' : 'Sin cambios: ya estaba guardada');
    return ya;
  }
  const k = csgClave(String(p.titulo || ''));
  if (k && (modo === 'boton' || modo === 'usar') && _csgEdIgual !== k) {
    const otra = csgVivas().find(x => x && x.id !== p.id && csgClave(x.titulo || '') === k);
    if (otra) { csgEdHojaRepetido(otra, modo, luego); return null; }
  }
  clearTimeout(_csgEdBorradorT);
  /* El id puede cambiar al volcar (si la pieza se retiró mientras se
     escribía, lo escrito entra como pieza nueva): el borrador que hay que
     soltar es el del id de ANTES. */
  const idAntes = p.id;
  const r = csgEdVolcar(p, _csgEdMaterial, _csgEdNueva ? null : _csgEdOrig);
  const obj = r.obj;

  _csgEdNueva = false;
  _csgEdBaseNueva = '';
  _csgEdBaseNuevaQue = '';
  p.version = obj.version;
  /* La copia se pone al día con lo que QUEDÓ en la lista: si se juntó con
     algo de fuera (el texto de otro aparato que no se tocó aquí, un
     estante del menú ⋯), seguir con la copia vieja lo volvería a pisar en
     el siguiente 💾. Solo se repinta si de verdad cambió algo. */
  const matVista = r.grande ? _csgEdMaterial : String(obj.material || '');
  let repintar = false;
  if (csgEdHuella(p, _csgEdMaterial) !== csgEdHuella(obj, matVista)) {
    const c = csgEdClonar(obj);
    c.material = _csgEdMaterial;
    _csgEdPieza = c;
    repintar = true;
  }
  _csgEdOrig = csgEdFoto(obj, obj.material);
  _csgEdBase = csgEdHuella(_csgEdPieza, _csgEdMaterial);
  _csgEdGuardado = 'si';
  let rep = null;
  try { rep = csgRevisar(obj, obj.maquina); } catch (e) { rep = null; }
  _csgEdPara = !!(rep && rep.para.length);
  /* El material de más de 20.000 no va con la pieza: se queda en el
     borrador, marcado como ya guardado, para la hoja de Usar. */
  if (r.grande) csgBorradorEscribe(true);
  else { csgBorradorBorra(idAntes); csgBorradorBorra(p.id); }
  _csgEdRecuperar = null;
  if (repintar && modo !== 'volver' && modo !== 'callado' && csgEdEnVista()) csgEdPintar();
  csgEdPintarEstado();
  if (typeof csgPintarAnaquel === 'function') csgPintarAnaquel();

  let aviso = '';
  if (!r.localOk) {
    const n = csgRotuloNube();
    aviso = n.ic + ' ' + n.t;
  } else {
    const partes = [];
    if (_csgEdPara) {
      const falta = (typeof csgFaltaDe === 'function' ? csgFaltaDe(obj) : '') || (rep && rep.para[0] ? rep.para[0].msg : '');
      partes.push('🟡 Guardada como borrador' + (falta ? ' · ' + falta : ''));
    } else partes.push('💾 Guardada');
    if (r.pisada) partes.push('la cambiaron en otro aparato mientras escribías: aquel texto queda como v' + (r.pisada - 1) + ' en 🕘 Versiones');
    else if (r.nuevaV) partes.push('ahora es la v' + r.nuevaV + ' (la anterior queda en Versiones)');
    if (r.grande) partes.push('el 📎 material de ' + csgMiles(csgLargoTexto(_csgEdMaterial)) + ' caracteres no va con la pieza: pégalo al usar');
    const notable = _csgEdPara || r.nuevaV || r.grande;
    if (modo === 'boton' || (modo === 'volver' && notable) || (modo === 'usar' && r.nuevaV)) aviso = partes.join(' · ');
    else if (modo === 'callado') aviso = '💾 Guardada «' + (obj.titulo || csgEdNombreDeForma(obj)) + '»' + (r.pisada ? ' · ' + partes[1] : '');
  }
  if (aviso) csgAviso(aviso);

  const id = obj.id;
  Promise.resolve(r.promesa).then(res => {
    if (_csgEdPieza && _csgEdPieza.id === id) csgEdPintarEstado();
    if (typeof csgPintarAnaquel === 'function') csgPintarAnaquel();
    /* La causa se nombra (regla 18), y solo tras el 💾: después de ‹ o
       de ▶ la franja del anaquel y la hoja ya lo dicen. Y «aún se está
       mirando la nube» no es una causa: subirá al acabar de mirar. */
    if (!(res && res.ok) && res && res.motivo !== 'sin-nube' && modo === 'boton' && r.localOk && csgEdEnVista()) {
      const n = csgRotuloNube();
      if (!n.ok) csgAviso(n.ic + ' ' + n.t);
    }
  }).catch(() => {});

  if (typeof luego === 'function') luego(obj);
  return obj;
}

/* «Ya hay una «X» · abrirla · guardar igual» (§5, paso 5), en la hoja
   vertical y no con confirm(): tres renglones de 44 px con la palabra de
   lo que hacen. */
/* ¿Lo del compositor dice EXACTAMENTE lo mismo que `otra`? Los bloques
   en md (sin rellenar nada) y el material: el título ya se sabe que es
   igual, que es por lo que se pregunta. */
function csgEdMismoQue(otra) {
  const p = _csgEdPieza;
  if (!p || !otra) return false;
  const molde = csgEdMolde(p);
  const aqui = csgMdCrudo({ clase: (molde && molde.clase) || p.clase, molde: p.molde, bloques: csgEdBloquesParaGuardar(p) });
  return aqui === csgMdCrudo(otra) && String(_csgEdMaterial || '').trim() === String(otra.material || '').trim();
}

function csgEdHojaRepetido(otra, modo, luego) {
  const k = csgClave(String(otra.titulo || ''));
  /* ⚠️ «ABRIR LA QUE YA HAY» NO TIRA LO ESCRITO. Tiraba el texto y el
     borrador de un solo toque, sin rastro, cuando tirar texto cuesta DOS
     toques en todo lo demás de la herramienta (Descartar, en ＋ Nueva y en
     el anaquel). Ahora: si lo de aquí es la MISMA consigna —el caso de
     siempre, pegada dos veces— no hay nada que perder y se suelta; si dice
     otra cosa, se guarda aparte antes de abrir la otra (como hace
     csgAbrirCompositor con cualquier copia sin guardar), y el renglón lo
     dice ANTES del toque. */
  const mismo = csgEdMismoQue(otra);
  csgVerAbrir('Ya hay una «' + (otra.titulo || CSG_SIN_TITULO) + '»', cuerpo => {
    cuerpo.appendChild(csgEl('div', 'csg-nota', 'Casi siempre es la misma consigna escrita dos veces. Dos pueden llamarse igual: se dice para que no se te pase.'));
    cuerpo.appendChild(csgVerFila('📜', 'Abrir la que ya hay', null, null, () => {
      csgVerCerrar();
      if (_csgEdPieza) {
        if (csgEdMismoQue(otra)) {
          clearTimeout(_csgEdBorradorT);
          csgBorradorBorra(_csgEdPieza.id);
          _csgEdPieza = null;
          _csgEdRecuperar = null;
        } else {
          _csgEdIgual = k;
          csgEdGuardar('callado');
        }
      }
      csgAbrirCompositor(otra);
    }, mismo ? 'dice lo mismo: esta no hace falta guardarla' : 'lo escrito aquí se guarda aparte, no se pierde'));
    cuerpo.appendChild(csgVerFila('💾', 'Guardar igual', null, null, () => {
      csgVerCerrar();
      _csgEdIgual = k;
      csgEdGuardar(modo, luego);
    }, 'quedan dos con el mismo título'));
    cuerpo.appendChild(csgVerFila('✎', 'Cambiar el título', null, null, () => {
      csgVerCerrar();
      const inp = document.getElementById('csg-ed-titulo');
      if (inp) { inp.focus(); try { inp.select(); } catch (e) {} }
    }));
  });
}

/* ‹: si hay algo escrito y cambió, se guarda antes de volver (como en
   Redacción); una pieza nueva sin nada escrito se descarta sin
   preguntar, porque no hay nada que perder. */
function csgEdVolver() {
  const p = _csgEdPieza;
  clearTimeout(_csgEdPreviaT);
  if (p) {
    if (csgEdHayQueGuardar()) csgEdGuardar('volver');
    else if (_csgEdNueva) {
      clearTimeout(_csgEdBorradorT);
      csgBorradorBorra(p.id);
      /* Un duplicado que nadie tocó no deja una ficha de más (§6.9): se
         dice, para que no parezca que se perdió. */
      if (_csgEdBaseNueva) {
        csgAviso(_csgEdBaseNuevaQue === 'duplicado'
          ? 'La copia no se guardó: no la tocaste, y la original sigue igual'
          : 'Sin cambios: no se guardó nada');
      }
      _csgEdPieza = null;
    } else csgBorradorAhora();
  }
  _csgAnqVuelta = true;
  switchView('view-consigna');
  if (typeof csgPintarAnaquel === 'function') csgPintarAnaquel();
}

/* Lo que hace el compositor cuando llega la nube (al abrir el anaquel o
   al volver la señal): su estado dice si la pieza subió ya, y una copia
   LIMPIA se pone al día con lo que trajo, para no enseñar —ni tomar como
   punto de partida— lo que otro aparato ya cambió. Si la persona está
   escribiendo (el foco en un recuadro) no se toca: repintar le cerraría
   el teclado, y la copia vieja ya no puede pisar nada al guardar (se
   escribe solo lo que cambió). */
function csgEdTrasNube() {
  if (typeof document === 'undefined' || !document || !document.getElementById) return;
  const p = _csgEdPieza;
  if (p && !_csgEdNueva && !_csgEdRecuperar && !csgEdSucio()) {
    const obj = csgDe(p.id);
    if (obj && !obj.eliminado) {
      const grande = csgLargoTexto(_csgEdMaterial) > CSG_TOPES.material && !String(obj.material || '');
      const mat = grande ? _csgEdMaterial : String(obj.material || '');
      const ae = document.activeElement;
      const raiz = document.getElementById('view-consigna-editor');
      const escribiendo = !!(ae && raiz && raiz.contains(ae) && /^(TEXTAREA|INPUT)$/.test(ae.tagName));
      if (csgEdHuella(obj, mat) !== _csgEdBase && !(csgEdEnVista() && escribiendo)) {
        const c = csgEdClonar(obj);
        c.material = mat;
        _csgEdPieza = c;
        _csgEdMaterial = mat;
        _csgEdOrig = csgEdFoto(obj, obj.material);
        _csgEdBase = csgEdHuella(c, mat);
        try { _csgEdPara = csgRevisar(c, c.maquina).para.length > 0; } catch (e) { _csgEdPara = false; }
        if (csgEdEnVista()) {
          csgEdPintar();
          csgAviso('↻ Esta consigna cambió en otro aparato: ya se ve lo último');
        }
      } else if (csgEdHuella(obj, mat) === _csgEdBase) _csgEdOrig = csgEdFoto(obj, obj.material);
    }
  }
  csgEdPintarEstado();
}

/* ▶ Usar: guarda lo que haya cambiado y abre la hoja de Usar con la
   máquina y el MATERIAL del compositor, aunque pase de 20.000: ese no se
   guarda con la pieza, pero sí se usa. Una pieza nueva sin nada escrito
   no se guarda (sería un borrador vacío en el anaquel): la hoja se abre
   igual y dice qué falta. */
function csgEdUsar() {
  const p = _csgEdPieza;
  if (!p) return;
  const abrir = obj => {
    if (typeof csgAbrirUsar === 'function') csgAbrirUsar(obj, { maquina: obj.maquina || p.maquina, material: _csgEdMaterial });
  };
  if (_csgEdNueva && !csgEdAlgoEscrito()) { abrir(p); return; }
  if (_csgEdNueva || csgEdSucio()) { csgEdGuardar('usar', abrir); return; }
  abrir(csgDe(p.id) || p);
}

/* ══════════════════════════════════════════════════════════════════
   LOS CABLES DE ESTA PARTE
   ──────────────────────────────────────────────────────────────────
   ⚠️ SE ENGANCHAN LA PRIMERA VEZ QUE SE ABRE EL COMPOSITOR, NO EN UN
   DOMContentLoaded. La prueba de Node (_dev/test-consigna-node.js) carga
   este archivo entero con un `document` que REVIENTA si se le toca y con
   espías que apuntan cualquier toque a `document` o a `window`: un
   `document.addEventListener` aquí arriba la haría suspender. Y no hace
   falta antes: al compositor solo se llega por csgAbrirCompositor o por
   csgBorradorSeguir, y los dos pasan por csgEdEmpezar, que llama a esto
   antes de enseñar la vista. Nadie puede tocar un botón que no ve.
   ══════════════════════════════════════════════════════════════════ */

function csgEdEngancha() {
  if (_csgEdEnganchado) return;
  if (typeof document === 'undefined' || !document || typeof document.getElementById !== 'function') return;
  _csgEdEnganchado = true;
  const $ = id => document.getElementById(id);
  const atras = $('csg-ed-back-btn');
  if (atras) atras.addEventListener('click', csgEdVolver);
  const tit = $('csg-ed-titulo');
  if (tit) {
    tit.addEventListener('input', csgEdAlTitulo);
    /* Intro en el título baja el teclado: en una tableta, la tecla de
       intro de un campo de una línea es la única forma de quitarlo. */
    tit.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); tit.blur(); } });
  }
  const ver = $('csg-ed-ver');
  if (ver) ver.addEventListener('click', csgEdAlternarVista);
  const guardar = $('csg-ed-guardar');
  if (guardar) guardar.addEventListener('click', () => csgEdGuardar('boton'));
  const usar = $('csg-ed-usar');
  if (usar) usar.addEventListener('click', csgEdUsar);
  /* El borrador que esperaba su respiro se escribe YA al esconderse la
     página: una recarga del service worker o cambiar de aplicación a
     media palabra no esperan a nadie. */
  if (typeof window !== 'undefined' && window && typeof window.addEventListener === 'function') {
    window.addEventListener('pagehide', csgBorradorAhora);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') csgBorradorAhora();
  });
}


/* ══════════════════════════════════════════════════════════════════
   📜 LA CONSIGNA · PANTALLA, PARTE 3 DE 3: LAS HOJAS
   (▶ Usar, 📋 Pegar lo que ya tengo, y abrir la máquina)
   ──────────────────────────────────────────────────────────────────
   Va la ÚLTIMA detrás de la marca «PANTALLA», después del anaquel y del
   compositor: usa sus ayudantes (csgEl, csgBtn, csgVerAbrir,
   csgCopiarTexto, csgNuevaPieza, csgDuplicarEnMolde, csgAbrirCompositor)
   y ellos llaman a las cuatro puertas de aquí: csgAbrirUsar,
   csgCopiarDirecto, csgAbrirPegar y csgAbrirMaquina.

   Es el sitio donde la consigna SALE (Usar) y por donde ENTRA la que ya
   estaba escrita en otra parte (Pegar). Las dos cosas que no se negocian
   aquí, y por qué:

   · LO QUE SE COPIA ES LO QUE SE VE, CARÁCTER POR CARÁCTER (regla 1). El
     <pre> de la hoja, 📋 Copiar, 📤 Compartir y ↗ Abrir salen del MISMO
     csgArmar con los mismos valores y el mismo material. Si el recuadro
     armara por su cuenta, un día se separarían sin ningún error, y eso se
     descubre leyendo lo que la máquina devolvió, sin saber por qué.
   · UNA VARIABLE VACÍA NO SE COPIA EN SILENCIO (regla 6). Copiar se para
     y la nombra; «Copiar con huecos» es OTRO botón, explícito.

   ⚠️ A NIVEL DE ARCHIVO NO SE TOCA NI `document` NI `window`, TAMPOCO
   PARA COLGAR UN DOMContentLoaded (lo mismo que las otras dos partes). La
   prueba de Node (_dev/test-consigna-node.js) carga el archivo entero con
   un `document` que REVIENTA si se le toca y con espías que apuntan
   cualquier toque: un `document.addEventListener` aquí arriba la haría
   suspender. Los cables de las dos hojas se enganchan la primera vez que
   se abre una de ellas (csgUsarEngancha), que es siempre antes de que
   nadie pueda tocar su ✕.

   ⚠️ Y NADA DE LO ESCRITO POR UNA PERSONA LLEGA A UN ATRIBUTO NI A
   innerHTML (regla 15): todo con createElement y textContent, el <pre>
   incluido. Los únicos `id` que se ponen son NUESTROS («csg-usar-v-3»),
   nunca el nombre de una variable; y las direcciones que se abren son los
   literales de CSG_MAQUINAS con el texto detrás por encodeURIComponent, o
   la del cuaderno ligado comprobada con URL().
   ══════════════════════════════════════════════════════════════════ */

/* ── Constantes y estado de las hojas ─────────────────────────────── */

/* Un valor de variable más largo que esto no se recuerda como «último
   valor»: eso ya no es un valor que se repite, es material, y guardar
   tres copias de un informe por variable llenaría el almacén del
   aparato —donde también viven las piezas— sin que nadie lo pidiera. Se
   usa igual; solo no se ofrece la próxima vez. */
const CSG_USAR_VALOR_MAX = 2000;
/* Las piezas cuyos últimos valores se recuerdan. Pasado el tope se van
   primero las que ya no están en el anaquel y después las que hace más
   que no se usan (la memoria se reordena en cada uso). */
const CSG_USAR_VARS_PIEZAS = 300;
/* Escribiendo en el recuadro de pegar, se vuelve a leer tras este
   respiro. Pegando, al instante: pegar es el caso que importa. */
const CSG_PEG_RESPIRO = 600;

let _csgUsarPieza = null;        // la pieza que se está usando (la de la lista, casi siempre)
let _csgUsarMaquina = '';        // la máquina elegida en la hoja
let _csgUsarNombres = [];        // las variables que se preguntan (sin las reservadas)
/* ⚠️ Los mapas de valores van SIN PROTOTIPO (Object.create(null)): el
   nombre de una variable lo escribe una persona, y en un objeto normal
   `valores['__proto__'] = ''` no crea ninguna llave —cambia el
   prototipo—, y leerla devuelve Object.prototype. Así {{__proto__}}
   salía rellena con «[object Object]», no paraba Copiar, se copiaba con
   el hueco puesto y el uso reventaba sin apuntarse. */
let _csgUsarValores = Object.create(null);   // nombre → lo escrito ahora mismo
let _csgUsarMaterial = '';       // el material de ESTE uso (no se guarda)
let _csgUsarArmado = null;       // lo último que salió de csgArmar: es lo que se copia
let _csgUsarRep = null;          // el repaso para la máquina elegida
let _csgUsarEl = null;           // los nodos de la hoja abierta
let _csgUsarApuntado = '';       // la huella del último uso apuntado en esta apertura
let _csgUsarExtraK = '';         // la huella de la fila de botones pequeños pintada
let _csgUsarEnganchado = false;

let _csgPegEl = null;            // los nodos de la hoja de pegar
let _csgPegTexto = '';           // lo que se leyó (para saber si el recuadro cambió)
let _csgPegLeido = null;         // lo que devolvió csgLeer
let _csgPegBase = null;          // la pieza con la propuesta del lector
let _csgPegPieza = null;         // la que se abrirá: la base, o su duplicado en otro molde
let _csgPegElegido = '';         // el molde que eligió la persona ('' = el propuesto)
let _csgPegT = null;

/* ── Ayudantes de esta parte ──────────────────────────────────────── */

/* Mostrar y esconder con las DOS cosas a la vez: `hidden` y el display
   en la etiqueta. El `[hidden]` del navegador pierde contra cualquier
   `display` de una clase (La Voz Prestada, regla 40: «el mando responde
   y no hace nada»), y las clases de estas cajas las pinta otra parte:
   si un día una lleva `display: flex`, un aviso «escondido» seguiría a
   la vista diciendo algo que ya no es verdad. */
function csgUsarMuestra(el, si) {
  if (!el) return;
  el.hidden = !si;
  el.style.display = si ? '' : 'none';
}

/* Un texto en un renglón y cortado para un chip o un extracto: los
   valores y los bloques pueden traer saltos y párrafos enteros. */
function csgUsarCorto(s, n) {
  const u = csgUnRenglon(String(s == null ? '' : s)).trim();
  return csgLargoTexto(u) > n ? csgCorta(u, n - 1).replace(/\s+$/, '') + '…' : u;
}

/* Un aviso ● o ▲ con su texto en un <span>: el signo lo pone el CSS, y
   el texto va en su propia caja para que un mensaje largo se parta en
   renglones en vez de estirar la hoja a lo ancho. */
function csgUsarAviso(cls, texto) {
  const d = csgEl('div', cls);
  d.appendChild(csgEl('span', '', String(texto == null ? '' : texto)));
  return d;
}

/* «{{tema}}», «{{tema}} y {{n}}», «{{a}}, {{b}} y {{c}}». */
function csgUsarLista(nombres) {
  const l = nombres.map(n => '{{' + n + '}}');
  if (l.length <= 1) return l.join('');
  return l.slice(0, -1).join(', ') + ' y ' + l[l.length - 1];
}

/* El molde por su llave PROPIA (CSG_MOLDES['toString'] es una función
   heredada y una fila tocada a mano con ese molde reventaría la hoja). */
function csgUsarMolde(p) {
  const id = p && p.molde;
  return (typeof id === 'string' && Object.prototype.hasOwnProperty.call(CSG_MOLDES, id)) ? CSG_MOLDES[id] : null;
}

/* El texto de un bloque SIN su código: lo de entre ``` o ~~~ se vacía y
   un trozo entre `…` se vuelve espacios. Dentro del código las llaves son
   una PLANTILLA que se copia tal cual («{{ pedido.id }}», un Handlebars),
   y el repaso ya las trata así; si esta hoja las preguntara como huecos,
   Copiar se pararía pidiendo un valor para lo que la persona quiere
   copiar con sus llaves, y el prompt que existe para dar esa plantilla no
   se podría usar. Es la regla de csgLecSinCodigo del núcleo, copiada
   porque los csgLec son internos del lector. */
function csgUsarSinCodigo(t) {
  let enCodigo = false;
  return String(t == null ? '' : t).split('\n').map(l => {
    if (/^\s*(```|~~~)/.test(l)) { enCodigo = !enCodigo; return ''; }
    return enCodigo ? '' : l.replace(/`[^`\n]*`/g, x => ' '.repeat(x.length));
  }).join('\n');
}

/* Las variables que se PREGUNTAN al usar: las de los bloques, fuera del
   código, en el orden en que se leen, y sin las reservadas ({{maquina}},
   {{titulo}}, {{hoy}}), que se rellenan solas: preguntarlas sería pedir
   lo que ya se sabe. */
function csgUsarNombres(p) {
  const textos = (Array.isArray(p && p.bloques) ? p.bloques : [])
    .filter(b => b && typeof b === 'object')
    .map(b => csgUsarSinCodigo(b.t));
  return csgVariables(textos).filter(n => CSG_RESERVADAS.indexOf(n) < 0);
}

/* ── Los últimos valores de cada variable (CSG_CLAVES.vars) ───────────
   { [idPieza]: { [nombre]: [tres últimos, el más nuevo primero] } }.
   Son del APARATO y POR PIEZA (regla 6): el {{tema}} de «Resumen de
   informe» no tiene nada que ver con el {{tema}} de «Careo», y ofrecer el
   de una en la otra es rellenar mal sin que se note. */

function csgVarsLee() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CSG_CLAVES.vars)); } catch (e) { d = null; }
  /* Sin prototipo, como los valores de la hoja: las llaves son ids de
     pieza y nombres de variable, y un «__proto__» escrito aquí cambiaría
     el prototipo del objeto en vez de guardarse. */
  return Object.assign(Object.create(null), (d && typeof d === 'object' && !Array.isArray(d)) ? d : {});
}
function csgVarsUltimos(id, nombre) {
  if (!id) return [];
  const de = csgVarsLee()[id];
  if (!de || typeof de !== 'object' || Array.isArray(de)) return [];
  const l = Object.prototype.hasOwnProperty.call(de, nombre) ? de[nombre] : null;
  return Array.isArray(l) ? l.filter(x => typeof x === 'string' && x.trim()).slice(0, 3) : [];
}
function csgVarsApunta(id, nombres, valores) {
  if (!id || !Array.isArray(nombres) || !nombres.length) return;
  const todo = csgVarsLee();
  const viejo = todo[id];
  const de = Object.assign(Object.create(null), (viejo && typeof viejo === 'object' && !Array.isArray(viejo)) ? viejo : {});
  let cambio = false;
  nombres.forEach(n => {
    const v = String((valores && valores[n]) == null ? '' : valores[n]).trim();
    if (!v || csgLargoTexto(v) > CSG_USAR_VALOR_MAX) return;
    const antes = Array.isArray(de[n]) ? de[n].filter(x => typeof x === 'string' && x.trim() && x.trim() !== v) : [];
    de[n] = [v].concat(antes).slice(0, 3);
    cambio = true;
  });
  if (!cambio) return;
  /* Se saca y se vuelve a meter: el orden de las llaves es el de los
     usos, y la poda se lleva primero las del principio. */
  delete todo[id];
  todo[id] = de;
  let ids = Object.keys(todo);
  if (ids.length > CSG_USAR_VARS_PIEZAS) {
    ids.forEach(k => {
      if (Object.keys(todo).length <= CSG_USAR_VARS_PIEZAS || k === id) return;
      const p = csgDe(k);
      if (!p || p.eliminado) delete todo[k];
    });
    ids = Object.keys(todo);
    while (ids.length > CSG_USAR_VARS_PIEZAS) { const k = ids.shift(); if (k !== id) delete todo[k]; }
  }
  try { localStorage.setItem(CSG_CLAVES.vars, JSON.stringify(todo)); } catch (e) { /* almacén lleno: se usa igual, solo no se recuerda */ }
}

/* ══════════════════════════════════════════════════════════════════
   ↗ ABRIR LA MÁQUINA (§4, regla 16)
   ──────────────────────────────────────────────────────────────────
   Se copia primero, SIEMPRE, y dentro del toque. La dirección base es el
   LITERAL de CSG_MAQUINAS, nunca armada con datos; el texto va detrás con
   encodeURIComponent solo si esa parte codificada cabe en
   CSG_PREFILL_MAX (1.500): una dirección larga se corta sin avisar, y lo
   que se pierde es el final —el Formato—, que es justo lo que hace
   pegable la respuesta. Por encima se abre pelada, y como ya va copiado,
   basta con pegar al llegar. Gemini y NotebookLM no admiten el texto en
   la dirección: se abren siempre pelados.
   La decisión vive en UNA función (csgUsarDestino) que usan el rótulo
   del botón y el botón: con dos, el botón diría «pega ahí» de un texto
   que sí iba en la dirección, o al revés.
   ══════════════════════════════════════════════════════════════════ */

/* La dirección del cuaderno ligado (§8, menú ⋯ → 📓 Ligar al cuaderno),
   comprobada con URL() y solo https. Se busca en la lista de 📓
   Cuadernos si está cargada y, si no, en su copia del aparato: el
   inventario de cuadernos no tiene por qué haberse abierto en esta
   sesión para que su dirección exista. Sin nada que la respalde, ''. */
function csgUsarCuaderno(pieza) {
  const id = pieza && pieza.cuaderno ? String(pieza.cuaderno) : '';
  if (!id) return '';
  let c = null;
  try { if (typeof rcuDe === 'function') c = rcuDe(id); } catch (e) { c = null; }
  if (!c) {
    try {
      if (typeof rcuLeeLocal === 'function') c = (rcuLeeLocal() || []).find(x => x && x.id === id && !x.eliminado) || null;
    } catch (e) { c = null; }
  }
  if (!c || c.eliminado || !c.url) return '';
  try {
    const u = new URL(String(c.url));
    if (u.protocol === 'https:') return u.href;
  } catch (e) { /* una dirección que no se entiende no se abre */ }
  return '';
}

/* Adónde lleva ↗ con ESTE texto: { maq, url, lleno, donde, ligado }.
   `url` vacío = no hay a dónde abrir («Otra»). `lleno` = el texto va en
   la dirección. */
function csgUsarDestino(maquinaId, texto, pieza) {
  const maq = csgMaquina(maquinaId);
  const out = { maq, url: '', lleno: false, donde: maq.donde || maq.nombre, ligado: false };
  if (!maq.abrir) return out;
  let base = maq.abrir;
  if (maq.id === 'notebooklm') {
    const c = csgUsarCuaderno(pieza);
    if (c) { base = c; out.ligado = true; out.donde = 'tu cuaderno de NotebookLM'; }
  }
  out.url = base;
  if (maq.param && !out.ligado) {
    const enc = encodeURIComponent(String(texto == null ? '' : texto));
    if (enc && enc.length <= CSG_PREFILL_MAX) {
      out.url = base + (base.indexOf('?') >= 0 ? '&' : '?') + maq.param + '=' + enc;
      out.lleno = true;
    }
  }
  return out;
}

/* Copia el texto y abre la máquina. Devuelve { url, lleno, copia }, donde
   `copia` es la promesa del portapapeles (true/false), para que quien
   llama pueda dejar el texto seleccionado si falló.
   ⚠️ El portapapeles se pide ANTES que la ventana y sin ningún `await`
   delante: el Safari de un iPad solo deja escribir mientras dura el
   gesto, y abrir primero se lleva el foco a la pestaña nueva.
   ⚠️ Con noopener, window.open devuelve null SIEMPRE, se haya abierto o
   no: no hay forma de saber si el navegador bloqueó la ventana. Por eso
   el aviso dice las dos cosas —está copiado y adónde ir— en vez de fingir
   que sabe cuál pasó. Y noopener,noreferrer no es adorno: sin él, la
   página que se abre puede tocar `window.opener`, que es F.A.R.O con la
   sesión de la casa puesta (la Bóveda, las finanzas, el chat). */
function csgAbrirMaquina(maquinaId, texto, pieza) {
  const t = String(texto == null ? '' : texto);
  const copia = csgCopiarTexto(t);
  const d = csgUsarDestino(maquinaId, t, pieza);
  if (!d.url) {
    copia.then(ok => csgAviso(ok ? '📋 Copiado: pégalo donde lo vayas a usar.' : 'No se pudo copiar: mantén pulsado el texto para copiarlo.'));
    return { url: '', lleno: false, copia };
  }
  try { window.open(d.url, '_blank', 'noopener,noreferrer'); } catch (e) { /* el aviso de abajo dice adónde ir */ }
  copia.then(ok => {
    if (ok) csgAviso('Copiado. Si no se abrió, ve a ' + d.donde + ' y pega.');
    else if (d.lleno) csgAviso('El texto va en la dirección, pero no se pudo copiar: si no aparece en ' + d.donde + ', vuelve aquí y cópialo a mano.');
    else csgAviso('No se pudo copiar: vuelve aquí, mantén pulsado el texto y cópialo; después pégalo en ' + d.donde + '.');
  });
  return { url: d.url, lleno: d.lleno, copia };
}

/* ══════════════════════════════════════════════════════════════════
   ▶ LA HOJA DE USAR (§5, paso 4)
   ──────────────────────────────────────────────────────────────────
   De arriba abajo: las máquinas; lo que PARA (si algo para); las
   variables con su último valor; el texto armado, que se rellena en vivo;
   el material, plegado; los botones pequeños que tocan a cada forma; y
   el pie fijo con 📋 Copiar · 📤 Compartir · ↗ Abrir.
   La cuenta: volver a usar una pieza son DOS toques (▶ · Copiar), o tres
   con una variable que cambia. Por eso la primera variable VACÍA recibe
   el foco en el mismo toque que abre la hoja —sale el teclado solo— y
   las que tienen su último valor no piden nada.
   ⚠️ Aquí NO se pregunta «¿sirvió?»: se apunta el uso con ok: null y se
   pregunta en la siguiente apertura del anaquel (§6.7). Preguntarlo al
   copiar es preguntar antes de que la máquina conteste.
   ══════════════════════════════════════════════════════════════════ */

/* opts: { maquina?, material? (el del compositor, aunque pase de 20.000),
   sinFoco? (cuando se abre fuera de un toque: un foco sin gesto no saca
   el teclado en un iPad y en Android lo saca a destiempo) }. */
function csgAbrirUsar(pieza, opts) {
  if (!pieza || typeof pieza !== 'object') return null;
  csgUsarEngancha();
  const ov = document.getElementById('csg-usar-overlay');
  const cuerpo = document.getElementById('csg-usar-cuerpo');
  const pie = document.getElementById('csg-usar-pie');
  if (!ov || !cuerpo || !pie) { csgAviso('No se pudo abrir la hoja de usar: vuelve a abrir F.A.R.O'); return null; }
  const op = (opts && typeof opts === 'object') ? opts : {};
  /* La hoja vertical va DESPUÉS en el documento, así que abierta taparía
     esta entera: el botón respondería y no se vería nada (la avería de
     las hojas del taller de La Voz Prestada, regla 35). */
  if (typeof csgVerCerrar === 'function') csgVerCerrar();

  _csgUsarPieza = pieza;
  _csgUsarMaquina = csgMaquina(op.maquina || pieza.maquina || csgMaquinaUltima()).id;
  /* El material: el del compositor si viene (puede pasar de 20.000 y
     entonces no está en la pieza); si no, el guardado; y si tampoco, el
     que quedó en el borrador por no caber (§5, paso 4). */
  let mat = (op.material !== undefined && op.material !== null) ? String(op.material) : String(pieza.material || '');
  if (!mat.trim() && typeof csgBorradorMaterial === 'function') {
    try { mat = String(csgBorradorMaterial(pieza.id) || '') || mat; } catch (e) {}
  }
  _csgUsarMaterial = mat;
  _csgUsarNombres = csgUsarNombres(pieza);
  _csgUsarValores = Object.create(null);
  _csgUsarNombres.forEach(n => { _csgUsarValores[n] = csgVarsUltimos(pieza.id, n)[0] || ''; });
  _csgUsarApuntado = '';
  _csgUsarExtraK = '';
  _csgUsarRep = csgUsarRepasa();

  const tit = document.getElementById('csg-usar-titulo');
  if (tit) tit.textContent = '▶ Usar · ' + (String(pieza.titulo || '').replace(/\s+/g, ' ').trim() || CSG_SIN_TITULO);
  csgUsarPintarCuerpo(cuerpo, pie);
  ov.style.display = 'flex';
  const modal = ov.querySelector('.fin-modal');
  if (modal) modal.scrollTop = 0;
  csgUsarPintarRepaso();
  csgUsarRefrescar();

  /* ⚠️ El foco va DENTRO del toque que abrió, sin nada asíncrono delante:
     es lo que hace que en la tableta salga el teclado solo. Con algo que
     PARA no se enfoca nada: el teclado taparía justo el aviso que dice
     por qué no se puede usar. */
  if (!op.sinFoco && !_csgUsarRep.para.length) {
    const vacia = _csgUsarEl.inputs.find(r => !String(r.el.value || '').trim());
    if (vacia) { try { vacia.el.focus(); } catch (e) {} }
  }
  return pieza;
}

/* El repaso de la pieza para la máquina elegida. Si el repaso reventara
   (una pieza rota que nadie previó), la hoja se deja usar: lo que se
   copia sale del armado, y una herramienta que no deja copiar por un
   fallo suyo es peor que una que no avisa. */
function csgUsarRepasa() {
  let r = null;
  try { r = csgRevisar(_csgUsarPieza, _csgUsarMaquina); } catch (e) { r = null; }
  if (!r || !Array.isArray(r.para)) r = { para: [], avisa: [], palabras: 0, tokens: 0, cabe: false };
  if (!Array.isArray(r.avisa)) r.avisa = [];
  return r;
}

/* Lo que no cambia mientras la hoja está abierta se pinta UNA vez: al
   escribir una variable solo se rehacen el <pre>, el aviso de lo que
   falta y los rótulos del pie. Rehacer los recuadros en cada tecla le
   quitaría el foco a quien está escribiendo. */
function csgUsarPintarCuerpo(cuerpo, pie) {
  cuerpo.textContent = '';
  pie.textContent = '';
  const p = _csgUsarPieza;
  const el = { inputs: [] };
  _csgUsarEl = el;

  /* 1 · A qué máquina. Cambiarla vuelve a armar al instante: la forma es
     de la máquina (regla 2), y lo que se ve cambia con ella. */
  el.maquinas = csgEl('div', 'csg-usar-maquinas csg-desliza');
  el.chips = CSG_MAQUINAS.map(m => {
    const b = csgEl('button', 'csg-chip', m.nombre);
    b.type = 'button';
    b.addEventListener('click', () => csgUsarPonMaquina(m.id));
    el.maquinas.appendChild(b);
    return { id: m.id, el: b };
  });
  cuerpo.appendChild(el.maquinas);
  el.nota = csgEl('p', 'csg-nota', '');
  cuerpo.appendChild(el.nota);

  /* 2 · Lo que PARA, a la vista, y lo que avisa, plegado tras su cuenta
     (regla 13): entre treinta avisos abiertos, los que paran dejan de
     verse. */
  el.para = csgEl('div', 'csg-usar-para');
  cuerpo.appendChild(el.para);
  el.avisa = csgEl('details', 'csg-rep-avisa');
  cuerpo.appendChild(el.avisa);

  /* 3 · Las variables, un renglón de 44 px cada una, con el ÚLTIMO valor
     que se le puso a ESTA pieza y, debajo, los tres últimos como chips. */
  if (_csgUsarNombres.length) {
    const caja = csgEl('div', 'csg-usar-vars');
    caja.appendChild(csgEl('p', 'csg-nota', _csgUsarNombres.length === 1
      ? 'Rellena el hueco para este uso: la consigna guardada no cambia.'
      : 'Rellena los huecos para este uso: la consigna guardada no cambia.'));
    _csgUsarNombres.forEach((nombre, i) => {
      const reg = { nombre, el: null, chips: [] };
      const fila = csgEl('div', 'csg-usar-var');
      const id = 'csg-usar-v-' + i;          // un id NUESTRO: el nombre es de la persona
      const lab = csgEl('label', '', '{{' + nombre + '}}');
      lab.htmlFor = id;
      const inp = csgEl('input', 'csg-input');
      inp.type = 'text';
      inp.id = id;
      inp.autocomplete = 'off';
      inp.setAttribute('enterkeyhint', i < _csgUsarNombres.length - 1 ? 'next' : 'done');
      inp.value = _csgUsarValores[nombre] || '';
      inp.addEventListener('input', () => {
        _csgUsarValores[nombre] = inp.value;
        csgUsarMarcaUltimos(reg);
        csgUsarRefrescar();
      });
      /* Intro pasa al siguiente hueco vacío, o baja el teclado: en una
         tableta la tecla de intro de un campo de una línea es la única
         forma de quitarlo, y el siguiente paso es tocar Copiar. */
      inp.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const sig = _csgUsarEl && _csgUsarEl.inputs.find(r => r !== reg && !String(r.el.value || '').trim());
        if (sig) { try { sig.el.focus(); } catch (er) {} } else inp.blur();
      });
      reg.el = inp;
      fila.appendChild(lab);
      fila.appendChild(inp);
      caja.appendChild(fila);
      /* Los chips van DENTRO del renglón de su variable, en una línea
         propia debajo: pegados a la que rellenan, no sueltos entre dos. */
      const ult = csgVarsUltimos(p.id, nombre);
      if (ult.length) {
        const fu = csgEl('div', 'csg-usar-ultimos csg-desliza');
        ult.forEach(v => {
          const c = csgEl('button', 'csg-chip', csgUsarCorto(v, 40));
          c.type = 'button';
          /* Tocar un chip no se lleva el foco del recuadro: así el
             teclado no baja y sube entre un valor y el siguiente. */
          c.addEventListener('pointerdown', e => e.preventDefault());
          c.addEventListener('click', () => {
            inp.value = v;
            _csgUsarValores[nombre] = v;
            csgUsarMarcaUltimos(reg);
            csgUsarRefrescar();
          });
          reg.chips.push({ v, el: c });
          fu.appendChild(c);
        });
        fila.appendChild(fu);
      }
      el.inputs.push(reg);
      csgUsarMarcaUltimos(reg);
    });
    cuerpo.appendChild(caja);
  }

  /* 4 · Lo que falta, nombrado (regla 6). */
  el.falta = csgEl('div', 'csg-usar-falta');
  cuerpo.appendChild(el.falta);

  /* 5 · Lo que se copia, tal cual. Con `pre-wrap` y 16 px (lo pone el
     CSS): es el recuadro que queda seleccionado si el portapapeles no
     deja escribir, y a menos de 16 px el iPad acerca la página. */
  cuerpo.appendChild(csgEl('p', 'csg-nota', 'Lo que se copia, tal cual:'));
  el.fallo = csgEl('p', 'csg-nota', 'No se pudo copiar solo. El texto quedó seleccionado: mantén pulsado encima y elige «Copiar».');
  csgUsarMuestra(el.fallo, false);
  cuerpo.appendChild(el.fallo);
  el.pre = csgEl('pre', 'csg-pre');
  el.pre.id = 'csg-usar-pre';
  cuerpo.appendChild(el.pre);

  /* 6 · El material, plegado: editable aquí y NO guardado. Es el texto al
     que se aplica la consigna (el informe, la nota), cambia en cada uso,
     y la pieza es la consigna, no el informe. */
  const det = csgEl('details', 'csg-material');
  el.matSum = csgEl('summary', '', '📎 Material');
  det.appendChild(el.matSum);
  const ta = csgEl('textarea', 'csg-material-ta csg-textarea');
  ta.rows = 6;
  ta.value = _csgUsarMaterial;
  ta.placeholder = 'Pega aquí el texto al que se aplica la consigna: un informe, una nota, una lista…';
  ta.setAttribute('aria-label', 'Material para este uso');
  ta.addEventListener('input', () => {
    _csgUsarMaterial = ta.value;
    csgUsarRefrescar();
  });
  det.appendChild(ta);
  det.appendChild(csgEl('p', 'csg-material-nota', 'Va debajo de la consigna, entre marcas. Lo que cambies aquí es solo para este uso: no se guarda con la pieza.'));
  el.material = ta;
  cuerpo.appendChild(det);

  /* 7 · Los botones pequeños que tocan a cada forma (sistema y encargo en
     xml; el archivo en un SKILL.md; el diagrama en un grafo) y el de
     copiar con los huecos puestos. */
  el.extra = csgEl('div', 'csg-usar-extra');
  cuerpo.appendChild(el.extra);
  el.extraNota = csgEl('p', 'csg-nota', '');
  cuerpo.appendChild(el.extraNota);

  /* 8 · Voz prestada, Careo e Investigación: lo que la máquina devuelva
     va derecho a 📖 La Voz Prestada, ya etiquetado (regla 14). Va al
     final de la hoja y no dentro del pie fijo: el pie son tres botones
     que tienen que caber en 320 px, y un cuarto los apretaría. */
  const molde = csgUsarMolde(p);
  if (molde && molde.vozPrestada) {
    el.voz = csgBtn('csg-btn-tenido csg-usar-voz', '📖', 'Guardar lo que devolvió', csgUsarVoz);
    cuerpo.appendChild(el.voz);
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Cuando la máquina conteste, cópialo entero y guárdalo en 📖 La Voz Prestada: allí se lee con su etiqueta puesta.'));
  }

  /* El pie fijo. Compartir solo donde existe navigator.share: un botón
     que siempre contesta «no se pudo» se lee como una avería. */
  el.copiar = csgBtn('csg-btn-lleno', '📋', 'Copiar', () => csgUsarCopiar('todo'));
  pie.appendChild(el.copiar);
  el.compartir = null;
  if (typeof navigator !== 'undefined' && navigator && typeof navigator.share === 'function') {
    el.compartir = csgBtn('csg-btn-neutro', '📤', 'Compartir', csgUsarCompartir);
    pie.appendChild(el.compartir);
  }
  el.abrir = csgBtn('csg-btn-tenido', '↗', 'Abrir', csgUsarAbrir);
  pie.appendChild(el.abrir);
}

/* El chip del último valor que coincide con lo escrito, marcado. */
function csgUsarMarcaUltimos(reg) {
  if (!reg || !reg.el) return;
  const v = String(reg.el.value || '').trim();
  reg.chips.forEach(c => {
    const on = !!v && c.v.trim() === v;
    c.el.classList.toggle('on', on);
    c.el.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function csgUsarPonMaquina(id) {
  if (!_csgUsarPieza || !_csgUsarEl) return;
  _csgUsarMaquina = csgMaquina(id).id;
  _csgUsarRep = csgUsarRepasa();
  csgUsarPintarRepaso();
  csgUsarRefrescar();
}

/* Lo que PARA y lo que avisa depende de la pieza y de la máquina, no de
   los valores: se pinta al abrir y al cambiar de máquina, no en cada
   tecla. */
function csgUsarPintarRepaso() {
  const el = _csgUsarEl;
  const rep = _csgUsarRep;
  if (!el || !rep) return;
  const para = el.para;
  para.textContent = '';
  csgUsarMuestra(para, rep.para.length > 0);
  if (rep.para.length) {
    /* La caja es una fila que se parte: arriba, la frase y «✎ Corregir»
       pegado a ella; debajo, cada cosa que para en su propio renglón y a
       todo lo ancho. Metidas junto a la frase, el botón les robaba el
       ancho y el ● se quedaba solo en un renglón. */
    para.appendChild(csgEl('span', '', rep.para.length === 1
      ? 'Todavía no se puede usar: hay una cosa que arreglar.'
      : 'Todavía no se puede usar: hay ' + rep.para.length + ' cosas que arreglar.'));
    para.appendChild(csgBtn('csg-btn-sm csg-btn-neutro', '✎', 'Corregir', csgUsarCorregir));
    rep.para.forEach(x => para.appendChild(csgUsarAviso('csg-aviso-para', (x && x.msg) || '')));
  }
  const av = el.avisa;
  av.textContent = '';
  csgUsarMuestra(av, rep.avisa.length > 0);
  if (rep.avisa.length) {
    av.appendChild(csgEl('summary', '', '▲ ' + (rep.avisa.length === 1 ? '1 aviso' : rep.avisa.length + ' avisos')));
    rep.avisa.forEach(x => av.appendChild(csgUsarAviso('csg-rep-item csg-aviso-avisa', (x && x.msg) || '')));
  }
}

/* Vuelve a armar con la máquina, los valores y el material de ahora, y
   repinta lo que depende de eso. Lo que se pinta en el <pre> es lo que
   se guarda en _csgUsarArmado, y lo que se copia sale de ahí: el mismo
   objeto, no un segundo armado (regla 1). */
/* Lo que el navegador deja libre al pie al seguir al cursor: el alto de
   verdad del pie pegado, más un respiro (ver .fin-modal.csg-modal en
   consigna.css). Medido y no escrito, porque el pie cambia de alto. */
function csgUsarAltoPie() {
  const pie = document.getElementById('csg-usar-pie');
  const hoja = pie && pie.closest ? pie.closest('.fin-modal') : null;
  if (!pie || !hoja) return;
  const h = pie.offsetHeight;
  if (h) hoja.style.scrollPaddingBottom = (h + 12) + 'px';
}

function csgUsarRefrescar() {
  const el = _csgUsarEl;
  const p = _csgUsarPieza;
  if (!el || !p) return;
  const maq = csgMaquina(_csgUsarMaquina);
  el.chips.forEach(c => {
    const on = c.id === maq.id;
    c.el.classList.toggle('on', on);
    c.el.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  let a = null;
  try { a = csgArmar(p, maq.id, _csgUsarValores, { material: _csgUsarMaterial }); } catch (e) { a = null; }
  if (!a) a = { forma: maq.forma, principal: '', sistema: '', encargo: '', skill: '', mermaid: '', plan: '' };
  ['principal', 'sistema', 'encargo', 'skill', 'mermaid', 'plan'].forEach(k => { a[k] = String(a[k] == null ? '' : a[k]); });
  _csgUsarArmado = a;
  const d = csgUsarDestino(maq.id, a.principal, p);
  el.nota.textContent = (maq.nota || '') + (d.ligado ? ' Se abre el cuaderno ligado a esta consigna.' : '');

  const faltan = csgUsarFaltan();
  el.falta.textContent = '';
  if (faltan.length) {
    el.falta.appendChild(csgEl('span', '', (faltan.length === 1 ? 'Falta ' : 'Faltan ') + csgUsarLista(faltan) + ': escríbel' +
      (faltan.length === 1 ? 'a' : 'as') + ' arriba, o usa «Copiar con huecos» para copiar' + (faltan.length === 1 ? 'la' : 'las') +
      ' con las llaves puestas.'));
  }
  csgUsarMuestra(el.falta, faltan.length > 0);

  csgUsarPintarPre(a.principal, faltan);

  const n = csgLargoTexto(_csgUsarMaterial);
  el.matSum.textContent = '📎 Material' + (String(_csgUsarMaterial).trim()
    ? ' · ' + csgMiles(n) + ' caracteres' + (n > CSG_TOPES.material ? ' (no va con la pieza: solo para este uso)' : '')
    : ' · vacío');

  csgUsarPintarExtra(faltan);

  /* El pie. Con algo que PARA, apagados y no quitados: un botón que
     desaparece se lee como un fallo de la pantalla; uno apagado que al
     tocarlo dice por qué, no. Por eso aria-disabled y no `disabled`: un
     botón `disabled` no recibe el toque y no podría decir nada. */
  const apagado = _csgUsarRep && _csgUsarRep.para.length > 0;
  [el.copiar, el.compartir, el.abrir].forEach(b => {
    if (!b) return;
    if (apagado) b.setAttribute('aria-disabled', 'true');
    else b.removeAttribute('aria-disabled');
  });
  csgUsarMuestra(el.abrir, !!d.url);
  const t = el.abrir.querySelector('.csg-btn-t');
  if (t) t.textContent = 'Abrir ' + (d.ligado ? 'su cuaderno' : maq.nombre) + (d.lleno ? '' : ' (copiado: pega ahí)');
  csgUsarAltoPie();
}

/* El texto armado en el <pre>, troceado a mano para marcar en ámbar lo
   que queda sin rellenar: <span class="csg-var"> con textContent, nunca
   innerHTML (regla 15). Solo se marcan los huecos que se PREGUNTAN y
   siguen vacíos: unas llaves dentro de un bloque de código, o dentro del
   material, se copian tal cual a propósito, y pintarlas de «falta» diría
   que falta algo que nadie tiene que escribir. */
function csgUsarPintarPre(texto, faltan) {
  const pre = _csgUsarEl && _csgUsarEl.pre;
  if (!pre) return;
  pre.textContent = '';
  const s = String(texto == null ? '' : texto);
  const vacias = new Set(Array.isArray(faltan) ? faltan : []);
  const re = /\{\{\s*([a-záéíóúñ0-9_]+)\s*\}\}/gi;
  let i = 0;
  let m;
  while ((m = re.exec(s))) {
    if (!vacias.has(m[1])) continue;
    if (m.index > i) pre.appendChild(document.createTextNode(s.slice(i, m.index)));
    pre.appendChild(csgEl('span', 'csg-var', m[0]));
    i = m.index + m[0].length;
  }
  if (i < s.length) pre.appendChild(document.createTextNode(s.slice(i)));
}

function csgUsarFaltan() {
  return _csgUsarNombres.filter(n => !String(_csgUsarValores[n] == null ? '' : _csgUsarValores[n]).trim());
}

/* La fila de botones pequeños. Se rehace solo cuando cambia lo que la
   decide (la máquina, la forma, si falta algo, si para), no en cada
   tecla: rehacerla debajo del dedo le quitaría el botón a quien iba a
   tocarlo. */
function csgUsarPintarExtra(faltan) {
  const el = _csgUsarEl;
  const a = _csgUsarArmado;
  const p = _csgUsarPieza;
  if (!el || !a || !p) return;
  const molde = csgUsarMolde(p);
  const clase = (molde && molde.clase) || p.clase || 'prompt';
  const apagado = _csgUsarRep && _csgUsarRep.para.length > 0;
  const hay = {
    huecos: faltan.length > 0,
    sistema: a.forma === 'xml' && !!a.sistema.trim(),
    encargo: a.forma === 'xml' && !!a.sistema.trim() && !!a.encargo.trim(),
    skill: a.forma === 'skill',
    instruccion: a.forma === 'skill' && !!a.sistema.trim(),
    mmd: clase === 'grafo' && !!a.mermaid.trim(),
    plan: (clase === 'grafo' || clase === 'bucle') && !!a.plan.trim(),
  };
  const k = [_csgUsarMaquina, a.forma, apagado ? 1 : 0].concat(Object.keys(hay).map(x => hay[x] ? 1 : 0)).join('|');
  if (k === _csgUsarExtraK) return;
  _csgUsarExtraK = k;
  const box = el.extra;
  box.textContent = '';
  const mete = (cls, ic, txt, fn) => {
    const b = csgBtn('csg-btn-sm ' + cls, ic, txt, fn);
    if (apagado) b.setAttribute('aria-disabled', 'true');
    box.appendChild(b);
  };
  if (hay.huecos) mete('csg-btn-neutro', '📋', 'Copiar con huecos', () => csgUsarCopiar('huecos'));
  if (hay.sistema) mete('csg-btn-neutro', '📋', 'Copiar sistema', () => csgUsarCopiar('sistema'));
  if (hay.encargo) mete('csg-btn-neutro', '📋', 'Copiar encargo', () => csgUsarCopiar('encargo'));
  if (hay.skill) mete('csg-btn-ambar', '⬇', 'Descargar SKILL.md', csgUsarDescargarSkill);
  if (hay.instruccion) mete('csg-btn-neutro', '📋', 'Como instrucción de sistema', () => csgUsarCopiar('instruccion'));
  if (hay.mmd) mete('csg-btn-ambar', '⬇', 'grafo.mmd', csgUsarDescargarMmd);
  if (hay.plan) mete('csg-btn-neutro', '📋', 'Copiar el plan', () => csgUsarCopiar('plan'));
  csgUsarMuestra(box, box.children.length > 0);

  /* Dónde va cada cosa, dicho una vez debajo: un «Copiar sistema» que no
     dice adónde se pega se toca, se copia y se queda en el portapapeles. */
  let nota = '';
  if (hay.sistema) nota = 'El sistema va en las instrucciones de un Proyecto de Claude; el encargo, en el chat. «Copiar» lleva los dos juntos.';
  if (hay.skill) {
    const nombre = String(csgTextoDe(p, 'nombre') || '').trim() || csgSlug(p.titulo) || 'su-nombre';
    nota = 'El SKILL.md va en .claude/skills/' + nombre + '/SKILL.md en Claude Code, o en claude.ai: Ajustes → Capacidades → Habilidades.' +
      (hay.instruccion ? ' «Como instrucción de sistema» son los mismos bloques en texto seguido, para un Gem, un GPT o un Proyecto.' : '');
  }
  if (hay.mmd) nota = 'grafo.mmd es el diagrama en Mermaid, para verlo en un editor que lo pinte. «Copiar» lleva el prompt para hacerlo en un solo chat.';
  el.extraNota.textContent = nota;
  csgUsarMuestra(el.extraNota, !!nota);
}

/* ¿Se puede sacar esto? Si no, lo DICE y devuelve false. Con algo que
   PARA, nada sale (regla 5: guardar nunca se bloquea; usar sí). Con una
   variable vacía, nada sale salvo «Copiar con huecos» (regla 6), y el
   foco va a la que falta DENTRO del toque, para que salga el teclado. */
function csgUsarPuede(que) {
  const rep = _csgUsarRep || { para: [] };
  if (rep.para.length) {
    csgAviso('Todavía no se puede usar: ' + String((rep.para[0] && rep.para[0].msg) || 'falta algo.'));
    try { _csgUsarEl.para.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    return false;
  }
  if (que === 'huecos' || que === 'mmd') return true;
  const f = csgUsarFaltan();
  if (f.length) {
    const reg = _csgUsarEl && _csgUsarEl.inputs.find(r => r.nombre === f[0]);
    if (reg) { try { reg.el.focus(); } catch (e) {} }
    csgAviso((f.length === 1 ? 'Falta ' : 'Faltan ') + csgUsarLista(f) + ': escríbel' + (f.length === 1 ? 'a' : 'as') + ', o usa «Copiar con huecos».');
    return false;
  }
  return true;
}

function csgUsarTexto(que) {
  const a = _csgUsarArmado || {};
  if (que === 'sistema' || que === 'instruccion') return String(a.sistema || '');
  if (que === 'encargo') return String(a.encargo || '');
  if (que === 'plan') return String(a.plan || '');
  return String(a.principal || '');
}

/* Lo que hace falta para apuntar un uso, tomado EN EL TOQUE: compartir
   vuelve cuando la persona eligió a quién, y para entonces la hoja puede
   estar cerrada o con otros valores. */
function csgUsarFoto() {
  const vals = Object.create(null);
  _csgUsarNombres.forEach(n => { vals[n] = String(_csgUsarValores[n] == null ? '' : _csgUsarValores[n]); });
  return { p: _csgUsarPieza, maq: csgMaquina(_csgUsarMaquina).id, nombres: _csgUsarNombres.slice(), valores: vals, material: _csgUsarMaterial };
}

/* Apuntar el uso: los valores (tres últimos por variable), la máquina, y
   UN uso con ok: null (csgApuntarUso ya lo guarda y lo sube solo; un
   csgSubirLuego a secas después contaría como edición y pondría el reloj).
   ⚠️ Copiar y después ↗ Abrir con lo mismo es UN uso, no dos: la
   bitácora pregunta «¿sirvió?» por cada uso, y dos entradas por una sola
   vez convierten la pregunta en ruido. Lo que cuenta como otro uso es
   otra máquina, otros valores u otro material. */
function csgUsarApuntar(foto) {
  const f = foto || csgUsarFoto();
  if (!f.p) return;
  csgVarsApunta(f.p.id, f.nombres, f.valores);
  if (typeof csgMaquinaApunta === 'function') csgMaquinaApunta(f.maq);
  const huella = f.p.id + '\u0001' + f.maq + '\u0001' + JSON.stringify(f.nombres.map(n => f.valores[n].trim())) + '\u0001' + f.material;
  if (huella === _csgUsarApuntado) return;
  _csgUsarApuntado = huella;
  csgApuntarUso(f.p, f.maq);
  if (typeof csgPintarAnaquel === 'function') { try { csgPintarAnaquel(); } catch (e) {} }
}

/* 📋 Copiar, en todas sus formas. ⚠️ csgCopiarTexto se llama DENTRO del
   toque y sin ningún `await` delante: el Safari de un iPad solo deja
   escribir en el portapapeles mientras dura el gesto. */
function csgUsarCopiar(que) {
  if (!_csgUsarPieza || !_csgUsarArmado) return;
  if (!csgUsarPuede(que)) return;
  const texto = csgUsarTexto(que);
  if (!texto.trim()) { csgAviso('No hay nada que copiar todavía'); return; }
  const copia = csgCopiarTexto(texto);
  const maq = csgMaquina(_csgUsarMaquina);
  const huecos = csgUsarFaltan();
  if (_csgUsarEl) csgUsarMuestra(_csgUsarEl.fallo, false);
  /* El plan es para LEER (§3.3): copiarlo no es usar la consigna. */
  if (que !== 'plan') csgUsarApuntar();
  copia.then(ok => {
    if (!ok) { csgUsarFallo(false); return; }
    let msg = '📋 Copiado' + (maq.donde ? ': pégalo en ' + maq.donde : ': pégalo donde lo vayas a usar');
    if (que === 'huecos') msg = '📋 Copiado con ' + (huecos.length === 1 ? 'un hueco' : huecos.length + ' huecos') + ': ' + huecos.map(n => '{{' + n + '}}').join(', ');
    else if (que === 'sistema') msg = '📋 Copiado el sistema: va en las instrucciones del Proyecto';
    else if (que === 'encargo') msg = '📋 Copiado el encargo: pégalo en el chat';
    else if (que === 'instruccion') msg = '📋 Copiada como instrucción de sistema: va en un Gem, un GPT o un Proyecto';
    else if (que === 'plan') msg = '📋 Copiado el plan';
    csgAviso(msg);
  });
}

/* Cuando el portapapeles no deja escribir: el texto queda SELECCIONADO en
   el <pre> y la hoja dice cómo copiarlo a mano. Un «no se pudo» a secas
   deja a alguien con el texto delante y sin saber qué hacer con él. */
function csgUsarFallo(callado) {
  const el = _csgUsarEl;
  if (!el) { if (!callado) csgAviso('No se pudo copiar'); return; }
  csgUsarMuestra(el.fallo, true);
  try {
    const sel = window.getSelection();
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(el.pre);
    sel.addRange(r);
  } catch (e) {}
  try { el.fallo.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) {}
  if (!callado) csgAviso('No se pudo copiar solo: el texto quedó seleccionado; mantén pulsado para copiarlo');
}

/* 📤 Compartir: el MISMO texto que Copiar, y nada más (ni un título
   delante: algunas aplicaciones lo pegan al principio, y lo que llegaría
   ya no sería lo que se vio). El uso se apunta cuando la persona
   compartió de verdad; cancelar la hoja del sistema no es usar. */
function csgUsarCompartir() {
  if (!_csgUsarPieza || !_csgUsarArmado) return;
  if (!csgUsarPuede('todo')) return;
  const texto = String(_csgUsarArmado.principal || '');
  if (!texto.trim()) { csgAviso('No hay nada que compartir todavía'); return; }
  if (typeof navigator === 'undefined' || !navigator || typeof navigator.share !== 'function') { csgUsarCopiar('todo'); return; }
  const foto = csgUsarFoto();
  let pr;
  try { pr = navigator.share({ text: texto }); } catch (e) { pr = Promise.reject(e); }
  Promise.resolve(pr).then(() => csgUsarApuntar(foto), e => {
    if (e && e.name === 'AbortError') return;
    csgAviso('No se pudo compartir: usa 📋 Copiar');
  });
}

/* ↗ Abrir: copia primero, siempre (csgAbrirMaquina), y apunta el uso
   DESPUÉS de abrir, para que la ventana salga lo más pegada posible al
   toque: los navegadores solo dejan abrir ventanas mientras dura el
   gesto. */
function csgUsarAbrir() {
  if (!_csgUsarPieza || !_csgUsarArmado) return;
  if (!csgUsarPuede('todo')) return;
  const texto = String(_csgUsarArmado.principal || '');
  if (!texto.trim()) { csgAviso('No hay nada que llevar todavía'); return; }
  const foto = csgUsarFoto();
  if (_csgUsarEl) csgUsarMuestra(_csgUsarEl.fallo, false);
  const r = csgAbrirMaquina(foto.maq, texto, foto.p);
  csgUsarApuntar(foto);
  if (r && r.copia) r.copia.then(ok => { if (!ok) csgUsarFallo(true); });
}

/* Descargar un archivo hecho aquí (Blob): no pasa por ninguna red.
   ⚠️ El enlace se revoca DESPUÉS, no en el acto: en Android la descarga
   empieza cuando ya se volvió de click(), y revocar enseguida la cancela
   sin ningún aviso. La dirección que va al href es un blob: nuestro, y el
   nombre del archivo, un literal. */
function csgUsarDescargar(nombre, texto, tipo) {
  try {
    const blob = new Blob([String(texto == null ? '' : texto)], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', nombre);
    a.setAttribute('rel', 'noopener');
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 4000);
    return true;
  } catch (e) {
    return false;
  }
}

/* ⬇ SKILL.md: bajarse el archivo ES usar la habilidad (así se instala),
   así que cuenta como uso y se para igual que Copiar. */
function csgUsarDescargarSkill() {
  if (!_csgUsarPieza || !_csgUsarArmado) return;
  if (!csgUsarPuede('todo')) return;
  const texto = String(_csgUsarArmado.skill || _csgUsarArmado.principal || '');
  if (!texto.trim()) { csgAviso('No hay nada que descargar todavía'); return; }
  const ok = csgUsarDescargar('SKILL.md', texto, 'text/markdown;charset=utf-8');
  if (!ok) { csgAviso('Este navegador no dejó descargar: usa 📋 Copiar y guárdalo como SKILL.md'); return; }
  csgUsarApuntar();
  csgAviso('⬇ SKILL.md descargado: va en .claude/skills/<nombre>/SKILL.md, o en Ajustes → Capacidades → Habilidades');
}

/* ⬇ grafo.mmd: el DIAGRAMA, para verlo; no es la consigna que se le da a
   una máquina, así que no cuenta como uso. Con huecos se baja igual —es
   un dibujo— y se dice. */
function csgUsarDescargarMmd() {
  if (!_csgUsarPieza || !_csgUsarArmado) return;
  if (!csgUsarPuede('mmd')) return;
  const texto = String(_csgUsarArmado.mermaid || '');
  if (!texto.trim()) { csgAviso('Este grafo todavía no tiene nodos'); return; }
  const ok = csgUsarDescargar('grafo.mmd', texto, 'text/plain;charset=utf-8');
  const f = csgUsarFaltan();
  if (!ok) { csgAviso('Este navegador no dejó descargar'); return; }
  csgAviso('⬇ grafo.mmd descargado' + (f.length ? ' · con ' + (f.length === 1 ? 'un hueco: ' : f.length + ' huecos: ') + f.map(n => '{{' + n + '}}').join(', ') : ''));
}

/* ✎ Corregir: al compositor, con el foco en lo PRIMERO que para. */
function csgUsarCorregir() {
  const p = _csgUsarPieza;
  if (!p) return;
  const para = (_csgUsarRep && _csgUsarRep.para) || [];
  const x = para.find(y => y && (y.bloque || (y.arreglo && y.arreglo.bloque))) || {};
  const foco = x.bloque || (x.arreglo && x.arreglo.bloque) || '';
  csgUsarCerrar();
  if (typeof csgVerCerrar === 'function') csgVerCerrar();
  if (typeof csgAbrirCompositor === 'function') csgAbrirCompositor(p, { foco });
  else csgAviso('No se pudo abrir el compositor: vuelve a abrir F.A.R.O');
}

/* 📖 Guardar lo que devolvió: dos funciones que ya existen en La Voz
   Prestada, y ni una línea en voz-prestada.js (regla 14). */
function csgUsarVoz() {
  csgUsarCerrar();
  if (typeof switchView === 'function') switchView('view-voz');
  if (typeof vozAbrirPegar === 'function') vozAbrirPegar(null);
  else csgAviso('La Voz Prestada no está cargada: vuelve a abrir F.A.R.O');
}

function csgUsarAbierta() {
  const ov = document.getElementById('csg-usar-overlay');
  return !!(ov && ov.style.display && ov.style.display !== 'none');
}

function csgUsarCerrar() {
  const ov = document.getElementById('csg-usar-overlay');
  if (ov) {
    /* Si el teclado estaba fuera por un recuadro de la hoja, baja con ella. */
    try { if (document.activeElement && ov.contains(document.activeElement)) document.activeElement.blur(); } catch (e) {}
    ov.style.display = 'none';
  }
  const cuerpo = document.getElementById('csg-usar-cuerpo');
  if (cuerpo) cuerpo.textContent = '';
  const pie = document.getElementById('csg-usar-pie');
  if (pie) pie.textContent = '';
  _csgUsarPieza = null;
  _csgUsarEl = null;
  _csgUsarArmado = null;
  _csgUsarRep = null;
  _csgUsarNombres = [];
  _csgUsarValores = Object.create(null);
  _csgUsarMaterial = '';
  _csgUsarExtraK = '';
}

/* ══════════════════════════════════════════════════════════════════
   📋 COPIAR DESDE EL MENÚ ⋯ (§8)
   ──────────────────────────────────────────────────────────────────
   Un toque, sin abrir nada: arma para SU máquina con los últimos valores
   de esa pieza. Si queda algún hueco, copia igual y el aviso lo nombra
   —no es en silencio (regla 6), y quien copia desde el menú es quien ya
   sabe lo que hace—; si algo PARA, no copia y abre la hoja de Usar para
   que se vea por qué. Devuelve la promesa del portapapeles.
   ══════════════════════════════════════════════════════════════════ */
function csgCopiarDirecto(pieza) {
  if (!pieza || typeof pieza !== 'object') return Promise.resolve(false);
  const maq = csgMaquina(pieza.maquina || csgMaquinaUltima());
  let rep = null;
  try { rep = csgRevisar(pieza, maq.id); } catch (e) { rep = null; }
  if (rep && Array.isArray(rep.para) && rep.para.length) {
    csgAbrirUsar(pieza, { maquina: maq.id });
    csgAviso('No se copió: ' + String((rep.para[0] && rep.para[0].msg) || 'falta algo.'));
    return Promise.resolve(false);
  }
  const nombres = csgUsarNombres(pieza);
  const valores = Object.create(null);       // sin prototipo: ver _csgUsarValores
  nombres.forEach(n => { valores[n] = csgVarsUltimos(pieza.id, n)[0] || ''; });
  let material = String(pieza.material || '');
  if (!material.trim() && typeof csgBorradorMaterial === 'function') {
    try { material = String(csgBorradorMaterial(pieza.id) || '') || material; } catch (e) {}
  }
  let a = null;
  try { a = csgArmar(pieza, maq.id, valores, { material }); } catch (e) { a = null; }
  const texto = String((a && a.principal) || '');
  if (!texto.trim()) { csgAviso('No hay nada que copiar todavía'); return Promise.resolve(false); }
  const copia = csgCopiarTexto(texto);          // ⚠️ dentro del toque
  const huecos = nombres.filter(n => !String(valores[n]).trim());
  if (typeof csgMaquinaApunta === 'function') csgMaquinaApunta(maq.id);
  csgApuntarUso(pieza, maq.id);
  return copia.then(ok => {
    if (ok) {
      csgAviso(huecos.length
        ? '📋 Copiado con ' + (huecos.length === 1 ? 'un hueco' : huecos.length + ' huecos') + ': ' + huecos.map(n => '{{' + n + '}}').join(', ')
        : '📋 Copiado para ' + maq.nombre);
    } else {
      /* Sin portapapeles: la hoja con el texto seleccionado. Se abre FUERA
         del toque, así que sin foco (no saldría el teclado a destiempo). */
      csgAbrirUsar(pieza, { maquina: maq.id, sinFoco: true });
      csgUsarFallo(false);
    }
    if (typeof csgPintarAnaquel === 'function') { try { csgPintarAnaquel(); } catch (e) {} }
    return ok;
  });
}

/* ══════════════════════════════════════════════════════════════════
   📋 PEGAR LO QUE YA TENGO (§5, paso 1-bis, y la propuesta del paso 8)
   ──────────────────────────────────────────────────────────────────
   Un recuadro, «Leer», y lo leído: la forma PROPUESTA en un chip (nunca
   impuesta: un toque la cambia), cómo se repartió, lo que no se entendió
   NOMBRADO con su renglón, y la cuenta de palabras que entraron y
   salieron. Nada se descarta (regla 8): la cuenta está a la vista para
   que eso no haya que creérselo.
   ⚠️ Esta hoja no guarda nada: abre el compositor con una pieza NUEVA
   sin guardar, y allí se revisa y se guarda. Un pegado que entrara solo
   al anaquel metería en él lo que el lector entendió mal sin que nadie
   lo haya mirado.
   ══════════════════════════════════════════════════════════════════ */

/* Lo que se entiende, dicho con las formas que se escriben de verdad. */
const CSG_PEG_ENTIENDE = [
  'encabezados: «## Tarea», «### Formato»',
  'etiquetas: <tarea>…</tarea>',
  'rótulos al principio del renglón: «Tarea:», «Contexto:»',
  'el frontmatter de un SKILL.md: --- name: … description: … ---',
  'flechas entre nombres: «Investigador → Guionista»',
  '«Máximo 4 vueltas», «Para cuando…», «Repite…»',
  'el material entre «=== Material ===» y «=== Fin del material ===»',
];

function csgAbrirPegar(texto) {
  csgUsarEngancha();
  const ov = document.getElementById('csg-pegar-overlay');
  const cuerpo = document.getElementById('csg-pegar-cuerpo');
  if (!ov || !cuerpo) { csgAviso('No se pudo abrir la hoja de pegar: vuelve a abrir F.A.R.O'); return; }
  /* La hoja vertical («¿Qué le vas a pedir?», desde donde casi siempre se
     llega) va después en el documento y taparía esta. */
  if (typeof csgVerCerrar === 'function') csgVerCerrar();
  clearTimeout(_csgPegT);
  _csgPegT = null;
  _csgPegTexto = '';
  _csgPegLeido = null;
  _csgPegBase = null;
  _csgPegPieza = null;
  _csgPegElegido = '';
  cuerpo.textContent = '';
  const el = {};
  _csgPegEl = el;

  cuerpo.appendChild(csgEl('p', 'csg-nota', 'Pega un prompt, una habilidad, un grafo o un bucle que ya tengas: lo reparto en bloques y te propongo la forma. No se pierde ni una palabra.'));
  const que = csgEl('details', 'csg-nota');
  que.appendChild(csgEl('summary', '', 'Qué entiendo'));
  const ul = csgEl('ul', '');
  CSG_PEG_ENTIENDE.forEach(t => ul.appendChild(csgEl('li', '', t)));
  que.appendChild(ul);
  que.appendChild(csgEl('p', '', 'Lo que no entienda se queda como texto en su sitio, y te lo nombro con su renglón.'));
  cuerpo.appendChild(que);

  const ta = csgEl('textarea', 'csg-pegar-ta');
  ta.rows = 9;
  ta.placeholder = 'Pega aquí tu prompt, tu SKILL.md, tu grafo o tu bucle…';
  ta.setAttribute('aria-label', 'Lo que ya tienes escrito');
  ta.setAttribute('autocomplete', 'off');
  ta.spellcheck = false;
  /* Pegando se lee al instante (pegar es para lo que existe la hoja:
     ahorra el toque de «Leer»); escribiendo, tras un respiro. */
  ta.addEventListener('input', e => {
    clearTimeout(_csgPegT);
    const tipo = e && e.inputType ? String(e.inputType) : '';
    if (tipo === 'insertFromPaste' || tipo === 'insertFromDrop') { csgPegLeer('pegado'); return; }
    _csgPegT = setTimeout(() => csgPegLeer(''), CSG_PEG_RESPIRO);
  });
  el.ta = ta;
  cuerpo.appendChild(ta);

  const acc = csgEl('div', 'csg-pegar-acciones');
  if (csgPegHayPortapapeles()) acc.appendChild(csgBtn('csg-btn-tenido', '📋', 'Del portapapeles', csgPegPortapapeles));
  el.leer = csgBtn('csg-btn-lleno', '🔎', 'Leer', () => csgPegLeer('boton'));
  acc.appendChild(el.leer);
  cuerpo.appendChild(acc);

  el.res = csgEl('div', '');
  csgUsarMuestra(el.res, false);
  cuerpo.appendChild(el.res);

  ov.style.display = 'flex';
  const modal = ov.querySelector('.fin-modal');
  if (modal) modal.scrollTop = 0;
  const t = String(texto == null ? '' : texto);
  ta.value = t;
  /* Con texto ya puesto se lee sin esperar a nadie; sin texto, el foco al
     recuadro DENTRO del toque, para que el teclado —y su «Pegar»— salga
     solo. */
  if (t.trim()) csgPegLeer('');
  else { try { ta.focus(); } catch (e) {} }
}

/* El botón del portapapeles nace escondido donde el navegador no deja
   leerlo: un botón que siempre contesta «no pude» se lee como una
   avería (La Voz Prestada, regla 38). */
function csgPegHayPortapapeles() {
  try { return !!(typeof navigator !== 'undefined' && navigator && navigator.clipboard && typeof navigator.clipboard.readText === 'function'); }
  catch (e) { return false; }
}
function csgPegPortapapeles() {
  let pr;
  try { pr = navigator.clipboard.readText(); } catch (e) { pr = Promise.reject(e); }
  Promise.resolve(pr).then(t => {
    const el = _csgPegEl;
    if (!el) return;
    if (!t || !String(t).trim()) { csgAviso('El portapapeles está vacío: copia primero lo que quieras traer.'); return; }
    el.ta.value = String(t);
    csgPegLeer('boton');
  }, () => {
    /* Y si no dejó, se dice CÓMO hacerlo a mano. */
    csgAviso('El navegador no dejó leer el portapapeles: mantén tocado el recuadro y dale a «Pegar».');
  });
}

/* modo: 'boton' (se tocó Leer o el portapapeles), 'pegado' (se acaba de
   pegar en el recuadro) o '' (el respiro de escribir, o al abrir). */
function csgPegLeer(modo) {
  const desdeBoton = modo === 'boton';
  clearTimeout(_csgPegT);
  _csgPegT = null;
  const el = _csgPegEl;
  if (!el) return;
  const texto = String(el.ta.value || '');
  if (!texto.trim()) {
    _csgPegTexto = '';
    _csgPegLeido = null;
    _csgPegBase = null;
    _csgPegPieza = null;
    csgPegPintar();
    if (desdeBoton) { csgAviso('Pega primero lo que ya tienes'); try { el.ta.focus(); } catch (e) {} }
    return;
  }
  let r = null;
  try { r = csgLeer(texto); } catch (e) {
    csgAviso('No se pudo leer: ' + ((e && e.message) || e));
    return;
  }
  _csgPegTexto = texto;
  _csgPegLeido = r;
  _csgPegBase = csgPegPieza(r);
  /* Si la persona ya había elegido otra forma, se respeta al volver a
     leer: corregir una coma en el recuadro no le deshace la elección. */
  if (_csgPegElegido && _csgPegElegido !== r.molde && Object.prototype.hasOwnProperty.call(CSG_MOLDES, _csgPegElegido) &&
      typeof csgDuplicarEnMolde === 'function') {
    _csgPegPieza = csgDuplicarEnMolde(_csgPegBase, _csgPegElegido);
  } else {
    _csgPegElegido = '';
    _csgPegPieza = _csgPegBase;
  }
  csgPegPintar();
  if (desdeBoton) {
    /* El botón ya se llevó el foco (y en la tableta, el teclado): se
       enseña lo leído, que es lo que se vino a ver. */
    try { el.res.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) {}
  } else if (modo === 'pegado') {
    /* Recién pegado, el teclado sigue fuera y lo leído queda debajo de
       él: se asoma lo justo para que se vea la propuesta, sin quitarle
       el foco al recuadro (quien pega a veces sigue escribiendo). */
    try { el.res.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }
}

/* La pieza NUEVA, sin guardar, con lo que leyó el lector en el molde que
   propuso. Sale de csgNuevaPieza para que traiga TODOS los campos de una
   pieza y los `inicial` del molde (la etiqueta de Voz prestada, el tope
   de Por lotes); lo leído PISA el inicial cuando trae texto, y lo que el
   molde no tiene va al final como bloque libre con su rótulo. Un bloque
   leído vacío no borra el inicial: un «## Tope» sin nada debajo no es
   una decisión de quitarlo. */
function csgPegPieza(r) {
  const p = csgNuevaPieza(r.clase, r.molde);
  const porId = new Map();
  p.bloques.forEach(b => porId.set(String(b.id), b));
  const puestos = new Set();
  (Array.isArray(r.bloques) ? r.bloques : []).forEach(b => {
    if (!b || b.id === undefined || b.id === null || b.id === '') return;
    const id = String(b.id);
    const t = String(b.t == null ? '' : b.t);
    const ya = porId.get(id);
    if (ya) {
      if (!t.trim()) return;
      /* Un id que llega dos veces se junta con una línea en blanco: el
         segundo también es texto de alguien. */
      ya.t = puestos.has(id) && String(ya.t).trim() ? String(ya.t) + '\n\n' + t : t;
      puestos.add(id);
      return;
    }
    const nb = { id, rotulo: String(b.rotulo || id), t };
    porId.set(id, nb);
    puestos.add(id);
    p.bloques.push(nb);
  });
  p.titulo = csgCorta(String(r.titulo || '').replace(/\s+/g, ' ').trim(), CSG_TOPES.titulo);
  p.material = String(r.material || '');
  return p;
}

/* Cuántos bloques del molde tienen texto de la persona (sin contar los
   `inicial`, que no los escribió nadie), sobre cuántos tiene el molde. */
function csgPegContar(p) {
  const molde = csgUsarMolde(p);
  if (!molde) return { n: 0, total: 0 };
  const n = molde.bloques.filter(e => {
    const t = String(csgTextoDe(p, e.id) || '').trim();
    const ini = String(csgBloqueDef(molde.id, e.id).inicial || '').trim();
    return !!t && t !== ini;
  }).length;
  return { n, total: molde.bloques.length };
}

/* La cuenta de «nada se descarta» (§5, paso 9), como la hace la prueba de
   Node: lo que salió es título + bloques + material, más lo que se leyó
   como FORMA (los rótulos, que ahora son la forma de los bloques) y
   menos lo que el lector PUSO sin estar escrito (los nombres de nodo que
   saca de las flechas). Sin esas dos, un «## Tarea» contaría como una
   palabra perdida y el aviso mentiría en cada pegado. */
function csgPegCuenta(r, texto) {
  const suma = l => (Array.isArray(l) ? l : []).reduce((s, t) => s + csgPalabras(t), 0);
  const entran = csgPalabras(texto);
  const contenido = csgPalabras(r.titulo) + suma((r.bloques || []).map(b => b && b.t)) + csgPalabras(r.material);
  const forma = suma(r.estructura);
  const puestas = suma(r.anadido);
  return { entran, salen: contenido + forma - puestas, forma, puestas };
}

function csgPegPintar() {
  const el = _csgPegEl;
  if (!el) return;
  const res = el.res;
  res.textContent = '';
  const r = _csgPegLeido;
  const p = _csgPegPieza;
  /* Leído ya, lo principal es abrir: «Leer» pasa a teñido y el lleno es
     «Abrir en el compositor». Dos botones llenos a la vez no dicen cuál
     es el siguiente paso. */
  el.leer.classList.toggle('csg-btn-lleno', !r);
  el.leer.classList.toggle('csg-btn-tenido', !!r);
  if (!r || !p) { csgUsarMuestra(res, false); return; }
  csgUsarMuestra(res, true);

  const molde = csgUsarMolde(p);
  const clase = csgClaseDe((molde && molde.clase) || p.clase);
  const propio = p.molde === r.molde;
  const prop = r.propuesta || {};
  const cuenta = propio ? { n: prop.reconocidos || 0, total: prop.total || 0 } : csgPegContar(p);
  /* «una Habilidad», «un Prompt»: el chip se lee en voz alta. */
  const art = clase.id === 'habilidad' ? 'una' : 'un';

  /* 1 · La propuesta, en un chip que se toca para cambiarla. */
  /* Sin la clase .csg-chip a propósito: el chip de la casa es de un
     renglón que no se parte, y esta frase no cabe en 390 px; cortada, se
     perdía justo el «cambiar», que es lo que dice que se toca. El texto
     va en un <span> para que la caja (flex que se parte) lo reparta. */
  const chip = csgEl('button', 'csg-pegar-propuesta csg-clase-' + clase.id);
  chip.appendChild(csgEl('span', '', (propio ? 'Parece ' : 'Va como ') + art + ' ' + clase.ic + ' ' + clase.nombre + ' · ' +
    (molde ? molde.nombre : String(p.molde || '')) + ' · ' + cuenta.n + ' de ' + cuenta.total + ' bloques · cambiar'));
  chip.type = 'button';
  chip.addEventListener('click', csgPegCambiar);
  res.appendChild(chip);
  res.appendChild(csgEl('p', 'csg-nota', propio
    ? 'Es una propuesta: tócala para elegir otra forma. Cambiarla no pierde nada.'
    : 'La forma la elegiste tú. Lo que no encontró sitio va al final, marcado para colocarlo o quitarlo.'));

  /* 2 · La cuenta, a la vista: que no se perdió nada no hay que
     creérselo. Si un día no cuadra, lo dice en rojo antes de abrir. */
  const c = csgPegCuenta(r, _csgPegTexto);
  const pal = n => csgMiles(n) + (n === 1 ? ' palabra' : ' palabras');
  let txt;
  if (c.entran === c.salen) {
    txt = '✓ ' + pal(c.entran) + (c.entran === 1 ? ' entró, ' : ' entraron, ') + csgMiles(c.salen) + (c.salen === 1 ? ' salió' : ' salieron') + ': no se perdió ninguna.';
    if (c.forma) txt += ' ' + csgMiles(c.forma) + (c.forma === 1 ? ' era un rótulo y ahora es' : ' eran rótulos y ahora son') + ' la forma de los bloques.';
    if (c.puestas) txt += ' Los nombres de los nodos se sacaron de las flechas.';
  } else {
    txt = '⚠ ' + pal(c.entran) + (c.entran === 1 ? ' entró' : ' entraron') + ' y ' + csgMiles(c.salen) + (c.salen === 1 ? ' salió' : ' salieron') +
      ': revisa el reparto antes de abrirlo.';
  }
  const cu = csgEl('p', 'csg-pegar-cuenta' + (c.entran === c.salen ? '' : ' csg-aviso-para'));
  cu.appendChild(csgEl('span', '', txt));
  res.appendChild(cu);

  /* 3 · Lo que no se entendió del todo, NOMBRADO con su renglón: un
     rechazo callado se ve desde fuera igual que un rechazo, y se vuelve a
     pegar lo mismo. */
  const avisos = Array.isArray(r.avisos) ? r.avisos : [];
  if (avisos.length) {
    const av = csgEl('div', 'csg-pegar-avisos');
    av.appendChild(csgVerSep('Lo que conviene mirar (' + avisos.length + ')'));
    avisos.forEach(a => av.appendChild(csgUsarAviso('csg-aviso-avisa', (a && a.texto) || '')));
    res.appendChild(av);
  }

  /* 4 · Abrir. Es el paso que sigue, y va antes del detalle del reparto:
     el reparto se vuelve a ver entero en el compositor. */
  const acc = csgEl('div', 'csg-pegar-acciones');
  acc.appendChild(csgBtn('csg-btn-lleno', '✏️', 'Abrir en el compositor', csgPegAbrirCompositor));
  res.appendChild(acc);

  /* 5 · Cómo se repartió: rótulo y primeras palabras de cada bloque. */
  res.appendChild(csgVerSep('Así lo repartí'));
  res.appendChild(csgEl('p', 'csg-nota', p.titulo ? 'Título: ' + p.titulo : 'Sin título: el compositor lo propone desde lo escrito.'));
  const ul = csgEl('ul', 'csg-pegar-bloques');
  (Array.isArray(p.bloques) ? p.bloques : []).forEach(b => {
    if (!b || !String(b.t == null ? '' : b.t).trim()) return;
    const def = csgBloqueDef(p.molde, b.id);
    const li = csgEl('li', '');
    li.appendChild(csgEl('b', '', def.libre ? String(b.rotulo || b.id) : String(def.rotulo || b.id)));
    li.appendChild(document.createTextNode(' · ' + csgUsarCorto(b.t, 90)));
    if (def.libre) {
      li.appendChild(csgEl('span', 'csg-nota', b.traido
        ? ' — traído de «' + b.traido + '»: colócalo o quítalo'
        : ' — bloque libre: sale al final con su rótulo'));
    }
    ul.appendChild(li);
  });
  res.appendChild(ul);
  if (molde) {
    const faltan = molde.bloques
      .filter(e => e.ob && !String(csgTextoDe(p, e.id) || '').trim())
      .map(e => csgBloqueDef(molde.id, e.id).rotulo);
    if (faltan.length) res.appendChild(csgEl('p', 'csg-nota', 'Le ' + (faltan.length === 1 ? 'falta' : 'faltan') + ' a ' + molde.nombre + ': ' + faltan.join(', ') + '. Se escribe' + (faltan.length === 1 ? '' : 'n') + ' en el compositor.'));
  }
  const mat = String(p.material || '');
  if (mat.trim()) {
    const n = csgLargoTexto(mat);
    res.appendChild(csgEl('p', 'csg-nota', '📎 Material aparte: ' + csgMiles(n) + ' caracteres' +
      (n > CSG_TOPES.material ? ' (pasa de 20.000: no se guardará con la pieza, pero se usa)' : '') + '.'));
  }
  const vars = (Array.isArray(r.variables) ? r.variables : []).filter(v => CSG_RESERVADAS.indexOf(v) < 0);
  res.appendChild(csgEl('p', 'csg-nota', vars.length ? 'Variables: ' + vars.map(v => '{{' + v + '}}').join(' · ') : 'Sin variables.'));
}

/* «cambiar»: los diecisiete moldes, por clase y con su «cuándo», en la
   hoja vertical (que va encima de esta). Se reparte SIEMPRE desde lo que
   leyó el lector, no desde el último cambio: ir y volver entre dos moldes
   no puede ir acumulando bloques «traídos». */
function csgPegCambiar() {
  if (!_csgPegLeido || !_csgPegBase) return;
  const r = _csgPegLeido;
  csgVerAbrir('¿Qué forma le doy?', cuerpo => {
    cuerpo.appendChild(csgEl('p', 'csg-nota', 'Lo pegado se reparte en el molde que elijas. Lo que no encuentre sitio va al final, marcado para colocarlo o quitarlo: no se pierde nada.'));
    CSG_CLASES.forEach(c => {
      cuerpo.appendChild(csgVerSep(c.ic + ' ' + c.nombre));
      (CSG_MOLDES_ORDEN[c.id] || []).forEach(mid => {
        const m = Object.prototype.hasOwnProperty.call(CSG_MOLDES, mid) ? CSG_MOLDES[mid] : null;
        if (!m) return;
        const on = !!(_csgPegPieza && _csgPegPieza.molde === mid);
        const cuando = String(m.cuando || '');
        const sub = (mid === r.molde ? 'lo que propuse · ' : '') + (cuando ? cuando.charAt(0).toUpperCase() + cuando.slice(1) : '');
        cuerpo.appendChild(csgVerFila(c.ic, m.nombre, null, on, () => csgPegElegir(mid), sub));
      });
    });
  });
}

function csgPegElegir(mid) {
  if (typeof csgVerCerrar === 'function') csgVerCerrar();
  if (!_csgPegLeido || !_csgPegBase) return;
  if (mid === _csgPegLeido.molde) {
    _csgPegElegido = '';
    _csgPegPieza = _csgPegBase;
  } else {
    if (typeof csgDuplicarEnMolde !== 'function') { csgAviso('No se pudo cambiar la forma: vuelve a abrir F.A.R.O'); return; }
    _csgPegElegido = mid;
    _csgPegPieza = csgDuplicarEnMolde(_csgPegBase, mid);
  }
  csgPegPintar();
}

/* Al compositor con la pieza NUEVA, sin guardar, y con los avisos del
   lector para enseñarlos arriba. Si el recuadro cambió y el respiro
   todavía no lo había leído, se lee antes: abrir lo de hace un segundo
   sería abrir lo que ya no está escrito. */
function csgPegAbrirCompositor() {
  const el = _csgPegEl;
  if (el && String(el.ta.value || '') !== _csgPegTexto) csgPegLeer('');
  const p = _csgPegPieza;
  const r = _csgPegLeido;
  if (!p || !r) { csgAviso('Pega primero lo que ya tienes'); return; }
  if (typeof csgAbrirCompositor !== 'function') { csgAviso('No se pudo abrir el compositor: vuelve a abrir F.A.R.O'); return; }
  const avisos = (Array.isArray(r.avisos) ? r.avisos : []).slice();
  csgPegCerrar();
  csgAbrirCompositor(p, { avisos });
}

function csgPegAbierta() {
  const ov = document.getElementById('csg-pegar-overlay');
  return !!(ov && ov.style.display && ov.style.display !== 'none');
}

function csgPegCerrar() {
  clearTimeout(_csgPegT);
  _csgPegT = null;
  const ov = document.getElementById('csg-pegar-overlay');
  if (ov) {
    try { if (document.activeElement && ov.contains(document.activeElement)) document.activeElement.blur(); } catch (e) {}
    ov.style.display = 'none';
  }
  const cuerpo = document.getElementById('csg-pegar-cuerpo');
  if (cuerpo) cuerpo.textContent = '';
  _csgPegEl = null;
  _csgPegTexto = '';
  _csgPegLeido = null;
  _csgPegBase = null;
  _csgPegPieza = null;
  _csgPegElegido = '';
}

/* ══════════════════════════════════════════════════════════════════
   LOS CABLES DE ESTA PARTE
   ──────────────────────────────────────────────────────────────────
   Se enganchan la primera vez que se abre una de las dos hojas, y NO en
   un DOMContentLoaded: ver la cabecera (la prueba de Node carga el
   archivo con un `document` que revienta si se le toca). Nadie puede
   tocar la ✕ de una hoja que todavía no se abrió.
   ══════════════════════════════════════════════════════════════════ */
function csgUsarEngancha() {
  if (_csgUsarEnganchado) return;
  if (typeof document === 'undefined' || !document || typeof document.getElementById !== 'function') return;
  _csgUsarEnganchado = true;
  const al = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('click', fn); };
  al('csg-usar-close', () => csgUsarCerrar());
  al('csg-pegar-close', () => csgPegCerrar());
  /* Un toque en el fondo oscuro cierra; uno dentro de la hoja, no. */
  const fondo = (id, fn) => {
    const ov = document.getElementById(id);
    if (ov) ov.addEventListener('click', e => { if (e.target === ov) fn(); });
  };
  fondo('csg-usar-overlay', () => csgUsarCerrar());
  fondo('csg-pegar-overlay', () => csgPegCerrar());
  /* Escape cierra la de más arriba. En la fase de CAPTURA, para mirar
     ANTES que el anaquel: si la hoja vertical está abierta encima, es
     ella la que se cierra (lo hace el anaquel) y esta se queda. Mirando
     después, la vertical ya estaría cerrada y se irían las dos de un
     solo Escape. */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const ver = document.getElementById('csg-ver-overlay');
    if (ver && ver.style.display && ver.style.display !== 'none') return;
    /* Y lo MARCA como atendido: el Escape del anaquel mira en la fase de
       burbuja, cuando esta hoja ya está cerrada, y sin la marca creía que
       no había nada encima y salía también de ☑ Elegir (csgElegEscape). */
    if (csgPegAbierta()) { e.preventDefault(); csgPegCerrar(); }
    else if (csgUsarAbierta()) { e.preventDefault(); csgUsarCerrar(); }
  }, true);
}
