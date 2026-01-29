/**
 * RealtySoft Widget v3 - Wishlist Counter Component
 * Shows count of items in wishlist
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;

class RSWishlistCounter extends RSBaseComponent {
  private count: number = 0;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.count = (RealtySoftState.get<unknown[]>('wishlist') || []).length;

    this.render();

    this.subscribe<unknown[]>('wishlist', (wishlist) => {
      this.count = wishlist.length;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-counter');
    this.updateDisplay();
  }

  private updateDisplay(): void {
    this.element.innerHTML = `
      <a href="${this.element.dataset.href || '/wishlist'}" class="rs-wishlist-counter__link">
        <svg class="rs-wishlist-counter__icon" width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        ${this.count > 0 ? `<span class="rs-wishlist-counter__badge">${this.count}</span>` : ''}
      </a>
    `;
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_counter', RSWishlistCounter as unknown as ComponentConstructor);

export { RSWishlistCounter };
export default RSWishlistCounter;
