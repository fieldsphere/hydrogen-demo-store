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
- Some cart scenarios are skipped if the catalog only exposes a single sellable product during the run.
- Search pagination is skipped when results fit on a single page.
- Authenticated account tests may skip address/order checks if the account has no saved addresses or orders.
