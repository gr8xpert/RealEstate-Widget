/**
 * RealtySoft Widget v3 - Wishlist Compare Button Component
 * Floating compare button with selection count
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule
} from '../../types/index';
import { WishlistManager } from '../../core/wishlist-manager';
import type { RealtySoftToastModule } from '../../core/toast';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftToast: RealtySoftToastModule | undefined;

class RSWishlistCompareBtn extends RSBaseComponent {
  private isSharedView: boolean = false;
  private countEl: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.isSharedView = WishlistManager.isSharedView();
    this.render();
    this.bindEvents();
    this.updateDisplay();

    // Subscribe to language changes to update labels
    this.subscribe<string>('config.language', () => {
      this.render();
      this.bindEvents();
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-compare-float');

    // Hide in shared view
    if (this.isSharedView) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <span class="rs-wishlist-compare-float__label">${this.label('wishlist_compare') || 'Compare'}</span>
      <span class="rs-wishlist-compare-count">0</span>
    `;

    this.countEl = this.element.querySelector('.rs-wishlist-compare-count');
  }

  bindEvents(): void {
    if (this.isSharedView) return;

    // Click to open compare modal
    this.element.addEventListener('click', () => {
      this.openCompareModal();
    });

    // Listen for compare selection changes
    window.addEventListener(WishlistManager.EVENTS.COMPARE_CHANGED, () => {
      this.updateDisplay();
    });
  }

  private openCompareModal(): void {
    const count = WishlistManager.getCompareCount();

    if (count < 2) {
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.warning(this.label('compare_min') || 'Select at least 2 properties to compare');
      }
      return;
    }

    WishlistManager.openModal('compare');
  }

  private updateDisplay(): void {
    if (this.isSharedView) return;

    const count = WishlistManager.getCompareCount();
    if (this.countEl) this.countEl.textContent = String(count);

    if (count > 0) {
      this.element.style.display = 'flex';
      setTimeout(() => this.element.classList.add('visible'), 10);
    } else {
      this.element.classList.remove('visible');
      setTimeout(() => {
        if (WishlistManager.getCompareCount() === 0) {
          this.element.style.display = 'none';
        }
      }, 300);
    }
  }

  getCount(): number {
    return WishlistManager.getCompareCount();
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_compare_btn', RSWishlistCompareBtn as unknown as ComponentConstructor);

export { RSWishlistCompareBtn };
export default RSWishlistCompareBtn;
