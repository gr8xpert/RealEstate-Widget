/**
 * RealtySoft Widget v3 - Wishlist Header Component
 * Shows title and property count
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

class RSWishlistHeader extends RSBaseComponent {
  private isSharedView: boolean = false;
  private subtitleEl: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.isSharedView = WishlistManager.isSharedView();
    this.render();
    this.bindEvents();

    // Subscribe to language changes to update labels
    this.subscribe<string>('config.language', () => {
      this.render();
      this.bindEvents();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-header');

    const title = this.isSharedView
      ? this.label('wishlist_shared_title') || 'Shared Wishlist'
      : this.label('wishlist_title') || 'My Wishlist';

    this.element.innerHTML = `
      <h1 class="rs-wishlist-header__title">${title}</h1>
      <p class="rs-wishlist-header__subtitle">${this.label('results_loading') || 'Loading...'}</p>
    `;

    this.subtitleEl = this.element.querySelector('.rs-wishlist-header__subtitle');
    this.updateCount();
  }

  bindEvents(): void {
    // Listen for wishlist changes
    window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
      this.updateCount();
    });
  }

  private updateCount(): void {
    let count: number;

    if (this.isSharedView) {
      const sharedRefs = WishlistManager.loadSharedWishlist();
      count = sharedRefs ? sharedRefs.length : 0;
    } else {
      count = WishlistManager.count();
    }

    if (!this.subtitleEl) return;

    if (count === 0) {
      this.subtitleEl.textContent = this.label('wishlist_no_properties') || 'No properties saved';
    } else {
      const propertyLabel = count === 1
        ? this.label('property') || 'property'
        : this.label('properties') || 'properties';
      const savedLabel = this.label('saved') || 'saved';
      this.subtitleEl.textContent = `${count} ${propertyLabel} ${savedLabel}`;
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_header', RSWishlistHeader as unknown as ComponentConstructor);

export { RSWishlistHeader };
export default RSWishlistHeader;
