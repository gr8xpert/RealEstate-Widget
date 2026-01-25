/**
 * RealtySoft Widget v2 - Language Selector Component
 * Language switch dropdown
 */

class RSLanguageSelector extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.currentLanguage = RealtySoftLabels.getLanguage();
        this.languages = [
            { code: 'en_US', label: 'English', flag: '🇬🇧' },
            { code: 'es_ES', label: 'Español', flag: '🇪🇸' },
            { code: 'de_DE', label: 'Deutsch', flag: '🇩🇪' },
            { code: 'fr_FR', label: 'Français', flag: '🇫🇷' },
            { code: 'it_IT', label: 'Italiano', flag: '🇮🇹' },
            { code: 'pt_PT', label: 'Português', flag: '🇵🇹' },
            { code: 'nl_NL', label: 'Nederlands', flag: '🇳🇱' },
            { code: 'ru_RU', label: 'Русский', flag: '🇷🇺' },
            { code: 'sv_SE', label: 'Svenska', flag: '🇸🇪' },
            { code: 'no_NO', label: 'Norsk', flag: '🇳🇴' },
            { code: 'da_DK', label: 'Dansk', flag: '🇩🇰' },
            { code: 'fi_FI', label: 'Suomi', flag: '🇫🇮' }
        ];

        // Filter to only available languages if specified
        const availableLangs = this.element.dataset.languages;
        if (availableLangs) {
            const codes = availableLangs.split(',').map(c => c.trim());
            this.languages = this.languages.filter(l => codes.includes(l.code));
        }

        this.render();
        this.bindEvents();
    }

    render() {
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

    bindEvents() {
        this.trigger.addEventListener('click', () => this.toggleDropdown());

        this.element.querySelectorAll('.rs-language-selector__option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectLanguage(option.dataset.code);
            });
        });

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.isOpen = true;
        this.dropdown.style.display = 'block';
        this.trigger.classList.add('rs-language-selector__trigger--open');
    }

    closeDropdown() {
        this.isOpen = false;
        this.dropdown.style.display = 'none';
        this.trigger.classList.remove('rs-language-selector__trigger--open');
    }

    async selectLanguage(code) {
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
        this.trigger.classList.add('rs-language-selector--loading');

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
            this.trigger.classList.remove('rs-language-selector--loading');
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_language_selector', RSLanguageSelector);
