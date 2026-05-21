'use client';

import dynamic from 'next/dynamic';
import type { CountryMetric, MetricKey } from '@/lib/types';

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => <div className="h-[440px] animate-pulse rounded-lg border border-line bg-slate-900/70 md:h-[560px]" />
});

export default function MapPanel(props: {
  countries: CountryMetric[];
  metric: MetricKey;
  selectedIso?: string;
  onSelect: (country: CountryMetric) => void;
}) {
  return <WorldMap {...props} />;
}
