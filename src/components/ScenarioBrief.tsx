import { CircleDot, CloudSun, Fingerprint, Timer } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';
import { scenarios } from '../domain/scenarios';

export function ScenarioBrief() {
  const { state, simulationTimestamp } = useSimulator();
  const scenario = scenarios[state.scenarioId];

  return (
    <section className="panel scenario-brief" aria-labelledby="scenario-brief-title">
      <div>
        <p className="eyebrow">Active deterministic exercise</p>
        <h2 id="scenario-brief-title">{scenario.name}</h2>
        <p>{scenario.summary}</p>
      </div>
      <dl>
        <div>
          <CircleDot aria-hidden="true" size={16} />
          <dt>Situation</dt>
          <dd>{scenario.situation}</dd>
        </div>
        <div>
          <CloudSun aria-hidden="true" size={16} />
          <dt>Weather</dt>
          <dd>{scenario.weatherLabel}</dd>
        </div>
        <div>
          <Fingerprint aria-hidden="true" size={16} />
          <dt>Seed</dt>
          <dd>{scenario.seed}</dd>
        </div>
        <div>
          <Timer aria-hidden="true" size={16} />
          <dt>Clock</dt>
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
