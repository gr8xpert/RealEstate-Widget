/**
 * RealtySoft Widget v3 - Property Grid Component
 * Displays property cards in grid or list layout
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftAPIModule,
  RealtySoftLabelsModule,
  RealtySoftAnalyticsModule,
  Property,
  ImageWithSizes
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftAPI: RealtySoftAPIModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;

// Declare external managers
declare const WishlistManager: {
  has: (refNo: string | number) => boolean;
  add: (property: Record<string, unknown>) => boolean;
  remove: (refNo: string | number) => void;
} | undefined;

declare const RealtySoftToast: {
  success: (message: string) => void;
  error: (message: string) => void;
} | undefined;

declare const RealtySoftRouter: {
  isEnabled: () => boolean;
  navigateToProperty: (property: import('../../types/index').Property, url: string) => void;
} | undefined;

class RSPropertyGrid extends RSBaseComponent {
  private properties: Property[] = [];
  private view: string = 'grid';
  private loading: boolean = false;
  private isStandalone: boolean = false;
  private cardTemplate: HTMLElement | null = null;
  private imageObserver: IntersectionObserver | null = null;
  private prefetchedIds: Set<string | number> = new Set();
  private container: HTMLElement | null = null;
  private loader: HTMLElement | null = null;
  private empty: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.properties = [];
    this.view = RealtySoftState.get<string>('ui.view') || 'grid';
    this.loading = false;
    this.cardTemplate = this.extractCardTemplate();
    this.imageObserver = null;
    this.prefetchedIds = new Set();

    // Check if parent listing container is standalone (independent data, no global filter interaction)
    const listingParent = this.element.closest('#rs_listing, [class*="rs-listing-template-"]');
    this.isStandalone = !!listingParent?.hasAttribute('data-rs-standalone');

    // Set up IntersectionObserver for lazy loading images
    this.setupImageObserver();

    this.render();
    this.bindEvents();

    // Subscribe to results changes (skip for standalone — data injected via setStandaloneProperties)
    if (!this.isStandalone) {
      this.subscribe<Property[]>('results.properties', (properties) => {
        this.properties = properties || [];
        this.renderProperties();
      });
    }

    // Subscribe to view changes
    this.subscribe<string>('ui.view', (view) => {
      this.view = view;
      this.updateViewClass();
    });

    // Subscribe to loading state
    this.subscribe<boolean>('ui.loading', (loading) => {
      this.loading = loading;
      this.updateLoadingState();
    });

    // Subscribe to language changes - ensure re-render with translated content
    // Note: Properties will be refetched by controller's setLanguage(), this ensures
    // any label-based rendering is updated when new properties arrive
    this.subscribe('config.language', () => {
      if (this.properties.length > 0) {
        this.renderProperties();
      }
    });

    // Note: Initial search is triggered by the controller after all components init
  }

  /**
   * Inject properties directly (used by standalone listings).
   * Bypasses global results state — the grid shows only these properties.
   */
  public setStandaloneProperties(properties: Property[]): void {
    this.properties = properties;
    this.renderProperties();
  }

  private extractCardTemplate(): HTMLElement | null {
    // Check if there's a custom card template inside
    const customCard = this.element.querySelector('.rs_card');
    console.log('[RSPropertyGrid] extractCardTemplate - element:', this.element.className);
    console.log('[RSPropertyGrid] extractCardTemplate - found .rs_card:', !!customCard);
    if (customCard) {
      console.log('[RSPropertyGrid] extractCardTemplate - card classes:', customCard.className);
      const template = customCard.cloneNode(true) as HTMLElement;
      customCard.remove();
      return template;
    }
    return null;
  }

  /**
   * Generate URL for property detail page
   * Stays on client's website with SEO-friendly format
   * Format: /{propertyPageSlug}/{title-slug}-{REFERENCE}
   */
  private generatePropertyUrl(property: Property): string {
    // If property already has a URL, use it
    if (property.url) return property.url;

    // Get config from state
    const pageSlug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';
    const ref = property.ref || property.id;
    const urlFormat = RealtySoftState.get<string>('config.propertyUrlFormat') || 'seo';

    if (urlFormat === 'query') {
      // /property?ref=V12345
      return `/${pageSlug}?ref=${ref}`;
    }

    if (urlFormat === 'ref') {
      // /property/V12345
      return `/${pageSlug}/${ref}`;
    }

    // Default 'seo': /property/luxury-villa-marbella-V12345
    const title = property.title || '';
    const titleSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .substring(0, 80); // Limit length

    return `/${pageSlug}/${titleSlug}-${ref}`;
  }

  render(): void {
    this.element.classList.add('rs-property-grid', `rs-property-grid--${this.view}`);

    // Check for columns setting from element or parent container
    const columns = this.element.dataset.rsColumns ||
                    this.element.closest('[data-rs-columns]')?.getAttribute('data-rs-columns');
    if (columns && ['1', '2', '3', '4'].includes(columns)) {
      this.element.classList.add(`rs-property-grid--cols-${columns}`);
    }

    this.element.innerHTML = `
      <div class="rs-property-grid__container">
        <div class="rs-property-grid__loader" style="display: none;">
          <div class="rs-property-grid__spinner"></div>
          <span>${this.label('results_loading')}</span>
        </div>
        <div class="rs-property-grid__empty" style="display: none;">
          <p>${this.label('results_count_zero')}</p>
        </div>
        <div class="rs-property-grid__items"></div>
      </div>
    `;

    this.container = this.element.querySelector('.rs-property-grid__items');
    this.loader = this.element.querySelector('.rs-property-grid__loader');
    this.empty = this.element.querySelector('.rs-property-grid__empty');

    // Re-render existing properties if we have them (e.g., after language change)
    if (this.properties.length > 0) {
      this.renderProperties();
    }
  }

  bindEvents(): void {
    if (!this.container) return;

    // Prefetch on hover for instant detail page loading
    let prefetchTimeout: ReturnType<typeof setTimeout>;
    this.container.addEventListener('mouseenter', (e: Event) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.rs-card') as HTMLElement | null;
      if (!card) return;

      const propertyId = card.dataset.propertyId;
      const property = this.properties.find(p => String(p.id) === propertyId);
      if (!property) return;

      // Debounce prefetch to avoid too many requests on fast mouse movements
      clearTimeout(prefetchTimeout);
      prefetchTimeout = setTimeout(() => {
        // Prefetch by ref if available (more reliable), otherwise by ID
        if (property.ref) {
          RealtySoftAPI.prefetchProperty(property.ref, true);
        } else if (propertyId) {
          RealtySoftAPI.prefetchProperty(propertyId, false);
        }
      }, 100); // 100ms delay to avoid prefetching on quick hovers
    }, true);

    this.container.addEventListener('mouseleave', (e: Event) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.rs-card');
      if (card) {
        clearTimeout(prefetchTimeout);
      }
    }, true);

    // Card click events are delegated
    this.container.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.rs-card') as HTMLElement | null;
      if (!card) return;

      const propertyId = card.dataset.propertyId;
      const property = this.properties.find(p => String(p.id) === propertyId);

      // Check if clicked on wishlist button
      if (target.closest('.rs_card_wishlist')) {
        e.preventDefault();
        e.stopPropagation();
        const totalImages = parseInt(card.dataset.totalImages || '0') || 0;
        const wishlistBtn = target.closest('.rs_card_wishlist') as HTMLElement;
        if (propertyId) {
          this.toggleWishlist(propertyId, wishlistBtn, totalImages);
        }
        return;
      }

      // Check if clicked on a link
      if (target.closest('.rs_card_link')) {
        if (property) {
          RealtySoftAnalytics.trackCardClick(property);

          // SPA navigation: intercept if router is enabled and no modifier keys
          const mouseEvent = e as MouseEvent;
          if (typeof RealtySoftRouter !== 'undefined' && RealtySoftRouter.isEnabled() &&
              !mouseEvent.ctrlKey && !mouseEvent.metaKey && !mouseEvent.shiftKey) {
            e.preventDefault();
            const url = this.generatePropertyUrl(property);
            RealtySoftRouter.navigateToProperty(property, url);
          }
        }
        return;
      }

      // Track card click
      if (property) {
        RealtySoftAnalytics.trackCardClick(property);
      }
    });
  }

  /**
   * Set up IntersectionObserver for lazy loading images
   * This is more efficient than native loading="lazy" for carousel images
   */
  private setupImageObserver(): void {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      console.log('[RSPropertyGrid] IntersectionObserver not supported, using fallback');
      return;
    }

    // Clean up existing observer
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }

    // Create observer for lazy loading images
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;

          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            delete img.dataset.srcset;
          }
          if (img.dataset.sizes) {
            img.sizes = img.dataset.sizes;
            delete img.dataset.sizes;
          }

          // Stop observing once loaded
          this.imageObserver?.unobserve(img);
        }
      });
    }, {
      // Start loading when image is 200px from viewport
      rootMargin: '200px 0px',
      threshold: 0.01
    });
  }

  /**
   * Observe images for lazy loading
   */
  private observeImages(): void {
    if (!this.imageObserver || !this.container) return;

    // Find all images with data-src (lazy load candidates)
    const lazyImages = this.container.querySelectorAll<HTMLImageElement>('img[data-src]');
    lazyImages.forEach(img => {
      this.imageObserver?.observe(img);
    });
  }

  private renderProperties(): void {
    if (!this.container) return;
    this.container.innerHTML = '';

    if (this.properties.length === 0) {
      if (this.empty) this.empty.style.display = 'block';
      return;
    }

    if (this.empty) this.empty.style.display = 'none';

    // Add preload hint for LCP image (first image of first property)
    this.addLcpPreloadHint();

    this.properties.forEach(property => {
      const card = this.createCard(property);
      this.container?.appendChild(card);
    });

    // Set up lazy loading observer for images
    this.observeImages();
  }

  /**
   * Add preload link for LCP (Largest Contentful Paint) image
   * Helps browser prioritize loading the first visible image
   */
  private addLcpPreloadHint(): void {
    // Remove any existing preload hint we added
    const existingPreload = document.head.querySelector('link[data-rs-lcp-preload]');
    if (existingPreload) {
      existingPreload.remove();
    }

    // Get first property's first image
    if (this.properties.length === 0) return;
    const firstProperty = this.properties[0];
    const firstImage = firstProperty.images?.[0];
    if (!firstImage) return;

    // Create preload link
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = firstImage;
    (preload as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = 'high';
    preload.dataset.rsLcpPreload = 'true';

    // Add responsive srcset to preload if available
    const imagesWithSizes = (firstProperty as Property & { imagesWithSizes?: ImageWithSizes[] }).imagesWithSizes;
    const imgWithSizes = imagesWithSizes?.[0];
    if (imgWithSizes?.sizes) {
      const srcsetParts: string[] = [];
      if (imgWithSizes.sizes[256]) srcsetParts.push(`${imgWithSizes.sizes[256]} 256w`);
      if (imgWithSizes.sizes[512]) srcsetParts.push(`${imgWithSizes.sizes[512]} 512w`);
      if (imgWithSizes.sizes[768]) srcsetParts.push(`${imgWithSizes.sizes[768]} 768w`);
      if (srcsetParts.length > 0) {
        (preload as HTMLLinkElement & { imageSrcset?: string; imageSizes?: string }).imageSrcset = srcsetParts.join(', ');
        (preload as HTMLLinkElement & { imageSrcset?: string; imageSizes?: string }).imageSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
      }
    }

    document.head.appendChild(preload);
  }

  private createCard(property: Property): HTMLElement {
    console.log('[RSPropertyGrid] createCard - has cardTemplate:', !!this.cardTemplate);
    if (this.cardTemplate) {
      console.log('[RSPropertyGrid] createCard - using CUSTOM card template');
      return this.createCustomCard(property);
    }
    console.log('[RSPropertyGrid] createCard - using DEFAULT card');
    return this.createDefaultCard(property);
  }

  private createDefaultCard(property: Property): HTMLElement {
    const card = document.createElement('div');
    card.className = 'rs-card';
    card.dataset.propertyId = String(property.id);

    // Generate SEO-friendly URL
    const propertyUrl = this.generatePropertyUrl(property);

    // Limit images to 5 for performance
    const allImages = property.images || [];
    const images = allImages.slice(0, 5);
    const imagesWithSizes = ((property as Property & { imagesWithSizes?: ImageWithSizes[] }).imagesWithSizes || []).slice(0, 5);
    const totalImageCount = property.total_images || allImages.length;
    card.dataset.totalImages = String(totalImageCount);
    const mainImage = images[0] || '/realtysoft/assets/placeholder.jpg';
    const price = RealtySoftLabels.formatPrice(property.price);
    // Check wishlist using WishlistManager (ref) with fallback to RealtySoftState (id)
    const refNo = property.ref || property.id;
    const isInWishlist = (typeof WishlistManager !== 'undefined' && WishlistManager?.has(refNo)) || RealtySoftState.isInWishlist(property.id);

    // Build property tags (listing type, featured, own)
    const tags = this.buildPropertyTags(property);

    // Build image section - always use carousel placeholder if images exist
    const imageContent = images.length > 0
      ? '<div class="rs-card__carousel-placeholder"></div>'
      : `<img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" class="rs-card__image" loading="eager" fetchpriority="high">`;

    // Image counter
    const imageCounter = totalImageCount > 0 ? `
      <div class="rs-card__image-count">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span>${totalImageCount}</span>
      </div>
    ` : '';

    card.innerHTML = `
      <a href="${propertyUrl}" class="rs-card__image-link rs_card_link">
        <div class="rs-card__image-wrapper">
          ${imageContent}
          ${tags}
          ${imageCounter}
        </div>
      </a>
      <button class="rs-card__wishlist rs_card_wishlist ${isInWishlist ? 'rs-card__wishlist--active' : ''}" type="button" aria-label="${this.label('wishlist_add')}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <div class="rs-card__content">
        <a href="${propertyUrl}" class="rs-card__price-link rs_card_link">
          <div class="rs-card__price rs_card_price">${price}</div>
        </a>
        <a href="${propertyUrl}" class="rs-card__title-link rs_card_link">
          <h3 class="rs-card__title rs_card_title">${this.escapeHtml(property.title || '')}</h3>
        </a>
        <div class="rs-card__location rs_card_location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${this.escapeHtml(String(property.location || ''))}
        </div>
        <div class="rs-card__specs">
          ${property.beds && property.beds > 0 ? `
            <span class="rs-card__spec rs_card_beds">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 4v16"></path>
                <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                <path d="M2 17h20"></path>
                <path d="M6 8v9"></path>
              </svg>
              ${property.beds} ${property.beds === 1 ? this.label('card_bed') : this.label('card_beds')}
            </span>
          ` : ''}
          ${property.baths && property.baths > 0 ? `
            <span class="rs-card__spec rs_card_baths">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                <line x1="10" x2="8" y1="5" y2="7"></line>
                <line x1="2" x2="22" y1="12" y2="12"></line>
                <line x1="7" x2="7" y1="19" y2="21"></line>
                <line x1="17" x2="17" y1="19" y2="21"></line>
              </svg>
              ${property.baths} ${property.baths === 1 ? this.label('card_bath') : this.label('card_baths')}
            </span>
          ` : ''}
          ${property.built_area && property.built_area > 0 ? `
            <span class="rs-card__spec rs_card_built">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              ${property.built_area} ${this.label('card_built')}
            </span>
          ` : ''}
          ${property.plot_size && property.plot_size > 0 ? `
            <span class="rs-card__spec rs_card_plot">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                <path d="M12 2v20"></path>
                <path d="M3 6l9 4 9-4"></path>
              </svg>
              ${property.plot_size} ${this.label('card_plot')}
            </span>
          ` : ''}
        </div>
        <div class="rs-card__footer">
          <span class="rs-card__ref rs_card_ref">${this.label('card_ref')} ${this.escapeHtml(property.ref || '')}</span>
          <a href="${propertyUrl}" class="rs-card__link rs_card_link">${this.label('card_view')}</a>
        </div>
      </div>
    `;

    // Insert carousel if images exist (replaces placeholder)
    if (images.length > 0) {
      const placeholder = card.querySelector('.rs-card__carousel-placeholder');
      if (placeholder) {
        const carousel = this.createCarousel(images, property.id, totalImageCount, imagesWithSizes);
        placeholder.parentNode?.replaceChild(carousel, placeholder);
      }
    }

    return card;
  }

  private buildPropertyTags(property: Property): string {
    const tags: string[] = [];

    // Listing type tag
    const listingType = property.listing_type;
    if (listingType) {
      const classMap: Record<string, string> = {
        'resale': 'rs-card__tag--sale', 'sale': 'rs-card__tag--sale',
        'development': 'rs-card__tag--development', 'new_development': 'rs-card__tag--development',
        'long_rental': 'rs-card__tag--rental', 'rent': 'rs-card__tag--rental',
        'short_rental': 'rs-card__tag--holiday', 'holiday': 'rs-card__tag--holiday'
      };
      const labelKeyMap: Record<string, string> = {
        'resale': 'listing_type_sale', 'sale': 'listing_type_sale',
        'development': 'listing_type_new', 'new_development': 'listing_type_new',
        'long_rental': 'listing_type_long_rental', 'rent': 'listing_type_long_rental',
        'short_rental': 'listing_type_short_rental', 'holiday': 'listing_type_short_rental'
      };
      const typeKey = listingType.toLowerCase();
      const cssClass = classMap[typeKey] || 'rs-card__tag--sale';
      const labelKey = labelKeyMap[typeKey];
      const typeLabel = labelKey ? this.label(labelKey) : listingType;
      tags.push(`<span class="rs-card__tag ${cssClass}">${typeLabel}</span>`);
    }

    // Featured tag
    if (property.is_featured) {
      tags.push(`<span class="rs-card__tag rs-card__tag--featured">${this.label('featured')}</span>`);
    }

    // Own tag
    if (property.is_own) {
      tags.push(`<span class="rs-card__tag rs-card__tag--own">${this.label('own')}</span>`);
    }

    return tags.length > 0 ? `<div class="rs-card__tags">${tags.join('')}</div>` : '';
  }

  private createCustomCard(property: Property): HTMLElement {
    if (!this.cardTemplate) {
      return this.createDefaultCard(property);
    }

    const card = this.cardTemplate.cloneNode(true) as HTMLElement;
    card.classList.add('rs-card');
    card.dataset.propertyId = String(property.id);

    // Generate SEO-friendly URL
    const propertyUrl = this.generatePropertyUrl(property);

    // Limit images to 5 for performance
    const allImages = property.images || [];
    const images = allImages.slice(0, 5);
    const imagesWithSizes = ((property as Property & { imagesWithSizes?: ImageWithSizes[] }).imagesWithSizes || []).slice(0, 5);
    const totalImageCount = property.total_images || allImages.length;
    card.dataset.totalImages = String(totalImageCount);
    // Check wishlist using WishlistManager (ref) with fallback to RealtySoftState (id)
    const refNo = property.ref || property.id;
    const isInWishlist = (typeof WishlistManager !== 'undefined' && WishlistManager?.has(refNo)) || RealtySoftState.isInWishlist(property.id);

    // Handle carousel
    const carouselEl = card.querySelector('.rs_card_carousel');
    if (carouselEl) {
      carouselEl.innerHTML = '';
      if (images.length > 0) {
        const carousel = this.createCarousel(images, property.id, totalImageCount, imagesWithSizes);
        carouselEl.appendChild(carousel);
      }
    }

    // Handle single image (if no carousel)
    const imageEl = card.querySelector('.rs_card_image') as HTMLImageElement | HTMLElement | null;
    if (imageEl) {
      const mainImage = images[0] || '/realtysoft/assets/placeholder.jpg';
      if (imageEl.tagName === 'IMG') {
        (imageEl as HTMLImageElement).src = mainImage;
        (imageEl as HTMLImageElement).alt = this.escapeHtml(property.title || '');
        (imageEl as HTMLImageElement).loading = 'eager';
        (imageEl as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high';
      } else {
        imageEl.innerHTML = `<img src="${mainImage}" alt="${this.escapeHtml(property.title || '')}" loading="eager" fetchpriority="high">`;
      }
    }

    // Handle status/listing type badge
    const statusEl = card.querySelector('.rs_card_status');
    if (statusEl) {
      const listingType = property.listing_type;
      if (listingType) {
        const classMap: Record<string, string> = {
          'resale': 'rs-card__tag--sale', 'sale': 'rs-card__tag--sale',
          'development': 'rs-card__tag--development', 'new_development': 'rs-card__tag--development',
          'long_rental': 'rs-card__tag--rental', 'rent': 'rs-card__tag--rental',
          'short_rental': 'rs-card__tag--holiday', 'holiday': 'rs-card__tag--holiday'
        };
        const labelKeyMap: Record<string, string> = {
          'resale': 'listing_type_sale', 'sale': 'listing_type_sale',
          'development': 'listing_type_new', 'new_development': 'listing_type_new',
          'long_rental': 'listing_type_long_rental', 'rent': 'listing_type_long_rental',
          'short_rental': 'listing_type_short_rental', 'holiday': 'listing_type_short_rental'
        };
        const typeKey = listingType.toLowerCase();
        const cssClass = classMap[typeKey] || 'rs-card__tag--sale';
        const labelKey = labelKeyMap[typeKey];
        const typeLabel = labelKey ? this.label(labelKey) : listingType;
        statusEl.innerHTML = `<span class="rs-card__tag ${cssClass}">${typeLabel}</span>`;

        // Add featured/own badges
        if (property.is_featured) {
          statusEl.innerHTML += `<span class="rs-card__tag rs-card__tag--featured">${this.label('featured')}</span>`;
        }
        if (property.is_own) {
          statusEl.innerHTML += `<span class="rs-card__tag rs-card__tag--own">${this.label('own')}</span>`;
        }
      }
    }

    // Handle wishlist button
    const wishlistBtn = card.querySelector('.rs_card_wishlist') as HTMLButtonElement | null;
    if (wishlistBtn) {
      wishlistBtn.classList.add('rs-card__wishlist');
      wishlistBtn.classList.toggle('rs-card__wishlist--active', isInWishlist);
      wishlistBtn.type = 'button';
      wishlistBtn.setAttribute('aria-label', this.label('wishlist_add'));
      wishlistBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      `;
    }

    // Handle price
    const priceEl = card.querySelector('.rs_card_price');
    if (priceEl) {
      priceEl.textContent = RealtySoftLabels.formatPrice(property.price);
    }

    // Handle title
    const titleEl = card.querySelector('.rs_card_title');
    if (titleEl) {
      titleEl.textContent = property.title || '';
    }

    // Handle location
    const locationEl = card.querySelector('.rs_card_location');
    if (locationEl) {
      locationEl.textContent = String(property.location || '');
    }

    // Handle beds
    const bedsEl = card.querySelector('.rs_card_beds') as HTMLElement | null;
    if (bedsEl) {
      if (property.beds && property.beds > 0) {
        bedsEl.textContent = `${property.beds} ${property.beds === 1 ? this.label('card_bed') : this.label('card_beds')}`;
      } else {
        bedsEl.style.display = 'none';
      }
    }

    // Handle baths
    const bathsEl = card.querySelector('.rs_card_baths') as HTMLElement | null;
    if (bathsEl) {
      if (property.baths && property.baths > 0) {
        bathsEl.textContent = `${property.baths} ${property.baths === 1 ? this.label('card_bath') : this.label('card_baths')}`;
      } else {
        bathsEl.style.display = 'none';
      }
    }

    // Handle built area
    const builtEl = card.querySelector('.rs_card_built') as HTMLElement | null;
    if (builtEl) {
      if (property.built_area && property.built_area > 0) {
        builtEl.textContent = `${property.built_area} ${this.label('card_built')}`;
      } else {
        builtEl.style.display = 'none';
      }
    }

    // Handle plot size
    const plotEl = card.querySelector('.rs_card_plot') as HTMLElement | null;
    if (plotEl) {
      if (property.plot_size && property.plot_size > 0) {
        plotEl.textContent = `${property.plot_size} ${this.label('card_plot')}`;
      } else {
        plotEl.style.display = 'none';
      }
    }

    // Handle description
    const descEl = card.querySelector('.rs_card_description');
    if (descEl) {
      descEl.textContent = property.short_description || property.description || '';
    }

    // Handle reference
    const refEl = card.querySelector('.rs_card_ref');
    if (refEl) {
      refEl.textContent = property.ref || '';
    }

    // Handle property type
    const typeEl = card.querySelector('.rs_card_type');
    if (typeEl) {
      typeEl.textContent = property.type || '';
    }

    // Handle all links (carousel, title, price, button)
    const linkEls = card.querySelectorAll<HTMLAnchorElement>('.rs_card_link');
    linkEls.forEach(linkEl => {
      if (linkEl.tagName === 'A') {
        linkEl.href = propertyUrl;
      }
    });

    // Handle image counter
    const imageCountEl = card.querySelector('.rs_card_image_count');
    if (imageCountEl) {
      imageCountEl.textContent = String(totalImageCount);
    }

    return card;
  }

  private createCarousel(images: string[], propertyId: string | number, totalImageCount: number, imagesWithSizes: ImageWithSizes[] = []): HTMLElement {
    if (!images || images.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'rs-card__carousel';
      return empty;
    }

    // Helper to build srcset from image sizes
    const buildSrcset = (imgData: ImageWithSizes | undefined): string => {
      if (!imgData || !imgData.sizes) return '';
      const srcsetParts: string[] = [];
      if (imgData.sizes[256]) srcsetParts.push(`${imgData.sizes[256]} 256w`);
      if (imgData.sizes[512]) srcsetParts.push(`${imgData.sizes[512]} 512w`);
      if (imgData.sizes[768]) srcsetParts.push(`${imgData.sizes[768]} 768w`);
      return srcsetParts.length > 0 ? srcsetParts.join(', ') : '';
    };

    // Responsive sizes attribute for different viewport widths
    const sizesAttr = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

    const wrapper = document.createElement('div');
    wrapper.className = 'rs-card__carousel';
    wrapper.innerHTML = `
      <div class="rs-card__carousel-track">
        ${images.map((img, i) => {
          const imgData = imagesWithSizes[i];
          const srcset = buildSrcset(imgData);
          const srcsetAttr = srcset ? `srcset="${srcset}" sizes="${sizesAttr}"` : '';

          if (i === 0) {
            // First image: eager load with high priority and srcset
            return `<div class="rs-card__carousel-slide rs-card__carousel-slide--active">
              <img src="${img}" ${srcsetAttr} loading="eager" fetchpriority="high" alt="">
            </div>`;
          } else {
            // Other images: lazy load with data-src and data-srcset
            const dataSrcset = srcset ? `data-srcset="${srcset}" data-sizes="${sizesAttr}"` : '';
            return `<div class="rs-card__carousel-slide">
              <img data-src="${img}" ${dataSrcset} loading="lazy" alt="">
            </div>`;
          }
        }).join('')}
      </div>
      ${images.length > 1 ? `
        <button class="rs-card__carousel-prev" type="button" aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="rs-card__carousel-next" type="button" aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div class="rs-card__carousel-dots">
          ${images.map((_, i) => `
            <span class="rs-card__carousel-dot ${i === 0 ? 'rs-card__carousel-dot--active' : ''}" data-index="${i}"></span>
          `).join('')}
        </div>
      ` : ''}
    `;

    // Add carousel navigation
    let currentIndex = 0;
    const slides = wrapper.querySelectorAll('.rs-card__carousel-slide');
    const dots = wrapper.querySelectorAll('.rs-card__carousel-dot');

    const goToSlide = (index: number): void => {
      if (index < 0) index = images.length - 1;
      if (index >= images.length) index = 0;

      slides.forEach((s, i) => s.classList.toggle('rs-card__carousel-slide--active', i === index));
      dots.forEach((d, i) => d.classList.toggle('rs-card__carousel-dot--active', i === index));
      currentIndex = index;

      // Lazy load image if using data-src
      const activeSlide = slides[index];
      const img = activeSlide.querySelector('img') as HTMLImageElement | null;
      if (img && img.dataset.src && !img.src) {
        img.src = img.dataset.src;
        // Also apply srcset and sizes if available
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.sizes = img.dataset.sizes || '';
        }
      }
    };

    wrapper.querySelector('.rs-card__carousel-prev')?.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(currentIndex - 1);
    });

    wrapper.querySelector('.rs-card__carousel-next')?.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(currentIndex + 1);
    });

    dots.forEach(dot => {
      dot.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(parseInt((dot as HTMLElement).dataset.index || '0'));
      });
    });

    return wrapper;
  }

  private toggleWishlist(propertyId: string, button: HTMLElement, totalImages: number = 0): void {
    try {
      // Find the full property object
      const property = this.properties.find(p => String(p.id) === propertyId);
      if (!property) {
        console.warn('[PropertyGrid] Property not found for wishlist toggle:', propertyId);
        return;
      }

      // Use WishlistManager for full property storage
      const refNo = property.ref || property.id;
      const wmAvailable = typeof WishlistManager !== 'undefined' && WishlistManager;

      if (wmAvailable && WishlistManager!.has(refNo)) {
        WishlistManager!.remove(refNo);
        button.classList.remove('rs-card__wishlist--active');
        const svg = button.querySelector('svg');
        if (svg) svg.setAttribute('fill', 'none');

        try { RealtySoftAnalytics.trackWishlistRemove(property.id); } catch (_) { /* analytics non-critical */ }

        // Show toast
        if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
          RealtySoftToast.success(this.label('wishlist_removed') || 'Removed from wishlist');
        }
      } else {
        // Add property data to WishlistManager
        let addSuccess = false;
        if (wmAvailable) {
          addSuccess = WishlistManager!.add({
            id: property.id,
            ref_no: refNo,
            title: property.title,
            price: property.price,
            location: property.location,
            type: property.type,
            beds: property.beds,
            baths: property.baths,
            built: property.built_area,
            plot: property.plot_size,
            images: property.images || [],
            total_images: totalImages || property.total_images || (property.images || []).length,
            listing_type: property.listing_type,
            is_featured: property.is_featured || false
          });
        }

        if (addSuccess) {
          button.classList.add('rs-card__wishlist--active');
          const svg = button.querySelector('svg');
          if (svg) svg.setAttribute('fill', 'currentColor');

          try { RealtySoftAnalytics.trackWishlistAdd(property.id); } catch (_) { /* analytics non-critical */ }

          // Show toast
          if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
            RealtySoftToast.success(this.label('wishlist_add') || 'Added to wishlist');
          }
        } else {
          console.error('[PropertyGrid] Failed to add to wishlist. WishlistManager available:', !!wmAvailable);
          if (typeof RealtySoftToast !== 'undefined' && RealtySoftToast) {
            RealtySoftToast.error(this.label('wishlist_error') || 'Could not add to wishlist.');
          }
          return;
        }
      }

      // Sync with RealtySoftState for backwards compatibility
      try {
        const id = property.id;
        if (RealtySoftState.isInWishlist(id)) {
          RealtySoftState.removeFromWishlist(id);
        } else {
          RealtySoftState.addToWishlist(id);
        }
      } catch (stateErr) {
        console.warn('[PropertyGrid] State sync error (non-critical):', stateErr);
      }
    } catch (err) {
      console.error('[PropertyGrid] Wishlist toggle error:', err);
    }
  }

  private updateViewClass(): void {
    this.element.classList.remove('rs-property-grid--grid', 'rs-property-grid--list', 'rs-property-grid--map');
    this.element.classList.add(`rs-property-grid--${this.view}`);

    // Hide grid when map view is active (map component handles display)
    if (this.view === 'map') {
      this.element.style.display = 'none';
    } else {
      this.element.style.display = '';
    }
  }

  private updateLoadingState(): void {
    if (this.loading) {
      // If no properties yet, show skeleton cards for instant perceived performance
      if (this.properties.length === 0 && this.container) {
        if (this.loader) this.loader.style.display = 'none';
        this.container.innerHTML = this.createSkeletonCards(6);
      } else {
        // If we have properties, just dim them
        if (this.loader) this.loader.style.display = 'flex';
        if (this.container) this.container.style.opacity = '0.5';
      }
    } else {
      if (this.loader) this.loader.style.display = 'none';
      if (this.container) this.container.style.opacity = '1';
    }
  }

  /**
   * Create skeleton card placeholders for loading state
   */
  private createSkeletonCards(count: number = 6): string {
    const skeletonStyle = `
      <style>
        .rs-card--skeleton {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .rs-card--skeleton .rs-skeleton__pulse {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: rs-skeleton-pulse 1.5s infinite;
        }
        @keyframes rs-skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .rs-card--skeleton .rs-skeleton__image {
          height: 200px;
          background: #e0e0e0;
        }
        .rs-card--skeleton .rs-skeleton__content {
          padding: 15px;
        }
        .rs-card--skeleton .rs-skeleton__price {
          height: 24px;
          width: 40%;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .rs-card--skeleton .rs-skeleton__title {
          height: 18px;
          width: 80%;
          margin-bottom: 8px;
          border-radius: 4px;
        }
        .rs-card--skeleton .rs-skeleton__location {
          height: 14px;
          width: 60%;
          margin-bottom: 12px;
          border-radius: 4px;
        }
        .rs-card--skeleton .rs-skeleton__specs {
          display: flex;
          gap: 15px;
        }
        .rs-card--skeleton .rs-skeleton__spec {
          height: 14px;
          width: 50px;
          border-radius: 4px;
        }
      </style>
    `;

    const skeletonCard = `
      <div class="rs-card rs-card--skeleton">
        <div class="rs-skeleton__image rs-skeleton__pulse"></div>
        <div class="rs-skeleton__content">
          <div class="rs-skeleton__price rs-skeleton__pulse"></div>
          <div class="rs-skeleton__title rs-skeleton__pulse"></div>
          <div class="rs-skeleton__location rs-skeleton__pulse"></div>
          <div class="rs-skeleton__specs">
            <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
            <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
            <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          </div>
        </div>
      </div>
    `;

    return skeletonStyle + Array(count).fill(skeletonCard).join('');
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('rs_property_grid', RSPropertyGrid as unknown as ComponentConstructor);

export { RSPropertyGrid };
export default RSPropertyGrid;
