/**
 * RealtySoft Widget v3 - Price Component
 * Variations: 1=Styled Dropdown, 2=Stacked Buttons, 3=Combined Min/Max Dropdown, 4=Free Input
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule, RealtySoftStateModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;

interface PriceRanges {
  min: number[];
  max: number[];
}

interface DefaultPriceRanges {
  [key: string]: PriceRanges;
}

class RSPrice extends RSBaseComponent {
  private lockedMode: boolean = false;
  private type: 'min' | 'max' = 'min';
  private minValue: number | null = null;
  private maxValue: number | null = null;
  private currentValue: number | null = null;
  private selectedValues: Set<number> = new Set();
  private isOpen: boolean = false;
  private maxVisible: number = 10;
  private select: HTMLSelectElement | null = null;
  private input: HTMLInputElement | null = null;
  private button: HTMLButtonElement | null = null;
  private buttonText: HTMLElement | null = null;
  private dropdown: HTMLElement | null = null;
  private toggleBtn: HTMLButtonElement | null = null;
  private toggleText: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('priceMin') || this.isLocked('priceMax');
    this.type = (this.element.dataset.rsType as 'min' | 'max') || 'min';
    this.minValue = this.getFilter<number | null>('priceMin');
    this.maxValue = this.getFilter<number | null>('priceMax');
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

    this.subscribe<number | null>('filters.priceMin', (value) => {
      this.minValue = value;
      if (this.variation === '3') {
        // Combined dropdown: re-render to filter max options
        this.updatePriceOptions();
      } else if (this.type === 'min') {
        this.currentValue = value;
        this.updateDisplay();
      } else if (this.type === 'max') {
        // Re-render max options when min changes (filter out invalid prices)
        this.updatePriceOptions();
      }
    });

    this.subscribe<number | null>('filters.priceMax', (value) => {
      this.maxValue = value;
      if (this.variation === '3') {
        // Combined dropdown: re-render to filter min options
        this.updatePriceOptions();
      } else if (this.type === 'max') {
        this.currentValue = value;
        this.updateDisplay();
      } else if (this.type === 'min') {
        // Re-render min options when max changes (filter out invalid prices)
        this.updatePriceOptions();
      }
    });

    // Listen for listing type changes to rebuild price options
    this.subscribe<string | null>('filters.listingType', () => {
      this.updatePriceOptions();
    });

    // Listen for custom price ranges loaded from API (per-client configuration)
    this.subscribe<Record<string, { min?: number[]; max?: number[] }> | null>('data.priceRanges', () => {
      this.updatePriceOptions();
    });
  }

  // Get price options based on listing type (filtered by opposite selection)
  private getPriceOptions(forType?: 'min' | 'max'): number[] {
    const type = forType || this.type;
    const listingType = this.getFilter<string>('listingType') || 'resale';

    // Check for custom price ranges from API (per-client configuration)
    const customPriceRanges = RealtySoftState.get<Record<string, { min?: number[]; max?: number[] }>>('data.priceRanges');

    const defaultPriceRanges: DefaultPriceRanges = {
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

    // Use custom ranges if available for this listing type, otherwise use defaults
    let priceRange: PriceRanges;
    if (customPriceRanges && customPriceRanges[listingType]) {
      const customRange = customPriceRanges[listingType];
      const defaultRange = defaultPriceRanges[listingType] || defaultPriceRanges.resale;
      priceRange = {
        min: customRange.min && customRange.min.length > 0 ? customRange.min : defaultRange.min,
        max: customRange.max && customRange.max.length > 0 ? customRange.max : defaultRange.max
      };
    } else {
      priceRange = defaultPriceRanges[listingType] || defaultPriceRanges.resale;
    }

    let options = priceRange[type] || priceRange.min;

    // Filter options based on opposite selection
    // Max options: remove prices <= minValue
    // Min options: remove prices >= maxValue
    if (type === 'max' && this.minValue) {
      options = options.filter(price => price > this.minValue!);
    } else if (type === 'min' && this.maxValue) {
      options = options.filter(price => price < this.maxValue!);
    }

    return options;
  }

  // Format price (short format)
  private formatPrice(price: number): string {
    if (price >= 1000000) return `€${price / 1000000}M`;
    if (price >= 1000) return `€${price / 1000}K`;
    return `€${price.toLocaleString()}`;
  }

  // Format price (full format)
  private formatPriceFull(price: number): string {
    return `€${price.toLocaleString()}`;
  }

  render(): void {
    this.element.classList.add('rs-price', `rs-price--v${this.variation}`, `rs-price--${this.type}`);

    switch (this.variation) {
      case '2':
        this.renderStackedButtons();
        break;
      case '3':
        this.renderCombinedDropdown();
        break;
      case '4':
        this.renderFreeInput();
        break;
      default:
        this.renderStyledDropdown();
    }
  }

  // VARIATION 1: Styled Dropdown
  private renderStyledDropdown(): void {
    const placeholder = this.type === 'min'
      ? (this.label('search_price_min') || 'Min. Price')
      : (this.label('search_price_max') || 'Max. Price');

    const options = this.getPriceOptions();

    // If current value exists but isn't in options, add it
    if (this.currentValue && !options.includes(this.currentValue)) {
      options.push(this.currentValue);
      options.sort((a, b) => a - b);
    }

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
  private renderStackedButtons(): void {
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

  // VARIATION 3: Combined Min/Max Dropdown (both columns in one panel)
  private renderCombinedDropdown(): void {
    const minLabel = this.label('search_price_min') || 'Min. Price';
    const maxLabel = this.label('search_price_max') || 'Max. Price';

    // Get filtered price options for both min and max
    const minOptions = this.getPriceOptions('min');
    const maxOptions = this.getPriceOptions('max');

    // Build button text
    let buttonText = `${minLabel} - ${maxLabel}`;
    if (this.minValue && this.maxValue) {
      buttonText = `${this.formatPriceFull(this.minValue)} - ${this.formatPriceFull(this.maxValue)}`;
    } else if (this.minValue) {
      buttonText = `${this.formatPriceFull(this.minValue)} - ${maxLabel}`;
    } else if (this.maxValue) {
      buttonText = `${minLabel} - ${this.formatPriceFull(this.maxValue)}`;
    }

    // Build min column options (filtered: excludes prices >= maxValue)
    let minOptionsHtml = '';
    minOptions.forEach(price => {
      const active = this.minValue === price ? 'rs-price__combined-option--active' : '';
      minOptionsHtml += `
        <button type="button" class="rs-price__combined-option ${active}" data-type="min" data-value="${price}">
          ${this.formatPriceFull(price)}
        </button>
      `;
    });

    // Build max column options (filtered: excludes prices <= minValue)
    let maxOptionsHtml = '';
    maxOptions.forEach(price => {
      const active = this.maxValue === price ? 'rs-price__combined-option--active' : '';
      maxOptionsHtml += `
        <button type="button" class="rs-price__combined-option ${active}" data-type="max" data-value="${price}">
          ${this.formatPriceFull(price)}
        </button>
      `;
    });

    this.element.innerHTML = `
      <div class="rs-price__wrapper">
        <div class="rs-price__combined">
          <button type="button" class="rs-price__combined-toggle ${(this.minValue || this.maxValue) ? 'rs-price__combined-toggle--has-selection' : ''}">
            <span class="rs-price__combined-text">${buttonText}</span>
            <span class="rs-price__combined-arrow">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
          <div class="rs-price__combined-dropdown" style="display: none;">
            <div class="rs-price__combined-columns">
              <div class="rs-price__combined-column">
                <div class="rs-price__combined-header">${minLabel}</div>
                <div class="rs-price__combined-options">
                  ${minOptionsHtml}
                </div>
              </div>
              <div class="rs-price__combined-column">
                <div class="rs-price__combined-header">${maxLabel}</div>
                <div class="rs-price__combined-options">
                  ${maxOptionsHtml}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.button = this.element.querySelector('.rs-price__combined-toggle');
    this.buttonText = this.element.querySelector('.rs-price__combined-text');
    this.dropdown = this.element.querySelector('.rs-price__combined-dropdown');
  }

  // VARIATION 4: Free Input
  private renderFreeInput(): void {
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

  bindEvents(): void {
    switch (this.variation) {
      case '2':
        this.bindStackedButtonsEvents();
        break;
      case '3':
        this.bindCombinedDropdownEvents();
        break;
      case '4':
        this.bindFreeInputEvents();
        break;
      default:
        this.bindStyledDropdownEvents();
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e: Event) => {
      if (!this.element.contains(e.target as Node)) {
        this.hideDropdown();
      }
    });
  }

  private bindStyledDropdownEvents(): void {
    if (this.select) {
      this.select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const value = target.value ? parseInt(target.value) : null;
        this.setValue(value);
      });
    }
  }

  private bindStackedButtonsEvents(): void {
    // Toggle dropdown
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    // Option selection
    if (this.dropdown) {
      this.dropdown.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const optionBtn = target.closest('.rs-price__option') as HTMLButtonElement | null;
        if (!optionBtn) return;

        e.preventDefault();
        const value = optionBtn.dataset.value ? parseInt(optionBtn.dataset.value) : null;

        // Update active state
        this.dropdown!.querySelectorAll('.rs-price__option').forEach(b =>
          b.classList.remove('rs-price__option--active')
        );
        if (value) {
          optionBtn.classList.add('rs-price__option--active');
        }

        // Update toggle button
        const placeholder = this.type === 'min'
          ? (this.label('search_price_min') || 'Min. Price')
          : (this.label('search_price_max') || 'Max. Price');

        if (value && this.toggleText && this.toggleBtn) {
          this.toggleText.textContent = this.formatPriceFull(value);
          this.toggleBtn.classList.add('rs-price__toggle--has-selection');
        } else if (this.toggleText && this.toggleBtn) {
          this.toggleText.textContent = placeholder;
          this.toggleBtn.classList.remove('rs-price__toggle--has-selection');
        }

        this.hideDropdown();
        this.setValue(value);
      });
    }
  }

  private bindCombinedDropdownEvents(): void {
    // Toggle dropdown
    if (this.button) {
      this.button.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    // Option selection (both min and max columns)
    this.element.querySelectorAll<HTMLButtonElement>('.rs-price__combined-option').forEach(optionBtn => {
      optionBtn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        const type = optionBtn.dataset.type as 'min' | 'max';
        const value = optionBtn.dataset.value ? parseInt(optionBtn.dataset.value) : null;

        // Update active state in the column
        const column = optionBtn.closest('.rs-price__combined-column');
        if (column) {
          column.querySelectorAll('.rs-price__combined-option').forEach(btn =>
            btn.classList.remove('rs-price__combined-option--active')
          );
        }
        if (value) {
          optionBtn.classList.add('rs-price__combined-option--active');
        }

        // Update values and filter
        if (type === 'min') {
          this.minValue = value;
          this.setFilter('priceMin', value);
        } else {
          this.maxValue = value;
          this.setFilter('priceMax', value);
        }

        // Update button text
        this.updateCombinedButtonText();
      });
    });
  }

  private bindFreeInputEvents(): void {
    // Debounce input
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (this.input) {
      this.input.addEventListener('input', (e: Event) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const target = e.target as HTMLInputElement;
          const value = parseInt(target.value);
          this.setValue(value && value > 0 ? value : null);
        }, 300);
      });

      // Format on blur
      this.input.addEventListener('blur', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (value && value > 0) {
          target.value = String(value);
        }
      });
    }
  }

  private setValue(value: number | null): void {
    this.currentValue = value;
    const filterKey = this.type === 'min' ? 'priceMin' : 'priceMax';
    this.setFilter(filterKey, value);
  }

  private updateCombinedButtonText(): void {
    if (!this.buttonText || !this.button) return;
    const minLabel = this.label('search_price_min') || 'Min. Price';
    const maxLabel = this.label('search_price_max') || 'Max. Price';

    let buttonText = `${minLabel} - ${maxLabel}`;
    if (this.minValue && this.maxValue) {
      buttonText = `${this.formatPriceFull(this.minValue)} - ${this.formatPriceFull(this.maxValue)}`;
    } else if (this.minValue) {
      buttonText = `${this.formatPriceFull(this.minValue)} - ${maxLabel}`;
    } else if (this.maxValue) {
      buttonText = `${minLabel} - ${this.formatPriceFull(this.maxValue)}`;
    }

    this.buttonText.textContent = buttonText;

    if (this.minValue || this.maxValue) {
      this.button.classList.add('rs-price__combined-toggle--has-selection');
    } else {
      this.button.classList.remove('rs-price__combined-toggle--has-selection');
    }
  }

  private updatePriceOptions(): void {
    // Remember if dropdown was open (for variation 3)
    const wasOpen = this.isOpen;

    // Re-render with filtered options
    this.render();
    this.bindEvents();

    // Keep dropdown open if it was open (for combined dropdown UX)
    if (wasOpen && this.variation === '3' && this.dropdown) {
      this.dropdown.style.display = 'block';
      this.isOpen = true;
    }
  }

  private showDropdown(): void {
    if (!this.dropdown) return;
    this.isOpen = true;
    this.dropdown.style.display = 'block';
  }

  private hideDropdown(): void {
    if (!this.dropdown) return;
    this.isOpen = false;
    this.dropdown.style.display = 'none';
  }

  private toggleDropdown(): void {
    if (this.isOpen) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  private updateDisplay(): void {
    // Update styled dropdown
    if (this.select) {
      this.select.value = this.currentValue?.toString() || '';
    }

    // Update stacked buttons toggle
    if (this.toggleText && this.toggleBtn) {
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
      this.input.value = this.currentValue?.toString() || '';
    }

    // Update combined dropdown (variation 3)
    if (this.variation === '3') {
      // Update active states in both columns
      this.element.querySelectorAll<HTMLButtonElement>('.rs-price__combined-option').forEach(btn => {
        const type = btn.dataset.type as 'min' | 'max';
        const value = btn.dataset.value ? parseInt(btn.dataset.value) : null;
        const isActive = (type === 'min' && value === this.minValue) ||
                         (type === 'max' && value === this.maxValue);
        btn.classList.toggle('rs-price__combined-option--active', isActive);
      });
      this.updateCombinedButtonText();
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_price', RSPrice as unknown as ComponentConstructor);

export { RSPrice };
export default RSPrice;
