import { TestBed } from '@angular/core/testing';
import { CATEGORIES } from '@expense/core';
import { ExpenseStore } from '../data/expense.store';
import { byTestId, provideTestEnvironment, setValue } from '../../testing/test-providers';
import { FilterBar } from './filter-bar';

describe('FilterBar (AC4.1, AC4.2)', () => {
  let el: HTMLElement;
  let store: ExpenseStore;
  let fixture: ReturnType<typeof TestBed.createComponent<FilterBar>>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FilterBar], providers: provideTestEnvironment() });
    store = TestBed.inject(ExpenseStore);
    fixture = TestBed.createComponent(FilterBar);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('reflects the store filter', () => {
    expect(byTestId<HTMLInputElement>(el, 'filter-month')!.value).toBe('2026-11');
    expect(byTestId<HTMLSelectElement>(el, 'filter-category')!.value).toBe('All');
  });

  it('offers All plus every category', () => {
    const options = Array.from(byTestId<HTMLSelectElement>(el, 'filter-category')!.options).map((o) => o.value);
    expect(options).toEqual(['All', ...CATEGORIES]);
  });

  it('updates the store month and category', () => {
    setValue(byTestId<HTMLInputElement>(el, 'filter-month')!, '2026-10');
    setValue(byTestId<HTMLSelectElement>(el, 'filter-category')!, 'Health');
    expect(store.filter()).toEqual({ month: '2026-10', category: 'Health' });
  });

  it('"All months" clears the month filter', async () => {
    byTestId<HTMLButtonElement>(el, 'filter-all-months')!.click();
    await fixture.whenStable();
    expect(store.filter().month).toBe('');
    expect(byTestId<HTMLInputElement>(el, 'filter-month')!.value).toBe('');
  });
});
