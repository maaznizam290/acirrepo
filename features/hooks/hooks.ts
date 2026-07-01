/**
 * features/hooks/hooks.ts
 * -----------------------------------------------------------------------
 * Global Cucumber lifecycle hooks.
 *  - BeforeAll: nothing global to start (each scenario gets its own
 *    isolated browser instance for maximum test isolation, which also
 *    makes `--parallel` execution safe).
 *  - Before: launches the configured browser, opens a fresh context
 *    + page, wires up the World's page objects.
 *  - After: captures a screenshot on failure, attaches it to the
 *    report, decides whether to keep the trace/video, then tears the
 *    browser down — guaranteeing no leaked processes between
 *    scenarios even if a step throws.
 * -----------------------------------------------------------------------
 */

import { After, Before, Status } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { Logger } from '../../utils/Logger';

Before(async function (this: CustomWorld, { pickle }) {
  Logger.info(`========== STARTING SCENARIO: ${pickle.name} ==========`);
  await this.browserManager.launchBrowser();
  const page = await this.browserManager.newPage(pickle.name);
  this.initializePageObjects(page);
});

After(async function (this: CustomWorld, { pickle, result }) {
  const scenarioFailed = result?.status === Status.FAILED;

  if (scenarioFailed) {
    Logger.error(`Scenario FAILED: ${pickle.name}`);
    try {
      await this.screenshotHelper.captureOnFailure(pickle.name, (data, mediaType) =>
        this.attach(data, mediaType)
      );
    } catch (error) {
      Logger.error('Failed to capture/attach failure screenshot', {
        error: (error as Error).message,
      });
    }
  } else {
    Logger.info(`Scenario PASSED: ${pickle.name}`);
  }

  await this.browserManager.closeWithTrace(pickle.name, scenarioFailed);
  Logger.info(`========== FINISHED SCENARIO: ${pickle.name} ==========\n`);
});
