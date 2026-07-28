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
 * 1. Los cuatro usuarios creados en Supabase (Authentication → Users),
 *    con sus correos reales y contraseñas NUEVAS: los cuatro PIN
 *    anteriores estuvieron en un repositorio público y se dan por
 *    quemados.
 * 2. Una fila por cada uno en la tabla familia_miembros, que dice qué
 *    miembro es cada usuario. La crea y la siembra
 *    supabase/sql/seguridad_familia.sql.
 * 3. Apagar «Allow new users to sign up» en Authentication → Providers
 *    → Email, o cualquiera se registra en el proyecto.
 *
 * Los correos NO están en este archivo ni en ninguno del repositorio, y
 * es a propósito: son los correos reales de la familia y este código lo
 * lee cualquiera. Quien entra escribe el suyo.
 *
 * NO se aplica la seguridad por fila hasta que esto esté probado: el
 * orden está en PLAN-FARO-PRIVADO.md y alterarlo deja la casa sin luz.
 * ════════════════════════════════════════════════════════════════════
 */

/* Los cuatro de la casa. El id es el mismo que en MEMBERS de app.js: de ahí
   cuelga el progreso de cada quien, así que no se cambia.
   AQUÍ NO HAY CORREOS, y es a propósito: este archivo lo lee cualquiera que
   abra la aplicación, así que los correos de la familia no viven en él. Quién
   es cada quien lo dice la tabla familia_miembros DESPUÉS de entrar. Los
   nombres sí se quedan: ya están por toda la aplicación y no son un secreto. */
const MIEMBROS = {
  josue:   { nombre: 'Josué Edmundo' },
  evelyn:  { nombre: 'Evelyn Sarahí' },
  jael:    { nombre: 'Jael' },
  angelly: { nombre: 'Angelly' },
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

/* Quién es el que entró, según la BASE DE DATOS.
   Se pregunta a la tabla familia_miembros, que solo un administrador puede
   escribir. NO se usa user_metadata: en Supabase el propio usuario puede
   cambiarse sus metadatos con updateUser(), así que decidir permisos con eso
   es dejar que cada quien se ponga el sello que quiera. Y tampoco se deduce
   del correo, que era adivinar.
   Devuelve null si el autenticado no tiene fila: entró en el proyecto, pero
   no es de la casa. */
async function _quienEs(sesion) {
  if (!sesion || !sesion.user || !_authSb) return null;
  try {
    const { data, error } = await _authSb
      .from('familia_miembros')
      .select('miembro')
      .eq('user_id', sesion.user.id)
      .maybeSingle();
    if (error || !data) return null;
    const id = String(data.miembro || '').toLowerCase();
    if (!MIEMBROS[id]) return null;
    return { user: id, nombre: MIEMBROS[id].nombre };
  } catch (_) {
    return null;
  }
}

/* ─────────────────────────────────────────────
   API PÚBLICA · la misma forma de siempre
───────────────────────────────────────────── */

/* Síncrona a propósito: ver la nota del contrato, arriba. */
function verificarSesion() {
  return _sesionActual;
}

/* Asíncrona: quien la llame debe esperarla. Solo la usa la pantalla de login. */
async function iniciarSesion(correo, contrasena) {
  if (!_authSb) return false;
  const { data, error } = await _authSb.auth.signInWithPassword({
    email: String(correo || '').trim(),
    password: String(contrasena),
  });
  if (error || !data || !data.session) return false;
  _sesionActual = await _quienEs(data.session);
  /* Autenticado pero sin fila en familia_miembros: no es de la casa. Se le
     cierra la sesión en el acto, para no dejar un token vivo dando vueltas. */
  if (!_sesionActual) { try { await _authSb.auth.signOut(); } catch (_) {} }
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
  const correoEl     = document.getElementById('login-correo');
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
      _sesionActual = await _quienEs(data && data.session);
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
      else if (sesion && !_sesionActual) _quienEs(sesion).then(s => { if (s) _sesionActual = s; });
    });
  }

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errEl) errEl.hidden = true;
      if (btnEl) { btnEl.disabled = true; btnEl.dataset.txt = btnEl.innerHTML; btnEl.textContent = 'Entrando…'; }

      let ok = false;
      try { ok = await iniciarSesion(correoEl.value, passEl.value); } catch (_) { ok = false; }

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
