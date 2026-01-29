/**
 * Tests for RSDetailFeatures (detail page features display)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailFeatures } from '../../../src/components/detail/features';
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

describe('RSDetailFeatures', () => {
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

  describe('render with string features', () => {
    it('should add rs-detail-features class', () => {
      const property = createMockProperty({ features: ['Pool', 'Garden', 'Garage'] });
      new RSDetailFeatures(testElement, { property });
      expect(testElement.classList.contains('rs-detail-features')).toBe(true);
    });

    it('should render feature items', () => {
      const property = createMockProperty({ features: ['Pool', 'Garden', 'Garage'] });
      new RSDetailFeatures(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-features__item');
      expect(items.length).toBe(3);
    });

    it('should render feature text', () => {
      const property = createMockProperty({ features: ['Swimming Pool'] });
      new RSDetailFeatures(testElement, { property });
      const texts = testElement.querySelectorAll('.rs-detail-features__text');
      expect(texts[0].textContent).toBe('Swimming Pool');
    });

    it('should render checkmark icons', () => {
      const property = createMockProperty({ features: ['Pool', 'Garden'] });
      new RSDetailFeatures(testElement, { property });
      const icons = testElement.querySelectorAll('.rs-detail-features__icon');
      expect(icons.length).toBe(2);
    });

    it('should group string features under default "Features" category', () => {
      const property = createMockProperty({ features: ['Pool', 'Garden'] });
      new RSDetailFeatures(testElement, { property });
      const title = testElement.querySelector('.rs-detail-features__title');
      expect(title.textContent).toBe('Features');
    });
  });

  describe('render with categorized features', () => {
    it('should group features by category', () => {
      const property = createMockProperty({
        features: [
          { name: 'Pool', category: 'Outdoor' },
          { name: 'Garden', category: 'Outdoor' },
          { name: 'Air Conditioning', category: 'Indoor' },
        ],
      });
      new RSDetailFeatures(testElement, { property });
      const groups = testElement.querySelectorAll('.rs-detail-features__group');
      expect(groups.length).toBe(2);
    });

    it('should render category titles', () => {
      const property = createMockProperty({
        features: [
          { name: 'Pool', category: 'Outdoor' },
          { name: 'Heating', category: 'Indoor' },
        ],
      });
      new RSDetailFeatures(testElement, { property });
      const titles = testElement.querySelectorAll('.rs-detail-features__title');
      const titleTexts = Array.from(titles).map(t => t.textContent);
      expect(titleTexts).toContain('Outdoor');
      expect(titleTexts).toContain('Indoor');
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailFeatures(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when features array is empty', () => {
      const property = createMockProperty({ features: [] });
      new RSDetailFeatures(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('HTML escaping', () => {
    it('should escape HTML in feature names', () => {
      const property = createMockProperty({ features: ['<b>Bold</b> Feature'] });
      new RSDetailFeatures(testElement, { property });
      const text = testElement.querySelector('.rs-detail-features__text');
      expect(text.innerHTML).not.toContain('<b>');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ features: ['Pool'] });
      const component = new RSDetailFeatures(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
