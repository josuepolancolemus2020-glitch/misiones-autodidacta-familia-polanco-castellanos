'use strict';

/*
 * ════════════════════════════════════════════════════════════════════
 * F.A.R.O · La puerta de verdad
 * ════════════════════════════════════════════════════════════════════
 * Autenticación real con Supabase Auth. Sustituye al «login» anterior,
 * que solo elegía perfil y guardaba la elección en el teléfono, con los
 * cuatro PIN de la familia escritos en este mismo archivo.
 *
 * Por qué el cambio no es cosmético: la seguridad por fila de la base de
 * datos necesita UNA IDENTIDAD QUE COMPROBAR. Sin esto, ninguna política
 * de acceso se puede escribir, y por eso las tablas de la casa quedaron
 * abiertas a cualquiera con la clave publicable, que va en el código del
 * navegador porque así se diseñó y así debe ser.
 *
 * ── El contrato, que NO cambia ──────────────────────────────────────
 * Ocho archivos llaman a verificarSesion() de forma SÍNCRONA (app.js,
 * chat.js, finanzas.js, push.js, destellos.js, redaccion.js, antena.js).
 * Supabase Auth es asíncrono. Cambiar el contrato obligaría a tocar los
 * ocho y a arriesgar la aplicación entera, así que:
 *
 *   · verificarSesion() sigue siendo síncrona y devuelve lo mismo que
 *     antes, { user, nombre } o null, leyendo de una copia en memoria;
 *   · lo asíncrono es SOLO restaurar la sesión al arrancar. Mientras eso
 *     ocurre no se pinta nada, y cuando termina se decide qué mostrar.
 *
 * ── Qué hay que configurar para que esto funcione ───────────────────
 * 1. Crear los cuatro usuarios en Supabase (Authentication → Users) con
 *    los correos de la tabla MIEMBROS de abajo.
 * 2. Contraseñas NUEVAS: los cuatro PIN anteriores estuvieron en un
 *    repositorio público y se dan por quemados.
 * 3. Con correos inventados (los de @faro.local) hay que desactivar la
 *    confirmación por correo en Authentication → Providers → Email, o
 *    los usuarios nunca quedan confirmados y nadie entra.
 *
 * NO se aplica la seguridad por fila hasta que esto esté probado: el
 * orden está en PLAN-FARO-PRIVADO.md y alterarlo deja la casa sin luz.
 * ════════════════════════════════════════════════════════════════════
 */

/* Los cuatro de la casa. El id es el mismo que en MEMBERS de app.js: de ahí
   cuelga el progreso de cada quien, así que no se cambia. El correo es solo
   la credencial de entrada, y puede ser real o inventado mientras coincida
   con el usuario creado en Supabase. */
const MIEMBROS = {
  josue:   { nombre: 'Josué Edmundo', correo: 'josue@faro.local' },
  evelyn:  { nombre: 'Evelyn Sarahí', correo: 'evelyn@faro.local' },
  jael:    { nombre: 'Jael',          correo: 'jael@faro.local' },
  angelly: { nombre: 'Angelly',       correo: 'angelly@faro.local' },
};

const AUTH_KEY = 'faro_session';   /* solo para borrar el rastro del login viejo */

/* ── El cliente ─────────────────────────────────────────────────────
   Mismo proyecto y misma clave publicable que ya usa el chat. Una clave
   publicable en el navegador es correcta: lo que la vuelve segura es la
   seguridad por fila, no esconderla. Este archivo carga antes que los
   demás, así que deja el cliente a mano en window.faroSb para que el
   resto del proyecto pueda dejar de crear el suyo. */
const AUTH_SUPABASE_URL = 'https://bzrnjvalpwlcnpszvwim.supabase.co';
const AUTH_SUPABASE_KEY = 'sb_publishable_74mJW5LoxPZOWtIi7YrBEw_0y9JjSfM';

/* ⚠️ UN SOLO CLIENTE EN TODA LA APLICACIÓN, y este es. No se crea otro.
   Por qué está escrito tan fuerte: la primera versión de este archivo creaba su
   propio cliente con storageKey aparte, mientras chat.js creaba el suyo y de él
   colgaban los siete módulos que tocan la nube (chat, finanzas, inventario,
   push, antena, destellos, redaccion). Resultado: la sesión vivía en un cliente
   y TODOS los datos pasaban por el otro, que iba como anónimo. Con la seguridad
   por fila encendida eso deja la casa muda (cero filas, sin error, como si los
   datos se hubieran perdido) sin cerrarle la puerta a nadie de fuera.
   Tampoco se le pone storageKey propio: dos clientes sobre el mismo almacén se
   pelean al renovar el token. Uno, y basta. */
const _authSb = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY, {
      auth: {
        persistSession: true,     /* la sesión sobrevive a cerrar la aplicación */
        autoRefreshToken: true,   /* y se renueva sola: nadie escribe la clave a diario */
      },
    })
  : null;
window.faroSb = _authSb;

/* La copia en memoria de quién entró. Es lo único que lee verificarSesion(). */
let _sesionActual = null;

/* Traduce la sesión de Supabase al { user, nombre } que espera la aplicación.
   El id del miembro viaja en los metadatos del usuario; si faltara, se deduce
   del correo, que es la parte de antes de la arroba. */
function _mapearSesion(sesion) {
  if (!sesion || !sesion.user) return null;
  const u = sesion.user;
  let id = (u.user_metadata && u.user_metadata.miembro) || '';
  if (!MIEMBROS[id]) id = String(u.email || '').split('@')[0].toLowerCase();
  if (!MIEMBROS[id]) return null;      /* autenticado, pero no es de la casa */
  return { user: id, nombre: MIEMBROS[id].nombre };
}

/* ─────────────────────────────────────────────
   API PÚBLICA · la misma forma de siempre
───────────────────────────────────────────── */

/* Síncrona a propósito: ver la nota del contrato, arriba. */
function verificarSesion() {
  return _sesionActual;
}

/* Asíncrona: quien la llame debe esperarla. Solo la usa la pantalla de login. */
async function iniciarSesion(user, contrasena) {
  const m = MIEMBROS[user];
  if (!m || !_authSb) return false;
  const { data, error } = await _authSb.auth.signInWithPassword({
    email: m.correo,
    password: String(contrasena),
  });
  if (error || !data || !data.session) return false;
  _sesionActual = _mapearSesion(data.session);
  return !!_sesionActual;
}

async function cerrarSesion() {
  _sesionActual = null;
  try { localStorage.removeItem(AUTH_KEY); } catch (_) {}
  if (_authSb) { try { await _authSb.auth.signOut(); } catch (_) {} }
}

/* ─────────────────────────────────────────────
   PANTALLA DE LOGIN
───────────────────────────────────────────── */

/* Se esconde el login desde el primer instante, antes de que el navegador lo
   pinte. Este archivo carga al final del cuerpo, así que el elemento ya
   existe. Sin esto, a quien ya tiene sesión le parpadea la pantalla de
   entrada mientras se restaura, y eso hace dudar de si entró o no. */
(function ocultarHastaSaber() {
  const l = document.getElementById('login-screen');
  if (l) l.style.visibility = 'hidden';
})();

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen  = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  const form         = document.getElementById('login-form');
  const userEl       = document.getElementById('login-user');
  const passEl       = document.getElementById('login-pass') || document.getElementById('login-pin');
  const errEl        = document.getElementById('login-error');
  const btnEl        = form ? form.querySelector('.login-btn') : null;

  function mostrarApp() {
    if (loginScreen)  { loginScreen.style.display = 'none'; loginScreen.style.visibility = ''; }
    if (appContainer) appContainer.style.display = '';
  }
  function mostrarLogin() {
    if (appContainer) appContainer.style.display = 'none';
    if (loginScreen)  { loginScreen.style.display = ''; loginScreen.style.visibility = ''; }
  }
  function error(msg) {
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  /* Entrar de verdad: además de mostrar la aplicación, el miembro que inició
     sesión pasa a ser el perfil activo. app.js ya corrió su propio arranque
     antes de que la sesión se resolviera, así que hay que volver a pintar. */
  function aplicarSesion() {
    if (typeof load === 'function' && typeof save === 'function' && _sesionActual) {
      const s = load();
      s.currentMember = _sesionActual.user;
      save(s);
    }
    mostrarApp();
    if (typeof renderHome === 'function') renderHome();
  }

  /* ── Restaurar la sesión guardada, si la hay ── */
  (async function restaurar() {
    if (!_authSb) {
      error('No se pudo cargar el servicio de acceso. Revisa la conexión.');
      mostrarLogin();
      return;
    }
    try {
      const { data } = await _authSb.auth.getSession();
      _sesionActual = _mapearSesion(data && data.session);
    } catch (_) {
      _sesionActual = null;
    }
    if (_sesionActual) aplicarSesion();
    else mostrarLogin();
  })();

  /* Si el token caduca o alguien cierra sesión en otra pestaña, se vuelve al
     login en vez de quedarse con una aplicación que ya no puede leer nada. */
  if (_authSb) {
    _authSb.auth.onAuthStateChange((evento, sesion) => {
      if (evento === 'SIGNED_OUT') { _sesionActual = null; mostrarLogin(); }
      else if (sesion) _sesionActual = _mapearSesion(sesion) || _sesionActual;
    });
  }

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errEl) errEl.hidden = true;
      if (btnEl) { btnEl.disabled = true; btnEl.dataset.txt = btnEl.innerHTML; btnEl.textContent = 'Entrando…'; }

      let ok = false;
      try { ok = await iniciarSesion(userEl.value, passEl.value); } catch (_) { ok = false; }

      if (btnEl) { btnEl.disabled = false; if (btnEl.dataset.txt) btnEl.innerHTML = btnEl.dataset.txt; }

      if (!ok) {
        /* El mensaje no dice si falló el usuario o la contraseña: decirlo
           confirmaría qué cuentas existen. Es la lección de la etapa 1 de la
           Ruta de la Casa Cerrada, aplicada a la propia casa. */
        error('No se pudo entrar. Revisa la contraseña e intenta de nuevo.');
        passEl.value = '';
        passEl.focus();
        return;
      }

      form.reset();
      aplicarSesion();
    });
  }

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await cerrarSesion();
    mostrarLogin();
  });
});
