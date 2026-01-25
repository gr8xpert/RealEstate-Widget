/**
 * RealtySoft Widget v2 - Features Component
 * Popup with categories, checkboxes, and search filter
 */

class RSFeatures extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('features');
        this.features = RealtySoftState.get('data.features') || [];
        this.selectedFeatures = new Set(this.getFilter('features') || []);
        this.isOpen = false;
        this.searchTerm = '';
        this.expandedCategories = new Set();
        this.isLoadingFeatures = false;

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        this.subscribe('data.features', (features) => {
            this.features = features;
            this.updateCategoryList();
        });

        this.subscribe('filters.features', (value) => {
            this.selectedFeatures = new Set(value || []);
            this.updateDisplay();
        });
    }

    /**
     * Load features on demand (when user clicks button)
     * Only loads if not already loaded, caches in localStorage via API
     */
    async loadFeaturesOnDemand() {
        // Already loaded or currently loading
        if (RealtySoftState.get('data.featuresLoaded') || this.isLoadingFeatures) {
            return;
        }

        this.isLoadingFeatures = true;
        console.log('[RealtySoft] Loading features on demand...');

        try {
            const result = await RealtySoftAPI.getFeatures();
            RealtySoftState.set('data.features', result.data || []);
            RealtySoftState.set('data.featuresLoaded', true);
            this.features = result.data || [];
            console.log('[RealtySoft] Features loaded on demand:', this.features.length);
        } catch (e) {
            console.error('[RealtySoft] Failed to load features:', e);
        } finally {
            this.isLoadingFeatures = false;
        }
    }

    // Build parent-child map from API structure
    // API returns: [{id, name, value_ids: [{id, name}, ...]}, ...]
    buildFeatureMap() {
        return this.features
            .filter(category => category.value_ids && category.value_ids.length > 0)
            .map(category => ({
                id: category.id,
                name: category.name,
                children: (category.value_ids || []).sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '')
                )
            }))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Filter features by search term
    getFilteredFeatureMap() {
        const allCategories = this.buildFeatureMap();

        if (!this.searchTerm) {
            return allCategories;
        }

        const searchLower = this.searchTerm.toLowerCase();
        const filtered = [];

        allCategories.forEach(category => {
            // Check if category name matches
            const categoryMatches = (category.name || '').toLowerCase().includes(searchLower);

            // Filter children that match
            const matchingChildren = category.children.filter(child =>
                (child.name || '').toLowerCase().includes(searchLower)
            );

            // Include category if it matches or has matching children
            if (categoryMatches || matchingChildren.length > 0) {
                filtered.push({
                    ...category,
                    children: categoryMatches ? category.children : matchingChildren
                });
            }
        });

        return filtered;
    }

    render() {
        this.element.classList.add('rs-features');

        const count = this.selectedFeatures.size;
        const buttonText = count > 0 ? (count + ' feature' + (count > 1 ? 's' : '') + ' selected') : this.label('search_features_placeholder') || 'Select Features';

        this.element.innerHTML = `
            <div class="rs-features__wrapper">
                <label class="rs-features__label">${this.label('search_features')}</label>
                <button type="button" class="rs-features__trigger">
                    <span class="rs-features__trigger-text">${buttonText}</span>
                    <span class="rs-features__trigger-arrow">▼</span>
                </button>
            </div>
        `;

        // Create modal popup (appended to body for proper positioning)
        this.overlay = document.createElement('div');
        this.overlay.className = 'rs-features__overlay';
        this.overlay.style.display = 'none';
        this.overlay.innerHTML = `
            <div class="rs-features__modal">
                <div class="rs-features__modal-header">
                    <h3 class="rs-features__modal-title">${this.label('search_features')}</h3>
                    <button type="button" class="rs-features__modal-close">&times;</button>
                </div>
                <div class="rs-features__modal-search">
                    <input type="text"
                           class="rs-features__search"
                           placeholder="${this.label('search_features_filter') || 'Search features...'}"
                           autocomplete="off">
                </div>
                <div class="rs-features__modal-body">
                    <div class="rs-features__categories"></div>
                </div>
                <div class="rs-features__modal-footer">
                    <button type="button" class="rs-features__clear-btn">${this.label('general_clear') || 'Clear'}</button>
                    <button type="button" class="rs-features__done-btn">${this.label('general_close') || 'Done'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        this.trigger = this.element.querySelector('.rs-features__trigger');
        this.triggerText = this.element.querySelector('.rs-features__trigger-text');
        this.modal = this.overlay.querySelector('.rs-features__modal');
        this.searchInput = this.overlay.querySelector('.rs-features__search');
        this.categoriesContainer = this.overlay.querySelector('.rs-features__categories');

        this.updateCategoryList();
    }

    updateCategoryList() {
        if (!this.categoriesContainer) return;

        const categories = this.getFilteredFeatureMap();

        if (categories.length === 0) {
            this.categoriesContainer.innerHTML = `
                <div class="rs-features__empty">No features found</div>
            `;
            return;
        }

        let html = '';

        categories.forEach(category => {
            const categoryKey = category.id.toString();
            const isExpanded = this.expandedCategories.has(categoryKey) || this.searchTerm;
            const selectedInCategory = category.children.filter(f => this.selectedFeatures.has(f.id)).length;

            html += `
                <div class="rs-features__category ${isExpanded ? 'rs-features__category--expanded' : ''}">
                    <div class="rs-features__category-header" data-category="${categoryKey}">
                        <span class="rs-features__category-toggle">${isExpanded ? '−' : '+'}</span>
                        <span class="rs-features__category-name">${this.escapeHtml(category.name)}</span>
                        ${selectedInCategory > 0 ? `<span class="rs-features__category-count">${selectedInCategory}</span>` : ''}
                    </div>
                    <div class="rs-features__category-items" style="display: ${isExpanded ? 'block' : 'none'}">
            `;

            category.children.forEach(feature => {
                const isSelected = this.selectedFeatures.has(feature.id);
                html += `
                    <label class="rs-features__item">
                        <input type="checkbox"
                               class="rs-features__checkbox"
                               value="${feature.id}"
                               ${isSelected ? 'checked' : ''}>
                        <span class="rs-features__item-name">${this.escapeHtml(feature.name)}</span>
                    </label>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        this.categoriesContainer.innerHTML = html;
    }

    bindEvents() {
        // Open modal
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        });

        // Search input
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim();
            this.updateCategoryList();
        });

        // Category toggle
        this.categoriesContainer.addEventListener('click', (e) => {
            const header = e.target.closest('.rs-features__category-header');
            if (header) {
                const category = header.dataset.category;
                this.toggleCategory(category);
            }
        });

        // Checkbox change
        this.categoriesContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('rs-features__checkbox')) {
                const featureId = parseInt(e.target.value);
                if (e.target.checked) {
                    this.selectedFeatures.add(featureId);
                } else {
                    this.selectedFeatures.delete(featureId);
                }
                this.updateFilters();
                this.updateTriggerText();
                this.updateCategoryList();
            }
        });

        // Clear button
        this.overlay.querySelector('.rs-features__clear-btn').addEventListener('click', () => {
            this.clearAll();
        });

        // Done/Close button
        this.overlay.querySelector('.rs-features__done-btn').addEventListener('click', () => {
            this.hideModal();
        });

        // X close button
        this.overlay.querySelector('.rs-features__modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        // Close on overlay click (not modal itself)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hideModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hideModal();
            }
        });
    }

    toggleCategory(category) {
        const categoryEl = this.categoriesContainer.querySelector(`.rs-features__category-header[data-category="${category}"]`).parentElement;
        const itemsEl = categoryEl.querySelector('.rs-features__category-items');
        const toggleEl = categoryEl.querySelector('.rs-features__category-toggle');

        if (this.expandedCategories.has(category)) {
            this.expandedCategories.delete(category);
            categoryEl.classList.remove('rs-features__category--expanded');
            itemsEl.style.display = 'none';
            toggleEl.textContent = '+';
        } else {
            this.expandedCategories.add(category);
            categoryEl.classList.add('rs-features__category--expanded');
            itemsEl.style.display = 'block';
            toggleEl.textContent = '−';
        }
    }

    async showModal() {
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll

        // Load features on demand if not loaded yet
        if (!RealtySoftState.get('data.featuresLoaded')) {
            this.categoriesContainer.innerHTML = '<div class="rs-features__loading">Loading features...</div>';
            await this.loadFeaturesOnDemand();
            this.updateCategoryList();
        }

        this.searchInput.focus();
    }

    hideModal() {
        this.isOpen = false;
        this.overlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
        this.searchTerm = '';
        this.searchInput.value = '';
        this.updateCategoryList();
    }

    updateFilters() {
        const selectedArray = Array.from(this.selectedFeatures);
        this.setFilter('features', selectedArray.length > 0 ? selectedArray : []);
    }

    updateTriggerText() {
        const count = this.selectedFeatures.size;
        this.triggerText.textContent = count > 0
            ? (count + ' feature' + (count > 1 ? 's' : '') + ' selected')
            : this.label('search_features_placeholder') || 'Select Features';
    }

    clearAll() {
        this.selectedFeatures.clear();
        this.updateFilters();
        this.updateTriggerText();
        this.updateCategoryList();
    }

    updateDisplay() {
        this.updateTriggerText();
        this.updateCategoryList();
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Register component
RealtySoft.registerComponent('rs_features', RSFeatures);
