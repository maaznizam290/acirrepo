/**
 * features/step-definitions/order-creation.steps.ts
 * -----------------------------------------------------------------------
 * Step definitions for the CSR impersonation + order creation feature.
 * Each step delegates to a Page Object method — no Playwright locator
 * or raw `page.*` call appears here directly (keeps step definitions
 * thin and business-readable, per Page Object Model best practice).
 * -----------------------------------------------------------------------
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { Logger } from '../../utils/Logger';
import { env } from '../../config/env';

Given(
  'the CSR launches the browser and navigates to the OMS sign-in page',
  async function (this: CustomWorld) {
    await this.loginPage.goto();
  }
);

Given('the CSR logs in with valid credentials', async function (this: CustomWorld) {
  await this.loginPage.login(env.credentials.email, env.credentials.password);
});

When(
  'the CSR navigates to {string} and then {string}',
  async function (this: CustomWorld, _customerTabLabel: string, _manageCustomerLabel: string) {
    await this.dashboardPage.navigateToManageCustomer();
  }
);

When(
  'the CSR searches for customer {string} and applies the filter',
  async function (this: CustomWorld, customerName: string) {
    await this.customerPage.searchCustomer(customerName);
    await this.customerPage.clickApplyFilter();
    // Explicit fixed wait as specified in the documented test flow.
    await this.customerPage.waitForSearchResultsDelay(5);
  }
);

When(
  'the CSR opens customer {string} and impersonates the customer',
  async function (this: CustomWorld, customerName: string) {
    await this.customerPage.openCustomer(customerName);
    await this.customerPage.clickImpersonateCustomer();
    // Explicit fixed wait as specified in the documented test flow.
    await this.customerPage.waitForImpersonationDelay(3);
  }
);

When(
  'the CSR searches for product {string} and adds the first suggestion to the cart with quantity {int}',
  async function (this: CustomWorld, productName: string, quantity: number) {
    await this.productPage.searchSelectAndAddToCart(productName, quantity);
  }
);

When('the CSR opens the mini cart and proceeds to checkout', async function (this: CustomWorld) {
  await this.checkoutPage.openMiniCart();
  await this.checkoutPage.clickProceedToCheckout();
  // Explicit fixed wait as specified in the documented test flow.
  await this.checkoutPage.waitForCheckoutPageDelay(2);
});

When(
  'the CSR selects {string} as the payment method',
  async function (this: CustomWorld, method: string) {
    if (method.toLowerCase() === 'invoice') {
      await this.checkoutPage.selectInvoicePaymentMethod();
    } else {
      throw new Error(`[Step Definition] Unsupported payment method requested: "${method}"`);
    }
  }
);

When(
  'the CSR clicks the final {string} button',
  async function (this: CustomWorld, _buttonLabel: string) {
    await this.checkoutPage.clickCheckout();
  }
);

Then('the order should be placed successfully', async function (this: CustomWorld) {
  // Generic, resilient success assertion: looks for a confirmation
  // heading/message or a URL transition to an order-confirmation route.
  const confirmationIndicator = this.page
    .getByText(/order (placed|confirmed|received|successful)/i)
    .or(this.page.getByRole('heading', { name: /thank you|order confirmation/i }));

  await expect(confirmationIndicator.first()).toBeVisible({ timeout: env.timeouts.navigation });
  Logger.info('Order confirmation verified successfully.');
});
