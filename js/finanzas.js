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

function finOpenDetail(kind) {
  const overlay = document.getElementById('fin-detail-modal-overlay');
  const title   = document.getElementById('fin-detail-title');
  const content = document.getElementById('fin-detail-content');
  if (!overlay || !title || !content) return;

  content.innerHTML = '';

  if (kind === 'saldo') {
    title.textContent = 'Saldo por Cuenta';
    if (!_finCuentasCache.length) {
      content.appendChild(_finDetailEmpty('Aún no has registrado ninguna cuenta.'));
    } else {
      _finCuentasCache.forEach(c => {
        content.appendChild(_finDetailRow(c.nombre, null, _finMoney(c.saldo_actual)));
      });
    }
  } else if (kind === 'gastos') {
    title.textContent = 'Gastos del Mes';
    if (!_finGastosMesCache.length) {
      content.appendChild(_finDetailEmpty('Sin gastos registrados este mes.'));
    } else {
      _finGastosMesCache.forEach(t => {
        const sub = `${t.usuario || 'Familia'} · ${t.categoria || ''} · ${_finFormatDate(t.fecha)}`;
        content.appendChild(_finDetailRow(t.descripcion || t.categoria || 'Gasto', sub, '- ' + _finMoney(t.monto), 'fin-detail-out'));
      });
    }
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
}

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */

function finOpenModal(tab) {
  const overlay = document.getElementById('fin-modal-overlay');
  if (!overlay) return;
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

  const { error: errInsert } = await _sb.from(FIN_TRANSACCIONES_TABLE).insert({
    tipo, monto, categoria, descripcion, fecha,
    usuario: _finCurrentUserName(),
    cuenta_id: cuentaId,
  });

  if (errInsert) {
    console.error('[Finanzas] Error guardando gasto externo:', errInsert);
    if (typeof toast === 'function') toast('No se pudo guardar el gasto externo');
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

  if (typeof toast === 'function') toast('✅ Gasto Externo registrado');
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
