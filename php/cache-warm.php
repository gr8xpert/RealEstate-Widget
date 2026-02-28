<?php
/**
 * Cache Warming Script - Standalone
 * Run this to pre-populate the server cache with location, types, and features data
 *
 * Usage:
 *   - Via browser: https://your-domain.com/spw/php/cache-warm.php?domain=client-domain.com
 *   - Via CLI: php cache-warm.php client-domain.com
 */

// ============================================
// STANDALONE CACHE CLASS (copy from api-proxy.php)
// ============================================
class ProxyCache {
    private static $cacheDir = __DIR__ . '/cache/';

    // Cache TTL in seconds - MUST match api-proxy.php
    public static $ttl = [
        'v1/location' => 900,           // 15 min (reduced for fresh property_count)
        'v2/location' => 900,           // 15 min (reduced for fresh property_count)
        'v1/property_types' => 900,     // 15 min (reduced for fresh property_count)
        'v1/property_features' => 3600, // 1 hour
        'v1/plugin_labels' => 86400,    // 24 hours (rarely changes)
    ];

    public static function init() {
        if (!is_dir(self::$cacheDir)) {
            @mkdir(self::$cacheDir, 0755, true);
        }
    }

    public static function getCacheKey($endpoint, $params) {
        $key = $endpoint . '_' . md5(serialize($params));
        return preg_replace('/[^a-zA-Z0-9_]/', '_', $key);
    }

    public static function getWithMeta($key) {
        $file = self::$cacheDir . $key . '.json';
        if (!file_exists($file)) return ['data' => null, 'stale' => false, 'hash' => null];

        $content = @file_get_contents($file);
        if (!$content) return ['data' => null, 'stale' => false, 'hash' => null];

        $data = json_decode($content, true);
        if (!$data || !isset($data['expires'])) {
            return ['data' => null, 'stale' => false, 'hash' => null];
        }

        return [
            'data' => $data['response'],
            'stale' => time() > $data['expires'],
            'hash' => $data['hash'] ?? null
        ];
    }

    public static function set($key, $response, $ttl) {
        self::init();
        $file = self::$cacheDir . $key . '.json';
        $hash = md5($response);
        $data = [
            'expires' => time() + $ttl,
            'created' => date('Y-m-d H:i:s'),
            'hash' => $hash,
            'response' => $response
        ];
        $success = @file_put_contents($file, json_encode($data), LOCK_EX);
        return $success ? $hash : false;
    }

    public static function clear() {
        $files = glob(self::$cacheDir . '*.json');
        foreach ($files as $file) {
            @unlink($file);
        }
        return count($files);
    }

    public static function list() {
        self::init();
        $files = glob(self::$cacheDir . '*.json');
        $entries = [];
        foreach ($files as $file) {
            $content = @file_get_contents($file);
            if ($content) {
                $data = json_decode($content, true);
                $entries[] = [
                    'file' => basename($file),
                    'created' => $data['created'] ?? 'unknown',
                    'expires' => date('Y-m-d H:i:s', $data['expires'] ?? 0),
                    'expired' => time() > ($data['expires'] ?? 0),
                    'size' => round(strlen($content) / 1024, 1) . 'KB'
                ];
            }
        }
        return $entries;
    }
}

ProxyCache::init();

// ============================================
// HANDLE REQUEST
// ============================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$action = $_GET['action'] ?? 'warm';
$domain = $_GET['domain'] ?? ($argv[1] ?? null);

// List cache entries
if ($action === 'list') {
    $entries = ProxyCache::list();
    echo json_encode(['success' => true, 'cache_entries' => $entries], JSON_PRETTY_PRINT);
    exit;
}

// Clear cache
if ($action === 'clear') {
    $count = ProxyCache::clear();
    echo json_encode(['success' => true, 'cleared' => $count . ' files']);
    exit;
}

// Warm cache - requires domain
if (!$domain) {
    echo json_encode([
        'error' => 'Domain parameter required',
        'usage' => [
            'warm' => '?domain=your-domain.com',
            'list' => '?action=list',
            'clear' => '?action=clear'
        ]
    ], JSON_PRETTY_PRINT);
    exit;
}

// Load config to get API credentials
$configFile = __DIR__ . '/../config/clients.php';
if (!file_exists($configFile)) {
    // Try alternate location
    $configFile = __DIR__ . '/config/clients.php';
}

if (!file_exists($configFile)) {
    echo json_encode(['error' => 'Config file not found', 'tried' => [__DIR__ . '/../config/clients.php', __DIR__ . '/config/clients.php']]);
    exit;
}

$clients = require $configFile;
$domain = preg_replace('/^www\./', '', $domain);

$clientConfig = null;
foreach ($clients as $clientDomain => $config) {
    $clientDomain = preg_replace('/^www\./', '', $clientDomain);
    if ($clientDomain === $domain) {
        $clientConfig = $config;
        break;
    }
}

// Also check localhost
if (!$clientConfig && ($domain === 'localhost' || $domain === 'smartpropertywidget.com')) {
    // Use first available config as fallback for testing
    $clientConfig = reset($clients);
}

if (!$clientConfig) {
    echo json_encode([
        'error' => 'Domain not found in config',
        'domain' => $domain,
        'available_domains' => array_keys($clients)
    ], JSON_PRETTY_PRINT);
    exit;
}

$results = [];

// Endpoints to warm
// IMPORTANT: Use STRING values to match $_GET params (which are always strings)
// This ensures cache keys match between cache-warm.php and api-proxy.php
$endpoints = [
    ['endpoint' => 'v2/location', 'params' => ['page' => '1', 'limit' => '1000']],
    ['endpoint' => 'v1/location', 'params' => ['page' => '1', 'limit' => '1000']],
    ['endpoint' => 'v1/property_types', 'params' => []],
    ['endpoint' => 'v1/property_features', 'params' => []],
    ['endpoint' => 'v1/plugin_labels', 'params' => ['_lang' => 'en_US']],
    ['endpoint' => 'v1/plugin_labels', 'params' => ['_lang' => 'es_ES']],
];

echo "<pre>\n";
echo "=== Cache Warming for: $domain ===\n";
echo "API URL: " . $clientConfig['api_url'] . "\n\n";

foreach ($endpoints as $item) {
    $endpoint = $item['endpoint'];
    $params = $item['params'];

    // Build cache key
    $cacheKey = ProxyCache::getCacheKey($endpoint, $params);

    // Check if already cached and fresh
    $existing = ProxyCache::getWithMeta($cacheKey);
    if ($existing['data'] !== null && !$existing['stale']) {
        $results[] = ['endpoint' => $endpoint, 'status' => 'already_cached', 'params' => $params];
        echo "[$endpoint] Already cached (fresh)\n";
        continue;
    }

    // Build API URL
    $apiUrl = rtrim($clientConfig['api_url'], '/') . '/' . $endpoint;
    $apiParams = $params;

    // Map _lang to ln for API
    if (isset($apiParams['_lang'])) {
        $apiParams['ln'] = $apiParams['_lang'];
        unset($apiParams['_lang']);
    }

    if (!empty($apiParams)) {
        $apiUrl .= '?' . http_build_query($apiParams);
    }

    echo "[$endpoint] Fetching from: $apiUrl\n";

    // Fetch from API
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_HTTPHEADER => [
            'access_token: ' . $clientConfig['api_key'],
            'Accept: application/json',
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error || $httpCode !== 200) {
        $results[] = ['endpoint' => $endpoint, 'status' => 'error', 'http_code' => $httpCode, 'error' => $error];
        echo "[$endpoint] ERROR: HTTP $httpCode - $error\n";

        // If we have stale data, keep using it
        if ($existing['data'] !== null) {
            echo "[$endpoint] Keeping stale cache as fallback\n";
        }
        continue;
    }

    // Cache the response using endpoint-specific TTL
    $ttl = ProxyCache::$ttl[$endpoint] ?? 900; // Default 15 min if not found
    $hash = ProxyCache::set($cacheKey, $response, $ttl);

    if ($hash === false) {
        echo "[$endpoint] ERROR: Failed to write cache (check permissions on /cache/ directory)\n";
        $results[] = ['endpoint' => $endpoint, 'status' => 'write_error'];
        continue;
    }

    // Get response size
    $size = strlen($response);
    $sizeKB = round($size / 1024, 1);

    $results[] = ['endpoint' => $endpoint, 'status' => 'cached', 'size' => $sizeKB . 'KB', 'params' => $params];
    echo "[$endpoint] CACHED ($sizeKB KB)\n";
}

echo "\n=== Complete ===\n";
echo "</pre>\n";

echo json_encode(['success' => true, 'results' => $results], JSON_PRETTY_PRINT);
