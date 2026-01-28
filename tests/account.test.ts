import {test, expect} from './fixtures/base';

const LOGIN_URL_REGEX =
  /\/account\/login|\/account\/authorize|shopify\.com|accounts\.shopify\.com/;

test.describe('Account', () => {
  test('account link redirects to login', async ({page, homePage}) => {
    await homePage.goto();

    await page.getByTestId('account-link').click();
    await expect(page).toHaveURL(LOGIN_URL_REGEX);
  });

  test('direct account access requires authentication', async ({
    page,
    accountPage,
  }) => {
    await accountPage.goto();
    await expect(page).toHaveURL(LOGIN_URL_REGEX);
  });
});
