/**
 * RealtySoft Widget v3 - Card Status Sub-Component
 * Renders listing type badges (sale/rental/development) + featured/own badges
 */

import { RSBaseComponent } from '../../base';
import { getCardProperty, onElementVisible } from './card-utils';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  Property,
} from '../../../types/index';

declare const RealtySoft: RealtySoftModule;

// CSS class mapping for listing types (labels are resolved dynamically)
const LISTING_TYPE_CLASS: Record<string, string> = {
  'resale': 'rs-card__tag--sale',
  'sale': 'rs-card__tag--sale',
  'development': 'rs-card__tag--development',
  'new_development': 'rs-card__tag--development',
  'long_rental': 'rs-card__tag--rental',
  'rent': 'rs-card__tag--rental',
  'short_rental': 'rs-card__tag--holiday',
  'holiday': 'rs-card__tag--holiday',
};

// Listing type → label key mapping
const LISTING_TYPE_LABEL_KEY: Record<string, string> = {
  'resale': 'listing_type_sale',
  'sale': 'listing_type_sale',
  'development': 'listing_type_new',
  'new_development': 'listing_type_new',
  'long_rental': 'listing_type_long_rental',
  'rent': 'listing_type_long_rental',
  'short_rental': 'listing_type_short_rental',
  'holiday': 'listing_type_short_rental',
};

class RSCardStatus extends RSBaseComponent {
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
  }

  render(): void {
    if (!this.property) return;

    const tags: string[] = [];
    const listingType = this.property.listing_type;

    if (listingType) {
      const typeKey = listingType.toLowerCase();
      const cssClass = LISTING_TYPE_CLASS[typeKey] || 'rs-card__tag--sale';
      const labelKey = LISTING_TYPE_LABEL_KEY[typeKey];
      const typeLabel = labelKey ? this.label(labelKey) : listingType;
      tags.push(`<span class="rs-card__tag ${cssClass}">${typeLabel}</span>`);
    }

    if (this.property.is_featured) {
      tags.push(`<span class="rs-card__tag rs-card__tag--featured">${this.label('featured')}</span>`);
    }

    if (this.property.is_own) {
      tags.push(`<span class="rs-card__tag rs-card__tag--own">${this.label('own')}</span>`);
    }

    if (tags.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = tags.join('');
  }
}

RealtySoft.registerComponent('rs_card_status', RSCardStatus as unknown as ComponentConstructor);

export { RSCardStatus };
export default RSCardStatus;
