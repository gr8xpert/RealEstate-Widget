/**
 * Tests for RSDetailGallery
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailGallery } from '../../../src/components/detail/gallery';
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
  trackGalleryView: vi.fn(),
};

const mockImages = [
  'https://example.com/img1.jpg',
  'https://example.com/img2.jpg',
  'https://example.com/img3.jpg',
  'https://example.com/img4.jpg',
];

describe('RSDetailGallery', () => {
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
    document.body.style.overflow = '';
  });

  describe('render', () => {
    it('should add rs-detail-gallery class', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      expect(testElement.classList.contains('rs-detail-gallery')).toBe(true);
    });

    it('should render main image', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const mainImg = testElement.querySelector('.rs-detail-gallery__image');
      expect(mainImg).toBeTruthy();
      expect(mainImg.getAttribute('src')).toBe(mockImages[0]);
    });

    it('should render fullscreen button', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-gallery__fullscreen');
      expect(btn).toBeTruthy();
    });

    it('should render navigation buttons when multiple images', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const prevBtn = testElement.querySelector('.rs-detail-gallery__nav--prev');
      const nextBtn = testElement.querySelector('.rs-detail-gallery__nav--next');
      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
    });

    it('should not render navigation when single image', () => {
      const property = createMockProperty({ images: ['https://example.com/single.jpg'] });
      new RSDetailGallery(testElement, { property });
      const prevBtn = testElement.querySelector('.rs-detail-gallery__nav--prev');
      expect(prevBtn).toBeFalsy();
    });

    it('should render image counter', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const counter = testElement.querySelector('.rs-detail-gallery__counter');
      expect(counter).toBeTruthy();
      expect(counter.textContent).toBe('1 / 4');
    });

    it('should render thumbnails for multiple images', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const thumbs = testElement.querySelectorAll('.rs-detail-gallery__thumb');
      expect(thumbs.length).toBe(4);
    });

    it('should mark first thumbnail as active', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const activeThumb = testElement.querySelector('.rs-detail-gallery__thumb--active');
      expect(activeThumb).toBeTruthy();
      expect(activeThumb.dataset.index).toBe('0');
    });

    it('should render lightbox (hidden initially)', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const lightbox = testElement.querySelector('.rs-detail-gallery__lightbox');
      expect(lightbox).toBeTruthy();
      expect(lightbox.style.display).toBe('none');
    });
  });

  describe('navigation', () => {
    it('should advance to next image on next button click', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__nav--next').click();
      const mainImg = testElement.querySelector('.rs-detail-gallery__image');
      expect(mainImg.getAttribute('src')).toBe(mockImages[1]);
    });

    it('should go to previous image on prev button click', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      // Go forward first
      testElement.querySelector('.rs-detail-gallery__nav--next').click();
      // Then back
      testElement.querySelector('.rs-detail-gallery__nav--prev').click();
      const mainImg = testElement.querySelector('.rs-detail-gallery__image');
      expect(mainImg.getAttribute('src')).toBe(mockImages[0]);
    });

    it('should wrap around to last image on prev from first', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__nav--prev').click();
      const mainImg = testElement.querySelector('.rs-detail-gallery__image');
      expect(mainImg.getAttribute('src')).toBe(mockImages[3]);
    });

    it('should wrap around to first image on next from last', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      // Click next 4 times to wrap around
      for (let i = 0; i < 4; i++) {
        testElement.querySelector('.rs-detail-gallery__nav--next').click();
      }
      const mainImg = testElement.querySelector('.rs-detail-gallery__image');
      expect(mainImg.getAttribute('src')).toBe(mockImages[0]);
    });

    it('should update counter on navigation', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__nav--next').click();
      const counter = testElement.querySelector('.rs-detail-gallery__counter');
      expect(counter.textContent).toBe('2 / 4');
    });

    it('should update active thumbnail on navigation', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__nav--next').click();
      const activeThumb = testElement.querySelector('.rs-detail-gallery__thumb--active');
      expect(activeThumb.dataset.index).toBe('1');
    });

    it('should navigate to image on thumbnail click', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      const thumbs = testElement.querySelectorAll('.rs-detail-gallery__thumb');
      thumbs[2].click();
      const mainImg = testElement.querySelector('.rs-detail-gallery__image');
      expect(mainImg.getAttribute('src')).toBe(mockImages[2]);
    });

    it('should track gallery view on navigation', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__nav--next').click();
      expect(globalThis.RealtySoftAnalytics.trackGalleryView).toHaveBeenCalledWith(property.id, 1);
    });
  });

  describe('lightbox', () => {
    it('should open lightbox on fullscreen button click', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__fullscreen').click();
      const lightbox = testElement.querySelector('.rs-detail-gallery__lightbox');
      expect(lightbox.style.display).toBe('flex');
    });

    it('should show current image in lightbox', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__fullscreen').click();
      const lightboxImg = testElement.querySelector('.rs-detail-gallery__lightbox-image');
      expect(lightboxImg.getAttribute('src')).toBe(mockImages[0]);
    });

    it('should close lightbox on close button click', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__fullscreen').click();
      testElement.querySelector('.rs-detail-gallery__lightbox-close').click();
      const lightbox = testElement.querySelector('.rs-detail-gallery__lightbox');
      expect(lightbox.style.display).toBe('none');
    });

    it('should close lightbox on backdrop click', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__fullscreen').click();
      testElement.querySelector('.rs-detail-gallery__lightbox-backdrop').click();
      const lightbox = testElement.querySelector('.rs-detail-gallery__lightbox');
      expect(lightbox.style.display).toBe('none');
    });

    it('should set body overflow hidden when lightbox is open', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__fullscreen').click();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when lightbox closes', () => {
      const property = createMockProperty({ images: mockImages });
      new RSDetailGallery(testElement, { property });
      testElement.querySelector('.rs-detail-gallery__fullscreen').click();
      testElement.querySelector('.rs-detail-gallery__lightbox-close').click();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailGallery(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when images array is empty', () => {
      const property = createMockProperty({ images: [], imagesFull: [] });
      new RSDetailGallery(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ images: mockImages });
      const component = new RSDetailGallery(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
