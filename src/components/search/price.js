/**
 * RealtySoft Widget v2 - Price Component
 * Variations: 1=Styled Dropdown, 2=Stacked Buttons, 3=Multi-Select, 4=Free Input
 */

class RSPrice extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('priceMin') || this.isLocked('priceMax');
        this.type = this.element.dataset.rsType || 'min'; // 'min' or 'max'
        this.minValue = this.getFilter('priceMin');
        this.maxValue = this.getFilter('priceMax');
        this.currentValue = this.type === 'min' ? this.minValue : this.maxValue;
        this.selectedValues = new Set();
        this.isOpen = false;
        this.maxVisible = 10;

        // Initialize from existing filter
        if (this.currentValue) {
            this.selectedValues.add(this.currentValue);
        }

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        this.subscribe('filters.priceMin', (value) => {
            this.minValue = value;
            if (this.type === 'min') {
                this.currentValue = value;
                this.updateDisplay();
            }
        });

        this.subscribe('filters.priceMax', (value) => {
            this.maxValue = value;
            if (this.type === 'max') {
                this.currentValue = value;
                this.updateDisplay();
            }
        });

        // Listen for listing type changes to rebuild price options
        this.subscribe('filters.listingType', () => {
            this.updatePriceOptions();
        });
    }

    // Get price options based on listing type
    getPriceOptions() {
        const listingType = this.getFilter('listingType') || 'resale';

        const defaultPriceRanges = {
            resale: {
                min: [50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000, 20000000],
                max: [100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000, 20000000, 50000000]
            },
            development: {
                min: [50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000, 20000000],
                max: [100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000, 20000000, 50000000]
            },
            long_rental: {
                min: [500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 5000, 10000, 25000],
                max: [750, 1000, 1250, 1500, 2000, 2500, 3000, 5000, 10000, 25000, 50000]
            },
            short_rental: {
                min: [250, 350, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 5000, 10000, 25000],
                max: [350, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 5000, 10000, 25000, 50000]
            }
        };

        const priceRange = defaultPriceRanges[listingType] || defaultPriceRanges.resale;
        return priceRange[this.type] || priceRange.min;
    }

    // Format price (short format)
    formatPrice(price) {
        const listingType = this.getFilter('listingType') || 'resale';
        let suffix = '';
        if (listingType === 'long_rental') suffix = '/month';
        else if (listingType === 'short_rental') suffix = '/week';

        if (price >= 1000000) return `€${price / 1000000}M${suffix}`;
        if (price >= 1000) return `€${price / 1000}K${suffix}`;
        return `€${price.toLocaleString()}${suffix}`;
    }

    // Format price (full format)
    formatPriceFull(price) {
        const listingType = this.getFilter('listingType') || 'resale';
        let suffix = '';
        if (listingType === 'long_rental') suffix = '/month';
        else if (listingType === 'short_rental') suffix = '/week';

        return `€${price.toLocaleString()}${suffix}`;
    }

    render() {
        this.element.classList.add('rs-price', `rs-price--v${this.variation}`, `rs-price--${this.type}`);

        switch (this.variation) {
            case '2':
                this.renderStackedButtons();
                break;
            case '3':
                this.renderMultiSelect();
                break;
            case '4':
                this.renderFreeInput();
                break;
            default:
                this.renderStyledDropdown();
        }
    }

    // VARIATION 1: Styled Dropdown
    renderStyledDropdown() {
        const placeholder = this.type === 'min'
            ? (this.label('search_price_min') || 'Min. Price')
            : (this.label('search_price_max') || 'Max. Price');

        const options = this.getPriceOptions();

        let optionsHtml = `<option value="">${placeholder}</option>`;
        options.forEach(price => {
            const selected = this.currentValue === price ? 'selected' : '';
            optionsHtml += `<option value="${price}" ${selected}>${this.formatPriceFull(price)}</option>`;
        });

        this.element.innerHTML = `
            <div class="rs-price__wrapper">
                <label class="rs-price__label">${this.type === 'min' ? this.label('search_price_min') : this.label('search_price_max')}</label>
                <div class="rs-price__select-wrapper">
                    <select class="rs-price__select">${optionsHtml}</select>
                </div>
            </div>
        `;

        this.select = this.element.querySelector('.rs-price__select');
    }

    // VARIATION 2: Stacked Buttons
    renderStackedButtons() {
        const placeholder = this.type === 'min'
            ? (this.label('search_price_min') || 'Min. Price')
            : (this.label('search_price_max') || 'Max. Price');

        const options = this.getPriceOptions();
        const buttonText = this.currentValue ? this.formatPriceFull(this.currentValue) : placeholder;

        let buttonsHtml = `
            <button type="button" class="rs-price__option" data-value="">
                <span class="rs-price__option-text">${placeholder}</span>
            </button>
        `;

        options.slice(0, this.maxVisible).forEach(price => {
            const active = this.currentValue === price ? 'rs-price__option--active' : '';
            buttonsHtml += `
                <button type="button" class="rs-price__option ${active}" data-value="${price}">
                    <span class="rs-price__option-text">${this.formatPriceFull(price)}</span>
                </button>
            `;
        });

        this.element.innerHTML = `
            <div class="rs-price__wrapper">
                <label class="rs-price__label">${this.type === 'min' ? this.label('search_price_min') : this.label('search_price_max')}</label>
                <div class="rs-price__stacked">
                    <button type="button" class="rs-price__toggle ${this.currentValue ? 'rs-price__toggle--has-selection' : ''}">
                        <span class="rs-price__toggle-text">${buttonText}</span>
                        <span class="rs-price__toggle-arrow">▼</span>
                    </button>
                    <div class="rs-price__dropdown" style="display: none;">
                        ${buttonsHtml}
                    </div>
                </div>
            </div>
        `;

        this.toggleBtn = this.element.querySelector('.rs-price__toggle');
        this.toggleText = this.element.querySelector('.rs-price__toggle-text');
        this.dropdown = this.element.querySelector('.rs-price__dropdown');
    }

    // VARIATION 3: Multi-Select Dropdown
    renderMultiSelect() {
        const placeholder = this.type === 'min'
            ? (this.label('search_price_select_min') || 'Select Min Prices')
            : (this.label('search_price_select_max') || 'Select Max Prices');

        const options = this.getPriceOptions();
        const count = this.selectedValues.size;
        const buttonText = count > 0 ? count + ' selected' : placeholder;

        let checkboxesHtml = '';
        options.forEach(price => {
            const checked = this.selectedValues.has(price) ? 'checked' : '';
            checkboxesHtml += `
                <label class="rs-price__multiselect-option">
                    <input type="checkbox" class="rs-price__multiselect-checkbox" value="${price}" ${checked}>
                    <span>${this.formatPriceFull(price)}</span>
                </label>
            `;
        });

        this.element.innerHTML = `
            <div class="rs-price__wrapper">
                <label class="rs-price__label">${this.type === 'min' ? this.label('search_price_min') : this.label('search_price_max')}</label>
                <div class="rs-price__multiselect">
                    <button type="button" class="rs-price__multiselect-button">
                        <span class="rs-price__multiselect-text">${buttonText}</span>
                        <span class="rs-price__multiselect-arrow">▼</span>
                    </button>
                    <div class="rs-price__multiselect-dropdown" style="display: none;">
                        ${checkboxesHtml}
                    </div>
                </div>
            </div>
        `;

        this.button = this.element.querySelector('.rs-price__multiselect-button');
        this.buttonText = this.element.querySelector('.rs-price__multiselect-text');
        this.dropdown = this.element.querySelector('.rs-price__multiselect-dropdown');
    }

    // VARIATION 4: Free Input
    renderFreeInput() {
        const placeholder = this.type === 'min'
            ? (this.label('search_price_input_min') || 'Min. Price (e.g., 200000)')
            : (this.label('search_price_input_max') || 'Max. Price (e.g., 500000)');

        this.element.innerHTML = `
            <div class="rs-price__wrapper">
                <label class="rs-price__label">${this.type === 'min' ? this.label('search_price_min') : this.label('search_price_max')}</label>
                <div class="rs-price__input-wrapper">
                    <span class="rs-price__currency">€</span>
                    <input type="number"
                           class="rs-price__input"
                           min="0"
                           step="10000"
                           placeholder="${placeholder}"
                           value="${this.currentValue || ''}">
                </div>
            </div>
        `;

        this.input = this.element.querySelector('.rs-price__input');
    }

    bindEvents() {
        switch (this.variation) {
            case '2':
                this.bindStackedButtonsEvents();
                break;
            case '3':
                this.bindMultiSelectEvents();
                break;
            case '4':
                this.bindFreeInputEvents();
                break;
            default:
                this.bindStyledDropdownEvents();
        }

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    bindStyledDropdownEvents() {
        this.select.addEventListener('change', (e) => {
            const value = e.target.value ? parseInt(e.target.value) : null;
            this.setValue(value);
        });
    }

    bindStackedButtonsEvents() {
        // Toggle dropdown
        this.toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Option selection
        this.dropdown.addEventListener('click', (e) => {
            const optionBtn = e.target.closest('.rs-price__option');
            if (!optionBtn) return;

            e.preventDefault();
            const value = optionBtn.dataset.value ? parseInt(optionBtn.dataset.value) : null;

            // Update active state
            this.dropdown.querySelectorAll('.rs-price__option').forEach(b =>
                b.classList.remove('rs-price__option--active')
            );
            if (value) {
                optionBtn.classList.add('rs-price__option--active');
            }

            // Update toggle button
            const placeholder = this.type === 'min'
                ? (this.label('search_price_min') || 'Min. Price')
                : (this.label('search_price_max') || 'Max. Price');

            if (value) {
                this.toggleText.textContent = this.formatPriceFull(value);
                this.toggleBtn.classList.add('rs-price__toggle--has-selection');
            } else {
                this.toggleText.textContent = placeholder;
                this.toggleBtn.classList.remove('rs-price__toggle--has-selection');
            }

            this.hideDropdown();
            this.setValue(value);
        });
    }

    bindMultiSelectEvents() {
        // Toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDropdown();
        });

        // Checkbox changes
        this.element.querySelectorAll('.rs-price__multiselect-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (e.target.checked) {
                    this.selectedValues.add(value);
                } else {
                    this.selectedValues.delete(value);
                }
                this.updateMultiSelectButton();
                this.updateMultiSelectFilter();
            });
        });
    }

    bindFreeInputEvents() {
        // Debounce input
        let timeout;
        this.input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const value = parseInt(e.target.value);
                this.setValue(value && value > 0 ? value : null);
            }, 300);
        });

        // Format on blur
        this.input.addEventListener('blur', (e) => {
            const value = parseInt(e.target.value);
            if (value && value > 0) {
                e.target.value = value;
            }
        });
    }

    setValue(value) {
        this.currentValue = value;
        const filterKey = this.type === 'min' ? 'priceMin' : 'priceMax';
        this.setFilter(filterKey, value);
    }

    updateMultiSelectButton() {
        if (!this.buttonText) return;
        const placeholder = this.type === 'min'
            ? (this.label('search_price_select_min') || 'Select Min Prices')
            : (this.label('search_price_select_max') || 'Select Max Prices');
        const count = this.selectedValues.size;
        this.buttonText.textContent = count > 0 ? count + ' selected' : placeholder;
    }

    updateMultiSelectFilter() {
        if (this.selectedValues.size > 0) {
            const values = Array.from(this.selectedValues).sort((a, b) => a - b);
            const filterValue = this.type === 'min' ? Math.min(...values) : Math.max(...values);
            this.setValue(filterValue);
        } else {
            this.setValue(null);
        }
    }

    updatePriceOptions() {
        // Re-render when listing type changes
        this.render();
        this.bindEvents();
    }

    showDropdown() {
        if (!this.dropdown) return;
        this.isOpen = true;
        this.dropdown.style.display = 'block';
    }

    hideDropdown() {
        if (!this.dropdown) return;
        this.isOpen = false;
        this.dropdown.style.display = 'none';
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.hideDropdown();
        } else {
            this.showDropdown();
        }
    }

    updateDisplay() {
        // Update styled dropdown
        if (this.select) {
            this.select.value = this.currentValue || '';
        }

        // Update stacked buttons toggle
        if (this.toggleText) {
            const placeholder = this.type === 'min'
                ? (this.label('search_price_min') || 'Min. Price')
                : (this.label('search_price_max') || 'Max. Price');

            if (this.currentValue) {
                this.toggleText.textContent = this.formatPriceFull(this.currentValue);
                this.toggleBtn.classList.add('rs-price__toggle--has-selection');
            } else {
                this.toggleText.textContent = placeholder;
                this.toggleBtn.classList.remove('rs-price__toggle--has-selection');
            }
        }

        // Update free input
        if (this.input) {
            this.input.value = this.currentValue || '';
        }

        // Update multi-select (variation 3)
        if (this.variation === '3') {
            // Clear selectedValues if filter is reset
            if (!this.currentValue) {
                this.selectedValues.clear();
            }
            // Update checkbox states
            this.element.querySelectorAll('.rs-price__multiselect-checkbox').forEach(checkbox => {
                const value = parseInt(checkbox.value);
                checkbox.checked = this.selectedValues.has(value);
            });
        }
        this.updateMultiSelectButton();
    }
}

// Register component
RealtySoft.registerComponent('rs_price', RSPrice);
