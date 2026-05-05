// Service Worker für Behörden Assistent PWA
// Ermöglicht Offline-Nutzung und schnelles Laden

const CACHE_NAME = "behoerden-assistent-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/icon-192.png",
  "/icon-512.png",
];

// Bei der Installation: Wichtige Dateien cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch((err) => {
        console.log("Cache-Fehler:", err);
      });
    })
  );
  self.skipWaiting();
});

// Alte Caches löschen wenn neue Version
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Bei Anfragen: Erst Cache, dann Netzwerk
self.addEventListener("fetch", (event) => {
  // API-Anfragen NICHT cachen (immer aktuell)
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Aus Cache wenn vorhanden
      if (response) {
        return response;
      }
      // Sonst aus Netzwerk und cachen
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Bei Offline: Fallback auf index.html
        return caches.match("/");
      });
    })
  );
});
