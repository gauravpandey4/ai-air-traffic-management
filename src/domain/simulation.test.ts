import { defaultRegion } from '../config/regions';
import { createOpenMeteoFixture, weatherNowIso } from '../test/weather-fixture';
import { aircraftSnapshotNowIso, createAvailableAircraftSnapshot } from '../test/aircraft-fixture';

import {
  advanceAircraft,
  createInitialSimulationState,
  deriveSimulationStatistics,
  getSelectedAircraft,
  getSimulationTimestamp,
  getVerticalTrend,
  simulationReducer,
} from './simulation';
import { parseOpenMeteoWeather } from './weather';
import { validateAircraftSnapshot } from './external-aircraft';

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
    expect(getSelectedAircraft(emergency)?.simulatedEmergency).toBe(true);
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

  it('loads, falls back from, and explicitly restores weather modes', () => {
    const initial = createInitialSimulationState('normal-traffic');
    expect(initial.weatherMode).toBe('Simulated');

    const checking = simulationReducer(initial, { type: 'weather-check-requested' });
    expect(checking.weatherMode).toBe('Checking');

    const observed = parseOpenMeteoWeather(createOpenMeteoFixture(), weatherNowIso, weatherNowIso);
    const loaded = simulationReducer(
      { ...checking, reviewDecisions: { recommendation: 'Confirmed in simulation' } },
      { type: 'weather-loaded', snapshot: observed },
    );
    expect(loaded.weatherMode).toBe('Observed');
    expect(loaded.weatherSnapshot.provider).toBe('Open-Meteo');
    expect(loaded.reviewDecisions).toEqual({});

    const retryAtIso = '2026-07-28T18:05:00.000Z';
    const fallback = simulationReducer(loaded, {
      type: 'weather-fallback',
      reason: 'Rate limited.',
      retryAtIso,
    });
    expect(fallback.weatherMode).toBe('Fallback');
    expect(fallback.weatherSnapshot.mode).toBe('Simulated');
    expect(fallback.weatherRetryAtIso).toBe(retryAtIso);

    const simulated = simulationReducer(fallback, { type: 'weather-simulation-selected' });
    expect(simulated.weatherMode).toBe('Simulated');
    expect(simulated.weatherRetryAtIso).toBeNull();

    const severe = simulationReducer(loaded, {
      type: 'scenario-selected',
      scenarioId: 'severe-weather',
    });
    expect(severe.weatherMode).toBe('Simulated');
    expect(severe.weatherSnapshot.risk.severity).toBe('Severe');
  });

  it('keeps simulation while checking and atomically replaces or restores aircraft data', () => {
    const initial = {
      ...createInitialSimulationState('normal-traffic'),
      isPlaying: true,
      elapsedSeconds: 12,
    };
    const checking = simulationReducer(initial, { type: 'external-check-requested' });
    expect(checking.aircraftMode).toBe('Checking');
    expect(checking.aircraft).toEqual(initial.aircraft);
    expect(
      simulationReducer(checking, { type: 'simulation-ticked', seconds: 1 }).aircraft,
    ).not.toEqual(checking.aircraft);
    const fallback = simulationReducer(checking, {
      type: 'external-fallback',
      reason: 'Snapshot is stale.',
      retryAtIso: null,
    });
    expect(fallback.aircraftMode).toBe('Simulation');
    expect(fallback.aircraft).toEqual(initial.aircraft);
    expect(fallback.elapsedSeconds).toBe(12);
    expect(fallback.isPlaying).toBe(true);

    const external = validateAircraftSnapshot(
      createAvailableAircraftSnapshot(),
      aircraftSnapshotNowIso,
    );
    const loaded = simulationReducer(checking, {
      type: 'external-loaded',
      snapshot: external.snapshot,
      aircraft: external.aircraft,
    });
    expect(loaded.aircraftMode).toBe('External Active');
    expect(loaded.isPlaying).toBe(false);
    expect(loaded.aircraft.every((aircraft) => aircraft.source.mode === 'External')).toBe(true);
    expect(loaded.aircraft.some((aircraft) => aircraft.callsign.startsWith('SIM-'))).toBe(false);

    const ticked = simulationReducer(loaded, { type: 'simulation-ticked', seconds: 60 });
    expect(ticked.aircraft).toEqual(loaded.aircraft);
    expect(simulationReducer(loaded, { type: 'playback-toggled' })).toBe(loaded);
    expect(simulationReducer(loaded, { type: 'playback-rate-selected', playbackRate: 4 })).toBe(
      loaded,
    );

    const selectedSimulation = simulationReducer(loaded, {
      type: 'external-simulation-selected',
    });
    expect(selectedSimulation.aircraftMode).toBe('Simulation');
    expect(
      simulationReducer(selectedSimulation, {
        type: 'external-loaded',
        snapshot: external.snapshot,
        aircraft: external.aircraft,
      }),
    ).toBe(selectedSimulation);
    expect(
      simulationReducer(selectedSimulation, {
        type: 'external-fallback',
        reason: 'Late result.',
        retryAtIso: null,
      }),
    ).toBe(selectedSimulation);

    const expired = simulationReducer(loaded, { type: 'external-snapshot-expired' });
    expect(expired.aircraftMode).toBe('Simulation');
    expect(expired.aircraftStatus).toMatch(/stale/i);
  });

  it('keeps weather independent and restores Simulation before refreshing external aircraft', () => {
    const observed = parseOpenMeteoWeather(createOpenMeteoFixture(), weatherNowIso, weatherNowIso);
    const withObservedWeather = simulationReducer(createInitialSimulationState(), {
      type: 'weather-loaded',
      snapshot: observed,
    });
    const external = validateAircraftSnapshot(
      createAvailableAircraftSnapshot(),
      aircraftSnapshotNowIso,
    );
    const checking = simulationReducer(withObservedWeather, {
      type: 'external-check-requested',
    });
    const loaded = simulationReducer(checking, {
      type: 'external-loaded',
      snapshot: external.snapshot,
      aircraft: external.aircraft,
    });
    expect(loaded.weatherMode).toBe('Observed');

    const refreshing = simulationReducer(loaded, { type: 'external-check-requested' });
    expect(refreshing.aircraftMode).toBe('Checking');
    expect(refreshing.aircraft.every((aircraft) => aircraft.source.mode === 'Simulated')).toBe(
      true,
    );
    expect(refreshing.weatherMode).toBe('Observed');

    const fallback = simulationReducer(refreshing, {
      type: 'external-fallback',
      reason: 'Provider unavailable.',
      retryAtIso: null,
    });
    expect(fallback.aircraftMode).toBe('Simulation');
    expect(fallback.weatherMode).toBe('Observed');
    expect(fallback.weatherSnapshot).toBe(observed);

    const selectedSimulation = simulationReducer(loaded, {
      type: 'external-simulation-selected',
    });
    expect(selectedSimulation.weatherSnapshot).toBe(observed);

    const expired = simulationReducer(loaded, { type: 'external-snapshot-expired' });
    expect(expired.weatherSnapshot).toBe(observed);
  });

  it('supports a valid empty external dataset without selecting an aircraft', () => {
    const initial = createInitialSimulationState();
    const snapshot = createAvailableAircraftSnapshot();
    snapshot.aircraft = [];
    snapshot.recordCount = 0;
    const checking = simulationReducer(initial, { type: 'external-check-requested' });
    const loaded = simulationReducer(checking, {
      type: 'external-loaded',
      snapshot,
      aircraft: [],
    });
    expect(loaded.aircraftMode).toBe('External Active');
    expect(loaded.selectedAircraftId).toBeNull();
    expect(getSelectedAircraft(loaded)).toBeNull();
  });

  it('derives statistics, timestamps, and vertical trend from current state only', () => {
    const emergency = createInitialSimulationState('emergency');
    const statistics = deriveSimulationStatistics(emergency.aircraft);
    expect(statistics.totalAircraft).toBe(emergency.aircraft.length);
    expect(statistics.emergencies.value).toBe(1);
    expect(statistics.averageAltitudeFt.value).not.toBeNull();
    expect(statistics.averageAltitudeFt.value ?? 0).toBeGreaterThan(0);
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
      }).lowFuelAircraft.value,
    ).toBeGreaterThan(0);
    expect(deriveSimulationStatistics([])).toEqual({
      totalAircraft: 0,
      airborneAircraft: { value: null, observationCount: 0, totalCount: 0 },
      arrivals: { value: null, observationCount: 0, totalCount: 0 },
      emergencies: { value: null, observationCount: 0, totalCount: 0 },
      lowFuelAircraft: { value: null, observationCount: 0, totalCount: 0 },
      averageAltitudeFt: { value: null, observationCount: 0, totalCount: 0 },
      averageGroundSpeedKt: { value: null, observationCount: 0, totalCount: 0 },
    });
  });

  it('discloses valid denominators for partial and unsupported datasets', () => {
    const state = createInitialSimulationState();
    const first = state.aircraft[0];
    const second = state.aircraft[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first === undefined || second === undefined) return;

    const partial = deriveSimulationStatistics([
      first,
      {
        ...second,
        altitudeFt: Number.NaN,
        groundSpeedKt: Number.NaN,
        phase: 'Unavailable',
        simulatedFuelMinutes: null,
        source: {
          mode: 'External',
          provider: 'adsb.fi',
          observedAtIso: '2026-01-01T12:00:00.000Z',
          fetchedAtIso: '2026-01-01T12:00:00.000Z',
          freshness: 'Fresh',
          limitation: 'Test fixture.',
        },
      },
    ]);

    expect(partial.averageAltitudeFt).toEqual({
      value: first.altitudeFt,
      observationCount: 1,
      totalCount: 2,
    });
    expect(partial.averageGroundSpeedKt).toEqual({
      value: first.groundSpeedKt,
      observationCount: 1,
      totalCount: 2,
    });
    expect(partial.arrivals.observationCount).toBe(1);
    expect(partial.emergencies.observationCount).toBe(1);
    expect(partial.lowFuelAircraft.observationCount).toBe(1);
  });
});
