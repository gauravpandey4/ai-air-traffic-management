import { assessFuel } from './fuel';
import {
  comparePriority,
  orderLandingPriority,
  type PriorityCandidate,
  type PriorityWeather,
} from './priority';
import { createTestAircraft } from './test-fixtures';
import type { AircraftSeverity, FuelState } from './types';

function candidate(
  id: string,
  options: {
    emergency?: boolean;
    fuel?: FuelState;
    conflict?: AircraftSeverity;
    weather?: PriorityWeather;
    eta?: number;
    index?: number;
  } = {},
): PriorityCandidate {
  const aircraft = createTestAircraft({
    id,
    callsign: `SIM-${id.toUpperCase()}`,
    simulatedEmergency: options.emergency ?? false,
  });
  return {
    aircraft,
    fuel: { ...assessFuel(aircraft, 0), state: options.fuel ?? 'Normal' },
    conflictSeverity: options.conflict ?? 'Normal',
    weather: options.weather ?? 'Normal',
    estimatedArrivalMinutes: options.eta ?? 20,
    originalIndex: options.index ?? 0,
  };
}

describe('stable emergency landing priority', () => {
  it('orders every factor lexicographically', () => {
    const ordered = orderLandingPriority([
      candidate('routine', { index: 6 }),
      candidate('low', { fuel: 'Low', index: 5 }),
      candidate('weather', { weather: 'Severe', index: 4 }),
      candidate('conflict', { conflict: 'Critical', index: 3 }),
      candidate('critical-fuel', { fuel: 'Critical', index: 2 }),
      candidate('emergency', { emergency: true, index: 1 }),
    ]);
    expect(ordered.map((entry) => entry.aircraftId)).toEqual([
      'emergency',
      'critical-fuel',
      'conflict',
      'weather',
      'low',
      'routine',
    ]);
  });

  it('uses ETA and then original order for stable ties', () => {
    const later = candidate('later', { eta: 12, index: 0 });
    const earlier = candidate('earlier', { eta: 5, index: 1 });
    expect(comparePriority(later, earlier)).toBeGreaterThan(0);

    const stable = orderLandingPriority([
      candidate('first', { eta: 5, index: 0 }),
      candidate('second', { eta: 5, index: 1 }),
    ]);
    expect(stable.map((entry) => entry.aircraftId)).toEqual(['first', 'second']);
    expect(stable[0]?.reason).toMatch(/estimated arrival/i);
    const stableCandidate = candidate('same', { eta: 5, index: 0 });
    expect(comparePriority(stableCandidate, stableCandidate)).toBe(0);
  });
});
