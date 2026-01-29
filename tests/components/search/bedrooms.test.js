/**
 * Tests for RSBedrooms
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSBedrooms } from '../../../src/components/search/bedrooms';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSBedrooms', () => {
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

  describe('Variation 1 (Dropdown)', () => {
    it('should add correct CSS classes', () => {
      new RSBedrooms(testElement);
      expect(testElement.classList.contains('rs-bedrooms')).toBe(true);
      expect(testElement.classList.contains('rs-bedrooms--v1')).toBe(true);
    });

    it('should render a select element', () => {
      new RSBedrooms(testElement);
      const select = testElement.querySelector('.rs-bedrooms__select');
      expect(select).toBeTruthy();
    });

    it('should have 11 options (Any + 1-10)', () => {
      new RSBedrooms(testElement);
      const select = testElement.querySelector('.rs-bedrooms__select');
      expect(select.options.length).toBe(11);
    });

    it('should show "Min Bed" placeholder', () => {
      new RSBedrooms(testElement);
      const select = testElement.querySelector('.rs-bedrooms__select');
      expect(select.options[0].textContent).toContain('Min Bed');
    });

    it('should show "1+" through "10+" in minimum style', () => {
      new RSBedrooms(testElement);
      const select = testElement.querySelector('.rs-bedrooms__select');
      expect(select.options[1].textContent).toBe('1+');
      expect(select.options[10].textContent).toBe('10+');
    });

    it('should set bedsMin filter on change', () => {
      new RSBedrooms(testElement);
      const select = testElement.querySelector('.rs-bedrooms__select');
      select.value = '3';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('bedsMin', 3);
    });

    it('should clear filters when "Any" selected', () => {
      new RSBedrooms(testElement);
      const select = testElement.querySelector('.rs-bedrooms__select');
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('bedsMin', null);
    });

    it('should render label text', () => {
      new RSBedrooms(testElement);
      const label = testElement.querySelector('.rs-bedrooms__label');
      expect(label.textContent).toBe('Bedrooms');
    });

    it('should update display on state change', () => {
      new RSBedrooms(testElement);
      RealtySoftState.set('filters.bedsMin', 5);
      const select = testElement.querySelector('.rs-bedrooms__select');
      expect(select.value).toBe('5');
    });
  });

  describe('Variation 2 (Box Style)', () => {
    it('should render box buttons', () => {
      new RSBedrooms(testElement, { variation: '2' });
      const boxes = testElement.querySelectorAll('.rs-bedrooms__box');
      expect(boxes.length).toBe(10);
    });

    it('should add active class on click', () => {
      new RSBedrooms(testElement, { variation: '2' });
      const box = testElement.querySelector('.rs-bedrooms__box[data-value="3"]');
      box.click();
      expect(box.classList.contains('rs-bedrooms__box--active')).toBe(true);
    });

    it('should set filter on box click', () => {
      new RSBedrooms(testElement, { variation: '2' });
      const box = testElement.querySelector('.rs-bedrooms__box[data-value="3"]');
      box.click();
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('bedsMin', 3);
    });

    it('should toggle off when clicking active box', () => {
      RealtySoftState.set('filters.bedsMin', 3);
      new RSBedrooms(testElement, { variation: '2' });
      const box = testElement.querySelector('.rs-bedrooms__box[data-value="3"]');
      box.click();
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('bedsMin', null);
    });
  });

  describe('Variation 3 (Multi-Select)', () => {
    it('should render multi-select dropdown', () => {
      new RSBedrooms(testElement, { variation: '3' });
      const button = testElement.querySelector('.rs-bedrooms__multiselect-button');
      expect(button).toBeTruthy();
    });

    it('should render checkboxes', () => {
      new RSBedrooms(testElement, { variation: '3' });
      const checkboxes = testElement.querySelectorAll('.rs-bedrooms__multiselect-checkbox');
      expect(checkboxes.length).toBe(10);
    });

    it('should toggle dropdown on button click', () => {
      new RSBedrooms(testElement, { variation: '3' });
      const button = testElement.querySelector('.rs-bedrooms__multiselect-button');
      const dropdown = testElement.querySelector('.rs-bedrooms__multiselect-dropdown');
      expect(dropdown.style.display).toBe('none');
      button.click();
      expect(dropdown.style.display).toBe('block');
    });

    it('should update button text on selection', () => {
      new RSBedrooms(testElement, { variation: '3' });
      const checkbox = testElement.querySelectorAll('.rs-bedrooms__multiselect-checkbox')[0];
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      const text = testElement.querySelector('.rs-bedrooms__multiselect-text');
      expect(text.textContent).toBe('1 selected');
    });
  });

  describe('Variation 4 (Free Input)', () => {
    it('should render a number input', () => {
      new RSBedrooms(testElement, { variation: '4' });
      const input = testElement.querySelector('.rs-bedrooms__input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('number');
    });

    it('should have correct min/max attributes', () => {
      new RSBedrooms(testElement, { variation: '4' });
      const input = testElement.querySelector('.rs-bedrooms__input');
      expect(input.min).toBe('0');
      expect(input.max).toBe('20');
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles when bedsMin locked', () => {
      RealtySoftState.setLockedFilters({ bedsMin: 3 });
      new RSBedrooms(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSBedrooms(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
