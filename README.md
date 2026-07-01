# Playwright + TypeScript + Cucumber (BDD) Enterprise Automation Framework

A production-ready, scalable UI test automation framework built with **Playwright**,
**TypeScript**, and **Cucumber (BDD)**, following the Page Object Model, SOLID
principles, and clean-architecture practices used in enterprise QA teams.

Reference scenario implemented: **"CSR creates an order after impersonating a
customer"** — login → navigate to Manage Customer → search & impersonate a
customer → add two products to cart → checkout with Invoice payment.

---

## 1. Tech Stack

| Concern         | Tool                                   |
|-----------------|-----------------------------------------|
| Language        | TypeScript                              |
| Browser engine  | Playwright (Chromium, Firefox, Edge)    |
| BDD             | Cucumber (`@cucumber/cucumber`)         |
| Assertions      | `@playwright/test` `expect`             |
| Reporting       | Cucumber JSON → HTML (`multiple-cucumber-html-reporter`), Allure 2 |
| Logging         | Winston                                 |
| Env management  | dotenv                                  |
| Test utilities  | `@faker-js/faker`, `uuid`, `dayjs`      |

---

## 2. Project Structure

```
project/
├── features/
│   ├── login.feature                  # Gherkin scenario (CSR order-creation flow)
│   ├── hooks/hooks.ts                 # Before/After hooks: browser lifecycle, screenshots, traces
│   ├── step-definitions/              # Step implementations (thin — delegate to Page Objects)
│   └── support/
│       ├── world.ts                   # Custom Cucumber World (wires up Page Objects per scenario)
│       └── timeouts.ts                # Global step timeout configuration
│
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── CustomerPage.ts                # Search, filter, impersonate
│   ├── ProductPage.ts                 # Search, autocomplete, add-to-cart
│   └── CheckoutPage.ts                # Mini cart, payment method, checkout
│
├── utils/
│   ├── Logger.ts                      # Winston logger singleton
│   ├── BrowserManager.ts              # Browser/context/page lifecycle, tracing, video
│   ├── WaitHelper.ts                  # Explicit/dynamic wait strategies
│   ├── CommonActions.ts               # Reusable click/fill/select/etc. with logging + retries
│   ├── ConfigReader.ts                # Typed config + JSON test-data accessor
│   └── ScreenshotHelper.ts            # Screenshot capture + report attachment
│
├── config/
│   ├── playwright.config.ts           # Cross-browser projects, trace/video/screenshot policy
│   ├── cucumber.js                    # Cucumber profiles (default / parallel)
│   ├── env.ts                         # Strongly-typed environment loader (fail-fast on missing vars)
│   └── allure-formatter.js            # Custom Allure reporter wiring for cucumber-js
│
├── scripts/
│   └── generate-html-report.js        # Converts cucumber JSON → polished HTML report
│
├── test-data/
│   └── users.json                     # Static reference test data
│
├── .github/workflows/
│   └── playwright-cucumber-ci.yml     # CI pipeline (cross-browser matrix, report publishing)
│
├── reports/            (generated)    # HTML/JSON/log output — git-ignored
├── screenshots/        (generated)    # Failure screenshots — git-ignored
├── allure-results/     (generated)    # Raw Allure results — git-ignored
│
├── .env.example                       # Template — committed, no real secrets
├── .env                               # Real local config — git-ignored, fill in yourself
├── package.json
├── tsconfig.json
└── README.md
```

### Architecture notes

- **Page Object Model**: every screen's locators and actions live in exactly one
  `pages/*.ts` file. Step definitions never touch a Playwright locator directly.
- **CommonActions**: all Page Objects compose `CommonActions` for click/fill/etc.,
  so waiting, logging, and error-wrapping logic is written once (DRY).
- **World**: a fresh `CustomWorld` instance per scenario builds a fresh
  `BrowserManager` + all Page Objects, keeping scenarios fully isolated — this is
  also what makes `--parallel` execution safe.
- **Config**: `config/env.ts` is the single source of truth for environment
  variables. It fails fast with a clear error if a required variable is missing,
  instead of letting `undefined` silently flow into a test.

---

## 3. Credentials & Environment Setup — Read This First

This repository **does not** contain real credentials. `.env.example` is a
committed template with safe placeholders; the working `.env` file is
git-ignored.

```bash
cp .env.example .env
```

Then edit `.env` and fill in the real values for your target environment:

```dotenv
ENV=qa
QA_BASE_URL=https://www.aci.aspdotnetstorefront.cambrooke.com/aci_oms_qa/account/signin?returnurl=%2Faci_oms_qa%2F
QA_EMAIL=your_test_account_email@example.com
QA_PASSWORD=your_test_account_password
```

**Never commit `.env` with real credentials.** In CI, the same values are
injected from encrypted GitHub Actions secrets (see Section 8) — they are never
written into the repository.

---

## 4. Installation

Requires **Node.js 18+**.

```bash
npm install
npx playwright install --with-deps   # downloads browser binaries
```

---

## 5. Running Tests

```bash
# Default run (uses BROWSER/HEADLESS from .env)
npm test

# Specific browser
npm run test:chrome
npm run test:firefox
npm run test:edge

# Headed vs headless
npm run test:headed
npm run test:headless

# Specific environment
npm run test:qa
npm run test:staging
npm run test:prod

# Parallel execution (4 workers)
npm run test:parallel
```

Every run automatically produces, on failure:
- a full-page **screenshot** (`screenshots/`, also embedded in the HTML/Allure report)
- a **Playwright trace** (`reports/traces/*.zip`) — open with `npx playwright show-trace <file>.zip`
- a **video recording** (`reports/videos/`)

Retries are governed by `RETRY_COUNT` in `.env` / `config/playwright.config.ts`.

---

## 6. Reports

### HTML report (Cucumber JSON → styled HTML)
```bash
npm run report:html        # generates AND opens reports/cucumber-html-report/index.html
npm run report:html:generate
```

### Allure report
```bash
npm run report:allure       # generates AND opens the Allure report
npm run report:allure:generate
npm run report:allure:open
```

> Allure result files write to `allure-results/`. `npm run report:allure:generate`
> converts these into a static HTML site at `reports/allure-report/`.

### Native Playwright HTML/JSON report
Also produced automatically at `reports/playwright-html-report/` and
`reports/playwright-report.json` whenever the underlying Playwright config is
used (e.g. by `BrowserManager` settings reused across the suite).

### Logs
Structured Winston logs (console + file) write to `reports/logs/execution.log`
and `reports/logs/errors.log`.

---

## 7. Feature File & Flow Covered

`features/login.feature` implements:

1. Launch browser → navigate to OMS sign-in URL
2. Log in with credentials from `.env`
3. Navigate **Customer → Manage Customer**
4. Search customer **"Hiba"** → Apply Filter → (explicit 5s wait for results grid)
5. Open customer **"Hiba"** → **Impersonate Customer** → (explicit 3s wait for session switch)
6. Search product **"Apple"** → select first autocomplete suggestion → set quantity **6** → Add to Cart
7. Search product **"Aproten"** → select first autocomplete suggestion → set quantity **7** → Add to Cart
8. Open Mini Cart → Proceed to Checkout → (explicit 2s wait)
9. Select **Invoice** payment method → click **Checkout**
10. Assert order confirmation is visible

The three "wait exactly N seconds" steps are implemented via
`WaitHelper.waitForFixedDelay()`, used **only** for those three documented steps
(every other wait in the framework is condition-based — visibility, network
idle, URL change, etc.). If/when the target app exposes a more reliable signal
(e.g., a specific element appearing, a network request settling), swap the
fixed delay for `waitForCondition()` or `waitForVisible()` to make the suite
faster and less flaky.

---

## 8. CI/CD — GitHub Actions

`.github/workflows/playwright-cucumber-ci.yml` runs the suite across a
**Chromium / Firefox / Edge matrix** on every push/PR to `main`/`develop`, and
on manual dispatch with selectable browser/environment inputs.

**Required GitHub repository secrets** (Settings → Secrets and variables → Actions):

| Secret          | Description                          |
|-----------------|---------------------------------------|
| `QA_BASE_URL`   | Sign-in URL for the QA environment    |
| `QA_EMAIL`      | Test account email                    |
| `QA_PASSWORD`   | Test account password                 |

The workflow writes these into a `.env` file at runtime — they are never
persisted in the repository. On completion, it:
- generates the Allure report and the HTML report regardless of pass/fail,
- uploads `reports/` and `screenshots/` as build artifacts (14-day retention),
- fails the job if any scenario failed.

To adapt for staging/prod, add `STAGING_*`/`PROD_*` secrets following the same
naming pattern already read by `config/env.ts`.

---

## 9. Code Quality

```bash
npm run build        # tsc --noEmit type-check
npm run lint          # ESLint
npm run lint:fix
npm run format        # Prettier --write
```

---

## 10. Extending the Framework

- **New page**: add `pages/NewPage.ts`, register it in `features/support/world.ts`.
- **New scenario**: add a `.feature` file under `features/`, then add step
  definitions under `features/step-definitions/` that call into Page Object
  methods — avoid touching Playwright APIs directly in step files.
- **New environment**: add `<ENV>_BASE_URL` / `<ENV>_EMAIL` / `<ENV>_PASSWORD`
  to `.env` and a matching `npm run test:<env>` script.
