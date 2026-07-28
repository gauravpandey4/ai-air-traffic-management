import { defaultRegion } from '../config/regions';

import { parseOpenMeteoWeather } from './weather';
import type { WeatherSnapshot } from './types';

export const weatherCachePolicy = {
  freshForMs: 15 * 60_000,
  timeoutMs: 8_000,
  cacheKey: 'futureatc.weather.open-meteo.v1',
  cooldownKey: 'futureatc.weather.cooldown.v1',
} as const;

export const openMeteoUrl = new URL('https://api.open-meteo.com/v1/forecast');
openMeteoUrl.search = new URLSearchParams({
  latitude: String(defaultRegion.center.latitude),
  longitude: String(defaultRegion.center.longitude),
  current: 'weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,visibility',
  hourly: 'weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,visibility,precipitation',
  wind_speed_unit: 'kn',
  timezone: 'UTC',
  forecast_days: '2',
}).toString();

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Pick<Response, 'ok' | 'status' | 'headers' | 'json'>>;

type CachedPayload = {
  cachedAtIso: string;
  fetchedAtIso: string;
  payload: unknown;
};

export type WeatherLoadResult =
  | { kind: 'success'; snapshot: WeatherSnapshot }
  | { kind: 'fallback'; reason: string; retryAtIso: string | null };

function parseJson(value: string | null): unknown {
  if (value === null) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function readCachedPayload(storage: StorageLike, nowIso: string): CachedPayload | null {
  const value = parseJson(storage.getItem(weatherCachePolicy.cacheKey));
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const cachedAtIso = record.cachedAtIso;
  const fetchedAtIso = record.fetchedAtIso;
  const payload = record.payload;
  if (typeof cachedAtIso !== 'string' || typeof fetchedAtIso !== 'string') return null;
  const ageMs = Date.parse(nowIso) - Date.parse(cachedAtIso);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs >= weatherCachePolicy.freshForMs) {
    storage.removeItem(weatherCachePolicy.cacheKey);
    return null;
  }
  return { cachedAtIso, fetchedAtIso, payload };
}

function readCooldown(storage: StorageLike, nowIso: string): string | null {
  const value = parseJson(storage.getItem(weatherCachePolicy.cooldownKey));
  if (typeof value !== 'object' || value === null) return null;
  const retryAtIso = (value as Record<string, unknown>).retryAtIso;
  if (typeof retryAtIso !== 'string') {
    storage.removeItem(weatherCachePolicy.cooldownKey);
    return null;
  }
  const retryAtMs = Date.parse(retryAtIso);
  if (!Number.isFinite(retryAtMs) || retryAtMs <= Date.parse(nowIso)) {
    storage.removeItem(weatherCachePolicy.cooldownKey);
    return null;
  }
  return retryAtIso;
}

export function parseRetryAfter(value: string | null, nowMs: number): string | null {
  if (value === null || value.trim() === '') return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return new Date(nowMs + seconds * 1_000).toISOString();
  }
  const dateMs = Date.parse(value);
  return Number.isFinite(dateMs) && dateMs > nowMs ? new Date(dateMs).toISOString() : null;
}

export async function loadObservedWeather(options: {
  fetcher?: FetchLike;
  storage: StorageLike;
  now?: () => Date;
  timeoutMs?: number;
}): Promise<WeatherLoadResult> {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now?.() ?? new Date();
  const nowIso = now.toISOString();

  const cached = readCachedPayload(options.storage, nowIso);
  if (cached !== null) {
    try {
      return {
        kind: 'success',
        snapshot: {
          ...parseOpenMeteoWeather(cached.payload, cached.fetchedAtIso, nowIso),
          mode: 'Cached',
        },
      };
    } catch {
      options.storage.removeItem(weatherCachePolicy.cacheKey);
    }
  }

  const retryAtIso = readCooldown(options.storage, nowIso);
  if (retryAtIso !== null) {
    return {
      kind: 'fallback',
      reason: `Rate limited; retry is available after ${retryAtIso}.`,
      retryAtIso,
    };
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? weatherCachePolicy.timeoutMs,
  );
  try {
    const response = await fetcher(openMeteoUrl, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429) {
        const parsedRetryAt = parseRetryAfter(response.headers.get('Retry-After'), now.getTime());
        if (parsedRetryAt !== null) {
          options.storage.setItem(
            weatherCachePolicy.cooldownKey,
            JSON.stringify({ retryAtIso: parsedRetryAt }),
          );
        }
        return {
          kind: 'fallback',
          reason:
            parsedRetryAt === null
              ? 'Rate limited; provider unavailable, try again later.'
              : `Rate limited; retry is available after ${parsedRetryAt}.`,
          retryAtIso: parsedRetryAt,
        };
      }
      return {
        kind: 'fallback',
        reason: `Provider unavailable (HTTP ${String(response.status)}).`,
        retryAtIso: null,
      };
    }

    const payload = (await response.json()) as unknown;
    const fetchedAtIso = nowIso;
    const snapshot = parseOpenMeteoWeather(payload, fetchedAtIso, nowIso);
    options.storage.setItem(
      weatherCachePolicy.cacheKey,
      JSON.stringify({ cachedAtIso: nowIso, fetchedAtIso, payload }),
    );
    options.storage.removeItem(weatherCachePolicy.cooldownKey);
    return { kind: 'success', snapshot };
  } catch (error) {
    return {
      kind: 'fallback',
      reason:
        error instanceof DOMException && error.name === 'AbortError'
          ? 'Weather request timed out.'
          : error instanceof Error && /parse|invalid|weather|zod/i.test(error.message)
            ? 'Invalid weather response.'
            : 'Weather network request failed.',
      retryAtIso: null,
    };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
