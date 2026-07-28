/* Catálogo de F.A.R.O.
   RUTAS  = series ordenadas por etapas (como en M.E.T.A.S). Una ruta declara
            cuántas etapas tendrá cuando esté completa, así el mapa muestra
            desde el principio lo que falta por construir.
   MISSIONS = lo que existe hoy. Cada misión dice a qué ruta pertenece y qué
            etapa ocupa; sin entrada aquí, para la aplicación no existe. */

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
  { id: 24, title: 'La IA que programa: qué revisar antes de subir', modulo: 'aprendizaje-unido', materia: 'ia', color: 'apr', xp: 45, icon: '⌨️', ruta: 'maquina', etapa: 4, sello: 'familiar', url: 'misiones/ruta-maquina-programa/programa.html' },
  { id: 25, title: 'Tácticas de presión y sus antídotos', modulo: 'aprendizaje-unido', materia: 'psi', color: 'apr', xp: 45, icon: '⏱️', ruta: 'persuasion', etapa: 4, sello: 'familiar', url: 'misiones/ruta-persuasion-presion/presion.html' },
  { id: 26, title: 'Canales: dónde está la audiencia y qué se publica', modulo: 'aprendizaje-unido', materia: 'mkt', color: 'apr', xp: 45, icon: '📡', ruta: 'marca', etapa: 4, sello: 'familiar', url: 'misiones/ruta-marca-canales/canales.html' },
  { id: 27, title: 'Del salario al activo: ingresos que no dependen de tus horas', modulo: 'aprendizaje-unido', materia: 'eco', color: 'apr', xp: 45, icon: '🌱', ruta: 'poder', etapa: 4, sello: 'familiar', url: 'misiones/ruta-poder-activo/activo.html' },
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
    5: 'Preguntar y escuchar: influir sin empujar',
    6: 'Narrativa: contar el proyecto para que otros quieran entrar',
  },
  marca: {
    5: 'Prueba y reputación: números reales y quien lo dice por ti',
    6: 'Crecer sin romper la promesa',
  },
  politico: {
    4: 'Alianzas, patronato y comunidad',
    5: 'El dinero público: presupuesto, compras y constancias',
    6: 'Reputación y riesgo político: no quedar amarrado a nadie',
  },
  maquina: {
    5: 'Datos, privacidad y las niñas',
    6: 'Qué se automatiza en M.E.T.A.S y qué no se le delega jamás',
  },
  casacerrada: {
    5: 'Copias y desastre: perder el teléfono, borrar sin querer',
    6: 'El engaño: phishing e ingeniería social en la familia',
  },
  poder: {
    5: 'Poder local: municipio, patronato y presupuesto público',
    6: 'Negociación: pedir, ceder y cerrar por escrito',
  },
};
