import js from '@eslint/js';
import globals from 'globals';

export default [
  // Apply recommended JS rules
  js.configs.recommended,

  // Configuration for source files
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script', // IIFE pattern uses script mode
      globals: {
        // Browser globals
        ...globals.browser,

        // RealtySoft core modules (used by components)
        RealtySoft: 'readonly',
        RealtySoftState: 'readonly',
        RealtySoftAPI: 'readonly',
        RealtySoftLabels: 'readonly',
        RealtySoftAnalytics: 'readonly',
        RealtySoftToast: 'readonly',
        RSBaseComponent: 'readonly',
        WishlistManager: 'readonly',

        // Detail component classes (defined locally but used globally)
        RSDetailBackButton: 'writable',
        RSDetailGallery: 'writable',
        RSDetailMap: 'writable',
        RSDetailInquiryForm: 'writable',
        RSDetailShare: 'writable',
        RSDetailRelated: 'writable',
        RSDetailInfoTable: 'writable',
        RSDetailSpecs: 'writable',
        RSDetailSizes: 'writable',
        RSDetailTaxes: 'writable',
        RSDetailEnergy: 'writable',
        RSDetailResources: 'writable',
        RSDetailPdfButton: 'writable',
        RSDetailFeatures: 'writable',
        RSDetailWishlist: 'writable',

        // Wishlist component classes (defined locally but used globally)
        RSWishlistSharedBanner: 'writable',
        RSWishlistHeader: 'writable',
        RSWishlistActions: 'writable',
        RSWishlistSort: 'writable',
        RSWishlistEmpty: 'writable',
        RSWishlistGrid: 'writable',
        RSWishlistCompareBtn: 'writable',
        RSWishlistModals: 'writable',

        // Node.js for module exports check
        module: 'readonly',
      },
    },
    rules: {
      // Relax rules for existing codebase
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^RS',  // Ignore RS* component classes
      }],
      'no-console': 'off',
      'no-undef': 'error',
      'no-redeclare': 'off', // Disabled because components define classes globally
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-prototype-builtins': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'eqeqeq': ['warn', 'smart'],
      'curly': ['warn', 'multi-line'],
      'no-throw-literal': 'error',
      'no-return-await': 'warn',
      'require-await': 'off',
      'no-async-promise-executor': 'warn',
      'no-case-declarations': 'warn', // Downgrade to warning
      'no-unreachable': 'warn', // Downgrade to warning
    },
  },

  // Test files configuration
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },

  // Build scripts configuration
  {
    files: ['build.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },

  // ES module config files
  {
    files: ['vitest.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'php/**',
      'src/templates/**/*.html',
    ],
  },
];
