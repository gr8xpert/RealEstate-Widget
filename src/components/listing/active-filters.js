/**
 * RealtySoft Widget v2 - Active Filters Component
 * Displays active filter tags that can be removed
 */

class RSActiveFilters extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.filters = {};

        this.render();
        this.bindEvents();

        // Subscribe to all filter changes
        this.subscribe('filters', () => {
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-active-filters');
        this.updateDisplay();
    }

    bindEvents() {
        this.element.addEventListener('click', (e) => {
            const tag = e.target.closest('.rs-active-filters__tag');
            if (tag) {
                const filterName = tag.dataset.filter;
                this.removeFilter(filterName);
            }

            const clearAll = e.target.closest('.rs-active-filters__clear-all');
            if (clearAll) {
                RealtySoft.reset();
            }
        });
    }

    removeFilter(filterName) {
        if (RealtySoftState.isFilterLocked(filterName)) return;

        // Map filter names to their default values
        const defaults = {
            location: null,
            locationName: '',
            listingType: null,
            propertyType: null,
            propertyTypeName: '',
            bedsMin: null,
            bedsMax: null,
            bathsMin: null,
            bathsMax: null,
            priceMin: null,
            priceMax: null,
            builtMin: null,
            builtMax: null,
            plotMin: null,
            plotMax: null,
            features: [],
            ref: ''
        };

        // Handle paired filters
        if (filterName === 'beds') {
            RealtySoft.setFilter('bedsMin', defaults.bedsMin);
            RealtySoft.setFilter('bedsMax', defaults.bedsMax);
        } else if (filterName === 'baths') {
            RealtySoft.setFilter('bathsMin', defaults.bathsMin);
            RealtySoft.setFilter('bathsMax', defaults.bathsMax);
        } else if (filterName === 'price') {
            RealtySoft.setFilter('priceMin', defaults.priceMin);
            RealtySoft.setFilter('priceMax', defaults.priceMax);
        } else if (filterName === 'built') {
            RealtySoft.setFilter('builtMin', defaults.builtMin);
            RealtySoft.setFilter('builtMax', defaults.builtMax);
        } else if (filterName === 'plot') {
            RealtySoft.setFilter('plotMin', defaults.plotMin);
            RealtySoft.setFilter('plotMax', defaults.plotMax);
        } else if (defaults.hasOwnProperty(filterName)) {
            RealtySoft.setFilter(filterName, defaults[filterName]);
            // Also reset name field if applicable
            if (filterName === 'location') RealtySoft.setFilter('locationName', '');
            if (filterName === 'propertyType') RealtySoft.setFilter('propertyTypeName', '');
        }

        // Trigger new search
        RealtySoft.search();
    }

    getActiveFilters() {
        const filters = RealtySoftState.get('filters');
        const active = [];

        // Location
        if (filters.location && !RealtySoftState.isFilterLocked('location')) {
            active.push({
                name: 'location',
                label: this.label('search_location'),
                value: filters.locationName || filters.location
            });
        }

        // Listing type (show when selected)
        if (filters.listingType && !RealtySoftState.isFilterLocked('listingType')) {
            const listingTypeLabels = {
                'resale': this.label('listing_type_sale') || 'For Sale',
                'development': this.label('listing_type_new') || 'New Development',
                'long_rental': this.label('listing_type_long_rental') || 'Long Term Rental',
                'short_rental': this.label('listing_type_short_rental') || 'Holiday Rental'
            };
            const displayValue = Array.isArray(filters.listingType)
                ? filters.listingType.map(t => listingTypeLabels[t] || t).join(', ')
                : listingTypeLabels[filters.listingType] || filters.listingType;
            active.push({
                name: 'listingType',
                label: this.label('search_listing_type'),
                value: displayValue
            });
        }

        // Property type
        if (filters.propertyType && !RealtySoftState.isFilterLocked('propertyType')) {
            active.push({
                name: 'propertyType',
                label: this.label('search_property_type'),
                value: filters.propertyTypeName || filters.propertyType
            });
        }

        // Bedrooms
        if ((filters.bedsMin || filters.bedsMax) && !RealtySoftState.isFilterLocked('bedsMin')) {
            let value = '';
            if (filters.bedsMin && filters.bedsMax) {
                value = `${filters.bedsMin} - ${filters.bedsMax}`;
            } else if (filters.bedsMin) {
                value = `${filters.bedsMin}+`;
            } else {
                value = `≤ ${filters.bedsMax}`;
            }
            active.push({
                name: 'beds',
                label: this.label('search_bedrooms'),
                value: value
            });
        }

        // Bathrooms
        if ((filters.bathsMin || filters.bathsMax) && !RealtySoftState.isFilterLocked('bathsMin')) {
            let value = '';
            if (filters.bathsMin && filters.bathsMax) {
                value = `${filters.bathsMin} - ${filters.bathsMax}`;
            } else if (filters.bathsMin) {
                value = `${filters.bathsMin}+`;
            } else {
                value = `≤ ${filters.bathsMax}`;
            }
            active.push({
                name: 'baths',
                label: this.label('search_bathrooms'),
                value: value
            });
        }

        // Price
        if ((filters.priceMin || filters.priceMax) && !RealtySoftState.isFilterLocked('priceMin')) {
            let value = '';
            if (filters.priceMin && filters.priceMax) {
                value = `${RealtySoftLabels.formatPrice(filters.priceMin)} - ${RealtySoftLabels.formatPrice(filters.priceMax)}`;
            } else if (filters.priceMin) {
                value = `≥ ${RealtySoftLabels.formatPrice(filters.priceMin)}`;
            } else {
                value = `≤ ${RealtySoftLabels.formatPrice(filters.priceMax)}`;
            }
            active.push({
                name: 'price',
                label: this.label('search_price'),
                value: value
            });
        }

        // Built area
        if ((filters.builtMin || filters.builtMax) && !RealtySoftState.isFilterLocked('builtMin')) {
            let value = '';
            if (filters.builtMin && filters.builtMax) {
                value = `${filters.builtMin} - ${filters.builtMax} m²`;
            } else if (filters.builtMin) {
                value = `≥ ${filters.builtMin} m²`;
            } else {
                value = `≤ ${filters.builtMax} m²`;
            }
            active.push({
                name: 'built',
                label: this.label('search_built_area'),
                value: value
            });
        }

        // Plot size
        if ((filters.plotMin || filters.plotMax) && !RealtySoftState.isFilterLocked('plotMin')) {
            let value = '';
            if (filters.plotMin && filters.plotMax) {
                value = `${filters.plotMin} - ${filters.plotMax} m²`;
            } else if (filters.plotMin) {
                value = `≥ ${filters.plotMin} m²`;
            } else {
                value = `≤ ${filters.plotMax} m²`;
            }
            active.push({
                name: 'plot',
                label: this.label('search_plot_size'),
                value: value
            });
        }

        // Features
        if (filters.features && filters.features.length && !RealtySoftState.isFilterLocked('features')) {
            const featureNames = filters.features.map(id => {
                const feature = RealtySoftState.get('data.features').find(f => f.id === id);
                return feature ? feature.name : id;
            });
            active.push({
                name: 'features',
                label: this.label('search_features'),
                value: featureNames.join(', ')
            });
        }

        // Reference
        if (filters.ref && !RealtySoftState.isFilterLocked('ref')) {
            active.push({
                name: 'ref',
                label: this.label('search_reference'),
                value: filters.ref
            });
        }

        return active;
    }

    updateDisplay() {
        const active = this.getActiveFilters();

        if (active.length === 0) {
            this.element.innerHTML = '';
            this.element.style.display = 'none';
            return;
        }

        this.element.style.display = 'block';
        this.element.innerHTML = `
            <div class="rs-active-filters__wrapper">
                <div class="rs-active-filters__tags">
                    ${active.map(filter => `
                        <button type="button"
                                class="rs-active-filters__tag"
                                data-filter="${filter.name}">
                            <span class="rs-active-filters__tag-label">${filter.label}:</span>
                            <span class="rs-active-filters__tag-value">${this.escapeHtml(filter.value)}</span>
                            <span class="rs-active-filters__tag-remove">&times;</span>
                        </button>
                    `).join('')}
                </div>
                ${active.length > 1 ? `
                    <button type="button" class="rs-active-filters__clear-all">
                        ${this.label('search_reset')}
                    </button>
                ` : ''}
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Register component
RealtySoft.registerComponent('rs_active_filters', RSActiveFilters);
