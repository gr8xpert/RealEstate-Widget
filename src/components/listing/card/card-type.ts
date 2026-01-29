/**
 * RealtySoft Widget v3 - Card Type Sub-Component
 * Renders property type text (e.g., "Villa"). Hidden if empty.
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

class RSCardType extends RSBaseComponent {
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
    if (!this.property || !this.property.type) {
      this.element.style.display = 'none';
      return;
    }

    this.element.textContent = this.property.type;
  }
}

RealtySoft.registerComponent('rs_card_type', RSCardType as unknown as ComponentConstructor);

export { RSCardType };
export default RSCardType;
