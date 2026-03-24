<?php
/**
 * RealtySoft Installer Wizard
 *
 * Provides a step-by-step installation wizard in the WordPress admin.
 */

if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/class-license-manager.php';
require_once __DIR__ . '/class-page-generator.php';

class RealtySoft_Installer {

    private static $instance = null;
    private $license_manager;
    private $page_generator;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->license_manager = RealtySoft_License_Manager::get_instance();
        $this->page_generator = RealtySoft_Page_Generator::get_instance();

        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('wp_ajax_realtysoft_installer', [$this, 'handle_ajax']);
    }

    /**
     * Enqueue scripts for installer (when on setup tab of main settings page)
     */
    public function enqueue_scripts($hook) {
        if ($hook !== 'settings_page_realtysoft-settings') {
            return;
        }
        // Only load on the setup tab
        if (empty($_GET['tab']) || $_GET['tab'] !== 'setup') {
            return;
        }

        wp_enqueue_style('realtysoft-installer', plugins_url('assets/installer.css', dirname(__FILE__)));
        wp_enqueue_script('realtysoft-installer', plugins_url('assets/installer.js', dirname(__FILE__)), ['jquery'], '1.0', true);

        wp_localize_script('realtysoft-installer', 'rsInstaller', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('realtysoft_installer'),
            'defaultSlugs' => $this->page_generator->get_default_slugs('en'),
            'languages' => $this->get_available_languages(),
        ]);
    }

    /**
     * Render installer page
     */
    public function render_installer_page() {
        $license_status = $this->license_manager->get_license_status();
        $current_step = isset($_GET['step']) ? intval($_GET['step']) : 1;

        include plugin_dir_path(dirname(__FILE__)) . 'templates/installer-wizard.php';
    }

    /**
     * Handle AJAX requests
     */
    public function handle_ajax() {
        check_ajax_referer('realtysoft_installer', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied']);
        }

        $action = isset($_POST['installer_action']) ? sanitize_text_field($_POST['installer_action']) : '';

        switch ($action) {
            case 'validate_license':
                $this->ajax_validate_license();
                break;

            case 'activate_license':
                $this->ajax_activate_license();
                break;

            case 'create_pages':
                $this->ajax_create_pages();
                break;

            case 'save_config':
                $this->ajax_save_config();
                break;

            case 'verify_setup':
                $this->ajax_verify_setup();
                break;

            default:
                wp_send_json_error(['message' => 'Invalid action']);
        }
    }

    /**
     * AJAX: Validate license key
     */
    private function ajax_validate_license() {
        $license_key = isset($_POST['license_key']) ? sanitize_text_field($_POST['license_key']) : '';

        if (empty($license_key)) {
            wp_send_json_error(['message' => 'License key is required']);
        }

        $result = $this->license_manager->validate_license($license_key);

        if ($result['valid']) {
            // Dashboard config is already stored by license manager's validate_license()
            wp_send_json_success([
                'message' => 'License key is valid!',
                'plan' => $result['plan'],
                'client' => $result['client'] ?? null,
            ]);
        } else {
            wp_send_json_error(['message' => $result['error'] ?? 'Invalid license key']);
        }
    }

    /**
     * AJAX: Activate license key
     */
    private function ajax_activate_license() {
        $license_key = isset($_POST['license_key']) ? sanitize_text_field($_POST['license_key']) : '';
        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
        $api_url = isset($_POST['api_url']) ? esc_url_raw($_POST['api_url']) : '';
        $contact_email = isset($_POST['contact_email']) ? sanitize_email($_POST['contact_email']) : '';

        if (empty($license_key)) {
            wp_send_json_error(['message' => 'License key is required']);
        }

        $result = $this->license_manager->activate_license($license_key, [
            'api_key' => $api_key,
            'api_url' => $api_url,
            'contact_email' => $contact_email,
        ]);

        if (!empty($result['success'])) {
            wp_send_json_success(['message' => 'License activated successfully!']);
        } else {
            wp_send_json_error(['message' => $result['error'] ?? 'Activation failed']);
        }
    }

    /**
     * AJAX: Create pages for languages
     */
    private function ajax_create_pages() {
        $languages = isset($_POST['languages']) ? (array)$_POST['languages'] : ['en'];
        $slugs = isset($_POST['slugs']) ? (array)$_POST['slugs'] : [];

        $results = [
            'success' => true,
            'created' => [],
            'errors' => []
        ];

        foreach ($languages as $lang) {
            $lang = sanitize_text_field($lang);
            $lang_slugs = isset($slugs[$lang]) ? array_map('sanitize_title', $slugs[$lang]) : [];

            $page_result = $this->page_generator->create_language_pages($lang, $lang_slugs);

            if ($page_result['success']) {
                $results['created'][$lang] = $page_result['pages'];
            } else {
                $results['errors'][$lang] = $page_result['errors'];
                $results['success'] = false;
            }
        }

        // Update plugin settings with new slugs
        $slug_settings = [];
        foreach ($results['created'] as $lang => $pages) {
            $slug_settings[] = [
                'language' => $lang,
                'slug' => $slugs[$lang]['detail'] ?? $this->page_generator->get_default_slugs($lang)['detail'],
                'results_slug' => $slugs[$lang]['search'] ?? $this->page_generator->get_default_slugs($lang)['search'],
            ];
        }
        update_option('realtysoft_property_slugs', $slug_settings);

        if ($results['success']) {
            wp_send_json_success([
                'message' => 'Pages created successfully!',
                'pages' => $results['created']
            ]);
        } else {
            wp_send_json_error([
                'message' => 'Some pages could not be created',
                'errors' => $results['errors'],
                'created' => $results['created']
            ]);
        }
    }

    /**
     * AJAX: Save configuration
     */
    private function ajax_save_config() {
        $config = [
            'ownerEmail' => isset($_POST['owner_email']) ? sanitize_email($_POST['owner_email']) : '',
            'inquiryThankYouMessage' => isset($_POST['thank_you_message']) ? sanitize_text_field($_POST['thank_you_message']) : '',
            'inquiryThankYouUrl' => isset($_POST['thank_you_url']) ? esc_url_raw($_POST['thank_you_url']) : '',
            'language' => isset($_POST['default_language']) ? sanitize_text_field($_POST['default_language']) : '',
            'propertyUrlFormat' => isset($_POST['url_format']) ? sanitize_text_field($_POST['url_format']) : 'seo',
        ];

        update_option('realtysoft_widget_config', $config);

        // Flush rewrite rules
        flush_rewrite_rules();

        wp_send_json_success(['message' => 'Configuration saved!']);
    }

    /**
     * AJAX: Verify setup
     */
    private function ajax_verify_setup() {
        $results = [
            'license' => $this->license_manager->is_license_active(),
            'pages' => [],
            'rewrite_rules' => false,
        ];

        // Check pages exist
        $slugs = get_option('realtysoft_property_slugs', []);
        foreach ($slugs as $slug_config) {
            $slug = $slug_config['slug'] ?? '';
            if ($slug) {
                $page = get_page_by_path($slug);
                $results['pages'][$slug] = $page ? true : false;
            }
        }

        // Check rewrite rules
        $rules = get_option('rewrite_rules', []);
        if (is_array($rules)) {
            foreach ($slugs as $slug_config) {
                $slug = $slug_config['slug'] ?? '';
                if ($slug) {
                    $rule_key = '^' . preg_quote($slug, '/') . '/[^/]+/?$';
                    if (isset($rules[$rule_key])) {
                        $results['rewrite_rules'] = true;
                        break;
                    }
                }
            }
        }

        $all_good = $results['license'] && $results['rewrite_rules'] && !in_array(false, $results['pages'], true);

        if ($all_good) {
            wp_send_json_success([
                'message' => 'Setup verified successfully!',
                'results' => $results
            ]);
        } else {
            wp_send_json_error([
                'message' => 'Setup verification found issues',
                'results' => $results
            ]);
        }
    }

    /**
     * Get available languages (from Polylang/WPML or defaults)
     */
    private function get_available_languages() {
        $languages = [];

        // Check Polylang
        if (function_exists('pll_languages_list')) {
            $pll_languages = pll_languages_list(['fields' => 'slug']);
            foreach ($pll_languages as $lang) {
                $languages[] = [
                    'code' => $lang,
                    'name' => $this->get_language_name($lang),
                ];
            }
        }
        // Check WPML
        elseif (defined('ICL_LANGUAGE_CODE')) {
            $wpml_languages = apply_filters('wpml_active_languages', null, []);
            if (is_array($wpml_languages)) {
                foreach ($wpml_languages as $lang) {
                    $languages[] = [
                        'code' => $lang['code'],
                        'name' => $lang['translated_name'],
                    ];
                }
            }
        }

        // Default: just English
        if (empty($languages)) {
            $languages = [
                ['code' => 'en', 'name' => 'English'],
            ];
        }

        return $languages;
    }

    /**
     * Get language name from code
     */
    private function get_language_name($code) {
        $names = [
            'en' => 'English',
            'es' => 'Spanish',
            'de' => 'German',
            'fr' => 'French',
            'nl' => 'Dutch',
            'pt' => 'Portuguese',
            'it' => 'Italian',
            'ru' => 'Russian',
            'pl' => 'Polish',
            'sv' => 'Swedish',
            'no' => 'Norwegian',
            'da' => 'Danish',
            'fi' => 'Finnish',
        ];

        return $names[$code] ?? ucfirst($code);
    }
}

// Initialize the installer
add_action('plugins_loaded', function() {
    RealtySoft_Installer::get_instance();
});
