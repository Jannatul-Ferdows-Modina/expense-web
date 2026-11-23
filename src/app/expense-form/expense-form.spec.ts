import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Expense } from '@expense/core';
import { ExpenseStore } from '../data/expense.store';
import { byTestId, provideTestEnvironment, setValue } from '../../testing/test-providers';
import { ExpenseForm } from './expense-form';

describe('ExpenseForm', () => {
  let fixture: ComponentFixture<ExpenseForm>;
  let el: HTMLElement;
  let store: ExpenseStore;

  const fill = (values: Partial<Record<'title' | 'amount' | 'category' | 'date' | 'note', string>>) => {
    for (const [field, value] of Object.entries(values)) {
      const id = field === 'category' ? 'category-select' : `${field}-input`;
      setValue(byTestId<HTMLInputElement>(el, id)!, value);
    }
  };
  const submit = async () => {
    byTestId<HTMLButtonElement>(el, 'submit-btn')!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ExpenseForm], providers: provideTestEnvironment() });
    store = TestBed.inject(ExpenseStore);
    fixture = TestBed.createComponent(ExpenseForm);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('defaults category to Food and date to today', () => {
    expect(byTestId<HTMLSelectElement>(el, 'category-select')!.value).toBe('Food');
    expect(byTestId<HTMLInputElement>(el, 'date-input')!.value).toBe('2026-11-23');
    expect(byTestId(el, 'submit-btn')!.textContent!.trim()).toBe('Add expense');
  });

  it('adds a valid expense to the store and resets (AC1.1, AC1.5)', async () => {
    fill({ title: 'Coffee', amount: '3.5', category: 'Food', date: '2026-11-20' });
    await submit();
    expect(store.expenses()).toMatchObject([{ title: 'Coffee', amount: 3.5, date: '2026-11-20' }]);
    expect(byTestId<HTMLInputElement>(el, 'title-input')!.value).toBe('');
    expect(byTestId<HTMLInputElement>(el, 'amount-input')!.value).toBe('');
  });

  it('shows field errors from core validation and adds nothing (AC1.2, AC1.3)', async () => {
    fill({ title: '', amount: '0' });
    await submit();
    expect(byTestId(el, 'error-title')!.textContent!.trim()).toBe('Title is required');
    expect(byTestId(el, 'error-amount')!.textContent!.trim()).toBe('Amount must be greater than 0');
    expect(byTestId(el, 'title-input')!.getAttribute('aria-invalid')).toBe('true');
    expect(store.expenses()).toEqual([]);
  });

  it('clears errors after a successful submit', async () => {
    fill({ title: '' , amount: '5' });
    await submit();
    fill({ title: 'Fixed' });
    await submit();
    expect(byTestId(el, 'error-title')).toBeNull();
  });

  describe('editing (AC3.2)', () => {
    let expense: Expense;

    beforeEach(async () => {
      store.add({ title: 'Movie', amount: 12, category: 'Entertainment', date: '2026-11-10', note: 'IMAX' });
      expense = store.expenses()[0]!;
      fixture.componentRef.setInput('editing', expense);
      await fixture.whenStable();
    });

    it('loads the expense into the form', () => {
      expect(byTestId<HTMLInputElement>(el, 'title-input')!.value).toBe('Movie');
      expect(byTestId<HTMLInputElement>(el, 'amount-input')!.value).toBe('12');
      expect(byTestId<HTMLSelectElement>(el, 'category-select')!.value).toBe('Entertainment');
      expect(byTestId<HTMLTextAreaElement>(el, 'note-input')!.value).toBe('IMAX');
      expect(byTestId(el, 'submit-btn')!.textContent!.trim()).toBe('Save changes');
    });

    it('updates the expense and emits done', async () => {
      const done = vi.fn();
      fixture.componentInstance.done.subscribe(done);
      fill({ title: 'Cinema' });
      await submit();
      expect(store.expenses()).toMatchObject([{ id: expense.id, title: 'Cinema' }]);
      expect(done).toHaveBeenCalledOnce();
    });

    it('cancel emits done without saving', async () => {
      const done = vi.fn();
      fixture.componentInstance.done.subscribe(done);
      fill({ title: 'Changed' });
      byTestId<HTMLButtonElement>(el, 'cancel-edit-btn')!.click();
      expect(done).toHaveBeenCalledOnce();
      expect(store.expenses()[0]!.title).toBe('Movie');
    });

    it('returns to an empty add form when editing ends', async () => {
      fixture.componentRef.setInput('editing', null);
      await fixture.whenStable();
      expect(byTestId<HTMLInputElement>(el, 'title-input')!.value).toBe('');
      expect(byTestId(el, 'cancel-edit-btn')).toBeNull();
    });
  });
});
