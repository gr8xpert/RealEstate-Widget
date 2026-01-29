/**
 * Tests for RSDetailTaxes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailTaxes } from '../../../src/components/detail/taxes';
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

describe('RSDetailTaxes', () => {
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
    it('should add rs-detail-taxes class', () => {
      const property = createMockProperty({ community_fees: 200 });
      new RSDetailTaxes(testElement, { property });
      expect(testElement.classList.contains('rs-detail-taxes')).toBe(true);
    });

    it('should render title', () => {
      const property = createMockProperty({ community_fees: 200 });
      new RSDetailTaxes(testElement, { property });
      const title = testElement.querySelector('.rs-detail-taxes__title');
      expect(title).toBeTruthy();
    });

    it('should render community fees', () => {
      const property = createMockProperty({ community_fees: 250 });
      new RSDetailTaxes(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-taxes__item');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('should render IBI tax', () => {
      const property = createMockProperty({ ibi_tax: 800 });
      new RSDetailTaxes(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-taxes__item');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('should render basura tax', () => {
      const property = createMockProperty({ basura_tax: 150 });
      new RSDetailTaxes(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-taxes__item');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('should render all three taxes when present', () => {
      const property = createMockProperty({ community_fees: 200, ibi_tax: 800, basura_tax: 150 });
      new RSDetailTaxes(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-taxes__item');
      expect(items.length).toBe(3);
    });

    it('should display period labels for taxes', () => {
      const property = createMockProperty({ community_fees: 200, ibi_tax: 800 });
      new RSDetailTaxes(testElement, { property });
      const periods = testElement.querySelectorAll('.rs-detail-taxes__period');
      expect(periods.length).toBe(2);
    });

    it('should render formatted price values', () => {
      const property = createMockProperty({ community_fees: 300 });
      new RSDetailTaxes(testElement, { property });
      const value = testElement.querySelector('.rs-detail-taxes__value');
      expect(value).toBeTruthy();
      expect(value.textContent.trim()).toBeTruthy();
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailTaxes(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when all taxes are zero', () => {
      const property = createMockProperty({ community_fees: 0, ibi_tax: 0, basura_tax: 0 });
      new RSDetailTaxes(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });

    it('should skip taxes with zero value', () => {
      const property = createMockProperty({ community_fees: 200, ibi_tax: 0, basura_tax: 100 });
      new RSDetailTaxes(testElement, { property });
      const items = testElement.querySelectorAll('.rs-detail-taxes__item');
      expect(items.length).toBe(2);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ community_fees: 200 });
      const component = new RSDetailTaxes(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
