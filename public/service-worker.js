// Este es un service worker básico para hacer que la aplicación funcione offline
const CACHE_NAME = "dj-request-app-v1"
const urlsToCache = ["/", "/dj", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve la respuesta en caché si está disponible
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

