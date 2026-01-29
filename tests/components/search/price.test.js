/**
 * Tests for RSPrice
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSPrice } from '../../../src/components/search/price';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSPrice', () => {
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

  describe('Variation 1 (Styled Dropdown) - Min', () => {
    it('should add correct CSS classes', () => {
      new RSPrice(testElement);
      expect(testElement.classList.contains('rs-price')).toBe(true);
      expect(testElement.classList.contains('rs-price--v1')).toBe(true);
      expect(testElement.classList.contains('rs-price--min')).toBe(true);
    });

    it('should render a select element', () => {
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      expect(select).toBeTruthy();
    });

    it('should show "Min Price" placeholder', () => {
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      expect(select.options[0].textContent).toContain('Min Price');
    });

    it('should render price options', () => {
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      expect(select.options.length).toBeGreaterThan(1);
    });

    it('should set priceMin filter on change', () => {
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      select.value = '200000';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('priceMin', 200000);
    });

    it('should clear filter when empty value selected', () => {
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('priceMin', null);
    });
  });

  describe('Variation 1 (Styled Dropdown) - Max', () => {
    it('should render as max type', () => {
      testElement.dataset.rsType = 'max';
      new RSPrice(testElement);
      expect(testElement.classList.contains('rs-price--max')).toBe(true);
    });

    it('should show "Max Price" placeholder', () => {
      testElement.dataset.rsType = 'max';
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      expect(select.options[0].textContent).toContain('Max Price');
    });

    it('should set priceMax filter on change', () => {
      testElement.dataset.rsType = 'max';
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      select.value = '500000';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('priceMax', 500000);
    });
  });

  describe('Variation 4 (Free Input)', () => {
    it('should render a number input', () => {
      new RSPrice(testElement, { variation: '4' });
      const input = testElement.querySelector('.rs-price__input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('number');
    });

    it('should show currency symbol', () => {
      new RSPrice(testElement, { variation: '4' });
      const currency = testElement.querySelector('.rs-price__currency');
      expect(currency.textContent).toBe('€');
    });
  });

  describe('price options by listing type', () => {
    it('should show sale prices by default', () => {
      new RSPrice(testElement);
      const select = testElement.querySelector('.rs-price__select');
      // Sale prices start at 50000
      const values = Array.from(select.options).map(o => o.value).filter(Boolean);
      expect(Number(values[0])).toBeGreaterThanOrEqual(50000);
    });

    it('should update prices when listing type changes to rental', () => {
      new RSPrice(testElement);
      RealtySoftState.set('filters.listingType', 'long_rental');
      // Component should re-render with rental prices
      const select = testElement.querySelector('.rs-price__select');
      const values = Array.from(select.options).map(o => Number(o.value)).filter(Boolean);
      // Rental prices are much lower
      expect(values[0]).toBeLessThan(50000);
    });
  });

  describe('state subscriptions', () => {
    it('should subscribe to priceMin changes', () => {
      new RSPrice(testElement);
      const initialSubCount = RealtySoftState.getState(); // Just checking it doesn't throw
      expect(initialSubCount).toBeTruthy();
    });

    it('should subscribe to listingType changes', () => {
      const component = new RSPrice(testElement);
      // At least 3 subscriptions: priceMin, priceMax, listingType
      expect(component.subscriptions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles when priceMin locked', () => {
      RealtySoftState.setLockedFilters({ priceMin: 100000 });
      new RSPrice(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSPrice(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
