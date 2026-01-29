/**
 * Tests for RSDetailMap
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailMap } from '../../../src/components/detail/map';
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

describe('RSDetailMap', () => {
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
    it('should add rs-detail-map class', () => {
      const property = createMockProperty({ latitude: 36.5, longitude: -4.9, location: 'Marbella' });
      new RSDetailMap(testElement, { property });
      expect(testElement.classList.contains('rs-detail-map')).toBe(true);
    });

    it('should render map title', () => {
      const property = createMockProperty({ latitude: 36.5, longitude: -4.9, location: 'Marbella' });
      new RSDetailMap(testElement, { property });
      const title = testElement.querySelector('.rs-detail-map__title');
      expect(title).toBeTruthy();
    });

    it('should render Leaflet map container', () => {
      const property = createMockProperty({ latitude: 36.5, longitude: -4.9, location: 'Marbella' });
      new RSDetailMap(testElement, { property });
      const leafletContainer = testElement.querySelector('.rs-detail-map__leaflet');
      expect(leafletContainer).toBeTruthy();
    });

    it('should render loading indicator', () => {
      const property = createMockProperty({ location: 'Marbella' });
      new RSDetailMap(testElement, { property });
      const loading = testElement.querySelector('.rs-detail-map__loading');
      expect(loading).toBeTruthy();
    });

    it('should display location address', () => {
      const property = createMockProperty({ location: 'Marbella', _original: { province_id: { name: 'Malaga' } } });
      new RSDetailMap(testElement, { property });
      const address = testElement.querySelector('.rs-detail-map__address');
      expect(address).toBeTruthy();
    });
  });

  describe('map variations', () => {
    it('should default to municipality mode (variation 1)', () => {
      const property = createMockProperty({ location: 'Marbella', latitude: 36.5, longitude: -4.9 });
      const component = new RSDetailMap(testElement, { property });
      expect(component.getMapMode()).toBe('municipality');
    });

    it('should use pinpoint mode for variation 2 with coordinates', () => {
      const property = createMockProperty({ latitude: 36.5, longitude: -4.9, location: 'Marbella' });
      testElement.dataset.variation = '2';
      const component = new RSDetailMap(testElement, { property });
      expect(component.getMapMode()).toBe('pinpoint');
    });

    it('should fallback to municipality for variation 2 without coordinates', () => {
      const property = createMockProperty({ latitude: 0, longitude: 0, location: 'Marbella' });
      testElement.dataset.variation = '2';
      const component = new RSDetailMap(testElement, { property });
      expect(component.getMapMode()).toBe('municipality');
    });

    it('should use auto-detect mode for variation 0 with coordinates', () => {
      const property = createMockProperty({ latitude: 36.5, longitude: -4.9, location: 'Marbella' });
      testElement.dataset.variation = '0';
      const component = new RSDetailMap(testElement, { property });
      expect(component.getMapMode()).toBe('pinpoint');
    });

    it('should use zipcode mode for variation 3 with postal code', () => {
      const property = createMockProperty({ postal_code: '29601', location: 'Marbella', latitude: 0, longitude: 0 });
      testElement.dataset.variation = '3';
      const component = new RSDetailMap(testElement, { property });
      expect(component.getMapMode()).toBe('zipcode');
    });
  });

  describe('exact location check', () => {
    it('should report exact location when pinpoint with coordinates', () => {
      const property = createMockProperty({ latitude: 36.5, longitude: -4.9, location: 'Marbella' });
      testElement.dataset.variation = '2';
      const component = new RSDetailMap(testElement, { property });
      expect(component.isExactLocation()).toBe(true);
    });

    it('should not report exact location for municipality mode', () => {
      const property = createMockProperty({ latitude: 36.5, longitude: -4.9, location: 'Marbella' });
      const component = new RSDetailMap(testElement, { property });
      expect(component.isExactLocation()).toBe(false);
    });
  });

  describe('map actions', () => {
    it('should render directions link', () => {
      const property = createMockProperty({ location: 'Marbella' });
      new RSDetailMap(testElement, { property });
      const dirLink = testElement.querySelector('.rs-detail-map__action[href*="dir"]');
      expect(dirLink).toBeTruthy();
    });

    it('should render larger map link', () => {
      const property = createMockProperty({ location: 'Marbella' });
      new RSDetailMap(testElement, { property });
      const largerLink = testElement.querySelector('.rs-detail-map__action');
      expect(largerLink).toBeTruthy();
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailMap(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when no location data', () => {
      const property = createMockProperty({
        latitude: 0, longitude: 0, location: '', postal_code: '',
        _original: {},
      });
      new RSDetailMap(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ location: 'Marbella' });
      const component = new RSDetailMap(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
