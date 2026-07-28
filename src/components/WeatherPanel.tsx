import { CloudRain, CloudSun, Droplets, Eye, RefreshCw, Wind } from 'lucide-react';

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

export function WeatherPanel() {
  const { state, requestObservedWeather, selectSimulatedWeather } = useSimulator();
  const { weatherSnapshot: weather } = state;
  const checking = state.weatherMode === 'Checking';
  const external = weather.mode === 'Observed' || weather.mode === 'Cached';
  const modeLabel =
    state.weatherMode === 'Fallback'
      ? 'Simulated fallback'
      : state.weatherMode === 'Checking'
        ? 'Checking'
        : weather.mode;

  return (
    <section className="panel weather-panel" aria-labelledby="weather-panel-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Current and short outlook</p>
          <h2 id="weather-panel-title">Weather support</h2>
        </div>
        <div className="weather-badges">
          <span className="status-badge status-badge--simulation">{modeLabel}</span>
          <span className={`weather-risk weather-risk-${weather.risk.severity.toLowerCase()}`}>
            {weather.risk.severity} risk
          </span>
        </div>
      </div>

      <div className="weather-content">
        <div className="weather-current">
          <div className="weather-summary">
            <CloudSun aria-hidden="true" size={28} />
            <div>
              <strong>{weather.risk.severity}</strong>
              <span>{weather.risk.trend} outlook</span>
            </div>
          </div>
          <dl className="weather-metrics">
            <div>
              <dt>
                <Wind aria-hidden="true" size={16} />
                Wind
              </dt>
              <dd>
                {weather.current.windSpeedKt.toFixed(1)} kt ·{' '}
                {weather.current.windDirectionDeg.toFixed(0)}°
              </dd>
            </div>
            <div>
              <dt>
                <CloudRain aria-hidden="true" size={16} />
                Gust
              </dt>
              <dd>{weather.current.windGustKt.toFixed(1)} kt</dd>
            </div>
            <div>
              <dt>
                <Eye aria-hidden="true" size={16} />
                Visibility
              </dt>
              <dd>{weather.current.visibilityKm.toFixed(1)} km</dd>
            </div>
            <div>
              <dt>
                <Droplets aria-hidden="true" size={16} />
                Precipitation (previous hour)
              </dt>
              <dd>{weather.current.precipitationMmPerHour.toFixed(1)} mm/h avg</dd>
            </div>
          </dl>

          <div className="weather-provenance">
            <strong>
              {weather.mode} · {weather.provider}
            </strong>
            {external ? (
              <span>
                Observation {formatUtc(weather.current.timeIso)} UTC · fetched{' '}
                {formatUtc(weather.fetchedAtIso)} UTC · {formatAge(weather.fetchedAtIso)}
              </span>
            ) : (
              <span>
                Scenario weather time {formatUtc(weather.current.timeIso)} UTC · deterministic seed
                snapshot
              </span>
            )}
            <p>{weather.limitation}</p>
            {external ? (
              <p>
                <a href="https://open-meteo.com/" rel="noreferrer" target="_blank">
                  Weather data by Open-Meteo.com
                </a>{' '}
                · Risk derived by FutureATC Lab.
              </p>
            ) : null}
          </div>
        </div>

        <div className="weather-outlook">
          <h3>Hourly outlook</h3>
          <div className="forecast-strip">
            {weather.outlook.slice(0, 4).map((observation) => (
              <article key={observation.timeIso}>
                <time dateTime={observation.timeIso}>
                  {new Date(observation.timeIso).toLocaleTimeString('en-IN', {
                    timeZone: 'UTC',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}{' '}
                  UTC
                </time>
                <strong>{observation.windSpeedKt.toFixed(0)} kt</strong>
                <span>Gust {observation.windGustKt.toFixed(0)} kt</span>
                <span>{observation.visibilityKm.toFixed(1)} km vis</span>
                <span>{observation.precipitationMmPerHour.toFixed(1)} mm/h avg</span>
              </article>
            ))}
          </div>

          <div className="weather-factors">
            <h3>Why this risk?</h3>
            <ul>
              {weather.risk.factors.map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </ul>
            <details className="explanation-details">
              <summary>Rule, limitation, and human review</summary>
              <div className="explanation-content">
                <p>
                  <strong>Rule:</strong> {weather.risk.explanation.rule}
                </p>
                <p>
                  <strong>Result:</strong> {weather.risk.explanation.result}
                </p>
                <p>
                  <strong>Limitation:</strong> {weather.risk.explanation.limitation}
                </p>
                <p>
                  <strong>Human review:</strong> {weather.risk.explanation.humanAction}
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="weather-actions">
        <p role="status">{state.weatherStatus}</p>
        {state.weatherRetryAtIso === null ? null : (
          <p>
            Retry after{' '}
            <time dateTime={state.weatherRetryAtIso}>{formatUtc(state.weatherRetryAtIso)} UTC</time>
          </p>
        )}
        <div>
          <button
            type="button"
            className="primary-action"
            disabled={checking}
            onClick={() => void requestObservedWeather()}
          >
            <RefreshCw aria-hidden="true" size={16} />
            {checking ? 'Checking weather…' : 'Check observed weather'}
          </button>
          <button type="button" onClick={selectSimulatedWeather}>
            Use simulated weather
          </button>
        </div>
        <span>
          Aircraft:{' '}
          {state.aircraftMode === 'External Active'
            ? 'External near-live snapshot'
            : state.aircraftMode === 'Checking'
              ? 'Checking'
              : 'Simulated'}{' '}
          · Weather: {modeLabel}. Sources are not mixed silently.
        </span>
      </div>
    </section>
  );
}
