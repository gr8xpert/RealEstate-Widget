/**
 * Tests for LRU Cache
 * Tests: basic operations, eviction, capacity, edge cases
 */

import { describe, it, expect } from 'vitest';
import { LRUCache } from '../../src/core/lru-cache';

describe('LRUCache', () => {
  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache(10);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
    });

    it('should return undefined for missing keys', () => {
      const cache = new LRUCache(10);
      expect(cache.get('missing')).toBeUndefined();
    });

    it('should update existing values', () => {
      const cache = new LRUCache(10);
      cache.set('a', 1);
      cache.set('a', 2);
      expect(cache.get('a')).toBe(2);
      expect(cache.size).toBe(1);
    });

    it('should report correct size', () => {
      const cache = new LRUCache(10);
      expect(cache.size).toBe(0);
      cache.set('a', 1);
      expect(cache.size).toBe(1);
      cache.set('b', 2);
      expect(cache.size).toBe(2);
    });

    it('should check existence with has()', () => {
      const cache = new LRUCache(10);
      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });
  });

  describe('eviction', () => {
    it('should evict least recently used when capacity exceeded', () => {
      const cache = new LRUCache(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // Should evict 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
      expect(cache.size).toBe(3);
    });

    it('should promote accessed items (prevent eviction)', () => {
      const cache = new LRUCache(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a' to promote it to most recently used
      cache.get('a');

      cache.set('d', 4); // Should evict 'b' (least recently used)

      expect(cache.get('a')).toBe(1); // Still present
      expect(cache.get('b')).toBeUndefined(); // Evicted
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('should promote updated items', () => {
      const cache = new LRUCache(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Update 'a' to promote it
      cache.set('a', 10);

      cache.set('d', 4); // Should evict 'b'

      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete existing keys', () => {
      const cache = new LRUCache(10);
      cache.set('a', 1);
      expect(cache.delete('a')).toBe(true);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.size).toBe(0);
    });

    it('should return false for non-existent keys', () => {
      const cache = new LRUCache(10);
      expect(cache.delete('missing')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const cache = new LRUCache(10);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const cache = new LRUCache(1);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.size).toBe(1);
    });

    it('should enforce minimum capacity of 1', () => {
      const cache = new LRUCache(0);
      cache.set('a', 1);
      expect(cache.size).toBe(1);
      expect(cache.get('a')).toBe(1);
    });

    it('should handle objects as values', () => {
      const cache = new LRUCache(10);
      const obj = { id: 1, name: 'test', nested: { value: true } };
      cache.set('obj', obj);
      expect(cache.get('obj')).toBe(obj);
    });
  });
});
