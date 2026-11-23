import { Injectable, InjectionToken, signal } from '@angular/core';
import type { Expense, ExpenseInput, ValidationResult, CategorySummary, BudgetStatus } from '@expense/core';
export const EXPENSES_KEY = 'expense-tracker.expenses';
export const BUDGET_KEY = 'expense-tracker.budget';
export const CLOCK = new InjectionToken<() => Date>('CLOCK');
@Injectable({ providedIn: 'root' })
export class ExpenseStore {
  readonly expenses = signal<Expense[]>([]);
  readonly filter = signal({ month: '', category: 'All' });
  readonly budget = signal<number | null>(null);
  readonly visible = signal<Expense[]>([]);
  readonly total = signal(0);
  readonly breakdown = signal<CategorySummary[]>([]);
  readonly budgetStatus = signal<BudgetStatus>({ state: 'ok', remaining: 0, percentUsed: 0 });
  add(_i: ExpenseInput): ValidationResult { return { valid: false, errors: {} }; }
  update(_id: string, _i: ExpenseInput): ValidationResult { return { valid: false, errors: {} }; }
  remove(_id: string): void {}
  setFilter(_f: Partial<{ month: string; category: string }>): void {}
  setBudget(_b: number | null): void {}
}
