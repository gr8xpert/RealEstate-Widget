/**
 * Tests for RSWishlistSort
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistSort } from '../../../src/components/utility/wishlist-sort';
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

describe('RSWishlistSort', () => {
  let testElement;
  let setSortSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    setSortSpy = vi.spyOn(WishlistManager, 'setSort').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    setSortSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistSort(testElement);
    expect(testElement.classList.contains('rs-wishlist-sort-wrapper')).toBe(true);
  });

  it('should render a label element', () => {
    new RSWishlistSort(testElement);
    const label = testElement.querySelector('.rs-wishlist-sort-label');
    expect(label).toBeTruthy();
  });

  it('should render a select element', () => {
    new RSWishlistSort(testElement);
    const select = testElement.querySelector('.rs-wishlist-sort');
    expect(select).toBeTruthy();
    expect(select.tagName).toBe('SELECT');
  });

  it('should render 6 sort options', () => {
    new RSWishlistSort(testElement);
    const options = testElement.querySelectorAll('.rs-wishlist-sort option');
    expect(options.length).toBe(6);
  });

  it('should have "Recently Added" as default selected option', () => {
    new RSWishlistSort(testElement);
    const select = testElement.querySelector('.rs-wishlist-sort');
    expect(select.value).toBe('addedAt-desc');
  });

  it('should include price sort options', () => {
    new RSWishlistSort(testElement);
    const options = testElement.querySelectorAll('.rs-wishlist-sort option');
    const values = Array.from(options).map(o => o.value);
    expect(values).toContain('price-desc');
    expect(values).toContain('price-asc');
  });

  it('should include name sort option', () => {
    new RSWishlistSort(testElement);
    const options = testElement.querySelectorAll('.rs-wishlist-sort option');
    const values = Array.from(options).map(o => o.value);
    expect(values).toContain('title-asc');
  });

  it('should include location sort option', () => {
    new RSWishlistSort(testElement);
    const options = testElement.querySelectorAll('.rs-wishlist-sort option');
    const values = Array.from(options).map(o => o.value);
    expect(values).toContain('location-asc');
  });

  it('should call WishlistManager.setSort on change', () => {
    new RSWishlistSort(testElement);
    const select = testElement.querySelector('.rs-wishlist-sort');
    select.value = 'price-desc';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(setSortSpy).toHaveBeenCalledWith('list_price', 'desc');
  });

  it('should map "title" field to "name" when sorting', () => {
    new RSWishlistSort(testElement);
    const select = testElement.querySelector('.rs-wishlist-sort');
    select.value = 'title-asc';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(setSortSpy).toHaveBeenCalledWith('name', 'asc');
  });

  it('should pass through unmapped fields directly', () => {
    new RSWishlistSort(testElement);
    const select = testElement.querySelector('.rs-wishlist-sort');
    select.value = 'addedAt-asc';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(setSortSpy).toHaveBeenCalledWith('addedAt', 'asc');
  });

  it('should return current sort value via getValue', () => {
    const component = new RSWishlistSort(testElement);
    expect(component.getValue()).toBe('addedAt-desc');
  });

  it('should allow setting value programmatically via setValue', () => {
    const component = new RSWishlistSort(testElement);
    component.setValue('price-asc');
    const select = testElement.querySelector('.rs-wishlist-sort');
    expect(select.value).toBe('price-asc');
    expect(component.getValue()).toBe('price-asc');
  });
});
