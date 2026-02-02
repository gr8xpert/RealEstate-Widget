<?php
/**
 * Smart Property Widget - Analytics Client Credentials
 *
 * Add clients who should have access to their analytics dashboard.
 * Each client has:
 * - username: Login username
 * - password: Hashed password (use password_hash() to generate)
 * - display_name: Human-readable name shown in dashboard (defaults to domain if not set)
 * - domain: The domain this client's analytics are stored under
 *
 * To generate a password hash, run in PHP:
 * echo password_hash('YourPassword123', PASSWORD_DEFAULT);
 */

return [
    // Smart Property Widget main site
    'smartpropertywidget.com' => [
        'username' => 'admin',
        'password' => password_hash('SPW_Admin_2026', PASSWORD_DEFAULT),
        'display_name' => 'smartpropertywidget.com',
        'domain' => 'smartpropertywidget.com'
    ],

    // Demo site
    'witos323.sg-host.com' => [
        'username' => 'witos',
        'password' => password_hash('WitosDemo2024', PASSWORD_DEFAULT),
        'display_name' => 'witos323.sg-host.com',
        'domain' => 'witos323.sg-host.com'
    ],

    // Add more clients here
    // 'example.com' => [
    //     'username' => 'example',
    //     'password' => password_hash('SecurePassword123', PASSWORD_DEFAULT),
    //     'display_name' => 'Example Real Estate',
    //     'domain' => 'example.com'
    // ],
];
