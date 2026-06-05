const CACHE_NAME = "godfidence-cache-v2";

// Core app shell + ALL PDFs
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png",

  // PDF folder (important for offline access)
  "/files/monday.pdf",
  "/files/tuesday.pdf",
  "/files/wednesday.pdf",
  "/files/thursday.pdf",
  "/files/friday.pdf",
  "/files/saturday.pdf",
  "/files/sunday.pdf"
];

// INSTALL: cache everything initially
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// ACTIVATE: remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH: cache-first strategy (offline-first app)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Only cache valid responses
        if (!response || response.status !== 200) {
          return response;
        }

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(() => {
        // If offline and not cached
        return caches.match("/index.html");
      });
    })
  );
});