/**
 * RealtySoft Widget v2 - Labels/i18n
 * Internationalization using labels from API
 */

const RealtySoftLabels = (function() {
    'use strict';

    // Default labels (fallback)
    const defaults = {
        // Search
        search_location: 'Location',
        search_location_placeholder: 'Search location...',
        search_sublocation: 'Sub-location',
        search_listing_type: 'Status',
        search_listing_type_all: 'Status',
        search_sale: 'For Sale',
        search_rent: 'For Rent',
        listing_type_sale: 'For Sale',
        listing_type_new: 'New Development',
        listing_type_long_rental: 'Long Term Rental',
        listing_type_short_rental: 'Holiday Rental',
        search_property_type: 'Property Type',
        search_property_type_placeholder: 'Any property type',
        search_bedrooms: 'Bedrooms',
        search_bedrooms_any: 'Min Bed',
        search_bedrooms_select: 'Select Bedrooms',
        search_bedrooms_input: 'e.g., 3',
        search_bathrooms: 'Bathrooms',
        search_bathrooms_any: 'Min Bath',
        search_bathrooms_select: 'Select Bathrooms',
        search_bathrooms_input: 'e.g., 2',
        search_price: 'Price',
        search_price_min: 'Min Price',
        search_price_max: 'Max Price',
        search_price_select_min: 'Select Min Price',
        search_price_select_max: 'Select Max Price',
        search_price_input_min: 'Min (e.g., 200000)',
        search_price_input_max: 'Max (e.g., 500000)',
        search_built_area: 'Built Area',
        search_plot_size: 'Plot Size',
        search_features: 'Features',
        search_features_placeholder: 'Select Features',
        search_features_filter: 'Search features...',
        search_reference: 'Reference',
        search_button: 'Search',
        search_reset: 'Reset Filters',
        search_any: 'Any',
        search_all: 'All',
        search_min: 'Min',
        search_max: 'Max',

        // Results
        results_count: '{count} properties found',
        results_count_one: '1 property found',
        results_count_zero: 'No properties found',
        results_sort: 'Sort by',
        results_view_grid: 'Grid',
        results_view_list: 'List',
        results_loading: 'Loading...',

        // Sort options
        sort_newest: 'Newest Listings',
        sort_oldest: 'Oldest Listings',
        sort_updated: 'Recently Updated',
        sort_oldest_updated: 'Oldest Updated',
        sort_price_asc: 'Price: Low to High',
        sort_price_desc: 'Price: High to Low',
        sort_featured: 'Featured First',
        sort_location: 'By Location',
        sort_own: 'Own Properties First',

        // Property card
        card_bed: 'bed',
        card_beds: 'beds',
        card_bath: 'bath',
        card_baths: 'baths',
        card_built: 'm²',
        card_plot: 'm²',
        card_view: 'View Details',
        card_ref: 'Ref:',

        // Property detail
        detail_description: 'Description',
        detail_features: 'Features',
        detail_location: 'Location',
        detail_contact: 'Contact Agent',
        detail_share: 'Share',
        detail_back: 'Back to Results',
        detail_back_to_search: 'Back to Search',
        detail_related: 'Similar Properties',
        detail_year_built: 'Year Built',
        detail_property_type: 'Property Type',
        detail_status: 'Status',
        detail_reference: 'Reference',
        detail_unique_ref: 'Unique Reference',
        detail_postal_code: 'Postal Code',
        detail_floor: 'Floor',
        detail_orientation: 'Orientation',
        detail_condition: 'Condition',
        detail_furnished: 'Furnished',
        detail_views: 'Views',
        detail_parking: 'Parking',
        detail_built_area: 'Built Area',
        detail_plot_size: 'Plot Size',
        detail_usable_area: 'Usable Area',
        detail_terrace: 'Terrace',
        detail_solarium: 'Solarium',
        detail_garden: 'Garden',
        detail_sizes: 'Property Sizes',
        detail_property_info: 'Property Information',
        detail_taxes_fees: 'Taxes & Fees',
        detail_community_fees: 'Community Fees',
        detail_ibi_tax: 'IBI Tax',
        detail_basura_tax: 'Basura Tax',
        detail_per_month: '/month',
        detail_per_year: '/year',
        detail_energy_certificate: 'Energy Certificate',
        detail_energy_rating: 'Energy Rating',
        detail_co2_rating: 'CO2 Rating',
        detail_additional_resources: 'Additional Resources',
        detail_video_tour: 'Video Tour',
        detail_virtual_tour: 'Virtual Tour',
        detail_download_pdf: 'Download PDF',
        detail_loading_map: 'Loading map...',
        detail_price_on_request: 'Price on Request',

        // Wishlist
        sort_by: 'Sort By',
        wishlist_add: 'Add to Wishlist',
        wishlist_remove: 'Remove from Wishlist',
        wishlist_title: 'My Wishlist',
        wishlist_shared_title: 'Shared Wishlist',
        wishlist_empty: 'Your wishlist is empty',
        wishlist_empty_desc: 'Start adding properties by clicking the heart icon',
        wishlist_share: 'Share',
        wishlist_email: 'Email',
        wishlist_pdf: 'Download PDF',
        wishlist_clear: 'Clear All',
        wishlist_back: 'Back to Results',
        wishlist_browse: 'Browse Properties',
        wishlist_add_note: 'Add Note',
        wishlist_compare: 'Compare',
        wishlist_confirm_remove: 'Remove this property from your wishlist?',
        wishlist_confirm_clear: 'Are you sure you want to clear your entire wishlist?',
        wishlist_removed: 'Removed from wishlist',
        wishlist_cleared: 'Wishlist cleared',
        wishlist_no_share: 'No properties to share',
        wishlist_loading_shared: 'Loading shared properties...',
        wishlist_shared_empty: 'No properties found in shared wishlist',
        wishlist_shared_desc: 'This is a read-only view of saved properties',
        wishlist_error: 'Error loading wishlist',
        wishlist_no_properties: 'No properties saved',
        wishlist_share_title: 'Share Your Wishlist',
        wishlist_share_desc: 'Share this link with anyone to show them your saved properties:',
        wishlist_email_title: 'Email Your Wishlist',
        wishlist_email_to: 'Send to:',
        wishlist_email_from: 'Your email (optional):',
        wishlist_email_message: 'Personal message (optional):',
        wishlist_email_placeholder: 'Add a personal note...',
        wishlist_email_send: 'Send Email',
        wishlist_email_sent: 'Email sent successfully!',
        wishlist_email_error: 'Failed to send email',
        wishlist_note_title: 'Add Property Note',
        wishlist_note_label: 'Your note:',
        wishlist_note_placeholder: 'Add your thoughts, questions, or reminders...',
        wishlist_compare_title: 'Compare Properties',
        wishlist_compare_clear: 'Clear Selection',

        // Sort options for wishlist
        sort_wishlist_recent: 'Recently Added',
        sort_wishlist_oldest: 'Oldest First',
        sort_wishlist_name: 'Name: A-Z',

        // Common
        view_details: 'View Details',
        compare: 'Compare',
        compare_max: 'Maximum',
        compare_min: 'Select at least 2 properties to compare',
        compare_confirm_clear: 'Clear all selected properties?',
        added: 'Added',
        note: 'Note',
        note_saved: 'Note saved!',
        note_deleted: 'Note deleted',
        confirm_delete_note: 'Delete this note?',
        copy: 'Copy',
        copied: 'Link copied to clipboard!',
        cancel: 'Cancel',
        close: 'Close',
        save: 'Save',
        delete: 'Delete',
        error: 'Error',
        property: 'property',
        properties: 'properties',
        saved: 'saved',
        feature: 'Feature',
        price: 'Price',
        location: 'Location',
        type: 'Type',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        build_size: 'Build Size',
        plot_size: 'Plot Size',
        status: 'Status',
        featured: 'Featured',
        own: 'Own',

        // Inquiry form
        inquiry_name: 'Your Name',
        inquiry_first_name: 'First Name',
        inquiry_last_name: 'Last Name',
        inquiry_email: 'Your Email',
        inquiry_phone: 'Your Phone',
        inquiry_message: 'Message',
        inquiry_submit: 'Send Inquiry',
        inquiry_sending: 'Sending...',
        inquiry_success: 'Thank you! Your inquiry has been sent.',
        inquiry_error: 'Sorry, there was an error. Please try again.',
        inquiry_privacy: 'I accept the privacy policy',
        inquiry_privacy_accept: 'I accept the',
        inquiry_privacy_policy: 'privacy policy',
        inquiry_country: 'Country',

        // Pagination
        pagination_prev: 'Previous',
        pagination_next: 'Next',
        pagination_page: 'Page',
        pagination_of: 'of',
        pagination_load_more: 'Load More',

        // General
        general_error: 'An error occurred',
        general_retry: 'Try Again',
        general_close: 'Close',
        general_select: 'Select',
        general_selected: 'Selected',
        general_clear: 'Clear',

        // Map
        detail_view_larger_map: 'View Larger Map',
        detail_get_directions: 'Get Directions',
        map_precision_exact: 'Exact location',
        map_precision_zipcode: 'Postal code area',
        map_precision_area: 'Area'
    };

    // Current labels (merged with API labels)
    let labels = { ...defaults };

    // Current language
    let currentLanguage = 'en_US';

    /**
     * Language code mapping
     */
    const languageMap = {
        'en': 'en_US',
        'es': 'es_ES',
        'de': 'de_DE',
        'fr': 'fr_FR',
        'it': 'it_IT',
        'pt': 'pt_PT',
        'nl': 'nl_NL',
        'ru': 'ru_RU',
        'zh': 'zh_CN',
        'ja': 'ja_JP',
        'ar': 'ar_SA',
        'sv': 'sv_SE',
        'no': 'no_NO',
        'da': 'da_DK',
        'fi': 'fi_FI',
        'pl': 'pl_PL'
    };

    /**
     * Detect language from browser/document
     */
    function detectLanguage() {
        // Priority 1: Browser language
        let lang = navigator.language || navigator.userLanguage;
        if (lang) {
            // Convert 'en-US' to 'en_US' format
            lang = lang.replace('-', '_');

            // Check if exact match exists
            if (lang.includes('_')) {
                // Already in full format
                return lang;
            }

            // Map short code to full format
            if (languageMap[lang.toLowerCase()]) {
                return languageMap[lang.toLowerCase()];
            }
        }

        // Priority 2: HTML lang attribute
        const htmlLang = document.documentElement.lang;
        if (htmlLang) {
            const shortLang = htmlLang.split('-')[0].toLowerCase();
            if (languageMap[shortLang]) {
                return languageMap[shortLang];
            }
        }

        // Priority 3: Default
        return 'en_US';
    }

    /**
     * Initialize labels
     */
    function init(language = null) {
        currentLanguage = language || detectLanguage();
        return currentLanguage;
    }

    /**
     * Load labels from API
     */
    async function loadFromAPI(apiLabels) {
        if (apiLabels && typeof apiLabels === 'object') {
            const labelCount = Object.keys(apiLabels).length;
            console.log('[RealtySoft Labels] Loading', labelCount, 'labels from API for language:', currentLanguage);
            labels = { ...defaults, ...apiLabels };
        } else {
            console.log('[RealtySoft Labels] No API labels provided, using defaults');
        }
    }

    /**
     * Apply client-specific label overrides
     * This allows per-client customization on top of API labels
     * @param {object} overrides - Object with label key:value pairs to override
     */
    function applyOverrides(overrides) {
        if (overrides && typeof overrides === 'object') {
            const overrideCount = Object.keys(overrides).length;
            console.log('[RealtySoft Labels] Applying', overrideCount, 'client label overrides');
            labels = { ...labels, ...overrides };
        }
    }

    /**
     * Reload labels for a new language
     * @param {string} newLanguage - The new language code (e.g., 'es_ES')
     * @returns {Promise<void>}
     */
    async function reloadForLanguage(newLanguage) {
        console.log('[RealtySoft Labels] Reloading labels for language:', newLanguage);
        currentLanguage = newLanguage;

        // Reset to defaults first
        labels = { ...defaults };

        // Labels will be reloaded by the controller when it detects language change
    }

    /**
     * Get a label with optional replacements
     * @param {string} key - Label key
     * @param {object} replacements - Optional placeholder replacements
     */
    function get(key, replacements = {}) {
        let label = labels[key] || defaults[key] || key;

        // Replace placeholders like {count}
        for (const [placeholder, value] of Object.entries(replacements)) {
            label = label.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
        }

        return label;
    }

    /**
     * Get all labels
     */
    function getAll() {
        return { ...labels };
    }

    /**
     * Get current language
     */
    function getLanguage() {
        return currentLanguage;
    }

    /**
     * Set language
     */
    function setLanguage(lang) {
        currentLanguage = lang;
    }

    /**
     * Format price based on locale
     */
    function formatPrice(price, currency = 'EUR') {
        if (price === null || price === undefined) return '';

        try {
            const locale = currentLanguage.replace('_', '-');
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(price);
        } catch (e) {
            return `€${price.toLocaleString()}`;
        }
    }

    /**
     * Format number based on locale
     */
    function formatNumber(number) {
        if (number === null || number === undefined) return '';

        try {
            const locale = currentLanguage.replace('_', '-');
            return new Intl.NumberFormat(locale).format(number);
        } catch (e) {
            return number.toLocaleString();
        }
    }

    /**
     * Format area (m²)
     */
    function formatArea(value) {
        if (!value) return '';
        return `${formatNumber(value)} m²`;
    }

    // Public API
    return {
        init,
        loadFromAPI,
        applyOverrides,
        reloadForLanguage,
        get,
        getAll,
        getLanguage,
        setLanguage,
        detectLanguage,
        formatPrice,
        formatNumber,
        formatArea
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtySoftLabels;
}
