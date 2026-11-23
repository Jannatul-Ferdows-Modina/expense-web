import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE, StorageService } from './storage.service';

describe('StorageService (F10)', () => {
  let backing: Map<string, string>;
  let service: StorageService;

  beforeEach(() => {
    backing = new Map();
    const fake: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (k) => backing.get(k) ?? null,
      setItem: (k, v) => void backing.set(k, v),
    };
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: fake }] });
    service = TestBed.inject(StorageService);
  });

  it('returns the fallback when the key is missing', () => {
    expect(service.load('missing', [1])).toEqual([1]);
  });

  it('round-trips JSON values', () => {
    service.save('k', { a: 1 });
    expect(backing.get('k')).toBe('{"a":1}');
    expect(service.load('k', null)).toEqual({ a: 1 });
  });

  it('returns the fallback when stored data is corrupted', () => {
    backing.set('k', '{not json');
    expect(service.load('k', 'fallback')).toBe('fallback');
  });

  it('defaults to window.localStorage', () => {
    TestBed.resetTestingModule();
    expect(TestBed.inject(BROWSER_STORAGE)).toBe(localStorage);
  });
});
