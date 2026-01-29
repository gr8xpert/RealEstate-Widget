<?php
/**
 * RealtySoft Widget v2 - Client Configuration
 * Domain whitelist with API credentials and features
 */

return [
    // Example client configuration
    'example.com' => [
        'api_key' => 'your-api-key-here',
        'api_url' => 'https://crm.example.com',
        'enabled' => true,
		'owner_email' => 'info@costacasas.pl',
        'features' => ['search', 'detail', 'wishlist', 'analytics'],
        'default_language' => 'en_US',
        'site_name' => 'Example Properties'
    ],

    // Development/localhost
    'localhost' => [
        'api_key' => 'dev-api-key',
        'api_url' => 'https://api.realtysoft.dev',
        'enabled' => true,
		'owner_email' => 'info@costacasas.pl',
        'features' => ['search', 'detail', 'wishlist', 'analytics'],
        'default_language' => 'en_US',
        'site_name' => 'RealtySoft Dev',
        // AI Search (Premium Feature) - Enable for local testing
        'ai_search_enabled' => true,
        'openrouter_api_key' => 'sk-or-v1-xxxxx', // Replace with actual key for testing
        'openrouter_model' => 'openai/gpt-3.5-turbo',
    ],

    // Test domain
    'witos323.sg-host.com' => [
        'api_key' => 'CP1-3081321dd784d5ad68ff6d022109d6021e4e1b6e',
        'api_url' => 'https://crm.costacasas.pl',
        'enabled' => true,
		'owner_email' => 'webmaster@realtysoft.eu',
        'features' => ['search', 'detail', 'wishlist', 'analytics'],
        'default_language' => 'en_US',
        'site_name' => 'Costa Casas',
        // AI Search (Premium Feature)
        'ai_search_enabled' => true,
        'openrouter_api_key' => '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', // Replace with actual key
        'openrouter_model' => 'openai/gpt-3.5-turbo',
    ],

    // Add more clients below:
    // 'domain.com' => [
    //     'api_key' => 'xxx',
    //     'api_url' => 'https://crm.xxx.com',
    //     'enabled' => true,
    //     'features' => ['search', 'detail', 'wishlist', 'analytics']
    // ]
];
