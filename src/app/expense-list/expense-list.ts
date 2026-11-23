import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Expense } from '@expense/core';

/** Presentational list of expenses; emits user intents, owns no state. */
@Component({
  selector: 'app-expense-list',
  imports: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-testid': 'expense-list' },
  template: `
    <section class="card">
      <h2>Expenses</h2>
      @if (expenses().length === 0) {
        <p class="empty" data-testid="empty-state">No expenses yet</p>
      } @else {
        <ul>
          @for (expense of expenses(); track expense.id) {
            <li data-testid="expense-row">
              <div class="main">
                <span class="title" data-testid="expense-title">{{ expense.title }}</span>
                <span class="meta">
                  <span class="chip" data-testid="expense-category">{{ expense.category }}</span>
                  <time [attr.datetime]="expense.date" data-testid="expense-date">{{ expense.date | date: 'mediumDate' }}</time>
                </span>
                @if (expense.note) {
                  <span class="note" data-testid="expense-note">{{ expense.note }}</span>
                }
              </div>
              <span class="amount" data-testid="expense-amount">{{ expense.amount | currency }}</span>
              <div class="row-actions">
                <button type="button" class="btn btn--small" data-testid="edit-btn"
                  [attr.aria-label]="'Edit ' + expense.title" (click)="edit.emit(expense)">Edit</button>
                <button type="button" class="btn btn--small btn--danger" data-testid="delete-btn"
                  [attr.aria-label]="'Delete ' + expense.title" (click)="remove.emit(expense.id)">Delete</button>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    ul { list-style: none; margin: 0; padding: 0; }
    li {
      display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 0.75rem;
      padding: 0.7rem 0; border-top: 1px solid var(--border);
    }
    li:first-child { border-top: none; }
    .main { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
    .title { font-weight: 600; }
    .meta { display: flex; gap: 0.5rem; align-items: center; color: var(--muted); font-size: 0.8rem; }
    .note { color: var(--muted); font-size: 0.8rem; overflow-wrap: anywhere; }
    .amount { font-variant-numeric: tabular-nums; font-weight: 600; }
    .row-actions { display: flex; gap: 0.35rem; }
    .empty { color: var(--muted); text-align: center; padding: 1.5rem 0; margin: 0; }
    @media (max-width: 520px) {
      li { grid-template-columns: 1fr auto; }
      .row-actions { grid-column: 1 / -1; }
    }
  `,
})
export class ExpenseList {
  readonly expenses = input<Expense[]>([]);
  readonly edit = output<Expense>();
  readonly remove = output<string>();
}
