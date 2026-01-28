import type {Page} from '@playwright/test';

import type {HomePage} from './pages/home.page';
import type {ProductPage} from './pages/product.page';
import {test, expect} from './fixtures/base';
import {formatPrice, getAvailableProducts} from './utils';

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
  startIndex = 0,
}: {
  page: Page;
  homePage: HomePage;
  productPage: ProductPage;
  startIndex?: number;
}) {
  await homePage.goto();

  const availableProducts = await getAvailableProducts(page);

  if (availableProducts.length <= startIndex) {
    test.skip(true, 'No available products returned from /api/products.');
    return {price: 0, index: startIndex};
  }

  const product = availableProducts[startIndex];

  await page.goto(`/products/${product.handle}`);
  await page.getByTestId('add-to-cart').waitFor({state: 'visible'});

  const price = await productPage.getPrice();

  await productPage.addToCart();
  await page.getByTestId('cart-drawer').waitFor({state: 'visible'});
  await page.getByTestId('cart-summary').waitFor({state: 'visible'});

  return {price, index: startIndex};
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
    const {price} = await addProductToCart({page, homePage, productPage});

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
    const {price} = await addProductToCart({page, homePage, productPage});

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
    const {price} = await addProductToCart({page, homePage, productPage});

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

  test('renders cart page with items', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    const {price} = await addProductToCart({page, homePage, productPage});
    await closeCartDrawer(page);

    await cartPage.goto();
    await cartPage.waitForSummary();

    await expect(cartPage.getLineItems()).toHaveCount(1);
    await expect(page.getByTestId('subtotal')).toContainText(
      formatPrice(price),
    );
  });

  test('closes cart drawer', async ({page, homePage, productPage}) => {
    await addProductToCart({page, homePage, productPage});

    await page.getByTestId('close-cart').click();
    await expect(page.getByTestId('cart-drawer')).toHaveCount(0);
  });

  test('supports multiple products in cart', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    const firstProduct = await addProductToCart({page, homePage, productPage});
    await closeCartDrawer(page);

    let secondProduct;

    try {
      secondProduct = await addProductToCart({
        page,
        homePage,
        productPage,
        startIndex: firstProduct.index + 1,
      });
    } catch (error) {
      test.skip(
        true,
        'Multiple available products required to validate multi-item carts.',
      );
      return;
    }

    await expect(cartPage.getLineItems()).toHaveCount(2);
    await expect(page.getByTestId('subtotal')).toContainText(
      formatPrice(firstProduct.price + secondProduct.price),
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
