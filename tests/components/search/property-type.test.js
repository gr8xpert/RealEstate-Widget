/**
 * Tests for RSPropertyType
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSPropertyType } from '../../../src/components/search/property-type';
import { createMockPropertyTypes } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSPropertyType', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    RealtySoftState.set('data.propertyTypes', createMockPropertyTypes());
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
      new RSPropertyType(testElement);
      expect(testElement.classList.contains('rs-property-type')).toBe(true);
      expect(testElement.classList.contains('rs-property-type--v1')).toBe(true);
    });

    it('should render label', () => {
      new RSPropertyType(testElement);
      const label = testElement.querySelector('.rs-property-type__label');
      expect(label.textContent).toBe('Property Type');
    });

    it('should render search input', () => {
      new RSPropertyType(testElement);
      const input = testElement.querySelector('.rs-property-type__input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('should render dropdown (hidden)', () => {
      new RSPropertyType(testElement);
      const dropdown = testElement.querySelector('.rs-property-type__dropdown');
      expect(dropdown).toBeTruthy();
      expect(dropdown.style.display).toBe('none');
    });

    it('should have clear button hidden initially', () => {
      new RSPropertyType(testElement);
      const clearBtn = testElement.querySelector('.rs-property-type__clear');
      expect(clearBtn.style.display).toBe('none');
    });

    it('should filter types on input', () => {
      new RSPropertyType(testElement);
      const input = testElement.querySelector('.rs-property-type__input');
      input.value = 'Vil';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const dropdown = testElement.querySelector('.rs-property-type__dropdown');
      expect(dropdown.style.display).toBe('block');
    });
  });

  describe('Variation 2 (Flat Multi-Select)', () => {
    it('should render multi-select button', () => {
      new RSPropertyType(testElement, { variation: '2' });
      const button = testElement.querySelector('.rs-property-type__button');
      expect(button).toBeTruthy();
    });

    it('should render checkboxes for property types', () => {
      new RSPropertyType(testElement, { variation: '2' });
      const checkboxes = testElement.querySelectorAll('.rs-property-type__checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should render dropdown hidden initially', () => {
      new RSPropertyType(testElement, { variation: '2' });
      const dropdown = testElement.querySelector('.rs-property-type__dropdown');
      expect(dropdown.style.display).toBe('none');
    });

    it('should toggle dropdown on button click', () => {
      new RSPropertyType(testElement, { variation: '2' });
      const button = testElement.querySelector('.rs-property-type__button');
      button.click();
      const dropdown = testElement.querySelector('.rs-property-type__dropdown');
      expect(dropdown.style.display).toBe('block');
    });

    it('should have filter input', () => {
      new RSPropertyType(testElement, { variation: '2' });
      const filter = testElement.querySelector('.rs-property-type__filter');
      expect(filter).toBeTruthy();
    });

    it('should have tags container', () => {
      new RSPropertyType(testElement, { variation: '2' });
      const tags = testElement.querySelector('.rs-property-type__tags');
      expect(tags).toBeTruthy();
    });
  });

  describe('Variation 3 (Accordion Multi-Select)', () => {
    it('should render accordion', () => {
      new RSPropertyType(testElement, { variation: '3' });
      expect(testElement.classList.contains('rs-property-type--v3')).toBe(true);
    });

    it('should render button', () => {
      new RSPropertyType(testElement, { variation: '3' });
      const button = testElement.querySelector('.rs-property-type__button');
      expect(button).toBeTruthy();
    });
  });

  describe('Variation 4 (Traditional Dropdown)', () => {
    it('should render a select element', () => {
      new RSPropertyType(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-property-type__select');
      expect(select).toBeTruthy();
    });

    it('should populate options from property types data', () => {
      new RSPropertyType(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-property-type__select');
      // Should have placeholder + parent and child options
      expect(select.options.length).toBeGreaterThan(1);
    });

    it('should set filter on change', () => {
      new RSPropertyType(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-property-type__select');
      select.value = '1';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('propertyType', 1);
    });

    it('should clear filter when empty selected', () => {
      new RSPropertyType(testElement, { variation: '4' });
      const select = testElement.querySelector('.rs-property-type__select');
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('propertyType', null);
    });
  });

  describe('state subscriptions', () => {
    it('should update when propertyTypes data changes', () => {
      new RSPropertyType(testElement, { variation: '4' });
      RealtySoftState.set('data.propertyTypes', [
        { id: 10, name: 'Studio', parent_id: null },
      ]);
      const select = testElement.querySelector('.rs-property-type__select');
      const optionTexts = Array.from(select.options).map(o => o.textContent.trim());
      expect(optionTexts).toContain('Studio');
    });

    it('should clear selection when filter reset', () => {
      new RSPropertyType(testElement);
      RealtySoftState.set('filters.propertyType', null);
      // Should not throw
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles', () => {
      RealtySoftState.setLockedFilters({ propertyType: 1 });
      new RSPropertyType(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSPropertyType(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
