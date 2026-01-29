/**
 * Tests for RSWishlistEmpty
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistEmpty } from '../../../src/components/utility/wishlist-empty';
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

describe('RSWishlistEmpty', () => {
  let testElement;
  let isSharedViewSpy;
  let countSpy;
  let loadSharedSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    isSharedViewSpy = vi.spyOn(WishlistManager, 'isSharedView').mockReturnValue(false);
    countSpy = vi.spyOn(WishlistManager, 'count').mockReturnValue(0);
    loadSharedSpy = vi.spyOn(WishlistManager, 'loadSharedWishlist').mockReturnValue(null);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    isSharedViewSpy.mockRestore();
    countSpy.mockRestore();
    loadSharedSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistEmpty(testElement);
    expect(testElement.classList.contains('rs-wishlist-empty')).toBe(true);
  });

  it('should render empty title', () => {
    new RSWishlistEmpty(testElement);
    const title = testElement.querySelector('.rs-wishlist-empty__title');
    expect(title).toBeTruthy();
  });

  it('should render empty description', () => {
    new RSWishlistEmpty(testElement);
    const desc = testElement.querySelector('.rs-wishlist-empty__desc');
    expect(desc).toBeTruthy();
  });

  it('should render heart SVG icon', () => {
    new RSWishlistEmpty(testElement);
    const svg = testElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should be visible when wishlist is empty', () => {
    countSpy.mockReturnValue(0);
    new RSWishlistEmpty(testElement);
    expect(testElement.style.display).toBe('flex');
  });

  it('should be hidden when wishlist has items', () => {
    countSpy.mockReturnValue(3);
    new RSWishlistEmpty(testElement);
    expect(testElement.style.display).toBe('none');
  });

  it('should render browse button when not shared view', () => {
    isSharedViewSpy.mockReturnValue(false);
    new RSWishlistEmpty(testElement);
    const browseBtn = testElement.querySelector('.rs-wishlist-empty__browse');
    expect(browseBtn).toBeTruthy();
    expect(browseBtn.tagName).toBe('A');
  });

  it('should not render browse button in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistEmpty(testElement);
    const browseBtn = testElement.querySelector('.rs-wishlist-empty__browse');
    expect(browseBtn).toBeNull();
  });

  it('should show different title text in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    loadSharedSpy.mockReturnValue([]);
    new RSWishlistEmpty(testElement);
    const title = testElement.querySelector('.rs-wishlist-empty__title');
    expect(title.textContent).toContain('shared');
  });

  it('should update visibility when wishlist changes', () => {
    countSpy.mockReturnValue(0);
    new RSWishlistEmpty(testElement);
    expect(testElement.style.display).toBe('flex');

    countSpy.mockReturnValue(2);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.CHANGED));
    expect(testElement.style.display).toBe('none');
  });

  it('should become visible again when wishlist is cleared', () => {
    countSpy.mockReturnValue(3);
    new RSWishlistEmpty(testElement);
    expect(testElement.style.display).toBe('none');

    countSpy.mockReturnValue(0);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.CHANGED));
    expect(testElement.style.display).toBe('flex');
  });

  it('should allow setting custom message via setMessage', () => {
    const component = new RSWishlistEmpty(testElement);
    component.setMessage('Custom empty message');
    const title = testElement.querySelector('.rs-wishlist-empty__title');
    expect(title.textContent).toBe('Custom empty message');
  });
});
