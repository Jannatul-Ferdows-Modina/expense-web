import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CATEGORIES } from '@expense/core';
import { ExpenseStore } from '../data/expense.store';

/** Month and category filters bound directly to the store (F6). */
@Component({
  selector: 'app-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-testid': 'filter-bar' },
  template: `
    <div class="card bar">
      <label>
        Month
        <input type="month" data-testid="filter-month" [value]="store.filter().month" (input)="setMonth($event)" />
      </label>
      <button type="button" class="btn btn--small" data-testid="filter-all-months"
        [attr.aria-pressed]="!store.filter().month" (click)="store.setFilter({ month: '' })">All months</button>
      <label>
        Category
        <select data-testid="filter-category" (change)="setCategory($event)">
          @for (option of options; track option) {
            <option [value]="option" [selected]="option === store.filter().category">{{ option }}</option>
          }
        </select>
      </label>
    </div>
  `,
  styles: `
    .bar { display: flex; flex-wrap: wrap; align-items: end; gap: 0.75rem 1rem; }
    label { display: flex; flex-direction: column; gap: 0.3rem; }
    button[aria-pressed='true'] { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
  `,
})
export class FilterBar {
  protected readonly store = inject(ExpenseStore);
  protected readonly options = ['All', ...CATEGORIES];

  protected setMonth(event: Event): void {
    this.store.setFilter({ month: (event.target as HTMLInputElement).value });
  }

  protected setCategory(event: Event): void {
    this.store.setFilter({ category: (event.target as HTMLSelectElement).value });
  }
}
