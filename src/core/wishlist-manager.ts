/**
 * RealtySoft Widget v3 - Wishlist Manager
 * Handles wishlist storage, sorting, sharing, and notes
 * Stores full property data in localStorage for offline access
 * Provides shared state for modular wishlist components
 */

import type { RealtySoftStateModule } from '../types/index';

// Declare global state module
declare const RealtySoftState: RealtySoftStateModule | undefined;

// Wishlist item interface
interface WishlistItem {
  id: number;
  ref_no: string;
  title: string;
  price: number;
  location: string;
  type: string;
  beds: number;
  baths: number;
  built: number;
  plot: number;
  image: string;
  image_count: number;
  listing_type: string;
  is_featured: boolean;
  addedAt: number;
  updatedAt?: number;
  note: string;
}

// Wishlist storage type (keyed by ref_no)
type WishlistStorage = Record<string, WishlistItem>;

// Property input for add operation
interface PropertyInput {
  id: number;
  ref_no?: string;
  ref?: string;
  title?: string;
  name?: string;
  price?: number;
  list_price?: number;
  location?: string;
  location_id?: { name?: string };
  type?: string;
  type_id?: { name?: string };
  beds?: number;
  bedrooms?: number;
  baths?: number;
  bathrooms?: number;
  built?: number;
  build_size?: number;
  built_area?: number;
  plot?: number;
  plot_size?: number;
  images?: Array<string | { url?: string; src?: string }>;
  total_images?: number;
  image_count?: number;
  listing_type?: string;
  status?: string;
  is_featured?: boolean;
}

// Sort settings
interface SortSettings {
  field: string;
  order: 'asc' | 'desc';
}

// Toggle result
interface ToggleResult {
  action: 'added' | 'removed';
  success: boolean;
}

// Compare toggle result
interface CompareToggleResult {
  success: boolean;
  action: 'added' | 'removed' | 'max_reached';
}

// Event names
interface WishlistEvents {
  CHANGED: string;
  SORTED: string;
  COMPARE_CHANGED: string;
  MODAL_OPEN: string;
  MODAL_CLOSE: string;
}

// Wishlist Manager module interface
interface WishlistManagerModule {
  // Core wishlist operations
  getAll: () => WishlistStorage;
  has: (refNo: string | number) => boolean;
  add: (property: PropertyInput) => boolean;
  remove: (refNo: string | number) => boolean;
  toggle: (property: PropertyInput) => ToggleResult;
  count: () => number;
  get: (refNo: string | number) => WishlistItem | null;
  updateNote: (refNo: string | number, note: string) => boolean;
  clear: () => boolean;
  getAsArray: (sortBy?: string, sortOrder?: 'asc' | 'desc') => WishlistItem[];
  getRefNos: () => string[];
  generateShareLink: () => string | null;
  loadSharedWishlist: () => string[] | null;
  exportAsJSON: () => void;
  notifyChange: (action: string, property: WishlistItem | null) => void;

  // Compare functionality
  getCompareSelected: () => Set<string>;
  setCompareSelected: (newSet: Set<string> | string[]) => void;
  addToCompare: (refNo: string | number) => boolean;
  removeFromCompare: (refNo: string | number) => void;
  toggleCompare: (refNo: string | number) => CompareToggleResult;
  isInCompare: (refNo: string | number) => boolean;
  clearCompare: () => void;
  getCompareCount: () => number;
  getMaxCompare: () => number;
  getCompareProperties: () => WishlistItem[];

  // Sort functionality
  setSort: (field: string, order?: 'asc' | 'desc') => void;
  getSort: () => SortSettings;

  // Modal communication
  openModal: (modalType: string, data?: Record<string, unknown>) => void;
  closeModal: (modalType: string) => void;

  // Shared view detection
  isSharedView: () => boolean;

  // Event constants
  getEvents: () => WishlistEvents;
  EVENTS: WishlistEvents;
}

const WishlistManager: WishlistManagerModule = (function () {
  'use strict';

  const STORAGE_KEY = 'realtysoft_wishlist';

  // Event names for component communication
  const EVENTS: WishlistEvents = {
    CHANGED: 'wishlistChanged',
    SORTED: 'wishlistSorted',
    COMPARE_CHANGED: 'wishlistCompareChanged',
    MODAL_OPEN: 'wishlistModalOpen',
    MODAL_CLOSE: 'wishlistModalClose',
  };

  // Shared state for compare selections (not persisted)
  let compareSelected = new Set<string>();
  const maxCompare = 3;

  // Current sort settings
  const currentSort: SortSettings = {
    field: 'addedAt',
    order: 'desc',
  };

  /**
   * Get all wishlist items as object
   */
  function getAll(): WishlistStorage {
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
  function save(wishlist: WishlistStorage): boolean {
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
  function has(refNo: string | number): boolean {
    const wishlist = getAll();
    return Object.prototype.hasOwnProperty.call(wishlist, String(refNo));
  }

  /**
   * Add property to wishlist
   */
  function add(property: PropertyInput): boolean {
    const wishlist = getAll();
    const refNo = property.ref_no || property.ref || String(property.id);

    // Store minimal property data to avoid localStorage quota issues
    const images = property.images || [];
    let firstImage = '';
    if (images.length > 0) {
      const img = images[0];
      firstImage =
        typeof img === 'string' ? img : (img as { url?: string; src?: string })?.url || (img as { url?: string; src?: string })?.src || '';
    }
    const imageCount =
      property.total_images || property.image_count || images.length || 0;

    const item: WishlistItem = {
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
      note: '',
    };

    wishlist[refNo] = item;

    if (save(wishlist)) {
      notifyChange('added', wishlist[refNo]);
      return true;
    }
    console.error(
      '[Wishlist] Storage quota exceeded. Consider clearing old items.'
    );
    return false;
  }

  /**
   * Remove property from wishlist
   */
  function remove(refNo: string | number): boolean {
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
  function toggle(property: PropertyInput): ToggleResult {
    const refNo = property.ref_no || property.ref || String(property.id);
    if (has(refNo)) {
      return { action: 'removed', success: remove(refNo) };
    } else {
      return { action: 'added', success: add(property) };
    }
  }

  /**
   * Get wishlist count
   */
  function count(): number {
    return Object.keys(getAll()).length;
  }

  /**
   * Get single property from wishlist
   */
  function get(refNo: string | number): WishlistItem | null {
    const wishlist = getAll();
    return wishlist[String(refNo)] || null;
  }

  /**
   * Update property note
   */
  function updateNote(refNo: string | number, note: string): boolean {
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
  function clear(): boolean {
    localStorage.removeItem(STORAGE_KEY);
    notifyChange('cleared', null);
    return true;
  }

  /**
   * Get wishlist as array (sorted)
   */
  function getAsArray(
    sortBy: string = 'addedAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): WishlistItem[] {
    const wishlist = getAll();
    const items = Object.values(wishlist);

    items.sort((a, b) => {
      // Get values using type-safe key access
      const aItem = a as unknown as Record<string, unknown>;
      const bItem = b as unknown as Record<string, unknown>;
      let aVal = aItem[sortBy];
      let bVal = bItem[sortBy];

      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Convert to comparable values
      let aCompare: string | number;
      let bCompare: string | number;

      if (typeof aVal === 'string') {
        aCompare = aVal.toLowerCase();
        bCompare = String(bVal || '').toLowerCase();
      } else if (typeof aVal === 'number') {
        aCompare = aVal;
        bCompare = typeof bVal === 'number' ? bVal : 0;
      } else {
        aCompare = String(aVal);
        bCompare = String(bVal);
      }

      if (sortOrder === 'asc') {
        return aCompare > bCompare ? 1 : aCompare < bCompare ? -1 : 0;
      } else {
        return aCompare < bCompare ? 1 : aCompare > bCompare ? -1 : 0;
      }
    });

    return items;
  }

  /**
   * Get all ref numbers
   */
  function getRefNos(): string[] {
    return Object.keys(getAll());
  }

  /**
   * Generate shareable link (base64 encoded)
   */
  function generateShareLink(): string | null {
    const refNos = getRefNos();

    if (refNos.length === 0) {
      return null;
    }

    const encoded = btoa(refNos.join(','));
    return `${window.location.origin}${window.location.pathname}?shared=${encoded}`;
  }

  /**
   * Load shared wishlist from URL
   */
  function loadSharedWishlist(): string[] | null {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');

    if (shared) {
      try {
        const refNos = atob(shared)
          .split(',')
          .filter((r) => r.trim());
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
  function exportAsJSON(): void {
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
  function notifyChange(action: string, property: WishlistItem | null): void {
    try {
      const event = new CustomEvent(EVENTS.CHANGED, {
        detail: { action, property, count: count() },
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('[Wishlist] Event dispatch error:', e);
    }

    // Also update RealtySoftState if available
    try {
      if (typeof RealtySoftState !== 'undefined' && RealtySoftState) {
        RealtySoftState.set('wishlist', getRefNos());
      }
    } catch (e) {
      console.warn('[Wishlist] State sync error:', e);
    }
  }

  /**
   * Get compare selected set
   */
  function getCompareSelected(): Set<string> {
    return compareSelected;
  }

  /**
   * Set compare selected (replaces entire set)
   */
  function setCompareSelected(newSet: Set<string> | string[]): void {
    compareSelected = new Set(newSet);
    notifyCompareChange();
  }

  /**
   * Add to compare selection
   */
  function addToCompare(refNo: string | number): boolean {
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
  function removeFromCompare(refNo: string | number): void {
    compareSelected.delete(String(refNo));
    notifyCompareChange();
  }

  /**
   * Toggle compare selection
   */
  function toggleCompare(refNo: string | number): CompareToggleResult {
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
  function isInCompare(refNo: string | number): boolean {
    return compareSelected.has(String(refNo));
  }

  /**
   * Clear compare selection
   */
  function clearCompare(): void {
    compareSelected.clear();
    notifyCompareChange();
  }

  /**
   * Get compare count
   */
  function getCompareCount(): number {
    return compareSelected.size;
  }

  /**
   * Get max compare limit
   */
  function getMaxCompare(): number {
    return maxCompare;
  }

  /**
   * Get properties selected for compare
   */
  function getCompareProperties(): WishlistItem[] {
    return Array.from(compareSelected)
      .map((refNo) => get(refNo))
      .filter((item): item is WishlistItem => item !== null);
  }

  /**
   * Notify compare selection changes
   */
  function notifyCompareChange(): void {
    const event = new CustomEvent(EVENTS.COMPARE_CHANGED, {
      detail: {
        selected: Array.from(compareSelected),
        count: compareSelected.size,
        max: maxCompare,
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Set current sort and notify
   */
  function setSort(field: string, order: 'asc' | 'desc' = 'desc'): void {
    currentSort.field = field;
    currentSort.order = order;

    const event = new CustomEvent(EVENTS.SORTED, {
      detail: { field, order },
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current sort settings
   */
  function getSort(): SortSettings {
    return { ...currentSort };
  }

  /**
   * Request to open a modal
   */
  function openModal(
    modalType: string,
    data: Record<string, unknown> = {}
  ): void {
    const event = new CustomEvent(EVENTS.MODAL_OPEN, {
      detail: { modalType, data },
    });
    window.dispatchEvent(event);
  }

  /**
   * Request to close a modal
   */
  function closeModal(modalType: string): void {
    const event = new CustomEvent(EVENTS.MODAL_CLOSE, {
      detail: { modalType },
    });
    window.dispatchEvent(event);
  }

  /**
   * Check if viewing shared wishlist
   */
  function isSharedView(): boolean {
    return loadSharedWishlist() !== null;
  }

  /**
   * Get event names for external use
   */
  function getEvents(): WishlistEvents {
    return { ...EVENTS };
  }

  /**
   * Sync with RealtySoftState (migrate from old format if needed)
   */
  function syncWithState(): void {
    if (typeof RealtySoftState !== 'undefined' && RealtySoftState) {
      RealtySoftState.set('wishlist', getRefNos());
    }
  }

  // Initialize - sync with state
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', syncWithState);
    } else {
      syncWithState();
    }
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
    EVENTS,
  };
})();

// Export globally
if (typeof window !== 'undefined') {
  (window as unknown as { WishlistManager: WishlistManagerModule }).WishlistManager =
    WishlistManager;
}

// Export for ES modules
export { WishlistManager };
export type { WishlistManagerModule, WishlistItem, WishlistEvents, SortSettings, PropertyInput };
export default WishlistManager;
