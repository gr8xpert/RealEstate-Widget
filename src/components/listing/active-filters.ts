/**
 * RealtySoft Widget v3 - Active Filters Component
 * Displays active filters as read-only informational tags
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftLabelsModule,
  RealtySoftAPIModule,
  FilterState,
  Feature,
  Location,
  PropertyType
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftAPI: RealtySoftAPIModule;

interface ActiveFilter {
  name: string;
  label: string;
  value: string;
}

class RSActiveFilters extends RSBaseComponent {
  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.render();

    // Subscribe to all filter changes
    this.subscribe<FilterState>('filters', () => {
      this.updateDisplay();
    });

    // Subscribe to features data changes (for resolving feature names)
    this.subscribe<Feature[]>('data.features', () => {
      this.updateDisplay();
    });

    // If there are feature filters but no features data, load features on demand
    this.loadFeaturesIfNeeded();
  }

  private async loadFeaturesIfNeeded(): Promise<void> {
    const filters = RealtySoftState.get<FilterState>('filters');
    const featuresData = RealtySoftState.get<Feature[]>('data.features');

    // If there are feature filters but no features data loaded, fetch features
    if (filters?.features && filters.features.length > 0 && (!featuresData || featuresData.length === 0)) {
      try {
        const result = await RealtySoftAPI.getFeatures();
        if (result.data) {
          RealtySoftState.set('data.features', result.data);
          // updateDisplay will be called by the subscription
        }
      } catch (e) {
        console.warn('[RealtySoft] Could not load features for active filters:', e);
      }
    }
  }

  render(): void {
    this.element.classList.add('rs-active-filters');
    this.updateDisplay();
  }

  /**
   * Resolve a location ID to its name by searching through
   * the locations tree (including children).
   */
  private resolveLocationName(id: number): string {
    const locations = RealtySoftState.get<Location[]>('data.locations') || [];

    const findInTree = (list: Location[]): string | null => {
      for (const loc of list) {
        if (loc.id === id) return loc.name;
        if (loc.children) {
          const found = findInTree(loc.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInTree(locations) || String(id);
  }

  /**
   * Resolve a property type ID to its name from the flat
   * property types list.
   */
  private resolvePropertyTypeName(id: number): string {
    const types = RealtySoftState.get<PropertyType[]>('data.propertyTypes') || [];
    const found = types.find(t => t.id === id);
    return found ? found.name : String(id);
  }

  /**
   * Resolve one or more IDs to display names using the given resolver.
   */
  private resolveIds(
    ids: number | number[],
    resolver: (id: number) => string
  ): string {
    if (Array.isArray(ids)) {
      return ids.map(resolver).join(', ');
    }
    return resolver(ids);
  }

  /**
   * Resolve a feature ID to its name by searching through
   * the nested features structure (categories with value_ids).
   */
  private resolveFeatureName(id: number): string {
    const featuresData = RealtySoftState.get<Array<{id: number; name: string; value_ids?: Array<{id: number; name: string}>}>>('data.features') || [];

    for (const category of featuresData) {
      // Check if feature is in value_ids (nested structure)
      if (category.value_ids && Array.isArray(category.value_ids)) {
        const found = category.value_ids.find(f => f.id === id);
        if (found) return found.name;
      }
      // Also check top-level id (flat structure fallback)
      if (category.id === id && category.name) {
        return category.name;
      }
    }

    return String(id);
  }

  private getActiveFilters(): ActiveFilter[] {
    const filters = RealtySoftState.get<FilterState>('filters');
    const active: ActiveFilter[] = [];

    if (!filters) return active;

    // Location — resolve ID(s) to name(s)
    // The location filter can be a number, number[], or comma-separated string of IDs
    if (filters.location && !RealtySoftState.isFilterLocked('location')) {
      let displayValue = filters.locationName || '';
      if (!displayValue) {
        const loc = filters.location;
        let ids: number[];
        if (typeof loc === 'string') {
          ids = loc.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        } else if (Array.isArray(loc)) {
          ids = loc;
        } else {
          ids = [loc];
        }
        displayValue = ids.map(id => this.resolveLocationName(id)).join(', ');
      }
      active.push({
        name: 'location',
        label: this.label('search_location'),
        value: displayValue
      });
    }

    // Listing type
    if (filters.listingType && !RealtySoftState.isFilterLocked('listingType')) {
      const listingTypeLabels: Record<string, string> = {
        'resale': this.label('listing_type_sale') || 'ReSale',
        'development': this.label('listing_type_new') || 'New Development',
        'long_rental': this.label('listing_type_long_rental') || 'Long Term Rental',
        'short_rental': this.label('listing_type_short_rental') || 'Holiday Rental'
      };
      const displayValue = Array.isArray(filters.listingType)
        ? filters.listingType.map(t => listingTypeLabels[t] || t).join(', ')
        : listingTypeLabels[filters.listingType] || filters.listingType;
      active.push({
        name: 'listingType',
        label: this.label('search_listing_type'),
        value: displayValue
      });
    }

    // Property type — resolve ID(s) to name(s)
    if (filters.propertyType && !RealtySoftState.isFilterLocked('propertyType')) {
      const displayValue = filters.propertyTypeName
        || this.resolveIds(
            filters.propertyType as number | number[],
            (id) => this.resolvePropertyTypeName(id)
          );
      active.push({
        name: 'propertyType',
        label: this.label('search_property_type'),
        value: displayValue
      });
    }

    // Bedrooms
    if ((filters.bedsMin || filters.bedsMax) && !RealtySoftState.isFilterLocked('bedsMin')) {
      let value = '';
      if (filters.bedsMin && filters.bedsMax) {
        value = `${filters.bedsMin} - ${filters.bedsMax}`;
      } else if (filters.bedsMin) {
        value = `${filters.bedsMin}+`;
      } else {
        value = `≤ ${filters.bedsMax}`;
      }
      active.push({
        name: 'beds',
        label: this.label('search_bedrooms'),
        value: value
      });
    }

    // Bathrooms
    if ((filters.bathsMin || filters.bathsMax) && !RealtySoftState.isFilterLocked('bathsMin')) {
      let value = '';
      if (filters.bathsMin && filters.bathsMax) {
        value = `${filters.bathsMin} - ${filters.bathsMax}`;
      } else if (filters.bathsMin) {
        value = `${filters.bathsMin}+`;
      } else {
        value = `≤ ${filters.bathsMax}`;
      }
      active.push({
        name: 'baths',
        label: this.label('search_bathrooms'),
        value: value
      });
    }

    // Price
    if ((filters.priceMin || filters.priceMax) && !RealtySoftState.isFilterLocked('priceMin')) {
      let value = '';
      if (filters.priceMin && filters.priceMax) {
        value = `${RealtySoftLabels.formatPrice(filters.priceMin)} - ${RealtySoftLabels.formatPrice(filters.priceMax)}`;
      } else if (filters.priceMin) {
        value = `≥ ${RealtySoftLabels.formatPrice(filters.priceMin)}`;
      } else if (filters.priceMax) {
        value = `≤ ${RealtySoftLabels.formatPrice(filters.priceMax)}`;
      }
      active.push({
        name: 'price',
        label: this.label('search_price'),
        value: value
      });
    }

    // Built area
    if ((filters.builtMin || filters.builtMax) && !RealtySoftState.isFilterLocked('builtMin')) {
      let value = '';
      if (filters.builtMin && filters.builtMax) {
        value = `${filters.builtMin} - ${filters.builtMax} m²`;
      } else if (filters.builtMin) {
        value = `≥ ${filters.builtMin} m²`;
      } else if (filters.builtMax) {
        value = `≤ ${filters.builtMax} m²`;
      }
      active.push({
        name: 'built',
        label: this.label('search_built_area'),
        value: value
      });
    }

    // Plot size
    if ((filters.plotMin || filters.plotMax) && !RealtySoftState.isFilterLocked('plotMin')) {
      let value = '';
      if (filters.plotMin && filters.plotMax) {
        value = `${filters.plotMin} - ${filters.plotMax} m²`;
      } else if (filters.plotMin) {
        value = `≥ ${filters.plotMin} m²`;
      } else if (filters.plotMax) {
        value = `≤ ${filters.plotMax} m²`;
      }
      active.push({
        name: 'plot',
        label: this.label('search_plot_size'),
        value: value
      });
    }

    // Features
    if (filters.features && filters.features.length && !RealtySoftState.isFilterLocked('features')) {
      const featureNames = filters.features.map(id => this.resolveFeatureName(id));
      active.push({
        name: 'features',
        label: this.label('search_features'),
        value: featureNames.join(', ')
      });
    }

    // Reference
    if (filters.ref && !RealtySoftState.isFilterLocked('ref')) {
      active.push({
        name: 'ref',
        label: this.label('search_reference'),
        value: filters.ref
      });
    }

    return active;
  }

  private updateDisplay(): void {
    const active = this.getActiveFilters();

    if (active.length === 0) {
      this.element.innerHTML = '';
      this.element.style.display = 'none';
      return;
    }

    this.element.style.display = 'block';
    this.element.innerHTML = `
      <div class="rs-active-filters__wrapper">
        <div class="rs-active-filters__tags">
          ${active.map(filter => `
            <span class="rs-active-filters__tag">
              <span class="rs-active-filters__tag-label">${filter.label}:</span>
              <span class="rs-active-filters__tag-value">${this.escapeHtml(filter.value)}</span>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('rs_active_filters', RSActiveFilters as unknown as ComponentConstructor);

export { RSActiveFilters };
export default RSActiveFilters;
