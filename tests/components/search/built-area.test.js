/**
 * Tests for RSBuiltArea
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSBuiltArea } from '../../../src/components/search/built-area';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSBuiltArea', () => {
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

  describe('Variation 1 (Min/Max Inputs)', () => {
    it('should add correct CSS classes', () => {
      new RSBuiltArea(testElement);
      expect(testElement.classList.contains('rs-built-area')).toBe(true);
      expect(testElement.classList.contains('rs-built-area--v1')).toBe(true);
    });

    it('should render label', () => {
      new RSBuiltArea(testElement);
      const label = testElement.querySelector('.rs-built-area__label');
      expect(label.textContent).toBe('Built Area');
    });

    it('should render min input', () => {
      new RSBuiltArea(testElement);
      const minInput = testElement.querySelector('.rs-built-area__input--min');
      expect(minInput).toBeTruthy();
      expect(minInput.type).toBe('number');
    });

    it('should render max input', () => {
      new RSBuiltArea(testElement);
      const maxInput = testElement.querySelector('.rs-built-area__input--max');
      expect(maxInput).toBeTruthy();
      expect(maxInput.type).toBe('number');
    });

    it('should show m² unit labels', () => {
      new RSBuiltArea(testElement);
      const units = testElement.querySelectorAll('.rs-built-area__unit');
      expect(units.length).toBe(2);
      expect(units[0].textContent).toBe('m²');
    });

    it('should set builtMin filter on min input change', () => {
      new RSBuiltArea(testElement);
      const minInput = testElement.querySelector('.rs-built-area__input--min');
      minInput.value = '100';
      minInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('builtMin', 100);
    });

    it('should set builtMax filter on max input change', () => {
      new RSBuiltArea(testElement);
      const maxInput = testElement.querySelector('.rs-built-area__input--max');
      maxInput.value = '500';
      maxInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('builtMax', 500);
    });

    it('should clear filter when input cleared', () => {
      new RSBuiltArea(testElement);
      const minInput = testElement.querySelector('.rs-built-area__input--min');
      minInput.value = '';
      minInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('builtMin', null);
    });

    it('should update display on state change', () => {
      new RSBuiltArea(testElement);
      RealtySoftState.set('filters.builtMin', 200);
      const minInput = testElement.querySelector('.rs-built-area__input--min');
      expect(minInput.value).toBe('200');
    });

    it('should render separator', () => {
      new RSBuiltArea(testElement);
      const separator = testElement.querySelector('.rs-built-area__separator');
      expect(separator.textContent).toBe('-');
    });
  });

  describe('Variation 2 (Range Slider)', () => {
    it('should render sliders', () => {
      new RSBuiltArea(testElement, { variation: '2' });
      const sliders = testElement.querySelectorAll('.rs-built-area__slider');
      expect(sliders.length).toBe(2);
    });

    it('should render min and max slider labels', () => {
      new RSBuiltArea(testElement, { variation: '2' });
      const minLabel = testElement.querySelector('.rs-built-area__slider-min');
      const maxLabel = testElement.querySelector('.rs-built-area__slider-max');
      expect(minLabel).toBeTruthy();
      expect(maxLabel).toBeTruthy();
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles when builtMin locked', () => {
      RealtySoftState.setLockedFilters({ builtMin: 100 });
      new RSBuiltArea(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSBuiltArea(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
