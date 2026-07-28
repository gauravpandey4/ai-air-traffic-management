import { CircleDot, CloudSun, Fingerprint, Timer } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';
import { scenarios } from '../domain/scenarios';

export function ScenarioBrief() {
  const { state, simulationTimestamp } = useSimulator();
  const scenario = scenarios[state.scenarioId];
  const external = state.aircraftMode === 'External Active';
  const weatherContext =
    state.weatherMode === 'Checking'
      ? 'Weather check in progress'
      : state.weatherSnapshot.mode === 'Observed'
        ? `Observed ${state.weatherSnapshot.provider} context`
        : state.weatherSnapshot.mode === 'Cached'
          ? `Cached ${state.weatherSnapshot.provider} context`
          : scenario.weatherLabel;

  return (
    <section className="panel scenario-brief" aria-labelledby="scenario-brief-title">
      <div>
        <p className="eyebrow">
          {external ? 'External aircraft over simulation context' : 'Active deterministic exercise'}
        </p>
        <h2 id="scenario-brief-title">{scenario.name}</h2>
        <p>
          {external
            ? 'Aircraft tracks come only from the selected fresh external snapshot. This scenario remains the explicit simulation fallback and supplies the educational runway context plus any simulated weather context.'
            : scenario.summary}
        </p>
      </div>
      <dl>
        <div>
          <CircleDot aria-hidden="true" size={16} />
          <dt>Situation</dt>
          <dd>{external ? 'External regional observation' : scenario.situation}</dd>
        </div>
        <div>
          <CloudSun aria-hidden="true" size={16} />
          <dt>Weather</dt>
          <dd>{weatherContext}</dd>
        </div>
        <div>
          <Fingerprint aria-hidden="true" size={16} />
          <dt>{external ? 'Fallback seed' : 'Seed'}</dt>
          <dd>{scenario.seed}</dd>
        </div>
        <div>
          <Timer aria-hidden="true" size={16} />
          <dt>{external ? 'Fallback clock' : 'Clock'}</dt>
          <dd>
            <time dateTime={simulationTimestamp}>
              {new Date(simulationTimestamp).toLocaleTimeString('en-IN', {
                timeZone: 'UTC',
                hour12: false,
              })}{' '}
              UTC
            </time>
          </dd>
        </div>
      </dl>
    </section>
  );
}
