/**
 * i18n End-to-End Tests for Card Sub-Components
 * Verifies all 16 supported languages work correctly across card components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftLabels } from '../../../../src/core/labels';
import { RealtySoftState } from '../../../../src/core/state';

// Card sub-components
import { RSCardPrice } from '../../../../src/components/listing/card/card-price';
import { RSCardTitle } from '../../../../src/components/listing/card/card-title';
import { RSCardLocation } from '../../../../src/components/listing/card/card-location';
import { RSCardBeds } from '../../../../src/components/listing/card/card-beds';
import { RSCardBaths } from '../../../../src/components/listing/card/card-baths';
import { RSCardBuilt } from '../../../../src/components/listing/card/card-built';
import { RSCardPlot } from '../../../../src/components/listing/card/card-plot';
import { RSCardRef } from '../../../../src/components/listing/card/card-ref';
import { RSCardType } from '../../../../src/components/listing/card/card-type';
import { RSCardStatus } from '../../../../src/components/listing/card/card-status';
import { RSCardDescription } from '../../../../src/components/listing/card/card-description';
import { RSCardLink } from '../../../../src/components/listing/card/card-link';
import { RSCardImage } from '../../../../src/components/listing/card/card-image';
import { RSCardWishlist } from '../../../../src/components/listing/card/card-wishlist';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function flushPromises() {
  await new Promise(resolve => setTimeout(resolve, 0));
}

const testElements = [];

function createCardElement(className = '') {
  const el = document.createElement('div');
  if (className) el.className = className;
  el.dataset.rsPropertyRef = 'RS-12345';
  document.body.appendChild(el);
  testElements.push(el);
  return el;
}

function cleanup() {
  testElements.forEach(el => {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
  testElements.length = 0;
}

// ---------------------------------------------------------------------------
// Mock property matching the Property interface
// ---------------------------------------------------------------------------

const MOCK_PROPERTY = {
  id: 1001,
  title: 'Luxury Villa in Marbella',
  ref: 'RS-12345',
  unique_ref: 'UNQ-12345',
  price: 495000,
  price_on_request: false,
  location: 'Marbella, Costa del Sol',
  postal_code: '29660',
  address: 'Calle Test 1',
  beds: 3,
  baths: 2,
  built_area: 180,
  plot_size: 500,
  terrace_size: 40,
  solarium_size: 0,
  garden_size: 100,
  usable_area: 160,
  images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  imagesFull: [],
  imagesWithSizes: [],
  total_images: 2,
  url: null,
  listing_type: 'resale',
  status: 'active',
  type: 'Villa',
  is_featured: true,
  is_own: false,
  is_new: false,
  is_exclusive: false,
  description: 'A beautiful luxury villa with panoramic sea views and private pool.',
  short_description: 'Luxury villa with sea views.',
  features: [],
  agent: null,
  latitude: 36.5,
  longitude: -4.9,
  year_built: 2020,
  community_fees: null,
  ibi_tax: null,
  basura_tax: null,
  energy_rating: 'B',
  co2_rating: 'C',
  energy_certificate_image: '',
  energy_consumption: '',
  video_url: '',
  virtual_tour_url: '',
  pdf_url: '',
  floor: '',
  orientation: 'South',
  parking: 2,
  pool: true,
  furnished: 'Fully',
  condition: 'Excellent',
  views: 'Sea',
  created_at: '2024-01-01',
  updated_at: '2024-06-01',
};

const MOCK_PROPERTY_POR = { ...MOCK_PROPERTY, price_on_request: true, price: 0 };

// ---------------------------------------------------------------------------
// All 16 supported languages
// ---------------------------------------------------------------------------

const ALL_LANGUAGES = [
  'en_US', 'es_ES', 'de_DE', 'fr_FR', 'it_IT', 'pt_PT',
  'nl_NL', 'ru_RU', 'zh_CN', 'ja_JP', 'ar_SA', 'sv_SE',
  'no_NO', 'da_DK', 'fi_FI', 'pl_PL',
];

// ---------------------------------------------------------------------------
// Simulated API translations per language (card-specific label keys)
// ---------------------------------------------------------------------------

const LANGUAGE_LABELS = {
  en_US: {
    card_bed: 'bed', card_beds: 'beds',
    card_bath: 'bath', card_baths: 'baths',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Add to Wishlist',
    detail_price_on_request: 'Price on Request',
  },
  es_ES: {
    card_bed: 'dormitorio', card_beds: 'dormitorios',
    card_bath: 'baño', card_baths: 'baños',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Añadir a favoritos',
    detail_price_on_request: 'Precio a consultar',
  },
  de_DE: {
    card_bed: 'Schlafzimmer', card_beds: 'Schlafzimmer',
    card_bath: 'Bad', card_baths: 'Bäder',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Zur Wunschliste',
    detail_price_on_request: 'Preis auf Anfrage',
  },
  fr_FR: {
    card_bed: 'chambre', card_beds: 'chambres',
    card_bath: 'salle de bain', card_baths: 'salles de bain',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Réf\u00A0:',
    wishlist_add: 'Ajouter aux favoris',
    detail_price_on_request: 'Prix sur demande',
  },
  it_IT: {
    card_bed: 'camera', card_beds: 'camere',
    card_bath: 'bagno', card_baths: 'bagni',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Rif:',
    wishlist_add: 'Aggiungi ai preferiti',
    detail_price_on_request: 'Prezzo su richiesta',
  },
  pt_PT: {
    card_bed: 'quarto', card_beds: 'quartos',
    card_bath: 'casa de banho', card_baths: 'casas de banho',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Adicionar à lista',
    detail_price_on_request: 'Preço sob consulta',
  },
  nl_NL: {
    card_bed: 'slaapkamer', card_beds: 'slaapkamers',
    card_bath: 'badkamer', card_baths: 'badkamers',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Toevoegen aan verlanglijst',
    detail_price_on_request: 'Prijs op aanvraag',
  },
  ru_RU: {
    card_bed: 'спальня', card_beds: 'спальни',
    card_bath: 'ванная', card_baths: 'ванные',
    card_built: 'м²', card_plot: 'м²',
    card_ref: 'Ссылка:',
    wishlist_add: 'Добавить в избранное',
    detail_price_on_request: 'Цена по запросу',
  },
  zh_CN: {
    card_bed: '卧室', card_beds: '卧室',
    card_bath: '浴室', card_baths: '浴室',
    card_built: '平方米', card_plot: '平方米',
    card_ref: '编号:',
    wishlist_add: '添加到收藏',
    detail_price_on_request: '价格面议',
  },
  ja_JP: {
    card_bed: '寝室', card_beds: '寝室',
    card_bath: '浴室', card_baths: '浴室',
    card_built: '㎡', card_plot: '㎡',
    card_ref: '参照:',
    wishlist_add: 'お気に入りに追加',
    detail_price_on_request: '価格はお問い合わせ',
  },
  ar_SA: {
    card_bed: 'غرفة نوم', card_beds: 'غرف نوم',
    card_bath: 'حمام', card_baths: 'حمامات',
    card_built: 'م²', card_plot: 'م²',
    card_ref: 'المرجع:',
    wishlist_add: 'أضف للمفضلة',
    detail_price_on_request: 'السعر عند الطلب',
  },
  sv_SE: {
    card_bed: 'sovrum', card_beds: 'sovrum',
    card_bath: 'badrum', card_baths: 'badrum',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Lägg till i önskelista',
    detail_price_on_request: 'Pris på förfrågan',
  },
  no_NO: {
    card_bed: 'soverom', card_beds: 'soverom',
    card_bath: 'bad', card_baths: 'bad',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Legg til i ønskeliste',
    detail_price_on_request: 'Pris på forespørsel',
  },
  da_DK: {
    card_bed: 'soveværelse', card_beds: 'soveværelser',
    card_bath: 'badeværelse', card_baths: 'badeværelser',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Ref:',
    wishlist_add: 'Tilføj til ønskeliste',
    detail_price_on_request: 'Pris på forespørgsel',
  },
  fi_FI: {
    card_bed: 'makuuhuone', card_beds: 'makuuhuonetta',
    card_bath: 'kylpyhuone', card_baths: 'kylpyhuonetta',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Viite:',
    wishlist_add: 'Lisää toivelistaan',
    detail_price_on_request: 'Hinta pyydettäessä',
  },
  pl_PL: {
    card_bed: 'sypialnia', card_beds: 'sypialnie',
    card_bath: 'łazienka', card_baths: 'łazienki',
    card_built: 'm²', card_plot: 'm²',
    card_ref: 'Nr ref:',
    wishlist_add: 'Dodaj do ulubionych',
    detail_price_on_request: 'Cena na zapytanie',
  },
};

// ===========================================================================
// TESTS
// ===========================================================================

describe('Card Sub-Components — i18n End-to-End', () => {
  beforeEach(async () => {
    // Reset labels to English defaults
    await RealtySoftLabels.reloadForLanguage('en_US');
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();

    // Ensure API mock has getPropertyByRef (not in default setup.js)
    globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
      .mockResolvedValue({ data: MOCK_PROPERTY });
    globalThis.RealtySoftAPI.getProperty = vi.fn()
      .mockResolvedValue({ data: MOCK_PROPERTY });

    // Ensure analytics has card/wishlist methods
    globalThis.RealtySoftAnalytics.trackWishlistAdd = vi.fn();
    globalThis.RealtySoftAnalytics.trackWishlistRemove = vi.fn();
    globalThis.RealtySoftAnalytics.trackCardClick = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // -----------------------------------------------------------------------
  // 1. Label key completeness
  // -----------------------------------------------------------------------
  describe('label key completeness', () => {
    it('should have all card-component label keys in defaults', () => {
      RealtySoftLabels.init('en_US');
      const all = RealtySoftLabels.getAll();

      // Keys used by card sub-components
      const requiredKeys = [
        'card_bed', 'card_beds',
        'card_bath', 'card_baths',
        'card_built', 'card_plot',
        'card_ref',
        'wishlist_add', 'wishlist_removed', 'wishlist_error',
      ];

      for (const key of requiredKeys) {
        expect(all[key], `Missing label key: ${key}`).toBeDefined();
      }
    });

    it('should have non-empty values for all card label keys', () => {
      RealtySoftLabels.init('en_US');
      const all = RealtySoftLabels.getAll();

      expect(all.card_bed).toBe('bed');
      expect(all.card_beds).toBe('beds');
      expect(all.card_bath).toBe('bath');
      expect(all.card_baths).toBe('baths');
      expect(all.card_built).toBe('m\u00B2');
      expect(all.card_plot).toBe('m\u00B2');
      expect(all.card_ref).toBe('Ref:');
      expect(all.wishlist_add).toBe('Add to Wishlist');
    });
  });

  // -----------------------------------------------------------------------
  // 2. Per-component rendering with English defaults
  // -----------------------------------------------------------------------
  describe('per-component English rendering', () => {
    it('RSCardBeds — renders bed count with plural label', async () => {
      const el = createCardElement();
      new RSCardBeds(el);
      await flushPromises();

      expect(el.textContent).toContain('3');
      expect(el.textContent).toContain('beds');
    });

    it('RSCardBeds — uses singular for 1 bed', async () => {
      globalThis.RealtySoftAPI.getPropertyByRef.mockResolvedValueOnce({
        data: { ...MOCK_PROPERTY, beds: 1 },
      });
      const el = createCardElement();
      new RSCardBeds(el);
      await flushPromises();

      expect(el.textContent).toContain('1');
      expect(el.textContent).toContain('bed');
      expect(el.textContent).not.toContain('beds');
    });

    it('RSCardBeds — hidden when beds is 0', async () => {
      globalThis.RealtySoftAPI.getPropertyByRef.mockResolvedValueOnce({
        data: { ...MOCK_PROPERTY, beds: 0 },
      });
      const el = createCardElement();
      new RSCardBeds(el);
      await flushPromises();

      expect(el.style.display).toBe('none');
    });

    it('RSCardBaths — renders bath count with plural label', async () => {
      const el = createCardElement();
      new RSCardBaths(el);
      await flushPromises();

      expect(el.textContent).toContain('2');
      expect(el.textContent).toContain('baths');
    });

    it('RSCardBaths — uses singular for 1 bath', async () => {
      globalThis.RealtySoftAPI.getPropertyByRef.mockResolvedValueOnce({
        data: { ...MOCK_PROPERTY, baths: 1 },
      });
      const el = createCardElement();
      new RSCardBaths(el);
      await flushPromises();

      expect(el.textContent).toContain('1');
      expect(el.textContent).toContain('bath');
      expect(el.textContent).not.toContain('baths');
    });

    it('RSCardBuilt — renders built area with m² label', async () => {
      const el = createCardElement();
      new RSCardBuilt(el);
      await flushPromises();

      expect(el.textContent).toContain('180');
      expect(el.textContent).toContain('m\u00B2');
    });

    it('RSCardPlot — renders plot size with m² label', async () => {
      const el = createCardElement();
      new RSCardPlot(el);
      await flushPromises();

      expect(el.textContent).toContain('500');
      expect(el.textContent).toContain('m\u00B2');
    });

    it('RSCardRef — renders Ref: prefix with reference', async () => {
      const el = createCardElement();
      new RSCardRef(el);
      await flushPromises();

      expect(el.textContent).toContain('Ref:');
      expect(el.textContent).toContain('RS-12345');
    });

    it('RSCardPrice — renders formatted price', async () => {
      const el = createCardElement();
      new RSCardPrice(el);
      await flushPromises();

      // Should contain 495,000 or locale-equivalent
      expect(el.textContent).toContain('495');
    });

    it('RSCardPrice — renders Price on Request when price_on_request is true', async () => {
      globalThis.RealtySoftAPI.getPropertyByRef.mockResolvedValueOnce({
        data: MOCK_PROPERTY_POR,
      });
      const el = createCardElement();
      new RSCardPrice(el);
      await flushPromises();

      expect(el.textContent).toContain('Price on Request');
    });

    it('RSCardTitle — renders title text', async () => {
      const el = createCardElement();
      new RSCardTitle(el);
      await flushPromises();

      expect(el.textContent).toBe('Luxury Villa in Marbella');
    });

    it('RSCardLocation — renders location with icon', async () => {
      const el = createCardElement();
      new RSCardLocation(el);
      await flushPromises();

      expect(el.textContent).toContain('Marbella, Costa del Sol');
      expect(el.querySelector('svg')).toBeTruthy();
    });

    it('RSCardType — renders property type', async () => {
      const el = createCardElement();
      new RSCardType(el);
      await flushPromises();

      expect(el.textContent).toBe('Villa');
    });

    it('RSCardStatus — renders listing type badge', async () => {
      const el = createCardElement();
      new RSCardStatus(el);
      await flushPromises();

      expect(el.innerHTML).toContain('For Sale');
      expect(el.innerHTML).toContain('Featured');
    });

    it('RSCardDescription — renders short description', async () => {
      const el = createCardElement();
      new RSCardDescription(el);
      await flushPromises();

      expect(el.textContent).toBe('Luxury villa with sea views.');
    });

    it('RSCardLink — sets href on anchor element', async () => {
      const el = document.createElement('a');
      el.className = 'rs_card_link';
      el.dataset.rsPropertyRef = 'RS-12345';
      document.body.appendChild(el);
      testElements.push(el);

      new RSCardLink(el);
      await flushPromises();

      expect(el.href).toContain('/property/');
      expect(el.href).toContain('RS-12345');
    });

    it('RSCardImage — renders carousel for multiple images', async () => {
      const el = createCardElement();
      new RSCardImage(el);
      await flushPromises();

      expect(el.querySelector('.rs-card__carousel')).toBeTruthy();
      expect(el.querySelectorAll('.rs-card__carousel-slide').length).toBe(2);
    });

    it('RSCardWishlist — renders heart with aria-label', async () => {
      const el = createCardElement();
      new RSCardWishlist(el);
      await flushPromises();

      expect(el.getAttribute('aria-label')).toBe('Add to Wishlist');
      expect(el.querySelector('svg')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // 3. All 16 languages — RSCardBeds (plural label)
  // -----------------------------------------------------------------------
  describe('all 16 languages — RSCardBeds translated label', () => {
    it.each(ALL_LANGUAGES)('%s: renders translated beds label', async (lang) => {
      await RealtySoftLabels.reloadForLanguage(lang);
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS[lang]);

      // Re-mock after clearAllMocks
      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const el = createCardElement();
      new RSCardBeds(el);
      await flushPromises();

      const expected = LANGUAGE_LABELS[lang].card_beds;
      expect(el.textContent).toContain('3');
      expect(el.textContent).toContain(expected);
    });
  });

  // -----------------------------------------------------------------------
  // 4. All 16 languages — RSCardBaths translated label
  // -----------------------------------------------------------------------
  describe('all 16 languages — RSCardBaths translated label', () => {
    it.each(ALL_LANGUAGES)('%s: renders translated baths label', async (lang) => {
      await RealtySoftLabels.reloadForLanguage(lang);
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS[lang]);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const el = createCardElement();
      new RSCardBaths(el);
      await flushPromises();

      const expected = LANGUAGE_LABELS[lang].card_baths;
      expect(el.textContent).toContain('2');
      expect(el.textContent).toContain(expected);
    });
  });

  // -----------------------------------------------------------------------
  // 5. All 16 languages — RSCardRef translated prefix
  // -----------------------------------------------------------------------
  describe('all 16 languages — RSCardRef translated prefix', () => {
    it.each(ALL_LANGUAGES)('%s: renders translated ref prefix', async (lang) => {
      await RealtySoftLabels.reloadForLanguage(lang);
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS[lang]);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const el = createCardElement();
      new RSCardRef(el);
      await flushPromises();

      const expected = LANGUAGE_LABELS[lang].card_ref;
      expect(el.textContent).toContain(expected);
      expect(el.textContent).toContain('RS-12345');
    });
  });

  // -----------------------------------------------------------------------
  // 6. All 16 languages — RSCardBuilt translated area label
  // -----------------------------------------------------------------------
  describe('all 16 languages — RSCardBuilt translated area label', () => {
    it.each(ALL_LANGUAGES)('%s: renders translated built area label', async (lang) => {
      await RealtySoftLabels.reloadForLanguage(lang);
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS[lang]);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const el = createCardElement();
      new RSCardBuilt(el);
      await flushPromises();

      const expected = LANGUAGE_LABELS[lang].card_built;
      expect(el.textContent).toContain('180');
      expect(el.textContent).toContain(expected);
    });
  });

  // -----------------------------------------------------------------------
  // 7. All 16 languages — Price on Request
  // -----------------------------------------------------------------------
  describe('all 16 languages — Price on Request', () => {
    it.each(ALL_LANGUAGES)('%s: renders translated price_on_request', async (lang) => {
      await RealtySoftLabels.reloadForLanguage(lang);
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS[lang]);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY_POR });

      const el = createCardElement();
      new RSCardPrice(el);
      await flushPromises();

      const expected = LANGUAGE_LABELS[lang].detail_price_on_request;
      expect(el.textContent).toBe(expected);
    });
  });

  // -----------------------------------------------------------------------
  // 8. All 16 languages — formatPrice locale
  // -----------------------------------------------------------------------
  describe('all 16 languages — formatPrice locale', () => {
    it.each(ALL_LANGUAGES)('%s: formatPrice produces non-empty locale output', (lang) => {
      RealtySoftLabels.init(lang);
      const formatted = RealtySoftLabels.formatPrice(495000, 'EUR');

      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
      // Should contain digits (Western or Eastern Arabic numerals for ar_SA)
      expect(formatted.replace(/\s/g, '')).toMatch(/[0-9٠-٩]/);
    });

    it.each(ALL_LANGUAGES)('%s: formatPrice handles null/undefined', (lang) => {
      RealtySoftLabels.init(lang);
      expect(RealtySoftLabels.formatPrice(null)).toBe('');
      expect(RealtySoftLabels.formatPrice(undefined)).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // 9. All 16 languages — RSCardPrice formatted price rendering
  // -----------------------------------------------------------------------
  describe('all 16 languages — RSCardPrice locale-formatted price', () => {
    it.each(ALL_LANGUAGES)('%s: renders locale-formatted price', async (lang) => {
      await RealtySoftLabels.reloadForLanguage(lang);
      RealtySoftLabels.init(lang);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const el = createCardElement();
      new RSCardPrice(el);
      await flushPromises();

      // Price should be non-empty and contain digits (Western or Eastern Arabic)
      expect(el.textContent).toBeTruthy();
      expect(el.textContent).toMatch(/[0-9٠-٩]/);
    });
  });

  // -----------------------------------------------------------------------
  // 10. All 16 languages — RSCardWishlist aria-label
  // -----------------------------------------------------------------------
  describe('all 16 languages — RSCardWishlist translated aria-label', () => {
    it.each(ALL_LANGUAGES)('%s: renders translated wishlist aria-label', async (lang) => {
      await RealtySoftLabels.reloadForLanguage(lang);
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS[lang]);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const el = createCardElement();
      new RSCardWishlist(el);
      await flushPromises();

      const expected = LANGUAGE_LABELS[lang].wishlist_add;
      expect(el.getAttribute('aria-label')).toBe(expected);
    });
  });

  // -----------------------------------------------------------------------
  // 11. Label overrides take precedence
  // -----------------------------------------------------------------------
  describe('label overrides', () => {
    it('client overrides take precedence over API labels', async () => {
      await RealtySoftLabels.reloadForLanguage('es_ES');
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS.es_ES);
      RealtySoftLabels.applyOverrides({
        card_beds: 'habitaciones',
      });

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const el = createCardElement();
      new RSCardBeds(el);
      await flushPromises();

      // Should use override, not the API label
      expect(el.textContent).toContain('habitaciones');
      expect(el.textContent).not.toContain('dormitorios');
    });

    it('overrides apply across multiple components', async () => {
      await RealtySoftLabels.reloadForLanguage('de_DE');
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS.de_DE);
      RealtySoftLabels.applyOverrides({
        card_baths: 'Badezimmer',
        card_ref: 'Referenz:',
      });

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const elBaths = createCardElement();
      const elRef = createCardElement();
      new RSCardBaths(elBaths);
      new RSCardRef(elRef);
      await flushPromises();

      expect(elBaths.textContent).toContain('Badezimmer');
      expect(elRef.textContent).toContain('Referenz:');
    });
  });

  // -----------------------------------------------------------------------
  // 12. Language switching
  // -----------------------------------------------------------------------
  describe('language switching', () => {
    it('components created after language switch use new labels', async () => {
      // Start with English
      RealtySoftLabels.init('en_US');

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const elEn = createCardElement();
      new RSCardBeds(elEn);
      await flushPromises();

      expect(elEn.textContent).toContain('beds');

      // Switch to Spanish
      await RealtySoftLabels.reloadForLanguage('es_ES');
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS.es_ES);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const elEs = createCardElement();
      new RSCardBeds(elEs);
      await flushPromises();

      expect(elEs.textContent).toContain('dormitorios');

      // Switch to Japanese
      await RealtySoftLabels.reloadForLanguage('ja_JP');
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS.ja_JP);

      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });

      const elJa = createCardElement();
      new RSCardBeds(elJa);
      await flushPromises();

      expect(elJa.textContent).toContain('寝室');
    });

    it('formatPrice locale updates after language switch', () => {
      RealtySoftLabels.init('en_US');
      const enPrice = RealtySoftLabels.formatPrice(1234567, 'EUR');

      RealtySoftLabels.setLanguage('de_DE');
      const dePrice = RealtySoftLabels.formatPrice(1234567, 'EUR');

      // Both should be non-empty
      expect(enPrice).toBeTruthy();
      expect(dePrice).toBeTruthy();

      // Locales typically differ in separators (en: 1,234,567 vs de: 1.234.567)
      // At minimum they should both contain the number
      expect(enPrice.replace(/\s/g, '')).toContain('1');
      expect(dePrice.replace(/\s/g, '')).toContain('1');
    });
  });

  // -----------------------------------------------------------------------
  // 13. Full Spanish pass — all label-using components
  // -----------------------------------------------------------------------
  describe('full Spanish pass — all label-using components', () => {
    beforeEach(async () => {
      await RealtySoftLabels.reloadForLanguage('es_ES');
      await RealtySoftLabels.loadFromAPI(LANGUAGE_LABELS.es_ES);
      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockResolvedValue({ data: MOCK_PROPERTY });
    });

    it('RSCardBeds — Spanish', async () => {
      const el = createCardElement();
      new RSCardBeds(el);
      await flushPromises();
      expect(el.textContent).toContain('dormitorios');
    });

    it('RSCardBaths — Spanish', async () => {
      const el = createCardElement();
      new RSCardBaths(el);
      await flushPromises();
      expect(el.textContent).toContain('baños');
    });

    it('RSCardBuilt — Spanish', async () => {
      const el = createCardElement();
      new RSCardBuilt(el);
      await flushPromises();
      expect(el.textContent).toContain('m\u00B2');
    });

    it('RSCardPlot — Spanish', async () => {
      const el = createCardElement();
      new RSCardPlot(el);
      await flushPromises();
      expect(el.textContent).toContain('m\u00B2');
    });

    it('RSCardRef — Spanish', async () => {
      const el = createCardElement();
      new RSCardRef(el);
      await flushPromises();
      expect(el.textContent).toContain('Ref:');
      expect(el.textContent).toContain('RS-12345');
    });

    it('RSCardPrice — Spanish formatted price', async () => {
      const el = createCardElement();
      new RSCardPrice(el);
      await flushPromises();
      expect(el.textContent).toMatch(/\d/);
    });

    it('RSCardPrice — Spanish price on request', async () => {
      globalThis.RealtySoftAPI.getPropertyByRef.mockResolvedValueOnce({
        data: MOCK_PROPERTY_POR,
      });
      const el = createCardElement();
      new RSCardPrice(el);
      await flushPromises();
      expect(el.textContent).toBe('Precio a consultar');
    });

    it('RSCardWishlist — Spanish aria-label', async () => {
      const el = createCardElement();
      new RSCardWishlist(el);
      await flushPromises();
      expect(el.getAttribute('aria-label')).toBe('Añadir a favoritos');
    });
  });

  // -----------------------------------------------------------------------
  // 14. Grid safety — components inside .rs_property_grid skip init
  // -----------------------------------------------------------------------
  describe('grid safety', () => {
    it('card components inside .rs_property_grid do not self-render', async () => {
      const grid = document.createElement('div');
      grid.className = 'rs_property_grid';
      document.body.appendChild(grid);
      testElements.push(grid);

      const el = document.createElement('div');
      el.dataset.rsPropertyRef = 'RS-12345';
      grid.appendChild(el);

      new RSCardBeds(el);
      await flushPromises();

      // Should NOT have called the API or rendered anything
      expect(globalThis.RealtySoftAPI.getPropertyByRef).not.toHaveBeenCalled();
      expect(el.textContent).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // 15. Missing / invalid property ref
  // -----------------------------------------------------------------------
  describe('missing property reference', () => {
    it('component with no property ref renders nothing', async () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      testElements.push(el);

      new RSCardBeds(el);
      await flushPromises();

      // No API call, no rendering
      expect(el.textContent).toBe('');
    });

    it('component with invalid ref handles gracefully', async () => {
      globalThis.RealtySoftAPI.getPropertyByRef = vi.fn()
        .mockRejectedValue(new Error('Not found'));

      const el = createCardElement();
      new RSCardBeds(el);
      await flushPromises();

      // Should not throw, element remains empty
      expect(el.textContent).toBe('');
    });
  });
});
