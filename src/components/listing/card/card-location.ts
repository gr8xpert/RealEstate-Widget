/**
 * RealtySoft Widget v3 - Card Location Sub-Component
 * Renders map pin SVG icon + location text. Supports data-rs-show-icon attribute.
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

class RSCardLocation extends RSBaseComponent {
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

    const location = String(this.property.location || '');
    if (!location) {
      this.element.style.display = 'none';
      return;
    }

    const showIcon = this.element.dataset.rsShowIcon !== 'false';
    if (showIcon) {
      this.element.innerHTML = `${SVG_ICONS.mapPin} ${this.escapeText(location)}`;
    } else {
      this.element.textContent = location;
    }
  }

  private escapeText(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

RealtySoft.registerComponent('rs_card_location', RSCardLocation as unknown as ComponentConstructor);

export { RSCardLocation };
export default RSCardLocation;
