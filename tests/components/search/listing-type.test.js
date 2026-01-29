/**
 * Tests for RSListingType
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSListingType } from '../../../src/components/search/listing-type';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSListingType', () => {
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
      new RSListingType(testElement);
      expect(testElement.classList.contains('rs-listing-type')).toBe(true);
      expect(testElement.classList.contains('rs-listing-type--v1')).toBe(true);
    });

    it('should render a select element', () => {
      new RSListingType(testElement);
      const select = testElement.querySelector('.rs-listing-type__select');
      expect(select).toBeTruthy();
      expect(select.tagName).toBe('SELECT');
    });

    it('should have "All" as first option', () => {
      new RSListingType(testElement);
      const select = testElement.querySelector('.rs-listing-type__select');
      expect(select.options[0].value).toBe('');
    });

    it('should render all listing type options', () => {
      new RSListingType(testElement);
      const select = testElement.querySelector('.rs-listing-type__select');
      // "All" + 4 types = 5 options
      expect(select.options.length).toBe(5);
    });

    it('should render label', () => {
      new RSListingType(testElement);
      const label = testElement.querySelector('.rs-listing-type__label');
      expect(label.textContent).toBe('Status');
    });

    it('should set filter on change', () => {
      new RSListingType(testElement);
      const select = testElement.querySelector('.rs-listing-type__select');
      select.value = 'resale';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('listingType', 'resale');
    });

    it('should set null filter when "All" selected', () => {
      new RSListingType(testElement);
      const select = testElement.querySelector('.rs-listing-type__select');
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('listingType', null);
    });

    it('should update display on state change', () => {
      new RSListingType(testElement);
      RealtySoftState.set('filters.listingType', 'long_rental');
      const select = testElement.querySelector('.rs-listing-type__select');
      expect(select.value).toBe('long_rental');
    });
  });

  describe('Variation 2 (Checkboxes)', () => {
    it('should render checkboxes', () => {
      new RSListingType(testElement, { variation: '2' });
      const checkboxes = testElement.querySelectorAll('.rs-listing-type__checkbox');
      expect(checkboxes.length).toBe(4);
    });

    it('should add correct CSS class', () => {
      new RSListingType(testElement, { variation: '2' });
      expect(testElement.classList.contains('rs-listing-type--v2')).toBe(true);
    });

    it('should set filter when checkbox checked', () => {
      new RSListingType(testElement, { variation: '2' });
      const checkbox = testElement.querySelector('.rs-listing-type__checkbox');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('listingType', 'resale');
    });
  });

  describe('Variation 3 (Radio Buttons)', () => {
    it('should render radio buttons', () => {
      new RSListingType(testElement, { variation: '3' });
      const radios = testElement.querySelectorAll('.rs-listing-type__radio');
      // "All" + 4 types = 5 radios
      expect(radios.length).toBe(5);
    });

    it('should have "All" radio checked by default', () => {
      new RSListingType(testElement, { variation: '3' });
      const radios = testElement.querySelectorAll('.rs-listing-type__radio');
      expect(radios[0].checked).toBe(true);
      expect(radios[0].value).toBe('');
    });

    it('should set filter on radio change', () => {
      new RSListingType(testElement, { variation: '3' });
      const radio = testElement.querySelectorAll('.rs-listing-type__radio')[1];
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('listingType', 'resale');
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles when locked', () => {
      RealtySoftState.setLockedFilters({ listingType: 'resale' });
      new RSListingType(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSListingType(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
