/**
 * RealtySoft Widget v3 - Wishlist Grid Component
 * Property cards display with carousel, compare, remove functionality
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  RealtySoftAnalyticsModule
} from '../../types/index';
import { WishlistManager } from '../../core/wishlist-manager';
import type { WishlistItem } from '../../core/wishlist-manager';
import type { RealtySoftToastModule } from '../../core/toast';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAPI: RealtySoftAPIModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;
declare const RealtySoftToast: RealtySoftToastModule | undefined;

// Property from shared wishlist API response
interface SharedProperty {
  id: number;
  ref_no?: string;
  name?: string;
  list_price?: number;
  location_id?: { name?: string };
  type_id?: { name?: string };
  bedrooms?: number;
  bathrooms?: number;
  build_size?: number;
  plot_size?: number;
  images?: Array<string | { image_256?: string; src?: string }>;
  listing_type?: string;
  is_featured?: boolean;
  is_own?: boolean;
}

// Extended property for grid display
interface GridProperty {
  id: number;
  ref_no: string;
  ref: string;
  name: string;
  title: string;
  list_price: number;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  baths: number;
  build_size: number;
  built_area: number;
  built?: number;
  plot_size: number;
  images: Array<string | { image_256?: string; src?: string }>;
  image?: string;
  listing_type: string;
  is_featured: boolean;
  is_own: boolean;
  addedAt?: number;
  note?: string;
  url?: string;
  status?: string;
  image_count?: number;
  list_price_2?: number;
}

class RSWishlistGrid extends RSBaseComponent {
  private properties: GridProperty[] = [];
  private isSharedView: boolean = false;
  private sharedRefNos: string[] = [];
  private isLoading: boolean = true;
  private compareEnabled: boolean = false;
  private template: string | null = null;
  private windowEventsBound: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.properties = [];
    this.isSharedView = WishlistManager.isSharedView();
    this.sharedRefNos = this.isSharedView ? (WishlistManager.loadSharedWishlist() || []) : [];
    this.isLoading = true;

    // Check if compare feature is enabled (compare button exists on page)
    this.compareEnabled = this.checkCompareEnabled();

    // Check for template attribute (e.g., data-template="08")
    this.template = this.element.dataset.template || null;

    this.render();
    this.bindEvents();
    this.loadProperties();

    // Subscribe to language changes to re-render with updated labels
    this.subscribe<string>('config.language', () => {
      // Re-render properties if we have them (preserves wishlist on language change)
      if (this.properties.length > 0 && !this.isLoading) {
        this.renderProperties();
      }
    });
  }

  private checkCompareEnabled(): boolean {
    const compareBtn = document.querySelector('.rs_wishlist_compare_btn, .rs-wishlist-compare-float');
    const isInsideCombined = this.element.closest('.rs_wishlist_list, .rs-wishlist-list');
    return !!(compareBtn || isInsideCombined);
  }

  render(): void {
    this.element.classList.add('rs-wishlist-list__grid');

    // Apply template class if specified
    if (this.template) {
      this.element.classList.add(`rs-wishlist-template-${this.template}`);
    }

    // Show loading initially
    this.element.innerHTML = `
      <div class="rs-wishlist-grid__loading">
        <div class="rs-wishlist-list__spinner"></div>
        <p>${this.label('results_loading') || 'Loading...'}</p>
      </div>
    `;
  }

  bindEvents(): void {
    // Only bind window events once to prevent duplicates on language change
    if (!this.windowEventsBound) {
      // Listen for wishlist changes
      if (!this.isSharedView) {
        window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
          this.loadProperties();
        });
      }

      // Listen for sort changes
      window.addEventListener(WishlistManager.EVENTS.SORTED, () => {
        this.sortAndRender();
      });

      // Listen for compare changes to update checkboxes
      window.addEventListener(WishlistManager.EVENTS.COMPARE_CHANGED, () => {
        this.updateCompareCheckboxes();
      });

      this.windowEventsBound = true;
    }

    // Delegate card events (re-bind after render since DOM is replaced)
    this.element.addEventListener('click', (e: MouseEvent) => this.handleCardClick(e));
  }

  private async loadProperties(): Promise<void> {
    this.isLoading = true;

    if (this.isSharedView) {
      await this.loadSharedProperties();
    } else {
      this.loadOwnWishlist();
    }
  }

  private loadOwnWishlist(): void {
    const sort = WishlistManager.getSort();
    const items = WishlistManager.getAsArray(sort.field, sort.order);
    this.properties = items as unknown as GridProperty[];

    if (this.properties.length === 0) {
      this.element.style.display = 'none';
    } else {
      this.element.style.display = 'grid';
      this.renderProperties();
    }

    this.isLoading = false;

    // Track view
    this.properties.forEach(p => {
      RealtySoftAnalytics.track('wishlist', 'viewed', { property_id: p.ref_no });
    });
  }

  private async loadSharedProperties(): Promise<void> {
    try {
      const properties: GridProperty[] = [];

      for (const refNo of this.sharedRefNos) {
        try {
          const result = await RealtySoftAPI.request('v1/property', { ref_no: refNo }) as {
            data?: SharedProperty[];
          };
          if (result && result.data && result.data.length > 0) {
            const prop = result.data[0];
            properties.push({
              id: prop.id,
              ref_no: prop.ref_no || refNo,
              ref: prop.ref_no || refNo,
              name: prop.name || 'Property',
              title: prop.name || 'Property',
              list_price: Number(prop.list_price) || 0,
              price: Number(prop.list_price) || 0,
              location: prop.location_id?.name || 'N/A',
              type: prop.type_id?.name || 'N/A',
              bedrooms: Number(prop.bedrooms) || 0,
              beds: Number(prop.bedrooms) || 0,
              bathrooms: Number(prop.bathrooms) || 0,
              baths: Number(prop.bathrooms) || 0,
              build_size: Number(prop.build_size) || 0,
              built_area: Number(prop.build_size) || 0,
              plot_size: Number(prop.plot_size) || 0,
              images: prop.images || [],
              listing_type: prop.listing_type || 'resale',
              is_featured: prop.is_featured || false,
              is_own: prop.is_own || false
            });
          }
        } catch (err) {
          console.warn(`[Wishlist] Could not load property ${refNo}:`, err);
        }
      }

      this.properties = properties;

      if (properties.length === 0) {
        this.element.style.display = 'none';
      } else {
        this.element.style.display = 'grid';
        this.renderProperties();
      }

      this.isLoading = false;
    } catch (error) {
      console.error('[Wishlist] Error loading shared wishlist:', error);
      this.isLoading = false;
    }
  }

  private sortAndRender(): void {
    if (this.isSharedView) return;

    const sort = WishlistManager.getSort();
    const items = WishlistManager.getAsArray(sort.field, sort.order);
    this.properties = items as unknown as GridProperty[];
    this.renderProperties();
  }

  private renderProperties(): void {
    this.element.innerHTML = this.properties.map(p => this.createCard(p)).join('');
  }

  private createCard(property: GridProperty): string {
    // Handle both old format (images array) and new format (single image string)
    let imageUrls: string[] = [];
    if (property.images && Array.isArray(property.images)) {
      imageUrls = property.images.slice(0, 5).map(img => {
        if (typeof img === 'string') return img;
        return (img as { image_256?: string; src?: string }).image_256 ||
               (img as { image_256?: string; src?: string }).src || '';
      }).filter(Boolean);
    } else if (property.image) {
      imageUrls = [property.image];
    }
    const placeholderImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="192"%3E%3Crect fill="%23ecf0f1" width="256" height="192"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23bdc3c7" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';

    const price = this.formatPrice(property);
    const propertyUrl = this.generatePropertyUrl(property);
    const addedDate = property.addedAt ? new Date(property.addedAt).toLocaleDateString() : '';
    const refNo = property.ref_no || property.ref || String(property.id);
    const isCompareSelected = WishlistManager.isInCompare(refNo);

    const tags = this.generateTags(property);

    return `
      <div class="rs-wishlist-card" data-ref-no="${refNo}">
        <div class="rs-wishlist-card__carousel">
          ${tags}
          ${!this.isSharedView ? `
            ${this.compareEnabled ? `
              <div class="rs-wishlist-card__compare">
                <input type="checkbox" id="compare-${refNo}" class="rs-compare-check" ${isCompareSelected ? 'checked' : ''}>
                <label for="compare-${refNo}">${this.label('compare') || 'Compare'}</label>
              </div>
            ` : ''}
            <button type="button" class="rs-wishlist-card__heart active" data-action="remove">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          ` : ''}
          <a href="${propertyUrl}" class="rs-wishlist-card__carousel-link">
            <div class="rs-wishlist-card__carousel-track">
              ${imageUrls.length > 0
                ? imageUrls.map((url, i) => `<img src="${url}" alt="${this.escapeHtml(property.name || property.title)} - ${i+1}" ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} onerror="this.src='${placeholderImg}'">`).join('')
                : `<img src="${placeholderImg}" alt="No image">`
              }
            </div>
          </a>
          ${imageUrls.length > 1 ? `
            <button type="button" class="rs-wishlist-card__nav rs-wishlist-card__nav--prev" data-action="prev">&#8249;</button>
            <button type="button" class="rs-wishlist-card__nav rs-wishlist-card__nav--next" data-action="next">&#8250;</button>
            <div class="rs-wishlist-card__indicators">
              ${imageUrls.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}
            </div>
          ` : ''}
          ${(property.image_count || imageUrls.length) > 0 ? `
            <div class="rs-wishlist-card__img-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>${property.image_count || imageUrls.length}</span>
            </div>
          ` : ''}
        </div>
        <div class="rs-wishlist-card__content">
          <a href="${propertyUrl}" class="rs-wishlist-card__title">${this.escapeHtml(property.name || property.title)}</a>
          <a href="${propertyUrl}" class="rs-wishlist-card__price">${price}</a>
          <div class="rs-wishlist-card__details">
            <span>${this.escapeHtml(property.location || 'N/A')}</span>
            <span>${this.escapeHtml(property.type || 'N/A')}</span>
            <span>${property.beds || property.bedrooms || 0} ${this.label('card_beds') || 'beds'}</span>
            <span>${property.baths || property.bathrooms || 0} ${this.label('card_baths') || 'baths'}</span>
            <span>${property.built || property.build_size || property.built_area || 0}m\u00B2</span>
          </div>
          ${addedDate ? `<div class="rs-wishlist-card__added">${this.label('added') || 'Added'}: ${addedDate}</div>` : ''}
          ${property.note ? `
            <div class="rs-wishlist-card__note">
              <strong>\uD83D\uDCDD ${this.label('note') || 'Note'}:</strong> ${this.escapeHtml(property.note)}
            </div>
          ` : (!this.isSharedView ? `
            <button type="button" class="rs-wishlist-card__add-note" data-action="addNote">\uD83D\uDCDD ${this.label('wishlist_add_note') || 'Add Note'}</button>
          ` : '')}
          <div class="rs-wishlist-card__footer">
            <span class="rs-wishlist-card__ref">Ref: ${refNo}</span>
            <a href="${propertyUrl}" class="rs-wishlist-card__view">${this.label('view_details') || 'View Details'}</a>
          </div>
        </div>
      </div>
    `;
  }

  private generateTags(property: GridProperty): string {
    const tags: string[] = [];
    const listingType = property.listing_type || property.status;

    if (listingType) {
      const classMap: Record<string, string> = {
        resale: 'rs-tag--sale', sale: 'rs-tag--sale',
        development: 'rs-tag--development', new_development: 'rs-tag--development',
        long_rental: 'rs-tag--rental', rent: 'rs-tag--rental',
        short_rental: 'rs-tag--holiday', holiday: 'rs-tag--holiday'
      };
      const labelKeyMap: Record<string, string> = {
        resale: 'listing_type_sale', sale: 'listing_type_sale',
        development: 'listing_type_new', new_development: 'listing_type_new',
        long_rental: 'listing_type_long_rental', rent: 'listing_type_long_rental',
        short_rental: 'listing_type_short_rental', holiday: 'listing_type_short_rental'
      };
      const typeKey = listingType.toLowerCase();
      const cssClass = classMap[typeKey] || 'rs-tag--sale';
      const labelKey = labelKeyMap[typeKey];
      const typeLabel = labelKey ? this.label(labelKey) : listingType;
      tags.push(`<span class="rs-tag ${cssClass}">${typeLabel}</span>`);
    }

    if (property.is_featured) {
      tags.push(`<span class="rs-tag rs-tag--featured">${this.label('featured') || 'Featured'}</span>`);
    }

    if (property.is_own) {
      tags.push(`<span class="rs-tag rs-tag--own">${this.label('own') || 'Own'}</span>`);
    }

    return tags.length > 0 ? `<div class="rs-wishlist-card__tags">${tags.join('')}</div>` : '';
  }

  private formatPrice(property: GridProperty): string {
    const price1 = Number(property.list_price || property.price || 0);
    const price2 = Number(property.list_price_2 || 0);

    if (price2 && price1 !== price2) {
      return `\u20AC${price1.toLocaleString()} - \u20AC${price2.toLocaleString()}`;
    }
    return `\u20AC${price1.toLocaleString()}`;
  }

  private generatePropertyUrl(property: GridProperty): string {
    if (property.url) return property.url;

    const pageSlug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';
    const ref = property.ref_no || property.ref || String(property.id);
    const urlFormat = RealtySoftState.get<string>('config.propertyUrlFormat') || 'seo';

    if (urlFormat === 'query') {
      return `/${pageSlug}?ref=${ref}`;
    }

    if (urlFormat === 'ref') {
      return `/${pageSlug}/${ref}`;
    }

    const title = property.name || property.title || '';
    const titleSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);

    return `/${pageSlug}/${titleSlug}-${ref}`;
  }

  private handleCardClick(e: MouseEvent): void {
    const card = (e.target as HTMLElement).closest('.rs-wishlist-card') as HTMLElement | null;
    if (!card) return;

    const refNo = card.dataset.refNo || '';
    const actionEl = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
    const action = actionEl?.dataset.action;

    if (action === 'remove') {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(this.label('wishlist_confirm_remove') || 'Remove this property from your wishlist?')) {
        WishlistManager.remove(refNo);
        RealtySoftAnalytics.track('wishlist', 'removed', { property_id: refNo });
        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.success(this.label('wishlist_removed') || 'Removed from wishlist');
        }
      }
      return;
    }

    if (action === 'addNote') {
      e.preventDefault();
      e.stopPropagation();
      WishlistManager.openModal('note', { refNo });
      return;
    }

    if (action === 'prev' || action === 'next') {
      e.preventDefault();
      e.stopPropagation();
      this.navigateCarousel(card, action);
      return;
    }

    // Compare checkbox
    const compareCheck = (e.target as HTMLElement).closest('.rs-compare-check') as HTMLInputElement | null;
    if (compareCheck) {
      this.handleCompareToggle(refNo, compareCheck.checked);
      return;
    }
  }

  private navigateCarousel(card: HTMLElement, direction: string): void {
    const track = card.querySelector('.rs-wishlist-card__carousel-track') as HTMLElement | null;
    const indicators = card.querySelectorAll('.rs-wishlist-card__indicators span');
    const images = track?.querySelectorAll('img');

    if (!track || !images || images.length <= 1) return;

    let currentIndex = Array.from(indicators).findIndex(i => i.classList.contains('active'));
    if (currentIndex === -1) currentIndex = 0;

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length;

    track.style.transform = `translateX(-${newIndex * 100}%)`;

    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === newIndex);
    });
  }

  private handleCompareToggle(refNo: string, isChecked: boolean): void {
    if (isChecked) {
      const result = WishlistManager.addToCompare(refNo);
      if (!result) {
        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          const max = WishlistManager.getMaxCompare();
          RealtySoftToast.warning(`${this.label('compare_max') || 'Maximum'} ${max} ${this.label('properties') || 'properties'}`);
        }
        // Uncheck the checkbox
        const checkbox = this.element.querySelector(`#compare-${refNo}`) as HTMLInputElement | null;
        if (checkbox) checkbox.checked = false;
      }
    } else {
      WishlistManager.removeFromCompare(refNo);
    }
  }

  private updateCompareCheckboxes(): void {
    this.element.querySelectorAll<HTMLInputElement>('.rs-compare-check').forEach(checkbox => {
      const refNo = checkbox.id.replace('compare-', '');
      checkbox.checked = WishlistManager.isInCompare(refNo);
    });
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getProperties(): GridProperty[] {
    return this.properties;
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_grid', RSWishlistGrid as unknown as ComponentConstructor);

export { RSWishlistGrid };
export default RSWishlistGrid;
