<?php
/**
 * Debug location data structure
 */

$token = 'spwdebug2026';
if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    die('Access denied. Use ?token=' . $token);
}

echo "<pre style='font-family: monospace; background: #1e1e1e; color: #0f0; padding: 20px; font-size: 12px;'>";
echo "=== Location Data Debug ===\n\n";

$domain = $_GET['domain'] ?? 'smartpropertywidget.com';

// Load config
$dbConfigFile = __DIR__ . '/config/database.local.php';
if (!file_exists($dbConfigFile)) {
    $dbConfigFile = __DIR__ . '/config/database.php';
}
$dbConfig = file_exists($dbConfigFile) ? require $dbConfigFile : [];
$laravelApi = $dbConfig['laravel_api'] ?? [];

$url = rtrim($laravelApi['base_url'], '/') . '/api/v1/widget/locations?domain=' . urlencode($domain);
echo "URL: {$url}\n\n";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: {$httpCode}\n\n";

$data = json_decode($response, true);

if (!$data) {
    echo "ERROR: Invalid JSON response\n";
    echo "Response: " . substr($response, 0, 500) . "\n";
    exit;
}

echo "Total items: " . ($data['count'] ?? count($data['data'] ?? [])) . "\n";
echo "Has custom grouping: " . (isset($data['has_custom_grouping']) ? ($data['has_custom_grouping'] ? 'YES' : 'No') : 'N/A') . "\n\n";

// Analyze data structure
$items = $data['data'] ?? [];

echo "=== Data Structure Analysis ===\n\n";

// Count by type
$byType = [];
$customGroups = [];
$withParentId = 0;
$withChildren = 0;
$withoutParentId = 0;

foreach ($items as $item) {
    $type = $item['type'] ?? 'unknown';
    $byType[$type] = ($byType[$type] ?? 0) + 1;

    if (isset($item['is_custom']) && $item['is_custom']) {
        $customGroups[] = $item['name'] ?? 'unnamed';
    }

    if (isset($item['parent_id'])) {
        $withParentId++;
    } else {
        $withoutParentId++;
    }

    if (isset($item['children'])) {
        $withChildren++;
    }
}

echo "By type:\n";
foreach ($byType as $type => $count) {
    echo "  {$type}: {$count}\n";
}

echo "\nCustom groups: " . count($customGroups) . "\n";
if (!empty($customGroups)) {
    echo "  Names: " . implode(', ', $customGroups) . "\n";
}

echo "\nStructure:\n";
echo "  Items with parent_id: {$withParentId}\n";
echo "  Items without parent_id: {$withoutParentId}\n";
echo "  Items with children array: {$withChildren}\n";

// Show first 10 items
echo "\n=== First 10 Items ===\n\n";
foreach (array_slice($items, 0, 10) as $i => $item) {
    echo ($i + 1) . ". ";
    echo "id=" . ($item['id'] ?? 'N/A') . ", ";
    echo "name=\"" . ($item['name'] ?? 'N/A') . "\", ";
    echo "type=" . ($item['type'] ?? 'N/A') . ", ";
    echo "parent_id=" . (isset($item['parent_id']) ? json_encode($item['parent_id']) : 'NOT SET') . ", ";
    echo "is_custom=" . (isset($item['is_custom']) ? ($item['is_custom'] ? 'true' : 'false') : 'NOT SET');
    if (isset($item['children'])) {
        echo ", children=" . count($item['children']);
    }
    echo "\n";
}

// Show custom groups specifically
echo "\n=== Custom Group Items ===\n\n";
$customItems = array_filter($items, fn($i) => ($i['is_custom'] ?? false) === true);
foreach ($customItems as $item) {
    echo "id=" . ($item['id'] ?? 'N/A') . ", ";
    echo "name=\"" . ($item['name'] ?? 'N/A') . "\", ";
    echo "parent_id=" . (isset($item['parent_id']) ? json_encode($item['parent_id']) : 'NOT SET') . "\n";
}

// Show items with parent_id = custom_group_*
echo "\n=== Items with Custom Group Parent ===\n\n";
$childrenOfCustom = array_filter($items, fn($i) =>
    isset($i['parent_id']) && is_string($i['parent_id']) && strpos($i['parent_id'], 'custom_group_') === 0
);
foreach (array_slice($childrenOfCustom, 0, 10) as $item) {
    echo "id=" . ($item['id'] ?? 'N/A') . ", ";
    echo "name=\"" . ($item['name'] ?? 'N/A') . "\", ";
    echo "parent_id=" . ($item['parent_id'] ?? 'N/A') . "\n";
}

echo "\n</pre>";
