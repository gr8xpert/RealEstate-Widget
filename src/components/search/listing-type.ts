/**
 * RealtySoft Widget v3 - Listing Type Component
 * Variations: 1=Dropdown, 2=Checkboxes, 3=Radio Buttons
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule, RealtySoftStateModule } from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;

class RSListingType extends RSBaseComponent {
  private lockedMode: boolean = false;
  private selectedTypes: Set<string> = new Set();
  private selected: string | string[] = '';
  private radioName: string = '';
  private select: HTMLSelectElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('listingType');
    this.selectedTypes = new Set();
    this.selected = this.getFilter<string | string[]>('listingType') || '';
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
    this.subscribe<string | string[] | null>('filters.listingType', (value) => {
      this.selected = value || '';
      this.updateDisplay();
    });
  }

  // Get listing type options
  private getOptions(): Record<string, string> {
    const labels = RealtySoftState.get<Record<string, string>>('data.labels') || {};
    return {
      'resale': labels.listing_type_sale || 'ReSale',
      'development': labels.listing_type_new || 'New Development',
      'long_rental': labels.listing_type_long_rental || 'Long Term Rental',
      'short_rental': labels.listing_type_short_rental || 'Holiday Rental'
    };
  }

  render(): void {
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
  private renderDropdown(): void {
    const options = this.getOptions();
    const selectedValue = Array.isArray(this.selected) ? this.selected[0] : this.selected;

    this.element.innerHTML = `
      <div class="rs-listing-type__wrapper">
        <label class="rs-listing-type__label">${this.label('search_listing_type')}</label>
        <div class="rs-listing-type__select-wrapper">
          <select class="rs-listing-type__select">
            <option value="">${this.label('search_listing_type_all') || 'All Listing Types'}</option>
            ${Object.entries(options).map(([value, label]) =>
              `<option value="${value}" ${selectedValue === value ? 'selected' : ''}>${label}</option>`
            ).join('')}
          </select>
        </div>
      </div>
    `;

    this.select = this.element.querySelector('.rs-listing-type__select');
  }

  // VARIATION 2: Checkboxes (Multi-Select)
  private renderCheckboxes(): void {
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
  private renderRadioButtons(): void {
    const options = this.getOptions();
    const selectedValue = Array.isArray(this.selected) ? this.selected[0] : this.selected;

    this.element.innerHTML = `
      <div class="rs-listing-type__wrapper">
        <label class="rs-listing-type__label">${this.label('search_listing_type')}</label>
        <div class="rs-listing-type__radios">
          <label class="rs-listing-type__radio-wrapper">
            <input type="radio"
                   class="rs-listing-type__radio"
                   name="${this.radioName}"
                   value=""
                   ${!selectedValue ? 'checked' : ''}>
            <span class="rs-listing-type__radio-label">${this.label('search_all') || 'All'}</span>
          </label>
          ${Object.entries(options).map(([value, label]) => `
            <label class="rs-listing-type__radio-wrapper">
              <input type="radio"
                     class="rs-listing-type__radio"
                     name="${this.radioName}"
                     value="${value}"
                     ${selectedValue === value ? 'checked' : ''}>
              <span class="rs-listing-type__radio-label">${label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents(): void {
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

  private bindDropdownEvents(): void {
    if (this.select) {
      this.select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const value = target.value;
        this.selected = value;
        this.setFilter('listingType', value || null);
      });
    }
  }

  private bindCheckboxEvents(): void {
    this.element.querySelectorAll<HTMLInputElement>('.rs-listing-type__checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        if (target.checked) {
          this.selectedTypes.add(value);
        } else {
          this.selectedTypes.delete(value);
        }
        this.updateListingTypeFilter();
      });
    });
  }

  private bindRadioEvents(): void {
    this.element.querySelectorAll<HTMLInputElement>('.rs-listing-type__radio').forEach(radio => {
      radio.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          this.selected = target.value;
          this.setFilter('listingType', target.value || null);
        }
      });
    });
  }

  private updateListingTypeFilter(): void {
    if (this.selectedTypes.size === 0) {
      this.setFilter('listingType', null);
    } else if (this.selectedTypes.size === 1) {
      this.setFilter('listingType', Array.from(this.selectedTypes)[0]);
    } else {
      this.setFilter('listingType', Array.from(this.selectedTypes));
    }
  }

  private updateDisplay(): void {
    const selectedValue = Array.isArray(this.selected) ? this.selected[0] : this.selected;

    // Update dropdown
    if (this.select) {
      this.select.value = selectedValue || '';
    }

    // Update checkboxes
    this.element.querySelectorAll<HTMLInputElement>('.rs-listing-type__checkbox').forEach(checkbox => {
      checkbox.checked = this.selectedTypes.has(checkbox.value);
    });

    // Update radio buttons
    this.element.querySelectorAll<HTMLInputElement>('.rs-listing-type__radio').forEach(radio => {
      radio.checked = radio.value === (selectedValue || '');
    });
  }
}

// Register component
RealtySoft.registerComponent('rs_listing_type', RSListingType as unknown as ComponentConstructor);

export { RSListingType };
export default RSListingType;
