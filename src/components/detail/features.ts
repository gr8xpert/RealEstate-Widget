/**
 * RealtySoft Widget v3 - Detail Features Component
 * Displays property features list
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property, PropertyFeature } from '../../types/index';

class RSDetailFeatures extends RSBaseComponent {
  private property: Property | null = null;
  private features: (string | PropertyFeature)[] = [];

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    // Get property from options (set before super() calls init())
    this.property = this.options?.property as Property | null;

    if (!this.property) {
      this.element.style.display = 'none';
      return;
    }

    this.features = (this.property.features as unknown as (string | PropertyFeature)[]) || [];

    if (this.features.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    this.render();
  }

  render(): void {
    this.element.classList.add('rs-detail-features');

    // Group features by category
    const grouped: Record<string, string[]> = {};
    this.features.forEach(feature => {
      const name = typeof feature === 'string' ? feature : feature.name;
      const category = (typeof feature === 'object' && feature.category) ? feature.category : 'Features';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(name);
    });

    // Render grouped features
    const html = Object.entries(grouped).map(([category, items]) => `
      <div class="rs-detail-features__group">
        <h3 class="rs-detail-features__title">${this.escapeHtml(category)}</h3>
        <ul class="rs-detail-features__list">
          ${items.map(name => `
            <li class="rs-detail-features__item">
              <svg class="rs-detail-features__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="rs-detail-features__text">${this.escapeHtml(name)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    this.element.innerHTML = html;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailFeatures };
export default RSDetailFeatures;
