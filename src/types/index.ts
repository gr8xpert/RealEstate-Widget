/**
 * RealtySoft Widget v3 - Type Definitions
 * Central type definitions for the widget
 */

// ============================================================
// Filter Types
// ============================================================

export interface FilterState {
  location: number | number[] | null;
  sublocation?: number | null;
  locationName: string;
  listingType: string | null;
  propertyType: number | number[] | null;
  propertyTypeName: string;
  bedsMin: number | null;
  bedsMax: number | null;
  bathsMin: number | null;
  bathsMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  builtMin: number | null;
  builtMax: number | null;
  plotMin: number | null;
  plotMax: number | null;
  features: number[];
  ref: string;
}

export interface LockedFilters {
  [key: string]: string | number | number[] | null;
}

// ============================================================
// Results Types
// ============================================================

export interface ResultsState {
  properties: Property[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ============================================================
// UI Types
// ============================================================

export type ViewType = 'grid' | 'list' | 'map';
export type SortType =
  | 'create_date_desc'
  | 'create_date_asc'
  | 'last_date_desc'
  | 'list_price_asc'
  | 'list_price_desc';

export interface UIState {
  view: ViewType;
  sort: SortType;
  loading: boolean;
  error: string | null;
}

// ============================================================
// Map Types
// ============================================================

export interface MapBounds {
  ne: [number, number] | null;  // Northeast corner [lat, lng]
  sw: [number, number] | null;  // Southwest corner [lat, lng]
}

export interface MapState {
  bounds: MapBounds;
  zoom: number;
  center: [number, number] | null;
}

// ============================================================
// Cache Config Types
// ============================================================

export interface CacheConfig {
  locations?: number;
  propertyTypes?: number;
  features?: number;
  labels?: number;
  search?: number;
  property?: number;
  disabled?: boolean;
  maxCacheEntries?: number;
}

// ============================================================
// Config Types
// ============================================================

// Label overrides can be flat { key: value } or per-language { _default: {...}, es_ES: {...} }
export type LabelOverrides = Record<string, string> | Record<string, Record<string, string>>;

export interface WidgetConfig {
  apiKey: string | null;
  apiUrl: string | null;
  language: string;
  ownerEmail: string | null;
  privacyPolicyUrl: string | null;
  features: string[];
  propertyPageSlug: string;
  useWidgetPropertyTemplate: boolean;
  useQueryParamUrls: boolean;
  propertyUrlFormat: 'seo' | 'ref' | 'query';
  resultsPage: string;
  defaultCountryCode: string;
  inquiryThankYouMessage: string | null;
  inquiryThankYouUrl: string | null;
  labelsMode?: 'static' | 'api' | 'hybrid';
  labelOverrides?: LabelOverrides;
  analytics?: boolean;
  debug?: boolean;
  cache?: CacheConfig;
  serviceWorker?: boolean;
  serviceWorkerUrl?: string;
  siteName?: string;
  wpRestUrl?: string;
  wpApiNonce?: string;
  enableMapView?: boolean;
  perPage?: number;      // Items per page for grid/list view (default: 12)
  mapPerPage?: number;   // Items per page for map view (default: 50)
}

// ============================================================
// Data Types
// ============================================================

export interface Location {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Location[];
  property_count?: number;
}

export interface PropertyType {
  id: number;
  name: string;
  key?: string;
  parent_id?: number | string | null;
  property_count?: number;
}

export interface Feature {
  id: number;
  name: string;
  category?: string;
}

// ============================================================
// Property Types
// ============================================================

export interface ImageSizes {
  256?: string;
  512?: string;
  768?: string;
  1024?: string;
}

export interface ImageWithSizes {
  src: string;
  sizes: ImageSizes;
}

export interface PropertyFeature {
  name: string;
  category: string;
}

export interface PropertyAgent {
  name: string;
  email: string;
  phone: string;
  photo: string;
}

export interface Property {
  id: number;
  title: string;
  ref: string;
  unique_ref: string;
  price: number;
  price_on_request: boolean;
  location: string;
  postal_code: string;
  address: string;
  beds: number;
  baths: number;
  built_area: number;
  plot_size: number;
  terrace_size: number;
  solarium_size: number;
  garden_size: number;
  usable_area: number;
  images: string[];
  imagesFull: string[];
  imagesWithSizes: ImageWithSizes[];
  total_images: number;
  url: string | null;
  listing_type: string;
  status: string;
  type: string;
  is_featured: boolean;
  is_own: boolean;
  is_new: boolean;
  is_exclusive: boolean;
  description: string;
  short_description: string;
  features: PropertyFeature[];
  agent: PropertyAgent | null;
  latitude: number | null;
  longitude: number | null;
  year_built: number | null;
  community_fees: number | null;
  ibi_tax: number | null;
  basura_tax: number | null;
  energy_rating: string;
  co2_rating: string;
  energy_certificate_image: string;
  energy_consumption: string;
  video_url: string;
  virtual_tour_url: string;
  pdf_url: string;
  floor: string;
  orientation: string;
  parking: number;
  pool: boolean;
  furnished: string;
  condition: string;
  views: string;
  created_at: string;
  updated_at: string;
  _original?: Record<string, unknown>;
}

// ============================================================
// State Types
// ============================================================

export interface AppState {
  filters: FilterState;
  lockedFilters: LockedFilters;
  results: ResultsState;
  currentProperty: Property | null;
  ui: UIState;
  map: MapState;
  wishlist: number[];
  data: {
    locations: Location[];
    propertyTypes: PropertyType[];
    features: Feature[];
    labels: Record<string, string>;
  };
  config: WidgetConfig;
}

// ============================================================
// Subscription Types
// ============================================================

export type SubscriptionCallback<T = unknown> = (
  newValue: T,
  oldValue: T | null,
  path: string
) => void;

export type UnsubscribeFunction = () => void;

// ============================================================
// API Types
// ============================================================

export interface APIConfig {
  proxyUrl: string;
  inquiryEndpoint: string;
  apiKey: string | null;
  apiUrl: string | null;
  language: string;
  cache?: CacheConfig;
}

export interface APIResponse<T> {
  data?: T;
  count?: number;
  total?: number;
  error?: string;
}

export interface SearchParams {
  location_id?: string | number;
  listing_type?: string;
  type_id?: string | number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  list_price_min?: number;
  list_price_max?: number;
  build_size_min?: number;
  build_size_max?: number;
  plot_size_min?: number;
  plot_size_max?: number;
  features?: string;
  ref_no?: string;
  page: number;
  limit: number;
  order: string;
}

export interface InquiryData {
  propertyId: number;
  propertyRef: string;
  propertyTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  message: string;
  privacyAccepted: boolean;
  ownerEmail: string;
}

// ============================================================
// Component Types
// ============================================================

export interface ComponentOptions {
  variation?: string;
  [key: string]: unknown;
}

export interface ComponentConstructor {
  new (element: HTMLElement, options?: ComponentOptions): BaseComponent;
}

export interface BaseComponent {
  element: HTMLElement;
  options: ComponentOptions;
  variation: string;
  subscriptions: UnsubscribeFunction[];
  init(): void;
  render(): void;
  bindEvents(): void;
  subscribe(path: string, callback: SubscriptionCallback): UnsubscribeFunction;
  label(key: string, replacements?: Record<string, string | number>): string;
  isLocked(filterName: string): boolean;
  applyLockedStyle(): void;
  getLockedValue(filterName: string): unknown;
  setFilter(name: string, value: unknown): void;
  getFilter(name: string): unknown;
  createElement(tag: string, className?: string, innerHTML?: string): HTMLElement;
  destroy(): void;
}

// ============================================================
// Module Interface Types
// ============================================================

export interface RealtySoftStateModule {
  getState(): AppState;
  get<T = unknown>(path: string): T;
  set(path: string, value: unknown): void;
  setMultiple(updates: Record<string, unknown>): void;
  subscribe<T = unknown>(path: string, callback: SubscriptionCallback<T>): UnsubscribeFunction;
  resetFilters(): void;
  setLockedFilters(locked: LockedFilters): void;
  isFilterLocked(filterName: string): boolean;
  getSearchParams(): SearchParams;
  addToWishlist(propertyId: number): void;
  removeFromWishlist(propertyId: number): void;
  isInWishlist(propertyId: number): boolean;
}

export interface RealtySoftAPIModule {
  init(options: Partial<APIConfig>): void;
  request<T>(endpoint: string, params?: Record<string, unknown>, method?: string, options?: { skipLang?: boolean }): Promise<T>;
  getLocations(parentId?: number | null): Promise<APIResponse<Location[]>>;
  getParentLocations(): Promise<APIResponse<Location[]>>;
  getChildLocations(parentId: number): Promise<APIResponse<Location[]>>;
  searchLocations(term: string): Promise<APIResponse<Location[]>>;
  getRelevantLocations(locationId: number): Promise<APIResponse<Location[]>>;
  getPropertyTypes(): Promise<APIResponse<PropertyType[]>>;
  getFeatures(): Promise<APIResponse<Feature[]>>;
  getLabels(): Promise<Record<string, string>>;
  getAllLabels(): Promise<unknown>;
  searchProperties(params: Partial<SearchParams>): Promise<APIResponse<Property[]>>;
  getProperty(id: number, options?: { forceRefresh?: boolean; skipBackgroundRefresh?: boolean }): Promise<{ data: Property; fromCache?: boolean }>;
  getPropertyByRef(ref: string, options?: { forceRefresh?: boolean; skipBackgroundRefresh?: boolean }): Promise<{ data: Property; fromCache?: boolean }>;
  getRelatedProperties(propertyId: number, limit?: number): Promise<APIResponse<Property[]>>;
  submitInquiry(data: InquiryData): Promise<{ success: boolean; message?: string }>;
  getWishlistProperties(ids: number[]): Promise<APIResponse<Property[]>>;
  prefetchProperty(idOrRef: number | string, isRef?: boolean): Promise<void>;
  getCachedProperty(idOrRef: number | string, isRef?: boolean): Property | null;
  cacheProperty(property: Property): void;
  clearCache(key?: string): void;
  clearPropertyCache(): void;
}

export interface RealtySoftLabelsModule {
  init(language?: string | null): string;
  initStatic(language: string): void;
  loadFromAPI(apiLabels: Record<string, string>): Promise<void>;
  applyOverrides(overrides: LabelOverrides, language?: string): void;
  reloadForLanguage(newLanguage: string): Promise<void>;
  get(key: string, replacements?: Record<string, string | number>): string;
  getAll(): Record<string, string>;
  getLanguage(): string;
  setLanguage(lang: string): void;
  detectLanguage(): string;
  mapLanguage(code: string): string;
  formatPrice(price: number | null | undefined, currency?: string): string;
  formatNumber(number: number | null | undefined): string;
  formatArea(value: number | null | undefined): string;
}

// Analytics filter data interface (more permissive for tracking)
export interface AnalyticsFilterData {
  location?: number | number[] | null;
  listingType?: string | null;
  propertyType?: string | string[] | number | number[] | null;
  bedsMin?: number | null;
  bedsMax?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  features?: number[] | null;
}

// Analytics module interface
export interface RealtySoftAnalyticsModule {
  init(options?: { enabled?: boolean; debug?: boolean; endpoint?: string }): void;
  track(category: string, action: string, data?: Record<string, unknown>): void;
  flush(): void;
  trackSearch(filters?: AnalyticsFilterData): void;
  trackPropertyView(property?: Partial<Property>): void;
  trackCardClick(property?: Partial<Property>): void;
  trackGalleryView(propertyId: number, imageIndex: number): void;
  trackWishlistAdd(propertyId: number): void;
  trackWishlistRemove(propertyId: number): void;
  trackWishlistView(propertyIds?: number[]): void;
  trackWishlistShare(method: string): void;
  trackInquiry(propertyId: number, propertyRef?: string): void;
  trackShare(platform: string, propertyId: number): void;
  trackLinkClick(linkType: string, url: string): void;
  trackFilterChange(filterName: string, value: unknown): void;
  trackPagination(page: number, totalPages: number): void;
  trackSortChange(sortValue: string): void;
  trackViewToggle(view: string): void;
  trackResourceClick(resourceType: string, propertyId: number): void;
}

// Component instance interface
export interface ComponentInstance {
  render?: () => void;
  [key: string]: unknown;
}

export interface RealtySoftModule {
  init(): Promise<boolean>;
  registerComponent(name: string, componentClass: ComponentConstructor): void;
  getComponent(element: HTMLElement): ComponentInstance | undefined;
  search(): Promise<unknown>;
  loadProperty(id: number): Promise<Property>;
  loadPropertyByRef(ref: string): Promise<Property>;
  reset(): void;
  goToPage(page: number): void;
  setSort(sort: string): void;
  setView(view: string): void;
  setFilter(name: string, value: unknown): void;
  setLanguage(newLanguage: string): Promise<void>;
  getState(): Record<string, unknown>;
  subscribe(path: string, callback: (value: unknown, oldValue: unknown, path: string) => void): UnsubscribeFunction;
  isReady(): boolean;
  getMode(): 'combined' | 'search-only' | 'results-only' | null;
  State: RealtySoftStateModule;
  API: RealtySoftAPIModule;
  Labels: RealtySoftLabelsModule;
  Analytics: RealtySoftAnalyticsModule;
}

// ============================================================
// Router Module Interface
// ============================================================

export interface RealtySoftRouterModule {
  init(): void;
  isEnabled(): boolean;
  navigateToProperty(property: Property, url: string): void;
  navigateToListing(): void;
  canGoBackToListing(): boolean;
}

// ============================================================
// Global Declarations
// ============================================================

declare global {
  interface Window {
    RealtySoft: RealtySoftModule;
    RealtySoftState: RealtySoftStateModule;
    RealtySoftAPI: RealtySoftAPIModule;
    RealtySoftLabels: RealtySoftLabelsModule;
    RealtySoftRouter: RealtySoftRouterModule;
    RealtySoftConfig?: Partial<WidgetConfig>;
    _rsAutoInjectedRef?: string;

    // WordPress: Polylang plugin
    pll_current_language?: string;

    // WordPress: WPML plugin
    icl_current_language?: string;

    // WordPress + Other: Weglot plugin
    Weglot?: {
      getCurrentLang(): string;
      on(event: string, callback: (lang: string) => void): void;
    };

    // Webflow platform
    Webflow?: {
      env(key: string): string | undefined;
    };
  }
}

export {};
