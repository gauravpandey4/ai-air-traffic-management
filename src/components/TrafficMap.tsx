import { lazy, Suspense, useCallback } from 'react';
import { Map, Radar } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';

import { SchematicMap } from './SchematicMap';

const LeafletMap = lazy(async () => {
  const module = await import('./LeafletMap');
  return { default: module.LeafletMap };
});

export function TrafficMap() {
  const { state, dispatch } = useSimulator();
  const selectAircraft = useCallback(
    (aircraftId: string) => dispatch({ type: 'aircraft-selected', aircraftId }),
    [dispatch],
  );
  const restoreSchematic = useCallback(
    (reason: string) => dispatch({ type: 'map-unavailable', reason }),
    [dispatch],
  );

  return (
    <section className="panel map-panel" aria-labelledby="traffic-map-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Traffic picture</p>
          <h2 id="traffic-map-title">
            {state.mapMode === 'connected' ? 'Connected map' : 'Local schematic'}
          </h2>
        </div>
        <div className="map-mode-control" aria-label="Map background">
          <button
            type="button"
            aria-pressed={state.mapMode === 'schematic'}
            onClick={() => dispatch({ type: 'map-mode-selected', mapMode: 'schematic' })}
          >
            <Radar aria-hidden="true" size={16} />
            Schematic
          </button>
          <button
            type="button"
            aria-pressed={state.mapMode === 'connected'}
            onClick={() => dispatch({ type: 'map-mode-selected', mapMode: 'connected' })}
          >
            <Map aria-hidden="true" size={16} />
            Connected
          </button>
        </div>
      </div>

      <div className="map-frame">
        {state.mapMode === 'connected' ? (
          <Suspense fallback={<div className="map-loading">Preparing connected map…</div>}>
            <LeafletMap
              aircraft={state.aircraft}
              selectedAircraftId={state.selectedAircraftId}
              onSelect={selectAircraft}
              onUnavailable={restoreSchematic}
            />
          </Suspense>
        ) : (
          <SchematicMap
            aircraft={state.aircraft}
            selectedAircraftId={state.selectedAircraftId}
            onSelect={selectAircraft}
          />
        )}
      </div>

      <div className="map-footer">
        <p role="status">{state.mapStatus}</p>
        {state.mapMode === 'connected' ? (
          <a href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">
            © OpenStreetMap contributors
          </a>
        ) : (
          <span>Offline-capable educational schematic</span>
        )}
      </div>
    </section>
  );
}
