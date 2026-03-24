/**
 * RealtySoft Widget v3 - Detail PDF Button Component
 * Standalone PDF download button
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property, RealtySoftAnalyticsModule } from '../../types/index';

// Declare globals
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;

class RSDetailPdfButton extends RSBaseComponent {
  private property: Property | null = null;
  private pdfUrl: string | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.property = this.options?.property as Property | null;

    if (!this.property) {
      this.element.style.display = 'none';
      return;
    }

    // Get PDF URL from multiple possible locations
    const p = this.property;
    const orig = (p._original || {}) as Record<string, unknown>;

    // Check documents array from CRM API
    const documents = orig.documents as string[] | undefined;
    const firstDocument = Array.isArray(documents) && documents.length > 0 ? documents[0] : null;

    this.pdfUrl = p.pdf_url || (orig.pdf_url as string) || (orig.pdf as string) ||
                  (orig.brochure_url as string) || (orig.brochure as string) ||
                  (orig.pdf_link as string) || (orig.document_url as string) ||
                  (orig.flyer_url as string) || (orig.flyer as string) ||
                  firstDocument ||
                  null;

    if (!this.pdfUrl) {
      this.element.style.display = 'none';
      return;
    }

    this.render();
    this.bindEvents();
  }

  render(): void {
    this.element.classList.add('rs-detail-pdf');

    this.element.innerHTML = `
      <a href="${this.pdfUrl}" target="_blank" class="rs-detail-pdf__btn" rel="noopener">
        <svg class="rs-detail-pdf__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M12 18v-6"/>
          <path d="M9 15l3 3 3-3"/>
        </svg>
        <span class="rs-detail-pdf__text">${this.label('detail_download_pdf') || 'Download PDF'}</span>
      </a>
    `;
  }

  bindEvents(): void {
    const btn = this.element.querySelector('.rs-detail-pdf__btn');
    if (btn && this.property) {
      btn.addEventListener('click', () => {
        RealtySoftAnalytics.trackResourceClick('pdf', this.property!.id);
      });
    }
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailPdfButton };
export default RSDetailPdfButton;
