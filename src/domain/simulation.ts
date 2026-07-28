import { defaultRegion } from '../config/regions';

import { createScenarioAircraft, scenarios } from './scenarios';
import type {
  Aircraft,
  AircraftSnapshot,
  FuelAssessment,
  PlaybackRate,
  ScenarioId,
  SimulationBounds,
  SimulationState,
  SimulationStatistics,
  WeatherSnapshot,
} from './types';
import { createSimulatedWeather } from './weather';

export type SimulationAction =
  | { type: 'scenario-selected'; scenarioId: ScenarioId }
  | { type: 'playback-toggled' }
  | { type: 'playback-rate-selected'; playbackRate: PlaybackRate }
  | { type: 'simulation-reset' }
  | { type: 'simulation-ticked'; seconds: number }
  | { type: 'aircraft-selected'; aircraftId: string }
  | { type: 'alert-acknowledged'; alertId: string }
  | {
      type: 'recommendation-reviewed';
      recommendationId: string;
      decision: 'Confirmed in simulation' | 'Rejected in simulation';
    }
  | { type: 'selected-emergency-toggled' }
  | { type: 'external-check-requested' }
  | { type: 'external-loaded'; snapshot: AircraftSnapshot; aircraft: Aircraft[] }
  | { type: 'external-fallback'; reason: string; retryAtIso: string | null }
  | { type: 'external-simulation-selected'; reason?: string }
  | { type: 'external-snapshot-expired' }
  | { type: 'weather-check-requested' }
  | { type: 'weather-loaded'; snapshot: WeatherSnapshot }
  | { type: 'weather-fallback'; reason: string; retryAtIso: string | null }
  | { type: 'weather-simulation-selected' }
  | { type: 'map-mode-selected'; mapMode: 'schematic' | 'connected' }
  | { type: 'map-unavailable'; reason: string };

function wrap(value: number, minimum: number, maximum: number): number {
  const width = maximum - minimum;
  return ((((value - minimum) % width) + width) % width) + minimum;
}

export function advanceAircraft(
  aircraft: Aircraft,
  seconds: number,
  bounds: SimulationBounds = defaultRegion.bounds,
): Aircraft {
  const distanceNm = aircraft.groundSpeedKt * (seconds / 3600);
  const headingRadians = (aircraft.headingDeg * Math.PI) / 180;
  const latitudeDelta = (Math.cos(headingRadians) * distanceNm) / 60;
  const longitudeScale = Math.max(Math.cos((aircraft.latitude * Math.PI) / 180), 0.2);
  const longitudeDelta = (Math.sin(headingRadians) * distanceNm) / (60 * longitudeScale);

  return {
    ...aircraft,
    latitude: wrap(aircraft.latitude + latitudeDelta, bounds.south, bounds.north),
    longitude: wrap(aircraft.longitude + longitudeDelta, bounds.west, bounds.east),
    altitudeFt: Math.round(
      Math.min(
        45_000,
        Math.max(0, aircraft.altitudeFt + aircraft.verticalRateFpm * (seconds / 60)),
      ),
    ),
  };
}

export function createInitialSimulationState(
  scenarioId: ScenarioId = 'normal-traffic',
): SimulationState {
  const aircraft = createScenarioAircraft(scenarioId);
  const selectedAircraft = aircraft[0];
  if (selectedAircraft === undefined) {
    throw new Error(`Scenario ${scenarioId} did not generate an aircraft.`);
  }

  const weatherSnapshot = createSimulatedWeather(scenarioId);
  return {
    scenarioId,
    aircraft,
    selectedAircraftId: selectedAircraft.id,
    aircraftMode: 'Simulation',
    aircraftStatus: 'Deterministic simulated aircraft are active.',
    externalSnapshot: null,
    aircraftRetryAtIso: null,
    isPlaying: false,
    playbackRate: 1,
    elapsedSeconds: 0,
    mapMode: 'schematic',
    mapStatus: 'Local schematic active — no network or map tiles required.',
    acknowledgedAlertIds: [],
    reviewDecisions: {},
    weatherMode: 'Simulated',
    weatherSnapshot,
    weatherStatus: 'Deterministic simulated weather is active.',
    weatherRetryAtIso: null,
  };
}

function createSimulationAircraftState(
  state: SimulationState,
  aircraftStatus: string,
  aircraftRetryAtIso: string | null,
): SimulationState {
  const simulation = createInitialSimulationState(state.scenarioId);
  return {
    ...simulation,
    playbackRate: state.playbackRate,
    mapMode: state.mapMode,
    mapStatus: state.mapStatus,
    aircraftStatus,
    aircraftRetryAtIso,
    weatherMode: state.weatherMode,
    weatherSnapshot: state.weatherSnapshot,
    weatherStatus: state.weatherStatus,
    weatherRetryAtIso: state.weatherRetryAtIso,
  };
}

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction,
): SimulationState {
  switch (action.type) {
    case 'scenario-selected':
      return createInitialSimulationState(action.scenarioId);
    case 'playback-toggled':
      return state.aircraftMode === 'Simulation'
        ? { ...state, isPlaying: !state.isPlaying }
        : state;
    case 'playback-rate-selected':
      return state.aircraftMode === 'Simulation'
        ? { ...state, playbackRate: action.playbackRate }
        : state;
    case 'simulation-reset': {
      const reset = createInitialSimulationState(state.scenarioId);
      return {
        ...reset,
        playbackRate: state.playbackRate,
        mapMode: state.mapMode,
        mapStatus: state.mapStatus,
      };
    }
    case 'simulation-ticked':
      return {
        ...state,
        elapsedSeconds: state.elapsedSeconds + action.seconds,
        aircraft:
          state.aircraftMode !== 'External Active'
            ? state.aircraft.map((aircraft) =>
                advanceAircraft(aircraft, action.seconds, defaultRegion.bounds),
              )
            : state.aircraft,
      };
    case 'aircraft-selected':
      return state.aircraft.some((aircraft) => aircraft.id === action.aircraftId)
        ? { ...state, selectedAircraftId: action.aircraftId }
        : state;
    case 'alert-acknowledged':
      return state.acknowledgedAlertIds.includes(action.alertId)
        ? state
        : {
            ...state,
            acknowledgedAlertIds: [...state.acknowledgedAlertIds, action.alertId],
          };
    case 'recommendation-reviewed':
      return {
        ...state,
        reviewDecisions: {
          ...state.reviewDecisions,
          [action.recommendationId]: action.decision,
        },
      };
    case 'selected-emergency-toggled':
      if (state.selectedAircraftId === null || state.aircraftMode !== 'Simulation') return state;
      return {
        ...state,
        aircraft: state.aircraft.map((aircraft) =>
          aircraft.id === state.selectedAircraftId
            ? {
                ...aircraft,
                simulatedEmergency: !aircraft.simulatedEmergency,
                severity: aircraft.simulatedEmergency
                  ? (aircraft.simulatedFuelMinutes ?? Number.POSITIVE_INFINITY) < 15
                    ? 'Critical'
                    : (aircraft.simulatedFuelMinutes ?? Number.POSITIVE_INFINITY) < 30
                      ? 'Warning'
                      : 'Normal'
                  : 'Critical',
                status: aircraft.simulatedEmergency
                  ? 'Simulated emergency cleared'
                  : 'Declared simulated emergency',
              }
            : aircraft,
        ),
        reviewDecisions: {},
      };
    case 'external-check-requested': {
      const checkingStatus =
        'Checking the same-origin validated aircraft snapshot; simulation remains active.';
      if (state.aircraft.some((aircraft) => aircraft.source.mode === 'External')) {
        return {
          ...createSimulationAircraftState(state, checkingStatus, null),
          aircraftMode: 'Checking',
        };
      }
      return {
        ...state,
        aircraftMode: 'Checking',
        aircraftStatus: checkingStatus,
        aircraftRetryAtIso: null,
      };
    }
    case 'external-loaded':
      if (state.aircraftMode !== 'Checking') return state;
      return {
        ...state,
        aircraftMode: 'External Active',
        aircraft: action.aircraft,
        selectedAircraftId: action.aircraft[0]?.id ?? null,
        externalSnapshot: action.snapshot,
        aircraftStatus:
          action.aircraft.length === 0
            ? 'Near-live aircraft snapshot active; the valid regional snapshot is empty.'
            : 'Near-live aircraft snapshot active.',
        aircraftRetryAtIso: null,
        isPlaying: false,
        elapsedSeconds: 0,
        acknowledgedAlertIds: [],
        reviewDecisions: {},
      };
    case 'external-fallback': {
      if (state.aircraftMode !== 'Checking') return state;
      const status = `${action.reason} Simulation restored.`;
      if (state.aircraft.every((aircraft) => aircraft.source.mode === 'Simulated')) {
        return {
          ...state,
          aircraftMode: 'Simulation',
          aircraftStatus: status,
          externalSnapshot: null,
          aircraftRetryAtIso: action.retryAtIso,
        };
      }
      return {
        ...createSimulationAircraftState(state, status, action.retryAtIso),
      };
    }
    case 'external-simulation-selected': {
      return {
        ...createSimulationAircraftState(
          state,
          action.reason ?? 'Deterministic simulated aircraft are active by user selection.',
          null,
        ),
      };
    }
    case 'external-snapshot-expired': {
      return {
        ...createSimulationAircraftState(state, 'Snapshot is stale. Simulation restored.', null),
      };
    }
    case 'weather-check-requested':
      return {
        ...state,
        weatherMode: 'Checking',
        weatherStatus: 'Checking Open-Meteo for validated current conditions…',
      };
    case 'weather-loaded':
      return {
        ...state,
        weatherMode: action.snapshot.mode,
        weatherSnapshot: action.snapshot,
        weatherStatus:
          action.snapshot.mode === 'Cached'
            ? 'Validated cached Open-Meteo weather is active.'
            : 'Validated Open-Meteo weather is active.',
        weatherRetryAtIso: null,
        reviewDecisions: {},
      };
    case 'weather-fallback':
      return {
        ...state,
        weatherMode: 'Fallback',
        weatherSnapshot: createSimulatedWeather(state.scenarioId),
        weatherStatus: `${action.reason} Simulated weather restored.`,
        weatherRetryAtIso: action.retryAtIso,
        reviewDecisions: {},
      };
    case 'weather-simulation-selected':
      return {
        ...state,
        weatherMode: 'Simulated',
        weatherSnapshot: createSimulatedWeather(state.scenarioId),
        weatherStatus: 'Deterministic simulated weather is active.',
        weatherRetryAtIso: null,
        reviewDecisions: {},
      };
    case 'map-mode-selected':
      return {
        ...state,
        mapMode: action.mapMode,
        mapStatus:
          action.mapMode === 'connected'
            ? 'Connected map requested — OpenStreetMap tiles may be used.'
            : 'Local schematic active — no network or map tiles required.',
      };
    case 'map-unavailable':
      return {
        ...state,
        mapMode: 'schematic',
        mapStatus: `Local schematic restored: ${action.reason}`,
      };
  }
}

export function getSelectedAircraft(state: SimulationState): Aircraft | null {
  if (state.selectedAircraftId === null) return null;
  const aircraft = state.aircraft.find((item) => item.id === state.selectedAircraftId);
  return aircraft ?? null;
}

export function deriveSimulationStatistics(
  aircraft: readonly Aircraft[],
  fuelByAircraftId?: Readonly<Record<string, FuelAssessment>>,
): SimulationStatistics {
  const totalAircraft = aircraft.length;
  if (totalAircraft === 0) {
    return {
      totalAircraft: 0,
      airborneAircraft: 0,
      arrivals: 0,
      emergencies: 0,
      lowFuelAircraft: 0,
      averageAltitudeFt: 0,
      averageGroundSpeedKt: 0,
    };
  }

  const totals = aircraft.reduce(
    (result, item) => ({
      altitudeFt: result.altitudeFt + item.altitudeFt,
      groundSpeedKt: result.groundSpeedKt + item.groundSpeedKt,
    }),
    { altitudeFt: 0, groundSpeedKt: 0 },
  );

  return {
    totalAircraft,
    airborneAircraft: aircraft.filter((item) => item.altitudeFt > 0).length,
    arrivals: aircraft.filter((item) => item.phase === 'Arrival').length,
    emergencies: aircraft.filter((item) => item.simulatedEmergency).length,
    lowFuelAircraft: aircraft.filter((item) => {
      const state = fuelByAircraftId?.[item.id]?.state;
      return state === undefined
        ? item.simulatedFuelMinutes !== null && item.simulatedFuelMinutes < 30
        : state === 'Low' || state === 'Critical';
    }).length,
    averageAltitudeFt: Math.round(totals.altitudeFt / totalAircraft),
    averageGroundSpeedKt: Math.round(totals.groundSpeedKt / totalAircraft),
  };
}

export function getSimulationTimestamp(state: SimulationState): string {
  const epoch = Date.parse(scenarios[state.scenarioId].epochIso);
  return new Date(epoch + state.elapsedSeconds * 1000).toISOString();
}

export function getVerticalTrend(aircraft: Aircraft): string {
  if (aircraft.verticalRateFpm > 0) {
    return `Climbing +${aircraft.verticalRateFpm.toLocaleString()} ft/min`;
  }
  if (aircraft.verticalRateFpm < 0) {
    return `Descending ${aircraft.verticalRateFpm.toLocaleString()} ft/min`;
  }
  return 'Level flight';
}
