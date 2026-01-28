import type {Locator, Page} from '@playwright/test';

export class SearchPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(term = '') {
    const query = term ? `?q=${encodeURIComponent(term)}` : '';
    await this.page.goto(`/search${query}`);
  }

  async search(term: string) {
    await this.page.getByTestId('search-page-input').fill(term);
    await this.page.getByTestId('search-page-submit').click();
  }

  async expectNoResults() {
    await this.page.getByTestId('search-no-results').waitFor({state: 'visible'});
  }

  getResults(): Locator {
    return this.page
      .getByTestId('search-results')
      .locator('[data-test="product-card"] a');
  }
}
