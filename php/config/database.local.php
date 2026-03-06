<?php
/**
 * LOCAL Database Configuration
 * Update these values with your MySQL credentials
 */

return [
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'realtysoft_subscriptions',
    'username' => 'root',          // <-- Change this
    'password' => '',              // <-- Change this
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',

    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ],

    'admin' => [
        'session_name' => 'rs_admin_session',
        'session_lifetime' => 3600 * 8,
        'cookie_secure' => false,  // Set to true if using HTTPS
        'cookie_httponly' => true,
        'cookie_samesite' => 'Strict',
    ],

    'subscription' => [
        'grace_period_days' => 7,
        'warning_days_before_expiry' => 14,
    ],

    // Laravel Dashboard API (SmartPropertyWidget)
    'laravel_api' => [
        'base_url' => 'https://sm.smartpropertywidget.com',
        'internal_api_key' => '', // <-- Set this to match Laravel's INTERNAL_API_KEY in .env
    ],
];
