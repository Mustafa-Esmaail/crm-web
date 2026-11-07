import { defineConfig, devices } from '@playwright/test';

import { AUTH_FILE } from './e2e/helpers';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

// The e2e suite drives the real app against the seeded demo API (see README).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    // These test signing in itself, so they start with no session.
    { name: 'anonymous', testMatch: /auth\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'signed-in',
      testIgnore: [/auth\.setup\.ts/, /auth\.spec\.ts/],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
    },
  ],
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
