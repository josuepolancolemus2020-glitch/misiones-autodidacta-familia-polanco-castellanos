/* Catálogo de F.A.R.O.
   RUTAS  = series ordenadas por etapas (como en M.E.T.A.S). Una ruta declara
            cuántas etapas tendrá cuando esté completa, así el mapa muestra
            desde el principio lo que falta por construir.
   MISSIONS = lo que existe hoy. Cada misión dice a qué ruta pertenece y qué
            etapa ocupa; sin entrada aquí, para la aplicación no existe.

   El campo `materia` de una ruta es el nombre GENERAL de lo que se estudia en
   ella (Metacognición, Retórica, Geopolítica…), y es opcional: si falta, el
   mapa de rutas lo saca del `label` de MATERIAS por el `color`. Se declara a
   mano solo en las veintiocho rutas del Estudio Mayor, porque todas comparten
   el color 'mayor' (para no llenar el filtro de chips de la portada) y ese
   rótulo compartido no dice qué materia es cada una. Los nombres salen tal
   cual de los encabezados de COMPENDIO-ESTUDIO-MAYOR.md, del 4 al 31. */

const RUTAS = {
  /* 10 etapas: las 2 primeras son misiones normales (Panorama y Frontend) y de
     la 3 a la 10 van las asignaciones metalingüísticas de js/data/asignaciones.js,
     que no se aprueban en pantalla sino defendiéndolas en voz alta. */
  ingenieria: { nombre: 'Ruta de la Ingeniería del Sistema', emoji: '🏗️', color: 'ing',  etapas: 10,
                lema: 'Estudiar M.E.T.A.S y F.A.R.O hasta poder defenderlos ante cualquier ingeniero' },
  pensamiento:{ nombre: 'Ruta del Pensamiento',              emoji: '🦉', color: 'bach', etapas: 4,
                lema: 'Cómo se sabe lo que se sabe: epistemología y método' },
  cuerpo:     { nombre: 'Ruta del Cuerpo',                   emoji: '🧠', color: 'cnat', etapas: 4,
                lema: 'La máquina que aprende: cuerpo, cerebro y salud' },
  persuasion: { nombre: 'Ruta de la Persuasión',             emoji: '🧠', color: 'psi',  etapas: 6,
                lema: 'Influencia, sesgos y defensa contra la manipulación' },
  marca:      { nombre: 'Ruta de la Marca',                  emoji: '📈', color: 'mkt',  etapas: 6,
                lema: 'Audiencia, oferta y relato: que el trabajo se vea' },
  poder:      { nombre: 'Ruta del Poder',                    emoji: '💰', color: 'eco',  etapas: 6,
                lema: 'Dinero, activos, instituciones y negociación' },
  maquina:    { nombre: 'Ruta de la Máquina que Predice', emoji: '🤖', color: 'ia',   etapas: 6,
                lema: 'Usarla sin creerle: qué hace bien, qué inventa y qué nunca se le delega' },
  politico:   { nombre: 'Ruta del Poder Político', emoji: '🏛️', color: 'pol',  etapas: 6,
                lema: 'Quién decide, quién traba y cómo se firma lo que se acuerda' },
  casacerrada:{ nombre: 'Ruta de la Casa Cerrada',           emoji: '🔐', color: 'cib',  etapas: 6,
                lema: 'Quién entra, qué se guarda y qué se pierde el día que falle algo' },
  /* 12 etapas porque el temario no cabe en 6: la Constitución, la ley
     educativa, la jurisprudencia y las cuatro herramientas con que se lee
     una ley (argumento, retórica, psicología del poder e historia). El
     compendio completo está en COMPENDIO-RUTA-LEY.md. */
  ley:        { nombre: 'Ruta de la Ley y sus Grietas',      emoji: '⚖️', color: 'ley',  etapas: 12,
                lema: 'Leer la ley por dentro: qué dice, qué calla y dónde se contradice' },
  /* Storytelling es un OFICIO con varios oficios dentro, así que su materia se
     abre en OCHO rutas, declaradas enteras por adelantado como se hizo con el
     Estudio Mayor y con la Ley: el autor pidió ver el mapa completo para saber
     qué misión sigue e ir ordenando desde ahí. Todas comparten el color 'story'
     (por eso caen juntas bajo el chip «Storytelling») y cada una declara su
     `materia` con el nombre del DOMINIO que enseña, no con el nombre del chip,
     que si no todas las tarjetas dirían lo mismo. El compendio completo, con las
     ocho rutas y sus etapas, está en COMPENDIO-STORYTELLING.md.
     La 1 es la de fundamentos: la gramática del relato, sobre la que se apoyan
     las otras siete. 12 etapas, como la Ley, porque el temario no cabe en 6: un
     curso de seis se queda en «gancho, conflicto y cierre», el taller de fin de
     semana que esta ruta viene a superar. */
  hilo:       { nombre: 'Ruta del Hilo que Tira',            emoji: '🧵', color: 'story', materia: 'Fundamentos del relato', etapas: 12,
                lema: 'Nadie se queda por lo que ya sabe: se queda por el hueco que le falta' },
  pluma:      { nombre: 'Ruta de la Pluma Afilada',          emoji: '✍️', color: 'story', materia: 'La prosa y la voz', etapas: 7,
                lema: 'La arquitectura aguanta la casa; la prosa es dónde se vive' },
  papel:      { nombre: 'Ruta de las Personas de Papel',     emoji: '🎭', color: 'story', materia: 'Personaje y diálogo', etapas: 7,
                lema: 'Un personaje no es quien es: es lo que quiere y lo que le falta para conseguirlo' },
  camara:     { nombre: 'Ruta de la Cámara que Cuenta',      emoji: '🎬', color: 'story', materia: 'Narrativa audiovisual y guion', etapas: 7,
                lema: 'En la pantalla no se cuenta: se muestra, y el montaje decide qué significa' },
  expediente: { nombre: 'Ruta del Expediente Real',          emoji: '🎙️', color: 'story', materia: 'No ficción narrativa', etapas: 8,
                lema: 'Reordenar es oficio; inventar es otra cosa, y se llama distinto' },
  anzuelo:    { nombre: 'Ruta del Anzuelo Honrado',          emoji: '🪝', color: 'story', materia: 'Relato que persuade', etapas: 7,
                lema: 'La historia se cuenta para que el dato se entienda, nunca para que no se pida' },
  mundo:      { nombre: 'Ruta del Mundo que Aguanta',        emoji: '🗺️', color: 'story', materia: 'Relato largo y serialidad', etapas: 7,
                lema: 'Lo difícil no es empezar una historia larga: es no perder al lector en el medio' },
  taller:     { nombre: 'Ruta del Taller Mayor',             emoji: '🛠️', color: 'story', materia: 'Revisión, oficio y maestría', etapas: 8,
                lema: 'Nadie escribe bien: se reescribe bien, y eso se aprende con método' },
  /* La primera ruta del Estudio Mayor (COMPENDIO-ESTUDIO-MAYOR.md). El
     compendio trae veintisiete materias; entran al catálogo una por una,
     cuando se construye su primera misión, y todas bajo la materia 'mayor'
     para no llenar el filtro de chips (capítulo 30 del compendio). */
  espejo:     { nombre: 'Ruta de la Máquina que se Mira',    emoji: '🪞', color: 'mayor', materia: 'Metacognición', etapas: 6,
                lema: 'Saber no se siente: se comprueba con el cuaderno cerrado' },
  /* Las otras veintisiete materias del Estudio Mayor, declaradas enteras
     ANTES de construirse, como se hizo con la Ley: el autor pidió ver el
     mapa completo para ir ordenando misiones desde ahí. Nombres, emojis,
     lemas y títulos de etapa salen de COMPENDIO-ESTUDIO-MAYOR.md; si el
     compendio cambia, esto se regenera, no se edita a mano. */
  barro: { nombre: "Ruta del Barro Vivo", emoji: "🏺", color: 'mayor', materia: 'Neuroplasticidad', etapas: 6,
    lema: "El cerebro se vuelve aquello que se le hace repetir" },
  partitura: { nombre: "Ruta de la Partitura Anotada", emoji: "🎼", color: 'mayor', materia: 'Epigenética', etapas: 6,
    lema: "La misma partitura, otra música: el ambiente decide qué genes suenan y cuáles callan" },
  manana: { nombre: "Ruta del Yo de Mañana", emoji: "⏳", color: 'mayor', materia: 'Ciencia de la Procrastinación', etapas: 6,
    lema: "No es pereza: es un pleito entre el yo de hoy y el yo de mañana, y se gana con diseño, no con regaños" },
  brujula: { nombre: "Ruta de la Brújula Torcida", emoji: "🧭", color: 'mayor', materia: 'Sesgo cognitivo', etapas: 6,
    lema: "El error que cae siempre del mismo lado no se corrige con avisos: se corrige cambiando el procedimiento" },
  apuesta: { nombre: "Ruta de la Apuesta Medida", emoji: "🎲", color: 'mayor', materia: 'Toma de decisiones', etapas: 6,
    lema: "Toda decisión es una apuesta: se juzga por cómo se decidió, no por cómo cayó el dado" },
  puente: { nombre: "Ruta del Puente que Aguanta", emoji: "🌉", color: 'mayor', materia: 'Lógica del argumento', etapas: 6,
    lema: "Un argumento se revisa dos veces: la forma que lo sostiene y los materiales con que se armó" },
  trasluz: { nombre: "Ruta del Billete al Trasluz", emoji: "🔍", color: 'mayor', materia: 'Las falacias', etapas: 6,
    lema: "Casi ninguna forma es trampa siempre: el billete se mira al trasluz antes de gritar falso" },
  discurso: { nombre: "Ruta del Discurso por Dentro", emoji: "🎭", color: 'mayor', materia: 'Retórica', etapas: 6,
    lema: "Desmontar todo lo que intenta convencer, y armar lo propio con las mismas piezas" },
  piedras: { nombre: "Ruta de las Piedras en la Boca", emoji: "🗣️", color: 'mayor', materia: 'Oratoria', etapas: 6,
    lema: "Hablar de pie se aprende de pie: voz, pausa, cuerpo y miedo, entrenados a propósito" },
  cartas: { nombre: "Ruta de las Cartas Marcadas", emoji: "🃏", color: 'mayor', materia: 'Estratagemas en el discurso', etapas: 6,
    lema: "Ver la trampa antes de que cierre: el catálogo del que discute para ganar" },
  tinta: { nombre: "Ruta del Espejo de Tinta", emoji: "📖", color: 'mayor', materia: 'La literatura', etapas: 6,
    lema: "Leer por dentro: quién cuenta, cuánto sabe y por qué se le cree" },
  milcaras: { nombre: "Ruta de las Mil Caras", emoji: "🐉", color: 'mayor', materia: 'Estudio de la Mitología: la base de Joseph Campbell', etapas: 6,
    lema: "Leer los mitos por dentro: qué ordenan, quién los moldea y dónde el molde recorta" },
  templo: { nombre: "Ruta del Templo por Dentro", emoji: "🕯️", color: 'mayor', materia: 'Teología: estudio de las religiones', etapas: 7,
    lema: "Entrar a cada templo como estudiante: entender la creencia sin profesarla y sin caricaturizarla" },
  pagina: { nombre: "Ruta de la Página que Discute", emoji: "🕎", color: 'mayor', materia: 'El Talmud y el judaísmo', etapas: 6,
    lema: "Siglos de desacuerdo guardados en una sola hoja" },
  marea: { nombre: "Ruta de la Marea", emoji: "🌊", color: 'mayor', materia: 'Psicología de masas', etapas: 6,
    lema: "Reconocer la corriente antes de que piense por ti" },
  pantalla: { nombre: "Ruta de la Pantalla Leída", emoji: "🎬", color: 'mayor', materia: 'Semiótica y cine', etapas: 7,
    lema: "En la pantalla nada llegó solo: todo lo que se ve fue puesto, y lo que fue puesto se puede leer" },
  mapa: { nombre: "Ruta del Mapa que Cobra", emoji: "🗺️", color: 'mayor', materia: 'Geopolítica', etapas: 7,
    lema: "La geografía no decide: pone el precio, y alguien siempre lo paga" },
  mano: { nombre: "Ruta de la Mano que Reparte", emoji: "🪙", color: 'mayor', materia: 'Economía política', etapas: 6,
    lema: "Detrás de cada regla hay un reparto: quién gana, quién paga y quién la escribió" },
  atomos: { nombre: "Ruta de los Átomos y los Ídolos", emoji: "⚛️", color: 'mayor', materia: 'Materialismo Filosófico', etapas: 6,
    lema: "De qué está hecho lo que te venden, y quién lo sostiene" },
  semilla: { nombre: "Ruta de la Semilla y la Polilla", emoji: "🌱", color: 'mayor', materia: 'Educación Financiera', etapas: 7,
    lema: "El interés compuesto no espera: o trabaja para la casa o cobra contra ella" },
  gafas: { nombre: "Ruta de las Gafas a la Vista", emoji: "👓", color: 'mayor', materia: 'Estudio de las Ideologías', etapas: 7,
    lema: "«Nadie mira a ojo desnudo: el oficio es ver las gafas, empezando por las propias" },
  rojo: { nombre: "Ruta del Expediente Rojo", emoji: "📕", color: 'mayor', materia: 'Crítica al Marxismo', etapas: 7,
    lema: "La promesa del mundo sin clases, auditada con el siglo veinte en la mesa" },
  dorado: { nombre: "Ruta del Expediente Dorado", emoji: "📒", color: 'mayor', materia: 'Crítica al Capitalismo', etapas: 7,
    lema: "La máquina que sacó al mundo de la pobreza, auditada con sus facturas en la mesa" },
  punteria: { nombre: "Ruta de la Puntería", emoji: "🎯", color: 'mayor', materia: 'Ciencia de la predicción algorítmica', etapas: 6,
    lema: "Se apunta, se anota y se cuenta dónde dio: predecir se entrena" },
  umbral: { nombre: "Ruta del Umbral Anunciado", emoji: "🌅", color: 'mayor', materia: 'La singularidad', etapas: 6,
    lema: "Ni culto ni burla: la hipótesis, sus frenos y un registro con fechas" },
  maquinaviene: { nombre: "Ruta de la Máquina que Viene", emoji: "🔭", color: 'mayor', materia: 'El futuro de la IA', etapas: 6,
    lema: "Leer las curvas de la máquina, contar sus costes y decidir qué no se le entrega" },
  tesis: { nombre: "Ruta de la Idea en Pie", emoji: "🎓", color: 'mayor', materia: 'La tesis y sus negocios', etapas: 8,
    lema: "Una pregunta precisa, una afirmación que se deja refutar y alguien que la sostiene de pie" },
};

const MISSIONS = [
  { id: 1, title: 'Karl Popper y la Epistemología', modulo: 'aprendizaje-unido', materia: 'epis', color: 'apr', xp: 30, icon: '🦉', ruta: 'pensamiento', etapa: 1, url: 'misiones/epistemología/karl-popper.html' },
  { id: 2, title: 'El Sistema Nervioso',             modulo: 'aprendizaje-unido', materia: 'cnat', color: 'apr', xp: 35, icon: '🧠', ruta: 'cuerpo',      etapa: 1, url: 'misiones/misión-base-sistema-nervioso/sistema-nervioso.html' },
  { id: 3, title: 'Autocapacitación M.E.T.A.S · Módulo 1: Panorama técnico', modulo: 'aprendizaje-unido', materia: 'ing', color: 'apr', xp: 40, icon: '🏗️', ruta: 'ingenieria', etapa: 1, url: 'misiones/autocapacitacion-metas/modulo-1-panorama.html' },
  { id: 4, title: 'Autocapacitación M.E.T.A.S · Módulo 2: El frontend',      modulo: 'aprendizaje-unido', materia: 'ing', color: 'apr', xp: 40, icon: '🗺️', ruta: 'ingenieria', etapa: 2, url: 'misiones/autocapacitacion-metas/modulo-2-frontend.html' },
  { id: 5, title: 'Activos y Pasivos: qué mete y qué saca dinero',           modulo: 'aprendizaje-unido', materia: 'eco', color: 'apr', xp: 40, icon: '💰', ruta: 'poder',      etapa: 1, url: 'misiones/ruta-poder-activos-pasivos/activos-pasivos.html' },
  { id: 6, title: 'Las seis palancas de la influencia',                      modulo: 'aprendizaje-unido', materia: 'psi', color: 'apr', xp: 40, icon: '🧠', ruta: 'persuasion', etapa: 1, url: 'misiones/ruta-persuasion-palancas/palancas-influencia.html' },
  /* Sello familiar: las misiones de las rutas del adulto marcadas así son
     material de la casa. No salen al sitio público ni a la revista. */
  { id: 7, title: 'Sesgos: los atajos que deciden por ti', modulo: 'aprendizaje-unido', materia: 'psi', color: 'apr', xp: 45, icon: '🪞', ruta: 'persuasion', etapa: 2, sello: 'familiar', url: 'misiones/ruta-persuasion-sesgos/sesgos.html' },
  { id: 8, title: 'Para quién y qué le cambia: audiencia y promesa antes que el logo', modulo: 'aprendizaje-unido', materia: 'mkt', color: 'apr', xp: 40, icon: '🎯', ruta: 'marca', etapa: 1, sello: 'familiar', url: 'misiones/ruta-marca-audiencia-promesa/audiencia-promesa.html' },
  { id: 9, title: 'El presupuesto real: a dónde se va el dinero (y la hora)', modulo: 'aprendizaje-unido', materia: 'eco', color: 'apr', xp: 45, icon: '🧾', ruta: 'poder', etapa: 2, sello: 'familiar', url: 'misiones/ruta-poder-presupuesto/presupuesto.html' },
  { id: 10, title: 'Quién decide de verdad: el mapa del poder que toca a M.E.T.A.S', modulo: 'aprendizaje-unido', materia: 'pol', color: 'apr', xp: 45, icon: '🏛️', ruta: 'politico', etapa: 1, sello: 'familiar', url: 'misiones/ruta-politica-mapa-poder/mapa-poder.html' },
  { id: 11, title: 'La máquina que predice: qué es y qué no es un modelo de lenguaje', modulo: 'aprendizaje-unido', materia: 'ia', color: 'apr', xp: 45, icon: '🤖', ruta: 'maquina', etapa: 1, sello: 'familiar', url: 'misiones/ruta-maquina-que-predice/maquina-predice.html' },
  { id: 12, title: 'La puerta de la casa digital: quién entra y con qué llave', modulo: 'aprendizaje-unido', materia: 'cib', color: 'apr', xp: 45, icon: '🔐', ruta: 'casacerrada', etapa: 1, sello: 'familiar', url: 'misiones/ruta-casa-cerrada-la-puerta/la-puerta.html' },
  { id: 13, title: 'Los datos de los demás: menores, ley y sentido común', modulo: 'aprendizaje-unido', materia: 'cib', color: 'apr', xp: 45, icon: '🛡️', ruta: 'casacerrada', etapa: 2, sello: 'familiar', url: 'misiones/ruta-casa-cerrada-datos/datos.html' },
  { id: 14, title: 'La oferta: qué se entrega y a qué precio', modulo: 'aprendizaje-unido', materia: 'mkt', color: 'apr', xp: 45, icon: '🏷️', ruta: 'marca', etapa: 2, sello: 'familiar', url: 'misiones/ruta-marca-oferta/oferta.html' },
  { id: 15, title: 'Normas y trámites: qué papel hace falta y quién lo emite', modulo: 'aprendizaje-unido', materia: 'pol', color: 'apr', xp: 45, icon: '📜', ruta: 'politico', etapa: 2, sello: 'familiar', url: 'misiones/ruta-politica-normas-tramites/normas-tramites.html' },
  { id: 16, title: 'Pedir bien: el encargo, el contexto y el ejemplo', modulo: 'aprendizaje-unido', materia: 'ia', color: 'apr', xp: 45, icon: '📝', ruta: 'maquina', etapa: 2, sello: 'familiar', url: 'misiones/ruta-maquina-pedir-bien/pedir-bien.html' },
  { id: 17, title: 'El código que no confía: validación, límites e inyección', modulo: 'aprendizaje-unido', materia: 'cib', color: 'apr', xp: 45, icon: '🚦', ruta: 'casacerrada', etapa: 3, sello: 'familiar', url: 'misiones/ruta-casa-cerrada-codigo/codigo.html' },
  { id: 18, title: 'El relato: contar el proyecto sin inflarlo', modulo: 'aprendizaje-unido', materia: 'mkt', color: 'apr', xp: 45, icon: '📣', ruta: 'marca', etapa: 3, sello: 'familiar', url: 'misiones/ruta-marca-relato/relato.html' },
  { id: 19, title: 'La mesa: negociar con una institución', modulo: 'aprendizaje-unido', materia: 'pol', color: 'apr', xp: 45, icon: '🤝', ruta: 'politico', etapa: 3, sello: 'familiar', url: 'misiones/ruta-politica-mesa/mesa.html' },
  { id: 20, title: 'Marcos: quien pone el marco gana la conversación', modulo: 'aprendizaje-unido', materia: 'psi', color: 'apr', xp: 45, icon: '🖼️', ruta: 'persuasion', etapa: 3, sello: 'familiar', url: 'misiones/ruta-persuasion-marcos/marcos.html' },
  { id: 21, title: 'La deuda por dentro: interés, plazo y costo total', modulo: 'aprendizaje-unido', materia: 'eco', color: 'apr', xp: 45, icon: '💳', ruta: 'poder', etapa: 3, sello: 'familiar', url: 'misiones/ruta-poder-deuda/deuda.html' },
  { id: 22, title: 'Verificar: nadie firma lo que no leyó', modulo: 'aprendizaje-unido', materia: 'ia', color: 'apr', xp: 45, icon: '🔎', ruta: 'maquina', etapa: 3, sello: 'familiar', url: 'misiones/ruta-maquina-verificar/verificar.html' },
  { id: 23, title: 'Llaves y secretos: claves, entornos y repositorios', modulo: 'aprendizaje-unido', materia: 'cib', color: 'apr', xp: 45, icon: '🗝️', ruta: 'casacerrada', etapa: 4, sello: 'familiar', url: 'misiones/ruta-casa-cerrada-llaves/llaves.html' },
  { id: 24, title: 'De dónde saca su fuerza la ley: jerarquía, validez y coacción', modulo: 'aprendizaje-unido', materia: 'ley', color: 'apr', xp: 45, icon: '🏛️', ruta: 'ley', etapa: 1, sello: 'familiar', url: 'misiones/ruta-ley-fuerza-norma/fuerza-norma.html' },
  { id: 25, title: 'Anatomía de la Constitución de 1982: qué declara y cómo se reforma', modulo: 'aprendizaje-unido', materia: 'ley', color: 'apr', xp: 45, icon: '📜', ruta: 'ley', etapa: 2, sello: 'familiar', url: 'misiones/ruta-ley-anatomia-constitucion/anatomia-constitucion.html' },
  { id: 26, title: 'Los derechos y la coletilla que los devuelve', modulo: 'aprendizaje-unido', materia: 'ley', color: 'apr', xp: 50, icon: '🎭', ruta: 'ley', etapa: 3, sello: 'familiar', url: 'misiones/ruta-ley-coletilla/coletilla.html' },
  { id: 27, title: 'El vigía y el timón: el piso que estudia y el piso que vigila', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🪞', ruta: 'espejo', etapa: 1, sello: 'familiar', url: 'misiones/ruta-espejo-vigia-timon/vigia-timon.html' },
  { id: 28, title: 'Átomos contra el miedo: la física que quita los dos miedos', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '⚛️', ruta: 'atomos', etapa: 1, sello: 'familiar', url: 'misiones/ruta-atomos-contra-miedo/atomos-miedo.html' },
  { id: 29, title: 'El acero antes del juicio: la mejor versión primero, el veredicto después', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '📕', ruta: 'rojo', etapa: 1, sello: 'familiar', url: 'misiones/ruta-rojo-acero-juicio/acero-juicio.html' },
  { id: 30, title: 'La palabra con expediente: nació ciencia y quedó insulto', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '👓', ruta: 'gafas', etapa: 1, sello: 'familiar', url: 'misiones/ruta-gafas-palabra-expediente/gafas-expediente.html' },
  { id: 31, title: 'El bisturí de Freeden: núcleo, adyacentes y periferia', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🔬', ruta: 'gafas', etapa: 2, sello: 'familiar', url: 'misiones/ruta-gafas-bisturi-freeden/bisturi-freeden.html' },
  { id: 32, title: 'El mapa de las familias: cada una por su mejor versión', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🧬', ruta: 'gafas', etapa: 3, sello: 'familiar', url: 'misiones/ruta-gafas-mapa-familias/mapa-familias.html' },
  { id: 33, title: 'El hombre máquina y la base material: condicionar no es determinar', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '⚙️', ruta: 'atomos', etapa: 2, sello: 'familiar', url: 'misiones/ruta-atomos-hombre-maquina/hombre-maquina.html' },
  { id: 34, title: 'La gran fuga: el acero primero, y con números grandes', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '📒', ruta: 'dorado', etapa: 1, sello: 'familiar', url: 'misiones/ruta-dorado-gran-fuga/gran-fuga.html' },
  { id: 35, title: 'Las fallas de la máquina: la auditoría la firman los propios economistas', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🔧', ruta: 'dorado', etapa: 2, sello: 'familiar', url: 'misiones/ruta-dorado-fallas-maquina/fallas-maquina.html' },
  { id: 36, title: 'Lo que el dinero no debe comprar: dos objeciones, y la factura de cada una', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🩸', ruta: 'dorado', etapa: 3, sello: 'familiar', url: 'misiones/ruta-dorado-dinero-no-compra/dinero-no-compra.html' },
  { id: 37, title: 'Las dos facturas: la desigualdad y el clima, con horquilla y con fuente', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🌡️', ruta: 'dorado', etapa: 4, sello: 'familiar', url: 'misiones/ruta-dorado-dos-facturas/dos-facturas.html' },
  { id: 38, title: 'El escocés dorado: leerlo entero, y no la media frase de siempre', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🪶', ruta: 'dorado', etapa: 5, sello: 'familiar', url: 'misiones/ruta-dorado-escoces-dorado/escoces-dorado.html' },
  { id: 39, title: 'La regla de Hebb, bien contada: lo que el eslogan borró', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🏺', ruta: 'barro', etapa: 1, sello: 'familiar', url: 'misiones/ruta-barro-regla-hebb/regla-hebb.html' },
  { id: 40, title: 'San Petersburgo: lo que vale una apuesta', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🎲', ruta: 'apuesta', etapa: 1, sello: 'familiar', url: 'misiones/ruta-apuesta-san-petersburgo/san-petersburgo.html' },
  { id: 41, title: 'El árbol antes del salto: la oferta puesta en el papel', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🌳', ruta: 'apuesta', etapa: 2, sello: 'familiar', url: 'misiones/ruta-apuesta-arbol-salto/arbol-salto.html' },
  { id: 42, title: 'Tres atajos generan el zoológico: de dónde salen los doscientos sesgos', modulo: 'aprendizaje-unido', materia: 'mayor', color: 'apr', xp: 45, icon: '🧭', ruta: 'brujula', etapa: 1, sello: 'familiar', url: 'misiones/ruta-brujula-tres-atajos/tres-atajos.html' },
  { id: 43, title: 'La cadena y el hueco: por qué «y entonces» no es una historia', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '🧵', ruta: 'hilo', etapa: 1, sello: 'familiar', url: 'misiones/ruta-hilo-cadena-hueco/cadena-hueco.html' },
  { id: 44, title: 'El deseo y el obstáculo: qué quiere y quién se lo niega', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '🎯', ruta: 'hilo', etapa: 2, sello: 'familiar', url: 'misiones/ruta-hilo-deseo-obstaculo/deseo-obstaculo.html' },
  { id: 45, title: 'La forma de las formas: estructuras con autor, año y crítica', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '📐', ruta: 'hilo', etapa: 3, sello: 'familiar', url: 'misiones/ruta-hilo-forma-formas/forma-formas.html' },
  { id: 46, title: 'La escena: la unidad de trabajo y su giro de valor', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '🎭', ruta: 'hilo', etapa: 4, sello: 'familiar', url: 'misiones/ruta-hilo-la-escena/la-escena.html' },
  { id: 47, title: 'Mostrar, contar y cuándo cada uno: por qué «muestra, no cuentes» está mal citado', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '🪞', ruta: 'hilo', etapa: 5, sello: 'familiar', url: 'misiones/ruta-hilo-mostrar-contar/mostrar-contar.html' },
  { id: 48, title: 'La voz y el punto de vista: quién cuenta y cuánto sabe', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '👁️', ruta: 'hilo', etapa: 6, sello: 'familiar', url: 'misiones/ruta-hilo-voz-punto-vista/voz-punto-vista.html' },
  { id: 49, title: 'El tiempo del relato: orden, elipsis y suspense', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '⏳', ruta: 'hilo', etapa: 7, sello: 'familiar', url: 'misiones/ruta-hilo-tiempo-relato/tiempo-relato.html' },
  { id: 50, title: 'Emoción sin chantaje: conmover no es manipular', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '💧', ruta: 'hilo', etapa: 8, sello: 'familiar', url: 'misiones/ruta-hilo-emocion-sin-chantaje/emocion-sin-chantaje.html' },
  { id: 51, title: 'La historia que persuade, y el freno ético', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '⚖️', ruta: 'hilo', etapa: 9, sello: 'familiar', url: 'misiones/ruta-hilo-historia-persuade/historia-persuade.html' },
  { id: 52, title: 'La historia de verdad: narrativa de no ficción', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '📰', ruta: 'hilo', etapa: 10, sello: 'familiar', url: 'misiones/ruta-hilo-historia-de-verdad/historia-de-verdad.html' },
  { id: 53, title: 'Contar de pie y contar en imagen', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '🎥', ruta: 'hilo', etapa: 11, sello: 'familiar', url: 'misiones/ruta-hilo-de-pie-en-imagen/de-pie-en-imagen.html' },
  { id: 54, title: 'El taller: revisión con método y la prueba de dominio', modulo: 'aprendizaje-unido', materia: 'story', color: 'apr', xp: 45, icon: '✂️', ruta: 'hilo', etapa: 12, sello: 'familiar', url: 'misiones/ruta-hilo-el-taller/el-taller.html' },
];

/* Nombre de cada etapa aún no construida, para que el mapa de rutas enseñe el
   camino completo y no solo lo hecho. Viene del temario oficial de la serie
   (PLAN-AUTOCAPACITACION.md en el repositorio de M.E.T.A.S). */
const ETAPAS_PREVISTAS = {
  /* La Ingeniería ya no tiene etapas «por construir»: de la 3 a la 10 son
     asignaciones. El temario técnico que estaba aquí no se perdió, quedó
     repartido entre ellas: «Glosario» está en A1, «Datos locales» en A2,
     «Decisiones de ingeniería» en A3, «La nube Supabase» en A1 y A7,
     «Seguridad» en A5 y A8, y «Distribución y ciclo de vida» en A7. */
  persuasion: {
    4: 'Tácticas de presión y sus antídotos',
    5: 'Preguntar y escuchar: influir sin empujar',
    6: 'Narrativa: contar el proyecto para que otros quieran entrar',
  },
  marca: {
    4: 'Canales: dónde está la audiencia y qué se publica',
    5: 'Prueba y reputación: números reales y quien lo dice por ti',
    6: 'Crecer sin romper la promesa',
  },
  politico: {
    4: 'Alianzas, patronato y comunidad',
    5: 'El dinero público: presupuesto, compras y constancias',
    6: 'Reputación y riesgo político: no quedar amarrado a nadie',
  },
  maquina: {
    4: 'La IA que programa: qué revisar antes de subir',
    5: 'Datos, privacidad y las niñas',
    6: 'Qué se automatiza en M.E.T.A.S y qué no se le delega jamás',
  },
  casacerrada: {
    5: 'Copias y desastre: perder el teléfono, borrar sin querer',
    6: 'El engaño: phishing e ingeniería social en la familia',
  },
  poder: {
    4: 'Del salario al activo: ingresos que no dependen de tus horas',
    5: 'Poder local: municipio, patronato y presupuesto público',
    6: 'Negociación: pedir, ceder y cerrar por escrito',
  },
  /* Las doce están sin construir a propósito: primero se aprobó el compendio
     (COMPENDIO-RUTA-LEY.md) y de ahí salen los títulos de abajo, para que el
     mapa enseñe el camino entero desde el primer día. */
  ley: {
    /* Las etapas 1, 2 y 3 ya están construidas (ids 24, 25 y 26) y por eso no
       llevan título aquí: el mapa las toma de MISSIONS. Se deja la lista desde
       la 4 para que se vea que el resto del compendio sigue pendiente. */
    4:  'La grieta: cómo se caza una contradicción en la ley',
    5:  'Interpretar: los métodos con que se lee y se estira la letra',
    6:  'Jurisprudencia: quién dice qué dice la ley, y con qué efecto',
    7:  'La ley educativa de Honduras, por dentro',
    8:  'El argumento jurídico: silogismo, prueba y falacias del foro',
    9:  'Retórica forense: ethos, pathos y logos desde Corax hasta hoy',
    10: 'La psicología del poder: percepción, autoridad y sesgos del que juzga',
    11: 'Historia de la ley: qué miedo escribió cada norma',
    12: 'El expediente propio: escrito, plazo y defensa de la casa',
  },
  /* La Ruta del Hilo que Tira ya está completa: sus doce etapas (ids 24, 25,
     26, 43 a 54) están construidas y no queda ninguna por anunciar aquí. Se
     deja el objeto vacío, a propósito, en vez de borrar la clave: `app.js`
     lo maneja con `|| {}`, y un mapa sin ninguna «etapa futura» del Hilo es
     justo la señal de que la ruta cerró. */
  hilo: {},
  /* Las siete rutas de especialización de Storytelling, todas en cero. Sus
     títulos salen de COMPENDIO-STORYTELLING.md y ninguna se cita de memoria:
     cada estructura que se nombra lleva su autor y su año, que es la regla de
     oro de esta materia. */
  pluma: {
    1: 'La frase que respira: el ritmo se oye, no se explica',
    2: 'El verbo que trabaja: contra el adverbio y la pasiva (Orwell, 1946)',
    3: 'El detalle que vale por mil: la concreción de Chéjov',
    4: 'Matar a tus amados: el corte, bien atribuido (Quiller-Couch, 1914)',
    5: 'El párrafo y el blanco: puntuación, aliento y silencio en la página',
    6: 'La distancia psíquica: de la cámara al pensamiento (Gardner, 1984)',
    7: 'Reescribir es escribir: el borrador cero y las pasadas (Lamott, 1994)',
  },
  papel: {
    1: 'Querer y necesitar: el motor de dos tiempos',
    2: 'La herida y la máscara: la contradicción que mueve',
    3: 'Redondos y planos: cuándo cada uno (Forster, 1927)',
    4: 'El antagonista con razón: el acero antes del juicio',
    5: 'El diálogo que no explica: subtexto y oblicuidad',
    6: 'La acotación y el gesto: el cuerpo y lo no dicho',
    7: 'El elenco: coro, contraste y el personaje que falta',
  },
  camara: {
    1: 'La imagen que sustituye a la frase: mostrar en pantalla',
    2: 'El montaje significa: el efecto Kuleshov (años veinte)',
    3: 'La escena de cine: entrar tarde y salir temprano',
    4: 'El guion técnico: escaleta, secuencia y plano',
    5: 'El sonido, la mitad que nadie estudia',
    6: 'El video de siete minutos: el guion de F.A.R.O por dentro',
    7: 'El corte final: el ritmo del montaje y el descarte',
  },
  expediente: {
    1: 'Reordenar sí, inventar no: el borde exacto del oficio',
    2: 'La entrevista que saca la historia: qué preguntar, y qué no',
    3: 'El compuesto declarado y el nombre cambiado con aviso',
    4: 'La escena reconstruida: decir que es reconstrucción',
    5: 'El caso frente al dato: la muestra de tamaño uno',
    6: 'La víctima identificable y su factura (Small y colegas, 2007)',
    7: 'El periodista y el asesino: Janet Malcolm (1990) y la deuda',
    8: 'El expediente de la casa: M.E.T.A.S contado con honradez',
  },
  anzuelo: {
    1: 'El transporte narrativo: por qué baja la guardia (Green y Brock, 2000)',
    2: 'El pitch de tres frases: quién, qué cambia y la brecha',
    3: 'La historia de marca, sin inflarla',
    4: 'Datos y relato en la misma página: el freno de la casa',
    5: 'La convocatoria: contar para pedir, con honradez',
    6: 'La objeción como aliada: conceder y contestar',
    7: 'El anzuelo que no engaña: la línea que no se cruza',
  },
  mundo: {
    1: 'La promesa del comienzo: el contrato del final (Kermode, 1967)',
    2: 'La subtrama que sostiene: tejer varios hilos',
    3: 'El mundo con reglas: coherencia que no se contradice',
    4: 'La serie: el episodio cerrado y el arco abierto',
    5: 'Sembrar y cosechar: la escopeta de Chéjov a distancia',
    6: 'El medio: cómo no perder al lector en el pantano',
    7: 'El final que la historia se ganó: cerrar los huecos abiertos',
  },
  taller: {
    1: 'El diagnóstico de escena: la cuenta de valor a todo el borrador',
    2: 'Los lectores de prueba, y las cuatro preguntas que sí informan',
    3: 'El cuaderno de robos honrados: qué le tomaste a quién',
    4: 'Matar la escena que amas: el corte que duele y por qué',
    5: 'La sala de escritores: dar y recibir crítica con método',
    6: 'Enseñar a contar: cómo se transmite el oficio',
    7: 'El portafolio del maestro: la obra que te representa',
    8: 'La prueba de dominio: la misma historia en 30 segundos, 3 minutos y 30 minutos',
  },
  /* Los títulos salen de los seis módulos de la Metacognición en
     COMPENDIO-ESTUDIO-MAYOR.md, para que el mapa enseñe el camino entero
     desde el primer día, como se hizo con la Ley. */
  espejo: {
    2: 'Las trampas del «ya me lo sé»',
    3: 'El pleito de Dunning-Kruger',
    4: 'Lo que sí rinde y por qué duele',
    5: 'El protocolo de la casa',
    6: 'El termómetro calibrado',
  },
  barro: {
    /* La etapa 1 ya está construida (misión 39), así que sale de aquí: lo
       previsto y lo hecho no pueden anunciarse dos veces en el mismo mapa. */
    2: "La sinapsis que aprende",
    3: "Ventanas que se entornan",
    4: "El oficio esculpe, con recibo",
    5: "La noche que archiva",
    6: "El derribo, mito por mito",
  },
  partitura: {
    1: "La partitura y sus marcas",
    2: "Los tres lápices",
    3: "El invierno del hambre",
    4: "Las ratas de Meaney",
    5: "La herencia en disputa",
    6: "El inflado y la casa",
  },
  manana: {
    1: "Akrasia: el pleito es viejo",
    2: "La ecuación de Steel",
    3: "Las curvas de Ainslie",
    4: "No es pereza: es el mal rato",
    5: "Lo que sí funciona",
    6: "El músculo que no existía",
  },
  brujula: {
    /* La 1 ya no se anuncia: está construida (ver MISSIONS). */
    2: "Dos velocidades: metáfora, no anatomía",
    3: "El abogado del ambiente",
    4: "Ruido: el error que nadie mira",
    5: "Por qué avisar no cura",
    6: "El telón de la réplica",
  },
  apuesta: {
    /* La 1 y la 2 ya no se anuncian: están construidas (ver MISSIONS). En esta
       lista solo viven las etapas que todavía no existen como misión. */
    3: "Bayes contado con los dedos",
    4: "Puertas de ida y vuelta, y cuánto se apuesta",
    5: "El entierro antes del viaje",
    6: "Decidir juntos, explorar y parar",
  },
  puente: {
    1: "Desarmar la frase",
    2: "Tres varas de medir",
    3: "El gimnasio de Aristóteles",
    4: "Los cuatro movimientos",
    5: "Tres maneras de concluir",
    6: "El andamio de Toulmin y la carga de la prueba",
  },
  trasluz: {
    1: "El mapa de las trampas",
    2: "Los espejos falsos",
    3: "La familia de la pertinencia y el tenedor",
    4: "Presunción y palabra doble",
    5: "La inducción coja y la pendiente con motor",
    6: "La disciplina del acero",
  },
  discurso: {
    1: "El pleito de Siracusa",
    2: "Las tres pruebas y el momento",
    3: "Los cinco cánones y el esqueleto",
    4: "Los tres géneros y el disfraz",
    5: "Las figuras que aún trabajan",
    6: "El auditorio de Perelman y el taller",
  },
  piedras: {
    1: "Las piedras de Demóstenes",
    2: "El fuelle y la voz",
    3: "La pausa: el silencio del que manda",
    4: "El miedo, con la evidencia en la mano",
    5: "Hablar sin papel: el palacio y la escalera",
    6: "El gimnasio: debate y rúbrica",
  },
  cartas: {
    1: "Dos juegos con las mismas piezas",
    2: "Estirar lo dicho",
    3: "Cargar los dados de la pregunta",
    4: "El golpe al jugador y el guiño al público",
    5: "La mala fe con wifi",
    6: "No hacerlo sin darse cuenta",
  },
  tinta: {
    1: "La voz que cuenta",
    2: "Mostrar, decir y los dos relojes",
    3: "La ironía, o el texto que sabe más que su voz",
    4: "La lista de la casa y el canon como pregunta",
    5: "Lo que la ficción hace en la cabeza",
    6: "Escribir para haber leído",
  },
  milcaras: {
    1: "El viaje del héroe, estación por estación",
    2: "Las cuatro funciones y el motor de abajo",
    3: "La crítica con nombre: el molde se hace cierto recortando",
    4: "El memo que se comió a Hollywood",
    5: "El Popol Vuh: los mitos de la vecindad",
    6: "Comparada de verdad: griegos, nórdicos y el mapa de los géneros",
  },
  templo: {
    1: "Las dos manos: cómo se lee lo sagrado",
    2: "El tronco de Abraham: judaísmo, cristianismo, islam",
    3: "El tronco del Ganges: hinduismo, budismo y la era axial",
    4: "Los argumentos sobre Dios, con las dos espadas",
    5: "El problema del mal: Job, Epicuro y la teodicea",
    6: "La religión como tecnología social: Durkheim y la secularización que no llegó",
    7: "El cielo de la vecindad: catolicismo, pentecostalismo y Honduras",
  },
  pagina: {
    1: "La hoja donde caben los siglos",
    2: "Dos sillas y un texto",
    3: "No está en el cielo",
    4: "La página del día",
    5: "La explicación sin esencias",
    6: "Lo que esta casa se lleva",
  },
  marea: {
    1: "Los muertos que aún gobiernan",
    2: "El sobrino de Freud",
    3: "La multitud tiene razones",
    4: "Los clásicos en la báscula",
    5: "Anatomía de la marea",
    6: "Saber que estás dentro",
  },
  pantalla: {
    1: "El signo, la herramienta madre",
    2: "El poder de los símbolos, fuera de la pantalla",
    3: "La gramática de la pantalla",
    4: "El relato proyectado: estructuras y laberintos",
    5: "El cine que filosofa: las películas de la casa",
    6: "El oficio del crítico",
    7: "El cineclub de la casa",
  },
  mapa: {
    1: "El mapa pone el precio",
    2: "Tres lentes con dueño",
    3: "Los tres pisos del porqué",
    4: "Las venas del mundo y sus peajes",
    5: "La fuerza lenta",
    6: "Honduras en el tablero",
    7: "El analista de la casa",
  },
  mano: {
    1: "La regla y el reparto",
    2: "Los tres clásicos, enteros",
    3: "El siglo de la disputa",
    4: "Las reglas congeladas",
    5: "El político también cobra",
    6: "Honduras, el laboratorio",
  },
  /* Las etapas 1 y 2 ya están construidas: sus títulos salen de MISSIONS, no
     de aquí, igual que se hizo con espejo. */
  atomos: {
    3: "La frontera de la conciencia",
    4: "Los tres géneros y la symploké",
    5: "La caza de ídolos",
    6: "El oficio de desmontar",
  },
  semilla: {
    1: "La bola en las dos laderas",
    2: "El impuesto que nadie vota",
    3: "La única comida gratis",
    4: "Comprar certeza",
    5: "Leer las cuentas",
    6: "El río de las remesas",
    7: "El humo tiene estructura",
  },
  /* Las etapas 1, 2 y 3 ya están construidas: sus títulos salen de MISSIONS,
     no de aquí, igual que espejo, atomos y rojo. */
  gafas: {
    4: "El eje y la gente sin mapa",
    5: "Las gafas del que jura no llevarlas",
    6: "El detector en el texto",
    7: "Las gafas propias",
  },
  /* La etapa 1 ya está construida: su título sale de MISSIONS, no de aquí,
     igual que espejo y atomos. */
  rojo: {
    2: "La calculadora ciega",
    3: "El profeta ante el tribunal",
    4: "Los tres expedientes",
    5: "El escocés y lo que queda en pie",
    6: "El fantasma fabricado",
    7: "La guerra fría en el patio",
  },
  /* Las etapas 1 y 2 ya están construidas: sus títulos salen de MISSIONS, no
     de aquí, igual que se hizo con espejo, atomos y rojo. */
  dorado: {
    6: "La palabra gastada",
    7: "Visto desde el patio",
  },
  punteria: {
    1: "La fórmula que venció al doctor",
    2: "El número que nadie mira",
    3: "Veinte años contando aciertos",
    4: "El buey de Galton y la estampida",
    5: "La máquina que memoriza el pasado",
    6: "Donde el mapa se acaba",
  },
  umbral: {
    1: "Cuatro páginas de 1965",
    2: "El profeta con historial",
    3: "El argumento serio",
    4: "Los frenos",
    5: "El cementerio de profecías (y sus tumbas falsas)",
    6: "La aguja y los observables",
  },
  maquinaviene: {
    1: "La escalera y su final",
    2: "El deseo al pie de la letra",
    3: "Tareas, no empleos",
    4: "La maestra y el tutor incansable",
    5: "El tablero visto desde Honduras",
    6: "Lo que no se delega",
  },
  tesis: {
    1: "La pregunta que cabe en una frase",
    2: "Leer sin ahogarse",
    3: "El método a la vista",
    4: "La defensa de pie",
    5: "Lo que vende la universidad",
    6: "Del hallazgo a la obra",
    7: "El registro de pronósticos",
    8: "Las pruebas de dominio",
  },
};
