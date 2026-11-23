import { TestBed } from '@angular/core/testing';
import type { ExpenseInput } from '@expense/core';
import { BROWSER_STORAGE } from './storage.service';
import { BUDGET_KEY, CLOCK, EXPENSES_KEY, ExpenseStore } from './expense.store';

const NOW = new Date(2026, 10, 23, 12, 0, 0); // 2026-11-23

const input = (patch: Partial<ExpenseInput> = {}): ExpenseInput => ({
  title: 'Lunch',
  amount: 12.5,
  category: 'Food',
  date: '2026-11-20',
  ...patch,
});

describe('ExpenseStore', () => {
  let backing: Map<string, string>;

  const createStore = () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BROWSER_STORAGE,
          useValue: { getItem: (k: string) => backing.get(k) ?? null, setItem: (k: string, v: string) => backing.set(k, v) },
        },
        { provide: CLOCK, useValue: () => NOW },
      ],
    });
    return TestBed.inject(ExpenseStore);
  };

  beforeEach(() => {
    backing = new Map();
  });

  it('starts empty, filtered to the current month', () => {
    const store = createStore();
    expect(store.visible()).toEqual([]);
    expect(store.filter()).toEqual({ month: '2026-11', category: 'All' });
    expect(store.total()).toBe(0);
  });

  describe('add (AC1.1, AC1.2)', () => {
    it('adds a valid expense and returns a valid result', () => {
      const store = createStore();
      const result = store.add(input());
      expect(result.valid).toBe(true);
      expect(store.visible()).toHaveLength(1);
      expect(store.visible()[0]).toMatchObject({ title: 'Lunch', amount: 12.5 });
    });

    it('rejects invalid input and leaves state unchanged', () => {
      const store = createStore();
      const result = store.add(input({ title: '' }));
      expect(result.errors.title).toBe('Title is required');
      expect(store.expenses()).toHaveLength(0);
    });

    it('rejects dates after the injected clock (AC1.4)', () => {
      const store = createStore();
      expect(store.add(input({ date: '2026-11-24' })).errors.date).toBe('Date cannot be in the future');
    });
  });

  it('lists newest first and totals the visible expenses (AC2.1, AC2.2)', () => {
    const store = createStore();
    store.add(input({ title: 'Old', date: '2026-11-01', amount: 0.1 }));
    store.add(input({ title: 'New', date: '2026-11-22', amount: 0.2 }));
    expect(store.visible().map((e) => e.title)).toEqual(['New', 'Old']);
    expect(store.total()).toBe(0.3);
  });

  it('removes an expense (AC3.1)', () => {
    const store = createStore();
    store.add(input());
    store.remove(store.visible()[0]!.id);
    expect(store.visible()).toEqual([]);
  });

  describe('update (AC3.2)', () => {
    it('updates an expense in place keeping id and createdAt', () => {
      const store = createStore();
      store.add(input());
      const original = store.visible()[0]!;
      expect(store.update(original.id, input({ title: 'Dinner', amount: 30 })).valid).toBe(true);
      expect(store.expenses()).toEqual([{ ...original, title: 'Dinner', amount: 30 }]);
    });

    it('rejects invalid updates', () => {
      const store = createStore();
      store.add(input());
      const id = store.visible()[0]!.id;
      expect(store.update(id, input({ amount: -1 })).valid).toBe(false);
      expect(store.visible()[0]!.amount).toBe(12.5);
    });
  });

  describe('filters (AC4.1, AC4.2)', () => {
    it('filters by month and category', () => {
      const store = createStore();
      store.add(input({ title: 'Oct', date: '2026-10-10' }));
      store.add(input({ title: 'Bus', category: 'Transport' }));
      store.add(input({ title: 'Lunch' }));

      expect(store.visible().map((e) => e.title)).toEqual(['Lunch', 'Bus']);
      store.setFilter({ category: 'Transport' });
      expect(store.visible().map((e) => e.title)).toEqual(['Bus']);
      store.setFilter({ month: '', category: 'All' });
      expect(store.visible()).toHaveLength(3);
      store.setFilter({ month: '2026-10' });
      expect(store.visible().map((e) => e.title)).toEqual(['Oct']);
    });
  });

  it('summarises the visible expenses by category (AC5.1)', () => {
    const store = createStore();
    store.add(input({ amount: 30 }));
    store.add(input({ amount: 10, category: 'Transport' }));
    expect(store.breakdown()).toEqual([
      { category: 'Food', amount: 30, percent: 75 },
      { category: 'Transport', amount: 10, percent: 25 },
    ]);
  });

  describe('budget (AC6.1, AC6.2)', () => {
    it('has no budget by default', () => {
      expect(createStore().budgetStatus().state).toBe('none');
    });

    it('computes status from the selected month regardless of category filter', () => {
      const store = createStore();
      store.setBudget(100);
      store.add(input({ amount: 50 }));
      store.add(input({ amount: 35, category: 'Transport' }));
      store.add(input({ amount: 500, date: '2026-10-01' }));
      store.setFilter({ category: 'Food' });
      expect(store.budgetStatus()).toEqual({ state: 'warning', remaining: 15, percentUsed: 85 });
    });

    it('uses the current month when "all months" is selected', () => {
      const store = createStore();
      store.setBudget(100);
      store.add(input({ amount: 120 }));
      store.add(input({ amount: 500, date: '2026-10-01' }));
      store.setFilter({ month: '' });
      expect(store.budgetStatus().state).toBe('over');
      expect(store.budgetStatus().remaining).toBe(-20);
    });
  });

  describe('persistence (AC7.1)', () => {
    it('saves expenses and budget, and restores them in a new store', () => {
      const store = createStore();
      store.add(input());
      store.setBudget(250);
      expect(JSON.parse(backing.get(EXPENSES_KEY)!)).toHaveLength(1);
      expect(backing.get(BUDGET_KEY)).toBe('250');

      TestBed.resetTestingModule();
      const restored = createStore();
      expect(restored.visible()).toHaveLength(1);
      expect(restored.budget()).toBe(250);
    });

    it('ignores stored expenses that are not an array', () => {
      backing.set(EXPENSES_KEY, '{"oops":true}');
      expect(createStore().expenses()).toEqual([]);
    });
  });
});
