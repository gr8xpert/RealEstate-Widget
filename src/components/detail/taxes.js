/**
 * RealtySoft Widget v2 - Detail Taxes Component
 * Property taxes and fees (Community, IBI, Basura)
 */

class RSDetailTaxes extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.property = this.options?.property;

        if (!this.property) {
            this.element.style.display = 'none';
            return;
        }

        this.render();
    }

    render() {
        const p = this.property;
        this.element.classList.add('rs-detail-taxes');

        // Build tax items based on available data (use parseFloat to handle string "0" from API)
        const taxes = [];

        if (p.community_fees && parseFloat(p.community_fees) > 0) {
            taxes.push({
                label: this.label('detail_community_fees'),
                value: RealtySoftLabels.formatPrice(p.community_fees),
                period: this.label('detail_per_month')
            });
        }
        if (p.ibi_tax && parseFloat(p.ibi_tax) > 0) {
            taxes.push({
                label: this.label('detail_ibi_tax'),
                value: RealtySoftLabels.formatPrice(p.ibi_tax),
                period: this.label('detail_per_year')
            });
        }
        if (p.basura_tax && parseFloat(p.basura_tax) > 0) {
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
