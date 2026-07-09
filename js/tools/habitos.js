/* ─────────────────────────────────────────────
   TRACKER DE HÁBITOS — por miembro de la familia
   Semana lunes-domingo; toca un día para marcarlo.
   Datos en localStorage: { memberId: [ {id, name, log:{fecha:true}} ] }
───────────────────────────────────────────── */

const HT_KEY = 'faro_habitos_v1';
const HT_DAY_LBL = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

let _htMember = null;

function htLoad() {
  try { return JSON.parse(localStorage.getItem(HT_KEY)) || {}; } catch (_) { return {}; }
}
function htSave(d) {
  try { localStorage.setItem(HT_KEY, JSON.stringify(d)); } catch (_) {}
}

function htDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* Los 7 días (lunes a domingo) de la semana que contiene hoy */
function htWeekDates() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = lunes
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/* Racha: días consecutivos marcados terminando hoy (o ayer si hoy aún no se marca) */
function htStreak(log) {
  let streak = 0;
  const d = new Date();
  if (!log[htDateStr(d)]) d.setDate(d.getDate() - 1);
  while (log[htDateStr(d)]) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

function htEsc(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function htEnsureMember() {
  if (_htMember) return;
  const s = (typeof load === 'function') ? load() : null;
  _htMember = (s && s.currentMember) || MEMBERS[0].id;
}

function initHabitos() {
  htEnsureMember();
  htRenderChips();
  htRenderList();
}

function htRenderChips() {
  const wrap = document.getElementById('ht-member-chips');
  if (!wrap) return;
  wrap.innerHTML = MEMBERS.map(m => `
    <button class="fam-chip ${m.id === _htMember ? 'fam-chip-active' : ''}" data-member="${m.id}">
      ${m.emoji} ${htEsc(m.short.split(' ')[0])}
    </button>`).join('');
  wrap.querySelectorAll('.fam-chip').forEach(btn => btn.addEventListener('click', () => {
    _htMember = btn.dataset.member;
    htRenderChips();
    htRenderList();
  }));
}

function htRenderList() {
  const listEl  = document.getElementById('ht-habit-list');
  const emptyEl = document.getElementById('ht-empty');
  const weekEl  = document.getElementById('ht-week-label');
  if (!listEl) return;

  const habits   = htLoad()[_htMember] || [];
  const week     = htWeekDates();
  const todayStr = htDateStr(new Date());

  if (weekEl) {
    weekEl.textContent = `Semana del ${week[0].getDate()}/${week[0].getMonth() + 1} al ${week[6].getDate()}/${week[6].getMonth() + 1}`;
  }
  if (emptyEl) emptyEl.style.display = habits.length ? 'none' : 'block';

  listEl.innerHTML = habits.map(h => {
    const log = h.log || {};
    const streak = htStreak(log);
    const days = week.map((d, i) => {
      const ds = htDateStr(d);
      const done = !!log[ds];
      const isToday = ds === todayStr;
      const isFuture = ds > todayStr;
      return `<div class="ht-day">
        <span class="ht-day-lbl">${HT_DAY_LBL[i]}</span>
        <button class="ht-day-dot ${done ? 'ht-done' : ''} ${isToday ? 'ht-today' : ''} ${isFuture ? 'ht-future' : ''}"
          data-habit="${h.id}" data-date="${ds}" ${isFuture ? 'disabled' : ''} aria-label="Marcar ${HT_DAY_LBL[i]}">
          <i class="fa-solid fa-check"></i>
        </button>
      </div>`;
    }).join('');
    return `<div class="ht-habit">
      <div class="ht-habit-top">
        <span class="ht-habit-name">${htEsc(h.name)}</span>
        <span class="ht-streak">🔥 ${streak} día${streak === 1 ? '' : 's'}</span>
        <button class="ht-del-btn" data-del="${h.id}" aria-label="Eliminar hábito"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="ht-days">${days}</div>
    </div>`;
  }).join('');

  listEl.querySelectorAll('.ht-day-dot:not(.ht-future)').forEach(btn => btn.addEventListener('click', () => {
    const data = htLoad();
    const h = (data[_htMember] || []).find(x => x.id === btn.dataset.habit);
    if (!h) return;
    h.log = h.log || {};
    if (h.log[btn.dataset.date]) delete h.log[btn.dataset.date];
    else h.log[btn.dataset.date] = true;
    htSave(data);
    htRenderList();
  }));

  listEl.querySelectorAll('.ht-del-btn').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('¿Eliminar este hábito y su historial?')) return;
    const data = htLoad();
    data[_htMember] = (data[_htMember] || []).filter(x => x.id !== btn.dataset.del);
    htSave(data);
    htRenderList();
  }));
}

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('goto-habitos-btn')?.addEventListener('click', () => switchView('view-habitos'));
  document.getElementById('habitos-back-btn')?.addEventListener('click', () => switchView('view-perfil'));

  const addHabit = () => {
    htEnsureMember();
    const inp = document.getElementById('ht-new-name');
    const name = (inp?.value || '').trim();
    if (!name) { inp?.focus(); return; }
    const data = htLoad();
    data[_htMember] = data[_htMember] || [];
    data[_htMember].push({ id: 'h' + Date.now(), name, log: {} });
    htSave(data);
    inp.value = '';
    htRenderList();
  };

  document.getElementById('ht-add-btn')?.addEventListener('click', addHabit);
  document.getElementById('ht-new-name')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addHabit();
  });

});
