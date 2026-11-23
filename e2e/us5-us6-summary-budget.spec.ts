import { expect, test } from '@playwright/test';
import { addExpense, freshStart } from './helpers';

test.describe('US5 Spending breakdown', () => {
  test.beforeEach(async ({ page }) => freshStart(page));

  test('AC5.1 shows each category with amount and share', async ({ page }) => {
    await addExpense(page, { title: 'Lunch', amount: '30', category: 'Food' });
    await addExpense(page, { title: 'Train', amount: '10', category: 'Transport' });

    const rows = page.getByTestId('breakdown-row');
    await expect(rows.getByTestId('breakdown-category')).toHaveText(['Food', 'Transport']);
    await expect(rows.getByTestId('breakdown-amount')).toHaveText(['$30.00', '$10.00']);
    await expect(rows.getByTestId('breakdown-percent')).toHaveText(['75%', '25%']);
  });
});

test.describe('US6 Stay within budget', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await page.getByTestId('budget-input').fill('100');
    await page.getByTestId('budget-save').click();
  });

  test('AC6.1 shows remaining budget for the month', async ({ page }) => {
    await addExpense(page, { title: 'Shoes', amount: '40', category: 'Shopping' });
    await expect(page.getByTestId('budget-status')).toHaveAttribute('data-state', 'ok');
    await expect(page.getByTestId('budget-remaining')).toHaveText('$60.00 left of $100.00');
  });

  test('AC6.2 warns at 80 % and flags over budget', async ({ page }) => {
    await addExpense(page, { title: 'Phone bill', amount: '85', category: 'Utilities' });
    await expect(page.getByTestId('budget-status')).toHaveAttribute('data-state', 'warning');
    await expect(page.getByTestId('budget-message')).toHaveText('85% of budget used');

    await addExpense(page, { title: 'Snacks', amount: '20' });
    await expect(page.getByTestId('budget-status')).toHaveAttribute('data-state', 'over');
    await expect(page.getByTestId('budget-message')).toHaveText('Over budget by $5.00');
  });
});
