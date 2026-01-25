/**
 * RealtySoft Widget v2 - Detail Wishlist Component
 * Wishlist button for detail page
 */

class RSDetailWishlist extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        // Get property from options (set before super() calls init())
        this.property = this.options?.property;

        if (!this.property || !this.property.id) {
            this.element.style.display = 'none';
            return;
        }

        // Check WishlistManager first, then fallback to RealtySoftState
        const refNo = this.property.ref_no || this.property.ref || this.property.id;
        this.isInWishlist = window.WishlistManager ? WishlistManager.has(refNo) : RealtySoftState.isInWishlist(this.property.id);

        this.render();
        this.bindEvents();

        // Listen for wishlist changes from WishlistManager
        window.addEventListener('wishlistChanged', () => {
            this.isInWishlist = window.WishlistManager ? WishlistManager.has(refNo) : RealtySoftState.isInWishlist(this.property.id);
            this.updateDisplay();
        });

        // Also listen to RealtySoftState for backwards compatibility
        this.subscribe('wishlist', () => {
            this.isInWishlist = window.WishlistManager ? WishlistManager.has(refNo) : RealtySoftState.isInWishlist(this.property.id);
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-detail-wishlist');

        this.element.innerHTML = `
            <button type="button" class="rs-detail-wishlist__btn ${this.isInWishlist ? 'rs-detail-wishlist__btn--active' : ''}">
                <svg class="rs-detail-wishlist__icon" width="20" height="20" viewBox="0 0 24 24"
                     fill="${this.isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="rs-detail-wishlist__text">
                    ${this.isInWishlist ? this.label('wishlist_remove') : this.label('wishlist_add')}
                </span>
            </button>
        `;

        this.btn = this.element.querySelector('.rs-detail-wishlist__btn');
        this.icon = this.element.querySelector('.rs-detail-wishlist__icon');
        this.text = this.element.querySelector('.rs-detail-wishlist__text');
    }

    bindEvents() {
        this.btn.addEventListener('click', () => {
            this.toggleWishlist();
        });
    }

    toggleWishlist() {
        const refNo = this.property.ref_no || this.property.ref || this.property.id;

        if (this.isInWishlist) {
            // Remove from WishlistManager (stores full data)
            if (window.WishlistManager) {
                WishlistManager.remove(refNo);
            }
            // Also sync with RealtySoftState for backwards compatibility
            RealtySoftState.removeFromWishlist(this.property.id);
            RealtySoftAnalytics.trackWishlistRemove(refNo);

            if (window.RealtySoftToast) {
                RealtySoftToast.success(this.label('wishlist_removed') || 'Removed from wishlist');
            }
        } else {
            // Add to WishlistManager with full property data
            if (window.WishlistManager) {
                WishlistManager.add({
                    id: this.property.id,
                    ref_no: this.property.ref_no || this.property.ref,
                    ref: this.property.ref || this.property.ref_no,
                    name: this.property.title || this.property.name,
                    title: this.property.title || this.property.name,
                    list_price: this.property.price || this.property.list_price,
                    price: this.property.price || this.property.list_price,
                    location: this.property.location || (this.property.location_id?.name),
                    location_id: this.property.location_id,
                    type: this.property.type || (this.property.type_id?.name),
                    type_id: this.property.type_id,
                    bedrooms: this.property.beds || this.property.bedrooms,
                    beds: this.property.beds || this.property.bedrooms,
                    bathrooms: this.property.baths || this.property.bathrooms,
                    baths: this.property.baths || this.property.bathrooms,
                    build_size: this.property.built || this.property.build_size,
                    built_area: this.property.built || this.property.build_size,
                    plot_size: this.property.plot || this.property.plot_size,
                    images: this.property.images || [],
                    listing_type: this.property.listing_type || this.property.status,
                    is_featured: this.property.is_featured || false,
                    is_own: this.property.is_own || false
                });
            }
            // Also sync with RealtySoftState for backwards compatibility
            RealtySoftState.addToWishlist(this.property.id);
            RealtySoftAnalytics.trackWishlistAdd(refNo);

            if (window.RealtySoftToast) {
                RealtySoftToast.success(this.label('wishlist_add') || 'Added to wishlist!');
            }
        }
    }

    updateDisplay() {
        this.btn.classList.toggle('rs-detail-wishlist__btn--active', this.isInWishlist);
        this.icon.setAttribute('fill', this.isInWishlist ? 'currentColor' : 'none');
        this.text.textContent = this.isInWishlist ? this.label('wishlist_remove') : this.label('wishlist_add');
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
