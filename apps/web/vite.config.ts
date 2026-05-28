import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@qdd/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts']
  }
});
