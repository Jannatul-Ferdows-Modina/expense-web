import { Component, input, output } from '@angular/core';
import type { Expense } from '@expense/core';
@Component({ selector: 'app-expense-form', template: '' })
export class ExpenseForm {
  readonly editing = input<Expense | null>(null);
  readonly done = output<void>();
}
