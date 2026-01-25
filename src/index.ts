/**
 * RealtySoft Widget v3.0.0
 * Main entry point for Vite build
 *
 * This file imports all modules and sets up global variables
 * for backwards compatibility with existing integrations.
 */

// Import styles
import './styles/realtysoft.css';

// Import types
import type {
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  RealtySoftLabelsModule,
  Property,
  FilterState,
  WidgetConfig,
  ComponentOptions,
} from './types/index';

// For now, we re-export the existing IIFE modules
// In a full migration, these would be converted to ES modules

// Note: The actual modules are IIFEs that assign to window
// This entry point is for the Vite build to bundle everything

// Import core modules (order matters - dependencies first)
// @ts-ignore - These are IIFE modules that don't have TS exports yet
import './core/state.js';
// @ts-ignore
import './core/api.js';
// @ts-ignore
import './core/labels.js';
// @ts-ignore
import './core/analytics.js';
// @ts-ignore
import './core/toast.js';
// @ts-ignore
import './core/wishlist-manager.js';
// @ts-ignore
import './core/controller.js';

// Import base component
// @ts-ignore
import './components/base.js';

// Import search components
// @ts-ignore
import './components/search/location.js';
// @ts-ignore
import './components/search/listing-type.js';
// @ts-ignore
import './components/search/property-type.js';
// @ts-ignore
import './components/search/bedrooms.js';
// @ts-ignore
import './components/search/bathrooms.js';
// @ts-ignore
import './components/search/price.js';
// @ts-ignore
import './components/search/built-area.js';
// @ts-ignore
import './components/search/plot-size.js';
// @ts-ignore
import './components/search/features.js';
// @ts-ignore
import './components/search/reference.js';
// @ts-ignore
import './components/search/search-button.js';
// @ts-ignore
import './components/search/reset-button.js';

// Import listing components
// @ts-ignore
import './components/listing/property-grid.js';
// @ts-ignore
import './components/listing/property-carousel.js';
// @ts-ignore
import './components/listing/pagination.js';
// @ts-ignore
import './components/listing/sort.js';
// @ts-ignore
import './components/listing/results-count.js';
// @ts-ignore
import './components/listing/active-filters.js';
// @ts-ignore
import './components/listing/view-toggle.js';

// Import detail components
// @ts-ignore
import './components/detail/detail.js';
// @ts-ignore
import './components/detail/gallery.js';
// @ts-ignore
import './components/detail/features.js';
// @ts-ignore
import './components/detail/map.js';
// @ts-ignore
import './components/detail/inquiry-form.js';
// @ts-ignore
import './components/detail/wishlist.js';
// @ts-ignore
import './components/detail/share.js';
// @ts-ignore
import './components/detail/related.js';
// @ts-ignore
import './components/detail/info-table.js';
// @ts-ignore
import './components/detail/specs.js';
// @ts-ignore
import './components/detail/sizes.js';
// @ts-ignore
import './components/detail/taxes.js';
// @ts-ignore
import './components/detail/energy.js';
// @ts-ignore
import './components/detail/resources.js';
// @ts-ignore
import './components/detail/pdf-button.js';
// @ts-ignore
import './components/detail/back-button.js';
// @ts-ignore
import './components/detail/property-detail-template.js';

// Import utility components
// @ts-ignore
import './components/utility/wishlist-button.js';
// @ts-ignore
import './components/utility/wishlist-counter.js';
// @ts-ignore
import './components/utility/wishlist-header.js';
// @ts-ignore
import './components/utility/wishlist-empty.js';
// @ts-ignore
import './components/utility/wishlist-shared-banner.js';
// @ts-ignore
import './components/utility/wishlist-sort.js';
// @ts-ignore
import './components/utility/wishlist-actions.js';
// @ts-ignore
import './components/utility/wishlist-compare-btn.js';
// @ts-ignore
import './components/utility/wishlist-grid.js';
// @ts-ignore
import './components/utility/wishlist-modals.js';
// @ts-ignore
import './components/utility/wishlist-list.js';
// @ts-ignore
import './components/utility/language-selector.js';
// @ts-ignore
import './components/utility/share-buttons.js';

// Export the main module (available globally via window.RealtySoft)
// @ts-ignore - Global is set by IIFE
export const RealtySoft = window.RealtySoft as RealtySoftModule;
// @ts-ignore
export const RealtySoftState = window.RealtySoftState as RealtySoftStateModule;
// @ts-ignore
export const RealtySoftAPI = window.RealtySoftAPI as RealtySoftAPIModule;
// @ts-ignore
export const RealtySoftLabels = window.RealtySoftLabels as RealtySoftLabelsModule;

// Export types for TypeScript users
export type {
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  RealtySoftLabelsModule,
  Property,
  FilterState,
  WidgetConfig,
  ComponentOptions,
};

// Version info
console.log('[RealtySoft] Widget v3.0.0 loaded (Vite build)');
