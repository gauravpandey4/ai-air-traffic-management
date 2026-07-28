import { z } from 'zod';

import { defaultRegion } from '../config/regions';

import type { Aircraft, AircraftSnapshot, ExternalAircraftRecord } from './types';

export const externalAircraftPolicy = {
  schemaVersion: 1,
  provider: 'adsb.fi',
  endpointClass: 'regional-v3',
  maximumProviderRecords: 250,
  maximumPositionAgeSeconds: 120,
  futureToleranceMinutes: 2,
} as const;

const finiteNumber = z.number();
const providerAircraftSchema = z.looseObject({
  hex: z
    .string()
    .trim()
    .regex(/^~?[0-9a-f]{6}$/iu),
  flight: z.string().trim().max(16).optional(),
  lat: finiteNumber.min(-90).max(90),
  lon: finiteNumber.min(-180).max(180),
  alt_baro: z.union([finiteNumber.min(-1_500).max(65_000), z.literal('ground')]),
  gs: finiteNumber.min(0).max(800),
  track: finiteNumber.min(0).max(360),
  baro_rate: finiteNumber.min(-10_000).max(10_000).optional(),
  seen_pos: finiteNumber.min(0).max(externalAircraftPolicy.maximumPositionAgeSeconds),
});

const providerPayloadSchema = z.looseObject({
  ac: z.array(providerAircraftSchema).max(externalAircraftPolicy.maximumProviderRecords),
  now: finiteNumber.int().positive(),
  total: finiteNumber.int().min(0).max(externalAircraftPolicy.maximumProviderRecords),
  msg: z.string().max(200).optional(),
});

const externalRecordSchema = z
  .object({
    id: z.string().regex(/^external-[0-9a-f]{6}$/u),
    callsign: z
      .string()
      .min(1)
      .max(16)
      .regex(/^[A-Z0-9-]+$/u),
    latitude: finiteNumber.min(-90).max(90),
    longitude: finiteNumber.min(-180).max(180),
    altitudeFt: finiteNumber.int().min(-1_500).max(65_000),
    groundSpeedKt: finiteNumber.min(0).max(800),
    headingDeg: finiteNumber.min(0).max(360),
    verticalRateFpm: finiteNumber.min(-10_000).max(10_000),
    observedAtIso: z.iso.datetime({ offset: true }),
    status: z.string().min(1).max(80),
  })
  .strict();

const aircraftSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    availability: z.enum(['available', 'unavailable']),
    provider: z.literal('adsb.fi'),
    endpointClass: z.literal('regional-v3'),
    generatedAt: z.iso.datetime({ offset: true }).nullable(),
    fetchedAt: z.iso.datetime({ offset: true }).nullable(),
    freshForMinutes: z.literal(defaultRegion.externalFreshnessMinutes),
    validation: z.enum([
      'valid',
      'not-fetched',
      'provider-unavailable',
      'rate-limited',
      'invalid-response',
    ]),
    recordCount: z.number().int().min(0).max(defaultRegion.aircraftLimit),
    retryAt: z.iso.datetime({ offset: true }).nullable(),
    reason: z.string().min(1).max(240),
    aircraft: z.array(externalRecordSchema).max(defaultRegion.aircraftLimit),
  })
  .strict()
  .superRefine((snapshot, context) => {
    const ids = new Set(snapshot.aircraft.map((aircraft) => aircraft.id));
    if (ids.size !== snapshot.aircraft.length) {
      context.addIssue({ code: 'custom', message: 'Aircraft identifiers must be unique.' });
    }
    if (snapshot.recordCount !== snapshot.aircraft.length) {
      context.addIssue({ code: 'custom', message: 'Record count does not match aircraft.' });
    }
    if (snapshot.availability === 'available') {
      if (
        snapshot.validation !== 'valid' ||
        snapshot.generatedAt === null ||
        snapshot.fetchedAt === null ||
        snapshot.retryAt !== null
      ) {
        context.addIssue({ code: 'custom', message: 'Available snapshot metadata is invalid.' });
      }
      if (snapshot.generatedAt !== null && snapshot.fetchedAt !== null) {
        const generatedAtMs = Date.parse(snapshot.generatedAt);
        const fetchedAtMs = Date.parse(snapshot.fetchedAt);
        if (Math.abs(generatedAtMs - fetchedAtMs) > 5 * 60_000) {
          context.addIssue({
            code: 'custom',
            message: 'Snapshot generation and provider timestamps are inconsistent.',
          });
        }
        for (const aircraft of snapshot.aircraft) {
          const observedAtMs = Date.parse(aircraft.observedAtIso);
          if (
            observedAtMs > fetchedAtMs ||
            fetchedAtMs - observedAtMs > externalAircraftPolicy.maximumPositionAgeSeconds * 1_000
          ) {
            context.addIssue({
              code: 'custom',
              message: 'Aircraft observation timestamp is outside the permitted age.',
            });
          }
        }
      }
    } else if (snapshot.aircraft.length !== 0 || snapshot.recordCount !== 0) {
      context.addIssue({
        code: 'custom',
        message: 'Unavailable snapshot must contain no aircraft.',
      });
    }
  });

function round(value: number, places = 4): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

function haversineDistanceNm(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number,
): number {
  const radians = Math.PI / 180;
  const latitudeDelta = (secondLatitude - firstLatitude) * radians;
  const longitudeDelta = (secondLongitude - firstLongitude) * radians;
  const firstLatitudeRadians = firstLatitude * radians;
  const secondLatitudeRadians = secondLatitude * radians;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitudeRadians) *
      Math.cos(secondLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 3_440.065 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeCallsign(value: string | undefined, hex: string): string {
  const candidate = value?.trim().toUpperCase();
  return candidate !== undefined && /^[A-Z0-9-]{1,16}$/u.test(candidate)
    ? candidate
    : `HEX-${hex.replace('~', '').toUpperCase()}`;
}

export function normalizeProviderPayload(
  payload: unknown,
  generatedAtIso: string,
): AircraftSnapshot {
  const parsed = providerPayloadSchema.parse(payload);
  if (parsed.total !== parsed.ac.length) {
    throw new Error('Provider total does not match the aircraft array.');
  }
  const providerNowMs = parsed.now < 10_000_000_000 ? parsed.now * 1_000 : parsed.now;
  const generatedAtMs = Date.parse(generatedAtIso);
  if (!Number.isFinite(generatedAtMs) || Math.abs(generatedAtMs - providerNowMs) > 5 * 60_000) {
    throw new Error('Provider timestamp is stale or in the future.');
  }
  const fetchedAt = new Date(providerNowMs).toISOString();
  const unique = new Map<string, ExternalAircraftRecord>();
  for (const aircraft of parsed.ac) {
    const normalizedHex = aircraft.hex.replace('~', '').toLowerCase();
    const distanceNm = haversineDistanceNm(
      defaultRegion.center.latitude,
      defaultRegion.center.longitude,
      aircraft.lat,
      aircraft.lon,
    );
    if (distanceNm > defaultRegion.externalSnapshotRadiusNm + 2) {
      throw new Error('Provider aircraft lies outside the requested regional radius.');
    }
    const id = `external-${normalizedHex}`;
    if (unique.has(id)) {
      throw new Error('Provider returned duplicate aircraft identifiers.');
    }
    unique.set(id, {
      id,
      callsign: normalizeCallsign(aircraft.flight, aircraft.hex),
      latitude: round(aircraft.lat),
      longitude: round(aircraft.lon),
      altitudeFt: aircraft.alt_baro === 'ground' ? 0 : Math.round(aircraft.alt_baro),
      groundSpeedKt: round(aircraft.gs, 1),
      headingDeg: round(aircraft.track, 1),
      verticalRateFpm: Math.round(aircraft.baro_rate ?? 0),
      observedAtIso: new Date(providerNowMs - aircraft.seen_pos * 1_000).toISOString(),
      status: aircraft.alt_baro === 'ground' ? 'Observed on ground' : 'Observed airborne track',
    });
  }
  const aircraft = [...unique.values()]
    .sort(
      (left, right) =>
        Date.parse(right.observedAtIso) - Date.parse(left.observedAtIso) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, defaultRegion.aircraftLimit);

  return {
    schemaVersion: 1,
    availability: 'available',
    provider: 'adsb.fi',
    endpointClass: 'regional-v3',
    generatedAt: new Date(generatedAtMs).toISOString(),
    fetchedAt,
    freshForMinutes: defaultRegion.externalFreshnessMinutes,
    validation: 'valid',
    recordCount: aircraft.length,
    retryAt: null,
    reason:
      aircraft.length === 0
        ? 'Valid fresh regional snapshot; no aircraft were reported.'
        : 'Valid fresh regional aircraft snapshot.',
    aircraft,
  };
}

export function createUnavailableAircraftSnapshot(options: {
  generatedAtIso: string;
  validation: Exclude<AircraftSnapshot['validation'], 'valid'>;
  reason: string;
  retryAt: string | null;
}): AircraftSnapshot {
  return {
    schemaVersion: 1,
    availability: 'unavailable',
    provider: 'adsb.fi',
    endpointClass: 'regional-v3',
    generatedAt: options.generatedAtIso,
    fetchedAt: null,
    freshForMinutes: defaultRegion.externalFreshnessMinutes,
    validation: options.validation,
    recordCount: 0,
    retryAt: options.retryAt,
    reason: options.reason,
    aircraft: [],
  };
}

export function validateAircraftSnapshot(
  payload: unknown,
  nowIso: string,
): { snapshot: AircraftSnapshot; aircraft: Aircraft[] } {
  const snapshot = aircraftSnapshotSchema.parse(payload) as AircraftSnapshot;
  if (snapshot.availability !== 'available') {
    throw new Error(snapshot.reason);
  }
  const nowMs = Date.parse(nowIso);
  const fetchedAtMs = Date.parse(snapshot.fetchedAt ?? '');
  const generatedAtMs = Date.parse(snapshot.generatedAt ?? '');
  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(fetchedAtMs) ||
    !Number.isFinite(generatedAtMs) ||
    fetchedAtMs > nowMs + externalAircraftPolicy.futureToleranceMinutes * 60_000 ||
    generatedAtMs > nowMs + externalAircraftPolicy.futureToleranceMinutes * 60_000
  ) {
    throw new Error('Snapshot timestamp is invalid or in the future.');
  }
  if (nowMs - fetchedAtMs > snapshot.freshForMinutes * 60_000) {
    throw new Error('Snapshot is stale.');
  }
  const aircraft: Aircraft[] = snapshot.aircraft.map((record) => ({
    id: record.id,
    callsign: record.callsign,
    latitude: record.latitude,
    longitude: record.longitude,
    altitudeFt: record.altitudeFt,
    groundSpeedKt: record.groundSpeedKt,
    headingDeg: record.headingDeg,
    verticalRateFpm: record.verticalRateFpm,
    phase: 'Unavailable',
    severity: 'Normal',
    simulatedFuelMinutes: null,
    aircraftCategory: 'Unavailable',
    initialFuelKg: null,
    fuelBurnKgPerHour: null,
    elapsedFlightMinutes: null,
    simulatedEmergency: false,
    status: record.status,
    source: {
      mode: 'External',
      provider: 'adsb.fi',
      observedAtIso: record.observedAtIso,
      fetchedAtIso: snapshot.fetchedAt ?? record.observedAtIso,
      freshness: 'Fresh',
      limitation:
        'Public near-live snapshot; coverage, latency, identity, position, and intent may be incomplete or inaccurate.',
    },
  }));
  return { snapshot, aircraft };
}

export function readUnavailableAircraftSnapshot(payload: unknown): AircraftSnapshot | null {
  const result = aircraftSnapshotSchema.safeParse(payload);
  return result.success && result.data.availability === 'unavailable' ? result.data : null;
}
