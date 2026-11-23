import { Injectable, InjectionToken, inject } from '@angular/core';

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** The storage backend; defaults to `window.localStorage`, swappable in tests. */
export const BROWSER_STORAGE = new InjectionToken<KeyValueStorage>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});

/** Thin JSON wrapper around browser storage that never throws on bad data (F10). */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(BROWSER_STORAGE);

  load<T>(key: string, fallback: T): T {
    const raw = this.storage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  save(key: string, value: unknown): void {
    this.storage.setItem(key, JSON.stringify(value));
  }
}
