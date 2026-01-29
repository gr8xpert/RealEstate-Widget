/**
 * Tests for RSDetailInfoTable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailInfoTable } from '../../../src/components/detail/info-table';
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

describe('RSDetailInfoTable', () => {
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
    it('should add rs-detail-info-table class', () => {
      const property = createMockProperty({ type: 'Villa', status: 'For Sale' });
      new RSDetailInfoTable(testElement, { property });
      expect(testElement.classList.contains('rs-detail-info-table')).toBe(true);
    });

    it('should render title', () => {
      const property = createMockProperty({ type: 'Villa' });
      new RSDetailInfoTable(testElement, { property });
      const title = testElement.querySelector('.rs-detail-info-table__title');
      expect(title).toBeTruthy();
    });

    it('should render table', () => {
      const property = createMockProperty({ type: 'Villa' });
      new RSDetailInfoTable(testElement, { property });
      const table = testElement.querySelector('.rs-detail-info-table__table');
      expect(table).toBeTruthy();
    });

    it('should render property type row', () => {
      const property = createMockProperty({ type: 'Apartment' });
      new RSDetailInfoTable(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-info-table__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts).toContain('Apartment');
    });

    it('should render reference row', () => {
      const property = createMockProperty({ ref: 'REF-123' });
      new RSDetailInfoTable(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-info-table__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts).toContain('REF-123');
    });

    it('should render year built row', () => {
      const property = createMockProperty({ year_built: 2020 });
      new RSDetailInfoTable(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-info-table__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts).toContain('2020');
    });

    it('should render orientation row', () => {
      const property = createMockProperty({ orientation: 'South' });
      new RSDetailInfoTable(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-info-table__value');
      const valTexts = Array.from(values).map(v => v.textContent.trim());
      expect(valTexts).toContain('South');
    });

    it('should render multiple rows for complete property', () => {
      const property = createMockProperty({
        type: 'Villa', status: 'For Sale', ref: 'V001',
        year_built: 2020, floor: '2', orientation: 'South',
        condition: 'Excellent', furnished: 'Fully', views: 'Sea',
      });
      new RSDetailInfoTable(testElement, { property });
      const rows = testElement.querySelectorAll('.rs-detail-info-table__row');
      expect(rows.length).toBeGreaterThanOrEqual(5);
    });

    it('should escape HTML in values', () => {
      const property = createMockProperty({ type: '<script>alert("xss")</script>' });
      new RSDetailInfoTable(testElement, { property });
      const values = testElement.querySelectorAll('.rs-detail-info-table__value');
      const firstValue = values[0];
      expect(firstValue.innerHTML).not.toContain('<script>');
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailInfoTable(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when no info rows can be generated', () => {
      const property = createMockProperty({
        type: '', status: '', ref: '', unique_ref: '',
        year_built: '', postal_code: '', floor: '',
        orientation: '', condition: '', furnished: '',
        views: '', parking: 0,
      });
      new RSDetailInfoTable(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ type: 'Villa' });
      const component = new RSDetailInfoTable(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
