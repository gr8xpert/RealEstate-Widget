/**
 * Shared test utilities for component testing
 * Provides reusable mock factories and helpers
 */

import { vi } from 'vitest';

/**
 * Create a mock RealtySoft controller
 */
export function createMockRealtySoft() {
  return {
    setFilter: vi.fn(),
    search: vi.fn(),
    reset: vi.fn(),
    registerComponent: vi.fn(),
    setLanguage: vi.fn(),
    showDetail: vi.fn(),
    goBack: vi.fn(),
    goToPage: vi.fn(),
  };
}

/**
 * Create a mock RealtySoft API
 */
export function createMockAPI() {
  return {
    searchProperties: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    getProperty: vi.fn().mockResolvedValue({ data: null }),
    getLocations: vi.fn().mockResolvedValue({ data: [] }),
    getPropertyTypes: vi.fn().mockResolvedValue({ data: [] }),
    getFeatures: vi.fn().mockResolvedValue({ data: [] }),
    getLabels: vi.fn().mockResolvedValue({ data: {} }),
    prefetchProperty: vi.fn(),
    submitInquiry: vi.fn().mockResolvedValue({ success: true }),
    clearCache: vi.fn(),
  };
}

/**
 * Create a mock Analytics module
 */
export function createMockAnalytics() {
  return {
    track: vi.fn(),
    trackSearch: vi.fn(),
    trackDetail: vi.fn(),
    trackWishlist: vi.fn(),
    trackInquiry: vi.fn(),
    trackShare: vi.fn(),
    trackLanguageChange: vi.fn(),
  };
}

/**
 * Create a mock Toast notification module
 */
export function createMockToast() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
}

/**
 * Create a mock WishlistManager
 */
export function createMockWishlistManager() {
  const items = new Set();
  return {
    has: vi.fn((id) => items.has(id)),
    add: vi.fn((id) => items.add(id)),
    remove: vi.fn((id) => items.delete(id)),
    toggle: vi.fn(),
    count: vi.fn(() => items.size),
    getAll: vi.fn(() => Array.from(items)),
    clear: vi.fn(() => items.clear()),
    share: vi.fn(),
    addNote: vi.fn(),
    removeNote: vi.fn(),
    getNote: vi.fn(),
  };
}

/**
 * Setup global mocks for component testing.
 * Returns a cleanup function.
 */
export function setupComponentTest(overrides = {}) {
  const mockRealtySoft = createMockRealtySoft();
  const mockAPI = createMockAPI();
  const mockAnalytics = createMockAnalytics();
  const mockToast = createMockToast();
  const mockWishlistManager = createMockWishlistManager();

  globalThis.RealtySoft = overrides.RealtySoft || mockRealtySoft;
  globalThis.RealtySoftAPI = overrides.RealtySoftAPI || mockAPI;
  globalThis.RealtySoftAnalytics = overrides.RealtySoftAnalytics || mockAnalytics;
  globalThis.RealtySoftToast = overrides.RealtySoftToast || mockToast;
  globalThis.RealtySoftWishlistManager = overrides.RealtySoftWishlistManager || mockWishlistManager;

  // Return mocks and cleanup
  return {
    mockRealtySoft: globalThis.RealtySoft,
    mockAPI: globalThis.RealtySoftAPI,
    mockAnalytics: globalThis.RealtySoftAnalytics,
    mockToast: globalThis.RealtySoftToast,
    mockWishlistManager: globalThis.RealtySoftWishlistManager,
    cleanup() {
      delete globalThis.RealtySoft;
      delete globalThis.RealtySoftAPI;
      delete globalThis.RealtySoftAnalytics;
      delete globalThis.RealtySoftToast;
      delete globalThis.RealtySoftWishlistManager;
    },
  };
}

/**
 * Create a DOM element for testing
 */
export function createTestElement(tag = 'div', attrs = {}) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'dataset') {
      for (const [dataKey, dataVal] of Object.entries(value)) {
        el.dataset[dataKey] = dataVal;
      }
    } else if (key === 'className') {
      el.className = value;
    } else {
      el.setAttribute(key, value);
    }
  }
  document.body.appendChild(el);
  return el;
}

/**
 * Remove a test element from the DOM
 */
export function removeTestElement(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/**
 * Create a sample property object for testing
 */
export function createMockProperty(overrides = {}) {
  return {
    id: 1,
    title: 'Beautiful Villa',
    ref: 'REF001',
    price: 350000,
    currency: 'EUR',
    listingType: 'resale',
    propertyType: 'Villa',
    bedrooms: 3,
    bathrooms: 2,
    builtArea: 150,
    plotSize: 500,
    location: 'Marbella',
    locationId: 1,
    description: 'A beautiful villa with sea views',
    features: ['Pool', 'Garden', 'Garage'],
    images: [
      { url: 'https://example.com/img1.jpg', thumb: 'https://example.com/img1_thumb.jpg' },
      { url: 'https://example.com/img2.jpg', thumb: 'https://example.com/img2_thumb.jpg' },
    ],
    agent: { name: 'John Agent', email: 'john@example.com', phone: '+34600000000' },
    latitude: 36.5,
    longitude: -4.9,
    yearBuilt: 2020,
    floor: '2',
    orientation: 'South',
    condition: 'Excellent',
    furnished: 'Fully',
    views: 'Sea',
    parking: '2 spaces',
    energyRating: 'B',
    co2Rating: 'C',
    communityFees: 200,
    ibiTax: 800,
    basuraTax: 150,
    videoUrl: '',
    virtualTourUrl: '',
    pdfUrl: '',
    featured: false,
    own: true,
    status: 'For Sale',
    ...overrides,
  };
}

/**
 * Create mock location data for testing
 */
export function createMockLocations() {
  return [
    { id: 1, name: 'Marbella', parent_id: null, type: 'municipality', count: 100 },
    { id: 2, name: 'Golden Mile', parent_id: 1, type: 'city', count: 30 },
    { id: 3, name: 'Puerto Banus', parent_id: 1, type: 'city', count: 25 },
    { id: 4, name: 'Estepona', parent_id: null, type: 'municipality', count: 80 },
    { id: 5, name: 'Estepona Centro', parent_id: 4, type: 'city', count: 40 },
  ];
}

/**
 * Create mock property types for testing
 */
export function createMockPropertyTypes() {
  return [
    { id: 1, name: 'Villa', parent_id: null },
    { id: 2, name: 'Apartment', parent_id: null },
    { id: 3, name: 'Penthouse', parent_id: 2 },
    { id: 4, name: 'Ground Floor', parent_id: 2 },
    { id: 5, name: 'Townhouse', parent_id: null },
  ];
}

/**
 * Create mock features for testing
 */
export function createMockFeatures() {
  return [
    {
      id: 1,
      name: 'Outdoor',
      value_ids: [
        { id: 101, name: 'Swimming Pool' },
        { id: 102, name: 'Garden' },
        { id: 103, name: 'Terrace' },
      ],
    },
    {
      id: 2,
      name: 'Indoor',
      value_ids: [
        { id: 201, name: 'Air Conditioning' },
        { id: 202, name: 'Central Heating' },
      ],
    },
  ];
}

/**
 * Simulate a DOM event
 */
export function fireEvent(element, eventType, eventInit = {}) {
  const event = new Event(eventType, { bubbles: true, cancelable: true, ...eventInit });
  element.dispatchEvent(event);
  return event;
}

/**
 * Simulate a keyboard event
 */
export function fireKeyEvent(element, eventType, key, eventInit = {}) {
  const event = new KeyboardEvent(eventType, {
    key,
    bubbles: true,
    cancelable: true,
    ...eventInit,
  });
  element.dispatchEvent(event);
  return event;
}

/**
 * Wait for async operations (e.g., debounced callbacks)
 */
export function waitFor(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
