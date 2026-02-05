/**
 * RealtySoft Widget v3 - Detail Related Component
 * Shows related/similar properties
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  Property,
  RealtySoftAPIModule,
  RealtySoftLabelsModule,
  RealtySoftAnalyticsModule,
  RealtySoftStateModule
} from '../../types/index';

// Declare globals
declare const RealtySoftAPI: RealtySoftAPIModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;
declare const RealtySoftState: RealtySoftStateModule;

class RSDetailRelated extends RSBaseComponent {
  private property: Property | null = null;
  private relatedProperties: Property[] = [];
  private limit: number = 6;
  private loader: HTMLElement | null = null;
  private grid: HTMLElement | null = null;
  private hasInitiallyRendered: boolean = false;

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

    // Check if similar_property_ids exists and has values - if not, hide entire section
    const similarIds = this.property.similar_property_ids || [];
    if (similarIds.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    this.relatedProperties = [];
    this.limit = parseInt(this.element.dataset.limit || '6') || 6;

    this.render();
    this.loadRelated();

    // Listen for language changes to update labels
    this.subscribe('config.language', () => {
      this.updateLabelsInPlace();
    });
  }

  render(): void {
    // If already rendered, just update labels (language change scenario)
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }

    // First-time render: build full HTML structure
    this.hasInitiallyRendered = true;

    this.element.classList.add('rs-detail-related');

    this.element.innerHTML = `
      <h3 class="rs-detail-related__title">${this.label('detail_related')}</h3>
      <div class="rs-detail-related__loader">
        <div class="rs-detail-related__spinner"></div>
      </div>
      <div class="rs-detail-related__grid"></div>
    `;

    this.loader = this.element.querySelector('.rs-detail-related__loader');
    this.grid = this.element.querySelector('.rs-detail-related__grid');
  }

  /**
   * Update only label text nodes on language change
   */
  private updateLabelsInPlace(): void {
    // Update title
    const titleEl = this.element.querySelector('.rs-detail-related__title');
    if (titleEl) titleEl.textContent = this.label('detail_related');

    // Re-render property cards if we have them (they contain labels for beds/baths/price)
    if (this.relatedProperties.length > 0) {
      this.renderProperties();
    }
  }

  private async loadRelated(): Promise<void> {
    try {
      // similar_property_ids already validated in init() - fetch those properties
      const similarIds = this.property!.similar_property_ids || [];
      const idsToFetch = similarIds.slice(0, this.limit);
      const result = await RealtySoftAPI.getWishlistProperties(idsToFetch);

      this.relatedProperties = (result.data || []) as Property[];

      if (this.relatedProperties.length === 0) {
        this.element.style.display = 'none';
        return;
      }

      this.renderProperties();
    } catch (error) {
      console.error('Failed to load related properties:', error);
      this.element.style.display = 'none';
    } finally {
      if (this.loader) this.loader.style.display = 'none';
    }
  }

  private renderProperties(): void {
    if (!this.grid) return;

    this.grid.innerHTML = this.relatedProperties.map(property => this.createCard(property)).join('');

    // Bind click events
    this.grid.querySelectorAll<HTMLElement>('.rs-detail-related__card').forEach(card => {
      card.addEventListener('click', () => {
        const propertyId = card.dataset.propertyId;
        const property = this.relatedProperties.find(p => String(p.id) === propertyId);
        if (property) {
          RealtySoftAnalytics.trackCardClick(property);
        }
      });
    });
  }

  private generatePropertyUrl(property: Property): string {
    // Use central helper if available (supports multilingual URLs)
    if (typeof (window as any).RealtySoftGetPropertyUrl === 'function') {
      return (window as any).RealtySoftGetPropertyUrl(property);
    }
    // Fallback for older setups
    if (property.url) return property.url;
    const pageSlug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';
    return `/${pageSlug}/${property.ref || property.id}`;
  }

  private createCard(property: Property): string {
    const mainImage = (property.images && property.images[0]) || '/realtysoft/assets/placeholder.jpg';
    const price = RealtySoftLabels.formatPrice(property.price);

    return `
      <a href="${this.generatePropertyUrl(property)}"
         class="rs-detail-related__card"
         data-property-id="${property.id}">
        <div class="rs-detail-related__card-image">
          <img src="${mainImage}" alt="${this.escapeHtml(property.title)}" loading="lazy">
        </div>
        <div class="rs-detail-related__card-content">
          <div class="rs-detail-related__card-price">${price}</div>
          <h4 class="rs-detail-related__card-title">${this.escapeHtml(property.title)}</h4>
          <div class="rs-detail-related__card-location">${this.escapeHtml(property.location || '')}</div>
          <div class="rs-detail-related__card-specs">
            ${property.beds ? `<span>${property.beds} ${this.label('card_beds')}</span>` : ''}
            ${property.baths ? `<span>${property.baths} ${this.label('card_baths')}</span>` : ''}
            ${property.built_area ? `<span>${property.built_area} m²</span>` : ''}
          </div>
        </div>
      </a>
    `;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailRelated };
export default RSDetailRelated;
