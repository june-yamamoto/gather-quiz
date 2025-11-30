import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    setupFiles: ['./test/setup.ts'],
    env: {
      DATABASE_URL: 'file:./test.db',
    },
  },
});
