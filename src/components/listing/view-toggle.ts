/**
 * RealtySoft Widget v3 - View Toggle Component
 * Grid/List view switch
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

class RSViewToggle extends RSBaseComponent {
  private currentView: string = 'grid';

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.currentView = (window as unknown as { RealtySoftState: { get: (key: string) => string | null } }).RealtySoftState.get('ui.view') || 'grid';

    this.render();
    this.bindEvents();

    this.subscribe<string>('ui.view', (view) => {
      this.currentView = view;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-view-toggle');

    this.element.innerHTML = `
      <div class="rs-view-toggle__wrapper">
        <button type="button"
                class="rs-view-toggle__btn rs-view-toggle__btn--grid ${this.currentView === 'grid' ? 'rs-view-toggle__btn--active' : ''}"
                data-view="grid"
                aria-label="${this.label('results_view_grid')}"
                title="${this.label('results_view_grid')}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
        <button type="button"
                class="rs-view-toggle__btn rs-view-toggle__btn--list ${this.currentView === 'list' ? 'rs-view-toggle__btn--active' : ''}"
                data-view="list"
                aria-label="${this.label('results_view_list')}"
                title="${this.label('results_view_list')}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }

  bindEvents(): void {
    this.element.querySelectorAll<HTMLButtonElement>('.rs-view-toggle__btn').forEach(btn => {
      btn.addEventListener('click', (e: Event) => {
        const target = e.currentTarget as HTMLButtonElement;
        const view = target.dataset.view;
        if (view) {
          RealtySoft.setView(view);
        }
      });
    });
  }

  private updateDisplay(): void {
    this.element.querySelectorAll<HTMLButtonElement>('.rs-view-toggle__btn').forEach(btn => {
      btn.classList.toggle('rs-view-toggle__btn--active', btn.dataset.view === this.currentView);
    });
  }
}

// Register component
RealtySoft.registerComponent('rs_view_toggle', RSViewToggle as unknown as ComponentConstructor);

export { RSViewToggle };
export default RSViewToggle;
