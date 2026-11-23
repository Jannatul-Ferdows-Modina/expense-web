import { expect, type Page } from '@playwright/test';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date `n` days ago as YYYY-MM-DD (never in the future, satisfies BR4). */
export const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const today = () => daysAgo(0);
export const currentMonth = () => today().slice(0, 7);

/** Open the app with empty storage. */
export async function freshStart(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

export interface ExpenseData {
  title: string;
  amount: string;
  category?: string;
  date?: string;
  note?: string;
}

/** Fill the expense form and submit it. */
export async function addExpense(page: Page, e: ExpenseData): Promise<void> {
  await fillForm(page, e);
  await page.getByTestId('submit-btn').click();
}

export async function fillForm(page: Page, e: Partial<ExpenseData>): Promise<void> {
  if (e.title !== undefined) await page.getByTestId('title-input').fill(e.title);
  if (e.amount !== undefined) await page.getByTestId('amount-input').fill(e.amount);
  await page.getByTestId('category-select').selectOption(e.category ?? 'Food');
  await page.getByTestId('date-input').fill(e.date ?? today());
  if (e.note !== undefined) await page.getByTestId('note-input').fill(e.note);
}

export const rows = (page: Page) => page.getByTestId('expense-row');

export async function expectTitles(page: Page, titles: string[]): Promise<void> {
  await expect(rows(page).getByTestId('expense-title')).toHaveText(titles);
}

/** Last day of the previous month as YYYY-MM-DD. */
export const lastDayOfPreviousMonth = (): string => {
  const d = new Date();
  d.setDate(0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
