/**
 * pages/DashboardPage.ts
 * -----------------------------------------------------------------------
 * Page Object for the post-login landing/dashboard screen, primarily
 * responsible for top-level navigation (Customer tab -> Manage Customer).
 * -----------------------------------------------------------------------
 */

import { Locator, Page } from '@playwright/test';
import { CommonActions } from '../utils/CommonActions';

export class DashboardPage {
  private readonly actions: CommonActions;

  private readonly customerTab: Locator;
  private readonly manageCustomerLink: Locator;

  constructor(page: Page) {
    this.actions = new CommonActions(page);

    this.customerTab = page
      .getByRole('link', { name: /^customer$/i })
      .or(page.getByRole('button', { name: /^customer$/i }));
    this.manageCustomerLink = page
      .getByRole('link', { name: /manage customer/i })
      .or(page.getByText(/manage customer/i));
  }

  public async openCustomerTab(): Promise<void> {
    await this.actions.click(this.customerTab, 'Customer top-nav tab');
  }

  public async openManageCustomer(): Promise<void> {
    await this.actions.click(this.manageCustomerLink, '"Manage Customer" menu item');
  }

  /** Composed navigation: Customer tab -> Manage Customer screen. */
  public async navigateToManageCustomer(): Promise<void> {
    await this.openCustomerTab();
    await this.openManageCustomer();
  }
}
