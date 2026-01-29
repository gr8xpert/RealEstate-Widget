/**
 * Tests for RSDetailRelated
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailRelated } from '../../../src/components/detail/related';
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
globalThis.RealtySoftAnalytics = {
  track: vi.fn(),
  trackSearch: vi.fn(),
  trackDetail: vi.fn(),
  trackWishlist: vi.fn(),
  trackInquiry: vi.fn(),
  trackShare: vi.fn(),
  trackLanguageChange: vi.fn(),
  trackCardClick: vi.fn(),
};

const relatedProperties = [
  createMockProperty({ id: 10, title: 'Related Villa 1', price: 250000, location: 'Estepona', beds: 2, baths: 1, built_area: 100 }),
  createMockProperty({ id: 11, title: 'Related Villa 2', price: 450000, location: 'Marbella', beds: 4, baths: 3, built_area: 250 }),
  createMockProperty({ id: 12, title: 'Related Apt 1', price: 180000, location: 'Fuengirola', beds: 1, baths: 1, built_area: 70 }),
];

const mockAPI = {
  searchProperties: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getProperty: vi.fn().mockResolvedValue({ data: null }),
  getLocations: vi.fn().mockResolvedValue({ data: [] }),
  getPropertyTypes: vi.fn().mockResolvedValue({ data: [] }),
  getFeatures: vi.fn().mockResolvedValue({ data: [] }),
  getLabels: vi.fn().mockResolvedValue({ data: {} }),
  prefetchProperty: vi.fn(),
  submitInquiry: vi.fn().mockResolvedValue({ success: true }),
  clearCache: vi.fn(),
  getRelatedProperties: vi.fn().mockResolvedValue({ data: relatedProperties }),
};
globalThis.RealtySoftAPI = mockAPI;

describe('RSDetailRelated', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();
    mockAPI.getRelatedProperties.mockResolvedValue({ data: relatedProperties });
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('render', () => {
    it('should add rs-detail-related class', () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      expect(testElement.classList.contains('rs-detail-related')).toBe(true);
    });

    it('should render title', () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      const title = testElement.querySelector('.rs-detail-related__title');
      expect(title).toBeTruthy();
    });

    it('should render loading spinner initially', () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      const loader = testElement.querySelector('.rs-detail-related__loader');
      expect(loader).toBeTruthy();
    });

    it('should render grid container', () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      const grid = testElement.querySelector('.rs-detail-related__grid');
      expect(grid).toBeTruthy();
    });
  });

  describe('loading related properties', () => {
    it('should call API to get related properties', async () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        expect(mockAPI.getRelatedProperties).toHaveBeenCalledWith(property.id, 6);
      });
    });

    it('should render property cards after loading', async () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        const cards = testElement.querySelectorAll('.rs-detail-related__card');
        expect(cards.length).toBe(3);
      });
    });

    it('should render card titles', async () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        const titles = testElement.querySelectorAll('.rs-detail-related__card-title');
        expect(titles.length).toBe(3);
      });
    });

    it('should render card prices', async () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        const prices = testElement.querySelectorAll('.rs-detail-related__card-price');
        expect(prices.length).toBe(3);
      });
    });

    it('should hide loader after loading', async () => {
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        const loader = testElement.querySelector('.rs-detail-related__loader');
        expect(loader.style.display).toBe('none');
      });
    });

    it('should respect custom limit from data attribute', async () => {
      testElement.dataset.limit = '4';
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        expect(mockAPI.getRelatedProperties).toHaveBeenCalledWith(property.id, 4);
      });
    });

    it('should hide element when API returns empty array', async () => {
      mockAPI.getRelatedProperties.mockResolvedValue({ data: [] });
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        expect(testElement.style.display).toBe('none');
      });
    });

    it('should hide element when API call fails', async () => {
      mockAPI.getRelatedProperties.mockRejectedValue(new Error('Network error'));
      const property = createMockProperty();
      new RSDetailRelated(testElement, { property });
      await vi.waitFor(() => {
        expect(testElement.style.display).toBe('none');
      });
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailRelated(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when property has no id', () => {
      const property = createMockProperty({ id: null });
      new RSDetailRelated(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty();
      const component = new RSDetailRelated(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
