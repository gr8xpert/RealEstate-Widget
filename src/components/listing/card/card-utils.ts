/**
 * RealtySoft Widget v3 - Card Sub-Component Utilities
 * Shared helpers for standalone card sub-components
 */

import type {
  Property,
  RealtySoftAPIModule,
  RealtySoftStateModule,
} from '../../../types/index';

declare const RealtySoftAPI: RealtySoftAPIModule;
declare const RealtySoftState: RealtySoftStateModule;

// Cache for in-flight requests to deduplicate concurrent calls
const pendingRequests = new Map<string, Promise<Property | null>>();

// ---------------------------------------------------------------------------
// Lazy-loading: shared IntersectionObserver for card sub-components
// ---------------------------------------------------------------------------

let lazyObserver: IntersectionObserver | null = null;
const lazyCallbacks = new WeakMap<Element, () => void>();

function getLazyObserver(): IntersectionObserver | null {
  if (lazyObserver) return lazyObserver;
  if (typeof IntersectionObserver === 'undefined') return null;

  lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cb = lazyCallbacks.get(entry.target);
        if (cb) {
          cb();
          lazyCallbacks.delete(entry.target);
          lazyObserver?.unobserve(entry.target);
        }
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.01,
  });

  return lazyObserver;
}

/**
 * Defer a callback until the element enters (or is near) the viewport.
 *
 * - Default behaviour: lazy (uses IntersectionObserver with 200 px margin).
 * - Opt-out:  set `data-rs-lazy="false"` on the element to load eagerly.
 * - Fallback: if IntersectionObserver is not supported, runs immediately.
 */
export function onElementVisible(element: HTMLElement, callback: () => void): void {
  if (element.dataset.rsLazy === 'false') {
    callback();
    return;
  }

  const observer = getLazyObserver();
  if (!observer) {
    callback();
    return;
  }

  lazyCallbacks.set(element, callback);
  observer.observe(element);
}

/**
 * Get a property by reading data-rs-property-ref or data-rs-property-id
 * from the element itself or an ancestor. Deduplicates concurrent requests.
 */
export async function getCardProperty(element: HTMLElement): Promise<Property | null> {
  const ref = element.dataset.rsPropertyRef
    || element.closest('[data-rs-property-ref]')?.getAttribute('data-rs-property-ref');
  const id = element.dataset.rsPropertyId
    || element.closest('[data-rs-property-id]')?.getAttribute('data-rs-property-id');

  if (!ref && !id) return null;

  const cacheKey = ref ? `ref:${ref}` : `id:${id}`;

  // Deduplicate concurrent requests for the same property
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const promise = (async (): Promise<Property | null> => {
    try {
      if (ref) {
        const result = await RealtySoftAPI.getPropertyByRef(ref);
        return result.data;
      } else if (id) {
        const result = await RealtySoftAPI.getProperty(Number(id));
        return result.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, promise);
  return promise;
}

/**
 * XSS-safe text escaping
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate SEO-friendly property URL
 * Uses the universal URL helper that supports translation plugins
 */
export function generatePropertyUrl(property: Property): string {
  // Use central helper if available (supports multilingual URLs)
  if (typeof (window as any).RealtySoftGetPropertyUrl === 'function') {
    return (window as any).RealtySoftGetPropertyUrl(property);
  }
  // Fallback for older setups
  if (property.url) return property.url;
  const pageSlug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';
  return `/${pageSlug}/${property.ref || property.id}`;
}

/**
 * SVG icons for card sub-components
 */
export const SVG_ICONS = {
  mapPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  bed: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>',
  bath: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path><line x1="10" x2="8" y1="5" y2="7"></line><line x1="2" x2="22" y1="12" y2="12"></line><line x1="7" x2="7" y1="19" y2="21"></line><line x1="17" x2="17" y1="19" y2="21"></line></svg>',
  builtArea: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
  plotSize: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path><path d="M12 2v20"></path><path d="M3 6l9 4 9-4"></path></svg>',
  heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
  heartFilled: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
};
