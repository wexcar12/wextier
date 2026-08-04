const CACHE_VERSION = 3;
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
  './ui/bottom-sheet.js',
  './ui/context-menu.js',
  './ui/community-templates.js',
  './ui/cover-search.js',
  './ui/analytics.js',
  './ui/onboarding.js',
  './dragdrop/sortable.js',
  './utils/storage.js',
  './utils/sanitizers.js',
  './utils/placeholder.js',
  './utils/translit.js',
  './utils/image-resolve.js',
  './utils/lazy-load.js',
  './api/auth.js',
  './api/firebase-init.js',
  './api/firestore.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      // Ф7-1: устойчивая установка. cache.addAll атомарен — один битый путь (404)
      // ронял бы всю установку SW и кэш не создавался бы вовсе. Кэшируем каждый ассет
      // независимо: отсутствующий файл лишь пропускается, остальное кэшируется.
      .then(cache => Promise.all(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] skip cache:', url, err && err.message))
        )
      ))
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
