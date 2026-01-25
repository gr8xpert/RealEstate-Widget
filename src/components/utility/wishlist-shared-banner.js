/**
 * RealtySoft Widget v2 - Wishlist Shared Banner Component
 * Shows banner when viewing shared wishlist
 * Attribute: rs_wishlist_shared_banner
 */

class RSWishlistSharedBanner extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.isSharedView = WishlistManager.isSharedView();
        this.render();
    }

    render() {
        this.element.classList.add('rs-wishlist-shared-banner');

        // Hide if not shared view
        if (!this.isSharedView) {
            this.element.style.display = 'none';
            return;
        }

        this.element.innerHTML = `
            <span class="rs-wishlist-shared-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            </span>
            <div class="rs-wishlist-shared-banner__content">
                <strong>${this.label('wishlist_shared_title') || 'Viewing Shared Wishlist'}</strong>
                <p>${this.label('wishlist_shared_desc') || 'This is a read-only view of saved properties'}</p>
            </div>
        `;
    }

    bindEvents() {
        // No events needed for this static component
    }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_shared_banner', RSWishlistSharedBanner);
