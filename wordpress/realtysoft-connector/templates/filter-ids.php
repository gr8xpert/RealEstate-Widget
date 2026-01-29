<?php
/**
 * RealtySoft Filter IDs Reference Page
 * White-labeled version for WordPress
 */

if (!defined('ABSPATH')) exit;

$domain = preg_replace('/^www\./', '', parse_url(home_url(), PHP_URL_HOST));
$proxy_url = 'https://realtysoft.ai/propertymanager/php/api-proxy.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Filter IDs Reference - <?php echo esc_html(get_bloginfo('name')); ?></title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            background: #2c3e50;
            color: white;
            padding: 20px 30px;
            border-radius: 8px 8px 0 0;
            margin-bottom: 0;
        }

        header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }

        header p {
            opacity: 0.8;
            font-size: 14px;
        }

        .domain-badge {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 14px;
            margin-top: 10px;
            font-family: monospace;
        }

        .back-link {
            display: inline-block;
            margin-left: 15px;
            color: rgba(255,255,255,0.7);
            font-size: 12px;
            text-decoration: underline;
        }

        .back-link:hover {
            color: white;
        }

        .search-bar {
            background: white;
            padding: 15px 30px;
            border-bottom: 1px solid #e0e0e0;
        }

        .search-bar input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
        }

        .search-bar input:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }

        .loading {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .loading .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .error {
            background: #fee;
            border: 1px solid #fcc;
            color: #c00;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
        }

        .section {
            margin-bottom: 40px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
        }

        .section-header h2 {
            font-size: 18px;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-header .count {
            background: #3498db;
            color: white;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: normal;
        }

        .copy-all-btn {
            background: #27ae60;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.2s;
        }

        .copy-all-btn:hover {
            background: #219a52;
        }

        .items-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .item {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            background: #f9f9f9;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .item:hover {
            background: #f0f0f0;
        }

        .item.level-1 {
            margin-left: 25px;
            background: #fff;
            border-left: 2px solid #3498db;
        }

        .item.level-2 {
            margin-left: 50px;
            background: #fff;
            border-left: 2px solid #27ae60;
        }

        .item.level-3 {
            margin-left: 75px;
            background: #fff;
            border-left: 2px solid #e67e22;
        }

        .item.level-4 {
            margin-left: 100px;
            background: #fff;
            border-left: 2px solid #9b59b6;
        }

        .item .name {
            flex: 1;
            font-weight: 500;
        }

        .item .property-count {
            color: #888;
            font-size: 12px;
            margin-right: 15px;
        }

        .item .type-label {
            background: #95a5a6;
            color: white;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 10px;
            margin-left: 8px;
            text-transform: uppercase;
        }

        .item .id {
            background: #ecf0f1;
            padding: 4px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            margin-right: 10px;
            min-width: 80px;
            text-align: center;
        }

        .item .copy-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }

        .item .copy-btn:hover {
            background: #2980b9;
        }

        .item .copy-btn.copied {
            background: #27ae60;
        }

        .usage-section {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e0e0e0;
        }

        .usage-section h2 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }

        .usage-examples {
            display: grid;
            gap: 15px;
        }

        .usage-example {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
        }

        .usage-example h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }

        .usage-example code {
            display: block;
            background: #2c3e50;
            color: #ecf0f1;
            padding: 12px 15px;
            border-radius: 4px;
            font-size: 13px;
            overflow-x: auto;
            white-space: pre;
        }

        .no-results {
            text-align: center;
            padding: 40px;
            color: #888;
        }

        .hidden {
            display: none !important;
        }

        @media (max-width: 600px) {
            body {
                padding: 10px;
            }

            header, .search-bar, .content {
                padding: 15px;
            }

            .item {
                flex-wrap: wrap;
                gap: 10px;
            }

            .item .name {
                flex: 0 0 100%;
            }

            .item.level-1 { margin-left: 15px; }
            .item.level-2 { margin-left: 30px; }
            .item.level-3 { margin-left: 45px; }
            .item.level-4 { margin-left: 60px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Filter IDs Reference</h1>
            <p>Use these IDs to lock filters on your property search pages</p>
            <div>
                <span class="domain-badge"><?php echo esc_html($domain); ?></span>
                <a href="<?php echo esc_url(admin_url('options-general.php?page=realtysoft-settings')); ?>" class="back-link">Back to Settings</a>
            </div>
        </header>

        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Search by name or ID...">
        </div>

        <div class="content">
            <div id="loading" class="loading">
                <div class="spinner"></div>
                <p>Loading data from API...</p>
            </div>

            <div id="error" class="error hidden"></div>

            <div id="data" class="hidden">
                <!-- Locations Section -->
                <div class="section" id="locationsSection">
                    <div class="section-header">
                        <h2>Locations <span class="count" id="locationsCount">0</span></h2>
                        <button class="copy-all-btn" onclick="copyAllIds('locations')">Copy All IDs</button>
                    </div>
                    <div class="items-list" id="locationsList"></div>
                </div>

                <!-- Property Types Section -->
                <div class="section" id="propertyTypesSection">
                    <div class="section-header">
                        <h2>Property Types <span class="count" id="propertyTypesCount">0</span></h2>
                        <button class="copy-all-btn" onclick="copyAllIds('propertyTypes')">Copy All IDs</button>
                    </div>
                    <div class="items-list" id="propertyTypesList"></div>
                </div>

                <!-- Features Section -->
                <div class="section" id="featuresSection">
                    <div class="section-header">
                        <h2>Features <span class="count" id="featuresCount">0</span></h2>
                        <button class="copy-all-btn" onclick="copyAllIds('features')">Copy All IDs</button>
                    </div>
                    <div class="items-list" id="featuresList"></div>
                </div>

                <!-- Usage Examples -->
                <div class="usage-section">
                    <h2>Usage Examples</h2>
                    <div class="usage-examples">
                        <div class="usage-example">
                            <h3>Lock to a specific location</h3>
                            <code>&lt;div data-rs-component="search" data-rs-location="5"&gt;&lt;/div&gt;</code>
                        </div>
                        <div class="usage-example">
                            <h3>Lock to multiple locations</h3>
                            <code>&lt;div data-rs-component="search" data-rs-location="5,19,23"&gt;&lt;/div&gt;</code>
                        </div>
                        <div class="usage-example">
                            <h3>Lock to a property type</h3>
                            <code>&lt;div data-rs-component="search" data-rs-property-type="12"&gt;&lt;/div&gt;</code>
                        </div>
                        <div class="usage-example">
                            <h3>Lock to specific features</h3>
                            <code>&lt;div data-rs-component="search" data-rs-features="101,102,103"&gt;&lt;/div&gt;</code>
                        </div>
                        <div class="usage-example">
                            <h3>Combine multiple locks</h3>
                            <code>&lt;div data-rs-component="search" data-rs-location="5" data-rs-property-type="12" data-rs-listing-type="sale"&gt;&lt;/div&gt;</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Configuration
        const PROXY_URL = <?php echo json_encode($proxy_url); ?>;
        const DOMAIN = <?php echo json_encode($domain); ?>;

        // Data storage
        let allData = {
            locations: [],
            propertyTypes: [],
            features: []
        };

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadAllData();
        });

        async function loadAllData() {
            try {
                // Fetch all data in parallel
                const [locationsRes, typesRes, featuresRes] = await Promise.all([
                    fetchFromProxy('v1/location'),
                    fetchFromProxy('v1/property_types'),
                    fetchFromProxy('v1/property_features')
                ]);

                // Check for errors
                if (locationsRes.error) {
                    throw new Error(locationsRes.error);
                }

                allData.locations = locationsRes.data || [];
                allData.propertyTypes = typesRes.data || [];
                allData.features = featuresRes.data || [];

                // Render all sections
                renderLocations();
                renderPropertyTypes();
                renderFeatures();

                // Show data, hide loading
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('data').classList.remove('hidden');

                // Setup search
                setupSearch();

            } catch (error) {
                showError('Failed to load data: ' + error.message);
            }
        }

        async function fetchFromProxy(endpoint) {
            const url = `${PROXY_URL}?_endpoint=${endpoint}&_domain=${encodeURIComponent(DOMAIN)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RS-Domain': DOMAIN
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`API error: ${response.status} - ${text}`);
            }

            return response.json();
        }

        function renderLocations() {
            const container = document.getElementById('locationsList');
            const locations = allData.locations;

            // Create parent-child map for all locations
            const childrenMap = {};
            locations.forEach(loc => {
                const parentId = loc.parent_id;
                if (parentId && parentId !== 0) {
                    if (!childrenMap[parentId]) {
                        childrenMap[parentId] = [];
                    }
                    childrenMap[parentId].push(loc);
                }
            });

            // Get root level locations (no parent)
            const roots = locations.filter(l => !l.parent_id || l.parent_id === 0);
            roots.sort((a, b) => a.name.localeCompare(b.name));

            let html = '';
            let count = 0;

            // Recursive function to render location and its children
            function renderLocationTree(location, level) {
                const propertyCount = location.property_count !== undefined ?
                    `<span class="property-count">${location.property_count} properties</span>` : '';

                const levelClass = level > 0 ? `level-${Math.min(level, 4)}` : '';
                const typeLabel = location.type ? `<span class="type-label">${location.type}</span>` : '';

                html += `
                    <div class="item ${levelClass}" data-name="${location.name.toLowerCase()}" data-id="${location.id}">
                        <span class="name">${location.name} ${typeLabel}</span>
                        ${propertyCount}
                        <span class="id">ID: ${location.id}</span>
                        <button class="copy-btn" onclick="copyId(${location.id}, 'data-rs-location', this)">Copy</button>
                    </div>
                `;
                count++;

                // Get and render children
                const children = childrenMap[location.id] || [];
                children.sort((a, b) => a.name.localeCompare(b.name));

                children.forEach(child => {
                    renderLocationTree(child, level + 1);
                });
            }

            // Render all root locations and their descendants
            roots.forEach(root => {
                renderLocationTree(root, 0);
            });

            container.innerHTML = html || '<div class="no-results">No locations found</div>';
            document.getElementById('locationsCount').textContent = count;
        }

        function renderPropertyTypes() {
            const container = document.getElementById('propertyTypesList');
            const types = allData.propertyTypes;

            // Create parent-child map for all types
            const childrenMap = {};
            types.forEach(type => {
                const parentId = type.parent_id;
                if (parentId && parentId !== 0 && parentId !== '0') {
                    const key = String(parentId);
                    if (!childrenMap[key]) {
                        childrenMap[key] = [];
                    }
                    childrenMap[key].push(type);
                }
            });

            // Get root level types (no parent)
            const roots = types.filter(t => !t.parent_id || t.parent_id === 0 || t.parent_id === '0');
            roots.sort((a, b) => a.name.localeCompare(b.name));

            let html = '';
            let count = 0;

            // Recursive function to render type and its children
            function renderTypeTree(type, level) {
                const propertyCount = type.property_count !== undefined ?
                    `<span class="property-count">${type.property_count} properties</span>` : '';

                const levelClass = level > 0 ? `level-${Math.min(level, 4)}` : '';

                html += `
                    <div class="item ${levelClass}" data-name="${type.name.toLowerCase()}" data-id="${type.id}">
                        <span class="name">${type.name}</span>
                        ${propertyCount}
                        <span class="id">ID: ${type.id}</span>
                        <button class="copy-btn" onclick="copyId(${type.id}, 'data-rs-property-type', this)">Copy</button>
                    </div>
                `;
                count++;

                // Get and render children
                const children = childrenMap[String(type.id)] || [];
                children.sort((a, b) => a.name.localeCompare(b.name));

                children.forEach(child => {
                    renderTypeTree(child, level + 1);
                });
            }

            // Render all root types and their descendants
            roots.forEach(root => {
                renderTypeTree(root, 0);
            });

            container.innerHTML = html || '<div class="no-results">No property types found</div>';
            document.getElementById('propertyTypesCount').textContent = count;
        }

        function renderFeatures() {
            const container = document.getElementById('featuresList');
            const features = allData.features;

            // Sort alphabetically
            features.sort((a, b) => a.name.localeCompare(b.name));

            let html = '';

            features.forEach(feature => {
                const category = feature.category ?
                    `<span class="type-label">${feature.category}</span>` : '';

                html += `
                    <div class="item" data-name="${feature.name.toLowerCase()}" data-id="${feature.id}">
                        <span class="name">${feature.name} ${category}</span>
                        <span class="id">ID: ${feature.id}</span>
                        <button class="copy-btn" onclick="copyId(${feature.id}, 'data-rs-features', this)">Copy</button>
                    </div>
                `;
            });

            container.innerHTML = html || '<div class="no-results">No features found</div>';
            document.getElementById('featuresCount').textContent = features.length;
        }

        function copyId(id, dataAttr, button) {
            const text = `${dataAttr}="${id}"`;
            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 1500);
            });
        }

        function copyAllIds(type) {
            let ids = [];

            if (type === 'locations') {
                ids = allData.locations.map(l => l.id);
            } else if (type === 'propertyTypes') {
                ids = allData.propertyTypes.map(t => t.id);
            } else if (type === 'features') {
                ids = allData.features.map(f => f.id);
            }

            const json = JSON.stringify(ids);
            navigator.clipboard.writeText(json).then(() => {
                alert('All IDs copied to clipboard:\n' + json);
            });
        }

        function setupSearch() {
            const searchInput = document.getElementById('searchInput');

            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();

                document.querySelectorAll('.item').forEach(item => {
                    const name = item.dataset.name;
                    const id = item.dataset.id;

                    if (!query || name.includes(query) || id.includes(query)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });

                // Update counts
                updateVisibleCounts();
            });
        }

        function updateVisibleCounts() {
            const locationsVisible = document.querySelectorAll('#locationsList .item:not(.hidden)').length;
            const typesVisible = document.querySelectorAll('#propertyTypesList .item:not(.hidden)').length;
            const featuresVisible = document.querySelectorAll('#featuresList .item:not(.hidden)').length;

            document.getElementById('locationsCount').textContent = locationsVisible;
            document.getElementById('propertyTypesCount').textContent = typesVisible;
            document.getElementById('featuresCount').textContent = featuresVisible;
        }

        function showError(message) {
            document.getElementById('loading').classList.add('hidden');
            const errorDiv = document.getElementById('error');
            errorDiv.innerHTML = message.replace(/\n/g, '<br>');
            errorDiv.classList.remove('hidden');
        }
    </script>
</body>
</html>
