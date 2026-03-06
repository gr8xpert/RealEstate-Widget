<?php
/**
 * Verify Dashboard Routing - Test all 3 endpoints
 * Tests that locations, property types, and features are read from dashboard
 * DELETE THIS FILE AFTER USE
 */

$token = 'spwrouting2026';
if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    die('Access denied. Use ?token=' . $token);
}

echo "<pre style='font-family: monospace; background: #1e1e1e; color: #0f0; padding: 20px; font-size: 12px;'>";
echo "=== Dashboard Routing Verification ===\n\n";

$domain = $_GET['domain'] ?? 'smartpropertywidget.com';
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
    . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);

$tests = [
    'Locations' => [
        'endpoint' => 'v1/location',
        'header' => 'x-locations-source',
    ],
    'Property Types' => [
        'endpoint' => 'v1/property_types',
        'header' => 'x-propertytypes-source',
    ],
    'Features' => [
        'endpoint' => 'v1/property_features',
        'header' => 'x-features-source',
    ],
];

$results = [];

foreach ($tests as $name => $config) {
    echo "=== {$name} ===\n";

    $url = $baseUrl . '/api-proxy.php?_endpoint=' . urlencode($config['endpoint']) . '&_domain=' . urlencode($domain);
    echo "URL: {$url}\n";

    // Clear any cached response by adding timestamp
    $url .= '&_t=' . time();

    $responseHeaders = [];
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'X-RS-Domain: ' . $domain,
            'Cache-Control: no-cache',
        ],
        CURLOPT_HEADERFUNCTION => function($curl, $header) use (&$responseHeaders) {
            $len = strlen($header);
            $parts = explode(':', $header, 2);
            if (count($parts) == 2) {
                $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
            }
            return $len;
        }
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    echo "HTTP Status: {$httpCode}\n";

    if ($error) {
        echo "Error: {$error}\n";
        $results[$name] = 'ERROR';
    } else {
        // Check source header
        $sourceHeader = $responseHeaders[$config['header']] ?? null;
        $cacheHeader = $responseHeaders['x-cache'] ?? null;

        echo "X-Cache: " . ($cacheHeader ?? 'not set') . "\n";
        echo ucfirst(str_replace('-', ' ', $config['header'])) . ": " . ($sourceHeader ?? 'not set') . "\n";

        if ($sourceHeader === 'dashboard') {
            echo "Status: DASHBOARD (correct)\n";
            $results[$name] = 'DASHBOARD';
        } elseif ($cacheHeader && strpos($cacheHeader, 'HIT') !== false) {
            echo "Status: CACHED (clear cache to verify source)\n";
            $results[$name] = 'CACHED';
        } else {
            echo "Status: CRM FALLBACK (dashboard may have failed)\n";
            $results[$name] = 'CRM';
        }

        // Show response summary
        $data = json_decode($response, true);
        if ($data) {
            $count = $data['count'] ?? count($data['data'] ?? []);
            echo "Items: {$count}\n";

            // Show first item
            $items = $data['data'] ?? [];
            if (!empty($items)) {
                $first = $items[0];
                echo "First: id={$first['id']}, name=\"" . ($first['name'] ?? 'N/A') . "\"\n";
            }
        }
    }
    echo "\n";
}

echo "=== Summary ===\n\n";
$allDashboard = true;
foreach ($results as $name => $status) {
    $icon = ($status === 'DASHBOARD') ? 'OK' : (($status === 'CACHED') ? '?' : 'X');
    echo "[{$icon}] {$name}: {$status}\n";
    if ($status !== 'DASHBOARD' && $status !== 'CACHED') {
        $allDashboard = false;
    }
}

echo "\n";
if ($allDashboard) {
    echo "All endpoints routing to dashboard correctly!\n";
} else {
    echo "Some endpoints not routing to dashboard.\n";
    echo "Check:\n";
    echo "1. Dashboard API is accessible (sm.smartpropertywidget.com)\n";
    echo "2. Client exists in dashboard database\n";
    echo "3. Client has API credentials configured\n";
}

echo "\n";
echo "To clear cache, delete files in: " . __DIR__ . "/cache/\n";

echo "\n<span style='color:#ff0;'>DELETE THIS FILE AFTER TESTING!</span>\n";
echo "</pre>";
