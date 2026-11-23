import { expect, test } from '@playwright/test';
import { addExpense, daysAgo, expectTitles, freshStart } from './helpers';

test.describe('US2 Review expenses', () => {
  test.beforeEach(async ({ page }) => freshStart(page));

  test('AC2.3 shows an empty state with no expenses', async ({ page }) => {
    await expect(page.getByTestId('empty-state')).toHaveText('No expenses yet');
    await expect(page.getByTestId('total-amount')).toHaveText('$0.00');
  });

  test('AC2.1 + AC2.2 lists newest first and totals exactly', async ({ page }) => {
    await addExpense(page, { title: 'A', amount: '0.10', date: daysAgo(0) });
    await addExpense(page, { title: 'B', amount: '0.20', date: daysAgo(0) });
    await expectTitles(page, ['B', 'A']);
    await expect(page.getByTestId('total-amount')).toHaveText('$0.30');
    await expect(page.getByTestId('empty-state')).toHaveCount(0);
  });
});
