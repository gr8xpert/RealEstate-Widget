/**
 * RealtySoft Widget v3 - Mortgage Calculator Component
 * Button that opens a popup modal with mortgage calculation form
 * Supports currency conversion based on user's selected currency
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  Property,
  RealtySoftStateModule,
  RealtySoftLabelsModule,
  WidgetConfig
} from '../../types/index';

declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;

// Currency symbols map
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€', GBP: '£', USD: '$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
  PLN: 'zł', CZK: 'Kč', AED: 'AED', SAR: 'SAR', RUB: '₽', CNY: '¥', JPY: '¥',
  AUD: 'A$', CAD: 'C$', INR: '₹', ZAR: 'R', BRL: 'R$', MXN: '$', TRY: '₺',
  MAD: 'MAD', QAR: 'QAR', KWD: 'KWD', BHD: 'BHD', OMR: 'OMR', SGD: 'S$',
  HKD: 'HK$', NZD: 'NZ$', THB: '฿'
};

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
}

interface CurrencyInfo {
  currency: string;
  rate: number;
  symbol: string;
}

class RSMortgageCalculator extends RSBaseComponent {
  private property: Property | null = null;
  private modal: HTMLElement | null = null;
  private isOpen: boolean = false;
  private currencyChangeHandler: (() => void) | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    // Check if feature is enabled
    const config = (window as any).RealtySoftConfig || {};
    if (config.enableMortgageCalculator === false) {
      this.element.style.display = 'none';
      return;
    }

    // Get property from options or state
    this.property = this.options?.property as Property | null;
    if (!this.property) {
      this.property = RealtySoftState.get<Property>('currentProperty');
    }

    this.render();
    this.bindEvents();
  }

  private render(): void {
    const buttonLabel = this.label('mortgage_calculator') || 'Mortgage Calculator';

    this.element.innerHTML = `
      <button type="button" class="rs-mortgage-btn" aria-label="${buttonLabel}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h4M14 16h4"/>
        </svg>
        <span>${buttonLabel}</span>
      </button>
    `;

    // Create modal (appended to body)
    this.createModal();
  }

  private createModal(): void {
    // Remove existing modal if any
    const existingModal = document.getElementById('rs-mortgage-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Get currency info and convert price
    const currencyInfo = this.getCurrencyInfo();
    const basePrice = this.property?.price || 0;
    const convertedPrice = Math.round(basePrice * currencyInfo.rate);
    const priceFormatted = this.formatNumber(convertedPrice);
    const defaultDownPayment = Math.round(convertedPrice * 0.2); // 20% default
    const currencySymbol = currencyInfo.symbol;

    this.modal = document.createElement('div');
    this.modal.id = 'rs-mortgage-modal';
    this.modal.className = 'rs-mortgage-modal';
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.innerHTML = `
      <div class="rs-mortgage-modal__backdrop"></div>
      <div class="rs-mortgage-modal__container" role="dialog" aria-modal="true" aria-labelledby="rs-mortgage-title">
        <div class="rs-mortgage-modal__header">
          <h3 id="rs-mortgage-title">${this.label('mortgage_calculator') || 'Mortgage Calculator'}</h3>
          <button type="button" class="rs-mortgage-modal__close" aria-label="${this.label('close') || 'Close'}">&times;</button>
        </div>

        <div class="rs-mortgage-modal__body">
          <form class="rs-mortgage-form" id="rs-mortgage-form">
            <div class="rs-mortgage-form__group">
              <label for="rs-mortgage-price">${this.label('mortgage_property_price') || 'Property Price'}</label>
              <div class="rs-mortgage-form__input-wrapper">
                <span class="rs-mortgage-form__currency">${currencySymbol}</span>
                <input type="text" id="rs-mortgage-price" name="price" value="${priceFormatted}" class="rs-mortgage-form__input" inputmode="numeric">
              </div>
            </div>

            <div class="rs-mortgage-form__group">
              <label for="rs-mortgage-down">${this.label('mortgage_down_payment') || 'Down Payment'}</label>
              <div class="rs-mortgage-form__row">
                <div class="rs-mortgage-form__input-wrapper rs-mortgage-form__input-wrapper--flex">
                  <span class="rs-mortgage-form__currency">${currencySymbol}</span>
                  <input type="text" id="rs-mortgage-down" name="downPayment" value="${this.formatNumber(defaultDownPayment)}" class="rs-mortgage-form__input" inputmode="numeric">
                </div>
                <div class="rs-mortgage-form__input-wrapper rs-mortgage-form__input-wrapper--small">
                  <input type="number" id="rs-mortgage-down-percent" name="downPaymentPercent" value="20" min="0" max="100" class="rs-mortgage-form__input rs-mortgage-form__input--percent">
                  <span class="rs-mortgage-form__suffix">%</span>
                </div>
              </div>
            </div>

            <div class="rs-mortgage-form__group">
              <label for="rs-mortgage-rate">${this.label('mortgage_interest_rate') || 'Interest Rate'}</label>
              <div class="rs-mortgage-form__input-wrapper rs-mortgage-form__input-wrapper--small">
                <input type="number" id="rs-mortgage-rate" name="interestRate" value="3.5" min="0" max="30" step="0.1" class="rs-mortgage-form__input">
                <span class="rs-mortgage-form__suffix">%</span>
              </div>
            </div>

            <div class="rs-mortgage-form__group">
              <label for="rs-mortgage-term">${this.label('mortgage_loan_term') || 'Loan Term'}</label>
              <div class="rs-mortgage-form__input-wrapper rs-mortgage-form__input-wrapper--small">
                <input type="number" id="rs-mortgage-term" name="loanTerm" value="25" min="1" max="40" class="rs-mortgage-form__input">
                <span class="rs-mortgage-form__suffix">${this.label('years') || 'years'}</span>
              </div>
            </div>

            <button type="submit" class="rs-mortgage-form__submit">
              ${this.label('mortgage_calculate') || 'Calculate'}
            </button>
          </form>

          <div class="rs-mortgage-results" id="rs-mortgage-results" style="display: none;">
            <h4>${this.label('mortgage_results') || 'Monthly Payment'}</h4>
            <div class="rs-mortgage-results__monthly">
              <span class="rs-mortgage-results__currency">${currencySymbol}</span>
              <span class="rs-mortgage-results__amount" id="rs-mortgage-monthly">0</span>
              <span class="rs-mortgage-results__period">/ ${this.label('month') || 'month'}</span>
            </div>

            <div class="rs-mortgage-results__breakdown">
              <div class="rs-mortgage-results__item">
                <span class="rs-mortgage-results__label">${this.label('mortgage_loan_amount') || 'Loan Amount'}</span>
                <span class="rs-mortgage-results__value" id="rs-mortgage-loan">${currencySymbol}0</span>
              </div>
              <div class="rs-mortgage-results__item">
                <span class="rs-mortgage-results__label">${this.label('mortgage_total_interest') || 'Total Interest'}</span>
                <span class="rs-mortgage-results__value" id="rs-mortgage-interest">${currencySymbol}0</span>
              </div>
              <div class="rs-mortgage-results__item rs-mortgage-results__item--total">
                <span class="rs-mortgage-results__label">${this.label('mortgage_total_payment') || 'Total Payment'}</span>
                <span class="rs-mortgage-results__value" id="rs-mortgage-total">${currencySymbol}0</span>
              </div>
            </div>

            <p class="rs-mortgage-results__disclaimer">
              ${this.label('mortgage_disclaimer') || 'This is an estimate only. Actual payments may vary based on taxes, insurance, and other factors.'}
            </p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
  }

  private bindEvents(): void {
    // Button click - open modal
    const btn = this.element.querySelector('.rs-mortgage-btn');
    if (btn) {
      btn.addEventListener('click', () => this.openModal());
    }

    // Modal events
    if (this.modal) {
      // Close button
      const closeBtn = this.modal.querySelector('.rs-mortgage-modal__close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }

      // Backdrop click
      const backdrop = this.modal.querySelector('.rs-mortgage-modal__backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => this.closeModal());
      }

      // Form submit
      const form = this.modal.querySelector('#rs-mortgage-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleCalculate(e));
      }

      // Sync down payment amount and percentage
      const downInput = this.modal.querySelector('#rs-mortgage-down') as HTMLInputElement;
      const downPercent = this.modal.querySelector('#rs-mortgage-down-percent') as HTMLInputElement;
      const priceInput = this.modal.querySelector('#rs-mortgage-price') as HTMLInputElement;

      if (downInput && downPercent && priceInput) {
        downInput.addEventListener('input', () => {
          const price = this.parseNumber(priceInput.value);
          const down = this.parseNumber(downInput.value);
          if (price > 0) {
            downPercent.value = Math.round((down / price) * 100).toString();
          }
        });

        downPercent.addEventListener('input', () => {
          const price = this.parseNumber(priceInput.value);
          const percent = parseFloat(downPercent.value) || 0;
          downInput.value = this.formatNumber(Math.round(price * (percent / 100)));
        });

        priceInput.addEventListener('input', () => {
          const price = this.parseNumber(priceInput.value);
          const percent = parseFloat(downPercent.value) || 0;
          downInput.value = this.formatNumber(Math.round(price * (percent / 100)));
        });
      }

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeModal();
        }
      });
    }

    // Listen for currency changes to update the modal
    this.currencyChangeHandler = () => {
      if (this.isOpen) {
        // Update the modal with new currency
        this.updateModalCurrency();
      }
    };
    window.addEventListener('rs-currency-change', this.currencyChangeHandler);
  }

  /**
   * Update the modal when currency changes
   */
  private updateModalCurrency(): void {
    if (!this.modal) return;

    const currencyInfo = this.getCurrencyInfo();
    const basePrice = this.property?.price || 0;
    const convertedPrice = Math.round(basePrice * currencyInfo.rate);
    const downPaymentPercent = parseFloat(
      (this.modal.querySelector('#rs-mortgage-down-percent') as HTMLInputElement)?.value || '20'
    );
    const convertedDownPayment = Math.round(convertedPrice * (downPaymentPercent / 100));

    // Update all currency symbols in the modal
    const currencySymbols = this.modal.querySelectorAll('.rs-mortgage-form__currency, .rs-mortgage-results__currency');
    currencySymbols.forEach(el => {
      el.textContent = currencyInfo.symbol;
    });

    // Update price input
    const priceInput = this.modal.querySelector('#rs-mortgage-price') as HTMLInputElement;
    if (priceInput) {
      priceInput.value = this.formatNumber(convertedPrice);
    }

    // Update down payment input
    const downInput = this.modal.querySelector('#rs-mortgage-down') as HTMLInputElement;
    if (downInput) {
      downInput.value = this.formatNumber(convertedDownPayment);
    }

    // Hide results (user needs to recalculate with new currency)
    const resultsDiv = this.modal.querySelector('#rs-mortgage-results') as HTMLElement;
    if (resultsDiv) {
      resultsDiv.style.display = 'none';
    }
  }

  private openModal(): void {
    if (!this.modal) return;

    this.isOpen = true;
    this.modal.classList.add('rs-mortgage-modal--open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Update modal with current currency (in case currency changed while modal was closed)
    this.updateModalCurrency();

    // Focus first input
    setTimeout(() => {
      const firstInput = this.modal?.querySelector('input') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  private closeModal(): void {
    if (!this.modal) return;

    this.isOpen = false;
    this.modal.classList.remove('rs-mortgage-modal--open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  private handleCalculate(e: Event): void {
    e.preventDefault();

    if (!this.modal) return;

    const priceInput = this.modal.querySelector('#rs-mortgage-price') as HTMLInputElement;
    const downInput = this.modal.querySelector('#rs-mortgage-down') as HTMLInputElement;
    const rateInput = this.modal.querySelector('#rs-mortgage-rate') as HTMLInputElement;
    const termInput = this.modal.querySelector('#rs-mortgage-term') as HTMLInputElement;

    const price = this.parseNumber(priceInput.value);
    const downPayment = this.parseNumber(downInput.value);
    const annualRate = parseFloat(rateInput.value) || 0;
    const termYears = parseInt(termInput.value) || 25;

    const result = this.calculateMortgage(price, downPayment, annualRate, termYears);
    this.displayResults(result);
  }

  private calculateMortgage(
    price: number,
    downPayment: number,
    annualRate: number,
    termYears: number
  ): MortgageResult {
    const loanAmount = price - downPayment;
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;

    let monthlyPayment: number;

    if (monthlyRate === 0) {
      // No interest
      monthlyPayment = loanAmount / numPayments;
    } else {
      // Standard mortgage formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
      monthlyPayment = loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      loanAmount: Math.round(loanAmount)
    };
  }

  private displayResults(result: MortgageResult): void {
    if (!this.modal) return;

    const resultsDiv = this.modal.querySelector('#rs-mortgage-results') as HTMLElement;
    const monthlyEl = this.modal.querySelector('#rs-mortgage-monthly');
    const loanEl = this.modal.querySelector('#rs-mortgage-loan');
    const interestEl = this.modal.querySelector('#rs-mortgage-interest');
    const totalEl = this.modal.querySelector('#rs-mortgage-total');
    const currency = this.getCurrencyInfo().symbol;

    // Update the currency symbol in results header
    const resultsCurrency = this.modal.querySelector('.rs-mortgage-results__currency');
    if (resultsCurrency) {
      resultsCurrency.textContent = currency;
    }

    if (resultsDiv) {
      resultsDiv.style.display = 'block';
    }

    if (monthlyEl) {
      monthlyEl.textContent = this.formatNumber(result.monthlyPayment);
    }
    if (loanEl) {
      loanEl.textContent = `${currency}${this.formatNumber(result.loanAmount)}`;
    }
    if (interestEl) {
      interestEl.textContent = `${currency}${this.formatNumber(result.totalInterest)}`;
    }
    if (totalEl) {
      totalEl.textContent = `${currency}${this.formatNumber(result.totalPayment)}`;
    }

    // Animate results
    resultsDiv?.classList.add('rs-mortgage-results--animate');
    setTimeout(() => {
      resultsDiv?.classList.remove('rs-mortgage-results--animate');
    }, 500);
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  private parseNumber(str: string): number {
    return parseInt(str.replace(/[^0-9]/g, '')) || 0;
  }

  /**
   * Get the current currency info including symbol and conversion rate
   */
  private getCurrencyInfo(): CurrencyInfo {
    try {
      const selectedCurrency = localStorage.getItem('rs_selected_currency');
      const cachedRates = localStorage.getItem('rs_exchange_rates');

      if (!selectedCurrency || !cachedRates) {
        // No currency selected, use base currency (EUR)
        return { currency: 'EUR', rate: 1, symbol: '€' };
      }

      const ratesData = JSON.parse(cachedRates);
      const rate = ratesData.rates?.[selectedCurrency] || 1;
      const symbol = CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;

      return {
        currency: selectedCurrency,
        rate: rate,
        symbol: symbol
      };
    } catch {
      return { currency: 'EUR', rate: 1, symbol: '€' };
    }
  }

  private getCurrencySymbol(): string {
    return this.getCurrencyInfo().symbol;
  }

  private label(key: string): string {
    return RealtySoftLabels?.get?.(key) || '';
  }

  destroy(): void {
    // Remove currency change listener
    if (this.currencyChangeHandler) {
      window.removeEventListener('rs-currency-change', this.currencyChangeHandler);
      this.currencyChangeHandler = null;
    }

    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    this.element.innerHTML = '';
  }
}

// Register component
if (typeof window !== 'undefined') {
  (window as any).RSMortgageCalculator = RSMortgageCalculator;
}

export { RSMortgageCalculator };
export default RSMortgageCalculator;
