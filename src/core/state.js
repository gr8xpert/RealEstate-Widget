/**
 * RealtySoft Widget v2 - State Management
 * Central state store with pub/sub pattern
 */

const RealtySoftState = (function() {
    'use strict';

    // Private state
    const state = {
        // Search filters
        filters: {
            location: null,
            locationName: '',
            listingType: null,
            propertyType: null,
            propertyTypeName: '',
            bedsMin: null,
            bedsMax: null,
            bathsMin: null,
            bathsMax: null,
            priceMin: null,
            priceMax: null,
            builtMin: null,
            builtMax: null,
            plotMin: null,
            plotMax: null,
            features: [],
            ref: ''
        },

        // Locked filters (from data attributes)
        lockedFilters: {},

        // Results
        results: {
            properties: [],
            total: 0,
            page: 1,
            perPage: 12,
            totalPages: 0
        },

        // Current property (detail page)
        currentProperty: null,

        // UI state
        ui: {
            view: 'grid', // 'grid' or 'list'
            sort: 'create_date_desc', // API values: create_date_desc, last_date_desc, list_price_asc, list_price_desc
            loading: false,
            error: null
        },

        // Wishlist
        wishlist: [],

        // Data from API
        data: {
            locations: [],
            propertyTypes: [],
            features: [],
            labels: {}
        },

        // Config
        config: {
            apiKey: null,
            apiUrl: null,
            language: 'en_US',
            ownerEmail: null,
            privacyPolicyUrl: null,
            features: [],
            propertyPageSlug: 'property',
            useWidgetPropertyTemplate: true,
            useQueryParamUrls: false
        }
    };

    // Subscribers
    const subscribers = {};

    /**
     * Get current state (immutable copy)
     */
    function getState() {
        return JSON.parse(JSON.stringify(state));
    }

    /**
     * Get specific state path
     * @param {string} path - Dot notation path (e.g., 'filters.location')
     */
    function get(path) {
        const keys = path.split('.');
        let value = state;
        for (const key of keys) {
            if (value === undefined || value === null) {
                return undefined;
            }
            value = value[key];
        }

        // Return undefined directly if value doesn't exist
        // (JSON.stringify(undefined) returns "undefined" string which breaks JSON.parse)
        if (value === undefined) {
            return undefined;
        }

        // Deep clone the value to prevent mutations
        return JSON.parse(JSON.stringify(value));
    }

    /**
     * Set state value
     * @param {string} path - Dot notation path
     * @param {*} value - New value
     */
    function set(path, value) {
        const keys = path.split('.');
        let current = state;

        for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]] === undefined) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        const oldValue = current[lastKey];
        current[lastKey] = value;

        // Notify subscribers
        notify(path, value, oldValue);
    }

    /**
     * Update multiple values at once
     * @param {object} updates - Object with path:value pairs
     */
    function setMultiple(updates) {
        for (const [path, value] of Object.entries(updates)) {
            set(path, value);
        }
    }

    /**
     * Subscribe to state changes
     * @param {string} path - State path to watch (or '*' for all)
     * @param {function} callback - Function to call on change
     * @returns {function} Unsubscribe function
     */
    function subscribe(path, callback) {
        if (!subscribers[path]) {
            subscribers[path] = [];
        }
        subscribers[path].push(callback);

        // Return unsubscribe function
        return function unsubscribe() {
            const index = subscribers[path].indexOf(callback);
            if (index > -1) {
                subscribers[path].splice(index, 1);
            }
        };
    }

    /**
     * Notify subscribers of state change
     */
    function notify(path, newValue, oldValue) {
        // Notify exact path subscribers
        if (subscribers[path]) {
            subscribers[path].forEach(cb => cb(newValue, oldValue, path));
        }

        // Notify parent path subscribers
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            if (subscribers[parentPath]) {
                subscribers[parentPath].forEach(cb => cb(get(parentPath), null, path));
            }
        }

        // Notify wildcard subscribers
        if (subscribers['*']) {
            subscribers['*'].forEach(cb => cb(newValue, oldValue, path));
        }
    }

    /**
     * Reset filters to defaults (respecting locked filters)
     */
    function resetFilters() {
        const defaults = {
            location: null,
            locationName: '',
            listingType: null,
            propertyType: null,
            propertyTypeName: '',
            bedsMin: null,
            bedsMax: null,
            bathsMin: null,
            bathsMax: null,
            priceMin: null,
            priceMax: null,
            builtMin: null,
            builtMax: null,
            plotMin: null,
            plotMax: null,
            features: [],
            ref: ''
        };

        // Apply defaults but keep locked values
        const locked = state.lockedFilters;

        // Set each filter individually to notify all subscribers
        for (const [key, defaultValue] of Object.entries(defaults)) {
            const value = (locked[key] !== null && locked[key] !== undefined)
                ? locked[key]
                : defaultValue;
            set('filters.' + key, value);
        }

        set('results.page', 1);
    }

    /**
     * Set locked filters from data attributes
     */
    function setLockedFilters(locked) {
        state.lockedFilters = { ...locked };

        // Apply locked filters to current filters
        for (const [key, value] of Object.entries(locked)) {
            if (value !== null && value !== undefined) {
                set(`filters.${key}`, value);
            }
        }
    }

    /**
     * Check if a filter is locked
     */
    function isFilterLocked(filterName) {
        return state.lockedFilters[filterName] !== undefined &&
               state.lockedFilters[filterName] !== null;
    }

    /**
     * Build search params from current filters
     * Uses API parameter names expected by Inmolink/CRM API
     */
    function getSearchParams() {
        const f = state.filters;
        const params = {};

        // Location - API expects 'location_id'
        if (f.location) {
            params.location_id = Array.isArray(f.location) ? f.location.join(',') : f.location;
        }

        // Listing type - API expects 'listing_type'
        if (f.listingType) {
            params.listing_type = Array.isArray(f.listingType) ? f.listingType.join(',') : f.listingType;
        }

        // Property type - API expects 'type_id'
        if (f.propertyType) {
            params.type_id = Array.isArray(f.propertyType) ? f.propertyType.join(',') : f.propertyType;
        }

        // Bedrooms - API expects 'bedrooms_min', 'bedrooms_max'
        if (f.bedsMin) params.bedrooms_min = f.bedsMin;
        if (f.bedsMax) params.bedrooms_max = f.bedsMax;

        // Bathrooms - API expects 'bathrooms_min', 'bathrooms_max'
        if (f.bathsMin) params.bathrooms_min = f.bathsMin;
        if (f.bathsMax) params.bathrooms_max = f.bathsMax;

        // Price - API expects 'list_price_min', 'list_price_max'
        if (f.priceMin) params.list_price_min = f.priceMin;
        if (f.priceMax) params.list_price_max = f.priceMax;

        // Built area - API expects 'build_size_min', 'build_size_max'
        if (f.builtMin) params.build_size_min = f.builtMin;
        if (f.builtMax) params.build_size_max = f.builtMax;

        // Plot size - API expects 'plot_size_min', 'plot_size_max'
        if (f.plotMin) params.plot_size_min = f.plotMin;
        if (f.plotMax) params.plot_size_max = f.plotMax;

        // Features - comma-separated IDs
        if (f.features && f.features.length) {
            params.features = f.features.join(',');
        }

        // Reference - API expects 'ref_no'
        if (f.ref) params.ref_no = f.ref;

        // Pagination and sorting
        params.page = state.results.page;
        params.limit = state.results.perPage;
        params.order = state.ui.sort;

        return params;
    }

    /**
     * Wishlist management
     */
    function addToWishlist(propertyId) {
        if (!state.wishlist.includes(propertyId)) {
            state.wishlist.push(propertyId);
            saveWishlist();
            notify('wishlist', state.wishlist, null);
        }
    }

    function removeFromWishlist(propertyId) {
        const index = state.wishlist.indexOf(propertyId);
        if (index > -1) {
            state.wishlist.splice(index, 1);
            saveWishlist();
            notify('wishlist', state.wishlist, null);
        }
    }

    function isInWishlist(propertyId) {
        return state.wishlist.includes(propertyId);
    }

    function loadWishlist() {
        try {
            const stored = localStorage.getItem('rs_wishlist');
            if (stored) {
                state.wishlist = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not load wishlist from localStorage');
        }
    }

    function saveWishlist() {
        try {
            localStorage.setItem('rs_wishlist', JSON.stringify(state.wishlist));
        } catch (e) {
            console.warn('Could not save wishlist to localStorage');
        }
    }

    // Initialize wishlist from localStorage
    loadWishlist();

    // Public API
    return {
        getState,
        get,
        set,
        setMultiple,
        subscribe,
        resetFilters,
        setLockedFilters,
        isFilterLocked,
        getSearchParams,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtySoftState;
}
