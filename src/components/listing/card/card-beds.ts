/**
 * RealtySoft Widget v3 - Card Beds Sub-Component
 * Renders bed SVG icon + count + singular/plural label. Hidden if 0.
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

class RSCardBeds extends RSBaseComponent {
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
    if (!this.property || !this.property.beds || this.property.beds <= 0) {
      this.element.style.display = 'none';
      return;
    }

    const bedLabel = this.property.beds === 1 ? this.label('card_bed') : this.label('card_beds');
    this.element.innerHTML = `${SVG_ICONS.bed} ${this.property.beds} ${bedLabel}`;
  }
}

RealtySoft.registerComponent('rs_card_beds', RSCardBeds as unknown as ComponentConstructor);

export { RSCardBeds };
export default RSCardBeds;
