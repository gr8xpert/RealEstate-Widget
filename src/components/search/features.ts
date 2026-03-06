/**
 * RealtySoft Widget v3 - Features Component
 * Popup with categories, checkboxes, and search filter
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  Feature,
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAPI: RealtySoftAPIModule;

interface FeatureCategory {
  id: number;
  name: string;
  value_ids?: { id: number; name: string }[];
}

interface MappedCategory {
  id: number;
  name: string;
  children: { id: number; name: string }[];
}

class RSFeatures extends RSBaseComponent {
  private lockedMode: boolean = false;
  private features: FeatureCategory[] = [];
  private selectedFeatures: Set<number> = new Set();
  private isOpen: boolean = false;
  private searchTerm: string = '';
  private expandedCategories: Set<string> = new Set();
  private isLoadingFeatures: boolean = false;
  private overlay: HTMLElement | null = null;
  private trigger: HTMLButtonElement | null = null;
  private triggerText: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private categoriesContainer: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('features');
    this.features = RealtySoftState.get<FeatureCategory[]>('data.features') || [];
    this.selectedFeatures = new Set(this.getFilter<number[]>('features') || []);
    this.isOpen = false;
    this.searchTerm = '';
    this.expandedCategories = new Set();
    this.isLoadingFeatures = false;

    this.render();

    // Apply locked styles if locked (but still show the component)
    if (this.lockedMode) {
      this.applyLockedStyle();
    } else {
      this.bindEvents();
    }

    this.subscribe<FeatureCategory[]>('data.features', (features) => {
      this.features = features;
      this.updateCategoryList();
    });

    this.subscribe<number[]>('filters.features', (value) => {
      this.selectedFeatures = new Set(value || []);
      this.updateDisplay();
    });
  }

  /**
   * Load features on demand (when user clicks button)
   * Only loads if not already loaded, caches in localStorage via API
   */
  private async loadFeaturesOnDemand(): Promise<void> {
    // Already loaded or currently loading
    if (RealtySoftState.get<boolean>('data.featuresLoaded') || this.isLoadingFeatures) {
      return;
    }

    this.isLoadingFeatures = true;
    console.log('[RealtySoft] Loading features on demand...');

    try {
      const result = await RealtySoftAPI.getFeatures();
      RealtySoftState.set('data.features', result.data || []);
      RealtySoftState.set('data.featuresLoaded', true);
      this.features = (result.data || []) as FeatureCategory[];
      console.log('[RealtySoft] Features loaded on demand:', this.features.length);
    } catch (e) {
      console.error('[RealtySoft] Failed to load features:', e);
    } finally {
      this.isLoadingFeatures = false;
    }
  }

  // Build parent-child map from API structure
  // API returns: [{id, name, value_ids: [{id, name}, ...]}, ...]
  private buildFeatureMap(): MappedCategory[] {
    // Preserve API order (sorted by dashboard preferences) instead of alphabetical
    return this.features
      .filter(category => category.value_ids && category.value_ids.length > 0)
      .map(category => ({
        id: category.id,
        name: category.name,
        children: category.value_ids || []
      }));
  }

  // Filter features by search term
  private getFilteredFeatureMap(): MappedCategory[] {
    const allCategories = this.buildFeatureMap();

    if (!this.searchTerm) {
      return allCategories;
    }

    const searchLower = this.searchTerm.toLowerCase();
    const filtered: MappedCategory[] = [];

    allCategories.forEach(category => {
      // Check if category name matches
      const categoryMatches = (category.name || '').toLowerCase().includes(searchLower);

      // Filter children that match
      const matchingChildren = category.children.filter(child =>
        (child.name || '').toLowerCase().includes(searchLower)
      );

      // Include category if it matches or has matching children
      if (categoryMatches || matchingChildren.length > 0) {
        filtered.push({
          ...category,
          children: categoryMatches ? category.children : matchingChildren
        });
      }
    });

    return filtered;
  }

  render(): void {
    this.element.classList.add('rs-features');

    const count = this.selectedFeatures.size;
    const buttonText = count > 0 ? (count + ' feature' + (count > 1 ? 's' : '') + ' selected') : this.label('search_features_placeholder') || 'Select Features';

    this.element.innerHTML = `
      <div class="rs-features__wrapper">
        <label class="rs-features__label">${this.label('search_features')}</label>
        <button type="button" class="rs-features__trigger">
          <span class="rs-features__trigger-text">${buttonText}</span>
          <span class="rs-features__trigger-arrow">▼</span>
        </button>
      </div>
    `;

    // Create modal popup (appended to body for proper positioning)
    this.overlay = document.createElement('div');
    this.overlay.className = 'rs-features__overlay';
    this.overlay.style.display = 'none';
    this.overlay.innerHTML = `
      <div class="rs-features__modal">
        <div class="rs-features__modal-header">
          <h3 class="rs-features__modal-title">${this.label('search_features')}</h3>
          <button type="button" class="rs-features__modal-close">&times;</button>
        </div>
        <div class="rs-features__modal-search">
          <input type="text"
                 class="rs-features__search"
                 placeholder="${this.label('search_features_filter') || 'Search features...'}"
                 autocomplete="off">
        </div>
        <div class="rs-features__modal-body">
          <div class="rs-features__categories"></div>
        </div>
        <div class="rs-features__modal-footer">
          <button type="button" class="rs-features__clear-btn">${this.label('general_clear') || 'Clear'}</button>
          <button type="button" class="rs-features__done-btn">${this.label('general_close') || 'Done'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.trigger = this.element.querySelector('.rs-features__trigger');
    this.triggerText = this.element.querySelector('.rs-features__trigger-text');
    this.modal = this.overlay.querySelector('.rs-features__modal');
    this.searchInput = this.overlay.querySelector('.rs-features__search');
    this.categoriesContainer = this.overlay.querySelector('.rs-features__categories');

    this.updateCategoryList();
  }

  private updateCategoryList(): void {
    if (!this.categoriesContainer) return;

    const categories = this.getFilteredFeatureMap();

    if (categories.length === 0) {
      this.categoriesContainer.innerHTML = `
        <div class="rs-features__empty">No features found</div>
      `;
      return;
    }

    let html = '';

    categories.forEach(category => {
      const categoryKey = category.id.toString();
      const isExpanded = this.expandedCategories.has(categoryKey) || !!this.searchTerm;
      const selectedInCategory = category.children.filter(f => this.selectedFeatures.has(f.id)).length;

      html += `
        <div class="rs-features__category ${isExpanded ? 'rs-features__category--expanded' : ''}">
          <div class="rs-features__category-header" data-category="${categoryKey}">
            <span class="rs-features__category-toggle">${isExpanded ? '−' : '+'}</span>
            <span class="rs-features__category-name">${this.escapeHtml(category.name)}</span>
            ${selectedInCategory > 0 ? `<span class="rs-features__category-count">${selectedInCategory}</span>` : ''}
          </div>
          <div class="rs-features__category-items" style="display: ${isExpanded ? 'block' : 'none'}">
      `;

      category.children.forEach(feature => {
        const isSelected = this.selectedFeatures.has(feature.id);
        html += `
          <label class="rs-features__item">
            <input type="checkbox"
                   class="rs-features__checkbox"
                   value="${feature.id}"
                   ${isSelected ? 'checked' : ''}>
            <span class="rs-features__item-name">${this.escapeHtml(feature.name)}</span>
          </label>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    this.categoriesContainer.innerHTML = html;
  }

  bindEvents(): void {
    // Open modal
    if (this.trigger) {
      this.trigger.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.showModal();
      });
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.searchTerm = target.value.trim();
        this.updateCategoryList();
      });
    }

    // Category toggle
    if (this.categoriesContainer) {
      this.categoriesContainer.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const header = target.closest('.rs-features__category-header') as HTMLElement | null;
        if (header) {
          const category = header.dataset.category;
          if (category) {
            this.toggleCategory(category);
          }
        }
      });

      // Checkbox change
      this.categoriesContainer.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('rs-features__checkbox')) {
          const featureId = parseInt(target.value);
          if (target.checked) {
            this.selectedFeatures.add(featureId);
          } else {
            this.selectedFeatures.delete(featureId);
          }
          this.updateFilters();
          this.updateTriggerText();
          this.updateCategoryList();
        }
      });
    }

    if (this.overlay) {
      // Clear button
      const clearBtn = this.overlay.querySelector('.rs-features__clear-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.clearAll();
        });
      }

      // Done/Close button
      const doneBtn = this.overlay.querySelector('.rs-features__done-btn');
      if (doneBtn) {
        doneBtn.addEventListener('click', () => {
          this.hideModal();
        });
      }

      // X close button
      const closeBtn = this.overlay.querySelector('.rs-features__modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hideModal();
        });
      }

      // Close on overlay click (not modal itself)
      this.overlay.addEventListener('click', (e: Event) => {
        if (e.target === this.overlay) {
          this.hideModal();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hideModal();
      }
    });
  }

  private toggleCategory(category: string): void {
    const header = this.categoriesContainer?.querySelector(`.rs-features__category-header[data-category="${category}"]`);
    if (!header) return;

    const categoryEl = header.parentElement;
    if (!categoryEl) return;

    const itemsEl = categoryEl.querySelector('.rs-features__category-items') as HTMLElement | null;
    const toggleEl = categoryEl.querySelector('.rs-features__category-toggle');

    if (!itemsEl || !toggleEl) return;

    if (this.expandedCategories.has(category)) {
      this.expandedCategories.delete(category);
      categoryEl.classList.remove('rs-features__category--expanded');
      itemsEl.style.display = 'none';
      toggleEl.textContent = '+';
    } else {
      this.expandedCategories.add(category);
      categoryEl.classList.add('rs-features__category--expanded');
      itemsEl.style.display = 'block';
      toggleEl.textContent = '−';
    }
  }

  private async showModal(): Promise<void> {
    this.isOpen = true;
    if (this.overlay) {
      this.overlay.style.display = 'flex';
    }
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    // Load features on demand if not loaded yet
    if (!RealtySoftState.get<boolean>('data.featuresLoaded')) {
      if (this.categoriesContainer) {
        this.categoriesContainer.innerHTML = '<div class="rs-features__loading">Loading features...</div>';
      }
      await this.loadFeaturesOnDemand();
      this.updateCategoryList();
    }

    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  private hideModal(): void {
    this.isOpen = false;
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    document.body.style.overflow = ''; // Restore scroll
    this.searchTerm = '';
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.updateCategoryList();
  }

  private updateFilters(): void {
    const selectedArray = Array.from(this.selectedFeatures);
    this.setFilter('features', selectedArray.length > 0 ? selectedArray : []);
  }

  private updateTriggerText(): void {
    if (!this.triggerText) return;
    const count = this.selectedFeatures.size;
    this.triggerText.textContent = count > 0
      ? (count + ' feature' + (count > 1 ? 's' : '') + ' selected')
      : this.label('search_features_placeholder') || 'Select Features';
  }

  private clearAll(): void {
    this.selectedFeatures.clear();
    this.updateFilters();
    this.updateTriggerText();
    this.updateCategoryList();
  }

  private updateDisplay(): void {
    this.updateTriggerText();
    this.updateCategoryList();
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('rs_features', RSFeatures as unknown as ComponentConstructor);

export { RSFeatures };
export default RSFeatures;
