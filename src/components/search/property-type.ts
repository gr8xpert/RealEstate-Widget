/**
 * RealtySoft Widget v3 - Property Type Component
 * Variations: 1=Typeahead, 2=Flat Multi-select, 3=Accordion Multi-select, 4=Traditional Dropdown
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  PropertyType,
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLogger: { debug: (msg: string, ...args: unknown[]) => void } | undefined;

const Logger = {
  debug: (msg: string, ...args: unknown[]) => {
    if (typeof RealtySoftLogger !== 'undefined') RealtySoftLogger.debug(msg, ...args);
  }
};

interface ExtendedPropertyType extends PropertyType {
  parent_id?: number | string | null;
  count?: number;
}

/**
 * Check if a property type has properties (property_count > 0)
 * Returns true if property_count is undefined (backwards compatibility) or > 0
 * Returns false only if property_count is explicitly 0
 */
function hasProperties(type: ExtendedPropertyType): boolean {
  // If property_count doesn't exist, show the type (backwards compatibility)
  if (!('property_count' in type)) return true;
  if (type.property_count === undefined || type.property_count === null) return true;
  return type.property_count > 0;
}

/**
 * Check if a parent type or any of its children have properties
 */
function hasPropertiesOrChildren(type: ExtendedPropertyType, allTypes: ExtendedPropertyType[]): boolean {
  // First check if the type itself has properties
  if (hasProperties(type)) return true;

  // Then check if any children have properties
  const children = allTypes.filter(child => {
    const pid = child.parent_id;
    if (!pid && pid !== 0) return false;
    return String(pid) === String(type.id);
  });
  return children.some(child => hasProperties(child));
}

class RSPropertyType extends RSBaseComponent {
  private lockedMode: boolean = false;
  private propertyTypes: ExtendedPropertyType[] = [];
  private selectedIds: Set<string> = new Set();
  private selectedName: string = '';
  private isOpen: boolean = false;
  private searchTerm: string = '';
  private filteredTypes: ExtendedPropertyType[] = [];
  private highlightIndex: number = -1;
  private expandedParents: Set<string> = new Set();

  // DOM elements
  private input: HTMLInputElement | null = null;
  private dropdown: HTMLElement | null = null;
  private list: HTMLElement | null = null;
  private clearBtn: HTMLButtonElement | null = null;
  private button: HTMLButtonElement | null = null;
  private buttonText: HTMLElement | null = null;
  private filterInput: HTMLInputElement | null = null;
  private tagsContainer: HTMLElement | null = null;
  private select: HTMLSelectElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('propertyType');
    this.propertyTypes = RealtySoftState.get<ExtendedPropertyType[]>('data.propertyTypes') || [];
    this.selectedIds = new Set();
    this.selectedName = this.getFilter<string>('propertyTypeName') || '';
    this.isOpen = false;
    this.searchTerm = '';
    this.filteredTypes = [];
    this.highlightIndex = -1;
    this.expandedParents = new Set();

    // Initialize from existing filter
    const existingFilter = this.getFilter<number | number[]>('propertyType');
    if (existingFilter) {
      if (Array.isArray(existingFilter)) {
        existingFilter.forEach(id => this.selectedIds.add(String(id)));
      } else {
        this.selectedIds.add(String(existingFilter));
      }
    }

    // If locked, find the property type name for display
    if (this.lockedMode && this.selectedIds.size > 0) {
      const lockedId = Array.from(this.selectedIds)[0];
      const lockedType = this.propertyTypes.find(t => String(t.id) === lockedId);
      if (lockedType) {
        this.selectedName = this.translateTypeName(lockedType.name);
      }
    }

    this.render();

    // Apply locked styles if locked (but still show the component)
    if (this.lockedMode) {
      this.applyLockedStyle();
    } else {
      this.bindEvents();
    }

    // Subscribe to data updates
    this.subscribe<ExtendedPropertyType[]>('data.propertyTypes', (types) => {
      this.propertyTypes = types;
      this.updateList();
    });

    // Subscribe to filter changes
    this.subscribe<number | number[] | null>('filters.propertyType', (value) => {
      // Sync selectedIds with filter value
      this.selectedIds.clear();
      if (value !== null) {
        if (Array.isArray(value)) {
          value.forEach(id => this.selectedIds.add(String(id)));
        } else {
          this.selectedIds.add(String(value));
        }
      }
      this.updateDisplay();
    });
  }

  /**
   * Translate property type name using label system.
   * Looks up translation using lowercase name (e.g., "apartment" → "Appartamento")
   * Falls back to original name if no translation found.
   */
  private translateTypeName(name: string): string {
    if (!name) return '';
    // Create lookup key: lowercase, replace spaces with underscores
    const key = name.toLowerCase().replace(/\s+/g, '_');
    const translated = this.label(key);
    // If label returns the key itself, no translation found - use original
    return translated === key ? name : translated;
  }

  // Get parent property types (no parent_id or parent_id = 0), excluding items with 0 properties
  // For parents, show if they or their children have properties
  private getParentTypes(): ExtendedPropertyType[] {
    const allParents = this.propertyTypes.filter(type =>
      !type.parent_id || type.parent_id === '0' || type.parent_id === 0
    );

    const filtered = allParents.filter(type => hasPropertiesOrChildren(type, this.propertyTypes));

    Logger.debug(`[RealtySoft] Property type parents: ${allParents.length} total, ${filtered.length} after filtering`);
    Logger.debug(`[RealtySoft] Filtered out types: ${allParents.filter(p => !filtered.includes(p)).map(p => `${p.name}(${p.property_count})`).join(', ')}`);

    // Preserve API order (sorted by dashboard preferences) instead of alphabetical
    return filtered;
  }

  // Get child property types for a parent, excluding items with 0 properties
  private getChildTypes(parentId: number | string): ExtendedPropertyType[] {
    // Preserve API order (sorted by dashboard preferences) instead of alphabetical
    return this.propertyTypes
      .filter(type => type.parent_id == parentId && hasProperties(type));
  }

  // Get all child IDs for a parent
  private getAllChildIds(parentId: number | string): string[] {
    return this.getChildTypes(parentId).map(child => String(child.id));
  }

  // Check if all children of a parent are selected
  private areAllChildrenSelected(parentId: number | string): boolean {
    const childIds = this.getAllChildIds(parentId);
    return childIds.length > 0 && childIds.every(id => this.selectedIds.has(id));
  }

  render(): void {
    this.element.classList.add('rs-property-type', `rs-property-type--v${this.variation}`);

    switch (this.variation) {
      case '2':
        this.renderFlatMultiSelect();
        break;
      case '3':
        this.renderAccordionMultiSelect();
        break;
      case '4':
        this.renderTraditionalDropdown();
        break;
      default:
        this.renderTypeahead();
    }
  }

  // VARIATION 1: Search/Autocomplete (Single Select)
  private renderTypeahead(): void {
    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label('search_property_type')}</label>
        <div class="rs-property-type__search-wrapper">
          <input type="text"
                 class="rs-property-type__input"
                 placeholder="Enter property type"
                 value="${this.selectedName}"
                 autocomplete="off">
          <button class="rs-property-type__clear" type="button" style="display: ${this.selectedName ? 'block' : 'none'}">×</button>
        </div>
        <div class="rs-property-type__dropdown" style="display: none;">
          <div class="rs-property-type__list"></div>
        </div>
      </div>
    `;

    this.input = this.element.querySelector('.rs-property-type__input');
    this.dropdown = this.element.querySelector('.rs-property-type__dropdown');
    this.list = this.element.querySelector('.rs-property-type__list');
    this.clearBtn = this.element.querySelector('.rs-property-type__clear');

    // Filter out types with 0 properties
    this.filteredTypes = this.propertyTypes.filter(type => hasProperties(type));
  }

  // VARIATION 2: Flat Multi-Select with Filter (styled like Location V3)
  private renderFlatMultiSelect(): void {
    const count = this.selectedIds.size;
    const buttonText = count > 0 ? (count + ' selected') : this.label('search_property_type');
    const hasSelectionClass = count > 0 ? 'has-selection' : '';

    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label('search_property_type')}</label>
        <button type="button" class="rs-property-type__button ${hasSelectionClass}">
          <span class="rs-property-type__button-text">${buttonText}</span>
          <span class="rs-property-type__button-arrow">▼</span>
        </button>
        <div class="rs-property-type__tags"></div>
        <div class="rs-property-type__dropdown rs-property-type__dropdown--multiselect" style="display: none;">
          <input type="text" class="rs-property-type__filter" placeholder="${this.label('search_location_placeholder') || 'Search...'}">
          <div class="rs-property-type__list"></div>
        </div>
      </div>
    `;

    this.button = this.element.querySelector('.rs-property-type__button');
    this.buttonText = this.element.querySelector('.rs-property-type__button-text');
    this.tagsContainer = this.element.querySelector('.rs-property-type__tags');
    this.dropdown = this.element.querySelector('.rs-property-type__dropdown');
    this.filterInput = this.element.querySelector('.rs-property-type__filter');
    this.list = this.element.querySelector('.rs-property-type__list');

    this.renderFlatList();
    this.updateTags();
  }

  // VARIATION 3: Accordion Multi-Select with Filter
  private renderAccordionMultiSelect(): void {
    const count = this.selectedIds.size;
    const buttonText = count > 0 ? `${count} type${count > 1 ? 's' : ''} selected` : this.label('search_property_type_placeholder');

    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label('search_property_type')}</label>
        <button type="button" class="rs-property-type__button">
          <span class="rs-property-type__button-text">${buttonText}</span>
          <span class="rs-property-type__button-arrow">▼</span>
        </button>
        <div class="rs-property-type__dropdown rs-property-type__dropdown--accordion" style="display: none;">
          <input type="text" class="rs-property-type__filter" placeholder="Search property types...">
          <div class="rs-property-type__list"></div>
        </div>
      </div>
    `;

    this.button = this.element.querySelector('.rs-property-type__button');
    this.buttonText = this.element.querySelector('.rs-property-type__button-text');
    this.dropdown = this.element.querySelector('.rs-property-type__dropdown');
    this.filterInput = this.element.querySelector('.rs-property-type__filter');
    this.list = this.element.querySelector('.rs-property-type__list');

    this.renderAccordionList();
  }

  // VARIATION 4: Traditional Hierarchical Dropdown (Single Select)
  private renderTraditionalDropdown(): void {
    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label('search_property_type')}</label>
        <div class="rs-property-type__select-wrapper">
          <select class="rs-property-type__select">
            <option value="">${this.label('search_property_type_placeholder')}</option>
          </select>
        </div>
      </div>
    `;

    this.select = this.element.querySelector('.rs-property-type__select');
    this.populateHierarchicalSelect();
  }

  // Update typeahead list (V1)
  private updateTypeaheadList(): void {
    if (!this.list) return;

    const results = this.filteredTypes.slice(0, 10);

    if (results.length === 0) {
      this.list.innerHTML = '<div class="rs-property-type__no-results">No results found</div>';
      return;
    }

    this.list.innerHTML = results.map((type, index) => {
      const isParent = !type.parent_id || type.parent_id === '0' || type.parent_id === 0;
      return `
        <div class="rs-property-type__item ${index === this.highlightIndex ? 'rs-property-type__item--highlight' : ''}"
             data-id="${type.id}"
             data-name="${this.escapeHtml(type.name)}">
          <span class="rs-property-type__item-text">${this.escapeHtml(this.translateTypeName(type.name))}</span>
          ${!isParent ? '<span class="rs-property-type__item-badge">Sub-type</span>' : ''}
        </div>
      `;
    }).join('');
  }

  // Render flat list with parent/child hierarchy (V2)
  private renderFlatList(filterQuery: string = ''): void {
    if (!this.list) return;

    const parents = this.getParentTypes();
    const lowerQuery = filterQuery.toLowerCase();
    let html = '';

    parents.forEach(parent => {
      const parentMatches = (parent.name || '').toLowerCase().includes(lowerQuery);
      const children = this.getChildTypes(parent.id);
      const matchingChildren = children.filter(child =>
        (child.name || '').toLowerCase().includes(lowerQuery)
      );

      if (!filterQuery || parentMatches || matchingChildren.length > 0) {
        const parentChecked = this.areAllChildrenSelected(parent.id);

        // Parent item with gray background
        html += `
          <div class="rs-property-type__item rs-property-type__item--parent" style="background: #f5f5f5; padding: 8px 12px; border-bottom: 1px solid #eee;">
            <label class="rs-property-type__checkbox-label" style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox"
                     class="rs-property-type__checkbox"
                     value="${parent.id}"
                     data-is-parent="true"
                     data-name="${this.escapeHtml(parent.name)}"
                     ${parentChecked ? 'checked' : ''}
                     style="margin-right: 10px;">
              <span class="rs-property-type__checkbox-text" style="font-weight: 600;">${this.escapeHtml(this.translateTypeName(parent.name))}</span>
            </label>
          </div>
        `;

        const displayChildren = filterQuery ? matchingChildren : children;
        displayChildren.forEach(child => {
          html += `
            <div class="rs-property-type__item rs-property-type__item--child" style="padding: 8px 12px 8px 32px; border-bottom: 1px solid #eee;">
              <label class="rs-property-type__checkbox-label" style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox"
                       class="rs-property-type__checkbox"
                       value="${child.id}"
                       data-parent-id="${parent.id}"
                       data-name="${this.escapeHtml(child.name)}"
                       ${this.selectedIds.has(String(child.id)) ? 'checked' : ''}
                       style="margin-right: 10px;">
                <span class="rs-property-type__checkbox-text">${this.escapeHtml(this.translateTypeName(child.name))}</span>
              </label>
            </div>
          `;
        });
      }
    });

    this.list.innerHTML = html || '<div class="rs-property-type__no-results">No results found</div>';
  }

  // Render accordion list (V3)
  private renderAccordionList(filterQuery: string = ''): void {
    if (!this.list) return;

    const parents = this.getParentTypes();
    const lowerQuery = filterQuery.toLowerCase();
    let html = '';

    parents.forEach(parent => {
      const parentMatches = (parent.name || '').toLowerCase().includes(lowerQuery);
      const children = this.getChildTypes(parent.id);
      const matchingChildren = children.filter(child =>
        (child.name || '').toLowerCase().includes(lowerQuery)
      );

      if (!filterQuery || parentMatches || matchingChildren.length > 0) {
        const isExpanded = this.expandedParents.has(String(parent.id)) || !!filterQuery;
        const parentChecked = this.areAllChildrenSelected(parent.id);
        const displayChildren = filterQuery ? matchingChildren : children;

        html += `
          <div class="rs-property-type__accordion ${isExpanded ? 'rs-property-type__accordion--expanded' : ''}">
            <div class="rs-property-type__accordion-header">
              <label class="rs-property-type__checkbox-label" onclick="event.stopPropagation()">
                <input type="checkbox"
                       class="rs-property-type__checkbox"
                       value="${parent.id}"
                       data-is-parent="true"
                       ${parentChecked ? 'checked' : ''}>
                <span class="rs-property-type__checkbox-text"><strong>${this.escapeHtml(this.translateTypeName(parent.name))}</strong></span>
              </label>
              <button type="button" class="rs-property-type__accordion-toggle" data-parent-id="${parent.id}">
                ${isExpanded ? '−' : '+'}
              </button>
            </div>
            <div class="rs-property-type__accordion-content" style="display: ${isExpanded ? 'block' : 'none'}">
        `;

        displayChildren.forEach(child => {
          html += `
            <div class="rs-property-type__item rs-property-type__item--child">
              <label class="rs-property-type__checkbox-label">
                <input type="checkbox"
                       class="rs-property-type__checkbox"
                       value="${child.id}"
                       data-parent-id="${parent.id}"
                       ${this.selectedIds.has(String(child.id)) ? 'checked' : ''}>
                <span class="rs-property-type__checkbox-text">${this.escapeHtml(this.translateTypeName(child.name))}</span>
              </label>
            </div>
          `;
        });

        html += `</div></div>`;
      }
    });

    this.list.innerHTML = html || '<div class="rs-property-type__no-results">No results found</div>';
  }

  // Populate hierarchical select (V4)
  private populateHierarchicalSelect(): void {
    if (!this.select) return;

    const parents = this.getParentTypes();
    let html = `<option value="">${this.label('search_property_type')}</option>`;

    parents.forEach(parent => {
      html += `<option value="${parent.id}">${this.escapeHtml(this.translateTypeName(parent.name))}</option>`;

      const children = this.getChildTypes(parent.id);
      children.forEach(child => {
        html += `<option value="${child.id}">&nbsp;&nbsp;├─ ${this.escapeHtml(this.translateTypeName(child.name))}</option>`;
      });
    });

    this.select.innerHTML = html;

    // Restore selection if any
    if (this.selectedIds.size > 0) {
      this.select.value = Array.from(this.selectedIds)[0];
    }
  }

  bindEvents(): void {
    switch (this.variation) {
      case '2':
        this.bindFlatMultiSelectEvents();
        break;
      case '3':
        this.bindAccordionMultiSelectEvents();
        break;
      case '4':
        this.bindTraditionalDropdownEvents();
        break;
      default:
        this.bindTypeaheadEvents();
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e: Event) => {
      if (!this.element.contains(e.target as Node)) {
        this.hideDropdown();
      }
    });
  }

  // Bind events for V1 (Typeahead)
  private bindTypeaheadEvents(): void {
    if (!this.input || !this.list || !this.clearBtn) return;

    // Don't show dropdown on focus - only show when user types
    this.input.addEventListener('blur', () => {
      setTimeout(() => this.hideDropdown(), 200);
    });

    this.input.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.searchTerm = target.value.toLowerCase();
      if (this.clearBtn) {
        this.clearBtn.style.display = target.value ? 'block' : 'none';
      }

      // Only show dropdown when user starts typing
      if (target.value.length >= 1) {
        this.filterTypes();
        this.showDropdown();
      } else {
        this.hideDropdown();
      }
    });

    this.input.addEventListener('keydown', (e: KeyboardEvent) => this.handleKeyboard(e));

    this.list.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const item = target.closest('.rs-property-type__item') as HTMLElement | null;
      if (item && item.dataset.id && item.dataset.name) {
        this.selectSingleType(item.dataset.id, this.translateTypeName(item.dataset.name));
      }
    });

    this.clearBtn.addEventListener('click', () => this.clearSelection());
  }

  // Bind events for V2 (Flat Multi-Select)
  private bindFlatMultiSelectEvents(): void {
    if (!this.button || !this.filterInput || !this.list) return;

    let filterDebounce: ReturnType<typeof setTimeout> | undefined;

    this.button.addEventListener('click', (e: Event) => {
      e.preventDefault();
      this.toggleDropdown();
    });

    // Filter with 200ms debounce
    this.filterInput.addEventListener('input', (e: Event) => {
      clearTimeout(filterDebounce);
      filterDebounce = setTimeout(() => {
        const target = e.target as HTMLInputElement;
        this.renderFlatList(target.value.trim());
      }, 200);
    });

    this.list.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.classList.contains('rs-property-type__checkbox')) return;

      this.handleCheckboxChange(target);
    });
  }

  // Bind events for V3 (Accordion Multi-Select)
  private bindAccordionMultiSelectEvents(): void {
    if (!this.button || !this.filterInput || !this.list) return;

    let filterDebounce: ReturnType<typeof setTimeout> | undefined;

    this.button.addEventListener('click', (e: Event) => {
      e.preventDefault();
      this.toggleDropdown();
    });

    // Filter with 200ms debounce
    this.filterInput.addEventListener('input', (e: Event) => {
      clearTimeout(filterDebounce);
      filterDebounce = setTimeout(() => {
        const target = e.target as HTMLInputElement;
        this.renderAccordionList(target.value.trim());
      }, 200);
    });

    // Handle accordion toggle
    this.list.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const toggleBtn = target.closest('.rs-property-type__accordion-toggle') as HTMLButtonElement | null;
      if (toggleBtn) {
        const parentId = toggleBtn.dataset.parentId;
        const accordion = toggleBtn.closest('.rs-property-type__accordion');
        if (!accordion || !parentId) return;

        const content = accordion.querySelector('.rs-property-type__accordion-content') as HTMLElement | null;
        const isExpanded = accordion.classList.contains('rs-property-type__accordion--expanded');

        if (isExpanded) {
          accordion.classList.remove('rs-property-type__accordion--expanded');
          if (content) content.style.display = 'none';
          toggleBtn.textContent = '+';
          this.expandedParents.delete(parentId);
        } else {
          accordion.classList.add('rs-property-type__accordion--expanded');
          if (content) content.style.display = 'block';
          toggleBtn.textContent = '−';
          this.expandedParents.add(parentId);
        }
      }
    });

    // Handle checkbox changes
    this.list.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.classList.contains('rs-property-type__checkbox')) return;

      this.handleCheckboxChange(target);
    });
  }

  // Bind events for V4 (Traditional Dropdown)
  private bindTraditionalDropdownEvents(): void {
    if (!this.select) return;

    this.select.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const value = target.value;
      if (value) {
        this.selectedIds.clear();
        this.selectedIds.add(value);
        const option = target.options[target.selectedIndex];
        this.setFilter('propertyType', parseInt(value));
        this.setFilter('propertyTypeName', option.text.replace(/^\s*├─\s*/, ''));
      } else {
        this.selectedIds.clear();
        this.setFilter('propertyType', null);
        this.setFilter('propertyTypeName', '');
      }
    });
  }

  // Handle checkbox change for multi-select variations
  private handleCheckboxChange(checkbox: HTMLInputElement): void {
    const typeId = checkbox.value;
    const isParent = checkbox.dataset.isParent === 'true';

    if (isParent) {
      const childIds = this.getAllChildIds(typeId);

      if (checkbox.checked) {
        this.selectedIds.add(typeId);
        childIds.forEach(id => this.selectedIds.add(id));
      } else {
        this.selectedIds.delete(typeId);
        childIds.forEach(id => this.selectedIds.delete(id));
      }

      // Update child checkboxes in DOM
      if (this.list) {
        this.list.querySelectorAll<HTMLInputElement>(`input[data-parent-id="${typeId}"]`).forEach(cb => {
          cb.checked = checkbox.checked;
        });
      }
    } else {
      if (checkbox.checked) {
        this.selectedIds.add(typeId);
      } else {
        this.selectedIds.delete(typeId);
      }

      // Update parent checkbox state
      const parentId = checkbox.dataset.parentId;
      if (parentId && this.list) {
        const parentCheckbox = this.list.querySelector<HTMLInputElement>(`input[value="${parentId}"][data-is-parent="true"]`);
        if (parentCheckbox) {
          parentCheckbox.checked = this.areAllChildrenSelected(parentId);
        }
      }
    }

    this.updateButtonText();
    this.updateTags();
    this.updateFilters();
  }

  private filterTypes(): void {
    // Filter by search term and exclude items with 0 properties
    const typesWithProperties = this.propertyTypes.filter(type => hasProperties(type));

    if (!this.searchTerm) {
      this.filteredTypes = typesWithProperties;
    } else {
      this.filteredTypes = typesWithProperties.filter(type =>
        (type.name || '').toLowerCase().includes(this.searchTerm)
      );
    }
    this.highlightIndex = -1;
    this.updateTypeaheadList();
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
    this.highlightIndex = -1;
  }

  private toggleDropdown(): void {
    if (this.isOpen) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (!this.isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        this.showDropdown();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.highlightIndex = Math.min(this.highlightIndex + 1, this.filteredTypes.slice(0, 10).length - 1);
        this.updateTypeaheadList();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.highlightIndex = Math.max(this.highlightIndex - 1, 0);
        this.updateTypeaheadList();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.highlightIndex >= 0 && this.filteredTypes[this.highlightIndex]) {
          const type = this.filteredTypes[this.highlightIndex];
          this.selectSingleType(String(type.id), this.translateTypeName(type.name));
        }
        break;
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  private selectSingleType(id: string, name: string): void {
    this.selectedIds.clear();
    this.selectedIds.add(id);
    this.selectedName = name;

    this.setFilter('propertyType', parseInt(id));
    this.setFilter('propertyTypeName', name);

    if (this.input && this.clearBtn) {
      this.input.value = name;
      this.clearBtn.style.display = 'block';
    }

    this.hideDropdown();
  }

  private clearSelection(): void {
    this.selectedIds.clear();
    this.selectedName = '';
    this.setFilter('propertyType', null);
    this.setFilter('propertyTypeName', '');

    if (this.input && this.clearBtn) {
      this.input.value = '';
      this.clearBtn.style.display = 'none';
    }
    if (this.select) {
      this.select.value = '';
    }

    this.updateButtonText();
  }

  private updateButtonText(): void {
    if (!this.buttonText || !this.button) return;
    const count = this.selectedIds.size;
    if (count > 0) {
      this.buttonText.textContent = count + ' selected';
      this.button.classList.add('has-selection');
    } else {
      this.buttonText.textContent = this.label('search_property_type');
      this.button.classList.remove('has-selection');
    }
  }

  // Update tags for V2
  private updateTags(): void {
    if (!this.tagsContainer) return;

    if (this.selectedIds.size === 0) {
      this.tagsContainer.innerHTML = '';
      return;
    }

    // Get selected type names
    const selectedTypes: { id: number; name: string }[] = [];
    this.selectedIds.forEach(id => {
      const type = this.propertyTypes.find(t => String(t.id) === String(id));
      if (type) {
        selectedTypes.push({ id: type.id, name: type.name });
      }
    });

    const html = selectedTypes.map(type => `
      <span class="rs-property-type__tag" style="display: inline-flex; align-items: center; background: #2e7d32; color: white; padding: 4px 10px; border-radius: 4px; margin: 4px 4px 4px 0; font-size: 13px;">
        ${this.escapeHtml(this.translateTypeName(type.name))}
        <button type="button" class="rs-property-type__tag-remove" data-id="${type.id}" style="background: none; border: none; color: white; margin-left: 6px; cursor: pointer; font-size: 14px; padding: 0; line-height: 1;">&times;</button>
      </span>
    `).join('');

    this.tagsContainer.innerHTML = html;

    // Bind remove events
    this.tagsContainer.querySelectorAll<HTMLButtonElement>('.rs-property-type__tag-remove').forEach(btn => {
      btn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (id) {
          this.selectedIds.delete(String(id));
          this.updateButtonText();
          this.updateTags();
          this.updateFilters();
          this.renderFlatList(this.filterInput?.value || '');
        }
      });
    });
  }

  private updateFilters(): void {
    if (this.selectedIds.size > 0) {
      const ids = Array.from(this.selectedIds).map(id => parseInt(id));
      this.setFilter('propertyType', ids.length === 1 ? ids[0] : ids);
    } else {
      this.setFilter('propertyType', null);
    }
  }

  private updateList(): void {
    switch (this.variation) {
      case '2':
        this.renderFlatList();
        break;
      case '3':
        this.renderAccordionList();
        break;
      case '4':
        this.populateHierarchicalSelect();
        break;
      default:
        this.filterTypes();
    }
  }

  private updateDisplay(): void {
    const currentFilter = this.getFilter<number | number[] | null>('propertyType');

    // Variation 1: Typeahead
    if (this.input) {
      this.input.value = this.selectedName || '';
    }

    // Variation 4: Traditional dropdown
    if (this.select) {
      this.select.value = this.selectedIds.size > 0 ? Array.from(this.selectedIds)[0] : '';
    }

    // Variations 2 & 3: Multi-select - sync checkbox states with selectedIds
    if (this.variation === '2' || this.variation === '3') {
      // Update checkbox states to match selectedIds
      this.element.querySelectorAll<HTMLInputElement>('.rs-property-type__checkbox').forEach(checkbox => {
        const isParent = checkbox.dataset.isParent === 'true';
        if (isParent) {
          // Parent checkbox: checked if all children are selected
          const parentId = checkbox.value;
          checkbox.checked = this.areAllChildrenSelected(parentId);
        } else {
          // Child checkbox: checked if in selectedIds
          checkbox.checked = this.selectedIds.has(checkbox.value);
        }
      });
      // Update tags
      this.updateTags();
      // Clear name if no filter
      if (!currentFilter) {
        this.selectedName = '';
      }
    }

    this.updateButtonText();
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('rs_property_type', RSPropertyType as unknown as ComponentConstructor);

export { RSPropertyType };
export default RSPropertyType;
