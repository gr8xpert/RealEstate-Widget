/**
 * RealtySoft Widget v3 - Service Worker
 * Opt-in caching for widget assets and API responses
 *
 * Strategies:
 *   - Cache-first for static assets (JS, CSS, images)
 *   - Stale-while-revalidate for API proxy responses
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const SW_VERSION = '3.0.0';
const STATIC_CACHE = `rs-sw-static-${SW_VERSION}`;
const API_CACHE = 'rs-sw-api-v1';

const STATIC_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days for images
const API_MAX_AGE = 60 * 60 * 1000; // 1 hour for API

/**
 * URL pattern matchers
 */
function isWidgetAsset(url: URL): boolean {
  const path = url.pathname;
  return /realtysoft[^/]*\.(js|css)$/i.test(path);
}

function isImageAsset(url: URL): boolean {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname);
}

function isAPIProxy(url: URL): boolean {
  return url.pathname.includes('api-proxy.php');
}

/**
 * Determine cache strategy for a request
 */
type CacheStrategy = 'cache-first' | 'stale-while-revalidate' | 'network-only';

function getStrategy(url: URL): CacheStrategy {
  if (isWidgetAsset(url)) return 'cache-first';
  if (isImageAsset(url)) return 'cache-first';
  if (isAPIProxy(url)) return 'stale-while-revalidate';
  return 'network-only';
}

/**
 * Get cache name for a URL
 */
function getCacheName(url: URL): string {
  if (isAPIProxy(url)) return API_CACHE;
  return STATIC_CACHE;
}

/**
 * Check if a cached response is still fresh
 */
function isFresh(response: Response, maxAge: number): boolean {
  const dateHeader = response.headers.get('date') || response.headers.get('sw-date');
  if (!dateHeader) return true; // No date → assume fresh
  const age = Date.now() - new Date(dateHeader).getTime();
  return age < maxAge;
}

/**
 * Add timestamp header to response before caching
 */
function addTimestamp(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('sw-date', new Date().toISOString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Cache-first strategy: serve from cache, fallback to network
 */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const maxAge = cacheName === API_CACHE ? API_MAX_AGE : STATIC_MAX_AGE;
    if (isFresh(cached, maxAge)) {
      return cached;
    }
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, addTimestamp(response.clone()));
  }
  return response;
}

/**
 * Stale-while-revalidate: serve cached (even stale), update in background
 */
async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Always revalidate in background
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, addTimestamp(response.clone()));
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  // No cache — wait for network
  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;
  return new Response('Service Worker: Network unavailable', { status: 503 });
}

/**
 * Install event — pre-cache nothing (assets cached on first use)
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log(`[RealtySoft SW] Installing v${SW_VERSION}`);
  event.waitUntil(self.skipWaiting());
});

/**
 * Activate event — clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log(`[RealtySoft SW] Activating v${SW_VERSION}`);
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name.startsWith('rs-sw-') && name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log(`[RealtySoft SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Fetch event — apply cache strategy based on URL pattern
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  const strategy = getStrategy(url);

  if (strategy === 'network-only') return; // Let browser handle

  const cacheName = getCacheName(url);

  if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(event.request, cacheName));
  } else if (strategy === 'stale-while-revalidate') {
    event.respondWith(staleWhileRevalidate(event.request, cacheName));
  }
});

// Export for testing
export {
  isWidgetAsset,
  isImageAsset,
  isAPIProxy,
  getStrategy,
  getCacheName,
  SW_VERSION,
  STATIC_CACHE,
  API_CACHE,
};
