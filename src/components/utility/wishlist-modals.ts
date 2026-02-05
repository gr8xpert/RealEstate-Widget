/**
 * RealtySoft Widget v3 - Wishlist Modals Component
 * Share, Email, Note, and Compare modals
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAnalyticsModule
} from '../../types/index';
import { WishlistManager } from '../../core/wishlist-manager';
import type { WishlistItem } from '../../core/wishlist-manager';
import type { RealtySoftToastModule } from '../../core/toast';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;
declare const RealtySoftToast: RealtySoftToastModule | undefined;

// jsPDF global
declare const jspdf: { jsPDF: new (options: Record<string, unknown>) => JsPDFInstance } | undefined;

interface JsPDFInstance {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  setFontSize: (size: number) => void;
  setTextColor: (...args: number[]) => void;
  setFont: (fontName: string | undefined, style: string) => void;
  setFillColor: (...args: number[]) => void;
  text: (text: string | string[], x: number, y: number, options?: Record<string, unknown>) => void;
  rect: (x: number, y: number, w: number, h: number, style: string) => void;
  addPage: () => void;
  addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  save: (filename: string) => void;
}

// Extended window with jspdf
interface WindowWithJsPDF extends Window {
  jspdf?: typeof jspdf;
}

class RSWishlistModals extends RSBaseComponent {
  private currentNoteRefNo: string | null = null;
  private shareModal: HTMLElement | null = null;
  private emailModal: HTMLElement | null = null;
  private noteModal: HTMLElement | null = null;
  private compareModal: HTMLElement | null = null;
  private windowEventsbound: boolean = false;
  private modalOpenHandler: ((e: Event) => void) | null = null;
  private modalCloseHandler: ((e: Event) => void) | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.currentNoteRefNo = null;
    this.render();
    this.bindEvents();

    // Subscribe to language changes to update labels
    this.subscribe<string>('config.language', () => {
      this.render();
      this.bindEvents();
    });
  }

  render(): void {
    this.element.classList.add('rs-wishlist-modals');

    this.element.innerHTML = `
      <!-- Share Modal -->
      <div class="rs-modal" id="rs-share-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label('wishlist_share_title') || 'Share Your Wishlist'}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <p class="rs-modal__desc">${this.label('wishlist_share_desc') || 'Share this link with anyone to show them your saved properties:'}</p>
            <div class="rs-share-link">
              <input type="text" class="rs-share-link__input" readonly>
              <button type="button" class="rs-wishlist-btn rs-wishlist-btn--primary rs-share-link__copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                ${this.label('copy') || 'Copy'}
              </button>
            </div>
            <div class="rs-share-social">
              <button type="button" class="rs-share-social__btn rs-share-social__btn--whatsapp" data-platform="whatsapp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>
              <button type="button" class="rs-share-social__btn rs-share-social__btn--email" data-platform="email">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Email
              </button>
              <button type="button" class="rs-share-social__btn rs-share-social__btn--qr" data-platform="qr">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Modal -->
      <div class="rs-modal" id="rs-email-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label('wishlist_email_title') || 'Email Your Wishlist'}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <form class="rs-email-form">
              <div class="rs-form-group">
                <label>${this.label('wishlist_email_to') || 'Send to:'}</label>
                <input type="email" name="emailTo" class="rs-input" placeholder="recipient@example.com" required>
              </div>
              <div class="rs-form-group">
                <label>${this.label('wishlist_email_from') || 'Your email (optional):'}</label>
                <input type="email" name="emailFrom" class="rs-input" placeholder="your@example.com">
              </div>
              <div class="rs-form-group">
                <label>${this.label('wishlist_email_message') || 'Personal message (optional):'}</label>
                <textarea name="message" class="rs-textarea" rows="4" placeholder="${this.label('wishlist_email_placeholder') || 'Add a personal note...'}"></textarea>
              </div>
              <div class="rs-form-actions">
                <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-email-cancel">${this.label('cancel') || 'Cancel'}</button>
                <button type="submit" class="rs-wishlist-btn rs-wishlist-btn--success">${this.label('wishlist_email_send') || 'Send Email'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Note Modal -->
      <div class="rs-modal" id="rs-note-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label('wishlist_note_title') || 'Add Property Note'}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <form class="rs-note-form">
              <input type="hidden" name="refNo" class="rs-note-refno">
              <div class="rs-form-group">
                <label>${this.label('property') || 'Property:'}</label>
                <div class="rs-note-property-name"></div>
              </div>
              <div class="rs-form-group">
                <label>${this.label('wishlist_note_label') || 'Your note:'}</label>
                <textarea name="note" class="rs-textarea rs-note-text" rows="6" placeholder="${this.label('wishlist_note_placeholder') || 'Add your thoughts, questions, or reminders...'}" maxlength="500"></textarea>
                <div class="rs-char-counter"><span class="rs-note-char-count">0</span> / 500</div>
              </div>
              <div class="rs-form-actions">
                <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-note-cancel">${this.label('cancel') || 'Cancel'}</button>
                <button type="button" class="rs-wishlist-btn rs-wishlist-btn--danger rs-note-delete" style="display: none;">${this.label('delete') || 'Delete'}</button>
                <button type="submit" class="rs-wishlist-btn rs-wishlist-btn--success">${this.label('save') || 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Compare Modal -->
      <div class="rs-modal rs-modal--large" id="rs-compare-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label('wishlist_compare_title') || 'Compare Properties'}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <div class="rs-compare-grid"></div>
            <div class="rs-compare-table-wrap">
              <table class="rs-compare-table">
                <thead><tr><th>${this.label('feature') || 'Feature'}</th></tr></thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
          <div class="rs-modal__footer">
            <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-compare-close">${this.label('close') || 'Close'}</button>
            <button type="button" class="rs-wishlist-btn rs-wishlist-btn--danger rs-compare-clear">${this.label('wishlist_compare_clear') || 'Clear Selection'}</button>
          </div>
        </div>
      </div>
    `;

    // Cache modal references
    this.shareModal = this.element.querySelector('#rs-share-modal');
    this.emailModal = this.element.querySelector('#rs-email-modal');
    this.noteModal = this.element.querySelector('#rs-note-modal');
    this.compareModal = this.element.querySelector('#rs-compare-modal');
  }

  bindEvents(): void {
    // Window event listeners - only bind once to prevent duplicates on language change
    if (!this.windowEventsbound) {
      this.modalOpenHandler = ((e: CustomEvent) => {
        this.handleModalOpen(e.detail.modalType, e.detail.data);
      }) as EventListener;

      this.modalCloseHandler = ((e: CustomEvent) => {
        this.closeModal(e.detail.modalType);
      }) as EventListener;

      window.addEventListener(WishlistManager.EVENTS.MODAL_OPEN, this.modalOpenHandler);
      window.addEventListener(WishlistManager.EVENTS.MODAL_CLOSE, this.modalCloseHandler);
      this.windowEventsbound = true;
    }

    // Modal close handlers (re-bind after render since DOM is replaced)
    this.element.querySelectorAll('.rs-modal__backdrop, .rs-modal__close').forEach(el => {
      el.addEventListener('click', (e: Event) => {
        const modal = (e.target as HTMLElement).closest('.rs-modal');
        if (modal) {
          (modal as HTMLElement).classList.remove('rs-modal--open');
          document.body.style.overflow = '';
        }
      });
    });

    // Share modal
    this.element.querySelector('.rs-share-link__copy')?.addEventListener('click', () => this.copyShareLink());
    this.element.querySelectorAll<HTMLButtonElement>('.rs-share-social__btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleSocialShare(btn.dataset.platform || ''));
    });

    // Email form
    this.element.querySelector('.rs-email-form')?.addEventListener('submit', (e: Event) => this.handleEmailSubmit(e));
    this.element.querySelector('.rs-email-cancel')?.addEventListener('click', () => this.closeModalById('rs-email-modal'));

    // Note form
    const noteText = this.element.querySelector('.rs-note-text') as HTMLTextAreaElement | null;
    noteText?.addEventListener('input', () => {
      const counter = this.element.querySelector('.rs-note-char-count');
      if (counter) counter.textContent = String(noteText.value.length);
    });
    this.element.querySelector('.rs-note-form')?.addEventListener('submit', (e: Event) => this.handleNoteSubmit(e));
    this.element.querySelector('.rs-note-cancel')?.addEventListener('click', () => this.closeModalById('rs-note-modal'));
    this.element.querySelector('.rs-note-delete')?.addEventListener('click', () => this.deleteNote());

    // Compare modal
    this.element.querySelector('.rs-compare-close')?.addEventListener('click', () => this.closeModalById('rs-compare-modal'));
    this.element.querySelector('.rs-compare-clear')?.addEventListener('click', () => this.clearCompare());
  }

  private handleModalOpen(modalType: string, data: Record<string, unknown> = {}): void {
    switch (modalType) {
      case 'share':
        this.openShareModal();
        break;
      case 'email':
        this.openEmailModal();
        break;
      case 'note':
        this.openNoteModal(data.refNo as string);
        break;
      case 'compare':
        this.openCompareModal();
        break;
      case 'pdf':
        this.downloadPDF();
        break;
    }
  }

  private closeModal(modalType: string): void {
    const modalMap: Record<string, string> = {
      share: 'rs-share-modal',
      email: 'rs-email-modal',
      note: 'rs-note-modal',
      compare: 'rs-compare-modal'
    };
    const modalId = modalMap[modalType];
    if (modalId) {
      this.closeModalById(modalId);
    }
  }

  private openModalById(modalId: string): void {
    const modal = this.element.querySelector(`#${modalId}`) as HTMLElement | null;
    if (modal) {
      modal.classList.add('rs-modal--open');
      document.body.style.overflow = 'hidden';
    }
  }

  private closeModalById(modalId: string): void {
    const modal = this.element.querySelector(`#${modalId}`) as HTMLElement | null;
    if (modal) {
      modal.classList.remove('rs-modal--open');
      document.body.style.overflow = '';
    }
  }

  // Share functionality
  private openShareModal(): void {
    const shareLink = WishlistManager.generateShareLink();
    if (!shareLink) {
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.error(this.label('wishlist_no_share') || 'No properties to share');
      }
      return;
    }

    const input = this.element.querySelector('.rs-share-link__input') as HTMLInputElement | null;
    if (input) input.value = shareLink;
    this.openModalById('rs-share-modal');
  }

  private copyShareLink(): void {
    const input = this.element.querySelector('.rs-share-link__input') as HTMLInputElement | null;
    if (input) {
      input.select();
      document.execCommand('copy');
    }

    if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
      RealtySoftToast.success(this.label('copied') || 'Link copied to clipboard!');
    }

    RealtySoftAnalytics.track('wishlist', 'share', { method: 'copy' });
  }

  private handleSocialShare(platform: string): void {
    const shareLink = WishlistManager.generateShareLink();

    if (platform === 'whatsapp') {
      const text = encodeURIComponent(`Check out my property wishlist: ${shareLink}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
      RealtySoftAnalytics.track('wishlist', 'share', { method: 'whatsapp' });
    } else if (platform === 'email') {
      this.closeModalById('rs-share-modal');
      setTimeout(() => this.openEmailModal(), 300);
    } else if (platform === 'qr') {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareLink || '')}`;
      window.open(qrUrl, '_blank');
      RealtySoftAnalytics.track('wishlist', 'share', { method: 'qr' });
    }
  }

  // Email functionality
  private openEmailModal(): void {
    this.openModalById('rs-email-modal');
  }

  private async handleEmailSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const emailTo = (form.elements.namedItem('emailTo') as HTMLInputElement).value.trim();
    const emailFrom = (form.elements.namedItem('emailFrom') as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();

    if (!emailTo) {
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.error('Please enter recipient email');
      }
      return;
    }

    const phpBase = RealtySoftState.get<string>('config.phpBase') || 'https://smartpropertywidget.com/spw/php';
    const emailEndpoint = RealtySoftState.get<string>('config.wishlistEmailEndpoint') ||
                          `${phpBase}/send-wishlist-email.php`;

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const originalText = submitBtn?.innerHTML || '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = this.label('inquiry_sending') || 'Sending...';
    }

    const properties = WishlistManager.getAsArray();
    const propertiesWithUrls = properties.map(p => ({
      ...p,
      propertyUrl: window.location.origin + this.generatePropertyUrl(p)
    }));

    // Get branding config
    const branding = RealtySoftState.get<Record<string, string>>('config.branding') || {};

    // Get currency info
    const currencyInfo = this.getCurrencyInfo();

    try {
      const response = await fetch(emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          emailTo,
          emailFrom: emailFrom || 'noreply@smartpropertywidget.com',
          message,
          wishlist: propertiesWithUrls,
          siteUrl: window.location.origin,
          ownerEmail: RealtySoftState.get<string>('config.ownerEmail') || '',
          branding: {
            companyName: branding.companyName || '',
            logoUrl: branding.logoUrl || '',
            websiteUrl: branding.websiteUrl || window.location.origin,
            primaryColor: branding.primaryColor || '#667eea',
            emailHeaderColor: branding.emailHeaderColor || branding.primaryColor || '#667eea'
          },
          currency: {
            symbol: currencyInfo.symbol,
            rate: currencyInfo.rate,
            code: currencyInfo.currency
          }
        })
      });

      const responseText = await response.text();

      if (!responseText || responseText.trim() === '') {
        throw new Error('Server returned empty response');
      }

      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        throw new Error('Email endpoint not found');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = JSON.parse(responseText) as { success: boolean; message?: string };

      if (result.success) {
        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.success(this.label('wishlist_email_sent') || 'Email sent successfully!');
        }
        this.closeModalById('rs-email-modal');
        form.reset();

        properties.forEach(p => {
          RealtySoftAnalytics.track('wishlist', 'emailed', { property_id: (p as WishlistItem).ref_no });
        });
      } else {
        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.error(result.message || this.label('wishlist_email_error') || 'Failed to send email');
        }
      }
    } catch (error) {
      console.error('[Wishlist Email] Error:', error);
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.error('Email failed: ' + (error as Error).message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  }

  private generatePropertyUrl(property: WishlistItem | Record<string, unknown>): string {
    const p = property as Record<string, unknown>;

    // Use central helper if available (supports multilingual URLs)
    if (typeof (window as any).RealtySoftGetPropertyUrl === 'function') {
      const adapted = {
        url: p.url,
        ref: p.ref_no || p.ref,
        id: p.id,
        title: p.name || p.title,
        name: p.name || p.title
      };
      return (window as any).RealtySoftGetPropertyUrl(adapted);
    }

    // Fallback for older setups
    if (p.url) return p.url as string;

    const pageSlug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';
    const ref = (p.ref_no || p.ref || p.id || '') as string;
    const urlFormat = RealtySoftState.get<string>('config.propertyUrlFormat') || 'seo';

    if (urlFormat === 'query') {
      return `/${pageSlug}?ref=${ref}`;
    }

    if (urlFormat === 'ref') {
      return `/${pageSlug}/${ref}`;
    }

    const title = (p.name || p.title || '') as string;
    const titleSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);

    return `/${pageSlug}/${titleSlug}-${ref}`;
  }

  // Note functionality
  private openNoteModal(refNo: string): void {
    const property = WishlistManager.get(refNo);
    if (!property) return;

    this.currentNoteRefNo = refNo;

    if (!this.noteModal) return;
    const modal = this.noteModal;
    const refInput = modal.querySelector('.rs-note-refno') as HTMLInputElement | null;
    if (refInput) refInput.value = refNo;
    const nameEl = modal.querySelector('.rs-note-property-name');
    if (nameEl) nameEl.textContent = property.title || 'Property';
    const textEl = modal.querySelector('.rs-note-text') as HTMLTextAreaElement | null;
    if (textEl) textEl.value = property.note || '';
    const charCount = modal.querySelector('.rs-note-char-count');
    if (charCount) charCount.textContent = String((property.note || '').length);
    const deleteBtn = modal.querySelector('.rs-note-delete') as HTMLElement | null;
    if (deleteBtn) deleteBtn.style.display = property.note ? 'inline-flex' : 'none';

    this.openModalById('rs-note-modal');
  }

  private handleNoteSubmit(e: Event): void {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const refNo = (form.querySelector('.rs-note-refno') as HTMLInputElement)?.value || '';
    const note = (form.querySelector('.rs-note-text') as HTMLTextAreaElement)?.value.trim() || '';

    if (WishlistManager.updateNote(refNo, note)) {
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.success(this.label('note_saved') || 'Note saved!');
      }
      this.closeModalById('rs-note-modal');
    }
  }

  private deleteNote(): void {
    const refNo = (this.element.querySelector('.rs-note-refno') as HTMLInputElement)?.value || '';

    if (confirm(this.label('confirm_delete_note') || 'Delete this note?')) {
      WishlistManager.updateNote(refNo, '');
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.success(this.label('note_deleted') || 'Note deleted');
      }
      this.closeModalById('rs-note-modal');
    }
  }

  // Compare functionality
  private openCompareModal(): void {
    const count = WishlistManager.getCompareCount();

    if (count < 2) {
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.warning(this.label('compare_min') || 'Select at least 2 properties to compare');
      }
      return;
    }

    const properties = WishlistManager.getCompareProperties();

    this.renderComparePreview(properties);
    this.renderCompareTable(properties);
    this.openModalById('rs-compare-modal');
  }

  private renderComparePreview(properties: WishlistItem[]): void {
    const grid = this.element.querySelector('.rs-compare-grid');
    if (!grid) return;

    const placeholderImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="192"%3E%3Crect fill="%23ecf0f1" width="256" height="192"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23bdc3c7" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';

    grid.innerHTML = properties.map(p => {
      const img = p.image || placeholderImg;
      return `
        <div class="rs-compare-card">
          <button type="button" class="rs-compare-card__remove" data-ref="${p.ref_no}">&times;</button>
          <img src="${img}" alt="${this.escapeHtml(p.title)}" onerror="this.src='${placeholderImg}'">
          <div class="rs-compare-card__info">
            <h4>${this.escapeHtml(p.title)}</h4>
            <div class="rs-compare-card__price">${this.formatPrice(p)}</div>
            <div class="rs-compare-card__location">${this.escapeHtml(p.location)}</div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll<HTMLButtonElement>('.rs-compare-card__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const refNo = btn.dataset.ref || '';
        WishlistManager.removeFromCompare(refNo);

        if (WishlistManager.getCompareCount() < 2) {
          this.closeModalById('rs-compare-modal');
        } else {
          this.openCompareModal();
        }
      });
    });
  }

  private renderCompareTable(properties: WishlistItem[]): void {
    const thead = this.element.querySelector('.rs-compare-table thead tr');
    const tbody = this.element.querySelector('.rs-compare-table tbody');
    if (!thead || !tbody) return;

    thead.innerHTML = `<th>${this.label('feature') || 'Feature'}</th>`;
    tbody.innerHTML = '';

    properties.forEach(p => {
      const th = document.createElement('th');
      th.textContent = p.title || 'Property';
      thead.appendChild(th);
    });

    const rows = [
      { label: this.label('price') || 'Price', getValue: (p: WishlistItem) => this.formatPrice(p) },
      { label: this.label('location') || 'Location', getValue: (p: WishlistItem) => p.location || 'N/A' },
      { label: this.label('type') || 'Type', getValue: (p: WishlistItem) => (p as unknown as Record<string, unknown>).type as string || 'N/A' },
      { label: this.label('bedrooms') || 'Bedrooms', getValue: (p: WishlistItem) => String(p.beds || 0) },
      { label: this.label('bathrooms') || 'Bathrooms', getValue: (p: WishlistItem) => String(p.baths || 0) },
      { label: this.label('build_size') || 'Build Size', getValue: (p: WishlistItem) => `${p.built || 0}m\u00B2` },
      { label: this.label('plot_size') || 'Plot Size', getValue: (p: WishlistItem) => `${p.plot || 0}m\u00B2` },
      { label: this.label('status') || 'Status', getValue: (p: WishlistItem) => p.listing_type || 'N/A' },
      { label: 'Ref', getValue: (p: WishlistItem) => p.ref_no || 'N/A' }
    ];

    rows.forEach(row => {
      const tr = document.createElement('tr');
      const labelTd = document.createElement('td');
      labelTd.textContent = row.label;
      tr.appendChild(labelTd);

      const values = properties.map(p => row.getValue(p));
      const allSame = values.every(v => v === values[0]);

      properties.forEach((_p, i) => {
        const td = document.createElement('td');
        td.textContent = String(values[i]);
        if (!allSame) td.classList.add('rs-compare-highlight');
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  private clearCompare(): void {
    if (confirm(this.label('compare_confirm_clear') || 'Clear all selected properties?')) {
      WishlistManager.clearCompare();
      this.closeModalById('rs-compare-modal');
    }
  }

  private formatPrice(property: WishlistItem | Record<string, unknown>): string {
    const p = property as Record<string, unknown>;
    let price1 = Number(p.list_price || p.price || 0);
    let price2 = Number(p.list_price_2 || 0);

    // Check if currency converter is active
    const currencyInfo = this.getCurrencyInfo();
    if (currencyInfo.rate !== 1) {
      price1 = price1 * currencyInfo.rate;
      if (price2) price2 = price2 * currencyInfo.rate;
    }

    // Format with the appropriate currency symbol
    const symbol = currencyInfo.symbol;
    if (price2 && Math.round(price1) !== Math.round(price2)) {
      return `${symbol} ${Math.round(price1).toLocaleString()} - ${symbol} ${Math.round(price2).toLocaleString()}`;
    }
    return `${symbol} ${Math.round(price1).toLocaleString()}`;
  }

  private getCurrencyInfo(): { currency: string; rate: number; symbol: string } {
    try {
      // Read from localStorage (where currency-selector stores data)
      const selectedCurrency = localStorage.getItem('rs_selected_currency');
      const cachedRates = localStorage.getItem('rs_exchange_rates');

      if (!selectedCurrency || !cachedRates) {
        return { currency: 'EUR', rate: 1, symbol: '€' };
      }

      const ratesData = JSON.parse(cachedRates);
      const rate = ratesData.rates?.[selectedCurrency] || 1;

      // Currency symbols
      const symbols: Record<string, string> = {
        EUR: '€', GBP: '£', USD: '$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
        PLN: 'zł', CZK: 'Kč', AED: 'AED', SAR: 'SAR', RUB: '₽', CNY: '¥', JPY: '¥',
        AUD: 'A$', CAD: 'C$', INR: '₹', ZAR: 'R', BRL: 'R$', MXN: '$', TRY: '₺',
        MAD: 'MAD', QAR: 'QAR', KWD: 'KWD', BHD: 'BHD', OMR: 'OMR', SGD: 'S$',
        HKD: 'HK$', NZD: 'NZ$', THB: '฿'
      };

      return {
        currency: selectedCurrency,
        rate: rate,
        symbol: symbols[selectedCurrency] || selectedCurrency
      };
    } catch {
      return { currency: 'EUR', rate: 1, symbol: '€' };
    }
  }

  // PDF functionality
  private async downloadPDF(): Promise<void> {
    const properties = WishlistManager.getAsArray();

    if (properties.length === 0) {
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.error(this.label('wishlist_no_share') || 'No properties to export');
      }
      return;
    }

    const win = window as unknown as WindowWithJsPDF;

    if (!win.jspdf) {
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.info('Loading PDF generator...');
      }

      try {
        await this.loadJsPDF();
      } catch (error) {
        console.error('[Wishlist] Failed to load jsPDF:', error);
        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.error('Failed to load PDF library');
        }
        return;
      }
    }

    if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
      RealtySoftToast.info(this.label('results_loading') || 'Generating PDF...');
    }

    try {
      const { jsPDF } = win.jspdf!;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      }) as JsPDFInstance;

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Get branding config
      const branding = RealtySoftState.get<Record<string, string>>('config.branding') || {};
      const companyName = branding.companyName || '';
      const logoUrl = branding.logoUrl || '';
      const websiteUrl = branding.websiteUrl || '';
      const brandColor = branding.primaryColor || '#0066cc';

      // Parse brand color to RGB
      const hexToRgb = (hex: string): number[] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 102, 204];
      };

      const primaryColor = hexToRgb(brandColor);
      const textColor = [33, 37, 41];
      const lightGray = [248, 249, 250];
      const successColor = [5, 150, 105];

      let yPos = 20;

      // Try to add logo (if provided)
      if (logoUrl && logoUrl.startsWith('http')) {
        try {
          const logoImg = await this.loadImageForPDF(logoUrl);
          if (logoImg) {
            // Calculate logo dimensions (max height 20mm, maintain aspect ratio)
            const maxLogoHeight = 20;
            const maxLogoWidth = 60;
            const aspectRatio = logoImg.width / logoImg.height;
            let logoWidth = maxLogoHeight * aspectRatio;
            let logoHeight = maxLogoHeight;
            if (logoWidth > maxLogoWidth) {
              logoWidth = maxLogoWidth;
              logoHeight = maxLogoWidth / aspectRatio;
            }

            // Create canvas for logo
            const canvas = document.createElement('canvas');
            canvas.width = logoImg.width;
            canvas.height = logoImg.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(logoImg, 0, 0);
              const logoX = (pageWidth - logoWidth) / 2;
              pdf.addImage(canvas.toDataURL('image/png'), 'PNG', logoX, yPos, logoWidth, logoHeight);
              yPos += logoHeight + 8;
            }
          }
        } catch (logoError) {
          console.log('[PDF] Could not load logo:', (logoError as Error).message);
        }
      }

      // Company name (if provided)
      if (companyName) {
        pdf.setFontSize(14);
        pdf.setTextColor(128, 128, 128);
        pdf.setFont(undefined, 'normal');
        pdf.text(companyName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 12;
      }

      // Adjust yPos if no logo and no company name
      if (!logoUrl && !companyName) {
        yPos = 40;
      }

      // Title
      pdf.setFontSize(28);
      pdf.setTextColor(...primaryColor);
      pdf.setFont(undefined, 'bold');
      pdf.text('Property Wishlist', pageWidth / 2, yPos, { align: 'center' });

      // Property count
      yPos += 15;
      pdf.setFontSize(14);
      pdf.setTextColor(...textColor);
      pdf.setFont(undefined, 'normal');
      const countText = `${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'} Saved`;
      pdf.text(countText, pageWidth / 2, yPos, { align: 'center' });

      // Date
      yPos += 8;
      pdf.setFontSize(11);
      pdf.setTextColor(128, 128, 128);
      const dateText = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(dateText, pageWidth / 2, yPos, { align: 'center' });

      // Footer on first page
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      const footerText = companyName ? `Generated by ${companyName}` : 'Generated by RealtySoft';
      pdf.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
      if (websiteUrl) {
        pdf.text(websiteUrl.replace(/^https?:\/\//, ''), pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Property pages
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i] as WishlistItem;

        pdf.addPage();
        yPos = margin;

        // Page indicator
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Property ${i + 1} of ${properties.length}`, margin, yPos);

        yPos += 8;

        // Try to add property image
        const firstImage = property.image;
        if (firstImage && typeof firstImage === 'string' && firstImage.startsWith('http')) {
          try {
            const img = await this.loadImageForPDF(firstImage);
            if (img) {
              const imgWidth = contentWidth;
              const targetHeight = 110;

              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;

              const imgAspect = img.width / img.height;
              const targetAspect = imgWidth / targetHeight;

              let sx = 0, sy = 0, sw = img.width, sh = img.height;

              if (imgAspect > targetAspect) {
                sw = img.height * targetAspect;
                sx = (img.width - sw) / 2;
              } else {
                sh = img.width / targetAspect;
                sy = (img.height - sh) / 2;
              }

              canvas.width = 800;
              canvas.height = (800 / imgWidth) * targetHeight;

              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

              pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', margin, yPos, imgWidth, targetHeight);
              yPos += targetHeight + 8;
            }
          } catch (imgError) {
            console.log('[PDF] Could not load image:', (imgError as Error).message);
          }
        }

        // Property title
        pdf.setFontSize(18);
        pdf.setTextColor(...textColor);
        pdf.setFont(undefined, 'bold');
        const titleLines = pdf.splitTextToSize(property.title || 'Property', contentWidth);
        pdf.text(titleLines, margin, yPos);
        yPos += titleLines.length * 7 + 3;

        // Reference
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Ref: ${property.ref_no || ''}`, margin, yPos);

        yPos += 12;

        // Price
        pdf.setFontSize(16);
        pdf.setTextColor(...successColor);
        pdf.setFont(undefined, 'bold');
        pdf.text(this.formatPrice(property), margin, yPos);

        yPos += 12;

        // Details box
        pdf.setFillColor(...lightGray);
        pdf.rect(margin, yPos, contentWidth, 42, 'F');

        yPos += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(...textColor);

        // Location
        pdf.setFont(undefined, 'bold');
        pdf.text('Location:', margin + 5, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(property.location || 'N/A', margin + 28, yPos);
        yPos += 6;

        // Type
        pdf.setFont(undefined, 'bold');
        pdf.text('Type:', margin + 5, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text((property as unknown as Record<string, unknown>).type as string || 'N/A', margin + 28, yPos);
        yPos += 6;

        // Beds & Baths
        const beds = property.beds || 0;
        const baths = property.baths || 0;
        pdf.setFont(undefined, 'bold');
        pdf.text('Bedrooms:', margin + 5, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${beds}`, margin + 28, yPos);
        pdf.setFont(undefined, 'bold');
        pdf.text('Bathrooms:', margin + 60, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${baths}`, margin + 85, yPos);
        yPos += 6;

        // Build & Plot size
        const buildSize = `${property.built || 0}m\u00B2`;
        const plotSize = `${property.plot || 0}m\u00B2`;
        pdf.setFont(undefined, 'bold');
        pdf.text('Build Size:', margin + 5, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(buildSize, margin + 28, yPos);
        pdf.setFont(undefined, 'bold');
        pdf.text('Plot Size:', margin + 60, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(plotSize, margin + 85, yPos);
        yPos += 6;

        // Status
        pdf.setFont(undefined, 'bold');
        pdf.text('Status:', margin + 5, yPos);
        pdf.setFont(undefined, 'normal');
        const ltLabelMap: Record<string, string> = {
          resale: 'listing_type_sale', sale: 'listing_type_sale',
          development: 'listing_type_new', new_development: 'listing_type_new',
          long_rental: 'listing_type_long_rental', rent: 'listing_type_long_rental',
          short_rental: 'listing_type_short_rental', holiday: 'listing_type_short_rental'
        };
        const ltKey = (property.listing_type || '').toLowerCase();
        const ltLabel = ltLabelMap[ltKey] ? this.label(ltLabelMap[ltKey]) : (property.listing_type || this.label('listing_type_sale'));
        pdf.text(ltLabel, margin + 28, yPos);

        yPos += 15;

        // Added date
        if (property.addedAt) {
          pdf.setFontSize(9);
          pdf.setTextColor(128, 128, 128);
          const addedDate = new Date(property.addedAt).toLocaleDateString();
          pdf.text(`Added to wishlist: ${addedDate}`, margin, yPos);
          yPos += 8;
        }

        // Note
        if (property.note) {
          yPos += 5;
          pdf.setFontSize(10);
          pdf.setTextColor(...textColor);
          pdf.setFont(undefined, 'bold');
          pdf.text('Your Note:', margin, yPos);
          yPos += 6;

          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(9);
          const noteLines = pdf.splitTextToSize(property.note, contentWidth);
          pdf.text(noteLines, margin, yPos);
        }

        // Page footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i + 2} of ${properties.length + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save PDF
      const filename = `Wishlist_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.success((this.label('wishlist_pdf') || 'PDF') + ' downloaded!');
      }

      properties.forEach(p => {
        RealtySoftAnalytics.track('wishlist', 'pdf', { property_id: (p as WishlistItem).ref_no });
      });

    } catch (error) {
      console.error('[Wishlist] PDF generation error:', error);
      if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
        RealtySoftToast.error('Failed to generate PDF');
      }
    }
  }

  private loadJsPDF(): Promise<void> {
    return new Promise((resolve, reject) => {
      const win = window as unknown as WindowWithJsPDF;
      if (win.jspdf) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
      document.head.appendChild(script);
    });
  }

  private loadImageForPDF(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load failed'));
      };

      img.src = src;
    });
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_modals', RSWishlistModals as unknown as ComponentConstructor);

export { RSWishlistModals };
export default RSWishlistModals;
