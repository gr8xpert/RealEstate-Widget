/**
 * RealtySoft Widget v2 - Wishlist Manager
 * Handles wishlist storage, sorting, sharing, and notes
 * Stores full property data in localStorage for offline access
 * Provides shared state for modular wishlist components
 */

const WishlistManager = (function() {
    'use strict';

    const STORAGE_KEY = 'realtysoft_wishlist';

    // Event names for component communication
    const EVENTS = {
        CHANGED: 'wishlistChanged',
        SORTED: 'wishlistSorted',
        COMPARE_CHANGED: 'wishlistCompareChanged',
        MODAL_OPEN: 'wishlistModalOpen',
        MODAL_CLOSE: 'wishlistModalClose'
    };

    // Shared state for compare selections (not persisted)
    let compareSelected = new Set();
    const maxCompare = 3;

    // Current sort settings
    const currentSort = {
        field: 'addedAt',
        order: 'desc'
    };

    /**
     * Get all wishlist items as object
     */
    function getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[Wishlist] Error reading wishlist:', error);
            return {};
        }
    }

    /**
     * Save wishlist to localStorage
     */
    function save(wishlist) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
            return true;
        } catch (error) {
            console.error('[Wishlist] Error saving wishlist:', error);
            return false;
        }
    }

    /**
     * Check if property is in wishlist
     */
    function has(refNo) {
        const wishlist = getAll();
        return wishlist.hasOwnProperty(String(refNo));
    }

    /**
     * Add property to wishlist
     * @param {Object} property - Property object with all data
     */
    function add(property) {
        const wishlist = getAll();
        const refNo = property.ref_no || property.ref || property.id;

        // Store minimal property data to avoid localStorage quota issues
        // Only store first image URL, not entire images array
        const images = property.images || [];
        const firstImage = images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.url || images[0]?.src || '') : '';
        const imageCount = property.total_images || property.image_count || images.length || 0;

        wishlist[refNo] = {
            id: property.id,
            ref_no: refNo,
            title: property.title || property.name || 'Property',
            price: property.price || property.list_price || 0,
            location: property.location || property.location_id?.name || 'N/A',
            type: property.type || property.type_id?.name || 'N/A',
            beds: property.beds || property.bedrooms || 0,
            baths: property.baths || property.bathrooms || 0,
            built: property.built || property.build_size || property.built_area || 0,
            plot: property.plot || property.plot_size || 0,
            image: firstImage,
            image_count: imageCount,
            listing_type: property.listing_type || property.status || 'resale',
            is_featured: property.is_featured || false,
            addedAt: Date.now(),
            note: ''
        };

        if (save(wishlist)) {
            notifyChange('added', wishlist[refNo]);
            return true;
        }
        // Storage failed - show error to user
        console.error('[Wishlist] Storage quota exceeded. Consider clearing old items.');
        return false;
    }

    /**
     * Remove property from wishlist
     */
    function remove(refNo) {
        const wishlist = getAll();
        const property = wishlist[String(refNo)];

        if (property) {
            delete wishlist[String(refNo)];
            if (save(wishlist)) {
                notifyChange('removed', property);
                return true;
            }
        }
        return false;
    }

    /**
     * Toggle property in wishlist
     */
    function toggle(property) {
        const refNo = property.ref_no || property.ref || property.id;
        if (has(refNo)) {
            return { action: 'removed', success: remove(refNo) };
        } else {
            return { action: 'added', success: add(property) };
        }
    }

    /**
     * Get wishlist count
     */
    function count() {
        return Object.keys(getAll()).length;
    }

    /**
     * Get single property from wishlist
     */
    function get(refNo) {
        const wishlist = getAll();
        return wishlist[String(refNo)] || null;
    }

    /**
     * Update property note
     */
    function updateNote(refNo, note) {
        const wishlist = getAll();
        if (wishlist[String(refNo)]) {
            wishlist[String(refNo)].note = note;
            wishlist[String(refNo)].updatedAt = Date.now();
            if (save(wishlist)) {
                notifyChange('noteUpdated', wishlist[String(refNo)]);
                return true;
            }
        }
        return false;
    }

    /**
     * Clear entire wishlist
     */
    function clear() {
        localStorage.removeItem(STORAGE_KEY);
        notifyChange('cleared', null);
        return true;
    }

    /**
     * Get wishlist as array (sorted)
     */
    function getAsArray(sortBy = 'addedAt', sortOrder = 'desc') {
        const wishlist = getAll();
        const items = Object.values(wishlist);

        items.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // Handle null/undefined
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';

            // Handle string comparisons
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = (bVal || '').toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        return items;
    }

    /**
     * Get all ref numbers
     */
    function getRefNos() {
        return Object.keys(getAll());
    }

    /**
     * Generate shareable link (base64 encoded)
     */
    function generateShareLink() {
        const refNos = getRefNos();

        if (refNos.length === 0) {
            return null;
        }

        // Encode property references
        const encoded = btoa(refNos.join(','));
        return `${window.location.origin}${window.location.pathname}?shared=${encoded}`;
    }

    /**
     * Load shared wishlist from URL
     * Returns array of ref numbers or null
     */
    function loadSharedWishlist() {
        const urlParams = new URLSearchParams(window.location.search);
        const shared = urlParams.get('shared');

        if (shared) {
            try {
                const refNos = atob(shared).split(',').filter(r => r.trim());
                return refNos;
            } catch (error) {
                console.error('[Wishlist] Error decoding shared link:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Export wishlist as JSON
     */
    function exportAsJSON() {
        const wishlist = getAll();
        const dataStr = JSON.stringify(wishlist, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wishlist_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Notify wishlist changes (for UI updates)
     */
    function notifyChange(action, property) {
        const event = new CustomEvent(EVENTS.CHANGED, {
            detail: { action, property, count: count() }
        });
        window.dispatchEvent(event);

        // Also update RealtySoftState if available
        if (window.RealtySoftState) {
            RealtySoftState.set('wishlist', getRefNos());
        }
    }

    /**
     * Get compare selected set
     */
    function getCompareSelected() {
        return compareSelected;
    }

    /**
     * Set compare selected (replaces entire set)
     */
    function setCompareSelected(newSet) {
        compareSelected = new Set(newSet);
        notifyCompareChange();
    }

    /**
     * Add to compare selection
     * Returns true if added, false if at max
     */
    function addToCompare(refNo) {
        if (compareSelected.size >= maxCompare) {
            return false;
        }
        compareSelected.add(String(refNo));
        notifyCompareChange();
        return true;
    }

    /**
     * Remove from compare selection
     */
    function removeFromCompare(refNo) {
        compareSelected.delete(String(refNo));
        notifyCompareChange();
    }

    /**
     * Toggle compare selection
     * Returns { success: boolean, action: 'added'|'removed'|'max_reached' }
     */
    function toggleCompare(refNo) {
        const ref = String(refNo);
        if (compareSelected.has(ref)) {
            compareSelected.delete(ref);
            notifyCompareChange();
            return { success: true, action: 'removed' };
        } else if (compareSelected.size >= maxCompare) {
            return { success: false, action: 'max_reached' };
        } else {
            compareSelected.add(ref);
            notifyCompareChange();
            return { success: true, action: 'added' };
        }
    }

    /**
     * Check if in compare selection
     */
    function isInCompare(refNo) {
        return compareSelected.has(String(refNo));
    }

    /**
     * Clear compare selection
     */
    function clearCompare() {
        compareSelected.clear();
        notifyCompareChange();
    }

    /**
     * Get compare count
     */
    function getCompareCount() {
        return compareSelected.size;
    }

    /**
     * Get max compare limit
     */
    function getMaxCompare() {
        return maxCompare;
    }

    /**
     * Get properties selected for compare
     */
    function getCompareProperties() {
        return Array.from(compareSelected)
            .map(refNo => get(refNo))
            .filter(Boolean);
    }

    /**
     * Notify compare selection changes
     */
    function notifyCompareChange() {
        const event = new CustomEvent(EVENTS.COMPARE_CHANGED, {
            detail: {
                selected: Array.from(compareSelected),
                count: compareSelected.size,
                max: maxCompare
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Set current sort and notify
     */
    function setSort(field, order = 'desc') {
        currentSort.field = field;
        currentSort.order = order;

        const event = new CustomEvent(EVENTS.SORTED, {
            detail: { field, order }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get current sort settings
     */
    function getSort() {
        return { ...currentSort };
    }

    /**
     * Request to open a modal
     */
    function openModal(modalType, data = {}) {
        const event = new CustomEvent(EVENTS.MODAL_OPEN, {
            detail: { modalType, data }
        });
        window.dispatchEvent(event);
    }

    /**
     * Request to close a modal
     */
    function closeModal(modalType) {
        const event = new CustomEvent(EVENTS.MODAL_CLOSE, {
            detail: { modalType }
        });
        window.dispatchEvent(event);
    }

    /**
     * Check if viewing shared wishlist
     */
    function isSharedView() {
        return loadSharedWishlist() !== null;
    }

    /**
     * Get event names for external use
     */
    function getEvents() {
        return { ...EVENTS };
    }

    /**
     * Sync with RealtySoftState (migrate from old format if needed)
     */
    function syncWithState() {
        if (window.RealtySoftState) {
            const stateWishlist = RealtySoftState.get('wishlist') || [];
            const currentWishlist = getAll();

            // If state has IDs that aren't in our wishlist, we can't add them
            // (we don't have the property data). But we can make sure state reflects our data.
            RealtySoftState.set('wishlist', getRefNos());
        }
    }

    // Initialize - sync with state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncWithState);
    } else {
        syncWithState();
    }

    // Public API
    return {
        // Core wishlist operations
        getAll,
        has,
        add,
        remove,
        toggle,
        count,
        get,
        updateNote,
        clear,
        getAsArray,
        getRefNos,
        generateShareLink,
        loadSharedWishlist,
        exportAsJSON,
        notifyChange,

        // Compare functionality
        getCompareSelected,
        setCompareSelected,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        getCompareCount,
        getMaxCompare,
        getCompareProperties,

        // Sort functionality
        setSort,
        getSort,

        // Modal communication
        openModal,
        closeModal,

        // Shared view detection
        isSharedView,

        // Event constants
        getEvents,
        EVENTS
    };
})();

// Export globally
window.WishlistManager = WishlistManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishlistManager;
}
