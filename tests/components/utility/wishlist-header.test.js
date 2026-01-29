/**
 * Tests for RSWishlistHeader
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistHeader } from '../../../src/components/utility/wishlist-header';
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

describe('RSWishlistHeader', () => {
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
    new RSWishlistHeader(testElement);
    expect(testElement.classList.contains('rs-wishlist-header')).toBe(true);
  });

  it('should render title', () => {
    new RSWishlistHeader(testElement);
    const title = testElement.querySelector('.rs-wishlist-header__title');
    expect(title).toBeTruthy();
    expect(title.tagName).toBe('H1');
  });

  it('should render subtitle', () => {
    new RSWishlistHeader(testElement);
    const subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle).toBeTruthy();
  });

  it('should show "My Wishlist" title when not shared view', () => {
    isSharedViewSpy.mockReturnValue(false);
    new RSWishlistHeader(testElement);
    const title = testElement.querySelector('.rs-wishlist-header__title');
    expect(title.textContent).toContain('Wishlist');
  });

  it('should show "Shared Wishlist" title in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistHeader(testElement);
    const title = testElement.querySelector('.rs-wishlist-header__title');
    expect(title.textContent).toContain('Shared');
  });

  it('should show "No properties saved" when count is zero', () => {
    countSpy.mockReturnValue(0);
    new RSWishlistHeader(testElement);
    const subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle.textContent).toContain('No properties');
  });

  it('should show singular "property" when count is 1', () => {
    countSpy.mockReturnValue(1);
    new RSWishlistHeader(testElement);
    const subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle.textContent).toContain('1');
    expect(subtitle.textContent).toContain('property');
  });

  it('should show plural "properties" when count is more than 1', () => {
    countSpy.mockReturnValue(5);
    new RSWishlistHeader(testElement);
    const subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle.textContent).toContain('5');
    expect(subtitle.textContent).toContain('properties');
  });

  it('should update count when wishlist changes', () => {
    countSpy.mockReturnValue(0);
    new RSWishlistHeader(testElement);
    let subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle.textContent).toContain('No properties');

    countSpy.mockReturnValue(3);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.CHANGED));
    subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle.textContent).toContain('3');
  });

  it('should use shared wishlist count in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    loadSharedSpy.mockReturnValue(['REF001', 'REF002']);
    new RSWishlistHeader(testElement);
    const subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle.textContent).toContain('2');
  });

  it('should show zero count in shared view with no shared refs', () => {
    isSharedViewSpy.mockReturnValue(true);
    loadSharedSpy.mockReturnValue(null);
    new RSWishlistHeader(testElement);
    const subtitle = testElement.querySelector('.rs-wishlist-header__subtitle');
    expect(subtitle.textContent).toContain('No properties');
  });
});
