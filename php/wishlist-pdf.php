<?php
/**
 * RealtySoft Widget v2 - Wishlist PDF Generator
 * Generates a PDF of wishlist properties
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get property IDs (can be ref_no strings like R5285977 or numeric IDs)
$ids = isset($_GET['ids']) ? $_GET['ids'] : '';
$refNos = array_filter(array_map('trim', explode(',', $ids)), function($id) {
    return !empty($id);
});

if (empty($refNos)) {
    http_response_code(400);
    die('No property IDs provided');
}

// Load client configuration
$configFile = __DIR__ . '/../config/clients.php';
$clients = file_exists($configFile) ? require $configFile : [];

// Get domain
$origin = $_SERVER['HTTP_REFERER'] ?? '';
$domain = parse_url($origin, PHP_URL_HOST) ?? $_SERVER['HTTP_HOST'] ?? 'localhost';
$domain = preg_replace('/^www\./', '', $domain);

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
    http_response_code(403);
    die('Domain not authorized');
}

// Fetch properties from API - use ref_no format
$apiUrl = rtrim($clientConfig['api_url'], '/') . '/v1/property?ref_no=' . implode(',', array_map('urlencode', $refNos));

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $clientConfig['api_key'],
        'Accept: application/json'
    ]
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$properties = $data['data'] ?? [];

if (empty($properties)) {
    http_response_code(404);
    die('No properties found');
}

// Generate HTML for PDF
$html = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Wishlist</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
        }
        .property {
            page-break-inside: avoid;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .property-image {
            width: 200px;
            height: 150px;
            object-fit: cover;
            float: left;
            margin-right: 20px;
        }
        .property-content {
            overflow: hidden;
        }
        .property-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 5px;
        }
        .property-price {
            font-size: 18px;
            color: #0066cc;
            margin: 0 0 10px;
        }
        .property-location {
            color: #666;
            margin: 0 0 10px;
        }
        .property-specs {
            margin: 0 0 10px;
        }
        .property-specs span {
            margin-right: 15px;
        }
        .property-ref {
            color: #999;
            font-size: 11px;
        }
        .property-url {
            color: #0066cc;
            font-size: 11px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #999;
            font-size: 10px;
        }
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>My Property Wishlist</h1>
        <p>Generated on ' . date('F j, Y') . '</p>
    </div>
';

foreach ($properties as $property) {
    // Handle image - can be array of objects or strings
    $image = '';
    if (!empty($property['images']) && is_array($property['images'])) {
        $firstImg = $property['images'][0];
        $image = is_array($firstImg) ? ($firstImg['image_256'] ?? $firstImg['src'] ?? '') : $firstImg;
    }
    $title = htmlspecialchars($property['name'] ?? $property['title'] ?? '');
    $price = number_format($property['list_price'] ?? $property['price'] ?? 0);
    $location = htmlspecialchars(is_array($property['location_id'] ?? null) ? ($property['location_id']['name'] ?? '') : ($property['location'] ?? ''));
    $beds = $property['bedrooms'] ?? $property['beds'] ?? '';
    $baths = $property['bathrooms'] ?? $property['baths'] ?? '';
    $built = $property['build_size'] ?? $property['built_area'] ?? '';
    $ref = htmlspecialchars($property['ref_no'] ?? $property['ref'] ?? '');
    $url = $property['url'] ?? '';

    $html .= '
    <div class="property clearfix">
        ' . ($image ? '<img src="' . $image . '" alt="" class="property-image">' : '') . '
        <div class="property-content">
            <h2 class="property-title">' . $title . '</h2>
            <p class="property-price">&euro;' . $price . '</p>
            <p class="property-location">' . $location . '</p>
            <p class="property-specs">
                ' . ($beds ? "<span>{$beds} beds</span>" : '') . '
                ' . ($baths ? "<span>{$baths} baths</span>" : '') . '
                ' . ($built ? "<span>{$built} m&sup2;</span>" : '') . '
            </p>
            <p class="property-ref">Ref: ' . $ref . '</p>
            ' . ($url ? '<p class="property-url">' . $url . '</p>' : '') . '
        </div>
    </div>
    ';
}

$html .= '
    <div class="footer">
        <p>Generated by RealtySoft Widget</p>
    </div>
</body>
</html>
';

// Check if we have a PDF library available
// Option 1: Use TCPDF if available
if (class_exists('TCPDF')) {
    $pdf = new TCPDF();
    $pdf->SetCreator('RealtySoft');
    $pdf->SetTitle('My Wishlist');
    $pdf->AddPage();
    $pdf->writeHTML($html, true, false, true, false, '');

    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="wishlist.pdf"');
    $pdf->Output('wishlist.pdf', 'D');
    exit;
}

// Option 2: Use wkhtmltopdf if available
$wkhtmltopdf = '/usr/local/bin/wkhtmltopdf';
if (file_exists($wkhtmltopdf)) {
    $tempHtml = tempnam(sys_get_temp_dir(), 'wishlist_') . '.html';
    $tempPdf = tempnam(sys_get_temp_dir(), 'wishlist_') . '.pdf';

    file_put_contents($tempHtml, $html);
    exec("$wkhtmltopdf '$tempHtml' '$tempPdf' 2>&1", $output, $result);

    if ($result === 0 && file_exists($tempPdf)) {
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="wishlist.pdf"');
        readfile($tempPdf);

        unlink($tempHtml);
        unlink($tempPdf);
        exit;
    }

    unlink($tempHtml);
    @unlink($tempPdf);
}

// Fallback: Output HTML for printing
header('Content-Type: text/html; charset=UTF-8');
echo $html;
echo '<script>window.print();</script>';
