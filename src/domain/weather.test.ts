import { createOpenMeteoFixture, weatherNowIso } from '../test/weather-fixture';

import { classifyWeatherRisk, createSimulatedWeather, parseOpenMeteoWeather } from './weather';
import type { WeatherObservation } from './types';

const base: WeatherObservation = {
  timeIso: weatherNowIso,
  windSpeedKt: 10,
  windGustKt: 15,
  windDirectionDeg: 80,
  visibilityKm: 12,
  precipitationMmPerHour: 0,
  weatherCode: 0,
};

describe('weather risk classification', () => {
  it.each([
    [{ windGustKt: 34.999 }, 'Elevated'],
    [{ windGustKt: 35 }, 'Severe'],
    [{ visibilityKm: 3 }, 'Elevated'],
    [{ visibilityKm: 2.999 }, 'Severe'],
    [{ precipitationMmPerHour: 7.499 }, 'Elevated'],
    [{ precipitationMmPerHour: 7.5 }, 'Severe'],
    [{ weatherCode: 95 }, 'Severe'],
    [{ windSpeedKt: 19.999 }, 'Normal'],
    [{ windSpeedKt: 20 }, 'Elevated'],
    [{ windGustKt: 24.999 }, 'Normal'],
    [{ windGustKt: 25 }, 'Elevated'],
    [{ visibilityKm: 8 }, 'Normal'],
    [{ visibilityKm: 7.999 }, 'Elevated'],
    [{ precipitationMmPerHour: 2.499 }, 'Normal'],
    [{ precipitationMmPerHour: 2.5 }, 'Elevated'],
    [{ weatherCode: 61 }, 'Elevated'],
  ] as const)('classifies boundary override %o as %s', (override, expected) => {
    expect(classifyWeatherRisk({ ...base, ...override }, []).severity).toBe(expected);
  });

  it('retains every contributing factor while selecting maximum severity', () => {
    const result = classifyWeatherRisk(
      {
        ...base,
        windSpeedKt: 25,
        windGustKt: 40,
        visibilityKm: 2,
        precipitationMmPerHour: 8,
        weatherCode: 95,
      },
      [],
    );
    expect(result.severity).toBe('Severe');
    expect(result.factors).toHaveLength(5);
    expect(result.explanation.rule).toMatch(/maximum-severity/i);
  });

  it('classifies improving, stable, and deteriorating forecast trends', () => {
    const severe = { ...base, windGustKt: 40 };
    const elevated = { ...base, windSpeedKt: 22 };
    expect(classifyWeatherRisk(base, [elevated]).trend).toBe('Deteriorating');
    expect(classifyWeatherRisk(severe, [base]).trend).toBe('Improving');
    expect(classifyWeatherRisk(base, [base]).trend).toBe('Stable');
  });

  it('reproduces seeded scenarios and guarantees severe weather', () => {
    expect(createSimulatedWeather('normal-traffic')).toEqual(
      createSimulatedWeather('normal-traffic'),
    );
    expect(createSimulatedWeather('severe-weather').risk.severity).toBe('Severe');
    expect(createSimulatedWeather('normal-traffic').mode).toBe('Simulated');
  });
});

describe('Open-Meteo normalization', () => {
  it('validates, normalizes units, selects future hours, and attributes the provider', () => {
    const fixture = createOpenMeteoFixture();
    fixture.hourly.precipitation[0] = 1.25;
    const snapshot = parseOpenMeteoWeather(fixture, weatherNowIso, weatherNowIso);
    expect(snapshot.mode).toBe('Observed');
    expect(snapshot.provider).toBe('Open-Meteo');
    expect(snapshot.current.visibilityKm).toBe(15);
    expect(snapshot.current.precipitationMmPerHour).toBe(1.25);
    expect(snapshot.outlook).toHaveLength(3);
    expect(snapshot.outlook[0]?.timeIso).toBe('2026-07-28T19:00:00.000Z');
  });

  it('accepts the provider GMT label as equivalent to requested UTC', () => {
    const fixture = createOpenMeteoFixture();
    fixture.timezone = 'GMT';
    expect(parseOpenMeteoWeather(fixture, weatherNowIso, weatherNowIso).mode).toBe('Observed');
  });

  it.each([
    ['coordinate', (fixture: ReturnType<typeof createOpenMeteoFixture>) => (fixture.latitude = 40)],
    [
      'unit',
      (fixture: ReturnType<typeof createOpenMeteoFixture>) =>
        (fixture.current_units.visibility = 'km'),
    ],
    [
      'array length',
      (fixture: ReturnType<typeof createOpenMeteoFixture>) => fixture.hourly.visibility.pop(),
    ],
    [
      'numeric range',
      (fixture: ReturnType<typeof createOpenMeteoFixture>) =>
        (fixture.hourly.wind_speed_10m[1] = 500),
    ],
    [
      'timestamp',
      (fixture: ReturnType<typeof createOpenMeteoFixture>) =>
        (fixture.current.time = '2026-07-28T10:00'),
    ],
    [
      'forecast validity',
      (fixture: ReturnType<typeof createOpenMeteoFixture>) =>
        (fixture.hourly.time = ['2026-07-28T18:00']),
    ],
    [
      'preceding-hour precipitation',
      (fixture: ReturnType<typeof createOpenMeteoFixture>) =>
        (fixture.hourly.time = [
          '2026-07-28T19:00',
          '2026-07-28T20:00',
          '2026-07-28T21:00',
          '2026-07-28T22:00',
        ]),
    ],
  ])('rejects invalid %s data', (_label, mutate) => {
    const fixture = createOpenMeteoFixture();
    mutate(fixture);
    expect(() => parseOpenMeteoWeather(fixture, weatherNowIso, weatherNowIso)).toThrow();
  });
});
