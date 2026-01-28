import {expect, type Locator, type Page} from '@playwright/test';

import {normalizePrice} from '../utils';

export class CartPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async waitForSummary() {
    await this.page.getByTestId('cart-summary').waitFor({state: 'visible'});
  }

  async getSubtotal() {
    const subtotal = await this.page.getByTestId('subtotal').textContent();
    return normalizePrice(subtotal);
  }

  async increaseQuantity() {
    await this.page.getByTestId('cart-quantity-increase').click();
  }

  async decreaseQuantity() {
    await this.page.getByTestId('cart-quantity-decrease').click();
  }

  async removeFirstItem() {
    await this.page.getByTestId('cart-item-remove').first().click();
  }

  async applyDiscount(code: string) {
    await this.page.getByTestId('cart-discount-input').fill(code);
    await this.page.getByTestId('cart-discount-apply').click();
  }

  async openCheckout() {
    await this.page.getByTestId('checkout-button').click();
  }

  async expectEmpty() {
    await expect(this.page.getByTestId('cart-empty')).toBeVisible();
  }

  getLineItems(): Locator {
    return this.page.getByTestId('cart-line-item');
  }

  async getItemQuantities() {
    return this.page.getByTestId('item-quantity').allTextContents();
  }
}
