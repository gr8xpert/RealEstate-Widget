/**
 * RealtySoft Widget v3 - Detail Inquiry Form Component
 * Contact form for property inquiries with country code selector
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  Property,
  RealtySoftStateModule,
  RealtySoftLabelsModule,
  RealtySoftAPIModule,
  RealtySoftAnalyticsModule,
  WidgetConfig
} from '../../types/index';

// Declare globals
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftAPI: RealtySoftAPIModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;

interface CountryCode {
  code: string;
  country: string;
  flag: string;
  name: string;
}

class RSDetailInquiryForm extends RSBaseComponent {
  private property: Property | null = null;
  private submitting: boolean = false;
  private submitted: boolean = false;
  private hasInitiallyRendered: boolean = false;
  private lastDefaultMessage: string = '';
  private countryCodes: CountryCode[] = [];
  private popularCountries: string[] = [];
  private form: HTMLFormElement | null = null;
  private submitBtn: HTMLButtonElement | null = null;
  private submitText: HTMLElement | null = null;
  private submitLoader: HTMLElement | null = null;
  private errorDiv: HTMLElement | null = null;
  private successDiv: HTMLElement | null = null;
  private countryBtn: HTMLButtonElement | null = null;
  private countryDropdown: HTMLElement | null = null;
  private countryCodeInput: HTMLInputElement | null = null;
  private countrySearch: HTMLInputElement | null = null;
  private countryList: HTMLElement | null = null;
  private thankYouMessage: string = '';
  private thankYouRedirect: string | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    // Get property from options (set before super() calls init())
    this.property = this.options?.property as Property | null;

    // Don't render if no property data
    if (!this.property) {
      console.warn('[RealtySoft] Inquiry form: No property data available');
      return;
    }

    this.submitting = false;
    this.submitted = false;

    // Complete list of country codes (sorted by name)
    this.countryCodes = [
      { code: '+93', country: 'AF', flag: '\u{1F1E6}\u{1F1EB}', name: 'Afghanistan' },
      { code: '+355', country: 'AL', flag: '\u{1F1E6}\u{1F1F1}', name: 'Albania' },
      { code: '+213', country: 'DZ', flag: '\u{1F1E9}\u{1F1FF}', name: 'Algeria' },
      { code: '+376', country: 'AD', flag: '\u{1F1E6}\u{1F1E9}', name: 'Andorra' },
      { code: '+244', country: 'AO', flag: '\u{1F1E6}\u{1F1F4}', name: 'Angola' },
      { code: '+54', country: 'AR', flag: '\u{1F1E6}\u{1F1F7}', name: 'Argentina' },
      { code: '+374', country: 'AM', flag: '\u{1F1E6}\u{1F1F2}', name: 'Armenia' },
      { code: '+61', country: 'AU', flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia' },
      { code: '+43', country: 'AT', flag: '\u{1F1E6}\u{1F1F9}', name: 'Austria' },
      { code: '+994', country: 'AZ', flag: '\u{1F1E6}\u{1F1FF}', name: 'Azerbaijan' },
      { code: '+973', country: 'BH', flag: '\u{1F1E7}\u{1F1ED}', name: 'Bahrain' },
      { code: '+880', country: 'BD', flag: '\u{1F1E7}\u{1F1E9}', name: 'Bangladesh' },
      { code: '+375', country: 'BY', flag: '\u{1F1E7}\u{1F1FE}', name: 'Belarus' },
      { code: '+32', country: 'BE', flag: '\u{1F1E7}\u{1F1EA}', name: 'Belgium' },
      { code: '+501', country: 'BZ', flag: '\u{1F1E7}\u{1F1FF}', name: 'Belize' },
      { code: '+229', country: 'BJ', flag: '\u{1F1E7}\u{1F1EF}', name: 'Benin' },
      { code: '+975', country: 'BT', flag: '\u{1F1E7}\u{1F1F9}', name: 'Bhutan' },
      { code: '+591', country: 'BO', flag: '\u{1F1E7}\u{1F1F4}', name: 'Bolivia' },
      { code: '+387', country: 'BA', flag: '\u{1F1E7}\u{1F1E6}', name: 'Bosnia' },
      { code: '+267', country: 'BW', flag: '\u{1F1E7}\u{1F1FC}', name: 'Botswana' },
      { code: '+55', country: 'BR', flag: '\u{1F1E7}\u{1F1F7}', name: 'Brazil' },
      { code: '+673', country: 'BN', flag: '\u{1F1E7}\u{1F1F3}', name: 'Brunei' },
      { code: '+359', country: 'BG', flag: '\u{1F1E7}\u{1F1EC}', name: 'Bulgaria' },
      { code: '+855', country: 'KH', flag: '\u{1F1F0}\u{1F1ED}', name: 'Cambodia' },
      { code: '+237', country: 'CM', flag: '\u{1F1E8}\u{1F1F2}', name: 'Cameroon' },
      { code: '+1', country: 'CA', flag: '\u{1F1E8}\u{1F1E6}', name: 'Canada' },
      { code: '+56', country: 'CL', flag: '\u{1F1E8}\u{1F1F1}', name: 'Chile' },
      { code: '+86', country: 'CN', flag: '\u{1F1E8}\u{1F1F3}', name: 'China' },
      { code: '+57', country: 'CO', flag: '\u{1F1E8}\u{1F1F4}', name: 'Colombia' },
      { code: '+506', country: 'CR', flag: '\u{1F1E8}\u{1F1F7}', name: 'Costa Rica' },
      { code: '+385', country: 'HR', flag: '\u{1F1ED}\u{1F1F7}', name: 'Croatia' },
      { code: '+53', country: 'CU', flag: '\u{1F1E8}\u{1F1FA}', name: 'Cuba' },
      { code: '+357', country: 'CY', flag: '\u{1F1E8}\u{1F1FE}', name: 'Cyprus' },
      { code: '+420', country: 'CZ', flag: '\u{1F1E8}\u{1F1FF}', name: 'Czech Republic' },
      { code: '+45', country: 'DK', flag: '\u{1F1E9}\u{1F1F0}', name: 'Denmark' },
      { code: '+253', country: 'DJ', flag: '\u{1F1E9}\u{1F1EF}', name: 'Djibouti' },
      { code: '+593', country: 'EC', flag: '\u{1F1EA}\u{1F1E8}', name: 'Ecuador' },
      { code: '+20', country: 'EG', flag: '\u{1F1EA}\u{1F1EC}', name: 'Egypt' },
      { code: '+503', country: 'SV', flag: '\u{1F1F8}\u{1F1FB}', name: 'El Salvador' },
      { code: '+372', country: 'EE', flag: '\u{1F1EA}\u{1F1EA}', name: 'Estonia' },
      { code: '+251', country: 'ET', flag: '\u{1F1EA}\u{1F1F9}', name: 'Ethiopia' },
      { code: '+679', country: 'FJ', flag: '\u{1F1EB}\u{1F1EF}', name: 'Fiji' },
      { code: '+358', country: 'FI', flag: '\u{1F1EB}\u{1F1EE}', name: 'Finland' },
      { code: '+33', country: 'FR', flag: '\u{1F1EB}\u{1F1F7}', name: 'France' },
      { code: '+995', country: 'GE', flag: '\u{1F1EC}\u{1F1EA}', name: 'Georgia' },
      { code: '+49', country: 'DE', flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany' },
      { code: '+233', country: 'GH', flag: '\u{1F1EC}\u{1F1ED}', name: 'Ghana' },
      { code: '+30', country: 'GR', flag: '\u{1F1EC}\u{1F1F7}', name: 'Greece' },
      { code: '+502', country: 'GT', flag: '\u{1F1EC}\u{1F1F9}', name: 'Guatemala' },
      { code: '+504', country: 'HN', flag: '\u{1F1ED}\u{1F1F3}', name: 'Honduras' },
      { code: '+852', country: 'HK', flag: '\u{1F1ED}\u{1F1F0}', name: 'Hong Kong' },
      { code: '+36', country: 'HU', flag: '\u{1F1ED}\u{1F1FA}', name: 'Hungary' },
      { code: '+354', country: 'IS', flag: '\u{1F1EE}\u{1F1F8}', name: 'Iceland' },
      { code: '+91', country: 'IN', flag: '\u{1F1EE}\u{1F1F3}', name: 'India' },
      { code: '+62', country: 'ID', flag: '\u{1F1EE}\u{1F1E9}', name: 'Indonesia' },
      { code: '+98', country: 'IR', flag: '\u{1F1EE}\u{1F1F7}', name: 'Iran' },
      { code: '+964', country: 'IQ', flag: '\u{1F1EE}\u{1F1F6}', name: 'Iraq' },
      { code: '+353', country: 'IE', flag: '\u{1F1EE}\u{1F1EA}', name: 'Ireland' },
      { code: '+972', country: 'IL', flag: '\u{1F1EE}\u{1F1F1}', name: 'Israel' },
      { code: '+39', country: 'IT', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italy' },
      { code: '+1876', country: 'JM', flag: '\u{1F1EF}\u{1F1F2}', name: 'Jamaica' },
      { code: '+81', country: 'JP', flag: '\u{1F1EF}\u{1F1F5}', name: 'Japan' },
      { code: '+962', country: 'JO', flag: '\u{1F1EF}\u{1F1F4}', name: 'Jordan' },
      { code: '+7', country: 'KZ', flag: '\u{1F1F0}\u{1F1FF}', name: 'Kazakhstan' },
      { code: '+254', country: 'KE', flag: '\u{1F1F0}\u{1F1EA}', name: 'Kenya' },
      { code: '+965', country: 'KW', flag: '\u{1F1F0}\u{1F1FC}', name: 'Kuwait' },
      { code: '+996', country: 'KG', flag: '\u{1F1F0}\u{1F1EC}', name: 'Kyrgyzstan' },
      { code: '+856', country: 'LA', flag: '\u{1F1F1}\u{1F1E6}', name: 'Laos' },
      { code: '+371', country: 'LV', flag: '\u{1F1F1}\u{1F1FB}', name: 'Latvia' },
      { code: '+961', country: 'LB', flag: '\u{1F1F1}\u{1F1E7}', name: 'Lebanon' },
      { code: '+218', country: 'LY', flag: '\u{1F1F1}\u{1F1FE}', name: 'Libya' },
      { code: '+423', country: 'LI', flag: '\u{1F1F1}\u{1F1EE}', name: 'Liechtenstein' },
      { code: '+370', country: 'LT', flag: '\u{1F1F1}\u{1F1F9}', name: 'Lithuania' },
      { code: '+352', country: 'LU', flag: '\u{1F1F1}\u{1F1FA}', name: 'Luxembourg' },
      { code: '+853', country: 'MO', flag: '\u{1F1F2}\u{1F1F4}', name: 'Macau' },
      { code: '+60', country: 'MY', flag: '\u{1F1F2}\u{1F1FE}', name: 'Malaysia' },
      { code: '+960', country: 'MV', flag: '\u{1F1F2}\u{1F1FB}', name: 'Maldives' },
      { code: '+356', country: 'MT', flag: '\u{1F1F2}\u{1F1F9}', name: 'Malta' },
      { code: '+230', country: 'MU', flag: '\u{1F1F2}\u{1F1FA}', name: 'Mauritius' },
      { code: '+52', country: 'MX', flag: '\u{1F1F2}\u{1F1FD}', name: 'Mexico' },
      { code: '+373', country: 'MD', flag: '\u{1F1F2}\u{1F1E9}', name: 'Moldova' },
      { code: '+377', country: 'MC', flag: '\u{1F1F2}\u{1F1E8}', name: 'Monaco' },
      { code: '+976', country: 'MN', flag: '\u{1F1F2}\u{1F1F3}', name: 'Mongolia' },
      { code: '+382', country: 'ME', flag: '\u{1F1F2}\u{1F1EA}', name: 'Montenegro' },
      { code: '+212', country: 'MA', flag: '\u{1F1F2}\u{1F1E6}', name: 'Morocco' },
      { code: '+258', country: 'MZ', flag: '\u{1F1F2}\u{1F1FF}', name: 'Mozambique' },
      { code: '+95', country: 'MM', flag: '\u{1F1F2}\u{1F1F2}', name: 'Myanmar' },
      { code: '+264', country: 'NA', flag: '\u{1F1F3}\u{1F1E6}', name: 'Namibia' },
      { code: '+977', country: 'NP', flag: '\u{1F1F3}\u{1F1F5}', name: 'Nepal' },
      { code: '+31', country: 'NL', flag: '\u{1F1F3}\u{1F1F1}', name: 'Netherlands' },
      { code: '+64', country: 'NZ', flag: '\u{1F1F3}\u{1F1FF}', name: 'New Zealand' },
      { code: '+505', country: 'NI', flag: '\u{1F1F3}\u{1F1EE}', name: 'Nicaragua' },
      { code: '+234', country: 'NG', flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria' },
      { code: '+389', country: 'MK', flag: '\u{1F1F2}\u{1F1F0}', name: 'North Macedonia' },
      { code: '+47', country: 'NO', flag: '\u{1F1F3}\u{1F1F4}', name: 'Norway' },
      { code: '+968', country: 'OM', flag: '\u{1F1F4}\u{1F1F2}', name: 'Oman' },
      { code: '+92', country: 'PK', flag: '\u{1F1F5}\u{1F1F0}', name: 'Pakistan' },
      { code: '+507', country: 'PA', flag: '\u{1F1F5}\u{1F1E6}', name: 'Panama' },
      { code: '+595', country: 'PY', flag: '\u{1F1F5}\u{1F1FE}', name: 'Paraguay' },
      { code: '+51', country: 'PE', flag: '\u{1F1F5}\u{1F1EA}', name: 'Peru' },
      { code: '+63', country: 'PH', flag: '\u{1F1F5}\u{1F1ED}', name: 'Philippines' },
      { code: '+48', country: 'PL', flag: '\u{1F1F5}\u{1F1F1}', name: 'Poland' },
      { code: '+351', country: 'PT', flag: '\u{1F1F5}\u{1F1F9}', name: 'Portugal' },
      { code: '+1787', country: 'PR', flag: '\u{1F1F5}\u{1F1F7}', name: 'Puerto Rico' },
      { code: '+974', country: 'QA', flag: '\u{1F1F6}\u{1F1E6}', name: 'Qatar' },
      { code: '+40', country: 'RO', flag: '\u{1F1F7}\u{1F1F4}', name: 'Romania' },
      { code: '+7', country: 'RU', flag: '\u{1F1F7}\u{1F1FA}', name: 'Russia' },
      { code: '+966', country: 'SA', flag: '\u{1F1F8}\u{1F1E6}', name: 'Saudi Arabia' },
      { code: '+221', country: 'SN', flag: '\u{1F1F8}\u{1F1F3}', name: 'Senegal' },
      { code: '+381', country: 'RS', flag: '\u{1F1F7}\u{1F1F8}', name: 'Serbia' },
      { code: '+65', country: 'SG', flag: '\u{1F1F8}\u{1F1EC}', name: 'Singapore' },
      { code: '+421', country: 'SK', flag: '\u{1F1F8}\u{1F1F0}', name: 'Slovakia' },
      { code: '+386', country: 'SI', flag: '\u{1F1F8}\u{1F1EE}', name: 'Slovenia' },
      { code: '+27', country: 'ZA', flag: '\u{1F1FF}\u{1F1E6}', name: 'South Africa' },
      { code: '+82', country: 'KR', flag: '\u{1F1F0}\u{1F1F7}', name: 'South Korea' },
      { code: '+34', country: 'ES', flag: '\u{1F1EA}\u{1F1F8}', name: 'Spain' },
      { code: '+94', country: 'LK', flag: '\u{1F1F1}\u{1F1F0}', name: 'Sri Lanka' },
      { code: '+46', country: 'SE', flag: '\u{1F1F8}\u{1F1EA}', name: 'Sweden' },
      { code: '+41', country: 'CH', flag: '\u{1F1E8}\u{1F1ED}', name: 'Switzerland' },
      { code: '+886', country: 'TW', flag: '\u{1F1F9}\u{1F1FC}', name: 'Taiwan' },
      { code: '+992', country: 'TJ', flag: '\u{1F1F9}\u{1F1EF}', name: 'Tajikistan' },
      { code: '+255', country: 'TZ', flag: '\u{1F1F9}\u{1F1FF}', name: 'Tanzania' },
      { code: '+66', country: 'TH', flag: '\u{1F1F9}\u{1F1ED}', name: 'Thailand' },
      { code: '+216', country: 'TN', flag: '\u{1F1F9}\u{1F1F3}', name: 'Tunisia' },
      { code: '+90', country: 'TR', flag: '\u{1F1F9}\u{1F1F7}', name: 'Turkey' },
      { code: '+993', country: 'TM', flag: '\u{1F1F9}\u{1F1F2}', name: 'Turkmenistan' },
      { code: '+256', country: 'UG', flag: '\u{1F1FA}\u{1F1EC}', name: 'Uganda' },
      { code: '+380', country: 'UA', flag: '\u{1F1FA}\u{1F1E6}', name: 'Ukraine' },
      { code: '+971', country: 'AE', flag: '\u{1F1E6}\u{1F1EA}', name: 'UAE' },
      { code: '+44', country: 'GB', flag: '\u{1F1EC}\u{1F1E7}', name: 'United Kingdom' },
      { code: '+1', country: 'US', flag: '\u{1F1FA}\u{1F1F8}', name: 'United States' },
      { code: '+598', country: 'UY', flag: '\u{1F1FA}\u{1F1FE}', name: 'Uruguay' },
      { code: '+998', country: 'UZ', flag: '\u{1F1FA}\u{1F1FF}', name: 'Uzbekistan' },
      { code: '+58', country: 'VE', flag: '\u{1F1FB}\u{1F1EA}', name: 'Venezuela' },
      { code: '+84', country: 'VN', flag: '\u{1F1FB}\u{1F1F3}', name: 'Vietnam' },
      { code: '+967', country: 'YE', flag: '\u{1F1FE}\u{1F1EA}', name: 'Yemen' },
      { code: '+260', country: 'ZM', flag: '\u{1F1FF}\u{1F1F2}', name: 'Zambia' },
      { code: '+263', country: 'ZW', flag: '\u{1F1FF}\u{1F1FC}', name: 'Zimbabwe' }
    ];

    // Popular countries to show at top
    this.popularCountries = ['ES', 'GB', 'DE', 'FR', 'NL', 'BE', 'US', 'AE', 'CH', 'SE'];

    this.render();
    this.bindEvents();
    this.detectCountry();

    // Listen for language changes to update labels
    this.subscribe('config.language', () => {
      this.updateLabelsInPlace();
    });
  }

  /**
   * Auto-detect user's country from browser timezone
   */
  private detectCountry(): void {
    if (!this.countryBtn || !this.countryCodeInput) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToDialCode: Record<string, string> = {
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
  private setCountry(country: CountryCode): void {
    if (!this.countryCodeInput || !this.countryBtn) return;

    this.countryCodeInput.value = country.code;
    const flagEl = this.countryBtn.querySelector('.rs-detail-inquiry__country-flag');
    const codeEl = this.countryBtn.querySelector('.rs-detail-inquiry__country-code');
    if (flagEl) flagEl.textContent = country.flag;
    if (codeEl) codeEl.textContent = country.code;
  }

  render(): void {
    // If already rendered, just update labels (language change scenario)
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }

    // First-time render: build full HTML structure
    this.hasInitiallyRendered = true;

    this.element.classList.add('rs-detail-inquiry');

    const config = (RealtySoftState.get<Partial<WidgetConfig>>('config') || {}) as Partial<WidgetConfig>;
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

    // Store the initial default message for comparison on language change
    this.lastDefaultMessage = this.getDefaultMessage();
  }

  /**
   * Render country options with popular countries at top
   */
  private renderCountryOptions(filter: string = ''): string {
    const filterLower = filter.toLowerCase();

    // Get popular countries
    const popular = this.popularCountries
      .map(code => this.countryCodes.find(c => c.country === code))
      .filter((c): c is CountryCode => !!c);

    // Get all other countries
    const others = this.countryCodes.filter(c => !this.popularCountries.includes(c.country));

    // Filter if search term provided
    const filterCountry = (c: CountryCode): boolean => {
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

  private renderCountryOption(c: CountryCode): string {
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

  private getFlag(code: string): string {
    const country = this.countryCodes.find(c => c.code === code);
    return country ? country.flag : '\u{1F30D}';
  }

  private getDefaultMessage(): string {
    const p = this.property;
    if (!p) return '';
    const title = p.title || 'this property';
    const ref = p.ref ? ` (Ref: ${p.ref})` : '';

    // Try to get translated template, with safe fallback
    const labelKey = 'inquiry_default_message';
    const translatedTemplate = this.label(labelKey);

    // Only use translation if it exists and is not the key itself
    const template = (translatedTemplate && translatedTemplate !== labelKey && !translatedTemplate.includes('{%'))
      ? translatedTemplate
      : 'I am interested in the property "{title}"{ref}. Please contact me with more information.';

    return template
      .replace('{title}', title)
      .replace('{ref}', ref);
  }

  bindEvents(): void {
    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        if (this.submitting || this.submitted) return;

        await this.submitForm();
      });
    }

    // Country code dropdown toggle
    this.countryBtn?.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      if (!this.countryDropdown) return;
      const isOpen = this.countryDropdown.style.display !== 'none';
      if (isOpen) {
        this.closeCountryDropdown();
      } else {
        this.openCountryDropdown();
      }
    });

    // Country search input
    this.countrySearch?.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const filter = target.value.trim();
      if (this.countryList) {
        this.countryList.innerHTML = this.renderCountryOptions(filter);
        this.bindCountryOptions();
      }
    });

    // Prevent dropdown close when clicking inside
    this.countryDropdown?.addEventListener('click', (e: Event) => {
      e.stopPropagation();
    });

    // Bind initial country options
    this.bindCountryOptions();

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      this.closeCountryDropdown();
    });
  }

  private openCountryDropdown(): void {
    if (!this.countryDropdown) return;
    this.countryDropdown.style.display = 'block';
    // Reset search and focus
    if (this.countrySearch && this.countryList) {
      this.countrySearch.value = '';
      this.countryList.innerHTML = this.renderCountryOptions('');
      this.bindCountryOptions();
      setTimeout(() => this.countrySearch!.focus(), 10);
    }
  }

  private closeCountryDropdown(): void {
    if (this.countryDropdown) {
      this.countryDropdown.style.display = 'none';
    }
  }

  private bindCountryOptions(): void {
    this.countryList?.querySelectorAll<HTMLButtonElement>('.rs-detail-inquiry__country-option').forEach(option => {
      option.addEventListener('click', () => {
        const code = option.dataset.code || '';
        const flag = option.dataset.flag || '';

        if (this.countryCodeInput) this.countryCodeInput.value = code;
        if (this.countryBtn) {
          const flagEl = this.countryBtn.querySelector('.rs-detail-inquiry__country-flag');
          const codeEl = this.countryBtn.querySelector('.rs-detail-inquiry__country-code');
          if (flagEl) flagEl.textContent = flag;
          if (codeEl) codeEl.textContent = code;
        }
        this.closeCountryDropdown();
      });
    });
  }

  private async submitForm(): Promise<void> {
    if (!this.form || !this.property) return;

    this.submitting = true;
    this.showLoading();
    this.hideError();

    const formData = new FormData(this.form);
    const countryCode = (formData.get('country_code') as string) || '';
    const phone = (formData.get('phone') as string) || '';

    // Get owner email from config
    const config = (RealtySoftState.get<Partial<WidgetConfig>>('config') || {}) as Record<string, unknown>;
    const ownerEmail = (config.ownerEmail as string) || this.property.agent?.email || '';

    // Send data in camelCase format (compatible with old widget PHP)
    const data = {
      firstName: formData.get('first_name') as string,
      lastName: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: phone,
      countryCode: countryCode,
      message: formData.get('message') as string,
      propertyId: this.property.id,
      propertyRef: this.property.ref,
      propertyTitle: this.property.title,
      propertyUrl: window.location.href,
      propertyPrice: this.property.price ? RealtySoftLabels.formatPrice(this.property.price) : '',
      ownerEmail: ownerEmail,
      sendConfirmation: (config.sendConfirmationEmail as boolean) !== false,
      language: RealtySoftLabels.getLanguage(),
      privacyAccepted: true
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
      const errorMsg = (error as Error).message || this.label('inquiry_error');
      this.showError(errorMsg);
    } finally {
      this.submitting = false;
      this.hideLoading();
    }
  }

  private showLoading(): void {
    if (this.submitBtn) this.submitBtn.disabled = true;
    if (this.submitText) this.submitText.style.display = 'none';
    if (this.submitLoader) this.submitLoader.style.display = 'inline-block';
  }

  private hideLoading(): void {
    if (this.submitBtn) this.submitBtn.disabled = false;
    if (this.submitText) this.submitText.style.display = 'inline';
    if (this.submitLoader) this.submitLoader.style.display = 'none';
  }

  private showError(message: string): void {
    if (this.errorDiv) {
      this.errorDiv.textContent = message;
      this.errorDiv.style.display = 'block';
    }
  }

  private hideError(): void {
    if (this.errorDiv) this.errorDiv.style.display = 'none';
  }

  private showSuccess(): void {
    // Hide form, show success message
    if (this.form) this.form.style.display = 'none';
    if (this.successDiv) this.successDiv.style.display = 'flex';

    // If redirect URL is configured, redirect after a short delay
    if (this.thankYouRedirect) {
      setTimeout(() => {
        window.location.href = this.thankYouRedirect!;
      }, 1000);
    }
  }

  /**
   * Update only label text nodes on language change (preserves form state)
   */
  private updateLabelsInPlace(): void {
    // Don't update if form submitted (preserve success state)
    if (this.submitted) return;

    // Update title
    const title = this.element.querySelector('.rs-detail-inquiry__title');
    if (title) title.textContent = this.label('detail_contact');

    // Update field labels
    const labelMap: Record<string, string> = {
      'rs-inquiry-firstname': 'inquiry_first_name',
      'rs-inquiry-lastname': 'inquiry_last_name',
      'rs-inquiry-email': 'inquiry_email',
      'rs-inquiry-phone': 'inquiry_phone',
      'rs-inquiry-message': 'inquiry_message'
    };

    for (const [inputId, labelKey] of Object.entries(labelMap)) {
      const label = this.element.querySelector(`label[for="${inputId}"]`);
      if (label) {
        const isRequired = label.textContent?.includes('*');
        label.textContent = this.label(labelKey) + (isRequired ? ' *' : '');
      }
    }

    // Update submit button
    if (this.submitText) {
      this.submitText.textContent = this.label('inquiry_submit');
    }

    // Update privacy text (keep link structure intact)
    const privacyLabel = this.element.querySelector('.rs-detail-inquiry__checkbox-text');
    if (privacyLabel) {
      const link = privacyLabel.querySelector('a');
      if (link) {
        // Update link text
        link.textContent = this.label('inquiry_privacy_policy');
        // Update the text before the link
        const firstTextNode = privacyLabel.firstChild;
        if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
          firstTextNode.textContent = this.label('inquiry_privacy_accept') + ' ';
        }
      }
    }

    // Update textarea default message if user hasn't modified it
    const textarea = this.element.querySelector('#rs-inquiry-message') as HTMLTextAreaElement | null;
    if (textarea) {
      const currentValue = textarea.value.trim();
      const lastDefault = this.lastDefaultMessage.trim();

      // Only update if the textarea still contains the default message (not modified by user)
      if (currentValue === lastDefault || currentValue === '') {
        const newDefaultMessage = this.getDefaultMessage();
        textarea.value = newDefaultMessage;
        this.lastDefaultMessage = newDefaultMessage;
      }
    }
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailInquiryForm };
export default RSDetailInquiryForm;
