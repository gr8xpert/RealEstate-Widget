/**
 * RealtySoft Widget v3 - Property Detail Template
 * Complete ready-made template for property detail page
 * Renders entire property detail from single container: <div id="property-detail-container"></div>
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  Property,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftLabelsModule,
  RealtySoftAPIModule
} from '../../types/index';
import { RSDetailGallery } from './gallery';
import { RSDetailShare } from './share';
import { RSDetailWishlist } from './wishlist';
import { RSDetailMap } from './map';
import { RSDetailInquiryForm } from './inquiry-form';
import { RSDetailRelated } from './related';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftAPI: RealtySoftAPIModule;

// Extended HTMLElement with component reference
interface RSHTMLElement extends HTMLElement {
  _rsComponent?: unknown;
}

class RSPropertyDetailTemplate extends RSBaseComponent {
  private property: Property | null = null;
  private propertyId: string | null = null;
  private propertyRef: string | null = null;
  private hasInitiallyRendered: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.property = null;
    this.propertyId = null;
    this.propertyRef = null;

    // Clear stale PHP prefetch if it doesn't match the current URL
    this.clearStalePrefetch();

    // Priority 1: Check URL patterns first (SEO-friendly URLs)
    this.propertyId = this.getPropertyIdFromUrl();
    this.propertyRef = this.getPropertyRefFromUrl();

    // Priority 2: Fallback to data attributes (for embedded/widget usage)
    if (!this.propertyId && !this.propertyRef) {
      const dataId = this.element.dataset.propertyId;
      const dataRef = this.element.dataset.propertyRef;

      if (dataId) {
        if (/^\d+$/.test(dataId)) {
          this.propertyId = dataId;
        } else {
          this.propertyRef = dataId;
        }
      }

      if (dataRef) {
        this.propertyRef = dataRef;
      }
    }

    this.element.classList.add('rs-property-detail-template');

    if (this.propertyId || this.propertyRef) {
      // RACE CONDITION FIX: Always use direct API return, ignore cache and subscription
      this.showSkeleton();
      this.loadProperty().then(property => {
        if (property) {
          // Double-check the property ref matches what we asked for
          if (this.propertyRef && property.ref?.toLowerCase() !== this.propertyRef.toLowerCase()) {
            console.warn('[RealtySoft] Property ref mismatch - expected:', this.propertyRef, 'got:', property.ref);
            return;
          }
          this.property = property;
          this.render();
        }
      });
    } else {
      this.showError('No property ID or reference found');
    }

    // Subscribe for updates to the SAME property (after first load)
    // This handles both background updates and language change reloads
    this.subscribe<Property>('currentProperty', (property) => {
      // Only update if we already have a property AND it's the same ID
      if (!property || !this.property) return;
      if (property.id !== this.property.id) return;

      // Check if this is a language change reload (property data changed but same ID)
      const contentChanged =
        this.property.title !== property.title ||
        this.property.description !== property.description;

      this.property = property;

      // Re-render if content changed (language switch) and we've already rendered
      if (contentChanged && this.hasInitiallyRendered) {
        console.log('[RSPropertyDetailTemplate] Property content changed (language switch), re-rendering...');
        this.hasInitiallyRendered = false;
        this.render();
      }
    });

    // Listen for language changes to update labels
    // Note: Property data will be reloaded by controller's setLanguage()
    // The currentProperty subscription above will handle the re-render
    this.subscribe('config.language', () => {
      if (this.hasInitiallyRendered && this.property) {
        // Update labels immediately while waiting for property reload
        this.updateLabelsInPlace();
      }
    });
  }

  /**
   * Get cached property from localStorage
   */
  private getCachedProperty(): Property | null {
    const idOrRef = this.propertyRef || this.propertyId;
    if (!idOrRef) return null;
    const isRef = !!this.propertyRef;
    return RealtySoftAPI.getCachedProperty(idOrRef, isRef);
  }

  /**
   * Validate that cached property matches what we're looking for
   * Prevents showing wrong property from stale cache
   */
  private isCacheValid(cached: Property): boolean {
    // If we have a ref from URL, cached property ref must match
    if (this.propertyRef) {
      const cachedRef = cached.ref || '';
      return cachedRef.toLowerCase() === this.propertyRef.toLowerCase();
    }
    // If we have an ID, cached property ID must match
    if (this.propertyId) {
      return String(cached.id) === this.propertyId;
    }
    return false;
  }

  private getPropertyIdFromUrl(): string | null {
    const patterns = [
      /\/property\/(\d+)/,
      /[?&]id=(\d+)/,
      /[?&]property_id=(\d+)/
    ];
    for (const pattern of patterns) {
      const match = window.location.href.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private getPropertyRefFromUrl(): string | null {
    const slug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';

    // Query params
    const urlParams = new URLSearchParams(window.location.search);
    const queryRef = urlParams.get('ref') || urlParams.get('reference');
    if (queryRef) return queryRef.trim();

    // Check URL is under property slug
    const slugRegex = new RegExp(`/${slug}/(.+?)/?$`, 'i');
    const slugMatch = window.location.pathname.match(slugRegex);
    if (!slugMatch) return null;

    const subpath = slugMatch[1];

    // SEO URL: last hyphen-separated part
    const parts = subpath.split('-');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/^[A-Z0-9]{3,}$/i.test(lastPart) && !/^\d+$/.test(lastPart)) return lastPart;
    }

    // Direct ref
    if (/^[A-Z0-9]{3,}$/i.test(subpath) && !/^\d+$/.test(subpath)) return subpath;

    return null;
  }

  /**
   * Clear stale PHP prefetch data that doesn't match current URL
   * RACE CONDITION FIX: Be aggressive - if we can't verify match, clear it
   */
  private clearStalePrefetch(): void {
    const prefetch = (window as any).__rsPrefetch;
    if (!prefetch) return;

    const urlRef = this.getPropertyRefFromUrl();
    const prefetchRef = prefetch.ref;

    // If we have a URL ref, check if prefetch matches
    if (urlRef) {
      if (!prefetchRef || urlRef.toLowerCase() !== prefetchRef.toLowerCase()) {
        console.log('[RealtySoft] Clearing stale prefetch - URL ref:', urlRef, 'prefetch ref:', prefetchRef);
        delete (window as any).__rsPrefetch;
      }
    } else {
      // Can't determine URL ref - clear prefetch to be safe
      console.log('[RealtySoft] Clearing prefetch - could not determine URL ref');
      delete (window as any).__rsPrefetch;
    }
  }

  private async loadProperty(backgroundRefresh: boolean = false): Promise<Property | null> {
    try {
      let property: Property | null = null;
      if (this.propertyId) {
        property = await RealtySoft.loadProperty(parseInt(this.propertyId));
      } else if (this.propertyRef) {
        property = await RealtySoft.loadPropertyByRef(this.propertyRef);
      }
      return property;
    } catch (error) {
      console.error('Failed to load property:', error);
      // Only show error if we don't have cached data and not background refresh
      if (!this.property && !backgroundRefresh) {
        this.showError('Failed to load property details');
      }
      return null;
    }
  }

  /**
   * Show skeleton loader for instant perceived performance
   */
  private showSkeleton(): void {
    this.element.innerHTML = `
      <div class="rs-property-detail-template__skeleton">
        <div class="rs-skeleton__gallery">
          <div class="rs-skeleton__image rs-skeleton__pulse"></div>
        </div>
        <div class="rs-skeleton__header">
          <div class="rs-skeleton__title rs-skeleton__pulse"></div>
          <div class="rs-skeleton__price rs-skeleton__pulse"></div>
          <div class="rs-skeleton__location rs-skeleton__pulse"></div>
        </div>
        <div class="rs-skeleton__specs">
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
        </div>
        <div class="rs-skeleton__content">
          <div class="rs-skeleton__main">
            <div class="rs-skeleton__section">
              <div class="rs-skeleton__section-title rs-skeleton__pulse"></div>
              <div class="rs-skeleton__text rs-skeleton__pulse"></div>
              <div class="rs-skeleton__text rs-skeleton__pulse"></div>
              <div class="rs-skeleton__text rs-skeleton__pulse" style="width: 60%"></div>
            </div>
          </div>
          <div class="rs-skeleton__sidebar">
            <div class="rs-skeleton__card rs-skeleton__pulse"></div>
          </div>
        </div>
      </div>
      <style>
        .rs-property-detail-template__skeleton { padding: 20px; }
        .rs-skeleton__pulse {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: rs-skeleton-pulse 1.5s infinite;
          border-radius: 4px;
        }
        @keyframes rs-skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .rs-skeleton__gallery { height: 400px; margin-bottom: 20px; }
        .rs-skeleton__image { height: 100%; }
        .rs-skeleton__header { margin-bottom: 20px; }
        .rs-skeleton__title { height: 32px; width: 70%; margin-bottom: 12px; }
        .rs-skeleton__price { height: 28px; width: 30%; margin-bottom: 8px; }
        .rs-skeleton__location { height: 20px; width: 50%; }
        .rs-skeleton__specs { display: flex; gap: 20px; margin-bottom: 30px; }
        .rs-skeleton__spec { height: 60px; width: 100px; }
        .rs-skeleton__content { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
        .rs-skeleton__section { margin-bottom: 20px; }
        .rs-skeleton__section-title { height: 24px; width: 40%; margin-bottom: 15px; }
        .rs-skeleton__text { height: 16px; margin-bottom: 10px; }
        .rs-skeleton__card { height: 300px; }
        @media (max-width: 768px) {
          .rs-skeleton__content { grid-template-columns: 1fr; }
          .rs-skeleton__gallery { height: 250px; }
        }
      </style>
    `;
  }

  private showError(message: string): void {
    this.element.innerHTML = `
      <div class="rs-property-detail-template__error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>${message}</p>
        <button onclick="location.reload()" class="rs-property-detail-template__retry-btn">
          Try Again
        </button>
      </div>
    `;
  }

  render(): void {
    // Guard: Don't render without property data
    if (!this.property) return;

    // If already rendered, just update labels (language change scenario)
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }

    // First-time render: build full HTML structure
    this.hasInitiallyRendered = true;

    const p = this.property;

    // Update page title
    if (p.title) {
      document.title = `${p.title} | Property Details`;
    }

    this.element.innerHTML = `
      <!-- Gallery Section with Wishlist Overlay -->
      <div class="rs-template__gallery-wrapper">
        <div class="rs-template__gallery" id="rs-template-gallery"></div>
        <div class="rs-template__gallery-wishlist" id="rs-template-wishlist"></div>
      </div>

      <!-- Header Section -->
      <div class="rs-template__header">
        <div class="rs-template__header-main">
          <h1 class="rs-template__title">${this.escapeHtml(p.title || '')}</h1>
          <div class="rs-template__location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${this.escapeHtml(p.location || p.address || '')}</span>
          </div>
        </div>
        <div class="rs-template__header-actions">
          <div class="rs-template__price ${p.price_on_request ? 'rs-template__price--por' : ''}">
            ${p.price_on_request ? this.label('detail_price_on_request') : RealtySoftLabels.formatPrice(p.price)}
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="rs-template__content">
        <div class="rs-template__main">
          <!-- Property Information Grid -->
          ${this.renderPropertyInfoGrid(p)}

          ${p.description ? `
            <div class="rs-template__section">
              <h2 class="rs-template__section-title rs-template__section-title--description">${this.label('detail_description')}</h2>
              <div class="rs-template__description rs-template__description--clamped" id="rs-template-description">${this.formatDescription(p.description)}</div>
              <button class="rs-template__read-more" id="rs-template-read-more" style="display:none;">
                ${this.label('detail_read_more') || 'Read More'}
              </button>
            </div>
          ` : ''}
          ${this.renderResources(p)}
          ${this.renderTaxes(p)}
          ${this.renderEnergy(p)}
        </div>

        <div class="rs-template__sidebar">
          ${this.renderAgentCard(p)}
          ${this.renderFeatures(p)}
          ${this.renderSidebarPdf(p)}
          <div class="rs-template__inquiry-form" id="rs-template-inquiry"></div>
          <div class="rs-template__sidebar-share" id="rs-template-share"></div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="rs-template__section rs-template__section--full rs-template__section--map">
        <div class="rs-template__map" id="rs-template-map" data-variation="1"></div>
      </div>

      <!-- Related Properties -->
      <div class="rs-template__section rs-template__section--full">
        <div class="rs-template__related" id="rs-template-related" data-limit="6"></div>
      </div>
    `;

    // Initialize child components
    this.initChildComponents();
  }

  private renderKeySpecs(p: Property): string {
    const specs: string[] = [];

    if (p.beds && parseFloat(String(p.beds)) > 0) {
      specs.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 4v16"></path>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
            <path d="M2 17h20"></path>
            <path d="M6 8v9"></path>
          </svg>
          <span class="rs-template__spec-value">${p.beds}</span>
          <span class="rs-template__spec-label">${this.label('card_beds')}</span>
        </div>
      `);
    }

    if (p.baths && parseFloat(String(p.baths)) > 0) {
      specs.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
            <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
            <circle cx="12" cy="5" r="2"></circle>
          </svg>
          <span class="rs-template__spec-value">${p.baths}</span>
          <span class="rs-template__spec-label">${this.label('card_baths')}</span>
        </div>
      `);
    }

    if (p.built_area && parseFloat(String(p.built_area)) > 0) {
      specs.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 21V9"></path>
          </svg>
          <span class="rs-template__spec-value">${p.built_area}m\u00B2</span>
          <span class="rs-template__spec-label">${this.label('detail_built_area')}</span>
        </div>
      `);
    }

    if (p.plot_size && parseFloat(String(p.plot_size)) > 0) {
      specs.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
            <path d="M12 2v20"></path>
          </svg>
          <span class="rs-template__spec-value">${p.plot_size}m\u00B2</span>
          <span class="rs-template__spec-label">${this.label('detail_plot_size')}</span>
        </div>
      `);
    }

    return specs.join('');
  }

  /**
   * Render combined property information grid (table-style cards)
   * 4 columns on desktop, 2 on mobile
   */
  private renderPropertyInfoGrid(p: Property): string {
    const items: { label: string; value: string }[] = [];

    // Reference
    if (p.ref) {
      items.push({ label: this.label('detail_reference') || 'Reference', value: p.ref });
    }

    // Property Type
    if (p.type) {
      items.push({ label: this.label('detail_property_type') || 'Property Type', value: p.type });
    }

    // Bedrooms
    if (p.beds && parseFloat(String(p.beds)) > 0) {
      items.push({ label: this.label('card_beds') || 'Bedrooms', value: String(p.beds) });
    }

    // Bathrooms
    if (p.baths && parseFloat(String(p.baths)) > 0) {
      items.push({ label: this.label('card_baths') || 'Bathrooms', value: String(p.baths) });
    }

    // Plot Size
    if (p.plot_size && parseFloat(String(p.plot_size)) > 0) {
      items.push({ label: this.label('detail_plot_size') || 'Plot Size', value: `${p.plot_size} m²` });
    }

    // Built Area
    if (p.built_area && parseFloat(String(p.built_area)) > 0) {
      items.push({ label: this.label('detail_built_area') || 'Built', value: `${p.built_area} m²` });
    }

    // Terrace
    if (p.terrace_size && parseFloat(String(p.terrace_size)) > 0) {
      items.push({ label: this.label('detail_terrace') || 'Terrace', value: `${p.terrace_size} m²` });
    }

    // Garden
    if (p.garden_size && parseFloat(String(p.garden_size)) > 0) {
      items.push({ label: this.label('detail_garden') || 'Garden', value: `${p.garden_size} m²` });
    }

    // Solarium
    if (p.solarium_size && parseFloat(String(p.solarium_size)) > 0) {
      items.push({ label: this.label('detail_solarium') || 'Solarium', value: `${p.solarium_size} m²` });
    }

    // Usable Area
    if (p.usable_area && parseFloat(String(p.usable_area)) > 0) {
      items.push({ label: this.label('detail_usable_area') || 'Usable Area', value: `${p.usable_area} m²` });
    }

    // Year Built
    if (p.year_built) {
      items.push({ label: this.label('detail_year_built') || 'Year Built', value: String(p.year_built) });
    }

    // Status
    if (p.status) {
      items.push({ label: this.label('detail_status') || 'Status', value: p.status });
    }

    // Floor
    if (p.floor) {
      items.push({ label: this.label('detail_floor') || 'Floor', value: p.floor });
    }

    // Orientation
    if (p.orientation) {
      items.push({ label: this.label('detail_orientation') || 'Orientation', value: p.orientation });
    }

    // Condition
    if (p.condition) {
      items.push({ label: this.label('detail_condition') || 'Condition', value: p.condition });
    }

    // Furnished
    if (p.furnished) {
      items.push({ label: this.label('detail_furnished') || 'Furnished', value: p.furnished });
    }

    // Views
    if (p.views) {
      items.push({ label: this.label('detail_views') || 'Views', value: p.views });
    }

    // Parking
    if (p.parking) {
      items.push({ label: this.label('detail_parking') || 'Parking', value: p.parking });
    }

    if (items.length === 0) return '';

    return `
      <div class="rs-template__section rs-template__section--info-grid">
        <h2 class="rs-template__section-title rs-template__section-title--info-grid">${this.label('detail_property_info') || 'Property Information'}</h2>
        <div class="rs-template__info-cards">
          ${items.map(item => `
            <div class="rs-template__info-card">
              <div class="rs-template__info-card-label">${this.escapeHtml(item.label)}</div>
              <div class="rs-template__info-card-value">${this.escapeHtml(item.value)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderPropertyInfo(p: Property): string {
    const rows: { label: string; value: string | number }[] = [];

    if (p.type) rows.push({ label: this.label('detail_property_type'), value: p.type });
    if (p.status) rows.push({ label: this.label('detail_status'), value: p.status });
    if (p.year_built) rows.push({ label: this.label('detail_year_built'), value: p.year_built });
    if (p.ref) rows.push({ label: this.label('detail_reference'), value: p.ref });
    if (p.unique_ref) rows.push({ label: this.label('detail_unique_ref'), value: p.unique_ref });
    if (p.postal_code) rows.push({ label: this.label('detail_postal_code'), value: p.postal_code });
    if (p.floor) rows.push({ label: this.label('detail_floor'), value: p.floor });
    if (p.orientation) rows.push({ label: this.label('detail_orientation'), value: p.orientation });
    if (p.condition) rows.push({ label: this.label('detail_condition'), value: p.condition });
    if (p.furnished) rows.push({ label: this.label('detail_furnished'), value: p.furnished });
    if (p.views) rows.push({ label: this.label('detail_views'), value: p.views });
    if (p.parking) rows.push({ label: this.label('detail_parking'), value: p.parking });

    if (rows.length === 0) return '';

    return `
      <div class="rs-template__section rs-template__section--property-info">
        <h2 class="rs-template__section-title rs-template__section-title--property-info">${this.label('detail_property_info')}</h2>
        <div class="rs-template__info-grid">
          ${rows.map(row => `
            <div class="rs-template__info-row">
              <span class="rs-template__info-label">${row.label}</span>
              <span class="rs-template__info-value">${this.escapeHtml(String(row.value))}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderAdditionalSizes(p: Property): string {
    const sizes: { label: string; value: string }[] = [];

    if (p.terrace_size && parseFloat(String(p.terrace_size)) > 0) {
      sizes.push({ label: this.label('detail_terrace'), value: `${p.terrace_size}m\u00B2` });
    }
    if (p.solarium_size && parseFloat(String(p.solarium_size)) > 0) {
      sizes.push({ label: this.label('detail_solarium'), value: `${p.solarium_size}m\u00B2` });
    }
    if (p.garden_size && parseFloat(String(p.garden_size)) > 0) {
      sizes.push({ label: this.label('detail_garden'), value: `${p.garden_size}m\u00B2` });
    }
    if (p.usable_area && parseFloat(String(p.usable_area)) > 0) {
      sizes.push({ label: this.label('detail_usable_area'), value: `${p.usable_area}m\u00B2` });
    }

    if (sizes.length === 0) return '';

    return `
      <div class="rs-template__section rs-template__section--sizes">
        <h2 class="rs-template__section-title rs-template__section-title--sizes">${this.label('detail_sizes')}</h2>
        <div class="rs-template__info-grid">
          ${sizes.map(size => `
            <div class="rs-template__info-row">
              <span class="rs-template__info-label">${size.label}</span>
              <span class="rs-template__info-value">${size.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderResources(p: Property): string {
    const sections: string[] = [];

    // Embed video directly if YouTube or Vimeo
    if (p.video_url) {
      const embedUrl = this.getVideoEmbedUrl(p.video_url);
      if (embedUrl) {
        sections.push(`
          <div class="rs-template__section rs-template__section--video">
            <h2 class="rs-template__section-title rs-template__section-title--video">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              ${this.label('detail_video_tour') || 'Video Tour'}
            </h2>
            <div class="rs-template__video-container">
              <iframe
                src="${embedUrl}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
                class="rs-template__video-iframe"
              ></iframe>
            </div>
          </div>
        `);
      } else {
        // Fallback to link for unsupported video URLs
        sections.push(`
          <a href="${p.video_url}" target="_blank" rel="noopener" class="rs-template__resource rs-template__resource--video">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span class="rs-template__resource-text">${this.label('detail_video_tour')}</span>
          </a>
        `);
      }
    }

    // Embed virtual tour directly as iframe
    if (p.virtual_tour_url) {
      sections.push(`
        <div class="rs-template__section rs-template__section--virtual-tour">
          <h2 class="rs-template__section-title rs-template__section-title--virtual-tour">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
              <path d="M2 12h20"></path>
            </svg>
            ${this.label('detail_virtual_tour') || 'Virtual Tour'}
          </h2>
          <div class="rs-template__virtual-tour-container">
            <iframe
              src="${p.virtual_tour_url}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
              allowfullscreen
              loading="lazy"
              class="rs-template__virtual-tour-iframe"
            ></iframe>
          </div>
        </div>
      `);
    }

    if (sections.length === 0) return '';

    return sections.join('');
  }

  /**
   * Convert YouTube/Vimeo URL to embed URL
   */
  private getVideoEmbedUrl(url: string): string {
    // YouTube - various URL formats
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Already an embed URL
    if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com')) {
      return url;
    }

    return '';
  }

  private renderTaxes(p: Property): string {
    const taxes: { label: string; value: string }[] = [];

    if (p.community_fees && parseFloat(String(p.community_fees)) > 0) {
      taxes.push({
        label: this.label('detail_community_fees'),
        value: RealtySoftLabels.formatPrice(p.community_fees) + this.label('detail_per_month')
      });
    }
    if (p.ibi_tax && parseFloat(String(p.ibi_tax)) > 0) {
      taxes.push({
        label: this.label('detail_ibi_tax'),
        value: RealtySoftLabels.formatPrice(p.ibi_tax) + this.label('detail_per_year')
      });
    }
    if (p.basura_tax && parseFloat(String(p.basura_tax)) > 0) {
      taxes.push({
        label: this.label('detail_basura_tax'),
        value: RealtySoftLabels.formatPrice(p.basura_tax) + this.label('detail_per_year')
      });
    }

    if (taxes.length === 0) return '';

    return `
      <div class="rs-template__section rs-template__section--taxes">
        <h2 class="rs-template__section-title rs-template__section-title--taxes">${this.label('detail_taxes_fees')}</h2>
        <div class="rs-template__taxes">
          ${taxes.map(tax => `
            <div class="rs-template__tax-item">
              <span class="rs-template__tax-label">${tax.label}</span>
              <span class="rs-template__tax-value">${tax.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderEnergy(p: Property): string {
    const isEnergyRatingUrl = p.energy_rating && (
      p.energy_rating.includes('http') ||
      /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(p.energy_rating)
    );
    const isCo2RatingUrl = p.co2_rating && (
      p.co2_rating.includes('http') ||
      /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(p.co2_rating)
    );

    const energyRating = !isEnergyRatingUrl ? p.energy_rating : null;
    const co2Rating = !isCo2RatingUrl ? p.co2_rating : null;

    const energyImages: string[] = [];
    if (isEnergyRatingUrl) energyImages.push(p.energy_rating);
    if (isCo2RatingUrl) energyImages.push(p.co2_rating);
    if (p.energy_certificate_image) energyImages.push(p.energy_certificate_image);

    if (!energyRating && !co2Rating && energyImages.length === 0) return '';

    return `
      <div class="rs-template__section rs-template__section--energy">
        <h2 class="rs-template__section-title rs-template__section-title--energy">${this.label('detail_energy_certificate')}</h2>
        <div class="rs-template__energy">
          ${energyRating ? `
            <div class="rs-template__energy-rating">
              <span class="rs-template__energy-label rs-template__energy-label--rating">${this.label('detail_energy_rating')}</span>
              <span class="rs-template__energy-badge rs-template__energy-badge--${(energyRating || 'na').toLowerCase()}">${energyRating || 'N/A'}</span>
            </div>
          ` : ''}
          ${co2Rating ? `
            <div class="rs-template__energy-rating">
              <span class="rs-template__energy-label rs-template__energy-label--co2">${this.label('detail_co2_rating')}</span>
              <span class="rs-template__energy-badge rs-template__energy-badge--${(co2Rating || 'na').toLowerCase()}">${co2Rating || 'N/A'}</span>
            </div>
          ` : ''}
          ${energyImages.map(imgUrl => `
            <div class="rs-template__energy-image">
              <img src="${imgUrl}" alt="${this.label('detail_energy_certificate')}" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderSidebarPdf(p: Property): string {
    const orig = (p._original || {}) as Record<string, unknown>;
    const pdfUrl = p.pdf_url || (orig.pdf_url as string) || (orig.pdf as string) ||
                   (orig.brochure_url as string) || (orig.brochure as string) ||
                   (orig.pdf_link as string) || (orig.document_url as string) ||
                   (orig.flyer_url as string) || (orig.flyer as string) || null;

    if (!pdfUrl) return '';

    return `
      <a href="${pdfUrl}" target="_blank" rel="noopener" class="rs-template__sidebar-pdf">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M12 18v-6"></path>
          <path d="M9 15l3 3 3-3"></path>
        </svg>
        <span class="rs-template__sidebar-pdf-text">${this.label('detail_download_pdf') || 'Download PDF'}</span>
      </a>
    `;
  }

  private renderAgentCard(p: Property): string {
    const agent = p.agent;
    if (!agent || (!agent.name && !agent.phone && !agent.email)) return '';

    return `
      <div class="rs-template__agent-card">
        ${agent.photo ? `
          <div class="rs-template__agent-photo">
            <img src="${agent.photo}" alt="${this.escapeHtml(agent.name || '')}">
          </div>
        ` : ''}
        <div class="rs-template__agent-info">
          ${agent.name ? `<div class="rs-template__agent-name">${this.escapeHtml(agent.name)}</div>` : ''}
          ${agent.phone ? `
            <a href="tel:${agent.phone.replace(/\s/g, '')}" class="rs-template__agent-contact">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              ${agent.phone}
            </a>
          ` : ''}
          ${agent.email ? `
            <a href="mailto:${agent.email}" class="rs-template__agent-contact">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              ${agent.email}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  private initChildComponents(): void {
    const p = this.property;
    if (!p) return;

    const componentMappings: [string, new (el: HTMLElement, opts: ComponentOptions) => RSBaseComponent][] = [
      ['#rs-template-gallery', RSDetailGallery],
      ['#rs-template-share', RSDetailShare],
      ['#rs-template-wishlist', RSDetailWishlist],
      ['#rs-template-map', RSDetailMap],
      ['#rs-template-inquiry', RSDetailInquiryForm],
      ['#rs-template-related', RSDetailRelated],
    ];

    for (const [selector, ComponentClass] of componentMappings) {
      const el = this.element.querySelector<RSHTMLElement>(selector);
      if (el && !el._rsComponent) {
        new ComponentClass(el, { property: p } as ComponentOptions);
      }
    }

    // Description read-more toggle
    this.initReadMore();

    // Features accordion toggle
    this.initFeaturesAccordion();
  }

  private initReadMore(): void {
    const descEl = this.element.querySelector<HTMLElement>('#rs-template-description');
    const btn = this.element.querySelector<HTMLButtonElement>('#rs-template-read-more');
    if (!descEl || !btn) return;

    // Wait for render to measure height
    requestAnimationFrame(() => {
      // Check if content overflows the 8-line clamp
      const isOverflowing = descEl.scrollHeight > descEl.clientHeight;
      if (isOverflowing) {
        btn.style.display = '';
        let expanded = false;
        btn.addEventListener('click', () => {
          expanded = !expanded;
          descEl.classList.toggle('rs-template__description--clamped', !expanded);
          btn.textContent = expanded
            ? (this.label('detail_read_less') || 'Read Less')
            : (this.label('detail_read_more') || 'Read More');
        });
      }
    });
  }

  /**
   * Update only label text nodes on language change (preserves DOM structure and child components)
   */
  private updateLabelsInPlace(): void {
    if (!this.property) return;
    const p = this.property;

    // Update price (special case for POA)
    const priceEl = this.element.querySelector('.rs-template__price');
    if (priceEl) {
      priceEl.textContent = p.price_on_request
        ? this.label('detail_price_on_request')
        : RealtySoftLabels.formatPrice(p.price);
    }

    // Update spec labels
    const specLabels = this.element.querySelectorAll('.rs-template__spec-label');
    const labelKeys = ['card_beds', 'card_baths', 'detail_built_area', 'detail_plot_size'];
    specLabels.forEach((el, index) => {
      if (labelKeys[index]) {
        el.textContent = this.label(labelKeys[index]);
      }
    });

    // Update all section titles
    const sectionTitles: Record<string, string> = {
      'description': 'detail_description',
      'info-grid': 'detail_property_info',
      'features': 'detail_features',
      'taxes': 'detail_taxes_fees',
      'energy': 'detail_energy_certificate'
    };

    for (const [section, labelKey] of Object.entries(sectionTitles)) {
      const el = this.element.querySelector(`.rs-template__section-title--${section}`);
      if (el) el.textContent = this.label(labelKey) || el.textContent;
    }

    // Update read more button
    const readMoreBtn = this.element.querySelector('.rs-template__read-more') as HTMLButtonElement | null;
    if (readMoreBtn) {
      const descEl = this.element.querySelector('#rs-template-description');
      const isClamped = descEl?.classList.contains('rs-template__description--clamped');
      readMoreBtn.textContent = isClamped
        ? (this.label('detail_read_more') || 'Read More')
        : (this.label('detail_read_less') || 'Read Less');
    }

    // Update property info grid section (re-render content since labels are dynamic)
    const infoGridSection = this.element.querySelector('.rs-template__section--info-grid');
    if (infoGridSection) {
      const newContent = this.renderPropertyInfoGrid(p);
      if (newContent) {
        const temp = document.createElement('div');
        temp.innerHTML = newContent;
        const newSection = temp.firstElementChild;
        if (newSection) {
          infoGridSection.innerHTML = newSection.innerHTML;
        }
      }
    }

    // Update taxes section (re-render content since labels are dynamic)
    const taxesSection = this.element.querySelector('.rs-template__section--taxes');
    if (taxesSection) {
      const newContent = this.renderTaxes(p);
      if (newContent) {
        const temp = document.createElement('div');
        temp.innerHTML = newContent;
        const newSection = temp.firstElementChild;
        if (newSection) {
          taxesSection.innerHTML = newSection.innerHTML;
        }
      }
    }

    // Update energy labels
    const energyRatingLabel = this.element.querySelector('.rs-template__energy-label--rating');
    if (energyRatingLabel) {
      energyRatingLabel.textContent = this.label('detail_energy_rating');
    }
    const co2RatingLabel = this.element.querySelector('.rs-template__energy-label--co2');
    if (co2RatingLabel) {
      co2RatingLabel.textContent = this.label('detail_co2_rating');
    }

    // Update resource links
    const videoResource = this.element.querySelector('.rs-template__resource--video .rs-template__resource-text');
    if (videoResource) {
      videoResource.textContent = this.label('detail_video_tour');
    }
    const virtualResource = this.element.querySelector('.rs-template__resource--virtual .rs-template__resource-text');
    if (virtualResource) {
      virtualResource.textContent = this.label('detail_virtual_tour');
    }

    // Update PDF download link
    const pdfText = this.element.querySelector('.rs-template__sidebar-pdf-text');
    if (pdfText) {
      pdfText.textContent = this.label('detail_download_pdf') || 'Download PDF';
    }

    // Update video section title (embedded video)
    const videoTitle = this.element.querySelector('.rs-template__section-title--video');
    if (videoTitle) {
      const svg = videoTitle.querySelector('svg');
      if (svg) {
        videoTitle.innerHTML = '';
        videoTitle.appendChild(svg);
        videoTitle.appendChild(document.createTextNode(' ' + (this.label('detail_video_tour') || 'Video Tour')));
      }
    }

    // Update virtual tour section title (embedded)
    const virtualTourTitle = this.element.querySelector('.rs-template__section-title--virtual-tour');
    if (virtualTourTitle) {
      const svg = virtualTourTitle.querySelector('svg');
      if (svg) {
        virtualTourTitle.innerHTML = '';
        virtualTourTitle.appendChild(svg);
        virtualTourTitle.appendChild(document.createTextNode(' ' + (this.label('detail_virtual_tour') || 'Virtual Tour')));
      }
    }

    // Update features button label (popup mode)
    const featuresBtnLabel = this.element.querySelector('.rs-template__features-btn-label');
    if (featuresBtnLabel) {
      featuresBtnLabel.textContent = this.label('detail_features') || 'Features';
    }

    // Update features modal title (popup mode)
    const featuresModalTitle = this.element.querySelector('.rs-template__features-modal-title');
    if (featuresModalTitle) {
      const svg = featuresModalTitle.querySelector('svg');
      const count = featuresModalTitle.querySelector('.rs-template__features-modal-count');
      if (svg && count) {
        featuresModalTitle.innerHTML = '';
        featuresModalTitle.appendChild(svg);
        featuresModalTitle.appendChild(document.createTextNode(' ' + (this.label('detail_features') || 'Features') + ' '));
        featuresModalTitle.appendChild(count);
      }
    }

    // Note: Child components (gallery, map, inquiry form, etc.) handle their own
    // label updates via the controller's render() call which triggers their render() methods
  }

  private renderFeatures(p: Property): string {
    const features = p.features;
    if (!features || features.length === 0) return '';

    // Check for mode preference: 'button' (popup) or 'accordion' (inline)
    // Default to 'button' (popup) for more compact display
    const modeAttr = this.element.dataset.featuresMode;
    const mode = modeAttr === 'accordion' ? 'accordion' : 'button';

    // Group features by category
    const grouped: Record<string, string[]> = {};
    features.forEach((feature: { name: string; category?: string } | string) => {
      const name = typeof feature === 'string' ? feature : feature.name;
      const category = (typeof feature === 'object' && feature.category) ? feature.category : 'Features';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(name);
    });

    const categories = Object.entries(grouped);
    const totalFeatures = features.length;

    if (mode === 'button') {
      // Compact button that opens a popup modal
      return `
        <div class="rs-template__section rs-template__section--features rs-template__section--features-button">
          <button type="button" class="rs-template__features-btn" id="rs-template-features-btn">
            <span class="rs-template__features-btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </span>
            <span class="rs-template__features-btn-label">${this.label('detail_features') || 'Features'}</span>
            <span class="rs-template__features-btn-count">${totalFeatures}</span>
          </button>

          <div class="rs-template__features-modal" id="rs-template-features-modal" style="display: none;">
            <div class="rs-template__features-modal-backdrop"></div>
            <div class="rs-template__features-modal-content">
              <div class="rs-template__features-modal-header">
                <h3 class="rs-template__features-modal-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  ${this.label('detail_features') || 'Features'}
                  <span class="rs-template__features-modal-count">(${totalFeatures})</span>
                </h3>
                <button type="button" class="rs-template__features-modal-close">&times;</button>
              </div>
              <div class="rs-template__features-modal-body">
                ${this.renderFeaturesGrid(grouped, categories)}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Accordion mode (original behavior)
    return `
      <div class="rs-template__section rs-template__section--features rs-template__section--features-accordion">
        <h2 class="rs-template__section-title rs-template__section-title--features">${this.label('detail_features') || 'Features & Amenities'}</h2>
        <div class="rs-template__accordion">
          ${categories.map(([category, items], idx) => `
            <div class="rs-template__accordion-item${idx === 0 ? ' rs-template__accordion-item--open' : ''}">
              <button class="rs-template__accordion-header" type="button">
                <span class="rs-template__accordion-label">${this.escapeHtml(category)}</span>
                <span class="rs-template__accordion-count">${items.length}</span>
                <svg class="rs-template__accordion-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="rs-template__accordion-body">
                <ul class="rs-template__accordion-list">
                  ${items.map(name => `
                    <li class="rs-template__accordion-feature">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      ${this.escapeHtml(name)}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render features in a grid layout for popup modal
   */
  private renderFeaturesGrid(grouped: Record<string, string[]>, categories: [string, string[]][]): string {
    // If only one category, show simple grid
    if (categories.length <= 1) {
      const allFeatures = categories.length === 1 ? categories[0][1] : [];
      return `
        <div class="rs-template__features-grid">
          ${allFeatures.map(name => `
            <div class="rs-template__features-grid-item">
              <svg class="rs-template__features-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${this.escapeHtml(name)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Multiple categories - show with category headers
    return categories.map(([category, items]) => `
      <div class="rs-template__features-category">
        <h4 class="rs-template__features-category-title">${this.escapeHtml(category)}</h4>
        <div class="rs-template__features-grid">
          ${items.map(name => `
            <div class="rs-template__features-grid-item">
              <svg class="rs-template__features-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${this.escapeHtml(name)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  private initFeaturesAccordion(): void {
    // Accordion mode: toggle panels
    const headers = this.element.querySelectorAll<HTMLButtonElement>('.rs-template__accordion-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.rs-template__accordion-item');
        if (item) {
          item.classList.toggle('rs-template__accordion-item--open');
        }
      });
    });

    // Button/popup mode: modal open/close
    const featuresBtn = this.element.querySelector<HTMLButtonElement>('#rs-template-features-btn');
    const featuresModal = this.element.querySelector<HTMLElement>('#rs-template-features-modal');

    if (featuresBtn && featuresModal) {
      // Open modal
      featuresBtn.addEventListener('click', () => {
        featuresModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });

      // Close modal - backdrop click
      const backdrop = featuresModal.querySelector('.rs-template__features-modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          featuresModal.style.display = 'none';
          document.body.style.overflow = '';
        });
      }

      // Close modal - close button
      const closeBtn = featuresModal.querySelector('.rs-template__features-modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          featuresModal.style.display = 'none';
          document.body.style.overflow = '';
        });
      }

      // Close modal - ESC key
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && featuresModal.style.display !== 'none') {
          featuresModal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }
  }

  private formatDescription(text: string): string {
    if (!text) return '';
    const hasHtml = /<[^>]+>/g.test(text);
    if (hasHtml) return text;
    const escaped = this.escapeHtml(text);
    return escaped.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '<br>');
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('property-detail-container', RSPropertyDetailTemplate as unknown as ComponentConstructor);

export { RSPropertyDetailTemplate };
export default RSPropertyDetailTemplate;
