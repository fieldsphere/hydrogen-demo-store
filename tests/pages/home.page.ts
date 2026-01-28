import type {Page} from '@playwright/test';

import {getVisibleTestId, waitForHydration} from '../utils';

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await waitForHydration(this.page);
  }

  async openCollections() {
    await this.page.getByRole('link', {name: 'Collections'}).click();
    await this.page.getByTestId('collection-grid').waitFor({state: 'visible'});
  }

  async openProducts() {
    await this.page.getByRole('link', {name: 'Products'}).click();
    await this.page.getByTestId('product-grid').waitFor({state: 'visible'});
  }

  async openCart() {
    await getVisibleTestId(this.page, 'cart-count').click();
  }

  async search(term: string) {
    const searchInput = getVisibleTestId(this.page, 'search-input');
    await searchInput.fill(term);
    await getVisibleTestId(this.page, 'search-button').click();
  }
}
