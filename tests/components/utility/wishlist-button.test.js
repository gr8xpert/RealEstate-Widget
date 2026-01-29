/**
 * Tests for RSWishlistButton
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistButton } from '../../../src/components/utility/wishlist-button';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  setLanguage: vi.fn(),
  showDetail: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSWishlistButton', () => {
  let testElement;
  let addToWishlistSpy;
  let removeFromWishlistSpy;
  let isInWishlistSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    testElement.dataset.propertyId = '123';
    document.body.appendChild(testElement);
    // Spy on state methods used by the component
    addToWishlistSpy = vi.spyOn(RealtySoftState, 'addToWishlist').mockImplementation(() => {});
    removeFromWishlistSpy = vi.spyOn(RealtySoftState, 'removeFromWishlist').mockImplementation(() => {});
    isInWishlistSpy = vi.spyOn(RealtySoftState, 'isInWishlist').mockReturnValue(false);
    // Ensure analytics methods used by wishlist-button exist
    globalThis.RealtySoftAnalytics.trackWishlistAdd = vi.fn();
    globalThis.RealtySoftAnalytics.trackWishlistRemove = vi.fn();
    vi.clearAllMocks();
    // Re-assign after clearAllMocks since it wipes the fns
    addToWishlistSpy.mockImplementation(() => {});
    removeFromWishlistSpy.mockImplementation(() => {});
    isInWishlistSpy.mockReturnValue(false);
    globalThis.RealtySoftAnalytics.trackWishlistAdd = vi.fn();
    globalThis.RealtySoftAnalytics.trackWishlistRemove = vi.fn();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    addToWishlistSpy.mockRestore();
    removeFromWishlistSpy.mockRestore();
    isInWishlistSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistButton(testElement);
    expect(testElement.classList.contains('rs-wishlist-button')).toBe(true);
  });

  it('should render a button element', () => {
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('should render heart SVG icon', () => {
    new RSWishlistButton(testElement);
    const icon = testElement.querySelector('.rs-wishlist-button__icon');
    expect(icon).toBeTruthy();
  });

  it('should not be active initially when property is not in wishlist', () => {
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    expect(btn.classList.contains('rs-wishlist-button__btn--active')).toBe(false);
  });

  it('should have unfilled heart icon when not in wishlist', () => {
    new RSWishlistButton(testElement);
    const icon = testElement.querySelector('.rs-wishlist-button__icon');
    expect(icon.getAttribute('fill')).toBe('none');
  });

  it('should call addToWishlist when clicking and not in wishlist', () => {
    isInWishlistSpy.mockReturnValue(false);
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    btn.click();
    expect(addToWishlistSpy).toHaveBeenCalledWith(123);
  });

  it('should call removeFromWishlist when clicking and already in wishlist', () => {
    isInWishlistSpy.mockReturnValue(true);
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    btn.click();
    expect(removeFromWishlistSpy).toHaveBeenCalledWith(123);
  });

  it('should have aria-label for accessibility', () => {
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    expect(btn.getAttribute('aria-label')).toBeTruthy();
  });

  it('should not render when property ID is missing', () => {
    const noIdElement = document.createElement('div');
    document.body.appendChild(noIdElement);
    new RSWishlistButton(noIdElement);
    const btn = noIdElement.querySelector('.rs-wishlist-button__btn');
    expect(btn).toBeNull();
    noIdElement.parentNode.removeChild(noIdElement);
  });

  it('should not render when property ID is zero', () => {
    testElement.dataset.propertyId = '0';
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    expect(btn).toBeNull();
  });

  it('should track analytics on add', () => {
    isInWishlistSpy.mockReturnValue(false);
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    btn.click();
    expect(globalThis.RealtySoftAnalytics.trackWishlistAdd).toHaveBeenCalledWith(123);
  });

  it('should track analytics on remove', () => {
    isInWishlistSpy.mockReturnValue(true);
    new RSWishlistButton(testElement);
    const btn = testElement.querySelector('.rs-wishlist-button__btn');
    btn.click();
    expect(globalThis.RealtySoftAnalytics.trackWishlistRemove).toHaveBeenCalledWith(123);
  });

  it('should subscribe to wishlist state changes', () => {
    const subscribeSpy = vi.spyOn(RealtySoftState, 'subscribe');
    new RSWishlistButton(testElement);
    expect(subscribeSpy).toHaveBeenCalledWith('wishlist', expect.any(Function));
    subscribeSpy.mockRestore();
  });
});
