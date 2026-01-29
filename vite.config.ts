import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isESBuild = mode === 'es';
  const isSWBuild = mode === 'sw';

  if (isSWBuild) {
    return {
      build: {
        outDir: 'dist',
        lib: {
          entry: resolve(__dirname, 'src/sw.ts'),
          formats: ['es'],
          fileName: () => 'realtysoft-sw.js',
        },
        rollupOptions: {
          output: {
            banner: '/*! RealtySoft Service Worker v3.0.0 */\n',
          },
        },
        sourcemap: false,
        minify: 'esbuild',
        cssCodeSplit: false,
        emptyOutDir: false,
      },
      define: {
        __VERSION__: JSON.stringify('3.0.0'),
      },
    };
  }

  return {
    build: isESBuild
      ? {
          // ES module build — code-split
          outDir: 'dist/es',
          lib: {
            entry: resolve(__dirname, 'src/index-es.ts'),
            formats: ['es'],
          },
          rollupOptions: {
            output: {
              banner: '/*! RealtySoft Widget v3.0.0 (ES) */\n',
              entryFileNames: 'core.js',
              chunkFileNames: 'realtysoft-[name].js',
              manualChunks: {
                search: [resolve(__dirname, 'src/components/search/index.ts')],
                listing: [resolve(__dirname, 'src/components/listing/index.ts')],
                detail: [resolve(__dirname, 'src/components/detail/index.ts')],
                utility: [resolve(__dirname, 'src/components/utility/index.ts')],
              },
            },
          },
          sourcemap: true,
          minify: 'esbuild',
          cssCodeSplit: false,
        }
      : {
          // IIFE monolithic build (default) — backward compatible
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'RealtySoft',
            fileName: (format: string) => {
              if (format === 'iife') return 'realtysoft.js';
              if (format === 'es') return 'realtysoft.es.js';
              return `realtysoft.${format}.js`;
            },
            formats: ['iife', 'es'],
          },
          rollupOptions: {
            output: {
              name: 'RealtySoft',
              preserveModules: false,
              banner: '/*! RealtySoft Widget v3.0.0 */\n',
            },
          },
          outDir: 'dist',
          sourcemap: true,
          minify: 'esbuild',
          cssCodeSplit: false,
        },

    // CSS options
    css: {
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
  };
});
