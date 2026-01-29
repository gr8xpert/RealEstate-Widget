/**
 * Tests for RSWishlistSharedBanner
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistSharedBanner } from '../../../src/components/utility/wishlist-shared-banner';
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

describe('RSWishlistSharedBanner', () => {
  let testElement;
  let isSharedViewSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    isSharedViewSpy = vi.spyOn(WishlistManager, 'isSharedView').mockReturnValue(false);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    isSharedViewSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistSharedBanner(testElement);
    expect(testElement.classList.contains('rs-wishlist-shared-banner')).toBe(true);
  });

  it('should be hidden when not in shared view', () => {
    isSharedViewSpy.mockReturnValue(false);
    new RSWishlistSharedBanner(testElement);
    expect(testElement.style.display).toBe('none');
  });

  it('should be visible when in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistSharedBanner(testElement);
    expect(testElement.style.display).not.toBe('none');
  });

  it('should render shared banner content when in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistSharedBanner(testElement);
    const content = testElement.querySelector('.rs-wishlist-shared-banner__content');
    expect(content).toBeTruthy();
  });

  it('should render link icon when in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistSharedBanner(testElement);
    const icon = testElement.querySelector('.rs-wishlist-shared-icon');
    expect(icon).toBeTruthy();
    expect(icon.querySelector('svg')).toBeTruthy();
  });

  it('should render shared title text', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistSharedBanner(testElement);
    const strong = testElement.querySelector('.rs-wishlist-shared-banner__content strong');
    expect(strong).toBeTruthy();
    expect(strong.textContent).toBeTruthy();
  });

  it('should render shared description text', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistSharedBanner(testElement);
    const desc = testElement.querySelector('.rs-wishlist-shared-banner__content p');
    expect(desc).toBeTruthy();
    expect(desc.textContent).toBeTruthy();
  });

  it('should not render inner content when not shared view', () => {
    isSharedViewSpy.mockReturnValue(false);
    new RSWishlistSharedBanner(testElement);
    const content = testElement.querySelector('.rs-wishlist-shared-banner__content');
    expect(content).toBeNull();
  });
});
