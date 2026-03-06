<?php
/**
 * Clear Proxy Cache & Test Dashboard API
 * Delete after use
 */

$token = 'spwcache2026';
if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    die('Access denied. Use ?token=' . $token);
}

echo "<pre style='font-family: monospace; background: #1e1e1e; color: #0f0; padding: 20px;'>";
echo "=== Proxy Cache Clear & Dashboard Test ===\n\n";

// Step 1: Clear all cache
echo "=== Step 1: Clear Cache ===\n";
$cacheDir = __DIR__ . '/cache/';

if (is_dir($cacheDir)) {
    $files = glob($cacheDir . '*.json');
    $count = count($files);

    foreach ($files as $file) {
        @unlink($file);
    }
    echo "Deleted {$count} cache files.\n\n";
} else {
    echo "Cache directory not found: {$cacheDir}\n";
    echo "Creating cache directory...\n";
    @mkdir($cacheDir, 0755, true);
    echo "Done.\n\n";
}

// Step 2: Check config
echo "=== Step 2: Check Config ===\n";
$dbConfigFile = __DIR__ . '/config/database.local.php';
if (!file_exists($dbConfigFile)) {
    $dbConfigFile = __DIR__ . '/config/database.php';
}

if (file_exists($dbConfigFile)) {
    echo "Config file: " . basename($dbConfigFile) . "\n";
    $dbConfig = require $dbConfigFile;
    $laravelApi = $dbConfig['laravel_api'] ?? [];

    echo "Laravel API base_url: " . ($laravelApi['base_url'] ?? '<NOT SET>') . "\n";
    echo "Laravel API internal_key: " . (!empty($laravelApi['internal_api_key']) ? '[SET]' : '<NOT SET>') . "\n\n";
} else {
    echo "ERROR: No config file found!\n";
    echo "Expected: " . __DIR__ . "/config/database.local.php\n\n";
}

// Step 3: Test dashboard endpoints
echo "=== Step 3: Test Dashboard API ===\n\n";

$domain = $_GET['domain'] ?? 'smartpropertywidget.com';
echo "Testing domain: {$domain}\n\n";

if (empty($laravelApi['base_url'])) {
    echo "ERROR: laravel_api.base_url is not configured!\n";
    echo "Add this to your config/database.local.php:\n";
    echo "    'laravel_api' => [\n";
    echo "        'base_url' => 'https://sm.smartpropertywidget.com',\n";
    echo "    ],\n\n";
} else {
    $endpoints = [
        'locations' => '/api/v1/widget/locations',
        'property-types' => '/api/v1/widget/property-types',
        'features' => '/api/v1/widget/features',
    ];

    foreach ($endpoints as $name => $path) {
        echo "--- Testing {$name} ---\n";
        $url = rtrim($laravelApi['base_url'], '/') . $path . '?domain=' . urlencode($domain);
        echo "URL: {$url}\n";

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        echo "HTTP Code: {$httpCode}\n";

        if ($error) {
            echo "cURL Error: {$error}\n";
        } elseif ($httpCode === 200) {
            $data = json_decode($response, true);
            $count = $data['count'] ?? count($data['data'] ?? []);
            echo "Count: {$count} items\n";

            if ($name === 'locations' && isset($data['has_custom_grouping'])) {
                echo "Has Custom Grouping: " . ($data['has_custom_grouping'] ? 'YES' : 'No') . "\n";

                // Find custom groups
                $findCustom = function($items) use (&$findCustom) {
                    $found = [];
                    foreach ($items as $item) {
                        if (!empty($item['is_custom'])) {
                            $found[] = $item['name'];
                        }
                        if (!empty($item['children'])) {
                            $found = array_merge($found, $findCustom($item['children']));
                        }
                    }
                    return $found;
                };

                $customGroups = $findCustom($data['data'] ?? []);
                if (!empty($customGroups)) {
                    echo "Custom Groups: " . implode(', ', $customGroups) . "\n";
                }
            }
        } else {
            echo "Error Response: " . substr($response, 0, 200) . "\n";
        }
        echo "\n";
    }
}

// Step 4: Test proxy routing
echo "=== Step 4: Test Proxy Routing ===\n\n";
$proxyUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
    . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/api-proxy.php';

$testEndpoints = [
    'v1/location' => 'locations',
    'v1/property_types' => 'property types',
    'v1/property_features' => 'features',
];

foreach ($testEndpoints as $endpoint => $name) {
    echo "--- Testing proxy for {$name} ---\n";
    $url = $proxyUrl . '?_endpoint=' . urlencode($endpoint) . '&_domain=' . urlencode($domain);
    echo "URL: {$url}\n";

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'X-RS-Domain: ' . $domain],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headers = curl_getinfo($ch);
    curl_close($ch);

    echo "HTTP Code: {$httpCode}\n";

    // Check response headers for source
    $ch2 = curl_init();
    curl_setopt_array($ch2, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_NOBODY => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'X-RS-Domain: ' . $domain],
    ]);
    $headerResponse = curl_exec($ch2);
    curl_close($ch2);

    if (strpos($headerResponse, 'X-Locations-Source: dashboard') !== false ||
        strpos($headerResponse, 'X-PropertyTypes-Source: dashboard') !== false ||
        strpos($headerResponse, 'X-Features-Source: dashboard') !== false) {
        echo "Source: DASHBOARD (correct!)\n";
    } elseif (strpos($headerResponse, 'X-Cache: HIT') !== false) {
        echo "Source: CACHE (may need clearing)\n";
    } else {
        echo "Source: Possibly CRM fallback\n";
    }

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        $count = $data['count'] ?? count($data['data'] ?? []);
        echo "Count: {$count} items\n";
    }
    echo "\n";
}

echo "=== Done ===\n";
echo "\n<span style='color: #ff0; font-weight: bold;'>DELETE THIS FILE AFTER USE!</span>\n";
echo "</pre>";
