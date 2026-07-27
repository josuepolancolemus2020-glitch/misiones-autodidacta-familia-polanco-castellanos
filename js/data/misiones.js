/* Catálogo de F.A.R.O.
   RUTAS  = series ordenadas por etapas (como en M.E.T.A.S). Una ruta declara
            cuántas etapas tendrá cuando esté completa, así el mapa muestra
            desde el principio lo que falta por construir.
   MISSIONS = lo que existe hoy. Cada misión dice a qué ruta pertenece y qué
            etapa ocupa; sin entrada aquí, para la aplicación no existe. */

const RUTAS = {
  ingenieria: { nombre: 'Ruta de la Ingeniería del Sistema', emoji: '🏗️', color: 'ing',  etapas: 8,
                lema: 'Estudiar M.E.T.A.S hasta poder defenderlo ante cualquier ingeniero' },
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
  { id: 12, title: 'La puerta de la casa digital: quién entra y con qué llave', modulo: 'aprendizaje-unido', materia: 'cib', color: 'apr', xp: 45, icon: '🔐', ruta: 'casacerrada', etapa: 1, sello: 'familiar', url: 'misiones/ruta-casa-cerrada-la-puerta/la-puerta.html' },
];

/* Nombre de cada etapa aún no construida, para que el mapa de rutas enseñe el
   camino completo y no solo lo hecho. Viene del temario oficial de la serie
   (PLAN-AUTOCAPACITACION.md en el repositorio de M.E.T.A.S). */
const ETAPAS_PREVISTAS = {
  ingenieria: {
    3: 'Datos locales: el corazón offline-first',
    4: 'La nube Supabase: tablas, funciones y roles',
    5: 'Seguridad: el módulo más interpelable',
    6: 'Distribución y ciclo de vida',
    7: 'Decisiones de ingeniería: los porqués',
    8: 'Glosario y simulacro final',
  },
  persuasion: {
    2: 'Sesgos: los atajos que deciden por ti',
    3: 'Marcos: quien pone el marco gana la conversación',
    4: 'Tácticas de presión y sus antídotos',
    5: 'Preguntar y escuchar: influir sin empujar',
    6: 'Narrativa: contar el proyecto para que otros quieran entrar',
  },
  casacerrada: {
    2: 'Los datos de los demás: menores, ley y sentido común',
    3: 'El código que no confía: validación, límites e inyección',
    4: 'Llaves y secretos: claves, entornos y repositorios',
    5: 'Copias y desastre: perder el teléfono, borrar sin querer',
    6: 'El engaño: phishing e ingeniería social en la familia',
  },
  poder: {
    2: 'El presupuesto real: a dónde se va el dinero',
    3: 'La deuda por dentro: interés, plazo y costo total',
    4: 'Del salario al activo: ingresos que no dependen de tus horas',
    5: 'Poder local: municipio, patronato y presupuesto público',
    6: 'Negociación: pedir, ceder y cerrar por escrito',
  },
};
