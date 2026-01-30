<?php
/**
 * RealtySoft Widget v2 - Analytics Tracking
 * Receives and stores analytics events
 */

// Debug mode - set to true to enable logging
$debug = true;
$debugLog = __DIR__ . '/../data/analytics-debug.log';

function logDebug($message) {
    global $debug, $debugLog;
    if ($debug) {
        $logDir = dirname($debugLog);
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        @file_put_contents($debugLog, date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
    }
}

logDebug("Request received: " . $_SERVER['REQUEST_METHOD']);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logDebug("Preflight request - returning 200");
    http_response_code(200);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logDebug("Method not allowed: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
$clients = file_exists($configFile) ? require $configFile : [];

// Get requesting domain
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$domain = parse_url($origin, PHP_URL_HOST) ?? 'localhost';
$domain = preg_replace('/^www\./', '', $domain);
logDebug("Origin: $origin, Domain: $domain");

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);
logDebug("Input received: " . substr($input, 0, 500));

if (!$data || !isset($data['events'])) {
    logDebug("Invalid request data - data: " . ($data ? 'set' : 'null') . ", events: " . (isset($data['events']) ? 'set' : 'not set'));
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

$events = $data['events'];
if (!is_array($events)) {
    logDebug("Events is not an array");
    http_response_code(400);
    echo json_encode(['error' => 'Events must be an array']);
    exit;
}

logDebug("Processing " . count($events) . " events");

// Create data directory if needed
$dataDir = __DIR__ . '/../data/analytics';
if (!is_dir($dataDir)) {
    $mkdirResult = mkdir($dataDir, 0755, true);
    logDebug("Creating directory $dataDir: " . ($mkdirResult ? 'success' : 'failed'));
}

// CSV file for this domain
$csvFile = $dataDir . '/' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $domain) . '.csv';

// Create CSV header if file doesn't exist
if (!file_exists($csvFile)) {
    $header = [
        'timestamp',
        'session_id',
        'category',
        'action',
        'property_id',
        'property_ref',
        'location',
        'listing_type',
        'property_type',
        'price',
        'filter_data',
        'platform',
        'page_url',
        'referrer',
        'user_agent'
    ];
    $fp = fopen($csvFile, 'w');
    fputcsv($fp, $header);
    fclose($fp);
}

// Process and store events
logDebug("Opening CSV file: $csvFile");
$fp = fopen($csvFile, 'a');
if (!$fp) {
    logDebug("Failed to open CSV file: $csvFile");
    http_response_code(500);
    echo json_encode(['error' => 'Failed to open log file']);
    exit;
}

flock($fp, LOCK_EX);

$rowsWritten = 0;
foreach ($events as $event) {
    // Sanitize event data
    $row = [
        'timestamp' => $event['timestamp'] ?? date('c'),
        'session_id' => substr($event['sessionId'] ?? '', 0, 50),
        'category' => substr($event['category'] ?? '', 0, 50),
        'action' => substr($event['action'] ?? '', 0, 50),
        'property_id' => $event['data']['property_id'] ?? '',
        'property_ref' => $event['data']['property_ref'] ?? '',
        'location' => $event['data']['location'] ?? '',
        'listing_type' => $event['data']['listing_type'] ?? '',
        'property_type' => $event['data']['property_type'] ?? '',
        'price' => $event['data']['price'] ?? '',
        'filter_data' => json_encode($event['data'] ?? []),
        'platform' => $event['data']['platform'] ?? '',
        'page_url' => substr($event['url'] ?? '', 0, 500),
        'referrer' => substr($event['referrer'] ?? '', 0, 500),
        'user_agent' => substr($event['userAgent'] ?? '', 0, 255)
    ];

    fputcsv($fp, $row);
    $rowsWritten++;
}

flock($fp, LOCK_UN);
fclose($fp);
logDebug("CSV file written: $rowsWritten rows to $csvFile");

// Also aggregate daily stats
$statsFile = $dataDir . '/stats_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $domain) . '_' . date('Y-m') . '.json';
$stats = file_exists($statsFile) ? json_decode(file_get_contents($statsFile), true) : [];

$today = date('Y-m-d');
if (!isset($stats[$today])) {
    $stats[$today] = [
        'searches' => 0,
        'property_views' => 0,
        'card_clicks' => 0,
        'wishlist_adds' => 0,
        'inquiries' => 0,
        'shares' => []
    ];
}

foreach ($events as $event) {
    $category = $event['category'] ?? '';
    $action = $event['action'] ?? '';

    if ($category === 'search' && $action === 'search') {
        $stats[$today]['searches']++;
    } elseif ($category === 'view' && $action === 'property_view') {
        $stats[$today]['property_views']++;
    } elseif ($category === 'click' && $action === 'card_click') {
        $stats[$today]['card_clicks']++;
    } elseif ($category === 'wishlist' && $action === 'add') {
        $stats[$today]['wishlist_adds']++;
    } elseif ($category === 'inquiry' && $action === 'submit') {
        $stats[$today]['inquiries']++;
    } elseif ($category === 'click' && $action === 'share') {
        $platform = $event['data']['platform'] ?? 'unknown';
        if (!isset($stats[$today]['shares'][$platform])) {
            $stats[$today]['shares'][$platform] = 0;
        }
        $stats[$today]['shares'][$platform]++;
    }
}

$statsResult = file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT));
logDebug("Stats file written to $statsFile: " . ($statsResult !== false ? 'success (' . $statsResult . ' bytes)' : 'failed'));

logDebug("Successfully processed " . count($events) . " events for domain: $domain");
echo json_encode(['success' => true, 'count' => count($events)]);
