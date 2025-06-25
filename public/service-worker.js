const CACHE_NAME = 'mindmend-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // You might need to adjust these paths based on your final build output
  '/src/App.js',
  '/src/main.jsx',
  // Add other static assets like CSS files if you're not using a CDN for Tailwind
  // and locally hosted fonts or images from your public folder.
  // For the CDN version of Tailwind, it won't be cached by this service worker.
  // Make sure to add the icons you define in manifest.json
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
