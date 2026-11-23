import { Injectable, InjectionToken } from '@angular/core';
export const BROWSER_STORAGE = new InjectionToken<Pick<Storage, 'getItem' | 'setItem'>>('BROWSER_STORAGE');
@Injectable({ providedIn: 'root' })
export class StorageService {
  load<T>(_key: string, fallback: T): T { return fallback; }
  save(_key: string, _value: unknown): void {}
}
