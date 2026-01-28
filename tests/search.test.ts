import {test, expect} from './fixtures/base';
import {getAvailableProducts} from './utils';

test.describe('Search', () => {
  test('search from header returns results', async ({
    page,
    homePage,
    searchPage,
  }) => {
    await homePage.goto();

    const [product] = await getAvailableProducts(page, 1);
    test.skip(!product, 'No available products returned from /api/products.');
    const query = product.title.split(' ')[0];

    await homePage.search(query);
    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(searchPage.getResults().first()).toBeVisible();
  });

  test('search page shows no results state', async ({searchPage}) => {
    await searchPage.goto();
    await searchPage.search('unlikely-search-term-12345');
    await searchPage.expectNoResults();
  });

  test('search results navigate to product page', async ({
    page,
    homePage,
    searchPage,
  }) => {
    await homePage.goto();

    const [product] = await getAvailableProducts(page, 1);
    test.skip(!product, 'No available products returned from /api/products.');
    const query = product.title.split(' ')[0];

    await homePage.search(query);
    await searchPage.getResults().first().click();

    await expect(page).toHaveURL(/\/products\//);
  });
});
