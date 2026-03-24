/**
 * RealtySoft Widget v3 - Detail Resources Component
 * Additional resources (Video Tour, Virtual Tour, PDF Download)
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property, RealtySoftAnalyticsModule } from '../../types/index';

// Declare globals
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;

interface ResourceItem {
  type: string;
  url: string;
  icon: string;
  label: string;
  isEmbed: boolean;
}

class RSDetailResources extends RSBaseComponent {
  private property: Property | null = null;
  private modal: HTMLElement | null = null;
  private modalBody: HTMLElement | null = null;

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

    const p = this.property;
    // Check documents array from CRM API as fallback
    const orig = (p._original || {}) as Record<string, unknown>;
    const documents = orig.documents as string[] | undefined;
    const hasDocuments = Array.isArray(documents) && documents.length > 0;

    // Check if we have any resources
    if (!p.video_url && !p.virtual_tour_url && !p.pdf_url && !hasDocuments) {
      this.element.style.display = 'none';
      return;
    }

    this.render();
    this.bindEvents();
  }

  render(): void {
    const p = this.property!;
    this.element.classList.add('rs-detail-resources');

    const resources: ResourceItem[] = [];

    if (p.video_url) {
      resources.push({
        type: 'video',
        url: p.video_url,
        icon: this.getIcon('video'),
        label: this.label('detail_video_tour'),
        isEmbed: this.isEmbeddable(p.video_url)
      });
    }

    if (p.virtual_tour_url) {
      resources.push({
        type: 'tour',
        url: p.virtual_tour_url,
        icon: this.getIcon('tour'),
        label: this.label('detail_virtual_tour'),
        isEmbed: true
      });
    }

    // Get PDF URL from property or documents array fallback
    const orig = (p._original || {}) as Record<string, unknown>;
    const documents = orig.documents as string[] | undefined;
    const pdfUrl = p.pdf_url || (Array.isArray(documents) && documents.length > 0 ? documents[0] : null);

    if (pdfUrl) {
      resources.push({
        type: 'pdf',
        url: pdfUrl,
        icon: this.getIcon('pdf'),
        label: this.label('detail_download_pdf'),
        isEmbed: false
      });
    }

    this.element.innerHTML = `
      <h3 class="rs-detail-resources__title">${this.label('detail_additional_resources')}</h3>
      <div class="rs-detail-resources__grid">
        ${resources.map(r => `
          <button type="button"
                  class="rs-detail-resources__btn rs-detail-resources__btn--${r.type}"
                  data-type="${r.type}"
                  data-url="${this.escapeAttr(r.url)}"
                  data-embed="${r.isEmbed}">
            <span class="rs-detail-resources__btn-icon">${r.icon}</span>
            <span class="rs-detail-resources__btn-label">${r.label}</span>
          </button>
        `).join('')}
      </div>
      <div class="rs-detail-resources__modal" style="display: none;">
        <div class="rs-detail-resources__modal-backdrop"></div>
        <div class="rs-detail-resources__modal-content">
          <button type="button" class="rs-detail-resources__modal-close">&times;</button>
          <div class="rs-detail-resources__modal-body"></div>
        </div>
      </div>
    `;

    this.modal = this.element.querySelector('.rs-detail-resources__modal');
    this.modalBody = this.element.querySelector('.rs-detail-resources__modal-body');
  }

  bindEvents(): void {
    // Resource buttons
    this.element.querySelectorAll<HTMLButtonElement>('.rs-detail-resources__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type || '';
        const url = btn.dataset.url || '';
        const isEmbed = btn.dataset.embed === 'true';

        if (type === 'pdf') {
          window.open(url, '_blank');
          RealtySoftAnalytics.trackResourceClick('pdf', this.property!.id);
        } else if (isEmbed) {
          this.openModal(type, url);
          RealtySoftAnalytics.trackResourceClick(type, this.property!.id);
        } else {
          window.open(url, '_blank');
          RealtySoftAnalytics.trackResourceClick(type, this.property!.id);
        }
      });
    });

    // Modal close
    if (this.modal) {
      this.modal.querySelector('.rs-detail-resources__modal-close')?.addEventListener('click', () => {
        this.closeModal();
      });
      this.modal.querySelector('.rs-detail-resources__modal-backdrop')?.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // ESC key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
        this.closeModal();
      }
    });
  }

  private openModal(type: string, url: string): void {
    let embedHtml = '';

    if (type === 'video') {
      const embedUrl = this.getVideoEmbedUrl(url);
      embedHtml = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    } else if (type === 'tour') {
      embedHtml = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
    }

    if (this.modalBody) this.modalBody.innerHTML = embedHtml;
    if (this.modal) this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  private closeModal(): void {
    if (this.modal) this.modal.style.display = 'none';
    if (this.modalBody) this.modalBody.innerHTML = '';
    document.body.style.overflow = '';
  }

  private getVideoEmbedUrl(url: string): string {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return url;
  }

  private isEmbeddable(url: string): boolean {
    return url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');
  }

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      tour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
      pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>'
    };
    return icons[type] || icons.pdf;
  }

  private escapeAttr(text: string): string {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailResources };
export default RSDetailResources;
