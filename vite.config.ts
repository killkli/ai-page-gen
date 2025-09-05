import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
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
      
      // 簡化的構建配置
      build: {
        target: 'es2015',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              ai: ['@google/genai'],
              utilities: ['react-markdown', 'qrcode']
            }
          }
        }
      }
    };
});
