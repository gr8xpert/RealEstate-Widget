<?php
/**
 * RealtySoft Widget v2 - Analytics Client Credentials
 *
 * Add clients who should have access to their analytics dashboard.
 * Each client has:
 * - username: Login username
 * - password: Hashed password (use password_hash() to generate)
 * - display_name: Human-readable name shown in dashboard
 * - domain: The domain this client's analytics are stored under
 *
 * To generate a password hash, run in PHP:
 * echo password_hash('YourPassword123', PASSWORD_DEFAULT);
 */

return [
    // Example client - replace with real credentials
    'witos323.sg-host.com' => [
        'username' => 'witos',
        'password' => password_hash('Aj$xChamp2025$', PASSWORD_DEFAULT),
        'display_name' => 'Witos Demo Site',
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
