/**
 * RealtySoft Widget v3 - API Service
 * Handles all API communication through proxy
 */

// Version check
console.log('[RealtySoft] API module loaded - v3.9.4');

import type {
  APIConfig,
  APIResponse,
  Location,
  PropertyType,
  Feature,
  Property,
  SearchParams,
  InquiryData,
  ImageWithSizes,
  PropertyFeature,
  PropertyAgent,
  RealtySoftAPIModule,
  CacheConfig,
} from '../types/index';

import { LRUCache } from './lru-cache';

// Search version tracker - prevents stale background refreshes from overwriting current results
// Incremented on each new search, background refreshes check version before updating state
let currentSearchVersion = 0;

/**
 * Increment search version to invalidate in-flight background refreshes
 * Call this when search params change (page navigation, filter changes, etc.)
 */
export function incrementSearchVersion(): number {
  return ++currentSearchVersion;
}

// Logger utility (set by controller)
declare const RealtySoftLogger: {
  debug: (message: string, ...args: unknown[]) => void;
} | undefined;

const Logger = {
  debug: (msg: string, ...args: unknown[]) => {
    if (typeof RealtySoftLogger !== 'undefined') RealtySoftLogger.debug(msg, ...args);
  }
};

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache TTL category type
type CacheTTLCategory = 'locations' | 'propertyTypes' | 'features' | 'labels' | 'search' | 'property';

// CacheManager interface
interface CacheManagerInterface {
  CACHE_PREFIX: string;
  get<T>(key: string, category?: CacheTTLCategory): T | null;
  set<T>(key: string, data: T): void;
  clear(key?: string): void;
  cleanup(): void;
}

// Raw property from API (before normalization)
interface RawProperty {
  id: number;
  title?: string;
  name?: string;
  headline?: string;
  ref_no?: string;
  ref?: string;
  reference?: string;
  unique_ref?: string;
  unique_reference?: string;
  external_ref?: string;
  list_price?: number;
  price?: number;
  asking_price?: number;
  price_on_request?: boolean;
  hide_price?: boolean;
  location_id?: { name?: string };
  location?: { name?: string } | string;
  city_id?: { name?: string };
  municipality_id?: { name?: string };
  address?: string;
  street_address?: string;
  postal_code?: string;
  zipcode?: string;
  zip?: string;
  postcode?: string;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  baths?: number;
  build_size?: number;
  built_area?: number;
  built?: number;
  building_size?: number;
  constructed_area?: number;
  m2_pivienda?: number;
  size?: number;
  plot_size?: number;
  plot?: number;
  land_area?: number;
  terrain_size?: number;
  m2_parcela?: number;
  terrace_size?: number;
  terrace_area?: number;
  terrace?: number;
  m2_terraza?: number;
  solarium_size?: number;
  solarium_area?: number;
  solarium?: number;
  m2_solarium?: number;
  garden_size?: number;
  garden_area?: number;
  garden?: number;
  m2_jardin?: number;
  usable_area?: number;
  usable_size?: number;
  useful_area?: number;
  m2_utiles?: number;
  images?: Array<string | RawImage>;
  total_images?: number;
  image_count?: number;
  images_count?: number;
  url?: string;
  link?: string;
  permalink?: string;
  listing_type?: string;
  listing_type_id?: { code?: string; name?: string } | string;
  status?: string;
  listing_status?: string;
  property_status?: string;
  type_id?: { name?: string };
  type?: { name?: string } | string;
  property_type?: { name?: string };
  is_featured?: boolean | number | string;
  is_own?: boolean | number | string;
  is_new?: boolean | number | string;
  is_exclusive?: boolean | number | string;
  desc?: string;
  description?: string;
  full_description?: string;
  short_description?: string;
  summary?: string;
  features?: Array<string | RawFeature>;
  amenities?: Array<string | RawFeature>;
  agent?: RawAgent;
  listing_agent?: RawAgent;
  contact?: RawAgent;
  user?: RawAgent;
  latitude?: number;
  lat?: number;
  geo_lat?: number;
  longitude?: number;
  lng?: number;
  lon?: number;
  geo_lng?: number;
  year_built?: number;
  construction_year?: number;
  built_year?: number;
  community_fees_monthly?: number;
  community_fees?: number;
  comm_fees?: number;
  community_cost?: number;
  gastos_comunidad?: number;
  monthly_community_fees?: number;
  ibi_fees?: number;
  ibi_tax?: number;
  ibi?: number;
  ibi_annual?: number;
  ibi_yearly?: number;
  basura_tax?: number;
  basura_fees?: number;
  garbage_tax?: number;
  basura?: number;
  waste_tax?: number;
  energy_rating?: string;
  energy_certificate?: {
    rating?: string;
    co2?: string;
    image?: string;
    consumption?: string;
  };
  energy_class?: string;
  co2_rating?: string;
  co2_emission?: string;
  energy_certificate_image?: string;
  energy_image?: string;
  energy_consumption?: string;
  video_url?: string;
  video?: string;
  youtube_url?: string;
  virtual_tour_url?: string;
  virtual_tour?: string;
  tour_360?: string;
  matterport_url?: string;
  pdf_url?: string;
  pdf?: string;
  brochure_url?: string;
  brochure?: string;
  pdf_link?: string;
  document_url?: string;
  flyer_url?: string;
  flyer?: string;
  floor?: string;
  floor_number?: string;
  orientation?: string;
  parking?: number;
  parking_spaces?: number;
  garage?: number;
  pool?: boolean;
  swimming_pool?: boolean;
  furnished?: string;
  furniture?: string;
  condition?: string;
  property_condition?: string;
  views?: string;
  view_type?: string;
  created_at?: string;
  date_added?: string;
  listed_date?: string;
  updated_at?: string;
  date_modified?: string;
  last_updated?: string;
  similar_property_ids?: number[];
}

interface RawImage {
  src?: string;
  url?: string;
  image_256?: string;
  image_512?: string;
  image_768?: string;
  image_1024?: string;
}

interface RawFeature {
  name?: string;
  label?: string;
  title?: string;
  attr_id?: { name?: string };
  category?: string;
}

interface RawAgent {
  name?: string;
  full_name?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  telephone?: string;
  mobile?: string;
  photo?: string;
  avatar?: string;
  image?: string;
}

const RealtySoftAPI: RealtySoftAPIModule = (function () {
  'use strict';

  /**
   * Default cache TTL values (in milliseconds)
   * Reduced TTLs ensure fresh data for filters and search results
   * Server-side cache (PHP) has similar TTLs now
   */
  const DEFAULT_CACHE_TTL: Record<CacheTTLCategory, number> = {
    locations: 15 * 60 * 1000,      // 15 min (reduced from 4h for fresh property_count)
    propertyTypes: 15 * 60 * 1000,  // 15 min (reduced from 4h for fresh property_count)
    features: 30 * 60 * 1000,       // 30 min (reduced from 4h)
    labels: 4 * 60 * 60 * 1000,     // 4 hours (unchanged - rarely changes)
    search: 5 * 60 * 1000,          // 5 min (reduced from 15 min)
    property: 10 * 60 * 1000,       // 10 min (reduced from 30 min)
  };

  /**
   * Track if localStorage is available and has space
   */
  let localStorageAvailable = true;

  /**
   * Cache configuration — updated via init()
   */
  let cacheConfig: CacheConfig = {};

  /**
   * L1 in-memory LRU cache (default 100 entries)
   */
  let memoryCache = new LRUCache<{ data: unknown; timestamp: number }>(100);

  /**
   * Resolve TTL for a given category, using user config with fallback to defaults
   */
  function resolveTTL(category: CacheTTLCategory): number {
    const userValue = cacheConfig[category];
    if (typeof userValue === 'number' && userValue >= 0) {
      return userValue;
    }
    return DEFAULT_CACHE_TTL[category];
  }

  /**
   * CacheManager - Two-layer caching:
   *   L1: In-memory LRU cache (fast, no JSON.parse overhead)
   *   L2: localStorage (persistent across page loads)
   */
  const CacheManager: CacheManagerInterface = {
    CACHE_PREFIX: 'rs_cache_',

    get<T>(key: string, category?: CacheTTLCategory): T | null {
      if (cacheConfig.disabled) return null;
      const ttl = category ? resolveTTL(category) : DEFAULT_CACHE_TTL.locations;
      const fullKey = this.CACHE_PREFIX + key;

      // L1: Check memory cache first
      const memEntry = memoryCache.get(fullKey);
      if (memEntry) {
        if (Date.now() - memEntry.timestamp > ttl) {
          memoryCache.delete(fullKey);
        } else {
          return memEntry.data as T;
        }
      }

      // L2: Check localStorage
      try {
        const cached = localStorage.getItem(fullKey);
        if (!cached) return null;
        const { data, timestamp }: CacheEntry<T> = JSON.parse(cached);
        if (Date.now() - timestamp > ttl) {
          localStorage.removeItem(fullKey);
          return null;
        }
        // Promote L2 hit to L1
        memoryCache.set(fullKey, { data, timestamp });
        return data;
      } catch (e) {
        console.warn('Cache read error:', e);
        return null;
      }
    },

    set<T>(key: string, data: T): void {
      if (cacheConfig.disabled) return;
      const fullKey = this.CACHE_PREFIX + key;
      const timestamp = Date.now();

      // L1: Always write to memory
      memoryCache.set(fullKey, { data, timestamp });

      // L2: Write to localStorage (skip if previously failed)
      if (!localStorageAvailable) return;

      try {
        const jsonData = JSON.stringify({ data, timestamp });
        // Skip large items (>500KB) to avoid filling localStorage
        if (jsonData.length > 500 * 1024) {
          Logger.debug('[RealtySoft] Skipping localStorage for large item:', key);
          return;
        }
        localStorage.setItem(fullKey, jsonData);
      } catch (e) {
        // QuotaExceededError - clean up old cache and retry
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
          Logger.debug('[RealtySoft] Storage quota exceeded, cleaning up...');
          this.cleanup();
          // Retry once after cleanup
          try {
            localStorage.setItem(fullKey, JSON.stringify({ data, timestamp }));
          } catch (_retryError) {
            // Still failed - disable localStorage caching for this session
            Logger.debug('[RealtySoft] Storage still full, disabling localStorage cache');
            localStorageAvailable = false;
          }
        }
      }
    },

    clear(key?: string): void {
      try {
        if (key) {
          const fullKey = this.CACHE_PREFIX + key;
          memoryCache.delete(fullKey);
          localStorage.removeItem(fullKey);
        } else {
          // Clear all RS cache entries
          memoryCache.clear();
          Object.keys(localStorage)
            .filter((k) => k.startsWith(this.CACHE_PREFIX))
            .forEach((k) => localStorage.removeItem(k));
        }
      } catch (e) {
        console.warn('Cache clear error:', e);
      }
    },

    /**
     * Clean up expired and oldest cache entries to free space
     */
    cleanup(): void {
      try {
        const now = Date.now();
        const entries: Array<{ key: string; timestamp: number; size: number }> = [];
        let removedExpired = 0;

        // Collect all RS cache entries with their timestamps and sizes
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.CACHE_PREFIX)) {
            try {
              const value = localStorage.getItem(key);
              if (value) {
                const parsed = JSON.parse(value);
                const timestamp = parsed.timestamp || 0;

                // Remove if expired (older than 4 hours - match new TTL)
                if (now - timestamp > 4 * 60 * 60 * 1000) {
                  localStorage.removeItem(key);
                  removedExpired++;
                } else {
                  entries.push({ key, timestamp, size: value.length });
                }
              }
            } catch (_parseError) {
              // Invalid entry, remove it
              localStorage.removeItem(key);
              removedExpired++;
            }
          }
        }

        if (removedExpired > 0) {
          Logger.debug(`[RealtySoft] Removed ${removedExpired} expired cache entries`);
        }

        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const totalSize = entries.reduce((sum, e) => sum + e.size, 0);

        // If total cache is over 1MB, remove oldest entries until under 500KB
        // (Aggressive cleanup since server handles caching)
        if (totalSize > 1024 * 1024) {
          let removedSize = 0;
          const targetRemoval = totalSize - 512 * 1024; // Remove down to 500KB
          for (const entry of entries) {
            if (removedSize >= targetRemoval) break;
            try {
              localStorage.removeItem(entry.key);
              removedSize += entry.size;
            } catch (_e) { /* ignore */ }
          }
          Logger.debug(`[RealtySoft] Cleaned up ${Math.round(removedSize / 1024)}KB of cache`);
        }
      } catch (e) {
        // If cleanup fails, clear everything as last resort
        Logger.debug('[RealtySoft] Cleanup failed, clearing all cache');
        this.clear();
      }
    },
  };

  /**
   * Simple hash function for cache keys
   */
  function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Normalize params for consistent cache key generation
   * Ensures same params always produce same hash regardless of property order
   * Handles: key ordering, array sorting, type normalization (numbers to strings)
   */
  function normalizeParams(params: Record<string, unknown>): string {
    const sorted = Object.keys(params)
      .sort()
      .reduce((obj, key) => {
        let val = params[key];
        // Skip null/undefined values
        if (val === null || val === undefined) return obj;
        // Normalize arrays: sort elements and join
        if (Array.isArray(val)) {
          val = [...val].map(v => String(v)).sort().join(',');
        }
        // Normalize numbers to strings for consistent comparison
        if (typeof val === 'number') {
          val = String(val);
        }
        // Normalize booleans to strings
        if (typeof val === 'boolean') {
          val = val ? '1' : '0';
        }
        obj[key] = val;
        return obj;
      }, {} as Record<string, unknown>);
    return JSON.stringify(sorted);
  }

  // In-flight request deduplication - prevents duplicate concurrent API requests
  const pendingRequests = new Map<string, Promise<unknown>>();

  let config: APIConfig = {
    proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
    inquiryEndpoint: 'https://smartpropertywidget.com/spw/php/send-inquiry.php',
    apiKey: null,
    apiUrl: null,
    language: 'en_US',
  };

  /**
   * Map language codes for API requests
   * Some languages share the same API content (e.g., en_GB uses en_US)
   */
  const languageAliases: Record<string, string> = {
    'en_GB': 'en_US',
    'en_AU': 'en_US',
    'en_CA': 'en_US',
    // Add more aliases as needed
  };

  function getApiLanguage(lang: string): string {
    return languageAliases[lang] || lang;
  }

  /**
   * Initialize API with config
   */
  function init(options: Partial<APIConfig>): void {
    config = { ...config, ...options };
    // Reset cache config: use provided config or defaults
    cacheConfig = options.cache ? { ...options.cache } : {};
    const maxEntries = cacheConfig.maxCacheEntries ?? 100;
    memoryCache = new LRUCache<{ data: unknown; timestamp: number }>(maxEntries);

    // Run cleanup on init to clear stale/expired entries and prevent quota issues
    try {
      CacheManager.cleanup();
    } catch (_e) { /* ignore cleanup errors on init */ }
  }

  /**
   * Make API request through proxy
   */
  async function request<T>(
    endpoint: string,
    params: Record<string, unknown> = {},
    method: string = 'GET',
    options: { skipLang?: boolean } = {}
  ): Promise<T> {
    // Create request key for deduplication (endpoint + params hash)
    const requestKey = endpoint + '_' + hashString(JSON.stringify(params)) + '_' + method;

    // Return existing promise if same request is already in-flight
    if (pendingRequests.has(requestKey)) {
      Logger.debug('[RealtySoft] Deduplicating request:', endpoint);
      return pendingRequests.get(requestKey) as Promise<T>;
    }

    const url = new URL(config.proxyUrl, window.location.origin);

    // Add endpoint to params
    const requestParams: Record<string, unknown> = { ...params, _endpoint: endpoint };

    // Add language unless skipped (use mapped language for API)
    if (!options.skipLang) {
      requestParams._lang = getApiLanguage(config.language);
    }

    // Add cache-busting timestamp to force fresh data from proxy/CDN
    requestParams._t = Date.now();

    if (method === 'GET') {
      Object.keys(requestParams).forEach((key) => {
        if (requestParams[key] !== null && requestParams[key] !== undefined) {
          url.searchParams.append(key, String(requestParams[key]));
        }
      });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    };

    if (method === 'POST') {
      fetchOptions.body = JSON.stringify(requestParams);
    }

    // Create the request promise
    const requestPromise = (async (): Promise<T> => {
      try {
        const response = await fetch(url.toString(), fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return data as T;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      } finally {
        // Clean up pending request after completion
        pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise for deduplication
    pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  /**
   * Fetch fresh locations from API (internal helper for SWR)
   */
  async function fetchFreshLocations(parentId: number | null, cacheKey: string): Promise<APIResponse<Location[]>> {
    // Fetch ALL locations in a single request with high limit
    const params: Record<string, unknown> = { page: 1, limit: 1000 };
    if (parentId) params.parent_id = parentId;

    let response: APIResponse<Location[]> | null = null;

    // Try v2/location first (newer APIs like inmotechplugin.com use v2)
    try {
      Logger.debug('[RealtySoft] Trying v2/location endpoint...');
      response = await request<APIResponse<Location[]>>('v2/location', params, 'GET', {
        skipLang: true,
      });

      // Check if we got valid data
      if (response && response.data && response.data.length > 0) {
        Logger.debug('[RealtySoft] v2/location returned', response.data.length, 'locations');
      } else {
        Logger.debug('[RealtySoft] v2/location returned empty, trying v1...');
        response = null;
      }
    } catch (e) {
      Logger.debug('[RealtySoft] v2/location failed, trying v1/location...');
      response = null;
    }

    // Fallback to v1/location if v2 failed or returned empty
    if (!response || !response.data || response.data.length === 0) {
      try {
        Logger.debug('[RealtySoft] Trying v1/location endpoint...');
        response = await request<APIResponse<Location[]>>('v1/location', params, 'GET', {
          skipLang: true,
        });
        Logger.debug('[RealtySoft] v1/location returned', response?.data?.length || 0, 'locations');
      } catch (e) {
        Logger.debug('[RealtySoft] v1/location also failed');
        // Return empty result if both fail
        return { data: [], count: 0 };
      }
    }

    // Deduplicate by ID
    const seen = new Set<number>();
    const uniqueData = (response.data || []).filter((loc) => {
      if (seen.has(loc.id)) return false;
      seen.add(loc.id);
      return true;
    });

    const result: APIResponse<Location[]> = {
      data: uniqueData,
      count: response.count || uniqueData.length,
    };

    // Cache the result
    CacheManager.set(cacheKey, result);
    Logger.debug('[RealtySoft] Locations cached');

    return result;
  }

  /**
   * Refresh locations in background (SWR pattern)
   */
  function refreshLocationsInBackground(parentId: number | null, cacheKey: string): void {
    fetchFreshLocations(parentId, cacheKey)
      .then((freshResult) => {
        Logger.debug('[RealtySoft] Background locations refresh complete');
        // Update state with fresh data
        if (typeof window !== 'undefined' && (window as unknown as { RealtySoftState?: { set: (path: string, value: unknown) => void } }).RealtySoftState) {
          const state = (window as unknown as { RealtySoftState: { set: (path: string, value: unknown) => void } }).RealtySoftState;
          state.set('data.locations', freshResult.data);
        }
      })
      .catch((err) => {
        Logger.debug('[RealtySoft] Background locations refresh failed:', err);
      });
  }

  /**
   * Get locations with SWR (Stale-While-Revalidate) pattern
   * Returns cached data immediately, refreshes in background
   */
  async function getLocations(parentId: number | null = null): Promise<APIResponse<Location[]>> {
    const cacheKey = 'locations' + (parentId ? '_' + parentId : '');

    // Check cache first - if found, return immediately and refresh in background (SWR)
    const cached = CacheManager.get<APIResponse<Location[]>>(cacheKey, 'locations');
    if (cached) {
      Logger.debug('[RealtySoft] Locations loaded from cache (SWR: refreshing in background)');
      // SWR: Return cached immediately, refresh in background
      refreshLocationsInBackground(parentId, cacheKey);
      return cached;
    }

    // No cache - fetch directly
    return fetchFreshLocations(parentId, cacheKey);
  }

  /**
   * Get parent/top-level locations only (tries v2 first, falls back to v1)
   */
  async function getParentLocations(): Promise<APIResponse<Location[]>> {
    const cacheKey = 'parentLocations';

    // Check cache first
    const cached = CacheManager.get<APIResponse<Location[]>>(cacheKey, 'locations');
    if (cached) {
      Logger.debug('[RealtySoft] Parent locations loaded from cache');
      return cached;
    }

    let result: APIResponse<Location[]> | null = null;

    // Try v2/location first
    try {
      result = await request<APIResponse<Location[]>>(
        'v2/location',
        { parent_id: 0 },
        'GET',
        { skipLang: true }
      );
      if (!result || !result.data || result.data.length === 0) {
        result = null;
      }
    } catch (e) {
      result = null;
    }

    // Fallback to v1/location
    if (!result) {
      try {
        result = await request<APIResponse<Location[]>>(
          'v1/location',
          { parent_id: 0 },
          'GET',
          { skipLang: true }
        );
      } catch (e) {
        return { data: [], count: 0 };
      }
    }

    // Cache the result
    CacheManager.set(cacheKey, result);
    Logger.debug('[RealtySoft] Parent locations cached');

    return result;
  }

  /**
   * Get child locations for a specific parent (tries v2 first, falls back to v1)
   */
  async function getChildLocations(parentId: number): Promise<APIResponse<Location[]>> {
    const cacheKey = 'childLocations_' + parentId;

    // Check cache first
    const cached = CacheManager.get<APIResponse<Location[]>>(cacheKey, 'locations');
    if (cached) {
      Logger.debug('[RealtySoft] Child locations loaded from cache for parent:', parentId);
      return cached;
    }

    let result: APIResponse<Location[]> | null = null;

    // Try v2/location first
    try {
      result = await request<APIResponse<Location[]>>(
        'v2/location',
        { parent_id: parentId },
        'GET',
        { skipLang: true }
      );
      if (!result || !result.data || result.data.length === 0) {
        result = null;
      }
    } catch (e) {
      result = null;
    }

    // Fallback to v1/location
    if (!result) {
      try {
        result = await request<APIResponse<Location[]>>(
          'v1/location',
          { parent_id: parentId },
          'GET',
          { skipLang: true }
        );
      } catch (e) {
        return { data: [], count: 0 };
      }
    }

    // Cache the result
    CacheManager.set(cacheKey, result);
    Logger.debug('[RealtySoft] Child locations cached for parent:', parentId);

    return result;
  }

  /**
   * Search locations by term
   */
  async function searchLocations(term: string): Promise<APIResponse<Location[]>> {
    return await request<APIResponse<Location[]>>('v1/search_location', { q: term });
  }

  /**
   * Get relevant/related locations
   */
  async function getRelevantLocations(locationId: number): Promise<APIResponse<Location[]>> {
    return await request<APIResponse<Location[]>>('v1/relevant_location', { id: locationId });
  }

  /**
   * Get property types
   */
  async function getPropertyTypes(): Promise<APIResponse<PropertyType[]>> {
    const cacheKey = 'propertyTypes_' + config.language;

    // Check cache first
    const cached = CacheManager.get<APIResponse<PropertyType[]>>(cacheKey, 'propertyTypes');
    if (cached) {
      Logger.debug('[RealtySoft] Property types loaded from cache');
      return cached;
    }

    const result = await request<APIResponse<PropertyType[]>>('v1/property_types');

    // Cache the result
    CacheManager.set(cacheKey, result);
    Logger.debug('[RealtySoft] Property types cached');

    return result;
  }

  /**
   * Get property features
   */
  async function getFeatures(): Promise<APIResponse<Feature[]>> {
    const cacheKey = 'features_' + config.language;

    // Check cache first
    const cached = CacheManager.get<APIResponse<Feature[]>>(cacheKey, 'features');
    if (cached) {
      Logger.debug('[RealtySoft] Features loaded from cache');
      return cached;
    }

    const result = await request<APIResponse<Feature[]>>('v1/property_features');

    // Cache the result
    CacheManager.set(cacheKey, result);
    Logger.debug('[RealtySoft] Features cached');

    return result;
  }

  /**
   * Get UI labels for current language
   */
  async function getLabels(): Promise<Record<string, string>> {
    const cacheKey = 'labels_' + config.language;

    // Check cache first
    const cached = CacheManager.get<Record<string, string>>(cacheKey, 'labels');
    if (cached) {
      Logger.debug('[RealtySoft] Labels loaded from cache');
      return cached;
    }

    // Check for PHP-injected prefetch (started before widget loaded)
    const prefetch = (window as any).__rsPrefetch;
    let result: Record<string, string>;
    if (prefetch?.labels && (!prefetch.lang || prefetch.lang === config.language)) {
      const prefetched = await prefetch.labels;
      delete prefetch.labels; // Consume once
      if (prefetched) {
        Logger.debug('[RealtySoft] Labels loaded from PHP prefetch');
        result = prefetched;
      } else {
        result = await request<Record<string, string>>('v1/plugin_labels');
      }
    } else {
      result = await request<Record<string, string>>('v1/plugin_labels');
    }

    // Cache the result
    CacheManager.set(cacheKey, result);
    Logger.debug('[RealtySoft] Labels cached');

    return result;
  }

  /**
   * Get all labels (without language filter) to detect available languages
   */
  async function getAllLabels(): Promise<unknown> {
    const cacheKey = 'labels_all';

    const cached = CacheManager.get<unknown>(cacheKey, 'labels');
    if (cached) {
      return cached;
    }

    const result = await request<unknown>('v1/plugin_labels', {}, 'GET', { skipLang: true });

    CacheManager.set(cacheKey, result);
    return result;
  }

  /**
   * Get translated field value from property
   * Checks for language-specific fields like title_es, description_es
   * Falls back to default field if no translation exists
   */
  function getTranslatedField(
    property: Record<string, unknown>,
    fieldName: string,
    fallbackFields: string[] = []
  ): string {
    // Get language code (e.g., 'es' from 'es_ES')
    const langCode = config.language.split('_')[0];

    // Try language-specific field first (e.g., title_es, description_es)
    const langField = `${fieldName}_${langCode}`;
    if (property[langField] && typeof property[langField] === 'string') {
      return property[langField] as string;
    }

    // Try translations object (e.g., translations.es.title)
    const translations = property.translations as Record<string, Record<string, string>> | undefined;
    if (translations && translations[langCode] && translations[langCode][fieldName]) {
      return translations[langCode][fieldName];
    }

    // Try full language code (e.g., title_es_ES)
    const fullLangField = `${fieldName}_${config.language.replace('-', '_')}`;
    if (property[fullLangField] && typeof property[fullLangField] === 'string') {
      return property[fullLangField] as string;
    }

    // Fall back to default field and alternatives
    const allFields = [fieldName, ...fallbackFields];
    for (const field of allFields) {
      if (property[field] && typeof property[field] === 'string') {
        return property[field] as string;
      }
    }

    return '';
  }

  /**
   * Normalize property data from API to expected format
   */
  function normalizeProperty(property: RawProperty | null): Property | null {
    if (!property) return null;

    // Cast to Record for dynamic field access
    const propRecord = property as unknown as Record<string, unknown>;

    // Extract images
    let images: string[] = [];
    let imagesFull: string[] = [];
    let imagesWithSizes: ImageWithSizes[] = [];

    if (property.images && Array.isArray(property.images)) {
      images = property.images
        .map((img) => {
          if (typeof img === 'string') return img;
          return (
            img.image_256 || img.image_512 || img.image_768 || img.src || img.url || ''
          );
        })
        .filter(Boolean);

      imagesFull = property.images
        .map((img) => {
          if (typeof img === 'string') return img;
          return (
            img.image_1024 || img.image_768 || img.image_512 || img.src || img.url || ''
          );
        })
        .filter(Boolean);

      imagesWithSizes = property.images
        .map((img): ImageWithSizes | null => {
          if (typeof img === 'string') return { src: img, sizes: {} };
          const src =
            img.image_256 || img.image_512 || img.image_768 || img.src || img.url || '';
          if (!src) return null;
          return {
            src,
            sizes: {
              256: img.image_256,
              512: img.image_512,
              768: img.image_768,
              1024: img.image_1024,
            },
          };
        })
        .filter((img): img is ImageWithSizes => img !== null && !!img.src);
    }

    // Get language code for translation lookups
    const langCode = config.language.split('_')[0];

    // Helper to get translated name from an object with possible name_es, name_en etc.
    const getTranslatedName = (obj: { name?: string; [key: string]: unknown } | null | undefined): string => {
      if (!obj) return '';
      const langName = obj[`name_${langCode}`];
      if (typeof langName === 'string' && langName) return langName;
      return obj.name || '';
    };

    // Extract location name with translation support
    const locationName =
      getTranslatedName(property.location_id as { name?: string }) ||
      getTranslatedName(property.location as { name?: string }) ||
      getTranslatedName(property.city_id) ||
      getTranslatedName(property.municipality_id) ||
      (typeof property.location === 'string' ? property.location : '') ||
      property.address ||
      '';

    // Extract type name with translation support
    const typeName =
      getTranslatedName(property.type_id) ||
      getTranslatedName(property.type as { name?: string }) ||
      getTranslatedName(property.property_type) ||
      (typeof property.type === 'string' ? property.type : '') ||
      '';

    // Determine listing type - normalize from various API formats
    // Map for normalizing listing type names/codes to standard codes
    const listingTypeMap: Record<string, string> = {
      'resale': 'resale', 'sale': 'resale', 'for sale': 'resale', 'sales': 'resale',
      'new development': 'development', 'development': 'development', 'new': 'development',
      'off plan': 'development', 'off-plan': 'development', 'new_development': 'development',
      'long term rental': 'long_rental', 'long rental': 'long_rental', 'rental': 'long_rental',
      'rent': 'long_rental', 'long-term rental': 'long_rental', 'long_term': 'long_rental',
      'short term rental': 'short_rental', 'short rental': 'short_rental', 'holiday rental': 'short_rental',
      'holiday': 'short_rental', 'vacation': 'short_rental', 'short-term rental': 'short_rental',
      'short_term': 'short_rental', 'vacation rental': 'short_rental',
    };

    // Get raw listing type from various possible fields
    // Handle multiple API response formats
    // Extract from listing_type_id which can be string or object
    const listingTypeIdValue = property.listing_type_id;
    const listingTypeFromId = typeof listingTypeIdValue === 'string'
      ? listingTypeIdValue
      : (listingTypeIdValue?.code || listingTypeIdValue?.name || '');

    let rawListingType =
      property.listing_type ||
      listingTypeFromId ||
      property.listing_status ||
      property.property_status ||
      property.status ||
      '';


    // Normalize to standard code
    let listingType = '';
    if (rawListingType) {
      const normalized = rawListingType.toLowerCase().trim();
      listingType = listingTypeMap[normalized] || normalized;
    }

    // Don't default to 'resale' - let UI decide what to show for unknown types
    // listingType stays as '' if not found

    // Extract features with translation support
    let features: PropertyFeature[] = [];
    const rawFeatures = property.features || property.amenities;
    if (rawFeatures && Array.isArray(rawFeatures)) {
      features = rawFeatures
        .map((f): PropertyFeature | null => {
          if (typeof f === 'string') return { name: f, category: 'Features' };
          if (!f || typeof f !== 'object') return null;

          // Get feature name - check translated field first, then standard fields
          const fRecord = f as Record<string, unknown>;
          const translatedName = fRecord[`name_${langCode}`];
          const name =
            (typeof translatedName === 'string' && translatedName) ||
            f.name ||
            f.label ||
            f.title ||
            '';
          if (!name) return null;

          // Get category - check translated field first, then standard fields
          const translatedCategory = fRecord[`category_${langCode}`];
          const category =
            (typeof translatedCategory === 'string' && translatedCategory) ||
            f.attr_id?.name ||
            f.category ||
            'Features';

          return { name, category };
        })
        .filter((f): f is PropertyFeature => f !== null);
    }

    // Extract agent info
    const rawAgent = property.agent || property.listing_agent || property.contact || property.user;
    const agent: PropertyAgent | null = rawAgent
      ? {
          name: rawAgent.name || rawAgent.full_name || rawAgent.display_name || '',
          email: rawAgent.email || '',
          phone: rawAgent.phone || rawAgent.telephone || rawAgent.mobile || '',
          photo: rawAgent.photo || rawAgent.avatar || rawAgent.image || '',
        }
      : null;

    const toBoolean = (val: boolean | number | string | undefined): boolean =>
      val === true || val === 1 || val === '1';

    // Get translated title and description
    const title = getTranslatedField(propRecord, 'title', ['name', 'headline']);
    const description = getTranslatedField(propRecord, 'description', ['desc', 'full_description']);
    const shortDescription = getTranslatedField(propRecord, 'short_description', ['summary']);

    return {
      id: property.id,
      title,
      ref: property.ref_no || property.ref || property.reference || '',
      unique_ref: property.unique_ref || property.unique_reference || property.external_ref || '',
      price: property.list_price || property.price || property.asking_price || 0,
      price_on_request: property.price_on_request || property.hide_price || false,
      location: locationName,
      postal_code:
        property.postal_code || property.zipcode || property.zip || property.postcode || '',
      address: property.address || property.street_address || '',
      beds: property.bedrooms || property.beds || 0,
      baths: property.bathrooms || property.baths || 0,
      built_area:
        property.build_size ||
        property.built_area ||
        property.built ||
        property.building_size ||
        property.constructed_area ||
        property.m2_pivienda ||
        property.size ||
        0,
      plot_size:
        property.plot_size ||
        property.plot ||
        property.land_area ||
        property.terrain_size ||
        property.m2_parcela ||
        0,
      terrace_size:
        property.terrace_size ||
        property.terrace_area ||
        (typeof property.terrace === 'number' ? property.terrace : 0) ||
        property.m2_terraza ||
        0,
      solarium_size:
        property.solarium_size ||
        property.solarium_area ||
        (typeof property.solarium === 'number' ? property.solarium : 0) ||
        property.m2_solarium ||
        0,
      garden_size:
        property.garden_size ||
        property.garden_area ||
        (typeof property.garden === 'number' ? property.garden : 0) ||
        property.m2_jardin ||
        0,
      usable_area:
        property.usable_area ||
        property.usable_size ||
        property.useful_area ||
        property.m2_utiles ||
        0,
      images,
      imagesFull,
      imagesWithSizes,
      // Use API's total_images if available (more accurate than array length for search results)
      total_images: property.total_images || property.image_count || property.images_count || property.images?.length || 0,
      url: property.url || property.link || property.permalink || null,
      listing_type: listingType,
      status: property.status || (typeof property.listing_type_id === 'object' ? property.listing_type_id?.name : '') || property.listing_status || '',
      type: typeName,
      is_featured: toBoolean(property.is_featured),
      is_own: toBoolean(property.is_own),
      is_new: toBoolean(property.is_new),
      is_exclusive: toBoolean(property.is_exclusive),
      description,
      short_description: shortDescription,
      features,
      agent,
      latitude: property.latitude || property.lat || property.geo_lat || null,
      longitude: property.longitude || property.lng || property.lon || property.geo_lng || null,
      year_built: property.year_built || property.construction_year || property.built_year || null,
      community_fees:
        property.community_fees_monthly ||
        property.community_fees ||
        property.comm_fees ||
        property.community_cost ||
        property.gastos_comunidad ||
        property.monthly_community_fees ||
        null,
      ibi_tax:
        property.ibi_fees ||
        property.ibi_tax ||
        property.ibi ||
        property.ibi_annual ||
        property.ibi_yearly ||
        null,
      basura_tax:
        property.basura_tax ||
        property.basura_fees ||
        property.garbage_tax ||
        property.basura ||
        property.waste_tax ||
        null,
      energy_rating:
        property.energy_rating || property.energy_certificate?.rating || property.energy_class || '',
      co2_rating: property.co2_rating || property.co2_emission || property.energy_certificate?.co2 || '',
      energy_certificate_image:
        property.energy_certificate_image ||
        property.energy_certificate?.image ||
        property.energy_image ||
        '',
      energy_consumption:
        property.energy_consumption || property.energy_certificate?.consumption || '',
      video_url: property.video_url || property.video || property.youtube_url || '',
      virtual_tour_url:
        property.virtual_tour_url ||
        property.virtual_tour ||
        property.tour_360 ||
        property.matterport_url ||
        '',
      pdf_url:
        property.pdf_url ||
        property.pdf ||
        property.brochure_url ||
        property.brochure ||
        property.pdf_link ||
        property.document_url ||
        property.flyer_url ||
        property.flyer ||
        '',
      floor: property.floor || property.floor_number || '',
      orientation: property.orientation || '',
      parking: property.parking || property.parking_spaces || property.garage || 0,
      pool: property.pool || property.swimming_pool || false,
      furnished: property.furnished || property.furniture || '',
      condition: property.condition || property.property_condition || '',
      views: property.views || property.view_type || '',
      created_at: property.created_at || property.date_added || property.listed_date || '',
      updated_at: property.updated_at || property.date_modified || property.last_updated || '',
      similar_property_ids: Array.isArray(property.similar_property_ids) ? property.similar_property_ids : [],
      _original: property as unknown as Record<string, unknown>,
    };
  }

  /**
   * Normalize array of properties
   */
  function normalizeProperties(data: RawProperty[] | unknown): Property[] {
    if (Array.isArray(data)) {
      return data.map((p) => normalizeProperty(p)).filter((p): p is Property => p !== null);
    }
    return [];
  }

  /**
   * Fetch fresh search results from API and cache them
   * Internal helper for SWR pattern
   */
  async function fetchFreshSearch(
    params: Partial<SearchParams>,
    cacheKey: string
  ): Promise<APIResponse<Property[]>> {
    const result = await request<APIResponse<RawProperty[]>>('v1/property', params);

    const normalizedResult: APIResponse<Property[]> = {
      ...result,
      data: normalizeProperties(result.data),
    };

    // Cache each property individually
    if (normalizedResult.data) {
      normalizedResult.data.forEach((property) => {
        if (property.id) {
          cacheProperty(property);
        }
      });
      // Cache search results
      CacheManager.set(cacheKey, normalizedResult);
      Logger.debug('[RealtySoft] Search results cached');
    }

    return normalizedResult;
  }

  /**
   * Refresh search results in background (SWR pattern)
   * Fetches fresh data without blocking, updates cache and optionally notifies UI
   * Uses searchVersion to prevent stale refreshes from overwriting newer results
   */
  function refreshSearchInBackground(
    params: Partial<SearchParams>,
    cacheKey: string,
    searchVersion: number
  ): void {
    fetchFreshSearch(params, cacheKey)
      .then((freshResult) => {
        // Only update state if this refresh is still current
        // Prevents race condition where user navigates to different page/filters
        // while background refresh is in-flight
        if (searchVersion !== currentSearchVersion) {
          Logger.debug('[RealtySoft] Background refresh discarded (stale version:', searchVersion, 'current:', currentSearchVersion + ')');
          return;
        }

        Logger.debug('[RealtySoft] Background search refresh complete');
        // Notify UI if RealtySoftState is available
        // This updates the listing grid with fresh data
        if (typeof window !== 'undefined' && (window as unknown as { RealtySoftState?: { set: (path: string, value: unknown) => void } }).RealtySoftState) {
          const state = (window as unknown as { RealtySoftState: { set: (path: string, value: unknown) => void } }).RealtySoftState;
          state.set('results.properties', freshResult.data);
          state.set('results.total', freshResult.total || freshResult.count || freshResult.data.length);
        }
      })
      .catch((err) => {
        // Silently ignore background refresh errors - stale data is still usable
        Logger.debug('[RealtySoft] Background search refresh failed:', err);
      });
  }

  /**
   * Search properties with SWR (Stale-While-Revalidate) pattern
   * Returns cached data immediately for fast UI, then refreshes in background
   */
  async function searchProperties(
    params: Partial<SearchParams>,
    options: { forceRefresh?: boolean } = {}
  ): Promise<APIResponse<Property[]>> {
    // Increment version for each new search to track this specific request
    // This prevents stale background refreshes from overwriting results
    // when user navigates between pages quickly
    const searchVersion = ++currentSearchVersion;

    // Include language in cache key to ensure language-specific results
    // Use normalizeParams for consistent hashing (sorted keys, normalized values)
    const cacheKey = 'search_' + config.language + '_' + hashString(normalizeParams(params as Record<string, unknown>));

    // Check cache (skip if forceRefresh)
    if (!options.forceRefresh) {
      const cached = CacheManager.get<APIResponse<Property[]>>(cacheKey, 'search');
      if (cached) {
        Logger.debug('[RealtySoft] Search results from cache (SWR: refreshing in background)');
        // SWR: Return cached immediately, refresh in background
        // Pass searchVersion so background refresh can check if still current
        refreshSearchInBackground(params, cacheKey, searchVersion);
        return cached;
      }
    }

    // No cache or forceRefresh - fetch directly
    return fetchFreshSearch(params, cacheKey);
  }

  /**
   * Cache a single property (language-specific)
   * Preserves higher total_images count from existing cached property
   */
  function cacheProperty(property: Property): void {
    if (!property || !property.id) return;
    // Include language in cache key since property content is language-specific
    const lang = config.language;
    const key = 'property_' + lang + '_' + property.id;

    // Preserve higher total_images count from existing cached property
    // Search results often return limited images (e.g., 5) while detail API returns all
    const existingProperty = CacheManager.get<Property>(key, 'property');
    if (existingProperty && existingProperty.total_images > property.total_images) {
      property = { ...property, total_images: existingProperty.total_images };
    }

    CacheManager.set(key, property);
    if (property.ref) {
      const refKey = 'property_ref_' + lang + '_' + property.ref;
      CacheManager.set(refKey, property);
    }
  }

  /**
   * Get cached property (language-specific)
   */
  function getCachedProperty(idOrRef: number | string, isRef: boolean = false): Property | null {
    const lang = config.language;
    const key = isRef ? 'property_ref_' + lang + '_' + idOrRef : 'property_' + lang + '_' + idOrRef;
    return CacheManager.get<Property>(key, 'property');
  }

  /**
   * Fetch property from API and cache it
   */
  async function fetchAndCacheProperty(
    idOrRef: number | string,
    isRef: boolean = false
  ): Promise<{ data: Property; fromCache?: boolean }> {
    let result: APIResponse<RawProperty[]>;

    // Check for PHP-injected prefetch (started before widget loaded)
    const prefetch = (window as any).__rsPrefetch;
    const requestedRef = String(idOrRef).toLowerCase();
    const prefetchRef = (prefetch?.ref || '').toLowerCase();

    // RACE CONDITION FIX: Strict validation - prefetch ref must EXACTLY match requested ref (case-insensitive)
    if (prefetch?.property && isRef && prefetchRef === requestedRef && prefetchRef !== '') {
      const prefetched = await prefetch.property;
      delete prefetch.property; // Consume once

      // Double-check: validate the actual property data matches what we asked for
      if (prefetched) {
        const prefetchedData = prefetched as APIResponse<RawProperty[]>;
        const propData = Array.isArray(prefetchedData.data) ? prefetchedData.data[0] : prefetchedData.data;
        const actualRef = (propData?.ref || propData?.ref_no || propData?.reference || '').toLowerCase();

        if (actualRef === requestedRef) {
          Logger.debug('[RealtySoft] Property loaded from PHP prefetch:', requestedRef);
          result = prefetchedData;
        } else {
          console.warn('[RealtySoft] Prefetch data mismatch - expected:', requestedRef, 'got:', actualRef, '- fetching from API');
          delete (window as any).__rsPrefetch; // Clear stale prefetch entirely
          const params = isRef ? { ref_no: idOrRef } : { id: idOrRef };
          result = await request<APIResponse<RawProperty[]>>('v1/property', params);
        }
      } else {
        const params = isRef ? { ref_no: idOrRef } : { id: idOrRef };
        result = await request<APIResponse<RawProperty[]>>('v1/property', params);
      }
    } else {
      // Clear stale prefetch if ref doesn't match
      if (prefetch?.property && isRef && prefetchRef !== requestedRef) {
        Logger.debug('[RealtySoft] Clearing stale prefetch - expected:', requestedRef, 'prefetch has:', prefetchRef);
        delete (window as any).__rsPrefetch;
      }
      const params = isRef ? { ref_no: idOrRef } : { id: idOrRef };
      result = await request<APIResponse<RawProperty[]>>('v1/property', params);
    }

    let property: Property | null = null;
    if (result && result.data) {
      if (Array.isArray(result.data) && result.data.length > 0) {
        property = normalizeProperty(result.data[0]);
      } else if (!Array.isArray(result.data)) {
        property = normalizeProperty(result.data as unknown as RawProperty);
      }
    } else if (result && !result.data) {
      property = normalizeProperty(result as unknown as RawProperty);
    }

    if (property) {
      cacheProperty(property);
      return { data: property };
    }

    throw new Error('Property not found');
  }

  /**
   * Get single property details
   */
  async function getProperty(
    id: number,
    options: { forceRefresh?: boolean; skipBackgroundRefresh?: boolean } = {}
  ): Promise<{ data: Property; fromCache?: boolean }> {
    const cached = getCachedProperty(id);
    if (cached && !options.forceRefresh) {
      Logger.debug('[RealtySoft] Property loaded from cache:', id);
      if (!options.skipBackgroundRefresh) {
        fetchAndCacheProperty(id, false).catch(() => {});
      }
      return { data: cached, fromCache: true };
    }

    return await fetchAndCacheProperty(id, false);
  }

  /**
   * Get property by reference
   */
  async function getPropertyByRef(
    ref: string,
    options: { forceRefresh?: boolean; skipBackgroundRefresh?: boolean } = {}
  ): Promise<{ data: Property; fromCache?: boolean }> {
    const cached = getCachedProperty(ref, true);
    if (cached && !options.forceRefresh) {
      Logger.debug('[RealtySoft] Property loaded from cache (ref):', ref);
      if (!options.skipBackgroundRefresh) {
        fetchAndCacheProperty(ref, true).catch(() => {});
      }
      return { data: cached, fromCache: true };
    }

    return await fetchAndCacheProperty(ref, true);
  }

  /**
   * Prefetch property details
   */
  async function prefetchProperty(idOrRef: number | string, isRef: boolean = false): Promise<void> {
    const cached = getCachedProperty(idOrRef, isRef);
    if (cached) return;

    try {
      await fetchAndCacheProperty(idOrRef, isRef);
      Logger.debug('[RealtySoft] Prefetched property:', idOrRef);
    } catch (e) {
      // Silently ignore prefetch errors
    }
  }

  /**
   * Get related properties
   */
  async function getRelatedProperties(
    propertyId: number,
    limit: number = 6
  ): Promise<APIResponse<Property[]>> {
    const result = await request<APIResponse<RawProperty[]>>('v1/property', {
      related_to: propertyId,
      per_page: limit,
    });

    return {
      ...result,
      data: normalizeProperties(result.data),
    };
  }

  /**
   * Submit inquiry
   */
  async function submitInquiry(
    data: InquiryData
  ): Promise<{ success: boolean; message?: string }> {
    const url =
      config.inquiryEndpoint || 'https://smartpropertywidget.com/spw/php/send-inquiry.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      const errorMsg = result.message || result.error || 'Failed to submit inquiry';
      console.error('Inquiry error:', errorMsg);
      throw new Error(errorMsg);
    }

    return result;
  }

  /**
   * Get wishlist properties
   */
  async function getWishlistProperties(ids: number[]): Promise<APIResponse<Property[]>> {
    if (!ids.length) return { data: [], total: 0 };
    const result = await request<APIResponse<RawProperty[]>>('v1/property', {
      ids: ids.join(','),
    });
    return {
      ...result,
      data: normalizeProperties(result.data),
    };
  }

  /**
   * Clear search-specific cache entries
   * Called when filters change to ensure fresh results
   */
  function clearSearchCache(): void {
    const searchPrefix = CacheManager.CACHE_PREFIX + 'search_';

    // Clear L1 (memory cache)
    const memoryKeysToRemove: string[] = [];
    memoryCache.forEach((_, key) => {
      if (key.startsWith(searchPrefix) || key.startsWith('search_')) {
        memoryKeysToRemove.push(key);
      }
    });
    memoryKeysToRemove.forEach(key => memoryCache.delete(key));

    // Clear L2 (localStorage)
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(searchPrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      Logger.debug('[RealtySoft API] Cleared', keysToRemove.length + memoryKeysToRemove.length, 'search cache entries');
    } catch (e) {
      console.warn('[RealtySoft API] Error clearing search cache from localStorage:', e);
    }
  }

  /**
   * Clear static data cache (locations, property types, features)
   * Use this to force fresh dropdown data with updated property counts
   */
  function clearStaticDataCache(): void {
    const prefixes = ['locations', 'parentLocations', 'childLocations_', 'propertyTypes_', 'features_'];

    // Clear L1 (memory cache)
    const memoryKeysToRemove: string[] = [];
    memoryCache.forEach((_, key) => {
      const cacheKey = key.startsWith(CacheManager.CACHE_PREFIX)
        ? key.slice(CacheManager.CACHE_PREFIX.length)
        : key;
      if (prefixes.some(prefix => cacheKey.startsWith(prefix))) {
        memoryKeysToRemove.push(key);
      }
    });
    memoryKeysToRemove.forEach(key => memoryCache.delete(key));

    // Clear L2 (localStorage)
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CacheManager.CACHE_PREFIX)) {
          const cacheKey = key.slice(CacheManager.CACHE_PREFIX.length);
          if (prefixes.some(prefix => cacheKey.startsWith(prefix))) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      Logger.debug('[RealtySoft API] Cleared', keysToRemove.length + memoryKeysToRemove.length, 'static data cache entries');
    } catch (e) {
      console.warn('[RealtySoft API] Error clearing static data cache:', e);
    }
  }

  /**
   * Clear all language-dependent caches
   * Used when language changes to force fresh translated data from API
   */
  function clearPropertyCache(): void {
    const prefixes = [
      'property_',
      'property_ref_',
      'search_',
      'propertyTypes_',
      'features_',
      'labels_'
    ];

    // Clear from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CacheManager.CACHE_PREFIX)) {
          const cacheKey = key.slice(CacheManager.CACHE_PREFIX.length);
          if (prefixes.some(prefix => cacheKey.startsWith(prefix))) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      Logger.debug('[RealtySoft API] Cleared', keysToRemove.length, 'property cache entries from localStorage');
    } catch (e) {
      console.warn('[RealtySoft API] Error clearing property cache from localStorage:', e);
    }

    // Clear from in-memory LRU cache
    // We need to iterate and remove matching entries
    const memoryKeysToRemove: string[] = [];
    memoryCache.forEach((_, key) => {
      const cacheKey = key.startsWith(CacheManager.CACHE_PREFIX)
        ? key.slice(CacheManager.CACHE_PREFIX.length)
        : key;
      if (prefixes.some(prefix => cacheKey.startsWith(prefix))) {
        memoryKeysToRemove.push(key);
      }
    });
    memoryKeysToRemove.forEach(key => memoryCache.delete(key));
    Logger.debug('[RealtySoft API] Cleared', memoryKeysToRemove.length, 'property cache entries from memory');
  }

  // Public API
  return {
    init,
    request,
    getLocations,
    getParentLocations,
    getChildLocations,
    searchLocations,
    getRelevantLocations,
    getPropertyTypes,
    getFeatures,
    getLabels,
    getAllLabels,
    searchProperties,
    getProperty,
    getPropertyByRef,
    getRelatedProperties,
    submitInquiry,
    getWishlistProperties,
    prefetchProperty,
    getCachedProperty,
    cacheProperty,
    clearCache: CacheManager.clear.bind(CacheManager),
    cleanupCache: CacheManager.cleanup.bind(CacheManager),
    clearSearchCache,
    clearStaticDataCache,
    clearPropertyCache,
    incrementSearchVersion,
  };
})();

// Assign to window for backwards compatibility
if (typeof window !== 'undefined') {
  (window as unknown as { RealtySoftAPI: RealtySoftAPIModule }).RealtySoftAPI = RealtySoftAPI;
}

// Export for ES modules
export { RealtySoftAPI };
export default RealtySoftAPI;
