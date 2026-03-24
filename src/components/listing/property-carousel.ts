/**
 * RealtySoft Widget v3 - Property Carousel Component
 * Center Focus Carousel with 5 visible cards
 * Based on: https://codepen.io/andyNroses/pen/KaENLb
 *
 * IMPORTANT: This component works INDEPENDENTLY from listing/search filters.
 * It makes its own API calls and does not affect or get affected by page filters.
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  RealtySoftLabelsModule,
  Property
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAPI: RealtySoftAPIModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftLogger: { debug: (msg: string, ...args: unknown[]) => void } | undefined;

const Logger = {
  debug: (msg: string, ...args: unknown[]) => {
    if (typeof RealtySoftLogger !== 'undefined') RealtySoftLogger.debug(msg, ...args);
  }
};

interface VisibleItem {
  property: Property;
  level: number;
  index: number;
}

interface TransformOptions {
  offsetFromActive: number;
  absOffsetFromActive: number;
  isActive: boolean;
  isVisible: boolean;
}

class RSPropertyCarousel extends RSBaseComponent {
  private properties: Property[] = [];
  private active: number = 0;
  private isAnimating: boolean = false;
  private v2Initialized: boolean = false;
  private v3Initialized: boolean = false;
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private autoPlay: boolean = false;
  private autoPlayInterval: number = 5000;
  private limit: number = 10;
  private featured: boolean = false;
  private own: boolean = false;
  private ownFirst: boolean = false;
  private location: string | null = null;
  private listingType: string | null = null;
  private propertyType: string | null = null;
  private minPrice: string | null = null;
  private maxPrice: string | null = null;
  private minBeds: string | null = null;
  private track: HTMLElement | null = null;
  private itemsContainer: HTMLElement | null = null;
  private dotsContainer: HTMLElement | null = null;
  private loader: HTMLElement | null = null;
  private emptyState: HTMLElement | null = null;
  private leftArrow: HTMLElement | null = null;
  private rightArrow: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    Logger.debug('[RSPropertyCarousel] Initializing...');

    this.properties = (this.options as { properties?: Property[] }).properties || [];
    this.active = 0;
    this.isAnimating = false;
    this.v2Initialized = false;
    this.v3Initialized = false;
    this.variation = this.options.variation || this.element.dataset.rsVariation || '1';
    this.autoPlayTimer = null;
    this.touchStartX = 0;
    this.touchEndX = 0;

    // Config from data attributes
    this.autoPlay = this.element.dataset.rsAutoplay === 'true';
    this.autoPlayInterval = parseInt(this.element.dataset.rsInterval || '5000') || 5000;
    this.limit = parseInt(this.element.dataset.rsLimit || '10') || 10;

    // Filter options - carousel works INDEPENDENTLY from page filters
    this.featured = this.element.dataset.rsFeatured === 'true';
    this.own = this.element.dataset.rsOwn === 'true';
    this.ownFirst = this.element.dataset.rsOwnFirst === 'true';
    this.location = this.element.dataset.rsLocation || null;
    this.listingType = this.element.dataset.rsListingType || null;
    this.propertyType = this.element.dataset.rsPropertyType || null;
    this.minPrice = this.element.dataset.rsMinPrice || null;
    this.maxPrice = this.element.dataset.rsMaxPrice || null;
    this.minBeds = this.element.dataset.rsMinBeds || null;

    Logger.debug('[RSPropertyCarousel] Config:', {
      autoPlay: this.autoPlay,
      interval: this.autoPlayInterval,
      limit: this.limit,
      featured: this.featured,
      own: this.own,
      location: this.location,
      listingType: this.listingType,
      variation: this.variation
    });

    this.render();
    this.bindEvents();

    // Load properties if not provided
    if (this.properties.length === 0) {
      this.loadProperties();
    } else {
      this.renderItems();
      this.startAutoPlay();
    }

    // Subscribe to language changes - reload properties with translated content
    // Carousel is independent and makes its own API calls, so we need to refetch
    this.subscribe('config.language', () => {
      Logger.debug('[RSPropertyCarousel] Language changed, reloading properties...');
      // Reset and reload properties with new language
      this.properties = [];
      this.active = 0;
      this.v2Initialized = false;
      this.v3Initialized = false;
      this.stopAutoPlay();
      this.loadProperties();
    });
  }

  /**
   * Generate URL for property detail page
   * Uses central helper for multilingual URL support
   */
  private generatePropertyUrl(property: Property): string {
    // Use central helper if available (supports multilingual URLs)
    if (typeof (window as any).RealtySoftGetPropertyUrl === 'function') {
      return (window as any).RealtySoftGetPropertyUrl(property);
    }

    // Fallback for older setups
    if (property.url) return property.url;

    const pageSlug = (typeof RealtySoftState !== 'undefined' && RealtySoftState.get<string>('config.propertyPageSlug')) || 'property';
    const ref = property.ref || property.id;
    const urlFormat = (typeof RealtySoftState !== 'undefined' && RealtySoftState.get<string>('config.propertyUrlFormat')) || 'seo';

    if (urlFormat === 'query') {
      return `/${pageSlug}?ref=${ref}`;
    }

    if (urlFormat === 'ref') {
      return `/${pageSlug}/${ref}`;
    }

    const title = property.title || '';
    const titleSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);

    return `/${pageSlug}/${titleSlug}-${ref}`;
  }

  render(): void {
    this.element.classList.add('rs-property-carousel', `rs-property-carousel--v${this.variation}`);

    const prevLabel = this.label('carousel_prev') || 'Previous';
    const nextLabel = this.label('carousel_next') || 'Next';

    // V4 has special navigation panels
    if (this.variation === '4') {
      this.element.innerHTML = `
        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--left" type="button" aria-label="${prevLabel}">
          <span class="rs-property-carousel__arrow-label">Prev</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div class="rs-property-carousel__track">
          <div class="rs-property-carousel__loader">
            <div class="rs-property-carousel__spinner"></div>
            <span class="rs-property-carousel__loader-text">Loading properties...</span>
          </div>
          <div class="rs-property-carousel__empty" style="display: none;">
            <p>No properties found</p>
          </div>
          <div class="rs-property-carousel__items"></div>
        </div>

        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--right" type="button" aria-label="${nextLabel}">
          <span class="rs-property-carousel__arrow-label">Next</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      `;
    } else {
      this.element.innerHTML = `
        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--left" type="button" aria-label="${prevLabel}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="rs-property-carousel__track">
          <div class="rs-property-carousel__loader">
            <div class="rs-property-carousel__spinner"></div>
            <span class="rs-property-carousel__loader-text">Loading properties...</span>
          </div>
          <div class="rs-property-carousel__empty" style="display: none;">
            <p>No properties found</p>
          </div>
          <div class="rs-property-carousel__items"></div>
        </div>

        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--right" type="button" aria-label="${nextLabel}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <div class="rs-property-carousel__dots"></div>
      `;
    }

    this.track = this.element.querySelector('.rs-property-carousel__track');
    this.itemsContainer = this.element.querySelector('.rs-property-carousel__items');
    this.dotsContainer = this.element.querySelector('.rs-property-carousel__dots');
    this.loader = this.element.querySelector('.rs-property-carousel__loader');
    this.emptyState = this.element.querySelector('.rs-property-carousel__empty');
    this.leftArrow = this.element.querySelector('.rs-property-carousel__arrow--left');
    this.rightArrow = this.element.querySelector('.rs-property-carousel__arrow--right');

    // If properties are already loaded (e.g., after language change re-render),
    // re-render the items with updated labels
    if (this.properties.length > 0) {
      // Reset V2/V3 initialized flags so items are recreated with new labels
      this.v2Initialized = false;
      this.v3Initialized = false;
      this.hideLoader();
      this.renderItems();
    }
  }

  bindEvents(): void {
    // Arrow navigation
    this.leftArrow?.addEventListener('click', () => this.moveLeft());
    this.rightArrow?.addEventListener('click', () => this.moveRight());

    // Keyboard navigation
    this.element.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.moveLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.moveRight();
      }
    });

    // Touch swipe support
    this.track?.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.stopAutoPlay();
    }, { passive: true });

    this.track?.addEventListener('touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.startAutoPlay();
    }, { passive: true });

    // Pause autoplay on hover
    this.element.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.element.addEventListener('mouseleave', () => this.startAutoPlay());

    // Re-render on resize for responsive transforms (debounced)
    let resizeTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.properties.length > 0) {
          this.renderItems();
        }
      }, 250);
    });

    // Dot navigation (not used in V4)
    if (this.dotsContainer) {
      this.dotsContainer.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const dot = target.closest('.rs-property-carousel__dot') as HTMLElement | null;
        if (dot) {
          const index = parseInt(dot.dataset.index || '0');
          this.goToSlide(index);
        }
      });
    }

    // Click on side cards to navigate
    this.itemsContainer?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const item = target.closest('.rs-property-carousel__item') as HTMLElement | null;
      if (!item) return;

      const level = this.getItemLevel(item);

      // If clicking side cards, navigate carousel (prevent link)
      if (level === -2 || level === -1) {
        e.preventDefault();
        this.moveLeft();
      } else if (level === 1 || level === 2) {
        e.preventDefault();
        this.moveRight();
      }
      // Center card (level 0) - let the link work
    });

    // View button click delegation (replaces inline onclick)
    this.element.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const viewBtn = target.closest('[data-rs-property-url]') as HTMLElement | null;
      if (!viewBtn) return;

      const url = viewBtn.dataset.rsPropertyUrl;
      if (!url) return;

      // Try SPA navigation if router is available
      const me = e as MouseEvent;
      if (typeof (window as any).RealtySoftRouter !== 'undefined' &&
          (window as any).RealtySoftRouter.isEnabled() &&
          !me.ctrlKey && !me.metaKey && !me.shiftKey) {
        // Find the property for this URL
        const prop = this.properties.find(p => this.generatePropertyUrl(p) === url);
        if (prop) {
          e.preventDefault();
          (window as any).RealtySoftRouter.navigateToProperty(prop, url);
          return;
        }
      }

      // Fallback: standard navigation
      window.location.href = url;
    });
  }

  private getItemLevel(item: HTMLElement): number | null {
    if (item.classList.contains('rs-property-carousel__item--level-2')) return -2;
    if (item.classList.contains('rs-property-carousel__item--level-1')) return -1;
    if (item.classList.contains('rs-property-carousel__item--level0')) return 0;
    if (item.classList.contains('rs-property-carousel__item--level1')) return 1;
    if (item.classList.contains('rs-property-carousel__item--level2')) return 2;
    return null;
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.moveRight();
      } else {
        this.moveLeft();
      }
    }
  }

  private async loadProperties(): Promise<void> {
    Logger.debug('[RSPropertyCarousel] Loading properties...');
    this.showLoader();

    try {
      if (typeof RealtySoftAPI === 'undefined') {
        throw new Error('RealtySoftAPI is not available');
      }

      // Build params - these are INDEPENDENT from page filters
      const params: Record<string, unknown> = {
        per_page: this.limit,
        page: 1
      };

      // Apply carousel-specific filters
      if (this.featured) params.status = 'sale';  // API uses status=sale for featured properties
      if (this.own) params.ownonly = 1;   // Show ONLY own properties
      if (this.ownFirst) params.ownfirst = 1; // Show own properties FIRST, then others
      if (this.location) params.location_id = this.location;
      if (this.listingType) params.listing_type = this.listingType;
      if (this.propertyType) params.type_id = this.propertyType;
      if (this.minPrice) params.price_min = this.minPrice;
      if (this.maxPrice) params.price_max = this.maxPrice;
      if (this.minBeds) params.bedrooms_min = this.minBeds;

      Logger.debug('[RSPropertyCarousel] API params:', params);
      const result = await RealtySoftAPI.searchProperties(params);
      Logger.debug('[RSPropertyCarousel] API result:', result);

      if (result && result.data && result.data.length > 0) {
        this.properties = result.data;

        Logger.debug('[RSPropertyCarousel] Loaded', this.properties.length, 'properties');

        // For template 2 and 3, start at index 2 to show cards on both sides
        if ((this.variation === '2' || this.variation === '3') && this.properties.length > 4) {
          this.active = 2;
        }

        this.hideLoader();
        this.renderItems();
        this.startAutoPlay();
      } else {
        Logger.debug('[RSPropertyCarousel] No properties returned');
        this.showEmptyState();
      }
    } catch (error) {
      console.error('[RSPropertyCarousel] Failed to load properties:', error);
      this.showEmptyState('Failed to load properties');
    }
  }

  private showLoader(): void {
    if (this.loader) this.loader.style.display = 'flex';
    if (this.emptyState) this.emptyState.style.display = 'none';
    if (this.itemsContainer) this.itemsContainer.style.opacity = '0';
  }

  private hideLoader(): void {
    if (this.loader) this.loader.style.display = 'none';
    if (this.itemsContainer) this.itemsContainer.style.opacity = '1';
  }

  private showEmptyState(message?: string): void {
    if (this.loader) this.loader.style.display = 'none';
    if (this.emptyState) {
      this.emptyState.style.display = 'flex';
      if (message) {
        const p = this.emptyState.querySelector('p');
        if (p) p.textContent = message;
      }
    }
    if (this.leftArrow) this.leftArrow.style.display = 'none';
    if (this.rightArrow) this.rightArrow.style.display = 'none';
  }

  /**
   * Generate 5 visible items based on active index
   */
  private generateVisibleItems(): VisibleItem[] {
    const items: VisibleItem[] = [];
    const total = this.properties.length;

    if (total === 0) return items;

    // Handle small datasets
    if (total < 5) {
      for (let i = 0; i < total; i++) {
        const offset = i - Math.floor(total / 2);
        items.push({
          property: this.properties[i],
          level: offset,
          index: i
        });
      }
      return items;
    }

    // Generate 5 items centered on active
    for (let offset = -2; offset <= 2; offset++) {
      let index = this.active + offset;
      if (index < 0) index = total + index;
      else if (index >= total) index = index % total;

      items.push({
        property: this.properties[index],
        level: offset,
        index
      });
    }

    return items;
  }

  private renderItems(): void {
    // For template 2, 3, and 4, we render all items with transforms
    if (this.variation === '2') {
      this.renderItemsV2();
      return;
    }

    if (this.variation === '3') {
      this.renderItemsV3();
      return;
    }

    if (this.variation === '4') {
      this.renderItemsV4();
      return;
    }

    if (this.variation === '5') {
      this.renderItemsV5();
      return;
    }

    if (this.variation === '6') {
      this.renderItemsV6();
      return;
    }

    Logger.debug('[RSPropertyCarousel] Rendering V1 with', this.properties.length, 'items, active:', this.active);

    if (this.properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // Generate visible items and render
    const visibleItems = this.generateVisibleItems();
    if (this.itemsContainer) this.itemsContainer.innerHTML = '';

    visibleItems.forEach(({ property, level, index }) => {
      const item = this.createCarouselItem(property, level, index);
      this.itemsContainer?.appendChild(item);
    });

    this.renderDots();

    if (this.leftArrow) this.leftArrow.style.display = 'flex';
    if (this.rightArrow) this.rightArrow.style.display = 'flex';
  }

  /**
   * Render items for Template 2 (3D Perspective)
   * Applies 3D transforms directly via inline styles
   */
  private renderItemsV2(): void {
    const maxVisibility = 3;
    Logger.debug('[RSPropertyCarousel] Rendering V2 with', this.properties.length, 'items, active:', this.active);

    if (this.properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // First render - create all items
    if (!this.v2Initialized && this.itemsContainer) {
      this.itemsContainer.innerHTML = '';
      this.properties.forEach((property, index) => {
        const item = this.createCarouselItemV2(property, index);
        this.itemsContainer?.appendChild(item);
      });
      this.v2Initialized = true;
    }

    // Update transforms for all items
    const items = this.itemsContainer?.querySelectorAll('.rs-property-carousel__item') || [];
    const total = this.properties.length;

    items.forEach((item, index) => {
      let offsetFromActive = this.active - index;

      // Wrap offset for infinite looping
      if (offsetFromActive > total / 2) {
        offsetFromActive -= total;
      } else if (offsetFromActive < -total / 2) {
        offsetFromActive += total;
      }

      const absOffsetFromActive = Math.abs(offsetFromActive);
      const isActive = offsetFromActive === 0;
      const isVisible = absOffsetFromActive < maxVisibility;

      this.updateCarouselItemV2Transform(item as HTMLElement, {
        offsetFromActive,
        absOffsetFromActive,
        isActive,
        isVisible
      });
    });

    this.renderDots();

    if (this.leftArrow) this.leftArrow.style.display = 'flex';
    if (this.rightArrow) this.rightArrow.style.display = 'flex';
  }

  private createCarouselItemV2(property: Property, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'rs-property-carousel__item';
    item.dataset.index = String(index);

    const propertyUrl = this.generatePropertyUrl(property);
    const mainImage = property.images?.[0] || '/realtysoft/assets/placeholder.jpg';

    let price = '';
    if (typeof RealtySoftLabels !== 'undefined' && RealtySoftLabels.formatPrice) {
      price = RealtySoftLabels.formatPrice(property.price);
    } else {
      price = property.price ? `€${property.price.toLocaleString()}` : '';
    }

    const bedIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`;

    const bathIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;

    let specsHtml = '';
    if (property.beds && property.beds > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bedIcon} ${property.beds}</span>`;
    }
    if (property.baths && property.baths > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bathIcon} ${property.baths}</span>`;
    }

    const viewLabel = this.label('card_view') || 'View Details';

    item.innerHTML = `
      <a href="${propertyUrl}" class="rs-property-carousel__card">
        <img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(property.title || '')}</h3>
          ${specsHtml ? `<div class="rs-property-carousel__card-specs">${specsHtml}</div>` : ''}
          <p class="rs-property-carousel__card-price">${price}</p>
          <span class="rs-property-carousel__card-link">${viewLabel} &rarr;</span>
        </div>
      </a>
    `;

    return item;
  }

  private updateCarouselItemV2Transform(item: HTMLElement, { offsetFromActive, absOffsetFromActive, isActive, isVisible }: TransformOptions): void {
    // Get responsive values based on screen width
    const screenWidth = window.innerWidth;
    let translateXMultiplier = 120;
    let translateZMultiplier = -100;
    let rotateMultiplier = -15;
    let blurMultiplier = 4;

    if (screenWidth <= 400) {
      translateXMultiplier = 70;
      translateZMultiplier = -60;
      rotateMultiplier = -10;
      blurMultiplier = 3;
    } else if (screenWidth <= 600) {
      translateXMultiplier = 90;
      translateZMultiplier = -80;
      rotateMultiplier = -12;
      blurMultiplier = 3;
    } else if (screenWidth <= 900) {
      translateXMultiplier = 100;
      translateZMultiplier = -90;
      rotateMultiplier = -12;
    }

    // Calculate 3D transform values
    const rotateY = offsetFromActive * rotateMultiplier;
    const scale = isActive ? 1 : Math.max(0.7, 1 - absOffsetFromActive * 0.15);
    const translateZ = absOffsetFromActive * translateZMultiplier;
    const translateX = offsetFromActive * translateXMultiplier;
    const blur = isActive ? 0 : Math.min(absOffsetFromActive * blurMultiplier, 10);

    // Apply transforms - CSS will animate these
    item.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
    item.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
    item.style.pointerEvents = isActive ? 'auto' : 'none';
    item.style.zIndex = String(10 - absOffsetFromActive);
    item.style.opacity = isVisible ? (isActive ? '1' : '0.95') : '0';

    // Update overlay opacity
    const overlay = item.querySelector('.rs-property-carousel__card-overlay') as HTMLElement | null;
    if (overlay) {
      overlay.style.opacity = isActive ? '1' : '0';
    }
  }

  /**
   * Render items for Template 3 (Coverflow)
   * Cards rotate to face center, with faded/greyscale effect on sides
   */
  private renderItemsV3(): void {
    const maxVisibility = 3;
    Logger.debug('[RSPropertyCarousel] Rendering V3 with', this.properties.length, 'items, active:', this.active);

    if (this.properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // First render - create all items
    if (!this.v3Initialized && this.itemsContainer) {
      this.itemsContainer.innerHTML = '';
      this.properties.forEach((property, index) => {
        const item = this.createCarouselItemV3(property, index);
        this.itemsContainer?.appendChild(item);
      });
      this.v3Initialized = true;
    }

    // Update transforms for all items
    const items = this.itemsContainer?.querySelectorAll('.rs-property-carousel__item') || [];
    const total = this.properties.length;

    items.forEach((item, index) => {
      let offsetFromActive = this.active - index;

      // Wrap offset for infinite looping
      if (offsetFromActive > total / 2) {
        offsetFromActive -= total;
      } else if (offsetFromActive < -total / 2) {
        offsetFromActive += total;
      }

      const absOffsetFromActive = Math.abs(offsetFromActive);
      const isActive = offsetFromActive === 0;
      const isVisible = absOffsetFromActive < maxVisibility;

      this.updateCarouselItemV3Transform(item as HTMLElement, {
        offsetFromActive,
        absOffsetFromActive,
        isActive,
        isVisible
      });
    });

    this.renderDots();

    if (this.leftArrow) this.leftArrow.style.display = 'flex';
    if (this.rightArrow) this.rightArrow.style.display = 'flex';
  }

  private createCarouselItemV3(property: Property, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'rs-property-carousel__item';
    item.dataset.index = String(index);

    const propertyUrl = this.generatePropertyUrl(property);
    const mainImage = property.images?.[0] || '/realtysoft/assets/placeholder.jpg';

    let price = '';
    if (typeof RealtySoftLabels !== 'undefined' && RealtySoftLabels.formatPrice) {
      price = RealtySoftLabels.formatPrice(property.price);
    } else {
      price = property.price ? `€${property.price.toLocaleString()}` : '';
    }

    const bedIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`;

    const bathIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;

    let specsHtml = '';
    if (property.beds && property.beds > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bedIcon} ${property.beds}</span>`;
    }
    if (property.baths && property.baths > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bathIcon} ${property.baths}</span>`;
    }

    const viewLabel = this.label('card_view') || 'View Details';

    item.innerHTML = `
      <a href="${propertyUrl}" class="rs-property-carousel__card">
        <img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(property.title || '')}</h3>
          ${specsHtml ? `<div class="rs-property-carousel__card-specs">${specsHtml}</div>` : ''}
          <p class="rs-property-carousel__card-price">${price}</p>
          <span class="rs-property-carousel__card-link">${viewLabel} &rarr;</span>
        </div>
      </a>
    `;

    return item;
  }

  private updateCarouselItemV3Transform(item: HTMLElement, { offsetFromActive, absOffsetFromActive, isActive, isVisible }: TransformOptions): void {
    // Get responsive values based on screen width
    const screenWidth = window.innerWidth;
    let translateXMultiplier = 240;
    let rotateMultiplier = 45;
    let scaleBase = 0.85;
    let zDepth = 100;

    if (screenWidth <= 400) {
      translateXMultiplier = 120;
      rotateMultiplier = 40;
      scaleBase = 0.8;
      zDepth = 60;
    } else if (screenWidth <= 600) {
      translateXMultiplier = 160;
      rotateMultiplier = 42;
      scaleBase = 0.82;
      zDepth = 80;
    } else if (screenWidth <= 900) {
      translateXMultiplier = 200;
      rotateMultiplier = 44;
      scaleBase = 0.83;
      zDepth = 90;
    }

    // Calculate transforms - cards rotate INWARD to face center
    const rotateY = isActive ? 0 : (offsetFromActive > 0 ? rotateMultiplier : -rotateMultiplier);
    const scale = isActive ? 1 : Math.max(0.7, scaleBase - absOffsetFromActive * 0.05);
    const translateX = -offsetFromActive * translateXMultiplier;
    const translateZ = isActive ? 100 : -zDepth * absOffsetFromActive;

    // Greyscale/saturation effect for side cards
    const saturation = isActive ? 100 : Math.max(20, 100 - absOffsetFromActive * 35);
    const brightness = isActive ? 100 : Math.max(70, 100 - absOffsetFromActive * 12);

    // On mobile (600px and below), only show center card
    const mobileOnly = screenWidth <= 600;
    const shouldShow = mobileOnly ? isActive : isVisible;

    // Apply transforms
    item.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
    item.style.filter = isActive ? 'none' : `saturate(${saturation}%) brightness(${brightness}%)`;
    item.style.pointerEvents = isActive ? 'auto' : 'none';
    item.style.zIndex = String(10 - absOffsetFromActive);
    item.style.opacity = shouldShow ? '1' : '0';

    // Update overlay opacity
    const overlay = item.querySelector('.rs-property-carousel__card-overlay') as HTMLElement | null;
    if (overlay) {
      overlay.style.opacity = isActive ? '1' : '0';
    }
  }

  /**
   * Render items for Template 4 (Fullwidth Image with Side Navigation)
   */
  private renderItemsV4(): void {
    Logger.debug('[RSPropertyCarousel] Rendering V4 with', this.properties.length, 'items, active:', this.active);

    if (this.properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // Render current active item only
    const property = this.properties[this.active];
    if (this.itemsContainer) this.itemsContainer.innerHTML = '';

    const item = this.createCarouselItemV4(property, this.active);
    this.itemsContainer?.appendChild(item);

    // Update page counter
    this.updatePageCounter();

    // Show custom navigation
    if (this.leftArrow) this.leftArrow.style.display = 'flex';
    if (this.rightArrow) this.rightArrow.style.display = 'flex';
  }

  private createCarouselItemV4(property: Property, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'rs-property-carousel__item';
    item.dataset.index = String(index);

    const propertyUrl = this.generatePropertyUrl(property);
    const mainImage = property.images?.[0] || '/realtysoft/assets/placeholder.jpg';

    let price = '';
    if (typeof RealtySoftLabels !== 'undefined' && RealtySoftLabels.formatPrice) {
      price = RealtySoftLabels.formatPrice(property.price);
    } else {
      price = property.price ? `€${property.price.toLocaleString()}` : '';
    }

    const bedIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`;

    const bathIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;

    let specsHtml = '';
    if (property.beds && property.beds > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bedIcon} ${property.beds}</span>`;
    }
    if (property.baths && property.baths > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bathIcon} ${property.baths}</span>`;
    }

    const viewLabel = this.label('card_view') || 'View Details';

    item.innerHTML = `
      <a href="${propertyUrl}" class="rs-property-carousel__card">
        <img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(property.title || '')}</h3>
          ${specsHtml ? `<div class="rs-property-carousel__card-specs">${specsHtml}</div>` : ''}
          <p class="rs-property-carousel__card-price">${price}</p>
          <span class="rs-property-carousel__card-link">${viewLabel} &rarr;</span>
        </div>
      </a>
    `;

    return item;
  }

  private updatePageCounter(): void {
    if (this.variation !== '4') return;

    let counter = this.element.querySelector('.rs-property-carousel__counter') as HTMLElement | null;
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'rs-property-carousel__counter';
      this.element.appendChild(counter);
    }
    counter.innerHTML = `<span class="rs-property-carousel__counter-current">${this.active + 1}</span>/<span class="rs-property-carousel__counter-total">${this.properties.length}</span>`;
  }

  /**
   * Render items for Template 5 (Tilted/Skewed Images)
   */
  private renderItemsV5(): void {
    Logger.debug('[RSPropertyCarousel] Rendering V5 with', this.properties.length, 'items, active:', this.active);

    if (this.properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // Show 3 items at a time
    if (this.itemsContainer) this.itemsContainer.innerHTML = '';
    const visibleCount = Math.min(3, this.properties.length);

    for (let i = 0; i < visibleCount; i++) {
      const index = (this.active + i) % this.properties.length;
      const property = this.properties[index];
      const item = this.createCarouselItemV5(property, index);
      this.itemsContainer?.appendChild(item);
    }

    if (this.leftArrow) this.leftArrow.style.display = 'flex';
    if (this.rightArrow) this.rightArrow.style.display = 'flex';
  }

  private createCarouselItemV5(property: Property, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'rs-property-carousel__item';
    item.dataset.index = String(index);

    const propertyUrl = this.generatePropertyUrl(property);
    const mainImage = property.images?.[0] || '/realtysoft/assets/placeholder.jpg';

    let price = '';
    if (typeof RealtySoftLabels !== 'undefined' && RealtySoftLabels.formatPrice) {
      price = RealtySoftLabels.formatPrice(property.price);
    } else {
      price = property.price ? `€${property.price.toLocaleString()}` : '';
    }

    const bedIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`;

    const bathIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;

    let specsHtml = '';
    if (property.beds && property.beds > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bedIcon} ${property.beds}</span>`;
    }
    if (property.baths && property.baths > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bathIcon} ${property.baths}</span>`;
    }

    const viewLabel = this.label('card_view') || 'View Details';

    item.innerHTML = `
      <a href="${propertyUrl}" class="rs-property-carousel__card">
        <div class="rs-property-carousel__card-inner">
          <img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" class="rs-property-carousel__card-image" loading="lazy">
          <div class="rs-property-carousel__card-overlay">
            <h3 class="rs-property-carousel__card-title">${this.escapeHtml(property.title || '')}</h3>
            ${specsHtml ? `<div class="rs-property-carousel__card-specs">${specsHtml}</div>` : ''}
            <p class="rs-property-carousel__card-price">${price}</p>
            <span class="rs-property-carousel__card-link">${viewLabel} &rarr;</span>
          </div>
        </div>
      </a>
    `;

    return item;
  }

  /**
   * Render items for Template 6 (Dark Cards with Numbers)
   */
  private renderItemsV6(): void {
    Logger.debug('[RSPropertyCarousel] Rendering V6 with', this.properties.length, 'items, active:', this.active);

    if (this.properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // Show 3 items at a time
    if (this.itemsContainer) this.itemsContainer.innerHTML = '';
    const visibleCount = Math.min(3, this.properties.length);

    for (let i = 0; i < visibleCount; i++) {
      const index = (this.active + i) % this.properties.length;
      const property = this.properties[index];
      const isFirst = i === 0;
      const displayNumber = String(index + 1).padStart(2, '0');
      const item = this.createCarouselItemV6(property, index, displayNumber, isFirst);
      this.itemsContainer?.appendChild(item);
    }

    if (this.leftArrow) this.leftArrow.style.display = 'flex';
    if (this.rightArrow) this.rightArrow.style.display = 'flex';
  }

  private createCarouselItemV6(property: Property, index: number, displayNumber: string, isActive: boolean): HTMLElement {
    const item = document.createElement('div');
    item.className = `rs-property-carousel__item ${isActive ? 'rs-property-carousel__item--active' : ''}`;
    item.dataset.index = String(index);

    const propertyUrl = this.generatePropertyUrl(property);
    const mainImage = property.images?.[0] || '/realtysoft/assets/placeholder.jpg';

    let price = '';
    if (typeof RealtySoftLabels !== 'undefined' && RealtySoftLabels.formatPrice) {
      price = RealtySoftLabels.formatPrice(property.price);
    } else {
      price = property.price ? `€${property.price.toLocaleString()}` : '';
    }

    // Get location - try multiple possible fields
    const location = (property.location as { name?: string })?.name || property.location || '';

    const bedIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`;

    const bathIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;

    let specsHtml = '';
    if (property.beds && property.beds > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bedIcon} ${property.beds} Beds</span>`;
    }
    if (property.baths && property.baths > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bathIcon} ${property.baths} Bath</span>`;
    }

    const propertyType = property.type || 'Apartment';
    const viewDetailLabel = this.label('view_details') || 'View Details';

    item.innerHTML = `
      <span class="rs-property-carousel__card-number">${displayNumber}</span>
      <p class="rs-property-carousel__card-type">${this.escapeHtml(propertyType)}</p>
      ${location ? `<p class="rs-property-carousel__card-location">${this.escapeHtml(String(location))}</p>` : ''}
      <a href="${propertyUrl}" class="rs-property-carousel__card">
        <div class="rs-property-carousel__card-image-wrapper">
          <img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" class="rs-property-carousel__card-image" loading="lazy">
          ${property.is_featured ? '<span class="rs-property-carousel__card-badge">POPULAR</span>' : ''}
        </div>
      </a>
      <div class="rs-property-carousel__card-info">
        <p class="rs-property-carousel__card-price">${price}</p>
        ${specsHtml ? `<div class="rs-property-carousel__card-specs">${specsHtml}</div>` : ''}
      </div>
      <button class="rs-property-carousel__card-view-btn" data-rs-property-url="${propertyUrl}">${viewDetailLabel}</button>
    `;

    return item;
  }

  private createCarouselItem(property: Property, level: number, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = `rs-property-carousel__item rs-property-carousel__item--level${level < 0 ? level : (level > 0 ? level : '0')}`;
    item.dataset.index = String(index);
    item.dataset.level = String(level);

    const propertyUrl = this.generatePropertyUrl(property);
    const mainImage = property.images?.[0] || '/realtysoft/assets/placeholder.jpg';

    let price = '';
    if (typeof RealtySoftLabels !== 'undefined' && RealtySoftLabels.formatPrice) {
      price = RealtySoftLabels.formatPrice(property.price);
    } else {
      price = property.price ? `€${property.price.toLocaleString()}` : '';
    }

    const bedIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`;

    const bathIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;

    let specsHtml = '';
    if (property.beds && property.beds > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bedIcon} ${property.beds}</span>`;
    }
    if (property.baths && property.baths > 0) {
      specsHtml += `<span class="rs-property-carousel__card-spec">${bathIcon} ${property.baths}</span>`;
    }

    const viewLabel = this.label('card_view') || 'View Details';

    item.innerHTML = `
      <a href="${propertyUrl}" class="rs-property-carousel__card">
        <img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(property.title || '')}</h3>
          ${specsHtml ? `<div class="rs-property-carousel__card-specs">${specsHtml}</div>` : ''}
          <p class="rs-property-carousel__card-price">${price}</p>
          <span class="rs-property-carousel__card-link">${viewLabel} &rarr;</span>
        </div>
      </a>
    `;

    return item;
  }

  private renderDots(): void {
    if (!this.dotsContainer) return;

    if (this.properties.length <= 1) {
      this.dotsContainer.style.display = 'none';
      return;
    }

    this.dotsContainer.style.display = 'flex';
    this.dotsContainer.innerHTML = '';

    this.properties.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `rs-property-carousel__dot ${index === this.active ? 'rs-property-carousel__dot--active' : ''}`;
      dot.dataset.index = String(index);
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      this.dotsContainer?.appendChild(dot);
    });
  }

  private updateDots(): void {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll('.rs-property-carousel__dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('rs-property-carousel__dot--active', index === this.active);
    });
  }

  private moveLeft(): void {
    if (this.properties.length <= 1 || this.isAnimating) return;

    this.isAnimating = true;
    this.active = this.active - 1 < 0 ? this.properties.length - 1 : this.active - 1;

    // Simple re-render - CSS transitions handle the animation
    this.renderItems();
    this.updateDots();

    // Debounce to prevent rapid clicking
    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  private moveRight(): void {
    if (this.properties.length <= 1 || this.isAnimating) return;

    this.isAnimating = true;
    this.active = (this.active + 1) % this.properties.length;

    // Simple re-render - CSS transitions handle the animation
    this.renderItems();
    this.updateDots();

    // Debounce to prevent rapid clicking
    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  private goToSlide(index: number): void {
    if (index === this.active || index < 0 || index >= this.properties.length || this.isAnimating) return;

    this.isAnimating = true;
    this.active = index;

    this.renderItems();
    this.updateDots();

    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  private startAutoPlay(): void {
    if (!this.autoPlay || this.properties.length <= 1) return;

    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.moveRight();
    }, this.autoPlayInterval);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy(): void {
    this.stopAutoPlay();
    super.destroy();
  }
}

// Register component
RealtySoft.registerComponent('rs_property_carousel', RSPropertyCarousel as unknown as ComponentConstructor);

export { RSPropertyCarousel };
export default RSPropertyCarousel;
