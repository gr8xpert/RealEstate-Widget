/**
 * RealtySoft Widget v3 - Detail Features Component
 * Displays property features in two modes:
 * - 'button' (default): Compact button that opens modal with tabular layout
 * - 'inline': Traditional inline list grouped by category (accordion style)
 *
 * Usage:
 *   <div class="rs_detail_features"></div>                     <!-- Button/popup mode (default) -->
 *   <div class="rs_detail_features" data-mode="button"></div>  <!-- Button/popup mode -->
 *   <div class="rs_detail_features" data-mode="inline"></div>  <!-- Inline/accordion mode -->
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property, PropertyFeature } from '../../types/index';

type FeaturesMode = 'button' | 'inline';

class RSDetailFeatures extends RSBaseComponent {
  private property: Property | null = null;
  private features: (string | PropertyFeature)[] = [];
  private modal: HTMLElement | null = null;
  private hasInitiallyRendered: boolean = false;
  private mode: FeaturesMode = 'button';

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.property = this.options?.property as Property | null;

    if (!this.property) {
      this.element.style.display = 'none';
      return;
    }

    this.features = (this.property.features as unknown as (string | PropertyFeature)[]) || [];

    if (this.features.length === 0) {
      this.element.style.display = 'none';
      return;
    }

    // Get mode from data attribute (default: 'button')
    const modeAttr = this.element.dataset.mode as FeaturesMode;
    this.mode = (modeAttr === 'inline') ? 'inline' : 'button';

    this.render();
    this.bindEvents();

    // Listen for language changes
    this.subscribe('config.language', () => {
      this.updateLabelsInPlace();
    });
  }

  render(): void {
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }

    this.hasInitiallyRendered = true;
    this.element.classList.add('rs-detail-features');
    this.element.classList.add(`rs-detail-features--${this.mode}`);

    if (this.mode === 'inline') {
      this.renderInlineMode();
    } else {
      this.renderButtonMode();
    }
  }

  /**
   * Button mode: Compact button that opens modal, with Back button beside it
   */
  private renderButtonMode(): void {
    const grouped = this.groupFeatures();
    const totalFeatures = this.features.length;

    this.element.innerHTML = `
      <div class="rs-detail-features__row">
        <button type="button" class="rs-detail-features__back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span class="rs-detail-features__back-label">${this.label('detail_back') || 'Back'}</span>
        </button>
        <button type="button" class="rs-detail-features__btn">
          <span class="rs-detail-features__btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </span>
          <span class="rs-detail-features__btn-label">${this.label('detail_features') || 'Features'}</span>
          <span class="rs-detail-features__btn-count">${totalFeatures}</span>
        </button>
      </div>

      <div class="rs-detail-features__modal" style="display: none;">
        <div class="rs-detail-features__modal-backdrop"></div>
        <div class="rs-detail-features__modal-content">
          <div class="rs-detail-features__modal-header">
            <h3 class="rs-detail-features__modal-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              ${this.label('detail_features') || 'Features'}
              <span class="rs-detail-features__modal-count">(${totalFeatures})</span>
            </h3>
            <button type="button" class="rs-detail-features__modal-close">&times;</button>
          </div>
          <div class="rs-detail-features__modal-body">
            ${this.renderFeaturesGrid(grouped)}
          </div>
        </div>
      </div>
    `;

    this.modal = this.element.querySelector('.rs-detail-features__modal');
  }

  /**
   * Inline mode: Traditional list grouped by category (original behavior)
   */
  private renderInlineMode(): void {
    const grouped = this.groupFeatures();

    const html = Object.entries(grouped).map(([category, items]) => `
      <div class="rs-detail-features__group">
        <h3 class="rs-detail-features__title">${this.escapeHtml(category)}</h3>
        <ul class="rs-detail-features__list">
          ${items.map(name => `
            <li class="rs-detail-features__item">
              <svg class="rs-detail-features__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="rs-detail-features__text">${this.escapeHtml(name)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    this.element.innerHTML = html;
  }

  private groupFeatures(): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    this.features.forEach(feature => {
      const name = typeof feature === 'string' ? feature : feature.name;
      const category = (typeof feature === 'object' && feature.category) ? feature.category : 'General';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(name);
    });

    return grouped;
  }

  private renderFeaturesGrid(grouped: Record<string, string[]>): string {
    const categories = Object.keys(grouped);

    // If only one category or no categories, show simple grid
    if (categories.length <= 1) {
      const allFeatures = categories.length === 1 ? grouped[categories[0]] : [];
      return `
        <div class="rs-detail-features__grid">
          ${allFeatures.map(name => `
            <div class="rs-detail-features__grid-item">
              <svg class="rs-detail-features__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${this.escapeHtml(name)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Multiple categories - show tabular layout with category headers
    return categories.map(category => `
      <div class="rs-detail-features__category">
        <h4 class="rs-detail-features__category-title">${this.escapeHtml(category)}</h4>
        <div class="rs-detail-features__grid">
          ${grouped[category].map(name => `
            <div class="rs-detail-features__grid-item">
              <svg class="rs-detail-features__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${this.escapeHtml(name)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  bindEvents(): void {
    if (this.mode !== 'button') return;

    // Back button - navigate back
    this.element.querySelector('.rs-detail-features__back-btn')?.addEventListener('click', () => {
      this.navigateBack();
    });

    // Open modal button
    this.element.querySelector('.rs-detail-features__btn')?.addEventListener('click', () => {
      this.openModal();
    });

    // Close handlers (use event delegation for dynamically created modal)
    this.element.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.rs-detail-features__modal-close') ||
          target.closest('.rs-detail-features__modal-backdrop')) {
        this.closeModal();
      }
    });

    // ESC key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
        this.closeModal();
      }
    });
  }

  private openModal(): void {
    if (this.modal) {
      this.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  private closeModal(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  private navigateBack(): void {
    // Check session storage for last search URL
    const lastSearch = sessionStorage.getItem('rs_last_search_url');
    if (lastSearch) {
      window.location.href = lastSearch;
      return;
    }

    // Check referrer
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.hostname)) {
      window.location.href = referrer;
      return;
    }

    // Fallback to history.back()
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }

  private updateLabelsInPlace(): void {
    if (this.mode === 'button') {
      // Update back button label
      const backLabel = this.element.querySelector('.rs-detail-features__back-label');
      if (backLabel) {
        backLabel.textContent = this.label('detail_back') || 'Back';
      }

      // Update features button label
      const btnLabel = this.element.querySelector('.rs-detail-features__btn-label');
      if (btnLabel) {
        btnLabel.textContent = this.label('detail_features') || 'Features';
      }

      // Update modal title (preserve SVG and count)
      const modalTitle = this.element.querySelector('.rs-detail-features__modal-title');
      if (modalTitle) {
        const svg = modalTitle.querySelector('svg');
        const count = modalTitle.querySelector('.rs-detail-features__modal-count');
        if (svg && count) {
          modalTitle.innerHTML = '';
          modalTitle.appendChild(svg);
          modalTitle.appendChild(document.createTextNode(' ' + (this.label('detail_features') || 'Features') + ' '));
          modalTitle.appendChild(count);
        }
      }
    }
    // Inline mode: titles are category names, not labels - no update needed
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailFeatures };
export default RSDetailFeatures;
