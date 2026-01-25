/**
 * RealtySoft Widget v2 - Detail Info Table Component
 * Property information table (Type, Status, Reference, etc.)
 */

class RSDetailInfoTable extends RSBaseComponent {
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
        this.element.classList.add('rs-detail-info-table');

        // Build rows based on available data
        const rows = [];

        if (p.type) {
            rows.push({ label: this.label('detail_property_type'), value: p.type });
        }
        if (p.status) {
            rows.push({ label: this.label('detail_status'), value: p.status });
        }
        if (p.ref) {
            rows.push({ label: this.label('detail_reference'), value: p.ref });
        }
        if (p.unique_ref) {
            rows.push({ label: this.label('detail_unique_ref'), value: p.unique_ref });
        }
        if (p.year_built) {
            rows.push({ label: this.label('detail_year_built'), value: p.year_built });
        }
        if (p.postal_code) {
            rows.push({ label: this.label('detail_postal_code'), value: p.postal_code });
        }
        if (p.floor) {
            rows.push({ label: this.label('detail_floor'), value: p.floor });
        }
        if (p.orientation) {
            rows.push({ label: this.label('detail_orientation'), value: p.orientation });
        }
        if (p.condition) {
            rows.push({ label: this.label('detail_condition'), value: p.condition });
        }
        if (p.furnished) {
            rows.push({ label: this.label('detail_furnished'), value: p.furnished });
        }
        if (p.views) {
            rows.push({ label: this.label('detail_views'), value: p.views });
        }
        if (p.parking && p.parking > 0) {
            rows.push({ label: this.label('detail_parking'), value: p.parking });
        }

        if (rows.length === 0) {
            this.element.style.display = 'none';
            return;
        }

        this.element.innerHTML = `
            <h3 class="rs-detail-info-table__title">${this.label('detail_property_info')}</h3>
            <table class="rs-detail-info-table__table">
                <tbody>
                    ${rows.map(row => `
                        <tr class="rs-detail-info-table__row">
                            <td class="rs-detail-info-table__label">${row.label}</td>
                            <td class="rs-detail-info-table__value">${this.escapeHtml(String(row.value))}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
