/**
 * The name of the current cache
 * @type {String}
 */
const CACHE_NAME = 'v3';

/**
 * Files to cache
 * @type {Array}
 */
const fileCache = [
  '/',
  '/index.html',
  '/static/index.js',
  '/static/styles.css',
  '/static/rx.lite.js',
  '/static/audioHandler.js',
  '/static/listen_to_the_future.mp3'
];

this.oninstall = (event) => {
  console.log('SERVICE WORKER: installing');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(fileCache);
      })
      .then(()=>{
        self.skipWaiting(); // Always grab control from previous worker
      })
  );
};

this.onactivate = () => {
  console.log('SERVICE WORKER: ready');
};

this.onfetch = (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        // Cache miss
        return fetch(event.request);
      })
  );
};
