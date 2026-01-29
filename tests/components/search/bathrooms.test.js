/**
 * Tests for RSBathrooms
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSBathrooms } from '../../../src/components/search/bathrooms';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSBathrooms', () => {
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
      new RSBathrooms(testElement);
      expect(testElement.classList.contains('rs-bathrooms')).toBe(true);
      expect(testElement.classList.contains('rs-bathrooms--v1')).toBe(true);
    });

    it('should render a select element', () => {
      new RSBathrooms(testElement);
      const select = testElement.querySelector('.rs-bathrooms__select');
      expect(select).toBeTruthy();
    });

    it('should have 11 options (Any + 1-10)', () => {
      new RSBathrooms(testElement);
      const select = testElement.querySelector('.rs-bathrooms__select');
      expect(select.options.length).toBe(11);
    });

    it('should show "Min Bath" placeholder', () => {
      new RSBathrooms(testElement);
      const select = testElement.querySelector('.rs-bathrooms__select');
      expect(select.options[0].textContent).toContain('Min Bath');
    });

    it('should set bathsMin filter on change', () => {
      new RSBathrooms(testElement);
      const select = testElement.querySelector('.rs-bathrooms__select');
      select.value = '2';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('bathsMin', 2);
    });

    it('should clear filters when "Any" selected', () => {
      new RSBathrooms(testElement);
      const select = testElement.querySelector('.rs-bathrooms__select');
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('bathsMin', null);
    });

    it('should render label text', () => {
      new RSBathrooms(testElement);
      const label = testElement.querySelector('.rs-bathrooms__label');
      expect(label.textContent).toBe('Bathrooms');
    });

    it('should update display on state change', () => {
      new RSBathrooms(testElement);
      RealtySoftState.set('filters.bathsMin', 4);
      const select = testElement.querySelector('.rs-bathrooms__select');
      expect(select.value).toBe('4');
    });
  });

  describe('Variation 2 (Box Style)', () => {
    it('should render box buttons', () => {
      new RSBathrooms(testElement, { variation: '2' });
      const boxes = testElement.querySelectorAll('.rs-bathrooms__box');
      expect(boxes.length).toBe(10);
    });

    it('should set filter on box click', () => {
      new RSBathrooms(testElement, { variation: '2' });
      const box = testElement.querySelector('.rs-bathrooms__box[data-value="2"]');
      box.click();
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('bathsMin', 2);
    });
  });

  describe('Variation 3 (Multi-Select)', () => {
    it('should render multi-select dropdown', () => {
      new RSBathrooms(testElement, { variation: '3' });
      const button = testElement.querySelector('.rs-bathrooms__multiselect-button');
      expect(button).toBeTruthy();
    });

    it('should render checkboxes', () => {
      new RSBathrooms(testElement, { variation: '3' });
      const checkboxes = testElement.querySelectorAll('.rs-bathrooms__multiselect-checkbox');
      expect(checkboxes.length).toBe(10);
    });

    it('should toggle dropdown on button click', () => {
      new RSBathrooms(testElement, { variation: '3' });
      const button = testElement.querySelector('.rs-bathrooms__multiselect-button');
      const dropdown = testElement.querySelector('.rs-bathrooms__multiselect-dropdown');
      expect(dropdown.style.display).toBe('none');
      button.click();
      expect(dropdown.style.display).toBe('block');
    });
  });

  describe('Variation 4 (Free Input)', () => {
    it('should render a number input', () => {
      new RSBathrooms(testElement, { variation: '4' });
      const input = testElement.querySelector('.rs-bathrooms__input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('number');
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles when bathsMin locked', () => {
      RealtySoftState.setLockedFilters({ bathsMin: 2 });
      new RSBathrooms(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSBathrooms(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
