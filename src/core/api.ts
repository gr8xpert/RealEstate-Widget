/**
 * RealtySoft Widget v3 - API Service
 * Handles all API communication through proxy
 */

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
  url?: string;
  link?: string;
  permalink?: string;
  listing_type?: string;
  listing_type_id?: { code?: string; name?: string };
  status?: string;
  listing_status?: string;
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
   */
  const DEFAULT_CACHE_TTL: Record<CacheTTLCategory, number> = {
    locations: 24 * 60 * 60 * 1000,     // 24 hours
    propertyTypes: 24 * 60 * 60 * 1000, // 24 hours
    features: 24 * 60 * 60 * 1000,      // 24 hours
    labels: 24 * 60 * 60 * 1000,        // 24 hours
    search: 24 * 60 * 60 * 1000,        // 24 hours
    property: 60 * 60 * 1000,           // 1 hour
  };

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

      // L2: Write to localStorage (non-fatal on failure)
      try {
        localStorage.setItem(fullKey, JSON.stringify({ data, timestamp }));
      } catch (e) {
        console.warn('Cache write error (localStorage):', e);
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

  // In-flight request deduplication - prevents duplicate concurrent API requests
  const pendingRequests = new Map<string, Promise<unknown>>();

  let config: APIConfig = {
    proxyUrl: 'https://realtysoft.ai/propertymanager/php/api-proxy.php',
    inquiryEndpoint: 'https://realtysoft.ai/propertymanager/php/send-inquiry.php',
    apiKey: null,
    apiUrl: null,
    language: 'en_US',
  };

  /**
   * Initialize API with config
   */
  function init(options: Partial<APIConfig>): void {
    config = { ...config, ...options };
    // Reset cache config: use provided config or defaults
    cacheConfig = options.cache ? { ...options.cache } : {};
    const maxEntries = cacheConfig.maxCacheEntries ?? 100;
    memoryCache = new LRUCache<{ data: unknown; timestamp: number }>(maxEntries);
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
      console.log('[RealtySoft] Deduplicating request:', endpoint);
      return pendingRequests.get(requestKey) as Promise<T>;
    }

    const url = new URL(config.proxyUrl, window.location.origin);

    // Add endpoint to params
    const requestParams: Record<string, unknown> = { ...params, _endpoint: endpoint };

    // Add language unless skipped
    if (!options.skipLang) {
      requestParams._lang = config.language;
    }

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
   * Get locations (v1 endpoint, no language param)
   */
  async function getLocations(parentId: number | null = null): Promise<APIResponse<Location[]>> {
    const cacheKey = 'locations' + (parentId ? '_' + parentId : '');

    // Check cache first
    const cached = CacheManager.get<APIResponse<Location[]>>(cacheKey, 'locations');
    if (cached) {
      console.log('[RealtySoft] Locations loaded from cache');
      return cached;
    }

    // Fetch ALL locations in a single request with high limit
    const params: Record<string, unknown> = { page: 1, limit: 1000 };
    if (parentId) params.parent_id = parentId;

    const response = await request<APIResponse<Location[]>>('v1/location', params, 'GET', {
      skipLang: true,
    });

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
    console.log('[RealtySoft] Locations cached');

    return result;
  }

  /**
   * Get parent/top-level locations only
   */
  async function getParentLocations(): Promise<APIResponse<Location[]>> {
    const cacheKey = 'parentLocations';

    // Check cache first
    const cached = CacheManager.get<APIResponse<Location[]>>(cacheKey, 'locations');
    if (cached) {
      console.log('[RealtySoft] Parent locations loaded from cache');
      return cached;
    }

    const result = await request<APIResponse<Location[]>>(
      'v1/location',
      { parent_id: 0 },
      'GET',
      { skipLang: true }
    );

    // Cache the result
    CacheManager.set(cacheKey, result);
    console.log('[RealtySoft] Parent locations cached');

    return result;
  }

  /**
   * Get child locations for a specific parent
   */
  async function getChildLocations(parentId: number): Promise<APIResponse<Location[]>> {
    const cacheKey = 'childLocations_' + parentId;

    // Check cache first
    const cached = CacheManager.get<APIResponse<Location[]>>(cacheKey, 'locations');
    if (cached) {
      console.log('[RealtySoft] Child locations loaded from cache for parent:', parentId);
      return cached;
    }

    const result = await request<APIResponse<Location[]>>(
      'v1/location',
      { parent_id: parentId },
      'GET',
      { skipLang: true }
    );

    // Cache the result
    CacheManager.set(cacheKey, result);
    console.log('[RealtySoft] Child locations cached for parent:', parentId);

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
      console.log('[RealtySoft] Property types loaded from cache');
      return cached;
    }

    const result = await request<APIResponse<PropertyType[]>>('v1/property_types');

    // Cache the result
    CacheManager.set(cacheKey, result);
    console.log('[RealtySoft] Property types cached');

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
      console.log('[RealtySoft] Features loaded from cache');
      return cached;
    }

    const result = await request<APIResponse<Feature[]>>('v1/property_features');

    // Cache the result
    CacheManager.set(cacheKey, result);
    console.log('[RealtySoft] Features cached');

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
      console.log('[RealtySoft] Labels loaded from cache');
      return cached;
    }

    // Check for PHP-injected prefetch (started before widget loaded)
    const prefetch = (window as any).__rsPrefetch;
    let result: Record<string, string>;
    if (prefetch?.labels && (!prefetch.lang || prefetch.lang === config.language)) {
      const prefetched = await prefetch.labels;
      delete prefetch.labels; // Consume once
      if (prefetched) {
        console.log('[RealtySoft] Labels loaded from PHP prefetch');
        result = prefetched;
      } else {
        result = await request<Record<string, string>>('v1/plugin_labels');
      }
    } else {
      result = await request<Record<string, string>>('v1/plugin_labels');
    }

    // Cache the result
    CacheManager.set(cacheKey, result);
    console.log('[RealtySoft] Labels cached');

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
   * Normalize property data from API to expected format
   */
  function normalizeProperty(property: RawProperty | null): Property | null {
    if (!property) return null;

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

    // Extract location name
    const locationName =
      (property.location_id as { name?: string })?.name ||
      (property.location as { name?: string })?.name ||
      property.city_id?.name ||
      property.municipality_id?.name ||
      (typeof property.location === 'string' ? property.location : '') ||
      property.address ||
      '';

    // Extract type name
    const typeName =
      property.type_id?.name ||
      (property.type as { name?: string })?.name ||
      property.property_type?.name ||
      (typeof property.type === 'string' ? property.type : '') ||
      '';

    // Determine listing type
    const listingType =
      property.listing_type || property.listing_type_id?.code || property.status || 'resale';

    // Extract features
    let features: PropertyFeature[] = [];
    const rawFeatures = property.features || property.amenities;
    if (rawFeatures && Array.isArray(rawFeatures)) {
      features = rawFeatures
        .map((f): PropertyFeature | null => {
          if (typeof f === 'string') return { name: f, category: 'Features' };
          const name = f.name || f.label || f.title || '';
          if (!name) return null;
          return {
            name,
            category: f.attr_id?.name || f.category || 'Features',
          };
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

    return {
      id: property.id,
      title: property.title || property.name || property.headline || '',
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
      total_images: property.images?.length || 0,
      url: property.url || property.link || property.permalink || null,
      listing_type: listingType,
      status: property.status || property.listing_type_id?.name || property.listing_status || '',
      type: typeName,
      is_featured: toBoolean(property.is_featured),
      is_own: toBoolean(property.is_own),
      is_new: toBoolean(property.is_new),
      is_exclusive: toBoolean(property.is_exclusive),
      description: property.desc || property.description || property.full_description || '',
      short_description: property.short_description || property.summary || '',
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
   * Search properties
   */
  async function searchProperties(
    params: Partial<SearchParams>
  ): Promise<APIResponse<Property[]>> {
    const cacheKey = 'search_' + hashString(JSON.stringify(params));

    // Check cache
    const cached = CacheManager.get<APIResponse<Property[]>>(cacheKey, 'search');
    if (cached) {
      console.log('[RealtySoft] Search results from cache');
      return cached;
    }

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
      console.log('[RealtySoft] Search results cached');
    }

    return normalizedResult;
  }

  /**
   * Cache a single property
   */
  function cacheProperty(property: Property): void {
    if (!property || !property.id) return;
    const key = 'property_' + property.id;
    CacheManager.set(key, property);
    if (property.ref) {
      const refKey = 'property_ref_' + property.ref;
      CacheManager.set(refKey, property);
    }
  }

  /**
   * Get cached property
   */
  function getCachedProperty(idOrRef: number | string, isRef: boolean = false): Property | null {
    const key = isRef ? 'property_ref_' + idOrRef : 'property_' + idOrRef;
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
          console.log('[RealtySoft] Property loaded from PHP prefetch:', requestedRef);
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
        console.log('[RealtySoft] Clearing stale prefetch - expected:', requestedRef, 'prefetch has:', prefetchRef);
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
      console.log('[RealtySoft] Property loaded from cache:', id);
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
      console.log('[RealtySoft] Property loaded from cache (ref):', ref);
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
      console.log('[RealtySoft] Prefetched property:', idOrRef);
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
      config.inquiryEndpoint || 'https://realtysoft.ai/propertymanager/php/send-inquiry.php';
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
  };
})();

// Assign to window for backwards compatibility
if (typeof window !== 'undefined') {
  (window as unknown as { RealtySoftAPI: RealtySoftAPIModule }).RealtySoftAPI = RealtySoftAPI;
}

// Export for ES modules
export { RealtySoftAPI };
export default RealtySoftAPI;
