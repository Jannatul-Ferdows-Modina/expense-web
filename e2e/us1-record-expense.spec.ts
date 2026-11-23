import { expect, test } from '@playwright/test';
import { addExpense, daysAgo, expectTitles, fillForm, freshStart, rows } from './helpers';

test.describe('US1 Record an expense', () => {
  test.beforeEach(async ({ page }) => freshStart(page));

  test('AC1.1 a valid expense appears at the top of the list', async ({ page }) => {
    await addExpense(page, { title: 'Coffee', amount: '3.50', date: daysAgo(2) });
    await addExpense(page, { title: 'Groceries', amount: '42.10', date: daysAgo(1) });
    await expectTitles(page, ['Groceries', 'Coffee']);
    await expect(rows(page).first().getByTestId('expense-amount')).toHaveText('$42.10');
  });

  test('AC1.2 an empty title shows an error and adds nothing', async ({ page }) => {
    await addExpense(page, { title: '', amount: '5' });
    await expect(page.getByTestId('error-title')).toHaveText('Title is required');
    await expect(rows(page)).toHaveCount(0);
  });

  test('AC1.3 a zero amount is rejected', async ({ page }) => {
    await addExpense(page, { title: 'Free', amount: '0' });
    await expect(page.getByTestId('error-amount')).toHaveText('Amount must be greater than 0');
  });

  test('AC1.4 a future date is rejected', async ({ page }) => {
    await addExpense(page, { title: 'Later', amount: '5', date: daysAgo(-3) });
    await expect(page.getByTestId('error-date')).toHaveText('Date cannot be in the future');
    await expect(rows(page)).toHaveCount(0);
  });

  test('AC1.5 the form resets after a successful add', async ({ page }) => {
    await addExpense(page, { title: 'Taxi', amount: '18', category: 'Transport' });
    await expect(page.getByTestId('title-input')).toHaveValue('');
    await expect(page.getByTestId('amount-input')).toHaveValue('');
  });

  test('errors clear once the field is corrected', async ({ page }) => {
    await addExpense(page, { title: '', amount: '5' });
    await expect(page.getByTestId('error-title')).toBeVisible();
    await fillForm(page, { title: 'Fixed' });
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('error-title')).toHaveCount(0);
    await expectTitles(page, ['Fixed']);
  });
});
