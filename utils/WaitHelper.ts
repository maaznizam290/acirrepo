import { Locator, Page } from '@playwright/test';

export class WaitHelper {
  constructor(private readonly page: Page) {}

  public async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  public async waitForHidden(locator: Locator): Promise<void> {
    await locator.waitFor({
      state: 'hidden',
      timeout: 30000,
    });
  }

  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  public async waitForFixedDelay(seconds: number, _p0: string): Promise<void> {
    await this.page.waitForTimeout(seconds * 1000);
  }
}