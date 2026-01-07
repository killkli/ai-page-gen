import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.{ts,tsx}', 'services/**/*.ts', 'components/**/*.tsx'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/types.ts',
      ],
      thresholds: {
        global: {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
        },
      },
    },
  },
});
