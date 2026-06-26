/* Service worker — Jack Brunet PWA.
 * Réseau d'abord pour le contenu frais, cache en secours (hors-ligne).
 * On ne met JAMAIS en cache une réponse en erreur (404…) pour ne pas figer
 * un « non disponible » obsolète.
 */
const VERSION = "jb-v2";
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// Coquille minimale mise en cache à l'installation.
const PRECACHE = ["/", "/devotionnel/", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function cacheable(res) {
  return res && res.ok && res.status === 200;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // tiers (YouTube, Brevo, OpenAI…) : on laisse passer

  // Contenu dynamique (commentaires, bible, audio) + navigations : RÉSEAU D'ABORD,
  // cache seulement en secours hors-ligne. Garantit des données toujours fraîches.
  const networkFirst =
    request.mode === "navigate" ||
    url.pathname.startsWith("/commentary/") ||
    url.pathname.startsWith("/bible/");

  if (networkFirst) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (cacheable(res)) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || (request.mode === "navigate" ? caches.match("/") : undefined)),
        ),
    );
    return;
  }

  // Autres ressources statiques : stale-while-revalidate (mais on ne cache que les 200).
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (cacheable(res)) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
