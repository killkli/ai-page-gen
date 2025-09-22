import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProd = mode === 'production';

    return {
      define: {
        // 環境變數定義
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_APP_NAME': JSON.stringify('AI English Teaching Generator'),
        'import.meta.env.VITE_ENABLE_SPEECH': JSON.stringify('true'),
        'import.meta.env.VITE_ENABLE_MATH_RENDER': JSON.stringify('false'),
        'import.meta.env.VITE_ENABLE_BRANCH_RECOMMENDATION': JSON.stringify('false'),
      },
      base: '/ai-page-gen/',
      plugins: [react()],

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
            manualChunks: (id) => {
              // Core React libraries
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }

              // AI/ML libraries
              if (id.includes('@google/genai') || id.includes('google-genai')) {
                return 'ai-vendor';
              }

              // UI utilities and markdown
              if (id.includes('react-markdown') || id.includes('qrcode') || id.includes('tailwind')) {
                return 'ui-utilities';
              }

              // Component chunks for large component groups
              if (id.includes('/components/quizTypes/') || id.includes('/components/InteractiveLearning/')) {
                return 'interactive-components';
              }

              if (id.includes('/components/TeacherInteractivePrep/') || id.includes('/components/WritingPractice')) {
                return 'teacher-components';
              }

              // Service layer
              if (id.includes('/services/') && !id.includes('geminiService')) {
                return 'app-services';
              }

              // Gemini service separate for better caching
              if (id.includes('geminiService') || id.includes('geminiServiceAdapter')) {
                return 'gemini-service';
              }

              // Large node_modules libraries
              if (id.includes('node_modules')) {
                const chunks = id.split('node_modules/')[1].split('/')[0];
                if (['@babel', '@types', 'core-js'].some(pkg => chunks.startsWith(pkg))) {
                  return 'polyfills';
                }
                return 'vendor';
              }
            },

            // Optimize chunk filenames
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'chunk';
              return `assets/[name]-[hash].js`;
            },

            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                return `assets/images/[name]-[hash][extname]`;
              }
              if (/\.(css)$/i.test(assetInfo.name)) {
                return `assets/styles/[name]-[hash][extname]`;
              }
              return `assets/[name]-[hash][extname]`;
            }
          },

          // External dependencies (if any should be external)
          external: [],

          // Tree-shaking optimizations
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          }
        }
      },

      // Development optimizations
      server: {
        hmr: true,
        open: false
      },

      // Dependency optimization
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@google/genai'
        ],
        exclude: []
      },

      // CSS optimization
      css: {
        devSourcemap: !isProd
      }
    };
});
