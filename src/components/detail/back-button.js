/**
 * RealtySoft Widget v2 - Detail Back Button Component
 * Back to search results button
 */

class RSDetailBackButton extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.element.classList.add('rs-detail-back');

        // Try to get the search URL from various sources
        const searchUrl = this.getSearchUrl();

        this.element.innerHTML = `
            <a href="${searchUrl}" class="rs-detail-back__btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>${this.label('detail_back_to_search') || 'Back to Search'}</span>
            </a>
        `;
    }

    getSearchUrl() {
        // Check for referrer from search page
        const referrer = document.referrer;
        if (referrer && referrer.includes(window.location.hostname)) {
            // Check if referrer is a search/listing page
            if (referrer.includes('search') || referrer.includes('listing') ||
                referrer.includes('properties') || referrer.includes('property-list')) {
                return referrer;
            }
        }

        // Check session storage for last search URL
        const lastSearch = sessionStorage.getItem('rs_last_search_url');
        if (lastSearch) {
            return lastSearch;
        }

        // Check for data attribute
        if (this.element.dataset.searchUrl) {
            return this.element.dataset.searchUrl;
        }

        // Default fallback - use history back
        return 'javascript:history.back()';
    }

    bindEvents() {
        const btn = this.element.querySelector('.rs-detail-back__btn');
        const href = btn.getAttribute('href');

        // If using history.back(), handle it with JS
        if (href === 'javascript:history.back()') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // Fallback to home or search page
                    window.location.href = '/';
                }
            });
        }
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
