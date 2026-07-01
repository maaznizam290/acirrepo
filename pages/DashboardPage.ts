import { Locator, Page } from '@playwright/test';
import { CommonActions } from '../utils/CommonActions';
import { WaitHelper } from '../utils/WaitHelper';

export class DashboardPage {
  private readonly page: Page;
  private readonly actions: CommonActions;
  private readonly waitHelper: WaitHelper;

  private readonly customerTab: Locator;
  private readonly manageCustomerLink: Locator;

  // Customer Search
  private readonly customerNameField: Locator;
  private readonly applyFilterButton: Locator;
  private readonly customerResult: Locator;
  private readonly impersonateCustomerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.actions = new CommonActions(page);
    this.waitHelper = new WaitHelper(page);

    // Customer Menu
    this.customerTab = page.locator('#easyNav a.toggle', {
      hasText: 'Customer',
    });

    this.manageCustomerLink = page.locator('ul.admin-menu a', {
      hasText: 'Manage Customer',
    });

    // Customer Search
    this.customerNameField = page.locator(
      '#ctl00_bodyContentPlaceholder_FilteredListing_ctl02_ctl05_Value'
    );

    this.applyFilterButton = page.getByRole('button', {
      name: /apply filter/i,
    });

    this.customerResult = page.getByRole('link', {
      name: /hiba/i,
    });

    this.impersonateCustomerButton = page.getByRole('link', {
      name: /impersonate customer/i,
    });
  }

  public async openCustomerTab(): Promise<void> {
    await this.actions.click(
      this.customerTab,
      'Customer sidebar tab'
    );
  }

  public async openManageCustomer(): Promise<void> {
    await this.waitHelper.waitForVisible(this.manageCustomerLink);

    await this.actions.click(
      this.manageCustomerLink,
      'Manage Customer'
    );
  }

  public async navigateToManageCustomer(): Promise<void> {
    await this.openCustomerTab();
    await this.openManageCustomer();
  }

  /**
   * Search Customer
   */
  public async searchCustomer(customerName: string): Promise<void> {
    await this.waitHelper.waitForVisible(this.customerNameField);

    await this.actions.fill(
      this.customerNameField,
      customerName,
      'Customer Name'
    );

    await this.actions.click(
      this.applyFilterButton,
      'Apply Filter'
    );

    // Wait exactly 5 seconds
    await this.page.waitForTimeout(5000);

    await this.waitHelper.waitForVisible(this.customerResult);

    await this.actions.click(
      this.customerResult,
      `${customerName} Customer`
    );
  }

  /**
   * Click Impersonate Customer
   */
  public async impersonateCustomer(): Promise<void> {
    await this.waitHelper.waitForVisible(
      this.impersonateCustomerButton
    );

    await this.actions.click(
      this.impersonateCustomerButton,
      'Impersonate Customer'
    );

    // Wait exactly 3 seconds
    await this.page.waitForTimeout(3000);
  }
}