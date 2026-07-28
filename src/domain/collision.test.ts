import {
  classifyConflict,
  conflictThresholds,
  positionToLocalNm,
  projectAllConflicts,
  projectConflict,
  velocityToNmPerSecond,
} from './collision';
import { createTestAircraft } from './test-fixtures';

describe('collision projection', () => {
  it('converts local coordinates and heading velocity in nautical units', () => {
    expect(positionToLocalNm(1, 1, 0, 0)).toEqual({ east: 60, north: 60 });
    const velocity = velocityToNmPerSecond(360, 90);
    expect(velocity.east).toBeCloseTo(0.1, 8);
    expect(velocity.north).toBeCloseTo(0, 8);
  });

  it.each([
    [4.999, 999, 'Critical'],
    [5, 999, 'Warning'],
    [5.001, 999, 'Warning'],
    [4.999, 1_000, 'Warning'],
    [4.999, 1_001, 'Warning'],
    [7.999, 1_999, 'Warning'],
    [8, 1_999, 'Monitor'],
    [8.001, 1_999, 'Monitor'],
    [7.999, 2_000, 'Monitor'],
    [7.999, 2_001, 'Monitor'],
    [11.999, 2_999, 'Monitor'],
    [12, 2_999, 'Normal'],
    [12.001, 2_999, 'Normal'],
    [11.999, 3_000, 'Normal'],
    [11.999, 3_001, 'Normal'],
  ] as const)(
    'classifies %.3f NM and %i ft as %s using strict boundaries',
    (horizontal, vertical, expected) => {
      expect(classifyConflict(horizontal, vertical)).toBe(expected);
    },
  );

  it('projects approaching tracks to a Critical CPA inside the horizon', () => {
    const first = createTestAircraft({ longitude: 80.8, headingDeg: 90 });
    const second = createTestAircraft({
      id: 'aircraft-b',
      callsign: 'SIM-TEST2',
      longitude: 81.1,
      altitudeFt: 10_400,
      headingDeg: 270,
    });
    const result = projectConflict(first, second);

    expect(result.severity).toBe('Critical');
    expect(result.timeToCpaSeconds).toBeGreaterThan(0);
    expect(result.timeToCpaSeconds).toBeLessThan(conflictThresholds.horizonSeconds);
    expect(result.horizontalSeparationNm).toBeLessThan(0.1);
    expect(result.explanation.facts).toHaveLength(3);
  });

  it('clamps diverging tracks to now and long-range tracks to ten minutes', () => {
    const first = createTestAircraft({ longitude: 80.8, headingDeg: 270 });
    const second = createTestAircraft({
      id: 'aircraft-b',
      callsign: 'SIM-TEST2',
      longitude: 81.1,
      headingDeg: 90,
    });
    expect(projectConflict(first, second).timeToCpaSeconds).toBe(0);

    const slowFirst = { ...first, longitude: 79, headingDeg: 90, groundSpeedKt: 60 };
    const slowSecond = { ...second, longitude: 83, headingDeg: 270, groundSpeedKt: 60 };
    expect(projectConflict(slowFirst, slowSecond).timeToCpaSeconds).toBe(600);
  });

  it('uses current separation for parallel or zero-relative-speed tracks', () => {
    const first = createTestAircraft();
    const second = createTestAircraft({
      id: 'aircraft-b',
      callsign: 'SIM-TEST2',
      longitude: first.longitude + 0.02,
    });
    const result = projectConflict(first, second);
    expect(result.timeToCpaSeconds).toBe(0);
    expect(result.explanation.factors[0]).toMatch(/effectively zero/i);
  });

  it('returns Insufficient data for an invalid required value', () => {
    const first = createTestAircraft({ headingDeg: Number.NaN });
    const second = createTestAircraft({ id: 'aircraft-b', callsign: 'SIM-TEST2' });
    const result = projectConflict(first, second);
    expect(result.severity).toBe('Insufficient data');
    expect(result.timeToCpaSeconds).toBeNull();
  });

  it('projects every unique pair and sorts higher severity first', () => {
    const aircraft = [
      createTestAircraft({ longitude: 80.8, headingDeg: 90 }),
      createTestAircraft({
        id: 'aircraft-b',
        callsign: 'SIM-TEST2',
        longitude: 81.1,
        headingDeg: 270,
      }),
      createTestAircraft({
        id: 'aircraft-c',
        callsign: 'SIM-TEST3',
        latitude: 30,
        longitude: 85,
      }),
    ];
    const results = projectAllConflicts(aircraft);
    expect(results).toHaveLength(3);
    expect(results[0]?.severity).toBe('Critical');
  });
});
