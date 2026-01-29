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
    if (!this.property || !this.property.plot_size || this.property.plot_size <= 0) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `${SVG_ICONS.plotSize} ${this.property.plot_size} ${this.label('card_plot')}`;
  }
}

RealtySoft.registerComponent('rs_card_plot', RSCardPlot as unknown as ComponentConstructor);

export { RSCardPlot };
export default RSCardPlot;
