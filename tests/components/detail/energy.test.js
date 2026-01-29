/**
 * Tests for RSDetailEnergy
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailEnergy } from '../../../src/components/detail/energy';
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

describe('RSDetailEnergy', () => {
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
    it('should add rs-detail-energy class', () => {
      const property = createMockProperty({ energy_rating: 'B' });
      new RSDetailEnergy(testElement, { property });
      expect(testElement.classList.contains('rs-detail-energy')).toBe(true);
    });

    it('should render title', () => {
      const property = createMockProperty({ energy_rating: 'B' });
      new RSDetailEnergy(testElement, { property });
      const title = testElement.querySelector('.rs-detail-energy__title');
      expect(title).toBeTruthy();
    });

    it('should render energy rating scale', () => {
      const property = createMockProperty({ energy_rating: 'C' });
      new RSDetailEnergy(testElement, { property });
      const scale = testElement.querySelector('.rs-detail-energy__scale--energy');
      expect(scale).toBeTruthy();
    });

    it('should render CO2 rating scale', () => {
      const property = createMockProperty({ co2_rating: 'D' });
      new RSDetailEnergy(testElement, { property });
      const scale = testElement.querySelector('.rs-detail-energy__scale--co2');
      expect(scale).toBeTruthy();
    });

    it('should highlight active rating letter', () => {
      const property = createMockProperty({ energy_rating: 'B' });
      new RSDetailEnergy(testElement, { property });
      const active = testElement.querySelector('.rs-detail-energy__scale-bar--active');
      expect(active).toBeTruthy();
      const letter = active.querySelector('.rs-detail-energy__scale-letter');
      expect(letter.textContent).toBe('B');
    });

    it('should render all 7 rating bars (A-G)', () => {
      const property = createMockProperty({ energy_rating: 'A' });
      new RSDetailEnergy(testElement, { property });
      const bars = testElement.querySelectorAll('.rs-detail-energy__scale--energy .rs-detail-energy__scale-bar');
      expect(bars.length).toBe(7);
    });

    it('should render energy consumption when available', () => {
      const property = createMockProperty({ energy_rating: 'B', energy_consumption: '120 kWh/m2' });
      new RSDetailEnergy(testElement, { property });
      const consumption = testElement.querySelector('.rs-detail-energy__consumption-value');
      expect(consumption).toBeTruthy();
      expect(consumption.textContent).toBe('120 kWh/m2');
    });

    it('should render energy certificate image when available', () => {
      const property = createMockProperty({ energy_certificate_image: 'https://example.com/cert.jpg' });
      new RSDetailEnergy(testElement, { property });
      const img = testElement.querySelector('.rs-detail-energy__image img');
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('https://example.com/cert.jpg');
    });
  });

  describe('no data handling', () => {
    it('should hide element when no property provided', () => {
      new RSDetailEnergy(testElement, {});
      expect(testElement.style.display).toBe('none');
    });

    it('should hide element when no energy data exists', () => {
      const property = createMockProperty({ energy_rating: '', co2_rating: '', energy_certificate_image: '' });
      new RSDetailEnergy(testElement, { property });
      expect(testElement.style.display).toBe('none');
    });
  });

  describe('both ratings', () => {
    it('should render both energy and CO2 rating scales', () => {
      const property = createMockProperty({ energy_rating: 'A', co2_rating: 'C' });
      new RSDetailEnergy(testElement, { property });
      const energyScale = testElement.querySelector('.rs-detail-energy__scale--energy');
      const co2Scale = testElement.querySelector('.rs-detail-energy__scale--co2');
      expect(energyScale).toBeTruthy();
      expect(co2Scale).toBeTruthy();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty({ energy_rating: 'B' });
      const component = new RSDetailEnergy(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
