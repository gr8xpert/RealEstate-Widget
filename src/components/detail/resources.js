/**
 * RealtySoft Widget v2 - Detail Resources Component
 * Additional resources (Video Tour, Virtual Tour, PDF Download)
 */

class RSDetailResources extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.property = this.options?.property;

        if (!this.property) {
            this.element.style.display = 'none';
            return;
        }

        const p = this.property;
        // Check if we have any resources
        if (!p.video_url && !p.virtual_tour_url && !p.pdf_url) {
            this.element.style.display = 'none';
            return;
        }

        this.render();
        this.bindEvents();
    }

    render() {
        const p = this.property;
        this.element.classList.add('rs-detail-resources');

        const resources = [];

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

        if (p.pdf_url) {
            resources.push({
                type: 'pdf',
                url: p.pdf_url,
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

    bindEvents() {
        // Resource buttons
        this.element.querySelectorAll('.rs-detail-resources__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const url = btn.dataset.url;
                const isEmbed = btn.dataset.embed === 'true';

                if (type === 'pdf') {
                    window.open(url, '_blank');
                    RealtySoftAnalytics.trackResourceClick('pdf', this.property.id);
                } else if (isEmbed) {
                    this.openModal(type, url);
                    RealtySoftAnalytics.trackResourceClick(type, this.property.id);
                } else {
                    window.open(url, '_blank');
                    RealtySoftAnalytics.trackResourceClick(type, this.property.id);
                }
            });
        });

        // Modal close
        this.modal.querySelector('.rs-detail-resources__modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        this.modal.querySelector('.rs-detail-resources__modal-backdrop').addEventListener('click', () => {
            this.closeModal();
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    openModal(type, url) {
        let embedHtml = '';

        if (type === 'video') {
            const embedUrl = this.getVideoEmbedUrl(url);
            embedHtml = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        } else if (type === 'tour') {
            embedHtml = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
        }

        this.modalBody.innerHTML = embedHtml;
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.modalBody.innerHTML = '';
        document.body.style.overflow = '';
    }

    getVideoEmbedUrl(url) {
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

    isEmbeddable(url) {
        return url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');
    }

    getIcon(type) {
        const icons = {
            video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
            tour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
            pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>'
        };
        return icons[type] || icons.pdf;
    }

    escapeAttr(text) {
        if (!text) return '';
        return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
