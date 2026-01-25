/**
 * RealtySoft Widget v2 - Built Area Component
 * Variations: 1=Min/Max inputs, 2=Range slider
 */

class RSBuiltArea extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('builtMin') || this.isLocked('builtMax');
        this.minValue = this.getFilter('builtMin');
        this.maxValue = this.getFilter('builtMax');

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        this.subscribe('filters.builtMin', (value) => {
            this.minValue = value;
            this.updateDisplay();
        });

        this.subscribe('filters.builtMax', (value) => {
            this.maxValue = value;
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-built-area', `rs-built-area--v${this.variation}`);

        switch (this.variation) {
            case '2':
                this.renderSlider();
                break;
            default:
                this.renderInputs();
        }
    }

    renderInputs() {
        this.element.innerHTML = `
            <div class="rs-built-area__wrapper">
                <label class="rs-built-area__label">${this.label('search_built_area')}</label>
                <div class="rs-built-area__inputs">
                    <div class="rs-built-area__input-group">
                        <input type="number"
                               class="rs-built-area__input rs-built-area__input--min"
                               placeholder="${this.label('search_min')}"
                               value="${this.minValue || ''}"
                               min="0"
                               step="10">
                        <span class="rs-built-area__unit">m²</span>
                    </div>
                    <span class="rs-built-area__separator">-</span>
                    <div class="rs-built-area__input-group">
                        <input type="number"
                               class="rs-built-area__input rs-built-area__input--max"
                               placeholder="${this.label('search_max')}"
                               value="${this.maxValue || ''}"
                               min="0"
                               step="10">
                        <span class="rs-built-area__unit">m²</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderSlider() {
        const minVal = this.minValue || 0;
        const maxVal = this.maxValue || 1000;

        this.element.innerHTML = `
            <div class="rs-built-area__wrapper">
                <label class="rs-built-area__label">${this.label('search_built_area')}</label>
                <div class="rs-built-area__slider-wrapper">
                    <div class="rs-built-area__slider-values">
                        <span class="rs-built-area__slider-min">${minVal} m²</span>
                        <span class="rs-built-area__slider-max">${maxVal >= 1000 ? '1000+ m²' : maxVal + ' m²'}</span>
                    </div>
                    <div class="rs-built-area__slider-track">
                        <input type="range" class="rs-built-area__slider rs-built-area__slider--min"
                               min="0" max="1000" step="10" value="${minVal}">
                        <input type="range" class="rs-built-area__slider rs-built-area__slider--max"
                               min="0" max="1000" step="10" value="${maxVal}">
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Input fields
        const minInput = this.element.querySelector('.rs-built-area__input--min');
        const maxInput = this.element.querySelector('.rs-built-area__input--max');

        if (minInput) {
            minInput.addEventListener('change', (e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                this.setFilter('builtMin', value);
            });
        }

        if (maxInput) {
            maxInput.addEventListener('change', (e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                this.setFilter('builtMax', value);
            });
        }

        // Sliders
        const minSlider = this.element.querySelector('.rs-built-area__slider--min');
        const maxSlider = this.element.querySelector('.rs-built-area__slider--max');

        if (minSlider) {
            minSlider.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (maxSlider && value > parseInt(maxSlider.value)) {
                    value = parseInt(maxSlider.value);
                    e.target.value = value;
                }
                this.setFilter('builtMin', value || null);
                this.updateSliderDisplay();
            });
        }

        if (maxSlider) {
            maxSlider.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (minSlider && value < parseInt(minSlider.value)) {
                    value = parseInt(minSlider.value);
                    e.target.value = value;
                }
                this.setFilter('builtMax', value >= 1000 ? null : value);
                this.updateSliderDisplay();
            });
        }
    }

    updateDisplay() {
        // Update inputs
        const minInput = this.element.querySelector('.rs-built-area__input--min');
        const maxInput = this.element.querySelector('.rs-built-area__input--max');

        if (minInput) minInput.value = this.minValue || '';
        if (maxInput) maxInput.value = this.maxValue || '';

        // Update sliders
        this.updateSliderDisplay();
    }

    updateSliderDisplay() {
        const minLabel = this.element.querySelector('.rs-built-area__slider-min');
        const maxLabel = this.element.querySelector('.rs-built-area__slider-max');
        const minSlider = this.element.querySelector('.rs-built-area__slider--min');
        const maxSlider = this.element.querySelector('.rs-built-area__slider--max');

        if (minLabel && minSlider) {
            minLabel.textContent = `${minSlider.value} m²`;
        }

        if (maxLabel && maxSlider) {
            const val = parseInt(maxSlider.value);
            maxLabel.textContent = val >= 1000 ? '1000+ m²' : `${val} m²`;
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_built_area', RSBuiltArea);
