import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
  webServer: [
    {
      command: 'cp backend/prisma/schema.prisma backend/prisma/schema.original.prisma && cp backend/prisma/schema.e2e.prisma backend/prisma/schema.prisma && cd backend && DATABASE_URL="file:./test.db" npx prisma generate && DATABASE_URL="file:./test.db" npx prisma db push && NODE_ENV=test DATABASE_URL="file:./test.db" npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
    },
    {
      command: 'npm run dev --prefix frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
    },
  ],
});
