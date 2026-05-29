import { defineConfig, devices } from '@playwright/test';

const apiPort = process.env.API_PORT ?? '3000';
const webPort = process.env.WEB_PORT ?? '5173';
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const webBaseUrl = `http://127.0.0.1:${webPort}`;

const sharedEnv = {
  ...process.env,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'CorrectHorse!2026',
  API_PORT: apiPort,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    'postgresql://qdd:qdd_dev_password@localhost:15432/qdd_dev?schema=public',
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'e2e-session-secret-change-me',
  WEB_ORIGIN: webBaseUrl
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: webBaseUrl,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      name: 'api',
      command: 'pnpm --filter @qdd/api dev',
      url: `${apiBaseUrl}/health`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: sharedEnv
    },
    {
      name: 'web',
      command: 'pnpm --filter @qdd/web dev -- --host 127.0.0.1',
      url: webBaseUrl,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...sharedEnv,
        VITE_API_BASE_URL: apiBaseUrl
      }
    }
  ]
});
