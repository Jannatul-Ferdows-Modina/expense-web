# expense-web

Angular 22 front end for the **Expense Tracker** capstone. All business rules come from
[`expense-core`](../core) (resolved via the `@expense/core` TypeScript path alias), so this
repo must be checked out as the `web/` submodule of `expense-tracker`.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm start` | Dev server on http://localhost:4200 |
| `npm test` | Unit/component tests (Angular unit-test builder + Vitest, jsdom) |
| `npm run coverage` | Unit tests with coverage → `coverage/expense-web/` |
| `npm run e2e` | Playwright E2E (starts the dev server automatically) |
| `npm run e2e:ui` | Playwright UI mode for debugging |
| `npm run build` | Production build → `dist/` |

## Structure

```
src/app/
  data/            StorageService (localStorage) + ExpenseStore (signals)
  expense-form/    add / edit form, shows core validation errors
  expense-list/    presentational list with edit/delete outputs
  filter-bar/      month + category filters
  summary-panel/   total and per-category breakdown
  budget-panel/    monthly budget and status
src/testing/       shared test providers (in-memory storage, frozen clock)
e2e/               Playwright specs, one per user story (US1–US7)
```

Tests locate elements only via `data-testid`.
