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
$emailFrom = $data['emailFrom'] ?? 'noreply@realtysoft.ai';
$message = $data['message'] ?? '';
$properties = $data['wishlist'] ?? [];
$ownerEmail = $data['ownerEmail'] ?? '';

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
$emailFrom = filter_var(trim($emailFrom), FILTER_SANITIZE_EMAIL) ?: 'noreply@realtysoft.ai';
$ownerEmail = $ownerEmail ? filter_var(trim($ownerEmail), FILTER_SANITIZE_EMAIL) : '';
$message = htmlspecialchars(trim($message));

// Validate email
if (!filter_var($emailTo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Build HTML email (same structure as send-inquiry.php)
$emailHtml = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .property-card { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea; }
        .property-title { margin: 0 0 10px; color: #333; }
        .property-price { color: #059669; font-size: 20px; font-weight: bold; margin: 0 0 10px; }
        .property-details { color: #666; font-size: 14px; margin: 5px 0; }
        .property-ref { color: #999; font-size: 12px; }
        .property-note { background: #fff9e6; padding: 10px; margin-top: 10px; border-left: 3px solid #f39c12; font-size: 14px; }
        .message-box { background: #f0f9ff; padding: 15px; border-left: 4px solid #3498db; border-radius: 4px; margin-bottom: 20px; }
        .view-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px; margin-top: 10px; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777; border-radius: 0 0 8px 8px; }
        a { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">Property Wishlist Shared With You</h2>
            <p style="margin:10px 0 0;opacity:0.9;">Someone shared their favorite properties</p>
        </div>
        <div class="content">';

// Add personal message if provided
if ($message) {
    $emailHtml .= '
            <div class="message-box">
                <strong>Personal Message:</strong><br>
                ' . nl2br($message) . '
            </div>';
}

$emailHtml .= '
            <h3>' . count($properties) . ' Properties Shared</h3>';

// Add each property
foreach ($properties as $property) {
    $name = htmlspecialchars($property['name'] ?? $property['title'] ?? 'Property');
    $price = number_format($property['list_price'] ?? $property['price'] ?? 0);
    $location = htmlspecialchars($property['location'] ?? 'N/A');
    $type = htmlspecialchars($property['type'] ?? 'N/A');
    $beds = $property['bedrooms'] ?? $property['beds'] ?? 0;
    $baths = $property['bathrooms'] ?? $property['baths'] ?? 0;
    $size = $property['build_size'] ?? $property['built_area'] ?? 0;
    $ref = htmlspecialchars($property['ref_no'] ?? $property['ref'] ?? '');
    $note = isset($property['note']) && $property['note'] ? htmlspecialchars($property['note']) : '';
    $propertyUrl = isset($property['propertyUrl']) ? htmlspecialchars($property['propertyUrl']) : '';

    $emailHtml .= '
            <div class="property-card">';

    // Title with link if URL available
    if ($propertyUrl) {
        $emailHtml .= '<h4 class="property-title"><a href="' . $propertyUrl . '" style="color:#333;text-decoration:none;">' . $name . '</a></h4>';
    } else {
        $emailHtml .= '<h4 class="property-title">' . $name . '</h4>';
    }

    $emailHtml .= '
                <p class="property-price">€' . $price . '</p>
                <p class="property-details">📍 ' . $location . ' | 🏠 ' . $type . '</p>
                <p class="property-details">🛏️ ' . $beds . ' beds | 🚿 ' . $baths . ' baths | 📐 ' . $size . 'm²</p>
                <p class="property-ref">Ref: ' . $ref . '</p>';

    if ($note) {
        $emailHtml .= '
                <div class="property-note"><strong>📝 Note:</strong> ' . $note . '</div>';
    }

    if ($propertyUrl) {
        $emailHtml .= '
                <a href="' . $propertyUrl . '" class="view-btn">View Property</a>';
    }

    $emailHtml .= '
            </div>';
}

$emailHtml .= '
        </div>
        <div class="footer">
            This wishlist was shared via RealtySoft Property Widget<br>
            <a href="https://realtysoft.ai">realtysoft.ai</a>
        </div>
    </div>
</body>
</html>';

// Email headers - use server domain for From to pass SPF/DKIM
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: RealtySoft <noreply@realtysoft.ai>\r\n";
$headers .= "Reply-To: $emailFrom\r\n";

// Email subject
$subject = "Property Wishlist Shared With You (" . count($properties) . " properties)";

// Send email to recipient
wishlistLog("RECIPIENT MAIL: to=$emailTo, from=noreply@realtysoft.ai, reply-to=$emailFrom, properties=" . count($properties));
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
    $senderHeaders .= "From: RealtySoft <noreply@realtysoft.ai>\r\n";
    $senderHeaders .= "Reply-To: noreply@realtysoft.ai\r\n";

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
    $ownerHeaders .= "From: RealtySoft <noreply@realtysoft.ai>\r\n";
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
