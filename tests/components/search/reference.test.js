/**
 * Tests for RSReference
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSReference } from '../../../src/components/search/reference';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSReference', () => {
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
    it('should add rs-reference class', () => {
      new RSReference(testElement);
      expect(testElement.classList.contains('rs-reference')).toBe(true);
    });

    it('should render label', () => {
      new RSReference(testElement);
      const label = testElement.querySelector('.rs-reference__label');
      expect(label.textContent).toBe('Reference');
    });

    it('should render text input', () => {
      new RSReference(testElement);
      const input = testElement.querySelector('.rs-reference__input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('should have autocomplete off', () => {
      new RSReference(testElement);
      const input = testElement.querySelector('.rs-reference__input');
      expect(input.getAttribute('autocomplete')).toBe('off');
    });

    it('should not show clear button when empty', () => {
      new RSReference(testElement);
      const clearBtn = testElement.querySelector('.rs-reference__clear');
      expect(clearBtn).toBeFalsy();
    });
  });

  describe('events', () => {
    it('should set ref filter on input (debounced)', () => {
      new RSReference(testElement);
      const input = testElement.querySelector('.rs-reference__input');
      input.value = 'REF001';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      vi.advanceTimersByTime(300);
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('ref', 'REF001');
    });

    it('should trigger search on Enter key', () => {
      new RSReference(testElement);
      const input = testElement.querySelector('.rs-reference__input');
      input.value = 'REF001';
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event);
      expect(mockRealtySoft.search).toHaveBeenCalled();
    });

    it('should set ref filter on Enter key', () => {
      new RSReference(testElement);
      const input = testElement.querySelector('.rs-reference__input');
      input.value = 'REF001';
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event);
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('ref', 'REF001');
    });

    it('should trim whitespace from input', () => {
      new RSReference(testElement);
      const input = testElement.querySelector('.rs-reference__input');
      input.value = '  REF001  ';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      vi.advanceTimersByTime(300);
      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('ref', 'REF001');
    });
  });

  describe('state subscription', () => {
    it('should update input when state changes', () => {
      new RSReference(testElement);
      RealtySoftState.set('filters.ref', 'REF999');
      const input = testElement.querySelector('.rs-reference__input');
      expect(input.value).toBe('REF999');
    });
  });

  describe('locked mode', () => {
    it('should apply locked styles when ref locked', () => {
      RealtySoftState.setLockedFilters({ ref: 'LOCKED' });
      new RSReference(testElement);
      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const component = new RSReference(testElement);
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
