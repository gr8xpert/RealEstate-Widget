# Property Detail Page Fixes - January 28, 2026

## Issue 1: Race Condition - Wrong Property Displayed (R5120467)

### Problem
Property detail page intermittently showed the wrong property (R5120467) instead of the property from the URL. Users would see a brief flash of the correct property, then it would be replaced by a stale/wrong property.

### Root Cause
The **PHP prefetch mechanism** was serving stale data without proper validation:

1. PHP injects prefetch data (`window.__rsPrefetch`) to speed up initial load
2. The prefetch contained data for a previously viewed property (R5120467)
3. The validation check `prefetch.ref === idOrRef` was:
   - Case-sensitive (could fail on case mismatch)
   - Only checked the ref flag, not the actual property data inside
4. Stale prefetch data was used even when the URL requested a different property

### Solution
Implemented **three layers of protection**:

#### Layer 1: Component-Level Prefetch Clearing
**Files:** `src/components/detail/property-detail-template.ts`, `src/components/detail/detail.ts`

```typescript
private clearStalePrefetch(): void {
  const prefetch = (window as any).__rsPrefetch;
  if (!prefetch) return;

  const urlRef = this.getPropertyRefFromUrl();
  const prefetchRef = prefetch.ref;

  if (urlRef) {
    if (!prefetchRef || urlRef.toLowerCase() !== prefetchRef.toLowerCase()) {
      console.log('[RealtySoft] Clearing stale prefetch - URL ref:', urlRef, 'prefetch ref:', prefetchRef);
      delete (window as any).__rsPrefetch;
    }
  } else {
    // Can't determine URL ref - clear prefetch to be safe
    console.log('[RealtySoft] Clearing prefetch - could not determine URL ref');
    delete (window as any).__rsPrefetch;
  }
}
```

#### Layer 2: API-Level Data Validation
**File:** `src/core/api.ts` (function `fetchAndCacheProperty`)

- Case-insensitive ref comparison
- Double-checks actual property data inside prefetch matches requested ref
- Clears stale prefetch entirely on mismatch
- Falls back to fresh API call when validation fails

```typescript
// Double-check: validate the actual property data matches what we asked for
const actualRef = (propData?.ref || propData?.ref_no || propData?.reference || '').toLowerCase();
if (actualRef === requestedRef) {
  // Use prefetch
} else {
  console.warn('[RealtySoft] Prefetch data mismatch - expected:', requestedRef, 'got:', actualRef);
  delete (window as any).__rsPrefetch;
  // Fetch from API instead
}
```

#### Layer 3: Component Callback Validation
**Files:** `src/components/detail/property-detail-template.ts`, `src/components/detail/detail.ts`

```typescript
this.loadProperty().then(property => {
  if (property) {
    // Validate the property matches what we asked for
    if (this.propertyRef && property.ref?.toLowerCase() !== this.propertyRef.toLowerCase()) {
      console.warn('[RealtySoft] Property ref mismatch - expected:', this.propertyRef, 'got:', property.ref);
      return;
    }
    this.property = property;
    this.render();
  }
});
```

### Files Modified
| File | Changes |
|------|---------|
| `src/components/detail/property-detail-template.ts` | Aggressive prefetch clearing, direct API usage, response validation |
| `src/components/detail/detail.ts` | Same pattern as above |
| `src/core/api.ts` | Case-insensitive comparison, actual data validation, stale prefetch cleanup |

### Console Indicators
When the protection triggers, you'll see:
- `[RealtySoft] Clearing stale prefetch - URL ref: xxx prefetch ref: yyy`
- `[RealtySoft] Prefetch data mismatch - expected: xxx got: yyy - fetching from API`

---

## Issue 2: Map Showing Wrong Location

### Problem
The map component was showing a different/larger area than the location displayed below the property price. For example, if "Nueva Andalucía" was shown below the price, the map might show the entire "Málaga" province instead.

### Root Cause
The `buildNominatimQuery()` function prioritized **province** over **location name**:

```typescript
// OLD CODE - prioritized province
if (this.province) {
  parts.push(this.province);
} else if (this.municipality) {
  parts.push(this.municipality);
} else if (this.locationName) {
  parts.push(this.locationName);
}
```

### Solution
Changed query building to prioritize **location name** (what's displayed below the price):

**File:** `src/components/detail/map.ts`

```typescript
// NEW CODE - prioritizes location name
if (this.locationName) {
  // Use location name first (e.g., "Nueva Andalucía")
  parts.push(this.locationName);
  if (this.province) parts.push(this.province);
} else if (this.municipality) {
  parts.push(this.municipality);
  if (this.province) parts.push(this.province);
} else if (this.province) {
  parts.push(this.province);
}
parts.push(this.country);
```

### Result
- Map now searches for "Nueva Andalucía, Málaga, Spain" instead of just "Málaga, Spain"
- Boundary polygon matches the location shown in property details
- Blue border with light fill highlights the area

### Files Modified
| File | Changes |
|------|---------|
| `src/components/detail/map.ts` | Reordered query priority in `buildNominatimQuery()` |

---

## Testing Checklist

### Property Detail Race Condition
- [ ] Navigate between different properties rapidly
- [ ] Use browser back/forward buttons
- [ ] Open property links in new tabs
- [ ] Refresh the page on a property detail page
- [ ] Verify correct property displays (check ref below price matches URL)

### Map Location
- [ ] Verify map shows same location name as displayed below price
- [ ] Boundary polygon visible with blue border
- [ ] Map zooms to fit the location area

---

## Build Command
```bash
npm run build
```
