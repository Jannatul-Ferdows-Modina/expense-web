import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Expense } from '@expense/core';
import { allByTestId, byTestId } from '../../testing/test-providers';
import { ExpenseList } from './expense-list';

const expenses: Expense[] = [
  { id: '1', title: 'Groceries', amount: 42.1, category: 'Food', date: '2026-11-20', createdAt: 2, note: 'weekly' },
  { id: '2', title: 'Bus', amount: 2, category: 'Transport', date: '2026-11-19', createdAt: 1 },
];

describe('ExpenseList', () => {
  let fixture: ComponentFixture<ExpenseList>;
  let el: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ExpenseList);
    el = fixture.nativeElement;
  });

  it('shows the empty state when there are no expenses (AC2.3)', async () => {
    fixture.componentRef.setInput('expenses', []);
    await fixture.whenStable();
    expect(byTestId(el, 'empty-state')!.textContent!.trim()).toBe('No expenses yet');
    expect(allByTestId(el, 'expense-row')).toHaveLength(0);
  });

  it('renders one row per expense in the given order, formatted', async () => {
    fixture.componentRef.setInput('expenses', expenses);
    await fixture.whenStable();
    const rows = allByTestId(el, 'expense-row');
    expect(rows.map((r) => byTestId(r, 'expense-title')!.textContent!.trim())).toEqual(['Groceries', 'Bus']);
    expect(byTestId(rows[0]!, 'expense-amount')!.textContent!.trim()).toBe('$42.10');
    expect(byTestId(rows[0]!, 'expense-category')!.textContent!.trim()).toBe('Food');
    expect(byTestId(rows[0]!, 'expense-date')!.textContent!.trim()).toBe('Nov 20, 2026');
    expect(byTestId(rows[0]!, 'expense-note')!.textContent!.trim()).toBe('weekly');
    expect(byTestId(rows[1]!, 'expense-note')).toBeNull();
    expect(byTestId(el, 'empty-state')).toBeNull();
  });

  it('emits edit and remove for the clicked row (AC3.1, AC3.2)', async () => {
    fixture.componentRef.setInput('expenses', expenses);
    await fixture.whenStable();
    const edit = vi.fn();
    const remove = vi.fn();
    fixture.componentInstance.edit.subscribe(edit);
    fixture.componentInstance.remove.subscribe(remove);

    const second = allByTestId(el, 'expense-row')[1]!;
    byTestId<HTMLButtonElement>(second, 'edit-btn')!.click();
    byTestId<HTMLButtonElement>(second, 'delete-btn')!.click();

    expect(edit).toHaveBeenCalledWith(expenses[1]);
    expect(remove).toHaveBeenCalledWith('2');
  });

  it('gives action buttons accessible labels', async () => {
    fixture.componentRef.setInput('expenses', expenses);
    await fixture.whenStable();
    expect(byTestId(el, 'delete-btn')!.getAttribute('aria-label')).toBe('Delete Groceries');
  });
});
