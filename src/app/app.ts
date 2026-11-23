import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { Expense } from '@expense/core';
import { BudgetPanel } from './budget-panel/budget-panel';
import { ExpenseStore } from './data/expense.store';
import { ExpenseForm } from './expense-form/expense-form';
import { ExpenseList } from './expense-list/expense-list';
import { FilterBar } from './filter-bar/filter-bar';
import { SummaryPanel } from './summary-panel/summary-panel';

/** Shell component: lays out the panels and coordinates edit mode between list and form. */
@Component({
  selector: 'app-root',
  imports: [ExpenseForm, ExpenseList, FilterBar, SummaryPanel, BudgetPanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(ExpenseStore);
  protected readonly editing = signal<Expense | null>(null);

  protected remove(id: string): void {
    this.store.remove(id);
    if (this.editing()?.id === id) this.editing.set(null);
  }
}
