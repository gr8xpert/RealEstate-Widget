/**
 * RealtySoft Widget v3 - Geocoding Service
 * Provides zipcode-to-coordinates geocoding with caching for properties without lat/lng.
 * Uses OpenStreetMap Nominatim API with rate limiting and caching.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  isApproximate: boolean;
  displayName?: string;
}

interface CachedGeocode {
  result: GeocodeResult;
  timestamp: number;
}

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Rate limit: 200ms between Nominatim requests (their policy is max 1 request/second)
const RATE_LIMIT_MS = 200;

// LocalStorage key prefix
const STORAGE_KEY_PREFIX = 'rs_geocode_';

// In-memory LRU cache for session
const memoryCache = new Map<string, GeocodeResult>();
const MAX_MEMORY_CACHE_SIZE = 500;

// Rate limiting
let lastRequestTime = 0;

/**
 * Generate a cache key from zipcode and optional province
 */
function getCacheKey(zipcode: string, province?: string): string {
  const normalized = zipcode.trim().toUpperCase();
  const provincePart = province ? `_${province.trim().toLowerCase()}` : '';
  return `${normalized}${provincePart}`;
}

/**
 * Get result from localStorage cache
 */
function getFromLocalStorage(key: string): GeocodeResult | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (!stored) return null;

    const cached: CachedGeocode = JSON.parse(stored);
    const age = Date.now() - cached.timestamp;

    if (age > CACHE_TTL_MS) {
      // Expired - remove it
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
      return null;
    }

    return cached.result;
  } catch {
    return null;
  }
}

/**
 * Save result to localStorage cache
 */
function saveToLocalStorage(key: string, result: GeocodeResult): void {
  try {
    const cached: CachedGeocode = {
      result,
      timestamp: Date.now()
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(cached));
  } catch {
    // Storage full or unavailable - ignore
  }
}

/**
 * Get from memory cache
 */
function getFromMemoryCache(key: string): GeocodeResult | null {
  return memoryCache.get(key) || null;
}

/**
 * Save to memory cache with LRU eviction
 */
function saveToMemoryCache(key: string, result: GeocodeResult): void {
  // Simple LRU: if at capacity, delete first entry
  if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, result);
}

/**
 * Wait for rate limit if needed
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }

  lastRequestTime = Date.now();
}

/**
 * Query Nominatim for coordinates
 */
async function queryNominatim(query: string): Promise<GeocodeResult | null> {
  await waitForRateLimit();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RealtySoft Widget v3'
        }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || data.length === 0) return null;

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    return {
      lat,
      lng,
      isApproximate: true,
      displayName: result.display_name
    };
  } catch (err) {
    console.warn('[RealtySoft Geocode] Nominatim query failed:', err);
    return null;
  }
}

/**
 * Geocode a zipcode (postal code) to coordinates
 * Uses caching to avoid repeated API calls
 *
 * @param zipcode - The postal code to geocode
 * @param province - Optional province/region for more accurate results
 * @param country - Country (defaults to "Spain")
 * @returns GeocodeResult or null if not found
 */
export async function geocodeZipcode(
  zipcode: string,
  province?: string,
  country: string = 'Spain'
): Promise<GeocodeResult | null> {
  if (!zipcode || !zipcode.trim()) return null;

  const cacheKey = getCacheKey(zipcode, province);

  // Check memory cache first (fastest)
  const memoryCached = getFromMemoryCache(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }

  // Check localStorage cache
  const storageCached = getFromLocalStorage(cacheKey);
  if (storageCached) {
    // Also put in memory cache for faster access
    saveToMemoryCache(cacheKey, storageCached);
    return storageCached;
  }

  // Build Nominatim query
  const queryParts = [zipcode.trim()];
  if (province) queryParts.push(province);
  queryParts.push(country);
  const query = queryParts.join(', ');

  // Query Nominatim
  const result = await queryNominatim(query);

  if (result) {
    // Cache the result
    saveToMemoryCache(cacheKey, result);
    saveToLocalStorage(cacheKey, result);
  }

  return result;
}

/**
 * Batch geocode multiple zipcodes
 * Returns a Map of zipcode -> GeocodeResult
 * Efficient: only makes API calls for uncached zipcodes
 *
 * @param zipcodes - Array of unique zipcodes to geocode
 * @param province - Optional province (applied to all)
 * @param country - Country (defaults to "Spain")
 */
export async function geocodeBatch(
  zipcodes: string[],
  province?: string,
  country: string = 'Spain'
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  const needsGeocoding: string[] = [];

  // First, check caches
  for (const zipcode of zipcodes) {
    if (!zipcode || !zipcode.trim()) continue;

    const cacheKey = getCacheKey(zipcode, province);

    // Check memory cache
    let cached = getFromMemoryCache(cacheKey);

    // Check localStorage if not in memory
    if (!cached) {
      cached = getFromLocalStorage(cacheKey);
      if (cached) {
        saveToMemoryCache(cacheKey, cached);
      }
    }

    if (cached) {
      results.set(zipcode, cached);
    } else {
      needsGeocoding.push(zipcode);
    }
  }

  // Geocode uncached zipcodes (with rate limiting)
  for (const zipcode of needsGeocoding) {
    const result = await geocodeZipcode(zipcode, province, country);
    if (result) {
      results.set(zipcode, result);
    }
  }

  return results;
}

/**
 * Clear all geocoding caches
 */
export function clearGeocodeCache(): void {
  // Clear memory cache
  memoryCache.clear();

  // Clear localStorage cache
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage unavailable - ignore
  }
}

/**
 * Get cache statistics
 */
export function getGeocodeStats(): { memorySize: number; storageCount: number } {
  let storageCount = 0;
  try {
    const keys = Object.keys(localStorage);
    storageCount = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX)).length;
  } catch {
    // Ignore
  }

  return {
    memorySize: memoryCache.size,
    storageCount
  };
}

// Export service interface
const GeocodeService = {
  geocodeZipcode,
  geocodeBatch,
  clearCache: clearGeocodeCache,
  getStats: getGeocodeStats
};

export default GeocodeService;
