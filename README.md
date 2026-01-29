# RealtySoft Widget

A powerful, embeddable real estate property search and listing widget for websites.

## Documentation

| Document | Description |
|----------|-------------|
| [**USER_GUIDE.md**](USER_GUIDE.md) | Complete guide for deploying and customizing the widget |
| [DOCUMENTATION.md](DOCUMENTATION.md) | Full technical documentation |
| [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) | Development progress and status |

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
<script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.min.js"></script>
```

### 2. Add Search and Listings

```html
<!-- Search Form -->
<div class="rs-search-template-01"></div>

<!-- Property Listings -->
<div class="rs-listing-template-01"></div>
```

That's it! The widget automatically initializes and displays your properties.

### 3. Lock to Specific Filters (Optional)

```html
<!-- Only show villas in location 505 -->
<div class="rs-search-template-01"
     data-rs-location="505"
     data-rs-property-type="76"></div>

<div class="rs-listing-template-01"
     data-rs-location="505"
     data-rs-property-type="76"></div>
```

> **Find your filter IDs:** Visit `https://realtysoft.ai/propertymanager/pages/filter-ids.html?domain=yourdomain.com`

**For complete customization options, see the [User Guide](USER_GUIDE.md).**

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

- `en_US` - English
- `es_ES` - Spanish
- `de_DE` - German
- `fr_FR` - French
- `it_IT` - Italian
- `pt_PT` - Portuguese
- `nl_NL` - Dutch
- `ru_RU` - Russian
- `sv_SE` - Swedish
- `no_NO` - Norwegian
- `da_DK` - Danish
- `fi_FI` - Finnish
- `pl_PL` - Polish

Language is auto-detected from browser settings or `<html lang="...">` attribute.

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

## Learn More

- **[User Guide](USER_GUIDE.md)** - Complete deployment and customization guide
- **[Filter IDs Reference](https://realtysoft.ai/propertymanager/pages/filter-ids.html)** - Find your location, property type, and feature IDs

## License

Proprietary - All rights reserved.
