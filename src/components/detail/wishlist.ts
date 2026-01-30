/**
 * RealtySoft Widget v3 - Detail Wishlist Component
 * Wishlist button for detail page
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  Property,
  RealtySoftStateModule,
  RealtySoftAnalyticsModule
} from '../../types/index';

// Declare globals
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;
declare const RealtySoftToast: { success: (msg: string) => void; error: (msg: string) => void } | undefined;
declare const WishlistManager: {
  has: (refNo: string | number) => boolean;
  add: (data: Record<string, unknown>) => void;
  remove: (refNo: string | number) => void;
} | undefined;

class RSDetailWishlist extends RSBaseComponent {
  private property: Property | null = null;
  private isInWishlist: boolean = false;
  private btn: HTMLButtonElement | null = null;
  private icon: SVGElement | null = null;
  private text: HTMLSpanElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    // Get property from options (set before super() calls init())
    this.property = this.options?.property as Property | null;

    if (!this.property || !this.property.id) {
      this.element.style.display = 'none';
      return;
    }

    // Check WishlistManager first, then fallback to RealtySoftState
    const refNo = this.property.ref || this.property.id;
    this.isInWishlist = (typeof WishlistManager !== 'undefined' && WishlistManager)
      ? WishlistManager.has(refNo)
      : RealtySoftState.isInWishlist(this.property.id);

    this.render();
    this.bindEvents();

    // Listen for wishlist changes from WishlistManager
    window.addEventListener('wishlistChanged', () => {
      const ref = this.property!.ref || this.property!.id;
      this.isInWishlist = (typeof WishlistManager !== 'undefined' && WishlistManager)
        ? WishlistManager.has(ref)
        : RealtySoftState.isInWishlist(this.property!.id);
      this.updateDisplay();
    });

    // Also listen to RealtySoftState for backwards compatibility
    this.subscribe('wishlist', () => {
      const ref = this.property!.ref || this.property!.id;
      this.isInWishlist = (typeof WishlistManager !== 'undefined' && WishlistManager)
        ? WishlistManager.has(ref)
        : RealtySoftState.isInWishlist(this.property!.id);
      this.updateDisplay();
    });

    // Listen for language changes to update button text
    this.subscribe('language', () => {
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-detail-wishlist');

    this.element.innerHTML = `
      <button type="button" class="rs-detail-wishlist__btn ${this.isInWishlist ? 'rs-detail-wishlist__btn--active' : ''}">
        <svg class="rs-detail-wishlist__icon" width="20" height="20" viewBox="0 0 24 24"
             fill="${this.isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="rs-detail-wishlist__text">
          ${this.isInWishlist ? this.label('wishlist_remove') : this.label('wishlist_add')}
        </span>
      </button>
    `;

    this.btn = this.element.querySelector('.rs-detail-wishlist__btn');
    this.icon = this.element.querySelector('.rs-detail-wishlist__icon');
    this.text = this.element.querySelector('.rs-detail-wishlist__text');
  }

  bindEvents(): void {
    if (this.btn) {
      this.btn.addEventListener('click', () => {
        this.toggleWishlist();
      });
    }
  }

  private toggleWishlist(): void {
    try {
      const p = this.property!;
      const refNo = p.ref || p.id;
      const wmAvailable = typeof WishlistManager !== 'undefined' && WishlistManager;

      if (this.isInWishlist) {
        // Remove from WishlistManager (stores full data)
        if (wmAvailable) {
          WishlistManager!.remove(refNo);
        }
        // Note: WishlistManager.remove already syncs with RealtySoftState via notifyChange()
        try { RealtySoftAnalytics.trackWishlistRemove(p.id); } catch (_) { /* analytics non-critical */ }

        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.success(this.label('wishlist_removed') || 'Removed from wishlist');
        }
      } else {
        // Add to WishlistManager with full property data
        if (wmAvailable) {
          WishlistManager!.add({
            id: p.id,
            ref_no: p.ref,
            ref: p.ref,
            name: p.title,
            title: p.title,
            list_price: p.price,
            price: p.price,
            location: p.location,
            type: p.type,
            bedrooms: p.beds,
            beds: p.beds,
            bathrooms: p.baths,
            baths: p.baths,
            built_area: p.built_area,
            plot_size: p.plot_size,
            images: p.images || [],
            listing_type: p.listing_type || p.status,
            is_featured: p.is_featured || false
          });
        }
        // Note: WishlistManager.add already syncs with RealtySoftState via notifyChange()
        try { RealtySoftAnalytics.trackWishlistAdd(p.id); } catch (_) { /* analytics non-critical */ }

        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.success(this.label('wishlist_add') || 'Added to wishlist!');
        }
      }
    } catch (err) {
      console.error('[DetailWishlist] Toggle error:', err);
    }
  }

  private updateDisplay(): void {
    if (this.btn) {
      this.btn.classList.toggle('rs-detail-wishlist__btn--active', this.isInWishlist);
    }
    if (this.icon) {
      this.icon.setAttribute('fill', this.isInWishlist ? 'currentColor' : 'none');
    }
    if (this.text) {
      this.text.textContent = this.isInWishlist ? this.label('wishlist_remove') : this.label('wishlist_add');
    }
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailWishlist };
export default RSDetailWishlist;
