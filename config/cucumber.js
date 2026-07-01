/**
 * config/cucumber.js
 * -----------------------------------------------------------------------
 * Cucumber-js profile configuration.
 * - Registers ts-node so .ts step definitions run without a manual build.
 * - Wires up multiple report formats: JSON (source of truth for HTML /
 *   Allure conversion), Allure, and a usage/snippet summary.
 * - Supports parallel execution out of the box (`--parallel <n>`).
 * -----------------------------------------------------------------------
 */

const common = [
  'features/**/*.feature',
  '--require-module ts-node/register',
  '--require features/support/**/*.ts',
  '--require features/hooks/**/*.ts',
  '--require features/step-definitions/**/*.ts',
  '--format progress-bar',
  '--format json:reports/cucumber-report.json',
  '--format ./config/allure-formatter.js',
].join(' ');

module.exports = {
  default: common,
  parallel: `${common} --parallel 4`,
};
