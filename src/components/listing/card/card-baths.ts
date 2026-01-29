/**
 * RealtySoft Widget v3 - Card Baths Sub-Component
 * Renders bath SVG icon + count + singular/plural label. Hidden if 0.
 */

import { RSBaseComponent } from '../../base';
import { getCardProperty, SVG_ICONS, onElementVisible } from './card-utils';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  Property,
} from '../../../types/index';

declare const RealtySoft: RealtySoftModule;

class RSCardBaths extends RSBaseComponent {
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
    if (!this.property || !this.property.baths || this.property.baths <= 0) {
      this.element.style.display = 'none';
      return;
    }

    const bathLabel = this.property.baths === 1 ? this.label('card_bath') : this.label('card_baths');
    this.element.innerHTML = `${SVG_ICONS.bath} ${this.property.baths} ${bathLabel}`;
  }
}

RealtySoft.registerComponent('rs_card_baths', RSCardBaths as unknown as ComponentConstructor);

export { RSCardBaths };
export default RSCardBaths;
