/**
 * Tests for RealtySoftLabels module
 * Tests: language detection, label merging, formatters
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the TypeScript module directly
import { RealtySoftLabels } from '../../src/core/labels';

describe('RealtySoftLabels', () => {
  let Labels;

  beforeEach(async () => {
    Labels = RealtySoftLabels;
    // Reset to defaults by reloading for en_US
    await Labels.reloadForLanguage('en_US');
  });

  describe('init', () => {
    it('should initialize with provided language', () => {
      const lang = Labels.init('es_ES');
      expect(lang).toBe('es_ES');
      expect(Labels.getLanguage()).toBe('es_ES');
    });

    it('should detect language if not provided', () => {
      const lang = Labels.init();
      // Will use browser's navigator.language or 'en_US' as default
      expect(typeof lang).toBe('string');
    });
  });

  describe('detectLanguage', () => {
    it('should return a language string', () => {
      const lang = Labels.detectLanguage();
      expect(typeof lang).toBe('string');
    });
  });

  describe('get', () => {
    it('should return a default label', () => {
      Labels.init('en_US');
      expect(Labels.get('search_button')).toBe('Search');
    });

    it('should return key if label not found', () => {
      Labels.init('en_US');
      expect(Labels.get('nonexistent_key')).toBe('nonexistent_key');
    });

    it('should replace placeholders', () => {
      Labels.init('en_US');
      const result = Labels.get('results_count', { count: 42 });
      expect(result).toBe('42 properties found');
    });

    it('should replace multiple placeholders', async () => {
      Labels.init('en_US');
      // Add a test label with multiple placeholders
      await Labels.loadFromAPI({
        test_multiple: '{name} has {count} properties in {location}',
      });
      const result = Labels.get('test_multiple', {
        name: 'John',
        count: 5,
        location: 'Marbella',
      });
      expect(result).toBe('John has 5 properties in Marbella');
    });
  });

  describe('loadFromAPI', () => {
    it('should merge API labels with defaults', async () => {
      Labels.init('en_US');
      await Labels.loadFromAPI({
        search_button: 'Buscar',
        custom_label: 'Custom Value',
      });

      expect(Labels.get('search_button')).toBe('Buscar');
      expect(Labels.get('custom_label')).toBe('Custom Value');
      // Default labels still work
      expect(Labels.get('search_location')).toBe('Location');
    });

    it('should handle null/undefined API labels', async () => {
      Labels.init('en_US');
      await Labels.loadFromAPI(null);
      expect(Labels.get('search_button')).toBe('Search');

      await Labels.loadFromAPI(undefined);
      expect(Labels.get('search_button')).toBe('Search');
    });
  });

  describe('getAll', () => {
    it('should return all labels', () => {
      Labels.init('en_US');
      const all = Labels.getAll();

      expect(all).toHaveProperty('search_button');
      expect(all).toHaveProperty('search_location');
      expect(all).toHaveProperty('results_count');
    });

    it('should return a copy (not reference)', () => {
      Labels.init('en_US');
      const all = Labels.getAll();
      all.search_button = 'Modified';
      expect(Labels.get('search_button')).toBe('Search');
    });
  });

  describe('setLanguage', () => {
    it('should update current language', () => {
      Labels.init('en_US');
      Labels.setLanguage('fr_FR');
      expect(Labels.getLanguage()).toBe('fr_FR');
    });
  });

  describe('formatPrice', () => {
    it('should format price with currency', () => {
      Labels.init('en_US');
      const formatted = Labels.formatPrice(250000, 'EUR');
      // Intl.NumberFormat output varies by locale
      expect(formatted).toContain('250');
    });

    it('should handle null/undefined', () => {
      Labels.init('en_US');
      expect(Labels.formatPrice(null)).toBe('');
      expect(Labels.formatPrice(undefined)).toBe('');
    });

    it('should format based on locale', () => {
      Labels.init('de_DE');
      const formatted = Labels.formatPrice(1234567, 'EUR');
      // German locale uses dot as thousands separator
      expect(formatted).toContain('1');
    });
  });

  describe('formatNumber', () => {
    it('should format number with locale separators', () => {
      Labels.init('en_US');
      const formatted = Labels.formatNumber(1234567);
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });

    it('should handle null/undefined', () => {
      Labels.init('en_US');
      expect(Labels.formatNumber(null)).toBe('');
      expect(Labels.formatNumber(undefined)).toBe('');
    });
  });

  describe('formatArea', () => {
    it('should format area with m\u00B2 suffix', () => {
      Labels.init('en_US');
      const formatted = Labels.formatArea(150);
      expect(formatted).toContain('150');
      expect(formatted).toContain('m\u00B2');
    });

    it('should handle falsy values', () => {
      Labels.init('en_US');
      expect(Labels.formatArea(0)).toBe('');
      expect(Labels.formatArea(null)).toBe('');
      expect(Labels.formatArea(undefined)).toBe('');
    });
  });

  describe('applyOverrides', () => {
    it('should apply client label overrides', () => {
      Labels.init('en_US');
      Labels.applyOverrides({
        search_button: 'Find Properties',
        custom_client_label: 'Client Specific',
      });

      expect(Labels.get('search_button')).toBe('Find Properties');
      expect(Labels.get('custom_client_label')).toBe('Client Specific');
    });

    it('should override API labels', async () => {
      Labels.init('en_US');
      await Labels.loadFromAPI({
        search_button: 'API Search',
      });
      Labels.applyOverrides({
        search_button: 'Client Search',
      });

      expect(Labels.get('search_button')).toBe('Client Search');
    });

    it('should preserve non-overridden labels', () => {
      Labels.init('en_US');
      Labels.applyOverrides({
        search_button: 'Custom',
      });

      expect(Labels.get('search_location')).toBe('Location');
    });

    it('should handle null/undefined overrides gracefully', () => {
      Labels.init('en_US');
      Labels.applyOverrides(null);
      Labels.applyOverrides(undefined);

      expect(Labels.get('search_button')).toBe('Search');
    });
  });

  describe('reloadForLanguage', () => {
    it('should update current language', async () => {
      Labels.init('en_US');
      await Labels.reloadForLanguage('es_ES');

      expect(Labels.getLanguage()).toBe('es_ES');
    });

    it('should reset to defaults', async () => {
      Labels.init('en_US');
      await Labels.loadFromAPI({ search_button: 'API Label' });
      await Labels.reloadForLanguage('es_ES');

      // Should be reset to default
      expect(Labels.get('search_button')).toBe('Search');
    });
  });

  describe('default labels coverage', () => {
    it('should have search-related labels', () => {
      Labels.init('en_US');
      const labels = Labels.getAll();

      expect(labels.search_location).toBeDefined();
      expect(labels.search_bedrooms).toBeDefined();
      expect(labels.search_bathrooms).toBeDefined();
      expect(labels.search_price).toBeDefined();
      expect(labels.search_button).toBeDefined();
      expect(labels.search_reset).toBeDefined();
    });

    it('should have results-related labels', () => {
      Labels.init('en_US');
      const labels = Labels.getAll();

      expect(labels.results_count).toBeDefined();
      expect(labels.results_count_one).toBeDefined();
      expect(labels.results_count_zero).toBeDefined();
      expect(labels.results_sort).toBeDefined();
    });

    it('should have property card labels', () => {
      Labels.init('en_US');
      const labels = Labels.getAll();

      expect(labels.card_bed).toBeDefined();
      expect(labels.card_beds).toBeDefined();
      expect(labels.card_bath).toBeDefined();
      expect(labels.card_baths).toBeDefined();
    });

    it('should have detail page labels', () => {
      Labels.init('en_US');
      const labels = Labels.getAll();

      expect(labels.detail_description).toBeDefined();
      expect(labels.detail_features).toBeDefined();
      expect(labels.detail_location).toBeDefined();
      expect(labels.detail_contact).toBeDefined();
    });

    it('should have wishlist labels', () => {
      Labels.init('en_US');
      const labels = Labels.getAll();

      expect(labels.wishlist_add).toBeDefined();
      expect(labels.wishlist_remove).toBeDefined();
      expect(labels.wishlist_title).toBeDefined();
      expect(labels.wishlist_empty).toBeDefined();
    });

    it('should have inquiry form labels', () => {
      Labels.init('en_US');
      const labels = Labels.getAll();

      expect(labels.inquiry_name).toBeDefined();
      expect(labels.inquiry_email).toBeDefined();
      expect(labels.inquiry_phone).toBeDefined();
      expect(labels.inquiry_message).toBeDefined();
      expect(labels.inquiry_submit).toBeDefined();
    });
  });
});
