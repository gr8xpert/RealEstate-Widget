/**
 * RealtySoft Widget v3 - Sort Filter Component
 * Sort dropdown for use in search forms (sets initial sort order)
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

declare const RealtySoft: RealtySoftModule;

interface SortOption {
  value: string;
  label: string;
}

class RSSortFilter extends RSBaseComponent {
  private currentSort: string = 'create_date_desc';
  private sortOptions: SortOption[] = [];
  private select: HTMLSelectElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.currentSort = (window as unknown as { RealtySoftState: { get: (key: string) => string | null } }).RealtySoftState.get('ui.sort') || 'create_date_desc';
    this.buildSortOptions();

    this.render();
    this.bindEvents();

    this.subscribe<string>('ui.sort', (sort) => {
      this.currentSort = sort;
      this.updateDisplay();
    });

    // Subscribe to language changes to rebuild options with new translations
    this.subscribe<string>('config.language', () => {
      this.buildSortOptions();
      this.render();
      this.bindEvents();
    });
  }

  private buildSortOptions(): void {
    this.sortOptions = [
      { value: 'create_date_desc', label: this.label('sort_newest') || 'Newest Listings' },
      { value: 'create_date', label: this.label('sort_oldest') || 'Oldest Listings' },
      { value: 'last_date_desc', label: this.label('sort_updated') || 'Recently Updated' },
      { value: 'last_date', label: this.label('sort_oldest_updated') || 'Oldest Updated' },
      { value: 'list_price', label: this.label('sort_price_asc') || 'Price: Low to High' },
      { value: 'list_price_desc', label: this.label('sort_price_desc') || 'Price: High to Low' },
      { value: 'is_featured_desc', label: this.label('sort_featured') || 'Featured First' },
      { value: 'location_id', label: this.label('sort_location') || 'By Location' }
    ];
  }

  render(): void {
    this.element.classList.add('rs-filter', 'rs-filter--sort');

    // Check if element has data-variation for styling
    const variation = this.element.dataset.variation || this.variation || 'default';

    if (variation === 'minimal') {
      // Minimal: just the select
      this.element.innerHTML = `
        <select class="rs-filter__select rs-sort-filter__select">
          ${this.sortOptions.map(opt => `
            <option value="${opt.value}" ${this.currentSort === opt.value ? 'selected' : ''}>
              ${opt.label}
            </option>
          `).join('')}
        </select>
      `;
    } else {
      // Default: with label
      this.element.innerHTML = `
        <label class="rs-filter__label">${this.label('filter_sort') || this.label('results_sort') || 'Sort By'}</label>
        <div class="rs-filter__select-wrapper rs-sort-filter__select-wrapper">
          <select class="rs-filter__select rs-sort-filter__select">
            ${this.sortOptions.map(opt => `
              <option value="${opt.value}" ${this.currentSort === opt.value ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
          <span class="rs-filter__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      `;
    }

    this.select = this.element.querySelector('.rs-sort-filter__select');
  }

  bindEvents(): void {
    if (this.select) {
      this.select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        RealtySoft.setSort(target.value);
      });
    }
  }

  private updateDisplay(): void {
    if (this.select) {
      this.select.value = this.currentSort;
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_sort_filter', RSSortFilter as unknown as ComponentConstructor);

export { RSSortFilter };
export default RSSortFilter;
