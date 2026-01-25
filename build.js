/**
 * RealtySoft Widget v2 - Build Script
 * Simple concatenation script for bundling JS and CSS
 *
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const baseDir = __dirname;
const config = {
    srcDir: path.join(baseDir, 'src'),
    distDir: path.join(baseDir, 'dist'),

    // JavaScript files in order of dependencies
    jsFiles: [
        // Core modules (order matters!)
        'core/state.js',
        'core/api.js',
        'core/labels.js',
        'core/analytics.js',
        'core/toast.js',
        'core/wishlist-manager.js',
        'core/controller.js',

        // Base component
        'components/base.js',

        // Search components
        'components/search/location.js',
        'components/search/listing-type.js',
        'components/search/property-type.js',
        'components/search/bedrooms.js',
        'components/search/bathrooms.js',
        'components/search/price.js',
        'components/search/built-area.js',
        'components/search/plot-size.js',
        'components/search/features.js',
        'components/search/reference.js',
        'components/search/search-button.js',
        'components/search/reset-button.js',

        // Listing components
        'components/listing/property-grid.js',
        'components/listing/property-carousel.js',
        'components/listing/pagination.js',
        'components/listing/sort.js',
        'components/listing/results-count.js',
        'components/listing/active-filters.js',
        'components/listing/view-toggle.js',

        // Detail components
        'components/detail/detail.js',
        'components/detail/gallery.js',
        'components/detail/features.js',
        'components/detail/map.js',
        'components/detail/inquiry-form.js',
        'components/detail/wishlist.js',
        'components/detail/share.js',
        'components/detail/related.js',
        'components/detail/info-table.js',
        'components/detail/specs.js',
        'components/detail/sizes.js',
        'components/detail/taxes.js',
        'components/detail/energy.js',
        'components/detail/resources.js',
        'components/detail/pdf-button.js',
        'components/detail/back-button.js',
        'components/detail/property-detail-template.js',

        // Utility components
        'components/utility/wishlist-button.js',
        'components/utility/wishlist-counter.js',
        // Modular wishlist sub-components (must come before wishlist-list.js)
        'components/utility/wishlist-header.js',
        'components/utility/wishlist-empty.js',
        'components/utility/wishlist-shared-banner.js',
        'components/utility/wishlist-sort.js',
        'components/utility/wishlist-actions.js',
        'components/utility/wishlist-compare-btn.js',
        'components/utility/wishlist-grid.js',
        'components/utility/wishlist-modals.js',
        // Combined wishlist component (uses sub-components)
        'components/utility/wishlist-list.js',
        'components/utility/language-selector.js',
        'components/utility/share-buttons.js'
    ],

    // CSS files
    cssFiles: [
        'styles/realtysoft.css'
    ]
};

// Ensure dist directory exists
if (!fs.existsSync(config.distDir)) {
    fs.mkdirSync(config.distDir, { recursive: true });
}

// Build JavaScript
console.log('Building JavaScript...');
let jsContent = `/**
 * RealtySoft Widget v2
 * Built: ${new Date().toISOString()}
 * https://realtysoft.com
 */
(function() {
'use strict';

`;

for (const file of config.jsFiles) {
    const filePath = path.join(config.srcDir, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        jsContent += `// ============ ${file} ============\n`;
        jsContent += content + '\n\n';
        console.log(`  Added: ${file}`);
    } else {
        console.warn(`  Warning: ${file} not found`);
    }
}

jsContent += `
})();
`;

// Write unminified JS
fs.writeFileSync(path.join(config.distDir, 'realtysoft.js'), jsContent);
console.log(`Created: ${config.distDir}/realtysoft.js`);

// Simple minification (remove comments and extra whitespace)
let minifiedJs = jsContent
    // Remove single-line comments (but not URLs)
    .replace(/(?<!:)\/\/[^\n]*/g, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace (but preserve single spaces)
    .replace(/\s+/g, ' ')
    // Remove spaces around operators (but preserve spaces in template literals)
    // Don't remove space after } if followed by $ (template literal continuation)
    // Don't remove space before { if preceded by $ (template literal start)
    .replace(/\s*([()[\];,:])\s*/g, '$1')
    .replace(/\{\s+/g, '{')
    .replace(/\s+\}/g, '}')
    // Restore necessary spaces
    .replace(/function\(/g, 'function (')
    .replace(/if\(/g, 'if (')
    .replace(/for\(/g, 'for (')
    .replace(/while\(/g, 'while (')
    .replace(/switch\(/g, 'switch (')
    .replace(/catch\(/g, 'catch (')
    .replace(/return\{/g, 'return {')
    .replace(/else\{/g, 'else {')
    .replace(/\}\s*else/g, '} else')
    .trim();

fs.writeFileSync(path.join(config.distDir, 'realtysoft.min.js'), minifiedJs);
console.log(`Created: ${config.distDir}/realtysoft.min.js`);

// Build CSS
console.log('\nBuilding CSS...');
let cssContent = `/**
 * RealtySoft Widget v2 - Styles
 * Built: ${new Date().toISOString()}
 */
`;

for (const file of config.cssFiles) {
    const filePath = path.join(config.srcDir, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        cssContent += content + '\n';
        console.log(`  Added: ${file}`);
    } else {
        console.warn(`  Warning: ${file} not found`);
    }
}

// Write unminified CSS
fs.writeFileSync(path.join(config.distDir, 'realtysoft.css'), cssContent);
console.log(`Created: ${config.distDir}/realtysoft.css`);

// Simple CSS minification
let minifiedCss = cssContent
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around special chars
    .replace(/\s*([{}:;,])\s*/g, '$1')
    // Remove last semicolon before }
    .replace(/;}/g, '}')
    .trim();

fs.writeFileSync(path.join(config.distDir, 'realtysoft.min.css'), minifiedCss);
console.log(`Created: ${config.distDir}/realtysoft.min.css`);

// Calculate sizes
const jsSize = Buffer.byteLength(jsContent, 'utf8');
const jsMinSize = Buffer.byteLength(minifiedJs, 'utf8');
const cssSize = Buffer.byteLength(cssContent, 'utf8');
const cssMinSize = Buffer.byteLength(minifiedCss, 'utf8');

console.log('\n=== Build Complete ===');
console.log(`JavaScript: ${(jsSize / 1024).toFixed(2)}KB -> ${(jsMinSize / 1024).toFixed(2)}KB (${Math.round((1 - jsMinSize/jsSize) * 100)}% reduction)`);
console.log(`CSS: ${(cssSize / 1024).toFixed(2)}KB -> ${(cssMinSize / 1024).toFixed(2)}KB (${Math.round((1 - cssMinSize/cssSize) * 100)}% reduction)`);
console.log(`Total: ${((jsMinSize + cssMinSize) / 1024).toFixed(2)}KB minified`);
