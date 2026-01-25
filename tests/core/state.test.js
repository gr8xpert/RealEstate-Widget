/**
 * Tests for RealtySoftState module
 * Tests: pub/sub, get/set, subscriptions, filters, wishlist
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the state module (IIFE pattern)
const stateCode = fs.readFileSync(
  path.resolve(__dirname, '../../src/core/state.js'),
  'utf-8'
);

// Create a fresh instance for each test
function createState() {
  // Execute the module code in a new context
  const moduleCode = stateCode.replace(
    /if \(typeof module !== 'undefined'[\s\S]*$/,
    ''
  );
  const fn = new Function('localStorage', `${moduleCode}; return RealtySoftState;`);
  return fn(globalThis.localStorage);
}

describe('RealtySoftState', () => {
  let State;

  beforeEach(() => {
    State = createState();
  });

  describe('get/set', () => {
    it('should get a value at a simple path', () => {
      State.set('filters.location', 123);
      expect(State.get('filters.location')).toBe(123);
    });

    it('should get a value at a nested path', () => {
      State.set('config.apiKey', 'test-key');
      expect(State.get('config.apiKey')).toBe('test-key');
    });

    it('should return undefined for non-existent paths', () => {
      expect(State.get('nonexistent.path')).toBeUndefined();
    });

    it('should return deep clones to prevent mutations', () => {
      State.set('filters.features', ['pool', 'garden']);
      const features = State.get('filters.features');
      features.push('gym');
      expect(State.get('filters.features')).toEqual(['pool', 'garden']);
    });

    it('should create nested objects if they do not exist', () => {
      State.set('new.nested.path', 'value');
      expect(State.get('new.nested.path')).toBe('value');
    });
  });

  describe('setMultiple', () => {
    it('should set multiple values at once', () => {
      State.setMultiple({
        'filters.location': 100,
        'filters.priceMin': 200000,
        'ui.view': 'list',
      });
      expect(State.get('filters.location')).toBe(100);
      expect(State.get('filters.priceMin')).toBe(200000);
      expect(State.get('ui.view')).toBe('list');
    });
  });

  describe('subscribe', () => {
    it('should call subscriber when value changes', () => {
      const callback = vi.fn();
      State.subscribe('filters.location', callback);
      State.set('filters.location', 456);
      expect(callback).toHaveBeenCalledWith(456, null, 'filters.location');
    });

    it('should call subscriber with old value', () => {
      const callback = vi.fn();
      State.set('filters.priceMin', 100000);
      State.subscribe('filters.priceMin', callback);
      State.set('filters.priceMin', 200000);
      expect(callback).toHaveBeenCalledWith(200000, 100000, 'filters.priceMin');
    });

    it('should support wildcard subscriptions', () => {
      const callback = vi.fn();
      State.subscribe('*', callback);
      State.set('filters.location', 789);
      expect(callback).toHaveBeenCalled();
    });

    it('should notify parent path subscribers', () => {
      const callback = vi.fn();
      State.subscribe('filters', callback);
      State.set('filters.location', 111);
      expect(callback).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = State.subscribe('filters.location', callback);
      State.set('filters.location', 1);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      State.set('filters.location', 2);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getState', () => {
    it('should return a complete immutable copy of state', () => {
      const state = State.getState();
      expect(state).toHaveProperty('filters');
      expect(state).toHaveProperty('results');
      expect(state).toHaveProperty('ui');
      expect(state).toHaveProperty('config');
    });

    it('should return a deep clone', () => {
      const state = State.getState();
      state.filters.location = 'mutated';
      expect(State.get('filters.location')).toBeNull();
    });
  });

  describe('resetFilters', () => {
    it('should reset filters to defaults', () => {
      State.set('filters.location', 123);
      State.set('filters.priceMin', 500000);
      State.set('filters.features', ['pool']);

      State.resetFilters();

      expect(State.get('filters.location')).toBeNull();
      expect(State.get('filters.priceMin')).toBeNull();
      expect(State.get('filters.features')).toEqual([]);
    });

    it('should preserve locked filters', () => {
      State.setLockedFilters({ location: 999 });
      State.set('filters.priceMin', 500000);

      State.resetFilters();

      expect(State.get('filters.location')).toBe(999);
      expect(State.get('filters.priceMin')).toBeNull();
    });

    it('should reset results page to 1', () => {
      State.set('results.page', 5);
      State.resetFilters();
      expect(State.get('results.page')).toBe(1);
    });
  });

  describe('lockedFilters', () => {
    it('should set locked filters', () => {
      State.setLockedFilters({ listingType: 'sale' });
      expect(State.get('filters.listingType')).toBe('sale');
    });

    it('should check if filter is locked', () => {
      State.setLockedFilters({ location: 123 });
      expect(State.isFilterLocked('location')).toBe(true);
      expect(State.isFilterLocked('priceMin')).toBe(false);
    });
  });

  describe('getSearchParams', () => {
    it('should build search params from filters', () => {
      State.set('filters.location', 100);
      State.set('filters.listingType', 'sale');
      State.set('filters.bedsMin', 2);
      State.set('filters.priceMin', 200000);
      State.set('filters.priceMax', 500000);

      const params = State.getSearchParams();

      expect(params.location_id).toBe(100);
      expect(params.listing_type).toBe('sale');
      expect(params.bedrooms_min).toBe(2);
      expect(params.list_price_min).toBe(200000);
      expect(params.list_price_max).toBe(500000);
    });

    it('should handle array values', () => {
      State.set('filters.location', [1, 2, 3]);
      State.set('filters.features', ['pool', 'garden']);

      const params = State.getSearchParams();

      expect(params.location_id).toBe('1,2,3');
      expect(params.features).toBe('pool,garden');
    });

    it('should include pagination and sort', () => {
      State.set('results.page', 2);
      State.set('results.perPage', 24);
      State.set('ui.sort', 'list_price_asc');

      const params = State.getSearchParams();

      expect(params.page).toBe(2);
      expect(params.limit).toBe(24);
      expect(params.order).toBe('list_price_asc');
    });

    it('should exclude null/undefined values', () => {
      State.resetFilters();
      const params = State.getSearchParams();

      expect(params.location_id).toBeUndefined();
      expect(params.listing_type).toBeUndefined();
      expect(params.bedrooms_min).toBeUndefined();
    });
  });

  describe('wishlist', () => {
    it('should add property to wishlist', () => {
      State.addToWishlist(123);
      expect(State.isInWishlist(123)).toBe(true);
    });

    it('should not add duplicate properties', () => {
      State.addToWishlist(123);
      State.addToWishlist(123);
      const state = State.getState();
      expect(state.wishlist.filter((id) => id === 123).length).toBe(1);
    });

    it('should remove property from wishlist', () => {
      State.addToWishlist(123);
      State.removeFromWishlist(123);
      expect(State.isInWishlist(123)).toBe(false);
    });

    it('should persist wishlist to localStorage', () => {
      State.addToWishlist(456);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rs_wishlist',
        expect.stringContaining('456')
      );
    });

    it('should notify subscribers on wishlist change', () => {
      const callback = vi.fn();
      State.subscribe('wishlist', callback);
      State.addToWishlist(789);
      expect(callback).toHaveBeenCalled();
    });
  });
});
