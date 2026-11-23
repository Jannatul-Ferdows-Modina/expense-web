import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExpenseStore } from '../data/expense.store';

/** Total and per-category breakdown of the currently visible expenses (F7, F8). */
@Component({
  selector: 'app-summary-panel',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-testid': 'summary-panel' },
  template: `
    <section class="card">
      <h2>Summary</h2>
      <p class="total">
        <span>Total</span>
        <strong data-testid="total-amount">{{ store.total() | currency }}</strong>
      </p>
      @if (store.breakdown().length) {
        <ul data-testid="breakdown">
          @for (row of store.breakdown(); track row.category) {
            <li data-testid="breakdown-row">
              <span data-testid="breakdown-category">{{ row.category }}</span>
              <span class="amount" data-testid="breakdown-amount">{{ row.amount | currency }}</span>
              <span class="percent" data-testid="breakdown-percent">{{ row.percent }}%</span>
              <span class="track" aria-hidden="true"><span class="bar" data-testid="breakdown-bar" [style.width.%]="row.percent"></span></span>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .total { display: flex; justify-content: space-between; align-items: baseline; margin: 0 0 0.75rem; }
    .total strong { font-size: 1.6rem; font-variant-numeric: tabular-nums; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.6rem; }
    li { display: grid; grid-template-columns: 1fr auto 3.5rem; gap: 0.25rem 0.75rem; font-size: 0.9rem; }
    .amount, .percent { text-align: right; font-variant-numeric: tabular-nums; }
    .percent { color: var(--muted); }
    .track { grid-column: 1 / -1; height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
    .bar { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
  `,
})
export class SummaryPanel {
  protected readonly store = inject(ExpenseStore);
}
