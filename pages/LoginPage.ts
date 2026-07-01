/**
 * pages/LoginPage.ts
 * -----------------------------------------------------------------------
 * Page Object for the Sign-In screen.
 * Encapsulates all locators + actions related to authenticating into
 * the OMS application. No other file should reference login-page
 * locators directly (Page Object Model encapsulation).
 * -----------------------------------------------------------------------
 */

import { Locator, Page } from '@playwright/test';
import { CommonActions } from '../utils/CommonActions';
import { Logger } from '../utils/Logger';
import { env } from '../config/env';

export class LoginPage {
  private readonly actions: CommonActions;

  // ---- Locators (role/label based — no hardcoded XPath) ----
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.actions = new CommonActions(page);

    this.emailInput = page
      .getByLabel(/email/i)
      .or(page.locator('input#Email, input[name="Email"]'));
    this.passwordInput = page
      .getByLabel(/password/i)
      .or(page.locator('input#Password, input[name="Password"]'));
    this.loginButton = page.getByRole('button', { name: /log\s?in|sign\s?in/i });
  }

  /** Navigates to the application's sign-in URL defined in the active environment. */
  public async goto(): Promise<void> {
    Logger.step(`Navigating to base URL: ${env.baseUrl}`);
    await this.page.goto(env.baseUrl, { waitUntil: 'domcontentloaded' });
  }

  public async enterEmail(email: string): Promise<void> {
    await this.actions.fill(this.emailInput, email, 'Email input field');
  }

  public async enterPassword(password: string): Promise<void> {
    await this.actions.fill(this.passwordInput, password, 'Password input field');
  }

  public async clickLogin(): Promise<void> {
    await this.actions.click(this.loginButton, 'Login button');
  }

  /** Convenience method composing the full login flow. */
  public async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }
}
