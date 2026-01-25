import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RealtySoft',
      // Output file names
      fileName: (format) => {
        if (format === 'iife') return 'realtysoft.js';
        if (format === 'es') return 'realtysoft.es.js';
        return `realtysoft.${format}.js`;
      },
      // Output formats: IIFE for script tags, ES for modules
      formats: ['iife', 'es'],
    },
    rollupOptions: {
      output: {
        // Global variable name for IIFE build
        name: 'RealtySoft',
        // Preserve module structure for ES build
        preserveModules: false,
        // Add banner comment
        banner: '/*! RealtySoft Widget v3.0.0 */\n',
      },
    },
    // Output directory
    outDir: 'dist',
    // Generate source maps
    sourcemap: true,
    // Minify with esbuild (built-in, faster)
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: false,
  },

  // CSS options
  css: {
    // Generate source maps for CSS
    devSourcemap: true,
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@components': resolve(__dirname, 'src/components'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },

  // Define global constants
  define: {
    __VERSION__: JSON.stringify('3.0.0'),
  },
});
