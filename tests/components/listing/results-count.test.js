/**
 * Tests for RSResultsCount
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSResultsCount } from '../../../src/components/listing/results-count';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  showDetail: vi.fn(),
  goToPage: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSResultsCount', () => {
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
    it('should add the rs-results-count CSS class', () => {
      new RSResultsCount(testElement);
      expect(testElement.classList.contains('rs-results-count')).toBe(true);
    });

    it('should render a text span element', () => {
      new RSResultsCount(testElement);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span).toBeTruthy();
    });

    it('should show zero results text initially', () => {
      new RSResultsCount(testElement);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span.textContent).toBe('No properties found');
    });
  });

  describe('state subscriptions', () => {
    it('should update display when results.total changes to 1', () => {
      new RSResultsCount(testElement);
      RealtySoftState.set('results.total', 1);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span.textContent).toBe('1 property found');
    });

    it('should update display when results.total changes to multiple', () => {
      new RSResultsCount(testElement);
      RealtySoftState.set('results.total', 42);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span.textContent).toContain('42');
      expect(span.textContent).toContain('properties found');
    });

    it('should update display when results.total is zero', () => {
      new RSResultsCount(testElement);
      RealtySoftState.set('results.total', 0);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span.textContent).toBe('No properties found');
    });

    it('should show loading text when ui.loading is true', () => {
      new RSResultsCount(testElement);
      RealtySoftState.set('ui.loading', true);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span.textContent).toBe('Loading...');
      expect(span.classList.contains('rs-results-count__text--loading')).toBe(true);
    });

    it('should remove loading text when ui.loading becomes false', () => {
      new RSResultsCount(testElement);
      RealtySoftState.set('results.total', 10);
      RealtySoftState.set('ui.loading', true);
      RealtySoftState.set('ui.loading', false);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span.classList.contains('rs-results-count__text--loading')).toBe(false);
    });

    it('should reflect total after loading completes', () => {
      new RSResultsCount(testElement);
      RealtySoftState.set('results.total', 25);
      RealtySoftState.set('ui.loading', true);
      RealtySoftState.set('ui.loading', false);
      const span = testElement.querySelector('.rs-results-count__text');
      expect(span.textContent).toContain('25');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSResultsCount(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });

    it('should not update display after destroy', () => {
      const component = new RSResultsCount(testElement);
      component.destroy();
      RealtySoftState.set('results.total', 99);
      expect(testElement.innerHTML).toBe('');
    });
  });
});
