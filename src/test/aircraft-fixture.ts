import { defaultRegion } from '../config/regions';
import type { AircraftSnapshot } from '../domain/types';

export const aircraftSnapshotNowIso = '2026-07-28T19:00:00.000Z';

export function createProviderAircraftFixture() {
  return {
    ac: [
      {
        hex: '800001',
        flight: 'IGO123 ',
        lat: 26.86,
        lon: 80.95,
        alt_baro: 12_000,
        gs: 310.5,
        track: 92.2,
        baro_rate: -500,
        seen_pos: 3,
        emergency: 'none',
      },
      {
        hex: '~800002',
        lat: 26.84,
        lon: 80.94,
        alt_baro: 'ground',
        gs: 8,
        track: 270,
        seen_pos: 5,
      },
    ],
    now: Date.parse(aircraftSnapshotNowIso),
    total: 2,
    msg: 'No error',
  };
}

export function createAvailableAircraftSnapshot(): AircraftSnapshot {
  return {
    schemaVersion: 1,
    availability: 'available',
    provider: 'adsb.fi',
    endpointClass: 'regional-v3',
    generatedAt: aircraftSnapshotNowIso,
    fetchedAt: aircraftSnapshotNowIso,
    freshForMinutes: defaultRegion.externalFreshnessMinutes,
    validation: 'valid',
    recordCount: 2,
    retryAt: null,
    reason: 'Valid fresh regional aircraft snapshot.',
    aircraft: [
      {
        id: 'external-800001',
        callsign: 'IGO123',
        latitude: 26.86,
        longitude: 80.95,
        altitudeFt: 12_000,
        groundSpeedKt: 310.5,
        headingDeg: 92.2,
        verticalRateFpm: -500,
        observedAtIso: '2026-07-28T18:59:57.000Z',
        status: 'Observed airborne track',
      },
      {
        id: 'external-800002',
        callsign: 'HEX-800002',
        latitude: 26.84,
        longitude: 80.94,
        altitudeFt: 0,
        groundSpeedKt: 8,
        headingDeg: 270,
        verticalRateFpm: 0,
        observedAtIso: '2026-07-28T18:59:55.000Z',
        status: 'Observed on ground',
      },
    ],
  };
}
