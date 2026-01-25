/**
 * RealtySoft Widget v2 - Wishlist Header Component
 * Shows title and property count
 * Attribute: rs_wishlist_header
 */

class RSWishlistHeader extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.isSharedView = WishlistManager.isSharedView();
        this.render();
        this.bindEvents();
    }

    render() {
        this.element.classList.add('rs-wishlist-header');

        const title = this.isSharedView
            ? this.label('wishlist_shared_title') || 'Shared Wishlist'
            : this.label('wishlist_title') || 'My Wishlist';

        this.element.innerHTML = `
            <h1 class="rs-wishlist-header__title">${title}</h1>
            <p class="rs-wishlist-header__subtitle">${this.label('results_loading') || 'Loading...'}</p>
        `;

        this.subtitleEl = this.element.querySelector('.rs-wishlist-header__subtitle');
        this.updateCount();
    }

    bindEvents() {
        // Listen for wishlist changes
        window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
            this.updateCount();
        });
    }

    updateCount() {
        let count;

        if (this.isSharedView) {
            const sharedRefs = WishlistManager.loadSharedWishlist();
            count = sharedRefs ? sharedRefs.length : 0;
        } else {
            count = WishlistManager.count();
        }

        if (count === 0) {
            this.subtitleEl.textContent = this.label('wishlist_no_properties') || 'No properties saved';
        } else {
            const propertyLabel = count === 1
                ? this.label('property') || 'property'
                : this.label('properties') || 'properties';
            const savedLabel = this.label('saved') || 'saved';
            this.subtitleEl.textContent = `${count} ${propertyLabel} ${savedLabel}`;
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_header', RSWishlistHeader);
