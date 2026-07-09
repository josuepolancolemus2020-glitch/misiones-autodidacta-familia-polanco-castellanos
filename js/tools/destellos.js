'use strict';

/* ─────────────────────────────────────────────
   DESTELLOS ⚡ — captura rápida de ideas
   "Captúralo antes de que se apague."
   Botón flotante global → modal de captura en 3 segundos.
   Datos en Supabase (tabla `destellos`), personales por miembro.
   Si no hay conexión, la captura se guarda en un "outbox" local
   y se sincroniza en cuanto vuelve la conexión: capturar NUNCA falla.
───────────────────────────────────────────── */

const DES_TABLE      = 'destellos';
const DES_OUTBOX_KEY = 'faro_destellos_outbox_v1';

let _desCache    = [];            // destellos del miembro que se está viendo
let _desFilter   = 'pendientes';  // 'pendientes' | 'hechos' | 'todos'
let _desProyecto = '';            // '' = todos los proyectos
let _desMember   = null;          // miembro cuyo espacio se está viendo (por defecto: quien inició sesión)

/* ── Helpers ── */

function desMiembro() {
  const s = (typeof verificarSesion === 'function') ? verificarSesion() : null;
  return (s && s.user) || 'josue';
}

function desEsc(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/* "hace 5 min", "hace 2 h", "ayer", "12/3" */
function desFecha(iso) {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1)    return 'ahora mismo';
  if (mins < 60)   return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1)  return 'ayer';
  if (days < 7)    return `hace ${days} días`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/* ── Outbox: capturas hechas sin conexión ── */

function desOutboxLoad() {
  try { return JSON.parse(localStorage.getItem(DES_OUTBOX_KEY)) || []; } catch (_) { return []; }
}
function desOutboxSave(arr) {
  try { localStorage.setItem(DES_OUTBOX_KEY, JSON.stringify(arr)); } catch (_) {}
}

async function desFlushOutbox() {
  if (!_sb) return;
  const pendientes = desOutboxLoad();
  if (!pendientes.length) return;
  const { error } = await _sb.from(DES_TABLE).insert(pendientes);
  if (!error) {
    desOutboxSave([]);
    if (typeof toast === 'function') toast(`⚡ ${pendientes.length} destello${pendientes.length === 1 ? '' : 's'} sincronizado${pendientes.length === 1 ? '' : 's'}`);
  }
}

/* ── Captura (modal del botón flotante) ── */

function desOpenModal() {
  const overlay = document.getElementById('des-modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  desRenderProjChips('des-proj-chips', p => {
    const inp = document.getElementById('des-proyecto');
    if (inp) inp.value = p;
  });
  setTimeout(() => document.getElementById('des-texto')?.focus(), 80);
}

function desCloseModal() {
  const overlay = document.getElementById('des-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  const txt = document.getElementById('des-texto');
  const pro = document.getElementById('des-proyecto');
  if (txt) txt.value = '';
  if (pro) pro.value = '';
}

async function desCapturar() {
  const txtEl = document.getElementById('des-texto');
  const proEl = document.getElementById('des-proyecto');
  const texto = (txtEl?.value || '').trim();
  if (!texto) { txtEl?.focus(); return; }

  const fila = {
    miembro:  desMiembro(),
    texto,
    proyecto: (proEl?.value || '').trim() || null,
  };

  desCloseModal(); // cerrar de inmediato: la captura debe sentirse instantánea

  let guardado = false;
  if (_sb) {
    const { error } = await _sb.from(DES_TABLE).insert(fila);
    guardado = !error;
  }
  if (!guardado) {
    // Sin conexión o error: al outbox local. Se sincroniza después.
    const outbox = desOutboxLoad();
    outbox.push({ ...fila, creado_at: new Date().toISOString() });
    desOutboxSave(outbox);
    if (typeof toast === 'function') toast('⚡ Capturado (se sincronizará)');
  } else {
    if (typeof toast === 'function') toast('⚡ ¡Destello capturado!');
    desFlushOutbox();
  }

  // Si el usuario está viendo la lista, volver a su propio espacio y refrescar
  if (document.getElementById('view-destellos')?.classList.contains('active')) {
    _desMember = desMiembro();
    initDestellos();
  }
}

/* ── Chips de proyectos usados recientemente ── */

function desProyectos() {
  const set = new Set();
  _desCache.forEach(d => { if (d.proyecto) set.add(d.proyecto); });
  desOutboxLoad().forEach(d => { if (d.proyecto) set.add(d.proyecto); });
  return Array.from(set).slice(0, 12);
}

function desRenderProjChips(containerId, onPick, activo) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const projs = desProyectos();
  if (!projs.length) { wrap.innerHTML = ''; wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  wrap.innerHTML = projs.map(p => `
    <button type="button" class="des-proj-chip ${activo === p ? 'des-proj-chip-active' : ''}" data-proj="${desEsc(p)}">
      <i class="fa-solid fa-folder"></i> ${desEsc(p)}
    </button>`).join('');
  wrap.querySelectorAll('.des-proj-chip').forEach(btn =>
    btn.addEventListener('click', () => onPick(btn.dataset.proj)));
}

/* ── Vista principal (bandeja de destellos) ── */

async function initDestellos() {
  const list = document.getElementById('des-list');
  if (!list) return;

  if (!_desMember) _desMember = desMiembro();
  desRenderMemberChips();

  await desFlushOutbox();

  if (!_sb) {
    list.innerHTML = '<div class="fin-empty">No se pudo conectar con Destellos.</div>';
    return;
  }

  const { data, error } = await _sb.from(DES_TABLE)
    .select('*')
    .eq('miembro', _desMember)
    .order('creado_at', { ascending: false });

  if (error) {
    console.error('[Destellos] Error cargando:', error);
    list.innerHTML = '<div class="fin-empty">No se pudieron cargar los destellos.</div>';
    return;
  }

  _desCache = data || [];
  desRenderView();
}

/* Chips para elegir de quién es el espacio que se está viendo */
function desRenderMemberChips() {
  const wrap = document.getElementById('des-member-chips');
  if (!wrap || typeof MEMBERS === 'undefined') return;
  wrap.innerHTML = MEMBERS.map(m => `
    <button type="button" class="fam-chip ${m.id === _desMember ? 'fam-chip-active' : ''}" data-member="${m.id}">
      ${m.emoji} ${desEsc(m.short.split(' ')[0])}
    </button>`).join('');
  wrap.querySelectorAll('.fam-chip').forEach(btn => btn.addEventListener('click', () => {
    _desMember = btn.dataset.member;
    _desProyecto = '';
    initDestellos();
  }));
}

function desRenderView() {
  const list    = document.getElementById('des-list');
  const emptyEl = document.getElementById('des-empty');
  const countEl = document.getElementById('des-count');
  if (!list) return;

  // Contador de pendientes (aclara de quién es el espacio si es de otro)
  const yo = desMiembro();
  const m = (typeof MEMBERS !== 'undefined') ? MEMBERS.find(x => x.id === _desMember) : null;
  const deQuien = (_desMember !== yo && m) ? ` de ${m.short.split(' ')[0]}` : '';
  const nPend = _desCache.filter(d => !d.hecho).length;
  if (countEl) countEl.textContent = nPend
    ? `${nPend} pendiente${nPend === 1 ? '' : 's'}${deQuien} por atender`
    : `¡Todo atendido${deQuien}! 🎉`;

  // Tabs de filtro
  document.querySelectorAll('#des-filter-tabs .des-ftab').forEach(b =>
    b.classList.toggle('des-ftab-active', b.dataset.f === _desFilter));

  // Chips de proyecto (filtro de la vista)
  desRenderProjChips('des-view-projs', p => {
    _desProyecto = (_desProyecto === p) ? '' : p;
    desRenderView();
  }, _desProyecto);

  let lista = _desCache;
  if (_desFilter === 'pendientes') lista = lista.filter(d => !d.hecho);
  if (_desFilter === 'hechos')     lista = lista.filter(d => d.hecho);
  if (_desProyecto)                lista = lista.filter(d => d.proyecto === _desProyecto);

  if (emptyEl) emptyEl.style.display = lista.length ? 'none' : 'block';

  list.innerHTML = lista.map(d => `
    <div class="des-card ${d.hecho ? 'des-card-done' : ''}">
      <button class="des-check" data-check="${d.id}" aria-label="${d.hecho ? 'Marcar pendiente' : 'Marcar hecho'}">
        <i class="fa-solid fa-check"></i>
      </button>
      <div class="des-card-body">
        <p class="des-text">${desEsc(d.texto)}</p>
        <div class="des-meta">
          ${d.proyecto ? `<span class="des-proj-badge"><i class="fa-solid fa-folder"></i> ${desEsc(d.proyecto)}</span>` : ''}
          <span class="des-date"><i class="fa-regular fa-clock"></i> ${desFecha(d.creado_at)}</span>
        </div>
      </div>
      <button class="des-del" data-del="${d.id}" aria-label="Eliminar destello">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>`).join('');

  list.querySelectorAll('.des-check').forEach(btn => btn.addEventListener('click', async () => {
    const d = _desCache.find(x => String(x.id) === btn.dataset.check);
    if (!d || !_sb) return;
    const hecho = !d.hecho;
    // Optimista: refleja el cambio de inmediato
    d.hecho = hecho;
    d.hecho_at = hecho ? new Date().toISOString() : null;
    desRenderView();
    const { error } = await _sb.from(DES_TABLE)
      .update({ hecho, hecho_at: d.hecho_at })
      .eq('id', d.id);
    if (error) { d.hecho = !hecho; desRenderView(); }
  }));

  list.querySelectorAll('.des-del').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('¿Eliminar este destello?')) return;
    if (!_sb) return;
    const { error } = await _sb.from(DES_TABLE).delete().eq('id', btn.dataset.del);
    if (!error) {
      _desCache = _desCache.filter(x => String(x.id) !== btn.dataset.del);
      desRenderView();
    }
  }));
}

/* ── Wiring ── */

document.addEventListener('DOMContentLoaded', () => {

  // Botón flotante global
  document.getElementById('destello-fab')?.addEventListener('click', desOpenModal);

  // Modal de captura
  document.getElementById('des-modal-close')?.addEventListener('click', desCloseModal);
  document.getElementById('des-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'des-modal-overlay') desCloseModal();
  });
  document.getElementById('des-save-btn')?.addEventListener('click', desCapturar);
  document.getElementById('des-texto')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) desCapturar();
  });
  document.getElementById('des-proyecto')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') desCapturar();
  });

  // Navegación
  document.getElementById('goto-destellos-btn')?.addEventListener('click', () => switchView('view-destellos'));
  document.getElementById('destellos-back-btn')?.addEventListener('click', () => switchView('view-inicio'));

  // Tabs de filtro
  document.querySelectorAll('#des-filter-tabs .des-ftab').forEach(btn =>
    btn.addEventListener('click', () => {
      _desFilter = btn.dataset.f;
      desRenderView();
    }));

  // Sincronizar outbox al recuperar conexión
  window.addEventListener('online', desFlushOutbox);
});
