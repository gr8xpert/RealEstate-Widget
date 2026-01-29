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
