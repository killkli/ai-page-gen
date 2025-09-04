import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // 確定分支類型和對應的基礎路徑
    const branchType = env.VITE_BRANCH_TYPE || 'main';
    const basePaths = {
      main: '/ai-page-gen/',
      english: '/ai-page-gen-english/',
      math: '/ai-page-gen-math/'
    };
    
    const basePath = env.VITE_BASE_URL || basePaths[branchType as keyof typeof basePaths] || basePaths.main;
    
    return {
      define: {
        // 原有的環境變數
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        
        // 新增分支相關環境變數
        'import.meta.env.VITE_BRANCH_TYPE': JSON.stringify(branchType),
        'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME || 'AI Learning Page Generator'),
        'import.meta.env.VITE_BASE_URL': JSON.stringify(basePath),
        
        // 分支特定功能開關
        'import.meta.env.VITE_ENABLE_SPEECH': JSON.stringify(branchType === 'english' ? 'true' : 'false'),
        'import.meta.env.VITE_ENABLE_MATH_RENDER': JSON.stringify(branchType === 'math' ? 'true' : 'false'),
        'import.meta.env.VITE_ENABLE_BRANCH_RECOMMENDATION': JSON.stringify(branchType === 'main' ? 'true' : 'false'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@core': path.resolve(__dirname, 'src/core'),
          '@config': path.resolve(__dirname, 'src/config'),
          '@components': path.resolve(__dirname, 'components'),
          '@services': path.resolve(__dirname, 'services'),
          '@utils': path.resolve(__dirname, 'utils'),
          '@themes': path.resolve(__dirname, 'src/themes'),
        }
      },
      base: basePath,
      plugins: [react()],
      
      // 優化構建配置
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              ai: ['@google/genai'],
              core: ['src/core/types', 'src/core/services', 'src/config'],
            }
          }
        },
        // 根據分支類型進行條件性構建優化
        ...(branchType === 'english' && {
          // 英文分支特定優化
          chunkSizeWarningLimit: 1000, // 語音功能會增加包大小
        }),
        ...(branchType === 'math' && {
          // 數學分支特定優化
          chunkSizeWarningLimit: 1200, // 數學渲染庫會增加包大小
        })
      },
      
      // 開發服務器配置
      server: {
        port: branchType === 'english' ? 5174 : branchType === 'math' ? 5175 : 5173,
        open: true,
      },
      
      // 預覽服務器配置
      preview: {
        port: branchType === 'english' ? 4174 : branchType === 'math' ? 4175 : 4173,
      }
    };
});
