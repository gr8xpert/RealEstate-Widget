/**
 * Tests for RSActiveFilters
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSActiveFilters } from '../../../src/components/listing/active-filters';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goToPage: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSActiveFilters', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('render', () => {
    it('should add the rs-active-filters CSS class', () => {
      new RSActiveFilters(testElement);
      expect(testElement.classList.contains('rs-active-filters')).toBe(true);
    });

    it('should be hidden when no filters are active', () => {
      new RSActiveFilters(testElement);
      expect(testElement.style.display).toBe('none');
    });

    it('should be empty when no filters are active', () => {
      new RSActiveFilters(testElement);
      expect(testElement.innerHTML).toBe('');
    });
  });

  describe('state subscriptions', () => {
    it('should display a tag when location filter is set', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.location', 1);
      RealtySoftState.set('filters.locationName', 'Marbella');
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      const locationTag = Array.from(tags).find(t => t.textContent.includes('Marbella'));
      expect(locationTag).toBeTruthy();
    });

    it('should resolve location ID to name from data.locations', () => {
      RealtySoftState.set('data.locations', [
        { id: 5, name: 'Estepona', parent_id: null },
        { id: 10, name: 'Benahavís', parent_id: null }
      ]);
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.location', 10);
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      const tag = Array.from(tags).find(t => t.textContent.includes('Benahavís'));
      expect(tag).toBeTruthy();
    });

    it('should resolve property type ID to name from data.propertyTypes', () => {
      RealtySoftState.set('data.propertyTypes', [
        { id: 71, name: 'Duplex' },
        { id: 12, name: 'Villa' }
      ]);
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.propertyType', 71);
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      const tag = Array.from(tags).find(t => t.textContent.includes('Duplex'));
      expect(tag).toBeTruthy();
    });

    it('should display a tag when bedsMin filter is set', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 3);
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      const tag = Array.from(tags).find(t => t.textContent.includes('3+'));
      expect(tag).toBeTruthy();
    });

    it('should display a tag when price range is set', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.priceMin', 200000);
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should show element when filters are active', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 2);
      expect(testElement.style.display).toBe('block');
    });

    it('should hide element when all filters are removed', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 2);
      expect(testElement.style.display).toBe('block');
      RealtySoftState.set('filters.bedsMin', null);
      expect(testElement.style.display).toBe('none');
    });

    it('should not show clear-all button (display-only mode)', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 2);
      RealtySoftState.set('filters.priceMin', 100000);
      const clearAll = testElement.querySelector('.rs-active-filters__clear-all');
      expect(clearAll).toBeFalsy();
    });

    it('should not show remove buttons on tags (display-only mode)', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 2);
      const removeBtn = testElement.querySelector('.rs-active-filters__tag-remove');
      expect(removeBtn).toBeFalsy();
    });

    it('should display bedroom range when both min and max are set', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 2);
      RealtySoftState.set('filters.bedsMax', 4);
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      const tag = Array.from(tags).find(t => t.textContent.includes('2 - 4'));
      expect(tag).toBeTruthy();
    });

    it('should display reference filter tag', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.ref', 'REF001');
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      const tag = Array.from(tags).find(t => t.textContent.includes('REF001'));
      expect(tag).toBeTruthy();
    });

    it('should not display locked filters', () => {
      RealtySoftState.setLockedFilters({ bedsMin: 3 });
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 3);
      const tags = testElement.querySelectorAll('.rs-active-filters__tag');
      const tag = Array.from(tags).find(t => t.textContent.includes('3+'));
      expect(tag).toBeFalsy();
    });

    it('should render tags as spans not buttons (display-only)', () => {
      new RSActiveFilters(testElement);
      RealtySoftState.set('filters.bedsMin', 2);
      const buttons = testElement.querySelectorAll('button.rs-active-filters__tag');
      expect(buttons.length).toBe(0);
      const spans = testElement.querySelectorAll('span.rs-active-filters__tag');
      expect(spans.length).toBeGreaterThan(0);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSActiveFilters(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
