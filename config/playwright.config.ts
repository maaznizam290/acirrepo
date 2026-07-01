/**
 * config/playwright.config.ts
 * -----------------------------------------------------------------------
 * Playwright configuration used both by the BrowserManager (for the
 * Cucumber/BDD run) and available for native Playwright Test runs if
 * the team ever wants to run a hybrid suite.
 *
 * NOTE: Cucumber-js does not consume this file automatically — it is
 * read by utils/BrowserManager.ts to keep a SINGLE SOURCE OF TRUTH for
 * timeouts, projects (cross-browser), and trace/video/screenshot policy
 * instead of duplicating these values in two places.
 * -----------------------------------------------------------------------
 */

import { defineConfig, devices } from '@playwright/test';
import { env } from './env';

export default defineConfig({
  timeout: env.timeouts.default,
  expect: {
    timeout: env.timeouts.action,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: env.retryCount,
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html-report', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-report.json' }],
  ],

  use: {
    baseURL: env.baseUrl,
    headless: env.headless,
    actionTimeout: env.timeouts.action,
    navigationTimeout: env.timeouts.navigation,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  },

  outputDir: 'test-results/',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
});
