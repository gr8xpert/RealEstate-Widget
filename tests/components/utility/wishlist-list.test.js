/**
 * Tests for RSWishlistList (Combined Component)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistList } from '../../../src/components/utility/wishlist-list';
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

describe('RSWishlistList', () => {
  let testElement;
  let isSharedViewSpy;
  let loadSharedSpy;
  let countSpy;
  let getAsArraySpy;
  let getSortSpy;
  let getCompareCountSpy;
  let isInCompareSpy;
  let generateShareLinkSpy;
  let openModalSpy;
  let getSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    isSharedViewSpy = vi.spyOn(WishlistManager, 'isSharedView').mockReturnValue(false);
    loadSharedSpy = vi.spyOn(WishlistManager, 'loadSharedWishlist').mockReturnValue(null);
    countSpy = vi.spyOn(WishlistManager, 'count').mockReturnValue(0);
    getAsArraySpy = vi.spyOn(WishlistManager, 'getAsArray').mockReturnValue([]);
    getSortSpy = vi.spyOn(WishlistManager, 'getSort').mockReturnValue({ field: 'addedAt', order: 'desc' });
    getCompareCountSpy = vi.spyOn(WishlistManager, 'getCompareCount').mockReturnValue(0);
    isInCompareSpy = vi.spyOn(WishlistManager, 'isInCompare').mockReturnValue(false);
    generateShareLinkSpy = vi.spyOn(WishlistManager, 'generateShareLink').mockReturnValue('https://example.com/wishlist');
    openModalSpy = vi.spyOn(WishlistManager, 'openModal').mockImplementation(() => {});
    getSpy = vi.spyOn(WishlistManager, 'get').mockReturnValue(null);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    isSharedViewSpy.mockRestore();
    loadSharedSpy.mockRestore();
    countSpy.mockRestore();
    getAsArraySpy.mockRestore();
    getSortSpy.mockRestore();
    getCompareCountSpy.mockRestore();
    isInCompareSpy.mockRestore();
    generateShareLinkSpy.mockRestore();
    openModalSpy.mockRestore();
    getSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistList(testElement);
    expect(testElement.classList.contains('rs-wishlist-list')).toBe(true);
  });

  it('should render shared banner container', () => {
    new RSWishlistList(testElement);
    const banner = testElement.querySelector('.rs_wishlist_shared_banner');
    expect(banner).toBeTruthy();
  });

  it('should render header container', () => {
    new RSWishlistList(testElement);
    const header = testElement.querySelector('.rs_wishlist_header');
    expect(header).toBeTruthy();
  });

  it('should render actions container', () => {
    new RSWishlistList(testElement);
    const actions = testElement.querySelector('.rs_wishlist_actions');
    expect(actions).toBeTruthy();
  });

  it('should render sort container', () => {
    new RSWishlistList(testElement);
    const sort = testElement.querySelector('.rs_wishlist_sort');
    expect(sort).toBeTruthy();
  });

  it('should render empty state container', () => {
    new RSWishlistList(testElement);
    const empty = testElement.querySelector('.rs_wishlist_empty');
    expect(empty).toBeTruthy();
  });

  it('should render grid container', () => {
    new RSWishlistList(testElement);
    const grid = testElement.querySelector('.rs_wishlist_grid');
    expect(grid).toBeTruthy();
  });

  it('should render compare button container', () => {
    new RSWishlistList(testElement);
    const compareBtn = testElement.querySelector('.rs_wishlist_compare_btn');
    expect(compareBtn).toBeTruthy();
  });

  it('should render modals container', () => {
    new RSWishlistList(testElement);
    const modals = testElement.querySelector('.rs_wishlist_modals');
    expect(modals).toBeTruthy();
  });

  it('should render loader', () => {
    new RSWishlistList(testElement);
    const loader = testElement.querySelector('.rs-wishlist-list__loader');
    expect(loader).toBeTruthy();
  });

  it('should hide loader after initialization', () => {
    vi.useFakeTimers();
    new RSWishlistList(testElement);
    vi.advanceTimersByTime(200);
    const loader = testElement.querySelector('.rs-wishlist-list__loader');
    expect(loader.style.display).toBe('none');
    vi.useRealTimers();
  });

  it('should initialize sub-components', () => {
    new RSWishlistList(testElement);
    // Sub-components add their own CSS classes
    const headerEl = testElement.querySelector('.rs_wishlist_header');
    expect(headerEl.classList.contains('rs-wishlist-header')).toBe(true);
  });

  it('should delegate openShareModal to WishlistManager', () => {
    const component = new RSWishlistList(testElement);
    component.openShareModal();
    expect(openModalSpy).toHaveBeenCalledWith('share');
  });

  it('should delegate openEmailModal to WishlistManager', () => {
    const component = new RSWishlistList(testElement);
    component.openEmailModal();
    expect(openModalSpy).toHaveBeenCalledWith('email');
  });

  it('should delegate openNoteModal to WishlistManager', () => {
    const component = new RSWishlistList(testElement);
    component.openNoteModal('REF001');
    expect(openModalSpy).toHaveBeenCalledWith('note', { refNo: 'REF001' });
  });

  it('should delegate openCompareModal to WishlistManager', () => {
    const component = new RSWishlistList(testElement);
    component.openCompareModal();
    expect(openModalSpy).toHaveBeenCalledWith('compare');
  });

  it('should delegate downloadPDF to WishlistManager', () => {
    const component = new RSWishlistList(testElement);
    component.downloadPDF();
    expect(openModalSpy).toHaveBeenCalledWith('pdf');
  });

  it('should clean up sub-components on destroy', () => {
    const component = new RSWishlistList(testElement);
    component.destroy();
    expect(testElement.innerHTML).toBe('');
  });

  it('should return properties from grid sub-component', () => {
    const component = new RSWishlistList(testElement);
    const properties = component.getProperties();
    expect(Array.isArray(properties)).toBe(true);
  });
});
