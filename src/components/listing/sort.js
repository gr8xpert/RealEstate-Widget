/**
 * RealtySoft Widget v2 - Sort Component
 * Dropdown for sorting results
 */

class RSSort extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.currentSort = RealtySoftState.get('ui.sort') || 'create_date_desc';
        // Full sort options matching API
        this.sortOptions = [
            { value: 'create_date_desc', label: this.label('sort_newest') || 'Newest Listings' },
            { value: 'create_date', label: this.label('sort_oldest') || 'Oldest Listings' },
            { value: 'last_date_desc', label: this.label('sort_updated') || 'Recently Updated' },
            { value: 'last_date', label: this.label('sort_oldest_updated') || 'Oldest Updated' },
            { value: 'list_price', label: this.label('sort_price_asc') || 'Price: Low to High' },
            { value: 'list_price_desc', label: this.label('sort_price_desc') || 'Price: High to Low' },
            { value: 'is_featured_desc', label: this.label('sort_featured') || 'Featured First' },
            { value: 'location_id', label: this.label('sort_location') || 'By Location' },
            { value: 'is_own_desc', label: this.label('sort_own') || 'Own Properties First' }
        ];

        this.render();
        this.bindEvents();

        this.subscribe('ui.sort', (sort) => {
            this.currentSort = sort;
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-sort');

        this.element.innerHTML = `
            <div class="rs-sort__wrapper">
                <label class="rs-sort__label">${this.label('results_sort')}</label>
                <div class="rs-sort__select-wrapper">
                    <select class="rs-sort__select">
                        ${this.sortOptions.map(opt => `
                            <option value="${opt.value}" ${this.currentSort === opt.value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                    <span class="rs-sort__icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                </div>
            </div>
        `;

        this.select = this.element.querySelector('.rs-sort__select');
    }

    bindEvents() {
        this.select.addEventListener('change', (e) => {
            RealtySoft.setSort(e.target.value);
        });
    }

    updateDisplay() {
        if (this.select) {
            this.select.value = this.currentSort;
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_sort', RSSort);
