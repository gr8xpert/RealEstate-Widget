/**
 * RealtySoft Widget v3 - SPA Router
 * Intercepts property card clicks for client-side navigation (no page reload).
 * Uses history.pushState() to update the URL and swaps content in-place.
 */

import type {
  Property,
  RealtySoftStateModule,
  RealtySoftLabelsModule,
  WidgetConfig,
} from '../types/index';

declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;

interface RouterState {
  rsView: 'detail' | 'listing';
  ref?: string;
  scrollY?: number;
  listingUrl?: string;
}

// Session storage keys
const SS_SCROLL = 'rs_router_scroll';
const SS_LISTING_URL = 'rs_router_listing_url';

/**
 * RealtySoftRouter — singleton SPA navigation module.
 *
 * Pattern: IIFE module (same as other core modules).
 */
const RealtySoftRouter = (function () {
  'use strict';

  let _initialized = false;
  let _enabled = false;

  /** References to listing/search containers hidden during detail view */
  let _hiddenContainers: HTMLElement[] = [];

  /** The detail container created by the router */
  let _routerDetailContainer: HTMLElement | null = null;

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------

  /**
   * Initialize the router. Safe to call multiple times (idempotent).
   */
  function init(): void {
    if (_initialized) return;
    _initialized = true;

    // Listen for browser back/forward
    window.addEventListener('popstate', _onPopState);

    // Determine if routing is possible on this page
    _enabled = _detectListingContainers().length > 0;

    console.log('[RealtySoftRouter] Initialized, enabled:', _enabled);
  }

  /**
   * Whether the SPA router can handle navigation on the current page.
   * Disabled: listing (/properties/) and detail (/property/) are separate
   * pages with their own WordPress templates, so SPA in-page swapping
   * would render detail content inside the wrong page layout.
   * Card clicks fall through to full page navigation instead.
   */
  function isEnabled(): boolean {
    return false;
  }

  /**
   * SPA-navigate to a property detail view.
   *
   * @param property  The property to display
   * @param url       The target URL (SEO-friendly or query-param)
   */
  function navigateToProperty(property: Property, url: string): void {
    if (!isEnabled()) {
      // Fallback: full page navigation
      window.location.href = url;
      return;
    }

    // 1. Save scroll position + listing URL
    const scrollY = window.scrollY || window.pageYOffset;
    try {
      sessionStorage.setItem(SS_SCROLL, String(scrollY));
      sessionStorage.setItem(SS_LISTING_URL, window.location.href);
    } catch { /* storage full — non-critical */ }

    // 2. Hide listing/search containers
    _hiddenContainers = _detectListingContainers();
    for (const el of _hiddenContainers) {
      el.style.display = 'none';
    }

    // 3. Create detail container
    const ref = property.ref || String(property.id);
    _routerDetailContainer = document.createElement('div');
    _routerDetailContainer.className = 'property-detail-container rs-router-detail';
    _routerDetailContainer.id = 'property-detail-container';
    _routerDetailContainer.dataset.propertyRef = ref;
    _routerDetailContainer.dataset.rsAutoInjected = 'true';

    // Loading spinner
    _routerDetailContainer.innerHTML = `
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

    // Insert into the page — find the best parent
    const parent = _findContentParent();
    if (parent.firstChild) {
      parent.insertBefore(_routerDetailContainer, parent.firstChild);
    } else {
      parent.appendChild(_routerDetailContainer);
    }

    // 4. Push history state
    const title = property.title || 'Property Details';
    const state: RouterState = { rsView: 'detail', ref };
    history.pushState(state, title, url);

    // 5. Signal to the widget that this ref should be loaded
    window._rsAutoInjectedRef = ref;

    // 6. Mark body ready (removes early-hide if present)
    document.body.classList.add('rs-property-ready');
    const earlyHide = document.getElementById('rs-early-hide');
    if (earlyHide) earlyHide.remove();

    // 7. Update document title
    document.title = title;

    // 8. Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // 9. Trigger component initialization on the new container
    // The controller's auto-init will pick up the container via the
    // rs_detail component registration, but we also dispatch a custom
    // event so the controller can handle it immediately.
    window.dispatchEvent(new CustomEvent('rs:router:navigated', {
      detail: { view: 'detail', ref, property }
    }));

    console.log('[RealtySoftRouter] Navigated to detail:', ref);
  }

  /**
   * Navigate back to the listing view (reverse of navigateToProperty).
   */
  function navigateToListing(): void {
    // 1. Remove detail container
    if (_routerDetailContainer) {
      _routerDetailContainer.remove();
      _routerDetailContainer = null;
    }

    // 2. Restore listing/search containers
    for (const el of _hiddenContainers) {
      el.style.display = '';
    }
    _hiddenContainers = [];

    // 3. Clear auto-injected ref
    window._rsAutoInjectedRef = undefined;

    // 4. Go back in history
    const listingUrl = _getStoredListingUrl();
    if (listingUrl) {
      history.pushState({ rsView: 'listing' } as RouterState, '', listingUrl);
    } else {
      history.back();
      return; // popstate will handle the rest
    }

    // 5. Restore scroll position
    const storedScroll = _getStoredScroll();
    if (storedScroll > 0) {
      // Use requestAnimationFrame to ensure DOM has reflowed
      requestAnimationFrame(() => {
        window.scrollTo({ top: storedScroll, behavior: 'instant' as ScrollBehavior });
      });
    }

    // 6. Restore document title (from listing page)
    // The title was set by the listing page originally; we can't recover it,
    // so leave it as-is or let the page logic handle it.

    console.log('[RealtySoftRouter] Navigated back to listing');
  }

  /**
   * Whether we can go back to a listing view via the router
   * (i.e. we SPA-navigated to detail from a listing).
   */
  function canGoBackToListing(): boolean {
    return _hiddenContainers.length > 0 || !!_getStoredListingUrl();
  }

  // ---------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------

  /** Find listing and search containers on the page */
  function _detectListingContainers(): HTMLElement[] {
    const selectors = [
      '.rs_property_grid',
      '.rs-property-grid',
      '[class*="rs-listing-template"]',
      '[class*="rs-search-template"]',
      '.rs_search',
      '#rs_search',
      '.rs_listing',
      '#rs_listing',
      '.rs_property_carousel',
      '.rs-property-carousel',
      '.rs_pagination',
      '.rs-pagination',
      '.rs_results_count',
      '.rs-results-count',
      '.rs_sort',
      '.rs_view_toggle',
    ];

    const found: HTMLElement[] = [];
    const seen = new Set<HTMLElement>();

    for (const sel of selectors) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          found.push(el);
        }
      });
    }

    return found;
  }

  /** Find the best parent element to inject the detail container */
  function _findContentParent(): HTMLElement {
    const containerSelectors = [
      'main',
      '.content',
      '#content',
      'article',
      '.entry-content',
      '.page-content',
      '.site-content',
      '.main-content',
      '#main',
      '#primary',
    ];

    for (const sel of containerSelectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) return el;
    }

    return document.body;
  }

  /** Handle browser back/forward buttons */
  function _onPopState(e: PopStateEvent): void {
    const state = e.state as RouterState | null;

    if (state && state.rsView === 'listing') {
      // User pressed back from detail → listing
      if (_routerDetailContainer) {
        _routerDetailContainer.remove();
        _routerDetailContainer = null;
      }
      for (const el of _hiddenContainers) {
        el.style.display = '';
      }
      _hiddenContainers = [];
      window._rsAutoInjectedRef = undefined;

      const storedScroll = _getStoredScroll();
      if (storedScroll > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: storedScroll, behavior: 'instant' as ScrollBehavior });
        });
      }
    } else if (state && state.rsView === 'detail' && state.ref) {
      // User pressed forward from listing → detail (re-enter detail)
      // Let the page reload handle this — or we could re-inject,
      // but for simplicity we allow default browser behavior.
    }
  }

  function _getStoredScroll(): number {
    try {
      return parseInt(sessionStorage.getItem(SS_SCROLL) || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  function _getStoredListingUrl(): string | null {
    try {
      return sessionStorage.getItem(SS_LISTING_URL);
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------
  // Module export
  // ---------------------------------------------------------------

  return {
    init,
    isEnabled,
    navigateToProperty,
    navigateToListing,
    canGoBackToListing,
  };
})();

// Make globally available
if (typeof window !== 'undefined') {
  (window as any).RealtySoftRouter = RealtySoftRouter;
}

export { RealtySoftRouter };
export default RealtySoftRouter;
