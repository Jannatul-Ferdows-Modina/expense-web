import { Provider } from '@angular/core';
import { CLOCK } from '../app/data/expense.store';
import { BROWSER_STORAGE } from '../app/data/storage.service';

/** Frozen "now" used by all unit tests: 2026-11-23 12:00 local time. */
export const TEST_NOW = new Date(2026, 10, 23, 12, 0, 0);

/** In-memory storage + frozen clock so each TestBed gets an isolated, deterministic store. */
export function provideTestEnvironment(initial: Record<string, string> = {}): Provider[] {
  const backing = new Map(Object.entries(initial));
  return [
    { provide: BROWSER_STORAGE, useValue: { getItem: (k: string) => backing.get(k) ?? null, setItem: (k: string, v: string) => backing.set(k, v) } },
    { provide: CLOCK, useValue: () => TEST_NOW },
  ];
}

/** Shorthand to query by data-testid. */
export const byTestId = <T extends Element = HTMLElement>(root: Element, id: string): T | null =>
  root.querySelector<T>(`[data-testid="${id}"]`);

export const allByTestId = <T extends Element = HTMLElement>(root: Element, id: string): T[] =>
  Array.from(root.querySelectorAll<T>(`[data-testid="${id}"]`));

/** Set an input/select value and dispatch the events Angular listens to. */
export function setValue(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string): void {
  el.value = value;
  el.dispatchEvent(new Event('input'));
  el.dispatchEvent(new Event('change'));
}
