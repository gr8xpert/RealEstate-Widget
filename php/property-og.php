<?php
/**
 * RealtySoft - Property OG Data Endpoint
 *
 * Returns property data as JSON for server-side OG tag injection.
 * Called by the WordPress plugin to generate Open Graph meta tags
 * without exposing API credentials to clients.
 *
 * Usage: POST property-og.php with JSON body {"ref":"R5256556","domain":"client-site.com"}
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: public, max-age=3600'); // Cache 1 hour

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Read from POST body — try JSON first, then form-encoded, then GET as last resort
$rawBody = file_get_contents('php://input');

// Strip UTF-8 BOM and whitespace that can break json_decode
$cleanBody = trim($rawBody);
$cleanBody = ltrim($cleanBody, "\xEF\xBB\xBF");
$input = json_decode($cleanBody, true);
$jsonError = json_last_error();

if (!empty($input['ref'])) {
    // JSON body
    $ref = preg_replace('/[^A-Za-z0-9\-]/', '', $input['ref']);
    $domain = isset($input['domain']) ? preg_replace('/[^a-zA-Z0-9.\-]/', '', $input['domain']) : '';
} elseif (!empty($_POST['ref'])) {
    // Form-encoded POST
    $ref = preg_replace('/[^A-Za-z0-9\-]/', '', $_POST['ref']);
    $domain = isset($_POST['domain']) ? preg_replace('/[^a-zA-Z0-9.\-]/', '', $_POST['domain']) : '';
} elseif (!empty($_GET['ref'])) {
    // GET fallback (for simple testing)
    $ref = preg_replace('/[^A-Za-z0-9\-]/', '', $_GET['ref']);
    $domain = isset($_GET['domain']) ? preg_replace('/[^a-zA-Z0-9.\-]/', '', $_GET['domain']) : '';
} else {
    $ref = '';
    $domain = '';
}

if (empty($ref) || empty($domain)) {
    http_response_code(400);
    echo json_encode([
        'error'       => 'Missing ref or domain',
        'method'      => $_SERVER['REQUEST_METHOD'],
        'body_length' => strlen($rawBody),
        'json_error'  => $jsonError,
        'body_preview'=> substr($rawBody, 0, 120),
        'parsed_ref'  => $ref,
        'parsed_domain' => $domain,
    ]);
    exit;
}

// Strip www prefix for matching
$domain = preg_replace('/^www\./', '', $domain);

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
$clients = file_exists($configFile) ? require $configFile : [];

// Find client config by domain
$clientConfig = null;
foreach ($clients as $clientDomain => $config) {
    $normalised = preg_replace('/^www\./', '', $clientDomain);
    if ($normalised === $domain) {
        $clientConfig = $config;
        break;
    }
}

if (!$clientConfig || empty($clientConfig['api_url']) || empty($clientConfig['api_key'])) {
    http_response_code(404);
    echo json_encode(['error' => 'Client not found']);
    exit;
}

// Fetch property from API
$apiUrl = rtrim($clientConfig['api_url'], '/') . '/v2/property?ref=' . urlencode($ref);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $clientConfig['api_key'],
        'Accept: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$response || $httpCode !== 200) {
    http_response_code(502);
    echo json_encode(['error' => 'API request failed']);
    exit;
}

$data = json_decode($response, true);
$property = $data['data'] ?? null;

if (!$property) {
    http_response_code(404);
    echo json_encode(['error' => 'Property not found']);
    exit;
}

// Extract OG-relevant fields
$title = $property['title'] ?? '';
$description = $property['description'] ?? $property['short_description'] ?? '';
$description = strip_tags($description);
if (mb_strlen($description) > 200) {
    $description = mb_substr($description, 0, 200) . '...';
}

// Get main image (handle both string and object formats)
$image = '';
if (!empty($property['images'][0])) {
    $img = $property['images'][0];
    if (is_string($img)) {
        $image = $img;
    } elseif (is_array($img)) {
        $image = $img['image_1024'] ?? $img['image_512'] ?? $img['src'] ?? '';
    }
}

// Price
$price = '';
if (!empty($property['price_formatted'])) {
    $price = $property['price_formatted'];
} elseif (!empty($property['price']) && empty($property['price_on_request'])) {
    $price = '€' . number_format((float)$property['price'], 0, ',', '.');
} elseif (!empty($property['price_on_request'])) {
    $price = 'Price on Request';
}

$location = $property['location'] ?? '';
$siteName = $clientConfig['site_name'] ?? ucfirst($domain);

echo json_encode([
    'title'       => $title,
    'description' => $description,
    'image'       => $image,
    'price'       => $price,
    'location'    => $location,
    'site_name'   => $siteName,
    'ref'         => $ref,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
