'use strict';

/* ─────────────────────────────────────────────
   ANTENA 📡 — gestión de redes sociales (Fase 1)
   F.A.R.O. transmite: conectar cuentas, programar
   publicaciones y ver métricas de X, Facebook,
   YouTube y TikTok.

   Fase 1 (esta): sesión real con enlace mágico
   (Supabase Auth) + esqueleto del panel.
   Los tokens OAuth JAMÁS llegan a este código:
   viven cifrados en el servidor (Edge Functions).
───────────────────────────────────────────── */

const ANT_T_CUENTAS = 'antena_cuentas';
const ANT_T_PUBS    = 'antena_publicaciones';

const ANT_PLATAFORMAS = [
  { id: 'x',        nombre: 'X (Twitter)',      icon: 'fa-brands fa-x-twitter', cls: 'ant-x',  fase: 'Disponible en la Fase 2' },
  { id: 'facebook', nombre: 'Facebook Páginas', icon: 'fa-brands fa-facebook',  cls: 'ant-fb', fase: 'Disponible en la Fase 3' },
  { id: 'youtube',  nombre: 'YouTube',          icon: 'fa-brands fa-youtube',   cls: 'ant-yt', fase: 'Disponible en la Fase 5' },
  { id: 'tiktok',   nombre: 'TikTok',           icon: 'fa-brands fa-tiktok',    cls: 'ant-tk', fase: 'Disponible en la Fase 5' },
];

let _antSession = null;

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

  await Promise.all([antRenderCuentas(), antRenderPublicaciones()]);
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

  let cuentas = [];
  const { data, error } = await _sb.from(ANT_T_CUENTAS)
    .select('id, plataforma, nombre_visible, estado, conectada_at');
  if (error) console.error('[Antena] Error cargando cuentas:', error);
  else cuentas = data || [];

  grid.innerHTML = ANT_PLATAFORMAS.map(p => {
    const c = cuentas.find(x => x.plataforma === p.id);
    if (c) {
      const alerta = c.estado === 'requiere_reconexion';
      return `<div class="ant-plat-card ant-plat-conectada">
        <span class="ant-plat-icon ${p.cls}"><i class="${p.icon}"></i></span>
        <div class="ant-plat-info">
          <span class="ant-plat-nombre">${p.nombre}</span>
          <span class="ant-plat-estado ${alerta ? 'ant-estado-alerta' : 'ant-estado-ok'}">
            ${alerta ? '⚠️ Requiere reconexión' : `✓ ${antEsc(c.nombre_visible || 'Conectada')}`}
          </span>
        </div>
      </div>`;
    }
    return `<div class="ant-plat-card">
      <span class="ant-plat-icon ${p.cls}"><i class="${p.icon}"></i></span>
      <div class="ant-plat-info">
        <span class="ant-plat-nombre">${p.nombre}</span>
        <span class="ant-plat-estado ant-estado-pronto">${p.fase}</span>
      </div>
    </div>`;
  }).join('');
}

/* ── Publicaciones ── */

async function antRenderPublicaciones() {
  const list    = document.getElementById('ant-pubs-list');
  const emptyEl = document.getElementById('ant-pubs-empty');
  if (!list) return;

  let pubs = [];
  const { data, error } = await _sb.from(ANT_T_PUBS)
    .select('*')
    .in('estado', ['borrador', 'programada', 'publicando', 'error'])
    .order('programada_at', { ascending: true });
  if (error) console.error('[Antena] Error cargando publicaciones:', error);
  else pubs = data || [];

  if (emptyEl) emptyEl.style.display = pubs.length ? 'none' : 'block';

  const ESTADO_LBL = {
    borrador: '📝 Borrador', programada: '⏰ Programada',
    publicando: '📤 Publicando…', error: '❌ Error',
  };
  list.innerHTML = pubs.map(p => `
    <div class="ant-pub-card">
      <div class="ant-pub-body">${antEsc((p.cuerpo || p.titulo || '').slice(0, 120))}</div>
      <div class="ant-pub-meta">
        <span class="red-badge red-badge-tipo">${ESTADO_LBL[p.estado] || p.estado}</span>
        ${p.programada_at ? `<span class="ant-pub-fecha"><i class="fa-regular fa-clock"></i> ${new Date(p.programada_at).toLocaleString('es')}</span>` : ''}
      </div>
    </div>`).join('');
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

  // Al volver del enlace mágico (o al expirar la sesión), refrescar la vista
  _sb?.auth.onAuthStateChange(() => {
    if (document.getElementById('view-antena')?.classList.contains('active')) initAntena();
  });
});
