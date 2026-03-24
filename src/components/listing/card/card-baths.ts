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
    // Check for range values first (development properties)
    const hasRange = this.property?.baths_min && this.property?.baths_max && this.property.baths_min !== this.property.baths_max;
    const hasMin = this.property?.baths_min && this.property.baths_min > 0;
    const hasSingle = this.property?.baths && this.property.baths > 0;

    if (!this.property || (!hasRange && !hasMin && !hasSingle)) {
      this.element.style.display = 'none';
      return;
    }

    let bathsDisplay: string;
    if (hasRange) {
      // Show range: "2-4 Baths"
      bathsDisplay = `${this.property.baths_min}-${this.property.baths_max}`;
    } else if (hasMin && this.property.listing_type === 'development') {
      // Development with only min: "2+ Baths"
      bathsDisplay = `${this.property.baths_min}+`;
    } else {
      bathsDisplay = `${this.property.baths}`;
    }

    const bathLabel = (hasRange || (hasMin && this.property.listing_type === 'development') || this.property.baths !== 1)
      ? this.label('card_baths')
      : this.label('card_bath');
    this.element.innerHTML = `${SVG_ICONS.bath} ${bathsDisplay} ${bathLabel}`;
  }
}

RealtySoft.registerComponent('rs_card_baths', RSCardBaths as unknown as ComponentConstructor);

export { RSCardBaths };
export default RSCardBaths;
