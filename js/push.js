'use strict';

// Llave pública VAPID — esta sí es segura de exponer en el cliente,
// es el equivalente a la "llave pública" de una firma digital. La
// llave privada vive únicamente como secreto en la Edge Function de
// Supabase y nunca debe estar en este repositorio.
const PUSH_VAPID_PUBLIC_KEY = 'BMPLmCo3mnJv9jSB0AkRWiahzDMtLEx8sIVSVqltmSLoVSkaS0pXIQp_PYRWloccsyTeccFRM57oskFUqnZn2AY';
const PUSH_SUBSCRIPTIONS_TABLE = 'push_subscriptions';
const PUSH_DISMISS_KEY = 'faro_push_banner_dismissed';

function _pushUrlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function pushIsSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function pushIsIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function pushIsStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function _pushCurrentMember() {
  const session = (typeof verificarSesion === 'function') ? verificarSesion() : null;
  if (session) return { id: session.user, nombre: session.nombre };
  if (typeof load === 'function' && typeof getMember === 'function') {
    const s = load();
    const m = getMember(s.currentMember);
    return { id: m.id, nombre: m.short };
  }
  return { id: 'familia', nombre: 'Familia' };
}

// Intenta activar las notificaciones. Devuelve:
//   true               -> activadas y guardadas correctamente
//   'ios-not-installed' -> en iPhone hace falta agregar la app a la pantalla de inicio
//   'denied'            -> el usuario bloqueó el permiso
//   false               -> no se pudo (no soportado, error de red, etc.)
async function pushSubscribe() {
  if (!pushIsSupported() || !_sb) return false;
  if (pushIsIOS() && !pushIsStandalone()) return 'ios-not-installed';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _pushUrlBase64ToUint8Array(PUSH_VAPID_PUBLIC_KEY),
    });
  }

  const me  = _pushCurrentMember();
  const sub = subscription.toJSON();

  const { error } = await _sb.from(PUSH_SUBSCRIPTIONS_TABLE).upsert({
    member_id: me.id,
    nombre:    me.nombre,
    endpoint:  sub.endpoint,
    p256dh:    sub.keys.p256dh,
    auth:      sub.keys.auth,
  }, { onConflict: 'endpoint' });

  if (error) {
    console.error('[Push] Error guardando suscripción:', error);
    return false;
  }
  return true;
}

function pushUpdateBannerUI() {
  const banner = document.getElementById('push-banner');
  const text   = document.getElementById('push-banner-text');
  const btn    = document.getElementById('push-banner-btn');
  if (!banner || !text || !btn) return;

  if (!pushIsSupported() || localStorage.getItem(PUSH_DISMISS_KEY) === '1' || Notification.permission === 'granted') {
    banner.style.display = 'none';
    return;
  }

  if (pushIsIOS() && !pushIsStandalone()) {
    text.textContent = '📱 Para recibir notificaciones en iPhone: toca Compartir y luego "Agregar a pantalla de inicio".';
    btn.style.display = 'none';
  } else if (Notification.permission === 'denied') {
    text.textContent = '🔔 Bloqueaste las notificaciones. Actívalas desde la configuración del navegador para este sitio.';
    btn.style.display = 'none';
  } else {
    text.textContent = '🔔 Activa las notificaciones para no perderte ningún mensaje del chat.';
    btn.style.display = '';
  }

  banner.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
  // Si ya había permiso concedido antes, vuelve a guardar la
  // suscripción en silencio (por si cambió de dispositivo o se borró
  // la fila en Supabase).
  if (pushIsSupported() && Notification.permission === 'granted') {
    pushSubscribe();
  }

  pushUpdateBannerUI();

  document.getElementById('push-banner-btn')?.addEventListener('click', async () => {
    const result = await pushSubscribe();
    if (result === true) {
      if (typeof toast === 'function') toast('🔔 Notificaciones activadas');
    } else if (result === 'ios-not-installed') {
      if (typeof toast === 'function') toast('Primero agrega la app a tu pantalla de inicio');
    } else {
      if (typeof toast === 'function') toast('No se pudieron activar las notificaciones');
    }
    pushUpdateBannerUI();
  });

  document.getElementById('push-banner-dismiss')?.addEventListener('click', () => {
    localStorage.setItem(PUSH_DISMISS_KEY, '1');
    pushUpdateBannerUI();
  });
});
