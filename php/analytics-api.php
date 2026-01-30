<?php
/**
 * RealtySoft Widget v2 - Analytics API
 * Provides endpoints for reading analytics data
 *
 * Endpoints:
 * - ?action=summary - Get summary stats for all clients (admin) or specific client
 * - ?action=trends - Get daily trends data for charts
 * - ?action=properties - Get top properties by event type
 * - ?action=export - Export raw event data as CSV
 * - ?action=export_properties - Export property performance table as CSV
 * - ?action=export_trends - Export daily trends as CSV
 * - ?action=export_searches - Export search insights as CSV
 * - ?action=export_funnel - Export conversion funnel as CSV
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
$clients = file_exists($configFile) ? require $configFile : [];

// Data directory
$dataDir = __DIR__ . '/../data/analytics';

// Get parameters
$action = $_GET['action'] ?? 'summary';
$clientId = $_GET['client_id'] ?? null;
$period = $_GET['period'] ?? 'month';
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;
$eventType = $_GET['event_type'] ?? 'all';
$category = $_GET['category'] ?? null;

// Calculate date range
$now = new DateTime();
if ($dateFrom && $dateTo) {
    $startDate = new DateTime($dateFrom);
    $endDate = new DateTime($dateTo);
} else {
    switch ($period) {
        case 'today':
            $startDate = new DateTime('today');
            $endDate = new DateTime('tomorrow');
            break;
        case 'yesterday':
            $startDate = new DateTime('yesterday');
            $endDate = new DateTime('today');
            break;
        case 'week':
            $startDate = (clone $now)->modify('-7 days');
            $endDate = $now;
            break;
        case 'month':
            $startDate = (clone $now)->modify('-30 days');
            $endDate = $now;
            break;
        case 'quarter':
            $startDate = (clone $now)->modify('-90 days');
            $endDate = $now;
            break;
        case 'year':
            $startDate = (clone $now)->modify('-365 days');
            $endDate = $now;
            break;
        case 'all':
        default:
            $startDate = new DateTime('2020-01-01');
            $endDate = $now;
            break;
    }
}

/**
 * Get list of CSV files (all clients or specific)
 */
function getCsvFiles($dataDir, $clientId = null) {
    $files = [];
    if (!is_dir($dataDir)) return $files;

    foreach (glob($dataDir . '/*.csv') as $file) {
        $filename = basename($file, '.csv');
        if ($clientId) {
            $cleanClientId = preg_replace('/[^a-zA-Z0-9._-]/', '_', $clientId);
            if ($filename === $cleanClientId) {
                $files[$clientId] = $file;
            }
        } else {
            // Derive client name from filename
            $client = str_replace('_', '.', $filename);
            $files[$client] = $file;
        }
    }
    return $files;
}

/**
 * Read events from CSV files
 */
function readEvents($files, $startDate, $endDate, $category = null, $eventType = null) {
    $events = [];

    foreach ($files as $clientId => $file) {
        if (!file_exists($file)) continue;

        $fp = fopen($file, 'r');
        $headers = fgetcsv($fp); // Skip header

        while (($row = fgetcsv($fp)) !== false) {
            if (count($row) < 4) continue;

            $event = [
                'timestamp' => $row[0] ?? '',
                'session_id' => $row[1] ?? '',
                'category' => $row[2] ?? '',
                'action' => $row[3] ?? '',
                'property_id' => $row[4] ?? '',
                'property_ref' => $row[5] ?? '',
                'location' => $row[6] ?? '',
                'listing_type' => $row[7] ?? '',
                'property_type' => $row[8] ?? '',
                'price' => $row[9] ?? '',
                'filter_data' => $row[10] ?? '{}',
                'platform' => $row[11] ?? '',
                'page_url' => $row[12] ?? '',
                'referrer' => $row[13] ?? '',
                'user_agent' => $row[14] ?? '',
                'client_id' => $clientId
            ];

            // Date filter
            $eventDate = new DateTime($event['timestamp']);
            if ($eventDate < $startDate || $eventDate > $endDate) continue;

            // Category filter
            if ($category && $event['category'] !== $category) continue;

            // Event type filter (action)
            if ($eventType && $eventType !== 'all' && $event['action'] !== $eventType) continue;

            $events[] = $event;
        }

        fclose($fp);
    }

    return $events;
}

/**
 * Get daily stats from JSON files
 */
function getDailyStats($dataDir, $clientId = null, $startDate, $endDate) {
    $stats = [];

    if (!is_dir($dataDir)) return $stats;

    $pattern = $clientId
        ? $dataDir . '/stats_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $clientId) . '_*.json'
        : $dataDir . '/stats_*.json';

    foreach (glob($pattern) as $file) {
        $data = json_decode(file_get_contents($file), true);
        if (!$data) continue;

        // Extract client from filename
        $filename = basename($file, '.json');
        preg_match('/stats_(.+)_\d{4}-\d{2}$/', $filename, $matches);
        $client = $matches[1] ?? 'unknown';
        $client = str_replace('_', '.', $client);

        foreach ($data as $date => $dayStats) {
            $dateObj = new DateTime($date);
            if ($dateObj < $startDate || $dateObj > $endDate) continue;

            if (!isset($stats[$date])) {
                $stats[$date] = [
                    'searches' => 0,
                    'property_views' => 0,
                    'card_clicks' => 0,
                    'wishlist_adds' => 0,
                    'inquiries' => 0,
                    'shares' => []
                ];
            }

            $stats[$date]['searches'] += $dayStats['searches'] ?? 0;
            $stats[$date]['property_views'] += $dayStats['property_views'] ?? 0;
            $stats[$date]['card_clicks'] += $dayStats['card_clicks'] ?? 0;
            $stats[$date]['wishlist_adds'] += $dayStats['wishlist_adds'] ?? 0;
            $stats[$date]['inquiries'] += $dayStats['inquiries'] ?? 0;

            // Merge shares
            if (isset($dayStats['shares'])) {
                foreach ($dayStats['shares'] as $platform => $count) {
                    if (!isset($stats[$date]['shares'][$platform])) {
                        $stats[$date]['shares'][$platform] = 0;
                    }
                    $stats[$date]['shares'][$platform] += $count;
                }
            }
        }
    }

    // Sort by date
    ksort($stats);

    return $stats;
}

/**
 * Get list of all clients
 */
function getClientList($dataDir) {
    $clients = [];
    if (!is_dir($dataDir)) return $clients;

    foreach (glob($dataDir . '/*.csv') as $file) {
        $filename = basename($file, '.csv');
        $client = str_replace('_', '.', $filename);
        $clients[] = $client;
    }

    return array_unique($clients);
}

// Handle different actions
switch ($action) {
    case 'summary':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, $category, $eventType);
        $dailyStats = getDailyStats($dataDir, $clientId, $startDate, $endDate);

        // Calculate totals from daily stats
        $totals = [
            'searches' => 0,
            'property_views' => 0,
            'card_clicks' => 0,
            'wishlist_adds' => 0,
            'inquiries' => 0,
            'total_shares' => 0,
            'shares_by_platform' => []
        ];

        foreach ($dailyStats as $day => $stats) {
            $totals['searches'] += $stats['searches'];
            $totals['property_views'] += $stats['property_views'];
            $totals['card_clicks'] += $stats['card_clicks'];
            $totals['wishlist_adds'] += $stats['wishlist_adds'];
            $totals['inquiries'] += $stats['inquiries'];

            foreach ($stats['shares'] as $platform => $count) {
                $totals['total_shares'] += $count;
                if (!isset($totals['shares_by_platform'][$platform])) {
                    $totals['shares_by_platform'][$platform] = 0;
                }
                $totals['shares_by_platform'][$platform] += $count;
            }
        }

        // Calculate unique sessions and properties
        $uniqueSessions = [];
        $uniqueProperties = [];
        foreach ($events as $event) {
            $uniqueSessions[$event['session_id']] = true;
            if ($event['property_ref']) {
                $uniqueProperties[$event['property_ref']] = true;
            }
        }

        echo json_encode([
            'success' => true,
            'stats' => $totals,
            'unique_sessions' => count($uniqueSessions),
            'unique_properties' => count($uniqueProperties),
            'total_events' => count($events),
            'clients' => getClientList($dataDir),
            'period' => [
                'from' => $startDate->format('Y-m-d'),
                'to' => $endDate->format('Y-m-d')
            ]
        ]);
        break;

    case 'trends':
        $dailyStats = getDailyStats($dataDir, $clientId, $startDate, $endDate);

        // Format for Chart.js
        $labels = [];
        $datasets = [
            'searches' => [],
            'property_views' => [],
            'card_clicks' => [],
            'wishlist_adds' => [],
            'inquiries' => []
        ];

        // Fill in missing dates with zeros
        $current = clone $startDate;
        while ($current <= $endDate) {
            $dateStr = $current->format('Y-m-d');
            $labels[] = $current->format('M j');

            $dayData = $dailyStats[$dateStr] ?? null;
            $datasets['searches'][] = $dayData['searches'] ?? 0;
            $datasets['property_views'][] = $dayData['property_views'] ?? 0;
            $datasets['card_clicks'][] = $dayData['card_clicks'] ?? 0;
            $datasets['wishlist_adds'][] = $dayData['wishlist_adds'] ?? 0;
            $datasets['inquiries'][] = $dayData['inquiries'] ?? 0;

            $current->modify('+1 day');
        }

        echo json_encode([
            'success' => true,
            'labels' => $labels,
            'datasets' => $datasets
        ]);
        break;

    case 'properties':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, $category, $eventType);

        // Aggregate by property
        $propertyStats = [];
        foreach ($events as $event) {
            $ref = $event['property_ref'] ?: $event['property_id'];
            if (!$ref) continue;

            if (!isset($propertyStats[$ref])) {
                $propertyStats[$ref] = [
                    'property_ref' => $ref,
                    'property_id' => $event['property_id'],
                    'location' => $event['location'],
                    'property_type' => $event['property_type'],
                    'price' => $event['price'],
                    'event_count' => 0,
                    'views' => 0,
                    'clicks' => 0,
                    'wishlist_adds' => 0,
                    'inquiries' => 0,
                    'unique_sessions' => [],
                    'last_activity' => $event['timestamp'],
                    'client_id' => $event['client_id']
                ];
            }

            $propertyStats[$ref]['event_count']++;
            $propertyStats[$ref]['unique_sessions'][$event['session_id']] = true;

            // Track specific actions
            if ($event['action'] === 'property_view') $propertyStats[$ref]['views']++;
            if ($event['action'] === 'card_click') $propertyStats[$ref]['clicks']++;
            if ($event['action'] === 'add') $propertyStats[$ref]['wishlist_adds']++;
            if ($event['action'] === 'submit') $propertyStats[$ref]['inquiries']++;

            // Update last activity
            if ($event['timestamp'] > $propertyStats[$ref]['last_activity']) {
                $propertyStats[$ref]['last_activity'] = $event['timestamp'];
            }
        }

        // Convert unique sessions to count
        foreach ($propertyStats as $ref => &$stats) {
            $stats['unique_users'] = count($stats['unique_sessions']);
            unset($stats['unique_sessions']);
        }

        // Sort by event count
        uasort($propertyStats, function($a, $b) {
            return $b['event_count'] - $a['event_count'];
        });

        // Limit to top 100
        $propertyStats = array_slice(array_values($propertyStats), 0, 100);

        echo json_encode([
            'success' => true,
            'properties' => $propertyStats,
            'total' => count($propertyStats)
        ]);
        break;

    case 'searches':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, 'search', null);

        // Analyze search patterns
        $locationCounts = [];
        $typeCounts = [];
        $listingTypeCounts = [];

        foreach ($events as $event) {
            $filterData = json_decode($event['filter_data'], true) ?: [];

            if (!empty($event['location'])) {
                $loc = $event['location'];
                $locationCounts[$loc] = ($locationCounts[$loc] ?? 0) + 1;
            }

            if (!empty($event['property_type'])) {
                $type = $event['property_type'];
                $typeCounts[$type] = ($typeCounts[$type] ?? 0) + 1;
            }

            if (!empty($event['listing_type'])) {
                $lt = $event['listing_type'];
                $listingTypeCounts[$lt] = ($listingTypeCounts[$lt] ?? 0) + 1;
            }
        }

        arsort($locationCounts);
        arsort($typeCounts);
        arsort($listingTypeCounts);

        echo json_encode([
            'success' => true,
            'total_searches' => count($events),
            'top_locations' => array_slice($locationCounts, 0, 10, true),
            'top_property_types' => array_slice($typeCounts, 0, 10, true),
            'listing_types' => $listingTypeCounts
        ]);
        break;

    case 'export':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, $category, $eventType);

        // Set CSV headers
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="analytics_export_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');

        // Write header row
        fputcsv($output, [
            'Timestamp', 'Client', 'Category', 'Action', 'Property Ref',
            'Location', 'Property Type', 'Listing Type', 'Price',
            'Session ID', 'Page URL'
        ]);

        // Write data rows
        foreach ($events as $event) {
            fputcsv($output, [
                $event['timestamp'],
                $event['client_id'],
                $event['category'],
                $event['action'],
                $event['property_ref'],
                $event['location'],
                $event['property_type'],
                $event['listing_type'],
                $event['price'],
                $event['session_id'],
                $event['page_url']
            ]);
        }

        fclose($output);
        exit;

    case 'clients':
        echo json_encode([
            'success' => true,
            'clients' => getClientList($dataDir)
        ]);
        break;

    case 'property_rankings':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, null, null);
        $limit = intval($_GET['limit'] ?? 10);

        // Aggregate by property
        $propertyStats = [];
        foreach ($events as $event) {
            $ref = $event['property_ref'] ?: $event['property_id'];
            if (!$ref) continue;

            if (!isset($propertyStats[$ref])) {
                $propertyStats[$ref] = [
                    'property_ref' => $ref,
                    'property_id' => $event['property_id'],
                    'location' => $event['location'],
                    'property_type' => $event['property_type'],
                    'price' => $event['price'],
                    'views' => 0,
                    'clicks' => 0,
                    'wishlist_adds' => 0,
                    'inquiries' => 0,
                    'shares' => 0,
                    'gallery_views' => 0,
                    'unique_sessions' => []
                ];
            }

            $propertyStats[$ref]['unique_sessions'][$event['session_id']] = true;

            // Track specific actions
            if ($event['action'] === 'property_view') $propertyStats[$ref]['views']++;
            if ($event['action'] === 'card_click') $propertyStats[$ref]['clicks']++;
            if ($event['action'] === 'add' && $event['category'] === 'wishlist') $propertyStats[$ref]['wishlist_adds']++;
            if ($event['action'] === 'submit') $propertyStats[$ref]['inquiries']++;
            if ($event['action'] === 'share') $propertyStats[$ref]['shares']++;
            if ($event['action'] === 'gallery_view') $propertyStats[$ref]['gallery_views']++;
        }

        // Convert unique sessions to count and calculate conversion rates
        foreach ($propertyStats as $ref => &$stats) {
            $stats['unique_users'] = count($stats['unique_sessions']);
            unset($stats['unique_sessions']);

            // Calculate conversion rates
            $totalInteractions = $stats['views'] + $stats['clicks'];
            $stats['wishlist_rate'] = $totalInteractions > 0 ? round(($stats['wishlist_adds'] / $totalInteractions) * 100, 1) : 0;
            $stats['inquiry_rate'] = $totalInteractions > 0 ? round(($stats['inquiries'] / $totalInteractions) * 100, 1) : 0;
            $stats['total_engagement'] = $stats['views'] + $stats['clicks'] + $stats['wishlist_adds'] + $stats['inquiries'] + $stats['shares'];
        }

        // Create different rankings
        $byViews = $propertyStats;
        $byWishlist = $propertyStats;
        $byInquiries = $propertyStats;
        $byEngagement = $propertyStats;

        uasort($byViews, function($a, $b) { return $b['views'] - $a['views']; });
        uasort($byWishlist, function($a, $b) { return $b['wishlist_adds'] - $a['wishlist_adds']; });
        uasort($byInquiries, function($a, $b) { return $b['inquiries'] - $a['inquiries']; });
        uasort($byEngagement, function($a, $b) { return $b['total_engagement'] - $a['total_engagement']; });

        echo json_encode([
            'success' => true,
            'rankings' => [
                'top_viewed' => array_slice(array_values($byViews), 0, $limit),
                'top_wishlisted' => array_slice(array_values($byWishlist), 0, $limit),
                'top_inquired' => array_slice(array_values($byInquiries), 0, $limit),
                'top_engagement' => array_slice(array_values($byEngagement), 0, $limit)
            ],
            'total_properties' => count($propertyStats)
        ]);
        break;

    case 'property_detail':
        $propertyRef = $_GET['property_ref'] ?? null;
        if (!$propertyRef) {
            http_response_code(400);
            echo json_encode(['error' => 'property_ref is required']);
            exit;
        }

        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, null, null);

        // Filter events for this property
        $propertyEvents = array_filter($events, function($e) use ($propertyRef) {
            return $e['property_ref'] === $propertyRef || $e['property_id'] === $propertyRef;
        });

        // Aggregate stats
        $stats = [
            'property_ref' => $propertyRef,
            'views' => 0,
            'clicks' => 0,
            'wishlist_adds' => 0,
            'wishlist_removes' => 0,
            'inquiries' => 0,
            'shares' => 0,
            'gallery_views' => 0,
            'pdf_downloads' => 0,
            'unique_sessions' => [],
            'daily_stats' => [],
            'share_platforms' => [],
            'referrers' => [],
            'first_seen' => null,
            'last_seen' => null
        ];

        foreach ($propertyEvents as $event) {
            $stats['unique_sessions'][$event['session_id']] = true;

            $date = substr($event['timestamp'], 0, 10);
            if (!isset($stats['daily_stats'][$date])) {
                $stats['daily_stats'][$date] = ['views' => 0, 'clicks' => 0, 'wishlist' => 0, 'inquiries' => 0];
            }

            // Track actions
            switch ($event['action']) {
                case 'property_view':
                    $stats['views']++;
                    $stats['daily_stats'][$date]['views']++;
                    break;
                case 'card_click':
                    $stats['clicks']++;
                    $stats['daily_stats'][$date]['clicks']++;
                    break;
                case 'add':
                    if ($event['category'] === 'wishlist') {
                        $stats['wishlist_adds']++;
                        $stats['daily_stats'][$date]['wishlist']++;
                    }
                    break;
                case 'remove':
                    if ($event['category'] === 'wishlist') $stats['wishlist_removes']++;
                    break;
                case 'submit':
                    $stats['inquiries']++;
                    $stats['daily_stats'][$date]['inquiries']++;
                    break;
                case 'share':
                    $stats['shares']++;
                    $platform = json_decode($event['filter_data'], true)['platform'] ?? 'unknown';
                    $stats['share_platforms'][$platform] = ($stats['share_platforms'][$platform] ?? 0) + 1;
                    break;
                case 'gallery_view':
                    $stats['gallery_views']++;
                    break;
                case 'resource':
                    $resourceType = json_decode($event['filter_data'], true)['resource_type'] ?? '';
                    if ($resourceType === 'pdf') $stats['pdf_downloads']++;
                    break;
            }

            // Track referrers
            if (!empty($event['referrer'])) {
                $refHost = parse_url($event['referrer'], PHP_URL_HOST) ?: $event['referrer'];
                $stats['referrers'][$refHost] = ($stats['referrers'][$refHost] ?? 0) + 1;
            }

            // Track first/last seen
            if (!$stats['first_seen'] || $event['timestamp'] < $stats['first_seen']) {
                $stats['first_seen'] = $event['timestamp'];
            }
            if (!$stats['last_seen'] || $event['timestamp'] > $stats['last_seen']) {
                $stats['last_seen'] = $event['timestamp'];
            }
        }

        $stats['unique_users'] = count($stats['unique_sessions']);
        unset($stats['unique_sessions']);

        // Sort daily stats by date
        ksort($stats['daily_stats']);
        arsort($stats['referrers']);
        arsort($stats['share_platforms']);

        // Calculate conversion rates
        $totalInteractions = $stats['views'] + $stats['clicks'];
        $stats['wishlist_rate'] = $totalInteractions > 0 ? round(($stats['wishlist_adds'] / $totalInteractions) * 100, 1) : 0;
        $stats['inquiry_rate'] = $totalInteractions > 0 ? round(($stats['inquiries'] / $totalInteractions) * 100, 1) : 0;

        echo json_encode([
            'success' => true,
            'property' => $stats,
            'total_events' => count($propertyEvents)
        ]);
        break;

    case 'property_funnel':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, null, null);

        // Track user journeys by session
        $sessions = [];
        foreach ($events as $event) {
            $sessionId = $event['session_id'];
            if (!isset($sessions[$sessionId])) {
                $sessions[$sessionId] = [
                    'searched' => false,
                    'viewed_listing' => false,
                    'clicked_property' => false,
                    'viewed_detail' => false,
                    'added_wishlist' => false,
                    'shared' => false,
                    'inquired' => false
                ];
            }

            switch ($event['action']) {
                case 'search':
                    $sessions[$sessionId]['searched'] = true;
                    break;
                case 'card_click':
                    $sessions[$sessionId]['clicked_property'] = true;
                    $sessions[$sessionId]['viewed_listing'] = true;
                    break;
                case 'property_view':
                    $sessions[$sessionId]['viewed_detail'] = true;
                    break;
                case 'add':
                    if ($event['category'] === 'wishlist') $sessions[$sessionId]['added_wishlist'] = true;
                    break;
                case 'share':
                    $sessions[$sessionId]['shared'] = true;
                    break;
                case 'submit':
                    $sessions[$sessionId]['inquired'] = true;
                    break;
            }
        }

        // Calculate funnel metrics
        $totalSessions = count($sessions);
        $funnel = [
            'total_sessions' => $totalSessions,
            'searched' => 0,
            'viewed_listing' => 0,
            'clicked_property' => 0,
            'viewed_detail' => 0,
            'added_wishlist' => 0,
            'shared' => 0,
            'inquired' => 0
        ];

        foreach ($sessions as $session) {
            if ($session['searched']) $funnel['searched']++;
            if ($session['viewed_listing']) $funnel['viewed_listing']++;
            if ($session['clicked_property']) $funnel['clicked_property']++;
            if ($session['viewed_detail']) $funnel['viewed_detail']++;
            if ($session['added_wishlist']) $funnel['added_wishlist']++;
            if ($session['shared']) $funnel['shared']++;
            if ($session['inquired']) $funnel['inquired']++;
        }

        // Calculate percentages
        $funnelWithRates = [];
        foreach ($funnel as $step => $count) {
            $funnelWithRates[$step] = [
                'count' => $count,
                'percentage' => $totalSessions > 0 ? round(($count / $totalSessions) * 100, 1) : 0
            ];
        }

        // Calculate step-by-step conversion
        $conversions = [
            'search_to_click' => $funnel['searched'] > 0 ? round(($funnel['clicked_property'] / $funnel['searched']) * 100, 1) : 0,
            'click_to_view' => $funnel['clicked_property'] > 0 ? round(($funnel['viewed_detail'] / $funnel['clicked_property']) * 100, 1) : 0,
            'view_to_wishlist' => $funnel['viewed_detail'] > 0 ? round(($funnel['added_wishlist'] / $funnel['viewed_detail']) * 100, 1) : 0,
            'view_to_inquiry' => $funnel['viewed_detail'] > 0 ? round(($funnel['inquired'] / $funnel['viewed_detail']) * 100, 1) : 0,
            'overall_conversion' => $totalSessions > 0 ? round(($funnel['inquired'] / $totalSessions) * 100, 2) : 0
        ];

        echo json_encode([
            'success' => true,
            'funnel' => $funnelWithRates,
            'conversions' => $conversions
        ]);
        break;

    case 'property_table':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, null, null);

        $sortBy = $_GET['sort'] ?? 'views';
        $sortOrder = $_GET['order'] ?? 'desc';
        $page = intval($_GET['page'] ?? 1);
        $perPage = intval($_GET['per_page'] ?? 20);
        $search = $_GET['search'] ?? '';

        // Aggregate by property
        $propertyStats = [];
        foreach ($events as $event) {
            $ref = $event['property_ref'] ?: $event['property_id'];
            if (!$ref) continue;

            if (!isset($propertyStats[$ref])) {
                $propertyStats[$ref] = [
                    'property_ref' => $ref,
                    'location' => $event['location'],
                    'property_type' => $event['property_type'],
                    'price' => $event['price'],
                    'views' => 0,
                    'clicks' => 0,
                    'wishlist_adds' => 0,
                    'inquiries' => 0,
                    'shares' => 0,
                    'unique_sessions' => [],
                    'last_activity' => $event['timestamp']
                ];
            }

            $propertyStats[$ref]['unique_sessions'][$event['session_id']] = true;

            if ($event['action'] === 'property_view') $propertyStats[$ref]['views']++;
            if ($event['action'] === 'card_click') $propertyStats[$ref]['clicks']++;
            if ($event['action'] === 'add' && $event['category'] === 'wishlist') $propertyStats[$ref]['wishlist_adds']++;
            if ($event['action'] === 'submit') $propertyStats[$ref]['inquiries']++;
            if ($event['action'] === 'share') $propertyStats[$ref]['shares']++;

            if ($event['timestamp'] > $propertyStats[$ref]['last_activity']) {
                $propertyStats[$ref]['last_activity'] = $event['timestamp'];
            }
        }

        // Process stats
        foreach ($propertyStats as $ref => &$stats) {
            $stats['unique_users'] = count($stats['unique_sessions']);
            unset($stats['unique_sessions']);

            $totalInteractions = $stats['views'] + $stats['clicks'];
            $stats['conversion_rate'] = $totalInteractions > 0 ? round(($stats['inquiries'] / $totalInteractions) * 100, 1) : 0;
        }

        // Filter by search
        if ($search) {
            $propertyStats = array_filter($propertyStats, function($p) use ($search) {
                return stripos($p['property_ref'], $search) !== false ||
                       stripos($p['location'], $search) !== false ||
                       stripos($p['property_type'], $search) !== false;
            });
        }

        // Sort
        uasort($propertyStats, function($a, $b) use ($sortBy, $sortOrder) {
            $aVal = $a[$sortBy] ?? 0;
            $bVal = $b[$sortBy] ?? 0;

            if (is_string($aVal)) {
                $result = strcasecmp($aVal, $bVal);
            } else {
                $result = $aVal - $bVal;
            }

            return $sortOrder === 'asc' ? $result : -$result;
        });

        $total = count($propertyStats);
        $totalPages = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        $properties = array_slice(array_values($propertyStats), $offset, $perPage);

        echo json_encode([
            'success' => true,
            'properties' => $properties,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $totalPages
            ]
        ]);
        break;

    case 'export_properties':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, null, null);

        // Aggregate by property (reuse property_table logic)
        $propertyStats = [];
        foreach ($events as $event) {
            $ref = $event['property_ref'] ?: $event['property_id'];
            if (!$ref) continue;

            if (!isset($propertyStats[$ref])) {
                $propertyStats[$ref] = [
                    'property_ref' => $ref,
                    'location' => $event['location'],
                    'property_type' => $event['property_type'],
                    'price' => $event['price'],
                    'views' => 0,
                    'clicks' => 0,
                    'wishlist_adds' => 0,
                    'inquiries' => 0,
                    'shares' => 0,
                    'unique_sessions' => [],
                    'last_activity' => $event['timestamp']
                ];
            }

            $propertyStats[$ref]['unique_sessions'][$event['session_id']] = true;

            if ($event['action'] === 'property_view') $propertyStats[$ref]['views']++;
            if ($event['action'] === 'card_click') $propertyStats[$ref]['clicks']++;
            if ($event['action'] === 'add' && $event['category'] === 'wishlist') $propertyStats[$ref]['wishlist_adds']++;
            if ($event['action'] === 'submit') $propertyStats[$ref]['inquiries']++;
            if ($event['action'] === 'share') $propertyStats[$ref]['shares']++;

            if ($event['timestamp'] > $propertyStats[$ref]['last_activity']) {
                $propertyStats[$ref]['last_activity'] = $event['timestamp'];
            }
        }

        // Process stats
        foreach ($propertyStats as $ref => &$pStats) {
            $pStats['unique_users'] = count($pStats['unique_sessions']);
            unset($pStats['unique_sessions']);
            $totalInteractions = $pStats['views'] + $pStats['clicks'];
            $pStats['conversion_rate'] = $totalInteractions > 0 ? round(($pStats['inquiries'] / $totalInteractions) * 100, 1) : 0;
        }
        unset($pStats);

        // Sort by views desc
        uasort($propertyStats, function($a, $b) { return $b['views'] - $a['views']; });

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="property_performance_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['Property Ref', 'Location', 'Property Type', 'Price', 'Views', 'Clicks', 'Wishlist Adds', 'Inquiries', 'Shares', 'Unique Users', 'Conversion Rate (%)', 'Last Activity']);

        foreach ($propertyStats as $ps) {
            fputcsv($output, [
                $ps['property_ref'],
                $ps['location'],
                $ps['property_type'],
                $ps['price'],
                $ps['views'],
                $ps['clicks'],
                $ps['wishlist_adds'],
                $ps['inquiries'],
                $ps['shares'],
                $ps['unique_users'],
                $ps['conversion_rate'],
                $ps['last_activity']
            ]);
        }

        fclose($output);
        exit;

    case 'export_trends':
        $dailyStats = getDailyStats($dataDir, $clientId, $startDate, $endDate);

        // Fill missing dates with zeros
        $trendRows = [];
        $current = clone $startDate;
        while ($current <= $endDate) {
            $dateStr = $current->format('Y-m-d');
            $dayData = $dailyStats[$dateStr] ?? null;
            $trendRows[] = [
                'date' => $dateStr,
                'searches' => $dayData['searches'] ?? 0,
                'property_views' => $dayData['property_views'] ?? 0,
                'card_clicks' => $dayData['card_clicks'] ?? 0,
                'wishlist_adds' => $dayData['wishlist_adds'] ?? 0,
                'inquiries' => $dayData['inquiries'] ?? 0
            ];
            $current->modify('+1 day');
        }

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="daily_trends_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['Date', 'Searches', 'Property Views', 'Card Clicks', 'Wishlist Adds', 'Inquiries']);

        foreach ($trendRows as $row) {
            fputcsv($output, [
                $row['date'],
                $row['searches'],
                $row['property_views'],
                $row['card_clicks'],
                $row['wishlist_adds'],
                $row['inquiries']
            ]);
        }

        fclose($output);
        exit;

    case 'export_searches':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, 'search', null);

        // Aggregate search patterns (reuse searches logic)
        $locationCounts = [];
        $typeCounts = [];
        $listingTypeCounts = [];

        foreach ($events as $event) {
            if (!empty($event['location'])) {
                $loc = $event['location'];
                $locationCounts[$loc] = ($locationCounts[$loc] ?? 0) + 1;
            }
            if (!empty($event['property_type'])) {
                $type = $event['property_type'];
                $typeCounts[$type] = ($typeCounts[$type] ?? 0) + 1;
            }
            if (!empty($event['listing_type'])) {
                $lt = $event['listing_type'];
                $listingTypeCounts[$lt] = ($listingTypeCounts[$lt] ?? 0) + 1;
            }
        }

        arsort($locationCounts);
        arsort($typeCounts);
        arsort($listingTypeCounts);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="search_insights_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['Type', 'Name', 'Count']);

        foreach ($locationCounts as $name => $count) {
            fputcsv($output, ['Location', $name, $count]);
        }
        foreach ($typeCounts as $name => $count) {
            fputcsv($output, ['Property Type', $name, $count]);
        }
        foreach ($listingTypeCounts as $name => $count) {
            fputcsv($output, ['Listing Type', $name, $count]);
        }

        fclose($output);
        exit;

    case 'export_funnel':
        $files = getCsvFiles($dataDir, $clientId);
        $events = readEvents($files, $startDate, $endDate, null, null);

        // Track user journeys by session (reuse property_funnel logic)
        $sessions = [];
        foreach ($events as $event) {
            $sessionId = $event['session_id'];
            if (!isset($sessions[$sessionId])) {
                $sessions[$sessionId] = [
                    'searched' => false,
                    'clicked_property' => false,
                    'viewed_detail' => false,
                    'added_wishlist' => false,
                    'inquired' => false
                ];
            }

            switch ($event['action']) {
                case 'search':
                    $sessions[$sessionId]['searched'] = true;
                    break;
                case 'card_click':
                    $sessions[$sessionId]['clicked_property'] = true;
                    break;
                case 'property_view':
                    $sessions[$sessionId]['viewed_detail'] = true;
                    break;
                case 'add':
                    if ($event['category'] === 'wishlist') $sessions[$sessionId]['added_wishlist'] = true;
                    break;
                case 'submit':
                    $sessions[$sessionId]['inquired'] = true;
                    break;
            }
        }

        $totalSessions = count($sessions);
        $funnel = [
            'total_sessions' => $totalSessions,
            'searched' => 0,
            'clicked_property' => 0,
            'viewed_detail' => 0,
            'added_wishlist' => 0,
            'inquired' => 0
        ];

        foreach ($sessions as $session) {
            if ($session['searched']) $funnel['searched']++;
            if ($session['clicked_property']) $funnel['clicked_property']++;
            if ($session['viewed_detail']) $funnel['viewed_detail']++;
            if ($session['added_wishlist']) $funnel['added_wishlist']++;
            if ($session['inquired']) $funnel['inquired']++;
        }

        // Build funnel steps with conversion to next step
        $funnelSteps = [
            ['step' => 'Total Sessions', 'count' => $funnel['total_sessions']],
            ['step' => 'Searched', 'count' => $funnel['searched']],
            ['step' => 'Clicked Property', 'count' => $funnel['clicked_property']],
            ['step' => 'Viewed Detail', 'count' => $funnel['viewed_detail']],
            ['step' => 'Added Wishlist', 'count' => $funnel['added_wishlist']],
            ['step' => 'Inquired', 'count' => $funnel['inquired']]
        ];

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="conversion_funnel_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['Step', 'Sessions', 'Percentage of Total (%)', 'Conversion to Next Step (%)']);

        for ($i = 0; $i < count($funnelSteps); $i++) {
            $step = $funnelSteps[$i];
            $pctOfTotal = $totalSessions > 0 ? round(($step['count'] / $totalSessions) * 100, 1) : 0;
            $convToNext = '';
            if ($i < count($funnelSteps) - 1 && $step['count'] > 0) {
                $convToNext = round(($funnelSteps[$i + 1]['count'] / $step['count']) * 100, 1);
            }
            fputcsv($output, [
                $step['step'],
                $step['count'],
                $pctOfTotal,
                $convToNext
            ]);
        }

        fclose($output);
        exit;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action: ' . $action]);
}
