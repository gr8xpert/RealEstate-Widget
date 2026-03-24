<?php
/**
 * RealtySoft License Manager
 *
 * Handles license key validation and activation for WordPress installations.
 */

if (!defined('ABSPATH')) exit;

class RealtySoft_License_Manager {

    private static $instance = null;
    private $api_base_url = 'https://smartpropertywidget.com/spw/php/';

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Validate a license key against the central API
     *
     * @param string $license_key The license key to validate
     * @return array Validation result
     */
    public function validate_license($license_key) {
        $license_key = strtoupper(trim($license_key));

        // Validate format
        if (!preg_match('/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $license_key)) {
            return [
                'valid' => false,
                'error' => 'Invalid license key format'
            ];
        }

        // Call validation API
        $response = wp_remote_post($this->api_base_url . 'license-api.php', [
            'timeout' => 15,
            'body' => json_encode([
                'action' => 'validate',
                'license_key' => $license_key,
                'domain' => $this->get_site_domain(),
                'platform' => 'wordpress'
            ]),
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);

        if (is_wp_error($response)) {
            return [
                'valid' => false,
                'error' => 'Could not connect to license server: ' . $response->get_error_message()
            ];
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (!$body) {
            return [
                'valid' => false,
                'error' => 'Invalid response from license server'
            ];
        }

        // Store or clear dashboard widget config
        if (!empty($body['valid'])) {
            if (!empty($body['client']['widget_config'])) {
                update_option('realtysoft_dashboard_config', $body['client']['widget_config']);
            } else {
                delete_option('realtysoft_dashboard_config');
            }
        }

        return $body;
    }

    /**
     * Activate a license key
     *
     * @param string $license_key
     * @param array $client_data Additional client data
     * @return array Activation result
     */
    public function activate_license($license_key, $client_data = []) {
        $license_key = strtoupper(trim($license_key));

        $data = array_merge([
            'license_key' => $license_key,
            'domain' => $this->get_site_domain(),
            'platform' => 'wordpress',
            'site_name' => get_bloginfo('name'),
            'site_url' => home_url(),
            'wp_version' => get_bloginfo('version'),
        ], $client_data);

        $data['action'] = 'activate';
        $response = wp_remote_post($this->api_base_url . 'license-api.php', [
            'timeout' => 15,
            'body' => json_encode($data),
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'error' => 'Could not connect to license server'
            ];
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($body && isset($body['success']) && $body['success']) {
            // Store license info
            update_option('realtysoft_license_key', $license_key);
            update_option('realtysoft_license_status', 'active');
            update_option('realtysoft_license_plan', $body['plan'] ?? []);
            update_option('realtysoft_license_activated_at', current_time('mysql'));

            // Store or clear dashboard widget config
            if (!empty($body['widget_config'])) {
                update_option('realtysoft_dashboard_config', $body['widget_config']);
            } else {
                delete_option('realtysoft_dashboard_config');
            }
        }

        return $body ?: ['success' => false, 'error' => 'Invalid response'];
    }

    /**
     * Get current license status
     */
    public function get_license_status() {
        return [
            'key' => get_option('realtysoft_license_key', ''),
            'status' => get_option('realtysoft_license_status', 'inactive'),
            'plan' => get_option('realtysoft_license_plan', []),
            'activated_at' => get_option('realtysoft_license_activated_at', ''),
        ];
    }

    /**
     * Check if license is active
     */
    public function is_license_active() {
        return get_option('realtysoft_license_status', '') === 'active';
    }

    /**
     * Deactivate license
     */
    public function deactivate_license() {
        delete_option('realtysoft_license_key');
        delete_option('realtysoft_license_status');
        delete_option('realtysoft_license_plan');
        delete_option('realtysoft_license_activated_at');
        delete_option('realtysoft_dashboard_config');

        return ['success' => true];
    }

    /**
     * Re-validate the stored license key and sync dashboard config.
     * Called by WP cron (daily) to keep widget_config up to date.
     */
    public function sync_config() {
        $license_key = get_option('realtysoft_license_key', '');
        if (empty($license_key)) {
            return;
        }
        $this->validate_license($license_key);
    }

    /**
     * Get site domain without www
     */
    private function get_site_domain() {
        $url = home_url();
        $host = parse_url($url, PHP_URL_HOST);
        return preg_replace('/^www\./', '', $host);
    }
}
