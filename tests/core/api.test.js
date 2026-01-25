/**
 * Tests for RealtySoftAPI module
 * Tests: caching, request deduplication, property normalization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the API module
const apiCode = fs.readFileSync(
  path.resolve(__dirname, '../../src/core/api.js'),
  'utf-8'
);

// Create a fresh instance for each test
function createAPI() {
  const moduleCode = apiCode.replace(
    /if \(typeof module !== 'undefined'[\s\S]*$/,
    ''
  );

  const fn = new Function(
    'localStorage',
    'fetch',
    'URL',
    'console',
    'window',
    `${moduleCode}; return RealtySoftAPI;`
  );

  return fn(
    globalThis.localStorage,
    globalThis.fetch,
    URL,
    console,
    { location: { origin: 'https://example.com' } }
  );
}

describe('RealtySoftAPI', () => {
  let API;

  beforeEach(() => {
    API = createAPI();
    API.init({
      proxyUrl: 'https://realtysoft.ai/realtysoft/php/api-proxy.php',
      apiKey: 'test-api-key',
      language: 'en_US',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('init', () => {
    it('should initialize with provided options', () => {
      // API.init was called in beforeEach
      // This test verifies it doesn't throw
      expect(API).toBeDefined();
    });
  });

  describe('CacheManager', () => {
    it('should cache data to localStorage', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Test Location' }] }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      await API.getLocations();

      expect(localStorage.setItem).toHaveBeenCalled();
      const calls = localStorage.setItem.mock.calls;
      const cacheCall = calls.find((c) => c[0].includes('rs_cache_locations'));
      expect(cacheCall).toBeDefined();
    });

    it('should return cached data on subsequent calls', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Test Location' }] }),
      };
      globalThis.fetch.mockResolvedValue(mockResponse);

      // First call - should hit API
      await API.getLocations();
      const fetchCount1 = globalThis.fetch.mock.calls.length;

      // Mock localStorage.getItem to return cached data
      const cachedData = JSON.stringify({
        data: { data: [{ id: 1, name: 'Cached Location' }], count: 1 },
        timestamp: Date.now(),
      });
      localStorage.getItem.mockImplementation((key) => {
        if (key.includes('locations')) return cachedData;
        return null;
      });

      // Second call - should use cache
      const result = await API.getLocations();
      const fetchCount2 = globalThis.fetch.mock.calls.length;

      // Fetch should not have been called again
      expect(fetchCount2).toBe(fetchCount1);
    });

    it('should expire cache after TTL', async () => {
      // Set up expired cache
      const expiredData = JSON.stringify({
        data: { data: [{ id: 1 }] },
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      });
      localStorage.getItem.mockReturnValue(expiredData);

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 2, name: 'Fresh Data' }] }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      await API.getLocations();

      // Should have fetched fresh data
      expect(globalThis.fetch).toHaveBeenCalled();
    });
  });

  describe('request deduplication', () => {
    it('should deduplicate concurrent identical requests', async () => {
      let resolveCount = 0;
      const mockResponse = {
        ok: true,
        json: () => {
          resolveCount++;
          return Promise.resolve({ data: [{ id: 1 }] });
        },
      };

      // Slow response to ensure requests overlap
      globalThis.fetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 100);
          })
      );

      // Make two concurrent requests
      const promise1 = API.getPropertyTypes();
      const promise2 = API.getPropertyTypes();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Only one actual fetch should have been made
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('normalizeProperty', () => {
    it('should normalize property data from API format', async () => {
      const apiProperty = {
        id: 123,
        title: 'Beautiful Villa',
        ref_no: 'REF001',
        list_price: 500000,
        bedrooms: 4,
        bathrooms: 3,
        build_size: 250,
        plot_size: 1000,
        location_id: { name: 'Marbella' },
        type_id: { name: 'Villa' },
        images: [
          { image_256: 'thumb.jpg', image_768: 'full.jpg' },
        ],
        features: [{ name: 'Pool', attr_id: { name: 'Outdoor' } }],
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [apiProperty] }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.searchProperties({ page: 1 });

      expect(result.data[0]).toMatchObject({
        id: 123,
        title: 'Beautiful Villa',
        ref: 'REF001',
        price: 500000,
        beds: 4,
        baths: 3,
        built_area: 250,
        plot_size: 1000,
        location: 'Marbella',
        type: 'Villa',
      });
    });

    it('should handle missing fields gracefully', async () => {
      const apiProperty = {
        id: 456,
        // Minimal data
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [apiProperty] }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.searchProperties({ page: 1 });

      expect(result.data[0].id).toBe(456);
      expect(result.data[0].beds).toBe(0);
      expect(result.data[0].baths).toBe(0);
      expect(result.data[0].price).toBe(0);
    });

    it('should normalize images array', async () => {
      const apiProperty = {
        id: 789,
        images: [
          { image_256: 'small1.jpg', image_512: 'med1.jpg', image_768: 'large1.jpg' },
          { image_256: 'small2.jpg', image_512: 'med2.jpg', image_768: 'large2.jpg' },
        ],
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [apiProperty] }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.searchProperties({ page: 1 });

      // Thumbnail images (smaller sizes)
      expect(result.data[0].images).toContain('small1.jpg');
      expect(result.data[0].images).toContain('small2.jpg');

      // Full size images (larger sizes)
      expect(result.data[0].imagesFull.length).toBe(2);
    });

    it('should normalize features with categories', async () => {
      const apiProperty = {
        id: 101,
        features: [
          { name: 'Pool', attr_id: { name: 'Outdoor' } },
          { name: 'Garage', attr_id: { name: 'Parking' } },
        ],
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [apiProperty] }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.searchProperties({ page: 1 });

      expect(result.data[0].features).toEqual([
        { name: 'Pool', category: 'Outdoor' },
        { name: 'Garage', category: 'Parking' },
      ]);
    });
  });

  describe('API methods', () => {
    it('getLocations should fetch all locations', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Location 1' },
              { id: 2, name: 'Location 2' },
            ],
            count: 2,
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.getLocations();

      expect(result.data).toHaveLength(2);
      // URL encodes the endpoint
      expect(globalThis.fetch).toHaveBeenCalled();
      const fetchCall = globalThis.fetch.mock.calls[0][0];
      expect(fetchCall).toContain('_endpoint=v1%2Flocation');
    });

    it('getPropertyTypes should fetch property types', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Villa' },
              { id: 2, name: 'Apartment' },
            ],
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.getPropertyTypes();

      expect(result.data).toHaveLength(2);
    });

    it('getFeatures should fetch property features', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Pool' },
              { id: 2, name: 'Garden' },
            ],
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.getFeatures();

      expect(result.data).toHaveLength(2);
    });

    it('getLabels should fetch labels', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            search_button: 'Search',
            results_count: '{count} properties',
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.getLabels();

      expect(result.search_button).toBe('Search');
    });

    it('searchProperties should search with params', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1, title: 'Test Property' }],
            total: 1,
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.searchProperties({
        location_id: 100,
        bedrooms_min: 2,
        page: 1,
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('location_id=100'),
        expect.any(Object)
      );
    });

    it('getProperty should fetch single property by ID', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 123, title: 'Specific Property' }],
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.getProperty(123, { forceRefresh: true });

      expect(result.data.id).toBe(123);
    });

    it('getPropertyByRef should fetch property by reference', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 456, ref_no: 'REF123', title: 'Ref Property' }],
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      const result = await API.getPropertyByRef('REF123', { forceRefresh: true });

      expect(result.data.ref).toBe('REF123');
    });
  });

  describe('error handling', () => {
    it('should throw on HTTP error', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(API.getLocations()).rejects.toThrow('HTTP error');
    });

    it('should throw on API error response', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ error: 'Invalid API key' }),
      });

      await expect(API.getLocations()).rejects.toThrow('Invalid API key');
    });
  });

  describe('prefetch', () => {
    it('should prefetch and cache property', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 999, title: 'Prefetched Property' }],
          }),
      };
      globalThis.fetch.mockResolvedValueOnce(mockResponse);

      await API.prefetchProperty(999);

      expect(globalThis.fetch).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('property_999'),
        expect.any(String)
      );
    });

    it('should skip prefetch if already cached', async () => {
      // Set up cache
      const cachedData = JSON.stringify({
        data: { id: 999 },
        timestamp: Date.now(),
      });
      localStorage.getItem.mockImplementation((key) => {
        if (key.includes('property_999')) return cachedData;
        return null;
      });

      await API.prefetchProperty(999);

      // Should not have made a fetch
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear specific cache key', () => {
      API.clearCache('locations');

      expect(localStorage.removeItem).toHaveBeenCalledWith('rs_cache_locations');
    });

    it('should have clearCache function available', () => {
      expect(typeof API.clearCache).toBe('function');
    });
  });
});
