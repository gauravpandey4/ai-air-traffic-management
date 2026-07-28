import { defaultRegion } from '../config/regions';

import { projectAllConflicts } from './collision';
import { assessAllFuel } from './fuel';
import { orderLandingPriority, type PriorityCandidate } from './priority';
import { recommendRunway, type RunwayCandidate } from './runway';
import type {
  Aircraft,
  AircraftSeverity,
  ConflictProjection,
  DecisionAlert,
  DecisionSupport,
  FuelAssessment,
  SimulationState,
  WeatherRisk,
} from './types';

const severityRank = {
  Normal: 0,
  Monitor: 1,
  Warning: 2,
  Critical: 3,
} as const;

function maximumConflictSeverity(
  aircraftId: string,
  conflicts: readonly ConflictProjection[],
): AircraftSeverity {
  return conflicts
    .filter(
      (conflict) =>
        conflict.aircraftIds.includes(aircraftId) && conflict.severity !== 'Insufficient data',
    )
    .reduce<AircraftSeverity>(
      (highest, conflict) =>
        conflict.severity !== 'Insufficient data' &&
        severityRank[conflict.severity] > severityRank[highest]
          ? conflict.severity
          : highest,
      'Normal',
    );
}

function estimatedArrivalMinutes(aircraft: Aircraft, originalIndex: number): number {
  if (aircraft.phase !== 'Arrival') return 60 + originalIndex;
  return Math.max(2, Math.round(aircraft.altitudeFt / 1_800) + originalIndex);
}

function createPriorityCandidates(
  aircraft: readonly Aircraft[],
  fuelByAircraftId: Record<string, FuelAssessment>,
  conflicts: readonly ConflictProjection[],
  weatherRisk: WeatherRisk,
): PriorityCandidate[] {
  return aircraft.reduce<PriorityCandidate[]>((candidates, item, originalIndex) => {
    const fuel = fuelByAircraftId[item.id];
    if (fuel !== undefined && (item.phase === 'Arrival' || item.simulatedEmergency)) {
      candidates.push({
        aircraft: item,
        fuel,
        conflictSeverity: maximumConflictSeverity(item.id, conflicts),
        weather:
          weatherRisk === 'Severe' ? 'Severe' : weatherRisk === 'Elevated' ? 'Elevated' : 'Normal',
        estimatedArrivalMinutes: estimatedArrivalMinutes(item, originalIndex),
        originalIndex,
      });
    }
    return candidates;
  }, []);
}

function createConflictAlerts(conflicts: readonly ConflictProjection[]): DecisionAlert[] {
  return conflicts
    .filter(
      (
        conflict,
      ): conflict is ConflictProjection & {
        severity: AircraftSeverity;
      } => conflict.severity !== 'Normal' && conflict.severity !== 'Insufficient data',
    )
    .map((conflict) => ({
      id: `conflict:${conflict.id}`,
      severity: conflict.severity,
      title: `${conflict.severity} projected separation`,
      summary: `${conflict.callsigns[0]} and ${conflict.callsigns[1]} at CPA`,
      aircraftIds: [...conflict.aircraftIds],
      explanation: conflict.explanation,
    }));
}

function createAircraftAlerts(
  aircraft: readonly Aircraft[],
  fuelByAircraftId: Record<string, FuelAssessment>,
): DecisionAlert[] {
  return aircraft.flatMap((item) => {
    const alerts: DecisionAlert[] = [];
    const fuel = fuelByAircraftId[item.id];
    if (fuel?.state === 'Low' || fuel?.state === 'Critical') {
      alerts.push({
        id: `fuel:${item.id}`,
        severity: fuel.state === 'Critical' ? 'Critical' : 'Warning',
        title: `${fuel.state} simulated fuel`,
        summary: `${item.callsign} has ${fuel.enduranceMinutes.toFixed(1)} min estimated endurance`,
        aircraftIds: [item.id],
        explanation: fuel.explanation,
      });
    }
    if (item.simulatedEmergency) {
      alerts.push({
        id: `emergency:${item.id}`,
        severity: 'Critical',
        title: 'Declared simulated emergency',
        summary: `${item.callsign} receives first educational queue priority`,
        aircraftIds: [item.id],
        explanation: {
          facts: [`${item.callsign}: simulated emergency active`],
          source: 'FutureATC scenario or user simulation control',
          rule: 'Emergency state is the first lexicographic priority factor.',
          result: 'Emergency priority applied',
          factors: ['Overrides routine queue order', 'Does not override runway availability'],
          limitation: 'This state exists only inside the browser simulation.',
          humanAction: 'A human controller must verify and decide any real-world action.',
        },
      });
    }
    return alerts;
  });
}

function createRunways(emergencyScenario: boolean): RunwayCandidate[] {
  return [
    {
      id: defaultRegion.runway.id,
      headingDeg: defaultRegion.runway.headingDeg,
      available: !emergencyScenario,
      queueLength: 2,
    },
    {
      id: defaultRegion.runway.reciprocalId,
      headingDeg: defaultRegion.runway.reciprocalHeadingDeg,
      available: true,
      queueLength: 1,
    },
  ];
}

export function deriveDecisionSupport(state: SimulationState): DecisionSupport {
  const fuelByAircraftId = assessAllFuel(state.aircraft, state.elapsedSeconds);
  const conflicts = projectAllConflicts(state.aircraft);
  const candidates = createPriorityCandidates(
    state.aircraft,
    fuelByAircraftId,
    conflicts,
    state.weatherSnapshot.risk.severity,
  );
  const priority = orderLandingPriority(candidates);
  const firstPriority = priority[0];
  const selectedCandidate =
    firstPriority === undefined
      ? undefined
      : candidates.find((candidate) => candidate.aircraft.id === firstPriority.aircraftId);
  const runwayRecommendation =
    selectedCandidate === undefined
      ? null
      : recommendRunway(
          {
            aircraftId: selectedCandidate.aircraft.id,
            callsign: selectedCandidate.aircraft.callsign,
            estimatedArrivalMinutes: selectedCandidate.estimatedArrivalMinutes,
            fuelState: selectedCandidate.fuel.state,
            conflictSeverity: selectedCandidate.conflictSeverity,
            simulatedEmergency: selectedCandidate.aircraft.simulatedEmergency,
          },
          createRunways(state.scenarioId === 'emergency'),
          state.weatherSnapshot.current.windDirectionDeg,
          state.weatherSnapshot.current.windSpeedKt,
        );
  const alerts = [
    ...createConflictAlerts(conflicts),
    ...createAircraftAlerts(state.aircraft, fuelByAircraftId),
  ].sort(
    (left, right) =>
      severityRank[right.severity] - severityRank[left.severity] || left.id.localeCompare(right.id),
  );

  return {
    fuelByAircraftId,
    conflicts,
    alerts,
    priority,
    runwayRecommendation,
  };
}

export function decorateAircraftForDecisionSupport(
  aircraft: readonly Aircraft[],
  support: DecisionSupport,
): Aircraft[] {
  return aircraft.map((item) => {
    const conflictSeverity = maximumConflictSeverity(item.id, support.conflicts);
    const fuelState = support.fuelByAircraftId[item.id]?.state;
    const fuelSeverity: AircraftSeverity =
      fuelState === 'Critical' ? 'Critical' : fuelState === 'Low' ? 'Warning' : 'Normal';
    const severity = item.simulatedEmergency
      ? 'Critical'
      : severityRank[conflictSeverity] >= severityRank[fuelSeverity]
        ? conflictSeverity
        : fuelSeverity;
    return { ...item, severity };
  });
}
