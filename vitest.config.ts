import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Obter o diretório do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    css: false, // Ignora arquivos CSS durante os testes
    coverage: {
      reporter: ['text', 'html'], // Gera relatórios no terminal e em HTML
      all: true, // Inclui todos os arquivos no relatório, mesmo os não testados
      include: ['src/**/*.{ts,tsx}'], // Inclui apenas arquivos relevantes
      exclude: ['src/tests/**/*', 'src/mocks/**/*'], // Exclui arquivos de testes e mocks
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
