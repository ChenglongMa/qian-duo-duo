import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.spec.ts']
  },
  resolve: {
    alias: {
      '@qdd/shared': new URL('../../packages/shared/src/index.ts', import.meta.url).pathname
    }
  }
});
