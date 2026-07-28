import { Database, RefreshCw, RotateCcw } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';

function formatUtc(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatAge(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  return minutes < 1 ? 'less than 1 min old' : `${String(minutes)} min old`;
}

export function AircraftDataPanel() {
  const { state, requestExternalAircraft, selectSimulatedAircraft } = useSimulator();
  const checking = state.aircraftMode === 'Checking';
  const external = state.aircraftMode === 'External Active';
  const snapshot = state.externalSnapshot;
  const weatherLabel =
    state.weatherMode === 'Fallback'
      ? 'Simulated fallback'
      : state.weatherMode === 'Checking'
        ? 'Checking'
        : state.weatherSnapshot.mode;

  return (
    <section className="panel aircraft-data-panel" aria-labelledby="aircraft-data-title">
      <div>
        <Database aria-hidden="true" size={22} />
        <div>
          <p className="eyebrow">Atomic dataset selection</p>
          <h2 id="aircraft-data-title">
            {external ? 'Near-live aircraft snapshot' : 'Simulation aircraft'}
          </h2>
        </div>
      </div>
      <div className="aircraft-data-copy">
        <p role="status">{state.aircraftStatus}</p>
        {external && snapshot?.fetchedAt !== null && snapshot?.fetchedAt !== undefined ? (
          <>
            <p>
              <strong>Fresh · adsb.fi regional snapshot</strong>
              <br />
              Fetched <time dateTime={snapshot.fetchedAt}>
                {formatUtc(snapshot.fetchedAt)} UTC
              </time>{' '}
              · {formatAge(snapshot.fetchedAt)} · {String(snapshot.recordCount)} records
            </p>
            <p>
              <a href="https://adsb.fi/" rel="noreferrer" target="_blank">
                Aircraft data by adsb.fi
              </a>{' '}
              ·{' '}
              <a href="https://github.com/adsbfi/opendata" rel="noreferrer" target="_blank">
                terms and limitations
              </a>
            </p>
          </>
        ) : null}
        {state.aircraftRetryAtIso === null ? null : (
          <p>
            Retry after{' '}
            <time dateTime={state.aircraftRetryAtIso}>
              {formatUtc(state.aircraftRetryAtIso)} UTC
            </time>
          </p>
        )}
        <p>
          Aircraft: {external ? 'External near-live snapshot' : checking ? 'Checking' : 'Simulated'}{' '}
          · Weather: {weatherLabel}. Sources are identified independently.
        </p>
      </div>
      <div className="aircraft-data-actions">
        <button
          type="button"
          className="primary-action"
          disabled={checking}
          onClick={() => void requestExternalAircraft()}
        >
          <RefreshCw aria-hidden="true" size={16} />
          {checking ? 'Checking snapshot…' : 'Check aircraft snapshot'}
        </button>
        <button type="button" onClick={selectSimulatedAircraft}>
          <RotateCcw aria-hidden="true" size={16} />
          Use simulation aircraft
        </button>
      </div>
    </section>
  );
}
