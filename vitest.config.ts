import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // Only run unit tests under src/__tests__ to avoid picking up Playwright e2e files
    include: ['src/__tests__/**'],
    // Exclude end-to-end tests (Playwright) and test setup helper from Vitest runs
    exclude: ['e2e/**', 'src/__tests__/setup.ts'],
    // Run tests in a single thread to avoid worker temporary-dir race conditions in this environment
    threads: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
