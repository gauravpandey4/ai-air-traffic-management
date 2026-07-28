import { aircraftSnapshotNowIso, createAvailableAircraftSnapshot } from '../test/aircraft-fixture';

import { loadAircraftSnapshot } from './aircraft-snapshot-client';
import { createUnavailableAircraftSnapshot } from './external-aircraft';

function response(options: { ok?: boolean; status?: number; payload?: unknown } = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: () => Promise.resolve(options.payload ?? createAvailableAircraftSnapshot()),
  };
}

describe('same-origin aircraft snapshot client', () => {
  it('loads a fresh snapshot with no-store semantics', async () => {
    const fetcher = vi.fn(() => Promise.resolve(response()));
    const result = await loadAircraftSnapshot({
      fetcher,
      now: () => new Date(aircraftSnapshotNowIso),
      url: '/test-snapshot.json',
    });
    expect(result.kind).toBe('success');
    expect(fetcher).toHaveBeenCalledWith(
      '/test-snapshot.json',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('preserves valid rate-limit retry metadata from an unavailable envelope', async () => {
    const payload = createUnavailableAircraftSnapshot({
      generatedAtIso: aircraftSnapshotNowIso,
      validation: 'rate-limited',
      reason: 'Rate limited.',
      retryAt: '2026-07-28T19:15:00.000Z',
    });
    const result = await loadAircraftSnapshot({
      fetcher: () => Promise.resolve(response({ payload })),
    });
    expect(result).toEqual(
      expect.objectContaining({
        kind: 'fallback',
        reason: 'Rate limited.',
        retryAtIso: '2026-07-28T19:15:00.000Z',
      }),
    );
  });

  it.each([
    ['HTTP', () => Promise.resolve(response({ ok: false, status: 503 }))],
    ['network', () => Promise.reject(new TypeError('network'))],
    ['invalid', () => Promise.resolve(response({ payload: { unexpected: true } }))],
    [
      'stale',
      () => {
        const snapshot = createAvailableAircraftSnapshot();
        snapshot.fetchedAt = '2026-07-28T18:00:00.000Z';
        return Promise.resolve(response({ payload: snapshot }));
      },
    ],
  ])('falls back for %s failure', async (_label, fetcher) => {
    const result = await loadAircraftSnapshot({
      fetcher,
      now: () => new Date(aircraftSnapshotNowIso),
    });
    expect(result.kind).toBe('fallback');
  });

  it('distinguishes invalid observation metadata from a network failure', async () => {
    const snapshot = createAvailableAircraftSnapshot();
    const first = snapshot.aircraft[0];
    expect(first).toBeDefined();
    if (first === undefined) return;
    first.observedAtIso = '2026-07-28T19:00:01.000Z';
    const result = await loadAircraftSnapshot({
      fetcher: () => Promise.resolve(response({ payload: snapshot })),
      now: () => new Date(aircraftSnapshotNowIso),
    });
    expect(result).toEqual(
      expect.objectContaining({ kind: 'fallback', reason: 'Invalid snapshot response.' }),
    );
  });
});
