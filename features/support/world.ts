/**
 * features/support/world.ts
 * -----------------------------------------------------------------------
 * Custom Cucumber World.
 * Each scenario gets a fresh instance of this class, which:
 *  - Owns the BrowserManager (browser/context/page lifecycle).
 *  - Lazily instantiates and exposes every Page Object so step
 *    definitions can simply do `this.loginPage.login(...)`.
 *  - Exposes ScreenshotHelper/WaitHelper bound to the active page.
 * -----------------------------------------------------------------------
 */

import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import { BrowserManager } from '../../utils/BrowserManager';
import { ScreenshotHelper } from '../../utils/ScreenshotHelper';
import { WaitHelper } from '../../utils/WaitHelper';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { CustomerPage } from '../../pages/CustomerPage';
import { ProductPage } from '../../pages/ProductPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

export class CustomWorld extends World {
  public browserManager: BrowserManager;
  public page!: Page;

  public waitHelper!: WaitHelper;
  public screenshotHelper!: ScreenshotHelper;

  public loginPage!: LoginPage;
  public dashboardPage!: DashboardPage;
  public customerPage!: CustomerPage;
  public productPage!: ProductPage;
  public checkoutPage!: CheckoutPage;

  constructor(options: IWorldOptions) {
    super(options);
    this.browserManager = new BrowserManager();
  }

  /**
   * Wires up the page + all Page Objects + helpers once the page is
   * available. Called from the Before hook after browser launch.
   */
  public initializePageObjects(page: Page): void {
    this.page = page;
    this.waitHelper = new WaitHelper(page);
    this.screenshotHelper = new ScreenshotHelper(page);

    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
    this.customerPage = new CustomerPage(page);
    this.productPage = new ProductPage(page);
    this.checkoutPage = new CheckoutPage(page);
  }
}

setWorldConstructor(CustomWorld);
