
const CACHE_NAME = 'padrepio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/5263c487-173b-4d9b-83a5-6824f9f805d8.png',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (
    event.request.url.includes('supabase.co') ||
    event.request.url.startsWith('chrome-extension://')
  ) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (
          !response ||
          response.status !== 200 ||
          response.type !== 'basic'
        ) return response;

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    }).catch(() => {
      if (event.request.destination === 'document') {
        return caches.match('/');
      }
    })
  );
});
