/**
 * utils/WaitHelper.ts
 * -----------------------------------------------------------------------
 * Reusable, explicit wait strategies built on top of Playwright's
 * auto-waiting locators. Centralizing waits here means:
 *   - No magic numbers scattered through step definitions.
 *   - Consistent timeout/error-message behavior everywhere.
 *   - A single place to tune retry/backoff behavior later.
 *
 * NOTE on "wait exactly N seconds" steps:
 * The user-specified flow asks for two literal fixed-duration waits
 * (5s and 3s and 2s) to accommodate slow client-side search/cart
 * widgets that do not expose a reliable network/DOM signal to wait on.
 * `waitForFixedDelay()` exists specifically (and only) for that documented
 * purpose — every other wait in this framework is condition-based.
 * -----------------------------------------------------------------------
 */

import { Locator, Page } from '@playwright/test';
import { env } from '../config/env';
import { Logger } from './Logger';

export class WaitHelper {
  constructor(private readonly page: Page) {}

  /** Waits until the locator is visible in the DOM and viewport. */
  public async waitForVisible(
    locator: Locator,
    timeout: number = env.timeouts.action
  ): Promise<void> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      Logger.error(`[WaitHelper] Element not visible within ${timeout}ms`, {
        error: (error as Error).message,
      });
      throw new Error(`Element was not visible within ${timeout}ms: ${(error as Error).message}`);
    }
  }

  /** Waits until the locator is attached and enabled for interaction. */
  public async waitForEnabled(
    locator: Locator,
    timeout: number = env.timeouts.action
  ): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout });
    await this.page.waitForFunction(
      async (el) => el && !(el as HTMLButtonElement).disabled,
      await locator.elementHandle(),
      { timeout }
    );
  }

  /** Waits until the locator is detached/hidden (e.g., a loading spinner). */
  public async waitForHidden(
    locator: Locator,
    timeout: number = env.timeouts.action
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /** Waits for full page load state (network mostly idle). */
  public async waitForPageLoad(timeout: number = env.timeouts.navigation): Promise<void> {
    await this.page.waitForLoadState('load', { timeout });
  }

  /** Waits for a specific URL pattern (post-navigation assertion helper). */
  public async waitForUrlContains(
    fragment: string,
    timeout: number = env.timeouts.navigation
  ): Promise<void> {
    await this.page.waitForURL(`**/*${fragment}*`, { timeout });
  }

  /** Polls a condition function until it returns true or times out. */
  public async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = env.timeouts.action,
    pollInterval = 250
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) return;
      await this.page.waitForTimeout(pollInterval);
    }
    throw new Error(`[WaitHelper] Condition not satisfied within ${timeout}ms`);
  }

  /**
   * Fixed-duration wait. Used ONLY for the explicitly specified
   * "wait exactly N seconds" steps in the order-creation flow, where
   * the target application's autocomplete/cart widgets settle
   * asynchronously without a deterministic DOM/network signal.
   * Intentionally not used anywhere else in the framework.
   */
  public async waitForFixedDelay(seconds: number, reason: string): Promise<void> {
    Logger.step(`Waiting exactly ${seconds}s — reason: ${reason}`);
    await this.page.waitForTimeout(seconds * 1000);
  }
}
