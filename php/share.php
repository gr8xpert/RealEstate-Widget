<?php
/**
 * RealtySoft Widget v2 - Share Handler
 * Handles social sharing redirects with proper meta tags
 */

// Get parameters
$propertyId = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
$propertyRef = isset($_GET['ref']) ? preg_replace('/[^A-Za-z0-9\-]/', '', $_GET['ref']) : '';
$platform = filter_input(INPUT_GET, 'platform', FILTER_SANITIZE_STRING);

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
$clients = file_exists($configFile) ? require $configFile : [];

// Get domain — prefer the client's domain from the url parameter
$clientUrl = isset($_GET['url']) ? $_GET['url'] : '';
$parsedClientUrl = $clientUrl ? parse_url($clientUrl) : [];
$domain = !empty($parsedClientUrl['host'])
    ? preg_replace('/^www\./', '', $parsedClientUrl['host'])
    : preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost');

// Site name from param or domain
$siteName = isset($_GET['site_name']) ? htmlspecialchars($_GET['site_name'], ENT_QUOTES, 'UTF-8') : ucfirst($domain);

// Find client config
$clientConfig = null;
foreach ($clients as $clientDomain => $config) {
    $clientDomain = preg_replace('/^www\./', '', $clientDomain);
    if ($clientDomain === $domain || $clientDomain === 'localhost') {
        $clientConfig = $config;
        break;
    }
}

if (!$clientConfig) {
    header('Location: /');
    exit;
}

// Fetch property data from API
$property = null;
$fetchId = $propertyId;
if (!$fetchId && $propertyRef && !empty($clientConfig['api_url'])) {
    // Use ref to look up property if id is not provided
    $fetchId = $propertyRef;
}
if ($fetchId && !empty($clientConfig['api_url'])) {
    $apiParam = $propertyId ? 'id=' . $propertyId : 'ref=' . urlencode($propertyRef);
    $apiUrl = rtrim($clientConfig['api_url'], '/') . '/v2/property?' . $apiParam;

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
    curl_close($ch);

    if ($response) {
        $data = json_decode($response, true);
        $property = $data['data'] ?? $data ?? null;
    }
}

// If no property found, redirect home
if (!$property) {
    header('Location: /');
    exit;
}

// Build share URL
$propertyUrl = $property['url'] ?? "https://$domain/property/$propertyId";
$title = $property['title'] ?? 'Property';
$description = $property['short_description'] ?? $property['description'] ?? '';
$image = $property['images'][0] ?? '';
$price = $property['price'] ?? '';

// If platform specified, redirect to share URL
if ($platform) {
    $encodedUrl = urlencode($propertyUrl);
    $encodedTitle = urlencode($title);
    $encodedText = urlencode("$title - $price");

    switch ($platform) {
        case 'facebook':
            header("Location: https://www.facebook.com/sharer/sharer.php?u=$encodedUrl");
            break;
        case 'twitter':
            header("Location: https://twitter.com/intent/tweet?text=$encodedText&url=$encodedUrl");
            break;
        case 'linkedin':
            header("Location: https://www.linkedin.com/sharing/share-offsite/?url=$encodedUrl");
            break;
        case 'whatsapp':
            header("Location: https://wa.me/?text=$encodedText%20$encodedUrl");
            break;
        case 'email':
            $subject = urlencode($title);
            $body = urlencode("Check out this property: $title\n\n$propertyUrl");
            header("Location: mailto:?subject=$subject&body=$body");
            break;
        default:
            header("Location: $propertyUrl");
    }
    exit;
}

// Output page with Open Graph meta tags for crawlers
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title) ?></title>

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= htmlspecialchars($title) ?>">
    <meta property="og:description" content="<?= htmlspecialchars(substr($description, 0, 200)) ?>">
    <meta property="og:url" content="<?= htmlspecialchars($propertyUrl) ?>">
    <meta property="og:site_name" content="<?= htmlspecialchars($siteName) ?>">
    <?php if ($image): ?>
    <meta property="og:image" content="<?= htmlspecialchars($image) ?>">
    <?php endif; ?>

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= htmlspecialchars($title) ?>">
    <meta name="twitter:description" content="<?= htmlspecialchars(substr($description, 0, 200)) ?>">
    <?php if ($image): ?>
    <meta name="twitter:image" content="<?= htmlspecialchars($image) ?>">
    <?php endif; ?>

    <!-- Redirect -->
    <meta http-equiv="refresh" content="0;url=<?= htmlspecialchars($propertyUrl) ?>">
</head>
<body>
    <p>Redirecting to <a href="<?= htmlspecialchars($propertyUrl) ?>"><?= htmlspecialchars($title) ?></a>...</p>
</body>
</html>
