import type { Aircraft, AircraftSeverity, FuelAssessment, PriorityEntry } from './types';

export type PriorityWeather = 'Normal' | 'Elevated' | 'Severe';

export type PriorityCandidate = {
  aircraft: Aircraft;
  fuel: FuelAssessment;
  conflictSeverity: AircraftSeverity;
  weather: PriorityWeather;
  estimatedArrivalMinutes: number;
  originalIndex: number;
};

function comparisonVector(candidate: PriorityCandidate): readonly number[] {
  return [
    candidate.aircraft.simulatedEmergency ? 0 : 1,
    candidate.fuel.state === 'Critical' ? 0 : 1,
    candidate.conflictSeverity === 'Critical' ? 0 : 1,
    candidate.weather === 'Severe' ? 0 : 1,
    candidate.fuel.state === 'Low' ? 0 : 1,
    candidate.estimatedArrivalMinutes,
    candidate.originalIndex,
  ];
}

export function comparePriority(left: PriorityCandidate, right: PriorityCandidate): number {
  const leftVector = comparisonVector(left);
  const rightVector = comparisonVector(right);
  for (let index = 0; index < leftVector.length; index += 1) {
    const difference = (leftVector[index] ?? 0) - (rightVector[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function factorLabels(candidate: PriorityCandidate): string[] {
  const factors: string[] = [];
  if (candidate.aircraft.simulatedEmergency) factors.push('Active simulated emergency');
  if (candidate.fuel.state === 'Critical') factors.push('Critical simulated fuel');
  if (candidate.conflictSeverity === 'Critical') factors.push('Time-critical projected conflict');
  if (candidate.weather === 'Severe') factors.push('Severe simulated weather exposure');
  if (candidate.fuel.state === 'Low') factors.push('Low simulated fuel');
  factors.push(`Estimated arrival ${candidate.estimatedArrivalMinutes.toFixed(0)} min`);
  return factors;
}

export function orderLandingPriority(candidates: readonly PriorityCandidate[]): PriorityEntry[] {
  return [...candidates].sort(comparePriority).map((candidate, index) => {
    const factors = factorLabels(candidate);
    return {
      aircraftId: candidate.aircraft.id,
      callsign: candidate.aircraft.callsign,
      rank: index + 1,
      reason: factors[0] ?? 'Stable original queue order',
      supportingFactors: factors.slice(1),
    };
  });
}
