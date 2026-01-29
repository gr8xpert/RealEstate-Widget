/**
 * Tests for RSPlotSize
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSPlotSize } from '../../../src/components/search/plot-size';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSPlotSize', () => {
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
      new RSPlotSize(testElement);
      expect(testElement.classList.contains('rs-plot-size')).toBe(true);
      expect(testElement.classList.contains('rs-plot-size--v1')).toBe(true);
    });

    it('should render label', () => {
      new RSPlotSize(testElement);
      const label = testElement.querySelector('.rs-plot-size__label');
      expect(label.textContent).toBe('Plot Size');
    });

    it('should render min and max inputs', () => {
      new RSPlotSize(testElement);
      expect(testElement.querySelector('.rs-plot-size__input--min')).toBeTruthy();
      expect(testElement.querySelector('.rs-plot-size__input--max')).toBeTruthy();
    });

    it('should show m² units', () => {
      new RSPlotSize(testElement);
      const units = testElement.querySelectorAll('.rs-plot-size__unit');
      expect(units.length).toBe(2);
    });

    it('should set plotMin filter on min change', () => {
      new RSPlotSize(testElement);
      const minInput = testElement.querySelector('.rs-plot-size__input--min');
      minInput.value = '500';
      minInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('plotMin', 500);
    });

    it('should set plotMax filter on max change', () => {
      new RSPlotSize(testElement);
      const maxInput = testElement.querySelector('.rs-plot-size__input--max');
      maxInput.value = '2000';
      maxInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('plotMax', 2000);
    });

    it('should update display on state change', () => {
      new RSPlotSize(testElement);
      RealtySoftState.set('filters.plotMin', 300);
      const minInput = testElement.querySelector('.rs-plot-size__input--min');
      expect(minInput.value).toBe('300');
    });
  });

  describe('Variation 2 (Range Slider)', () => {
    it('should render sliders', () => {
      new RSPlotSize(testElement, { variation: '2' });
      const sliders = testElement.querySelectorAll('.rs-plot-size__slider');
      expect(sliders.length).toBe(2);
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles when plotMin locked', () => {
      RealtySoftState.setLockedFilters({ plotMin: 200 });
      new RSPlotSize(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up', () => {
      const component = new RSPlotSize(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
