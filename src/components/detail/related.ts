/**
 * RealtySoft Widget v3 - Detail Related Component
 * Shows related/similar properties
 *
 * Priority:
 * 1. If CRM provides similar_property_ids (manually curated), show those
 * 2. Fallback: Auto-find similar properties based on location + type + price
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  Property,
  SearchParams,
  SimilarPropertiesConfig,
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
  private minResults: number = 3; // Minimum results required to show section
  private loader: HTMLElement | null = null;
  private grid: HTMLElement | null = null;
  private hasInitiallyRendered: boolean = false;
  private priceRange: number = 0.3; // ±30% price range for fallback search

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

    this.relatedProperties = [];

    // Get config: data attributes > global config > defaults
    const globalConfig = RealtySoftState.get<SimilarPropertiesConfig>('config.similarProperties') || {};
    this.limit = parseInt(this.element.dataset.limit || '') || globalConfig.limit || 6;
    this.minResults = parseInt(this.element.dataset.minResults || '') || globalConfig.minResults || 3;
    this.priceRange = parseFloat(this.element.dataset.priceRange || '') || globalConfig.priceRange || 0.3;

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
      // Priority 1: Check if CRM provided similar_property_ids (manually curated)
      const similarIds = this.property!.similar_property_ids || [];

      if (similarIds.length > 0) {
        // Use manually curated similar properties from CRM
        const idsToFetch = similarIds.slice(0, this.limit);
        const result = await RealtySoftAPI.getWishlistProperties(idsToFetch);
        this.relatedProperties = (result.data || []) as Property[];
      }

      // Priority 2: If no curated properties, search for similar based on criteria
      if (this.relatedProperties.length === 0) {
        this.relatedProperties = await this.searchSimilarProperties();
      }

      // Only show section if we have at least the minimum required
      if (this.relatedProperties.length < this.minResults) {
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

  /**
   * Search for similar properties based on location, type, and price range
   * Uses progressive relaxation: accumulates results until minimum is reached
   */
  private async searchSimilarProperties(): Promise<Property[]> {
    const property = this.property!;
    const collectedProperties: Property[] = [];
    const seenIds = new Set<number>([property.id]); // Track seen IDs to avoid duplicates, include current property

    // Try multiple search strategies, from most specific to least
    const searchStrategies = [
      // Strategy 1: Same location + type + listing_type + price range
      this.buildSearchParams(property, { location: true, type: true, listingType: true, price: true }),
      // Strategy 2: Same location + listing_type + price range (drop type)
      this.buildSearchParams(property, { location: true, type: false, listingType: true, price: true }),
      // Strategy 3: Same location + listing_type (drop price range)
      this.buildSearchParams(property, { location: true, type: false, listingType: true, price: false }),
      // Strategy 4: Same type + listing_type + price range (drop location)
      this.buildSearchParams(property, { location: false, type: true, listingType: true, price: true }),
      // Strategy 5: Same listing_type + price range only
      this.buildSearchParams(property, { location: false, type: false, listingType: true, price: true }),
      // Strategy 6: Same listing_type only (broadest search)
      this.buildSearchParams(property, { location: false, type: false, listingType: true, price: false }),
    ];

    for (const searchParams of searchStrategies) {
      // Stop if we have enough properties
      if (collectedProperties.length >= this.minResults) {
        break;
      }

      try {
        const result = await RealtySoftAPI.searchProperties(searchParams);
        const properties = (result.data || []) as Property[];

        // Add new properties (not already collected)
        for (const p of properties) {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            collectedProperties.push(p);

            // Stop if we have enough
            if (collectedProperties.length >= this.limit) {
              break;
            }
          }
        }
      } catch (error) {
        // Silently continue to next strategy
      }
    }

    return collectedProperties.slice(0, this.limit);
  }

  /**
   * Build search params based on which criteria to include
   */
  private buildSearchParams(
    property: Property,
    options: { location: boolean; type: boolean; listingType: boolean; price: boolean }
  ): Partial<SearchParams> {
    const searchParams: Partial<SearchParams> = {
      page: 1,
      limit: this.limit + 5, // Fetch extra to have options after filtering
      order: 'create_date_desc', // Most recent first
    };

    if (options.location && property.location_id) {
      searchParams.location_id = property.location_id;
    }

    if (options.type && property.type_id) {
      searchParams.type_id = property.type_id;
    }

    if (options.listingType && property.listing_type) {
      searchParams.listing_type = property.listing_type;
    }

    if (options.price && property.price && property.price > 0) {
      const priceMin = Math.floor(property.price * (1 - this.priceRange));
      const priceMax = Math.ceil(property.price * (1 + this.priceRange));
      searchParams.list_price_min = priceMin;
      searchParams.list_price_max = priceMax;
    }

    return searchParams;
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
