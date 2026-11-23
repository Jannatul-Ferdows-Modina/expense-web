import { TestBed } from '@angular/core/testing';
import { BUDGET_KEY, ExpenseStore } from '../data/expense.store';
import { byTestId, provideTestEnvironment, setValue } from '../../testing/test-providers';
import { BudgetPanel } from './budget-panel';

describe('BudgetPanel (AC6.1, AC6.2)', () => {
  const setup = async (stored: Record<string, string> = {}) => {
    TestBed.configureTestingModule({ imports: [BudgetPanel], providers: provideTestEnvironment(stored) });
    const store = TestBed.inject(ExpenseStore);
    const fixture = TestBed.createComponent(BudgetPanel);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const text = (id: string) => byTestId(el, id)?.textContent?.trim();
    const save = async (value: string) => {
      setValue(byTestId<HTMLInputElement>(el, 'budget-input')!, value);
      byTestId<HTMLButtonElement>(el, 'budget-save')!.click();
      await fixture.whenStable();
    };
    const add = async (amount: number) => {
      store.add({ title: 'x', amount, category: 'Other', date: '2026-11-20' });
      await fixture.whenStable();
    };
    return { el, store, text, save, add };
  };

  it('prompts to set a budget when none exists', async () => {
    const { el, text } = await setup();
    expect(byTestId(el, 'budget-status')!.getAttribute('data-state')).toBe('none');
    expect(text('budget-message')).toBe('No budget set');
    expect(byTestId(el, 'budget-remaining')).toBeNull();
  });

  it('saves the budget and shows remaining amount (ok state)', async () => {
    const { el, store, text, save, add } = await setup();
    await save('100');
    await add(40);
    expect(store.budget()).toBe(100);
    expect(byTestId(el, 'budget-status')!.getAttribute('data-state')).toBe('ok');
    expect(text('budget-remaining')).toBe('$60.00 left of $100.00');
    expect(text('budget-message')).toBe('40% of budget used');
  });

  it('shows warning and over-budget states', async () => {
    const { el, text, save, add } = await setup();
    await save('100');
    await add(85);
    expect(byTestId(el, 'budget-status')!.getAttribute('data-state')).toBe('warning');
    await add(20);
    expect(byTestId(el, 'budget-status')!.getAttribute('data-state')).toBe('over');
    expect(text('budget-message')).toBe('Over budget by $5.00');
  });

  it('clears the budget when saved empty or zero', async () => {
    const { store, save } = await setup();
    await save('100');
    await save('');
    expect(store.budget()).toBeNull();
    await save('0');
    expect(store.budget()).toBeNull();
  });

  it('pre-fills the input from the stored budget (AC7.1)', async () => {
    const { el } = await setup({ [BUDGET_KEY]: '250' });
    expect(byTestId<HTMLInputElement>(el, 'budget-input')!.value).toBe('250');
  });
});
