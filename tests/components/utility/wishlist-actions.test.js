/**
 * Tests for RSWishlistActions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistActions } from '../../../src/components/utility/wishlist-actions';
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

describe('RSWishlistActions', () => {
  let testElement;
  let isSharedViewSpy;
  let countSpy;
  let clearSpy;
  let openModalSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    isSharedViewSpy = vi.spyOn(WishlistManager, 'isSharedView').mockReturnValue(false);
    countSpy = vi.spyOn(WishlistManager, 'count').mockReturnValue(3);
    clearSpy = vi.spyOn(WishlistManager, 'clear').mockImplementation(() => true);
    openModalSpy = vi.spyOn(WishlistManager, 'openModal').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    isSharedViewSpy.mockRestore();
    countSpy.mockRestore();
    clearSpy.mockRestore();
    openModalSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistActions(testElement);
    expect(testElement.classList.contains('rs-wishlist-actions')).toBe(true);
  });

  it('should render back button', () => {
    new RSWishlistActions(testElement);
    const backBtn = testElement.querySelector('.rs-wishlist-back');
    expect(backBtn).toBeTruthy();
  });

  it('should render clear button', () => {
    new RSWishlistActions(testElement);
    const clearBtn = testElement.querySelector('.rs-wishlist-clear');
    expect(clearBtn).toBeTruthy();
  });

  it('should render PDF button', () => {
    new RSWishlistActions(testElement);
    const pdfBtn = testElement.querySelector('.rs-wishlist-pdf');
    expect(pdfBtn).toBeTruthy();
  });

  it('should render share button', () => {
    new RSWishlistActions(testElement);
    const shareBtn = testElement.querySelector('.rs-wishlist-share');
    expect(shareBtn).toBeTruthy();
  });

  it('should render email button', () => {
    new RSWishlistActions(testElement);
    const emailBtn = testElement.querySelector('.rs-wishlist-email');
    expect(emailBtn).toBeTruthy();
  });

  it('should be hidden in shared view', () => {
    isSharedViewSpy.mockReturnValue(true);
    new RSWishlistActions(testElement);
    expect(testElement.style.display).toBe('none');
  });

  it('should be visible when wishlist has items', () => {
    countSpy.mockReturnValue(3);
    new RSWishlistActions(testElement);
    expect(testElement.style.display).toBe('flex');
  });

  it('should be hidden when wishlist is empty', () => {
    countSpy.mockReturnValue(0);
    new RSWishlistActions(testElement);
    expect(testElement.style.display).toBe('none');
  });

  it('should open PDF modal when PDF button is clicked', () => {
    new RSWishlistActions(testElement);
    const pdfBtn = testElement.querySelector('.rs-wishlist-pdf');
    pdfBtn.click();
    expect(openModalSpy).toHaveBeenCalledWith('pdf');
  });

  it('should open share modal when share button is clicked', () => {
    new RSWishlistActions(testElement);
    const shareBtn = testElement.querySelector('.rs-wishlist-share');
    shareBtn.click();
    expect(openModalSpy).toHaveBeenCalledWith('share');
  });

  it('should open email modal when email button is clicked', () => {
    new RSWishlistActions(testElement);
    const emailBtn = testElement.querySelector('.rs-wishlist-email');
    emailBtn.click();
    expect(openModalSpy).toHaveBeenCalledWith('email');
  });

  it('should call WishlistManager.clear on confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    new RSWishlistActions(testElement);
    const clearBtn = testElement.querySelector('.rs-wishlist-clear');
    clearBtn.click();
    expect(clearSpy).toHaveBeenCalled();
    window.confirm.mockRestore();
  });

  it('should not clear wishlist when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    new RSWishlistActions(testElement);
    const clearBtn = testElement.querySelector('.rs-wishlist-clear');
    clearBtn.click();
    expect(clearSpy).not.toHaveBeenCalled();
    window.confirm.mockRestore();
  });

  it('should update visibility when wishlist changes', () => {
    countSpy.mockReturnValue(3);
    new RSWishlistActions(testElement);
    expect(testElement.style.display).toBe('flex');

    countSpy.mockReturnValue(0);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.CHANGED));
    expect(testElement.style.display).toBe('none');
  });
});
