/**
 * RealtySoft Widget v3 - Pagination Component
 * Page navigation with numbers and prev/next
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

class RSPagination extends RSBaseComponent {
  private currentPage: number = 1;
  private totalPages: number = 0;
  private loading: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.currentPage = 1;
    this.totalPages = 0;
    this.loading = false;

    this.render();
    this.bindEvents();

    this.subscribe<number>('results.page', (page) => {
      this.currentPage = page;
      this.updateDisplay();
    });

    this.subscribe<number>('results.totalPages', (total) => {
      this.totalPages = total;
      this.updateDisplay();
    });

    this.subscribe<boolean>('ui.loading', (loading) => {
      this.loading = loading;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-pagination');
    this.updateDisplay();
  }

  bindEvents(): void {
    this.element.addEventListener('click', (e: Event) => {
      if (this.loading) return;

      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (!button) return;

      e.preventDefault();

      if (button.classList.contains('rs-pagination__prev')) {
        this.goToPage(this.currentPage - 1);
      } else if (button.classList.contains('rs-pagination__next')) {
        this.goToPage(this.currentPage + 1);
      } else if (button.classList.contains('rs-pagination__page')) {
        this.goToPage(parseInt(button.dataset.page || '1'));
      } else if (button.classList.contains('rs-pagination__load-more')) {
        // Load more functionality
        this.loadMore();
      }
    });
  }

  private goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    RealtySoft.goToPage(page);

    // Scroll to top of results
    const grid = document.querySelector('.rs_property_grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private loadMore(): void {
    // For "load more" style pagination
    if (this.currentPage < this.totalPages) {
      // This would append results instead of replacing
      RealtySoft.goToPage(this.currentPage + 1);
    }
  }

  private updateDisplay(): void {
    if (this.totalPages <= 1) {
      this.element.innerHTML = '';
      return;
    }

    const pages = this.getPageNumbers();

    this.element.innerHTML = `
      <div class="rs-pagination__wrapper">
        <button type="button"
                class="rs-pagination__btn rs-pagination__prev"
                ${this.currentPage === 1 || this.loading ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>${this.label('pagination_prev')}</span>
        </button>

        <div class="rs-pagination__pages">
          ${pages.map(page => {
            if (page === '...') {
              return '<span class="rs-pagination__ellipsis">...</span>';
            }
            return `
              <button type="button"
                      class="rs-pagination__btn rs-pagination__page ${page === this.currentPage ? 'rs-pagination__page--active' : ''}"
                      data-page="${page}"
                      ${this.loading ? 'disabled' : ''}>
                ${page}
              </button>
            `;
          }).join('')}
        </div>

        <button type="button"
                class="rs-pagination__btn rs-pagination__next"
                ${this.currentPage === this.totalPages || this.loading ? 'disabled' : ''}>
          <span>${this.label('pagination_next')}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="rs-pagination__info">
        ${this.label('pagination_page')}&nbsp;${this.currentPage}&nbsp;${this.label('pagination_of')}&nbsp;${this.totalPages}
      </div>
    `;
  }

  private getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const current = this.currentPage;
    const total = this.totalPages;
    const delta = 2; // Pages to show on each side of current

    // Always show first page
    pages.push(1);

    // Calculate start and end of page range
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < total - 1) {
      pages.push('...');
    }

    // Always show last page if more than 1 page
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  }
}

// Register component
RealtySoft.registerComponent('rs_pagination', RSPagination as unknown as ComponentConstructor);

export { RSPagination };
export default RSPagination;
