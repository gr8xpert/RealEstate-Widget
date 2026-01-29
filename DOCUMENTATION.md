# RealtySoft Widget v3 - Complete Documentation

> Version 3.0.0 | Last Updated: January 26, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Pre-built Templates](#pre-built-templates)
   - [Search Template 01](#search-template-01-compact-horizontal)
   - [Listing Template 01](#listing-template-01-location-first-cards)
   - [Filter Attributes](#filter-attributes)
4. [Configuration](#configuration)
5. [Widget Modes](#widget-modes)
   - [Search-Only Mode](#search-only-mode)
6. [Search Components](#search-components)
6. [Listing Components](#listing-components)
7. [Detail Page Components](#detail-page-components)
8. [Utility Components](#utility-components)
9. [Wishlist System](#wishlist-system)
   - [Modular Components](#modular-components)
   - [WishlistManager API](#wishlistmanager-api)
   - [Shared Wishlist Feature](#shared-wishlist-feature)
   - [Email Wishlist Feature](#email-wishlist-feature)
   - [PDF Download Feature](#pdf-download-feature)
10. [State Management](#state-management)
11. [API Reference](#api-reference)
12. [Labels & i18n](#labels--i18n)
13. [Analytics](#analytics)
14. [PHP Backend](#php-backend)
15. [Styling & Theming](#styling--theming)
16. [Performance & Caching](#performance--caching)
17. [Build Process](#build-process)
18. [Troubleshooting](#troubleshooting)

---

## Overview

RealtySoft Widget v3 is a modular real estate property search widget built with TypeScript and Vite. It uses a "Lego blocks" architecture where each component can be placed independently and they all communicate through a central state management system.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     RealtySoft Widget                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ Search  │  │ Listing │  │ Detail  │  │    Utility      │ │
│  │Components│ │Components│ │Components│ │   Components    │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───────┬─────────┘ │
│       │            │            │                │           │
│       └────────────┴────────────┴────────────────┘           │
│                            │                                 │
│                    ┌───────┴───────┐                         │
│                    │  State (Pub/Sub)│                       │
│                    └───────┬───────┘                         │
│                            │                                 │
│       ┌────────────────────┼────────────────────┐           │
│       │                    │                    │           │
│  ┌────┴────┐        ┌──────┴──────┐      ┌─────┴─────┐     │
│  │  API    │        │   Labels    │      │ Analytics │     │
│  │ Service │        │   (i18n)    │      │  Tracker  │     │
│  └────┬────┘        └─────────────┘      └───────────┘     │
│       │                                                     │
│  ┌────┴────┐                                               │
│  │  PHP    │                                               │
│  │  Proxy  │                                               │
│  └────┬────┘                                               │
│       │                                                     │
│  ┌────┴────┐                                               │
│  │Inmolink │                                               │
│  │CRM API  │                                               │
│  └─────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Include Files

**Option A: Auto-Updating Loader (Recommended)**

```html
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

The loader script:
- Automatically loads both CSS and JS files
- Uses hourly cache busting (clients get updates within 1 hour)
- No manual version updates needed when deploying to 100s of client sites
- Prevents double-loading

**Option B: Direct Include**

```html
<link rel="stylesheet" href="https://realtysoft.ai/propertymanager/dist/realtysoft.min.css?v=3.0.0">
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft.min.js?v=3.0.0"></script>
```

### 2. Optional Configuration

```html
<script>
window.RealtySoftConfig = {
    ownerEmail: 'agent@example.com',
    privacyPolicyUrl: '/privacy-policy',
    language: 'en_US'
};
</script>
```

### 3. Add Components

```html
<!-- Search Section -->
<div id="rs_search">
    <div class="rs_location" data-rs-variation="1"></div>
    <div class="rs_listing_type" data-rs-variation="1"></div>
    <div class="rs_property_type" data-rs-variation="2"></div>
    <div class="rs_bedrooms" data-rs-variation="1"></div>
    <div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>
    <div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>
    <div class="rs_search_button"></div>
    <div class="rs_reset_button"></div>
</div>

<!-- Listing Section -->
<div id="rs_listing">
    <div class="rs_results_count"></div>
    <div class="rs_sort"></div>
    <div class="rs_view_toggle"></div>
    <div class="rs_active_filters"></div>
    <div class="rs_property_grid"></div>
    <div class="rs_pagination"></div>
</div>
```

### 4. Auto-Initialization

The widget automatically initializes on `DOMContentLoaded` if it detects any `rs_` containers.

---

## Pre-built Templates

Pre-built templates provide a **zero-configuration** way to add search forms and property listings to any page. Just add a single div element and the JavaScript automatically renders the complete UI.

### Why Use Templates?

- **Simple**: One line of HTML - no complex markup needed
- **Universal**: Works in any CMS (WordPress, Joomla, Drupal, etc.)
- **Any Block Type**: Works in paragraph blocks, HTML blocks, shortcodes, widgets
- **Filterable**: Add data attributes to lock/preset filters
- **Styled**: Comes with professional CSS out of the box

---

### Search Template 01: Compact Horizontal

A two-row horizontal search form with all essential filters.

**Layout:**
```
Row 1: [Reference] [Location] [Sublocation] [Property Type] [SEARCH]
Row 2: [Bedrooms] [Bathrooms] [Min Price] [Max Price] [Listing Type] [Reset]
Footer: Advanced Search | Map Search links
```

**Basic Usage:**

```html
<div class="rs-search-template-01"></div>
```

**With Locked Filters:**

```html
<div class="rs-search-template-01"
     data-rs-location="505"
     data-rs-listing-type="resale"></div>
```

**Preview:** [View Demo](https://realtysoft.ai/propertymanager/src/templates/search/template-01-compact-horizontal.html)

---

### Listing Template 01: Location-First Cards

Property cards with location as the main title, property type as subtitle, and price at bottom.

**Card Layout:**
```
┌─────────────────────────────────┐
│ [♥]  ← Wishlist (top-left)      │
│     [Image Carousel]            │
│  [◄]                    [►]     │
├─────────────────────────────────┤
│  Elviria                        │ ← Location (main title)
│  Residential Plot               │ ← Property type (subtitle)
│  Description text...            │ ← Truncated description
│  🛏 2  🚿 2  📐 105m²  📏 500m²  │ ← Specs with icons
│  €449,000                       │ ← Price at bottom
└─────────────────────────────────┘
```

**Basic Usage:**

```html
<div class="rs-listing-template-01"></div>
```

**With Locked Filters:**

```html
<div class="rs-listing-template-01"
     data-rs-location="505"
     data-rs-property-type="76"
     data-rs-listing-type="resale"></div>
```

**Preview:** [View Demo](https://realtysoft.ai/propertymanager/src/templates/listing/template-01-location-first.html)

---

### Grid Columns

Control how many property cards appear per row using `data-rs-columns`:

```html
<!-- 2 cards per row -->
<div class="rs-listing-template-01" data-rs-columns="2"></div>

<!-- 3 cards per row (default) -->
<div class="rs-listing-template-01" data-rs-columns="3"></div>

<!-- 4 cards per row -->
<div class="rs-listing-template-01" data-rs-columns="4"></div>
```

**Responsive Behavior:**

| Screen Size | 4 cols | 3 cols | 2 cols | 1 col |
|-------------|--------|--------|--------|-------|
| >1200px | 4 | 3 | 2 | 1 |
| 992-1200px | 3 | 3 | 2 | 1 |
| 768-992px | 2 | 2 | 2 | 1 |
| <768px | 1 | 1 | 1 | 1 |

Can also be applied to the property grid directly:

```html
<div class="rs_property_grid" data-rs-columns="2"></div>
```

---

### Complete Page Example

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://realtysoft.ai/propertymanager/dist/realtysoft.min.css">
</head>
<body>
    <!-- Search Form -->
    <div class="rs-search-template-01"></div>

    <!-- Property Listings -->
    <div class="rs-listing-template-01"></div>

    <script src="https://realtysoft.ai/propertymanager/dist/realtysoft.min.js"></script>
</body>
</html>
```

---

### Filter Attributes

Add `data-rs-*` attributes to lock or preset filters. Locked filters cannot be changed by visitors.

| Attribute | Description | Example Values |
|-----------|-------------|----------------|
| `data-rs-location` | Location ID | `"505"`, `"123"` |
| `data-rs-property-type` | Property type ID | `"76"`, `"77"` |
| `data-rs-listing-type` | Listing type | `"resale"`, `"development"`, `"long_rental"`, `"short_rental"` |
| `data-rs-beds-min` | Minimum bedrooms | `"1"`, `"2"`, `"3"` |
| `data-rs-beds-max` | Maximum bedrooms | `"3"`, `"4"`, `"5"` |
| `data-rs-baths-min` | Minimum bathrooms | `"1"`, `"2"` |
| `data-rs-baths-max` | Maximum bathrooms | `"2"`, `"3"` |
| `data-rs-price-min` | Minimum price (€) | `"100000"`, `"200000"` |
| `data-rs-price-max` | Maximum price (€) | `"500000"`, `"1000000"` |
| `data-rs-built-min` | Minimum built area (m²) | `"50"`, `"100"` |
| `data-rs-built-max` | Maximum built area (m²) | `"200"`, `"500"` |
| `data-rs-plot-min` | Minimum plot size (m²) | `"200"`, `"500"` |
| `data-rs-plot-max` | Maximum plot size (m²) | `"1000"`, `"5000"` |
| `data-rs-features` | Feature IDs (comma-separated) | `"1,5,12"` |
| `data-rs-ref` | Property reference | `"R123456"` |
| `data-rs-columns` | Grid columns (1-4) | `"2"`, `"3"`, `"4"` |

**Example - Luxury Villas Page:**

```html
<!-- Only show villas, 3+ beds, €500k+ -->
<div class="rs-search-template-01"
     data-rs-property-type="76"
     data-rs-beds-min="3"
     data-rs-price-min="500000"></div>

<div class="rs-listing-template-01"
     data-rs-property-type="76"
     data-rs-beds-min="3"
     data-rs-price-min="500000"></div>
```

**Example - Marbella Rentals Page:**

```html
<!-- Only show long-term rentals in location 505 -->
<div class="rs-search-template-01"
     data-rs-location="505"
     data-rs-listing-type="long_rental"></div>

<div class="rs-listing-template-01"
     data-rs-location="505"
     data-rs-listing-type="long_rental"></div>
```

---

### Available Templates

**Search Templates:**

| Template Class | Description |
|----------------|-------------|
| `rs-search-template-01` | Compact 2-row horizontal search form |
| `rs-search-template-02` | Single-row search bar |
| `rs-search-template-03` | Tab-based search (listing type tabs + fields row) |
| `rs-search-template-04` | Dark horizontal bar (2-row with labels) |
| `rs-search-template-05` | Vertical card/sidebar (stacked fields) |
| `rs-search-template-06` | Minimal single row (location + type + search) |

**Listing Templates:**

| Template Class | Description |
|----------------|-------------|
| `rs-listing-template-01` | Location-first property cards |
| `rs-listing-template-02` | Price on image overlay |
| `rs-listing-template-03` | Tag + icon specs card (pill badges, SVG icons) |
| `rs-listing-template-04` | Airbnb style (meta separator, location pin) |
| `rs-listing-template-05` | Hover overlay (content shown on hover) |
| `rs-listing-template-06` | Gradient overlay (permanent dark gradient) |
| `rs-listing-template-07` | Dark overlay with badges (price-first) |
| `rs-listing-template-08` | Minimal card design |
| `rs-listing-template-09` | Modern card with accent |
| `rs-listing-template-10` | Compact list-style card |
| `rs-listing-template-11` | Full-featured card with status tags on image |
| `rs-listing-template-12` | Magazine layout card |

---

### Property Carousel Templates

6 carousel templates for showcasing properties with different visual styles.

**Basic Usage:**

```html
<div class="rs_property_carousel" data-rs-template="6"></div>
```

**Available Templates:**

| Template | Class | Description |
|----------|-------|-------------|
| 1 | `rs-property-carousel--v1` | Standard horizontal carousel |
| 2 | `rs-property-carousel--v2` | 3D stacked cards with perspective effect |
| 3 | `rs-property-carousel--v3` | Coverflow style with grayscale inactive cards |
| 4 | `rs-property-carousel--v4` | Full-width hero carousel (info always visible) |
| 5 | `rs-property-carousel--v5` | Cards with info overlay (info always visible) |
| 6 | `rs-property-carousel--v6` | Dark cards with numbers |

---

### Template 06: Dark Cards with Numbers

A dark-themed carousel with numbered cards, property type display, and hover effects.

**Card Layout:**
```
┌─────────────────────────────────┐
│  01                             │ ← Large number (semi-transparent)
│                                 │
│  APARTMENT                      │ ← Property type (bold, white, uppercase)
│  Palm Beach, Florida            │ ← Location (grey, small)
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │      [Property Image]     │  │
│  │                           │  │
│  │              [POPULAR]    │  │ ← Badge (if featured)
│  └───────────────────────────┘  │
│                                 │
│  $450,000                       │ ← Price
│  3 Beds | 2 Bath                │ ← Specs
│                                 │
│  [View Detail]                  │ ← Button (always visible)
└─────────────────────────────────┘
```

**Features:**
- Dark background (#1a1f3c) on each card
- Large semi-transparent numbers
- Property type in bold white uppercase (18px)
- Location in grey
- Image height: 180px
- Price without /Month suffix
- Specs showing only Beds and Bath
- View Detail button always visible (purple)
- Hover effect: card background turns #f1f1f1, text inverts to dark
- Navigation arrows on right side, stacked vertically
- 3 cards visible on desktop
- 1 card at a time on mobile with swipe

**CSS Classes:**
```css
.rs-property-carousel--v6 .rs-property-carousel__card-number   /* Large number */
.rs-property-carousel--v6 .rs-property-carousel__card-type     /* Property type */
.rs-property-carousel--v6 .rs-property-carousel__card-location /* Location */
.rs-property-carousel--v6 .rs-property-carousel__card-price    /* Price */
.rs-property-carousel--v6 .rs-property-carousel__card-specs    /* Bed/Bath specs */
.rs-property-carousel--v6 .rs-property-carousel__card-view-btn /* View button */
```

**Responsive Behavior:**

| Screen Size | Cards Visible |
|-------------|---------------|
| Desktop (>768px) | 3 |
| Tablet (768px) | 1 (swipe) |
| Mobile (<480px) | 1 (swipe) |

---

## Configuration

### Global Configuration Object

```javascript
window.RealtySoftConfig = {
    // Auto-detected from domain whitelist (usually not needed):
    // apiKey: 'xxx',
    // apiUrl: 'https://crm.example.com',

    // Optional overrides
    language: 'en_US',              // Default language
    ownerEmail: 'agent@domain.com', // Inquiry form recipient
    privacyPolicyUrl: '/privacy',   // Privacy policy link
    propertyPageSlug: 'property',   // URL slug for property pages
    resultsPage: '/properties',     // Redirect URL for search-only mode (default: /properties)

    // Locked filters (visitor cannot change these)
    lockedFilters: {
        location_id: '123',         // Lock to specific location
        listing_type: 'resale',     // Lock to sale/rent
        property_type: ['76', '77'] // Lock to specific types
    }
};
```

### Data Attribute Configuration

You can also configure via data attributes on the container:

```html
<div id="rs_listing"
     data-rs-location="505"
     data-rs-property-type="76"
     data-rs-listing-type="resale"
     data-rs-beds-min="2">
    <!-- Components here -->
</div>
```

---

## Widget Modes

The widget automatically detects its mode based on which containers are present on the page.

### Mode Detection

| Mode | Containers Present | Behavior |
|------|-------------------|----------|
| `combined` | Both `#rs_search` AND `#rs_listing` | Search and results on same page |
| `search-only` | Only `#rs_search` (no listing) | Redirects to results page on search |
| `results-only` | Only `#rs_listing` (no search) | Just displays property listings |

### Search-Only Mode

**Use case:** Add a search form on your homepage that redirects to a dedicated results page when the user clicks search.

#### Homepage Setup (Search-Only)

```html
<!-- Homepage: Only search form, no listing container -->
<div class="rs-search-template-01"></div>

<script>
window.RealtySoftConfig = {
    resultsPage: '/properties'  // URL to redirect to (default: /properties)
};
</script>
```

When the user clicks "Search", they are redirected to `/properties?location=123&type=5&beds=2...` with all filter parameters in the URL.

#### Results Page Setup (Combined)

```html
<!-- Results page: Both search and listing -->
<div class="rs-search-template-01"></div>
<div class="rs-listing-template-01"></div>
```

The widget automatically:
1. Parses URL parameters (`?location=123&beds=2&...`)
2. Applies them as active filters
3. Performs the search and displays results
4. Populates the search form with the current filter values

#### URL Parameters

When redirecting from search-only mode, filters are passed as URL parameters:

| URL Parameter | Filter | Example |
|---------------|--------|---------|
| `location` | Location ID | `?location=505` |
| `sublocation` | Sub-location ID | `?sublocation=123` |
| `type` | Property Type ID | `?type=76` |
| `listing` | Listing Type | `?listing=resale` |
| `beds` | Min Bedrooms | `?beds=2` |
| `baths` | Min Bathrooms | `?baths=1` |
| `price_min` | Min Price | `?price_min=100000` |
| `price_max` | Max Price | `?price_max=500000` |
| `built_min` | Min Built Area | `?built_min=50` |
| `built_max` | Max Built Area | `?built_max=200` |
| `plot_min` | Min Plot Size | `?plot_min=200` |
| `plot_max` | Max Plot Size | `?plot_max=1000` |
| `ref` | Reference | `?ref=R123456` |
| `features` | Feature IDs | `?features=1,5,12` |

#### Check Mode Programmatically

```javascript
// Get current widget mode
const mode = RealtySoft.getMode();
console.log(mode); // 'combined', 'search-only', or 'results-only'
```

#### Complete Example

**Homepage (`/index.html`):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Find Your Dream Property</title>
    <link rel="stylesheet" href="https://realtysoft.ai/propertymanager/dist/realtysoft.min.css">
</head>
<body>
    <h1>Search Properties</h1>

    <!-- Search form only - will redirect on search -->
    <div class="rs-search-template-01"></div>

    <script>
    window.RealtySoftConfig = {
        resultsPage: '/properties'
    };
    </script>
    <script src="https://realtysoft.ai/propertymanager/dist/realtysoft.min.js"></script>
</body>
</html>
```

**Results Page (`/properties.html`):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Property Listings</title>
    <link rel="stylesheet" href="https://realtysoft.ai/propertymanager/dist/realtysoft.min.css">
</head>
<body>
    <h1>Property Listings</h1>

    <!-- Both search and listing - combined mode -->
    <div class="rs-search-template-01"></div>
    <div class="rs-listing-template-01"></div>

    <script src="https://realtysoft.ai/propertymanager/dist/realtysoft.min.js"></script>
</body>
</html>
```

---

## Search Components

### Location (`rs_location`)

Filter properties by location (municipality, city, area).

**Variations:**

| Variation | Type | Description |
|-----------|------|-------------|
| 1 | Typeahead | Autocomplete search input |
| 2 | Cascading | Parent → Child dropdowns |
| 3 | Hierarchical | Tree structure with checkboxes |
| 4 | Dropdown | Traditional select dropdown |

**Usage:**

```html
<!-- Typeahead -->
<div class="rs_location" data-rs-variation="1"></div>

<!-- Cascading (Municipality → City) -->
<div class="rs_location" data-rs-variation="2"
     data-rs-parent-type="municipality"
     data-rs-child-type="city"></div>

<!-- Hierarchical Multi-Select -->
<div class="rs_location" data-rs-variation="3"></div>

<!-- Traditional Dropdown -->
<div class="rs_location" data-rs-variation="4"></div>
```

---

### Listing Type (`rs_listing_type`)

Toggle between Sale, Rent, Holiday Rental, etc.

**Variations:**

| Variation | Type |
|-----------|------|
| 1 | Buttons (horizontal) |
| 2 | Dropdown |
| 3 | Tabs |

**Usage:**

```html
<!-- Buttons -->
<div class="rs_listing_type" data-rs-variation="1"></div>

<!-- Dropdown -->
<div class="rs_listing_type" data-rs-variation="2"></div>

<!-- Tabs -->
<div class="rs_listing_type" data-rs-variation="3"></div>
```

---

### Property Type (`rs_property_type`)

Filter by property type (Villa, Apartment, etc.).

**Variations:**

| Variation | Type |
|-----------|------|
| 1 | Typeahead autocomplete |
| 2 | Dropdown |
| 3 | Multi-select with checkboxes |

**Usage:**

```html
<div class="rs_property_type" data-rs-variation="2"></div>
```

---

### Bedrooms (`rs_bedrooms`)

Filter by bedroom count.

**Variations:**

| Variation | Type |
|-----------|------|
| 1 | Dropdown (min/max) |
| 2 | Button boxes (0-5+) |
| 3 | Multi-select |
| 4 | Free input |

**Options:**

```html
<!-- With minimum style (1+, 2+, 3+) -->
<div class="rs_bedrooms" data-rs-variation="2" data-rs-style="minimum"></div>

<!-- With exact style (1, 2, 3) -->
<div class="rs_bedrooms" data-rs-variation="2" data-rs-style="exact"></div>
```

---

### Bathrooms (`rs_bathrooms`)

Same variations as bedrooms.

```html
<div class="rs_bathrooms" data-rs-variation="1"></div>
```

---

### Price (`rs_price`)

Filter by price range.

**Variations:**

| Variation | Type |
|-----------|------|
| 1 | Min/Max input fields |
| 2 | Range slider |
| 3 | Preset options |

**Usage:**

```html
<!-- Min Price -->
<div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>

<!-- Max Price -->
<div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>

<!-- Range Slider (both min/max) -->
<div class="rs_price" data-rs-variation="2"></div>

<!-- Preset Options -->
<div class="rs_price" data-rs-variation="3"></div>
```

---

### Built Area (`rs_built_area`)

Filter by built size in m².

```html
<div class="rs_built_area" data-rs-variation="1"></div>
```

---

### Plot Size (`rs_plot_size`)

Filter by plot size in m².

```html
<div class="rs_plot_size" data-rs-variation="1"></div>
```

---

### Features (`rs_features`)

Filter by property features (pool, garage, etc.).

**Variations:**

| Variation | Type |
|-----------|------|
| 1 | Popup modal with categories |
| 2 | Inline checkboxes |
| 3 | Tags/chips |

```html
<div class="rs_features" data-rs-variation="1"></div>
```

---

### Reference (`rs_reference`)

Search by property reference number.

```html
<div class="rs_reference"></div>
```

---

### Search Button (`rs_search_button`)

Triggers search with current filters.

```html
<div class="rs_search_button"></div>
```

---

### Reset Button (`rs_reset_button`)

Resets all filters to defaults.

```html
<div class="rs_reset_button"></div>
```

---

## Listing Components

### Property Grid (`rs_property_grid`)

Displays search results in grid or list format.

```html
<div class="rs_property_grid"></div>
```

**Features:**
- Grid and list view support
- Image carousel with navigation arrows
- Property tags (For Sale, Featured, Own, etc.)
- Wishlist button on each card
- Lazy loading images
- Max 5 images per card for performance

**Custom Card Template:**

Place a template inside the grid to customize card layout:

```html
<div class="rs_property_grid">
    <div class="rs_card my-custom-card">
        <div class="rs_card_carousel"></div>
        <div class="my-content">
            <span class="rs_card_price"></span>
            <h3 class="rs_card_title"></h3>
            <p class="rs_card_location"></p>
            <div class="rs_card_beds"></div>
            <div class="rs_card_baths"></div>
            <a class="rs_card_link">View</a>
        </div>
    </div>
</div>
```

**Available Card Classes:**

| Class | Content |
|-------|---------|
| `rs_card_carousel` | Image carousel |
| `rs_card_image` | Single main image |
| `rs_card_title` | Property title |
| `rs_card_price` | Formatted price |
| `rs_card_ref` | Reference number |
| `rs_card_location` | Location name |
| `rs_card_beds` | Bedrooms count |
| `rs_card_baths` | Bathrooms count |
| `rs_card_built` | Built area (m²) |
| `rs_card_plot` | Plot size (m²) |
| `rs_card_description` | Short description |
| `rs_card_type` | Property type |
| `rs_card_status` | Status badge |
| `rs_card_wishlist` | Heart button |
| `rs_card_link` | Link to detail |

---

### Granular Card Sub-Components

15 standalone card sub-components that can be placed independently outside the property grid for fully custom card layouts. Each component reads its property from `data-rs-property-ref` or `data-rs-property-id` attributes and renders lazily via IntersectionObserver.

**Standalone Usage:**

```html
<!-- Custom card layout using individual sub-components -->
<div class="my-custom-card">
    <div class="rs_card_image" data-rs-property-ref="R123456"></div>
    <h3 class="rs_card_title" data-rs-property-ref="R123456"></h3>
    <div class="rs_card_price" data-rs-property-ref="R123456"></div>
    <div class="rs_card_location" data-rs-property-ref="R123456"></div>
    <div class="rs_card_beds" data-rs-property-ref="R123456"></div>
    <div class="rs_card_baths" data-rs-property-ref="R123456"></div>
    <div class="rs_card_built" data-rs-property-ref="R123456"></div>
    <div class="rs_card_wishlist" data-rs-property-ref="R123456"></div>
    <a class="rs_card_link" data-rs-property-ref="R123456">View Details</a>
</div>
```

**All Sub-Components:**

| Class | Description |
|-------|-------------|
| `rs_card_image` | Image carousel with navigation, lazy loading, srcset support |
| `rs_card_price` | Formatted price or "Price on Request" |
| `rs_card_title` | Property title |
| `rs_card_location` | Location with map pin icon |
| `rs_card_beds` | Bedroom count with icon and singular/plural label |
| `rs_card_baths` | Bathroom count with icon and singular/plural label |
| `rs_card_built` | Built area (m²) with icon |
| `rs_card_plot` | Plot size (m²) with icon |
| `rs_card_ref` | Reference number |
| `rs_card_type` | Property type |
| `rs_card_status` | Listing type badges (sale/rental/development/featured) |
| `rs_card_description` | Property description |
| `rs_card_wishlist` | Heart toggle with WishlistManager integration |
| `rs_card_link` | Link to property detail page |

**Options:**

```html
<!-- Limit carousel images -->
<div class="rs_card_image" data-rs-property-ref="R123456" data-rs-max-images="3"></div>
```

**Note:** Sub-components skip initialization when placed inside `.rs_property_grid` (the grid handles rendering internally).

---

### Pagination (`rs_pagination`)

Page navigation for results.

```html
<div class="rs_pagination"></div>
```

---

### Sort (`rs_sort`)

Sort dropdown for results.

```html
<div class="rs_sort"></div>
```

**Sort Options:**
- `create_date_desc` - Newest Listings
- `create_date` - Oldest Listings
- `last_date_desc` - Recently Updated
- `list_price` - Price: Low to High
- `list_price_desc` - Price: High to Low
- `is_featured_desc` - Featured First

---

### Results Count (`rs_results_count`)

Displays "X properties found".

```html
<div class="rs_results_count"></div>
```

---

### Active Filters (`rs_active_filters`)

Shows selected filters as removable tags.

```html
<div class="rs_active_filters"></div>
```

---

### View Toggle (`rs_view_toggle`)

Toggle between grid and list views.

```html
<div class="rs_view_toggle"></div>
```

---

## Detail Page Components

### Main Detail Container (`rs_detail`)

The main wrapper that loads property data and populates child elements.

```html
<div class="rs_detail" data-property-id="R5251381">
    <!-- Child components go here -->
</div>
```

**Property ID Sources (in order of priority):**

1. `data-property-id="123"` on `.rs_detail`
2. `data-property-ref="ABC-123"` on `.rs_detail`
3. URL: `/property/123`
4. URL: `/property/title-slug-R123456`
5. URL: `?id=123` or `?property_id=123`
6. URL: `?ref=ABC-123`

---

### Complete Template Example

```html
<div class="rs_detail" data-property-id="R5251381">

    <!-- Gallery -->
    <div class="rs_detail_gallery"></div>

    <!-- Two Column Layout -->
    <div class="rs_detail_layout">

        <!-- Main Content -->
        <div class="rs_detail_main">

            <!-- Header -->
            <div class="rs_detail_header">
                <span class="rs_detail_status"></span>
                <h1 class="rs_detail_title"></h1>
                <div class="rs_detail_price"></div>
                <div class="rs_detail_location"></div>
                <span class="rs_detail_ref">Ref: </span>
            </div>

            <!-- Specs -->
            <div class="rs_detail_specs">
                <div class="rs_detail_spec">
                    <span class="rs_detail_spec_value rs_detail_beds"></span>
                    <span class="rs_detail_spec_label">Bedrooms</span>
                </div>
                <div class="rs_detail_spec">
                    <span class="rs_detail_spec_value rs_detail_baths"></span>
                    <span class="rs_detail_spec_label">Bathrooms</span>
                </div>
                <div class="rs_detail_spec">
                    <span class="rs_detail_spec_value rs_detail_built"></span>
                    <span class="rs_detail_spec_label">Built Area</span>
                </div>
                <div class="rs_detail_spec">
                    <span class="rs_detail_spec_value rs_detail_plot"></span>
                    <span class="rs_detail_spec_label">Plot Size</span>
                </div>
            </div>

            <!-- Actions -->
            <div class="rs_detail_actions">
                <div class="rs_detail_wishlist"></div>
                <div class="rs_detail_share"></div>
            </div>

            <!-- Description -->
            <div class="rs_detail_section">
                <h2>Description</h2>
                <div class="rs_detail_description"></div>
            </div>

            <!-- Features -->
            <div class="rs_detail_features"></div>

            <!-- Map -->
            <div class="rs_detail_map" data-variation="1"></div>

        </div>

        <!-- Sidebar -->
        <div class="rs_detail_sidebar">

            <!-- Agent Card -->
            <div class="rs_detail_agent">
                <div class="rs_detail_agent_photo"></div>
                <div class="rs_detail_agent_name"></div>
                <a class="rs_detail_agent_phone"></a>
                <a class="rs_detail_agent_email"></a>
            </div>

            <!-- Inquiry Form -->
            <div class="rs_detail_inquiry_form"></div>

        </div>

    </div>

    <!-- Related Properties -->
    <div class="rs_detail_related" data-limit="8"></div>

</div>
```

---

### All Detail Component Classes

**Text/Content Containers:**

| Class | Description |
|-------|-------------|
| `rs_detail_title` | Property title |
| `rs_detail_price` | Formatted price |
| `rs_detail_ref` | Reference number |
| `rs_detail_unique_ref` | Unique reference |
| `rs_detail_location` | Location name |
| `rs_detail_address` | Street address |
| `rs_detail_postal_code` | Postal/ZIP code |
| `rs_detail_type` | Property type |
| `rs_detail_status` | Listing status |
| `rs_detail_beds` | Bedrooms count |
| `rs_detail_baths` | Bathrooms count |
| `rs_detail_built` | Built area (m²) |
| `rs_detail_plot` | Plot size (m²) |
| `rs_detail_terrace` | Terrace size (m²) |
| `rs_detail_solarium` | Solarium size (m²) |
| `rs_detail_garden` | Garden size (m²) |
| `rs_detail_usable` | Usable area (m²) |
| `rs_detail_year` | Year built |
| `rs_detail_floor` | Floor number |
| `rs_detail_orientation` | Orientation |
| `rs_detail_parking` | Parking spaces |
| `rs_detail_furnished` | Furnished status |
| `rs_detail_condition` | Property condition |
| `rs_detail_views` | Views |
| `rs_detail_community_fees` | Community fees/month |
| `rs_detail_ibi_tax` | IBI tax/year |
| `rs_detail_basura_tax` | Basura tax/year |
| `rs_detail_energy_rating` | Energy rating |
| `rs_detail_co2_rating` | CO2 rating |
| `rs_detail_energy_consumption` | Energy consumption |
| `rs_detail_description` | Full description |

**Agent Containers:**

| Class | Description |
|-------|-------------|
| `rs_detail_agent` | Agent card wrapper |
| `rs_detail_agent_name` | Agent name |
| `rs_detail_agent_phone` | Agent phone (auto-links) |
| `rs_detail_agent_email` | Agent email (auto-links) |
| `rs_detail_agent_photo` | Agent photo |

**Component Containers:**

| Class | Description | Options |
|-------|-------------|---------|
| `rs_detail_back` | Back button | |
| `rs_detail_gallery` | Image gallery | |
| `rs_detail_specs` | Key specs grid | |
| `rs_detail_features` | Features list | |
| `rs_detail_map` | Location map | `data-variation="1\|2\|3"` |
| `rs_detail_info_table` | Info table | |
| `rs_detail_sizes` | Sizes grid | |
| `rs_detail_taxes` | Taxes section | |
| `rs_detail_energy` | Energy cert | |
| `rs_detail_resources` | Video/Tour/PDF | |
| `rs_detail_pdf` | PDF button | |
| `rs_detail_inquiry_form` | Contact form | |
| `rs_detail_wishlist` | Wishlist button | |
| `rs_detail_share` | Share buttons | |
| `rs_detail_related` | Similar properties | `data-limit="6"` |

**Map Variations:**

```html
<!-- Municipality (default) -->
<div class="rs_detail_map" data-variation="1"></div>

<!-- Pinpoint (exact lat/lng) -->
<div class="rs_detail_map" data-variation="2"></div>

<!-- Zipcode -->
<div class="rs_detail_map" data-variation="3"></div>
```

---

## Utility Components

### Wishlist Button (`rs_wishlist_button`)

Standalone wishlist toggle for any property.

```html
<button class="rs_wishlist_button" data-property-id="R123456"></button>
```

### Wishlist Counter (`rs_wishlist_counter`)

Badge showing wishlist count.

```html
<div class="rs_wishlist_counter"></div>
```

---

## Wishlist System

The wishlist system allows users to save, compare, share, and manage their favorite properties. It supports both a **combined component** for quick implementation and **modular components** for custom layouts.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WishlistManager                          │
│  (Central state store - localStorage + events)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Header    │  │    Actions   │  │      Sort        │  │
│  │  (title/count)│ │(PDF/share/etc)│ │   (dropdown)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Shared Banner│  │    Empty     │  │       Grid       │  │
│  │(read-only msg)│ │   (no items) │  │ (property cards) │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌────────────────────────────────────┐  │
│  │ Compare Btn  │  │             Modals                  │  │
│  │  (floating)  │  │  (share, email, note, compare)     │  │
│  └──────────────┘  └────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Quick Start - Combined Component

For a standard wishlist page, use the combined component:

```html
<div class="rs_wishlist_list"></div>
```

This renders all components (header, actions, grid, modals, etc.) in a default layout.

### Modular Components

For custom layouts, use individual components:

| Component | Class | Purpose |
|-----------|-------|---------|
| Header | `rs_wishlist_header` | Title + property count |
| Actions | `rs_wishlist_actions` | PDF, Share, Email, Clear, Back buttons |
| Sort | `rs_wishlist_sort` | Sort dropdown |
| Grid | `rs_wishlist_grid` | Property cards display |
| Empty State | `rs_wishlist_empty` | Empty wishlist message |
| Compare Button | `rs_wishlist_compare_btn` | Floating compare button |
| Shared Banner | `rs_wishlist_shared_banner` | Banner for shared view |
| Modals | `rs_wishlist_modals` | All modals (share, email, note, compare) |

### Custom Layout Example

```html
<!-- Custom two-column layout -->
<div class="my-wishlist-page">

    <!-- Top Bar -->
    <div class="my-header-bar">
        <div class="rs_wishlist_header"></div>
        <div class="rs_wishlist_sort"></div>
    </div>

    <!-- Shared Wishlist Banner (if viewing shared link) -->
    <div class="rs_wishlist_shared_banner"></div>

    <!-- Main Content -->
    <div class="my-two-column">

        <!-- Sidebar -->
        <aside class="my-sidebar">
            <div class="rs_wishlist_actions"></div>
        </aside>

        <!-- Main Area -->
        <main class="my-main">
            <div class="rs_wishlist_empty"></div>
            <div class="rs_wishlist_grid"></div>
        </main>

    </div>

    <!-- Floating Compare Button -->
    <div class="rs_wishlist_compare_btn"></div>

    <!-- Modals (required for full functionality) -->
    <div class="rs_wishlist_modals"></div>

</div>
```

### Component Reference

#### Header (`rs_wishlist_header`)

Displays wishlist title and property count.

```html
<div class="rs_wishlist_header"></div>
```

**Features:**
- Shows "My Wishlist" or "Shared Wishlist" title
- Auto-updates count when properties added/removed
- Listens to `wishlistChanged` events

---

#### Actions (`rs_wishlist_actions`)

Action buttons for wishlist management.

```html
<div class="rs_wishlist_actions"></div>
```

**Buttons:**
- **Back** - Navigate back
- **Clear All** - Remove all properties (with confirmation)
- **Download PDF** - Generate PDF document
- **Share** - Open share modal
- **Email** - Open email modal

**Notes:**
- Hidden in shared view mode
- Hidden when wishlist is empty

---

#### Sort (`rs_wishlist_sort`)

Dropdown to sort wishlist properties.

```html
<div class="rs_wishlist_sort"></div>
```

**Sort Options:**
- Recently Added (default)
- Oldest First
- Price: High to Low
- Price: Low to High
- Name: A-Z
- Location: A-Z

---

#### Grid (`rs_wishlist_grid`)

Displays property cards.

```html
<div class="rs_wishlist_grid"></div>
```

**Features:**
- Image carousel per card
- Compare checkbox (if compare button present)
- Heart/remove button
- Add note button
- Property tags (For Sale, Featured, etc.)
- Lazy loading images
- Responsive grid layout

**Note:** Compare checkboxes only appear if `rs_wishlist_compare_btn` is also on the page.

---

#### Empty State (`rs_wishlist_empty`)

Shows when wishlist is empty.

```html
<div class="rs_wishlist_empty"></div>
```

**Features:**
- Heart icon
- Empty message
- "Browse Properties" link
- Auto-shows/hides based on wishlist count

---

#### Compare Button (`rs_wishlist_compare_btn`)

Floating button for comparing properties.

```html
<div class="rs_wishlist_compare_btn"></div>
```

**Features:**
- Shows count of selected properties
- Opens compare modal when clicked
- Requires minimum 2 properties selected
- Maximum 3 properties can be compared
- Hidden in shared view mode

**Important:** If this component is NOT on the page, compare checkboxes will NOT appear on property cards.

---

#### Shared Banner (`rs_wishlist_shared_banner`)

Banner shown when viewing a shared wishlist.

```html
<div class="rs_wishlist_shared_banner"></div>
```

**Features:**
- Only visible when URL contains `?shared=` parameter
- Shows "Viewing Shared Wishlist" message
- Indicates read-only mode

---

#### Modals (`rs_wishlist_modals`)

All modal dialogs for wishlist functionality.

```html
<div class="rs_wishlist_modals"></div>
```

**Modals Included:**
- **Share Modal** - Copy link, WhatsApp, Email, QR code
- **Email Modal** - Send wishlist via email form
- **Note Modal** - Add/edit personal notes on properties
- **Compare Modal** - Side-by-side property comparison table

**Important:** This component is required for Share, Email, Note, Compare, and PDF functionality to work.

---

### WishlistManager API

The `WishlistManager` provides centralized state and methods for wishlist operations.

#### Core Methods

```javascript
// Check if property is in wishlist
WishlistManager.has('R123456'); // true/false

// Add property to wishlist
WishlistManager.add({
    ref_no: 'R123456',
    name: 'Villa Example',
    list_price: 500000,
    location: 'Marbella',
    // ... other property data
});

// Remove property
WishlistManager.remove('R123456');

// Toggle (add/remove)
WishlistManager.toggle(property); // { action: 'added'|'removed', success: true }

// Get property count
WishlistManager.count();

// Get all as array (sorted)
WishlistManager.getAsArray('addedAt', 'desc');

// Clear entire wishlist
WishlistManager.clear();
```

#### Compare Methods

```javascript
// Add to compare (max 3)
WishlistManager.addToCompare('R123456'); // true/false

// Remove from compare
WishlistManager.removeFromCompare('R123456');

// Toggle compare
WishlistManager.toggleCompare('R123456'); // { success: true, action: 'added'|'removed'|'max_reached' }

// Check if in compare
WishlistManager.isInCompare('R123456'); // true/false

// Get compare count
WishlistManager.getCompareCount();

// Get compare properties
WishlistManager.getCompareProperties(); // Array of property objects

// Clear compare selection
WishlistManager.clearCompare();
```

#### Note Methods

```javascript
// Update property note
WishlistManager.updateNote('R123456', 'Great location, need to revisit');

// Get property with note
const property = WishlistManager.get('R123456');
console.log(property.note);
```

#### Share Methods

```javascript
// Generate shareable link
const shareLink = WishlistManager.generateShareLink();
// Returns: https://example.com/wishlist?shared=UjEyMzQ1NixSNzg5MDEy

// Check if viewing shared wishlist
WishlistManager.isSharedView(); // true/false

// Load shared refs from URL
const refs = WishlistManager.loadSharedWishlist(); // ['R123456', 'R789012']
```

#### Modal Communication

```javascript
// Open a modal
WishlistManager.openModal('share');   // Share modal
WishlistManager.openModal('email');   // Email modal
WishlistManager.openModal('compare'); // Compare modal
WishlistManager.openModal('note', { refNo: 'R123456' }); // Note modal
WishlistManager.openModal('pdf');     // Trigger PDF download

// Close a modal
WishlistManager.closeModal('share');
```

#### Events

Listen for wishlist events:

```javascript
// Wishlist changed (add/remove/clear)
window.addEventListener('wishlistChanged', (e) => {
    console.log('Action:', e.detail.action); // 'added', 'removed', 'cleared'
    console.log('Property:', e.detail.property);
    console.log('New count:', e.detail.count);
});

// Sort changed
window.addEventListener('wishlistSorted', (e) => {
    console.log('Sort field:', e.detail.field);
    console.log('Sort order:', e.detail.order);
});

// Compare selection changed
window.addEventListener('wishlistCompareChanged', (e) => {
    console.log('Selected refs:', e.detail.selected);
    console.log('Count:', e.detail.count);
    console.log('Max allowed:', e.detail.max);
});

// Modal open request
window.addEventListener('wishlistModalOpen', (e) => {
    console.log('Modal type:', e.detail.modalType);
    console.log('Data:', e.detail.data);
});
```

#### Event Constants

```javascript
const events = WishlistManager.getEvents();
// {
//     CHANGED: 'wishlistChanged',
//     SORTED: 'wishlistSorted',
//     COMPARE_CHANGED: 'wishlistCompareChanged',
//     MODAL_OPEN: 'wishlistModalOpen',
//     MODAL_CLOSE: 'wishlistModalClose'
// }
```

---

### Shared Wishlist Feature

Users can share their wishlist via a URL that encodes all property references.

**How it works:**
1. User clicks "Share" button
2. Share modal opens with options:
   - Copy link to clipboard
   - Share via WhatsApp
   - Share via Email
   - Generate QR code
3. Link format: `https://site.com/wishlist?shared=<base64-encoded-refs>`
4. Recipient opens link
5. Widget detects `shared` parameter
6. Properties loaded from API (read-only view)
7. Shared banner displayed

**Shared View Differences:**
- Read-only (no add/remove)
- No compare checkboxes
- No action buttons (Clear, PDF, Share, Email)
- Shared banner visible

---

### Email Wishlist Feature

Users can email their wishlist to anyone.

**Configuration:**
```javascript
window.RealtySoftConfig = {
    phpBase: 'https://realtysoft.ai/propertymanager/php',
    // or
    wishlistEmailEndpoint: 'https://realtysoft.ai/propertymanager/php/send-wishlist-email.php'
};
```

**Email includes:**
- Property images
- Property details (price, beds, baths, location)
- Personal message
- Links to property pages with styled "View Property" buttons

**Email recipients:**
- Recipient (the person the wishlist is shared with)
- Sender copy (confirmation to the person sharing)
- Owner notification (site owner receives notification of shared wishlist)

---

### PDF Download Feature

Generates a PDF document with all wishlist properties.

**Features:**
- Cover page with title and date
- One property per page
- Property image (cropped to fit)
- Full property details
- Personal notes (if any)
- Page numbers

**Dependencies:**
- jsPDF (loaded automatically from CDN)

---

### Storage

Wishlist data is stored in `localStorage`:

```javascript
// Storage key
const STORAGE_KEY = 'realtysoft_wishlist';

// Data format
{
    "R123456": {
        "ref_no": "R123456",
        "name": "Villa Example",
        "list_price": 500000,
        "location": "Marbella",
        "bedrooms": 3,
        "bathrooms": 2,
        "images": [...],
        "addedAt": 1705847200000,
        "note": "Great pool!"
    },
    "R789012": { ... }
}
```

---

### Wishlist List (`rs_wishlist_list`) - Combined

Full wishlist page displaying all saved properties (backward compatible combined component).

```html
<div class="rs_wishlist_list"></div>
```

This automatically creates and initializes all sub-components in a default layout.

---

### Language Selector (`rs_language_selector`)

Language dropdown.

```html
<div class="rs_language_selector"></div>
```

### Share Buttons (`rs_share_buttons`)

Social share buttons.

```html
<div class="rs_share_buttons" data-property-id="R123456"></div>
```

---

## State Management

### Accessing State

```javascript
// Get entire state
const state = RealtySoft.State.getState();

// Get specific value (dot notation)
const location = RealtySoft.State.get('filters.location');
const properties = RealtySoft.State.get('results.properties');

// Set value
RealtySoft.State.set('filters.bedsMin', 2);
RealtySoft.State.set('ui.view', 'list');
```

### Subscribing to Changes

```javascript
// Subscribe to specific path
const unsubscribe = RealtySoft.State.subscribe('filters.location', (newValue) => {
    console.log('Location changed:', newValue);
});

// Subscribe to all changes
RealtySoft.State.subscribe('*', (key, value) => {
    console.log(`${key} changed to:`, value);
});

// Unsubscribe
unsubscribe();
```

### State Structure

```javascript
{
    filters: {
        location: null,         // Location ID(s)
        listingType: null,      // 'resale', 'rental', 'new_development', 'holiday_rental'
        propertyType: [],       // Array of type IDs
        bedsMin: null,
        bedsMax: null,
        bathsMin: null,
        bathsMax: null,
        priceMin: null,
        priceMax: null,
        builtMin: null,
        builtMax: null,
        plotMin: null,
        plotMax: null,
        features: [],           // Array of feature IDs
        ref: ''                 // Reference search
    },
    lockedFilters: {},          // Immutable filters
    results: {
        properties: [],
        total: 0,
        page: 1,
        perPage: 12,
        totalPages: 0
    },
    currentProperty: {},        // Current detail page property
    ui: {
        view: 'grid',           // 'grid' or 'list'
        sort: 'create_date_desc',
        loading: false,
        error: null
    },
    wishlist: [],               // Array of property IDs
    data: {
        locations: [],
        propertyTypes: [],
        features: [],
        labels: {}
    },
    config: {
        apiKey: '',
        apiUrl: '',
        language: 'en_US',
        ownerEmail: '',
        privacyPolicyUrl: '',
        features: []
    }
}
```

---

## API Reference

### Public Methods

```javascript
// Initialize (auto-called on DOMContentLoaded)
RealtySoft.init();

// Perform search (in search-only mode, this redirects to results page)
RealtySoft.search();

// Load property by ID
RealtySoft.loadProperty('R123456');

// Load property by reference
RealtySoft.loadPropertyByRef('ABC-123');

// Reset filters
RealtySoft.reset();

// Set filter
RealtySoft.setFilter('bedsMin', 2);

// Set sort
RealtySoft.setSort('list_price_desc');

// Set view
RealtySoft.setView('list');

// Go to page
RealtySoft.goToPage(2);

// Get current widget mode ('combined', 'search-only', or 'results-only')
RealtySoft.getMode();
```

### API Service

```javascript
// Search properties
const results = await RealtySoft.API.searchProperties({
    location_id: '505',
    bedrooms_min: 2,
    list_price_max: 500000,
    limit: 12,
    page: 1
});

// Get single property
const property = await RealtySoft.API.getProperty('R123456');

// Get by reference
const property = await RealtySoft.API.getPropertyByRef('ABC-123');

// Get related properties
const related = await RealtySoft.API.getRelatedProperties('R123456', 6);

// Get locations
const locations = await RealtySoft.API.getLocations();

// Get property types
const types = await RealtySoft.API.getPropertyTypes();

// Get features
const features = await RealtySoft.API.getFeatures();

// Submit inquiry
await RealtySoft.API.submitInquiry({
    property_id: 'R123456',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+34123456789',
    message: 'I am interested...'
});
```

---

## Labels & i18n

The widget includes a complete internationalization system that affects **ALL data from the API** - not just UI labels, but also property types, features, and property details.

### How It Works

1. **Language Detection** (automatic):
   - Checks `window.RealtySoftConfig.language` (if manually set)
   - Falls back to browser language (`navigator.language`)
   - Falls back to HTML `<html lang="es">` attribute
   - Defaults to `en_US` if nothing detected

2. **ALL API Data in Detected Language**:

   | API Endpoint | Data Returned | Language Applied |
   |--------------|---------------|------------------|
   | `v1/plugin_labels` | UI labels (buttons, placeholders, messages) | ✅ Yes |
   | `v1/property_types` | Property types (Villa, Apartment, Penthouse) | ✅ Yes |
   | `v1/property_features` | Features (Pool, Garage, Air Conditioning) | ✅ Yes |
   | `v1/property` | Property title, description, details | ✅ Yes |
   | `v1/location` | Location names | ❌ No (default language) |

3. **Automatic Flow**:
```
Page loads → Widget detects language → ALL API calls include _lang parameter → ALL data returns in correct language
```

### Example: Spanish Website

If your website has `<html lang="es">`:

1. Widget detects `es` from HTML
2. Maps to `es_ES`
3. Sends `_lang=es_ES` to ALL API calls
4. API returns everything in Spanish:
   - **UI Labels**: `{ "search_button": "Buscar", "results_count": "{count} propiedades encontradas" }`
   - **Property Types**: `[{ "name": "Villa" }, { "name": "Apartamento" }, { "name": "Ático" }]`
   - **Features**: `[{ "name": "Piscina" }, { "name": "Garaje" }, { "name": "Aire acondicionado" }]`
   - **Property Details**: Title, description in Spanish (if stored in CRM)
5. Entire widget displays in Spanish

### Supported Languages

| Code | Language |
|------|----------|
| `en_US` | English (default) |
| `es_ES` | Spanish |
| `de_DE` | German |
| `fr_FR` | French |
| `it_IT` | Italian |
| `pt_PT` | Portuguese |
| `nl_NL` | Dutch |
| `ru_RU` | Russian |
| `zh_CN` | Chinese |
| `ja_JP` | Japanese |
| `ar_SA` | Arabic |
| `sv_SE` | Swedish |
| `no_NO` | Norwegian |
| `da_DK` | Danish |
| `fi_FI` | Finnish |
| `pl_PL` | Polish |

### Setting Language Manually

```javascript
// Via config (before widget loads)
window.RealtySoftConfig = {
    language: 'es_ES'
};
```

Or via HTML:
```html
<html lang="es">
```

### Using Labels in Code

```javascript
// Get a label
const text = RealtySoft.Labels.get('search_button');
// Returns "Search" or "Buscar" depending on language

// Get label with placeholder replacement
const text = RealtySoft.Labels.get('results_count', { count: 25 });
// Returns "25 properties found" or "25 propiedades encontradas"

// Format price (locale-aware)
const price = RealtySoft.Labels.formatPrice(250000, 'EUR');
// Returns "€250,000" (English) or "250.000 €" (Spanish)

// Format area
const area = RealtySoft.Labels.formatArea(150);
// Returns "150 m²"
```

### Label Categories (100+ labels)

| Category | Examples |
|----------|----------|
| Search UI | `search_location`, `search_button`, `search_reset` |
| Listing Type | `listing_type_sale`, `listing_type_new`, `listing_type_long_rental` |
| Results | `results_count`, `results_loading`, `results_sort` |
| Sort Options | `sort_newest`, `sort_price_asc`, `sort_price_desc` |
| Property Card | `card_beds`, `card_baths`, `card_view` |
| Detail Page | `detail_description`, `detail_features`, `detail_contact` |
| Wishlist | `wishlist_add`, `wishlist_remove`, `wishlist_empty` |
| Inquiry Form | `inquiry_name`, `inquiry_email`, `inquiry_submit` |
| Pagination | `pagination_prev`, `pagination_next`, `pagination_load_more` |
| General | `general_error`, `general_close`, `general_select` |

### Fallback Behavior

If API labels fail to load:
- Widget uses hardcoded English defaults
- Logs warning: "Could not load labels from API, using defaults"
- All functionality continues to work

---

## Analytics

### Tracked Events

| Category | Actions |
|----------|---------|
| `search` | filters_changed, search_performed |
| `view` | property_view, gallery_view, wishlist_view |
| `click` | property_click, pagination, sort, view_toggle, share, link |
| `wishlist` | add, remove, view, share_email, share_link, download_pdf |
| `inquiry` | submitted |

### Manual Tracking

```javascript
// Track custom event
RealtySoft.Analytics.track('custom', 'my_action', { key: 'value' });

// Track property view
RealtySoft.Analytics.trackPropertyView(propertyObject);

// Track property click
RealtySoft.Analytics.trackCardClick(propertyObject);
```

### Analytics Dashboard

The widget includes a complete analytics dashboard with two views:

**Admin Dashboard** (`analytics/admin.php`)
- Master view of all client analytics
- Aggregate statistics across domains
- Property-level performance rankings
- Conversion funnel analysis

**Client Dashboard** (`analytics/client.php?client=domain.com`)
- Client-specific analytics with login authentication
- Property rankings by views, wishlists, inquiries
- Conversion funnel visualization
- Date range filtering

### Dashboard Features

| Feature | Description |
|---------|-------------|
| Overview Cards | Total sessions, searches, property views, wishlists, inquiries |
| Property Rankings | Top properties by views, wishlists, inquiries, engagement |
| Performance Table | Sortable/filterable table of all property metrics |
| Funnel Analysis | Visual funnel: Sessions → Search → Click → View → Wishlist → Inquiry |
| Date Filtering | Filter analytics by date range |
| Client Comparison | Admin can compare metrics across clients |

### Property Analytics

The property analytics section shows detailed performance for individual properties:

```
Property Rankings Tabs:
├── Most Viewed      - Properties with highest view counts
├── Most Wishlisted  - Properties added to wishlists most
├── Most Inquired    - Properties with most inquiry submissions
└── Top Engagement   - Properties with best engagement score
```

**Engagement Score Formula:**
```
engagement = (views × 1) + (wishlists × 3) + (inquiries × 5)
```

### CSV Export

The analytics dashboard supports exporting data as CSV files. Available from the export dropdown in both admin and client dashboards.

**Export Types:**

| Export | API Action | Description |
|--------|------------|-------------|
| Raw Events | `?action=export` | All tracked events with timestamps, sessions, property data |
| Property Performance | `?action=export_properties` | Views, clicks, wishlists, inquiries, conversion rates per property |
| Daily Trends | `?action=export_trends` | Daily breakdown of searches, views, clicks, wishlists, inquiries |
| Search Insights | `?action=export_searches` | Most searched locations, property types, listing types |
| Conversion Funnel | `?action=export_funnel` | Funnel steps with session counts and conversion percentages |

**Usage (JavaScript):**

```javascript
// Trigger CSV download from dashboard
window.location.href = 'php/analytics-api.php?action=export&client=domain.com&from=2026-01-01&to=2026-01-31';
```

All exports support date range filtering via `from` and `to` parameters.

---

### Analytics API Endpoints

The analytics system exposes several API endpoints via `php/analytics-api.php`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `?action=summary` | GET | Overview statistics (sessions, searches, views, etc.) |
| `?action=daily` | GET | Daily breakdown for charts |
| `?action=property_rankings` | GET | Top properties by various metrics |
| `?action=property_detail&ref=R123` | GET | Detailed stats for a single property |
| `?action=property_funnel` | GET | Conversion funnel data |
| `?action=property_table` | GET | Paginated property list with search/sort |

### Client Authentication

Client dashboard requires login. Credentials are stored in `config/analytics-clients.php`:

```php
return [
    'example.com' => [
        'username' => 'example',
        'password' => password_hash('SecurePassword123', PASSWORD_DEFAULT),
        'display_name' => 'Example Real Estate',
        'domain' => 'example.com'
    ]
];
```

### Data Storage

Analytics data is stored in CSV files per client domain:

```
php/data/
├── analytics_example_com.csv      # Event data
├── sessions_example_com.csv       # Session data
└── analytics-debug.log            # Debug log (if enabled)
```

---

## PHP Backend

### API Proxy (`api-proxy.php`)

Secure proxy for API calls with domain whitelist validation.

**Domain Whitelist (`config/clients.php`):**

```php
<?php
return [
    'example.com' => [
        'api_key' => 'your-api-key',
        'api_url' => 'https://crm.example.com',
        'owner_email' => 'info@example.com',
        'enabled' => true,
        'features' => ['search', 'detail', 'wishlist', 'analytics'],
        'default_language' => 'en_US'
    ]
];
```

### Send Inquiry (`send-inquiry.php`)

Handles contact form submissions. Sends styled HTML emails to property owner (with all inquiry details) and a confirmation email to the sender (with "View Property" button). Supports CORS with `Content-Type`, `X-Requested-With`, and `Accept` headers.

### Analytics Track (`analytics-track.php`)

Receives and stores analytics events in CSV format.

### Wishlist PDF (`wishlist-pdf.php`)

Generates PDF of wishlist properties.

### Share (`share.php`)

Handles social sharing with Open Graph meta tags.

---

## Styling & Theming

### CSS Variables

```css
:root {
    /* Colors */
    --rs-primary: #2563eb;
    --rs-primary-hover: #1d4ed8;
    --rs-secondary: #64748b;
    --rs-success: #22c55e;
    --rs-danger: #ef4444;
    --rs-warning: #f59e0b;

    /* Text */
    --rs-text-primary: #1e293b;
    --rs-text-secondary: #64748b;
    --rs-text-muted: #94a3b8;

    /* Background */
    --rs-bg-white: #ffffff;
    --rs-bg-light: #f8fafc;
    --rs-bg-dark: #1e293b;

    /* Border */
    --rs-border-color: #e2e8f0;
    --rs-border-radius: 8px;

    /* Shadows */
    --rs-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --rs-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --rs-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

    /* Spacing */
    --rs-spacing-xs: 4px;
    --rs-spacing-sm: 8px;
    --rs-spacing-md: 16px;
    --rs-spacing-lg: 24px;
    --rs-spacing-xl: 32px;
}
```

### Customizing Styles

Override variables or add custom CSS:

```css
/* Custom theme */
:root {
    --rs-primary: #e11d48;  /* Rose color */
    --rs-border-radius: 12px;
}

/* Custom card styling */
.rs-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

---

## Performance & Caching

### Overview

The widget includes several performance optimizations for fast loading:

| Optimization | Description | Impact |
|--------------|-------------|--------|
| Single Location Request | Fetches all locations in 1 request (limit=1000) instead of paginated | 230+ requests → 1 |
| Request Deduplication | Prevents duplicate concurrent API calls | ~50% fewer requests |
| 24-Hour Cache | localStorage caching for static data | Near-instant repeat visits |
| Loading Skeletons | Animated placeholders during load | Better perceived performance |
| Lazy Loading | Viewport-based rendering via IntersectionObserver | Deferred off-screen work |

### Performance Metrics

| Metric | Before v2.2.0 | After v2.2.1 |
|--------|---------------|--------------|
| Location API requests | 230+ (paginated) | 1 |
| Labels/PropertyTypes | 2 each (duplicates) | 1 each |
| Total first-load requests | ~240 | ~5 |
| First load time | ~52 seconds | <5 seconds |

### Caching System

**Cached Data (24-hour TTL):**
- Locations (`rs_cache_locations`)
- Property Types (`rs_cache_propertyTypes_[lang]`)
- Labels (`rs_cache_labels_[lang]`)
- Features (`rs_cache_features_[lang]`)
- Search Results (`rs_cache_search_[hash]`)

**Property Cache (1-hour TTL):**
- Individual properties (`rs_cache_property_[id]`)
- Properties by ref (`rs_cache_property_ref_[ref]`)

### Clear Cache

```javascript
// Clear all widget cache
RealtySoftAPI.clearCache();

// Or manually via browser console
Object.keys(localStorage)
    .filter(k => k.startsWith('rs_cache_'))
    .forEach(k => localStorage.removeItem(k));
```

### Request Deduplication

The widget prevents duplicate concurrent API requests:

```javascript
// If two components request locations simultaneously:
RealtySoftAPI.getLocations(); // Makes API call
RealtySoftAPI.getLocations(); // Returns same promise (no duplicate request)
```

This is especially useful when multiple components initialize at the same time.

### Loading Skeletons

The widget shows animated skeleton placeholders immediately on load:

- **Search Form**: Skeleton input fields while data loads
- **Property Grid**: Skeleton cards with pulse animation
- **Auto-hiding**: Skeletons removed once components initialize

### Lazy Loading

Components not in the viewport are deferred using IntersectionObserver:

- **14 card sub-components** — viewport-based lazy loading via `onElementVisible()` in `card-utils.ts` (200px margin)
- **Property grid** — IntersectionObserver for carousel image lazy loading (`data-src` swapped to `src` on visibility)
- **Wishlist grid** — image lazy loading

**Eager by design (not lazy loaded):**
- Search components (12) — always above the fold
- Listing controls (5) — lightweight UI tied to search results
- Detail components (17) — render pre-fetched data
- Utility/wishlist components (13) — dedicated page, user navigated intentionally

---

## Build Process

### Build Commands

```bash
cd C:\Users\shahzaib\RealtysoftV3

# Type checking
npx tsc --noEmit

# Production build (IIFE bundle - backward compatible)
npx vite build

# ES module build (code-split chunks)
npm run build:es

# Service worker build
npm run build:sw

# All targets at once
npm run build:all

# Development server with HMR
npm run dev

# Run tests
npx vitest run

# Lint
npm run lint
```

### Output Files

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

## Deployment with Loader

### Why Use the Loader?

When deploying to many client websites, managing version updates becomes difficult. The loader script solves this:

| Without Loader | With Loader |
|----------------|-------------|
| Manual version updates on each client site | Deploy once, updates automatic |
| Browser caching issues | Automatic cache busting |
| Must coordinate updates | Instant updates to all clients |

### How the Loader Works

```javascript
// Loader generates hourly cache-bust version
var version = Math.floor(Date.now() / 3600000);

// Loads both files automatically
// realtysoft.min.css?v=473825
// realtysoft.min.js?v=473825
```

### Cache Busting Options

The loader uses **hourly** cache busting by default. You can customize this in `realtysoft-loader.js`:

```javascript
// Hourly (default) - clients get updates within 1 hour
var version = Math.floor(Date.now() / 3600000);

// Instant - clients always get fresh files (more server load)
var version = Date.now();

// Daily - clients get updates within 24 hours
var version = Math.floor(Date.now() / 86400000);
```

### Client Installation

Give clients this single line:

```html
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

That's it! No CSS link needed, no version numbers to manage.

### With Configuration

```html
<script>
window.RealtySoftConfig = {
    ownerEmail: 'agent@client.com',
    resultsPage: '/properties',
    language: 'es_ES'
};
</script>
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

### Loader Events

Listen for loader completion:

```javascript
document.addEventListener('realtysoft:loader-complete', function() {
    console.log('Widget loaded, now safe to use RealtySoft API');
});
```

### Build Script Features

- Vite-based build with TypeScript compilation
- Multiple build targets: IIFE (default), ES modules, Service Worker
- Tree shaking and minification via Rollup
- Path aliases (`@/`, `@core/`, `@components/`)
- TypeScript strict mode type checking
- 889 automated tests (Vitest + jsdom)

---

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify domain is in whitelist (`config/clients.php`)
3. Ensure scripts are loaded before DOM elements
4. Check network tab for failed API calls

### Search Returns No Results

1. Check filter values in state: `RealtySoft.State.getState()`
2. Verify API proxy is working
3. Check for locked filters that may be restricting results

### Property Detail Not Loading

1. Check URL pattern matches expected format
2. Verify property ID/reference is correct
3. Check API response in network tab

### Images Not Showing

1. Verify image URLs are accessible
2. Check for CORS issues
3. Ensure lazy loading is working (images need to be in viewport)

### Wishlist Not Persisting

1. Check localStorage is enabled
2. Verify `RealtySoft.State.get('wishlist')` returns array
3. Check for browser storage limits

### Analytics Not Tracking

1. Verify `analytics-track.php` is accessible
2. Check network tab for tracking requests
3. Verify domain is enabled for analytics in whitelist

---

## Platform Setup Guides

The RealtySoft widget can be deployed on any website platform. Each platform requires a slightly different setup to ensure property detail URLs work correctly (HTTP 200 instead of 404).

### SPA Router (All Platforms)

The widget includes a built-in SPA (Single Page Application) router that intercepts property card clicks and navigates without a page reload. This is automatic and requires no configuration.

**How it works:**
- When a user clicks a property card on the listing page, the router hides the listing and shows the detail view in-place
- The URL updates via `history.pushState()` to the SEO-friendly URL
- Browser back button returns to the listing with scroll position preserved
- Ctrl+click / Cmd+click / Shift+click still opens in a new tab
- If the router cannot activate (e.g. no listing containers found), it falls back to normal navigation

### WordPress Setup

#### 1. Install the RealtySoft Connector Plugin

The plugin adds WordPress rewrite rules so property detail URLs serve your property page with HTTP 200 instead of 404.

**Installation:**
1. Download `realtysoft-connector.zip` from the `wordpress/` directory
2. Go to WordPress Admin > Plugins > Add New > Upload Plugin
3. Upload the zip and click "Install Now"
4. Activate the plugin

**Configuration:**
1. Go to Settings > RealtySoft
2. The default slug `property` works out of the box
3. For multi-language sites, add additional slugs (e.g. `propiedad`, `immobilie`)

**Multi-Language Setup:**

Each language needs its own WordPress page and slug:

| Language | Page URL | Slug Setting |
|----------|----------|--------------|
| English  | `/property/` | `property` |
| Spanish  | `/propiedad/` | `propiedad` |
| German   | `/immobilie/` | `immobilie` |

Each page should have the RealtySoft widget embed code. The plugin creates a rewrite rule for each slug:
- `/property/villa-name-REF123` → serves `/property/` page (HTTP 200)
- `/propiedad/villa-name-REF123` → serves `/propiedad/` page (HTTP 200)

**Troubleshooting:**
- If property URLs still show 404: Go to Settings > Permalinks > Save Changes
- Verify your property page exists at the configured slug URL
- Check that the plugin is activated in Plugins list

#### 2. Embed the Widget

Add the RealtySoft widget script to your property page:
```html
<script>
window.RealtySoftConfig = {
  propertyPageSlug: 'property'
};
</script>
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.js"></script>
```

### Wix Setup

Wix does not support custom server-side rewrite rules. Use **query parameter URLs** instead.

#### 1. Create Property Page

Create a page in the Wix Editor at `/property` (or your preferred path).

#### 2. Add Widget Embed Code

Add the RealtySoft widget using a Custom HTML embed element:

```html
<script>
window.RealtySoftConfig = {
  propertyPageSlug: 'property',
  useQueryParamUrls: true  // Required for Wix
};
</script>
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.js"></script>
```

#### 3. How URLs Work

With `useQueryParamUrls: true`, property URLs use query parameters:
- Listing page: `/property`
- Detail page: `/property?ref=REF123`

The page exists natively in Wix (HTTP 200), and the widget reads the `ref` query parameter to load the property.

### Squarespace Setup

Similar to Wix — use query parameter URLs.

#### 1. Create Property Page

Create a page at `/property` in the Squarespace editor.

#### 2. Add Widget via Code Injection

Add the widget code via Settings > Advanced > Code Injection (Header), or use a Code Block on the page:

```html
<script>
window.RealtySoftConfig = {
  propertyPageSlug: 'property',
  useQueryParamUrls: true  // Required for Squarespace
};
</script>
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.js"></script>
```

### Static HTML / Custom Hosting

For sites with server access, configure URL rewriting at the server level.

#### Apache (.htaccess)

```apache
RewriteEngine On
RewriteRule ^property/.+$ /property/ [L]
```

#### Nginx

```nginx
location ~ ^/property/.+ {
    try_files $uri /property/index.html;
}
```

This gives you SEO-friendly URLs (`/property/villa-name-REF123`) with HTTP 200.

### Social Sharing Configuration

The widget generates share links that pass through `share.php` to provide proper Open Graph meta tags for social media crawlers (Facebook, WhatsApp, LinkedIn, Twitter/X).

**Automatic behavior:**
- `og:site_name` is automatically set to the client's domain name
- `og:url` points to the client's property page (not realtysoft.ai)
- The page title uses the client's domain name

**Custom site name:**

To override the automatic domain-based name, set `siteName` in your config:

```javascript
window.RealtySoftConfig = {
  siteName: 'Your Brand Name'  // Shown in social sharing cards
};
```

This sets `og:site_name` to "Your Brand Name" instead of the domain. The `site_name` field can also be configured per-client in `config/clients.php`.

### Early Content Hiding (Fallback)

If the server-side rewrite rule is not installed, the widget includes an automatic safety net that prevents the "flash of 404" on CMS platforms:

1. A CSS rule is injected synchronously during script parse
2. It hides all body content when the URL matches a property detail pattern
3. Once the widget initializes and injects the detail container, content becomes visible
4. A 3-second safety timeout ensures the page is never permanently hidden

This is automatic and requires no configuration. When the server-side fix (WordPress plugin or query param URLs) is in place, the early hide has no visible effect — it's removed immediately when the widget initializes.

---

## Support

For issues and feature requests:
- GitHub: [Report issues](https://github.com/anthropics/claude-code/issues)
- Documentation: This file and `DEVELOPMENT_STATUS.md`

---

*Documentation for v3.0.0 - Updated January 27, 2026*
