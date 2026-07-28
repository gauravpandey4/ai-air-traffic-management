import {
  aircraftSnapshotNowIso,
  createAvailableAircraftSnapshot,
  createProviderAircraftFixture,
} from '../test/aircraft-fixture';

import {
  createUnavailableAircraftSnapshot,
  normalizeProviderPayload,
  readUnavailableAircraftSnapshot,
  validateAircraftSnapshot,
} from './external-aircraft';

function providerAircraftAt(
  payload: ReturnType<typeof createProviderAircraftFixture>,
  index: number,
) {
  const aircraft = payload.ac[index];
  if (aircraft === undefined)
    throw new Error(`Missing provider fixture aircraft ${String(index)}.`);
  return aircraft;
}

function snapshotAircraftAt(
  snapshot: ReturnType<typeof createAvailableAircraftSnapshot>,
  index: number,
) {
  const aircraft = snapshot.aircraft[index];
  if (aircraft === undefined)
    throw new Error(`Missing snapshot fixture aircraft ${String(index)}.`);
  return aircraft;
}

describe('external aircraft normalization', () => {
  it('normalizes the provider response, fallback callsign, ground altitude, and provenance', () => {
    const snapshot = normalizeProviderPayload(
      createProviderAircraftFixture(),
      aircraftSnapshotNowIso,
    );
    expect(snapshot.availability).toBe('available');
    expect(snapshot.recordCount).toBe(2);
    expect(snapshot.aircraft[0]).toMatchObject({
      id: 'external-800001',
      callsign: 'IGO123',
      altitudeFt: 12_000,
    });
    expect(snapshot.aircraft[1]).toMatchObject({
      id: 'external-800002',
      callsign: 'HEX-800002',
      altitudeFt: 0,
    });
  });

  it('accepts provider epoch seconds and a valid empty response', () => {
    const payload = createProviderAircraftFixture();
    payload.now = Date.parse(aircraftSnapshotNowIso) / 1_000;
    payload.ac = [];
    payload.total = 0;
    const snapshot = normalizeProviderPayload(payload, aircraftSnapshotNowIso);
    expect(snapshot.recordCount).toBe(0);
    expect(snapshot.reason).toMatch(/no aircraft/i);
  });

  it.each([
    [
      'count mismatch',
      (payload: ReturnType<typeof createProviderAircraftFixture>) => (payload.total = 1),
    ],
    [
      'bad identifier',
      (payload: ReturnType<typeof createProviderAircraftFixture>) =>
        (providerAircraftAt(payload, 0).hex = 'not-hex'),
    ],
    [
      'range',
      (payload: ReturnType<typeof createProviderAircraftFixture>) =>
        (providerAircraftAt(payload, 0).gs = 900),
    ],
    [
      'coordinate',
      (payload: ReturnType<typeof createProviderAircraftFixture>) =>
        (providerAircraftAt(payload, 0).lat = 30),
    ],
    [
      'position age',
      (payload: ReturnType<typeof createProviderAircraftFixture>) =>
        (providerAircraftAt(payload, 0).seen_pos = 121),
    ],
    [
      'provider time',
      (payload: ReturnType<typeof createProviderAircraftFixture>) =>
        (payload.now = Date.parse(aircraftSnapshotNowIso) - 6 * 60_000),
    ],
    [
      'duplicate',
      (payload: ReturnType<typeof createProviderAircraftFixture>) =>
        (providerAircraftAt(payload, 1).hex = providerAircraftAt(payload, 0).hex),
    ],
  ])('rejects invalid provider %s', (_label, mutate) => {
    const payload = createProviderAircraftFixture();
    mutate(payload);
    expect(() => normalizeProviderPayload(payload, aircraftSnapshotNowIso)).toThrow();
  });
});

describe('published aircraft snapshot validation', () => {
  it('accepts a fresh snapshot and maps unsupported values to unavailable', () => {
    const result = validateAircraftSnapshot(
      createAvailableAircraftSnapshot(),
      '2026-07-28T19:29:59.000Z',
    );
    expect(result.aircraft).toHaveLength(2);
    expect(result.aircraft[0]).toMatchObject({
      phase: 'Unavailable',
      aircraftCategory: 'Unavailable',
      simulatedFuelMinutes: null,
      initialFuelKg: null,
      source: { mode: 'External', provider: 'adsb.fi' },
    });
  });

  it('accepts a valid fresh empty snapshot', () => {
    const snapshot = createAvailableAircraftSnapshot();
    snapshot.recordCount = 0;
    snapshot.aircraft = [];
    expect(validateAircraftSnapshot(snapshot, aircraftSnapshotNowIso).aircraft).toEqual([]);
  });

  it.each([
    [
      'stale',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) =>
        (snapshot.fetchedAt = '2026-07-28T18:29:59.000Z'),
    ],
    [
      'future',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) =>
        (snapshot.fetchedAt = '2026-07-28T19:02:01.000Z'),
    ],
    [
      'missing timestamp',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) => (snapshot.fetchedAt = null),
    ],
    [
      'record mismatch',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) => (snapshot.recordCount = 1),
    ],
    [
      'inconsistent generated timestamp',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) =>
        (snapshot.generatedAt = '2026-07-28T18:54:59.000Z'),
    ],
    [
      'stale observation',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) =>
        (snapshotAircraftAt(snapshot, 0).observedAtIso = '2026-07-28T18:57:59.000Z'),
    ],
    [
      'future observation',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) =>
        (snapshotAircraftAt(snapshot, 0).observedAtIso = '2026-07-28T19:00:01.000Z'),
    ],
    [
      'duplicate id',
      (snapshot: ReturnType<typeof createAvailableAircraftSnapshot>) =>
        (snapshotAircraftAt(snapshot, 1).id = snapshotAircraftAt(snapshot, 0).id),
    ],
  ])('rejects %s snapshot data', (_label, mutate) => {
    const snapshot = createAvailableAircraftSnapshot();
    mutate(snapshot);
    expect(() => validateAircraftSnapshot(snapshot, aircraftSnapshotNowIso)).toThrow();
  });

  it('reads a valid unavailable envelope without accepting malformed state', () => {
    const unavailable = createUnavailableAircraftSnapshot({
      generatedAtIso: aircraftSnapshotNowIso,
      validation: 'rate-limited',
      reason: 'Rate limited.',
      retryAt: '2026-07-28T19:15:00.000Z',
    });
    expect(readUnavailableAircraftSnapshot(unavailable)?.retryAt).toBe('2026-07-28T19:15:00.000Z');
    expect(readUnavailableAircraftSnapshot({ unexpected: true })).toBeNull();
  });
});
