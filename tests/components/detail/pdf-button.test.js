/**
 * Tests for RSDetailPdfButton
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailPdfButton } from '../../../src/components/detail/pdf-button';
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
  trackResourceClick: vi.fn(),
};

describe('RSDetailPdfButton', () => {
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
    it('should add rs-detail-pdf class', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      new RSDetailPdfButton(testElement, { property });
      expect(testElement.classList.contains('rs-detail-pdf')).toBe(true);
    });

    it('should render a link element', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      new RSDetailPdfButton(testElement, { property });
      const link = testElement.querySelector('.rs-detail-pdf__btn');
      expect(link).toBeTruthy();
      expect(link.tagName).toBe('A');
    });

    it('should set correct href on link', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      new RSDetailPdfButton(testElement, { property });
      const link = testElement.querySelector('.rs-detail-pdf__btn');
      expect(link.getAttribute('href')).toBe('https://example.com/doc.pdf');
    });

    it('should open link in new tab', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      new RSDetailPdfButton(testElement, { property });
      const link = testElement.querySelector('.rs-detail-pdf__btn');
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should render PDF text label', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      new RSDetailPdfButton(testElement, { property });
      const text = testElement.querySelector('.rs-detail-pdf__text');
      expect(text).toBeTruthy();
      expect(text.textContent).toBeTruthy();
    });

    it('should render SVG icon', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      new RSDetailPdfButton(testElement, { property });
      const icon = testElement.querySelector('.rs-detail-pdf__icon');
      expect(icon).toBeTruthy();
    });
  });

  describe('PDF URL resolution from _original', () => {
    it('should use pdf_url from property directly', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/direct.pdf' });
      new RSDetailPdfButton(testElement, { property });
      const link = testElement.querySelector('.rs-detail-pdf__btn');
      expect(link.getAttribute('href')).toBe('https://example.com/direct.pdf');
    });

    it('should fallback to _original.brochure_url', () => {
      const property = createMockProperty({ pdf_url: '', _original: { brochure_url: 'https://example.com/brochure.pdf' } });
      new RSDetailPdfButton(testElement, { property });
      const link = testElement.querySelector('.rs-detail-pdf__btn');
      expect(link.getAttribute('href')).toBe('https://example.com/brochure.pdf');
    });
  });

  describe('events', () => {
    it('should track analytics on click', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      new RSDetailPdfButton(testElement, { property });
      const link = testElement.querySelector('.rs-detail-pdf__btn');
      link.click();
      expect(globalThis.RealtySoftAnalytics.trackResourceClick).toHaveBeenCalledWith('pdf', property.id);
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailPdfButton(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when no PDF URL available', () => {
      const property = createMockProperty({ pdf_url: '' });
      new RSDetailPdfButton(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/doc.pdf' });
      const component = new RSDetailPdfButton(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
