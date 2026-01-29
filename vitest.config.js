import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',

    // Test files pattern
    include: ['tests/**/*.test.{js,ts}'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/templates/**',
        'src/types/**',
        'src/index.ts',        // Entry point (import aggregator)
        'src/index-es.ts',     // ES entry point (import aggregator)
        'src/components/search/index.ts',  // Barrel file
        'src/components/listing/index.ts', // Barrel file
        'src/components/detail/index.ts',  // Barrel file
        'src/components/utility/index.ts', // Barrel file
      ],
      thresholds: {
        lines: 60,
        branches: 60,
        functions: 70,
      },
    },

    // Global setup
    globals: true,

    // Setup files run before each test file
    setupFiles: ['./tests/setup.js'],
  },
});
