/**
 * pages/CustomerPage.ts
 * -----------------------------------------------------------------------
 * Page Object for the "Manage Customer" search/listing screen and the
 * customer detail screen, including the "Impersonate Customer" action
 * that is central to the CSR order-creation flow.
 * -----------------------------------------------------------------------
 */

import { Locator, Page } from '@playwright/test';
import { CommonActions } from '../utils/CommonActions';
import { WaitHelper } from '../utils/WaitHelper';

export class CustomerPage {
  private readonly actions: CommonActions;
  private readonly waitHelper: WaitHelper;

  private readonly customerSearchInput: Locator;
  private readonly applyFilterButton: Locator;
  private readonly customerResultLink: (name: string) => Locator;
  private readonly impersonateCustomerButton: Locator;

  constructor(page: Page) {
    this.actions = new CommonActions(page);
    this.waitHelper = new WaitHelper(page);

    this.customerSearchInput = page
      .getByPlaceholder(/search customer/i)
      .or(page.locator('input[name*="customer" i], input#CustomerSearch'));

    this.applyFilterButton = page.getByRole('button', { name: /apply filter/i });

    this.customerResultLink = (name: string) =>
      page.getByRole('link', { name, exact: false }).or(page.getByText(name, { exact: false }));

    this.impersonateCustomerButton = page
      .getByRole('button', { name: /impersonate customer/i })
      .or(page.getByText(/impersonate customer/i));
  }

  public async searchCustomer(name: string): Promise<void> {
    await this.actions.fill(this.customerSearchInput, name, 'Customer search input');
  }

  public async clickApplyFilter(): Promise<void> {
    await this.actions.click(this.applyFilterButton, '"Apply Filter" button');
  }

  /**
   * Waits the explicitly required fixed delay for search results to
   * settle (see WaitHelper.waitForFixedDelay doc-comment for rationale).
   */
  public async waitForSearchResultsDelay(seconds: number): Promise<void> {
    await this.waitHelper.waitForFixedDelay(
      seconds,
      'Allowing customer search results grid to settle'
    );
  }

  public async openCustomer(name: string): Promise<void> {
    await this.actions.click(this.customerResultLink(name), `Customer result row: "${name}"`);
  }

  public async clickImpersonateCustomer(): Promise<void> {
    await this.actions.click(this.impersonateCustomerButton, '"Impersonate Customer" button');
  }

  public async waitForImpersonationDelay(seconds: number): Promise<void> {
    await this.waitHelper.waitForFixedDelay(
      seconds,
      'Allowing impersonation session/context switch to complete'
    );
  }

  /** Composed flow: search -> filter -> wait -> open -> impersonate -> wait. */
  public async searchAndImpersonateCustomer(
    customerName: string,
    postSearchDelaySeconds: number,
    postImpersonateDelaySeconds: number
  ): Promise<void> {
    await this.searchCustomer(customerName);
    await this.clickApplyFilter();
    await this.waitForSearchResultsDelay(postSearchDelaySeconds);
    await this.openCustomer(customerName);
    await this.clickImpersonateCustomer();
    await this.waitForImpersonationDelay(postImpersonateDelaySeconds);
  }
}
