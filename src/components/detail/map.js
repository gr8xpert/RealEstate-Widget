/**
 * RealtySoft Widget v2 - Detail Map Component
 * Interactive location map with multiple precision levels:
 *
 * Variations (data-variation attribute):
 * 0 = Auto-detect (best available: pinpoint > zipcode > municipality)
 * 1 = Municipality (default) - shows municipality/area boundary
 * 2 = Pinpoint - exact location with marker via lat/lng
 * 3 = Zipcode - postal code area boundary
 *
 * Features:
 * - Auto-detection of best map mode based on available data
 * - View larger map link
 * - Get directions link
 * - Fallback chain: pinpoint -> zipcode -> municipality -> country
 *
 * Usage: <div class="rs_detail_map" data-variation="0"></div>
 */

class RSDetailMap extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        // Get property from options (set before super() calls init())
        this.property = this.options?.property;

        if (!this.property) {
            this.element.style.display = 'none';
            return;
        }

        // Extract location data
        const p = this.property;
        const orig = p._original || {};

        // Get coordinates
        this.lat = p.latitude || p.lat || orig.latitude || orig.lat || null;
        this.lng = p.longitude || p.lng || orig.longitude || orig.lng || null;
        this.hasCoords = this.hasValidCoordinates();

        // Get location info
        this.locationName = orig.location_id?.name || p.location || '';
        this.municipality = orig.municipality_id?.name || orig.municipality || '';
        this.province = orig.province_id?.name || orig.province || '';
        this.zipcode = p.postal_code || orig.zipcode || orig.postal_code || '';
        this.country = orig.country || 'Spain';

        // Build display location string
        this.displayLocation = this.buildDisplayLocation();

        // Check if we have any location data
        const hasLocation = this.locationName || this.municipality || this.province || this.zipcode || this.hasCoords;

        if (!hasLocation) {
            this.element.style.display = 'none';
            return;
        }

        // Get variation from data attribute
        // 0=auto, 1=municipality (default), 2=pinpoint, 3=zipcode
        const variationAttr = this.element.dataset.variation;
        const variationNum = parseInt(variationAttr);

        // Default to municipality (1) if not specified or invalid
        const finalVariation = (!variationAttr || isNaN(variationNum)) ? 1 : variationNum;
        this.currentMode = this.getVariationMode(finalVariation);

        console.log('[RealtySoft] Map variation:', variationAttr, '-> mode:', this.currentMode);
        console.log('[RealtySoft] Map location data - locationName:', this.locationName, 'municipality:', this.municipality, 'zipcode:', this.zipcode);

        this.render();
    }

    /**
     * Check if property has valid coordinates
     */
    hasValidCoordinates() {
        const lat = parseFloat(this.lat);
        const lng = parseFloat(this.lng);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    }

    /**
     * Build display location string
     */
    buildDisplayLocation() {
        const parts = [
            this.locationName || this.municipality,
            this.province
        ].filter(Boolean);
        return parts.join(', ');
    }

    /**
     * Determine which map variation to use
     * Supports auto-detection (variation 0)
     */
    getVariationMode(num) {
        switch (num) {
            case 0:
                // Auto-detect: use best available option
                if (this.hasCoords) {
                    return 'pinpoint';
                } else if (this.zipcode) {
                    return 'zipcode';
                } else {
                    return 'municipality';
                }

            case 2:
                // Pinpoint - only if coordinates available, fallback to municipality
                return this.hasCoords ? 'pinpoint' : 'municipality';

            case 3:
                // Zipcode - only if available, fallback to municipality
                return this.zipcode ? 'zipcode' : 'municipality';

            case 1:
            default:
                return 'municipality';
        }
    }

    render() {
        this.element.classList.add('rs-detail-map');

        const mapUrl = this.buildMapUrl(this.currentMode);
        const directionsUrl = this.buildDirectionsUrl();
        const largerMapUrl = this.buildLargerMapUrl();

        // Build map actions HTML
        const showActions = directionsUrl || largerMapUrl;
        const actionsHtml = showActions ? `
            <div class="rs-detail-map__actions">
                ${largerMapUrl ? `
                    <a href="${largerMapUrl}" target="_blank" rel="noopener noreferrer" class="rs-detail-map__action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                        ${this.label('detail_view_larger_map') || 'View Larger Map'}
                    </a>
                ` : ''}
                ${directionsUrl ? `
                    <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="rs-detail-map__action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                        </svg>
                        ${this.label('detail_get_directions') || 'Get Directions'}
                    </a>
                ` : ''}
            </div>
        ` : '';

        this.element.innerHTML = `
            <div class="rs-detail-map__header">
                <h3 class="rs-detail-map__title">${this.label('detail_location') || 'Location'}</h3>
                ${this.displayLocation ? `<p class="rs-detail-map__address">${this.displayLocation}</p>` : ''}
            </div>
            <div class="rs-detail-map__container rs-detail-map__container--fullwidth">
                <div class="rs-detail-map__loading">
                    <div class="rs-detail-map__spinner"></div>
                    <p>${this.label('detail_loading_map') || 'Loading map...'}</p>
                </div>
                <iframe
                    class="rs-detail-map__iframe"
                    src="${mapUrl}"
                    loading="lazy"
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade"
                    onload="this.previousElementSibling.style.display='none'">
                </iframe>
            </div>
            ${actionsHtml}
        `;
    }

    /**
     * Build Google Maps embed URL based on mode
     */
    buildMapUrl(mode) {
        switch (mode) {
            case 'pinpoint':
                // Exact location with marker - zoom 14
                if (this.hasCoords) {
                    return `https://maps.google.com/maps?q=${this.lat},${this.lng}&z=14&output=embed`;
                }
                // Fallback to zipcode
                mode = 'zipcode';
                // falls through

            case 'zipcode':
                // Postal code area view - zoom 11
                if (this.zipcode) {
                    const locationParts = [this.zipcode];
                    if (this.province) locationParts.push(this.province);
                    locationParts.push(this.country);
                    const query = locationParts.join(', ');
                    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=11&output=embed`;
                }
                // Fallback to municipality
                mode = 'municipality';
                // falls through

            case 'municipality':
            default:
                // Municipality/area view - zoom 10
                const areaParts = [];
                if (this.locationName || this.municipality) {
                    areaParts.push(this.locationName || this.municipality);
                }
                if (this.province) areaParts.push(this.province);
                areaParts.push(this.country);
                const areaQuery = areaParts.join(', ');
                console.log('[RealtySoft] Map municipality query:', areaQuery);
                return `https://maps.google.com/maps?q=${encodeURIComponent(areaQuery)}&z=10&output=embed`;
        }

        // Ultimate fallback
        return `https://maps.google.com/maps?q=${encodeURIComponent(this.country)}&z=6&output=embed`;
    }

    /**
     * Build Google Maps directions URL
     */
    buildDirectionsUrl() {
        let destination = '';

        if (this.currentMode === 'pinpoint' && this.hasCoords) {
            destination = `${this.lat},${this.lng}`;
        } else {
            const parts = [
                this.locationName || this.municipality,
                this.province,
                this.country
            ].filter(Boolean);
            destination = parts.join(', ');
        }

        if (!destination) return null;

        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    }

    /**
     * Build "View Larger Map" URL
     */
    buildLargerMapUrl() {
        if (this.currentMode === 'pinpoint' && this.hasCoords) {
            return `https://www.google.com/maps?q=${this.lat},${this.lng}&z=15`;
        }

        let query = '';
        if (this.zipcode) {
            query = [this.zipcode, this.locationName || this.municipality, this.province].filter(Boolean).join(' ');
        } else {
            query = [this.locationName || this.municipality, this.province, this.country].filter(Boolean).join(' ');
        }

        if (!query) return null;

        return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    }

    /**
     * Get current map mode (for external access)
     */
    getMapMode() {
        return this.currentMode;
    }

    /**
     * Check if exact location is shown
     */
    isExactLocation() {
        return this.currentMode === 'pinpoint' && this.hasCoords;
    }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.
