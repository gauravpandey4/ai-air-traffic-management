import type {
  AircraftSeverity,
  Explanation,
  FuelState,
  RunwayRecommendation,
  RunwayScore,
  RunwayScoreContribution,
} from './types';

export const runwayWeights = {
  base: 50,
  maximumHeadwindReward: 15,
  maximumCrosswindPenalty: 20,
  maximumTailwindPenalty: 30,
  queuePenaltyEach: 5,
  maximumQueuePenalty: 20,
  maximumArrivalUrgency: 10,
  lowFuel: 15,
  criticalFuel: 30,
  warningConflict: 10,
  criticalConflict: 20,
  emergency: 100,
} as const;

export type RunwayCandidate = {
  id: string;
  headingDeg: number;
  available: boolean;
  queueLength: number;
};

export type RunwayAircraftContext = {
  aircraftId: string;
  callsign: string;
  estimatedArrivalMinutes: number;
  fuelState: FuelState;
  conflictSeverity: AircraftSeverity;
  simulatedEmergency: boolean;
};

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function scoreRunway(
  runway: RunwayCandidate,
  aircraft: RunwayAircraftContext,
  windDirectionDeg: number,
  windSpeedKt: number,
): RunwayScore {
  if (!runway.available) {
    return {
      runwayId: runway.id,
      available: false,
      total: null,
      contributions: [
        { label: 'Availability gate', value: 0, detail: 'Unavailable — disqualified' },
      ],
    };
  }

  const angleRadians = ((windDirectionDeg - runway.headingDeg) * Math.PI) / 180;
  const alongRunwayKt = Math.cos(angleRadians) * windSpeedKt;
  const crosswindKt = Math.abs(Math.sin(angleRadians) * windSpeedKt);
  const headwind = round(Math.min(runwayWeights.maximumHeadwindReward, Math.max(0, alongRunwayKt)));
  const tailwind = round(
    -Math.min(runwayWeights.maximumTailwindPenalty, Math.max(0, -alongRunwayKt) * 2),
  );
  const crosswind = round(-Math.min(runwayWeights.maximumCrosswindPenalty, crosswindKt));
  const queue = -Math.min(
    runwayWeights.maximumQueuePenalty,
    runway.queueLength * runwayWeights.queuePenaltyEach,
  );
  const arrivalUrgency = round(
    Math.max(0, runwayWeights.maximumArrivalUrgency - aircraft.estimatedArrivalMinutes),
  );
  const fuel =
    aircraft.fuelState === 'Critical'
      ? runwayWeights.criticalFuel
      : aircraft.fuelState === 'Low'
        ? runwayWeights.lowFuel
        : 0;
  const conflict =
    aircraft.conflictSeverity === 'Critical'
      ? runwayWeights.criticalConflict
      : aircraft.conflictSeverity === 'Warning'
        ? runwayWeights.warningConflict
        : 0;
  const emergency = aircraft.simulatedEmergency ? runwayWeights.emergency : 0;
  const contributions: RunwayScoreContribution[] = [
    { label: 'Neutral base', value: runwayWeights.base, detail: 'Valid candidate' },
    {
      label: 'Headwind suitability',
      value: headwind,
      detail: `${Math.max(0, alongRunwayKt).toFixed(1)} kt component`,
    },
    {
      label: 'Crosswind',
      value: crosswind,
      detail: `${crosswindKt.toFixed(1)} kt component`,
    },
    {
      label: 'Tailwind',
      value: tailwind,
      detail: `${Math.max(0, -alongRunwayKt).toFixed(1)} kt component`,
    },
    { label: 'Queue load', value: queue, detail: `${String(runway.queueLength)} aircraft` },
    {
      label: 'Arrival urgency',
      value: arrivalUrgency,
      detail: `${aircraft.estimatedArrivalMinutes.toFixed(0)} min estimated arrival`,
    },
    { label: 'Fuel urgency', value: fuel, detail: `${aircraft.fuelState} fuel state` },
    {
      label: 'Conflict urgency',
      value: conflict,
      detail: `${aircraft.conflictSeverity} projection`,
    },
    {
      label: 'Emergency priority',
      value: emergency,
      detail: aircraft.simulatedEmergency ? 'Active simulated emergency' : 'No emergency',
    },
  ];

  return {
    runwayId: runway.id,
    available: true,
    total: round(contributions.reduce((total, contribution) => total + contribution.value, 0)),
    contributions,
  };
}

function recommendationExplanation(
  aircraft: RunwayAircraftContext,
  scores: RunwayScore[],
  suggestedRunwayId: string | null,
  windDirectionDeg: number,
  windSpeedKt: number,
): Explanation {
  return {
    facts: [
      `Candidate wind ${windDirectionDeg.toFixed(0)}° at ${windSpeedKt.toFixed(0)} kt`,
      ...scores.map((score) =>
        score.total === null
          ? `${score.runwayId}: unavailable`
          : `${score.runwayId}: ${score.total.toFixed(1)} points`,
      ),
    ],
    source: 'FutureATC derived from simulated runway, traffic, fuel, and track inputs',
    rule: 'Highest valid transparent score wins; unavailable runways are disqualified.',
    result:
      suggestedRunwayId === null
        ? 'No valid runway recommendation'
        : `Suggested runway ${suggestedRunwayId}`,
    factors: [
      `${aircraft.fuelState} fuel`,
      `${aircraft.conflictSeverity} projected separation`,
      aircraft.simulatedEmergency ? 'Emergency contribution applied' : 'Routine priority',
    ],
    limitation:
      'Simulated configuration only; omits airport procedures, runway condition, aircraft performance, NOTAMs, and controller reports.',
    humanAction: 'A human controller must confirm or reject this simulated recommendation.',
  };
}

export function recommendRunway(
  aircraft: RunwayAircraftContext,
  runways: readonly RunwayCandidate[],
  windDirectionDeg: number,
  windSpeedKt: number,
): RunwayRecommendation {
  const scores = runways
    .map((runway) => scoreRunway(runway, aircraft, windDirectionDeg, windSpeedKt))
    .sort((left, right) => {
      if (left.total === null && right.total === null)
        return left.runwayId.localeCompare(right.runwayId);
      if (left.total === null) return 1;
      if (right.total === null) return -1;
      return right.total - left.total || left.runwayId.localeCompare(right.runwayId);
    });
  const suggestedRunwayId = scores.find((score) => score.total !== null)?.runwayId ?? null;
  const id = `${aircraft.aircraftId}:${suggestedRunwayId ?? 'none'}`;
  return {
    id,
    aircraftId: aircraft.aircraftId,
    callsign: aircraft.callsign,
    suggestedRunwayId,
    scores,
    explanation: recommendationExplanation(
      aircraft,
      scores,
      suggestedRunwayId,
      windDirectionDeg,
      windSpeedKt,
    ),
  };
}
