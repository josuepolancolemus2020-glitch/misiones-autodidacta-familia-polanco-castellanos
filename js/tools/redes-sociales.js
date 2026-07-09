/* ─────────────────────────────────────────────
   MANEJO DE REDES SOCIALES
   Tiempo de pantalla diario por miembro + acuerdos familiares.
   Datos en localStorage:
   { limits:{member:min}, usage:{member:{fecha:min}}, acuerdos:[{id,text,done}] }
───────────────────────────────────────────── */

const RS_KEY = 'faro_redes_v1';
const RS_LIMIT_DEFAULT = 60;

const RS_ACUERDOS_DEFAULT = [
  'Nada de pantallas durante las comidas',
  'Los dispositivos se cargan fuera del dormitorio por la noche',
  'No compartir datos personales ni fotos con desconocidos',
  'Avisar a papá o mamá si algo en línea nos incomoda',
  'Primero deberes y responsabilidades, después redes',
];

let _rsMember = null;

function rsLoad() {
  let d;
  try { d = JSON.parse(localStorage.getItem(RS_KEY)) || {}; } catch (_) { d = {}; }
  d.limits = d.limits || {};
  d.usage  = d.usage  || {};
  if (!Array.isArray(d.acuerdos)) {
    d.acuerdos = RS_ACUERDOS_DEFAULT.map((t, i) => ({ id: 'a' + i, text: t, done: false }));
  }
  return d;
}
function rsSave(d) {
  try { localStorage.setItem(RS_KEY, JSON.stringify(d)); } catch (_) {}
}

function rsToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function rsEsc(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function rsEnsureMember() {
  if (_rsMember) return;
  const s = (typeof load === 'function') ? load() : null;
  _rsMember = (s && s.currentMember) || MEMBERS[0].id;
}

function initRedes() {
  rsEnsureMember();
  rsRenderChips();
  rsRenderPantalla();
  rsRenderAcuerdos();
}

function rsRenderChips() {
  const wrap = document.getElementById('rs-member-chips');
  if (!wrap) return;
  wrap.innerHTML = MEMBERS.map(m => `
    <button class="fam-chip ${m.id === _rsMember ? 'fam-chip-active' : ''}" data-member="${m.id}">
      ${m.emoji} ${rsEsc(m.short.split(' ')[0])}
    </button>`).join('');
  wrap.querySelectorAll('.fam-chip').forEach(btn => btn.addEventListener('click', () => {
    _rsMember = btn.dataset.member;
    rsRenderChips();
    rsRenderPantalla();
  }));
}

function rsGetUsed(d) {
  return (d.usage[_rsMember] && d.usage[_rsMember][rsToday()]) || 0;
}
function rsGetLimit(d) {
  const l = d.limits[_rsMember];
  return (typeof l === 'number' && l >= 0) ? l : RS_LIMIT_DEFAULT;
}

function rsRenderPantalla() {
  const d = rsLoad();
  const used  = rsGetUsed(d);
  const limit = rsGetLimit(d);

  const limitInp = document.getElementById('rs-limit');
  if (limitInp && document.activeElement !== limitInp) limitInp.value = limit;

  const usedEl = document.getElementById('rs-used');
  if (usedEl) usedEl.textContent = used;
  const subEl = document.getElementById('rs-limit-sub');
  if (subEl) subEl.textContent = limit > 0 ? `de ${limit} min` : 'min usados (sin límite)';

  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const bar = document.getElementById('rs-bar');
  if (bar) {
    bar.style.width = Math.min(100, pct).toFixed(1) + '%';
    bar.style.background = pct < 75
      ? 'linear-gradient(90deg,#22c55e,#16a34a)'
      : pct <= 100 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
      : 'linear-gradient(90deg,#ef4444,#dc2626)';
  }

  const semaEl = document.getElementById('rs-semaforo');
  if (semaEl) {
    if (limit <= 0) {
      semaEl.innerHTML = '';
    } else {
      const icon = pct < 75 ? '✅' : pct <= 100 ? '⚠️' : '🔴';
      const msg  = pct < 75 ? 'Dentro del límite — ¡bien!'
                 : pct <= 100 ? 'Cerca del límite — ir cerrando'
                 : 'Límite superado — hora de desconectar 🌳';
      semaEl.innerHTML = `<span class="pm-semaforo-text">${icon} ${msg}</span>`;
    }
  }
}

function rsRenderAcuerdos() {
  const listEl = document.getElementById('rs-acuerdos-list');
  if (!listEl) return;
  const d = rsLoad();

  listEl.innerHTML = d.acuerdos.map(a => `
    <div class="rs-agree-item">
      <button class="rs-agree-check ${a.done ? 'rs-agree-done' : ''}" data-toggle="${a.id}" aria-label="Marcar acuerdo">
        <i class="fa-solid fa-check"></i>
      </button>
      <span class="rs-agree-text ${a.done ? 'rs-agree-text-done' : ''}">${rsEsc(a.text)}</span>
      <button class="ht-del-btn" data-del="${a.id}" aria-label="Eliminar acuerdo"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('');

  listEl.querySelectorAll('.rs-agree-check').forEach(btn => btn.addEventListener('click', () => {
    const d = rsLoad();
    const a = d.acuerdos.find(x => x.id === btn.dataset.toggle);
    if (!a) return;
    a.done = !a.done;
    rsSave(d);
    rsRenderAcuerdos();
  }));

  listEl.querySelectorAll('.ht-del-btn').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('¿Eliminar este acuerdo?')) return;
    const d = rsLoad();
    d.acuerdos = d.acuerdos.filter(x => x.id !== btn.dataset.del);
    rsSave(d);
    rsRenderAcuerdos();
  }));
}

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('goto-redes-btn')?.addEventListener('click', () => switchView('view-redes'));
  document.getElementById('redes-back-btn')?.addEventListener('click', () => switchView('view-perfil'));

  // Límite diario
  document.getElementById('rs-limit')?.addEventListener('input', e => {
    rsEnsureMember();
    const d = rsLoad();
    d.limits[_rsMember] = Math.max(0, parseInt(e.target.value) || 0);
    rsSave(d);
    rsRenderPantalla();
  });

  // Botones rápidos de minutos
  document.querySelectorAll('.rs-qbtn[data-mins]').forEach(btn => btn.addEventListener('click', () => {
    rsEnsureMember();
    const d = rsLoad();
    const hoy = rsToday();
    d.usage[_rsMember] = d.usage[_rsMember] || {};
    d.usage[_rsMember][hoy] = Math.max(0, (d.usage[_rsMember][hoy] || 0) + parseInt(btn.dataset.mins));
    rsSave(d);
    rsRenderPantalla();
  }));

  document.getElementById('rs-reset-btn')?.addEventListener('click', () => {
    rsEnsureMember();
    const d = rsLoad();
    if (d.usage[_rsMember]) delete d.usage[_rsMember][rsToday()];
    rsSave(d);
    rsRenderPantalla();
  });

  // Nuevo acuerdo
  const addAcuerdo = () => {
    const inp = document.getElementById('rs-new-acuerdo');
    const text = (inp?.value || '').trim();
    if (!text) { inp?.focus(); return; }
    const d = rsLoad();
    d.acuerdos.push({ id: 'a' + Date.now(), text, done: false });
    rsSave(d);
    inp.value = '';
    rsRenderAcuerdos();
  };
  document.getElementById('rs-add-acuerdo-btn')?.addEventListener('click', addAcuerdo);
  document.getElementById('rs-new-acuerdo')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addAcuerdo();
  });

});
