/**
 * RealtySoft Widget v3 - State Management
 * Central state store with pub/sub pattern
 */

import type {
  FilterState,
  LockedFilters,
  ResultsState,
  UIState,
  AppState,
  WidgetConfig,
  Property,
  Location,
  PropertyType,
  Feature,
  SearchParams,
  SubscriptionCallback,
  UnsubscribeFunction,
  RealtySoftStateModule,
  MapState,
} from '../types/index';

// Type for subscribers map
type SubscribersMap = Record<string, SubscriptionCallback[]>;

const RealtySoftState: RealtySoftStateModule = (function () {
  'use strict';

  // Private state with proper typing
  const state: AppState = {
    // Search filters
    filters: {
      location: null,
      locationName: '',
      listingType: null,
      propertyType: null,
      propertyTypeName: '',
      bedsMin: null,
      bedsMax: null,
      bathsMin: null,
      bathsMax: null,
      priceMin: null,
      priceMax: null,
      builtMin: null,
      builtMax: null,
      plotMin: null,
      plotMax: null,
      features: [],
      ref: '',
    },

    // Locked filters (from data attributes)
    lockedFilters: {},

    // Results
    results: {
      properties: [],
      total: 0,
      page: 1,
      perPage: 12,
      totalPages: 0,
    },

    // Current property (detail page)
    currentProperty: null,

    // UI state
    ui: {
      view: 'grid',
      sort: 'create_date_desc',
      loading: true, // Start with loading true so components show loader on init
      error: null,
    },

    // Map state
    map: {
      bounds: {
        ne: null,
        sw: null,
      },
      zoom: 10,
      center: null,
    },

    // Wishlist
    wishlist: [],

    // Data from API
    data: {
      locations: [],
      propertyTypes: [],
      features: [],
      labels: {},
    },

    // Config
    config: {
      apiKey: null,
      apiUrl: null,
      language: 'en_US',
      ownerEmail: null,
      privacyPolicyUrl: null,
      features: [],
      propertyPageSlug: 'property',
      useWidgetPropertyTemplate: true,
      useQueryParamUrls: false,
      propertyUrlFormat: 'seo',
      resultsPage: '',
      defaultCountryCode: 'ES',
      inquiryThankYouMessage: null,
      inquiryThankYouUrl: null,
    },
  };

  // Subscribers
  const subscribers: SubscribersMap = {};

  /**
   * Get current state (immutable copy)
   */
  function getState(): AppState {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Get specific state path
   * @param path - Dot notation path (e.g., 'filters.location')
   */
  function get<T = unknown>(path: string): T {
    const keys = path.split('.');
    let value: unknown = state;

    for (const key of keys) {
      if (value === undefined || value === null) {
        return undefined as T;
      }
      value = (value as Record<string, unknown>)[key];
    }

    // Return undefined directly if value doesn't exist
    if (value === undefined) {
      return undefined as T;
    }

    // Deep clone the value to prevent mutations
    return JSON.parse(JSON.stringify(value)) as T;
  }

  /**
   * Set state value
   * @param path - Dot notation path
   * @param value - New value
   */
  function set(path: string, value: unknown): void {
    const keys = path.split('.');
    let current: Record<string, unknown> = state as unknown as Record<string, unknown>;

    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === undefined) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;

    // Notify subscribers
    notify(path, value, oldValue);
  }

  /**
   * Update multiple values at once
   * @param updates - Object with path:value pairs
   */
  function setMultiple(updates: Record<string, unknown>): void {
    for (const [path, value] of Object.entries(updates)) {
      set(path, value);
    }
  }

  /**
   * Subscribe to state changes
   * @param path - State path to watch (or '*' for all)
   * @param callback - Function to call on change
   * @returns Unsubscribe function
   */
  function subscribe<T = unknown>(
    path: string,
    callback: SubscriptionCallback<T>
  ): UnsubscribeFunction {
    if (!subscribers[path]) {
      subscribers[path] = [];
    }
    subscribers[path].push(callback as SubscriptionCallback);

    // Return unsubscribe function
    return function unsubscribe(): void {
      const index = subscribers[path].indexOf(callback as SubscriptionCallback);
      if (index > -1) {
        subscribers[path].splice(index, 1);
      }
    };
  }

  /**
   * Notify subscribers of state change
   */
  function notify(path: string, newValue: unknown, oldValue: unknown): void {
    // Notify exact path subscribers
    if (subscribers[path]) {
      subscribers[path].forEach((cb) => cb(newValue, oldValue, path));
    }

    // Notify parent path subscribers
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      if (subscribers[parentPath]) {
        subscribers[parentPath].forEach((cb) => cb(get(parentPath), null, path));
      }
    }

    // Notify wildcard subscribers
    if (subscribers['*']) {
      subscribers['*'].forEach((cb) => cb(newValue, oldValue, path));
    }
  }

  /**
   * Reset filters to defaults (respecting locked filters)
   */
  function resetFilters(): void {
    const defaults: FilterState = {
      location: null,
      locationName: '',
      listingType: null,
      propertyType: null,
      propertyTypeName: '',
      bedsMin: null,
      bedsMax: null,
      bathsMin: null,
      bathsMax: null,
      priceMin: null,
      priceMax: null,
      builtMin: null,
      builtMax: null,
      plotMin: null,
      plotMax: null,
      features: [],
      ref: '',
    };

    // Apply defaults but keep locked values
    const locked = state.lockedFilters;

    // Set each filter individually to notify all subscribers
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const lockedValue = locked[key];
      const value =
        lockedValue !== null && lockedValue !== undefined ? lockedValue : defaultValue;
      set('filters.' + key, value);
    }

    set('results.page', 1);
  }

  /**
   * Set locked filters from data attributes
   */
  function setLockedFilters(locked: LockedFilters): void {
    state.lockedFilters = { ...locked };

    // Apply locked filters to current filters
    for (const [key, value] of Object.entries(locked)) {
      if (value !== null && value !== undefined) {
        set(`filters.${key}`, value);
      }
    }
  }

  /**
   * Check if a filter is locked
   */
  function isFilterLocked(filterName: string): boolean {
    return (
      state.lockedFilters[filterName] !== undefined &&
      state.lockedFilters[filterName] !== null
    );
  }

  /**
   * Build search params from current filters
   * Uses API parameter names expected by Inmolink/CRM API
   */
  function getSearchParams(): SearchParams {
    const f = state.filters;
    const params: Partial<SearchParams> = {};

    // Location - API expects 'location_id'
    if (f.location) {
      params.location_id = Array.isArray(f.location)
        ? f.location.join(',')
        : f.location;
    }

    // Listing type - API expects 'listing_type'
    if (f.listingType) {
      params.listing_type = f.listingType;
    }

    // Property type - API expects 'type_id'
    if (f.propertyType) {
      params.type_id = Array.isArray(f.propertyType)
        ? f.propertyType.join(',')
        : f.propertyType;
    }

    // Bedrooms - API expects 'bedrooms_min', 'bedrooms_max'
    if (f.bedsMin) params.bedrooms_min = f.bedsMin;
    if (f.bedsMax) params.bedrooms_max = f.bedsMax;

    // Bathrooms - API expects 'bathrooms_min', 'bathrooms_max'
    if (f.bathsMin) params.bathrooms_min = f.bathsMin;
    if (f.bathsMax) params.bathrooms_max = f.bathsMax;

    // Price - API expects 'list_price_min', 'list_price_max'
    if (f.priceMin) params.list_price_min = f.priceMin;
    if (f.priceMax) params.list_price_max = f.priceMax;

    // Built area - API expects 'build_size_min', 'build_size_max'
    if (f.builtMin) params.build_size_min = f.builtMin;
    if (f.builtMax) params.build_size_max = f.builtMax;

    // Plot size - API expects 'plot_size_min', 'plot_size_max'
    if (f.plotMin) params.plot_size_min = f.plotMin;
    if (f.plotMax) params.plot_size_max = f.plotMax;

    // Features - comma-separated IDs
    if (f.features && f.features.length) {
      params.features = f.features.join(',');
    }

    // Reference - API expects 'ref_no'
    if (f.ref) params.ref_no = f.ref;

    // Pagination and sorting
    params.page = state.results.page;
    params.limit = state.results.perPage;
    params.order = state.ui.sort;

    return params as SearchParams;
  }

  /**
   * Wishlist management
   */
  function addToWishlist(propertyId: number): void {
    if (!state.wishlist.includes(propertyId)) {
      state.wishlist.push(propertyId);
      saveWishlist();
      notify('wishlist', state.wishlist, null);
    }
  }

  function removeFromWishlist(propertyId: number): void {
    const index = state.wishlist.indexOf(propertyId);
    if (index > -1) {
      state.wishlist.splice(index, 1);
      saveWishlist();
      notify('wishlist', state.wishlist, null);
    }
  }

  function isInWishlist(propertyId: number): boolean {
    return state.wishlist.includes(propertyId);
  }

  function loadWishlist(): void {
    try {
      const stored = localStorage.getItem('rs_wishlist');
      if (stored) {
        state.wishlist = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load wishlist from localStorage');
    }
  }

  function saveWishlist(): void {
    try {
      localStorage.setItem('rs_wishlist', JSON.stringify(state.wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage');
    }
  }

  // Initialize wishlist from localStorage
  loadWishlist();

  // Public API
  return {
    getState,
    get,
    set,
    setMultiple,
    subscribe,
    resetFilters,
    setLockedFilters,
    isFilterLocked,
    getSearchParams,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
})();

// Assign to window for backwards compatibility
if (typeof window !== 'undefined') {
  (window as unknown as { RealtySoftState: RealtySoftStateModule }).RealtySoftState =
    RealtySoftState;
}

// Export for ES modules
export { RealtySoftState };
export default RealtySoftState;
