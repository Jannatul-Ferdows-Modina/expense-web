import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CATEGORIES, type Expense, type ValidationResult } from '@expense/core';
import { ExpenseStore } from '../data/expense.store';

/**
 * Add / edit form. Validation rules live in `@expense/core`; this component only
 * collects input, delegates to the store and renders the returned field errors.
 */
@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-testid': 'expense-form' },
})
export class ExpenseForm {
  private readonly store = inject(ExpenseStore);

  /** Expense being edited, or `null` in add mode. */
  readonly editing = input<Expense | null>(null);
  /** Emitted when an edit is saved or cancelled. */
  readonly done = output<void>();

  readonly categories = CATEGORIES;
  readonly errors = signal<ValidationResult['errors']>({});

  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    amount: new FormControl<number | null>(null),
    category: new FormControl<string>('Food', { nonNullable: true }),
    date: new FormControl(this.store.today(), { nonNullable: true }),
    note: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const expense = this.editing();
      untracked(() => {
        this.errors.set({});
        if (expense) {
          const { title, amount, category, date, note = '' } = expense;
          this.form.setValue({ title, amount, category, date, note });
        } else {
          this.resetForm();
        }
      });
    });
  }

  submit(): void {
    const input = this.form.getRawValue();
    const editing = this.editing();
    const result = editing ? this.store.update(editing.id, input) : this.store.add(input);

    this.errors.set(result.errors);
    if (!result.valid) return;

    this.resetForm();
    if (editing) this.done.emit();
  }

  cancel(): void {
    this.done.emit();
  }

  private resetForm(): void {
    this.form.reset({ title: '', amount: null, category: 'Food', date: this.store.today(), note: '' });
  }
}
