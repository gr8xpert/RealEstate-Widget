/**
 * RealtySoft Widget v2 - Plot Size Component
 * Variations: 1=Min/Max inputs, 2=Range slider
 */

class RSPlotSize extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('plotMin') || this.isLocked('plotMax');
        this.minValue = this.getFilter('plotMin');
        this.maxValue = this.getFilter('plotMax');

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        this.subscribe('filters.plotMin', (value) => {
            this.minValue = value;
            this.updateDisplay();
        });

        this.subscribe('filters.plotMax', (value) => {
            this.maxValue = value;
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-plot-size', `rs-plot-size--v${this.variation}`);

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
            <div class="rs-plot-size__wrapper">
                <label class="rs-plot-size__label">${this.label('search_plot_size')}</label>
                <div class="rs-plot-size__inputs">
                    <div class="rs-plot-size__input-group">
                        <input type="number"
                               class="rs-plot-size__input rs-plot-size__input--min"
                               placeholder="${this.label('search_min')}"
                               value="${this.minValue || ''}"
                               min="0"
                               step="100">
                        <span class="rs-plot-size__unit">m²</span>
                    </div>
                    <span class="rs-plot-size__separator">-</span>
                    <div class="rs-plot-size__input-group">
                        <input type="number"
                               class="rs-plot-size__input rs-plot-size__input--max"
                               placeholder="${this.label('search_max')}"
                               value="${this.maxValue || ''}"
                               min="0"
                               step="100">
                        <span class="rs-plot-size__unit">m²</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderSlider() {
        const minVal = this.minValue || 0;
        const maxVal = this.maxValue || 10000;

        this.element.innerHTML = `
            <div class="rs-plot-size__wrapper">
                <label class="rs-plot-size__label">${this.label('search_plot_size')}</label>
                <div class="rs-plot-size__slider-wrapper">
                    <div class="rs-plot-size__slider-values">
                        <span class="rs-plot-size__slider-min">${this.formatArea(minVal)}</span>
                        <span class="rs-plot-size__slider-max">${maxVal >= 10000 ? '10,000+ m²' : this.formatArea(maxVal)}</span>
                    </div>
                    <div class="rs-plot-size__slider-track">
                        <input type="range" class="rs-plot-size__slider rs-plot-size__slider--min"
                               min="0" max="10000" step="100" value="${minVal}">
                        <input type="range" class="rs-plot-size__slider rs-plot-size__slider--max"
                               min="0" max="10000" step="100" value="${maxVal}">
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Input fields
        const minInput = this.element.querySelector('.rs-plot-size__input--min');
        const maxInput = this.element.querySelector('.rs-plot-size__input--max');

        if (minInput) {
            minInput.addEventListener('change', (e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                this.setFilter('plotMin', value);
            });
        }

        if (maxInput) {
            maxInput.addEventListener('change', (e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                this.setFilter('plotMax', value);
            });
        }

        // Sliders
        const minSlider = this.element.querySelector('.rs-plot-size__slider--min');
        const maxSlider = this.element.querySelector('.rs-plot-size__slider--max');

        if (minSlider) {
            minSlider.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (maxSlider && value > parseInt(maxSlider.value)) {
                    value = parseInt(maxSlider.value);
                    e.target.value = value;
                }
                this.setFilter('plotMin', value || null);
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
                this.setFilter('plotMax', value >= 10000 ? null : value);
                this.updateSliderDisplay();
            });
        }
    }

    formatArea(value) {
        if (!value) return '0 m²';
        return `${value.toLocaleString()} m²`;
    }

    updateDisplay() {
        // Update inputs
        const minInput = this.element.querySelector('.rs-plot-size__input--min');
        const maxInput = this.element.querySelector('.rs-plot-size__input--max');

        if (minInput) minInput.value = this.minValue || '';
        if (maxInput) maxInput.value = this.maxValue || '';

        // Update sliders
        this.updateSliderDisplay();
    }

    updateSliderDisplay() {
        const minLabel = this.element.querySelector('.rs-plot-size__slider-min');
        const maxLabel = this.element.querySelector('.rs-plot-size__slider-max');
        const minSlider = this.element.querySelector('.rs-plot-size__slider--min');
        const maxSlider = this.element.querySelector('.rs-plot-size__slider--max');

        if (minLabel && minSlider) {
            minLabel.textContent = this.formatArea(parseInt(minSlider.value));
        }

        if (maxLabel && maxSlider) {
            const val = parseInt(maxSlider.value);
            maxLabel.textContent = val >= 10000 ? '10,000+ m²' : this.formatArea(val);
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_plot_size', RSPlotSize);
