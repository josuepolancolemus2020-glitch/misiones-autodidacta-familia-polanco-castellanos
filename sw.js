const CACHE_NAME = 'faro-app-v16';

/* ══════════════════════════════════════════════════════════════════
   ¿SE PUEDE GUARDAR ESTA RESPUESTA?
   ──────────────────────────────────────────────────────────────────
   Esta comprobación existe por F.A.R.O detrás de una puerta con
   contraseña (Cloudflare Access). Cuando la sesión de la puerta
   caduca, el servidor NO devuelve el archivo pedido: devuelve la
   pantalla de inicio de sesión, en HTML y con código 200, que para el
   navegador es una respuesta perfectamente buena.

   Sin esta comprobación, el service worker guardaba esa pantalla
   COMO SI FUERA js/app.js. Y a partir de ahí la aplicación quedaba
   envenenada: recargar no arregla nada, porque la copia guardada
   sirve la basura una y otra vez. Es la avería más difícil de
   arreglar para quien solo tiene el teléfono en la mano.

   Tres señales delatan a un intruso, y basta una:
     · la respuesta no es correcta (no ok);
     · hubo redirección, que es como se llega a una pantalla de
       inicio de sesión;
     · viene HTML cuando se pidió un script, una hoja de estilo, una
       fuente o una imagen.
   ══════════════════════════════════════════════════════════════════ */
function sePuedeGuardar(peticion, respuesta) {
  if (!respuesta || !respuesta.ok) return false;
  if (respuesta.redirected) return false;
  if (respuesta.type === 'opaqueredirect') return false;

  const tipo = respuesta.headers.get('content-type') || '';
  const esHtml = tipo.includes('text/html');
  const destino = peticion.destination;
  if (esHtml && destino && destino !== 'document' && destino !== '') return false;

  return true;
}
const STATIC_ASSETS = [
  './img/icon-192.png',
  './img/icon-512.png',
  './img/leonardo-da-vinci.jpg',
  // La librería de Supabase se pre-cachea desde la instalación, no solo cuando
  // una carga con red la deja guardada de paso. Sin este archivo no hay cliente,
  // y sin cliente nadie entra ni ve un dato: es lo único externo que, si falta,
  // deja la aplicación inservible en vez de fea.
  './js/supabase.min.js',
  // El diccionario del corrector: pesa como una foto y con él la caza
  // de tecleos («conveza» → «convenza») funciona también sin conexión.
  './js/data/dicc/es_HN.aff',
  './js/data/dicc/es_HN.dic',
  './js/data/dicc/es_extra.dic',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Al instalar: pre-cachea imágenes, la librería de Supabase y los externos.
// Uno por uno y comprobando lo que llega, en vez de cache.addAll: addAll no
// mira el contenido, así que si la instalación ocurre con la sesión de la
// puerta caducada guardaría la pantalla de inicio de sesión como si fuera la
// librería de Supabase, y sin esa librería no entra nadie. Y addAll es todo o
// nada: un externo caído dejaba la instalación entera sin hacer.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => Promise.all(
      STATIC_ASSETS.map(url =>
        fetch(url)
          .then(resp => { if (sePuedeGuardar(new Request(url), resp)) return cache.put(url, resp); })
          .catch(() => {})
      )
    ))
  );
});

// Al activar: elimina cachés viejos y toma control inmediato
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-first para HTML/CSS/JS, cache-first para imágenes externas
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === location.origin;
  const isImage = event.request.destination === 'image';

  if (isLocal && !isImage) {
    // Archivos propios (HTML, CSS, JS): siempre va a la red primero.
    // Se devuelve lo que llegue, pero solo se GUARDA lo que pase el filtro:
    // así, si la puerta contesta con su pantalla de inicio de sesión, el
    // usuario la ve y entra, pero esa pantalla no se queda guardada ocupando
    // el sitio del archivo de verdad.
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (sePuedeGuardar(event.request, response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Imágenes y recursos externos: cache-first (no cambian frecuentemente)
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});

// Notificaciones push del Chat Familiar (llegan aunque la app esté cerrada)
self.addEventListener('push', event => {
  let payload = { title: 'F.A.R.O.', body: 'Tienes un mensaje nuevo en el Chat Familiar.' };
  try {
    if (event.data) payload = event.data.json();
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(payload.title || 'F.A.R.O.', {
      body: payload.body || '',
      icon: './img/icon-192.png',
      badge: './img/icon-192.png',
      tag: 'faro-chat',
      // Vibración fuerte (Android) y notificación persistente hasta
      // que se toque, para que sea difícil pasarla por alto. El
      // sonido en sí lo decide Android con su tono de notificación
      // configurado: eso no se puede elegir ni subir desde la web.
      vibrate: [300, 150, 300, 150, 300],
      requireInteraction: true,
      renotify: true,
      data: { url: payload.url || './index.html?view=chat' },
    })
  );
});

// Al tocar la notificación: abre o enfoca la app en el Chat Familiar
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html?view=chat';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      for (const client of clientsArr) {
        if ('focus' in client) {
          client.postMessage({ type: 'faro-open-chat' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
