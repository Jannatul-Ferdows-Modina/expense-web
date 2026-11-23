import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ExpenseStore } from './data/expense.store';
import { byTestId, provideTestEnvironment } from '../testing/test-providers';

describe('App', () => {
  const setup = async () => {
    TestBed.configureTestingModule({ imports: [App], providers: provideTestEnvironment() });
    const store = TestBed.inject(ExpenseStore);
    store.add({ title: 'Movie', amount: 12, category: 'Entertainment', date: '2026-11-10' });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, store, el: fixture.nativeElement as HTMLElement };
  };

  it('renders the heading and every panel', async () => {
    const { el } = await setup();
    expect(el.querySelector('h1')?.textContent).toContain('Expense Tracker');
    for (const id of ['expense-form', 'filter-bar', 'expense-list', 'summary-panel', 'budget-panel']) {
      expect(byTestId(el, id), id).not.toBeNull();
    }
  });

  it('wires list edit → form and form done → back to add mode (AC3.2)', async () => {
    const { fixture, el } = await setup();
    byTestId<HTMLButtonElement>(el, 'edit-btn')!.click();
    await fixture.whenStable();
    expect(byTestId<HTMLInputElement>(el, 'title-input')!.value).toBe('Movie');

    byTestId<HTMLButtonElement>(el, 'cancel-edit-btn')!.click();
    await fixture.whenStable();
    expect(byTestId(el, 'submit-btn')!.textContent!.trim()).toBe('Add expense');
  });

  it('wires list delete → store, and leaves edit mode if the edited expense is deleted', async () => {
    const { fixture, el, store } = await setup();
    byTestId<HTMLButtonElement>(el, 'edit-btn')!.click();
    await fixture.whenStable();
    byTestId<HTMLButtonElement>(el, 'delete-btn')!.click();
    await fixture.whenStable();
    expect(store.expenses()).toEqual([]);
    expect(byTestId(el, 'submit-btn')!.textContent!.trim()).toBe('Add expense');
  });

  it('stays in edit mode when a different expense is deleted', async () => {
    const { fixture, el, store } = await setup();
    store.add({ title: 'Bread', amount: 3, category: 'Food', date: '2026-11-11' });
    await fixture.whenStable();
    const rows = el.querySelectorAll<HTMLElement>('[data-testid="expense-row"]');
    byTestId<HTMLButtonElement>(rows[1]!, 'edit-btn')!.click(); // Movie
    await fixture.whenStable();
    byTestId<HTMLButtonElement>(rows[0]!, 'delete-btn')!.click(); // Bread
    await fixture.whenStable();
    expect(byTestId(el, 'submit-btn')!.textContent!.trim()).toBe('Save changes');
  });
});
