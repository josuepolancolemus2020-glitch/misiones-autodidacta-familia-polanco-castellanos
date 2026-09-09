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

// Categorías propias del presupuesto de la escuela.
const FIN_CATS_EGRESO_ESCUELA = [
  { v: 'Material Didáctico',   e: '📖', label: 'Material Didáctico' },
  { v: 'Papelería',            e: '📎', label: 'Papelería' },
  { v: 'Mantenimiento',        e: '🔧', label: 'Mantenimiento' },
  { v: 'Aseo y Limpieza',      e: '🧹', label: 'Aseo y Limpieza' },
  { v: 'Actividades Escolares', e: '🎉', label: 'Actividades Escolares' },
  { v: 'Alimentación',         e: '🍚', label: 'Alimentación / Merienda' },
  { v: 'Transporte',           e: '🚌', label: 'Transporte' },
  { v: 'Mobiliario',           e: '🪑', label: 'Mobiliario y Equipo' },
  { v: 'Deuda',                e: '💳', label: 'Pago de deuda' },
  { v: 'Otros',                e: '📦', label: 'Otros' },
];
const FIN_CATS_INGRESO_ESCUELA = [
  { v: 'Fondos Asignados',   e: '🏛️', label: 'Fondos Asignados' },
  { v: 'Aportes de Padres',  e: '👪', label: 'Aportes de Padres' },
  { v: 'Ventas y Rifas',     e: '🎟️', label: 'Ventas y Rifas' },
  { v: 'Donaciones',         e: '🤝', label: 'Donaciones' },
  { v: 'Otros',              e: '📦', label: 'Otros' },
];

// Contexto del presupuesto activo: 'familia' | 'escuela'. Cada contexto tiene
// sus propias cuentas, movimientos, deudas y estadísticas; nunca se mezclan.
let _finContexto = 'familia';

// ¿La base de datos ya tiene la columna `contexto`? (null = aún no verificado)
// Si no existe, el modo Familia sigue funcionando igual que siempre y el modo
// Escuela pide ejecutar el script supabase/sql/finanzas_contexto.sql.
let _finCtxSupported = null;

async function _finCheckContexto() {
  if (_finCtxSupported !== null || !_sb) return _finCtxSupported;
  const { error } = await _sb.from(FIN_CUENTAS_TABLE).select('contexto').limit(1);
  _finCtxSupported = !error;
  return _finCtxSupported;
}

// Aplica el filtro de contexto a una consulta (si la columna ya existe).
function _finCtx(q) {
  return _finCtxSupported ? q.eq('contexto', _finContexto) : q;
}

// Datos de contexto para agregar a un insert (si la columna ya existe).
function _finCtxData() {
  return _finCtxSupported ? { contexto: _finContexto } : {};
}

let _finCuentasCache   = [];
let _finGastosMesCache = [];
let _finDeudasCache    = [];

// Historial reciente de cada contexto, para el Apunte rápido: de aquí salen
// el orden de las categorías (las más usadas primero), las descripciones
// que se autocompletan y la categoría «como la última vez». Son cuatro
// columnas de las últimas filas: no pesa, y se trae al ENTRAR a Finanzas
// para que la hoja abra sin esperar a nada, con el teclado ya puesto.
const FIN_HIST_LIMITE = 300;
let _finHistCache = { familia: [], escuela: [] };

// La última carga del panel, para que la hoja se ponga al día si se abrió
// antes de que llegaran las cuentas (desde el Acceso Rápido pasa siempre).
let _finInitPromesa = null;

// Cuántas filas se traen para la lista del panel. Van agrupadas por día,
// así que el último día del corte puede venir a medias: si el corte se
// llenó, ese día se descarta, para que ningún subtotal mienta.
const FIN_LISTA_LIMITE = 40;

// Filtro activo de la lista "Últimos Movimientos" ('' | ingreso | egreso | transfer)
let _finMovFilter = '';

// Estado del modal de detalle: qué tarjeta lo abrió y qué mes se está viendo.
let _finDetailKind = null; // 'saldo' | 'gastos' | 'deudas' | 'historial'
let _finGastosView = null; // { year, month(0-based) }: compartido por gastos e historial

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
  const found = FIN_CATS_EGRESO.find(c => c.v === cat)
    || FIN_CATS_INGRESO.find(c => c.v === cat)
    || FIN_CATS_EGRESO_ESCUELA.find(c => c.v === cat)
    || FIN_CATS_INGRESO_ESCUELA.find(c => c.v === cat);
  return found ? found.e : '📦';
}

// Lista de categorías según tipo y contexto activo.
function _finCats(tipo) {
  if (_finContexto === 'escuela') {
    return tipo === 'ingreso' ? FIN_CATS_INGRESO_ESCUELA : FIN_CATS_EGRESO_ESCUELA;
  }
  return tipo === 'ingreso' ? FIN_CATS_INGRESO : FIN_CATS_EGRESO;
}

// Fecha ISO de hoy más `dias` (negativo hacia atrás), en hora local.
function _finFechaOffset(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const pad = x => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Nombre de un día para las cabeceras: «Hoy», «Ayer» o «lunes, 7 sep».
function _finNombreDia(iso) {
  if (iso === _finToday()) return 'Hoy';
  if (iso === _finFechaOffset(-1)) return 'Ayer';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso || '';
  return d.toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
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

  await _finCheckContexto();
  _finUpdateContextoUI();

  const now = new Date();
  const prevRange = _finMonthRange(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
                                   now.getMonth() === 0 ? 11 : now.getMonth() - 1);

  const contexto = _finContexto;
  const carga = Promise.all([
    _finCtx(_sb.from(FIN_CUENTAS_TABLE).select('*')).order('nombre'),
    _finCtx(_sb.from(FIN_TRANSACCIONES_TABLE).select('*')).eq('tipo', 'egreso').neq('categoria', FIN_TRANSFER_CATEGORY).gte('fecha', _finStartOfMonth()).order('fecha', { ascending: false }),
    _finCtx(_sb.from(FIN_TRANSACCIONES_TABLE).select('monto')).eq('tipo', 'egreso').neq('categoria', FIN_TRANSFER_CATEGORY).gte('fecha', prevRange.start).lt('fecha', prevRange.end),
    _finCtx(_sb.from(FIN_DEUDAS_TABLE).select('*')).order('fecha_limite', { ascending: true, nullsFirst: false }),
    // El historial del Apunte rápido (ver FIN_HIST_LIMITE).
    _finCtx(_sb.from(FIN_TRANSACCIONES_TABLE).select('tipo, categoria, descripcion, cuenta_id'))
      .neq('categoria', FIN_TRANSFER_CATEGORY)
      .order('id', { ascending: false })
      .limit(FIN_HIST_LIMITE),
  ]);
  _finInitPromesa = carga;
  const [cuentasRes, gastosRes, gastosPrevRes, deudasRes, histRes] = await carga;

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
    _finPintarGastosHoy();

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

  if (histRes.error) {
    console.error('[Finanzas] Error cargando el historial del apunte:', histRes.error);
  } else {
    _finHistCache[contexto] = histRes.data || [];
  }

  await finLoadMovimientos();
}

// Lo de HOY en la propia tarjeta de gastos del mes: es el número que se
// mira al apuntar, y el mes entero no dice si hoy se fue la mano.
function _finPintarGastosHoy() {
  const el = document.getElementById('fin-gastos-hoy');
  if (!el) return;
  const hoy = _finToday();
  const deHoy = _finGastosMesCache.filter(t => t.fecha === hoy);
  const total = deHoy.reduce((s, t) => s + Number(t.monto || 0), 0);
  el.textContent = deHoy.length
    ? `Hoy ${_finMoney(total)} · ${deHoy.length} ${deHoy.length === 1 ? 'gasto' : 'gastos'}`
    : 'Hoy sin gastos apuntados';
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
  const { data, error } = await _finCtx(_sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('*'))
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
  const { data, error } = await _finCtx(_sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('*'))
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

  let query = _finCtx(_sb.from(FIN_TRANSACCIONES_TABLE).select('*'));

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
    .limit(FIN_LISTA_LIMITE);

  if (error) {
    console.error('[Finanzas] Error cargando movimientos:', error);
    container.innerHTML = '<div class="fin-empty">No se pudieron cargar los movimientos.</div>';
    return;
  }

  if (!data || !data.length) {
    container.innerHTML = '<div class="fin-empty">Aún no hay movimientos registrados. Toca el «+» para apuntar el primero.</div>';
    return;
  }

  // Si el corte se llenó, el día más viejo puede haber quedado a medias y su
  // subtotal mentiría: se descarta, salvo que sea el único que hay.
  let filas = data;
  if (filas.length === FIN_LISTA_LIMITE) {
    const ultimoDia = filas[filas.length - 1].fecha;
    const sinUltimo = filas.filter(t => t.fecha !== ultimoDia);
    if (sinUltimo.length) filas = sinUltimo;
  }

  container.innerHTML = '';
  let dia = null;
  filas.forEach(t => {
    if (t.fecha !== dia) {
      dia = t.fecha;
      container.appendChild(_finCabeceraDia(dia, filas.filter(x => x.fecha === dia)));
    }
    container.appendChild(_finRenderMovimiento(t));
  });
}

// Cabecera de un día en la lista: su nombre y lo que sumó, gastos e
// ingresos por separado. Los envíos entre cuentas no suman en ningún
// subtotal: no son dinero que entre ni salga de la casa.
function _finCabeceraDia(fecha, filas) {
  const cab = document.createElement('div');
  cab.className = 'fin-dia-cab';

  const nombre = document.createElement('span');
  nombre.className = 'fin-dia-nombre';
  nombre.textContent = _finNombreDia(fecha);

  const total = document.createElement('span');
  total.className = 'fin-dia-total';
  const reales = filas.filter(t => t.categoria !== FIN_TRANSFER_CATEGORY);
  const gas = reales.filter(t => t.tipo === 'egreso').reduce((s, t) => s + Number(t.monto || 0), 0);
  const ing = reales.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto || 0), 0);
  if (gas > 0) {
    const s = document.createElement('span');
    s.className = 'fin-mov-out';
    s.textContent = '− ' + _finMoney(gas);
    total.appendChild(s);
  }
  if (ing > 0) {
    const s = document.createElement('span');
    s.className = 'fin-mov-in';
    s.textContent = '+ ' + _finMoney(ing);
    total.appendChild(s);
  }
  if (!gas && !ing) total.textContent = 'solo envíos entre cuentas';

  cab.append(nombre, total);
  return cab;
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
  meta.textContent = `${t.usuario || 'Familia'} · ${t.categoria || ''}`;

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
  ['fin-tr-origen', 'fin-tr-destino', 'fin-a-cuenta'].forEach(id => _finFillCuentaSelect(id, cuentas));
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
  if (info) info.textContent = `"${d.descripcion || 'Deuda'}" · pendiente: ${_finMoney(pendiente)}. El abono se registrará también como gasto (Pago de deuda) en la cuenta que elijas.`;

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
    ..._finCtxData(),
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

// Editar un movimiento: es la MISMA hoja del Apunte rápido, con todo
// puesto. Un solo formulario para lo mismo: dos se arreglan en uno y se
// quedan rotos en el otro.
function finEditTransaccion(t) {
  finAbrirApunte({ editar: t });
}

/* ─────────────────────────────────────────────
   MODAL · lo que no es diario: envío familiar, cuenta y deuda.
   Los gastos e ingresos van por el Apunte rápido, más abajo.
───────────────────────────────────────────── */

function finOpenModal(tab) {
  const overlay = document.getElementById('fin-modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  const fecha = document.getElementById('fin-tr-fecha');
  if (fecha && !fecha.value) fecha.value = _finToday();
  finSwitchTab(tab || 'transferencia');
}

function finCloseModal() {
  const overlay = document.getElementById('fin-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

function finSwitchTab(tab) {
  document.querySelectorAll('.fin-modal-tab').forEach(btn => {
    btn.classList.toggle('fin-modal-tab-active', btn.dataset.fintab === tab);
  });
  const pon = (id, visible) => {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? 'flex' : 'none';
  };
  pon('fin-form-transferencia', tab === 'transferencia');
  pon('fin-form-cuenta',        tab === 'cuenta');
  pon('fin-form-deuda',         tab === 'deuda');
}

/* ─────────────────────────────────────────────
   ENVÍO DE FORMULARIOS
───────────────────────────────────────────── */

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
    { tipo: 'egreso',  monto, categoria: FIN_TRANSFER_CATEGORY, descripcion, fecha, usuario, cuenta_id: origenId, ..._finCtxData() },
    { tipo: 'ingreso', monto, categoria: FIN_TRANSFER_CATEGORY, descripcion, fecha, usuario, cuenta_id: destinoId, ..._finCtxData() },
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

  const { error } = await _sb.from(FIN_CUENTAS_TABLE).insert({ nombre, saldo_actual: saldo, ..._finCtxData() });

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
    ..._finCtxData(),
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
   CONTEXTO: FAMILIA ⇄ ESCUELA
───────────────────────────────────────────── */

// Acceso directo al presupuesto familiar (desde el Acceso Rápido del inicio).
async function finGoFamilia() {
  await _finCheckContexto();
  _finContexto = 'familia';
  switchView('view-finanzas');
}

// «Apuntar gasto» del Acceso Rápido: Finanzas de la familia con la hoja ya
// abierta. Va SIN await delante: el teclado de una tableta solo sale si el
// foco se pone dentro del mismo toque, y un await lo rompe.
function finGoApunte() {
  _finContexto = 'familia';
  switchView('view-finanzas');
  finAbrirApunte();
}

// Acceso directo al presupuesto de la escuela (desde el Acceso Rápido del inicio).
async function finGoEscuela() {
  const ok = await _finCheckContexto();
  if (ok) _finContexto = 'escuela';
  switchView('view-finanzas');
  if (!ok && typeof toast === 'function') {
    toast('Falta habilitar la base de datos: ejecuta supabase/sql/finanzas_contexto.sql');
  }
}

async function finToggleContexto() {
  const ok = await _finCheckContexto();
  if (!ok) {
    if (typeof toast === 'function') {
      toast('Falta habilitar la base de datos: ejecuta supabase/sql/finanzas_contexto.sql en Supabase');
    }
    return;
  }
  _finContexto = _finContexto === 'familia' ? 'escuela' : 'familia';

  // Limpia el filtro de movimientos para no confundir al cambiar de mundo.
  _finMovFilter = '';
  document.querySelectorAll('#fin-mov-chips .fam-chip').forEach(c =>
    c.classList.toggle('fam-chip-active', c.dataset.movfilter === ''));

  _finUpdateContextoUI();
  if (typeof toast === 'function') {
    toast(_finContexto === 'escuela' ? '🏫 Finanzas de la Escuela' : '🏠 Finanzas de la Familia');
  }
  await initFinanzas();
}

function _finUpdateContextoUI() {
  const esEscuela = _finContexto === 'escuela';

  const title = document.getElementById('fin-view-title');
  if (title) title.textContent = esEscuela ? 'Finanzas · Escuela' : 'Finanzas';

  const statsTitle = document.getElementById('fs-view-title');
  if (statsTitle) statsTitle.textContent = esEscuela ? 'Estadísticas · Escuela' : 'Estadísticas';

  const saldoLabel = document.getElementById('fin-saldo-label');
  if (saldoLabel) saldoLabel.textContent = esEscuela ? 'Saldo Escolar Disponible' : 'Saldo Familiar Disponible';

  const label = document.getElementById('fin-ctx-label');
  if (label) label.textContent = esEscuela ? 'Volver a Finanzas de la Familia' : 'Finanzas Escuela Josué Polanco';

  const icon = document.getElementById('fin-ctx-icon');
  if (icon) icon.className = 'fa-solid ' + (esEscuela ? 'fa-house' : 'fa-school');

  const btn = document.getElementById('fin-ctx-btn');
  if (btn) btn.classList.toggle('fin-ctx-btn-volver', esEscuela);
}

/* ─────────────────────────────────────────────
   APUNTE RÁPIDO
   La hoja con la que se anotan los gastos e ingresos del día. Las reglas
   están en CLAUDE.md; en corto: se pide solo lo que no se puede adivinar
   (el monto y la categoría), lo demás viene puesto —la cuenta de la última
   vez, el día de hoy—, y guardar deja la hoja abierta para el siguiente.
   Editar un movimiento es esta misma hoja con todo puesto.
───────────────────────────────────────────── */

const FIN_PREF_KEY = 'faro.fin.apunte.';

/* ⚠️ «Dejarlo siempre abierto» es de ESTE APARATO Y GLOBAL, no de cada
   presupuesto. Quien lo enciende lo enciende porque apunta a diario desde su
   teléfono, y esa costumbre no cambia al pasar de Familia a Escuela: una
   llave por contexto obligaría a encenderlo dos veces y la segunda no se
   encuentra nunca. Y va en el aparato, no en la nube, porque es una manía de
   este teléfono: encenderlo aquí no puede abrirle la hoja en la cara a otro
   de la casa que solo entra a mirar el saldo. */
const FIN_FIJO_KEY = 'faro.fin.apunte.fijo';

function finApunteFijo() {
  try { return localStorage.getItem(FIN_FIJO_KEY) === '1'; }
  catch (_) { return false; }
}
function finPonerApunteFijo(v) {
  try { v ? localStorage.setItem(FIN_FIJO_KEY, '1') : localStorage.removeItem(FIN_FIJO_KEY); }
  catch (_) {}
}

// Estado de la hoja mientras está abierta.
const _finQ = {
  tipo: 'egreso',
  categoria: '',
  catManual: false,   // la tocó el usuario: ninguna sugerencia se la pisa
  catAuto: false,     // la puso la descripción: si deja de coincidir, se quita
  cuentaId: '',
  dia: 'hoy',         // 'hoy' | 'ayer' | 'otro'
  editando: null,     // la fila que se edita, o null si es un apunte nuevo
  ultimo: null,       // el último apunte guardado en esta sesión (para deshacer)
  abierta: false,
};

function _finQEl(id) { return document.getElementById(id); }

function _finQLeerPref() {
  try { return JSON.parse(localStorage.getItem(FIN_PREF_KEY + _finContexto) || '{}') || {}; }
  catch (_) { return {}; }
}
function _finQGuardarPref(p) {
  try { localStorage.setItem(FIN_PREF_KEY + _finContexto, JSON.stringify(Object.assign(_finQLeerPref(), p))); }
  catch (_) {}
}

// Lee el monto tal como sale de un teclado de tableta y devuelve
// { valor, partes } o null si no se entiende. Acepta «150», «12.50»,
// «12,50» (coma decimal), «1,234» (coma de miles: tres cifras justas
// detrás) y «20+35+12» (una suma, para la lista del mercado).
// Nunca adivina en silencio: lo entendido se enseña debajo del campo.
function _finQLeerMonto(texto) {
  const limpio = String(texto || '').replace(/\s+/g, '').replace(/^L\.?/i, '');
  if (!limpio || !/^[0-9.,+]+$/.test(limpio)) return null;
  if (/^\+|\+$|\+\+/.test(limpio)) return null;
  const partes = limpio.split('+').map(p => {
    let t = p;
    if (t.includes(',') && t.includes('.')) t = t.replace(/,/g, '');   // 1,234.50
    else if (/^\d{1,3}(,\d{3})+$/.test(t)) t = t.replace(/,/g, '');   // 1,234 · 12,000
    else t = t.replace(',', '.');                                     // 12,50
    if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
    return parseFloat(t);
  });
  if (partes.some(v => !isFinite(v))) return null;
  const valor = Math.round(partes.reduce((a, b) => a + b, 0) * 100) / 100;
  if (!(valor > 0)) return null;
  return { valor, partes };
}

function _finQVerbo() {
  if (_finQ.editando) return 'Guardar cambios';
  return _finQ.tipo === 'ingreso' ? 'Guardar ingreso' : 'Guardar gasto';
}

// Debajo del monto se dice qué se entendió, y el botón lleva la cifra.
// Con un número liso el botón basta; el eco sale cuando hay coma, suma o
// algo que no se entiende, que es cuando hace falta.
function _finQEco() {
  const eco = _finQEl('fin-q-eco');
  const btn = _finQEl('fin-q-guardar');
  const inp = _finQEl('fin-q-monto');
  if (!eco || !btn || !inp) return;
  const texto = inp.value.trim();
  const m = _finQLeerMonto(texto);
  const verbo = _finQVerbo();
  eco.classList.toggle('finq-eco-mal', !!texto && !m);
  if (!texto) {
    eco.textContent = '';
    btn.textContent = verbo;
    return;
  }
  if (!m) {
    eco.textContent = 'No se entiende el monto: solo números, coma o punto, y «+» para sumar.';
    btn.textContent = verbo;
    return;
  }
  btn.textContent = `${verbo} · ${_finMoney(m.valor)}`;
  if (m.partes.length > 1) {
    eco.textContent = `Se entiende ${_finMoney(m.valor)} = ${m.partes.map(v => _finMoney(v).replace('L. ', '')).join(' + ')}`;
  } else if (/[,.]/.test(texto)) {
    eco.textContent = `Se entiende ${_finMoney(m.valor)}`;
  } else {
    eco.textContent = '';
  }
}

function _finQAviso(texto) {
  const el = _finQEl('fin-q-aviso');
  if (!el) return;
  el.textContent = texto || '';
  el.hidden = !texto;
}

function _finQNormaliza(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim();
}

// Las categorías del tipo activo, las más usadas primero. El orden sale del
// historial, no de una lista fija: lo que más se apunta queda en la primera
// fila, que es la que se ve con el teclado puesto.
function _finQCategoriasOrdenadas(tipo) {
  const lista = _finCats(tipo);
  const cuenta = {};
  (_finHistCache[_finContexto] || []).forEach(h => {
    if (h.tipo === tipo && h.categoria) cuenta[h.categoria] = (cuenta[h.categoria] || 0) + 1;
  });
  return lista
    .map((c, i) => ({ c, i, n: cuenta[c.v] || 0 }))
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .map(x => x.c);
}

function _finQPintarCategorias() {
  const wrap = _finQEl('fin-q-cats');
  if (!wrap) return;
  wrap.innerHTML = '';
  const cats = _finQCategoriasOrdenadas(_finQ.tipo).slice();
  // Al editar, una categoría vieja que ya no está en la lista se conserva.
  if (_finQ.categoria && !cats.find(c => c.v === _finQ.categoria)) {
    cats.unshift({ v: _finQ.categoria, e: '📦', label: _finQ.categoria });
  }
  cats.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    const activo = c.v === _finQ.categoria;
    b.className = 'finq-chip' + (activo ? ' finq-chip-activo' : '');
    b.dataset.cat = c.v;
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
    b.textContent = `${c.e} ${c.v}`;
    wrap.appendChild(b);
  });
}

function _finQElegirCategoria(v, manual) {
  _finQ.categoria = v || '';
  if (manual) { _finQ.catManual = true; _finQ.catAuto = false; }
  document.querySelectorAll('#fin-q-cats .finq-chip').forEach(b => {
    const activo = b.dataset.cat === _finQ.categoria;
    b.classList.toggle('finq-chip-activo', activo);
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
  });
  if (manual) {
    const hint = _finQEl('fin-q-cat-hint');
    if (hint) hint.textContent = '';
    _finQAviso('');
  }
}

// «Como la última vez»: si la descripción coincide con una de antes, su
// categoría (y su cuenta) se marcan solas y la pantalla lo dice. Si se
// sigue escribiendo y deja de coincidir, se desmarca: una categoría que se
// queda puesta por inercia es un gasto mal archivado sin ningún error.
function _finQSugerencia(desc) {
  const clave = _finQNormaliza(desc);
  if (!clave) return null;
  return (_finHistCache[_finContexto] || []).find(h =>
    h.tipo === _finQ.tipo && _finQNormaliza(h.descripcion) === clave) || null;
}

function _finQAlEscribirDesc() {
  if (_finQ.catManual || _finQ.editando) return;
  const hint = _finQEl('fin-q-cat-hint');
  const s = _finQSugerencia((_finQEl('fin-q-desc') || {}).value);
  const cats = _finCats(_finQ.tipo);
  if (s && s.categoria && cats.find(c => c.v === s.categoria)) {
    _finQElegirCategoria(s.categoria, false);
    _finQ.catAuto = true;
    if (hint) hint.textContent = '· como la última vez';
    if (s.cuenta_id && _finCuentasCache.find(c => String(c.id) === String(s.cuenta_id))) {
      _finQElegirCuenta(String(s.cuenta_id));
    }
  } else if (_finQ.catAuto) {
    _finQ.catAuto = false;
    _finQElegirCategoria('', false);
    if (hint) hint.textContent = '';
  }
}

// Las descripciones de antes, las más repetidas primero, para que el
// teclado las complete. Solo las del tipo activo.
function _finQPintarDatalist() {
  const dl = _finQEl('fin-q-desc-list');
  if (!dl) return;
  dl.innerHTML = '';
  const vistos = new Map();
  (_finHistCache[_finContexto] || []).forEach(h => {
    if (h.tipo !== _finQ.tipo) return;
    const d = String(h.descripcion || '').trim();
    if (!d) return;
    const k = _finQNormaliza(d);
    const e = vistos.get(k);
    if (e) e.n++; else vistos.set(k, { d, n: 1 });
  });
  [...vistos.values()].sort((a, b) => b.n - a.n).slice(0, 30).forEach(x => {
    const o = document.createElement('option');
    o.value = x.d;
    dl.appendChild(o);
  });
}

// Con una sola cuenta no se pregunta: se usa. Con varias, chips, con la de
// la última vez marcada (o la de la fila que se edita).
function _finQPintarCuentas() {
  const fila = _finQEl('fin-q-cuenta-fila');
  const wrap = _finQEl('fin-q-cuentas');
  if (!fila || !wrap) return;
  wrap.innerHTML = '';
  const cuentas = _finCuentasCache;

  if (!cuentas.length) {
    _finQ.cuentaId = '';
    fila.hidden = false;
    const aviso = document.createElement('div');
    aviso.className = 'finq-sin-cuenta';
    aviso.textContent = 'Primero hace falta una cuenta (efectivo, banco…).';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'finq-chip';
    b.textContent = '＋ Crear cuenta';
    b.addEventListener('click', () => { finCerrarApunte(); finOpenModal('cuenta'); });
    wrap.append(aviso, b);
    return;
  }

  const ids = cuentas.map(c => String(c.id));
  if (!ids.includes(String(_finQ.cuentaId))) {
    const pref = String(_finQLeerPref().cuenta_id || '');
    _finQ.cuentaId = ids.includes(pref) ? pref : ids[0];
  }
  fila.hidden = cuentas.length === 1;
  cuentas.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    const activo = String(c.id) === String(_finQ.cuentaId);
    b.className = 'finq-chip' + (activo ? ' finq-chip-activo' : '');
    b.dataset.cuenta = String(c.id);
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
    b.textContent = c.nombre;
    b.title = _finMoney(c.saldo_actual);
    wrap.appendChild(b);
  });
}

function _finQElegirCuenta(id) {
  _finQ.cuentaId = String(id || '');
  document.querySelectorAll('#fin-q-cuentas .finq-chip[data-cuenta]').forEach(b => {
    const activo = b.dataset.cuenta === _finQ.cuentaId;
    b.classList.toggle('finq-chip-activo', activo);
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
  });
}

function _finQFechaElegida() {
  if (_finQ.dia === 'hoy') return _finToday();
  if (_finQ.dia === 'ayer') return _finFechaOffset(-1);
  const inp = _finQEl('fin-q-fecha');
  return (inp && inp.value) || _finToday();
}

function _finQElegirDia(dia) {
  _finQ.dia = dia;
  document.querySelectorAll('#fin-q-dias .finq-chip').forEach(b => {
    const activo = b.dataset.dia === dia;
    b.classList.toggle('finq-chip-activo', activo);
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
  });
  const inp = _finQEl('fin-q-fecha');
  if (inp) {
    inp.hidden = dia !== 'otro';
    if (dia === 'otro' && !inp.value) inp.value = _finToday();
  }
  _finQPintarDelDia();
}

function _finQPintarTipo() {
  document.querySelectorAll('#fin-q-tipo .finq-tipo-btn').forEach(b => {
    const activo = b.dataset.tipo === _finQ.tipo;
    b.classList.toggle('finq-tipo-activo', activo);
    b.setAttribute('aria-selected', activo ? 'true' : 'false');
  });
  const hoja = document.querySelector('#fin-q-overlay .finq-modal');
  if (hoja) hoja.dataset.tipo = _finQ.tipo;
}

function _finQElegirTipo(tipo) {
  if (_finQ.tipo === tipo) return;
  _finQ.tipo = tipo;
  _finQ.categoria = '';
  _finQ.catManual = false;
  _finQ.catAuto = false;
  const hint = _finQEl('fin-q-cat-hint');
  if (hint) hint.textContent = '';
  _finQPintarTipo();
  _finQPintarCategorias();
  _finQPintarDatalist();
  _finQEco();
  _finQAviso('');
}

// Lo apuntado del día elegido, en la misma hoja, con su suma. Se ve lo que
// ya está sin salir, y el último de esta sesión se puede deshacer.
async function _finQPintarDelDia() {
  const caja = _finQEl('fin-q-hoy');
  if (!caja || !_sb) return;
  if (_finQ.editando) { caja.hidden = true; return; }

  const fecha = _finQFechaElegida();
  await _finCheckContexto();
  const { data, error } = await _finCtx(_sb.from(FIN_TRANSACCIONES_TABLE).select('*'))
    .eq('fecha', fecha)
    .neq('categoria', FIN_TRANSFER_CATEGORY)
    .order('id', { ascending: false });

  // Si cambió el día mientras cargaba, esto ya no es lo que se ve.
  if (!_finQ.abierta || _finQ.editando || _finQFechaElegida() !== fecha) return;

  const titulo = _finQEl('fin-q-hoy-titulo');
  const total  = _finQEl('fin-q-hoy-total');
  const lista  = _finQEl('fin-q-hoy-lista');
  if (!titulo || !total || !lista) return;

  const nombre = _finNombreDia(fecha);
  titulo.textContent = 'Apuntado ' + (nombre === 'Hoy' ? 'hoy' : nombre === 'Ayer' ? 'ayer' : 'el ' + nombre);
  lista.innerHTML = '';
  total.textContent = '';
  caja.hidden = false;

  if (error) {
    const v = document.createElement('div');
    v.className = 'finq-vacio';
    v.textContent = 'No se pudo leer el día (señal).';
    lista.appendChild(v);
    return;
  }
  const filas = data || [];
  if (!filas.length) {
    const v = document.createElement('div');
    v.className = 'finq-vacio';
    v.textContent = 'Nada apuntado todavía.';
    lista.appendChild(v);
    return;
  }

  const gas = filas.filter(t => t.tipo === 'egreso').reduce((s, t) => s + Number(t.monto || 0), 0);
  const ing = filas.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto || 0), 0);
  const partes = [`${filas.length} ${filas.length === 1 ? 'apunte' : 'apuntes'}`];
  if (gas > 0) partes.push('− ' + _finMoney(gas));
  if (ing > 0) partes.push('+ ' + _finMoney(ing));
  total.textContent = partes.join(' · ');

  const yo = _finCurrentUserName();
  filas.forEach(t => {
    const fila = document.createElement('div');
    fila.className = 'finq-hoy-fila';

    const desc = document.createElement('span');
    desc.className = 'finq-hoy-desc';
    let texto = `${_finCatEmoji(t.categoria)} ${t.descripcion || t.categoria || 'Movimiento'}`;
    if (t.usuario && t.usuario !== yo) texto += ` · ${t.usuario}`;
    desc.textContent = texto;

    const monto = document.createElement('span');
    monto.className = 'finq-hoy-monto ' + (t.tipo === 'ingreso' ? 'fin-mov-in' : 'fin-mov-out');
    monto.textContent = (t.tipo === 'ingreso' ? '+ ' : '− ') + _finMoney(t.monto);

    fila.append(desc, monto);

    if (_finQ.ultimo && String(_finQ.ultimo.id) === String(t.id)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'finq-deshacer';
      b.textContent = '↶ Deshacer';
      b.addEventListener('click', () => _finQDeshacer(t));
      fila.appendChild(b);
    }
    lista.appendChild(fila);
  });
}

function _finQPintarFijo() {
  const btn = _finQEl('fin-q-fijo');
  const sub = _finQEl('fin-q-fijo-sub');
  if (!btn) return;
  const on = finApunteFijo();
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  btn.classList.toggle('finq-fijo-on', on);
  /* Se dice con PALABRAS lo que va a pasar, y en las dos posiciones. Un
     interruptor con solo un rótulo obliga a encenderlo para averiguar qué
     hace, y el que lo enciende sin querer no sabe qué le cambió. */
  if (sub) {
    sub.textContent = on
      ? 'Al entrar a Finanzas y al volver al teléfono ya estará abierta. La ✕ la cierra igual.'
      : 'Ahora hay que tocar el + cada vez que quieras apuntar.';
  }
}

function _finQAlternarFijo() {
  const on = !finApunteFijo();
  finPonerApunteFijo(on);
  _finQPintarFijo();
  if (typeof toast === 'function') {
    toast(on ? '📌 El Apunte se quedará abierto' : 'El Apunte ya no se abre solo');
  }
}

/* ¿Hay otra ventana encima? Abrir la hoja automáticamente por debajo del
   detalle de una tarjeta o del modal de deudas dejaría dos ventanas apiladas
   y la de abajo aparecería sola al cerrar la de arriba, que es el peor
   momento para que aparezca algo. */
function _finQOtraVentana() {
  return ['fin-modal-overlay', 'fin-detail-modal-overlay', 'fin-abono-overlay']
    .some(id => {
      const el = document.getElementById(id);
      return el && el.style.display !== 'none' && el.style.display !== '';
    });
}

/* Se abre sola solo si está encendido, si de verdad se está mirando
   Finanzas, y si no hay ya algo abierto. Las tres condiciones hacen falta. */
function _finQAbrirSiFijo() {
  if (!finApunteFijo()) return;
  if (_finQ.abierta || _finQOtraVentana()) return;
  const vista = document.getElementById('view-finanzas');
  if (!vista || !vista.classList.contains('active')) return;
  finAbrirApunte();
}

/* Al entrar a Finanzas. Va llamada desde switchView, o sea DENTRO del toque
   que cambió de vista: por eso aquí el teclado sí sale solo. */
function finApunteAlEntrar() {
  _finQAbrirSiFijo();
}

function finAbrirApunte(opts) {
  const overlay = _finQEl('fin-q-overlay');
  if (!overlay) return;
  const t = (opts && opts.editar) || null;

  _finQ.editando  = t;
  _finQ.abierta   = true;
  _finQ.ultimo    = null;
  _finQ.tipo      = t ? (t.tipo === 'ingreso' ? 'ingreso' : 'egreso') : 'egreso';
  _finQ.categoria = t ? (t.categoria || '') : '';
  _finQ.catManual = !!t;
  _finQ.catAuto   = false;
  _finQ.cuentaId  = t ? String(t.cuenta_id || '') : '';

  let dia = 'hoy';
  if (t) dia = t.fecha === _finToday() ? 'hoy' : t.fecha === _finFechaOffset(-1) ? 'ayer' : 'otro';
  const fechaInp = _finQEl('fin-q-fecha');
  if (fechaInp) fechaInp.value = (t && t.fecha) || _finToday();

  const monto = _finQEl('fin-q-monto');
  const desc  = _finQEl('fin-q-desc');
  if (monto) monto.value = t ? String(t.monto) : '';
  if (desc)  desc.value  = t ? (t.descripcion || '') : '';
  const hint = _finQEl('fin-q-cat-hint');
  if (hint) hint.textContent = '';
  _finQAviso('');

  const modo = _finQEl('fin-q-modo');
  if (modo) modo.hidden = !t;
  const mas = _finQEl('fin-q-mas');
  if (mas) mas.hidden = !!t;
  const fijo = _finQEl('fin-q-fijo');
  if (fijo) fijo.hidden = !!t;
  _finQPintarFijo();

  _finQPintarTipo();
  _finQPintarCategorias();
  _finQPintarCuentas();
  _finQPintarDatalist();
  _finQElegirDia(dia);
  _finQEco();

  overlay.style.display = 'flex';
  // El foco va DENTRO del mismo toque que abrió la hoja: es lo que hace que
  // en una tableta salga el teclado solo. Después de un await no sale.
  if (monto) { monto.focus(); if (t) monto.select(); }

  // Si el panel todavía estaba cargando (desde el Acceso Rápido pasa
  // siempre), las cuentas y el historial llegan después: se repinta lo
  // que depende de ellos, sin tocar el monto ni el foco.
  const carga = _finInitPromesa;
  if (carga) {
    carga.then(() => {
      if (!_finQ.abierta || _finInitPromesa !== carga) return;
      _finQPintarCuentas();
      _finQPintarCategorias();
      _finQPintarDatalist();
    }).catch(() => {});
  }
}

function finCerrarApunte() {
  const overlay = _finQEl('fin-q-overlay');
  if (overlay) overlay.style.display = 'none';
  _finQ.abierta = false;
  _finQ.editando = null;
}

async function _finQGuardar(e) {
  if (e) e.preventDefault();
  if (!_sb) return;
  const montoInp = _finQEl('fin-q-monto');
  const descInp  = _finQEl('fin-q-desc');
  const btn      = _finQEl('fin-q-guardar');

  const m = _finQLeerMonto(montoInp ? montoInp.value : '');
  if (!m) {
    _finQAviso('Escribe el monto: solo números.');
    if (montoInp) montoInp.focus();
    return;
  }
  if (!_finQ.categoria) {
    _finQAviso('Toca una categoría.');
    const wrap = _finQEl('fin-q-cats');
    if (wrap) {
      wrap.classList.remove('finq-chips-falta');
      void wrap.offsetWidth;
      wrap.classList.add('finq-chips-falta');
    }
    return;
  }
  if (!_finQ.cuentaId) {
    _finQAviso('Hace falta una cuenta donde apuntarlo.');
    return;
  }
  const fecha = _finQFechaElegida();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    _finQAviso('La fecha no se entiende.');
    return;
  }

  const tipo        = _finQ.tipo;
  const monto       = m.valor;
  const categoria   = _finQ.categoria;
  const descripcion = (descInp ? descInp.value : '').trim();
  const cuentaId    = _finQ.cuentaId;

  if (btn) btn.disabled = true;
  try {
    // ── Edición: actualiza la fila y reconcilia los saldos ──
    if (_finQ.editando) {
      const orig = _finQ.editando;
      const { error: errUpd } = await _sb
        .from(FIN_TRANSACCIONES_TABLE)
        .update({ tipo, monto, categoria, descripcion, fecha, cuenta_id: cuentaId })
        .eq('id', orig.id);
      if (errUpd) {
        console.error('[Finanzas] Error actualizando el apunte:', errUpd);
        _finQAviso('No se guardó el cambio. Revisa la señal y vuelve a intentar.');
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
      if (typeof toast === 'function') toast('✅ Apunte actualizado');
      finCerrarApunte();
      await initFinanzas();
      await _finRefreshGastosDetailIfOpen();
      return;
    }

    // ── Apunte nuevo ──
    const { data, error } = await _sb.from(FIN_TRANSACCIONES_TABLE).insert({
      tipo, monto, categoria, descripcion, fecha,
      usuario: _finCurrentUserName(),
      cuenta_id: cuentaId,
      ..._finCtxData(),
    }).select().single();

    if (error) {
      console.error('[Finanzas] Error guardando el apunte:', error);
      _finQAviso('No se guardó. Revisa la señal y vuelve a intentar.');
      return;
    }

    await _finApplyBalanceDelta(cuentaId, tipo === 'ingreso' ? monto : -monto);

    // Memoria para el siguiente: el historial en el aparato, la cuenta
    // preferida y el último apunte (para deshacer).
    const hist = _finHistCache[_finContexto] || (_finHistCache[_finContexto] = []);
    hist.unshift({ tipo, categoria, descripcion, cuenta_id: cuentaId });
    if (hist.length > FIN_HIST_LIMITE) hist.length = FIN_HIST_LIMITE;
    _finQGuardarPref({ cuenta_id: cuentaId });
    _finQ.ultimo = data || null;

    if (typeof toast === 'function') {
      toast(`✅ ${tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} apuntado · ${_finMoney(monto)}`);
    }

    // La hoja se queda abierta para el siguiente: se limpia lo que es de
    // este apunte (monto, descripción, categoría) y se queda lo que suele
    // repetirse (tipo, día, cuenta). El teclado sigue en el monto.
    if (montoInp) montoInp.value = '';
    if (descInp)  descInp.value  = '';
    _finQ.categoria = '';
    _finQ.catManual = false;
    _finQ.catAuto   = false;
    const hint = _finQEl('fin-q-cat-hint');
    if (hint) hint.textContent = '';
    _finQPintarCategorias();
    _finQPintarDatalist();
    _finQEco();
    _finQAviso('');
    if (montoInp) montoInp.focus();

    _finQPintarDelDia();
    initFinanzas(); // el panel se pone al día detrás, sin parar la hoja
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function _finQDeshacer(t) {
  if (!_sb || !t) return;
  const { error } = await _sb.from(FIN_TRANSACCIONES_TABLE).delete().eq('id', t.id);
  if (error) {
    console.error('[Finanzas] Error deshaciendo el apunte:', error);
    if (typeof toast === 'function') toast('No se pudo deshacer');
    return;
  }
  // Devuelve al saldo lo que este apunte le había quitado (o puesto).
  await _finApplyBalanceDelta(t.cuenta_id, (t.tipo === 'ingreso' ? -1 : 1) * Number(t.monto || 0));
  if (_finQ.ultimo && String(_finQ.ultimo.id) === String(t.id)) _finQ.ultimo = null;
  const hist = _finHistCache[_finContexto] || [];
  const i = hist.findIndex(h => h.tipo === t.tipo && h.categoria === t.categoria &&
    (h.descripcion || '') === (t.descripcion || '') && String(h.cuenta_id) === String(t.cuenta_id));
  if (i >= 0) hist.splice(i, 1);
  if (typeof toast === 'function') toast('↶ Apunte deshecho');
  _finQPintarDelDia();
  initFinanzas();
}

// Enganche de la hoja. Todo delegado en los contenedores: los chips se
// repintan y no pueden llevar el manejador cada uno.
function _finQEnganchar() {
  const overlay = _finQEl('fin-q-overlay');
  if (!overlay) return;

  _finQEl('fin-q-close')?.addEventListener('click', finCerrarApunte);
  overlay.addEventListener('click', e => { if (e.target === overlay) finCerrarApunte(); });
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') finCerrarApunte(); });

  _finQEl('fin-q-tipo')?.addEventListener('click', e => {
    const b = e.target.closest('[data-tipo]');
    if (b) _finQElegirTipo(b.dataset.tipo);
  });
  _finQEl('fin-q-cats')?.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (b) _finQElegirCategoria(b.dataset.cat, true);
  });
  _finQEl('fin-q-cuentas')?.addEventListener('click', e => {
    const b = e.target.closest('[data-cuenta]');
    if (b) _finQElegirCuenta(b.dataset.cuenta);
  });
  _finQEl('fin-q-dias')?.addEventListener('click', e => {
    const b = e.target.closest('[data-dia]');
    if (b) _finQElegirDia(b.dataset.dia);
  });
  _finQEl('fin-q-fecha')?.addEventListener('change', () => _finQPintarDelDia());
  _finQEl('fin-q-monto')?.addEventListener('input', () => { _finQEco(); _finQAviso(''); });
  _finQEl('fin-q-desc')?.addEventListener('input', _finQAlEscribirDesc);
  _finQEl('fin-q-form')?.addEventListener('submit', _finQGuardar);

  _finQEl('fin-q-fijo')?.addEventListener('click', _finQAlternarFijo);

  // Lo que no es diario sigue en el modal de siempre, a un toque.
  _finQEl('fin-q-mas')?.addEventListener('click', e => {
    const b = e.target.closest('[data-fintab]');
    if (!b) return;
    finCerrarApunte();
    finOpenModal(b.dataset.fintab);
  });

  /* ⚠️ VOLVER AL TELÉFONO ES LO QUE DE VERDAD SE PIDIÓ. Apagar la pantalla
     no cierra nada, pero el teléfono deja la página en segundo plano y al
     encenderla vuelve tal como estaba — o sea, con la hoja cerrada si se
     cerró. `visibilitychange` es el único aviso que da el navegador de que
     alguien volvió a mirar, y sirve igual para la pantalla apagada, para
     cambiar de aplicación y para volver de la cámara.
     NO se usa `focus`: en Android salta también al abrirse el teclado, y la
     hoja se reabriría sola en medio de escribir un monto. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') _finQAbrirSiFijo();
  });
}

/* Al abrir la aplicación desde cero. Lo llama js/auth.js en cuanto la sesión
   queda puesta, que es el único instante en que se sabe que hay alguien
   dentro y que la pantalla ya no es la del login.
   ⚠️ Una dirección con ?view= manda SIEMPRE: quien toca una notificación del
   chat quiere el chat, y encontrarse las finanzas en su lugar es perder el
   mensaje que venía a leer. */
function faroArranqueApunteFijo() {
  if (!finApunteFijo()) return;
  try {
    if (new URLSearchParams(window.location.search).get('view')) return;
  } catch (_) {}
  if (typeof switchView !== 'function') return;
  switchView('view-finanzas');
  _finQAbrirSiFijo();
}

/* ─────────────────────────────────────────────
   ESTADÍSTICAS
   Todo se calcula a partir de las transacciones reales
   (los envíos familiares se excluyen siempre).
───────────────────────────────────────────── */

let _finStatsView = null; // { year, month(0-based) }

async function initFinStats() {
  if (!_sb) return;
  await _finCheckContexto();
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

  const { data, error } = await _finCtx(_sb
    .from(FIN_TRANSACCIONES_TABLE)
    .select('tipo, monto, categoria, descripcion, fecha, usuario'))
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
  // El «+» abre el Apunte rápido: los gastos e ingresos del día van por ahí.
  document.getElementById('fin-fab')?.addEventListener('click', () => finAbrirApunte());
  _finQEnganchar();

  // El modal de siempre queda para lo que no es diario.
  document.getElementById('fin-modal-close')?.addEventListener('click', finCloseModal);
  document.getElementById('fin-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'fin-modal-overlay') finCloseModal();
  });

  document.querySelectorAll('.fin-modal-tab').forEach(btn => {
    btn.addEventListener('click', () => finSwitchTab(btn.dataset.fintab));
  });

  document.getElementById('fin-form-transferencia')?.addEventListener('submit', finSubmitTransferencia);
  document.getElementById('fin-form-cuenta')?.addEventListener('submit', finSubmitCuenta);
  document.getElementById('fin-form-deuda')?.addEventListener('submit', finSubmitDeuda);

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

  // Cambio de presupuesto: Familia ⇄ Escuela.
  document.getElementById('fin-ctx-btn')?.addEventListener('click', finToggleContexto);

  // Estadísticas.
  document.getElementById('fin-goto-stats')?.addEventListener('click', () => switchView('view-fin-stats'));
  document.getElementById('fin-stats-back-btn')?.addEventListener('click', () => switchView('view-finanzas'));
  document.getElementById('fs-prev-month')?.addEventListener('click', () => _finChangeStatsMonth(-1));
  document.getElementById('fs-next-month')?.addEventListener('click', () => _finChangeStatsMonth(1));
});
