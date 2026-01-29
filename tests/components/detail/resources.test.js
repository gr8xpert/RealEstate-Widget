/**
 * Tests for RSDetailResources
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailResources } from '../../../src/components/detail/resources';
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

describe('RSDetailResources', () => {
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
    it('should add rs-detail-resources class', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc123' });
      new RSDetailResources(testElement, { property });
      expect(testElement.classList.contains('rs-detail-resources')).toBe(true);
    });

    it('should render title', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc123' });
      new RSDetailResources(testElement, { property });
      const title = testElement.querySelector('.rs-detail-resources__title');
      expect(title).toBeTruthy();
    });

    it('should render video button when video URL present', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc123' });
      new RSDetailResources(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-resources__btn--video');
      expect(btn).toBeTruthy();
    });

    it('should render virtual tour button when tour URL present', () => {
      const property = createMockProperty({ virtual_tour_url: 'https://tour.example.com/tour1' });
      new RSDetailResources(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-resources__btn--tour');
      expect(btn).toBeTruthy();
    });

    it('should render PDF button when PDF URL present', () => {
      const property = createMockProperty({ pdf_url: 'https://example.com/property.pdf' });
      new RSDetailResources(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-resources__btn--pdf');
      expect(btn).toBeTruthy();
    });

    it('should render all three buttons when all resources exist', () => {
      const property = createMockProperty({
        video_url: 'https://youtube.com/watch?v=abc',
        virtual_tour_url: 'https://tour.example.com/t',
        pdf_url: 'https://example.com/p.pdf',
      });
      new RSDetailResources(testElement, { property });
      const buttons = testElement.querySelectorAll('.rs-detail-resources__btn');
      expect(buttons.length).toBe(3);
    });

    it('should render modal (hidden initially)', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc' });
      new RSDetailResources(testElement, { property });
      const modal = testElement.querySelector('.rs-detail-resources__modal');
      expect(modal).toBeTruthy();
      expect(modal.style.display).toBe('none');
    });
  });

  describe('events', () => {
    it('should open PDF in new window on PDF button click', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const property = createMockProperty({ pdf_url: 'https://example.com/property.pdf' });
      new RSDetailResources(testElement, { property });
      const pdfBtn = testElement.querySelector('.rs-detail-resources__btn--pdf');
      pdfBtn.click();
      expect(openSpy).toHaveBeenCalledWith('https://example.com/property.pdf', '_blank');
      openSpy.mockRestore();
    });

    it('should track resource click on PDF button', () => {
      vi.spyOn(window, 'open').mockImplementation(() => null);
      const property = createMockProperty({ pdf_url: 'https://example.com/property.pdf' });
      new RSDetailResources(testElement, { property });
      testElement.querySelector('.rs-detail-resources__btn--pdf').click();
      expect(globalThis.RealtySoftAnalytics.trackResourceClick).toHaveBeenCalledWith('pdf', property.id);
      window.open.mockRestore();
    });

    it('should open modal on embeddable video button click', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc123' });
      new RSDetailResources(testElement, { property });
      const videoBtn = testElement.querySelector('.rs-detail-resources__btn--video');
      videoBtn.click();
      const modal = testElement.querySelector('.rs-detail-resources__modal');
      expect(modal.style.display).toBe('flex');
    });

    it('should close modal on close button click', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc123' });
      new RSDetailResources(testElement, { property });
      // Open modal
      testElement.querySelector('.rs-detail-resources__btn--video').click();
      // Close
      testElement.querySelector('.rs-detail-resources__modal-close').click();
      const modal = testElement.querySelector('.rs-detail-resources__modal');
      expect(modal.style.display).toBe('none');
    });

    it('should close modal on backdrop click', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc123' });
      new RSDetailResources(testElement, { property });
      testElement.querySelector('.rs-detail-resources__btn--video').click();
      testElement.querySelector('.rs-detail-resources__modal-backdrop').click();
      const modal = testElement.querySelector('.rs-detail-resources__modal');
      expect(modal.style.display).toBe('none');
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailResources(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when no resources exist', () => {
      const property = createMockProperty({ video_url: '', virtual_tour_url: '', pdf_url: '' });
      new RSDetailResources(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ video_url: 'https://youtube.com/watch?v=abc' });
      const component = new RSDetailResources(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
