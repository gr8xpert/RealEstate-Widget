/**
 * RealtySoft Widget v3.0.0
 * ES Module entry point with code-split dynamic imports
 *
 * Component groups are loaded on-demand based on which
 * rs_* elements are present in the DOM.
 */

// Import styles
import './styles/realtysoft.css';
import './styles/map-search.css';

// Import core modules eagerly (always needed)
import { RealtySoftState } from './core/state';
import { RealtySoftAPI } from './core/api';
import { RealtySoftLabels } from './core/labels';
import { RealtySoftAnalytics } from './core/analytics';
import { RealtySoftToast } from './core/toast';
import { WishlistManager } from './core/wishlist-manager';
import { RealtySoft } from './core/controller';
import { RSBaseComponent } from './components/base';

/**
 * Detect which component groups are needed by scanning the DOM
 * for rs_* class elements.
 */
async function loadRequiredChunks(): Promise<void> {
  const doc = document;

  const needsSearch =
    !!doc.querySelector('.rs_location') ||
    !!doc.querySelector('.rs_property_type') ||
    !!doc.querySelector('.rs_listing_type') ||
    !!doc.querySelector('.rs_bedrooms') ||
    !!doc.querySelector('.rs_bathrooms') ||
    !!doc.querySelector('.rs_price') ||
    !!doc.querySelector('.rs_built_area') ||
    !!doc.querySelector('.rs_plot_size') ||
    !!doc.querySelector('.rs_features') ||
    !!doc.querySelector('.rs_ref') ||
    !!doc.querySelector('.rs_search_button') ||
    !!doc.querySelector('.rs_reset_button') ||
    !!doc.querySelector('[class*="rs-search-template"]');

  const needsListing =
    !!doc.querySelector('.rs_property_grid') ||
    !!doc.querySelector('.rs_property_carousel') ||
    !!doc.querySelector('.rs_pagination') ||
    !!doc.querySelector('.rs_sort') ||
    !!doc.querySelector('.rs_results_count') ||
    !!doc.querySelector('.rs_active_filters') ||
    !!doc.querySelector('.rs_view_toggle') ||
    !!doc.querySelector('.rs_map_view') ||
    !!doc.querySelector('[class*="rs-listing-template"]') ||
    !!doc.querySelector('[class*="rs-map-search-template"]');

  const needsDetail =
    !!doc.querySelector('.rs_detail') ||
    !!doc.querySelector('.rs_gallery') ||
    !!doc.querySelector('.rs_inquiry_form') ||
    !!doc.querySelector('.rs_map') ||
    !!doc.querySelector('.rs_related') ||
    !!doc.querySelector('.rs_info_table') ||
    !!doc.querySelector('.rs_specs') ||
    !!doc.querySelector('.rs_share') ||
    !!doc.querySelector('.property-detail-container');

  const needsUtility =
    !!doc.querySelector('.rs_wishlist_button') ||
    !!doc.querySelector('.rs_wishlist_counter') ||
    !!doc.querySelector('.rs_wishlist_list') ||
    !!doc.querySelector('.rs_wishlist_header') ||
    !!doc.querySelector('.rs_wishlist_grid') ||
    !!doc.querySelector('.rs_wishlist_actions') ||
    !!doc.querySelector('.rs_language_selector') ||
    !!doc.querySelector('.rs_share_buttons') ||
    !!doc.querySelector('[class*="rs_wishlist"]');

  const chunks: Promise<unknown>[] = [];

  if (needsSearch) {
    chunks.push(import('./components/search/index'));
  }
  if (needsListing) {
    chunks.push(import('./components/listing/index'));
  }
  if (needsDetail) {
    chunks.push(import('./components/detail/index'));
  }
  if (needsUtility) {
    chunks.push(import('./components/utility/index'));
  }

  if (chunks.length > 0) {
    await Promise.all(chunks);
    if ((window as any).RealtySoftConfig?.debug) {
      console.log('[RealtySoft] ES: Loaded', chunks.length, 'component chunk(s)');
    }
  }
}

// Auto-load required chunks when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadRequiredChunks());
} else {
  loadRequiredChunks();
}

// Re-export core modules
export {
  RealtySoftState,
  RealtySoftAPI,
  RealtySoftLabels,
  RealtySoftAnalytics,
  RealtySoftToast,
  WishlistManager,
  RSBaseComponent,
  RealtySoft,
  loadRequiredChunks,
};

// Version info (only in debug mode)
if ((window as any).RealtySoftConfig?.debug) {
  console.log('[RealtySoft] Widget v3.0.0 loaded (ES module build)');
}
