<?php
/**
 * Check if api-proxy.php has dashboard routing
 */

$token = 'spwcheck2026';
if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    die('Access denied. Use ?token=' . $token);
}

echo "<pre style='font-family: monospace; background: #1e1e1e; color: #0f0; padding: 20px;'>";
echo "=== Checking api-proxy.php Version ===\n\n";

$proxyFile = __DIR__ . '/api-proxy.php';

if (!file_exists($proxyFile)) {
    echo "ERROR: api-proxy.php not found!\n";
    exit;
}

$content = file_get_contents($proxyFile);
$fileSize = strlen($content);
$fileModified = date('Y-m-d H:i:s', filemtime($proxyFile));

echo "File: api-proxy.php\n";
echo "Size: {$fileSize} bytes\n";
echo "Last Modified: {$fileModified}\n\n";

echo "=== Checking for Dashboard Routing Code ===\n\n";

// Check for locations routing
$hasLocationsRouting = strpos($content, "ROUTE LOCATIONS TO DASHBOARD API") !== false;
echo "1. Locations routing to dashboard: " . ($hasLocationsRouting ? "YES ✓" : "NO ✗") . "\n";

// Check for property types routing
$hasPropertyTypesRouting = strpos($content, "ROUTE PROPERTY TYPES TO DASHBOARD API") !== false;
echo "2. Property types routing to dashboard: " . ($hasPropertyTypesRouting ? "YES ✓" : "NO ✗") . "\n";

// Check for features routing
$hasFeaturesRouting = strpos($content, "ROUTE FEATURES TO DASHBOARD API") !== false;
echo "3. Features routing to dashboard: " . ($hasFeaturesRouting ? "YES ✓" : "NO ✗") . "\n";

// Check for dashboard URL
$hasDashboardUrl = strpos($content, "/api/v1/widget/locations") !== false;
echo "4. Has dashboard locations URL: " . ($hasDashboardUrl ? "YES ✓" : "NO ✗") . "\n";

// Check for per-domain cache
$hasPerDomainCache = strpos($content, "perDomainEndpoints") !== false;
echo "5. Has per-domain cache keys: " . ($hasPerDomainCache ? "YES ✓" : "NO ✗") . "\n";

echo "\n";

if ($hasLocationsRouting && $hasPropertyTypesRouting && $hasFeaturesRouting) {
    echo "=== STATUS: UPDATED VERSION DEPLOYED ✓ ===\n";
} else {
    echo "=== STATUS: OLD VERSION - NEEDS UPDATE ===\n";
    echo "\nYou need to upload the updated api-proxy.php from:\n";
    echo "C:\\Users\\shahzaib\\RealtysoftV3\\php\\api-proxy.php\n";
    echo "\nTo: smartpropertywidget.com/spw/php/api-proxy.php\n";
}

echo "\n<span style='color:#ff0;'>DELETE THIS FILE AFTER USE!</span>\n";
echo "</pre>";
