/**
 * Tests for RSPropertyDetailTemplate
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSPropertyDetailTemplate } from '../../../src/components/detail/property-detail-template';
import { createMockProperty } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goBack: vi.fn(),
  loadProperty: vi.fn().mockResolvedValue(undefined),
  loadPropertyByRef: vi.fn().mockResolvedValue(undefined),
};
globalThis.RealtySoft = mockRealtySoft;
globalThis.RealtySoftAnalytics = {
  track: vi.fn(),
  trackSearch: vi.fn(),
  trackDetail: vi.fn(),
  trackWishlist: vi.fn(),
  trackWishlistAdd: vi.fn(),
  trackWishlistRemove: vi.fn(),
  trackInquiry: vi.fn(),
  trackShare: vi.fn(),
  trackLanguageChange: vi.fn(),
  trackGalleryView: vi.fn(),
  trackCardClick: vi.fn(),
  trackResourceClick: vi.fn(),
};
globalThis.RealtySoftToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

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
  getCachedProperty: vi.fn().mockReturnValue(null),
  getRelatedProperties: vi.fn().mockResolvedValue({ data: [] }),
};
globalThis.RealtySoftAPI = mockAPI;
globalThis.WishlistManager = {
  has: vi.fn(() => false),
  add: vi.fn(),
  remove: vi.fn(),
};

describe('RSPropertyDetailTemplate', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();
    mockAPI.getCachedProperty.mockReturnValue(null);
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('initialization', () => {
    it('should add rs-property-detail-template class', () => {
      testElement.dataset.propertyId = '123';
      new RSPropertyDetailTemplate(testElement);
      expect(testElement.classList.contains('rs-property-detail-template')).toBe(true);
    });

    it('should load property by numeric ID from data attribute', () => {
      testElement.dataset.propertyId = '456';
      new RSPropertyDetailTemplate(testElement);
      expect(mockRealtySoft.loadProperty).toHaveBeenCalledWith(456);
    });

    it('should load property by reference from data attribute', () => {
      testElement.dataset.propertyRef = 'ABC123';
      new RSPropertyDetailTemplate(testElement);
      expect(mockRealtySoft.loadPropertyByRef).toHaveBeenCalledWith('ABC123');
    });

    it('should treat non-numeric data-property-id as reference', () => {
      testElement.dataset.propertyId = 'REF001';
      new RSPropertyDetailTemplate(testElement);
      expect(mockRealtySoft.loadPropertyByRef).toHaveBeenCalledWith('REF001');
    });

    it('should show skeleton when no cached property', () => {
      testElement.dataset.propertyId = '123';
      mockAPI.getCachedProperty.mockReturnValue(null);
      new RSPropertyDetailTemplate(testElement);
      const skeleton = testElement.querySelector('.rs-property-detail-template__skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should render immediately with cached property', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ id: 123, title: 'Cached Villa' });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const title = testElement.querySelector('.rs-template__title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Cached Villa');
    });

    it('should show error when no ID or reference found', () => {
      // No data attributes and no URL patterns
      new RSPropertyDetailTemplate(testElement);
      const error = testElement.querySelector('.rs-property-detail-template__error');
      expect(error).toBeTruthy();
    });
  });

  describe('render', () => {
    it('should render gallery section', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ id: 123, images: ['https://example.com/img.jpg'] });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const gallery = testElement.querySelector('#rs-template-gallery');
      expect(gallery).toBeTruthy();
    });

    it('should render property title', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ title: 'Beautiful Villa' });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const title = testElement.querySelector('.rs-template__title');
      expect(title.textContent).toContain('Beautiful Villa');
    });

    it('should render property price', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ price: 500000 });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const price = testElement.querySelector('.rs-template__price');
      expect(price).toBeTruthy();
    });

    it('should render location', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ location: 'Marbella' });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const location = testElement.querySelector('.rs-template__location');
      expect(location.textContent).toContain('Marbella');
    });

    it('should render reference number', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ ref: 'REF001' });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const ref = testElement.querySelector('.rs-template__ref');
      expect(ref).toBeTruthy();
      expect(ref.textContent).toContain('REF001');
    });

    it('should render share section', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty();
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const share = testElement.querySelector('#rs-template-share');
      expect(share).toBeTruthy();
    });

    it('should render wishlist section', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty();
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const wishlist = testElement.querySelector('#rs-template-wishlist');
      expect(wishlist).toBeTruthy();
    });

    it('should render map section', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ location: 'Marbella' });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const map = testElement.querySelector('#rs-template-map');
      expect(map).toBeTruthy();
    });

    it('should render inquiry form section', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty();
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const inquiry = testElement.querySelector('#rs-template-inquiry');
      expect(inquiry).toBeTruthy();
    });

    it('should render related section', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty();
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const related = testElement.querySelector('#rs-template-related');
      expect(related).toBeTruthy();
    });
  });

  describe('key specs', () => {
    it('should render bed specs when available', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ beds: 3 });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const specs = testElement.querySelectorAll('.rs-template__spec');
      expect(specs.length).toBeGreaterThan(0);
    });

    it('should not render specs for zero values', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty({ beds: 0, baths: 0, built_area: 0, plot_size: 0 });
      mockAPI.getCachedProperty.mockReturnValue(cached);
      new RSPropertyDetailTemplate(testElement);
      const specs = testElement.querySelectorAll('.rs-template__spec');
      expect(specs.length).toBe(0);
    });
  });

  describe('state subscription', () => {
    it('should update when currentProperty state changes', () => {
      testElement.dataset.propertyId = '123';
      mockAPI.getCachedProperty.mockReturnValue(null);
      new RSPropertyDetailTemplate(testElement);
      // Simulate property loaded
      const property = createMockProperty({ id: 123, title: 'Updated Villa' });
      RealtySoftState.set('currentProperty', property);
      const title = testElement.querySelector('.rs-template__title');
      expect(title).toBeTruthy();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      testElement.dataset.propertyId = '123';
      const cached = createMockProperty();
      mockAPI.getCachedProperty.mockReturnValue(cached);
      const component = new RSPropertyDetailTemplate(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
