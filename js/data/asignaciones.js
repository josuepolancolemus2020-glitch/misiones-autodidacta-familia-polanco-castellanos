/* Asignaciones metalingüísticas de la Ruta de la Ingeniería del Sistema.
   ─────────────────────────────────────────────────────────────────────
   Vienen del capítulo 8 de PROPUESTA-RUTAS-DEL-ADULTO.md y NO son misiones
   del molde de siempre, así que no viven en MISSIONS: no tienen quiz, no dan
   XP automático y no se aprueban en pantalla.

   Una misión normal enseña un tema y mide con un quiz. Una asignación
   metalingüística toma como material de estudio EL PROPIO SISTEMA (M.E.T.A.S
   y F.A.R.O) y pide como producto LENGUAJE: nombrar, explicar, traducir,
   defender, documentar. Se aprueba defendiendo en voz alta delante de otro
   miembro de la familia, y el XP lo otorga quien tomó la defensa.

   Cada una lleva las cinco partes fijas del molde:
     1. encargo      qué se produce, y siempre queda escrito
     2. material     qué parte del sistema se estudia, con rutas exactas
     3. vocabulario  entre diez y veinte términos que hay que usar bien
     4. defensa      cinco preguntas que se responden SIN LEER
     5. sello        el producto se guarda en la Bóveda y no sale de la casa

   Ocupan las etapas 3 a 10 de la ruta. Las etapas 1 y 2 (Panorama técnico y
   El frontend) se quedan como misiones normales: son la base.                */

const ASIGNACIONES = [
  {
    id: 'a1', n: 3, icon: '📖', xp: 60,
    titulo: 'El diccionario del sistema',
    lema: 'Cien términos de M.E.T.A.S y F.A.R.O en palabras de la familia',
    encargo: 'Cien términos explicados con palabras propias, sin copiar ninguna definición. Cada entrada lleva tres cosas: qué es en una línea, dónde aparece en el sistema (con el archivo), y una frase que empiece por «se parece a», con algo de la casa. Es la base de las otras siete asignaciones: sin diccionario no hay defensa posible.',
    producto: 'Documento «Diccionario del sistema», mínimo cien entradas',
    material: [
      { ruta: 'index.html', que: 'las diecisiete vistas de F.A.R.O y cómo se declaran' },
      { ruta: 'js/app.js', que: 'el estado, los miembros, el XP y switchView' },
      { ruta: 'js/data/misiones.js', que: 'el catálogo: RUTAS, MISSIONS y ETAPAS_PREVISTAS' },
      { ruta: 'sw.js', que: 'el trabajador de servicio y qué decide guardar en caché' },
      { ruta: 'manifest.json · capacitor.config.json · supabase/sql/', que: 'lo que convierte la web en PWA y en APK, y las tablas con sus políticas' },
      { ruta: 'M.E.T.A.S · misiones/autocapacitacion-metas/modulo-1-panorama.html', que: 'la frase maestra y los tres frentes' },
    ],
    vocabulario: ['sitio estático', 'offline-first', 'localStorage', 'fuente de verdad', 'PWA', 'trabajador de servicio', 'caché', 'manifiesto', 'APK', 'WebView', 'Supabase', 'tabla', 'fila', 'política de seguridad por fila', 'clave anónima', 'función de borde', 'GitHub Pages', 'dominio y CNAME', 'despliegue', 'sincronización'],
    defensa: [
      '¿Qué significa que la fuente de verdad esté en el dispositivo, y qué se gana con eso?',
      'Si el código es el mismo, ¿en qué se diferencian la web, la PWA y el APK?',
      '¿Qué hace el trabajador de servicio cuando no hay señal, y qué no debe guardar nunca?',
      '¿Qué es una política de seguridad por fila, y por qué «using (true)» no cerraba nada?',
      '¿Por qué la clave anónima puede estar a la vista sin que eso sea un descuido?',
    ],
    terminada: 'Cuando cualquiera de las cinco preguntas de defensa se contesta sin buscar el término, y cuando un término elegido al azar se explica en voz alta sin leer la entrada.',
    error: 'Copiar la definición de la documentación oficial. Se nota enseguida: la entrada suena bien y no dice dónde aparece en el sistema.',
    sello: 'El diccionario se guarda en la Bóveda de F.A.R.O. No se publica: es el mapa mental del sistema y de él salen todas las demás asignaciones.',
  },
  {
    id: 'a2', n: 4, icon: '🗣️', xp: 55,
    titulo: 'Traducir una pantalla',
    lema: 'El viaje de un dato contado sin una sola palabra técnica',
    encargo: 'Dos páginas, una por proyecto: en F.A.R.O el camino de un destello, y en M.E.T.A.S el de una evaluación terminada. Se cuenta todo lo que pasa desde que se toca el botón hasta que el dato queda guardado y sincronizado, sin usar ni una palabra técnica. Prohibido decir localStorage, caché, API o sincronizar: hay que encontrar la palabra de la casa.',
    producto: 'Dos páginas: «El viaje de un destello» y «El viaje de una evaluación»',
    material: [
      { ruta: 'js/tools/destellos.js', que: 'el buzón de salida y cuándo se vacía' },
      { ruta: 'js/app.js (load, save, memberState)', que: 'dónde vive el estado de cada miembro' },
      { ruta: 'sw.js', que: 'qué se sirve desde el aparato y qué se pide a la red' },
      { ruta: 'supabase/sql/destellos_table.sql', que: 'la tabla que recibe el dato al otro lado' },
      { ruta: 'supabase/functions/send-chat-push/', que: 'qué pasa después de guardar, y con qué clave' },
    ],
    vocabulario: ['cuaderno', 'gaveta', 'buzón', 'mensajero', 'copia', 'recibo', 'candado', 'llave', 'fila de espera', 'apuntar antes de mandar'],
    defensa: [
      'Se va la luz justo al tocar el botón. ¿Dónde quedó el dato y qué pasa al volver?',
      'El teléfono no tiene señal en toda la tarde. ¿Qué se ve en pantalla y qué está pasando por dentro?',
      'Se desinstala la aplicación sin haber sincronizado. ¿Qué se pierde exactamente?',
      '¿En qué momento exacto el dato deja el aparato, y quién decide ese momento?',
      'Además de ti, ¿quién puede leer ese dato y por qué se le permite?',
    ],
    terminada: 'Cuando Evelyn lee las dos páginas y puede contar el viaje del dato con sus palabras, sin preguntar qué significa nada.',
    error: 'Colar una palabra técnica disfrazada («se guarda en la memoria del navegador»). Sigue siendo la palabra técnica con un abrigo encima.',
    sello: 'Las dos páginas se guardan en la Bóveda. Sirven además para explicarle el sistema a una maestra sin asustarla.',
  },
  {
    id: 'a3', n: 5, icon: '📓', xp: 60,
    titulo: 'La bitácora de los porqués',
    lema: 'Qué se decidió, qué se descartó y qué se pagó a cambio',
    encargo: 'Una página por decisión grande, mínimo ocho. Cada página lleva cuatro apartados: qué se decidió, qué alternativa se descartó, qué se paga por haber elegido así, y qué tendría que pasar para cambiarla. Las decisiones no se inventan: se buscan en el repositorio, en las normas y en los mensajes de los commits.',
    producto: 'Bitácora de decisiones, mínimo ocho páginas',
    material: [
      { ruta: 'NORMAS-MISIONES-FARO.md', que: 'las siete normas y por qué nació cada una' },
      { ruta: 'PLAN-FARO-PRIVADO.md', que: 'por qué F.A.R.O es privado y separado de M.E.T.A.S' },
      { ruta: 'PROPUESTA-RUTAS-DEL-ADULTO.md', que: 'el sello familiar y qué no se publica' },
      { ruta: 'git log', que: 'los mensajes de commit, que son la bitácora que ya existe' },
      { ruta: '_dev/', que: 'las sondas y las herramientas: también son decisiones' },
    ],
    vocabulario: ['decisión', 'alternativa descartada', 'costo de la decisión', 'compromiso', 'reversibilidad', 'dependencia', 'acoplamiento', 'deuda técnica', 'restricción', 'criterio de aceptación'],
    defensa: [
      '¿Por qué no se usó un marco de trabajo, y qué se paga cada mes por esa decisión?',
      'Supabase cierra mañana. ¿Qué deja de funcionar, qué sigue vivo y en cuánto tiempo se sale del apuro?',
      '¿Por qué F.A.R.O es privado y M.E.T.A.S público, si el código se parece tanto?',
      'De las ocho decisiones, ¿cuál es la más difícil de revertir y por qué?',
      '¿Cuál cambiarías hoy, sabiendo lo que sabes, y qué te costaría el cambio?',
    ],
    terminada: 'Cuando cada página dice qué se pagó por la decisión. Una página que solo cuenta lo que se ganó todavía no está terminada.',
    error: 'Escribir la bitácora como una defensa del proyecto. La bitácora no defiende: registra, y registra sobre todo el precio.',
    sello: 'La bitácora se guarda en la Bóveda. Es el documento que evita repetir una discusión ya cerrada, y el que explica el sistema a quien llegue después.',
  },
  {
    id: 'a4', n: 6, icon: '🔤', xp: 55,
    titulo: 'Auditoría de nombres',
    lema: 'Quien no sabe nombrar algo, todavía no lo entendió',
    encargo: 'Recorrer el código buscando lo mal nombrado (variables, funciones, archivos, botones, clases de CSS) y anotar mínimo veinte hallazgos. Cada uno lleva: el nombre actual, dónde está, qué hace de verdad, el nombre que le corresponde y por qué. No hay que renombrar nada todavía: primero se nombra bien en papel.',
    producto: 'Tabla de veinte hallazgos con su nombre propuesto y el porqué',
    material: [
      { ruta: 'misiones/*/js/*.js', que: 'los bancos heredados: parteData, neuronPartes, enfermedadData' },
      { ruta: 'misiones/*/js/*.js (resolveMethod)', que: 'un parámetro llamado conInternet que no habla de internet' },
      { ruta: 'js/app.js', que: 'los nombres del estado y de los miembros' },
      { ruta: 'css/app.css · misiones/*/css/*.css', que: 'clases como ac-teal o vs-box, que nombran color y no función' },
      { ruta: '_dev/', que: 'los nombres de las herramientas, que sí se pusieron a propósito' },
    ],
    vocabulario: ['nombre revelador', 'nombre heredado', 'nombre del molde', 'abreviatura', 'dominio del problema', 'convención', 'coherencia', 'alcance', 'colisión de nombres', 'renombrar'],
    defensa: [
      '¿Cuál es el peor nombre del sistema y qué esconde exactamente?',
      'Un banco de datos sobre deudas se llama enfermedadData. ¿Qué te dice eso sobre cómo se construyó?',
      '¿Por qué renombrar cuesta más que haber escrito bien el nombre la primera vez?',
      '¿Qué nombre feo NO cambiarías, y con qué argumento lo defiendes?',
      'Entre un nombre claro y largo y uno corto y ambiguo, ¿cómo decides, y con qué regla?',
    ],
    terminada: 'Cuando los veinte hallazgos tienen nombre propuesto y porqué, y cuando al menos tres son nombres que uno mismo escribió.',
    error: 'Buscar solo en el código ajeno o heredado. Los nombres más caros suelen ser los propios, puestos con prisa y ya usados en veinte sitios.',
    sello: 'La tabla se guarda en la Bóveda y se revisa antes de cada misión nueva: es lo que evita que un nombre heredado viaje otra vez.',
  },
  {
    id: 'a5', n: 7, icon: '🚦', xp: 60,
    titulo: 'Los cuellos de botella en palabras',
    lema: 'Qué se rompe primero si la carga se multiplica por cien',
    encargo: 'Explicar los cinco cuellos de botella del sistema: qué es cada uno, dónde aparece en M.E.T.A.S y en F.A.R.O, qué pasa hoy con la carga actual, y qué pasaría con cien veces más. Al final, ordenarlos por cuál se rompe primero y decir cuál se arregla con dinero y cuál no.',
    producto: 'Informe de cinco cuellos de botella, ordenados por riesgo',
    material: [
      { ruta: 'La escritura fila por fila', que: 'cada dato viaja solo en vez de por lotes' },
      { ruta: 'La dependencia de un solo servicio', que: 'todo lo que necesita servidor está en Supabase' },
      { ruta: 'La latencia de ida y vuelta', que: 'cada acción que espera respuesta se siente lenta lejos del servidor' },
      { ruta: 'La renderización optimista', que: 'la pantalla dice que se guardó antes de saberlo' },
      { ruta: 'El alojamiento estático', que: 'GitHub Pages sirve archivos, no puede calcular nada' },
    ],
    vocabulario: ['cuello de botella', 'lote', 'latencia', 'renderización optimista', 'punto único de fallo', 'escalar', 'carga', 'límite de servicio', 'caché', 'degradación'],
    defensa: [
      'Mil aulas terminan una evaluación en el mismo minuto. ¿Qué se rompe primero y cómo se nota?',
      '¿Qué significa que la pantalla diga «guardado» antes de que el servidor conteste, y cuándo eso miente?',
      'De los cinco, ¿cuál NO se arregla pagando más, y por qué?',
      '¿Cuál aceptarías no arreglar nunca, y con qué argumento se lo explicas a un ingeniero?',
      'Si tuvieras una sola tarde para tocar uno, ¿cuál tocas y qué mides después para saber si sirvió?',
    ],
    terminada: 'Cuando cada cuello de botella tiene un número: cuántos usuarios, cuántas filas, cuántos segundos. Sin número es una opinión.',
    error: 'Confundir «va lento» con «no escala». Van lentas cosas que escalan perfectamente, y escalan mal cosas que hoy van rapidísimo.',
    sello: 'El informe se guarda en la Bóveda. Es la respuesta preparada para la pregunta «¿y esto aguanta?», que llega en toda reunión.',
  },
  {
    id: 'a6', n: 8, icon: '👧', xp: 55,
    titulo: 'Contarlo a Jael y a Angelly',
    lema: 'La misma verdad en tres idiomas',
    encargo: 'Una sola explicación del sistema, escrita tres veces: para una niña de sexto grado, para una maestra y para un ingeniero. Las tres tienen que ser verdad y no contradecirse: no se trata de simplificar mintiendo, sino de cambiar de idioma. La versión de la niña se lee en voz alta y ella dice si entendió.',
    producto: 'Tres textos de una página: para niña, para maestra y para ingeniero',
    material: [
      { ruta: 'El producto de la asignación 2', que: 'la traducción sin palabras técnicas ya hecha' },
      { ruta: 'misiones/autocapacitacion-metas/modulo-1-panorama.html', que: 'la frase maestra, para la versión de ingeniero' },
      { ruta: 'README.md', que: 'cómo se cuenta hoy el proyecto por escrito' },
    ],
    vocabulario: ['registro de habla', 'analogía', 'simplificar sin mentir', 'público', 'promesa', 'ejemplo concreto', 'lo que se omite', 'lo que no se puede omitir'],
    defensa: [
      'Explícaselo a Jael ahora mismo, en dos minutos, sin usar ninguna palabra que ella no use.',
      '¿Qué omitiste en la versión de la niña, y por qué omitir eso no es mentir?',
      'La maestra pregunta si sus datos están seguros. ¿Qué le dices, en su idioma?',
      '¿Qué parte del sistema es imposible de explicar sin una palabra técnica, y cómo la resuelves?',
      'Si las tres versiones se contradicen en algo, ¿cuál está mal y por qué esa?',
    ],
    terminada: 'Cuando Jael puede repetir la explicación a otra persona al día siguiente. Ese es el único examen que cuenta aquí.',
    error: 'Hacer la versión de la niña quitando palabras en vez de cambiando de idioma. Queda un texto corto que no explica nada.',
    sello: 'Las tres versiones se guardan en la Bóveda. La defensa la toman Jael y Angelly: si ellas no entienden, la asignación no está terminada.',
  },
  {
    id: 'a7', n: 9, icon: '🗝️', xp: 70,
    titulo: 'El testamento técnico',
    lema: 'Cómo sigue esto sin mí',
    encargo: 'El documento que permite que otro miembro de la familia mantenga los dos proyectos vivos. Lleva: dónde vive cada cosa, qué cuentas y qué claves hacen falta y QUIÉN LAS TIENE (nunca las claves en sí), cómo se publica un cambio, cómo se recupera todo si se borra, y a quién se le pide qué cuando algo falla. Es la asignación más importante de las ocho.',
    producto: 'Documento «Cómo sigue esto sin mí», con su índice y sus pasos numerados',
    material: [
      { ruta: 'sw.js · manifest.json · capacitor.config.json', que: 'cómo se entrega la aplicación por los tres frentes' },
      { ruta: 'supabase/sql/ · supabase/functions/', que: 'qué hay que recrear si se pierde la nube' },
      { ruta: 'package.json', que: 'las herramientas que hacen falta para trabajar' },
      { ruta: 'CNAME y la configuración de GitHub Pages', que: 'de quién es el dominio y cómo se renueva' },
      { ruta: 'La Bóveda de F.A.R.O', que: 'dónde quedan los productos de las otras siete asignaciones' },
    ],
    vocabulario: ['continuidad', 'copia de respaldo', 'recuperación', 'punto único de fallo', 'credencial', 'custodio de la clave', 'titularidad del dominio', 'despliegue', 'procedimiento', 'inventario de servicios'],
    defensa: [
      'Hoy no estás. Evelyn tiene que publicar un cambio en M.E.T.A.S. Cuéntale los pasos, uno por uno.',
      'Se borró todo el repositorio y el teléfono. ¿Desde dónde se reconstruye, y qué se pierde para siempre?',
      '¿Qué claves existen, quién las tiene y dónde están? (Sin decir ninguna en voz alta.)',
      '¿Qué servicio, si cierra, deja el proyecto sin arreglo posible, y qué se hace hoy para que eso no pase?',
      '¿Qué parte de este testamento caduca antes, y cada cuánto hay que volver a escribirla?',
    ],
    terminada: 'Cuando Evelyn, con el documento en la mano y sin ayuda, publica un cambio de verdad en M.E.T.A.S de principio a fin.',
    error: 'Escribir el testamento pensando en un lector técnico. Se escribe para quien va a estar asustado y con prisa, no para un ingeniero.',
    sello: 'Se guarda en la Bóveda y se le dice a Evelyn dónde está. Un testamento que nadie sabe que existe no es un testamento. Las claves NO van dentro: va quién las custodia.',
  },
  {
    id: 'a8', n: 10, icon: '🎓', xp: 80,
    titulo: 'Defensa ante el ingeniero',
    lema: 'Treinta preguntas duras, de pie y sin pantalla',
    encargo: 'La prueba final de la ruta, y la razón por la que nació: poder defender el sistema ante cualquier ingeniero que quiera demostrar que está mal hecho. Treinta preguntas, de pie, sin pantalla y sin apuntes. Las toma otro miembro de la familia con la hoja en la mano. Se aprueba con veinticuatro respondidas y ninguna de las cinco de fondo fallada.',
    producto: 'Acta de la defensa: fecha, quién la tomó, preguntas falladas y qué se estudió después',
    material: [
      { ruta: 'Las siete asignaciones anteriores', que: 'esto no se estudia aparte: se llega con ellas hechas' },
      { ruta: 'fichas/ficha-ingenieria-asignaciones.html', que: 'las treinta preguntas están escritas en la ficha' },
      { ruta: 'misiones/autocapacitacion-metas/', que: 'las etapas 1 y 2, que son la base técnica' },
    ],
    vocabulario: ['arquitectura', 'compromiso de diseño', 'punto único de fallo', 'escalabilidad', 'mantenibilidad', 'seguridad por capas', 'superficie de ataque', 'coste total', 'reversibilidad', 'defensa razonada'],
    defensa: [
      '«Esto no escala.» Contesta sin ponerte a la defensiva y con un número encima de la mesa.',
      '«Cualquiera lo hace con un marco de trabajo moderno.» ¿Qué respondes?',
      '«Depende de un solo servicio, eso es frágil.» ¿Es cierto? ¿Cuánto?',
      '«Los datos de menores en la nube son un problema legal.» ¿Qué tienes hecho al respecto?',
      '«Si te pasa algo, esto se muere contigo.» ¿Qué enseñas para contestar eso?',
    ],
    terminada: 'Cuando se responden veinticuatro de las treinta y ninguna de las cinco de fondo queda fallada, de pie y sin pantalla.',
    error: 'Estudiar las treinta preguntas de memoria. La defensa no mide respuestas: mide si el sistema se entiende, y eso se nota a la tercera repregunta.',
    sello: 'El acta se guarda en la Bóveda con la fecha. La defensa se repite una vez al año: un sistema que cambia y una defensa que no, dejan de hablar del mismo sistema.',
  },
];

if (typeof module !== 'undefined' && module.exports) module.exports = { ASIGNACIONES };
