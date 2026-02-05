/**
 * RealtySoft Widget v3 - Map View Component
 * Interactive map view with property markers and bounds-based filtering
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  RealtySoftStateModule,
  RealtySoftLabelsModule,
  RealtySoftAnalyticsModule,
  Property,
} from '../../types/index';

// Declare globals
declare const RealtySoft: RealtySoftModule;
declare const RealtySoftState: RealtySoftStateModule;
declare const RealtySoftLabels: RealtySoftLabelsModule;
declare const RealtySoftAnalytics: RealtySoftAnalyticsModule;

declare const RealtySoftRouter: {
  isEnabled: () => boolean;
  navigateToProperty: (property: Property, url: string) => void;
} | undefined;

// Leaflet type declarations (loaded dynamically from CDN)
interface LeafletLatLngBounds {
  getNorthEast(): { lat: number; lng: number };
  getSouthWest(): { lat: number; lng: number };
  contains(latlng: { lat: number; lng: number }): boolean;
  extend(latlng: { lat: number; lng: number }): LeafletLatLngBounds;
  isValid(): boolean;
}

interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  fitBounds(bounds: LeafletLatLngBounds, options?: Record<string, unknown>): LeafletMap;
  getBounds(): LeafletLatLngBounds;
  getZoom(): number;
  getCenter(): { lat: number; lng: number };
  invalidateSize(): void;
  remove(): void;
  on(event: string, handler: (e: any) => void): LeafletMap;
  off(event: string, handler?: (e: any) => void): LeafletMap;
  addLayer(layer: any): LeafletMap;
  removeLayer(layer: any): LeafletMap;
  hasLayer(layer: any): boolean;
}

interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker;
  bindPopup(html: string | HTMLElement, options?: Record<string, unknown>): LeafletMarker;
  openPopup(): LeafletMarker;
  closePopup(): LeafletMarker;
  getLatLng(): { lat: number; lng: number };
  setIcon(icon: any): LeafletMarker;
  on(event: string, handler: (e: any) => void): LeafletMarker;
  remove(): void;
}

interface LeafletMarkerClusterGroup {
  addTo(map: LeafletMap): LeafletMarkerClusterGroup;
  addLayer(marker: LeafletMarker): LeafletMarkerClusterGroup;
  addLayers(markers: LeafletMarker[]): LeafletMarkerClusterGroup;
  removeLayer(marker: LeafletMarker): LeafletMarkerClusterGroup;
  clearLayers(): LeafletMarkerClusterGroup;
  getBounds(): LeafletLatLngBounds;
  remove(): void;
}

interface LeafletIcon {
  options: Record<string, unknown>;
}

interface LeafletStatic {
  map(el: HTMLElement, options?: Record<string, unknown>): LeafletMap;
  tileLayer(url: string, opts: Record<string, unknown>): { addTo(map: LeafletMap): void };
  marker(coords: [number, number], options?: Record<string, unknown>): LeafletMarker;
  latLngBounds(corner1?: [number, number], corner2?: [number, number]): LeafletLatLngBounds;
  divIcon(options: Record<string, unknown>): LeafletIcon;
  icon(options: Record<string, unknown>): LeafletIcon;
  markerClusterGroup?(options?: Record<string, unknown>): LeafletMarkerClusterGroup;
}

// Leaflet is loaded dynamically - window.L is declared in detail/map.ts
// We reference it through window directly to avoid type conflicts

class RSMapView extends RSBaseComponent {
  private properties: Property[] = [];
  private filteredProperties: Property[] = [];
  private map: LeafletMap | null = null;
  private markerCluster: LeafletMarkerClusterGroup | null = null;
  private markers: Map<number, LeafletMarker> = new Map();
  private mapContainerId: string = '';
  private isMapReady: boolean = false;
  private boundsFilterDebounce: ReturnType<typeof setTimeout> | null = null;
  private isVisible: boolean = false;
  private initialBoundsSet: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.mapContainerId = `rs-map-view-${Date.now()}`;
    this.render();
    this.bindEvents();

    // Subscribe to results changes
    this.subscribe<Property[]>('results.properties', (properties) => {
      this.properties = properties || [];
      if (this.isVisible && this.isMapReady) {
        this.updateMarkers();
      }
    });

    // Subscribe to view changes
    this.subscribe<string>('ui.view', (view) => {
      const wasVisible = this.isVisible;
      this.isVisible = view === 'map';

      if (this.isVisible && !wasVisible) {
        // Switched to map view
        this.showMap();
      } else if (!this.isVisible && wasVisible) {
        // Switched away from map view
        this.hideMap();
      }
    });

    // Check initial view
    const currentView = RealtySoftState.get<string>('ui.view');
    this.isVisible = currentView === 'map';

    if (this.isVisible) {
      this.loadLeafletAndInit();
    }
  }

  render(): void {
    this.element.classList.add('rs-map-view');
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <div class="rs-map-view__container">
        <div class="rs-map-view__loading" id="${this.mapContainerId}-loading">
          <div class="rs-map-view__spinner"></div>
          <p>${this.label('map_loading') || 'Loading map...'}</p>
        </div>
        <div class="rs-map-view__map" id="${this.mapContainerId}"></div>
        <div class="rs-map-view__info">
          <span class="rs-map-view__count"></span>
          <button type="button" class="rs-map-view__reset-bounds" style="display: none;">
            ${this.label('map_reset_view') || 'Reset View'}
          </button>
        </div>
      </div>
    `;
  }

  bindEvents(): void {
    // Reset bounds button
    const resetBtn = this.element.querySelector('.rs-map-view__reset-bounds');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.fitBoundsToMarkers();
        (resetBtn as HTMLElement).style.display = 'none';
      });
    }

    // Listen for currency changes to refresh marker prices
    window.addEventListener('rs-currency-change', () => {
      if (this.isMapReady && this.map) {
        this.updateMarkers();
      }
    });
  }

  private showMap(): void {
    this.element.style.display = 'block';

    if (!this.isMapReady) {
      this.loadLeafletAndInit();
    } else if (this.map) {
      // Map already initialized, just invalidate size and update markers
      setTimeout(() => {
        this.map?.invalidateSize();
        this.updateMarkers();
      }, 100);
    }
  }

  private hideMap(): void {
    this.element.style.display = 'none';
  }

  private async loadLeafletAndInit(): Promise<void> {
    try {
      await this.loadLeaflet();
      await this.loadMarkerCluster();
      await this.initMap();
    } catch (err) {
      console.error('[RealtySoft MapView] Map init failed:', err);
      this.showError();
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
      if (!document.querySelector('script[src*="leaflet.js"]')) {
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

  private loadMarkerCluster(): Promise<void> {
    return new Promise((resolve) => {
      const L = window.L;
      if (!L) {
        resolve();
        return;
      }

      // Check if already loaded
      if (L.markerClusterGroup) {
        resolve();
        return;
      }

      // Load MarkerCluster CSS
      if (!document.querySelector('link[href*="MarkerCluster"]')) {
        const css1 = document.createElement('link');
        css1.rel = 'stylesheet';
        css1.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
        document.head.appendChild(css1);

        const css2 = document.createElement('link');
        css2.rel = 'stylesheet';
        css2.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
        document.head.appendChild(css2);
      }

      // Load MarkerCluster JS
      if (!document.querySelector('script[src*="leaflet.markercluster"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
        script.crossOrigin = '';
        script.onload = () => resolve();
        script.onerror = () => {
          console.warn('[RealtySoft MapView] MarkerCluster failed to load, continuing without clustering');
          resolve();
        };
        document.head.appendChild(script);
      } else {
        // Wait for it to load
        const check = setInterval(() => {
          if (L.markerClusterGroup) {
            clearInterval(check);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(check);
          resolve();
        }, 5000);
      }
    });
  }

  private async initMap(): Promise<void> {
    const L = window.L;
    if (!L) return;

    const container = document.getElementById(this.mapContainerId);
    const loadingEl = document.getElementById(`${this.mapContainerId}-loading`);
    if (!container) return;

    // Create map
    this.map = L.map(container, {
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Initialize marker cluster group if available
    if (L.markerClusterGroup) {
      this.markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 17,
      });
      this.map.addLayer(this.markerCluster);
    }

    // Set default view (will be overridden when markers are added)
    this.map.setView([40.0, -3.7], 6); // Default: Spain

    // Listen for map events
    this.map.on('moveend', () => this.onMapMoveEnd());
    this.map.on('zoomend', () => this.onMapMoveEnd());

    this.isMapReady = true;

    // Hide loading
    if (loadingEl) loadingEl.style.display = 'none';

    // Update markers with current properties
    this.updateMarkers();

    // Ensure map renders correctly
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  private updateMarkers(): void {
    if (!this.map || !this.isMapReady) return;

    const L = window.L;
    if (!L) return;

    // Get properties with valid coordinates
    const propertiesWithCoords = this.properties.filter(
      (p) => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0
    );

    // Clear existing markers
    if (this.markerCluster) {
      this.markerCluster.clearLayers();
    } else {
      this.markers.forEach((marker) => marker.remove());
    }
    this.markers.clear();

    // Create new markers
    const newMarkers: LeafletMarker[] = [];

    propertiesWithCoords.forEach((property) => {
      const marker = this.createMarker(property);
      if (marker) {
        this.markers.set(property.id, marker);
        newMarkers.push(marker);
      }
    });

    // Add markers to cluster or map
    if (this.markerCluster && newMarkers.length > 0) {
      this.markerCluster.addLayers(newMarkers);
    } else {
      newMarkers.forEach((marker) => marker.addTo(this.map!));
    }

    // Update count display
    this.updateCountDisplay(propertiesWithCoords.length, this.properties.length);

    // Fit bounds to markers on first load
    if (!this.initialBoundsSet && propertiesWithCoords.length > 0) {
      this.fitBoundsToMarkers();
      this.initialBoundsSet = true;
    }
  }

  private createMarker(property: Property): LeafletMarker | null {
    const L = window.L;
    if (!L || !property.latitude || !property.longitude) return null;

    // Create custom icon
    const icon = L.divIcon({
      className: 'rs-map-marker',
      html: `
        <div class="rs-map-marker__pin">
          <span class="rs-map-marker__price">${this.formatShortPrice(property.price)}</span>
        </div>
      `,
      iconSize: [80, 36],
      iconAnchor: [40, 36],
      popupAnchor: [0, -36],
    });

    const marker = L.marker([property.latitude, property.longitude], { icon });

    // Create popup content
    const popupContent = this.createPopupContent(property);
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      minWidth: 250,
      className: 'rs-map-popup',
    });

    // Track marker click
    marker.on('click', () => {
      try {
        RealtySoftAnalytics.trackCardClick(property);
      } catch (_) { /* non-critical */ }
    });

    return marker;
  }

  private createPopupContent(property: Property): HTMLElement {
    const container = document.createElement('div');
    container.className = 'rs-map-popup__content';

    const image = property.images?.[0] || '/realtysoft/assets/placeholder.jpg';
    // Apply currency conversion to popup price
    const currencyInfo = this.getCurrencyInfo();
    const convertedPrice = (property.price || 0) * currencyInfo.rate;
    const price = `${currencyInfo.symbol} ${Math.round(convertedPrice).toLocaleString()}`;
    const url = this.generatePropertyUrl(property);

    container.innerHTML = `
      <a href="${url}" class="rs-map-popup__link">
        <div class="rs-map-popup__image">
          <img src="${image}" alt="${this.escapeHtml(property.title || '')}" loading="lazy">
        </div>
        <div class="rs-map-popup__details">
          <div class="rs-map-popup__price">${price}</div>
          <h4 class="rs-map-popup__title">${this.escapeHtml(property.title || '')}</h4>
          <p class="rs-map-popup__location">${this.escapeHtml(String(property.location || ''))}</p>
          <div class="rs-map-popup__specs">
            ${property.beds ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M3 11h18"/></svg> ${property.beds}</span>` : ''}
            ${property.baths ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2"/></svg> ${property.baths}</span>` : ''}
            ${property.built_area ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> ${property.built_area} m²</span>` : ''}
          </div>
          <span class="rs-map-popup__view">${this.label('card_view') || 'View Details'}</span>
        </div>
      </a>
    `;

    // Handle click with SPA navigation
    const link = container.querySelector('.rs-map-popup__link') as HTMLAnchorElement;
    if (link) {
      link.addEventListener('click', (e) => {
        if (typeof RealtySoftRouter !== 'undefined' && RealtySoftRouter.isEnabled()) {
          const mouseEvent = e as MouseEvent;
          if (!mouseEvent.ctrlKey && !mouseEvent.metaKey && !mouseEvent.shiftKey) {
            e.preventDefault();
            RealtySoftRouter.navigateToProperty(property, url);
          }
        }
      });
    }

    return container;
  }

  private generatePropertyUrl(property: Property): string {
    // Use central helper if available (supports multilingual URLs)
    if (typeof (window as any).RealtySoftGetPropertyUrl === 'function') {
      return (window as any).RealtySoftGetPropertyUrl(property);
    }
    // Fallback for older setups
    if (property.url) return property.url;
    const pageSlug = RealtySoftState.get<string>('config.propertyPageSlug') || 'property';
    return `/${pageSlug}/${property.ref || property.id}`;
  }

  private formatShortPrice(price: number | null | undefined): string {
    if (!price) return '-';

    // Apply currency conversion
    const currencyInfo = this.getCurrencyInfo();
    const convertedPrice = price * currencyInfo.rate;

    // Format as short price (K, M) with currency symbol
    if (convertedPrice >= 1000000) {
      return `${currencyInfo.symbol} ${(convertedPrice / 1000000).toFixed(1)}M`;
    } else if (convertedPrice >= 1000) {
      return `${currencyInfo.symbol} ${Math.round(convertedPrice / 1000)}K`;
    }
    return `${currencyInfo.symbol} ${Math.round(convertedPrice)}`;
  }

  private getCurrencyInfo(): { currency: string; rate: number; symbol: string } {
    try {
      const selectedCurrency = localStorage.getItem('rs_selected_currency');
      const cachedRates = localStorage.getItem('rs_exchange_rates');

      if (!selectedCurrency || !cachedRates) {
        return { currency: 'EUR', rate: 1, symbol: '€' };
      }

      const ratesData = JSON.parse(cachedRates);
      const rate = ratesData.rates?.[selectedCurrency] || 1;

      const symbols: Record<string, string> = {
        EUR: '€', GBP: '£', USD: '$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
        PLN: 'zł', CZK: 'Kč', AED: 'AED', SAR: 'SAR', RUB: '₽', CNY: '¥', JPY: '¥',
        AUD: 'A$', CAD: 'C$', INR: '₹', ZAR: 'R', BRL: 'R$', MXN: '$', TRY: '₺',
        MAD: 'MAD', QAR: 'QAR', KWD: 'KWD', BHD: 'BHD', OMR: 'OMR', SGD: 'S$',
        HKD: 'HK$', NZD: 'NZ$', THB: '฿'
      };

      return {
        currency: selectedCurrency,
        rate: rate,
        symbol: symbols[selectedCurrency] || selectedCurrency
      };
    } catch {
      return { currency: 'EUR', rate: 1, symbol: '€' };
    }
  }

  private onMapMoveEnd(): void {
    if (!this.map || !this.isVisible) return;

    // Debounce bounds filtering
    if (this.boundsFilterDebounce) {
      clearTimeout(this.boundsFilterDebounce);
    }

    this.boundsFilterDebounce = setTimeout(() => {
      this.filterByBounds();

      // Show reset button after user has moved the map
      if (this.initialBoundsSet) {
        const resetBtn = this.element.querySelector('.rs-map-view__reset-bounds') as HTMLElement;
        if (resetBtn) {
          resetBtn.style.display = 'inline-block';
        }
      }
    }, 300);
  }

  private filterByBounds(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Update state with current bounds
    RealtySoftState.set('map.bounds', {
      ne: [ne.lat, ne.lng],
      sw: [sw.lat, sw.lng],
    });
    RealtySoftState.set('map.zoom', this.map.getZoom());
    const center = this.map.getCenter();
    RealtySoftState.set('map.center', [center.lat, center.lng]);

    // Filter properties by bounds (client-side)
    this.filteredProperties = this.properties.filter((p) => {
      if (!p.latitude || !p.longitude) return false;
      return bounds.contains({ lat: p.latitude, lng: p.longitude });
    });

    // Update count display
    this.updateCountDisplay(this.filteredProperties.length, this.properties.length);
  }

  private fitBoundsToMarkers(): void {
    if (!this.map) return;

    const L = window.L;
    if (!L) return;

    const bounds = L.latLngBounds();
    let hasValidBounds = false;

    this.markers.forEach((marker) => {
      const latlng = marker.getLatLng();
      bounds.extend({ lat: latlng.lat, lng: latlng.lng });
      hasValidBounds = true;
    });

    if (hasValidBounds && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }

  private updateCountDisplay(visible: number, total: number): void {
    const countEl = this.element.querySelector('.rs-map-view__count');
    if (countEl) {
      const propertiesWithCoords = this.properties.filter(
        (p) => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0
      ).length;

      if (visible < propertiesWithCoords) {
        countEl.textContent = `${visible} of ${propertiesWithCoords} ${this.label('results_properties') || 'properties'} in view`;
      } else {
        countEl.textContent = `${propertiesWithCoords} ${this.label('results_properties') || 'properties'}`;
      }

      // Note if some properties don't have coordinates
      const withoutCoords = total - propertiesWithCoords;
      if (withoutCoords > 0) {
        countEl.textContent += ` (${withoutCoords} without location)`;
      }
    }
  }

  private showError(): void {
    const loadingEl = document.getElementById(`${this.mapContainerId}-loading`);
    if (loadingEl) {
      loadingEl.innerHTML = `
        <p class="rs-map-view__error">${this.label('map_error') || 'Unable to load map'}</p>
      `;
    }
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy(): void {
    if (this.boundsFilterDebounce) {
      clearTimeout(this.boundsFilterDebounce);
    }

    if (this.markerCluster) {
      this.markerCluster.clearLayers();
      this.markerCluster.remove();
    }

    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    super.destroy();
  }
}

// Register component
RealtySoft.registerComponent('rs_map_view', RSMapView as unknown as ComponentConstructor);

export { RSMapView };
export default RSMapView;
