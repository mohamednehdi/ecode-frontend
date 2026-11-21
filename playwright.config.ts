import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests: a real browser drives the real site, which talks to the real backend (see e2e/main-flow.spec.ts).
 *
 * The servers are NOT started by this file: start the backend and `ng serve` first (the CI pipeline does it, see
 * .github/workflows/ci.yml). Settings from the environment:
 *   BASE_URL                 address of the site            (default http://localhost:4200)
 *   API_URL                  address of the backend         (default http://localhost:5000)
 *   ADMIN_EMAIL, ADMIN_PASSWORD   an administrator account of the test database
 *   E2E_BROWSER_CHANNEL      e.g. "msedge" to use an installed Edge instead of a downloaded Chromium
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,                      // one shared database: the tests run one after the other
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: process.env['E2E_BROWSER_CHANNEL'] || undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
