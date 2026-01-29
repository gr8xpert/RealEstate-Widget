/**
 * Tests for RSSort
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSSort } from '../../../src/components/listing/sort';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goToPage: vi.fn(),
  setSort: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

// RSSort reads from window.RealtySoftState.get at init time
window.RealtySoftState = RealtySoftState;

describe('RSSort', () => {
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
    it('should add the rs-sort CSS class', () => {
      new RSSort(testElement);
      expect(testElement.classList.contains('rs-sort')).toBe(true);
    });

    it('should render a wrapper element', () => {
      new RSSort(testElement);
      const wrapper = testElement.querySelector('.rs-sort__wrapper');
      expect(wrapper).toBeTruthy();
    });

    it('should render a label element', () => {
      new RSSort(testElement);
      const label = testElement.querySelector('.rs-sort__label');
      expect(label).toBeTruthy();
      expect(label.textContent).toBe('Sort by');
    });

    it('should render a select element', () => {
      new RSSort(testElement);
      const select = testElement.querySelector('.rs-sort__select');
      expect(select).toBeTruthy();
      expect(select.tagName).toBe('SELECT');
    });

    it('should render 9 sort options', () => {
      new RSSort(testElement);
      const select = testElement.querySelector('.rs-sort__select');
      expect(select.options.length).toBe(9);
    });

    it('should default to create_date_desc (Newest Listings)', () => {
      new RSSort(testElement);
      const select = testElement.querySelector('.rs-sort__select');
      expect(select.value).toBe('create_date_desc');
    });

    it('should render correct sort option labels', () => {
      new RSSort(testElement);
      const select = testElement.querySelector('.rs-sort__select');
      const optionTexts = Array.from(select.options).map(o => o.textContent.trim());
      expect(optionTexts).toContain('Newest Listings');
      expect(optionTexts).toContain('Price: Low to High');
      expect(optionTexts).toContain('Price: High to Low');
      expect(optionTexts).toContain('Featured First');
    });

    it('should render a decorative icon', () => {
      new RSSort(testElement);
      const icon = testElement.querySelector('.rs-sort__icon');
      expect(icon).toBeTruthy();
    });
  });

  describe('events', () => {
    it('should call setSort when a sort option is selected', () => {
      new RSSort(testElement);
      const select = testElement.querySelector('.rs-sort__select');
      select.value = 'list_price';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setSort).toHaveBeenCalledWith('list_price');
    });

    it('should call setSort with price_desc value', () => {
      new RSSort(testElement);
      const select = testElement.querySelector('.rs-sort__select');
      select.value = 'list_price_desc';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setSort).toHaveBeenCalledWith('list_price_desc');
    });
  });

  describe('state subscriptions', () => {
    it('should update select value when ui.sort changes', () => {
      new RSSort(testElement);
      RealtySoftState.set('ui.sort', 'list_price_desc');
      const select = testElement.querySelector('.rs-sort__select');
      expect(select.value).toBe('list_price_desc');
    });

    it('should update select value back to default', () => {
      new RSSort(testElement);
      RealtySoftState.set('ui.sort', 'list_price');
      RealtySoftState.set('ui.sort', 'create_date_desc');
      const select = testElement.querySelector('.rs-sort__select');
      expect(select.value).toBe('create_date_desc');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSSort(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
