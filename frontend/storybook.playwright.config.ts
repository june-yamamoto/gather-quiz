import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './storybook-tests', timeout: 30000, workers: 1,
  use: { baseURL: 'http://localhost:6006', headless: true },
  webServer: { command: 'npm run storybook -- --ci', url: 'http://localhost:6006', reuseExistingServer: !process.env.CI },
});
