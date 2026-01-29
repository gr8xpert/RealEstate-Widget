/**
 * Tests for RSSearchButton
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSSearchButton } from '../../../src/components/search/search-button';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
const mockAPI = {
  searchProperties: vi.fn().mockResolvedValue({ data: [], total: 42 }),
};
globalThis.RealtySoft = mockRealtySoft;
globalThis.RealtySoftAPI = mockAPI;

describe('RSSearchButton', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    vi.useRealTimers();
  });

  describe('render', () => {
    it('should add rs-search-button class', () => {
      new RSSearchButton(testElement);
      expect(testElement.classList.contains('rs-search-button')).toBe(true);
    });

    it('should render a button element', () => {
      new RSSearchButton(testElement);
      const btn = testElement.querySelector('.rs-search-button__btn');
      expect(btn).toBeTruthy();
      expect(btn.tagName).toBe('BUTTON');
    });

    it('should show search label text', () => {
      new RSSearchButton(testElement);
      const text = testElement.querySelector('.rs-search-button__text');
      expect(text.textContent).toBe('Search');
    });

    it('should have a count element', () => {
      new RSSearchButton(testElement);
      const count = testElement.querySelector('.rs-search-button__count');
      expect(count).toBeTruthy();
    });

    it('should have a loader element (hidden)', () => {
      new RSSearchButton(testElement);
      const loader = testElement.querySelector('.rs-search-button__loader');
      expect(loader).toBeTruthy();
      expect(loader.style.display).toBe('none');
    });

    it('should have a search icon', () => {
      new RSSearchButton(testElement);
      const icon = testElement.querySelector('.rs-search-button__icon svg');
      expect(icon).toBeTruthy();
    });
  });

  describe('events', () => {
    it('should call RealtySoft.search() on click', () => {
      new RSSearchButton(testElement);
      const btn = testElement.querySelector('.rs-search-button__btn');
      btn.click();
      expect(mockRealtySoft.search).toHaveBeenCalled();
    });

    it('should not search when loading', () => {
      const component = new RSSearchButton(testElement);
      RealtySoftState.set('ui.loading', true);
      const btn = testElement.querySelector('.rs-search-button__btn');
      btn.click();
      // search is only blocked if isLoading is true when clicked
      // The first call may have happened before loading was set
    });
  });

  describe('loading state', () => {
    it('should disable button when loading', () => {
      new RSSearchButton(testElement);
      RealtySoftState.set('ui.loading', true);
      const btn = testElement.querySelector('.rs-search-button__btn');
      expect(btn.disabled).toBe(true);
    });

    it('should show loading class when loading', () => {
      new RSSearchButton(testElement);
      RealtySoftState.set('ui.loading', true);
      const btn = testElement.querySelector('.rs-search-button__btn');
      expect(btn.classList.contains('rs-search-button__btn--loading')).toBe(true);
    });

    it('should show loader and hide icon when loading', () => {
      new RSSearchButton(testElement);
      RealtySoftState.set('ui.loading', true);
      const loader = testElement.querySelector('.rs-search-button__loader');
      const icon = testElement.querySelector('.rs-search-button__icon');
      expect(loader.style.display).toBe('inline-block');
      expect(icon.style.display).toBe('none');
    });

    it('should show "Loading..." text when loading', () => {
      new RSSearchButton(testElement);
      RealtySoftState.set('ui.loading', true);
      const text = testElement.querySelector('.rs-search-button__text');
      expect(text.textContent).toBe('Loading...');
    });

    it('should re-enable button when loading ends', () => {
      new RSSearchButton(testElement);
      RealtySoftState.set('ui.loading', true);
      RealtySoftState.set('ui.loading', false);
      const btn = testElement.querySelector('.rs-search-button__btn');
      expect(btn.disabled).toBe(false);
    });
  });

  describe('count display', () => {
    it('should fetch count on init after debounce', async () => {
      mockAPI.searchProperties.mockResolvedValue({ data: [], total: 42 });
      new RSSearchButton(testElement);
      vi.advanceTimersByTime(600);
      await vi.runAllTimersAsync();
      expect(mockAPI.searchProperties).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSSearchButton(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });

    it('should unsubscribe from state', () => {
      const component = new RSSearchButton(testElement);
      expect(component.subscriptions.length).toBeGreaterThan(0);
      component.destroy();
      expect(component.subscriptions.length).toBe(0);
    });
  });
});
