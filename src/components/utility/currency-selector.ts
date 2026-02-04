/**
 * Smart Property Widget - Currency Selector Component
 * Converts property prices to user's preferred currency
 * Uses free Frankfurter API for exchange rates
 * Caches rates in localStorage for performance
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

declare const RealtySoft: RealtySoftModule;

// Currency display names and symbols
const CURRENCY_INFO: Record<string, { name: string; symbol: string }> = {
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  USD: { name: 'US Dollar', symbol: '$' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF' },
  SEK: { name: 'Swedish Krona', symbol: 'kr' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr' },
  DKK: { name: 'Danish Krone', symbol: 'kr' },
  PLN: { name: 'Polish Zloty', symbol: 'zł' },
  CZK: { name: 'Czech Koruna', symbol: 'Kč' },
  AED: { name: 'UAE Dirham', symbol: 'AED' },
  SAR: { name: 'Saudi Riyal', symbol: 'SAR' },
  RUB: { name: 'Russian Ruble', symbol: '₽' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  ZAR: { name: 'South African Rand', symbol: 'R' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
  MXN: { name: 'Mexican Peso', symbol: '$' },
  TRY: { name: 'Turkish Lira', symbol: '₺' },
  MAD: { name: 'Moroccan Dirham', symbol: 'MAD' },
  QAR: { name: 'Qatari Riyal', symbol: 'QAR' },
  KWD: { name: 'Kuwaiti Dinar', symbol: 'KWD' },
  BHD: { name: 'Bahraini Dinar', symbol: 'BHD' },
  OMR: { name: 'Omani Rial', symbol: 'OMR' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
  THB: { name: 'Thai Baht', symbol: '฿' },
};

// Cache settings
const CACHE_KEY = 'rs_exchange_rates';
const CACHE_CURRENCY_KEY = 'rs_selected_currency';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Free API endpoint (no API key needed)
const API_URL = 'https://api.frankfurter.app/latest';

// All price selectors across the widget (listing, detail, wishlist, map, etc.)
const PRICE_SELECTOR = [
  '.rs_card_price',              // Listing card price
  '.rs-detail__price',           // Detail price (standalone component)
  '.rs-property-price',          // Generic property price
  '.rs-template__price',         // Detail page template price
  '.rs-detail-related__card-price', // Related properties on detail page
  '.rs-wishlist-card__price',    // Wishlist grid card price
  '.rs-compare-card__price',     // Wishlist compare modal price
  '.rs-map-marker__price',       // Map view marker price
  '.rs-map-popup__price',        // Map view popup price
  '[data-rs-price]'              // Any element with data-rs-price attribute
].join(', ');

interface CachedRates {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

class RSCurrencySelector extends RSBaseComponent {
  private baseCurrency: string = 'EUR';
  private selectedCurrency: string = 'EUR';
  private availableCurrencies: string[] = ['EUR', 'GBP', 'USD', 'CHF'];
  private rates: Record<string, number> = {};
  private isLoading: boolean = false;
  private select: HTMLSelectElement | null = null;
  private originalPrices: Map<HTMLElement, string> = new Map();

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  async init(): Promise<void> {
    // Get config
    const globalConfig = (window as any).RealtySoftConfig || {};

    // Check if currency converter is enabled (accept boolean true or string "true")
    const isEnabled = globalConfig.enableCurrencyConverter === true ||
                      globalConfig.enableCurrencyConverter === 'true';
    if (!isEnabled) {
      this.element.style.display = 'none';
      return;
    }

    this.baseCurrency = globalConfig.baseCurrency || 'EUR';
    this.availableCurrencies = globalConfig.availableCurrencies || ['EUR', 'GBP', 'USD', 'CHF'];

    // Ensure base currency is in available list
    if (!this.availableCurrencies.includes(this.baseCurrency)) {
      this.availableCurrencies.unshift(this.baseCurrency);
    }

    // Load saved currency preference
    this.selectedCurrency = this.loadSavedCurrency();

    // Load cached rates or fetch new ones
    await this.loadRates();

    this.render();
    this.bindEvents();

    // Apply conversion if not base currency
    if (this.selectedCurrency !== this.baseCurrency) {
      this.applyConversion();
    }

    // Watch for dynamic price elements (SPA navigation, AJAX loads)
    this.observePriceChanges();
  }

  private loadSavedCurrency(): string {
    try {
      const saved = localStorage.getItem(CACHE_CURRENCY_KEY);
      if (saved && this.availableCurrencies.includes(saved)) {
        return saved;
      }
    } catch (e) {
      // localStorage not available
    }
    return this.baseCurrency;
  }

  private saveCurrency(currency: string): void {
    try {
      localStorage.setItem(CACHE_CURRENCY_KEY, currency);
    } catch (e) {
      // localStorage not available
    }
  }

  private async loadRates(): Promise<void> {
    // Try to load from cache first
    const cached = this.loadCachedRates();
    if (cached && cached.base === this.baseCurrency) {
      this.rates = cached.rates;
      return;
    }

    // Fetch fresh rates
    await this.fetchRates();
  }

  private loadCachedRates(): CachedRates | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CachedRates = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - data.timestamp < CACHE_TTL) {
          return data;
        }
      }
    } catch (e) {
      // Cache error, will fetch fresh
    }
    return null;
  }

  private cacheRates(rates: Record<string, number>, base: string): void {
    try {
      const data: CachedRates = {
        rates,
        base,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage not available
    }
  }

  private async fetchRates(): Promise<void> {
    this.isLoading = true;

    try {
      // Build currency list for API (exclude base currency)
      const currencies = this.availableCurrencies
        .filter(c => c !== this.baseCurrency)
        .join(',');

      const response = await fetch(`${API_URL}?from=${this.baseCurrency}&to=${currencies}`);

      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }

      const data = await response.json();

      // Add base currency with rate 1
      this.rates = { [this.baseCurrency]: 1, ...data.rates };

      // Cache the rates
      this.cacheRates(this.rates, this.baseCurrency);
    } catch (e) {
      console.warn('[RealtySoft] Could not fetch exchange rates:', e);
      // Fallback: set all rates to 1 (no conversion)
      this.rates = {};
      this.availableCurrencies.forEach(c => {
        this.rates[c] = 1;
      });
    }

    this.isLoading = false;
  }

  render(): void {
    this.element.classList.add('rs-currency-selector');

    const options = this.availableCurrencies.map(currency => {
      const info = CURRENCY_INFO[currency] || { name: currency, symbol: currency };
      const selected = currency === this.selectedCurrency ? 'selected' : '';
      return `<option value="${currency}" ${selected}>${info.symbol} ${currency}</option>`;
    }).join('');

    this.element.innerHTML = `
      <div class="rs-currency-selector__wrapper">
        <div class="rs-currency-selector__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M2 12h20"></path>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <select class="rs-currency-selector__select">
          ${options}
        </select>
        <div class="rs-currency-selector__arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    `;

    this.select = this.element.querySelector('.rs-currency-selector__select');
  }

  bindEvents(): void {
    if (this.select) {
      this.select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        this.selectedCurrency = target.value;
        this.saveCurrency(this.selectedCurrency);
        this.applyConversion();

        // Dispatch custom event so other components (like map) can refresh
        window.dispatchEvent(new CustomEvent('rs-currency-change', {
          detail: {
            currency: this.selectedCurrency,
            rate: this.rates[this.selectedCurrency] || 1,
            symbol: CURRENCY_INFO[this.selectedCurrency]?.symbol || this.selectedCurrency
          }
        }));
      });
    }
  }

  private applyConversion(): void {
    // Find all price elements across listing, detail, and wishlist pages
    const priceElements = document.querySelectorAll<HTMLElement>(PRICE_SELECTOR);

    priceElements.forEach(el => {
      this.convertPrice(el);
    });
  }

  private convertPrice(element: HTMLElement): void {
    // Store original price if not already stored
    if (!this.originalPrices.has(element)) {
      this.originalPrices.set(element, element.textContent || '');
    }

    const originalText = this.originalPrices.get(element) || '';

    // If selected is base currency, restore original
    if (this.selectedCurrency === this.baseCurrency) {
      element.textContent = originalText;
      return;
    }

    // Extract numeric value from price text
    const numericValue = this.extractPrice(originalText);
    if (numericValue === null) {
      return; // Can't parse, leave as is
    }

    // Get conversion rate
    const rate = this.rates[this.selectedCurrency];
    if (!rate) {
      return;
    }

    // Convert
    const convertedValue = numericValue * rate;

    // Format the converted price
    const formattedPrice = this.formatPrice(convertedValue, this.selectedCurrency);
    element.textContent = formattedPrice;
  }

  private extractPrice(text: string): number | null {
    // Remove currency symbols and text, keep numbers and separators
    const cleaned = text
      .replace(/[€£$]/g, '')
      .replace(/CHF|EUR|GBP|USD/gi, '')
      .replace(/[^\d.,]/g, '')
      .trim();

    if (!cleaned) return null;

    // Determine format by analyzing the separators
    let normalized: string;

    const hasComma = cleaned.includes(',');
    const hasPeriod = cleaned.includes('.');
    const lastCommaPos = cleaned.lastIndexOf(',');
    const lastPeriodPos = cleaned.lastIndexOf('.');

    if (hasComma && hasPeriod) {
      // Both separators present - determine which is decimal
      if (lastCommaPos > lastPeriodPos) {
        // European: 1.234.567,89 -> comma is decimal
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // US/UK: 1,234,567.89 -> period is decimal
        normalized = cleaned.replace(/,/g, '');
      }
    } else if (hasComma) {
      // Only comma - check if it's decimal or thousand separator
      const afterComma = cleaned.substring(lastCommaPos + 1);
      if (afterComma.length === 2) {
        // Likely decimal (e.g., "668,99" = 668.99)
        normalized = cleaned.replace(',', '.');
      } else {
        // Likely thousand separator (e.g., "668,000" = 668000)
        normalized = cleaned.replace(/,/g, '');
      }
    } else if (hasPeriod) {
      // Only period - check if it's decimal or thousand separator
      const afterPeriod = cleaned.substring(lastPeriodPos + 1);
      if (afterPeriod.length === 3 && cleaned.indexOf('.') !== lastPeriodPos) {
        // Multiple periods = thousand separator (e.g., "1.234.567")
        normalized = cleaned.replace(/\./g, '');
      } else if (afterPeriod.length === 2) {
        // Likely decimal (e.g., "668.99")
        normalized = cleaned;
      } else {
        // Thousand separator (e.g., "668.000" = 668000)
        normalized = cleaned.replace(/\./g, '');
      }
    } else {
      // No separators
      normalized = cleaned;
    }

    const value = parseFloat(normalized);
    return isNaN(value) ? null : value;
  }

  private formatPrice(value: number, currency: string): string {
    const info = CURRENCY_INFO[currency] || { symbol: currency };

    // Format based on currency conventions
    let formatted: string;

    // Use Intl.NumberFormat for proper formatting
    try {
      formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.round(value));
    } catch (e) {
      formatted = Math.round(value).toLocaleString();
    }

    // Add currency symbol
    return `${info.symbol} ${formatted}`;
  }

  private observePriceChanges(): void {
    // Use MutationObserver to watch for dynamically added prices
    const observer = new MutationObserver((mutations) => {
      let hasNewPrices = false;

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.matches(PRICE_SELECTOR)) {
              hasNewPrices = true;
            } else if (node.querySelector(PRICE_SELECTOR)) {
              hasNewPrices = true;
            }
          }
        });
      });

      if (hasNewPrices && this.selectedCurrency !== this.baseCurrency) {
        // Debounce to avoid excessive calls
        setTimeout(() => this.applyConversion(), 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Public method to get current currency and rate (for PDF/email)
  public getCurrentCurrency(): { currency: string; rate: number; symbol: string } {
    const info = CURRENCY_INFO[this.selectedCurrency] || { symbol: this.selectedCurrency };
    return {
      currency: this.selectedCurrency,
      rate: this.rates[this.selectedCurrency] || 1,
      symbol: info.symbol
    };
  }

  // Public method to convert a price value
  public convertValue(value: number): { value: number; formatted: string } {
    const rate = this.rates[this.selectedCurrency] || 1;
    const convertedValue = value * rate;
    return {
      value: convertedValue,
      formatted: this.formatPrice(convertedValue, this.selectedCurrency)
    };
  }
}

// Register component
RealtySoft.registerComponent('rs_currency_selector', RSCurrencySelector as unknown as ComponentConstructor);

export { RSCurrencySelector };
export default RSCurrencySelector;
