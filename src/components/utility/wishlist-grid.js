/**
 * RealtySoft Widget v2 - Wishlist Grid Component
 * Property cards display with carousel, compare, remove functionality
 * Attribute: rs_wishlist_grid
 */

class RSWishlistGrid extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.properties = [];
        this.isSharedView = WishlistManager.isSharedView();
        this.sharedRefNos = this.isSharedView ? WishlistManager.loadSharedWishlist() : [];
        this.isLoading = true;

        // Check if compare feature is enabled (compare button exists on page)
        this.compareEnabled = this.checkCompareEnabled();

        // Check for template attribute (e.g., data-template="08")
        this.template = this.element.dataset.template || null;

        this.render();
        this.bindEvents();
        this.loadProperties();
    }

    /**
     * Check if compare feature is enabled by looking for compare button on page
     */
    checkCompareEnabled() {
        // Compare is enabled if there's a compare button component on the page
        // or if we're inside a combined wishlist-list component
        const compareBtn = document.querySelector('.rs_wishlist_compare_btn, .rs-wishlist-compare-float');
        const isInsideCombined = this.element.closest('.rs_wishlist_list, .rs-wishlist-list');
        return !!(compareBtn || isInsideCombined);
    }

    render() {
        this.element.classList.add('rs-wishlist-list__grid');

        // Apply template class if specified
        if (this.template) {
            this.element.classList.add(`rs-wishlist-template-${this.template}`);
        }

        // Show loading initially
        this.element.innerHTML = `
            <div class="rs-wishlist-grid__loading">
                <div class="rs-wishlist-list__spinner"></div>
                <p>${this.label('results_loading') || 'Loading...'}</p>
            </div>
        `;
    }

    bindEvents() {
        // Listen for wishlist changes
        if (!this.isSharedView) {
            window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
                this.loadProperties();
            });
        }

        // Listen for sort changes
        window.addEventListener(WishlistManager.EVENTS.SORTED, () => {
            this.sortAndRender();
        });

        // Listen for compare changes to update checkboxes
        window.addEventListener(WishlistManager.EVENTS.COMPARE_CHANGED, () => {
            this.updateCompareCheckboxes();
        });

        // Delegate card events
        this.element.addEventListener('click', (e) => this.handleCardClick(e));
    }

    async loadProperties() {
        this.isLoading = true;

        if (this.isSharedView) {
            await this.loadSharedProperties();
        } else {
            this.loadOwnWishlist();
        }
    }

    loadOwnWishlist() {
        const sort = WishlistManager.getSort();
        this.properties = WishlistManager.getAsArray(sort.field, sort.order);

        if (this.properties.length === 0) {
            this.element.style.display = 'none';
        } else {
            this.element.style.display = 'grid';
            this.renderProperties();
        }

        this.isLoading = false;

        // Track view
        this.properties.forEach(p => {
            RealtySoftAnalytics.track('wishlist', 'viewed', { property_id: p.ref_no });
        });
    }

    async loadSharedProperties() {
        try {
            const properties = [];

            for (const refNo of this.sharedRefNos) {
                try {
                    const result = await RealtySoftAPI.request('v1/property', { ref_no: refNo });
                    if (result && result.data && result.data.length > 0) {
                        const prop = result.data[0];
                        properties.push({
                            id: prop.id,
                            ref_no: prop.ref_no || refNo,
                            ref: prop.ref_no || refNo,
                            name: prop.name || 'Property',
                            title: prop.name || 'Property',
                            list_price: Number(prop.list_price) || 0,
                            price: Number(prop.list_price) || 0,
                            location: prop.location_id?.name || 'N/A',
                            type: prop.type_id?.name || 'N/A',
                            bedrooms: Number(prop.bedrooms) || 0,
                            beds: Number(prop.bedrooms) || 0,
                            bathrooms: Number(prop.bathrooms) || 0,
                            baths: Number(prop.bathrooms) || 0,
                            build_size: Number(prop.build_size) || 0,
                            built_area: Number(prop.build_size) || 0,
                            plot_size: Number(prop.plot_size) || 0,
                            images: prop.images || [],
                            listing_type: prop.listing_type || 'resale',
                            is_featured: prop.is_featured || false,
                            is_own: prop.is_own || false
                        });
                    }
                } catch (err) {
                    console.warn(`[Wishlist] Could not load property ${refNo}:`, err);
                }
            }

            this.properties = properties;

            if (properties.length === 0) {
                this.element.style.display = 'none';
            } else {
                this.element.style.display = 'grid';
                this.renderProperties();
            }

            this.isLoading = false;
        } catch (error) {
            console.error('[Wishlist] Error loading shared wishlist:', error);
            this.isLoading = false;
        }
    }

    sortAndRender() {
        if (this.isSharedView) return;

        const sort = WishlistManager.getSort();
        this.properties = WishlistManager.getAsArray(sort.field, sort.order);
        this.renderProperties();
    }

    renderProperties() {
        this.element.innerHTML = this.properties.map(p => this.createCard(p)).join('');
    }

    createCard(property) {
        // Handle both old format (images array) and new format (single image string)
        let imageUrls = [];
        if (property.images && Array.isArray(property.images)) {
            imageUrls = property.images.slice(0, 5).map(img => img.image_256 || img.src || img).filter(Boolean);
        } else if (property.image) {
            imageUrls = [property.image];
        }
        const placeholderImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="192"%3E%3Crect fill="%23ecf0f1" width="256" height="192"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23bdc3c7" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';

        const price = this.formatPrice(property);
        const propertyUrl = this.generatePropertyUrl(property);
        const addedDate = property.addedAt ? new Date(property.addedAt).toLocaleDateString() : '';
        const refNo = property.ref_no || property.ref || property.id;
        const isCompareSelected = WishlistManager.isInCompare(refNo);

        const formatRange = (v1, v2) => (v2 && v1 !== v2) ? `${v1}-${v2}` : (v1 || 0);

        const tags = this.generateTags(property);

        return `
            <div class="rs-wishlist-card" data-ref-no="${refNo}">
                <div class="rs-wishlist-card__carousel">
                    ${tags}
                    ${!this.isSharedView ? `
                        ${this.compareEnabled ? `
                            <div class="rs-wishlist-card__compare">
                                <input type="checkbox" id="compare-${refNo}" class="rs-compare-check" ${isCompareSelected ? 'checked' : ''}>
                                <label for="compare-${refNo}">${this.label('compare') || 'Compare'}</label>
                            </div>
                        ` : ''}
                        <button type="button" class="rs-wishlist-card__heart active" data-action="remove">
                            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                    ` : ''}
                    <a href="${propertyUrl}" class="rs-wishlist-card__carousel-link">
                        <div class="rs-wishlist-card__carousel-track">
                            ${imageUrls.length > 0
                                ? imageUrls.map((url, i) => `<img src="${url}" alt="${this.escapeHtml(property.name || property.title)} - ${i+1}" ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} onerror="this.src='${placeholderImg}'">`).join('')
                                : `<img src="${placeholderImg}" alt="No image">`
                            }
                        </div>
                    </a>
                    ${imageUrls.length > 1 ? `
                        <button type="button" class="rs-wishlist-card__nav rs-wishlist-card__nav--prev" data-action="prev">&#8249;</button>
                        <button type="button" class="rs-wishlist-card__nav rs-wishlist-card__nav--next" data-action="next">&#8250;</button>
                        <div class="rs-wishlist-card__indicators">
                            ${imageUrls.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}
                        </div>
                    ` : ''}
                    ${(property.image_count || imageUrls.length) > 0 ? `
                        <div class="rs-wishlist-card__img-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>${property.image_count || imageUrls.length}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="rs-wishlist-card__content">
                    <a href="${propertyUrl}" class="rs-wishlist-card__title">${this.escapeHtml(property.name || property.title)}</a>
                    <a href="${propertyUrl}" class="rs-wishlist-card__price">${price}</a>
                    <div class="rs-wishlist-card__details">
                        <span>${this.escapeHtml(property.location || 'N/A')}</span>
                        <span>${this.escapeHtml(property.type || 'N/A')}</span>
                        <span>${property.beds || property.bedrooms || 0} ${this.label('card_beds') || 'beds'}</span>
                        <span>${property.baths || property.bathrooms || 0} ${this.label('card_baths') || 'baths'}</span>
                        <span>${property.built || property.build_size || property.built_area || 0}m²</span>
                    </div>
                    ${addedDate ? `<div class="rs-wishlist-card__added">${this.label('added') || 'Added'}: ${addedDate}</div>` : ''}
                    ${property.note ? `
                        <div class="rs-wishlist-card__note">
                            <strong>📝 ${this.label('note') || 'Note'}:</strong> ${this.escapeHtml(property.note)}
                        </div>
                    ` : (!this.isSharedView ? `
                        <button type="button" class="rs-wishlist-card__add-note" data-action="addNote">📝 ${this.label('wishlist_add_note') || 'Add Note'}</button>
                    ` : '')}
                    <div class="rs-wishlist-card__footer">
                        <span class="rs-wishlist-card__ref">Ref: ${refNo}</span>
                        <a href="${propertyUrl}" class="rs-wishlist-card__view">${this.label('view_details') || 'View Details'}</a>
                    </div>
                </div>
            </div>
        `;
    }

    generateTags(property) {
        const tags = [];
        const listingType = property.listing_type || property.status;

        if (listingType) {
            const typeMap = {
                resale: { label: 'For Sale', class: 'rs-tag--sale' },
                sale: { label: 'For Sale', class: 'rs-tag--sale' },
                development: { label: 'New Development', class: 'rs-tag--development' },
                new_development: { label: 'New Development', class: 'rs-tag--development' },
                long_rental: { label: 'Rental', class: 'rs-tag--rental' },
                rent: { label: 'Rental', class: 'rs-tag--rental' },
                short_rental: { label: 'Holiday Rental', class: 'rs-tag--holiday' },
                holiday: { label: 'Holiday Rental', class: 'rs-tag--holiday' }
            };
            const info = typeMap[listingType.toLowerCase()] || { label: listingType, class: 'rs-tag--sale' };
            tags.push(`<span class="rs-tag ${info.class}">${info.label}</span>`);
        }

        if (property.is_featured) {
            tags.push(`<span class="rs-tag rs-tag--featured">${this.label('featured') || 'Featured'}</span>`);
        }

        if (property.is_own) {
            tags.push(`<span class="rs-tag rs-tag--own">${this.label('own') || 'Own'}</span>`);
        }

        return tags.length > 0 ? `<div class="rs-wishlist-card__tags">${tags.join('')}</div>` : '';
    }

    formatPrice(property) {
        const price1 = Number(property.list_price || property.price || 0);
        const price2 = Number(property.list_price_2 || 0);

        if (price2 && price1 !== price2) {
            return `€${price1.toLocaleString()} - €${price2.toLocaleString()}`;
        }
        return `€${price1.toLocaleString()}`;
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

    handleCardClick(e) {
        const card = e.target.closest('.rs-wishlist-card');
        if (!card) return;

        const refNo = card.dataset.refNo;
        const action = e.target.closest('[data-action]')?.dataset.action;

        if (action === 'remove') {
            e.preventDefault();
            e.stopPropagation();
            if (confirm(this.label('wishlist_confirm_remove') || 'Remove this property from your wishlist?')) {
                WishlistManager.remove(refNo);
                RealtySoftAnalytics.track('wishlist', 'removed', { property_id: refNo });
                if (window.RealtySoftToast) {
                    RealtySoftToast.success(this.label('wishlist_removed') || 'Removed from wishlist');
                }
            }
            return;
        }

        if (action === 'addNote') {
            e.preventDefault();
            e.stopPropagation();
            WishlistManager.openModal('note', { refNo });
            return;
        }

        if (action === 'prev' || action === 'next') {
            e.preventDefault();
            e.stopPropagation();
            this.navigateCarousel(card, action);
            return;
        }

        // Compare checkbox
        const compareCheck = e.target.closest('.rs-compare-check');
        if (compareCheck) {
            this.handleCompareToggle(refNo, compareCheck.checked);
            return;
        }
    }

    navigateCarousel(card, direction) {
        const track = card.querySelector('.rs-wishlist-card__carousel-track');
        const indicators = card.querySelectorAll('.rs-wishlist-card__indicators span');
        const images = track.querySelectorAll('img');

        if (images.length <= 1) return;

        let currentIndex = Array.from(indicators).findIndex(i => i.classList.contains('active'));
        if (currentIndex === -1) currentIndex = 0;

        const newIndex = direction === 'next'
            ? (currentIndex + 1) % images.length
            : (currentIndex - 1 + images.length) % images.length;

        track.style.transform = `translateX(-${newIndex * 100}%)`;

        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === newIndex);
        });
    }

    handleCompareToggle(refNo, isChecked) {
        if (isChecked) {
            const result = WishlistManager.addToCompare(refNo);
            if (!result) {
                if (window.RealtySoftToast) {
                    const max = WishlistManager.getMaxCompare();
                    RealtySoftToast.warning(`${this.label('compare_max') || 'Maximum'} ${max} ${this.label('properties') || 'properties'}`);
                }
                // Uncheck the checkbox
                const checkbox = this.element.querySelector(`#compare-${refNo}`);
                if (checkbox) checkbox.checked = false;
            }
        } else {
            WishlistManager.removeFromCompare(refNo);
        }
    }

    updateCompareCheckboxes() {
        this.element.querySelectorAll('.rs-compare-check').forEach(checkbox => {
            const refNo = checkbox.id.replace('compare-', '');
            checkbox.checked = WishlistManager.isInCompare(refNo);
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getProperties() {
        return this.properties;
    }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_grid', RSWishlistGrid);
