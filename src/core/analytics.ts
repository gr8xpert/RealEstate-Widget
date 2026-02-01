/**
 * RealtySoft Widget v3 - Analytics
 * Event tracking for search, views, clicks, wishlist, inquiries
 */

// Analytics config interface
interface AnalyticsConfig {
  enabled: boolean;
  endpoint: string | null;
  batchSize: number;
  batchDelay: number;
  debug: boolean;
}

// Analytics event interface
interface AnalyticsEvent {
  category: string;
  action: string;
  data: Record<string, unknown>;
  timestamp: string;
  url: string;
  referrer: string;
  userAgent: string;
  sessionId: string;
}

// Filter data for search tracking
interface FilterData {
  location?: number | number[] | null;
  listingType?: string | null;
  propertyType?: string | string[] | null;
  bedsMin?: number | null;
  bedsMax?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  features?: number[] | null;
}

// Property data for tracking
interface PropertyTrackData {
  id?: number;
  ref?: string;
  type?: string;
  location?: string;
  price?: number;
}

// Analytics module interface
interface RealtySoftAnalyticsModule {
  init: (options?: Partial<AnalyticsConfig>) => void;
  track: (category: string, action: string, data?: Record<string, unknown>) => void;
  flush: () => void;
  trackSearch: (filters?: FilterData) => void;
  trackPropertyView: (property?: PropertyTrackData) => void;
  trackCardClick: (property?: PropertyTrackData) => void;
  trackGalleryView: (propertyId: number, imageIndex: number) => void;
  trackWishlistAdd: (propertyId: number) => void;
  trackWishlistRemove: (propertyId: number) => void;
  trackWishlistView: (propertyIds?: number[]) => void;
  trackWishlistShare: (method: string) => void;
  trackInquiry: (propertyId: number, propertyRef?: string) => void;
  trackShare: (platform: string, propertyId: number) => void;
  trackLinkClick: (linkType: string, url: string) => void;
  trackFilterChange: (filterName: string, value: unknown) => void;
  trackPagination: (page: number, totalPages: number) => void;
  trackSortChange: (sortValue: string) => void;
  trackViewToggle: (view: string) => void;
  trackResourceClick: (resourceType: string, propertyId: number) => void;
}

const RealtySoftAnalytics: RealtySoftAnalyticsModule = (function () {
  'use strict';

  const config: AnalyticsConfig = {
    enabled: true,
    endpoint: null,
    batchSize: 5,
    batchDelay: 3000,
    debug: true,
  };

  /**
   * Auto-detect the analytics endpoint based on script location
   */
  function detectEndpoint(): string {
    try {
      const scripts = document.querySelectorAll('script[src*="realtysoft"]');
      for (let i = 0; i < scripts.length; i++) {
        const src = (scripts[i] as HTMLScriptElement).src;
        const pmIdx = src.indexOf('/propertymanager/');
        if (pmIdx !== -1) {
          return src.substring(0, pmIdx) + '/propertymanager/php/analytics-track.php';
        }
      }
    } catch (e) {
      console.error('[RealtySoft] Analytics detectEndpoint error:', e);
    }
    return 'https://smartpropertywidget.com/spw/php/analytics-track.php';
  }

  let eventQueue: AnalyticsEvent[] = [];
  let batchTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initialize analytics
   */
  function init(options?: Partial<AnalyticsConfig>): void {
    if (options) {
      if (options.enabled !== undefined) config.enabled = options.enabled;
      if (options.endpoint !== undefined) config.endpoint = options.endpoint;
      if (options.batchSize !== undefined) config.batchSize = options.batchSize;
      if (options.batchDelay !== undefined) config.batchDelay = options.batchDelay;
      if (options.debug !== undefined) config.debug = options.debug;
    }

    if (!config.endpoint) {
      config.endpoint = detectEndpoint();
    }

    console.log('[RealtySoft] Analytics initialized, endpoint:', config.endpoint);

    window.addEventListener('beforeunload', flush);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    });
  }

  /**
   * Track an event
   */
  function track(
    category: string,
    action: string,
    data: Record<string, unknown> = {}
  ): void {
    if (!config.enabled) return;

    const event: AnalyticsEvent = {
      category: category,
      action: action,
      data: data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
    };

    if (config.debug) {
      console.log('[RealtySoft] Analytics Event:', category, action);
    }

    eventQueue.push(event);

    if (eventQueue.length >= config.batchSize) {
      flush();
    } else {
      scheduleBatch();
    }
  }

  /**
   * Schedule batch send
   */
  function scheduleBatch(): void {
    if (batchTimer) return;

    batchTimer = setTimeout(function () {
      flush();
      batchTimer = null;
    }, config.batchDelay);
  }

  /**
   * Flush event queue to server
   */
  function flush(): void {
    if (eventQueue.length === 0) return;

    const events = eventQueue.slice();
    eventQueue = [];

    console.log(
      '[RealtySoft] Analytics: Sending',
      events.length,
      'events to',
      config.endpoint
    );

    if (!config.endpoint) return;

    fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: events }),
      keepalive: true,
    })
      .then(function (response) {
        console.log('[RealtySoft] Analytics response:', response.status);
        return response.json();
      })
      .then(function (data) {
        console.log('[RealtySoft] Analytics result:', data);
      })
      .catch(function (err) {
        console.error('[RealtySoft] Analytics send failed:', err);
      });
  }

  /**
   * Get or create session ID
   */
  function getSessionId(): string {
    let sessionId = sessionStorage.getItem('rs_session_id');
    if (!sessionId) {
      sessionId =
        'rs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('rs_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Track search event
   */
  function trackSearch(filters: FilterData = {}): void {
    track('search', 'search', {
      location: filters.location,
      listing_type: filters.listingType,
      property_type: filters.propertyType,
      beds_min: filters.bedsMin,
      beds_max: filters.bedsMax,
      price_min: filters.priceMin,
      price_max: filters.priceMax,
      features: filters.features,
    });
  }

  /**
   * Track property view
   */
  function trackPropertyView(property: PropertyTrackData = {}): void {
    track('view', 'property_view', {
      property_id: property.id,
      property_ref: property.ref,
      property_type: property.type,
      location: property.location,
      price: property.price,
    });
  }

  /**
   * Track property card click
   */
  function trackCardClick(property: PropertyTrackData = {}): void {
    track('click', 'card_click', {
      property_id: property.id,
      property_ref: property.ref,
    });
  }

  /**
   * Track gallery view
   */
  function trackGalleryView(propertyId: number, imageIndex: number): void {
    track('view', 'gallery_view', {
      property_id: propertyId,
      image_index: imageIndex,
    });
  }

  /**
   * Track wishlist add
   */
  function trackWishlistAdd(propertyId: number): void {
    track('wishlist', 'add', {
      property_id: propertyId,
    });
  }

  /**
   * Track wishlist remove
   */
  function trackWishlistRemove(propertyId: number): void {
    track('wishlist', 'remove', {
      property_id: propertyId,
    });
  }

  /**
   * Track wishlist view
   */
  function trackWishlistView(propertyIds: number[] = []): void {
    track('wishlist', 'view', {
      property_ids: propertyIds,
      count: propertyIds.length,
    });
  }

  /**
   * Track wishlist share
   */
  function trackWishlistShare(method: string): void {
    track('wishlist', 'share', {
      method: method,
    });
  }

  /**
   * Track inquiry submission
   */
  function trackInquiry(propertyId: number, propertyRef?: string): void {
    track('inquiry', 'submit', {
      property_id: propertyId,
      property_ref: propertyRef,
    });
  }

  /**
   * Track social share
   */
  function trackShare(platform: string, propertyId: number): void {
    track('click', 'share', {
      platform: platform,
      property_id: propertyId,
    });
  }

  /**
   * Track link click
   */
  function trackLinkClick(linkType: string, url: string): void {
    track('click', 'link', {
      link_type: linkType,
      url: url,
    });
  }

  /**
   * Track filter change
   */
  function trackFilterChange(filterName: string, value: unknown): void {
    track('search', 'filter_change', {
      filter: filterName,
      value: value,
    });
  }

  /**
   * Track pagination
   */
  function trackPagination(page: number, totalPages: number): void {
    track('click', 'pagination', {
      page: page,
      total_pages: totalPages,
    });
  }

  /**
   * Track sort change
   */
  function trackSortChange(sortValue: string): void {
    track('click', 'sort', {
      sort: sortValue,
    });
  }

  /**
   * Track view toggle (grid/list)
   */
  function trackViewToggle(view: string): void {
    track('click', 'view_toggle', {
      view: view,
    });
  }

  /**
   * Track resource click (PDF, virtual tour, video, etc.)
   */
  function trackResourceClick(resourceType: string, propertyId: number): void {
    track('click', 'resource', {
      resource_type: resourceType,
      property_id: propertyId,
    });
  }

  return {
    init,
    track,
    flush,
    trackSearch,
    trackPropertyView,
    trackCardClick,
    trackGalleryView,
    trackWishlistAdd,
    trackWishlistRemove,
    trackWishlistView,
    trackWishlistShare,
    trackInquiry,
    trackShare,
    trackLinkClick,
    trackFilterChange,
    trackPagination,
    trackSortChange,
    trackViewToggle,
    trackResourceClick,
  };
})();

// Make globally available
if (typeof window !== 'undefined') {
  (
    window as unknown as { RealtySoftAnalytics: RealtySoftAnalyticsModule }
  ).RealtySoftAnalytics = RealtySoftAnalytics;
}

// Export for ES modules
export { RealtySoftAnalytics };
export default RealtySoftAnalytics;
