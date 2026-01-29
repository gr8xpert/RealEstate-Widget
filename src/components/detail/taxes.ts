/**
 * RealtySoft Widget v3 - Detail Taxes Component
 * Property taxes and fees (Community, IBI, Basura)
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property, RealtySoftLabelsModule } from '../../types/index';

// Declare globals
declare const RealtySoftLabels: RealtySoftLabelsModule;

interface TaxItem {
  label: string;
  value: string;
  period: string;
}

class RSDetailTaxes extends RSBaseComponent {
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
    this.element.classList.add('rs-detail-taxes');

    // Build tax items based on available data (use parseFloat to handle string "0" from API)
    const taxes: TaxItem[] = [];

    if (p.community_fees && parseFloat(String(p.community_fees)) > 0) {
      taxes.push({
        label: this.label('detail_community_fees'),
        value: RealtySoftLabels.formatPrice(p.community_fees),
        period: this.label('detail_per_month')
      });
    }
    if (p.ibi_tax && parseFloat(String(p.ibi_tax)) > 0) {
      taxes.push({
        label: this.label('detail_ibi_tax'),
        value: RealtySoftLabels.formatPrice(p.ibi_tax),
        period: this.label('detail_per_year')
      });
    }
    if (p.basura_tax && parseFloat(String(p.basura_tax)) > 0) {
      taxes.push({
        label: this.label('detail_basura_tax'),
        value: RealtySoftLabels.formatPrice(p.basura_tax),
        period: this.label('detail_per_year')
      });
    }

    if (taxes.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    this.element.innerHTML = `
      <h3 class="rs-detail-taxes__title">${this.label('detail_taxes_fees')}</h3>
      <div class="rs-detail-taxes__list">
        ${taxes.map(tax => `
          <div class="rs-detail-taxes__item">
            <span class="rs-detail-taxes__label">${tax.label}</span>
            <span class="rs-detail-taxes__value">
              ${tax.value}
              <span class="rs-detail-taxes__period">${tax.period}</span>
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailTaxes };
export default RSDetailTaxes;
