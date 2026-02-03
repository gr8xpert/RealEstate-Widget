/**
 * RealtySoft Widget v3 - View Toggle Component
 * Grid/List/Map view switch
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule, RealtySoftStateModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;

class RSViewToggle extends RSBaseComponent {
  private currentView: string = 'grid';
  private enableMapView: boolean = true;
  private enableListView: boolean = true;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.currentView = RealtySoftState.get<string>('ui.view') || 'grid';

    // Check if map view is enabled (default: false - must explicitly enable)
    const globalConfig = (window as any).RealtySoftConfig || {};
    this.enableMapView = globalConfig.enableMapView === true;

    // Check if list view should be hidden (via data attribute on element)
    // Used for templates that are already 1-per-row (list style)
    this.enableListView = this.element.dataset.rsHideList !== 'true';

    this.render();
    this.bindEvents();

    this.subscribe<string>('ui.view', (view) => {
      this.currentView = view;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-view-toggle');

    const mapButton = this.enableMapView ? `
        <button type="button"
                class="rs-view-toggle__btn rs-view-toggle__btn--map ${this.currentView === 'map' ? 'rs-view-toggle__btn--active' : ''}"
                data-view="map"
                aria-label="${this.label('results_view_map') || 'Map View'}"
                title="${this.label('results_view_map') || 'Map View'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </button>
    ` : '';

    const listButton = this.enableListView ? `
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
    ` : '';

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
        ${listButton}
        ${mapButton}
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
