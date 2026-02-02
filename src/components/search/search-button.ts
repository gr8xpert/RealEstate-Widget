/**
 * RealtySoft Widget v3 - Search Button Component
 * Shows instant property count based on current filters
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  FilterState,
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAPI: RealtySoftAPIModule;
declare const RealtySoftLogger: { debug: (msg: string, ...args: unknown[]) => void } | undefined;

const Logger = {
  debug: (msg: string, ...args: unknown[]) => {
    if (typeof RealtySoftLogger !== 'undefined') RealtySoftLogger.debug(msg, ...args);
  }
};

class RSSearchButton extends RSBaseComponent {
  private isLoading: boolean = false;
  private propertyCount: number | null = null;
  private countDebounce: ReturnType<typeof setTimeout> | null = null;
  private button: HTMLButtonElement | null = null;
  private text: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private loader: HTMLElement | null = null;
  private icon: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.isLoading = false;
    this.propertyCount = null;
    this.countDebounce = null;

    this.render();
    this.bindEvents();

    // Subscribe to loading state
    this.subscribe<boolean>('ui.loading', (loading) => {
      this.isLoading = loading;
      this.updateDisplay();
    });

    // Subscribe to filter changes to update count
    this.subscribe<FilterState>('filters', (filters, oldValue, path) => {
      Logger.debug('[RealtySoft] Search button: filters changed', { path, filters });
      this.fetchCount();
    });

    // Initial count fetch
    this.fetchCount();
  }

  render(): void {
    this.element.classList.add('rs-search-button');

    this.element.innerHTML = `
      <button type="button" class="rs-search-button__btn">
        <span class="rs-search-button__text">${this.label('search_button')}</span>
        <span class="rs-search-button__count"></span>
        <span class="rs-search-button__loader" style="display: none;">
          <svg class="rs-search-button__spinner" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </span>
        <span class="rs-search-button__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </span>
      </button>
    `;

    this.button = this.element.querySelector('.rs-search-button__btn');
    this.text = this.element.querySelector('.rs-search-button__text');
    this.countEl = this.element.querySelector('.rs-search-button__count');
    this.loader = this.element.querySelector('.rs-search-button__loader');
    this.icon = this.element.querySelector('.rs-search-button__icon');
  }

  bindEvents(): void {
    if (this.button) {
      this.button.addEventListener('click', (e: Event) => {
        e.preventDefault();
        if (!this.isLoading) {
          RealtySoft.search();
        }
      });
    }
  }

  private async fetchCount(): Promise<void> {
    // Debounce count fetching
    if (this.countDebounce) {
      clearTimeout(this.countDebounce);
    }

    this.countDebounce = setTimeout(async () => {
      try {
        const params = RealtySoftState.getSearchParams() as unknown as Record<string, unknown>;
        params.limit = 1; // Only need count, not actual results
        params.page = 1;
        Logger.debug('[RealtySoft] Search button: fetching count with params', JSON.stringify(params));
        const result = await RealtySoftAPI.searchProperties(params);
        Logger.debug('[RealtySoft] Search button: API result', result);

        // Handle different API response formats for total count
        const resultAny = result as unknown as Record<string, unknown>;
        this.propertyCount =
          (result.total as number) ||
          (resultAny.count as number) ||
          (resultAny.total_count as number) ||
          (resultAny.totalCount as number) ||
          (resultAny.total_results as number) ||
          (result.data ? result.data.length : 0) ||
          0;
        Logger.debug('[RealtySoft] Search button: count =', this.propertyCount);
        this.updateCountDisplay();
      } catch (e) {
        console.warn('Could not fetch property count:', e);
        this.propertyCount = null;
        this.updateCountDisplay();
      }
    }, 500); // 500ms debounce to match old widget
  }

  private updateCountDisplay(): void {
    if (this.countEl && this.propertyCount !== null && !this.isLoading) {
      this.countEl.textContent = '(' + this.propertyCount + ')';
      this.countEl.style.display = 'inline';
    } else if (this.countEl) {
      this.countEl.style.display = 'none';
    }
  }

  private updateDisplay(): void {
    if (this.isLoading) {
      if (this.button) this.button.disabled = true;
      if (this.button) this.button.classList.add('rs-search-button__btn--loading');
      if (this.loader) this.loader.style.display = 'inline-block';
      if (this.icon) this.icon.style.display = 'none';
      if (this.countEl) this.countEl.style.display = 'none';
      if (this.text) this.text.textContent = this.label('results_loading');
    } else {
      if (this.button) this.button.disabled = false;
      if (this.button) this.button.classList.remove('rs-search-button__btn--loading');
      if (this.loader) this.loader.style.display = 'none';
      if (this.icon) this.icon.style.display = 'inline-block';
      if (this.text) this.text.textContent = this.label('search_button');
      this.updateCountDisplay();
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_search_button', RSSearchButton as unknown as ComponentConstructor);

export { RSSearchButton };
export default RSSearchButton;
