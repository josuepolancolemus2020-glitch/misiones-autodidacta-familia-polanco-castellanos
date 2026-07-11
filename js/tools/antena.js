'use strict';

/* ─────────────────────────────────────────────
   ANTENA 📡 — gestión de redes sociales (Fase 4)
   Sesión con enlace mágico + conexión OAuth
   + compositor con programación + calendario
   mensual + métricas. El publicador (Edge
   Function antena-publicar) despierta cada
   minuto vía pg_cron; el recolector
   (antena-metricas) cada 4 horas.
   Los tokens OAuth JAMÁS llegan a este código.
───────────────────────────────────────────── */

const ANT_T_CUENTAS  = 'antena_cuentas';
const ANT_T_PUBS     = 'antena_publicaciones';
const ANT_T_DESTINOS = 'antena_destinos';
const ANT_T_METRICAS = 'antena_metricas';

const ANT_PLATAFORMAS = [
  { id: 'x',        nombre: 'X (Twitter)',      icon: 'fa-brands fa-x-twitter', cls: 'ant-x',  conectable: true },
  { id: 'facebook', nombre: 'Facebook Páginas', icon: 'fa-brands fa-facebook',  cls: 'ant-fb', conectable: true, multi: true },
  { id: 'youtube',  nombre: 'YouTube',          icon: 'fa-brands fa-youtube',   cls: 'ant-yt', fase: 'Disponible en la Fase 5' },
  { id: 'tiktok',   nombre: 'TikTok',           icon: 'fa-brands fa-tiktok',    cls: 'ant-tk', fase: 'Disponible en la Fase 5' },
];

const ANT_LINK_POST = {
  x:        id => `https://x.com/i/web/status/${encodeURIComponent(id)}`,
  facebook: id => `https://www.facebook.com/${encodeURIComponent(id)}`,
};

const ANT_ESTADO_LBL = {
  borrador: '📝 Borrador', programada: '⏰ Programada', publicando: '📤 Publicando…',
  publicada: '✅ Publicada', error: '❌ Error', cancelada: '🚫 Cancelada',
};

let _antSession = null;
let _antCuentas = [];
let _antDestSel = new Set(); // cuentas elegidas como destino en el compositor
let _antPrivada = true;      // 🔒 por defecto: nada sale público sin querer
let _antCalMes = null;       // primer día del mes mostrado en el calendario
let _antCalDiaSel = null;    // día seleccionado (número) o null

/* ── Sesión ── */

async function antGetSession() {
  if (!_sb) return null;
  try {
    const { data } = await _sb.auth.getSession();
    return data.session || null;
  } catch (_) { return null; }
}

async function initAntena() {
  const loginEl = document.getElementById('ant-login');
  const dashEl  = document.getElementById('ant-dashboard');
  if (!loginEl || !dashEl) return;

  if (!_sb) {
    loginEl.style.display = 'none';
    dashEl.style.display = 'none';
    document.getElementById('ant-sin-conexion').style.display = 'block';
    return;
  }

  _antSession = await antGetSession();

  if (!_antSession) {
    loginEl.style.display = 'block';
    dashEl.style.display = 'none';
    return;
  }

  loginEl.style.display = 'none';
  dashEl.style.display = 'block';
  const emailEl = document.getElementById('ant-session-email');
  if (emailEl) emailEl.textContent = _antSession.user.email;

  await antRenderCuentas();
  await antRenderPublicaciones();
  await antRenderCalendario();
}

async function antEnviarEnlace() {
  const inp   = document.getElementById('ant-email');
  const msgEl = document.getElementById('ant-login-msg');
  const email = (inp?.value || '').trim().toLowerCase();
  if (!email || !email.includes('@')) { inp?.focus(); return; }

  msgEl.textContent = 'Enviando enlace…';
  msgEl.className = 'ant-login-msg';

  const { error } = await _sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });

  if (error) {
    console.error('[Antena] Error enviando enlace:', error);
    msgEl.textContent = 'No se pudo enviar el enlace. Intenta de nuevo en un minuto.';
    msgEl.className = 'ant-login-msg ant-login-msg-error';
    return;
  }
  msgEl.innerHTML = '📬 <strong>Revisa tu correo</strong> y toca el enlace para entrar.<br>Puedes cerrar esta pantalla mientras tanto.';
  msgEl.className = 'ant-login-msg ant-login-msg-ok';
}

/* ── Cuentas conectadas ── */

async function antRenderCuentas() {
  const grid = document.getElementById('ant-cuentas-grid');
  if (!grid) return;

  const { data, error } = await _sb.from(ANT_T_CUENTAS)
    .select('id, plataforma, nombre_visible, estado, conectada_at');
  if (error) { console.error('[Antena] Error cargando cuentas:', error); _antCuentas = []; }
  else _antCuentas = data || [];

  grid.innerHTML = ANT_PLATAFORMAS.map(p => {
    const cuentas = _antCuentas.filter(x => x.plataforma === p.id);

    // Filas de cuentas conectadas (una plataforma puede tener varias: Páginas de FB)
    const filas = cuentas.map(c => {
      const alerta = c.estado === 'requiere_reconexion';
      return `<div class="ant-cuenta-fila">
        <span class="ant-plat-estado ${alerta ? 'ant-estado-alerta' : 'ant-estado-ok'}">
          ${alerta ? '⚠️ ' : '✓ '}${antEsc(c.nombre_visible || 'Conectada')}
        </span>
        <button type="button" class="ant-desconectar-btn" data-desconectar="${c.id}" aria-label="Desconectar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>`;
    }).join('');

    let accion = '';
    if (p.conectable) {
      const alerta = cuentas.some(c => c.estado === 'requiere_reconexion');
      if (!cuentas.length) {
        accion = `<button type="button" class="ant-conectar-btn" data-conectar="${p.id}">
          <i class="fa-solid fa-plug"></i> Conectar</button>`;
      } else if (alerta) {
        accion = `<button type="button" class="ant-conectar-btn" data-conectar="${p.id}">Reconectar</button>`;
      } else if (p.multi) {
        accion = `<button type="button" class="ant-conectar-btn ant-conectar-sec" data-conectar="${p.id}">
          <i class="fa-solid fa-rotate"></i> Actualizar páginas</button>`;
      }
    } else if (!cuentas.length) {
      accion = `<span class="ant-plat-estado ant-estado-pronto">${p.fase}</span>`;
    }

    return `<div class="ant-plat-card ${cuentas.length ? 'ant-plat-conectada' : ''}">
      <span class="ant-plat-icon ${p.cls}"><i class="${p.icon}"></i></span>
      <div class="ant-plat-info">
        <span class="ant-plat-nombre">${p.nombre}</span>
        ${filas}
        ${accion}
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-conectar]').forEach(btn =>
    btn.addEventListener('click', () => antConectar(btn.dataset.conectar)));
  grid.querySelectorAll('[data-desconectar]').forEach(btn =>
    btn.addEventListener('click', () => antDesconectar(Number(btn.dataset.desconectar))));

  // El compositor aparece solo si hay al menos una cuenta activa
  const activas = _antCuentas.filter(c => c.estado === 'activa');
  const composer = document.getElementById('ant-composer');
  if (composer) composer.style.display = activas.length ? 'block' : 'none';

  // Chips de destino: por defecto, todas las cuentas activas seleccionadas
  _antDestSel = new Set(activas.map(c => c.id));
  antRenderDestChips();
}

/* Chips para elegir a qué cuentas/páginas sale la publicación */
function antRenderDestChips() {
  const wrap = document.getElementById('ant-dest-chips');
  if (!wrap) return;
  const activas = _antCuentas.filter(c => c.estado === 'activa');

  // Solo Facebook admite posts privados: con el candado puesto,
  // los demás destinos quedan bloqueados y deseleccionados.
  if (_antPrivada) {
    activas.filter(c => c.plataforma !== 'facebook').forEach(c => _antDestSel.delete(c.id));
  }

  wrap.innerHTML = activas.map(c => {
    const p = ANT_PLATAFORMAS.find(x => x.id === c.plataforma);
    const bloqueada = _antPrivada && c.plataforma !== 'facebook';
    const sel = !bloqueada && _antDestSel.has(c.id);
    return `<button type="button"
      class="ant-dest-chip ${sel ? 'ant-dest-chip-on' : ''} ${bloqueada ? 'ant-dest-chip-off' : ''}"
      data-dest="${c.id}" ${bloqueada ? 'disabled title="No admite publicaciones privadas"' : ''}>
      <i class="${p ? p.icon : ''}"></i> ${antEsc(c.nombre_visible || c.plataforma)}
    </button>`;
  }).join('');
  wrap.querySelectorAll('.ant-dest-chip:not([disabled])').forEach(btn =>
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.dest);
      if (_antDestSel.has(id)) _antDestSel.delete(id);
      else _antDestSel.add(id);
      antRenderDestChips();
    }));

  antRenderPrivadaBtn();
}

/* El candado del compositor: privada (solo tú) o pública directa */
function antRenderPrivadaBtn() {
  const btn = document.getElementById('ant-privada-btn');
  if (!btn) return;
  btn.classList.toggle('ant-privada-on', _antPrivada);
  btn.innerHTML = _antPrivada
    ? '<i class="fa-solid fa-lock"></i> Privada: solo tú la verás, hasta que la apruebes'
    : '<i class="fa-solid fa-lock-open"></i> Pública: visible para todos al publicarse';
}

async function antConectar(plataforma) {
  if (!['x', 'facebook'].includes(plataforma)) return;
  if (typeof toast === 'function') toast(`Abriendo autorización de ${plataforma === 'x' ? 'X' : 'Facebook'}…`);
  const { data, error } = await _sb.functions.invoke('antena-oauth-start', {
    body: { plataforma },
  });
  if (error || !data?.url) {
    console.error('[Antena] Error iniciando OAuth:', error || data);
    if (typeof toast === 'function') toast('No se pudo iniciar la conexión');
    return;
  }
  window.location.href = data.url; // → X → antena-oauth-callback → de vuelta aquí
}

async function antDesconectar(cuentaId) {
  if (!confirm('¿Desconectar esta cuenta? Las publicaciones programadas hacia ella fallarán.')) return;
  const { error } = await _sb.from(ANT_T_CUENTAS).delete().eq('id', cuentaId);
  if (error) { if (typeof toast === 'function') toast('No se pudo desconectar'); return; }
  if (typeof toast === 'function') toast('Cuenta desconectada');
  antRenderCuentas();
}

/* ── Compositor: programar publicaciones ── */

function antActualizarContador() {
  const txt = document.getElementById('ant-composer-texto')?.value || '';
  const el  = document.getElementById('ant-composer-count');
  if (el) {
    el.textContent = `${txt.length}/280`;
    el.classList.toggle('ant-count-max', txt.length >= 270);
  }
}

async function antProgramar(ahora) {
  const txtEl   = document.getElementById('ant-composer-texto');
  const fechaEl = document.getElementById('ant-composer-fecha');
  const texto   = (txtEl?.value || '').trim();
  if (!texto) { txtEl?.focus(); return; }

  let fecha;
  if (ahora) {
    fecha = new Date(); // el cron del próximo minuto la toma
  } else {
    if (!fechaEl?.value) {
      if (typeof toast === 'function') toast('Elige fecha y hora');
      fechaEl?.focus();
      return;
    }
    fecha = new Date(fechaEl.value);
    if (fecha.getTime() <= Date.now()) {
      if (typeof toast === 'function') toast('La fecha debe ser en el futuro');
      return;
    }
  }

  const activas = _antCuentas.filter(c => c.estado === 'activa' && _antDestSel.has(c.id));
  if (!activas.length) {
    if (typeof toast === 'function') {
      toast(_antPrivada ? 'El modo privado necesita una Página de Facebook' : 'Elige al menos un destino');
    }
    return;
  }

  const { data: pub, error } = await _sb.from(ANT_T_PUBS).insert({
    usuario_id: _antSession.user.id,
    cuerpo: texto,
    programada_at: fecha.toISOString(),
    estado: 'programada',
    privada: _antPrivada,
  }).select().single();
  if (error || !pub) {
    console.error('[Antena] Error creando publicación:', error);
    if (typeof toast === 'function') toast('No se pudo programar');
    return;
  }

  const { error: dErr } = await _sb.from(ANT_T_DESTINOS).insert(
    activas.map(c => ({ publicacion_id: pub.id, cuenta_id: c.id })),
  );
  if (dErr) {
    console.error('[Antena] Error creando destinos:', dErr);
    await _sb.from(ANT_T_PUBS).delete().eq('id', pub.id);
    if (typeof toast === 'function') toast('No se pudo programar');
    return;
  }

  txtEl.value = '';
  if (fechaEl) fechaEl.value = '';
  antActualizarContador();
  if (typeof toast === 'function') {
    toast(ahora ? '📤 Saldrá en el próximo minuto' : '⏰ Publicación programada');
  }
  antRenderPublicaciones();
  antRenderCalendario();
}

/* ── Calendario mensual ── */

function antFechaLocal(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function antRenderCalendario() {
  const grid = document.getElementById('ant-cal-grid');
  const tit  = document.getElementById('ant-cal-titulo');
  if (!grid || !tit || !_sb || !_antSession) return;

  if (!_antCalMes) {
    const hoy = new Date();
    _antCalMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  }
  const ini = _antCalMes;
  const fin = new Date(ini.getFullYear(), ini.getMonth() + 1, 1);
  const titulo = ini.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  tit.textContent = titulo.charAt(0).toUpperCase() + titulo.slice(1);

  const { data, error } = await _sb.from(ANT_T_PUBS)
    .select('id, cuerpo, estado, programada_at')
    .gte('programada_at', ini.toISOString())
    .lt('programada_at', fin.toISOString())
    .neq('estado', 'cancelada')
    .order('programada_at');
  if (error) console.error('[Antena] Error cargando calendario:', error);
  const pubs = data || [];

  const porDia = new Map();
  pubs.forEach(p => {
    const d = new Date(p.programada_at).getDate();
    if (!porDia.has(d)) porDia.set(d, []);
    porDia.get(d).push(p);
  });

  const offset = (ini.getDay() + 6) % 7; // semana empieza en lunes
  const nDias  = new Date(ini.getFullYear(), ini.getMonth() + 1, 0).getDate();
  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === ini.getFullYear() && hoy.getMonth() === ini.getMonth();

  let html = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    .map(d => `<span class="ant-cal-dow">${d}</span>`).join('');
  for (let i = 0; i < offset; i++) html += '<span></span>';
  for (let dia = 1; dia <= nDias; dia++) {
    const estados = [...new Set((porDia.get(dia) || []).map(p => p.estado))];
    const dots = estados.map(e => `<span class="ant-cal-dot ant-dot-${e}"></span>`).join('');
    const clases = ['ant-cal-dia'];
    if (esMesActual && dia === hoy.getDate()) clases.push('ant-cal-hoy');
    if (_antCalDiaSel === dia) clases.push('ant-cal-sel');
    html += `<button type="button" class="${clases.join(' ')}" data-dia="${dia}">
      <span class="ant-cal-num">${dia}</span>
      <span class="ant-cal-dots">${dots}</span>
    </button>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('[data-dia]').forEach(btn =>
    btn.addEventListener('click', () => antCalSeleccionarDia(Number(btn.dataset.dia))));

  antCalRenderDetalle(porDia);
}

function antCalSeleccionarDia(dia) {
  _antCalDiaSel = (_antCalDiaSel === dia) ? null : dia;

  // Dejar la fecha lista en el compositor (hoy → dentro de 1 h; futuro → 9:00)
  if (_antCalDiaSel) {
    const hoy = new Date();
    const esHoy = _antCalMes.getFullYear() === hoy.getFullYear()
      && _antCalMes.getMonth() === hoy.getMonth() && dia === hoy.getDate();
    const f = esHoy
      ? new Date(Date.now() + 60 * 60 * 1000)
      : new Date(_antCalMes.getFullYear(), _antCalMes.getMonth(), dia, 9, 0);
    if (f.getTime() > Date.now()) {
      const fechaEl = document.getElementById('ant-composer-fecha');
      if (fechaEl) fechaEl.value = antFechaLocal(f);
    }
  }
  antRenderCalendario();
}

function antCalRenderDetalle(porDia) {
  const det = document.getElementById('ant-cal-detalle');
  if (!det) return;
  if (!_antCalDiaSel) { det.innerHTML = ''; return; }

  const lista = porDia.get(_antCalDiaSel) || [];
  const fecha = new Date(_antCalMes.getFullYear(), _antCalMes.getMonth(), _antCalDiaSel);
  const titulo = fecha.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!lista.length) {
    const futuro = fecha.getTime() > Date.now() - 24 * 60 * 60 * 1000;
    det.innerHTML = `<div class="ant-cal-det">
      <div class="ant-cal-det-titulo">${antEsc(titulo)}</div>
      <p class="ant-cal-det-vacio">${futuro ? 'Día libre. La fecha ya quedó en el compositor. ✍️' : 'Nada se publicó este día.'}</p>
    </div>`;
    return;
  }

  det.innerHTML = `<div class="ant-cal-det">
    <div class="ant-cal-det-titulo">${antEsc(titulo)}</div>
    ${lista.map(p => `<div class="ant-cal-det-item">
      <span class="ant-cal-dot ant-dot-${p.estado}"></span>
      <span class="ant-cal-det-hora">${new Date(p.programada_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
      <span class="ant-cal-det-txt">${antEsc((p.cuerpo || '').slice(0, 70))}</span>
    </div>`).join('')}
  </div>`;
}

function antCalMover(delta) {
  _antCalMes = new Date(_antCalMes.getFullYear(), _antCalMes.getMonth() + delta, 1);
  _antCalDiaSel = null;
  antRenderCalendario();
}

/* ── Métricas ── */

function antNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' M';
  if (n >= 1000)    return (n / 1000).toFixed(1).replace('.0', '') + ' k';
  return String(n);
}

async function antActualizarMetricas() {
  const btn = document.getElementById('ant-met-btn');
  if (btn) btn.disabled = true;
  if (typeof toast === 'function') toast('📊 Consultando las redes…');

  const { data, error } = await _sb.functions.invoke('antena-metricas', { body: {} });

  if (btn) btn.disabled = false;
  if (error) {
    console.error('[Antena] Error actualizando métricas:', error);
    if (typeof toast === 'function') toast('No se pudieron actualizar las métricas');
    return;
  }
  if (typeof toast === 'function') {
    toast(data?.capturadas ? `📊 Métricas actualizadas (${data.capturadas})` : '📊 Métricas al día');
  }
  antRenderPublicaciones();
}

/* ── Listas de publicaciones ── */

async function antRenderPublicaciones() {
  const list    = document.getElementById('ant-pubs-list');
  const emptyEl = document.getElementById('ant-pubs-empty');
  const hechas  = document.getElementById('ant-hechas-list');
  if (!list) return;

  const { data, error } = await _sb.from(ANT_T_PUBS)
    .select('*, destinos:antena_destinos(id, estado, post_externo_id, ultimo_error, cuenta_id)')
    .order('creado_at', { ascending: false })
    .limit(40);
  if (error) { console.error('[Antena] Error cargando publicaciones:', error); return; }

  const pubs = data || [];
  const pendientes = pubs.filter(p => ['borrador', 'programada', 'publicando', 'error'].includes(p.estado))
    .sort((a, b) => (a.programada_at || '') < (b.programada_at || '') ? -1 : 1);
  const publicadas = pubs.filter(p => p.estado === 'publicada').slice(0, 5);

  if (emptyEl) emptyEl.style.display = pendientes.length ? 'none' : 'block';

  list.innerHTML = pendientes.map(p => {
    const err = (p.destinos || []).find(d => d.ultimo_error)?.ultimo_error;
    return `<div class="ant-pub-card">
      <div class="ant-pub-body">${antEsc((p.cuerpo || p.titulo || '').slice(0, 160))}</div>
      <div class="ant-pub-meta">
        <span class="red-badge red-badge-tipo">${ANT_ESTADO_LBL[p.estado] || p.estado}</span>
        ${p.privada ? '<span class="red-badge ant-badge-privada"><i class="fa-solid fa-lock"></i> Privada</span>' : ''}
        ${p.programada_at ? `<span class="ant-pub-fecha"><i class="fa-regular fa-clock"></i> ${new Date(p.programada_at).toLocaleString('es')}</span>` : ''}
        ${p.estado === 'programada' ? `<button type="button" class="ant-pub-accion" data-cancelar="${p.id}">Cancelar</button>` : ''}
        ${['error', 'cancelada', 'borrador'].includes(p.estado) ? `<button type="button" class="ant-pub-accion ant-pub-borrar" data-borrar="${p.id}">Borrar</button>` : ''}
      </div>
      ${p.estado === 'error' && err ? `<div class="ant-pub-error">${antEsc(err.slice(0, 160))}</div>` : ''}
    </div>`;
  }).join('');

  list.querySelectorAll('[data-cancelar]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('¿Cancelar esta publicación programada?')) return;
    await _sb.from(ANT_T_PUBS).update({ estado: 'cancelada' }).eq('id', btn.dataset.cancelar);
    antRenderPublicaciones();
    antRenderCalendario();
  }));
  list.querySelectorAll('[data-borrar]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('¿Borrar definitivamente?')) return;
    await _sb.from(ANT_T_PUBS).delete().eq('id', btn.dataset.borrar);
    antRenderPublicaciones();
    antRenderCalendario();
  }));

  if (hechas) {
    // Último snapshot de métricas de cada destino publicado
    const destIds = publicadas.flatMap(p =>
      (p.destinos || []).filter(d => d.post_externo_id).map(d => d.id));
    const ultMet = new Map();
    if (destIds.length) {
      const { data: mets } = await _sb.from(ANT_T_METRICAS)
        .select('destino_id, vistas, likes, comentarios, compartidos')
        .in('destino_id', destIds)
        .order('capturado_at', { ascending: false });
      (mets || []).forEach(m => { if (!ultMet.has(m.destino_id)) ultMet.set(m.destino_id, m); });
    }

    hechas.innerHTML = publicadas.map(p => {
      const links = (p.destinos || [])
        .filter(d => d.post_externo_id)
        .map(d => {
          const cuenta = _antCuentas.find(c => c.id === d.cuenta_id);
          const plat = cuenta?.plataforma || 'x';
          const fn = ANT_LINK_POST[plat];
          const lbl = plat === 'facebook' ? (cuenta?.nombre_visible || 'Facebook') : 'X';
          return fn ? `<a class="ant-pub-link" href="${fn(d.post_externo_id)}" target="_blank" rel="noopener">
            Ver en ${antEsc(lbl)} <i class="fa-solid fa-up-right-from-square"></i></a>` : '';
        }).join('');

      const tot = (p.destinos || []).reduce((acc, d) => {
        const m = ultMet.get(d.id);
        if (m) {
          acc.hay = true;
          acc.vistas += m.vistas; acc.likes += m.likes;
          acc.com += m.comentarios; acc.comp += m.compartidos;
        }
        return acc;
      }, { hay: false, vistas: 0, likes: 0, com: 0, comp: 0 });
      const metricas = tot.hay ? `<div class="ant-met-chips">
        <span class="ant-met-chip" title="Alcance"><i class="fa-regular fa-eye"></i> ${antNum(tot.vistas)}</span>
        <span class="ant-met-chip" title="Me gusta"><i class="fa-regular fa-heart"></i> ${antNum(tot.likes)}</span>
        <span class="ant-met-chip" title="Comentarios"><i class="fa-regular fa-comment"></i> ${antNum(tot.com)}</span>
        <span class="ant-met-chip" title="Compartidos"><i class="fa-solid fa-retweet"></i> ${antNum(tot.comp)}</span>
      </div>` : '';

      return `<div class="ant-pub-card ant-pub-hecha">
        <div class="ant-pub-body">${antEsc((p.cuerpo || '').slice(0, 120))}</div>
        <div class="ant-pub-meta">
          <span class="red-badge red-badge-tipo">${p.privada ? '🔒 Publicada en privado' : '✅ Publicada'}</span>
          ${p.privada ? `<button type="button" class="ant-pub-accion ant-pub-hacerpublica" data-hacerpublica="${p.id}">
            <i class="fa-solid fa-bullhorn"></i> Hacer pública</button>` : ''}
          ${links}
        </div>
        ${metricas}
      </div>`;
    }).join('') || '<p class="fin-empty">Aún nada publicado.</p>';

    hechas.querySelectorAll('[data-hacerpublica]').forEach(btn =>
      btn.addEventListener('click', () => antHacerPublica(Number(btn.dataset.hacerpublica), btn)));
  }
}

/* Voltear una publicación privada a pública (Edge Function antena-visibilidad) */
async function antHacerPublica(pubId, btn) {
  if (!confirm('¿Hacer pública esta publicación? Todos podrán verla en Facebook.')) return;
  if (btn) btn.disabled = true;
  if (typeof toast === 'function') toast('📣 Haciéndola pública…');

  const { data, error } = await _sb.functions.invoke('antena-visibilidad', {
    body: { publicacion_id: pubId },
  });

  if (btn) btn.disabled = false;
  if (error || data?.fallidos) {
    console.error('[Antena] Error haciendo pública:', error || data);
    if (typeof toast === 'function') toast('No se pudo hacer pública. Intenta de nuevo.');
    return;
  }
  if (typeof toast === 'function') toast('📣 ¡Ya es pública!');
  antRenderPublicaciones();
}

function antEsc(s) {
  const div = document.createElement('div');
  div.textContent = s || '';
  return div.innerHTML;
}

/* ── Wiring ── */

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('goto-antena-btn')?.addEventListener('click', () => switchView('view-antena'));
  document.getElementById('antena-back-btn')?.addEventListener('click', () => switchView('view-inicio'));

  document.getElementById('ant-enviar-btn')?.addEventListener('click', antEnviarEnlace);
  document.getElementById('ant-email')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') antEnviarEnlace();
  });

  document.getElementById('ant-logout-btn')?.addEventListener('click', async () => {
    await _sb?.auth.signOut();
    initAntena();
  });

  document.getElementById('ant-privada-btn')?.addEventListener('click', () => {
    _antPrivada = !_antPrivada;
    antRenderDestChips();
  });
  antRenderPrivadaBtn();

  document.getElementById('ant-composer-texto')?.addEventListener('input', antActualizarContador);
  document.getElementById('ant-programar-btn')?.addEventListener('click', () => antProgramar(false));
  document.getElementById('ant-ahora-btn')?.addEventListener('click', () => antProgramar(true));

  document.getElementById('ant-cal-prev')?.addEventListener('click', () => antCalMover(-1));
  document.getElementById('ant-cal-next')?.addEventListener('click', () => antCalMover(1));
  document.getElementById('ant-met-btn')?.addEventListener('click', antActualizarMetricas);

  // Al volver del enlace mágico o de la autorización de X
  _sb?.auth.onAuthStateChange(() => {
    if (document.getElementById('view-antena')?.classList.contains('active')) initAntena();
  });

  if (window.location.hash.startsWith('#antena-')) {
    const hash = window.location.hash;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    const MSG = {
      '#antena-x-conectada':  '📡 ¡Cuenta de X conectada!',
      '#antena-x-error':      'La conexión con X falló. Intenta de nuevo.',
      '#antena-fb-conectada': '📡 ¡Páginas de Facebook conectadas!',
      '#antena-fb-error':     'La conexión con Facebook falló. Intenta de nuevo.',
      '#antena-fb-sinpaginas': 'Facebook no devolvió Páginas. ¿Tu usuario administra alguna Página?',
    };
    setTimeout(() => {
      if (typeof toast === 'function' && MSG[hash]) toast(MSG[hash]);
      if (typeof verificarSesion === 'function' && verificarSesion() && typeof switchView === 'function') {
        switchView('view-antena');
      }
    }, 600);
  }
});
