/**
 * RealtySoft Widget v2 - Detail Inquiry Form Component
 * Contact form for property inquiries with country code selector
 */

class RSDetailInquiryForm extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        // Get property from options (set before super() calls init())
        this.property = this.options?.property;

        // Don't render if no property data
        if (!this.property) {
            console.warn('[RealtySoft] Inquiry form: No property data available');
            return;
        }

        this.submitting = false;
        this.submitted = false;

        // Complete list of country codes (sorted by name)
        this.countryCodes = [
            { code: '+93', country: 'AF', flag: '🇦🇫', name: 'Afghanistan' },
            { code: '+355', country: 'AL', flag: '🇦🇱', name: 'Albania' },
            { code: '+213', country: 'DZ', flag: '🇩🇿', name: 'Algeria' },
            { code: '+376', country: 'AD', flag: '🇦🇩', name: 'Andorra' },
            { code: '+244', country: 'AO', flag: '🇦🇴', name: 'Angola' },
            { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina' },
            { code: '+374', country: 'AM', flag: '🇦🇲', name: 'Armenia' },
            { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
            { code: '+43', country: 'AT', flag: '🇦🇹', name: 'Austria' },
            { code: '+994', country: 'AZ', flag: '🇦🇿', name: 'Azerbaijan' },
            { code: '+973', country: 'BH', flag: '🇧🇭', name: 'Bahrain' },
            { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
            { code: '+375', country: 'BY', flag: '🇧🇾', name: 'Belarus' },
            { code: '+32', country: 'BE', flag: '🇧🇪', name: 'Belgium' },
            { code: '+501', country: 'BZ', flag: '🇧🇿', name: 'Belize' },
            { code: '+229', country: 'BJ', flag: '🇧🇯', name: 'Benin' },
            { code: '+975', country: 'BT', flag: '🇧🇹', name: 'Bhutan' },
            { code: '+591', country: 'BO', flag: '🇧🇴', name: 'Bolivia' },
            { code: '+387', country: 'BA', flag: '🇧🇦', name: 'Bosnia' },
            { code: '+267', country: 'BW', flag: '🇧🇼', name: 'Botswana' },
            { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
            { code: '+673', country: 'BN', flag: '🇧🇳', name: 'Brunei' },
            { code: '+359', country: 'BG', flag: '🇧🇬', name: 'Bulgaria' },
            { code: '+855', country: 'KH', flag: '🇰🇭', name: 'Cambodia' },
            { code: '+237', country: 'CM', flag: '🇨🇲', name: 'Cameroon' },
            { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
            { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile' },
            { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
            { code: '+57', country: 'CO', flag: '🇨🇴', name: 'Colombia' },
            { code: '+506', country: 'CR', flag: '🇨🇷', name: 'Costa Rica' },
            { code: '+385', country: 'HR', flag: '🇭🇷', name: 'Croatia' },
            { code: '+53', country: 'CU', flag: '🇨🇺', name: 'Cuba' },
            { code: '+357', country: 'CY', flag: '🇨🇾', name: 'Cyprus' },
            { code: '+420', country: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
            { code: '+45', country: 'DK', flag: '🇩🇰', name: 'Denmark' },
            { code: '+253', country: 'DJ', flag: '🇩🇯', name: 'Djibouti' },
            { code: '+593', country: 'EC', flag: '🇪🇨', name: 'Ecuador' },
            { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
            { code: '+503', country: 'SV', flag: '🇸🇻', name: 'El Salvador' },
            { code: '+372', country: 'EE', flag: '🇪🇪', name: 'Estonia' },
            { code: '+251', country: 'ET', flag: '🇪🇹', name: 'Ethiopia' },
            { code: '+679', country: 'FJ', flag: '🇫🇯', name: 'Fiji' },
            { code: '+358', country: 'FI', flag: '🇫🇮', name: 'Finland' },
            { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
            { code: '+995', country: 'GE', flag: '🇬🇪', name: 'Georgia' },
            { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
            { code: '+233', country: 'GH', flag: '🇬🇭', name: 'Ghana' },
            { code: '+30', country: 'GR', flag: '🇬🇷', name: 'Greece' },
            { code: '+502', country: 'GT', flag: '🇬🇹', name: 'Guatemala' },
            { code: '+504', country: 'HN', flag: '🇭🇳', name: 'Honduras' },
            { code: '+852', country: 'HK', flag: '🇭🇰', name: 'Hong Kong' },
            { code: '+36', country: 'HU', flag: '🇭🇺', name: 'Hungary' },
            { code: '+354', country: 'IS', flag: '🇮🇸', name: 'Iceland' },
            { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
            { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
            { code: '+98', country: 'IR', flag: '🇮🇷', name: 'Iran' },
            { code: '+964', country: 'IQ', flag: '🇮🇶', name: 'Iraq' },
            { code: '+353', country: 'IE', flag: '🇮🇪', name: 'Ireland' },
            { code: '+972', country: 'IL', flag: '🇮🇱', name: 'Israel' },
            { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
            { code: '+1876', country: 'JM', flag: '🇯🇲', name: 'Jamaica' },
            { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
            { code: '+962', country: 'JO', flag: '🇯🇴', name: 'Jordan' },
            { code: '+7', country: 'KZ', flag: '🇰🇿', name: 'Kazakhstan' },
            { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
            { code: '+965', country: 'KW', flag: '🇰🇼', name: 'Kuwait' },
            { code: '+996', country: 'KG', flag: '🇰🇬', name: 'Kyrgyzstan' },
            { code: '+856', country: 'LA', flag: '🇱🇦', name: 'Laos' },
            { code: '+371', country: 'LV', flag: '🇱🇻', name: 'Latvia' },
            { code: '+961', country: 'LB', flag: '🇱🇧', name: 'Lebanon' },
            { code: '+218', country: 'LY', flag: '🇱🇾', name: 'Libya' },
            { code: '+423', country: 'LI', flag: '🇱🇮', name: 'Liechtenstein' },
            { code: '+370', country: 'LT', flag: '🇱🇹', name: 'Lithuania' },
            { code: '+352', country: 'LU', flag: '🇱🇺', name: 'Luxembourg' },
            { code: '+853', country: 'MO', flag: '🇲🇴', name: 'Macau' },
            { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
            { code: '+960', country: 'MV', flag: '🇲🇻', name: 'Maldives' },
            { code: '+356', country: 'MT', flag: '🇲🇹', name: 'Malta' },
            { code: '+230', country: 'MU', flag: '🇲🇺', name: 'Mauritius' },
            { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
            { code: '+373', country: 'MD', flag: '🇲🇩', name: 'Moldova' },
            { code: '+377', country: 'MC', flag: '🇲🇨', name: 'Monaco' },
            { code: '+976', country: 'MN', flag: '🇲🇳', name: 'Mongolia' },
            { code: '+382', country: 'ME', flag: '🇲🇪', name: 'Montenegro' },
            { code: '+212', country: 'MA', flag: '🇲🇦', name: 'Morocco' },
            { code: '+258', country: 'MZ', flag: '🇲🇿', name: 'Mozambique' },
            { code: '+95', country: 'MM', flag: '🇲🇲', name: 'Myanmar' },
            { code: '+264', country: 'NA', flag: '🇳🇦', name: 'Namibia' },
            { code: '+977', country: 'NP', flag: '🇳🇵', name: 'Nepal' },
            { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
            { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
            { code: '+505', country: 'NI', flag: '🇳🇮', name: 'Nicaragua' },
            { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
            { code: '+389', country: 'MK', flag: '🇲🇰', name: 'North Macedonia' },
            { code: '+47', country: 'NO', flag: '🇳🇴', name: 'Norway' },
            { code: '+968', country: 'OM', flag: '🇴🇲', name: 'Oman' },
            { code: '+92', country: 'PK', flag: '🇵🇰', name: 'Pakistan' },
            { code: '+507', country: 'PA', flag: '🇵🇦', name: 'Panama' },
            { code: '+595', country: 'PY', flag: '🇵🇾', name: 'Paraguay' },
            { code: '+51', country: 'PE', flag: '🇵🇪', name: 'Peru' },
            { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
            { code: '+48', country: 'PL', flag: '🇵🇱', name: 'Poland' },
            { code: '+351', country: 'PT', flag: '🇵🇹', name: 'Portugal' },
            { code: '+1787', country: 'PR', flag: '🇵🇷', name: 'Puerto Rico' },
            { code: '+974', country: 'QA', flag: '🇶🇦', name: 'Qatar' },
            { code: '+40', country: 'RO', flag: '🇷🇴', name: 'Romania' },
            { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
            { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
            { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Senegal' },
            { code: '+381', country: 'RS', flag: '🇷🇸', name: 'Serbia' },
            { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
            { code: '+421', country: 'SK', flag: '🇸🇰', name: 'Slovakia' },
            { code: '+386', country: 'SI', flag: '🇸🇮', name: 'Slovenia' },
            { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
            { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
            { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
            { code: '+94', country: 'LK', flag: '🇱🇰', name: 'Sri Lanka' },
            { code: '+46', country: 'SE', flag: '🇸🇪', name: 'Sweden' },
            { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
            { code: '+886', country: 'TW', flag: '🇹🇼', name: 'Taiwan' },
            { code: '+992', country: 'TJ', flag: '🇹🇯', name: 'Tajikistan' },
            { code: '+255', country: 'TZ', flag: '🇹🇿', name: 'Tanzania' },
            { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
            { code: '+216', country: 'TN', flag: '🇹🇳', name: 'Tunisia' },
            { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
            { code: '+993', country: 'TM', flag: '🇹🇲', name: 'Turkmenistan' },
            { code: '+256', country: 'UG', flag: '🇺🇬', name: 'Uganda' },
            { code: '+380', country: 'UA', flag: '🇺🇦', name: 'Ukraine' },
            { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
            { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
            { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
            { code: '+598', country: 'UY', flag: '🇺🇾', name: 'Uruguay' },
            { code: '+998', country: 'UZ', flag: '🇺🇿', name: 'Uzbekistan' },
            { code: '+58', country: 'VE', flag: '🇻🇪', name: 'Venezuela' },
            { code: '+84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
            { code: '+967', country: 'YE', flag: '🇾🇪', name: 'Yemen' },
            { code: '+260', country: 'ZM', flag: '🇿🇲', name: 'Zambia' },
            { code: '+263', country: 'ZW', flag: '🇿🇼', name: 'Zimbabwe' }
        ];

        // Popular countries to show at top
        this.popularCountries = ['ES', 'GB', 'DE', 'FR', 'NL', 'BE', 'US', 'AE', 'CH', 'SE'];

        this.render();
        this.bindEvents();
        this.detectCountry();
    }

    /**
     * Auto-detect user's country from browser timezone (same as old widget)
     */
    detectCountry() {
        if (!this.countryBtn || !this.countryCodeInput) return;

        // Map timezone to dial code (same as old widget)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timezoneToDialCode = {
            'Europe/Madrid': '+34',
            'Europe/London': '+44',
            'Europe/Berlin': '+49',
            'Europe/Paris': '+33',
            'Europe/Amsterdam': '+31',
            'Europe/Brussels': '+32',
            'Europe/Stockholm': '+46',
            'Europe/Oslo': '+47',
            'Europe/Copenhagen': '+45',
            'Europe/Helsinki': '+358',
            'Europe/Zurich': '+41',
            'Europe/Vienna': '+43',
            'Europe/Rome': '+39',
            'Europe/Lisbon': '+351',
            'Europe/Dublin': '+353',
            'Europe/Warsaw': '+48',
            'Europe/Prague': '+420',
            'Europe/Athens': '+30',
            'Europe/Moscow': '+7',
            'America/New_York': '+1',
            'America/Los_Angeles': '+1',
            'America/Chicago': '+1',
            'America/Toronto': '+1',
            'America/Mexico_City': '+52',
            'America/Sao_Paulo': '+55',
            'Asia/Dubai': '+971',
            'Asia/Riyadh': '+966',
            'Asia/Shanghai': '+86',
            'Asia/Tokyo': '+81',
            'Asia/Singapore': '+65',
            'Asia/Hong_Kong': '+852',
            'Asia/Kolkata': '+91',
            'Australia/Sydney': '+61',
            'Pacific/Auckland': '+64',
            'Africa/Johannesburg': '+27'
        };

        const detectedDialCode = timezoneToDialCode[timezone];
        if (detectedDialCode) {
            const found = this.countryCodes.find(c => c.code === detectedDialCode);
            if (found) {
                this.setCountry(found);
            }
        }
    }

    /**
     * Set the selected country
     */
    setCountry(country) {
        if (!this.countryCodeInput || !this.countryBtn) return;

        this.countryCodeInput.value = country.code;
        this.countryBtn.querySelector('.rs-detail-inquiry__country-flag').textContent = country.flag;
        this.countryBtn.querySelector('.rs-detail-inquiry__country-code').textContent = country.code;
    }

    render() {
        this.element.classList.add('rs-detail-inquiry');

        const config = RealtySoftState.get('config') || {};
        const privacyUrl = config.privacyPolicyUrl || '/privacy';
        const defaultCountry = config.defaultCountryCode || '+34';

        // Configurable thank you message and redirect
        this.thankYouMessage = config.inquiryThankYouMessage || this.label('inquiry_success');
        this.thankYouRedirect = config.inquiryThankYouUrl || null;

        this.element.innerHTML = `
            <h3 class="rs-detail-inquiry__title">${this.label('detail_contact')}</h3>
            <form class="rs-detail-inquiry__form">
                <div class="rs-detail-inquiry__row">
                    <div class="rs-detail-inquiry__field rs-detail-inquiry__field--half">
                        <label class="rs-detail-inquiry__label" for="rs-inquiry-firstname">${this.label('inquiry_first_name')} *</label>
                        <input type="text"
                               id="rs-inquiry-firstname"
                               name="first_name"
                               class="rs-detail-inquiry__input"
                               autocomplete="given-name"
                               required>
                    </div>

                    <div class="rs-detail-inquiry__field rs-detail-inquiry__field--half">
                        <label class="rs-detail-inquiry__label" for="rs-inquiry-lastname">${this.label('inquiry_last_name')} *</label>
                        <input type="text"
                               id="rs-inquiry-lastname"
                               name="last_name"
                               class="rs-detail-inquiry__input"
                               autocomplete="family-name"
                               required>
                    </div>
                </div>

                <div class="rs-detail-inquiry__field">
                    <label class="rs-detail-inquiry__label" for="rs-inquiry-email">${this.label('inquiry_email')} *</label>
                    <input type="email"
                           id="rs-inquiry-email"
                           name="email"
                           class="rs-detail-inquiry__input"
                           autocomplete="email"
                           required>
                </div>

                <div class="rs-detail-inquiry__field">
                    <label class="rs-detail-inquiry__label" for="rs-inquiry-phone">${this.label('inquiry_phone')}</label>
                    <div class="rs-detail-inquiry__phone-group">
                        <div class="rs-detail-inquiry__country-select">
                            <button type="button" class="rs-detail-inquiry__country-btn">
                                <span class="rs-detail-inquiry__country-flag">${this.getFlag(defaultCountry)}</span>
                                <span class="rs-detail-inquiry__country-code">${defaultCountry}</span>
                                <svg class="rs-detail-inquiry__country-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <input type="hidden" name="country_code" value="${defaultCountry}">
                            <div class="rs-detail-inquiry__country-dropdown" style="display: none;">
                                <div class="rs-detail-inquiry__country-search">
                                    <input type="text"
                                           class="rs-detail-inquiry__country-search-input"
                                           placeholder="Search country...">
                                </div>
                                <div class="rs-detail-inquiry__country-list">
                                    ${this.renderCountryOptions()}
                                </div>
                            </div>
                        </div>
                        <input type="tel"
                               id="rs-inquiry-phone"
                               name="phone"
                               class="rs-detail-inquiry__input rs-detail-inquiry__input--phone"
                               autocomplete="tel-national"
                               placeholder="600 000 000">
                    </div>
                </div>

                <div class="rs-detail-inquiry__field">
                    <label class="rs-detail-inquiry__label" for="rs-inquiry-message">${this.label('inquiry_message')} *</label>
                    <textarea id="rs-inquiry-message"
                              name="message"
                              class="rs-detail-inquiry__textarea"
                              rows="4"
                              required>${this.getDefaultMessage()}</textarea>
                </div>

                <div class="rs-detail-inquiry__field rs-detail-inquiry__field--checkbox">
                    <label class="rs-detail-inquiry__checkbox-label">
                        <input type="checkbox"
                               name="privacy"
                               class="rs-detail-inquiry__checkbox"
                               required>
                        <span class="rs-detail-inquiry__checkbox-text">
                            ${this.label('inquiry_privacy_accept')}
                            <a href="${privacyUrl}" target="_blank" rel="noopener">${this.label('inquiry_privacy_policy')}</a>
                        </span>
                    </label>
                </div>

                <div class="rs-detail-inquiry__error" style="display: none;"></div>

                <button type="submit" class="rs-detail-inquiry__submit">
                    <span class="rs-detail-inquiry__submit-text">${this.label('inquiry_submit')}</span>
                    <span class="rs-detail-inquiry__submit-loader" style="display: none;">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    </span>
                </button>
            </form>
            <div class="rs-detail-inquiry__success" style="display: none;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span class="rs-detail-inquiry__success-message">${this.thankYouMessage}</span>
            </div>
        `;

        this.form = this.element.querySelector('.rs-detail-inquiry__form');
        this.submitBtn = this.element.querySelector('.rs-detail-inquiry__submit');
        this.submitText = this.element.querySelector('.rs-detail-inquiry__submit-text');
        this.submitLoader = this.element.querySelector('.rs-detail-inquiry__submit-loader');
        this.errorDiv = this.element.querySelector('.rs-detail-inquiry__error');
        this.successDiv = this.element.querySelector('.rs-detail-inquiry__success');
        this.countryBtn = this.element.querySelector('.rs-detail-inquiry__country-btn');
        this.countryDropdown = this.element.querySelector('.rs-detail-inquiry__country-dropdown');
        this.countryCodeInput = this.element.querySelector('input[name="country_code"]');
        this.countrySearch = this.element.querySelector('.rs-detail-inquiry__country-search-input');
        this.countryList = this.element.querySelector('.rs-detail-inquiry__country-list');
    }

    /**
     * Render country options with popular countries at top
     */
    renderCountryOptions(filter = '') {
        const filterLower = filter.toLowerCase();

        // Get popular countries
        const popular = this.popularCountries
            .map(code => this.countryCodes.find(c => c.country === code))
            .filter(Boolean);

        // Get all other countries
        const others = this.countryCodes.filter(c => !this.popularCountries.includes(c.country));

        // Filter if search term provided
        const filterCountry = (c) => {
            if (!filter) return true;
            return c.name.toLowerCase().includes(filterLower) ||
                   c.code.includes(filter) ||
                   c.country.toLowerCase().includes(filterLower);
        };

        const filteredPopular = popular.filter(filterCountry);
        const filteredOthers = others.filter(filterCountry);

        let html = '';

        // Popular section
        if (filteredPopular.length > 0 && !filter) {
            html += `<div class="rs-detail-inquiry__country-section">
                <div class="rs-detail-inquiry__country-section-title">Popular</div>
                ${filteredPopular.map(c => this.renderCountryOption(c)).join('')}
            </div>`;
        }

        // All countries section
        const allCountries = filter ? [...filteredPopular, ...filteredOthers] : filteredOthers;
        if (allCountries.length > 0) {
            if (!filter) {
                html += `<div class="rs-detail-inquiry__country-section">
                    <div class="rs-detail-inquiry__country-section-title">All Countries</div>
                    ${allCountries.map(c => this.renderCountryOption(c)).join('')}
                </div>`;
            } else {
                html += allCountries.map(c => this.renderCountryOption(c)).join('');
            }
        }

        if (!html) {
            html = `<div class="rs-detail-inquiry__country-empty">No country found</div>`;
        }

        return html;
    }

    renderCountryOption(c) {
        return `<button type="button"
                        class="rs-detail-inquiry__country-option"
                        data-code="${c.code}"
                        data-flag="${c.flag}"
                        data-country="${c.country}">
                    <span class="rs-detail-inquiry__country-flag">${c.flag}</span>
                    <span class="rs-detail-inquiry__country-name">${c.name}</span>
                    <span class="rs-detail-inquiry__country-code">${c.code}</span>
                </button>`;
    }

    getFlag(code) {
        const country = this.countryCodes.find(c => c.code === code);
        return country ? country.flag : '🌍';
    }

    getDefaultMessage() {
        const p = this.property;
        if (!p) return '';
        const title = p.title || 'this property';
        const ref = p.ref ? ` (Ref: ${p.ref})` : '';
        return `I am interested in the property "${title}"${ref}. Please contact me with more information.`;
    }

    bindEvents() {
        // Form submit
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (this.submitting || this.submitted) return;

            await this.submitForm();
        });

        // Country code dropdown toggle
        this.countryBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = this.countryDropdown.style.display !== 'none';
            if (isOpen) {
                this.closeCountryDropdown();
            } else {
                this.openCountryDropdown();
            }
        });

        // Country search input
        this.countrySearch?.addEventListener('input', (e) => {
            const filter = e.target.value.trim();
            this.countryList.innerHTML = this.renderCountryOptions(filter);
            this.bindCountryOptions();
        });

        // Prevent dropdown close when clicking inside
        this.countryDropdown?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Bind initial country options
        this.bindCountryOptions();

        // Close dropdown on outside click
        document.addEventListener('click', () => {
            this.closeCountryDropdown();
        });
    }

    openCountryDropdown() {
        if (!this.countryDropdown) return;
        this.countryDropdown.style.display = 'block';
        // Reset search and focus
        if (this.countrySearch) {
            this.countrySearch.value = '';
            this.countryList.innerHTML = this.renderCountryOptions('');
            this.bindCountryOptions();
            setTimeout(() => this.countrySearch.focus(), 10);
        }
    }

    closeCountryDropdown() {
        if (this.countryDropdown) {
            this.countryDropdown.style.display = 'none';
        }
    }

    bindCountryOptions() {
        this.countryList?.querySelectorAll('.rs-detail-inquiry__country-option').forEach(option => {
            option.addEventListener('click', () => {
                const code = option.dataset.code;
                const flag = option.dataset.flag;

                this.countryCodeInput.value = code;
                this.countryBtn.querySelector('.rs-detail-inquiry__country-flag').textContent = flag;
                this.countryBtn.querySelector('.rs-detail-inquiry__country-code').textContent = code;
                this.closeCountryDropdown();
            });
        });
    }

    async submitForm() {
        this.submitting = true;
        this.showLoading();
        this.hideError();

        const formData = new FormData(this.form);
        const firstName = formData.get('first_name');
        const lastName = formData.get('last_name');
        const countryCode = formData.get('country_code') || '';
        const phone = formData.get('phone') || '';
        const fullPhone = phone ? `${countryCode} ${phone}` : '';

        // Get owner email from config
        const config = RealtySoftState.get('config') || {};
        const ownerEmail = config.ownerEmail || this.property?.agent?.email || null;

        // Send data in camelCase format (compatible with old widget PHP)
        const data = {
            firstName: firstName,
            lastName: lastName,
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            countryCode: countryCode,
            message: formData.get('message'),
            propertyId: this.property.id,
            propertyRef: this.property.ref,
            propertyTitle: this.property.title,
            propertyUrl: window.location.href,
            propertyPrice: this.property.price ? RealtySoftLabels.formatPrice(this.property.price) : '',
            ownerEmail: ownerEmail,
            sendConfirmation: config.sendConfirmationEmail !== false, // Send confirmation to inquirer (default: true)
            language: RealtySoftLabels.getLanguage()
        };

        try {
            await RealtySoftAPI.submitInquiry(data);

            this.submitted = true;
            this.showSuccess();
            this.form.reset();

            // Track inquiry
            RealtySoftAnalytics.trackInquiry(this.property.id, this.property.ref);

        } catch (error) {
            console.error('Inquiry submission failed:', error);
            // Show actual error message from server for debugging
            const errorMsg = error.message || this.label('inquiry_error');
            this.showError(errorMsg);
        } finally {
            this.submitting = false;
            this.hideLoading();
        }
    }

    showLoading() {
        this.submitBtn.disabled = true;
        this.submitText.style.display = 'none';
        this.submitLoader.style.display = 'inline-block';
    }

    hideLoading() {
        this.submitBtn.disabled = false;
        this.submitText.style.display = 'inline';
        this.submitLoader.style.display = 'none';
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
    }

    hideError() {
        this.errorDiv.style.display = 'none';
    }

    showSuccess() {
        // Hide form, show success message
        this.form.style.display = 'none';
        this.successDiv.style.display = 'flex';

        // If redirect URL is configured, redirect after a short delay
        if (this.thankYouRedirect) {
            setTimeout(() => {
                window.location.href = this.thankYouRedirect;
            }, 1000);
        }
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
