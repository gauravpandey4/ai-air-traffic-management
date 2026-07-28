import { z } from 'zod';

import { defaultRegion } from '../config/regions';

import { createSeededRandom } from './random';
import { scenarios } from './scenarios';
import type {
  ScenarioId,
  WeatherObservation,
  WeatherRisk,
  WeatherRiskAssessment,
  WeatherSnapshot,
} from './types';

export const weatherThresholds = {
  severe: {
    gustKt: 35,
    visibilityKm: 3,
    precipitationMmPerHour: 7.5,
    weatherCodes: [95, 96, 99],
  },
  elevated: {
    windSpeedKt: 20,
    gustKt: 25,
    visibilityKm: 8,
    precipitationMmPerHour: 2.5,
    weatherCodes: [51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82],
  },
  observationMaximumAgeHours: 3,
  observationFutureToleranceMinutes: 10,
} as const;

const weatherRiskRank = { Normal: 0, Elevated: 1, Severe: 2 } as const;

function severityAndFactors(observation: WeatherObservation): {
  severity: WeatherRisk;
  factors: string[];
} {
  const severe: string[] = [];
  const elevated: string[] = [];

  if (observation.windGustKt >= weatherThresholds.severe.gustKt) {
    severe.push(
      `Gust ${observation.windGustKt.toFixed(1)} kt ≥ ${String(weatherThresholds.severe.gustKt)} kt`,
    );
  } else if (observation.windGustKt >= weatherThresholds.elevated.gustKt) {
    elevated.push(
      `Gust ${observation.windGustKt.toFixed(1)} kt ≥ ${String(weatherThresholds.elevated.gustKt)} kt`,
    );
  }
  if (observation.visibilityKm < weatherThresholds.severe.visibilityKm) {
    severe.push(
      `Visibility ${observation.visibilityKm.toFixed(1)} km < ${String(weatherThresholds.severe.visibilityKm)} km`,
    );
  } else if (observation.visibilityKm < weatherThresholds.elevated.visibilityKm) {
    elevated.push(
      `Visibility ${observation.visibilityKm.toFixed(1)} km < ${String(weatherThresholds.elevated.visibilityKm)} km`,
    );
  }
  if (observation.precipitationMmPerHour >= weatherThresholds.severe.precipitationMmPerHour) {
    severe.push(
      `Precipitation ${observation.precipitationMmPerHour.toFixed(1)} mm/h ≥ ${String(weatherThresholds.severe.precipitationMmPerHour)} mm/h`,
    );
  } else if (
    observation.precipitationMmPerHour >= weatherThresholds.elevated.precipitationMmPerHour
  ) {
    elevated.push(
      `Precipitation ${observation.precipitationMmPerHour.toFixed(1)} mm/h ≥ ${String(weatherThresholds.elevated.precipitationMmPerHour)} mm/h`,
    );
  }
  if (weatherThresholds.severe.weatherCodes.includes(observation.weatherCode as 95)) {
    severe.push(`WMO code ${String(observation.weatherCode)} indicates thunderstorm conditions`);
  } else if (weatherThresholds.elevated.weatherCodes.includes(observation.weatherCode as 51)) {
    elevated.push(`WMO code ${String(observation.weatherCode)} indicates adverse weather`);
  }
  if (observation.windSpeedKt >= weatherThresholds.elevated.windSpeedKt) {
    elevated.push(
      `Wind ${observation.windSpeedKt.toFixed(1)} kt ≥ ${String(weatherThresholds.elevated.windSpeedKt)} kt`,
    );
  }

  if (severe.length > 0) return { severity: 'Severe', factors: [...severe, ...elevated] };
  if (elevated.length > 0) return { severity: 'Elevated', factors: elevated };
  return {
    severity: 'Normal',
    factors: ['All evaluated observations remain below the educational risk thresholds.'],
  };
}

export function classifyWeatherRisk(
  current: WeatherObservation,
  outlook: readonly WeatherObservation[],
): WeatherRiskAssessment {
  const currentResult = severityAndFactors(current);
  const futureSeverities = outlook.map((observation) => severityAndFactors(observation).severity);
  const maximumFutureRank = futureSeverities.reduce<number>(
    (maximum, severity) => Math.max(maximum, weatherRiskRank[severity]),
    weatherRiskRank[currentResult.severity],
  );
  const allFutureLower =
    outlook.length > 0 &&
    futureSeverities.every(
      (severity) => weatherRiskRank[severity] < weatherRiskRank[currentResult.severity],
    );
  const trend =
    maximumFutureRank > weatherRiskRank[currentResult.severity]
      ? 'Deteriorating'
      : allFutureLower
        ? 'Improving'
        : 'Stable';

  return {
    severity: currentResult.severity,
    factors: currentResult.factors,
    trend,
    explanation: {
      facts: [
        `Wind ${current.windSpeedKt.toFixed(1)} kt; gust ${current.windGustKt.toFixed(1)} kt`,
        `Visibility ${current.visibilityKm.toFixed(1)} km`,
        `Precipitation ${current.precipitationMmPerHour.toFixed(1)} mm/h`,
        `WMO weather code ${String(current.weatherCode)}`,
      ],
      source: 'Weather observations with FutureATC educational risk classification',
      rule: 'Maximum-severity model: Severe at gust ≥35 kt, visibility <3 km, precipitation ≥7.5 mm/h, or thunderstorm code; Elevated at wind ≥20 kt, gust ≥25 kt, visibility <8 km, precipitation ≥2.5 mm/h, or moderate adverse code.',
      result: `${currentResult.severity} weather risk · ${trend} outlook`,
      factors: currentResult.factors,
      limitation:
        'Educational simplification: omits airport procedures, runway condition codes, aircraft performance, microbursts, radar, NOTAMs, and controller reports.',
      humanAction: 'A human controller must consult authoritative aviation weather and procedures.',
    },
  };
}

function round(value: number, places = 1): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

export function createSimulatedWeather(scenarioId: ScenarioId): WeatherSnapshot {
  const scenario = scenarios[scenarioId];
  const random = createSeededRandom(`weather:${scenario.seed}`);
  const base: WeatherObservation =
    scenarioId === 'severe-weather'
      ? {
          timeIso: scenario.epochIso,
          windSpeedKt: 28,
          windGustKt: 42,
          windDirectionDeg: 210,
          visibilityKm: 2.4,
          precipitationMmPerHour: 8.2,
          weatherCode: 95,
        }
      : {
          timeIso: scenario.epochIso,
          windSpeedKt: round(7 + random.next() * 9),
          windGustKt: round(12 + random.next() * 8),
          windDirectionDeg: round(random.next() * 359, 0),
          visibilityKm: round(12 + random.next() * 10),
          precipitationMmPerHour: 0,
          weatherCode: 0,
        };
  const outlook = Array.from({ length: 4 }, (_, index): WeatherObservation => ({
    ...base,
    timeIso: new Date(Date.parse(scenario.epochIso) + (index + 1) * 3_600_000).toISOString(),
    windSpeedKt: round(Math.max(0, base.windSpeedKt + random.next() * 4 - 2)),
    windGustKt: round(Math.max(0, base.windGustKt + random.next() * 5 - 2.5)),
    windDirectionDeg: round((base.windDirectionDeg + random.next() * 20 + 350) % 360, 0),
    visibilityKm: round(Math.max(0.5, base.visibilityKm + random.next() * 2 - 1)),
    precipitationMmPerHour: round(Math.max(0, base.precipitationMmPerHour + random.next() - 0.5)),
  }));

  return {
    mode: 'Simulated',
    provider: 'FutureATC deterministic weather generator',
    current: base,
    outlook,
    risk: classifyWeatherRisk(base, outlook),
    fetchedAtIso: scenario.epochIso,
    generatedAtIso: scenario.epochIso,
    limitation: 'Synthetic weather generated for this educational scenario; it is not observed.',
  };
}

function numericArray(schema: z.ZodNumber) {
  return z.array(schema).min(1).max(168);
}
const timeArray = z.array(z.string().min(10).max(32)).min(1).max(168);

const openMeteoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.enum(['UTC', 'GMT']),
  current_units: z.object({
    wind_speed_10m: z.literal('kn'),
    wind_gusts_10m: z.literal('kn'),
    wind_direction_10m: z.literal('°'),
    visibility: z.literal('m'),
    weather_code: z.literal('wmo code'),
  }),
  current: z.object({
    time: z.string().min(10).max(32),
    wind_speed_10m: z.number().min(0).max(250),
    wind_gusts_10m: z.number().min(0).max(300),
    wind_direction_10m: z.number().min(0).max(360),
    visibility: z.number().min(0).max(200_000),
    weather_code: z.number().int().min(0).max(99),
  }),
  hourly_units: z.object({
    wind_speed_10m: z.literal('kn'),
    wind_gusts_10m: z.literal('kn'),
    wind_direction_10m: z.literal('°'),
    visibility: z.literal('m'),
    precipitation: z.literal('mm'),
    weather_code: z.literal('wmo code'),
  }),
  hourly: z.object({
    time: timeArray,
    wind_speed_10m: numericArray(z.number().min(0).max(250)),
    wind_gusts_10m: numericArray(z.number().min(0).max(300)),
    wind_direction_10m: numericArray(z.number().min(0).max(360)),
    visibility: numericArray(z.number().min(0).max(200_000)),
    precipitation: numericArray(z.number().min(0).max(500)),
    weather_code: numericArray(z.number().int().min(0).max(99)),
  }),
});

function normalizeUtcTime(value: string): string {
  const time = Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
  if (!Number.isFinite(time)) throw new Error('Invalid weather timestamp.');
  return new Date(time).toISOString();
}

function arrayValue(values: readonly number[], index: number, label: string): number {
  const value = values[index];
  if (value === undefined) throw new Error(`Missing hourly ${label} value.`);
  return value;
}

export function parseOpenMeteoWeather(
  payload: unknown,
  fetchedAtIso: string,
  nowIso: string,
): WeatherSnapshot {
  const parsed = openMeteoSchema.parse(payload);
  if (
    Math.abs(parsed.latitude - defaultRegion.center.latitude) > 1 ||
    Math.abs(parsed.longitude - defaultRegion.center.longitude) > 1
  ) {
    throw new Error('Weather coordinates are outside the configured region.');
  }
  const lengths = Object.values(parsed.hourly).map((values) => values.length);
  if (!lengths.every((length) => length === lengths[0])) {
    throw new Error('Weather hourly arrays have inconsistent lengths.');
  }

  const currentTimeIso = normalizeUtcTime(parsed.current.time);
  const currentAgeMs = Date.parse(nowIso) - Date.parse(currentTimeIso);
  if (
    currentAgeMs > weatherThresholds.observationMaximumAgeHours * 3_600_000 ||
    currentAgeMs < -weatherThresholds.observationFutureToleranceMinutes * 60_000
  ) {
    throw new Error('Weather observation timestamp is stale or in the future.');
  }
  const hourlyTimes = parsed.hourly.time.map(normalizeUtcTime);
  const precipitationIndex = hourlyTimes.reduce(
    (latestIndex, timeIso, index) =>
      Date.parse(timeIso) <= Date.parse(currentTimeIso) ? index : latestIndex,
    -1,
  );
  if (
    precipitationIndex < 0 ||
    Date.parse(currentTimeIso) - Date.parse(hourlyTimes[precipitationIndex] ?? '') > 3_600_000
  ) {
    throw new Error('Weather outlook has no matching preceding-hour precipitation value.');
  }
  const current: WeatherObservation = {
    timeIso: currentTimeIso,
    windSpeedKt: parsed.current.wind_speed_10m,
    windGustKt: parsed.current.wind_gusts_10m,
    windDirectionDeg: parsed.current.wind_direction_10m,
    visibilityKm: parsed.current.visibility / 1_000,
    precipitationMmPerHour: arrayValue(
      parsed.hourly.precipitation,
      precipitationIndex,
      'precipitation',
    ),
    weatherCode: parsed.current.weather_code,
  };
  const outlook = hourlyTimes
    .map((timeIso, index): WeatherObservation => ({
      timeIso,
      windSpeedKt: arrayValue(parsed.hourly.wind_speed_10m, index, 'wind speed'),
      windGustKt: arrayValue(parsed.hourly.wind_gusts_10m, index, 'gust'),
      windDirectionDeg: arrayValue(parsed.hourly.wind_direction_10m, index, 'wind direction'),
      visibilityKm: arrayValue(parsed.hourly.visibility, index, 'visibility') / 1_000,
      precipitationMmPerHour: arrayValue(parsed.hourly.precipitation, index, 'precipitation'),
      weatherCode: arrayValue(parsed.hourly.weather_code, index, 'weather code'),
    }))
    .filter((observation) => Date.parse(observation.timeIso) > Date.parse(currentTimeIso))
    .slice(0, 6);
  if (outlook.length === 0) throw new Error('Weather outlook has no future values.');

  return {
    mode: 'Observed',
    provider: 'Open-Meteo',
    current,
    outlook,
    risk: classifyWeatherRisk(current, outlook),
    fetchedAtIso: normalizeUtcTime(fetchedAtIso),
    generatedAtIso: currentTimeIso,
    limitation:
      'Public general forecast data; FutureATC derives the educational risk and it is not authoritative aviation weather.',
  };
}
