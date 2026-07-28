import { createProviderAircraftFixture } from '../src/test/aircraft-fixture';

import {
  aircraftProviderUrl,
  fetchAircraftSnapshot,
  parseProviderRetry,
  readCooldownRetryAt,
} from './fetch-aircraft-snapshot';

const nowIso = '2026-07-28T19:00:00.000Z';
const now = () => new Date(nowIso);

function response(
  options: {
    ok?: boolean;
    status?: number;
    retryAfter?: string;
    reset?: string;
    payload?: unknown;
  } = {},
) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: new Headers({
      ...(options.retryAfter === undefined ? {} : { 'Retry-After': options.retryAfter }),
      ...(options.reset === undefined ? {} : { 'X-RateLimit-Reset': options.reset }),
    }),
    json: () => Promise.resolve(options.payload ?? createProviderAircraftFixture()),
  };
}

describe('aircraft snapshot workflow client', () => {
  it.each([
    ['120', null, '2026-07-28T19:02:00.000Z'],
    ['Tue, 28 Jul 2026 19:05:00 GMT', null, '2026-07-28T19:05:00.000Z'],
    [null, String(Date.parse('2026-07-28T19:05:00.000Z') / 1_000), '2026-07-28T19:05:00.000Z'],
    [null, String(Date.parse('2026-07-28T19:05:00.000Z')), '2026-07-28T19:05:00.000Z'],
    ['later', 'invalid', null],
    ['-1', null, null],
  ])('parses retry metadata %s / %s', (retryAfter, reset, expected) => {
    expect(parseProviderRetry(retryAfter, reset, Date.parse(nowIso))).toBe(expected);
  });

  it('makes one regional request and returns a normalized valid snapshot', async () => {
    let requestedInput: string | URL | null = null;
    let requestedInit: RequestInit | undefined;
    const fetcher = vi.fn((input: string | URL, init?: RequestInit) => {
      requestedInput = input;
      requestedInit = init;
      return Promise.resolve(response());
    });
    const snapshot = await fetchAircraftSnapshot({ fetcher, now });
    expect(snapshot.validation).toBe('valid');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(requestedInput).toBe(aircraftProviderUrl);
    expect(requestedInit?.headers).toMatchObject({ Accept: 'application/json' });
  });

  it('enforces an existing cooldown without calling the provider', async () => {
    const fetcher = vi.fn(() => Promise.resolve(response()));
    const snapshot = await fetchAircraftSnapshot({
      fetcher,
      now,
      cooldownState: {
        schemaVersion: 1,
        retryAt: '2026-07-28T19:10:00.000Z',
      },
    });
    expect(snapshot.validation).toBe('rate-limited');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('accepts only valid minimal cooldown state', () => {
    expect(readCooldownRetryAt({ schemaVersion: 1, retryAt: '2026-07-28T19:10:00.000Z' })).toBe(
      '2026-07-28T19:10:00.000Z',
    );
    expect(readCooldownRetryAt({ schemaVersion: 1, retryAt: 'invalid' })).toBeNull();
    expect(
      readCooldownRetryAt({ schemaVersion: 2, retryAt: '2026-07-28T19:10:00.000Z' }),
    ).toBeNull();
  });

  it('retains an exact valid retry time and never invents a malformed one', async () => {
    const valid = await fetchAircraftSnapshot({
      fetcher: () => Promise.resolve(response({ ok: false, status: 429, retryAfter: '120' })),
      now,
    });
    const malformed = await fetchAircraftSnapshot({
      fetcher: () => Promise.resolve(response({ ok: false, status: 429, retryAfter: 'later' })),
      now,
    });
    expect(valid.retryAt).toBe('2026-07-28T19:02:00.000Z');
    expect(malformed.retryAt).toBeNull();
    expect(malformed.reason).toMatch(/try again later/i);
  });

  it.each([
    ['HTTP', () => Promise.resolve(response({ ok: false, status: 503 }))],
    ['network', () => Promise.reject(new TypeError('network'))],
    ['invalid', () => Promise.resolve(response({ payload: { unexpected: true } }))],
  ])('writes an unavailable status envelope for %s failure', async (_label, fetcher) => {
    const snapshot = await fetchAircraftSnapshot({ fetcher, now });
    expect(snapshot.availability).toBe('unavailable');
    expect(snapshot.aircraft).toEqual([]);
  });

  it('normalizes an aborted provider request as unavailable without payload logging', async () => {
    const snapshot = await fetchAircraftSnapshot({
      fetcher: async (_input, init) =>
        await new Promise((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
      now,
      timeoutMs: 1,
    });
    expect(snapshot.reason).toBe('Provider request timed out.');
  });
});
