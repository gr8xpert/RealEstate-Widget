/**
 * RealtySoft Widget v3 - Detail Sizes Component
 * Additional property sizes (Terrace, Solarium, Garden, etc.)
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property } from '../../types/index';

interface SizeItem {
  icon: string;
  label: string;
  value: string;
}

class RSDetailSizes extends RSBaseComponent {
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
    this.element.classList.add('rs-detail-sizes');

    // Build size items based on available data (use parseFloat to handle string "0" from API)
    const sizes: SizeItem[] = [];

    if (p.built_area && parseFloat(String(p.built_area)) > 0) {
      sizes.push({
        icon: this.getIcon('built'),
        label: this.label('detail_built_area'),
        value: `${p.built_area} m²`
      });
    }
    if (p.plot_size && parseFloat(String(p.plot_size)) > 0) {
      sizes.push({
        icon: this.getIcon('plot'),
        label: this.label('detail_plot_size'),
        value: `${p.plot_size} m²`
      });
    }
    if (p.usable_area && parseFloat(String(p.usable_area)) > 0) {
      sizes.push({
        icon: this.getIcon('usable'),
        label: this.label('detail_usable_area'),
        value: `${p.usable_area} m²`
      });
    }
    if (p.terrace_size && parseFloat(String(p.terrace_size)) > 0) {
      sizes.push({
        icon: this.getIcon('terrace'),
        label: this.label('detail_terrace'),
        value: `${p.terrace_size} m²`
      });
    }
    if (p.solarium_size && parseFloat(String(p.solarium_size)) > 0) {
      sizes.push({
        icon: this.getIcon('solarium'),
        label: this.label('detail_solarium'),
        value: `${p.solarium_size} m²`
      });
    }
    if (p.garden_size && parseFloat(String(p.garden_size)) > 0) {
      sizes.push({
        icon: this.getIcon('garden'),
        label: this.label('detail_garden'),
        value: `${p.garden_size} m²`
      });
    }

    if (sizes.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `
      <h3 class="rs-detail-sizes__title">${this.label('detail_sizes')}</h3>
      <div class="rs-detail-sizes__grid">
        ${sizes.map(size => `
          <div class="rs-detail-sizes__item">
            <div class="rs-detail-sizes__icon">${size.icon}</div>
            <div class="rs-detail-sizes__content">
              <span class="rs-detail-sizes__label">${size.label}</span>
              <span class="rs-detail-sizes__value">${size.value}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      built: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
      plot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 17l4-8 4 5 5-6"/></svg>',
      usable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>',
      terrace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      solarium: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
      garden: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V12"/><path d="M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5S14.5 12 12 12z"/><path d="M7 22h10"/></svg>'
    };
    return icons[type] || icons.built;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailSizes };
export default RSDetailSizes;
