<?php
/**
 * RealtySoft Widget v2 - API Proxy
 * Securely proxies requests to the CRM API
 * WITH SERVER-SIDE CACHING for static data
 */

// ============================================
// CACHE MANAGER - Add this at the top
// ============================================
class ProxyCache {
    private static $cacheDir = __DIR__ . '/cache/';

    // Cache TTL in seconds for each endpoint type
    private static $ttl = [
        'v1/location' => 86400,         // 24 hours
        'v2/location' => 86400,         // 24 hours
        'v1/property_types' => 86400,   // 24 hours
        'v1/property_features' => 86400, // 24 hours
        'v1/plugin_labels' => 86400,    // 24 hours
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

    public static function shouldCache($endpoint) {
        foreach (self::$ttl as $pattern => $seconds) {
            if (strpos($endpoint, $pattern) !== false) {
                return $seconds;
            }
        }
        return false;
    }

    public static function get($key) {
        $file = self::$cacheDir . $key . '.json';
        if (!file_exists($file)) return null;

        $content = @file_get_contents($file);
        if (!$content) return null;

        $data = json_decode($content, true);
        if (!$data || !isset($data['expires']) || time() > $data['expires']) {
            @unlink($file);
            return null;
        }
        return $data['response'];
    }

    public static function set($key, $response, $ttl) {
        $file = self::$cacheDir . $key . '.json';
        $data = [
            'expires' => time() + $ttl,
            'created' => date('Y-m-d H:i:s'),
            'response' => $response
        ];
        @file_put_contents($file, json_encode($data), LOCK_EX);
    }

    public static function clear() {
        $files = glob(self::$cacheDir . '*.json');
        foreach ($files as $file) {
            @unlink($file);
        }
    }
}

ProxyCache::init();

// ============================================
// ORIGINAL PROXY CODE (with cache integration)
// ============================================

// Enable error reporting for debugging (disable in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-RS-Domain');
header('Access-Control-Max-Age: 86400');  // Cache preflight for 24 hours

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration file not found']);
    exit;
}

$clients = require $configFile;

// Get requesting domain
// Priority: 1. _domain parameter (for admin tools) 2. X-RS-Domain header 3. Origin/Referer
$domain = null;

// Check for explicit domain parameter (used by filter-ids admin page)
if (!empty($_GET['_domain'])) {
    $domain = $_GET['_domain'];
} elseif (!empty($_SERVER['HTTP_X_RS_DOMAIN'])) {
    $domain = $_SERVER['HTTP_X_RS_DOMAIN'];
} else {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
    $domain = parse_url($origin, PHP_URL_HOST) ?? 'localhost';
}

// Remove www. prefix for matching
$domain = preg_replace('/^www\./', '', $domain);

// Find client config - exact match first
$clientConfig = null;
foreach ($clients as $clientDomain => $config) {
    $clientDomain = preg_replace('/^www\./', '', $clientDomain);
    if ($clientDomain === $domain) {
        $clientConfig = $config;
        break;
    }
}

// Fallback to localhost config for local development
if (!$clientConfig && $domain === 'localhost' && isset($clients['localhost'])) {
    $clientConfig = $clients['localhost'];
}

// Validate client
if (!$clientConfig || !$clientConfig['enabled']) {
    http_response_code(403);
    echo json_encode(['error' => 'Domain not authorized']);
    exit;
}

// Get endpoint from request
$endpoint = $_GET['_endpoint'] ?? $_POST['_endpoint'] ?? '';
$language = $_GET['_lang'] ?? $_POST['_lang'] ?? 'en_US';

if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'No endpoint specified']);
    exit;
}

// Validate endpoint (whitelist)
$allowedEndpoints = [
    'v1/location',
    'v2/location',
    'v1/search_location',
    'v1/relevant_location',
    'v1/property_types',
    'v1/property_features',
    'v1/property',
    'v1/plugin_labels'
];

if (!in_array($endpoint, $allowedEndpoints)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid endpoint']);
    exit;
}

// ============================================
// CHECK CACHE BEFORE API CALL (only for GET)
// ============================================
$cacheTtl = ProxyCache::shouldCache($endpoint);
$cacheKey = null;

if ($cacheTtl && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $cacheParams = $_GET;
    unset($cacheParams['_endpoint']); // Keep _lang in cache key
    $cacheKey = ProxyCache::getCacheKey($endpoint, $cacheParams);

    $cached = ProxyCache::get($cacheKey);
    if ($cached !== null) {
        header('X-Cache: HIT');
        header('Cache-Control: public, max-age=3600');  // 1 hour browser cache
        echo $cached;
        exit;
    }
    header('X-Cache: MISS');
}

// ============================================
// MAKE API REQUEST
// ============================================

// Build API URL
$apiUrl = rtrim($clientConfig['api_url'], '/') . '/' . $endpoint;

// Get all parameters except internal ones
$params = $_GET;
unset($params['_endpoint'], $params['_lang']);

// Add language only if explicitly provided
if (isset($_GET['_lang']) || isset($_POST['_lang'])) {
    $params['lang'] = $language;
}

// Build query string
if (!empty($params)) {
    $apiUrl .= '?' . http_build_query($params);
}

// Initialize cURL
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'access_token: ' . $clientConfig['api_key'],
        'Accept: application/json',
        'X-Language: ' . $language
    ]
]);

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = file_get_contents('php://input');
    if ($postData) {
        $jsonData = json_decode($postData, true);
        if ($jsonData) {
            unset($jsonData['_endpoint'], $jsonData['_lang']);
            $jsonData['lang'] = $language;
            $postData = json_encode($jsonData);
        }
    }

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'access_token: ' . $clientConfig['api_key'],
        'Accept: application/json',
        'Content-Type: application/json',
        'X-Language: ' . $language
    ]);
}

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Handle errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'API request failed: ' . $error]);
    exit;
}

// ============================================
// CACHE SUCCESSFUL RESPONSE
// ============================================
if ($cacheTtl && $cacheKey && $httpCode === 200) {
    ProxyCache::set($cacheKey, $response, $cacheTtl);
}

// Forward response
http_response_code($httpCode);
echo $response;
