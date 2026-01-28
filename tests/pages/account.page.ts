import type {Page} from '@playwright/test';

export class AccountPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/account');
  }

  async openAccountLink() {
    await this.page.getByTestId('account-link').click();
  }
}
