/**
 * RealtySoft Widget v2 - Detail PDF Button Component
 * Standalone PDF download button
 */

class RSDetailPdfButton extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.property = this.options?.property;

        if (!this.property) {
            this.element.style.display = 'none';
            return;
        }

        // Get PDF URL from multiple possible locations
        const p = this.property;
        const orig = p._original || {};

        this.pdfUrl = p.pdf_url || p.pdf ||
                      orig.pdf_url || orig.pdf || orig.brochure_url || orig.brochure ||
                      orig.pdf_link || orig.document_url || orig.flyer_url || orig.flyer ||
                      null;

        if (!this.pdfUrl) {
            this.element.style.display = 'none';
            return;
        }

        this.render();
        this.bindEvents();
    }

    render() {
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

    bindEvents() {
        this.element.querySelector('.rs-detail-pdf__btn').addEventListener('click', () => {
            RealtySoftAnalytics.trackResourceClick('pdf', this.property.id);
        });
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
