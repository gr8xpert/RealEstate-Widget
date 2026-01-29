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

// Get owner email - check multiple sources
$ownerEmail = $data['ownerEmail'] ?? $data['owner_email'] ?? null;

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
                break;
            }
        }
    }
}

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

// Build HTML email (same format as old widget)
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
        .property-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-top: 5px; }
        .message-box { background: #fff9e6; padding: 15px; border-left: 4px solid #f39c12; border-radius: 4px; }
        .view-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px; margin-top: 10px; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777; border-radius: 0 0 8px 8px; }
        a { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">New Property Inquiry</h2>
        </div>
        <div class="content">
            <div class="property-info">
                <h3 style="margin-top:0;">Property Details</h3>
                <p><strong>Title:</strong> ' . $propertyTitle . '</p>
                ' . ($propertyRef ? '<p><strong>Reference:</strong> ' . $propertyRef . '</p>' : '') . '
                ' . ($propertyPrice ? '<p><strong>Price:</strong> ' . $propertyPrice . '</p>' : '') . '
                ' . ($propertyUrl ? '<a href="' . $propertyUrl . '" class="view-btn">View Property</a>' : '') . '
            </div>

            <h3>Contact Information</h3>
            <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">' . $name . '</div>
            </div>
            <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value"><a href="mailto:' . $email . '">' . $email . '</a></div>
            </div>
            <div class="field">
                <div class="field-label">Phone</div>
                <div class="field-value"><a href="tel:' . $fullPhone . '">' . $fullPhone . '</a></div>
            </div>

            ' . ($message ? '
            <h3>Message</h3>
            <div class="message-box">' . nl2br($message) . '</div>
            ' : '') . '
        </div>
        <div class="footer">
            This inquiry was sent via RealtySoft Property Widget<br>
            <a href="https://realtysoft.ai">realtysoft.ai</a>
        </div>
    </div>
</body>
</html>';

// Email headers - use server domain for From to pass SPF/DKIM
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: RealtySoft <noreply@realtysoft.ai>\r\n";
$headers .= "Reply-To: $email\r\n";

// Email subject
$subject = "Property Inquiry: $propertyTitle" . ($propertyRef ? " (Ref: $propertyRef)" : "");

// Send email to owner
inquiryLog("OWNER MAIL: to=$ownerEmail, from=noreply@realtysoft.ai, reply-to=$email, subject=$subject");
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
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .property-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea; }
        .message-box { background: #fff9e6; padding: 15px; border-left: 4px solid #f39c12; border-radius: 4px; }
        .view-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px; margin-top: 10px; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777; border-radius: 0 0 8px 8px; }
        a { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">Thank You for Your Inquiry</h2>
        </div>
        <div class="content">
            <p>Dear ' . $name . ',</p>
            <p>Thank you for your interest. We have received your inquiry and will get back to you as soon as possible.</p>

            <div class="property-info">
                <h3 style="margin-top:0;">Property Details</h3>
                <p><strong>Title:</strong> ' . $propertyTitle . '</p>
                ' . ($propertyRef ? '<p><strong>Reference:</strong> ' . $propertyRef . '</p>' : '') . '
                ' . ($propertyPrice ? '<p><strong>Price:</strong> ' . $propertyPrice . '</p>' : '') . '
                ' . ($propertyUrl ? '<a href="' . $propertyUrl . '" class="view-btn">View Property</a>' : '') . '
            </div>

            ' . ($message ? '
            <h3>Your Message</h3>
            <div class="message-box">' . nl2br($message) . '</div>
            ' : '') . '
        </div>
        <div class="footer">
            This is an automated confirmation from RealtySoft Property Widget<br>
            <a href="https://realtysoft.ai">realtysoft.ai</a>
        </div>
    </div>
</body>
</html>';

    $confirmHeaders = "MIME-Version: 1.0\r\n";
    $confirmHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
    $confirmHeaders .= "From: RealtySoft <noreply@realtysoft.ai>\r\n";
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
