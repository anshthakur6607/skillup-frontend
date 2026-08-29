/**
 * SkillUp Service Worker — enables offline support.
 *
 * Strategy:
 * - Static assets (HTML, CSS, JS): Cache-First (fast, offline-ready)
 * - API responses: Network-First (fresh data, fallback to cache)
 * - iGOT API calls: Stale-While-Revalidate (show cached, update in background)
 *
 * Cache limits:
 * - Max 50 pages cached
 * - Max 100 API responses cached
 * - Auto-cleanup on version update
 */

const CACHE_VERSION = 'skillup-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IGOT_CACHE = `${CACHE_VERSION}-igot`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.jpeg',
];

// Install — pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE && key !== IGOT_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — route to appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  // iGOT API — stale-while-revalidate
  if (url.hostname.includes('igotkarmayogi.gov.in')) {
    event.respondWith(staleWhileRevalidate(request, IGOT_CACHE));
    return;
  }

  // Backend API — network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets — cache-first
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// Cache-First strategy (static assets)
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Network-First strategy (API responses)
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());

      // Limit cache size
      const keys = await cache.keys();
      if (keys.length > 100) {
        await cache.delete(keys[0]);
      }
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale-While-Revalidate strategy (iGOT API)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());

        // Limit cache size
        cache.keys().then((keys) => {
          if (keys.length > 50) cache.delete(keys[0]);
        });
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}
