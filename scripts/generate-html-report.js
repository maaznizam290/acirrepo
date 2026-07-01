/**
 * scripts/generate-html-report.js
 * -----------------------------------------------------------------------
 * Converts the raw Cucumber JSON output (reports/cucumber-report.json)
 * into a polished, multi-page HTML report using
 * `multiple-cucumber-html-reporter`.
 *
 * Run via: npm run report:html:generate (wired in package.json) or
 * directly: node scripts/generate-html-report.js
 * -----------------------------------------------------------------------
 */

const report = require('multiple-cucumber-html-reporter');
const os = require('os');
const path = require('path');

report.generate({
  jsonDir: path.resolve(__dirname, '..', 'reports'),
  reportPath: path.resolve(__dirname, '..', 'reports', 'cucumber-html-report'),
  reportName: 'Enterprise Playwright + Cucumber Automation Report',
  pageTitle: 'CSR Order Creation — Automation Report',
  displayDuration: true,
  metadata: {
    browser: {
      name: process.env.BROWSER || 'chromium',
      version: 'latest',
    },
    device: os.hostname(),
    platform: {
      name: os.platform(),
      version: os.release(),
    },
  },
  customData: {
    title: 'Run Info',
    data: [
      { label: 'Project', value: 'Playwright + Cucumber Enterprise Framework' },
      { label: 'Environment', value: process.env.ENV || 'qa' },
      { label: 'Execution Start Time', value: new Date().toISOString() },
    ],
  },
});
