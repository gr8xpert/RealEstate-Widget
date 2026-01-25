/**
 * RealtySoft Widget v2 - Wishlist Sort Component
 * Sort dropdown for wishlist
 * Attribute: rs_wishlist_sort
 */

class RSWishlistSort extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.currentSort = 'addedAt-desc';
        this.render();
        this.bindEvents();
    }

    render() {
        this.element.classList.add('rs-wishlist-sort-wrapper');

        this.element.innerHTML = `
            <label class="rs-wishlist-sort-label" for="rs-wishlist-sort">
                ${this.label('sort_by') || 'Sort by:'}
            </label>
            <select class="rs-wishlist-sort" id="rs-wishlist-sort">
                <option value="addedAt-desc">${this.label('sort_recent') || 'Recently Added'}</option>
                <option value="addedAt-asc">${this.label('sort_oldest') || 'Oldest First'}</option>
                <option value="price-desc">${this.label('sort_price_desc') || 'Price: High to Low'}</option>
                <option value="price-asc">${this.label('sort_price_asc') || 'Price: Low to High'}</option>
                <option value="title-asc">${this.label('sort_name') || 'Name: A-Z'}</option>
                <option value="location-asc">${this.label('sort_location') || 'Location: A-Z'}</option>
            </select>
        `;

        this.selectEl = this.element.querySelector('.rs-wishlist-sort');
    }

    bindEvents() {
        this.selectEl.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            const [field, order] = this.currentSort.split('-');

            // Map sort fields
            const sortMap = { price: 'list_price', title: 'name' };
            const actualField = sortMap[field] || field;

            // Update WishlistManager and dispatch event
            WishlistManager.setSort(actualField, order);
        });
    }

    getValue() {
        return this.currentSort;
    }

    setValue(value) {
        this.currentSort = value;
        if (this.selectEl) {
            this.selectEl.value = value;
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_sort', RSWishlistSort);
