/**
 * RealtySoft Widget v3 - Sort Component
 * Dropdown for sorting results
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

interface SortOption {
  value: string;
  label: string;
}

class RSSort extends RSBaseComponent {
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
    // Full sort options matching API - rebuilt on language change
    this.sortOptions = [
      { value: 'create_date_desc', label: this.label('sort_newest') || 'Newest Listings' },
      { value: 'create_date', label: this.label('sort_oldest') || 'Oldest Listings' },
      { value: 'last_date_desc', label: this.label('sort_updated') || 'Recently Updated' },
      { value: 'last_date', label: this.label('sort_oldest_updated') || 'Oldest Updated' },
      { value: 'list_price', label: this.label('sort_price_asc') || 'Price: Low to High' },
      { value: 'list_price_desc', label: this.label('sort_price_desc') || 'Price: High to Low' },
      { value: 'is_featured_desc', label: this.label('sort_featured') || 'Featured First' },
      { value: 'location_id', label: this.label('sort_location') || 'By Location' },
      { value: 'is_own_desc', label: this.label('sort_own') || 'Own Properties First' }
    ];
  }

  render(): void {
    this.element.classList.add('rs-sort');

    this.element.innerHTML = `
      <div class="rs-sort__wrapper">
        <label class="rs-sort__label">${this.label('results_sort')}</label>
        <div class="rs-sort__select-wrapper">
          <select class="rs-sort__select">
            ${this.sortOptions.map(opt => `
              <option value="${opt.value}" ${this.currentSort === opt.value ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
          <span class="rs-sort__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      </div>
    `;

    this.select = this.element.querySelector('.rs-sort__select');
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
RealtySoft.registerComponent('rs_sort', RSSort as unknown as ComponentConstructor);

export { RSSort };
export default RSSort;
