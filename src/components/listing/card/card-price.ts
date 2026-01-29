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
      this.element.textContent = RealtySoftLabels.formatPrice(this.property.price);
    }
  }
}

RealtySoft.registerComponent('rs_card_price', RSCardPrice as unknown as ComponentConstructor);

export { RSCardPrice };
export default RSCardPrice;
