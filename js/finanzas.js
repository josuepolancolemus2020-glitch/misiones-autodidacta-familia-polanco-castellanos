'use strict';

const FIN_CUENTAS_TABLE       = 'cuentas';
const FIN_TRANSACCIONES_TABLE = 'transacciones';
const FIN_DEUDAS_TABLE        = 'deudas';

// Categoría reservada para movimientos que solo mueven dinero entre cuentas
// de la familia (ej. darle efectivo a un familiar). No es un gasto ni un
// ingreso real, así que se excluye de "Gastos del Mes" y de las estadísticas.
const FIN_TRANSFER_CATEGORY = 'Envío Familiar';

// Categorías con emoji. El value se guarda tal cual en la base de datos
// (coincide con las categorías ya registradas para no romper el historial).
const FIN_CATS_EGRESO = [
  { v: 'Alimentación',    e: '🍚', label: 'Alimentación' },
  { v: 'Transporte',      e: '🚌', label: 'Transporte' },
  { v: 'Vivienda',        e: '🏠', label: 'Vivienda' },
  { v: 'Servicios',       e: '💡', label: 'Servicios (agua, luz, internet)' },
  { v: 'Salud',           e: '🩺', label: 'Salud' },
  { v: 'Educación',       e: '📚', label: 'Educación' },
  { v: 'Entretenimiento', e: '🎮', label: 'Entretenimiento' },
  { v: 'Ropa y Calzado',  e: '👕', label: 'Ropa y Calzado' },
  { v: 'Ahorro',          e: '🐷', label: 'Ahorro' },
  { v: 'Deuda',           e: '💳', label: 'Pago de deuda' },
  { v: 'Otros',           e: '📦', label: 'Otros' },
];
const FIN_CATS_INGRESO = [
  { v: 'Salario',  e: '💼', label: 'Salario' },
  { v: 'Negocio',  e: '🛍️', label: 'Negocio / Ventas' },
  { v: 'Remesa',   e: '💸', label: 'Remesa' },
  { v: 'Regalo',   e: '🎁', label: 'Regalo' },
  { v: 'Otros',    e: '📦', label: 'Otros' },
];

let _finCuentasCache   = [];
let _finGastosMesCache = [];
let _finDeudasCache    = [];

// Filtro activo de la lista "Últimos Movimientos" ('' | ingreso | egreso | transfer)
let _finMovFilter = '';

// Estado del modal de detalle: qué tarjeta lo abrió y qué mes se está viendo.
let _finDetailKind = null; // 'saldo' | 'gastos' | 'deudas' | 'historial'
let _finGastosView = null; // { year, month(0-based) } — compartido por gastos e historial

// Estado de edición de una transacción (para reutilizar el formulario).
let _finEditingId       = null;
let _finEditingOriginal = null; // { monto, tipo, cuenta_id } previos

// Deuda a la que se le está registrando un abono.
let _finAbonoDeuda = null;

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

// Versión compacta para gráficas y etiquetas (sin decimales).
function _finMoneyShort(n) {
  const num = Number(n) || 0;
  return 'L. ' + Math.round(num).toLocaleString('es-HN');
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

function _finCatEmoji(cat) {
  if (cat === FIN_TRANSFER_CATEGORY) return '🔁';
  const found = FIN_CATS_EGRESO.find(c => c.v === cat) || FIN_CATS_INGRESO.find(c => c.v === cat);
  return found ? found.e : '📦';
}

// Rellena el select de categoría según el tipo. Si `selected` es una categoría
// vieja que ya no está en la lista, se agrega como opción extra para no perderla.
function _finFillCategoriaSelect(tipo, selected) {
  const select = document.getElementById('fin-t-categoria');
  if (!select) return;
  const cats = tipo === 'ingreso' ? FIN_CATS_INGRESO : FIN_CATS_EGRESO;
  select.innerHTML = '';
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.v;
    opt.textContent = `${c.e} ${c.label}`;
    select.appendChild(opt);
  });
  if (selected && !cats.find(c => c.v === selected)) {
    const opt = document.createElement('option');
    opt.value = selected;
    opt.textContent = `📦 ${selected}`;
    select.appendChild(opt);
  }
  if (selected) select.value = selected;
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

  const now = new Date();
  const prevRange = _finMonthRange(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
                                   now.getMonth() === 0 ? 11 : now.getMonth() - 1);

  const [cuentasRes, gastosRes, gastosPrevRes, deudasRes] = await Promise.all([
    _sb.from(FIN_CUENTAS_TABLE).select('*').order('nombre'),
    _sb.from(FIN_TRANSACCIONES_TABLE).select('*').eq('tipo', 'egreso').neq('categoria', FIN_TRANSFER_CATEGORY).gte('fecha', _finStartOfMonth()).order('fecha', { ascending: false }),
    _sb.from(FIN_TRANSACCIONES_TABLE).select('monto').eq('tipo', 'egreso').neq('categoria', FIN_TRANSFER_CATEGORY).gte('fecha', prevRange.start).lt('fecha', prevRange.end),
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

    // Comparación con el mes anterior en la propia tarjeta.
    const deltaEl = document.getElementById('fin-gastos-delta');
    if (deltaEl) {
      const prevTotal = (gastosPrevRes.data || []).reduce((s, t) => s + Number(t.monto || 0), 0);
      if (!gastosPrevRes.error && prevTotal > 0) {
        const pct = ((totalGastos - prevTotal) / prevTotal) * 100;
        const arrow = pct >= 0 ? '▲' : '▼';
        deltaEl.textContent = `${arrow} ${Math.abs(pct).toFixed(0)}% vs mes pasado`;
      } else {
        deltaEl.textContent = '';
      }
    }
  }

  if (deudasRes.error) {
    console.error('[Finanzas] Error cargando deudas:', deudasRes.error);
  } else {
    _finDeudasCache = deudasRes.data || [];
    const totalDeuda = _finDeudasCache.reduce(
      (sum, d) => sum + Math.max(0, Number(d.monto_total || 0) - Number(d.monto_pagado || 0)), 0
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

// Trae TODOS los movimientos (ingresos, egresos y envíos) de un mes concreto.
async function _finFetchMovimientosMes(year, month) {
  const { start, end } = _finMonthRange(year, month);
  const { data, error } = await _sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('*')
    .gte('fecha', start)
    .lt('fecha', end)
    .order('fecha', { ascending: false })
    .order('id', { ascending: false });
  if (error) {
    console.error('[Finanzas] Error cargando historial:', error);
    return [];
  }
  return data || [];
}

async function finLoadMovimientos() {
  const container = document.getElementById('fin-movimientos-list');
  if (!container || !_sb) return;

  let query = _sb.from(FIN_TRANSACCIONES_TABLE).select('*');

  if (_finMovFilter === 'ingreso') {
    query = query.eq('tipo', 'ingreso').neq('categoria', FIN_TRANSFER_CATEGORY);
  } else if (_finMovFilter === 'egreso') {
    query = query.eq('tipo', 'egreso').neq('categoria', FIN_TRANSFER_CATEGORY);
  } else if (_finMovFilter === 'transfer') {
    query = query.eq('categoria', FIN_TRANSFER_CATEGORY);
  }

  const { data, error } = await query
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
  icon.textContent = _finCatEmoji(t.categoria);

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

  // Tocar un movimiento (que no sea envío familiar) lo abre para editar.
  if (!esTransferencia) {
    row.classList.add('fin-mov-tappable');
    row.addEventListener('click', () => finEditTransaccion(t));
  }
  return row;
}

function _finRenderCuentaOptions(cuentas) {
  ['fin-t-cuenta', 'fin-tr-origen', 'fin-tr-destino', 'fin-a-cuenta'].forEach(id => _finFillCuentaSelect(id, cuentas));
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

/* ── Deudas: fila con progreso, abonar y eliminar ── */

function _finDeudaDetailRow(d) {
  const total    = Number(d.monto_total || 0);
  const pagado   = Number(d.monto_pagado || 0);
  const pendiente = Math.max(0, total - pagado);
  const pct       = total > 0 ? Math.min(100, (pagado / total) * 100) : 0;
  const saldada   = pendiente <= 0;

  const row = document.createElement('div');
  row.className = 'fin-deuda-card';

  const top = document.createElement('div');
  top.className = 'fin-deuda-top';

  const titleEl = document.createElement('div');
  titleEl.className = 'fin-detail-row-title';
  titleEl.textContent = (saldada ? '✅ ' : '') + (d.descripcion || 'Deuda');

  const amountEl = document.createElement('div');
  amountEl.className = 'fin-detail-row-amount' + (saldada ? '' : ' fin-detail-debt');
  amountEl.textContent = saldada ? 'Saldada' : _finMoney(pendiente);

  top.append(titleEl, amountEl);

  const sub = document.createElement('div');
  sub.className = 'fin-detail-row-sub';
  let subText = `Pagado ${_finMoney(pagado)} de ${_finMoney(total)} (${pct.toFixed(0)}%)`;
  if (d.fecha_limite) subText += ` · Vence ${_finFormatDate(d.fecha_limite)}`;
  sub.textContent = subText;

  const track = document.createElement('div');
  track.className = 'fs-bar-track fin-deuda-track';
  const fill = document.createElement('div');
  fill.className = 'fs-bar-fill' + (saldada ? ' fin-deuda-fill-done' : '');
  fill.style.width = pct.toFixed(1) + '%';
  track.appendChild(fill);

  const actions = document.createElement('div');
  actions.className = 'fin-deuda-actions';

  if (!saldada) {
    const abonarBtn = document.createElement('button');
    abonarBtn.type = 'button';
    abonarBtn.className = 'fin-abono-btn';
    abonarBtn.innerHTML = '<i class="fa-solid fa-hand-holding-dollar"></i> Abonar';
    abonarBtn.addEventListener('click', () => finOpenAbono(d));
    actions.appendChild(abonarBtn);
  }

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'fin-detail-delete-btn';
  delBtn.setAttribute('aria-label', 'Eliminar deuda');
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.addEventListener('click', () => finDeleteDeuda(d));
  actions.appendChild(delBtn);

  row.append(top, sub, track, actions);
  return row;
}

async function finDeleteDeuda(d) {
  if (!_sb) return;
  const ok = confirm(`¿Eliminar la deuda "${d.descripcion || 'Deuda'}"? Los abonos ya registrados como gastos no se borran.`);
  if (!ok) return;

  const { error } = await _sb.from(FIN_DEUDAS_TABLE).delete().eq('id', d.id);
  if (error) {
    console.error('[Finanzas] Error eliminando deuda:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar la deuda');
    return;
  }
  if (typeof toast === 'function') toast('🗑️ Deuda eliminada');
  await initFinanzas();
  finOpenDetail('deudas');
}

/* ── Abono a deuda ── */

function finOpenAbono(d) {
  _finAbonoDeuda = d;
  const overlay = document.getElementById('fin-abono-overlay');
  if (!overlay) return;

  const pendiente = Math.max(0, Number(d.monto_total || 0) - Number(d.monto_pagado || 0));
  const info = document.getElementById('fin-abono-info');
  if (info) info.textContent = `"${d.descripcion || 'Deuda'}" — pendiente: ${_finMoney(pendiente)}. El abono se registrará también como gasto (Pago de deuda) en la cuenta que elijas.`;

  const monto = document.getElementById('fin-a-monto');
  if (monto) { monto.value = ''; monto.max = pendiente > 0 ? String(pendiente) : ''; }
  const fecha = document.getElementById('fin-a-fecha');
  if (fecha) fecha.value = _finToday();

  _finFillCuentaSelect('fin-a-cuenta', _finCuentasCache);
  overlay.style.display = 'flex';
}

function finCloseAbono() {
  const overlay = document.getElementById('fin-abono-overlay');
  if (overlay) overlay.style.display = 'none';
  _finAbonoDeuda = null;
}

async function finSubmitAbono(e) {
  e.preventDefault();
  if (!_sb || !_finAbonoDeuda) return;

  const d        = _finAbonoDeuda;
  const monto    = parseFloat(document.getElementById('fin-a-monto').value);
  const cuentaId = document.getElementById('fin-a-cuenta').value;
  const fecha    = document.getElementById('fin-a-fecha').value;
  if (!monto || monto <= 0 || !cuentaId) return;

  const btn = e.target.querySelector('.fin-submit-btn');
  if (btn) btn.disabled = true;

  const nuevoPagado = Number(d.monto_pagado || 0) + monto;
  const total       = Number(d.monto_total || 0);

  const { error: errDeuda } = await _sb
    .from(FIN_DEUDAS_TABLE)
    .update({ monto_pagado: nuevoPagado, estado: nuevoPagado >= total ? 'pagada' : 'pendiente' })
    .eq('id', d.id);

  if (errDeuda) {
    console.error('[Finanzas] Error registrando abono:', errDeuda);
    if (typeof toast === 'function') toast('No se pudo registrar el abono');
    if (btn) btn.disabled = false;
    return;
  }

  // El abono también es un gasto real: queda en el historial y descuenta saldo.
  const { error: errTrans } = await _sb.from(FIN_TRANSACCIONES_TABLE).insert({
    tipo: 'egreso',
    monto,
    categoria: 'Deuda',
    descripcion: `Abono: ${d.descripcion || 'Deuda'}`,
    fecha,
    usuario: _finCurrentUserName(),
    cuenta_id: cuentaId,
  });
  if (errTrans) {
    console.error('[Finanzas] Error guardando el gasto del abono:', errTrans);
  } else {
    await _finApplyBalanceDelta(cuentaId, -monto);
  }

  if (typeof toast === 'function') {
    toast(nuevoPagado >= total ? '🎉 ¡Deuda saldada por completo!' : '✅ Abono registrado');
  }
  if (btn) btn.disabled = false;
  finCloseAbono();
  await initFinanzas();
  finOpenDetail('deudas');
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
  } else if (kind === 'gastos' || kind === 'historial') {
    const now = new Date();
    _finGastosView = { year: now.getFullYear(), month: now.getMonth() };
    overlay.style.display = 'flex';
    await _finRenderMesDetail();
    return;
  } else if (kind === 'deudas') {
    title.textContent = 'Deudas Pendientes';
    if (!_finDeudasCache.length) {
      content.appendChild(_finDetailEmpty('Aún no has registrado ninguna deuda.'));
    } else {
      _finDeudasCache.forEach(d => content.appendChild(_finDeudaDetailRow(d)));
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
   DETALLE POR MES (gastos / historial completo)
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
  _finRenderMesDetail();
}

function _finMovimientoDetailRow(t) {
  const esTransferencia = t.categoria === FIN_TRANSFER_CATEGORY;
  const esIngreso = t.tipo === 'ingreso';

  const row = document.createElement('div');
  row.className = 'fin-detail-row';

  const main = document.createElement('div');
  main.className = 'fin-detail-row-main';
  const titleEl = document.createElement('div');
  titleEl.className = 'fin-detail-row-title';
  titleEl.textContent = `${_finCatEmoji(t.categoria)} ${t.descripcion || t.categoria || 'Movimiento'}`;
  const subEl = document.createElement('div');
  subEl.className = 'fin-detail-row-sub';
  subEl.textContent = `${t.usuario || 'Familia'} · ${t.categoria || ''} · ${_finFormatDate(t.fecha)}`;
  main.append(titleEl, subEl);

  const actions = document.createElement('div');
  actions.className = 'fin-detail-row-actions';

  const amountEl = document.createElement('div');
  amountEl.className = 'fin-detail-row-amount ' +
    (esTransferencia ? 'fin-detail-transfer' : (esIngreso ? 'fin-detail-in' : 'fin-detail-out'));
  amountEl.textContent = (esIngreso ? '+ ' : '- ') + _finMoney(t.monto);
  actions.appendChild(amountEl);

  if (!esTransferencia) {
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'fin-detail-edit-btn';
    editBtn.setAttribute('aria-label', 'Editar movimiento');
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.addEventListener('click', () => finEditTransaccion(t));
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'fin-detail-delete-btn';
    delBtn.setAttribute('aria-label', 'Eliminar movimiento');
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.addEventListener('click', () => finDeleteTransaccion(t));
    actions.appendChild(delBtn);
  }

  row.append(main, actions);
  return row;
}

async function _finRenderMesDetail() {
  const title   = document.getElementById('fin-detail-title');
  const content = document.getElementById('fin-detail-content');
  if (!content || !_finGastosView) return;

  const kind = _finDetailKind;
  const { year, month } = _finGastosView;
  if (title) {
    title.textContent = (kind === 'historial' ? 'Historial · ' : 'Gastos · ') + _finMonthLabel(year, month);
  }

  content.innerHTML = '';
  content.appendChild(_finGastosNav());

  const listWrap = document.createElement('div');
  listWrap.className = 'fin-detail-content';
  listWrap.innerHTML = '<div class="fin-empty">Cargando…</div>';
  content.appendChild(listWrap);

  const rows = kind === 'historial'
    ? await _finFetchMovimientosMes(year, month)
    : await _finFetchGastosMes(year, month);

  // Evita renderizar datos viejos si el usuario cambió de mes mientras cargaba.
  if (!_finGastosView || _finGastosView.year !== year || _finGastosView.month !== month || _finDetailKind !== kind) return;

  listWrap.innerHTML = '';
  if (!rows.length) {
    listWrap.appendChild(_finDetailEmpty(kind === 'historial'
      ? 'Sin movimientos registrados en este mes.'
      : 'Sin gastos registrados en este mes.'));
    return;
  }

  rows.forEach(t => listWrap.appendChild(_finMovimientoDetailRow(t)));

  // Totales del mes al pie.
  if (kind === 'historial') {
    const reales = rows.filter(t => t.categoria !== FIN_TRANSFER_CATEGORY);
    const ing = reales.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto || 0), 0);
    const gas = reales.filter(t => t.tipo === 'egreso').reduce((s, t) => s + Number(t.monto || 0), 0);
    content.appendChild(_finTotalRow('Ingresos del mes', '+ ' + _finMoney(ing), 'in'));
    content.appendChild(_finTotalRow('Gastos del mes', '- ' + _finMoney(gas), 'out'));
    content.appendChild(_finTotalRow('Balance', (ing - gas >= 0 ? '+ ' : '- ') + _finMoney(Math.abs(ing - gas)), ing - gas >= 0 ? 'in' : 'out'));
  } else {
    const total = rows.reduce((s, t) => s + Number(t.monto || 0), 0);
    content.appendChild(_finTotalRow('Total del mes', '- ' + _finMoney(total), 'out'));
  }
}

function _finTotalRow(labelText, valueText, tone) {
  const totalRow = document.createElement('div');
  totalRow.className = 'fin-month-total' + (tone ? ' fin-total-' + tone : '');
  const totalLabel = document.createElement('span');
  totalLabel.textContent = labelText;
  const totalValue = document.createElement('span');
  totalValue.textContent = valueText;
  totalRow.append(totalLabel, totalValue);
  return totalRow;
}

// Re-renderiza el detalle mensual si está abierto (tras editar/eliminar).
async function _finRefreshGastosDetailIfOpen() {
  const overlay = document.getElementById('fin-detail-modal-overlay');
  if (overlay && overlay.style.display !== 'none' && (_finDetailKind === 'gastos' || _finDetailKind === 'historial')) {
    await _finRenderMesDetail();
  }
}

async function finDeleteTransaccion(t) {
  if (!_sb) return;
  const nombre = t.descripcion || t.categoria || 'Movimiento';
  const ok = confirm(`¿Eliminar "${nombre}" de ${_finMoney(t.monto)}? Esta acción no se puede deshacer.`);
  if (!ok) return;

  const { error } = await _sb.from(FIN_TRANSACCIONES_TABLE).delete().eq('id', t.id);
  if (error) {
    console.error('[Finanzas] Error eliminando movimiento:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar el movimiento');
    return;
  }

  // Revierte el efecto que tuvo sobre el saldo de su cuenta.
  const effect = (t.tipo === 'ingreso' ? 1 : -1) * Number(t.monto || 0);
  await _finApplyBalanceDelta(t.cuenta_id, -effect);

  if (typeof toast === 'function') toast('🗑️ Movimiento eliminado');
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

  document.getElementById('fin-t-tipo').value = t.tipo || 'egreso';
  _finFillCategoriaSelect(t.tipo || 'egreso', t.categoria || 'Otros');
  document.getElementById('fin-t-monto').value       = t.monto;
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
  _finFillCategoriaSelect(document.getElementById('fin-t-tipo')?.value || 'egreso');
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
  const delta = tipo === 'ingreso' ? monto : -monto;
  await _finApplyBalanceDelta(cuentaId, delta);

  if (typeof toast === 'function') toast('✅ Transacción registrada');
  e.target.reset();
  document.getElementById('fin-t-fecha').value = _finToday();
  _finFillCategoriaSelect(document.getElementById('fin-t-tipo')?.value || 'egreso');
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
   ESTADÍSTICAS
   Todo se calcula a partir de las transacciones reales
   (los envíos familiares se excluyen siempre).
───────────────────────────────────────────── */

let _finStatsView = null; // { year, month(0-based) }

async function initFinStats() {
  if (!_sb) return;
  if (!_finStatsView) {
    const now = new Date();
    _finStatsView = { year: now.getFullYear(), month: now.getMonth() };
  }
  await _finRenderStats();
}

function _finChangeStatsMonth(delta) {
  let { year, month } = _finStatsView;
  month += delta;
  if (month < 0) { month = 11; year--; }
  else if (month > 11) { month = 0; year++; }
  _finStatsView = { year, month };
  _finRenderStats();
}

// Trae los movimientos reales de los últimos 6 meses terminando en el mes visto.
async function _finFetchStatsRange(year, month) {
  const startDate = new Date(year, month - 5, 1);
  const pad = x => String(x).padStart(2, '0');
  const start = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-01`;
  const { end } = _finMonthRange(year, month);

  const { data, error } = await _sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('tipo, monto, categoria, descripcion, fecha, usuario')
    .neq('categoria', FIN_TRANSFER_CATEGORY)
    .gte('fecha', start)
    .lt('fecha', end)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('[Finanzas] Error cargando estadísticas:', error);
    return null;
  }
  return data || [];
}

function _finMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function _finRowMonthKey(fecha) {
  return (fecha || '').slice(0, 7);
}

async function _finRenderStats() {
  const { year, month } = _finStatsView;

  const label = document.getElementById('fs-month-label');
  if (label) label.textContent = _finMonthLabel(year, month);
  const nextBtn = document.getElementById('fs-next-month');
  const now = new Date();
  const esMesActual = year === now.getFullYear() && month === now.getMonth();
  if (nextBtn) nextBtn.disabled = esMesActual;

  const rows = await _finFetchStatsRange(year, month);

  // Evita pintar datos viejos si el usuario cambió de mes mientras cargaba.
  if (!_finStatsView || _finStatsView.year !== year || _finStatsView.month !== month) return;
  if (rows === null) {
    const cat = document.getElementById('fs-cat-chart');
    if (cat) cat.innerHTML = '<div class="fin-empty">No se pudieron cargar las estadísticas.</div>';
    return;
  }

  const viewKey = _finMonthKey(year, month);
  const prevDate = new Date(year, month - 1, 1);
  const prevKey = _finMonthKey(prevDate.getFullYear(), prevDate.getMonth());

  // ── Agregados por mes (para KPIs y tendencia) ──
  const porMes = {}; // key → { ing, gas }
  rows.forEach(t => {
    const k = _finRowMonthKey(t.fecha);
    if (!porMes[k]) porMes[k] = { ing: 0, gas: 0 };
    if (t.tipo === 'ingreso') porMes[k].ing += Number(t.monto || 0);
    else porMes[k].gas += Number(t.monto || 0);
  });

  const mes  = porMes[viewKey] || { ing: 0, gas: 0 };
  const prev = porMes[prevKey] || { ing: 0, gas: 0 };
  const balance = mes.ing - mes.gas;

  // ── KPIs ──
  _finSetText('fs-kpi-ingresos', _finMoney(mes.ing));
  _finSetText('fs-kpi-gastos', _finMoney(mes.gas));
  const balEl = document.getElementById('fs-kpi-balance');
  if (balEl) {
    balEl.textContent = (balance >= 0 ? '+ ' : '- ') + _finMoney(Math.abs(balance));
    balEl.classList.toggle('fs-in', balance >= 0);
    balEl.classList.toggle('fs-out', balance < 0);
  }

  _finSetDelta('fs-delta-ingresos', mes.ing, prev.ing, true);
  _finSetDelta('fs-delta-gastos', mes.gas, prev.gas, false);

  const tasaEl = document.getElementById('fs-kpi-tasa');
  if (tasaEl) {
    if (mes.ing > 0) {
      const tasa = (balance / mes.ing) * 100;
      tasaEl.textContent = tasa >= 0
        ? `Ahorraron el ${tasa.toFixed(0)}% de sus ingresos 💪`
        : `Gastaron ${Math.abs(tasa).toFixed(0)}% más de lo que ingresó ⚠️`;
    } else {
      tasaEl.textContent = mes.gas > 0 ? 'Sin ingresos registrados este mes' : '';
    }
  }

  // ── Ritmo de gasto (solo para el mes en curso) ──
  const ritmoCard = document.getElementById('fs-ritmo-card');
  const ritmoContent = document.getElementById('fs-ritmo-content');
  if (ritmoCard && ritmoContent) {
    if (esMesActual && mes.gas > 0) {
      const diaHoy = now.getDate();
      const diasMes = new Date(year, month + 1, 0).getDate();
      const promedio = mes.gas / diaHoy;
      const proyeccion = promedio * diasMes;
      ritmoCard.style.display = 'block';
      ritmoContent.innerHTML = '';
      ritmoContent.appendChild(_finRitmoRow('Gasto promedio por día', _finMoney(promedio)));
      ritmoContent.appendChild(_finRitmoRow(`Proyección al cierre (${diasMes} días)`, _finMoney(proyeccion)));
      if (prev.gas > 0) {
        const dif = proyeccion - prev.gas;
        ritmoContent.appendChild(_finRitmoRow('Comparado con el mes pasado',
          (dif >= 0 ? '+ ' : '- ') + _finMoney(Math.abs(dif)), dif > 0 ? 'fs-out' : 'fs-in'));
      }
    } else {
      ritmoCard.style.display = 'none';
    }
  }

  // ── Filas del mes visto ──
  const mesRows = rows.filter(t => _finRowMonthKey(t.fecha) === viewKey);
  const gastosMes = mesRows.filter(t => t.tipo === 'egreso');

  // ── Gastos por categoría ──
  _finRenderBarChart('fs-cat-chart', _finGroupSum(gastosMes, t => t.categoria || 'Otros'), {
    empty: 'Sin gastos en este mes.',
    total: mes.gas,
    nameFn: cat => `${_finCatEmoji(cat)} ${cat}`,
  });

  // ── Gastos por miembro ──
  _finRenderBarChart('fs-member-chart', _finGroupSum(gastosMes, t => t.usuario || 'Familia'), {
    empty: 'Sin gastos en este mes.',
    total: mes.gas,
    nameFn: u => u,
  });

  // ── Tendencia de 6 meses ──
  _finRenderTrend(porMes, year, month);

  // ── Top 5 gastos del mes ──
  const topWrap = document.getElementById('fs-top-list');
  if (topWrap) {
    topWrap.innerHTML = '';
    const top = [...gastosMes].sort((a, b) => Number(b.monto) - Number(a.monto)).slice(0, 5);
    if (!top.length) {
      topWrap.appendChild(_finDetailEmpty('Sin gastos en este mes.'));
    } else {
      top.forEach(t => topWrap.appendChild(_finDetailRow(
        `${_finCatEmoji(t.categoria)} ${t.descripcion || t.categoria || 'Gasto'}`,
        `${t.usuario || 'Familia'} · ${_finFormatDate(t.fecha)}`,
        '- ' + _finMoney(t.monto),
        'fin-detail-out'
      )));
    }
  }
}

function _finSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Delta vs mes anterior. goodWhenUp: subir ingresos es bueno; subir gastos, malo.
function _finSetDelta(id, actual, anterior, goodWhenUp) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!anterior || anterior <= 0) { el.textContent = ''; return; }
  const pct = ((actual - anterior) / anterior) * 100;
  const up = pct >= 0;
  el.textContent = `${up ? '▲' : '▼'} ${Math.abs(pct).toFixed(0)}% vs mes anterior`;
  const good = up === goodWhenUp;
  el.classList.toggle('fs-delta-good', good);
  el.classList.toggle('fs-delta-bad', !good);
}

function _finRitmoRow(labelText, valueText, valueClass) {
  const row = document.createElement('div');
  row.className = 'fs-ritmo-row';
  const lbl = document.createElement('span');
  lbl.className = 'fs-ritmo-label';
  lbl.textContent = labelText;
  const val = document.createElement('span');
  val.className = 'fs-ritmo-value' + (valueClass ? ' ' + valueClass : '');
  val.textContent = valueText;
  row.append(lbl, val);
  return row;
}

// Agrupa y suma montos por clave; devuelve [{ name, total, count }] ordenado.
function _finGroupSum(rows, keyFn) {
  const map = {};
  rows.forEach(t => {
    const k = keyFn(t);
    if (!map[k]) map[k] = { name: k, total: 0, count: 0 };
    map[k].total += Number(t.monto || 0);
    map[k].count++;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

// Gráfica de barras horizontales (un solo tono: magnitud de una misma medida).
function _finRenderBarChart(containerId, groups, opts) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = '';

  if (!groups.length) {
    wrap.appendChild(_finDetailEmpty(opts.empty));
    return;
  }

  const max = groups[0].total || 1;
  groups.forEach(g => {
    const row = document.createElement('div');
    row.className = 'fs-bar-row';

    const name = document.createElement('span');
    name.className = 'fs-bar-name';
    name.textContent = opts.nameFn(g.name);
    name.title = `${g.count} movimiento${g.count !== 1 ? 's' : ''}`;

    const track = document.createElement('div');
    track.className = 'fs-bar-track';
    const fill = document.createElement('div');
    fill.className = 'fs-bar-fill';
    fill.style.width = Math.max(2, (g.total / max) * 100).toFixed(1) + '%';
    track.appendChild(fill);

    const val = document.createElement('span');
    val.className = 'fs-bar-val';
    const pct = opts.total > 0 ? Math.round((g.total / opts.total) * 100) : 0;
    val.innerHTML = `${_finMoneyShort(g.total)} <span class="fs-bar-pct">(${pct}%)</span>`;

    row.append(name, track, val);
    wrap.appendChild(row);
  });
}

// Tendencia de 6 meses: barras agrupadas ingresos (verde) vs gastos (rojo).
function _finRenderTrend(porMes, year, month) {
  const wrap = document.getElementById('fs-trend-chart');
  const caption = document.getElementById('fs-trend-caption');
  if (!wrap) return;
  wrap.innerHTML = '';
  wrap.className = 'fs-trend';

  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    meses.push({
      key: _finMonthKey(d.getFullYear(), d.getMonth()),
      label: d.toLocaleDateString('es-HN', { month: 'short' }),
      full: _finMonthLabel(d.getFullYear(), d.getMonth()),
    });
  }

  const max = Math.max(1, ...meses.map(m => {
    const v = porMes[m.key] || { ing: 0, gas: 0 };
    return Math.max(v.ing, v.gas);
  }));

  const sinDatos = meses.every(m => !porMes[m.key]);
  if (sinDatos) {
    wrap.className = '';
    wrap.appendChild(_finDetailEmpty('Aún no hay suficientes datos para la tendencia.'));
    if (caption) caption.textContent = '';
    return;
  }

  meses.forEach((m, idx) => {
    const v = porMes[m.key] || { ing: 0, gas: 0 };

    const col = document.createElement('button');
    col.type = 'button';
    col.className = 'fs-trend-col';
    col.setAttribute('aria-label', `${m.full}: ingresos ${_finMoneyShort(v.ing)}, gastos ${_finMoneyShort(v.gas)}`);

    const bars = document.createElement('div');
    bars.className = 'fs-trend-bars';

    const barIn = document.createElement('div');
    barIn.className = 'fs-trend-bar fs-trend-bar-in';
    barIn.style.height = Math.max(v.ing > 0 ? 3 : 1, (v.ing / max) * 100).toFixed(1) + '%';

    const barOut = document.createElement('div');
    barOut.className = 'fs-trend-bar fs-trend-bar-out';
    barOut.style.height = Math.max(v.gas > 0 ? 3 : 1, (v.gas / max) * 100).toFixed(1) + '%';

    bars.append(barIn, barOut);

    const lbl = document.createElement('span');
    lbl.className = 'fs-trend-month';
    lbl.textContent = m.label.replace('.', '');

    col.append(bars, lbl);
    col.addEventListener('click', () => {
      wrap.querySelectorAll('.fs-trend-col').forEach(c => c.classList.remove('fs-trend-active'));
      col.classList.add('fs-trend-active');
      if (caption) {
        const bal = v.ing - v.gas;
        caption.textContent = `${m.full}: +${_finMoneyShort(v.ing)} ingresos · −${_finMoneyShort(v.gas)} gastos · balance ${bal >= 0 ? '+' : '−'}${_finMoneyShort(Math.abs(bal))}`;
      }
    });

    wrap.appendChild(col);

    // El mes visto arranca seleccionado para que la leyenda nunca esté vacía.
    if (idx === meses.length - 1) col.click();
  });
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

  // Las categorías del formulario dependen del tipo (ingreso/egreso).
  _finFillCategoriaSelect('egreso');
  document.getElementById('fin-t-tipo')?.addEventListener('change', e => {
    _finFillCategoriaSelect(e.target.value);
  });

  // Filtros de la lista de movimientos.
  document.getElementById('fin-mov-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('[data-movfilter]');
    if (!chip) return;
    _finMovFilter = chip.dataset.movfilter;
    document.querySelectorAll('#fin-mov-chips .fam-chip').forEach(c =>
      c.classList.toggle('fam-chip-active', c === chip));
    finLoadMovimientos();
  });

  // Historial completo con navegación por mes.
  document.getElementById('fin-see-all')?.addEventListener('click', () => finOpenDetail('historial'));

  // Detalle de las tarjetas resumen (Saldo / Gastos del Mes / Deudas)
  document.querySelector('.fin-summary-grid')?.addEventListener('click', e => {
    const card = e.target.closest('[data-findetail]');
    if (card) finOpenDetail(card.dataset.findetail);
  });
  document.getElementById('fin-detail-close')?.addEventListener('click', finCloseDetail);
  document.getElementById('fin-detail-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'fin-detail-modal-overlay') finCloseDetail();
  });

  // Abono a deuda.
  document.getElementById('fin-form-abono')?.addEventListener('submit', finSubmitAbono);
  document.getElementById('fin-abono-close')?.addEventListener('click', finCloseAbono);
  document.getElementById('fin-abono-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'fin-abono-overlay') finCloseAbono();
  });

  // Estadísticas.
  document.getElementById('fin-goto-stats')?.addEventListener('click', () => switchView('view-fin-stats'));
  document.getElementById('fin-stats-back-btn')?.addEventListener('click', () => switchView('view-finanzas'));
  document.getElementById('fs-prev-month')?.addEventListener('click', () => _finChangeStatsMonth(-1));
  document.getElementById('fs-next-month')?.addEventListener('click', () => _finChangeStatsMonth(1));
});
