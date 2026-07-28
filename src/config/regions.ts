import type { RegionConfiguration } from '../domain/types';

export const regions = {
  lucknow: {
    id: 'lucknow',
    displayName: 'Lucknow demonstration region',
    center: {
      latitude: 26.8467,
      longitude: 80.9462,
    },
    bounds: {
      north: 27.22,
      south: 26.48,
      east: 81.39,
      west: 80.5,
    },
    defaultZoom: 9,
    aircraftLimit: 12,
    externalSnapshotRadiusNm: 45,
    externalFreshnessMinutes: 30,
    runway: {
      id: 'SIM-09',
      reciprocalId: 'SIM-27',
      headingDeg: 90,
      reciprocalHeadingDeg: 270,
      label: 'Simulated runway 09/27',
    },
  },
} as const satisfies Record<string, RegionConfiguration>;

export const defaultRegion = regions.lucknow;
