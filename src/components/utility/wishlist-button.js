/**
 * RealtySoft Widget v2 - Wishlist Button Component
 * Generic wishlist toggle button (requires property ID)
 */

class RSWishlistButton extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.propertyId = parseInt(this.element.dataset.propertyId);

        if (!this.propertyId) {
            console.warn('Wishlist button requires data-property-id');
            return;
        }

        this.isInWishlist = RealtySoftState.isInWishlist(this.propertyId);

        this.render();
        this.bindEvents();

        this.subscribe('wishlist', () => {
            this.isInWishlist = RealtySoftState.isInWishlist(this.propertyId);
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-wishlist-button');

        this.element.innerHTML = `
            <button type="button"
                    class="rs-wishlist-button__btn ${this.isInWishlist ? 'rs-wishlist-button__btn--active' : ''}"
                    aria-label="${this.isInWishlist ? this.label('wishlist_remove') : this.label('wishlist_add')}">
                <svg class="rs-wishlist-button__icon" width="20" height="20" viewBox="0 0 24 24"
                     fill="${this.isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        `;

        this.btn = this.element.querySelector('.rs-wishlist-button__btn');
        this.icon = this.element.querySelector('.rs-wishlist-button__icon');
    }

    bindEvents() {
        this.btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleWishlist();
        });
    }

    toggleWishlist() {
        if (this.isInWishlist) {
            RealtySoftState.removeFromWishlist(this.propertyId);
            RealtySoftAnalytics.trackWishlistRemove(this.propertyId);
        } else {
            RealtySoftState.addToWishlist(this.propertyId);
            RealtySoftAnalytics.trackWishlistAdd(this.propertyId);
        }
    }

    updateDisplay() {
        this.btn.classList.toggle('rs-wishlist-button__btn--active', this.isInWishlist);
        this.btn.setAttribute('aria-label', this.isInWishlist ? this.label('wishlist_remove') : this.label('wishlist_add'));
        this.icon.setAttribute('fill', this.isInWishlist ? 'currentColor' : 'none');
    }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_button', RSWishlistButton);
