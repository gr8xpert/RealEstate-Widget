/**
 * Tests for RSWishlistCounter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistCounter } from '../../../src/components/utility/wishlist-counter';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  setLanguage: vi.fn(),
  showDetail: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSWishlistCounter', () => {
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

  it('should add correct CSS class', () => {
    new RSWishlistCounter(testElement);
    expect(testElement.classList.contains('rs-wishlist-counter')).toBe(true);
  });

  it('should render a link element', () => {
    new RSWishlistCounter(testElement);
    const link = testElement.querySelector('.rs-wishlist-counter__link');
    expect(link).toBeTruthy();
    expect(link.tagName).toBe('A');
  });

  it('should render heart icon', () => {
    new RSWishlistCounter(testElement);
    const icon = testElement.querySelector('.rs-wishlist-counter__icon');
    expect(icon).toBeTruthy();
  });

  it('should use default href when data-href not set', () => {
    new RSWishlistCounter(testElement);
    const link = testElement.querySelector('.rs-wishlist-counter__link');
    expect(link.getAttribute('href')).toBe('/wishlist');
  });

  it('should use custom href from data attribute', () => {
    testElement.dataset.href = '/my-saved-properties';
    new RSWishlistCounter(testElement);
    const link = testElement.querySelector('.rs-wishlist-counter__link');
    expect(link.getAttribute('href')).toBe('/my-saved-properties');
  });

  it('should not show badge when count is zero', () => {
    new RSWishlistCounter(testElement);
    const badge = testElement.querySelector('.rs-wishlist-counter__badge');
    expect(badge).toBeNull();
  });

  it('should show badge when wishlist has items', () => {
    RealtySoftState.set('wishlist', [1, 2, 3]);
    new RSWishlistCounter(testElement);
    const badge = testElement.querySelector('.rs-wishlist-counter__badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe('3');
  });

  it('should update badge when wishlist state changes', () => {
    new RSWishlistCounter(testElement);
    // Simulate wishlist change via state subscription
    RealtySoftState.set('wishlist', [1, 2, 3, 4, 5]);
    const badge = testElement.querySelector('.rs-wishlist-counter__badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe('5');
  });

  it('should remove badge when wishlist becomes empty', () => {
    RealtySoftState.set('wishlist', [1, 2]);
    new RSWishlistCounter(testElement);
    let badge = testElement.querySelector('.rs-wishlist-counter__badge');
    expect(badge).toBeTruthy();

    RealtySoftState.set('wishlist', []);
    badge = testElement.querySelector('.rs-wishlist-counter__badge');
    expect(badge).toBeNull();
  });

  it('should subscribe to wishlist state changes', () => {
    const subscribeSpy = vi.spyOn(RealtySoftState, 'subscribe');
    new RSWishlistCounter(testElement);
    expect(subscribeSpy).toHaveBeenCalledWith('wishlist', expect.any(Function));
    subscribeSpy.mockRestore();
  });
});
