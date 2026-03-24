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
        'shares' => [],
        'pdf_downloads' => 0,
        'video_views' => 0,
        'tour_views' => 0
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
    } elseif ($category === 'click' && $action === 'resource') {
        // Track PDF, video, and virtual tour clicks (from detail page)
        $resourceType = $event['data']['resource_type'] ?? '';
        if ($resourceType === 'pdf') {
            if (!isset($stats[$today]['pdf_downloads'])) $stats[$today]['pdf_downloads'] = 0;
            $stats[$today]['pdf_downloads']++;
        } elseif ($resourceType === 'video') {
            if (!isset($stats[$today]['video_views'])) $stats[$today]['video_views'] = 0;
            $stats[$today]['video_views']++;
        } elseif ($resourceType === 'tour') {
            if (!isset($stats[$today]['tour_views'])) $stats[$today]['tour_views'] = 0;
            $stats[$today]['tour_views']++;
        }
    } elseif ($category === 'wishlist' && $action === 'pdf') {
        // Track PDF downloads from wishlist page
        if (!isset($stats[$today]['pdf_downloads'])) $stats[$today]['pdf_downloads'] = 0;
        $stats[$today]['pdf_downloads']++;
    }
}

$statsResult = file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT));
logDebug("Stats file written to $statsFile: " . ($statsResult !== false ? 'success (' . $statsResult . ' bytes)' : 'failed'));

// Forward events to SmartPropertyWidget Dashboard API
$dashboardApiUrl = 'https://sm.smartpropertywidget.com/api/v1/widget/analytics';

// Map widget events to dashboard format
$dashboardEvents = [];
foreach ($events as $event) {
    $category = $event['category'] ?? '';
    $action = $event['action'] ?? '';
    $eventData = $event['data'] ?? [];

    // Map category/action to event_type
    $eventType = null;
    if ($category === 'search' && $action === 'search') {
        $eventType = 'search';
    } elseif ($category === 'view' && $action === 'property_view') {
        $eventType = 'property_view';
    } elseif ($category === 'click' && $action === 'card_click') {
        $eventType = 'card_click';
    } elseif ($category === 'wishlist' && $action === 'add') {
        $eventType = 'wishlist_add';
    } elseif ($category === 'inquiry' && $action === 'submit') {
        $eventType = 'inquiry';
    } elseif ($category === 'click' && $action === 'share') {
        $eventType = 'share';
    } elseif ($category === 'click' && $action === 'resource' && ($eventData['resource_type'] ?? '') === 'pdf') {
        $eventType = 'pdf_download';
    } elseif ($category === 'wishlist' && $action === 'pdf') {
        $eventType = 'pdf_download';
    }

    if ($eventType) {
        $dashboardEvents[] = [
            'type' => $eventType,
            'data' => $eventData,
            'session_id' => $event['sessionId'] ?? null,
            'url' => $event['url'] ?? null
        ];
    }
}

// Send to dashboard if we have events
if (!empty($dashboardEvents)) {
    $payload = json_encode([
        'domain' => $domain,
        'events' => $dashboardEvents
    ]);

    logDebug("Forwarding " . count($dashboardEvents) . " events to dashboard: $dashboardApiUrl");

    $ch = curl_init($dashboardApiUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5, // Short timeout to not block response
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        logDebug("Dashboard API curl error: $curlError");
    } else {
        logDebug("Dashboard API response ($httpCode): $response");
    }
}

logDebug("Successfully processed " . count($events) . " events for domain: $domain");
echo json_encode(['success' => true, 'count' => count($events)]);
