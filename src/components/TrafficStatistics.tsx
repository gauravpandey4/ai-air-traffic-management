import { Activity, Gauge, Navigation, Plane, Siren, Waypoints } from 'lucide-react';

import { useSimulator } from '../app/simulator-context';
import type { StatisticMetric } from '../domain/types';

const formatNumber = new Intl.NumberFormat('en-IN');

function formatMetric(metric: StatisticMetric, unit = '') {
  return metric.value === null ? 'Unavailable' : `${formatNumber.format(metric.value)}${unit}`;
}

function denominatorDetail(metric: StatisticMetric, label: string) {
  if (metric.totalCount === 0) return 'Valid empty active dataset';
  if (metric.observationCount === 0)
    return `Unavailable · 0 of ${String(metric.totalCount)} ${label}`;
  return `Based on ${String(metric.observationCount)} of ${String(metric.totalCount)} ${label}`;
}

export function TrafficStatistics() {
  const { state, statistics, decisionSupport } = useSimulator();
  const external = state.aircraftMode === 'External Active';
  const items = [
    {
      label: 'Aircraft',
      value: formatNumber.format(statistics.totalAircraft),
      detail: [
        statistics.totalAircraft === 0
          ? 'Valid empty active dataset'
          : `${formatMetric(statistics.airborneAircraft)} airborne · ${String(statistics.airborneAircraft.observationCount)} of ${String(statistics.totalAircraft)} altitude observations`,
      ],
      icon: Plane,
    },
    {
      label: 'Arrivals',
      value: formatMetric(statistics.arrivals),
      detail: [
        external
          ? denominatorDetail(statistics.arrivals, 'tracks with supported intent')
          : denominatorDetail(statistics.arrivals, 'tracks with simulated intent'),
      ],
      icon: Navigation,
    },
    {
      label: 'Average altitude',
      value: formatMetric(statistics.averageAltitudeFt, ' ft'),
      detail: [denominatorDetail(statistics.averageAltitudeFt, 'valid altitude observations')],
      icon: Activity,
    },
    {
      label: 'Average speed',
      value: formatMetric(statistics.averageGroundSpeedKt, ' kt'),
      detail: [denominatorDetail(statistics.averageGroundSpeedKt, 'valid speed observations')],
      icon: Gauge,
    },
    {
      label: 'Fuel review',
      value: formatMetric(statistics.lowFuelAircraft),
      detail: [
        external
          ? denominatorDetail(statistics.lowFuelAircraft, 'tracks with supported fuel')
          : `${denominatorDetail(statistics.lowFuelAircraft, 'fuel estimates')} · Below 30 min`,
      ],
      icon: Waypoints,
    },
    {
      label: 'Active alerts',
      value: formatNumber.format(decisionSupport.alerts.length),
      detail: ['Derived educational rules'],
      icon: Activity,
    },
    {
      label: 'Emergencies',
      value: formatMetric(statistics.emergencies),
      detail: external
        ? [denominatorDetail(statistics.emergencies, 'tracks with supported status')]
        : [
            'Declared simulated events',
            denominatorDetail(statistics.emergencies, 'simulated declarations'),
          ],
      icon: Siren,
    },
  ] as const;

  return (
    <section
      className="statistics-section"
      aria-label={
        external ? 'Current external snapshot statistics' : 'Current simulation statistics'
      }
    >
      <header className="statistics-heading">
        <div>
          <p className="eyebrow">Active dataset only</p>
          <h2>Traffic statistics</h2>
        </div>
        <p id="statistics-summary">
          {statistics.totalAircraft === 0
            ? 'The active dataset is valid and empty. Averages and unsupported fields are not presented as zero.'
            : `Values use the complete active ${external ? 'external' : 'simulated'} dataset. Every derived metric states its valid denominator; unsupported fields remain unavailable.`}
        </p>
      </header>
      <div className="statistics-grid" aria-describedby="statistics-summary">
        {items.map(({ label, value, detail, icon: Icon }) => (
          <article className="stat-card" key={label}>
            <Icon aria-hidden="true" size={18} />
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
              {detail.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
