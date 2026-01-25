# RealtySoft Widget v2

A modular "Lego blocks" real estate property search widget system built with vanilla JavaScript.

**Current Version:** 2.3.0 | **Last Updated:** January 25, 2026

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
<script src="https://realtysoft.ai/realtysoft/dist/realtysoft-loader.min.js"></script>
```

The loader automatically handles cache busting - clients always get the latest version without manual updates.

**Option B: Direct Include (for development/testing)**

```html
<link rel="stylesheet" href="https://realtysoft.ai/realtysoft/dist/realtysoft.min.css?v=2.3.0">
<script src="https://realtysoft.ai/realtysoft/dist/realtysoft.min.js?v=2.3.0"></script>
```

### 2. Add Configuration (Optional)

```html
<script>
window.RealtySoftConfig = {
    ownerEmail: 'agent@domain.com',
    privacyPolicyUrl: '/privacy'
};
</script>
```

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

### Carousel Templates (6)

| Template | Description |
|----------|-------------|
| 1 | Standard horizontal carousel |
| 2 | 3D stacked cards with perspective |
| 3 | Coverflow with grayscale effect |
| 4 | Full-width hero carousel |
| 5 | Cards with info overlay |
| 6 | Dark cards with numbers |

### Detail Components (17)

| Component | Description |
|-----------|-------------|
| `rs_detail` | Main wrapper (auto-loads property) |
| `rs_detail_gallery` | Image carousel + lightbox |
| `rs_detail_title` | Property title |
| `rs_detail_price` | Formatted price |
| `rs_detail_description` | Full description |
| `rs_detail_features` | Features list |
| `rs_detail_map` | Location map |
| `rs_detail_inquiry_form` | Contact form |
| `rs_detail_wishlist` | Wishlist button |
| `rs_detail_share` | Share buttons |
| `rs_detail_related` | Similar properties |
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
cd C:\Users\shahzaib\realtysoft
node build.js
```

**Output:**
- `dist/realtysoft.js` - Unminified JS
- `dist/realtysoft.min.js` - Minified JS
- `dist/realtysoft.css` - Unminified CSS
- `dist/realtysoft.min.css` - Minified CSS
- `dist/realtysoft-loader.js` - Auto-versioning loader (unminified)
- `dist/realtysoft-loader.min.js` - Auto-versioning loader (~600 bytes, for production)

---

## File Structure

```
realtysoft/
├── build.js                     # Build script
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
│   ├── send-inquiry.php         # Inquiry handler
│   ├── analytics-track.php      # Analytics tracking
│   ├── analytics-api.php        # Analytics API endpoints
│   ├── wishlist-pdf.php         # PDF generation
│   └── share.php                # Social sharing
│
└── src/                         # Source code
    ├── core/                    # Core modules (6 files)
    ├── components/              # Components (40+ files)
    └── styles/                  # CSS (6,734 lines)
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
<script src="https://realtysoft.ai/realtysoft/dist/realtysoft-loader.min.js"></script>
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
| Core System | ✅ Complete |
| Search Components (12) | ✅ Complete |
| Listing Components (6) | ✅ Complete |
| Detail Components (17) | ✅ Complete |
| Utility Components (5) | ✅ Complete |
| PHP Backend (5) | ✅ Complete |
| Performance Optimization | ✅ Complete |
| Templates | ⚠️ Partial (Carousels complete) |
| Analytics Dashboard | ✅ Complete |

### Recent Updates (v2.3.0)
- **Property Carousel Templates:** 6 carousel templates with unique designs
- **Template 06 (Dark Cards):** Dark cards with numbers, property type, location, price, specs, View Detail button
- **Carousel Mobile:** 1 card at a time on mobile for all carousel templates
- **Template 02 Mobile Fix:** Fixed layout overflow on mobile devices

### Previous Updates (v2.2.2)
- **Script Loader:** Auto-versioning loader for multi-client deployment - clients always get latest version
- **Search-Only Mode:** Add search on homepage that redirects to results page
- **URL Parameter Parsing:** Automatically applies filters from URL parameters
- **Grid Columns:** Configure 1-4 property cards per row with `data-rs-columns` attribute
- **Mobile Layout:** Improved responsive layout with search button at bottom
- **View Toggle:** Hidden on mobile (grid/list look the same on small screens)
- **Carousel Fix:** Fixed navigation arrow shifting on hover

### Previous Updates (v2.2.1)
- **Performance:** Reduced first-load API requests from 230+ to ~5 (10x faster)
- **Request Deduplication:** Prevents duplicate concurrent API calls
- **Loading Skeletons:** Shows animated placeholders while loading
- **Caching:** 24-hour localStorage cache for locations, property types, labels

See [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) for detailed status.

---

## Analytics Dashboard

The widget includes a complete analytics dashboard for tracking user behavior.

### Admin Dashboard
Access at: `realtysoft/analytics/admin.php`
- View analytics for all clients
- Aggregate statistics across domains
- Property-level performance analytics

### Client Dashboard
Access at: `realtysoft/analytics/client.php?client=domain.com`
- Client-specific analytics with login
- Property rankings and performance
- Conversion funnel analysis

### Tracked Metrics
- Page views and sessions
- Property clicks and views
- Wishlist adds/removes
- Inquiry submissions
- Search events

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
