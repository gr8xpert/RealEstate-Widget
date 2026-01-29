/**
 * Tests for RealtySoft Service Worker
 * Tests: URL pattern matching and strategy selection
 */

import { describe, it, expect } from 'vitest';
import {
  isWidgetAsset,
  isImageAsset,
  isAPIProxy,
  getStrategy,
  getCacheName,
  SW_VERSION,
  STATIC_CACHE,
  API_CACHE,
} from '../../src/sw';

describe('Service Worker', () => {
  describe('URL pattern matching', () => {
    it('should identify widget JS assets', () => {
      expect(isWidgetAsset(new URL('https://example.com/dist/realtysoft.js'))).toBe(true);
      expect(isWidgetAsset(new URL('https://example.com/dist/realtysoft.min.js'))).toBe(true);
      expect(isWidgetAsset(new URL('https://example.com/dist/realtysoft.es.js'))).toBe(true);
    });

    it('should identify widget CSS assets', () => {
      expect(isWidgetAsset(new URL('https://example.com/dist/realtysoft.css'))).toBe(true);
    });

    it('should not match non-widget URLs', () => {
      expect(isWidgetAsset(new URL('https://example.com/app.js'))).toBe(false);
      expect(isWidgetAsset(new URL('https://example.com/page.html'))).toBe(false);
    });

    it('should identify image assets', () => {
      expect(isImageAsset(new URL('https://example.com/photo.jpg'))).toBe(true);
      expect(isImageAsset(new URL('https://example.com/photo.png'))).toBe(true);
      expect(isImageAsset(new URL('https://example.com/photo.webp'))).toBe(true);
      expect(isImageAsset(new URL('https://example.com/icon.svg'))).toBe(true);
      expect(isImageAsset(new URL('https://example.com/photo.jpg?w=256'))).toBe(true);
    });

    it('should not match non-image URLs', () => {
      expect(isImageAsset(new URL('https://example.com/data.json'))).toBe(false);
      expect(isImageAsset(new URL('https://example.com/page.html'))).toBe(false);
    });

    it('should identify API proxy URLs', () => {
      expect(isAPIProxy(new URL('https://realtysoft.ai/php/api-proxy.php'))).toBe(true);
      expect(isAPIProxy(new URL('https://realtysoft.ai/propertymanager/php/api-proxy.php?_endpoint=v1/property'))).toBe(true);
    });

    it('should not match non-API URLs', () => {
      expect(isAPIProxy(new URL('https://example.com/api/data'))).toBe(false);
    });
  });

  describe('strategy selection', () => {
    it('should use cache-first for widget assets', () => {
      expect(getStrategy(new URL('https://example.com/realtysoft.js'))).toBe('cache-first');
      expect(getStrategy(new URL('https://example.com/realtysoft.css'))).toBe('cache-first');
    });

    it('should use cache-first for images', () => {
      expect(getStrategy(new URL('https://example.com/photo.jpg'))).toBe('cache-first');
    });

    it('should use stale-while-revalidate for API', () => {
      expect(getStrategy(new URL('https://realtysoft.ai/php/api-proxy.php'))).toBe('stale-while-revalidate');
    });

    it('should use network-only for unrecognized URLs', () => {
      expect(getStrategy(new URL('https://example.com/page.html'))).toBe('network-only');
      expect(getStrategy(new URL('https://example.com/data.json'))).toBe('network-only');
    });
  });

  describe('cache names', () => {
    it('should return API cache for proxy URLs', () => {
      expect(getCacheName(new URL('https://realtysoft.ai/php/api-proxy.php'))).toBe(API_CACHE);
    });

    it('should return static cache for other cached URLs', () => {
      expect(getCacheName(new URL('https://example.com/realtysoft.js'))).toBe(STATIC_CACHE);
      expect(getCacheName(new URL('https://example.com/photo.jpg'))).toBe(STATIC_CACHE);
    });
  });

  describe('versioning', () => {
    it('should include version in static cache name', () => {
      expect(STATIC_CACHE).toContain(SW_VERSION);
    });

    it('should have correct version', () => {
      expect(SW_VERSION).toBe('3.0.0');
    });
  });
});
