'use strict';

/* ─────────────────────────────────────────────
   ANTENA 📡 — gestión de redes sociales (Fase 2)
   Sesión con enlace mágico + conexión OAuth de X
   + compositor con programación. El publicador
   (Edge Function antena-publicar) despierta cada
   minuto vía pg_cron y envía lo que corresponda.
   Los tokens OAuth JAMÁS llegan a este código.
───────────────────────────────────────────── */

const ANT_T_CUENTAS  = 'antena_cuentas';
const ANT_T_PUBS     = 'antena_publicaciones';
const ANT_T_DESTINOS = 'antena_destinos';

const ANT_PLATAFORMAS = [
  { id: 'x',        nombre: 'X (Twitter)',      icon: 'fa-brands fa-x-twitter', cls: 'ant-x',  conectable: true },
  { id: 'facebook', nombre: 'Facebook Páginas', icon: 'fa-brands fa-facebook',  cls: 'ant-fb', fase: 'Disponible en la Fase 3' },
  { id: 'youtube',  nombre: 'YouTube',          icon: 'fa-brands fa-youtube',   cls: 'ant-yt', fase: 'Disponible en la Fase 5' },
  { id: 'tiktok',   nombre: 'TikTok',           icon: 'fa-brands fa-tiktok',    cls: 'ant-tk', fase: 'Disponible en la Fase 5' },
];

const ANT_ESTADO_LBL = {
  borrador: '📝 Borrador', programada: '⏰ Programada', publicando: '📤 Publicando…',
  publicada: '✅ Publicada', error: '❌ Error', cancelada: '🚫 Cancelada',
};

let _antSession = null;
let _antCuentas = [];

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
    const c = _antCuentas.find(x => x.plataforma === p.id);
    if (c) {
      const alerta = c.estado === 'requiere_reconexion';
      return `<div class="ant-plat-card ant-plat-conectada">
        <span class="ant-plat-icon ${p.cls}"><i class="${p.icon}"></i></span>
        <div class="ant-plat-info">
          <span class="ant-plat-nombre">${p.nombre}</span>
          <span class="ant-plat-estado ${alerta ? 'ant-estado-alerta' : 'ant-estado-ok'}">
            ${alerta ? '⚠️ Requiere reconexión' : `✓ ${antEsc(c.nombre_visible || 'Conectada')}`}
          </span>
          ${alerta
            ? `<button type="button" class="ant-conectar-btn" data-conectar="${p.id}">Reconectar</button>`
            : `<button type="button" class="ant-desconectar-btn" data-desconectar="${c.id}">Desconectar</button>`}
        </div>
      </div>`;
    }
    return `<div class="ant-plat-card">
      <span class="ant-plat-icon ${p.cls}"><i class="${p.icon}"></i></span>
      <div class="ant-plat-info">
        <span class="ant-plat-nombre">${p.nombre}</span>
        ${p.conectable
          ? `<button type="button" class="ant-conectar-btn" data-conectar="${p.id}">
               <i class="fa-solid fa-plug"></i> Conectar</button>`
          : `<span class="ant-plat-estado ant-estado-pronto">${p.fase}</span>`}
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-conectar]').forEach(btn =>
    btn.addEventListener('click', () => antConectar(btn.dataset.conectar)));
  grid.querySelectorAll('[data-desconectar]').forEach(btn =>
    btn.addEventListener('click', () => antDesconectar(Number(btn.dataset.desconectar))));

  // El compositor aparece solo si hay al menos una cuenta activa
  const composer = document.getElementById('ant-composer');
  if (composer) {
    composer.style.display = _antCuentas.some(c => c.estado === 'activa') ? 'block' : 'none';
  }
}

async function antConectar(plataforma) {
  if (plataforma !== 'x') return;
  if (typeof toast === 'function') toast('Abriendo autorización de X…');
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

  const activas = _antCuentas.filter(c => c.estado === 'activa');
  if (!activas.length) { if (typeof toast === 'function') toast('Conecta una cuenta primero'); return; }

  const { data: pub, error } = await _sb.from(ANT_T_PUBS).insert({
    usuario_id: _antSession.user.id,
    cuerpo: texto,
    programada_at: fecha.toISOString(),
    estado: 'programada',
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
  }));
  list.querySelectorAll('[data-borrar]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('¿Borrar definitivamente?')) return;
    await _sb.from(ANT_T_PUBS).delete().eq('id', btn.dataset.borrar);
    antRenderPublicaciones();
  }));

  if (hechas) {
    hechas.innerHTML = publicadas.map(p => {
      const d = (p.destinos || []).find(x => x.post_externo_id);
      return `<div class="ant-pub-card ant-pub-hecha">
        <div class="ant-pub-body">${antEsc((p.cuerpo || '').slice(0, 120))}</div>
        <div class="ant-pub-meta">
          <span class="red-badge red-badge-tipo">✅ Publicada</span>
          ${d?.post_externo_id ? `<a class="ant-pub-link" href="https://x.com/i/web/status/${encodeURIComponent(d.post_externo_id)}" target="_blank" rel="noopener">Ver en X <i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
        </div>
      </div>`;
    }).join('') || '<p class="fin-empty">Aún nada publicado.</p>';
  }
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

  document.getElementById('ant-composer-texto')?.addEventListener('input', antActualizarContador);
  document.getElementById('ant-programar-btn')?.addEventListener('click', () => antProgramar(false));
  document.getElementById('ant-ahora-btn')?.addEventListener('click', () => antProgramar(true));

  // Al volver del enlace mágico o de la autorización de X
  _sb?.auth.onAuthStateChange(() => {
    if (document.getElementById('view-antena')?.classList.contains('active')) initAntena();
  });

  if (window.location.hash.startsWith('#antena-x-')) {
    const ok = window.location.hash === '#antena-x-conectada';
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setTimeout(() => {
      if (typeof toast === 'function') {
        toast(ok ? '📡 ¡Cuenta de X conectada!' : 'La conexión con X falló. Intenta de nuevo.');
      }
      if (typeof verificarSesion === 'function' && verificarSesion() && typeof switchView === 'function') {
        switchView('view-antena');
      }
    }, 600);
  }
});
