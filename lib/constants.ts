import type { MetricKey, Region } from './types';

export const regions: Region[] = [
  'Global',
  'Africa',
  'Europe',
  'Asia',
  'North America',
  'South America',
  'Oceania'
];

export const metricLabels: Record<MetricKey, string> = {
  mortalityRate: 'Mortality rate',
  infectionRate: 'Infection rate',
  recoveryRate: 'Recovery rate',
  totalDeaths: 'Total deaths',
  totalCases: 'Total cases',
  activeOutbreaks: 'Active outbreaks'
};

export const severityColors = {
  low: '#31d98b',
  moderate: '#f8d84e',
  high: '#f8b84e',
  critical: '#ff4d67'
};

export const qualityLabels = {
  reported: 'Reported',
  estimated: 'Estimated',
  unavailable: 'Unavailable',
  stale: 'Stale',
  mocked: 'Mocked'
};
