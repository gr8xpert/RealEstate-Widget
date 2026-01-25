/**
 * RealtySoft Widget v2 - Search Button Component
 * Shows instant property count based on current filters
 */

class RSSearchButton extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.isLoading = false;
        this.propertyCount = null;
        this.countDebounce = null;

        this.render();
        this.bindEvents();

        // Subscribe to loading state
        this.subscribe('ui.loading', (loading) => {
            this.isLoading = loading;
            this.updateDisplay();
        });

        // Subscribe to filter changes to update count
        this.subscribe('filters', (filters, oldValue, path) => {
            console.log('[RealtySoft] Search button: filters changed', { path, filters });
            this.fetchCount();
        });

        // Initial count fetch
        this.fetchCount();
    }

    render() {
        this.element.classList.add('rs-search-button');

        this.element.innerHTML = `
            <button type="button" class="rs-search-button__btn">
                <span class="rs-search-button__text">${this.label('search_button')}</span>
                <span class="rs-search-button__count"></span>
                <span class="rs-search-button__loader" style="display: none;">
                    <svg class="rs-search-button__spinner" width="20" height="20" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                </span>
                <span class="rs-search-button__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                </span>
            </button>
        `;

        this.button = this.element.querySelector('.rs-search-button__btn');
        this.text = this.element.querySelector('.rs-search-button__text');
        this.countEl = this.element.querySelector('.rs-search-button__count');
        this.loader = this.element.querySelector('.rs-search-button__loader');
        this.icon = this.element.querySelector('.rs-search-button__icon');
    }

    bindEvents() {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.isLoading) {
                RealtySoft.search();
            }
        });
    }

    async fetchCount() {
        // Debounce count fetching
        if (this.countDebounce) {
            clearTimeout(this.countDebounce);
        }

        this.countDebounce = setTimeout(async () => {
            try {
                const params = RealtySoftState.getSearchParams();
                params.limit = 1; // Only need count, not actual results
                params.page = 1;
                console.log('[RealtySoft] Search button: fetching count with params', JSON.stringify(params));
                const result = await RealtySoftAPI.searchProperties(params);
                console.log('[RealtySoft] Search button: API result', result);
                // Handle different API response formats for total count
                this.propertyCount = result.total || result.count || result.total_count ||
                                     result.totalCount || result.total_results ||
                                     (result.data ? result.data.length : 0) || 0;
                console.log('[RealtySoft] Search button: count =', this.propertyCount);
                this.updateCountDisplay();
            } catch (e) {
                console.warn('Could not fetch property count:', e);
                this.propertyCount = null;
                this.updateCountDisplay();
            }
        }, 500); // 500ms debounce to match old widget
    }

    updateCountDisplay() {
        if (this.countEl && this.propertyCount !== null && !this.isLoading) {
            this.countEl.textContent = '(' + this.propertyCount + ')';
            this.countEl.style.display = 'inline';
        } else if (this.countEl) {
            this.countEl.style.display = 'none';
        }
    }

    updateDisplay() {
        if (this.isLoading) {
            this.button.disabled = true;
            this.button.classList.add('rs-search-button__btn--loading');
            this.loader.style.display = 'inline-block';
            this.icon.style.display = 'none';
            this.countEl.style.display = 'none';
            this.text.textContent = this.label('results_loading');
        } else {
            this.button.disabled = false;
            this.button.classList.remove('rs-search-button__btn--loading');
            this.loader.style.display = 'none';
            this.icon.style.display = 'inline-block';
            this.text.textContent = this.label('search_button');
            this.updateCountDisplay();
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_search_button', RSSearchButton);
