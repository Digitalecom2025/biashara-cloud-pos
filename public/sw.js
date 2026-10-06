const CACHE_NAME = "leadsstacks-pwa-v2";
const CACHE_PREFIX = "leadsstacks-";
const isDevelopmentHost =
  self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";
const SHELL_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/biashara-icon-192.svg",
  "/icons/biashara-icon-512.svg",
];

self.addEventListener("install", (event) => {
  // A service worker is only registered by production builds. This guard also
  // retires a previously installed worker if it is ever reached on localhost.
  if (isDevelopmentHost) {
    event.waitUntil(self.registration.unregister());
    return;
  }
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  // Development never registers this worker. If an old worker is still
  // controlling localhost while it is being retired, it must not cache or
  // answer any request that could affect Turbopack/HMR.
  if (isDevelopmentHost) return;
  if (url.pathname.startsWith("/api/")) return;
  if (
    url.pathname.includes("hot-update") ||
    url.pathname.includes("_next/static/development")
  ) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
  }
});
