export type ScenarioId =
  'normal-traffic' | 'severe-weather' | 'collision-risk' | 'low-fuel' | 'emergency';

export type PlaybackRate = 1 | 2 | 4;

export type AircraftPhase = 'Arrival' | 'Departure' | 'Overflight';
export type AircraftDataMode = 'Simulation' | 'Checking' | 'External Active';

export type AircraftSeverity = 'Normal' | 'Monitor' | 'Warning' | 'Critical';

export type FuelState = 'Normal' | 'Low' | 'Critical' | 'Unavailable';

export type ReviewDecision =
  'Awaiting review' | 'Confirmed in simulation' | 'Rejected in simulation';

export type WeatherRisk = 'Normal' | 'Elevated' | 'Severe';

export type WeatherMode = 'Simulated' | 'Checking' | 'Observed' | 'Cached' | 'Fallback';

export type Explanation = {
  facts: string[];
  source: string;
  rule: string;
  result: string;
  factors: string[];
  limitation: string;
  humanAction: string;
};

export type WeatherObservation = {
  timeIso: string;
  windSpeedKt: number;
  windGustKt: number;
  windDirectionDeg: number;
  visibilityKm: number;
  precipitationMmPerHour: number;
  weatherCode: number;
};

export type WeatherRiskAssessment = {
  severity: WeatherRisk;
  factors: string[];
  trend: 'Improving' | 'Stable' | 'Deteriorating';
  explanation: Explanation;
};

export type WeatherSnapshot = {
  mode: 'Simulated' | 'Observed' | 'Cached';
  provider: string;
  current: WeatherObservation;
  outlook: WeatherObservation[];
  risk: WeatherRiskAssessment;
  fetchedAtIso: string;
  generatedAtIso: string;
  limitation: string;
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
  phase: AircraftPhase | 'Unavailable';
  severity: AircraftSeverity;
  simulatedFuelMinutes: number | null;
  aircraftCategory: 'Light' | 'Medium' | 'Heavy' | 'Unavailable';
  initialFuelKg: number | null;
  fuelBurnKgPerHour: number | null;
  elapsedFlightMinutes: number | null;
  simulatedEmergency: boolean;
  status: string;
  source:
    | {
        mode: 'Simulated';
        generator: 'FutureATC deterministic engine';
        generatedAtIso: string;
        freshness: 'Fresh';
        limitation: string;
      }
    | {
        mode: 'External';
        provider: 'adsb.fi';
        observedAtIso: string;
        fetchedAtIso: string;
        freshness: 'Fresh';
        limitation: string;
      };
};

export type ExternalAircraftRecord = {
  id: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  groundSpeedKt: number;
  headingDeg: number;
  verticalRateFpm: number;
  observedAtIso: string;
  status: string;
};

export type AircraftSnapshot = {
  schemaVersion: 1;
  availability: 'available' | 'unavailable';
  provider: 'adsb.fi';
  endpointClass: 'regional-v3';
  generatedAt: string | null;
  fetchedAt: string | null;
  freshForMinutes: number;
  validation:
    'valid' | 'not-fetched' | 'provider-unavailable' | 'rate-limited' | 'invalid-response';
  recordCount: number;
  retryAt: string | null;
  reason: string;
  aircraft: ExternalAircraftRecord[];
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
  airborneAircraft: StatisticMetric;
  arrivals: StatisticMetric;
  emergencies: StatisticMetric;
  lowFuelAircraft: StatisticMetric;
  averageAltitudeFt: StatisticMetric;
  averageGroundSpeedKt: StatisticMetric;
};

export type StatisticMetric = {
  value: number | null;
  observationCount: number;
  totalCount: number;
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
  selectedAircraftId: string | null;
  aircraftMode: AircraftDataMode;
  aircraftStatus: string;
  externalSnapshot: AircraftSnapshot | null;
  aircraftRetryAtIso: string | null;
  isPlaying: boolean;
  playbackRate: PlaybackRate;
  elapsedSeconds: number;
  mapMode: 'schematic' | 'connected';
  mapStatus: string;
  acknowledgedAlertIds: string[];
  reviewDecisions: Record<string, ReviewDecision>;
  weatherMode: WeatherMode;
  weatherSnapshot: WeatherSnapshot;
  weatherStatus: string;
  weatherRetryAtIso: string | null;
};
