/**
 * Tests for RSViewToggle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSViewToggle } from '../../../src/components/listing/view-toggle';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goToPage: vi.fn(),
  setView: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

// RSViewToggle reads from window.RealtySoftState.get at init time
window.RealtySoftState = RealtySoftState;

describe('RSViewToggle', () => {
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
    it('should add the rs-view-toggle CSS class', () => {
      new RSViewToggle(testElement);
      expect(testElement.classList.contains('rs-view-toggle')).toBe(true);
    });

    it('should render a wrapper element', () => {
      new RSViewToggle(testElement);
      const wrapper = testElement.querySelector('.rs-view-toggle__wrapper');
      expect(wrapper).toBeTruthy();
    });

    it('should render a grid button', () => {
      new RSViewToggle(testElement);
      const gridBtn = testElement.querySelector('.rs-view-toggle__btn--grid');
      expect(gridBtn).toBeTruthy();
      expect(gridBtn.dataset.view).toBe('grid');
    });

    it('should render a list button', () => {
      new RSViewToggle(testElement);
      const listBtn = testElement.querySelector('.rs-view-toggle__btn--list');
      expect(listBtn).toBeTruthy();
      expect(listBtn.dataset.view).toBe('list');
    });

    it('should default to grid view being active', () => {
      new RSViewToggle(testElement);
      const gridBtn = testElement.querySelector('.rs-view-toggle__btn--grid');
      expect(gridBtn.classList.contains('rs-view-toggle__btn--active')).toBe(true);
    });

    it('should set aria-label attributes on buttons', () => {
      new RSViewToggle(testElement);
      const gridBtn = testElement.querySelector('.rs-view-toggle__btn--grid');
      const listBtn = testElement.querySelector('.rs-view-toggle__btn--list');
      expect(gridBtn.getAttribute('aria-label')).toBeTruthy();
      expect(listBtn.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('events', () => {
    it('should call setView with "grid" when grid button is clicked', () => {
      new RSViewToggle(testElement);
      const gridBtn = testElement.querySelector('.rs-view-toggle__btn--grid');
      gridBtn.click();
      expect(mockRealtySoft.setView).toHaveBeenCalledWith('grid');
    });

    it('should call setView with "list" when list button is clicked', () => {
      new RSViewToggle(testElement);
      const listBtn = testElement.querySelector('.rs-view-toggle__btn--list');
      listBtn.click();
      expect(mockRealtySoft.setView).toHaveBeenCalledWith('list');
    });
  });

  describe('state subscriptions', () => {
    it('should update active class when ui.view changes to list', () => {
      new RSViewToggle(testElement);
      RealtySoftState.set('ui.view', 'list');
      const listBtn = testElement.querySelector('.rs-view-toggle__btn--list');
      const gridBtn = testElement.querySelector('.rs-view-toggle__btn--grid');
      expect(listBtn.classList.contains('rs-view-toggle__btn--active')).toBe(true);
      expect(gridBtn.classList.contains('rs-view-toggle__btn--active')).toBe(false);
    });

    it('should update active class when ui.view changes back to grid', () => {
      new RSViewToggle(testElement);
      RealtySoftState.set('ui.view', 'list');
      RealtySoftState.set('ui.view', 'grid');
      const gridBtn = testElement.querySelector('.rs-view-toggle__btn--grid');
      expect(gridBtn.classList.contains('rs-view-toggle__btn--active')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSViewToggle(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
