/**
 * RealtySoft Widget v3 - Reference Component
 * Single text input for property reference search
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

class RSReference extends RSBaseComponent {
  private lockedMode: boolean = false;
  private value: string = '';
  private input: HTMLInputElement | null = null;
  private clearBtn: HTMLButtonElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('ref');
    this.value = this.getFilter<string>('ref') || '';

    this.render();

    // Apply locked styles if locked (but still show the component)
    if (this.lockedMode) {
      this.applyLockedStyle();
    } else {
      this.bindEvents();
    }

    this.subscribe<string>('filters.ref', (value) => {
      this.value = value || '';
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-reference');

    this.element.innerHTML = `
      <div class="rs-reference__wrapper">
        <label class="rs-reference__label">${this.label('search_reference')}</label>
        <div class="rs-reference__input-wrapper">
          <input type="text"
                 class="rs-reference__input"
                 placeholder="${this.label('search_reference')}"
                 value="${this.value}"
                 autocomplete="off">
          ${this.value ? '<button class="rs-reference__clear" type="button">&times;</button>' : ''}
        </div>
      </div>
    `;

    this.input = this.element.querySelector('.rs-reference__input');
    this.clearBtn = this.element.querySelector('.rs-reference__clear');
  }

  bindEvents(): void {
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    if (this.input) {
      this.input.addEventListener('input', (e: Event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const target = e.target as HTMLInputElement;
          this.setFilter('ref', target.value.trim() || '');
          this.updateClearButton();
        }, 300);
      });

      this.input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.setFilter('ref', this.input!.value.trim() || '');
          RealtySoft.search();
        }
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (this.input) {
          this.input.value = '';
        }
        this.setFilter('ref', '');
        this.updateClearButton();
      });
    }
  }

  private updateDisplay(): void {
    if (this.input) {
      this.input.value = this.value;
    }
    this.updateClearButton();
  }

  private updateClearButton(): void {
    let clearBtn = this.element.querySelector<HTMLButtonElement>('.rs-reference__clear');
    const hasValue = this.input && this.input.value.trim();

    if (hasValue && !clearBtn) {
      clearBtn = document.createElement('button');
      clearBtn.className = 'rs-reference__clear';
      clearBtn.type = 'button';
      clearBtn.innerHTML = '&times;';
      clearBtn.addEventListener('click', () => {
        if (this.input) {
          this.input.value = '';
        }
        this.setFilter('ref', '');
        this.updateClearButton();
      });
      const wrapper = this.element.querySelector('.rs-reference__input-wrapper');
      if (wrapper) {
        wrapper.appendChild(clearBtn);
      }
    } else if (!hasValue && clearBtn) {
      clearBtn.remove();
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_reference', RSReference as unknown as ComponentConstructor);

export { RSReference };
export default RSReference;
