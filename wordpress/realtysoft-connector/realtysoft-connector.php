<?php
/**
 * Plugin Name: RealtySoft Connector
 * Plugin URI: https://realtysoft.ai
 * Description: Connects your WordPress site with RealtySoft property widget.
 *              Auto-injects the widget loader and enables SEO-friendly property detail URLs.
 * Version: 1.1.0
 * Author: RealtySoft
 * License: GPL v2 or later
 * Text Domain: realtysoft-connector
 */
if (!defined('ABSPATH')) exit;

class RealtySoft_Connector {
    private $default_slug = 'property';
    private $loader_url = 'https://smartpropertywidget.com/spw/dist/realtysoft-loader.js';
    private $cached_property_data = [];

    public function __construct() {
        // Rewrite rules
        add_action('init', [$this, 'add_rewrite_rules']);
        add_action('init', [$this, 'maybe_flush_rules'], 99);
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, 'flush_rewrite_rules');

        // REST API endpoint for OG cache (widget pushes data here)
        add_action('rest_api_init', [$this, 'register_rest_routes']);

        // Auto-inject OG tags for property detail pages (priority 1 = early in <head>)
        add_action('wp_head', [$this, 'inject_og_tags'], 1);

        // Auto-inject widget scripts on frontend
        add_action('wp_head', [$this, 'inject_widget_scripts']);

        // Inject loading spinner on property detail pages (right after <body>)
        add_action('wp_body_open', [$this, 'inject_loading_overlay']);

        // Settings page
        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);

    }

    // ─── Activation ──────────────────────────────────────────────

    public function activate() {
        $this->add_rewrite_rules();
        flush_rewrite_rules();
    }

    // ─── Rewrite Rules ───────────────────────────────────────────

    public function add_rewrite_rules() {
        $slugs = $this->get_slugs();
        foreach ($slugs as $entry) {
            $slug = sanitize_title($entry['slug'] ?? $this->default_slug);
            add_rewrite_rule(
                '^' . preg_quote($slug, '/') . '/(.+)/?$',
                'index.php?pagename=' . $slug,
                'top'
            );
        }

    }

    public function maybe_flush_rules() {
        $slugs = $this->get_slugs();
        $rules = get_option('rewrite_rules');
        if (!is_array($rules)) return;

        foreach ($slugs as $entry) {
            $slug = sanitize_title($entry['slug'] ?? $this->default_slug);
            $rule_key = '^' . preg_quote($slug, '/') . '/(.+)/?$';
            if (!isset($rules[$rule_key])) {
                flush_rewrite_rules(false);
                return;
            }
        }
    }

    // ─── REST API (OG Cache) ────────────────────────────────────

    public function register_rest_routes() {
        register_rest_route('realtysoft/v1', '/og-cache', [
            'methods'  => 'POST',
            'callback' => [$this, 'handle_og_cache'],
            'permission_callback' => function() {
                // Accept WordPress nonce (fresh pages)
                $nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? '';
                if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
                    return true;
                }
                // Accept non-expiring HMAC token (cached pages where nonce is stale)
                $token = $_SERVER['HTTP_X_RS_OG_TOKEN'] ?? '';
                $expected = hash_hmac('sha256', 'rs_og_cache', wp_salt('auth'));
                return $token && hash_equals($expected, $token);
            },
        ]);
    }

    public function handle_og_cache($request) {
        $params = $request->get_json_params();
        $ref = preg_replace('/[^A-Za-z0-9\-]/', '', $params['ref'] ?? '');
        if (!$ref) return new WP_REST_Response(['error' => 'Missing ref'], 400);

        // Build rich description: "price | location - description"
        $desc = '';
        $price = sanitize_text_field($params['price'] ?? '');
        $location = sanitize_text_field($params['location'] ?? '');
        $rawDesc = sanitize_text_field($params['description'] ?? '');
        if ($price) $desc .= $price;
        if ($location) $desc .= ($desc ? ' | ' : '') . $location;
        if ($rawDesc) $desc .= ($desc ? ' - ' : '') . $rawDesc;

        $data = [
            'title'       => sanitize_text_field($params['title'] ?? ''),
            'description' => $desc,
            'image'       => esc_url_raw($params['image'] ?? ''),
            'site_name'   => sanitize_text_field($params['site_name'] ?? get_bloginfo('name')),
        ];

        set_transient('rs_og_' . $ref, $data, WEEK_IN_SECONDS);
        return new WP_REST_Response(['success' => true], 200);
    }

    // ─── Widget Script Injection ─────────────────────────────────

    /**
     * Inject RealtySoftConfig + loader script into <head> on all frontend pages.
     * The loader is lightweight — it only activates the widget on pages
     * that contain widget HTML elements or match a property detail URL.
     */
    public function inject_widget_scripts() {
        if (is_admin()) return;

        $config = get_option('realtysoft_widget_config', []);
        $slugs = $this->get_slugs();

        // Build the config object — only include non-empty values
        $js_config = [];

        if (!empty($config['ownerEmail'])) {
            $js_config['ownerEmail'] = $config['ownerEmail'];
        }
        if (!empty($config['inquiryThankYouMessage'])) {
            $js_config['inquiryThankYouMessage'] = $config['inquiryThankYouMessage'];
        }
        if (!empty($config['inquiryThankYouUrl'])) {
            $js_config['inquiryThankYouUrl'] = $config['inquiryThankYouUrl'];
        }
        if (!empty($config['language'])) {
            $js_config['language'] = $config['language'];
        }

        // Property page slug from the slugs setting (first entry)
        if (!empty($slugs[0]['slug'])) {
            $js_config['propertyPageSlug'] = $slugs[0]['slug'];
        }

        if (!empty($config['propertyUrlFormat'])) {
            $js_config['propertyUrlFormat'] = $config['propertyUrlFormat'];
        }

        // WordPress REST API endpoint for OG cache (widget pushes data here)
        $js_config['wpRestUrl'] = esc_url_raw(rest_url('realtysoft/v1/'));
        $js_config['wpApiNonce'] = wp_create_nonce('wp_rest');
        // Non-expiring token for OG cache (nonces expire, breaking OG on cached pages)
        $js_config['wpOgToken'] = hash_hmac('sha256', 'rs_og_cache', wp_salt('auth'));

        // Parse and merge advanced config (JSON)
        $advancedConfig = [];
        if (!empty($config['advancedConfig'])) {
            $advancedRaw = trim($config['advancedConfig']);
            // Wrap in braces if needed
            if (substr($advancedRaw, 0, 1) !== '{') {
                $advancedRaw = '{' . $advancedRaw . '}';
            }
            $parsed = json_decode($advancedRaw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
                $advancedConfig = $parsed;
            }
        }

        // Merge: base config + advanced config (advanced takes priority)
        $final_config = array_merge($js_config, $advancedConfig);

        // Output config script
        if (!empty($final_config)) {
            echo "<script>\nwindow.RealtySoftConfig = " . wp_json_encode($final_config, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . ";\n</script>\n";
        }

        // Preconnect + DNS prefetch for faster API calls and asset loading
        echo '<link rel="preconnect" href="https://realtysoft.ai">' . "\n";
        echo '<link rel="dns-prefetch" href="https://realtysoft.ai">' . "\n";

        // Property detail pages: SSR preview OR early-hide fallback
        $ref = $this->extract_property_ref_from_url();
        $ssr_active = false;

        if ($ref) {
            $ssr_data = $this->get_property_data($ref);
            $ssr_active = $ssr_data && !empty($ssr_data['ref']);

            if ($ssr_active) {
                // ── SSR MODE: Server-Side Rendered Preview ──────────────
                // User sees property content in the initial HTML (no JS needed for first paint).

                // 1. Set flag so widget JS skips early-hide
                echo "<script>window.__rsSSR = true;</script>\n";

                // 2. Hide WordPress page placeholder content while JS loads
                echo '<style id="rs-ssr-page-hide">' . "\n";
                echo '.property-detail-container ~ *:not(script):not(style):not(link):not(header):not(footer):not(.elementor-location-header):not(.elementor-location-footer):not([data-elementor-type="header"]):not([data-elementor-type="footer"]) { display: none !important; }' . "\n";
                echo '.rs-property-ready .rs-ssr-preview { display: none !important; }' . "\n";
                echo '</style>' . "\n";

                // 3. Render SSR preview and inject via MutationObserver
                $preview_html = $this->render_property_preview($ssr_data);
                echo "<script>\n";
                echo "(function(){\n";
                echo "  var html = " . wp_json_encode($preview_html) . ";\n";
                echo "  function inject(c) {\n";
                echo "    if (c.getAttribute('data-rs-ssr')) return;\n";
                echo "    c.setAttribute('data-rs-ssr', '1');\n";
                echo "    c.innerHTML = html;\n";
                echo "  }\n";
                echo "  var el = document.querySelector('.property-detail-container');\n";
                echo "  if (el) { inject(el); }\n";
                echo "  else {\n";
                echo "    var mo = new MutationObserver(function() {\n";
                echo "      var el = document.querySelector('.property-detail-container');\n";
                echo "      if (el) { mo.disconnect(); inject(el); }\n";
                echo "    });\n";
                echo "    mo.observe(document.documentElement, {childList:true, subtree:true});\n";
                echo "  }\n";
                echo "})();\n";
                echo "</script>\n";
            } else {
                // ── FALLBACK: No SSR data — original early-hide + spinner ──
                echo '<style id="rs-early-hide">' . "\n";
                echo 'body:not(.rs-property-ready) > *:not(script):not(style):not(link):not(#rs-loading-overlay):not(header):not(footer):not(.elementor-location-header):not(.elementor-location-footer):not([data-elementor-type="header"]):not([data-elementor-type="footer"]) { visibility: hidden !important; }' . "\n";
                echo '#rs-loading-overlay { display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #fff; z-index: 999999; }' . "\n";
                echo '.rs-property-ready #rs-loading-overlay { display: none !important; }' . "\n";
                echo '@keyframes rs-early-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' . "\n";
                echo '</style>' . "\n";
            }

            // Inline API prefetch: start fetching property data + labels IMMEDIATELY
            // (before the widget JS even loads). The widget consumes these promises
            // instead of making duplicate requests.
            $lang = !empty($config['language']) ? $config['language'] : '';
            $proxy = 'https://smartpropertywidget.com/spw/php/api-proxy.php';
            $prop_url = $proxy . '?_endpoint=v1/property&ref_no=' . urlencode($ref);
            $labels_url = $proxy . '?_endpoint=v1/plugin_labels';
            if ($lang) {
                $prop_url .= '&_lang=' . urlencode($lang);
                $labels_url .= '&_lang=' . urlencode($lang);
            }

            echo "<script>\n";
            echo "var h={headers:{'X-Requested-With':'XMLHttpRequest'}};\n";
            echo "window.__rsPrefetch={\n";
            echo "  property:fetch('" . esc_js($prop_url) . "',h).then(function(r){return r.json()}).catch(function(){return null}),\n";
            echo "  labels:fetch('" . esc_js($labels_url) . "',h).then(function(r){return r.json()}).catch(function(){return null}),\n";
            echo "  lang:" . ($lang ? "'" . esc_js($lang) . "'" : "null") . ",\n";
            echo "  ref:'" . esc_js($ref) . "'\n";
            echo "};\n";
            echo "</script>\n";
        }

        // Always use the loader — it has built-in hourly cache busting
        // so clients automatically get updates without manual version bumps
        echo '<script src="' . esc_url($this->loader_url) . '"></script>' . "\n";
    }

    /**
     * Inject loading spinner overlay on property detail pages.
     * Fires via wp_body_open (right after <body> tag).
     * Shows a spinner from first paint instead of a blank white screen.
     */
    public function inject_loading_overlay() {
        if (is_admin()) return;

        $ref = $this->extract_property_ref_from_url();
        if (!$ref) return;

        // Skip spinner when SSR preview is active — the preview IS the visible content
        if (isset($this->cached_property_data[$ref]) && !empty($this->cached_property_data[$ref]['ref'])) {
            return;
        }

        echo '<div id="rs-loading-overlay">';
        echo '<div style="width:40px;height:40px;border:3px solid #f3f3f3;border-top:3px solid #3498db;border-radius:50%;animation:rs-early-spin 1s linear infinite;"></div>';
        echo '</div>' . "\n";
    }

    // ─── Open Graph Tags for Property Detail Pages ──────────────

    /**
     * Inject OG meta tags on property detail pages so social media crawlers
     * (Facebook, Twitter, LinkedIn, WhatsApp) show proper previews.
     *
     * Runs at wp_head priority 1 (before Yoast/RankMath/WordPress canonical).
     * Three responsibilities:
     *   1. Fix canonical URL (WordPress points to /property/, we need /property/slug-REF)
     *   2. Suppress SEO plugin OG tags (they use the wrong page data)
     *   3. Output property-specific OG tags from transient or server-side API fetch
     */
    public function inject_og_tags() {
        if (is_admin()) return;

        $ref = $this->extract_property_ref_from_url();
        if (!$ref) return;

        // ── This IS a property detail page — take full control of SEO tags ──

        // Build the correct canonical URL (the property detail URL, NOT /property/)
        $canonical = (is_ssl() ? 'https' : 'http') . '://'
            . $_SERVER['HTTP_HOST']
            . strtok($_SERVER['REQUEST_URI'], '?'); // strip query params

        // 1. Remove WordPress core canonical (fires at wp_head priority 10)
        remove_action('wp_head', 'rel_canonical');

        // 2. Suppress Yoast SEO: canonical + all OG + Twitter tags
        add_filter('wpseo_canonical', function() use ($canonical) { return $canonical; });
        add_filter('wpseo_opengraph_url', function() use ($canonical) { return $canonical; });
        add_filter('wpseo_opengraph_title', '__return_empty_string');
        add_filter('wpseo_opengraph_desc', '__return_empty_string');
        add_filter('wpseo_opengraph_image', '__return_empty_string');
        add_filter('wpseo_opengraph_site_name', '__return_empty_string');
        add_filter('wpseo_opengraph_type', '__return_empty_string');
        add_filter('wpseo_twitter_card_type', '__return_empty_string');
        add_filter('wpseo_twitter_title', '__return_empty_string');
        add_filter('wpseo_twitter_description', '__return_empty_string');
        add_filter('wpseo_twitter_image', '__return_empty_string');

        // 3. Suppress RankMath: canonical + OG + Twitter
        add_filter('rank_math/frontend/canonical', function() use ($canonical) { return $canonical; });
        add_filter('rank_math/frontend/title', '__return_empty_string');
        remove_all_actions('rank_math/opengraph/facebook');
        remove_all_actions('rank_math/opengraph/twitter');

        // 4. Suppress other SEO plugins / WordPress defaults
        add_filter('get_canonical_url', function() use ($canonical) { return $canonical; });

        // 5. Get property data — shared cache with SSR preview (single API call)
        $data = $this->get_property_data($ref);
        $og_source = $data ? 'cached' : 'none';

        // 6. Always output our canonical (critical — prevents Facebook redirect to /property/)
        echo "\n<!-- RS OG: ref=" . esc_html($ref) . " source=" . ($data ? $og_source : 'none') . " -->\n";
        echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";

        if (!$data || !is_array($data)) {
            echo "<!-- RS OG: no property data available -->\n";
            return;
        }

        // 7. Output OG meta tags
        $title    = !empty($data['title']) ? $data['title'] : 'Property ' . $ref;
        $desc     = $data['description'] ?? '';
        $image    = $data['image'] ?? '';
        $siteName = $data['site_name'] ?? get_bloginfo('name');

        echo "\n<!-- RealtySoft OG Tags -->\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($canonical) . '">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        if ($desc) {
            echo '<meta property="og:description" content="' . esc_attr($desc) . '">' . "\n";
        }
        if ($image) {
            echo '<meta property="og:image" content="' . esc_url($image) . '">' . "\n";
            echo '<meta property="og:image:width" content="1200">' . "\n";
            echo '<meta property="og:image:height" content="630">' . "\n";
        }
        echo '<meta property="og:site_name" content="' . esc_attr($siteName) . '">' . "\n";
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
        if ($desc) {
            echo '<meta name="twitter:description" content="' . esc_attr($desc) . '">' . "\n";
        }
        if ($image) {
            echo '<meta name="twitter:image" content="' . esc_url($image) . '">' . "\n";
        }
        echo "<!-- /RealtySoft OG Tags -->\n\n";
    }

    /**
     * Extract property reference from the current URL.
     * Supports all 3 URL formats: SEO, ref-only, and query param.
     */
    private function extract_property_ref_from_url() {
        $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $slugs = $this->get_slugs();

        // Query params: ?ref=X or ?reference=X
        if (!empty($_GET['ref'])) {
            return preg_replace('/[^A-Za-z0-9\-]/', '', $_GET['ref']);
        }
        if (!empty($_GET['reference'])) {
            return preg_replace('/[^A-Za-z0-9\-]/', '', $_GET['reference']);
        }

        // Check if URL is under a property slug
        foreach ($slugs as $entry) {
            $slug = sanitize_title($entry['slug'] ?? $this->default_slug);
            if (preg_match('#^' . preg_quote($slug, '#') . '/(.+?)/?$#i', $path, $m)) {
                $subpath = $m[1];

                // SEO URL: title-slug-REF (last hyphen-separated segment)
                $parts = explode('-', $subpath);
                if (count($parts) > 1) {
                    $lastPart = end($parts);
                    if (preg_match('/^[A-Z0-9]{3,}$/i', $lastPart)) {
                        return $lastPart;
                    }
                }

                // Direct ref URL: /property/REF
                if (preg_match('/^[A-Z0-9]{3,}$/i', $subpath)) {
                    return $subpath;
                }
            }
        }

        return null;
    }

    /**
     * Fetch property data from the RealtySoft API (server-side).
     * Returns both OG fields and SSR preview fields from a single API call.
     * Used when the WordPress transient cache is cold.
     */
    private function fetch_property_data_from_api($ref) {
        $config = get_option('realtysoft_widget_config', []);
        $lang = !empty($config['language']) ? $config['language'] : '';
        $proxy = 'https://smartpropertywidget.com/spw/php/api-proxy.php';
        $url = $proxy . '?_endpoint=v1/property&ref_no=' . urlencode($ref);
        if ($lang) {
            $url .= '&_lang=' . urlencode($lang);
        }

        $site_url = home_url();
        $response = wp_remote_get($url, [
            'timeout' => 10,
            'sslverify' => true,
            'headers' => [
                'X-Requested-With' => 'XMLHttpRequest',
                'Origin'           => $site_url,
                'Referer'          => $site_url . '/',
            ],
        ]);

        if (is_wp_error($response)) {
            echo '<!-- RS OG API error: ' . esc_html($response->get_error_message()) . ' -->';
            return null;
        }

        $http_code = wp_remote_retrieve_response_code($response);
        $raw_body = wp_remote_retrieve_body($response);

        if ($http_code !== 200) {
            echo '<!-- RS OG API HTTP ' . intval($http_code) . ' -->';
            return null;
        }

        $body = json_decode($raw_body, true);
        if (!$body) {
            echo '<!-- RS OG API: empty/invalid JSON -->';
            return null;
        }

        // API returns { data: [property] } or { data: property }
        $p = null;
        if (isset($body['data']) && is_array($body['data'])) {
            $p = isset($body['data'][0]) ? $body['data'][0] : $body['data'];
        } elseif (isset($body['title']) || isset($body['name'])) {
            $p = $body;
        }
        if (!$p) return null;

        // Extract first image (full-size preferred)
        $image = '';
        if (!empty($p['images']) && is_array($p['images'])) {
            $img = $p['images'][0];
            if (is_string($img)) {
                $image = $img;
            } elseif (is_array($img)) {
                $image = $img['image_1024'] ?? $img['image_768'] ?? $img['image_512'] ?? $img['src'] ?? $img['url'] ?? '';
            }
        }

        // Build description
        $title = $p['title'] ?? $p['name'] ?? $p['headline'] ?? '';
        $desc = $p['short_description'] ?? $p['description'] ?? $p['summary'] ?? '';
        if (strlen($desc) > 300) {
            $desc = substr($desc, 0, 300) . '...';
        }

        // Build location
        $location = '';
        if (!empty($p['location_id']['name'])) {
            $location = $p['location_id']['name'];
        } elseif (!empty($p['location']['name'])) {
            $location = $p['location']['name'];
        } elseif (!empty($p['location']) && is_string($p['location'])) {
            $location = $p['location'];
        }

        // Extract price (raw number)
        $price_raw = 0;
        if (!empty($p['list_price'])) $price_raw = (float) $p['list_price'];
        elseif (!empty($p['price'])) $price_raw = (float) $p['price'];
        elseif (!empty($p['asking_price'])) $price_raw = (float) $p['asking_price'];

        // Build rich OG description with price and location
        $richDesc = '';
        if ($price_raw) $richDesc .= '€' . number_format($price_raw, 0, '.', ',');
        if ($location) $richDesc .= ($richDesc ? ' | ' : '') . $location;
        if ($desc) $richDesc .= ($richDesc ? ' - ' : '') . $desc;

        if (!$title && !$image) return null; // No useful data

        // Extract property type
        $type = '';
        if (!empty($p['type_id']['name'])) $type = $p['type_id']['name'];
        elseif (!empty($p['type']) && is_string($p['type'])) $type = $p['type'];
        elseif (!empty($p['type']['name'])) $type = $p['type']['name'];

        // Extract status
        $status = '';
        if (!empty($p['status']) && is_string($p['status'])) $status = $p['status'];
        elseif (!empty($p['listing_type_id']['name'])) $status = $p['listing_type_id']['name'];
        elseif (!empty($p['listing_status'])) $status = $p['listing_status'];

        return [
            // OG fields
            'title'       => sanitize_text_field($title),
            'description' => sanitize_text_field($richDesc ?: $desc),
            'image'       => esc_url_raw($image),
            'site_name'   => sanitize_text_field(get_bloginfo('name')),
            // SSR fields
            'ref'         => sanitize_text_field($ref),
            'price'       => $price_raw,
            'currency'    => sanitize_text_field($p['currency'] ?? '€'),
            'location'    => sanitize_text_field($location),
            'beds'        => (int) ($p['bedrooms'] ?? $p['beds'] ?? 0),
            'baths'       => (int) ($p['bathrooms'] ?? $p['baths'] ?? 0),
            'built_area'  => (float) ($p['built_area'] ?? $p['built'] ?? 0),
            'plot_size'   => (float) ($p['plot_size'] ?? $p['plot'] ?? 0),
            'type'        => sanitize_text_field($type),
            'status'      => sanitize_text_field($status),
        ];
    }

    /**
     * Get property data for a given ref — cached within the request, then transient, then API.
     * Shared by inject_og_tags() and inject_widget_scripts() to avoid duplicate API calls.
     */
    private function get_property_data($ref) {
        // 1. In-memory cache (same PHP request)
        if (isset($this->cached_property_data[$ref])) {
            return $this->cached_property_data[$ref];
        }

        // 2. WordPress transient (cross-request cache)
        $data = get_transient('rs_og_' . $ref);

        // If transient has SSR fields (set by fetch_property_data_from_api), use it
        if ($data && is_array($data) && !empty($data['ref'])) {
            $this->cached_property_data[$ref] = $data;
            return $data;
        }

        // 3. Fetch from API (transient missing or lacks SSR fields)
        $api_data = $this->fetch_property_data_from_api($ref);
        if ($api_data) {
            set_transient('rs_og_' . $ref, $api_data, WEEK_IN_SECONDS);
            $this->cached_property_data[$ref] = $api_data;
            return $api_data;
        }

        // 4. Fallback: return OG-only transient if API fetch failed
        if ($data && is_array($data)) {
            $this->cached_property_data[$ref] = $data;
            return $data;
        }

        return null;
    }

    /**
     * Render a static HTML preview of a property for SSR.
     * Displayed instantly in the initial HTML response while JS loads in the background.
     */
    private function render_property_preview($data) {
        $title      = $data['title'] ?? '';
        $image      = $data['image'] ?? '';
        $price      = $data['price'] ?? 0;
        $currency   = $data['currency'] ?? '€';
        $location   = $data['location'] ?? '';
        $ref        = $data['ref'] ?? '';
        $beds       = $data['beds'] ?? 0;
        $baths      = $data['baths'] ?? 0;
        $built_area = $data['built_area'] ?? 0;
        $plot_size  = $data['plot_size'] ?? 0;
        $type       = $data['type'] ?? '';
        $status     = $data['status'] ?? '';

        $html = '';

        // Inline critical CSS (~2KB) — only styles needed for the preview
        $html .= '<style id="rs-ssr-styles">';
        $html .= '.rs-ssr-preview{max-width:1200px;margin:0 auto;padding:0 16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#333}';
        $html .= '.rs-ssr-hero{width:100%;max-height:500px;object-fit:cover;border-radius:8px;background:#f0f0f0}';
        $html .= '.rs-ssr-title{font-size:26px;font-weight:700;margin:16px 0 8px;line-height:1.3}';
        $html .= '.rs-ssr-price{font-size:22px;font-weight:700;color:#2c5282;margin:0 0 12px}';
        $html .= '.rs-ssr-location{font-size:15px;color:#666;margin:0 0 12px;display:flex;align-items:center;gap:6px}';
        $html .= '.rs-ssr-location svg{flex-shrink:0}';
        $html .= '.rs-ssr-ref{font-size:13px;color:#999;margin:0 0 16px}';
        $html .= '.rs-ssr-badges{display:flex;gap:8px;margin:12px 0}';
        $html .= '.rs-ssr-badge{display:inline-block;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:500;background:#edf2f7;color:#4a5568}';
        $html .= '.rs-ssr-specs{display:flex;flex-wrap:wrap;gap:24px;padding:16px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin:16px 0}';
        $html .= '.rs-ssr-spec{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:60px}';
        $html .= '.rs-ssr-spec-value{font-size:18px;font-weight:600;color:#333}';
        $html .= '.rs-ssr-spec-label{font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px}';
        $html .= '@media(max-width:600px){.rs-ssr-title{font-size:22px}.rs-ssr-price{font-size:20px}.rs-ssr-specs{gap:16px}}';
        $html .= '</style>';

        $html .= '<div class="rs-ssr-preview">';

        // Hero image
        if ($image) {
            $html .= '<img class="rs-ssr-hero" src="' . esc_url($image) . '" alt="' . esc_attr($title) . '" loading="eager">';
        }

        // Badges (type + status)
        if ($type || $status) {
            $html .= '<div class="rs-ssr-badges">';
            if ($type) $html .= '<span class="rs-ssr-badge">' . esc_html(ucfirst($type)) . '</span>';
            if ($status) $html .= '<span class="rs-ssr-badge">' . esc_html(ucfirst($status)) . '</span>';
            $html .= '</div>';
        }

        // Title
        if ($title) {
            $html .= '<h1 class="rs-ssr-title">' . esc_html($title) . '</h1>';
        }

        // Price
        if ($price) {
            $symbol = ($currency === 'EUR' || $currency === '€') ? '€' : esc_html($currency) . ' ';
            $formatted = $symbol . number_format((float) $price, 0, '.', ',');
            $html .= '<p class="rs-ssr-price">' . esc_html($formatted) . '</p>';
        }

        // Location
        if ($location) {
            $html .= '<p class="rs-ssr-location">';
            $html .= '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
            $html .= esc_html($location);
            $html .= '</p>';
        }

        // Reference
        if ($ref) {
            $html .= '<p class="rs-ssr-ref">Ref: ' . esc_html($ref) . '</p>';
        }

        // Specs bar
        $specs = [];
        if ($beds)       $specs[] = ['value' => (string) $beds, 'label' => 'Beds'];
        if ($baths)      $specs[] = ['value' => (string) $baths, 'label' => 'Baths'];
        if ($built_area) $specs[] = ['value' => number_format($built_area, 0) . ' m²', 'label' => 'Built'];
        if ($plot_size)  $specs[] = ['value' => number_format($plot_size, 0) . ' m²', 'label' => 'Plot'];

        if (!empty($specs)) {
            $html .= '<div class="rs-ssr-specs">';
            foreach ($specs as $spec) {
                $html .= '<div class="rs-ssr-spec">';
                $html .= '<span class="rs-ssr-spec-value">' . esc_html($spec['value']) . '</span>';
                $html .= '<span class="rs-ssr-spec-label">' . esc_html($spec['label']) . '</span>';
                $html .= '</div>';
            }
            $html .= '</div>';
        }

        $html .= '</div>';

        return $html;
    }

    // ─── Helpers ─────────────────────────────────────────────────

    private function get_slugs() {
        return get_option('realtysoft_property_slugs',
            [['slug' => $this->default_slug, 'language' => 'Default']]);
    }

    // ─── Settings ────────────────────────────────────────────────

    public function add_settings_page() {
        add_options_page(
            'RealtySoft Settings',
            'RealtySoft',
            'manage_options',
            'realtysoft-settings',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings() {
        register_setting('realtysoft_settings', 'realtysoft_property_slugs', [
            'type' => 'array',
            'default' => [['slug' => 'property', 'language' => 'Default']],
            'sanitize_callback' => [$this, 'sanitize_slugs']
        ]);

        register_setting('realtysoft_settings', 'realtysoft_widget_config', [
            'type' => 'array',
            'default' => [],
            'sanitize_callback' => [$this, 'sanitize_widget_config']
        ]);
    }

    public function sanitize_slugs($input) {
        if (!is_array($input)) {
            return [['slug' => $this->default_slug, 'language' => 'Default']];
        }
        $sanitized = [];
        foreach ($input as $entry) {
            if (empty($entry['slug'])) continue;
            $sanitized[] = [
                'slug' => sanitize_title($entry['slug']),
                'language' => sanitize_text_field($entry['language'] ?? 'Default')
            ];
        }
        return !empty($sanitized) ? $sanitized : [['slug' => $this->default_slug, 'language' => 'Default']];
    }

    public function sanitize_widget_config($input) {
        if (!is_array($input)) return [];

        $sanitized = [
            'ownerEmail'              => sanitize_email($input['ownerEmail'] ?? ''),
            'inquiryThankYouMessage'  => sanitize_text_field($input['inquiryThankYouMessage'] ?? ''),
            'inquiryThankYouUrl'      => esc_url_raw($input['inquiryThankYouUrl'] ?? ''),
            'language'                => sanitize_text_field($input['language'] ?? ''),
            'propertyUrlFormat'       => in_array($input['propertyUrlFormat'] ?? '', ['seo', 'ref', 'query'])
                ? $input['propertyUrlFormat'] : 'seo',
        ];

        // Advanced config (JSON) - validate it's parseable
        $advancedRaw = $input['advancedConfig'] ?? '';
        if (!empty($advancedRaw)) {
            // Wrap in braces if user didn't include them, to make it valid JSON
            $trimmed = trim($advancedRaw);
            if (substr($trimmed, 0, 1) !== '{') {
                $trimmed = '{' . $trimmed . '}';
            }
            // Test if it's valid JSON
            $test = json_decode($trimmed, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                // Store the raw input (without added braces) for display in textarea
                $sanitized['advancedConfig'] = $advancedRaw;
            } else {
                // Invalid JSON - add admin notice but keep the value for user to fix
                add_settings_error(
                    'realtysoft_settings',
                    'invalid_json',
                    'Advanced Configuration contains invalid JSON: ' . json_last_error_msg() . '. The config was saved but may not work correctly.',
                    'warning'
                );
                $sanitized['advancedConfig'] = $advancedRaw;
            }
        } else {
            $sanitized['advancedConfig'] = '';
        }

        return $sanitized;
    }

    // ─── Settings Page ───────────────────────────────────────────

    public function render_settings_page() {
        $slugs  = $this->get_slugs();
        $config = get_option('realtysoft_widget_config', []);
        ?>
        <div class="wrap">
            <h1>RealtySoft Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('realtysoft_settings'); ?>

                <!-- ── Widget Configuration ── -->
                <h2>Widget Configuration</h2>
                <p>These settings are auto-injected into every page. No need to add scripts manually.</p>
                <table class="form-table">
                    <tr>
                        <th><label for="rs-owner-email">Owner Email</label></th>
                        <td>
                            <input type="email" id="rs-owner-email"
                                   name="realtysoft_widget_config[ownerEmail]"
                                   value="<?php echo esc_attr($config['ownerEmail'] ?? ''); ?>"
                                   class="regular-text"
                                   placeholder="agent@example.com" />
                            <p class="description">Inquiry form submissions are sent to this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="rs-thankyou-msg">Thank You Message</label></th>
                        <td>
                            <input type="text" id="rs-thankyou-msg"
                                   name="realtysoft_widget_config[inquiryThankYouMessage]"
                                   value="<?php echo esc_attr($config['inquiryThankYouMessage'] ?? ''); ?>"
                                   class="large-text"
                                   placeholder="Thank you for your inquiry! We will contact you within 24 hours." />
                            <p class="description">Shown after a user submits an inquiry form.</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="rs-thankyou-url">Thank You Redirect URL</label></th>
                        <td>
                            <input type="url" id="rs-thankyou-url"
                                   name="realtysoft_widget_config[inquiryThankYouUrl]"
                                   value="<?php echo esc_attr($config['inquiryThankYouUrl'] ?? ''); ?>"
                                   class="regular-text"
                                   placeholder="https://example.com/thank-you" />
                            <p class="description">Optional. Redirect to this URL after inquiry submission instead of showing a message.</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="rs-language">Language</label></th>
                        <td>
                            <input type="text" id="rs-language"
                                   name="realtysoft_widget_config[language]"
                                   value="<?php echo esc_attr($config['language'] ?? ''); ?>"
                                   class="regular-text"
                                   placeholder="en_US" />
                            <p class="description">Widget language code (e.g. <code>en_US</code>, <code>es_ES</code>, <code>nl_NL</code>). Auto-detected if empty.</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="rs-url-format">Property URL Format</label></th>
                        <td>
                            <select id="rs-url-format" name="realtysoft_widget_config[propertyUrlFormat]">
                                <option value="seo" <?php selected($config['propertyUrlFormat'] ?? 'seo', 'seo'); ?>>SEO-Friendly (Recommended) &mdash; /property/villa-name-V12345</option>
                                <option value="ref" <?php selected($config['propertyUrlFormat'] ?? 'seo', 'ref'); ?>>Reference Only &mdash; /property/V12345</option>
                                <option value="query" <?php selected($config['propertyUrlFormat'] ?? 'seo', 'query'); ?>>Query Parameter &mdash; /property?ref=V12345</option>
                            </select>
                            <p class="description">
                                <strong>SEO-Friendly</strong> &mdash; Best for search engine ranking. Includes property title in URL.<br>
                                <strong>Reference Only</strong> &mdash; Clean, short URLs with just the reference code.<br>
                                <strong>Query Parameter</strong> &mdash; Works on all platforms without rewrite rules (Wix, Squarespace).
                            </p>
                        </td>
                    </tr>
                </table>

                <hr />

                <!-- ── Advanced Configuration ── -->
                <h2>Advanced Configuration</h2>
                <p>Add custom widget configuration options in JSON format. These will be merged with the settings above.</p>
                <table class="form-table">
                    <tr>
                        <th><label for="rs-advanced-config">Custom Config</label></th>
                        <td>
                            <textarea id="rs-advanced-config"
                                      name="realtysoft_widget_config[advancedConfig]"
                                      rows="12"
                                      class="large-text code"
                                      style="font-family: monospace; font-size: 13px;"
                                      placeholder='labelsMode: "static",
labelOverrides: {
  "_default": { "search_button": "Find Properties" },
  "es_ES": { "search_button": "Buscar" }
}'><?php echo esc_textarea($config['advancedConfig'] ?? ''); ?></textarea>
                            <p class="description">
                                Enter configuration as JSON properties (with or without outer braces). Example options:<br>
                                <code>labelsMode</code>: <code>"static"</code> (fastest, no API call), <code>"api"</code> (current behavior), <code>"hybrid"</code> (static first, API in background)<br>
                                <code>labelOverrides</code>: Custom label text per language<br>
                                <code>analytics</code>: <code>false</code> to disable analytics<br>
                                <code>debug</code>: <code>true</code> for verbose console logging
                            </p>
                            <div id="rs-json-validation" style="margin-top: 8px;"></div>
                        </td>
                    </tr>
                </table>

                <script>
                (function() {
                    var textarea = document.getElementById('rs-advanced-config');
                    var validation = document.getElementById('rs-json-validation');

                    function validateJSON() {
                        var val = textarea.value.trim();
                        if (!val) {
                            validation.innerHTML = '';
                            return;
                        }
                        // Wrap in braces if needed
                        if (val.charAt(0) !== '{') {
                            val = '{' + val + '}';
                        }
                        try {
                            JSON.parse(val);
                            validation.innerHTML = '<span style="color: #46b450;">✓ Valid JSON</span>';
                        } catch (e) {
                            validation.innerHTML = '<span style="color: #dc3232;">✗ Invalid JSON: ' + e.message + '</span>';
                        }
                    }

                    textarea.addEventListener('input', validateJSON);
                    validateJSON(); // Initial check
                })();
                </script>

                <hr />

                <!-- ── Filter IDs Reference ── -->
                <h2>Filter IDs Reference</h2>
                <p>To lock filters on specific pages (e.g., show only villas in Marbella), you need the IDs for locations, property types, and features.</p>
                <?php
                $current_domain = preg_replace('/^www\./', '', parse_url(home_url(), PHP_URL_HOST));
                $filter_ids_url = plugins_url('filter-ids.html', __FILE__);
                ?>
                <table class="form-table">
                    <tr>
                        <th>View Filter IDs</th>
                        <td>
                            <a href="<?php echo esc_url($filter_ids_url); ?>"
                               target="_blank"
                               class="button button-secondary"
                               style="display: inline-flex; align-items: center; gap: 6px;">
                                <span class="dashicons dashicons-editor-table" style="margin-top: 3px;"></span>
                                Open Filter IDs Reference
                            </a>
                            <p class="description">
                                Opens a page showing all available Location, Property Type, and Feature IDs for <strong><?php echo esc_html($current_domain); ?></strong>.<br>
                                Copy the IDs you need and use them in your page HTML.<br>
                                <strong>Example:</strong> <code>&lt;div data-rs-component="search" data-rs-location="5"&gt;&lt;/div&gt;</code>
                            </p>
                        </td>
                    </tr>
                </table>

                <hr />

                <!-- ── Property Page Slugs ── -->
                <h2>Property Page Slugs</h2>
                <p>Each slug must match an existing WordPress page with the widget.
                   The first slug is also used as <code>propertyPageSlug</code> in the widget config.</p>
                <table class="widefat" id="rs-slugs-table">
                    <thead>
                        <tr>
                            <th>Language</th>
                            <th>Page Slug</th>
                            <th style="width: 50px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($slugs as $i => $entry): ?>
                        <tr>
                            <td>
                                <input type="text"
                                       name="realtysoft_property_slugs[<?php echo $i; ?>][language]"
                                       value="<?php echo esc_attr($entry['language']); ?>"
                                       placeholder="e.g. English"
                                       class="regular-text" />
                            </td>
                            <td>
                                <input type="text"
                                       name="realtysoft_property_slugs[<?php echo $i; ?>][slug]"
                                       value="<?php echo esc_attr($entry['slug']); ?>"
                                       placeholder="e.g. property"
                                       class="regular-text" />
                            </td>
                            <td>
                                <?php if ($i > 0): ?>
                                <button type="button" class="button rs-remove-slug">&times;</button>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                <p>
                    <button type="button" class="button" id="rs-add-slug">+ Add Language</button>
                </p>

                <?php submit_button('Save Settings'); ?>
            </form>

            <hr />

            <h2>How It Works</h2>
            <ol>
                <li>The plugin auto-injects the widget loader script and config into every page <code>&lt;head&gt;</code></li>
                <li>Create a WordPress page for each language (e.g. <code>/property/</code>)</li>
                <li>Add the matching slug above</li>
                <li>The plugin adds a rewrite rule so URLs like <code>/property/villa-name-REF123</code>
                    serve the <code>/property/</code> page with HTTP 200 (instead of 404)</li>
                <li>The widget JS reads the URL and loads the correct property</li>
            </ol>

            <h2>Troubleshooting</h2>
            <p>If property detail URLs show 404 after saving:</p>
            <ol>
                <li>Go to <strong>Settings &rarr; Permalinks</strong></li>
                <li>Click <strong>Save Changes</strong> (this flushes rewrite rules)</li>
                <li>Try the property URL again</li>
            </ol>
        </div>

        <script>
        (function() {
            var table = document.getElementById('rs-slugs-table');
            var tbody = table.querySelector('tbody');
            var addBtn = document.getElementById('rs-add-slug');
            var rowCount = tbody.rows.length;

            addBtn.addEventListener('click', function() {
                var row = document.createElement('tr');
                row.innerHTML = '<td><input type="text" name="realtysoft_property_slugs[' + rowCount + '][language]" placeholder="e.g. Spanish" class="regular-text" /></td>' +
                    '<td><input type="text" name="realtysoft_property_slugs[' + rowCount + '][slug]" placeholder="e.g. propiedad" class="regular-text" /></td>' +
                    '<td><button type="button" class="button rs-remove-slug">&times;</button></td>';
                tbody.appendChild(row);
                rowCount++;
            });

            tbody.addEventListener('click', function(e) {
                if (e.target.classList.contains('rs-remove-slug')) {
                    e.target.closest('tr').remove();
                }
            });
        })();
        </script>
        <?php
    }
}

new RealtySoft_Connector();
