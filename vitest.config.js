import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',

    // Test files pattern
    include: ['tests/**/*.test.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.js'],
      exclude: ['src/templates/**'],
    },

    // Global setup
    globals: true,

    // Setup files run before each test file
    setupFiles: ['./tests/setup.js'],
  },
});
