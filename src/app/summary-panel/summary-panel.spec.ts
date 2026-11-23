import { TestBed } from '@angular/core/testing';
import { ExpenseStore } from '../data/expense.store';
import { allByTestId, byTestId, provideTestEnvironment } from '../../testing/test-providers';
import { SummaryPanel } from './summary-panel';

describe('SummaryPanel (AC2.2, AC5.1)', () => {
  it('shows the total and per-category breakdown of visible expenses', async () => {
    TestBed.configureTestingModule({ imports: [SummaryPanel], providers: provideTestEnvironment() });
    const store = TestBed.inject(ExpenseStore);
    store.add({ title: 'Lunch', amount: 30, category: 'Food', date: '2026-11-20' });
    store.add({ title: 'Train', amount: 10, category: 'Transport', date: '2026-11-21' });

    const fixture = TestBed.createComponent(SummaryPanel);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(byTestId(el, 'total-amount')!.textContent!.trim()).toBe('$40.00');
    const rows = allByTestId(el, 'breakdown-row');
    expect(rows.map((r) => byTestId(r, 'breakdown-category')!.textContent!.trim())).toEqual(['Food', 'Transport']);
    expect(rows.map((r) => byTestId(r, 'breakdown-percent')!.textContent!.trim())).toEqual(['75%', '25%']);
    expect(byTestId<HTMLElement>(rows[0]!, 'breakdown-bar')!.style.width).toBe('75%');
  });

  it('hides the breakdown when there is nothing to show', async () => {
    TestBed.configureTestingModule({ imports: [SummaryPanel], providers: provideTestEnvironment() });
    const fixture = TestBed.createComponent(SummaryPanel);
    await fixture.whenStable();
    expect(byTestId(fixture.nativeElement, 'total-amount')!.textContent!.trim()).toBe('$0.00');
    expect(byTestId(fixture.nativeElement, 'breakdown')).toBeNull();
  });
});
