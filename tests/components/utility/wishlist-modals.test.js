/**
 * Tests for RSWishlistModals
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistModals } from '../../../src/components/utility/wishlist-modals';
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

describe('RSWishlistModals', () => {
  let testElement;
  let generateShareLinkSpy;
  let getAsArraySpy;
  let getCompareCountSpy;
  let getComparePropertiesSpy;
  let getSpy;
  let updateNoteSpy;
  let clearCompareSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    generateShareLinkSpy = vi.spyOn(WishlistManager, 'generateShareLink').mockReturnValue('https://example.com/wishlist?refs=REF001,REF002');
    getAsArraySpy = vi.spyOn(WishlistManager, 'getAsArray').mockReturnValue([]);
    getCompareCountSpy = vi.spyOn(WishlistManager, 'getCompareCount').mockReturnValue(0);
    getComparePropertiesSpy = vi.spyOn(WishlistManager, 'getCompareProperties').mockReturnValue([]);
    getSpy = vi.spyOn(WishlistManager, 'get').mockReturnValue(null);
    updateNoteSpy = vi.spyOn(WishlistManager, 'updateNote').mockReturnValue(true);
    clearCompareSpy = vi.spyOn(WishlistManager, 'clearCompare').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    document.body.style.overflow = '';
    generateShareLinkSpy.mockRestore();
    getAsArraySpy.mockRestore();
    getCompareCountSpy.mockRestore();
    getComparePropertiesSpy.mockRestore();
    getSpy.mockRestore();
    updateNoteSpy.mockRestore();
    clearCompareSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistModals(testElement);
    expect(testElement.classList.contains('rs-wishlist-modals')).toBe(true);
  });

  it('should render share modal', () => {
    new RSWishlistModals(testElement);
    const shareModal = testElement.querySelector('#rs-share-modal');
    expect(shareModal).toBeTruthy();
    expect(shareModal.classList.contains('rs-modal')).toBe(true);
  });

  it('should render email modal', () => {
    new RSWishlistModals(testElement);
    const emailModal = testElement.querySelector('#rs-email-modal');
    expect(emailModal).toBeTruthy();
  });

  it('should render note modal', () => {
    new RSWishlistModals(testElement);
    const noteModal = testElement.querySelector('#rs-note-modal');
    expect(noteModal).toBeTruthy();
  });

  it('should render compare modal', () => {
    new RSWishlistModals(testElement);
    const compareModal = testElement.querySelector('#rs-compare-modal');
    expect(compareModal).toBeTruthy();
  });

  it('should render share link input', () => {
    new RSWishlistModals(testElement);
    const input = testElement.querySelector('.rs-share-link__input');
    expect(input).toBeTruthy();
    expect(input.hasAttribute('readonly')).toBe(true);
  });

  it('should render copy button in share modal', () => {
    new RSWishlistModals(testElement);
    const copyBtn = testElement.querySelector('.rs-share-link__copy');
    expect(copyBtn).toBeTruthy();
  });

  it('should render social share buttons', () => {
    new RSWishlistModals(testElement);
    const socialBtns = testElement.querySelectorAll('.rs-share-social__btn');
    expect(socialBtns.length).toBe(3); // whatsapp, email, qr
  });

  it('should render email form', () => {
    new RSWishlistModals(testElement);
    const form = testElement.querySelector('.rs-email-form');
    expect(form).toBeTruthy();
    expect(form.querySelector('input[name="emailTo"]')).toBeTruthy();
    expect(form.querySelector('input[name="emailFrom"]')).toBeTruthy();
    expect(form.querySelector('textarea[name="message"]')).toBeTruthy();
  });

  it('should render note form with textarea', () => {
    new RSWishlistModals(testElement);
    const noteForm = testElement.querySelector('.rs-note-form');
    expect(noteForm).toBeTruthy();
    const textarea = testElement.querySelector('.rs-note-text');
    expect(textarea).toBeTruthy();
  });

  it('should render character counter for note', () => {
    new RSWishlistModals(testElement);
    const counter = testElement.querySelector('.rs-note-char-count');
    expect(counter).toBeTruthy();
    expect(counter.textContent).toBe('0');
  });

  it('should render compare table', () => {
    new RSWishlistModals(testElement);
    const table = testElement.querySelector('.rs-compare-table');
    expect(table).toBeTruthy();
  });

  it('should open share modal via custom event', () => {
    new RSWishlistModals(testElement);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.MODAL_OPEN, {
      detail: { modalType: 'share', data: {} },
    }));
    const shareModal = testElement.querySelector('#rs-share-modal');
    expect(shareModal.classList.contains('rs-modal--open')).toBe(true);
  });

  it('should populate share link in modal', () => {
    new RSWishlistModals(testElement);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.MODAL_OPEN, {
      detail: { modalType: 'share', data: {} },
    }));
    const input = testElement.querySelector('.rs-share-link__input');
    expect(input.value).toContain('example.com');
  });

  it('should close modal when backdrop is clicked', () => {
    new RSWishlistModals(testElement);
    // Open share modal first
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.MODAL_OPEN, {
      detail: { modalType: 'share', data: {} },
    }));
    const shareModal = testElement.querySelector('#rs-share-modal');
    expect(shareModal.classList.contains('rs-modal--open')).toBe(true);

    // Click backdrop
    const backdrop = shareModal.querySelector('.rs-modal__backdrop');
    backdrop.click();
    expect(shareModal.classList.contains('rs-modal--open')).toBe(false);
  });

  it('should close modal when close button is clicked', () => {
    new RSWishlistModals(testElement);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.MODAL_OPEN, {
      detail: { modalType: 'share', data: {} },
    }));
    const shareModal = testElement.querySelector('#rs-share-modal');
    const closeBtn = shareModal.querySelector('.rs-modal__close');
    closeBtn.click();
    expect(shareModal.classList.contains('rs-modal--open')).toBe(false);
  });

  it('should update char counter on note textarea input', () => {
    new RSWishlistModals(testElement);
    const textarea = testElement.querySelector('.rs-note-text');
    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    const counter = testElement.querySelector('.rs-note-char-count');
    expect(counter.textContent).toBe('5');
  });

  it('should show toast error if no share link available', () => {
    generateShareLinkSpy.mockReturnValue(null);
    new RSWishlistModals(testElement);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.MODAL_OPEN, {
      detail: { modalType: 'share', data: {} },
    }));
    expect(globalThis.RealtySoftToast.error).toHaveBeenCalled();
  });

  it('should render all modal close buttons', () => {
    new RSWishlistModals(testElement);
    const closeBtns = testElement.querySelectorAll('.rs-modal__close');
    expect(closeBtns.length).toBe(4); // share, email, note, compare
  });

  it('should set body overflow hidden when modal opens', () => {
    new RSWishlistModals(testElement);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.MODAL_OPEN, {
      detail: { modalType: 'share', data: {} },
    }));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body overflow when modal closes', () => {
    new RSWishlistModals(testElement);
    window.dispatchEvent(new CustomEvent(WishlistManager.EVENTS.MODAL_OPEN, {
      detail: { modalType: 'share', data: {} },
    }));
    const shareModal = testElement.querySelector('#rs-share-modal');
    const closeBtn = shareModal.querySelector('.rs-modal__close');
    closeBtn.click();
    expect(document.body.style.overflow).toBe('');
  });
});
