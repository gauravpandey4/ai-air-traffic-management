import { createOpenMeteoFixture, weatherNowIso } from '../test/weather-fixture';

import { loadObservedWeather, parseRetryAfter, weatherCachePolicy } from './weather-client';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function response(
  options: {
    ok?: boolean;
    status?: number;
    retryAfter?: string;
    payload?: unknown;
  } = {},
) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: new Headers(
      options.retryAfter === undefined ? undefined : { 'Retry-After': options.retryAfter },
    ),
    json: () => Promise.resolve(options.payload ?? createOpenMeteoFixture()),
  };
}

const now = () => new Date(weatherNowIso);

describe('Open-Meteo cache and fallback client', () => {
  it('caches a validated response for 15 minutes and avoids a duplicate request', async () => {
    const storage = new MemoryStorage();
    const fetcher = vi.fn(() => Promise.resolve(response()));
    const observed = await loadObservedWeather({ fetcher, storage, now });
    const cached = await loadObservedWeather({
      fetcher,
      storage,
      now: () => new Date(Date.parse(weatherNowIso) + 14 * 60_000),
    });
    expect(observed.kind).toBe('success');
    expect(cached.kind === 'success' ? cached.snapshot.mode : null).toBe('Cached');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('expires at 15 minutes and fetches a replacement', async () => {
    const storage = new MemoryStorage();
    const fetcher = vi.fn(() => Promise.resolve(response()));
    await loadObservedWeather({ fetcher, storage, now });
    await loadObservedWeather({
      fetcher,
      storage,
      now: () => new Date(Date.parse(weatherNowIso) + weatherCachePolicy.freshForMs),
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it.each([
    [null, null],
    ['', null],
    ['invalid', null],
    ['-1', null],
    ['120', '2026-07-28T18:02:00.000Z'],
    ['Tue, 28 Jul 2026 18:05:00 GMT', '2026-07-28T18:05:00.000Z'],
    ['Tue, 28 Jul 2026 17:00:00 GMT', null],
  ])('parses Retry-After %s as %s', (value, expected) => {
    expect(parseRetryAfter(value, Date.parse(weatherNowIso))).toBe(expected);
  });

  it('stores a valid 429 cooldown and prevents another request before retry', async () => {
    const storage = new MemoryStorage();
    const fetcher = vi.fn(() =>
      Promise.resolve(response({ ok: false, status: 429, retryAfter: '120' })),
    );
    const rateLimited = await loadObservedWeather({ fetcher, storage, now });
    const cooldown = await loadObservedWeather({
      fetcher,
      storage,
      now: () => new Date(Date.parse(weatherNowIso) + 60_000),
    });
    expect(rateLimited).toEqual(
      expect.objectContaining({ kind: 'fallback', retryAtIso: '2026-07-28T18:02:00.000Z' }),
    );
    expect(cooldown).toEqual(expect.objectContaining({ kind: 'fallback' }));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('does not invent retry time for malformed or missing 429 metadata', async () => {
    const result = await loadObservedWeather({
      fetcher: () => Promise.resolve(response({ ok: false, status: 429, retryAfter: 'later' })),
      storage: new MemoryStorage(),
      now,
    });
    expect(result).toEqual(expect.objectContaining({ kind: 'fallback', retryAtIso: null }));
  });

  it.each([
    ['HTTP error', () => Promise.resolve(response({ ok: false, status: 503 }))],
    ['network error', () => Promise.reject(new TypeError('network'))],
    ['invalid payload', () => Promise.resolve(response({ payload: { unexpected: true } }))],
  ])('falls back safely for %s', async (_label, fetcher) => {
    const result = await loadObservedWeather({
      fetcher,
      storage: new MemoryStorage(),
      now,
    });
    expect(result.kind).toBe('fallback');
  });

  it('normalizes an aborted request as a timeout', async () => {
    const result = await loadObservedWeather({
      fetcher: async (_input, init) =>
        await new Promise((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
      storage: new MemoryStorage(),
      now,
      timeoutMs: 1,
    });
    expect(result).toEqual(
      expect.objectContaining({ kind: 'fallback', reason: 'Weather request timed out.' }),
    );
  });

  it('removes corrupt cache and cooldown entries before fetching', async () => {
    const storage = new MemoryStorage();
    storage.setItem(weatherCachePolicy.cacheKey, '{broken');
    storage.setItem(weatherCachePolicy.cooldownKey, JSON.stringify({ retryAtIso: 'bad' }));
    const result = await loadObservedWeather({
      fetcher: () => Promise.resolve(response()),
      storage,
      now,
    });
    expect(result.kind).toBe('success');
  });
});
