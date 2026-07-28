import { readUnavailableAircraftSnapshot, validateAircraftSnapshot } from './external-aircraft';
import type { Aircraft, AircraftSnapshot } from './types';

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>;

export type AircraftSnapshotLoadResult =
  | { kind: 'success'; snapshot: AircraftSnapshot; aircraft: Aircraft[] }
  | { kind: 'fallback'; reason: string; retryAtIso: string | null };

export async function loadAircraftSnapshot(
  options: {
    fetcher?: FetchLike;
    now?: () => Date;
    url?: string;
  } = {},
): Promise<AircraftSnapshotLoadResult> {
  const fetcher = options.fetcher ?? fetch;
  const url = options.url ?? `${import.meta.env.BASE_URL}data/aircraft-snapshot.json`;
  try {
    const response = await fetcher(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return {
        kind: 'fallback',
        reason: `Snapshot unavailable (HTTP ${String(response.status)}).`,
        retryAtIso: null,
      };
    }
    const payload = (await response.json()) as unknown;
    const unavailable = readUnavailableAircraftSnapshot(payload);
    if (unavailable !== null) {
      return {
        kind: 'fallback',
        reason: unavailable.reason,
        retryAtIso: unavailable.retryAt,
      };
    }
    const result = validateAircraftSnapshot(payload, (options.now?.() ?? new Date()).toISOString());
    return { kind: 'success', ...result };
  } catch (error) {
    return {
      kind: 'fallback',
      reason:
        error instanceof Error && /stale/i.test(error.message)
          ? 'Snapshot is stale.'
          : error instanceof TypeError
            ? 'Snapshot network request failed.'
            : 'Invalid snapshot response.',
      retryAtIso: null,
    };
  }
}
