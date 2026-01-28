# Playwright End-to-End Tests

## Running locally

```bash
npm run e2e
```

By default, tests run against the local preview server (`npm run preview`) on
`http://localhost:3000` as configured in `playwright.config.ts`.

## Running against a deployed URL

```bash
URL="https://your-preview-url" AUTH_BYPASS_TOKEN="token" npm run e2e
```

`AUTH_BYPASS_TOKEN` is optional and only required for Oxygen auth-bypass setups.

## Optional test data

Some tests require optional environment variables to run:

| Variable | Description |
| --- | --- |
| `TEST_DISCOUNT_CODE` | Valid discount code to verify cart discount behavior |
| `ACCOUNT_STORAGE_STATE` | Path to a Playwright storage state file for authenticated account coverage |

If `TEST_DISCOUNT_CODE` is not set, the discount test is automatically skipped.
If `ACCOUNT_STORAGE_STATE` is not set, authenticated account tests are skipped.

### Creating an authenticated storage state

1. Start the app: `npm run preview`
2. Run Playwright codegen with storage output:

```bash
npx playwright codegen http://localhost:3000 --save-storage=playwright/.auth/account.json
```

3. Complete the Shopify customer login in the browser window.
4. Re-run tests with:

```bash
ACCOUNT_STORAGE_STATE=playwright/.auth/account.json npm run e2e
```

## Notes

- Cart-related suites clear the cart before each test for reliability.
- Checkout tests only verify redirection to the checkout domain (they do not complete payments).
- Account tests validate login redirection for unauthenticated users. Fully authenticated flows require a valid Shopify customer session and are not automated by default.

## Directory Size

Size verification for the test directories (using `du -h`):

```
tests/fixtures/  8.0K
tests/pages/    24.0K
tests/          64.0K (total)
```

Individual file sizes:

| File | Size |
| --- | --- |
| tests/fixtures/base.ts | 4.0K |
| tests/pages/account.page.ts | 4.0K |
| tests/pages/cart.page.ts | 4.0K |
| tests/pages/home.page.ts | 4.0K |
| tests/pages/product.page.ts | 4.0K |
| tests/pages/search.page.ts | 4.0K |
| tests/account.test.ts | 4.0K |
| tests/cart.test.ts | 8.0K |
| tests/checkout.test.ts | 4.0K |
| tests/search.test.ts | 4.0K |
| tests/utils.ts | 4.0K |
| tests/README.md | 4.0K |
