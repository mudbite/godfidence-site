const CACHE_NAME = "godfidence-cache-v4";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./monday.pdf",
  "./tuesday.pdf",
  "./wednesday.pdf",
  "./thursday.pdf",
  "./friday.pdf",
  "./saturday.pdf",
  "./sunday.pdf"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const file of FILES_TO_CACHE) {
        try {
          await cache.add(file);
        } catch (e) {
          console.warn("Failed to cache:", file);
        }
      }
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});