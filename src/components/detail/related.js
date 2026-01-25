/**
 * RealtySoft Widget v2 - Detail Related Component
 * Shows related/similar properties
 */

class RSDetailRelated extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        // Get property from options (set before super() calls init())
        this.property = this.options?.property;

        if (!this.property || !this.property.id) {
            this.element.style.display = 'none';
            return;
        }

        this.relatedProperties = [];
        this.limit = parseInt(this.element.dataset.limit) || 6;

        this.render();
        this.loadRelated();
    }

    render() {
        this.element.classList.add('rs-detail-related');

        this.element.innerHTML = `
            <h3 class="rs-detail-related__title">${this.label('detail_related')}</h3>
            <div class="rs-detail-related__loader">
                <div class="rs-detail-related__spinner"></div>
            </div>
            <div class="rs-detail-related__grid"></div>
        `;

        this.loader = this.element.querySelector('.rs-detail-related__loader');
        this.grid = this.element.querySelector('.rs-detail-related__grid');
    }

    async loadRelated() {
        try {
            const result = await RealtySoftAPI.getRelatedProperties(this.property.id, this.limit);
            // Ensure we only show up to the limit (API might return more)
            const allProperties = result.data || [];
            this.relatedProperties = allProperties.slice(0, this.limit);

            if (this.relatedProperties.length === 0) {
                this.element.style.display = 'none';
                return;
            }

            this.renderProperties();
        } catch (error) {
            console.error('Failed to load related properties:', error);
            this.element.style.display = 'none';
        } finally {
            this.loader.style.display = 'none';
        }
    }

    renderProperties() {
        this.grid.innerHTML = this.relatedProperties.map(property => this.createCard(property)).join('');

        // Bind click events
        this.grid.querySelectorAll('.rs-detail-related__card').forEach(card => {
            card.addEventListener('click', () => {
                const propertyId = card.dataset.propertyId;
                const property = this.relatedProperties.find(p => p.id == propertyId);
                if (property) {
                    RealtySoftAnalytics.trackCardClick(property);
                }
            });
        });
    }

    createCard(property) {
        const mainImage = (property.images && property.images[0]) || '/realtysoft/assets/placeholder.jpg';
        const price = RealtySoftLabels.formatPrice(property.price);

        return `
            <a href="${property.url || `/property/${property.id}`}"
               class="rs-detail-related__card"
               data-property-id="${property.id}">
                <div class="rs-detail-related__card-image">
                    <img src="${mainImage}" alt="${this.escapeHtml(property.title)}" loading="lazy">
                </div>
                <div class="rs-detail-related__card-content">
                    <div class="rs-detail-related__card-price">${price}</div>
                    <h4 class="rs-detail-related__card-title">${this.escapeHtml(property.title)}</h4>
                    <div class="rs-detail-related__card-location">${this.escapeHtml(property.location || '')}</div>
                    <div class="rs-detail-related__card-specs">
                        ${property.beds ? `<span>${property.beds} ${this.label('card_beds')}</span>` : ''}
                        ${property.baths ? `<span>${property.baths} ${this.label('card_baths')}</span>` : ''}
                        ${property.built_area ? `<span>${property.built_area} m²</span>` : ''}
                    </div>
                </div>
            </a>
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
