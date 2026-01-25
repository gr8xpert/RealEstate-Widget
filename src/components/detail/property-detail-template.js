/**
 * RealtySoft Widget v2 - Property Detail Template
 * Complete ready-made template for property detail page
 * Renders entire property detail from single container: <div id="property-detail-container"></div>
 */

class RSPropertyDetailTemplate extends RSBaseComponent {
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

        // Fallback to URL patterns
        if (!this.propertyId && !this.propertyRef) {
            this.propertyId = this.getPropertyIdFromUrl();
            this.propertyRef = this.getPropertyRefFromUrl();
        }

        this.element.classList.add('rs-property-detail-template');

        if (this.propertyId || this.propertyRef) {
            // Try to show cached property INSTANTLY
            const cached = this.getCachedProperty();
            if (cached) {
                console.log('[RealtySoft] Showing cached property instantly');
                this.property = cached;
                this.render();
                // Refresh in background
                this.loadProperty(true);
            } else {
                // No cache - show skeleton and load
                this.showSkeleton();
                this.loadProperty();
            }
        } else {
            this.showError('No property ID or reference found');
        }

        // Subscribe to property changes
        this.subscribe('currentProperty', (property) => {
            // Only re-render if property data changed significantly
            if (this.property && property && this.property.id === property.id) {
                // Update current property with fresh data
                this.property = property;
                // Only re-render if there are meaningful differences
                // (background refresh shouldn't cause visible flicker)
            } else {
                this.property = property;
                this.render();
            }
        });
    }

    /**
     * Get cached property from localStorage
     */
    getCachedProperty() {
        const idOrRef = this.propertyRef || this.propertyId;
        const isRef = !!this.propertyRef;
        return RealtySoftAPI.getCachedProperty(idOrRef, isRef);
    }

    getPropertyIdFromUrl() {
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
        // Get configurable page slug from state
        const slug = RealtySoftState.get('config.propertyPageSlug') || 'property';

        const patterns = [
            new RegExp(`^.*/${slug}/.*-([A-Z0-9]+)$`, 'i'),  // /{slug}/title-REF123
            /[?&]ref=([^&]+)/,
            /-([A-Z0-9]+)$/i
        ];
        for (const pattern of patterns) {
            const match = window.location.href.match(pattern);
            if (match && !/^\d+$/.test(match[1])) return match[1];
        }
        return null;
    }

    async loadProperty(backgroundRefresh = false) {
        try {
            if (this.propertyId) {
                await RealtySoft.loadProperty(this.propertyId);
            } else if (this.propertyRef) {
                await RealtySoft.loadPropertyByRef(this.propertyRef);
            }
        } catch (error) {
            console.error('Failed to load property:', error);
            // Only show error if we don't have cached data
            if (!this.property) {
                this.showError('Failed to load property details');
            }
        }
    }

    showLoading() {
        this.element.innerHTML = `
            <div class="rs-property-detail-template__loading">
                <div class="rs-property-detail-template__spinner"></div>
                <p>Loading property details...</p>
            </div>
        `;
    }

    /**
     * Show skeleton loader for instant perceived performance
     */
    showSkeleton() {
        this.element.innerHTML = `
            <div class="rs-property-detail-template__skeleton">
                <!-- Gallery skeleton -->
                <div class="rs-skeleton__gallery">
                    <div class="rs-skeleton__image rs-skeleton__pulse"></div>
                </div>

                <!-- Header skeleton -->
                <div class="rs-skeleton__header">
                    <div class="rs-skeleton__title rs-skeleton__pulse"></div>
                    <div class="rs-skeleton__price rs-skeleton__pulse"></div>
                    <div class="rs-skeleton__location rs-skeleton__pulse"></div>
                </div>

                <!-- Specs skeleton -->
                <div class="rs-skeleton__specs">
                    <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
                    <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
                    <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
                    <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
                </div>

                <!-- Content skeleton -->
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

    showError(message) {
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

    render() {
        if (!this.property) return;

        const p = this.property;
        const config = RealtySoftState.get('config') || {};

        // Update page title
        if (p.title) {
            document.title = `${p.title} | Property Details`;
        }

        this.element.innerHTML = `
            <!-- Gallery Section -->
            <div class="rs-template__gallery" id="rs-template-gallery"></div>

            <!-- Header Section -->
            <div class="rs-template__header">
                <div class="rs-template__header-main">
                    <h1 class="rs-template__title">${this.escapeHtml(p.title || '')}</h1>
                    <div class="rs-template__price ${p.price_on_request ? 'rs-template__price--por' : ''}">
                        ${p.price_on_request ? this.label('detail_price_on_request') : RealtySoftLabels.formatPrice(p.price)}
                    </div>
                    <div class="rs-template__location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${this.escapeHtml(p.location || p.address || '')}</span>
                    </div>
                    ${p.ref ? `<div class="rs-template__ref">Ref: ${this.escapeHtml(p.ref)}</div>` : ''}
                </div>
                <div class="rs-template__header-actions">
                    <div class="rs-template__share" id="rs-template-share"></div>
                    <div class="rs-template__wishlist" id="rs-template-wishlist"></div>
                </div>
            </div>

            <!-- Key Specs -->
            <div class="rs-template__specs">
                ${this.renderKeySpecs(p)}
            </div>

            <!-- Main Content -->
            <div class="rs-template__content">
                <div class="rs-template__main">
                    <!-- Property Information -->
                    ${this.renderPropertyInfo(p)}

                    <!-- Additional Sizes -->
                    ${this.renderAdditionalSizes(p)}

                    <!-- Description -->
                    ${p.description ? `
                        <div class="rs-template__section">
                            <h2 class="rs-template__section-title">${this.label('detail_description')}</h2>
                            <div class="rs-template__description">${this.formatDescription(p.description)}</div>
                        </div>
                    ` : ''}

                    <!-- Features -->
                    <div class="rs-template__section" id="rs-template-features"></div>

                    <!-- Additional Resources -->
                    ${this.renderResources(p)}

                    <!-- Taxes & Fees -->
                    ${this.renderTaxes(p)}

                    <!-- Energy Certificate -->
                    ${this.renderEnergy(p)}
                </div>

                <div class="rs-template__sidebar">
                    <!-- Agent Card -->
                    ${this.renderAgentCard(p)}

                    <!-- Inquiry Form -->
                    <div class="rs-template__inquiry-form" id="rs-template-inquiry"></div>
                </div>
            </div>

            <!-- Map Section -->
            <div class="rs-template__section rs-template__section--full">
                <h2 class="rs-template__section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${this.label('detail_location')} & Map
                </h2>
                <div class="rs-template__map" id="rs-template-map" data-variation="1"></div>
            </div>

            <!-- Related Properties (heading rendered by component) -->
            <div class="rs-template__section rs-template__section--full">
                <div class="rs-template__related" id="rs-template-related" data-limit="8"></div>
            </div>
        `;

        // Initialize child components
        this.initChildComponents();
    }

    renderKeySpecs(p) {
        const specs = [];

        if (p.beds && parseFloat(p.beds) > 0) {
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

        if (p.baths && parseFloat(p.baths) > 0) {
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

        if (p.built_area && parseFloat(p.built_area) > 0) {
            specs.push(`
                <div class="rs-template__spec">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <path d="M3 9h18"></path>
                        <path d="M9 21V9"></path>
                    </svg>
                    <span class="rs-template__spec-value">${p.built_area}m²</span>
                    <span class="rs-template__spec-label">${this.label('detail_built_area')}</span>
                </div>
            `);
        }

        if (p.plot_size && parseFloat(p.plot_size) > 0) {
            specs.push(`
                <div class="rs-template__spec">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                        <path d="M12 2v20"></path>
                    </svg>
                    <span class="rs-template__spec-value">${p.plot_size}m²</span>
                    <span class="rs-template__spec-label">${this.label('detail_plot_size')}</span>
                </div>
            `);
        }

        return specs.length > 0 ? specs.join('') : '';
    }

    renderPropertyInfo(p) {
        const rows = [];

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
            <div class="rs-template__section">
                <h2 class="rs-template__section-title">${this.label('detail_property_info')}</h2>
                <div class="rs-template__info-grid">
                    ${rows.map(row => `
                        <div class="rs-template__info-row">
                            <span class="rs-template__info-label">${row.label}</span>
                            <span class="rs-template__info-value">${this.escapeHtml(row.value)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAdditionalSizes(p) {
        const sizes = [];

        if (p.terrace_size && parseFloat(p.terrace_size) > 0) {
            sizes.push({ label: this.label('detail_terrace'), value: `${p.terrace_size}m²` });
        }
        if (p.solarium_size && parseFloat(p.solarium_size) > 0) {
            sizes.push({ label: this.label('detail_solarium'), value: `${p.solarium_size}m²` });
        }
        if (p.garden_size && parseFloat(p.garden_size) > 0) {
            sizes.push({ label: this.label('detail_garden'), value: `${p.garden_size}m²` });
        }
        if (p.usable_area && parseFloat(p.usable_area) > 0) {
            sizes.push({ label: this.label('detail_usable_area'), value: `${p.usable_area}m²` });
        }

        if (sizes.length === 0) return '';

        return `
            <div class="rs-template__section">
                <h2 class="rs-template__section-title">${this.label('detail_sizes')}</h2>
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

    renderResources(p) {
        const resources = [];

        if (p.video_url) {
            resources.push(`
                <a href="${p.video_url}" target="_blank" rel="noopener" class="rs-template__resource">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    ${this.label('detail_video_tour')}
                </a>
            `);
        }

        if (p.virtual_tour_url) {
            resources.push(`
                <a href="${p.virtual_tour_url}" target="_blank" rel="noopener" class="rs-template__resource">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                        <path d="M2 12h20"></path>
                    </svg>
                    ${this.label('detail_virtual_tour')}
                </a>
            `);
        }

        if (p.pdf_url) {
            resources.push(`
                <a href="${p.pdf_url}" target="_blank" rel="noopener" class="rs-template__resource">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <path d="M14 2v6h6"></path>
                        <path d="M12 18v-6"></path>
                        <path d="M9 15l3 3 3-3"></path>
                    </svg>
                    ${this.label('detail_download_pdf')}
                </a>
            `);
        }

        if (resources.length === 0) return '';

        return `
            <div class="rs-template__section">
                <h2 class="rs-template__section-title">${this.label('detail_additional_resources')}</h2>
                <div class="rs-template__resources">
                    ${resources.join('')}
                </div>
            </div>
        `;
    }

    renderTaxes(p) {
        const taxes = [];

        if (p.community_fees && parseFloat(p.community_fees) > 0) {
            taxes.push({
                label: this.label('detail_community_fees'),
                value: RealtySoftLabels.formatPrice(p.community_fees) + this.label('detail_per_month')
            });
        }
        if (p.ibi_tax && parseFloat(p.ibi_tax) > 0) {
            taxes.push({
                label: this.label('detail_ibi_tax'),
                value: RealtySoftLabels.formatPrice(p.ibi_tax) + this.label('detail_per_year')
            });
        }
        if (p.basura_tax && parseFloat(p.basura_tax) > 0) {
            taxes.push({
                label: this.label('detail_basura_tax'),
                value: RealtySoftLabels.formatPrice(p.basura_tax) + this.label('detail_per_year')
            });
        }

        if (taxes.length === 0) return '';

        return `
            <div class="rs-template__section">
                <h2 class="rs-template__section-title">${this.label('detail_taxes_fees')}</h2>
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

    renderEnergy(p) {
        // Check if energy_rating is actually an image URL (API sometimes returns image in this field)
        const isEnergyRatingUrl = p.energy_rating && (
            p.energy_rating.includes('http') ||
            p.energy_rating.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
        );
        const isCo2RatingUrl = p.co2_rating && (
            p.co2_rating.includes('http') ||
            p.co2_rating.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
        );

        // Get actual letter ratings (only if not URLs)
        const energyRating = !isEnergyRatingUrl ? p.energy_rating : null;
        const co2Rating = !isCo2RatingUrl ? p.co2_rating : null;

        // Collect all energy certificate images
        const energyImages = [];
        if (isEnergyRatingUrl) energyImages.push(p.energy_rating);
        if (isCo2RatingUrl) energyImages.push(p.co2_rating);
        if (p.energy_certificate_image) energyImages.push(p.energy_certificate_image);

        // Nothing to show
        if (!energyRating && !co2Rating && energyImages.length === 0) return '';

        return `
            <div class="rs-template__section">
                <h2 class="rs-template__section-title">${this.label('detail_energy_certificate')}</h2>
                <div class="rs-template__energy">
                    ${energyRating ? `
                        <div class="rs-template__energy-rating">
                            <span class="rs-template__energy-label">${this.label('detail_energy_rating')}</span>
                            <span class="rs-template__energy-badge rs-template__energy-badge--${(energyRating || 'na').toLowerCase()}">${energyRating || 'N/A'}</span>
                        </div>
                    ` : ''}
                    ${co2Rating ? `
                        <div class="rs-template__energy-rating">
                            <span class="rs-template__energy-label">${this.label('detail_co2_rating')}</span>
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

    renderAgentCard(p) {
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

    initChildComponents() {
        const p = this.property;

        // Gallery
        const galleryEl = this.element.querySelector('#rs-template-gallery');
        if (galleryEl && !galleryEl._rsComponent) {
            new RSDetailGallery(galleryEl, { property: p });
        }

        // Features
        const featuresEl = this.element.querySelector('#rs-template-features');
        if (featuresEl && !featuresEl._rsComponent && p.features && p.features.length > 0) {
            new RSDetailFeatures(featuresEl, { property: p });
        }

        // Share
        const shareEl = this.element.querySelector('#rs-template-share');
        if (shareEl && !shareEl._rsComponent) {
            new RSDetailShare(shareEl, { property: p });
        }

        // Wishlist
        const wishlistEl = this.element.querySelector('#rs-template-wishlist');
        if (wishlistEl && !wishlistEl._rsComponent) {
            new RSDetailWishlist(wishlistEl, { property: p });
        }

        // Map
        const mapEl = this.element.querySelector('#rs-template-map');
        if (mapEl && !mapEl._rsComponent) {
            new RSDetailMap(mapEl, { property: p });
        }

        // Inquiry Form
        const inquiryEl = this.element.querySelector('#rs-template-inquiry');
        if (inquiryEl && !inquiryEl._rsComponent) {
            new RSDetailInquiryForm(inquiryEl, { property: p });
        }

        // Related Properties
        const relatedEl = this.element.querySelector('#rs-template-related');
        if (relatedEl && !relatedEl._rsComponent) {
            new RSDetailRelated(relatedEl, { property: p });
        }
    }

    formatDescription(text) {
        if (!text) return '';
        const hasHtml = /<[^>]+>/g.test(text);
        if (hasHtml) return text;
        const escaped = this.escapeHtml(text);
        return escaped.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '<br>');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Register component
RealtySoft.registerComponent('property-detail-container', RSPropertyDetailTemplate);
