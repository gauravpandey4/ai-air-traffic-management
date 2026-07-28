import { defaultRegion } from '../config/regions';

import { createScenarioAircraft, scenarios } from './scenarios';
import type {
  Aircraft,
  FuelAssessment,
  PlaybackRate,
  ScenarioId,
  SimulationBounds,
  SimulationState,
  SimulationStatistics,
} from './types';

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

  return {
    scenarioId,
    aircraft,
    selectedAircraftId: selectedAircraft.id,
    isPlaying: false,
    playbackRate: 1,
    elapsedSeconds: 0,
    mapMode: 'schematic',
    mapStatus: 'Local schematic active — no network or map tiles required.',
    acknowledgedAlertIds: [],
    reviewDecisions: {},
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
      return { ...state, isPlaying: !state.isPlaying };
    case 'playback-rate-selected':
      return { ...state, playbackRate: action.playbackRate };
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
        aircraft: state.aircraft.map((aircraft) =>
          advanceAircraft(aircraft, action.seconds, defaultRegion.bounds),
        ),
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
      return {
        ...state,
        aircraft: state.aircraft.map((aircraft) =>
          aircraft.id === state.selectedAircraftId
            ? {
                ...aircraft,
                simulatedEmergency: !aircraft.simulatedEmergency,
                severity: aircraft.simulatedEmergency
                  ? aircraft.simulatedFuelMinutes < 15
                    ? 'Critical'
                    : aircraft.simulatedFuelMinutes < 30
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

export function getSelectedAircraft(state: SimulationState): Aircraft {
  const aircraft = state.aircraft.find((item) => item.id === state.selectedAircraftId);
  if (aircraft === undefined) {
    throw new Error('Selected aircraft is not present in the active scenario.');
  }
  return aircraft;
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
        ? item.simulatedFuelMinutes < 30
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
