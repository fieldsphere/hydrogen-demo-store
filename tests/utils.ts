import type {Page} from '@playwright/test';

/**
 * Formats a number as USD. Example: 1800 => $1,800.00
 */
export function formatPrice(
  price: string | number,
  currency = 'USD',
  locale = 'en-US',
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });

  return formatter.format(Number(price));
}

/**
 * Removes symbols and decimals from a price and converts to number.
 */
export function normalizePrice(price: string | null) {
  if (!price || !/^[$\d.,]+$/.test(price)) {
    throw new Error('Price was not found');
  }

  return Number(
    price
      .replace('$', '')
      .trim()
      .replace(/[.,](\d\d)$/, '-$1')
      .replace(/[.,]/g, '')
      .replace('-', '.'),
  );
}

export function getVisibleTestId(page: Page, testId: string) {
  return page.locator(`[data-test="${testId}"]:visible`);
}

export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.getByTestId('cart-count').first().waitFor({state: 'visible'});
}

export async function clearCart(page: Page) {
  await page.goto('/cart');
  await page.waitForLoadState('networkidle');

  const removeButtons = page.getByTestId('cart-item-remove');
  while (await removeButtons.count()) {
    await removeButtons.first().click();
    await page.waitForLoadState('networkidle');
  }

  await page.getByTestId('cart-empty').waitFor({state: 'visible'});
}

export type AvailableProduct = {
  handle: string;
  title: string;
};

export async function getAvailableProducts(page: Page, count = 12) {
  const response = await page.request.get(
    `/api/products?count=${count}&sortKey=BEST_SELLING`,
  );

  if (!response.ok()) {
    throw new Error(`Failed to fetch products: ${response.status()}`);
  }

  const data = await response.json();
  const products = Array.isArray(data?.products) ? data.products : [];

  return products
    .filter(
      (product) =>
        product?.variants?.nodes?.[0]?.availableForSale &&
        product?.handle &&
        product?.title,
    )
    .map((product) => ({
      handle: product.handle as string,
      title: product.title as string,
    })) as AvailableProduct[];
}
