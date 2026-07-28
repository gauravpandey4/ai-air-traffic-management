import { defaultRegion } from '../config/regions';

import { createScenarioAircraft, isScenarioId, scenarioList, scenarios } from './scenarios';

describe('deterministic scenarios', () => {
  it('reproduces aircraft identity and starting state', () => {
    expect(createScenarioAircraft('normal-traffic')).toEqual(
      createScenarioAircraft('normal-traffic'),
    );
  });

  it('uses distinct seeds and clearly synthetic callsigns', () => {
    expect(new Set(scenarioList.map((scenario) => scenario.seed))).toHaveLength(
      scenarioList.length,
    );

    for (const scenario of scenarioList) {
      for (const aircraft of createScenarioAircraft(scenario.id)) {
        expect(aircraft.callsign).toMatch(/^SIM-[A-Z]{3}\d{2}$/);
      }
    }
  });

  it('constructs each required scenario outcome', () => {
    const collision = createScenarioAircraft('collision-risk');
    expect(collision[0]).toMatchObject({ headingDeg: 90, severity: 'Monitor' });
    expect(collision[1]).toMatchObject({ headingDeg: 270, severity: 'Monitor' });

    expect(
      createScenarioAircraft('low-fuel').some((aircraft) => aircraft.simulatedFuelMinutes < 15),
    ).toBe(true);
    expect(
      createScenarioAircraft('emergency').some((aircraft) => aircraft.simulatedEmergency),
    ).toBe(true);
    expect(scenarios['severe-weather'].weatherLabel).toMatch(/severe/i);
  });

  it('keeps generated aircraft within the configured cap and bounds', () => {
    for (const scenario of scenarioList) {
      const aircraft = createScenarioAircraft(scenario.id);
      expect(aircraft.length).toBeLessThanOrEqual(defaultRegion.aircraftLimit);
      for (const item of aircraft) {
        expect(item.latitude).toBeGreaterThanOrEqual(defaultRegion.bounds.south);
        expect(item.latitude).toBeLessThanOrEqual(defaultRegion.bounds.north);
        expect(item.longitude).toBeGreaterThanOrEqual(defaultRegion.bounds.west);
        expect(item.longitude).toBeLessThanOrEqual(defaultRegion.bounds.east);
      }
    }
  });

  it('validates scenario identifiers', () => {
    expect(isScenarioId('normal-traffic')).toBe(true);
    expect(isScenarioId('not-a-scenario')).toBe(false);
  });
});
