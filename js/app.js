'use strict';



const SUBJECT_LABELS = {
  'español':     'Español',
  'matemáticas': 'Matemáticas',
  'naturales':   'C. Naturales',
  'sociales':    'C. Sociales',
};

const LEVELS = [
  { n: 1, min:   0, max:  99,       label: 'Explorador', emoji: '🌱' },
  { n: 2, min: 100, max: 249,       label: 'Aprendiz',   emoji: '📚' },
  { n: 3, min: 250, max: 499,       label: 'Estudioso',  emoji: '🔍' },
  { n: 4, min: 500, max: 799,       label: 'Académico',  emoji: '⚡' },
  { n: 5, min: 800, max: Infinity,  label: 'Sabio',      emoji: '🏆' },
];



/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   MODAL SÍMBOLOS
───────────────────────────────────────────── */

const _simRegistry = new Map();

function openSimModal(key) {
  const s = _simRegistry.get(key);
  if (!s) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'sim-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  const imgHTML = s.img
    ? `<img src="${s.img}" alt="${s.nombre}" class="sim-modal-img">`
    : `<div class="sim-modal-emoji">${s.emoji}</div>`;

  backdrop.innerHTML = `
    <div class="sim-modal">
      ${imgHTML}
      <span class="sim-modal-badge">${s.tipo}</span>
      <div class="sim-modal-title">${s.nombre}</div>
      ${s.info ? `<p class="sim-modal-info">${s.info}</p>` : ''}
      <button class="sim-modal-close" aria-label="Cerrar">Cerrar ✕</button>
    </div>`;

  backdrop.querySelector('.sim-modal-close').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
  document.body.appendChild(backdrop);
}
window.openSimModal = openSimModal;

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */

const KEY = 'meta_v2';

function blank() {
  return { name: '', grade: '2y3ciclo', country: 'HN', xp: 0, visited: [], lastVisited: [] };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign(blank(), JSON.parse(raw));
  } catch (_) {}
  return blank();
}

function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {}
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

function displayName(s) {
  return s.name.trim() || 'Estudiante';
}

function featuredMission(s) {
  const unvisited = MISSIONS.filter(m => !s.visited.includes(m.id));
  if (unvisited.length) {
    const idx = Math.floor(Date.now() / 86400000) % unvisited.length;
    return unvisited[idx];
  }
  return MISSIONS.reduce((a, b) => a.xp > b.xp ? a : b);
}

/* ─────────────────────────────────────────────
   ROTACIÓN AUTOMÁTICA (tiempo basado en lectura)
───────────────────────────────────────────── */

// Velocidad de lectura promedio en español: ~200 palabras/minuto
// Buffer 1.8× para dar tiempo de comprensión
const WPM        = 200;
const READ_BUF   = 1.8;
const MIN_DELAY  = 14000;  // mínimo 14 s (textos muy cortos)
const MAX_DELAY  = 95000;  // máximo 95 s (textos muy largos)

let _motivIdx       = Math.floor(Math.random() * FRASES.length);
let _factIdx        = 0;
let _currentCountry = 'HN';
let _rotTimeout     = null;

function calcReadingDelay() {
  const frase = FRASES[_motivIdx];
  const data  = COUNTRY_DATA[_currentCountry];
  const fact  = data ? data.curiosidades[_factIdx % data.curiosidades.length] : null;
  // Contar palabras del texto visible actualmente
  const combined = [frase.texto, fact ? fact.texto : ''].join(' ');
  const words    = combined.trim().split(/\s+/).filter(Boolean).length;
  const ms       = Math.round((words / WPM) * 60 * READ_BUF * 1000);
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

function renderFactDots() {
  const dotsEl = document.getElementById('cc-dots');
  const data   = COUNTRY_DATA[_currentCountry];
  if (!dotsEl || !data) return;
  const total   = data.curiosidades.length;
  const visible = Math.min(total, 10);
  const active  = _factIdx % visible;
  dotsEl.innerHTML = Array.from({ length: visible }, (_, i) =>
    `<span class="cc-dot${i === active ? ' active' : ''}"></span>`
  ).join('');
}

function tickRotation() {
  _motivIdx = (_motivIdx + 1) % FRASES.length;
  _factIdx++;

  const frase = FRASES[_motivIdx];
  fadeUpdate('motiv-text',  frase.texto);
  fadeUpdate('motiv-autor', '— ' + frase.autor);

  const data = COUNTRY_DATA[_currentCountry];
  if (data) {
    const fact = data.curiosidades[_factIdx % data.curiosidades.length];
    fadeUpdate('cc-text',     fact.texto);
    fadeUpdate('cc-category', fact.categoria);
    setTimeout(renderFactDots, 290);
  }

  scheduleNextTick();
}

function scheduleNextTick() {
  clearTimeout(_rotTimeout);
  _rotTimeout = setTimeout(tickRotation, calcReadingDelay());
}

/* ─────────────────────────────────────────────
   TEMA POR PAÍS
───────────────────────────────────────────── */

function applyCountryTheme(code) {
  const data = COUNTRY_DATA[code];
  if (!data) return;
  const r = document.documentElement.style;
  r.setProperty('--brand',       data.tema.brand);
  r.setProperty('--brand-mid',   data.tema.brandMid);
  r.setProperty('--brand-light', data.tema.brandLight);
}

function renderCountryCard(code) {
  const data = COUNTRY_DATA[code];
  if (!data) return;

  const idx  = _factIdx % data.curiosidades.length;
  const fact = data.curiosidades[idx];

  // Emoji + nombre + lema
  const flagEl = document.getElementById('cc-flag');
  const nameEl = document.getElementById('cc-country-name');
  const lemaEl = document.getElementById('cc-lema');
  const textEl = document.getElementById('cc-text');
  const catEl  = document.getElementById('cc-category');

  if (flagEl) flagEl.textContent = data.bandera;
  if (nameEl) nameEl.textContent = data.nombre;
  if (lemaEl) lemaEl.textContent = data.lema || '';
  if (textEl) textEl.textContent = fact.texto;
  if (catEl)  catEl.textContent  = fact.categoria;

  // Símbolos patrios — dos secciones con imágenes y modal
  const simEl = document.getElementById('cc-simbolos');
  if (simEl) {
    _simRegistry.clear();

    const buildItem = s => {
      const key = 'sim_' + Math.random().toString(36).slice(2);
      _simRegistry.set(key, s);
      const visual = s.img
        ? `<img src="${s.img}" alt="${s.nombre}" class="cc-sim-img">`
        : `<span class="cc-sim-emoji">${s.emoji}</span>`;
      return `<div class="cc-sim-item cc-sim-clickable" onclick="openSimModal('${key}')">${visual}<span class="cc-sim-nombre">${s.nombre}</span><span class="cc-sim-tipo">${s.tipo}</span></div>`;
    };

    let html = '';
    if (data.simbolosMayores && data.simbolosMayores.length) {
      html += `<div class="cc-sim-section"><div class="cc-sim-label">🏅 Símbolos Mayores</div><div class="cc-sim-grid">${data.simbolosMayores.map(buildItem).join('')}</div></div>`;
    }
    if (data.simbolos && data.simbolos.length) {
      html += `<div class="cc-sim-section"><div class="cc-sim-label">🌿 Símbolos Menores</div><div class="cc-sim-grid">${data.simbolos.map(buildItem).join('')}</div></div>`;
    }
    simEl.innerHTML = html;
  }

  renderFactDots();
}

function nextFact() {
  const data = COUNTRY_DATA[_currentCountry];
  if (!data) return;
  _factIdx = (_factIdx + 1) % data.curiosidades.length;
  const fact = data.curiosidades[_factIdx];
  fadeUpdate('cc-text',     fact.texto);
  fadeUpdate('cc-category', fact.categoria);
  setTimeout(renderFactDots, 290);
  scheduleNextTick();
}

function prevFact() {
  const data = COUNTRY_DATA[_currentCountry];
  if (!data) return;
  _factIdx = (_factIdx - 1 + data.curiosidades.length) % data.curiosidades.length;
  const fact = data.curiosidades[_factIdx];
  fadeUpdate('cc-text',     fact.texto);
  fadeUpdate('cc-category', fact.categoria);
  setTimeout(renderFactDots, 290);
  scheduleNextTick();
}

/* ─────────────────────────────────────────────
   RENDER — HOME
───────────────────────────────────────────── */

function renderHome() {
  const s       = load();
  const country = s.country || 'HN';

  // Saludo
  document.getElementById('home-name').textContent = displayName(s) + '!';

  // Frase motivacional (índice global de rotación)
  const frase = FRASES[_motivIdx];
  document.getElementById('motiv-text').textContent  = frase.texto;
  document.getElementById('motiv-autor').textContent = '— ' + frase.autor;

  // Tema y datos del país
  _currentCountry = country;
  applyCountryTheme(country);
  renderCountryCard(country);

  // Chips de materia: misiones o "Próximamente" según país
  document.querySelectorAll('.subj-chip').forEach(chip => {
    const em = chip.querySelector('em');
    if (!em) return;
    if (country === 'HN') {
      const count = MISSIONS.filter(m => m.subject === chip.dataset.subject).length;
      em.textContent = `${count} misión${count !== 1 ? 'es' : ''}`;
    } else {
      em.textContent = 'Próximamente';
    }
  });

  // Sección Misión destacada + Recientes: solo Honduras
  const featuredSection = document.getElementById('featured-section');
  if (featuredSection) featuredSection.hidden = (country !== 'HN');

  if (country !== 'HN') return;

  const m    = featuredMission(s);
  const done = s.visited.includes(m.id);
  const card = document.getElementById('featured-card');
  card.innerHTML = `
    <div class="feat-label">★ Misión destacada</div>
    <div class="feat-subj">${m.icon} ${SUBJECT_LABELS[m.subject] || m.subject}</div>
    <div class="feat-title">${m.title}</div>
    <div class="feat-grade">${m.grade}</div>
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
  const recent = (s.lastVisited || [])
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
          <div class="small-meta">${SUBJECT_LABELS[m.subject] || m.subject} · ${m.grade}</div>
        </div>
        <i class="fa-solid fa-chevron-right small-arrow"></i>
      </a>
    `).join('');
  }
}

/* ─────────────────────────────────────────────
   RENDER — PRÓCERES CAROUSEL
───────────────────────────────────────────── */

let _proceresIdx = 0;

function renderProceres(country) {
  const section = document.getElementById('proceres-section');
  if (!section) return;
  const data = PROCERES_DATA[country];
  if (!data || !data.length) { section.innerHTML = ''; return; }
  _proceresIdx = 0;
  _buildProceresHTML(country, data);
}

function _buildProceresHTML(country, data) {
  const section = document.getElementById('proceres-section');
  if (!section) return;
  const cd = COUNTRY_DATA[country];
  const item = data[_proceresIdx];
  const dots = data.map((_, i) =>
    `<span class="cc-dot${i === _proceresIdx ? ' active' : ''}"></span>`
  ).join('');

  section.innerHTML = `
    <div class="proc-card">
      <div class="proc-card-header">
        <span class="proc-flag">${cd ? cd.bandera : ''}</span>
        <span class="proc-card-title">Próceres de ${cd ? cd.nombre : country}</span>
      </div>
      <div class="proc-body" id="proc-swipe">
        <img src="${item.img}" alt="${item.nombre}" class="proc-foto">
        <div class="proc-info">
          <div class="proc-nombre">${item.nombre}</div>
          <div class="proc-fecha">${item.fecha}</div>
          <p class="proc-desc">${item.desc}</p>
          <p class="proc-cita">"${item.cita}"</p>
        </div>
      </div>
      <div class="proc-footer">
        <button class="cc-nav-btn" id="proc-prev" aria-label="Anterior">‹</button>
        <div class="cc-dots">${dots}</div>
        <button class="cc-nav-btn" id="proc-next" aria-label="Siguiente">›</button>
      </div>
    </div>`;

  document.getElementById('proc-prev').addEventListener('click', () => {
    _proceresIdx = (_proceresIdx - 1 + data.length) % data.length;
    _buildProceresHTML(country, data);
  });
  document.getElementById('proc-next').addEventListener('click', () => {
    _proceresIdx = (_proceresIdx + 1) % data.length;
    _buildProceresHTML(country, data);
  });

  const swipe = document.getElementById('proc-swipe');
  if (swipe) {
    let _tx = 0;
    swipe.addEventListener('touchstart', e => { _tx = e.touches[0].clientX; }, { passive: true });
    swipe.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - _tx;
      if (Math.abs(dx) > 38) {
        _proceresIdx = dx < 0
          ? (_proceresIdx + 1) % data.length
          : (_proceresIdx - 1 + data.length) % data.length;
        _buildProceresHTML(country, data);
      }
    }, { passive: true });
  }
}

/* ─────────────────────────────────────────────
   RENDER — MISSIONS
───────────────────────────────────────────── */

function renderMissions(filter, query) {
  const s = load();
  const country = s.country || 'HN';

  renderProceres(country);

  const container = document.getElementById('missions-container');

  if (country !== 'HN') {
    const cd = COUNTRY_DATA[country];
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚀</div>
        <h3>¡Próximamente!</h3>
        <p>Las misiones para <strong>${cd ? cd.nombre : 'este país'}</strong> están en camino.<br>
           Cambia a <strong>🇭🇳 Honduras</strong> para explorar las misiones disponibles.</p>
      </div>`;
    return;
  }

  let list = [...MISSIONS];

  if (filter && filter !== 'all') {
    list = list.filter(m => m.subject === filter);
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (SUBJECT_LABELS[m.subject] || '').toLowerCase().includes(q) ||
      m.grade.toLowerCase().includes(q)
    );
  }

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Sin resultados</h3>
        <p>Intenta con otro término o cambia el filtro.</p>
      </div>`;
    return;
  }

  container.innerHTML = list.map(m => {
    const visited = s.visited.includes(m.id);
    return `
      <a class="mission-card ${visited ? 'visited' : ''}"
         onclick="visitMission(${m.id}); return false;"
         href="${m.url}">
        <div class="mc-icon ${m.color}">${m.icon}</div>
        <div class="mc-info">
          <div class="mc-title">${m.title}</div>
          <div class="mc-meta">
            <span class="mc-subj ${m.color}">${SUBJECT_LABELS[m.subject] || m.subject}</span>
            <span class="mc-grade">${m.grade}</span>
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
   RENDER — PROGRESS
───────────────────────────────────────────── */

function renderProgress() {
  const s   = load();
  const lv  = getLevel(s.xp);
  const pct = xpPct(s.xp);

  document.getElementById('progress-overview').innerHTML = `
    <div class="progress-overview">
      <div class="po-emoji">${lv.emoji}</div>
      <div class="po-level">Nivel ${lv.n}</div>
      <div class="po-rank">${lv.label}</div>
      <div class="po-xp">${s.xp}</div>
      <div class="po-xp-label">Puntos XP</div>
      <div class="po-bar-wrap">
        <div class="po-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="po-bar-lbls">
        <span>${lv.min} XP</span>
        <span>${lv.n < 5 ? (lv.max + 1) + ' XP' : 'Nivel máx.'}</span>
      </div>
    </div>`;

  const subjects = [
    { key: 'español',     label: 'Español',     color: 'var(--esp)'  },
    { key: 'matemáticas', label: 'Matemáticas',  color: 'var(--mat)'  },
    { key: 'naturales',   label: 'C. Naturales', color: 'var(--cnat)' },
    { key: 'sociales',    label: 'C. Sociales',  color: 'var(--csoc)' },
  ];

  document.getElementById('progress-subjects').innerHTML = `
    <h2 class="section-title" style="margin-bottom:12px;">Por materia</h2>
    ${subjects.map(sub => {
      const total = MISSIONS.filter(m => m.subject === sub.key).length;
      const done  = MISSIONS.filter(m => m.subject === sub.key && s.visited.includes(m.id)).length;
      const p = total ? Math.round((done / total) * 100) : 0;
      return `
        <div class="sp-item">
          <div class="sp-top">
            <span class="sp-name">${sub.label}</span>
            <span class="sp-cnt">${done} / ${total}</span>
          </div>
          <div class="sp-track">
            <div class="sp-fill" style="width:${p}%; background:${sub.color};"></div>
          </div>
        </div>`;
    }).join('')}`;

  const visitedList = MISSIONS.filter(m => s.visited.includes(m.id));
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
                 <span class="mc-subj ${m.color}">${SUBJECT_LABELS[m.subject] || m.subject}</span>
                 <span class="mc-grade">${m.grade}</span>
                 <span class="mc-done"><i class="fa-solid fa-check"></i> Visitada</span>
               </div>
             </div>
             <i class="fa-solid fa-chevron-right mc-arrow"></i>
           </a>`).join('')}
       </div>`;
}

/* ─────────────────────────────────────────────
   RENDER — PROFILE
───────────────────────────────────────────── */

function renderProfile() {
  // Los elementos de estudiante fueron removidos del perfil; sección solo muestra herramientas del docente
}

/* ─────────────────────────────────────────────
   VISIT MISSION
───────────────────────────────────────────── */

function visitMission(id) {
  const s = load();
  const m = MISSIONS.find(m => m.id === id);
  if (!m) return;

  if (!s.visited.includes(id)) {
    s.xp += m.xp;
    s.visited.push(id);
  }
  s.lastVisited = [id, ...(s.lastVisited || []).filter(x => x !== id)].slice(0, 5);
  save(s);

  window.location.href = m.url;
}

window.visitMission = visitMission;

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */

let currentFilter = 'all';
let currentQuery  = '';

function switchView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.drawer-item').forEach(b => b.classList.remove('active'));
  const view = document.getElementById(id);
  if (view) view.classList.add('active');
  const item = document.querySelector(`.drawer-item[data-view="${id}"]`);
  if (item) item.classList.add('active');

  if (id === 'view-inicio')   renderHome();
  if (id === 'view-misiones') renderMissions(currentFilter, currentQuery);
  if (id === 'view-progreso') renderProgress();
  if (id === 'view-perfil')   renderProfile();
  if (id === 'view-gobierno')       renderGobiernoEscolar();
  if (id === 'view-plan-accion')    paInit();
  if (id === 'view-parte-mensual')  { /* la UI se recalcula en tiempo real con inputs */ }
  if (id === 'view-collage')        initCollage();

  const scroll = document.querySelector(`#${id} .view-scroll`);
  if (scroll) scroll.scrollTop = 0;
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

  // Aplicar tema del país guardado antes de renderizar
  const s0      = load();
  const country0 = s0.country || 'HN';
  _currentCountry = country0;
  applyCountryTheme(country0);

  // Sincronizar selector de país con el estado guardado
  const countryEl = document.getElementById('country-select');
  if (countryEl) countryEl.value = country0;

  // Render inicial
  renderHome();

  // Iniciar rotación automática con tiempo adaptado a la lectura
  scheduleNextTick();

  // Si se regresa desde una misión con ?view=misiones&filter=X, ir directamente
  const _urlParams = new URLSearchParams(window.location.search);
  if (_urlParams.get('view') === 'misiones') {
    const _filter = _urlParams.get('filter') || 'all';
    currentFilter = _filter;
    document.querySelectorAll('.pill').forEach(p =>
      p.classList.toggle('active', p.dataset.filter === currentFilter)
    );
    switchView('view-misiones');
  }

  // Cambio de país
  if (countryEl) {
    countryEl.addEventListener('change', () => {
      const s = load();
      s.country = countryEl.value;
      save(s);
      _currentCountry = s.country;
      _factIdx = 0;
      applyCountryTheme(s.country);
      renderCountryCard(s.country);
      scheduleNextTick();

      // Actualizar chips de materia (Próximamente vs conteo real)
      document.querySelectorAll('.subj-chip').forEach(chip => {
        const em = chip.querySelector('em');
        if (!em) return;
        if (s.country === 'HN') {
          const count = MISSIONS.filter(m => m.subject === chip.dataset.subject).length;
          em.textContent = `${count} misión${count !== 1 ? 'es' : ''}`;
        } else {
          em.textContent = 'Próximamente';
        }
      });

      // Mostrar u ocultar sección Misión destacada
      const featuredSection = document.getElementById('featured-section');
      if (featuredSection) featuredSection.hidden = (s.country !== 'HN');

      const d = COUNTRY_DATA[s.country];
      if (d) toast(`${d.bandera} ¡Explorando ${d.nombre}!`);

      // Quitar foco del select para que el scroll listener no quede bloqueado,
      // y restaurar el header si estaba oculto por el scroll.
      countryEl.blur();
      const header = document.querySelector('#view-inicio .app-header');
      if (header) { header.style.transform = ''; header.style.marginBottom = ''; }
    });
  }

  // Botones prev/next de curiosidades
  const prevBtn = document.getElementById('cc-prev');
  const nextBtn = document.getElementById('cc-next');
  if (prevBtn) prevBtn.addEventListener('click', prevFact);
  if (nextBtn) nextBtn.addEventListener('click', nextFact);

  // Swipe táctil en la tarjeta de curiosidades
  const swipeArea = document.getElementById('cc-swipe-area');
  if (swipeArea) {
    let touchX = 0, touchY = 0;
    swipeArea.addEventListener('touchstart', e => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    swipeArea.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 38) {
        dx < 0 ? nextFact() : prevFact();
      }
    }, { passive: true });
  }

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

  // Chips de materias → misiones filtradas
  document.querySelectorAll('.subj-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentFilter = chip.dataset.subject;
      currentQuery  = '';

      document.querySelectorAll('.pill').forEach(p =>
        p.classList.toggle('active', p.dataset.filter === currentFilter)
      );

      const si = document.getElementById('search-input');
      if (si) si.value = '';

      switchView('view-misiones');
    });
  });

  // Búsqueda
  const searchEl = document.getElementById('search-input');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      currentQuery = searchEl.value;
      renderMissions(currentFilter, currentQuery);
    });
  }

  // Pills de filtro
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderMissions(currentFilter, currentQuery);
    });
  });

  // Notificaciones
  document.getElementById('notif-btn').addEventListener('click', () => {
    toast('Sin notificaciones nuevas por ahora');
  });

  // ── Header oculto al hacer scroll (acumulador anti-tembladera) ──
  document.querySelectorAll('.view-scroll').forEach(scroll => {
    let lastY = 0;
    let accumulated = 0;
    let ticking = false;
    const HIDE_THRESHOLD = 22;

    scroll.addEventListener('scroll', () => {
      if (ticking) return;
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
      ticking = true;
      requestAnimationFrame(() => {
        const header = scroll.closest('.view') && scroll.closest('.view').querySelector('.app-header');
        // Solo ocultar header en vistas principales (hamburguesa), nunca en vistas secundarias (botón atrás)
        if (!header || !header.querySelector('.hamburger-btn')) { ticking = false; return; }
        const y = Math.max(0, scroll.scrollTop);

        if (y <= 4) {
          header.style.transform = '';
          header.style.marginBottom = '';
          lastY = 0; accumulated = 0;
          ticking = false;
          return;
        }

        const delta = y - lastY;
        lastY = y;
        accumulated += delta;

        if (accumulated > HIDE_THRESHOLD && y > 56) {
          const h = header.offsetHeight;
          header.style.transform = `translateY(-${h}px)`;
          header.style.marginBottom = `-${h}px`;
          accumulated = 0;
        } else if (accumulated < -HIDE_THRESHOLD) {
          header.style.transform = '';
          header.style.marginBottom = '';
          accumulated = 0;
        }
        ticking = false;
      });
    }, { passive: true });
  });

});
