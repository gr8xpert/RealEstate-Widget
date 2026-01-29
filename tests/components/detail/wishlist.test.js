/**
 * Tests for RSDetailWishlist
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailWishlist } from '../../../src/components/detail/wishlist';
import { createMockProperty, createMockWishlistManager } from '../../helpers/component-test-utils';

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
  trackWishlistAdd: vi.fn(),
  trackWishlistRemove: vi.fn(),
  trackInquiry: vi.fn(),
  trackShare: vi.fn(),
  trackLanguageChange: vi.fn(),
};
globalThis.RealtySoftToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

describe('RSDetailWishlist', () => {
  let testElement;
  let mockWishlistManager;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    mockWishlistManager = createMockWishlistManager();
    globalThis.WishlistManager = mockWishlistManager;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    delete globalThis.WishlistManager;
  });

  describe('render', () => {
    it('should add rs-detail-wishlist class', () => {
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      expect(testElement.classList.contains('rs-detail-wishlist')).toBe(true);
    });

    it('should render wishlist button', () => {
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-wishlist__btn');
      expect(btn).toBeTruthy();
    });

    it('should render heart icon', () => {
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      const icon = testElement.querySelector('.rs-detail-wishlist__icon');
      expect(icon).toBeTruthy();
    });

    it('should render text label', () => {
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      const text = testElement.querySelector('.rs-detail-wishlist__text');
      expect(text).toBeTruthy();
    });

    it('should show add text when not in wishlist', () => {
      mockWishlistManager.has.mockReturnValue(false);
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-wishlist__btn');
      expect(btn.classList.contains('rs-detail-wishlist__btn--active')).toBe(false);
    });

    it('should show active state when in wishlist', () => {
      mockWishlistManager.has.mockReturnValue(true);
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-wishlist__btn');
      expect(btn.classList.contains('rs-detail-wishlist__btn--active')).toBe(true);
    });

    it('should fill heart icon when in wishlist', () => {
      mockWishlistManager.has.mockReturnValue(true);
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      const icon = testElement.querySelector('.rs-detail-wishlist__icon');
      expect(icon.getAttribute('fill')).toBe('currentColor');
    });
  });

  describe('toggle wishlist', () => {
    it('should add to wishlist on click when not in wishlist', () => {
      mockWishlistManager.has.mockReturnValue(false);
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      testElement.querySelector('.rs-detail-wishlist__btn').click();
      expect(mockWishlistManager.add).toHaveBeenCalled();
    });

    it('should remove from wishlist on click when in wishlist', () => {
      mockWishlistManager.has.mockReturnValue(true);
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      testElement.querySelector('.rs-detail-wishlist__btn').click();
      expect(mockWishlistManager.remove).toHaveBeenCalled();
    });

    it('should track wishlist add analytics', () => {
      mockWishlistManager.has.mockReturnValue(false);
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      testElement.querySelector('.rs-detail-wishlist__btn').click();
      expect(globalThis.RealtySoftAnalytics.trackWishlistAdd).toHaveBeenCalledWith(property.id);
    });

    it('should show toast notification on add', () => {
      mockWishlistManager.has.mockReturnValue(false);
      const property = createMockProperty();
      new RSDetailWishlist(testElement, { property });
      testElement.querySelector('.rs-detail-wishlist__btn').click();
      expect(globalThis.RealtySoftToast.success).toHaveBeenCalled();
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailWishlist(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when property has no id', () => {
      const property = createMockProperty({ id: null });
      new RSDetailWishlist(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty();
      const component = new RSDetailWishlist(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
