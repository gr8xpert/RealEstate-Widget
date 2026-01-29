/**
 * Tests for RSResetButton
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSResetButton } from '../../../src/components/search/reset-button';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSResetButton', () => {
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
    it('should add rs-reset-button class', () => {
      new RSResetButton(testElement);
      expect(testElement.classList.contains('rs-reset-button')).toBe(true);
    });

    it('should render a button element', () => {
      new RSResetButton(testElement);
      const btn = testElement.querySelector('.rs-reset-button__btn');
      expect(btn).toBeTruthy();
      expect(btn.tagName).toBe('BUTTON');
    });

    it('should show reset label text', () => {
      new RSResetButton(testElement);
      const text = testElement.querySelector('.rs-reset-button__text');
      expect(text.textContent).toBe('Reset Filters');
    });

    it('should render an SVG icon', () => {
      new RSResetButton(testElement);
      const icon = testElement.querySelector('.rs-reset-button__icon svg');
      expect(icon).toBeTruthy();
    });
  });

  describe('events', () => {
    it('should call RealtySoft.reset() on click', () => {
      new RSResetButton(testElement);
      const btn = testElement.querySelector('.rs-reset-button__btn');
      btn.click();
      expect(mockRealtySoft.reset).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSResetButton(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
