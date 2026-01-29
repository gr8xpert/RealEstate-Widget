/**
 * Tests for RSPropertyGrid
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSPropertyGrid } from '../../../src/components/listing/property-grid';
import { createMockProperty } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goToPage: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

// RSPropertyGrid uses RealtySoftState, RealtySoftLabels, RealtySoftAPI, RealtySoftAnalytics at runtime
window.RealtySoftState = RealtySoftState;
window.RealtySoftLabels = RealtySoftLabels;

describe('RSPropertyGrid', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();

    // Set up global mocks used by property-grid
    globalThis.RealtySoftAPI = {
      searchProperties: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      getProperty: vi.fn().mockResolvedValue({ data: null }),
      getLocations: vi.fn().mockResolvedValue({ data: [] }),
      getPropertyTypes: vi.fn().mockResolvedValue({ data: [] }),
      getFeatures: vi.fn().mockResolvedValue({ data: [] }),
      getLabels: vi.fn().mockResolvedValue({ data: {} }),
      prefetchProperty: vi.fn(),
      submitInquiry: vi.fn().mockResolvedValue({ success: true }),
      clearCache: vi.fn(),
    };

    globalThis.RealtySoftAnalytics = {
      track: vi.fn(),
      trackSearch: vi.fn(),
      trackDetail: vi.fn(),
      trackWishlist: vi.fn(),
      trackInquiry: vi.fn(),
      trackShare: vi.fn(),
      trackLanguageChange: vi.fn(),
      trackCardClick: vi.fn(),
      trackWishlistAdd: vi.fn(),
      trackWishlistRemove: vi.fn(),
    };
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('render', () => {
    it('should add the rs-property-grid CSS class', () => {
      new RSPropertyGrid(testElement);
      expect(testElement.classList.contains('rs-property-grid')).toBe(true);
    });

    it('should add the grid view class by default', () => {
      new RSPropertyGrid(testElement);
      expect(testElement.classList.contains('rs-property-grid--grid')).toBe(true);
    });

    it('should render a container for property items', () => {
      new RSPropertyGrid(testElement);
      const container = testElement.querySelector('.rs-property-grid__items');
      expect(container).toBeTruthy();
    });

    it('should render a loader element', () => {
      new RSPropertyGrid(testElement);
      const loader = testElement.querySelector('.rs-property-grid__loader');
      expect(loader).toBeTruthy();
    });

    it('should render an empty state element', () => {
      new RSPropertyGrid(testElement);
      const empty = testElement.querySelector('.rs-property-grid__empty');
      expect(empty).toBeTruthy();
    });

    it('should hide the loader initially', () => {
      new RSPropertyGrid(testElement);
      const loader = testElement.querySelector('.rs-property-grid__loader');
      expect(loader.style.display).toBe('none');
    });
  });

  describe('state subscriptions - properties', () => {
    it('should render property cards when results.properties changes', () => {
      new RSPropertyGrid(testElement);
      const properties = [
        createMockProperty({ id: 1, title: 'Villa One' }),
        createMockProperty({ id: 2, title: 'Villa Two' }),
      ];
      RealtySoftState.set('results.properties', properties);
      const cards = testElement.querySelectorAll('.rs-card');
      expect(cards.length).toBe(2);
    });

    it('should show empty state when properties is empty', () => {
      new RSPropertyGrid(testElement);
      RealtySoftState.set('results.properties', []);
      const empty = testElement.querySelector('.rs-property-grid__empty');
      expect(empty.style.display).toBe('block');
    });

    it('should display property title in card', () => {
      new RSPropertyGrid(testElement);
      const properties = [createMockProperty({ id: 1, title: 'Luxury Penthouse' })];
      RealtySoftState.set('results.properties', properties);
      const title = testElement.querySelector('.rs-card__title');
      expect(title.textContent).toBe('Luxury Penthouse');
    });

    it('should display property price in card', () => {
      new RSPropertyGrid(testElement);
      const properties = [createMockProperty({ id: 1, price: 500000 })];
      RealtySoftState.set('results.properties', properties);
      const price = testElement.querySelector('.rs_card_price');
      expect(price).toBeTruthy();
      expect(price.textContent).toBeTruthy();
    });

    it('should display bedroom info when beds > 0', () => {
      new RSPropertyGrid(testElement);
      const properties = [createMockProperty({ id: 1, beds: 3 })];
      RealtySoftState.set('results.properties', properties);
      const beds = testElement.querySelector('.rs_card_beds');
      expect(beds).toBeTruthy();
      expect(beds.textContent).toContain('3');
    });

    it('should display bathroom info when baths > 0', () => {
      new RSPropertyGrid(testElement);
      const properties = [createMockProperty({ id: 1, baths: 2 })];
      RealtySoftState.set('results.properties', properties);
      const baths = testElement.querySelector('.rs_card_baths');
      expect(baths).toBeTruthy();
      expect(baths.textContent).toContain('2');
    });

    it('should display reference in card', () => {
      new RSPropertyGrid(testElement);
      const properties = [createMockProperty({ id: 1, ref: 'REF-123' })];
      RealtySoftState.set('results.properties', properties);
      const ref = testElement.querySelector('.rs_card_ref');
      expect(ref).toBeTruthy();
      expect(ref.textContent).toContain('REF-123');
    });
  });

  describe('state subscriptions - view', () => {
    it('should switch to list view class when ui.view changes', () => {
      new RSPropertyGrid(testElement);
      RealtySoftState.set('ui.view', 'list');
      expect(testElement.classList.contains('rs-property-grid--list')).toBe(true);
      expect(testElement.classList.contains('rs-property-grid--grid')).toBe(false);
    });

    it('should switch back to grid view class', () => {
      new RSPropertyGrid(testElement);
      RealtySoftState.set('ui.view', 'list');
      RealtySoftState.set('ui.view', 'grid');
      expect(testElement.classList.contains('rs-property-grid--grid')).toBe(true);
      expect(testElement.classList.contains('rs-property-grid--list')).toBe(false);
    });
  });

  describe('state subscriptions - loading', () => {
    it('should show skeleton cards when loading with no properties', () => {
      new RSPropertyGrid(testElement);
      RealtySoftState.set('ui.loading', true);
      const skeletons = testElement.querySelectorAll('.rs-card--skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should dim container when loading with existing properties', () => {
      new RSPropertyGrid(testElement);
      const properties = [createMockProperty({ id: 1 })];
      RealtySoftState.set('results.properties', properties);
      RealtySoftState.set('ui.loading', true);
      const container = testElement.querySelector('.rs-property-grid__items');
      expect(container.style.opacity).toBe('0.5');
    });

    it('should restore opacity when loading completes', () => {
      new RSPropertyGrid(testElement);
      const properties = [createMockProperty({ id: 1 })];
      RealtySoftState.set('results.properties', properties);
      RealtySoftState.set('ui.loading', true);
      RealtySoftState.set('ui.loading', false);
      const container = testElement.querySelector('.rs-property-grid__items');
      expect(container.style.opacity).toBe('1');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSPropertyGrid(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
