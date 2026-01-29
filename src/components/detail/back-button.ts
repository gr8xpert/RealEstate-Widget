/**
 * RealtySoft Widget v3 - Detail Back Button Component
 * Back to search results button
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property, RealtySoftRouterModule } from '../../types/index';

declare const RealtySoftRouter: RealtySoftRouterModule | undefined;

class RSDetailBackButton extends RSBaseComponent {
  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.render();
    this.bindEvents();
  }

  render(): void {
    this.element.classList.add('rs-detail-back');

    // Try to get the search URL from various sources
    const searchUrl = this.getSearchUrl();

    this.element.innerHTML = `
      <a href="${searchUrl}" class="rs-detail-back__btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>${this.label('detail_back_to_search') || 'Back to Search'}</span>
      </a>
    `;
  }

  private getSearchUrl(): string {
    // Check for referrer from search page
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.hostname)) {
      // Check if referrer is a search/listing page
      if (referrer.includes('search') || referrer.includes('listing') ||
        referrer.includes('properties') || referrer.includes('property-list')) {
        return referrer;
      }
    }

    // Check session storage for last search URL
    const lastSearch = sessionStorage.getItem('rs_last_search_url');
    if (lastSearch) {
      return lastSearch;
    }

    // Check for data attribute
    if (this.element.dataset.searchUrl) {
      return this.element.dataset.searchUrl;
    }

    // Default fallback - use history back
    return 'javascript:history.back()';
  }

  bindEvents(): void {
    const btn = this.element.querySelector('.rs-detail-back__btn') as HTMLAnchorElement | null;
    if (!btn) return;

    const href = btn.getAttribute('href');

    btn.addEventListener('click', (e: Event) => {
      // SPA router: navigate back to listing without page reload
      if (typeof RealtySoftRouter !== 'undefined' && RealtySoftRouter.canGoBackToListing()) {
        e.preventDefault();
        RealtySoftRouter.navigateToListing();
        return;
      }

      // If using history.back(), handle it with JS
      if (href === 'javascript:history.back()') {
        e.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // Fallback to home or search page
          window.location.href = '/';
        }
      }
    });
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailBackButton };
export default RSDetailBackButton;
