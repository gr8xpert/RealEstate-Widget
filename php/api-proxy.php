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
    // Reduced TTLs ensure fresh property counts for location/type dropdowns
    private static $ttl = [
        'v1/location' => 900,           // 15 min (reduced from 24h for fresh property_count)
        'v2/location' => 900,           // 15 min (reduced from 24h for fresh property_count)
        'v1/property_types' => 900,     // 15 min (reduced from 24h for fresh property_count)
        'v1/property_features' => 3600, // 1 hour (reduced from 24h)
        'v1/plugin_labels' => 86400,    // 24 hours (unchanged - rarely changes)
    ];

    // Stale grace period - serve stale data for this long while refreshing
    private static $staleGrace = 3600; // 1 hour grace period

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

    /**
     * Get cached data with stale-while-revalidate support
     * Returns: ['data' => string|null, 'stale' => bool, 'hash' => string|null]
     */
    public static function getWithMeta($key) {
        $file = self::$cacheDir . $key . '.json';
        if (!file_exists($file)) return ['data' => null, 'stale' => false, 'hash' => null];

        $content = @file_get_contents($file);
        if (!$content) return ['data' => null, 'stale' => false, 'hash' => null];

        $data = json_decode($content, true);
        if (!$data || !isset($data['expires'])) {
            @unlink($file);
            return ['data' => null, 'stale' => false, 'hash' => null];
        }

        $hash = $data['hash'] ?? null;
        $isExpired = time() > $data['expires'];
        $isStale = $isExpired && time() < ($data['expires'] + self::$staleGrace);

        // Completely expired beyond grace period
        if ($isExpired && !$isStale) {
            return ['data' => null, 'stale' => false, 'hash' => $hash];
        }

        return [
            'data' => $data['response'],
            'stale' => $isExpired,
            'hash' => $hash
        ];
    }

    public static function get($key) {
        $result = self::getWithMeta($key);
        return $result['stale'] ? null : $result['data'];
    }

    /**
     * Get stale data (for fallback when API fails)
     */
    public static function getStale($key) {
        $file = self::$cacheDir . $key . '.json';
        if (!file_exists($file)) return null;

        $content = @file_get_contents($file);
        if (!$content) return null;

        $data = json_decode($content, true);
        return $data['response'] ?? null;
    }

    public static function set($key, $response, $ttl) {
        $file = self::$cacheDir . $key . '.json';
        $hash = md5($response);
        $data = [
            'expires' => time() + $ttl,
            'created' => date('Y-m-d H:i:s'),
            'hash' => $hash,
            'response' => $response
        ];
        @file_put_contents($file, json_encode($data), LOCK_EX);
        return $hash;
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

// ============================================
// DOMAIN DETECTION (moved before cache check to prevent cross-client data leakage)
// ============================================
// Get requesting domain FIRST - needed for cache key isolation
// Priority: 1. _domain parameter (for admin tools) 2. X-RS-Domain header 3. Origin/Referer
$domain = null;

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

// ============================================
// EARLY CACHE CHECK FOR STATIC ENDPOINTS
// ============================================
// Check cache BEFORE subscription/auth checks for static data
// This ensures fast responses even when auth has issues
// NOTE: Domain is NOT included in cache key for static endpoints
// Client isolation happens at API key level, not domain level
// This allows cache-warm.php to pre-populate caches that match runtime requests
$endpoint = $_GET['_endpoint'] ?? $_POST['_endpoint'] ?? '';
// NOTE: plugin_labels excluded from early cache because enabledListingTypes is per-domain
$staticEndpoints = ['v1/location', 'v2/location', 'v1/property_types', 'v1/property_features'];

if ($_SERVER['REQUEST_METHOD'] === 'GET' && in_array($endpoint, $staticEndpoints)) {
    $cacheParams = $_GET;
    // Remove parameters that shouldn't affect cache key
    unset($cacheParams['_endpoint']);
    unset($cacheParams['_t']);  // Remove cache-busting timestamp
    unset($cacheParams['_']);   // Remove jQuery cache-buster
    unset($cacheParams['_domain']); // Domain not used in cache key - isolation via API key
    // Domain NOT added to cache params - static data is per-API-key, not per-domain

    $earlyCacheKey = ProxyCache::getCacheKey($endpoint, $cacheParams);
    $earlyCacheResult = ProxyCache::getWithMeta($earlyCacheKey);

    // If we have ANY cached data (fresh or stale), return it immediately
    if ($earlyCacheResult['data'] !== null) {
        $isStale = $earlyCacheResult['stale'];
        header('X-Cache: ' . ($isStale ? 'STALE-EARLY' : 'HIT-EARLY'));
        header('X-Cache-Hash: ' . ($earlyCacheResult['hash'] ?? ''));
        header('Cache-Control: public, max-age=' . ($isStale ? '300' : '3600'));
        echo $earlyCacheResult['data'];
        exit;
    }
}

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration file not found']);
    exit;
}

$clients = require $configFile;

// ============================================
// SUBSCRIPTION CHECK (Database-backed)
// ============================================
// Check subscription status from database before processing request
// Falls back to config file if database unavailable

$subscriptionServiceFile = __DIR__ . '/subscription/SubscriptionService.php';
$subscriptionCheckEnabled = file_exists($subscriptionServiceFile);

if ($subscriptionCheckEnabled) {
    require_once __DIR__ . '/subscription/Database.php';
    require_once $subscriptionServiceFile;
}

// Domain already detected above (before cache check)

// ============================================
// WHITELISTED DOMAINS (bypass subscription check)
// ============================================
// These domains are always allowed (e.g., main widget hosting domain)
$whitelistedDomains = ['smartpropertywidget.com', 'localhost'];
$isWhitelisted = in_array($domain, $whitelistedDomains);

// ============================================
// CHECK SUBSCRIPTION STATUS
// ============================================
$subscriptionStatus = null;
$clientConfig = null;

if ($subscriptionCheckEnabled) {
    try {
        $subscriptionService = new SubscriptionService();
        $subscriptionStatus = $subscriptionService->checkSubscription($domain);

        // Block if subscription expired and past grace period (skip for whitelisted)
        if (!$isWhitelisted && $subscriptionStatus['status'] === 'blocked') {
            http_response_code(403);
            echo json_encode([
                'error' => 'Subscription expired',
                'subscription_status' => 'blocked',
                'message' => $subscriptionStatus['message'] ?? 'Please renew your subscription to continue using the widget.'
            ]);
            exit;
        }

        // Add grace warning headers (widget can show warning banner)
        if ($subscriptionStatus['status'] === 'grace_period') {
            header('X-RS-Subscription-Warning: true');
            header('X-RS-Grace-Days: ' . ($subscriptionStatus['grace_days_remaining'] ?? 0));
        }

        // Try to get client config from database first
        $clientConfig = $subscriptionService->getClientConfig($domain);

    } catch (Exception $e) {
        // Database error - log and fall back to config file
        error_log('Subscription check failed: ' . $e->getMessage());
        // Continue with config file fallback
    }
}

// ============================================
// FALLBACK TO CONFIG FILE
// ============================================
// If database lookup failed or returned null, check config file
if (!$clientConfig) {
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

    // Fallback for whitelisted domains - use first available config
    if (!$clientConfig && $isWhitelisted && !empty($clients)) {
        $clientConfig = reset($clients);
    }
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
$staleData = null;

if ($cacheTtl && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $cacheParams = $_GET;
    unset($cacheParams['_endpoint']); // Keep _lang in cache key
    unset($cacheParams['_t']);  // Remove cache-busting timestamp
    unset($cacheParams['_']);   // Remove jQuery cache-buster
    unset($cacheParams['_domain']); // Domain not used in cache key - isolation via API key
    // Domain NOT added for most endpoints - static data is per-API-key, not per-domain
    // EXCEPTION: plugin_labels includes enabledListingTypes which is per-domain
    if ($endpoint === 'v1/plugin_labels') {
        $cacheParams['_domain'] = $domain;
    }
    $cacheKey = ProxyCache::getCacheKey($endpoint, $cacheParams);

    $cacheResult = ProxyCache::getWithMeta($cacheKey);

    // Fresh cache hit - return immediately
    if ($cacheResult['data'] !== null && !$cacheResult['stale']) {
        header('X-Cache: HIT');
        header('X-Cache-Hash: ' . ($cacheResult['hash'] ?? ''));
        header('Cache-Control: public, max-age=3600');  // 1 hour browser cache
        echo $cacheResult['data'];
        exit;
    }

    // Stale cache - save for potential fallback, continue to refresh
    if ($cacheResult['data'] !== null) {
        $staleData = $cacheResult['data'];
        header('X-Cache: STALE');
    } else {
        header('X-Cache: MISS');
    }
}

// ============================================
// ROUTE LABELS TO DASHBOARD API
// ============================================
// Labels, enabledListingTypes come from dashboard (not CRM directly)
// This ensures client-specific settings like enabled listing types are applied

if ($endpoint === 'v1/plugin_labels') {
    // Load database config for Laravel API settings
    $dbConfigFile = __DIR__ . '/config/database.local.php';
    if (!file_exists($dbConfigFile)) {
        $dbConfigFile = __DIR__ . '/config/database.php';
    }
    $dbConfig = file_exists($dbConfigFile) ? require $dbConfigFile : [];
    $laravelApi = $dbConfig['laravel_api'] ?? [];

    if (!empty($laravelApi['base_url']) && !empty($laravelApi['internal_api_key'])) {
        $dashboardUrl = rtrim($laravelApi['base_url'], '/') . '/api/internal/labels';
        $dashboardUrl .= '?domain=' . urlencode($domain) . '&language=' . urlencode($language);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $dashboardUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => [
                'X-Internal-API-Key: ' . $laravelApi['internal_api_key'],
                'Accept: application/json',
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if (!$error && $httpCode === 200) {
            // Successfully got labels from dashboard
            // Cache the response
            if ($cacheTtl && $cacheKey) {
                $hash = ProxyCache::set($cacheKey, $response, $cacheTtl);
                if ($hash) {
                    header('X-Cache-Hash: ' . $hash);
                }
            }

            header('Content-Type: application/json');
            header('Cache-Control: public, max-age=3600');
            header('X-Labels-Source: dashboard');
            http_response_code(200);
            echo $response;
            exit;
        }

        // Dashboard API failed - log and fall through to CRM
        error_log('Dashboard labels API failed: ' . ($error ?: "HTTP $httpCode"));
    }
}

// ============================================
// MAKE API REQUEST (to CRM)
// ============================================

// Build API URL
$apiUrl = rtrim($clientConfig['api_url'], '/') . '/' . $endpoint;

// Get all parameters except internal ones
$params = $_GET;
unset($params['_endpoint'], $params['_lang'], $params['_t'], $params['_']);

// Add language only if explicitly provided
// CRM uses 'ln' parameter for language (not 'lang')
if (isset($_GET['_lang']) || isset($_POST['_lang'])) {
    $params['ln'] = $language;
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
            $jsonData['ln'] = $language;
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

// Handle errors - fallback to stale cache if available
if ($error || $httpCode !== 200) {
    // Try to return stale data on error
    if ($staleData !== null) {
        header('X-Cache: STALE-FALLBACK');
        header('Cache-Control: public, max-age=300');  // Short cache on stale fallback
        echo $staleData;
        exit;
    }

    // Also try to get any cached data as last resort
    if ($cacheKey) {
        $fallback = ProxyCache::getStale($cacheKey);
        if ($fallback !== null) {
            header('X-Cache: STALE-FALLBACK');
            header('Cache-Control: public, max-age=300');
            echo $fallback;
            exit;
        }
    }

    // No fallback available
    http_response_code($error ? 500 : $httpCode);
    echo $error ? json_encode(['error' => 'API request failed: ' . $error]) : $response;
    exit;
}

// ============================================
// INJECT CLIENT CONFIG INTO LABELS RESPONSE
// ============================================
// For plugin_labels endpoint, inject enabledListingTypes from client config
if ($endpoint === 'v1/plugin_labels' && $httpCode === 200 && !empty($clientConfig['enabledListingTypes'])) {
    $labelsData = json_decode($response, true);
    if ($labelsData !== null) {
        $labelsData['enabledListingTypes'] = $clientConfig['enabledListingTypes'];
        $response = json_encode($labelsData);
    }
}

// ============================================
// CACHE SUCCESSFUL RESPONSE
// ============================================
$hash = null;
if ($cacheTtl && $cacheKey && $httpCode === 200) {
    $hash = ProxyCache::set($cacheKey, $response, $cacheTtl);
}

// Add hash header for browser cache validation
if ($hash) {
    header('X-Cache-Hash: ' . $hash);
}

// Forward response with appropriate cache headers
header('Cache-Control: public, max-age=3600');  // 1 hour browser cache
http_response_code($httpCode);
echo $response;
