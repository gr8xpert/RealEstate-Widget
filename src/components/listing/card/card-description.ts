/**
 * RealtySoft Widget v3 - Card Description Sub-Component
 * Short description text. Supports data-rs-max-length truncation.
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

class RSCardDescription extends RSBaseComponent {
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

    let text = this.property.short_description || this.property.description || '';
    if (!text) {
      this.element.style.display = 'none';
      return;
    }

    const maxLength = parseInt(this.element.dataset.rsMaxLength || '0') || 0;
    if (maxLength > 0 && text.length > maxLength) {
      text = text.substring(0, maxLength).trimEnd() + '...';
    }

    this.element.textContent = text;
  }
}

RealtySoft.registerComponent('rs_card_description', RSCardDescription as unknown as ComponentConstructor);

export { RSCardDescription };
export default RSCardDescription;
