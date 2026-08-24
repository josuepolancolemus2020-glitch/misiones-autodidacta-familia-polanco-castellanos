'use strict';



const MEMBERS = [
  { id: 'josue',   name: 'Josué Edmundo Polanco Lemus',         short: 'Josué Edmundo', emoji: '👨' },
  { id: 'evelyn',  name: 'Evelyn Sarahi Castellanos Hernández', short: 'Evelyn Sarahi', emoji: '👩' },
  { id: 'jael',    name: 'Jael Polanco Castellanos',            short: 'Jael',          emoji: '🧒' },
  { id: 'angelly', name: 'Angelly Polanco Castellanos',         short: 'Angelly',       emoji: '👧' },
];

// Materias del área de aprendizaje. Las herramientas (Finanzas, Inventario,
// Hábitos…) viven en el Acceso Rápido y la barra inferior, no aquí.
const MATERIAS = [
  { id: 'esp',  label: 'Español',            sub: 'Lengua y Literatura', icon: 'fa-book-open',            color: 'esp' },
  { id: 'mat',  label: 'Matemáticas',        sub: 'Números y Lógica',    icon: 'fa-square-root-variable', color: 'mat' },
  { id: 'cnat', label: 'Ciencias Naturales', sub: 'Vida y Naturaleza',   icon: 'fa-flask',                color: 'cnat' },
  { id: 'csoc', label: 'Ciencias Sociales',  sub: 'Historia y Sociedad', icon: 'fa-earth-americas',       color: 'csoc' },
  { id: 'epis', label: 'Epistemología',      sub: 'Filosofía y Ciencia', icon: 'fa-brain',                color: 'bach' },
  /* Materias del adulto: lo que la familia necesita para manejar su propio
     proyecto. Conviven con las escolares, que siguen sirviendo a las hijas. */
  { id: 'ing',  label: 'Ingeniería del Sistema', sub: 'Estudiar lo que construimos', icon: 'fa-diagram-project', color: 'ing' },
  { id: 'psi',  label: 'Psicología y Persuasión', sub: 'Influencia, sesgos y defensa', icon: 'fa-masks-theater', color: 'psi' },
  { id: 'mkt',  label: 'Marketing y Marca',   sub: 'Audiencia, oferta y relato',   icon: 'fa-bullhorn',        color: 'mkt' },
  { id: 'eco',  label: 'Poder Económico',     sub: 'Dinero, activos y decisiones',  icon: 'fa-sack-dollar',     color: 'eco' },
  { id: 'pol',  label: 'Poder Político',      sub: 'Instituciones y negociación',   icon: 'fa-landmark',        color: 'pol' },
  { id: 'cib',  label: 'Ciberseguridad',      sub: 'La casa cerrada: llaves y datos', icon: 'fa-shield-halved', color: 'cib' },
  { id: 'ia',   label: 'Inteligencia Artificial', sub: 'La máquina que predice',      icon: 'fa-robot',         color: 'ia' },
  { id: 'ley',  label: 'Derecho y Ley',       sub: 'La ley por dentro y sus grietas', icon: 'fa-scale-balanced', color: 'ley' },
  /* Storytelling entra con chip propio y no dentro del Estudio Mayor porque no
     es una materia de auditoría: es un OFICIO que atraviesa a casi todas las
     demás (el relato de la Marca, el guion de video de cada misión, la defensa
     de la tesis, el careo de las Lecturas). Una materia que se usa desde otras
     doce tiene que poder encontrarse por su nombre en el filtro. */
  { id: 'story', label: 'Storytelling',       sub: 'Narrativa: contar para que se entienda y se recuerde', icon: 'fa-feather-pointed', color: 'story' },
  /* Una sola materia para las veintisiete del Estudio Mayor: si cada una
     trajera su chip, el filtro de la portada se vuelve inusable. */
  { id: 'mayor', label: 'Estudio Mayor',      sub: 'Las materias del compendio de la casa', icon: 'fa-book-open-reader', color: 'mayor' },
];

const LEVELS = [
  { n: 1, min:   0, max:  99,       label: 'Explorador', emoji: '🌱' },
  { n: 2, min: 100, max: 249,       label: 'Aprendiz',   emoji: '📚' },
  { n: 3, min: 250, max: 499,       label: 'Estudioso',  emoji: '🔍' },
  { n: 4, min: 500, max: 799,       label: 'Académico',  emoji: '⚡' },
  { n: 5, min: 800, max: Infinity,  label: 'Sabio',      emoji: '🏆' },
];



/* ─────────────────────────────────────────────
   STATE · perfiles por miembro de la familia
───────────────────────────────────────────── */

const KEY = 'faro_v1';

function blankMemberState() {
  return { xp: 0, visited: [], lastVisited: [] };
}

function blank() {
  const members = {};
  MEMBERS.forEach(m => { members[m.id] = blankMemberState(); });
  return { currentMember: MEMBERS[0].id, members };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const state = Object.assign(blank(), parsed);
      state.members = Object.assign({}, blank().members, parsed.members);
      MEMBERS.forEach(m => { if (!state.members[m.id]) state.members[m.id] = blankMemberState(); });
      if (!MEMBERS.find(m => m.id === state.currentMember)) state.currentMember = MEMBERS[0].id;
      return state;
    }
  } catch (_) {}
  return blank();
}

function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {}
}

function getMember(id) {
  return MEMBERS.find(m => m.id === id) || MEMBERS[0];
}

function memberState(s, id) {
  return s.members[id || s.currentMember] || blankMemberState();
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
}

function xpPct(xp) {
  const lv = getLevel(xp);
  if (lv.n === 5) return 100;
  return Math.round(((xp - lv.min) / (lv.max - lv.min + 1)) * 100);
}

function featuredMission(ms) {
  const unvisited = MISSIONS.filter(m => !ms.visited.includes(m.id));
  if (unvisited.length) {
    const idx = Math.floor(Date.now() / 86400000) % unvisited.length;
    return unvisited[idx];
  }
  return MISSIONS.reduce((a, b) => a.xp > b.xp ? a : b);
}

/* ─────────────────────────────────────────────
   ROTACIÓN AUTOMÁTICA DE FRASES (tiempo basado en lectura)
───────────────────────────────────────────── */

// Velocidad de lectura promedio en español: ~200 palabras/minuto
// Buffer 1.8× para dar tiempo de comprensión
const WPM        = 200;
const READ_BUF   = 1.8;
const MIN_DELAY  = 14000;  // mínimo 14 s (textos muy cortos)
const MAX_DELAY  = 95000;  // máximo 95 s (textos muy largos)

let _motivIdx   = Math.floor(Math.random() * FRASES.length);
let _rotTimeout = null;

function calcReadingDelay() {
  const frase = FRASES[_motivIdx];
  const words = frase.texto.trim().split(/\s+/).filter(Boolean).length;
  const ms    = Math.round((words / WPM) * 60 * READ_BUF * 1000);
  return Math.min(MAX_DELAY, Math.max(MIN_DELAY, ms));
}

function fadeUpdate(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(6px)';
  setTimeout(() => {
    el.textContent = text;
    el.style.opacity = '';
    el.style.transform = '';
  }, 280);
}

function tickRotation() {
  _motivIdx = (_motivIdx + 1) % FRASES.length;
  const frase = FRASES[_motivIdx];
  fadeUpdate('motiv-text',  frase.texto);
  fadeUpdate('motiv-autor', '· ' + frase.autor);
  scheduleNextTick();
}

function scheduleNextTick() {
  clearTimeout(_rotTimeout);
  _rotTimeout = setTimeout(tickRotation, calcReadingDelay());
}

/* ─────────────────────────────────────────────
   RENDER · MÓDULOS
───────────────────────────────────────────── */

function renderModules() {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;

  grid.innerHTML = MATERIAS.map(mat => {
    const total = MISSIONS.filter(m => m.materia === mat.id).length;
    const countText = total === 0 ? 'Próximamente'
      : (total === 1 ? '1 misión' : `${total} misiones`);
    return `
      <button class="module-card ${mat.color}${total ? '' : ' soon'}" data-materia="${mat.id}">
        <i class="fa-solid ${mat.icon} mod-icon"></i>
        <span class="mod-title">${mat.label}</span>
        <span class="mod-sub">${mat.sub}</span>
        <span class="mod-count">${countText}</span>
      </button>`;
  }).join('');
}

function goToMateria(matId) {
  _materiaFilter = matId || '';
  switchView('view-misiones');
}

/* ─────────────────────────────────────────────
   RENDER · HOME
───────────────────────────────────────────── */

function renderHome() {
  const s      = load();
  const member = getMember(s.currentMember);
  const ms     = memberState(s, s.currentMember);

  // Saludo
  document.getElementById('home-name').textContent = member.short + '!';

  // Mantener el selector "Ver Miembro" sincronizado con el perfil activo
  const memberEl = document.getElementById('member-select');
  if (memberEl && memberEl.value !== s.currentMember) memberEl.value = s.currentMember;

  // Frase motivacional (índice global de rotación)
  const frase = FRASES[_motivIdx];
  document.getElementById('motiv-text').textContent  = frase.texto;
  document.getElementById('motiv-autor').textContent = '· ' + frase.autor;

  // Módulos
  renderModules();

  /* Contador de sugerencias de M.E.T.A.S sin abrir, en su tarjeta del
     Acceso Rápido. Es una consulta de solo contar, sin bajar ni una
     fila; si el SQL todavía no se ha corrido, la insignia simplemente
     no aparece y nadie se entera.
     Se pinta desde aquí porque renderHome se vuelve a llamar cuando la
     sesión termina de restaurarse (ver aplicarSesion en auth.js), que
     es el primer momento en que la base contesta algo. */
  if (typeof msugContarSinAbrir === 'function') msugContarSinAbrir();

  // Misión destacada
  const m    = featuredMission(ms);
  const done = ms.visited.includes(m.id);
  const card = document.getElementById('featured-card');
  card.innerHTML = `
    <div class="feat-label">★ Misión destacada</div>
    <div class="feat-title">${m.icon} ${m.title}</div>
    <div class="feat-actions">
      <div class="feat-xp">
        <i class="fa-solid fa-star"></i>
        ${done ? 'Ya visitada' : `+${m.xp} XP`}
      </div>
      <button class="feat-btn">
        ${done ? 'Repetir' : 'Iniciar'} <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;
  card.onclick = () => visitMission(m.id);

  const wrap   = document.getElementById('recent-wrap');
  const list   = document.getElementById('recent-list');
  const recent = (ms.lastVisited || [])
    .slice(0, 3)
    .map(id => MISSIONS.find(m => m.id === id))
    .filter(Boolean);

  if (recent.length === 0) {
    wrap.hidden = true;
  } else {
    wrap.hidden = false;
    list.innerHTML = recent.map(m => `
      <a class="small-item" onclick="visitMission(${m.id}); return false;" href="${m.url}">
        <div class="small-icon ${m.color}">${m.icon}</div>
        <div class="small-info">
          <div class="small-title">${m.title}</div>
        </div>
        <i class="fa-solid fa-chevron-right small-arrow"></i>
      </a>
    `).join('');
  }
}

/* ─────────────────────────────────────────────
   RENDER · MISSIONS (Aprendizaje Unido)
───────────────────────────────────────────── */

function renderMissions(query) {
  const s  = load();
  const ms = memberState(s, s.currentMember);

  // Chips de materia sincronizados con el filtro activo
  document.querySelectorAll('#materia-chips .fam-chip').forEach(c =>
    c.classList.toggle('fam-chip-active', (c.dataset.materia || '') === _materiaFilter));

  const container = document.getElementById('missions-container');
  let list = [...MISSIONS];

  if (_materiaFilter) list = list.filter(m => m.materia === _materiaFilter);

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(m => m.title.toLowerCase().includes(q));
  }

  if (!list.length) {
    const mat = MATERIAS.find(x => x.id === _materiaFilter);
    container.innerHTML = _materiaFilter && !(query && query.trim())
      ? `<div class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>Aún no hay misiones de ${mat ? mat.label : 'esta materia'}</h3>
          <p>Muy pronto agregaremos misiones aquí.</p>
        </div>`
      : `<div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>Intenta con otro término de búsqueda.</p>
        </div>`;
    return;
  }

  container.innerHTML = list.map(m => {
    const visited = ms.visited.includes(m.id);
    return `
      <a class="mission-card ${visited ? 'visited' : ''}"
         onclick="visitMission(${m.id}); return false;"
         href="${m.url}">
        <div class="mc-icon ${m.color}">${m.icon}</div>
        <div class="mc-info">
          <div class="mc-title">${m.sello === 'familiar' ? '<span class="mc-sello" title="Material solo de la familia: no se publica">🔒</span> ' : ''}${m.title}</div>
          <div class="mc-meta">
            ${visited
              ? `<span class="mc-done"><i class="fa-solid fa-check"></i> Visitada</span>`
              : `<span class="mc-xp"><i class="fa-solid fa-star"></i> +${m.xp} XP</span>`}
          </div>
        </div>
        <i class="fa-solid fa-chevron-right mc-arrow"></i>
      </a>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   RENDER · RUTAS
   Una ruta es una serie ordenada por etapas. El mapa enseña el camino
   COMPLETO: las etapas que ya existen como misión (con su estado para el
   miembro activo) y las que están previstas pero aún no construidas, que
   se ven en gris y no se pueden tocar. Así se sabe siempre cuánto falta.
───────────────────────────────────────────── */

/* Las asignaciones metalingüísticas ocupan etapas de la Ruta de la Ingeniería
   pero NO son misiones: no tienen quiz ni XP automático, así que no están en
   MISSIONS (si estuvieran, las sondas que recorren el catálogo buscando un
   quiz fallarían). Por eso el mapa de rutas las lee de aquí. */
function asignacionesDeRuta(rutaKey) {
  if (rutaKey !== 'ingenieria' || typeof ASIGNACIONES === 'undefined') return [];
  return ASIGNACIONES;
}

function rutaEtapas(rutaKey) {
  const ruta  = RUTAS[rutaKey];
  const hechas = MISSIONS.filter(m => m.ruta === rutaKey).sort((a, b) => (a.etapa || 0) - (b.etapa || 0));
  const asigs = asignacionesDeRuta(rutaKey);
  const total = Math.max(ruta.etapas || 0, ...hechas.map(m => m.etapa || 0), ...asigs.map(a => a.n || 0), 0);
  const previstas = (typeof ETAPAS_PREVISTAS !== 'undefined' && ETAPAS_PREVISTAS[rutaKey]) || {};
  const etapas = [];
  for (let n = 1; n <= total; n++) {
    const mision = hechas.find(m => m.etapa === n);
    if (mision) { etapas.push({ n, mision, titulo: mision.title, existe: true }); continue; }
    const asig = asigs.find(a => a.n === n);
    if (asig) { etapas.push({ n, asig, titulo: asig.titulo, existe: true }); continue; }
    etapas.push({ n, titulo: previstas[n] || 'Etapa por construir', existe: false });
  }
  return { ruta, etapas, total, hechas: hechas.length + asigs.length };
}

/* El nombre GENERAL de la materia de una ruta, para que la tarjeta diga de qué
   se estudia y no solo cómo se llama el camino. Sale de dos sitios y en este
   orden: el campo `materia` del catálogo si la ruta lo declara (lo declaran las
   veintiocho del Estudio Mayor, que comparten el color 'mayor' y por eso no se
   distinguen por él), y si no, el `label` de MATERIAS que ya existe para ese
   color. Así el rótulo no se escribe dos veces: donde ya había un nombre bueno,
   se reutiliza. El `find` mira `id` y también `color` porque hay materias donde
   los dos no coinciden (Epistemología lleva el color 'bach'). */
function materiaDeRuta(ruta) {
  if (ruta.materia) return ruta.materia;
  const mat = MATERIAS.find(m => m.id === ruta.color) || MATERIAS.find(m => m.color === ruta.color);
  return mat ? mat.label : '';
}

/* ── Cómo se explora esto sin perderse ──
   Pedido del autor el 20 de agosto de 2026, con el mapa abierto en la tableta:
   «que permanezcan acopladas, que sea el usuario que decida desplegar la
   materia, y que no haga tanto scroll, que serán muchas materias».

   Hoy son 38 rutas y 39 misiones, y esto solo crece. Una lista plana de 38
   tarjetas son varios metros de barrido aunque cada una esté plegada, así que
   la pantalla gana un nivel por encima: LA MATERIA. Once materias plegadas
   caben en pantalla y media, y de ahí se baja a lo que se busca.

   Tres decisiones, y las tres tienen su porqué:

   1. TODO ARRANCA PLEGADO. El criterio anterior (abrir sola la ruta que ya
      tuviera una etapa construida) se pensó cuando había cuatro rutas; con 38
      significa abrir casi todo y devolver el problema.

   2. UNA MATERIA CON UNA SOLA RUTA ABRE DIRECTO SUS ETAPAS. Diez de las once
      materias tienen exactamente una ruta, y obligarlas a dos toques sería
      cobrar un peaje por un nivel que ahí no separa nada. El nivel intermedio
      solo lo necesita el Estudio Mayor, que trae 28.

   3. TODO SE PINTA Y SE ESCONDE CON `hidden`, nunca se crea al abrir. Además de
      ser más simple, hay 38 sondas que buscan las tarjetas de ruta en el
      documento para comprobar sus etapas: si el contenido naciera al desplegar,
      dejarían de encontrar nada sin que nadie hubiera roto la pantalla.

   El estado vive en el MISMO almacén que todo lo demás (KEY 'faro_v1'), pero
   fuera de `members`: que algo esté plegado es una preferencia de pantalla del
   aparato, no progreso de nadie, y no tendría sentido que se reiniciara al
   cambiar de perfil. */

/* Las materias, en el orden en que se enseñan, con las rutas que cuelgan de
   cada una. La clave de agrupación es el `color` de la ruta, que es lo que ya
   la ata a su materia en MATERIAS; las 28 del Estudio Mayor comparten el color
   'mayor' y por eso caen juntas, que es justo lo que se quiere. */
function materiasConRutas() {
  const porColor = {};
  Object.keys(RUTAS).forEach(key => {
    const c = RUTAS[key].color;
    (porColor[c] = porColor[c] || []).push(key);
  });
  const grupos = [];
  MATERIAS.forEach(m => {
    const claves = porColor[m.color] || porColor[m.id] || [];
    if (claves.length) grupos.push({ id: m.id, label: m.label, sub: m.sub, color: m.color, rutas: claves });
    delete porColor[m.color]; delete porColor[m.id];
  });
  /* Una ruta con un color que no está en MATERIAS no puede desaparecer del
     mapa en silencio: cae en su propio grupo con el color por nombre, feo y
     visible, que es como se arregla. */
  Object.keys(porColor).forEach(c => {
    grupos.push({ id: c, label: c, sub: '', color: c, rutas: porColor[c] });
  });
  return grupos;
}

function rutaAbiertaPorDefecto(rutasEnLaMateria) {
  /* Ver la decisión 2 de arriba: si la materia trae una sola ruta, abrir la
     materia ya es abrir la ruta. */
  return rutasEnLaMateria === 1;
}

function rutaAbierta(s, key, rutasEnLaMateria) {
  const guardado = (s && s.rutasAbiertas) || {};
  return typeof guardado[key] === 'boolean' ? guardado[key] : rutaAbiertaPorDefecto(rutasEnLaMateria);
}

function materiaAbierta(s, id) {
  const guardado = (s && s.materiasAbiertas) || {};
  return guardado[id] === true;
}

function alternarMateria(id, btn) {
  if (!btn) return;
  const abierta = btn.getAttribute('aria-expanded') === 'true';
  const s = load();
  s.materiasAbiertas = Object.assign({}, s.materiasAbiertas);
  s.materiasAbiertas[id] = !abierta;
  save(s);
  btn.setAttribute('aria-expanded', String(!abierta));
  const panel = document.getElementById('materia-rutas-' + id);
  if (panel) panel.hidden = abierta;
  const grupo = btn.closest('.materia-grupo');
  if (grupo) grupo.classList.toggle('materia-grupo-plegado', abierta);
}

/* Volver a la vista compacta de un toque. Sin esto, quien abrió el Estudio
   Mayor para mirar una cosa se queda con 28 rutas desplegadas para siempre,
   porque el estado se recuerda a propósito. */
function plegarTodasLasRutas() {
  const s = load();
  s.materiasAbiertas = {};
  s.rutasAbiertas = {};
  save(s);
  const buscador = document.getElementById('rutas-buscar');
  if (buscador) buscador.value = '';
  renderRutas();
  const cont = document.getElementById('rutas-container');
  if (cont && cont.scrollIntoView) cont.scrollIntoView({ block: 'start' });
}

function alternarRuta(key, btn) {
  if (!btn) return;
  const abierta = btn.getAttribute('aria-expanded') === 'true';
  const s = load();
  s.rutasAbiertas = Object.assign({}, s.rutasAbiertas);
  s.rutasAbiertas[key] = !abierta;
  save(s);
  /* Se toca el DOM en vez de volver a pintar toda la lista: un re-render deja
     sin foco al botón que se acaba de pulsar y con el teclado se pierde el
     sitio. */
  btn.setAttribute('aria-expanded', String(!abierta));
  const panel = document.getElementById('ruta-etapas-' + key);
  if (panel) panel.hidden = abierta;
  const card = btn.closest('.ruta-card');
  if (card) card.classList.toggle('ruta-card-plegada', abierta);
}

/* Texto plano para buscar: sin tildes y en minúsculas, porque nadie escribe
   «metacognición» con la tilde puesta cuando busca a toda prisa. */
function rutasPelar(t) {
  return String(t == null ? '' : t).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* Lo que el buscador mira de una ruta: su materia, su nombre, su lema y el
   título de TODAS sus etapas, construidas o no. Buscar «hebb» tiene que llevar
   a la etapa, que es lo que uno quiere estudiar, y no obligar a saberse de
   memoria en qué ruta cae. */
function rutaCoincide(consulta, materiaLabel, ruta, etapas) {
  if (!consulta) return { ruta: true, etapas: null };
  const q = rutasPelar(consulta);
  const enCabecera = [materiaLabel, ruta.nombre, ruta.lema, materiaDeRuta(ruta)]
    .some(t => rutasPelar(t).includes(q));
  const etapasQueCoinciden = etapas.filter(e => rutasPelar(e.titulo).includes(q)).map(e => e.n);
  return {
    ruta: enCabecera || etapasQueCoinciden.length > 0,
    /* Si la ruta coincide por su cabecera se enseñan TODAS sus etapas: quien
       buscó la ruta la quiere entera. Si coincide solo por una etapa, se
       resaltan esas y las demás se quedan apagadas, no escondidas, para no
       romper la numeración de la serie. */
    etapas: enCabecera ? null : etapasQueCoinciden,
  };
}

function renderRutas() {
  const cont = document.getElementById('rutas-container');
  if (!cont) return;
  const s  = load();
  const ms = memberState(s, s.currentMember);
  const buscador = document.getElementById('rutas-buscar');
  const consulta = buscador ? buscador.value.trim() : '';

  let rutasVisibles = 0, etapasVisibles = 0;

  const html = materiasConRutas().map(grupo => {
    const nRutas = grupo.rutas.length;
    /* Buscando, los grupos se abren solos para que el resultado se vea sin
       tener que ir abriendo cajones. Eso NO se guarda: es el efecto de la
       búsqueda, no una decisión del usuario. */
    const abiertaMateria = consulta ? true : materiaAbierta(s, grupo.id);
    const panelId = 'materia-rutas-' + grupo.id;

    let construidasMateria = 0, totalMateria = 0, visitadasMateria = 0;
    let algunaVisible = false;

    const tarjetas = grupo.rutas.map(key => {
      const { ruta, etapas, total, hechas } = rutaEtapas(key);
      const visitadas = etapas.filter(e => e.existe && (e.asig
        ? estadoAsignacion(ms, e.asig.id).estado === 'defendida'
        : ms.visited.includes(e.mision.id))).length;
      construidasMateria += hechas; totalMateria += total; visitadasMateria += visitadas;

      const pct = total ? Math.round((visitadas / total) * 100) : 0;
      const materia = materiaDeRuta(ruta);
      const coincide = rutaCoincide(consulta, grupo.label, ruta, etapas);
      if (coincide.ruta) { algunaVisible = true; rutasVisibles++; }
      /* Buscando, la ruta que coincide se abre para enseñar dónde cayó. */
      const abierta = consulta ? true : rutaAbierta(s, key, nRutas);
      const listaId = 'ruta-etapas-' + key;

      return `
      <div class="ruta-card ${abierta ? '' : 'ruta-card-plegada'}"${coincide.ruta ? '' : ' hidden'}>
        <h4 class="ruta-cabecera">
          <button type="button" class="ruta-toggle" aria-expanded="${abierta}" aria-controls="${listaId}"
                  onclick="alternarRuta('${key}', this)">
            <span class="ruta-emoji" aria-hidden="true">${ruta.emoji}</span>
            <span class="ruta-titulos">
              <span class="ruta-materia">${materia}</span>
              <span class="ruta-nombre">${ruta.nombre}</span>
            </span>
            <i class="fa-solid fa-chevron-down ruta-chevron" aria-hidden="true"></i>
          </button>
        </h4>
        <p class="ruta-lema">${ruta.lema}</p>
        <div class="ruta-barra-wrap">
          <div class="ruta-barra" style="width:${pct}%; background:var(--${ruta.color});"></div>
        </div>
        <p class="ruta-cuenta">${visitadas} de ${total} etapas recorridas · ${hechas} construida${hechas === 1 ? '' : 's'}</p>
        <ol class="ruta-etapas" id="${listaId}"${abierta ? '' : ' hidden'}>
          ${etapas.map(e => {
            const suelta = coincide.etapas && coincide.etapas.indexOf(e.n) < 0 ? ' ruta-etapa-apagada' : '';
            const hallada = coincide.etapas && coincide.etapas.indexOf(e.n) >= 0 ? ' ruta-etapa-hallada' : '';
            if (coincide.ruta && !suelta) etapasVisibles++;
            if (!e.existe) return `
              <li class="ruta-etapa ruta-etapa-futura${suelta}${hallada}">
                <span class="re-num">${e.n}</span>
                <span class="re-txt">${e.titulo}</span>
                <span class="re-estado">Por construir</span>
              </li>`;
            if (e.asig) {
              const est = estadoAsignacion(ms, e.asig.id);
              return `
              <li class="ruta-etapa ${est.estado === 'defendida' ? 'ruta-etapa-hecha' : ''}${suelta}${hallada}">
                <span class="re-num" style="background:var(--${ruta.color});">${e.n}</span>
                <a class="re-txt re-link" href="#" onclick="abrirAsignacion('${e.asig.id}'); return false;">${e.asig.icon} ${e.titulo}</a>
                <span class="re-estado">${est.estado === 'defendida' ? '✔ Defendida' : est.estado === 'curso' ? '✎ En curso' : '+' + e.asig.xp + ' XP'}</span>
              </li>`;
            }
            const visitada = ms.visited.includes(e.mision.id);
            return `
              <li class="ruta-etapa ${visitada ? 'ruta-etapa-hecha' : ''}${suelta}${hallada}">
                <span class="re-num" style="background:var(--${ruta.color});">${e.n}</span>
                <a class="re-txt re-link" href="${e.mision.url}" onclick="visitMission(${e.mision.id}); return false;">${e.mision.icon} ${e.titulo}</a>
                <span class="re-estado">${visitada ? '✔ Recorrida' : '+' + e.mision.xp + ' XP'}</span>
              </li>`;
          }).join('')}
        </ol>
      </div>`;
    }).join('');

    const pctMateria = totalMateria ? Math.round((visitadasMateria / totalMateria) * 100) : 0;
    const cuenta = nRutas === 1
      ? `${visitadasMateria} de ${totalMateria} etapas · ${construidasMateria} construida${construidasMateria === 1 ? '' : 's'}`
      : `${nRutas} rutas · ${visitadasMateria} de ${totalMateria} etapas · ${construidasMateria} construida${construidasMateria === 1 ? '' : 's'}`;

    return `
      <section class="materia-grupo ${abiertaMateria ? '' : 'materia-grupo-plegado'}"${algunaVisible ? '' : ' hidden'}>
        <h3 class="materia-cabecera">
          <button type="button" class="materia-toggle" aria-expanded="${abiertaMateria}" aria-controls="${panelId}"
                  onclick="alternarMateria('${grupo.id}', this)">
            <span class="materia-punto" aria-hidden="true" style="background:var(--${grupo.color});"></span>
            <span class="materia-titulos">
              <span class="materia-nombre">${grupo.label}</span>
              <span class="materia-cuenta">${cuenta}</span>
            </span>
            <span class="materia-barra-wrap" aria-hidden="true">
              <span class="materia-barra" style="width:${pctMateria}%; background:var(--${grupo.color});"></span>
            </span>
            <i class="fa-solid fa-chevron-down materia-chevron" aria-hidden="true"></i>
          </button>
        </h3>
        <div class="materia-rutas" id="${panelId}"${abiertaMateria ? '' : ' hidden'}>${tarjetas}</div>
      </section>`;
  }).join('');

  cont.innerHTML = html;

  const aviso = document.getElementById('rutas-resultado');
  if (aviso) {
    if (!consulta) { aviso.hidden = true; aviso.textContent = ''; }
    else {
      aviso.hidden = false;
      aviso.textContent = rutasVisibles
        ? `${rutasVisibles} ruta${rutasVisibles === 1 ? '' : 's'} con «${consulta}»`
        : `Nada con «${consulta}». Prueba con el nombre de una materia, de una ruta o de una etapa.`;
    }
  }
}

/* ─────────────────────────────────────────────
   RENDER · ASIGNACIONES METALINGÜÍSTICAS
   ─────────────────────────────────────────────
   No se aprueban en pantalla: el XP lo otorga quien tomó la defensa, así que
   aquí solo se registra el estado y quién la tomó. El producto (el documento)
   vive en la Bóveda, no aquí.
───────────────────────────────────────────── */

function estadoAsignacion(ms, id) {
  const todas = (ms && ms.asignaciones) || {};
  return todas[id] || { estado: 'nueva', tomo: '', fecha: '' };
}

function guardarAsignacion(id, cambios) {
  const s  = load();
  const ms = memberState(s, s.currentMember);
  ms.asignaciones = ms.asignaciones || {};
  ms.asignaciones[id] = Object.assign(estadoAsignacion(ms, id), cambios);
  s.members[s.currentMember] = ms;
  save(s);
  return ms;
}

function marcarAsignacion(id, estado) {
  const previo = estadoAsignacion(memberState(load(), null), id);
  /* El XP de una asignación se otorga UNA sola vez, al registrar la defensa.
     Volver a marcarla defendida no vuelve a pagar. */
  if (estado === 'defendida' && previo.estado !== 'defendida') {
    const asig = ASIGNACIONES.find(a => a.id === id);
    const sel  = document.getElementById('asig-tomo-' + id);
    const tomo = sel ? sel.value : '';
    if (!tomo) { alert('Antes de registrar la defensa hay que decir quién la tomó.'); return; }
    const s  = load();
    const ms = memberState(s, s.currentMember);
    ms.xp += (asig ? asig.xp : 0);
    ms.asignaciones = ms.asignaciones || {};
    ms.asignaciones[id] = { estado: 'defendida', tomo, fecha: new Date().toISOString().slice(0, 10) };
    s.members[s.currentMember] = ms;
    save(s);
  } else {
    guardarAsignacion(id, { estado });
  }
  renderAsignaciones();
  renderRutas();
}

function abrirAsignacion(id) {
  switchView('view-asignaciones');
  setTimeout(() => {
    const el = document.getElementById('asig-' + id);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

function renderAsignaciones() {
  const cont = document.getElementById('asignaciones-container');
  if (!cont || typeof ASIGNACIONES === 'undefined') return;
  const s  = load();
  const ms = memberState(s, s.currentMember);
  const defendidas = ASIGNACIONES.filter(a => estadoAsignacion(ms, a.id).estado === 'defendida').length;

  const cabecera = `
    <div class="asig-resumen">
      <p class="asig-cuenta"><strong>${defendidas}</strong> de ${ASIGNACIONES.length} asignaciones defendidas</p>
      <div class="ruta-barra-wrap"><div class="ruta-barra" style="width:${Math.round((defendidas / ASIGNACIONES.length) * 100)}%; background:var(--ing);"></div></div>
      <p class="asig-nota">Una asignación no se aprueba en pantalla: se defiende en voz alta, de pie y sin leer, delante de otro miembro de la familia. El XP lo otorga quien la toma.</p>
    </div>`;

  cont.innerHTML = cabecera + ASIGNACIONES.map(a => {
    const est = estadoAsignacion(ms, a.id);
    const opciones = MEMBERS.map(m => `<option value="${m.id}"${est.tomo === m.id ? ' selected' : ''}>${m.emoji} ${m.short}</option>`).join('');
    return `
      <details class="asig-card asig-${est.estado}" id="asig-${a.id}">
        <summary class="asig-head">
          <span class="asig-num">${a.n}</span>
          <span class="asig-icon" aria-hidden="true">${a.icon}</span>
          <span class="asig-titulos"><strong>${a.titulo}</strong><em>${a.lema}</em></span>
          <span class="asig-estado">${est.estado === 'defendida' ? '✔ Defendida' : est.estado === 'curso' ? '✎ En curso' : '+' + a.xp + ' XP'}</span>
        </summary>
        <div class="asig-cuerpo">
          <h4>1 · El encargo</h4>
          <p>${a.encargo}</p>
          <p class="asig-producto"><strong>Producto:</strong> ${a.producto}</p>

          <h4>2 · El material</h4>
          <ul class="asig-material">${a.material.map(m => `<li><code>${m.ruta}</code> ${m.que}</li>`).join('')}</ul>

          <h4>3 · El vocabulario obligatorio</h4>
          <p class="asig-nota">Si el producto no usa estos términos, y bien usados, no está terminado.</p>
          <div class="asig-vocab">${a.vocabulario.map(v => `<span class="asig-term">${v}</span>`).join('')}</div>

          <h4>4 · La defensa</h4>
          <p class="asig-nota">Cinco preguntas, respondidas sin leer.</p>
          <ol class="asig-defensa">${a.defensa.map(q => `<li>${q}</li>`).join('')}</ol>

          <h4>5 · El sello</h4>
          <p>${a.sello}</p>

          <div class="asig-cierre">
            <p><strong>Está terminada cuando:</strong> ${a.terminada}</p>
            <p><strong>El error típico:</strong> ${a.error}</p>
          </div>

          <div class="asig-acciones">
            <button class="asig-btn" onclick="marcarAsignacion('${a.id}','nueva')">Sin empezar</button>
            <button class="asig-btn" onclick="marcarAsignacion('${a.id}','curso')">✎ En curso</button>
            <label class="asig-tomo">La tomó:
              <select id="asig-tomo-${a.id}">${opciones}</select>
            </label>
            <button class="asig-btn asig-btn-ok" onclick="marcarAsignacion('${a.id}','defendida')">✔ Registrar defensa</button>
          </div>
          ${est.estado === 'defendida' ? `<p class="asig-acta">Defendida el ${est.fecha}, ante ${getMember(est.tomo).short}. +${a.xp} XP.</p>` : ''}
        </div>
      </details>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   RENDER · PROGRESS
───────────────────────────────────────────── */

function renderProgress() {
  const s      = load();
  const member = getMember(s.currentMember);
  const ms     = memberState(s, s.currentMember);
  const lv      = getLevel(ms.xp);
  const pct     = xpPct(ms.xp);

  document.getElementById('progress-overview').innerHTML = `
    <div class="progress-overview">
      <div class="po-member">Progreso de ${member.short}</div>
      <div class="po-emoji">${lv.emoji}</div>
      <div class="po-level">Nivel ${lv.n}</div>
      <div class="po-rank">${lv.label}</div>
      <div class="po-xp">${ms.xp}</div>
      <div class="po-xp-label">Puntos XP</div>
      <div class="po-bar-wrap">
        <div class="po-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="po-bar-lbls">
        <span>${lv.min} XP</span>
        <span>${lv.n < 5 ? (lv.max + 1) + ' XP' : 'Nivel máx.'}</span>
      </div>
    </div>`;

  document.getElementById('progress-subjects').innerHTML = `
    <h2 class="section-title" style="margin-bottom:12px;">Por materia</h2>
    ${MATERIAS.map(mat => {
      const total = MISSIONS.filter(m => m.materia === mat.id).length;
      const done  = MISSIONS.filter(m => m.materia === mat.id && ms.visited.includes(m.id)).length;
      const p = total ? Math.round((done / total) * 100) : 0;
      return `
        <div class="sp-item">
          <div class="sp-top">
            <span class="sp-name">${mat.label}</span>
            <span class="sp-cnt">${done} / ${total}</span>
          </div>
          <div class="sp-track">
            <div class="sp-fill" style="width:${p}%; background:var(--${mat.color});"></div>
          </div>
        </div>`;
    }).join('')}`;

  const visitedList = MISSIONS.filter(m => ms.visited.includes(m.id));
  document.getElementById('visited-missions').innerHTML = !visitedList.length
    ? `<div class="empty-state" style="margin-top:8px;">
        <div class="empty-icon">🚀</div>
        <h3>¡Empieza tu viaje!</h3>
        <p>Las misiones que visites aparecerán aquí.</p>
       </div>`
    : `<h2 class="section-title" style="margin:20px 0 12px;">
         Visitadas (${visitedList.length})
       </h2>
       <div class="missions-list">
         ${visitedList.map(m => `
           <a class="mission-card visited"
              onclick="visitMission(${m.id}); return false;"
              href="${m.url}">
             <div class="mc-icon ${m.color}">${m.icon}</div>
             <div class="mc-info">
               <div class="mc-title">${m.title}</div>
               <div class="mc-meta">
                 <span class="mc-done"><i class="fa-solid fa-check"></i> Visitada</span>
               </div>
             </div>
             <i class="fa-solid fa-chevron-right mc-arrow"></i>
           </a>`).join('')}
       </div>`;
}

/* ─────────────────────────────────────────────
   RENDER · PROFILE
───────────────────────────────────────────── */

function renderProfile() {
  // Sección solo muestra herramientas de familia (por ahora)
}

/* ─────────────────────────────────────────────
   VISIT MISSION
───────────────────────────────────────────── */

function visitMission(id) {
  const s = load();
  const m = MISSIONS.find(m => m.id === id);
  if (!m) return;

  const ms = memberState(s, s.currentMember);
  if (!ms.visited.includes(id)) {
    ms.xp += m.xp;
    ms.visited.push(id);
  }
  ms.lastVisited = [id, ...(ms.lastVisited || []).filter(x => x !== id)].slice(0, 5);
  s.members[s.currentMember] = ms;
  save(s);

  window.location.href = m.url;
}

window.visitMission = visitMission;

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */

let currentQuery = '';
let _materiaFilter = ''; // '' = todas las materias

function switchView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.drawer-item').forEach(b => b.classList.remove('active'));
  const view = document.getElementById(id);
  if (view) view.classList.add('active');
  const item = document.querySelector(`.drawer-item[data-view="${id}"]`);
  if (item) item.classList.add('active');

  // Barra inferior: marcar destino activo y ocultarla en el Chat
  // (ahí la barra de escritura ocupa el borde inferior).
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.style.display = id === 'view-chat' ? 'none' : 'flex';
    bottomNav.querySelectorAll('.nav-item').forEach(b =>
      b.classList.toggle('active', b.dataset.view === id));
  }

  if (id === 'view-inicio')   renderHome();
  if (id === 'view-misiones') renderMissions(currentQuery);
  if (id === 'view-rutas')    renderRutas();
  if (id === 'view-asignaciones') renderAsignaciones();
  if (id === 'view-progreso') renderProgress();
  if (id === 'view-perfil')   renderProfile();
  if (id === 'view-habitos' && typeof initHabitos === 'function') initHabitos();
  if (id === 'view-redes'   && typeof initRedes === 'function')   initRedes();
  if (id === 'view-collage')        initCollage();
  if (id === 'view-finanzas' && typeof initFinanzas === 'function') initFinanzas();
  if (id === 'view-fin-stats' && typeof initFinStats === 'function') initFinStats();
  if (id === 'view-inventario' && typeof initInventario === 'function') initInventario();
  if (id === 'view-destellos' && typeof initDestellos === 'function') initDestellos();
  if (id === 'view-redaccion' && typeof initRedaccion === 'function') initRedaccion();
  if (id === 'view-antena' && typeof initAntena === 'function') initAntena();
  if (id === 'view-boveda' && typeof initBoveda === 'function') initBoveda();
  if (id === 'view-msug' && typeof initMetasSug === 'function') initMetasSug();

  // El FAB de Destellos vive en toda la app, excepto en el Chat
  // (estorbaría sobre la barra de escritura) y el editor de Redacción
  // (taparía el texto mientras se escribe).
  const desFab = document.getElementById('destello-fab');
  if (desFab) {
    desFab.style.display =
      (id === 'view-chat' || id === 'view-redaccion-editor') ? 'none' : 'flex';
    // En las herramientas que tienen su propio botón "+" (Finanzas,
    // Inventario y la Bóveda) el destello se apila arriba para no tapar al "+".
    const vistasConMasFab = ['view-finanzas', 'view-inventario', 'view-boveda'];
    desFab.classList.toggle('destello-fab-apilado', vistasConMasFab.includes(id));
  }

  const scroll = document.querySelector(`#${id} .view-scroll`);
  if (scroll) scroll.scrollTop = 0;

  if (id === 'view-chat' && typeof chatScrollToBottom === 'function') chatScrollToBottom();
  if (id === 'view-chat' && typeof pushUpdateBannerUI === 'function') pushUpdateBannerUI();
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */

function toast(msg) {
  let el = document.getElementById('meta-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'meta-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // Si ya hay una sesión de familia activa, ese miembro es el perfil activo
  if (typeof verificarSesion === 'function') {
    const session = verificarSesion();
    if (session && MEMBERS.find(m => m.id === session.user)) {
      const s = load();
      s.currentMember = session.user;
      save(s);
    }
  }

  // Render inicial
  renderHome();

  // Iniciar rotación automática con tiempo adaptado a la lectura
  scheduleNextTick();

  // Si se regresa desde una misión con ?view=misiones, o desde una
  // notificación push del chat con ?view=chat, ir directamente
  const _urlParams = new URLSearchParams(window.location.search);
  if (_urlParams.get('view') === 'misiones') {
    switchView('view-misiones');
  } else if (_urlParams.get('view') === 'chat') {
    switchView('view-chat');
  }

  // Si la app ya estaba abierta y se tocó una notificación del chat
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'faro-open-chat') switchView('view-chat');
    });
  }

  // Selector de miembro
  const memberEl = document.getElementById('member-select');
  if (memberEl) {
    memberEl.value = load().currentMember;
    memberEl.addEventListener('change', () => {
      const s = load();
      s.currentMember = memberEl.value;
      save(s);
      renderHome();
      if (document.getElementById('view-progreso').classList.contains('active')) renderProgress();
      toast(`👋 Viendo F.A.R.O. como ${getMember(s.currentMember).short}`);
      memberEl.blur();
    });
  }

  // Barra de navegación inferior
  document.getElementById('bottom-nav')?.addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (btn) switchView(btn.dataset.view);
  });

  // Acceso Rápido del inicio
  document.getElementById('quick-access')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-qa]');
    if (!btn) return;
    if (btn.dataset.qa === 'escuela') {
      if (typeof finGoEscuela === 'function') finGoEscuela();
      return;
    }
    if (btn.dataset.qa === 'familia') {
      if (typeof finGoFamilia === 'function') finGoFamilia();
      return;
    }
    switchView(btn.dataset.qa);
  });

  // Tarjetas de "Materias de Aprendizaje"
  document.getElementById('modules-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('.module-card');
    if (btn) goToMateria(btn.dataset.materia);
  });

  // Chips de materia en la vista de misiones
  document.getElementById('materia-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('[data-materia]');
    if (!chip) return;
    _materiaFilter = chip.dataset.materia || '';
    renderMissions(currentQuery);
  });

  // ── Drawer / Hamburguesa ──
  function openDrawer() {
    document.getElementById('app-drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
  }
  function closeDrawer() {
    document.getElementById('app-drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.remove('open');
  }

  document.querySelectorAll('.hamburger-btn').forEach(btn => {
    btn.addEventListener('click', openDrawer);
  });
  document.getElementById('drawer-close-btn')?.addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-item').forEach(item => {
    item.addEventListener('click', () => {
      switchView(item.dataset.view);
      closeDrawer();
    });
  });

  // Búsqueda
  const searchEl = document.getElementById('search-input');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      currentQuery = searchEl.value;
      renderMissions(currentQuery);
    });
  }

  /* El buscador del mapa de rutas. Repinta entero en cada tecla, que con 38
     rutas cuesta menos de un cuadro y evita tener que llevar la cuenta de qué
     estaba escondido. */
  const buscarRutas = document.getElementById('rutas-buscar');
  if (buscarRutas) buscarRutas.addEventListener('input', () => renderRutas());

  // Notificaciones
  document.getElementById('notif-btn').addEventListener('click', () => {
    toast('Sin notificaciones nuevas por ahora');
  });

  // Acceso directo al Chat Familiar
  document.getElementById('chat-shortcut-btn')?.addEventListener('click', () => switchView('view-chat'));

  // El header ya no se oculta al hacer scroll: el efecto (transform +
  // margen negativo) reacomodaba el layout cerca del fondo y producía
  // la tembladera del encabezado. Los headers son compactos y fijos.

  /* ── Botón 🔄 Actualizar (mismo que en M.E.T.A.S) ──
     El sitio se publica con cada push, pero el teléfono guarda su copia:
     el service worker y las cachés siguen sirviendo lo viejo hasta que se
     renuevan. Este botón las borra y recarga, así que un toque basta para
     tener SIEMPRE la última versión, sin desinstalar ni limpiar a mano.
     Va en todos los encabezados para no perder el lugar donde se estaba. */
  /* La recarga, aparte, para poder examinarla desde una sonda sin que el
     navegador se lleve la página a mitad de la prueba. */
  function faroRecargar() { location.reload(); }
  window.faroRecargar = faroRecargar;

  async function faroForzarActualizacion(btn) {
    const ic = btn && btn.querySelector ? (btn.querySelector('i') || btn) : null;
    if (ic) { ic.classList.remove('spin'); void ic.offsetWidth; ic.classList.add('spin'); }

    /* ⚠️ PRIMERO GUARDAR, DESPUÉS RECARGAR.
       Este botón recarga la página entera, y con el editor de Redacción
       abierto eso se llevaba lo escrito desde el último guardado. Pasó el 5
       de agosto con un artículo a medias. Cada herramienta que tenga algo
       sin guardar se apunta en faroGuardadosPendientes y se le da su turno
       aquí; si alguna no pudo subir lo suyo, se avisa ANTES de recargar y
       se puede decir que no. */
    const avisos = [];
    for (const guardar of (window.faroGuardadosPendientes || [])) {
      try {
        const r = await guardar();
        if (r && r.ok === false && r.aviso) avisos.push(r.aviso);
      } catch (_) {}
    }
    if (avisos.length) {
      const seguir = confirm(
        '⚠️ Hay trabajo sin guardar:\n\n' + avisos.join('\n\n') +
        '\n\n¿Actualizar de todos modos?');
      if (!seguir) {
        if (ic) ic.classList.remove('spin');
        return;
      }
    }

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if (window.caches && caches.keys) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch (_) {}
    toast('🔄 Actualizando…');
    setTimeout(() => window.faroRecargar(), 250);
  }
  window.faroForzarActualizacion = faroForzarActualizacion;

  document.querySelectorAll('.app-header').forEach(h => {
    if (h.querySelector('.refresh-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'refresh-btn';
    btn.setAttribute('aria-label', 'Actualizar la aplicación');
    btn.title = 'Actualizar (traer lo último y quedarte donde estás)';
    btn.innerHTML = '<i class="fa-solid fa-arrow-rotate-right"></i>';

    /* El encabezado es una rejilla de tres columnas (atrás · título · hueco).
       Si el botón se cuelga suelto del encabezado ocupa una CUARTA celda y la
       rejilla lo baja a una segunda fila: el icono aparecía debajo del título.
       Por eso se envuelve la tercera celda en una zona de acciones y el botón
       entra ahí: siempre arriba, a la derecha, en la misma línea del título. */
    let actions = h.querySelector('.header-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'header-actions';
      const tercera = h.children[2];
      if (tercera) {
        h.replaceChild(actions, tercera);
        actions.appendChild(tercera);   // conserva lo que hubiera en esa celda
      } else {
        h.appendChild(actions);
      }
    }
    actions.insertBefore(btn, actions.firstChild);
  });

  document.querySelectorAll('.refresh-btn').forEach(b =>
    b.addEventListener('click', () => faroForzarActualizacion(b)));

});
