<?php
/**
 * RealtySoft Widget v3 - AI Search Endpoint
 * Natural language property search powered by OpenRouter API
 * Premium feature - requires ai_search_enabled in client config
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Configuration file not found']);
    exit;
}

$clients = require $configFile;

// Get requesting domain
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$domain = parse_url($origin, PHP_URL_HOST);

// Fallback to server's own domain if no origin/referer (same-origin request)
if (!$domain) {
    $domain = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
    // Remove port if present
    $domain = preg_replace('/:\d+$/', '', $domain);
}

$domain = preg_replace('/^www\./', '', $domain);

// Find client config
$clientConfig = null;
foreach ($clients as $clientDomain => $config) {
    $clientDomain = preg_replace('/^www\./', '', $clientDomain);
    if ($clientDomain === $domain) {
        $clientConfig = $config;
        break;
    }
}

// Fallback to localhost for dev
if (!$clientConfig && $domain === 'localhost' && isset($clients['localhost'])) {
    $clientConfig = $clients['localhost'];
}

// Validate client
if (!$clientConfig || !$clientConfig['enabled']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Domain not authorized']);
    exit;
}

// ============================================
// ENDPOINT: Check AI Search availability
// ============================================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'check') {
    $enabled = isset($clientConfig['ai_search_enabled']) && $clientConfig['ai_search_enabled'] === true;
    echo json_encode(['enabled' => $enabled]);
    exit;
}

// ============================================
// ENDPOINT: Parse natural language query
// ============================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Premium check
    if (!isset($clientConfig['ai_search_enabled']) || !$clientConfig['ai_search_enabled']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'AI search is a premium feature']);
        exit;
    }

    // Get API key
    $apiKey = $clientConfig['openrouter_api_key'] ?? null;
    if (!$apiKey || $apiKey === 'sk-or-v1-xxxxx') {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'OpenRouter API key not configured']);
        exit;
    }

    // Parse request body
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['query'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing query parameter']);
        exit;
    }

    $query = trim($input['query']);
    $language = $input['language'] ?? 'en_US';
    $locations = $input['locations'] ?? [];
    $propertyTypes = $input['propertyTypes'] ?? [];
    $features = $input['features'] ?? [];
    $debug = isset($input['debug']) && $input['debug'] === true;
    $model = $clientConfig['openrouter_model'] ?? 'openai/gpt-4o-mini';

    // Build system prompt with context
    $systemPrompt = buildSystemPrompt($language, $locations, $propertyTypes, $features);

    // Debug mode - return prompt without calling API
    if ($debug) {
        echo json_encode([
            'debug' => true,
            'query' => $query,
            'locationsCount' => count($locations),
            'propertyTypesCount' => count($propertyTypes),
            'featuresCount' => count($features),
            'systemPrompt' => $systemPrompt,
            'sampleLocation' => !empty($locations) ? $locations[0] : null,
            'samplePropertyType' => !empty($propertyTypes) ? $propertyTypes[0] : null
        ]);
        exit;
    }

    // Call OpenRouter API
    $result = callOpenRouter($apiKey, $model, $systemPrompt, $query);

    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'filters' => $result['filters'],
            'interpretation' => $result['interpretation'] ?? null
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $result['error']]);
    }
    exit;
}

// Invalid request
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid request']);
exit;

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildSystemPrompt($language, $locations, $propertyTypes, $features) {
    // Build location list for context - handle various API response formats
    $locationList = '';
    if (!empty($locations)) {
        $locationItems = [];
        foreach ($locations as $loc) {
            // Try different possible key names
            $id = $loc['id'] ?? $loc['location_id'] ?? $loc['ID'] ?? null;
            $name = $loc['name'] ?? $loc['location_name'] ?? $loc['title'] ?? $loc['label'] ?? null;
            if ($id && $name) {
                $locationItems[] = "{$id}: {$name}";
            }
        }
        if (!empty($locationItems)) {
            $locationList = "LOCATIONS (ID: Name):\n" . implode("\n", array_slice($locationItems, 0, 100));
        }
    }

    // Build property type list - handle various API response formats
    $typeList = '';
    if (!empty($propertyTypes)) {
        $typeItems = [];
        foreach ($propertyTypes as $type) {
            $id = $type['id'] ?? $type['property_type_id'] ?? $type['ID'] ?? $type['type_id'] ?? null;
            $name = $type['name'] ?? $type['property_type_name'] ?? $type['title'] ?? $type['label'] ?? null;
            if ($id && $name) {
                $typeItems[] = "{$id}: {$name}";
            }
        }
        if (!empty($typeItems)) {
            $typeList = "PROPERTY TYPES (ID: Name):\n" . implode("\n", $typeItems);
        }
    }

    // Build features list - handle various API response formats
    $featureList = '';
    if (!empty($features)) {
        $featureItems = [];
        foreach ($features as $feat) {
            $id = $feat['id'] ?? $feat['feature_id'] ?? $feat['ID'] ?? null;
            $name = $feat['name'] ?? $feat['feature_name'] ?? $feat['title'] ?? $feat['label'] ?? null;
            $category = $feat['category'] ?? '';
            if ($id && $name) {
                // Include category for context: "52: Garden (Views)" or "56: Private (Garden)"
                $featureItems[] = $category ? "{$id}: {$name} ({$category})" : "{$id}: {$name}";
            }
        }
        if (!empty($featureItems)) {
            $featureList = "FEATURES (ID: Name (Category)):\n" . implode("\n", array_slice($featureItems, 0, 100));
        }
    }

    $langName = $language === 'es_ES' ? 'Spanish' : ($language === 'de_DE' ? 'German' : 'English');

    return <<<PROMPT
You are a real estate search filter parser. Convert natural language property searches into structured filters.

{$locationList}

{$typeList}

{$featureList}

PARSING RULES:
- Location: Find the best matching location from the list above and return its ID number
- Property type: Match "villa", "apartment", "penthouse", "townhouse", etc. to the list above and return the ID
- Price: Convert "500k" to 500000, "1.5m" to 1500000. "under X" = priceMax, "over X" = priceMin, "X-Y" = both
- Bedrooms: "3 bed", "3 bedroom", "3br" = bedsMin: 3
- Bathrooms: "2 bath", "2 bathroom" = bathsMin: 2
- Listing type: "rental"/"rent" = "long_rental", "sale"/"buy" = "resale", "new build" = "new_development"
- Features: Match "pool", "garden", "sea view", "garage", etc. to feature IDs from the list
- Built area: "100m2 built", "100 sqm" = builtMin or builtMax
- Plot size: "500m2 plot", "plot 500" = plotMin or plotMax

The user searches in {$langName}. Extract ALL mentioned criteria.

RESPOND WITH JSON ONLY:
{
  "filters": {
    "location": null,
    "propertyType": null,
    "listingType": null,
    "bedsMin": null,
    "bathsMin": null,
    "priceMin": null,
    "priceMax": null,
    "builtMin": null,
    "builtMax": null,
    "plotMin": null,
    "plotMax": null,
    "features": []
  },
  "interpretation": "Brief description of understood search"
}

Set values to null if not mentioned. Features should be an array of IDs (integers).
PROMPT;
}

function callOpenRouter($apiKey, $model, $systemPrompt, $userQuery) {
    $url = 'https://openrouter.ai/api/v1/chat/completions';

    $payload = [
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => "Parse this property search: \"{$userQuery}\""]
        ],
        'temperature' => 0.1,
        'max_tokens' => 500
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
            'HTTP-Referer: https://realtysoft.eu',
            'X-Title: RealtySoft AI Search'
        ],
        CURLOPT_TIMEOUT => 30
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['success' => false, 'error' => 'API request failed: ' . $error];
    }

    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $errorMsg = $errorData['error']['message'] ?? "HTTP {$httpCode}";
        return ['success' => false, 'error' => 'API error: ' . $errorMsg];
    }

    $data = json_decode($response, true);
    if (!$data || !isset($data['choices'][0]['message']['content'])) {
        return ['success' => false, 'error' => 'Invalid API response'];
    }

    $content = $data['choices'][0]['message']['content'];

    // Try to extract JSON from the response (handle markdown code blocks)
    if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $content, $matches)) {
        $content = trim($matches[1]);
    }

    $parsed = json_decode($content, true);

    if (!$parsed || !isset($parsed['filters'])) {
        return ['success' => false, 'error' => 'Could not parse AI response: ' . substr($content, 0, 200)];
    }

    return [
        'success' => true,
        'filters' => $parsed['filters'],
        'interpretation' => $parsed['interpretation'] ?? null
    ];
}
