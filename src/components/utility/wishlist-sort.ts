/**
 * RealtySoft Widget v3 - Wishlist Sort Component
 * Sort dropdown for wishlist
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule
} from '../../types/index';
import { WishlistManager } from '../../core/wishlist-manager';

// Declare globals
declare const RealtySoft: RealtySoftModule;

class RSWishlistSort extends RSBaseComponent {
  private currentSort: string = 'addedAt-desc';
  private selectEl: HTMLSelectElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.currentSort = 'addedAt-desc';
    this.render();
    this.bindEvents();
    this.updateVisibility();

    // Subscribe to language changes to update labels
    this.subscribe<string>('config.language', () => {
      const currentValue = this.currentSort;
      this.render();
      this.bindEvents();
      this.setValue(currentValue);
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-sort-wrapper');

    this.element.innerHTML = `
      <label class="rs-wishlist-sort-label" for="rs-wishlist-sort">
        ${this.label('sort_by') || 'Sort by:'}
      </label>
      <select class="rs-wishlist-sort" id="rs-wishlist-sort">
        <option value="addedAt-desc">${this.label('sort_recent') || 'Recently Added'}</option>
        <option value="addedAt-asc">${this.label('sort_oldest') || 'Oldest First'}</option>
        <option value="price-desc">${this.label('sort_price_desc') || 'Price: High to Low'}</option>
        <option value="price-asc">${this.label('sort_price_asc') || 'Price: Low to High'}</option>
        <option value="title-asc">${this.label('sort_name') || 'Name: A-Z'}</option>
        <option value="location-asc">${this.label('sort_location') || 'Location: A-Z'}</option>
      </select>
    `;

    this.selectEl = this.element.querySelector('.rs-wishlist-sort');
  }

  bindEvents(): void {
    this.selectEl?.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      this.currentSort = target.value;
      const [field, order] = this.currentSort.split('-');

      // Map sort fields
      const sortMap: Record<string, string> = { price: 'list_price', title: 'name' };
      const actualField = sortMap[field] || field;

      // Update WishlistManager and dispatch event
      WishlistManager.setSort(actualField, order as 'asc' | 'desc');
    });

    // Listen for wishlist changes to update visibility
    window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
      this.updateVisibility();
    });
  }

  private updateVisibility(): void {
    const count = WishlistManager.count();
    this.element.style.display = count > 0 ? '' : 'none';
  }

  getValue(): string {
    return this.currentSort;
  }

  setValue(value: string): void {
    this.currentSort = value;
    if (this.selectEl) {
      this.selectEl.value = value;
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_sort', RSWishlistSort as unknown as ComponentConstructor);

export { RSWishlistSort };
export default RSWishlistSort;
