# RealtySoft Widget v3

A modular "Lego blocks" real estate property search widget system built with TypeScript and Vite.

**Current Version:** 3.1.0 | **Last Updated:** January 29, 2026

---

## Documentation

| Document | Description |
|----------|-------------|
| **README.md** | This file - quick start and overview |
| **[DOCUMENTATION.md](DOCUMENTATION.md)** | Full technical documentation |
| **[DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)** | What's done, what's pending |

---

## Quick Start

### 1. Include Files

**Option A: Auto-Updating Loader (Recommended for production)**

```html
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

The loader automatically handles cache busting - clients always get the latest version without manual updates.

**Option B: Direct Include (for development/testing)**

```html
<link rel="stylesheet" href="https://realtysoft.ai/propertymanager/dist/realtysoft.min.css?v=3.0.0">
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft.min.js?v=3.0.0"></script>
```

### 2. Add Configuration (Optional)

```html
<script>
window.RealtySoftConfig = {
    ownerEmail: 'agent@domain.com',
    privacyPolicyUrl: '/privacy',
    labelsMode: 'static',  // 'static' (fastest), 'api', or 'hybrid'
    labelOverrides: {
        _default: { search_button: 'Find Properties' },
        es_ES: { search_button: 'Buscar' }
    }
};
</script>
```

**Labels Mode Options:**
| Mode | Behavior | API Calls | Best For |
|------|----------|-----------|----------|
| `static` (default) | Use hardcoded labels only | 0 | Most users - fastest |
| `hybrid` | Static first, API in background | 1 (non-blocking) | Users needing API sync |
| `api` | Original blocking behavior | 1 (blocking) | Admin-managed labels |

### 3. Add Components

```html
<!-- Search -->
<div id="rs_search">
    <div class="rs_location" data-rs-variation="1"></div>
    <div class="rs_listing_type" data-rs-variation="1"></div>
    <div class="rs_property_type" data-rs-variation="2"></div>
    <div class="rs_bedrooms" data-rs-variation="1"></div>
    <div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>
    <div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>
    <div class="rs_search_button"></div>
</div>

<!-- Listing -->
<div id="rs_listing">
    <div class="rs_results_count"></div>
    <div class="rs_sort"></div>
    <div class="rs_property_grid"></div>
    <div class="rs_pagination"></div>
</div>
```

---

## Components Summary

### Search Components (12)

| Component | Variations | Description |
|-----------|------------|-------------|
| `rs_location` | 1=Typeahead, 2=Cascading, 3=Hierarchical, 4=Dropdown | Location filter |
| `rs_listing_type` | 1=Buttons, 2=Dropdown, 3=Tabs | Sale/Rent toggle |
| `rs_property_type` | 1=Typeahead, 2=Dropdown, 3=Multi-select | Property type |
| `rs_bedrooms` | 1=Dropdown, 2=Buttons, 3=Multi-select, 4=Input | Bedrooms |
| `rs_bathrooms` | 1=Dropdown, 2=Buttons, 3=Multi-select, 4=Input | Bathrooms |
| `rs_price` | 1=Inputs, 2=Slider, 3=Presets | Price range |
| `rs_built_area` | 1=Inputs, 2=Slider | Built area m² |
| `rs_plot_size` | 1=Inputs, 2=Slider | Plot size m² |
| `rs_features` | 1=Popup, 2=Checkboxes, 3=Tags | Features filter |
| `rs_reference` | - | Reference search |
| `rs_search_button` | - | Search trigger |
| `rs_reset_button` | - | Reset filters |

### Search Templates (6)

| Template | Class | Description |
|----------|-------|-------------|
| 01 | `rs-search-template-01` | Compact 2-row horizontal search form |
| 02 | `rs-search-template-02` | Single-row search bar |
| 03 | `rs-search-template-03` | Tab-based search (listing type tabs + fields) |
| 04 | `rs-search-template-04` | Dark horizontal bar (2-row with labels) |
| 05 | `rs-search-template-05` | Vertical card/sidebar (stacked fields) |
| 06 | `rs-search-template-06` | Minimal single row (location + type + search) |

### Listing Components (7)

| Component | Description |
|-----------|-------------|
| `rs_property_grid` | Property cards (grid/list, `data-rs-columns="1-4"`) |
| `rs_property_carousel` | Property carousel (`data-rs-template="1-6"`) |
| `rs_pagination` | Page navigation |
| `rs_sort` | Sort dropdown |
| `rs_results_count` | "X properties found" |
| `rs_active_filters` | Active filter tags |
| `rs_view_toggle` | Grid/List switch |

### Card Sub-Components (14)

Standalone card sub-components for fully custom layouts outside the property grid.

| Component | Description |
|-----------|-------------|
| `rs_card_image` | Image carousel with lazy loading |
| `rs_card_price` | Formatted price |
| `rs_card_title` | Property title |
| `rs_card_location` | Location with icon |
| `rs_card_beds` | Bedrooms with icon |
| `rs_card_baths` | Bathrooms with icon |
| `rs_card_built` | Built area (m²) |
| `rs_card_plot` | Plot size (m²) |
| `rs_card_ref` | Reference number |
| `rs_card_type` | Property type |
| `rs_card_status` | Listing type badges |
| `rs_card_description` | Description |
| `rs_card_wishlist` | Heart toggle |
| `rs_card_link` | Detail page link |

Use `data-rs-property-ref="R123456"` on each component. See [DOCUMENTATION.md](DOCUMENTATION.md) for full usage.

### Listing Templates (12)

| Template | Class | Description |
|----------|-------|-------------|
| 01 | `rs-listing-template-01` | Location-first cards |
| 02 | `rs-listing-template-02` | Price on image overlay |
| 03 | `rs-listing-template-03` | Tag + icon specs card (pill badges, SVG icons) |
| 04 | `rs-listing-template-04` | Airbnb style (meta separator, location pin) |
| 05 | `rs-listing-template-05` | Hover overlay (content shown on hover) |
| 06 | `rs-listing-template-06` | Gradient overlay (permanent dark gradient) |
| 07 | `rs-listing-template-07` | Dark overlay with badges (price-first) |
| 08 | `rs-listing-template-08` | Minimal card design |
| 09 | `rs-listing-template-09` | Modern card with accent |
| 10 | `rs-listing-template-10` | Compact list-style card |
| 11 | `rs-listing-template-11` | Full-featured card with status tags |
| 12 | `rs-listing-template-12` | Magazine layout card |

### Carousel Templates (6)

| Template | Description |
|----------|-------------|
| 1 | Standard horizontal carousel |
| 2 | 3D stacked cards with perspective |
| 3 | Coverflow with grayscale effect |
| 4 | Full-width hero carousel (info always visible) |
| 5 | Cards with info overlay (info always visible) |
| 6 | Dark cards with numbers |

### Detail Components (18)

| Component | Description |
|-----------|-------------|
| `rs_detail` | Main wrapper (auto-loads property) |
| `rs_detail_gallery` | Image carousel + lightbox |
| `rs_detail_title` | Property title |
| `rs_detail_price` | Formatted price |
| `rs_detail_description` | Full description |
| `rs_detail_features` | Features (button popup or accordion mode) |
| `rs_detail_video_embed` | **NEW** Embedded YouTube/Vimeo video |
| `rs_detail_map` | Location map (with area boundary polygons) |
| `rs_detail_inquiry_form` | Contact form (sends to owner + client confirmation) |
| `rs_detail_wishlist` | Wishlist button |
| `rs_detail_share` | Share buttons |
| `rs_detail_related` | Similar properties (SEO-friendly URLs) |
| ... | See DOCUMENTATION.md for full list |

### Utility Components (5)

| Component | Description |
|-----------|-------------|
| `rs_wishlist_button` | Add to wishlist |
| `rs_wishlist_counter` | Wishlist count badge |
| `rs_wishlist_list` | Full wishlist page |
| `rs_language_selector` | Language dropdown |
| `rs_share_buttons` | Social share buttons |

---

## Property Detail Page

The widget auto-detects property from URL patterns:

```
/property/beautiful-villa-R5285977
/property/?ref=R5285977
?ref=R5285977
```

Minimal detail page:

```html
<div class="rs_detail">
    <div class="rs_detail_gallery"></div>
    <h1 class="rs_detail_title"></h1>
    <div class="rs_detail_price"></div>
    <div class="rs_detail_description"></div>
    <div class="rs_detail_inquiry_form"></div>
</div>
```

See [DOCUMENTATION.md](DOCUMENTATION.md) for complete detail page template.

---

## Search-Only Mode (Homepage Search)

Add a search form on your homepage that redirects to a results page:

**Homepage (search only):**
```html
<div class="rs-search-template-01"></div>

<script>
window.RealtySoftConfig = {
    resultsPage: '/properties'  // Where to redirect
};
</script>
```

**Results Page (search + listing):**
```html
<div class="rs-search-template-01"></div>
<div class="rs-listing-template-01"></div>
```

The widget automatically:
1. Detects "search-only" mode when no listing container exists
2. Redirects to results page with filter parameters in URL
3. Parses URL parameters and applies filters on the results page

See [DOCUMENTATION.md](DOCUMENTATION.md#widget-modes) for full details.

---

## Building

```bash
cd C:\Users\shahzaib\RealtysoftV3

# Type checking
npx tsc --noEmit

# Production build (IIFE bundle)
npx vite build

# All build targets (IIFE + ES modules + Service Worker)
npm run build:all

# Run tests
npx vitest run

# Development server
npm run dev
```

**Output:**
- `dist/realtysoft.js` - IIFE bundle
- `dist/realtysoft.min.js` - Minified IIFE bundle
- `dist/realtysoft.css` - Styles
- `dist/realtysoft.min.css` - Minified styles
- `dist/realtysoft-loader.js` - Auto-versioning loader
- `dist/realtysoft-loader.min.js` - Minified loader (~600 bytes)

---

## File Structure

```
RealtysoftV3/
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.js             # Test configuration
├── package.json                 # Dependencies & scripts
├── build.js                     # Legacy build script
├── README.md                    # This file
├── DOCUMENTATION.md             # Full documentation
├── DEVELOPMENT_STATUS.md        # Development status
│
├── analytics/                   # Analytics dashboards
│   ├── index.php                # Dashboard selector
│   ├── admin.php                # Admin master dashboard
│   └── client.php               # Client dashboard (login required)
│
├── config/
│   ├── clients.php              # Domain whitelist
│   └── analytics-clients.php    # Analytics login credentials
│
├── dist/                        # Production files
│   ├── realtysoft.min.js
│   ├── realtysoft.min.css
│   ├── realtysoft-loader.js
│   └── realtysoft-loader.min.js
│
├── php/                         # Backend
│   ├── api-proxy.php            # API proxy
│   ├── send-inquiry.php         # Inquiry handler (owner + confirmation emails)
│   ├── send-wishlist-email.php  # Wishlist email handler (recipient + owner notification)
│   ├── analytics-track.php      # Analytics tracking
│   ├── analytics-api.php        # Analytics API endpoints
│   ├── wishlist-pdf.php         # PDF generation
│   └── share.php                # Social sharing
│
├── tests/                       # Test suite (889 tests)
│   ├── core/                    # Core module tests
│   ├── components/              # Component tests (51 files)
│   ├── helpers/                 # Test utilities
│   └── setup.js                 # Test setup
│
└── src/                         # Source code (TypeScript)
    ├── index.ts                 # Main entry point
    ├── index-es.ts              # ES module entry point
    ├── sw.ts                    # Service worker
    ├── types/
    │   └── index.ts             # TypeScript type definitions
    ├── core/                    # Core modules (8 files)
    │   ├── state.ts             # Pub/sub state management
    │   ├── api.ts               # API service with caching
    │   ├── controller.ts        # Main controller + templates
    │   ├── labels.ts            # i18n labels (14+ languages)
    │   ├── analytics.ts         # Event tracking
    │   ├── toast.ts             # Toast notifications
    │   ├── lru-cache.ts         # LRU cache utility
    │   └── wishlist-manager.ts  # Wishlist state management
    ├── components/              # Components (54 TypeScript files)
    │   ├── base.ts              # Base component class
    │   ├── search/              # 12 search components
    │   ├── listing/             # 7 listing components
    │   │   └── card/            # 14 card sub-components + utils
    │   ├── detail/              # 17 detail components
    │   └── utility/             # 13 utility components
    └── styles/
        └── realtysoft.css       # Styles (15,154 lines)
```

---

## Client Setup

### 1. Add Domain to Whitelist

Edit `config/clients.php`:

```php
'clientdomain.com' => [
    'api_key' => 'their-api-key',
    'api_url' => 'https://crm.clientcrm.com',
    'owner_email' => 'info@clientdomain.com',
    'enabled' => true,
    'features' => ['search', 'detail', 'wishlist', 'analytics']
]
```

### 2. Client Includes Widget in WordPress

```html
<!-- Single line - auto-updates, no version management needed -->
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

The loader automatically loads both CSS and JS with hourly cache busting.

### 3. Client Creates Pages

- `/properties/` - Search & listing page
- `/property/` - Detail page (can be empty, widget takes over)
- `/wishlist/` - Wishlist page

---

## Development Status

| Phase | Status |
|-------|--------|
| Core System | Complete |
| Search Components (12) | Complete |
| Listing Components (7) | Complete |
| Detail Components (17) | Complete |
| Utility Components (5) | Complete |
| PHP Backend (7) | Complete |
| Performance Optimization | Complete |
| Search Templates (6) | Complete |
| Listing Templates (12) | Complete |
| Carousel Templates (6) | Complete |
| Analytics Dashboard | Complete |
| Test Suite (889 tests) | Complete |
| TypeScript Migration | Complete |
| Granular Card Sub-Components (14) | Complete |
| CSV Export (5 export types) | Complete |
| Enhanced i18n Testing (16 languages) | Complete |
| Lazy Loading (IntersectionObserver) | Complete |

### Recent Updates (v3.1.0) - January 29, 2026
- **Labels Optimization:** New `labelsMode` config - 'static' (no API call), 'hybrid', or 'api'
- **Video Embed:** YouTube/Vimeo videos embedded directly on detail page (keeps users on site)
- **Virtual Tour Embed:** Virtual tours embedded as iframes instead of external links
- **Features Popup:** Compact button that opens modal with features grid (vs accordion)
- **Property Info Grid:** New table-style cards layout (2 columns, capitalized labels)
- **Wishlist on Gallery:** Heart icon overlay on gallery images (circle button)
- **Language Switching Fixes:** Fixed carousel, forms, map, and related components
- **WordPress Admin Config:** Textarea for advanced JSON configuration in WP admin
- **Missing Translations:** Added inquiry form default message and wishlist labels (16 languages)

### Previous Updates (v3.0.0)
- **TypeScript Rewrite:** Full codebase migrated from vanilla JS to TypeScript
- **Vite Build System:** Replaced custom `build.js` with Vite (IIFE, ES module, and SW build targets)
- **Granular Card Sub-Components:** 14 standalone card sub-components for fully custom layouts
- **CSV Export:** 5 analytics export types (raw events, property performance, trends, search insights, funnel)
- **Lazy Loading:** Viewport-based rendering via IntersectionObserver for card sub-components and grid images
- **Enhanced i18n Testing:** Comprehensive tests across all 16 supported languages (906-line card-i18n test)
- **Search Templates 03-06:** 4 new search template layouts (tab-based, dark bar, vertical sidebar, minimal)
- **Listing Templates 03-12:** 10 new listing card templates with unique designs
- **Carousel V4/V5 Overlay:** Property info always visible (not hover-only)
- **Inquiry Form Emails:** Owner notification + styled client confirmation with View Property button
- **Wishlist Owner Notification:** Owner receives email when client shares a wishlist
- **CORS Headers:** Proper `Access-Control-Allow-Headers` for `X-Requested-With` support
- **Related Properties URLs:** SEO-friendly URLs matching property grid format
- **LRU Cache:** New core module for efficient memory caching
- **Test Suite:** 889 tests with Vitest + jsdom

See [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) for detailed status.

---

## Analytics Dashboard

The widget includes a complete analytics dashboard for tracking user behavior.

### Admin Dashboard
Access at: `propertymanager/analytics/admin.php`
- View analytics for all clients
- Aggregate statistics across domains
- Property-level performance analytics

### Client Dashboard
Access at: `propertymanager/analytics/client.php?client=domain.com`
- Client-specific analytics with login
- Property rankings and performance
- Conversion funnel analysis

### Tracked Metrics
- Page views and sessions
- Property clicks and views
- Wishlist adds/removes
- Inquiry submissions
- Search events

### CSV Export
Export analytics data from the dashboard dropdown:
- Raw Events, Property Performance, Daily Trends, Search Insights, Conversion Funnel

---

## API

```javascript
// Initialize (auto-called)
RealtySoft.init();

// Search
RealtySoft.search();

// Set filter
RealtySoft.setFilter('bedsMin', 2);

// Load property
RealtySoft.loadProperty('R123456');

// Get state
RealtySoft.State.get('filters.location');

// Subscribe to changes
RealtySoft.State.subscribe('results', (newResults) => {
    console.log('Results updated:', newResults);
});
```

---

## Support

- Full documentation: [DOCUMENTATION.md](DOCUMENTATION.md)
- Development status: [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)
