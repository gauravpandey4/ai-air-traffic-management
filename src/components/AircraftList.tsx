import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';

function TrendIcon({ verticalRateFpm }: { verticalRateFpm: number }) {
  if (verticalRateFpm > 0) {
    return <ArrowUp aria-hidden="true" size={14} />;
  }
  if (verticalRateFpm < 0) {
    return <ArrowDown aria-hidden="true" size={14} />;
  }
  return <ArrowRight aria-hidden="true" size={14} />;
}

export function AircraftList() {
  const { state, aircraft: displayedAircraft, dispatch } = useSimulator();

  return (
    <section className="panel aircraft-list-panel" aria-labelledby="aircraft-list-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Equivalent text view</p>
          <h2 id="aircraft-list-title">Synthetic aircraft</h2>
        </div>
        <span className="count-badge">{displayedAircraft.length}</span>
      </div>

      <div className="aircraft-table-wrap">
        <table className="aircraft-table">
          <thead>
            <tr>
              <th scope="col">Flight</th>
              <th scope="col">Altitude</th>
              <th scope="col">Speed</th>
              <th scope="col">Heading</th>
              <th scope="col">Trend</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayedAircraft.map((aircraft) => {
              const selected = aircraft.id === state.selectedAircraftId;
              return (
                <tr className={selected ? 'is-selected' : undefined} key={aircraft.id}>
                  <th scope="row" data-label="Flight">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        dispatch({ type: 'aircraft-selected', aircraftId: aircraft.id })
                      }
                    >
                      {aircraft.callsign}
                    </button>
                  </th>
                  <td data-label="Altitude">{aircraft.altitudeFt.toLocaleString()} ft</td>
                  <td data-label="Speed">{aircraft.groundSpeedKt} kt</td>
                  <td data-label="Heading">{aircraft.headingDeg}°</td>
                  <td data-label="Trend">
                    <span className="trend-value">
                      <TrendIcon verticalRateFpm={aircraft.verticalRateFpm} />
                      {aircraft.verticalRateFpm === 0
                        ? 'Level'
                        : `${aircraft.verticalRateFpm > 0 ? '+' : ''}${aircraft.verticalRateFpm.toLocaleString()}`}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className="aircraft-state">{aircraft.status}</span>
                    <span className={`severity-label severity-${aircraft.severity.toLowerCase()}`}>
                      {aircraft.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
