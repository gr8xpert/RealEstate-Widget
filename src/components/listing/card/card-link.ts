/**
 * RealtySoft Widget v3 - Card Link Sub-Component
 * Anchor to property detail page. SEO-friendly URL generation.
 */

import { RSBaseComponent } from '../../base';
import { getCardProperty, generatePropertyUrl, onElementVisible } from './card-utils';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  Property,
} from '../../../types/index';

declare const RealtySoft: RealtySoftModule;

declare const RealtySoftRouter: {
  isEnabled: () => boolean;
  navigateToProperty: (property: Property, url: string) => void;
} | undefined;

class RSCardLink extends RSBaseComponent {
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

    const url = generatePropertyUrl(this.property);
    const property = this.property;

    if (this.element.tagName === 'A') {
      (this.element as HTMLAnchorElement).href = url;
      // SPA navigation intercept for anchor elements
      this.element.addEventListener('click', (e: Event) => {
        const me = e as MouseEvent;
        if (typeof RealtySoftRouter !== 'undefined' && RealtySoftRouter.isEnabled() &&
            !me.ctrlKey && !me.metaKey && !me.shiftKey) {
          e.preventDefault();
          RealtySoftRouter.navigateToProperty(property, url);
        }
      });
    } else {
      this.element.setAttribute('data-rs-href', url);
      this.element.style.cursor = 'pointer';
      this.element.addEventListener('click', () => {
        if (typeof RealtySoftRouter !== 'undefined' && RealtySoftRouter.isEnabled()) {
          RealtySoftRouter.navigateToProperty(property, url);
        } else {
          window.location.href = url;
        }
      });
    }
  }
}

RealtySoft.registerComponent('rs_card_link', RSCardLink as unknown as ComponentConstructor);

export { RSCardLink };
export default RSCardLink;
