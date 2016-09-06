/**
 * The name of the current cache
 * @type {String}
 */
const CACHE_NAME = 'v1';

/**
 * Files to cache
 * @type {Array}
 */
const fileCache = [
  '/',
  '/index.html',
  '/sw.js',
  '/static/index.js',
  '/static/styles.css',
  '/static/rx.lite.js',
  '/static/audioHandler.js',
  '/static/listen_to_the_future.mp3'
];

this.oninstall = (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(fileCache);
      })
  );
};

this.onactivate = () => {
  console.log('Offline support ready.');
};

this.onfetch = (event) => {
  const response =
    caches.match(event.request)
      .catch(() =>
        fetch(event.request)
          .then((res) => {
            const r = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, r);
            });
          return res;
          }))
      .then((res) => res);

  event.respondWith(response);
};
