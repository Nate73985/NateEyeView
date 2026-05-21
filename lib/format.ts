import type { MetricValue } from './types';

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Unavailable';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function formatRate(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Unavailable';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}%`;
}

export function formatMetric(metric: MetricValue): string {
  if (metric.value === null) return 'Unavailable';
  if (metric.unit === 'percent') return formatRate(metric.value);
  if (metric.unit === 'per100k') return `${metric.value.toLocaleString('en-US', { maximumFractionDigits: 2 })} / 100k`;
  return formatNumber(metric.value);
}

export function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function per100k(value: number | null, population = 1000000): number | null {
  if (value === null || population <= 0) return null;
  return (value / population) * 100000;
}
