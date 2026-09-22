/* ⚠️ ESTE ARCHIVO ESTÁ A MEDIAS, Y NO SE CABLEA HASTA QUE ESTÉ ENTERO.
   ──────────────────────────────────────────────────────────────────
   Se quedó así el 22 de septiembre de 2026, a mitad de escribirlo: se
   acabó el crédito del modelo en plena tanda, no hubo ninguna avería.
   Llega hasta CSG_BLOQUES_PROMPT, o sea el vocabulario de bloques; le
   faltan CSG_MOLDES (los diecisiete moldes), CSG_EQUIVALE,
   CSG_SINONIMOS, CSG_MAQUINAS, CSG_TOPES, CSG_TEXTOS, todas las
   funciones y la pantalla entera.

   NO está en `index.html`, y eso es a propósito: los <script> de la
   aplicación comparten un solo ámbito, así que un archivo a medias que
   el navegador cargue no rompe esta herramienta —rompe F.A.R.O entero—.
   El `<script>` y el `<link>` se añaden el día que esté terminado.

   El plan completo para terminarlo, con el diseño, los formatos, las
   salidas escritas una por una y lo que falta en orden, está en
   PLAN-LA-CONSIGNA.md, en la raíz. El SQL de esta herramienta SÍ está
   terminado y probado (supabase/sql/consigna.sql).
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
      no se pisan la bitácora.
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
