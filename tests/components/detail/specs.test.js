/**
 * Tests for RSDetailSpecs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailSpecs } from '../../../src/components/detail/specs';
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

describe('RSDetailSpecs', () => {
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
    it('should add rs-detail-specs class when property has specs', () => {
      const property = createMockProperty({ beds: 3, baths: 2, built_area: 150, plot_size: 500 });
      new RSDetailSpecs(testElement, { property });
      expect(testElement.classList.contains('rs-detail-specs')).toBe(true);
    });

    it('should render specs grid', () => {
      const property = createMockProperty({ beds: 3, baths: 2, built_area: 150 });
      new RSDetailSpecs(testElement, { property });
      const grid = testElement.querySelector('.rs-detail-specs__grid');
      expect(grid).toBeTruthy();
    });

    it('should render bedrooms spec', () => {
      const property = createMockProperty({ beds: 4 });
      new RSDetailSpecs(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-specs__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts).toContain('4');
    });

    it('should render bathrooms spec', () => {
      const property = createMockProperty({ baths: 3 });
      new RSDetailSpecs(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-specs__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts).toContain('3');
    });

    it('should render built area with m2', () => {
      const property = createMockProperty({ built_area: 200 });
      new RSDetailSpecs(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-specs__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts.some(t => t.includes('200'))).toBe(true);
    });

    it('should render plot size with m2', () => {
      const property = createMockProperty({ plot_size: 600 });
      new RSDetailSpecs(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-specs__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts.some(t => t.includes('600'))).toBe(true);
    });

    it('should render terrace size when present', () => {
      const property = createMockProperty({ terrace_size: 50 });
      new RSDetailSpecs(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-specs__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts.some(t => t.includes('50'))).toBe(true);
    });

    it('should render SVG icons for each spec', () => {
      const property = createMockProperty({ beds: 3, baths: 2 });
      new RSDetailSpecs(testElement, { property });
      const icons = testElement.querySelectorAll('.rs-detail-specs__icon');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailSpecs(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when all specs are zero', () => {
      const property = createMockProperty({ beds: 0, baths: 0, built_area: 0, plot_size: 0, terrace_size: 0 });
      new RSDetailSpecs(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });

    it('should skip specs with zero value', () => {
      const property = createMockProperty({ beds: 3, baths: 0, built_area: 150, plot_size: 0 });
      new RSDetailSpecs(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-specs__item');
      expect(items.length).toBe(2);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ beds: 3 });
      const component = new RSDetailSpecs(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
