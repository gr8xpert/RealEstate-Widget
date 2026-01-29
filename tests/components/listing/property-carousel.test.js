/**
 * Tests for RSPropertyCarousel
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSPropertyCarousel } from '../../../src/components/listing/property-carousel';
import { createMockProperty } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goToPage: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

// RSPropertyCarousel references RealtySoftLabels and RealtySoftState at runtime
window.RealtySoftState = RealtySoftState;
window.RealtySoftLabels = RealtySoftLabels;

function createCarouselProperties(count = 6) {
  return Array.from({ length: count }, (_, i) =>
    createMockProperty({
      id: i + 1,
      title: `Property ${i + 1}`,
      ref: `REF${String(i + 1).padStart(3, '0')}`,
      price: 200000 + i * 50000,
      beds: 2 + (i % 3),
      baths: 1 + (i % 2),
      images: [`https://example.com/img${i + 1}.jpg`],
    })
  );
}

describe('RSPropertyCarousel', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();

    // Mock API to return properties
    globalThis.RealtySoftAPI = {
      searchProperties: vi.fn().mockResolvedValue({
        data: createCarouselProperties(),
        total: 6,
      }),
      getProperty: vi.fn().mockResolvedValue({ data: null }),
      getLocations: vi.fn().mockResolvedValue({ data: [] }),
      getPropertyTypes: vi.fn().mockResolvedValue({ data: [] }),
      getFeatures: vi.fn().mockResolvedValue({ data: [] }),
      getLabels: vi.fn().mockResolvedValue({ data: {} }),
      prefetchProperty: vi.fn(),
      submitInquiry: vi.fn().mockResolvedValue({ success: true }),
      clearCache: vi.fn(),
    };
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('render', () => {
    it('should add the rs-property-carousel CSS class', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      expect(testElement.classList.contains('rs-property-carousel')).toBe(true);
    });

    it('should add variation class', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      expect(testElement.classList.contains('rs-property-carousel--v1')).toBe(true);
    });

    it('should render left and right arrow buttons', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      const leftArrow = testElement.querySelector('.rs-property-carousel__arrow--left');
      const rightArrow = testElement.querySelector('.rs-property-carousel__arrow--right');
      expect(leftArrow).toBeTruthy();
      expect(rightArrow).toBeTruthy();
    });

    it('should render a track container', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      const track = testElement.querySelector('.rs-property-carousel__track');
      expect(track).toBeTruthy();
    });

    it('should render carousel items when properties provided', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      const items = testElement.querySelectorAll('.rs-property-carousel__item');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should render dots for navigation', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      const dots = testElement.querySelectorAll('.rs-property-carousel__dot');
      expect(dots.length).toBe(properties.length);
    });
  });

  describe('events', () => {
    it('should navigate right when right arrow is clicked', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      const rightArrow = testElement.querySelector('.rs-property-carousel__arrow--right');
      const dotsBefore = testElement.querySelector('.rs-property-carousel__dot--active');
      const initialIndex = dotsBefore ? dotsBefore.dataset.index : '0';
      rightArrow.click();
      const dotsAfter = testElement.querySelector('.rs-property-carousel__dot--active');
      // After clicking right, the active dot should change
      expect(dotsAfter.dataset.index).not.toBe(initialIndex);
    });

    it('should navigate left when left arrow is clicked', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      // Click left arrow (wraps around from index 0 to last)
      const leftArrow = testElement.querySelector('.rs-property-carousel__arrow--left');
      leftArrow.click();
      const activeDot = testElement.querySelector('.rs-property-carousel__dot--active');
      expect(activeDot).toBeTruthy();
      // Should wrap to last index
      expect(activeDot.dataset.index).toBe(String(properties.length - 1));
    });

    it('should respond to keyboard ArrowRight', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      testElement.dispatchEvent(event);
      const activeDot = testElement.querySelector('.rs-property-carousel__dot--active');
      expect(activeDot).toBeTruthy();
    });

    it('should respond to keyboard ArrowLeft', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties });
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      });
      testElement.dispatchEvent(event);
      const activeDot = testElement.querySelector('.rs-property-carousel__dot--active');
      expect(activeDot).toBeTruthy();
    });
  });

  describe('variations', () => {
    it('should render variation 4 without dots container', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties, variation: '4' });
      expect(testElement.classList.contains('rs-property-carousel--v4')).toBe(true);
      const dots = testElement.querySelector('.rs-property-carousel__dots');
      expect(dots).toBeFalsy();
    });

    it('should render a page counter for variation 4', () => {
      const properties = createCarouselProperties();
      new RSPropertyCarousel(testElement, { properties, variation: '4' });
      const counter = testElement.querySelector('.rs-property-carousel__counter');
      expect(counter).toBeTruthy();
    });
  });

  describe('API loading', () => {
    it('should call searchProperties if no properties provided', () => {
      new RSPropertyCarousel(testElement);
      expect(globalThis.RealtySoftAPI.searchProperties).toHaveBeenCalled();
    });

    it('should show loader initially when loading from API', () => {
      new RSPropertyCarousel(testElement);
      const loader = testElement.querySelector('.rs-property-carousel__loader');
      expect(loader).toBeTruthy();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const properties = createCarouselProperties();
      const component = new RSPropertyCarousel(testElement, { properties });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
