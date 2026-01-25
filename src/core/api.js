/**
 * RealtySoft Widget v2 - API Service
 * Handles all API communication through proxy
 */

const RealtySoftAPI = (function() {
    'use strict';

    /**
     * CacheManager - localStorage caching with 24-hour TTL for static data
     */
    const CacheManager = {
        CACHE_PREFIX: 'rs_cache_',
        CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
        SEARCH_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours for search results

        get(key) {
            try {
                const cached = localStorage.getItem(this.CACHE_PREFIX + key);
                if (!cached) return null;
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp > this.CACHE_DURATION) {
                    localStorage.removeItem(this.CACHE_PREFIX + key);
                    return null;
                }
                return data;
            } catch (e) {
                console.warn('Cache read error:', e);
                return null;
            }
        },

        set(key, data) {
            try {
                localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Cache write error:', e);
            }
        },

        getSearch(key) {
            try {
                const cached = localStorage.getItem(this.CACHE_PREFIX + key);
                if (!cached) return null;
                const { data, timestamp } = JSON.parse(cached);
                // 24-hour TTL for search results
                if (Date.now() - timestamp > this.SEARCH_CACHE_DURATION) {
                    localStorage.removeItem(this.CACHE_PREFIX + key);
                    return null;
                }
                return data;
            } catch (e) {
                return null;
            }
        },

        setSearch(key, data) {
            try {
                localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                // Ignore - localStorage might be full
            }
        },

        clear(key) {
            try {
                if (key) {
                    localStorage.removeItem(this.CACHE_PREFIX + key);
                } else {
                    // Clear all RS cache entries
                    Object.keys(localStorage)
                        .filter(k => k.startsWith(this.CACHE_PREFIX))
                        .forEach(k => localStorage.removeItem(k));
                }
            } catch (e) {
                console.warn('Cache clear error:', e);
            }
        }
    };

    /**
     * Simple hash function for cache keys
     */
    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    // In-flight request deduplication - prevents duplicate concurrent API requests
    const pendingRequests = new Map();

    let config = {
        proxyUrl: 'https://realtysoft.ai/realtysoft/php/api-proxy.php',
        inquiryEndpoint: 'https://realtysoft.ai/widget/send-inquiry.php',
        apiKey: null,
        apiUrl: null,
        language: 'en_US'
    };

    /**
     * Initialize API with config
     */
    function init(options) {
        config = { ...config, ...options };
    }

    /**
     * Make API request through proxy
     * @param {string} endpoint - API endpoint
     * @param {object} params - Request parameters
     * @param {string} method - HTTP method
     * @param {object} options - Additional options (skipLang: boolean)
     */
    async function request(endpoint, params = {}, method = 'GET', options = {}) {
        // Create request key for deduplication (endpoint + params hash)
        const requestKey = endpoint + '_' + hashString(JSON.stringify(params)) + '_' + method;

        // Return existing promise if same request is already in-flight
        if (pendingRequests.has(requestKey)) {
            console.log('[RealtySoft] Deduplicating request:', endpoint);
            return pendingRequests.get(requestKey);
        }

        const url = new URL(config.proxyUrl, window.location.origin);

        // Add endpoint to params
        params._endpoint = endpoint;

        // Add language unless skipped
        if (!options.skipLang) {
            params._lang = config.language;
        }

        if (method === 'GET') {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    url.searchParams.append(key, params[key]);
                }
            });
        }

        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        if (method === 'POST') {
            fetchOptions.body = JSON.stringify(params);
        }

        // Create the request promise
        const requestPromise = (async () => {
            try {
                const response = await fetch(url.toString(), fetchOptions);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                return data;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            } finally {
                // Clean up pending request after completion
                pendingRequests.delete(requestKey);
            }
        })();

        // Store the promise for deduplication
        pendingRequests.set(requestKey, requestPromise);

        return requestPromise;
    }

    /**
     * Get locations (v1 endpoint, no language param)
     * Fetches ALL locations in a single request with high limit
     * Uses localStorage cache with 24-hour TTL
     */
    async function getLocations(parentId = null) {
        const cacheKey = 'locations' + (parentId ? '_' + parentId : '');

        // Check cache first
        const cached = CacheManager.get(cacheKey);
        if (cached) {
            console.log('[RealtySoft] Locations loaded from cache');
            return cached;
        }

        // Fetch ALL locations in a single request with high limit
        // This reduces 14 requests (1 meta + 13 pages) to just 1 request
        const params = { page: 1, limit: 1000 };
        if (parentId) params.parent_id = parentId;

        const response = await request('v1/location', params, 'GET', { skipLang: true });

        // Deduplicate by ID (in case of any duplicates)
        const seen = new Set();
        const uniqueData = (response.data || []).filter(loc => {
            if (seen.has(loc.id)) return false;
            seen.add(loc.id);
            return true;
        });

        const result = { data: uniqueData, count: response.count || uniqueData.length };

        // Cache the result
        CacheManager.set(cacheKey, result);
        console.log('[RealtySoft] Locations cached');

        return result;
    }

    /**
     * Get parent/top-level locations only (for lazy loading)
     * Only fetches locations without parent_id (top-level)
     * Uses localStorage cache with 24-hour TTL
     */
    async function getParentLocations() {
        const cacheKey = 'parentLocations';

        // Check cache first
        const cached = CacheManager.get(cacheKey);
        if (cached) {
            console.log('[RealtySoft] Parent locations loaded from cache');
            return cached;
        }

        // Only fetch locations without parent_id (top-level)
        const result = await request('v1/location', { parent_id: 0 }, 'GET', { skipLang: true });

        // Cache the result
        CacheManager.set(cacheKey, result);
        console.log('[RealtySoft] Parent locations cached');

        return result;
    }

    /**
     * Get child locations for a specific parent (for lazy loading)
     * Fetches on demand when dropdown is clicked
     * Uses localStorage cache with 24-hour TTL
     */
    async function getChildLocations(parentId) {
        const cacheKey = 'childLocations_' + parentId;

        // Check cache first
        const cached = CacheManager.get(cacheKey);
        if (cached) {
            console.log('[RealtySoft] Child locations loaded from cache for parent:', parentId);
            return cached;
        }

        const result = await request('v1/location', { parent_id: parentId }, 'GET', { skipLang: true });

        // Cache the result
        CacheManager.set(cacheKey, result);
        console.log('[RealtySoft] Child locations cached for parent:', parentId);

        return result;
    }

    /**
     * Search locations by term
     */
    async function searchLocations(term) {
        return await request('v1/search_location', { q: term });
    }

    /**
     * Get relevant/related locations
     */
    async function getRelevantLocations(locationId) {
        return await request('v1/relevant_location', { id: locationId });
    }

    /**
     * Get property types
     * Uses localStorage cache with 24-hour TTL
     */
    async function getPropertyTypes() {
        const cacheKey = 'propertyTypes_' + config.language;

        // Check cache first
        const cached = CacheManager.get(cacheKey);
        if (cached) {
            console.log('[RealtySoft] Property types loaded from cache');
            return cached;
        }

        const result = await request('v1/property_types');

        // Cache the result
        CacheManager.set(cacheKey, result);
        console.log('[RealtySoft] Property types cached');

        return result;
    }

    /**
     * Get property features
     * Uses localStorage cache with 24-hour TTL
     */
    async function getFeatures() {
        const cacheKey = 'features_' + config.language;

        // Check cache first
        const cached = CacheManager.get(cacheKey);
        if (cached) {
            console.log('[RealtySoft] Features loaded from cache');
            return cached;
        }

        const result = await request('v1/property_features');

        // Cache the result
        CacheManager.set(cacheKey, result);
        console.log('[RealtySoft] Features cached');

        return result;
    }

    /**
     * Get UI labels for current language
     * Uses localStorage cache with 24-hour TTL
     */
    async function getLabels() {
        const cacheKey = 'labels_' + config.language;

        // Check cache first
        const cached = CacheManager.get(cacheKey);
        if (cached) {
            console.log('[RealtySoft] Labels loaded from cache');
            return cached;
        }

        const result = await request('v1/plugin_labels');

        // Cache the result
        CacheManager.set(cacheKey, result);
        console.log('[RealtySoft] Labels cached');

        return result;
    }

    /**
     * Normalize property data from API to expected format
     * Maps Inmolink API fields to widget expected fields
     */
    function normalizeProperty(property) {
        if (!property) return property;

        // Extract images - API returns array of objects with multiple sizes
        let images = [];
        let imagesFull = [];
        let imagesWithSizes = []; // Preserve all sizes for responsive srcset
        if (property.images && Array.isArray(property.images)) {
            images = property.images.map(img => {
                if (typeof img === 'string') return img;
                // For card thumbnails use smaller size
                return img.image_256 || img.image_512 || img.image_768 || img.src || img.url || '';
            }).filter(Boolean);
            // For gallery use larger images
            imagesFull = property.images.map(img => {
                if (typeof img === 'string') return img;
                // Prefer larger sizes for gallery (768 is commonly used in old widget)
                return img.image_1024 || img.image_768 || img.image_512 || img.src || img.url || '';
            }).filter(Boolean);
            // Preserve all sizes for responsive srcset
            imagesWithSizes = property.images.map(img => {
                if (typeof img === 'string') return { src: img };
                return {
                    src: img.image_256 || img.image_512 || img.image_768 || img.src || img.url || '',
                    sizes: {
                        256: img.image_256 || null,
                        512: img.image_512 || null,
                        768: img.image_768 || null,
                        1024: img.image_1024 || null
                    }
                };
            }).filter(img => img.src);
        }

        // Extract location name from nested object
        const locationName = property.location_id?.name ||
                            property.location?.name ||
                            property.city_id?.name ||
                            property.municipality_id?.name ||
                            property.location ||
                            property.address ||
                            '';

        // Extract type name from nested object
        const typeName = property.type_id?.name ||
                        property.type?.name ||
                        property.property_type?.name ||
                        property.type ||
                        '';

        // Determine listing type
        const listingType = property.listing_type ||
                           property.listing_type_id?.code ||
                           property.status ||
                           'resale';

        // Extract features - API returns array with name and attr_id.name (category)
        let features = [];
        if (property.features && Array.isArray(property.features)) {
            features = property.features.map(f => {
                if (typeof f === 'string') return f;
                // Return object with name and category for grouped display
                return {
                    name: f.name || f.label || f.title || '',
                    category: f.attr_id?.name || f.category || 'Features'
                };
            }).filter(f => f.name);
        } else if (property.amenities && Array.isArray(property.amenities)) {
            features = property.amenities.map(f => {
                if (typeof f === 'string') return { name: f, category: 'Features' };
                return {
                    name: f.name || f.label || f.title || '',
                    category: f.category || 'Features'
                };
            }).filter(f => f.name);
        }

        // Extract agent info
        const agent = property.agent || property.listing_agent || property.contact || property.user || null;
        const agentData = agent ? {
            name: agent.name || agent.full_name || agent.display_name || '',
            email: agent.email || '',
            phone: agent.phone || agent.telephone || agent.mobile || '',
            photo: agent.photo || agent.avatar || agent.image || ''
        } : null;

        return {
            id: property.id,
            // Title
            title: property.title || property.name || property.headline || '',
            // Reference - API uses ref_no
            ref: property.ref_no || property.ref || property.reference || '',
            unique_ref: property.unique_ref || property.unique_reference || property.external_ref || '',
            // Price - API uses list_price
            price: property.list_price || property.price || property.asking_price || 0,
            price_on_request: property.price_on_request || property.hide_price || false,
            // Location - extracted from nested object
            location: locationName,
            postal_code: property.postal_code || property.zipcode || property.zip || property.postcode || '',
            address: property.address || property.street_address || '',
            // Beds/Baths - API uses bedrooms/bathrooms
            beds: property.bedrooms || property.beds || 0,
            baths: property.bathrooms || property.baths || 0,
            // Areas - API uses build_size and plot_size (check multiple possible field names)
            built_area: property.build_size || property.built_area || property.built || property.building_size || property.constructed_area || property.m2_pivienda || property.size || 0,
            plot_size: property.plot_size || property.plot || property.land_area || property.terrain_size || property.m2_parcela || 0,
            // Additional sizes
            terrace_size: property.terrace_size || property.terrace_area || property.terrace || property.m2_terraza || 0,
            solarium_size: property.solarium_size || property.solarium_area || property.solarium || property.m2_solarium || 0,
            garden_size: property.garden_size || property.garden_area || property.garden || property.m2_jardin || 0,
            usable_area: property.usable_area || property.usable_size || property.useful_area || property.m2_utiles || 0,
            // Images - thumbnail URLs for cards
            images: images,
            // Full size images for gallery
            imagesFull: imagesFull,
            // Images with all sizes for responsive srcset
            imagesWithSizes: imagesWithSizes,
            // Total image count (before slicing)
            total_images: property.images?.length || 0,
            // URL
            url: property.url || property.link || property.permalink || null,
            // Listing type for labels
            listing_type: listingType,
            // Status - API may use listing_type_id
            status: property.status || property.listing_type_id?.name || property.listing_status || '',
            // Type - extracted from nested object
            type: typeName,
            // Flags for badges
            is_featured: property.is_featured === true || property.is_featured === 1 || property.is_featured === '1',
            is_own: property.is_own === true || property.is_own === 1 || property.is_own === '1',
            is_new: property.is_new === true || property.is_new === 1 || property.is_new === '1',
            is_exclusive: property.is_exclusive === true || property.is_exclusive === 1 || property.is_exclusive === '1',
            // Description - API uses 'desc' as primary field
            description: property.desc || property.description || property.full_description || '',
            short_description: property.short_description || property.summary || '',
            // Features for detail page
            features: features,
            // Agent info
            agent: agentData,
            // Location coordinates for map
            latitude: property.latitude || property.lat || property.geo_lat || null,
            longitude: property.longitude || property.lng || property.lon || property.geo_lng || null,
            // Year built
            year_built: property.year_built || property.construction_year || property.built_year || null,
            // Taxes & Fees (check multiple possible field names from different APIs)
            community_fees: property.community_fees_monthly || property.community_fees || property.comm_fees || property.community_cost || property.gastos_comunidad || property.monthly_community_fees || null,
            ibi_tax: property.ibi_fees || property.ibi_tax || property.ibi || property.ibi_annual || property.ibi_yearly || null,
            basura_tax: property.basura_tax || property.basura_fees || property.garbage_tax || property.basura || property.waste_tax || null,
            // Energy Certificate
            energy_rating: property.energy_rating || property.energy_certificate?.rating || property.energy_class || '',
            co2_rating: property.co2_rating || property.co2_emission || property.energy_certificate?.co2 || '',
            energy_certificate_image: property.energy_certificate_image || property.energy_certificate?.image || property.energy_image || '',
            energy_consumption: property.energy_consumption || property.energy_certificate?.consumption || '',
            // Media - Video, Virtual Tour, PDF
            video_url: property.video_url || property.video || property.youtube_url || '',
            virtual_tour_url: property.virtual_tour_url || property.virtual_tour || property.tour_360 || property.matterport_url || '',
            pdf_url: property.pdf_url || property.pdf || property.brochure_url || property.brochure || property.pdf_link || property.document_url || property.flyer_url || property.flyer || '',
            // Additional info
            floor: property.floor || property.floor_number || '',
            orientation: property.orientation || '',
            parking: property.parking || property.parking_spaces || property.garage || 0,
            pool: property.pool || property.swimming_pool || false,
            furnished: property.furnished || property.furniture || '',
            condition: property.condition || property.property_condition || '',
            views: property.views || property.view_type || '',
            // Dates
            created_at: property.created_at || property.date_added || property.listed_date || '',
            updated_at: property.updated_at || property.date_modified || property.last_updated || '',
            // Keep original for any custom fields
            _original: property
        };
    }

    /**
     * Normalize array of properties
     */
    function normalizeProperties(data) {
        if (Array.isArray(data)) {
            return data.map(normalizeProperty);
        }
        return data;
    }

    /**
     * Search properties
     * Caches results with 24-hour TTL (filter-based cache key)
     * Also caches individual properties for instant detail page loading
     */
    async function searchProperties(params) {
        // Create cache key from search params
        const cacheKey = 'search_' + hashString(JSON.stringify(params));

        // Check cache (24-hour TTL for search results)
        const cached = CacheManager.getSearch(cacheKey);
        if (cached) {
            console.log('[RealtySoft] Search results from cache');
            return cached;
        }

        const result = await request('v1/property', params);
        // Normalize the property data
        if (result && result.data) {
            result.data = normalizeProperties(result.data);
            // Cache each property individually for instant detail page loading
            result.data.forEach(property => {
                if (property.id) {
                    cacheProperty(property);
                }
            });
            // Cache search results with 24-hour TTL
            CacheManager.setSearch(cacheKey, result);
            console.log('[RealtySoft] Search results cached');
        }
        return result;
    }

    /**
     * Cache a single property for instant loading
     * Uses shorter TTL (1 hour) for property data
     */
    function cacheProperty(property) {
        if (!property || !property.id) return;
        try {
            const key = 'property_' + property.id;
            const refKey = property.ref ? 'property_ref_' + property.ref : null;
            const data = { data: property, timestamp: Date.now() };
            localStorage.setItem(CacheManager.CACHE_PREFIX + key, JSON.stringify(data));
            if (refKey) {
                localStorage.setItem(CacheManager.CACHE_PREFIX + refKey, JSON.stringify(data));
            }
        } catch (e) {
            // Ignore cache errors
        }
    }

    /**
     * Get cached property by ID or ref (1-hour TTL for properties)
     */
    function getCachedProperty(idOrRef, isRef = false) {
        try {
            const key = isRef ? 'property_ref_' + idOrRef : 'property_' + idOrRef;
            const cached = localStorage.getItem(CacheManager.CACHE_PREFIX + key);
            if (!cached) return null;
            const { data, timestamp } = JSON.parse(cached);
            // 1-hour TTL for property cache
            if (Date.now() - timestamp > 60 * 60 * 1000) {
                localStorage.removeItem(CacheManager.CACHE_PREFIX + key);
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    }

    /**
     * Get single property details
     * Returns cached version instantly, fetches fresh in background
     */
    async function getProperty(id, options = {}) {
        // Check cache first for instant response
        const cached = getCachedProperty(id);
        if (cached && !options.forceRefresh) {
            console.log('[RealtySoft] Property loaded from cache:', id);
            // Refresh in background (stale-while-revalidate pattern)
            if (!options.skipBackgroundRefresh) {
                fetchAndCacheProperty(id, false).catch(() => {});
            }
            return { data: cached, fromCache: true };
        }

        return await fetchAndCacheProperty(id, false);
    }

    /**
     * Fetch property from API and cache it
     */
    async function fetchAndCacheProperty(idOrRef, isRef = false) {
        const params = isRef ? { ref_no: idOrRef } : { id: idOrRef };
        const result = await request('v1/property', params);

        let property = null;
        if (result && result.data) {
            if (Array.isArray(result.data) && result.data.length > 0) {
                property = normalizeProperty(result.data[0]);
            } else if (!Array.isArray(result.data)) {
                property = normalizeProperty(result.data);
            }
        } else if (result && !result.data) {
            property = normalizeProperty(result);
        }

        if (property) {
            cacheProperty(property);
            return { data: property };
        }

        return result;
    }

    /**
     * Get property by reference
     * Returns cached version instantly, fetches fresh in background
     */
    async function getPropertyByRef(ref, options = {}) {
        // Check cache first for instant response
        const cached = getCachedProperty(ref, true);
        if (cached && !options.forceRefresh) {
            console.log('[RealtySoft] Property loaded from cache (ref):', ref);
            // Refresh in background
            if (!options.skipBackgroundRefresh) {
                fetchAndCacheProperty(ref, true).catch(() => {});
            }
            return { data: cached, fromCache: true };
        }

        return await fetchAndCacheProperty(ref, true);
    }

    /**
     * Prefetch property details (for hover prefetching)
     * Silently fetches and caches property data
     */
    async function prefetchProperty(idOrRef, isRef = false) {
        // Skip if already cached
        const cached = getCachedProperty(idOrRef, isRef);
        if (cached) return;

        try {
            await fetchAndCacheProperty(idOrRef, isRef);
            console.log('[RealtySoft] Prefetched property:', idOrRef);
        } catch (e) {
            // Silently ignore prefetch errors
        }
    }

    /**
     * Get related properties
     */
    async function getRelatedProperties(propertyId, limit = 6) {
        const result = await request('v1/property', {
            related_to: propertyId,
            per_page: limit
        });
        if (result && result.data) {
            result.data = normalizeProperties(result.data);
        }
        return result;
    }

    /**
     * Submit inquiry
     */
    async function submitInquiry(data) {
        // Use configured inquiry endpoint or default to the working old widget URL
        const url = config.inquiryEndpoint || 'https://realtysoft.ai/widget/send-inquiry.php';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Check both HTTP status and response success flag
        if (!response.ok || result.success === false) {
            const errorMsg = result.message || result.error || 'Failed to submit inquiry';
            console.error('Inquiry error:', errorMsg);
            throw new Error(errorMsg);
        }

        return result;
    }

    /**
     * Get wishlist properties
     */
    async function getWishlistProperties(ids) {
        if (!ids.length) return { data: [], total: 0 };
        const result = await request('v1/property', { ids: ids.join(',') });
        if (result && result.data) {
            result.data = normalizeProperties(result.data);
        }
        return result;
    }

    // Public API
    return {
        init,
        request,
        getLocations,
        getParentLocations,
        getChildLocations,
        searchLocations,
        getRelevantLocations,
        getPropertyTypes,
        getFeatures,
        getLabels,
        searchProperties,
        getProperty,
        getPropertyByRef,
        getRelatedProperties,
        submitInquiry,
        getWishlistProperties,
        // Caching utilities
        prefetchProperty,
        getCachedProperty,
        cacheProperty,
        clearCache: CacheManager.clear.bind(CacheManager)
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtySoftAPI;
}
