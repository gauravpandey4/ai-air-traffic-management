import { Activity, Gauge, Navigation, Plane, Siren, Waypoints } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';

const formatNumber = new Intl.NumberFormat('en-IN');

export function TrafficStatistics() {
  const { statistics } = useSimulator();
  const items = [
    {
      label: 'Aircraft',
      value: formatNumber.format(statistics.totalAircraft),
      detail: `${String(statistics.airborneAircraft)} airborne`,
      icon: Plane,
    },
    {
      label: 'Arrivals',
      value: formatNumber.format(statistics.arrivals),
      detail: 'Current simulated dataset',
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
      value: formatNumber.format(statistics.lowFuelAircraft),
      detail: 'Scenario placeholders below 30 min',
      icon: Waypoints,
    },
    {
      label: 'Emergencies',
      value: formatNumber.format(statistics.emergencies),
      detail: 'Declared simulated events',
      icon: Siren,
    },
  ] as const;

  return (
    <section className="statistics-grid" aria-label="Current simulation statistics">
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
