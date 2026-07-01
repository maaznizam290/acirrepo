/**
 * pages/ProductPage.ts
 * -----------------------------------------------------------------------
 * Page Object for product search (with autocomplete), quantity
 * adjustment, and "Add to Cart" actions, used twice in the order flow
 * for two different products.
 * -----------------------------------------------------------------------
 */

import { Locator, Page } from '@playwright/test';
import { CommonActions } from '../utils/CommonActions';
import { WaitHelper } from '../utils/WaitHelper';

export class ProductPage {
  private readonly actions: CommonActions;
  private readonly waitHelper: WaitHelper;

  private readonly productSearchInput: Locator;
  private readonly autocompleteSuggestions: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.actions = new CommonActions(page);
    this.waitHelper = new WaitHelper(page);

    this.productSearchInput = page
      .getByPlaceholder(/search product|search/i)
      .or(page.locator('input[name*="product" i], input#ProductSearch'));

    // Generic autocomplete/suggestion list container — adjust selector
    // to the real widget's markup if it differs (e.g. ui-autocomplete).
    this.autocompleteSuggestions = page.locator(
      '.ui-autocomplete li, [role="listbox"] [role="option"], .autocomplete-suggestion'
    );

    this.quantityInput = page.locator('input[name*="qty" i], input[name*="quantity" i]');

    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
  }

  public async searchProduct(productName: string): Promise<void> {
    await this.actions.fill(
      this.productSearchInput,
      productName,
      `Product search: "${productName}"`
    );
  }

  /** Waits for the autocomplete dropdown to render at least one option, then selects the first. */
  public async selectFirstSuggestion(): Promise<void> {
    await this.waitHelper.waitForVisible(this.autocompleteSuggestions.first());
    await this.actions.click(this.autocompleteSuggestions.first(), 'First autocomplete suggestion');
  }

  public async setQuantity(quantity: number): Promise<void> {
    await this.actions.setNumericValue(this.quantityInput, quantity, 'Product quantity field');
  }

  public async clickAddToCart(): Promise<void> {
    await this.actions.click(this.addToCartButton, '"Add to Cart" button');
  }

  /** Composed flow: search -> pick first suggestion -> set qty -> add to cart. */
  public async searchSelectAndAddToCart(productName: string, quantity: number): Promise<void> {
    await this.searchProduct(productName);
    await this.selectFirstSuggestion();
    await this.setQuantity(quantity);
    await this.clickAddToCart();
  }
}
