/**
 * RealtySoft Widget v3 - Wishlist Actions Component
 * Back, Clear, PDF, Share, Email buttons
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

class RSWishlistActions extends RSBaseComponent {
  private isSharedView: boolean = false;

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
      this.bindEvents();
      this.updateVisibility();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-actions');

    // Hide in shared view mode
    if (this.isSharedView) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `
      <div class="rs-wishlist-actions__left">
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-wishlist-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          ${this.label('detail_back') || 'Back'}
        </button>
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--danger rs-wishlist-clear">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          ${this.label('wishlist_clear') || 'Clear All'}
        </button>
      </div>
      <div class="rs-wishlist-actions__right">
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--warning rs-wishlist-pdf">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          ${this.label('wishlist_pdf') || 'Download PDF'}
        </button>
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--primary rs-wishlist-share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          ${this.label('wishlist_share') || 'Share'}
        </button>
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--success rs-wishlist-email">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          ${this.label('wishlist_email') || 'Email'}
        </button>
      </div>
    `;
  }

  bindEvents(): void {
    if (this.isSharedView) return;

    // Back button
    this.element.querySelector('.rs-wishlist-back')?.addEventListener('click', () => {
      window.history.back();
    });

    // Clear All button
    this.element.querySelector('.rs-wishlist-clear')?.addEventListener('click', () => {
      this.clearWishlist();
    });

    // PDF button
    this.element.querySelector('.rs-wishlist-pdf')?.addEventListener('click', () => {
      WishlistManager.openModal('pdf');
    });

    // Share button
    this.element.querySelector('.rs-wishlist-share')?.addEventListener('click', () => {
      WishlistManager.openModal('share');
    });

    // Email button
    this.element.querySelector('.rs-wishlist-email')?.addEventListener('click', () => {
      WishlistManager.openModal('email');
    });

    // Listen for wishlist changes to update visibility
    window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
      this.updateVisibility();
    });
  }

  private clearWishlist(): void {
    if (confirm(this.label('wishlist_confirm_clear') || 'Are you sure you want to clear your entire wishlist?')) {
      WishlistManager.clear();
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.success(this.label('wishlist_cleared') || 'Wishlist cleared');
      }
    }
  }

  private updateVisibility(): void {
    if (this.isSharedView) {
      this.element.style.display = 'none';
      return;
    }

    const count = WishlistManager.count();
    this.element.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_actions', RSWishlistActions as unknown as ComponentConstructor);

export { RSWishlistActions };
export default RSWishlistActions;
