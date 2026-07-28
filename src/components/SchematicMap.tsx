import { Plane } from 'lucide-react';

import { defaultRegion } from '../config/regions';
import type { Aircraft } from '../domain/types';

type SchematicMapProps = {
  aircraft: readonly Aircraft[];
  selectedAircraftId: string;
  onSelect: (aircraftId: string) => void;
};

function positionAircraft(aircraft: Aircraft) {
  const { bounds } = defaultRegion;
  return {
    left: `${String(((aircraft.longitude - bounds.west) / (bounds.east - bounds.west)) * 100)}%`,
    top: `${String(((bounds.north - aircraft.latitude) / (bounds.north - bounds.south)) * 100)}%`,
  };
}

export function SchematicMap({ aircraft, selectedAircraftId, onSelect }: SchematicMapProps) {
  return (
    <div
      className="schematic-map"
      aria-label={`${defaultRegion.displayName} local schematic with ${String(aircraft.length)} synthetic aircraft`}
    >
      <svg
        className="schematic-background"
        aria-hidden="true"
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <radialGradient id="radar-glow">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="620" fill="url(#radar-glow)" />
        <rect width="1000" height="620" fill="url(#grid)" />
        <circle cx="500" cy="310" r="225" fill="none" stroke="currentColor" />
        <circle cx="500" cy="310" r="110" fill="none" stroke="currentColor" />
        <line x1="330" y1="310" x2="670" y2="310" className="runway-line" />
      </svg>
      <span className="schematic-runway-label">
        {defaultRegion.runway.id} · {defaultRegion.runway.reciprocalId}
      </span>
      {aircraft.map((item) => {
        const isSelected = item.id === selectedAircraftId;
        return (
          <button
            className={`aircraft-marker severity-${item.severity.toLowerCase()}${isSelected ? ' is-selected' : ''}`}
            key={item.id}
            type="button"
            style={positionAircraft(item)}
            aria-label={`${item.callsign}, ${item.altitudeFt.toLocaleString()} feet, heading ${String(item.headingDeg)} degrees${isSelected ? ', selected' : ''}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(item.id)}
          >
            <Plane
              aria-hidden="true"
              size={22}
              style={{ transform: `rotate(${String(item.headingDeg - 45)}deg)` }}
            />
            <span>{item.callsign}</span>
          </button>
        );
      })}
      <div className="map-compass" aria-hidden="true">
        N
      </div>
    </div>
  );
}
