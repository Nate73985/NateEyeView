'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import type { CountryMetric, MetricKey } from '@/lib/types';
import { formatMetric } from '@/lib/format';
import { severityColors } from '@/lib/constants';

function FocusCountry({ country }: { country?: CountryMetric }) {
  const map = useMap();
  useEffect(() => {
    if (country) {
      map.flyTo([country.latitude, country.longitude], 4, { duration: 0.8 });
    }
  }, [country, map]);
  return null;
}

export default function WorldMap({
  countries,
  metric,
  selectedIso,
  onSelect
}: {
  countries: CountryMetric[];
  metric: MetricKey;
  selectedIso?: string;
  onSelect: (country: CountryMetric) => void;
}) {
  const selected = countries.find((country) => country.iso === selectedIso);

  return (
    <div className="h-[440px] overflow-hidden rounded-lg border border-line bg-slate-950 md:h-[560px] 3xl:h-[720px]">
      <MapContainer center={[18, 8]} zoom={2} minZoom={2} maxZoom={7} scrollWheelZoom className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FocusCountry country={selected} />
        {countries.map((country) => {
          const metricValue = country[metric].value ?? 0;
          const radius = Math.max(10, Math.min(34, Math.sqrt(metricValue) * 1.8));
          const isSelected = selectedIso === country.iso;
          return (
            <CircleMarker
              key={country.iso}
              center={[country.latitude, country.longitude]}
              radius={isSelected ? radius + 6 : radius}
              pathOptions={{
                color: severityColors[country.severity],
                fillColor: severityColors[country.severity],
                fillOpacity: isSelected ? 0.74 : 0.48,
                weight: isSelected ? 3 : 1
              }}
              eventHandlers={{ click: () => onSelect(country) }}
            >
              <Popup>
                <div className="min-w-48">
                  <p className="text-sm font-bold">{country.country}</p>
                  <p className="text-xs text-slate-400">{country.region}</p>
                  <p className="mt-2 text-sm">{formatMetric(country[metric])}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{country.severity} severity</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
