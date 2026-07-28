import { defaultRegion } from '../config/regions';

import { createSeededRandom } from './random';
import type { Aircraft, AircraftPhase, ScenarioDefinition, ScenarioId } from './types';

const scenarioOrder: readonly ScenarioId[] = [
  'normal-traffic',
  'severe-weather',
  'collision-risk',
  'low-fuel',
  'emergency',
];

export const scenarios = {
  'normal-traffic': {
    id: 'normal-traffic',
    name: 'Normal traffic',
    shortName: 'Normal',
    seed: 'FATC-NORMAL-2401',
    epochIso: '2026-01-01T08:00:00.000Z',
    summary: 'Stable simulated traffic with routine arrivals, departures, and overflights.',
    situation: 'Routine flow',
    weatherLabel: 'Calm simulated conditions',
  },
  'severe-weather': {
    id: 'severe-weather',
    name: 'Severe weather',
    shortName: 'Weather',
    seed: 'FATC-WEATHER-2402',
    epochIso: '2026-01-01T09:00:00.000Z',
    summary: 'A deterministic traffic picture prepared for severe-weather analysis in PR 4.',
    situation: 'Severe weather context',
    weatherLabel: 'Severe simulated weather',
  },
  'collision-risk': {
    id: 'collision-risk',
    name: 'Collision risk',
    shortName: 'Conflict',
    seed: 'FATC-CONFLICT-2403',
    epochIso: '2026-01-01T10:00:00.000Z',
    summary: 'Two synthetic aircraft follow reproducible converging tracks for CPA analysis.',
    situation: 'Converging traffic',
    weatherLabel: 'Calm simulated conditions',
  },
  'low-fuel': {
    id: 'low-fuel',
    name: 'Low fuel',
    shortName: 'Fuel',
    seed: 'FATC-FUEL-2404',
    epochIso: '2026-01-01T11:00:00.000Z',
    summary: 'A synthetic arrival carries an educational low-fuel state for PR 3 decisions.',
    situation: 'Fuel-priority review',
    weatherLabel: 'Calm simulated conditions',
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency',
    shortName: 'Emergency',
    seed: 'FATC-EMERGENCY-2405',
    epochIso: '2026-01-01T12:00:00.000Z',
    summary: 'A declared simulated emergency is visible and awaits future human review logic.',
    situation: 'Simulated emergency',
    weatherLabel: 'Calm simulated conditions',
  },
} as const satisfies Record<ScenarioId, ScenarioDefinition>;

export const scenarioList = scenarioOrder.map((scenarioId) => scenarios[scenarioId]);

const phases: readonly AircraftPhase[] = ['Arrival', 'Departure', 'Overflight'];
const verticalRates = [-900, -500, 0, 0, 0, 500, 900] as const;

function round(value: number, places = 4): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

function createBaseAircraft(definition: ScenarioDefinition): Aircraft[] {
  const random = createSeededRandom(`${defaultRegion.id}:${definition.seed}`);
  const { bounds } = defaultRegion;
  const latitudePadding = (bounds.north - bounds.south) * 0.1;
  const longitudePadding = (bounds.east - bounds.west) * 0.1;

  return Array.from({ length: 8 }, (_, index) => {
    const phase = phases[index] ?? random.pick(phases);
    const number = String(index + 1).padStart(2, '0');
    const verticalRateFpm = random.pick(verticalRates);
    const simulatedFuelMinutes = random.integer(38, 105);

    return {
      id: `${definition.id}-${number}`,
      callsign: `SIM-${definition.shortName.slice(0, 3).toUpperCase()}${number}`,
      latitude: round(
        bounds.south +
          latitudePadding +
          random.next() * (bounds.north - bounds.south - latitudePadding * 2),
      ),
      longitude: round(
        bounds.west +
          longitudePadding +
          random.next() * (bounds.east - bounds.west - longitudePadding * 2),
      ),
      altitudeFt: random.integer(45, 310) * 100,
      groundSpeedKt: random.integer(210, 470),
      headingDeg: random.integer(0, 359),
      verticalRateFpm,
      phase,
      severity: 'Normal',
      simulatedFuelMinutes,
      simulatedEmergency: false,
      status:
        verticalRateFpm > 0 ? 'Climbing' : verticalRateFpm < 0 ? 'Descending' : 'Level flight',
      source: {
        mode: 'Simulated',
        generator: 'FutureATC deterministic engine',
        generatedAtIso: definition.epochIso,
        freshness: 'Fresh',
        limitation:
          'Synthetic educational state; it does not describe or communicate with a real aircraft.',
      },
    };
  });
}

function applyScenarioOverrides(scenarioId: ScenarioId, aircraft: Aircraft[]): Aircraft[] {
  if (scenarioId === 'collision-risk') {
    return aircraft.map((item, index) => {
      if (index === 0) {
        return {
          ...item,
          latitude: defaultRegion.center.latitude,
          longitude: defaultRegion.center.longitude - 0.16,
          altitudeFt: 12_000,
          groundSpeedKt: 360,
          headingDeg: 90,
          verticalRateFpm: 0,
          severity: 'Monitor',
          status: 'Converging track',
        };
      }
      if (index === 1) {
        return {
          ...item,
          latitude: defaultRegion.center.latitude,
          longitude: defaultRegion.center.longitude + 0.16,
          altitudeFt: 12_400,
          groundSpeedKt: 340,
          headingDeg: 270,
          verticalRateFpm: 0,
          severity: 'Monitor',
          status: 'Converging track',
        };
      }
      return item;
    });
  }

  if (scenarioId === 'low-fuel') {
    return aircraft.map((item, index) =>
      index === 0
        ? {
            ...item,
            simulatedFuelMinutes: 12,
            severity: 'Warning',
            status: 'Critical fuel scenario',
          }
        : index === 1
          ? {
              ...item,
              simulatedFuelMinutes: 24,
              severity: 'Monitor',
              status: 'Low fuel scenario',
            }
          : item,
    );
  }

  if (scenarioId === 'emergency') {
    return aircraft.map((item, index) =>
      index === 0
        ? {
            ...item,
            simulatedEmergency: true,
            severity: 'Critical',
            status: 'Declared simulated emergency',
          }
        : item,
    );
  }

  return aircraft;
}

export function createScenarioAircraft(scenarioId: ScenarioId): Aircraft[] {
  const definition = scenarios[scenarioId];
  return applyScenarioOverrides(scenarioId, createBaseAircraft(definition));
}

export function isScenarioId(value: string): value is ScenarioId {
  return Object.hasOwn(scenarios, value);
}
