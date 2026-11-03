// Service worker per giocare offline. Questo file non entra nel bundle: alla fine della build
// vite.config.js lo copia in dist/sw.js e riempie i due segnaposto qui sotto con la versione
// e l'elenco di tutti i file pubblicati (i segnaposto non vanno ripetuti nei commenti).
const VERSION = __VERSION__;
const FILES = __FILES__;
const CACHE = `yatai-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()),
  );
});

// Cancella solo le cache vecchie dello Yatai: gli altri giochi del sito stanno sullo stesso dominio.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('yatai-') && key !== CACHE).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

// ignoreVary: i file sono statici. Senza, una risposta con "Vary: Origin" non verrebbe mai trovata,
// perché lo script del gioco (crossorigin) si chiede con un header Origin e la cache no.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE)
      .then((cache) => cache.match(event.request, { ignoreSearch: true, ignoreVary: true }))
      .then((hit) => hit ?? fetch(event.request)),
  );
});
