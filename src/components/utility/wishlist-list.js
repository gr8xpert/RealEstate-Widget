/**
 * RealtySoft Widget v2 - Wishlist List Component (Combined)
 * Full wishlist page - backward compatible combined component
 * Uses modular sub-components internally
 * Attribute: rs_wishlist_list
 */

class RSWishlistList extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.isSharedView = WishlistManager.isSharedView();
        this.sharedRefNos = this.isSharedView ? WishlistManager.loadSharedWishlist() : [];
        this.subComponents = [];

        this.render();
        this.initSubComponents();
    }

    render() {
        this.element.classList.add('rs-wishlist-list');

        // Create container structure that positions all sub-components
        this.element.innerHTML = `
            <!-- Shared Banner -->
            <div class="rs_wishlist_shared_banner"></div>

            <!-- Header -->
            <div class="rs-wishlist-list__header">
                <div class="rs-wishlist-list__header-left">
                    <div class="rs_wishlist_header"></div>
                </div>
            </div>

            <!-- Actions Bar -->
            <div class="rs-wishlist-actions-wrapper">
                <div class="rs_wishlist_actions"></div>
                <div class="rs_wishlist_sort"></div>
            </div>

            <!-- Loading State -->
            <div class="rs-wishlist-list__loader">
                <div class="rs-wishlist-list__spinner"></div>
                <p>${this.label('results_loading') || 'Loading...'}</p>
            </div>

            <!-- Empty State -->
            <div class="rs_wishlist_empty"></div>

            <!-- Property Grid -->
            <div class="rs_wishlist_grid"></div>

            <!-- Floating Compare Button -->
            <div class="rs_wishlist_compare_btn"></div>

            <!-- Modals -->
            <div class="rs_wishlist_modals"></div>
        `;

        // Cache DOM references
        this.loader = this.element.querySelector('.rs-wishlist-list__loader');

        // Listen for wishlist changes to toggle loader
        window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
            this.hideLoader();
        });

        // Hide loader after short delay to let sub-components initialize
        setTimeout(() => this.hideLoader(), 100);
    }

    initSubComponents() {
        // Initialize each sub-component within this combined view
        const componentMappings = [
            { selector: '.rs_wishlist_shared_banner', Component: RSWishlistSharedBanner },
            { selector: '.rs_wishlist_header', Component: RSWishlistHeader },
            { selector: '.rs_wishlist_actions', Component: RSWishlistActions },
            { selector: '.rs_wishlist_sort', Component: RSWishlistSort },
            { selector: '.rs_wishlist_empty', Component: RSWishlistEmpty },
            { selector: '.rs_wishlist_grid', Component: RSWishlistGrid },
            { selector: '.rs_wishlist_compare_btn', Component: RSWishlistCompareBtn },
            { selector: '.rs_wishlist_modals', Component: RSWishlistModals }
        ];

        componentMappings.forEach(({ selector, Component }) => {
            const el = this.element.querySelector(selector);
            if (el && typeof Component !== 'undefined') {
                try {
                    const instance = new Component(el, this.options);
                    this.subComponents.push(instance);
                    el._rsComponent = instance;
                } catch (error) {
                    console.warn(`[Wishlist] Failed to initialize ${selector}:`, error);
                }
            }
        });
    }

    hideLoader() {
        if (this.loader) {
            this.loader.style.display = 'none';
        }
    }

    showLoader() {
        if (this.loader) {
            this.loader.style.display = 'flex';
        }
    }

    bindEvents() {
        // Events are handled by sub-components
    }

    // Public API for backward compatibility
    getProperties() {
        const gridComponent = this.element.querySelector('.rs_wishlist_grid')?._rsComponent;
        return gridComponent ? gridComponent.getProperties() : [];
    }

    openShareModal() {
        WishlistManager.openModal('share');
    }

    openEmailModal() {
        WishlistManager.openModal('email');
    }

    openNoteModal(refNo) {
        WishlistManager.openModal('note', { refNo });
    }

    openCompareModal() {
        WishlistManager.openModal('compare');
    }

    downloadPDF() {
        WishlistManager.openModal('pdf');
    }

    destroy() {
        // Destroy all sub-components
        this.subComponents.forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        this.subComponents = [];

        super.destroy();
    }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_list', RSWishlistList);
