import type { Aircraft, AircraftSeverity, ConflictProjection } from './types';

export const conflictThresholds = {
  horizonSeconds: 600,
  critical: { horizontalNm: 5, verticalFt: 1_000 },
  warning: { horizontalNm: 8, verticalFt: 2_000 },
  monitor: { horizontalNm: 12, verticalFt: 3_000 },
} as const;

type Track = Pick<
  Aircraft,
  | 'id'
  | 'callsign'
  | 'latitude'
  | 'longitude'
  | 'altitudeFt'
  | 'groundSpeedKt'
  | 'headingDeg'
  | 'verticalRateFpm'
  | 'source'
>;

type Vector = { east: number; north: number };

function isFiniteTrack(track: Track): boolean {
  return [
    track.latitude,
    track.longitude,
    track.altitudeFt,
    track.groundSpeedKt,
    track.headingDeg,
    track.verticalRateFpm,
  ].every(Number.isFinite);
}

export function positionToLocalNm(
  latitude: number,
  longitude: number,
  originLatitude: number,
  originLongitude: number,
): Vector {
  const longitudeScale = Math.cos((originLatitude * Math.PI) / 180);
  return {
    east: (longitude - originLongitude) * 60 * longitudeScale,
    north: (latitude - originLatitude) * 60,
  };
}

export function velocityToNmPerSecond(groundSpeedKt: number, headingDeg: number): Vector {
  const headingRadians = (headingDeg * Math.PI) / 180;
  const speedNmPerSecond = groundSpeedKt / 3_600;
  return {
    east: Math.sin(headingRadians) * speedNmPerSecond,
    north: Math.cos(headingRadians) * speedNmPerSecond,
  };
}

export function classifyConflict(
  horizontalSeparationNm: number,
  verticalSeparationFt: number,
): AircraftSeverity {
  if (
    horizontalSeparationNm < conflictThresholds.critical.horizontalNm &&
    verticalSeparationFt < conflictThresholds.critical.verticalFt
  ) {
    return 'Critical';
  }
  if (
    horizontalSeparationNm < conflictThresholds.warning.horizontalNm &&
    verticalSeparationFt < conflictThresholds.warning.verticalFt
  ) {
    return 'Warning';
  }
  if (
    horizontalSeparationNm < conflictThresholds.monitor.horizontalNm &&
    verticalSeparationFt < conflictThresholds.monitor.verticalFt
  ) {
    return 'Monitor';
  }
  return 'Normal';
}

export function projectConflict(first: Track, second: Track): ConflictProjection {
  const id = [first.id, second.id].sort().join(':');
  const callsigns = [first.callsign, second.callsign] as const;
  const external = first.source.mode === 'External' || second.source.mode === 'External';
  const common = {
    id,
    aircraftIds: [first.id, second.id] as const,
    callsigns,
  };

  if (!isFiniteTrack(first) || !isFiniteTrack(second)) {
    return {
      ...common,
      severity: 'Insufficient data',
      timeToCpaSeconds: null,
      horizontalSeparationNm: null,
      verticalSeparationFt: null,
      explanation: {
        facts: [`Tracks: ${first.callsign} and ${second.callsign}`],
        source: external
          ? 'FutureATC educational geometric projection from an adsb.fi near-live snapshot'
          : 'FutureATC derived from simulated tracks',
        rule: 'CPA requires finite position, altitude, speed, heading, and vertical-rate values.',
        result: 'Insufficient data',
        factors: ['At least one required kinematic value is missing or invalid.'],
        limitation: 'No separation classification is fabricated when inputs are incomplete.',
        humanAction: 'A human controller would verify authoritative surveillance and intent.',
      },
    };
  }

  const originLatitude = (first.latitude + second.latitude) / 2;
  const originLongitude = (first.longitude + second.longitude) / 2;
  const firstPosition = positionToLocalNm(
    first.latitude,
    first.longitude,
    originLatitude,
    originLongitude,
  );
  const secondPosition = positionToLocalNm(
    second.latitude,
    second.longitude,
    originLatitude,
    originLongitude,
  );
  const firstVelocity = velocityToNmPerSecond(first.groundSpeedKt, first.headingDeg);
  const secondVelocity = velocityToNmPerSecond(second.groundSpeedKt, second.headingDeg);
  const relativePosition = {
    east: secondPosition.east - firstPosition.east,
    north: secondPosition.north - firstPosition.north,
  };
  const relativeVelocity = {
    east: secondVelocity.east - firstVelocity.east,
    north: secondVelocity.north - firstVelocity.north,
  };
  const relativeSpeedSquared = relativeVelocity.east ** 2 + relativeVelocity.north ** 2;
  const unconstrainedTime =
    relativeSpeedSquared < 1e-12
      ? 0
      : -(
          relativePosition.east * relativeVelocity.east +
          relativePosition.north * relativeVelocity.north
        ) / relativeSpeedSquared;
  const timeToCpaSeconds = Math.min(
    conflictThresholds.horizonSeconds,
    Math.max(0, unconstrainedTime),
  );
  const eastAtCpa = relativePosition.east + relativeVelocity.east * timeToCpaSeconds;
  const northAtCpa = relativePosition.north + relativeVelocity.north * timeToCpaSeconds;
  const horizontalSeparationNm = Math.hypot(eastAtCpa, northAtCpa);
  const firstAltitudeAtCpa = first.altitudeFt + (first.verticalRateFpm * timeToCpaSeconds) / 60;
  const secondAltitudeAtCpa = second.altitudeFt + (second.verticalRateFpm * timeToCpaSeconds) / 60;
  const verticalSeparationFt = Math.abs(secondAltitudeAtCpa - firstAltitudeAtCpa);
  const severity = classifyConflict(horizontalSeparationNm, verticalSeparationFt);

  return {
    ...common,
    severity,
    timeToCpaSeconds,
    horizontalSeparationNm,
    verticalSeparationFt,
    explanation: {
      facts: [
        `CPA in ${String(Math.round(timeToCpaSeconds))} s`,
        `Projected horizontal separation ${horizontalSeparationNm.toFixed(1)} NM`,
        `Projected vertical separation ${Math.round(verticalSeparationFt).toLocaleString()} ft`,
      ],
      source: external
        ? 'FutureATC educational geometric projection from an adsb.fi near-live snapshot'
        : 'FutureATC educational geometric projection from simulated tracks',
      rule: '10-minute constant-velocity CPA; Critical <5 NM and <1,000 ft, Warning <8 NM and <2,000 ft, Monitor <12 NM and <3,000 ft.',
      result: `${severity} projected separation`,
      factors: [
        relativeSpeedSquared < 1e-12
          ? 'Relative speed is effectively zero; current separation is used.'
          : 'Relative position and velocity are projected to the clamped closest point.',
      ],
      limitation: external
        ? 'Educational geometry only: incomplete public snapshot data cannot establish actual collision danger; intent, latency, quality, turns, winds, and certified logic are omitted.'
        : 'Educational simplification: omits intent, clearances, turns, winds, surveillance quality, aircraft performance, and certified separation logic.',
      humanAction: 'A human controller must verify authoritative data and decide any action.',
    },
  };
}

export function projectAllConflicts(aircraft: readonly Track[]): ConflictProjection[] {
  const projections: ConflictProjection[] = [];
  for (const [firstIndex, first] of aircraft.entries()) {
    for (const second of aircraft.slice(firstIndex + 1)) {
      projections.push(projectConflict(first, second));
    }
  }
  return projections.sort((left, right) => {
    const severityRank = {
      Critical: 0,
      Warning: 1,
      Monitor: 2,
      Normal: 3,
      'Insufficient data': 4,
    } as const;
    return (
      severityRank[left.severity] - severityRank[right.severity] || left.id.localeCompare(right.id)
    );
  });
}
