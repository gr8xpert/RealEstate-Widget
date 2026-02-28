/**
 * RealtySoft Widget v3 - Central Controller
 * Main entry point that initializes and coordinates all modules
 */

// Import TypeScript modules
import { RealtySoftState } from './state';
import { RealtySoftAPI } from './api';
import { RealtySoftLabels } from './labels';
import { RealtySoftAnalytics } from './analytics';
import { RealtySoftRouter } from './router';
import { RealtySoftSubscription } from './subscription';
import type {
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  RealtySoftLabelsModule,
  RealtySoftAnalyticsModule,
  Property,
  FilterState,
  SearchParams,
  WidgetConfig,
  ComponentOptions,
  LockedFilters,
} from '../types/index';

// Extended config type for controller-specific options
interface ControllerConfig {
  language?: string;
  apiKey?: string;
  apiUrl?: string;
  analytics?: boolean;
  debug?: boolean;
  ownerEmail?: string;
  privacyPolicyUrl?: string;
  defaultCountryCode?: string;
  inquiryThankYouMessage?: string;
  inquiryThankYouUrl?: string;
  propertyPageSlug?: string;
  useWidgetPropertyTemplate?: boolean;
  useQueryParamUrls?: boolean;
  propertyUrlFormat?: string;
  resultsPage?: string;
  detailPageTitle?: string;
  labelsMode?: 'static' | 'api' | 'hybrid';
  labelOverrides?: import('../types/index').LabelOverrides;
  cache?: import('../types/index').CacheConfig;
  serviceWorker?: boolean;
  serviceWorkerUrl?: string;
  wpRestUrl?: string;
  wpApiNonce?: string;
  siteName?: string;
  enableMapView?: boolean;
  perPage?: number;      // Items per page for grid/list view (default: 12)
  mapPerPage?: number;   // Items per page for map view (default: 200)
}

// Widget mode type
type WidgetMode = 'combined' | 'search-only' | 'results-only' | null;

// Component constructor type
type ComponentConstructor = new (
  element: HTMLElement,
  options: ComponentOptions
) => { render?: () => void };

// Component instance type
interface ComponentInstance {
  render?: () => void;
  bindEvents?: () => void;
  [key: string]: unknown;
}

// HTML Element with component reference
interface RSHTMLElement extends HTMLElement {
  _rsComponent?: ComponentInstance;
}

// Cast to allow flexibility in return type
const RealtySoft = (function () {
  'use strict';

  // ── Early Content Hiding ──────────────────────────────────────
  // Injected synchronously during script parse so the browser hides
  // the page *before* first paint when we are on a property-detail URL.
  // This prevents the "flash of 404" on CMS platforms that serve a 404
  // template before the widget JS can take over.
  (function earlyPropertyUrlHide() {
    // Skip if SSR preview is already visible (rendered server-side by WordPress plugin).
    // The preview IS the visible content — no hiding needed.
    if ((window as any).__rsSSR) return;

    // Skip if PHP (WordPress plugin) already injected the early-hide CSS + spinner.
    // PHP handles it faster since it's in the initial HTML (no JS loading delay).
    if (document.getElementById('rs-early-hide')) {
      // Still add the body class for conditional CSS
      document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('rs-property-detail');
      });
      // Safety: auto-remove after 5 seconds if widget fails to initialize
      setTimeout(() => {
        document.body.classList.add('rs-property-ready');
        const existing = document.getElementById('rs-early-hide');
        if (existing) existing.remove();
        const overlay = document.getElementById('rs-loading-overlay');
        if (overlay) overlay.remove();
      }, 5000);
      return;
    }

    const config = (window as any).RealtySoftConfig || {};
    const slug = config.propertyPageSlug || 'property';
    // Only hide on property DETAIL URLs (slug + subpath), not the listing page itself
    // Also check query param format: /property?ref=X
    const hasSubpath = new RegExp('/' + slug + '/[^/]+', 'i').test(window.location.pathname);
    const hasQueryRef = /[?&]ref(erence)?=/i.test(window.location.search);
    if (!hasSubpath && !hasQueryRef) return;

    // Add body class for conditional CSS (listing vs detail)
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('rs-property-detail');
    });

    const style = document.createElement('style');
    style.id = 'rs-early-hide';
    style.textContent =
      'body:not(.rs-property-ready) > *:not(script):not(style):not(link):not(header):not(footer):not(.elementor-location-header):not(.elementor-location-footer):not([data-elementor-type="header"]):not([data-elementor-type="footer"]) {' +
      '  visibility: hidden !important;' +
      '}' +
      'body:not(.rs-property-ready)::after {' +
      '  content: "";' +
      '  position: fixed;' +
      '  top: 0; left: 0; right: 0; bottom: 0;' +
      '  background: #fff;' +
      '  z-index: 999999;' +
      '}';
    (document.head || document.documentElement).appendChild(style);

    // Safety: auto-remove after 5 seconds if widget fails to initialize
    setTimeout(() => {
      document.body.classList.add('rs-property-ready');
      style.remove();
    }, 5000);
  })();

  // ── Logger Utility ──────────────────────────────────────────────
  // Centralized logging that respects debug config
  const Logger = {
    _isDebug: (): boolean => {
      const config = (window as any).RealtySoftConfig || {};
      return config.debug === true;
    },

    // Info level - only in debug mode
    info: (message: string, ...args: unknown[]): void => {
      if (Logger._isDebug()) {
        console.log(message, ...args);
      }
    },

    // Debug level - only in debug mode
    debug: (message: string, ...args: unknown[]): void => {
      if (Logger._isDebug()) {
        console.log(message, ...args);
      }
    },

    // Warnings - always show
    warn: (message: string, ...args: unknown[]): void => {
      console.warn(`[RealtySoft] ${message}`, ...args);
    },

    // Errors - always show
    error: (message: string, ...args: unknown[]): void => {
      console.error(`[RealtySoft] ${message}`, ...args);
    }
  };

  // Expose logger globally for other modules
  (window as any).RealtySoftLogger = Logger;

  // Component registry
  const components: Record<string, ComponentConstructor> = {};
  const componentInstances: ComponentInstance[] = [];

  // Initialization state
  let initialized = false;
  let initPromise: Promise<boolean> | null = null;

  /**
   * Transform API labels response into widget label format.
   * API returns: { count, data: [{ code: "location", es_ES: "Localidad" }, ...] }
   * Widget expects: { search_location: "Localidad", ... }
   */
  function transformAPILabels(
    rawData: unknown,
    language: string
  ): Record<string, string> {
    const result: Record<string, string> = {};

    // Handle different response shapes
    let items: Array<Record<string, string>> = [];
    const raw = rawData as Record<string, unknown>;

    // New format: { labels: {...}, enabledListingTypes: [...] }
    if (raw && raw.labels && typeof raw.labels === 'object' && !Array.isArray(raw.labels)) {
      return raw.labels as Record<string, string>;
    }

    if (raw && Array.isArray(raw.data)) {
      items = raw.data as Array<Record<string, string>>;
    } else if (Array.isArray(rawData)) {
      items = rawData as Array<Record<string, string>>;
    } else if (raw && !raw.data && !raw.count) {
      // Already a flat key-value object — return as-is
      return raw as Record<string, string>;
    }

    if (items.length === 0) return result;

    // API code → widget label key(s) mapping
    const codeMap: Record<string, string[]> = {
      location: ['search_location'],
      sublocation: ['search_sublocation'],
      property_type: ['search_property_type'],
      status: ['search_listing_type', 'search_listing_type_all', 'status'],
      bed: ['search_bedrooms', 'bedrooms'],
      bath: ['search_bathrooms', 'bathrooms'],
      price: ['search_price', 'price'],
      min_price: ['search_price_min', 'search_price_select_min'],
      max_price: ['search_price_max', 'search_price_select_max'],
      submit: ['search_button'],
      reset: ['search_reset'],
      ref: ['search_reference', 'detail_reference', 'card_ref'],
      features_heading: ['search_features', 'detail_features'],
      build_size_value: ['search_built_area', 'detail_built_area', 'build_size'],
      plot_size_value: ['search_plot_size', 'detail_plot_size', 'plot_size'],
      min_build: ['search_min'],
      max_build: ['search_max'],
      order_drop_down: ['results_sort', 'sort_by'],
      not_found_message: ['results_count_zero', 'no_results'],
      close_button: ['general_close', 'close'],
      more_button: ['pagination_load_more'],
      property_detail_ref_no: ['detail_reference'],
      property_detail_price: ['detail_price'],
      property_detail_description: ['detail_description'],
      property_detail_location: ['detail_location', 'location'],
      property_detail_sublocation: ['detail_sublocation'],
      property_detail_property_type: ['detail_property_type'],
      property_detail_bedrooms: ['bedrooms', 'card_beds'],
      property_detail_bathrooms: ['bathrooms', 'card_baths'],
      property_detail_plot_size: ['detail_plot_size'],
      property_detail_living_area: ['detail_built_area'],
      property_detail_terrace: ['detail_terrace'],
      property_listing_read_more_button: ['card_view', 'view_details'],
      property_listing_reference: ['card_ref'],
      property_listing_bedrooms: ['card_beds'],
      property_listing_bathrooms: ['card_baths'],
      property_listing_built_area: ['build_size'],
      property_listing_plot: ['plot_size'],
      property_listing_price: ['price'],
      property_listing_month: ['detail_per_month'],
      property_button_text: ['view_details', 'card_view'],
      property_property_sale: ['listing_type_sale', 'search_sale'],
      tab_sale: ['listing_type_sale', 'search_sale'],
      tab_rent: ['search_rent', 'listing_type_long_rental'],
      tab_holiday: ['listing_type_short_rental'],
      tab_dev: ['listing_type_new'],
    };

    for (const item of items) {
      const code = item.code;
      if (!code) continue;

      // Get value for current language, fall back to any available language value
      let value = item[language];
      if (!value) {
        // Try without region (e.g. 'es' from 'es_ES')
        const shortLang = language.split('_')[0];
        for (const key of Object.keys(item)) {
          if (key !== 'code' && key.startsWith(shortLang)) {
            value = item[key];
            break;
          }
        }
      }
      if (!value) continue;

      // Special handling for label_status_dropdown (pipe-separated listing types)
      if (code === 'label_status_dropdown') {
        const statusMap: Record<string, string> = {
          resale: 'listing_type_sale',
          development: 'listing_type_new',
          long_rental: 'listing_type_long_rental',
          short_rental: 'listing_type_short_rental',
        };
        const pairs = value.split(',');
        for (const pair of pairs) {
          const [typeKey, typeLabel] = pair.split('|');
          if (typeKey && typeLabel && statusMap[typeKey.trim()]) {
            result[statusMap[typeKey.trim()]] = typeLabel.trim();
          }
        }
        continue;
      }

      // Special handling for order_button (pipe-separated sort options)
      if (code === 'order_button') {
        const sortMap: Record<string, string> = {
          list_price_asc: 'sort_price_asc',
          list_price_desc: 'sort_price_desc',
          last_date_desc: 'sort_newest',
        };
        const pairs = value.split(',');
        for (const pair of pairs) {
          const [sortKey, sortLabel] = pair.split('|');
          if (sortKey && sortLabel && sortMap[sortKey.trim()]) {
            result[sortMap[sortKey.trim()]] = sortLabel.trim();
          }
        }
        continue;
      }

      // Map code to widget label key(s)
      const widgetKeys = codeMap[code];
      if (widgetKeys) {
        for (const wk of widgetKeys) {
          result[wk] = value;
        }
      } else {
        // Store unmapped codes directly (may match widget keys)
        result[code] = value;
      }
    }

    Logger.debug('[RealtySoft] Transformed', Object.keys(result).length, 'API labels for language:', language);
    return result;
  }

  /**
   * Extract enabledListingTypes from labels API response.
   * API returns: { labels: {...}, enabledListingTypes: ["resale", "development", ...] }
   * Returns null if not present (backwards compatibility - show all types).
   */
  function extractEnabledListingTypes(rawData: unknown): string[] | null {
    if (!rawData) return null;

    const raw = rawData as Record<string, unknown>;
    if (raw.enabledListingTypes && Array.isArray(raw.enabledListingTypes)) {
      return raw.enabledListingTypes as string[];
    }

    return null;
  }

  /**
   * Extract available language codes from the unfiltered labels API response.
   * API returns: { count, data: [{ code: "location", en_US: "Location", es_ES: "Localidad", ... }, ...] }
   * We scan item keys (excluding "code") to find all language codes present.
   */
  function extractAvailableLanguages(rawData: unknown): string[] {
    if (!rawData) return ['en_US'];

    const raw = rawData as Record<string, unknown>;
    let items: Array<Record<string, string>> = [];

    if (raw && Array.isArray(raw.data)) {
      items = raw.data as Array<Record<string, string>>;
    } else if (Array.isArray(rawData)) {
      items = rawData as Array<Record<string, string>>;
    }

    if (items.length === 0) return ['en_US'];

    const langCodes = new Set<string>();

    // Scan first few items to detect language keys
    const samplSize = Math.min(items.length, 10);
    for (let i = 0; i < samplSize; i++) {
      const item = items[i];
      for (const key of Object.keys(item)) {
        // Language keys match pattern like "en_US", "es_ES", "nl_NL", "pl_PL"
        if (key !== 'code' && /^[a-z]{2}_[A-Z]{2}$/.test(key)) {
          langCodes.add(key);
        }
      }
    }

    // Always include en_US as fallback
    langCodes.add('en_US');

    const result = Array.from(langCodes).sort();
    return result;
  }

  /**
   * Parse data attributes for locked filters
   */
  function parseLockedFilters(container: HTMLElement): LockedFilters {
    const locked: LockedFilters = {};
    const attrMap: Record<string, string> = {
      'rs-location': 'location',
      'rs-property-type': 'propertyType',
      'rs-listing-type': 'listingType',
      'rs-beds-min': 'bedsMin',
      'rs-beds-max': 'bedsMax',
      'rs-baths-min': 'bathsMin',
      'rs-baths-max': 'bathsMax',
      'rs-price-min': 'priceMin',
      'rs-price-max': 'priceMax',
      'rs-built-min': 'builtMin',
      'rs-built-max': 'builtMax',
      'rs-plot-min': 'plotMin',
      'rs-plot-max': 'plotMax',
      'rs-features': 'features',
      'rs-ref': 'ref',
    };

    const numericKeys = [
      'bedsMin',
      'bedsMax',
      'bathsMin',
      'bathsMax',
      'priceMin',
      'priceMax',
      'builtMin',
      'builtMax',
      'plotMin',
      'plotMax',
      'location',
      'propertyType',
    ];

    for (const [attr, key] of Object.entries(attrMap)) {
      const datasetKey = attr.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const value = container.dataset[datasetKey];
      if (value !== undefined && value !== '') {
        if (numericKeys.includes(key)) {
          locked[key] = parseInt(value, 10);
        } else if (key === 'features') {
          locked[key] = value.split(',').map((v) => parseInt(v.trim(), 10));
        } else {
          locked[key] = value;
        }
      }
    }

    return locked;
  }

  /**
   * Validate domain against whitelist
   */
  async function validateDomain(): Promise<boolean> {
    // In production, this would check against the PHP whitelist
    // For now, we trust the proxy to handle validation
    return true;
  }

  /**
   * Detect widget mode based on container presence
   */
  function detectMode(): WidgetMode {
    const hasSearch =
      !!document.getElementById('rs_search') ||
      !!document.querySelector('.rs-search-template-01') ||
      !!document.querySelector('.rs-search-template-02') ||
      !!document.querySelector('.rs-search-template-03') ||
      !!document.querySelector('.rs-search-template-04') ||
      !!document.querySelector('.rs-search-template-05') ||
      !!document.querySelector('.rs-search-template-06');
    let hasListing =
      !!document.getElementById('rs_listing') ||
      !!document.querySelector('.rs-listing-template-01') ||
      !!document.querySelector('.rs-listing-template-02') ||
      !!document.querySelector('.rs-listing-template-03') ||
      !!document.querySelector('.rs-listing-template-04') ||
      !!document.querySelector('.rs-listing-template-05') ||
      !!document.querySelector('.rs-listing-template-06') ||
      !!document.querySelector('.rs-listing-template-07') ||
      !!document.querySelector('.rs-listing-template-08') ||
      !!document.querySelector('.rs-listing-template-09') ||
      !!document.querySelector('.rs-listing-template-10') ||
      !!document.querySelector('.rs-listing-template-11') ||
      !!document.querySelector('.rs-listing-template-12') ||
      !!document.querySelector('.rs-map-search-template-01');

    // Standalone listings fetch their own data independently — don't count for widget mode
    if (hasListing) {
      const allListings = document.querySelectorAll(
        '#rs_listing, [class*="rs-listing-template-"]'
      );
      hasListing = Array.from(allListings).some(
        el => !el.hasAttribute('data-rs-standalone')
      );
    }

    if (hasSearch && hasListing) {
      return 'combined';
    } else if (hasSearch && !hasListing) {
      return 'search-only';
    } else if (!hasSearch && hasListing) {
      return 'results-only';
    }
    return null;
  }

  // Default fallback slugs for common languages (used if not configured)
  const DEFAULT_PROPERTY_SLUGS: Record<string, string> = {
    en: 'property',
    es: 'propiedad',
    de: 'immobilie',
    fr: 'propriete',
    nl: 'eigendom',
    pt: 'propriedade',
    it: 'proprieta',
    ru: 'nedvizhimost',
    pl: 'nieruchomosc',
    sv: 'fastighet',
    no: 'eiendom',
    da: 'ejendom',
    fi: 'kiinteisto',
  };

  const DEFAULT_RESULTS_SLUGS: Record<string, string> = {
    en: 'properties',
    es: 'propiedades',
    de: 'immobilien',
    fr: 'proprietes',
    nl: 'eigendommen',
    pt: 'propriedades',
    it: 'proprieta',
    ru: 'nedvizhimost',
    pl: 'nieruchomosci',
    sv: 'fastigheter',
    no: 'eiendommer',
    da: 'ejendomme',
    fi: 'kiinteistot',
  };

  /**
   * Get the current effective language code (2-letter code like 'es', 'de')
   */
  function getCurrentLanguageCode(): string {
    // Priority 1: Translation plugin's current language (from PHP)
    const currentLang = RealtySoftState.get<string>('config.currentLang');
    if (currentLang) return currentLang.toLowerCase();

    // Priority 2: Detect from URL path (e.g., /es/propiedad/... → 'es')
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})(?:\/|$)/i);
    if (langMatch) {
      const urlLang = langMatch[1].toLowerCase();
      // Verify it's a known language by checking if we have slugs for it
      const propertySlugs = RealtySoftState.get<Record<string, string>>('config.propertyPageSlugs') || {};
      if (propertySlugs[urlLang] || DEFAULT_PROPERTY_SLUGS[urlLang]) {
        return urlLang;
      }
    }

    // Priority 3: Detect language from current page slug
    // If current URL contains a language-specific slug, detect that language
    const propertySlugs = RealtySoftState.get<Record<string, string>>('config.propertyPageSlugs') || {};
    for (const [lang, slug] of Object.entries(propertySlugs)) {
      if (lang !== 'default' && slug && path.includes(`/${slug}/`)) {
        return lang.toLowerCase();
      }
    }

    // Priority 4: Widget language config (extract 2-letter code from locale like 'es_ES')
    const widgetLanguage = RealtySoftState.get<string>('config.language') || 'en_US';
    return widgetLanguage.split('_')[0].toLowerCase();
  }

  /**
   * Get results page URL for redirect in search-only mode
   * Respects language prefix and language-specific results page slug
   */
  function getResultsPageURL(): string {
    const langCode = getCurrentLanguageCode();
    const defaultLang = (RealtySoftState.get<string>('config.defaultLang') || 'en').toLowerCase();

    // Get results page slug for current language
    const resultsSlugs = RealtySoftState.get<Record<string, string>>('config.resultsPageSlugs') || {};

    // Try: 1. User config for this lang, 2. Default fallback for this lang, 3. 'default' key, 4. 'properties'
    const resultsSlug = resultsSlugs[langCode] ||
                        DEFAULT_RESULTS_SLUGS[langCode] ||
                        resultsSlugs['default'] ||
                        resultsSlugs[defaultLang] ||
                        'properties';

    // Get language prefix (only for non-default language with translation plugin)
    let languagePrefix = '';
    const translationPlugin = RealtySoftState.get<string>('config.translationPlugin');

    if (translationPlugin && translationPlugin !== 'none') {
      languagePrefix = RealtySoftState.get<string>('config.languagePrefix') || '';
    }

    return `${languagePrefix}/${resultsSlug}`;
  }

  /**
   * Universal property URL generator
   * Works with: Polylang, WPML, Weglot, TranslatePress, GTranslate, Widget Selector
   *
   * @param property - The property object containing ref, title, etc.
   * @returns The full URL path for the property detail page
   */
  function getPropertyUrl(property: Property): string {
    // If property already has a URL, use it
    if (property.url) return property.url;

    const langCode = getCurrentLanguageCode();
    const defaultLang = (RealtySoftState.get<string>('config.defaultLang') || 'en').toLowerCase();

    // Get property page slug for current language
    const propertySlugs = RealtySoftState.get<Record<string, string>>('config.propertyPageSlugs') || {};

    // Try: 1. User config for this lang, 2. Default fallback for this lang, 3. 'default' key, 4. Legacy single slug, 5. 'property'
    const slug = propertySlugs[langCode] ||
                 DEFAULT_PROPERTY_SLUGS[langCode] ||
                 propertySlugs['default'] ||
                 propertySlugs[defaultLang] ||
                 RealtySoftState.get<string>('config.propertyPageSlug') ||
                 'property';

    // Get language prefix (only for non-default language with translation plugin)
    let languagePrefix = '';
    const translationPlugin = RealtySoftState.get<string>('config.translationPlugin');

    if (translationPlugin && translationPlugin !== 'none') {
      languagePrefix = RealtySoftState.get<string>('config.languagePrefix') || '';
    }

    // Build URL based on format
    const urlFormat = RealtySoftState.get<string>('config.propertyUrlFormat') || 'seo';
    const ref = property.ref || property.id;

    if (urlFormat === 'query') {
      return `${languagePrefix}/${slug}?ref=${ref}`;
    }

    if (urlFormat === 'ref') {
      return `${languagePrefix}/${slug}/${ref}`;
    }

    // SEO format (default) - include title slug
    const title = property.title || property.name || '';
    const titleSlug = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .substring(0, 80); // Limit length

    if (titleSlug) {
      return `${languagePrefix}/${slug}/${titleSlug}-${ref}`;
    }
    return `${languagePrefix}/${slug}/${ref}`;
  }

  // Export getPropertyUrl for use by components
  (window as any).RealtySoftGetPropertyUrl = getPropertyUrl;

  /**
   * Build search URL with filter parameters
   */
  function buildSearchURL(filters: Partial<FilterState>): string {
    const baseURL = getResultsPageURL();
    const params = new URLSearchParams();

    if (filters.location) params.set('location', String(filters.location));
    if (filters.locationName) params.set('locationName', encodeURIComponent(filters.locationName));
    if (filters.sublocation) params.set('sublocation', String(filters.sublocation));
    if (filters.propertyType) params.set('type', String(filters.propertyType));
    if (filters.listingType) params.set('listing', filters.listingType);
    if (filters.bedsMin) params.set('beds', String(filters.bedsMin));
    if (filters.bathsMin) params.set('baths', String(filters.bathsMin));
    if (filters.priceMin) params.set('price_min', String(filters.priceMin));
    if (filters.priceMax) params.set('price_max', String(filters.priceMax));
    if (filters.builtMin) params.set('built_min', String(filters.builtMin));
    if (filters.builtMax) params.set('built_max', String(filters.builtMax));
    if (filters.plotMin) params.set('plot_min', String(filters.plotMin));
    if (filters.plotMax) params.set('plot_max', String(filters.plotMax));
    if (filters.ref) params.set('ref', filters.ref);
    if (filters.features && filters.features.length > 0) {
      params.set('features', filters.features.join(','));
    }

    const queryString = params.toString();
    return queryString ? `${baseURL}?${queryString}` : baseURL;
  }

  /**
   * Parse URL parameters and apply as filters
   */
  function parseURLFilters(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const filters: Partial<FilterState> = {};

    if (urlParams.has('location')) {
      const val = parseInt(urlParams.get('location') || '', 10);
      if (!isNaN(val)) filters.location = val;
    }
    if (urlParams.has('locationName')) {
      filters.locationName = decodeURIComponent(urlParams.get('locationName') || '');
    }
    if (urlParams.has('sublocation')) {
      const val = parseInt(urlParams.get('sublocation') || '', 10);
      if (!isNaN(val)) filters.sublocation = val;
    }
    if (urlParams.has('type')) {
      const val = parseInt(urlParams.get('type') || '', 10);
      if (!isNaN(val)) filters.propertyType = val;
    }
    if (urlParams.has('listing')) {
      filters.listingType = urlParams.get('listing') || undefined;
    }
    if (urlParams.has('beds')) {
      const val = parseInt(urlParams.get('beds') || '', 10);
      if (!isNaN(val)) filters.bedsMin = val;
    }
    if (urlParams.has('baths')) {
      const val = parseInt(urlParams.get('baths') || '', 10);
      if (!isNaN(val)) filters.bathsMin = val;
    }
    if (urlParams.has('price_min')) {
      const val = parseInt(urlParams.get('price_min') || '', 10);
      if (!isNaN(val)) filters.priceMin = val;
    }
    if (urlParams.has('price_max')) {
      const val = parseInt(urlParams.get('price_max') || '', 10);
      if (!isNaN(val)) filters.priceMax = val;
    }
    if (urlParams.has('built_min')) {
      const val = parseInt(urlParams.get('built_min') || '', 10);
      if (!isNaN(val)) filters.builtMin = val;
    }
    if (urlParams.has('built_max')) {
      const val = parseInt(urlParams.get('built_max') || '', 10);
      if (!isNaN(val)) filters.builtMax = val;
    }
    if (urlParams.has('plot_min')) {
      const val = parseInt(urlParams.get('plot_min') || '', 10);
      if (!isNaN(val)) filters.plotMin = val;
    }
    if (urlParams.has('plot_max')) {
      const val = parseInt(urlParams.get('plot_max') || '', 10);
      if (!isNaN(val)) filters.plotMax = val;
    }
    if (urlParams.has('ref')) {
      filters.ref = urlParams.get('ref') || undefined;
    }
    if (urlParams.has('features')) {
      const featuresStr = urlParams.get('features');
      if (featuresStr) {
        filters.features = featuresStr
          .split(',')
          .map((f) => parseInt(f, 10))
          .filter((f) => !isNaN(f));
      }
    }

    if (Object.keys(filters).length > 0) {
      Logger.debug('[RealtySoft] Applying URL filters:', filters);
      for (const [key, value] of Object.entries(filters)) {
        RealtySoftState.set(`filters.${key}`, value);
      }
    }
  }

  // Store current mode
  let widgetMode: WidgetMode = null;

  /**
   * Template HTML definitions for auto-rendering
   */
  const TEMPLATES: Record<string, string> = {
    // Search Template 01: Compact Horizontal (2-row)
    'rs-search-template-01': `
      <div class="rs-template-search-01__row rs-template-search-01__row--primary">
        <div class="rs-template-search-01__field rs-template-search-01__field--reference">
          <div class="rs_ref"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--location">
          <div class="rs_location" data-rs-variation="2"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--type">
          <div class="rs_property_type" data-rs-variation="2"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--search">
          <div class="rs_search_button"></div>
        </div>
      </div>
      <div class="rs-template-search-01__row rs-template-search-01__row--secondary">
        <div class="rs-template-search-01__field rs-template-search-01__field--beds">
          <div class="rs_bedrooms" data-rs-variation="1"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--baths">
          <div class="rs_bathrooms" data-rs-variation="1"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--price-min">
          <div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--price-max">
          <div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--listing-type">
          <div class="rs_listing_type" data-rs-variation="1"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--features">
          <div class="rs_features"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--reset">
          <div class="rs_reset_button"></div>
        </div>
      </div>
    `,

    // Search Template 02: Single Row with More Filters Dropdown
    'rs-search-template-02': `
      <div class="rs-template-search-02__row">
        <div class="rs-template-search-02__field rs-template-search-02__field--location">
          <div class="rs_location" data-rs-variation="1" data-rs-placeholder="Search Location"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--property-type">
          <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--price">
          <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--price">
          <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
        </div>
        <div class="rs-template-search-02__more-filters-wrapper">
          <button type="button" class="rs-template-search-02__more-filters-btn">
            <svg class="rs-template-search-02__more-filters-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>More Filters</span>
            <svg class="rs-template-search-02__more-filters-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="rs-template-search-02__dropdown">
            <div class="rs-template-search-02__dropdown-header">
              <span class="rs-template-search-02__dropdown-title">More Filters</span>
              <button type="button" class="rs-template-search-02__dropdown-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Reference
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_ref" data-rs-placeholder="Reference"></div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-row">
                <div class="rs-template-search-02__dropdown-col">
                  <div class="rs-template-search-02__dropdown-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 4v16"></path>
                      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                      <path d="M2 17h20"></path>
                      <path d="M6 8v9"></path>
                    </svg>
                    Bedrooms
                  </div>
                  <div class="rs-template-search-02__dropdown-field">
                    <div class="rs_bedrooms" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Bedrooms"></div>
                  </div>
                </div>
                <div class="rs-template-search-02__dropdown-col">
                  <div class="rs-template-search-02__dropdown-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                      <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                      <circle cx="12" cy="5" r="2"></circle>
                    </svg>
                    Bathrooms
                  </div>
                  <div class="rs-template-search-02__dropdown-field">
                    <div class="rs_bathrooms" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Bathrooms"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <path d="M3 9h18"></path>
                  <path d="M9 21V9"></path>
                </svg>
                Min. Build
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_built_area" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Build"></div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                  <path d="M12 2v20"></path>
                </svg>
                Min. Plot
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_plot_size" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Plot"></div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Status
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_listing_type" data-rs-variation="3"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--search">
          <div class="rs_search_button"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--reset">
          <div class="rs_reset_button"></div>
        </div>
      </div>
    `,

    // Search Template 03: Tab-Based Search
    'rs-search-template-03': `
      <div class="rs-template-search-03__tabs">
        <button type="button" class="rs-template-search-03__tab is-active" data-listing-type="resale">Sales</button>
        <button type="button" class="rs-template-search-03__tab" data-listing-type="development">New Developments</button>
        <button type="button" class="rs-template-search-03__tab" data-listing-type="long_rental">Rentals</button>
        <button type="button" class="rs-template-search-03__tab" data-listing-type="short_rental">Holiday Rentals</button>
      </div>
      <div class="rs-template-search-03__form">
        <div class="rs-template-search-03__row rs-template-search-03__row--filters">
          <div class="rs-template-search-03__field rs-template-search-03__field--location">
            <div class="rs_location" data-rs-variation="3" data-rs-placeholder="Location"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--type">
            <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--beds">
            <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Bedrooms"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--baths">
            <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Bathrooms"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--price-min">
            <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--price-max">
            <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--reference">
            <div class="rs_ref" data-rs-placeholder="Reference"></div>
          </div>
        </div>
        <div class="rs-template-search-03__row rs-template-search-03__row--actions">
          <div class="rs-template-search-03__features">
            <div class="rs_features"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--search">
            <div class="rs_search_button"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--reset">
            <div class="rs_reset_button"></div>
          </div>
        </div>
      </div>
    `,

    // Search Template 04: Dark Horizontal Bar
    'rs-search-template-04': `
      <div class="rs-template-search-04__row rs-template-search-04__row--primary">
        <div class="rs-template-search-04__field rs-template-search-04__field--reference">
          <label class="rs-template-search-04__label">Reference</label>
          <div class="rs_ref" data-rs-placeholder="Ref"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--location">
          <label class="rs-template-search-04__label">Location</label>
          <div class="rs_location" data-rs-variation="2" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--type">
          <label class="rs-template-search-04__label">Property Type</label>
          <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--status">
          <label class="rs-template-search-04__label">Status</label>
          <div class="rs_listing_type" data-rs-variation="1" data-rs-placeholder="Any"></div>
        </div>
      </div>
      <div class="rs-template-search-04__row rs-template-search-04__row--secondary">
        <div class="rs-template-search-04__field rs-template-search-04__field--beds">
          <label class="rs-template-search-04__label">Bed</label>
          <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--baths">
          <label class="rs-template-search-04__label">Bath</label>
          <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--price-min">
          <label class="rs-template-search-04__label">Min Price</label>
          <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--price-max">
          <label class="rs-template-search-04__label">Max Price</label>
          <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__features">
          <div class="rs_features"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--search">
          <div class="rs_search_button"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--reset">
          <div class="rs_reset_button"></div>
        </div>
      </div>
    `,

    // Search Template 05: Vertical Card/Sidebar
    'rs-search-template-05': `
      <div class="rs-template-search-05__field rs-template-search-05__field--reference">
        <div class="rs_ref" data-rs-placeholder="Reference"></div>
      </div>
      <div class="rs-template-search-05__field rs-template-search-05__field--status">
        <div class="rs_listing_type" data-rs-variation="1" data-rs-placeholder="Status"></div>
      </div>
      <div class="rs-template-search-05__field rs-template-search-05__field--location">
        <div class="rs_location" data-rs-variation="2" data-rs-placeholder="Location"></div>
      </div>
      <div class="rs-template-search-05__field rs-template-search-05__field--type">
        <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
      </div>
      <div class="rs-template-search-05__row-half">
        <div class="rs-template-search-05__field rs-template-search-05__field--beds">
          <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Bed"></div>
        </div>
        <div class="rs-template-search-05__field rs-template-search-05__field--baths">
          <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Bath"></div>
        </div>
      </div>
      <div class="rs-template-search-05__row-half">
        <div class="rs-template-search-05__field rs-template-search-05__field--price-min">
          <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
        </div>
        <div class="rs-template-search-05__field rs-template-search-05__field--price-max">
          <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
        </div>
      </div>
      <div class="rs-template-search-05__buttons">
        <div class="rs-template-search-05__field rs-template-search-05__field--search">
          <div class="rs_search_button" data-rs-label="Submit"></div>
        </div>
        <div class="rs-template-search-05__field rs-template-search-05__field--reset">
          <div class="rs_reset_button"></div>
        </div>
      </div>
      <div class="rs-template-search-05__links">
        <div class="rs-template-search-05__features">
          <div class="rs_features"></div>
        </div>
      </div>
    `,

    // Search Template 06: Minimal Single Row
    'rs-search-template-06': `
      <div class="rs-template-search-06__container">
        <div class="rs-template-search-06__field rs-template-search-06__field--location">
          <svg class="rs-template-search-06__location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div class="rs_location" data-rs-variation="1" data-rs-placeholder="Enter Location"></div>
        </div>
        <div class="rs-template-search-06__field rs-template-search-06__field--type">
          <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
        </div>
        <div class="rs-template-search-06__field rs-template-search-06__field--search">
          <div class="rs_search_button" data-rs-label="Search Here"></div>
        </div>
      </div>
    `,

    // Listing Template 01: Location-First Cards
    'rs-listing-template-01': `
      <div class="rs-template-listing-01__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-01__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-01">
          <div class="rs-template-card-01__image-section">
            <a class="rs_card_link rs-template-card-01__image-link">
              <div class="rs_card_carousel"></div>
            </a>
            <button class="rs_card_wishlist" type="button"></button>
            <div class="rs_card_status"></div>
            <div class="rs-template-card-01__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
          </div>
          <a class="rs_card_link rs-template-card-01__content">
            <h3 class="rs_card_location rs-template-card-01__location"></h3>
            <p class="rs_card_type rs-template-card-01__type"></p>
            <p class="rs_card_description rs-template-card-01__description"></p>
            <div class="rs-template-card-01__specs">
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h20"></path>
                  <path d="M6 8v9"></path>
                </svg>
                <span class="rs_card_beds rs-template-card-01__spec-value"></span>
              </div>
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                  <line x1="10" x2="8" y1="5" y2="7"></line>
                  <line x1="2" x2="22" y1="12" y2="12"></line>
                  <line x1="7" x2="7" y1="19" y2="21"></line>
                  <line x1="17" x2="17" y1="19" y2="21"></line>
                </svg>
                <span class="rs_card_baths rs-template-card-01__spec-value"></span>
              </div>
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span class="rs_card_built rs-template-card-01__spec-value"></span>
              </div>
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                  <path d="M12 2v20"></path>
                  <path d="M3 6l9 4 9-4"></path>
                </svg>
                <span class="rs_card_plot rs-template-card-01__spec-value"></span>
              </div>
            </div>
            <div class="rs_card_price rs-template-card-01__price"></div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Listing Template 02: Price on Image Cards
    'rs-listing-template-02': `
      <div class="rs-template-listing-02__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-02__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-02">
          <div class="rs-template-card-02__image-section">
            <a class="rs_card_link rs-template-card-02__image-link">
              <div class="rs_card_carousel"></div>
              <div class="rs-template-card-02__image-overlay"></div>
            </a>
            <div class="rs_card_status rs-template-card-02__status"></div>
            <button class="rs_card_wishlist rs-template-card-02__wishlist" type="button"></button>
            <div class="rs-template-card-02__image-bottom-left">
              <div class="rs-template-card-02__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-02__price-overlay">
              <span class="rs_card_price rs-template-card-02__price"></span>
              <span class="rs_card_price_suffix rs-template-card-02__price-suffix"></span>
            </div>
          </div>
          <a class="rs_card_link rs-template-card-02__content">
            <div class="rs-template-card-02__title-row">
              <h3 class="rs_card_title rs-template-card-02__title"></h3>
              <span class="rs-template-card-02__arrow-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </span>
            </div>
            <p class="rs_card_location rs-template-card-02__location"></p>
            <div class="rs-template-card-02__specs">
              <span class="rs-template-card-02__spec">
                <span class="rs-template-card-02__spec-label">Beds:</span>
                <span class="rs_card_beds rs-template-card-02__spec-value"></span>
              </span>
              <span class="rs-template-card-02__spec">
                <span class="rs-template-card-02__spec-label">Baths:</span>
                <span class="rs_card_baths rs-template-card-02__spec-value"></span>
              </span>
              <span class="rs-template-card-02__spec">
                <span class="rs-template-card-02__spec-label">Area:</span>
                <span class="rs_card_built rs-template-card-02__spec-value"></span>
              </span>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Listing Template 03: Horizontal Card (Image left 40%, Content right 60%)
    'rs-listing-template-03': `
      <div class="rs-template-listing-03__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-03__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-03">
          <div class="rs-template-card-03__image-section">
            <a class="rs_card_link rs-template-card-03__image-link">
              <div class="rs_card_carousel"></div>
            </a>
            <div class="rs_card_status rs-template-card-03__status"></div>
            <div class="rs-template-card-03__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
            <div class="rs-template-card-03__carousel-dots"></div>
          </div>
          <button class="rs_card_wishlist rs-template-card-03__wishlist" type="button"></button>
          <a class="rs_card_link rs-template-card-03__content">
            <div class="rs-template-card-03__tags">
              <span class="rs_card_type rs-template-card-03__tag"></span>
            </div>
            <h3 class="rs_card_title rs-template-card-03__title"></h3>
            <div class="rs-template-card-03__specs">
              <span class="rs-template-card-03__spec">
                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h20"></path>
                  <path d="M6 8v9"></path>
                </svg>
                <span class="rs_card_beds"></span>
              </span>
              <span class="rs-template-card-03__spec">
                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                  <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                  <circle cx="12" cy="5" r="2"></circle>
                </svg>
                <span class="rs_card_baths"></span>
              </span>
              <span class="rs-template-card-03__spec">
                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span class="rs_card_built"></span>
              </span>
            </div>
            <div class="rs-template-card-03__bottom">
              <div class="rs-template-card-03__price-pill">
                <span class="rs_card_price"></span>
                <span class="rs_card_price_suffix"></span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Listing Template 04: Airbnb Style (Vertical, full-width image)
    'rs-listing-template-04': `
      <div class="rs-template-listing-04__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-04__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-04">
          <div class="rs-template-card-04__image-section">
            <a class="rs_card_link rs-template-card-04__image-link">
              <div class="rs_card_carousel"></div>
            </a>
            <div class="rs_card_status rs-template-card-04__status"></div>
            <div class="rs-template-card-04__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
            <div class="rs-template-card-04__carousel-dots"></div>
          </div>
          <button class="rs_card_wishlist rs-template-card-04__wishlist" type="button"></button>
          <a class="rs_card_link rs-template-card-04__content">
            <div class="rs-template-card-04__meta">
              <span class="rs_card_type rs-template-card-04__type"></span>
              <span class="rs-template-card-04__meta-separator">&middot;</span>
              <span class="rs_card_beds rs-template-card-04__beds"></span>
            </div>
            <h3 class="rs_card_title rs-template-card-04__title"></h3>
            <div class="rs-template-card-04__location">
              <svg class="rs-template-card-04__location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span class="rs_card_location"></span>
            </div>
            <div class="rs-template-card-04__price-row">
              <span class="rs_card_price rs-template-card-04__price"></span>
              <span class="rs_card_price_suffix rs-template-card-04__price-suffix"></span>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Listing Template 05: Hover Overlay (Image only, content on hover)
    'rs-listing-template-05': `
      <div class="rs-template-listing-05__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-05__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-05">
          <a class="rs_card_link rs-template-card-05__link">
            <div class="rs-template-card-05__image-section">
              <div class="rs_card_carousel"></div>
            </div>
            <div class="rs_card_status rs-template-card-05__status"></div>
            <div class="rs-template-card-05__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
            <div class="rs-template-card-05__overlay">
              <div class="rs-template-card-05__overlay-content">
                <h3 class="rs_card_title rs-template-card-05__title"></h3>
                <div class="rs_card_price rs-template-card-05__price"></div>
                <div class="rs-template-card-05__specs">
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 4v16"></path>
                      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                      <path d="M2 17h20"></path>
                      <path d="M6 8v9"></path>
                    </svg>
                    <span class="rs_card_beds"></span>
                  </span>
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                      <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                      <circle cx="12" cy="5" r="2"></circle>
                    </svg>
                    <span class="rs_card_baths"></span>
                  </span>
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <span class="rs_card_built"></span>
                  </span>
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                      <path d="M12 2v20"></path>
                    </svg>
                    <span class="rs_card_plot"></span>
                  </span>
                </div>
                <span class="rs-template-card-05__view-link">View Details</span>
              </div>
            </div>
          </a>
          <button class="rs_card_wishlist rs-template-card-05__wishlist" type="button"></button>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Listing Template 06: Gradient Overlay (Full image with permanent dark gradient)
    'rs-listing-template-06': `
      <div class="rs-template-listing-06__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-06__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-06">
          <a class="rs_card_link rs-template-card-06__link">
            <div class="rs-template-card-06__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs-template-card-06__gradient"></div>
            </div>
            <div class="rs_card_status rs-template-card-06__status"></div>
            <button class="rs_card_wishlist rs-template-card-06__wishlist" type="button"></button>
            <div class="rs-template-card-06__content">
              <h3 class="rs_card_type rs-template-card-06__title"></h3>
              <div class="rs_card_price rs-template-card-06__price"></div>
              <div class="rs-template-card-06__specs">
                <span class="rs-template-card-06__spec">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-06__spec">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-06__spec">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
              </div>
              <span class="rs-template-card-06__view-link">View Details</span>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Listing Template 07: Dark Overlay with Badges
    'rs-listing-template-07': `
      <div class="rs-template-listing-07__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-07__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-07">
          <a class="rs_card_link rs-template-card-07__link">
            <div class="rs-template-card-07__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs-template-card-07__gradient"></div>
            </div>
            <div class="rs-template-card-07__badges">
              <div class="rs_card_status rs-template-card-07__status"></div>
            </div>
            <button class="rs_card_wishlist rs-template-card-07__wishlist" type="button"></button>
            <div class="rs-template-card-07__content">
              <div class="rs-template-card-07__price-row">
                <span class="rs_card_price rs-template-card-07__price"></span>
                <span class="rs_card_price_suffix rs-template-card-07__price-suffix"></span>
              </div>
              <h3 class="rs_card_type rs-template-card-07__title"></h3>
              <div class="rs-template-card-07__specs">
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Template 08: Dark Overlay Grid with view toggle
    'rs-listing-template-08': `
      <div class="rs-template-listing-08__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-08__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-08">
          <a class="rs_card_link rs-template-card-08__link">
            <div class="rs-template-card-08__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-08__status"></div>
              <button class="rs_card_wishlist rs-template-card-08__wishlist" type="button"></button>
              <div class="rs-template-card-08__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-08__content">
              <h3 class="rs_card_title rs-template-card-08__title"></h3>
              <div class="rs-template-card-08__specs">
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
                <span class="rs_card_price rs-template-card-08__price"></span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Template 09: Horizontal Detail Card (single row, no view toggle)
    'rs-listing-template-09': `
      <div class="rs-template-listing-09__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-09__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle" data-rs-hide-list="true"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-09">
          <a class="rs_card_link rs-template-card-09__link">
            <div class="rs-template-card-09__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-09__status"></div>
              <button class="rs_card_wishlist rs-template-card-09__wishlist" type="button"></button>
              <div class="rs-template-card-09__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-09__content">
              <div class="rs-template-card-09__location-row">
                <span class="rs_card_location rs-template-card-09__location"></span>
              </div>
              <div class="rs-template-card-09__ref-row">
                <span class="rs_card_ref rs-template-card-09__ref"></span>
              </div>
              <h3 class="rs_card_title rs-template-card-09__title"></h3>
              <p class="rs_card_description rs-template-card-09__description"></p>
              <div class="rs-template-card-09__specs">
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
              <div class="rs_card_price rs-template-card-09__price"></div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Template 10: Development/Large Card (single row)
    'rs-listing-template-10': `
      <div class="rs-template-listing-10__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-10__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle" data-rs-hide-list="true"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-10">
          <a class="rs_card_link rs-template-card-10__link">
            <div class="rs-template-card-10__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-10__status"></div>
              <button class="rs_card_wishlist rs-template-card-10__wishlist" type="button"></button>
              <div class="rs-template-card-10__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-10__content">
              <h3 class="rs_card_title rs-template-card-10__title"></h3>
              <p class="rs_card_description rs-template-card-10__description"></p>
              <div class="rs-template-card-10__price-row">
                <span class="rs_card_price rs-template-card-10__price"></span>
              </div>
              <div class="rs-template-card-10__specs">
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
              <div class="rs-template-card-10__actions">
                <span class="rs_card_ref rs-template-card-10__ref-btn"></span>
                <span class="rs-template-card-10__view-details">View Details</span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Template 11: Alternating Dark Content Card (single row, no view toggle)
    'rs-listing-template-11': `
      <div class="rs-template-listing-11__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-11__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle" data-rs-hide-list="true"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-11">
          <a class="rs_card_link rs-template-card-11__link">
            <div class="rs-template-card-11__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-11__status"></div>
              <button class="rs_card_wishlist rs-template-card-11__wishlist" type="button"></button>
              <div class="rs-template-card-11__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-11__content">
              <h3 class="rs_card_title rs-template-card-11__title"></h3>
              <p class="rs_card_description rs-template-card-11__description"></p>
              <div class="rs-template-card-11__specs">
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
              <div class="rs-template-card-11__price-section">
                <span class="rs-template-card-11__price-label">Price</span>
                <span class="rs_card_price rs-template-card-11__price"></span>
              </div>
              <div class="rs-template-card-11__actions">
                <span class="rs-template-card-11__details-btn">View Details</span>
                <span class="rs_card_ref rs-template-card-11__ref"></span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Template 12: Vertical Grid Card with Read More button
    'rs-listing-template-12': `
      <div class="rs-template-listing-12__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-12__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_map_view"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-12">
          <a class="rs_card_link rs-template-card-12__link">
            <div class="rs-template-card-12__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-12__status"></div>
              <button class="rs_card_wishlist rs-template-card-12__wishlist" type="button"></button>
              <div class="rs-template-card-12__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <span class="rs-template-card-12__read-more">Read More</span>
            <div class="rs-template-card-12__content">
              <div class="rs-template-card-12__price-ref-row">
                <span class="rs_card_price rs-template-card-12__price"></span>
                <span class="rs_card_ref rs-template-card-12__ref"></span>
              </div>
              <h3 class="rs_card_title rs-template-card-12__title"></h3>
              <p class="rs_card_description rs-template-card-12__description"></p>
              <div class="rs-template-card-12__specs">
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </div>
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </div>
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </div>
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,

    // Map Search Template 01: Full-width map with filters on top
    'rs-map-search-template-01': `
      <div class="rs-map-search-template-01">
        <div class="rs-map-search-template-01__filters">
          <div class="rs-map-search-template-01__field">
            <div class="rs_location" data-rs-variation="2"></div>
          </div>
          <div class="rs-map-search-template-01__field">
            <div class="rs_property_type" data-rs-variation="2"></div>
          </div>
          <div class="rs-map-search-template-01__field">
            <div class="rs_bedrooms" data-rs-variation="1"></div>
          </div>
          <div class="rs-map-search-template-01__field">
            <div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>
          </div>
          <div class="rs-map-search-template-01__field">
            <div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>
          </div>
          <div class="rs-map-search-template-01__field">
            <div class="rs_search_button"></div>
          </div>
        </div>
        <div class="rs-map-search-template-01__map-container">
          <div class="rs_map_view"></div>
        </div>
        <div class="rs-map-search-template-01__results-bar">
          <div class="rs_results_count"></div>
          <div class="rs_view_toggle"></div>
        </div>
        <div class="rs_property_grid"></div>
        <div class="rs_pagination" style="margin-top: 30px;"></div>
      </div>
    `,
  };

  /**
   * Check if an element is inside a header or footer zone
   * Supports: WordPress, Wix, Webflow, Squarespace, and standard HTML
   */
  function isInHeaderFooter(el: HTMLElement): boolean {
    let current: HTMLElement | null = el;
    while (current && current !== document.body) {
      const tag = current.tagName.toLowerCase();
      const id = current.id?.toLowerCase() || '';
      const className = typeof current.className === 'string' ? current.className.toLowerCase() : '';

      // Check semantic elements
      if (tag === 'header' || tag === 'footer') {
        return true;
      }

      // Check common header/footer class/id patterns
      if (
        // Standard/WordPress patterns
        id.includes('header') ||
        id.includes('footer') ||
        id.includes('masthead') ||
        className.includes('header') ||
        className.includes('footer') ||
        className.includes('masthead') ||
        // Wix patterns
        id === 'site_header' ||
        id === 'site_footer' ||
        id.includes('wixui-header') ||
        id.includes('wixui-footer') ||
        // Webflow patterns
        className.includes('w-nav') ||
        className.includes('navbar') ||
        className.includes('footer-wrapper') ||
        className.includes('footer-section') ||
        // Squarespace patterns
        id === 'sqs-header' ||
        id === 'sqs-footer' ||
        className.includes('header-inner') ||
        className.includes('footer-inner')
      ) {
        return true;
      }

      current = current.parentElement;
    }
    return false;
  }

  /**
   * Check if an element is inside a main content zone
   * Supports: WordPress, Wix, Webflow, Squarespace, and standard HTML
   */
  function isInMainContent(el: HTMLElement): boolean {
    let current: HTMLElement | null = el;
    while (current && current !== document.body) {
      const tag = current.tagName.toLowerCase();
      const id = current.id?.toLowerCase() || '';
      const className = typeof current.className === 'string' ? current.className.toLowerCase() : '';

      // Check semantic elements
      if (tag === 'main' || tag === 'article') {
        return true;
      }

      // Check common content class/id patterns
      if (
        // Standard/WordPress patterns
        id === 'content' ||
        id === 'main' ||
        id === 'primary' ||
        id.includes('main-content') ||
        id.includes('page-content') ||
        id.includes('site-content') ||
        className.includes('entry-content') ||
        className.includes('page-content') ||
        className.includes('site-content') ||
        className.includes('main-content') ||
        className.includes('post-content') ||
        // Wix patterns
        id === 'pages_container' ||
        id === 'site_pages' ||
        id.includes('masterpage') ||
        id.includes('pagescontent') ||
        // Webflow patterns
        className.includes('page-wrapper') ||
        className.includes('main-wrapper') ||
        className.includes('w-container') ||
        className.includes('body-content') ||
        // Squarespace patterns
        id === 'page' ||
        id === 'sections' ||
        id === 'collection' ||
        className.includes('content-wrapper') ||
        className.includes('page-section') ||
        className.includes('sqs-block-content')
      ) {
        return true;
      }

      current = current.parentElement;
    }
    return false;
  }

  /**
   * Find the best element to render into (prefer main content over header/footer)
   */
  function findBestElement(elements: NodeListOf<HTMLElement>): HTMLElement | null {
    if (elements.length === 0) return null;
    if (elements.length === 1) return elements[0];

    // Priority 1: Element in main content area (not in header/footer)
    for (const el of elements) {
      if (isInMainContent(el) && !isInHeaderFooter(el)) {
        return el;
      }
    }

    // Priority 2: Element NOT in header/footer
    for (const el of elements) {
      if (!isInHeaderFooter(el)) {
        return el;
      }
    }

    // Fallback: first element (shouldn't happen but safety)
    return elements[0];
  }

  /**
   * Render templates - finds template markers and injects full HTML
   * Prefers elements in main content area over header/footer duplicates
   */
  function renderTemplates(): void {
    Logger.debug('[RealtySoft] renderTemplates() - scanning for template elements...');
    for (const [templateClass, templateHTML] of Object.entries(TEMPLATES)) {
      const elements = document.querySelectorAll<HTMLElement>(`.${templateClass}`);
      Logger.debug(
        `[RealtySoft] Looking for .${templateClass}: found ${elements.length} element(s)`
      );

      if (elements.length === 0) continue;

      // Find the best element (prefer main content over header/footer)
      const bestElement = findBestElement(elements);

      elements.forEach((el) => {
        // Skip if already rendered
        if (el.dataset.rsTemplateRendered) {
          return;
        }

        // Mark non-best elements as duplicates
        if (el !== bestElement) {
          Logger.debug(`[RealtySoft] Skipping duplicate ${templateClass} element (header/footer)`);
          el.dataset.rsTemplateDuplicate = 'true';
          return;
        }

        if (templateClass.includes('search')) {
          if (!el.id) el.id = 'rs_search';
          const templateNum = templateClass.match(/template-(\d+)/)?.[1];
          if (templateNum) {
            el.classList.add(`rs-template-search-${templateNum.padStart(2, '0')}`);
          }
        }

        if (templateClass.includes('listing')) {
          if (!el.id) el.id = 'rs_listing';
        }

        el.innerHTML = templateHTML;
        el.dataset.rsTemplateRendered = 'true';

        if (el.dataset.rsColumns) {
          const propertyGrid = el.querySelector<HTMLElement>('.rs_property_grid');
          if (propertyGrid) {
            propertyGrid.dataset.rsColumns = el.dataset.rsColumns;
          }
        }

        if (templateClass === 'rs-search-template-02') {
          initTemplate02MoreFilters(el);
        }

        if (templateClass === 'rs-search-template-03') {
          initTemplate03Tabs(el);
        }

        Logger.debug(`[RealtySoft] Auto-rendered template: ${templateClass}`);
      });
    }
  }

  /**
   * Initialize More Filters dropdown toggle for Search Template 02
   */
  function initTemplate02MoreFilters(container: HTMLElement): void {
    const wrapper = container.querySelector<HTMLElement>(
      '.rs-template-search-02__more-filters-wrapper'
    );
    const btn = container.querySelector<HTMLButtonElement>(
      '.rs-template-search-02__more-filters-btn'
    );
    const dropdown = container.querySelector<HTMLElement>('.rs-template-search-02__dropdown');
    const closeBtn = container.querySelector<HTMLButtonElement>(
      '.rs-template-search-02__dropdown-close'
    );

    if (!btn || !dropdown || !wrapper) return;

    function openDropdown(): void {
      dropdown!.classList.add('is-open');
      btn!.classList.add('is-active');
      wrapper!.classList.add('is-active');
      if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
      }
    }

    function closeDropdown(): void {
      dropdown!.classList.remove('is-open');
      btn!.classList.remove('is-active');
      wrapper!.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function (e: Event) {
      e.stopPropagation();
      const isOpen = dropdown!.classList.contains('is-open');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDropdown);
    }

    document.addEventListener('click', function (e: Event) {
      if (
        !dropdown!.contains(e.target as Node) &&
        !btn!.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    });

    wrapper.addEventListener('click', function (e: Event) {
      if (
        e.target === wrapper ||
        (e.target as HTMLElement).classList.contains(
          'rs-template-search-02__more-filters-wrapper'
        )
      ) {
        if (
          window.innerWidth <= 768 &&
          !dropdown!.contains(e.target as Node) &&
          !btn!.contains(e.target as Node)
        ) {
          closeDropdown();
        }
      }
    });

    dropdown.addEventListener('click', function (e: Event) {
      e.stopPropagation();
    });

    document.addEventListener('keydown', function (e: KeyboardEvent) {
      if (e.key === 'Escape' && dropdown!.classList.contains('is-open')) {
        closeDropdown();
      }
    });
  }

  /**
   * Initialize Tab switching for Search Template 03
   */
  function initTemplate03Tabs(container: HTMLElement): void {
    const tabs = container.querySelectorAll<HTMLButtonElement>('.rs-template-search-03__tab');
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        tabs.forEach((t) => t.classList.remove('is-active'));
        this.classList.add('is-active');

        const listingType = this.dataset.listingType;
        if (listingType) {
          RealtySoftState.set('filters.listingType', listingType);
          Logger.debug(`[RealtySoft] Template 03: Tab switched to "${listingType}"`);
        }
      });
    });

    const activeTab = container.querySelector<HTMLButtonElement>(
      '.rs-template-search-03__tab.is-active'
    );
    if (activeTab && activeTab.dataset.listingType) {
      RealtySoftState.set('filters.listingType', activeTab.dataset.listingType);
      Logger.debug(
        `[RealtySoft] Template 03: Initial listing type set to "${activeTab.dataset.listingType}"`
      );
    }
  }

  /**
   * Show skeleton loading placeholders
   */
  function showLoadingSkeletons(): void {
    const searchContainer = document.getElementById('rs_search');
    const listingContainer = document.getElementById('rs_listing') ||
                             document.querySelector('.rs_property_grid') ||
                             document.querySelector('[class*="rs-listing-template-"]');
    const wishlistContainer = document.querySelector('.rs_wishlist_list');

    if (searchContainer && !searchContainer.querySelector('.rs-search-skeleton')) {
      const searchSkeleton = document.createElement('div');
      searchSkeleton.className = 'rs-search-skeleton';
      searchSkeleton.innerHTML = `
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__button"></div>
        </div>
      `;
      searchContainer.insertBefore(searchSkeleton, searchContainer.firstChild);
    }

    // Show listing skeleton for property grid
    if (listingContainer && !listingContainer.querySelector('.rs-listing-skeleton')) {
      const listingSkeleton = document.createElement('div');
      listingSkeleton.className = 'rs-listing-skeleton';
      for (let i = 0; i < 6; i++) {
        listingSkeleton.innerHTML += `
          <div class="rs-listing-skeleton__card">
            <div class="rs-listing-skeleton__image"></div>
            <div class="rs-listing-skeleton__content">
              <div class="rs-listing-skeleton__price"></div>
              <div class="rs-listing-skeleton__title"></div>
              <div class="rs-listing-skeleton__location"></div>
              <div class="rs-listing-skeleton__specs">
                <div class="rs-listing-skeleton__spec"></div>
                <div class="rs-listing-skeleton__spec"></div>
                <div class="rs-listing-skeleton__spec"></div>
              </div>
            </div>
          </div>
        `;
      }
      listingContainer.insertBefore(listingSkeleton, listingContainer.firstChild);
    }

    // Show wishlist skeleton
    if (wishlistContainer && !wishlistContainer.querySelector('.rs-listing-skeleton')) {
      const wishlistSkeleton = document.createElement('div');
      wishlistSkeleton.className = 'rs-listing-skeleton rs-wishlist-skeleton';
      for (let i = 0; i < 4; i++) {
        wishlistSkeleton.innerHTML += `
          <div class="rs-listing-skeleton__card">
            <div class="rs-listing-skeleton__image"></div>
            <div class="rs-listing-skeleton__content">
              <div class="rs-listing-skeleton__price"></div>
              <div class="rs-listing-skeleton__title"></div>
              <div class="rs-listing-skeleton__location"></div>
              <div class="rs-listing-skeleton__specs">
                <div class="rs-listing-skeleton__spec"></div>
                <div class="rs-listing-skeleton__spec"></div>
                <div class="rs-listing-skeleton__spec"></div>
              </div>
            </div>
          </div>
        `;
      }
      wishlistContainer.insertBefore(wishlistSkeleton, wishlistContainer.firstChild);
    }
  }

  /**
   * Hide skeleton loading placeholders
   */
  function hideLoadingSkeletons(): void {
    // Remove all skeleton elements
    document.querySelectorAll('.rs-search-skeleton, .rs-listing-skeleton, .rs-wishlist-skeleton').forEach(el => el.remove());

    // Mark containers as loaded
    const searchContainer = document.getElementById('rs_search');
    const listingContainer = document.getElementById('rs_listing');
    const wishlistContainer = document.querySelector('.rs_wishlist_list');
    if (searchContainer) searchContainer.classList.add('rs-loaded');
    if (listingContainer) listingContainer.classList.add('rs-loaded');
    if (wishlistContainer) wishlistContainer.classList.add('rs-loaded');
  }

  /**
   * Register service worker (opt-in)
   */
  function registerServiceWorker(customUrl?: string): void {
    const swUrl = customUrl || '/realtysoft-sw.js';
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        Logger.debug('[RealtySoft] Service worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('[RealtySoft] Service worker registration failed:', error);
      });
  }

  /**
   * Initialize platform/plugin language sync listeners.
   * Handles translation plugins that change language without page reload.
   */
  function initPlatformLanguageSync(): void {
    // Weglot: Listen for language changes (no page reload)
    if (typeof window.Weglot?.on === 'function') {
      window.Weglot.on('languageChanged', (newLang: string) => {
        Logger.debug('[RealtySoft] Weglot language changed:', newLang);
        const mappedLang = RealtySoftLabels.mapLanguage(newLang);
        const currentLang = RealtySoftState.get<string>('config.language');
        if (mappedLang !== currentLang) {
          setLanguage(mappedLang);
        }
      });
      Logger.debug('[RealtySoft] Weglot language sync initialized');
    }

    // MutationObserver: Watch for HTML lang attribute changes
    // This covers most translation plugins (Polylang, WPML, TranslatePress, etc.)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'lang') {
          const newLang = document.documentElement.lang;
          if (newLang) {
            const currentLang = RealtySoftState.get<string>('config.language');
            const mappedLang = RealtySoftLabels.mapLanguage(newLang);
            if (mappedLang !== currentLang) {
              Logger.debug('[RealtySoft] HTML lang attribute changed:', newLang, '-> mapped:', mappedLang);
              setLanguage(mappedLang);
            }
          }
          break;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    Logger.debug('[RealtySoft] HTML lang attribute sync initialized');

    // URL popstate: Watch for browser back/forward navigation (URL-based language switchers)
    window.addEventListener('popstate', () => {
      // Re-detect language from URL after navigation
      const detectedLang = RealtySoftLabels.detectLanguage();
      const currentLang = RealtySoftState.get<string>('config.language');
      if (detectedLang !== currentLang) {
        Logger.debug('[RealtySoft] URL navigation detected language change:', detectedLang);
        setLanguage(detectedLang);
      }
    });
  }

  /**
   * Initialize the widget
   */
  async function init(): Promise<boolean> {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        // ── Subscription Check ─────────────────────────────────────
        // Check subscription status before initializing the widget
        // This runs early to block/warn before any heavy initialization
        RealtySoftSubscription.init();
        const subscriptionStatus = await RealtySoftSubscription.checkStatus();

        // If subscription is blocked, show overlay and stop initialization
        if (subscriptionStatus.status === 'blocked') {
          RealtySoftSubscription.showBlockedOverlay();
          Logger.warn('Widget blocked: subscription expired');
          return false;
        }

        // If in grace period, show warning banner
        if (subscriptionStatus.status === 'grace_period' && subscriptionStatus.showWarning) {
          RealtySoftSubscription.showWarningBanner(subscriptionStatus.graceDaysRemaining || 0);
        }

        // Store subscription status in state
        RealtySoftState.set('subscription.status', subscriptionStatus.status);
        RealtySoftState.set('subscription.plan', subscriptionStatus.plan);

        showLoadingSkeletons();
        RealtySoftState.set('ui.loading', true);

        const globalConfig = (window.RealtySoftConfig || {}) as ControllerConfig;

        // Language priority: config > localStorage (user preference) > browser detect
        let storedLanguage: string | null = null;
        try {
          storedLanguage = localStorage.getItem('rs_language');
        } catch (_e) { /* ignore */ }
        const language = globalConfig.language || storedLanguage || RealtySoftLabels.init();
        RealtySoftLabels.setLanguage(language);

        RealtySoftAPI.init({
          language: language,
          apiKey: globalConfig.apiKey,
          apiUrl: globalConfig.apiUrl,
          cache: globalConfig.cache,
        });

        // Detect if we're on a property detail page (used to skip unnecessary API calls)
        const propertyRef = extractPropertyRefFromUrl();
        const isDetailPage = !!propertyRef;

        // Pre-fetch property data in parallel with labels (detail pages only)
        if (isDetailPage && propertyRef) {
          RealtySoftAPI.prefetchProperty(propertyRef, true);
        }

        if (globalConfig.analytics !== false) {
          RealtySoftAnalytics.init({
            enabled: true,
            debug: globalConfig.debug || false,
          });
        }

        RealtySoftState.set('config.language', language);
        RealtySoftState.set('config.ownerEmail', globalConfig.ownerEmail || null);
        RealtySoftState.set('config.privacyPolicyUrl', globalConfig.privacyPolicyUrl || null);
        RealtySoftState.set('config.defaultCountryCode', globalConfig.defaultCountryCode || '+34');
        RealtySoftState.set(
          'config.inquiryThankYouMessage',
          globalConfig.inquiryThankYouMessage || null
        );
        RealtySoftState.set('config.inquiryThankYouUrl', globalConfig.inquiryThankYouUrl || null);
        RealtySoftState.set('config.propertyPageSlug', globalConfig.propertyPageSlug || 'property');
        // Translation plugin support - multilingual URL generation
        RealtySoftState.set('config.propertyPageSlugs', (globalConfig as any).propertyPageSlugs || {});
        RealtySoftState.set('config.resultsPageSlugs', (globalConfig as any).resultsPageSlugs || {});
        RealtySoftState.set('config.wishlistPageSlugs', (globalConfig as any).wishlistPageSlugs || {});
        RealtySoftState.set('config.translationPlugin', (globalConfig as any).translationPlugin || 'none');
        RealtySoftState.set('config.currentLang', (globalConfig as any).currentLang || '');
        RealtySoftState.set('config.defaultLang', (globalConfig as any).defaultLang || '');
        RealtySoftState.set('config.languagePrefix', (globalConfig as any).languagePrefix || '');
        RealtySoftState.set(
          'config.useWidgetPropertyTemplate',
          globalConfig.useWidgetPropertyTemplate !== false
        );
        RealtySoftState.set('config.useQueryParamUrls', globalConfig.useQueryParamUrls === true);
        RealtySoftState.set('config.propertyUrlFormat', globalConfig.propertyUrlFormat || 'seo');
        RealtySoftState.set('config.resultsPage', globalConfig.resultsPage || '/properties');
        RealtySoftState.set('config.enableMapView', globalConfig.enableMapView !== false);

        // Enabled listing types (filter dropdown options)
        const enabledListingTypes = (globalConfig as any).enabledListingTypes;
        if (enabledListingTypes && Array.isArray(enabledListingTypes) && enabledListingTypes.length > 0) {
          RealtySoftState.set('data.enabledListingTypes', enabledListingTypes);
          Logger.debug('[RealtySoft] Enabled listing types from config:', enabledListingTypes);
        }

        // Branding config for emails and PDF
        if (globalConfig.branding) {
          RealtySoftState.set('config.branding', globalConfig.branding);
        }

        // Pagination settings
        const defaultPerPage = globalConfig.perPage || 12;
        const defaultMapPerPage = globalConfig.mapPerPage || 200;
        RealtySoftState.set('config.perPage', defaultPerPage);
        RealtySoftState.set('config.mapPerPage', defaultMapPerPage);
        RealtySoftState.set('results.perPage', defaultPerPage);

        // Labels mode: 'static' (default), 'api', or 'hybrid'
        const labelsMode = globalConfig.labelsMode || 'static';
        Logger.debug('[RealtySoft] Labels mode:', labelsMode);

        // Fire getAllLabels early (runs in parallel regardless - needed for language switcher)
        const allLabelsPromise = RealtySoftAPI.getAllLabels().catch(() => null);

        // Build API promises based on labelsMode and page type
        const apiPromises: Promise<any>[] = [];

        if (labelsMode === 'api') {
          // API mode: blocking labels fetch (current behavior)
          apiPromises.push(RealtySoftAPI.getLabels().catch(() => ({ labels: {} })));
        }

        if (!isDetailPage) {
          // Listing pages: fetch property types (blocking) and allLabels
          apiPromises.push(
            RealtySoftAPI.getPropertyTypes().catch(() => ({ data: [] })),
            allLabelsPromise,
          );

          // Fire getLocations() in background (non-blocking) - 3.87s optimization
          RealtySoftAPI.getLocations()
            .then(result => {
              Logger.debug('[RealtySoft] Background locations loaded:', result.data?.length || 0, 'items');
              RealtySoftState.set('data.locations', result.data || []);
            })
            .catch((err) => {
              console.error('[RealtySoft] Background locations fetch failed:', err);
              RealtySoftState.set('data.locations', []);
            });
        }

        // Static and hybrid modes: initialize labels from static defaults FIRST (instant)
        if (labelsMode === 'static' || labelsMode === 'hybrid') {
          RealtySoftLabels.initStatic(language);
          if (globalConfig.labelOverrides) {
            RealtySoftLabels.applyOverrides(globalConfig.labelOverrides, language);
          }
          RealtySoftState.set('data.labels', RealtySoftLabels.getAll());
        }

        // Hybrid mode: fire API labels in background (non-blocking)
        if (labelsMode === 'hybrid') {
          RealtySoftAPI.getLabels()
            .then((labelsData) => {
              const apiLabels = transformAPILabels(labelsData, language);
              if (Object.keys(apiLabels).length > 0) {
                RealtySoftLabels.loadFromAPI(apiLabels);
                if (globalConfig.labelOverrides) {
                  RealtySoftLabels.applyOverrides(globalConfig.labelOverrides, language);
                }
                RealtySoftState.set('data.labels', RealtySoftLabels.getAll());
                Logger.debug('[RealtySoft] Hybrid mode: API labels merged in background');
              }
              // Extract and store enabledListingTypes
              const enabledTypes = extractEnabledListingTypes(labelsData);
              if (enabledTypes !== null) {
                RealtySoftState.set('data.enabledListingTypes', enabledTypes);
                Logger.debug('[RealtySoft] Enabled listing types:', enabledTypes);
              }
            })
            .catch(() => {
              Logger.debug('[RealtySoft] Hybrid mode: API labels fetch failed, using static');
            });
        }

        // Wait for blocking API calls
        const results = await Promise.all(apiPromises);

        // Process API data — wrapped in try/catch so that initializeComponents()
        // ALWAYS runs even if data processing fails (critical for property detail pages)
        try {
          // API mode: process blocking labels response
          if (labelsMode === 'api') {
            const labelsData = results[0];
            const apiLabels = transformAPILabels(labelsData, language);
            if (Object.keys(apiLabels).length > 0) {
              await RealtySoftLabels.loadFromAPI(apiLabels);
            } else {
              Logger.debug('[RealtySoft] No labels from API, using defaults');
            }

            if (globalConfig.labelOverrides) {
              RealtySoftLabels.applyOverrides(globalConfig.labelOverrides, language);
            }

            RealtySoftState.set('data.labels', RealtySoftLabels.getAll());

            // Extract and store enabledListingTypes
            const enabledTypes = extractEnabledListingTypes(labelsData);
            if (enabledTypes !== null) {
              RealtySoftState.set('data.enabledListingTypes', enabledTypes);
              Logger.debug('[RealtySoft] Enabled listing types:', enabledTypes);
            }
          }

          // Extract propertyTypes from results (locations now loaded in background)
          // Result indices shift based on whether labels was in apiPromises
          const resultOffset = labelsMode === 'api' ? 1 : 0;
          const propertyTypes = isDetailPage ? { data: [] as any[] } : results[resultOffset];
          const allLabelsData = isDetailPage ? null : results[resultOffset + 1];

          // Extract available languages from the unfiltered labels response
          if (allLabelsData) {
            const availableLanguages = extractAvailableLanguages(allLabelsData);
            RealtySoftState.set('data.availableLanguages', availableLanguages);
            Logger.debug('[RealtySoft] Available languages from API:', availableLanguages);
          } else if (isDetailPage) {
            // Detail pages: allLabels was deferred — process when it arrives
            RealtySoftState.set('data.availableLanguages', []);
            allLabelsPromise.then((data: unknown) => {
              const availableLanguages = extractAvailableLanguages(data);
              RealtySoftState.set('data.availableLanguages', availableLanguages);
              Logger.debug('[RealtySoft] Available languages loaded (deferred):', availableLanguages);
            });
          }

          // Note: data.locations is populated by background fetch (non-blocking)
          // Default state already has empty array, so no need to set here
          RealtySoftState.set('data.propertyTypes', propertyTypes?.data || []);
          RealtySoftState.set('data.features', []);
          RealtySoftState.set('data.featuresLoaded', false);

          renderTemplates();

          widgetMode = detectMode();
          Logger.debug('[RealtySoft] Widget mode:', widgetMode);

          parseURLFilters();

          const searchContainer = document.getElementById('rs_search');
          const listingContainer = document.getElementById('rs_listing');

          let allLocked: LockedFilters = {};

          if (listingContainer && !listingContainer.hasAttribute('data-rs-standalone')) {
            const listingLocked = parseLockedFilters(listingContainer);
            allLocked = { ...allLocked, ...listingLocked };
          }

          if (searchContainer) {
            const searchLocked = parseLockedFilters(searchContainer);
            allLocked = { ...allLocked, ...searchLocked };
          }

          if (Object.keys(allLocked).length > 0) {
            RealtySoftState.setLockedFilters(allLocked);
          }
        } catch (dataError) {
          console.error('[RealtySoft] Data processing error (continuing with component init):', dataError);
        }

        // ALWAYS initialize components regardless of data processing errors
        initializeComponents();
        hideLoadingSkeletons();

        // Initialize SPA router for client-side navigation
        RealtySoftRouter.init();

        // Initialize platform/plugin language sync (Weglot, HTML lang observer, etc.)
        initPlatformLanguageSync();

        // Trigger initial search if listing is present
        if (widgetMode === 'combined' || widgetMode === 'results-only') {
          search();
        }

        // Initialize standalone listings (independent data fetch, no effect on global filters)
        initStandaloneListings();

        // Register service worker if opted in
        if (globalConfig.serviceWorker && 'serviceWorker' in navigator) {
          registerServiceWorker(globalConfig.serviceWorkerUrl);
        }

        initialized = true;

        document.dispatchEvent(new CustomEvent('realtysoft:ready'));

        return true;
      } catch (error) {
        console.error('RealtySoft initialization failed:', error);
        document.dispatchEvent(new CustomEvent('realtysoft:error', { detail: error }));
        throw error;
      }
    })();

    return initPromise;
  }

  /**
   * Get all valid widget containers on the page
   */
  function getWidgetContainers(): HTMLElement[] {
    const containerSelectors = [
      // Main widget containers
      '#rs_search',
      '#rs_listing',
      '#rs_wishlist',
      '.rs_wishlist_list',
      '.property-detail-container',
      // Search templates
      '.rs-search-template-01',
      '.rs-search-template-02',
      '.rs-search-template-03',
      '.rs-search-template-04',
      '.rs-search-template-05',
      '.rs-search-template-06',
      // Listing templates
      '.rs-listing-template-01',
      '.rs-listing-template-02',
      '.rs-listing-template-03',
      '.rs-listing-template-04',
      '.rs-listing-template-05',
      '.rs-listing-template-06',
      '.rs-listing-template-07',
      '.rs-listing-template-08',
      '.rs-listing-template-09',
      '.rs-listing-template-10',
      '.rs-listing-template-11',
      '.rs-listing-template-12',
      // Map search templates
      '.rs-map-search-template-01',
      // Standalone components (can be placed without a container)
      '.rs_property_carousel',
      '.rs_property_grid',
      // Standalone listings
      '[data-rs-standalone]',
    ];

    const containers: HTMLElement[] = [];
    const seen = new Set<HTMLElement>();

    for (const selector of containerSelectors) {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        // Skip elements marked as duplicates by renderTemplates()
        if (el.dataset.rsTemplateDuplicate) return;

        // Avoid duplicates (an element might match multiple selectors)
        if (!seen.has(el)) {
          seen.add(el);
          containers.push(el);
        }
      });
    }

    return containers;
  }

  /**
   * Global utility components that can be placed ANYWHERE on the page
   * (including header, footer, sidebar, etc.)
   * These are NOT affected by the duplicate prevention logic
   */
  const GLOBAL_UTILITY_COMPONENTS = [
    'rs_wishlist_counter',
    'rs_wishlist_button',
    'rs_language_selector',
    'rs_share_buttons',
    'rs_currency_selector',
  ];

  /**
   * Initialize all components in DOM
   * - Container-scoped components: Only within valid widget containers
   * - Global utility components: Anywhere on the page
   */
  function initializeComponents(): void {
    const allComponentNames = Object.keys(components);
    if (allComponentNames.length === 0) return;

    // Separate global utility components from container-scoped components
    const globalComponents = allComponentNames.filter(name => GLOBAL_UTILITY_COMPONENTS.includes(name));
    const containerComponents = allComponentNames.filter(name => !GLOBAL_UTILITY_COMPONENTS.includes(name));

    // Phase 1: Initialize GLOBAL utility components anywhere on the page
    if (globalComponents.length > 0) {
      const globalSelectors = globalComponents.map(name => `.${name}`).join(', ');
      document.querySelectorAll<RSHTMLElement>(globalSelectors).forEach((element) => {
        // Skip if already initialized
        if (element._rsComponent) return;

        for (const name of globalComponents) {
          if (element.classList.contains(name) && components[name]) {
            const variation = element.dataset.rsVariation || '1';
            Logger.debug(`[RealtySoft] Initializing global ${name} with variation: ${variation}`);
            const instance = new components[name](element, { variation });
            componentInstances.push(instance);
            element._rsComponent = instance;
            break;
          }
        }
      });
    }

    // Phase 2: Initialize CONTAINER-SCOPED components only within valid containers
    if (containerComponents.length > 0) {
      const containerSelectors = containerComponents.map(name => `.${name}`).join(', ');
      const containers = getWidgetContainers();

      if (containers.length === 0) {
        Logger.debug('[RealtySoft] No widget containers found on page');
        return;
      }

      Logger.debug('[RealtySoft] Found', containers.length, 'widget container(s)');

      for (const container of containers) {
        // Check if the container ITSELF is a component that needs initialization
        // (e.g., property-detail-container is both a container and a component)
        const rsContainer = container as RSHTMLElement;
        if (!rsContainer._rsComponent) {
          for (const name of containerComponents) {
            if (rsContainer.classList.contains(name) && components[name]) {
              const variation = rsContainer.dataset.rsVariation || '1';
              Logger.debug(`[RealtySoft] Initializing container-component ${name} with variation: ${variation}`);
              const instance = new components[name](rsContainer, { variation });
              componentInstances.push(instance);
              rsContainer._rsComponent = instance;
              break;
            }
          }
        }

        // Then search for components INSIDE the container
        container.querySelectorAll<RSHTMLElement>(containerSelectors).forEach((element) => {
          // Skip if already initialized
          if (element._rsComponent) return;

          for (const name of containerComponents) {
            if (element.classList.contains(name) && components[name]) {
              const variation = element.dataset.rsVariation || '1';
              Logger.debug(`[RealtySoft] Initializing ${name} with variation: ${variation}`);
              const instance = new components[name](element, { variation });
              componentInstances.push(instance);
              element._rsComponent = instance;
              break;
            }
          }
        });
      }
    }
  }

  /**
   * Register a component
   */
  function registerComponent(name: string, Component: ComponentConstructor): void {
    components[name] = Component;
  }

  /**
   * Get component instance by element
   */
  function getComponent(element: RSHTMLElement): ComponentInstance | undefined {
    return element._rsComponent;
  }

  /**
   * Perform search with current filters
   */
  async function search(): Promise<unknown> {
    if (widgetMode === 'search-only') {
      const filters = RealtySoftState.get('filters') as Partial<FilterState>;
      const searchURL = buildSearchURL(filters);
      Logger.debug('[RealtySoft] Search-only mode: redirecting to', searchURL);
      window.location.href = searchURL;
      return;
    }

    RealtySoftState.set('ui.loading', true);
    RealtySoftState.set('ui.error', null);

    try {
      const params = RealtySoftState.getSearchParams();
      const results = await RealtySoftAPI.searchProperties(params);

      // Results can have additional fields from API
      const resultsAny = results as unknown as Record<string, unknown>;
      const properties = results.data || [];
      const total = (results.total || results.count || properties.length || 0) as number;
      const paramsAny = params as unknown as Record<string, unknown>;
      const perPage = (paramsAny.per_page || paramsAny.limit || 12) as number;
      const totalPages =
        ((resultsAny.total_pages as number) || Math.ceil(total / perPage)) || 0;

      RealtySoftState.setMultiple({
        'results.properties': properties,
        'results.total': total,
        'results.totalPages': totalPages,
        'ui.loading': false,
      });

      // Track search with current filters
      RealtySoftAnalytics.trackSearch();

      document.dispatchEvent(
        new CustomEvent('realtysoft:search', {
          detail: { results: results },
        })
      );

      return results;
    } catch (error) {
      RealtySoftState.set('ui.loading', false);
      RealtySoftState.set('ui.error', (error as Error).message);
      throw error;
    }
  }

  /**
   * Initialize standalone listings — containers with data-rs-standalone.
   * These fetch their own data independently and don't affect global filters/results.
   * Use case: homepage with a full search widget + a curated property grid.
   */
  async function initStandaloneListings(): Promise<void> {
    const containers = document.querySelectorAll<HTMLElement>(
      '#rs_listing[data-rs-standalone], [class*="rs-listing-template-"][data-rs-standalone]'
    );
    if (!containers.length) return;

    for (const container of Array.from(containers)) {
      try {
        const filters = parseLockedFilters(container);

        // Convert locked filter format to API search params
        const params: Partial<SearchParams> = {};
        if (filters.location) params.location_id = filters.location as number;
        if (filters.listingType) params.listing_type = filters.listingType as string;
        if (filters.propertyType) params.type_id = filters.propertyType as number;
        if (filters.bedsMin) params.bedrooms_min = filters.bedsMin as number;
        if (filters.bedsMax) params.bedrooms_max = filters.bedsMax as number;
        if (filters.bathsMin) params.bathrooms_min = filters.bathsMin as number;
        if (filters.bathsMax) params.bathrooms_max = filters.bathsMax as number;
        if (filters.priceMin) params.list_price_min = filters.priceMin as number;
        if (filters.priceMax) params.list_price_max = filters.priceMax as number;
        if (filters.builtMin) params.build_size_min = filters.builtMin as number;
        if (filters.builtMax) params.build_size_max = filters.builtMax as number;
        if (filters.plotMin) params.plot_size_min = filters.plotMin as number;
        if (filters.plotMax) params.plot_size_max = filters.plotMax as number;
        if (filters.features) params.features = (filters.features as number[]).join(',');
        if (filters.ref) params.ref_no = filters.ref as string;

        // Limit and sort from data attributes (defaults: 6 properties, newest first)
        params.limit = parseInt(container.dataset.rsLimit || '6', 10);
        params.page = 1;
        params.order = container.dataset.rsOrder || 'create_date_desc';

        // Filter options
        const featuredOnly = container.dataset.rsFeatured === 'true';
        const ownOnly = container.dataset.rsOwn === 'true';
        const ownFirst = container.dataset.rsOwnFirst === 'true';

        if (featuredOnly) params.featured = '1';
        if (ownOnly) params.is_own = '1';

        const results = await RealtySoftAPI.searchProperties(params as SearchParams);
        let properties = results.data || [];

        // Sort own properties first if ownFirst is enabled
        if (ownFirst && properties.length > 0) {
          properties = properties.sort((a: Property, b: Property) => {
            const aOwn = a.is_own ? 1 : 0;
            const bOwn = b.is_own ? 1 : 0;
            return bOwn - aOwn; // Own properties first
          });
        }

        // Find grid component inside this container and inject data
        const gridEl = container.querySelector('.rs_property_grid') as RSHTMLElement | null;
        if (gridEl && gridEl._rsComponent) {
          const grid = gridEl._rsComponent as ComponentInstance;
          if (typeof grid.setStandaloneProperties === 'function') {
            (grid.setStandaloneProperties as (p: Property[]) => void)(properties);
          }
        }

        Logger.debug('[RealtySoft] Standalone listing loaded:', properties.length, 'properties');
      } catch (error) {
        console.error('[RealtySoft] Standalone listing error:', error);
      }
    }
  }

  /**
   * Push property OG data to WordPress transient cache.
   * Fire-and-forget — OG caching is non-critical.
   * Only runs on WordPress (wpRestUrl present in config).
   */
  function cacheOgData(property: Property): void {
    const config = (window.RealtySoftConfig || {}) as ControllerConfig;
    if (!config.wpRestUrl) return;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.wpApiNonce) headers['X-WP-Nonce'] = config.wpApiNonce;
    if ((config as any).wpOgToken) headers['X-RS-OG-Token'] = (config as any).wpOgToken;

    fetch(config.wpRestUrl + 'og-cache', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: property.ref || property.unique_ref,
        title: property.title,
        description: (property.short_description || property.description || '').substring(0, 300),
        image: (property.imagesFull?.[0]) || (property.images?.[0]) || '',
        price: RealtySoftLabels.formatPrice(property.price),
        location: property.location || '',
        site_name: config.siteName || '',
      }),
    })
      .then((r) => {
        if (!r.ok) console.warn('[RealtySoft] OG cache POST failed:', r.status, r.statusText);
        else Logger.debug('[RealtySoft] OG cache updated for:', property.ref || property.unique_ref);
      })
      .catch((e) => console.warn('[RealtySoft] OG cache POST error:', e));
  }

  /**
   * Load property detail
   */
  async function loadProperty(id: number): Promise<Property> {
    RealtySoftState.set('ui.loading', true);

    try {
      const result = await RealtySoftAPI.getProperty(id);
      const property = result.data || result;

      RealtySoftState.set('currentProperty', property);
      RealtySoftState.set('ui.loading', false);
      cacheOgData(property);

      RealtySoftAnalytics.trackPropertyView(property);

      document.dispatchEvent(
        new CustomEvent('realtysoft:property-loaded', {
          detail: { property },
        })
      );

      return property;
    } catch (error) {
      RealtySoftState.set('ui.loading', false);
      RealtySoftState.set('ui.error', (error as Error).message);
      throw error;
    }
  }

  /**
   * Load property by reference
   */
  async function loadPropertyByRef(ref: string): Promise<Property> {
    RealtySoftState.set('ui.loading', true);

    try {
      const result = await RealtySoftAPI.getPropertyByRef(ref);
      const property = result.data || result;

      RealtySoftState.set('currentProperty', property);
      RealtySoftState.set('ui.loading', false);
      cacheOgData(property);

      RealtySoftAnalytics.trackPropertyView(property);

      document.dispatchEvent(
        new CustomEvent('realtysoft:property-loaded', {
          detail: { property },
        })
      );

      return property;
    } catch (error) {
      RealtySoftState.set('ui.loading', false);
      RealtySoftState.set('ui.error', (error as Error).message);
      throw error;
    }
  }

  /**
   * Reset filters and search
   */
  function reset(): void {
    RealtySoftState.resetFilters();
  }

  /**
   * Go to page
   */
  function goToPage(page: number): void {
    RealtySoftState.set('results.page', page);
    RealtySoftAnalytics.trackPagination(
      page,
      RealtySoftState.get('results.totalPages') as number
    );
    search();
  }

  /**
   * Change sort
   */
  function setSort(sort: string): void {
    RealtySoftState.set('ui.sort', sort);
    RealtySoftState.set('results.page', 1);
    RealtySoftAnalytics.trackSortChange(sort);
    search();
  }

  /**
   * Change view (grid/list/map)
   * When switching to/from map view, adjust perPage and re-fetch if needed
   */
  function setView(view: string): void {
    const previousView = RealtySoftState.get<string>('ui.view') || 'grid';
    const wasMapView = previousView === 'map';
    const isMapView = view === 'map';

    RealtySoftState.set('ui.view', view);
    RealtySoftAnalytics.trackViewToggle(view);

    // When switching to/from map view, always update perPage and re-search
    if (wasMapView !== isMapView) {
      const listPerPage = RealtySoftState.get<number>('config.perPage') || 12;
      const mapPerPage = RealtySoftState.get<number>('config.mapPerPage') || 200;
      const newPerPage = isMapView ? mapPerPage : listPerPage;

      // Always set the correct perPage and re-search when switching views
      RealtySoftState.set('results.perPage', newPerPage);
      RealtySoftState.set('results.page', 1); // Reset to page 1
      search();
    }
  }

  /**
   * Update filter
   * Clears search cache to ensure fresh results with new filter values
   */
  function setFilter(name: string, value: unknown): void {
    Logger.debug('[RealtySoft] setFilter called:', name, '=', value);
    if (!RealtySoftState.isFilterLocked(name)) {
      // Clear search cache before updating filter to ensure fresh results
      RealtySoftAPI.clearSearchCache();
      RealtySoftState.set(`filters.${name}`, value);
      RealtySoftAnalytics.trackFilterChange(name, value);
    } else {
      Logger.debug('[RealtySoft] setFilter BLOCKED - filter is locked:', name);
    }
  }

  /**
   * Get public state
   */
  function getState(): Record<string, unknown> {
    return RealtySoftState.getState() as unknown as Record<string, unknown>;
  }

  /**
   * Subscribe to state changes
   */
  function subscribe(
    path: string,
    callback: (value: unknown, oldValue: unknown, path: string) => void
  ): () => void {
    return RealtySoftState.subscribe(path, callback);
  }

  /**
   * Check if initialized
   */
  function isReady(): boolean {
    return initialized;
  }

  /**
   * Extract property reference from current URL
   */
  function extractPropertyRefFromUrl(): string | null {
    const pathname = window.location.pathname;
    const globalConfig = (window.RealtySoftConfig || {}) as ControllerConfig;
    const propertySlug = globalConfig.propertyPageSlug || 'property';

    // 1. Query params: ?ref=X or ?reference=X
    const urlParams = new URLSearchParams(window.location.search);
    const queryRef = urlParams.get('ref') || urlParams.get('reference');
    if (queryRef) return queryRef.trim();

    // 2. Check if URL is under the property slug at all
    const slugRegex = new RegExp(`/${propertySlug}/(.+?)/?$`, 'i');
    const slugMatch = pathname.match(slugRegex);
    if (!slugMatch) return null;

    const subpath = slugMatch[1]; // e.g. "villa-name-V12345" or "R123456"

    // 3. SEO URL: /property/title-slug-REF (ref is last hyphen-separated segment)
    const parts = subpath.split('-');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/^[A-Z0-9]{3,}$/i.test(lastPart)) return lastPart;
    }

    // 4. Direct ref URL: /property/REF (the whole subpath is the ref)
    if (/^[A-Z0-9]{3,}$/i.test(subpath)) return subpath;

    return null;
  }

  /**
   * Check if current page looks like a 404 error page
   */
  function isLikely404Page(): boolean {
    const bodyText = (document.body.innerText || '').toLowerCase();
    const title = (document.title || '').toLowerCase();

    // Title patterns - must be specific to avoid false positives
    const titlePatterns = [
      '404',
      'not found',
      'page not found',
      'pagina no encontrada',
      'seite nicht gefunden',
      'page introuvable',
      'pagina non trovata',
    ];

    // Only match if title starts with or is primarily a 404 message
    // Avoid matching titles like "Property R-1404 | Site Name"
    for (const pattern of titlePatterns) {
      // Check if pattern is at the start or the title is very short (likely a 404 page)
      if (title.startsWith(pattern) || (title.includes(pattern) && title.length < 30)) {
        return true;
      }
    }

    // Use specific phrases that indicate a 404 page, avoid generic patterns
    // that could match property content (e.g., "404" in property ref "R-1404")
    const bodyPatterns = [
      'error 404',
      '404 error',
      '404 not found',
      'page not found',
      "page doesn't exist",
      'page does not exist',
      "this page couldn't be found",
      'this page could not be found',
      'no longer exists',
      'has been removed',
      'has been deleted',
      'pagina no encontrada',
      'seite nicht gefunden',
      'page introuvable',
    ];

    for (const pattern of bodyPatterns) {
      if (bodyText.includes(pattern)) {
        return true;
      }
    }

    const statusMeta = document.querySelector('meta[name="status"]') as HTMLMetaElement | null;
    if (statusMeta && statusMeta.content === '404') {
      return true;
    }

    // Only match explicit 404 page classes, avoid wildcards that cause false positives
    // (e.g., property ref "R-1404" would match [class*="404"])
    const errorSelectors = [
      '.error-404',
      '#error-404',
      '.page-404',
      '.not-found',
      '.error-page',
      'body.error404',      // WordPress default 404 body class
      'body.page-template-404',
    ];

    for (const selector of errorSelectors) {
      if (document.querySelector(selector)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Auto-inject property detail container and initialize
   */
  function autoInjectPropertyDetail(propertyRef: string): boolean {
    Logger.debug('[RealtySoft] Auto-detected property URL, ref:', propertyRef);

    const is404 = isLikely404Page();
    if (is404) {
      Logger.debug('[RealtySoft] Detected 404/error page, will replace content');
    }

    // Narrowest WordPress content selectors first
    const containerSelectors = [
      '.entry-content',
      '.page-content',
      '.post-content',
      '.single-content',
      'article',
      '.content',
      '#content',
      '.main-content',
      '.site-content',
      '#primary',
      '#main',
      'main',
    ];

    let mainContent: HTMLElement | null = null;
    let usedFallback = false;
    for (const selector of containerSelectors) {
      mainContent = document.querySelector<HTMLElement>(selector);
      if (mainContent) {
        Logger.debug(`[RealtySoft] Found container: ${selector}`);
        break;
      }
    }

    // Fallback: find the page heading and use its parent as the content container
    if (!mainContent) {
      const pageHeading = document.querySelector<HTMLElement>('h1, h2.page-title, h2.entry-title');
      if (pageHeading && pageHeading.parentElement && pageHeading.parentElement !== document.body) {
        mainContent = pageHeading.parentElement;
        usedFallback = true;
        Logger.debug(`[RealtySoft] Using heading parent as container: <${mainContent.tagName.toLowerCase()}>`);
      }
    }

    if (!mainContent) {
      mainContent = document.body;
      usedFallback = true;
      Logger.debug('[RealtySoft] Using body as container');
    }

    if (is404) {
      Logger.debug('[RealtySoft] Detected 404 page...');

      // NEVER clear body.innerHTML - it destroys header/footer
      // Only clear content of narrower containers
      if (!usedFallback) {
        Logger.debug('[RealtySoft] Clearing 404 content container...');
        mainContent.innerHTML = '';
      } else {
        // For body or broad containers, hide children instead of clearing
        Logger.debug('[RealtySoft] Hiding 404 content (preserving header/footer)...');
        const hideStyle = document.createElement('style');
        hideStyle.id = 'rs-404-hide';
        hideStyle.textContent = '.rs-404-hidden { display: none !important; }';
        document.head.appendChild(hideStyle);

        Array.from(mainContent.children).forEach((child) => {
          const el = child as HTMLElement;
          const tag = el.tagName.toLowerCase();
          if (
            tag === 'nav' || tag === 'header' || tag === 'footer' ||
            tag === 'aside' || tag === 'script' || tag === 'style' ||
            tag === 'link' || tag === 'noscript' ||
            el.classList.contains('elementor-location-header') ||
            el.classList.contains('elementor-location-footer') ||
            el.getAttribute('data-elementor-type') === 'header' ||
            el.getAttribute('data-elementor-type') === 'footer' ||
            el.getAttribute('role') === 'navigation' ||
            el.getAttribute('role') === 'banner' ||
            el.getAttribute('role') === 'contentinfo'
          ) {
            return;
          }
          el.classList.add('rs-404-hidden');
        });
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'rs-auto-injected-wrapper';
      wrapper.style.cssText = 'max-width: 1400px; margin: 0 auto; padding: 20px;';

      // Insert after header when using body as container
      if (usedFallback && mainContent === document.body) {
        const header = document.querySelector(
          'header, .elementor-location-header, [data-elementor-type="header"], [role="banner"]'
        );
        if (header && header.nextSibling) {
          header.parentNode!.insertBefore(wrapper, header.nextSibling);
        } else if (header) {
          header.parentNode!.appendChild(wrapper);
        } else {
          mainContent.insertBefore(wrapper, mainContent.firstChild);
        }
      } else {
        mainContent.appendChild(wrapper);
      }
      mainContent = wrapper;

      const globalConfig = (window.RealtySoftConfig || {}) as ControllerConfig;
      const originalTitle = document.title;
      document.title = globalConfig.detailPageTitle || 'Property Details';
      Logger.debug(
        `[RealtySoft] Updated page title from "${originalTitle}" to "${document.title}"`
      );

      const metaDesc = document.querySelector(
        'meta[name="description"]'
      ) as HTMLMetaElement | null;
      if (metaDesc) {
        metaDesc.content = `Property details for ${propertyRef}`;
      }

      if (window.history && window.history.replaceState) {
        window.history.replaceState({ propertyRef }, document.title, window.location.href);
      }
    }

    // On non-404 (WordPress rewrite served the real page):
    // Hide existing content and inject the detail container.
    // Use CSS hiding (not innerHTML clearing) when we fell back to a broad
    // container like body or a heading parent — clearing would destroy
    // nav, header, footer, and sidebar elements.
    if (!is404) {
      if (!usedFallback) {
        // Standard content container (e.g. .entry-content) — safe to replace
        mainContent.innerHTML = '';
      } else {
        // Broad container — hide children with CSS instead of destroying them
        const hideStyle = document.createElement('style');
        hideStyle.id = 'rs-auto-inject-hide';
        hideStyle.textContent =
          '.rs-auto-inject-hidden { display: none !important; }';
        document.head.appendChild(hideStyle);

        Array.from(mainContent.children).forEach((child) => {
          const el = child as HTMLElement;
          const tag = el.tagName.toLowerCase();
          // Keep structural elements (nav, header, footer, sidebar, scripts, styles)
          // Also preserve Elementor Theme Builder header/footer locations
          if (
            tag === 'nav' || tag === 'header' || tag === 'footer' ||
            tag === 'aside' || tag === 'script' || tag === 'style' ||
            tag === 'link' || tag === 'noscript' ||
            el.id === 'rs-early-hide' ||
            el.getAttribute('role') === 'navigation' ||
            el.getAttribute('role') === 'banner' ||
            el.getAttribute('role') === 'contentinfo' ||
            el.classList.contains('elementor-location-header') ||
            el.classList.contains('elementor-location-footer') ||
            el.getAttribute('data-elementor-type') === 'header' ||
            el.getAttribute('data-elementor-type') === 'footer'
          ) {
            return;
          }
          el.classList.add('rs-auto-inject-hidden');
        });
      }
    }

    const detailContainer = document.createElement('div');
    detailContainer.className = 'property-detail-container';
    detailContainer.id = 'property-detail-container';
    detailContainer.dataset.propertyRef = propertyRef;
    detailContainer.dataset.rsAutoInjected = 'true';

    detailContainer.innerHTML = `
      <div class="rs-detail-loading" style="text-align: center; padding: 60px 20px;">
        <div class="rs-spinner" style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: rs-spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 20px; color: #666;">Loading property details...</p>
      </div>
      <style>
        @keyframes rs-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    // Insert the container in the right position
    // When using body as fallback, insert after header (not at end)
    if (usedFallback && mainContent === document.body) {
      // Find header element to insert after
      const header = document.querySelector(
        'header, .elementor-location-header, [data-elementor-type="header"], [role="banner"]'
      );
      if (header && header.nextSibling) {
        header.parentNode!.insertBefore(detailContainer, header.nextSibling);
      } else if (header) {
        header.parentNode!.appendChild(detailContainer);
      } else {
        // No header found, prepend to body so content appears first
        mainContent.insertBefore(detailContainer, mainContent.firstChild);
      }
    } else {
      mainContent.appendChild(detailContainer);
    }

    Logger.debug('[RealtySoft] Auto-injected rs_detail container successfully');

    window._rsAutoInjectedRef = propertyRef;

    // Remove early-hide CSS + loading overlay now that the detail container is injected
    document.body.classList.add('rs-property-ready');
    const earlyHideStyle = document.getElementById('rs-early-hide');
    if (earlyHideStyle) earlyHideStyle.remove();
    const loadingOverlay = document.getElementById('rs-loading-overlay');
    if (loadingOverlay) loadingOverlay.remove();

    // Safety timeout: if the component hasn't initialized after 10 seconds,
    // show an error with retry instead of spinning forever
    setTimeout(() => {
      const loading = detailContainer.querySelector('.rs-detail-loading');
      if (loading) {
        console.error('[RealtySoft] Auto-inject timeout — component did not initialize');
        detailContainer.innerHTML = `
          <div style="text-align: center; padding: 60px 20px;">
            <div style="width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 50%; border: 2px solid #e74c3c; display: flex; align-items: center; justify-content: center;">
              <span style="color: #e74c3c; font-weight: bold; font-size: 20px;">!</span>
            </div>
            <p style="color: #666; margin-bottom: 16px;">Failed to load property details</p>
            <button onclick="window.location.reload()" style="padding: 10px 24px; background: #3498db; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Try Again</button>
          </div>
        `;
      }
    }, 10000);

    return true;
  }

  /**
   * Check if we should auto-initialize based on URL or elements
   */
  function shouldAutoInit(): boolean {
    // CHECK 1: Property detail URL — takes priority over widget elements
    const propertyRef = extractPropertyRefFromUrl();
    if (propertyRef) {
      const existingDetail = document.querySelector<HTMLElement>('.rs_detail');
      const existingTemplate =
        document.querySelector('.property-detail-container') ||
        document.querySelector('#property-detail-container');

      if (existingDetail && existingDetail.children.length === 0 && !existingTemplate) {
        // Empty rs_detail div — upgrade to self-rendering template
        Logger.debug('[RealtySoft] Found empty .rs_detail — upgrading to property-detail-container');
        existingDetail.classList.remove('rs_detail');
        existingDetail.classList.add('property-detail-container');
        existingDetail.id = 'property-detail-container';
        existingDetail.dataset.propertyRef = propertyRef;
        // Remove early-hide + loading overlay now that the container is ready
        document.body.classList.add('rs-property-ready');
        const earlyHide = document.getElementById('rs-early-hide');
        if (earlyHide) earlyHide.remove();
        const overlay = document.getElementById('rs-loading-overlay');
        if (overlay) overlay.remove();
      } else if (existingTemplate) {
        // USE existing property-detail-container — just set ref and reveal
        Logger.debug('[RealtySoft] Found existing .property-detail-container — using it');
        (existingTemplate as HTMLElement).dataset.propertyRef = propertyRef;
        document.body.classList.add('rs-property-ready');
        const earlyHide = document.getElementById('rs-early-hide');
        if (earlyHide) earlyHide.remove();
        const overlay = document.getElementById('rs-loading-overlay');
        if (overlay) overlay.remove();
      } else if (!existingDetail && !existingTemplate) {
        autoInjectPropertyDetail(propertyRef);
      }
      return true;
    }

    // CHECK 2: Widget elements
    if (
      document.querySelector('[class^="rs_"]') ||
      document.getElementById('rs_search') ||
      document.getElementById('rs_listing')
    ) {
      return true;
    }

    // CHECK 3: Template elements
    if (
      document.querySelector('.rs-search-template-01') ||
      document.querySelector('.rs-search-template-02') ||
      document.querySelector('.rs-search-template-03') ||
      document.querySelector('.rs-search-template-04') ||
      document.querySelector('.rs-search-template-05') ||
      document.querySelector('.rs-search-template-06') ||
      document.querySelector('.rs-listing-template-01') ||
      document.querySelector('.rs-listing-template-02') ||
      document.querySelector('.rs-listing-template-03') ||
      document.querySelector('.rs-listing-template-04') ||
      document.querySelector('.rs-listing-template-05') ||
      document.querySelector('.rs-listing-template-06') ||
      document.querySelector('.rs-listing-template-07') ||
      document.querySelector('.rs-listing-template-08') ||
      document.querySelector('.rs-listing-template-09') ||
      document.querySelector('.rs-listing-template-10') ||
      document.querySelector('.rs-listing-template-11') ||
      document.querySelector('.rs-listing-template-12')
    ) {
      return true;
    }

    // No widget elements found and no property URL — clean up early hide + overlay
    document.body.classList.add('rs-property-ready');
    const earlyHide = document.getElementById('rs-early-hide');
    if (earlyHide) earlyHide.remove();
    const loadOverlay = document.getElementById('rs-loading-overlay');
    if (loadOverlay) loadOverlay.remove();

    return false;
  }

  // Auto-initialize: start as early as possible
  if (document.readyState === 'loading') {
    // On property detail pages, start init as soon as <body> exists
    // (no need to wait for full DOM — the widget creates its own container).
    const cfg = (window as any).RealtySoftConfig || {};
    const detailSlug = cfg.propertyPageSlug || 'property';
    const isDetailUrl =
      new RegExp('/' + detailSlug + '/[^/]+', 'i').test(window.location.pathname) ||
      /[?&]ref(erence)?=/i.test(window.location.search);

    if (isDetailUrl && document.body) {
      // Body already exists (script loaded async after <body> tag) — start immediately
      if (shouldAutoInit()) {
        init();
      }
    } else {
      // Listing pages or body not ready — wait for full DOM
      document.addEventListener('DOMContentLoaded', () => {
        if (shouldAutoInit()) {
          init();
        }
      });
    }
  } else {
    setTimeout(() => {
      if (shouldAutoInit()) {
        init();
      }
    }, 0);
  }

  /**
   * Get current widget mode
   */
  function getMode(): WidgetMode {
    return widgetMode;
  }

  /**
   * Re-render all component instances with current labels
   */
  function reRenderComponents(): void {
    Logger.debug(
      '[RealtySoft] Re-rendering',
      componentInstances.length,
      'components with new labels'
    );
    for (const instance of componentInstances) {
      if (instance && typeof instance.render === 'function') {
        try {
          instance.render();
          if (typeof instance.bindEvents === 'function') {
            instance.bindEvents();
          }
        } catch (e) {
          console.warn('[RealtySoft] Error re-rendering component:', e);
        }
      }
    }
  }

  /**
   * Change language and reload labels
   */
  async function setLanguage(newLanguage: string): Promise<void> {
    Logger.debug('[RealtySoft] Changing language to:', newLanguage);

    const globalConfig = (window.RealtySoftConfig || {}) as ControllerConfig;
    const labelsMode = globalConfig.labelsMode || 'static';

    // IMPORTANT: Always reset labels to new language static defaults FIRST (instant)
    // This ensures components get correct labels when their subscriptions fire
    RealtySoftLabels.initStatic(newLanguage);
    if (globalConfig.labelOverrides) {
      RealtySoftLabels.applyOverrides(globalConfig.labelOverrides, newLanguage);
    }
    RealtySoftState.set('data.labels', RealtySoftLabels.getAll());

    // Now set state - this triggers component subscriptions, but labels are already updated
    RealtySoftState.set('config.language', newLanguage);

    // Re-initialize API with new language
    RealtySoftAPI.init({
      language: newLanguage,
      apiKey: globalConfig.apiKey,
      apiUrl: globalConfig.apiUrl,
      cache: globalConfig.cache,
    });

    // Clear all language-dependent caches to force fresh data
    RealtySoftAPI.clearPropertyCache();

    // Reset features/property types loaded flags so they refetch with new language
    RealtySoftState.set('data.featuresLoaded', false);
    RealtySoftState.set('data.propertyTypesLoaded', false);
    RealtySoftState.set('data.features', []);
    RealtySoftState.set('data.propertyTypes', []);

    // Refetch property data with new language
    // This ensures translated content is loaded from API
    const refetchPropertyData = async () => {
      try {
        // If on listing page with properties, re-run search
        const currentProperties = RealtySoftState.get<Property[]>('results.properties');
        if (currentProperties && currentProperties.length > 0) {
          Logger.debug('[RealtySoft] Language changed: refetching listing properties...');
          await search();
        }

        // If on detail page with a property, reload it with forceRefresh
        const currentProperty = RealtySoftState.get<Property>('currentProperty');
        if (currentProperty) {
          Logger.debug('[RealtySoft] Language changed: reloading detail property...');
          RealtySoftState.set('ui.loading', true);
          try {
            let result;
            if (currentProperty.ref) {
              result = await RealtySoftAPI.getPropertyByRef(currentProperty.ref, { forceRefresh: true });
            } else if (currentProperty.id) {
              result = await RealtySoftAPI.getProperty(currentProperty.id, { forceRefresh: true });
            }
            if (result?.data) {
              RealtySoftState.set('currentProperty', result.data);
              Logger.debug('[RealtySoft] Property reloaded with new language:', newLanguage);
            }
          } finally {
            RealtySoftState.set('ui.loading', false);
          }
        }
      } catch (error) {
        console.warn('[RealtySoft] Error refetching property data for new language:', error);
      }
    };

    // Start property refetch (don't await - let it run in parallel with label fetching)
    refetchPropertyData();

    // Static mode: we're done - no API call needed
    if (labelsMode === 'static') {
      Logger.debug('[RealtySoft] Static mode: language changed to:', newLanguage);
      reRenderComponents();
      return;
    }

    // API and hybrid modes: fetch labels from API
    RealtySoftAPI.clearCache('labels_' + newLanguage);

    if (labelsMode === 'hybrid') {
      // Hybrid mode: API fetch in background (non-blocking)
      RealtySoftAPI.getLabels()
        .then((labelsData) => {
          const apiLabels = transformAPILabels(labelsData, newLanguage);
          if (Object.keys(apiLabels).length > 0) {
            RealtySoftLabels.loadFromAPI(apiLabels);
            if (globalConfig.labelOverrides) {
              RealtySoftLabels.applyOverrides(globalConfig.labelOverrides, newLanguage);
            }
            RealtySoftState.set('data.labels', RealtySoftLabels.getAll());
            reRenderComponents();
            Logger.debug('[RealtySoft] Hybrid mode: API labels merged for:', newLanguage);
          }
          // Extract and store enabledListingTypes
          const enabledTypes = extractEnabledListingTypes(labelsData);
          if (enabledTypes !== null) {
            RealtySoftState.set('data.enabledListingTypes', enabledTypes);
          }
        })
        .catch((error) => {
          console.warn('[RealtySoft] Hybrid mode: API labels fetch failed, using static:', error);
        });

      // Re-render immediately with static labels
      reRenderComponents();
      Logger.debug('[RealtySoft] Hybrid mode: language changed to:', newLanguage);
      return;
    }

    // API mode: blocking fetch
    try {
      const labelsData = await RealtySoftAPI.getLabels();
      const apiLabels = transformAPILabels(labelsData, newLanguage);
      if (Object.keys(apiLabels).length > 0) {
        await RealtySoftLabels.loadFromAPI(apiLabels);
      }

      if (globalConfig.labelOverrides) {
        RealtySoftLabels.applyOverrides(globalConfig.labelOverrides, newLanguage);
      }

      RealtySoftState.set('data.labels', RealtySoftLabels.getAll());

      // Extract and store enabledListingTypes
      const enabledTypes = extractEnabledListingTypes(labelsData);
      if (enabledTypes !== null) {
        RealtySoftState.set('data.enabledListingTypes', enabledTypes);
      }

      reRenderComponents();
      Logger.debug('[RealtySoft] API mode: language changed successfully to:', newLanguage);
    } catch (error) {
      console.error('[RealtySoft] Error loading labels for language:', newLanguage, error);
      // Still re-render with static labels on error
      reRenderComponents();
    }
  }

  // Public API
  return {
    init,
    registerComponent,
    getComponent,
    search,
    loadProperty,
    loadPropertyByRef,
    reset,
    goToPage,
    setSort,
    setView,
    setFilter,
    getState,
    subscribe,
    isReady,
    getMode,
    setLanguage,
    getPropertyUrl, // Universal property URL generator for multilingual support

    // Expose sub-modules
    State: RealtySoftState as RealtySoftStateModule,
    API: RealtySoftAPI as RealtySoftAPIModule,
    Labels: RealtySoftLabels as RealtySoftLabelsModule,
    Analytics: RealtySoftAnalytics,
    Router: RealtySoftRouter,
  };
})();

// Make globally available
if (typeof window !== 'undefined') {
  window.RealtySoft = RealtySoft;
}

// Export for ES modules
export { RealtySoft };
export default RealtySoft;
