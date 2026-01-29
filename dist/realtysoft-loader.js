/**
 * RealtySoft Widget Loader v3.0
 *
 * Auto-versioning: Uses timestamp-based cache busting.
 * Deploy this loader once — clients get all updates automatically.
 *
 * Cache buster interval: 1 minute (for development).
 * Change CACHE_INTERVAL to increase for production:
 *   60000       = 1 minute  (development)
 *   3600000     = 1 hour    (staging)
 *   86400000    = 1 day     (production)
 *
 * Usage:
 * <script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.js"></script>
 *
 * With config (place BEFORE loader script):
 * <script>
 * window.RealtySoftConfig = {
 *     language: 'en_US',
 *     apiKey: 'your-api-key',
 *     ownerEmail: 'agent@example.com',
 *     resultsPage: '/properties',
 *     propertyPageSlug: 'property'
 * };
 * </script>
 * <script src="https://realtysoft.ai/propertymanager/dist/realtysoft-loader.js"></script>
 */
(function() {
    'use strict';

    // ── Configuration ──────────────────────────────────────────────
    // Cache buster interval in milliseconds
    var CACHE_INTERVAL = 60000; // 1 minute (development)

    // File names (relative to base URL)
    var CSS_FILE = '/style.css';
    var JS_FILE  = '/realtysoft.js';

    // ── Prevent double loading ─────────────────────────────────────
    if (window._realtySoftWidgetLoaded) {
        console.warn('[RealtySoft] Widget already loaded, skipping.');
        return;
    }
    window._realtySoftWidgetLoaded = true;

    // ── Auto-detect base URL from this script's src ────────────────
    var BASE_URL = '';
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || '';
        if (src.indexOf('realtysoft-loader') !== -1) {
            // Strip the filename to get the directory
            BASE_URL = src.substring(0, src.lastIndexOf('/'));
            break;
        }
    }

    if (!BASE_URL) {
        console.error('[RealtySoft] Could not detect loader base URL.');
        return;
    }

    // ── Cache buster ───────────────────────────────────────────────
    var version = Math.floor(Date.now() / CACHE_INTERVAL);

    // ── Load CSS ───────────────────────────────────────────────────
    function loadCSS() {
        var link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = BASE_URL + CSS_FILE + '?v=' + version;
        link.onerror = function() {
            console.error('[RealtySoft] Failed to load CSS:', link.href);
        };
        document.head.appendChild(link);
    }

    // ── Load JavaScript ────────────────────────────────────────────
    function loadJS() {
        var script  = document.createElement('script');
        script.src  = BASE_URL + JS_FILE + '?v=' + version;
        script.async = true;

        script.onload = function() {
            console.log('[RealtySoft] Widget v3.0 loaded (cache key: ' + version + ')');
            document.dispatchEvent(new CustomEvent('realtysoft:loader-complete'));
        };

        script.onerror = function() {
            console.error('[RealtySoft] Failed to load JS:', script.src);
        };

        document.head.appendChild(script);
    }

    // ── Execute ────────────────────────────────────────────────────
    loadCSS();
    loadJS();

})();
