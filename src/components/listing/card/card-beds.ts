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
    // Check for range values first (development properties)
    const hasRange = this.property?.beds_min && this.property?.beds_max && this.property.beds_min !== this.property.beds_max;
    const hasMin = this.property?.beds_min && this.property.beds_min > 0;
    const hasSingle = this.property?.beds && this.property.beds > 0;

    if (!this.property || (!hasRange && !hasMin && !hasSingle)) {
      this.element.style.display = 'none';
      return;
    }

    let bedsDisplay: string;
    if (hasRange) {
      // Show range: "2-4 Beds"
      bedsDisplay = `${this.property.beds_min}-${this.property.beds_max}`;
    } else if (hasMin && this.property.listing_type === 'development') {
      // Development with only min: "2+ Beds"
      bedsDisplay = `${this.property.beds_min}+`;
    } else {
      bedsDisplay = `${this.property.beds}`;
    }

    const bedLabel = (hasRange || (hasMin && this.property.listing_type === 'development') || this.property.beds !== 1)
      ? this.label('card_beds')
      : this.label('card_bed');
    this.element.innerHTML = `${SVG_ICONS.bed} ${bedsDisplay} ${bedLabel}`;
  }
}

RealtySoft.registerComponent('rs_card_beds', RSCardBeds as unknown as ComponentConstructor);

export { RSCardBeds };
export default RSCardBeds;
