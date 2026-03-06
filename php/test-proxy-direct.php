<?php
/**
 * Direct test of proxy routing
 */

$token = 'spwtest2026';
if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    die('Access denied. Use ?token=' . $token);
}

echo "<pre style='font-family: monospace; background: #1e1e1e; color: #0f0; padding: 20px;'>";
echo "=== Direct Proxy Test ===\n\n";

$domain = $_GET['domain'] ?? 'smartpropertywidget.com';
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
    . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);

$tests = [
    'v1/location' => 'X-Locations-Source',
    'v1/property_types' => 'X-PropertyTypes-Source',
    'v1/property_features' => 'X-Features-Source',
];

foreach ($tests as $endpoint => $expectedHeader) {
    echo "=== Testing {$endpoint} ===\n";

    $url = $baseUrl . '/api-proxy.php?_endpoint=' . urlencode($endpoint) . '&_domain=' . urlencode($domain);
    echo "URL: {$url}\n";

    // Capture both headers and body
    $responseHeaders = [];
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'X-RS-Domain: ' . $domain,
        ],
        CURLOPT_HEADERFUNCTION => function($curl, $header) use (&$responseHeaders) {
            $len = strlen($header);
            $header = explode(':', $header, 2);
            if (count($header) < 2) return $len;
            $responseHeaders[strtolower(trim($header[0]))] = trim($header[1]);
            return $len;
        }
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    echo "HTTP Code: {$httpCode}\n";

    if ($error) {
        echo "Error: {$error}\n";
    } else {
        // Check for source header
        $sourceHeader = strtolower($expectedHeader);
        $source = $responseHeaders[$sourceHeader] ?? null;
        $cacheHeader = $responseHeaders['x-cache'] ?? null;

        echo "X-Cache: " . ($cacheHeader ?? 'not set') . "\n";
        echo "{$expectedHeader}: " . ($source ?? 'not set') . "\n";

        if ($source === 'dashboard') {
            echo "Status: ✓ ROUTING TO DASHBOARD\n";
        } elseif ($cacheHeader && strpos($cacheHeader, 'HIT') !== false) {
            echo "Status: Cached response (clear cache and retry)\n";
        } else {
            echo "Status: ✗ NOT routing to dashboard (falling back to CRM)\n";
        }

        // Show response snippet
        $data = json_decode($response, true);
        if ($data) {
            $count = $data['count'] ?? count($data['data'] ?? []);
            echo "Items: {$count}\n";

            if ($endpoint === 'v1/location' && isset($data['has_custom_grouping'])) {
                echo "Has Custom Grouping: " . ($data['has_custom_grouping'] ? 'YES' : 'No') . "\n";
            }
        }
    }
    echo "\n";
}

// Show all response headers from last request for debugging
echo "=== Last Request Headers ===\n";
foreach ($responseHeaders as $name => $value) {
    echo "{$name}: {$value}\n";
}

echo "\n<span style='color:#ff0;'>DELETE THIS FILE AFTER USE!</span>\n";
echo "</pre>";
