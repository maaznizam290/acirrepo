/**
 * utils/ScreenshotHelper.ts
 * -----------------------------------------------------------------------
 * Centralizes screenshot capture so:
 *  - Failure screenshots are saved consistently named & located.
 *  - Screenshots can also be attached directly into the Cucumber
 *    World (for embedding into the HTML/Allure report) via the
 *    optional `attach` callback.
 * -----------------------------------------------------------------------
 */

import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
import { Logger } from './Logger';

const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots');

export class ScreenshotHelper {
  constructor(private readonly page: Page) {}

  private ensureDirExists(): void {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  }

  /**
   * Captures a full-page screenshot to disk and returns the absolute path.
   * `attach`, if provided (typically `this.attach` from the Cucumber
   * World), embeds the image directly into the HTML/Allure report.
   */
  public async capture(
    name: string,
    attach?: (data: Buffer, mediaType: string) => void
  ): Promise<string> {
    this.ensureDirExists();

    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${safeName}-${Date.now()}.png`;
    const filePath = path.join(SCREENSHOT_DIR, fileName);

    try {
      const buffer = await this.page.screenshot({ path: filePath, fullPage: true });
      Logger.info(`Screenshot captured: ${filePath}`);

      if (attach) {
        attach(buffer, 'image/png');
      }

      return filePath;
    } catch (error) {
      Logger.error(`[ScreenshotHelper] Failed to capture screenshot: ${name}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /** Convenience wrapper specifically for failure screenshots. */
  public async captureOnFailure(
    scenarioName: string,
    attach?: (data: Buffer, mediaType: string) => void
  ): Promise<string> {
    return this.capture(`FAILURE_${scenarioName}`, attach);
  }
}
