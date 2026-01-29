# RealtySoft Widget

A powerful, embeddable real estate property search and listing widget for websites.

## Features

- **Property Search** - Advanced filtering by location, listing type, property type, bedrooms, bathrooms, and price
- **Multi-Language Support** - Built-in support for English, Spanish, German, and French
- **Responsive Grid** - Beautiful property cards with grid/list view toggle
- **Wishlist** - Save favorite properties and export to PDF
- **Analytics** - Track user interactions and property views
- **AI Search** - Intelligent property search capabilities
- **Social Sharing** - Share properties with Open Graph support
- **Inquiry Forms** - Built-in contact/inquiry functionality

## Project Structure

```
propertymanager/
├── dist/                  # Production build files
│   ├── realtysoft.js      # UMD bundle
│   ├── realtysoft.es.js   # ES module bundle
│   └── style.css          # Compiled styles
├── pages/                 # Demo/test pages
│   ├── search.html
│   ├── property-detail.html
│   ├── wishlist.html
│   └── filter-ids.html
├── php/                   # Backend API endpoints
│   ├── api-proxy.php      # API proxy for external requests
│   ├── ai-search.php      # AI-powered search
│   ├── analytics-*.php    # Analytics tracking
│   ├── send-inquiry.php   # Contact form handler
│   ├── wishlist-pdf.php   # PDF generation
│   └── share.php          # Social sharing
├── config/                # Configuration files
├── data/                  # Data storage
├── logs/                  # Application logs
└── index.html             # Widget test page
```

## Quick Start

### 1. Include the Widget

```html
<!-- Add configuration -->
<script>
    window.RealtySoftConfig = {
        apiKey: 'your-api-key',
        language: 'en_US'
    };
</script>

<!-- Load the widget -->
<script src="dist/realtysoft.js"></script>
<link rel="stylesheet" href="dist/style.css">
```

### 2. Add Search Components

```html
<div id="rs_search">
    <div class="rs_location"></div>
    <div class="rs_listing_type"></div>
    <div class="rs_property_type"></div>
    <div class="rs_bedrooms"></div>
    <div class="rs_bathrooms"></div>
    <div class="rs_price"></div>
    <div class="rs_search_button"></div>
</div>
```

### 3. Add Results Display

```html
<div id="rs_listing">
    <div class="rs_results_count"></div>
    <div class="rs_sort"></div>
    <div class="rs_view_toggle"></div>
    <div class="rs_property_grid"></div>
    <div class="rs_pagination"></div>
</div>
```

## Configuration Options

```javascript
window.RealtySoftConfig = {
    apiKey: 'your-api-key',      // Required: Your API key
    language: 'en_US',            // Default language
    labelOverrides: {             // Custom label overrides
        search_button: 'Find Properties',
        results_count: '{count} listings found'
    }
};
```

## Supported Languages

- `en_US` - English (US)
- `es_ES` - Spanish
- `de_DE` - German
- `fr_FR` - French

## API Reference

### Global Methods

```javascript
// Initialize the widget
window.RealtySoft.init();

// Check if widget is ready
window.RealtySoft.isReady();

// Change language
window.RealtySoft.setLanguage('es_ES');

// Get current mode
window.RealtySoft.getMode();
```

### State Management

```javascript
// Get current state
window.RealtySoftState.getState();
```

### Labels

```javascript
// Get a label
window.RealtySoftLabels.get('search_button');

// Get label with interpolation
window.RealtySoftLabels.get('results_count', { count: 42 });

// Format price
window.RealtySoftLabels.formatPrice(250000);

// Get current language
window.RealtySoftLabels.getLanguage();
```

## Requirements

- PHP 7.4+ (for backend features)
- Modern browser with ES6 support

## License

Proprietary - All rights reserved.
