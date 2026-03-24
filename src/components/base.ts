/**
 * RealtySoft Widget v3 - Base Component
 * Base class for all components
 */

import type {
  ComponentOptions,
  UnsubscribeFunction,
  SubscriptionCallback,
  RealtySoftStateModule,
  RealtySoftLabelsModule,
  RealtySoftModule,
  LockedFilters,
} from '../types/index';

// Declare global modules (they are set by the IIFE modules)
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoft: RealtySoftModule;

// Extended HTMLElement with component reference
interface RSHTMLElement extends HTMLElement {
  _rsComponent?: RSBaseComponent;
  dataset: DOMStringMap & {
    rsInit?: string;
  };
}

/**
 * Base component class for all RealtySoft components
 */
class RSBaseComponent {
  element: RSHTMLElement;
  options: ComponentOptions;
  variation: string;
  subscriptions: UnsubscribeFunction[];

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    this.element = element as RSHTMLElement;
    this.options = options;
    this.variation = options.variation || '1';
    this.subscriptions = [];

    // Mark element as initialized
    this.element.dataset.rsInit = 'true';

    // NOTE: this.init() is NOT called here.
    // Subclasses MUST call this.init() at the end of their own constructor.
    // This is required because ES2022 class field initializers run AFTER super()
    // returns but BEFORE the rest of the subclass constructor body. If init()
    // were called here (inside super), any subclass field initializers (e.g.
    // `private select: HTMLSelectElement | null = null`) would overwrite
    // properties set during init/render/bindEvents.
  }

  /**
   * Initialize component - override in subclass
   */
  init(): void {
    this.render();
    this.bindEvents();
  }

  /**
   * Render component - override in subclass
   */
  render(): void {}

  /**
   * Bind events - override in subclass
   */
  bindEvents(): void {}

  /**
   * Subscribe to state changes
   */
  subscribe<T = unknown>(path: string, callback: SubscriptionCallback<T>): UnsubscribeFunction {
    const unsubscribe = RealtySoftState.subscribe(path, callback);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Get label
   */
  label(key: string, replacements?: Record<string, string | number>): string {
    return RealtySoftLabels.get(key, replacements);
  }

  /**
   * Check if this filter is locked
   */
  isLocked(filterName: string): boolean {
    return RealtySoftState.isFilterLocked(filterName);
  }

  /**
   * Apply locked/disabled styles to element
   * Shows the filter but prevents interaction
   */
  applyLockedStyle(): void {
    this.element.classList.add('rs-filter--locked');
    this.element.setAttribute('title', 'This filter is pre-set for this page');
  }

  /**
   * Get locked filter value
   */
  getLockedValue(filterName: string): unknown {
    const lockedFilters = RealtySoftState.get<LockedFilters>('lockedFilters') || {};
    return lockedFilters[filterName];
  }

  /**
   * Set filter value
   */
  setFilter(name: string, value: unknown): void {
    RealtySoft.setFilter(name, value);
  }

  /**
   * Get filter value
   */
  getFilter<T = unknown>(name: string): T {
    return RealtySoftState.get<T>(`filters.${name}`);
  }

  /**
   * Create element helper
   */
  createElement(tag: string, className?: string, innerHTML: string = ''): HTMLElement {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  /**
   * Get wishlist icon SVG path based on config
   * Returns the SVG path element for heart/star/bookmark/save icons
   */
  getWishlistIconPath(): string {
    const iconType = RealtySoftState.get<string>('config.wishlistIcon') || 'heart';

    switch (iconType) {
      case 'star':
        return '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>';
      case 'bookmark':
        return '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>';
      case 'save':
        return '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>';
      case 'heart':
      default:
        return '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>';
    }
  }

  /**
   * Get full wishlist icon SVG element
   */
  getWishlistIconSvg(filled: boolean = false, className: string = '', width: number = 20, height: number = 20): string {
    return `<svg class="${className}" width="${width}" height="${height}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">${this.getWishlistIconPath()}</svg>`;
  }

  /**
   * Destroy component
   */
  destroy(): void {
    // Unsubscribe from all state subscriptions
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];

    // Clear element
    this.element.innerHTML = '';
    delete this.element._rsComponent;
    delete this.element.dataset.rsInit;
  }
}

// Assign to window for backwards compatibility
if (typeof window !== 'undefined') {
  (window as unknown as { RSBaseComponent: typeof RSBaseComponent }).RSBaseComponent =
    RSBaseComponent;
}

// Export for ES modules
export { RSBaseComponent };
export default RSBaseComponent;
