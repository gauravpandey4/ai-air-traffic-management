export const weatherNowIso = '2026-07-28T18:00:00.000Z';

export function createOpenMeteoFixture() {
  return {
    latitude: 26.85,
    longitude: 80.95,
    timezone: 'UTC',
    current_units: {
      wind_speed_10m: 'kn',
      wind_gusts_10m: 'kn',
      wind_direction_10m: '°',
      visibility: 'm',
      weather_code: 'wmo code',
    },
    current: {
      time: '2026-07-28T18:00',
      wind_speed_10m: 12,
      wind_gusts_10m: 18,
      wind_direction_10m: 80,
      visibility: 15_000,
      weather_code: 0,
    },
    hourly_units: {
      wind_speed_10m: 'kn',
      wind_gusts_10m: 'kn',
      wind_direction_10m: '°',
      visibility: 'm',
      precipitation: 'mm',
      weather_code: 'wmo code',
    },
    hourly: {
      time: ['2026-07-28T18:00', '2026-07-28T19:00', '2026-07-28T20:00', '2026-07-28T21:00'],
      wind_speed_10m: [12, 14, 16, 18],
      wind_gusts_10m: [18, 20, 23, 26],
      wind_direction_10m: [80, 85, 90, 95],
      visibility: [15_000, 14_000, 12_000, 7_000],
      precipitation: [0, 0, 0.5, 2.5],
      weather_code: [0, 1, 2, 61],
    },
  };
}
