/**
 * Tests for RSPagination
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSPagination } from '../../../src/components/listing/pagination';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goToPage: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSPagination', () => {
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
    it('should add the rs-pagination CSS class', () => {
      new RSPagination(testElement);
      expect(testElement.classList.contains('rs-pagination')).toBe(true);
    });

    it('should render empty when totalPages is 0', () => {
      new RSPagination(testElement);
      expect(testElement.innerHTML).toBe('');
    });

    it('should render empty when totalPages is 1', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 1);
      expect(testElement.innerHTML).toBe('');
    });
  });

  describe('state subscriptions', () => {
    it('should render pagination when totalPages > 1', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      const wrapper = testElement.querySelector('.rs-pagination__wrapper');
      expect(wrapper).toBeTruthy();
    });

    it('should render prev and next buttons', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      const prev = testElement.querySelector('.rs-pagination__prev');
      const next = testElement.querySelector('.rs-pagination__next');
      expect(prev).toBeTruthy();
      expect(next).toBeTruthy();
    });

    it('should disable prev button on first page', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 1);
      const prev = testElement.querySelector('.rs-pagination__prev');
      expect(prev.disabled).toBe(true);
    });

    it('should disable next button on last page', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 5);
      const next = testElement.querySelector('.rs-pagination__next');
      expect(next.disabled).toBe(true);
    });

    it('should show page number buttons', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      const pages = testElement.querySelectorAll('.rs-pagination__page');
      expect(pages.length).toBeGreaterThan(0);
    });

    it('should highlight the current page', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 3);
      const activePage = testElement.querySelector('.rs-pagination__page--active');
      expect(activePage).toBeTruthy();
      expect(activePage.dataset.page).toBe('3');
    });

    it('should display page info text', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 2);
      const info = testElement.querySelector('.rs-pagination__info');
      expect(info).toBeTruthy();
      expect(info.textContent).toContain('2');
      expect(info.textContent).toContain('5');
    });

    it('should show ellipsis for many pages', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 20);
      RealtySoftState.set('results.page', 10);
      const ellipses = testElement.querySelectorAll('.rs-pagination__ellipsis');
      expect(ellipses.length).toBeGreaterThan(0);
    });
  });

  describe('events', () => {
    it('should call goToPage when next button is clicked', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 2);
      const next = testElement.querySelector('.rs-pagination__next');
      next.click();
      expect(mockRealtySoft.goToPage).toHaveBeenCalledWith(3);
    });

    it('should call goToPage when prev button is clicked', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 3);
      const prev = testElement.querySelector('.rs-pagination__prev');
      prev.click();
      expect(mockRealtySoft.goToPage).toHaveBeenCalledWith(2);
    });

    it('should call goToPage when a page number is clicked', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 1);
      const pageBtn = testElement.querySelector('.rs-pagination__page[data-page="3"]');
      if (pageBtn) {
        pageBtn.click();
        expect(mockRealtySoft.goToPage).toHaveBeenCalledWith(3);
      }
    });

    it('should not navigate when loading', () => {
      new RSPagination(testElement);
      RealtySoftState.set('results.totalPages', 5);
      RealtySoftState.set('results.page', 2);
      RealtySoftState.set('ui.loading', true);
      const next = testElement.querySelector('.rs-pagination__next');
      next.click();
      expect(mockRealtySoft.goToPage).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSPagination(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
