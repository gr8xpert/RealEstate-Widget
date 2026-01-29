/**
 * RealtySoft Widget v3 - Wishlist Empty Component
 * Shows empty state when wishlist is empty
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

class RSWishlistEmpty extends RSBaseComponent {
  private isSharedView: boolean = false;
  private titleEl: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.isSharedView = WishlistManager.isSharedView();
    this.render();
    this.bindEvents();
    this.updateVisibility();

    // Subscribe to language changes to update labels
    this.subscribe<string>('config.language', () => {
      this.render();
      this.updateVisibility();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-empty');

    const emptyTitle = this.isSharedView
      ? this.label('wishlist_shared_empty') || 'No properties in shared wishlist'
      : this.label('wishlist_empty') || 'Your wishlist is empty';

    const emptyDesc = this.isSharedView
      ? this.label('wishlist_shared_empty_desc') || 'The shared link may be invalid or expired'
      : this.label('wishlist_empty_desc') || 'Start adding properties by clicking the heart icon';

    this.element.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <h2 class="rs-wishlist-empty__title">${emptyTitle}</h2>
      <p class="rs-wishlist-empty__desc">${emptyDesc}</p>
      ${!this.isSharedView ? `
        <a href="/" class="rs-wishlist-btn rs-wishlist-btn--primary rs-wishlist-empty__browse">
          ${this.label('wishlist_browse') || 'Browse Properties'}
        </a>
      ` : ''}
    `;

    this.titleEl = this.element.querySelector('.rs-wishlist-empty__title');
  }

  bindEvents(): void {
    // Listen for wishlist changes
    window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
      this.updateVisibility();
    });
  }

  private updateVisibility(): void {
    let isEmpty: boolean;

    if (this.isSharedView) {
      const sharedRefs = WishlistManager.loadSharedWishlist();
      isEmpty = !sharedRefs || sharedRefs.length === 0;
    } else {
      isEmpty = WishlistManager.count() === 0;
    }

    this.element.style.display = isEmpty ? 'flex' : 'none';
  }

  setMessage(message: string): void {
    if (this.titleEl && message) {
      this.titleEl.textContent = message;
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_empty', RSWishlistEmpty as unknown as ComponentConstructor);

export { RSWishlistEmpty };
export default RSWishlistEmpty;
