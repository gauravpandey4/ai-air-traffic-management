import {
  Activity,
  Clock3,
  Database,
  Fuel,
  Gauge,
  Navigation,
  Plane,
  TrendingUp,
} from 'lucide-react';

import { useSimulator } from '../app/simulator-context';
import { getVerticalTrend } from '../domain/simulation';

type DetailItemProps = {
  label: string;
  value: string;
  unit?: string | undefined;
  icon: typeof Plane;
};

function DetailItem({ label, value, unit, icon: Icon }: DetailItemProps) {
  return (
    <div className="detail-item">
      <dt>
        <Icon aria-hidden="true" size={17} />
        <span>{label}</span>
      </dt>
      <dd>
        {value} {unit === undefined ? null : <span>{unit}</span>}
      </dd>
    </div>
  );
}

export function AircraftDetail() {
  const { selectedAircraft, simulationTimestamp, decisionSupport } = useSimulator();
  if (selectedAircraft === null) {
    return (
      <aside className="panel aircraft-detail-panel" aria-labelledby="aircraft-detail-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Selected aircraft</p>
            <h2 id="aircraft-detail-title">No aircraft in snapshot</h2>
          </div>
        </div>
        <p className="empty-decision-state">
          This is a valid fresh empty regional snapshot. Return to Simulation to explore synthetic
          aircraft scenarios.
        </p>
      </aside>
    );
  }
  const fuel = decisionSupport.fuelByAircraftId[selectedAircraft.id];
  const external = selectedAircraft.source.mode === 'External';

  return (
    <aside className="panel aircraft-detail-panel" aria-labelledby="aircraft-detail-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Selected aircraft</p>
          <h2 id="aircraft-detail-title">{selectedAircraft.callsign}</h2>
        </div>
        <span className={`severity-label severity-${selectedAircraft.severity.toLowerCase()}`}>
          {selectedAircraft.severity}
        </span>
      </div>

      <p className="aircraft-status">{selectedAircraft.status}</p>

      <dl className="detail-grid">
        <DetailItem icon={Plane} label="Phase" value={selectedAircraft.phase} />
        <DetailItem
          icon={Activity}
          label="Altitude"
          value={selectedAircraft.altitudeFt.toLocaleString()}
          unit="ft"
        />
        <DetailItem
          icon={Gauge}
          label="Ground speed"
          value={selectedAircraft.groundSpeedKt.toLocaleString()}
          unit="kt"
        />
        <DetailItem
          icon={Navigation}
          label="Heading"
          value={selectedAircraft.headingDeg.toLocaleString()}
          unit="degrees"
        />
        <DetailItem
          icon={TrendingUp}
          label="Vertical trend"
          value={getVerticalTrend(selectedAircraft)}
        />
        <DetailItem
          icon={Fuel}
          label="Fuel state"
          value={
            fuel === undefined || fuel.state === 'Unavailable'
              ? 'Unavailable'
              : `${fuel.state} · ${fuel.enduranceMinutes.toFixed(1)} min`
          }
          unit={external ? undefined : 'educational estimate'}
        />
        <DetailItem
          icon={Clock3}
          label={external ? 'Observed time' : 'Simulation time'}
          value={new Date(
            selectedAircraft.source.mode === 'External'
              ? selectedAircraft.source.observedAtIso
              : simulationTimestamp,
          ).toLocaleTimeString('en-IN', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
          unit="UTC"
        />
      </dl>

      <div className="provenance-card">
        <Database aria-hidden="true" size={18} />
        <div>
          <strong>{external ? 'External · Fresh' : 'Simulated · Fresh'}</strong>
          <span>
            {selectedAircraft.source.mode === 'External'
              ? selectedAircraft.source.provider
              : selectedAircraft.source.generator}
          </span>
          <p>{selectedAircraft.source.limitation}</p>
        </div>
      </div>
    </aside>
  );
}
