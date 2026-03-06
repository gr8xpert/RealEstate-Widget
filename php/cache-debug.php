<?php
/**
 * Cache Debug Script
 * Checks why cache isn't being served
 */

header('Content-Type: text/plain');

echo "=== Cache Debug ===\n\n";

// 1. Check cache directory
$cacheDir = __DIR__ . '/cache/';
echo "1. Cache Directory: $cacheDir\n";
echo "   Exists: " . (is_dir($cacheDir) ? 'YES' : 'NO') . "\n";
echo "   Writable: " . (is_writable($cacheDir) ? 'YES' : 'NO') . "\n\n";

// 2. List cache files
echo "2. Cache Files:\n";
$files = glob($cacheDir . '*.json');
if (empty($files)) {
    echo "   NO CACHE FILES FOUND!\n";
} else {
    foreach ($files as $file) {
        $size = round(filesize($file) / 1024, 1);
        echo "   - " . basename($file) . " ($size KB)\n";
    }
}
echo "\n";

// 3. Test cache key generation (using STRING params to match $_GET)
echo "3. Cache Key Test:\n";
$endpoint = 'v2/location';
$params = ['page' => '1', 'limit' => '1000'];  // Strings to match $_GET
$key = $endpoint . '_' . md5(serialize($params));
$key = preg_replace('/[^a-zA-Z0-9_]/', '_', $key);
echo "   Endpoint: $endpoint\n";
echo "   Params: " . json_encode($params) . " (strings to match \$_GET)\n";
echo "   Generated Key: $key\n";
echo "   Expected File: {$cacheDir}{$key}.json\n";
echo "   File Exists: " . (file_exists("{$cacheDir}{$key}.json") ? 'YES' : 'NO') . "\n\n";

// 4. Test with _lang parameter (like labels)
echo "4. Labels Cache Key Test:\n";
$endpoint2 = 'v1/plugin_labels';
$params2 = ['_lang' => 'en_US'];
$key2 = $endpoint2 . '_' . md5(serialize($params2));
$key2 = preg_replace('/[^a-zA-Z0-9_]/', '_', $key2);
echo "   Endpoint: $endpoint2\n";
echo "   Params: " . json_encode($params2) . "\n";
echo "   Generated Key: $key2\n";
echo "   File Exists: " . (file_exists("{$cacheDir}{$key2}.json") ? 'YES' : 'NO') . "\n\n";

// 5. Check what the actual request would generate
echo "5. Simulated Request Cache Key:\n";
$_GET_sim = ['_endpoint' => 'v2/location', 'page' => '1', 'limit' => '1000', '_t' => '1234567890'];
$cacheParams = $_GET_sim;
unset($cacheParams['_endpoint']);
unset($cacheParams['_t']);
unset($cacheParams['_']);
$simKey = 'v2/location' . '_' . md5(serialize($cacheParams));
$simKey = preg_replace('/[^a-zA-Z0-9_]/', '_', $simKey);
echo "   Simulated \$_GET: " . json_encode($_GET_sim) . "\n";
echo "   After cleanup: " . json_encode($cacheParams) . "\n";
echo "   Generated Key: $simKey\n";
echo "   File Exists: " . (file_exists("{$cacheDir}{$simKey}.json") ? 'YES' : 'NO') . "\n\n";

// 6. Read and show a cache file
echo "6. Sample Cache Content:\n";
if (!empty($files)) {
    $sampleFile = $files[0];
    $content = file_get_contents($sampleFile);
    $data = json_decode($content, true);
    echo "   File: " . basename($sampleFile) . "\n";
    echo "   Created: " . ($data['created'] ?? 'unknown') . "\n";
    echo "   Expires: " . date('Y-m-d H:i:s', $data['expires'] ?? 0) . "\n";
    echo "   Expired: " . (time() > ($data['expires'] ?? 0) ? 'YES' : 'NO') . "\n";
    echo "   Data preview: " . substr($data['response'] ?? '', 0, 200) . "...\n";
}

// 7. Show v2/location data structure
echo "\n7. v2/location Data Structure:\n";
$locationKey = 'v2_location_ce1f4eecd4b9940ff708c8f2fe593381';
$locationFile = $cacheDir . $locationKey . '.json';
if (file_exists($locationFile)) {
    $locContent = file_get_contents($locationFile);
    $locData = json_decode($locContent, true);
    $response = json_decode($locData['response'] ?? '{}', true);

    echo "   Total locations: " . ($response['count'] ?? count($response['data'] ?? [])) . "\n";

    if (!empty($response['data'])) {
        echo "   Sample location fields:\n";
        $sample = $response['data'][0];
        foreach ($sample as $fieldKey => $value) {
            if (is_array($value)) {
                echo "     - $fieldKey: [array with " . count($value) . " items]\n";
            } else {
                $val = is_string($value) ? substr($value, 0, 50) : $value;
                echo "     - $fieldKey: " . json_encode($val) . "\n";
            }
        }

        // Show first 5 locations with key info
        echo "\n   First 5 locations:\n";
        $count = 0;
        foreach ($response['data'] as $loc) {
            if ($count >= 5) break;
            $id = $loc['id'] ?? 'N/A';
            $name = $loc['name'] ?? 'N/A';
            $type = $loc['type'] ?? 'N/A';
            $parentId = $loc['parent_id'] ?? 'null';
            $propCount = isset($loc['property_count']) ? $loc['property_count'] : 'NOT SET';
            echo "     #{$count}: id=$id, name=\"$name\", type=$type, parent_id=$parentId, property_count=$propCount\n";
            $count++;
        }
    }
} else {
    echo "   v2/location cache file not found\n";
}

echo "\n=== End Debug ===\n";
