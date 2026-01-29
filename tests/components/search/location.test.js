/**
 * Tests for RSLocation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSLocation } from '../../../src/components/search/location';
import { createMockLocations } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSLocation', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    RealtySoftState.set('data.locations', createMockLocations());
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('Variation 1 (Typeahead)', () => {
    it('should add correct CSS classes', () => {
      new RSLocation(testElement);
      expect(testElement.classList.contains('rs-location')).toBe(true);
      expect(testElement.classList.contains('rs-location--v1')).toBe(true);
    });

    it('should render label', () => {
      new RSLocation(testElement);
      const label = testElement.querySelector('.rs-location__label');
      expect(label.textContent).toBe('Location');
    });

    it('should render search input', () => {
      new RSLocation(testElement);
      const input = testElement.querySelector('.rs-location__input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('should render dropdown (hidden)', () => {
      new RSLocation(testElement);
      const dropdown = testElement.querySelector('.rs-location__dropdown');
      expect(dropdown.style.display).toBe('none');
    });

    it('should show dropdown when typing', () => {
      vi.useFakeTimers();
      new RSLocation(testElement);
      const input = testElement.querySelector('.rs-location__input');
      input.value = 'Mar';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      vi.advanceTimersByTime(400);
      const dropdown = testElement.querySelector('.rs-location__dropdown');
      expect(dropdown.style.display).toBe('block');
      vi.useRealTimers();
    });

    it('should filter locations based on search', () => {
      vi.useFakeTimers();
      new RSLocation(testElement);
      const input = testElement.querySelector('.rs-location__input');
      input.value = 'Marbella';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      vi.advanceTimersByTime(400);
      const items = testElement.querySelectorAll('.rs-location__item');
      expect(items.length).toBeGreaterThan(0);
      vi.useRealTimers();
    });

    it('should update display on state change', () => {
      new RSLocation(testElement);
      RealtySoftState.set('filters.location', null);
      const input = testElement.querySelector('.rs-location__input');
      expect(input.value).toBe('');
    });
  });

  describe('Variation 2 (Two Dropdowns)', () => {
    it('should render parent and child containers', () => {
      new RSLocation(testElement, { variation: '2' });
      expect(testElement.querySelector('.rs-location__parent-container')).toBeTruthy();
      expect(testElement.querySelector('.rs-location__child-container')).toBeTruthy();
    });

    it('should render parent button', () => {
      new RSLocation(testElement, { variation: '2' });
      const parentBtn = testElement.querySelector('.rs-location__parent-btn');
      expect(parentBtn).toBeTruthy();
    });

    it('should render child button (disabled initially)', () => {
      new RSLocation(testElement, { variation: '2' });
      const childBtn = testElement.querySelector('.rs-location__child-btn');
      expect(childBtn).toBeTruthy();
      expect(childBtn.disabled).toBe(true);
    });

    it('should render parent checklist', () => {
      new RSLocation(testElement, { variation: '2' });
      const parentList = testElement.querySelector('.rs-location__parent-list');
      expect(parentList).toBeTruthy();
    });

    it('should render filter inputs', () => {
      new RSLocation(testElement, { variation: '2' });
      const filters = testElement.querySelectorAll('.rs-location__filter-input');
      expect(filters.length).toBe(2);
    });

    it('should toggle parent dropdown on button click', () => {
      new RSLocation(testElement, { variation: '2' });
      const btn = testElement.querySelector('.rs-location__parent-btn');
      const dropdown = testElement.querySelector('.rs-location__parent-dropdown');
      btn.click();
      expect(dropdown.style.display).toBe('block');
    });
  });

  describe('Variation 3 (Hierarchical Multi-Select)', () => {
    it('should render multi-select button', () => {
      new RSLocation(testElement, { variation: '3' });
      const btn = testElement.querySelector('.rs-location__multi-btn');
      expect(btn).toBeTruthy();
    });

    it('should render dropdown hidden', () => {
      new RSLocation(testElement, { variation: '3' });
      const dropdown = testElement.querySelector('.rs-location__dropdown');
      expect(dropdown.style.display).toBe('none');
    });

    it('should render filter input', () => {
      new RSLocation(testElement, { variation: '3' });
      const filter = testElement.querySelector('.rs-location__filter-input');
      expect(filter).toBeTruthy();
    });

    it('should render hierarchy checklist', () => {
      new RSLocation(testElement, { variation: '3' });
      const list = testElement.querySelector('.rs-location__hierarchy-list');
      expect(list).toBeTruthy();
    });

    it('should render tags container', () => {
      new RSLocation(testElement, { variation: '3' });
      const tags = testElement.querySelector('.rs-location__tags');
      expect(tags).toBeTruthy();
    });

    it('should render parent location groups', () => {
      new RSLocation(testElement, { variation: '3' });
      const groups = testElement.querySelectorAll('.rs-location__parent-group');
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('Variation 4 (Traditional Dropdown)', () => {
    it('should render select element', () => {
      new RSLocation(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-location__select');
      expect(select).toBeTruthy();
    });

    it('should populate options from locations data', () => {
      new RSLocation(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-location__select');
      expect(select.options.length).toBeGreaterThan(1);
    });

    it('should set filter on change', () => {
      new RSLocation(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-location__select');
      select.value = '1';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('location', 1);
    });

    it('should clear filter when empty selected', () => {
      new RSLocation(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-location__select');
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('location', null);
    });
  });

  describe('state subscriptions', () => {
    it('should update when locations data changes', () => {
      new RSLocation(testElement, { variation: '4' });
      RealtySoftState.set('data.locations', [
        { id: 99, name: 'New Location', parent_id: null, type: 'municipality' },
      ]);
      const select = testElement.querySelector('.rs-location__select');
      const optionTexts = Array.from(select.options).map(o => o.textContent.trim());
      expect(optionTexts.some(t => t.includes('New Location'))).toBe(true);
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles', () => {
      RealtySoftState.setLockedFilters({ location: 1 });
      new RSLocation(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSLocation(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
