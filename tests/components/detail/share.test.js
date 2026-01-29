/**
 * Tests for RSDetailShare
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailShare } from '../../../src/components/detail/share';
import { createMockProperty } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goBack: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;
globalThis.RealtySoftAnalytics = {
  track: vi.fn(),
  trackSearch: vi.fn(),
  trackDetail: vi.fn(),
  trackWishlist: vi.fn(),
  trackInquiry: vi.fn(),
  trackShare: vi.fn(),
  trackLanguageChange: vi.fn(),
};
globalThis.RealtySoftToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

describe('RSDetailShare', () => {
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

  describe('render', () => {
    it('should add rs-detail-share class', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      expect(testElement.classList.contains('rs-detail-share')).toBe(true);
    });

    it('should render share label', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const label = testElement.querySelector('.rs-detail-share__label');
      expect(label).toBeTruthy();
    });

    it('should render WhatsApp share button', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-share__btn--whatsapp');
      expect(btn).toBeTruthy();
    });

    it('should render Facebook share button', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-share__btn--facebook');
      expect(btn).toBeTruthy();
    });

    it('should render Twitter share button', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-share__btn--twitter');
      expect(btn).toBeTruthy();
    });

    it('should render LinkedIn share button', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-share__btn--linkedin');
      expect(btn).toBeTruthy();
    });

    it('should render email share button', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-share__btn--email');
      expect(btn).toBeTruthy();
    });

    it('should render copy link button', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-share__btn--copy');
      expect(btn).toBeTruthy();
    });

    it('should render 6 share buttons total', () => {
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      const buttons = testElement.querySelectorAll('.rs-detail-share__btn');
      expect(buttons.length).toBe(6);
    });
  });

  describe('share events', () => {
    it('should open WhatsApp share link on click', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      testElement.querySelector('.rs-detail-share__btn--whatsapp').click();
      expect(openSpy).toHaveBeenCalled();
      const url = openSpy.mock.calls[0][0];
      expect(url).toContain('wa.me');
      openSpy.mockRestore();
    });

    it('should open Facebook share link on click', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      testElement.querySelector('.rs-detail-share__btn--facebook').click();
      expect(openSpy).toHaveBeenCalled();
      const url = openSpy.mock.calls[0][0];
      expect(url).toContain('facebook.com/sharer');
      openSpy.mockRestore();
    });

    it('should track share analytics on button click', () => {
      vi.spyOn(window, 'open').mockImplementation(() => null);
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      testElement.querySelector('.rs-detail-share__btn--twitter').click();
      expect(globalThis.RealtySoftAnalytics.trackShare).toHaveBeenCalledWith('twitter', property.id);
      window.open.mockRestore();
    });

    it('should copy to clipboard on copy button click', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
      Object.defineProperty(navigator, 'clipboard', { value: mockClipboard, writable: true, configurable: true });
      const property = createMockProperty();
      new RSDetailShare(testElement, { property });
      testElement.querySelector('.rs-detail-share__btn--copy').click();
      await vi.waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailShare(testElement, {});
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty();
      const component = new RSDetailShare(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
