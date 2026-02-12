/**
 * RealtySoft Widget v3 - Detail Map Component
 * Interactive location map with multiple precision levels using Leaflet + Nominatim.
 * Municipality/zipcode modes show area boundary polygons.
 *
 * Variations (data-variation attribute):
 * 0 = Auto-detect (best available: pinpoint > zipcode > municipality)
 * 1 = Municipality (default) - shows municipality/area boundary polygon
 * 2 = Pinpoint - exact location with marker via lat/lng
 * 3 = Zipcode - postal code area boundary polygon
 *
 * Usage: <div class="rs_detail_map" data-variation="0"></div>
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property } from '../../types/index';

type MapMode = 'pinpoint' | 'zipcode' | 'municipality';

// Leaflet type declarations (loaded dynamically from CDN)
interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  fitBounds(bounds: [[number, number], [number, number]], options?: Record<string, unknown>): LeafletMap;
  invalidateSize(): void;
  remove(): void;
}

interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker;
  bindPopup(html: string): LeafletMarker;
  openPopup(): LeafletMarker;
}

interface LeafletGeoJSONLayer {
  addTo(map: LeafletMap): LeafletGeoJSONLayer;
  getBounds(): [[number, number], [number, number]];
}

interface LeafletStatic {
  map(el: HTMLElement): LeafletMap;
  tileLayer(url: string, opts: Record<string, unknown>): { addTo(map: LeafletMap): void };
  marker(coords: [number, number]): LeafletMarker;
  geoJSON(data: unknown, opts?: Record<string, unknown>): LeafletGeoJSONLayer;
  circleMarker(coords: [number, number], opts: Record<string, unknown>): { addTo(map: LeafletMap): void };
}

declare global {
  interface Window {
    L?: LeafletStatic;
  }
}

class RSDetailMap extends RSBaseComponent {
  private property: Property | null = null;
  private lat: string | number | null = null;
  private lng: string | number | null = null;
  private hasCoords: boolean = false;
  private locationName: string = '';
  private municipality: string = '';
  private province: string = '';
  private zipcode: string = '';
  private country: string = 'Spain';
  private displayLocation: string = '';
  private currentMode: MapMode = 'municipality';
  private mapContainerId: string = '';
  private hasInitiallyRendered: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.property = this.options?.property as Property | null;

    if (!this.property) {
      this.element.style.display = 'none';
      return;
    }

    // Extract location data
    const p = this.property;
    const orig = (p._original || {}) as Record<string, unknown>;

    // Get coordinates
    this.lat = p.latitude || (orig.latitude as string | number) || (orig.lat as string | number) || null;
    this.lng = p.longitude || (orig.longitude as string | number) || (orig.lng as string | number) || null;
    this.hasCoords = this.hasValidCoordinates();

    // Get location info from various possible fields
    const locationId = orig.location_id as { name?: string } | undefined;
    const municipalityId = orig.municipality_id as { name?: string } | undefined;
    const provinceId = orig.province_id as { name?: string } | undefined;
    const cityId = orig.city_id as { name?: string } | undefined;

    // Try to get location name from structured fields first
    this.locationName = locationId?.name || cityId?.name || p.location || '';
    this.municipality = municipalityId?.name || (orig.municipality as string) || (orig.city as string) || (orig.town as string) || '';
    this.province = provinceId?.name || (orig.province as string) || (orig.region as string) || (orig.state as string) || '';
    this.zipcode = p.postal_code || (orig.zipcode as string) || (orig.postal_code as string) || '';
    this.country = (orig.country as string) || 'Spain';

    // If location is a combined string like "Fuengirola, Málaga" and we don't have separate municipality/province,
    // try to parse it
    if (this.locationName && this.locationName.includes(',') && !this.municipality && !this.province) {
      const parts = this.locationName.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        // Assume format: "City/Town, Province" or "Area, City, Province"
        // Take the first part as a potential city/municipality search term
        this.municipality = parts[0];
        this.province = parts[parts.length - 1]; // Last part is likely province
      }
    }

    // Build display location string
    this.displayLocation = this.buildDisplayLocation();

    // Check if we have any location data
    const hasLocation = this.locationName || this.municipality || this.province || this.zipcode || this.hasCoords;

    if (!hasLocation) {
      this.element.style.display = 'none';
      return;
    }

    // Get variation from data attribute
    const variationAttr = this.element.dataset.variation;
    const variationNum = parseInt(variationAttr || '');
    const finalVariation = (!variationAttr || isNaN(variationNum)) ? 1 : variationNum;
    this.currentMode = this.getVariationMode(finalVariation);

    this.mapContainerId = `rs-leaflet-map-${Date.now()}`;
    this.render();

    // Listen for language changes to update labels
    this.subscribe('config.language', () => {
      this.updateLabelsInPlace();
    });
  }

  private hasValidCoordinates(): boolean {
    const lat = parseFloat(String(this.lat));
    const lng = parseFloat(String(this.lng));
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  }

  private buildDisplayLocation(): string {
    const parts = [
      this.locationName || this.municipality,
      this.province
    ].filter(Boolean);
    return parts.join(', ');
  }

  private getVariationMode(num: number): MapMode {
    switch (num) {
      case 0:
        // Auto-detect: prefer area boundary (more useful for real estate)
        // Only use pinpoint if no location name/municipality available
        if (this.locationName || this.municipality) return 'municipality';
        if (this.zipcode) return 'zipcode';
        if (this.hasCoords) return 'pinpoint';
        return 'municipality';
      case 2:
        return this.hasCoords ? 'pinpoint' : 'municipality';
      case 3:
        return this.zipcode ? 'zipcode' : 'municipality';
      case 1:
      default:
        return 'municipality';
    }
  }

  render(): void {
    // If already rendered, just update labels (language change scenario)
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }

    // First-time render: build full HTML structure
    this.hasInitiallyRendered = true;

    this.element.classList.add('rs-detail-map');

    const directionsUrl = this.buildDirectionsUrl();
    const largerMapUrl = this.buildLargerMapUrl();

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
        <h3 class="rs-detail-map__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${this.label('detail_location') || 'Location'}
        </h3>
        ${this.displayLocation ? `<p class="rs-detail-map__address">${this.displayLocation}</p>` : ''}
      </div>
      <div class="rs-detail-map__container rs-detail-map__container--fullwidth">
        <div class="rs-detail-map__loading" id="${this.mapContainerId}-loading">
          <div class="rs-detail-map__spinner"></div>
          <p>${this.label('detail_loading_map') || 'Loading map...'}</p>
        </div>
        <div class="rs-detail-map__leaflet" id="${this.mapContainerId}"></div>
      </div>
      ${actionsHtml}
    `;

    this.loadLeafletAndInit();
  }

  /**
   * Dynamically load Leaflet CSS + JS from CDN, then initialize the map
   */
  private async loadLeafletAndInit(): Promise<void> {
    try {
      await this.loadLeaflet();
      await this.initLeafletMap();
    } catch (err) {
      console.error('[RealtySoft] Map init failed:', err);
      // Fallback: show Google Maps iframe
      this.fallbackToIframe();
    }
  }

  private loadLeaflet(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (window.L) {
        resolve();
        return;
      }

      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        css.crossOrigin = '';
        document.head.appendChild(css);
      }

      // Load JS
      if (!document.querySelector('script[src*="leaflet"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.crossOrigin = '';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Leaflet'));
        document.head.appendChild(script);
      } else {
        // Script tag exists but L not ready yet - wait
        const check = setInterval(() => {
          if (window.L) {
            clearInterval(check);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(check);
          reject(new Error('Leaflet load timeout'));
        }, 10000);
      }
    });
  }

  /**
   * Initialize Leaflet map based on current mode
   */
  private async initLeafletMap(): Promise<void> {
    const L = window.L;
    if (!L) return;

    const container = document.getElementById(this.mapContainerId);
    const loadingEl = document.getElementById(`${this.mapContainerId}-loading`);
    if (!container) return;

    // Create map
    const map = L.map(container);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    if (this.currentMode === 'pinpoint' && this.hasCoords) {
      // Pinpoint mode: marker at exact coordinates
      const lat = parseFloat(String(this.lat));
      const lng = parseFloat(String(this.lng));
      map.setView([lat, lng], 14);
      const marker = L.marker([lat, lng]).addTo(map);
      if (this.displayLocation) {
        marker.bindPopup(`<strong>${this.displayLocation}</strong>`).openPopup();
      }
      if (loadingEl) loadingEl.style.display = 'none';
    } else {
      // Municipality or Zipcode mode: fetch boundary from Nominatim
      const query = this.buildNominatimQuery();
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=5&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept': 'application/json' } }
        );
        const data = await response.json();

        // Select best result, filtering out natural features like mountains
        const result = data && data.length > 0 ? this.selectBestNominatimResult(data, query) : null;

        if (result && result.geojson) {
          const geojson = result.geojson;
          const geomType = geojson.type;

          // Check if the geometry is actually a polygon (not a Point)
          // Nominatim can return Point geometry for small locations
          const isPolygon = geomType === 'Polygon' || geomType === 'MultiPolygon';

          if (isPolygon) {
            // Add boundary polygon
            const layer = L.geoJSON(geojson, {
              style: () => ({
                color: '#0066cc',
                weight: 3,
                opacity: 0.8,
                fillColor: '#0066cc',
                fillOpacity: 0.1
              })
            });
            layer.addTo(map);

            // Fit map to boundary bounds
            const bounds = layer.getBounds();
            map.fitBounds(bounds, { padding: [30, 30] });
          } else {
            // geoJSON is a Point or other non-polygon type - use circleMarker
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            map.setView([lat, lng], 14);
            L.circleMarker([lat, lng], {
              radius: 10,
              color: '#0066cc',
              fillColor: '#0066cc',
              fillOpacity: 0.2,
              weight: 2
            }).addTo(map);
          }
        } else if (result) {
          // No polygon, but have coordinates - center on point
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          map.setView([lat, lng], 12);
          L.circleMarker([lat, lng], {
            radius: 8,
            color: '#0066cc',
            fillColor: '#0066cc',
            fillOpacity: 0.3,
            weight: 2
          }).addTo(map);
        } else {
          // Nominatim returned nothing - try alternative queries
          const found = await this.tryAlternativeQueries(map, L);
          if (!found) {
            this.setFallbackView(map);
          }
        }
      } catch (err) {
        this.setFallbackView(map);
      }

      if (loadingEl) loadingEl.style.display = 'none';
    }

    // Ensure map renders correctly after container is visible
    setTimeout(() => map.invalidateSize(), 200);
  }

  /**
   * Build query string for Nominatim search (municipality-first for polygon boundaries)
   */
  private buildNominatimQuery(useMunicipality: boolean = true): string {
    if (this.currentMode === 'zipcode' && this.zipcode) {
      const parts = [this.zipcode];
      if (this.province) parts.push(this.province);
      parts.push(this.country);
      return parts.join(', ');
    }

    // Build query prioritizing location name with clean municipality
    const parts: string[] = [];

    // Clean municipality name: "Marbella Central/Centro" -> "Marbella"
    const cleanMunicipality = this.municipality
      ? this.municipality.split(/[\/]/)[0].replace(/\s*(Central|Centro|Norte|Sur|Este|Oeste).*$/i, '').trim()
      : '';

    if (this.locationName) {
      // Start with the location/area name (e.g., "The Golden Mile")
      parts.push(this.locationName);
      // Add clean municipality if available and different from locationName
      if (cleanMunicipality && cleanMunicipality.toLowerCase() !== this.locationName.toLowerCase()) {
        parts.push(cleanMunicipality);
      }
    } else if (cleanMunicipality) {
      // No location name, use clean municipality
      parts.push(cleanMunicipality);
    } else if (this.municipality) {
      // Fallback to full municipality string
      parts.push(this.municipality);
    } else if (this.province) {
      // Use province as last resort
      parts.push(this.province);
    }

    if (this.province && !parts.includes(this.province)) {
      parts.push(this.province);
    }
    parts.push(this.country);
    return parts.join(', ');
  }

  /**
   * Select the best Nominatim result, preferring residential/urban areas over natural features.
   * Also verifies the result is in the correct municipality when we have that info.
   * Returns null if all results are unsuitable.
   */
  private selectBestNominatimResult(results: any[], query: string): any | null {
    // Classes/types we want (residential, administrative areas)
    const preferredClasses = ['place', 'boundary', 'landuse'];
    const preferredTypes = [
      'city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 'quarter',
      'residential', 'administrative', 'municipality', 'district', 'borough',
      'locality', 'isolated_dwelling', 'urban', 'urbanization'
    ];

    // Classes/types we want to avoid (natural features, geographic features)
    const avoidClasses = ['natural', 'geological'];
    const avoidTypes = [
      'peak', 'mountain', 'mountain_range', 'ridge', 'cliff', 'valley',
      'water', 'river', 'stream', 'lake', 'reservoir', 'bay',
      'wood', 'forest', 'scrub', 'heath', 'grassland'
    ];

    // Get expected municipality for validation (clean version)
    const expectedMunicipality = this.municipality
      ? this.municipality.split(/[\/]/)[0].replace(/\s*(Central|Centro|Norte|Sur|Este|Oeste).*$/i, '').trim().toLowerCase()
      : '';

    // Helper to check if result is in the correct municipality
    const isInCorrectMunicipality = (result: any): boolean => {
      if (!expectedMunicipality) return true; // No municipality to check against
      const displayName = (result.display_name || '').toLowerCase();
      // Check if display_name contains our expected municipality
      // But also accept if it contains the province (wider area is OK)
      if (displayName.includes(expectedMunicipality)) return true;
      // If the result is the municipality itself or province, accept it
      const resultType = (result.type || '').toLowerCase();
      if (['city', 'town', 'municipality', 'administrative', 'province', 'state'].includes(resultType)) return true;
      return false;
    };

    // Helper to check if result is NOT in a wrong municipality
    const isNotInWrongMunicipality = (result: any): boolean => {
      if (!expectedMunicipality) return true;
      const displayName = (result.display_name || '').toLowerCase();
      // List of other municipalities that might have same-named places
      const otherMunicipalities = ['mijas', 'estepona', 'fuengirola', 'benalmádena', 'torremolinos', 'nerja', 'ronda', 'antequera'];
      // If we expect Marbella but result is in Mijas, reject it
      for (const other of otherMunicipalities) {
        if (other !== expectedMunicipality && displayName.includes(other) && !displayName.includes(expectedMunicipality)) {
          return false;
        }
      }
      return true;
    };

    // Helper to check if result has a polygon boundary (not just a point)
    const hasPolygonBoundary = (result: any): boolean => {
      if (!result.geojson) return false;
      const geomType = result.geojson.type;
      return geomType === 'Polygon' || geomType === 'MultiPolygon';
    };

    // First pass: look for preferred types WITH POLYGON BOUNDARY in correct municipality
    for (const result of results) {
      const resultClass = (result.class || '').toLowerCase();
      const resultType = (result.type || '').toLowerCase();

      if (preferredClasses.includes(resultClass) || preferredTypes.includes(resultType)) {
        if (hasPolygonBoundary(result) && isInCorrectMunicipality(result) && isNotInWrongMunicipality(result)) {
          return result;
        }
      }
    }

    // Second pass: accept preferred types even WITHOUT polygon (will show circleMarker)
    for (const result of results) {
      const resultClass = (result.class || '').toLowerCase();
      const resultType = (result.type || '').toLowerCase();

      if (preferredClasses.includes(resultClass) || preferredTypes.includes(resultType)) {
        if (isInCorrectMunicipality(result) && isNotInWrongMunicipality(result)) {
          // Only accept point results if they're cities/towns (not small suburbs)
          const isLargePlace = ['city', 'town', 'municipality', 'administrative'].includes(resultType);
          if (hasPolygonBoundary(result) || isLargePlace) {
            return result;
          }
        }
      }
    }

    // Third pass: accept anything that's NOT a natural feature AND in correct municipality AND has polygon
    for (const result of results) {
      const resultClass = (result.class || '').toLowerCase();
      const resultType = (result.type || '').toLowerCase();

      if (!avoidClasses.includes(resultClass) && !avoidTypes.includes(resultType)) {
        if (hasPolygonBoundary(result) && isInCorrectMunicipality(result) && isNotInWrongMunicipality(result)) {
          return result;
        }
      }
    }

    // No suitable results with polygons - return null to try next query (which might find municipality polygon)
    return null;
  }

  /**
   * Set a fallback map view when Nominatim returns no results
   */
  private setFallbackView(map: LeafletMap): void {
    if (this.hasCoords) {
      const lat = parseFloat(String(this.lat));
      const lng = parseFloat(String(this.lng));
      map.setView([lat, lng], 12);
    } else {
      // Default: center of Spain
      map.setView([40.0, -3.7], 6);
    }
  }

  /**
   * Try alternative Nominatim queries when the primary query fails.
   * Priority: Location name (area/neighborhood) > Municipality > Province
   * Returns true if a location was found and displayed.
   */
  private async tryAlternativeQueries(map: LeafletMap, L: LeafletStatic): Promise<boolean> {
    // Build list of alternative queries to try - ORDER MATTERS!
    const queries: string[] = [];

    // PRIORITY 1: Try location name (area/neighborhood) with different combinations
    // This is most specific - e.g., "The Golden Mile, Marbella, Spain"
    if (this.locationName) {
      // Extract municipality name (first word before / or space patterns like "Marbella Central/Centro")
      const cleanMunicipality = this.municipality ? this.municipality.split(/[\/\s]/)[0] : '';

      if (cleanMunicipality && cleanMunicipality.toLowerCase() !== this.locationName.toLowerCase()) {
        // Try: "The Golden Mile, Marbella, Málaga, Spain"
        queries.push(`${this.locationName}, ${cleanMunicipality}, ${this.province || ''}, Spain`.replace(/, ,/g, ', ').replace(/,\s*,/g, ','));
        // Try: "The Golden Mile, Marbella, Spain"
        queries.push(`${this.locationName}, ${cleanMunicipality}, Spain`);
      }

      // Try: "The Golden Mile, Málaga, Spain"
      if (this.province) {
        queries.push(`${this.locationName}, ${this.province}, Spain`);
      }

      // Try: "The Golden Mile, Spain"
      queries.push(`${this.locationName}, Spain`);
    }

    // PRIORITY 2: Try clean municipality name (first part before / or Central etc.)
    if (this.municipality) {
      // Extract just the city name: "Marbella Central/Centro" -> "Marbella"
      const cleanMunicipality = this.municipality.split(/[\/]/)[0].replace(/\s*(Central|Centro|Norte|Sur|Este|Oeste).*$/i, '').trim();

      if (cleanMunicipality && cleanMunicipality !== this.municipality) {
        queries.push(`${cleanMunicipality}, ${this.province || ''}, Spain`.replace(/, ,/g, ', '));
        queries.push(`${cleanMunicipality}, Spain`);
      }

      // Try full municipality if different
      if (!queries.includes(`${this.municipality}, ${this.province || ''}, Spain`.replace(/, ,/g, ', '))) {
        queries.push(`${this.municipality}, ${this.province || ''}, Spain`.replace(/, ,/g, ', '));
      }
    }

    // PRIORITY 3: Try province-level as last resort (will show province boundary)
    if (this.province && !queries.some(q => q === `${this.province}, Spain`)) {
      queries.push(`${this.province}, Spain`);
    }

    // Remove duplicates while preserving order
    const uniqueQueries = [...new Set(queries)];

    for (const query of uniqueQueries) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=5&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept': 'application/json' } }
        );
        const data = await response.json();

        if (data && data.length > 0) {
          // Find the best result - prefer residential/urban areas over natural features
          const result = this.selectBestNominatimResult(data, query);
          if (!result) {
            continue; // Try next query
          }

          if (result.geojson) {
            const geojson = result.geojson;
            const geomType = geojson.type;
            const isPolygon = geomType === 'Polygon' || geomType === 'MultiPolygon';

            if (isPolygon) {
              const layer = L.geoJSON(geojson, {
                style: () => ({
                  color: '#0066cc',
                  weight: 3,
                  opacity: 0.8,
                  fillColor: '#0066cc',
                  fillOpacity: 0.1
                })
              });
              layer.addTo(map);
              const bounds = layer.getBounds();
              map.fitBounds(bounds, { padding: [30, 30] });
              return true;
            }
          }

          // No polygon but have coordinates - show circle marker
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            map.setView([lat, lng], 13);
            L.circleMarker([lat, lng], {
              radius: 10,
              color: '#0066cc',
              fillColor: '#0066cc',
              fillOpacity: 0.2,
              weight: 2
            }).addTo(map);
            return true;
          }
        }
      } catch (err) {
        // Query failed, try next one
      }
    }

    return false;
  }

  /**
   * Fallback to Google Maps iframe if Leaflet fails to load
   */
  private fallbackToIframe(): void {
    const container = document.getElementById(this.mapContainerId);
    const loadingEl = document.getElementById(`${this.mapContainerId}-loading`);
    if (!container) return;

    const areaParts: string[] = [];
    if (this.locationName || this.municipality) {
      areaParts.push(this.locationName || this.municipality);
    }
    if (this.province) areaParts.push(this.province);
    areaParts.push(this.country);
    const query = areaParts.join(', ');
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`;

    container.style.display = 'none';
    const iframe = document.createElement('iframe');
    iframe.className = 'rs-detail-map__iframe';
    iframe.src = mapUrl;
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.onload = () => { if (loadingEl) loadingEl.style.display = 'none'; };
    container.parentElement?.appendChild(iframe);
  }

  /**
   * Build Google Maps directions URL
   */
  private buildDirectionsUrl(): string | null {
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
  private buildLargerMapUrl(): string | null {
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
   * Update only label text nodes on language change (preserves map itself)
   */
  private updateLabelsInPlace(): void {
    // Update title (preserve SVG icon)
    const titleEl = this.element.querySelector('.rs-detail-map__title');
    if (titleEl) {
      const svg = titleEl.querySelector('svg');
      if (svg) {
        titleEl.innerHTML = '';
        titleEl.appendChild(svg);
        titleEl.appendChild(document.createTextNode(' ' + (this.label('detail_location') || 'Location')));
      }
    }

    // Update loading text
    const loadingText = this.element.querySelector('.rs-detail-map__loading p');
    if (loadingText) {
      loadingText.textContent = this.label('detail_loading_map') || 'Loading map...';
    }

    // Update action links (preserve SVGs)
    const actions = this.element.querySelectorAll('.rs-detail-map__action');
    actions.forEach((action, index) => {
      const svg = action.querySelector('svg');
      if (svg) {
        const labelKey = index === 0 ? 'detail_view_larger_map' : 'detail_get_directions';
        const defaultText = index === 0 ? 'View Larger Map' : 'Get Directions';
        action.innerHTML = '';
        action.appendChild(svg);
        action.appendChild(document.createTextNode(' ' + (this.label(labelKey) || defaultText)));
      }
    });
  }

  getMapMode(): MapMode {
    return this.currentMode;
  }

  isExactLocation(): boolean {
    return this.currentMode === 'pinpoint' && this.hasCoords;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailMap };
export default RSDetailMap;
