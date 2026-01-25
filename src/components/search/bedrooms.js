/**
 * RealtySoft Widget v2 - Bedrooms Component
 * Variations: 1=Dropdown, 2=Box Style, 3=Multi-Select, 4=Free Input
 */

class RSBedrooms extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('bedsMin') || this.isLocked('bedsMax');
        this.minValue = this.getFilter('bedsMin');
        this.maxValue = this.getFilter('bedsMax');
        this.maxOptions = 10;
        this.style = this.element.dataset.rsStyle || 'minimum'; // 'minimum' or 'exact'
        this.selectedValues = new Set();
        this.isOpen = false;

        // Initialize from existing filter
        if (this.minValue) {
            if (this.style === 'exact' && this.maxValue) {
                for (let i = this.minValue; i <= this.maxValue; i++) {
                    this.selectedValues.add(i);
                }
            }
        }

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        this.subscribe('filters.bedsMin', (value) => {
            this.minValue = value;
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-bedrooms', `rs-bedrooms--v${this.variation}`);

        switch (this.variation) {
            case '2':
                this.renderBoxStyle();
                break;
            case '3':
                this.renderMultiSelect();
                break;
            case '4':
                this.renderFreeInput();
                break;
            default:
                this.renderDropdown();
        }
    }

    // VARIATION 1: Dropdown
    renderDropdown() {
        const placeholder = this.label('search_bedrooms_any') || 'Any Bedrooms';

        let options = `<option value="">${placeholder}</option>`;
        for (let i = 1; i <= this.maxOptions; i++) {
            const label = this.style === 'minimum' ? `${i}+` : `${i}`;
            const selected = this.minValue === i ? 'selected' : '';
            options += `<option value="${i}" ${selected}>${label}</option>`;
        }

        this.element.innerHTML = `
            <div class="rs-bedrooms__wrapper">
                <label class="rs-bedrooms__label">${this.label('search_bedrooms')}</label>
                <div class="rs-bedrooms__select-wrapper">
                    <select class="rs-bedrooms__select">${options}</select>
                </div>
            </div>
        `;

        this.select = this.element.querySelector('.rs-bedrooms__select');
    }

    // VARIATION 2: Box Style (Horizontal Buttons)
    renderBoxStyle() {
        let buttons = '';
        for (let i = 1; i <= this.maxOptions; i++) {
            const label = this.style === 'minimum' ? `${i}+` : `${i}`;
            const active = this.minValue === i ? 'rs-bedrooms__box--active' : '';
            buttons += `<button type="button" class="rs-bedrooms__box ${active}" data-value="${i}">${label}</button>`;
        }

        this.element.innerHTML = `
            <div class="rs-bedrooms__wrapper">
                <label class="rs-bedrooms__label">${this.label('search_bedrooms')}</label>
                <div class="rs-bedrooms__boxes">${buttons}</div>
            </div>
        `;
    }

    // VARIATION 3: Multi-Select Dropdown
    renderMultiSelect() {
        const placeholder = this.label('search_bedrooms_select') || 'Select Bedrooms';
        const count = this.selectedValues.size;
        const buttonText = count > 0 ? `${count} selected` : placeholder;

        let checkboxes = '';
        for (let i = 1; i <= this.maxOptions; i++) {
            const label = this.style === 'minimum' ? `${i}+` : `${i}`;
            const checked = this.selectedValues.has(i) ? 'checked' : '';
            checkboxes += `
                <label class="rs-bedrooms__multiselect-option">
                    <input type="checkbox" class="rs-bedrooms__multiselect-checkbox" value="${i}" ${checked}>
                    <span>${label}</span>
                </label>
            `;
        }

        this.element.innerHTML = `
            <div class="rs-bedrooms__wrapper">
                <label class="rs-bedrooms__label">${this.label('search_bedrooms')}</label>
                <div class="rs-bedrooms__multiselect">
                    <button type="button" class="rs-bedrooms__multiselect-button">
                        <span class="rs-bedrooms__multiselect-text">${buttonText}</span>
                        <span class="rs-bedrooms__multiselect-arrow">▼</span>
                    </button>
                    <div class="rs-bedrooms__multiselect-dropdown" style="display: none;">
                        ${checkboxes}
                    </div>
                </div>
            </div>
        `;

        this.button = this.element.querySelector('.rs-bedrooms__multiselect-button');
        this.buttonText = this.element.querySelector('.rs-bedrooms__multiselect-text');
        this.dropdown = this.element.querySelector('.rs-bedrooms__multiselect-dropdown');
    }

    // VARIATION 4: Free Input
    renderFreeInput() {
        const placeholder = this.label('search_bedrooms_input') || 'e.g., 3';

        this.element.innerHTML = `
            <div class="rs-bedrooms__wrapper">
                <label class="rs-bedrooms__label">${this.label('search_bedrooms')}</label>
                <div class="rs-bedrooms__input-wrapper">
                    <input type="number"
                           class="rs-bedrooms__input"
                           min="0"
                           max="20"
                           placeholder="${placeholder}"
                           value="${this.minValue || ''}">
                </div>
            </div>
        `;

        this.input = this.element.querySelector('.rs-bedrooms__input');
    }

    bindEvents() {
        switch (this.variation) {
            case '2':
                this.bindBoxStyleEvents();
                break;
            case '3':
                this.bindMultiSelectEvents();
                break;
            case '4':
                this.bindFreeInputEvents();
                break;
            default:
                this.bindDropdownEvents();
        }
    }

    bindDropdownEvents() {
        this.select.addEventListener('change', (e) => {
            const value = e.target.value ? parseInt(e.target.value) : null;
            this.handleSelection(value);
        });
    }

    bindBoxStyleEvents() {
        this.element.querySelectorAll('.rs-bedrooms__box').forEach(box => {
            box.addEventListener('click', (e) => {
                e.preventDefault();
                const value = parseInt(e.target.dataset.value);
                const isActive = e.target.classList.contains('rs-bedrooms__box--active');

                // Remove active from all
                this.element.querySelectorAll('.rs-bedrooms__box').forEach(b =>
                    b.classList.remove('rs-bedrooms__box--active')
                );

                if (!isActive) {
                    e.target.classList.add('rs-bedrooms__box--active');
                    this.handleSelection(value);
                } else {
                    this.handleSelection(null);
                }
            });
        });
    }

    bindMultiSelectEvents() {
        // Toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDropdown();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Checkbox changes
        this.element.querySelectorAll('.rs-bedrooms__multiselect-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (e.target.checked) {
                    this.selectedValues.add(value);
                } else {
                    this.selectedValues.delete(value);
                }
                this.updateMultiSelectButton();
                this.updateMultiSelectFilters();
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
                this.handleSelection(value && value > 0 ? value : null);
            }, 300);
        });
    }

    handleSelection(value) {
        if (value) {
            if (this.style === 'minimum') {
                this.setFilter('bedsMin', value);
                this.setFilter('bedsMax', null);
            } else {
                this.setFilter('bedsMin', value);
                this.setFilter('bedsMax', value);
            }
        } else {
            this.setFilter('bedsMin', null);
            this.setFilter('bedsMax', null);
        }
    }

    updateMultiSelectButton() {
        if (!this.buttonText) return;
        const placeholder = this.label('search_bedrooms_select') || 'Select Bedrooms';
        const count = this.selectedValues.size;
        this.buttonText.textContent = count > 0 ? `${count} selected` : placeholder;
    }

    updateMultiSelectFilters() {
        if (this.selectedValues.size > 0) {
            const values = Array.from(this.selectedValues).sort((a, b) => a - b);
            this.setFilter('bedsMin', Math.min(...values));
            this.setFilter('bedsMax', Math.max(...values));
        } else {
            this.setFilter('bedsMin', null);
            this.setFilter('bedsMax', null);
        }
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
        // Update dropdown
        if (this.select) {
            this.select.value = this.minValue || '';
        }

        // Update box buttons
        this.element.querySelectorAll('.rs-bedrooms__box').forEach(box => {
            const boxValue = parseInt(box.dataset.value);
            box.classList.toggle('rs-bedrooms__box--active', this.minValue === boxValue);
        });

        // Update free input
        if (this.input) {
            this.input.value = this.minValue || '';
        }

        // Update multi-select (variation 3)
        if (this.variation === '3') {
            // Clear selectedValues if filter is reset
            if (!this.minValue) {
                this.selectedValues.clear();
            }
            // Update checkbox states
            this.element.querySelectorAll('.rs-bedrooms__multiselect-checkbox').forEach(checkbox => {
                const value = parseInt(checkbox.value);
                checkbox.checked = this.selectedValues.has(value);
            });
        }
        this.updateMultiSelectButton();
    }
}

// Register component
RealtySoft.registerComponent('rs_bedrooms', RSBedrooms);
