import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    css: false, // Ignore CSS files during tests
    coverage: {
      reporter: ['text', 'html'], // Generate reports in terminal and HTML
      all: true, // Include all files in the report, even those not tested
      include: ['src/**/*.{ts,tsx}'], // Include only relevant files
      exclude: ['src/tests/**/*', 'src/mocks/**/*'], // Exclude test and mock files
    },
    // Add explicit node options to ensure ESM is used
    deps: {
      inline: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
