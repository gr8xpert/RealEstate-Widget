/**
 * RealtySoft Widget v3 - Language Selector Component
 * Language switch dropdown
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftLabelsModule
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

class RSLanguageSelector extends RSBaseComponent {
  private currentLanguage: string = 'en_US';
  private languages: LanguageOption[] = [];
  private trigger: HTMLButtonElement | null = null;
  private dropdown: HTMLElement | null = null;
  private isOpen: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  // Master list of all known languages with display info
  private static readonly KNOWN_LANGUAGES: LanguageOption[] = [
    { code: 'en_US', label: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
    { code: 'es_ES', label: 'Espa\u00f1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
    { code: 'de_DE', label: 'Deutsch', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
    { code: 'fr_FR', label: 'Fran\u00e7ais', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
    { code: 'it_IT', label: 'Italiano', flag: '\uD83C\uDDEE\uD83C\uDDF9' },
    { code: 'pt_PT', label: 'Portugu\u00eas', flag: '\uD83C\uDDF5\uD83C\uDDF9' },
    { code: 'nl_NL', label: 'Nederlands', flag: '\uD83C\uDDF3\uD83C\uDDF1' },
    { code: 'pl_PL', label: 'Polski', flag: '\uD83C\uDDF5\uD83C\uDDF1' },
    { code: 'ru_RU', label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', flag: '\uD83C\uDDF7\uD83C\uDDFA' },
    { code: 'sv_SE', label: 'Svenska', flag: '\uD83C\uDDF8\uD83C\uDDEA' },
    { code: 'no_NO', label: 'Norsk', flag: '\uD83C\uDDF3\uD83C\uDDF4' },
    { code: 'da_DK', label: 'Dansk', flag: '\uD83C\uDDE9\uD83C\uDDF0' },
    { code: 'fi_FI', label: 'Suomi', flag: '\uD83C\uDDEB\uD83C\uDDEE' },
  ];

  init(): void {
    this.currentLanguage = RealtySoftLabels.getLanguage();

    // Priority 1: data-languages attribute on element (explicit override)
    const availableLangsAttr = this.element.dataset.languages;
    if (availableLangsAttr) {
      const codes = availableLangsAttr.split(',').map(c => c.trim());
      this.languages = RSLanguageSelector.KNOWN_LANGUAGES.filter(l => codes.includes(l.code));
    } else {
      // Priority 2: Auto-populate from API (stored in state by controller)
      const apiLanguages = RealtySoft.State.get('data.availableLanguages') as string[] | null;
      if (apiLanguages && apiLanguages.length > 1) {
        this.languages = RSLanguageSelector.KNOWN_LANGUAGES.filter(l => apiLanguages.includes(l.code));
      } else {
        // Fallback: show all known languages
        this.languages = [...RSLanguageSelector.KNOWN_LANGUAGES];
      }
    }

    this.render();
    this.bindEvents();
  }

  render(): void {
    this.element.classList.add('rs-language-selector');

    const current = this.languages.find(l => l.code === this.currentLanguage) || this.languages[0];

    this.element.innerHTML = `
      <div class="rs-language-selector__wrapper">
        <button type="button" class="rs-language-selector__trigger">
          <span class="rs-language-selector__flag">${current.flag}</span>
          <span class="rs-language-selector__label">${current.label}</span>
          <svg class="rs-language-selector__arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="rs-language-selector__dropdown" style="display: none;">
          ${this.languages.map(lang => `
            <button type="button"
                    class="rs-language-selector__option ${lang.code === this.currentLanguage ? 'rs-language-selector__option--active' : ''}"
                    data-code="${lang.code}">
              <span class="rs-language-selector__flag">${lang.flag}</span>
              <span class="rs-language-selector__label">${lang.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.trigger = this.element.querySelector('.rs-language-selector__trigger');
    this.dropdown = this.element.querySelector('.rs-language-selector__dropdown');
    this.isOpen = false;
  }

  bindEvents(): void {
    this.trigger?.addEventListener('click', () => this.toggleDropdown());

    this.element.querySelectorAll<HTMLButtonElement>('.rs-language-selector__option').forEach(option => {
      option.addEventListener('click', () => {
        this.selectLanguage(option.dataset.code || '');
      });
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (!this.element.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });
  }

  private toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private openDropdown(): void {
    this.isOpen = true;
    if (this.dropdown) this.dropdown.style.display = 'block';
    this.trigger?.classList.add('rs-language-selector__trigger--open');
  }

  private closeDropdown(): void {
    this.isOpen = false;
    if (this.dropdown) this.dropdown.style.display = 'none';
    this.trigger?.classList.remove('rs-language-selector__trigger--open');
  }

  private async selectLanguage(code: string): Promise<void> {
    if (code === this.currentLanguage) {
      this.closeDropdown();
      return;
    }

    this.currentLanguage = code;

    // Store preference in localStorage
    try {
      localStorage.setItem('rs_language', code);
    } catch (_e) {
      // Ignore storage errors
    }

    // Close dropdown before language change
    this.closeDropdown();

    // Show loading state
    this.trigger?.classList.add('rs-language-selector--loading');

    try {
      // Use controller's setLanguage to reload labels and re-render components
      await RealtySoft.setLanguage(code);

      // Re-render this component with new language
      this.render();
      this.bindEvents();

      console.log('[RealtySoft Language Selector] Language changed to:', code);
    } catch (error) {
      console.error('[RealtySoft Language Selector] Error changing language:', error);
      // Fallback: reload page
      const url = new URL(window.location.href);
      url.searchParams.set('lang', code);
      window.location.href = url.toString();
    } finally {
      this.trigger?.classList.remove('rs-language-selector--loading');
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_language_selector', RSLanguageSelector as unknown as ComponentConstructor);

export { RSLanguageSelector };
export default RSLanguageSelector;
