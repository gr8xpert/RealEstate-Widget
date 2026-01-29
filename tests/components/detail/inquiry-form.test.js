/**
 * Tests for RSDetailInquiryForm
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSDetailInquiryForm } from '../../../src/components/detail/inquiry-form';
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
globalThis.RealtySoftAnalytics = {
  track: vi.fn(),
  trackSearch: vi.fn(),
  trackDetail: vi.fn(),
  trackWishlist: vi.fn(),
  trackInquiry: vi.fn(),
  trackShare: vi.fn(),
  trackLanguageChange: vi.fn(),
};

const mockAPI = {
  searchProperties: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getProperty: vi.fn().mockResolvedValue({ data: null }),
  getLocations: vi.fn().mockResolvedValue({ data: [] }),
  getPropertyTypes: vi.fn().mockResolvedValue({ data: [] }),
  getFeatures: vi.fn().mockResolvedValue({ data: [] }),
  getLabels: vi.fn().mockResolvedValue({ data: {} }),
  prefetchProperty: vi.fn(),
  submitInquiry: vi.fn().mockResolvedValue({ success: true }),
  clearCache: vi.fn(),
};
globalThis.RealtySoftAPI = mockAPI;

describe('RSDetailInquiryForm', () => {
  let testElement;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    vi.clearAllMocks();
    mockAPI.submitInquiry.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('render', () => {
    it('should add rs-detail-inquiry class', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      expect(testElement.classList.contains('rs-detail-inquiry')).toBe(true);
    });

    it('should render form title', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const title = testElement.querySelector('.rs-detail-inquiry__title');
      expect(title).toBeTruthy();
    });

    it('should render form element', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const form = testElement.querySelector('.rs-detail-inquiry__form');
      expect(form).toBeTruthy();
    });

    it('should render first name input', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const input = testElement.querySelector('input[name="first_name"]');
      expect(input).toBeTruthy();
      expect(input.required).toBe(true);
    });

    it('should render last name input', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const input = testElement.querySelector('input[name="last_name"]');
      expect(input).toBeTruthy();
      expect(input.required).toBe(true);
    });

    it('should render email input', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const input = testElement.querySelector('input[name="email"]');
      expect(input).toBeTruthy();
      expect(input.type).toBe('email');
      expect(input.required).toBe(true);
    });

    it('should render phone input', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const input = testElement.querySelector('input[name="phone"]');
      expect(input).toBeTruthy();
    });

    it('should render message textarea', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const textarea = testElement.querySelector('textarea[name="message"]');
      expect(textarea).toBeTruthy();
      expect(textarea.required).toBe(true);
    });

    it('should pre-fill message with property info', () => {
      const property = createMockProperty({ title: 'Luxury Villa', ref: 'LV001' });
      new RSDetailInquiryForm(testElement, { property });
      const textarea = testElement.querySelector('textarea[name="message"]');
      expect(textarea.value).toContain('Luxury Villa');
      expect(textarea.value).toContain('LV001');
    });

    it('should render privacy checkbox', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const checkbox = testElement.querySelector('input[name="privacy"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox.type).toBe('checkbox');
      expect(checkbox.required).toBe(true);
    });

    it('should render submit button', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const btn = testElement.querySelector('.rs-detail-inquiry__submit');
      expect(btn).toBeTruthy();
      expect(btn.type).toBe('submit');
    });

    it('should render success message div (hidden)', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const success = testElement.querySelector('.rs-detail-inquiry__success');
      expect(success).toBeTruthy();
      expect(success.style.display).toBe('none');
    });
  });

  describe('country code selector', () => {
    it('should render country code button', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const countryBtn = testElement.querySelector('.rs-detail-inquiry__country-btn');
      expect(countryBtn).toBeTruthy();
    });

    it('should render country dropdown (hidden initially)', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const dropdown = testElement.querySelector('.rs-detail-inquiry__country-dropdown');
      expect(dropdown).toBeTruthy();
      expect(dropdown.style.display).toBe('none');
    });

    it('should show dropdown on country button click', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const countryBtn = testElement.querySelector('.rs-detail-inquiry__country-btn');
      countryBtn.click();
      const dropdown = testElement.querySelector('.rs-detail-inquiry__country-dropdown');
      expect(dropdown.style.display).toBe('block');
    });

    it('should render country search input', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const searchInput = testElement.querySelector('.rs-detail-inquiry__country-search-input');
      expect(searchInput).toBeTruthy();
    });

    it('should render country options', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const options = testElement.querySelectorAll('.rs-detail-inquiry__country-option');
      expect(options.length).toBeGreaterThan(0);
    });

    it('should set a country code (detected from timezone or config default)', () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });
      const hiddenInput = testElement.querySelector('input[name="country_code"]');
      expect(hiddenInput.value).toMatch(/^\+\d+$/);
    });
  });

  describe('form submission', () => {
    it('should call API submitInquiry on form submit', async () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });

      // Fill required fields
      testElement.querySelector('input[name="first_name"]').value = 'John';
      testElement.querySelector('input[name="last_name"]').value = 'Doe';
      testElement.querySelector('input[name="email"]').value = 'john@example.com';
      testElement.querySelector('input[name="privacy"]').checked = true;

      const form = testElement.querySelector('.rs-detail-inquiry__form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.waitFor(() => {
        expect(mockAPI.submitInquiry).toHaveBeenCalled();
      });
    });

    it('should show success message after submission', async () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });

      testElement.querySelector('input[name="first_name"]').value = 'John';
      testElement.querySelector('input[name="last_name"]').value = 'Doe';
      testElement.querySelector('input[name="email"]').value = 'john@example.com';
      testElement.querySelector('input[name="privacy"]').checked = true;

      const form = testElement.querySelector('.rs-detail-inquiry__form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.waitFor(() => {
        const success = testElement.querySelector('.rs-detail-inquiry__success');
        expect(success.style.display).toBe('flex');
      });
    });

    it('should hide form after successful submission', async () => {
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });

      testElement.querySelector('input[name="first_name"]').value = 'John';
      testElement.querySelector('input[name="last_name"]').value = 'Doe';
      testElement.querySelector('input[name="email"]').value = 'john@example.com';
      testElement.querySelector('input[name="privacy"]').checked = true;

      const form = testElement.querySelector('.rs-detail-inquiry__form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.waitFor(() => {
        expect(form.style.display).toBe('none');
      });
    });

    it('should track inquiry analytics on successful submission', async () => {
      const property = createMockProperty({ id: 42, ref: 'REF42' });
      new RSDetailInquiryForm(testElement, { property });

      testElement.querySelector('input[name="first_name"]').value = 'John';
      testElement.querySelector('input[name="last_name"]').value = 'Doe';
      testElement.querySelector('input[name="email"]').value = 'john@example.com';
      testElement.querySelector('input[name="privacy"]').checked = true;

      const form = testElement.querySelector('.rs-detail-inquiry__form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.waitFor(() => {
        expect(globalThis.RealtySoftAnalytics.trackInquiry).toHaveBeenCalledWith(42, 'REF42');
      });
    });

    it('should show error message on submission failure', async () => {
      mockAPI.submitInquiry.mockRejectedValue(new Error('Server error'));
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });

      testElement.querySelector('input[name="first_name"]').value = 'John';
      testElement.querySelector('input[name="last_name"]').value = 'Doe';
      testElement.querySelector('input[name="email"]').value = 'john@example.com';
      testElement.querySelector('input[name="privacy"]').checked = true;

      const form = testElement.querySelector('.rs-detail-inquiry__form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.waitFor(() => {
        const error = testElement.querySelector('.rs-detail-inquiry__error');
        expect(error.style.display).toBe('block');
      });
    });

    it('should disable submit button during submission', async () => {
      let resolveSubmit;
      mockAPI.submitInquiry.mockImplementation(() => new Promise(r => { resolveSubmit = r; }));
      const property = createMockProperty();
      new RSDetailInquiryForm(testElement, { property });

      testElement.querySelector('input[name="first_name"]').value = 'John';
      testElement.querySelector('input[name="last_name"]').value = 'Doe';
      testElement.querySelector('input[name="email"]').value = 'john@example.com';
      testElement.querySelector('input[name="privacy"]').checked = true;

      const form = testElement.querySelector('.rs-detail-inquiry__form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      // While submitting, button should be disabled
      await vi.waitFor(() => {
        const submitBtn = testElement.querySelector('.rs-detail-inquiry__submit');
        expect(submitBtn.disabled).toBe(true);
      });

      // Resolve the submission
      resolveSubmit({ success: true });
    });
  });

  describe('no data handling', () => {
    it('should not render form when no property provided', () => {
      new RSDetailInquiryForm(testElement, {});
      const form = testElement.querySelector('.rs-detail-inquiry__form');
      expect(form).toBeFalsy();
    });
  });

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const property = createMockProperty();
      const component = new RSDetailInquiryForm(testElement, { property });
      component.destroy();
      expect(testElement.innerHTML).toBe('');
    });
  });
});
