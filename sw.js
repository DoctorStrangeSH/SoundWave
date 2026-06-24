const CACHE_NAME = 'SoundWave-v1';
const ASSETS = [
  '/SoundWave/',
  '/SoundWave/index.html',
  '/SoundWave/style.css',
  '/SoundWave/manifest.json',
  '/SoundWave/js/audio-engine.js',
  '/SoundWave/js/visualizer.js',
  '/SoundWave/js/player.js',
  '/SoundWave/js/playlist.js',
  '/SoundWave/js/dragdrop.js',
  '/SoundWave/assets/favicon.svg'
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