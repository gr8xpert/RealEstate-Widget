/**
 * Tests for RSFeatures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSFeatures } from '../../../src/components/search/features';
import { createMockFeatures } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
const mockAPI = {
  getFeatures: vi.fn().mockResolvedValue({ data: createMockFeatures() }),
};
globalThis.RealtySoft = mockRealtySoft;
globalThis.RealtySoftAPI = mockAPI;

describe('RSFeatures', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    RealtySoftState.set('data.features', createMockFeatures());
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Remove overlay from body
    const overlays = document.querySelectorAll('.rs-features__overlay');
    overlays.forEach(o => o.remove());

    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('render', () => {
    it('should add rs-features class', () => {
      new RSFeatures(testElement);
      expect(testElement.classList.contains('rs-features')).toBe(true);
    });

    it('should render label', () => {
      new RSFeatures(testElement);
      const label = testElement.querySelector('.rs-features__label');
      expect(label.textContent).toBe('Features');
    });

    it('should render trigger button', () => {
      new RSFeatures(testElement);
      const trigger = testElement.querySelector('.rs-features__trigger');
      expect(trigger).toBeTruthy();
    });

    it('should show "Select Features" text on trigger', () => {
      new RSFeatures(testElement);
      const text = testElement.querySelector('.rs-features__trigger-text');
      expect(text.textContent).toBe('Select Features');
    });

    it('should create overlay in document body', () => {
      new RSFeatures(testElement);
      const overlay = document.querySelector('.rs-features__overlay');
      expect(overlay).toBeTruthy();
    });

    it('should have overlay hidden initially', () => {
      new RSFeatures(testElement);
      const overlay = document.querySelector('.rs-features__overlay');
      expect(overlay.style.display).toBe('none');
    });

    it('should render modal with title', () => {
      new RSFeatures(testElement);
      const title = document.querySelector('.rs-features__modal-title');
      expect(title.textContent).toBe('Features');
    });

    it('should render search input in modal', () => {
      new RSFeatures(testElement);
      const search = document.querySelector('.rs-features__search');
      expect(search).toBeTruthy();
    });

    it('should render clear and done buttons', () => {
      new RSFeatures(testElement);
      const clearBtn = document.querySelector('.rs-features__clear-btn');
      const doneBtn = document.querySelector('.rs-features__done-btn');
      expect(clearBtn).toBeTruthy();
      expect(doneBtn).toBeTruthy();
    });
  });

  describe('category display', () => {
    it('should render feature categories', () => {
      new RSFeatures(testElement);
      const categories = document.querySelectorAll('.rs-features__category');
      expect(categories.length).toBe(2); // Outdoor, Indoor from mock data
    });

    it('should render category names', () => {
      new RSFeatures(testElement);
      const names = document.querySelectorAll('.rs-features__category-name');
      const nameTexts = Array.from(names).map(n => n.textContent);
      expect(nameTexts).toContain('Indoor');
      expect(nameTexts).toContain('Outdoor');
    });

    it('should render feature checkboxes', () => {
      new RSFeatures(testElement);
      const checkboxes = document.querySelectorAll('.rs-features__checkbox');
      // Outdoor: 3 + Indoor: 2 = 5
      expect(checkboxes.length).toBe(5);
    });
  });

  describe('events', () => {
    it('should show modal on trigger click', () => {
      new RSFeatures(testElement);
      const trigger = testElement.querySelector('.rs-features__trigger');
      trigger.click();
      const overlay = document.querySelector('.rs-features__overlay');
      expect(overlay.style.display).toBe('flex');
    });

    it('should hide modal on done button click', () => {
      new RSFeatures(testElement);
      // Open
      testElement.querySelector('.rs-features__trigger').click();
      // Close
      document.querySelector('.rs-features__done-btn').click();
      const overlay = document.querySelector('.rs-features__overlay');
      expect(overlay.style.display).toBe('none');
    });

    it('should hide modal on X button click', () => {
      new RSFeatures(testElement);
      testElement.querySelector('.rs-features__trigger').click();
      document.querySelector('.rs-features__modal-close').click();
      const overlay = document.querySelector('.rs-features__overlay');
      expect(overlay.style.display).toBe('none');
    });

    it('should update trigger text when features selected', () => {
      new RSFeatures(testElement);
      testElement.querySelector('.rs-features__trigger').click();
      const checkbox = document.querySelector('.rs-features__checkbox');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      const text = testElement.querySelector('.rs-features__trigger-text');
      expect(text.textContent).toBe('1 feature selected');
    });

    it('should set features filter on checkbox change', () => {
      new RSFeatures(testElement);
      testElement.querySelector('.rs-features__trigger').click();
      const checkbox = document.querySelector('.rs-features__checkbox');
      const featureId = parseInt(checkbox.value);
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('features', [featureId]);
    });

    it('should clear all features on clear button click', () => {
      new RSFeatures(testElement);
      testElement.querySelector('.rs-features__trigger').click();
      // Select a feature first
      const checkbox = document.querySelector('.rs-features__checkbox');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      // Clear
      document.querySelector('.rs-features__clear-btn').click();
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('features', []);
    });
  });

  describe('category toggle', () => {
    it('should expand category on header click', () => {
      new RSFeatures(testElement);
      testElement.querySelector('.rs-features__trigger').click();
      const header = document.querySelector('.rs-features__category-header');
      header.click();
      const items = header.parentElement.querySelector('.rs-features__category-items');
      expect(items.style.display).toBe('block');
    });
  });

  describe('state subscription', () => {
    it('should update when features filter changes', () => {
      new RSFeatures(testElement);
      RealtySoftState.set('filters.features', [101]);
      const text = testElement.querySelector('.rs-features__trigger-text');
      expect(text.textContent).toBe('1 feature selected');
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles', () => {
      RealtySoftState.setLockedFilters({ features: [1, 2] });
      new RSFeatures(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSFeatures(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
