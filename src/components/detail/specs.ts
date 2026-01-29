/**
 * RealtySoft Widget v3 - Detail Specs Component
 * Key property specifications (Beds, Baths, Built, Plot, Terrace)
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property } from '../../types/index';

interface SpecItem {
  icon: string;
  value: string | number;
  label: string;
}

class RSDetailSpecs extends RSBaseComponent {
  private property: Property | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.property = this.options?.property as Property | null;

    if (!this.property) {
      this.element.style.display = 'none';
      return;
    }

    this.render();
  }

  render(): void {
    const p = this.property!;
    this.element.classList.add('rs-detail-specs');

    // Build specs based on available data (use parseFloat to handle string "0")
    const specs: SpecItem[] = [];

    // Always show beds/baths if > 0
    if (p.beds && parseFloat(String(p.beds)) > 0) {
      specs.push({
        icon: this.getIcon('beds'),
        value: p.beds,
        label: this.label('card_beds') || 'Beds'
      });
    }

    if (p.baths && parseFloat(String(p.baths)) > 0) {
      specs.push({
        icon: this.getIcon('baths'),
        value: p.baths,
        label: this.label('card_baths') || 'Baths'
      });
    }

    // Size specs
    if (p.built_area && parseFloat(String(p.built_area)) > 0) {
      specs.push({
        icon: this.getIcon('built'),
        value: `${p.built_area} m²`,
        label: this.label('detail_built_area') || 'Built'
      });
    }

    if (p.plot_size && parseFloat(String(p.plot_size)) > 0) {
      specs.push({
        icon: this.getIcon('plot'),
        value: `${p.plot_size} m²`,
        label: this.label('detail_plot_size') || 'Plot'
      });
    }

    if (p.terrace_size && parseFloat(String(p.terrace_size)) > 0) {
      specs.push({
        icon: this.getIcon('terrace'),
        value: `${p.terrace_size} m²`,
        label: this.label('detail_terrace') || 'Terrace'
      });
    }

    if (specs.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `
      <div class="rs-detail-specs__grid">
        ${specs.map(spec => `
          <div class="rs-detail-specs__item">
            <span class="rs-detail-specs__icon">${spec.icon}</span>
            <span class="rs-detail-specs__value">${spec.value}</span>
            <span class="rs-detail-specs__label">${spec.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      beds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v11m0-4h18m0 4V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3"/><path d="M7 11v-1a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/></svg>',
      baths: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/><circle cx="9" cy="6" r="1"/></svg>',
      built: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
      plot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 17l4-8 4 5 5-6"/></svg>',
      terrace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
    };
    return icons[type] || icons.built;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailSpecs };
export default RSDetailSpecs;
