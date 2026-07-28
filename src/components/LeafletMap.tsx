import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { defaultRegion } from '../config/regions';
import type { Aircraft } from '../domain/types';

type LeafletMapProps = {
  aircraft: readonly Aircraft[];
  selectedAircraftId: string | null;
  onSelect: (aircraftId: string) => void;
  onUnavailable: (reason: string) => void;
};

export function LeafletMap({
  aircraft,
  selectedAircraftId,
  onSelect,
  onUnavailable,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const aircraftLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (containerRef.current === null || mapRef.current !== null) {
      return undefined;
    }

    if (!navigator.onLine) {
      onUnavailable('the browser is offline');
      return undefined;
    }

    const map = L.map(containerRef.current, {
      attributionControl: true,
      keyboard: true,
      zoomControl: true,
    }).setView(
      [defaultRegion.center.latitude, defaultRegion.center.longitude],
      defaultRegion.defaultZoom,
    );
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    let tileFailures = 0;
    tiles.on('tileerror', () => {
      tileFailures += 1;
      if (tileFailures === 2) {
        onUnavailable('OpenStreetMap tiles could not be loaded');
      }
    });
    tiles.addTo(map);
    const aircraftLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    aircraftLayerRef.current = aircraftLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      aircraftLayerRef.current = null;
    };
  }, [onUnavailable]);

  useEffect(() => {
    const layer = aircraftLayerRef.current;
    if (layer === null) {
      return;
    }

    layer.clearLayers();
    for (const item of aircraft) {
      const selectedClass = item.id === selectedAircraftId ? ' is-selected' : '';
      const marker = L.marker([item.latitude, item.longitude], {
        icon: L.divIcon({
          className: 'leaflet-aircraft-anchor',
          html: `<span class="leaflet-aircraft severity-${item.severity.toLowerCase()}${selectedClass}" style="--heading:${String(item.headingDeg)}deg" aria-hidden="true">✈</span>`,
          iconAnchor: [14, 14],
          iconSize: [28, 28],
        }),
        keyboard: true,
        title: `${item.callsign}, ${item.altitudeFt.toLocaleString()} feet`,
      });
      marker.on('click', () => onSelect(item.id));
      marker.addTo(layer);
    }
  }, [aircraft, onSelect, selectedAircraftId]);

  return (
    <div
      className="leaflet-map"
      ref={containerRef}
      aria-label="Connected OpenStreetMap traffic map"
    />
  );
}
