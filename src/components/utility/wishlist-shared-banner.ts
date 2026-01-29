/**
 * RealtySoft Widget v3 - Wishlist Shared Banner Component
 * Shows banner when viewing shared wishlist
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

class RSWishlistSharedBanner extends RSBaseComponent {
  private isSharedView: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.isSharedView = WishlistManager.isSharedView();
    this.render();

    // Subscribe to language changes to update labels
    this.subscribe<string>('config.language', () => {
      this.render();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-shared-banner');

    // Hide if not shared view
    if (!this.isSharedView) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `
      <span class="rs-wishlist-shared-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </span>
      <div class="rs-wishlist-shared-banner__content">
        <strong>${this.label('wishlist_shared_title') || 'Viewing Shared Wishlist'}</strong>
        <p>${this.label('wishlist_shared_desc') || 'This is a read-only view of saved properties'}</p>
      </div>
    `;
  }

  bindEvents(): void {
    // No events needed for this static component
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_shared_banner', RSWishlistSharedBanner as unknown as ComponentConstructor);

export { RSWishlistSharedBanner };
export default RSWishlistSharedBanner;
