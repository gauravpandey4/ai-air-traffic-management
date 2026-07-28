export type ScenarioId =
  'normal-traffic' | 'severe-weather' | 'collision-risk' | 'low-fuel' | 'emergency';

export type PlaybackRate = 1 | 2 | 4;

export type AircraftPhase = 'Arrival' | 'Departure' | 'Overflight';

export type AircraftSeverity = 'Normal' | 'Monitor' | 'Warning' | 'Critical';

export type FuelState = 'Normal' | 'Low' | 'Critical' | 'Unavailable';

export type ReviewDecision =
  'Awaiting review' | 'Confirmed in simulation' | 'Rejected in simulation';

export type Explanation = {
  facts: string[];
  source: string;
  rule: string;
  result: string;
  factors: string[];
  limitation: string;
  humanAction: string;
};

export type SimulationBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type RunwayConfiguration = {
  id: string;
  reciprocalId: string;
  headingDeg: number;
  reciprocalHeadingDeg: number;
  label: string;
};

export type RegionConfiguration = {
  id: string;
  displayName: string;
  center: {
    latitude: number;
    longitude: number;
  };
  bounds: SimulationBounds;
  defaultZoom: number;
  aircraftLimit: number;
  externalSnapshotRadiusNm: number;
  externalFreshnessMinutes: number;
  runway: RunwayConfiguration;
};

export type Aircraft = {
  id: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  groundSpeedKt: number;
  headingDeg: number;
  verticalRateFpm: number;
  phase: AircraftPhase;
  severity: AircraftSeverity;
  simulatedFuelMinutes: number;
  aircraftCategory: 'Light' | 'Medium' | 'Heavy';
  initialFuelKg: number;
  fuelBurnKgPerHour: number;
  elapsedFlightMinutes: number;
  simulatedEmergency: boolean;
  status: string;
  source: {
    mode: 'Simulated';
    generator: 'FutureATC deterministic engine';
    generatedAtIso: string;
    freshness: 'Fresh';
    limitation: string;
  };
};

export type ScenarioDefinition = {
  id: ScenarioId;
  name: string;
  shortName: string;
  seed: string;
  epochIso: string;
  summary: string;
  situation: string;
  weatherLabel: string;
};

export type SimulationStatistics = {
  totalAircraft: number;
  airborneAircraft: number;
  arrivals: number;
  emergencies: number;
  lowFuelAircraft: number;
  averageAltitudeFt: number;
  averageGroundSpeedKt: number;
};

export type FuelAssessment = {
  aircraftId: string;
  state: FuelState;
  remainingFuelKg: number;
  enduranceMinutes: number;
  burnKgPerHour: number;
  explanation: Explanation;
};

export type ConflictProjection = {
  id: string;
  aircraftIds: readonly [string, string];
  callsigns: readonly [string, string];
  severity: AircraftSeverity | 'Insufficient data';
  timeToCpaSeconds: number | null;
  horizontalSeparationNm: number | null;
  verticalSeparationFt: number | null;
  explanation: Explanation;
};

export type PriorityEntry = {
  aircraftId: string;
  callsign: string;
  rank: number;
  reason: string;
  supportingFactors: string[];
};

export type RunwayScoreContribution = {
  label: string;
  value: number;
  detail: string;
};

export type RunwayScore = {
  runwayId: string;
  available: boolean;
  total: number | null;
  contributions: RunwayScoreContribution[];
};

export type RunwayRecommendation = {
  id: string;
  aircraftId: string;
  callsign: string;
  suggestedRunwayId: string | null;
  scores: RunwayScore[];
  explanation: Explanation;
};

export type DecisionAlert = {
  id: string;
  severity: AircraftSeverity;
  title: string;
  summary: string;
  aircraftIds: string[];
  explanation: Explanation;
};

export type DecisionSupport = {
  fuelByAircraftId: Record<string, FuelAssessment>;
  conflicts: ConflictProjection[];
  alerts: DecisionAlert[];
  priority: PriorityEntry[];
  runwayRecommendation: RunwayRecommendation | null;
};

export type SimulationState = {
  scenarioId: ScenarioId;
  aircraft: Aircraft[];
  selectedAircraftId: string;
  isPlaying: boolean;
  playbackRate: PlaybackRate;
  elapsedSeconds: number;
  mapMode: 'schematic' | 'connected';
  mapStatus: string;
  acknowledgedAlertIds: string[];
  reviewDecisions: Record<string, ReviewDecision>;
};
