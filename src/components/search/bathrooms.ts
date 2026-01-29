/**
 * RealtySoft Widget v3 - Bathrooms Component
 * Variations: 1=Dropdown, 2=Box Style, 3=Multi-Select, 4=Free Input
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

class RSBathrooms extends RSBaseComponent {
  private lockedMode: boolean = false;
  private minValue: number | null = null;
  private maxValue: number | null = null;
  private maxOptions: number = 10;
  private style: string = 'minimum';
  private selectedValues: Set<number> = new Set();
  private isOpen: boolean = false;
  private select: HTMLSelectElement | null = null;
  private input: HTMLInputElement | null = null;
  private button: HTMLButtonElement | null = null;
  private buttonText: HTMLElement | null = null;
  private dropdown: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('bathsMin') || this.isLocked('bathsMax');
    this.minValue = this.getFilter<number | null>('bathsMin');
    this.maxValue = this.getFilter<number | null>('bathsMax');
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

    this.subscribe<number | null>('filters.bathsMin', (value) => {
      this.minValue = value;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-bathrooms', `rs-bathrooms--v${this.variation}`);

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
  private renderDropdown(): void {
    const placeholder = this.label('search_bathrooms_any') || 'Any Bathrooms';

    let options = `<option value="">${placeholder}</option>`;
    for (let i = 1; i <= this.maxOptions; i++) {
      const label = this.style === 'minimum' ? `${i}+` : `${i}`;
      const selected = this.minValue === i ? 'selected' : '';
      options += `<option value="${i}" ${selected}>${label}</option>`;
    }

    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label('search_bathrooms')}</label>
        <div class="rs-bathrooms__select-wrapper">
          <select class="rs-bathrooms__select">${options}</select>
        </div>
      </div>
    `;

    this.select = this.element.querySelector('.rs-bathrooms__select');
  }

  // VARIATION 2: Box Style (Horizontal Buttons)
  private renderBoxStyle(): void {
    let buttons = '';
    for (let i = 1; i <= this.maxOptions; i++) {
      const label = this.style === 'minimum' ? `${i}+` : `${i}`;
      const active = this.minValue === i ? 'rs-bathrooms__box--active' : '';
      buttons += `<button type="button" class="rs-bathrooms__box ${active}" data-value="${i}">${label}</button>`;
    }

    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label('search_bathrooms')}</label>
        <div class="rs-bathrooms__boxes">${buttons}</div>
      </div>
    `;
  }

  // VARIATION 3: Multi-Select Dropdown
  private renderMultiSelect(): void {
    const placeholder = this.label('search_bathrooms_select') || 'Select Bathrooms';
    const count = this.selectedValues.size;
    const buttonText = count > 0 ? count + ' selected' : placeholder;

    let checkboxes = '';
    for (let i = 1; i <= this.maxOptions; i++) {
      const label = this.style === 'minimum' ? `${i}+` : `${i}`;
      const checked = this.selectedValues.has(i) ? 'checked' : '';
      checkboxes += `
        <label class="rs-bathrooms__multiselect-option">
          <input type="checkbox" class="rs-bathrooms__multiselect-checkbox" value="${i}" ${checked}>
          <span>${label}</span>
        </label>
      `;
    }

    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label('search_bathrooms')}</label>
        <div class="rs-bathrooms__multiselect">
          <button type="button" class="rs-bathrooms__multiselect-button">
            <span class="rs-bathrooms__multiselect-text">${buttonText}</span>
            <span class="rs-bathrooms__multiselect-arrow">▼</span>
          </button>
          <div class="rs-bathrooms__multiselect-dropdown" style="display: none;">
            ${checkboxes}
          </div>
        </div>
      </div>
    `;

    this.button = this.element.querySelector('.rs-bathrooms__multiselect-button');
    this.buttonText = this.element.querySelector('.rs-bathrooms__multiselect-text');
    this.dropdown = this.element.querySelector('.rs-bathrooms__multiselect-dropdown');
  }

  // VARIATION 4: Free Input
  private renderFreeInput(): void {
    const placeholder = this.label('search_bathrooms_input') || 'e.g., 2';

    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label('search_bathrooms')}</label>
        <div class="rs-bathrooms__input-wrapper">
          <input type="number"
                 class="rs-bathrooms__input"
                 min="0"
                 max="10"
                 placeholder="${placeholder}"
                 value="${this.minValue || ''}">
        </div>
      </div>
    `;

    this.input = this.element.querySelector('.rs-bathrooms__input');
  }

  bindEvents(): void {
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

  private bindDropdownEvents(): void {
    if (this.select) {
      this.select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const value = target.value ? parseInt(target.value) : null;
        this.handleSelection(value);
      });
    }
  }

  private bindBoxStyleEvents(): void {
    this.element.querySelectorAll<HTMLButtonElement>('.rs-bathrooms__box').forEach(box => {
      box.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const target = e.target as HTMLButtonElement;
        const value = parseInt(target.dataset.value || '0');
        const isActive = target.classList.contains('rs-bathrooms__box--active');

        // Remove active from all
        this.element.querySelectorAll('.rs-bathrooms__box').forEach(b =>
          b.classList.remove('rs-bathrooms__box--active')
        );

        if (!isActive) {
          target.classList.add('rs-bathrooms__box--active');
          this.handleSelection(value);
        } else {
          this.handleSelection(null);
        }
      });
    });
  }

  private bindMultiSelectEvents(): void {
    // Toggle dropdown
    if (this.button) {
      this.button.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.toggleDropdown();
      });
    }

    // Close on outside click
    document.addEventListener('click', (e: Event) => {
      if (!this.element.contains(e.target as Node)) {
        this.hideDropdown();
      }
    });

    // Checkbox changes
    this.element.querySelectorAll<HTMLInputElement>('.rs-bathrooms__multiselect-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (target.checked) {
          this.selectedValues.add(value);
        } else {
          this.selectedValues.delete(value);
        }
        this.updateMultiSelectButton();
        this.updateMultiSelectFilters();
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
          this.handleSelection(value && value > 0 ? value : null);
        }, 300);
      });
    }
  }

  private handleSelection(value: number | null): void {
    if (value) {
      if (this.style === 'minimum') {
        this.setFilter('bathsMin', value);
        this.setFilter('bathsMax', null);
      } else {
        this.setFilter('bathsMin', value);
        this.setFilter('bathsMax', value);
      }
    } else {
      this.setFilter('bathsMin', null);
      this.setFilter('bathsMax', null);
    }
  }

  private updateMultiSelectButton(): void {
    if (!this.buttonText) return;
    const placeholder = this.label('search_bathrooms_select') || 'Select Bathrooms';
    const count = this.selectedValues.size;
    this.buttonText.textContent = count > 0 ? count + ' selected' : placeholder;
  }

  private updateMultiSelectFilters(): void {
    if (this.selectedValues.size > 0) {
      const values = Array.from(this.selectedValues).sort((a, b) => a - b);
      this.setFilter('bathsMin', Math.min(...values));
      this.setFilter('bathsMax', Math.max(...values));
    } else {
      this.setFilter('bathsMin', null);
      this.setFilter('bathsMax', null);
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
    // Update dropdown
    if (this.select) {
      this.select.value = this.minValue?.toString() || '';
    }

    // Update box buttons
    this.element.querySelectorAll<HTMLButtonElement>('.rs-bathrooms__box').forEach(box => {
      const boxValue = parseInt(box.dataset.value || '0');
      box.classList.toggle('rs-bathrooms__box--active', this.minValue === boxValue);
    });

    // Update free input
    if (this.input) {
      this.input.value = this.minValue?.toString() || '';
    }

    // Update multi-select (variation 3)
    if (this.variation === '3') {
      // Clear selectedValues if filter is reset
      if (!this.minValue) {
        this.selectedValues.clear();
      }
      // Update checkbox states
      this.element.querySelectorAll<HTMLInputElement>('.rs-bathrooms__multiselect-checkbox').forEach(checkbox => {
        const value = parseInt(checkbox.value);
        checkbox.checked = this.selectedValues.has(value);
      });
    }
    this.updateMultiSelectButton();
  }
}

// Register component
RealtySoft.registerComponent('rs_bathrooms', RSBathrooms as unknown as ComponentConstructor);

export { RSBathrooms };
export default RSBathrooms;
