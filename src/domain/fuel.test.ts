import { assessAllFuel, assessFuel, classifyFuel } from './fuel';
import { createTestAircraft } from './test-fixtures';

describe('simulated fuel assessment', () => {
  it.each([
    [14.999, 'Critical'],
    [15, 'Low'],
    [15.001, 'Low'],
    [29.999, 'Low'],
    [30, 'Normal'],
    [30.001, 'Normal'],
  ] as const)('classifies %.3f minutes as %s', (minutes, expected) => {
    expect(classifyFuel(minutes)).toBe(expected);
  });

  it('subtracts deterministic burn over flight and simulation time', () => {
    const aircraft = createTestAircraft({
      initialFuelKg: 3_000,
      fuelBurnKgPerHour: 1_800,
      elapsedFlightMinutes: 40,
    });
    const result = assessFuel(aircraft, 600);
    expect(result.remainingFuelKg).toBe(1_500);
    expect(result.enduranceMinutes).toBe(50);
    expect(result.state).toBe('Normal');
    expect(result.explanation.rule).toMatch(/remaining fuel/i);
  });

  it('clamps exhausted fuel and marks a zero-burn profile unavailable', () => {
    expect(
      assessFuel(createTestAircraft({ initialFuelKg: 10, fuelBurnKgPerHour: 1_800 }), 3_600),
    ).toEqual(expect.objectContaining({ remainingFuelKg: 0, enduranceMinutes: 0 }));

    const unavailable = assessFuel(createTestAircraft({ fuelBurnKgPerHour: 0 }), 0);
    expect(unavailable.state).toBe('Unavailable');
    expect(unavailable.enduranceMinutes).toBe(Number.POSITIVE_INFINITY);
  });

  it('assesses a collection by stable aircraft id', () => {
    const first = createTestAircraft();
    const second = createTestAircraft({ id: 'aircraft-b', callsign: 'SIM-TEST2' });
    expect(Object.keys(assessAllFuel([first, second], 0))).toEqual(['aircraft-a', 'aircraft-b']);
  });
});
