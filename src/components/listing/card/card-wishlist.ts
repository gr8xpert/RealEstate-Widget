/**
 * RealtySoft Widget v3 - Card Wishlist Sub-Component
 * Heart toggle button. Uses WishlistManager + analytics tracking.
 */

import { RSBaseComponent } from '../../base';
import { getCardProperty, SVG_ICONS, onElementVisible } from './card-utils';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAnalyticsModule,
  Property,
} from '../../../types/index';

declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;

declare const WishlistManager: {
  has: (refNo: string | number) => boolean;
  add: (property: Record<string, unknown>) => boolean;
  remove: (refNo: string | number) => void;
} | undefined;

declare const RealtySoftToast: {
  success: (message: string) => void;
  error: (message: string) => void;
} | undefined;

class RSCardWishlist extends RSBaseComponent {
  private property: Property | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    if (this.element.closest('.rs_property_grid')) return;
    onElementVisible(this.element, () => this.loadAndRender());
  }

  private async loadAndRender(): Promise<void> {
    this.property = await getCardProperty(this.element);
    if (!this.property) return;
    this.render();
    this.bindEvents();
  }

  render(): void {
    if (!this.property) return;

    const refNo = this.property.ref || this.property.id;
    const isInWishlist = (typeof WishlistManager !== 'undefined' && WishlistManager?.has(refNo))
      || RealtySoftState.isInWishlist(this.property.id);

    this.element.classList.add('rs-card__wishlist');
    this.element.classList.toggle('rs-card__wishlist--active', isInWishlist);
    if (this.element.tagName !== 'BUTTON') {
      this.element.setAttribute('role', 'button');
    }
    this.element.setAttribute('aria-label', this.label('wishlist_add'));
    this.element.innerHTML = isInWishlist ? SVG_ICONS.heartFilled : SVG_ICONS.heart;
  }

  bindEvents(): void {
    this.element.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleWishlist();
    });
  }

  private toggleWishlist(): void {
    if (!this.property) return;

    try {
      const refNo = this.property.ref || this.property.id;
      const wmAvailable = typeof WishlistManager !== 'undefined' && WishlistManager;

      if (wmAvailable && WishlistManager!.has(refNo)) {
        WishlistManager!.remove(refNo);
        this.element.classList.remove('rs-card__wishlist--active');
        this.element.innerHTML = SVG_ICONS.heart;

        try { RealtySoftAnalytics.trackWishlistRemove(this.property.id); } catch (_) { /* analytics non-critical */ }

        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.success(this.label('wishlist_removed') || 'Removed from wishlist');
        }
      } else {
        let addSuccess = false;
        if (wmAvailable) {
          addSuccess = WishlistManager!.add({
            id: this.property.id,
            ref_no: refNo,
            title: this.property.title,
            price: this.property.price,
            location: this.property.location,
            type: this.property.type,
            beds: this.property.beds,
            baths: this.property.baths,
            built: this.property.built_area,
            plot: this.property.plot_size,
            images: this.property.images || [],
            total_images: this.property.total_images || (this.property.images || []).length,
            listing_type: this.property.listing_type,
            is_featured: this.property.is_featured || false,
          });
        }

        if (addSuccess) {
          this.element.classList.add('rs-card__wishlist--active');
          this.element.innerHTML = SVG_ICONS.heartFilled;

          try { RealtySoftAnalytics.trackWishlistAdd(this.property.id); } catch (_) { /* analytics non-critical */ }

          if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
            RealtySoftToast.success(this.label('wishlist_add') || 'Added to wishlist');
          }
        } else {
          console.error('[CardWishlist] Failed to add to wishlist. WishlistManager available:', !!wmAvailable);
          if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
            RealtySoftToast.error(this.label('wishlist_error') || 'Could not add to wishlist.');
          }
          return;
        }
      }
      // Note: WishlistManager.add/remove already syncs with RealtySoftState via notifyChange()
    } catch (err) {
      console.error('[CardWishlist] Wishlist toggle error:', err);
    }
  }
}

RealtySoft.registerComponent('rs_card_wishlist', RSCardWishlist as unknown as ComponentConstructor);

export { RSCardWishlist };
export default RSCardWishlist;
