import { Activity, Gauge, Navigation, Plane, Siren, Waypoints } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';

const formatNumber = new Intl.NumberFormat('en-IN');

export function TrafficStatistics() {
  const { state, statistics, decisionSupport } = useSimulator();
  const external = state.aircraftMode === 'External Active';
  const items = [
    {
      label: 'Aircraft',
      value: formatNumber.format(statistics.totalAircraft),
      detail: `${String(statistics.airborneAircraft)} airborne`,
      icon: Plane,
    },
    {
      label: 'Arrivals',
      value: external ? 'Unavailable' : formatNumber.format(statistics.arrivals),
      detail: external ? 'Intent not supplied by snapshot' : 'Current simulated dataset',
      icon: Navigation,
    },
    {
      label: 'Average altitude',
      value: `${formatNumber.format(statistics.averageAltitudeFt)} ft`,
      detail: 'Derived from current aircraft',
      icon: Activity,
    },
    {
      label: 'Average speed',
      value: `${formatNumber.format(statistics.averageGroundSpeedKt)} kt`,
      detail: 'Derived from current aircraft',
      icon: Gauge,
    },
    {
      label: 'Fuel review',
      value: external ? 'Unavailable' : formatNumber.format(statistics.lowFuelAircraft),
      detail: external ? 'Fuel not supplied by snapshot' : 'Below 30 min estimated endurance',
      icon: Waypoints,
    },
    {
      label: 'Active alerts',
      value: formatNumber.format(decisionSupport.alerts.length),
      detail: 'Derived educational rules',
      icon: Activity,
    },
    {
      label: 'Emergencies',
      value: external ? 'Unavailable' : formatNumber.format(statistics.emergencies),
      detail: external ? 'Operational status not inferred' : 'Declared simulated events',
      icon: Siren,
    },
  ] as const;

  return (
    <section
      className="statistics-grid"
      aria-label={
        external ? 'Current external snapshot statistics' : 'Current simulation statistics'
      }
    >
      {items.map(({ label, value, detail, icon: Icon }) => (
        <article className="stat-card" key={label}>
          <Icon aria-hidden="true" size={18} />
          <div>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
