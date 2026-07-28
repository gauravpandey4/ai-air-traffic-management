import { defaultRegion } from '../config/regions';

import {
  advanceAircraft,
  createInitialSimulationState,
  deriveSimulationStatistics,
  getSelectedAircraft,
  getSimulationTimestamp,
  getVerticalTrend,
  simulationReducer,
} from './simulation';

describe('simulation movement and reducer', () => {
  it('moves north/east from heading and wraps configured bounds', () => {
    const state = createInitialSimulationState();
    const base = state.aircraft[0];
    expect(base).toBeDefined();
    if (base === undefined) return;

    const centered = {
      ...base,
      latitude: defaultRegion.center.latitude,
      longitude: defaultRegion.center.longitude,
    };
    const north = advanceAircraft({ ...centered, headingDeg: 0 }, 60);
    const east = advanceAircraft({ ...centered, headingDeg: 90 }, 60);
    expect(north.latitude).toBeGreaterThan(centered.latitude);
    expect(east.longitude).toBeGreaterThan(centered.longitude);

    const wrapped = advanceAircraft(
      { ...base, latitude: defaultRegion.bounds.north - 0.0001, headingDeg: 0 },
      3600,
    );
    expect(wrapped.latitude).toBeGreaterThanOrEqual(defaultRegion.bounds.south);
    expect(wrapped.latitude).toBeLessThan(defaultRegion.bounds.north);
  });

  it('ticks, selects, changes rate, toggles playback, and resets identically', () => {
    const initial = createInitialSimulationState('normal-traffic');
    const second = initial.aircraft[1];
    expect(second).toBeDefined();
    if (second === undefined) return;

    const playing = simulationReducer(initial, { type: 'playback-toggled' });
    const faster = simulationReducer(playing, {
      type: 'playback-rate-selected',
      playbackRate: 4,
    });
    const ticked = simulationReducer(faster, { type: 'simulation-ticked', seconds: 4 });
    const selected = simulationReducer(ticked, {
      type: 'aircraft-selected',
      aircraftId: second.id,
    });
    expect(selected.elapsedSeconds).toBe(4);
    expect(selected.selectedAircraftId).toBe(second.id);
    expect(selected.aircraft).not.toEqual(initial.aircraft);

    const reset = simulationReducer(selected, { type: 'simulation-reset' });
    expect(reset.aircraft).toEqual(initial.aircraft);
    expect(reset.elapsedSeconds).toBe(0);
    expect(reset.playbackRate).toBe(4);
  });

  it('changes scenarios and ignores unknown aircraft selections', () => {
    const initial = createInitialSimulationState();
    const unchanged = simulationReducer(initial, {
      type: 'aircraft-selected',
      aircraftId: 'missing',
    });
    expect(unchanged).toBe(initial);

    const emergency = simulationReducer(initial, {
      type: 'scenario-selected',
      scenarioId: 'emergency',
    });
    expect(emergency.scenarioId).toBe('emergency');
    expect(getSelectedAircraft(emergency).simulatedEmergency).toBe(true);
  });

  it('switches map modes and restores the schematic on failure', () => {
    const initial = createInitialSimulationState();
    const connected = simulationReducer(initial, {
      type: 'map-mode-selected',
      mapMode: 'connected',
    });
    expect(connected.mapMode).toBe('connected');

    const fallback = simulationReducer(connected, {
      type: 'map-unavailable',
      reason: 'tiles unavailable',
    });
    expect(fallback.mapMode).toBe('schematic');
    expect(fallback.mapStatus).toMatch(/tiles unavailable/i);
  });

  it('derives statistics, timestamps, and vertical trend from current state only', () => {
    const emergency = createInitialSimulationState('emergency');
    const statistics = deriveSimulationStatistics(emergency.aircraft);
    expect(statistics.totalAircraft).toBe(emergency.aircraft.length);
    expect(statistics.emergencies).toBe(1);
    expect(statistics.averageAltitudeFt).toBeGreaterThan(0);
    expect(getSimulationTimestamp(emergency)).toBe('2026-01-01T12:00:00.000Z');

    const aircraft = emergency.aircraft[0];
    expect(aircraft).toBeDefined();
    if (aircraft === undefined) return;
    expect(getVerticalTrend({ ...aircraft, verticalRateFpm: 500 })).toMatch(/climbing/i);
    expect(getVerticalTrend({ ...aircraft, verticalRateFpm: -500 })).toMatch(/descending/i);
    expect(getVerticalTrend({ ...aircraft, verticalRateFpm: 0 })).toMatch(/level/i);
    expect(
      deriveSimulationStatistics(emergency.aircraft, {
        [aircraft.id]: {
          aircraftId: aircraft.id,
          state: 'Critical',
          remainingFuelKg: 100,
          enduranceMinutes: 10,
          burnKgPerHour: 1_800,
          explanation: {
            facts: [],
            source: 'Test',
            rule: 'Test',
            result: 'Critical',
            factors: [],
            limitation: 'Test',
            humanAction: 'Test',
          },
        },
      }).lowFuelAircraft,
    ).toBeGreaterThan(0);
    expect(deriveSimulationStatistics([])).toEqual({
      totalAircraft: 0,
      airborneAircraft: 0,
      arrivals: 0,
      emergencies: 0,
      lowFuelAircraft: 0,
      averageAltitudeFt: 0,
      averageGroundSpeedKt: 0,
    });
  });
});
