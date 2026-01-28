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

If `TEST_DISCOUNT_CODE` is not set, the discount test is automatically skipped.

## Notes

- Cart-related suites clear the cart before each test for reliability.
- Checkout tests only verify redirection to the checkout domain (they do not complete payments).
- Account tests validate login redirection for unauthenticated users. Fully authenticated flows require a valid Shopify customer session and are not automated by default.
