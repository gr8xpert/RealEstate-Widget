/**
 * RealtySoft Widget v2 - Base Component
 * Base class for all components
 */

class RSBaseComponent {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
        this.variation = options.variation || '1';
        this.subscriptions = [];

        // Mark element as initialized
        this.element.dataset.rsInit = 'true';

        // Initialize component
        this.init();
    }

    /**
     * Initialize component - override in subclass
     */
    init() {
        this.render();
        this.bindEvents();
    }

    /**
     * Render component - override in subclass
     */
    render() {}

    /**
     * Bind events - override in subclass
     */
    bindEvents() {}

    /**
     * Subscribe to state changes
     */
    subscribe(path, callback) {
        const unsubscribe = RealtySoftState.subscribe(path, callback);
        this.subscriptions.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Get label
     */
    label(key, replacements) {
        return RealtySoftLabels.get(key, replacements);
    }

    /**
     * Check if this filter is locked
     */
    isLocked(filterName) {
        return RealtySoftState.isFilterLocked(filterName);
    }

    /**
     * Apply locked/disabled styles to element
     * Shows the filter but prevents interaction
     */
    applyLockedStyle() {
        this.element.classList.add('rs-filter--locked');
        this.element.setAttribute('title', 'This filter is pre-set for this page');
    }

    /**
     * Get locked filter value
     */
    getLockedValue(filterName) {
        const lockedFilters = RealtySoftState.get('lockedFilters') || {};
        return lockedFilters[filterName];
    }

    /**
     * Set filter value
     */
    setFilter(name, value) {
        RealtySoft.setFilter(name, value);
    }

    /**
     * Get filter value
     */
    getFilter(name) {
        return RealtySoftState.get(`filters.${name}`);
    }

    /**
     * Create element helper
     */
    createElement(tag, className, innerHTML = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    }

    /**
     * Destroy component
     */
    destroy() {
        // Unsubscribe from all state subscriptions
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions = [];

        // Clear element
        this.element.innerHTML = '';
        delete this.element._rsComponent;
        delete this.element.dataset.rsInit;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSBaseComponent;
}
