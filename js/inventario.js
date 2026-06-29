'use strict';

const INV_TABLE = 'inventario';

const INV_ESTADO_CLASS = {
  'Nuevo':                 'nuevo',
  'Bueno':                 'bueno',
  'Regular':               'regular',
  'Necesita Reparación':   'reparacion',
  'Dañado':                'danado',
};

let _invItemsCache     = [];
let _invFilterUbicacion = ''; // '' = Todas
let _invSearchQuery     = '';
let _invEditingId       = null;

/* ─────────────────────────────────────────────
   DASHBOARD + LISTA
───────────────────────────────────────────── */

async function initInventario() {
  const list = document.getElementById('inv-items-list');
  if (!_sb) {
    if (list) list.innerHTML = '<div class="fin-empty">No se pudo conectar con Inventario.</div>';
    return;
  }

  const { data, error } = await _sb.from(INV_TABLE).select('*').order('nombre');

  if (error) {
    console.error('[Inventario] Error cargando artículos:', error);
    if (list) list.innerHTML = '<div class="fin-empty">No se pudieron cargar los artículos.</div>';
    return;
  }

  _invItemsCache = data || [];
  _invRenderDashboard();
  _invRenderList();
}

function _invRenderDashboard() {
  const totalEl = document.getElementById('inv-total-items');
  const valorEl = document.getElementById('inv-total-valor');
  if (totalEl) totalEl.textContent = _invItemsCache.length;
  if (valorEl) {
    const total = _invItemsCache.reduce((sum, i) => sum + Number(i.valor_estimado || 0), 0);
    valorEl.textContent = _finMoney(total);
  }
}

function _invRenderList() {
  const container = document.getElementById('inv-items-list');
  if (!container) return;

  let lista = _invItemsCache;
  if (_invFilterUbicacion) lista = lista.filter(i => i.ubicacion === _invFilterUbicacion);
  if (_invSearchQuery.trim()) {
    const q = _invSearchQuery.trim().toLowerCase();
    lista = lista.filter(i => (i.nombre || '').toLowerCase().includes(q));
  }

  if (!lista.length) {
    container.innerHTML = '<div class="fin-empty">No se encontraron artículos.</div>';
    return;
  }

  container.innerHTML = '';
  lista.forEach(item => container.appendChild(_invRenderCard(item)));
}

function _invRenderCard(item) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'inv-card';

  const main = document.createElement('div');
  main.className = 'inv-card-main';

  const name = document.createElement('div');
  name.className = 'inv-card-name';
  name.textContent = item.nombre;
  main.appendChild(name);

  const meta = document.createElement('div');
  meta.className = 'inv-card-meta';
  meta.textContent = `📍 ${item.ubicacion || 'Sin ubicación'} · ${item.categoria || 'Sin categoría'}`;
  main.appendChild(meta);

  if (item.notas) {
    const notas = document.createElement('div');
    notas.className = 'inv-card-notes';
    notas.textContent = item.notas;
    main.appendChild(notas);
  }

  const side = document.createElement('div');
  side.className = 'inv-card-side';

  const estadoClass = 'inv-estado-' + (INV_ESTADO_CLASS[item.estado] || 'bueno');
  const badge = document.createElement('span');
  badge.className = 'inv-estado-badge ' + estadoClass;
  badge.textContent = item.estado || 'Bueno';
  side.appendChild(badge);

  const valor = document.createElement('span');
  valor.className = 'inv-card-valor';
  valor.textContent = _finMoney(item.valor_estimado);
  side.appendChild(valor);

  card.append(main, side);
  card.addEventListener('click', () => invOpenModal(item));
  return card;
}

/* ─────────────────────────────────────────────
   FORMULARIO (crear / editar)
───────────────────────────────────────────── */

function invOpenModal(item) {
  _invEditingId = item ? item.id : null;

  document.getElementById('inv-modal-title').textContent = item ? 'Editar Artículo' : 'Nuevo Artículo';
  document.getElementById('inv-submit-btn').textContent  = item ? 'Guardar Cambios' : 'Guardar Artículo';
  document.getElementById('inv-delete-btn').style.display = item ? 'flex' : 'none';

  document.getElementById('inv-f-nombre').value    = item ? item.nombre : '';
  document.getElementById('inv-f-categoria').value = item && item.categoria ? item.categoria : 'Electrodomésticos';
  document.getElementById('inv-f-ubicacion').value = item && item.ubicacion ? item.ubicacion : 'Sala';
  document.getElementById('inv-f-estado').value    = item && item.estado ? item.estado : 'Bueno';
  document.getElementById('inv-f-valor').value     = item ? item.valor_estimado : '';
  document.getElementById('inv-f-notas').value     = item ? (item.notas || '') : '';

  const overlay = document.getElementById('inv-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function invCloseModal() {
  _invEditingId = null;
  const overlay = document.getElementById('inv-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  document.getElementById('inv-form')?.reset();
}

async function invSubmitForm(e) {
  e.preventDefault();
  if (!_sb) return;

  const nombre = document.getElementById('inv-f-nombre').value.trim();
  if (!nombre) return;

  const payload = {
    nombre,
    categoria:      document.getElementById('inv-f-categoria').value,
    ubicacion:      document.getElementById('inv-f-ubicacion').value,
    estado:         document.getElementById('inv-f-estado').value,
    valor_estimado: parseFloat(document.getElementById('inv-f-valor').value) || 0,
    notas:          document.getElementById('inv-f-notas').value.trim(),
  };

  const btn = document.getElementById('inv-submit-btn');
  if (btn) btn.disabled = true;

  const { error } = _invEditingId
    ? await _sb.from(INV_TABLE).update(payload).eq('id', _invEditingId)
    : await _sb.from(INV_TABLE).insert(payload);

  if (error) {
    console.error('[Inventario] Error guardando artículo:', error);
    if (typeof toast === 'function') toast('No se pudo guardar el artículo');
    if (btn) btn.disabled = false;
    return;
  }

  if (typeof toast === 'function') toast(_invEditingId ? '✅ Artículo actualizado' : '✅ Artículo agregado');
  if (btn) btn.disabled = false;
  invCloseModal();
  await initInventario();
}

async function invDeleteItem() {
  if (!_invEditingId || !_sb) return;
  const ok = confirm('¿Eliminar este artículo del inventario? Esta acción no se puede deshacer.');
  if (!ok) return;

  const { error } = await _sb.from(INV_TABLE).delete().eq('id', _invEditingId);
  if (error) {
    console.error('[Inventario] Error eliminando artículo:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar el artículo');
    return;
  }

  if (typeof toast === 'function') toast('🗑️ Artículo eliminado');
  invCloseModal();
  await initInventario();
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inv-fab')?.addEventListener('click', () => invOpenModal(null));
  document.getElementById('inv-modal-close')?.addEventListener('click', invCloseModal);
  document.getElementById('inv-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'inv-modal-overlay') invCloseModal();
  });

  document.getElementById('inv-form')?.addEventListener('submit', invSubmitForm);
  document.getElementById('inv-delete-btn')?.addEventListener('click', invDeleteItem);

  document.getElementById('inv-search-input')?.addEventListener('input', e => {
    _invSearchQuery = e.target.value;
    _invRenderList();
  });

  document.getElementById('inv-filter-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.inv-chip');
    if (!chip) return;
    document.querySelectorAll('#inv-filter-chips .inv-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    _invFilterUbicacion = chip.dataset.ubicacion;
    _invRenderList();
  });
});
