/* DevLocker service worker — lets the site and the Android app open offline
   with the last data you saw.

   - App shell (index.html, app.js, style.css, icons): network first, so
     updates show up immediately; the saved copy is used only when offline.
   - API reads (folders, files, trash, usage, status): network first; every
     successful answer is saved, and replayed when offline.
   - CDN libraries and fonts: their URLs are versioned, so cache first.
   - Writes (upload, edit, delete, move…) always go to the network; offline
     they fail with a clear "You're offline" error. */

const VERSION = 'v1';
const SHELL = `shell-${VERSION}`;
const DATA = `data-${VERSION}`;
const LIBS = `libs-${VERSION}`;
const SHELL_FILES = ['/', '/app.js', '/style.css', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon.svg'];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const MAX_CACHED_FILE = 30 * 1024 * 1024; // don't keep files bigger than this offline

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  const keep = [SHELL, DATA, LIBS];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const offlineJson = (msg) => new Response(JSON.stringify({ error: msg, offline: true }), {
  status: 503, headers: { 'Content-Type': 'application/json' },
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET') {
        e.respondWith(fetch(req).catch(() => offlineJson("You're offline — changes can't be saved right now")));
        return;
      }
      // Leave streaming/large downloads to the browser: ZIPs, ?download, and
      // range requests (video/audio seeking).
      if (url.pathname.startsWith('/api/zip/') || url.searchParams.has('download') || req.headers.has('range')) return;
      if (url.pathname.startsWith('/api/keepalive') || url.pathname.startsWith('/api/cache')) return;
      e.respondWith(apiRead(req, url));
      return;
    }
    if (req.method !== 'GET') return;
    if (req.mode === 'navigate') { e.respondWith(page(req)); return; }
    e.respondWith(networkFirst(req, SHELL));
    return;
  }

  if (req.method === 'GET' && CDN_HOSTS.includes(url.hostname)) e.respondWith(cacheFirst(req));
});

// Top-level page loads: any route serves the app (it's a single-page app).
async function page(req) {
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(SHELL)).put('/', res.clone());
    return res;
  } catch {
    return (await caches.match('/', { cacheName: SHELL })) || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(LIBS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  // Opaque (no-cors <script>/<link>) responses report status 0 but are fine to keep.
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

// API reads. File reads redirect to a signed storage URL that changes every
// time, so the result is stored under the stable /api/... URL instead, and
// re-wrapped so it can also answer <img>/<iframe> loads.
async function apiRead(req, url) {
  const cache = await caches.open(DATA);
  const key = url.origin + url.pathname + url.search;
  try {
    // Default credentials: cookies go to this site only, so the redirect to
    // storage (which answers with a wildcard CORS header) still works.
    const res = await fetch(url.href, { cache: 'no-store' });
    if (res.status === 401 || res.status === 403 || res.status === 404) { cache.delete(key); return res; }
    if (!res.ok) return res;
    const size = Number(res.headers.get('content-length') || 0);
    const body = await res.blob();
    const headers = new Headers(res.headers);
    headers.delete('content-encoding'); // the body is already decoded
    headers.delete('content-length');
    const out = new Response(body, { status: 200, statusText: res.statusText, headers });
    if (size <= MAX_CACHED_FILE && body.size <= MAX_CACHED_FILE) {
      headers.set('X-Saved-At', String(Date.now()));
      await cache.put(key, new Response(body, { status: 200, headers }));
    }
    return out;
  } catch {
    const hit = await cache.match(key);
    if (hit) {
      // Let the page know this is a saved copy.
      notify({ type: 'offline-copy' });
      return hit;
    }
    return offlineJson("You're offline, and this hasn't been opened before, so there's no saved copy");
  }
}

let lastNotify = 0;
async function notify(msg) {
  const now = Date.now();
  if (now - lastNotify < 1000) return;
  lastNotify = now;
  for (const c of await self.clients.matchAll({ type: 'window' })) c.postMessage(msg);
}
