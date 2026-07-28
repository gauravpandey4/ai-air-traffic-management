export type ScenarioId =
  'normal-traffic' | 'severe-weather' | 'collision-risk' | 'low-fuel' | 'emergency';

export type PlaybackRate = 1 | 2 | 4;

export type AircraftPhase = 'Arrival' | 'Departure' | 'Overflight';

export type AircraftSeverity = 'Normal' | 'Monitor' | 'Warning' | 'Critical';

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

export type SimulationState = {
  scenarioId: ScenarioId;
  aircraft: Aircraft[];
  selectedAircraftId: string;
  isPlaying: boolean;
  playbackRate: PlaybackRate;
  elapsedSeconds: number;
  mapMode: 'schematic' | 'connected';
  mapStatus: string;
};
