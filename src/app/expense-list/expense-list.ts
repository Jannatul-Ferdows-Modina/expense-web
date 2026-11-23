import { Component, input, output } from '@angular/core';
import type { Expense } from '@expense/core';
@Component({ selector: 'app-expense-list', template: '' })
export class ExpenseList {
  readonly expenses = input<Expense[]>([]);
  readonly edit = output<Expense>();
  readonly remove = output<string>();
}
