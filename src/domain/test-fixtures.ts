import type { Aircraft } from './types';

export function createTestAircraft(overrides: Partial<Aircraft> = {}): Aircraft {
  return {
    id: 'aircraft-a',
    callsign: 'SIM-TEST1',
    latitude: 26.8467,
    longitude: 80.9462,
    altitudeFt: 10_000,
    groundSpeedKt: 360,
    headingDeg: 90,
    verticalRateFpm: 0,
    phase: 'Arrival',
    severity: 'Normal',
    simulatedFuelMinutes: 60,
    aircraftCategory: 'Medium',
    initialFuelKg: 3_000,
    fuelBurnKgPerHour: 1_800,
    elapsedFlightMinutes: 40,
    simulatedEmergency: false,
    status: 'Level flight',
    source: {
      mode: 'Simulated',
      generator: 'FutureATC deterministic engine',
      generatedAtIso: '2026-01-01T00:00:00.000Z',
      freshness: 'Fresh',
      limitation: 'Synthetic test state.',
    },
    ...overrides,
  };
}
