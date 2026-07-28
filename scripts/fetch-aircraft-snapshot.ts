import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { defaultRegion } from '../src/config/regions.js';
import {
  createUnavailableAircraftSnapshot,
  normalizeProviderPayload,
} from '../src/domain/external-aircraft.js';
import type { AircraftSnapshot } from '../src/domain/types.js';

export const aircraftProviderUrl =
  `https://opendata.adsb.fi/api/v3/lat/${String(defaultRegion.center.latitude)}` +
  `/lon/${String(defaultRegion.center.longitude)}` +
  `/dist/${String(defaultRegion.externalSnapshotRadiusNm)}`;

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Pick<Response, 'ok' | 'status' | 'headers' | 'json'>>;

export function parseProviderRetry(
  retryAfter: string | null,
  rateLimitReset: string | null,
  nowMs: number,
): string | null {
  if (retryAfter !== null && retryAfter.trim() !== '') {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return new Date(nowMs + seconds * 1_000).toISOString();
    }
    const dateMs = Date.parse(retryAfter);
    if (Number.isFinite(dateMs) && dateMs > nowMs) {
      return new Date(dateMs).toISOString();
    }
  }
  if (rateLimitReset !== null && /^\d{10,13}$/u.test(rateLimitReset)) {
    const raw = Number(rateLimitReset);
    const resetMs = raw < 10_000_000_000 ? raw * 1_000 : raw;
    if (Number.isFinite(resetMs) && resetMs > nowMs) {
      return new Date(resetMs).toISOString();
    }
  }
  return null;
}

export function readCooldownRetryAt(payload: unknown): string | null {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('schemaVersion' in payload) ||
    payload.schemaVersion !== 1 ||
    !('retryAt' in payload) ||
    (payload.retryAt !== null && typeof payload.retryAt !== 'string')
  ) {
    return null;
  }
  if (payload.retryAt === null) return null;
  const retryAtMs = Date.parse(payload.retryAt);
  return Number.isFinite(retryAtMs) ? new Date(retryAtMs).toISOString() : null;
}

export async function fetchAircraftSnapshot(options: {
  fetcher: FetchLike;
  now: () => Date;
  cooldownState?: unknown;
  timeoutMs?: number;
}): Promise<AircraftSnapshot> {
  const now = options.now();
  const nowIso = now.toISOString();
  const cooldownRetryAt = readCooldownRetryAt(options.cooldownState);
  if (cooldownRetryAt !== null && Date.parse(cooldownRetryAt) > now.getTime()) {
    return createUnavailableAircraftSnapshot({
      generatedAtIso: nowIso,
      validation: 'rate-limited',
      reason: `Rate limited; retry is available after ${cooldownRetryAt}.`,
      retryAt: cooldownRetryAt,
    });
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => {
    controller.abort();
  }, options.timeoutMs ?? 10_000);
  try {
    const response = await options.fetcher(aircraftProviderUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FutureATC-Lab academic snapshot workflow',
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429) {
        const retryAt = parseProviderRetry(
          response.headers.get('Retry-After'),
          response.headers.get('X-RateLimit-Reset'),
          now.getTime(),
        );
        return createUnavailableAircraftSnapshot({
          generatedAtIso: nowIso,
          validation: 'rate-limited',
          reason:
            retryAt === null
              ? 'Rate limited; provider unavailable, try again later.'
              : `Rate limited; retry is available after ${retryAt}.`,
          retryAt,
        });
      }
      return createUnavailableAircraftSnapshot({
        generatedAtIso: nowIso,
        validation: 'provider-unavailable',
        reason: `Provider unavailable (HTTP ${String(response.status)}).`,
        retryAt: null,
      });
    }
    const payload = (await response.json()) as unknown;
    return normalizeProviderPayload(payload, nowIso);
  } catch (error) {
    return createUnavailableAircraftSnapshot({
      generatedAtIso: nowIso,
      validation:
        error instanceof DOMException && error.name === 'AbortError'
          ? 'provider-unavailable'
          : 'invalid-response',
      reason:
        error instanceof DOMException && error.name === 'AbortError'
          ? 'Provider request timed out.'
          : 'Provider response was unavailable or invalid.',
      retryAt: null,
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function main() {
  const outputPath = new URL('../public/data/aircraft-snapshot.json', import.meta.url);
  const cooldownDirectory = new URL('../.workflow-cache/', import.meta.url);
  const cooldownPath = new URL('aircraft-cooldown.json', cooldownDirectory);
  let cooldownState: unknown;
  try {
    cooldownState = JSON.parse(await readFile(cooldownPath, 'utf8')) as unknown;
  } catch {
    cooldownState = undefined;
  }
  const snapshot = await fetchAircraftSnapshot({
    fetcher: fetch,
    now: () => new Date(),
    cooldownState,
  });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await mkdir(cooldownDirectory, { recursive: true });
  await writeFile(
    cooldownPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        retryAt: snapshot.validation === 'rate-limited' ? snapshot.retryAt : null,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(
    `Aircraft snapshot: ${snapshot.availability}; validation=${snapshot.validation}; records=${String(snapshot.recordCount)}.`,
  );
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
