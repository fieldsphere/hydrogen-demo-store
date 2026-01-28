import type {Page} from '@playwright/test';

import type {HomePage} from './pages/home.page';
import type {ProductPage} from './pages/product.page';
import {test, expect} from './fixtures/base';
import {getAvailableProducts} from './utils';

const CHECKOUT_URL_REGEX = /checkout\.hydrogen\.shop\/checkouts\/[\d\w]+/;

async function addProductToCart({
  page,
  homePage,
  productPage,
}: {
  page: Page;
  homePage: HomePage;
  productPage: ProductPage;
}) {
  await homePage.goto();

  const availableProducts = await getAvailableProducts(page);

  if (availableProducts.length === 0) {
    test.skip(true, 'No available products returned from /api/products.');
    return;
  }

  const product = availableProducts[0];

  await page.goto(`/products/${product.handle}`);
  await page.getByTestId('add-to-cart').waitFor({state: 'visible'});
  await productPage.addToCart();
  await page.getByTestId('cart-drawer').waitFor({state: 'visible'});
  await page.getByTestId('checkout-button').waitFor({state: 'visible'});
}

test.describe('Checkout', () => {
  test.beforeEach(async ({resetCart}) => {
    await resetCart();
  });

  test('redirects to checkout from cart drawer', async ({
    page,
    homePage,
    productPage,
  }) => {
    await addProductToCart({page, homePage, productPage});
    await page.getByTestId('checkout-button').click();

    await expect(page).toHaveURL(CHECKOUT_URL_REGEX);
  });

  test('redirects to checkout from cart page', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    await addProductToCart({page, homePage, productPage});
    await page.getByTestId('close-cart').click();

    await cartPage.goto();
    await cartPage.waitForSummary();
    await cartPage.openCheckout();

    await expect(page).toHaveURL(CHECKOUT_URL_REGEX);
  });

  test('hides checkout when cart is empty', async ({page, cartPage}) => {
    await cartPage.goto();
    await cartPage.expectEmpty();

    await expect(page.getByTestId('checkout-button')).toHaveCount(0);
  });
});
