import type {Page} from '@playwright/test';

import type {HomePage} from './pages/home.page';
import type {ProductPage} from './pages/product.page';
import {test, expect} from './fixtures/base';
import {formatPrice} from './utils';

async function closeCartDrawer(page: Page) {
  const closeButton = page.getByTestId('close-cart');
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
}

async function addProductToCart({
  page,
  homePage,
  productPage,
  index = 0,
}: {
  page: Page;
  homePage: HomePage;
  productPage: ProductPage;
  index?: number;
}) {
  await homePage.goto();
  await homePage.openProducts();
  await page.getByTestId('product-card').nth(index).click();
  await page.getByTestId('add-to-cart').waitFor({state: 'visible'});

  const price = await productPage.getPrice();

  await productPage.addToCart();
  await page.getByTestId('cart-drawer').waitFor({state: 'visible'});
  await page.getByTestId('cart-summary').waitFor({state: 'visible'});

  return price;
}

test.describe('Cart', () => {
  test.beforeEach(async ({resetCart}) => {
    await resetCart();
  });

  test('adds item to cart and opens drawer', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    const price = await addProductToCart({page, homePage, productPage});

    await expect(page.getByTestId('cart-drawer')).toBeVisible();
    await expect(page.getByTestId('subtotal')).toContainText(
      formatPrice(price),
    );
    await expect(cartPage.getLineItems()).toHaveCount(1);
  });

  test('increases quantity and updates subtotal', async ({
    page,
    homePage,
    productPage,
  }) => {
    const price = await addProductToCart({page, homePage, productPage});

    await page.getByTestId('cart-quantity-increase').click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('item-quantity')).toContainText('2');
    await expect(page.getByTestId('subtotal')).toContainText(
      formatPrice(price * 2),
    );
  });

  test('decreases quantity and updates subtotal', async ({
    page,
    homePage,
    productPage,
  }) => {
    const price = await addProductToCart({page, homePage, productPage});

    await page.getByTestId('cart-quantity-increase').click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('cart-quantity-decrease').click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('item-quantity')).toContainText('1');
    await expect(page.getByTestId('subtotal')).toContainText(
      formatPrice(price),
    );
  });

  test('removes item from cart', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    await addProductToCart({page, homePage, productPage});

    await cartPage.removeFirstItem();
    await cartPage.expectEmpty();
  });

  test('keeps cart items after navigation', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    await addProductToCart({page, homePage, productPage});
    await closeCartDrawer(page);

    await homePage.openCollections();
    await homePage.openCart();
    await page.getByTestId('cart-drawer').waitFor({state: 'visible'});

    await expect(cartPage.getLineItems()).toHaveCount(1);
  });

  test('supports multiple products in cart', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    const firstPrice = await addProductToCart({page, homePage, productPage});
    await closeCartDrawer(page);

    const secondPrice = await addProductToCart({
      page,
      homePage,
      productPage,
      index: 1,
    });

    await expect(cartPage.getLineItems()).toHaveCount(2);
    await expect(page.getByTestId('subtotal')).toContainText(
      formatPrice(firstPrice + secondPrice),
    );
  });

  test('applies a discount code when provided', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    test.skip(
      !process.env.TEST_DISCOUNT_CODE,
      'Set TEST_DISCOUNT_CODE to run discount tests.',
    );

    const discountCode = process.env.TEST_DISCOUNT_CODE as string;

    await addProductToCart({page, homePage, productPage});
    await cartPage.applyDiscount(discountCode);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(discountCode)).toBeVisible();
  });
});
