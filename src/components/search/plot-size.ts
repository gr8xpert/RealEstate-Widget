/**
 * RealtySoft Widget v3 - Plot Size Component
 * Variations: 1=Min/Max inputs, 2=Range slider
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

class RSPlotSize extends RSBaseComponent {
  private lockedMode: boolean = false;
  private minValue: number | null = null;
  private maxValue: number | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('plotMin') || this.isLocked('plotMax');
    this.minValue = this.getFilter<number | null>('plotMin');
    this.maxValue = this.getFilter<number | null>('plotMax');

    this.render();

    // Apply locked styles if locked (but still show the component)
    if (this.lockedMode) {
      this.applyLockedStyle();
    } else {
      this.bindEvents();
    }

    this.subscribe<number | null>('filters.plotMin', (value) => {
      this.minValue = value;
      this.updateDisplay();
    });

    this.subscribe<number | null>('filters.plotMax', (value) => {
      this.maxValue = value;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-plot-size', `rs-plot-size--v${this.variation}`);

    switch (this.variation) {
      case '2':
        this.renderSlider();
        break;
      default:
        this.renderInputs();
    }
  }

  private renderInputs(): void {
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

  private renderSlider(): void {
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

  bindEvents(): void {
    // Input fields
    const minInput = this.element.querySelector<HTMLInputElement>('.rs-plot-size__input--min');
    const maxInput = this.element.querySelector<HTMLInputElement>('.rs-plot-size__input--max');

    if (minInput) {
      minInput.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value ? parseInt(target.value) : null;
        this.setFilter('plotMin', value);
      });
    }

    if (maxInput) {
      maxInput.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value ? parseInt(target.value) : null;
        this.setFilter('plotMax', value);
      });
    }

    // Sliders
    const minSlider = this.element.querySelector<HTMLInputElement>('.rs-plot-size__slider--min');
    const maxSlider = this.element.querySelector<HTMLInputElement>('.rs-plot-size__slider--max');

    if (minSlider) {
      minSlider.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        let value = parseInt(target.value);
        if (maxSlider && value > parseInt(maxSlider.value)) {
          value = parseInt(maxSlider.value);
          target.value = String(value);
        }
        this.setFilter('plotMin', value || null);
        this.updateSliderDisplay();
      });
    }

    if (maxSlider) {
      maxSlider.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        let value = parseInt(target.value);
        if (minSlider && value < parseInt(minSlider.value)) {
          value = parseInt(minSlider.value);
          target.value = String(value);
        }
        this.setFilter('plotMax', value >= 10000 ? null : value);
        this.updateSliderDisplay();
      });
    }
  }

  private formatArea(value: number): string {
    if (!value) return '0 m²';
    return `${value.toLocaleString()} m²`;
  }

  private updateDisplay(): void {
    // Update inputs
    const minInput = this.element.querySelector<HTMLInputElement>('.rs-plot-size__input--min');
    const maxInput = this.element.querySelector<HTMLInputElement>('.rs-plot-size__input--max');

    if (minInput) minInput.value = this.minValue?.toString() || '';
    if (maxInput) maxInput.value = this.maxValue?.toString() || '';

    // Update sliders
    this.updateSliderDisplay();
  }

  private updateSliderDisplay(): void {
    const minLabel = this.element.querySelector('.rs-plot-size__slider-min');
    const maxLabel = this.element.querySelector('.rs-plot-size__slider-max');
    const minSlider = this.element.querySelector<HTMLInputElement>('.rs-plot-size__slider--min');
    const maxSlider = this.element.querySelector<HTMLInputElement>('.rs-plot-size__slider--max');

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
RealtySoft.registerComponent('rs_plot_size', RSPlotSize as unknown as ComponentConstructor);

export { RSPlotSize };
export default RSPlotSize;
