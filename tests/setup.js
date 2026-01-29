/**
 * Vitest Setup File
 * Runs before each test file
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
globalThis.fetch = vi.fn();

// Set up global module stubs that component files expect at import time
// Components call RealtySoft.registerComponent() at module level
if (!globalThis.RealtySoft) {
  globalThis.RealtySoft = {
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
if (!globalThis.RealtySoftAPI) {
  globalThis.RealtySoftAPI = {
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
if (!globalThis.RealtySoftAnalytics) {
  globalThis.RealtySoftAnalytics = {
    track: vi.fn(),
    trackSearch: vi.fn(),
    trackDetail: vi.fn(),
    trackWishlist: vi.fn(),
    trackInquiry: vi.fn(),
    trackShare: vi.fn(),
    trackLanguageChange: vi.fn(),
  };
}
if (!globalThis.RealtySoftToast) {
  globalThis.RealtySoftToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
}
if (!globalThis.RealtySoftWishlistManager) {
  globalThis.RealtySoftWishlistManager = {
    has: vi.fn(() => false),
    add: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn(),
    count: vi.fn(() => 0),
    getAll: vi.fn(() => []),
    clear: vi.fn(),
    share: vi.fn(),
    addNote: vi.fn(),
    removeNote: vi.fn(),
    getNote: vi.fn(),
  };
}

// Mock console methods to reduce noise
vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'warn').mockImplementation(() => {});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  // Re-stub global mocks that may have been replaced by individual tests
  if (globalThis.RealtySoft) {
    globalThis.RealtySoft.registerComponent = vi.fn();
  }
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
