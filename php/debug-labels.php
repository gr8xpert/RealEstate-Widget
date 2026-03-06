<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

echo "=== DEBUG LABELS TEST ===\n\n";

// Check config files
$localConfig = __DIR__ . '/config/database.local.php';
$defaultConfig = __DIR__ . '/config/database.php';

echo "Looking for config at: $localConfig\n";
echo "Local config exists: " . (file_exists($localConfig) ? 'YES' : 'NO') . "\n";
echo "Default config exists: " . (file_exists($defaultConfig) ? 'YES' : 'NO') . "\n\n";

$dbConfigFile = file_exists($localConfig) ? $localConfig : $defaultConfig;
echo "Using config: $dbConfigFile\n\n";

if (file_exists($dbConfigFile)) {
    $dbConfig = require $dbConfigFile;
    $laravelApi = $dbConfig['laravel_api'] ?? [];

    echo "base_url: " . ($laravelApi['base_url'] ?? 'NOT SET') . "\n";
    echo "api_key_set: " . (!empty($laravelApi['internal_api_key']) ? 'YES' : 'NO') . "\n\n";

    if (!empty($laravelApi['base_url']) && !empty($laravelApi['internal_api_key'])) {
        $domain = $_GET['domain'] ?? 'test.com';
        $language = $_GET['language'] ?? 'en_US';

        $dashboardUrl = rtrim($laravelApi['base_url'], '/') . '/api/internal/labels';
        $dashboardUrl .= '?domain=' . urlencode($domain) . '&language=' . urlencode($language);

        echo "Calling: $dashboardUrl\n\n";

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

        echo "HTTP Code: $httpCode\n";
        echo "cURL Error: " . ($error ?: 'none') . "\n\n";
        echo "Response:\n";
        echo $response;

        if ($response) {
            $decoded = json_decode($response, true);
            echo "\n\n=== enabledListingTypes ===\n";
            print_r($decoded['enabledListingTypes'] ?? 'NOT FOUND');
        }
    } else {
        echo "ERROR: Laravel API not configured\n";
    }
} else {
    echo "ERROR: No config file found\n";
}
