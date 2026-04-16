import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup-tests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/types/',
      ],
    },
    include: [
      'tests/**/*.spec.ts',
      'tests/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/**/*.test.ts',
    ],
    exclude: [
      'node_modules',
      '.next',
      'dist',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
