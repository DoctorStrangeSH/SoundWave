const CACHE_NAME = 'soundwave-v1';
const ASSETS = [
  '/soundwave/',
  '/soundwave/index.html',
  '/soundwave/style.css',
  '/soundwave/manifest.json',
  '/soundwave/js/audio-engine.js',
  '/soundwave/js/visualizer.js',
  '/soundwave/js/player.js',
  '/soundwave/js/playlist.js',
  '/soundwave/js/dragdrop.js',
  '/soundwave/assets/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});