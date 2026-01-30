<?php
/**
 * RealtySoft Share Handler
 *
 * This page provides proper Open Graph meta tags for social media sharing.
 * Social platforms fetch this page to get the preview image, title, and description.
 *
 * Usage: share.php?ref=R5285887&url=https://client-site.com/property/villa-R5285887
 */

// Get parameters — $_GET values are already URL-decoded by PHP
$ref = isset($_GET['ref']) ? htmlspecialchars($_GET['ref'], ENT_QUOTES, 'UTF-8') : '';
$title = isset($_GET['title']) ? htmlspecialchars($_GET['title'], ENT_QUOTES, 'UTF-8') : 'Beautiful Property';
$description = isset($_GET['desc']) ? htmlspecialchars($_GET['desc'], ENT_QUOTES, 'UTF-8') : 'View this amazing property';
$image = isset($_GET['image']) ? htmlspecialchars($_GET['image'], ENT_QUOTES, 'UTF-8') : '';
$price = isset($_GET['price']) ? htmlspecialchars($_GET['price'], ENT_QUOTES, 'UTF-8') : '';
$location = isset($_GET['location']) ? htmlspecialchars($_GET['location'], ENT_QUOTES, 'UTF-8') : '';
$targetUrl = isset($_GET['url']) ? htmlspecialchars($_GET['url'], ENT_QUOTES, 'UTF-8') : '';
$siteName = isset($_GET['site_name']) ? htmlspecialchars($_GET['site_name'], ENT_QUOTES, 'UTF-8') : '';

// If no site_name provided, extract domain from target URL
if (empty($siteName) && !empty($targetUrl)) {
    $parsedUrl = parse_url($targetUrl);
    if (!empty($parsedUrl['host'])) {
        $siteName = preg_replace('/^www\./', '', $parsedUrl['host']);
        // Capitalize first letter of each segment for display
        $siteName = ucfirst($siteName);
    }
}
if (empty($siteName)) {
    $siteName = 'Property Listing';
}

// Build full description
$fullDescription = $price ? "$price" : "";
if ($location) {
    $fullDescription .= $fullDescription ? " | $location" : $location;
}
if ($description) {
    $fullDescription .= $fullDescription ? " - $description" : $description;
}

// Current share page URL (for og:url)
$shareUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

// If no target URL provided, try to construct one
if (empty($targetUrl) && !empty($ref)) {
    // Default to realtysoft.ai property page
    $targetUrl = "https://realtysoft.ai/propertymanager/property/property-$ref";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Page Title -->
    <title><?php echo $title; ?> | <?php echo $siteName; ?></title>

    <!-- Standard Meta -->
    <meta name="description" content="<?php echo $fullDescription; ?>">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo $shareUrl; ?>">
    <meta property="og:title" content="<?php echo $title; ?>">
    <meta property="og:description" content="<?php echo $fullDescription; ?>">
    <?php if ($image): ?>
    <meta property="og:image" content="<?php echo $image; ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <?php endif; ?>

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $title; ?>">
    <meta name="twitter:description" content="<?php echo $fullDescription; ?>">
    <?php if ($image): ?>
    <meta name="twitter:image" content="<?php echo $image; ?>">
    <?php endif; ?>

    <!-- WhatsApp -->
    <meta property="og:site_name" content="<?php echo $siteName; ?>">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .share-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
        }
        .share-image {
            width: 100%;
            height: 280px;
            object-fit: cover;
            background: #ecf0f1;
        }
        .share-content {
            padding: 25px;
        }
        .share-title {
            font-size: 1.5em;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .share-price {
            font-size: 1.3em;
            color: #27ae60;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .share-location {
            color: #7f8c8d;
            margin-bottom: 15px;
        }
        .share-desc {
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .share-ref {
            font-size: 0.85em;
            color: #95a5a6;
            margin-bottom: 20px;
        }
        .view-btn {
            display: block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1em;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .view-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        .powered-by {
            text-align: center;
            padding: 15px;
            color: #95a5a6;
            font-size: 0.8em;
        }
        .no-image {
            height: 280px;
            background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7f8c8d;
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <div class="share-card">
        <?php if ($image): ?>
            <img src="<?php echo $image; ?>" alt="<?php echo $title; ?>" class="share-image">
        <?php else: ?>
            <div class="no-image">Property Image</div>
        <?php endif; ?>

        <div class="share-content">
            <h1 class="share-title"><?php echo $title; ?></h1>

            <?php if ($price): ?>
                <div class="share-price"><?php echo $price; ?></div>
            <?php endif; ?>

            <?php if ($location): ?>
                <div class="share-location"><?php echo $location; ?></div>
            <?php endif; ?>

            <?php if ($description): ?>
                <p class="share-desc"><?php echo $description; ?></p>
            <?php endif; ?>

            <?php if ($ref): ?>
                <div class="share-ref">Ref: <?php echo $ref; ?></div>
            <?php endif; ?>

            <?php if ($targetUrl): ?>
                <a href="<?php echo $targetUrl; ?>" class="view-btn">View Property Details</a>
            <?php endif; ?>
        </div>

        <div class="powered-by">
            <?php echo $siteName; ?>
        </div>
    </div>

    <?php if ($targetUrl): ?>
    <!-- Auto-redirect after 2 seconds (optional - comment out if you prefer manual click) -->
    <!--
    <script>
        setTimeout(function() {
            window.location.href = "<?php echo $targetUrl; ?>";
        }, 2000);
    </script>
    -->
    <?php endif; ?>
</body>
</html>
