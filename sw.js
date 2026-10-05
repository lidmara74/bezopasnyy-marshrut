const CACHE = 'bezopasnyy-marshrut-v2-3';
const CORE = [
  './', './index.html', './manifest.webmanifest', './icon.svg',
  './css/game.css', './css/scenery.css', './css/devices.css', './css/mobile.css',
  './data/iar.js', './data/voice.js', './data/audio-manifest.js',
  './data/worlds.js', './data/scenes.js',
  './js/core.js', './js/games.js', './js/scenes.js', './js/app.js', './js/mobile.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin || request.headers.has('range')) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {
      const path = new URL(request.url).pathname;
      if (/\/(assets|audio)\//.test(path)) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
      }
    }
    return response;
  })));
});
