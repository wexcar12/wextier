const CACHE_VERSION = 2;
const CACHE_NAME = 'wextier-v' + CACHE_VERSION;
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './core/event-bus.js',
  './core/state.js',
  './ui/render.js',
  './ui/templates.js',
  './ui/settings.js',
  './ui/search.js',
  './ui/gallery.js',
  './ui/comments.js',
  './ui/drafts.js',
  './ui/export.js',
  './ui/share.js',
  './ui/player.js',
  './ui/tooltip.js',
  './ui/achievements.js',
  './ui/neon.js',
  './ui/parallax.js',
  './ui/modal-manager.js',
  './ui/custom-select.js',
  './ui/toast.js',
  './ui/version-history.js',
  './ui/sidebar-anim.js',
  './ui/bottom-sheet.js',
  './ui/context-menu.js',
  './ui/community-templates.js',
  './dragdrop/sortable.js',
  './utils/storage.js',
  './utils/sanitizers.js',
  './api/auth.js',
  './api/firebase-init.js',
  './api/firestore.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (e.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.hostname.includes('firebaseio') || url.hostname.includes('googleapis')) return;

  if (e.request.destination === 'document' || url.pathname.endsWith('.html')) {
    e.respondWith(networkFirst(e.request));
    return;
  }

  e.respondWith(staleWhileRevalidate(e.request));
});

function networkFirst(request) {
  return fetch(request).then(response => {
    if (response && response.status === 200) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')));
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(cache =>
    cache.match(request).then(cached => {
      const fetchPromise = fetch(request).then(response => {
        if (response && response.status === 200 && new URL(request.url).origin === self.location.origin) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
}
