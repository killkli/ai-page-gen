import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    define: {
      // 環境變數定義
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(
        'AI English Teaching Generator'
      ),
      'import.meta.env.VITE_ENABLE_SPEECH': JSON.stringify('true'),
      'import.meta.env.VITE_ENABLE_MATH_RENDER': JSON.stringify('false'),
      'import.meta.env.VITE_ENABLE_BRANCH_RECOMMENDATION':
        JSON.stringify('false'),
    },
    base: '/ai-page-gen/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'AI 學習頁面產生器',
          short_name: 'AI-LearnGen',
          description: 'AI 驅動的教育內容生成工具',
          theme_color: '#4F46E5',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/ai-page-gen/',
          scope: '/ai-page-gen/',
          icons: [
            {
              src: '/ai-page-gen/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/ai-page-gen/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.jsonbin\.io\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'jsonbin-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],

    // Optimized build configuration
    build: {
      target: 'es2020', // Modern target for better optimization
      sourcemap: !isProd,
      minify: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          // Improved chunking strategy
          manualChunks: id => {
            // Core React libraries
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'react-vendor';
            }

            // AI/ML libraries
            if (id.includes('@google/genai') || id.includes('google-genai')) {
              return 'ai-vendor';
            }

            // UI utilities and markdown
            if (
              id.includes('react-markdown') ||
              id.includes('qrcode') ||
              id.includes('tailwind')
            ) {
              return 'ui-utilities';
            }

            // Component chunks for large component groups
            if (
              id.includes('/components/quizTypes/') ||
              id.includes('/components/InteractiveLearning/')
            ) {
              return 'interactive-components';
            }

            if (
              id.includes('/components/TeacherInteractivePrep/') ||
              id.includes('/components/WritingPractice')
            ) {
              return 'teacher-components';
            }

            // Service layer
            if (id.includes('/services/')) {
              return 'app-services';
            }

            // Large node_modules libraries
            if (id.includes('node_modules')) {
              const chunks = id.split('node_modules/')[1].split('/')[0];
              if (
                ['@babel', '@types', 'core-js'].some(pkg =>
                  chunks.startsWith(pkg)
                )
              ) {
                return 'polyfills';
              }
              return 'vendor';
            }
          },

          // Optimize chunk filenames
          chunkFileNames: _chunkInfo => {
            return `assets/[name]-[hash].js`;
          },

          assetFileNames: assetInfo => {
            if (
              /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? '')
            ) {
              return `assets/images/[name]-[hash].[extname]`;
            }
            if (/\.(css)$/i.test(assetInfo.name ?? '')) {
              return `assets/styles/[name]-[hash].[extname]`;
            }
            return `assets/[name]-[hash].[extname]`;
          },
        },

        // External dependencies (if any should be external)
        external: [],

        // Tree-shaking optimizations
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
    },

    // Development optimizations
    server: {
      hmr: true,
      open: false,
    },

    // Dependency optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@google/genai'],
      exclude: [],
    },

    // CSS optimization
    css: {
      devSourcemap: !isProd,
    },
  };
});
