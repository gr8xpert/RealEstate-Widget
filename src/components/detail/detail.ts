/**
 * RealtySoft Widget v3 - Detail Component
 * Main wrapper for property detail page, loads property and populates child components
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  Property,
  RealtySoftModule,
  RealtySoftLabelsModule,
  RealtySoftStateModule
} from '../../types/index';
import { RSDetailBackButton } from './back-button';
import { RSDetailGallery } from './gallery';
import { RSDetailFeatures } from './features';
import { RSDetailMap } from './map';
import { RSDetailInquiryForm } from './inquiry-form';
import { RSDetailWishlist } from './wishlist';
import { RSDetailShare } from './share';
import { RSDetailRelated } from './related';
import { RSDetailInfoTable } from './info-table';
import { RSDetailSpecs } from './specs';
import { RSDetailSizes } from './sizes';
import { RSDetailTaxes } from './taxes';
import { RSDetailEnergy } from './energy';
import { RSDetailResources } from './resources';
import { RSDetailPdfButton } from './pdf-button';
import { RSDetailVideoEmbed } from './video-embed';
import { RSMortgageCalculator } from './mortgage-calculator';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftState: RealtySoftStateModule;

// Extended HTMLElement with component reference
interface RSHTMLElement extends HTMLElement {
  _rsComponent?: unknown;
}

class RSDetail extends RSBaseComponent {
  private property: Property | null = null;
  private propertyId: string | null = null;
  private propertyRef: string | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.property = null;
    this.propertyId = null;
    this.propertyRef = null;

    // Debug: Log current URL and config
    console.log('[RealtySoft] Detail init - URL:', window.location.href);
    console.log('[RealtySoft] Detail init - pathname:', window.location.pathname);
    console.log('[RealtySoft] Detail init - propertyPageSlugs:', RealtySoftState.get('config.propertyPageSlugs'));
    console.log('[RealtySoft] Detail init - translationPlugin:', RealtySoftState.get('config.translationPlugin'));
    console.log('[RealtySoft] Detail init - languagePrefix:', RealtySoftState.get('config.languagePrefix'));

    // Clear stale PHP prefetch if it doesn't match the current URL
    this.clearStalePrefetch();

    // Priority 1: Check URL patterns first (SEO-friendly URLs)
    this.propertyId = this.getPropertyIdFromUrl();
    this.propertyRef = this.getPropertyRefFromUrl();

    // Priority 2: Fallback to data attributes (for embedded/widget usage)
    if (!this.propertyId && !this.propertyRef) {
      const dataId = this.element.dataset.propertyId;
      const dataRef = this.element.dataset.propertyRef;

      // Auto-detect: if dataId contains letters, treat it as a reference
      if (dataId) {
        if (/^\d+$/.test(dataId)) {
          // Pure numeric = ID
          this.propertyId = dataId;
        } else {
          // Contains letters = Reference
          this.propertyRef = dataId;
        }
      }

      if (dataRef) {
        this.propertyRef = dataRef;
      }
    }

    // Priority 3: Check for auto-injected reference stored globally
    if (!this.propertyId && !this.propertyRef && window._rsAutoInjectedRef) {
      this.propertyRef = window._rsAutoInjectedRef;
    }

    // Priority 4: Use PHP prefetch ref as ultimate fallback
    // This handles cases where JS URL extraction fails but PHP extracted correctly
    if (!this.propertyId && !this.propertyRef) {
      const prefetch = (window as unknown as { __rsPrefetch?: { ref?: string } }).__rsPrefetch;
      if (prefetch?.ref) {
        console.log('[RealtySoft] Using prefetch ref as fallback:', prefetch.ref);
        this.propertyRef = prefetch.ref;
      }
    }

    this.element.classList.add('rs-detail');

    if (this.propertyId || this.propertyRef) {
      // RACE CONDITION FIX: Use direct API return with validation
      this.loadProperty().then(property => {
        if (property) {
          // Validate the property matches what we asked for
          if (this.propertyRef && property.ref?.toLowerCase() !== this.propertyRef.toLowerCase()) {
            console.warn('[RealtySoft] Property ref mismatch - expected:', this.propertyRef, 'got:', property.ref);
            return;
          }
          this.property = property;
          this.populateComponents();
        }
      });
    } else {
      console.warn('[RealtySoft] No property ID or reference found');
      this.showError();
    }

    // Subscribe only for background updates to the SAME property
    this.subscribe<Property>('currentProperty', (property) => {
      // Only update if we already have a property AND it's the same ID
      if (!property || !this.property) return;
      if (property.id !== this.property.id) return;

      this.property = property;
      this.populateComponents();
    });
  }

  private getPropertyIdFromUrl(): string | null {
    // Get all possible property page slugs for pattern matching
    const slugs = RealtySoftState.get<Record<string, string>>('config.propertyPageSlugs') || {};
    const defaultSlug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';
    const allSlugs = [...new Set([...Object.values(slugs), defaultSlug, 'property'])];

    // Build patterns that handle language prefixes and all slug variants
    const patterns: RegExp[] = [];
    for (const slug of allSlugs) {
      // With optional language prefix: /es/propiedad/123 or /propiedad/123
      patterns.push(new RegExp(`(?:/[a-z]{2}(?:-[a-z]{2})?)?/${slug}/(\\d+)`, 'i'));
    }
    // Query parameter patterns
    patterns.push(/[?&]id=(\d+)/);
    patterns.push(/[?&]property_id=(\d+)/);

    for (const pattern of patterns) {
      const match = window.location.href.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private getPropertyRefFromUrl(): string | null {
    // Try query parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const queryRef = urlParams.get('ref');
    if (queryRef) return queryRef.trim();

    // Extract from SEO-friendly URL path
    let path = window.location.pathname;
    const originalPath = path;

    // Remove language prefix if present (e.g., /es/propiedad/villa → /propiedad/villa)
    // Handles 2-letter codes and locale codes like "es-es" or "en-gb"
    path = path.replace(/^\/[a-z]{2}(-[a-z]{2})?\//i, '/');

    console.log('[RealtySoft] URL extraction - original:', originalPath, 'cleaned:', path);

    const pathParts = path.split('/').filter(p => p);
    const lastPart = pathParts[pathParts.length - 1];

    console.log('[RealtySoft] URL extraction - pathParts:', pathParts, 'lastPart:', lastPart);

    if (lastPart) {
      const cleanPart = lastPart.replace('.html', '');

      // Patterns to extract reference from URL slug
      const patterns: [RegExp, string][] = [
        [/([A-Z]{1,4}\d+)/i, '1-4 letters + digits'],
        [/(\d{6,})/, '6+ digits'],
        [/([A-Z]{2,}\d*-\d+)/i, 'letters-digits format'],
        [/-([A-Z0-9]+)$/i, 'suffix after dash']
      ];

      for (const [pattern, desc] of patterns) {
        const match = cleanPart.match(pattern);
        if (match) {
          console.log('[RealtySoft] URL extraction - matched pattern:', desc, 'result:', match[1]);
          return match[1];
        }
      }

      // If no pattern matched but it's a simple string without dashes
      if (!cleanPart.includes('-')) {
        console.log('[RealtySoft] URL extraction - no pattern matched, using cleanPart:', cleanPart);
        return cleanPart;
      }
    }

    console.log('[RealtySoft] URL extraction - no ref found');
    return null;
  }

  /**
   * Clear stale PHP prefetch data that doesn't match current URL
   * Only clear if we can positively determine there's a mismatch
   */
  private clearStalePrefetch(): void {
    const prefetch = (window as any).__rsPrefetch;
    if (!prefetch) return;

    const urlRef = this.getPropertyRefFromUrl();
    const prefetchRef = prefetch.ref;

    // Only clear if we extracted a URL ref AND it doesn't match the prefetch
    // If we couldn't extract from URL, trust the PHP-extracted ref
    if (urlRef && prefetchRef && urlRef.toLowerCase() !== prefetchRef.toLowerCase()) {
      console.log('[RealtySoft] Clearing stale prefetch - URL ref:', urlRef, 'prefetch ref:', prefetchRef);
      delete (window as any).__rsPrefetch;
    } else if (urlRef && !prefetchRef) {
      // URL has ref but prefetch doesn't - clear it
      console.log('[RealtySoft] Clearing prefetch - no prefetch ref');
      delete (window as any).__rsPrefetch;
    }
    // If urlRef is null, don't clear - PHP might have extracted it correctly
  }

  private async loadProperty(): Promise<Property | null> {
    this.element.classList.add('rs-detail--loading');

    try {
      let property: Property | null = null;
      if (this.propertyId) {
        property = await RealtySoft.loadProperty(parseInt(this.propertyId));
      } else if (this.propertyRef) {
        property = await RealtySoft.loadPropertyByRef(this.propertyRef);
      }
      return property;
    } catch (error) {
      console.error('[RealtySoft] Failed to load property:', error);
      this.showError();
      return null;
    } finally {
      this.element.classList.remove('rs-detail--loading');
    }
  }

  private populateComponents(): void {
    if (!this.property) return;

    const p = this.property;

    // Simple text components - comprehensive list of all detail fields
    const textMappings: Record<string, string | number | null | undefined> = {
      // Basic Info
      'rs_detail_title': p.title,
      'rs_detail_price': p.price_on_request ? this.label('detail_price_on_request') : RealtySoftLabels.formatPrice(p.price),
      'rs_detail_ref': p.ref,
      'rs_detail_unique_ref': p.unique_ref,
      'rs_detail_location': p.location,
      'rs_detail_address': p.address,
      'rs_detail_postal_code': p.postal_code,
      'rs_detail_type': p.type,
      'rs_detail_status': p.status,
      // Specs
      'rs_detail_beds': p.beds && parseFloat(String(p.beds)) > 0 ? p.beds : '',
      'rs_detail_baths': p.baths && parseFloat(String(p.baths)) > 0 ? p.baths : '',
      'rs_detail_built': p.built_area && parseFloat(String(p.built_area)) > 0 ? `${p.built_area} m²` : '',
      'rs_detail_plot': p.plot_size && parseFloat(String(p.plot_size)) > 0 ? `${p.plot_size} m²` : '',
      'rs_detail_terrace': p.terrace_size && parseFloat(String(p.terrace_size)) > 0 ? `${p.terrace_size} m²` : '',
      'rs_detail_solarium': p.solarium_size && parseFloat(String(p.solarium_size)) > 0 ? `${p.solarium_size} m²` : '',
      'rs_detail_garden': p.garden_size && parseFloat(String(p.garden_size)) > 0 ? `${p.garden_size} m²` : '',
      'rs_detail_usable': p.usable_area && parseFloat(String(p.usable_area)) > 0 ? `${p.usable_area} m²` : '',
      'rs_detail_year': p.year_built,
      'rs_detail_floor': p.floor,
      'rs_detail_orientation': p.orientation,
      'rs_detail_parking': p.parking,
      'rs_detail_furnished': p.furnished,
      'rs_detail_condition': p.condition,
      'rs_detail_views': p.views,
      // Taxes & Fees
      'rs_detail_community_fees': p.community_fees && parseFloat(String(p.community_fees)) > 0 ? RealtySoftLabels.formatPrice(p.community_fees) + '/mo' : '',
      'rs_detail_ibi_tax': p.ibi_tax && parseFloat(String(p.ibi_tax)) > 0 ? RealtySoftLabels.formatPrice(p.ibi_tax) + '/yr' : '',
      'rs_detail_basura_tax': p.basura_tax && parseFloat(String(p.basura_tax)) > 0 ? RealtySoftLabels.formatPrice(p.basura_tax) + '/yr' : '',
      // Energy
      'rs_detail_energy_rating': p.energy_rating,
      'rs_detail_co2_rating': p.co2_rating,
      'rs_detail_energy_consumption': p.energy_consumption,
      // Content
      'rs_detail_description': this.formatDescription(p.description),
      // Agent
      'rs_detail_agent_name': p.agent?.name,
      'rs_detail_agent_phone': p.agent?.phone,
      'rs_detail_agent_email': p.agent?.email
    };

    for (const [className, value] of Object.entries(textMappings)) {
      this.element.querySelectorAll<HTMLElement>(`.${className}`).forEach(el => {
        if (value !== undefined && value !== null && value !== '') {
          el.innerHTML = String(value);
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });
    }

    // Agent card - hide entire card if no useful agent data
    const hasAgentName = p.agent?.name && p.agent.name.trim() && p.agent.name.toLowerCase() !== 'undefined';
    const hasAgentPhone = p.agent?.phone && p.agent.phone.trim();
    const hasAgentEmail = p.agent?.email && p.agent.email.trim();
    const hasAgentData = hasAgentName || hasAgentPhone || hasAgentEmail;

    this.element.querySelectorAll<HTMLElement>('.rs_detail_agent').forEach(el => {
      el.style.display = hasAgentData ? '' : 'none';
    });

    // Agent phone link
    this.element.querySelectorAll<HTMLElement>('.rs_detail_agent_phone').forEach(el => {
      if (hasAgentPhone && p.agent) {
        el.textContent = p.agent.phone;
        if (el.tagName === 'A') {
          (el as HTMLAnchorElement).href = `tel:${p.agent.phone.replace(/\s/g, '')}`;
        }
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Agent email link
    this.element.querySelectorAll<HTMLElement>('.rs_detail_agent_email').forEach(el => {
      if (hasAgentEmail && p.agent) {
        el.textContent = p.agent.email;
        if (el.tagName === 'A') {
          (el as HTMLAnchorElement).href = `mailto:${p.agent.email}`;
        }
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Agent photo
    this.element.querySelectorAll<HTMLElement>('.rs_detail_agent_photo').forEach(el => {
      if (p.agent?.photo) {
        el.innerHTML = `<img src="${p.agent.photo}" alt="${this.escapeHtml(p.agent.name || '')}">`;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Instantiate child detail components
    const componentMappings: [string, new (el: HTMLElement, opts: ComponentOptions) => RSBaseComponent][] = [
      ['.rs_detail_back', RSDetailBackButton],
      ['.rs_detail_gallery', RSDetailGallery],
      ['.rs_detail_features', RSDetailFeatures],
      ['.rs_detail_map', RSDetailMap],
      ['.rs_detail_inquiry_form', RSDetailInquiryForm],
      ['.rs_detail_wishlist', RSDetailWishlist],
      ['.rs_detail_share', RSDetailShare],
      ['.rs_detail_related', RSDetailRelated],
      ['.rs_detail_info_table', RSDetailInfoTable],
      ['.rs_detail_specs', RSDetailSpecs],
      ['.rs_detail_sizes', RSDetailSizes],
      ['.rs_detail_taxes', RSDetailTaxes],
      ['.rs_detail_energy', RSDetailEnergy],
      ['.rs_detail_resources', RSDetailResources],
      ['.rs_detail_pdf', RSDetailPdfButton],
      ['.rs_detail_video_embed', RSDetailVideoEmbed],
      ['.rs_mortgage_calculator', RSMortgageCalculator],
    ];

    for (const [selector, ComponentClass] of componentMappings) {
      this.element.querySelectorAll<RSHTMLElement>(selector).forEach(el => {
        if (!el._rsComponent) {
          new ComponentClass(el, { property: p } as ComponentOptions);
        }
      });
    }

    // Energy certificate image (standalone)
    this.element.querySelectorAll<HTMLElement>('.rs_detail_energy_image').forEach(el => {
      if (p.energy_certificate_image) {
        el.innerHTML = `<img src="${p.energy_certificate_image}" alt="${this.label('detail_energy_certificate')}">`;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Video link (standalone)
    this.element.querySelectorAll<HTMLElement>('.rs_detail_video_link').forEach(el => {
      if (p.video_url) {
        if (el.tagName === 'A') {
          (el as HTMLAnchorElement).href = p.video_url;
          (el as HTMLAnchorElement).target = '_blank';
        }
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Virtual tour link (standalone)
    this.element.querySelectorAll<HTMLElement>('.rs_detail_tour_link').forEach(el => {
      if (p.virtual_tour_url) {
        if (el.tagName === 'A') {
          (el as HTMLAnchorElement).href = p.virtual_tour_url;
          (el as HTMLAnchorElement).target = '_blank';
        }
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // PDF link (standalone)
    this.element.querySelectorAll<HTMLElement>('.rs_detail_pdf_link').forEach(el => {
      if (p.pdf_url) {
        if (el.tagName === 'A') {
          (el as HTMLAnchorElement).href = p.pdf_url;
          (el as HTMLAnchorElement).target = '_blank';
        }
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Update page title
    if (p.title) {
      document.title = `${p.title} | ${document.title.split('|').pop()?.trim() || 'Property'}`;
    }
  }

  private formatDescription(text: string): string {
    if (!text) return '';

    // Check if text already contains HTML tags
    const hasHtml = /<[^>]+>/g.test(text);

    if (hasHtml) {
      return text;
    }

    // Convert plain text line breaks to HTML
    const escaped = this.escapeHtml(text);
    return escaped
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '<br>');
  }

  private showError(): void {
    this.element.innerHTML = `
      <div class="rs-detail__error">
        <p>${this.label('general_error')}</p>
        <button class="rs-detail__retry" onclick="location.reload()">
          ${this.label('general_retry')}
        </button>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register component
RealtySoft.registerComponent('rs_detail', RSDetail as unknown as ComponentConstructor);

export { RSDetail };
export default RSDetail;
