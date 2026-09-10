const CACHE_NAME = 'faro-app-v97';

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

/* ⚠️ LA LISTA DEL ARRANQUE SE SACA DE index.html, NO SE ESCRIBE AQUÍ.
   Son 32 archivos y suben cada vez que se añade una herramienta. Una lista a
   mano en este archivo estaría equivocada el día que alguien añada un
   `<script>` y nadie lo notaría: la aplicación seguiría abriendo, solo que
   otra vez lenta, que es justo el fallo que no se ve. Es la misma regla que
   las materias de Videos M.E.T.A.S y las cuentas del Estudio Mayor.
   Si el análisis falla se devuelve lo mínimo: entonces el primer arranque
   tras una versión nueva va por la red, que es lo que pasaba siempre. */
async function listaDelArranque() {
  const lista = ['./index.html'];
  try {
    const resp = await fetch('./index.html', { cache: 'no-cache' });
    if (!sePuedeGuardar(new Request('./index.html'), resp)) return lista;
    const html = await resp.text();
    const re = /(?:src|href)="([^"]+)"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      const u = m[1];
      if (!/^(js|css|img)\//.test(u)) continue;   // nada externo, nada de data: ni #
      if (lista.indexOf('./' + u) === -1) lista.push('./' + u);
    }
  } catch (_) {}
  return lista;
}

// Al instalar: pre-cachea imágenes, la librería de Supabase y los externos.
// Uno por uno y comprobando lo que llega, en vez de cache.addAll: addAll no
// mira el contenido, así que si la instalación ocurre con la sesión de la
// puerta caducada guardaría la pantalla de inicio de sesión como si fuera la
// librería de Supabase, y sin esa librería no entra nadie. Y addAll es todo o
// nada: un externo caído dejaba la instalación entera sin hacer.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    /* El arranque entero va aquí dentro. Cuesta unos dos megas UNA vez por
       versión, y ocurre en segundo plano mientras la copia anterior sigue
       sirviendo la aplicación al instante: nadie espera por esto. Lo que
       compra es que el primer arranque después de publicar también sea
       instantáneo, en vez de ser el lento de siempre. */
    const urls = STATIC_ASSETS.concat(await listaDelArranque());
    await Promise.all(urls.map(url =>
      fetch(url, { cache: 'no-cache' })
        .then(resp => { if (sePuedeGuardar(new Request(url), resp)) return cache.put(url, resp); })
        .catch(() => {})
    ));
  })());
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
    /* ⚠️ ARCHIVOS PROPIOS: PRIMERO LA COPIA GUARDADA, Y SIN TOCAR LA RED.
       Hasta la v91 esto iba a la red primero y además revalidando
       (`cache: 'no-cache'`), o sea que CADA UNO de los 32 archivos del
       arranque esperaba un viaje completo al servidor antes de pintarse
       nada. En una computadora no se nota; en el teléfono del autor, con
       la señal de la casa, eran QUINCE SEGUNDOS de pantalla en blanco cada
       vez que abría la aplicación. Una aplicación que tarda quince
       segundos en abrir es una aplicación que no se abre para apuntar un
       gasto de treinta lempiras.

       ⚠️ Y ESTO NO DEVUELVE EL FALLO DEL 28 DE AGOSTO DE 2026, que es lo
       primero que hay que comprobar antes de tocar este archivo. Aquel día
       llegó el HTML NUEVO con el JavaScript VIEJO (el rótulo MATERIA salía
       y debajo no había ni un chip) y la causa fue MEZCLAR DOS ORÍGENES: el
       HTML venía de la red y el JavaScript de la caché HTTP del navegador.
       Aquí no puede pasar, y por construcción: todo sale del MISMO caché,
       y ese caché lleva la versión en el nombre (`CACHE_NAME`). Un
       despliegue nuevo crea un caché nuevo, entero, y al activarse borra el
       viejo de una vez. O se sirve toda la versión anterior o toda la
       nueva; media versión no existe.

       Y por eso aquí NO se revalida contra el servidor: escribir lo nuevo
       dentro del caché de la versión vieja es exactamente cómo se fabrica
       esa media versión. Lo nuevo entra por la puerta de `install`, que
       llena su propio caché aparte.

       La red solo se toca cuando el archivo NO está guardado: la primera
       vez, o si el pre-cacheo no llegó a terminar. Y lo que llegue solo se
       guarda si pasa el filtro de la puerta. */
    event.respondWith((async () => {
      /* Una notificación del chat abre `index.html?view=chat`. Sin
         ignoreSearch eso no casa con el `index.html` guardado y el arranque
         desde una notificación volvería a ser el lento. */
      const guardada = await caches.match(event.request, { ignoreSearch: true });
      if (guardada) return guardada;
      try {
        const response = await fetch(event.request);
        if (sePuedeGuardar(event.request, response)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      } catch (e) {
        /* Sin red y sin copia. Una navegación cae en el index guardado
           (que es la aplicación entera) antes que en la pantalla de
           dinosaurio del navegador. */
        if (event.request.mode === 'navigate') {
          const index = await caches.match('./index.html');
          if (index) return index;
        }
        throw e;
      }
    })());
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
