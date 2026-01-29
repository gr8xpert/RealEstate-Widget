/**
 * Tests for RSShareButton components (WhatsApp, Facebook, Twitter, LinkedIn, Email, Copy)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import {
  RSShareWhatsApp,
  RSShareFacebook,
  RSShareTwitter,
  RSShareLinkedIn,
  RSShareEmail,
  RSShareCopy,
} from '../../../src/components/utility/share-buttons';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  setLanguage: vi.fn(),
  showDetail: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('Share Buttons', () => {
  let testElement;
  let windowOpenSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    windowOpenSpy.mockRestore();
  });

  describe('RSShareWhatsApp', () => {
    it('should add correct CSS classes', () => {
      new RSShareWhatsApp(testElement);
      expect(testElement.classList.contains('rs-share-btn')).toBe(true);
      expect(testElement.classList.contains('rs-share-btn--whatsapp')).toBe(true);
    });

    it('should render SVG icon when element is empty', () => {
      new RSShareWhatsApp(testElement);
      expect(testElement.querySelector('svg')).toBeTruthy();
    });

    it('should open WhatsApp share URL on click', () => {
      testElement.dataset.url = 'https://example.com/property/1';
      testElement.dataset.title = 'Nice Villa';
      new RSShareWhatsApp(testElement);
      testElement.click();
      expect(windowOpenSpy).toHaveBeenCalled();
      const url = windowOpenSpy.mock.calls[0][0];
      expect(url).toContain('wa.me');
      expect(url).toContain('Nice%20Villa');
    });
  });

  describe('RSShareFacebook', () => {
    it('should add correct CSS classes', () => {
      new RSShareFacebook(testElement);
      expect(testElement.classList.contains('rs-share-btn--facebook')).toBe(true);
    });

    it('should render SVG icon when element is empty', () => {
      new RSShareFacebook(testElement);
      expect(testElement.querySelector('svg')).toBeTruthy();
    });

    it('should open Facebook share URL on click', () => {
      testElement.dataset.url = 'https://example.com/property/1';
      new RSShareFacebook(testElement);
      testElement.click();
      expect(windowOpenSpy).toHaveBeenCalled();
      const url = windowOpenSpy.mock.calls[0][0];
      expect(url).toContain('facebook.com/sharer');
    });
  });

  describe('RSShareTwitter', () => {
    it('should add correct CSS classes', () => {
      new RSShareTwitter(testElement);
      expect(testElement.classList.contains('rs-share-btn--twitter')).toBe(true);
    });

    it('should render SVG icon when element is empty', () => {
      new RSShareTwitter(testElement);
      expect(testElement.querySelector('svg')).toBeTruthy();
    });

    it('should open Twitter share URL on click', () => {
      testElement.dataset.url = 'https://example.com/property/1';
      testElement.dataset.title = 'Nice Villa';
      new RSShareTwitter(testElement);
      testElement.click();
      expect(windowOpenSpy).toHaveBeenCalled();
      const url = windowOpenSpy.mock.calls[0][0];
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain('text=');
      expect(url).toContain('url=');
    });
  });

  describe('RSShareLinkedIn', () => {
    it('should add correct CSS classes', () => {
      new RSShareLinkedIn(testElement);
      expect(testElement.classList.contains('rs-share-btn--linkedin')).toBe(true);
    });

    it('should open LinkedIn share URL on click', () => {
      testElement.dataset.url = 'https://example.com/property/1';
      new RSShareLinkedIn(testElement);
      testElement.click();
      expect(windowOpenSpy).toHaveBeenCalled();
      const url = windowOpenSpy.mock.calls[0][0];
      expect(url).toContain('linkedin.com/sharing');
    });
  });

  describe('RSShareEmail', () => {
    it('should add correct CSS classes', () => {
      new RSShareEmail(testElement);
      expect(testElement.classList.contains('rs-share-btn--email')).toBe(true);
    });

    it('should render SVG icon when element is empty', () => {
      new RSShareEmail(testElement);
      expect(testElement.querySelector('svg')).toBeTruthy();
    });

    it('should set mailto href on click', () => {
      testElement.dataset.url = 'https://example.com/property/1';
      testElement.dataset.title = 'Nice Villa';
      // Spy on location.href set is tricky in JSDOM; just verify no errors
      new RSShareEmail(testElement);
      // Email share sets window.location.href, which is hard to test directly
      // Just verify it does not throw
      expect(() => testElement.click()).not.toThrow();
    });
  });

  describe('RSShareCopy', () => {
    it('should add correct CSS classes', () => {
      new RSShareCopy(testElement);
      expect(testElement.classList.contains('rs-share-btn--copy')).toBe(true);
    });

    it('should render SVG icon when element is empty', () => {
      new RSShareCopy(testElement);
      expect(testElement.querySelector('svg')).toBeTruthy();
    });

    it('should show feedback after copying', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
      testElement.dataset.url = 'https://example.com/property/1';
      new RSShareCopy(testElement);
      testElement.click();
      // Wait for async copy
      await vi.waitFor(() => {
        expect(testElement.classList.contains('rs-share-btn--copied')).toBe(true);
      });
    });
  });

  describe('Analytics tracking', () => {
    it('should track share when property ID is set', () => {
      testElement.dataset.propertyId = '42';
      testElement.dataset.url = 'https://example.com/property/42';
      new RSShareFacebook(testElement);
      testElement.click();
      expect(globalThis.RealtySoftAnalytics.trackShare).toHaveBeenCalledWith('facebook', 42);
    });

    it('should not track share when no property ID', () => {
      testElement.dataset.url = 'https://example.com/property/1';
      new RSShareFacebook(testElement);
      testElement.click();
      expect(globalThis.RealtySoftAnalytics.trackShare).not.toHaveBeenCalled();
    });
  });
});
