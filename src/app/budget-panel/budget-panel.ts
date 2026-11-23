import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ExpenseStore } from '../data/expense.store';

/** Monthly budget setting and status (F9). The state thresholds live in `@expense/core`. */
@Component({
  selector: 'app-budget-panel',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-testid': 'budget-panel' },
  template: `
    <section class="card">
      <h2>Monthly budget <span class="month">{{ store.budgetMonth() }}</span></h2>
      <div class="set">
        <label for="budget" class="sr-only">Monthly budget amount</label>
        <input #budgetInput id="budget" type="number" min="0" step="0.01" placeholder="e.g. 500"
          data-testid="budget-input" [value]="store.budget() ?? ''" (keydown.enter)="save(budgetInput.value)" />
        <button type="button" class="btn" data-testid="budget-save" (click)="save(budgetInput.value)">Save</button>
      </div>

      <div class="status" data-testid="budget-status" [attr.data-state]="status().state" role="status">
        @if (status().state === 'none') {
          <p class="message" data-testid="budget-message">No budget set</p>
        } @else {
          <p class="remaining" data-testid="budget-remaining">
            {{ leftAmount() | currency }} left of {{ store.budget() | currency }}
          </p>
          <div class="meter" aria-hidden="true"><span [style.width.%]="meterPercent()"></span></div>
          <p class="message" data-testid="budget-message">
            @if (status().state === 'over') {
              Over budget by {{ -status().remaining | currency }}
            } @else {
              {{ status().percentUsed }}% of budget used
            }
          </p>
        }
      </div>
    </section>
  `,
  styles: `
    .month { color: var(--muted); font-weight: 400; font-size: 0.85rem; }
    .set { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
    .set input { flex: 1; min-width: 0; }
    .status p { margin: 0.25rem 0; }
    .remaining { font-weight: 600; }
    .message { font-size: 0.85rem; color: var(--muted); }
    .meter { height: 8px; border-radius: 4px; background: var(--border); overflow: hidden; }
    .meter span { display: block; height: 100%; background: var(--ok); }
    [data-state='warning'] .meter span { background: var(--warning); }
    [data-state='warning'] .message { color: var(--warning); }
    [data-state='over'] .meter span { background: var(--danger); }
    [data-state='over'] .message { color: var(--danger); font-weight: 600; }
  `,
})
export class BudgetPanel {
  protected readonly store = inject(ExpenseStore);
  protected readonly status = this.store.budgetStatus;
  protected readonly leftAmount = computed(() => Math.max(0, this.status().remaining));
  protected readonly meterPercent = computed(() => Math.min(100, this.status().percentUsed));

  /** Empty, zero, negative or non-numeric input clears the budget (BR8: 0/unset = no budget). */
  protected save(raw: string): void {
    const value = Number(raw);
    this.store.setBudget(raw.trim() !== '' && Number.isFinite(value) && value > 0 ? value : null);
  }
}
