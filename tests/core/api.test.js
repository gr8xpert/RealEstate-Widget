/**
 * Tests for RealtySoftAPI module
 * Tests: caching, request deduplication, property normalization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the TypeScript module directly
import { RealtySoftAPI } from '../../src/core/api';

describe('RealtySoftAPI', () => {
  let API;

  beforeEach(() => {
    API = RealtySoftAPI;
    API.init({
      proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      await API.getLocations();

      // Verify that fetch was called
      expect(globalThis.fetch).toHaveBeenCalled();

      // Check that the cache was written by looking at the localStorage item directly
      const cacheData = localStorage.getItem('rs_cache_locations');
      expect(cacheData).not.toBeNull();
    });

    it('should return cached data on subsequent calls', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Test Location' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      // First call - should hit API
      await API.getLocations();
      const fetchCount1 = globalThis.fetch.mock.calls.length;

      // Second call - should use cache (same instance, cache is internal)
      await API.getLocations();
      const fetchCount2 = globalThis.fetch.mock.calls.length;

      // Fetch should not have been called again (cached)
      expect(fetchCount2).toBe(fetchCount1);
    });
  });

  describe('request deduplication', () => {
    it('should deduplicate concurrent identical requests', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Type' }] }),
      };

      // Slow response to ensure requests overlap
      globalThis.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 50);
          })
      );

      // Make two concurrent requests
      const promise1 = API.getPropertyTypes();
      const promise2 = API.getPropertyTypes();

      await Promise.all([promise1, promise2]);

      // Only one actual fetch should have been made
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await API.getLocations();

      expect(result.data).toHaveLength(2);
      expect(globalThis.fetch).toHaveBeenCalled();
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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await API.getPropertyByRef('REF123', { forceRefresh: true });

      expect(result.data.ref).toBe('REF123');
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
        images: [{ image_256: 'thumb.jpg', image_768: 'full.jpg' }],
        features: [{ name: 'Pool', attr_id: { name: 'Outdoor' } }],
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [apiProperty] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await API.searchProperties({ page: 1 });

      // Thumbnail images (smaller sizes)
      expect(result.data[0].images).toContain('small1.jpg');
      expect(result.data[0].images).toContain('small2.jpg');

      // Full size images
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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await API.searchProperties({ page: 1 });

      expect(result.data[0].features).toEqual([
        { name: 'Pool', category: 'Outdoor' },
        { name: 'Garage', category: 'Parking' },
      ]);
    });
  });

  describe('error handling', () => {
    it('should throw on HTTP error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(API.getLocations()).rejects.toThrow('HTTP error');
    });

    it('should throw on API error response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
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
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      await API.prefetchProperty(999);

      expect(globalThis.fetch).toHaveBeenCalled();
      // Check localStorage for cached property directly
      const cacheData = localStorage.getItem('rs_cache_property_999');
      expect(cacheData).not.toBeNull();
    });

    it('should skip prefetch if already cached', async () => {
      // Set up cache directly
      localStorage.setItem(
        'rs_cache_property_999',
        JSON.stringify({
          data: { id: 999, title: 'Cached' },
          timestamp: Date.now(),
        })
      );

      globalThis.fetch = vi.fn();

      await API.prefetchProperty(999);

      // Should not have made a fetch
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear specific cache key', () => {
      localStorage.setItem('rs_cache_locations', 'test');

      API.clearCache('locations');

      expect(localStorage.getItem('rs_cache_locations')).toBeNull();
    });

    it('should have clearCache function available', () => {
      expect(typeof API.clearCache).toBe('function');
    });
  });

  describe('Configurable Cache TTL', () => {
    it('should use default TTL when no cache config is provided', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Location 1' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      await API.getLocations();

      // Data should be cached
      const cacheData = localStorage.getItem('rs_cache_locations');
      expect(cacheData).not.toBeNull();
      const parsed = JSON.parse(cacheData);
      expect(parsed.timestamp).toBeGreaterThan(0);
    });

    it('should respect custom TTL for locations', async () => {
      // Re-init with very short TTL (1ms)
      API.init({
        proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
        apiKey: 'test-api-key',
        language: 'en_US',
        cache: { locations: 1 }, // 1ms TTL
      });

      // Pre-seed cache with old timestamp
      localStorage.setItem(
        'rs_cache_locations',
        JSON.stringify({
          data: { data: [{ id: 99, name: 'Old Cached' }], count: 1 },
          timestamp: Date.now() - 10, // 10ms ago → expired with 1ms TTL
        })
      );

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Fresh Location' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await API.getLocations();

      // Should have made a fetch (cache was expired)
      expect(globalThis.fetch).toHaveBeenCalled();
      expect(result.data[0].name).toBe('Fresh Location');
    });

    it('should respect custom TTL for property types', async () => {
      API.init({
        proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
        apiKey: 'test-api-key',
        language: 'en_US',
        cache: { propertyTypes: 1 },
      });

      // Pre-seed expired cache
      localStorage.setItem(
        'rs_cache_propertyTypes_en_US',
        JSON.stringify({
          data: { data: [{ id: 1, name: 'Old Type' }] },
          timestamp: Date.now() - 10,
        })
      );

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Fresh Type' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await API.getPropertyTypes();

      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('should disable all caching when disabled flag is true', async () => {
      API.init({
        proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
        apiKey: 'test-api-key',
        language: 'en_US',
        cache: { disabled: true },
      });

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Location' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      // First call
      await API.getLocations();
      // Second call - should fetch again because cache is disabled
      await API.getLocations();

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not write to cache when disabled', async () => {
      API.init({
        proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
        apiKey: 'test-api-key',
        language: 'en_US',
        cache: { disabled: true },
      });

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Location' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      await API.getLocations();

      // Cache should not have been written
      expect(localStorage.getItem('rs_cache_locations')).toBeNull();
    });

    it('should use configurable TTL for property cache', async () => {
      API.init({
        proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
        apiKey: 'test-api-key',
        language: 'en_US',
        cache: { property: 1 }, // 1ms TTL
      });

      // Pre-seed expired property cache
      localStorage.setItem(
        'rs_cache_property_123',
        JSON.stringify({
          data: { id: 123, title: 'Old Property' },
          timestamp: Date.now() - 10,
        })
      );

      // getCachedProperty should return null for expired entry
      const cached = API.getCachedProperty(123);
      expect(cached).toBeNull();
    });
  });

  describe('L1/L2 Cache Layers', () => {
    it('should serve from L1 memory without parsing localStorage', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Location 1' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      // First call populates both L1 and L2
      await API.getLocations();
      const fetchCount1 = globalThis.fetch.mock.calls.length;

      // Clear localStorage but keep L1 (memory) intact
      // The cache should still work from L1
      localStorage.clear();

      // Second call should use L1 memory cache
      await API.getLocations();
      const fetchCount2 = globalThis.fetch.mock.calls.length;

      // Should not have fetched again (L1 served the result)
      expect(fetchCount2).toBe(fetchCount1);
    });

    it('should promote L2 hits to L1', async () => {
      // Re-init with fresh memory cache
      API.init({
        proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
        apiKey: 'test-api-key',
        language: 'en_US',
        cache: { maxCacheEntries: 50 },
      });

      // Seed L2 (localStorage) directly — L1 is empty after re-init
      localStorage.setItem(
        'rs_cache_locations',
        JSON.stringify({
          data: { data: [{ id: 1, name: 'L2 Location' }], count: 1 },
          timestamp: Date.now(),
        })
      );

      globalThis.fetch = vi.fn();

      // First call: L1 miss, L2 hit → promotes to L1
      const result = await API.getLocations();
      expect(result.data[0].name).toBe('L2 Location');
      expect(globalThis.fetch).not.toHaveBeenCalled();

      // Clear L2 to prove L1 now has it
      localStorage.clear();

      // Second call: L1 hit (promoted from previous L2 hit)
      const result2 = await API.getLocations();
      expect(result2.data[0].name).toBe('L2 Location');
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('should handle localStorage write failures gracefully', async () => {
      // Make localStorage.setItem throw
      const origSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'Location' }] }),
      };
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      // Should not throw even though localStorage fails
      const result = await API.getLocations();
      expect(result.data).toHaveLength(1);

      // Restore
      localStorage.setItem = origSetItem;
    });

    it('should respect maxCacheEntries configuration', () => {
      API.init({
        proxyUrl: 'https://smartpropertywidget.com/spw/php/api-proxy.php',
        apiKey: 'test-api-key',
        language: 'en_US',
        cache: { maxCacheEntries: 5 },
      });

      // Cache 5 properties to fill the memory cache
      for (let i = 1; i <= 5; i++) {
        API.cacheProperty({ id: i, title: `Property ${i}`, ref: `REF${i}` });
      }

      // All 5 should be cached
      expect(API.getCachedProperty(5)).not.toBeNull();

      // Note: LRU eviction is tested in detail in lru-cache.test.js
      // This test verifies the integration with maxCacheEntries config
    });
  });
});
