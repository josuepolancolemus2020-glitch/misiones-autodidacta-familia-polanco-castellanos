'use strict';

const FIN_CUENTAS_TABLE       = 'cuentas';
const FIN_TRANSACCIONES_TABLE = 'transacciones';
const FIN_DEUDAS_TABLE        = 'deudas';

// Categoría reservada para movimientos que solo mueven dinero entre cuentas
// de la familia (ej. darle efectivo a un familiar). No es un gasto ni un
// ingreso real, así que se excluye de "Gastos del Mes".
const FIN_TRANSFER_CATEGORY = 'Envío Familiar';

let _finCuentasCache  = [];
let _finGastosMesCache = [];
let _finDeudasCache    = [];

// Estado del detalle de "Gastos del Mes": qué mes se está viendo y qué
// tarjeta abrió el modal de detalle. Permite navegar a meses anteriores.
let _finGastosView   = null; // { year, month(0-based) }
let _finDetailKind   = null; // 'saldo' | 'gastos' | 'deudas'

// Estado de edición de una transacción (para reutilizar el formulario).
let _finEditingId       = null;
let _finEditingOriginal = null; // { monto, tipo, cuenta_id } previos

function _finCurrentUserName() {
  const session = (typeof verificarSesion === 'function') ? verificarSesion() : null;
  if (session) return session.nombre;
  if (typeof load === 'function' && typeof getMember === 'function') {
    const s = load();
    return getMember(s.currentMember).short;
  }
  return 'Familia';
}

function _finMoney(n) {
  const num = Number(n) || 0;
  return 'L. ' + num.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function _finToday() {
  const d = new Date();
  const pad = x => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function _finFormatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-HN', { day: 'numeric', month: 'short' });
}

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */

async function initFinanzas() {
  if (!_sb) {
    const list = document.getElementById('fin-movimientos-list');
    if (list) list.innerHTML = '<div class="fin-empty">No se pudo conectar con Finanzas.</div>';
    return;
  }

  const [cuentasRes, gastosRes, deudasRes] = await Promise.all([
    _sb.from(FIN_CUENTAS_TABLE).select('*').order('nombre'),
    _sb.from(FIN_TRANSACCIONES_TABLE).select('*').eq('tipo', 'egreso').neq('categoria', FIN_TRANSFER_CATEGORY).gte('fecha', _finStartOfMonth()).order('fecha', { ascending: false }),
    _sb.from(FIN_DEUDAS_TABLE).select('*').order('fecha_limite', { ascending: true, nullsFirst: false }),
  ]);

  if (cuentasRes.error) {
    console.error('[Finanzas] Error cargando cuentas:', cuentasRes.error);
  } else {
    _finCuentasCache = cuentasRes.data || [];
    const totalSaldo = _finCuentasCache.reduce((sum, c) => sum + Number(c.saldo_actual || 0), 0);
    document.getElementById('fin-saldo-total').textContent = _finMoney(totalSaldo);
    _finRenderCuentaOptions(_finCuentasCache);
  }

  if (gastosRes.error) {
    console.error('[Finanzas] Error cargando gastos del mes:', gastosRes.error);
  } else {
    _finGastosMesCache = gastosRes.data || [];
    const totalGastos = _finGastosMesCache.reduce((sum, t) => sum + Number(t.monto || 0), 0);
    document.getElementById('fin-gastos-mes').textContent = _finMoney(totalGastos);
  }

  if (deudasRes.error) {
    console.error('[Finanzas] Error cargando deudas:', deudasRes.error);
  } else {
    _finDeudasCache = deudasRes.data || [];
    const totalDeuda = _finDeudasCache.reduce(
      (sum, d) => sum + (Number(d.monto_total || 0) - Number(d.monto_pagado || 0)), 0
    );
    document.getElementById('fin-deudas-total').textContent = _finMoney(totalDeuda);
  }

  await finLoadMovimientos();
}

function _finStartOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// Rango [inicio, fin) de un mes concreto (month es 0-based).
function _finMonthRange(year, month) {
  const pad = x => String(x).padStart(2, '0');
  const start = `${year}-${pad(month + 1)}-01`;
  const ny = month === 11 ? year + 1 : year;
  const nm = month === 11 ? 0 : month + 1;
  const end = `${ny}-${pad(nm + 1)}-01`;
  return { start, end };
}

function _finMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('es-HN', { month: 'long', year: 'numeric' });
}

// Lee/escribe saldo de una cuenta aplicando un delta (con lectura fresca).
async function _finApplyBalanceDelta(cuentaId, delta) {
  if (!cuentaId || !delta) return;
  const { data, error } = await _sb
    .from(FIN_CUENTAS_TABLE)
    .select('saldo_actual')
    .eq('id', cuentaId)
    .single();
  if (error) {
    console.error('[Finanzas] Error leyendo saldo para ajuste:', error);
    return;
  }
  const nuevo = Number(data.saldo_actual || 0) + delta;
  const { error: errUpd } = await _sb
    .from(FIN_CUENTAS_TABLE)
    .update({ saldo_actual: nuevo })
    .eq('id', cuentaId);
  if (errUpd) console.error('[Finanzas] Error actualizando saldo:', errUpd);
}

// Trae los egresos reales (sin envíos familiares) de un mes concreto.
async function _finFetchGastosMes(year, month) {
  const { start, end } = _finMonthRange(year, month);
  const { data, error } = await _sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('*')
    .eq('tipo', 'egreso')
    .neq('categoria', FIN_TRANSFER_CATEGORY)
    .gte('fecha', start)
    .lt('fecha', end)
    .order('fecha', { ascending: false })
    .order('id', { ascending: false });
  if (error) {
    console.error('[Finanzas] Error cargando gastos del mes:', error);
    return [];
  }
  return data || [];
}

async function finLoadMovimientos() {
  const container = document.getElementById('fin-movimientos-list');
  if (!container || !_sb) return;

  const { data, error } = await _sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('*')
    .order('fecha', { ascending: false })
    .order('id', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[Finanzas] Error cargando movimientos:', error);
    container.innerHTML = '<div class="fin-empty">No se pudieron cargar los movimientos.</div>';
    return;
  }

  if (!data || !data.length) {
    container.innerHTML = '<div class="fin-empty">Aún no hay movimientos registrados.</div>';
    return;
  }

  container.innerHTML = '';
  data.forEach(t => container.appendChild(_finRenderMovimiento(t)));
}

function _finRenderMovimiento(t) {
  const esTransferencia = t.categoria === FIN_TRANSFER_CATEGORY;
  const esIngreso = t.tipo === 'ingreso';

  const tono = esTransferencia ? 'transfer' : (esIngreso ? 'in' : 'out');

  const row = document.createElement('div');
  row.className = 'fin-mov-row';

  const icon = document.createElement('div');
  icon.className = 'fin-mov-icon fin-mov-' + tono;
  const iconClass = esTransferencia ? 'fa-right-left' : (esIngreso ? 'fa-arrow-up' : 'fa-arrow-down');
  icon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

  const info = document.createElement('div');
  info.className = 'fin-mov-info';

  const desc = document.createElement('div');
  desc.className = 'fin-mov-desc';
  desc.textContent = t.descripcion || t.categoria || 'Movimiento';

  const meta = document.createElement('div');
  meta.className = 'fin-mov-meta';
  meta.textContent = `${t.usuario || 'Familia'} · ${t.categoria || ''} · ${_finFormatDate(t.fecha)}`;

  info.append(desc, meta);

  const amount = document.createElement('div');
  amount.className = 'fin-mov-amount fin-mov-' + tono;
  amount.textContent = (esIngreso ? '+ ' : '- ') + _finMoney(t.monto);

  row.append(icon, info, amount);
  return row;
}

function _finRenderCuentaOptions(cuentas) {
  ['fin-t-cuenta', 'fin-tr-origen', 'fin-tr-destino'].forEach(id => _finFillCuentaSelect(id, cuentas));
}

function _finFillCuentaSelect(selectId, cuentas) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '';

  if (!cuentas.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Primero agrega una cuenta';
    select.appendChild(opt);
    return;
  }

  cuentas.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.nombre} (${_finMoney(c.saldo_actual)})`;
    select.appendChild(opt);
  });
}

/* ─────────────────────────────────────────────
   DETALLE DE TARJETAS RESUMEN
───────────────────────────────────────────── */

function _finDetailRow(title, subtitle, amountText, amountClass) {
  const row = document.createElement('div');
  row.className = 'fin-detail-row';

  const main = document.createElement('div');
  main.className = 'fin-detail-row-main';

  const titleEl = document.createElement('div');
  titleEl.className = 'fin-detail-row-title';
  titleEl.textContent = title;
  main.appendChild(titleEl);

  if (subtitle) {
    const subEl = document.createElement('div');
    subEl.className = 'fin-detail-row-sub';
    subEl.textContent = subtitle;
    main.appendChild(subEl);
  }

  const amountEl = document.createElement('div');
  amountEl.className = 'fin-detail-row-amount' + (amountClass ? ' ' + amountClass : '');
  amountEl.textContent = amountText;

  row.append(main, amountEl);
  return row;
}

function _finDetailEmpty(msg) {
  const div = document.createElement('div');
  div.className = 'fin-empty';
  div.textContent = msg;
  return div;
}

function _finCuentaDetailRow(c) {
  const row = document.createElement('div');
  row.className = 'fin-detail-row';

  const main = document.createElement('div');
  main.className = 'fin-detail-row-main';
  const titleEl = document.createElement('div');
  titleEl.className = 'fin-detail-row-title';
  titleEl.textContent = c.nombre;
  main.appendChild(titleEl);

  const actions = document.createElement('div');
  actions.className = 'fin-detail-row-actions';

  const amountEl = document.createElement('div');
  amountEl.className = 'fin-detail-row-amount';
  amountEl.textContent = _finMoney(c.saldo_actual);

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'fin-detail-delete-btn';
  delBtn.setAttribute('aria-label', `Eliminar cuenta ${c.nombre}`);
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.addEventListener('click', () => finDeleteCuenta(c.id, c.nombre));

  actions.append(amountEl, delBtn);
  row.append(main, actions);
  return row;
}

async function finDeleteCuenta(id, nombre) {
  if (!_sb) return;

  const { count, error: errCheck } = await _sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('cuenta_id', id);

  if (errCheck) {
    console.error('[Finanzas] Error verificando movimientos de la cuenta:', errCheck);
  } else if (count > 0) {
    if (typeof toast === 'function') {
      toast(`No se puede eliminar: "${nombre}" tiene ${count} movimiento${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}`);
    }
    return;
  }

  const ok = confirm(`¿Eliminar la cuenta "${nombre}"? Esta acción no se puede deshacer.`);
  if (!ok) return;

  const { error } = await _sb.from(FIN_CUENTAS_TABLE).delete().eq('id', id);

  if (error) {
    console.error('[Finanzas] Error eliminando cuenta:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar la cuenta');
    return;
  }

  if (typeof toast === 'function') toast('🗑️ Cuenta eliminada');
  await initFinanzas();
  finOpenDetail('saldo');
}

async function finOpenDetail(kind) {
  const overlay = document.getElementById('fin-detail-modal-overlay');
  const title   = document.getElementById('fin-detail-title');
  const content = document.getElementById('fin-detail-content');
  if (!overlay || !title || !content) return;

  _finDetailKind = kind;
  content.innerHTML = '';

  if (kind === 'saldo') {
    title.textContent = 'Saldo por Cuenta';
    if (!_finCuentasCache.length) {
      content.appendChild(_finDetailEmpty('Aún no has registrado ninguna cuenta.'));
    } else {
      _finCuentasCache.forEach(c => {
        content.appendChild(_finCuentaDetailRow(c));
      });
    }
  } else if (kind === 'gastos') {
    const now = new Date();
    _finGastosView = { year: now.getFullYear(), month: now.getMonth() };
    overlay.style.display = 'flex';
    await _finRenderGastosDetail();
    return;
  } else if (kind === 'deudas') {
    title.textContent = 'Deudas Pendientes';
    if (!_finDeudasCache.length) {
      content.appendChild(_finDetailEmpty('Aún no has registrado ninguna deuda.'));
    } else {
      _finDeudasCache.forEach(d => {
        const pendiente = Number(d.monto_total || 0) - Number(d.monto_pagado || 0);
        let sub = `Pagado ${_finMoney(d.monto_pagado)} de ${_finMoney(d.monto_total)}`;
        if (d.fecha_limite) sub += ` · Vence ${_finFormatDate(d.fecha_limite)}`;
        if (d.estado) sub += ` · ${d.estado}`;
        content.appendChild(_finDetailRow(d.descripcion || 'Deuda', sub, _finMoney(pendiente), 'fin-detail-debt'));
      });
    }
  }

  overlay.style.display = 'flex';
}

function finCloseDetail() {
  const overlay = document.getElementById('fin-detail-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  _finDetailKind = null;
}

/* ─────────────────────────────────────────────
   DETALLE DE GASTOS CON NAVEGACIÓN POR MES
───────────────────────────────────────────── */

function _finGastosNav() {
  const nav = document.createElement('div');
  nav.className = 'fin-month-nav';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'fin-month-nav-btn';
  prev.setAttribute('aria-label', 'Mes anterior');
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prev.addEventListener('click', () => _finChangeGastosMonth(-1));

  const label = document.createElement('div');
  label.className = 'fin-month-nav-label';
  label.textContent = _finMonthLabel(_finGastosView.year, _finGastosView.month);

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'fin-month-nav-btn';
  next.setAttribute('aria-label', 'Mes siguiente');
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  const now = new Date();
  next.disabled = _finGastosView.year === now.getFullYear() && _finGastosView.month === now.getMonth();
  next.addEventListener('click', () => _finChangeGastosMonth(1));

  nav.append(prev, label, next);
  return nav;
}

function _finChangeGastosMonth(delta) {
  let { year, month } = _finGastosView;
  month += delta;
  if (month < 0) { month = 11; year--; }
  else if (month > 11) { month = 0; year++; }
  _finGastosView = { year, month };
  _finRenderGastosDetail();
}

function _finGastoDetailRow(t) {
  const row = document.createElement('div');
  row.className = 'fin-detail-row';

  const main = document.createElement('div');
  main.className = 'fin-detail-row-main';
  const titleEl = document.createElement('div');
  titleEl.className = 'fin-detail-row-title';
  titleEl.textContent = t.descripcion || t.categoria || 'Gasto';
  const subEl = document.createElement('div');
  subEl.className = 'fin-detail-row-sub';
  subEl.textContent = `${t.usuario || 'Familia'} · ${t.categoria || ''} · ${_finFormatDate(t.fecha)}`;
  main.append(titleEl, subEl);

  const actions = document.createElement('div');
  actions.className = 'fin-detail-row-actions';

  const amountEl = document.createElement('div');
  amountEl.className = 'fin-detail-row-amount fin-detail-out';
  amountEl.textContent = '- ' + _finMoney(t.monto);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'fin-detail-edit-btn';
  editBtn.setAttribute('aria-label', 'Editar gasto');
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editBtn.addEventListener('click', () => finEditTransaccion(t));

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'fin-detail-delete-btn';
  delBtn.setAttribute('aria-label', 'Eliminar gasto');
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.addEventListener('click', () => finDeleteTransaccion(t));

  actions.append(amountEl, editBtn, delBtn);
  row.append(main, actions);
  return row;
}

async function _finRenderGastosDetail() {
  const title   = document.getElementById('fin-detail-title');
  const content = document.getElementById('fin-detail-content');
  if (!content || !_finGastosView) return;

  const { year, month } = _finGastosView;
  if (title) title.textContent = 'Gastos · ' + _finMonthLabel(year, month);

  content.innerHTML = '';
  content.appendChild(_finGastosNav());

  const listWrap = document.createElement('div');
  listWrap.className = 'fin-detail-content';
  listWrap.innerHTML = '<div class="fin-empty">Cargando…</div>';
  content.appendChild(listWrap);

  const gastos = await _finFetchGastosMes(year, month);

  // Evita renderizar datos viejos si el usuario cambió de mes mientras cargaba.
  if (!_finGastosView || _finGastosView.year !== year || _finGastosView.month !== month) return;

  listWrap.innerHTML = '';
  if (!gastos.length) {
    listWrap.appendChild(_finDetailEmpty('Sin gastos registrados en este mes.'));
    return;
  }

  gastos.forEach(t => listWrap.appendChild(_finGastoDetailRow(t)));

  const total = gastos.reduce((s, t) => s + Number(t.monto || 0), 0);
  const totalRow = document.createElement('div');
  totalRow.className = 'fin-month-total';
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Total del mes';
  const totalValue = document.createElement('span');
  totalValue.textContent = '- ' + _finMoney(total);
  totalRow.append(totalLabel, totalValue);
  content.appendChild(totalRow);
}

// Re-renderiza el detalle de gastos si está abierto (tras editar/eliminar).
async function _finRefreshGastosDetailIfOpen() {
  const overlay = document.getElementById('fin-detail-modal-overlay');
  if (overlay && overlay.style.display !== 'none' && _finDetailKind === 'gastos') {
    await _finRenderGastosDetail();
  }
}

async function finDeleteTransaccion(t) {
  if (!_sb) return;
  const ok = confirm(`¿Eliminar el gasto "${t.descripcion || t.categoria || 'Gasto'}" de ${_finMoney(t.monto)}? Esta acción no se puede deshacer.`);
  if (!ok) return;

  const { error } = await _sb.from(FIN_TRANSACCIONES_TABLE).delete().eq('id', t.id);
  if (error) {
    console.error('[Finanzas] Error eliminando gasto:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar el gasto');
    return;
  }

  // Revierte el efecto que tuvo sobre el saldo de su cuenta.
  const effect = (t.tipo === 'ingreso' ? 1 : -1) * Number(t.monto || 0);
  await _finApplyBalanceDelta(t.cuenta_id, -effect);

  if (typeof toast === 'function') toast('🗑️ Gasto eliminado');
  await initFinanzas();
  await _finRefreshGastosDetailIfOpen();
}

function finEditTransaccion(t) {
  _finEditingId = t.id;
  _finEditingOriginal = {
    monto: Number(t.monto || 0),
    tipo: t.tipo,
    cuenta_id: t.cuenta_id,
  };

  const overlay = document.getElementById('fin-modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  finSwitchTab('transaccion');

  document.getElementById('fin-t-tipo').value        = t.tipo || 'egreso';
  document.getElementById('fin-t-monto').value       = t.monto;
  document.getElementById('fin-t-categoria').value   = t.categoria || 'Otros';
  document.getElementById('fin-t-descripcion').value = t.descripcion || '';
  document.getElementById('fin-t-cuenta').value      = t.cuenta_id || '';
  document.getElementById('fin-t-fecha').value       = t.fecha || _finToday();

  const btn = document.querySelector('#fin-form-transaccion .fin-submit-btn');
  if (btn) btn.textContent = 'Actualizar Transacción';
}

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */

function finOpenModal(tab) {
  const overlay = document.getElementById('fin-modal-overlay');
  if (!overlay) return;

  // Alta nueva: sale de cualquier modo de edición previo.
  _finEditingId = null;
  _finEditingOriginal = null;
  const editBtn = document.querySelector('#fin-form-transaccion .fin-submit-btn');
  if (editBtn) editBtn.textContent = 'Guardar Transacción';

  overlay.style.display = 'flex';
  ['fin-t-fecha', 'fin-tr-fecha'].forEach(id => {
    const input = document.getElementById(id);
    if (input && !input.value) input.value = _finToday();
  });
  finSwitchTab(tab || 'transaccion');
}

function finCloseModal() {
  const overlay = document.getElementById('fin-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  _finEditingId = null;
  _finEditingOriginal = null;
  const btn = document.querySelector('#fin-form-transaccion .fin-submit-btn');
  if (btn) btn.textContent = 'Guardar Transacción';
}

function finSwitchTab(tab) {
  document.querySelectorAll('.fin-modal-tab').forEach(btn => {
    btn.classList.toggle('fin-modal-tab-active', btn.dataset.fintab === tab);
  });
  document.getElementById('fin-form-transaccion').style.display    = tab === 'transaccion'    ? 'flex' : 'none';
  document.getElementById('fin-form-transferencia').style.display  = tab === 'transferencia'  ? 'flex' : 'none';
  document.getElementById('fin-form-cuenta').style.display         = tab === 'cuenta'         ? 'flex' : 'none';
  document.getElementById('fin-form-deuda').style.display          = tab === 'deuda'          ? 'flex' : 'none';
}

/* ─────────────────────────────────────────────
   ENVÍO DE FORMULARIOS
───────────────────────────────────────────── */

async function finSubmitTransaccion(e) {
  e.preventDefault();
  if (!_sb) return;

  const tipo        = document.getElementById('fin-t-tipo').value;
  const monto       = parseFloat(document.getElementById('fin-t-monto').value);
  const categoria   = document.getElementById('fin-t-categoria').value;
  const descripcion = document.getElementById('fin-t-descripcion').value.trim();
  const cuentaId     = document.getElementById('fin-t-cuenta').value;
  const fecha        = document.getElementById('fin-t-fecha').value;

  if (!monto || monto <= 0 || !cuentaId) return;

  const btn = e.target.querySelector('.fin-submit-btn');
  if (btn) btn.disabled = true;

  // ── Modo edición: actualiza el registro y reconcilia los saldos ──
  if (_finEditingId) {
    const editId = _finEditingId;
    const orig = _finEditingOriginal || {};

    const { error: errUpd } = await _sb
      .from(FIN_TRANSACCIONES_TABLE)
      .update({ tipo, monto, categoria, descripcion, fecha, cuenta_id: cuentaId })
      .eq('id', editId);

    if (errUpd) {
      console.error('[Finanzas] Error actualizando transacción:', errUpd);
      if (typeof toast === 'function') toast('No se pudo actualizar la transacción');
      if (btn) btn.disabled = false;
      return;
    }

    // Efecto sobre el saldo: ingreso suma, egreso resta.
    const oldEffect = (orig.tipo === 'ingreso' ? 1 : -1) * Number(orig.monto || 0);
    const newEffect = (tipo === 'ingreso' ? 1 : -1) * monto;

    if (String(orig.cuenta_id) === String(cuentaId)) {
      await _finApplyBalanceDelta(cuentaId, newEffect - oldEffect);
    } else {
      if (orig.cuenta_id) await _finApplyBalanceDelta(orig.cuenta_id, -oldEffect);
      await _finApplyBalanceDelta(cuentaId, newEffect);
    }

    if (typeof toast === 'function') toast('✅ Transacción actualizada');
    _finEditingId = null;
    _finEditingOriginal = null;
    e.target.reset();
    document.getElementById('fin-t-fecha').value = _finToday();
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar Transacción'; }
    finCloseModal();
    await initFinanzas();
    await _finRefreshGastosDetailIfOpen();
    return;
  }

  const { error: errInsert } = await _sb.from(FIN_TRANSACCIONES_TABLE).insert({
    tipo, monto, categoria, descripcion, fecha,
    usuario: _finCurrentUserName(),
    cuenta_id: cuentaId,
  });

  if (errInsert) {
    console.error('[Finanzas] Error guardando transacción:', errInsert);
    if (typeof toast === 'function') toast('No se pudo guardar la transacción');
    if (btn) btn.disabled = false;
    return;
  }

  // Actualiza matemáticamente el saldo de la cuenta afectada
  const { data: cuentaActual, error: errSelect } = await _sb
    .from(FIN_CUENTAS_TABLE)
    .select('saldo_actual')
    .eq('id', cuentaId)
    .single();

  if (errSelect) {
    console.error('[Finanzas] Error leyendo saldo actual:', errSelect);
  } else {
    const delta = tipo === 'ingreso' ? monto : -monto;
    const nuevoSaldo = Number(cuentaActual.saldo_actual || 0) + delta;
    const { error: errUpdate } = await _sb
      .from(FIN_CUENTAS_TABLE)
      .update({ saldo_actual: nuevoSaldo })
      .eq('id', cuentaId);
    if (errUpdate) console.error('[Finanzas] Error actualizando saldo:', errUpdate);
  }

  if (typeof toast === 'function') toast('✅ Transacción registrada');
  e.target.reset();
  document.getElementById('fin-t-fecha').value = _finToday();
  if (btn) btn.disabled = false;
  finCloseModal();
  await initFinanzas();
}

async function finSubmitTransferencia(e) {
  e.preventDefault();
  if (!_sb) return;

  const origenId   = document.getElementById('fin-tr-origen').value;
  const destinoId   = document.getElementById('fin-tr-destino').value;
  const monto        = parseFloat(document.getElementById('fin-tr-monto').value);
  const descripcion  = document.getElementById('fin-tr-descripcion').value.trim() || 'Envío familiar entre cuentas';
  const fecha         = document.getElementById('fin-tr-fecha').value;

  if (!origenId || !destinoId || !monto || monto <= 0) return;

  if (origenId === destinoId) {
    if (typeof toast === 'function') toast('La cuenta origen y destino deben ser distintas');
    return;
  }

  const btn = e.target.querySelector('.fin-submit-btn');
  if (btn) btn.disabled = true;
  const usuario = _finCurrentUserName();

  // Dos movimientos enlazados: egreso en origen + ingreso en destino,
  // ambos bajo la categoría reservada para que NO se cuenten como
  // gasto/ingreso real en el dashboard.
  const { error: errInsert } = await _sb.from(FIN_TRANSACCIONES_TABLE).insert([
    { tipo: 'egreso',  monto, categoria: FIN_TRANSFER_CATEGORY, descripcion, fecha, usuario, cuenta_id: origenId },
    { tipo: 'ingreso', monto, categoria: FIN_TRANSFER_CATEGORY, descripcion, fecha, usuario, cuenta_id: destinoId },
  ]);

  if (errInsert) {
    console.error('[Finanzas] Error guardando envío familiar:', errInsert);
    if (typeof toast === 'function') toast('No se pudo guardar el envío familiar');
    if (btn) btn.disabled = false;
    return;
  }

  // Actualiza ambos saldos con lectura fresca antes de escribir
  const { data: cuentasActuales, error: errSelect } = await _sb
    .from(FIN_CUENTAS_TABLE)
    .select('id, saldo_actual')
    .in('id', [origenId, destinoId]);

  if (errSelect) {
    console.error('[Finanzas] Error leyendo saldos:', errSelect);
  } else {
    const origenActual  = cuentasActuales.find(c => String(c.id) === String(origenId));
    const destinoActual = cuentasActuales.find(c => String(c.id) === String(destinoId));

    const updates = [];
    if (origenActual) {
      updates.push(
        _sb.from(FIN_CUENTAS_TABLE)
          .update({ saldo_actual: Number(origenActual.saldo_actual || 0) - monto })
          .eq('id', origenId)
      );
    }
    if (destinoActual) {
      updates.push(
        _sb.from(FIN_CUENTAS_TABLE)
          .update({ saldo_actual: Number(destinoActual.saldo_actual || 0) + monto })
          .eq('id', destinoId)
      );
    }
    const results = await Promise.all(updates);
    results.forEach(r => { if (r.error) console.error('[Finanzas] Error actualizando saldo:', r.error); });
  }

  if (typeof toast === 'function') toast('✅ Envío Familiar registrado');
  e.target.reset();
  document.getElementById('fin-tr-fecha').value = _finToday();
  if (btn) btn.disabled = false;
  finCloseModal();
  await initFinanzas();
}

async function finSubmitCuenta(e) {
  e.preventDefault();
  if (!_sb) return;

  const nombre = document.getElementById('fin-c-nombre').value.trim();
  const saldo  = parseFloat(document.getElementById('fin-c-saldo').value) || 0;
  if (!nombre) return;

  const btn = e.target.querySelector('.fin-submit-btn');
  if (btn) btn.disabled = true;

  const { error } = await _sb.from(FIN_CUENTAS_TABLE).insert({ nombre, saldo_actual: saldo });

  if (error) {
    console.error('[Finanzas] Error guardando cuenta:', error);
    if (typeof toast === 'function') toast('No se pudo guardar la cuenta');
  } else {
    if (typeof toast === 'function') toast('✅ Cuenta agregada');
    e.target.reset();
    finCloseModal();
    await initFinanzas();
  }
  if (btn) btn.disabled = false;
}

async function finSubmitDeuda(e) {
  e.preventDefault();
  if (!_sb) return;

  const descripcion = document.getElementById('fin-d-descripcion').value.trim();
  const montoTotal   = parseFloat(document.getElementById('fin-d-total').value);
  const montoPagado  = parseFloat(document.getElementById('fin-d-pagado').value) || 0;
  const fechaLimite   = document.getElementById('fin-d-fecha').value || null;
  if (!descripcion || !montoTotal) return;

  const btn = e.target.querySelector('.fin-submit-btn');
  if (btn) btn.disabled = true;

  const { error } = await _sb.from(FIN_DEUDAS_TABLE).insert({
    descripcion,
    monto_total: montoTotal,
    monto_pagado: montoPagado,
    fecha_limite: fechaLimite,
    estado: montoPagado >= montoTotal ? 'pagada' : 'pendiente',
  });

  if (error) {
    console.error('[Finanzas] Error guardando deuda:', error);
    if (typeof toast === 'function') toast('No se pudo guardar la deuda');
  } else {
    if (typeof toast === 'function') toast('✅ Deuda agregada');
    e.target.reset();
    finCloseModal();
    await initFinanzas();
  }
  if (btn) btn.disabled = false;
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fin-fab')?.addEventListener('click', () => finOpenModal('transaccion'));
  document.getElementById('fin-modal-close')?.addEventListener('click', finCloseModal);
  document.getElementById('fin-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'fin-modal-overlay') finCloseModal();
  });

  document.querySelectorAll('.fin-modal-tab').forEach(btn => {
    btn.addEventListener('click', () => finSwitchTab(btn.dataset.fintab));
  });

  document.getElementById('fin-form-transaccion')?.addEventListener('submit', finSubmitTransaccion);
  document.getElementById('fin-form-transferencia')?.addEventListener('submit', finSubmitTransferencia);
  document.getElementById('fin-form-cuenta')?.addEventListener('submit', finSubmitCuenta);
  document.getElementById('fin-form-deuda')?.addEventListener('submit', finSubmitDeuda);

  // Detalle de las tarjetas resumen (Saldo / Gastos del Mes / Deudas)
  document.querySelector('.fin-summary-grid')?.addEventListener('click', e => {
    const card = e.target.closest('[data-findetail]');
    if (card) finOpenDetail(card.dataset.findetail);
  });
  document.getElementById('fin-detail-close')?.addEventListener('click', finCloseDetail);
  document.getElementById('fin-detail-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'fin-detail-modal-overlay') finCloseDetail();
  });
});
