# RealtySoft Widget v3 - Frontend Widget

## Project Overview
Property search widget that embeds on client websites. Fetches data from CRM APIs via proxy, displays property listings with search filters.

## Tech Stack
- **Language**: TypeScript
- **Build**: Vite
- **Styling**: CSS (custom)
- **Testing**: Vitest

## Build Commands
```bash
npm run build      # Production build to dist/
npm run dev        # Development server
npm test           # Run tests
```

## Output Files
After build, deploy from `dist/`:
- `realtysoft.js` - UMD bundle
- `realtysoft.es.js` - ES module bundle
- `style.css` - Styles
- `realtysoft-loader.js` - Loader script

## Project Structure

```
src/
├── core/
│   ├── api.ts           # API calls, caching, proxy handling
│   ├── controller.ts    # Main widget controller
│   ├── labels.ts        # Multi-language labels
│   ├── state.ts         # State management
│   └── router.ts        # SPA routing
├── components/
│   ├── search/
│   │   ├── location.ts      # Location dropdown/multiselect
│   │   ├── property-type.ts # Property type selector
│   │   └── features.ts      # Features/amenities selector
│   └── ...
└── styles/
```

## Important Files

### Search Components
- `src/components/search/location.ts` - Location filter (variations 1-4)
- `src/components/search/property-type.ts` - Property type filter
- `src/components/search/features.ts` - Features/amenities filter

### Core
- `src/core/api.ts` - All API calls go through proxy
- `src/core/controller.ts` - Main widget initialization

## API Proxy

Widget calls: `smartpropertywidget.com/spw/php/api-proxy.php`

Proxy routes requests to:
- Dashboard API for locations, property types, features (with preferences)
- CRM API for property searches, details

### Endpoints
```
_endpoint=v1/location        → Dashboard /api/v1/widget/locations
_endpoint=v1/property_types  → Dashboard /api/v1/widget/property-types
_endpoint=v1/property_features → Dashboard /api/v1/widget/features
_endpoint=v1/property        → CRM API (direct)
```

## PHP Proxy Files

Located in `php/`:
- `api-proxy.php` - Main proxy, routes to dashboard/CRM
- `clear-proxy-cache.php` - Clear server-side cache
- `subscription/` - License validation

### Proxy Cache
- Server-side JSON cache in `php/cache/`
- TTL: 15 min for locations/types, 30 min for features
- Clear with: `clear-proxy-cache.php?token=spwcache2026`

## WordPress Integration

Widget can be installed via:
1. Direct script embed
2. WordPress plugin (separate repo)

## Recent Changes (March 2026)

### Removed Alphabetical Sorting
Previously, dropdowns sorted items alphabetically, overriding dashboard preferences.

**Fixed files:**
- `src/components/search/property-type.ts` - Lines 152, 159
- `src/components/search/location.ts` - Lines 254, 279, 310, 322, 569, 596
- `src/components/search/features.ts` - Lines 116-120

**Change:** Removed `.sort((a, b) => a.name.localeCompare(b.name))` calls.
Now preserves API order which reflects dashboard sort preferences.

## Configuration

Widget initialized with `RealtySoftConfig`:
```javascript
window.RealtySoftConfig = {
  container: '#realtysoft-widget',
  language: 'en_US',
  listingTypes: ['resale', 'development'],
  // ... more options
};
```

## Caching Strategy

### Browser (api.ts)
- LRU memory cache
- localStorage fallback
- Stale-while-revalidate pattern

### Server (api-proxy.php)
- JSON file cache
- Per-domain cache keys for preferences
- Stale grace period for fallback

## Notes

- API returns `parent_id: false` for root items (boolean, not null)
- Widget preserves API order for all dropdowns
- Dashboard handles all sorting via display preferences
- After any code changes, rebuild and deploy dist/ files
