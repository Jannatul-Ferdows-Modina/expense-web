import { expect, test } from '@playwright/test';
import { addExpense, expectTitles, freshStart, rows } from './helpers';

test.describe('US3 Remove / correct mistakes', () => {
  test.beforeEach(async ({ page }) => {
    await freshStart(page);
    await addExpense(page, { title: 'Movie', amount: '12', category: 'Entertainment' });
    await addExpense(page, { title: 'Bread', amount: '3' });
  });

  test('AC3.1 deleting removes the expense and updates the total', async ({ page }) => {
    await rows(page).filter({ hasText: 'Bread' }).getByTestId('delete-btn').click();
    await expectTitles(page, ['Movie']);
    await expect(page.getByTestId('total-amount')).toHaveText('$12.00');
  });

  test('AC3.2 editing loads the expense into the form and saves in place', async ({ page }) => {
    await rows(page).filter({ hasText: 'Movie' }).getByTestId('edit-btn').click();
    await expect(page.getByTestId('title-input')).toHaveValue('Movie');
    await expect(page.getByTestId('submit-btn')).toHaveText('Save changes');

    await page.getByTestId('title-input').fill('Cinema');
    await page.getByTestId('amount-input').fill('15');
    await page.getByTestId('submit-btn').click();

    await expect(rows(page)).toHaveCount(2);
    await expect(rows(page).filter({ hasText: 'Cinema' }).getByTestId('expense-amount')).toHaveText('$15.00');
    await expect(page.getByTestId('submit-btn')).toHaveText('Add expense');
  });

  test('cancelling an edit leaves the expense unchanged', async ({ page }) => {
    await rows(page).filter({ hasText: 'Movie' }).getByTestId('edit-btn').click();
    await page.getByTestId('title-input').fill('Changed');
    await page.getByTestId('cancel-edit-btn').click();
    await expectTitles(page, ['Bread', 'Movie']);
    await expect(page.getByTestId('title-input')).toHaveValue('');
  });
});
