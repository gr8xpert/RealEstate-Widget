<?php
/**
 * RealtySoft Widget v3 - Wishlist Email Handler
 * Sends wishlist to recipient AND copy to sender
 */

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('display_errors', '0');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Accept');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header('Content-Type: application/json');

// Helper: write to debug log
function wishlistLog($msg) {
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) mkdir($logDir, 0755, true);
    $entry = date('Y-m-d H:i:s') . " | $msg\n";
    file_put_contents($logDir . '/wishlist-debug.log', $entry, FILE_APPEND | LOCK_EX);
}

// Helper: adjust color brightness
function adjustBrightness($hex, $percent) {
    $hex = ltrim($hex, '#');
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));

    $r = max(0, min(255, $r + ($r * $percent / 100)));
    $g = max(0, min(255, $g + ($g * $percent / 100)));
    $b = max(0, min(255, $b + ($b * $percent / 100)));

    return sprintf('#%02x%02x%02x', $r, $g, $b);
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
wishlistLog("=== REQUEST RECEIVED (v3) === method=" . $_SERVER['REQUEST_METHOD'] . " data=" . ($data ? 'valid' : 'null'));

if (!$data) {
    wishlistLog("ERROR: Invalid request data");
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

// Get form fields
$emailTo = $data['emailTo'] ?? '';
$emailFrom = $data['emailFrom'] ?? 'noreply@smartpropertywidget.com';
$message = $data['message'] ?? '';
$properties = $data['wishlist'] ?? [];
$ownerEmail = $data['ownerEmail'] ?? '';

// Get currency info for conversion
$currencyData = $data['currency'] ?? [];
$currencySymbol = $currencyData['symbol'] ?? '€';
$currencyRate = floatval($currencyData['rate'] ?? 1);

// Get branding config
$branding = $data['branding'] ?? [];
$companyName = htmlspecialchars($branding['companyName'] ?? '');
$logoUrl = filter_var($branding['logoUrl'] ?? '', FILTER_SANITIZE_URL);
$websiteUrl = filter_var($branding['websiteUrl'] ?? '', FILTER_SANITIZE_URL);
$primaryColor = preg_match('/^#[0-9A-Fa-f]{6}$/', $branding['primaryColor'] ?? '') ? $branding['primaryColor'] : '#667eea';
// Email header color - falls back to primaryColor if not set
$emailHeaderColor = preg_match('/^#[0-9A-Fa-f]{6}$/', $branding['emailHeaderColor'] ?? '') ? $branding['emailHeaderColor'] : $primaryColor;
wishlistLog("BRANDING: primaryColor=$primaryColor, emailHeaderColor=$emailHeaderColor, received=" . ($branding['emailHeaderColor'] ?? 'not set'));

// Validate required fields
if (empty($emailTo)) {
    echo json_encode(['success' => false, 'message' => 'Recipient email is required']);
    exit;
}

if (empty($properties)) {
    echo json_encode(['success' => false, 'message' => 'No properties to share']);
    exit;
}

// Sanitize inputs
$emailTo = filter_var(trim($emailTo), FILTER_SANITIZE_EMAIL);
$emailFrom = filter_var(trim($emailFrom), FILTER_SANITIZE_EMAIL) ?: 'noreply@smartpropertywidget.com';
$ownerEmail = $ownerEmail ? filter_var(trim($ownerEmail), FILTER_SANITIZE_EMAIL) : '';
$message = htmlspecialchars(trim($message));

// Validate email
if (!filter_var($emailTo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Build HTML email with table-based layout for Outlook/Gmail compatibility
// Using only inline styles and bgcolor attributes - no CSS classes
$emailHtml = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        td { padding: 0; }
    </style>
    <![endif]-->
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333333;background-color:#f4f4f4;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4;">
        <tr>
            <td align="center" style="padding:20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;">
                    <!-- Header -->
                    <tr>
                        <td bgcolor="' . $emailHeaderColor . '" style="background-color:' . $emailHeaderColor . ';padding:30px 20px;text-align:center;">
                            ' . ($logoUrl ? '<img src="' . $logoUrl . '" alt="' . $companyName . '" style="max-width:180px;max-height:60px;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;">' : '') . '
                            ' . ($companyName ? '<p style="margin:0 0 5px;font-size:14px;color:#ffffff;">' . $companyName . '</p>' : '') . '
                            <h2 style="margin:0;color:#ffffff;font-size:24px;font-family:Arial,sans-serif;">Property Wishlist Shared With You</h2>
                            <p style="margin:10px 0 0;color:#ffffff;font-size:14px;">Someone shared their favorite properties</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td bgcolor="#f9f9f9" style="background-color:#f9f9f9;padding:20px;">';

// Add personal message if provided
if ($message) {
    $emailHtml .= '
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
                                <tr>
                                    <td style="background-color:#fff9e6;padding:15px;border-left:4px solid #f39c12;font-family:Arial,sans-serif;">
                                        <strong style="color:#333;">Personal Message:</strong><br>
                                        <span style="color:#555;">' . nl2br($message) . '</span>
                                    </td>
                                </tr>
                            </table>';
}

$emailHtml .= '
                            <h3 style="margin:0 0 15px;font-size:18px;color:#333;font-family:Arial,sans-serif;">' . count($properties) . ' Properties Shared</h3>';

// Add each property using table layout
foreach ($properties as $property) {
    $name = htmlspecialchars($property['name'] ?? $property['title'] ?? 'Property');
    // Apply currency conversion
    $rawPrice = floatval($property['list_price'] ?? $property['price'] ?? 0);
    $convertedPrice = round($rawPrice * $currencyRate);
    $price = number_format($convertedPrice);
    $location = htmlspecialchars($property['location'] ?? 'N/A');
    $type = htmlspecialchars($property['type'] ?? 'N/A');
    $beds = $property['bedrooms'] ?? $property['beds'] ?? 0;
    $baths = $property['bathrooms'] ?? $property['baths'] ?? 0;
    $size = $property['build_size'] ?? $property['built_area'] ?? 0;
    $ref = htmlspecialchars($property['ref_no'] ?? $property['ref'] ?? '');
    $note = isset($property['note']) && $property['note'] ? htmlspecialchars($property['note']) : '';
    $propertyUrl = isset($property['propertyUrl']) ? htmlspecialchars($property['propertyUrl']) : '';

    $emailHtml .= '
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:15px;border:1px solid #e0e0e0;">
                                <tr>
                                    <td bgcolor="#ffffff" style="background-color:#ffffff;padding:15px;border-left:4px solid ' . $primaryColor . ';">';

    // Title with link if URL available
    if ($propertyUrl) {
        $emailHtml .= '
                                        <h4 style="margin:0 0 8px;font-size:16px;font-family:Arial,sans-serif;"><a href="' . $propertyUrl . '" style="color:#333333;text-decoration:none;">' . $name . '</a></h4>';
    } else {
        $emailHtml .= '
                                        <h4 style="margin:0 0 8px;font-size:16px;color:#333333;font-family:Arial,sans-serif;">' . $name . '</h4>';
    }

    $emailHtml .= '
                                        <p style="margin:0 0 8px;font-size:18px;color:' . $primaryColor . ';font-weight:bold;font-family:Arial,sans-serif;">' . htmlspecialchars($currencySymbol) . ' ' . $price . '</p>
                                        <p style="margin:0 0 5px;font-size:13px;color:#666666;font-family:Arial,sans-serif;">&#128205; ' . $location . ' | &#127968; ' . $type . '</p>
                                        <p style="margin:0 0 5px;font-size:13px;color:#666666;font-family:Arial,sans-serif;">&#128716; ' . $beds . ' beds | &#128703; ' . $baths . ' baths | &#128208; ' . $size . 'm&sup2;</p>
                                        <p style="margin:0 0 8px;font-size:11px;color:#999999;font-family:Arial,sans-serif;">Ref: ' . $ref . '</p>';

    if ($note) {
        $emailHtml .= '
                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0;">
                                            <tr>
                                                <td style="background-color:#f0f8ff;padding:10px;border-left:3px solid #3498db;font-size:13px;color:#555;font-family:Arial,sans-serif;">
                                                    <strong>&#128221; Note:</strong> ' . $note . '
                                                </td>
                                            </tr>
                                        </table>';
    }

    if ($propertyUrl) {
        $emailHtml .= '
                                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                                            <tr>
                                                <td bgcolor="' . $primaryColor . '" style="background-color:' . $primaryColor . ';border-radius:5px;">
                                                    <a href="' . $propertyUrl . '" style="display:inline-block;padding:10px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;">View Property</a>
                                                </td>
                                            </tr>
                                        </table>';
    }

    $emailHtml .= '
                                    </td>
                                </tr>
                            </table>';
}

$emailHtml .= '
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td bgcolor="#f0f0f0" style="background-color:#f0f0f0;padding:20px;text-align:center;font-size:12px;color:#777777;font-family:Arial,sans-serif;">
                            ' . ($companyName ? 'This wishlist was shared via ' . $companyName : 'This wishlist was shared via RealtySoft Property Widget') . '<br>
                            ' . ($websiteUrl ? '<a href="' . $websiteUrl . '" style="color:' . $primaryColor . ';">' . preg_replace('/^https?:\/\//', '', $websiteUrl) . '</a>' : '<a href="https://realtysoft.ai" style="color:' . $primaryColor . ';">realtysoft.ai</a>') . '
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';

// Email headers - use server domain for From to pass SPF/DKIM
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Smart Property Widget <noreply@smartpropertywidget.com>\r\n";
$headers .= "Reply-To: $emailFrom\r\n";

// Email subject
$subject = "Property Wishlist Shared With You (" . count($properties) . " properties)";

// Send email to recipient
wishlistLog("RECIPIENT MAIL: to=$emailTo, from=noreply@smartpropertywidget.com, reply-to=$emailFrom, properties=" . count($properties));
$success = mail($emailTo, $subject, $emailHtml, $headers);
wishlistLog("RECIPIENT MAIL RESULT: " . ($success ? 'TRUE' : 'FALSE'));
if (!$success) {
    wishlistLog("RECIPIENT MAIL ERROR: " . (error_get_last()['message'] ?? 'unknown'));
}

// Send copy to sender (the person who shared the wishlist)
$senderCopySent = false;
wishlistLog("SENDER CHECK: emailFrom=$emailFrom, valid=" . (filter_var($emailFrom, FILTER_VALIDATE_EMAIL) ? 'yes' : 'no') . ", sameAsTo=" . ($emailFrom === $emailTo ? 'yes' : 'no'));
if ($success && !empty($emailFrom) && filter_var($emailFrom, FILTER_VALIDATE_EMAIL) && $emailFrom !== $emailTo) {
    $senderSubject = "Your Shared Wishlist (" . count($properties) . " properties)";

    $senderHeaders = "MIME-Version: 1.0\r\n";
    $senderHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
    $senderHeaders .= "From: Smart Property Widget <noreply@smartpropertywidget.com>\r\n";
    $senderHeaders .= "Reply-To: noreply@smartpropertywidget.com\r\n";

    // Replace header text for the sender copy
    $senderHtml = str_replace(
        ['Property Wishlist Shared With You', 'Someone shared their favorite properties'],
        ['Your Shared Property Wishlist', 'A copy of the wishlist you shared with ' . htmlspecialchars($emailTo)],
        $emailHtml
    );

    wishlistLog("SENDER MAIL: to=$emailFrom, subject=$senderSubject");
    $senderCopySent = mail($emailFrom, $senderSubject, $senderHtml, $senderHeaders);
    wishlistLog("SENDER MAIL RESULT: " . ($senderCopySent ? 'TRUE' : 'FALSE'));
    if (!$senderCopySent) {
        wishlistLog("SENDER MAIL ERROR: " . (error_get_last()['message'] ?? 'unknown'));
    }
}

// Send notification to owner
$ownerCopySent = false;
if ($success && !empty($ownerEmail) && filter_var($ownerEmail, FILTER_VALIDATE_EMAIL) && $ownerEmail !== $emailTo) {
    $ownerSubject = "Wishlist Shared by Client (" . count($properties) . " properties)";

    $ownerHeaders = "MIME-Version: 1.0\r\n";
    $ownerHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
    $ownerHeaders .= "From: Smart Property Widget <noreply@smartpropertywidget.com>\r\n";
    $ownerHeaders .= "Reply-To: $emailFrom\r\n";

    // Replace header text for the owner copy
    $ownerHtml = str_replace(
        ['Property Wishlist Shared With You', 'Someone shared their favorite properties'],
        ['Client Wishlist Notification', 'A client (' . htmlspecialchars($emailTo) . ') shared a wishlist'],
        $emailHtml
    );

    wishlistLog("OWNER MAIL: to=$ownerEmail, subject=$ownerSubject");
    $ownerCopySent = mail($ownerEmail, $ownerSubject, $ownerHtml, $ownerHeaders);
    wishlistLog("OWNER MAIL RESULT: " . ($ownerCopySent ? 'TRUE' : 'FALSE'));
    if (!$ownerCopySent) {
        wishlistLog("OWNER MAIL ERROR: " . (error_get_last()['message'] ?? 'unknown'));
    }
}

// Log
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
$senderStatus = $senderCopySent ? 'copy_sent' : 'no_copy';
$ownerStatus = $ownerCopySent ? 'owner_sent' : 'no_owner';
$logEntry = date('Y-m-d H:i:s') . " | TO: $emailTo | FROM: $emailFrom | OWNER: $ownerEmail | Properties: " . count($properties) . " | " . ($success ? 'sent' : 'failed') . " | $senderStatus | $ownerStatus\n";
file_put_contents($logDir . '/wishlist-emails.log', $logEntry, FILE_APPEND | LOCK_EX);

// Response
echo json_encode([
    'success' => $success,
    'message' => $success ? 'Email sent successfully!' : 'Failed to send email. Please try again.'
]);
?>
