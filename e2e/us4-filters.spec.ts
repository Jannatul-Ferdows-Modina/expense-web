import { expect, test } from '@playwright/test';
import { addExpense, currentMonth, daysAgo, expectTitles, freshStart, lastDayOfPreviousMonth } from './helpers';

test.describe('US4 Filter by month and category', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await addExpense(page, { title: 'Old rent', amount: '900', category: 'Housing', date: lastDayOfPreviousMonth() });
    await addExpense(page, { title: 'Bus', amount: '2', category: 'Transport', date: daysAgo(0) });
    await addExpense(page, { title: 'Pizza', amount: '11', category: 'Food', date: daysAgo(0) });
  });

  test('AC4.1 defaults to the current month and can switch months', async ({ page }) => {
    await expect(page.getByTestId('filter-month')).toHaveValue(currentMonth());
    await expectTitles(page, ['Pizza', 'Bus']);

    await page.getByTestId('filter-month').fill(lastDayOfPreviousMonth().slice(0, 7));
    await expectTitles(page, ['Old rent']);

    await page.getByTestId('filter-all-months').click();
    await expectTitles(page, ['Pizza', 'Bus', 'Old rent']);
  });

  test('AC4.2 filters by category and "All" clears it', async ({ page }) => {
    await page.getByTestId('filter-category').selectOption('Transport');
    await expectTitles(page, ['Bus']);
    await expect(page.getByTestId('total-amount')).toHaveText('$2.00');

    await page.getByTestId('filter-category').selectOption('All');
    await expectTitles(page, ['Pizza', 'Bus']);
  });
});
