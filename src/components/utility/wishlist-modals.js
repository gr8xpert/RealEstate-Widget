/**
 * RealtySoft Widget v2 - Wishlist Modals Component
 * Share, Email, Note, and Compare modals
 * Attribute: rs_wishlist_modals
 */

class RSWishlistModals extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.currentNoteRefNo = null;
        this.render();
        this.bindEvents();
    }

    render() {
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

    bindEvents() {
        // Listen for modal open requests
        window.addEventListener(WishlistManager.EVENTS.MODAL_OPEN, (e) => {
            this.handleModalOpen(e.detail.modalType, e.detail.data);
        });

        // Listen for modal close requests
        window.addEventListener(WishlistManager.EVENTS.MODAL_CLOSE, (e) => {
            this.closeModal(e.detail.modalType);
        });

        // Modal close handlers
        this.element.querySelectorAll('.rs-modal__backdrop, .rs-modal__close').forEach(el => {
            el.addEventListener('click', (e) => {
                const modal = e.target.closest('.rs-modal');
                if (modal) {
                    modal.classList.remove('rs-modal--open');
                    document.body.style.overflow = '';
                }
            });
        });

        // Share modal
        this.element.querySelector('.rs-share-link__copy')?.addEventListener('click', () => this.copyShareLink());
        this.element.querySelectorAll('.rs-share-social__btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialShare(btn.dataset.platform));
        });

        // Email form
        this.element.querySelector('.rs-email-form')?.addEventListener('submit', (e) => this.handleEmailSubmit(e));
        this.element.querySelector('.rs-email-cancel')?.addEventListener('click', () => this.closeModalById('rs-email-modal'));

        // Note form
        const noteText = this.element.querySelector('.rs-note-text');
        noteText?.addEventListener('input', () => {
            this.element.querySelector('.rs-note-char-count').textContent = noteText.value.length;
        });
        this.element.querySelector('.rs-note-form')?.addEventListener('submit', (e) => this.handleNoteSubmit(e));
        this.element.querySelector('.rs-note-cancel')?.addEventListener('click', () => this.closeModalById('rs-note-modal'));
        this.element.querySelector('.rs-note-delete')?.addEventListener('click', () => this.deleteNote());

        // Compare modal
        this.element.querySelector('.rs-compare-close')?.addEventListener('click', () => this.closeModalById('rs-compare-modal'));
        this.element.querySelector('.rs-compare-clear')?.addEventListener('click', () => this.clearCompare());
    }

    handleModalOpen(modalType, data = {}) {
        switch (modalType) {
            case 'share':
                this.openShareModal();
                break;
            case 'email':
                this.openEmailModal();
                break;
            case 'note':
                this.openNoteModal(data.refNo);
                break;
            case 'compare':
                this.openCompareModal();
                break;
            case 'pdf':
                this.downloadPDF();
                break;
        }
    }

    closeModal(modalType) {
        const modalMap = {
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

    openModalById(modalId) {
        const modal = this.element.querySelector(`#${modalId}`);
        if (modal) {
            modal.classList.add('rs-modal--open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModalById(modalId) {
        const modal = this.element.querySelector(`#${modalId}`);
        if (modal) {
            modal.classList.remove('rs-modal--open');
            document.body.style.overflow = '';
        }
    }

    // Share functionality
    openShareModal() {
        const shareLink = WishlistManager.generateShareLink();
        if (!shareLink) {
            if (window.RealtySoftToast) {
                RealtySoftToast.error(this.label('wishlist_no_share') || 'No properties to share');
            }
            return;
        }

        this.element.querySelector('.rs-share-link__input').value = shareLink;
        this.openModalById('rs-share-modal');
    }

    copyShareLink() {
        const input = this.element.querySelector('.rs-share-link__input');
        input.select();
        document.execCommand('copy');

        if (window.RealtySoftToast) {
            RealtySoftToast.success(this.label('copied') || 'Link copied to clipboard!');
        }

        RealtySoftAnalytics.track('wishlist', 'share', { method: 'copy' });
    }

    handleSocialShare(platform) {
        const shareLink = WishlistManager.generateShareLink();

        if (platform === 'whatsapp') {
            const text = encodeURIComponent(`Check out my property wishlist: ${shareLink}`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
            RealtySoftAnalytics.track('wishlist', 'share', { method: 'whatsapp' });
        } else if (platform === 'email') {
            this.closeModalById('rs-share-modal');
            setTimeout(() => this.openEmailModal(), 300);
        } else if (platform === 'qr') {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareLink)}`;
            window.open(qrUrl, '_blank');
            RealtySoftAnalytics.track('wishlist', 'share', { method: 'qr' });
        }
    }

    // Email functionality
    openEmailModal() {
        this.openModalById('rs-email-modal');
    }

    async handleEmailSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const emailTo = form.emailTo.value.trim();
        const emailFrom = form.emailFrom.value.trim();
        const message = form.message.value.trim();

        if (!emailTo) {
            if (window.RealtySoftToast) {
                RealtySoftToast.error('Please enter recipient email');
            }
            return;
        }

        const phpBase = RealtySoftState.get('config.phpBase') || 'https://realtysoft.ai/realtysoft/php';
        const emailEndpoint = RealtySoftState.get('config.wishlistEmailEndpoint') ||
                              `${phpBase}/send-wishlist-email.php`;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerHTML;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = this.label('inquiry_sending') || 'Sending...';
        }

        const properties = WishlistManager.getAsArray();
        const propertiesWithUrls = properties.map(p => ({
            ...p,
            propertyUrl: window.location.origin + this.generatePropertyUrl(p)
        }));

        try {
            const response = await fetch(emailEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    emailTo,
                    emailFrom: emailFrom || 'noreply@realtysoft.ai',
                    message,
                    wishlist: propertiesWithUrls,
                    siteUrl: window.location.origin
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

            const result = JSON.parse(responseText);

            if (result.success) {
                if (window.RealtySoftToast) {
                    RealtySoftToast.success(this.label('wishlist_email_sent') || 'Email sent successfully!');
                }
                this.closeModalById('rs-email-modal');
                form.reset();

                properties.forEach(p => {
                    RealtySoftAnalytics.track('wishlist', 'emailed', { property_id: p.ref_no });
                });
            } else {
                if (window.RealtySoftToast) {
                    RealtySoftToast.error(result.message || this.label('wishlist_email_error') || 'Failed to send email');
                }
            }
        } catch (error) {
            console.error('[Wishlist Email] Error:', error);
            if (window.RealtySoftToast) {
                RealtySoftToast.error('Email failed: ' + error.message);
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    }

    generatePropertyUrl(property) {
        if (property.url) return property.url;

        const pageSlug = RealtySoftState.get('config.propertyPageSlug') || 'property';
        const ref = property.ref_no || property.ref || property.id;
        const title = property.name || property.title || '';

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
    openNoteModal(refNo) {
        const property = WishlistManager.get(refNo);
        if (!property) return;

        this.currentNoteRefNo = refNo;

        const modal = this.noteModal;
        modal.querySelector('.rs-note-refno').value = refNo;
        modal.querySelector('.rs-note-property-name').textContent = property.name || property.title || 'Property';
        modal.querySelector('.rs-note-text').value = property.note || '';
        modal.querySelector('.rs-note-char-count').textContent = (property.note || '').length;
        modal.querySelector('.rs-note-delete').style.display = property.note ? 'inline-flex' : 'none';

        this.openModalById('rs-note-modal');
    }

    handleNoteSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const refNo = form.querySelector('.rs-note-refno').value;
        const note = form.querySelector('.rs-note-text').value.trim();

        if (WishlistManager.updateNote(refNo, note)) {
            if (window.RealtySoftToast) {
                RealtySoftToast.success(this.label('note_saved') || 'Note saved!');
            }
            this.closeModalById('rs-note-modal');
        }
    }

    deleteNote() {
        const refNo = this.element.querySelector('.rs-note-refno').value;

        if (confirm(this.label('confirm_delete_note') || 'Delete this note?')) {
            WishlistManager.updateNote(refNo, '');
            if (window.RealtySoftToast) {
                RealtySoftToast.success(this.label('note_deleted') || 'Note deleted');
            }
            this.closeModalById('rs-note-modal');
        }
    }

    // Compare functionality
    openCompareModal() {
        const count = WishlistManager.getCompareCount();

        if (count < 2) {
            if (window.RealtySoftToast) {
                RealtySoftToast.warning(this.label('compare_min') || 'Select at least 2 properties to compare');
            }
            return;
        }

        const properties = WishlistManager.getCompareProperties();

        this.renderComparePreview(properties);
        this.renderCompareTable(properties);
        this.openModalById('rs-compare-modal');
    }

    renderComparePreview(properties) {
        const grid = this.element.querySelector('.rs-compare-grid');
        const placeholderImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="192"%3E%3Crect fill="%23ecf0f1" width="256" height="192"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23bdc3c7" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';

        grid.innerHTML = properties.map(p => {
            // Get first image from property
            let img = placeholderImg;
            if (p.images && p.images.length > 0) {
                const firstImg = p.images[0];
                img = firstImg.image_256 || firstImg.src || (typeof firstImg === 'string' ? firstImg : placeholderImg);
            }
            return `
                <div class="rs-compare-card">
                    <button type="button" class="rs-compare-card__remove" data-ref="${p.ref_no}">&times;</button>
                    <img src="${img}" alt="${this.escapeHtml(p.name || p.title)}" onerror="this.src='${placeholderImg}'">
                    <div class="rs-compare-card__info">
                        <h4>${this.escapeHtml(p.name || p.title)}</h4>
                        <div class="rs-compare-card__price">${this.formatPrice(p)}</div>
                        <div class="rs-compare-card__location">${this.escapeHtml(p.location)}</div>
                    </div>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.rs-compare-card__remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const refNo = btn.dataset.ref;
                WishlistManager.removeFromCompare(refNo);

                if (WishlistManager.getCompareCount() < 2) {
                    this.closeModalById('rs-compare-modal');
                } else {
                    this.openCompareModal();
                }
            });
        });
    }

    renderCompareTable(properties) {
        const thead = this.element.querySelector('.rs-compare-table thead tr');
        const tbody = this.element.querySelector('.rs-compare-table tbody');

        thead.innerHTML = `<th>${this.label('feature') || 'Feature'}</th>`;
        tbody.innerHTML = '';

        properties.forEach(p => {
            const th = document.createElement('th');
            th.textContent = p.name || p.title || 'Property';
            thead.appendChild(th);
        });

        const rows = [
            { label: this.label('price') || 'Price', getValue: p => this.formatPrice(p) },
            { label: this.label('location') || 'Location', getValue: p => p.location || 'N/A' },
            { label: this.label('type') || 'Type', getValue: p => p.type || 'N/A' },
            { label: this.label('bedrooms') || 'Bedrooms', getValue: p => p.bedrooms || p.beds || 0 },
            { label: this.label('bathrooms') || 'Bathrooms', getValue: p => p.bathrooms || p.baths || 0 },
            { label: this.label('build_size') || 'Build Size', getValue: p => `${p.build_size || p.built_area || 0}m²` },
            { label: this.label('plot_size') || 'Plot Size', getValue: p => `${p.plot_size || 0}m²` },
            { label: this.label('status') || 'Status', getValue: p => p.listing_type || 'N/A' },
            { label: 'Ref', getValue: p => p.ref_no || p.ref || 'N/A' }
        ];

        rows.forEach(row => {
            const tr = document.createElement('tr');
            const labelTd = document.createElement('td');
            labelTd.textContent = row.label;
            tr.appendChild(labelTd);

            const values = properties.map(p => row.getValue(p));
            const allSame = values.every(v => v === values[0]);

            properties.forEach((p, i) => {
                const td = document.createElement('td');
                td.textContent = values[i];
                if (!allSame) td.classList.add('rs-compare-highlight');
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    clearCompare() {
        if (confirm(this.label('compare_confirm_clear') || 'Clear all selected properties?')) {
            WishlistManager.clearCompare();
            this.closeModalById('rs-compare-modal');
        }
    }

    formatPrice(property) {
        const price1 = Number(property.list_price || property.price || 0);
        const price2 = Number(property.list_price_2 || 0);

        if (price2 && price1 !== price2) {
            return `€${price1.toLocaleString()} - €${price2.toLocaleString()}`;
        }
        return `€${price1.toLocaleString()}`;
    }

    // PDF functionality
    async downloadPDF() {
        const properties = WishlistManager.getAsArray();

        if (properties.length === 0) {
            if (window.RealtySoftToast) {
                RealtySoftToast.error(this.label('wishlist_no_share') || 'No properties to export');
            }
            return;
        }

        if (!window.jspdf) {
            if (window.RealtySoftToast) {
                RealtySoftToast.info('Loading PDF generator...');
            }

            try {
                await this.loadJsPDF();
            } catch (error) {
                console.error('[Wishlist] Failed to load jsPDF:', error);
                if (window.RealtySoftToast) {
                    RealtySoftToast.error('Failed to load PDF library');
                }
                return;
            }
        }

        if (window.RealtySoftToast) {
            RealtySoftToast.info(this.label('results_loading') || 'Generating PDF...');
        }

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);

            const primaryColor = [0, 102, 204];
            const textColor = [33, 37, 41];
            const lightGray = [248, 249, 250];
            const successColor = [5, 150, 105];

            let yPos = 40;

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
            pdf.text('Generated by RealtySoft', pageWidth / 2, pageHeight - 15, { align: 'center' });

            // Property pages
            for (let i = 0; i < properties.length; i++) {
                const property = properties[i];

                pdf.addPage();
                yPos = margin;

                // Page indicator
                pdf.setFontSize(9);
                pdf.setTextColor(150, 150, 150);
                pdf.setFont(undefined, 'normal');
                pdf.text(`Property ${i + 1} of ${properties.length}`, margin, yPos);

                yPos += 8;

                // Try to add property image
                const firstImage = property.images?.[0]?.image_256 || property.images?.[0]?.src || property.images?.[0];
                if (firstImage && typeof firstImage === 'string' && firstImage.startsWith('http')) {
                    try {
                        const img = await this.loadImageForPDF(firstImage);
                        if (img) {
                            const imgWidth = contentWidth;
                            const targetHeight = 110;

                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

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
                        console.log('[PDF] Could not load image:', imgError.message);
                    }
                }

                // Property title
                pdf.setFontSize(18);
                pdf.setTextColor(...textColor);
                pdf.setFont(undefined, 'bold');
                const titleLines = pdf.splitTextToSize(property.name || property.title || 'Property', contentWidth);
                pdf.text(titleLines, margin, yPos);
                yPos += titleLines.length * 7 + 3;

                // Reference
                pdf.setFontSize(10);
                pdf.setTextColor(128, 128, 128);
                pdf.setFont(undefined, 'normal');
                pdf.text(`Ref: ${property.ref_no || property.ref || ''}`, margin, yPos);

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
                pdf.text(property.type || 'N/A', margin + 28, yPos);
                yPos += 6;

                // Beds & Baths
                const beds = property.bedrooms || property.beds || 0;
                const baths = property.bathrooms || property.baths || 0;
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
                const buildSize = `${property.build_size || property.built_area || 0}m²`;
                const plotSize = `${property.plot_size || 0}m²`;
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
                pdf.text(property.listing_type || property.status || 'For Sale', margin + 28, yPos);

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

            if (window.RealtySoftToast) {
                RealtySoftToast.success(this.label('wishlist_pdf') + ' downloaded!' || 'PDF downloaded!');
            }

            properties.forEach(p => {
                RealtySoftAnalytics.track('wishlist', 'pdf', { property_id: p.ref_no });
            });

        } catch (error) {
            console.error('[Wishlist] PDF generation error:', error);
            if (window.RealtySoftToast) {
                RealtySoftToast.error('Failed to generate PDF');
            }
        }
    }

    loadJsPDF() {
        return new Promise((resolve, reject) => {
            if (window.jspdf) {
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

    loadImageForPDF(src) {
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_modals', RSWishlistModals);
