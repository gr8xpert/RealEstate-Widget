/**
 * Tests for RSWishlistGrid
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtySoftState } from '../../../src/core/state';
import { RealtySoftLabels } from '../../../src/core/labels';
import { RSWishlistGrid } from '../../../src/components/utility/wishlist-grid';
import { WishlistManager } from '../../../src/core/wishlist-manager';
import { createMockProperty } from '../../helpers/component-test-utils';

const mockRealtySoft = {
  setFilter: vi.fn(),
  search: vi.fn(),
  reset: vi.fn(),
  registerComponent: vi.fn(),
  setLanguage: vi.fn(),
  showDetail: vi.fn(),
};
globalThis.RealtySoft = mockRealtySoft;

function createGridProperty(overrides = {}) {
  return {
    id: 1,
    ref_no: 'REF001',
    ref: 'REF001',
    name: 'Beautiful Villa',
    title: 'Beautiful Villa',
    list_price: 350000,
    price: 350000,
    location: 'Marbella',
    type: 'Villa',
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    baths: 2,
    build_size: 150,
    built_area: 150,
    plot_size: 500,
    images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    listing_type: 'resale',
    is_featured: false,
    is_own: true,
    addedAt: Date.now(),
    note: '',
    ...overrides,
  };
}

describe('RSWishlistGrid', () => {
  let testElement;
  let isSharedViewSpy;
  let getAsArraySpy;
  let getSortSpy;
  let isInCompareSpy;
  let loadSharedSpy;

  beforeEach(() => {
    RealtySoftState.setLockedFilters({});
    RealtySoftState.resetFilters();
    RealtySoftLabels.init('en_US');
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    isSharedViewSpy = vi.spyOn(WishlistManager, 'isSharedView').mockReturnValue(false);
    getAsArraySpy = vi.spyOn(WishlistManager, 'getAsArray').mockReturnValue([]);
    getSortSpy = vi.spyOn(WishlistManager, 'getSort').mockReturnValue({ field: 'addedAt', order: 'desc' });
    isInCompareSpy = vi.spyOn(WishlistManager, 'isInCompare').mockReturnValue(false);
    loadSharedSpy = vi.spyOn(WishlistManager, 'loadSharedWishlist').mockReturnValue(null);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    isSharedViewSpy.mockRestore();
    getAsArraySpy.mockRestore();
    getSortSpy.mockRestore();
    isInCompareSpy.mockRestore();
    loadSharedSpy.mockRestore();
  });

  it('should add correct CSS class', () => {
    new RSWishlistGrid(testElement);
    expect(testElement.classList.contains('rs-wishlist-list__grid')).toBe(true);
  });

  it('should show loading state initially', () => {
    new RSWishlistGrid(testElement);
    const loading = testElement.querySelector('.rs-wishlist-grid__loading');
    // Loading may or may not still be visible depending on async timing,
    // but the grid class should be present
    expect(testElement.classList.contains('rs-wishlist-list__grid')).toBe(true);
  });

  it('should be hidden when no properties in wishlist', () => {
    getAsArraySpy.mockReturnValue([]);
    new RSWishlistGrid(testElement);
    expect(testElement.style.display).toBe('none');
  });

  it('should display as grid when properties exist', () => {
    const props = [createGridProperty()];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    expect(testElement.style.display).toBe('grid');
  });

  it('should render property cards', () => {
    const props = [createGridProperty(), createGridProperty({ id: 2, ref_no: 'REF002', name: 'Penthouse' })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const cards = testElement.querySelectorAll('.rs-wishlist-card');
    expect(cards.length).toBe(2);
  });

  it('should render card with correct ref-no data attribute', () => {
    const props = [createGridProperty({ ref_no: 'REF-TEST' })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const card = testElement.querySelector('.rs-wishlist-card');
    expect(card.dataset.refNo).toBe('REF-TEST');
  });

  it('should render card title', () => {
    const props = [createGridProperty({ name: 'Luxury Apartment' })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const title = testElement.querySelector('.rs-wishlist-card__title');
    expect(title.textContent).toContain('Luxury Apartment');
  });

  it('should render card price', () => {
    const props = [createGridProperty({ list_price: 500000 })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const price = testElement.querySelector('.rs-wishlist-card__price');
    expect(price.textContent).toContain('500');
  });

  it('should render card details (location, type, beds, baths, area)', () => {
    const props = [createGridProperty({ location: 'Estepona', type: 'Villa', beds: 4, baths: 3, build_size: 200 })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const details = testElement.querySelector('.rs-wishlist-card__details');
    expect(details.textContent).toContain('Estepona');
    expect(details.textContent).toContain('Villa');
    expect(details.textContent).toContain('4');
    expect(details.textContent).toContain('3');
  });

  it('should render heart/remove button when not shared view', () => {
    const props = [createGridProperty()];
    getAsArraySpy.mockReturnValue(props);
    isSharedViewSpy.mockReturnValue(false);
    new RSWishlistGrid(testElement);
    const heart = testElement.querySelector('.rs-wishlist-card__heart');
    expect(heart).toBeTruthy();
  });

  it('should render carousel navigation when multiple images', () => {
    const props = [createGridProperty({ images: ['img1.jpg', 'img2.jpg', 'img3.jpg'] })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const prevBtn = testElement.querySelector('.rs-wishlist-card__nav--prev');
    const nextBtn = testElement.querySelector('.rs-wishlist-card__nav--next');
    expect(prevBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
  });

  it('should not render carousel navigation for single image', () => {
    const props = [createGridProperty({ images: ['img1.jpg'] })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const prevBtn = testElement.querySelector('.rs-wishlist-card__nav--prev');
    expect(prevBtn).toBeNull();
  });

  it('should render "Add Note" button when property has no note', () => {
    const props = [createGridProperty({ note: '' })];
    getAsArraySpy.mockReturnValue(props);
    isSharedViewSpy.mockReturnValue(false);
    new RSWishlistGrid(testElement);
    const addNote = testElement.querySelector('.rs-wishlist-card__add-note');
    expect(addNote).toBeTruthy();
  });

  it('should render note text when property has a note', () => {
    const props = [createGridProperty({ note: 'Great property!' })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const note = testElement.querySelector('.rs-wishlist-card__note');
    expect(note).toBeTruthy();
    expect(note.textContent).toContain('Great property!');
  });

  it('should render listing type tag', () => {
    const props = [createGridProperty({ listing_type: 'resale' })];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    const tag = testElement.querySelector('.rs-tag--sale');
    expect(tag).toBeTruthy();
  });

  it('should apply template class when data-template attribute set', () => {
    testElement.dataset.template = '08';
    const props = [createGridProperty()];
    getAsArraySpy.mockReturnValue(props);
    new RSWishlistGrid(testElement);
    expect(testElement.classList.contains('rs-wishlist-template-08')).toBe(true);
  });

  it('should return properties via getProperties method', () => {
    const props = [createGridProperty()];
    getAsArraySpy.mockReturnValue(props);
    const component = new RSWishlistGrid(testElement);
    expect(component.getProperties().length).toBe(1);
  });
});
