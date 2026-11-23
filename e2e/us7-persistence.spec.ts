import { expect, test } from '@playwright/test';
import { addExpense, expectTitles, freshStart } from './helpers';

test.describe('US7 Keep my data', () => {
  test('AC7.1 expenses and budget survive a reload', async ({ page }) => {
    await freshStart(page);
    await addExpense(page, { title: 'Gym', amount: '25', category: 'Health' });
    await page.getByTestId('budget-input').fill('200');
    await page.getByTestId('budget-save').click();

    await page.reload();

    await expectTitles(page, ['Gym']);
    await expect(page.getByTestId('budget-input')).toHaveValue('200');
    await expect(page.getByTestId('budget-remaining')).toHaveText('$175.00 left of $200.00');
  });
});
