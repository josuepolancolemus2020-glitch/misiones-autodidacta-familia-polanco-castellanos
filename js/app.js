'use strict';



const MEMBERS = [
  { id: 'josue',   name: 'Josué Edmundo Polanco Lemus',         short: 'Josué Edmundo', emoji: '👨' },
  { id: 'evelyn',  name: 'Evelyn Sarahi Castellanos Hernández', short: 'Evelyn Sarahi', emoji: '👩' },
  { id: 'jael',    name: 'Jael Polanco Castellanos',            short: 'Jael',          emoji: '🧒' },
  { id: 'angelly', name: 'Angelly Polanco Castellanos',         short: 'Angelly',       emoji: '👧' },
];

const MODULES = [
  { id: 'finanzas',          label: 'Finanzas',          sub: 'Gestión de Presupuesto', icon: 'fa-sack-dollar',    color: 'fin', ready: false },
  { id: 'organizacion',      label: 'Organización',      sub: 'Agenda y Eventos',       icon: 'fa-calendar-days',  color: 'org', ready: false },
  { id: 'salud',             label: 'Salud y Bienestar', sub: 'Citas y Vacunas',        icon: 'fa-heart-pulse',    color: 'sal', ready: false },
  { id: 'aprendizaje-unido', label: 'Aprendizaje Unido', sub: 'Zonas F.A.R.O.',         icon: 'fa-graduation-cap', color: 'apr', ready: true  },
];

const LEVELS = [
  { n: 1, min:   0, max:  99,       label: 'Explorador', emoji: '🌱' },
  { n: 2, min: 100, max: 249,       label: 'Aprendiz',   emoji: '📚' },
  { n: 3, min: 250, max: 499,       label: 'Estudioso',  emoji: '🔍' },
  { n: 4, min: 500, max: 799,       label: 'Académico',  emoji: '⚡' },
  { n: 5, min: 800, max: Infinity,  label: 'Sabio',      emoji: '🏆' },
];



/* ─────────────────────────────────────────────
   STATE — perfiles por miembro de la familia
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
  fadeUpdate('motiv-autor', '— ' + frase.autor);
  scheduleNextTick();
}

function scheduleNextTick() {
  clearTimeout(_rotTimeout);
  _rotTimeout = setTimeout(tickRotation, calcReadingDelay());
}

/* ─────────────────────────────────────────────
   RENDER — MÓDULOS
───────────────────────────────────────────── */

function renderModules() {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;

  grid.innerHTML = MODULES.map(mod => {
    let countText;
    if (mod.ready) {
      const total = MISSIONS.filter(m => m.modulo === mod.id).length;
      countText = total === 1 ? '1 misión' : `${total} misiones`;
    } else {
      countText = 'Próximamente';
    }
    return `
      <button class="module-card ${mod.color}${mod.ready ? '' : ' soon'}" data-module="${mod.id}">
        <i class="fa-solid ${mod.icon} mod-icon"></i>
        <span class="mod-title">${mod.label}</span>
        <span class="mod-sub">${mod.sub}</span>
        <span class="mod-count">${countText}</span>
      </button>`;
  }).join('');
}

function goToModule(modId) {
  const mod = MODULES.find(x => x.id === modId);
  if (!mod) return;
  if (mod.ready) {
    switchView('view-misiones');
  } else {
    toast(`🔜 ${mod.label} estará disponible próximamente`);
  }
}

/* ─────────────────────────────────────────────
   RENDER — HOME
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
  document.getElementById('motiv-autor').textContent = '— ' + frase.autor;

  // Módulos
  renderModules();

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
   RENDER — MISSIONS (Aprendizaje Unido)
───────────────────────────────────────────── */

function renderMissions(query) {
  const s  = load();
  const ms = memberState(s, s.currentMember);

  const container = document.getElementById('missions-container');
  let list = [...MISSIONS];

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(m => m.title.toLowerCase().includes(q));
  }

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
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
          <div class="mc-title">${m.title}</div>
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
   RENDER — PROGRESS
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
    <h2 class="section-title" style="margin-bottom:12px;">Por módulo</h2>
    ${MODULES.map(mod => {
      const total = MISSIONS.filter(m => m.modulo === mod.id).length;
      const done  = MISSIONS.filter(m => m.modulo === mod.id && ms.visited.includes(m.id)).length;
      const p = total ? Math.round((done / total) * 100) : 0;
      return `
        <div class="sp-item">
          <div class="sp-top">
            <span class="sp-name">${mod.label}</span>
            <span class="sp-cnt">${done} / ${total}</span>
          </div>
          <div class="sp-track">
            <div class="sp-fill" style="width:${p}%; background:var(--${mod.color});"></div>
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
   RENDER — PROFILE
───────────────────────────────────────────── */

function renderProfile() {
  // Sección solo muestra herramientas del docente (por ahora)
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

function switchView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.drawer-item').forEach(b => b.classList.remove('active'));
  const view = document.getElementById(id);
  if (view) view.classList.add('active');
  const item = document.querySelector(`.drawer-item[data-view="${id}"]`);
  if (item) item.classList.add('active');

  if (id === 'view-inicio')   renderHome();
  if (id === 'view-misiones') renderMissions(currentQuery);
  if (id === 'view-progreso') renderProgress();
  if (id === 'view-perfil')   renderProfile();
  if (id === 'view-gobierno')       renderGobiernoEscolar();
  if (id === 'view-plan-accion')    paInit();
  if (id === 'view-parte-mensual')  { /* la UI se recalcula en tiempo real con inputs */ }
  if (id === 'view-collage')        initCollage();

  const scroll = document.querySelector(`#${id} .view-scroll`);
  if (scroll) scroll.scrollTop = 0;

  if (id === 'view-chat' && typeof chatScrollToBottom === 'function') chatScrollToBottom();
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

  // Si se regresa desde una misión con ?view=misiones, ir directamente
  const _urlParams = new URLSearchParams(window.location.search);
  if (_urlParams.get('view') === 'misiones') {
    switchView('view-misiones');
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

  // Selector de módulo (acceso rápido)
  const moduleEl = document.getElementById('module-select');
  if (moduleEl) {
    moduleEl.addEventListener('change', () => {
      goToModule(moduleEl.value);
      moduleEl.value = 'aprendizaje-unido';
      moduleEl.blur();
    });
  }

  // Tarjetas de "Explorar Módulos"
  document.getElementById('modules-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('.module-card');
    if (btn) goToModule(btn.dataset.module);
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
