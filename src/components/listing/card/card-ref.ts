/**
 * RealtySoft Widget v3 - Card Reference Sub-Component
 * Renders "Ref:" prefix + reference number
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

class RSCardRef extends RSBaseComponent {
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

    const ref = this.property.ref || '';
    if (!ref) {
      this.element.style.display = 'none';
      return;
    }

    this.element.textContent = `${this.label('card_ref')} ${ref}`;
  }
}

RealtySoft.registerComponent('rs_card_ref', RSCardRef as unknown as ComponentConstructor);

export { RSCardRef };
export default RSCardRef;
