/**
 * Tests for RSWishlistCompareBtn
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistCompareBtn } from '../../../src/components/utility/wishlist-compare-btn';
import { WishlistManager } from '../../../src/core/wishlist-manager';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  setLanguage: vi.fn(),
  showDetail: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSWishlistCompareBtn', () => {
  let testElement;
  let isSharedViewSpy;
  let getCompareCountSpy;
  let openModalSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    isSharedViewSpy = vi.spyOn(WishlistManager, 'isSharedView').mockReturnValue(false);
    getCompareCountSpy = vi.spyOn(WishlistManager, 'getCompareCount').mockReturnValue(0);
    openModalSpy = vi.spyOn(WishlistManager, 'openModal').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    isSharedViewSpy.mockRestore();
    getCompareCountSpy.mockRestore();
    openModalSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistCompareBtn(testElement);
    expect(testElement.classList.contains('rs-wishlist-compare-float')).toBe(true);
  });

  it('should render compare label', () => {
    new RSWishlistCompareBtn(testElement);
    const label = testElement.querySelector('.rs-wishlist-compare-float__label');
    expect(label).toBeTruthy();
  });

  it('should render count badge', () => {
    new RSWishlistCompareBtn(testElement);
    const count = testElement.querySelector('.rs-wishlist-compare-count');
    expect(count).toBeTruthy();
    expect(count.textContent).toBe('0');
  });

  it('should render SVG icon', () => {
    new RSWishlistCompareBtn(testElement);
    const svg = testElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should be hidden in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistCompareBtn(testElement);
    expect(testElement.style.display).toBe('none');
  });

  it('should be hidden when compare count is zero', () => {
    vi.useFakeTimers();
    getCompareCountSpy.mockReturnValue(0);
    new RSWishlistCompareBtn(testElement);
    vi.advanceTimersByTime(400);
    expect(testElement.style.display).toBe('none');
    vi.useRealTimers();
  });

  it('should show when compare count is greater than zero', () => {
    getCompareCountSpy.mockReturnValue(2);
    new RSWishlistCompareBtn(testElement);
    expect(testElement.style.display).toBe('flex');
  });

  it('should show toast warning when clicking with less than 2 properties', () => {
    getCompareCountSpy.mockReturnValue(1);
    new RSWishlistCompareBtn(testElement);
    testElement.click();
    expect(globalThis.RealtySoftToast.warning).toHaveBeenCalled();
  });

  it('should open compare modal when clicking with 2 or more properties', () => {
    getCompareCountSpy.mockReturnValue(2);
    new RSWishlistCompareBtn(testElement);
    testElement.click();
    expect(openModalSpy).toHaveBeenCalledWith('compare');
  });

  it('should not open modal when clicking with less than 2 properties', () => {
    getCompareCountSpy.mockReturnValue(1);
    new RSWishlistCompareBtn(testElement);
    testElement.click();
    expect(openModalSpy).not.toHaveBeenCalled();
  });

  it('should update count when compare changes', () => {
    getCompareCountSpy.mockReturnValue(0);
    new RSWishlistCompareBtn(testElement);
    const countEl = testElement.querySelector('.rs-wishlist-compare-count');
    expect(countEl.textContent).toBe('0');

    getCompareCountSpy.mockReturnValue(3);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.COMPARE_CHANGED));
    expect(countEl.textContent).toBe('3');
  });

  it('should return count via getCount method', () => {
    getCompareCountSpy.mockReturnValue(2);
    const component = new RSWishlistCompareBtn(testElement);
    expect(component.getCount()).toBe(2);
  });

  it('should not bind events in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    getCompareCountSpy.mockReturnValue(2);
    new RSWishlistCompareBtn(testElement);
    testElement.click();
    expect(openModalSpy).not.toHaveBeenCalled();
  });
});
