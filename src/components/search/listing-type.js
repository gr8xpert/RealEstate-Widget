/**
 * RealtySoft Widget v2 - Listing Type Component
 * Variations: 1=Dropdown, 2=Checkboxes, 3=Radio Buttons
 */

class RSListingType extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('listingType');
        this.selectedTypes = new Set();
        this.selected = this.getFilter('listingType') || '';
        this.radioName = 'rs-listing-type-' + Math.random().toString(36).substr(2, 9);

        // Initialize from existing filter
        if (this.selected) {
            if (Array.isArray(this.selected)) {
                this.selected.forEach(t => this.selectedTypes.add(t));
            } else {
                this.selectedTypes.add(this.selected);
            }
        }

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        // Subscribe to filter changes
        this.subscribe('filters.listingType', (value) => {
            this.selected = value;
            this.updateDisplay();
        });
    }

    // Get listing type options
    getOptions() {
        const labels = RealtySoftState.get('data.labels') || {};
        return {
            'resale': labels.listing_type_sale || 'For Sale',
            'development': labels.listing_type_new || 'New Development',
            'long_rental': labels.listing_type_long_rental || 'Long Term Rental',
            'short_rental': labels.listing_type_short_rental || 'Holiday Rental'
        };
    }

    render() {
        this.element.classList.add('rs-listing-type', `rs-listing-type--v${this.variation}`);

        switch (this.variation) {
            case '2':
                this.renderCheckboxes();
                break;
            case '3':
                this.renderRadioButtons();
                break;
            default:
                this.renderDropdown();
        }
    }

    // VARIATION 1: Dropdown (Single Select)
    renderDropdown() {
        const options = this.getOptions();

        this.element.innerHTML = `
            <div class="rs-listing-type__wrapper">
                <label class="rs-listing-type__label">${this.label('search_listing_type')}</label>
                <div class="rs-listing-type__select-wrapper">
                    <select class="rs-listing-type__select">
                        <option value="">${this.label('search_listing_type_all') || 'All Listing Types'}</option>
                        ${Object.entries(options).map(([value, label]) =>
                            `<option value="${value}" ${this.selected === value ? 'selected' : ''}>${label}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;

        this.select = this.element.querySelector('.rs-listing-type__select');
    }

    // VARIATION 2: Checkboxes (Multi-Select)
    renderCheckboxes() {
        const options = this.getOptions();

        this.element.innerHTML = `
            <div class="rs-listing-type__wrapper">
                <label class="rs-listing-type__label">${this.label('search_listing_type')}</label>
                <div class="rs-listing-type__checkboxes">
                    ${Object.entries(options).map(([value, label]) => `
                        <label class="rs-listing-type__checkbox-wrapper">
                            <input type="checkbox"
                                   class="rs-listing-type__checkbox"
                                   value="${value}"
                                   ${this.selectedTypes.has(value) ? 'checked' : ''}>
                            <span class="rs-listing-type__checkbox-label">${label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // VARIATION 3: Radio Buttons (Single Select)
    renderRadioButtons() {
        const options = this.getOptions();

        this.element.innerHTML = `
            <div class="rs-listing-type__wrapper">
                <label class="rs-listing-type__label">${this.label('search_listing_type')}</label>
                <div class="rs-listing-type__radios">
                    <label class="rs-listing-type__radio-wrapper">
                        <input type="radio"
                               class="rs-listing-type__radio"
                               name="${this.radioName}"
                               value=""
                               ${!this.selected ? 'checked' : ''}>
                        <span class="rs-listing-type__radio-label">${this.label('search_all') || 'All'}</span>
                    </label>
                    ${Object.entries(options).map(([value, label]) => `
                        <label class="rs-listing-type__radio-wrapper">
                            <input type="radio"
                                   class="rs-listing-type__radio"
                                   name="${this.radioName}"
                                   value="${value}"
                                   ${this.selected === value ? 'checked' : ''}>
                            <span class="rs-listing-type__radio-label">${label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    bindEvents() {
        switch (this.variation) {
            case '2':
                this.bindCheckboxEvents();
                break;
            case '3':
                this.bindRadioEvents();
                break;
            default:
                this.bindDropdownEvents();
        }
    }

    bindDropdownEvents() {
        this.select.addEventListener('change', (e) => {
            const value = e.target.value;
            this.selected = value;
            this.setFilter('listingType', value || null);
        });
    }

    bindCheckboxEvents() {
        this.element.querySelectorAll('.rs-listing-type__checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const value = e.target.value;
                if (e.target.checked) {
                    this.selectedTypes.add(value);
                } else {
                    this.selectedTypes.delete(value);
                }
                this.updateListingTypeFilter();
            });
        });
    }

    bindRadioEvents() {
        this.element.querySelectorAll('.rs-listing-type__radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selected = e.target.value;
                    this.setFilter('listingType', e.target.value || null);
                }
            });
        });
    }

    updateListingTypeFilter() {
        if (this.selectedTypes.size === 0) {
            this.setFilter('listingType', null);
        } else if (this.selectedTypes.size === 1) {
            this.setFilter('listingType', Array.from(this.selectedTypes)[0]);
        } else {
            this.setFilter('listingType', Array.from(this.selectedTypes));
        }
    }

    updateDisplay() {
        // Update dropdown
        if (this.select) {
            this.select.value = this.selected || '';
        }

        // Update checkboxes
        this.element.querySelectorAll('.rs-listing-type__checkbox').forEach(checkbox => {
            checkbox.checked = this.selectedTypes.has(checkbox.value);
        });

        // Update radio buttons
        this.element.querySelectorAll('.rs-listing-type__radio').forEach(radio => {
            radio.checked = radio.value === (this.selected || '');
        });
    }
}

// Register component
RealtySoft.registerComponent('rs_listing_type', RSListingType);
