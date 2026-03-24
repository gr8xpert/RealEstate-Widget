/**
 * RealtySoft Widget v3 - Card Plot Size Sub-Component
 * Renders plot SVG icon + value + m2 label. Hidden if 0.
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

class RSCardPlot extends RSBaseComponent {
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
    const hasRange = this.property?.plot_size_min && this.property?.plot_size_max && this.property.plot_size_min !== this.property.plot_size_max;
    const hasMin = this.property?.plot_size_min && this.property.plot_size_min > 0;
    const hasSingle = this.property?.plot_size && this.property.plot_size > 0;

    if (!this.property || (!hasRange && !hasMin && !hasSingle)) {
      this.element.style.display = 'none';
      return;
    }

    let plotDisplay: string;
    if (hasRange) {
      // Show range: "500-1000 m²"
      plotDisplay = `${this.property.plot_size_min}-${this.property.plot_size_max}`;
    } else if (hasMin && this.property.listing_type === 'development') {
      // Development with only min: "500+ m²"
      plotDisplay = `${this.property.plot_size_min}+`;
    } else {
      plotDisplay = `${this.property.plot_size}`;
    }

    this.element.innerHTML = `${SVG_ICONS.plotSize} ${plotDisplay} ${this.label('card_plot')}`;
  }
}

RealtySoft.registerComponent('rs_card_plot', RSCardPlot as unknown as ComponentConstructor);

export { RSCardPlot };
export default RSCardPlot;
