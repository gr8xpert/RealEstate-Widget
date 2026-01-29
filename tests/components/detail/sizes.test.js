/**
 * Tests for RSDetailSizes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailSizes } from '../../../src/components/detail/sizes';
import { createMockProperty } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goBack: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSDetailSizes', () => {
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
    it('should add rs-detail-sizes class', () => {
      const property = createMockProperty({ built_area: 150, plot_size: 500 });
      new RSDetailSizes(testElement, { property });
      expect(testElement.classList.contains('rs-detail-sizes')).toBe(true);
    });

    it('should render title', () => {
      const property = createMockProperty({ built_area: 150 });
      new RSDetailSizes(testElement, { property });
      const title = testElement.querySelector('.rs-detail-sizes__title');
      expect(title).toBeTruthy();
    });

    it('should render sizes grid', () => {
      const property = createMockProperty({ built_area: 150, plot_size: 500 });
      new RSDetailSizes(testElement, { property });
      const grid = testElement.querySelector('.rs-detail-sizes__grid');
      expect(grid).toBeTruthy();
    });

    it('should render built area item', () => {
      const property = createMockProperty({ built_area: 200 });
      new RSDetailSizes(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-sizes__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts.some(t => t.includes('200'))).toBe(true);
    });

    it('should render plot size item', () => {
      const property = createMockProperty({ plot_size: 600 });
      new RSDetailSizes(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-sizes__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts.some(t => t.includes('600'))).toBe(true);
    });

    it('should render terrace size when present', () => {
      const property = createMockProperty({ terrace_size: 40 });
      new RSDetailSizes(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-sizes__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts.some(t => t.includes('40'))).toBe(true);
    });

    it('should render garden size when present', () => {
      const property = createMockProperty({ garden_size: 100 });
      new RSDetailSizes(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-sizes__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts.some(t => t.includes('100'))).toBe(true);
    });

    it('should render SVG icons for each size item', () => {
      const property = createMockProperty({ built_area: 150, plot_size: 500 });
      new RSDetailSizes(testElement, { property });
      const icons = testElement.querySelectorAll('.rs-detail-sizes__icon');
      expect(icons.length).toBe(2);
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailSizes(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when all sizes are zero', () => {
      const property = createMockProperty({
        built_area: 0, plot_size: 0, usable_area: 0,
        terrace_size: 0, solarium_size: 0, garden_size: 0,
      });
      new RSDetailSizes(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });

    it('should skip sizes with zero value', () => {
      const property = createMockProperty({ built_area: 150, plot_size: 0, terrace_size: 30 });
      new RSDetailSizes(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-sizes__item');
      expect(items.length).toBe(2);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ built_area: 150 });
      const component = new RSDetailSizes(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
