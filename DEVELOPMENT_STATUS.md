# RealtySoft Widget v3 - Development Status

> **Version:** 3.2.0 | **Last Updated:** January 29, 2026

---

## Project Overview

**RealtySoft Widget v3** is a modular "Lego blocks" real estate property search widget system built with TypeScript and Vite. It connects to the Inmolink CRM API through a PHP proxy and provides search, listing, and property detail functionality.

**Project Location:** `C:\Users\shahzaib\RealtysoftV3`
**Server Deployment:** `https://realtysoft.ai/propertymanager/`

---

## Quick Status Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Core | Complete | 100% |
| Phase 2: Search Components | Complete | 100% |
| Phase 3: Listing Components | Complete | 100% |
| Phase 4: Detail Page | Complete | 100% |
| Phase 4.5: Modular Wishlist | Complete | 100% |
| Phase 5: Templates | Complete | 100% |
| Phase 6: Analytics Dashboard | Complete | 100% |
| Phase 7: Performance Optimization | Complete | 100% |
| Phase 8: TypeScript + Vite Migration | Complete | 100% |
| Phase 9: Granular Card Components | Complete | 100% |
| Phase 10: CSV Export | Complete | 100% |
| Phase 11: Enhanced i18n Testing | Complete | 100% |
| Phase 12: Labels Optimization & Detail UX | Complete | 100% |
| Phase 13: Dynamic Language Content Switching | Complete | 100% |

---

## What Has Been Done (Completed)

### Phase 8: TypeScript + Vite Migration (v3.0.0)

The entire codebase was rewritten from vanilla JavaScript to TypeScript with a modern Vite build system.

| Change | Before (v2) | After (v3) |
|--------|-------------|------------|
| Language | Vanilla JavaScript (.js) | TypeScript (.ts) |
| Build Tool | Custom `build.js` (concatenation) | Vite with multiple build targets |
| Build Command | `node build.js` | `npx vite build` |
| Type Safety | None | Full TypeScript strict mode |
| Entry Points | Single IIFE | IIFE + ES module + Service Worker |
| Testing | Manual | 889 automated tests (Vitest + jsdom) |
| Linting | None | ESLint with TypeScript support |
| Dev Server | File:// or PHP | Vite dev server (port 3000, HMR) |
| Module System | IIFE (global scope) | ES modules internally, IIFE output |
| Cache Utility | Inline localStorage | LRU Cache module |
| Server Path | `/realtysoft/` | `/propertymanager/` |

**Build Targets:**
- **Default IIFE** (`npx vite build`): Single monolithic bundle for backward compatibility
- **ES Module** (`npm run build:es`): Code-split chunks (search, listing, detail, utility)
- **Service Worker** (`npm run build:sw`): Standalone SW bundle

**TypeScript Configuration:**
- Target: ES2022
- Strict mode enabled
- Path aliases: `@/`, `@core/`, `@components/`, `@types/`
- Module resolution: bundler

---

### Phase 1: Core System

| File | Status | Description |
|------|--------|-------------|
| `src/core/state.ts` | Complete | Central pub/sub state management |
| `src/core/api.ts` | Complete | API service layer with proxy, caching, deduplication |
| `src/core/controller.ts` | Complete | Main controller/entry point, templates, loading skeletons |
| `src/core/labels.ts` | Complete | i18n labels system (14+ languages) |
| `src/core/analytics.ts` | Complete | Event tracking with batching |
| `src/core/toast.ts` | Complete | Toast notifications |
| `src/core/lru-cache.ts` | Complete | LRU cache utility for memory caching |
| `src/core/wishlist-manager.ts` | Complete | Wishlist state management with compare/events |

**Key Features Implemented:**
- Pub/sub state management with subscriptions
- Dot notation state access (`get('filters.location')`)
- Wildcard subscriptions (`subscribe('*', callback)`)
- API proxy integration with domain whitelist
- Comprehensive property normalization (50+ fields)
- Multi-language support with auto-detection
- Labels from API with fallback defaults
- Analytics event batching (10 events or 5 seconds)
- sendBeacon for reliable tracking on page unload
- Wishlist persistence (localStorage)
- Locked filters support (immutable data attributes)
- 24-hour localStorage caching for locations, labels, property types
- Request deduplication prevents duplicate concurrent API calls
- Loading skeletons for better perceived performance
- Single location request (limit=1000) instead of paginated
- Search-only mode - Redirect to results page from homepage search
- URL parameter parsing - Apply filters from URL on results page
- Script loader - Auto-versioning cache buster for multi-client deployment
- Grid columns - Configurable 1-4 columns via data-rs-columns attribute
- Mobile layout - Search button moves to bottom, responsive CSS with display: contents

---

### Language & Internationalization System (Important Detail)

The widget has a complete i18n (internationalization) system that affects **ALL data from the API**, not just UI labels.

1. **Auto-detects language** from:
   - `window.RealtySoftConfig.language` (if set manually)
   - Browser language (`navigator.language`)
   - HTML `<html lang="es">` attribute
   - Falls back to `en_US` if nothing detected

2. **ALL API data comes in the detected language:**

   | API Endpoint | Data Returned | Language Applied |
   |--------------|---------------|------------------|
   | `v1/plugin_labels` | UI labels | Yes |
   | `v1/property_types` | Property types (Villa, Apartment, etc.) | Yes |
   | `v1/property_features` | Features (Pool, Garage, A/C, etc.) | Yes |
   | `v1/property` | Property details (title, description) | Yes |
   | `v1/location` | Location names | No (uses default) |

3. **How it works in code:**

```typescript
// controller.ts - Language detection
const language = globalConfig.language || RealtySoftLabels.init();

// controller.ts - Pass language to API
RealtySoftAPI.init({
    language: language,
    ...
});

// controller.ts - Load labels from API
const labelsData = await RealtySoftAPI.getLabels();
if (labelsData && labelsData.labels) {
    await RealtySoftLabels.loadFromAPI(labelsData.labels);
}
```

4. **Supported Languages** (14+):
   - `en_US` - English, `es_ES` - Spanish, `de_DE` - German, `fr_FR` - French
   - `it_IT` - Italian, `pt_PT` - Portuguese, `nl_NL` - Dutch, `ru_RU` - Russian
   - `zh_CN` - Chinese, `ja_JP` - Japanese, `ar_SA` - Arabic, `sv_SE` - Swedish
   - `no_NO` - Norwegian, `da_DK` - Danish, `fi_FI` - Finnish, `pl_PL` - Polish

---

### Phase 2: Search Components

| Component | File | Variations | Status |
|-----------|------|------------|--------|
| Location | `location.ts` | 4 | Complete |
| Listing Type | `listing-type.ts` | 3 | Complete |
| Property Type | `property-type.ts` | 3 | Complete |
| Bedrooms | `bedrooms.ts` | 4 | Complete |
| Bathrooms | `bathrooms.ts` | 4 | Complete |
| Price | `price.ts` | 3 | Complete |
| Built Area | `built-area.ts` | 2 | Complete |
| Plot Size | `plot-size.ts` | 2 | Complete |
| Features | `features.ts` | 3 | Complete |
| Reference | `reference.ts` | 1 | Complete |
| Search Button | `search-button.ts` | 1 | Complete |
| Reset Button | `reset-button.ts` | 1 | Complete |

**Total: 12 Components with 31 Variations**

---

### Phase 3: Listing Components

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| Property Grid | `property-grid.ts` | Complete | Grid/list display with carousels |
| Property Carousel | `property-carousel.ts` | Complete | 6 carousel templates |
| Pagination | `pagination.ts` | Complete | Page navigation (prev/next/numbers) |
| Sort | `sort.ts` | Complete | Sort dropdown |
| Results Count | `results-count.ts` | Complete | "X properties found" |
| Active Filters | `active-filters.ts` | Complete | Filter tags with remove |
| View Toggle | `view-toggle.ts` | Complete | Grid/list switch |

**Total: 7 Components**

---

### Phase 4: Detail Page

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| Detail Wrapper | `detail.ts` | Complete | Main wrapper, loads/populates |
| Full Template | `property-detail-template.ts` | Complete | Complete ready-made template |
| Gallery | `gallery.ts` | Complete | Image carousel + lightbox |
| Features | `features.ts` | Complete | Categorized features list |
| Map | `map.ts` | Complete | Location map (Leaflet/Google) |
| Inquiry Form | `inquiry-form.ts` | Complete | Contact form with validation + email notifications |
| Wishlist | `wishlist.ts` | Complete | Wishlist button |
| Share | `share.ts` | Complete | Social share buttons |
| Back Button | `back-button.ts` | Complete | Return to search |
| Related | `related.ts` | Complete | Similar properties with SEO-friendly URLs |
| Info Table | `info-table.ts` | Complete | Key property info table |
| Specs | `specs.ts` | Complete | Beds, baths, built, plot |
| Sizes | `sizes.ts` | Complete | Terrace, garden, solarium |
| Taxes | `taxes.ts` | Complete | Community fees, IBI, Basura |
| Energy | `energy.ts` | Complete | Energy certificate |
| Resources | `resources.ts` | Complete | Video, tour, PDF links |
| PDF Button | `pdf-button.ts` | Complete | PDF download |
| Video Embed | `video-embed.ts` | Complete | Embedded YouTube/Vimeo player |

**Total: 18 Components**

---

### Modular Wishlist System

The wishlist is a system of independent, placeable components that designers can arrange in any layout.

| Component | File | Class | Description |
|-----------|------|-------|-------------|
| Header | `wishlist-header.ts` | `rs_wishlist_header` | Title + property count |
| Actions | `wishlist-actions.ts` | `rs_wishlist_actions` | PDF, Share, Email, Clear, Back buttons |
| Sort | `wishlist-sort.ts` | `rs_wishlist_sort` | Sort dropdown |
| Grid | `wishlist-grid.ts` | `rs_wishlist_grid` | Property cards with carousel |
| Empty State | `wishlist-empty.ts` | `rs_wishlist_empty` | Empty wishlist message |
| Compare Button | `wishlist-compare-btn.ts` | `rs_wishlist_compare_btn` | Floating compare button |
| Shared Banner | `wishlist-shared-banner.ts` | `rs_wishlist_shared_banner` | Banner for shared view |
| Modals | `wishlist-modals.ts` | `rs_wishlist_modals` | Share, email, note, compare modals |

**Total: 8 Modular Components**

---

### Phase 5: Templates - Complete

#### Search Templates (6)

| Template | Class | Description |
|----------|-------|-------------|
| 01 | `rs-search-template-01` | Compact 2-row horizontal form |
| 02 | `rs-search-template-02` | Single-row search bar |
| 03 | `rs-search-template-03` | Tab-based search (listing type tabs + fields row) |
| 04 | `rs-search-template-04` | Dark horizontal bar (2-row with labels) |
| 05 | `rs-search-template-05` | Vertical card/sidebar (stacked fields) |
| 06 | `rs-search-template-06` | Minimal single row (location + type + search) |

#### Listing Templates (12)

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
| 11 | `rs-listing-template-11` | Full-featured card with status tags on image |
| 12 | `rs-listing-template-12` | Magazine layout card |

#### Carousel Templates (6)

| Template | Class | Description |
|----------|-------|-------------|
| 01 | `rs-property-carousel--v1` | Standard horizontal carousel |
| 02 | `rs-property-carousel--v2` | 3D stacked cards with perspective |
| 03 | `rs-property-carousel--v3` | Coverflow style with grayscale |
| 04 | `rs-property-carousel--v4` | Full-width hero carousel (info always visible) |
| 05 | `rs-property-carousel--v5` | Cards with info overlay (info always visible) |
| 06 | `rs-property-carousel--v6` | Dark cards with numbers |

---

### Phase 6: Analytics Dashboard

Complete analytics dashboard with admin and client views.

| File | Location | Description |
|------|----------|-------------|
| `index.php` | `analytics/` | Dashboard selector (admin vs client) |
| `admin.php` | `analytics/` | Master admin dashboard (all clients) |
| `client.php` | `analytics/` | Client dashboard (login required) |
| `analytics-api.php` | `php/` | API endpoints for analytics data |
| `analytics-clients.php` | `config/` | Client login credentials |

---

### Phase 7: Performance Optimization

| Optimization | Before | After | Impact |
|--------------|--------|-------|--------|
| Location API requests | 230+ paginated | 1 single request | 99.6% reduction |
| Request deduplication | None | In-flight dedup | ~50% fewer duplicates |
| Loading skeletons | None | Animated placeholders | Better UX |
| Total first-load requests | ~240 | ~5 | 98% reduction |
| First-load time | ~52 seconds | <5 seconds | 10x faster |
| Lazy loading | Eager render all | Viewport-based via IntersectionObserver | Deferred off-screen work |

**Lazy Loading:**
- **14 card sub-components** — viewport-based lazy loading via `onElementVisible()` in `card-utils.ts`
- **Property grid** — IntersectionObserver for carousel image lazy loading (`data-src`)
- **Wishlist grid** — image lazy loading
- Search (12), listing controls (5), detail (17), and utility/wishlist (13) components remain eager by design (above the fold or pre-fetched data)

---

### Phase 9: Granular Card Sub-Components

15 standalone card sub-components in `src/components/listing/card/` that can be placed independently outside the property grid for fully custom card layouts.

| Component | File | Class | Description |
|-----------|------|-------|-------------|
| Image | `card-image.ts` | `rs_card_image` | Image carousel with navigation, lazy loading, srcset |
| Price | `card-price.ts` | `rs_card_price` | Formatted price or "Price on Request" |
| Title | `card-title.ts` | `rs_card_title` | Property title |
| Location | `card-location.ts` | `rs_card_location` | Location with map pin icon |
| Beds | `card-beds.ts` | `rs_card_beds` | Bedroom count with icon and singular/plural label |
| Baths | `card-baths.ts` | `rs_card_baths` | Bathroom count with icon and singular/plural label |
| Built | `card-built.ts` | `rs_card_built` | Built area with icon |
| Plot | `card-plot.ts` | `rs_card_plot` | Plot size with icon |
| Ref | `card-ref.ts` | `rs_card_ref` | Property reference number |
| Type | `card-type.ts` | `rs_card_type` | Property type |
| Status | `card-status.ts` | `rs_card_status` | Listing type badges (sale/rental/featured) |
| Description | `card-description.ts` | `rs_card_description` | Property description |
| Wishlist | `card-wishlist.ts` | `rs_card_wishlist` | Heart toggle with WishlistManager integration |
| Link | `card-link.ts` | `rs_card_link` | Property detail link |
| Utilities | `card-utils.ts` | — | Shared: `onElementVisible()`, `getCardProperty()`, `escapeHtml()`, SVG icons |

**Total: 14 components + 1 utility module**

---

### Phase 10: CSV Export (Analytics)

Complete CSV export system for analytics data with 5 export types, available in both admin and client dashboards.

| Export Type | API Action | Columns |
|-------------|------------|---------|
| Raw Events | `export` | Timestamp, Client, Category, Action, Property Ref, Location, Type, Listing Type, Price, Session, URL |
| Property Performance | `export_properties` | Ref, Location, Type, Price, Views, Clicks, Wishlist Adds, Inquiries, Shares, Unique Users, Conversion Rate, Last Activity |
| Daily Trends | `export_trends` | Date, Searches, Property Views, Card Clicks, Wishlist Adds, Inquiries |
| Search Insights | `export_searches` | Type, Name, Count (for Locations, Property Types, Listing Types) |
| Conversion Funnel | `export_funnel` | Step, Sessions, Percentage of Total, Conversion to Next Step |

**Implementation:** `php/analytics-api.php` with `fputcsv()`, proper headers (`Content-Type: text/csv`, `Content-Disposition: attachment`), and file locking for concurrent access safety.

**UI:** Export dropdown menu in both `analytics/admin.php` and `analytics/client.php` with all 5 export options.

---

### Phase 11: Enhanced i18n Testing

Comprehensive internationalization testing across all 16 supported languages.

| Test File | Lines | Coverage |
|-----------|-------|----------|
| `tests/core/labels.test.js` | 300 | Core label system, detection, formatting, fallbacks |
| `tests/components/listing/card/card-i18n.test.js` | 906 | All 16 languages across 13 card sub-components |
| `tests/components/utility/language-selector.test.js` | 146 | Language selector UI, dropdown, persistence |

**card-i18n.test.js covers:**
- All 16 languages: en_US, es_ES, de_DE, fr_FR, it_IT, pt_PT, nl_NL, ru_RU, zh_CN, ja_JP, ar_SA, sv_SE, no_NO, da_DK, fi_FI, pl_PL
- Per-component rendering for all 13 card sub-components
- Plural/singular handling (e.g., "1 bed" vs "3 beds")
- Locale-specific price formatting (`formatPrice`)
- "Price on Request" translations across all languages
- Label override hierarchy (client overrides > API labels > defaults)
- Dynamic language switching
- Full Spanish pass (complete verification of all components)

---

### Phase 12: Labels Optimization & Detail Page UX (v3.1.0)

Major improvements to page load performance and property detail page user experience.

#### Labels Optimization

Eliminated blocking API call for labels to speed up page loads.

| Mode | Behavior | API Calls | Best For |
|------|----------|-----------|----------|
| `static` (default) | Use hardcoded labels only | 0 | Most users - fastest |
| `hybrid` | Static first, API in background | 1 (non-blocking) | Users needing API sync |
| `api` | Original blocking behavior | 1 (blocking) | Admin-managed labels |

**Configuration:**
```javascript
window.RealtySoftConfig = {
    labelsMode: 'static',
    labelOverrides: {
        _default: { search_button: 'Find' },
        es_ES: { search_button: 'Buscar' }
    }
};
```

#### Property Detail Template Improvements

| Feature | Description |
|---------|-------------|
| Video Embed | YouTube/Vimeo videos embedded directly (keeps users on site) |
| Virtual Tour Embed | Virtual tours embedded as iframes |
| Features Popup | Compact button opens modal with features grid |
| Property Info Grid | Table-style cards (2 columns, capitalized labels) |
| Wishlist on Gallery | Circle heart icon overlay on gallery images |
| Price in Header | Price moved to header right side |
| Share/Features in Sidebar | Moved below inquiry form |

#### Language Switching Fixes

Fixed components not updating on language change (without refresh):
- Property carousel
- Inquiry form
- Map component
- Related properties
- Wishlist components (prevented duplicate event listeners)

#### New Translations

Added missing translations for 16 languages:
- `inquiry_default_message` - Inquiry form default message
- Wishlist form labels (name, email, message fields)

#### WordPress Integration

Added advanced configuration textarea in WordPress admin settings:
- JSON validation with error messages
- Merges with base configuration
- Supports all `RealtySoftConfig` options

---

### Phase 13: Dynamic Language Content Switching (v3.2.0)

Fixed property content (title, description, features) not updating when user switches language. Previously only UI labels were updating, but property data remained in the original language.

#### Root Cause

The CRM API uses `ln` parameter for language (not `lang`), and property caches were not being cleared on language switch.

#### Changes Made

| File | Change |
|------|--------|
| `php/api-proxy.php` | Changed `lang` → `ln` parameter for CRM API compatibility |
| `src/core/api.ts` | Added `clearPropertyCache()` method to clear all language-dependent caches |
| `src/core/api.ts` | Added language to cache keys (`property_${lang}_${id}`, `search_${lang}_${hash}`) |
| `src/core/api.ts` | Added translation field support (`title_es`, `description_es`, `translations` object) |
| `src/core/controller.ts` | Added property data refetch on language change (search + detail) |
| `src/core/controller.ts` | Reset `featuresLoaded` and `propertyTypesLoaded` flags on language switch |
| `src/core/lru-cache.ts` | Added `forEach()` and `keys()` methods for cache iteration |
| `src/types/index.ts` | Added `clearPropertyCache` to `RealtySoftAPIModule` interface |
| `src/components/listing/property-grid.ts` | Added `config.language` subscription for re-render |
| `src/components/listing/property-carousel.ts` | Added `config.language` subscription to reload properties |
| `src/components/detail/property-detail-template.ts` | Fixed subscription path, added content change detection |
| `src/styles/realtysoft.css` | Fixed map z-index to prevent interference with modals |

#### What Now Works

| Content Type | Status |
|--------------|--------|
| Property title | ✅ Updates on language switch |
| Property description | ✅ Updates on language switch |
| Property features | ✅ Updates on language switch |
| Property types (filter dropdowns) | ✅ Updates on language switch |
| Feature names (amenity filters) | ✅ Updates on language switch |
| UI Labels | ✅ Already working |

#### Supported Languages

All languages supported: English (en_US), Spanish (es_ES), German (de_DE), French (fr_FR), Dutch (nl_NL), Polish (pl_PL), Italian (it_IT), Portuguese (pt_PT), Russian (ru_RU), Chinese (zh_CN), Japanese (ja_JP), Arabic (ar_SA), Swedish (sv_SE), Norwegian (no_NO), Danish (da_DK), Finnish (fi_FI)

---

### PHP Backend

| File | Status | Description |
|------|--------|-------------|
| `api-proxy.php` | Complete | Secure API proxy with domain whitelist |
| `send-inquiry.php` | Complete | Inquiry form: owner notification + styled client confirmation with View Property button |
| `send-wishlist-email.php` | Complete | Wishlist email: recipient + sender copy + owner notification |
| `analytics-track.php` | Complete | Analytics event storage |
| `analytics-api.php` | Complete | Analytics API endpoints |
| `wishlist-pdf.php` | Complete | PDF generation |
| `share.php` | Complete | Social sharing handler |

**Total: 7 PHP Files**

**Email Features:**
- Inquiry form sends styled HTML emails to property owner and confirmation to sender
- Emails include styled "View Property" button linking to property page
- Wishlist email sends to recipient, copy to sender, and notification to site owner
- CORS headers support `Content-Type`, `X-Requested-With`, and `Accept`

---

### Build System

| File | Status | Description |
|------|--------|-------------|
| `vite.config.ts` | Complete | Vite build with IIFE/ES/SW targets |
| `tsconfig.json` | Complete | TypeScript strict configuration |
| `vitest.config.js` | Complete | Test configuration |
| `eslint.config.js` | Complete | Linting configuration |

**Build Commands:**
```bash
npm run build        # IIFE bundle (backward compatible)
npm run build:es     # ES module build (code-split)
npm run build:sw     # Service worker build
npm run build:all    # All three targets
npm run dev          # Development server (port 3000)
npm run test         # Run 889 tests
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint checking
```

**Output:**
```
dist/
├── realtysoft.js            # IIFE bundle
├── realtysoft.min.js        # Minified IIFE bundle
├── realtysoft.css           # Styles
├── realtysoft.min.css       # Minified styles
├── realtysoft-loader.js     # Auto-versioning loader
└── realtysoft-loader.min.js # Minified loader (~600 bytes)
```

---

### Styles

| File | Lines | Status |
|------|-------|--------|
| `src/styles/realtysoft.css` | 15,154 | Complete |

---

## Testing Status

| Area | Status | Notes |
|------|--------|-------|
| Core Modules | Complete | state, api, labels, lru-cache, sw tests |
| Search Components | Complete | 13 component tests |
| Listing Components | Complete | 7 component tests + card-i18n (16 languages) |
| Detail Components | Complete | 18 component tests |
| Utility Components | Complete | 13 component tests |
| Base Component | Complete | 1 test file |
| **Total Tests** | **889 passing** | Vitest + jsdom |

---

## File Structure

```
RealtysoftV3/
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.js             # Test configuration
├── eslint.config.js             # ESLint configuration
├── package.json                 # v3.0.0, dependencies & scripts
├── build.js                     # Legacy build script
├── share.php                    # Social sharing (root)
├── README.md                    # Quick start guide
├── DEVELOPMENT_STATUS.md        # This file
├── DOCUMENTATION.md             # Full documentation
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
│   ├── realtysoft.js
│   ├── realtysoft.min.js
│   ├── realtysoft.css
│   ├── realtysoft.min.css
│   ├── realtysoft-loader.js     # Auto-versioning loader
│   └── realtysoft-loader.min.js # Minified loader (~600 bytes)
│
├── pages/                       # Example pages
│   ├── search.html
│   ├── property-detail.html
│   └── wishlist.html
│
├── php/                         # Backend
│   ├── api-proxy.php
│   ├── send-inquiry.php         # Owner + client confirmation emails
│   ├── send-wishlist-email.php  # Recipient + sender copy + owner notification
│   ├── analytics-track.php      # Event tracking endpoint
│   ├── analytics-api.php        # Analytics API endpoints
│   ├── wishlist-pdf.php
│   └── share.php
│
├── tests/                       # 889 automated tests
│   ├── setup.js                 # Test environment setup
│   ├── helpers/
│   │   └── component-test-utils.js
│   ├── core/                    # 5 core test files
│   ├── components/
│   │   ├── base.test.js
│   │   ├── search/              # 13 test files
│   │   ├── listing/             # 7 test files
│   │   ├── detail/              # 18 test files
│   │   └── utility/             # 13 test files
│
└── src/                         # Source code (TypeScript)
    ├── index.ts                 # Main IIFE entry point
    ├── index-es.ts              # ES module entry point
    ├── sw.ts                    # Service worker
    ├── types/
    │   └── index.ts             # TypeScript type definitions
    ├── core/                    # 8 core modules
    │   ├── state.ts             # Pub/sub state management
    │   ├── api.ts               # API service with caching & deduplication
    │   ├── controller.ts        # Main controller, templates, skeletons
    │   ├── labels.ts            # i18n labels (14+ languages)
    │   ├── analytics.ts         # Event tracking with batching
    │   ├── toast.ts             # Toast notifications
    │   ├── lru-cache.ts         # LRU cache utility
    │   └── wishlist-manager.ts  # Wishlist state with compare/events
    ├── components/
    │   ├── base.ts              # Base component class
    │   ├── search/              # 12 search components (13 .ts files)
    │   ├── listing/             # 7 listing components (8 .ts files)
    │   │   └── card/            # 14 card sub-components + utils (15 .ts files)
    │   ├── detail/              # 17 detail components (18 .ts files)
    │   └── utility/             # 13 utility components (14 .ts files)
    ├── styles/
    │   └── realtysoft.css       # 15,154 lines
    └── templates/               # HTML snippet references
        ├── search/              # Search template snippets
        ├── listing/             # Listing template snippets
        └── carousel/            # Carousel template snippets
```

---

## Build & Deploy Commands

```bash
# Development
cd C:\Users\shahzaib\RealtysoftV3
npm run dev                    # Start dev server at localhost:3000

# Type checking
npx tsc --noEmit

# Testing
npx vitest run                 # Run all 889 tests
npx vitest run --coverage      # Run with coverage report

# Production build
npx vite build                 # IIFE bundle (default)
npm run build:all              # All targets (IIFE + ES + SW)

# Linting
npm run lint                   # Check for issues
npm run lint:fix               # Auto-fix issues
```

---

## Deployment

Upload to `realtysoft.ai/propertymanager/`:
```
realtysoft.ai/propertymanager/
├── analytics/
│   ├── index.php
│   ├── admin.php
│   └── client.php
├── config/
│   ├── clients.php
│   └── analytics-clients.php
├── dist/
│   ├── realtysoft.min.js
│   ├── realtysoft.min.css
│   ├── realtysoft-loader.js
│   └── realtysoft-loader.min.js
├── php/
│   ├── api-proxy.php
│   ├── send-inquiry.php
│   ├── send-wishlist-email.php
│   ├── analytics-track.php
│   ├── analytics-api.php
│   ├── wishlist-pdf.php
│   └── share.php
└── share.php
```

---

## Client Integration

**Option A: Auto-Updating Loader (Recommended for production)**
```html
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

The loader script:
- Automatically loads both CSS and JS files
- Uses hourly cache busting (clients get updates within 1 hour)
- No manual version updates needed when deploying to 100s of client sites
- Prevents double-loading

**Option B: Direct Include (for development/testing)**
```html
<link rel="stylesheet" href="https://realtysoft.ai/propertymanager/dist/realtysoft.min.css?v=3.0.0">
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft.min.js?v=3.0.0"></script>
```

> **Note:** Direct include requires manual version parameter updates when deploying updates.

**2. Create WordPress pages:**
- `/properties/` - Search & listing
- `/property/` - Detail page (can be empty)
- `/wishlist/` - Wishlist page

**3. Script must load on ALL pages (including 404) for URL detection to work.**

---

## Bugs Fixed (This Development Cycle)

| # | Bug | Fix |
|---|-----|-----|
| 1 | Search not working (counter = 0) | Changed default `listingType` from `'sale'` to `null` |
| 2 | API parameter names wrong | Updated `getSearchParams()` with correct API mappings |
| 3 | Invalid sort field error | Changed default sort to `create_date_desc` |
| 4 | Sort labels showing values | Added sort labels to `labels.ts` defaults |
| 5 | Property fields not displaying | Updated `normalizeProperty()` for nested objects |
| 6 | Carousel images not showing | Fixed CSS positioning (absolute vs relative) |
| 7 | Wishlist heart not filling | Added `.rs-card__wishlist--active svg { fill }` |
| 8 | 404 on property links | Added URL detection + 404 clearing + auto-inject |
| 9 | Energy cert not displaying | Added image URL detection vs letter grade |
| 10 | Duplicate "Similar Properties" heading | Removed duplicate in template |
| 11 | Compare checkboxes showing without compare button | Added `checkCompareEnabled()` |
| 12 | Broken images in compare modal | Fixed placeholder image + proper image extraction |
| 13 | Analytics data not recording | Rewrote analytics in ES5 for minification compatibility |
| 14 | Detail page wishlist not saving | Added WishlistManager.add() with full property data |
| 15 | First load takes ~52 seconds | Reduced 230+ paginated location requests to 1 (limit=1000) |
| 16 | Duplicate API calls on init | Added request deduplication with pendingRequests Map |
| 17 | No visual feedback during load | Added skeleton loading placeholders |
| 18 | Carousel arrow shifts on hover | Combined translateY(-50%) with scale(1.1) in transform |
| 19 | Property type tags breaking layout | Hidden in search template |
| 20 | Search button wrong position on mobile | Used display: contents + CSS order |
| 21 | Grid columns attribute not working | Pass data-rs-columns from template container |
| 22 | Template 06 missing property type | Added property type field |
| 23 | Template 06 missing View Detail button | Added always-visible View Detail button |
| 24 | Template 02 breaking mobile layout | Fixed overflow with responsive track width |
| 25 | Carousel mobile showing multiple cards | Show 1 card at a time on mobile |
| 26 | Inquiry form "Failed to fetch" | Added `X-Requested-With` to CORS `Access-Control-Allow-Headers` |
| 27 | Wishlist not sending to owner | Added ownerEmail field to wishlist email handler |
| 28 | Inquiry email missing View Property button | Added styled `.view-btn` button in email template |
| 29 | Wishlist sort showing raw label key | Added `sort_recent` and `sort_name` to label defaults |
| 30 | Listing template 11 tag outside image | Moved `rs_card_status` to `__image-section` with absolute positioning |
| 31 | Carousel V4/V5 info only on hover | Made overlay always visible (removed hover-only CSS) |
| 32 | Related properties wrong URLs | Added SEO-friendly URL generation matching property grid format |
| 33 | All server paths wrong | Updated all paths from `/realtysoft/` to `/propertymanager/` |
| 34 | Labels API blocking page load | Added `labelsMode: 'static'` option to skip API call |
| 35 | Carousel disappears on language switch | Added re-render check when properties already loaded |
| 36 | Inquiry form not updating language | Fixed subscription path from `'language'` to `'config.language'` |
| 37 | Map not updating on language switch | Fixed subscription path to `'config.language'` |
| 38 | Related properties not updating language | Fixed subscription path to `'config.language'` |
| 39 | Duplicate event listeners on wishlist | Added `windowEventsBound` flag to prevent duplicates |
| 40 | Missing inquiry form translations | Added `inquiry_default_message` to all 16 languages |
| 41 | Missing wishlist form translations | Added form labels to major languages |
| 42 | Wishlist/fullscreen icons overlapping | Moved wishlist to `right: 70px` |
| 43 | Property content not translating on language switch | Fixed: CRM uses `ln` param (not `lang`), added cache clearing, refetch on switch |
| 44 | Property types/features not translating | Added cache key with language, reset loaded flags on switch |
| 45 | Features popup going behind map | Added `isolation: isolate` to map container, reset leaflet z-index |

---

## Next Development Steps

1. **Map Search** - Interactive map with property markers, draw-to-search
