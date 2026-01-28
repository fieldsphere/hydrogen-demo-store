import {test, expect} from './fixtures/base';
import {getFirstProductTitle} from './utils';

test.describe('Search', () => {
  test('search from header returns results', async ({
    page,
    homePage,
    searchPage,
  }) => {
    await homePage.goto();
    await homePage.openProducts();

    const productTitle = await getFirstProductTitle(page);
    const query = productTitle.split(' ')[0];

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
    await homePage.openProducts();

    const productTitle = await getFirstProductTitle(page);
    const query = productTitle.split(' ')[0];

    await homePage.search(query);
    await searchPage.getResults().first().click();

    await expect(page).toHaveURL(/\/products\//);
  });
});
