/**
 * The name of the current cache
 * @type {String}
 */
const CACHE_NAME = 'v12';

/**
 * Files to cache
 * @type {Array}
 */
const urlsToCache = [
  '/',
  '/index.html',
  '/static/index.js',
  '/static/styles.css',
  '/static/rx.lite.js',
  '/static/p5.min.js',
  '/static/drawCanvas.js',
  '/static/audioHandler.js',
  '/static/listen_to_the_future.mp3',
  '/static/heart.png'
];

this.oninstall = event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
};

this.onactivate = () => {
  console.log('SERVICE WORKER: ready');
};

this.onfetch = event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Cache hit
          return response;
        }
        // Cache miss
        return fetch(event.request);
      })
  );
};
