/**
 * utils/BrowserManager.ts
 * -----------------------------------------------------------------------
 * Owns the Playwright Browser / BrowserContext / Page lifecycle.
 * - Supports chromium, firefox, and edge (msedge channel of chromium).
 * - Applies tracing, video recording, and viewport settings centrally
 *   so no step definition ever touches `playwright` launch APIs
 *   directly (Single Responsibility + encapsulation).
 * - Exposes `closeWithTrace()` so hooks can decide whether to keep or
 *   discard a trace/video based on pass/fail status.
 * -----------------------------------------------------------------------
 */

import { Browser, BrowserContext, chromium, firefox, Page, webkit } from '@playwright/test';
import * as path from 'path';
import { env, SupportedBrowser } from '../config/env';
import { Logger } from './Logger';

const TRACE_DIR = path.resolve(__dirname, '..', 'reports', 'traces');
const VIDEO_DIR = path.resolve(__dirname, '..', 'reports', 'videos');

export class BrowserManager {
  private browser: Browser | undefined;
  private context: BrowserContext | undefined;
  private page: Page | undefined;

  /**
   * Launches the configured browser engine.
   * Edge is launched via the chromium engine using the "msedge" channel,
   * since Playwright does not ship a separate Edge browser binary.
   */
  public async launchBrowser(browserName: SupportedBrowser = env.browser): Promise<Browser> {
    Logger.info(`Launching browser: ${browserName} (headless=${env.headless})`);

    const launchOptions = {
      headless: env.headless,
      slowMo: env.slowMo,
    };

    switch (browserName) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(launchOptions);
        break;
      case 'edge':
        this.browser = await chromium.launch({ ...launchOptions, channel: 'msedge' });
        break;
      case 'chromium':
      default:
        this.browser = await chromium.launch(launchOptions);
        break;
    }

    return this.browser;
  }

  /**
   * Creates a new browser context with tracing/video enabled and
   * returns a ready-to-use Page. A fresh context per scenario keeps
   * tests isolated (no shared cookies/localStorage leakage).
   */
  public async newPage(scenarioName: string): Promise<Page> {
    if (!this.browser) {
      throw new Error(
        '[BrowserManager] Browser has not been launched. Call launchBrowser() first.'
      );
    }

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      recordVideo: { dir: VIDEO_DIR, size: { width: 1920, height: 1080 } },
    });

    this.context.setDefaultTimeout(env.timeouts.default);
    this.context.setDefaultNavigationTimeout(env.timeouts.navigation);

    await this.context.tracing.start({
      title: scenarioName,
      screenshots: true,
      snapshots: true,
      sources: true,
    });

    this.page = await this.context.newPage();
    return this.page;
  }

  public getPage(): Page {
    if (!this.page) {
      throw new Error('[BrowserManager] Page has not been initialized. Call newPage() first.');
    }
    return this.page;
  }

  /**
   * Stops tracing (saving it only if requested), closes the context,
   * and closes the browser. Called from hooks at the end of every
   * scenario so resources never leak between tests.
   */
  public async closeWithTrace(scenarioName: string, saveTrace: boolean): Promise<void> {
    try {
      if (this.context) {
        if (saveTrace) {
          const safeName = scenarioName.replace(/[^a-zA-Z0-9-_]/g, '_');
          const tracePath = path.join(TRACE_DIR, `${safeName}-${Date.now()}.zip`);
          await this.context.tracing.stop({ path: tracePath });
          Logger.warn(`Trace saved for failed scenario: ${tracePath}`);
        } else {
          await this.context.tracing.stop();
        }
        await this.context.close();
      }

      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      Logger.error('[BrowserManager] Error while closing browser/context', {
        error: (error as Error).message,
      });
    } finally {
      this.page = undefined;
      this.context = undefined;
      this.browser = undefined;
    }
  }
}
