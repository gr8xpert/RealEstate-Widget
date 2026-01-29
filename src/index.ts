/**
 * RealtySoft Widget v3.0.0
 * Main entry point for Vite IIFE build (monolithic)
 *
 * This file imports all modules and sets up global variables
 * for backwards compatibility with existing integrations.
 */

// Import styles
import './styles/realtysoft.css';

// Import core modules (order matters - dependencies first)
// Named imports ensure Rollup keeps these variables in the IIFE scope,
// so components can reference them via `declare const` (global-like access).
import { RealtySoftState } from './core/state';
import { RealtySoftAPI } from './core/api';
import { RealtySoftLabels } from './core/labels';
import { RealtySoftAnalytics } from './core/analytics';
import { RealtySoftToast } from './core/toast';
import { WishlistManager } from './core/wishlist-manager';

// Import controller (main coordination module)
import { RealtySoft } from './core/controller';

// Import SPA router
import { RealtySoftRouter } from './core/router';

// Import base component
import { RSBaseComponent } from './components/base';

// Import all component groups via barrel files (eager, monolithic)
import './components/search/index';
import './components/listing/index';
import './components/detail/index';
import './components/utility/index';

// Prevent tree-shaking of modules referenced by components via `declare const`.
// Without these references, Rollup may remove modules not directly used here.
void RealtySoftState;
void RealtySoftAPI;
void RealtySoftLabels;
void RealtySoftAnalytics;
void RealtySoftToast;
void WishlistManager;
void RealtySoftRouter;
void RSBaseComponent;

// Default export only — prevents the IIFE wrapper from overriding
// window.RealtySoft (which the controller sets to the correct object).
// Named exports would cause Rollup to create an exports object as the
// IIFE return value, overwriting window.RealtySoft with { RealtySoft, ... }.
// Sub-modules are accessible via RealtySoft.State, RealtySoft.API, etc.
export default RealtySoft;

// Version info
console.log('[RealtySoft] Widget v3.0.0 loaded (Vite build)');
