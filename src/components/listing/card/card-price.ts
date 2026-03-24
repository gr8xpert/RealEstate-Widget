/**
 * RealtySoft Widget v3 - Card Price Sub-Component
 * Renders formatted price via RealtySoftLabels.formatPrice(), or "Price on Request"
 */

import { RSBaseComponent } from '../../base';
import { getCardProperty, onElementVisible } from './card-utils';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftLabelsModule,
  Property,
} from '../../../types/index';

declare const RealtySoft: RealtySoftModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;

class RSCardPrice extends RSBaseComponent {
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

    if (this.property.price_on_request || (!this.property.price && this.property.price !== 0)) {
      this.element.textContent = this.label('detail_price_on_request') || 'Price on Request';
    } else {
      const periodLabel = this.getRentalPeriodLabel();

      // Check for price range (common in development properties)
      if (this.property.price_min && this.property.price_max && this.property.price_min !== this.property.price_max) {
        const minPrice = RealtySoftLabels.formatPrice(this.property.price_min);
        const maxPrice = RealtySoftLabels.formatPrice(this.property.price_max);
        const priceRange = `${minPrice} - ${maxPrice}`;
        this.element.textContent = periodLabel ? `${priceRange}${periodLabel}` : priceRange;
      } else if (this.property.price_min && this.property.listing_type === 'development') {
        // Development with only starting price
        const fromLabel = this.label('price_from') || 'From';
        const price = RealtySoftLabels.formatPrice(this.property.price_min);
        this.element.textContent = periodLabel ? `${fromLabel} ${price}${periodLabel}` : `${fromLabel} ${price}`;
      } else {
        const price = RealtySoftLabels.formatPrice(this.property.price);
        this.element.textContent = periodLabel ? `${price}${periodLabel}` : price;
      }
    }
  }

  private getRentalPeriodLabel(): string {
    if (!this.property) return '';
    const listingType = this.property.listing_type?.toLowerCase();
    let period = '';
    if (listingType === 'long_rental') {
      period = this.label('per_month') || this.label('detail_per_month') || 'month';
    } else if (listingType === 'short_rental') {
      period = this.label('per_week') || this.label('detail_per_week') || 'week';
    }
    if (!period) return '';
    // Ensure period starts with /
    return period.startsWith('/') ? period : '/' + period;
  }
}

RealtySoft.registerComponent('rs_card_price', RSCardPrice as unknown as ComponentConstructor);

export { RSCardPrice };
export default RSCardPrice;
