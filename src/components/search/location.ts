/**
 * RealtySoft Widget v3 - Location Component
 * Variations:
 *   1 = Search/Autocomplete (typeahead single select)
 *   2 = Two Dropdowns (parent + child cascading multi-select)
 *   3 = Hierarchical Multi-Select (single dropdown with tree)
 *   4 = Traditional Dropdown (simple select with hierarchy)
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  Location,
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

interface ExtendedLocation extends Location {
  type?: string;
  count?: number;
  level?: number;
}

/**
 * Check if a location has properties (property_count > 0)
 * Returns true if property_count is undefined (backwards compatibility) or > 0
 * Returns false only if property_count is explicitly 0
 */
function hasProperties(loc: ExtendedLocation): boolean {
  const count = loc.property_count;
  // Debug logging
  if (count === 0) {
    Logger.debug(`[RealtySoft] Filtering out location with 0 properties: ${loc.name} (id: ${loc.id})`);
  }
  // If property_count doesn't exist, show the location (backwards compatibility)
  if (count === undefined || count === null) return true;
  return count > 0;
}

/**
 * Check if a parent location or any of its descendants have properties
 * A parent is shown only if:
 * 1. It has property_count > 0, OR
 * 2. At least one of its descendants has property_count > 0
 */
function hasPropertiesOrChildren(loc: ExtendedLocation, allLocations: ExtendedLocation[]): boolean {
  // Check if the location itself has properties
  const selfHasProperties = hasProperties(loc);

  // Get all descendants (children, grandchildren, etc.)
  const getAllDescendants = (parentId: number | string): ExtendedLocation[] => {
    const children = allLocations.filter(child => {
      const pid = child.parent_id;
      if (!pid && pid !== 0) return false;
      return String(pid) === String(parentId);
    });

    let descendants = [...children];
    children.forEach(child => {
      descendants = descendants.concat(getAllDescendants(child.id));
    });
    return descendants;
  };

  const descendants = getAllDescendants(loc.id);
  const anyDescendantHasProperties = descendants.some(d => hasProperties(d));

  // Show if self has properties OR any descendant has properties
  return selfHasProperties || anyDescendantHasProperties;
}

class RSLocation extends RSBaseComponent {
  private lockedMode: boolean = false;
  private locations: ExtendedLocation[] = [];
  private selectedLocations: Set<string> = new Set();
  private selectedLocation: number | null = null;
  private selectedName: string = '';
  private isOpen: boolean = false;
  private searchTerm: string = '';
  private filteredLocations: ExtendedLocation[] = [];
  private highlightIndex: number = -1;

  // For variation 2 (two dropdowns)
  private selectedParents: Set<string> = new Set();
  private selectedChildren: Set<string> = new Set();
  private parentType: string = 'municipality';
  private childType: string = 'city';
  private parentLabel: string = '';
  private childLabel: string = '';

  // DOM elements
  private input: HTMLInputElement | null = null;
  private dropdown: HTMLElement | null = null;
  private list: HTMLElement | null = null;
  private clearBtn: HTMLButtonElement | null = null;
  private select: HTMLSelectElement | null = null;
  private multiBtn: HTMLButtonElement | null = null;
  private filterInput: HTMLInputElement | null = null;
  private hierarchyList: HTMLElement | null = null;
  private tagsContainer: HTMLElement | null = null;

  // For variation 2
  private parentBtn: HTMLButtonElement | null = null;
  private parentDropdown: HTMLElement | null = null;
  private parentList: HTMLElement | null = null;
  private parentFilter: HTMLInputElement | null = null;
  private childBtn: HTMLButtonElement | null = null;
  private childDropdown: HTMLElement | null = null;
  private childList: HTMLElement | null = null;
  private childFilter: HTMLInputElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.lockedMode = this.isLocked('location');
    this.locations = RealtySoftState.get<ExtendedLocation[]>('data.locations') || [];

    // Debug: Log location data on init
    const zeroCount = this.locations.filter(l => l.property_count === 0);
    const undefinedCount = this.locations.filter(l => l.property_count === undefined || l.property_count === null);
    Logger.debug(`[RealtySoft] Location init: ${this.locations.length} locations, ${zeroCount.length} with count=0, ${undefinedCount.length} with count=undefined`);
    if (zeroCount.length > 0) {
      Logger.debug(`[RealtySoft] Zero-count: ${zeroCount.slice(0, 15).map(l => `${l.name}(id:${l.id})`).join(', ')}`);
    }
    this.selectedLocations = new Set();
    this.selectedLocation = this.getFilter<number | null>('location');
    this.selectedName = this.getFilter<string>('locationName') || '';
    this.isOpen = false;
    this.searchTerm = '';
    this.filteredLocations = [];
    this.highlightIndex = -1;

    // For variation 2 (two dropdowns)
    this.selectedParents = new Set();
    this.selectedChildren = new Set();

    // Get parent/child type from data attributes or defaults
    this.parentType = this.element.dataset.rsParentType || 'municipality';
    this.childType = this.element.dataset.rsChildType || 'city';

    // If locked, find the location name for display
    if (this.lockedMode) {
      const lockedValue = this.getFilter<number | null>('location');
      if (lockedValue) {
        const lockedLocation = this.locations.find(loc => loc.id == lockedValue);
        if (lockedLocation) {
          this.selectedName = lockedLocation.name;
        }
      }
    }

    // If we have a location ID but no name (e.g., from URL params), look up the name
    if (this.selectedLocation && !this.selectedName && this.locations.length > 0) {
      const loc = this.locations.find(l => l.id === this.selectedLocation);
      if (loc) {
        this.selectedName = loc.name;
        // Also update the state so other components can use it
        this.setFilter('locationName', loc.name);
      }
    }

    this.render();

    // Apply locked styles if locked (but still show the component)
    if (this.lockedMode) {
      this.applyLockedStyle();
    } else {
      this.bindEvents();
    }

    // If we have a pre-selected location, update the display
    if (this.selectedLocation) {
      this.updateDisplay();
    }

    // Subscribe to location data updates
    this.subscribe<ExtendedLocation[]>('data.locations', (locations) => {
      this.locations = locations;

      // Debug: Log locations with property_count = 0 or undefined
      const zeroCountLocs = locations.filter(l => l.property_count === 0);
      const undefinedCountLocs = locations.filter(l => l.property_count === undefined || l.property_count === null);
      Logger.debug(`[RealtySoft] Location data: ${locations.length} total, ${zeroCountLocs.length} with count=0, ${undefinedCountLocs.length} with count=undefined`);
      if (zeroCountLocs.length > 0) {
        Logger.debug(`[RealtySoft] Zero-count locations: ${zeroCountLocs.slice(0, 10).map(l => `${l.name}(id:${l.id},type:${l.type})`).join(', ')}${zeroCountLocs.length > 10 ? '...' : ''}`);
      }

      // If we have a location ID but no name, look it up now that we have data
      if (this.selectedLocation && !this.selectedName) {
        const loc = this.locations.find(l => l.id === this.selectedLocation);
        if (loc) {
          this.selectedName = loc.name;
          this.setFilter('locationName', loc.name);
          this.updateDisplay();
        }
      }
      this.updateLocationData();
    });

    // Subscribe to filter changes
    this.subscribe<number | null>('filters.location', (value) => {
      this.selectedLocation = value;
      this.updateDisplay();
    });
  }

  private getParentLocations(): ExtendedLocation[] {
    // Filter by parentType (default: municipality) and exclude items with 0 properties
    // For parents, also check if they have children with properties
    const allParents = this.locations.filter(loc =>
      loc.type && loc.type.toLowerCase() === this.parentType.toLowerCase()
    );

    // First filter by property_count
    let filtered = allParents.filter(loc => hasPropertiesOrChildren(loc, this.locations));

    // For variation 2 (Two Dropdowns), also filter out parents with no children
    // This handles cases where API has incorrect property_count but parent has no actual children
    if (this.variation === '2') {
      filtered = filtered.filter(parent => {
        const children = this.locations.filter(loc => {
          const pid = loc.parent_id;
          if (!pid && pid !== 0) return false;
          const matchesParent = String(pid) === String(parent.id);
          const matchesType = loc.type && loc.type.toLowerCase() === this.childType.toLowerCase();
          return matchesParent && matchesType && hasProperties(loc);
        });
        return children.length > 0;
      });
    }

    const filteredOut = allParents.filter(p => !filtered.includes(p));
    Logger.debug(`[RealtySoft] Location parents: ${allParents.length} total, ${filtered.length} after filtering, ${filteredOut.length} filtered out`);

    if (filteredOut.length > 0) {
      Logger.debug(`[RealtySoft] Filtered out parents: ${filteredOut.map(p => `${p.name}(id:${p.id},count:${p.property_count})`).join(', ')}`);
    }

    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  private getChildLocations(parentId: number | string): ExtendedLocation[] {
    // Get the parent location to check for duplicate names
    const parent = this.locations.find(loc => String(loc.id) === String(parentId));
    const parentName = parent?.name?.toLowerCase().trim() || '';

    // Get locations of childType that have this parentId, exclude items with 0 properties
    const allChildren = this.locations.filter(loc => {
      const pid = loc.parent_id;
      const matchesParent = pid && String(pid) === String(parentId);
      const matchesType = loc.type && loc.type.toLowerCase() === this.childType.toLowerCase();
      return matchesParent && matchesType;
    });

    // Filter by property_count and exclude children with same name as parent
    const filtered = allChildren.filter(loc => {
      const hasProps = hasProperties(loc);
      const isDuplicateName = loc.name?.toLowerCase().trim() === parentName;
      return hasProps && !isDuplicateName;
    });

    Logger.debug(`[RealtySoft] Child locations for parent ${parentId}: ${allChildren.length} total, ${filtered.length} after filtering`);

    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  // Get all descendants of a location (recursive)
  private getAllDescendants(parentId: number | string): ExtendedLocation[] {
    const descendants: ExtendedLocation[] = [];
    const children = this.locations.filter(loc => {
      const pid = loc.parent_id;
      return pid && String(pid) === String(parentId);
    });
    children.forEach(child => {
      descendants.push(child);
      descendants.push(...this.getAllDescendants(child.id));
    });
    return descendants;
  }

  private getAllLocationsFlat(): ExtendedLocation[] {
    const result: ExtendedLocation[] = [];

    // Build full hierarchy tree recursively, excluding items with 0 properties
    const buildFlat = (parentId: number | string | null, level: number) => {
      const children = this.locations.filter(loc => {
        const pid = loc.parent_id;
        let matchesParent = false;
        if (parentId === null) {
          matchesParent = pid === null || pid === undefined || pid === 0 || String(pid) === '0' || String(pid) === '';
        } else {
          matchesParent = pid && String(pid) === String(parentId);
        }
        return matchesParent && hasProperties(loc);
      }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      children.forEach(loc => {
        result.push({ ...loc, level });
        buildFlat(loc.id, level + 1);
      });
    };

    buildFlat(null, 0);

    // If hierarchy build found nothing, return all locations with properties sorted alphabetically
    if (result.length === 0 && this.locations.length > 0) {
      return [...this.locations].filter(loc => hasProperties(loc)).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }

  render(): void {
    Logger.debug(`[RealtySoft] Location render() - variation: ${this.variation}`);
    this.element.classList.add('rs-location', `rs-location--v${this.variation}`);

    switch (this.variation) {
      case '2':
        Logger.debug('[RealtySoft] Location: rendering Two Dropdowns');
        this.renderTwoDropdowns();
        break;
      case '3':
        Logger.debug('[RealtySoft] Location: rendering Hierarchical MultiSelect');
        this.renderHierarchicalMultiSelect();
        break;
      case '4':
        Logger.debug('[RealtySoft] Location: rendering Traditional Dropdown');
        this.renderTraditionalDropdown();
        break;
      default:
        Logger.debug('[RealtySoft] Location: rendering Typeahead');
        this.renderTypeahead();
    }
  }

  // VARIATION 1: Search/Autocomplete (Typeahead)
  private renderTypeahead(): void {
    this.element.innerHTML = `
      <div class="rs-location__wrapper">
        <label class="rs-location__label">${this.label('search_location')}</label>
        <div class="rs-location__input-wrapper">
          <input type="text"
                 class="rs-location__input"
                 placeholder="Enter location name"
                 value="${this.selectedName}"
                 autocomplete="off">
          ${this.selectedLocation ? '<button class="rs-location__clear" type="button">&times;</button>' : ''}
        </div>
        <div class="rs-location__dropdown" style="display: none;">
          <ul class="rs-location__list"></ul>
        </div>
      </div>
    `;

    this.input = this.element.querySelector('.rs-location__input');
    this.dropdown = this.element.querySelector('.rs-location__dropdown');
    this.list = this.element.querySelector('.rs-location__list');
    this.clearBtn = this.element.querySelector('.rs-location__clear');
  }

  // VARIATION 2: Two Dropdowns (Parent + Child)
  private renderTwoDropdowns(): void {
    this.parentLabel = this.label('search_location') || 'Location';
    this.childLabel = this.label('search_sublocation') || 'Sub-location';

    this.element.innerHTML = `
      <div class="rs-location__wrapper rs-location__two-dropdowns">
        <label class="rs-location__label">${this.label('search_location')}</label>

        <div class="rs-location__parent-container">
          <button type="button" class="rs-location__multi-btn rs-location__parent-btn">
            ${this.parentLabel}
          </button>
          <div class="rs-location__dropdown rs-location__parent-dropdown" style="display: none;">
            <input type="text" class="rs-location__filter-input" placeholder="${this.label('search_location_placeholder') || 'Search location...'}">
            <div class="rs-location__checklist rs-location__parent-list"></div>
          </div>
        </div>

        <div class="rs-location__child-container" style="margin-top: 10px;">
          <button type="button" class="rs-location__multi-btn rs-location__child-btn" disabled>
            ${this.childLabel}
          </button>
          <div class="rs-location__dropdown rs-location__child-dropdown" style="display: none;">
            <input type="text" class="rs-location__filter-input" placeholder="${this.label('search_location_placeholder') || 'Search location...'}">
            <div class="rs-location__checklist rs-location__child-list"></div>
          </div>
        </div>
      </div>
    `;

    this.parentBtn = this.element.querySelector('.rs-location__parent-btn');
    this.parentDropdown = this.element.querySelector('.rs-location__parent-dropdown');
    this.parentList = this.element.querySelector('.rs-location__parent-list');
    this.parentFilter = this.parentDropdown?.querySelector('.rs-location__filter-input') || null;

    this.childBtn = this.element.querySelector('.rs-location__child-btn');
    this.childDropdown = this.element.querySelector('.rs-location__child-dropdown');
    this.childList = this.element.querySelector('.rs-location__child-list');
    this.childFilter = this.childDropdown?.querySelector('.rs-location__filter-input') || null;

    this.renderParentChecklist();
  }

  private renderParentChecklist(filter: string = ''): void {
    if (!this.parentList) return;

    const parents = this.getParentLocations();
    const filtered = filter
      ? parents.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      : parents;

    if (filtered.length === 0) {
      this.parentList.innerHTML = '<div class="rs-location__no-results">No results</div>';
      return;
    }

    this.parentList.innerHTML = filtered.map(loc => `
      <label class="rs-location__check-item">
        <input type="checkbox" value="${loc.id}" data-name="${this.escapeHtml(loc.name)}"
               ${this.selectedParents.has(String(loc.id)) ? 'checked' : ''}>
        <span>${this.escapeHtml(loc.name)}</span>
        ${loc.count ? `<span class="rs-location__count">(${loc.count})</span>` : ''}
      </label>
    `).join('');
  }

  private renderChildChecklist(filter: string = ''): void {
    if (!this.childList) return;

    if (this.selectedParents.size === 0) {
      this.childList.innerHTML = '<div class="rs-location__no-results">Select a municipality first</div>';
      return;
    }

    let children: ExtendedLocation[] = [];
    this.selectedParents.forEach(parentId => {
      children = children.concat(this.getChildLocations(parentId));
    });

    const filtered = filter
      ? children.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
      : children;

    if (filtered.length === 0) {
      this.childList.innerHTML = '<div class="rs-location__no-results">No areas found</div>';
      return;
    }

    this.childList.innerHTML = filtered.map(loc => `
      <label class="rs-location__check-item">
        <input type="checkbox" value="${loc.id}" data-name="${this.escapeHtml(loc.name)}"
               ${this.selectedChildren.has(String(loc.id)) ? 'checked' : ''}>
        <span>${this.escapeHtml(loc.name)}</span>
        ${loc.count ? `<span class="rs-location__count">(${loc.count})</span>` : ''}
      </label>
    `).join('');
  }

  // VARIATION 3: Hierarchical Multi-Select
  private renderHierarchicalMultiSelect(): void {
    this.element.innerHTML = `
      <div class="rs-location__wrapper">
        <label class="rs-location__label">${this.label('search_location')}</label>
        <button type="button" class="rs-location__multi-btn">
          ${this.label('search_location') || 'Location'}
        </button>
        <div class="rs-location__dropdown" style="display: none;">
          <input type="text" class="rs-location__filter-input" placeholder="${this.label('search_location_placeholder') || 'Search location...'}">
          <div class="rs-location__checklist rs-location__hierarchy-list"></div>
        </div>
        <div class="rs-location__tags"></div>
      </div>
    `;

    this.multiBtn = this.element.querySelector('.rs-location__multi-btn');
    this.dropdown = this.element.querySelector('.rs-location__dropdown');
    this.filterInput = this.element.querySelector('.rs-location__filter-input');
    this.hierarchyList = this.element.querySelector('.rs-location__hierarchy-list');
    this.tagsContainer = this.element.querySelector('.rs-location__tags');

    this.renderHierarchyChecklist();
  }

  private renderHierarchyChecklist(filter: string = ''): void {
    if (!this.hierarchyList) return;

    const parents = this.getParentLocations();
    let html = '';

    parents.forEach(parent => {
      const children = this.getChildLocations(parent.id);
      const matchesFilter = !filter || parent.name.toLowerCase().includes(filter.toLowerCase());
      const childrenMatch = children.some(c => c.name.toLowerCase().includes(filter.toLowerCase()));

      if (!matchesFilter && !childrenMatch) return;

      html += `
        <div class="rs-location__parent-group">
          <label class="rs-location__check-item rs-location__check-item--parent">
            <input type="checkbox" value="${parent.id}" data-name="${this.escapeHtml(parent.name)}" data-is-parent="true"
                   ${this.selectedLocations.has(String(parent.id)) ? 'checked' : ''}>
            <strong>${this.escapeHtml(parent.name)}</strong>
            ${parent.count ? `<span class="rs-location__count">(${parent.count})</span>` : ''}
          </label>
          <div class="rs-location__children">
      `;

      children.forEach(child => {
        if (filter && !child.name.toLowerCase().includes(filter.toLowerCase()) && !matchesFilter) return;
        html += `
          <label class="rs-location__check-item rs-location__check-item--child">
            <input type="checkbox" value="${child.id}" data-name="${this.escapeHtml(child.name)}" data-parent-id="${parent.id}"
                   ${this.selectedLocations.has(String(child.id)) ? 'checked' : ''}>
            <span>${this.escapeHtml(child.name)}</span>
            ${child.count ? `<span class="rs-location__count">(${child.count})</span>` : ''}
          </label>
        `;
      });

      html += `</div></div>`;
    });

    this.hierarchyList.innerHTML = html || '<div class="rs-location__no-results">No locations found</div>';
  }

  // VARIATION 4: Traditional Dropdown
  private renderTraditionalDropdown(): void {
    this.element.innerHTML = `
      <div class="rs-location__wrapper">
        <label class="rs-location__label">${this.label('search_location')}</label>
        <div class="rs-location__select-wrapper">
          <select class="rs-location__select">
            <option value="">${this.label('search_location')}</option>
          </select>
        </div>
      </div>
    `;

    this.select = this.element.querySelector('.rs-location__select');
    this.populateTraditionalSelect();
  }

  private populateTraditionalSelect(): void {
    if (!this.select) return;

    let html = `<option value="">${this.label('search_location')}</option>`;

    // Get municipalities (parents) and cities (children), excluding items with 0 properties
    // For parents, show if they or their children have properties
    const municipalities = this.locations
      .filter(loc => loc.type && loc.type.toLowerCase() === this.parentType.toLowerCase() &&
                     hasPropertiesOrChildren(loc, this.locations))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    municipalities.forEach(municipality => {
      // Add municipality with type label
      html += `<option value="${municipality.id}">${this.escapeHtml(municipality.name)} • ${municipality.type}</option>`;

      // Find all cities that belong to this municipality (direct or via descendants)
      const descendantIds = new Set<number>();
      const collectDescendants = (parentId: number | string) => {
        this.locations.forEach(loc => {
          if (loc.parent_id && String(loc.parent_id) === String(parentId)) {
            descendantIds.add(loc.id);
            collectDescendants(loc.id);
          }
        });
      };
      collectDescendants(municipality.id);

      // Get cities that are descendants of this municipality, excluding items with 0 properties
      const cities = this.locations
        .filter(loc => {
          if (!loc.type || loc.type.toLowerCase() !== this.childType.toLowerCase()) return false;
          if (!hasProperties(loc)) return false;
          // Check if city is direct child or descendant
          return (loc.parent_id && String(loc.parent_id) === String(municipality.id)) ||
                 descendantIds.has(loc.id);
        })
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      cities.forEach(city => {
        html += `<option value="${city.id}">&nbsp;&nbsp;├─ ${this.escapeHtml(city.name)}</option>`;
      });
    });

    this.select.innerHTML = html;

    if (this.selectedLocation) {
      this.select.value = String(this.selectedLocation);
    }
  }

  bindEvents(): void {
    switch (this.variation) {
      case '2':
        this.bindTwoDropdownsEvents();
        break;
      case '3':
        this.bindHierarchicalEvents();
        break;
      case '4':
        this.bindTraditionalEvents();
        break;
      default:
        this.bindTypeaheadEvents();
    }
  }

  private bindTypeaheadEvents(): void {
    if (!this.input || !this.list) return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    // Don't show dropdown on focus - only show when user types
    this.input.addEventListener('blur', () => {
      setTimeout(() => this.hideDropdown(), 200);
    });

    this.input.addEventListener('input', (e: Event) => {
      clearTimeout(debounceTimer);
      const target = e.target as HTMLInputElement;
      this.searchTerm = target.value;

      // Only show dropdown when user starts typing
      if (this.searchTerm.length >= 1) {
        debounceTimer = setTimeout(() => {
          this.searchLocations(this.searchTerm);
          this.showDropdown();
        }, 300);
      } else {
        this.hideDropdown();
      }
    });

    this.input.addEventListener('keydown', (e: KeyboardEvent) => {
      this.handleKeyboard(e);
    });

    this.list.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const item = target.closest('.rs-location__item') as HTMLElement | null;
      if (item && item.dataset.id && item.dataset.name) {
        this.selectLocation(parseInt(item.dataset.id), item.dataset.name);
      }
    });

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clearSelection());
    }

    document.addEventListener('click', (e: Event) => {
      if (!this.element.contains(e.target as Node)) {
        this.hideDropdown();
      }
    });
  }

  private bindTwoDropdownsEvents(): void {
    // Debounce timers for filter inputs
    let parentFilterDebounce: ReturnType<typeof setTimeout> | undefined;
    let childFilterDebounce: ReturnType<typeof setTimeout> | undefined;

    // Parent button toggle
    if (this.parentBtn) {
      this.parentBtn.addEventListener('click', () => {
        this.toggleDropdownEl(this.parentDropdown);
        this.hideDropdownEl(this.childDropdown);
      });
    }

    // Child button toggle
    if (this.childBtn) {
      this.childBtn.addEventListener('click', () => {
        if (!this.childBtn!.disabled) {
          this.toggleDropdownEl(this.childDropdown);
          this.hideDropdownEl(this.parentDropdown);
        }
      });
    }

    // Parent filter with 200ms debounce
    if (this.parentFilter) {
      this.parentFilter.addEventListener('input', (e: Event) => {
        clearTimeout(parentFilterDebounce);
        parentFilterDebounce = setTimeout(() => {
          const target = e.target as HTMLInputElement;
          this.renderParentChecklist(target.value);
        }, 200);
      });
    }

    // Child filter with 200ms debounce
    if (this.childFilter) {
      this.childFilter.addEventListener('input', (e: Event) => {
        clearTimeout(childFilterDebounce);
        childFilterDebounce = setTimeout(() => {
          const target = e.target as HTMLInputElement;
          this.renderChildChecklist(target.value);
        }, 200);
      });
    }

    // Parent checkbox changes
    if (this.parentList) {
      this.parentList.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox') {
          const id = String(target.value);
          if (target.checked) {
            this.selectedParents.add(id);
          } else {
            this.selectedParents.delete(id);
            // Remove children of this parent
            this.getChildLocations(id).forEach(child => {
              this.selectedChildren.delete(String(child.id));
            });
          }
          this.updateTwoDropdownsState();
        }
      });
    }

    // Child checkbox changes
    if (this.childList) {
      this.childList.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox') {
          const id = String(target.value);
          if (target.checked) {
            this.selectedChildren.add(id);
          } else {
            this.selectedChildren.delete(id);
          }
          this.updateTwoDropdownsState();
        }
      });
    }

    // Close on outside click
    document.addEventListener('click', (e: Event) => {
      if (!this.element.contains(e.target as Node)) {
        this.hideDropdownEl(this.parentDropdown);
        this.hideDropdownEl(this.childDropdown);
      }
    });
  }

  private updateTwoDropdownsState(): void {
    // Update parent button text
    if (this.selectedParents.size > 0) {
      if (this.parentBtn) {
        this.parentBtn.textContent = this.selectedParents.size + ' selected';
        this.parentBtn.classList.add('has-selection');
      }
      if (this.childBtn) {
        this.childBtn.disabled = false;
      }
    } else {
      if (this.parentBtn) {
        this.parentBtn.textContent = this.parentLabel || this.label('search_location') || 'Location';
        this.parentBtn.classList.remove('has-selection');
      }
      if (this.childBtn) {
        this.childBtn.disabled = true;
        this.childBtn.textContent = this.childLabel || this.label('search_sublocation') || 'Sub-location';
      }
    }

    // Update child button text
    if (this.selectedChildren.size > 0) {
      if (this.childBtn) {
        this.childBtn.textContent = this.selectedChildren.size + ' selected';
        this.childBtn.classList.add('has-selection');
      }
    } else if (this.childBtn && !this.childBtn.disabled) {
      this.childBtn.textContent = this.childLabel || this.label('search_sublocation') || 'Sub-location';
      this.childBtn.classList.remove('has-selection');
    }

    // Render child list
    this.renderChildChecklist(this.childFilter?.value || '');

    // Update filter - use children if selected, otherwise parents
    const locationIds = this.selectedChildren.size > 0
      ? Array.from(this.selectedChildren)
      : Array.from(this.selectedParents);

    if (locationIds.length > 0) {
      this.setFilter('location', locationIds.join(','));
    } else {
      this.setFilter('location', null);
    }
  }

  private bindHierarchicalEvents(): void {
    let filterDebounce: ReturnType<typeof setTimeout> | undefined;

    if (this.multiBtn) {
      this.multiBtn.addEventListener('click', () => {
        this.toggleDropdownEl(this.dropdown);
      });
    }

    // Filter with 200ms debounce
    if (this.filterInput) {
      this.filterInput.addEventListener('input', (e: Event) => {
        clearTimeout(filterDebounce);
        filterDebounce = setTimeout(() => {
          const target = e.target as HTMLInputElement;
          this.renderHierarchyChecklist(target.value);
        }, 200);
      });
    }

    if (this.hierarchyList) {
      this.hierarchyList.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox') {
          const id = String(target.value);
          const isParent = target.dataset.isParent === 'true';

          if (target.checked) {
            this.selectedLocations.add(id);
            // If parent, optionally select all children
            if (isParent) {
              const children = this.getChildLocations(id);
              children.forEach(child => {
                this.selectedLocations.add(String(child.id));
              });
              this.renderHierarchyChecklist(this.filterInput?.value || '');
            }
          } else {
            this.selectedLocations.delete(id);
            if (isParent) {
              const children = this.getChildLocations(id);
              children.forEach(child => {
                this.selectedLocations.delete(String(child.id));
              });
              this.renderHierarchyChecklist(this.filterInput?.value || '');
            }
          }

          this.updateHierarchicalState();
        }
      });
    }

    document.addEventListener('click', (e: Event) => {
      if (!this.element.contains(e.target as Node)) {
        this.hideDropdownEl(this.dropdown);
      }
    });
  }

  private updateHierarchicalState(): void {
    // Update button
    if (this.multiBtn) {
      if (this.selectedLocations.size > 0) {
        this.multiBtn.textContent = this.selectedLocations.size + ' selected';
        this.multiBtn.classList.add('has-selection');
      } else {
        this.multiBtn.textContent = this.label('search_location') || 'Location';
        this.multiBtn.classList.remove('has-selection');
      }
    }

    // Update tags
    this.updateTags();

    // Update filter
    if (this.selectedLocations.size > 0) {
      this.setFilter('location', Array.from(this.selectedLocations).join(','));
    } else {
      this.setFilter('location', null);
    }
  }

  private updateTags(): void {
    if (!this.tagsContainer) return;

    const tags: string[] = [];
    this.selectedLocations.forEach(id => {
      const loc = this.locations.find(l => String(l.id) === id);
      if (loc) {
        tags.push(`
          <span class="rs-location__tag">
            ${this.escapeHtml(loc.name)}
            <button type="button" class="rs-location__tag-remove" data-id="${id}">&times;</button>
          </span>
        `);
      }
    });

    this.tagsContainer.innerHTML = tags.join('');

    // Bind tag remove events
    this.tagsContainer.querySelectorAll<HTMLButtonElement>('.rs-location__tag-remove').forEach(btn => {
      btn.addEventListener('click', (e: Event) => {
        const id = btn.dataset.id;
        if (id) {
          this.selectedLocations.delete(id);
          this.renderHierarchyChecklist(this.filterInput?.value || '');
          this.updateHierarchicalState();
        }
      });
    });
  }

  private bindTraditionalEvents(): void {
    if (!this.select) return;

    this.select.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const option = target.options[target.selectedIndex];
      this.setFilter('location', target.value ? parseInt(target.value) : null);
      this.setFilter('locationName', option.text.trim() || '');
    });
  }

  private toggleDropdownEl(dropdown: HTMLElement | null): void {
    if (!dropdown) return;
    if (dropdown.style.display === 'none') {
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  }

  private showDropdown(dropdown?: HTMLElement | null): void {
    const dd = dropdown || this.dropdown;
    if (!dd) return;
    this.isOpen = true;
    dd.style.display = 'block';
  }

  private hideDropdown(dropdown?: HTMLElement | null): void {
    const dd = dropdown || this.dropdown;
    if (!dd) return;
    this.isOpen = false;
    dd.style.display = 'none';
    this.highlightIndex = -1;
  }

  private hideDropdownEl(dropdown: HTMLElement | null): void {
    if (!dropdown) return;
    dropdown.style.display = 'none';
  }

  /**
   * Search locations using client-side filtering on preloaded data
   * This is instant since all locations are already loaded
   */
  private searchLocations(term: string): void {
    if (!term || term.length < 2) {
      this.filteredLocations = this.getAllLocationsFlat().slice(0, 15);
      this.updateDropdownItems();
      return;
    }

    // Client-side filtering for instant results
    const lowerTerm = term.toLowerCase();
    this.filteredLocations = this.getAllLocationsFlat().filter(loc =>
      loc.name.toLowerCase().includes(lowerTerm)
    ).slice(0, 20);
    this.updateDropdownItems();
  }

  private updateDropdownItems(): void {
    if (!this.list) return;

    if (this.filteredLocations.length === 0) {
      this.list.innerHTML = `<li class="rs-location__empty">${this.label('no_results') || 'No results found'}</li>`;
      return;
    }

    this.list.innerHTML = this.filteredLocations.map((loc, index) => {
      // Show type label on right side for all except City
      const locType = loc.type ? loc.type.toLowerCase() : '';
      const showType = locType && locType !== 'city';
      const typeLabel = showType ? `<span class="rs-location__type">${this.escapeHtml(loc.type || '')}</span>` : '';

      return `
        <li class="rs-location__item ${loc.level ? 'rs-location__item--child' : ''} ${index === this.highlightIndex ? 'rs-location__item--highlight' : ''}"
            data-id="${loc.id}"
            data-name="${this.escapeHtml(loc.name)}">
          <span class="rs-location__name">
            ${loc.level ? '<span class="rs-location__indent"></span>' : ''}
            ${this.escapeHtml(loc.name)}
          </span>
          ${typeLabel}
          ${loc.count ? `<span class="rs-location__count">(${loc.count})</span>` : ''}
        </li>
      `;
    }).join('');
  }

  private updateLocationData(): void {
    switch (this.variation) {
      case '2':
        this.renderParentChecklist();
        break;
      case '3':
        this.renderHierarchyChecklist();
        break;
      case '4':
        this.populateTraditionalSelect();
        break;
      default:
        this.filteredLocations = this.getAllLocationsFlat().slice(0, 15);
        this.updateDropdownItems();
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
        this.highlightIndex = Math.min(this.highlightIndex + 1, this.filteredLocations.length - 1);
        this.updateDropdownItems();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.highlightIndex = Math.max(this.highlightIndex - 1, 0);
        this.updateDropdownItems();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.highlightIndex >= 0 && this.filteredLocations[this.highlightIndex]) {
          const loc = this.filteredLocations[this.highlightIndex];
          this.selectLocation(loc.id, loc.name);
        }
        break;
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  private selectLocation(id: number, name: string): void {
    this.selectedLocation = id;
    this.selectedName = name;

    this.setFilter('location', this.selectedLocation);
    this.setFilter('locationName', name);

    this.updateDisplay();
    this.hideDropdown();
  }

  private clearSelection(): void {
    this.selectedLocation = null;
    this.selectedName = '';
    this.setFilter('location', null);
    this.setFilter('locationName', '');
    this.updateDisplay();
  }

  private updateDisplay(): void {
    // Variation 1: Typeahead
    if (this.input) {
      this.input.value = this.selectedName || '';
    }

    // Variation 4: Traditional dropdown
    if (this.select) {
      this.select.value = this.selectedLocation?.toString() || '';
    }

    const clearBtn = this.element.querySelector<HTMLButtonElement>('.rs-location__clear');
    if (clearBtn) {
      clearBtn.style.display = this.selectedLocation ? 'block' : 'none';
    }

    // Variation 2: Two dropdowns
    if (this.variation === '2') {
      if (this.selectedLocation) {
        // Find the location and its parent to pre-select
        const loc = this.locations.find(l => l.id === this.selectedLocation);
        if (loc) {
          // Check if it's a parent or child type
          const isParent = loc.type && loc.type.toLowerCase() === this.parentType.toLowerCase();
          const isChild = loc.type && loc.type.toLowerCase() === this.childType.toLowerCase();

          if (isParent) {
            this.selectedParents.add(String(loc.id));
          } else if (isChild && loc.parent_id) {
            // Add the parent first
            this.selectedParents.add(String(loc.parent_id));
            this.selectedChildren.add(String(loc.id));
          } else {
            // Unknown type, just add as parent
            this.selectedParents.add(String(loc.id));
          }

          // Update button texts
          if (this.parentBtn) {
            this.parentBtn.textContent = this.selectedParents.size + ' selected';
            this.parentBtn.classList.add('has-selection');
          }
          if (this.childBtn) {
            this.childBtn.disabled = false;
            if (this.selectedChildren.size > 0) {
              this.childBtn.textContent = this.selectedChildren.size + ' selected';
              this.childBtn.classList.add('has-selection');
            }
          }

          // Re-render checklists with selections
          this.renderParentChecklist();
          this.renderChildChecklist();
        }
      } else {
        // Reset if no location
        this.selectedParents.clear();
        this.selectedChildren.clear();
        this.renderParentChecklist();
        this.renderChildChecklist();
        if (this.parentBtn) {
          this.parentBtn.textContent = this.parentLabel || this.label('search_location') || 'Location';
          this.parentBtn.classList.remove('has-selection');
        }
        if (this.childBtn) {
          this.childBtn.textContent = this.childLabel || this.label('search_sublocation') || 'Sub-location';
          this.childBtn.classList.remove('has-selection');
          this.childBtn.disabled = true;
        }
      }
    }

    // Variation 3: Hierarchical multi-select
    if (this.variation === '3') {
      if (this.selectedLocation) {
        this.selectedLocations.add(String(this.selectedLocation));
        this.renderHierarchyChecklist();
        this.updateTags();
        if (this.multiBtn) {
          this.multiBtn.textContent = this.selectedLocations.size + ' selected';
          this.multiBtn.classList.add('has-selection');
        }
      } else {
        this.selectedLocations.clear();
        this.renderHierarchyChecklist();
        this.updateTags();
        if (this.multiBtn) {
          this.multiBtn.textContent = this.label('search_location') || 'Location';
          this.multiBtn.classList.remove('has-selection');
        }
      }
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('rs_location', RSLocation as unknown as ComponentConstructor);

export { RSLocation };
export default RSLocation;
