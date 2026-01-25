/**
 * RealtySoft Widget v2 - Detail Gallery Component
 * Image carousel with lightbox
 */

class RSDetailGallery extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        // Get property from options (set before super() calls init())
        this.property = this.options?.property;

        if (!this.property) {
            this.element.style.display = 'none';
            return;
        }

        // Use full-size images for gallery, fallback to regular images
        this.images = this.property.imagesFull || this.property.images || [];
        this.currentIndex = 0;
        this.lightboxOpen = false;

        if (this.images.length === 0) {
            this.element.style.display = 'none';
            return;
        }

        this.render();
        this.bindEvents();
    }

    render() {
        this.element.classList.add('rs-detail-gallery');

        this.element.innerHTML = `
            <div class="rs-detail-gallery__main">
                <div class="rs-detail-gallery__main-image">
                    <img src="${this.images[0]}" alt="" class="rs-detail-gallery__image" loading="eager" fetchpriority="high">
                    <button class="rs-detail-gallery__fullscreen" type="button" aria-label="Fullscreen">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    </button>
                    ${this.images.length > 1 ? `
                        <button class="rs-detail-gallery__nav rs-detail-gallery__nav--prev" type="button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button class="rs-detail-gallery__nav rs-detail-gallery__nav--next" type="button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    ` : ''}
                    <div class="rs-detail-gallery__counter">${this.currentIndex + 1} / ${this.images.length}</div>
                </div>
            </div>
            ${this.images.length > 1 ? `
                <div class="rs-detail-gallery__thumbs">
                    ${this.images.map((img, i) => `
                        <button class="rs-detail-gallery__thumb ${i === 0 ? 'rs-detail-gallery__thumb--active' : ''}"
                                type="button"
                                data-index="${i}">
                            <img src="${img}" alt="" loading="lazy">
                        </button>
                    `).join('')}
                </div>
            ` : ''}

            <div class="rs-detail-gallery__lightbox" style="display: none;">
                <div class="rs-detail-gallery__lightbox-backdrop"></div>
                <div class="rs-detail-gallery__lightbox-content">
                    <button class="rs-detail-gallery__lightbox-close" type="button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <img src="" alt="" class="rs-detail-gallery__lightbox-image">
                    ${this.images.length > 1 ? `
                        <button class="rs-detail-gallery__lightbox-nav rs-detail-gallery__lightbox-nav--prev" type="button">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button class="rs-detail-gallery__lightbox-nav rs-detail-gallery__lightbox-nav--next" type="button">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    ` : ''}
                    <div class="rs-detail-gallery__lightbox-counter">${this.currentIndex + 1} / ${this.images.length}</div>
                </div>
            </div>
        `;

        this.mainImage = this.element.querySelector('.rs-detail-gallery__image');
        this.counter = this.element.querySelector('.rs-detail-gallery__counter');
        this.thumbs = this.element.querySelectorAll('.rs-detail-gallery__thumb');
        this.lightbox = this.element.querySelector('.rs-detail-gallery__lightbox');
        this.lightboxImage = this.element.querySelector('.rs-detail-gallery__lightbox-image');
        this.lightboxCounter = this.element.querySelector('.rs-detail-gallery__lightbox-counter');
    }

    bindEvents() {
        // Main navigation
        this.element.querySelector('.rs-detail-gallery__nav--prev')?.addEventListener('click', () => this.prev());
        this.element.querySelector('.rs-detail-gallery__nav--next')?.addEventListener('click', () => this.next());

        // Thumbnails
        this.thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.goToImage(parseInt(thumb.dataset.index));
            });
        });

        // Fullscreen / Lightbox
        this.element.querySelector('.rs-detail-gallery__fullscreen')?.addEventListener('click', () => this.openLightbox());
        this.mainImage?.addEventListener('click', () => this.openLightbox());

        // Lightbox navigation
        this.element.querySelector('.rs-detail-gallery__lightbox-nav--prev')?.addEventListener('click', () => this.prev());
        this.element.querySelector('.rs-detail-gallery__lightbox-nav--next')?.addEventListener('click', () => this.next());
        this.element.querySelector('.rs-detail-gallery__lightbox-close')?.addEventListener('click', () => this.closeLightbox());
        this.element.querySelector('.rs-detail-gallery__lightbox-backdrop')?.addEventListener('click', () => this.closeLightbox());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightboxOpen) return;

            if (e.key === 'ArrowLeft') this.prev();
            else if (e.key === 'ArrowRight') this.next();
            else if (e.key === 'Escape') this.closeLightbox();
        });

        // Touch swipe
        let touchStartX = 0;
        this.element.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.element.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) this.next();
                else this.prev();
            }
        });
    }

    goToImage(index) {
        if (index < 0) index = this.images.length - 1;
        if (index >= this.images.length) index = 0;

        this.currentIndex = index;

        // Update main image
        this.mainImage.src = this.images[index];

        // Update counter
        if (this.counter) {
            this.counter.textContent = `${index + 1} / ${this.images.length}`;
        }

        // Update thumbnails
        this.thumbs.forEach((thumb, i) => {
            thumb.classList.toggle('rs-detail-gallery__thumb--active', i === index);
        });

        // Update lightbox if open
        if (this.lightboxOpen) {
            this.lightboxImage.src = this.images[index];
            if (this.lightboxCounter) {
                this.lightboxCounter.textContent = `${index + 1} / ${this.images.length}`;
            }
        }

        // Track gallery view
        RealtySoftAnalytics.trackGalleryView(this.property.id, index);
    }

    prev() {
        this.goToImage(this.currentIndex - 1);
    }

    next() {
        this.goToImage(this.currentIndex + 1);
    }

    openLightbox() {
        this.lightboxOpen = true;
        this.lightbox.style.display = 'flex';
        this.lightboxImage.src = this.images[this.currentIndex];
        if (this.lightboxCounter) {
            this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        }
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightboxOpen = false;
        this.lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
