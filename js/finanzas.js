'use strict';

const FIN_CUENTAS_TABLE       = 'cuentas';
const FIN_TRANSACCIONES_TABLE = 'transacciones';
const FIN_DEUDAS_TABLE        = 'deudas';

let _finCuentasCache = [];

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
    _sb.from(FIN_TRANSACCIONES_TABLE).select('monto').eq('tipo', 'egreso').gte('fecha', _finStartOfMonth()),
    _sb.from(FIN_DEUDAS_TABLE).select('monto_total, monto_pagado'),
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
    const totalGastos = (gastosRes.data || []).reduce((sum, t) => sum + Number(t.monto || 0), 0);
    document.getElementById('fin-gastos-mes').textContent = _finMoney(totalGastos);
  }

  if (deudasRes.error) {
    console.error('[Finanzas] Error cargando deudas:', deudasRes.error);
  } else {
    const totalDeuda = (deudasRes.data || []).reduce(
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
  const esIngreso = t.tipo === 'ingreso';

  const row = document.createElement('div');
  row.className = 'fin-mov-row';

  const icon = document.createElement('div');
  icon.className = 'fin-mov-icon ' + (esIngreso ? 'fin-mov-in' : 'fin-mov-out');
  icon.innerHTML = `<i class="fa-solid ${esIngreso ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>`;

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
  amount.className = 'fin-mov-amount ' + (esIngreso ? 'fin-mov-in' : 'fin-mov-out');
  amount.textContent = (esIngreso ? '+ ' : '- ') + _finMoney(t.monto);

  row.append(icon, info, amount);
  return row;
}

function _finRenderCuentaOptions(cuentas) {
  const select = document.getElementById('fin-t-cuenta');
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
   MODAL
───────────────────────────────────────────── */

function finOpenModal(tab) {
  const overlay = document.getElementById('fin-modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  const fechaInput = document.getElementById('fin-t-fecha');
  if (fechaInput && !fechaInput.value) fechaInput.value = _finToday();
  finSwitchTab(tab || 'transaccion');
}

function finCloseModal() {
  const overlay = document.getElementById('fin-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

function finSwitchTab(tab) {
  document.querySelectorAll('.fin-modal-tab').forEach(btn => {
    btn.classList.toggle('fin-modal-tab-active', btn.dataset.fintab === tab);
  });
  document.getElementById('fin-form-transaccion').style.display = tab === 'transaccion' ? 'flex' : 'none';
  document.getElementById('fin-form-cuenta').style.display      = tab === 'cuenta'      ? 'flex' : 'none';
  document.getElementById('fin-form-deuda').style.display       = tab === 'deuda'       ? 'flex' : 'none';
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
  document.getElementById('fin-form-cuenta')?.addEventListener('submit', finSubmitCuenta);
  document.getElementById('fin-form-deuda')?.addEventListener('submit', finSubmitDeuda);
});
