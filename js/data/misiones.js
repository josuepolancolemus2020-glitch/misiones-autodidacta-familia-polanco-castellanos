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
};

const MISSIONS = [
  { id: 1, title: 'Karl Popper y la Epistemología', modulo: 'aprendizaje-unido', materia: 'epis', color: 'apr', xp: 30, icon: '🦉', ruta: 'pensamiento', etapa: 1, url: 'misiones/epistemología/karl-popper.html' },
  { id: 2, title: 'El Sistema Nervioso',             modulo: 'aprendizaje-unido', materia: 'cnat', color: 'apr', xp: 35, icon: '🧠', ruta: 'cuerpo',      etapa: 1, url: 'misiones/misión-base-sistema-nervioso/sistema-nervioso.html' },
  { id: 3, title: 'Autocapacitación M.E.T.A.S · Módulo 1: Panorama técnico', modulo: 'aprendizaje-unido', materia: 'ing', color: 'apr', xp: 40, icon: '🏗️', ruta: 'ingenieria', etapa: 1, url: 'misiones/autocapacitacion-metas/modulo-1-panorama.html' },
  { id: 4, title: 'Autocapacitación M.E.T.A.S · Módulo 2: El frontend',      modulo: 'aprendizaje-unido', materia: 'ing', color: 'apr', xp: 40, icon: '🗺️', ruta: 'ingenieria', etapa: 2, url: 'misiones/autocapacitacion-metas/modulo-2-frontend.html' },
  { id: 5, title: 'Activos y Pasivos: qué mete y qué saca dinero',           modulo: 'aprendizaje-unido', materia: 'eco', color: 'apr', xp: 40, icon: '💰', ruta: 'poder',      etapa: 1, url: 'misiones/ruta-poder-activos-pasivos/activos-pasivos.html' },
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
  poder: {
    2: 'El presupuesto real: a dónde se va el dinero',
    3: 'La deuda por dentro: interés, plazo y costo total',
    4: 'Del salario al activo: ingresos que no dependen de tus horas',
    5: 'Poder local: municipio, patronato y presupuesto público',
    6: 'Negociación: pedir, ceder y cerrar por escrito',
  },
};
