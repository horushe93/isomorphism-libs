import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**', 'src/**'],
    },
    reporters: ['default', 'json', 'html'],
    // setupFiles: ['./test/setup.ts'],
    // testTimeout: 1000 * 10,
  },
});
