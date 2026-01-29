/**
 * Tests for RSLanguageSelector
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSLanguageSelector } from '../../../src/components/utility/language-selector';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  setLanguage: vi.fn().mockResolvedValue(undefined),
  showDetail: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

describe('RSLanguageSelector', () => {
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

  it('should add correct CSS class', () => {
    new RSLanguageSelector(testElement);
    expect(testElement.classList.contains('rs-language-selector')).toBe(true);
  });

  it('should render trigger button', () => {
    new RSLanguageSelector(testElement);
    const trigger = testElement.querySelector('.rs-language-selector__trigger');
    expect(trigger).toBeTruthy();
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('should render dropdown hidden initially', () => {
    new RSLanguageSelector(testElement);
    const dropdown = testElement.querySelector('.rs-language-selector__dropdown');
    expect(dropdown).toBeTruthy();
    expect(dropdown.style.display).toBe('none');
  });

  it('should render all default language options', () => {
    new RSLanguageSelector(testElement);
    const options = testElement.querySelectorAll('.rs-language-selector__option');
    expect(options.length).toBe(12);
  });

  it('should show current language label in trigger', () => {
    new RSLanguageSelector(testElement);
    const label = testElement.querySelector('.rs-language-selector__trigger .rs-language-selector__label');
    expect(label.textContent).toBe('English');
  });

  it('should mark current language as active', () => {
    new RSLanguageSelector(testElement);
    const activeOption = testElement.querySelector('.rs-language-selector__option--active');
    expect(activeOption).toBeTruthy();
    expect(activeOption.dataset.code).toBe('en_US');
  });

  it('should open dropdown on trigger click', () => {
    new RSLanguageSelector(testElement);
    const trigger = testElement.querySelector('.rs-language-selector__trigger');
    trigger.click();
    const dropdown = testElement.querySelector('.rs-language-selector__dropdown');
    expect(dropdown.style.display).toBe('block');
  });

  it('should close dropdown on second trigger click', () => {
    new RSLanguageSelector(testElement);
    const trigger = testElement.querySelector('.rs-language-selector__trigger');
    trigger.click();
    trigger.click();
    const dropdown = testElement.querySelector('.rs-language-selector__dropdown');
    expect(dropdown.style.display).toBe('none');
  });

  it('should add open class to trigger when dropdown opens', () => {
    new RSLanguageSelector(testElement);
    const trigger = testElement.querySelector('.rs-language-selector__trigger');
    trigger.click();
    expect(trigger.classList.contains('rs-language-selector__trigger--open')).toBe(true);
  });

  it('should filter languages when data-languages attribute is set', () => {
    testElement.dataset.languages = 'en_US,es_ES,fr_FR';
    new RSLanguageSelector(testElement);
    const options = testElement.querySelectorAll('.rs-language-selector__option');
    expect(options.length).toBe(3);
  });

  it('should call setLanguage when selecting a different language', async () => {
    new RSLanguageSelector(testElement);
    const esOption = testElement.querySelector('.rs-language-selector__option[data-code="es_ES"]');
    esOption.click();
    expect(mockRealtySoft.setLanguage).toHaveBeenCalledWith('es_ES');
  });

  it('should store language preference in localStorage', () => {
    new RSLanguageSelector(testElement);
    const esOption = testElement.querySelector('.rs-language-selector__option[data-code="es_ES"]');
    esOption.click();
    expect(localStorage.setItem).toHaveBeenCalledWith('rs_language', 'es_ES');
  });

  it('should close dropdown when selecting same language', () => {
    new RSLanguageSelector(testElement);
    const trigger = testElement.querySelector('.rs-language-selector__trigger');
    trigger.click();
    const enOption = testElement.querySelector('.rs-language-selector__option[data-code="en_US"]');
    enOption.click();
    const dropdown = testElement.querySelector('.rs-language-selector__dropdown');
    expect(dropdown.style.display).toBe('none');
    expect(mockRealtySoft.setLanguage).not.toHaveBeenCalled();
  });

  it('should close dropdown when clicking outside', () => {
    new RSLanguageSelector(testElement);
    const trigger = testElement.querySelector('.rs-language-selector__trigger');
    trigger.click();
    document.body.click();
    const dropdown = testElement.querySelector('.rs-language-selector__dropdown');
    expect(dropdown.style.display).toBe('none');
  });

  it('should render wrapper element', () => {
    new RSLanguageSelector(testElement);
    const wrapper = testElement.querySelector('.rs-language-selector__wrapper');
    expect(wrapper).toBeTruthy();
  });
});
