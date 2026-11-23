import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import {
  type Expense,
  type ExpenseFilter,
  type ExpenseInput,
  type ValidationResult,
  budgetStatus,
  filterExpenses,
  monthOf,
  sortExpenses,
  summarizeByCategory,
  toExpense,
  todayIso,
  totalOf,
  validateExpense,
} from '@expense/core';
import { StorageService } from './storage.service';

export const EXPENSES_KEY = 'expense-tracker.expenses';
export const BUDGET_KEY = 'expense-tracker.budget';

/** Source of "now"; injectable so tests are deterministic. */
export const CLOCK = new InjectionToken<() => Date>('CLOCK', {
  providedIn: 'root',
  factory: () => () => new Date(),
});

export type Filter = Required<ExpenseFilter>;

/**
 * Application state. Holds the raw data in signals and derives everything else
 * through pure functions from `@expense/core`. All mutations are persisted (F10).
 */
@Injectable({ providedIn: 'root' })
export class ExpenseStore {
  private readonly storage = inject(StorageService);
  private readonly now = inject(CLOCK);

  private readonly today = () => todayIso(this.now());
  readonly currentMonth = monthOf(this.today());

  readonly expenses = signal<Expense[]>(this.loadExpenses());
  readonly budget = signal<number | null>(this.storage.load<number | null>(BUDGET_KEY, null));
  readonly filter = signal<Filter>({ month: this.currentMonth, category: 'All' });

  readonly visible = computed(() => sortExpenses(filterExpenses(this.expenses(), this.filter())));
  readonly total = computed(() => totalOf(this.visible()));
  readonly breakdown = computed(() => summarizeByCategory(this.visible()));

  /** Budget applies to a whole month (all categories); "all months" falls back to the current month. */
  readonly budgetMonth = computed(() => this.filter().month || this.currentMonth);
  readonly budgetStatus = computed(() =>
    budgetStatus(totalOf(filterExpenses(this.expenses(), { month: this.budgetMonth() })), this.budget()),
  );

  add(input: ExpenseInput): ValidationResult {
    const result = validateExpense(input, this.today());
    if (result.valid) {
      const expense = toExpense(input, { id: crypto.randomUUID(), createdAt: this.nextCreatedAt() }, this.today());
      this.setExpenses([...this.expenses(), expense]);
    }
    return result;
  }

  update(id: string, input: ExpenseInput): ValidationResult {
    const result = validateExpense(input, this.today());
    if (result.valid) {
      this.setExpenses(this.expenses().map((e) => (e.id === id ? toExpense(input, e, this.today()) : e)));
    }
    return result;
  }

  remove(id: string): void {
    this.setExpenses(this.expenses().filter((e) => e.id !== id));
  }

  setFilter(patch: Partial<Filter>): void {
    this.filter.update((f) => ({ ...f, ...patch }));
  }

  setBudget(budget: number | null): void {
    this.budget.set(budget);
    this.storage.save(BUDGET_KEY, budget);
  }

  private setExpenses(expenses: Expense[]): void {
    this.expenses.set(expenses);
    this.storage.save(EXPENSES_KEY, expenses);
  }

  /** Strictly increasing timestamp so same-millisecond adds still sort deterministically (BR7). */
  private nextCreatedAt(): number {
    const latest = Math.max(0, ...this.expenses().map((e) => e.createdAt));
    return Math.max(this.now().getTime(), latest + 1);
  }

  private loadExpenses(): Expense[] {
    const stored = this.storage.load<unknown>(EXPENSES_KEY, []);
    return Array.isArray(stored) ? (stored as Expense[]) : [];
  }
}
