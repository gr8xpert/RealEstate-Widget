/**
 * RealtySoft Widget v3 - Reset Button Component
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

class RSResetButton extends RSBaseComponent {
  private button: HTMLButtonElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.render();
    this.bindEvents();
  }

  render(): void {
    this.element.classList.add('rs-reset-button');

    this.element.innerHTML = `
      <button type="button" class="rs-reset-button__btn">
        <span class="rs-reset-button__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </span>
        <span class="rs-reset-button__text">${this.label('search_reset')}</span>
      </button>
    `;

    this.button = this.element.querySelector('.rs-reset-button__btn');
  }

  bindEvents(): void {
    if (this.button) {
      this.button.addEventListener('click', (e: Event) => {
        e.preventDefault();
        RealtySoft.reset();
      });
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_reset_button', RSResetButton as unknown as ComponentConstructor);

export { RSResetButton };
export default RSResetButton;
