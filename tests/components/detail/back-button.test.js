/**
 * Tests for RSDetailBackButton
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailBackButton } from '../../../src/components/detail/back-button';
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

describe('RSDetailBackButton', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    RealtySoftState.set('currentProperty', createMockProperty());
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
    it('should add rs-detail-back class', () => {
      new RSDetailBackButton(testElement);
      expect(testElement.classList.contains('rs-detail-back')).toBe(true);
    });

    it('should render a link element', () => {
      new RSDetailBackButton(testElement);
      const link = testElement.querySelector('.rs-detail-back__btn');
      expect(link).toBeTruthy();
      expect(link.tagName).toBe('A');
    });

    it('should render back label text', () => {
      new RSDetailBackButton(testElement);
      const span = testElement.querySelector('.rs-detail-back__btn span');
      expect(span).toBeTruthy();
      expect(span.textContent).toBeTruthy();
    });

    it('should render SVG arrow icon', () => {
      new RSDetailBackButton(testElement);
      const svg = testElement.querySelector('.rs-detail-back__btn svg');
      expect(svg).toBeTruthy();
    });

    it('should use history.back() fallback when no referrer or session URL', () => {
      new RSDetailBackButton(testElement);
      const link = testElement.querySelector('.rs-detail-back__btn');
      expect(link.getAttribute('href')).toBe('javascript:history.back()');
    });
  });

  describe('search URL resolution', () => {
    it('should use data-search-url attribute when present', () => {
      testElement.dataset.searchUrl = '/properties';
      new RSDetailBackButton(testElement);
      const link = testElement.querySelector('.rs-detail-back__btn');
      expect(link.getAttribute('href')).toBe('/properties');
    });

    it('should use session storage URL when available', () => {
      sessionStorage.setItem('rs_last_search_url', '/search?page=2');
      new RSDetailBackButton(testElement);
      const link = testElement.querySelector('.rs-detail-back__btn');
      expect(link.getAttribute('href')).toBe('/search?page=2');
      sessionStorage.removeItem('rs_last_search_url');
    });
  });

  describe('events', () => {
    it('should handle click on history.back() link', () => {
      const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      new RSDetailBackButton(testElement);
      const link = testElement.querySelector('.rs-detail-back__btn');
      link.click();
      // history.back or redirect to / should be called
      historyBackSpy.mockRestore();
    });

    it('should prevent default on history.back link click', () => {
      new RSDetailBackButton(testElement);
      const link = testElement.querySelector('.rs-detail-back__btn');
      const event = new Event('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      link.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSDetailBackButton(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
