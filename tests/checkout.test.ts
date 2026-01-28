import type {Page} from '@playwright/test';

import type {HomePage} from './pages/home.page';
import type {ProductPage} from './pages/product.page';
import {test, expect} from './fixtures/base';

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
  await homePage.openProducts();

  const productCards = page.getByTestId('product-card');
  const productCount = await productCards.count();

  for (let index = 0; index < productCount; index += 1) {
    await productCards.nth(index).locator('a').first().click();
    await page.waitForURL(/\/products\//);

    await page
      .locator('[data-test="add-to-cart"], button:has-text("Sold out")')
      .first()
      .waitFor({state: 'visible', timeout: 15000});

    const addToCartButton = page.getByTestId('add-to-cart');
    const isAvailable = await addToCartButton.isVisible().catch(() => false);

    if (isAvailable) {
      await productPage.addToCart();
      await page.getByTestId('cart-drawer').waitFor({state: 'visible'});
      await page.getByTestId('checkout-button').waitFor({state: 'visible'});
      return;
    }

    await page.goBack();
    await page.getByTestId('product-grid').waitFor({state: 'visible'});
  }

  test.skip(true, 'No available products found in catalog.');
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
