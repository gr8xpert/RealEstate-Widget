/**
 * RealtySoft Widget v3 - Wishlist Counter Component
 * Shows count of items in wishlist
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;

// Default wishlist page slugs for common languages
const DEFAULT_WISHLIST_SLUGS: Record<string, string> = {
  en: 'wishlist',
  es: 'lista-de-deseos',
  de: 'wunschliste',
  fr: 'liste-de-souhaits',
  pt: 'lista-de-desejos',
  it: 'lista-dei-desideri',
  nl: 'verlanglijst',
  ru: 'wishlist',
  default: 'wishlist'
};

class RSWishlistCounter extends RSBaseComponent {
  private count: number = 0;
  private isInsideLink: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.count = (RealtySoftState.get<unknown[]>('wishlist') || []).length;

    // Check if element is already inside an <a> tag (e.g., in a menu)
    this.isInsideLink = !!this.element.closest('a');

    this.render();

    this.subscribe<unknown[]>('wishlist', (wishlist) => {
      this.count = wishlist.length;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-counter');
    this.updateDisplay();
  }

  /**
   * Get the wishlist page URL based on current language
   */
  private getWishlistUrl(): string {
    // Priority 1: data-href attribute on the element
    if (this.element.dataset.href) {
      return this.element.dataset.href;
    }

    // Priority 2: If inside a link, don't need a URL (parent handles it)
    if (this.isInsideLink) {
      return '#';
    }

    // Priority 3: Get from config (wishlistPageSlugs)
    const wishlistSlugs = RealtySoftState.get<Record<string, string>>('config.wishlistPageSlugs') || {};

    // Priority 4: Detect current language
    const currentLang = this.getCurrentLanguage();

    // Priority 5: Look up slug for current language
    const slug = wishlistSlugs[currentLang] || DEFAULT_WISHLIST_SLUGS[currentLang] || DEFAULT_WISHLIST_SLUGS.default;

    return `/${slug}/`;
  }

  /**
   * Get current language code
   */
  private getCurrentLanguage(): string {
    // From config (set by PHP/WordPress)
    const currentLang = RealtySoftState.get<string>('config.currentLang');
    if (currentLang) return currentLang.toLowerCase();

    // Detect from URL path (e.g., /es/lista-de-deseos → 'es')
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})(?:\/|$)/i);
    if (langMatch) {
      return langMatch[1].toLowerCase();
    }

    // From widget language config
    const widgetLanguage = RealtySoftState.get<string>('config.language') || 'en_US';
    return widgetLanguage.split('_')[0].toLowerCase();
  }

  private updateDisplay(): void {
    const iconHtml = `
      <svg class="rs-wishlist-counter__icon" width="24" height="24" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      ${this.count > 0 ? `<span class="rs-wishlist-counter__badge">${this.count}</span>` : ''}
    `;

    // If already inside a link (e.g., WordPress menu), don't render another <a> tag
    if (this.isInsideLink) {
      this.element.innerHTML = iconHtml;
    } else {
      const wishlistUrl = this.getWishlistUrl();
      this.element.innerHTML = `
        <a href="${wishlistUrl}" class="rs-wishlist-counter__link">
          ${iconHtml}
        </a>
      `;
    }
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_counter', RSWishlistCounter as unknown as ComponentConstructor);

export { RSWishlistCounter };
export default RSWishlistCounter;
