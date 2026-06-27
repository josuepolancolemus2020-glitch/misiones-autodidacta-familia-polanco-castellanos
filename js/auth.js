'use strict';

/*
 * Este "login" es solo para elegir perfil y personalizar el saludo.
 * El sitio es estático y el repositorio es público: cualquiera puede
 * leer este archivo directamente, así que los PIN de abajo NO protegen
 * nada — no reutilices aquí una contraseña real de otro lugar.
 */

const FARO_USERS = {
  josue:   { nombre: 'Josué Edmundo', pin: '4821' },
  evelyn:  { nombre: 'Evelyn Sarahí', pin: '3357' },
  jael:    { nombre: 'Jael',          pin: '1209' },
  angelly: { nombre: 'Angelly',       pin: '7765' },
};

const AUTH_KEY = 'faro_session';

function iniciarSesion(user, pass) {
  const u = FARO_USERS[user];
  if (!u || String(pass) !== String(u.pin)) return false;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user, nombre: u.nombre }));
  } catch (_) {}
  return true;
}

function verificarSesion() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !FARO_USERS[data.user]) return null;
    return data;
  } catch (_) {
    return null;
  }
}

function cerrarSesion() {
  try { localStorage.removeItem(AUTH_KEY); } catch (_) {}
}

/* ─────────────────────────────────────────────
   PANTALLA DE LOGIN
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen  = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  const form          = document.getElementById('login-form');
  const userEl        = document.getElementById('login-user');
  const pinEl         = document.getElementById('login-pin');
  const errEl         = document.getElementById('login-error');

  function showApp() {
    if (loginScreen)  loginScreen.style.display  = 'none';
    if (appContainer) appContainer.style.display = '';
  }
  function showLogin() {
    if (appContainer) appContainer.style.display = 'none';
    if (loginScreen)  loginScreen.style.display  = '';
  }

  if (verificarSesion()) {
    showApp();
  } else {
    showLogin();
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const selectedUser = userEl.value;
      const ok = iniciarSesion(selectedUser, pinEl.value);

      if (!ok) {
        if (errEl) errEl.hidden = false;
        pinEl.value = '';
        pinEl.focus();
        return;
      }

      if (errEl) errEl.hidden = true;

      // El miembro que inició sesión pasa a ser el perfil activo de la app
      if (typeof load === 'function' && typeof save === 'function') {
        const s = load();
        s.currentMember = selectedUser;
        save(s);
      }

      form.reset();
      showApp();
      if (typeof renderHome === 'function') renderHome();
    });
  }

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    cerrarSesion();
    showLogin();
  });
});
