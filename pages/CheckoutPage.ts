/**
 * pages/CheckoutPage.ts
 * -----------------------------------------------------------------------
 * Page Object for the Mini Cart and Checkout flow, including payment
 * method selection (Invoice) and final order submission.
 * -----------------------------------------------------------------------
 */

import { Locator, Page } from '@playwright/test';
import { CommonActions } from '../utils/CommonActions';
import { WaitHelper } from '../utils/WaitHelper';

export class CheckoutPage {
  private readonly actions: CommonActions;
  private readonly waitHelper: WaitHelper;

  private readonly miniCartIcon: Locator;
  private readonly proceedToCheckoutButton: Locator;
  private readonly invoicePaymentOption: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.actions = new CommonActions(page);
    this.waitHelper = new WaitHelper(page);

    this.miniCartIcon = page
      .getByRole('link', { name: /mini cart|cart/i })
      .or(page.locator('.mini-cart, #MiniCart, [data-testid="mini-cart"]'));

    this.proceedToCheckoutButton = page
      .getByRole('button', { name: /proceed to checkout/i })
      .or(page.getByRole('link', { name: /proceed to checkout/i }));

    this.invoicePaymentOption = page
      .getByRole('radio', { name: /invoice/i })
      .or(page.getByLabel(/invoice/i));

    this.checkoutButton = page.getByRole('button', { name: /^checkout$/i });
  }

  public async openMiniCart(): Promise<void> {
    await this.actions.click(this.miniCartIcon, 'Mini Cart icon');
  }

  public async clickProceedToCheckout(): Promise<void> {
    await this.actions.click(this.proceedToCheckoutButton, '"Proceed to Checkout" button');
  }

  public async waitForCheckoutPageDelay(seconds: number): Promise<void> {
    await this.waitHelper.waitForFixedDelay(
      seconds,
      'Allowing checkout page/payment widget to render'
    );
  }

  public async selectInvoicePaymentMethod(): Promise<void> {
    await this.actions.check(this.invoicePaymentOption, '"Invoice" payment method radio button');
  }

  public async clickCheckout(): Promise<void> {
    await this.actions.click(this.checkoutButton, 'Final "Checkout" button');
  }

  /** Composed flow: open mini cart -> proceed -> wait -> select Invoice -> checkout. */
  public async completeCheckoutWithInvoice(postNavigationDelaySeconds: number): Promise<void> {
    await this.openMiniCart();
    await this.clickProceedToCheckout();
    await this.waitForCheckoutPageDelay(postNavigationDelaySeconds);
    await this.selectInvoicePaymentMethod();
    await this.clickCheckout();
  }
}
