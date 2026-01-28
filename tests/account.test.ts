import {test, expect} from './fixtures/base';
import {getVisibleTestId} from './utils';

const LOGIN_URL_REGEX =
  /\/account\/login|\/account\/authorize|shopify\.com|accounts\.shopify\.com/;
const accountStorageState = process.env.ACCOUNT_STORAGE_STATE;

test.describe('Account', () => {
  test('account link redirects to login', async ({page, homePage}) => {
    await homePage.goto();

    await getVisibleTestId(page, 'account-link').click();
    await expect(page).toHaveURL(LOGIN_URL_REGEX);
  });

  test('direct account access requires authentication', async ({
    page,
    accountPage,
  }) => {
    await accountPage.goto();
    await expect(page).toHaveURL(LOGIN_URL_REGEX);
  });

  test.describe('authenticated account', () => {
    test.skip(
      !accountStorageState,
      'Set ACCOUNT_STORAGE_STATE to run authenticated account tests.',
    );

    test.use({storageState: accountStorageState});

    test('shows account dashboard sections', async ({page, accountPage}) => {
      await accountPage.goto();
      await page.getByTestId('account-details').waitFor({state: 'visible'});
      await page.getByTestId('address-book').waitFor({state: 'visible'});
      await expect(page.getByRole('button', {name: 'Sign out'})).toBeVisible();

      await expect(page.getByText('Order History')).toBeVisible();

      const orderCards = page.getByTestId('order-card');
      if ((await orderCards.count()) > 0) {
        await expect(orderCards.first()).toBeVisible();
      } else {
        await expect(
          page.getByText("You haven't placed any orders yet."),
        ).toBeVisible();
      }

      const addressCards = page.getByTestId('address-card');
      if ((await addressCards.count()) > 0) {
        await expect(addressCards.first()).toBeVisible();
      } else {
        await expect(
          page.getByText("You haven't saved any addresses yet."),
        ).toBeVisible();
      }
    });

    test('opens and cancels profile edit modal', async ({page, accountPage}) => {
      await accountPage.goto();

      await page.getByTestId('account-edit-link').click();
      await page.getByTestId('account-edit-form').waitFor({state: 'visible'});

      await page.getByTestId('account-cancel-button').click();
      await page.getByTestId('account-details').waitFor({state: 'visible'});
    });

    test('opens and cancels address modal', async ({page, accountPage}) => {
      await accountPage.goto();

      await page.getByTestId('add-address-button').click();
      await page.getByTestId('address-form').waitFor({state: 'visible'});

      await page.getByTestId('address-cancel-button').click();
      await page.getByTestId('address-book').waitFor({state: 'visible'});
    });
  });
});
