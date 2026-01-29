/**
 * RealtySoft Widget v3 - Card Built Area Sub-Component
 * Renders area SVG icon + value + m2 label. Hidden if 0.
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

class RSCardBuilt extends RSBaseComponent {
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
    if (!this.property || !this.property.built_area || this.property.built_area <= 0) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `${SVG_ICONS.builtArea} ${this.property.built_area} ${this.label('card_built')}`;
  }
}

RealtySoft.registerComponent('rs_card_built', RSCardBuilt as unknown as ComponentConstructor);

export { RSCardBuilt };
export default RSCardBuilt;
