/**
 * utils/CommonActions.ts
 * -----------------------------------------------------------------------
 * Generic, reusable action wrappers (click, fill, select, hover, etc.)
 * used by every Page Object. Each method:
 *   - Waits for the element appropriately before interacting.
 *   - Logs the action for traceability.
 *   - Wraps Playwright errors with a descriptive, business-readable
 *     message (custom exception handling) instead of letting a raw
 *     Playwright TimeoutError bubble up unexplained.
 *
 * Page Objects compose this class instead of duplicating wait+act+log
 * boilerplate (DRY).
 * -----------------------------------------------------------------------
 */

import { Locator, Page } from '@playwright/test';
import { Logger } from './Logger';
import { WaitHelper } from './WaitHelper';

export class CommonActions {
  private readonly waitHelper: WaitHelper;

  constructor(private readonly page: Page) {
    this.waitHelper = new WaitHelper(page);
  }

  /**
   * Wraps an async action with consistent logging and a contextual
   * error message on failure, instead of repeating try/catch in
   * every single method below.
   */
  private async runSafely<T>(actionDescription: string, action: () => Promise<T>): Promise<T> {
    try {
      Logger.step(actionDescription);
      return await action();
    } catch (error) {
      const message = `Failed to perform action [${actionDescription}]: ${(error as Error).message}`;
      Logger.error(message);
      throw new Error(message);
    }
  }

  public async click(locator: Locator, description: string): Promise<void> {
    await this.runSafely(`Click -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      await locator.scrollIntoViewIfNeeded();
      await locator.click();
    });
  }

  public async fill(locator: Locator, value: string, description: string): Promise<void> {
    await this.runSafely(`Fill "${value}" -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      await locator.fill('');
      await locator.fill(value);
    });
  }

  public async type(locator: Locator, value: string, description: string): Promise<void> {
    await this.runSafely(`Type "${value}" -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      await locator.pressSequentially(value, { delay: 50 });
    });
  }

  public async selectByLabel(locator: Locator, label: string, description: string): Promise<void> {
    await this.runSafely(`Select "${label}" -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      await locator.selectOption({ label });
    });
  }

  public async check(locator: Locator, description: string): Promise<void> {
    await this.runSafely(`Check -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      await locator.check();
    });
  }

  public async getText(locator: Locator, description: string): Promise<string> {
    return this.runSafely(`Get text -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      return (await locator.textContent())?.trim() ?? '';
    });
  }

  public async isVisible(locator: Locator, timeoutMs = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  public async hover(locator: Locator, description: string): Promise<void> {
    await this.runSafely(`Hover -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      await locator.hover();
    });
  }

  public async pressKey(key: string, description: string): Promise<void> {
    await this.runSafely(`Press key "${key}" -> ${description}`, async () => {
      await this.page.keyboard.press(key);
    });
  }

  /**
   * Generic "increase quantity" helper that handles either:
   *   (a) a numeric input field where the value can be set directly, or
   *   (b) a stepper "+" button that must be clicked N times.
   * Page Objects decide which strategy fits their DOM and pass a
   * pre-bound action; this method just supplies the safe retry/log
   * wrapper around it.
   */
  public async setNumericValue(
    locator: Locator,
    value: number,
    description: string
  ): Promise<void> {
    await this.runSafely(`Set quantity to ${value} -> ${description}`, async () => {
      await this.waitHelper.waitForVisible(locator);
      await locator.fill(value.toString());
      await locator.press('Tab');
    });
  }

  public async clickNTimes(locator: Locator, times: number, description: string): Promise<void> {
    await this.runSafely(`Click ${times}x -> ${description}`, async () => {
      for (let i = 0; i < times; i += 1) {
        await this.waitHelper.waitForVisible(locator);
        await locator.click();
      }
    });
  }
}
