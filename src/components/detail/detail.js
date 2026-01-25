/**
 * RealtySoft Widget v2 - Detail Component
 * Main wrapper for property detail page, loads property and populates child components
 */

class RSDetail extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.property = null;
        this.propertyId = null;
        this.propertyRef = null;

        // Check for property ID/Ref in data attributes first
        const dataId = this.element.dataset.propertyId;
        const dataRef = this.element.dataset.propertyRef;

        console.log('[RealtySoft] RSDetail init - dataId:', dataId, 'dataRef:', dataRef);

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

        // Fallback to URL patterns if no data attributes
        if (!this.propertyId && !this.propertyRef) {
            console.log('[RealtySoft] No data attributes, extracting from URL...');
            this.propertyId = this.getPropertyIdFromUrl();
            this.propertyRef = this.getPropertyRefFromUrl();
        }

        // Also check for auto-injected reference stored globally
        if (!this.propertyId && !this.propertyRef && window._rsAutoInjectedRef) {
            console.log('[RealtySoft] Using auto-injected ref:', window._rsAutoInjectedRef);
            this.propertyRef = window._rsAutoInjectedRef;
        }

        console.log('[RealtySoft] RSDetail resolved - propertyId:', this.propertyId, 'propertyRef:', this.propertyRef);

        this.element.classList.add('rs-detail');

        if (this.propertyId || this.propertyRef) {
            console.log('[RealtySoft] Loading property...');
            this.loadProperty();
        } else {
            console.warn('[RealtySoft] No property ID or reference found');
            this.showError();
        }

        // Subscribe to property changes
        this.subscribe('currentProperty', (property) => {
            console.log('[RealtySoft] Property loaded via state subscription:', property?.ref);
            this.property = property;
            this.populateComponents();
        });
    }

    getPropertyIdFromUrl() {
        // Try different URL patterns
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

    getPropertyRefFromUrl() {
        // Try query parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const queryRef = urlParams.get('ref');
        if (queryRef) return queryRef.trim();

        // Extract from SEO-friendly URL path
        // URL format: /property/title-slug-R12345 or /property/R12345
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(p => p);
        const lastPart = pathParts[pathParts.length - 1];

        if (lastPart) {
            const cleanPart = lastPart.replace('.html', '');

            // Patterns to extract reference from URL slug
            // Order matters - more specific patterns first
            const patterns = [
                /([A-Z]{1,4}\d+)/i,          // R12345, ABC123 (reference with letters+numbers)
                /(\d{6,})/,                    // 123456 (6+ digit numeric ID)
                /([A-Z]{2,}\d*-\d+)/i,         // ABC-123 format
                /-([A-Z0-9]+)$/i               // Last segment after dash: title-slug-REF
            ];

            for (const pattern of patterns) {
                const match = cleanPart.match(pattern);
                if (match) return match[1];
            }

            // If no pattern matched but it's a simple string without dashes
            if (!cleanPart.includes('-')) return cleanPart;
        }

        return null;
    }

    async loadProperty() {
        console.log('[RealtySoft] loadProperty() called - id:', this.propertyId, 'ref:', this.propertyRef);
        this.element.classList.add('rs-detail--loading');

        try {
            let result;
            if (this.propertyId) {
                console.log('[RealtySoft] Loading by ID:', this.propertyId);
                result = await RealtySoft.loadProperty(this.propertyId);
            } else if (this.propertyRef) {
                console.log('[RealtySoft] Loading by Ref:', this.propertyRef);
                result = await RealtySoft.loadPropertyByRef(this.propertyRef);
            }
            console.log('[RealtySoft] Load result:', result ? 'success' : 'no result');
        } catch (error) {
            console.error('[RealtySoft] Failed to load property:', error);
            this.showError();
        }

        this.element.classList.remove('rs-detail--loading');
    }

    populateComponents() {
        if (!this.property) return;

        const p = this.property;

        // Simple text components - comprehensive list of all detail fields
        const textMappings = {
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
            // Specs - use parseFloat to handle string "0" from API
            'rs_detail_beds': p.beds && parseFloat(p.beds) > 0 ? p.beds : '',
            'rs_detail_baths': p.baths && parseFloat(p.baths) > 0 ? p.baths : '',
            'rs_detail_built': p.built_area && parseFloat(p.built_area) > 0 ? `${p.built_area} m²` : '',
            'rs_detail_plot': p.plot_size && parseFloat(p.plot_size) > 0 ? `${p.plot_size} m²` : '',
            'rs_detail_terrace': p.terrace_size && parseFloat(p.terrace_size) > 0 ? `${p.terrace_size} m²` : '',
            'rs_detail_solarium': p.solarium_size && parseFloat(p.solarium_size) > 0 ? `${p.solarium_size} m²` : '',
            'rs_detail_garden': p.garden_size && parseFloat(p.garden_size) > 0 ? `${p.garden_size} m²` : '',
            'rs_detail_usable': p.usable_area && parseFloat(p.usable_area) > 0 ? `${p.usable_area} m²` : '',
            'rs_detail_year': p.year_built,
            'rs_detail_floor': p.floor,
            'rs_detail_orientation': p.orientation,
            'rs_detail_parking': p.parking,
            'rs_detail_furnished': p.furnished,
            'rs_detail_condition': p.condition,
            'rs_detail_views': p.views,
            // Taxes & Fees - use parseFloat to handle string "0" from API
            'rs_detail_community_fees': p.community_fees && parseFloat(p.community_fees) > 0 ? RealtySoftLabels.formatPrice(p.community_fees) + '/mo' : '',
            'rs_detail_ibi_tax': p.ibi_tax && parseFloat(p.ibi_tax) > 0 ? RealtySoftLabels.formatPrice(p.ibi_tax) + '/yr' : '',
            'rs_detail_basura_tax': p.basura_tax && parseFloat(p.basura_tax) > 0 ? RealtySoftLabels.formatPrice(p.basura_tax) + '/yr' : '',
            // Energy
            'rs_detail_energy_rating': p.energy_rating,
            'rs_detail_co2_rating': p.co2_rating,
            'rs_detail_energy_consumption': p.energy_consumption,
            // Content - description handled separately for formatting
            'rs_detail_description': this.formatDescription(p.description),
            // Agent
            'rs_detail_agent_name': p.agent?.name,
            'rs_detail_agent_phone': p.agent?.phone,
            'rs_detail_agent_email': p.agent?.email
        };

        for (const [className, value] of Object.entries(textMappings)) {
            this.element.querySelectorAll(`.${className}`).forEach(el => {
                if (value !== undefined && value !== null && value !== '') {
                    el.innerHTML = value;
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

        this.element.querySelectorAll('.rs_detail_agent').forEach(el => {
            if (!hasAgentData) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        });

        // Agent phone link
        this.element.querySelectorAll('.rs_detail_agent_phone').forEach(el => {
            if (hasAgentPhone) {
                el.textContent = p.agent.phone;
                if (el.tagName === 'A') {
                    el.href = `tel:${p.agent.phone.replace(/\s/g, '')}`;
                }
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // Agent email link
        this.element.querySelectorAll('.rs_detail_agent_email').forEach(el => {
            if (hasAgentEmail) {
                el.textContent = p.agent.email;
                if (el.tagName === 'A') {
                    el.href = `mailto:${p.agent.email}`;
                }
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // Agent photo
        this.element.querySelectorAll('.rs_detail_agent_photo').forEach(el => {
            if (p.agent?.photo) {
                el.innerHTML = `<img src="${p.agent.photo}" alt="${this.escapeHtml(p.agent.name || '')}">`;
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // Back to Search button
        this.element.querySelectorAll('.rs_detail_back').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailBackButton(el, { property: p });
            }
        });

        // Gallery
        this.element.querySelectorAll('.rs_detail_gallery').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailGallery(el, { property: p });
            }
        });

        // Features
        this.element.querySelectorAll('.rs_detail_features').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailFeatures(el, { property: p });
            }
        });

        // Map
        this.element.querySelectorAll('.rs_detail_map').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailMap(el, { property: p });
            }
        });

        // Inquiry form
        this.element.querySelectorAll('.rs_detail_inquiry_form').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailInquiryForm(el, { property: p });
            }
        });

        // Wishlist button
        this.element.querySelectorAll('.rs_detail_wishlist').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailWishlist(el, { property: p });
            }
        });

        // Share buttons
        this.element.querySelectorAll('.rs_detail_share').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailShare(el, { property: p });
            }
        });

        // Related properties
        this.element.querySelectorAll('.rs_detail_related').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailRelated(el, { property: p });
            }
        });

        // Property Info Table
        this.element.querySelectorAll('.rs_detail_info_table').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailInfoTable(el, { property: p });
            }
        });

        // Key Specs (Beds, Baths, Built, Plot, Terrace)
        this.element.querySelectorAll('.rs_detail_specs').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailSpecs(el, { property: p });
            }
        });

        // Additional Sizes
        this.element.querySelectorAll('.rs_detail_sizes').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailSizes(el, { property: p });
            }
        });

        // Taxes & Fees
        this.element.querySelectorAll('.rs_detail_taxes').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailTaxes(el, { property: p });
            }
        });

        // Energy Certificate
        this.element.querySelectorAll('.rs_detail_energy').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailEnergy(el, { property: p });
            }
        });

        // Resources (Video, Virtual Tour, PDF)
        this.element.querySelectorAll('.rs_detail_resources').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailResources(el, { property: p });
            }
        });

        // PDF Button (standalone)
        this.element.querySelectorAll('.rs_detail_pdf').forEach(el => {
            if (!el._rsComponent) {
                new RSDetailPdfButton(el, { property: p });
            }
        });

        // Energy certificate image (standalone)
        this.element.querySelectorAll('.rs_detail_energy_image').forEach(el => {
            if (p.energy_certificate_image) {
                el.innerHTML = `<img src="${p.energy_certificate_image}" alt="${this.label('detail_energy_certificate')}">`;
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // Video link (standalone)
        this.element.querySelectorAll('.rs_detail_video_link').forEach(el => {
            if (p.video_url) {
                if (el.tagName === 'A') {
                    el.href = p.video_url;
                    el.target = '_blank';
                }
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // Virtual tour link (standalone)
        this.element.querySelectorAll('.rs_detail_tour_link').forEach(el => {
            if (p.virtual_tour_url) {
                if (el.tagName === 'A') {
                    el.href = p.virtual_tour_url;
                    el.target = '_blank';
                }
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // PDF link (standalone)
        this.element.querySelectorAll('.rs_detail_pdf_link').forEach(el => {
            if (p.pdf_url) {
                if (el.tagName === 'A') {
                    el.href = p.pdf_url;
                    el.target = '_blank';
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

    formatDescription(text) {
        if (!text) return '';

        // Check if text already contains HTML tags
        const hasHtml = /<[^>]+>/g.test(text);

        if (hasHtml) {
            // Already has HTML, return as-is
            return text;
        }

        // Convert plain text line breaks to HTML
        // First escape HTML entities for safety
        const escaped = this.escapeHtml(text);
        // Then convert line breaks to <br> tags
        return escaped
            .replace(/\r\n/g, '<br>')
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '<br>');
    }

    showError() {
        this.element.innerHTML = `
            <div class="rs-detail__error">
                <p>${this.label('general_error')}</p>
                <button class="rs-detail__retry" onclick="location.reload()">
                    ${this.label('general_retry')}
                </button>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Register component
RealtySoft.registerComponent('rs_detail', RSDetail);
