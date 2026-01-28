import type {Page} from '@playwright/test';

export class AccountPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/account');
  }

  async openAccountLink() {
    await this.page.getByTestId('account-link').click();
  }
}
