import {test as base, expect} from '@playwright/test';

import {AccountPage} from '../pages/account.page';
import {CartPage} from '../pages/cart.page';
import {HomePage} from '../pages/home.page';
import {ProductPage} from '../pages/product.page';
import {SearchPage} from '../pages/search.page';
import {clearCart} from '../utils';

type Fixtures = {
  accountPage: AccountPage;
  cartPage: CartPage;
  homePage: HomePage;
  productPage: ProductPage;
  searchPage: SearchPage;
  resetCart: () => Promise<void>;
};

export const test = base.extend<Fixtures>({
  accountPage: async ({page}, use) => {
    await use(new AccountPage(page));
  },
  cartPage: async ({page}, use) => {
    await use(new CartPage(page));
  },
  homePage: async ({page}, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({page}, use) => {
    await use(new ProductPage(page));
  },
  searchPage: async ({page}, use) => {
    await use(new SearchPage(page));
  },
  resetCart: async ({page}, use) => {
    await use(async () => {
      await clearCart(page);
    });
  },
});

export {expect};
