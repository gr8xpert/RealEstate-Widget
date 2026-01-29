# RealtySoft Widget - User Guide

> A complete guide for website owners to deploy, customize, and configure the RealtySoft property widget.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Finding Your Filter IDs](#finding-your-filter-ids)
3. [Locking Pages with Filters](#locking-pages-with-filters)
4. [Search Templates](#search-templates)
5. [Listing Templates (Property Cards)](#listing-templates-property-cards)
6. [Creating a Property Detail Page](#creating-a-property-detail-page)
7. [Building Custom Layouts](#building-custom-layouts)
8. [Grid Columns Configuration](#grid-columns-configuration)
9. [Search-Only Mode (Homepage Search)](#search-only-mode-homepage-search)
10. [Configuration Options](#configuration-options)
11. [Platform-Specific Setup](#platform-specific-setup)

---

## Quick Start

### 1. Add the Widget Script

Add this single line to your website (works in any CMS - WordPress, Wix, Squarespace, etc.):

```html
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

### 2. Add Search and Listings

```html
<!-- Search Form -->
<div class="rs-search-template-01"></div>

<!-- Property Listings -->
<div class="rs-listing-template-01"></div>
```

That's it! The widget will automatically initialize and display your properties.

---

## Finding Your Filter IDs

Before you can lock pages to specific locations, property types, or features, you need to find the correct IDs for your data.

### For WordPress Users

If you have the RealtySoft Connector plugin installed, finding your filter IDs is easy:

1. Go to **Settings > RealtySoft** in your WordPress admin
2. Scroll down to the **Filter IDs Reference** section
3. Click the **"Open Filter IDs Reference"** button

This automatically opens the reference page pre-configured for your domain, showing all your locations, property types, and features with their IDs.

```
┌─────────────────────────────────────────────────────────────────┐
│  Filter IDs Reference                                           │
│                                                                 │
│  To lock filters on specific pages (e.g., show only villas     │
│  in Marbella), you need the IDs for locations, property        │
│  types, and features.                                          │
│                                                                 │
│  View Filter IDs    [ Open Filter IDs Reference ]              │
│                                                                 │
│  Opens a page showing all available Location, Property Type,   │
│  and Feature IDs for yourdomain.com.                           │
│                                                                 │
│  Example: <div data-rs-component="search" data-rs-location="5">│
└─────────────────────────────────────────────────────────────────┘
```

### For Non-WordPress Users

Visit the Filter IDs Reference page and enter your domain:

```
https://realtysoft.ai/propertymanager/pages/filter-ids.html?domain=yourdomain.com
```

### What You'll Find

| Section | What You'll Find |
|---------|-----------------|
| **Locations** | All locations (countries, regions, cities, neighborhoods) with their IDs |
| **Property Types** | All property types (Villa, Apartment, etc.) with their IDs |
| **Features** | All features (Pool, Garden, etc.) with their IDs |

### How to Use the Page

1. Enter your website domain (e.g., `mywebsite.com`) — *WordPress users: this is pre-filled*
2. Click "Load Data"
3. Browse or search for the location/type/feature you need
4. Click "Copy" to copy the data attribute (e.g., `data-rs-location="505"`)
5. Paste into your HTML

---

## Locking Pages with Filters

Lock your search and listing components to show only specific properties. This is useful for creating dedicated pages like "Villas in Marbella" or "Apartments for Rent".

### Available Filter Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-rs-location` | Lock to location ID(s) | `"505"` or `"505,506,507"` |
| `data-rs-property-type` | Lock to property type ID | `"76"` |
| `data-rs-listing-type` | Lock to listing type | `"resale"`, `"long_rental"`, `"short_rental"`, `"development"` |
| `data-rs-beds-min` | Minimum bedrooms | `"2"` |
| `data-rs-beds-max` | Maximum bedrooms | `"4"` |
| `data-rs-baths-min` | Minimum bathrooms | `"1"` |
| `data-rs-baths-max` | Maximum bathrooms | `"3"` |
| `data-rs-price-min` | Minimum price | `"100000"` |
| `data-rs-price-max` | Maximum price | `"500000"` |
| `data-rs-built-min` | Minimum built area (m²) | `"50"` |
| `data-rs-built-max` | Maximum built area (m²) | `"200"` |
| `data-rs-plot-min` | Minimum plot size (m²) | `"500"` |
| `data-rs-plot-max` | Maximum plot size (m²) | `"2000"` |
| `data-rs-features` | Feature IDs (comma-separated) | `"101,102,103"` |
| `data-rs-ref` | Specific property reference | `"R123456"` |

### Example: Luxury Villas Page

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

### Example: Marbella Rentals Page

```html
<!-- Only show long-term rentals in location 505 -->
<div class="rs-search-template-01"
     data-rs-location="505"
     data-rs-listing-type="long_rental"></div>

<div class="rs-listing-template-01"
     data-rs-location="505"
     data-rs-listing-type="long_rental"></div>
```

### Example: Multiple Locations

```html
<!-- Show properties in locations 505, 506, and 507 -->
<div class="rs-listing-template-01"
     data-rs-location="505,506,507"></div>
```

### Example: Properties with Pool

```html
<!-- Only show properties with pool feature (ID: 101) -->
<div class="rs-listing-template-01"
     data-rs-features="101"></div>
```

---

## Search Templates

Choose from 6 pre-built search form designs. Just add the class to an empty div.

### Available Search Templates

| Template | Class | Description |
|----------|-------|-------------|
| 01 | `rs-search-template-01` | Compact 2-row horizontal form |
| 02 | `rs-search-template-02` | Single-row search bar |
| 03 | `rs-search-template-03` | Tab-based search (listing type tabs) |
| 04 | `rs-search-template-04` | Dark horizontal bar with labels |
| 05 | `rs-search-template-05` | Vertical card/sidebar layout |
| 06 | `rs-search-template-06` | Minimal single row |

### Usage Examples

```html
<!-- Compact horizontal (recommended) -->
<div class="rs-search-template-01"></div>

<!-- Single row search bar -->
<div class="rs-search-template-02"></div>

<!-- Tab-based search -->
<div class="rs-search-template-03"></div>

<!-- Dark theme -->
<div class="rs-search-template-04"></div>

<!-- Sidebar/vertical -->
<div class="rs-search-template-05"></div>

<!-- Minimal -->
<div class="rs-search-template-06"></div>
```

### Search Template with Locked Filters

```html
<div class="rs-search-template-01"
     data-rs-location="505"
     data-rs-listing-type="resale"></div>
```

---

## Listing Templates (Property Cards)

Choose from 12 property card designs. Each template displays properties differently.

### Available Listing Templates

| Template | Class | Description |
|----------|-------|-------------|
| 01 | `rs-listing-template-01` | Location-first cards |
| 02 | `rs-listing-template-02` | Price on image overlay |
| 03 | `rs-listing-template-03` | Tag + icon specs (pill badges) |
| 04 | `rs-listing-template-04` | Airbnb style |
| 05 | `rs-listing-template-05` | Hover overlay effect |
| 06 | `rs-listing-template-06` | Gradient overlay |
| 07 | `rs-listing-template-07` | Dark overlay with badges |
| 08 | `rs-listing-template-08` | Minimal card design |
| 09 | `rs-listing-template-09` | Modern card with accent |
| 10 | `rs-listing-template-10` | Compact list-style |
| 11 | `rs-listing-template-11` | Full-featured with status tags |
| 12 | `rs-listing-template-12` | Magazine layout |

### Usage Examples

```html
<!-- Location-first cards -->
<div class="rs-listing-template-01"></div>

<!-- Price overlay style -->
<div class="rs-listing-template-02"></div>

<!-- Airbnb style -->
<div class="rs-listing-template-04"></div>

<!-- Hover overlay effect -->
<div class="rs-listing-template-05"></div>
```

### Card Layout Preview (Template 01)

```
┌─────────────────────────────────┐
│ [♥]  ← Wishlist button          │
│     [Image Carousel]            │
│  [◄]                    [►]     │
├─────────────────────────────────┤
│  Elviria                        │ ← Location
│  Residential Plot               │ ← Property type
│  Description text...            │ ← Description
│  🛏 2  🚿 2  📐 105m²  📏 500m²  │ ← Specs
│  €449,000                       │ ← Price
└─────────────────────────────────┘
```

---

## Creating a Property Detail Page

### Option 1: Using the Detail Template (Easiest)

Create a page at `/property/` and add:

```html
<div class="rs_detail">
    <div class="rs-property-detail-template"></div>
</div>
```

The widget automatically:
1. Reads the property ID from the URL
2. Loads property data from the API
3. Renders the complete detail page

### Option 2: Custom Detail Layout

Build your own layout using individual detail components:

```html
<div class="rs_detail">
    <!-- Gallery -->
    <div class="rs_detail_gallery"></div>

    <!-- Header -->
    <h1 class="rs_detail_title"></h1>
    <div class="rs_detail_price"></div>
    <div class="rs_detail_location"></div>
    <span class="rs_detail_ref"></span>

    <!-- Specs -->
    <div class="rs_detail_specs">
        <span class="rs_detail_beds"></span> Beds
        <span class="rs_detail_baths"></span> Baths
        <span class="rs_detail_built"></span> m² Built
        <span class="rs_detail_plot"></span> m² Plot
    </div>

    <!-- Description -->
    <div class="rs_detail_description"></div>

    <!-- Features -->
    <div class="rs_detail_features"></div>

    <!-- Video, Virtual Tour, PDF -->
    <div class="rs_detail_resources"></div>

    <!-- Map -->
    <div class="rs_detail_map"></div>

    <!-- Contact Form -->
    <div class="rs_detail_inquiry_form"></div>

    <!-- Similar Properties -->
    <div class="rs_detail_related" data-limit="6"></div>
</div>
```

### All Available Detail Components

**Text/Content:**

| Class | Description |
|-------|-------------|
| `rs_detail_title` | Property title |
| `rs_detail_price` | Formatted price |
| `rs_detail_ref` | Reference number |
| `rs_detail_location` | Location name |
| `rs_detail_address` | Street address |
| `rs_detail_type` | Property type |
| `rs_detail_status` | Listing status |
| `rs_detail_beds` | Bedrooms count |
| `rs_detail_baths` | Bathrooms count |
| `rs_detail_built` | Built area (m²) |
| `rs_detail_plot` | Plot size (m²) |
| `rs_detail_year` | Year built |
| `rs_detail_description` | Full description |

**Interactive Components:**

| Class | Description |
|-------|-------------|
| `rs_detail_gallery` | Image gallery with lightbox |
| `rs_detail_features` | Categorized features list |
| `rs_detail_map` | Location map |
| `rs_detail_resources` | Video, virtual tour, and PDF links (all in one) |
| `rs_detail_video` | Video player/embed |
| `rs_detail_virtual_tour` | Virtual tour embed |
| `rs_detail_pdf` | PDF download button |
| `rs_detail_inquiry_form` | Contact form |
| `rs_detail_wishlist` | Wishlist button |
| `rs_detail_share` | Social share buttons |
| `rs_detail_related` | Similar properties |
| `rs_detail_back` | Back button |

### URL Formats Supported

The detail page automatically detects the property from these URL formats:

- `/property/123` - By ID
- `/property/villa-marbella-R123456` - SEO-friendly with reference
- `/property?id=123` - Query parameter
- `/property?ref=R123456` - Reference query parameter

---

## Building Custom Layouts

### Custom Search Form

Build your own search layout using individual components:

```html
<div id="rs_search">
    <div class="rs_location" data-rs-variation="1"></div>
    <div class="rs_listing_type" data-rs-variation="1"></div>
    <div class="rs_property_type" data-rs-variation="2"></div>
    <div class="rs_bedrooms" data-rs-variation="1"></div>
    <div class="rs_bathrooms" data-rs-variation="1"></div>
    <div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>
    <div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>
    <div class="rs_features" data-rs-variation="1"></div>
    <div class="rs_reference"></div>
    <div class="rs_search_button"></div>
    <div class="rs_reset_button"></div>
</div>
```

### Search Component Variations

| Component | Variations |
|-----------|------------|
| `rs_location` | 1: Typeahead, 2: Cascading, 3: Hierarchical, 4: Dropdown |
| `rs_listing_type` | 1: Buttons, 2: Dropdown, 3: Tabs |
| `rs_property_type` | 1: Typeahead, 2: Dropdown, 3: Multi-select |
| `rs_bedrooms` | 1: Dropdown, 2: Buttons, 3: Multi-select, 4: Free input |
| `rs_bathrooms` | 1: Dropdown, 2: Buttons, 3: Multi-select, 4: Free input |
| `rs_price` | 1: Input fields, 2: Range slider, 3: Preset options |
| `rs_features` | 1: Popup modal, 2: Inline checkboxes, 3: Tags |

### Custom Listing Layout

Build your own listing layout:

```html
<div id="rs_listing">
    <!-- Results info -->
    <div class="rs_results_count"></div>
    <div class="rs_sort"></div>
    <div class="rs_view_toggle"></div>

    <!-- Active filter tags -->
    <div class="rs_active_filters"></div>

    <!-- Property grid -->
    <div class="rs_property_grid"></div>

    <!-- Pagination -->
    <div class="rs_pagination"></div>
</div>
```

### Custom Property Card

Define your own card template inside the grid:

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
            <div class="rs_card_built"></div>
            <div class="rs_card_wishlist"></div>
            <a class="rs_card_link">View Details</a>
        </div>
    </div>
</div>
```

### Available Card Classes

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
| `rs_card_status` | Status badges |
| `rs_card_wishlist` | Heart button |
| `rs_card_link` | Link to detail |

---

## Grid Columns Configuration

Control how many property cards appear per row:

```html
<!-- 2 cards per row -->
<div class="rs-listing-template-01" data-rs-columns="2"></div>

<!-- 3 cards per row (default) -->
<div class="rs-listing-template-01" data-rs-columns="3"></div>

<!-- 4 cards per row -->
<div class="rs-listing-template-01" data-rs-columns="4"></div>
```

### Responsive Behavior

The grid automatically adapts to screen size:

| Screen Size | 4 cols | 3 cols | 2 cols |
|-------------|--------|--------|--------|
| Desktop (>1200px) | 4 | 3 | 2 |
| Tablet (992-1200px) | 3 | 3 | 2 |
| Mobile (768-992px) | 2 | 2 | 2 |
| Small Mobile (<768px) | 1 | 1 | 1 |

---

## Search-Only Mode (Homepage Search)

Add a search form on your homepage that redirects to a results page.

### Homepage Setup

```html
<!-- Homepage: Only search form -->
<div class="rs-search-template-01"></div>

<script>
window.RealtySoftConfig = {
    resultsPage: '/properties'  // URL to redirect to
};
</script>
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

### Results Page Setup

```html
<!-- Results page: Both search and listing -->
<div class="rs-search-template-01"></div>
<div class="rs-listing-template-01"></div>

<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

When users search on the homepage, they're redirected to `/properties?location=123&type=5&beds=2...` with all filters in the URL.

---

## Configuration Options

### Basic Configuration

```html
<script>
window.RealtySoftConfig = {
    language: 'en_US',              // Language (en_US, es_ES, de_DE, fr_FR, etc.)
    ownerEmail: 'agent@domain.com', // Inquiry form recipient
    privacyPolicyUrl: '/privacy',   // Privacy policy link
    propertyPageSlug: 'property',   // URL slug for property pages
    resultsPage: '/properties',     // Redirect URL for search-only mode
    siteName: 'My Real Estate'      // Site name for social sharing
};
</script>
```

### Supported Languages

| Code | Language |
|------|----------|
| `en_US` | English |
| `es_ES` | Spanish |
| `de_DE` | German |
| `fr_FR` | French |
| `it_IT` | Italian |
| `pt_PT` | Portuguese |
| `nl_NL` | Dutch |
| `ru_RU` | Russian |
| `sv_SE` | Swedish |
| `no_NO` | Norwegian |
| `da_DK` | Danish |
| `fi_FI` | Finnish |
| `pl_PL` | Polish |

Language is auto-detected from:
1. `RealtySoftConfig.language` (if set)
2. Browser language
3. HTML `<html lang="es">` attribute

---

## Platform-Specific Setup

### WordPress

1. Install the RealtySoft Connector plugin
2. Create pages:
   - `/properties/` - Search & listing
   - `/property/` - Detail page
   - `/wishlist/` - Wishlist page
3. Add the widget script to your pages

### Wix / Squarespace

Use query parameter URLs since these platforms don't support server-side rewrites:

```html
<script>
window.RealtySoftConfig = {
    propertyPageSlug: 'property',
    useQueryParamUrls: true  // Required for Wix/Squarespace
};
</script>
```

Property URLs will use: `/property?ref=R123456`

### Static HTML / Custom Hosting

For SEO-friendly URLs, add server rewrite rules:

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteRule ^property/.+$ /property/ [L]
```

**Nginx:**
```nginx
location ~ ^/property/.+ {
    try_files $uri /property/index.html;
}
```

---

## Complete Page Examples

### Properties Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Properties for Sale</title>
</head>
<body>
    <h1>Find Your Dream Property</h1>

    <!-- Search -->
    <div class="rs-search-template-01"></div>

    <!-- Results -->
    <div class="rs-listing-template-01" data-rs-columns="3"></div>

    <script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
</body>
</html>
```

### Villas in Marbella Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Luxury Villas in Marbella</title>
</head>
<body>
    <h1>Luxury Villas in Marbella</h1>

    <!-- Locked to villas in Marbella -->
    <div class="rs-search-template-01"
         data-rs-location="505"
         data-rs-property-type="76"></div>

    <div class="rs-listing-template-01"
         data-rs-location="505"
         data-rs-property-type="76"
         data-rs-columns="3"></div>

    <script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
</body>
</html>
```

### Property Detail Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Property Details</title>
</head>
<body>
    <div class="rs_detail">
        <div class="rs-property-detail-template"></div>
    </div>

    <script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
</body>
</html>
```

### Wishlist Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Wishlist</title>
</head>
<body>
    <div class="rs_wishlist_list"></div>

    <script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
</body>
</html>
```

---

## Need Help?

- **Filter IDs Reference:** `https://realtysoft.ai/propertymanager/pages/filter-ids.html?domain=yourdomain.com`
- **Full Documentation:** See `DOCUMENTATION.md` for complete technical reference

---

*Last Updated: January 2026*
