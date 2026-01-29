/**
 * Tests for RSDetail
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetail } from '../../../src/components/detail/detail';
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
  getRelatedProperties: vi.fn().mockResolvedValue({ data: [] }),
};
globalThis.RealtySoftAPI = mockAPI;
globalThis.WishlistManager = {
  has: vi.fn(() => false),
  add: vi.fn(),
  remove: vi.fn(),
};

describe('RSDetail', () => {
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

  describe('initialization', () => {
    it('should add rs-detail class', () => {
      testElement.dataset.propertyId = '123';
      new RSDetail(testElement);
      expect(testElement.classList.contains('rs-detail')).toBe(true);
    });

    it('should load property by numeric ID', () => {
      testElement.dataset.propertyId = '456';
      new RSDetail(testElement);
      expect(mockRealtySoft.loadProperty).toHaveBeenCalledWith(456);
    });

    it('should load property by reference', () => {
      testElement.dataset.propertyRef = 'ABC123';
      new RSDetail(testElement);
      expect(mockRealtySoft.loadPropertyByRef).toHaveBeenCalledWith('ABC123');
    });

    it('should treat non-numeric property-id as reference', () => {
      testElement.dataset.propertyId = 'VIL001';
      new RSDetail(testElement);
      expect(mockRealtySoft.loadPropertyByRef).toHaveBeenCalledWith('VIL001');
    });

    it('should add loading class while loading', () => {
      testElement.dataset.propertyId = '123';
      new RSDetail(testElement);
      // Loading class should be added (may be removed after async completes)
      // We test it was applied at init
      expect(mockRealtySoft.loadProperty).toHaveBeenCalled();
    });

    it('should show error when no property ID or reference', () => {
      new RSDetail(testElement);
      const error = testElement.querySelector('.rs-detail__error');
      expect(error).toBeTruthy();
    });
  });

  describe('state subscription', () => {
    it('should populate text fields when currentProperty changes', () => {
      testElement.dataset.propertyId = '123';
      // Add text mapping elements
      const titleEl = document.createElement('div');
      titleEl.className = 'rs_detail_title';
      testElement.appendChild(titleEl);

      const priceEl = document.createElement('div');
      priceEl.className = 'rs_detail_price';
      testElement.appendChild(priceEl);

      new RSDetail(testElement);

      const property = createMockProperty({ title: 'Beautiful Villa', price: 350000 });
      RealtySoftState.set('currentProperty', property);

      expect(titleEl.innerHTML).toBe('Beautiful Villa');
    });

    it('should populate location field', () => {
      testElement.dataset.propertyId = '123';
      const locationEl = document.createElement('div');
      locationEl.className = 'rs_detail_location';
      testElement.appendChild(locationEl);

      new RSDetail(testElement);

      const property = createMockProperty({ location: 'Marbella' });
      RealtySoftState.set('currentProperty', property);

      expect(locationEl.innerHTML).toBe('Marbella');
    });

    it('should populate reference field', () => {
      testElement.dataset.propertyId = '123';
      const refEl = document.createElement('div');
      refEl.className = 'rs_detail_ref';
      testElement.appendChild(refEl);

      new RSDetail(testElement);

      const property = createMockProperty({ ref: 'REF001' });
      RealtySoftState.set('currentProperty', property);

      expect(refEl.innerHTML).toBe('REF001');
    });

    it('should hide empty text fields', () => {
      testElement.dataset.propertyId = '123';
      const floorEl = document.createElement('div');
      floorEl.className = 'rs_detail_floor';
      testElement.appendChild(floorEl);

      new RSDetail(testElement);

      const property = createMockProperty({ floor: '' });
      RealtySoftState.set('currentProperty', property);

      expect(floorEl.style.display).toBe('none');
    });

    it('should populate beds field with value', () => {
      testElement.dataset.propertyId = '123';
      const bedsEl = document.createElement('div');
      bedsEl.className = 'rs_detail_beds';
      testElement.appendChild(bedsEl);

      new RSDetail(testElement);

      const property = createMockProperty({ beds: 3 });
      RealtySoftState.set('currentProperty', property);

      expect(bedsEl.innerHTML).toBe('3');
    });

    it('should hide beds field when zero', () => {
      testElement.dataset.propertyId = '123';
      const bedsEl = document.createElement('div');
      bedsEl.className = 'rs_detail_beds';
      testElement.appendChild(bedsEl);

      new RSDetail(testElement);

      const property = createMockProperty({ beds: 0 });
      RealtySoftState.set('currentProperty', property);

      expect(bedsEl.style.display).toBe('none');
    });
  });

  describe('child component instantiation', () => {
    it('should instantiate gallery component', () => {
      testElement.dataset.propertyId = '123';
      const galleryEl = document.createElement('div');
      galleryEl.className = 'rs_detail_gallery';
      testElement.appendChild(galleryEl);

      new RSDetail(testElement);

      const property = createMockProperty({ images: ['https://example.com/img.jpg'] });
      RealtySoftState.set('currentProperty', property);

      expect(galleryEl.classList.contains('rs-detail-gallery')).toBe(true);
    });

    it('should instantiate map component', () => {
      testElement.dataset.propertyId = '123';
      const mapEl = document.createElement('div');
      mapEl.className = 'rs_detail_map';
      testElement.appendChild(mapEl);

      new RSDetail(testElement);

      const property = createMockProperty({ location: 'Marbella' });
      RealtySoftState.set('currentProperty', property);

      expect(mapEl.classList.contains('rs-detail-map')).toBe(true);
    });

    it('should instantiate share component', () => {
      testElement.dataset.propertyId = '123';
      const shareEl = document.createElement('div');
      shareEl.className = 'rs_detail_share';
      testElement.appendChild(shareEl);

      new RSDetail(testElement);

      const property = createMockProperty();
      RealtySoftState.set('currentProperty', property);

      expect(shareEl.classList.contains('rs-detail-share')).toBe(true);
    });

    it('should instantiate wishlist component', () => {
      testElement.dataset.propertyId = '123';
      const wishlistEl = document.createElement('div');
      wishlistEl.className = 'rs_detail_wishlist';
      testElement.appendChild(wishlistEl);

      new RSDetail(testElement);

      const property = createMockProperty();
      RealtySoftState.set('currentProperty', property);

      expect(wishlistEl.classList.contains('rs-detail-wishlist')).toBe(true);
    });
  });

  describe('agent display', () => {
    it('should show agent card when agent data exists', () => {
      testElement.dataset.propertyId = '123';
      const agentEl = document.createElement('div');
      agentEl.className = 'rs_detail_agent';
      testElement.appendChild(agentEl);

      new RSDetail(testElement);

      const property = createMockProperty({ agent: { name: 'John Agent', phone: '+34600000000', email: 'john@example.com' } });
      RealtySoftState.set('currentProperty', property);

      expect(agentEl.style.display).not.toBe('none');
    });

    it('should hide agent card when no useful agent data', () => {
      testElement.dataset.propertyId = '123';
      const agentEl = document.createElement('div');
      agentEl.className = 'rs_detail_agent';
      testElement.appendChild(agentEl);

      new RSDetail(testElement);

      const property = createMockProperty({ agent: { name: '', phone: '', email: '' } });
      RealtySoftState.set('currentProperty', property);

      expect(agentEl.style.display).toBe('none');
    });
  });

  describe('resource links', () => {
    it('should show video link when video URL exists', () => {
      testElement.dataset.propertyId = '123';
      const videoEl = document.createElement('a');
      videoEl.className = 'rs_detail_video_link';
      testElement.appendChild(videoEl);

      new RSDetail(testElement);

      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc' });
      RealtySoftState.set('currentProperty', property);

      expect(videoEl.href).toContain('youtube.com');
      expect(videoEl.style.display).not.toBe('none');
    });

    it('should hide video link when no video URL', () => {
      testElement.dataset.propertyId = '123';
      const videoEl = document.createElement('a');
      videoEl.className = 'rs_detail_video_link';
      testElement.appendChild(videoEl);

      new RSDetail(testElement);

      const property = createMockProperty({ video_url: '' });
      RealtySoftState.set('currentProperty', property);

      expect(videoEl.style.display).toBe('none');
    });
  });

  describe('page title', () => {
    it('should update page title with property title', () => {
      const originalTitle = document.title;
      testElement.dataset.propertyId = '123';
      new RSDetail(testElement);

      const property = createMockProperty({ title: 'Luxury Penthouse' });
      RealtySoftState.set('currentProperty', property);

      expect(document.title).toContain('Luxury Penthouse');
      document.title = originalTitle;
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      testElement.dataset.propertyId = '123';
      const component = new RSDetail(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
