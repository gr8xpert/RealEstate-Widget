<?php
/**
 * RealtySoft Page Generator
 *
 * Automatically creates WordPress pages with the correct widget containers.
 * Supports multilingual setups with Polylang and WPML.
 */

if (!defined('ABSPATH')) exit;

class RealtySoft_Page_Generator {

    private static $instance = null;

    // Default page templates by language
    private $default_slugs = [
        'en' => [
            'detail' => 'property',
            'search' => 'properties',
            'wishlist' => 'wishlist'
        ],
        'es' => [
            'detail' => 'propiedad',
            'search' => 'propiedades',
            'wishlist' => 'lista-de-deseos'
        ],
        'de' => [
            'detail' => 'immobilie',
            'search' => 'immobilien',
            'wishlist' => 'wunschliste'
        ],
        'fr' => [
            'detail' => 'propriete',
            'search' => 'proprietes',
            'wishlist' => 'liste-de-souhaits'
        ],
        'nl' => [
            'detail' => 'eigendom',
            'search' => 'eigendommen',
            'wishlist' => 'verlanglijst'
        ],
        'pt' => [
            'detail' => 'propriedade',
            'search' => 'propriedades',
            'wishlist' => 'lista-de-desejos'
        ],
        'it' => [
            'detail' => 'proprieta',
            'search' => 'proprieta-immobiliare',
            'wishlist' => 'lista-dei-desideri'
        ],
    ];

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Create all pages for a language
     *
     * @param string $lang Language code (e.g., 'en', 'es')
     * @param array $config Optional custom slugs
     * @return array Created page IDs and slugs
     */
    public function create_language_pages($lang = 'en', $config = []) {
        $results = [
            'success' => true,
            'pages' => [],
            'errors' => []
        ];

        // Get slugs for this language
        $slugs = $this->get_slugs_for_language($lang, $config);

        // Create Property Detail page
        $detail_result = $this->create_detail_page($slugs['detail'], $lang);
        if ($detail_result['success']) {
            $results['pages']['detail'] = $detail_result['page_id'];
        } else {
            $results['errors'][] = 'Detail page: ' . $detail_result['error'];
        }

        // Create Search/Listing page
        $search_result = $this->create_search_page($slugs['search'], $lang);
        if ($search_result['success']) {
            $results['pages']['search'] = $search_result['page_id'];
        } else {
            $results['errors'][] = 'Search page: ' . $search_result['error'];
        }

        // Create Wishlist page
        $wishlist_result = $this->create_wishlist_page($slugs['wishlist'], $lang);
        if ($wishlist_result['success']) {
            $results['pages']['wishlist'] = $wishlist_result['page_id'];
        } else {
            $results['errors'][] = 'Wishlist page: ' . $wishlist_result['error'];
        }

        // Link pages to Polylang if active
        if (function_exists('pll_set_post_language')) {
            foreach ($results['pages'] as $page_id) {
                pll_set_post_language($page_id, $lang);
            }
        }

        $results['success'] = empty($results['errors']);
        $results['slugs'] = $slugs;

        return $results;
    }

    /**
     * Create property detail page
     */
    public function create_detail_page($slug, $lang = 'en') {
        // Check if page already exists
        $existing = get_page_by_path($slug);
        if ($existing) {
            return [
                'success' => true,
                'page_id' => $existing->ID,
                'message' => 'Page already exists'
            ];
        }

        $content = $this->get_detail_page_content($lang);

        $page_data = [
            'post_title'   => $this->get_page_title('detail', $lang),
            'post_name'    => $slug,
            'post_content' => $content,
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'meta_input'   => [
                '_realtysoft_page_type' => 'detail',
                '_realtysoft_language' => $lang,
            ],
        ];

        $page_id = wp_insert_post($page_data);

        if (is_wp_error($page_id)) {
            return [
                'success' => false,
                'error' => $page_id->get_error_message()
            ];
        }

        return [
            'success' => true,
            'page_id' => $page_id
        ];
    }

    /**
     * Create search/listing page
     */
    public function create_search_page($slug, $lang = 'en') {
        $existing = get_page_by_path($slug);
        if ($existing) {
            return [
                'success' => true,
                'page_id' => $existing->ID,
                'message' => 'Page already exists'
            ];
        }

        $content = $this->get_search_page_content($lang);

        $page_data = [
            'post_title'   => $this->get_page_title('search', $lang),
            'post_name'    => $slug,
            'post_content' => $content,
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'meta_input'   => [
                '_realtysoft_page_type' => 'search',
                '_realtysoft_language' => $lang,
            ],
        ];

        $page_id = wp_insert_post($page_data);

        if (is_wp_error($page_id)) {
            return [
                'success' => false,
                'error' => $page_id->get_error_message()
            ];
        }

        return [
            'success' => true,
            'page_id' => $page_id
        ];
    }

    /**
     * Create wishlist page
     */
    public function create_wishlist_page($slug, $lang = 'en') {
        $existing = get_page_by_path($slug);
        if ($existing) {
            return [
                'success' => true,
                'page_id' => $existing->ID,
                'message' => 'Page already exists'
            ];
        }

        $content = $this->get_wishlist_page_content($lang);

        $page_data = [
            'post_title'   => $this->get_page_title('wishlist', $lang),
            'post_name'    => $slug,
            'post_content' => $content,
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'meta_input'   => [
                '_realtysoft_page_type' => 'wishlist',
                '_realtysoft_language' => $lang,
            ],
        ];

        $page_id = wp_insert_post($page_data);

        if (is_wp_error($page_id)) {
            return [
                'success' => false,
                'error' => $page_id->get_error_message()
            ];
        }

        return [
            'success' => true,
            'page_id' => $page_id
        ];
    }

    /**
     * Get HTML content for detail page
     */
    private function get_detail_page_content($lang) {
        return '<!-- Smart Property Widget - Property Detail -->
<div class="property-detail-container">
    <!-- The property detail component will render here automatically -->
</div>

<!-- Do not remove this container. The widget will populate it with property details when a visitor views a property URL. -->';
    }

    /**
     * Get HTML content for search page
     */
    private function get_search_page_content($lang) {
        return '<!-- Smart Property Widget - Property Search & Listing -->
<div class="rs-search-template-01">
    <!-- Search form renders here -->
</div>

<div class="rs-listing-template-01">
    <!-- Property grid renders here -->
</div>';
    }

    /**
     * Get HTML content for wishlist page
     */
    private function get_wishlist_page_content($lang) {
        return '<!-- Smart Property Widget - Wishlist -->
<div class="rs_wishlist_list">
    <!-- Saved properties will display here -->
</div>

<!-- This page shows the visitor\'s saved/favorite properties. -->';
    }

    /**
     * Get page title by type and language
     */
    private function get_page_title($type, $lang) {
        $titles = [
            'en' => [
                'detail' => 'Property',
                'search' => 'Properties',
                'wishlist' => 'My Wishlist'
            ],
            'es' => [
                'detail' => 'Propiedad',
                'search' => 'Propiedades',
                'wishlist' => 'Mi Lista de Deseos'
            ],
            'de' => [
                'detail' => 'Immobilie',
                'search' => 'Immobilien',
                'wishlist' => 'Meine Wunschliste'
            ],
            'fr' => [
                'detail' => 'Propriété',
                'search' => 'Propriétés',
                'wishlist' => 'Ma Liste de Souhaits'
            ],
            'nl' => [
                'detail' => 'Eigendom',
                'search' => 'Eigendommen',
                'wishlist' => 'Mijn Verlanglijst'
            ],
            'pt' => [
                'detail' => 'Propriedade',
                'search' => 'Propriedades',
                'wishlist' => 'Minha Lista de Desejos'
            ],
        ];

        return $titles[$lang][$type] ?? $titles['en'][$type];
    }

    /**
     * Get slugs for a language
     */
    private function get_slugs_for_language($lang, $config = []) {
        $defaults = $this->default_slugs[$lang] ?? $this->default_slugs['en'];

        return [
            'detail' => $config['detail'] ?? $defaults['detail'],
            'search' => $config['search'] ?? $defaults['search'],
            'wishlist' => $config['wishlist'] ?? $defaults['wishlist'],
        ];
    }

    /**
     * Get default slugs for a language
     */
    public function get_default_slugs($lang = 'en') {
        return $this->default_slugs[$lang] ?? $this->default_slugs['en'];
    }

    /**
     * Get all supported languages
     */
    public function get_supported_languages() {
        return array_keys($this->default_slugs);
    }

    /**
     * Delete pages created by the installer
     */
    public function delete_pages_for_language($lang) {
        $pages = get_posts([
            'post_type' => 'page',
            'meta_query' => [
                [
                    'key' => '_realtysoft_language',
                    'value' => $lang,
                ],
            ],
            'numberposts' => -1,
        ]);

        $deleted = 0;
        foreach ($pages as $page) {
            if (wp_delete_post($page->ID, true)) {
                $deleted++;
            }
        }

        return $deleted;
    }
}
