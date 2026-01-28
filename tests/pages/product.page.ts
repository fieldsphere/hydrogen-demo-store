import type {Page} from '@playwright/test';

import {normalizePrice} from '../utils';

export class ProductPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addToCart() {
    await this.page.getByTestId('add-to-cart').click();
  }

  async getPrice() {
    const price = await this.page.getByTestId('price').textContent();
    return normalizePrice(price);
  }
}
