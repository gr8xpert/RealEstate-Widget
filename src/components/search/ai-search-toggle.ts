/**
 * RealtySoft Widget v3 - AI Search Toggle Component
 * Adds AI-powered natural language search (Premium feature)
 * Shows a star icon that transforms search into AI text input
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  Location,
  PropertyType,
  Feature,
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAPI: RealtySoftAPIModule;

// Base URL for PHP endpoints
const PHP_BASE_URL = 'https://realtysoft.ai/propertymanager/php';

// AI Search filter response from backend
interface AISearchFilters {
  location?: number | null;
  sublocation?: number | null;
  propertyType?: number | null;
  listingType?: string | null;
  bedsMin?: number | null;
  bathsMin?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  builtMin?: number | null;
  builtMax?: number | null;
  plotMin?: number | null;
  plotMax?: number | null;
  features?: number[];
  ref?: string | null;
}

interface AISearchResponse {
  success: boolean;
  filters?: AISearchFilters;
  interpretation?: string;
  error?: string;
}

class RSAISearchToggle extends RSBaseComponent {
  private isAIMode: boolean = false;
  private isPremium: boolean = false;
  private isLoading: boolean = false;
  private searchContainer: HTMLElement | null = null;
  private searchFormElements: HTMLElement[] = [];
  private toggleBtn: HTMLButtonElement | null = null;
  private aiModeEl: HTMLElement | null = null;
  private textarea: HTMLTextAreaElement | null = null;
  private searchBtn: HTMLButtonElement | null = null;
  private errorEl: HTMLElement | null = null;
  private closeBtn: HTMLButtonElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  async init(): Promise<void> {
    // Find parent search container
    this.searchContainer = this.element.closest('#rs_search') ||
                           this.element.closest('.rs-search') ||
                           this.element.closest('[class*="rs-template-search"]');

    if (!this.searchContainer) {
      // Try to find any search container on the page
      this.searchContainer = document.getElementById('rs_search') ||
                             document.querySelector('.rs-search') ||
                             document.querySelector('[class*="rs-template-search"]');
    }

    // Find ALL search form elements to hide (rows, grids, form containers)
    if (this.searchContainer) {
      const selectors = [
        '.search-grid',
        '[class*="__row"]',
        '.rs-search__form',
        '[class*="search-01__"]',
        '[class*="search-02__"]',
        '[class*="search-03__"]'
      ];

      selectors.forEach(selector => {
        const elements = this.searchContainer!.querySelectorAll(selector);
        elements.forEach(el => {
          // Don't include AI mode elements
          if (!el.classList.contains('rs-ai-mode') && !el.closest('.rs-ai-mode')) {
            this.searchFormElements.push(el as HTMLElement);
          }
        });
      });

      // Also find direct children that are form-like
      const directChildren = this.searchContainer.children;
      for (let i = 0; i < directChildren.length; i++) {
        const child = directChildren[i] as HTMLElement;
        if (child.tagName !== 'BUTTON' &&
            !child.classList.contains('rs-ai-toggle') &&
            !child.classList.contains('rs-ai-mode') &&
            !child.classList.contains('rs_ai_search_toggle')) {
          if (!this.searchFormElements.includes(child)) {
            this.searchFormElements.push(child);
          }
        }
      }
    }

    // Check premium status
    await this.checkPremiumStatus();

    if (this.isPremium) {
      this.render();
      this.bindEvents();

      // Subscribe to language changes to update labels
      this.subscribe<string>('config.language', () => {
        this.updateLabels();
      });

      // Subscribe to labels being loaded/reloaded (handles initial load and language switch)
      this.subscribe<Record<string, string>>('labels', () => {
        this.updateLabels();
      });

      // Also update labels after a short delay to catch late label loading
      setTimeout(() => this.updateLabels(), 500);
    }
  }

  /**
   * Update labels when language changes
   */
  private updateLabels(): void {
    if (!this.aiModeEl) return;

    // Update title
    const titleEl = this.aiModeEl.querySelector('.rs-ai-mode__title');
    if (titleEl) {
      const iconHtml = titleEl.querySelector('svg')?.outerHTML || '';
      titleEl.innerHTML = iconHtml + ' ' + this.label('ai_search_title');
    }

    // Update back button
    const backBtn = this.aiModeEl.querySelector('.rs-ai-mode__close');
    if (backBtn) {
      const iconHtml = backBtn.querySelector('svg')?.outerHTML || '';
      backBtn.innerHTML = iconHtml + ' ' + this.label('ai_search_back');
    }

    // Update placeholder
    if (this.textarea) {
      this.textarea.placeholder = this.label('ai_search_placeholder');
    }

    // Update search button text
    const searchTextEl = this.aiModeEl.querySelector('.rs-ai-mode__search-text');
    if (searchTextEl) {
      searchTextEl.textContent = this.label('ai_search_button');
    }

    // Update "Try:" label
    const tryLabel = this.aiModeEl.querySelector('.rs-ai-mode__examples-label');
    if (tryLabel) {
      tryLabel.textContent = this.label('ai_search_try');
    }

    // Update example buttons
    const exampleBtns = this.aiModeEl.querySelectorAll('.rs-ai-mode__examples button');
    const examples = [
      this.label('ai_search_example_1'),
      this.label('ai_search_example_2'),
      this.label('ai_search_example_3')
    ];
    exampleBtns.forEach((btn, idx) => {
      if (examples[idx]) {
        btn.textContent = examples[idx];
        (btn as HTMLElement).dataset.query = examples[idx];
      }
    });
  }

  private async checkPremiumStatus(): Promise<void> {
    try {
      const response = await fetch(`${PHP_BASE_URL}/ai-search.php?action=check`);
      const data = await response.json();
      this.isPremium = data.enabled === true;
    } catch (e) {
      console.warn('[RealtySoft] Could not check AI search status:', e);
      this.isPremium = false;
    }
  }

  render(): void {
    // Create and insert toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.type = 'button';
    this.toggleBtn.className = 'rs-ai-toggle';
    this.toggleBtn.title = 'Search with AI';
    // SVG icon for the sparkle
    const sparkleIcon = `
      <svg class="rs-ai-toggle__icon" viewBox="0 0 512 512" fill="currentColor">
        <path d="M207 116c3.125.375 3.125.375 6 1 .407 1.143.815 2.285 1.234 3.462 1.55 4.34 3.114 8.676 4.68 13.011.67 1.857 1.336 3.716 1.998 5.576 7.89 22.138 16.874 41.837 32.088 59.95.625.76 1.25 1.521 1.894 2.305 5.112 6.017 10.859 10.89 17.106 15.696.877.68 1.753 1.361 2.656 2.062 19.72 14.848 42.634 22.021 65.687 30.158.99.351 1.982.703 3.004 1.065 1.315.462 1.315.462 2.66.934 2 1 2 1 3 2 .041 2 .043 4 0 6-7.937 3.3-15.937 6.355-24.029 9.252-22.028 7.896-42.65 16.484-59.908 32.806-2.062 1.941-2.062 1.941-5.125 4.316-22.932 20.492-33.373 50.783-42.758 79.078-.26.757-.519 1.513-.786 2.292-.648 1.897-1.265 3.803-1.879 5.711-1.512 2.543-1.512 2.543-4.68 3.43-.934.037-1.869.074-2.832.113-2.888-4.34-4.5-8.83-6.187-13.719-.617-1.745-1.233-3.49-1.851-5.235-.48-1.36-.48-1.36-.968-2.748-7.493-21.132-15.167-41.117-30-58.297-.785-.911-1.57-1.823-2.379-2.762-2.167-2.454-4.38-4.853-6.621-7.239-.525-.589-1.05-1.178-1.59-1.785-17.1-18.406-41.271-27.711-64.286-35.875-.68-.248-1.361-.496-2.062-.752-3.408-1.241-6.819-2.474-10.235-3.695-1.258-.453-2.515-.907-3.773-1.36-1.679-.6-1.679-.6-3.391-1.21C71 288 71 288 69 286c-.187-2.375-.187-2.375 1-5 6.85-4.182 15.263-6.3 22.812-8.972 39.813-14.151 73.785-35.85 93.106-75.027 5.396-11.743 9.498-24.088 13.776-36.27.505-1.434.505-1.434 1.019-2.894.639-1.82 1.273-3.641 1.9-5.465.285-.814.57-1.628.863-2.467.378-1.094.378-1.094.763-2.199C205 148 205 148 207 116z"/>
        <path d="M369 32c1.65 0 3.3 0 5 0 .241.67.482 1.339.731 2.029 1.122 3.098 2.258 6.191 3.394 9.283.379 1.053.758 2.105 1.148 3.19 7.313 19.806 18.447 34.976 37.907 44.188 6.3 2.888 12.812 5.172 19.44 7.184C439.711 98.543 439.711 98.543 443 100c.976 2.176.976 2.176 1 4-5.122 2.371-10.282 4.499-15.565 6.48-12.4 4.679-21.887 10.166-31.435 21.52-.628.591-1.256 1.183-1.902 1.793-9.124 9.372-13.724 22.963-17.66 35.176-.262.772-.524 1.545-.79 2.341-.221.689-.442 1.378-.67 2.088-1 1.604-1 1.604-3.103 2.334-.939.133-.939.133-1.897.27-.71-1.687-1.418-3.375-2.125-5.063-.459-1.094-.918-2.188-1.39-3.316-1.254-3.059-2.448-6.133-3.627-9.223-8.078-20.927-20.123-34.186-40.527-43.463-4.998-2.135-10.129-3.947-15.292-5.65-.772-.267-1.545-.535-2.34-.81-.689-.223-1.378-.445-2.09-.687-1.603-1-1.603-1-2.603-4 2.948-2.423 5.656-3.77 9.254-5.016 1.03-.36 2.06-.722 3.124-1.093 1.067-.378 2.135-.755 3.234-1.143 8.531-3.114 16.281-6.047 23.438-12.75.778-.602 1.556-1.204 2.359-1.824C357.736 68.457 363.91 50.308 370 32z"/>
        <path d="M370 338c1.928.127 1.928.127 4 1 1.185 2.142 1.185 2.142 2.148 4.961.366 1.03.732 2.06 1.11 3.121.369 1.087.737 2.174 1.117 3.293 7.014 20.365 17.553 35.917 37 46.125 6.636 3.234 13.472 5.739 20.492 8.016.782.267 1.565.534 2.371.81.702.228 1.404.455 2.127.69C442 407 442 407 442.735 409.105c.088.625.175 1.251.265 1.895-6.147 2.603-12.3 5.125-18.562 7.438-19.377 7.46-33.31 19.545-41.97 38.61-3.25 7.489-5.882 15.213-8.468 22.952-1.65 0-3.3 0-5 0-.211-.604-.422-1.207-.64-1.829-9.045-25.749-18.186-45.286-43.82-57.671-5.315-2.264-10.747-4.206-16.21-6.06-1.184-.413-1.184-.413-2.392-.822-.71-.239-1.419-.478-2.149-.725-1.781-.888-1.781-.888-3.781-3.888 1.416-2.832 3.005-2.91 5.961-3.953 1.03-.373 2.06-.745 3.121-1.129 1.067-.372 2.134-.743 3.232-1.125 20.766-7.52 35.026-19.135 44.488-39.16 2.912-6.448 5.27-13.107 7.613-19.777C366 339 366 339 370 338z"/>
      </svg>
    `;

    this.toggleBtn.innerHTML = sparkleIcon;

    // Insert toggle button into search container
    if (this.searchContainer) {
      this.searchContainer.style.position = 'relative';
      this.searchContainer.appendChild(this.toggleBtn);
    }

    // Get translated labels
    const title = this.label('ai_search_title');
    const back = this.label('ai_search_back');
    const placeholder = this.label('ai_search_placeholder');
    const tryLabel = this.label('ai_search_try');
    const searchBtn = this.label('ai_search_button');
    const example1 = this.label('ai_search_example_1');
    const example2 = this.label('ai_search_example_2');
    const example3 = this.label('ai_search_example_3');

    // Create AI mode overlay
    this.aiModeEl = document.createElement('div');
    this.aiModeEl.className = 'rs-ai-mode';
    this.aiModeEl.style.display = 'none';
    this.aiModeEl.innerHTML = `
      <div class="rs-ai-mode__header">
        <span class="rs-ai-mode__title">
          <svg class="rs-ai-mode__title-icon" viewBox="0 0 512 512" fill="currentColor" width="24" height="24">
            <path d="M207 116c3.125.375 3.125.375 6 1 .407 1.143.815 2.285 1.234 3.462 1.55 4.34 3.114 8.676 4.68 13.011.67 1.857 1.336 3.716 1.998 5.576 7.89 22.138 16.874 41.837 32.088 59.95.625.76 1.25 1.521 1.894 2.305 5.112 6.017 10.859 10.89 17.106 15.696.877.68 1.753 1.361 2.656 2.062 19.72 14.848 42.634 22.021 65.687 30.158.99.351 1.982.703 3.004 1.065 1.315.462 1.315.462 2.66.934 2 1 2 1 3 2 .041 2 .043 4 0 6-7.937 3.3-15.937 6.355-24.029 9.252-22.028 7.896-42.65 16.484-59.908 32.806-2.062 1.941-2.062 1.941-5.125 4.316-22.932 20.492-33.373 50.783-42.758 79.078-.26.757-.519 1.513-.786 2.292-.648 1.897-1.265 3.803-1.879 5.711-1.512 2.543-1.512 2.543-4.68 3.43-.934.037-1.869.074-2.832.113-2.888-4.34-4.5-8.83-6.187-13.719-.617-1.745-1.233-3.49-1.851-5.235-.48-1.36-.48-1.36-.968-2.748-7.493-21.132-15.167-41.117-30-58.297-.785-.911-1.57-1.823-2.379-2.762-2.167-2.454-4.38-4.853-6.621-7.239-.525-.589-1.05-1.178-1.59-1.785-17.1-18.406-41.271-27.711-64.286-35.875-.68-.248-1.361-.496-2.062-.752-3.408-1.241-6.819-2.474-10.235-3.695-1.258-.453-2.515-.907-3.773-1.36-1.679-.6-1.679-.6-3.391-1.21C71 288 71 288 69 286c-.187-2.375-.187-2.375 1-5 6.85-4.182 15.263-6.3 22.812-8.972 39.813-14.151 73.785-35.85 93.106-75.027 5.396-11.743 9.498-24.088 13.776-36.27.505-1.434.505-1.434 1.019-2.894.639-1.82 1.273-3.641 1.9-5.465.285-.814.57-1.628.863-2.467.378-1.094.378-1.094.763-2.199C205 148 205 148 207 116z"/>
            <path d="M369 32c1.65 0 3.3 0 5 0 .241.67.482 1.339.731 2.029 1.122 3.098 2.258 6.191 3.394 9.283.379 1.053.758 2.105 1.148 3.19 7.313 19.806 18.447 34.976 37.907 44.188 6.3 2.888 12.812 5.172 19.44 7.184C439.711 98.543 439.711 98.543 443 100c.976 2.176.976 2.176 1 4-5.122 2.371-10.282 4.499-15.565 6.48-12.4 4.679-21.887 10.166-31.435 21.52-.628.591-1.256 1.183-1.902 1.793-9.124 9.372-13.724 22.963-17.66 35.176-.262.772-.524 1.545-.79 2.341-.221.689-.442 1.378-.67 2.088-1 1.604-1 1.604-3.103 2.334-.939.133-.939.133-1.897.27-.71-1.687-1.418-3.375-2.125-5.063-.459-1.094-.918-2.188-1.39-3.316-1.254-3.059-2.448-6.133-3.627-9.223-8.078-20.927-20.123-34.186-40.527-43.463-4.998-2.135-10.129-3.947-15.292-5.65-.772-.267-1.545-.535-2.34-.81-.689-.223-1.378-.445-2.09-.687-1.603-1-1.603-1-2.603-4 2.948-2.423 5.656-3.77 9.254-5.016 1.03-.36 2.06-.722 3.124-1.093 1.067-.378 2.135-.755 3.234-1.143 8.531-3.114 16.281-6.047 23.438-12.75.778-.602 1.556-1.204 2.359-1.824C357.736 68.457 363.91 50.308 370 32z"/>
            <path d="M370 338c1.928.127 1.928.127 4 1 1.185 2.142 1.185 2.142 2.148 4.961.366 1.03.732 2.06 1.11 3.121.369 1.087.737 2.174 1.117 3.293 7.014 20.365 17.553 35.917 37 46.125 6.636 3.234 13.472 5.739 20.492 8.016.782.267 1.565.534 2.371.81.702.228 1.404.455 2.127.69C442 407 442 407 442.735 409.105c.088.625.175 1.251.265 1.895-6.147 2.603-12.3 5.125-18.562 7.438-19.377 7.46-33.31 19.545-41.97 38.61-3.25 7.489-5.882 15.213-8.468 22.952-1.65 0-3.3 0-5 0-.211-.604-.422-1.207-.64-1.829-9.045-25.749-18.186-45.286-43.82-57.671-5.315-2.264-10.747-4.206-16.21-6.06-1.184-.413-1.184-.413-2.392-.822-.71-.239-1.419-.478-2.149-.725-1.781-.888-1.781-.888-3.781-3.888 1.416-2.832 3.005-2.91 5.961-3.953 1.03-.373 2.06-.745 3.121-1.129 1.067-.372 2.134-.743 3.232-1.125 20.766-7.52 35.026-19.135 44.488-39.16 2.912-6.448 5.27-13.107 7.613-19.777C366 339 366 339 370 338z"/>
          </svg>
          ${title}
        </span>
        <button type="button" class="rs-ai-mode__close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          ${back}
        </button>
      </div>
      <div class="rs-ai-mode__input-wrapper">
        <textarea class="rs-ai-mode__input"
                  placeholder="${placeholder}"
                  rows="3"></textarea>
        <button type="button" class="rs-ai-mode__search">
          <span class="rs-ai-mode__search-text">${searchBtn}</span>
          <span class="rs-ai-mode__loader" style="display:none;">
            <svg class="rs-ai-mode__spinner" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </span>
        </button>
      </div>
      <div class="rs-ai-mode__examples">
        <span class="rs-ai-mode__examples-label">${tryLabel}</span>
        <button type="button" data-query="${example1}">${example1}</button>
        <button type="button" data-query="${example2}">${example2}</button>
        <button type="button" data-query="${example3}">${example3}</button>
      </div>
      <div class="rs-ai-mode__error" style="display: none;"></div>
    `;

    // Insert AI mode into search container
    if (this.searchContainer) {
      this.searchContainer.appendChild(this.aiModeEl);
    }

    // Cache DOM references
    this.textarea = this.aiModeEl.querySelector('.rs-ai-mode__input');
    this.searchBtn = this.aiModeEl.querySelector('.rs-ai-mode__search');
    this.errorEl = this.aiModeEl.querySelector('.rs-ai-mode__error');
    this.closeBtn = this.aiModeEl.querySelector('.rs-ai-mode__close');
  }

  bindEvents(): void {
    // Toggle button click
    this.toggleBtn?.addEventListener('click', () => this.toggleMode());

    // Close button click
    this.closeBtn?.addEventListener('click', () => this.toggleMode());

    // Search button click
    this.searchBtn?.addEventListener('click', () => this.search());

    // Enter key in textarea (Shift+Enter for new line)
    this.textarea?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.search();
      }
    });

    // Example buttons
    const exampleBtns = this.aiModeEl?.querySelectorAll('.rs-ai-mode__examples button');
    exampleBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = (btn as HTMLElement).dataset.query;
        if (query && this.textarea) {
          this.textarea.value = query;
          this.textarea.focus();
        }
      });
    });
  }

  private toggleMode(): void {
    this.isAIMode = !this.isAIMode;

    if (this.isAIMode) {
      // Hide all search form elements
      this.searchFormElements.forEach(el => {
        el.style.display = 'none';
      });
      // Show AI mode
      if (this.aiModeEl) {
        this.aiModeEl.style.display = 'block';
      }
      this.toggleBtn?.classList.add('rs-ai-toggle--active');
      this.textarea?.focus();
      this.hideError();
    } else {
      // Show all search form elements
      this.searchFormElements.forEach(el => {
        el.style.display = '';
      });
      // Hide AI mode
      if (this.aiModeEl) {
        this.aiModeEl.style.display = 'none';
      }
      this.toggleBtn?.classList.remove('rs-ai-toggle--active');
    }
  }

  private async search(): Promise<void> {
    const query = this.textarea?.value.trim();
    if (!query) {
      this.showError(this.label('ai_search_empty'));
      return;
    }

    this.setLoading(true);
    this.hideError();

    try {
      // Gather context data from state
      const language = RealtySoftState.get<string>('config.language') || 'en_US';
      const locations = RealtySoftState.get<Location[]>('data.locations') || [];
      const propertyTypes = RealtySoftState.get<PropertyType[]>('data.propertyTypes') || [];

      // Load features on demand if not already loaded
      let featuresRaw = RealtySoftState.get<Array<{id: number; name: string; value_ids?: Array<{id: number; name: string}>}>>('data.features') || [];
      if (!featuresRaw || featuresRaw.length === 0) {
        try {
          const featuresResult = await RealtySoftAPI.getFeatures();
          if (featuresResult.data) {
            RealtySoftState.set('data.features', featuresResult.data);
            featuresRaw = featuresResult.data as Array<{id: number; name: string; value_ids?: Array<{id: number; name: string}>}>;
          }
        } catch (e) {
          console.warn('[RealtySoft] Could not load features for AI search:', e);
        }
      }

      // Features are stored as categories with value_ids, flatten them
      const features: Array<{id: number; name: string; category?: string}> = [];
      featuresRaw.forEach(category => {
        if (category.value_ids && Array.isArray(category.value_ids)) {
          category.value_ids.forEach(feat => {
            features.push({
              id: feat.id,
              name: feat.name,
              category: category.name
            });
          });
        }
      });

      const response = await fetch(`${PHP_BASE_URL}/ai-search.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language,
          locations,
          propertyTypes,
          features
        })
      });

      const result: AISearchResponse = await response.json();

      if (result.success && result.filters) {
        // Build URL params from filters
        const params = this.buildURLParams(result.filters);

        // Get results page URL from config
        const resultsPage = RealtySoftState.get<string>('config.resultsPage') || '/properties/';

        // Redirect to results page with filters
        const queryString = params.toString();
        window.location.href = queryString ? `${resultsPage}?${queryString}` : resultsPage;
      } else {
        this.showError(result.error || this.label('ai_search_error'));
      }
    } catch (e) {
      console.error('[RealtySoft] AI search error:', e);
      this.showError(this.label('ai_search_error'));
    } finally {
      this.setLoading(false);
    }
  }

  private buildURLParams(filters: AISearchFilters): URLSearchParams {
    const params = new URLSearchParams();

    // Map AI response to URL params (matching parseURLFilters in controller.ts)
    if (filters.location != null) params.set('location', String(filters.location));
    if (filters.sublocation != null) params.set('sublocation', String(filters.sublocation));
    if (filters.propertyType != null) params.set('type', String(filters.propertyType));
    if (filters.listingType) params.set('listing', filters.listingType);
    if (filters.bedsMin != null) params.set('beds', String(filters.bedsMin));
    if (filters.bathsMin != null) params.set('baths', String(filters.bathsMin));
    if (filters.priceMin != null) params.set('price_min', String(filters.priceMin));
    if (filters.priceMax != null) params.set('price_max', String(filters.priceMax));
    if (filters.builtMin != null) params.set('built_min', String(filters.builtMin));
    if (filters.builtMax != null) params.set('built_max', String(filters.builtMax));
    if (filters.plotMin != null) params.set('plot_min', String(filters.plotMin));
    if (filters.plotMax != null) params.set('plot_max', String(filters.plotMax));
    if (filters.ref) params.set('ref', filters.ref);
    if (filters.features?.length) params.set('features', filters.features.join(','));

    return params;
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;

    if (this.searchBtn) {
      this.searchBtn.disabled = loading;
      const textEl = this.searchBtn.querySelector('.rs-ai-mode__search-text');
      const loaderEl = this.searchBtn.querySelector('.rs-ai-mode__loader');

      if (textEl) (textEl as HTMLElement).style.display = loading ? 'none' : 'inline';
      if (loaderEl) (loaderEl as HTMLElement).style.display = loading ? 'inline-flex' : 'none';
    }

    if (this.textarea) {
      this.textarea.disabled = loading;
    }
  }

  private showError(message: string): void {
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.style.display = 'block';
    }
  }

  private hideError(): void {
    if (this.errorEl) {
      this.errorEl.style.display = 'none';
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_ai_search_toggle', RSAISearchToggle as unknown as ComponentConstructor);

/**
 * Auto-initialize AI Search on all search templates
 * This runs automatically when the module loads - no placeholder needed
 */
async function autoInitAISearch(): Promise<void> {
  // Check if feature is enabled first (avoid unnecessary DOM queries)
  try {
    const response = await fetch(`${PHP_BASE_URL}/ai-search.php?action=check`);
    const data = await response.json();
    if (!data.enabled) {
      return; // Feature not enabled, skip initialization
    }
  } catch (e) {
    return; // Can't check, skip initialization
  }

  // Find all search containers that don't already have AI toggle
  const searchContainers = document.querySelectorAll(
    '#rs_search, .rs-search, [class*="rs-template-search"]'
  );

  searchContainers.forEach((container) => {
    // Skip if already has AI toggle
    if (container.querySelector('.rs-ai-toggle')) {
      return;
    }

    // Create a hidden placeholder element and initialize the component
    const placeholder = document.createElement('div');
    placeholder.className = 'rs_ai_search_toggle';
    placeholder.style.display = 'none';
    container.appendChild(placeholder);

    // Initialize the component on this placeholder
    new RSAISearchToggle(placeholder, {});
  });
}

/**
 * Check if labels are loaded by testing a known label key
 */
function areLabelsReady(): boolean {
  const win = window as unknown as {
    RealtySoftLabels?: { get: (key: string) => string };
    RealtySoftState?: { get: (key: string) => unknown };
  };

  // Check if labels module exists and has labels loaded
  if (!win.RealtySoftLabels?.get) return false;

  // Check if language is set in state
  const language = win.RealtySoftState?.get('config.language');
  if (!language) return false;

  // Check if a known label returns something other than the key itself
  const testLabel = win.RealtySoftLabels.get('search_button');
  return testLabel !== 'search_button';
}

/**
 * Wait for RealtySoft to be ready, then initialize AI search
 */
function initWhenReady(): void {
  // Check if RealtySoft is available and has the onReady method
  const win = window as unknown as { RealtySoft?: { onReady?: (cb: () => void) => void } };

  if (win.RealtySoft?.onReady) {
    // Use RealtySoft's onReady callback
    win.RealtySoft.onReady(() => {
      // Wait for labels to be loaded
      const waitForLabels = (): void => {
        if (areLabelsReady()) {
          setTimeout(autoInitAISearch, 100);
        } else {
          setTimeout(waitForLabels, 200);
        }
      };
      waitForLabels();
    });
  } else {
    // Fallback: retry with increasing delays until search containers AND labels are found
    let attempts = 0;
    const maxAttempts = 15;
    const baseDelay = 300;

    const tryInit = (): void => {
      attempts++;
      const searchContainers = document.querySelectorAll(
        '#rs_search, .rs-search, [class*="rs-template-search"]'
      );

      // Only initialize when both containers exist AND labels are ready
      if (searchContainers.length > 0 && areLabelsReady()) {
        // Found containers and labels are ready, initialize
        autoInitAISearch();
      } else if (attempts < maxAttempts) {
        // Retry with delay
        setTimeout(tryInit, baseDelay);
      }
    };

    // Start first attempt after initial delay
    setTimeout(tryInit, baseDelay);
  }
}

// Run auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhenReady);
} else {
  // DOM already ready
  initWhenReady();
}

export { RSAISearchToggle };
export default RSAISearchToggle;
