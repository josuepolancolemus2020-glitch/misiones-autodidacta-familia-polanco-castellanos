const CACHE_NAME = 'faro-app-v1';
const STATIC_ASSETS = [
  './img/icon-192.png',
  './img/icon-512.png',
  './img/leonardo-da-vinci.jpg',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Al instalar: pre-cachea solo imágenes y recursos externos estáticos
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
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
    // Archivos propios (HTML, CSS, JS): siempre va a la red primero
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
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
      // configurado — eso no se puede elegir ni subir desde la web.
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
