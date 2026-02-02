<?php
/**
 * RealtySoft Widget v3 - Inquiry Handler
 * Sends property inquiry emails to owner AND confirmation to client
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
function inquiryLog($msg) {
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) mkdir($logDir, 0755, true);
    $entry = date('Y-m-d H:i:s') . " | $msg\n";
    file_put_contents($logDir . '/inquiry-debug.log', $entry, FILE_APPEND | LOCK_EX);
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
inquiryLog("=== REQUEST RECEIVED (v3) === method=" . $_SERVER['REQUEST_METHOD'] . " data=" . ($data ? 'valid' : 'null'));

if (!$data) {
    inquiryLog("ERROR: Invalid request data");
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

// Support both old (camelCase) and new (snake_case) field names
$firstName = $data['firstName'] ?? $data['first_name'] ?? '';
$lastName = $data['lastName'] ?? $data['last_name'] ?? '';
$name = $data['name'] ?? trim("$firstName $lastName");
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$countryCode = $data['countryCode'] ?? $data['country_code'] ?? '';
$message = $data['message'] ?? '';
$propertyUrl = $data['propertyUrl'] ?? $data['property_url'] ?? '';
$propertyRef = $data['propertyRef'] ?? $data['property_ref'] ?? '';
$propertyTitle = $data['propertyTitle'] ?? $data['property_title'] ?? 'Property';
$propertyPrice = $data['propertyPrice'] ?? $data['property_price'] ?? '';
$propertyId = $data['propertyId'] ?? $data['property_id'] ?? '';

// Get branding config
$branding = $data['branding'] ?? [];
$companyName = htmlspecialchars($branding['companyName'] ?? '');
$logoUrl = filter_var($branding['logoUrl'] ?? '', FILTER_SANITIZE_URL);
$websiteUrl = filter_var($branding['websiteUrl'] ?? '', FILTER_SANITIZE_URL);
$primaryColor = preg_match('/^#[0-9A-Fa-f]{6}$/', $branding['primaryColor'] ?? '') ? $branding['primaryColor'] : '#667eea';
// Email header color - falls back to primaryColor if not set
$emailHeaderColor = preg_match('/^#[0-9A-Fa-f]{6}$/', $branding['emailHeaderColor'] ?? '') ? $branding['emailHeaderColor'] : $primaryColor;

// Get owner email - check multiple sources
$ownerEmail = $data['ownerEmail'] ?? $data['owner_email'] ?? null;
inquiryLog("OWNER EMAIL FROM REQUEST: " . ($ownerEmail ?: '(empty)'));

// If no owner email provided, try to get from config
if (!$ownerEmail) {
    $configFile = __DIR__ . '/../config/clients.php';
    if (file_exists($configFile)) {
        $clients = require $configFile;
        $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
        $domain = parse_url($origin, PHP_URL_HOST) ?? 'localhost';
        $domain = preg_replace('/^www\./', '', $domain);

        foreach ($clients as $clientDomain => $config) {
            $clientDomain = preg_replace('/^www\./', '', $clientDomain);
            if ($clientDomain === $domain || $clientDomain === 'localhost') {
                $ownerEmail = $config['owner_email'] ?? null;
                inquiryLog("OWNER EMAIL FROM FALLBACK CONFIG: " . ($ownerEmail ?: '(empty)') . " for domain: $domain");
                break;
            }
        }
    }
}

inquiryLog("FINAL OWNER EMAIL BEING USED: " . ($ownerEmail ?: '(empty)'));

// Validate required fields
if (empty($name) && empty($firstName)) {
    echo json_encode(['success' => false, 'message' => 'Name is required']);
    exit;
}

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

if (empty($ownerEmail)) {
    echo json_encode(['success' => false, 'message' => 'Owner email not configured']);
    exit;
}

// Sanitize inputs
$firstName = htmlspecialchars(trim($firstName));
$lastName = htmlspecialchars(trim($lastName));
$name = htmlspecialchars(trim($name));
$email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars(trim($phone));
$message = htmlspecialchars(trim($message));
$propertyUrl = htmlspecialchars(trim($propertyUrl));
$propertyRef = htmlspecialchars(trim($propertyRef));
$propertyTitle = htmlspecialchars(trim($propertyTitle));
$ownerEmail = filter_var(trim($ownerEmail), FILTER_SANITIZE_EMAIL);

// Validate emails
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

if (!filter_var($ownerEmail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid owner email address']);
    exit;
}

// Format phone number
$fullPhone = $phone;
if ($countryCode && $phone) {
    $fullPhone = $countryCode . ' ' . $phone;
}

// Build HTML email with table-based layout for Outlook/Gmail compatibility
// Using only inline styles and bgcolor attributes - no CSS classes (stripped by email clients)
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
                            <h2 style="margin:0;color:#ffffff;font-size:24px;font-family:Arial,sans-serif;">New Property Inquiry</h2>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td bgcolor="#f9f9f9" style="background-color:#f9f9f9;padding:20px;">
                            <!-- Property Info -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;border:1px solid #e0e0e0;">
                                <tr>
                                    <td bgcolor="#ffffff" style="background-color:#ffffff;padding:15px;border-left:4px solid ' . $primaryColor . ';">
                                        <h3 style="margin:0 0 15px;font-size:16px;color:#333;font-family:Arial,sans-serif;">Property Details</h3>
                                        <p style="margin:0 0 8px;font-size:14px;color:#333;font-family:Arial,sans-serif;"><strong>Title:</strong> ' . $propertyTitle . '</p>
                                        ' . ($propertyRef ? '<p style="margin:0 0 8px;font-size:14px;color:#333;font-family:Arial,sans-serif;"><strong>Reference:</strong> ' . $propertyRef . '</p>' : '') . '
                                        ' . ($propertyPrice ? '<p style="margin:0 0 8px;font-size:14px;color:#333;font-family:Arial,sans-serif;"><strong>Price:</strong> ' . $propertyPrice . '</p>' : '') . '
                                        ' . ($propertyUrl ? '
                                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                                            <tr>
                                                <td bgcolor="' . $primaryColor . '" style="background-color:' . $primaryColor . ';border-radius:5px;">
                                                    <a href="' . $propertyUrl . '" style="display:inline-block;padding:10px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;">View Property</a>
                                                </td>
                                            </tr>
                                        </table>' : '') . '
                                    </td>
                                </tr>
                            </table>

                            <!-- Contact Information -->
                            <h3 style="margin:0 0 15px;font-size:16px;color:#333;font-family:Arial,sans-serif;">Contact Information</h3>
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:15px;">
                                <tr>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;">
                                        <strong style="color:#555;font-size:13px;font-family:Arial,sans-serif;">Name</strong><br>
                                        <span style="color:#333;font-size:14px;font-family:Arial,sans-serif;">' . $name . '</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;">
                                        <strong style="color:#555;font-size:13px;font-family:Arial,sans-serif;">Email</strong><br>
                                        <a href="mailto:' . $email . '" style="color:' . $primaryColor . ';font-size:14px;font-family:Arial,sans-serif;">' . $email . '</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;">
                                        <strong style="color:#555;font-size:13px;font-family:Arial,sans-serif;">Phone</strong><br>
                                        <a href="tel:' . $fullPhone . '" style="color:' . $primaryColor . ';font-size:14px;font-family:Arial,sans-serif;">' . $fullPhone . '</a>
                                    </td>
                                </tr>
                            </table>

                            ' . ($message ? '
                            <h3 style="margin:0 0 15px;font-size:16px;color:#333;font-family:Arial,sans-serif;">Message</h3>
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="background-color:#fff9e6;padding:15px;border-left:4px solid #f39c12;font-size:14px;color:#555;font-family:Arial,sans-serif;">
                                        ' . nl2br($message) . '
                                    </td>
                                </tr>
                            </table>' : '') . '
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td bgcolor="#f0f0f0" style="background-color:#f0f0f0;padding:20px;text-align:center;font-size:12px;color:#777777;font-family:Arial,sans-serif;">
                            ' . ($companyName ? 'This inquiry was sent via ' . $companyName : 'This inquiry was sent via RealtySoft Property Widget') . '<br>
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
$headers .= "Reply-To: $email\r\n";

// Email subject
$subject = "Property Inquiry: $propertyTitle" . ($propertyRef ? " (Ref: $propertyRef)" : "");

// Send email to owner
inquiryLog("OWNER MAIL: to=$ownerEmail, from=noreply@smartpropertywidget.com, reply-to=$email, subject=$subject");
$success = mail($ownerEmail, $subject, $emailHtml, $headers);
inquiryLog("OWNER MAIL RESULT: " . ($success ? 'TRUE' : 'FALSE'));

// Send confirmation email to the client who submitted the form
$sendConfirmation = $data['sendConfirmation'] ?? $data['send_confirmation'] ?? true;
$confirmationSent = false;
inquiryLog("CONFIRM CHECK: sendConfirmation=" . var_export($sendConfirmation, true) . ", ownerSuccess=$success, clientEmail=$email");

if ($success && $sendConfirmation) {
    $confirmHtml = '
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
                            <h2 style="margin:0;color:#ffffff;font-size:24px;font-family:Arial,sans-serif;">Thank You for Your Inquiry</h2>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td bgcolor="#f9f9f9" style="background-color:#f9f9f9;padding:20px;">
                            <p style="margin:0 0 15px;font-size:14px;color:#333;font-family:Arial,sans-serif;">Dear ' . $name . ',</p>
                            <p style="margin:0 0 20px;font-size:14px;color:#333;font-family:Arial,sans-serif;">Thank you for your interest. We have received your inquiry and will get back to you as soon as possible.</p>

                            <!-- Property Info -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;border:1px solid #e0e0e0;">
                                <tr>
                                    <td bgcolor="#ffffff" style="background-color:#ffffff;padding:15px;border-left:4px solid ' . $primaryColor . ';">
                                        <h3 style="margin:0 0 15px;font-size:16px;color:#333;font-family:Arial,sans-serif;">Property Details</h3>
                                        <p style="margin:0 0 8px;font-size:14px;color:#333;font-family:Arial,sans-serif;"><strong>Title:</strong> ' . $propertyTitle . '</p>
                                        ' . ($propertyRef ? '<p style="margin:0 0 8px;font-size:14px;color:#333;font-family:Arial,sans-serif;"><strong>Reference:</strong> ' . $propertyRef . '</p>' : '') . '
                                        ' . ($propertyPrice ? '<p style="margin:0 0 8px;font-size:14px;color:#333;font-family:Arial,sans-serif;"><strong>Price:</strong> ' . $propertyPrice . '</p>' : '') . '
                                        ' . ($propertyUrl ? '
                                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                                            <tr>
                                                <td bgcolor="' . $primaryColor . '" style="background-color:' . $primaryColor . ';border-radius:5px;">
                                                    <a href="' . $propertyUrl . '" style="display:inline-block;padding:10px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;">View Property</a>
                                                </td>
                                            </tr>
                                        </table>' : '') . '
                                    </td>
                                </tr>
                            </table>

                            ' . ($message ? '
                            <h3 style="margin:0 0 15px;font-size:16px;color:#333;font-family:Arial,sans-serif;">Your Message</h3>
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="background-color:#fff9e6;padding:15px;border-left:4px solid #f39c12;font-size:14px;color:#555;font-family:Arial,sans-serif;">
                                        ' . nl2br($message) . '
                                    </td>
                                </tr>
                            </table>' : '') . '
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td bgcolor="#f0f0f0" style="background-color:#f0f0f0;padding:20px;text-align:center;font-size:12px;color:#777777;font-family:Arial,sans-serif;">
                            ' . ($companyName ? 'This is an automated confirmation from ' . $companyName : 'This is an automated confirmation from RealtySoft Property Widget') . '<br>
                            ' . ($websiteUrl ? '<a href="' . $websiteUrl . '" style="color:' . $primaryColor . ';">' . preg_replace('/^https?:\/\//', '', $websiteUrl) . '</a>' : '<a href="https://realtysoft.ai" style="color:' . $primaryColor . ';">realtysoft.ai</a>') . '
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';

    $confirmHeaders = "MIME-Version: 1.0\r\n";
    $confirmHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
    $confirmHeaders .= "From: Smart Property Widget <noreply@smartpropertywidget.com>\r\n";
    $confirmHeaders .= "Reply-To: $ownerEmail\r\n";

    $confirmSubject = "Your Inquiry: $propertyTitle" . ($propertyRef ? " (Ref: $propertyRef)" : "");

    inquiryLog("CONFIRM MAIL: to=$email, subject=$confirmSubject");
    $confirmationSent = mail($email, $confirmSubject, $confirmHtml, $confirmHeaders);
    inquiryLog("CONFIRM MAIL RESULT: " . ($confirmationSent ? 'TRUE' : 'FALSE'));
    if (!$confirmationSent) {
        inquiryLog("CONFIRM MAIL ERROR: " . error_get_last()['message'] ?? 'unknown');
    }
}

// Log inquiry
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
$confirmStatus = $sendConfirmation ? ($confirmationSent ? 'confirm_sent' : 'confirm_failed') : 'no_confirm';
$logEntry = date('Y-m-d H:i:s') . " | $ownerEmail | $propertyRef | $email | " . ($success ? 'sent' : 'failed') . " | $confirmStatus\n";
file_put_contents($logDir . '/inquiries.log', $logEntry, FILE_APPEND | LOCK_EX);

// Response
echo json_encode([
    'success' => $success,
    'message' => $success ? 'Your inquiry has been sent successfully!' : 'Failed to send inquiry. Please try again.'
]);
?>
