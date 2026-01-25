/**
 * RealtySoft Widget v2 - Central Controller
 * Main entry point that initializes and coordinates all modules
 */

const RealtySoft = (function() {
    'use strict';

    // Version check - if you see this, files are updated!
    console.log('[RealtySoft] Version 2.3.0 - Template 02 Support Enabled');

    // Component registry
    const components = {};
    const componentInstances = [];

    // Initialization state
    let initialized = false;
    let initPromise = null;

    /**
     * Parse data attributes for locked filters
     */
    function parseLockedFilters(container) {
        const locked = {};
        const attrMap = {
            'rs-location': 'location',
            'rs-property-type': 'propertyType',
            'rs-listing-type': 'listingType',
            'rs-beds-min': 'bedsMin',
            'rs-beds-max': 'bedsMax',
            'rs-baths-min': 'bathsMin',
            'rs-baths-max': 'bathsMax',
            'rs-price-min': 'priceMin',
            'rs-price-max': 'priceMax',
            'rs-built-min': 'builtMin',
            'rs-built-max': 'builtMax',
            'rs-plot-min': 'plotMin',
            'rs-plot-max': 'plotMax',
            'rs-features': 'features',
            'rs-ref': 'ref'
        };

        for (const [attr, key] of Object.entries(attrMap)) {
            const value = container.dataset[attr.replace(/-([a-z])/g, (g) => g[1].toUpperCase())];
            if (value !== undefined && value !== '') {
                // Parse numeric values
                if (['bedsMin', 'bedsMax', 'bathsMin', 'bathsMax', 'priceMin', 'priceMax', 'builtMin', 'builtMax', 'plotMin', 'plotMax', 'location', 'propertyType'].includes(key)) {
                    locked[key] = parseInt(value, 10);
                } else if (key === 'features') {
                    locked[key] = value.split(',').map(v => parseInt(v.trim(), 10));
                } else {
                    locked[key] = value;
                }
            }
        }

        return locked;
    }

    /**
     * Validate domain against whitelist
     */
    async function validateDomain() {
        // In production, this would check against the PHP whitelist
        // For now, we trust the proxy to handle validation
        return true;
    }

    /**
     * Detect widget mode based on container presence
     * - combined: Both search and listing containers (show results on same page)
     * - search-only: Only search container (redirect to results page)
     * - results-only: Only listing container (just show listings)
     */
    function detectMode() {
        const hasSearch = !!document.getElementById('rs_search') ||
                          !!document.querySelector('.rs-search-template-01') ||
                          !!document.querySelector('.rs-search-template-02');
        const hasListing = !!document.getElementById('rs_listing') ||
                           !!document.querySelector('.rs-listing-template-01') ||
                           !!document.querySelector('.rs-listing-template-02') ||
                           !!document.querySelector('.rs-listing-template-03') ||
                           !!document.querySelector('.rs-listing-template-04') ||
                           !!document.querySelector('.rs-listing-template-05') ||
                           !!document.querySelector('.rs-listing-template-06') ||
                           !!document.querySelector('.rs-listing-template-07');

        if (hasSearch && hasListing) {
            return 'combined';
        } else if (hasSearch && !hasListing) {
            return 'search-only';
        } else if (!hasSearch && hasListing) {
            return 'results-only';
        }
        return null;
    }

    /**
     * Get results page URL for redirect in search-only mode
     */
    function getResultsPageURL() {
        const globalConfig = window.RealtySoftConfig || {};

        // Check for config override
        if (globalConfig.resultsPage) {
            return globalConfig.resultsPage;
        }

        // Default to /properties
        return '/properties';
    }

    /**
     * Build search URL with filter parameters
     */
    function buildSearchURL(filters) {
        const baseURL = getResultsPageURL();
        const params = new URLSearchParams();

        // Map filter names to URL-friendly parameter names
        if (filters.location) params.set('location', filters.location);
        if (filters.sublocation) params.set('sublocation', filters.sublocation);
        if (filters.propertyType) params.set('type', filters.propertyType);
        if (filters.listingType) params.set('listing', filters.listingType);
        if (filters.bedsMin) params.set('beds', filters.bedsMin);
        if (filters.bathsMin) params.set('baths', filters.bathsMin);
        if (filters.priceMin) params.set('price_min', filters.priceMin);
        if (filters.priceMax) params.set('price_max', filters.priceMax);
        if (filters.builtMin) params.set('built_min', filters.builtMin);
        if (filters.builtMax) params.set('built_max', filters.builtMax);
        if (filters.plotMin) params.set('plot_min', filters.plotMin);
        if (filters.plotMax) params.set('plot_max', filters.plotMax);
        if (filters.ref) params.set('ref', filters.ref);
        if (filters.features && filters.features.length > 0) {
            params.set('features', filters.features.join(','));
        }

        const queryString = params.toString();
        return queryString ? `${baseURL}?${queryString}` : baseURL;
    }

    /**
     * Parse URL parameters and apply as filters
     * Used on results page when redirected from search-only page
     */
    function parseURLFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const filters = {};

        // Map URL parameter names back to filter names
        if (urlParams.has('location')) {
            const val = parseInt(urlParams.get('location'), 10);
            if (!isNaN(val)) filters.location = val;
        }
        if (urlParams.has('sublocation')) {
            const val = parseInt(urlParams.get('sublocation'), 10);
            if (!isNaN(val)) filters.sublocation = val;
        }
        if (urlParams.has('type')) {
            const val = parseInt(urlParams.get('type'), 10);
            if (!isNaN(val)) filters.propertyType = val;
        }
        if (urlParams.has('listing')) {
            filters.listingType = urlParams.get('listing');
        }
        if (urlParams.has('beds')) {
            const val = parseInt(urlParams.get('beds'), 10);
            if (!isNaN(val)) filters.bedsMin = val;
        }
        if (urlParams.has('baths')) {
            const val = parseInt(urlParams.get('baths'), 10);
            if (!isNaN(val)) filters.bathsMin = val;
        }
        if (urlParams.has('price_min')) {
            const val = parseInt(urlParams.get('price_min'), 10);
            if (!isNaN(val)) filters.priceMin = val;
        }
        if (urlParams.has('price_max')) {
            const val = parseInt(urlParams.get('price_max'), 10);
            if (!isNaN(val)) filters.priceMax = val;
        }
        if (urlParams.has('built_min')) {
            const val = parseInt(urlParams.get('built_min'), 10);
            if (!isNaN(val)) filters.builtMin = val;
        }
        if (urlParams.has('built_max')) {
            const val = parseInt(urlParams.get('built_max'), 10);
            if (!isNaN(val)) filters.builtMax = val;
        }
        if (urlParams.has('plot_min')) {
            const val = parseInt(urlParams.get('plot_min'), 10);
            if (!isNaN(val)) filters.plotMin = val;
        }
        if (urlParams.has('plot_max')) {
            const val = parseInt(urlParams.get('plot_max'), 10);
            if (!isNaN(val)) filters.plotMax = val;
        }
        if (urlParams.has('ref')) {
            filters.ref = urlParams.get('ref');
        }
        if (urlParams.has('features')) {
            const featuresStr = urlParams.get('features');
            if (featuresStr) {
                filters.features = featuresStr.split(',').map(f => parseInt(f, 10)).filter(f => !isNaN(f));
            }
        }

        // Apply filters to state if any were found
        if (Object.keys(filters).length > 0) {
            console.log('[RealtySoft] Applying URL filters:', filters);
            for (const [key, value] of Object.entries(filters)) {
                RealtySoftState.set(`filters.${key}`, value);
            }
        }
    }

    // Store current mode
    let widgetMode = null;

    /**
     * Template HTML definitions for auto-rendering
     */
    const TEMPLATES = {
        // Search Template 01: Compact Horizontal (2-row)
        'rs-search-template-01': `
            <div class="rs-template-search-01__row rs-template-search-01__row--primary">
                <div class="rs-template-search-01__field rs-template-search-01__field--reference">
                    <div class="rs_ref"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--location">
                    <div class="rs_location" data-rs-variation="2"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--type">
                    <div class="rs_property_type" data-rs-variation="2"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--search">
                    <div class="rs_search_button"></div>
                </div>
            </div>
            <div class="rs-template-search-01__row rs-template-search-01__row--secondary">
                <div class="rs-template-search-01__field rs-template-search-01__field--beds">
                    <div class="rs_bedrooms" data-rs-variation="1"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--baths">
                    <div class="rs_bathrooms" data-rs-variation="1"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--price-min">
                    <div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--price-max">
                    <div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--listing-type">
                    <div class="rs_listing_type" data-rs-variation="1"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--features">
                    <div class="rs_features"></div>
                </div>
                <div class="rs-template-search-01__field rs-template-search-01__field--reset">
                    <div class="rs_reset_button"></div>
                </div>
            </div>
        `,

        // Search Template 02: Single Row with More Filters Dropdown
        'rs-search-template-02': `
            <div class="rs-template-search-02__row">
                <!-- Location - Pill style search -->
                <div class="rs-template-search-02__field rs-template-search-02__field--location">
                    <div class="rs_location" data-rs-variation="1" data-rs-placeholder="Search Location"></div>
                </div>

                <!-- Property Type -->
                <div class="rs-template-search-02__field rs-template-search-02__field--property-type">
                    <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
                </div>

                <!-- Min Price -->
                <div class="rs-template-search-02__field rs-template-search-02__field--price">
                    <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
                </div>

                <!-- Max Price -->
                <div class="rs-template-search-02__field rs-template-search-02__field--price">
                    <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
                </div>

                <!-- More Filters Button + Dropdown -->
                <div class="rs-template-search-02__more-filters-wrapper">
                    <button type="button" class="rs-template-search-02__more-filters-btn">
                        <svg class="rs-template-search-02__more-filters-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span>More Filters</span>
                        <svg class="rs-template-search-02__more-filters-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    <!-- More Filters Dropdown -->
                    <div class="rs-template-search-02__dropdown">
                        <!-- Mobile Header -->
                        <div class="rs-template-search-02__dropdown-header">
                            <span class="rs-template-search-02__dropdown-title">More Filters</span>
                            <button type="button" class="rs-template-search-02__dropdown-close">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <!-- Reference -->
                        <div class="rs-template-search-02__dropdown-section">
                            <div class="rs-template-search-02__dropdown-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Reference
                            </div>
                            <div class="rs-template-search-02__dropdown-field">
                                <div class="rs_ref" data-rs-placeholder="Reference"></div>
                            </div>
                        </div>

                        <!-- Bedrooms & Bathrooms - Side by Side with headings -->
                        <div class="rs-template-search-02__dropdown-section">
                            <div class="rs-template-search-02__dropdown-row">
                                <div class="rs-template-search-02__dropdown-col">
                                    <div class="rs-template-search-02__dropdown-label">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M2 4v16"></path>
                                            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                            <path d="M2 17h20"></path>
                                            <path d="M6 8v9"></path>
                                        </svg>
                                        Bedrooms
                                    </div>
                                    <div class="rs-template-search-02__dropdown-field">
                                        <div class="rs_bedrooms" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Bedrooms"></div>
                                    </div>
                                </div>
                                <div class="rs-template-search-02__dropdown-col">
                                    <div class="rs-template-search-02__dropdown-label">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                            <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                            <circle cx="12" cy="5" r="2"></circle>
                                        </svg>
                                        Bathrooms
                                    </div>
                                    <div class="rs-template-search-02__dropdown-field">
                                        <div class="rs_bathrooms" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Bathrooms"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Min. Build -->
                        <div class="rs-template-search-02__dropdown-section">
                            <div class="rs-template-search-02__dropdown-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                    <path d="M3 9h18"></path>
                                    <path d="M9 21V9"></path>
                                </svg>
                                Min. Build
                            </div>
                            <div class="rs-template-search-02__dropdown-field">
                                <div class="rs_built_area" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Build"></div>
                            </div>
                        </div>

                        <!-- Min. Plot -->
                        <div class="rs-template-search-02__dropdown-section">
                            <div class="rs-template-search-02__dropdown-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                    <path d="M12 2v20"></path>
                                </svg>
                                Min. Plot
                            </div>
                            <div class="rs-template-search-02__dropdown-field">
                                <div class="rs_plot_size" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Plot"></div>
                            </div>
                        </div>

                        <!-- Status (Listing Type) - Radio Buttons -->
                        <div class="rs-template-search-02__dropdown-section">
                            <div class="rs-template-search-02__dropdown-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Status
                            </div>
                            <div class="rs-template-search-02__dropdown-field">
                                <div class="rs_listing_type" data-rs-variation="3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Search Button -->
                <div class="rs-template-search-02__field rs-template-search-02__field--search">
                    <div class="rs_search_button"></div>
                </div>

                <!-- Reset Button -->
                <div class="rs-template-search-02__field rs-template-search-02__field--reset">
                    <div class="rs_reset_button"></div>
                </div>
            </div>
        `,

        // Search Template 03: Tab-Based Search
        'rs-search-template-03': `
            <div class="rs-template-search-03__tabs">
                <button type="button" class="rs-template-search-03__tab is-active" data-listing-type="resale">Sales</button>
                <button type="button" class="rs-template-search-03__tab" data-listing-type="development">New Developments</button>
                <button type="button" class="rs-template-search-03__tab" data-listing-type="long_rental">Rentals</button>
                <button type="button" class="rs-template-search-03__tab" data-listing-type="short_rental">Holiday Rentals</button>
            </div>
            <div class="rs-template-search-03__form">
                <div class="rs-template-search-03__row rs-template-search-03__row--filters">
                    <div class="rs-template-search-03__field rs-template-search-03__field--location">
                        <div class="rs_location" data-rs-variation="3" data-rs-placeholder="Location"></div>
                    </div>
                    <div class="rs-template-search-03__field rs-template-search-03__field--type">
                        <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
                    </div>
                    <div class="rs-template-search-03__field rs-template-search-03__field--beds">
                        <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Bedrooms"></div>
                    </div>
                    <div class="rs-template-search-03__field rs-template-search-03__field--baths">
                        <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Bathrooms"></div>
                    </div>
                    <div class="rs-template-search-03__field rs-template-search-03__field--price-min">
                        <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
                    </div>
                    <div class="rs-template-search-03__field rs-template-search-03__field--price-max">
                        <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
                    </div>
                    <div class="rs-template-search-03__field rs-template-search-03__field--reference">
                        <div class="rs_ref" data-rs-placeholder="Reference"></div>
                    </div>
                </div>
                <div class="rs-template-search-03__row rs-template-search-03__row--actions">
                    <div class="rs-template-search-03__features">
                        <div class="rs_features"></div>
                    </div>
                    <div class="rs-template-search-03__field rs-template-search-03__field--search">
                        <div class="rs_search_button"></div>
                    </div>
                </div>
            </div>
        `,

        // Search Template 04: Dark Horizontal Bar
        'rs-search-template-04': `
            <div class="rs-template-search-04__row rs-template-search-04__row--primary">
                <div class="rs-template-search-04__field rs-template-search-04__field--reference">
                    <label class="rs-template-search-04__label">Reference</label>
                    <div class="rs_ref" data-rs-placeholder="Ref"></div>
                </div>
                <div class="rs-template-search-04__field rs-template-search-04__field--location">
                    <label class="rs-template-search-04__label">Location</label>
                    <div class="rs_location" data-rs-variation="2" data-rs-placeholder="Any"></div>
                </div>
                <div class="rs-template-search-04__field rs-template-search-04__field--type">
                    <label class="rs-template-search-04__label">Property Type</label>
                    <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Any"></div>
                </div>
                <div class="rs-template-search-04__field rs-template-search-04__field--status">
                    <label class="rs-template-search-04__label">Status</label>
                    <div class="rs_listing_type" data-rs-variation="1" data-rs-placeholder="Any"></div>
                </div>
            </div>
            <div class="rs-template-search-04__row rs-template-search-04__row--secondary">
                <div class="rs-template-search-04__field rs-template-search-04__field--beds">
                    <label class="rs-template-search-04__label">Bed</label>
                    <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Any"></div>
                </div>
                <div class="rs-template-search-04__field rs-template-search-04__field--baths">
                    <label class="rs-template-search-04__label">Bath</label>
                    <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Any"></div>
                </div>
                <div class="rs-template-search-04__field rs-template-search-04__field--price-min">
                    <label class="rs-template-search-04__label">Min Price</label>
                    <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Any"></div>
                </div>
                <div class="rs-template-search-04__field rs-template-search-04__field--price-max">
                    <label class="rs-template-search-04__label">Max Price</label>
                    <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Any"></div>
                </div>
                <div class="rs-template-search-04__features">
                    <div class="rs_features"></div>
                </div>
                <div class="rs-template-search-04__field rs-template-search-04__field--search">
                    <div class="rs_search_button"></div>
                </div>
            </div>
        `,

        // Search Template 05: Vertical Card/Sidebar
        'rs-search-template-05': `
            <div class="rs-template-search-05__field rs-template-search-05__field--reference">
                <div class="rs_ref" data-rs-placeholder="Reference"></div>
            </div>
            <div class="rs-template-search-05__field rs-template-search-05__field--status">
                <div class="rs_listing_type" data-rs-variation="1" data-rs-placeholder="Status"></div>
            </div>
            <div class="rs-template-search-05__field rs-template-search-05__field--location">
                <div class="rs_location" data-rs-variation="2" data-rs-placeholder="Location"></div>
            </div>
            <div class="rs-template-search-05__field rs-template-search-05__field--type">
                <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
            </div>
            <div class="rs-template-search-05__row-half">
                <div class="rs-template-search-05__field rs-template-search-05__field--beds">
                    <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Bed"></div>
                </div>
                <div class="rs-template-search-05__field rs-template-search-05__field--baths">
                    <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Bath"></div>
                </div>
            </div>
            <div class="rs-template-search-05__row-half">
                <div class="rs-template-search-05__field rs-template-search-05__field--price-min">
                    <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
                </div>
                <div class="rs-template-search-05__field rs-template-search-05__field--price-max">
                    <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
                </div>
            </div>
            <div class="rs-template-search-05__field rs-template-search-05__field--search">
                <div class="rs_search_button" data-rs-label="Submit"></div>
            </div>
            <div class="rs-template-search-05__links">
                <div class="rs-template-search-05__features">
                    <div class="rs_features"></div>
                </div>
            </div>
        `,

        // Search Template 06: Minimal Single Row
        'rs-search-template-06': `
            <div class="rs-template-search-06__container">
                <div class="rs-template-search-06__field rs-template-search-06__field--location">
                    <svg class="rs-template-search-06__location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div class="rs_location" data-rs-variation="1" data-rs-placeholder="Enter Location"></div>
                </div>
                <div class="rs-template-search-06__field rs-template-search-06__field--type">
                    <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
                </div>
                <div class="rs-template-search-06__field rs-template-search-06__field--search">
                    <div class="rs_search_button" data-rs-label="Search Here"></div>
                </div>
            </div>
        `,

        // Listing Template 01: Location-First Cards
        'rs-listing-template-01': `
            <div class="rs-template-listing-01__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-01__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-01">
                    <div class="rs-template-card-01__image-section">
                        <a class="rs_card_link rs-template-card-01__image-link">
                            <div class="rs_card_carousel"></div>
                        </a>
                        <button class="rs_card_wishlist" type="button"></button>
                        <div class="rs_card_status"></div>
                        <div class="rs-template-card-01__image-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span class="rs_card_image_count"></span>
                        </div>
                    </div>
                    <a class="rs_card_link rs-template-card-01__content">
                        <h3 class="rs_card_location rs-template-card-01__location"></h3>
                        <p class="rs_card_type rs-template-card-01__type"></p>
                        <p class="rs_card_description rs-template-card-01__description"></p>
                        <div class="rs-template-card-01__specs">
                            <div class="rs-template-card-01__spec-item">
                                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M2 4v16"></path>
                                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                    <path d="M2 17h20"></path>
                                    <path d="M6 8v9"></path>
                                </svg>
                                <span class="rs_card_beds rs-template-card-01__spec-value"></span>
                            </div>
                            <div class="rs-template-card-01__spec-item">
                                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                                    <line x1="10" x2="8" y1="5" y2="7"></line>
                                    <line x1="2" x2="22" y1="12" y2="12"></line>
                                    <line x1="7" x2="7" y1="19" y2="21"></line>
                                    <line x1="17" x2="17" y1="19" y2="21"></line>
                                </svg>
                                <span class="rs_card_baths rs-template-card-01__spec-value"></span>
                            </div>
                            <div class="rs-template-card-01__spec-item">
                                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                    <line x1="9" y1="21" x2="9" y2="9"></line>
                                </svg>
                                <span class="rs_card_built rs-template-card-01__spec-value"></span>
                            </div>
                            <div class="rs-template-card-01__spec-item">
                                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                    <path d="M12 2v20"></path>
                                    <path d="M3 6l9 4 9-4"></path>
                                </svg>
                                <span class="rs_card_plot rs-template-card-01__spec-value"></span>
                            </div>
                        </div>
                        <div class="rs_card_price rs-template-card-01__price"></div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Listing Template 02: Price on Image Cards
        'rs-listing-template-02': `
            <div class="rs-template-listing-02__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-02__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-02">
                    <div class="rs-template-card-02__image-section">
                        <a class="rs_card_link rs-template-card-02__image-link">
                            <div class="rs_card_carousel"></div>
                            <div class="rs-template-card-02__image-overlay"></div>
                        </a>
                        <!-- Status badge top-left -->
                        <div class="rs_card_status rs-template-card-02__status"></div>
                        <!-- Wishlist top-right (circular) -->
                        <button class="rs_card_wishlist rs-template-card-02__wishlist" type="button"></button>
                        <!-- Bottom left: image count only -->
                        <div class="rs-template-card-02__image-bottom-left">
                            <div class="rs-template-card-02__image-count">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <span class="rs_card_image_count"></span>
                            </div>
                        </div>
                        <!-- Bottom right: price -->
                        <div class="rs-template-card-02__price-overlay">
                            <span class="rs_card_price rs-template-card-02__price"></span>
                            <span class="rs_card_price_suffix rs-template-card-02__price-suffix"></span>
                        </div>
                    </div>
                    <a class="rs_card_link rs-template-card-02__content">
                        <div class="rs-template-card-02__title-row">
                            <h3 class="rs_card_title rs-template-card-02__title"></h3>
                            <span class="rs-template-card-02__arrow-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </span>
                        </div>
                        <p class="rs_card_location rs-template-card-02__location"></p>
                        <div class="rs-template-card-02__specs">
                            <span class="rs-template-card-02__spec">
                                <span class="rs-template-card-02__spec-label">Beds:</span>
                                <span class="rs_card_beds rs-template-card-02__spec-value"></span>
                            </span>
                            <span class="rs-template-card-02__spec">
                                <span class="rs-template-card-02__spec-label">Baths:</span>
                                <span class="rs_card_baths rs-template-card-02__spec-value"></span>
                            </span>
                            <span class="rs-template-card-02__spec">
                                <span class="rs-template-card-02__spec-label">Area:</span>
                                <span class="rs_card_built rs-template-card-02__spec-value"></span>
                            </span>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Listing Template 03: Horizontal Card (Image left 40%, Content right 60%)
        'rs-listing-template-03': `
            <div class="rs-template-listing-03__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-03__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-03">
                    <div class="rs-template-card-03__image-section">
                        <a class="rs_card_link rs-template-card-03__image-link">
                            <div class="rs_card_carousel"></div>
                        </a>
                        <!-- Status badge top-left -->
                        <div class="rs_card_status rs-template-card-03__status"></div>
                        <!-- Image count bottom-left -->
                        <div class="rs-template-card-03__image-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span class="rs_card_image_count"></span>
                        </div>
                        <!-- Carousel dots bottom center -->
                        <div class="rs-template-card-03__carousel-dots"></div>
                    </div>
                    <!-- Wishlist button outside image section -->
                    <button class="rs_card_wishlist rs-template-card-03__wishlist" type="button"></button>
                    <a class="rs_card_link rs-template-card-03__content">
                        <!-- Tags row (property type as pill badge) -->
                        <div class="rs-template-card-03__tags">
                            <span class="rs_card_type rs-template-card-03__tag"></span>
                        </div>
                        <!-- Title -->
                        <h3 class="rs_card_title rs-template-card-03__title"></h3>
                        <!-- Specs with icons -->
                        <div class="rs-template-card-03__specs">
                            <span class="rs-template-card-03__spec">
                                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 4v16"></path>
                                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                    <path d="M2 17h20"></path>
                                    <path d="M6 8v9"></path>
                                </svg>
                                <span class="rs_card_beds"></span>
                            </span>
                            <span class="rs-template-card-03__spec">
                                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                    <circle cx="12" cy="5" r="2"></circle>
                                </svg>
                                <span class="rs_card_baths"></span>
                            </span>
                            <span class="rs-template-card-03__spec">
                                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                    <line x1="9" y1="21" x2="9" y2="9"></line>
                                </svg>
                                <span class="rs_card_built"></span>
                            </span>
                        </div>
                        <!-- Bottom: Price in outlined pill -->
                        <div class="rs-template-card-03__bottom">
                            <div class="rs-template-card-03__price-pill">
                                <span class="rs_card_price"></span>
                                <span class="rs_card_price_suffix"></span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Listing Template 04: Airbnb Style (Vertical, full-width image)
        'rs-listing-template-04': `
            <div class="rs-template-listing-04__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-04__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-04">
                    <div class="rs-template-card-04__image-section">
                        <a class="rs_card_link rs-template-card-04__image-link">
                            <div class="rs_card_carousel"></div>
                        </a>
                        <!-- Status badge top-left -->
                        <div class="rs_card_status rs-template-card-04__status"></div>
                        <!-- Image count bottom-left -->
                        <div class="rs-template-card-04__image-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span class="rs_card_image_count"></span>
                        </div>
                        <!-- Carousel dots bottom center -->
                        <div class="rs-template-card-04__carousel-dots"></div>
                    </div>
                    <!-- Wishlist button outside image section -->
                    <button class="rs_card_wishlist rs-template-card-04__wishlist" type="button"></button>
                    <a class="rs_card_link rs-template-card-04__content">
                        <!-- Property type + beds inline -->
                        <div class="rs-template-card-04__meta">
                            <span class="rs_card_type rs-template-card-04__type"></span>
                            <span class="rs-template-card-04__meta-separator">·</span>
                            <span class="rs_card_beds rs-template-card-04__beds"></span>
                        </div>
                        <!-- Title -->
                        <h3 class="rs_card_title rs-template-card-04__title"></h3>
                        <!-- Location with pin icon -->
                        <div class="rs-template-card-04__location">
                            <svg class="rs-template-card-04__location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span class="rs_card_location"></span>
                        </div>
                        <!-- Price -->
                        <div class="rs-template-card-04__price-row">
                            <span class="rs_card_price rs-template-card-04__price"></span>
                            <span class="rs_card_price_suffix rs-template-card-04__price-suffix"></span>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Listing Template 05: Hover Overlay (Image only, content on hover)
        'rs-listing-template-05': `
            <div class="rs-template-listing-05__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-05__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-05">
                    <a class="rs_card_link rs-template-card-05__link">
                        <div class="rs-template-card-05__image-section">
                            <div class="rs_card_carousel"></div>
                        </div>
                        <!-- Status badges top-left -->
                        <div class="rs_card_status rs-template-card-05__status"></div>
                        <!-- Image count bottom-left -->
                        <div class="rs-template-card-05__image-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span class="rs_card_image_count"></span>
                        </div>
                        <!-- Hover overlay with content -->
                        <div class="rs-template-card-05__overlay">
                            <div class="rs-template-card-05__overlay-content">
                                <h3 class="rs_card_title rs-template-card-05__title"></h3>
                                <div class="rs_card_price rs-template-card-05__price"></div>
                                <div class="rs-template-card-05__specs">
                                    <span class="rs-template-card-05__spec">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M2 4v16"></path>
                                            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                            <path d="M2 17h20"></path>
                                            <path d="M6 8v9"></path>
                                        </svg>
                                        <span class="rs_card_beds"></span>
                                    </span>
                                    <span class="rs-template-card-05__spec">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                            <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                            <circle cx="12" cy="5" r="2"></circle>
                                        </svg>
                                        <span class="rs_card_baths"></span>
                                    </span>
                                    <span class="rs-template-card-05__spec">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="9" y1="21" x2="9" y2="9"></line>
                                        </svg>
                                        <span class="rs_card_built"></span>
                                    </span>
                                    <span class="rs-template-card-05__spec">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                            <path d="M12 2v20"></path>
                                        </svg>
                                        <span class="rs_card_plot"></span>
                                    </span>
                                </div>
                                <span class="rs-template-card-05__view-link">View Details</span>
                            </div>
                        </div>
                    </a>
                    <!-- Wishlist button (always visible) -->
                    <button class="rs_card_wishlist rs-template-card-05__wishlist" type="button"></button>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Listing Template 06: Gradient Overlay (Full image with permanent dark gradient)
        'rs-listing-template-06': `
            <div class="rs-template-listing-06__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-06__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-06">
                    <a class="rs_card_link rs-template-card-06__link">
                        <div class="rs-template-card-06__image-section">
                            <div class="rs_card_carousel"></div>
                            <!-- Gradient overlay -->
                            <div class="rs-template-card-06__gradient"></div>
                        </div>
                        <!-- Status badge top-left -->
                        <div class="rs_card_status rs-template-card-06__status"></div>
                        <!-- Wishlist top-right -->
                        <button class="rs_card_wishlist rs-template-card-06__wishlist" type="button"></button>
                        <!-- Bottom content on gradient -->
                        <div class="rs-template-card-06__content">
                            <h3 class="rs_card_type rs-template-card-06__title"></h3>
                            <div class="rs_card_price rs-template-card-06__price"></div>
                            <div class="rs-template-card-06__specs">
                                <span class="rs-template-card-06__spec">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span class="rs_card_beds"></span>
                                </span>
                                <span class="rs-template-card-06__spec">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                        <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                        <circle cx="12" cy="5" r="2"></circle>
                                    </svg>
                                    <span class="rs_card_baths"></span>
                                </span>
                                <span class="rs-template-card-06__spec">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    <span class="rs_card_built"></span>
                                </span>
                            </div>
                            <span class="rs-template-card-06__view-link">View Details</span>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Listing Template 07: Dark Overlay with Badges
        'rs-listing-template-07': `
            <div class="rs-template-listing-07__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-07__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-07">
                    <a class="rs_card_link rs-template-card-07__link">
                        <div class="rs-template-card-07__image-section">
                            <div class="rs_card_carousel"></div>
                            <!-- Dark gradient overlay -->
                            <div class="rs-template-card-07__gradient"></div>
                        </div>
                        <!-- Multiple badges top row -->
                        <div class="rs-template-card-07__badges">
                            <div class="rs_card_status rs-template-card-07__status"></div>
                        </div>
                        <!-- Wishlist top-right -->
                        <button class="rs_card_wishlist rs-template-card-07__wishlist" type="button"></button>
                        <!-- Bottom content -->
                        <div class="rs-template-card-07__content">
                            <div class="rs-template-card-07__price-row">
                                <span class="rs_card_price rs-template-card-07__price"></span>
                                <span class="rs_card_price_suffix rs-template-card-07__price-suffix"></span>
                            </div>
                            <h3 class="rs_card_type rs-template-card-07__title"></h3>
                            <div class="rs-template-card-07__specs">
                                <span class="rs-template-card-07__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span class="rs_card_beds"></span>
                                </span>
                                <span class="rs-template-card-07__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                        <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                        <circle cx="12" cy="5" r="2"></circle>
                                    </svg>
                                    <span class="rs_card_baths"></span>
                                </span>
                                <span class="rs-template-card-07__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    <span class="rs_card_built"></span>
                                </span>
                                <span class="rs-template-card-07__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span class="rs_card_plot"></span>
                                </span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Template 08: Dark Overlay Grid with view toggle
        'rs-listing-template-08': `
            <div class="rs-template-listing-08__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-08__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-08">
                    <a class="rs_card_link rs-template-card-08__link">
                        <div class="rs-template-card-08__image-section">
                            <div class="rs_card_carousel"></div>
                            <div class="rs_card_status rs-template-card-08__status"></div>
                            <button class="rs_card_wishlist rs-template-card-08__wishlist" type="button"></button>
                            <div class="rs-template-card-08__image-count">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                                <span class="rs_card_image_count"></span>
                            </div>
                        </div>
                        <div class="rs-template-card-08__content">
                            <h3 class="rs_card_title rs-template-card-08__title"></h3>
                            <div class="rs-template-card-08__specs">
                                <span class="rs-template-card-08__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span class="rs_card_beds"></span>
                                </span>
                                <span class="rs-template-card-08__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                        <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                        <circle cx="12" cy="5" r="2"></circle>
                                    </svg>
                                    <span class="rs_card_baths"></span>
                                </span>
                                <span class="rs-template-card-08__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    <span class="rs_card_built"></span>
                                </span>
                                <span class="rs-template-card-08__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span class="rs_card_plot"></span>
                                </span>
                                <span class="rs_card_price rs-template-card-08__price"></span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Template 09: Horizontal Detail Card (single row, no view toggle)
        'rs-listing-template-09': `
            <div class="rs-template-listing-09__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-09__controls">
                    <div class="rs_sort"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-09">
                    <a class="rs_card_link rs-template-card-09__link">
                        <div class="rs-template-card-09__image-section">
                            <div class="rs_card_carousel"></div>
                            <div class="rs_card_status rs-template-card-09__status"></div>
                            <button class="rs_card_wishlist rs-template-card-09__wishlist" type="button"></button>
                            <div class="rs-template-card-09__image-count">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                                <span class="rs_card_image_count"></span>
                            </div>
                        </div>
                        <div class="rs-template-card-09__content">
                            <div class="rs-template-card-09__location-row">
                                <span class="rs_card_location rs-template-card-09__location"></span>
                            </div>
                            <div class="rs-template-card-09__ref-row">
                                <span class="rs_card_ref rs-template-card-09__ref"></span>
                            </div>
                            <h3 class="rs_card_title rs-template-card-09__title"></h3>
                            <p class="rs_card_description rs-template-card-09__description"></p>
                            <div class="rs-template-card-09__specs">
                                <span class="rs-template-card-09__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span class="rs_card_beds"></span>
                                </span>
                                <span class="rs-template-card-09__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                        <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                        <circle cx="12" cy="5" r="2"></circle>
                                    </svg>
                                    <span class="rs_card_baths"></span>
                                </span>
                                <span class="rs-template-card-09__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    <span class="rs_card_built"></span>
                                </span>
                                <span class="rs-template-card-09__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span class="rs_card_plot"></span>
                                </span>
                            </div>
                            <div class="rs_card_price rs-template-card-09__price"></div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Template 10: Development/Large Card (single row, no view toggle)
        'rs-listing-template-10': `
            <div class="rs-template-listing-10__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-10__controls">
                    <div class="rs_sort"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-10">
                    <a class="rs_card_link rs-template-card-10__link">
                        <div class="rs-template-card-10__image-section">
                            <div class="rs_card_carousel"></div>
                            <div class="rs_card_status rs-template-card-10__status"></div>
                            <button class="rs_card_wishlist rs-template-card-10__wishlist" type="button"></button>
                            <div class="rs-template-card-10__image-count">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                                <span class="rs_card_image_count"></span>
                            </div>
                        </div>
                        <div class="rs-template-card-10__content">
                            <h3 class="rs_card_title rs-template-card-10__title"></h3>
                            <p class="rs_card_description rs-template-card-10__description"></p>
                            <div class="rs-template-card-10__price-row">
                                <span class="rs_card_price rs-template-card-10__price"></span>
                            </div>
                            <div class="rs-template-card-10__specs">
                                <span class="rs-template-card-10__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span class="rs_card_beds"></span>
                                </span>
                                <span class="rs-template-card-10__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                        <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                        <circle cx="12" cy="5" r="2"></circle>
                                    </svg>
                                    <span class="rs_card_baths"></span>
                                </span>
                                <span class="rs-template-card-10__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    <span class="rs_card_built"></span>
                                </span>
                                <span class="rs-template-card-10__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span class="rs_card_plot"></span>
                                </span>
                            </div>
                            <div class="rs-template-card-10__actions">
                                <span class="rs_card_ref rs-template-card-10__ref-btn"></span>
                                <span class="rs-template-card-10__view-details">View Details</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Template 11: Alternating Dark Content Card (single row, no view toggle)
        'rs-listing-template-11': `
            <div class="rs-template-listing-11__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-11__controls">
                    <div class="rs_sort"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-11">
                    <a class="rs_card_link rs-template-card-11__link">
                        <div class="rs-template-card-11__image-section">
                            <div class="rs_card_carousel"></div>
                            <button class="rs_card_wishlist rs-template-card-11__wishlist" type="button"></button>
                            <div class="rs-template-card-11__image-count">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                                <span class="rs_card_image_count"></span>
                            </div>
                        </div>
                        <div class="rs-template-card-11__content">
                            <div class="rs_card_status rs-template-card-11__status"></div>
                            <h3 class="rs_card_title rs-template-card-11__title"></h3>
                            <p class="rs_card_description rs-template-card-11__description"></p>
                            <div class="rs-template-card-11__specs">
                                <span class="rs-template-card-11__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span class="rs_card_beds"></span>
                                </span>
                                <span class="rs-template-card-11__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                        <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                        <circle cx="12" cy="5" r="2"></circle>
                                    </svg>
                                    <span class="rs_card_baths"></span>
                                </span>
                                <span class="rs-template-card-11__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    <span class="rs_card_built"></span>
                                </span>
                                <span class="rs-template-card-11__spec">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span class="rs_card_plot"></span>
                                </span>
                            </div>
                            <div class="rs-template-card-11__price-section">
                                <span class="rs-template-card-11__price-label">Price</span>
                                <span class="rs_card_price rs-template-card-11__price"></span>
                            </div>
                            <div class="rs-template-card-11__actions">
                                <span class="rs-template-card-11__details-btn">View Details</span>
                                <span class="rs_card_ref rs-template-card-11__ref"></span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `,

        // Template 12: Vertical Grid Card with Read More button
        'rs-listing-template-12': `
            <div class="rs-template-listing-12__header">
                <div class="rs_results_count"></div>
                <div class="rs-template-listing-12__controls">
                    <div class="rs_sort"></div>
                    <div class="rs_view_toggle"></div>
                </div>
            </div>
            <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
            <div class="rs_property_grid">
                <div class="rs_card rs-template-card-12">
                    <a class="rs_card_link rs-template-card-12__link">
                        <div class="rs-template-card-12__image-section">
                            <div class="rs_card_carousel"></div>
                            <div class="rs_card_status rs-template-card-12__status"></div>
                            <button class="rs_card_wishlist rs-template-card-12__wishlist" type="button"></button>
                            <div class="rs-template-card-12__image-count">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                                <span class="rs_card_image_count"></span>
                            </div>
                        </div>
                        <span class="rs-template-card-12__read-more">Read More</span>
                        <div class="rs-template-card-12__content">
                            <div class="rs-template-card-12__price-ref-row">
                                <span class="rs_card_price rs-template-card-12__price"></span>
                                <span class="rs_card_ref rs-template-card-12__ref"></span>
                            </div>
                            <h3 class="rs_card_title rs-template-card-12__title"></h3>
                            <p class="rs_card_description rs-template-card-12__description"></p>
                            <div class="rs-template-card-12__specs">
                                <div class="rs-template-card-12__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span class="rs_card_beds"></span>
                                </div>
                                <div class="rs-template-card-12__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                                        <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                                        <circle cx="12" cy="5" r="2"></circle>
                                    </svg>
                                    <span class="rs_card_baths"></span>
                                </div>
                                <div class="rs-template-card-12__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    <span class="rs_card_built"></span>
                                </div>
                                <div class="rs-template-card-12__spec">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span class="rs_card_plot"></span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="rs_pagination" style="margin-top: 30px;"></div>
        `
    };

    /**
     * Render templates - finds template markers and injects full HTML
     * Users just add: <div class="rs-search-template-01"></div>
     * And the JS renders the complete search form inside
     */
    function renderTemplates() {
        console.log('[RealtySoft] renderTemplates() - scanning for template elements...');
        for (const [templateClass, templateHTML] of Object.entries(TEMPLATES)) {
            const elements = document.querySelectorAll(`.${templateClass}`);
            console.log(`[RealtySoft] Looking for .${templateClass}: found ${elements.length} element(s)`);

            elements.forEach(el => {
                // Skip if already rendered
                if (el.dataset.rsTemplateRendered) return;

                // Check if it's a search template - needs id="rs_search"
                if (templateClass.includes('search')) {
                    if (!el.id) el.id = 'rs_search';
                    // Add the correct template class based on which template is being used
                    const templateNum = templateClass.match(/template-(\d+)/)?.[1];
                    if (templateNum) {
                        el.classList.add(`rs-template-search-${templateNum.padStart(2, '0')}`);
                    }
                }

                // Check if it's a listing template - needs id="rs_listing"
                if (templateClass.includes('listing')) {
                    if (!el.id) el.id = 'rs_listing';
                    // The element already has the correct template class from the HTML
                    // (e.g., rs-listing-template-01 or rs-listing-template-02)
                }

                // Inject the template HTML
                el.innerHTML = templateHTML;
                el.dataset.rsTemplateRendered = 'true';

                // Pass data-rs-columns to the inner property grid if specified on container
                if (el.dataset.rsColumns) {
                    const propertyGrid = el.querySelector('.rs_property_grid');
                    if (propertyGrid) {
                        propertyGrid.dataset.rsColumns = el.dataset.rsColumns;
                    }
                }

                // Initialize More Filters toggle for Template 02
                if (templateClass === 'rs-search-template-02') {
                    initTemplate02MoreFilters(el);
                }

                // Initialize Tab switching for Template 03
                if (templateClass === 'rs-search-template-03') {
                    initTemplate03Tabs(el);
                }

                console.log(`[RealtySoft] Auto-rendered template: ${templateClass}`);
            });
        }
    }

    /**
     * Initialize More Filters dropdown toggle for Search Template 02
     */
    function initTemplate02MoreFilters(container) {
        const wrapper = container.querySelector('.rs-template-search-02__more-filters-wrapper');
        const btn = container.querySelector('.rs-template-search-02__more-filters-btn');
        const dropdown = container.querySelector('.rs-template-search-02__dropdown');
        const closeBtn = container.querySelector('.rs-template-search-02__dropdown-close');

        if (!btn || !dropdown || !wrapper) return;

        // Open dropdown
        function openDropdown() {
            dropdown.classList.add('is-open');
            btn.classList.add('is-active');
            wrapper.classList.add('is-active');
            // Prevent body scroll on mobile
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
            }
        }

        // Close dropdown
        function closeDropdown() {
            dropdown.classList.remove('is-open');
            btn.classList.remove('is-active');
            wrapper.classList.remove('is-active');
            document.body.style.overflow = '';
        }

        // Toggle dropdown
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');

            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        // Close button (mobile)
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeDropdown();
            });
        }

        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                closeDropdown();
            }
        });

        // Close on overlay click (mobile)
        wrapper.addEventListener('click', function(e) {
            if (e.target === wrapper || e.target.classList.contains('rs-template-search-02__more-filters-wrapper')) {
                // Only close if clicking the wrapper itself (overlay area)
                if (window.innerWidth <= 768 && !dropdown.contains(e.target) && !btn.contains(e.target)) {
                    closeDropdown();
                }
            }
        });

        // Prevent dropdown from closing when clicking inside
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
                closeDropdown();
            }
        });
    }

    /**
     * Initialize Tab switching for Search Template 03
     * Handles listing type tabs and price range adaptation
     */
    function initTemplate03Tabs(container) {
        const tabs = container.querySelectorAll('.rs-template-search-03__tab');
        if (!tabs.length) return;

        // Tab click handler
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active from all tabs
                tabs.forEach(t => t.classList.remove('is-active'));
                // Add active to clicked tab
                this.classList.add('is-active');

                // Set listing type filter silently (not shown as a field)
                const listingType = this.dataset.listingType;
                if (listingType) {
                    RealtySoftState.set('filters.listingType', listingType);
                    console.log(`[RealtySoft] Template 03: Tab switched to "${listingType}"`);
                }
            });
        });

        // Set initial listing type from the active tab
        const activeTab = container.querySelector('.rs-template-search-03__tab.is-active');
        if (activeTab && activeTab.dataset.listingType) {
            RealtySoftState.set('filters.listingType', activeTab.dataset.listingType);
            console.log(`[RealtySoft] Template 03: Initial listing type set to "${activeTab.dataset.listingType}"`);
        }
    }

    /**
     * Show skeleton loading placeholders
     */
    function showLoadingSkeletons() {
        const searchContainer = document.getElementById('rs_search');
        const listingContainer = document.getElementById('rs_listing');

        // Show search skeleton
        if (searchContainer && !searchContainer.querySelector('.rs-search-skeleton')) {
            const searchSkeleton = document.createElement('div');
            searchSkeleton.className = 'rs-search-skeleton';
            searchSkeleton.innerHTML = `
                <div class="rs-search-skeleton__item">
                    <div class="rs-search-skeleton__label"></div>
                    <div class="rs-search-skeleton__input"></div>
                </div>
                <div class="rs-search-skeleton__item">
                    <div class="rs-search-skeleton__label"></div>
                    <div class="rs-search-skeleton__input"></div>
                </div>
                <div class="rs-search-skeleton__item">
                    <div class="rs-search-skeleton__label"></div>
                    <div class="rs-search-skeleton__input"></div>
                </div>
                <div class="rs-search-skeleton__item">
                    <div class="rs-search-skeleton__label"></div>
                    <div class="rs-search-skeleton__input"></div>
                </div>
                <div class="rs-search-skeleton__item">
                    <div class="rs-search-skeleton__button"></div>
                </div>
            `;
            searchContainer.insertBefore(searchSkeleton, searchContainer.firstChild);
        }

        // Show listing skeleton
        if (listingContainer && !listingContainer.querySelector('.rs-listing-skeleton')) {
            const listingSkeleton = document.createElement('div');
            listingSkeleton.className = 'rs-listing-skeleton';
            // Create 6 skeleton cards
            for (let i = 0; i < 6; i++) {
                listingSkeleton.innerHTML += `
                    <div class="rs-listing-skeleton__card">
                        <div class="rs-listing-skeleton__image"></div>
                        <div class="rs-listing-skeleton__content">
                            <div class="rs-listing-skeleton__price"></div>
                            <div class="rs-listing-skeleton__title"></div>
                            <div class="rs-listing-skeleton__location"></div>
                            <div class="rs-listing-skeleton__specs">
                                <div class="rs-listing-skeleton__spec"></div>
                                <div class="rs-listing-skeleton__spec"></div>
                                <div class="rs-listing-skeleton__spec"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
            listingContainer.insertBefore(listingSkeleton, listingContainer.firstChild);
        }
    }

    /**
     * Hide skeleton loading placeholders
     */
    function hideLoadingSkeletons() {
        const searchSkeleton = document.querySelector('.rs-search-skeleton');
        const listingSkeleton = document.querySelector('.rs-listing-skeleton');

        if (searchSkeleton) searchSkeleton.remove();
        if (listingSkeleton) listingSkeleton.remove();

        // Add loaded class to containers
        const searchContainer = document.getElementById('rs_search');
        const listingContainer = document.getElementById('rs_listing');
        if (searchContainer) searchContainer.classList.add('rs-loaded');
        if (listingContainer) listingContainer.classList.add('rs-loaded');
    }

    /**
     * Initialize the widget
     */
    async function init() {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            try {
                // Show loading skeletons immediately for better perceived performance
                showLoadingSkeletons();

                // Show loading state immediately for better perceived performance
                RealtySoftState.set('ui.loading', true);

                // Get config from global or defaults
                const globalConfig = window.RealtySoftConfig || {};

                // Detect language
                const language = globalConfig.language || RealtySoftLabels.init();

                // Initialize API
                RealtySoftAPI.init({
                    language: language,
                    apiKey: globalConfig.apiKey,
                    apiUrl: globalConfig.apiUrl
                });

                // Initialize analytics
                if (globalConfig.analytics !== false) {
                    RealtySoftAnalytics.init({
                        enabled: true,
                        debug: globalConfig.debug || false
                    });
                }

                // Store config in state
                RealtySoftState.set('config.language', language);
                RealtySoftState.set('config.ownerEmail', globalConfig.ownerEmail || null);
                RealtySoftState.set('config.privacyPolicyUrl', globalConfig.privacyPolicyUrl || null);
                RealtySoftState.set('config.defaultCountryCode', globalConfig.defaultCountryCode || '+34');
                RealtySoftState.set('config.inquiryThankYouMessage', globalConfig.inquiryThankYouMessage || null);
                RealtySoftState.set('config.inquiryThankYouUrl', globalConfig.inquiryThankYouUrl || null);
                RealtySoftState.set('config.propertyPageSlug', globalConfig.propertyPageSlug || 'property');
                RealtySoftState.set('config.useWidgetPropertyTemplate', globalConfig.useWidgetPropertyTemplate !== false);
                RealtySoftState.set('config.useQueryParamUrls', globalConfig.useQueryParamUrls === true);
                RealtySoftState.set('config.resultsPage', globalConfig.resultsPage || '/properties');

                // Load labels, locations, and property types on init
                // Features are loaded ON DEMAND (when user clicks the features button)
                const [labelsData, locations, propertyTypes] = await Promise.all([
                    RealtySoftAPI.getLabels().catch(() => ({ labels: {} })),
                    RealtySoftAPI.getLocations().catch(() => ({ data: [] })),
                    RealtySoftAPI.getPropertyTypes().catch(() => ({ data: [] }))
                ]);

                // Process labels from API
                // API may return { labels: {...} } or just {...}
                let apiLabels = null;
                if (labelsData) {
                    apiLabels = labelsData.labels || labelsData;
                }
                if (apiLabels && typeof apiLabels === 'object' && !Array.isArray(apiLabels)) {
                    await RealtySoftLabels.loadFromAPI(apiLabels);
                } else {
                    console.log('[RealtySoft] No labels from API, using defaults');
                }

                // Apply client-specific label overrides (Phase 4: Per-Client Customization)
                if (globalConfig.labelOverrides) {
                    RealtySoftLabels.applyOverrides(globalConfig.labelOverrides);
                }

                RealtySoftState.set('data.labels', RealtySoftLabels.getAll());

                // Set locations and property types
                RealtySoftState.set('data.locations', locations.data || []);
                RealtySoftState.set('data.propertyTypes', propertyTypes.data || []);

                // Features are loaded on demand (when user clicks features button)
                RealtySoftState.set('data.features', []);
                RealtySoftState.set('data.featuresLoaded', false);

                // Render any auto-templates BEFORE parsing containers
                renderTemplates();

                // Detect widget mode (combined, search-only, results-only)
                widgetMode = detectMode();
                console.log('[RealtySoft] Widget mode:', widgetMode);

                // Parse URL parameters for filters (useful when redirected from search-only page)
                parseURLFilters();

                // Parse locked filters from containers
                const searchContainer = document.getElementById('rs_search');
                const listingContainer = document.getElementById('rs_listing');

                // Collect locked filters from both containers
                // Listing container filters are applied first, search container can override
                let allLocked = {};

                if (listingContainer) {
                    const listingLocked = parseLockedFilters(listingContainer);
                    allLocked = { ...allLocked, ...listingLocked };
                }

                if (searchContainer) {
                    const searchLocked = parseLockedFilters(searchContainer);
                    allLocked = { ...allLocked, ...searchLocked };
                }

                if (Object.keys(allLocked).length > 0) {
                    RealtySoftState.setLockedFilters(allLocked);
                }

                // Initialize all components found in DOM
                initializeComponents();

                // Hide loading skeletons now that components are ready
                hideLoadingSkeletons();

                // Mark as initialized
                initialized = true;

                // Emit ready event
                document.dispatchEvent(new CustomEvent('realtysoft:ready'));

                return true;
            } catch (error) {
                console.error('RealtySoft initialization failed:', error);
                document.dispatchEvent(new CustomEvent('realtysoft:error', { detail: error }));
                throw error;
            }
        })();

        return initPromise;
    }

    /**
     * Initialize all components in DOM
     */
    function initializeComponents() {
        // Find all component elements
        const componentSelectors = Object.keys(components).map(name => `.${name}`).join(', ');

        if (!componentSelectors) return;

        document.querySelectorAll(componentSelectors).forEach(element => {
            // Find which component this element matches
            for (const [name, Component] of Object.entries(components)) {
                if (element.classList.contains(name)) {
                    const variation = element.dataset.rsVariation || '1';
                    console.log(`[RealtySoft] Initializing ${name} with variation: ${variation}`);
                    const instance = new Component(element, { variation });
                    componentInstances.push(instance);
                    element._rsComponent = instance;
                    break;
                }
            }
        });
    }

    /**
     * Register a component
     */
    function registerComponent(name, Component) {
        components[name] = Component;
    }

    /**
     * Get component instance by element
     */
    function getComponent(element) {
        return element._rsComponent;
    }

    /**
     * Perform search with current filters
     */
    async function search() {
        // Check for search-only mode - redirect instead of searching
        if (widgetMode === 'search-only') {
            const filters = RealtySoftState.get('filters');
            const searchURL = buildSearchURL(filters);
            console.log('[RealtySoft] Search-only mode: redirecting to', searchURL);
            window.location.href = searchURL;
            return;
        }

        RealtySoftState.set('ui.loading', true);
        RealtySoftState.set('ui.error', null);

        try {
            const params = RealtySoftState.getSearchParams();
            const results = await RealtySoftAPI.searchProperties(params);

            // Handle different API response formats for pagination
            const properties = results.data || results.properties || results.items || [];
            const total = results.total || results.count || results.total_count ||
                          results.totalCount || results.total_results || properties.length || 0;
            const totalPages = results.total_pages || results.totalPages || results.pages ||
                               results.page_count || Math.ceil(total / (params.per_page || 12)) || 0;

            RealtySoftState.setMultiple({
                'results.properties': properties,
                'results.total': total,
                'results.totalPages': totalPages,
                'ui.loading': false
            });

            // Track search
            RealtySoftAnalytics.trackSearch(RealtySoftState.get('filters'));

            document.dispatchEvent(new CustomEvent('realtysoft:search', {
                detail: { results: results }
            }));

            return results;
        } catch (error) {
            RealtySoftState.set('ui.loading', false);
            RealtySoftState.set('ui.error', error.message);
            throw error;
        }
    }

    /**
     * Load property detail
     */
    async function loadProperty(id) {
        RealtySoftState.set('ui.loading', true);

        try {
            const result = await RealtySoftAPI.getProperty(id);
            const property = result.data || result;

            RealtySoftState.set('currentProperty', property);
            RealtySoftState.set('ui.loading', false);

            // Track view
            RealtySoftAnalytics.trackPropertyView(property);

            document.dispatchEvent(new CustomEvent('realtysoft:property-loaded', {
                detail: { property }
            }));

            return property;
        } catch (error) {
            RealtySoftState.set('ui.loading', false);
            RealtySoftState.set('ui.error', error.message);
            throw error;
        }
    }

    /**
     * Load property by reference
     */
    async function loadPropertyByRef(ref) {
        RealtySoftState.set('ui.loading', true);

        try {
            const result = await RealtySoftAPI.getPropertyByRef(ref);
            const property = result.data || result;

            RealtySoftState.set('currentProperty', property);
            RealtySoftState.set('ui.loading', false);

            RealtySoftAnalytics.trackPropertyView(property);

            document.dispatchEvent(new CustomEvent('realtysoft:property-loaded', {
                detail: { property }
            }));

            return property;
        } catch (error) {
            RealtySoftState.set('ui.loading', false);
            RealtySoftState.set('ui.error', error.message);
            throw error;
        }
    }

    /**
     * Reset filters and search
     */
    function reset() {
        RealtySoftState.resetFilters();
        search();
    }

    /**
     * Go to page
     */
    function goToPage(page) {
        RealtySoftState.set('results.page', page);
        RealtySoftAnalytics.trackPagination(page, RealtySoftState.get('results.totalPages'));
        search();
    }

    /**
     * Change sort
     */
    function setSort(sort) {
        RealtySoftState.set('ui.sort', sort);
        RealtySoftState.set('results.page', 1);
        RealtySoftAnalytics.trackSortChange(sort);
        search();
    }

    /**
     * Change view (grid/list)
     */
    function setView(view) {
        RealtySoftState.set('ui.view', view);
        RealtySoftAnalytics.trackViewToggle(view);
    }

    /**
     * Update filter
     */
    function setFilter(name, value) {
        console.log('[RealtySoft] setFilter called:', name, '=', value);
        if (!RealtySoftState.isFilterLocked(name)) {
            RealtySoftState.set(`filters.${name}`, value);
            RealtySoftAnalytics.trackFilterChange(name, value);
        } else {
            console.log('[RealtySoft] setFilter BLOCKED - filter is locked:', name);
        }
    }

    /**
     * Get public state
     */
    function getState() {
        return RealtySoftState.getState();
    }

    /**
     * Subscribe to state changes
     */
    function subscribe(path, callback) {
        return RealtySoftState.subscribe(path, callback);
    }

    /**
     * Check if initialized
     */
    function isReady() {
        return initialized;
    }

    /**
     * Extract property reference from current URL
     * Enhanced with robust pattern matching for various URL formats
     *
     * Supports:
     * - Query params: ?ref=XXX, ?reference=XXX
     * - SEO URLs: /property/villa-marbella-R5285887
     * - Custom slugs: /details/apartment-REF12345, /listing/house-LS10921
     * - Direct refs: /property/R5285887
     * - Various ref formats: LS10921, REF12345, R5285887, PROP1234
     */
    function extractPropertyRefFromUrl() {
        const pathname = window.location.pathname;
        const globalConfig = window.RealtySoftConfig || {};
        const propertySlug = globalConfig.propertyPageSlug || 'property';

        console.log(`[RealtySoft] Extracting property ref with slug: ${propertySlug}`);

        // Method 1: Query parameters (?ref=XXX or ?reference=XXX)
        const urlParams = new URLSearchParams(window.location.search);
        const queryRef = urlParams.get('ref') || urlParams.get('reference');
        if (queryRef) {
            console.log(`[RealtySoft] Property ref from query param: ${queryRef}`);
            return queryRef.trim();
        }

        // Method 2: URL path with custom slug pattern
        // Matches: /{propertySlug}/anything-REF123
        // Examples: /property/villa-marbella-R5285887, /details/apartment-REF12345
        const slugPattern = new RegExp(`/${propertySlug}/[^/]+-([A-Z0-9]+)$`, 'i');
        const slugMatch = pathname.match(slugPattern);
        if (slugMatch) {
            console.log(`[RealtySoft] Property ref from slug URL: ${slugMatch[1]}`);
            return slugMatch[1];
        }

        // Method 3: Direct property slug with just reference
        // Matches: /{propertySlug}/R5285887 or /{propertySlug}/12345
        const directPattern = new RegExp(`/${propertySlug}/([A-Z0-9]+)$`, 'i');
        const directMatch = pathname.match(directPattern);
        if (directMatch && !directMatch[1].includes('-')) {
            console.log(`[RealtySoft] Property ref from direct slug: ${directMatch[1]}`);
            return directMatch[1];
        }

        // Method 4: Generic patterns - works for any path structure
        // This catches cases where slug might be different or path structure varies
        const genericPatterns = [
            // Standard reference patterns
            /([A-Z]{2,4}\d{4,})/i,           // LS10921, REF12345, PROP1234
            /([A-Z]\d{7})/i,                  // R5285887 (single letter + 7 digits)
            /([A-Z]\d{6})/i,                  // R528588 (single letter + 6 digits)

            // Last segment after dash (common SEO pattern)
            /-([A-Z0-9]{5,})(?:\/|$)/i,      // -REF12345 or -LS10921 at end

            // Numeric IDs
            /\/(\d{6,})(?:\/|$)/,             // /123456/ (6+ digit ID)
        ];

        for (const pattern of genericPatterns) {
            const match = pathname.match(pattern);
            if (match) {
                console.log(`[RealtySoft] Property ref from generic pattern: ${match[1]}`);
                return match[1];
            }
        }

        // Method 5: Check last path segment if it looks like a reference
        const pathSegments = pathname.split('/').filter(s => s);
        const lastSegment = pathSegments[pathSegments.length - 1];

        if (lastSegment) {
            // Remove .html extension if present
            const cleanSegment = lastSegment.replace(/\.html?$/i, '');

            // If last segment is purely alphanumeric and reasonable length, treat as ref
            if (/^[A-Z0-9]{4,15}$/i.test(cleanSegment)) {
                console.log(`[RealtySoft] Property ref from last segment: ${cleanSegment}`);
                return cleanSegment;
            }

            // Try to extract ref from hyphenated slug
            const parts = cleanSegment.split('-');
            const lastPart = parts[parts.length - 1];
            if (lastPart && /^[A-Z0-9]{4,}$/i.test(lastPart)) {
                console.log(`[RealtySoft] Property ref from slug ending: ${lastPart}`);
                return lastPart;
            }
        }

        console.log('[RealtySoft] No property reference found in URL');
        return null;
    }

    /**
     * Check if current page looks like a 404 error page
     * Enhanced detection for various CMS and server configurations
     */
    function isLikely404Page() {
        const bodyText = (document.body.innerText || '').toLowerCase();
        const title = (document.title || '').toLowerCase();
        const html = (document.documentElement.innerHTML || '').toLowerCase();

        // Check title patterns
        const titlePatterns = [
            '404',
            'not found',
            'page not found',
            'error',
            'página no encontrada',  // Spanish
            'seite nicht gefunden',  // German
            'page introuvable',      // French
            'pagina non trovata'     // Italian
        ];

        for (const pattern of titlePatterns) {
            if (title.includes(pattern)) {
                return true;
            }
        }

        // Check body content patterns
        const bodyPatterns = [
            '404',
            'not found',
            'page not found',
            'page doesn\'t exist',
            'page does not exist',
            'couldn\'t find',
            'could not find',
            'no longer exists',
            'has been removed',
            'has been deleted',
            'oops!',
            'sorry, we couldn\'t',
            'página no encontrada',
            'no se encuentra'
        ];

        for (const pattern of bodyPatterns) {
            if (bodyText.includes(pattern)) {
                return true;
            }
        }

        // Check HTTP status (some servers inject status code)
        const statusMeta = document.querySelector('meta[name="status"]');
        if (statusMeta && statusMeta.content === '404') {
            return true;
        }

        // Check for common 404 CSS classes/IDs
        const errorSelectors = [
            '.error-404',
            '#error-404',
            '.page-404',
            '.not-found',
            '.error-page',
            '[class*="404"]',
            '[id*="404"]'
        ];

        for (const selector of errorSelectors) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Auto-inject property detail container and initialize
     * Enhanced with better 404 handling and multiple injection strategies
     */
    function autoInjectPropertyDetail(propertyRef) {
        console.log('[RealtySoft] Auto-detected property URL, ref:', propertyRef);

        const is404 = isLikely404Page();
        if (is404) {
            console.log('[RealtySoft] Detected 404/error page, will replace content');
        }

        // Find best container to inject into (priority order)
        const containerSelectors = [
            'main',
            '.content',
            '#content',
            'article',
            '.entry-content',
            '.page-content',
            '.site-content',
            '.main-content',
            '#main',
            '#primary',
            '.post-content',
            '.single-content'
        ];

        let mainContent = null;
        for (const selector of containerSelectors) {
            mainContent = document.querySelector(selector);
            if (mainContent) {
                console.log(`[RealtySoft] Found container: ${selector}`);
                break;
            }
        }

        // Fallback to body
        if (!mainContent) {
            mainContent = document.body;
            console.log('[RealtySoft] Using body as container');
        }

        // Clear 404 content if detected
        if (is404) {
            console.log('[RealtySoft] Clearing 404 content...');

            // Save any scripts/styles we might need
            const scripts = mainContent.querySelectorAll('script');
            const savedScripts = Array.from(scripts).map(s => s.outerHTML);

            // Clear the content
            mainContent.innerHTML = '';

            // Add a wrapper div for proper styling
            const wrapper = document.createElement('div');
            wrapper.className = 'rs-auto-injected-wrapper';
            wrapper.style.cssText = 'max-width: 1400px; margin: 0 auto; padding: 20px;';
            mainContent.appendChild(wrapper);
            mainContent = wrapper;

            // Update page title
            const globalConfig = window.RealtySoftConfig || {};
            const originalTitle = document.title;
            document.title = globalConfig.detailPageTitle || 'Property Details';
            console.log(`[RealtySoft] Updated page title from "${originalTitle}" to "${document.title}"`);

            // Try to update meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = `Property details for ${propertyRef}`;
            }

            // Remove 404 status from URL if possible (HTML5 history API)
            if (window.history && window.history.replaceState) {
                // Keep the same URL but this helps with some analytics
                window.history.replaceState({ propertyRef }, document.title, window.location.href);
            }
        }

        // Create the detail container with all necessary attributes
        // Use 'property-detail-container' class which triggers RSPropertyDetailTemplate
        // (the self-rendering template component, not rs_detail which requires pre-built HTML)
        const detailContainer = document.createElement('div');
        detailContainer.className = 'property-detail-container';
        detailContainer.id = 'property-detail-container';
        detailContainer.dataset.propertyRef = propertyRef;
        detailContainer.dataset.rsAutoInjected = 'true';

        // Add loading state
        detailContainer.innerHTML = `
            <div class="rs-detail-loading" style="text-align: center; padding: 60px 20px;">
                <div class="rs-spinner" style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: rs-spin 1s linear infinite; margin: 0 auto;"></div>
                <p style="margin-top: 20px; color: #666;">Loading property details...</p>
            </div>
            <style>
                @keyframes rs-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        // Insert at beginning of main content
        if (mainContent.firstChild) {
            mainContent.insertBefore(detailContainer, mainContent.firstChild);
        } else {
            mainContent.appendChild(detailContainer);
        }

        console.log('[RealtySoft] ✓ Auto-injected rs_detail container successfully');

        // Store reference for later use
        window._rsAutoInjectedRef = propertyRef;

        return true;
    }

    /**
     * Check if we should auto-initialize based on URL or elements
     */
    function shouldAutoInit() {
        // Check for explicit widget containers
        if (document.querySelector('[class^="rs_"]') ||
            document.getElementById('rs_search') ||
            document.getElementById('rs_listing')) {
            return true;
        }

        // Check for auto-render template markers
        if (document.querySelector('.rs-search-template-01') ||
            document.querySelector('.rs-search-template-02') ||
            document.querySelector('.rs-listing-template-01') ||
            document.querySelector('.rs-listing-template-02') ||
            document.querySelector('.rs-listing-template-03') ||
            document.querySelector('.rs-listing-template-04') ||
            document.querySelector('.rs-listing-template-05') ||
            document.querySelector('.rs-listing-template-06') ||
            document.querySelector('.rs-listing-template-07')) {
            return true;
        }

        // Check for property URL pattern (auto-detect property pages)
        const propertyRef = extractPropertyRefFromUrl();
        if (propertyRef) {
            // Auto-inject container if none exists
            if (!document.querySelector('.rs_detail') &&
                !document.querySelector('.property-detail-container') &&
                !document.querySelector('#property-detail-container')) {
                autoInjectPropertyDetail(propertyRef);
            }
            return true;
        }

        return false;
    }

    // Auto-initialize on DOMContentLoaded if elements present or property URL detected
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (shouldAutoInit()) {
                init();
            }
        });
    } else {
        // DOM already loaded
        setTimeout(() => {
            if (shouldAutoInit()) {
                init();
            }
        }, 0);
    }

    /**
     * Get current widget mode
     */
    function getMode() {
        return widgetMode;
    }

    /**
     * Change language and reload labels
     * @param {string} newLanguage - The new language code (e.g., 'es_ES')
     * @returns {Promise<void>}
     */
    async function setLanguage(newLanguage) {
        console.log('[RealtySoft] Changing language to:', newLanguage);

        // Update language in labels module
        RealtySoftLabels.setLanguage(newLanguage);

        // Update config state
        RealtySoftState.set('config.language', newLanguage);

        // Reinitialize API with new language
        const globalConfig = window.RealtySoftConfig || {};
        RealtySoftAPI.init({
            language: newLanguage,
            apiKey: globalConfig.apiKey,
            apiUrl: globalConfig.apiUrl
        });

        // Clear label cache and reload from API
        RealtySoftAPI.clearCache('labels_' + RealtySoftState.get('config.language'));

        try {
            const labelsData = await RealtySoftAPI.getLabels();
            let apiLabels = null;
            if (labelsData) {
                apiLabels = labelsData.labels || labelsData;
            }
            if (apiLabels && typeof apiLabels === 'object' && !Array.isArray(apiLabels)) {
                await RealtySoftLabels.loadFromAPI(apiLabels);
            }

            // Apply client overrides again
            if (globalConfig.labelOverrides) {
                RealtySoftLabels.applyOverrides(globalConfig.labelOverrides);
            }

            // Update labels in state
            RealtySoftState.set('data.labels', RealtySoftLabels.getAll());

            // Re-render all components to reflect new labels
            console.log('[RealtySoft] Re-rendering', componentInstances.length, 'components with new labels');
            for (const instance of componentInstances) {
                if (instance && typeof instance.render === 'function') {
                    try {
                        instance.render();
                    } catch (e) {
                        console.warn('[RealtySoft] Error re-rendering component:', e);
                    }
                }
            }

            console.log('[RealtySoft] Language changed successfully to:', newLanguage);
        } catch (error) {
            console.error('[RealtySoft] Error loading labels for language:', newLanguage, error);
        }
    }

    // Public API
    return {
        init,
        registerComponent,
        getComponent,
        search,
        loadProperty,
        loadPropertyByRef,
        reset,
        goToPage,
        setSort,
        setView,
        setFilter,
        getState,
        subscribe,
        isReady,
        getMode,
        setLanguage,

        // Expose sub-modules
        State: RealtySoftState,
        API: RealtySoftAPI,
        Labels: RealtySoftLabels,
        Analytics: RealtySoftAnalytics
    };
})();

// Make globally available
window.RealtySoft = RealtySoft;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtySoft;
}
