import { Pause, Play, RotateCcw } from 'lucide-react';

import { defaultRegion } from '../config/regions';
import { isScenarioId, scenarioList } from '../domain/scenarios';
import type { PlaybackRate } from '../domain/types';
import { useSimulator } from '../app/simulator-context';

const playbackRates: readonly PlaybackRate[] = [1, 2, 4];

export function SimulationControls() {
  const { state, dispatch } = useSimulator();
  const simulationControlsEnabled = state.aircraftMode === 'Simulation';

  return (
    <section className="control-strip" aria-label="Simulation controls">
      <label className="field-control">
        <span>Scenario</span>
        <select
          value={state.scenarioId}
          onChange={(event) => {
            if (isScenarioId(event.target.value)) {
              dispatch({ type: 'scenario-selected', scenarioId: event.target.value });
            }
          }}
        >
          {scenarioList.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-control">
        <span>Region</span>
        <select aria-describedby="region-note" defaultValue={defaultRegion.id}>
          <option value={defaultRegion.id}>{defaultRegion.displayName}</option>
        </select>
      </label>

      <div className="playback-controls">
        <button
          className="primary-action"
          type="button"
          disabled={!simulationControlsEnabled}
          aria-pressed={state.isPlaying}
          onClick={() => dispatch({ type: 'playback-toggled' })}
        >
          {state.isPlaying ? (
            <Pause aria-hidden="true" size={17} />
          ) : (
            <Play aria-hidden="true" size={17} />
          )}
          {state.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={() => dispatch({ type: 'simulation-reset' })}
        >
          <RotateCcw aria-hidden="true" size={17} />
          Reset
        </button>
      </div>

      <fieldset className="rate-control">
        <legend>Playback rate</legend>
        <div>
          {playbackRates.map((rate) => (
            <button
              type="button"
              key={rate}
              disabled={!simulationControlsEnabled}
              aria-pressed={state.playbackRate === rate}
              onClick={() => dispatch({ type: 'playback-rate-selected', playbackRate: rate })}
            >
              {rate}×
            </button>
          ))}
        </div>
      </fieldset>

      <p id="region-note" className="control-note">
        Configurable typed region · simulated runway data
      </p>
    </section>
  );
}
