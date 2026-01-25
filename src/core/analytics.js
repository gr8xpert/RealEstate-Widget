/**
 * RealtySoft Widget v2 - Analytics
 * Event tracking for search, views, clicks, wishlist, inquiries
 */

const RealtySoftAnalytics = (function() {
    'use strict';

    const config = {
        enabled: true,
        endpoint: null,
        batchSize: 5,
        batchDelay: 3000,
        debug: true
    };

    /**
     * Auto-detect the analytics endpoint based on script location
     */
    function detectEndpoint() {
        try {
            const scripts = document.querySelectorAll('script[src*="realtysoft"]');
            for (let i = 0; i < scripts.length; i++) {
                const src = scripts[i].src;
                if (src.indexOf('realtysoft') !== -1) {
                    const idx = src.indexOf('/realtysoft/');
                    if (idx !== -1) {
                        return src.substring(0, idx) + '/realtysoft/php/analytics-track.php';
                    }
                }
            }
        } catch (e) {
            console.error('[RealtySoft] Analytics detectEndpoint error:', e);
        }
        return window.location.origin + '/realtysoft/php/analytics-track.php';
    }

    let eventQueue = [];
    let batchTimer = null;

    /**
     * Initialize analytics
     */
    function init(options) {
        if (options) {
            for (const key in options) {
                if (options.hasOwnProperty(key)) {
                    config[key] = options[key];
                }
            }
        }

        if (!config.endpoint) {
            config.endpoint = detectEndpoint();
        }

        console.log('[RealtySoft] Analytics initialized, endpoint:', config.endpoint);

        window.addEventListener('beforeunload', flush);

        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                flush();
            }
        });
    }

    /**
     * Track an event
     */
    function track(category, action, data) {
        if (!config.enabled) return;

        data = data || {};

        const event = {
            category: category,
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            sessionId: getSessionId()
        };

        if (config.debug) {
            console.log('[RealtySoft] Analytics Event:', category, action);
        }

        eventQueue.push(event);

        if (eventQueue.length >= config.batchSize) {
            flush();
        } else {
            scheduleBatch();
        }
    }

    /**
     * Schedule batch send
     */
    function scheduleBatch() {
        if (batchTimer) return;

        batchTimer = setTimeout(function() {
            flush();
            batchTimer = null;
        }, config.batchDelay);
    }

    /**
     * Flush event queue to server
     */
    function flush() {
        if (eventQueue.length === 0) return;

        const events = eventQueue.slice();
        eventQueue = [];

        console.log('[RealtySoft] Analytics: Sending', events.length, 'events to', config.endpoint);

        fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: events }),
            keepalive: true
        }).then(function(response) {
            console.log('[RealtySoft] Analytics response:', response.status);
            return response.json();
        }).then(function(data) {
            console.log('[RealtySoft] Analytics result:', data);
        }).catch(function(err) {
            console.error('[RealtySoft] Analytics send failed:', err);
        });
    }

    /**
     * Get or create session ID
     */
    function getSessionId() {
        let sessionId = sessionStorage.getItem('rs_session_id');
        if (!sessionId) {
            sessionId = 'rs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('rs_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Track search event
     */
    function trackSearch(filters) {
        filters = filters || {};
        track('search', 'search', {
            location: filters.location,
            listing_type: filters.listingType,
            property_type: filters.propertyType,
            beds_min: filters.bedsMin,
            beds_max: filters.bedsMax,
            price_min: filters.priceMin,
            price_max: filters.priceMax,
            features: filters.features
        });
    }

    /**
     * Track property view
     */
    function trackPropertyView(property) {
        property = property || {};
        track('view', 'property_view', {
            property_id: property.id,
            property_ref: property.ref,
            property_type: property.type,
            location: property.location,
            price: property.price
        });
    }

    /**
     * Track property card click
     */
    function trackCardClick(property) {
        property = property || {};
        track('click', 'card_click', {
            property_id: property.id,
            property_ref: property.ref
        });
    }

    /**
     * Track gallery view
     */
    function trackGalleryView(propertyId, imageIndex) {
        track('view', 'gallery_view', {
            property_id: propertyId,
            image_index: imageIndex
        });
    }

    /**
     * Track wishlist add
     */
    function trackWishlistAdd(propertyId) {
        track('wishlist', 'add', {
            property_id: propertyId
        });
    }

    /**
     * Track wishlist remove
     */
    function trackWishlistRemove(propertyId) {
        track('wishlist', 'remove', {
            property_id: propertyId
        });
    }

    /**
     * Track wishlist view
     */
    function trackWishlistView(propertyIds) {
        propertyIds = propertyIds || [];
        track('wishlist', 'view', {
            property_ids: propertyIds,
            count: propertyIds.length
        });
    }

    /**
     * Track wishlist share
     */
    function trackWishlistShare(method) {
        track('wishlist', 'share', {
            method: method
        });
    }

    /**
     * Track inquiry submission
     */
    function trackInquiry(propertyId, propertyRef) {
        track('inquiry', 'submit', {
            property_id: propertyId,
            property_ref: propertyRef
        });
    }

    /**
     * Track social share
     */
    function trackShare(platform, propertyId) {
        track('click', 'share', {
            platform: platform,
            property_id: propertyId
        });
    }

    /**
     * Track link click
     */
    function trackLinkClick(linkType, url) {
        track('click', 'link', {
            link_type: linkType,
            url: url
        });
    }

    /**
     * Track filter change
     */
    function trackFilterChange(filterName, value) {
        track('search', 'filter_change', {
            filter: filterName,
            value: value
        });
    }

    /**
     * Track pagination
     */
    function trackPagination(page, totalPages) {
        track('click', 'pagination', {
            page: page,
            total_pages: totalPages
        });
    }

    /**
     * Track sort change
     */
    function trackSortChange(sortValue) {
        track('click', 'sort', {
            sort: sortValue
        });
    }

    /**
     * Track view toggle (grid/list)
     */
    function trackViewToggle(view) {
        track('click', 'view_toggle', {
            view: view
        });
    }

    /**
     * Track resource click (PDF, virtual tour, video, etc.)
     */
    function trackResourceClick(resourceType, propertyId) {
        track('click', 'resource', {
            resource_type: resourceType,
            property_id: propertyId
        });
    }

    return {
        init: init,
        track: track,
        flush: flush,
        trackSearch: trackSearch,
        trackPropertyView: trackPropertyView,
        trackCardClick: trackCardClick,
        trackGalleryView: trackGalleryView,
        trackWishlistAdd: trackWishlistAdd,
        trackWishlistRemove: trackWishlistRemove,
        trackWishlistView: trackWishlistView,
        trackWishlistShare: trackWishlistShare,
        trackInquiry: trackInquiry,
        trackShare: trackShare,
        trackLinkClick: trackLinkClick,
        trackFilterChange: trackFilterChange,
        trackPagination: trackPagination,
        trackSortChange: trackSortChange,
        trackViewToggle: trackViewToggle,
        trackResourceClick: trackResourceClick
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtySoftAnalytics;
}
